# Gegner Preis zum Baum w28-baum-schirm (ZWISCHENSTAND)

Stand 15.11.2026 07:16–08:54 (date). Auftrag: widerlegen, dass die Schnitte billiger oder gleich sind. Kein Byte des Spiels geändert.
Gerät Radeon 890M, jede Welt `werkbank start --echt`, `r._schirm()` = 1920 × 1080 (pxJeM 703,7) in jeder Lesung. GPU-Schloss
`gegner-baum-preis` (bild für Zählungen, zeit für ms), danach kein Port offen, keine Welt am Leben.
Werkzeug (kein Dauer-Werkzeug) und Rohdaten: `artifacts/profiband/auge/w28-baum-schirm/gegner-preis/` (`gegner-baum.cjs`,
`zensus.*`, `nadel.*`, `zeit.*`, `abba16.*`, `kreuz-*.*`, `wieder.out`, `zeit.out`).

## Was zu prüfen war

Der Zweig 34a1bc7f trägt gegen main a6555b12 im Spiel nur Schnitt 3 (die Verdeckung in Metern fällt). Schnitt 1, 2, 4 und 5 sind
zurückgenommen, der Rest sind Prüf-Skripte. Die Umbenennung `occlNode` → `vollNode` ändert den Shader nicht, es ist dieselbe TSL-Kette.
Darum gilt: Kandidat ≡ main mit `state.useOcclusionDemotion = false`. Gemessen wurde zweifach.
(a) EINE Welt main (eigener Baum `gegner-baum-preis-main` @ a6555b12), Schalter mit/ohne im Wechsel.
(b) Echte Kreuz-Probe: Welt main, Welt Kandidat, Welt Kandidat, Welt main, jede mit Boot an der Wiese und dann am Wald-Punkt.
Die Gleichheit von (a) und (b) ist am Zensus belegt: Kandidat L [81, 60, 2275] = main ohne Schalter, main mit Schalter L [76/81, 53, 2282].

## Wo der Schnitt überhaupt wirkt

- Mess-Wiese (−280,4, −1045,6) und Spawn (Genesis 0, 0): 0 verdeckte Bäume, mit und ohne Schalter derselbe Stufen-Zustand
  (Wiese L [121, 35, 2327], Spawn L [213, 45, 3166], je 4 Lesungen). Der GPU-Anteil von Laub, Karten und Gras-Ferne ist dort
  zwischen Kandidat und main gleich, weil ihr Zustand derselbe ist. Eine Zeit-Zahl kann dort nur Rauschen messen.
- Suche nach dem stärksten Ort: jeder Kamera-Punkt im 8-m-Gitter, gerechnet mit `_occlusionOccludes` und dem besten 70°-Fächer.
  - 2223 Bäume im Ring um die Wiese: höchstens 8 verdeckte im Fächer, nach dem Einschwingen 6.
  - 1243 Bäume am Nadelwald-Hang (−900, −850): höchstens 5, nach dem Einschwingen 4.
- Der Wald-Punkt ist deshalb (−360,4, −1101,6), gier 2,007. Dort stehen 6 verdeckte Bäume im Blick, 4 Kiefern und 2 Tannen,
  20,8–41,5 m hoch, in 33,7–50,8 m (`wald-main-mit.png` und `-ohne.png`). Mehr Wirkung bietet keine gefundene Stelle.

## Gemessen

| Größe | main (mit Gitter) | Kandidat (ohne) | Urteil |
|---|---|---|---|
| Dreiecke je Bild, Wald (Kreuz) | 661 232 · 665 802 | 665 728 · 665 672 | gleich, Kandidat liegt in der Spanne von main |
| Klasse `baum` Wald (Kreuz) | 96 Befehle · 333 946 Dr. · 154 Inst. | 96 · 333 946 · 154 | identisch |
| Karten `fimp:atlas:L2` Wald | 996 Inst. · 7 968 Dr. | 994 · 7 952 | −2 Instanzen |
| Gras-Ferne `nahWiese` Wald | 6 Befehle · 84 143 Dr. | 6 · 84 143 | identisch |
| Zeichenaufrufe gesamt, Wald (Kreuz) | 191 · 191 | 191 · 191 | identisch |
| Nadelwald (Schalter, 2+2) | `baum` 63 Befehle · 411,8 k · 194 Inst.; Karten 1190 | dasselbe; Karten 1189 | identisch |
| Heap nach zwei GC, Wald bei Ankunft (Kreuz) | 320,0 · 322,3 MB | 319,2 · 319,1 MB | nicht über main |
| VRAM nach zwei GC, Wald bei Ankunft (Kreuz) | 136,7 · 137,3 MB | 137,3 · 137,2 MB | nicht über dem Höchstwert von main (Mittel +0,25 MB, innerhalb der Spanne von main 0,6 MB) |
| Heap / VRAM nach 4 Gängen (Kreuz) | 363,3 · 380,8 / 140,1 · 140,0 | 361,0 · 366,9 / 139,4 · 130,3 | nicht über main |
| Heap / VRAM in EINER Welt, Schalter mit/ohne/mit/ohne | Wald 486,1/487,4/487,4/488,3 · 150,9/149,1/149,1/149,2; Nadel 395,5–395,7 · 141,8–142,0 | | folgt der Zeit, nicht dem Schalter |
| Stufen-Wechsel je 60-m-Gang, Wald (Schalter, 4+4) | hin 567–627 · her 480–496 | hin 433–438 · her 379–386 | Kandidat −25 % |
| `_tickArchitectureLOD` Summe je Gang (Schalter) | 2359–2801 ms, p95 3,1–3,9 ms | 1258–1728 ms, p95 2,1–2,6 ms | Kandidat −40 % |
| dasselbe in der Kreuz-Probe | 2542–2958 ms (ohne den ersten Gang der frischen Welt) | 1373–1768 ms | Kandidat −40 % |
| größte Wechsel je Bild im Gang | 5 (die Grenze) | 5 | gleich |
| Wechsel im größten Bild des Gangs | 0–1 | 0–1 | der Stufen-Tausch trägt das größte Bild nicht |
| größtes Bild je Gang (Schalter, Paare hin/her) | 40,9/55,8 · 59,7/71,4 · 65,4/90,5 · 60,6/98,7 | 50,2/68,5 · 48,1/67,8 · 46,1/72,9 · 51,7/94,1 | 6 von 8 Paaren besser; Bilder > 50 ms: 27 ↔ 19 |

**Zeit (GPU-Bank, Anteil ohne − mit in Punkten, Median ± Standardfehler) — alle UNGEMESSEN unter Last:**

- Wald, 8 Durchgänge (A B B A B A A B): +0,97 ± 13. Referenzfahrt vorher f 1,08–1,23, nachher 1,23–1,59.
- Wald, 16 Durchgänge (24 Bilder je Bank): −1,72 ± 4,15. Referenzfahrt vorher f 1,33–1,84.
- Wiese: −1,06 ± 4,28. Spawn: −4,75 ± 4,65. Beides sind Nullproben mit demselben Zustand.
- Zerlegung am Wald, je Schalter-Zustand ein eigener Block mit 4 ABBA-Wechseln. Die Blöcke liefen nacheinander, nicht verschränkt:
  - mit: Gesamt 39,22 ms, `baum` 43,0 % ± 4,67 ms, Karten −9,4 % ± 8,43, Gras-Ferne −3,2 % ± 1,35.
  - ohne: Gesamt 46,15 ms, `baum` 37,4 % ± 0,58, Karten 7,2 % ± 2,69, Gras-Ferne 7,0 % ± 2,85.
  - Der Takt-Zustand der iGPU wechselte zwischen den Blöcken (39 → 46 ms). Das ist eine Lesung, kein Maß.
- Bild p95 im Gang, Kreuz-Probe zwischen Welten: main Median 29,6 ms, Kandidat 30,5 ms. Unter f bis 2,02 ist auch das nur eine Lesung.
  Die Gänge im Schalter-Wechsel in EINER Welt liegen gepaart bei etwa −0,5 ms.

## Funde

Kein Fund am Preis. Keine Zahl des Kandidaten liegt schlechter als main: Dreiecke, Zeichenaufrufe, VRAM, Heap, Stufen-Wechsel je
Bild und größtes Bild im Gang nicht. Billiger ist er bei der CPU der Stufen-Wahl (−40 %) und bei der Zahl der Wechsel (−25 %).

Zwei Sätze der Berichte gehen über ihr Maß hinaus (klein, ohne Folge für die Annahme):
1. Schnitt 3, Spike P3: „−2,18 ± 3,36 Punkte, also eher weniger". Das sind 0,65 σ unter f 1,61–1,72. Meine stärkere Stelle mit
   6 statt 5 verdeckten Bäumen misst −1,72 ± 4,15 und +0,97 ± 13. Belegt ist „nicht teurer“ durch Dreiecke und Befehle; „eher
   weniger“ an der GPU ist nicht belegt.
2. Schnitt 3, Pop an der Mess-Wiese 0,0672 → 0,0537 %: Dort wirkt der Schalter auf 0 Bäume (Stufen-Zustand mit und ohne
   identisch, 4 Lesungen). Der Unterschied ist das Rauschen der Linse, keine Wirkung des Schnitts. Die Annahme „Kandidat ≤ main“
   hält trotzdem.

Die Behauptung „Bäume wählen statt Karte → mehr Laub, mehr Dreiecke“ trägt nicht. Der Zensus zählt 6–7 Bäume mehr auf L1, die
Klasse `baum` zeichnet aber dieselben 154 Instanzen mit denselben 333 946 Dreiecken. Wie die Stufe dieser 6 Bäume gezeichnet wird,
habe ich nicht nachgelesen (eine Kiefer-L1 steht in keiner Zeichen-Klasse). Das gehört dem Bild-Gegner, nicht dem Preis.

## Ehrlich offen

- Jede Zeit-Zahl ist UNGEMESSEN unter Last: Standardfehler ≥ 4,15 Punkte, f 1,08–2,02. Ich habe einmal wiederholt (16 Durchgänge),
  der Standardfehler blieb über 4. Der Schnitt bewegt im Blick 6 von etwa 1 850 Bäumen; seine GPU-Wirkung liegt unter dem
  Auflösungsvermögen dieses Geräts heute.
- Die GTX 1060 ist ungemessen.
- Pop und Bildpaar hat der Bild-Gegner. `wald-main-mit/-ohne.png` zeigen den Ort, sie sind kein Paar mit gleicher Zeit (1 s
  Loop, Wind).
- Schnitt 1, 2, 4 und 5 tragen kein Laufzeit-Byte im Zweig, ihr Preis ist der von main. Ihre Spike-Zahlen habe ich nicht nachgemessen.

Geschnitten: nichts (Gegner, kein Byte des Spiels)
Gemessen: Wald-Punkt (−360,4/−1101,6, 6 verdeckte Bäume im Blick) Kandidat ↔ main: Dreiecke `baum` 333 946 ↔ 333 946, Befehle 191 ↔ 191, VRAM 137,3/137,2 ↔ 136,7/137,3 MB, Heap 319,2/319,1 ↔ 320,0/322,3 MB, LOD-Takt je Gang −40 %, GPU −1,72 ± 4,15 Punkte (UNGEMESSEN unter Last)
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
