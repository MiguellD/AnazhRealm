# Bericht 1610 G2 — Ankunft kalt auf der GTX: A = cee33f91 (merge-base) gegen B = 2d54d8b0 (ankunft-ofen)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16.10. (B, Pflicht-OFFEN): Wie viele Sekunden zahlt G2 „Dorf-Kette bis zur
EINEN Lade-Frist“ auf der GTX an B (Ziel ≤ 5 s, heute ~20 s)?

## Urteil

**G2 zahlt auf der GTX 0,75 s: t(Weltbild) = t(Kontrolle) 21,2 → 20,4 s (Δ −0,75, 2σ 0,66).**
- **Das Dorf verlässt den kritischen Pfad:** „das Dorf wird geplant“ ist zuletzt offen bei 16,5 → 12,5 s. Auf die Häuser des Dorfs
  wartet B nie mehr, A bis 17,6 s.
- **Danach trägt der Wald die Ankunft:** „Bäume und Bauten wachsen“ bei 19,6 s, Wald-Gestalt und ferne Bäume bei 20,2 / 20,0 s.
  Diese beiden kommen in B sogar 2–3 s später als in A (18,2 / 17,1 s).
- **Der Grund:** Der Haupt-Thread rechnet die Dorf-Arbeit jetzt früher bis zur Lade-Frist (blockiert 15,3 → 16,0 s). Der Wald
  rückt dahinter.
- **Folge für Ziel ≤ 5 s:** Die nächste Kette an B ist die Wald-Kette, also Wald-Stücke, die auf ihre Gestalt warten, ferne Bäume
  und Bauten.

| Boot | t(Weltbild) s | blockiert s | Pipelines (Erst-Bau s) | Dorf geplant bis | Dorf-Häuser bis | Bäume/Bauten bis | Wald-Gestalt bis | ferne Bäume bis | Horizont bis | Settlement da |
|---|---|---|---|---|---|---|---|---|---|---|
| A1 | 21,30 | 15,5 | 68 (3,2) | 16,9 | 18,3 | 21,3 | 18,3 | 17,3 | 15,5 | 12,9 |
| B1 | 19,89 | 16,1 | 69 (3,4) | 12,9 | — | 19,6 | 19,3 | 19,1 | 15,4 | 12,8 |
| A2 | 20,92 | 14,2 | 69 (3,1) | 16,3 | 16,6 | 20,8 | 18,0 | 16,9 | 13,3 | 13,0 |
| B2 | 20,81 | 15,2 | 68 (3,2) | 13,3 | — | 20,1 | 20,7 | 20,5 | 14,7 | 13,2 |
| A3 | 21,33 | 15,6 | 69 (3,3) | 16,5 | 17,3 | 21,3 | 18,3 | 17,9 | 13,8 | 10,0 |
| B3 | 20,71 | 15,8 | 69 (3,3) | 13,5 | — | 20,0 | 20,5 | 20,5 | 15,4 | 13,2 |
| A4 | 21,12 | 15,9 | 68 (3,5) | 16,5 | 18,3 | 21,1 | 18,3 | 16,5 | 14,6 | 9,9 |
| B4 | 20,25 | 16,6 | 69 (3,4) | 10,1 | — | 18,9 | 20,2 | 19,9 | 15,8 | 9,8 |
| **A Mittel** | **21,17** | 15,3 | 68,5 (3,3) | 16,5 | 17,6 | 21,1 | 18,2 | 17,1 | 14,3 | 11,4 |
| **B Mittel** | **20,42** | 16,0 | 68,8 (3,3) | 12,5 | — | 19,6 | 20,2 | 20,0 | 15,3 | 12,3 |

„bis“ = die letzte Probe, in der dieser Grund das erste Weltbild noch aufhielt (`_weltbildFehlt`, s ab Navigation); „—“ = nie.

**Kosten auf dem Haupt-Thread, Summe s (A → B):**
- Streu 1,9 → 1,5, Bauten 0,5 → 0,6, Boden 0,7 = 0,7, Gruppen-Bau 0,3 = 0,3.
- Ort-Wahl 0,2 → 0,3, Dorf (`_spawnSettlementSlot`) 0,1 = 0,1.
- Die Dorf-Kette selbst kostet auf der GTX also nur ~0,4 s. Auf der Radeon (7,4 → 0,6 s) streckte sie die 3-ms-Scheibe.

**Bild der Ankunft:**
- In 8/8 Boots kein halbes Weltbild. Die Linse meldet kein „steht ohne“, das Bild ist ganz: Boden, Wald, Dorf am Horizont, Himmel.
- Die Portal-Membranen in den Bögen stehen bei A in 1 von 4, bei B in 3 von 4 Ankunftsbildern (53–55 statt 48 Befehle). Das ist
  Zeit-Zufall am Rand, kein Term des Weltbilds.
- Beispiele: `A1.png` (ohne Membranen), `B1.png` (mit).

## Methode

- **Wer gegen wen:**
  - A = `git merge-base 2d54d8b0 origin/integ-probe` = cee33f91. B = 2d54d8b0, der letzte [ci voll]-Kopf; a41403b1 ist WIP [skip ci].
  - Spiel-Diff A → B: nur `stamm/08.js` (Ort-Wahl rechnet bis `_ladeFrist`) und `stamm/20a.js` (Slot-Zug bis `_ladeFrist`).
- **EIN Instrument:** die Linse von B (`diag-boot-stage.cjs` mit den Kosten „Ort-Wahl“ und „Dorf“) in beiden Bäumen (abab-g2a,
  abab-g2b), md5 gleich.
- **Boots:** `--kalt --echt --sek 180 --bild`, leeres Profil je Boot, 1920×1080. Folge A1 B1 … A4 B4, GPU-Schloss je Boot,
  45 s Pause.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-g2-ankunft/`.
  - je Boot `.json` und `.txt`, `auswertung.md` (alle Spalten), `serie.sh`, `auswertung.cjs`, die Bilder A1/B1.
  - Alle 8 Bilder auf dem OMEN unter `p3/k1610g2/`.
- **Vorschlag:** Wenn G2s Nachbesserung (a41403b1, „Kappen-Klasse an der EINEN Engstelle `_kappeOffen`“) einen [ci voll]-Kopf hat,
  messe ich ihn gleich gegen dasselbe A.
