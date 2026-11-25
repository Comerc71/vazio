#!/usr/bin/env python3
"""Galileu - adaptacao para trio de saxofones alto em Mi bemol.

Melodia transcrita da gravacao enviada (voz separada com Demucs + pYIN),
transposta do original (Si maior) para Do maior ESCRITO (som real: Mi bemol maior).
Formato dos tokens: Nota/duracao[~]  ou  r/duracao (pausa). Duracao em seminimas.
"""
import re, sys, itertools

A1 = [
 # Introducao (1-4)
 "E5/2 G5/2", "G#5/4", "E5/2 G5/2", "G#5/2 E5/1.5 B4/0.5",
 # Estrofe (5-20)
 "E5/0.5 E5/0.5 E5/1 E5/1 E5/0.5 G5/0.5",
 "G5/0.5 G5/0.5 E5/2.5 G5/0.5",
 "A5/0.5 A5/0.5 A5/0.5 G5/0.5 G5/0.5 G5/0.5 A5/1",
 "E5/3.5 D5/0.5",
 "D5/0.5 E5/0.5 E5/0.5 E5/0.5 G5/0.5 G5/0.5 F5/0.5 D5/0.5",
 "D5/0.5 C5/3 D5/0.5",
 "D5/0.5 E5/0.5 E5/0.5 E5/0.5 A5/0.5 E5/0.5 D5/0.5 C5/0.5",
 "D5/3.5 B4/0.5",
 "E5/0.5 E5/0.5 E5/1 E5/1 E5/0.5 G5/0.5",
 "G5/0.5 G5/0.5 E5/2.5 G5/0.5",
 "A5/0.5 A5/0.5 A5/0.5 G5/0.5 G5/0.5 G5/0.5 G5/0.5 E5/0.5",
 "E5/3.5 D5/0.5",
 "E5/0.5 E5/0.5 E5/0.5 E5/0.5 G5/0.5 G5/0.5 F5/0.5 D5/0.5",
 "C5/3 A5/0.5 G5/0.5",
 "G5/0.5 G5/0.5 A5/0.5 E5/0.5 E5/0.5 G5/0.5 D5/0.5 C5/0.5",
 "C5/0.5 B4/3.5",
 # Ponte (21)
 "r/3 B4/0.5 F5/0.5",
 # Refrao (22-37)
 "E5/0.5 F5/1 F5/0.5 E5/0.5 E5/0.5 F5/0.5 F5/0.5",
 "F5/3 G5/0.5 A5/0.5",
 "A5/0.5 A5/0.5 A5/0.5 G5/0.5 G5/0.5 A5/1 E5/0.5",
 "E5/3 D5/0.5 D5/0.5",
 "E5/0.5 E5/0.5 E5/1 G5/0.5 F5/0.5 E5/0.5 D5/0.5",
 "C5/4",
 "E5/0.5 E5/0.5 E5/0.5 A5/0.5 E5/1 C5/0.5 D5/0.5",
 "D5/3.5 F5/0.5",
 "F5/0.5 F5/1.5 F5/0.5 E5/0.5 F5/1",
 "F5/0.5 F5/2 F5/0.5 G5/0.5 A5/0.5",
 "A5/0.5 Ab5/0.5 G5/0.5 G5/0.5 G5/0.5 A5/1 E5/0.5",
 "E5/2.5 B4/1 E5/0.5",
 "E5/1 E5/1 G5/0.5 E5/1 C5/0.5",
 "C5/2 A5/0.5 A5/1 G5/0.5",
 "G5/0.5 A5/0.5 G5/0.5 E5/1 D5/0.5 C5/0.5 C5/0.5",
 "C5/4",
 # Interludio (38)
 "E5/4",
 # Final cantado / tag (39-43)
 "B4/0.5 C5/0.5 F5/2 C5/1",
 "B4/2 C#5/0.5 F5/0.5 E5/0.5 B5/0.5",
 "B5/0.5 Bb5/0.5 A5/1.5 B5/0.5 Ab5/0.5 G5/0.5",
 "r/3.5 G5/0.5",
 "F#5/0.5 F5/0.5 F5/0.5 G#5/0.5 F5/0.5 E5/1.5",
 # Coda (44-48)
 "E5/2 G5/2", "G#5/4", "A5/2 G5/2", "F5/2 D5/2", "E5/4",
]

A2 = [
 "B4/4", "B4/4", "B4/4", "B4/4",
 "B4/4", "D5/4", "B4/4", "A4/4", "A4/2 G#4/2", "A4/4", "B4/2 F#4/2", "C5/3.5 A4/0.5",
 "B4/4", "D5/4", "B4/4", "A4/4", "A4/2 G#4/2", "A4/4", "A4/4", "E4/4",
 "G4/0.5 A4/0.5 B4/0.5 C5/0.5 A4/2",
 "A4/4", "C5/2 B4/2", "C5/2 B4/2", "B4/2 A4/2", "B4/4", "F4/2 E4/2", "B4/2 F#4/2", "G4/4",
 "A4/2 C5/2", "A4/2 B4/2", "C5/2 B4/2", "G4/4", "A4/4", "E4/2 B4/2", "C5/2 A4/2", "G4/2 E4/2",
 "G#4/4",
 "A4/2 G4/2", "G4/2 A4/2", "C5/4", "E4/0.5 G4/0.5 A4/0.5 C5/0.5 B4/1 A4/1", "C5/4",
 "B4/4", "B4/4", "B4/4", "Ab4/4", "B4/4",
]

A3 = [
 "C4/4", "C4/4", "C4/4", "C4/4",
 "C4/4", "E4/4", "F4/4", "C4/4", "B3/2 E4/2", "F4/4", "C4/2 D4/2", "G4/4",
 "C4/4", "E4/4", "F4/4", "C4/4", "B3/2 E4/2", "F4/4", "F4/2 G4/2", "C4/4",
 "C4/2 G4/2",
 "F4/4", "F4/4", "F4/2 G4/2", "C4/4", "E4/4", "C4/4", "C4/2 D4/2", "F4/4",
 "F4/4", "F4/4", "F4/2 G4/2", "C4/4", "C4/4", "C4/2 G4/2", "F4/2 G4/2", "C4/4",
 "C4/4",
 "F4/2 Eb4/2", "E4/2 F4/2", "F4/3 Eb4/1", "C4/4", "D4/4",
 "C4/4", "C4/4", "C4/4", "C4/4", "C4/4",
]

CHORDS = [
 [(0, "Cmaj7")], [(0, "Cmaj7(♯5)")], [(0, "Cmaj7")], [(0, "Cmaj7(♯5)")],
 [(0, "Cmaj7")], [(0, "Em7")], [(0, "Fmaj9(♯11)")], [(0, "C6/9")],
 [(0, "Bm7(♭5)"), (2, "E7(♭9♯9)")], [(0, "F6")], [(0, "Cmaj9"), (2, "D9")], [(0, "G9sus4")],
 [(0, "Cmaj7")], [(0, "Em7")], [(0, "Fmaj9(♯11)")], [(0, "C6/9")],
 [(0, "Bm7(♭5)"), (2, "E7(♭9♯9)")], [(0, "F6")], [(0, "Fmaj9"), (2, "G13sus4")], [(0, "Cmaj7")],
 [(0, "Cmaj7"), (2, "G9")],
 [(0, "Fmaj7")], [(0, "Fmaj7"), (2, "Fmaj7(♯11)")], [(0, "F"), (2, "G6/9")], [(0, "Cmaj7"), (2, "C6")],
 [(0, "Em7")], [(0, "Csus4"), (2, "C")], [(0, "Cmaj9"), (2, "D9")], [(0, "F6/9")],
 [(0, "Fmaj7")], [(0, "Fmaj7"), (2, "Fmaj7(♯11)")], [(0, "F"), (2, "G13")], [(0, "Cmaj7")],
 [(0, "C6")], [(0, "C"), (2, "G(add9)")], [(0, "Fadd9"), (2, "G9sus4")], [(0, "C")],
 [(0, "C(♯5)")],
 [(0, "F(♯11)"), (2, "A♭maj7/E♭")], [(0, "Em"), (2, "Fmaj7(♯11)")], [(0, "F"), (3, "A♭maj7")], [(0, "C6")], [(0, "D7(♯9♯11)")],
 [(0, "Cmaj7")], [(0, "Cmaj7(♯5)")], [(0, "C6"), (2, "Cmaj7")], [(0, "Fm6/C")], [(0, "Cmaj7")],
]

MARKS = {1: "Introdução", 5: "A — Estrofe", 13: "A2", 21: "Ponte", 22: "B — Refrão", 30: "B2", 38: "Interlúdio", 39: "Final (tag)", 44: "Coda"}
TEXTS = {43: "rit.", 44: "a tempo", 47: "rit."}
DYN = {(1, 0): r"\mp", (5, 0): r"\mp", (13, 0): r"\mf", (21, 0): r"\<", (22, 0): r"\mf", (30, 0): r"\f",
       (38, 0): r"\mp", (39, 0): r"\mf", (44, 0): r"\p", (48, 0): r"\pp"}
FERMATA_BAR = 48

NOTE_RE = re.compile(r"^([A-G])(#|b)?(\d)$")
SEMI = dict(C=0, D=2, E=4, F=5, G=7, A=9, B=11)
PARTS = {"Sax Alto 1": A1, "Sax Alto 2": A2, "Sax Alto 3": A3}
NB = len(A1)

def parse(bar):
    out = []
    for tok in bar.split():
        tie = tok.endswith("~"); tok = tok.rstrip("~")
        p, d = tok.split("/"); out.append((p, float(d), tie))
    return out

def midi(p):
    if p == "r": return None
    L, acc, o = NOTE_RE.match(p).groups()
    return 12 * (int(o) + 1) + SEMI[L] + {"#": 1, "b": -1, None: 0}[acc]

def check():
    ok = True
    names = list(PARTS)
    for n, bars in PARTS.items():
        if len(bars) != NB: print("ERRO nº compassos", n, len(bars)); ok = False
        for i, b in enumerate(bars, 1):
            s = sum(d for _, d, _ in parse(b))
            if abs(s - 4) > 1e-9: print(f"ERRO duração {n} c.{i}: {s}"); ok = False
            for p, _, _ in parse(b):
                m = midi(p)
                if m is not None and not 58 <= m <= 89: print(f"ERRO extensão {n} c.{i}: {p}"); ok = False
    if len(CHORDS) != NB: print("ERRO cifras", len(CHORDS)); ok = False
    def at(bars, bi, t):
        x = 0
        for p, d, _ in parse(bars[bi]):
            if x <= t < x + d: return midi(p)
            x += d
    for bi in range(NB):
        for k in range(8):
            v = [at(PARTS[n], bi, k * 0.5) for n in names]
            w = [x for x in v if x is not None]
            if any(a < b for a, b in zip(w, w[1:])): print(f"CRUZAMENTO c.{bi+1} t{k*0.5+1}: {v}"); ok = False
            for (i, a), (j, b) in itertools.combinations(enumerate(v), 2):
                if a is not None and b is not None and a - b > 12 and (a - b) % 12 == 1:
                    print(f"aviso 9ªm c.{bi+1} t{k*0.5+1}: {names[i]}/{names[j]}")
    return ok

LDUR = {4: ["1"], 3.5: ["2.", "8"], 3: ["2."], 2.5: ["2", "8"], 2: ["2"], 1.5: ["4."], 1: ["4"], 0.5: ["8"]}

def lpitch(p):
    if p == "r": return "r"
    L, acc, o = NOTE_RE.match(p).groups()
    o = int(o)
    return L.lower() + {"#": "is", "b": "es", None: ""}[acc] + ("'" * (o - 3) if o >= 3 else "," * (3 - o))

def ly_voice(bars, marks=False):
    out = []
    for bi, b in enumerate(bars, 1):
        items = []
        if marks and bi in MARKS: items.append(r'\mark \markup \box \bold "%s"' % MARKS[bi])
        t = 0.0
        for idx, (p, d, tie) in enumerate(parse(b)):
            parts = LDUR[d]
            for k, ld in enumerate(parts):
                s = lpitch(p) + ld
                if k == 0:
                    dy = DYN.get((bi, t))
                    if dy and p != "r": s += dy
                    if marks and idx == 0 and bi in TEXTS: s += r'^\markup \italic "%s"' % TEXTS[bi]
                    if bi == FERMATA_BAR: s += r"\fermata"
                if p != "r" and (k < len(parts) - 1 or tie): s += "~"
                items.append(s)
            t += d
        brk = r" \break" if (marks and bi % 4 == 0 and bi < NB) else ""
        out.append(" ".join(items) + (r' \bar "|."' if bi == NB else " |" + brk))
    return "\n  ".join(out)

def ly_chords():
    out = []
    for bar in CHORDS:
        segs = []
        for i, (t, name) in enumerate(bar):
            end = bar[i + 1][0] if i + 1 < len(bar) else 4
            segs.append('"%s"%s' % (name, {4: "1", 3: "2.", 2: "2", 1: "4"}[end - t]))
        out.append(" ".join(segs))
    return " |\n    ".join(out)

HEADER = r'''\version "2.24.0"
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
'''

def lilypond():
    staves = ""
    for i, (name, bars) in enumerate(PARTS.items()):
        staves += r'''
    \new Staff = "s%d" \with { instrumentName = "%s" shortInstrumentName = "A%d" midiInstrument = "alto sax" }
    { \global \transposition ees
  %s
    }''' % (i, name, i + 1, ly_voice(bars, marks=(i == 0)))
    chords = r'''
    \new Lyrics \with { alignAboveContext = "s0" \override LyricText.font-size = #-1.5
      \override LyricText.font-series = #'bold \override LyricText.self-alignment-X = #LEFT }
    \lyricmode {
    %s
    }''' % ly_chords()
    layout = r'''\layout { \context { \Score \override BarNumber.break-visibility = #end-of-line-invisible
      barNumberVisibility = #all-bar-numbers-visible \override BarNumber.font-size = #-2 } }'''
    return HEADER + r'''\score { <<%s%s
  >> %s }
\score { << %s >> \midi { } }
''' % (chords, staves, layout, staves)

def lilypond_parts():
    books = ""
    for name, bars in PARTS.items():
        books += r'''
\bookpart { \header { subsubtitle = "%s (Mi♭)" }
  \score { \new Staff { \global
  %s
  } \layout { } } }''' % (name, ly_voice(bars, marks=True))
    return HEADER + books

def musicxml(path):
    from music21 import stream, note, meter, key, tempo, instrument, dynamics, expressions, metadata
    sc = stream.Score()
    sc.metadata = metadata.Metadata(title="Galileu — trio de saxofones alto", composer="arr. Claude (transcrição da gravação)")
    for i, (name, bars) in enumerate(PARTS.items()):
        part = stream.Part(id=f"A{i+1}")
        inst = instrument.AltoSaxophone(); inst.partName = name; inst.partAbbreviation = f"A{i+1}"
        part.insert(0, inst); part.atSoundingPitch = False
        for bi, b in enumerate(bars, 1):
            m = stream.Measure(number=bi)
            if bi == 1:
                m.insert(0, key.KeySignature(0)); m.insert(0, meter.TimeSignature("4/4"))
                if i == 0: m.insert(0, tempo.MetronomeMark(text="Balada", number=92))
            if i == 0:
                if bi in MARKS: m.insert(0, expressions.RehearsalMark(MARKS[bi]))
                for t, nm in CHORDS[bi - 1]:
                    te = expressions.TextExpression(nm); te.placement = "above"; m.insert(t, te)
                if bi in TEXTS:
                    te = expressions.TextExpression(TEXTS[bi]); te.placement = "above"; m.insert(0, te)
            t = 0.0
            for p, d, tie in parse(b):
                if p == "r":
                    m.insert(t, note.Rest(quarterLength=d))
                else:
                    n = note.Note(p.replace("b", "-") if len(p) == 3 else p, quarterLength=d)
                    if bi == FERMATA_BAR: n.expressions.append(expressions.Fermata())
                    dy = DYN.get((bi, t))
                    if dy:
                        for mk in re.findall(r"\\(pp|p|mp|mf|f)\b", dy): m.insert(t, dynamics.Dynamic(mk))
                    m.insert(t, n)
                t += d
            part.append(m)
        part.makeTies(inPlace=True)
        sc.insert(0, part)
    sc.write("musicxml", fp=path)

if __name__ == "__main__":
    if not check(): sys.exit(1)
    if "--write" in sys.argv:
        open("galileu-trio-grade.ly", "w").write(lilypond())
        open("galileu-trio-partes.ly", "w").write(lilypond_parts())
        musicxml("galileu-trio.musicxml")
        print("arquivos gerados")
