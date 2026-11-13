# 45 Meisterkarte Scheibe 5/8 — feld · licht · profiband · tiere (Index mod 8 = 4)

Quelle der Scheibe: `PM/meisterkarte-quelle/punkte/stand.json` (kopf ec281422, zeit 19:48Z), 33 Domänen alphabetisch, Index 4/12/20/28.
In der Scheibe stehen 19 offene Punkte in 13 Kriterien: feld 9/10 · licht 4/10 · profiband 0/10 · tiere 8/10.
ACHTUNG: `stand.json` (19:48) ist älter als `messung/ec281422-radeon.json` (20:37). Darin stehen zwei frische GRÜN, die die Buchung noch nicht kennt: tiere.K1#2 radeon und licht.K4#1 radeon.

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `BILD/dorf-main-0.5.png` (Ankunft, Mittag): Der Himmel ist von oben bis zum Hügelkamm tief marineblau mit weißen Wolkenfetzen. Der Boden steht hart besonnt und braun, der Laternenschatten ist scharf. Der Himmel ist deutlich dunkler als jede besonnte Fläche im Bild, auch am Horizont gibt es kein helles Band.
- `BILD/wiese-mitte/heute-wiese.png` (Mess-Wiese, Mittag): Zwischen den Kronen ist der Himmel graublau mit dunklen Wolken, die Kronen stehen fast schwarzgrün. Das Gras im Vordergrund ist hell und gelb besonnt.
- tiere, feld und profiband: kein Bild gesehen.
- Was es den Spieler kostet: profiband reißt im Gehen (Radeon Bild-p95 58 ms gegen ≤ 33 ms). Die Dauer bricht nach 14,8 min (3 Seiten).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Regel (punkte.cjs:4063 laut kurs-B): Staffel 1 ist GRÜN an einem Gerät, Staffel 2 ist GRÜN an allen Geräten.
| Id | geb. | was fehlt (Zahl, Kopf, Gerät) | Wurzel im Spiel | billigster ehrlicher Weg |
|---|---|---|---|---|
| feld.K5 | 1/2 | #2 hat keine Station in g1–g6 (weg.json plant sie: h6, sicher 0,35). #1 ist headless gehalten (Streu 29 → 35, Blumen 26 → 32, d3708675, R6 Linse) | `stamm/feld-leben.js:1875` auraAt ist die Lese-API. Pflege-Probe: `stationen/g1.js:463` feldProbe | #2 als zweiter Lauf von feldProbe an Dorf + GTX, dazu Tier-Sichtungen je Zelle. Nur Station |
| licht.K1 | 0/2 | #1 GTX frisch ROT (36f9d45a, roh `licht.K1_1.out:269-271`). Sprung genesis −0,47 EV (Uhr 0,09→0,1, Sonne −56°), Sprung wiese 0,50 EV (Uhr 0,25), Soll ≤ 0,1. Sonne 10° R/B ×0,90/×0,95 (genesis) und ×0,96/×0,75 (wiese), Soll ≥ 1,3. Wiese 10° −1,03/−1,19 EV, Soll −1…−0,5. Genesis Nacht −1,50 EV (Luma 64), Soll −5…−3. REF in der Nacht 0,99–1,10 Stufen daneben. WEG ROT Y 0,0112 > 0,01. #2 hat keine Station | `stamm/bild-himmel.js:1911` _dayNightApplyBelichtung, `welt-licht.js:667` belichtung, `:646` belichtungStufen, `:78` BELICHTUNG (steigung 0,75). Station `g3.js:3347-3413` | siehe Schnitt (Klasse Himmel-Licht) |
| licht.K2 | 1/2 | #2: GTX ROT, Radeon R6 ungemessen. 7°: 0,958/1,036, Soll ≥ 2,5, UNGÜLTIG A/B 0,70. Regen-Mittag 1,18 UNGÜLTIG (A/B 0,71). Mittag-Schatten 0,1962 UNGÜLTIG (A/C 1,022). Himmel zur Sonne 1,205 (≥ 1,2) | Richtlicht `bild-himmel.js:1865` (KEY_BASE·π·a.lum·tint). Die Physik `foundry-core.js:372` sonne gibt bei 7° rot 0,24, grün 0,11, blau 0,03 (meine Rechnung aus `:286`/`:298`). Daraus folgt Kugel ≈ 4:1, nicht 1:1 | A/B 0,70 heißt: Die besonnte Kugelseite liegt im Wurf. Die Ort-Suche prüft Werfer nur bei 20°/45° (weg.json, Muster `g3.js:477`). Schnitt an der Pose, nie am Soll |
| licht.K3 | 1/2 | #2: Radeon ec281422 und GTX a41ce72d ROT. Nur 6 von 33 Zeilen fallen: fichte/tanne „Karte und Gestalt teilen kein Pixel“. Ring, Feld, Panorama, Spiegel und Wasser liegen bei 0,92–1,01 | Baum-Karte (Pflicht A, laub-kante). `bild-sicht.js` _weltLicht steht | kippt mit der Baum-Karte (w28-karte-stamm 9597ffb2 in z427) |
| licht.K4 | 1/2 | #1 Radeon GRÜN frisch (ec281422, r 0,988). #2 hat keine Station; das Gesetz fehlt (2,5D-Wolke, h34) | `bild-himmel.js:204` _wolkenSchatten, `welt-licht.js:971` himmelSicht (2D-FBM) | teuer (L), nicht diese Welle |
| licht.K5 | 1/2 | #2 hat keine Station (Regen-Richtlicht ≤ 1,5 + Purkinje, h12) | `bild-himmel.js:1865`, Purkinje nur als Mond-Hue `foundry-core.js:305` | nach dem Schnitt unten |
| profiband.K1 | 0/2 | Radeon 1cd1c408: wiese-ego-geht 58,28, sprint 83,69, genesis-third-geht 58,31 gegen ≤ 33, gedrosselt. GTX zuletzt 07.11. (50,0) | `stamm/dirigent-takt.js:2107` _runFrameScheduler, `:1822` _kappeOffen | Pflicht E, bewegter Takt (h40). Kein Bild-Schnitt |
| profiband.K2 | 0/2 | Belegung genesis 32,25/31,98 gegen ≤ 5,8 (Radeon 1cd1c408) | `stamm/bild-diaet.js:594` _diaetRefresh (Aufruf `bild-kosten.js:74`, `stoff-material.js:569`) | Pflicht E |
| profiband.K3 | 0/2 | gpu-bank 19,9/26,73 ms gegen ≤ 12. VRAM 139,3/129 MB gegen 118 | spec/profiband/ratsche-*.json | Pflicht E |
| profiband.K4 | 0/2 | #1 Radeon ec281422 ROT: Gehen 1 Bild 100,14 ms (> 100), Fahrt „blind (6 Bilder in 2,5 s)“, Sattel 1. Am dc9eacb0 GRÜN (max 58,76) | Richter `stationen/g6.js:1672-1698` (Staffel 1: EIN Fenster ohne Bild > 100 ms) | 0,14 ms über der Kante. Eine frische Fahrt am Kopf oder ein gültiges Fahrt-Fenster bucht +1 |
| profiband.K5 | 0/2 | 14,78 min in 3 Seiten (Soll 20 min am Stück). Drift 58,66 → 83,68 ms. Heap +27,8 MB/min (dc9eacb0). Weg 0,2 km gegen 5 km | `scripts/werkbank.cjs` puffer --gang (laut weg.json; nicht gelesen) | Heap-Leck unbenannt, teuer |
| tiere.K1 | 1/2 | #2 Radeon GRÜN frisch (ec281422: 5 sichtbar, 1 Fleck). GTX zuletzt ROT 1cd1c408 („2 Fleck(en) 319 px“) | Richter `stationen/g2.js:3883-3886` (flecken === 1) | NUR eine GTX-Fahrt am Kopf. Wackler: dc9eacb0 Radeon zeigte 4 sichtbar / 2 Flecken |
| tiere.K5 | 1/2 | #2 hat keine Station. Gesetz: Herde ≥ 20 im Bild, updateCreatures ≤ 1 ms bei 150 Tieren (h29) | `stamm/kreatur-verhalten.js` Separation O(n²) (laut weg.json; nicht gelesen) | teuer |

Gesetzbuch gegen Konsum (licht): Die EINE Atmosphäre (`foundry-core.js:283-388`, Hillaire) trägt Sonne, Tafeln, Kuppel und Bühne.
- Die Welt konsumiert sie ganz: Richtlicht `bild-himmel.js:1858-1865`, Lichtmesser `:2083-2119`, Kuppel `welt-licht.js:971`.
- Hemi und Ambient sind nur nachts an (`bild-himmel.js:2141`, `:2382`), es läuft also kein Tag-Zwilling.
- Gemessen ist nur die untere Bildhälfte (Tag-Kurve `g3.js:799` masse ab H/2) und die Kugel. Die Leuchtdichte der Kuppel im Ausgabe-Bild misst KEIN Kriterium meiner Scheibe.

## Die EINE begrenzende Entscheidung
In dieser Scheibe ist licht der Hebel, nicht profiband.
- profiband (10 Punkte) fällt nur mit dem bewegten Takt der Pflicht E (h40–h120, `dirigent-takt.js:2107`). Das ist eine eigene Kette, und kein Bild-Schnitt kippt sie.
- licht ist die schwächste Bild-Domäne, und das Bild der Ankunft zeigt ihren Fehler: die dunkle Mittags-Kuppel.
- Geschnitten wird NUR in der EINEN Atmosphäre und ihrem Leser (`welt-licht.js` himmelSicht/belichtung, `foundry-core.js` ATMO_*). Nie an Tönung, Belichtungs-Konstanten, Soll oder REF.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Klasse „Sonne gegen Himmel über die Uhr, am Dorf der Ankunft“. Eine Welle über vier Stufen:
1. Mittag, Kuppel: Zuerst messen. Leuchtdichte der Kuppel (Zenit, 45°, Horizont) im Ausgabe-Bild am Dorf gegen E_himmel/π·k aus derselben Tafel (`bild-himmel.js:1692` _himmelsBestrahlung, k `:1914`). Rechnung aus der Licht-Bilanz (Verhältnis 5,27, Diffus 0,19): Die mittlere Kuppel liegt bei Mittelgrau der Karte. Das Bild zeigt sie mehrere EV darunter. Geschnitten wird erst, wenn die Messung zeigt, wo Kuppel und Tafel auseinanderlaufen.
2. Tiefe Sonne 7–10°: Das Richtlicht ist physikalisch warm (Durchlass rot/blau ≈ 9 bei 7°, `foundry-core.js:372`). Im Bild ist es kalt (R/B ×0,75–0,96), weil die Messfläche im Wurf liegt. Schnitt an der Pose der Kugel-Station (Werfer an der Uhr der Spalte prüfen, nicht bei 20°/45°). Gemessen, nicht geraten: Steht die Kugel frei, ist das Verhältnis ≥ 2,5 Physik.
3. Dämmerung: Der Sprung an der Wiese (Uhr 0,25, 0,50 EV) ist der binäre Kronen-Wurf im Lichtmesser (`welt-licht.js:699-707`, dort selbst gemessen 0,15–0,18 EV mit Dichte-Profil). Das Dichte-Profil der Krone kommt in `_horizontSichtImBild` (`bild-himmel.js:2100`).
4. Nacht: Genesis −1,50 EV (Luma 64) und Sprung bei Uhr 0,1 (Sonne −56°). Ursache nicht gelesen; Kandidat ist der Laternen-Pool der Ankunft (w28-samen-lichtweg: „4 von 12 beleuchten“).

Leser-Liste (vor dem Schnitt):
- Kuppel `bild-himmel.js:249`
- Spiegel/Wasser `welt-licht.js:952` himmelTafel
- Bühne der Studios (`stamm/studio-bruecke.js`, `worlds/garage/garage.js`, `worlds/schmiede/schmiede.js` lesen __weltLicht)
- Luft `bild-himmel.js:2337-2343`
- Lichtmesser `:2083`
- Augen-Licht `:1962`
- bild-sicht.js, bild-schatten.js, dirigent-takt.js (__weltLicht)

Kosten-Zeile: Uniforms und CPU-Tafeln, die nur bei Änderung neu rechnen. 0 ms je Bild erwartet; zu messen per gpu-bank am Dorf vorher und nachher.

Kriterien (Ist ↔ Soll, Station):
- licht.K1#1: Sprung 0,50 ↔ ≤ 0,1 EV · Gold R/B 0,75 ↔ ≥ 1,3 · Nacht −1,50 ↔ −5…−3 (`g3.js:3347`, GTX)
- licht.K2#2: Kugel 7° 0,96 ↔ ≥ 2,5 (`g3.js:418ff`, beide Geräte)
- licht.K5#2 Station (Regen-Kugel ≤ 1,5) nach Stufe 2

Kein Pflicht-OFFEN-Eintrag hängt daran. Der Ort ist F/Dorf.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-samen-lichtweg` d8887125 (WIP, nur `samen/lichtweg/`): Befund Licht-Pool, kein Kern-Schnitt. Bis zur Landung fehlen der Schnitt und das Bildpaar.
- `w28-karte-stamm` 9597ffb2 fährt in z427. Ob er fichte/tanne „teilen kein Pixel“ (licht.K3#2) heilt: nicht gemessen.
- `w28-tiere-nach-bild` 6d5449a3 (Abgabe 13.11.): Wesen kehren nach dem ersten Weltbild wieder. Bezug zu tiere.K1/K5: nicht gelesen.
- Für die Kuppel und die tiefe Sonne liegt kein Zweig. Den Himmel bearbeitet niemand (ÜBERGABE §3).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gemessen: Leuchtdichte der Kuppel im Ausgabe-Bild gegen die Tafel. Ob der Fehler in himmelFarbe/U.toenung liegt oder in der Tonkurve: offen. Rechnung oben, kein Schuss.
- Widerspruch weg.json ↔ meine Rechnung: weg.json nennt als Täter „Richtlicht bei 7° nur 0,90/1,03 des Himmels“. Die Gültigkeit A/B 0,70 und der Durchlass von `foundry-core.js:372` sprechen für die Pose.
- Nicht gelesen: kugel.js (Ort der Kugel-Probe Staffel 1/2), `spec/farbe/tag-ref.json` (REF der Nacht), die Ursache des Genesis-Sprungs bei Uhr 0,1, `scripts/werkbank.cjs` puffer --gang, `stamm/kreatur-verhalten.js`.
- Nicht gelesen: welches Kriterium `g2.js:2939` (Pflege-Probe mit Tier-Zählung) trägt.
- Der WEG der Tag-Probe ist selbst ROT (Y 0,0112 > 0,01). Exit 1 käme auch nach einem Licht-Schnitt. Das ist ein Apparat-Rest, den das Kriterium nicht verlangt.
- Die Buchung kennt tiere.K1#2 radeon und licht.K4#1 radeon GRÜN (ec281422) noch nicht (stand 19:48).

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Kuppel + tiefe Sonne am Dorf: Wirkung 5 · M. Risiko: Die Kuppel ist Leser von Spiegel, Bühne und Luft; ein Schnitt an himmelSicht ändert jedes Studio, darum ein Bildpaar je Leser.
- licht.K2#2 Kugel-Pose: Wirkung 1 · S. Risiko: Die Station liegt in der Punkte-Maschine; sie pusht nur auf SELBSTTEST GRÜN.
- tiere.K1#2 GTX-Fahrt: Wirkung 0 · S. Risiko: Wackler, 1 gegen 2 Flecken bei gleichem Kopf.
- profiband.K4#1: Wirkung 1 · S (frische Fahrt). Risiko: 0,14 ms über der Kante, ein GRÜN ohne Schnitt ist Glück und kein Fortschritt.

Fünf Punkte dieser Scheibe, die ein Bild-Schnitt nebenbei kippt:
1. licht.K3 +1: Die Baum-Karte trifft die Gestalt (fichte/tanne, 6 von 33 Zeilen).
2. licht.K2 +1: Die Kugel steht bei 7° frei (Pose), A/B 0,70 wird gültig.
3. licht.K1 +1: Dichte-Krone im Lichtmesser (Sprung 0,50 → ≤ 0,1) und warme tiefe Sonne auf freier Fläche.
4. tiere.K1 +1: Die Herde am Hang als EIN Fleck an der GTX (Radeon schon GRÜN).
5. profiband.K4 +1: Jeder Takt-Schnitt, der den einen 100,14-ms-Hänger im Gehen nimmt.
