#!/usr/bin/env python3
"""Arranjo de "Jesus, o Bom Amigo" (Achei um bom amigo) - Harpa Crista n. 198
para quarteto de 4 saxofones alto em Mi bemol.

Melodia: "The Lily of the Valley" (W. S. Hays, 1871), dominio publico.
Todas as notas abaixo estao em ALTURA ESCRITA (tom escrito: Fa maior;
som real: La bemol maior). Gera LilyPond (.ly) e MusicXML (.musicxml).

Formato de cada token: Nota/duracao[~]   (duracao em seminimas; ~ = ligadura)
"""
import re, sys, itertools

# ---------------------------------------------------------------- melodia/vozes
A1 = [
 # Introducao (c. 1-4)
 "F5/2 G5/1 Ab5/1", "C6/4", "F5/2 E5/2", "G5/3 A5/0.5 Bb5/0.5",
 # Estrofe: A (c. 5-8)
 "C6/0.5 C6/0.5 D6/0.5 C6/0.5 C6/0.5 A5/1 F5/0.5",
 "G5/0.5 F5/0.5 F5/0.5 D5/0.5 C5/1 F5/0.5 G5/0.5",
 "A5/0.5 A5/0.5 A5/0.5 A5/0.5 D6/0.5 C6/0.5 C6/0.5 A5/0.5",
 "G5/3 A5/0.5 Bb5/0.5",
 # A' (c. 9-12)
 "C6/0.5 C6/0.5 D6/0.5 C6/0.5 C6/0.5 A5/1 F5/0.5",
 "G5/0.5 F5/0.5 F5/0.5 D5/0.5 C5/1 F5/0.5 G5/0.5",
 "A5/0.5 C6/0.5 A5/0.5 F5/0.5 G5/0.5 Bb5/0.5 A5/0.5 G5/0.5",
 "F5/3 F5/1",
 # B (c. 13-16)
 "Bb5/0.5 Bb5/0.5 Bb5/0.5 Bb5/0.5 Bb5/0.5 D6/1 D6/0.5",
 "D6/0.5 C6/0.5 C6/0.5 A5/0.5 C6/1 A5/0.5 G5/0.5",
 "F5/0.5 F5/0.5 F5/0.5 F5/0.5 D6/0.5 C6/0.5 C6/0.5 A5/0.5",
 "G5/3 A5/0.5 Bb5/0.5",
 # A' (c. 17-20)
 "C6/0.5 C6/0.5 D6/0.5 C6/0.5 C6/0.5 A5/1 F5/0.5",
 "G5/0.5 F5/0.5 F5/0.5 D5/0.5 C5/1 F5/0.5 G5/0.5",
 "A5/0.5 C6/0.5 A5/0.5 F5/0.5 G5/0.5 Bb5/0.5 A5/0.5 G5/0.5",
 "F5/3 F5/1",
 # Coro (repeticao de B + A', reharmonizado) (c. 21-28)
 "Bb5/0.5 Bb5/0.5 Bb5/0.5 Bb5/0.5 Bb5/0.5 D6/1 D6/0.5",
 "D6/0.5 C6/0.5 C6/0.5 A5/0.5 C6/1 A5/0.5 G5/0.5",
 "F5/0.5 F5/0.5 F5/0.5 F5/0.5 D6/0.5 C6/0.5 C6/0.5 A5/0.5",
 "G5/3 A5/0.5 Bb5/0.5",
 "C6/0.5 C6/0.5 D6/0.5 C6/0.5 C6/0.5 A5/1 F5/0.5",
 "G5/0.5 F5/0.5 F5/0.5 D5/0.5 C5/1 F5/0.5 G5/0.5",
 "A5/0.5 C6/0.5 A5/0.5 F5/0.5 G5/0.5 Bb5/0.5 A5/0.5 G5/0.5",
 "F5/4",
 # Coda (c. 29-31)
 "A5/0.5 C6/0.5 A5/0.5 F5/0.5 G5/0.5 Bb5/0.5 A5/0.5 G5/0.5",
 "F5/2 G5/2~", "G5/4",
]

A2 = [
 "C5/4", "Db5/4", "C5/2 Db5/2", "Db5/4",
 "E5/4", "C5/2 Bb4/2", "E5/2 F5/2", "D5/2 Db5/2",
 "E5/2 C#5/2", "Bb4/2 A4/2", "D5/2 Db5/2", "E5/3 Eb5/1",
 "D5/4", "F5/4", "E5/2 D5/1 Db5/1", "D5/2 Db5/2",
 "E5/2 Eb5/2", "C5/2 Bb4/2", "C5/2 Db5/2", "E5/3 C5/1",
 "F5/2.5 E5/1.5", "E5/2 Db5/2", "C#5/1 C5/1 F5/2", "F5/2 E5/2",
 "E5/2 Eb5/2", "C5/2 Ab4/2", "D5/2 Db5/2", "C5/4",
 "Db5/4", "C5/2 E5/2~", "E5/4",
]

A3 = [
 "Ab4/4", "Ab4/2 G4/2", "Bb4/2 Bb4/2", "E4/4",
 "A4/2 G4/2", "F4/4", "A4/2 Bb4/2", "Bb4/2 E4/2",
 "A4/2 G4/2", "G4/2 F4/2", "Bb4/2 E4/2", "A4/4",
 "F4/2.5 Ab4/1.5", "A4/2 G4/2", "C5/2 A4/2", "Bb4/2 E4/2",
 "A4/4", "Bb4/2 F4/2", "F4/2 E4/2", "A4/3 F#4/1",
 "Bb4/4", "F4/2 G4/2", "F4/2 C5/2", "Bb4/2 Db5/2",
 "A4/2 Bb4/2", "A4/2 F4/2", "Bb4/2 E4/2", "Ab4/4",
 "F4/2 G4/2", "A4/4~", "A4/4",
]

A4 = [
 "Db4/4", "Bb3/2 Eb4/2", "G4/2 C4/2", "C4/4",
 "F4/2 C#4/2", "D4/2 Bb3/1 C4/1", "F4/2 G4/2", "C4/4",
 "F4/2 E4/2", "Eb4/2 D4/2", "G4/2 C4/2", "F4/4",
 "Bb3/2.5 B3/1.5", "C4/2 C#4/2", "D4/2 Bb3/2", "C4/4",
 "F4/2 F#4/2", "G4/2 C4/2", "D4/2 C4/2", "F4/3 D4/1",
 "G4/2.5 C4/1.5", "D4/2 Eb4/2", "D4/2 G4/2", "C4/4",
 "F4/2 C4/2", "Bb3/2 Db4/2", "C4/4", "Db4/4",
 "Bb3/2 Eb4/2", "F4/4~", "F4/4",
]

# cifras (tom escrito), por compasso: (tempo_inicial, nome)
CHORDS = [
 [(0, "D♭maj9(♯11)")], [(0, "B♭m9"), (2, "E♭13")], [(0, "Gm11"), (2, "C7(♭9)")], [(0, "C13(♭9)")],
 [(0, "Fmaj7"), (2, "A7(♯9♭13)/C♯")], [(0, "Dm11"), (2, "B♭add9"), (3, "C7sus4")], [(0, "Fmaj7"), (2, "Gm9")], [(0, "Gm/C"), (2, "C13(♭9)")],
 [(0, "Fmaj7"), (2, "A7(♯9♭13)/E")], [(0, "E♭maj9"), (2, "Dm11")], [(0, "Gm11"), (2, "C13(♭9)")], [(0, "Fmaj7"), (3, "F7")],
 [(0, "B♭add9"), (2.5, "B°7")], [(0, "F/C"), (2, "A7(♯9♭13)/C♯")], [(0, "Dm9"), (2, "B♭maj7"), (3, "B♭m(maj7)")], [(0, "Gm/C"), (2, "C13(♭9)")],
 [(0, "Fmaj7"), (2, "F♯°7")], [(0, "Gm11"), (2, "C7sus4")], [(0, "Dm7"), (2, "C13(♭9)")], [(0, "Fmaj7"), (3, "D7(♯9)")],
 [(0, "Gm7"), (2.5, "C9")], [(0, "Dm9"), (2, "E♭13(♯11)")], [(0, "Dm(maj7)"), (1, "Dm7"), (2, "G9sus4")], [(0, "C7sus4"), (2, "C13(♭9)")],
 [(0, "Fmaj7"), (2, "Cm11")], [(0, "B♭maj9"), (2, "D♭maj7(♯11)")], [(0, "C13sus4"), (2, "C13(♭9)")], [(0, "D♭maj7")],
 [(0, "B♭m(maj7)"), (2, "E♭7(♯11)")], [(0, "Fmaj9")], [],
]

# marcas de ensaio (compasso -> texto) e dicas de letra
MARKS = {1: "Introdução", 5: "A — Estrofe", 13: "B", 17: "A'", 21: "C — Coro", 25: "A'", 28: "Coda"}
CUES = {5: "Achei um bom amigo…", 9: "Dos vales é o lírio…", 13: "Consolador amado…",
        17: "Dos vales é o lírio, a estrela da manhã…", 21: "Consolador amado…", 25: "Dos vales é o lírio…"}
TEXTS = {27: "rit.", 28: "a tempo", 29: "poco rit."}
# dinamicas: (compasso, tempo) -> marca LilyPond (aplicada nas 4 vozes)
DYN = {(1, 0): r"\mp", (5, 0): r"\mf", (13, 0): r"\mf\<", (15, 0): r"\f", (17, 0): r"\mf",
       (20, 3): r"\<", (21, 0): r"\f", (25, 0): r"\mf", (27, 0): r"\>", (28, 0): r"\mp",
       (30, 0): r"\p", (31, 0): r"\pp"}
FERMATA_BAR = 31

# ---------------------------------------------------------------- parsing
NOTE_RE = re.compile(r"^([A-G])(#|b)?(\d)$")
SEMI = dict(C=0, D=2, E=4, F=5, G=7, A=9, B=11)

def parse(bar):
    out = []
    for tok in bar.split():
        tie = tok.endswith("~")
        tok = tok.rstrip("~")
        p, d = tok.split("/")
        out.append((p, float(d), tie))
    return out

def midi(p):
    m = NOTE_RE.match(p)
    L, acc, o = m.groups()
    return 12 * (int(o) + 1) + SEMI[L] + {"#": 1, "b": -1, None: 0}[acc]

PARTS = {"Sax Alto 1": A1, "Sax Alto 2": A2, "Sax Alto 3": A3, "Sax Alto 4": A4}
NB = len(A1)

def check():
    ok = True
    for name, bars in PARTS.items():
        if len(bars) != NB:
            print("ERRO nº compassos", name, len(bars)); ok = False
        for i, b in enumerate(bars, 1):
            s = sum(d for _, d, _ in parse(b))
            if abs(s - 4) > 1e-9:
                print(f"ERRO duração {name} c.{i}: {s}"); ok = False
            for p, _, _ in parse(b):
                # extensao escrita do sax alto: Bb3 (58) a F6 (89)
                if not 58 <= midi(p) <= 89:
                    print(f"ERRO extensão {name} c.{i}: {p}"); ok = False
    # verticalidades a cada colcheia
    names = list(PARTS)
    def at(bars, bi, t):
        x = 0
        for p, d, _ in parse(bars[bi]):
            if x <= t < x + d:
                return midi(p)
            x += d
    for bi in range(NB):
        for k in range(8):
            t = k * 0.5
            v = [at(PARTS[n], bi, t) for n in names]
            for a, b in zip(v, v[1:]):
                if a < b:
                    print(f"CRUZAMENTO c.{bi+1} tempo {t+1}: {v}"); ok = False
            for (i, a), (j, b) in itertools.combinations(enumerate(v), 2):
                iv = a - b
                if iv == 0 and i == 0:
                    print(f"aviso uníssono melodia c.{bi+1} t{t+1}: {names[j]}")
                if iv > 12 and iv % 12 == 1:
                    print(f"aviso 9ªm c.{bi+1} t{t+1}: {names[i]}/{names[j]}")
    return ok

# ---------------------------------------------------------------- LilyPond
LDUR = {4: ["1"], 3: ["2."], 2: ["2"], 1.5: ["4."], 1: ["4"], 0.5: ["8"], 2.5: ["2", "8"]}

def lpitch(p):
    L, acc, o = NOTE_RE.match(p).groups()
    s = L.lower() + {"#": "is", "b": "es", None: ""}[acc]
    o = int(o)
    return s + ("'" * (o - 3) if o >= 3 else "," * (3 - o))

def ly_voice(bars, melody=False):
    out = []
    for bi, b in enumerate(bars, 1):
        items = []
        if melody and bi in MARKS:
            items.append(r'\mark \markup \box \bold "%s"' % MARKS[bi])
        t = 0.0
        for idx, (p, d, tie) in enumerate(parse(b)):
            parts = LDUR[d]
            for k, ld in enumerate(parts):
                s = lpitch(p) + ld
                if k == 0:
                    if (bi, t) in DYN:
                        s += DYN[(bi, t)]
                    if melody and idx == 0 and bi in CUES:
                        s += r'_\markup \italic \small "%s"' % CUES[bi]
                    if melody and idx == 0 and bi in TEXTS:
                        s += r'^\markup \italic "%s"' % TEXTS[bi]
                    if bi == FERMATA_BAR:
                        s += r"\fermata"
                if k < len(parts) - 1 or tie:
                    s += "~"
                items.append(s)
            t += d
        brk = r" \break" if (melody and bi % 4 == 0 and bi < NB) else ""
        out.append(" ".join(items) + (r' \bar "|."' if bi == NB else " |" + brk))
    return "\n  ".join(out)

def ly_chords():
    out = []
    for bar in CHORDS:
        if not bar:
            out.append(r"\skip 1"); continue
        segs = []
        for i, (t, name) in enumerate(bar):
            end = bar[i + 1][0] if i + 1 < len(bar) else 4
            d = end - t
            dur = {4: "1", 3: "2.", 2: "2", 1.5: "4.", 1: "4", 2.5: "2 \\skip 8"}[d]
            if d == 2.5:
                segs.append('"%s"2 \\skip 8' % name)
            else:
                segs.append('"%s"%s' % (name, dur))
        out.append(" ".join(segs))
    return " |\n    ".join(out)

def lilypond():
    staves = []
    for i, (name, bars) in enumerate(PARTS.items()):
        mus = ly_voice(bars, melody=(i == 0))
        staves.append(r'''
    \new Staff = "s%d" \with { instrumentName = "%s" shortInstrumentName = "A%d" midiInstrument = "alto sax" }
    { \global \transposition ees
  %s
    }''' % (i, name, i + 1, mus))
    chords = r'''
    \new Lyrics \with { alignAboveContext = "s0" \override LyricText.font-size = #-1.5
      \override LyricText.font-series = #'bold \override LyricText.self-alignment-X = #LEFT }
    \lyricmode {
    %s
    }''' % ly_chords()
    return r'''\version "2.24.0"
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
  <<%s%s
  >>
  \layout { \context { \Score \override BarNumber.break-visibility = #end-of-line-invisible
      \override BarNumber.self-alignment-X = #LEFT barNumberVisibility = #all-bar-numbers-visible
      \override BarNumber.font-size = #-2 } }
}
\score { << %s >> \midi { } }
''' % (chords, "".join(staves), "".join(staves))

def lilypond_parts():
    books = []
    for i, (name, bars) in enumerate(PARTS.items()):
        mus = ly_voice(bars, melody=True) if i else ly_voice(bars, melody=True)
        # partes: marcas e dicas em todas as vozes; cifras so na Sax Alto 1
        books.append(r'''
\bookpart {
  \header { subsubtitle = "%s (Mi♭)" }
  \score { <<
    \new Staff = "s0" { \global
  %s
    }
  >> \layout { } }
}''' % (name, mus))
    head = lilypond().split(r"\score {")[0]
    return head + "".join(books)

# ---------------------------------------------------------------- MusicXML
def musicxml(path):
    from music21 import stream, note, meter, key, tempo, instrument, dynamics, expressions, metadata, tie as m21tie
    sc = stream.Score()
    sc.metadata = metadata.Metadata(title="Jesus, o Bom Amigo (Achei um bom amigo) — Harpa Cristã nº 198",
                                    composer="W. S. Hays (melodia, 1871) — arr. Claude")
    for i, (name, bars) in enumerate(PARTS.items()):
        part = stream.Part(id=f"A{i+1}")
        inst = instrument.AltoSaxophone(); inst.partName = name; inst.partAbbreviation = f"A{i+1}"
        part.insert(0, inst)
        part.atSoundingPitch = False
        for bi, b in enumerate(bars, 1):
            m = stream.Measure(number=bi)
            if bi == 1:
                m.insert(0, key.KeySignature(-1)); m.insert(0, meter.TimeSignature("4/4"))
                if i == 0:
                    m.insert(0, tempo.MetronomeMark(text="Andante cantabile", number=76))
            if i == 0 and bi in MARKS:
                m.insert(0, expressions.RehearsalMark(MARKS[bi]))
            if i == 0:
                for t, nm in CHORDS[bi - 1]:
                    te = expressions.TextExpression(nm); te.placement = "above"; m.insert(t, te)
                if bi in TEXTS:
                    te = expressions.TextExpression(TEXTS[bi]); te.placement = "above"; m.insert(0, te)
                if bi in CUES:
                    te = expressions.TextExpression(CUES[bi]); te.placement = "below"; te.style.fontStyle = "italic"; m.insert(0, te)
            t = 0.0
            for p, d, tie in parse(b):
                n = note.Note(p.replace("b", "-") if len(p) == 3 else p, quarterLength=d)
                if tie:
                    n.tie = m21tie.Tie("start")
                if bi == FERMATA_BAR:
                    n.expressions.append(expressions.Fermata())
                dy = DYN.get((bi, t))
                if dy:
                    for mark in re.findall(r"\\(pp|p|mp|mf|f)\b", dy):
                        m.insert(t, dynamics.Dynamic(mark))
                m.insert(t, n)
                t += d
            part.append(m)
        part.makeTies(inPlace=True)
        sc.insert(0, part)
    # liga final (c.30 -> c.31) marcada como 'stop' na nota seguinte
    for part in sc.parts:
        ns = list(part.recurse().notes)
        for a, b in zip(ns, ns[1:]):
            if a.tie is not None and a.tie.type == "start" and a.pitch == b.pitch and b.tie is None:
                b.tie = m21tie.Tie("stop")
    sc.write("musicxml", fp=path)

if __name__ == "__main__":
    good = check()
    if not good:
        sys.exit(1)
    if "--write" in sys.argv:
        open("achei-um-bom-amigo-grade.ly", "w").write(lilypond())
        open("achei-um-bom-amigo-partes.ly", "w").write(lilypond_parts())
        musicxml("achei-um-bom-amigo.musicxml")
        print("arquivos gerados")
