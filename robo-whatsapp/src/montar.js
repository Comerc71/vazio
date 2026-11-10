import fs from "node:fs";
import { Agenda } from "./agenda.js";
import { Atendente } from "./atendente.js";

/** Lê a configuração do negócio e cria a agenda e o atendente. */
export function montarAtendente({ avisarEquipe, enviarPedido }) {
  const arquivoNegocio = process.env.NEGOCIO_ARQUIVO ?? "config/negocio.json";
  const pastaDados = process.env.PASTA_DADOS ?? "data";
  const negocio = JSON.parse(fs.readFileSync(arquivoNegocio, "utf8"));
  const agenda = new Agenda(negocio, pastaDados);
  const atendente = new Atendente({ negocio, agenda, pastaDados, avisarEquipe, enviarPedido });
  return { negocio, agenda, atendente };
}
