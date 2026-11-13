# 07 Die Stadt am Ort der Ankunft: der Start-Ort wird Stadt in der Achse

Gelesen am Code von main ec281422 (Baum leib-kanon-urteil); origin/main steht beim Lesen auf 7f778d44 (nicht nachgelesen).
Gelesen habe ich nur, nichts gemessen.

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Ankunft, `KO/probe-post/w28-platte-fein/02c27132-genesis-0.5.png`: das Kopfstein-Rondell mit vier Toren, eine Bank, eine Laterne, Gras-Keile.
  Dahinter schließt ein dichter Laubwald den ganzen Horizont. Keine Stadt, kein Dach, kein Turm.
- Dorf der Ankunft, `BILD/dorf-main-0.5.png`: brauner Erd-Platz mit violetten Schlieren, ohne Kante. Ein glattes weißes Putzhaus mit
  flachen Fenster-Platten, ein Marktstand, sieben Bewohner, dahinter ein Grashang mit großen gelben Zacken. Kein Wagen, keine Gasse.
- Die Stadt gibt es, aber nur am Messort per Wort. `BILD/sg-stadt.png` und `KO/probe-post/w28-stadt-grammatik/22872718-stadt-voll-0.5-rot.png`
  zeigen einen Kopfstein-Markt mit Ständen und Gedränge, vier- bis sechsgeschossige Kästen, eine Fabrik mit zwei Schloten und einen
  Zinnen-Turm. Keine Fahrbahn, kein Bordstein und in diesem Bild kein Wagen.
- Kurz: die Stadt-Arbeit seit dem 10.11. (Belag, Grund, Grammatik, Verkehr) sieht nur, wer „dorf 7 300“ tippt. Wer ankommt, sieht Wald.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- **Am Ort der Ankunft steht nur ein Dorf.** `GENESIS_ORT.viertel = { r: 190, k: 5, hausR: 60 }` (fachwerk-core.js:9648) heißt „der Wunsch
  des Start-Dorfs“. Der Wirt liest es in stamm/siedlung-ort.js:1608 und nimmt die Größe `siedlungsGroesse(S, h, 0)` (:1620), also Stufe 0.
  Stufe 0 gibt `nHMin + (h>>>24) % nHSpan` = **8–17 Häuser** (fachwerk-core.js:3326, :3366).
  `groesseVon` (:3475–3477) macht daraus mit 8–16 Häusern ein „dorf“ und mit 17 Häusern einen „markt“.
- **Ein Dorf fährt nicht.** `verkehrVon` setzt `N = staedtisch ? ceil(Häuser/15) : 0` (fachwerk-core.js:4065, Begründung :4037). Am Start-Ort
  fahren deshalb 0 Wagen, außer bei nH 17 mit 2 Wagen.
- **Das Dorf steht hinter dem Spieler und hinter dem Wald.** Der Slot k 5 liegt bei 90° + 5·360/11 = 253,6°, also bei (−54, −182) m
  (:9756–9758). Die Ankunft S1 blickt von (0, 0) nach Norden: `pol(50, a(0))` (:10153). Um den Platz liegt der Wald-Gürtel
  r 32–55 m (:9596). Offen bleibt der Blick nur nach Norden: über die Mall (b 10, bis z 100, :9613), die Terrasse (z 106), den Teich
  (cz 140, b 25, :9620) und das Ufer bis z 175 (:9621). Nördlich davon erklärt der Plan **nichts**.
- **Die nächste echte Stadt liegt 1,4 km weg.** Laut Meisterkarte siedlung.K2#1 steht am Boot-Seed die „Stadt -2,-6 nH 35 1424 m vom
  Genesis-Ort“ (PM/meisterkarte-quelle/punkte/stand.json:3251). Die Städte kommen aus dem Rang-Gesetz: Stufe 1 ist ein Sieger von
  8×8 Zellen à 256 m, ab nH 24 (fachwerk-core.js:3338–3341). Am Platz steht so eine Stadt nie, außer durch Zufall.
- **Das Gesetzbuch kann die Stadt.** Es gibt Klassen bis Metropole (GROESSE_N :3344, stadt = 36) und den Stadtkörper mit Türmen an der Moderne-Kante (:3668).
  Dazu kommen die Mauer (:3350), der Verkehr (:4062) und am Zweig die Stadt-Grammatik. Die Welt nutzt davon am Ort der Ankunft: **0 %**.
- **Die Posen-Regel lässt eine Stadt in der Achse zu.** Kein Akteur und kein fremder Ort darf im Kegel ≤ 150 m der Ankunft stehen;
  „resident“ heißt ≤ 210 m (`regel`, :9707, Urteil :10226). Eine Stadt hinter dem Ufer, mit dem nächsten Haus ≥ 210 m entfernt, bricht keine Regel.
- **Pflicht F verlangt wörtlich: „die Silhouette der Stadt steht vom Platz aus“.** F hat **0 Kriterien und keine Station**
  (stand.json:5189–5202: „keine Station misst … Silhouette der Stadt vom Platz“).

## Die EINE begrenzende Entscheidung
**Der Start-Ort der Welt ist eine STADT und steht in der ACHSE (k 0) nördlich hinter dem Teich.** Er ist der Wienie am Ende der
Greensward-Linie. Das Start-Dorf an k 5 stirbt im selben Schnitt, damit es keinen Zwilling gibt (G4).
- Begründung aus der Geometrie: der Gürtel (r 32–55) verdeckt bei ~20 m hohen Kronen alles, was von 1,6 m Augenhöhe aus flacher als ~0,36·d ist.
  Bei 190 m müsste ein Haus also ~69 m hoch sein. Die einzige offene Sichtachse vom Platz ist die Mall über den Teich.
- Die Größe kommt aus dem Gesetz und ist keine neue Zahl: `GROESSE_N.stadt` = 36 Häuser. Die Reichweite ist dann
  `siedlungsReich` = 30 + 22·√36 = 162 m (:3377).
- Die Kosten sind gleich für jede Saat, also nicht an die Welt gebunden. Eine Stufe-1-Saat würde bis nH 96 würfeln, das ist ausgeschlossen.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Stufen in EINER Welle** (die Klasse „Stadt am Ort der Ankunft“):
1. **Maß:** fachwerk-core.js:9648 wird zu `viertel: { k: 0, r: <Ufer-Ende 175 + 210 − 175 + Reich 162 ≈ 372>, groesse: "stadt" }`.
   Die Mitte liegt bei z ≈ 372, das nächste Haus bei ≈ 210 m (residentM). Die Zone `viertel` (:10072) bekommt `r = siedlungsReich(GROESSE_N.stadt)`.
2. **Wirt:** stamm/siedlung-ort.js:1620 nimmt `nH` aus `GROESSE_N[P.viertel.groesse]` statt `siedlungsGroesse(S, h, 0)`.
   Damit ist der Plan `staedtisch` und trägt Verkehr: ceil(36/15) = 3 Wagen (:4065).
   Die Epoche bleibt die Legende der Saat (:1787); jede dritte Saat trägt eine Epoche.
3. **Weg:** der Feldweg `{ k: 5, bis: "viertel", feldweg: 130 }` (:9674) wird `{ k: 5 }`. Die Stadt bindet das Wegenetz der Orte an
   (siedlung-ort.js:2840, das Start-Info ist dort schon Teilnehmer).
4. **Station F (Silhouette):** EINE Pose in der bestehenden Tafel `posen` (:9683), z. B. `S12 { blick: Stadt-Mitte }`, ego am Rondell,
   Ziele `art: "haus", band: "fern", zeile: "fern"` nach `sicht.haus` [60, 4] (:9719). Geurteilt wird mit dem vorhandenen `genesisPose`
   über SICHTLINIE, ANTEIL und FERN-ZEILE (:10221–10226). Das ist eine Zeile in einer bestehenden Familie, kein neuer Apparat.
5. **Bild:** ein Paar am Rondell nach Norden, Mittag und Dämmerung, Ego und Third, vorher und nachher, an fester Kamera S1.
   Dazu ein Blick vom Ufer (S9f-Stand, :10203). Die Stadt aus Hügel- und Dach-Höhe gehört ebenfalls dazu (Kurs 2).

**Leser-Liste** (vor dem Schnitt, gehört in den Commit):
- fachwerk-core.js:9674 (Weg k 5), :10004/:10028 (Plan v1 `viertel`), :10072 (Zone `ort`; sie wird von der Posen-Regel ANKUNFT :10226 gelesen und von der Natur-Wand des Wirts)
- stamm/siedlung-ort.js:1608/:1620 (`_autoSettlementStartInfo`), :1290 (Schlüssel `start`), :2327 (`_startDorfBestellen`), :2313 (`_startDorfFaellig`, nearM 260 :3185), :2840 (Wegenetz)
- scripts/diag-ankunft.cjs:98, :317–338, :871, :1087–1133 (der Export des Start-Orts als Kopf im Faden-Rang, B5)
- scripts/diag-settlement.cjs, diag-haus-welt.cjs, diag-pruefbuehne.cjs, diag-profiband.cjs, diag-kreatur-takt.cjs, diag-stand-takt.cjs,
  diag-idle-gpu-churn.cjs, playtest.cjs, playtest/studio.cjs, lib/kreatur-proben.cjs: alle nennen „Start-Dorf“ (Grep). Welche Zeile
  eine Zahl aus dem Dorf liest, habe ich nicht gelesen.
- Gedächtnis-Format `settlementCells.start {seed, nH, x, z}` (:1679): ein alter Stand kehrt mit dem alten nH wieder (:2619–2625 prüft seed und nH).

**Kosten-Zeile** (Kurs 3; gebunden an den Schirm):
- Export nH 12 dauert 0,29 s, nH 300 dauert 2,0 s im Foundry-Faden (siedlung-ort.js:1775–1776). nH 36 schätze ich auf ~0,4 s, gemessen ist das nicht.
- Die Häuser stehen ≥ 210 m weg, also im Fernkörper (fachwerk-core.js:2523 `fpVon`). Der Zug hebt sie in Raten (:1698–1704).
- Wache: B GTX kalt 16,6 s darf nicht steigen (F: „Kalt-Zeile nicht langsamer“). Der Export des Start-Orts geht heute als Kopf vor jedem
  Auftrag seiner Bahn (diag-ankunft.cjs:337). Wird das Bild langsamer, verliert der Export den Kopf-Rang erst NACH dem Weltbild.
  Das Soll bleibt dabei unbewegt; es muss dann gemessen werden.

**Kriterien der Meisterkarte:**
- **F** (ohne Richter, 0/0, stand.json:5189): Ist: keine Station. Soll: „Silhouette der Stadt vom Platz“ als Station S12 an Radeon und GTX.
- **C** (pflicht.C#1 headless, 0/2 Punkte, :5104–5124): bleibt am Messort nH 300. Neu ist: am Start-Ort fahren 3 Wagen, im Bild der Ankunft.
- **siedlung.K2#1/#2** (2 Punkte, :3243): die Zeile „Stadt … 1424 m vom Genesis-Ort“ beschreibt die Rang-Stadt. Ob die Linse den
  Start-Ort mitzählt, habe ich nicht gelesen. Das muss der Arbeiter vor dem Schnitt prüfen.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- **Kein Zweig verlegt die Stadt an die Ankunft.** Ich habe in fachwerk-core.js und siedlung-ort.js nach `viertel: {`, `_autoSettlementStartInfo`,
  `startdorf` und `GENESIS_ORT` gegriffen. Ergebnis 0 Treffer an w28-stadt-grammatik, w28-weg-koerper, w28-fassade, w4-stadt-orte und e-stadt-gipfel (git diff, 13.11.).
- **w28-stadt-grammatik**, Kopf **156cc903** (WIP, liegt nach 22872718): Viertel, Torplatz und `gehwegFahrM` 1,8. Das sind 33 Dateien,
  +3476/−1017. Der Zweig hängt an **w28-mp-boden f97fe692** (WIP, die Wurzel `_bodenKlasseAt` → `_terrainSaatY`). Der Schnitt hier ist
  davon unabhängig (andere Zeilen) und kann vorher oder nachher landen. Erst mit der Grammatik sieht die Stadt an der Achse aus wie sg-stadt.png.
- **w28-weg-koerper b1ffbea3** (WIP: Gehsteig, Bordstein, Kante) und **w28-fassade b038852b**: Das ist die Haut derselben Stadt; sie hängt an der Grammatik.
- Bis zur Landung fehlen: Stufen 1–5 oben, die Kosten-Zeile B an der GTX und das Bildpaar S1.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- **Sichtlinie nicht gerechnet:** die Allee-Eichen x ±7,5, z 30–100 (:9614) können die untere Silhouette über der Mall verdecken. Ob ein
  Haus der Klasse stadt (4–6 Geschosse) bei 210–530 m über den Kronen und dem Ufer steht, sagt erst S12. Fällt S12 durch, rückt der
  Plan nach dem Gesetz der Stationen (:10218). Ein Soll wird dabei nicht bewegt.
- Nicht gelesen: ob `_autoSettlementSiteOk` (siedlung-ort.js:1616) bei z ≈ 372 am Boot-Seed Land trägt (Teich, Hang); die Ringe 24/48/72 m
  (:3195) rücken sonst. Ebenso nicht gelesen: ob die Verdrängung des Rang-Gesetzes den Start-Ort gegen eine Zelle schützt.
- Nicht gelesen: ob der Kegel der ANKUNFT (:10226) die Zone `ort` nach ihrem Rand oder ihrer Mitte misst.
- Widerspruch im Gesetz: die Stufe-0-Regel (:3334 „Das Dorf … byte-gleich“) gilt für Zellen. Der Start-Ort ist keine Zelle, deshalb bricht der Schnitt kein Byte des Rang-Gesetzes.
  Er ändert aber jede Welt, das Plan-Hash (:9741) und jedes Bild der Ankunft.
- Kurs-C schätzt die Zonen von F auf 45 %; das ist eine Schätzung, keine Messung. Strecke, Kicker und die vier Wagen auf der Runde fehlen ganz (:9677 k 8 ohne Ziel). Das ist nicht dieses Blatt.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- **Wirkung 5:** jede Ankunft zeigt danach eine Stadt am Ende der Achse statt Wald. Alles Gelandete an Stadt, Belag, Grammatik und Verkehr
  rückt dahin, wo der Spieler steht. F bekommt die erste Station.
- **Aufwand M:** zwei Kern-Zeilen, eine Wirt-Zeile, eine Pose und das Bildpaar; dazu die Leser-Liste mit ~12 Proben-Dateien.
- **Risiko:** die Kalt-Zeile B (GTX 16,6 s), weil der Export des Start-Orts als Kopf im Faden läuft. Wird der Export mit nH 36 statt 8–17
  größer, kann das erste Bild später kommen. Deshalb gehört die Messung an der GTX vor die Abgabe.
