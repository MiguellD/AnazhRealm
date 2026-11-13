# 05 Das Haus: Stoff der Welt gegen das Fachwerk-Labor

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Labor, viktorianisches Haus, 32 m: Läuferverband mit Fugen an Wand und Giebel, Dach in Reihen gedeckt, Veranda-Dach geschindelt, Schornstein aus Stein.
  `PM/meisterkarte-quelle/punkte/messung/roh/900c28e6-radeon/studios.K4_1-k4/fachwerk-buehne.png`
- Welt, dasselbe Haus, gleiche Kamera (Abstand 32,17 m laut `fachwerk-welt.abnahme.json`): eine dunkelrot-braune Fläche ohne Fuge, das Dach ein glatter
  Ton, der Giebel leer, der Schornstein ein grauer Kasten. `…/studios.K4_1-k4/fachwerk-welt.png`
- Kandidat der neuen Bühne (w28-studio-welt): ein Raster aus Punkten auf dem Dach, an der Wand ein sehr schwacher Ziegel-Schimmer, sonst ebenso stumpf.
  `BILD/studio-welt/kandidat-fachwerk-bild.png`
- Dorf der Ankunft, Mittag: ein zweigeschossiges Putzhaus als hellgraue, glatte Kiste, die Dachkante ein dünner Strich, kein Stoff an keiner Fläche.
  `BILD/dorf-main-0.5.png`
- Ganz nah, 5,2 m vor dem Haus (Stufe 0, Zweig w28-fassade): Laibung, Läden und Sockel sind da, die Putzwand selbst ist eine einzige weiße Fläche ohne Korn
  und ohne Kellenzug. `BILD/fassade/abgabe/dorf-kopf.png`

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Pfade unter SPIEL (main ec281422), sofern nicht anders genannt.
- Das Gesetzbuch hat VIER Stoffe, die als Karte gemalt sind: `texZiegelwand` mit Läuferverband 24 × 7,1 cm, 1,1 cm Fuge und Brandton je Stein, `texDach` (Biberschwanz,
  Deckmaß 0,32, Breite 0,18, Schattenfuge 27 %), `texPutz` (Kellenwurf mit 5200 Sprenkeln und Kellenzügen) und `texStein` (Quader 46 × 28 cm, 1,6 cm Fuge):
  fachwerk-core.js:1799–1841. Diese Karten hängen nur an den Labor-Stoffen ziegel, ziegel2, backstein, putz und stein (fachwerk-core.js:1912–1930).
- Das Gesetz selbst sagt, wo die Welt sie verliert: „Durchs Portal reist keine Karte; der Vertrags-Mesh trägt je Rolle den EINEN Stoff“ (fachwerk-core.js:53–58).
  Worker und Node backen ohne Karte (:64). Die Welt liest nur die Ecken-Farbe (:2076).
- In der Welt steht also an jeder Ecke nur der Mittelton: `_baseFor` mischt Stein-Anteil × Stein und den Rest × Fuge (fachwerk-core.js:2089). Darauf kommt ein
  Rauschen von 3,5–8 % je Rolle (`NOISEAMP`, :2072). Bei 0,5 m Raster ist das unter 1 px am Schirm.
- Das Raster der Welt-Lage wird gerechnet und weggeworfen. `bakeLOD` schreibt für JEDE Ecke ein Welt-UV mit 0,5/m (fachwerk-core.js:2147–2148, „Texturen laufen
  stetig über Bauteilgrenzen“). Der Bau-Satz trägt aber kein uv: `BAU_SATZ_ATTR` hat 8 Puffer (stamm/siedlung-satz.js:1652–1661), und 8 ist die Decke von WebGPU
  (:1662–1666). Ein Leser für dieses uv fehlt.
- Was die Stufen bauen:
  - Ziegelwand: Stufe 0 baut sie Stein für Stein als Geometrie (:627–629). Die Flächen-Stufe 1 baut EINE Platte und gibt nur den Anteil weiter (`__fuge`, :624–625).
    Der Giebel bekommt in Stufe 1 je Lage EIN Band, die Stoßfugen nur als Ton (:730).
  - Dach: Stufe 0 deckt Ziegel für Ziegel (`eindeckenFlaeche`, :821). Das Unterdach ist ein ziegel2-Polygon (:804–806). Stufe 1 legt je Reihe EIN Band (:828).
    Die ferne Stufe hat nur Rand und eine Haut aus dem Körper (:811, `lod2Koerper` :3052–3074).
  - Putz und Stein sind auf jeder Stufe eine glatte Fläche (Labor: nur die Karte).
- Ein Muster gibt es schon im Haus der Welt: das Stein-Gesetz der Tore. `_steinStoff` rechnet aus dem uv je Pixel Fuge, Bruchton und Fase
  (stamm/stoff-material.js:2779–2829). `mp.stein` schaltet es frei (stamm/studio-stoff.js:585–593), der Satz trägt dafür uv in `BAU_STEIN_ATTR`
  (siedlung-satz.js:1667–1670). Die Häuser nutzen es nicht.
- Das Labor rechnet mit r128 und Karte, die Welt mit r184 und Ecken-Farbe. Für das Leuchten gibt es schon eine Brücke ins Labor über `onBeforeCompile`
  (fachwerk-core.js:1956, „Lab = Welt“). Für die Fuge gibt es keine solche Brücke.
- Zum Balken, der Widerspruch: viktorianisch ist `stil:'klinker'`, also holz → backstein (:185, :1988). Das heißt `GLATT`: keine Riegel, keine Streben (:197, :631, :642).
  Die Balken im Bild des Labors kommen also nicht aus dem heutigen Gesetz (das Bild ist vom Stand 18.546.244). Am Dorf steht das Holz der Fachwerk-Stile auf jeder
  Stufe als Geometrie (:632–639, Flucht in der fernen Stufe). Dort fehlt kein Balken, es fehlt der Stoff.
- Zahl: KONSUM von 4 Karten in der Welt = 0 von 4 auf jeder Stufe. Im Zweig w28-stoff-fuge ist es 1 von 4, und nur die Gefach-Platte der Stufe 1.

## Die EINE begrenzende Entscheidung
Der Verband reist als FUNKTION DER WELT-LAGE, nie als Karte. Je Ecke reisen drei Dinge: das Raster (u, v in Einheiten des Verbands), der Anteil und die Art.
Dafür gibt es keinen neunten Vertex-Puffer: alles geht in die freien vierten Komponenten des Bau-Satzes, also 0 neue Puffer und 0 neue Programme. EIN Satz-Stoff
zeichnet daraus alle vier Arten. Das Labor zeichnet dieselbe Rechnung, und die vier Canvas-Karten fallen.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Die Klasse:** die Rollen backstein, ziegel, ziegel2, stein und putz (dazu lehm als Fugen-Ton) auf den Stufen 0, 1 und 2. Stufe 3 wirft nur Schatten und trägt keine Farbe.
1. **Kern (fachwerk-core.js):**
   - Die Tafel `VERBAND` mit Zahlen für laeufer, biber, quader und kelle entsteht als die EINE Quelle der Maße. Ihre Zahlen kommen aus :1801, :1813, :1834 und :1826.
     Darauf baut die Tafel `FUGE` des Zweigs auf.
   - `bakeLOD` und `bakeHaus` (:2135–2148, :2097–2110) schreiben an jede Ecke dieser Rollen u, v, Anteil und Art. Grundlage ist das Welt-UV, das schon da ist.
     Am Dach läuft v längs der Fall-Linie: wy ÷ sin der Neigung statt der Projektion auf xz.
   - Das Raster je Feld (`fugeAn`, Zweig :316) bleibt nur für das Gefach. Dort zählt der Salz je Feld (`fugeSalz`).
   - Die Karten `texZiegelwand`, `texDach`, `texPutz` und `texStein` sowie `map:` in `materials()` fallen (:1799–1841, :1912). Das Labor bekommt den Stoff über
     `onBeforeCompile` nach dem Muster von `_leuchtLab` (:1956).
2. **Transport:**
   - `aFuge` reist an jeder Stufe, nicht nur an Stufe 1: siehe Zweig fachwerk-core.js:2186 und :5535–5550.
   - Die Art reist im vierten Byte der Normale (snorm8 × 4) als `aFugeK`, neben `aFugeU`, `aFugeV` und `aFugeA` (Zweig siedlung-satz.js:1690–1703, `SATZ_FUGE`).
   - `FOUNDRY_PLATTE_FORMAT` geht von 6 auf 7 (Zweig studio-bruecke.js:3631).
3. **Stoff (stamm/studio-stoff.js):** aus `_fugeStoff` (Zweig :124–199) wird `_verbandStoff`.
   - Die drei Fugen-Arten teilen den Kamm.
   - biber hat dazu die Schattenfuge am Fuß der Reihe.
   - kelle hat kein Raster: dort wirkt Korn × Kellenzug am Schirm, und das Korn blendet unter einem Stein je Pixel aus.
   - Der Mittelton bleibt gleich: (Farbe − Rest × Fuge) ÷ Anteil wie im Zweig. Die Schattenfuge und das Korn werden mittelwert-treu normiert, wie `_karteEins` es tut (:1856).
**Leser-Liste (vor dem Schnitt):**
- Kern: fachwerk-core.js:624–625, :730, :804–806, :828, :2089, :2135–2148, :3052–3074 und :1912–1944.
- Satz: stamm/siedlung-satz.js:34–62 (`_bauSatzArt`) und :1652–1670. Im Zweig dazu `_satzKernFuge` und `_satzKernFugeTon` (:620–641).
- Gestalt: stamm/studio-gestalt.js:284–289 (Zweig).
- Stoff: stamm/studio-stoff.js:602–615 und :710–743, also die Signatur. Sie bleibt unverändert, sonst entsteht ein neues Programm.
- Worker: voxel-worker.js (+128 im Zweig, nicht gelesen).
- Linsen und Goldens: scripts/diag-fachwerk-contract.cjs, spec/asset-contract/v6/golden/haeuser.json, scripts/diag-haus-welt.cjs und scripts/diag-haus-fern.cjs.
- Labor: worlds/fachwerk/fachwerk.js:22–23 (`FC.materials()`, `_mmFor`, `mLay`).
**Kosten-Zeile:**
- 0 neue Vertex-Puffer, 0 neue Programme (dieselbe Signatur `unknown|…|satz`).
- Dazu kommt ALU nur in Haus-Fragmenten, etwa 40 Rechenschritte über dem Zweig.
- Platte +16 B je Ecke auf allen Haus-Stufen. Laut fassade-Rumpf heißt das: L0 etwa 56k, L1 11,3k, L2 1,55k Dreiecke je Haus.
- Das Format 7 leert den Asset-Cache einmal. Das ist eine Kosten-Zeile für B (Ankunft kalt), keine eigene Jagd.
- Gemessen werden soll Frame p95 Ego und Third am Dorf, GTX und Radeon, vorher ↔ nachher. Die Grenze ist der Stand von heute.
**Kriterien:**
- `studios.K4#1` (Staffel 1: mindestens 3 von 7 Mesh-Studios mit Bild-Differenz ≤ 2,1 % und Albedo im Rand 0,10). Station `stationen/g4.js:2155`, Probe
  `stationen/k4-bild.cjs`. Ist: radeon und gtx UNGEMESSEN (stand.json:3999–4016). Soll: das Fachwerk zählt, und die Welt steigt zum Labor hinauf, nie umgekehrt
  (Gedächtnis `studio-welt-welche-seite-steigt.md`).
- Wache, darf nicht reißen: `material.K3#1` „Haus L1/L0 1,008 · L2/L0 1,006“ (radeon) sowie 0,992 und 0,984 (gtx), Soll 0,95–1,05 (stand.json:2236–2251).
  `lod.K4#1` Luma-Sprung 0,45 %, Soll < 2 % (:1977).
**Bildpaar:** feste Kamera am Dorf der Ankunft, Mittag.
- Nah 5 m: Putz, Pose aus `fassade/abgabe/dorf-kopf.png`.
- Mittel 15–25 m: Stufe 1.
- 32 m: K4-Pose, Stufe 2.
- Dazu Dach aus Hügelhöhe. Jede Fläche zeigt Fuge, Pfanne oder Korn, und keine Stufe liest schlechter als ihre Nachbarin.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-stoff-fuge` **212b6de9** (WIP, kein Abgabe-Commit):
  - Fertig: das Fugen-Gesetz für das Gefach der Stufe 1, EINE Steinliste je Feld (alemannisch 76,6 → 72,7 %), der Transport `aFuge` → `SATZ_FUGE` → `_fugeStoff`,
    Goldens 113 von 258 Fällen neu.
  - Steht auf w28-stadt-grammatik 22872718. Diff: 36 Dateien, +3728 −1149.
  - Es fehlt: die anderen 3 Arten, der Giebel (:730 trägt nur den Ton), Stufe 0 bei Putz, Stein und Unterdach, Stufe 2, das Labor, und dass die Karten fallen.
    Bildpaar und Kosten sind nicht gesehen.
- `w28-fassade` **b038852b** („abgabe-bereit bis auf das Erbe von w28-stadt-grammatik“):
  - Liefert Öffnung, Gliederung und Ton. Diff: 31 Dateien, +2994 −848, davon fachwerk-core.js +1170.
  - Sein Rumpf nennt die Lücke selbst: „die Wand ist ein Ton mit Rauschen statt Putz-Stoff“.
  - Offen: gate:haus-welt bricht nach 900 s ab, Pflicht E ist nicht geurteilt.
- Reihenfolge nach UEBERGABE §4: mp-boden → stadt-grammatik → fassade → stoff-fuge. Der Verbands-Schnitt baut auf stoff-fuge NACH fassade. Beide schreiben fachwerk-core.js
  und haeuser.json, darum EIN Arbeiter für beide Heimfahrten, sonst zweimal Goldens.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gelesen:
  - voxel-worker.js (Zweig +128).
  - Ob das Packen von `normal` snorm8 wirklich mit 4 Bytes in die GPU geht. Wenn nicht, muss die Art in den ganzen Teil von `aFugeA` (Anteil, snorm8 mit 254 Stufen).
  - `eindeckenFlaeche` in der Flächen-Stufe.
  - `koerperListe` und welche Rolle die Dachhaut der Stufe 2 trägt.
- Nicht gemessen: die Kosten am Pixel, die float16-Schärfe von u und v über 32 (1/32 Stein Versatz an der Ecke), ob ein Arbeiter das Bildpaar von stoff-fuge
  angesehen hat, und die Programm-Zahl.
- Widersprüche:
  - Die Balken im Labor-Bild widersprechen dem heutigen GLATT-Gesetz für Klinker (fachwerk-core.js:197). Das Labor-Bild ist alt (18.546.244), also wird es vor dem
    Urteil neu geschossen.
  - Die Punkte auf dem Kandidaten-Dach sind ungeklärt: Nägel (Rolle `nagel`) oder Ziegel der Stufe 0 unter der Auflösung.
- Am Dorf-Bild (`dorf-main-0.5.png`) ist der Stil grauer Putz mit dunklem Dach (vermutlich `modern`: dachmod ohne Karte, :181). Dort bringt der Schnitt nur das
  Putz-Korn, keine Pfanne.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
**Wirkung 5:** jedes Haus an der Ankunft, auf jeder Stufe und aus jeder Höhe, dazu der Weg von studios.K4 nach oben.
**Aufwand L:** 4 Arten × 3 Stufen, das Labor, Goldens.
**Risiko:** Der Schnitt sitzt auf zwei nicht gelandeten Zweigen über fachwerk-core.js. Ein Fehler im mittelwert-treuen Normieren reißt sofort das Ton-Band material.K3 (0,95–1,05).
