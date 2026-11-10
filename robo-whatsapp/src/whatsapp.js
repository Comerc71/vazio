import crypto from "node:crypto";

// Integração com a WhatsApp Cloud API oficial da Meta.
// Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api

export class WhatsApp {
  constructor({ token, phoneNumberId, versao = "v23.0" }) {
    this.token = token;
    this.phoneNumberId = phoneNumberId;
    this.versao = versao;
  }

  async enviarTexto(para, texto) {
    const resposta = await fetch(`https://graph.facebook.com/${this.versao}/${this.phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: para,
        type: "text",
        text: { preview_url: false, body: texto.slice(0, 4096) },
      }),
    });
    if (!resposta.ok) {
      throw new Error(`WhatsApp respondeu ${resposta.status}: ${await resposta.text()}`);
    }
  }
}

/** Confere o cabeçalho X-Hub-Signature-256 para garantir que a requisição veio da Meta. */
export function assinaturaValida(corpoBruto, cabecalho, appSecret) {
  if (!cabecalho?.startsWith("sha256=")) return false;
  const esperado = crypto.createHmac("sha256", appSecret).update(corpoBruto).digest("hex");
  const recebido = cabecalho.slice("sha256=".length);
  return (
    recebido.length === esperado.length &&
    crypto.timingSafeEqual(Buffer.from(recebido, "hex"), Buffer.from(esperado, "hex"))
  );
}

/**
 * Extrai as mensagens recebidas do corpo do webhook.
 * Devolve [{ id, de, nome, tipo, texto }], com texto null quando não é texto (áudio, foto etc.).
 */
export function extrairMensagens(corpo) {
  const mensagens = [];
  for (const entrada of corpo?.entry ?? []) {
    for (const mudanca of entrada.changes ?? []) {
      const valor = mudanca.value ?? {};
      const contatos = Object.fromEntries((valor.contacts ?? []).map((c) => [c.wa_id, c.profile?.name]));
      for (const m of valor.messages ?? []) {
        let texto = null;
        if (m.type === "text") texto = m.text?.body ?? null;
        else if (m.type === "button") texto = m.button?.text ?? null;
        else if (m.type === "interactive") {
          texto = m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? null;
        }
        mensagens.push({ id: m.id, de: m.from, nome: contatos[m.from] ?? null, tipo: m.type, texto });
      }
    }
  }
  return mensagens;
}
