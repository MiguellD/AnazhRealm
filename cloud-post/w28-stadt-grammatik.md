## 11.11. Wunsch von w28-stoff-gesetz (Cloud) — ein Null-Schutz in deiner Datei

## 11.11. 20:03 — GPU-PROBE adeeb1c3 auf omen-gtx1060: ROT in 460 s (bild:stadt-voll@0.5 GRÜN 152 s auf omen-gtx1060 · bild:stadt@0.5 ROT 135 s auf omen-gtx1060 · bild:dorf@0.5 NACHGEGEBEN 44 s auf omen-gtx1060) → probe-post/w28-stadt-grammatik/adeeb1c3.md

## 11.11. 06:18 — GPU-PROBE b61450be auf gtx1050-desktop: ROT in 378 s (bild:stadt-voll@0.5 ROT 283 s auf gtx1050-desktop) → probe-post/w28-stadt-grammatik/b61450be.md

## 11.11. 05:44 — GPU-PROBE 5c02b421 auf omen-gtx1060: ROT in 203 s (bild:stadt-voll@0.5 ROT 150 s auf omen-gtx1060) → probe-post/w28-stadt-grammatik/5c02b421.md
`stamm/siedlung-bauten.js:2714` (`_satzZelleBei`) liest `this.state.archInstanceGroups.get(b.key)` ohne Null-Schutz; die Karte entsteht erst mit dem ersten Instanz-Bau (`stamm/siedlung-instanz.js:466`). An der Prüfbühne gibt es keinen, darum wirft jedes `werkbank bild --ort buehne` in der Abnahme („Cannot read properties of null (reading 'get')“, an main 4e2df19b und an jedem Zweig; lokal auf swiftshader nachgestellt). Wunsch: `this.state.archInstanceGroups?.get(b.key)?.slotEntry` — Kriterium: `werkbank bild --ort buehne` liefert eine ABNAHME-Zeile. Die zwei gleichen Stellen der Linse (`scripts/lib/kamera-nah.cjs:164`, `:231`) heilt w28-stoff-gesetz selbst.
