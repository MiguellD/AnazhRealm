# Post an w25-ferne-licht

## 09.11. 09:57 — w25-ferne-licht-7: Zwischenstand — Azimut 0 auf echter GPU zerlegt (Messplatz ad0cbe39)

Die GPU-Probe von `gate:luft-tiefe:echt` lief auf der GTX 1060 (82 s, probe-post/w25-ferne-licht-7/ad0cbe39.md): **Hügel, Uhr 0,5, Azimut 0° (zur Sonne), 8 km: 13,0°**. Die Bandmittel (linear) sind
L 0,223 / 0,241 / 0,256 · S 0,263 / 0,268 / 0,279 · L0 0,129 / 0,131 / 0,086.
Dieselbe Stelle auf swiftshader (dieselben 186 Pixel): L 0,225 / 0,243 / 0,258 · S 0,263 / 0,270 / 0,279 · L0 0,131 / 0,134 / 0,089 → 5,71°.

Benannt, was die Geräte trennt: **nur der Ton der In-Streuung S zur Sonne**. Gelände und Boden stehen auf beiden Geräten gleich (Ton L 207,3° GTX / 208,2° swiftshader). S ist zur Sonne fast grau (Buntheit 0,016 bei Y 0,27): 0,8 % Grün drehen seinen Ton von 220,3° (GTX, die Referenz Hillaire: 222°) auf 213,9° (swiftshader). Die 5,71° von swiftshader waren diese 0,8 %, kein besseres Bild. Die Radeon (10,65°) liegt dazwischen.

Die Wurzel des Tons auf der GTX, nachgerechnet mit dem gemessenen T (R 0,30 · G 0,20 · B 0,12 bei 8 km, q ≈ 1, die Referenz V 20 km, Ångström 1,3):
- Die In-Streuung des Pfads selbst, (1 − T)·S, steht schon bei 210,1°: **schon schwarzer Grund trägt 10,2°** gegen den Horizont, denn der Pfad-Dunst ist blauer als der Horizont, weil Rot weiter trägt als Blau.
- Grauer Grund in der gemessenen Helligkeit trägt 8,0°, der Grund der Welt (L0 Ton 63°, B/G unter Licht 0,66) 13,0°.
- ≤ 10° hielte nur ein fast neutraler Boden: B/G ≥ 0,88 bei 8 km.

Darum schneide ich hier NICHT: ein neutral gefärbter ferner Boden wäre ein Pflaster gegen die Physik der Referenz, und die Schwelle fasse ich nicht an.
FUND: spec/farbe/luft-referenz.json `band.dh` (Meisterkarte ferne.K1 Staffel 2 „Δh ≤ 10° bei 8 km“) · Wurzel: zur Sonne ist der Horizont fast grau, und die Referenz-Luft ist spektral steil (T_B/T_R 0,39 bei 8 km). Die Physik der eigenen Referenz trägt dort 10–13° (schwarzer bis gelber Grund), auf jeder GPU · Kriterium: der Ton bei 8 km gegen die In-Streuung des Pfads ((1 − T)·S, GTX 2,9°), oder Δh nur, wo der Horizont einen Ton hat · M — das Maß der Karte ist deine Entscheidung, nicht meine.

Gebaut und bereit auf `w25-ferne-licht-7`: der Messplatz `gate:luft-tiefe:echt` (Ausnahme MESS wie gate:pop). Die Bänder tragen die Mittel L/S/L0, der FARBTON-Befund nennt sie, FARBTON steht nicht mehr offen. Die Decke zahlen die Ton-Zwillinge der Prüfbühne (scripts −2).

Ich warte im Wartezimmer.

## 09.11. 09:14 — w25-ferne-licht-7: Zwischenstand (benannt, die Probe auf echter GPU läuft)

Benannt aus der Station (Radeon, main 87537d3f, Band-Linse): **Azimut 0° — zur Sonne —, Uhr 0,5, 8 km: 10,65°** (188 Pixel); 90° 8,69 · 180° 7,34 · 270° 5,84. Dieselbe Folge der Station (umstellen → Band → Luft) lokal auf swiftshader, dieselben Pixel (186): 5,71°. Die Geräte trennen sich nur zur Sonne (5 km: 18,6 gegen 10,5°; 90°/270° < 1°). Dort ist die In-Streuung am grauesten (Buntheit der Bandmittel S 0,028 gegen 0,044–0,053 an den anderen Azimuten): der Ton des Bands kippt dort am stärksten.

Der Messplatz für echte GPU steht auf `w25-ferne-licht-7` (ad0cbe39, `[gpu-probe: gate:luft-tiefe:echt]`): `werkbank licht --luft --eigen`, Ausnahme MESS wie gate:pop; je Band die Mittel L, S, L0, und der FARBTON-Befund nennt sie (FARBTON steht nicht mehr offen, die Wand hält ihn). Mit der Zerlegung auf der GPU schneide ich den Ton dieses Azimuts.

## 09.11. 06:23 — w25-ferne-licht-6: BEREIT a5a201de2f59df7b3921234bc2706f319508b6f1

BEREIT a5a201de2f59df7b3921234bc2706f319508b6f1 — Heilung w25-ferne-licht-6 (z340) auf 42f5cb6c.

Deine Röte von 07:15 beim Namen: `s0Probe` (scripts/diag-pruefbuehne.cjs:314, :318, :371) läuft im Hauptlauf der Prüfbühne per `page.evaluate` — dort legte niemand `luma709` in die Seite; der Licht-Lauf trägt sie mit AUSGABE_INSTALL (darum stand `gate:pruefbuehne-licht` bei mir GRÜN, `gate:pruefbuehne` hatte ich nicht gefahren — mein Fehler). `himmelProbe` (:998) fährt nur im Licht-Lauf.

Geschnitten: scripts/diag-pruefbuehne.cjs:1673 — der Hauptlauf legt `window.luma709` aus dem EINEN Import (:823, abnahme-urteil) vor jedem Dokument in die Seite (`evaluateOnNewDocument`, auch die Bühne durch die Tür). Kein Zwilling der Formel.

Gemessen am Kopf: `gate:pruefbuehne` GRÜN (EXIT 0, S0 misst die Nacht 0,396/0,399 und die Fenster-Glut 0,4543 über `luma709`, SELBSTTEST GRÜN, kein [ERROR] STOFF) · gate:betriebsgesetz GRÜN (scripts −15) · lint · format:check.
Die übrigen Seiten-Leser von `luma709` geprüft: die Wasser-Linse trägt sie in WASSER_INSTALL (jeder Leser installiert es ganz), diag-pflanzen-nah rechnet in Node; `wetterZug` liest `srgbLin` aus AUSGABE_INSTALL der Werkbank-Seite; `luftTiefeUrteil` rechnet in Node.

Ich warte im Wartezimmer.

## 09.11. 05:15 — w25-ferne-licht-6: ABGABE 42f5cb6c96bb592fb2d02289a1b57c1b83860863

ABGABE 42f5cb6c96bb592fb2d02289a1b57c1b83860863 — Abgabe w25-ferne-licht-6 (vom Kopf f102e1f5, main 691c46e9 V18.546.234 gemischt; Proben `[gpu-probe: bild:genesis@0.5, bild:genesis@0.27]` am Kopf).

Zuerst deine Order von 04:40 und 05:37 — der Ton deterministisch, dann sehen, ob die 12° der Radeon echt sind: der Täter liegt nicht in punkte-maschine, sondern in der Linse des Spiels. Die Station ferne.K1#2 ruft `luftTiefe` aus scripts/lib/licht-linsen.cjs (die Werkbank-Seite); `dh` rechnete dort je Pixel `ton(L) − ton(S)` und nahm den Median. Darum sitzt die Heilung im Spiel-Repo, kein Zweig `-pm` — die Station liest sie beim nächsten Lauf ohne Merge. Und eine Berichtigung meiner Zahl von 04:33: „6,0 gegen 12,3°" waren nicht zwei Läufe der Linse, sondern Linse gegen meine Sonde mit anderen Pixeln. Dieselben Pixel ergaben je Pixel denselben Ton — die Metrik war deterministisch, aber VERZERRT: bei 4–13 Stufen Buntheit springt der Ton eines Pixels um eine Stufe 5–15°, der Median der Beträge sitzt darum über der Wahrheit (Selbsttest: 2–6 Stufen Buntheit, Wahrheit 7,14°, je Pixel Median 20°, das Band 6,07°).

Geschnitten:
- scripts/lib/licht-linsen.cjs:2117 `tonDesBands` — der Ton des Mittels der linearen Pixel des Bands (Luft und Himmel je für sich summiert, dann EIN Ton je Seite), `luftTiefe` :2287 `dh: tonDesBands(b.dh)`; der seiten-eigene `ton` fällt, `farbTon` :2113 ist der EINE Ton (auch der HIMMEL-Ton). Die Werkbank-Seite trägt beide (scripts/werkbank.cjs:3487).
- Selbsttest :2511 — 200 Pixel um eine Wahrheit von 7,14° mit ±1 Stufe Rauschen: das Band trifft sie auf ≤ 2° (6,07°), die Mutante „je Pixel" (Median 20°) ROT beim Namen. `werkbank licht --luft --selbsttest` GRÜN.
- Die Decke (der erste Schnitt kostete scripts/ +408 Atome; am Kopf −35): bezahlt mit den Luma-Zwillingen — scripts/diag-pruefbuehne.cjs (4×), scripts/lib/wasser-linse.cjs (6×, die Seite trägt `luma709` aus abnahme-urteil), scripts/diag-pflanzen-nah.cjs lesen `luma709`. gate:betriebsgesetz GRÜN.

Gemessen (swiftshader voll, Luft-Linse `werkbank licht --luft`, Genesis, Ton des Bands, zwei Läufe derselben Welt):
- FARBTON 8 km Uhr 0,5, Azimut 0/90/180/270: je Pixel 6 · 10,23 · 2,7 · 7,5° → Band **5,71 · 8,94 · 2,78 · 6,76°** (Pixel 186/116/218/230); Uhr 0,27: 3,01 · 1,38 · 1,57 · 1,82°; vom Gipfel: 6,62 · 7,01 · 3,78 · 6,04°.
- Lauf 1 und Lauf 2 auf die Hundertstel gleich. LUFT GRÜN · K1-1 GRÜN · K1-2 GRÜN · K2-1 GRÜN · K2-2 GRÜN; fernes Weiß R/B 6,25 (≥ 1,3).

Wände am Kopf GRÜN: check · lint · format:check · playtest:fast (21 ✅ · 0 ❌) · gate:betriebsgesetz (scripts −35) · gate:pruefbuehne-licht (S0 GRÜN) · gate:pflanzen-nah (31 Fälle) · gate:welt-boot · `werkbank licht --luft --selbsttest`. Kein [ERROR] STOFF außer den Mutanten der Selbsttests.

gate:wasser-leben steht HIER lokal ROT „K10 LEER: 8“ (8 Höhlen-Proben, Soll ≥ 20) — am Kopf und byte-gleich an main 691c46e9 im selben Container; in der CI von main (Gruppe 12) GRÜN. Die Wasser-Linse trägt aus diesem Zweig nur `luma709` statt der Luma-Zwillinge, `wasserHoehle` (scripts/lib/wasser-linse.cjs:1476) liest keinen davon.

Ehrlich offen:
- ferne.K1#2 mit dem Ton des Bands auf Radeon und GTX ungemessen — der Lauf der Station am Kopf ist der Richter. Auf swiftshader trägt Azimut 90° den knappsten Abstand (je Pixel 10,23° → Band 8,94°, 1,06° unter dem Soll); die 12° der Radeon waren Ton je Pixel.

Ich warte im Wartezimmer.

## 09.11. 04:33 — w25-ferne-licht-5: ABGABE f102e1f539a76d49a1ca7c3d7fc3b363a7ef34ad

ABGABE f102e1f539a76d49a1ca7c3d7fc3b363a7ef34ad — Abgabe w25-ferne-licht-5 (vom Kopf 4ecfb1a3, main f52b3a03 darin; Proben `[gpu-probe: bild:genesis@0.5, bild:wiese@0.5, bild:gipfel-blick@0.5]` am Kopf).

Zuerst die Lage von K1#2: das ferne Weiß steht im Soll (R/B 6,25 ≥ 1,3, am Kopf 6,248) — die Staffel K1-2 hielt allein der FARBTON bei 8 km ROT.

Die Wurzel des Farbtons: die Wiese der Welt trägt aus der Ferne das Mittel des EINZELNEN Halms (`WIESEN_GRUND.farbe`, grün 0,202, Y 0,17) — nie die Selbstbeschattung des Bestands, die das Kronendach schon trägt (`FERN_FARBE.kronenSchatten` 0,32). Am Genesis-Hügel stand das Gelände bei 8 km darum ohne Luft auf 0,56–0,73 der In-Streuung (Physik ~0,4), und sein Gelbgrün schien durch die Luft. Ein Nachbau aus den Pixeln der Linse (je Pixel T = (L − S)/(L0 − S), die Neutral-Kurve vorwärts) trifft die gemessenen Töne exakt (k = 1: 15 · 25,5 · 12,7 · 15,7°) und sagt: mit der Wiese auf 0,4–0,5 ihrer Helligkeit 3,4–9,9°.

Geschnitten:
- stamm/daten.js:628 `WIESEN_GRUND` — `farbe` = das Mittel des Halms × `FERN_FARBE.halmSchatten` (stamm/gelaende-chunks.js:3223, 0,4 neben `kronenSchatten`): grün 0,202 → 0,081, die Satelliten-Bänder der Frischwiese im Sommer (grün ~0,07–0,09). Im Gesetz — `_bodenFarbeAt`, der Worker `attachFieldColors`, Fern-Ring, Feld-Pass, Panorama und der Rasen der Wege lesen EINE Zahl; gate:nah-fern hält sie (beide Leser gegen das Gesetz an der Stelle).
- stamm/stoff-material.js:2886 — das Relief der Nähe (die Halm-Schichten bis 90 m) trägt weiter das Mittel des Halms (`halmMittel`): die Nähe zeigt den Halm, die Ferne den Bestand; über 90 m blendet die Nähe ins Gesetz.

Gemessen (swiftshader voll, Luft-Linse `werkbank licht --luft`, Genesis, dieselbe Welt vorher/nachher):
- FARBTON 8 km, Uhr 0,5, Azimut 0/90/180/270: 15 · 25,5 · 12,7 · 15,7° → 6 · 10,23 · 2,7 · 7,5°; Uhr 0,27: 1,0–2,8°; vom Gipfel (Auge 40 m): 10 · 6,9 · 4,7 · 5,7°.
- Gehalten: K1-1 GRÜN (Durchlass q 0,88–1,06), K2-1 GRÜN (Rest-Kontrast am Rand 1,26–1,58 % bei 18–23 km), K2-2 GRÜN, fernes Weiß R/B 6,248.
- Das Gesetz bei 8 km (Median aus 720 Orten je Azimut): 0,10 / 0,095 / 0,05 (Y 0,09) — 40 % Wiese, der Rest Erde und Fels der Palette.

Wände am Kopf GRÜN: check · lint · format:check · playtest:fast (21 ✅ · 0 ❌) · gate:nah-fern (EINE Boden-Farbe je Ort) · gate:albedo-tafel · gate:pruefbuehne-licht (S0 GRÜN) · gate:welt-boot · gate:post-kette · gate:ego-schatten · gate:betriebsgesetz (scripts 0 Atome). Kein [ERROR] STOFF außer den Mutanten der Selbsttests.

Ehrlich offen:
- K1-2 FARBTON Azimut 90° 10,23° > 10° (Uhr 0,5) — die Staffel K1-2 bleibt mit EINEM Befund ROT.
- FUND scripts/lib/licht-linsen.cjs:2266 `luftTiefe` (dh) · Wurzel: die Linse rechnet den Ton je Pixel aus den 8-bit-Werten fast grauer Luft-Pixel — die In-Streuung trägt bei 8 km 4–13 Stufen Buntheit, eine Stufe dreht den Ton um 5–15°. Zwei Läufe derselben Welt: Azimut 0° 6,0 gegen 12,3°, Azimut 90° 10,23 gegen 6,5°. Der Ton der Bandmittel (linear) ist stabil: vorher 14,8 · 26,2 · 19,7 · 11,9°, nachher 11,8 · 6,8 · 2,0 · 7,6° · ferne.K1#2 · S (der Ton des Mittels des Bands statt des Mittels der Töne — kostet die Decke ~30 Atome).
- Die Wiese am Ort der Welt ist heller als ein Bestand: der Halm selbst (Spitze grün 0,349) liegt über einem echten Grashalm (~0,15–0,2) — eine Frage der Palette des Kerns (terrain `SAISON_GESETZ`), nicht dieses Zweigs.

Maßstab: die Selbstbeschattung des Kronendachs (MODIS/Landsat-Oberflächen-Reflexion: Laubwald grün 0,05–0,07, Frischwiese 0,07–0,09), Koschmieder 1924 mit der Referenz luft-referenz.json.

Ich warte im Wartezimmer.

## 09.11. 03:16 — w25-ferne-licht-4: ABGABE 4ecfb1a33fc1d71d044be6e0cab8236529bd077b

ABGABE 4ecfb1a33fc1d71d044be6e0cab8236529bd077b — Abgabe w25-ferne-licht-4 (vom Kopf 017e9839, origin/main V18.546.232 gemischt; Proben `[gpu-probe: bild:gipfel-blick@0.735, bild:gipfel-blick@0.5]` am Kopf). Dazu der Zweig der Linse `w25-ferne-licht-4-pm` (4525ea7, auf w25-ferne-licht-pm 4b84b72).

Zuerst deine Frage von 02:50 — was hebt K4 auf der Radeon? Nicht der Renderer: die Station von punkte-maschine misst DURCH DIE LUFT und im 3×3-Feld. Dieselbe Station am Kopf 017e9839 (≙ main f52b3a03 für K4) auf swiftshader voll: **0,6161** (Ls 0,0725 / Ll 0,1177) — die Radeon 0,6243. Die Renderer liegen 0,008 auseinander. Meine Zahlen 0,4458 → 0,4385 kamen von der Station ohne Luft (w25-ferne-licht-pm, 4b84b72) — sie ist bis heute nicht in punkte-maschine. Die Atmosphäre ist der Hebel der Karte: ohne den Schleier dieselbe Welt 0,4539 (am Pixel) — die In-Streuung liegt gleich auf beiden Hängen und trägt je N·L das Verhältnis der N·L der Orte (FUND 21:25). Schatten-Kaskade und Tonkurve sind es nicht (die Kaskaden enden bei 270 m, die Station rechnet die Neutral-Kurve zurück).

Geschnitten:
- stamm/dirigent-ankunft.js:1566 `_horizontBoden` — DER TREFFER LIEST DAS GESETZ: der Strahl vom Auge durch das Fragment sucht den Schnitt mit dem Boden des 32-m-Gitters (Kanal b der Karte) über eine Masche — vor der Sehne, wo sie unter dem Gesetz steht, sonst hinter ihr —, 8 gleiche Schritte, 4 Halbierungen (Relief Mapping, Policarpo & Oliveira 2005); findet er keinen, bleibt der Ort lotrecht. stamm/gelaende-fern.js:276 — Schatten (`receivedShadowPositionNode`), Grat-Himmel und Licht-Normale (`_fernNeigungNormale`, :1113, `fernOrt` über stamm/stoff-material.js) lesen DIESEN Ort, nie die Sehne. Kein neuer Sampler (16/16), keine Konstante außer `HORIZONT_KARTE.treffer`.
- Zweig w25-ferne-licht-4-pm, g3.js ferne.K4 — die Station zählt das Pixel des Orts, nie sein 3×3-Feld (`feld` 1): bei 640×360 deckt das Feld aus 1 500 m in 5,5 km ~40 × 160 m Hang, der Schattenstreifen hinter dem Grat ist schmaler. Mutante „im 3×3-Feld um den Ort gemessen" ROT beim Namen, `punkte.cjs selbsttest --ohne 3c` GRÜN 162/162.

Gemessen (swiftshader voll, Dorf, Sonne 5°, ohne Luft, 21/64 Orte, 640×360):
- Station am Pixel (4-pm): Kopf 017e9839 0,4539 → Kopf 4ecfb1a3 **0,3537** (Ls 0,0254 → 0,0217 · Ll 0,0561 → 0,0612).
- Dieselbe Welt im alten 3×3-Feld: 0,4385 → 0,4433 — das Feld trägt den besonnten Nachbarn in den Streifen (dieselbe Welt mit Treffer: im Feld 0,4416, am Pixel 0,3537).
- Die Zuordnung: das Pixel allein ohne Treffer 0,4539 (schlechter als das Feld), der Treffer allein im Feld 0,4433 — erst beide zusammen 0,3537. Auf der großen Leinwand (1920×1080) trägt der Treffer schon im 3×3-Feld 0,354 (ohne Treffer 0,4215).
- Kosten: 14 Abtastungen der Karte je Fragment des Rings, kein Sampler, keine Pipeline mehr; auf der GPU ungemessen (die Proben am Kopf).

K4 auf echter GPU: die Linse von K4 IST die Station der NEUN-Seite. Ich habe sie als `werkbank licht --grat` (Familie der Licht-Linsen, `gate:ferne-grat:echt`, Selbsttest, auf swiftshader GRÜN 0,3576 in 3 min 38 s samt Boot) gebaut und wieder herausgenommen: sie wäre ihr Zwilling und kostet scripts/ +3 810 Atome (DECKE und Wachstums-Wand ROT, erlaubt 266). Der Weg zur GPU ist darum: w25-ferne-licht-4-pm in punkte-maschine — dann misst die Radeon K4 ohne Schleier am Pixel. Bis dahin trägt das Bild `bild:gipfel-blick@0.735` (der Blick über die Stadt zum Horizont bei Sonne ~5°) die Hänge auf der GTX.

Wände am Kopf GRÜN: check · lint · format:check · playtest:fast (21 ✅ · 0 ❌) · gate:welt-boot · gate:schatten-terminator · gate:post-kette (kein [ERROR] STOFF außer den Mutanten der Selbsttests) · gate:ego-schatten · gate:fern-ring · gate:betriebsgesetz.

Ehrlich offen:
- ferne.K4#1 auf der Radeon bleibt ROT, bis die Station ihre Heilung trägt — FUND Zweig w25-ferne-licht-4-pm (4525ea7) · Wurzel: punkte-maschine misst durch die Luft (0,6161 swiftshader / 0,6243 Radeon) und im 3×3-Feld · ferne.K4#1 · S (ein Merge).
- ferne.K1#2 ROT: Farbton 8 km 1,6–25° (≤ 10°), fernes Weiß R/B 6,25 (≥ 1,3) — in dieser Welle nicht angefasst · L.
- FUND stamm/gelaende-fern.js:2095 `FERN_NEIGUNG` (514² à 31,25 m) und stamm/dirigent-ankunft.js:1857 `HORIZONT_KARTE` (768² à 32 m): zwei Gitter desselben Gesetzes im Feld-Faden, fast gleich fein — EIN Gitter trüge beide · M.

Ich warte im Wartezimmer.

## 09.11. 02:08 — w25-ferne-licht-3: ABGABE 017e9839ce545150497b064bb36d0b4023a63a64

ABGABE 017e9839ce545150497b064bb36d0b4023a63a64 — Abgabe w25-ferne-licht-3 (vom Kopf bcf8f14a, origin/main V18.546.230 gemischt; Probe `[gpu-probe: bild:gipfel-blick@0.5]` am Kopf).

Erst die Antwort auf „schneide den Treffer": ich habe ihn am Ort selbst gemessen. Die Masche des Rings steht an den 21 Schattenorten −34 … +44 m neben dem Gesetz; das Pixel des projizierten Orts zeigt den Ring bis 365 m daneben, an drei Orten einen Hang, der von der Sonne WEG zeigt (N·L −0,02 / −0,61 / −0,59). Misst man den Ring lotrecht über dem Gesetz (Tiefe geprüft), stand das Verhältnis vorher bei 0,487 — schlechter als die Station. Der Treffer hielt die Zahl tief, nicht hoch; die Wurzel lag hinter ihm: der Grat der Karte.

Geschnitten:
- stamm/dirigent-ankunft.js:1825 `HORIZONT_KARTE` — das Gitter der Horizont-Karte 768² à 32 m (vorher 256² à 96 m), die Karte 320² (vorher 220²), Aufträge à 16 Zeilen. Ein Kamm zwischen zwei Gitter-Punkten stand bilinear zu tief, das Tal zu hoch: der Grat zur Sonne lag an den Schattenhängen im Mittel 3,05° unter dem Gesetz (CPU-Nachbau des Passes je Gitter: 96 m 3,05° · 64 m 1,74° · 48 m 1,34° · 32 m 0,77°; die Karte am Kopf trifft den Nachbau auf 0,01°). 1,91 MB in der Ratsche der Klasse `tex:horizont-karte` (0,5 MB + 2 MB Toleranz), Band 118 MB. Das Gitter kostet den Feld-Faden 89 Takte / 2,0 s je Anker-Sprung (swiftshader), die Karte malt in einem Takt.
- stamm/kreatur-verhalten.js:2839 `_kzLeib` — der Fit-Takt zählt Fits (wie sk5-haus und die Streu): die Kapsel jedes Glieds passt der Vorrat EINMAL je Gattung (`_gliedKapselMemo`); trägt die Liste jeden Schlüssel schon, wartet der Leib nie an `_weltBakeErlaubt`.

Gemessen (swiftshader voll, Dorf, Sonne 5°, ohne Luft, 21/64 Orte; vorher = Arbeitsbaum am Kopf bcf8f14a):
- ferne.K4, die Station (g3-Seite des Zweigs -pm, 640×360): 0,4458 → 0,4385 (Ls 0,0259 → 0,0251 · Ll 0,058 → 0,0572).
- ferne.K4 am Ort des Gesetzes (Ring lotrecht, alle 21/64): 0,487 → 0,419; der Grat nimmt dem Schattenhang median 13 → 16 % seines Himmels, die Sonne leckt nicht mehr in die schmalen Schattenstreifen (Ls mit/ohne Sonne 0,0304/0,0269 → 0,0259/0,0252). Albedo beider Seiten gleich (Mittag 0,9963) — kein Störfaktor.
- Die Physik der Orte (Hillaire, Himmel in 70 m, Band ±30°): mit dem Grat des Gesetzes 0,33, mit dem vollen Horizont des Gesetzes 0,32, mit der 96-m-Karte 0,41, ohne Grat 0,48.
- Gipfel-Blick im Takt (instrumentiert: `_weltBakeErlaubt` ja/nein, `_kreaturGliederBacken` je Guss, `_weltOffen` je 500 Takte): vorher Takt 0–8 000 die Foundry der Metropole (461), 8 000–14 000 die Liste der Leute (3 431), 14 000–34 000 die 959 Leiber — 1 282 Güsse à 0,04 ms (54 ms gesamt) an 4 Fits je Sekunde, 10,7 Mio. Absagen der Uhr, jeder Takt über dem Budget; der Anlauf stand nach 50 000 Takten noch nicht (Bau-Satz-Raten je Render). Nachher: Leiber 461 → 0 in ~4 500 Takten (die Geburten, 2 je Takt), 0,87 Mio. Absagen, Anlauf und Gipfel stehen nach 21 441 Takten / 459 s. Der Täter beim Namen: die Bake-Uhr zählte Treffer als Fits.

Wände am Kopf GRÜN: check · lint · format:check · playtest:fast (21 ✅ · 0 ❌) · gate:welt-boot · gate:schatten-terminator ((H) Grat 15, Ring 2) · gate:post-kette (kein [ERROR] STOFF außer der Mutante des Selbsttests) · gate:ego-schatten · gate:betriebsgesetz.

Ehrlich offen:
- ferne.K4 0,4385 > 0,4 — FUND stamm/gelaende-fern.js:2063 `FERN_RING` (winkel 192, seite 3: Masche 164 × 490 m bei 5 km) · Wurzel: das Pixel des Orts zeigt die Sehne der Masche bis 365 m neben dem Gesetz, die Schattierung des Gesetzes liegt auf ihr bis 160 m verschoben; am Ort selbst trägt das Bild 0,419, der Rest ist der Grat-Term (16 % gegen 22–35 % der Physik: das Band ±30° und die Texel der Karte) · ferne.K4#1 · L (eine feinere Masche bricht die Dreiecks-Ratsche ±5 000; der Weg: die Schattierung am Schnitt des Blickstrahls mit dem Boden der Karte, Kanal B — Parallax-Korrektur je Fragment wie Geometry Clipmaps, Losasso & Hoppe 2004).
- Gipfel-Blick ≤ 3 min auf der GTX — die Probe richtet. FUND scripts/werkbank.cjs:1117 · Wurzel: der Anlauf wartet am Platz, bis die GANZE Welt steht (`__weltStehtNach`), der Ort liegt 1,18 km fern — die Bewohner gehen jenseits 325 m (`BEWOHNER.fernFaktor`), die Raten des Bau-Satzes gehen je Render (`_tickChunkSatz`, auf swiftshader Takt 10 500–21 000) · gipfel-blick · M.
- FUND stamm/dienst.js:2039 `WELT_MARCH.felder` 4 096 · Wurzel: die vorab gebackenen Felder naher Bewohner (12 je Mensch, unsichtbar) füllen die geteilte Liste — am Anlauf frei 0, ~340 von 959 tragen ein Feld, die übrigen bleiben fern unsichtbar (`_kzVersuch`); schon vor diesem Schnitt (vorher frei 3) · mensch.K2 / Stadt fern · M.
- FARBTON 8 km 15–26° — in dieser Welle nicht angefasst (FUND wie 23:20) · L.
- Welle 3: keiner der drei Punkte fiel ganz.

Maßstab: Horizon Mapping (Max 1988) in der Auflösung des Grats, Horizon-Based AO aus der Sky-View-LUT (UE5 SkyAtmosphere), der Fit-Takt nach Kosten (sk5-haus: Treffer sind frei).

Ich warte im Wartezimmer.

## 09.11. 00:45 — w25-ferne-licht-2: Zwischenstand zu ferne.K4 (kein neuer Schnitt, Kopf bleibt bcf8f14a)

Den Treffer habe ich an der Wurzel gemessen, bevor ich schneide — er ist es nicht. Alle Zahlen swiftshader voll, Dorf, Sonne 5°, dieselben 21/64 Orte der Station, ohne Luft:
- Der Ort am GEZEICHNETEN Boden (lotrecht auf den Fern-Ring, statt des Gesetz-Punkts): 0,4952 · dazu nur Orte, deren Pixel in der Tiefe des Bilds wirklich ihren gezeichneten Boden zeigt (9 verdeckte fallen): 0,4897 — beides schlechter als der Gesetz-Punkt (0,4458). Mein FUND „das Pixel trifft daneben" ist damit widerlegt.
- Die Bestrahlung liest die Licht-Normale schon: die EINE Umgebung ausdrücklich mit der `normalNode` des Stoffs gerechnet — Zahlen auf vier Stellen gleich (Abzug 7,1 %, 0,4466); der Schnitt ist zurückgenommen.
- Die Physik genau dieser Orte (CPU-Nachbau Hillaire; Himmel und Sonne wie das Bild sie zusammensetzt: Himmel aus dem Auge 1 500 m, Sonne in 88 m; Grat-Band ±30° um die Sonne, gleiche Albedo): Ls/Ll 0,308 mit dem Grat des Gesetzes, 0,381 mit dem Grat der Karte, 0,476 ohne Grat-Himmel. Das Bild: 0,446. Der Grat-Himmel greift im Bild also nur zu einem Fünftel (0,476 → 0,446 statt → 0,381).
- Am Punkt des Gesetzes rechnet der Term richtig: ein Schirm-Pass mit Ort und Normale des Gesetzes zieht 10–25 % ab (Median 14 %), PMREM-Stufe 1 = Kosinus-Bestrahlung der Tafel ± 7 %, ohne Himmels-Licht ist der Schattenhang 0. Der Abzug von 7 % im Bild entsteht zwischen diesem Term und dem Pixel des Rings — eingegrenzt, noch nicht benannt.
- Gipfel-Blick im Takt: 26 000 Takte bis die Welt am Anlauf steht — Takt 0–13 000 die Foundry-Bauten der Metropole (461 → 0, `_weltOffen` foundry), Takt 13 000–26 000 die Leiber ihrer Bewohner (959 → 0, ~1 Leib je 12 Takte, `leiber`) samt `felder`; die Ferne nicht. Nächster Schnitt dort.

Ich warte im Wartezimmer und arbeite in der genannten Reihe weiter.

## 08.11. 23:20 — w25-ferne-licht-2: ABGABE bcf8f14af663df140247a776117e6a2acb4dffe6

ABGABE bcf8f14af663df140247a776117e6a2acb4dffe6 — Abgabe w25-ferne-licht-2 (vom Kopf 1f8b19ed, origin/main V18.546.228 gemischt; Probe bild:gipfel-blick@0.5 am Kopf — sie reißt den Deckel weiter, der Täter steht unten).

Geschnitten:
- stamm/dirigent-ankunft.js:1440 — der Pass der Horizont-Karte schreibt in den freien Alpha-Kanal den Grat des Bodens, tan α = max (h − h₀)/s über denselben Marsch; :1527 `_horizontHimmel` nimmt das Größere zweier Untergrenzen (der Punkt, der den Schatten wirft, und der Grat des Bodens abzüglich der Höhe über ihm je 60 m). Bis dahin las der Grat-Himmel den Winkel des schattenwerfenden Punkts — ein Berg 3 km fern statt des Kamms 200 m vor dem Hang.

Gemessen (swiftshader voll, Dorf, Sonne 5°, 21/64 Orte der Station):
- Grat der Karte am Schattenhang 8,1° → 9,5° im Median (das Gesetz 10,3°; die Karte zurückgelesen, Zeilen auf 224 Texel gepolstert).
- Abzug des Himmels am Schattenhang 6,2 → 7,1 %, am Lichthang 0 → 1,8 %; ferne.K4 ohne Luft 0,444 → 0,446 (Sonde), die geschärfte Station am Kopf von Welle 1: 0,4297.
- Der Term selbst ist richtig: ein Schirm-Pass wertet `_horizontHimmel` am Punkt des Gesetzes mit seiner Normale aus — 10–25 % Abzug (Median 14 %); die PMREM-Stufe 1 trifft die Kosinus-Bestrahlung der Tafel auf 7 % (0,103 gegen 0,096 bei 19° Neigung); ohne Himmels-Licht ist der Schattenhang 0. Was die Station misst, ist das Pixel des projizierten Gesetz-Punkts — der Fern-Ring steht bei 5 km ±50 m neben dem Gesetz (Masche 164 × 490 m), das Pixel trifft den Ring 20–200 m neben dem Hang.
- Gipfel-Blick, Phasen (swiftshader, 4 Kerne): Ring am Anlauf 104 Takte / 10 s · „die Welt steht" am Anlauf 22 046 Takte / 516 s · am Gipfel ~2 300 Takte; das Bild 47 s. Was offen hält, je 1 000 Takte: bis Takt 13 000 die Foundry-Bauten der Metropole (461 → 0) und 35 Bauten, ab 13 000 die Leiber ihrer Bewohner (959 → 0, ein Leib je ~12 Takte) samt Feldern. Die Ferne baut nicht mit. Auf der GTX (~20 ms je Takt) trägt das die 480 s. Dazu steht am Gipfel eine Tanne 29 m vor dem Auge im Blick (ABNAHME ROT „Blickziel verdeckt von Rinde baum_tanne in 28,89 m", swiftshader).
- FARBTON-Wurzel geprüft: mit Halmen steht die nahe Wiese heller als ihr Grund (Y 0,071 gegen 0,046 im mittleren Band, gelbgrün; Schatten-Holz, Mittag) — die Fern-Wiese ist nicht heller als die Nähe, die Wiese der Welt ist es.

Wände am gemischten Kopf GRÜN: check · lint · format:check · playtest:fast (21 ✅ · 0 ❌) · gate:welt-boot · gate:post-kette · gate:ego-schatten · gate:schatten-terminator · gate:betriebsgesetz.

Ehrlich offen:
- ferne.K4 > 0,4 — FUND Zweig w25-ferne-licht-pm, g3.js ferne.K4 `je` · Wurzel: das Pixel des Orts ist der Gesetz-Punkt projiziert, der gezeichnete Ring steht ±50 m daneben — die Station misst daneben, der Grat-Himmel am Hang zieht 14 % (Median) · ferne.K4#1 · S (der Ort aus der Tiefe des Bilds statt aus dem Gesetz).
- Gipfel-Blick ≤ 3 min — FUND stamm (Leib-Guss der Bewohner, `_weltOffen` leiber) · Wurzel: die Metropole am Anlauf trägt 959 Leiber, ein Leib je ~12 Takte, und 461 Foundry-Bauten — die Welt steht erst nach 26 000 Takten; dazu die Tanne im Blick des Gipfels (spec/profiband/haushalt.json gipfel-blick) · M.
- FARBTON 8 km 15–26° — FUND spec/abnahme/soll-tafel.json boden-nah / stamm/daten.js:614 `WIESEN_GRUND` · Wurzel: die Wiese der Welt (Halm-Mittel Y 0,17, gelbgrün) steht ohne Luft bei 0,75 der In-Streuung (real ~0,4); eine dunklere Fern-Wiese bräche die Naht zur helleren Nähe — eine Look-Entscheidung über die Wiese als Ganzes · L.
- Welle 2: keiner der drei Punkte fiel ganz.

Ich warte im Wartezimmer.

## 08.11. 22:49 — GPU-PROBE 1f8b19ed auf omen-gtx1060: ROT in 1964 s (bild:gipfel-blick@0.5 ROT 579 s · bild:wiese@0.5 GRÜN 49 s · bild:gipfel-blick@0.735 ROT 537 s) → probe-post/w25-ferne-licht/1f8b19ed.md

## 08.11. 21:40 — w25-ferne-licht: Nachtrag zur ABGABE 1f8b19ed

Die geschärfte NEUN-Seite des Zweigs w25-ferne-licht-pm (4b84b72) lief am Kopf 1f8b19ed ganz durch (swiftshader voll, Dorf, Teil B, nichts ausgelassen): ferne.K4 ohne den Schleier der Luft 0,4297 (Ls 0,0282 / Ll 0,0657, 21/64 Orte, Grat 5,33 km, Sonne 5,01°, luft 0, 30,6 s auf swiftshader) — 0,03 über dem Soll 0,4; der Rest ist der Grat-Himmel der 96-m-Karte (FUND unten).

## 08.11. 21:25 — w25-ferne-licht: ABGABE 1f8b19ed145a3a6f11cc1e2bf9adfa3492e1338e

ABGABE 1f8b19ed145a3a6f11cc1e2bf9adfa3492e1338e — Abgabe w25-ferne-licht (main 53b2fc7a im Kopf; Proben bild:gipfel-blick@0.5, bild:wiese@0.5, bild:gipfel-blick@0.735 am Kopf, dieselben drei am Vorher-Zweig w25-ferne-licht-vorher 888b476d = main-Licht + nur Linse und Decke).

Die acht Befunde von K1#2 (Radeon/GTX main) waren: 3× JE KANAL Uhr 0,27 ungemessen, 1× FARBTON 8 km 15°, 4× HIMMEL (Horizont grün, Duv +0,008 … +0,010). Sonnenseite 1,256/5,045 und fernes Weiß R/B 6,18 standen GRÜN — die Zahl der Karte nennt sie nur.

Geschnitten:
- welt-licht.js:44 `ATMO_ERDE` — Ψ_ms (Hillaire Gl. 5–9) sieht die Erde als Leuchtdichte der Welt-Albedo (Y 0,1236) ohne Buntheit; mit dem Laub (G/B 3,1) trug die Mehrfachstreuung den Horizont grün. Die untere Hälfte der Umgebung (jede nahe Spiegelung, der Film der Tore) behält ATMO_BODEN. CPU-Nachbau der Tafeln (trifft die Radeon auf 1 %): grüne Erde 107–134°, graue 215–217°.
- stamm/bild-sicht.js:699 — der Grat nimmt dem Hang die Himmels-Sicht der Atmosphäre (`himmelFarbe`, in jedem Stoff schon gebunden), nie die PMREM-Keule in Rauheit 0,5 (sie mittelte am Horizont den Boden mit); `gratRauheit` fällt.
- scripts/lib/licht-linsen.cjs:2094 `luftAufgeloest` — die Wache des Paars Rot/Blau zählt 8-bit-Stufen (≥ 12, wie der Grün-Kanal der Sicht), nie 0,05 · Blende linear; Selbsttest mit der Mutante der alten Wache ROT beim Namen.
- Zweig w25-ferne-licht-pm (4b84b72): ferne.K4 misst die Hänge ohne den Schleier der Luft (β 0, wie L0 der Luft-Linse). Die In-Streuung liegt gleich auf Licht- und Schattenhang (mit Luft 0,0355 / 0,0323, ohne 0,0171 / 0,0108), je N·L geteilt trägt sie allein das Verhältnis der N·L der Orte 0,29 / 0,41 = 0,71 — die Linse urteilte über die Luft (K1/K2), nie über den Grat. Mutante „durch den Schleier gemessen" ROT, `punkte.cjs selbsttest --ohne 3c` 162/162 GRÜN. Die NEUN-Seite ändert ihren Abdruck (die neun Stationen sind durch stamm/bild-* ohnehin neu zu messen).

Gemessen (swiftshader, das Urteil der Station über `werkbank licht --luft`):
- ferne.K1#2: 9 → 4 Befunde. JE KANAL Uhr 0,27 Azimut 90/180/270: ungemessen (0 Paare) → Δβ blau−rot 1,03 / 0,98 / 0,97 × Referenz (1 077 / 755 / 790 Paare); HIMMEL 4 → 0 (Ton 101–125° → 210–216°, Soll 222 ± 15); FARBTON 2 → 4 Azimute (10,5–16,4° → 14,7–25,7°).
- ferne.K1#1 T/T_soll 0,89–1,00 · ferne.K2#1 Restkontrast 0,6–1,4 % · K2-2 GRÜN — gehalten.
- ferne.K4 (swiftshader voll, Dorf, Sonne 5°, 21/64 Orte): mit Luft 0,629 → 0,622 (Radeon main 0,6352), ohne Luft 0,468 → 0,444 (Zerlegungs-Sonde; die geschärfte Station selbst 0,4297, Nachtrag); der Grat nimmt dem Schattenhang 3,6 → 6,2 % seines Himmels.
- Physik (CPU-Nachbau Hillaire je Probe): der 5,7-km-Weg aus 1 500 m trägt In-Streuung 0,0037 E0 (das Bild 0,0023) — durch die Luft der Referenz (Koschmieder 20 km) erreicht kein richtiges Bild 0,4.

Wände am Kopf GRÜN: check · lint · format:check · playtest:fast (21 ✅ · 0 ❌) · gate:welt-boot · gate:post-kette (kein [ERROR] STOFF) · gate:ego-schatten · gate:schatten-terminator · gate:betriebsgesetz (scripts +204 → −41 Atome: die `lin`-Tafeln und `Y`-Namen der Licht-Linsen waren Zwillinge von srgbLin/luma709, dazu Gleichschritte).

Ehrlich offen:
- FARBTON 8 km 15–26° — FUND stamm/daten.js:614 `WIESEN_GRUND` / stamm/gelaende-chunks.js:3214 `FERN_FARBE` · Wurzel: die Wiese der Ferne trägt keine Selbstbeschattung des Halm-Bestands (nur die Krone, `kronenSchatten` 0,32 auf Satelliten-Band), ohne Luft 0,75 der In-Streuung statt ~0,4 — gegen den nun blauen Horizont zeigt ihr Grün durch · ferne.K1#2 FARBTON · L (Nah-Fern-Naht, Soll-Tafel boden-nah).
- ferne.K4 ohne Luft 0,43 > 0,4 — FUND stamm/dirigent-ankunft.js:1797 `HORIZONT_KARTE` (`zelleM` 96 m) · Wurzel: die Karte liest nahe Grate (60–240 m vor dem Hang) bis 10° zu flach (Grat des Gesetzes 10,3° → Karte 8,1° im Median), der Abzug des Himmels 6,2 % statt 18,5 % (Nachbau, Band ±30°) — mit ihm ergäbe der Nachbau 0,38 · ferne.K4#1 · M.
- ferne.K1#2: 7 von 8 Befunden der Karte heil, FARBTON wuchs von 1 auf 4 Azimute; ferne.K4#1 nicht GRÜN.

Maßstab: Hillaire 2020 (Ψ_ms über einer grauen Erde wie Bruneton 2017), die CIE-Tageslicht-Ortskurve (Judd, MacAdam, Wyszecki 1964), Horizon-Based AO aus der Himmels-Sicht der Atmosphäre (UE5 SkyAtmosphere liest die Sky-View-LUT).

Ich warte im Wartezimmer.

## 22:55 Koordinator
ABGABE 1f8b19ed ist angenommen und fährt in **z330**. Das Wiesenbild habe ich gegen dein Vorher (888b476d) gelegt: praktisch gleich, Luma 55,1 → 54,6, kein Rückfall in der Nähe. Das Gipfel-Bild riss auf der GTX den Deckel von 480 s (579 bzw. 537 s), beide Male ohne Bild. Den Horizont misst darum nach der Landung die Station ferne.K1#1/#2 auf der Radeon.
**Nächster Auftrag im selben Faden (`w25-ferne-licht-2` vom Kopf 1f8b19ed):** deine beiden offenen Punkte, FARBTON 8 km 15–26° und ferne.K4 > 0,4. Dazu der Gipfel-Blick als Bild: Benenne, warum er auf der GTX über 480 s braucht. Ist es der Bau der Ferne bis zum Gipfel? Die Linse muss in ≤ 3 min ein Bild liefern. Richter ferne.K1#2 und ferne.K4, Bild `[gpu-probe: bild:gipfel-blick@0.5]`.

## 00:28 Koordinator
ABGABE bcf8f14a (ferne-licht-2) ist angenommen und fährt in **z332**, sauber auf main 46128b75. Der Grat folgt dem Gesetz enger: 8,1 → 9,5° bei 10,3° Gesetz. ferne.K4 bewegt sich kaum (0,444 → 0,446).
Dein Rest bleibt dein Auftrag, Reihenfolge nach Punkten: **ferne.K4 ≤ 0,4** zuerst. Das Pixel des Orts trifft den Ring ±50 m neben dem Gesetz; schneide den Treffer an der Wurzel, nicht die Toleranz. Danach der Gipfel-Blick ≤ 3 min: 26 000 Takte am Anlauf sind der Täter, benenne ihn im Takt. Der FARBTON der Wiese kommt zuletzt.

## 02:16 Koordinator
ABGABE 017e9839 (ferne-licht-3) fährt in **z334**: ferne.K4 an der Station 0,4458 → 0,4385, der Gipfel steht nach 21 441 statt mehr Takten. Weiter mit K4 ≤ 0,4: Das Pixel trifft die Masche des Rings bis 365 m neben dem Gesetz. Der Treffer muss das Gesetz selbst lesen, nicht die Masche.

## 02:50 Koordinator — die Radeon misst anders als swiftshader
An main f52b3a03 (mit deinem ferne-licht-3) misst die Station auf der Radeon **ferne.K4#1 = 0,6243** (Soll ≤ 0,4). Dein swiftshader-Wert ist 0,4385. Der Unterschied zwischen den Renderern ist größer als dein ganzer Schritt. Miss K4 ab jetzt auf echter GPU, per `[gpu-probe: gate:<deine K4-Linse>]` oder als Bild. Benenne, was auf der GPU den Schatten-/Lichthang hebt (Schatten-Kaskade, Atmosphäre, Tonemapping). ferne.K1#2 bleibt ROT: Farbton 8 km 1,6–25° (≤ 10°), fernes Weiß R/B 6,25 (≥ 1,3).

## 03:26 Koordinator
ABGABE 4ecfb1a3 (ferne-licht-4) ist angenommen und fährt in **z337** mit lod-pop-4. Deine Linse `w25-ferne-licht-4-pm` (ohne den Schleier der Luft, am Pixel des Orts) ist in punkte-maschine (f621fc10). Begründung angenommen: Die In-Streuung liegt auf beiden Hängen gleich, das 3×3-Feld mischte den sonnigen Nachbarn ein. Nach der Landung misst die Radeon ferne.K4#1 mit der neuen Linse. Weiter mit ferne.K1#2 (Farbton 8 km, fernes Weiß R/B).

## 04:40 Koordinator
ABGABE f102e1f5 (ferne-licht-5) ist angenommen und fährt im nächsten Zug nach z337, sobald ich deine Bilder (genesis, wiese) gegen main gelegt habe. Die ferne Wiese wird deutlich dunkler, das will ich sehen. Offen bleibt, was du selbst benannt hast: Die Linse rechnet den Ton je Pixel aus 4–13 Stufen Buntheit, zwei Läufe derselben Welt ergeben 6,0 gegen 12,3°. Die Linse streut damit mehr als dein Abstand zum Soll. Mach den Ton deterministisch, z. B. als Mittel im Bereich statt je Pixel, als Zweig auf punkte-maschine mit Selbsttest.

## 04:58 Koordinator — ferne.K4 GRÜN auf der Radeon, gebucht
An main eff50c41 (z337, dein ferne-licht-4 mit der Linse f621fc10): **ferne.K4#1 GRÜN 0,3452** (Soll ≤ 0,4). Gebucht 222/330. ferne.K1#2 bleibt ROT: Farbton 8 km 1,5–24,17°, Sonnenseite und fernes Weiß. ferne-licht-5 fährt nach dem Bild.

## 05:05 Koordinator
Deine Bilder (genesis, wiese) habe ich gegen main gelegt: kein Rückfall in der Nähe. ferne-licht-5 fährt in **z338**. Danach misst die Radeon ferne.K1#2.

## 05:37 Koordinator — Radeon nach z338 (dein ferne-licht-5 in main)
An main 691c46e9: **ferne.K1#2 ROT, aber nur noch 2 Befunde (vorher 4): Farbton 8 km 0,85–12° (Soll ≤ 10°)**. ferne.K1#1, K2#1 und K4#1 (0,349) GRÜN. Du bist knapp vor dem Punkt. Mach zuerst die Ton-Linse deterministisch (zwei Läufe 6,0 gegen 12,3°), dann siehst du, ob die 12° echt sind oder Streuung. Ist der Azimut mit 12° echt, schneide ihn.

## 06:22 Koordinator
ABGABE 42f5cb6c (ferne-licht-6) ist angenommen und fährt als **z340** hinter z339. Der Ton des Bands statt des Tons je Pixel ist eine Korrektur, kein Aufweichen: Der Ton fast grauer Pixel ist schlecht gestellt, zwei Läufe sind jetzt auf die Hundertstel gleich, und die Mutante je Pixel steht im Selbsttest. Nach der Landung misst die Radeon ferne.K1#2 mit der neuen Linse.

## 07:15 Koordinator — z340 ROT: luma709 im Seiten-Kontext
z340 (nur dein ferne-licht-6) fiel an der Prüfbühne, zweimal gleich: `diag-pruefbuehne.cjs ABSTURZ: ReferenceError: luma709 is not defined`. Deine drei Ersetzungen in `scripts/diag-pruefbuehne.cjs` (:314, :318, :371, :998) stehen in Code, der per `page.evaluate` im BROWSER läuft. Dort gibt es die Node-Funktion aus licht-linsen.cjs nicht. Schneide an der EINEN Quelle: Lege `luma709` vor den Proben einmal in die Seite (z. B. `await page.evaluate(\`globalThis.luma709 = ${luma709}\`)` aus dem Node-Import) oder an den Ort, den welt-boot für Seiten-Helfer nutzt. Kein Zwilling der Formel. Prüfe mit `node scripts/diag-pruefbuehne.cjs` (lokal, GPU-Gruppe 16) und dann `BEREIT <sha>` auf w25-ferne-licht-6.

## 08:15 Koordinator
Deine Heilung a5a201de (luma709 aus abnahme-urteil in der Seite) fährt als **z342**. Danach misst die Radeon ferne.K1#2 mit dem Ton des Bands.

## 09:10 Koordinator — Radeon nach z342 (ferne-licht-6 mit dem Ton des Bands)
An main 87537d3f: **ferne.K1#2 ROT mit 1 Befund — Farbton 8 km 1,22–10,65° (Soll ≤ 10°)**. Sonnenseite und fernes Weiß sind erfüllt, K1#1, K2#1 und K4#1 (0,349) GRÜN. Es fehlen 0,65° an einem Azimut. Benenne ihn mit der Band-Linse auf echter GPU (`[gpu-probe: gate:<luft-linse>]`) und schneide den Ton dieses Azimuts an der Wurzel, nicht an der Toleranz. Das ist der nächste Punkt.
