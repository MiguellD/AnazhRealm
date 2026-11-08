# Post an w25-spike-gpu-vegetation

## 08.11. 22:28 — Abgabe w25-spike-gpu-vegetation (Arbeiter)
ABGABE 6037f5e3f37ee6bc3fbad7df732dd9b8edd5c3f6

Urteil JA — die Wahl der Vegetation gehört auf die GPU; der Spike landet nicht.
- Geschnitten: hinter dem Messort-Schalter `state.wahlGpuWiese` wählt der EINE Compute der Pass-Wahl (`stamm/bild-kosten.js` `PASS_WAHL_WGSL`, `_wahlRechnen`) die Gruppen der Wahl samt Fenster der Stufe und Kugel der Karte (`_instanzWahlPass` schaltet sie lose in ihre Arena) und die Nähe der Nah-Wiese als Bestand mit Stufen-Band im Bildschirm-Maß (`stamm/vegetation-wiese.js` `_tickNahWiese`, `_nahWieseSicht`), gezogen per `drawIndexedIndirect`; dazu EIN Leser jedes Instanz-Attributs am Listen-Index (`stamm/stoff-instanz.js` `_senkenKnoten().attribut`).
- Gemessen (Radeon 890M, Mess-Wiese Ego, Bahn 4 m/s, ABAB, Probe a8bf76c8, Mittel/p95 ms): `_instanzWahlPass` 3,7/11,4 → 0,43/0,6 · `_passSicht` 10,0/26,8 → 8,2/15,1 · Arena der GPU-Wahl 0,02 → 1,05/1,65 · Takt p95 45 → 40 · Compute 0,045/0,06 ms für 3 262 Instanzen; Zähler headless an derselben Lage: Gruppen 376/376 von 1 010, Nähe 215/214; Bild ABNAHME GRÜN.
- Ehrlich offen: Bild gegen A an derselben Pose 2,0 % der Pixel ΔLuma > 18 (A gegen A 0,02 %), Pop-Treue in B bricht um 109–128 Bytes (atomare Verdichtung ordnet je Bild anders, der Nähe fehlt die Hysterese) · GTX: Probe 0a91947 gestoßen · Ferne und Streu wählt weiter die CPU (2,4–2,7 ms) · `renderer.info` zählt in der GPU-Wahl die Obergrenze.

Nächster Schnitt (Atlas Schnitt 2; Haar/Aaltonen 2015, Wihlidal 2016, Ghost of Tsushima): `_instanzWahlArt` → „gpu" für jede globale Gruppe; Verdichtung je Glied deterministisch (Präfix-Summe statt atomicAdd); Nähe je Kachel-Block (Daten nur bei Geburt/Tod) mit `_nahStufe` als Zustand; Ferne über `_wieseFern` als WGSL derselben Algebra; der Takt der Arena O(Züge); es fallen `_instanzWahlPass`, `_instanzWahlWeg`, Bündel `@wahl`, `_nahWieseSicht`, `_nahWieseFernSatz`. FUNDe im Commit 6037f5e3.

## 08.11. 22:20 — GPU-PROBE a8bf76c8 auf radeon-890m: GRÜN in 932 s (gate:pop GRÜN 196 s · bild:wiese@0.5 GRÜN 74 s) → probe-post/w25-spike-gpu-vegetation/a8bf76c8.md

## 08.11. 21:54 — GPU-PROBE 54c39718 auf radeon-890m: NACHGEGEBEN in 354 s (gate:pop NACHGEGEBEN 91 s · bild:wiese@0.5 NACHGEGEBEN 4 s) → probe-post/w25-spike-gpu-vegetation/54c39718.md

## 08.11. 21:40 — GPU-PROBE 4e918922 auf radeon-890m: ROT in 424 s (gate:pop ROT 161 s · bild:wiese@0.5 GRÜN 69 s) → probe-post/w25-spike-gpu-vegetation/4e918922.md

## 08.11. 21:19 — GPU-PROBE 047129cf auf radeon-890m: GRÜN in 428 s (gate:pop GRÜN 138 s · bild:wiese@0.5 GRÜN 56 s) → probe-post/w25-spike-gpu-vegetation/047129cf.md

## 21:37 Koordinator
FUND aus dem Referenz-Atlas: `stamm/bild-kosten.js:3233` — die GPU-Wahl gilt nur für aGang (profiband.K2). Atlas Schnitt 2 (`REFERENZ-ATLAS.md` §2) verlangt EINE GPU-Wahl für jede globale Instanz-Gruppe. Nimm das in deinen Spike auf, Brief-Baustein (f) wörtlich.
