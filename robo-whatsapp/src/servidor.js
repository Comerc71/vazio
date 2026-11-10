import http from "node:http";
import { montarAtendente } from "./montar.js";
import { formatarPedido } from "./pedidos.js";
import { WhatsApp, assinaturaValida, extrairMensagens } from "./whatsapp.js";

const obrigatorias = ["ANTHROPIC_API_KEY", "WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_VERIFY_TOKEN"];
const faltando = obrigatorias.filter((nome) => !process.env[nome]);
if (faltando.length) {
  console.error(`Faltam variáveis no .env: ${faltando.join(", ")} (veja .env.example)`);
  process.exit(1);
}

const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
const NUMERO_DONO = (process.env.NUMERO_DONO ?? "").replace(/\D/g, "");
if (!APP_SECRET) console.warn("Aviso: WHATSAPP_APP_SECRET vazio; a assinatura das mensagens da Meta não será conferida.");

const whatsapp = new WhatsApp({
  token: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  versao: process.env.GRAPH_API_VERSION,
});

const { negocio, atendente } = montarAtendente({
  avisarEquipe: async ({ telefone, motivo, resumo }) => {
    console.log(`[equipe] ${telefone} precisa de atendimento: ${motivo} | ${resumo}`);
    if (!NUMERO_DONO) return;
    await whatsapp.enviarTexto(
      NUMERO_DONO,
      `🔔 *Cliente precisa de atendimento*\nWhatsApp: +${telefone}\nMotivo: ${motivo}\nResumo: ${resumo}\n\nO robô ficou pausado para esse cliente. Responda pelo WhatsApp da loja.\nPara o robô voltar a atender: #retomar ${telefone}`,
    );
  },
  enviarPedido: async (pedido) => {
    console.log(`[pedido] ${pedido.codigo} de ${pedido.telefone}`);
    if (NUMERO_DONO) await whatsapp.enviarTexto(NUMERO_DONO, formatarPedido(pedido));
  },
});

// A Meta pode reenviar a mesma mensagem; guardamos os IDs recentes para não responder duas vezes.
const idsVistos = new Set();
function jaVisto(id) {
  if (idsVistos.has(id)) return true;
  idsVistos.add(id);
  if (idsVistos.size > 5000) idsVistos.delete(idsVistos.values().next().value);
  return false;
}

async function comandoDoDono(texto) {
  const [comando, numero] = texto.trim().split(/\s+/);
  const telefone = (numero ?? "").replace(/\D/g, "");
  if (comando === "#pausar" && telefone) {
    atendente.pausar(telefone, 24);
    return `Robô pausado por 24h para +${telefone}.`;
  }
  if (comando === "#retomar" && telefone) {
    atendente.retomar(telefone);
    return `Robô voltou a atender +${telefone}.`;
  }
  return "Comandos: #pausar 5591999999999 (robô para de responder esse cliente por 24h) | #retomar 5591999999999";
}

async function tratarMensagem({ id, de, tipo, texto }) {
  if (jaVisto(id)) return;

  if (NUMERO_DONO && de === NUMERO_DONO && texto?.startsWith("#")) {
    await whatsapp.enviarTexto(de, await comandoDoDono(texto));
    return;
  }

  if (texto === null) {
    if (atendente.estaPausado(de)) return;
    const aviso =
      tipo === "audio"
        ? "Por enquanto eu só consigo ler mensagens de texto. 🙏 Pode escrever sua dúvida?"
        : "Recebi! Por enquanto eu só consigo ler mensagens de texto. Pode me contar por escrito o que você precisa?";
    await whatsapp.enviarTexto(de, aviso);
    return;
  }

  const resposta = await atendente.responder(de, texto);
  if (resposta) await whatsapp.enviarTexto(de, resposta);
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    req.on("data", (p) => partes.push(p));
    req.on("end", () => resolve(Buffer.concat(partes)));
    req.on("error", reject);
  });
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  // Verificação do webhook (feita uma vez pela Meta ao configurar).
  if (req.method === "GET" && url.pathname === "/webhook") {
    const ok =
      url.searchParams.get("hub.mode") === "subscribe" &&
      url.searchParams.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN;
    res.writeHead(ok ? 200 : 403).end(ok ? url.searchParams.get("hub.challenge") : "Token inválido");
    return;
  }

  if (req.method === "POST" && url.pathname === "/webhook") {
    const corpoBruto = await lerCorpo(req);
    if (APP_SECRET && !assinaturaValida(corpoBruto, req.headers["x-hub-signature-256"], APP_SECRET)) {
      res.writeHead(401).end();
      return;
    }
    // Responde 200 na hora; a Meta reenvia se demorar. A resposta ao cliente segue em segundo plano.
    res.writeHead(200).end();

    let corpo;
    try {
      corpo = JSON.parse(corpoBruto.toString("utf8"));
    } catch {
      return;
    }
    for (const mensagem of extrairMensagens(corpo)) {
      tratarMensagem(mensagem).catch((erro) => console.error(`[servidor] falha com ${mensagem.de}:`, erro));
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end(`Robô de ${negocio.nome} no ar.`);
    return;
  }

  res.writeHead(404).end();
});

const porta = Number(process.env.PORT ?? 3000);
servidor.listen(porta, () => {
  console.log(`Robô de ${negocio.nome} ouvindo na porta ${porta} (webhook em /webhook)`);
});
