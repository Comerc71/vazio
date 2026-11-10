// Conversa com o robô pelo terminal, sem WhatsApp. Ótimo para testar e para demonstrar ao cliente.
// Uso: npm run chat
import readline from "node:readline/promises";
import { montarAtendente } from "./montar.js";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Defina ANTHROPIC_API_KEY no arquivo .env (veja .env.example).");
  process.exit(1);
}

const TELEFONE_TESTE = "5591900000000";
const { negocio, atendente } = montarAtendente({
  avisarEquipe: async ({ motivo, resumo }) => console.log(`\n🔔 [aviso para a equipe] ${motivo} | ${resumo}\n`),
});

const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log(`Conversando com o atendente de ${negocio.nome}. Digite "sair" para encerrar.\n`);

terminal.on("close", () => process.exit(0));
for (;;) {
  const texto = (await terminal.question("Você: ")).trim();
  if (!texto) continue;
  if (texto.toLowerCase() === "sair") break;
  const resposta = await atendente.responder(TELEFONE_TESTE, texto);
  console.log(`\n${negocio.nome_atendente}: ${resposta ?? "(robô pausado: a equipe assumiu esta conversa)"}\n`);
}
terminal.close();
