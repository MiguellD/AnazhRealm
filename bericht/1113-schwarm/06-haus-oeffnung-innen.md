# 06 Fenster, Tueren, Innenraum und Innenlicht der Haeuser

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/genom-spiel/frontal.png` (Dorf der Ankunft, Mittag, weisses Putzhaus ~15 m): sieben Fenster der Giebelseite sind
  hellgraue Vierfelder-Kacheln buendig in der Wand (Rahmen ein duenner Strich, keine Laibung, kein Schatten im Sturz); EIN Fenster
  (oben Mitte) ist eine fast schwarze Navy-Platte. Am Hell/Dunkel-Wechsel derselben Fassade liest das Auge ein Schachbrett, kein Glas.
  Die rechte Traufseite zeigt schraeg aus der Wand stehende helle Fluegel (offene Fensterfluegel in jedem Fenster).
- `scratchpad/genom-spiel/gruppe.png` und `scratchpad/dorf-main-0.5.png` (gleiches Bild): das Haus rechts traegt graue
  Fenster-Rechtecke ohne Tiefe; die Haustuer ist eine Doppeltuer mit Oberlicht und Stufen (liest als Tuer). Das Langhaus links:
  dunkelblaue Scheiben in braunem Rahmen.
- `scratchpad/studio-welt/werk-viktorianisch-L0-mittag.png` (Buehne): Fenster als kleine dunkle und einzelne weisse Rechtecke.
- Innenraum: kein Bild gesehen (das Innen-Bild der Station lebt nur als Zahl).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Wurzel SPIEL = main ec281422 (Baum leib-kanon-urteil). Dateien ohne Pfad = `fachwerk-core.js`.
- KANN: Fenster mit Sturz, Bank, Bogen (:1062–1070), Fluegel mit Kreuz und Scheibe (:992–1003), Haustuer mit Kassetten-Fluegeln,
  Oberlicht, Schwelle, Treppe (:950–966), Hinter-/Balkon-/Fluegeltuer (:514–557), Innenwaende mit Tueren (:881–897), Moebel mit
  Bewegungsflaechen (:1222–1223), Herd, Keller, Dachboden. Stufe 0 baut alles davon (`stufe0Param` :5062–5066, `buildStufe` :5105–5158).
- KONSUMIERT: Stufe 0 nur unter 12 m (d0/d1 = 12/26 m, :30). Stufe 1 = Huelle ohne Innenleben (`LOD1F` :2117, `LOD1S` :2119)
  plus EIN Innenkoerper-Kasten je Grundriss (:3242–3249); Stufe 2 = `fensterFern` (:2465–2498), 14–16 Dreiecke je Fenster.
- DER FENSTER-SCHLAF: `FENSTER_SCHLAF = 0.45` (:2426), EIN Wuerfel je Fenster (:2427–2434). `fensterAt` waehlt damit den STOFF
  (:1062: `'glasdunkel'` oder `'glas'`). `M.glas` = 0x33576a, opacity 0,42 (:1920); `M.glasdunkel` = 0x2b4457, opacity 0,92,
  metalness 0,1 (:1938). Der Wuerfel wechselt also nicht nur die Nacht-Glut, sondern die Scheibe am TAG: 45 % der Fenster jedes
  Hauses sind tags eine fast deckende dunkle Platte, 55 % durchsichtiges Glas vor dem Raum. Die L2 erbt das ueber
  `schlafF` (:2469–2470: `da = M.glasdunkel.opacity`, `gd = _colFor('glasdunkel')`) — das Schachbrett gilt in JEDER Stufe.
- Die Glut: `M.glas.userData.__licht='fenster'` (:1946); `_leuchtStoff` legt sie nur an einen Stoff mit Licht-Datum
  (`stamm/stoff-material.js:2056–2063`). `glasdunkel` traegt kein Datum — er braucht seine dunkle Farbe NICHT, um nachts dunkel zu bleiben.
- DER RAUM HINTER DEM GLAS (L1/L2): `_innenFaktor` = Wand-Ton × `INNEN_DAEMMER 0.92` (:2442–2449) — eine ALBEDO, kalibriert
  auf „176 vs 60 bei 0,34" (:2435–2446, Datum der Eichung nicht genannt). Die Linse dazu vergleicht nur Albedo
  (`scripts/diag-haus-fern.cjs:380–383`: „die Albedo sieht kein Licht", Tag L/L0 in [1/4, 4]; :462–486).
- DER RAUM AN DER L0 (Licht): Station siedlung.K1#2 (`pm/…/stationen/g5.js:1695–1986`) misst innen ÷ Boden im Schatten.
  Letzte lesbare Messung 1cd1c408 GTX (`messung/1cd1c408-gtx.json:711`): Innen-Leuchtdichte 0,0056–0,0145 linear, aussen
  0,11–0,20, Quote min 0,032, Median 0,081 ↔ Soll ≥ 0,15; nur 5 von 18 Haeusern lesbar (8× „aussen undefined"). Der Rueckstrahl
  ruht unter einer Decke (`stamm/bild-schatten.js:312–316`), die Decken liefert das Gesetzbuch seit w18-innen-licht (in main).
- Die offenen Fluegel: L0/L1 drehen jeden Fluegel um 0,62 rad nach aussen (:1066/:1070), die L2 baut ihn nach (`FLUEGEL_LAGE` :2463).

## Die EINE begrenzende Entscheidung
Der Schlaf-Wuerfel entscheidet NUR die Nacht-Glut, nie die Scheibe: am Tag ist jedes Fenster derselbe Glas-Stoff vor demselben
Raum, in L0, L1 und L2. Die Chokepoint-Zeile ist `M.glasdunkel` (:1938) — sie nimmt Farbe, Deckkraft und Rauheit von `M.glas`
(0x33576a · 0,42 · 0,15 · metalness 0) und behaelt nur das Fehlen des Licht-Datums. Keine neue Rolle, kein neuer Stoff, kein Flag.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Klasse = „was das Auge in einem Fenster sieht": Laibung · Fluegel · Scheibe · Raum dahinter · Nacht-Glut, je Stufe L0/L1/L2.
- Stufe Geometrie (Laibung, Fluegel geschlossen an der Innenflucht, Gewaende, Bank mit Nase, Sprossen, fern ebenso): liegt
  in `w28-fassade` b038852b (RAHMEN-/Oeffnungs-Gesetz, `fensterAt`, `windowSash`, `fensterFern`, DURCHBLICK 0,2). Der Schnitt
  hier faehrt AUF diesem Kopf (dieselben Zeilen), nie daneben.
- Stufe Scheibe tags (dieser Schnitt): `M.glasdunkel` = Glas-Ton ohne Datum (:1938). Damit fallen in EINER Zeile: L0/L1-Scheibe
  (:1062 → :992 `glasRolle`), L2-Mischung `schlafF` (:2469–2470, liest Deckkraft und Ton aus dem Stoff) und der Kommentar :2455–2456.
- Stufe Raum: die L1 zeigt den Raum als Albedo (:3242–3249), die L0 als Licht (0,006 linear). Der Schnitt bewegt KEINE Zahl
  davon; er macht den Raum nur in allen Fenstern sichtbar. Das Bildpaar unten entscheidet, ob der Innenkoerper am 12-m-Wechsel springt.
- Stufe Nacht: unveraendert — wach glueht (`__licht` :1946), schlafend nicht (kein Datum). 45 % bleiben nachts dunkel wie heute.
Leser-Liste (wer liest, was sich aendert):
`fachwerk-core.js:1062` fensterAt · `:992–1003` windowSash · `:1906` SEH_DER_ROLLE glasdunkel → glas (Draw-Klasse bleibt) ·
`:1942–1944` Farb-Gesetz `_HEX`/linear · `:2469–2470` fensterFern schlafF · `stamm/stoff-material.js:2037–2068` _leuchtStoff
(kein Datum → keine Glut) · `stamm/studio-stoff.js:250` Durchsicht nach `R.op` (Deckkraft 0,92 → 0,42 wird transparent
gezeichnet) · `scripts/diag-haus-fern.cjs:462–486` Glas je Stufe (Tag/Nacht/Farbe L1, L2 gegen L0) · `spec/asset-contract/v6`
Goldens (L2-Vertexfarbe der schlafenden Scheibe aendert sich → Vertrags-Akt haeuser.json).
Kosten-Zeile: 0 Dreiecke, 0 Befehle (glasdunkel bleibt eigene Glas-Klasse, L0 gotisch 12 Draws gleich; die L2 bakt die
Mischung weiter opak im Putz-Stoff). Mehr Transparenz am Schirm: 45 % der Scheiben unter 12 m zeichnen jetzt durchsichtig statt
fast deckend — Ueberzeichnung nur in Fenster-Pixeln, nicht an Weltgroesse gebunden; Programm-Zahl nicht gezaehlt.
Kriterien der Meisterkarte: siedlung.K1 „Haus von innen" 1/2, #2 Innen-Bild Median 0,081 ↔ ≥ 0,15 (GTX 1cd1c408), Station
`g5.js:1695` — dieser Schnitt bewegt die Zahl NICHT (er misst innen). licht.K5 „Wetter und Nacht ohne Bruch" 1/2, #2 ohne Station.
Ein Punkt wird damit nicht gebucht; der Schnitt ist eine Bild-Abgabe.
Bildpaar: Dorf der Ankunft, Mittag, Kamera von `genom-spiel/frontal.png` (Rezept `bildpaar-im-spiel-rezept.md`) + dieselbe
Fassade aus 10 m und 14 m (beidseits des 12-m-Wechsels) + Uhr 0,9 (Nacht) — vorher Schachbrett, nachher eine Scheibenfamilie;
nachts gleiche Zahl gluehender Fenster.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-fassade` b038852b (12.11. 14:19, WIP, kein Abgabe-Commit): Oeffnungs-Gesetz, Gliederung, Hauston; selbst als offen
  genannt „Scheiben als dunkle Platten ohne Tiefe und Spiegelung". Fehlt: Landung von `w28-stadt-grammatik` (OMEN-Kette),
  main einmischen, geerbtes ROT gate:settlement O-Akt (Dorf-Licht 2 < 4) und Datei-Decke `scripts/lib/kreatur-proben.cjs`,
  gate:haus-welt riss nach 900 s (nicht zugeordnet).
- `w28-dorf-innen-leicht-pm` 6c090fc8 (12.11., WIP, ungemessen): die Station siedlung.K1#2 haelt je Haus nur dims/solids
  statt 451–501 MB Geometrie — Apparat, kein Bild.
- `w18-innen-licht` a96dbeb9 ist in main (Decken aus dem Gesetzbuch; Innen-Blick swiftshader 0,0060 → 0,0108).
- Fuer die Scheibe tags liegt kein Zweig.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gemessen: welche Stufe das Haus in `frontal.png` zeigt (Entfernung geschaetzt ~15 m → L1); woher das GRAU der wachen
  Scheiben kommt (Innenkoerper-Albedo hinter 0,42 Glas, Spiegel-Pass des Himmels oder beides) — der Spiegel-Pass
  (`stamm/dirigent-kern.js:972–1025`, `stamm/bild-sicht.js:660`) ist nicht gelesen.
- Widerspruch: L1 zeigt den Raum als Wand-Albedo × 0,92, die L0 misst ihn bei 0,006 linear (3–8 % des Schatten-Bodens). Ob die
  L1 am 12-m-Wechsel heller springt, sagt keine Linse (haus-fern vergleicht nur Albedo, `diag-haus-fern.cjs:380`).
- Nicht gelesen: warum der L0-Raum so dunkel ist (Umgebungslicht unter der Decke, gebackene AO der Innenflaechen) — das ist
  der Hebel fuer siedlung.K1#2, eine eigene Licht-Wurzel, nicht dieser Schnitt.
- Nicht gelesen: wie `R.op` aus dem Material in die Welt reist (`studio-stoff.js` vor :225); `_colFor` fuer glasdunkel (nicht in DEFCOL).
- Station siedlung.K1#2 liest nur 5/18 Haeuser (aussen undefined) — Apparat, nicht angefasst.
- Haustueren stehen offen (`preOpen`, :963–964): im Bild geschlossen gesehen — nicht geklaert, welche Stufe das zeigt.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 3 (jedes Haus an der Ankunft, 45 % seiner Fenster; mit w28-fassade zusammen 4) · Aufwand S (eine Stoff-Zeile +
Vertrags-Akt + Bildpaar) · Risiko: die Goldens v6 und die Glas-Zahl von gate:haus-fern bewegen sich, und hinter den bisher
dunklen Scheiben wird der helle L1-Innenkoerper sichtbar — springt er am 12-m-Wechsel, zeigt das Bildpaar es sofort.
