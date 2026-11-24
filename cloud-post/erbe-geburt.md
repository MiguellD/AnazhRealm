# erbe-geburt — ZWISCHENSTAND (Übergabe)

Zweig `erbe-geburt` (von main `a615ab5d`), Code-Stand `5aa0b6272` + dieser WIP-Commit (Liste der Mess-Leser, dieser Bericht).
Stationen: `pm-erbe-geburt` `0cf308d97`. Cloud ohne GPU: alles headless (Null-Renderer) — keine GPU-Probe, keine Run-ID.
Karte 2 gebucht 58 von 1 718.

## Je Sprosse (Station headless, vorher a615ab5d → nachher Kopf)
- `karte2.leben.evolution.erbe#1`: ROT → **GRÜN** — 2b 0,554 (Soll 0,2–0,8), 13 Gen. (≥ 10), Mutante b −0,027 ± 0,017, 4 318 Paare.
- `karte2.leben.evolution.zivilisation#1`: ROT → **GRÜN** — r(Eltern, Kind) Scheu 0,20, Mutante −0,038; Flucht mit − ohne Wolf +20,33 m.
- `karte2.leben.evolution.muster#1`: ROT → ROT — Gegenlauf +0,034 ✓ (Wolf −0,070, ohne −0,036), 20 Gen. gegen Soll ≥ 10³ ✗.
- `karte2.leben.evolution.stammbaum#1`: ROT → ROT — 7 Arten gegen Soll ≥ 10, 0 mit Ahn, 0 ausgestorben.

## Linsen am Kopf
- `gate:kreatur-takt --proben kaskade --selftest` GRÜN: Grund grün, 9 von 9 Tätern rot beim Namen (neu `kaskade-geburt`, Geburt × ¼).
- Kaskade 40 Saaten, Fenster zu 8: main 5 von 5, Kopf 5 von 5 grün (vorher main 4 von 5 ROT); fremde Leiber main 6 → 0.
- `--proben erbe,muster` GRÜN · `diag-kreatur-leben.cjs` GRÜN · `npm run check:statik` GRÜN · `diag-atlas --check` GRÜN.
- Geburt im Gau: −5,7 % → −0,79 % (Saaten 3–8, `EIGNUNG_EICH`); der ganze Gau Reh −1,1 %.

## Offen (Adresse · Leser)
- muster#1 — 10³ Generationen: Probe muster (`scripts/diag-kreatur-leben.cjs`) am Takt des Gaus, rafft ≈ 20 je Lauf (≈ 104 000 Takte nötig).
- stammbaum#1 — 10 Arten mit Ahn/Aussterben: `tetrapoda-core.js` `GATTUNGEN` (7 Arten, kein Baum des Samens).
- Das Erlebnis der Scheu am Gerät: Station zivilisation#1 an der GTX (`stamm/kreatur-furcht.js` `_kreaturFluchtDistanzM`).
- `werkbank abdruck --gegen a615ab5d` nicht gefahren (kein Gerät).

## Der nächste Handgriff
Commit „Vorprüfung erbe-geburt 1: … [ci voll]“ auf diesem Stand (Rumpf ≤ 600 Z.), CI lesen; Stationen `pm-erbe-geburt` buchen lassen.
