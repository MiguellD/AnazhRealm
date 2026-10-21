# Bericht 2110 Bündel-3-ABAB auf der GTX: A main 57a9f2ab (V18.546.40) gegen B integ-probe d3a626ee (V18.546.42 = + belegung, ferne-luft, licht-weg), 21.10.

**Urteil: nicht langsamer in Frame, CPU-Takt und Belegung, in jeder Zelle. Der Haupt-Faden ist deutlich entlastet. Ein GPU-Term an Genesis Third ist beim Namen benannt.**
- **Belegung je Bild, der Gewinn:**
  - Genesis Third steht: p95 9,33 → 7,72 ms, außer Takt 3,17 → 0,92.
  - Wiese Ego steht: 8,65 → 6,58.
  - Gehend: außer Takt 3,31 → 1,75 (Genesis), 3,61 → 2,04 (Wiese).
- **Frame p95 und CPU-Takt p95:** überall im 2σ.
  - Genesis Third steht CPU-Takt p95 5,9 → 6,1 (2σ 0,3), Frame 16,8 ↔ 16,7.
  - Genesis geht 19,7 ↔ 19,9. Wiese steht 4,8 → 4,7, Wiese geht 19,8 → 19,5.
- **GPU (gpu-bank-Wahrheit) an Genesis Third steht:**
  - Im ABAB 11,21 → 11,65 ms je Bild (+0,43, t 3,8, gleicher Takt 1746 MHz).
  - Die Bisektion zeigt zwei gegenläufige Terme:
    - **ferne-luft kostet +0,58 ms GPU je Bild** (C fdda7c13 11,00 → F 9d5e1ca8 11,58; 2+2, je Boot 10,96 · 11,04 → 11,61 · 11,54).
    - **Der Belegungs-Schnitt spart −0,64 ms GPU** (A 11,64 → C 11,00). Die geschlossenen Drawer kosteten auch Compositing auf derselben GPU.
    - licht-weg −0,14 (F → B).
  - Netto schwankt A gegen B mit dem Sitzungsstand von A zwischen +0,43 und −0,20. Über alle 5+5 Bank-Boots mit gleichem Protokoll: A 11,38 · B 11,56 (+0,18).
  - Wiese Ego: gpu-bank gleich, 12,05 → 11,94.
- **Blick Uhr 0,27 (Wiese, Ego, gleiche Pose):** A und B gleich (Helligkeit 63,7/63,7, Horizontband B/R 0,37/0,38; Mittag 81,3/81,3). Die Luft je Kanal wirkt erst in der Ferne, die dieser Waldblick nicht zeigt; ein Fern-Blick (Hügel +120 m, 8 km) läge bei der Messschuld Ferne K1.

## Seiten, Instrument, Weg
- A = `n2010-b2a` (57a9f2ab), B = `n2010-b2b` (d3a626ee), 3+3 verschränkt; Bisektion zusätzlich C = `n2110-ec` (fdda7c13), F = `n2110-bf` (9d5e1ca8, node_modules als Junction).
- **Instrument B** (werkbank.cjs d3a626ee). Es misst die Belegung je Lauf selbst (CDP-Spur im Mess-Fenster, `belegung` in der lauf-Ausgabe).
  - `methoden.txt`: Die zwei Methoden, die in A fehlen (`_weltLicht`, `_weltLichtTakt`), ruft nur die Lichtweg- bzw. Wasser-Linse, nie lauf/bank/bild.
- Je Boot eine frische Sitzung (`--echt`, 1920×1080, Regler voll, Tiere frei, Dorf aus). Folge: steht `lauf 30 --ein 20 --ruhe 300` · `gpu-bank 12 --runden 5` · Geher 4 m/s · geht `lauf 30 --ein 2`.
- **Bisektion:**
  - Runde 1 hatte die Bank nach `lauf 10` und war BLIND: ~1 ms Streuung, das gesetzte Bild steht dann noch nicht.
  - Runde 2 lief mit dem Bündel-Protokoll (Bank nach `lauf 30`), Folge A C F B ×2, alle Boots bei 1784–1822 MHz.
- **CI-Vorfahrt dreimal:** echt an 749ddc27, e13be8fe, 39565600916; danach je 180 s Ruhe. Seiten-Wache nie rot, Bäume am Ende sauber.
- CPU-Leistung 149–158 % je Boot, A und B gleich (`cpu-je-boot.txt`). k0 Wiese: B1 „oben“ (0,63), sonst „unten“.

## Ehrlich offen
- **ferne-luft +0,58 ms GPU an Genesis Third:** Der Ort im Bild ist nicht lokalisiert; die Pass-Stempel (k0, haupt, TRAA, post, Himmel) sind gleich, das Plus liegt im ungestempelten Teil. Kandidat ist die Luft je Kanal im fogNode (jeder Bildpunkt). An der Wiese (Ego, Wald nah) kostet sie nichts Messbares.
- Der Belegungs-Schnitt wirkt auch auf der GPU (−0,64 ms). Damit verdeckt er den Luft-Term in der Summe.
- Soll E 5,8: Genesis Third steht CPU-Takt p95 A 5,7 · 5,9 · 6,0, B 6,1 · 6,0 · 6,3.

## Rohpfade (OMEN `p3/n2110/buendel3/`, Auswertungen hier in `bericht/2110-buendel3-abab/`)
`serie.sh` · `fortschritt.log` · `gehen/<g-third|w-ego>-<A|B><n>-{steht,bank,geht-1,smi.csv,…}` · `auswertung-gehen.cjs` → `gehen/auswertung-gehen-<zelle>.md` ·
`bisekt/` und `bisekt2/` (`bisekt.sh`, `<seite><n>-{lauf,bank}.txt`, `-smi.csv`), Tafel `bisekt-tafel.txt` · `blick/<A1|B1>/uhr-{05,027}.png`, `blick/helligkeit.txt`.

Status ZWISCHENSTAND + Übergabe: Messung fertig, kein Schnitt.
