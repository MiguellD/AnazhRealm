# Bericht 2010 Bündel-2-ABAB auf der GTX: A main dc6702ab (V18.546.26) gegen B integ-probe 8ba1510d (V18.546.32 = K2 · S7 · S4 · K1 · Leib-Wahl), 20.10. abends

**Urteil: nicht langsamer, in jeder Zelle. Kalt ist B schneller, und das Uhr-Bild trifft die Frage des Auftrags.**
- **KALT 4+4:**
  - t(Weltbild) 16,08 → 15,33 s (−0,75 s, Median; A 15,61–16,97, B 15,11–15,99).
  - t(Leib) 6,60 → 4,95 s (−1,65 s).
  - Erst-Bau beim Bild 3,46–3,66 → 2,50–2,58 s Haupt-Thread, 54–58 → 46–49 Bauten.
  - t(Boden) gleich, 12,94 ↔ 13,02 s.
  - Urteil „B hält": Median B − A = −0,75 s ≤ +0,1.
- **Brunnen (grund-datum):** In ALLEN 8 Läufen steht beim ersten Weltbild ein `brunnen_dorf` mit gebautem Körper (`_servedLod != null`), an A wie an B (1/1 je Lauf). Das Mehr der Frage gibt es nicht.
- **„licht":** Das Weltbild wartet an B auf den Term, offen bis 5,34–6,02 s. Er ist NIE der letzte Term; der letzte ist Streu (B1/B2), Bauten+Streu (B3) bzw. Bauten+Streu+Karten (B4). An A gibt es den Term nicht.
- **Genesis Third stehend (E):** CPU-Takt p95 6,1 → 6,3 (2σ 0,8, t 0,8), Frame p95 16,8 ↔ 16,8, fps 79,9 → 80,2. Soll 5,8: A hält es in 1 von 4 Boots (A4 5,7), B in 0. `_diaetRefresh` inklusiv 1,99 → 1,94 ms je Frame.
- **Genesis Third gehend:** Frame p95 27,1 → 25,0, CPU-Takt p95 21,1 → 20,3, p99 47,4 → 37,5, fps 61,6 → 63,0.
- **Wiese Ego gehend:** Frame p95 25,1 ↔ 25,1, CPU-Takt p95 19,8 → 19,5, fps 61,2 → 61,9.
- **Blick Uhr 0,27 (Wiese, Ego, gleiche Pose, `bild --uhr`, Instrument A):**
  - Mittag ist an beiden Seiten gleich: mittlere Helligkeit 81,4 / 81,3.
  - Um 0,27 ist **A ausgewaschen über Mittag: 111,9 (+37 %)**, gelb überstrahltes Gras, heller Himmel.
  - Um 0,27 zeigt **B goldene Tiefsonne dunkler als Mittag: 63,7 (−22 %)**, warmes Gras, dunkler Wald, graublauer Himmel. Selbst angesehen.

40 Sitzungen (8 Kalt-Läufe, 16 Lauf-Boots, 2 Blicke), alle im ersten Versuch. Seiten-Wache nie rot, 0 GPU-Fehler, beide Bäume am Ende sauber.

## Seiten, Instrument, Weg
- A = `n2010-b2a` (dc6702ab), B = `n2010-b2b` (8ba1510d), beide neu, LF, `npm ci` EXIT=0.
- **KALT:** `diag-boot-stage --kalt --echt` aus dem Baum der Seite (A↔B byte-gleich), Port 7903, je Lauf ein frisches Profil (danach gelöscht).
  - Dazu derselbe Stations-Patch an beiden Seiten (`kalt-patch.cjs`, sha c1103c86): je Probe die Term-Namen der Lücken und die Brunnen (Zahl, davon `_servedLod != null`).
  - Danach `git checkout`, Status 0. `scripts/lib/welt-boot.cjs` ist an B nur um Linsen-Helfer reicher (pruefer, startProc, waitFor).
- **LAUF:** Instrument A (werkbank.cjs). `methoden.txt`: B entfernt 8 Methoden des alten Tag-Nacht-Wegs, das Instrument ruft keine davon.
  - Je Boot eine frische Sitzung (`--echt`, 1920×1080, Regler voll, Tiere frei, Dorf aus).
  - **steht** = E-Form `lauf 30 --ein 20 --ruhe 300`; Profil 20 s nur an Genesis.
  - **geht** = Geher 4 m/s, −z 0 → −60 m und zurück, `lauf 30 --ein 2`, 127–128 m, `abwMaxM` 0 in 16/16.
- **BLICK:** `bild <Auge> <Auge+60 m Blick> --w 1920 --h 1080 --uhr 0.5|0.27 --wahl 0` nach `umstellen --ort wiese --sicht ego` und 10 s Ruhe. Dieselbe Pose an beiden Seiten: −280,4 29,71 −1045,6 → −335,64 29,71 −1069,02.

## Tafeln (Mittel A → B; 2σ gepoolt; Rohpfade unten)
| Zelle | Größe | A | B | Δ | 2σ | Urteil |
|---|---|---|---|---|---|---|
| Kalt | t(Weltbild) Median s | 16,08 (16,97 · 16,14 · 15,61 · 16,03) | 15,33 (15,99 · 15,14 · 15,11 · 15,52) | −0,75 | – | B hält |
| | t(Leib) Median s | 6,60 (7,08 · 9,70 · 6,12 · 5,42) | 4,95 (5,01 · 5,66 · 4,77 · 4,89) | −1,65 | – | B früher |
| Genesis Third steht | CPU-Takt p95 | 6,1 (6,1 · 5,9 · 6,6 · 5,7) | 6,3 (5,9 · 6,0 · 6,5 · 6,8) | +0,2 | 0,8 | nicht langsamer |
| | Frame p95 · fps | 16,8 · 79,9 | 16,8 · 80,2 | 0 · +0,3 | 0,1 · 1,0 | nicht langsamer |
| | `_diaetRefresh` inkl. ms/Frame | 1,99 | 1,94 | −0,05 | 0,19 | gleich |
| Genesis Third geht | Frame p95 · CPU p95 | 27,1 · 21,1 | 25,0 · 20,3 | −2,1 · −0,8 | 5,8 · 6,0 | nicht langsamer |
| | CPU p99 · GPU-Durchsatz | 47,4 · 15,03 | 37,5 · 14,88 | −9,9 · −0,15 | 19,4 · 2,30 | nicht langsamer |
| Wiese Ego geht | Frame p95 · CPU p95 · fps | 25,1 · 19,8 · 61,2 | 25,1 · 19,5 · 61,9 | 0 · −0,3 · +0,7 | 0 · 0,7 · 1,8 | nicht langsamer |
| Wiese Ego steht | CPU p95 · Frame p95 | 4,2 · 16,8 | 4,3 · 16,8 | +0,1 · 0 | 0,5 · 0 | nicht langsamer |

## Takt, Drossel, CPU
- **Lauf-GPU:** Genesis 1733–1759 MHz, Drossel 19–33 %; Wiese 1695–1708 MHz, 27–42 %; max 86 °C.
- **CPU** (`typeperf` % Prozessorleistung, ab g-third-B1): 150–155 % je Boot, Leistungslimit 100 % überall, A und B gleich (`cpu-je-boot.txt`).
- **Kalt-GPU** (P0-Sekunden): A 1404–1733 MHz, B 1404–1746 MHz. Der B-Vorsprung hängt nicht am Takt: B1–B3 liefen bei 1404–1430 MHz.
- **k0 Wiese:** alle 8 Boots „unten" (0,26 steht / 0,24–0,25 geht).

## Ehrlich offen
- **Schwere Boots auf BEIDEN Seiten** (Genesis Third: A3 geht CPU p95 25,3 / fps 53,7, B4 25,0 / 55,4):
  - Die Szene ist gleich (89 Befehle, 388k Dreiecke, VRAM gleich), die CPU-Leistung normal (155 / 153 %), keine CI-Last.
  - GPU-Durchsatz und render-EWMA steigen zugleich (16,8 statt 14,3 ms; 10,7 statt 8,3 ms).
  - Damit ist es weder Turbo-Zustand noch Szene, sondern ein Sitzungs-Zustand. Auch in Bündel 1 (B1) und am Morgen (w-ego-B1) trat er auf. Benannt, nicht zerlegt.
- **Soll E 5,8 bleibt verfehlt:** A 1/4, B 0/4. Die nächste Karte e-bauart greift genau dort an (Diät, Bundles-Replay, `_passSicht` in EINEM Register).
- **„licht" wartet an B bis ~6 s**, aber hinter Streu/Bauten/Karten. Es hält das Weltbild heute nicht. Wird B schneller als ~6 s, muss der Term mit.

## Rohpfade (OMEN `p3/n2010/buendel2/`, Auswertungen hier in `bericht/2010-buendel2-abab/`)
- Kalt: `kalt/<A|B><n>.{json,log,png,-smi.csv}`, Auswertung `auswertung-kalt.cjs` → `kalt/auswertung-kalt.md`.
- Lauf: `gehen/<g-third|w-ego>-<A|B><n>-{steht,geht-1,profil.json,…}`, Auswertung `auswertung-gehen.cjs` / `auswertung-rest.cjs`.
- Blick: `blick/<A1|B1>/uhr-{05,027}.png` + `pose.txt`, Helligkeit `blick/helligkeit.txt`.
- Werkzeug: `ablauf.sh` · `kalt.sh` · `kalt-patch.cjs` · `lauf.sh` · `blick-uhr.sh` · `fortschritt.log` · `cpu-je-boot.txt`.

Status ZWISCHENSTAND + Übergabe: Messung fertig, kein Schnitt. Weiter mit b-blick abschließen (WIP 4517832e), dann e-bauart.
