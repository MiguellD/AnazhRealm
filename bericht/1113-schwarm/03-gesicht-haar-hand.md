# 03 Gesicht, Haar, Hände — der Kopf ist eine Birne, das Haar eine Haube auf ihr

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Dorf der Ankunft, Mittag, 8–20 m (`scratchpad/mensch-paar/nach-gruppe.png`, `nach-nah-frontal.png`): Köpfe sind 15–25 px groß. Ein Gesicht ist dort nicht zu lesen, man liest nur den UMRISS. Der Umriss ist schmal und läuft oben spitz zu, darunter ein Ballon-Hemd. So entsteht der Eindruck „kleiner Kopf auf breiten Schultern".
- Studio, zwölf Leute nackt und mit Glatze (`scratchpad/genom/c-bau/zwoelf-nackt.png`, `k-nackt-vorn-07.png`): Der Schädel ist ein aufrechtes Ei, das sich nach oben verjüngt. Am breitesten ist der Kopf auf Augenhöhe, wo seitlich Lappen abstehen (Schläfe und Ohr). Von der Seite (`k-nackt-seite-04.png`) ist die Kalotte hinten groß, und unter dem Hinterkopf sitzt ein Wulst am Nacken.
- Studio mit Kleid und Haar (`zwoelf-kleid.png`, `k-kleid-vorn-02.png`): Das Haar sitzt bei jedem Stil als Büschel oder Haube oben auf dem Scheitel. An den Seiten liegt es eng an, weißes und graues Haar wirkt wie eine Bademütze.
- Nah, L0, 3 m (`koord-hebel/probe-post/w28-leib-nah/7-paar-nah-heute-kandidat.jpg`, `mensch-paar/nach-eng-0-rot.png`): Augen, Brauen und Lippen sind da. Das Haar wirkt wie ein gestreifter, geleckter Helm, die Hände haben fünf Finger.
- Grobstufe L1 (`13-grobstufe-poncho-hemd.jpg`): Das Gesicht ist fast leer, nur ein Punkt als Auge und rote Lippen. Das Haar ist eine glatte braune Kappe, das Ohr ein Klumpen.
- Satz der Menge L2 bei 10 m (`6-satz-der-menge-10m.jpg`, `8-paar-10m-heute-kandidat.jpg`): Der Kopf ist ein spitzes Ei, die Haarkappe hört hinten scharf auf Ohrhöhe auf. Es gibt kein Ohr und kein Auge, die Hände sind Fäustlinge ohne Finger.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- Proportion stimmt in Zahlen. `koerper-core.js:1188` kopf.mass 0,7, Kopf 0,130 H (`:1094`, `_kopfLage :2101`). Im Bild 6 ist der Kopf 70 px breit bei 230 px Schultern, also 0,30. Das Soll ist 0,086 H : 0,29 H (`:1249`, `:1312`), ebenfalls 0,30. Die Größe ist also nicht der Fehler, die FORM ist es.
- Schädel `koerper-core.js:2196`: Kugel r = 0,402 (Kopf-Raum), y-Skala 1,22, x durch HEAD_B 0,86 (`:1188`, `:2195`). Halbbreite 0,345.
- Schläfen-Füller `koerper-core.js:2197`: bei x ±0,36, r 0,2 × 0,62, auf Augenhöhe (headSeg 0,48). Außenkante 0,484 × 0,86 = 0,416, also **21 % breiter als der Schädel**. Ohren `:2220` bei x 0,43 auf derselben Höhe. Der Kopf ist am breitesten unter der Kalotte, er wird zur Birne. (Gerechnet aus den Konstanten, nicht am Guss gemessen.)
- Haarkappe `koerper-core.js:1382–1410`: HAAR_KAPPE mittel [Dicke 0,08, Höhe 0,06, zurück 0,07]. Die Kappe ist ein Ellipsoid um den Schädel, um „hoch" angehoben.
  - Gerechnet trägt sie oben 18 mm Haar und an der Seite 5,5 mm (0,08 × 0,402 × 0,86 × 0,7 S × 0,283 m/E).
  - Ihre Halbbreite 0,373 liegt **innerhalb** der Schläfen-Linie 0,416. Das Haar macht den Kopf also höher, aber nie breiter. Daher kommen Zipfel und Haube.
- Eine Quelle für alle Stufen. `haarKappe` wird gelesen von:
  - L0, die Kopf-Haut gießt die Kappe mit (`foundry-core.js:9618`, `haarZone :9716`);
  - den Strähnen, die auf ihr wurzeln (`koerper-core.js:419`);
  - L1, Kugel 8×6 im Stoff hair (`foundry-core.js:9820`);
  - L2 und L3 als Primitiv des Mengen-Leibs (`foundry-core.js:7048`);
  - dem Leib-Raum mit den Achsen `__kappe0/1/2` (`koerper-core.js:1521–1578`, `foundry-core.js:7291`).
  Der Schädel kommt für alle aus `bauMensch :2196`. Ein Schnitt dort wirkt also auf jede Stufe und auf den Wurf.
- Licht des Haars. Kajiya-Kay läuft nur an Strähnen mit Tangente (`stamm/studio-stoff.js:27–43`, `koerper-core.js:868 haarAchse`). Die Kappe der Grobstufe trägt „das Licht des Standard-Stoffs" (`studio-stoff.js:36`), ebenso die Kappe der Menge (Klasse haarKappe, seh „haut", `foundry-core.js:9006`). Das Gesetz KANN Glanz an der Faser, die Welt KONSUMIERT ihn nur an L0, also an höchstens 4 Leibern (`stamm/siedlung-bewohner.js:3482–3484`: nahM 8, nahLeiber 4).
- Stufen am Schirm (Commit `w28-mensch-stufe` 1939b1c3, gemessen auf der Radeon):
  - Feld der Menge ab 13,2 m bei 720p, bei 1080p ab 19,8 m;
  - dazwischen der Satz L2 mit 1700 Dreiecken (`koerper-core.js:55`);
  - Klassen des Mengen-Leibs: nur skin, lips, shorts, joint, haarKappe (`foundry-core.js:7025`). Kein Auge, keine Braue, Hände im Raster vox 0,06 E ≈ 1,7 cm, daraus werden Fäustlinge.
- Gesicht an der Kamera des Spiels (Third, 6,1 m, 1080p): Der Kopf hat 17 × 22 px, die Iris 1,3 px (FUND-REGISTER Z. 28). Die Züge des Gesichts sind dort unaufgelöst, die Silhouette trägt das Bild.

## Die EINE begrenzende Entscheidung
Der Kopf-Umriss ist der Engpass, nicht das Gesicht. Bis 20 m sieht der Spieler nur Schädel und Haar als Silhouette, und diese Silhouette ist bei jedem Bewohner und auf jeder Stufe eine Birne mit Haube. Grund: Die Schläfe trägt die Breite, die Kalotte trägt sie nicht, und das Haar wächst nur nach oben. **Die Breite des Kopfs gehört der Kalotte, das Haar-Volumen liegt seitlich auf ihr.** Gesicht, Braue und Augen der Menge kommen erst danach.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen, alle in einer Welle, Quelle `koerper-core.js`:
1. **Kalotte**: Neues Gesetz-Datum `MENSCH_GESTALT.schaedel.breit` (`:1192`). Die Schädel-Kugel `:2196` wird quer so breit, dass ihre Halbbreite die heutige Außenkante 0,416 erreicht, also sx ≈ 1,20 vor HEAD_B. Die größte Breite des Kopfs bleibt so gleich, sie wandert nur nach oben. Damit hält `kopfB` (`diag-mensch-anatomie.cjs:117`, max. Spanne ohne Ohren) sein Band [0,078; 0,096] ohne Änderung am Soll.
2. **Schläfe**: Die Füller `:2197` liegen in der Kalotte, ihr r fällt, bis ihre Außenkante innerhalb des Schädels liegt. Am Guss ist die Schläfe dann eine Fläche, kein Lappen.
3. **Ohr**: `:2220` x folgt der Kalotte, Abstand Ohr minus Schädelrand wie heute. Sonst versinkt das Ohr in der breiteren Kalotte.
4. **Haar**: `haarKappe :1409` liest `schaedel.breit` in sc[0], die Kappe wächst mit. In HAAR_KAPPE `:1382` sinkt „hoch" je Stil, und die Dicke trägt die Seite (mittel: seitlich ≈ oben ≈ 12–15 mm statt 5,5/18). Die afro-Klemme `:1408` bleibt.
5. **Strähnen und Leib-Raum** brauchen keinen eigenen Code: `haarStreu :419` liest dieselbe Kappe, der Leib-Raum `:1521` baut seine Knoten aus HAAR_KAPPE.
6. **Nacken-Wulst** `:2185–2186` (napeFill1/2, absolute Höhen 5,10/5,24 E aus dem Kanon vor w21) im Bildpaar von der Seite prüfen. Steht er wie in `k-nackt-seite-04.png` hinter dem Kinn, fällt er im selben Commit.

Leser-Liste (vor dem Schnitt, gehört in den Commit):
- `koerper-core.js`: `:2196`/`:2197`/`:2220` bauMensch; `:1395` haarKappe; `:409` haarStreu; `:1521–1578` LEIB_RAUM, leibRaumWert, leibRaumVorlage; `:2101` _kopfLage (liest nur Höhe, bleibt).
- `foundry-core.js`:
  - `:9618` die Kopf-Haut L0 und `:9716` haarZone;
  - `:9820` die Kappe L1;
  - `:7048` `__mengenPrims` (L2/L3);
  - `:7291` die Kappen-Achsen des Leib-Raums.
- `stamm/koerper-leib.js:52` (Wahl des Schnitts).
- `stamm/studio-glieder.js:249` `_kreaturGliederBacken` (das Feld passt die Kapseln an den Guss; Zeile aus dem Commit-Rumpf von w28-leib-nah, nicht selbst gelesen).
- Urteile: `scripts/diag-mensch-anatomie.cjs:117` kopfB, `:179–181` ohr, `:273–280` alle Stile der Menge, `:611` afro-Mutante.
- Gesicht und Haarkappe, kein Leser: Lab-Shell `worlds/koerperstudio/koerperstudio.js` baut aus bauMensch und folgt.

Kosten-Zeile: Dreiecke und Draws bleiben gleich, weil der Ofen jede Stufe auf ihre Zeile 40 000 / 14 000 / 1 700 / 360 bringt (`koerper-core.js:48–60`, fail-closed `foundry-core.js:7132`). Der Guss behält Raster und Zahl der Primitive. Pflicht B: keine neue Arbeit beim Boot. Nicht gemessen; Pflicht ist eine Vorher↔Nachher-Zahl der Guss-ms von `_ofenMenschTemplate` am Dorf.

Bildpaar (die Abgabe):
- `bild12.cjs` nackt und kleid, vorn und Seite, gleiche Kamera, gegen `genom/c-bau/zwoelf-*.png`;
- Third am Dorf der Ankunft, 8–15 m, Gruppe von vorn und hinten, Rezept `bildpaar-im-spiel-rezept.md`, gegen `mensch-paar/vor-gruppe.png`;
- Ansicht von oben (Hügel).

Kriterien der Meisterkarte:
- **mensch.K4** 2/2 gebucht (stand.json je, Radeon a41ce72d; Blatt B nennt 0/2 am Morgen). Stationen: #1 Radeon (Gesicht 6,11 m, haarDeckung 1 ∈ [0,9; 1], augeFrei 1) und #2 headless (50 von 50 Gesichtern in MENSCH_SOLL, kopfB). Soll halten, das ist das Nichts-bricht-Tor.
- **haar.K2** 0/2 (strich 0,318/0,311 ↔ ≥ 0,3554, Station haar.K2#1 Radeon/GTX): Die Strähnen wurzeln neu, die Zahl kann sich bewegen, berichten.
- **haar.K1** 1/2 (strich arm 0,6081 / third 0,5734 ↔ [0,4358; 0,6538], #1 Radeon und GTX): halten.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Kein Zweig trägt den Kopf-Umriss.
- `w28-mensch-stufe` 1939b1c3 ist WIP, ROT an menge.gleich (1 Paar 0,864 px), und fasst Stufe 2 an. Die Kopf-Welle muss nach ihr kommen oder auf ihr bauen.
- `w28-leib-nah` ace30e73 (GTX 1050) ist der Kleid-Teil des Ballons, also die andere Hälfte des „kleinen Kopfs". Die Kopf-Welle fasst kleidZonen nicht an.
- Laut Befund von w28-mensch-stufe ist der Ballon die L0-Gestalt selbst (Brust 0,210 × 0,227 H gegen 0,145 tief). Das ist offen bei der Rumpf-Batterie.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Breite je Höhe nur aus Konstanten gerechnet, nicht am gegossenen Kopf gemessen. Die Haut-Dicke und das Blend im Feld verschieben die Kanten.
- Dass die größte Breite eines Kopfs am Scheitelbein über dem Ohr liegt (Euryon) und die Schläfe schmaler ist, stammt aus dem Gedächtnis (Lehrbuch-Anthropometrie). Eine Quelle ist nicht gelesen.
- Nicht gelesen: der Kopf im Feld der Glieder-Kapseln (`_kzLeib`, studio-glieder); `kopfGussUrteil :4210`; `gesichtAuf :4668`.
- Bleibt offen nach diesem Schnitt:
  - L2 ohne Augen und Braue (`foundry-core.js:7025`);
  - Hände der Menge als Fäustlinge (vox 0,06 E gegen einen Finger von 0,9 cm);
  - Kappe L1/L2 ohne Faser-Licht (`studio-stoff.js:36`).
- stand.json zeigt mensch.K4 mit 2 Punkten, Blatt B (früher am Tag) 0. Der Stand vom Abend gilt.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 4: jeder Bewohner, jede Stufe und jeder Wurf am Ort der Ankunft. Aufwand M, eine Quelle mit sechs Stufen. Risiko: Das Ohr versinkt in der breiteren Kalotte, oder kopfB reißt 0,096, und die neu wurzelnden Strähnen bewegen haar.K2/K1. Alle drei liest das Bildpaar plus `diag-mensch-anatomie` vor der Abgabe.
