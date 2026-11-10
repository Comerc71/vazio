// Ferramentas que o atendente pode usar. `strict: true` garante que a entrada segue o schema.

export const FERRAMENTAS = [
  {
    name: "ver_horarios_livres",
    description:
      "Lista os horários livres para um serviço em um dia. Use antes de oferecer ou confirmar qualquer horário.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        servico_id: { type: "string", description: "id do serviço, exatamente como aparece na lista de serviços" },
        data: { type: "string", description: "Dia no formato AAAA-MM-DD" },
      },
      required: ["servico_id", "data"],
      additionalProperties: false,
    },
  },
  {
    name: "agendar",
    description:
      "Agenda um serviço para o cliente desta conversa. Só use depois que o cliente confirmou serviço, dia e hora.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        servico_id: { type: "string", description: "id do serviço" },
        data: { type: "string", description: "Dia no formato AAAA-MM-DD" },
        hora: { type: "string", description: "Hora de início no formato HH:MM, um dos horários livres" },
        nome_cliente: { type: "string", description: "Nome de quem está conversando (tutor, paciente ou responsável)" },
        nome_atendido: {
          type: "string",
          description: "Nome de quem será atendido: o pet, o paciente ou o próprio cliente",
        },
        observacoes: {
          type: "string",
          description: "Detalhes úteis para a equipe (ex.: porte do pet, primeira consulta, convênio). Texto vazio se não houver.",
        },
      },
      required: ["servico_id", "data", "hora", "nome_cliente", "nome_atendido", "observacoes"],
      additionalProperties: false,
    },
  },
  {
    name: "meus_agendamentos",
    description: "Lista os próximos agendamentos confirmados do cliente desta conversa.",
    strict: true,
    input_schema: { type: "object", properties: {}, required: [], additionalProperties: false },
  },
  {
    name: "cancelar_agendamento",
    description: "Cancela um agendamento do cliente desta conversa, pelo código. Confirme com o cliente antes.",
    strict: true,
    input_schema: {
      type: "object",
      properties: { codigo: { type: "string", description: "Código do agendamento (ex.: A1B2C3)" } },
      required: ["codigo"],
      additionalProperties: false,
    },
  },
  {
    name: "chamar_atendente",
    description:
      "Avisa a equipe do negócio para assumir esta conversa e pausa o atendente virtual para este cliente.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Por que a equipe precisa entrar" },
        resumo: { type: "string", description: "Resumo curto do que o cliente quer, para a equipe não precisar perguntar de novo" },
      },
      required: ["motivo", "resumo"],
      additionalProperties: false,
    },
  },
];

/**
 * Executa a ferramenta pedida pelo modelo e devolve o resultado em JSON (texto).
 * `contexto` = { telefone, agenda, chamarAtendente }
 */
export async function executarFerramenta(nome, entrada, contexto) {
  const { telefone, agenda } = contexto;
  switch (nome) {
    case "ver_horarios_livres":
      return agenda.horariosLivres(entrada.data, entrada.servico_id);
    case "agendar":
      return agenda.agendar({
        telefone,
        servicoId: entrada.servico_id,
        data: entrada.data,
        hora: entrada.hora,
        nomeCliente: entrada.nome_cliente,
        nomeAtendido: entrada.nome_atendido,
        observacoes: entrada.observacoes,
      });
    case "meus_agendamentos":
      return { agendamentos: agenda.doCliente(telefone) };
    case "cancelar_agendamento":
      return agenda.cancelar(telefone, entrada.codigo);
    case "chamar_atendente":
      await contexto.chamarAtendente(entrada.motivo, entrada.resumo);
      return { sucesso: true, mensagem: "Equipe avisada. O atendente virtual fica pausado para este cliente." };
    default:
      return { erro: `Ferramenta desconhecida: ${nome}` };
  }
}
