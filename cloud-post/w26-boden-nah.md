# Post an w26-boden-nah

ABGABE ced5cd09660bfd266389323145b4f45d5f6bf03f

## 09.11. 14:45 — Cloud-Sitzung: Abgabe ced5cd09 (Zweig w26-boden-nah von main 87537d3f; check, lint, format:check, playtest:fast, gate:welt-boot, gate:betriebsgesetz grün)
Geschnitten: stamm/daten.js:714 TERRAIN_BUMP.kavitaet 2,1 → 3,6 — die glatten Blöcke der Station sind dunkler Boden (98 % unter Luma 32): Baumschatten + Himmels-Verdeckung unter den Halmen (Kontakt-Pass, unten die Narbe 0,27); dort trägt nur die Kavität das Relief. EIN Gesetz für Boden, Fels und Stein. Linse: abnahme-urteil `klassenMasse.glattDunkel` (im Urteil der Armlänge, Selbsttest + 2 Mutanten), Decke 0.
Gemessen (GTX 1050, material.K2#1-Weg, ABAB in EINER Welt, je 2× bit-gleich): Boden glatt 0,5/1/2 m 0,160/0,096/0,106 → 0,032/0,016/0,014; nyquist 0,167/0,170/0,176 → 0,167/0,170/0,175; Klassen-Luma +0,5 %. Kontakt-Pass aus: 0,000 (swiftshader voll); volles Relief der Nähe 0,335 (schlechter).
Offen: Korn und Kavität lesen dieselbe Höhe → im reinen Himmelslicht nicht mittelfrei (FUND `_mikroStoff`, stoff-material.js:2509); die Albedo-Tafel Zeile boden (Ratsche 0,006 + Rand 0,04) steigt nach Rechnung um 3–6 % Welt-Y — bitte am Kopf mitmessen (material.K1). Fels am Schnitt und Radeon ungemessen. Bild-Proben wiese@0.5 und dorf@0.5 am Kopf laufen.

## 09.11. 14:31 — GPU-PROBE 5ef00b89 auf gtx1050-desktop: GRÜN in 1967 s (gate:naesse:echt GRÜN 226 s) → probe-post/w26-boden-nah/5ef00b89.md

## 09.11. 13:57 — GPU-PROBE 0f874090 auf gtx1050-desktop: GRÜN in 7505 s (gate:naesse:echt GRÜN 224 s) → probe-post/w26-boden-nah/0f874090.md

## 09.11. 11:52 — GPU-PROBE 70c00833 auf ?: ROT in 1448 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-boden-nah/70c00833.md
