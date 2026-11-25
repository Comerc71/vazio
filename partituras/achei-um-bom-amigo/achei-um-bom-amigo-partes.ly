\version "2.24.0"
\header {
  title = "Jesus, o Bom Amigo"
  subtitle = "(Achei um bom amigo) — Harpa Cristã nº 198"
  subsubtitle = "Quarteto de Saxofones Alto em Mi♭"
  composer = "Melodia: W. S. Hays (1871) — “The Lily of the Valley”"
  arranger = "Harmonização e arranjo: Claude"
  tagline = "Partitura em altura escrita (Fá maior) • Som real: Lá♭ maior • Cifras em tom escrito"
}
\paper { #(set-paper-size "a4") top-margin = 12 bottom-margin = 12 left-margin = 14 right-margin = 12
  system-system-spacing.basic-distance = #16 }
global = { \key f \major \time 4/4 \tempo "Andante cantabile" 4 = 76
  \set Score.markFormatter = #format-mark-box-alphabet }

\bookpart {
  \header { subsubtitle = "Sax Alto 1 (Mi♭)" }
  \score { <<
    \new Staff = "s0" { \global
  \mark \markup \box \bold "Introdução" f''2\mp g''4 aes''4 |
  c'''1 |
  f''2 e''2 |
  g''2. a''8 bes''8 | \break
  \mark \markup \box \bold "A — Estrofe" c'''8\mf_\markup \italic \small "Achei um bom amigo…" c'''8 d'''8 c'''8 c'''8 a''4 f''8 |
  g''8 f''8 f''8 d''8 c''4 f''8 g''8 |
  a''8 a''8 a''8 a''8 d'''8 c'''8 c'''8 a''8 |
  g''2. a''8 bes''8 | \break
  c'''8_\markup \italic \small "Dos vales é o lírio…" c'''8 d'''8 c'''8 c'''8 a''4 f''8 |
  g''8 f''8 f''8 d''8 c''4 f''8 g''8 |
  a''8 c'''8 a''8 f''8 g''8 bes''8 a''8 g''8 |
  f''2. f''4 | \break
  \mark \markup \box \bold "B" bes''8\mf\<_\markup \italic \small "Consolador amado…" bes''8 bes''8 bes''8 bes''8 d'''4 d'''8 |
  d'''8 c'''8 c'''8 a''8 c'''4 a''8 g''8 |
  f''8\f f''8 f''8 f''8 d'''8 c'''8 c'''8 a''8 |
  g''2. a''8 bes''8 | \break
  \mark \markup \box \bold "A'" c'''8\mf_\markup \italic \small "Dos vales é o lírio, a estrela da manhã…" c'''8 d'''8 c'''8 c'''8 a''4 f''8 |
  g''8 f''8 f''8 d''8 c''4 f''8 g''8 |
  a''8 c'''8 a''8 f''8 g''8 bes''8 a''8 g''8 |
  f''2. f''4\< | \break
  \mark \markup \box \bold "C — Coro" bes''8\f_\markup \italic \small "Consolador amado…" bes''8 bes''8 bes''8 bes''8 d'''4 d'''8 |
  d'''8 c'''8 c'''8 a''8 c'''4 a''8 g''8 |
  f''8 f''8 f''8 f''8 d'''8 c'''8 c'''8 a''8 |
  g''2. a''8 bes''8 | \break
  \mark \markup \box \bold "A'" c'''8\mf_\markup \italic \small "Dos vales é o lírio…" c'''8 d'''8 c'''8 c'''8 a''4 f''8 |
  g''8 f''8 f''8 d''8 c''4 f''8 g''8 |
  a''8\>^\markup \italic "rit." c'''8 a''8 f''8 g''8 bes''8 a''8 g''8 |
  \mark \markup \box \bold "Coda" f''1\mp^\markup \italic "a tempo" | \break
  a''8^\markup \italic "poco rit." c'''8 a''8 f''8 g''8 bes''8 a''8 g''8 |
  f''2\p g''2~ |
  g''1\pp\fermata \bar "|."
    }
  >> \layout { } }
}
\bookpart {
  \header { subsubtitle = "Sax Alto 2 (Mi♭)" }
  \score { <<
    \new Staff = "s0" { \global
  \mark \markup \box \bold "Introdução" c''1\mp |
  des''1 |
  c''2 des''2 |
  des''1 | \break
  \mark \markup \box \bold "A — Estrofe" e''1\mf_\markup \italic \small "Achei um bom amigo…" |
  c''2 bes'2 |
  e''2 f''2 |
  d''2 des''2 | \break
  e''2_\markup \italic \small "Dos vales é o lírio…" cis''2 |
  bes'2 a'2 |
  d''2 des''2 |
  e''2. ees''4 | \break
  \mark \markup \box \bold "B" d''1\mf\<_\markup \italic \small "Consolador amado…" |
  f''1 |
  e''2\f d''4 des''4 |
  d''2 des''2 | \break
  \mark \markup \box \bold "A'" e''2\mf_\markup \italic \small "Dos vales é o lírio, a estrela da manhã…" ees''2 |
  c''2 bes'2 |
  c''2 des''2 |
  e''2. c''4\< | \break
  \mark \markup \box \bold "C — Coro" f''2\f_\markup \italic \small "Consolador amado…"~ f''8 e''4. |
  e''2 des''2 |
  cis''4 c''4 f''2 |
  f''2 e''2 | \break
  \mark \markup \box \bold "A'" e''2\mf_\markup \italic \small "Dos vales é o lírio…" ees''2 |
  c''2 aes'2 |
  d''2\>^\markup \italic "rit." des''2 |
  \mark \markup \box \bold "Coda" c''1\mp^\markup \italic "a tempo" | \break
  des''1^\markup \italic "poco rit." |
  c''2\p e''2~ |
  e''1\pp\fermata \bar "|."
    }
  >> \layout { } }
}
\bookpart {
  \header { subsubtitle = "Sax Alto 3 (Mi♭)" }
  \score { <<
    \new Staff = "s0" { \global
  \mark \markup \box \bold "Introdução" aes'1\mp |
  aes'2 g'2 |
  bes'2 bes'2 |
  e'1 | \break
  \mark \markup \box \bold "A — Estrofe" a'2\mf_\markup \italic \small "Achei um bom amigo…" g'2 |
  f'1 |
  a'2 bes'2 |
  bes'2 e'2 | \break
  a'2_\markup \italic \small "Dos vales é o lírio…" g'2 |
  g'2 f'2 |
  bes'2 e'2 |
  a'1 | \break
  \mark \markup \box \bold "B" f'2\mf\<_\markup \italic \small "Consolador amado…"~ f'8 aes'4. |
  a'2 g'2 |
  c''2\f a'2 |
  bes'2 e'2 | \break
  \mark \markup \box \bold "A'" a'1\mf_\markup \italic \small "Dos vales é o lírio, a estrela da manhã…" |
  bes'2 f'2 |
  f'2 e'2 |
  a'2. fis'4\< | \break
  \mark \markup \box \bold "C — Coro" bes'1\f_\markup \italic \small "Consolador amado…" |
  f'2 g'2 |
  f'2 c''2 |
  bes'2 des''2 | \break
  \mark \markup \box \bold "A'" a'2\mf_\markup \italic \small "Dos vales é o lírio…" bes'2 |
  a'2 f'2 |
  bes'2\>^\markup \italic "rit." e'2 |
  \mark \markup \box \bold "Coda" aes'1\mp^\markup \italic "a tempo" | \break
  f'2^\markup \italic "poco rit." g'2 |
  a'1\p~ |
  a'1\pp\fermata \bar "|."
    }
  >> \layout { } }
}
\bookpart {
  \header { subsubtitle = "Sax Alto 4 (Mi♭)" }
  \score { <<
    \new Staff = "s0" { \global
  \mark \markup \box \bold "Introdução" des'1\mp |
  bes2 ees'2 |
  g'2 c'2 |
  c'1 | \break
  \mark \markup \box \bold "A — Estrofe" f'2\mf_\markup \italic \small "Achei um bom amigo…" cis'2 |
  d'2 bes4 c'4 |
  f'2 g'2 |
  c'1 | \break
  f'2_\markup \italic \small "Dos vales é o lírio…" e'2 |
  ees'2 d'2 |
  g'2 c'2 |
  f'1 | \break
  \mark \markup \box \bold "B" bes2\mf\<_\markup \italic \small "Consolador amado…"~ bes8 b4. |
  c'2 cis'2 |
  d'2\f bes2 |
  c'1 | \break
  \mark \markup \box \bold "A'" f'2\mf_\markup \italic \small "Dos vales é o lírio, a estrela da manhã…" fis'2 |
  g'2 c'2 |
  d'2 c'2 |
  f'2. d'4\< | \break
  \mark \markup \box \bold "C — Coro" g'2\f_\markup \italic \small "Consolador amado…"~ g'8 c'4. |
  d'2 ees'2 |
  d'2 g'2 |
  c'1 | \break
  \mark \markup \box \bold "A'" f'2\mf_\markup \italic \small "Dos vales é o lírio…" c'2 |
  bes2 des'2 |
  c'1\>^\markup \italic "rit." |
  \mark \markup \box \bold "Coda" des'1\mp^\markup \italic "a tempo" | \break
  bes2^\markup \italic "poco rit." ees'2 |
  f'1\p~ |
  f'1\pp\fermata \bar "|."
    }
  >> \layout { } }
}