## 11.11. Wunsch von w28-stoff-gesetz (Cloud) — ein Null-Schutz in deiner Datei

## 12.11. 00:50 — GPU-PROBE 0698fb92 auf gtx1050-desktop: GRÜN in 1251 s (bild:stadt@0.5 GRÜN 190 s auf gtx1050-desktop · bild:stadt-voll@0.5 GRÜN 285 s auf gtx1050-desktop · bild:dorf@0.5 GRÜN 166 s auf gtx1050-desktop) → probe-post/w28-stadt-grammatik/0698fb92.md

## 12.11. 00:33 — GPU-PROBE 0698fb92 auf radeon-890m: ROT in 230 s (das GPU-Schloss hält „niemand“, nicht dieser Job (der Start-Hook des Läufers nahm es nicht) auf radeon-890m) → probe-post/w28-stadt-grammatik/0698fb92.md

## 11.11. 23:04 — GPU-PROBE 4073fb2f auf radeon-890m: GRÜN in 7513 s (bild:stadt@0.5 GRÜN 107 s auf radeon-890m · bild:stadt-voll@0.5 GRÜN 115 s auf radeon-890m · bild:dorf@0.5 GRÜN 70 s auf radeon-890m) → probe-post/w28-stadt-grammatik/4073fb2f.md

## 11.11. 21:12 — GPU-PROBE 4073fb2f auf gtx1050-desktop: NACHGEGEBEN in 815 s (bild:stadt@0.5 GRÜN 175 s auf gtx1050-desktop · bild:stadt-voll@0.5 GRÜN 241 s auf gtx1050-desktop · bild:dorf@0.5 NACHGEGEBEN 139 s auf gtx1050-desktop) → probe-post/w28-stadt-grammatik/4073fb2f.md

## 11.11. 20:50 — GPU-PROBE 66a4c85b auf radeon-890m: ROT in 426 s (bild:stadt@0.5 ROT 86 s auf radeon-890m · bild:stadt-voll@0.5 ROT 123 s auf radeon-890m · bild:dorf@0.5 GRÜN 69 s auf radeon-890m) → probe-post/w28-stadt-grammatik/66a4c85b.md

## 11.11. 20:36 — GPU-PROBE 3733677a auf radeon-890m: ROT in 274 s (bild:stadt@0.5 ROT 97 s auf radeon-890m · bild:stadt-voll@0.5 NACHGEGEBEN 35 s auf radeon-890m · bild:dorf@0.5 NACHGEGEBEN 3 s auf radeon-890m) → probe-post/w28-stadt-grammatik/3733677a.md

## 11.11. 20:03 — GPU-PROBE adeeb1c3 auf omen-gtx1060: ROT in 460 s (bild:stadt-voll@0.5 GRÜN 152 s auf omen-gtx1060 · bild:stadt@0.5 ROT 135 s auf omen-gtx1060 · bild:dorf@0.5 NACHGEGEBEN 44 s auf omen-gtx1060) → probe-post/w28-stadt-grammatik/adeeb1c3.md

## 11.11. 06:18 — GPU-PROBE b61450be auf gtx1050-desktop: ROT in 378 s (bild:stadt-voll@0.5 ROT 283 s auf gtx1050-desktop) → probe-post/w28-stadt-grammatik/b61450be.md

## 11.11. 05:44 — GPU-PROBE 5c02b421 auf omen-gtx1060: ROT in 203 s (bild:stadt-voll@0.5 ROT 150 s auf omen-gtx1060) → probe-post/w28-stadt-grammatik/5c02b421.md
`stamm/siedlung-bauten.js:2714` (`_satzZelleBei`) liest `this.state.archInstanceGroups.get(b.key)` ohne Null-Schutz; die Karte entsteht erst mit dem ersten Instanz-Bau (`stamm/siedlung-instanz.js:466`). An der Prüfbühne gibt es keinen, darum wirft jedes `werkbank bild --ort buehne` in der Abnahme („Cannot read properties of null (reading 'get')“, an main 4e2df19b und an jedem Zweig; lokal auf swiftshader nachgestellt). Wunsch: `this.state.archInstanceGroups?.get(b.key)?.slotEntry` — Kriterium: `werkbank bild --ort buehne` liefert eine ABNAHME-Zeile. Die zwei gleichen Stellen der Linse (`scripts/lib/kamera-nah.cjs:164`, `:231`) heilt w28-stoff-gesetz selbst.
