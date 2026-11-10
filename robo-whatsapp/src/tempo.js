// Datas e horas no fuso do negócio, sem bibliotecas externas.
// Datas são "AAAA-MM-DD" e horas "HH:MM", sempre no horário local do negócio.

export const DIAS_SEMANA = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const NOMES_DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

/** Data e hora atuais no fuso informado. */
export function agoraLocal(fusoHorario, agora = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: fusoHorario,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(agora)
      .map((p) => [p.type, p.value]),
  );
  return { data: `${partes.year}-${partes.month}-${partes.day}`, hora: `${partes.hour}:${partes.minute}` };
}

export function horaParaMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function minutosParaHora(minutos) {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

export function dataValida(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [a, m, d] = data.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  return dt.getUTCFullYear() === a && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function horaValida(hora) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

function dataUtc(data) {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

/** Índice do dia da semana (0 = domingo). */
export function diaDaSemana(data) {
  return dataUtc(data).getUTCDay();
}

export function somarDias(data, dias) {
  const dt = dataUtc(data);
  dt.setUTCDate(dt.getUTCDate() + dias);
  return dt.toISOString().slice(0, 10);
}

export function diferencaEmDias(dataInicio, dataFim) {
  return Math.round((dataUtc(dataFim) - dataUtc(dataInicio)) / 86_400_000);
}

/** Ex.: "terça-feira, 10/11/2026" */
export function dataPorExtenso(data) {
  const [a, m, d] = data.split("-");
  return `${NOMES_DIAS[diaDaSemana(data)]}, ${d}/${m}/${a}`;
}
