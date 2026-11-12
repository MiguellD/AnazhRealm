# AUGEN-KARTE 2026-11-11 — dritter Opus-Schwarm: was man SIEHT (Befund, kein Plan, kein Scope; baut auf HEBEL-KARTE und TIEFEN-KARTE auf)
Gesehen: frisch 65 Bilder in 9 Serien (main c4010773, Radeon 890M) · Bestand ~485 Bilder in 60 Paketen P01–P60 (probe-post 07.–11.11., lokal auge/, 4 ältere) · 466 Funde stehen, 326 Aussagen berichtigt/gefällt.
Nicht geschafft vom Aufnehmer: annaeherung-haus, fahrt-Neulauf (Taste los vor Schuss), tier2 (st.creatures), buehne (null.get), hochhaus-dach (ETIMEDOUT), gipfel-blick, Schwenk am Hochhaus; Wetter nur Wiese, Nacht ohne Zeitraffer.
Kritiker selbst gesehen: standorte/stadt, stadt-voll, bewohner-stadt-voll, tier-wiese, 08-4m, P27 d2c7735a A↔A-ruhe, P50 0136ab62; Texte P23 P39 P47 P51 P52 P57 P27. Alle halten.

## 1 Tests, denen das Bild widerspricht
A. Exit-Code schlägt gedrucktes Urteil (eine Klasse, 14 Pakete). Kriterium, das fehlt: eine ❌/ROT-Zeile im Log ist ROT, egal welcher Exit (gpu-probe.yml:295 `elif RC=0 → GRÜN`).
- gate:laub-kante (P39 P40 P41 P42 P43 P44): Kopf GRÜN über eigenen Zeilen „lod.K1#1 ROT“ (strauch:L2 0,28–0,35 in 02611cdf, eiche:L1 0,33). abnahme-urteil.cjs:2479-2512 loggt `gut`, gibt `.abnahme` zurück.
- gate:pop (P47 P48 P57 P58): GRÜN über „lod.K2#1 ROT 0,055–0,067 %/s“ (6ee4408f, a98f0db6). werkbank.cjs:2854 setzt kein o.fehler (nur BLOCK-TREUE :2857). P58: A/B-Gang urteilt nur Seite A.
- gate:haar-strich-probe (P23 452dc752): vier ❌-Zeilen, Kopf GRÜN; haar-strich-probe.cjs:67 `process.exit(0)` unbedingt.
- geh-probe --ab (P51 9daa5a84): fahrt-ab GRÜN bei B p95 33,6 ms, 16,8 % >33 ms; :221 urteilt nur B≤A, Kopf :8 verspricht ≤1 %; „GEH-AB GRÜN Halt der Lage“ fest gedruckt.
- Vehikel unter fremdem Namen (P52 P53): gate:naesse:echt zeigt auf artifacts/boden-nah/mess.cjs; jede Zeile mit ✅ (:24), Nässe nie geprüft. Einlass liest package.json des Zweigs (gpu-probe.yml:69).
- zerlege --bild (P27 d2c7735a): ✅ BILD bei „offen 11 Wald-Böden“; zerlege.cjs:26 hängt ✅ an jede Zeile. P28 dba78d96: Bild-Zeile ✅ ohne `offen` aus diag-boot-stage.cjs:407.
- garage-labor (P56 972a2bcf): Kopf ROT (swiftshader) über „GRÜN — die Garage“; gpu-probe.yml:303 nennt den Grund nicht im Kopf (Ursache an main mit 57eae8aa gefallen).
B. Ein Leib ist nie Täter (14 Pakete, frisch 3). Linse kamera-nah.cjs:112-118 `zaehlt` (`!isSkinnedMesh && !userData.gang`); Radien ausgabe-aufnahme.cjs:663/678 ohne „Leib“.
- standorte/stadt.png: Stachelhaar-Kopf unten Mitte 0,5–1 m vor der Linse (~5 %), Schulter unten links, Zeile „Sicht 0,0 %“ GRÜN. nacht/stadt-00uhr.png gleich.
- nah/bewohner-stadt-voll.png: Kamera steckt im eigenen Kopf (Haarkarten füllen das Bild, blaues Hemd unten), GRÜN „frei 4,01 m“.
- Bestand: P02 P06 P07 P08 P10 P11 P12 P13 P16 P17 P19 (Kopf unten Mitte, Schulter unten links, „Blickziel frei 23,89 m“). Fehlendes Kriterium: Leib < V in sicht.vordergrund, ROT ab 2 %.
C. Ziel leer = gezeichnet (frisch 5 Bilder). ausgabe-aufnahme.cjs:720 `ohne.every(...)` ist bei leerer Liste wahr; `ohne` sammelt nur architectures (:638-643).
- nah/tier-wiese, -genesis, -stadt, -dorf: GRÜN, kein Tier im Bild (dorf: nur Luma 29,5 am dunklen Hang). Tier nicht gehalten (werkbank.cjs:839-850 ruft __halten nie).
- nah/tier-*: Spieler-Leib unten im Bild (wiese blau/braun Mitte unten); feld-leben.js:526-533 setzt playerMesh.visible zurück (unsicher). nah/wasser-ufer-genesis: kein Wasser sicher, GRÜN „frei 8,21 m“.
- Fehlendes Kriterium: leere Gestalt eines benannten Ziels ergibt null = ROT; Ziel-Klasse muss Pixel zeigen.
D. Inhalt des Orts nie gefragt. haushalt.json: nur dorf/stadt/stadt-voll tragen imBild; wiese, genesis, buehne, hochhaus-dach, gipfel-blick nicht (werkbank.cjs:1878 leer = GRÜN).
- Stadt ohne Wagen GRÜN (P02 P03 P05 P09 P10 P18 P19): imBild nur bauSatz/bewohner. P50 0136ab62-wiese: Gras magenta/türkis/violett, GRÜN (nur Luma, abnahme-urteil.cjs:31-35).
- P58 a8bf76c8/4e918922: schwarzblaue Kronen GRÜN. Dorf ohne Haus GRÜN (P35 P45 P46 P49 P54 P57 P58; in main geheilt 8dedeab6). P21: Probe fuhr alte Zweig-Linsen.
- P35: auch bei GRÜN nennt die Zeile nur „Blickziel frei“, der bestandene imBild-Anteil steht nie im Post (werkbank.cjs ~1883 nur bei ROT).
- Fehlendes Kriterium: jeder Messort trägt imBild (Klasse, Anteil, Farbton/Luma-Band); stadt zusätzlich fahrzeug ≥ 0,005.
E. Bild belegt nicht den Zweig (Pose fremd, kein Vorher). Kriterium fehlt: Probe am merge-base desselben Läufers, Δ im Post; Bild der berührten Klasse Pflicht.
- P33 P34 P32: Ferne-/Horizont-Zweige mit Blick 10 m auf Wiese; luft-tiefe schießt eigene Bilder, speichert sie nie (licht-linsen.cjs:2190-2198). P34 5f49c06a: Absturz „LUFT …elements“ als Ton-ROT gezählt.
- P34: Radeon ROT, GTX GRÜN bei praktisch gleichen wiese-Bildern; das Urteil folgt dem Gerät, den Gate-Schuss sieht niemand. P37: Messort wiese „Blick ins Offene“, Waldwand nach 30–60 m (welt-orte.cjs:125-127).
- P25 P36 P37 P39 P41 P42 P55 P56: Einzelbild wiese/genesis als Beweis für Strauch, L2, Wald-Saum, Tier, Fell, Winter (Bühne immer sommer, ausgabe-aufnahme.cjs:358), Studio.
- P42 7aa4802d w28-wald-saum: Diff nur scripts/, Bild gleich Vorgänger, GRÜN. P22: drei gleiche Dorf-Bilder GRÜN für Stoff-Gesetz; STOFF_GESETZ hat in fachwerk-core.js 0 Leser.
- P49: ego-schatten misst in Laborszene (diag-ego-schatten.cjs:211-250, eigenes Licht, graue Plane), kein Bild mit Spielerschatten. P43: f:eiche:L1 0,31→0,19 durch Umbenennung der Rinde (koerper-leib.js:1651).
- P23: bild:dorf ohne --klasse, kein Bewohner im Bild für Leib/Haar. P04: Markt vorher/nachher per /schirm, drei Welten, HUD. P46: LOD-Pop ohne Bildfolge. P51: Gehen/Fahrt ohne ein Bild aus Bewegung.
- P48 d3ac18c2: gate:kamera-leib:echt ROT (K6 Kopf 2,0 %), im Post nur ein Wiesenbild ohne Leib; gate:* bekommt nie ein BILD (gpu-probe.yml:275).
F. Einzelne Linsen, die belohnen statt messen.
- annaeherung-baum/08-4m.png: Stamm groß in Bildmitte, ROT „nicht im Bild (ndc [0,0])“; durchgefallen ist der Fuß-Punkt (kamera-nah.cjs:283-289), der Grund nennt den Punkt, der besteht.
- fahrt/02–08: GT pixelgleich bei gehaltenem W, Loop aus (werkbank.cjs:463/851). fahrt/01 fehlt: weltStehtNach bricht mit „archLod“ statt „Taste gehalten“.
- standorte/wiese, genesis: 640×360 gerendert, als 1280×720 gespeichert (werkbank.cjs:1793); geraet.leinwand ohne Schwelle. P04 oben-kopf gleich.
- P29 b-himmel-kalt: Dorf, 15–20 Figuren, Büsche fehlen bei Kontrolle, GRÜN 1,07 % Lücke; diag-boot-stage.cjs:83-84 mittelt über das ganze Bild (Soll ≤ 2 %, :407). Kriterium fehlt: Kachel-Maximum.
- laub-kante belohnt Zerfall (P05 P26 P44): Konfetti-Inseln senken die Kohärenz und machen GRÜN; Mittel über alle Randpixel (abnahme-urteil.cjs:762) verschluckt örtliche Häufung. Kriterium fehlt: freie Inseln.
- material.K2 MIKRO (P31 P53): `nyquist ≥ 0,15 && glatt ≤ 0,1` belohnt Pixelrauschen; glatt absolut σ<4, dunkle Blöcke immer glatt (abnahme-urteil.cjs:731); POSE GRÜN bei 17 % Boden.
- P31 tag-achse: Sprung 0,33→0,34 rechnet den Wolkenwurf (bild-himmel.js:204-222) der Sonne zu. P30: Membran zeigt verzerrtes Gesicht, diag-portal-membran H GRÜN (nur Y>240, milchweiß).
- P01: Bewohner-Maske 2 von ~40 grün (werkbank.cjs:916-940 nur visible+Name); Lack-Spiegel als bauSatz. P16: ziel.gezeichnet = _archIsRendered, keine Deckung. P17 dorf: Ziel 5,2 m = nächster Bau.
- P50 757f9f43: gate:pop ROT, Post zeigt nur die Selbsttest-Zeile „1/7 fremd“; der Täter-Block ohne Marke fällt aus dem Filter (gpu-probe.yml:300).
- tag/*: Bewohner in sechs Uhrzeiten pixelgleich; Bühne springt Uhr ohne Bewohner-Takt (ausgabe-aufnahme.cjs:345/533).
- P21 gate:kollision-bild ohne --bild (package.json:74): GRÜN „kein Adapter“, kein PNG. P56 gate:wasser-leben:bild ohne --bilder: kein Wasser-Bild.

## 2 Die schwersten Mängel im frischen Bild
1. [5 · Stadt, 19 Pakete] Kein Wagen im Stadtbild (standorte/stadt-voll.png ganz; fahrt 02–08 nur der eigene GT; schwenk 2 stehende von 20). Am 31.10. Kolonne von 5 (P59 P60).
   siedlung-ort.js:801-817 `_ortPose` verwirft jede Sicht über eine Spur (`spurfrei`) · Regel trasse + imBild.fahrzeug 0,005 · bild --ort stadt: heute ROT „kein fahrzeug“, nachher ≥ 0,5 % in 3/3.
2. [4 · Laub, ~25 Pakete] Laub-Konfetti: lose Blattkarten vor dem Himmel ohne Ast (standorte/stadt-voll oben rechts und Mitte; schwenk 02/07; annaeherung 03-80m oben; tag 08/12/17 oben rechts).
   phyto-core.js:4213 karteSaumSchluessel (saum 8,4) bzw. stoff-karte.js:2272 `|| c > 0.0` aus a40143ca · Muster an Deckung binden (gb·(1+s·(m−½))) · laub-kante + Zählung freier Inseln.
3. [4 · Mensch, 12 Pakete] Klötzchen-Leiber ab 5–8 m, armlos, Stapel aus Kästen (standorte/stadt-voll Mittelgrund links und rechts; schwenk 01/07; bewohner-stadt rechts).
   siedlung-bewohner.js:3412-3414 nahLeiber 4 / nahM 8, Rest `_bewohnerSatz` LOD 2 · Stufe aus LOD_SCHIRM.leib statt Kopfzahl; lod.K5 bekommt Leib · Zensus Stufe × Abstand (heute ~2 von 27 voll).
4. [4 · Mensch] Stachelhaar als radiale Kartenstäbe (standorte/stadt unten Mitte; nah/bewohner-stadt-voll füllt das Bild; P05 P07 P11 P13).
   koerper-core.js:425-447 haarStreu, nur zi()/nacken() tragen HAAR_STRICH · Strich-Felder für jede Schalen-Zeile · Hinterkopf-Bild, Strähnenwinkel zur Normale > 60°.
5. [4 · Nacht] Nacht = abgedunkelter Tag: Wände ohne Quelle beige/rosa hell, 05/20/00 Uhr fast gleich, Laterne ohne Bodenfleck (tag/05,20,00; nacht/stadt-00uhr).
   welt-licht.js:66/609-612 Belichtung auf Mondlicht normiert; bild-himmel.js:2134 Ambient·nacht trägt die Wand · Nacht-Knoten fest, Ambient fällt · Wand unbeleuchtet : angestrahlt ≥ 3:1.
6. [4 · Tag] Sonnenauf-/-untergang immer 06/18 Uhr, im Sommer gleich (tag/05uhr ≈ 20uhr ≈ 00uhr).
   bild-himmel.js:1307 `_sonnenWinkel` nur aus Uhr, Deklination 0 Treffer · Sonnenbahn aus Saison × Breite · 05 Uhr Sommer heller Horizont, Luma 05≠20≠00 > 15 %.
7. [4 · Baum] Zielbaum (f:tanne:L1) als Speichenkrone: kahler Stamm, Äste aus einem Punkt, breites Laub (annaeherung-baum 04–08, 08-4m Mitte).
   foundry-core.js:494-506 budget.tree[1] + :2089-2108 Wedel-Pfad · L1 aus Quirl-Gerüst der L0 · Studio-Bild L0/L1 nebeneinander, ≥ 4 Quirle.
8. [3 · Boden, 12 Pakete] Gras auf Stadtplatz und in Gassen, kniehoch zwischen Leuten (standorte/stadt-voll Mitte; fahrt Vordergrund; P03 P05 P06 P07 P08 P19).
   siedlung-wege.js:1322 stille Kappe `MAX = plan.kappe || 900`; fachwerk-core.js:4581 Platz ‚gras‘ bei staedt&&jahr>1840 · Kappe fällt laut, Zweig streichen · Formen-Summe, Gras auf Platz 0.
9. [3 · Boden, ~15 Pakete] Kies/Pflaster als pixelfeines Grau-Rauschen ohne Steine (standorte/genesis, stadt-voll Vordergrund, nacht/stadt+dorf Boden, Genesis aller Pakete).
   daten.js:697-716 TERRAIN_BUMP mikroPx 1; siedlung-wege.js:864-873 `_kopfsteinFarbe` Bruchton ungefiltert 1,5–4 px · Korn in Weltmetern, Ton nach Pixel-Spanne filtern · Laplace-σ −50 %.
10. [3 · Ankunft, P25–P28] Halbes Bild nackte braune Rauscherde mit Linealkante zur Baumreihe (Kontrolle-Bilder d2c7735a, dba78d96, 7d8454a4).
   vegetation-wiese.js:786-792 `_wieseGrund` = 0; siedlung-wege.js:724 `_wegeBelagAt` 0 vor Zentrierung · Ort-Grund trägt Wiese außer Plan-Flächen · gruen/pfad im 10×10-Raster lesen.
11. [3 · Mensch] Ballon-Rumpf, Arme verschmolzen, Haut sticht durch Hemd (nah/bewohner-stadt, mensch-gesicht-dorf/-stadt-voll; schwenk 01–08 vorn).
   foundry-core.js:6794-6810 MENSCH_MENGE blend 0,06 über alle Primitive; :6903 `__farbSchnitt` · Arm/Rumpf hart vereinigen · Anatomie-Linse an Stufe 2.
12. [3 · Dorf] Pose vor Hauswand in 5,78 m, Dorf am Rand (standorte/dorf; tag alle 6; nacht/dorf-00uhr). Abnahme ROT, als „DURCHLASS(Auge)“ gespeichert.
   siedlung-ort.js:766 Hindernis = Inkreis `min(obb.ex, obb.ez)` · Sichtlinie gegen gedrehtes OBB · bild --ort dorf: Ziel ≥ 12 m frei, Gasse mittig.
13. [3 · Wetter] Nebel nur 3,2 km Sicht; cloudy regnet und ist nass, gilt aber als trocken; cloudy dunkler als rainy; Sturm-Himmel sepia (wetter/*).
   bild-himmel.js:2156 `_luftBeta` zwei Anker; :2732 `_weatherIsWet` gegen :2938 `_naesseTakt`; phyto-core.js:3902/3906 sun 0,32/0,55 · eine Nässe-Frage, Nebel-Anker ~400 m.
14. [3 · Mensch] Statuen: alle reglos, gleich gerichtet, ohne Tätigkeit (stadt-voll, schwenk, P18 P20); Sitzender auf Pflaster (schwenk 03/04).
   siedlung-bewohner.js:1762 `b.akt` geschrieben, 0 Leser im Stamm; koerper-fahrt.js:475 `_sitzLage` null · Verb des Leibs aus b.akt · Verben-Verteilung 12 Uhr ≥ 2 Klassen.
15. [3 · Dorf] Hang mit schwarzem Leopardentupfen-Muster (standorte/dorf oben rechts; P05 P21 ähnlich am Erdhang).
   ungefunden (bodenSatz oder formationenSatz) · erst Maske `^(bodenSatz|formationenSatz)$` · Klasse der Tupfen benennen.
16. [3 · Himmel, 7 Pakete] Graues halbtransparentes Bogenband im Himmel (P06 P07 P08 P12 P16 P20 P22, nur einzelne Läufe).
   ungefunden: Kamin-Rauch per Math.random (siedlung-bewohner.js:94-120), Fern-Ring oder Nachhall (vor c0dc9417) · Klassen-Maske am Band-Pixel · 3 Kaltschüsse an main.

## 3 Bewegung: was nur der Zeitraffer zeigt
- fahrt 02→08: GT, Kamera, drei Bewohner pixelgleich, nur Rauch lebt. Gedrücktes W bewegt nichts (Loop aus).
- gang 01→08: Welt wandert 0,71 m je Schritt, Leib immer in Ruhepose; jeder Schuss nach dem Loslassen, ein Gangzyklus ist nie belegt.
- tag 05→00: Bewohner in allen 6 Uhrzeiten an gleicher Stelle in gleicher Pose; Sterne wandern wirklich.
- tag 20/00/05: dunkles Bodenband deckungsgleich, obwohl der Mond ≥ 60° dreht (Kandidat statische Himmels-Sicht, unsicher).
- P27 d2c7735a Kontrolle→Ruhe: Hintergrund Mitte (x 440-700) erst Lücke mit Feld bis zum Horizont, nach Ruhe Bäume; Laub-Rand unter dem Lade-Takt gekappt (dirigent-regler.js:343/376).
- P29 kalt→Ruhe: Häuser, 15–20 Figuren, Büsche springen nach der Kontrolle ins Bild; Lücke 1,07 % „GRÜN“ (Mittel über ganzes Bild).
- P24 Bild 1→2 (main): Wald blendet gerastert nach dem Weltbild ein; Bild 3/4: Wurzeln scheinen durch den Boden. Am Zweig 6/8 ganz (c0dc9417, in main).
- P01 314ff351, P04 markt-vorher: fahrender Wagen halbdurchsichtig mit Doppelkontur; TRAA kennt nur Kamera-Bewegung (bild-kosten.js:2238-2256).
- P26 7→8, gleiche Pose: andere Stämme, roter Stamm weg, Baumschatten weg; Kandidat c396a989 GPU-Wahl, ungefunden.
- P36 3 von 10 Läufen Konfetti im Himmel, P37 Hintergrund springt am Commit 3a2fe909: Bild nicht deterministisch, das Gate merkt es nicht.
- P31 0,33→0,34: nur die Wolkenschatten auf dem Kies springen, Licht bleibt.
- annaeherung 01→08: 300/150/80 m Zielbaum nicht auszumachen, kein Karte→Mesh-Wechsel sichtbar; Azimut nicht festgehalten.

## 4 Was fehlt, das da sein müsste
- Ein fahrender Wagen in irgendeinem frischen Bild (Pflicht C ohne Bild-Station; die Klassen-Zählung findet keine Klasse /fahrzeug/).
- Ein Tier im Bild: 4 Tier-Nahbilder leer, kein Messort tier-nah, Bühne reicht `tiere` nie durch.
- Ein ROT-Bild: ausgabe-aufnahme.cjs:862-876 wirft vor dem Speichern; Täter (bauSatz 45 m, P06) unsichtbar. Gate-Schüsse liegen im tmp und kommen nie in den Post.
- Ein Bild aus Bewegung (Gang mit Taste, Fahrt mit Loop, pop-Schritt mit höchstem pop als Paar).
- Saison und Ferne: kein Winterbild, kein Horizont mit Kilometer-Sicht, kein trocken↔nass-Paar desselben Wetters.
- Leben im Dorf: kein Karren, Zaun, Brunnen, Tier; Leiber ohne Tätigkeit.
- Spielerschatten unter Spiel-Sonne (ego-schatten misst nur Laborszene).
- Fenster mit Laibung und Gewände (fachwerk-core.js:1062 fr='holz'); Tambour-Fenster der Kuppel liegen in der Wand (:1731-1734).

## 5 Stark — nicht anfassen
- Halm-Wiese: dicht, Grün bis Gold, Ähren, keine Kacheln; Baumschatten als Bahnen (gang 01–08, wetter/sunny, fast jedes Wiesenbild im Bestand).
- Haus-Schlagschatten scharf, Sockel satt auf dem Grund (standorte/dorf, P07 P12 P20 P56).
- Morgenlicht 08 Uhr: flach, warm, langer Hausschatten, Gras im Gegenlicht (tag/08uhr-dorf).
- Kamin-Rauch, Wolkenhimmel, Laternen mit Glas und Kontaktschatten (stadt, stadt-voll, schwenk 01/03/05/08, P02 P21).
- Abendhimmel Orange→Blau ohne Naht (P32 gtx-kopf-gipfel-blick-0.74).
- Bogenpflaster mit Fächerreihen (standorte/stadt Vordergrund; P06 P07 P08, d3634d3f).
- Ganzes Weltbild am Zweig c0dc9417, kalt wie Zweit-Boot (P24 Bild 6/8); Gerätegleichheit Radeon/GTX (P18 P49).
- Glatte Putzwand nach w28-putz-wand (P11 P13 Vierer rechts); Bruchstein-Bögen Genesis (P22 ab6c476f).

## 6 Art-Director-Urteil je Motiv
- Stadt (frisch): Häuser und Licht tragen, die Bühne ist ein Wartesaal: Statuen im Gras, Kopf vor der Linse, kein Wagen.
- Fahrt (frisch): sieben Mal derselbe geparkte GT auf einem Erdweg; eine Fahrt existiert im Bild nicht.
- Dorf (frisch): am Tag glaubhaft, die Pose klebt an einer Wand, nachts ein eingefrorenes rosa Bild.
- Wiese/Gang (frisch): das Beste der Welt; der Spieler gleitet darüber als Schaufensterpuppe.
- Baum (frisch): Waldlicht mit Stimmung, der Zielbaum ist ein Speichenschirm, Blätter lösen sich in den Himmel.
- Mensch nah (frisch): Ballon-Rumpf, Stachelhaar, Haut durchs Hemd; aus der Nähe bricht jede Glaubwürdigkeit.
- Tier (frisch): vier grüne Urteile, null Tiere.
- Wetter (frisch): Farbstich und Overlay statt Luft; Nebel ist kaum Nebel, Sturm ist sepia.
- Nacht (frisch): die Ferne (Sterne, Rauch, Fenster) trägt, die Nähe ist ausgeleuchteter Tag.
- Ankunft/Genesis (Bestand): lesbarer Torplatz, aber Rausch-Kies, harte Beetkanten und halbe Erdfläche.
- Haus-Studio (Bestand): Silhouette sauber, Material-Pop Ziegel→Putz bei 12 m, offene Flügel überall.
- Ferne/Horizont (Bestand): fast nie im Bild; wo es sie gibt, Rausch-Gipfel und Klötzchen-Stadt unter schönem Himmel.

## 7 Schon bekannt und jetzt GESEHEN bestätigt
- Kein Wagen im Stadtbild (FUND-REGISTER 156(3), TIEFEN Hebel 2): frisch in stadt, stadt-voll, fahrt, schwenk, nacht.
- Laub-Konfetti / Laub-Fetzen (Pflicht A, TIEFEN Z.7/14, Hebel 16): frisch in standorte, tag, schwenk, annaeherung.
- Stachelhaar-Kopf vor der Kamera, Abnahme frei (FUND-REGISTER 156(5)): frisch stadt, nacht/stadt, bewohner-stadt-voll.
- Block-Figuren ab ~10 m, lod.K5 ohne Leib (156(1)): frisch schon ab 5–8 m.
- Gras in Gasse und Vorplatz, 900-Kappe (TIEFEN Hebel 8, 156(2)): frisch stadt-voll und fahrt.
- Geister-Wand = Gerüst in Wandfarbe (157 Berichtigung): Vierer P11/P13 zeigen die Heilung; frisches main-Dorf nennt sie nicht mehr.
- Nachhall der Lade-Bilder (148): P24/P25 Zweig ohne Linie, geschnitten c0dc9417.
- Bilder alt und ungesehen (TIEFEN §1/§9): 60 Pakete, fast jedes Urteil prüft „Blickziel frei“ und Luma.

## 8 Vom zweiten Auge gefällt
- standorte/stadt „ein Fünftel verdeckt“: es sind ~5–6 %, das Blickziel in der Mitte ist frei; falsch ist nur die Zahl 0,0 %.
- gang „gleitet“: jedes Bild entsteht nach dem Loslassen von KeyW; die Serie kann keinen Gang zeigen, sie lügt nicht.
- bewohner-stadt-voll: der Kopf ist der eigene Spieler-Kopf (Haar, blaues Hemd), kein Bewohner.
- Pflicht A „fimp:atlas:L2 0,2635“: die Klasse ist seit w4-laub-karte nach Arten geteilt; heutiger Täter fimp:strauch:L2 (P40, PFLICHT-OFFEN.md:16 stale).
- P03 „Maske übersieht Bewohner 0,35 %“: Ausdruck war nur ^(bauSatz)$; 0,35 % ist Vordergrund-Deckung am Ziel.
- schwenk/P02 „Bewegung fehlt“: Schwenk und feste Bühne sind kein Zeitraffer, Gleichheit ist gewollt.
- P05 Metadaten: 4073fb2f lief auf radeon-890m, adeeb1c3 stadt ROT war TypeError (Blick NaN), kein Weltstand.
- wetter „cloudy darf nicht regnen“: laut Wort-Tafel regnet cloudy; schwach bleibt nur cloudy dunkler als rainy.

## 9 Was dieser Schwarm nicht sah
- Frisch nur Radeon, nur main c4010773; keine GTX-Serie. Haus-Annäherung, Hochhaus, Gipfel, buehne, Stadt-Nacht-Zeitraffer ohne Bild.
- Kein Video, keine Bewegungsserie im Bestand; P51 geh/fahrt sind Standbilder.
- Bestand außerhalb 8 Tage: knoten-wurzel-kalt, w5-gpu-blick, a-spawn-gtx2/3/4 (AAAA-Zellen, „boden-nah laiWirk 0 in 12 von 12“), b-kalt-*, lokal 1010–1610.
- Nicht gelesen: Leopardentupfen, Graues Himmelsband, orange Glühpunkte (wetter, tag-kurve), Hang-Tupfen, violetter Erdstich (P10), dunkler Block (fahrt links oben).

## 10 Die ersten 60 Minuten
Linsen, die zuerst ein Kriterium brauchen (je ein Chokepoint, die Klasse fällt):
- gpu-probe.yml:295: jede ❌/ROT-Zeile im Log macht ROT (fängt laub-kante, pop, haar-strich, geh-ab in einem Schnitt); dazu laubKanteGang und werkbank pop setzen o.fehler.
- kamera-nah.cjs:112-118: fremder Leib wird Täter-Klasse „Leib“ in sicht und vordergrund (14 Pakete).
- ausgabe-aufnahme.cjs:720: leeres `ohne` ergibt null = ROT; Kreaturen in die Gestalt (Tier, Wasser).
- werkbank.cjs:1878: Messort ohne imBild ist ROT; stadt trägt fahrzeug 0,005. ausgabe-aufnahme.cjs:862: ROT-Bild als *-rot.png speichern.
- diag-boot-stage.cjs:83-84: Lücke als Kachel-Maximum statt Bildmittel (P29; P27 Lücke in der Bildmitte).
Die 3 Schnitte mit der größten sichtbaren Wirkung:
1. siedlung-ort.js:801-817 `_ortPose` Regel trasse: Wagen mit Fahrer ins Stadtbild (19 Pakete, Pflicht C bekommt ein Bild).
2. Laub-Saum an Deckung binden (phyto-core.js:4213 / stoff-karte.js:2272): Konfetti vor dem Himmel fällt in ~25 Paketen (Pflicht A).
3. Leib-Stufe aus dem Schirm-Gesetz statt nahLeiber 4 (siedlung-bewohner.js:3412-3414): die Menge wird bis 15 m zu Menschen statt Klötzen.
