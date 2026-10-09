# Auftrag 0910-1: die Genesis-Linse der Messfolge und Host-VRAM Runde 2 (Pflicht-OFFEN E: VRAM 118 MB)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Reihenfolge: 0710-12 (Schatten-Bias) bleibt dein laufender Werkplatz-Auftrag;
**Teil A geht vor dem Messauftrag V18.537**, weil dessen Genesis-Zahlen sonst wieder keine Zahl sind. Teil B ist Werkplatz
danach. Messaufträge haben Vorrang (WIP sichern, Ruhe, messen). Eigener Worktree und Branch je Teil, Basis main 76c9624d
(SHA per ls-remote), Ports 7900–7909.

## Teil A — die Genesis-Zahlen der ABAB-Serien sind keine Zahl (Linsen-Fehler, Gebot 10)

**Befund (Koordinator, am Code belegt):**
- `bericht/0710-9/serie.sh:95–98` fährt `band --ort genesis` in DERSELBEN Sitzung direkt nach `zerlegen`, und `sitzung()` stellt
  die Wiese auf (`:45`). Die Band-Linse meldet selbst „ORT genesis — NICHT GESTELLT … aufgestellt am Ort wiese“
  (`band-genesis-A/B.txt`, Zeile 2). Gemessen wurde also die Wiese, nicht Genesis.
- `zerlegen` hinterlässt 23,7 MB `tex:r184-ausgabe`. Der Post-Schalter setzt `st.postProcessingFailed = true`
  (`scripts/lib/zerlege-linse.cjs:812`), der Direktpfad rendert mit `renderer.toneMapping = ACES` auf die Leinwand, und r184
  `_getFrameBufferTarget` legt dafür ein Rahmen-Ziel an: rgba16float + depth24plus, 15,8 + 7,9 MB bei 1080p,
  `isPostProcessingRenderTarget`. Es wird nie entsorgt, das Undo stellt nur die Flagge zurück.
- Gegenprobe: Im Spiel legt `RenderPipeline.render()` das Ziel nie an (r184 schaltet Tone-Mapping und Farbraum für den Quad ab,
  `outputColorTransform` rechnet ACES + sRGB im Ausgabe-Fragment). Dein Ziel-Zensus f3 zählt 27 Texturen ohne
  `r184-ausgabe`, und kein Radeon-Band seit V18.533 trägt es.
- Daraus folgt: `band-genesis` in 0710-6 und 0710-9 ist eine Wiese mit 23,7 MB Linsen-Rest. Von den 141,1 MB „genesis“
  (0710-9 B) sind 23,7 MB `r184-ausgabe`; der Rest ist die Wiese nach sechs Zerleg-Runden, nicht der Genesis-Ring.

**Schnitt:**
1. Die Messfolge misst Genesis in einer EIGENEN frischen Sitzung mit `umstellen --ort genesis`. Meldet die Linse
   „NICHT GESTELLT“, ist der Lauf ROT und wird wiederholt, nie gezählt. Die Folge wandert in `scripts/omen-messfolge.cjs`,
   das EINE Instrument, statt nur in deine serie.sh.
2. Die Linse, die den Direktpfad schaltet, räumt hinter sich auf. Wer `postProcessingFailed` auf Zeit setzt, entsorgt danach
   das Rahmen-Ziel, das r184 dafür anlegte (`renderer._frameBufferTargets`, Schlüssel = Leinwand-Ziel; `dispose()` des Ziels).
   Das gilt für `zerlegen`, für `ausgabe-aufnahme` (falls sie den Direktpfad fährt) und für jede weitere Linse mit
   Direktpfad. Das ist EINE Regel an EINER Stelle, kein Pflaster je Aufrufer.
3. Die Band-Linse nennt den Täter: `tex:r184-ausgabe` im Band heißt LINSE ROT „Rahmen-Ziel des Direktpfads — im Spiel nie
   angelegt“. Selbsttest: ein Direktpfad-Frame vor `band` färbt rot.
- Zahl im Commit: VRAM eines `band` nach `zerlegen` vorher (+23,7 MB) → nachher (+0). Die Genesis-Zahl ist GESTELLT.

## Teil B — Host-VRAM Runde 2: die Wiese unter 118 MB auf jedem Standardgerät

**Stand V18.536:**
- Radeon, Mess-Wiese, yaw 0, S3-kreatur Band vorher/nachher 4 Läufe: **125,9–127,0 MB**. Darin Post 59,3 (output 15,8 ·
  TRAA.history 19,8 · TRAA.resolve 15,8 · depth 7,9), Kaskaden 16,0, buf:szene 32,9–34,1.
- OMEN, Wiese, 4 B-Boots: 122,1–122,3 MB.
- Band: 118 MB. Lücke rund 4–9 MB je Gerät.

**Kandidaten (je Linse zuerst, Zahl, Bild im Rausch-Boden, Zeit ABAB nicht langsamer):**
1. **`output` rgba16float → rg11b10ufloat** (−7,9 MB). Dein Zensus meldet Kanal a = 1 konstant. TRAA reicht `currentColor.a`
   nur durch (`vendor/TRAANode.js:556/561`), ein rg11b10-Abtaster liefert a = 1. Offen zu klären:
   - Das Feature `rg11b10ufloat-renderable` je Adapter (GTX 1060, Radeon 890M, swiftshader der CI). Fehlt es, ist das eine
     LAUTE Adapter-Bedingung, die der Zensus nennt, kein stiller Rückfall.
   - Ob der Szene-Pass (`pass()`, PassNode) den Typ trägt.
   - Banding im Dunkeln: Der Blau-Kanal hat 5 Bit Mantisse. Bild bei Nacht und im Wald.
2. **TRAA history/resolve:** Nur mit Beweis Ruhe + Bewegung. Deine eigene Rechnung (5 % Mindestgewicht) spricht gegen weniger
   als 16 bit in der Geschichte. Benennen, nicht erzwingen.
3. **Kaskade 1, 2048² depth16 (8 MB):** Texel je Meter im Fernbereich gegen das Bild. Kann k1 bei 1024² (−6 MB) den Schatten
   halten? Bild-Paar fern Mittag/Abend.
4. **buf:szene Boden:** 32,9–34,1 MB auf der Radeon gegen 24,5 auf dem OMEN. Woher kommt der Unterschied (Satz-Kapazität,
   Boden-LOD je Gerät)? Benennen.

Soll: Die Wiese ≤ 118 MB auf Radeon UND OMEN, mit 1080p und eingeschwungenem Band. Die Radeon-Zahl liefert der Koordinator
auf deinen Kopf hin, die Radeon kannst du nicht messen.

## Bericht
Je Teil `bericht/0910-1-<teil>.md`: Kopf (SHA per ls-remote), Linse vorher ROT mit Täter → nachher grün, Zahlen vorher/nachher,
Bild-Paare (selbst angesehen), CI-Lauf, offen mit Zahl und Grund. Die Nachricht an den Koordinator nennt nur „neue Datei X +
Urteil“. Commit-Messages ohne Siegel-Wörter, nie stash, nie force.
