# Kit de venda: atendente de IA para restaurantes

> Links prontos em [links_restaurantes.md](links_restaurantes.md). Lista completa (50 estabelecimentos de Paragominas, Dom Eliseu e Ulianópolis) em [restaurantes_paragominas_regiao.csv](restaurantes_paragominas_regiao.csv).

## Por que restaurante compra
- **Pico de pedidos = WhatsApp sem resposta.** Sexta à noite, quem atende o telefone está no balcão. Cliente esperando pede em outro lugar.
- **App de delivery cobra comissão** (em geral de 12% a 30% por pedido). Pedido pelo WhatsApp próprio não paga comissão. O robô torna esse canal tão prático quanto o app.
- **Pedido bagunçado gera erro.** O robô entrega para a cozinha um pedido organizado: itens, observações ("sem cebola"), endereço com referência, pagamento e troco.
- **Perguntas repetidas** ("tem prato do dia?", "entrega no Uraim?", "até que horas abre?") são respondidas sozinhas.

## 1. Primeira mensagem

Olá, equipe [NOME DO RESTAURANTE]! Tudo bem? 😊

Sou aqui da região e crio *atendentes com inteligência artificial para o WhatsApp de restaurantes*.

Ele responde os clientes na hora, mostra o cardápio, anota pedidos de delivery e faz reserva de mesa, calcula a taxa de entrega e manda o *pedido pronto e organizado* para a cozinha, com endereço, forma de pagamento e troco.

Nos horários de pico ninguém fica esperando resposta, e o pedido chega pelo seu próprio WhatsApp, *sem comissão de aplicativo*.

Posso mostrar funcionando com o cardápio de vocês? O teste é *grátis por 7 dias*, sem compromisso.

## 2. Versão curta

Oi! Crio atendentes de IA para o WhatsApp de restaurantes: respondem na hora, anotam o pedido completo (itens, endereço, troco) e mandam pronto para a cozinha, sem comissão de app. Posso fazer um teste com o seu cardápio? Grátis por 7 dias. 🍕

## 3. Para quem já está no iFood/aiqfome

Oi! Vi que vocês estão nos apps de delivery. Já pensou em trazer os clientes que já te conhecem para o seu próprio WhatsApp, sem pagar comissão? Eu monto um atendente com IA que anota os pedidos sozinho, mesmo nos horários de pico. Quer ver como funciona?

## 4. Follow-up (2 a 3 dias depois)

Oi! Passando para saber se viu minha mensagem sobre o atendente de pedidos no WhatsApp. 😊 Se me mandar o cardápio, eu monto um teste com ele, sem compromisso. Se não for o momento, é só avisar.

## 5. Proposta (após a demonstração)

**Atendente de pedidos no WhatsApp: [NOME DO RESTAURANTE]**
- Instalação (cardápio, taxas por bairro, horários, reservas): **R$ 497** (pagamento único)
- Mensalidade (IA, atualização de cardápio e preços, suporte): **R$ 247/mês**
- 7 dias grátis para testar
- Sem fidelidade

**Argumento de preço:** com comissão de 20%, um restaurante que vende R$ 6.000 por mês no app paga R$ 1.200 só de comissão. Se só uma parte desses pedidos for para o WhatsApp próprio, a mensalidade já se paga.

*Valores sugeridos; ajuste ao tamanho do restaurante.*

## Demonstração
Na pasta `robo-whatsapp`, rode `npm run chat:restaurante` e peça para o dono "ser o cliente":
1. "Tem prato do dia hoje? Quanto é?"
2. "Quero uma pizza grande meio calabresa meio frango, com borda, e uma coca 2 litros para entrega no Uraim"
3. "Vou pagar em dinheiro, troco para 100"
4. "Quero reservar uma mesa para 6 pessoas sábado às 20h"

O pedido aparece formatado como chegaria no WhatsApp do dono. Antes da visita, troque o cardápio em `config/restaurante.json` pelo do restaurante (peça uma foto do cardápio).

## Cuidados
- **Alergias:** o robô anota e diz que a equipe confirma. Nunca garante que um prato "não tem" um ingrediente. Isso já está configurado.
- **Preço sempre atualizado:** combine com o dono como ele avisa mudanças de preço e cardápio. Esse é o seu serviço de manutenção mensal.
- O total que o robô calcula é **estimado**. A equipe confirma o valor final e o tempo de entrega.
