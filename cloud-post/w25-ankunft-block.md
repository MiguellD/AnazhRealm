# Post an w25-ankunft-block

## 08.11. 22:28 — GPU-PROBE 27d67079 auf radeon-890m: GRÜN in 1041 s (gate:ankunft GRÜN 98 s) → probe-post/w25-ankunft-block/27d67079.md

ABGABE 27d67079f9af87af213cd9565ff74e60ff22e010

## 08.11. 22:02 — GPU-PROBE 9731a577 auf radeon-890m: GRÜN in 515 s (gate:weltbild-frost:echt GRÜN 210 s · gate:tag-achse:echt GRÜN 19 s · gate:licht-weg:echt GRÜN 19 s) → probe-post/w25-ankunft-block/9731a577.md

## 08.11. 21:53 — GPU-PROBE b51aa4b6 auf omen-gtx1060: NACHGEGEBEN in 277 s (gate:weltbild-frost:echt NACHGEGEBEN 2 s · gate:tag-achse:echt NACHGEGEBEN 2 s · gate:licht-weg:echt NACHGEGEBEN 2 s) → probe-post/w25-ankunft-block/b51aa4b6.md

## 08.11. 21:35 — GPU-PROBE cbe61706 auf radeon-890m: GRÜN in 446 s (gate:weltbild-frost:echt GRÜN 281 s · gate:tag-achse:echt GRÜN 26 s · gate:licht-weg:echt GRÜN 26 s) → probe-post/w25-ankunft-block/cbe61706.md

## 08.11. 21:22 — GPU-PROBE 3c07843e auf omen-gtx1060: GRÜN in 402 s (gate:weltbild-frost:echt GRÜN 326 s · gate:tag-achse:echt GRÜN 20 s · gate:licht-weg:echt GRÜN 20 s) → probe-post/w25-ankunft-block/3c07843e.md

## 08.11. 21:12 — GPU-PROBE 036c8d3e auf radeon-890m: GRÜN in 318 s (gate:weltbild-frost:echt GRÜN 192 s · gate:tag-achse:echt GRÜN 19 s) → probe-post/w25-ankunft-block/036c8d3e.md

## 08.11. 21:00 — GPU-PROBE 708f3e11 auf radeon-890m: GRÜN in 330 s (gate:weltbild-frost:echt GRÜN 121 s · gate:tag-achse:echt GRÜN 23 s) → probe-post/w25-ankunft-block/708f3e11.md

## 08.11. 20:54 — GPU-PROBE b9f68adc auf radeon-890m: GRÜN in 369 s (gate:weltbild-frost:echt GRÜN 121 s · gate:tag-achse:echt GRÜN 21 s) → probe-post/w25-ankunft-block/b9f68adc.md

## 08.11. 20:39 — GPU-PROBE bddc439b auf omen-gtx1060: GRÜN in 199 s (gate:weltbild-frost:echt GRÜN 158 s) → probe-post/w25-ankunft-block/bddc439b.md

## 08.11. 20:34 — GPU-PROBE a62dff8c auf radeon-890m: GRÜN in 196 s (gate:weltbild-frost:echt GRÜN 95 s · gate:tag-achse:echt GRÜN 18 s) → probe-post/w25-ankunft-block/a62dff8c.md

## 22:18 Koordinator
ABGABE 27d67079 ist angenommen. Der Zweig fährt in **z330**, direkt nach z329 (Kandidat 1561bf3a), und mischt sich konfliktfrei mit z329 und den Wartenden. Die Zahl steht: Radeon kalt 13,24 → 12,20 s, GTX 23,05 → 21,27 s. Die echt-Wände sind auf der Radeon grün.

**Nächster Auftrag: B bis ≤ 9 s auf der Radeon. Du hast die Lücke selbst benannt.**
- Zweig `w25-ankunft-block-2` vom Kopf 27d67079. Lies vorher die GOLDENE DEFINITION. Lies zuerst `REFERENZ-ATLAS.md` §3 (Programm-Katalog, UE PSO-Precache) und übernimm den Brief-Baustein (f) wörtlich.
- Ziel 1, vor dem Bild: Lade-Bilder 3,1–3,6 s und scatterDeco 2,0–2,1 s. Kein Programm entsteht am Zug; die Streu-Deko kostet am Schirm, nie an der Weltgröße.
- Ziel 2: `szene:tiefenabbild` baut nach dem Bild synchron. Weg damit in den Katalog bzw. den Vorbau.
- Dein FUND `dirigent-takt.js:64` (das Bau-Bild als Takt ohne Spiel hielt das Licht) gehört in dieselbe Welle.
- Beweis: ABAB je 4 kalt auf der Radeon (t Kontrolle), Ziel ≤ 9 s. Die GTX per Probe-Dienst, und `[gpu-probe: gate:ankunft]` im Kopf.
- Abgabe wie gehabt hier, dann ins Wartezimmer.

## 22:32 Koordinator — Nachtrag zur Grenze
`w25-pipeline-vorwaermen` besitzt ab jetzt den Programm-Katalog (Atlas §3), dazu gehört `szene:tiefenabbild`. Dein Ziel 2 entfällt. Du bleibst VOR dem Bild: Lade-Bilder 3,1–3,6 s, scatterDeco 2,0–2,1 s und dein FUND `dirigent-takt.js:64`. Die Erst-Zeichnung zieht nach `stamm/bild-erst.js` (pipeline-vorwaermen). Fasse `_einmalRender` nicht mehr an, bis dieser Umzug in main ist.

ABGABE 5210bd78e41281495825b92d7f438229574ab53c (Zweig w25-ankunft-block-2, auf main 3f44b37d)
- Geschnitten: `_wieseFernBereit` (stamm/vegetation-wiese.js:763) — die Fern-Kachel beginnt erst, wenn Boden-Karten und 3 × 3 Gitter stehen, im Takt vor Lage und Büscheln; das Feld zuerst von w24-rueckfall-ruhe an dieselbe Stelle.
- Gemessen ABAB je 4 kalt, nur GTX (alle Läufe landeten auf omen-gtx1060, zwei gaben dem echt-Job nach): gegen 27d67079 Fern-Kachel-Rufe 1 021–2 088 → 197–370, Jobs −0,72 s, Eigenmeldung −0,56 s; gegen integ 46128b75 `_wieseFernLage` 376 → 125 ms, scatterDeco 2,09 → 1,97 s, Eigenmeldung −0,18 s, t(Kontrolle) im Rauschen.
- Ehrlich offen: ≤ 9 s verfehlt, die Radeon ungemessen. Der Pfahl ist das Werk: die Foundry-Schlange leert sich 0,3–1 s vor dem Bild (zuletzt fehlen Bäume, Wald-Stücke, ferne Karten); frei gewordene Haupt-Faden-Zeit füllen Lade-Bilder und Knoten-Bau. Verworfen und gemessen: ein vierter Werk-Faden (+1,74 s GTX, er nimmt dem Haupt-Faden die CPU), das Bau-Bild als Takt ohne Spiel (licht +12 s, t +6,5 s), das Bau-Bild nur mit der Frist (Bild +0,95 s, kein Gewinn).

## 02:25 Koordinator
ABGABE 5210bd78 (ankunft-block-2) fährt NICHT so. Die Wiesen-Ferne (`vegetation-wiese.js` Fern-Takt) gehört w24-wiese-ferne. Deren Schnitt 3fe3aafb fährt gerade in z335: Die Nah-Wiese ist dort Substanz unter der EINEN Frist, und die Ferne ist nach 21 statt 82 Takten gebaut. Dein `_wieseFernBereit` kollidiert damit in derselben Datei. Nach der Landung von z335 miss an main, ob dein Schnitt dort noch eine Zahl bringt (−0,18 s an 46128b75). Bringt er sie, mische main ein, ohne Zwilling, auf den Fern-Takt von wiese-ferne, und schreib `BEREIT <sha>`. Bringt er sie nicht, fällt er offen, benannt mit Zahl.
**Dein nächster Auftrag ist dein eigener FUND, die Foundry vor dem Bild:** `studio-bruecke.js:237`, die Schlange leert sich erst 0,3–1 s vor dem Bild. Im Start-Dorf hält die Foundry die Ruhe 472 Takte offen. Ziel: Schlange leer ≥ 3 s vor dem Bild, Ankunft kalt Radeon gegen 12,2 s. Die Foundry gehört ab jetzt dir.

## 09.11. 04:59 — Abgabe w25-ankunft-foundry (die Foundry vor dem Bild)
ABGABE cc3cb87c44dd79e3270f5747deb71ce55fe5de92 (Zweig w25-ankunft-foundry, auf main eff50c41)
- Geschnitten: das Werk war nie der Pfahl (alle Körper bis 10,5 s, die drei Bahnen danach leer); die Schlange hielt die Karten-Kette. `_kartePlatteFragen` (stamm/stoff-karte.js:883, gerufen in `_foundryBuildImpostorFlat` studio-bruecke.js:2743): die Platten-Frage geht mit dem Rang des ersten Lesers ins Werk, nie erst, wenn der Karten-Takt die Zelle erreicht (vorher: mammut angelegt 8,0 s, gefragt 14,35 s). `_streuWeckerSpannen` (stamm/vegetation-streu.js:494): eine Region, die vor dem Bild auf nichts im Blick wartet, schläft auch auf dem Bild — ihr Neubau außer Blick weckte jede Karte außer Blick, säte die nächste und hielt die Streu mit offener Scheibe.
- Gemessen GTX kalt ABAB je 4 gegen main f52b3a03 (Probe 584af69e): t(Kontrolle) 18,91 → 18,04 s, Eigenmeldung 17,55 → 16,78 s, belegt −0,97 s; Foundry-Schlange leer 0,2–6,4 → 4,5–5,9 s vor dem Bild (4 von 4 Boots, leer ab 10,8–11,6 s); Karten vor dem Bild 18 → 14 (alle im Blick); Streu-Term 17,0 → 7,9 s; K nach dem Bild 1,0–3,3 → 1,2–2,5 s. check, playtest:fast, welt-boot, ankunft, takt, fluss, foundry-impostor grün.
- Ehrlich offen: ≤ 9 s verfehlt, die Radeon ungemessen (alle Läufe auf omen-gtx1060). Der Pfahl ist jetzt der Karten-Bake: FUND stamm/stoff-karte.js:614 `_tickKarteWelt` · die 14 Karten im Blick backen nacheinander unter Frist und GPU-Leine, die erste wartet auf die Programme ihrer Bühne (Zellen ab 7,4 s, erste Karte 12,3 s), danach ~0,27 s Wanduhr je Karte bei ~0,11 s Haupt-Faden · Kriterium: die letzte Karte im Blick steht ≤ 1 s nach der letzten L1 ihrer Arten · M. Die Bühnen-Programme gehören dem Katalog (w25-pipeline-vorwaermen); dort auch szene:tiefenabbild synchron nach dem Bild (B 4/4, A 1/4). `_wieseFernBereit` misst nach z335.
## 05:05 Koordinator
ABGABE cc3cb87c (ankunft-foundry) ist angenommen und fährt als **z338**. GTX kalt 18,91 → 18,04 s, die Foundry-Schlange 4,5–5,9 s vor dem Bild leer. Die Radeon misst die Ankunft erst in Ruhe, neben der Claude-App ist die Zeit-Station dort UNGEMESSEN. Weiter mit deinem FUND, der Pfahl ist jetzt der Karten-Bake: `stoff-karte.js:614 _tickKarteWelt`, 14 Karten im Blick backen nacheinander, die erste wartet auf die Programme ihrer Bühne. Die Programme gehören w25-pipeline-vorwaermen, die Reihenfolge und Frist der Karten gehören dir.
