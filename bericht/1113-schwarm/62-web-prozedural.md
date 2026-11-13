# 62 Außenblick: prozedurale Stadt, Mensch, Straße — Stand der Technik gegen unseren Code

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Dorf der Ankunft, Mittag (`BILD/dorf-main-0.5.png`, gleich `BILD/genom-spiel/gruppe.png`): der Platz ist EIN brauner,
  gesprenkelter Teppich; die Wege sind blass-violette Schlieren, die über ~1–2 m in die Erde verlaufen, nirgends eine Kante,
  kein Rand aus Stein, kein Höhenversatz. Das Haus rechts ist ein glatter grauer Kasten mit aufgeklebten Fensterplatten,
  die Treppe vor der Tür ist der einzige Körper am Boden. Die Menschen tragen Hemden als aufgeblähte Hüllen (Schultern
  und Brust wie Ballons, die Frau links mit Riss an der Seite).
- Stadt-Gasse (`KO/probe-post/w28-stadt-grammatik/2ba36747-stadt-0.5.png`): Kopfsteinpflaster läuft von Hauswand zu
  Hauswand als eine Fläche; der Übergang Pflaster→Gras ist eine weiche Blende über etwa einen Meter; kein Gehsteig, kein
  Bordstein, keine Rinne; der Wagen steht mitten im Pflaster ohne Fahrbahn. Die Fassaden: ein Ton, Fenster bündig, kein
  Gesims, kein Sockel.
- Stadt-Markt (`KO/probe-post/w28-stadt-grammatik/22872718-stadt-voll-0.5-rot.png`): Pflaster mit Fächermuster als Textur,
  plan bis an die Häuser; Bewohner ab ~15 m als Stapel heller Klötze (die ferne Stufe), nah als Ballon-Torso.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt KONSUMIERT)
Stand der Technik (Netz, 13.11.) → unsere Datei in SPIEL:
1. **Straßennetz als Graph mit Zyklen → Blöcke** (Parish & Müller 2001; CityEngine; Houdini City Layout mit Arterien-
   Splines). Bei uns: `fachwerk-core.js:3802` STRASSENGRAPH-GESETZ (Snap → Zyklen → Blöcke), `:4407 strassengraph`,
   `:4519` QUERGASSEN-GESETZ, `:3645` JAHRESRING-GESETZ (Radius = Zeitachse). KANN: auf Stand der Technik, eigener als
   CityEngine (Epoche steuert Krümmung, `:3784`). KONSUM: ja, die Stadt im Bild hat Blöcke.
2. **Parzellen** (CityEngine: Block → Lots per OBB- oder Straight-Skeleton-Teilung; Palladio: Parzelle → Grundriss + Hof).
   Bei uns: `fachwerk-core.js:3785` SAT-Packing tangential zum Straßenpunkt, `:3199` STADTHOF-GESETZ (gepflasterter Hof im
   Blockinneren), `:3203` WEG-SYNAPSE (Tür direkt aufs Trottoir). KANN: gleichwertig. KONSUM: ja.
3. **Straßen-Querschnitt als Körper** (Esri „Complete Street Rule" für den Street Designer: Fahrspur, Parkstreifen, Bord,
   Gehsteig als Regel-Glieder; Matrix Awakens/City Sample: Bord und Gehsteig als Modul-Meshes entlang der Spline, Textur
   nur für Variation). Bei uns in main: `fachwerk-core.js:3313` DORF_NORM kennt `strasseW 5,0 · laneW 3,2 · gehweg 1,2` —
   aber die Welt MALT den Weg nur in eine Karte: `stamm/siedlung-wege.js:551 _wegeKarteMale`, 2 Kanäle
   (`:1883–1887` weg/gras/pflaster), Nah-Texel **0,5 m** (`:1877`), weicher Rand **randM 0,6 m** smoothstep (`:1880`,
   `:490–494`). Rechnung: Kante = 2·0,6 m Blende + 0,5 m bilineare Probe ≈ **1,7 m** Breite — ein Bord von 0,12 m Höhe /
   0,16 m Breite ist in dieser Karte NICHT darstellbar. Der „gemalte Saum" (`:563–565`) ist der Gehweg nur als breiterer
   Farbstreifen. KANN (Gesetz): Gehweg-Maß. KONSUM: 0 % als Körper — das ist die Wurzel der violetten Schlieren.
4. **Fassaden-Grammatik** (CGA Shape, Müller/Wonka 2006: Masse → Geschoss → Achse → Öffnung → Laibung/Gewände/Bank/Sturz;
   City Sample: Regeln, wo ein Bau in Module bricht). Bei uns: liegt NUR in `origin/w28-fassade` b038852b:
   `fachwerk-core.js:199 RAHMEN`, `:683 gliederung` (Sockel, Traufgesims, Geschoss-Gesims, Eckquader), `:2067 hausTon`;
   Dreiecke je Haus L0 55 689 → 56 093 (+0,7 %), L2 −3,3 % (Commit-Rumpf b038852b). Selbst benannt offen: Öffnung ~85 %,
   Gliederung ~70 %, Ton ~80 %, Kuppel ~75 %; „gleiches Fenster in gleichem Takt, keine Mittelachse, keine Beletage".
   KONSUM in main: 0 (nicht gelandet, steht auf dem nicht gelandeten stadt-grammatik).
5. **Mensch und Kleid** (Forschung 2024–26: SimAvatar, Tailor, SynBody — Körper und Kleid als getrennte Schichten,
   Kleid aus Schnitt-Vorlage auf den parametrischen Leib gezogen, Topologie erhalten; DreamWorks Shrek 2: Lagen als
   Nachbearbeitung statt Simulation). Bei uns: `koerper-core.js:242–256` Stoff aus der Haut `dicke 0,032`, aber
   `:254` Poncho `dicke 0` = Voxel-Hülle mit `inflate 1,07`, `abstand 0,12` (~3,5 cm, `:246–247`) → der Ballon im Bild.
   Kurs in `origin/w28-leib-nah` (04fff109 „der Poncho als Stoff aus der Haut mit Weite", 44c1a3b8 „nur der Schuh bleibt
   Hülle") = genau die Schicht-Trennung der Forschung. Nicht von mir im Bild gesehen (Bildpaare 7–13 ungelesen).
6. **Editor-Oberfläche** (CityEngine-Inspector: Regel-Parameter je Shape live; Houdini HDA-Parameter; UE PCG-Graph).
   Bei uns: das Labor `worlds/fachwerk/fachwerk.js` trägt Bord/Platte (`:300–312` laut UEBERGABE §4), die Welt nicht;
   `w28-studio-welt`/`w28-studio-seiten` bauen EINE Bühne. Nicht tiefer gelesen.

## Die EINE begrenzende Entscheidung
Die Weg-Karte (0,5-m-Texel, 0,6-m-Blende) ist die Decke jeder Straße im Bild: kein Maler-Feinschliff hebt sie. Der
Querschnitt einer Straße wird, wie bei CityEngine und City Sample, aus EINEM Gesetz als KÖRPER gebaut (Höhenstufe im
Erdbau + Glieder am Rand), und die Karte trägt nur noch Belag und Verschmutzung — nie mehr die Kante.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien)
Landung von `origin/w28-weg-koerper` b1ffbea3 (baut auf stadt-grammatik), Klasse „Weg" mit ALLEN Stufen in einer Welle:
- Stufe Dorfweg/Platz (Erde, die Ankunft — Jahr −136, alle Wege Erde, Platz 19,6 × 6 m, Commit-Rumpf b1ffbea3):
  Kante an der Höhenlinie ½ (Erde mit Rausch-Kante), Kies-Korn, feuchter Rand, Feldstein-Fassung. DAS ist die Stufe, die
  der Spieler beim Ankommen sieht — sie zuerst ins Bildpaar.
- Stufe Gasse/Pflastergasse: Pflaster pixelscharf (`fwidth`), Läuferreihe an der Kante, Kantstein 0,03 m.
- Stufe Fahrstraße (städtisch, w ≥ 4,9): Gehsteig je Seite +0,12 m als Erdbau, Bord 0,12 × 0,16 m, Platte 0,5 m.
- Stufe Platz: Fußgängerzone je Punkt (`wegZone`).
- Ferne: Kisten statt Glieder ab 70 m, nur Karte ab 220 m (Pool „siedlung-weg").
Leser-Liste (aus dem Commit-Rumpf b1ffbea3, vom Arbeiter gegreppt): `_wegeBodenFarbe` (gelaende-boden, gelaende-fern,
feld-leben, stoff-material) · `_wegeBelagAt` → `_wegeFeldAt`/`_pfadFeldAt` · `_bodenSichtAt` gelaende-boden.js:113 ·
`_kontaktStoffAt` gelaende-kollision.js:1127 · diag-settlement.cjs:3198 (Teil O) · `_aufWeg` vegetation-baum.js:1913 ·
`_grundrissWegeIn` :2028 · Erdbau → voxel-worker, `_voxelSurfaceY`, `_fieldSurfaceBelow` koerper-bewegung.js:1088,
wasser-hydro.js:416/:872 · `_standSicht` koerper-leib.js:575 · Rad siedlung-instanz.js:1007 · `_stlWegeBuild` (6 Rufer:
siedlung-ort 599 · 2183 · 3000 · 3070, siedlung-verkehr 220, gelaende-kollision 480) · Labor fachwerk.js 282–350.
Kosten-Zeile: an den Schirm gebunden (Glieder nur ≤ 70 m, Kisten ≤ 220 m, Auflage-Index 4 m); Plan byte-gleich am Dorf
(c92a1562, 4d11605f); Zahl Tris/dc/ms am Dorf und Stadt: UNGEMESSEN (Schritt 3 des Rumpfs).
Kriterien: keine Karte der Meisterkarte nennt Bord oder Gehsteig (Grep in `PM/meisterkarte-quelle`: 0 Treffer). Wirkung
läuft über die Bild-Proben `bild:dorf@0.5` (GRÜN an stadt-grammatik), `bild:stadt-voll@0.5` (ROT, Leib 3,1 % am
8e166d02 — nicht der Weg) und Pflicht A (AAAA je Klasse; ob „Weg" eine der 12 Klassen ist: nicht gelesen).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-weg-koerper` b1ffbea3: Gesetz im Kern (WEG_GESETZ, wegArt, wegQuerschnitt, wegZone), Gehsteig als Erdbau,
  Glieder im Kisten-Pool, Kante im Boden-Stoff, Byte-Beweise. Fehlt: das ERSTE Bild auf echter GPU (Shader ungeprüft),
  Konsum-Probe (Kapsel 0,12, Bewohner auf Gehsteig, Wagen auf Fahrbahn), Kosten, Einmischen main + stadt-grammatik
  156cc903, Abgabe.
- `w28-stadt-grammatik` 156cc903 (WIP; Abgabe 22872718): Verkehr, Anker am Plan v2; blockiert an der Mehrspieler-Wand
  (`_bodenKlasseAt`, Schnitt `w28-mp-boden` f97fe692 WIP).
- `w28-fassade` b038852b: CGA-Kette Öffnung/Gliederung/Ton; wartet auf stadt-grammatik.
- `w28-stoff-fuge` 212b6de9: Stein trägt seinen Ton (Goldens 113/258 neu).
- `w28-leib-nah` a9a3d136: Kleid als Schicht aus der Haut, KLEID-Linse; Bildpaar am Dorf fehlt.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht gelesen: der Shader-Text der Kante (fwidth, Ebene) im Zweig; `worlds/fachwerk/fachwerk.js` 282–350 selbst;
  Bildpaare `KO/probe-post/w28-leib-nah/7–13`; die Soll-Tafel der 12 AAAA-Klassen.
- Widerspruch: die Ankunft ist ein Dorf von −136 mit Erdwegen — Bord und Gehsteig sieht der Spieler dort NIE; der
  sichtbare Gewinn an der Ankunft hängt an der Erd-Stufe (Kante + Kies + Fassung). Die Stadt liegt 1424 m vom
  Genesis-Ort (siedlung.K2#1). Pflicht F verlangt die Stadt am Platz — bis dahin wirkt der Bord nur am Messort.
- Offen benannt im Zweig: Asphalt der Moderne (4 Arten in 2 Kanälen); die Fahrbahn wölbt am Bord bis ~6 cm (Netz 1,8 m).
- Netz-Recherche: keine Quelle beschreibt Bord-Maße im City Sample im Detail; CityEngine Complete Street nur als Titel.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Weg als Körper landen, Erd-Stufe zuerst ins Bildpaar am Dorf: **Wirkung 4 · M** · Risiko: Erdbau-Stufe bewegt jeden
  Boden-Leser (Mehrspieler-Wand, Kapsel, Hydro) — die Leser-Liste ist da, das Bild nicht.
- Fassade (CGA) nach stadt-grammatik heim: **Wirkung 4 · S** (gebaut, nur Mischen) · Risiko: erbt rote settlement-
  O-Akt (Gassen-Licht 2 < 4) und haus-welt-Abbruch nach 900 s ohne Täter.
- Kleid als Schicht (leib-nah): **Wirkung 5 · M** · Risiko: Ofen-Golden und ferne Stufe (Klotz-Stapel) bleiben, wenn nur
  die Nah-Stufe fällt — die Klasse fällt erst mit der fernen.

Quellen (Netz): esri.com/arcgis-blog (Complete Street Rule, Palladio) · sidefx.com/forum/post/307474 (Parzellen OBB/
Straight Skeleton) · dev.epicgames.com City Sample Houdini/PCG · 80.lv Matrix-Awakens-Breakdown · arXiv 2412.09545,
2503.12052, 2303.17368 · research.dreamworks.com (Shrek-2-Lagen).
