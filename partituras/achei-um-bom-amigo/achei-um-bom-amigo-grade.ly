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
\score {
  <<
    \new Lyrics \with { alignAboveContext = "s0" \override LyricText.font-size = #-1.5
      \override LyricText.font-series = #'bold \override LyricText.self-alignment-X = #LEFT }
    \lyricmode {
    "D♭maj9(♯11)"1 |
    "B♭m9"2 "E♭13"2 |
    "Gm11"2 "C7(♭9)"2 |
    "C13(♭9)"1 |
    "Fmaj7"2 "A7(♯9♭13)/C♯"2 |
    "Dm11"2 "B♭add9"4 "C7sus4"4 |
    "Fmaj7"2 "Gm9"2 |
    "Gm/C"2 "C13(♭9)"2 |
    "Fmaj7"2 "A7(♯9♭13)/E"2 |
    "E♭maj9"2 "Dm11"2 |
    "Gm11"2 "C13(♭9)"2 |
    "Fmaj7"2. "F7"4 |
    "B♭add9"2 \skip 8 "B°7"4. |
    "F/C"2 "A7(♯9♭13)/C♯"2 |
    "Dm9"2 "B♭maj7"4 "B♭m(maj7)"4 |
    "Gm/C"2 "C13(♭9)"2 |
    "Fmaj7"2 "F♯°7"2 |
    "Gm11"2 "C7sus4"2 |
    "Dm7"2 "C13(♭9)"2 |
    "Fmaj7"2. "D7(♯9)"4 |
    "Gm7"2 \skip 8 "C9"4. |
    "Dm9"2 "E♭13(♯11)"2 |
    "Dm(maj7)"4 "Dm7"4 "G9sus4"2 |
    "C7sus4"2 "C13(♭9)"2 |
    "Fmaj7"2 "Cm11"2 |
    "B♭maj9"2 "D♭maj7(♯11)"2 |
    "C13sus4"2 "C13(♭9)"2 |
    "D♭maj7"1 |
    "B♭m(maj7)"2 "E♭7(♯11)"2 |
    "Fmaj9"1 |
    \skip 1
    }
    \new Staff = "s0" \with { instrumentName = "Sax Alto 1" shortInstrumentName = "A1" midiInstrument = "alto sax" }
    { \global \transposition ees
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
    \new Staff = "s1" \with { instrumentName = "Sax Alto 2" shortInstrumentName = "A2" midiInstrument = "alto sax" }
    { \global \transposition ees
  c''1\mp |
  des''1 |
  c''2 des''2 |
  des''1 |
  e''1\mf |
  c''2 bes'2 |
  e''2 f''2 |
  d''2 des''2 |
  e''2 cis''2 |
  bes'2 a'2 |
  d''2 des''2 |
  e''2. ees''4 |
  d''1\mf\< |
  f''1 |
  e''2\f d''4 des''4 |
  d''2 des''2 |
  e''2\mf ees''2 |
  c''2 bes'2 |
  c''2 des''2 |
  e''2. c''4\< |
  f''2\f~ f''8 e''4. |
  e''2 des''2 |
  cis''4 c''4 f''2 |
  f''2 e''2 |
  e''2\mf ees''2 |
  c''2 aes'2 |
  d''2\> des''2 |
  c''1\mp |
  des''1 |
  c''2\p e''2~ |
  e''1\pp\fermata \bar "|."
    }
    \new Staff = "s2" \with { instrumentName = "Sax Alto 3" shortInstrumentName = "A3" midiInstrument = "alto sax" }
    { \global \transposition ees
  aes'1\mp |
  aes'2 g'2 |
  bes'2 bes'2 |
  e'1 |
  a'2\mf g'2 |
  f'1 |
  a'2 bes'2 |
  bes'2 e'2 |
  a'2 g'2 |
  g'2 f'2 |
  bes'2 e'2 |
  a'1 |
  f'2\mf\<~ f'8 aes'4. |
  a'2 g'2 |
  c''2\f a'2 |
  bes'2 e'2 |
  a'1\mf |
  bes'2 f'2 |
  f'2 e'2 |
  a'2. fis'4\< |
  bes'1\f |
  f'2 g'2 |
  f'2 c''2 |
  bes'2 des''2 |
  a'2\mf bes'2 |
  a'2 f'2 |
  bes'2\> e'2 |
  aes'1\mp |
  f'2 g'2 |
  a'1\p~ |
  a'1\pp\fermata \bar "|."
    }
    \new Staff = "s3" \with { instrumentName = "Sax Alto 4" shortInstrumentName = "A4" midiInstrument = "alto sax" }
    { \global \transposition ees
  des'1\mp |
  bes2 ees'2 |
  g'2 c'2 |
  c'1 |
  f'2\mf cis'2 |
  d'2 bes4 c'4 |
  f'2 g'2 |
  c'1 |
  f'2 e'2 |
  ees'2 d'2 |
  g'2 c'2 |
  f'1 |
  bes2\mf\<~ bes8 b4. |
  c'2 cis'2 |
  d'2\f bes2 |
  c'1 |
  f'2\mf fis'2 |
  g'2 c'2 |
  d'2 c'2 |
  f'2. d'4\< |
  g'2\f~ g'8 c'4. |
  d'2 ees'2 |
  d'2 g'2 |
  c'1 |
  f'2\mf c'2 |
  bes2 des'2 |
  c'1\> |
  des'1\mp |
  bes2 ees'2 |
  f'1\p~ |
  f'1\pp\fermata \bar "|."
    }
  >>
  \layout { \context { \Score \override BarNumber.break-visibility = #end-of-line-invisible
      \override BarNumber.self-alignment-X = #LEFT barNumberVisibility = #all-bar-numbers-visible
      \override BarNumber.font-size = #-2 } }
}
\score { << 
    \new Staff = "s0" \with { instrumentName = "Sax Alto 1" shortInstrumentName = "A1" midiInstrument = "alto sax" }
    { \global \transposition ees
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
    \new Staff = "s1" \with { instrumentName = "Sax Alto 2" shortInstrumentName = "A2" midiInstrument = "alto sax" }
    { \global \transposition ees
  c''1\mp |
  des''1 |
  c''2 des''2 |
  des''1 |
  e''1\mf |
  c''2 bes'2 |
  e''2 f''2 |
  d''2 des''2 |
  e''2 cis''2 |
  bes'2 a'2 |
  d''2 des''2 |
  e''2. ees''4 |
  d''1\mf\< |
  f''1 |
  e''2\f d''4 des''4 |
  d''2 des''2 |
  e''2\mf ees''2 |
  c''2 bes'2 |
  c''2 des''2 |
  e''2. c''4\< |
  f''2\f~ f''8 e''4. |
  e''2 des''2 |
  cis''4 c''4 f''2 |
  f''2 e''2 |
  e''2\mf ees''2 |
  c''2 aes'2 |
  d''2\> des''2 |
  c''1\mp |
  des''1 |
  c''2\p e''2~ |
  e''1\pp\fermata \bar "|."
    }
    \new Staff = "s2" \with { instrumentName = "Sax Alto 3" shortInstrumentName = "A3" midiInstrument = "alto sax" }
    { \global \transposition ees
  aes'1\mp |
  aes'2 g'2 |
  bes'2 bes'2 |
  e'1 |
  a'2\mf g'2 |
  f'1 |
  a'2 bes'2 |
  bes'2 e'2 |
  a'2 g'2 |
  g'2 f'2 |
  bes'2 e'2 |
  a'1 |
  f'2\mf\<~ f'8 aes'4. |
  a'2 g'2 |
  c''2\f a'2 |
  bes'2 e'2 |
  a'1\mf |
  bes'2 f'2 |
  f'2 e'2 |
  a'2. fis'4\< |
  bes'1\f |
  f'2 g'2 |
  f'2 c''2 |
  bes'2 des''2 |
  a'2\mf bes'2 |
  a'2 f'2 |
  bes'2\> e'2 |
  aes'1\mp |
  f'2 g'2 |
  a'1\p~ |
  a'1\pp\fermata \bar "|."
    }
    \new Staff = "s3" \with { instrumentName = "Sax Alto 4" shortInstrumentName = "A4" midiInstrument = "alto sax" }
    { \global \transposition ees
  des'1\mp |
  bes2 ees'2 |
  g'2 c'2 |
  c'1 |
  f'2\mf cis'2 |
  d'2 bes4 c'4 |
  f'2 g'2 |
  c'1 |
  f'2 e'2 |
  ees'2 d'2 |
  g'2 c'2 |
  f'1 |
  bes2\mf\<~ bes8 b4. |
  c'2 cis'2 |
  d'2\f bes2 |
  c'1 |
  f'2\mf fis'2 |
  g'2 c'2 |
  d'2 c'2 |
  f'2. d'4\< |
  g'2\f~ g'8 c'4. |
  d'2 ees'2 |
  d'2 g'2 |
  c'1 |
  f'2\mf c'2 |
  bes2 des'2 |
  c'1\> |
  des'1\mp |
  bes2 ees'2 |
  f'1\p~ |
  f'1\pp\fermata \bar "|."
    } >> \midi { } }
