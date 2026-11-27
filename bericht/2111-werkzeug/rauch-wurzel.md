# rauch-nan · Wurzel (Zwischenstand 27.11., main eef726c7, headless im vm-Wirt `scripts/lib/stamm.cjs grundWirt`)

## Geburt: headless NICHT gefunden — ausgeschlossene Kandidaten (an der Quelle gelesen)
- f.x/f.z einer Flamme: nur gesetzt nach `sicht(x, z)` → `drin` (stamm/feld-brand.js:809, :848) — NaN fällt dort durch, die Flamme steht nie. Ein Ballen wird also endlich GEBOREN (x: f.x, :1066).
- `h % (q.bis - q.von)` (:1053): `qu` bekommt eine Zelle nur mit `fl.length > n0` (:975), die Spanne ist ≥ 1.
- Höhe `p.y - p.g` (:1084): `windProfil` (phyto-core.js:5308) wirft bei nicht-endlich mit EIGENEM Text („die Höhe ist endlich“) — der Befund trägt den Text von wetterFeldAm, also war p.y endlich, als p.x kippte.
- zeitloser Takt: `s` (:1025) ist immer endlich (0 bei dt ≤ 0).
- bleibt rechnerisch NUR `p.x += w.x * w.ms * s` (:1086) mit nicht-endlichem `w.ms`/`w.x` aus `wind(p.x, p.z)` (:897 → `_windAt`, stoff-material.js:370) an ENDLICHEM Ort — dort werfen windForm (gelaende-core.js:3141) und boeTempo (phyto-core.js:7532) selbst; offen: `wf.wind`, `_windWob`, `boe` (`_boePhase`), `g.x`/`g.f` (`_gassenWind`, fachwerk-core.js:13907).

## Reproduktion (fünf Zeilen) — alle 0 nicht-endliche Ballen, 0 Würfe
1. `_windAt` über 4 281 Orte × Uhren 0 … 1e7 samt Sprung 45 615 → 53 (r5/r6): 0 nicht-endlich, auch nach `lava` im Wirt.
2. Brand (41, 11) 40 s, Raffer auf 45 615 mit zeitlosen Takten, Rücksprung auf 53, 3 000 Takte (r2 ab/a/b/n): 0.
3. Lava (57, 11) zündet 8 Akte → 25 Zellen, 3 600 Takte, jeder dritte zeitlos (r7): 148 Ballen, 0.
4. Brand + Lava, Brand-Uhr 20 000 s per `_weltUhrNimm`/`_tickBrand` (wie g1.js:1787), dann zurück bzw. weiter, 4 000 Takte (r8): 0.
5. Skripte: dieses Verzeichnis, r2.cjs · r5.cjs · r6.cjs · r7.cjs · r8.cjs (NODE_PATH=…/AnazhRealm-profiband/node_modules, je < 60 s).

## Schnitt: KEINER (ohne Geburt wäre jeder Schnitt ein Wächter = fail-soft, verboten)

## Sonde für den Hand-Lauf am Gerät (Koordinator: in die Seite NACH dem Boot, VOR der Probe — die Geburt fiel in der Probe oder an ihrem Ende)
Datei: `sonde.js` in diesem Verzeichnis (liest nur; `window.anazhRealm` wie scripts/lib/welt-boot.cjs). Danach `window.__rauchGeburt.fall`
lesen: `wo` ∈ {bei der Geburt · im Zug · zwischen zwei Bildern (ein anderer Schreiber) · _windAt am endlichen Ort} samt Stand vorher,
qu, Flammen und den Gliedern von `_windAt` (wf · wob · boe · form · gasse) an seinem Ort.
Selbsttest headless (r10.cjs, je 1 500 Takte, Pflanze an Takt 900): ohne Pflanze fall null, 0 Würfe; `_windWob` → NaN: „_windAt am
endlichen Ort“, glieder.wob null (die anderen endlich), 599 Würfe in 600 Takten; ein Ballen x = NaN von außen: „zwischen zwei Bildern“,
600 Würfe in 600 Takten — beide Pflanzen frieren die Welt wie am Gerät (jeder Takt in der Fehler-Grenze).

## Melder (Nebenbefund): NICHT an einer Stelle
`_bruchMelden` (stamm/dienst.js:578) schlüsselt den vollen Text. Eine Drossel ohne Ziffern bräche zwei Leser, die Ziffern im Schlüssel
TRAGEN: scripts/lib/kreatur-mensch.cjs:43/:240 (EINE Bruch-Zeile je Bewohner und Ort, gezählt je Text) und scripts/diag-werkstatt-weg.cjs:926
(zählt „Laube18“ in den Schlüsseln). Offen mit Adresse: FUND-REGISTER (Zweig koordination), Messname „Meldungen je Sekunde bei wechselnder Zahl im Text“.
