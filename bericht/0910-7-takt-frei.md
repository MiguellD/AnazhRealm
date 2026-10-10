> **ENTWURF — Zwischenstand-Sicherung, UNGEPRÜFT.** Der volle Playtest am Kopf läuft noch.

# Bericht 0910-7: der Takt unter Regler frei — die Laub-Dichte pendelte und weckte jeden Fege-Takt und jede Pass-Lage

Auftrag: `auftrag/0910-7-omen-takt-frei.md` (koordination 537a3e15).
Kopf: **welle-m-takt-frei 72019cac** (per `git ls-remote`), ab main 66005ca6, zwei Commits (2f6ce3bf der Schnitt, 72019cac die
Linse). CI: Lauf 38092154993 auf 72019cac, 5 von 5 grün. PLAYTEST-ZEILE

## In drei Sätzen

**Geschnitten:** Die Laub-Dichte (`_foliageDensityScale`) geht jetzt durch die EINE Grenzzyklus-Wand der beiden Cull-Radien:
wachsen erst nach der Ruhe, schrumpfen erst ab dem Totband. Bis hier pendelte sie als einzige Stellgröße ohne Wand je Takt um
ihr Ziel. Jeder Wechsel weckte über den Stand-Stempel jeden Fege-Takt zu einer vollen Runde über den Bestand und über `uLodPerf`
die Lage jedes Passes.

**Gemessen:**
- Täter-Zweig: **studio-s3-pflanzen (c503eaad)**. Der CPU-Takt p95 frei springt dort von 4,4–4,9 auf 11,6–12,2 ms, jeder spätere
  Stand bleibt oben.
- ABAB (je 4 Boots, alle im ersten Versuch grün): CPU-Takt p95 frei **10,8 → 5,6 ms** (voll 4,9 → 4,8; Soll ≤ voll + 1 ms erfüllt).
  Frame p95 16,9 → 16,8 ms, gpu-bank 11,73 → 11,82 ms, Band 77 Befehle und 110,1 MB auf beiden Seiten.
- `gate:takt-atem` (neu, CI Gruppe 2, 0,5 min): main ROT mit Dichte, Stand-Stempel und Lage des Hauptbilds in 100 % der Takte,
  Kopf GRÜN mit 0,4 %.
- Teil B: Die Formationen an Genesis trägt kein Zweig fest. main zeigt in 4 von 8 Genesis-Boots 27,1–32,8k statt 23,6k Dreiecke,
  der Kopf in 6 von 6 Boots 23,6k.

**Ehrlich offen:**
- Der Mechanismus von Teil B ist aus dem Code-Weg geschlossen, nicht je Fels geloggt.
- Wenn die Dichte wirklich wandert (ein echter Trend), weckt jeder Schritt weiter eine volle Runde. Das geschieht jetzt nur
  noch in 3,5 % der Frames.

## Teil A.1: der Zweig — Bisektion über die erste Eltern-Linie

Je Stand von `git log --first-parent 7dd944e6..66005ca6` zwei frische Sitzungen (Werkbank, GTX 1060, Mess-Wiese): `lauf 30 --ein 20
--regler frei`, dann `profil 12 --regler frei`. Instrument EINS (66005ca6 + die Kompat-Zeile `_streuWartet` aus 0910-6), zwei
Durchgänge über die ganze Liste. Rohdaten: `0910-7/bisekt/`.

| Stand | Zweig | CPU p95 frei | Streaming-EWMA | `_loopVoxelStreaming` | `_tickArchitectureLOD` | `_passSicht` | `_chunkSatzPass` | `_hoehlenSicht` |
|---|---|---|---|---|---|---|---|---|
| 7dd944e6 | V18.537 | 4,4 · 4,9 | 0,20 · 0,18 | 5,2 · 5,4 % | 1,4 · 1,4 % | 2,4 · 2,7 % | 1,3 · 1,3 % | 0,9 · 0,9 % |
| d3ebfc79 | fix-ankunft-streu-fall | 4,6 · 5,4 | 0,19 · 0,22 | 5,2 · 4,3 | 1,3 · 2,1 | 2,8 · 3,2 | 1,5 · 2,1 | 1,1 · 1,6 |
| e65e9208 | welle-m-schatten | 4,6 · 4,7 | 0,16 · 0,20 | 5,7 · 6,0 | 1,4 · 1,5 | 2,3 · 2,3 | 1,2 · 1,3 | 0,9 · 1,0 |
| 90307589 | studio-s3-kreatur | 4,7 · 4,5 | 0,21 · 0,20 | 6,6 · 4,4 | 1,4 · 1,2 | 2,0 · 2,1 | 1,0 · 1,1 | 0,7 · 0,8 |
| e18c1951 | studio-s3-wiese-gestalten | 4,8 · 4,9 | 0,21 · 0,23 | 4,5 · 4,9 | 1,4 · 1,4 | 2,7 · 2,4 | 1,4 · 1,4 | 1,0 · 1,0 |
| **c503eaad** | **studio-s3-pflanzen** | **12,2 · 11,6** | **1,58 · 1,84** | **10,4 · 13,3** | **4,2 · 5,3** | **11,2 · 12,3** | **8,7 · 9,8** | **6,9 · 7,8** |
| e3836ce3 | gate:profiband | 12,4 · 12,8 | 2,08 · 9,94 | 13,4 · 13,6 | 4,8 · 4,9 | 11,8 · 13,5 | 9,6 · 11,0 | 7,4 · 8,8 |
| 70b957f3 | schau2-uhr-wetter | 11,4 · 11,7 | 2,19 · 17,78 | 13,3 · 17,5 | 5,1 · 6,9 | 11,0 · 10,9 | 8,3 · 8,3 | 6,4 · 6,4 |
| 76c036b0 | welle-m-host-vram-2 | 11,0 · 11,4 | 1,79 · 22,34 | 11,1 · 18,5 | 5,3 · 7,4 | 11,8 · 12,1 | 9,2 · 9,1 | 7,3 · 7,0 |
| 66005ca6 | V18.538 | 11,7 · 11,3 | 2,24 · 1,90 | 12,7 · 10,1 | 5,5 · 4,7 | 11,5 · 10,9 | 8,8 · 8,4 | 7,0 · 6,6 |

Werte: CPU in ms, Profil als Gesamtzeit-Anteil, je zwei Sitzungen.

**Warum pflanzen, ohne dass es den Takt anfasst:**
- Die Bäume kosten die GPU seither weit weniger (an der Wiese 388k → 120k Dreiecke, 0910-6).
- Vor pflanzen fuhr der Regler unter frei nahe an den Boden (loadScale 0,10–0,29, Laub-Radius 78–100 m) und stand dort still.
  Danach steht er mitten in seiner Spanne (loadScale 0,18–0,61, Radius 105–143 m) und atmet.
- Die Dichte, die einzige Stellgröße ohne Wand, pendelt dort je Takt: +Schritt unter dem Ziel, −2 Schritte darüber.

## Teil A.2: der Mechanismus, gezählt

Atem-Zähler (`0910-7/atem/`): eine Werkbank-Sitzung je Stand, `lauf 30 --ein 20`, je Frame gezählt, was der Regler schreibt und
wer davon aufwacht.

| je Frame | vor pflanzen (e18c1951) frei | main 66005ca6 voll | main 66005ca6 frei | Kopf frei |
|---|---|---|---|---|
| Wechsel der Dichte | 0,017 | 0,018 | **0,521** | 0,035 |
| Stand-Stempel erhöht | 0,019 | 0,132 | **0,521** (2 069 von 2 139 durch die Dichte) | 0,035 |
| neue Lage Hauptbild · k0 · k1 | 0,017 · 0,027 · 0,012 | 0,018 · 0,020 · 0,009 | **0,521 · 0,382 · 0,162** | 0,035 · 0,034 · 0,028 |
| Stufen-Wahl (`archLod`) Einheiten | 12,7 | 33,6 | **299,4** | 37,4 |
| Streu-Stufen (`streuLod`) Einheiten | 8,7 | 13,0 | **211,0** | 31,7 |
| CPU-Takt p95 (ms) | 5,2 | 4,5 | **10,9** | 5,8 |
| Streaming-Phase (EWMA, ms) | 0,21 | 0,18 | **1,88** | 0,19 |

Der Stand-Stempel (`_standStempel`) liest `_foliageDensityScale` als Eingabe. Die Lage jedes Passes (`_passLageGen` →
`_blendeHaelt`) vergleicht den Perf-Streck `uLodPerf` = `_lodPerfMul()` aus derselben Dichte exakt. Beide fielen also in jedem
zweiten Frame.

## Teil A.3: der Schnitt (`_nexusPerfActuate`)

- Die Dichte geht durch DIESELBE Wand wie Laub- und Architektur-Radius: wachsen erst nach `PERF_FOLIAGE_GROW_RUHE_S` ohne
  Über-Budget (dazu wie bisher nie, solange die Welt streamt), schrumpfen erst ab dem Totband.
- Das Totband ist für jede Größe derselbe Anteil ihrer Spanne: 8 m von 170 m Laub-Radius, für die Dichte 0,037 von 0,78. Es gibt
  keine neue Konstante.
- Die Radien behalten Schritt, Totband und Ruhe-Uhr byte-gleich. headless setzt alle drei wie bisher (Dichte 1).
- Die Wurzel liegt am Regler, nicht an den Lesern. Die Leser rechnen über alles, weil die Dichte für jeden Eintrag die
  Wahrnehmungs-Distanz verschiebt; die Wand nimmt ihnen den Anlass.
- `gate:regler-sim` bleibt grün (S1 Konvergenz, S3 Erholung auf Dichte 1, S6 dieselbe Wand). Seine Konvergenz-Probe misst Drift
  über 400 Frames, also war ein Pendeln von ±0,012 für sie unsichtbar; die neue Linse zählt die Wechsel.

## Teil A.4: die Linse `gate:takt-atem` (scripts/diag-takt-atem.cjs)

**Aufbau:**
- Die echte Welt (swiftshader, kienspan), ohne Spiel-Loop und ohne Wanduhr: Die Linse zählt nur.
- Je Takt: der Aktuator mit festem Sinn, `uLodPerf` wie in `_loopRender` (eine Quell-Probe prüft, dass der Spiegel dort steht),
  dann `_runFrameScheduler` und `_passSicht` des Hauptbilds.
- Der Regler steht auf Stufen (loadScale 1 → 0,7 → 0,4 → 0,1 → 0,4 → 0,7 → 1, je 80 Takte) und atmet darüber (±0,02).
- Gezählt wird die zweite Hälfte jeder Stufe: das Folgen auf eine neue Stufe ist Arbeit, das Pendeln der Täter.
- Urteil: DICHTE ATMET · STAND WACH (Weckrufe der Dichte über den Stempel) · LAGE FÄLLT · BLIND. Dazu die Gegenprobe (eine Dichte,
  die je Takt einen Schritt auf und ab stößt) und der Selbsttest in `npm run check`.

| Stand | Urteil | Dichte | Stempel | Lage | `_chunkSatzAbschnitt` | `_hoehlenSicht` |
|---|---|---|---|---|---|---|
| main 66005ca6 | ROT (alle drei Namen) | 100 % | 100 % | 100 % | 11,7 je Takt | 1,0 je Takt |
| Kopf (2 Läufe) | GRÜN | 0,4 % | 0,4 % | 0,4 % | 0,07–0,09 | 0,004 |
| Gegenprobe | DICHTE ATMET | 100 % | 100 % | 100 % | 14 | 1,0 |

- Lokal 43–46 s, in der CI (Gruppe 2) 0,5 min.
- Die Einheiten der Stufen-Wahl liegen in der Linse auf beiden Seiten hoch (200–205 je Takt), denn die Welt wächst in den Stufen
  von 129 auf 416 Einträge. Sie stehen nur als Auskunft im Urteil.

## Teil A.5: ABAB gegen main (`0910-7/abab/`)

A = main 66005ca6, B = Kopf 72019cac, Instrument aus B. Je 4 frische Boots (lauf voll · lauf frei · gpu-bank · band · profil), alle
im ersten Versuch grün, Tiere 11 auf beiden Seiten.

| Größe | A (main 66005ca6) | B (Kopf) | B − A |
|---|---|---|---|
| CPU-Takt p95 frei | 10,8 (10,7–10,9) | **5,6 (5,4–5,7)** | −5,2 (−48 %) |
| CPU-Takt p50 frei | 5,8 (4,6–5,9) | 3,6 (3,6–4,1) | −2,2 |
| CPU-Takt p95 voll | 4,9 (4,8–5,1) | 4,8 (4,7–5,0) | −0,1 |
| Frame p95 frei / voll | 16,9 / 16,8 | 16,8 / 16,8 | −0,1 / 0 |
| Frame max frei / voll | 258 / 33 | 237 / 25 | −21 / −8 |
| render-EWMA frei | 4,23 | 2,96 | −1,27 |
| fps frei / voll | 74,5 / 75,8 | 75,3 / 75,8 | +0,9 / 0 |
| gpu-bank Gier 0 / −0,88 (GPU ms) | 11,73 / 10,77 | 11,82 / 10,78 | +0,09 / +0,01 |
| gpu-bank Gier 0 (CPU ms) | 1,73 (1,63–1,79) | 1,97 (1,85–2,35) | +0,24 |
| Band Befehle · VRAM | 77 · 110,1 MB | 77 · 110,1 MB | 0 |
| Band Dreiecke | 456k (452–460k) | 463k (452–474k) | +7k (boden, siehe offen) |
| Band GPU ms | 13,17 (12,65–14,57) | 13,79 (13,43–13,92) | +0,62 (Spannen überlappen) |

Soll erfüllt: CPU-Takt p95 frei 5,6 ≤ voll + 1 = 5,8 ms. Frame p95 und gpu-bank sind nicht schlechter, das Band bleibt bei 77
Befehlen und 110,1 MB.

## Teil B: formationen an Genesis

- **Bisektion** (`0910-7/genesis/`, je Stand ein Genesis-Boot, GESTELLT): alle zehn Stände von 7dd944e6 bis 66005ca6 tragen
  23,6k (haupt 9 480, k0 13 160, k1 960, 5 Befehle). Kein Zweig hebt die Formationen fest.
- **Wiederholung** an derselben Stelle:

| Seite | Genesis-Boots | Formationen (Dreiecke) |
|---|---|---|
| main 66005ca6 | 8 (6 heute, 1 Bisektion, 1 aus 0910-6) | 23,6k ×4 · **27,1k ×2 · 32,4k · 32,8k** |
| Kopf (Dichte in der Wand) | 6 | 23,6k ×6 |

- Die schweren Fälle liegen auf diskreten Stufen (+3,5k, +8,8k, +9,2k): einzelne Felsen auf einer anderen Stufe.
- Der Code-Weg dazu: Formationen sind gesetzte Studio-Architektur (`instFoundry`). Ihre Stufen-Wahl `_chooseLODForDistance`
  streckt die Distanzen mit `_lodPerfMul()`, also mit der Dichte. Pendelt die Dichte, kippt ein Fels nahe seiner Schwelle, und
  das Band fängt die eine oder die andere Stufe.
- **Urteil:** keine Absicht, kein eigener Schnitt. Die Wand aus Teil A nimmt den Anlass (6 von 6). Die Ratsche bleibt: bei 23,6k und
  27,1k meldet die Band-Linse für die Formationen nichts, rot war sie nur in den beiden schwersten Fällen (32,4k und 32,8k: haupt
  13 880 über 8 400).

## Prüfungen

- CI 38092154993 auf 72019cac: check 4,0 · erst-zeichnung 4,0 · playtest 1/3 19,8 · 2/3 21,4 (darin `gate:takt-atem` 0,5) · 3/3
  15,4 min, 5 von 5 grün.
- `gate:regler-sim` lokal grün; Lint 0 Fehler; `prettier --check` sauber; `gate:ci-deckung` grün.
- PLAYTEST-PRUEFUNG

## Offen (mit Zahl)

1. **Teil B je Fels:** Der Mechanismus (die Stufe eines Felsens kippt mit der Dichte) ist aus dem Code-Weg und der Häufigkeit
   (4 von 8 gegen 0 von 6) geschlossen. Welcher Fels und welche Stufe, ist nicht geloggt.
2. **Wandernde Dichte:** Wandert die Dichte wirklich (ein Trend des Reglers), weckt jeder ihrer Schritte weiter eine volle Runde
   der Fege-Takte und eine neue Lage. Mit der Wand geschieht das in 3,5 % der Frames statt 52 %. Ein Leser, der nur die
   Betroffenen nachrechnet (die Einträge nahe ihrer Schwelle), ist nicht gebaut.
3. **boden im Band** ist auf beiden Seiten zweigipflig (A 166/173k, B 166/186–187k Dreiecke) und kein Effekt dieses Schnitts.
4. **gpu-bank CPU-Seite** 1,73 → 1,97 ms je Frame (Spannen 1,63–1,79 gegen 1,85–2,35), die GPU-Seite gleich. Die Ursache ist nicht
   gemessen.
