# Bericht 2010 Bündel-ABAB auf der GTX: A main 80258f0e (V18.546.23) gegen B integ-probe f5b66780 (V18.546.25 = f1-rest + E-Diät + Apparat-Diät), 20.10.

**Urteil: nicht langsamer, in jeder Zelle. Der GT steht an B deckend im Bild, an A ist er ein Geist.**
- **Genesis Third stehend (E):** CPU-Takt p95 6,0 → 6,3 (2σ 0,6, t 1,4), Frame p95 16,8 ↔ 16,8, fps 79,9 ↔ 79,9. Das Plus kommt aus EINEM schweren Boot B1 (6,8); ohne ihn +0,13. Soll 5,8 hält keine Seite (A 5,9–6,3 · B 6,0–6,8).
- **`_diaetRefresh` inklusiv:** 1,99 → 2,02 ms je Frame = gleich. Die E-Diät spart auf der GTX netto nichts:
  - `_diaetObjektGang` fällt 0,40 → 0,30 (t −4,2);
  - `_diaetGeteiltSchreiben` steigt 1,08 → 1,19 (t 1,6).
- **Genesis Third gehend:** Frame p95 25,0 → 25,1, CPU-Takt p95 19,2 → 21,1 (2σ 3,9; B1 25,1, ohne ihn 19,8), fps 65,5 → 63,0.
- **Wiese Ego gehend:** Frame p95 25,1 ↔ 25,1, CPU-Takt p95 20,2 → 19,3, fps 61,1 → 61,8.
- **Fahrt GT mit Third ↔ Ego in voller Fahrt:** Frame p95 35,4 ↔ 35,4, CPU-Takt p95 31,5 → 30,7, p99 61,8 → 59,5, GPU-Durchsatz 16,57 → 15,88.
- **Blick Bild 1–3 nach Ego → Third:** an B steht der GT deckend in der Bildmitte, an A erscheint er als blasser oranger Fleck im Gras (der Geist vom 19.10.).

Je 4+4 verschränkt, 34 Sitzungen im ersten Versuch, Seiten-Wache nie rot. Fingerabdruck A d64c… und B 9ab5… über die ganze Serie konstant, beide Bäume am Ende sauber. GPU-Fehler in keiner Sitzung.

## Seiten, Instrument, Weg
- A = `n1910-integ` (80258f0e), B = `n2010-buendel` (f5b66780, neu, LF, `npm ci` EXIT=0).
- Instrument A: werkbank.cjs ist A↔B byte-gleich. `methoden.txt`: B entfernt nur `_streuSlotHalt`, das Instrument ruft keine fehlende Methode.
- Je Boot eine frische Werkbank-Sitzung (`--echt`, 1920×1080, Regler voll, Tiere frei, Dorf aus):
  - **steht** = E-Form `lauf 30 --ein 20 --ruhe 300`;
  - **Profil** (nur Genesis) `profil 20 --top 60`, stehend, nach dem Lauf;
  - **geht** = Geher 4 m/s, −z 0 → −60 m und zurück, `lauf 30 --ein 2`, 127–128 m, `abwMaxM` 0 in 16/16.
- **Fahrt** (`fahrt.js`, Vorlage aufsitzen.js der Radeon):
  - GT neben dem Spieler an der Wiese, Third. Gas bis 10 m/s, Bremse über 12, Lenkung A jeden 3. Takt.
  - Je 120 Takte Wechsel Third ↔ Ego, sobald v ≥ 8. `lauf 20 --ein 2`, danach `fahrt-pruef.js`.
  - Echtes Fenster 1920×1080, anders als die Radeon-Fahrt vom 19.10. (headless 1280×720, 6 m/s).
- **Blick** (`blick.js` = F1-Blick, Schüsse Bild 1–3 nach dem Wechsel): Steilhang T4 (−61,6/−37,3, 17,4°), bergab 8–8,5 m/s, Third 70 Bilder → Ego bis 75° → Third.
- GPU-Schloss `omen-2010` je Sitzung, 20 s Pause.
  - CI-Vorfahrt zweimal: echt an integ 55da6efb (16:54–17:09, zwischen w-ego B2 und A3) und 5768586a (17:24–17:38, vor fahrt A1), danach je 180 s CI-Ruhe.
  - Gemessen wurde B = f5b66780 wie bestellt.

## Tafel (Mittel A → B, je Boot in Klammern; 2σ gepoolt, t Welch)
| Zelle | Größe | A | B | Δ | 2σ | Urteil |
|---|---|---|---|---|---|---|
| Genesis Third steht | CPU-Takt p95 | 6,0 (5,9 · 6,3 · 6,0 · 5,9) | 6,3 (6,8 · 6,2 · 6,2 · 6,0) | +0,3 | 0,6 | nicht langsamer |
| | Frame p95 · fps | 16,8 · 79,9 | 16,8 · 79,9 | 0,0 · 0,0 | 0,1 · 0,7 | nicht langsamer |
| | `_diaetRefresh` inkl. ms/Frame | 1,986 (1,88 · 2,11 · 1,96 · 2,00) | 2,024 (2,32 · 1,95 · 1,92 · 1,91) | +0,04 | 0,31 | gleich |
| Genesis Third geht | Frame p95 · CPU p95 | 25,0 · 19,2 | 25,1 · 21,1 (25,1 · 20,4 · 19,1 · 19,8) | +0,1 · +1,9 | 0,1 · 3,9 | nicht langsamer |
| | CPU p99 · GPU-Durchsatz | 37,5 · 14,30 | 43,7 · 14,67 | +6,2 (t 2,0) · +0,37 | 8,8 · 0,72 | nicht langsamer |
| Wiese Ego geht | Frame p95 · CPU p95 · fps | 25,1 · 20,2 · 61,1 | 25,1 · 19,3 · 61,8 | 0 · −1,0 · +0,7 | 0 · 1,5 · 2,3 | nicht langsamer |
| Wiese Ego steht | CPU p95 · Frame p95 | 4,5 · 16,8 | 4,6 · 16,8 | +0,0 · 0 | 0,6 · 0 | nicht langsamer |
| Fahrt | Frame p95 · p99 | 35,4 · 62,5 | 35,4 · 64,6 | 0 · +2,1 | 8,3 · 9,0 | nicht langsamer |
| | CPU-Takt p95 · p99 | 31,5 · 61,8 | 30,7 · 59,5 | −0,7 · −2,3 | 6,3 · 7,2 | nicht langsamer |
| | fps · GPU-Durchsatz | 51,9 · 16,57 | 53,7 · 15,88 | +1,8 · −0,70 | 6,8 · 1,99 | nicht langsamer |
- **Profil-Kinder** (ms je Frame, A → B):
  - `_diaetRefresh` selbst 0,274 → 0,294 · `_diaetGeteiltSchreiben` 1,078 → 1,188 · `_diaetObjektGang` 0,397 → 0,299;
  - `o.needsRefresh` alle Stellen 2,20 → 2,26 · `_loopRender` 4,25 → 4,45 · `_renderBundles` (three) 1,330 ↔ 1,330 · `loop` 6,37 → 6,75 (B1 7,77).
- **Fahrqualität** je Seite gleich:
  - Anteil 8–12 m/s A 0,53 (0,40 · 0,59 · 0,69 · 0,45) / B 0,49 (0,44 · 0,34 · 0,43 · 0,75);
  - Weg 163 / 154 m, 4–8 Wechsel je Boot, 8/8 bis zum Ende aufgesessen.
  - Ehrlich: Nur etwa die Hälfte der Takte fährt voll schnell. Der Wagen bleibt im Wald hängen, der Fahrer setzt zurück, und unter 8 m/s bleibt die Sicht stehen; auf beiden Seiten gleich.
- **Blick** (`blick/<B1|A1>/{1-third,2-ego,3-third-01,4-third-02,5-third-03}.jpg`, selbst angesehen):
  - An beiden Seiten steht nach dem Wechsel `instSlotsBand` null und die gezeichneten Teile liegen ≤ 1,76 m an der Wagenmitte.
  - An A zeichnen sie trotzdem nicht deckend.

## Takt, Drossel, CPU
- GPU (nvidia-smi 1 s, P0):
  - Genesis A/B 1733/1733–1746 MHz, Drossel 19–31 %;
  - Wiese 1708–1721 MHz beide Seiten, 28–38 %; max 86 °C.
- CPU (`typeperf` % Prozessorleistung, ab g-third-A2): 145–162 % je Boot, Leistungslimit 100 % überall, A und B gleich (`cpu-je-boot.txt`).
- k0 an der Wiese: A2/A3 stehend „oben" (0,62–0,63), alle B-Boots stehend „unten" (0,26); gehend alle 0,25.

## Ehrlich offen
- **g-third-B1 ist schwer:**
  - stehend CPU p95 6,8, gehend 25,1 / fps 58,5.
  - Im Profil ist jede Funktion ~25 % langsamer (`loop` 7,77 statt 6,3–6,8, `_renderBundles` 1,54).
  - Das Muster spricht für einen Zustand der Sitzung, nicht für einen Code-Term; die anderen 3 B-Boots liegen bei A.
  - Der CPU-Logger lief erst ab g-third-A2 und deckt B1 nicht ab. Ein Beleg fehlt, die Ursache ist benannt, nicht bewiesen.
- **Genesis Third gehend CPU p99 +6,2 (t 2,0)** liegt im 2σ, auch ohne B1 (42,2–45,0 gegen 33,8–42,2). Das ist das knappste Glied des Bündels.
- **Die E-Diät senkt `_diaetRefresh` auf der GTX nicht:** Was der Objekt-Gang spart, kostet das geteilte Schreiben. Soll 5,8 bleibt an beiden Seiten verfehlt.

## Rohpfade (OMEN `p3/n2010/buendel/`, Auswertungen hier in `bericht/2010-buendel-abab/`)
`serie.sh` · `fortschritt.log` · `gehen/<g-third|w-ego>-<A|B><n>-{steht,geht-1,profil.json,geher-ende,zensus-*,smi.csv}` ·
`fahrt/fahrt-<A|B><n>-{ein,auf,lauf,pruef,smi.csv}` · `blick/<B1|A1>/` · `auswertung-gehen.cjs` · `auswertung-rest.cjs` · `cpu-je-boot.txt`.

Status ZWISCHENSTAND + Übergabe: Messung fertig, kein Schnitt. Weiter mit b-blick (WIP 48e499f8).
