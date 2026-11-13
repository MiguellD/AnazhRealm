# 59 Konsum-Tiefe der Kerne: was das Gesetzbuch kann und die Welt nie ruft

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `BILD/dorf-main-0.5.png` (Dorf der Ankunft, Mittag): rechts ein zweigeschossiges Haus, weiß-graue glatte Wand, kein Stein,
  keine Fuge, dünnes bläuliches Dach; links ein langer brauner Bau ebenso glatt. Um beide Häuser NICHTS: keine Dachrinne,
  kein Fallrohr, kein Weg von der Tür, kein Holzstapel, kein Beet, keine Leine. Das Haus steht nackt auf dem braunen
  Teppich-Boden; davor ein Marktstand und drei Laternen (die kommen aus dem Kern, `AUSSTATTUNG`). Himmel dunkel-marine.
- `BILD/studio-welt/kandidat-fachwerk-bild.png` (die Bühne, ein Haus): Dach mit Pfannen-Punkten, Giebel mit Ziegel-Ahnung —
  der Kern KANN Stoff; die Welt im Dorf zeigt ihn nicht. `heute-fachwerk-diff.png` ist fast ganz rot (Differenz-Maske).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Wege des Konsums (alle drei gezählt): Alias auf `globalThis.__xCore`, der EINE Strom `AnazhRealm.Gesetz("kern:pfad")`
(`stamm/dienst.js:1989`, 57 Aufrufe in 17 stamm-Dateien) und der Worker (`voxel-worker.js`, `foundry-bruecke.js:888`).
- **fachwerk** (Export-Block `fachwerk-core.js:10527–10690`, ~147 Schlüssel): Grep über stamm/ + voxel-worker.js findet
  rund 58 mit Welt-Leser (≈ 40 %; Kern-interne Aufrufe nicht gezählt). Gelesen u. a.: Plan, Wege, Brücken, Verkehr, Licht,
  Belag, Rauch, Epoche, Wachstum (`siedlung-ort.js:1080–2994`, `siedlung-wege.js:1471–1621`, `siedlung-verkehr.js:443–1915`).
- **vehicle** (`vehicle-core.js:4964–5048`, ~84 Schlüssel): rund 21 mit Welt-Leser (≈ 25 %) — der Fahr-Schritt ganz
  (`koerper-fahrt.js:1297–3133`, `siedlung-verkehr.js:627–1491`), die Geometrie-Vokabeln sind Labor-Shell.
- **porta, schmiede, koerper** tief konsumiert: Tor-Membran/Glut/Tür/Stein (`siedlung-tor.js:4–821`, `studio-stoff.js:586`),
  Arena/Seil/Pfeil (`kampf.js:1134–2149`, `koerper-seele.js:844`), das XPBD-Tuch (`koerper-fahrt.js:160–365`,
  `koerper-leib.js:449`). Exporte nicht einzeln gezählt.
- Die Kerne erklären selbst „Welt liest nicht": `host:"none"` an `BERG_VIS/INSEL_VIS/WALD_VIS/KACHEL_VIS`
  (`foundry-core.js:213,220,231,237`), `PHYLO_VIS` (`phyto-core.js:3989`), `EXPL_VIS` (`fachwerk-core.js:9568`),
  `PRUEF_VIS` (`vehicle-core.js:3359`).

Die zehn größten ungenutzten Fähigkeiten mit sichtbarer Wirkung (Rang nach Fläche im Bild der Ankunft):
1. **Der Hof jedes Hauses** — `hofFuer` (`fachwerk-core.js:3177–3226`): Dachrinnen + Fallrohre an den Traufen (3185–3194),
   Weg-Platten Tür → Straße (3204–3205), Holzstapel an der Wetterseite (3207–3210), Beete (3211–3214), Wäscheleine
   (3215–3218), Efeu am alten Haus (3221–3222), Kisten am Gasthaus (3219), Tränktrog der Schmiede (3223), gepflasterter
   Stadthof (3199–3202). Labor-Dorf mischt ihn in jede Stufe ≤ 2 (`worlds/fachwerk/fachwerk.js:88,768,771`). Welt: **0 Leser**
   — `buildStufe` sagt es selbst: „KEIN hofFuer (Schnitt-Grenze (a))" (`fachwerk-core.js:5051–5052`, Kopf 43–46,
   `spec/asset-contract/v6/CONTRACT.md:64`).
2. **Die Stoff-Karten** `texZiegelwand/texDach/texPutz/texStein` (`fachwerk-core.js:1799–1841`, Läuferverband NF 24 × 7,1 cm,
   Biberschwanz 0,32 m, Kellenwurf, Quader 46 × 28 cm): nur mit `document`; der Worker baut „kartenlos", „durchs Portal reist
   keine Karte" (Kopf 53–65, Stoffe 1912–1930). Welt: 0 Leser. Mauerwerk liegt WIP in `w28-stoff-fuge` (unten).
3. **Die Zeit-Achse der Wagen** `EPOCHE_GESETZ/epocheForm/epocheAusJahr` (`vehicle-core.js:4726–4828`: Schleife, Ochsenkarren
   −3000, Kutsche 1700, Motorwagen 1900, Zukunft 2150). Der Ort trägt seine Epoche (`siedlung-ort.js:1080`), der Wagen wird
   nur mit `seed` gestellt (`siedlung-verkehr.js:605–615`) — kein `epoche` erreicht `buildInstance` (`vehicle-core.js:4850`).
4. **Wald-Lichtung + Kronenansatz** `WALD_GESETZ` (`foundry-core.js:226–231`, glade 22 m), host none.
5. **Berg als Volumen mit Tunnel** `BERG_GESETZ` (`foundry-core.js:212`, Rtun 3,2 m), host none.
6. **Küste der Insel** `INSEL_GESETZ` (`foundry-core.js:219`, coastD 74 m), host none.
7. **Blattstellung goldener Winkel** `PHYLO_GESETZ` (`phyto-core.js:3988`), host none (ob der Baum-Bau sie intern liest: nicht geprüft).
8. **Tageszeiten des Hauses** `ZEIT_GESETZ` — `ZEIT_VIS.host = "licht"` (`fachwerk-core.js:9528`) behauptet einen Welt-Leser;
   Grep findet keinen außer dem Labor (`worlds/fachwerk/fachwerk.js:649`, fail-soft).
9. **Begehungs-Schwere** `BEGEH_GESETZ` — `BEGEH_VIS.host = "world-g-dual"` (`fachwerk-core.js:9513`), kein Welt-Leser (nur
   `worlds/fachwerk/fachwerk.js:961`).
10. **Hamon der Klinge** `hamonGesetz` (`schmiede-core.js:5266`) — kein stamm-Leser per Grep; ob `buildInstance` ihn intern
   trägt: nicht geprüft.
Nebenbefund: `stamm/dienst.js:1966` beruft sich auf `gate:konsum-bilanz` „misst, was noch niemand trinkt" — das Tor existiert
nicht (`package.json` kennt nur `gate:studio-vertrag`, 144). Die Zensus-Zeile „Tote Kern-Exporte" (`schmiede-core.js:5235`)
hat keinen Leser mehr in scripts/.

## Die EINE begrenzende Entscheidung
Der Hof reist mit dem Haus: `buildStufe` (`fachwerk-core.js:5102`) mischt `hofFuer` in die Stufen 0 und 1 — die
Schnitt-Grenze (a) fällt. Begründung: größte Fläche im Bild der Ankunft, null neue Draws (Bake in die Rollen-Geoms wie im
Labor), Kosten an die Stufe gebunden (Stufe 2/3 ohne Hof, wie das Labor fern „kein Hof-Detail" trägt, `fachwerk.js:88`).
Karten (2.) gehen den Weg von `w28-stoff-fuge` (Stoff im Shader), nicht diesen.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen (alle in einer Welle):
- **Stufe 0** (`fachwerk-core.js:5105–5161`): nach `bakeLOD(st.g …)` (5158) `mischeGeoms(geoms, hofFuer(B))` mit `B = massBau(p)`
  (trägt `q`, `spawnL`, `ext`, `dims`; `bauOrtWrap` wirft ohne `q.y`, 3165–3167).
- **Stufe 1** (5168–5170): nach `fragFuer(B, 1)` dasselbe `mischeGeoms(geoms, hofFuer(B))` — derselbe B, kein zweiter massBau.
- **Stufe 2/3**: ohne Hof (Labor-Gesetz `C.stufe<=2` gilt dort für die Chunk-Stufen 1/2 = Welt-Stufen 1/2 — ENTSCHEIDUNG: Welt-
  Stufe 2 trägt ihn mit, wenn ihr Tri-Budget `B2c` (Kopf 73–80) es hält; sonst nur 0/1. Erst messen, dann die Zeile setzen).
- **Der Parzellen-Spielraum** `hofGap`: massBau setzt die Sonden-Identität 2,5 (ländlich, 4905/4945); die Welt muss den der
  Siedlung tragen (`plan.norm.gap`, Labor `fachwerk.js:231`) — Stadt 0,06 = Stadthof ohne Weg, Dorf = Weg + Beete. Über das
  Slot-Rezept `ov` (`siedlung-ort.js:492`) in `p.hofGap`, `massBau` liest es.
- **Die Kopf-Zeilen** (a) 43–46 und 5051–5052 und `CONTRACT.md:64` fallen im selben Commit (sage a, tue a).
Leser-Liste (wer liest, was sich ändert):
- `foundry-bruecke.js:888` (Worker ruft `buildInstance` → `buildStufe`) — Mesh der Häuser wächst.
- `scripts/diag-fachwerk-contract.cjs:130,146` (Parität Shell ↔ Kern) und `spec/asset-contract/v6/golden/haeuser.json`
  (Vertrags-Akt: Goldens neu prägen — dieselbe Datei prägt `w28-stoff-fuge` neu, 113 von 258 Fällen).
- `stamm/gelaende-kollision.js` liest `geoms.__solids` — der Hof setzt keine Solids: Holzstapel/Trog sind begehbar.
  ENTSCHEIDUNG: Holzstapel, Trog und Beet-Rahmen als Solids in `hofFuer` sammeln (dieselbe `addSolid`-Form), sonst
  physik.K2 (Kontakt ohne Durchdringen) reißt.
- `stamm/siedlung-wege.js` (`_wegeKarteMale` ~551 und 1604–1621 `vorplatzBoden/eingangVon`): der Vorplatz malt schon einen
  Fleck vor der Tür; die Weg-Platten des Hofs dürfen ihn nicht doppeln — Leser lesen, bevor geschnitten wird.
- `worlds/fachwerk/fachwerk.js:88,768,771` mischt den Hof selbst über `fragFuer` (nicht über `buildStufe`) — bleibt unberührt.
Kosten-Zeile: Hof = Box-Prims, gebakt in vorhandene Rollen (metall, holz, lattung, stein, stamm, lehm, laub, dunkel) —
Draws je Instanz steigen höchstens um die Rollen, die das Haus nicht schon trägt (lehm/laub/stamm; B2c-Zeile L0 11, Kopf 79):
NICHT gemessen. Tris je Haus: nicht gemessen. Bauzeit im Worker (Pflicht B): eine `hofFuer`-Runde je Haus und Stufe,
gecacht in `B.hofFrag` (3178) — Kosten-Zeile im Commit mit Ankunft-Zahl vorher ↔ nachher.
Kriterien: **studios.K4** Studio = Welt im Bild 0/2, Bild-Differenz 23,9–46,1 % ↔ ≤ 2,1 % (Blatt `1113-kurs-B` Zeile 151;
das Labor-Dorf trägt den Hof, die Welt nicht) · **ankunft.K4** Erster Blick AAAA am Spawn 0/2, nie gemessen (Zeile 155) ·
Pflicht A. Station: `bild:dorf@0.5` (die gpu-probe-Marke der Stadt-Abgaben) — Bildpaar vorher `BILD/dorf-main-0.5.png`.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Für den Hof: NICHTS — kein Zweig gefunden (FUND-REGISTER nicht durchsucht).
- `w28-stoff-fuge` **212b6de9** (WIP, auf `w28-stadt-grammatik` 22872718): `_fugeStoff` in `stamm/studio-stoff.js` (Fuge je
  Pixel aus fachwerk `FUGE`, Stufe 1), Stufe 0 baut den Verband Stein für Stein; Goldens 113/258 neu. Deckt Klasse 2 für
  Mauerwerk; ob Dach (Biberschwanz) und Putz (Kellenwurf) mitkommen: im gelesenen Diff nicht gesehen.
- Reihenfolge: der Hof-Schnitt setzt auf `w28-stoff-fuge`, weil beide `haeuser.json` neu prägen — EIN Vertrags-Akt, nicht zwei.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Konsum-Quoten sind Grep-Zählungen (Alias, Strom, Worker); Kern-intern gerufene Exporte (z. B. `bakeLOD` in `buildStufe`)
  zählen nicht. koerper, tetrapoda, klang, gelaende, phyto nicht einzeln gezählt (19-tiere, 24-klang decken zwei davon).
- `exportSettlement` (`fachwerk-core.js:8269`) nicht gelesen: ob `plan.norm.gap` schon im Slot reist.
- `W.typ` der Wagen (`siedlung-verkehr.js:605`) nicht verfolgt: ob die Wahl des Typs die Epoche schon trägt.
- Widerspruch Gebot 4: `ZEIT_VIS.host "licht"` und `BEGEH_VIS.host "world-g-dual"` erklären Welt-Konsum ohne Leser; der
  Kommentar `dienst.js:1966` nennt ein Tor, das nicht existiert. Kein neues Tor (Kurs 5) — die Zeilen sagen künftig „none".
- Kein Hof-Bildpaar, keine Tris/Draws/ms gemessen (nur lesen erlaubt).

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung **4** (jedes Haus der Ankunft bekommt Rinne, Weg, Stapel, Beet, Leine — die Fläche um die Häuser ist im Bild heute leer)
· Aufwand **M** (zwei Mischzeilen + gap-Durchreichung + Solids + Vertrags-Akt) · Risiko: Kollision ohne Solids und doppelter
Vorplatz-Belag brechen still, und der Vertrags-Akt kollidiert mit `w28-stoff-fuge`, wenn er nicht darauf gesetzt wird.
