# Bericht 2210 ABAB ruhe: A main e5003509 (V18.546.59) gegen B integ-probe c0151abb (V18.546.60 = + naesse-kosten + welt-ruhe + ci-deckung + CI-Zeiten), GTX, 22.10. 07:38–08:29

**Urteil: nicht langsamer an Genesis Third und Wiese Ego.** Die knappe Wiese-Ego-Zelle ist auf n = 4 erweitert (Regel 3) und dort in allen 9 Kerngrößen nicht langsamer. Im Regen bestätigt sich naesse-kosten über Boots: **GPU −0,7 ms Durchsatz, −1,37 gpu-bank**.

- **Genesis Third (2+2), Kerngrößen nicht langsamer:**
  - steht: CPU-Takt p95 5,8 = 5,8 (A 5,7 · 6,0, B 5,8 · 5,9) · gpu-bank 11,27 → 11,62 (2σ 0,41) · Belegung p95 7,50 → 7,47 · Frame p95 16,8 = 16,8.
  - geht: CPU-Takt p95 20,1 → 20,4 (2σ 1,6) · Frame 25,1 = 25,1 · Belegung 22,4 → 22,7.
  - Formal über 2σ nur die Nebengröße GPU-Durchsatz gehend 14,70 → 15,10 (+0,40, 2σ 0,28); die gpu-bank im Stand bleibt im Rauschen.
- **Wiese Ego (4+4), alle 9 Kerngrößen nicht langsamer:**
  - steht: CPU-Takt p95 4,5 → 4,4 · gpu-bank 12,57 → 12,20 (A 13,53 · 11,72 · 12,98 · 12,05; B 12,06 · 12,04 · 12,52 · 12,19) · Belegung 6,21 → 6,13 · fps 77,8 = 77,8.
  - geht: CPU-Takt p95 19,4 → 19,6 (2σ 1,0) · Belegung p95 22,47 → 22,93 (+0,46, 2σ 0,53, t 2,4 — nah an der Grenze, benannt) · Frame 25,1 = 25,1.
  - Im ersten Paar sah es knapp aus (gehend CPU +0,6, Belegung +0,63); A3/A4 und B3/B4 nahmen es zurück.
  - k0 oben/unten wechselte in beiden Seiten (A 0,62 · 0,62 · – · 0,26, B 0,26 · 0,61 · – · 0,62): Sitzungslage, nicht die Seite. Das schließt den Verdacht aus dem naesse-ABAB.
- **Wiese Ego im Regen nach 10 min (2+2):**
  - GPU-Durchsatz p50 **13,40 → 12,70** (A 13,6 · 13,2, B 12,7 · 12,7; t −3,5) · gpu-bank **13,35 → 11,98** (A 12,89 · 13,80, B 12,13 · 11,82) · fps **75,4 → 78,1**.
  - CPU-Takt p95 4,3 → 4,4 (2σ 0,8) · Belegung 6,13 → 6,22 (2σ 0,87).
  - Der Nässe-Preis des Dach-Pools fällt also auch über Boots, nicht nur in der einen Welt.
- **Takt/Drossel:** je Zelle zwischen den Seiten gleich (Takt-Tabellen in den Auswertungen).

Weg: Instrument werkbank aus B (c0151abb), je Boot frische Sitzung `--echt` 1920×1080, Regler voll, Tiere frei.
- steht: `lauf 30 --ein 20 --ruhe 300` + `gpu-bank 12 --runden 5`; geht: `lauf 30 --ein 2` (Geher 4 m/s).
- Regen: `regen.js` hüllt die Bühne in {rainy, naesse 600}; das Wetter stand vor und nach jedem Lauf auf rainy.
- Schloss je Boot, Nachtruhe; ein CI-echt-Job lief vor A1 mit Vorfahrt. Seiten-Wache nie rot, Bäume sauber.

Roh: OMEN `p3/n2210/ruhe/gehen/`; Auswertungen hier in `bericht/2210-abab-ruhe/`.

Status ZWISCHENSTAND + Übergabe: Die ABAB ist fertig.
- Leib K1 St. 2 hieb: `werkbank latenz --verb gehen,wechsel,hieb` hing an e5003509 (25 min ohne Ausgabe ab 06:48); ich habe abgebrochen.
- Als Nächstes untersuche ich das mit wenigen Proben `--verb hieb` unter Zeitdeckel.
