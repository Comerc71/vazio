# Kit de venda: atendente de IA para clínicas odontológicas

> Envie uma a uma, personalizada. Os links prontos estão em [links_odontologia.md](links_odontologia.md) e a lista completa em [odontologia_paragominas.csv](odontologia_paragominas.csv).

## Por que dentista compra
- **Paciente que não recebe resposta marca em outra clínica.** Muitos escrevem à noite e no fim de semana, quando a recepção está fechada.
- **A recepção vive no WhatsApp**: "quanto é a limpeza?", "aceita convênio?", "tem horário amanhã?". O robô responde isso sozinho.
- **Urgência não pode esperar**: paciente com dor recebe o primeiro horário livre e a recepção é avisada na hora.
- **Agenda cheia vale dinheiro**: cada avaliação agendada à noite é um orçamento em potencial.

## 1. Primeira mensagem (clínica)

Olá, equipe da [NOME DA CLÍNICA]! Tudo bem? 😊

Sou aqui de Paragominas e crio *atendentes com inteligência artificial para o WhatsApp de clínicas odontológicas*.

Ele responde os pacientes *24 horas*, tira dúvidas de valores e convênios, *agenda avaliações e consultas* direto na agenda e, quando é dor ou urgência, oferece o primeiro horário e chama a recepção na hora.

Paciente que manda mensagem à noite e fica sem resposta costuma marcar em outra clínica. Com o robô, ninguém fica esperando.

Posso mostrar funcionando com os procedimentos de vocês? O teste é *grátis por 7 dias*, sem compromisso.

## 2. Versão curta

Oi! Crio atendentes de IA para o WhatsApp de dentistas aqui em Paragominas: respondem pacientes 24h, agendam avaliações e avisam a recepção nas urgências. Posso te mostrar um teste com os procedimentos da sua clínica? É grátis por 7 dias. 🦷

## 3. Para dentista que atende sozinho (consultório)

Olá, Dr(a). [NOME]! Tudo bem?

Sei que no consultório o WhatsApp acaba ficando para depois do atendimento. Criei um *assistente de IA* que responde seus pacientes na hora, inclusive à noite: informa valores, convênios e horários e *marca a avaliação na sua agenda*. Quando é algo que só você pode responder, ele te avisa e para de responder aquele paciente.

Posso te mandar um vídeo curto dele funcionando?

## 4. Para agências de marketing que atendem dentistas (revenda)

Olá! Vi que vocês trabalham com marketing para clínicas odontológicas.

Desenvolvi um *atendente de IA para WhatsApp* feito para dentistas: responde 24h, agenda avaliações e faz triagem de urgência. Para agência, ele resolve um problema comum: o anúncio traz o lead, mas a clínica demora a responder e o lead esfria.

Tenho um *modelo de parceria*: vocês oferecem aos seus clientes com a sua marca e eu cuido da parte técnica. Topa uma conversa de 15 minutos?

## 5. Follow-up (2 a 3 dias depois)

Oi! Passando para saber se conseguiu ver minha mensagem sobre o atendente de WhatsApp para a clínica. 😊 Posso montar um teste com os procedimentos e convênios de vocês, sem compromisso. Se não for o momento, é só avisar que não mando mais mensagens.

## 6. Proposta (após a demonstração)

**Atendente de IA no WhatsApp: [NOME DA CLÍNICA]**
- Instalação e configuração (procedimentos, valores, convênios, agenda e regras de urgência): **R$ 697** (pagamento único)
- Mensalidade (IA, manutenção, ajustes e suporte): **R$ 297/mês**
- Parceria com agência: **R$ 197/mês por clínica** para a agência revender com a marca dela
- 7 dias grátis para testar
- Sem fidelidade

*Valores sugeridos. Clínica tem ticket médio maior que pet shop, por isso o preço acima.*

## O que dizer na demonstração
Rode `npm run chat:odonto` na pasta `robo-whatsapp` e peça para o dentista "ser o paciente":
1. "Quanto custa uma limpeza? Aceita Uniodonto?"
2. "Quero fazer clareamento, quanto fica?" (o robô explica que precisa de avaliação e oferece agendar)
3. "Estou com muita dor de dente" (oferece o horário de urgência e avisa a recepção)
4. "Quero marcar uma avaliação sábado de manhã"

Antes da visita, troque em `config/odontologia.json` o nome, os preços e os convênios pelos da clínica. O impacto é muito maior.

## Cuidados (área da saúde)
- O robô **não dá diagnóstico, não indica remédio e não fecha valor** de tratamento que depende de avaliação. Isso já está configurado.
- **Dados de saúde são sensíveis (LGPD).** O robô pede só o necessário para agendar. Combine com a clínica quem acessa as conversas salvas.
- Propaganda odontológica tem regras do CFO. As respostas do robô devem ser informativas, sem promessa de resultado e sem "preço promocional" chamativo. Deixe a clínica revisar os textos de `config/odontologia.json`.
