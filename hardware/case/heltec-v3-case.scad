// Yassena Campo — case do nó de campo (Heltec WiFi LoRa 32 V3)
// Pensado para IP68: vedação por anel de borracha (O-ring) comprimido
// por parafusos, prensa-cabo padrão pro fio do sensor, respiro de
// pressão opcional, e nenhum furo permanente (o USB-C só é acessado
// abrindo a case — reprogramar exige desmontar e vedar de novo).
//
// IMPORTANTE — isto é um PONTO DE PARTIDA PARAMÉTRICO, não um desenho
// certificado:
//  - As medidas da placa (BOARD_*) abaixo são estimadas a partir do
//    datasheet público do Heltec V3. MEÇA A SUA PLACA REAL antes de
//    imprimir e ajuste as variáveis se houver diferença.
//  - A fixação da placa é por TRILHO (a placa desliza em ranhuras nas
//    laterais), não por parafuso nos furos de montagem — assim o
//    encaixe não depende de eu acertar a posição exata dos furos, só
//    do tamanho da placa.
//  - IP68 de verdade depende de: material (PETG > PLA), qualidade de
//    impressão (sem falhas de camada nas superfícies de vedação),
//    anel de vedação real (cordão de borracha/silicone) e um
//    prensa-cabo IP68 comprado (não impresso).
//
// Como usar: abra este arquivo no OpenSCAD (gratuito, openscad.org).
// F5 = pré-visualizar, F6 = renderizar, depois exporte cada parte
// como STL separado comentando/descomentando as chamadas no final.

/* ---------------------------------------------------------
   Parâmetros — ajuste aqui
--------------------------------------------------------- */

// Tamanho externo da case — fixado por você (deixa espaço de sobra em
// volta da placa, por exemplo pra uma bateria maior)
CASE_L = 200;   // comprimento externo
CASE_W = 100;   // largura externa

// Placa (Heltec WiFi LoRa 32 V3) — CONFIRME essas medidas na sua placa
BOARD_L = 51.3;   // comprimento
BOARD_W = 25.4;   // largura
BOARD_T = 1.6;    // espessura da placa (FR4)
CLEAR_TOP = 8;     // espaço acima da placa (display OLED + antena + botões)
CLEAR_BOTTOM = 4;  // espaço abaixo da placa (conector de bateria, headers)

// Casca
WALL = 3.5;              // espessura de parede — mais grossa ajuda a vedação e a rigidez
CORNER_R = 3;             // raio dos cantos (menos concentração de tensão / mais fácil vedar)
RAIL_DEPTH = 1.6;         // profundidade do trilho onde a placa desliza
RAIL_CLEARANCE = 0.3;     // folga do trilho em relação à espessura da placa

// Vedação (O-ring) — cordão de borracha/silicone comprado, NÃO impresso
ORING_CORD_D = 3;         // diâmetro do cordão (ex: cordão de silicone 3mm)
ORING_GROOVE_COMPRESSION = 0.8; // fração da altura do cordão que fica dentro do sulco (compressão)

// Parafusos de fechamento (aço inox, resistem melhor à corrosão ao tempo)
SCREW_D = 3;              // M3
SCREW_BOSS_D = 8;         // diâmetro externo do ressalto do parafuso
SCREW_INSET = 6;          // distância do parafuso até a quina

// Prensa-cabo pro fio do sensor (ex: PG7 IP68, furo padrão ~12.5mm)
INCLUDE_CABLE_GLAND = true;
CABLE_GLAND_HOLE_D = 12.5;

// Respiro de pressão (evita embaçamento/estufamento com variação de temperatura)
// Use um respiro IP68 comprado (ex: membrana tipo Gore) — não é impresso
INCLUDE_PRESSURE_VENT = true;
VENT_HOLE_D = 6;

// Janela de RF (parede mais fina bem acima da área da antena, sem furo —
// mantém a vedação e deixa o sinal LoRa/Wi-Fi passar melhor que a parede cheia)
RF_WINDOW_WALL = 1.2;

$fn = 64; // suavidade dos círculos na pré-visualização/render

/* ---------------------------------------------------------
   Dimensões derivadas
--------------------------------------------------------- */
outer_l = CASE_L;
outer_w = CASE_W;

inner_l = outer_l - WALL * 2;
inner_w = outer_w - WALL * 2;
inner_h = CLEAR_TOP + BOARD_T + CLEAR_BOTTOM;

groove_d = ORING_CORD_D * (1 - ORING_GROOVE_COMPRESSION) + ORING_CORD_D; // largura do sulco com folga
lid_h = 6 + ORING_CORD_D;           // altura da tampa (rebaixo + folga do cordão)
base_h = WALL + inner_h;            // altura da base

/* ---------------------------------------------------------
   Módulos utilitários
--------------------------------------------------------- */
module rounded_rect(l, w, h, r) {
  hull() {
    for (x = [r, l - r])
      for (y = [r, w - r])
        translate([x, y, 0]) cylinder(h = h, r = r);
  }
}

// Distância máxima entre parafusos vizinhos pra manter o anel de
// vedação comprimido por igual em cases grandes
MAX_SCREW_SPACING = 80;

module screw_positions() {
  positions = [
    [SCREW_INSET, SCREW_INSET],
    [outer_l - SCREW_INSET, SCREW_INSET],
    [SCREW_INSET, outer_w - SCREW_INSET],
    [outer_l - SCREW_INSET, outer_w - SCREW_INSET],
  ];
  for (p = positions) translate(p) children();

  // parafusos extras no meio das bordas compridas, só entram se a case
  // for grande o bastante pra precisar
  span = outer_l - SCREW_INSET * 2;
  extra_count = floor(span / MAX_SCREW_SPACING);
  if (extra_count > 1) {
    for (i = [1 : extra_count - 1]) {
      x = SCREW_INSET + span * i / extra_count;
      translate([x, SCREW_INSET]) children();
      translate([x, outer_w - SCREW_INSET]) children();
    }
  }
}

/* ---------------------------------------------------------
   Base — onde a placa fica, com trilhos, prensa-cabo e respiro
--------------------------------------------------------- */
module base() {
  difference() {
    union() {
      // casca externa
      rounded_rect(outer_l, outer_w, base_h, CORNER_R);

      // ressaltos dos parafusos
      screw_positions() cylinder(h = base_h + 4, d = SCREW_BOSS_D);
    }

    // cavidade interna
    translate([WALL, WALL, WALL])
      rounded_rect(inner_l, inner_w, base_h, CORNER_R * 0.6);

    // furo passante dos parafusos (rosqueia auto-atarrachante ou use insert térmico)
    screw_positions() translate([0, 0, -1]) cylinder(h = base_h + 10, d = SCREW_D);

    // sulco do O-ring, correndo no topo da parede da base
    translate([0, 0, base_h - groove_d])
      difference() {
        rounded_rect(outer_l, outer_w, groove_d, CORNER_R);
        translate([WALL - groove_d, WALL - groove_d, -1])
          rounded_rect(inner_l + groove_d * 2, inner_w + groove_d * 2, groove_d + 2, CORNER_R);
      }

    // entrada do cabo do sensor (lateral, na altura do meio do compartimento)
    if (INCLUDE_CABLE_GLAND) {
      translate([outer_l, outer_w / 2, base_h * 0.45])
        rotate([0, 90, 0])
        cylinder(h = WALL * 3, d = CABLE_GLAND_HOLE_D, center = true);
    }

    // respiro de pressão (base, canto oposto ao cabo)
    if (INCLUDE_PRESSURE_VENT) {
      translate([outer_l * 0.15, 0, base_h * 0.6])
        rotate([-90, 0, 0])
        cylinder(h = WALL * 3, d = VENT_HOLE_D, center = true);
    }

    // janela de RF: rebaixo na parede oposta ao cabo, deixando-a mais fina
    translate([-1, outer_w * 0.65, base_h * 0.55])
      cube([WALL - RF_WINDOW_WALL + 1, outer_w * 0.3, CLEAR_TOP]);
  }

  // abas de apoio: duas cristas correndo ao longo das paredes internas
  // compridas, na altura certa pra placa descansar em cima (a tampa é
  // removível, então a placa é colocada por cima — não precisa deslizar)
  ledge_z = WALL + CLEAR_BOTTOM - RAIL_DEPTH;
  translate([WALL, WALL, ledge_z])
    cube([inner_l, RAIL_DEPTH, RAIL_DEPTH + RAIL_CLEARANCE]);
  translate([WALL, WALL + inner_w - RAIL_DEPTH, ledge_z])
    cube([inner_l, RAIL_DEPTH, RAIL_DEPTH + RAIL_CLEARANCE]);
}

/* ---------------------------------------------------------
   Tampa — encaixa por cima, comprime o O-ring, mesmos furos de parafuso
--------------------------------------------------------- */
module lid() {
  // tampa lisa por baixo: pressiona o cordão de vedação direto contra o
  // sulco da base (vedação de face, mais tolerante à impressão que um
  // encaixe macho/fêmea)
  difference() {
    union() {
      rounded_rect(outer_l, outer_w, lid_h, CORNER_R);
      screw_positions() cylinder(h = lid_h + 4, d = SCREW_BOSS_D);
    }

    // furos dos parafusos (passantes, cabeça escareada por cima)
    screw_positions() {
      translate([0, 0, -1]) cylinder(h = lid_h + 10, d = SCREW_D + 0.3);
      translate([0, 0, lid_h - 3]) cylinder(h = 5, d1 = SCREW_D + 0.3, d2 = SCREW_BOSS_D - 1);
    }
  }
}

/* ---------------------------------------------------------
   Saída — comente/descomente pra exportar cada peça
--------------------------------------------------------- */
base();
translate([outer_l + 15, 0, 0]) lid();
