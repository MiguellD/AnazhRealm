ABGABE 7e890b9d755e997108b776a44b12fa3ff459c8b5

## 11.11. 03:22 — GPU-PROBE 7e890b9d auf gtx1050-desktop: GRÜN in 739 s (gate:licht-weg:echt GRÜN 178 s auf gtx1050-desktop · bild:dorf@0.5 GRÜN 190 s auf gtx1050-desktop) → probe-post/w28-stoff-gesetz/7e890b9d.md

## 11.11. w28-stoff-gesetz (Cloud) — Abgabe 7e890b9d auf die Post z377 (zwei Wände)
- **Wand 1, `gate:kampf-gefuehl` halten.K2 Staffel 2:** lokal nachgestellt an ab6c476f ROT (642 / 649 / 405 Hz wie im Zug), main GRÜN (954 / 2179 / 192 Hz). Schnitt im Gesetz, `klang-core.js:1420` `trefferPaar`: wie laut und wie hell ein Partner singt, folgt aus BEIDEN Zeilen — der Pegel aus der Teilung der Stoß-Energie E*/Eᵢ (Hertz: der weichere Partner nimmt sie), die Teiltöne des freien Stabs aus dem Spektrum des Kontakt-Stoßes 1/(1 + (f/f_K)²). Am Kopf GRÜN: Stahl/Holz 607 Hz · Stahl/Stein 1008 Hz · Holz/Fleisch 46 Hz, kleinster Abstand 401 Hz; die Schwelle 300 ist unberührt.
- **Wand 2, LAUB-LICHT wasser:** kein Bruch im Spiel, der Spiegel verlor kein Laub. Die Stelle beim Namen: `scripts/lib/licht-linsen.cjs:1976` rief `AnazhRealm._wasserKoerper(Gesetz)` ohne die Brechzahl; mein Schnitt `stamm/bild-sicht.js:225` machte `n` (je Kanal, aus der Zeile wasser) zur Pflicht — der Aufruf warf, und `scripts/werkbank.cjs:3244` verschluckte den Wurf zu „kein Laub-Pixel“. Geheilt: die Linse reicht `r._wasserOptik().n` (dieselbe Zahl wie der Wasser-Stoff), die Werkbank trägt den Wurf als `fehler` (der vorhandene Helfer `ergebnis`, kein neues Linsen-Atom-Paket: Prüf +7).
- Lokal auf swiftshader, `werkbank licht --laub wasser --uhr 0.5 --eigen`: an ab6c476f ROT mit derselben Zeile wie die Karte · am Kopf GRÜN Weg/Welt 0,923 (main 0,92) · Mutante mit dem alten Aufruf ROT „Cannot read properties of undefined (reading '0')“. Gemessen ist damit 1 von 18 Zeilen der Wand (nur wasser@0.5, nur swiftshader) — die Probe `gate:licht-weg:echt` urteilt auf der Karte.
- Am Kopf 7e890b9d grün: `npm run check`, `npm run playtest:fast`, `npm run gate:welt-boot`, `npm run gate:kampf-gefuehl`, `gate:gegenstand-stoff` (GESETZ 82/82, 17 Stoffe), `gate:klang-zensus`. Wachstum Prüf +2494 / Spiel +3317.
- Mein Versäumnis: `gate:kampf-gefuehl` lief vor der ersten Abgabe nicht (steht nicht in `npm run check`), die Lichtweg-Linse ebenso wenig.

## 11.11. 00:31 — GPU-PROBE ab6c476f auf radeon-890m: GRÜN in 442 s (bild:dorf@0.5 GRÜN 84 s auf radeon-890m · bild:genesis@0.5 GRÜN 44 s auf radeon-890m · gate:wasser-leben:bild GRÜN 22 s auf radeon-890m) → probe-post/w28-stoff-gesetz/ab6c476f.md

## 11.11. w28-stoff-gesetz (Cloud) — neue Abgabe ab6c476f nach der Probe 8ebc2d5c
- `bild:buehne@0.5` ROT war nicht der Schnitt: `werkbank bild --ort buehne` wirft an main 4e2df19b genauso (lokal auf swiftshader an main und am Kopf nachgestellt: „Cannot read properties of null (reading 'get')“). Wurzel: `state.archInstanceGroups` ist an der Bühne null; zwei Stellen der Linse geheilt (`scripts/lib/kamera-nah.cjs:164`, `:231`), die dritte liegt in `stamm/siedlung-bauten.js:2714` (Datei von w28-stadt-grammatik, Wunsch in `cloud-post/w28-stadt-grammatik.md`) — bis dahin bleibt `bild:buehne` an jedem Zweig ROT.
- Darum die Proben des neuen Kopfs: `bild:dorf@0.5, bild:genesis@0.5, gate:wasser-leben:bild` (das Wasser urteilt auf echter GPU an seiner eigenen Bild-Wand).
- Am Kopf ab6c476f grün: `npm run check`, `npm run playtest:fast`, `npm run gate:welt-boot`; gate:ego-schatten auf swiftshader GRÜN (lief an 8ebc2d5c, Spiel-Baum unverändert). Wachstum Prüf +2487 / Spiel +3239.

## 11.11. 00:10 — GPU-PROBE 8ebc2d5c auf gtx1050-desktop: ROT in 320 s (bild:dorf@0.5 GRÜN 167 s auf gtx1050-desktop · bild:buehne@0.5 ROT 69 s auf gtx1050-desktop) → probe-post/w28-stoff-gesetz/8ebc2d5c.md

## 10.11. w28-stoff-gesetz (Cloud) — Abgabe 8ebc2d5c
- Zweig `w28-stoff-gesetz` (von main 4e2df19b), Stations-Zweig `w28-stoff-gesetz-pm` e487911 (breite.stoffe, Breite-Richter ohne Punkte; `punkte.cjs selbsttest --ohne 3c` 179/179).
- Gemessen: `node scripts/diag-gegenstand-stoff.cjs --gesetz` an main ROT 42/81 Leser auf der Zeile, 39 mit eigener Zahl, 0 Stoffe mit Licht + Bruch + Klang; am Kopf GRÜN 82/82, 17 von 21 Stoffen, Mutante ROT.
- Am Kopf grün: `npm run check`, `npm run playtest:fast`, `npm run gate:welt-boot`, gate:gegenstand-stoff (--tafel, --gesetz), gate:schmiede-contract, gate:brennglas-takt, gate:klang-zensus, gate:werkstatt-weg, gate:post-kette auf swiftshader (kein „[ERROR] STOFF“); gate:ego-schatten auf swiftshader lief bei der Abgabe noch.
- Vertrags-Akt, offen benannt: EIN Daten-Nachzug `spec/asset-contract/v1/golden/recipes.json` (flegel.fx.seil.rho 7850 → 7845,94: die Stahl-Dichte folgt der Misch-Regel), die Klingen-Goldens byte-exakt.
- Was das Bild zeigen kann (dorf@0.5, buehne@0.5): der Spiegel von Wasser und Eis trägt den Fresnel je Kanal aus n(λ) der Zeile (+1,5 % Rot bis +4,7 % Blau gegenüber f0 0,02) — mit dem Auge kaum zu sehen; kein Regenbogen gezeichnet (offen, in der Abgabe benannt).

## 11.11. 02:40 — z377 ROT an ZWEI Wänden, beide aus diesem Zweig (Koordinator) — bitte heilen und neu abgeben

Der Zug z377 fuhr w28-stoff-gesetz ab6c476f allein (Kandidat c21e3587, Lauf 42929702026, Neulauf ebenso rot — kein Wackler).
An z375/z376 (gleiche Basis main 4e2df19b, ohne diesen Zweig) standen beide Wände grün.

1. **voll 9/18 · `npm run gate:kampf-gefuehl` · Q11 halten.K2 Staffel 2** („Klang und Funken aus dem Stoff-Paar am Bus“):
   `ROT stahl/holz ≈ stahl/stein · holz/fleisch ≈ stahl/holz · holz/fleisch ≈ stahl/stein` — gemessen stahl/holz 642 Hz −30 dB
   Funken 0 · stahl/stein 649 Hz −29 dB Funken 24 · holz/fleisch 405 Hz −41 dB. Seit der Klang die Stoff-Zeile liest, klingen die
   Paare zu gleich (Stahl trägt beide). Die Linse will unterscheidbare Paare (scripts/diag-kampf-gefuehl.cjs:486 nennt die
   Schwelle). Schnitt im Gesetz (der Klang des PAARS aus beiden Zeilen), nicht an der Schwelle.
2. **echt omen · „Lichtweg auf der Karte“ · LAUB-LICHT**: `LAUB-LICHT wasser@0.5 / @0.27 / @0.05: keine Messung (kein Laub-Pixel)`.
   Feld und Panorama stehen im Band (Karte 0,94–0,97); am Wasser findet die Linse nach deinem Fresnel je Kanal kein Laub-Pixel
   mehr im Spiegel. Entweder der Spiegel verlor das Laub (Bruch im Spiel) oder die Linse klassiert die neue Spiegel-Farbe nicht
   mehr als Laub (dann die Klassierung am Gesetz ausrichten, nicht aufweichen). Du hast keine GPU: bitte die Stelle im Code beim
   Namen nennen und im Abgabe-Betreff `[gpu-probe: gate:licht-weg:echt, bild:dorf@0.5]` tragen — die Probe misst es auf der Karte.

Vor der Abgabe am Kopf grün: `npm run gate:kampf-gefuehl`. Neuer Kopf mit „Abgabe w28-stoff-gesetz: …“; der Dienst nimmt ihn von selbst.
Beachte die Wachstums-Wand des Tages: sie steht am Rand (Prüf 6923 / Spiel 13412) — Heilung möglichst ohne neue Linsen-Atome.
