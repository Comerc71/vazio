import crypto from "node:crypto";
import path from "node:path";
import { ArquivoJson } from "./armazenamento.js";

/** Pedidos de delivery/retirada, guardados em data/pedidos.json. */
export class Pedidos {
  constructor(pastaDados, relogio = () => new Date()) {
    this.relogio = relogio;
    this.arquivo = new ArquivoJson(path.join(pastaDados, "pedidos.json"), { pedidos: [] });
  }

  registrar(telefone, dados) {
    const pedido = {
      codigo: crypto.randomBytes(3).toString("hex").toUpperCase(),
      telefone,
      ...dados,
      status: "recebido",
      criado_em: this.relogio().toISOString(),
    };
    this.arquivo.dados.pedidos.push(pedido);
    this.arquivo.salvar();
    return pedido;
  }
}

/** Texto do pedido para a equipe (WhatsApp do dono ou terminal). */
export function formatarPedido(pedido) {
  const itens = pedido.itens
    .map((i) => `• ${i.quantidade}x ${i.produto}${i.observacao ? ` (${i.observacao})` : ""}`)
    .join("\n");
  const linhas = [
    `🛵 *Novo pedido ${pedido.codigo}*`,
    `Cliente: ${pedido.nome_cliente} (+${pedido.telefone})`,
    itens,
    pedido.modo === "entrega" ? `Entrega: ${pedido.endereco}` : "Retirada no local",
    `Pagamento: ${pedido.forma_pagamento}${pedido.troco_para ? ` (troco para ${pedido.troco_para})` : ""}`,
    `Total estimado: ${pedido.total_estimado}`,
  ];
  if (pedido.observacoes) linhas.push(`Obs.: ${pedido.observacoes}`);
  linhas.push("", "Confirme o valor e o tempo de entrega com o cliente.");
  return linhas.join("\n");
}
