# Bericht 19.10. (Koordinator, Radeon 890M) — S6 und das Ankunfts-Paket selbst gemessen (der OMEN war stumm)

Status: ZWISCHENSTAND. Kopflos auf dem Hardware-Adapter (werkbank lauf, Tiere frei) bzw. --echt (boot-stage --kalt), GPU-Schloss.

## S6 Rudel-Verband (A = integ f27b04f0, B = A + rudel-verband 0716fa0a), je 4 frische Boots
| Ort | Frame p95 | CPU-Takt p95 | GPU p50 | VRAM | Kreatur-Phase |
|---|---|---|---|---|---|
| Genesis | 8,5 → 8,5 ms | 2,8 → 2,85 | 8,35 → 8,35 | 50,1 → 50,0 MB | 0,135 → 0,16 ms |
| Wiese | 8,5 → 8,5 ms | 3,0 → 2,85 | 8,4 → 8,35 | 50,0 → 50,0 MB | 0,135 → 0,16 ms |
Urteil: nicht langsamer → gemergt (integ 475a446a). GTX-ABAB fehlt (Auftrag 1810-omen-s6-abab steht).

## Ankunfts-Paket (A = integ 475a446a, B = ankunft-paket: Revert von ab97f0a8 + b5-lieferung 5c2a0247), kalt --echt
| | R1 | R2 | R3 | R4 | Median |
|---|---|---|---|---|---|
| A | 7,74 | 7,85 | 7,93 | 8,06 s | 7,89 s |
| B | 6,94 | 7,35 | 7,57 | 8,00 s | 7,46 s |
Bild der Ankunft A = B (gleich). Pflicht B (≤ 5 s) ROT. Zerlegung B (r2): Haupt-Faden 0–7 s je Sekunde 400–940 ms blockiert;
benannt Erst-Bau ~1,4 s gesamt, Streu ~0,44 s, Boden ~0,3 s, Bauten ~0,17 s; bei 4–5 s ~700 ms/s UNBENANNT — die nächste Linse.
Im Bild: rechts 3 m vor dem Auge die beige Grobstufe eines Tors (steht auch an main) — A am Spawn.
Lauf-ABAB des Pakets läuft (scratchpad ap-lauf).

## echt an f27b04f0 (Garage-Merge): 21/22, rot nur gate:analog-nah Selbsttest S „Rang des Wartenden false“ —
dieselbe Röte stand an main (bericht/1810-f6-gtx.md, A 5/5); Heilung liegt im Paket (7306712e).

## Nachtrag 04:00 — Lauf-ABAB des Pakets (Radeon, 4+4, Tiere frei)
Genesis: Frame p95 8,5 = 8,5 ms · CPU-Takt p95 3,05 → 2,8 · GPU 8,4 = 8,4 · VRAM 50 = 50. Wiese: 8,5 = 8,5 · 2,75 → 2,95 (Streuung
2,7–3,5) · 8,4 = 8,4 · 50 = 50. Urteil nicht langsamer → integ 2168ba10 (Baum = Paket-Baum, check + voller Playtest am Paket), V18.546.20 e99b66ab.
echt an 475a446a (S6): rot nur gate:foundry-impostor Teil C „die Welt lieferte in den Probe-Atlas (fichte|3, birke|2, eiche|2)“.
Befund der Linse (benannt, NICHT geschnitten): ihre Ruhe (`lieferungenLanden`) zählt nur Lieferungen im Flug — ein Zwilling von
`_weltSteht`; die Linsen-Welt tickt von Hand (`_gameLoopTick` in Teil A), 37 Wald-Pflanzungen warten (`_waldPflanzWarten`), Ruhe 0 —
`_weltSteht` direkt einzusetzen macht sie dauerhaft rot (lokal gemessen, zurückgenommen). Heilung: Teil C hält die Welt an (kein Takt,
keine Bestellung) statt auf Ruhe zu warten.
