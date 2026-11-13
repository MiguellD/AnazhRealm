# 25 Das Fahrzeugstudio (garage) als Norm der Studios

Gelesen: main-Code leib-kanon-urteil (ec281422; origin/main steht inzwischen auf 7f778d44, garage dort nicht geändert — nicht
gegengeprüft), `worlds/garage/index.html` ganz, `garage.js` ganz, `huelle.js` gezielt, Zweige `w28-studio-welt` 6039dc13 und
`w28-studio-seiten` ad504fbe (Diff + Rümpfe), `w28-samen-fahrzeug` BEFUND.md, stand.json (fahrzeug.K1–K5, studios.K1–K5).

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `BILD/studio-welt/mittag/studio-garage-iso-baum.png`: blauer Wagen in Isometrie auf olivgrünem Boden mit Halbmeter-Raster,
  das Bronze-Zifferblatt kaum sichtbar. Die Haut liest als Platten: Buckel auf der Haube, Stufen an Kotflügel und Tür, Kasten-Heck.
  Räder da, Schatten der Sonne da. Kein Himmel im Bild (Draufsicht).
- `BILD/studio-welt/werk-gt-L0-spaet.png` (blick:werk am Zweig, vier Blicke, Abendlicht): derselbe gt; in Blick 1 und 3 KEIN Rad
  zu sehen, der Wagen schwebt über seinem Schatten; in 2 und 4 nur ein Rad hinten. Himmel oben hell-pfirsich, Boden glatt oliv.
  Das ist der Rad-Ecken-Bruch, den d3cfd4d1 („werk() ganz (Rad-Ecken, Flügel, Leib)") als geheilt meldet — Bild danach nicht gesehen.
- `BILD/studio-welt/heute-garage-diff.png`: Differenzbild Labor ↔ Welt, fast die ganze Fläche rot (Boden, Himmel), der Wagen dunkel.
- Ein Bild der Garage-Seite im Spiel (Tor → Studio) habe ich nicht gesehen.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Was die garage hat und die anderen sechs Bild-Seiten nicht (main):
1. Engine der Welt: r184 WebGPU (`garage.js:23`, Import-Map `index.html:147-148`); nur schmiede auch (`schmiede.js:16`). r128
   `WebGLRenderer` mit eigenem ACES: `fachwerk.js:633/636` (1,12), `koerperstudio.js:83` (1,0), `tetrapoda.js:186` (1,25),
   `porta.js:172` (1,1), `phytogenesis.js:531`. Sieben Seiten, sieben eigene Renderer-Bauten.
2. Licht der Welt ohne Studio-Lichter: `__weltLicht.buehne` (`garage.js:785`), Boden = `ATMO_BODEN` (`:46`), EINE Sonne (`:64`);
   Uhr wird nicht gereicht → nur Mittag (`welt-licht.js:1073` laut Kurs-D-Blatt).
3. Vorbau asynchroner Pipelines (`garage.js:737-750`, gemessen 06.11. swiftshader: 42 → 12 synchron, 2,8 → 2,1 s) und
   Zeichnen nur bei Bedarf (`:756-770`, `_wecke`/`_camGleich`); schmiede zeichnet jedes Bild (`schmiede.js` animate, Diff 6039dc13).
4. Die ANSICHT als Modus: Perspektive · Isometrie · Seite mit Rasten (`garage.js:384-395`), `einpassen` (`:399-408`),
   Drehteller 20°/s (`:674-686`), gestaffelte Explosion mit Achsen (`:417-447`), Animation aus `VC.fahrSchritt` (`:453-460`).
   Keine andere Seite hat Iso/Seite/Drehteller (Kurs-D-Blatt §1: nur fachwerk Explosion/Schnitt).
5. Labor = Welt-Bau: `VC.buildInstance` (`garage.js:243`) ist derselbe Bau wie der Foundry-Faden; Fahr-Schritt, Chase-Kamera,
   Prüfstrecke aus `gelaende-core` (`:486-496`, `:575-617`) teilen Welt und Garage — fahrzeug.K3 misst es: Garage FOV +9,07°,
   Welt +9,47° (stand.json:489).
6. Der Schirm gehört dem Werk: Leiste ≤ 15 % (`index.html:87-92`, vorher 51 %), Lehren und Werkzeug auf Knopf.
7. Leicht-Modus für Agenten ohne GPU (`garage.js:22`, 185 → 54 ms je Bild swiftshader).

Was die Welt KONSUMIERT:
8. `werk()` (`garage.js:821-827`) schickt `{kind:"vehicle", preset, seed, ov}` inkl. Regler `epoche` → `_studioUebergabeEmpfang`
   (`stamm/netz-portal.js:1379`) → `ws.studioOv[preset]` (`:1392`). Leser: nur `_studioStampFor` (`werkstatt-vorschau.js:864`) für
   vom Spieler gesetzte Werke (`werkstatt-bauen.js:403`, `siedlung-bauten.js:1225`).
9. Der Verkehr der Stadt setzt `fahrzeug_<typ>` OHNE `studioOv` (`siedlung-verkehr.js:605-615`; der Stempel wird nur aus
   `opts.studioOv` gelesen, `siedlung-satz.js:1432`): kein Garage-Werk und keine Epoche erreicht einen fahrenden Wagen.
10. Der Kern kann die Zeit: `EPOCHE_GESETZ` sechs Stufen Schlitten → Zukunft mit eigener Gestalt (`vehicle-core.js:4725-4789`),
    `epocheAusJahr` (`:4823`) — **0 Aufrufer** im Repo (Grep *.js). Der Ort kennt sein Jahr (`siedlung-ort.js:1080`, fachwerk-Epoche).
11. Die Haut von heute: 223 von 235 Haut-Meshes Boxen (95 %), 28 716 Dreiecke, Radlauf-Spanne 225 mm, 0 m Fugen
    (BEFUND samen-fahrzeug Fakten 2, 5, 10, 11). Die Bühne zeigt genau das — das Studio ist nie besser als `buildSkin`.

## Die EINE begrenzende Entscheidung
Die Norm der garage wird Glied der Hülle, nicht Vorlage zum Abschreiben: `AnazhHuelle.studio()` (w28-studio-seiten, huelle.js
~2822) ist der EINE Zeichner jeder Studio-Seite — Bühne, Takt nach Bedarf, Streiflicht, Nackt; die ANSICHT der garage
(Perspektive · Iso · Seite · Drehteller · Einpassen) zieht als `S.ansicht` in dieselbe Funktion, und die garage selbst steigt als
Seite darauf. Was garage-eigen bleibt: Lehren, Rahmen/Gelenke, gestaffelte Explosion, Probe-/Prüffahrt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Klasse: „Studio-Seite trägt ihren eigenen Anschluss" — sieben Renderer-Bauten → einer. Absenz-Grep danach:
`new THREE.(WebGL|WebGPU)Renderer` in `worlds/{garage,schmiede,fachwerk,koerperstudio,tetrapoda,portale,terrain}` = 0.
Stufen (eine Welle, Reihenfolge):
1. 6039dc13 landen (Bühne der Hülle; garage/schmiede schon darauf). Der Stall-Akte-Bruch in `scripts/diag-blick.cjs` ist laut
   d3cfd4d1 geheilt; der Kipper der Mehrspieler-Wand an diesem Zweig ist nach Nachtrag 21:06 der Übergabe wieder UNBENANNT.
2. Ansicht in die Hülle: `garage.js:384-408` + `:666-686` → `huelle.js studio()` als `S.ansicht(proj)` mit Orthokamera und Rast.
   garage.js ruft `AnazhHuelle.studio({welt:"garage", werk, nachBau, takt})`; eigener Takt `:752-776`, `oc`-Kugel `:668` fallen.
3. Seiten: portale (liegt in ad504fbe), tetrapoda, koerperstudio, terrain-Labor, fachwerk auf `studio()`; ACES-Zeilen fallen.
4. Bildpaar je Seite Labor ↔ Bühne an fester Kamera (Rezept `bildpaar-im-spiel-rezept.md`), Zahlen K2/K4.
Leser-Liste (wer liest, was geändert wird):
- `huelle.js:1628 werkMass`, `:1682 bruecke` (werk/wurzel/panorama je Seite) · `welt-licht.js:1073 buehne`, `buehneZeichnet`
- `scripts/diag-studio-huelle.cjs` (H9 Bühne ohne eigenes Licht, H11 eigener Bühnen-Bau, H6 laut d3cfd4d1 neu zu schneiden)
- `scripts/diag-garage-labor.cjs` (G8 Vorbau 120 s, G11 Prüffahrt-Telemetrie `garage.js:623`)
- Station K4: `PM/bericht/2910-w3w-studios/skripte/k4-bild.cjs` (Roh: `messung/roh/12f2f146-radeon/studios.K4_1.out`)
- die Tor-Membran der Welt (`panorama` der Brücke, `garage.js:803`) · der Übergabe-Empfang `netz-portal.js:1379`
Kosten-Zeile: Neubau p95 Radeon garage 416 → 236 ms, schmiede 47 → 57 ms, blick:werk 8–15 s (Rumpf 6039dc13). Studio-Seiten
laden hinter dem Tor, nicht im Welt-Boot → Ankunft (Pflicht B) unberührt (nicht gemessen, aus `index.html` der Seiten gefolgert).
Kriterien:
- **studios.K4** (Labor ↔ Welt, Bilddifferenz): Ist Radeon 12f2f146 garage 0,8472 · portale 0,9483 · schmiede 0,681 ·
  fachwerk 0,9754 · terrain 0,9914; Soll ≤ 0,021 (`studios.K4_1.out:9`); 0 Punkte, Stationen K4#1/#2 radeon+gtx ungemessen
  (stand.json:3994-4037). Am Werk-Blick des Zweigs: fachwerk 97,9 → 8,3 %, portale 94,7 → 43,9 %.
- **studios.K3** (Dreiecke ±5 % gegen renderer.info): 1 Punkt, K3#2 radeon/gtx ungemessen (stand.json:3960).
- **studios.K2** (Undo 8/8): 1 Punkt, K2#2 ungemessen (stand.json:3925) — die Sitzung je Seite muss den Umzug überleben.
- fahrzeug.K3 (Chase Garage ↔ Welt) bleibt Wächter der Fahrt-Kamera (stand.json:481, 2 Punkte).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-studio-welt` 6039dc13 (Abgabe [ci voll]): `AnazhHuelle.buehne` (+403 Z.), garage −82/schmiede −18 Zeilen eigener Anschluss,
  Uhr-Zeile Früh·Mittag·Spät·Nackt (`garage index.html` +`#buehneOrt`), `welt-licht.js B.abschied`. Fehlt: Code-Check grün
  (Stall-Akte, MP-Wand-Kipper ohne Täter), K4 der Station unbewegt („kein Studio ruft werk()").
- `w28-studio-seiten` ad504fbe (WIP, Notbremse): huelle.js +860 (`studio`, `kopf`, `studios`, `reise`, `werk` jeder Art),
  `worlds/huelle/index.html` + `uebersicht.js` (Übersicht, ungetestet), portale umgezogen (porta.js −402/+…), stamm
  `_foundryFlatTeile`/`_fluegelSchwenk` gehoben. Fehlt laut d3cfd4d1: Übersicht prüfen, Streiflicht 15° „zu rot", tetrapoda
  umziehen, H6 neu schneiden, Bildpaare/Zahlen Radeon. garage ruft dort `studio()` NICHT (nur `buehne`, garage.js:26 am Zweig);
  die Ansicht ist in huelle.js am Zweig nicht vorhanden (Grep „Isometrie|einpassen" 0 Treffer).
- `w28-samen-fahrzeug` 5406f47d: Haut-Kandidat aus Schnitten (20 578 Dreiecke, Radlauf 225 → 4 mm, 17,9 m Fugen) — Lager,
  Byte-Bruch aller Fahrzeug-Goldens, braucht laut Befund §5.5 das Wort des Schöpfers.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- WIDERSPRUCH: K4 kann grün werden, indem die Bühne so stumpf wird wie die Welt (Übergabe §3: „Welt muss zum Labor hinauf");
  fachwerk liest auf der Bühne ohne Balken und kaum Ziegel (FUND d3cfd4d1). Der Umzug von fachwerk macht die Seite ärmer, bis
  `w28-stoff-fuge` 212b6de9 / `w28-fassade` den Stoff der Welt tragen — darum fachwerk als letzte Seite der Welle, nach der Stoff-Fuge.
- Nicht gelesen: huelle.js am Zweig ganz (nur studio()/buehne-Zeilen), `uebersicht.js`, `diag-studio-huelle.cjs`, `diag-garage-labor.cjs`.
- Nicht gesehen: werk-Blick nach d3cfd4d1 (Räder), Garage-Seite in Fahrt, Bildpaare `sw/paar/*` (Scratch des Arbeiters).
- Ob eine städtische Siedlung je an der Ankunft (Dorf am Prüfplatz) fährt: nicht gelesen — der Verkehr ist laut `siedlung-verkehr.js:4`
  städtisch; die Garage erreicht die Ankunft heute nur über ein vom Spieler gesetztes Werk.
- Ob die Stadt ein Jahr trägt, das `epocheAusJahr` speisen kann: nicht gelesen.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Alle Seiten auf `studio()` + Ansicht der garage in die Hülle: Wirkung 3 (Takt: jedes Studio zeigt sein Werk im Licht der Welt in
  Sekunden, Iso/Seite für alle; die Ankunft sieht es nicht) · Aufwand L · Risiko: fachwerk/koerperstudio verlieren Labor-Glanz,
  solange der Welt-Stoff ihn nicht trägt (Bildpaar je Seite vor dem Landen).
- Verkehr liest Prägung und Epoche: Wirkung 2 (nur Stadt) · Aufwand S · Risiko: Default byte-gleich nur, wenn ohne Prägung und
  ohne Jahr nichts gereicht wird.
- Haut aus Schnitten (Samen): Wirkung 4 (jeder Wagen in Stadt und Bühne) · Aufwand L · Risiko: Byte-Bruch aller Fahrzeug-Goldens,
  Vertrags-Akt.
