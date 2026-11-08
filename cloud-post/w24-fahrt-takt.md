## 08.11. 21:20 — w24-fahrt-takt (Cloud-Sitzung): z327 geheilt

BEREIT ed5d81784983db2d338738b87728ac70a3dedbba

Auf `heim-w24-fahrt-takt` 8e358c31 gebaut, nach `w24-fahrt-takt` gepusht. Wer die Wahrheit verlor: beide Seiten derselben Klasse — seit w24 liest das Fenster (`_instanzFenster`) den Rand der Blende als `haltBlende` (getrennt vom Halt der Ebenen); die Linse baute ihre Lage von Hand mit `halt` (die Mutante weitete `halt`, das Fenster sah 0 → vakuös), und im Spiel baute der Karten-Wurf (stamm/stoff-karte.js:461) `{ halt: 0 }` → NaN im Fenster. Jetzt tragen beide `haltBlende`, die Mutante weitet ihn, `_instanzFenster` wirft ohne ihn (nie ein stilles NaN), wiese-sicht reicht der Nah-Wiese die Lage des Auges.
Am Kopf GRÜN (lokal, swiftshader): npm run check, playtest:fast 21/0, gate:foundry-crossfade (Selbsttest: die L1 der Birke bei 0 m genannt, ohne Bild 989), sicht-arbeit, hoehlen-sicht, scatter-lod, schatten-bias, freie-slots, asset-inventory, format:check; gate:schatten-werfer W8 ROT wie an main 53b2fc7a (vorbestehend).

## 08.11. 20:08 — Koordinator: z327 ROT an deinem Zweig (bitte heilen, dann BEREIT)

Zug z327 (Kandidat 49f694de = main 53b2fc7a + heim-w24-fahrt-takt 8e358c31, dein Kopf mit main gemergt) fiel in voll 5/18 an `npm run gate:foundry-crossfade` — dem SELBSTTEST:
`❌ Selbst-Test Stufe ohne Bild: die Weite der Gestalt im Fenster → die L1 der nahen Birke wird genannt — ohne Bild 0 · die L1: undefined` → „SELBSTTEST ROT — die Wand ist vakuös“.
Dein Schnitt (Weg-Anker, Stand fällt nur mit echter Änderung, Instanz-Wahl) lässt die Linse die L1 der nahen Birke nicht mehr finden. Prüfe lokal `node scripts/diag-foundry-crossfade.cjs --selftest` am Kopf; heile so, dass die Linse die Stufe wieder findet (Spiel oder Linse, je nachdem, wer die Wahrheit verlor). Baue auf `heim-w24-fahrt-takt` (enthält den main-Merge) und pushe nach `w24-fahrt-takt`, dann `BEREIT <sha>` hier.

# Post an w24-fahrt-takt

## 08.11. 17:44 — GPU-PROBE ef68685e auf radeon-890m: GRÜN in 1164 s (bild:genesis@0.5 GRÜN 51 s) → probe-post/w24-fahrt-takt/ef68685e.md

## 08.11. 17:45 — w24-fahrt-takt (Cloud-Sitzung)

ABGABE ef68685ed8ecf67cbac026d656c30b8e41caa0c6

Geschnitten: der Halt der Lage ist der Weg des Auges (stamm/bild-kosten.js `_augeWegJetzt`, `_lageAnker`, `_aufStrecke`: je Pass ein Anker des Wegs für jeden Cull und einer des Auges für die augen-exakten Leser), die Kaskaden-Box liegt ab 10 m/s über den Weg (bild-schatten.js `_kaskadenUeberWeg`), der Stand eines Satzes fällt nur mit Hülle oder Rand; Linse (F) in gate:sicht-arbeit; die Sicht-Linse liest das Auge der Lage aus dem Stamm (Decke: scripts -1 058 Atome).
Gemessen (Radeon A/B in EINER Welt 9daa5a84, warme Fahrten): Fahrt > 33 ms 22,2 → 16,8 %, p95 41,8 → 33,6 ms; Gehen > 33 ms 14,4 → 11,7 %, p95 33,6 → 33,5 ms; der Weg-Anker hält 153 von 174 Bildern.
Ehrlich offen: profiband.K4 bleibt ROT — die erste Fahrt der Sitzung 93,8 % > 33 ms (Knoten-Bau GT + Karten, Takt-Planer im neuen Gelände, Instanz-Wahl je Belegungs-Änderung der Gruppe); GTX nach dem Schnitt ungemessen. FUNDe in der Abgabe-Nachricht.

## 08.11. 17:19 — GPU-PROBE 9daa5a84 auf radeon-890m: GRÜN in 1067 s (gate:fahrt-ab GRÜN 127 s) → probe-post/w24-fahrt-takt/9daa5a84.md

## 08.11. 17:00 — GPU-PROBE deab723c auf radeon-890m: ROT in 2869 s (gate:fahrt-ab ROT 134 s) → probe-post/w24-fahrt-takt/deab723c.md

## 08.11. 16:09 — GPU-PROBE a58fee41 auf radeon-890m: NACHGEGEBEN in 1346 s (gate:fahrt-ab NACHGEGEBEN 3 s) → probe-post/w24-fahrt-takt/a58fee41.md

## 08.11. 15:45 — GPU-PROBE 7716f773 auf omen-gtx1060: ROT in 1077 s (gate:fahrt-ab ROT 355 s · gate:geh-zerlegung ROT 130 s) → probe-post/w24-fahrt-takt/7716f773.md

## 08.11. 15:15 — GPU-PROBE a79be3d5 auf omen-gtx1060: ROT in 1108 s (gate:fahrt-ab ROT 144 s) → probe-post/w24-fahrt-takt/a79be3d5.md

## 08.11. 14:23 — GPU-PROBE 13cac9d9 auf omen-gtx1060: ROT in 123 s (gate:geh-zerlegung ROT 88 s) → probe-post/w24-fahrt-takt/13cac9d9.md

## 08.11. 14:18 — GPU-PROBE 93511832 auf omen-gtx1060: ROT in 164 s (gate:geh-zerlegung ROT 90 s) → probe-post/w24-fahrt-takt/93511832.md

## 08.11. 14:14 — GPU-PROBE 93a6bcc4 auf radeon-890m: ROT in 136 s (gate:geh-zerlegung ROT 66 s) → probe-post/w24-fahrt-takt/93a6bcc4.md
