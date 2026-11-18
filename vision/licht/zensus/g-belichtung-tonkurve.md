# (g) Das Ende der Kette: Belichtung, Auge, Tonkurve, Nachbearbeitung

Gelesen auf `strahler-leuchte` 2ce8a033d, nur lesend. Die Rechnungen von Hand habe ich mit einem node-Skript nachgeprüft
(scratchpad `zensus/g/tm.cjs`, ein Nachbau der Vendor-Formel, keine GPU).
Abkürzungen: WL = welt-licht.js · BH = stamm/bild-himmel.js · BK = stamm/bild-kosten.js · DK = stamm/dirigent-kern.js ·
SM = stamm/stoff-material.js.
Klassen der Herkunft: **FOLGT** (aus Physik oder anderem Datum gerechnet) · **NORM** (Norm, Literatur oder Fremdmessung) ·
**SELBST** (gesetzt, dann am eigenen Bild nachgemessen, aber nicht hergeleitet) · **GESETZT** (gesetzt, ohne Anker).

## 1. Tafel der Größen

| # | Name | Wert | Einheit | Anker | Def. | Leser | Klasse |
|---|------|------|---------|-------|------|-------|--------|
| 1 | BELICHTUNG.kurve | "NeutralToneMapping" | – | Messung C*ab/Himmelsweiß gegen ACES/AgX (Radeon, 15.10.), DIRIGENT-ANKUNFT:160-165 | WL:174 | stamm/dirigent-ankunft.js:167, WL:1305, WL:1406 | NORM |
| 2 | zielKarte | 0,22 | k·L (Stellwert vor der Kurve) | Umkehr der Kurve: Neutral(x)=0,18, x=0,2212 (licht-linsen.cjs:2836) | WL:175 | WL:773, BH:2109 | FOLGT (auf 0,22 gerundet) |
| 3 | min | 0,05 | Stellwert k | „Wand gegen entartetes Licht“ | WL:176 | WL:773 | GESETZT |
| 4 | steigung | 0,75 | Stellwert ohne Einheit | Frostbite qualitativ; Folge nachgemessen an der Mess-Wiese (BH:3401-3405) | WL:177 | WL:755, BH:2018 | SELBST |
| 5 | gleitung[0] (oben) | 12 | ° Sonnenhöhe | keiner | WL:178 | WL:753, BH:1974, BH:2105 | GESETZT |
| 6 | gleitung[1] (unten) | 8 | ° | keiner | WL:178 | WL:753 | GESETZT |
| 7 | stufen Tag-Knoten | (10°, −0,87) | °, EV | „Karte −0,87, Bild −1,17 EV“, eigenes Bild (BH:3402-3403) | WL:179 | WL:744-751 | SELBST |
| 8 | stufen Nacht-Knoten | (−20°, −2,17) | °, EV | „Luma 44“, eigenes Bild (BH:3403-3404) | WL:179 | WL:744-751, BH:2018, BH:2106 | SELBST |
| 9 | nachtKnotenE | MOND_E = 0,65 · luma(mond) = 0,462 | Welt-Einheit (E) | MOND_STAERKE 0,65 (WL:169) × Mondton (foundry-core.js:312) | WL:172/180 | WL:772 | FOLGT (aus gesetzter 0,65) |
| 10 | nachtKnotenGrad | −6 | ° | bürgerliche Dämmerung | WL:181 | WL:771 | NORM |
| 11 | nachtGrad | −32 | ° | keiner (die astronomische Nacht liegt bei −18°) | WL:182 | WL:846→851, BH:1904 | GESETZT |
| 12 | AUGE.p | 0,2 | Exponent | ln 13,1 / ln 385 000 (WL:55-58) | WL:85 | WL:94, WL:105, SM:2364, SM:714, DK:1619 | FOLGT |
| 13 | AUGE.q | 0,42 | Exponent | CIE L* (1/3), „Feld 0,30–0,42“, gewählt am oberen Rand (WL:62-63) | WL:86 | WL:123, WL:146, SM:2363 | NORM (Wahl am Rand) |
| 14 | AUGE.anteil | 0,25 | Anteil | Gasse k 1,14/0,96/0,84 (WL:78-79), eigenes Bild | WL:87 | WL:137 | SELBST |
| 15 | AUGE.zustandMinLux | 0,005·π/0,18 = 0,0873 | lx | MESOPISCH | WL:88 | WL:117 | FOLGT |
| 16 | AUGE.welt | 7,83 | Welt-Einheit (E) | Messung `werkbank licht --uhr 0.5` (WL:56) | WL:89 | WL:94, WL:105, DK:1619, SM:714, worlds/fachwerk/fachwerk.js:666 | FOLGT (Messung der Welt) |
| 17 | AUGE.lux | 115 000 | lx | keine Quelle genannt | WL:90 | WL:94, WL:105, DK:1619, SM:714 | GESETZT |
| 18 | AUGE.eps | 0,1 | Anteil | keiner | WL:91 | WL:146 | GESETZT |
| 19 | AUGE.saum | 0,3 | Anteil der Reichweite | keiner | WL:92 | SM:2446, stamm/bild-schatten.js:496 | GESETZT |
| 20 | MESOPISCH.staebchenCd | 0,005 | cd/m² | CIE 191:2010 | WL:83 | WL:88, BK:2211 | NORM |
| 21 | MESOPISCH.zapfenCd | 5 | cd/m² | CIE 191:2010 | WL:83 | BK:2213 | NORM |
| 22 | MESOPISCH.karte | 0,18 | Albedo | 18-%-Karte | WL:83 | WL:88 | NORM |
| 23 | NACHT_AUGE.luxJeEinheit | 0,26/0,224 = 1,161 | lx je Welt-Einheit | „0,224 fachwerk LICHT_GESETZ“: in fachwerk-core.js nicht gefunden (gesucht: `0.224`) | BK:3011 | BK:2211 | GESETZT |
| 24 | NACHT_AUGE.bildZapfen | [0,18; 1] | k·L | „Mittelgrau bis Weiß“ | BK:3014 | BK:2218 | GESETZT (Einheitenbruch, §3) |
| 25 | NACHT_AUGE.skotopisch | [0; 0,5437; 0,3599] | Gewichte (lin. sRGB) | V′ nach Pattanaik 1998 über sRGB→XYZ, Rot −0,0603 auf 0 geklemmt | BK:3015 | BK:2225 | FOLGT |
| 26 | NACHT_AUGE.staebchenStaerke | 1,22 | Faktor | Boden S0 Luma 24,1 wie main (BK:3003-3005) | BK:3016 | BK:2225 | SELBST |
| 27 | NACHT_AUGE.umkehrSchritte | 3 | Anzahl | Linse (j) | BK:3017 | BK:2245 | SELBST |
| 28 | Neutral startCompression | 0,76 | k·L | Khronos PBR Neutral | Vendor three.webgpu.min.js (`mT`, yn(.76)) | ToneMapping-Knoten | NORM |
| 29 | Neutral desaturation | 0,15 | Faktor | Khronos | Vendor (`yn(.15)`) | dto. | NORM |
| 30 | Neutral Fuß | 0,08 / 6,25 / 0,04 | k·L | Khronos | Vendor | dto. | NORM |
| 31 | Ausgabe-Farbraum | sRGB (Renderer-Vorgabe; Bühne WL:1306) | – | sRGB | WL:1306; Welt: r184-Vorgabe `outputColorSpace=ie` | Ausgabe-Quad | NORM |
| 32 | bloomThreshold | 0,86 | Welt-Luminanz VOR k | „nur helle Spitzen“ | BK:2338 | BK:2421 | GESETZT |
| 33 | bloomStrength | 0,38 | Faktor | „browser-justierbar“ | BK:2339 | BK:2442 | GESETZT |
| 34 | bloomRadius · px | 2,2 · 0,0018 | UV | keiner | BK:2340, BK:2424 | BK:2424 | GESETZT |
| 35 | Bloom-Breite | +0,25 | Luminanz | keiner | BK:2421 | BK:2421 | GESETZT |
| 36 | Bloom-Gewichte | 0,227/0,094/0,056 | – | ungefähr Gauß | BK:2425-2435 | BK:2436-2441 | GESETZT |
| 37 | godrayThreshold | 0,8 (+0,2) | Welt-Luminanz VOR k | keiner | BK:2357 | BK:1599 | GESETZT |
| 38 | godrayDensity | 0,55 | UV-Länge | keiner | BK:2356 | BK:1597 | GESETZT |
| 39 | Godray-Abklang | 0,96^i | – | keiner | BK:1602 | BK:1602 | GESETZT |
| 40 | GODRAY.skala/schritte | 0,25 / 20 | – | Kosten | BK:3033 | BK:1583 | GESETZT |
| 41 | localContrast · lcPx | 0 (Regler) · 0,0026 | – | Spieler-Regler | BK:2345-2349, BK:2473 | BK:2482 | GESETZT |
| 42 | ZEIT_SCHAERFE | 1 | – | keiner | stamm/dirigent-takt.js:2703 | stamm/dirigent-takt.js:2561 | GESETZT |
| 43 | SZENE_SKALA | 0,75 | – | Kosten (56 % der Pixel) | BK:3021 | BK:2168 | GESETZT |
| 44 | ZEIT_KERN | 7 | 1/px² | „schärfer als Unreals 2,29“ | BK:3025 | BK:1691 | GESETZT |
| 45 | ZEIT_GAMMA_RUHE | 1,25 | σ | r184: 1 | BK:3026 | BK:1697 | GESETZT |
| 46 | RAUM.blendeS | 0,8 | s | keiner | stamm/stoff-dach.js:300 | BH:2028 | GESETZT |
| 47 | RAUM.blendeHellS | 0,3 | s | keiner | stamm/stoff-dach.js:300 | BH:2028 | GESETZT |
| 48 | RAUM.sprungM | 3 | m | keiner | stamm/stoff-dach.js:300 | BH:2025 | GESETZT |
| 49 | Raum-Deckel | g ≤ 2, dt ≤ 0,25 s | –, s | keiner | BH:2003, BH:1987 | dort | GESETZT |
| 50 | Start-Belichtung | 1,0 | k | Startwert | stamm/dirigent-ankunft.js:168 | bis zum ersten BH:1939 | GESETZT |
| 51 | Lux-Ersatz ohne Lesung | `_augeLux ?? 1` | lx | keiner | DK:1623, DK:1629, DK:1849, bild-schatten.js:503; Uniform-Start augeS(1), SM:713 | dort | GESETZT |
| 52 | k-Ersatz | `toneMappingExposure > 0 ? … : 1` | k | keiner | BH:2071 | BH:2072 | GESETZT |

## 2. Die Rechenwege

**W1 Lichtmesser → k (Welt).** `_waagrechtIrradianz` (BH:2186) summiert Richtlicht·Horizont-Sicht, den Himmel der Tafel, Hemi und Ambient zu E (rgb, Welt-Einheit).
`_belichtungAusLicht` (BH:1945) addiert das Becken bz (W2) und ruft `belichtung` (WL:769).
Dort gilt h = asin e; E = max(luma, nachtKnotenE·smoothstep(h/−6°), 1e-6); k = max(0,05; 0,22·2^stufen(h, E/EA) / (0,18/π·E)).
`belichtungStufen` (WL:743) rechnet über 12° den Wert 0,25·log2(E/EA). Unter 8° gelten die Knoten (10° −0,87, −20° −2,17), dazwischen wird in h gemischt.
Der Anker EA = KEY_BASE·π·(Sonnen-Durchlass·Luma + Tafel-Himmel) (WL:779). Geschrieben wird `toneMappingExposure` an BH:1939.
Die Einheiten: Welt-Einheit E, dann Stufen (EV), dann k ohne Einheit, gerechnet je Bild und ohne Zeitkonstante.

**W2 Becken → Messer.** Gerechnet wird bz = augeMesser(ΣE_Quellen_am_Auge [lx], augeLux(luma, tag)) · augeMass (BH:1957).
augeMesser = 0,25·zeig(E, A) (WL:137). Dabei ist zeig = min(S(A)((1+E/A)^0,42−1), S(A+E)·E/(A+E)) (WL:123), mit der Skala S(lux) = 7,83·(lux/115 000)^0,2 (WL:94).
Hier bricht die Einheit: Lux gehen durch die Skala S in „Welt-Einheiten“ und von dort, mal augeMass, zurück ins lineare E des Messers.

**W3 Raum.** In `_raumBlendeTakt` (BH:1983) ist das Ziel max(−8,68; log2((D + Feld)·Himmel-Anteil)). Die Zahl −8,68 kommt aus −2,17/(1−0,75) (BH:2018).
Das Ziel wird mit τ 0,8 s bzw. 0,3 s tiefpassgefiltert. Danach k ← k·2^(stufen(12°, 2^s) − s) (BH:1974).
Das ist der EINZIGE zeitliche Adaptionsweg; der Außen-Messer folgt dem Licht ohne Zeitkonstante.

**W4 Studio-Bühne.** Rechnung: `buehne` (WL:1371) → `belichtung(E, A.belichtung, s[1])` mit der Vorgabe-Stufung. Ohne Becken, Raum, Hemi und Ambient; die Bühne trägt nur den Tag (WL:1219).
Der Renderer ist der eigene der Studio-Seite (worlds/huelle/huelle.js:2265). Die Treue-Prüfung steht in WL:1406.

**W5 Auge der Nacht.** nightFactor = 1 − tagAchse.tag. tag ist linear in h von 0° bis −32° (WL:851) und wird an BH:1904 geschrieben.
`_nachtAuge` (BK:2204) rechnet den Stäbchen-Anteil s = (1 − clamp(log(max(l·1,161; 0,005)/0,005)/log 1000)) · nacht · (1 − smoothstep(0,18; 1; l·k)).
Der Versatz ist (skot − farbe)·s mit skot = farbe·[0; 0,5437; 0,3599]·1,22 (BK:2225-2249), gerechnet auf dem linearen Bild VOR k.
Hier bricht die Einheit: Welt-Luminanz wird mit einer festen Zahl 1,161 zu cd/m² (siehe §3, Bruch 1).

**W6 Tonkurve und Ausgabe.** Die Kette: graded = max(gesehen, 0) (BK:2490) → `pp.outputNode` (BK:2508) → r184 renderOutput mit renderer.toneMapping und toneMappingExposure → sRGB.
Vendor-Formel `neutralToneMapping` (three.webgpu.min.js, `mT`), wiedergegeben:
```
c ← c·k
m ← min(c.r,c.g,c.b);  off ← (m < 0,08) ? m − 6,25·m² : 0,04;  c ← c − off
P ← max(c.r,c.g,c.b);  wenn P < 0,76: gib c aus
d ← 1 − 0,76 = 0,24;   P' ← 1 − d²/(P + d − 0,76) = 1 − 0,0576/(P − 0,52)
c ← c · P'/P
g ← 1 − 1/(0,15·(P − P') + 1)
aus ← mix(c, (P',P',P'), g)
```
Danach folgt die sRGB-Kodierung. Der lineare Farbton bleibt erhalten; die Schulter mischt nur zu Grau P' hin.

**W7 Werkstatt-Vorschau, ein zweites Ende.** Die Szene wird in B.rt gerendert. Weil das kein Ausgabeziel ist, gilt r184 `currentToneMapping` = NoToneMapping (Vendor `isOutputTarget`).
Dann zeichnet ein Quad mit `renderOutput(…, NoToneMapping, SRGBColorSpace)` (stamm/werkstatt-vorschau.js:1547, 1562).
Es wirkt also kein k, keine Neutral-Kurve und kein Nacht-Auge: lineares Licht, an 1 geklemmt, dann sRGB.

**W8 Auge im Stoff (Licht-Pool).** `_leuchtTakt` setzt lichtAuge = (A, S(A)·m, 7,83/115 000^0,2·m) (DK:1619).
Der Shader rechnet zeig = min(A.y((1+E/A.x)^q − 1), E·(A.x+E)^(p−1)·A.z) (SM:2362-2364) und skaliert die Summe rgb damit. Das ist dieselbe Formel wie WL:123, einmal in JS und einmal in TSL.

**W9 Glut.** augeGlut(cd/m², A) = S(A+πL)·πL/(A+πL)/π · augeMass (WL:138, DK:1623, DK:1629) → Uniforms `lavaGlut` und `lichtGlut`.

**W10 Reichweite.** augeReichweite = √(cd / (x·A)) mit x = (1 + 0,1·S(aLux)/S(A))^(1/q) − 1 (WL:144, DK:1849).

**W11 Umkehrer von k (bildgebundene Werte).** Diese Leser teilen durch k:
- Augen-Licht der Höhle, I = max(0, 2^n − h)·(0,22π/0,18)/(k·Abfall) (BH:2101-2111)
- Flamme ziel 1,6/k (stamm/feld-brand.js:896, Wert 995)
- Tor 1/k (stamm/siedlung-tor.js:646)
- Zapfen-Schwelle l·k (BK:2218)

**W12 Bloom, Godray und Format.** Die Schwellen vergleichen die lineare Szenen-Luminanz VOR k (BK:2421, 1599).
Das Szenen-Ziel liegt in rg11b10ufloat mit 6/6/5 Bit Mantisse und ist gedithert (BK:2022-2080). Die Geschichte der TAAU läuft in rgba16float.

## 3. Zwillinge und Brüche

1. **Zwei Eichungen Lux ↔ Welt-Einheit in der Nacht.** NACHT_AUGE rechnet linear mit 1,161 lx je Einheit (BK:3011). Ihr Anker „0,224, fachwerk LICHT_GESETZ“ ist nicht auffindbar.
   AUGE rechnet nachts auf der Skala S (WL:94-105): 0,26 lx entsprechen 0,58 Einheiten, also 0,45 lx je Einheit, nichtlinear. Am Tag gelten linear 14 687 lx je Einheit, bei Sonne 0° 779 lx/0,056 ≈ 13 900 (WL:109).
   Das Nacht-Auge wirkt mit nightFactor > 0 schon ab 0° Sonnenhöhe. In der Dämmerung schätzt es die Leuchtdichte darum um rund 10⁴ zu klein und gibt den Stäbchen zu viel Gewicht.
   Auch der Vollmond steht mit zwei Werten im Code: 0,26 lx (WL:59, BK:2996) und 115 000/385 000 = 0,299 lx (die Herleitung von p, WL:57).
   Für die Mondnacht in Welt-Einheiten stehen drei Werte: 0,462 (MOND_E, WL:172), 0,598 (WL:57) und 0,224 (BK:2996, stamm/feld-brand.js:975).
2. **bildZapfen 0,18 vergleicht mit dem falschen Mittelgrau.** Die Schwelle gilt für l·k, also den Wert VOR der Kurve (BK:2218). Mittelgrau vor der Kurve ist zielKarte 0,22 (WL:175); 0,18 ist der Wert NACH der Kurve.
3. **Die Nacht ist an vier verschiedenen Tiefen „ganz“, und keine folgt aus dem Licht:**
   - Nacht-Knoten −6° (WL:181, in Grad über smoothstep, WL:771)
   - tagAchse.nacht −6°, aber als smoothstep im Sinus (WL:853). Das ist ein Zwilling von WL:771: gleiche Spanne, andere Variable.
   - stufen −20° (WL:179)
   - nightFactor −32° (WL:182)
   - GRENZGROESSE −18° (WL:194)

   Auch der Tag ist an drei Höhen „ganz“: gleitung 12°/8° (WL:178), stufen 10° und hell s = 0,42, also 24,8° (WL:838).
   Die Kamera ist damit ein Zeitplan über die Sonnenhöhe, der auf dem Messer liegt. Steigung und Knoten sind am eigenen Bild nachgestellt (BH:3401-3405), nicht hergeleitet.
4. **Auge-Maß ändert sich am Horizont als Stufe.** sonneTag = 0, sobald `_richtlichtSonne === false` (BH:2209). Der Lux-Weg wechselt dort von linear auf die Skala S, ausgelöst von einem Boolean.
5. **Zwei Formeln für dasselbe Auge am selben Ort,** im Kommentar selbst benannt (WL:133-134): q-Gesetz für das Becken, S-Form für die Glut. Die weiße Karte unter 63 lx zeigt 0,80, ein Fenster gleicher Leuchtdichte 0,53.
6. **Schwellen der Nachbearbeitung in Welt-Einheiten vor k.** bloomThreshold 0,86 (BK:2338) und godrayThreshold 0,8 (BK:2357) wirken je nach Tageszeit anders:

   | Zeit | k | Bloom setzt ein bei k·L | über der Karte |
   |------|---|-------------------------|----------------|
   | Mittag | 0,49 | 0,42 | +0,93 EV |
   | Vollmond | 1,85 | 1,59 | +2,85 EV |

   k am Mittag ist 0,22/(0,0573·7,83); k am Vollmond steht an WL:160. Die Schwelle ist damit weder eine Größe des Schirms noch eine physikalische.
7. **Zweites Ende ohne Kurve:** die Werkstatt-Vorschau (W7, stamm/werkstatt-vorschau.js:1547/1562) zeigt dasselbe Werk ohne k und ohne Neutral.
8. **Schreiber der Belichtung** (`toneMappingExposure`), drei im Spielcode:
   - stamm/dirigent-ankunft.js:168: 1,0 als Startwert
   - BH:1939: das Gesetz
   - WL:1371: die Studio-Bühne, eigener Renderer

   Dazu kommen zwei Faktoren im Gesetz (Becken BH:1957, Raum BH:1974), vier Umkehrer (W11) und vendor-seitiges Sichern/Zurückschreiben (`C_`/`B_`). Linsen schreiben k in scripts/lib/licht-linsen.cjs:1086, 2466-2481 und scripts/diag-post-kette.cjs:1255, 1294.
9. **Fail-soft-Ersatzwerte:**
   - `_augeLux ?? 1` lx (DK:1623/1629/1849, bild-schatten.js:503)
   - `_augeMass ?? 1` (DK:1621)
   - k-Ersatz 1 (BH:2071)
   - Post-Kette bricht → direktes Rendern ohne Nacht-Auge und Bloom, aber laut geloggt (BK:2518-2521)
10. **Klammern zwischen Stoff und Schirm:**
    - Belichtung (WL:770-773): e ∈ [−1, 1], s ∈ [0, 1], E ≥ max(Knoten, 1e-6), k ≥ 0,05
    - Stufen (WL:754): t ∈ [0, 1], die Knoten außen gehalten
    - Raum (BH:2018-2022): Ziel ≥ −8,68 EV
    - Augen-Licht (BH:2104): n ≥ −2,17
    - Auge (WL:117, 123): A ≥ 0,0873 lx, zeig ≤ S-Form
    - Nacht-Auge (BK:2211, 2214, 2242-2243): clamp(0, 1), max(0,005) als Boden, (1 − s) ≥ 0,1, ≥ 0
    - Post-Kette (BK:2490): graded ≥ 0
    - Nach-Schärfe (BK:2415): auf die Spanne der Nachbarn geklemmt
    - Dither (BK:2077-2078): Werte ≥ 0, ulp ≥ 2⁻¹⁴
    - Neutral: Fuß 0,08, Schulter 0,76, danach klemmt die sRGB-Kodierung auf [0, 1]
11. **Veralteter Kommentar:** BH:3393 nennt beim AUGE noch „das Knie“, das an WL:67-69 als gefallen beschrieben ist.

**Dynamik der Kurve** (graue Eingänge, k·L, gerechnet):

| sRGB-Stufe | k·L | gegen die Karte 0,22 |
|---|---|---|
| 1 | 0,00697 | −4,98 EV |
| 10 | 0,0220 | −3,32 EV |
| 50 | 0,0714 | −1,62 EV |
| **118** (Karte) | 0,221 | 0 |
| 200 | 0,618 | +1,49 EV |
| 230 / Schulterbeginn 0,80 | 0,836 | +1,93 / +1,86 EV |
| 250 | 1,87 | +3,09 EV |
| 252 | 2,73 | +3,63 EV |
| 254 | 7,03 | +5,00 EV |
| 255 (254,5) | 13,5 | +5,94 EV |

Von Mittelgrau bis Weiß trägt die Kurve also gut 5 Stufen, davon 1,9 linear. Von Stufe 1 bis 254 sind es rund 10 EV.

**Gesättigtes Rot und Orange in der Schulter** (von Hand, Eingang k·L):
- **Orange (4,0; 1,2; 0,2):** m = 0,2 ≥ 0,08, also off 0,04 → (3,96; 1,16; 0,16). P = 3,96, P' = 1 − 0,0576/3,44 = 0,98326.
  Skaliert ergibt das (0,98326; 0,28803; 0,03973). g = 1 − 1/(0,15·2,97674 + 1) = 0,30868.
  Ergebnis linear (0,983; 0,503; 0,331), sRGB **(253; 188; 156)**. Der lineare Farbton bleibt bei 15,8°, die Sättigung fällt von 0,95 auf 0,66. Im sRGB liegen Farbton 19,9° und Sättigung 0,38: das Orange kippt zu Lachs bzw. Pfirsich, also zum Weiß hin, nicht zum Gelb.
- **Rot (2,0; 0,3; 0,06):** m = 0,06 < 0,08, also off = 0,06 − 6,25·0,0036 = 0,0375 → (1,9625; 0,2625; 0,0225). P' = 1 − 0,0576/1,4425 = 0,96007.
  Skaliert ergibt das (0,96007; 0,12842; 0,01101). g = 1 − 1/1,150365 = 0,13071.
  Ergebnis linear (0,960; 0,237; 0,135), sRGB **(250; 134; 103)**. Die Sättigung fällt linear von 0,97 auf 0,86, im sRGB auf 0,59: aus Rot wird Lachsrot.
- Zum Vergleich unter der Schulter, (1,0; 0,35; 0,05): P = 0,9656, es wird kaum entsättigt, sRGB (240; 147; 45). Der Fuß hebt die Sättigung sogar, weil off nur 0,034 beträgt.

**Vergleich mit früheren Runden (nur `git show`):**
- Runde 3, 659651da0 (welt-licht.js):
  - zeig(E) = S(A)·E/A, also linear im Verhältnis, ohne q und ohne obere Grenze.
  - Der Zustand war `augeSicht` = A + 0,25·ΣE, und die Kamera schloss zusätzlich um `augeBlende` = (Sicht/A)^(1−p). Die Glut rechnete über der Sicht, mal Blende.
  - Heute gilt das q-Gesetz mit S-Deckel, und das Becken geht als Lux-Summand in den Messer (augeMesser) statt als eigener Blendenfaktor.
- Runde 4, 60ff344e6 (bild-kosten.js `_augeAngleich`):
  - Eine von-Kries-Angleichung in CAT02-LMS mit drei Gewinnen g (Uniform, Schreiber `_leuchtTakt`, `AUGE_LMS`) stand VOR dem Nacht-Auge.
  - Bildziele bekamen die Umkehr 1/g; die Flamme stand ohne sie blauweiß, mit Gewinnen 0,83/1,11/3,27.
  - Heute fehlen `_augeAngleich`, `AUGE_LMS`, `augeSicht` und `augeBlende` ganz (Grep über stamm, Kern, worlds und scripts: 0 Treffer). Die Kette hat keinen Weißabgleich.

## 4. Zahlen der Domäne

- **Getrennte Lichtwege: 12** (W1–W12).
- **Größen: 52** (Tafel). Davon:
  - **GESETZT ohne Anker: 30**. Im Kern des Lichtwegs (ohne die Bildkosmetik #32–49) sind es **12**.
  - SELBST (am eigenen Bild nachgestellt): 6
  - FOLGT: 6
  - NORM: 10
- **Schreiber der Belichtung: 3** im Spielcode, dazu 2 Faktoren im Gesetz und 4 Umkehrer.
- **Tag-Achsen über der Sonnenhöhe am Ende der Kette: 4:**
  - tag/−32° → nightFactor
  - stufen + gleitung, 12° … −20°
  - Nacht-Knoten 0 … −6° in Grad
  - Horizont-Boolean im Auge-Maß

  Daneben trägt tagAchse fünf Kanäle (grenze, daemmerung, tag, nacht, hell) mit drei eigenen Spannen; der Kanal nacht ist ein Zwilling des Nacht-Knotens.

## 5. Nicht gelesen und Übergaben

**Nicht gelesen:**
- der Rumpf von `_zeitAufloesung` (BK:1669-2011) und vendor/TRAANode
- `_godrayStufe` ab BK:1609
- `_beckenAmAuge`, `_raumAmAuge`, `_raumFeldAmAuge`, `_himmelsBestrahlung`, `tafelAnker`, `_lichtPlatz`
- die Werte von AUGEN_LICHT
- der Ausgabe-Pass von r184 RenderPipeline im Einzelnen: dass er renderer.toneMapping, Exposure und sRGB anwendet, schließe ich aus `rl`/`tl`/`sl` im Vendor, ohne ihn ganz verfolgt zu haben
- die Studio-Seiten worlds/garage und worlds/schmiede
- die Linsen außer `kartenEichung`

**Übergaben an Nachbar-Domänen:**
- MOND_STAERKE 0,65 und MOONLIGHT (WL:169) → Nacht/Mond
- KEY_BASE 2,6 und LEGACY_LICHT π (WL:49, WL:53), dazu der Anker EA (WL:779) → Sonne/Atmosphäre
- Hemi und Ambient im Messer (BH:2227-2228) → Umgebungslicht
- `_lichtPoolTerm` (SM:2359) und Candela je Quelle (DK:1849) → Quellen
- `augeZeig` ohne augeMass in bild-schatten.js:497 → Quellen/Schatten
- LICHT_GESETZ cdM2 (fachwerk-core.js:11392) → Fachwerk
- Flamme ziel 1,6 vor der Kurve (stamm/feld-brand.js:995) → Feuer
