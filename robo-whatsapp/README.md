# Robô de atendimento no WhatsApp (IA)

Atendente virtual para **pet shops** e outros negócios locais. Ele responde os clientes no WhatsApp 24 horas e:

- tira dúvidas de **preços, horários, endereço e regras** usando só as informações que você cadastrar;
- **agenda serviços** (banho, tosa etc.) numa agenda própria, sem marcar dois pets no mesmo horário além da capacidade da loja;
- mostra e **cancela agendamentos** do próprio cliente;
- **chama um humano** em reclamações, pedidos especiais, dúvidas sem resposta e emergências: manda um aviso no WhatsApp do dono e fica em silêncio com aquele cliente;
- avisa com educação quando recebe áudio ou foto (por enquanto lê só texto).

A inteligência é o **Claude** (Anthropic). O envio e o recebimento de mensagens usam a **WhatsApp Cloud API oficial da Meta**, sem risco de bloqueio do número por uso de ferramenta não oficial.

## 1. Testar no terminal (5 minutos, sem WhatsApp)

Precisa de Node.js 22.9 ou mais novo e de uma chave da API da Anthropic ([console.anthropic.com](https://console.anthropic.com) → API Keys).

```bash
cd robo-whatsapp
npm install
cp .env.example .env      # coloque sua ANTHROPIC_API_KEY
npm run chat
```

Converse como se fosse um cliente: "quanto é o banho de um poodle?", "tem horário amanhã de manhã?", "quero falar com alguém". Dá para usar isso também para **demonstrar ao dono da loja**.

## 2. Configurar para um cliente

Edite [`config/negocio.json`](config/negocio.json):

| Campo | O que é |
|---|---|
| `nome`, `tipo`, `cidade`, `endereco` | Dados da loja |
| `nome_atendente` | Nome do robô (ex.: "Luna") |
| `horario_funcionamento` | Abre e fecha por dia; `null` = fechado |
| `atendimentos_simultaneos` | Quantos pets a equipe atende ao mesmo tempo |
| `intervalo_agenda_minutos` | De quanto em quanto tempo oferecer horários (30 = 08:00, 08:30…) |
| `antecedencia_minima_minutos` | Não agenda para "daqui a 10 minutos" |
| `dias_para_frente` | Até quantos dias à frente pode agendar |
| `servicos` | `id`, `nome`, `preco` (texto livre), `duracao_minutos`, `agendavel` |
| `produtos`, `formas_pagamento`, `regras`, `informacoes_extras` | O robô usa isso para responder |

Serve para outros negócios também (salão, barbearia, clínica, oficina): é só trocar os serviços, as regras e o `tipo`. Para atender vários clientes, rode um robô por cliente, cada um com o seu `.env` e o seu `NEGOCIO_ARQUIVO`.

## 3. Ligar no WhatsApp (Cloud API da Meta)

1. Crie um app em [developers.facebook.com](https://developers.facebook.com) → **Criar app** → tipo **Empresa** → adicione o produto **WhatsApp**.
2. Em **WhatsApp → Configuração da API**, copie o **token** e o **ID do número de telefone** para `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`. O token temporário vence em 24 h: para produção, crie um **usuário do sistema** no Gerenciador de Negócios e gere um token permanente.
3. Adicione o número de WhatsApp da loja. Ele **não pode estar em uso no app WhatsApp comum** ao mesmo tempo; use um número novo ou migre o da loja.
4. Em **Configurações do app → Básico**, copie a **Chave secreta do aplicativo** para `WHATSAPP_APP_SECRET`.
5. Invente um texto para `WHATSAPP_VERIFY_TOKEN`.
6. Publique o robô num servidor com HTTPS (veja a seção 4) e, em **WhatsApp → Configuração → Webhook**, informe:
   - URL de callback: `https://SEU-SERVIDOR/webhook`
   - Token de verificação: o mesmo `WHATSAPP_VERIFY_TOKEN`
   - Assine o campo **messages**.
7. Em `NUMERO_DONO`, coloque o WhatsApp de quem recebe os avisos (só números, com 55 e DDD).

```bash
npm start
```

### Comandos do dono

Mande pelo WhatsApp do dono (`NUMERO_DONO`) para o número do robô:

- `#retomar 5591999999999`: o robô volta a atender esse cliente.
- `#pausar 5591999999999`: o robô para de responder esse cliente por 24 h (quando você quer atender pessoalmente).

Depois de chamar um humano, o robô fica 4 horas em silêncio com aquele cliente, ou até o `#retomar`.

> **Regra das 24 horas da Meta:** mensagens de texto livre só chegam a quem falou com o número nas últimas 24 h. Para garantir que os avisos cheguem ao dono, ele deve mandar qualquer mensagem para o número do robô uma vez por dia, ou você cria um modelo (template) de mensagem aprovado.

## 4. Onde hospedar

Qualquer servidor Node com HTTPS: Railway, Render, Fly.io, uma VPS (com Caddy ou Nginx) etc. Para testar no seu computador, use um túnel como `cloudflared tunnel --url http://localhost:3000` e cole a URL no webhook da Meta.

Os agendamentos e as conversas ficam em `data/` (arquivos JSON). Em hospedagens que apagam o disco a cada deploy, configure um volume persistente ou, com muitos clientes, troque por um banco de dados (ex.: Supabase).

## 5. Custos

- **WhatsApp Cloud API:** responder clientes que mandaram mensagem (conversas iniciadas pelo cliente) é gratuito na maioria dos casos. Confira a tabela atual da Meta.
- **Claude:** cobrado por uso. O robô usa o modelo `claude-opus-5-5` com esforço baixo (`effort: "low"`) e cache de prompt, para respostas rápidas e baratas. Dá para trocar o modelo em `CLAUDE_MODEL` no `.env`; um modelo menor (ex.: `claude-haiku-5-5`) custa bem menos por mensagem. Teste a qualidade antes de trocar.
- Se o modelo recusar uma mensagem por política de segurança, a API tenta de novo automaticamente num modelo substituto (`fallbacks: "default"`). Se ainda assim não der, o cliente recebe uma resposta educada e a equipe é chamada.

## Estrutura

| Arquivo | Função |
|---|---|
| [`src/servidor.js`](src/servidor.js) | Webhook do WhatsApp: valida a assinatura, evita respostas duplicadas, comandos do dono |
| [`src/atendente.js`](src/atendente.js) | Conversa com o Claude, laço de ferramentas, histórico por cliente, pausa/humano |
| [`src/prompt.js`](src/prompt.js) | Instruções do atendente, montadas a partir de `negocio.json` |
| [`src/ferramentas.js`](src/ferramentas.js) | Ferramentas: horários livres, agendar, meus agendamentos, cancelar, chamar atendente |
| [`src/agenda.js`](src/agenda.js) | Regras da agenda: expediente, capacidade, antecedência |
| [`src/whatsapp.js`](src/whatsapp.js) | Envio de mensagens e leitura do webhook da Cloud API |
| [`src/chat-terminal.js`](src/chat-terminal.js) | Conversa pelo terminal para testes e demonstração |
| [`test/`](test/) | Testes (`npm test`), sem chamar a API de verdade |

## Próximos passos possíveis

- Lembrete automático no dia anterior ao agendamento (precisa de template aprovado pela Meta).
- Lembrete de vacina e vermífugo pela data do último serviço.
- Painel web para o dono ver e editar a agenda.
- Entender áudio (transcrição) e fotos.
