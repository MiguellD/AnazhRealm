# Post an w25-spike-gpu-vegetation

## 08.11. 22:48 — GPU-PROBE 6037f5e3 auf radeon-890m: GRÜN in 1251 s (gate:ego-schatten GRÜN 50 s · bild:wiese@0.5 GRÜN 57 s) → probe-post/w25-spike-gpu-vegetation/6037f5e3.md

## 08.11. 22:39 — GPU-PROBE 0a919477 auf radeon-890m: GRÜN in 715 s (gate:pop GRÜN 187 s) → probe-post/w25-spike-gpu-vegetation/0a919477.md

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

## 22:36 Koordinator
Spike-Urteil JA ist angenommen. Die Zahl trägt: _instanzWahlPass 3,7/11,4 → 0,43/0,6 ms, _passSicht p95 26,8 → 15,1 ms, Takt p95 45 → 40 ms (Radeon, ABAB). Der Spike-Zweig fährt NICHT. Grund: Der Schalter `state.wahlGpuWiese` ist ein Flag und damit ein Zwilling. Außerdem weicht das Bild in 2 % der Pixel ab, und die Pop-Treue bricht.

**Nächster Auftrag, der Bau: Atlas Schnitt 2 · EINE GPU-Wahl für jede Instanz.** Zweig `w25-gpu-wahl` von origin/main. Lies vorher die GOLDENE DEFINITION und übernimm `REFERENZ-ATLAS.md` §2 (f) wörtlich. Deinen eigenen „Nächsten Schnitt“ baust du vollständig:
- `_instanzWahlArt` gibt „gpu“ für JEDE globale Gruppe. KEIN Schalter. Im selben Commit fallen `_instanzWahlPass`, `_instanzWahlWeg`, das Bündel @wahl, `_nahWieseSicht` und `_nahWieseFernSatz`.
- Die Verdichtung wird deterministisch (Präfix-Summe statt atomicAdd). Beweis: Bild byte-gleich A↔A an derselben Pose, Pop-Treue ohne Bruch.
- Die Nähe wird je Kachel-Block geführt, Instanz-Daten nur bei Geburt und Tod. `_nahStufe` ist Zustand mit Hysterese.
- Die Ferne läuft über `_wieseFern` als WGSL aus derselben Algebra. Ferne und Streu verlassen die CPU (heute 2,4–2,7 ms).
- Dein FUND renderer.info: profiband.K3 liest die Zahl der GPU (Rücklesen des Auftrags-Puffers).
- Der FUND aus dem Referenz-Atlas `bild-kosten.js:3233` (die GPU-Wahl gilt nur für aGang) ist damit eingeschlossen.
- Richter: profiband.K2 und gate:geh-zerlegung. Ziel `_passSicht` ≤ 2 ms laut Atlas. Die GTX misst über den Probe-Dienst.
**Reihenfolge der Hände:** `stamm/bild-kosten.js` bekommt in z331 den Umzug der Erst-Zeichnung nach `stamm/bild-erst.js` (w25-pipeline-vorwaermen), `vegetation-wiese.js` in z329 den Ruhe-Fix. Arbeite jetzt von main los und mische main ein, sobald z331 gelandet ist. Fasse die Erst-Zeichnung nicht an.

## 05:15 Koordinator
ABGABE 757f9f43 ist inhaltlich angenommen. Das ist der große Schnitt: `_passSicht` p95 20,5 → 7,8 ms, Bild p95 41,8 → 33,3 ms, Bilder > 33 ms 76/129 → 11/180, scripts −10 503 Atome. Er mischt sauber auf main und mit z338. Er fährt im nächsten Zug, sobald deine Probe (gate:pop, bild:wiese, gate:ego-schatten) da ist und ich das Wiesen-Bild gegen main gelegt habe. Er ändert jede Pflanze im Bild.
**Nächster Auftrag im selben Faden:** `used in submit while destroyed` in 2 von 8 frischen Boots. Benenne den Täter und schneide ihn. Ein GPU-Validierungsfehler darf nicht im Spiel bleiben. Danach `_passSicht` Mitte 3,0 → ≤ 2 ms (`_chunkSatzPass` und `_wahlVor`→`_auftraege`).

## 05:22 Koordinator — Konflikt mit w24-wiese-ferne-y
`w24-wiese-ferne-y` (z339) und dein Zweig kollidieren in `stamm/daten.js`. Beide fassen wahrscheinlich `NAH_WIESE.fern` an (`kachelnJeTakt` fällt dort). Nach der Landung von z339 mische main ein, behalte die Frist von wiese-ferne-y und deinen GPU-Teil, und schreib `BEREIT <sha>`. Deine Bilder lege ich dann gegen main.

## 05:40 Koordinator — Probe 757f9f43 auf der GTX ROT: Fehler der Welt
`probe-post/w25-gpu-wahl/757f9f43.md`: **gate:pop ROT und gate:ego-schatten ROT**, beide an `[welt-boot] ROT — 5 Fehler der Welt`. Die Linse von ego-schatten selbst ist GRÜN (grob 776 px, fein 771 px). Das bild:wiese ist GRÜN. Ich halte das für deinen offenen Validierungsfehler „used in submit while destroyed“, der auf der GTX offenbar jedes Mal kommt, nicht nur in 2 von 8 Starts. Lies die fünf Fehler im Lauf (Link im Bericht) und benenne den Täter. Ein Puffer der Wahl wird zerstört, während ein Submit ihn noch hält. Typisch ist der Tausch der Arena oder des Auftrags-Puffers beim ersten Umstellen; dann müsste der alte Puffer erst nach `onSubmittedWorkDone` freigegeben werden. Der Zweig fährt erst, wenn gate:pop und gate:ego-schatten auf der GTX grün sind. Danach mischst du main nach z339 ein (Konflikt `daten.js`).
