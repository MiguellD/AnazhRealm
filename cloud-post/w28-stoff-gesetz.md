ABGABE ab6c476fd6da48a2455999c41bedfca31059139a

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
