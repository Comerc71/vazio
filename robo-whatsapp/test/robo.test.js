import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { Agenda } from "../src/agenda.js";
import { Atendente } from "../src/atendente.js";
import { assinaturaValida, extrairMensagens } from "../src/whatsapp.js";

const negocio = JSON.parse(fs.readFileSync(new URL("../config/negocio.json", import.meta.url), "utf8"));
// Terça, 10/11/2026, 09:00 em Paragominas (UTC-3)
const relogio = () => new Date("2026-11-10T12:00:00Z");
const pastaTemp = () => fs.mkdtempSync(path.join(os.tmpdir(), "robo-"));

test("horários livres respeitam expediente e antecedência mínima", () => {
  const agenda = new Agenda(negocio, pastaTemp(), relogio);
  const hoje = agenda.horariosLivres("2026-11-10", "banho_p");
  assert.equal(hoje.horarios_livres[0], "10:00"); // 09:00 + 60 min de antecedência
  assert.equal(hoje.horarios_livres.at(-1), "17:00"); // termina às 18:00
  const sabado = agenda.horariosLivres("2026-11-14", "banho_tosa_m");
  assert.equal(sabado.horarios_livres.at(-1), "11:00"); // 2h, fecha 13:00
  assert.match(agenda.horariosLivres("2026-11-15", "banho_p").erro, /Não abrimos/);
  assert.match(agenda.horariosLivres("2026-11-09", "banho_p").erro, /já passou/);
  assert.match(agenda.horariosLivres("2026-11-10", "taxi_dog").erro, /não precisa/);
});

test("capacidade: no máximo 2 pets ao mesmo tempo", () => {
  const agenda = new Agenda(negocio, pastaTemp(), relogio);
  const base = { servicoId: "banho_p", data: "2026-11-11", hora: "10:00", nomeCliente: "Ana", nomeAtendido: "Rex", observacoes: "" };
  assert.ok(agenda.agendar({ ...base, telefone: "1" }).sucesso);
  assert.ok(agenda.agendar({ ...base, telefone: "2" }).sucesso);
  assert.match(agenda.agendar({ ...base, telefone: "3" }).erro, /não está disponível/);
  const livres = agenda.horariosLivres("2026-11-11", "banho_p").horarios_livres;
  assert.ok(!livres.includes("10:00") && !livres.includes("09:30") && livres.includes("11:00"));
});

test("cliente só vê e cancela os próprios agendamentos", () => {
  const agenda = new Agenda(negocio, pastaTemp(), relogio);
  const { agendamento } = agenda.agendar({
    telefone: "1", servicoId: "tosa_higienica", data: "2026-11-12", hora: "14:00", nomeCliente: "Ana", nomeAtendido: "Mel", observacoes: "",
  });
  assert.equal(agenda.doCliente("1").length, 1);
  assert.equal(agenda.doCliente("2").length, 0);
  assert.ok(agenda.cancelar("2", agendamento.id).erro);
  assert.ok(agenda.cancelar("1", agendamento.id.toLowerCase()).sucesso);
  assert.equal(agenda.doCliente("1").length, 0);
});

test("webhook: extrai texto e confere assinatura", () => {
  const corpo = {
    entry: [{ changes: [{ value: {
      contacts: [{ wa_id: "5591988887777", profile: { name: "Maria" } }],
      messages: [
        { id: "m1", from: "5591988887777", type: "text", text: { body: "Oi" } },
        { id: "m2", from: "5591988887777", type: "audio", audio: {} },
      ],
    } }] }],
  };
  assert.deepEqual(extrairMensagens(corpo), [
    { id: "m1", de: "5591988887777", nome: "Maria", tipo: "text", texto: "Oi" },
    { id: "m2", de: "5591988887777", nome: "Maria", tipo: "audio", texto: null },
  ]);
  const bruto = Buffer.from(JSON.stringify(corpo));
  const assinatura = `sha256=${crypto.createHmac("sha256", "segredo").update(bruto).digest("hex")}`;
  assert.ok(assinaturaValida(bruto, assinatura, "segredo"));
  assert.ok(!assinaturaValida(bruto, assinatura, "outro"));
  assert.ok(!assinaturaValida(bruto, undefined, "segredo"));
});

/** Cliente falso do Claude: devolve as respostas da lista, em ordem, e guarda as requisições. */
function clienteFalso(respostas) {
  const requisicoes = [];
  return {
    requisicoes,
    beta: { messages: { create: async (params) => {
      requisicoes.push(structuredClone(params));
      return respostas.shift();
    } } },
  };
}

test("atendente agenda usando ferramentas e guarda o histórico completo", async () => {
  const pasta = pastaTemp();
  const agenda = new Agenda(negocio, pasta, relogio);
  const cliente = clienteFalso([
    {
      stop_reason: "tool_use",
      content: [
        { type: "thinking", thinking: "", signature: "sig" },
        { type: "tool_use", id: "t1", name: "agendar", input: {
          servico_id: "banho_m", data: "2026-11-11", hora: "15:00", nome_cliente: "João", nome_atendido: "Thor", observacoes: "",
        } },
      ],
    },
    { stop_reason: "end_turn", content: [{ type: "text", text: "Prontinho! Thor está agendado." }] },
  ]);
  const atendente = new Atendente({ negocio, agenda, pastaDados: pasta, cliente, relogio, avisarEquipe: async () => {} });

  const resposta = await atendente.responder("5591911112222", "Pode confirmar o banho do Thor amanhã às 15h");
  assert.equal(resposta, "Prontinho! Thor está agendado.");
  assert.equal(agenda.doCliente("5591911112222").length, 1);

  const [primeira, segunda] = cliente.requisicoes;
  assert.equal(primeira.model, "claude-opus-5-5");
  assert.equal(primeira.fallbacks, "default");
  assert.match(primeira.messages[0].content, /^\[Agora: terça-feira, 10\/11\/2026, 09:00\]/);
  assert.equal(segunda.messages[1].content[0].type, "thinking"); // bloco de raciocínio devolvido sem edição
  const resultado = segunda.messages[2].content[0];
  assert.equal(resultado.tool_use_id, "t1");
  assert.ok(JSON.parse(resultado.content).sucesso);

  const salvas = JSON.parse(fs.readFileSync(path.join(pasta, "conversas.json"), "utf8"));
  assert.equal(salvas["5591911112222"].mensagens.length, 4);
});

test("chamar_atendente avisa a equipe e pausa o robô para o cliente", async () => {
  const pasta = pastaTemp();
  const avisos = [];
  const cliente = clienteFalso([
    { stop_reason: "tool_use", content: [{ type: "tool_use", id: "t1", name: "chamar_atendente", input: { motivo: "Reclamação", resumo: "Tosa ficou torta" } }] },
    { stop_reason: "end_turn", content: [{ type: "text", text: "Já chamei a equipe!" }] },
  ]);
  const atendente = new Atendente({
    negocio, agenda: new Agenda(negocio, pasta, relogio), pastaDados: pasta, cliente, relogio,
    avisarEquipe: async (aviso) => avisos.push(aviso),
  });

  assert.equal(await atendente.responder("559133", "Quero reclamar"), "Já chamei a equipe!");
  assert.deepEqual(avisos, [{ telefone: "559133", motivo: "Reclamação", resumo: "Tosa ficou torta" }]);
  assert.equal(await atendente.responder("559133", "Alô?"), null); // pausado: não chama o Claude
  assert.equal(cliente.requisicoes.length, 2);
  atendente.retomar("559133");
  assert.ok(!atendente.estaPausado("559133"));
});

test("recusa do modelo vira resposta educada e chama a equipe", async () => {
  const pasta = pastaTemp();
  const avisos = [];
  const cliente = clienteFalso([{ stop_reason: "refusal", stop_details: { category: null }, content: [] }]);
  const atendente = new Atendente({
    negocio, agenda: new Agenda(negocio, pasta, relogio), pastaDados: pasta, cliente, relogio,
    avisarEquipe: async (aviso) => avisos.push(aviso),
  });
  assert.match(await atendente.responder("559144", "..."), /alguém da equipe/);
  assert.equal(avisos.length, 1);
});

test("configuração odontológica: avaliação de 30 min, 1 paciente por vez, procedimentos sem agenda", async () => {
  const { montarPromptSistema } = await import("../src/prompt.js");
  const odonto = JSON.parse(fs.readFileSync(new URL("../config/odontologia.json", import.meta.url), "utf8"));
  const agenda = new Agenda(odonto, pastaTemp(), relogio);
  const base = { servicoId: "avaliacao", data: "2026-11-11", hora: "09:00", nomeCliente: "Ana", nomeAtendido: "Ana", observacoes: "" };
  assert.ok(agenda.agendar({ ...base, telefone: "1" }).sucesso);
  assert.match(agenda.agendar({ ...base, telefone: "2" }).erro, /não está disponível/);
  assert.match(agenda.horariosLivres("2026-11-11", "canal").erro, /não precisa/);
  // hoje às 09:00 com 2h de antecedência: primeiro horário 11:00
  assert.equal(agenda.horariosLivres("2026-11-10", "avaliacao").horarios_livres[0], "11:00");

  const prompt = montarPromptSistema(odonto);
  assert.match(prompt, /Convênios aceitos:\n- Odontoprev/);
  assert.match(prompt, /Não indique antibiótico/);
  assert.doesNotMatch(prompt, /pet/i);
  assert.match(montarPromptSistema(negocio), /Produtos:\n- Rações/);
});

test("restaurante: ferramenta de pedido só aparece quando o negócio aceita pedidos, e o pedido chega à equipe", async () => {
  const { formatarPedido } = await import("../src/pedidos.js");
  const restaurante = JSON.parse(fs.readFileSync(new URL("../config/restaurante.json", import.meta.url), "utf8"));
  const pasta = pastaTemp();
  const recebidos = [];
  const pedido = {
    nome_cliente: "Carla",
    itens: [{ produto: "Pizza grande calabresa", quantidade: 1, observacao: "sem cebola" }, { produto: "Refrigerante 2 litros", quantidade: 1, observacao: "" }],
    modo: "entrega",
    endereco: "Rua A, 10 - Uraim, perto da praça",
    forma_pagamento: "dinheiro",
    troco_para: "R$ 100,00",
    total_estimado: "R$ 81,00",
    observacoes: "",
  };
  const cliente = clienteFalso([
    { stop_reason: "tool_use", content: [{ type: "tool_use", id: "t1", name: "enviar_pedido", input: pedido }] },
    { stop_reason: "end_turn", content: [{ type: "text", text: "Pedido enviado!" }] },
  ]);
  const atendente = new Atendente({
    negocio: restaurante, agenda: new Agenda(restaurante, pasta, relogio), pastaDados: pasta, cliente, relogio,
    avisarEquipe: async () => {}, enviarPedido: async (p) => recebidos.push(p),
  });

  assert.equal(await atendente.responder("5591955556666", "pode mandar"), "Pedido enviado!");
  assert.ok(cliente.requisicoes[0].tools.some((t) => t.name === "enviar_pedido"));
  assert.match(cliente.requisicoes[0].system, /Taxa de entrega: R\$ 5,00/);
  assert.equal(recebidos.length, 1);
  assert.equal(recebidos[0].telefone, "5591955556666");
  assert.match(formatarPedido(recebidos[0]), /1x Pizza grande calabresa \(sem cebola\)[\s\S]*troco para R\$ 100,00/);
  const salvos = JSON.parse(fs.readFileSync(path.join(pasta, "pedidos.json"), "utf8"));
  assert.equal(salvos.pedidos[0].codigo, recebidos[0].codigo);

  // Pet shop não recebe pedidos: a ferramenta não é oferecida
  const pastaPet = pastaTemp();
  const clientePet = clienteFalso([{ stop_reason: "end_turn", content: [{ type: "text", text: "Oi!" }] }]);
  const pet = new Atendente({ negocio, agenda: new Agenda(negocio, pastaPet, relogio), pastaDados: pastaPet, cliente: clientePet, relogio, avisarEquipe: async () => {} });
  await pet.responder("1", "oi");
  assert.ok(!clientePet.requisicoes[0].tools.some((t) => t.name === "enviar_pedido"));
});

test("enviar_pedido recusa entrega sem endereço", async () => {
  const { executarFerramenta } = await import("../src/ferramentas.js");
  const resultado = await executarFerramenta(
    "enviar_pedido",
    { nome_cliente: "A", itens: [{ produto: "X", quantidade: 1, observacao: "" }], modo: "entrega", endereco: " ", forma_pagamento: "Pix", troco_para: "", total_estimado: "R$ 1", observacoes: "" },
    { telefone: "1", pedidos: { registrar: () => assert.fail("não deveria registrar") }, enviarPedido: async () => {} },
  );
  assert.match(resultado.erro, /endereço/);
});
