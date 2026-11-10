import crypto from "node:crypto";
import path from "node:path";
import { ArquivoJson } from "./armazenamento.js";
import {
  DIAS_SEMANA,
  agoraLocal,
  dataPorExtenso,
  dataValida,
  diaDaSemana,
  diferencaEmDias,
  horaParaMinutos,
  horaValida,
  minutosParaHora,
} from "./tempo.js";

/** Agenda de serviços do negócio, guardada em data/agendamentos.json. */
export class Agenda {
  constructor(negocio, pastaDados, relogio = () => new Date()) {
    this.negocio = negocio;
    this.relogio = relogio;
    this.arquivo = new ArquivoJson(path.join(pastaDados, "agendamentos.json"), { agendamentos: [] });
  }

  get agendamentos() {
    return this.arquivo.dados.agendamentos;
  }

  servico(servicoId) {
    return this.negocio.servicos.find((s) => s.id === servicoId);
  }

  /** Retorna o horário de funcionamento [abre, fecha] em minutos, ou null se fechado. */
  expediente(data) {
    const faixa = this.negocio.horario_funcionamento[DIAS_SEMANA[diaDaSemana(data)]];
    return faixa ? [horaParaMinutos(faixa[0]), horaParaMinutos(faixa[1])] : null;
  }

  /** Verifica regras gerais da data; devolve uma mensagem de erro ou null. */
  problemaNaData(data) {
    if (!dataValida(data)) return "Data inválida. Use o formato AAAA-MM-DD.";
    const hoje = agoraLocal(this.negocio.fuso_horario, this.relogio()).data;
    const dias = diferencaEmDias(hoje, data);
    if (dias < 0) return "Essa data já passou.";
    if (dias > this.negocio.dias_para_frente) {
      return `Só é possível agendar até ${this.negocio.dias_para_frente} dias à frente.`;
    }
    if (!this.expediente(data)) return `Não abrimos nesse dia (${dataPorExtenso(data)}).`;
    return null;
  }

  ativosNoDia(data) {
    return this.agendamentos.filter((a) => a.data === data && a.status === "confirmado");
  }

  /** Verdadeiro se cabe um serviço de `duracao` minutos começando em `inicio` (minutos do dia). */
  cabe(data, inicio, duracao) {
    const [abre, fecha] = this.expediente(data) ?? [0, 0];
    const fim = inicio + Math.max(duracao, 1);
    if (inicio < abre || fim > fecha) return false;

    const agora = agoraLocal(this.negocio.fuso_horario, this.relogio());
    if (data === agora.data && inicio < horaParaMinutos(agora.hora) + this.negocio.antecedencia_minima_minutos) {
      return false;
    }

    // Em cada minuto do intervalo, a quantidade de atendimentos simultâneos tem que ficar abaixo da capacidade.
    const ocupados = this.ativosNoDia(data).map((a) => [horaParaMinutos(a.hora), horaParaMinutos(a.hora) + a.duracao_minutos]);
    for (let minuto = inicio; minuto < fim; minuto++) {
      const simultaneos = ocupados.filter(([ini, f]) => ini <= minuto && minuto < f).length;
      if (simultaneos >= this.negocio.atendimentos_simultaneos) return false;
    }
    return true;
  }

  horariosLivres(data, servicoId) {
    const servico = this.servico(servicoId);
    if (!servico) return { erro: `Serviço "${servicoId}" não existe.` };
    if (!servico.agendavel) return { erro: `"${servico.nome}" não precisa de horário na agenda.` };
    const problema = this.problemaNaData(data);
    if (problema) return { erro: problema };

    const [abre, fecha] = this.expediente(data);
    const livres = [];
    for (let inicio = abre; inicio + servico.duracao_minutos <= fecha; inicio += this.negocio.intervalo_agenda_minutos) {
      if (this.cabe(data, inicio, servico.duracao_minutos)) livres.push(minutosParaHora(inicio));
    }
    return { data, dia: dataPorExtenso(data), servico: servico.nome, horarios_livres: livres };
  }

  agendar({ telefone, servicoId, data, hora, nomeCliente, nomeAtendido, observacoes }) {
    const servico = this.servico(servicoId);
    if (!servico) return { erro: `Serviço "${servicoId}" não existe.` };
    if (!servico.agendavel) return { erro: `"${servico.nome}" não precisa de horário na agenda.` };
    const problema = this.problemaNaData(data);
    if (problema) return { erro: problema };
    if (!horaValida(hora)) return { erro: "Hora inválida. Use o formato HH:MM." };
    if (!this.cabe(data, horaParaMinutos(hora), servico.duracao_minutos)) {
      return { erro: "Esse horário não está disponível. Consulte os horários livres e ofereça outro." };
    }

    const agendamento = {
      id: crypto.randomBytes(3).toString("hex").toUpperCase(),
      telefone,
      servico_id: servico.id,
      servico: servico.nome,
      preco: servico.preco,
      duracao_minutos: servico.duracao_minutos,
      data,
      hora,
      nome_cliente: nomeCliente,
      nome_atendido: nomeAtendido,
      observacoes: observacoes || "",
      status: "confirmado",
      criado_em: this.relogio().toISOString(),
    };
    this.agendamentos.push(agendamento);
    this.arquivo.salvar();
    return { sucesso: true, agendamento: { ...agendamento, dia: dataPorExtenso(data) } };
  }

  doCliente(telefone) {
    const agora = agoraLocal(this.negocio.fuso_horario, this.relogio());
    const momentoAgora = `${agora.data} ${agora.hora}`;
    return this.agendamentos
      .filter((a) => a.telefone === telefone && a.status === "confirmado" && `${a.data} ${a.hora}` >= momentoAgora)
      .map((a) => ({ id: a.id, servico: a.servico, dia: dataPorExtenso(a.data), data: a.data, hora: a.hora, nome_atendido: a.nome_atendido }));
  }

  cancelar(telefone, id) {
    const agendamento = this.agendamentos.find(
      (a) => a.id === String(id).toUpperCase() && a.telefone === telefone && a.status === "confirmado",
    );
    if (!agendamento) return { erro: "Não encontrei esse agendamento entre os agendamentos deste cliente." };
    agendamento.status = "cancelado";
    agendamento.cancelado_em = this.relogio().toISOString();
    this.arquivo.salvar();
    return { sucesso: true, cancelado: { id: agendamento.id, servico: agendamento.servico, dia: dataPorExtenso(agendamento.data), hora: agendamento.hora } };
  }
}
