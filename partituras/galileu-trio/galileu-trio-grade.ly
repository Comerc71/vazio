\version "2.24.0"
\header {
  title = "Galileu"
  subtitle = "Adaptação para trio de saxofones alto em Mi♭"
  composer = "Transcrição a partir da gravação de Michael Pipoquinha"
  arranger = "Harmonização e arranjo: Claude"
  tagline = "Altura escrita (Dó maior) • Som real: Mi♭ maior • Original: Si maior • Cifras em tom escrito"
}
\paper { #(set-paper-size "a4") top-margin = 12 bottom-margin = 12 left-margin = 14 right-margin = 12
  system-system-spacing.basic-distance = #15 }
global = { \key c \major \time 4/4 \tempo "Balada" 4 = 92 }
\score { <<
    \new Lyrics \with { alignAboveContext = "s0" \override LyricText.font-size = #-1.5
      \override LyricText.font-series = #'bold \override LyricText.self-alignment-X = #LEFT }
    \lyricmode {
    "Cmaj7"1 |
    "Cmaj7(♯5)"1 |
    "Cmaj7"1 |
    "Cmaj7(♯5)"1 |
    "Cmaj7"1 |
    "Em7"1 |
    "Fmaj9(♯11)"1 |
    "C6/9"1 |
    "Bm7(♭5)"2 "E7(♭9♯9)"2 |
    "F6"1 |
    "Cmaj9"2 "D9"2 |
    "G9sus4"1 |
    "Cmaj7"1 |
    "Em7"1 |
    "Fmaj9(♯11)"1 |
    "C6/9"1 |
    "Bm7(♭5)"2 "E7(♭9♯9)"2 |
    "F6"1 |
    "Fmaj9"2 "G13sus4"2 |
    "Cmaj7"1 |
    "Cmaj7"2 "G9"2 |
    "Fmaj7"1 |
    "Fmaj7"2 "Fmaj7(♯11)"2 |
    "F"2 "G6/9"2 |
    "Cmaj7"2 "C6"2 |
    "Em7"1 |
    "Csus4"2 "C"2 |
    "Cmaj9"2 "D9"2 |
    "F6/9"1 |
    "Fmaj7"1 |
    "Fmaj7"2 "Fmaj7(♯11)"2 |
    "F"2 "G13"2 |
    "Cmaj7"1 |
    "C6"1 |
    "C"2 "G(add9)"2 |
    "Fadd9"2 "G9sus4"2 |
    "C"1 |
    "C(♯5)"1 |
    "F(♯11)"2 "A♭maj7/E♭"2 |
    "Em"2 "Fmaj7(♯11)"2 |
    "F"2. "A♭maj7"4 |
    "C6"1 |
    "D7(♯9♯11)"1 |
    "Cmaj7"1 |
    "Cmaj7(♯5)"1 |
    "C6"2 "Cmaj7"2 |
    "Fm6/C"1 |
    "Cmaj7"1
    }
    \new Staff = "s0" \with { instrumentName = "Sax Alto 1" shortInstrumentName = "A1" midiInstrument = "alto sax" }
    { \global \transposition ees
  \mark \markup \box \bold "Introdução" e''2\mp g''2 |
  gis''1 |
  e''2 g''2 |
  gis''2 e''4. b'8 | \break
  \mark \markup \box \bold "A — Estrofe" e''8\mp e''8 e''4 e''4 e''8 g''8 |
  g''8 g''8 e''2~ e''8 g''8 |
  a''8 a''8 a''8 g''8 g''8 g''8 a''4 |
  e''2.~ e''8 d''8 | \break
  d''8 e''8 e''8 e''8 g''8 g''8 f''8 d''8 |
  d''8 c''2. d''8 |
  d''8 e''8 e''8 e''8 a''8 e''8 d''8 c''8 |
  d''2.~ d''8 b'8 | \break
  \mark \markup \box \bold "A2" e''8\mf e''8 e''4 e''4 e''8 g''8 |
  g''8 g''8 e''2~ e''8 g''8 |
  a''8 a''8 a''8 g''8 g''8 g''8 g''8 e''8 |
  e''2.~ e''8 d''8 | \break
  e''8 e''8 e''8 e''8 g''8 g''8 f''8 d''8 |
  c''2. a''8 g''8 |
  g''8 g''8 a''8 e''8 e''8 g''8 d''8 c''8 |
  c''8 b'2.~ b'8 | \break
  \mark \markup \box \bold "Ponte" r2. b'8 f''8 |
  \mark \markup \box \bold "B — Refrão" e''8\mf f''4 f''8 e''8 e''8 f''8 f''8 |
  f''2. g''8 a''8 |
  a''8 a''8 a''8 g''8 g''8 a''4 e''8 | \break
  e''2. d''8 d''8 |
  e''8 e''8 e''4 g''8 f''8 e''8 d''8 |
  c''1 |
  e''8 e''8 e''8 a''8 e''4 c''8 d''8 | \break
  d''2.~ d''8 f''8 |
  \mark \markup \box \bold "B2" f''8\f f''4. f''8 e''8 f''4 |
  f''8 f''2 f''8 g''8 a''8 |
  a''8 aes''8 g''8 g''8 g''8 a''4 e''8 | \break
  e''2~ e''8 b'4 e''8 |
  e''4 e''4 g''8 e''4 c''8 |
  c''2 a''8 a''4 g''8 |
  g''8 a''8 g''8 e''4 d''8 c''8 c''8 | \break
  c''1 |
  \mark \markup \box \bold "Interlúdio" e''1\mp |
  \mark \markup \box \bold "Final (tag)" b'8\mf c''8 f''2 c''4 |
  b'2 cis''8 f''8 e''8 b''8 | \break
  b''8 bes''8 a''4. b''8 aes''8 g''8 |
  r2. r8 g''8 |
  fis''8^\markup \italic "rit." f''8 f''8 gis''8 f''8 e''4. |
  \mark \markup \box \bold "Coda" e''2\p^\markup \italic "a tempo" g''2 | \break
  gis''1 |
  a''2 g''2 |
  f''2^\markup \italic "rit." d''2 |
  e''1\pp\fermata \bar "|."
    }
    \new Staff = "s1" \with { instrumentName = "Sax Alto 2" shortInstrumentName = "A2" midiInstrument = "alto sax" }
    { \global \transposition ees
  b'1\mp |
  b'1 |
  b'1 |
  b'1 |
  b'1\mp |
  d''1 |
  b'1 |
  a'1 |
  a'2 gis'2 |
  a'1 |
  b'2 fis'2 |
  c''2.~ c''8 a'8 |
  b'1\mf |
  d''1 |
  b'1 |
  a'1 |
  a'2 gis'2 |
  a'1 |
  a'1 |
  e'1 |
  g'8\< a'8 b'8 c''8 a'2 |
  a'1\mf |
  c''2 b'2 |
  c''2 b'2 |
  b'2 a'2 |
  b'1 |
  f'2 e'2 |
  b'2 fis'2 |
  g'1 |
  a'2\f c''2 |
  a'2 b'2 |
  c''2 b'2 |
  g'1 |
  a'1 |
  e'2 b'2 |
  c''2 a'2 |
  g'2 e'2 |
  gis'1\mp |
  a'2\mf g'2 |
  g'2 a'2 |
  c''1 |
  e'8 g'8 a'8 c''8 b'4 a'4 |
  c''1 |
  b'1\p |
  b'1 |
  b'1 |
  aes'1 |
  b'1\pp\fermata \bar "|."
    }
    \new Staff = "s2" \with { instrumentName = "Sax Alto 3" shortInstrumentName = "A3" midiInstrument = "alto sax" }
    { \global \transposition ees
  c'1\mp |
  c'1 |
  c'1 |
  c'1 |
  c'1\mp |
  e'1 |
  f'1 |
  c'1 |
  b2 e'2 |
  f'1 |
  c'2 d'2 |
  g'1 |
  c'1\mf |
  e'1 |
  f'1 |
  c'1 |
  b2 e'2 |
  f'1 |
  f'2 g'2 |
  c'1 |
  c'2\< g'2 |
  f'1\mf |
  f'1 |
  f'2 g'2 |
  c'1 |
  e'1 |
  c'1 |
  c'2 d'2 |
  f'1 |
  f'1\f |
  f'1 |
  f'2 g'2 |
  c'1 |
  c'1 |
  c'2 g'2 |
  f'2 g'2 |
  c'1 |
  c'1\mp |
  f'2\mf ees'2 |
  e'2 f'2 |
  f'2. ees'4 |
  c'1 |
  d'1 |
  c'1\p |
  c'1 |
  c'1 |
  c'1 |
  c'1\pp\fermata \bar "|."
    }
  >> \layout { \context { \Score \override BarNumber.break-visibility = #end-of-line-invisible
      barNumberVisibility = #all-bar-numbers-visible \override BarNumber.font-size = #-2 } } }
\score { << 
    \new Staff = "s0" \with { instrumentName = "Sax Alto 1" shortInstrumentName = "A1" midiInstrument = "alto sax" }
    { \global \transposition ees
  \mark \markup \box \bold "Introdução" e''2\mp g''2 |
  gis''1 |
  e''2 g''2 |
  gis''2 e''4. b'8 | \break
  \mark \markup \box \bold "A — Estrofe" e''8\mp e''8 e''4 e''4 e''8 g''8 |
  g''8 g''8 e''2~ e''8 g''8 |
  a''8 a''8 a''8 g''8 g''8 g''8 a''4 |
  e''2.~ e''8 d''8 | \break
  d''8 e''8 e''8 e''8 g''8 g''8 f''8 d''8 |
  d''8 c''2. d''8 |
  d''8 e''8 e''8 e''8 a''8 e''8 d''8 c''8 |
  d''2.~ d''8 b'8 | \break
  \mark \markup \box \bold "A2" e''8\mf e''8 e''4 e''4 e''8 g''8 |
  g''8 g''8 e''2~ e''8 g''8 |
  a''8 a''8 a''8 g''8 g''8 g''8 g''8 e''8 |
  e''2.~ e''8 d''8 | \break
  e''8 e''8 e''8 e''8 g''8 g''8 f''8 d''8 |
  c''2. a''8 g''8 |
  g''8 g''8 a''8 e''8 e''8 g''8 d''8 c''8 |
  c''8 b'2.~ b'8 | \break
  \mark \markup \box \bold "Ponte" r2. b'8 f''8 |
  \mark \markup \box \bold "B — Refrão" e''8\mf f''4 f''8 e''8 e''8 f''8 f''8 |
  f''2. g''8 a''8 |
  a''8 a''8 a''8 g''8 g''8 a''4 e''8 | \break
  e''2. d''8 d''8 |
  e''8 e''8 e''4 g''8 f''8 e''8 d''8 |
  c''1 |
  e''8 e''8 e''8 a''8 e''4 c''8 d''8 | \break
  d''2.~ d''8 f''8 |
  \mark \markup \box \bold "B2" f''8\f f''4. f''8 e''8 f''4 |
  f''8 f''2 f''8 g''8 a''8 |
  a''8 aes''8 g''8 g''8 g''8 a''4 e''8 | \break
  e''2~ e''8 b'4 e''8 |
  e''4 e''4 g''8 e''4 c''8 |
  c''2 a''8 a''4 g''8 |
  g''8 a''8 g''8 e''4 d''8 c''8 c''8 | \break
  c''1 |
  \mark \markup \box \bold "Interlúdio" e''1\mp |
  \mark \markup \box \bold "Final (tag)" b'8\mf c''8 f''2 c''4 |
  b'2 cis''8 f''8 e''8 b''8 | \break
  b''8 bes''8 a''4. b''8 aes''8 g''8 |
  r2. r8 g''8 |
  fis''8^\markup \italic "rit." f''8 f''8 gis''8 f''8 e''4. |
  \mark \markup \box \bold "Coda" e''2\p^\markup \italic "a tempo" g''2 | \break
  gis''1 |
  a''2 g''2 |
  f''2^\markup \italic "rit." d''2 |
  e''1\pp\fermata \bar "|."
    }
    \new Staff = "s1" \with { instrumentName = "Sax Alto 2" shortInstrumentName = "A2" midiInstrument = "alto sax" }
    { \global \transposition ees
  b'1\mp |
  b'1 |
  b'1 |
  b'1 |
  b'1\mp |
  d''1 |
  b'1 |
  a'1 |
  a'2 gis'2 |
  a'1 |
  b'2 fis'2 |
  c''2.~ c''8 a'8 |
  b'1\mf |
  d''1 |
  b'1 |
  a'1 |
  a'2 gis'2 |
  a'1 |
  a'1 |
  e'1 |
  g'8\< a'8 b'8 c''8 a'2 |
  a'1\mf |
  c''2 b'2 |
  c''2 b'2 |
  b'2 a'2 |
  b'1 |
  f'2 e'2 |
  b'2 fis'2 |
  g'1 |
  a'2\f c''2 |
  a'2 b'2 |
  c''2 b'2 |
  g'1 |
  a'1 |
  e'2 b'2 |
  c''2 a'2 |
  g'2 e'2 |
  gis'1\mp |
  a'2\mf g'2 |
  g'2 a'2 |
  c''1 |
  e'8 g'8 a'8 c''8 b'4 a'4 |
  c''1 |
  b'1\p |
  b'1 |
  b'1 |
  aes'1 |
  b'1\pp\fermata \bar "|."
    }
    \new Staff = "s2" \with { instrumentName = "Sax Alto 3" shortInstrumentName = "A3" midiInstrument = "alto sax" }
    { \global \transposition ees
  c'1\mp |
  c'1 |
  c'1 |
  c'1 |
  c'1\mp |
  e'1 |
  f'1 |
  c'1 |
  b2 e'2 |
  f'1 |
  c'2 d'2 |
  g'1 |
  c'1\mf |
  e'1 |
  f'1 |
  c'1 |
  b2 e'2 |
  f'1 |
  f'2 g'2 |
  c'1 |
  c'2\< g'2 |
  f'1\mf |
  f'1 |
  f'2 g'2 |
  c'1 |
  e'1 |
  c'1 |
  c'2 d'2 |
  f'1 |
  f'1\f |
  f'1 |
  f'2 g'2 |
  c'1 |
  c'1 |
  c'2 g'2 |
  f'2 g'2 |
  c'1 |
  c'1\mp |
  f'2\mf ees'2 |
  e'2 f'2 |
  f'2. ees'4 |
  c'1 |
  d'1 |
  c'1\p |
  c'1 |
  c'1 |
  c'1 |
  c'1\pp\fermata \bar "|."
    } >> \midi { } }
