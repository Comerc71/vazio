# Case do nó de campo — Heltec WiFi LoRa 32 V3

Desenho paramétrico em [OpenSCAD](https://openscad.org/) (gratuito) pensado para uso externo, com a estrutura de um projeto IP68: vedação por anel de borracha, prensa-cabo apropriado pro fio do sensor, respiro de pressão e nenhum furo permanente de USB.

**Antes de imprimir:** meça a sua placa Heltec V3 real e confira as variáveis `BOARD_L`, `BOARD_W`, `BOARD_T` no topo de [`heltec-v3-case.scad`](heltec-v3-case.scad) — os valores no arquivo são estimados a partir do datasheet público.

## Sobre a classificação IP68

O desenho segue as práticas certas (vedação comprimida, prensa-cabo, sem penetrações desnecessárias), mas **IP68 é uma classificação testada**, não só uma geometria. Pra chegar perto de verdade:

- Imprima em **PETG** (mais resistente à intempérie e menos poroso que PLA).
- Use paredes com pelo menos 3-4 perímetros nas superfícies de vedação (configuração da fatiadora).
- Compre um **cordão de vedação de silicone** (diâmetro conforme `ORING_CORD_D`, hoje 3mm) e cole no sulco impresso.
- Compre um **prensa-cabo IP68** de verdade (ex: PG7) pro furo do sensor — não vede só com cola.
- Compre um **respiro de pressão IP68** (membrana tipo Gore-Tex) pro furo de ventilação — evita embaçamento sem deixar água entrar.
- Considere um leve verniz/resina epóxi nas superfícies externas se quiser reforçar contra porosidade da impressão FDM.

## Lista de compras (além da impressão)

- 4x parafuso M3 inox (comprimento conforme a espessura da tampa + rosca no ressalto)
- Cordão de vedação de silicone Ø3mm (~20cm dá pra um case)
- Prensa-cabo IP68 PG7
- Respiro de pressão IP68 (opcional, mas recomendado)
- Opcional: 4x insert termo-metálico M3 (pra rosca mais durável em caso de abrir/fechar várias vezes)

## Montagem

1. Placa desliza/apoia sobre as duas abas internas da base (não precisa parafusar na placa).
2. Fio do sensor passa pelo prensa-cabo antes de conectar na placa.
3. Cole o cordão de silicone no sulco da base.
4. Encaixe a tampa, aperte os 4 parafusos em cruz (um pouco de cada vez, não um até o fim) pra comprimir o anel por igual.

> Não consegui renderizar nem testar este arquivo aqui (não tenho o OpenSCAD instalado neste ambiente) — confira a pré-visualização (F5) antes de imprimir, e me avise se algo não bater.
