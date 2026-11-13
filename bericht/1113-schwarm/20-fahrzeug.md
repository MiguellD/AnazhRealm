# 20 Fahrzeuge: Gestalt, Lack, Räder, Fahrdynamik

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `koord-hebel/probe-post/w28-verkehr-bild/71bb1587-stadt.png` (12.11., gelandet, Stadt-Messort): der gelbe Wagen rechts unten. Das Dach ist
  eine flache gelbe Platte mit harter Kante, die über den Säulen liegt wie ein Deckel; durch die Scheibe stehen dunkle Sitz-Klötze; im Glas
  spiegeln Himmel und Wolken als grobes Pixel-Mosaik; das Rad zeigt Speichen, zwischen Rad und Kotflügel klafft Luft.
- `koord-hebel/bericht/3110-gegenwart/stadt-wagen.png` (31.10.): gelber Kompakt, grüner Kombi, schwarze Limousine — alle drei Kästen aus
  ebenen Flächen, Kanten ohne Rundung; auf der schwarzen Limousine fleckt das Laub-Muster über Dach und Scheiben.
- `pm/.../roh/b3f9ae95-radeon/material.K3_1.json.d/albw/welt-lack.png`: die Lack-Gestalt allein, fünf Blicke — Silhouette aus Stufen und
  Platten, das Dach steht als Deckel über den Fenstern, durch die Fugen zwischen Platten scheint der Hintergrund (Magenta-Punkte am Dach).
- `BILD/sg-stadt.png` (Scratchpad dieser Sitzung, Stadt-Platz): kein Wagen im Bild. Im Dorf der Ankunft fährt keiner (`fachwerk-core.js:4065`
  `N = staedtisch ? … : 0`). Der Wagen, den der Spieler an der Ankunft trifft, ist die GT-Vorschau hinter dem Garage-Tor (siehe unten).
- Die Spike-Bilder `origin/w28-samen-fahrzeug:samen/fahrzeug/vergleich-*.png` habe ich NICHT gesehen (nur im Zweig, nicht ausgecheckt).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
SPIEL = main ec281422; Zeilen in `vehicle-core.js` am Kopf geprüft (deckungsgleich mit dem Samen-Befund).
- **Die Haut ist ein Bausatz aus Platten:** `buildSkin` `vehicle-core.js:1379–2188`, Platten-Dicke t 0,025; danach verbogen durch
  `taperBody` :1014 (Querschnitt `crossSection` :969) und `bowEnds` :1338, Radlauf als Rechteck-Schnitt `clipSegs` :1039.
  Befund (`origin/w28-samen-fahrzeug:samen/fahrzeug/BEFUND.md` §1): kompakt_fwd 359 Meshes, 288 Boxen; Haut 235 Meshes, 223 Boxen (95 %);
  Kanten-Radius 0; Radlauf-Spalt 56…281 mm (Spanne 225 mm); gebaute Fugen 0 m; Lack-Unterkante 0,290 m bei fahrhoehe 0,135.
- **Was der Kern schon KANN:** `gitter(nu, nv, fn)` :2475 und `bauKanzel` :2905 bauen die Zukunfts-Epoche als Fläche aus Stationen —
  die Stufe „heute", die die Stadt fährt, konsumiert davon nichts. Kandidat des Spikes (eine Haut aus 93 Schnitten, gleiche `P`/`derive`/
  `crossSection`/`wheelClearance` :3364): 20 578 statt 28 716 Dreiecke, 103 statt 359 Meshes, Bau 14,6 statt 28,6 ms (Median 15, swiftshader),
  gesehene Dreiecke 80,0 statt 64,2 %, harte Kante 78 statt 538 m, Radlauf-Spanne 4 statt 225 mm, Fugen 17,9 m.
- **Budget:** `vehicle-core.js:49–50` Stufe 0 tris 32 000 (Band 20 000), draws 12; Stufe 1 10 600; Stufe 1 = derselbe Bau unter
  `FAHRZEUG_DETAIL_1` k 0,4 (:62, :4860); `buildInstance` :4846 senkt `teil` bis zur Zeile (:4873–4880). Fern: Box-Satz `_archBoxFit`
  `stamm/studio-bruecke.js:3497`, Karte aus Stufe 1.
- **Der Lack:** `LACK_ART` :307–310 (uni Metall 0 / Rauheit 0,4, metallic 0,7 / 0,35, Klarlack 1 / 0,03), `lackStoff` :311. In der Welt
  trägt der Welt-Stoff weiter die Umgebungs-Stärke des Labors: `stamm/studio-stoff.js:251` `if (env !== 1) mat.envMapIntensity = env`.
  material.K4 (stand.json:2273): 1 Punkt, gtx GRÜN nur über das Glas (0,7656); **Lack 0,4468 < 0,5**; radeon UNGEMESSEN.
- **Die Räder:** `makeWheel` :758 — 2 184 Dreiecke je Rad, Tonnen-Zylinder, flache Ring-Flanke, 5 Box-Speichen, Breite fest 0,22
  (Befund Fakt 9); 8 736 von 28 716 Dreiecken. In der Welt steht je Ecke eine Instanz derselben Geometrie (`stamm/studio-gestalt.js:1288–1310`).
- **Wie die Welt den Wagen liest:** Stadt `stamm/siedlung-verkehr.js:605` (`spawnArchitecture("fahrzeug_"+typ)`, Typen :2225 kompakt_fwd ·
  limousine · suv) → `build-asset` `studio-bruecke.js:1787` → `foundry-bruecke.js:888` `buildInstance(id, seed, lod, ov)` ohne werk, ohne Epoche.
  Ankunft: Genesis-Tafel `fachwerk-core.js:9607` `{k:8, welt:"garage", vorschau:"fahrzeug_gt"}`, gebaut in `stamm/siedlung-ort.js:1500–1513`
  (Same 49178). Labor: `worlds/garage/garage.js:243` derselbe `buildInstance` mit Türen und Rad-Ecken.
- **Fahrdynamik (Meisterkarte, stand.json:410–589):** K1 2/2 (Spitze 6,5–8,5°, Bremsweg Gras/Weg 1,63×, nass 1,72×/1,48×, 240 Hz, S1 1,7e-13 m,
  headless) · K2 1/2 (#2 Verkehr radeon+gtx UNGEMESSEN) · K3 2/2 · K4 2/2 · K5 1/2. Summe fahrzeug 8/10. Die Gestalt hat KEIN Kriterium
  und keine Zeile in `spec/abnahme/soll-tafel.json` (0 Treffer „fahrzeug|lack|wagen").
- **Spur und Rauch leben nur im Labor:** `worlds/garage/garage.js:764` `updateTrack`/`updateSmoke`; die Welt hat keinen Leser
  (Meisterkarte `src/g5.js:134`).

## Die EINE begrenzende Entscheidung
Die Haut von „heute" ist ein Bausatz aus Platten auf den Ebenen eines Quaders, nachträglich verbogen — keine Fläche. Jedes Symptom im Bild
(Dach als Deckel, Kante ohne Radius, Radlauf als Rechteck mit 225 mm Spanne, Scheibe hinter der Flanke, ein Drittel des Budgets auf
Rückseiten) folgt daraus; Teilung × 3 ändert kein Pixel (Fall b: 263 500 Dreiecke, dasselbe Bild). Entscheid: `buildSkin` wird EINE Haut aus
Schnitten auf dem `gitter`-Vokabular, das der Kern für die Kanzel schon trägt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Stufen (alle in derselben Welle):** Stufe 0 und Stufe 1 aus derselben Funktion (weniger Stationen/Zellen statt k 0,4); die Karte backt sich
aus Stufe 1 (kein eigener Schritt); der ferne Box-Satz `_archBoxFit` (`studio-bruecke.js:3497`) liest die neue Haut — der Befund rechnet, dass
8 große Haut-Meshes je eine AABB schlechter sind als heute: der Box-Satz muss je Schnitt-Zone (Kabine, Bug, Heck, Radläufe) fitten.
Alle fünf Rezepte (kompakt_fwd, limousine, suv, gt, supersport), nicht nur das gerechnete. Radlauf als Kreis aus `wheelClearance`
`vehicle-core.js:3364`, Fugen und Glas als Zonen desselben Gitters, Lack-Unterkante auf fahrhoehe + 0,03.
**Was stirbt:** die Haut-Platten (223 Box-Meshes) und ihr Verbiege-Stapel als Haut-Vokabular (`clipSegs` :1039, `Bsub`, `dome`,
`bowedQuad`, `quad4`); `bowEnds` :1338 fällt mit. `taperBody` :1014 bleibt nur, wenn ein Leser bleibt — `worlds/garage/garage.js:250`
verbiegt damit den Rahmen; das prüft der Arbeiter vor dem Schnitt und nennt es im Commit.
**Leser-Liste (vor dem Schnitt):**
- `vehicle-core.js:1382`/`:2157` Türen (`ctx.doors`, `pv`/`sd`) → `worlds/garage/garage.js:252` (Gelenke), `:768` (Tür-Animation);
  `stamm/studio-gestalt.js:1263` (`__tuer`). Die Tür wird aus der Fläche geschnitten, nicht als Box gehängt.
- `stamm/studio-gestalt.js:1265`, `:1288–1310` Rad-Ecken (`__rad`) — unverändert, Räder bleiben.
- `vehicle-core.js:4874` `__mass` = `gestaltMass(g)` (folgt dem Bau selbst) → `stamm/koerper-bewegung.js:278` `_fahrUmriss`,
  `stamm/gelaende-kollision.js:1287–1304`, `stamm/siedlung-verkehr.js:630`, `stamm/koerper-fahrt.js:1417`, `stamm/vegetation-baum.js:1813`.
- `vehicle-core.js:4873` Budget-Schleife; `foundry-bruecke.js:888`; `stamm/siedlung-verkehr.js:605`; `stamm/siedlung-ort.js:1513` (GT der Ankunft).
- `spec/asset-contract/v3/golden/vehicles.json` (Goldens aller Rezepte × Gestalten × 2 Stufen: Re-Mint).
**Kosten-Zeile:** kompakt_fwd Stufe 0 28 716 → ≈ 20 578 Dreiecke (Haut 18 704 → 11 562), Meshes 359 → 103, Bau 28,6 → 14,6 ms (Befund, swiftshader,
nur als Verhältnis). 20 578 liegt 578 über dem Band 20 000, unter der Zeile 32 000. Bauzeit im Foundry-Faden fällt, Ankunft B wird nicht teurer.
**Kriterien:** Kein Meisterkarten-Kriterium misst die Gestalt (oben). Abgabe = Bildpaar an fester Kamera (Kurs 1) am GT der Genesis-Vorschau
(Tor k 8, Ring r 22, Vorschau r 30) aus Auge, Third und von oben, plus der gelbe kompakt_fwd an der Pose „trasse" (`bild:stadt@0.5`).
Mitlaufend: material.K4 (1/2, Lack 0,4468 ↔ ≥ 0,5, Station material.K4#1 gtx/radeon), physik.K2 über `__mass` (Kollision = Bild),
fahrzeug.K4 (2/2, Stufe ≤ 2 m an der Physik-Lage — darf nicht fallen).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `origin/w28-samen-fahrzeug` 5406f47d (WIP, [skip ci], 1 Commit): BEFUND.md, `kandidat.js` (488 Z., Wegwerf), `spike.cjs`, 36 Einzel- +
  12 Vergleichs-Bilder, `zahlen.json`. Fehlt: Kandidat im Kern statt im Spike, vier Rezepte, Stufe 1, Box-Satz, Türen, Goldens, Bild im Spiel.
  Der Befund nennt selbst: Gesicht (Leuchte, Grill) und Heck trägt der Kandidat noch nicht; die Bänder zittern an den Säulen (8,5 cm Stations-Abstand).
- `origin/w26-lack-glas` 8230911b (ABGABE 09.11., 5 vor main, 5 Dateien +72/−42): `studio-stoff.js` envMapIntensity 1 je Welt-Stoff,
  specularIntensity = 1 − Klarlack; swiftshader Lack −0,010…−0,062 → 0,751…0,775. Zurückgehalten, weil die geschärfte Station auf der Radeon
  UNGÜLTIG maß (2 Blöcke, `koord-hebel/cloud-post/w26-lack-glas.md:21`). Fehlt: main einmischen, Pose der Station an Radeon/GTX.
- `origin/w28-reibellipse` 92879eab (WIP, 11 vor main): geparkt an leib.K5 Handbremse 1,252 < 1,3 — das Maß der Invariante ist offen.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Spike-Bilder nicht gesehen; die Kandidaten-Zahlen gelten nur für kompakt_fwd unter swiftshader im eigenen Gestell, nicht im Weg der Welt.
- Ob der Befund-Satz „Re-Mint = Vertrags-Akt, braucht das Wort des Schöpfers" (BEFUND §5.5, Lehre 11 `SKILL.md:121`) die Landung sperrt: das
  entscheidet der Schöpfer, nicht dieses Blatt.
- Die Silhouette bleibt kastig über die MASSE (Windschutz 61–66° zur Waagrechten, `windshieldRake` ohne Lehre; Befund Fakt 16) — eigener Regler.
- Räder (Profil, Flanke, Felgenhorn) und das 4-px-Mosaik im Klarlack (`stamm/bild-sicht.js` `_spiegelPass`, FUND aus w26) nicht gelesen.
- Epoche: die Orte reichen keine Epoche an ihre Wagen (FUND-REGISTER Z. 36; `siedlung-ort.js:1134` trägt sie nur in die Zelle).
- `taperBody`-Leser in `garage.js:250` (Rahmen) nicht bis zu Ende verfolgt.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Haut aus Schnitten (alle Rezepte, beide Stufen, Box-Satz): Wirkung 4 · L · Risiko: der Re-Mint aller Goldens und der ferne Box-Satz, der
  laut Befund schlechter wird, wenn er nicht je Zone fittet.
- w26-lack-glas heim: Wirkung 2 · S · Risiko: die Radeon-Pose der Station bleibt UNGÜLTIG, der Punkt fällt erst mit ihr.
- Spur/Staub aus dem Labor in den Fahr-Zustand (fahrzeug.K5 1 → 2): Wirkung 2 · M · Risiko: neue Leser im Ritt kosten CPU-Takt am Band E.
