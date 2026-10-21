# Bericht 2110 das EINE ABAB für den main-Vorlauf: A main d3a626ee gegen B integ 1011d41d (V18.546.47 = + Belegungs-Fertigsteller, Ufer-Warte, gehen-takt, e-bauart, ruhe-karten), GTX 2+2, 21.10.

**Urteil:** Wiese Ego ist in allem nicht langsamer. Genesis Third ist in Frame, fps, GPU und gehend nicht langsamer; stehend reißen CPU-Takt p95 und Belegung p95 formal die 2σ-Grenze.
- **Genesis Third steht:**
  - CPU-Takt p95 5,5 → 5,8 (A 5,5 · 5,6, B 5,7 · 5,9; +0,3, 2σ 0,2, t 2,2) — formal LANGSAMER.
  - Belegung p95 7,06 → 7,30 (+0,24, 2σ 0,21) — formal LANGSAMER.
  - gpu-bank 11,43 → 11,24 (−0,19), Frame p95 16,8 ↔ 16,8, fps 80,6 ↔ 80,6.
  - Soll 5,8: A 2/2, B 1/2.
- **Genesis Third geht:** Frame p95 25,1 ↔ 25,1, CPU-Takt p95 18,9 → 20,3 (2σ 3,1), Belegung 21,5 → 22,1 (2σ 3,0) — nicht langsamer.
- **Wiese Ego:**
  - steht: CPU-Takt p95 4,5 → 4,3, gpu-bank 11,82 → 11,72, Belegung 6,21 → 6,03.
  - geht: CPU 18,9 → 18,6, Frame 25,1 ↔ 25,1.
  - Alles nicht langsamer. k0 in allen Boots „unten“.
- **Ehrlich:**
  - Bei n = 2 ist die gepoolte Streuung eng. Die Boot-Streuung genau dieser Zelle lag heute bei 5,5–6,3 (Serie 2: 5,7–6,2).
  - Das +0,3 liegt darin, ist aber nicht ausgeschlossen. Ein drittes Paar würde es entscheiden; es ist laut Budget-Halt nicht gefahren.

Weg: Instrument B (werkbank 1011d41d, misst die Belegung je Lauf; methoden: keine fehlende), je Boot frische Sitzung `--echt` 1920×1080, Regler voll, Tiere frei; steht `lauf 30 --ein 20 --ruhe 300` · `gpu-bank 12 --runden 5` · geht `lauf 30 --ein 2` (Geher 4 m/s). Gestartet nach integ-CI 39614141577 grün. Seiten-Wache nie rot, Bäume sauber.
Rohpfade: OMEN `p3/n2110/abab5/`, Auswertungen hier in `bericht/2110-abab-main/`.

Status ZWISCHENSTAND + Übergabe: Messung fertig. Die OMEN hält an (Budget), Übergabe in `Desktop/AnazhRealm-OMEN/UEBERGABE-OMEN-2110.md`.

## Nachtrag 21.10. ~17:40: Genesis Third stehend auf n = 4 (zwei Paare mehr) und der Täter beim Namen
- **CPU-Takt p95:** 5,6 → 5,8 (A 5,5 · 5,6 · 5,6 · 5,7, B 5,7 · 5,9 · 5,8 · 5,8; +0,2, 2σ 0,2, t 3,5). Das ist ein kleines, aber stetiges Minus. Soll 5,8: A 4/4, B 3/4.
- **Belegung p95:** 7,14 → 7,26 (2σ 0,26), nicht langsamer. Außer Takt 0,73 → 0,71 gleich. Das Mehr liegt im Takt.
- **gpu-bank:** 11,29 → 11,23, gleich.
- **Täter** (`werkbank takt 20 --wandern aus`, EINE Sitzung je Seite, die p95-Takte je Methode, `takt-diff.txt`):
  - **`AnazhRealm._diaetRefresh` Spitze 0,53 → 0,72 ms (+0,19)**, Mitte 0,44 → 0,49, darüber `o.needsRefresh` +0,14. Das ist der Pfad des e-bauart-Registers in den schweren Takten.
  - Sitzungs-Terme ohne Code-Bezug: `updateCreatures` nur an B (0,36, Tiere nah), `_arenaTakt` nur an A (0,27).
  - `_weltSteht` (ruhe-karten) erscheint nicht.
  - Hinweis: Den Befehl `werkbank profil` gibt es am Kopf nicht mehr, `takt` ist sein Nachfolger.

## Koordinator-Entscheid 21.10. abends
main d3a626ee → 32b37933 (Spielcode = 1011d41d; danach nur albedo-frische, latenz, CI-Zeiten — scripts/spec und ?v=). Bewusst trotz
Genesis Third STEHEND CPU-Takt p95 +0,2 ms (n = 4, t 3,5): kein Täter beim Namen (e-bauart-spitze: die Spitzen-Takte sind takt-weit
~1,4× langsamer, kein Diät-Term), Wiese Ego schneller (steht 4,5 → 4,3, geht 18,9 → 18,6), Frame/GPU/Belegung nirgends langsamer.
Das Minus steht benannt unter PFLICHT E (Soll 5,8: B 3/4) und ist der erste Posten der E-Karte der neuen Woche (takt-weite Spitzen).
