import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { ArquivoJson } from "./armazenamento.js";
import { executarFerramenta, FERRAMENTAS } from "./ferramentas.js";
import { montarPromptSistema } from "./prompt.js";
import { agoraLocal, dataPorExtenso } from "./tempo.js";

const MAX_VOLTAS_FERRAMENTAS = 8;
const CONVERSA_EXPIRA_HORAS = 12;
const PAUSA_APOS_CHAMAR_HUMANO_HORAS = 4;

const RESPOSTA_ERRO =
  "Desculpe, tive um probleminha para responder agora. 😕 Pode repetir sua mensagem em instantes? Se preferir, já chamo alguém da equipe.";
const RESPOSTA_RECUSA =
  "Desculpe, não consigo ajudar com isso por aqui. Vou pedir para alguém da equipe falar com você. 🙏";

/**
 * Atendente de IA: guarda a conversa de cada contato, chama o Claude com as ferramentas
 * da agenda e devolve o texto a ser enviado no WhatsApp.
 */
export class Atendente {
  /**
   * @param {object} opcoes
   * @param {object} opcoes.negocio dados de config/negocio.json
   * @param {import("./agenda.js").Agenda} opcoes.agenda
   * @param {string} opcoes.pastaDados
   * @param {(aviso: {telefone: string, motivo: string, resumo: string}) => Promise<void>} opcoes.avisarEquipe
   * @param {Anthropic} [opcoes.cliente]
   * @param {string} [opcoes.modelo]
   */
  constructor({ negocio, agenda, pastaDados, avisarEquipe, cliente, modelo, relogio = () => new Date() }) {
    this.negocio = negocio;
    this.agenda = agenda;
    this.avisarEquipe = avisarEquipe;
    this.cliente = cliente ?? new Anthropic();
    this.modelo = modelo ?? process.env.CLAUDE_MODEL ?? "claude-opus-5-5";
    this.relogio = relogio;
    this.promptSistema = montarPromptSistema(negocio);
    this.conversas = new ArquivoJson(path.join(pastaDados, "conversas.json"), {});
    this.filas = new Map(); // uma fila por contato: mensagens do mesmo cliente são respondidas em ordem
  }

  /** Responde uma mensagem de texto. Devolve o texto da resposta, ou null se o robô estiver pausado. */
  responder(telefone, texto) {
    const anterior = this.filas.get(telefone) ?? Promise.resolve();
    const atual = anterior.catch(() => {}).then(() => this.#responderAgora(telefone, texto));
    this.filas.set(telefone, atual);
    atual.finally(() => {
      if (this.filas.get(telefone) === atual) this.filas.delete(telefone);
    });
    return atual;
  }

  estaPausado(telefone) {
    const pausadoAte = this.conversas.dados[telefone]?.pausado_ate;
    return Boolean(pausadoAte && new Date(pausadoAte) > this.relogio());
  }

  pausar(telefone, horas = PAUSA_APOS_CHAMAR_HUMANO_HORAS) {
    const conversa = this.#conversa(telefone);
    conversa.pausado_ate = new Date(this.relogio().getTime() + horas * 3_600_000).toISOString();
    this.conversas.salvar();
  }

  retomar(telefone) {
    const conversa = this.conversas.dados[telefone];
    if (!conversa) return;
    conversa.pausado_ate = null;
    this.conversas.salvar();
  }

  #conversa(telefone) {
    const agora = this.relogio();
    let conversa = this.conversas.dados[telefone];
    const expirou =
      conversa && agora - new Date(conversa.ultima_em) > CONVERSA_EXPIRA_HORAS * 3_600_000;
    if (!conversa) {
      conversa = { mensagens: [], ultima_em: agora.toISOString(), pausado_ate: null };
      this.conversas.dados[telefone] = conversa;
    } else if (expirou) {
      // Conversa antiga: começa de novo em vez de editar o histórico.
      conversa.mensagens = [];
    }
    return conversa;
  }

  async #responderAgora(telefone, texto) {
    if (this.estaPausado(telefone)) return null;

    const conversa = this.#conversa(telefone);
    const agora = agoraLocal(this.negocio.fuso_horario, this.relogio());
    // A data e a hora vão na mensagem (e não no prompt do sistema) para o cache do prompt continuar valendo.
    const mensagens = [
      ...conversa.mensagens,
      { role: "user", content: `[Agora: ${dataPorExtenso(agora.data)}, ${agora.hora}]\n${texto}` },
    ];

    let resposta;
    try {
      resposta = await this.#rodarComFerramentas(telefone, mensagens);
    } catch (erro) {
      console.error(`[atendente] erro ao responder ${telefone}:`, erro);
      return RESPOSTA_ERRO;
    }

    if (resposta.stop_reason === "refusal") {
      console.warn(`[atendente] recusa para ${telefone}:`, resposta.stop_details);
      conversa.mensagens = []; // recomeça limpo na próxima mensagem
      await this.#chamarHumano(telefone, "Pedido que o robô não pôde atender", texto);
      return RESPOSTA_RECUSA;
    }

    conversa.mensagens = mensagens;
    conversa.ultima_em = this.relogio().toISOString();
    this.conversas.salvar();

    const textoFinal = resposta.content
      .filter((bloco) => bloco.type === "text")
      .map((bloco) => bloco.text)
      .join("\n")
      .trim();
    return textoFinal || RESPOSTA_ERRO;
  }

  /** Laço de ferramentas: chama o Claude até ele terminar a resposta. Acrescenta tudo em `mensagens`. */
  async #rodarComFerramentas(telefone, mensagens) {
    for (let volta = 0; volta < MAX_VOLTAS_FERRAMENTAS; volta++) {
      const resposta = await this.cliente.beta.messages.create({
        model: this.modelo,
        max_tokens: 16000,
        // Se o modelo recusar por política, a API tenta de novo num modelo substituto padrão.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        // Conversa de atendimento: esforço baixo deixa as respostas rápidas e baratas.
        output_config: { effort: "low" },
        cache_control: { type: "ephemeral" },
        system: this.promptSistema,
        tools: FERRAMENTAS,
        messages: mensagens,
      });

      if (resposta.stop_reason === "refusal") return resposta;

      // Guarda o conteúdo completo (inclusive blocos de raciocínio), sem editar nada.
      mensagens.push({ role: "assistant", content: resposta.content });

      if (resposta.stop_reason === "pause_turn") continue;
      if (resposta.stop_reason !== "tool_use") return resposta;

      const resultados = [];
      for (const bloco of resposta.content) {
        if (bloco.type !== "tool_use") continue;
        let resultado;
        let deuErro = false;
        try {
          resultado = await executarFerramenta(bloco.name, bloco.input, {
            telefone,
            agenda: this.agenda,
            chamarAtendente: (motivo, resumo) => this.#chamarHumano(telefone, motivo, resumo),
          });
          deuErro = Boolean(resultado?.erro);
        } catch (erro) {
          console.error(`[atendente] erro na ferramenta ${bloco.name}:`, erro);
          resultado = { erro: "Falha interna ao executar a ferramenta." };
          deuErro = true;
        }
        resultados.push({
          type: "tool_result",
          tool_use_id: bloco.id,
          content: JSON.stringify(resultado),
          ...(deuErro ? { is_error: true } : {}),
        });
      }
      // Todos os resultados vão juntos numa única mensagem do usuário.
      mensagens.push({ role: "user", content: resultados });
    }
    throw new Error("O atendente usou ferramentas demais sem terminar a resposta.");
  }

  async #chamarHumano(telefone, motivo, resumo) {
    this.pausar(telefone);
    try {
      await this.avisarEquipe({ telefone, motivo, resumo });
    } catch (erro) {
      console.error("[atendente] não consegui avisar a equipe:", erro);
    }
  }
}
