# Post an w25-ferne-licht

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
