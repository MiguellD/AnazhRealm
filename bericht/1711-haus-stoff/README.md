# w28-haus-stoff — Zielbild und Mängel-Liste vor dem Schnitt

OMEN GTX 1060, 17.11. 23:25. Status ZWISCHENSTAND: noch kein Schnitt, kein Zweig. Bilder von main 08a8397b
(Stand 18.546.327; der Schnitt setzt auf d3ddb51c auf, dort schieße ich das Vorher an denselben Kameras neu).

## Die Bilder

| Bild | was |
| --- | --- |
| `welt-tag-nah.jpg` · `welt-tag-fern.jpg` · `welt-nacht-nah.jpg` · `welt-nacht-fern.jpg` | die Welt am Messort `dorf`, `/bild --wahl 0`, 1920×1080, Uhr 0,5 und 0,0 |
| `labor-griechisch-mittag.png` · `labor-griechisch-nacht.png` | dasselbe Haus (Kultur des Dorfs) im Labor `worlds/fachwerk` |
| `labor-alemannisch-mittag.png` | ein Fachwerk-Haus im Labor (das Haus aus deinem Auftrag) |
| `blatt-labor-1.jpg` · `blatt-labor-2.jpg` | alle 32 Kulturen im Labor, Mittag |
| `blatt-welt-1.jpg` … `blatt-welt-4.jpg` | alle 32 Kulturen im Stoff der WELT (`diag-blick --werk`, links Stufe 0, rechts Stufe 2) |
| `kameras.json` · `zensus.json` | die zwei festen Kameras; Gruppen, Stoffe, Programme, Speicher |

Kameras (für das Nachher dieselben): nah `[-704.22, 39.69, -880.02] → [-703.03, 39.69, -874.96]` (die Kamera des Spiels am
Messort), fern `[-720.25, 57.69, -948.16]` auf denselben Punkt (70 m zurück, 18 m höher).

Drei Dinge vorab, die dein Auftrag anders annimmt:

1. Das Dorf am Messort ist **griechisch** (14 Häuser `f:griechisch`, 2 `f:roemisch`), nicht das ocker-braune Fachwerk: weiße
   Putz-Kästen mit blauem oder orangem Dach. Das Fachwerk zeige ich deshalb über `diag-blick --werk` (Blätter `blatt-welt-*`).
2. Das Labor hat keinen Modus „auf Weltgrund": `worlds/fachwerk` zeichnet mit eigenem r128-Renderer und eigenem Licht
   (Fill · Rim). „Daneben" heißt hier: Labor-Bild neben Welt-Bild, zwei Lichter. Der Mittel-Ton stimmt trotzdem
   (Albedo-Tafel Labor Y 0,149 ↔ Welt 0,159, `spec/farbe/albedo-tafel.json:690`) — es fehlt das MUSTER, nicht die Farbe.
3. Das nahe Haus im Bild steht in **Stufe 1** (ab 12 m), nicht in Stufe 0: der Zensus kennt am Messort kein griechisches Haus
   in Stufe 0. Stufe 1 ist die Stufe, in der ein Spieler das Dorf durchgehend sieht.

## Teil 1 — das Labor trägt es, die Welt liest es nicht (das ist der Schnitt)

### Am Bild

| # | Mangel | Labor | Welt |
| --- | --- | --- | --- |
| 1 | **Dachdeckung** | Reihen im Halbversatz, Schattenfuge je Reihe, Ton je Ziegel (`labor-griechisch-*`: das blaue Dach ist gedeckt) | eine glatte Fläche in EINEM Ton, nah wie fern (`welt-tag-fern`: blaue und orange Pappen) |
| 2 | **Putz** | Kellenwurf: Korn und waagrechte Züge | ein Weiß ohne Korn; vierzehn Häuser im selben Weiß |
| 3 | **Sockel** | heller Quader-Verband mit Fuge und Bruchton je Stein | ein dunkelbraunes Band ohne Fuge (`welt-tag-nah` unten) |
| 4 | **Mauerwerk** (Backstein, Gefach) | Läuferverband mit Mörtelfuge, Brandton je Stein | Stufe 0: Stein für Stein gebaut, aber Balken und Gefach fast ein Ton; ab Stufe 1 EINE Fläche im Fugen-Mittel; ab Stufe 2 der ganze Körper EIN Braun (`blatt-welt-1`: alemannisch, fraenkisch, niedersaechsisch rechts) |
| 5 | **Balken-Kontrast** | dunkles Holz auf hellem, gemustertem Gefach | Stufe 0 schwach lesbar, Stufe 2 fort — das Fachwerk-Haus ist ab 26 m ein brauner Kasten mit rotem Dach |
| 6 | **Schatten unter der Traufe** | auch im Labor schwach (kleiner Überstand) — kein reiner Konsum-Mangel | die Wand ist bis unter die Sparren gleich hell; die AO der Ecke trägt auf der großen Wand-Fläche nichts (kein Vertex dazwischen) |
| 7 | **Fenster** | Glas mit Durchsicht 0,42, das Innen ist zu sehen, braune Läden | dunkelblaue, geschlossene Scheiben; nachts volle helle Rechtecke ohne Innen, fern dieselben |
| 8 | **Rauheit je Stoff** | Holz 0,88 · Gefach 0,97 · Stein 0,96 · Ziegel 0,82 · Putz 0,94 | Stufe 1: Dach, Sockel und Holz zeichnen mit der Rauheit des Putzes (unten, Konsum) |
| 9 | **Nacht** | Lichtschein aus dem Fenster auf Boden und Laibung | die Laterne färbt die ganze Wand in einem Ton, die Wand bleibt ohne Korn |

### Der Konsum (gemessen am Code von main d3ddb51c und am Zensus)

**Die Welt liest:** die Farbe je Ecke (`_colFor` fachwerk-core.js:2086 — Kultur-Ton; `_baseFor` :2099 — das Fugen-Mittel
einer Fläche; `AO_KNIE` :2080; `NOISEAMP` :2082), Rauheit · Metall · Seite · Deckkraft · Emissiv (foundry-bruecke.js:670–720),
die Seh-Klasse, den Zeitplan der Fenster (`licht`), die Glut (`leucht`), die Gestalt je Stufe.

**Die Welt liest nicht:**

- **die vier Muster-Karten** — `texZiegelwand` (fachwerk-core.js:1809: Läuferverband 24 × 7,1 cm, Fuge 1,1 cm, Halbversatz,
  Brandton 0,84–1,14), `texDach` (:1821: Biberschwanz 0,32 × 0,18 m, Halbversatz, Schattenfuge 27 %, Ton 0,82–1,14),
  `texPutz` (:1833: 5200 Sprenkel 0,86–1,06, Kellenzüge alle 9–15 px), `texStein` (:1842: Quader 46 × 28 cm, Fuge 1,6 cm,
  Bruchton 0,88–1,12). Sie entstehen nur mit `document` (im Faden `null`), und die Brücke trägt kein Feld für sie — nur
  `hasNormalMap` (foundry-bruecke.js:677). Träger im Labor: `stein`, `ziegel`, `ziegel2`, `backstein`, `putz` (:1927–1940).
- **den Namen der Rolle** — jedes Haus-Teil reist als `kind: "unknown"` (foundry-bruecke.js:612–623); der Wirt baut dafür
  den Stoff „Farbe der Ecke" (stamm/studio-stoff.js:594–598) und weiß nicht, ob er Dach, Putz oder Stein zeichnet.
- **die Lage in der Fläche** — das Welt-UV des Bakes (fachwerk-core.js:3256, :5757) reist in der Lieferung
  (foundry-bruecke.js:737–749), der Bau-Satz legt es ab: `BAU_SATZ_ATTR` trägt kein `uv` (stamm/siedlung-satz.js:1568–1577).
- **die Rauheit je Rolle ab Stufe 1** — die Faltung auf die Zeichen-Linie (Haus L0 12 · L1 4 · L2 4 · L3 1,
  fachwerk-core.js:100–103) legt alle Rollen der Seh-Klasse „stoff" in die größte Gruppe und gibt ihnen deren Stoff
  (phyto-core.js:6294 `mat: ziel.mat`). Zensus `f:griechisch L1`: 4 Stoffe je Haus — 0,94 (Putz, darin Dach und Sockel) ·
  Glas 0,15 · Metall 0,5 · Schlaf-Glas 0,25. In Stufe 2 stehen Stein 0,96 · Ziegel 0,82 · Putz 0,94 · Glas wieder einzeln.
- **das Gefach ab Stufe 2** — `DESTNUR` `gefache:false` (:2058), der Körper im gemessenen Wand-Ton (`wandTonAus` :2239,
  :3325). Das ist heute Gesetz der Stufe, kein Fehler der Brücke — am Bild aber der größte Verlust des Fachwerks.

**Vorher-Zeile (Zensus, Messort dorf, 08a8397b):** 132 Gruppen · Haus-Stoffe geteilt über alle Häuser (7 Stoffe für 16 Häuser:
Putz · Stein · Ziegel · Glas · Schlaf-Glas · Metall · Dunkel) · 135 Programme · Speicher 146,2 MB (Texturen 91,6 MB ·
Attribute 38,1 MB · Programme 3,5 MB). Frame p95 und GPU ms an der Pose messe ich am Basis-Kopf d3ddb51c im selben Boot wie das
Nachher.

### Wo der Schnitt sitzt (Vorhaben, der Spike prüft es zuerst)

Der Wirt hat das Muster schon einmal als FUNKTION aus dem Gesetzbuch: der Stein-Rahmen der Tore reist als `mat.stein`
(foundry-bruecke.js:698), der Wirt liest `porta:STEIN_GESETZ` (stamm/studio-stoff.js:585–593) und webt Fuge, Fase und Bruchton
im EINEN Kamm `_steinStoff` (stamm/stoff-material.js:2701) — mit der Fern-Regel am Schirm (unter 2–3,5 Pixeln je Stein geht das
Raster in seinen Anteil, der Mittel-Ton bleibt). Das Haus bekommt denselben Weg:

1. **Kern:** eine Tafel der Verbände im Fachwerk-Gesetzbuch (additiv) mit den Zahlen, die heute als Literale in den vier
   `tex*`-Malern stehen; die Maler lesen sie (ein Gesetz, zwei Leser — Lehre 7).
2. **Lieferung:** der Bake stempelt je Ecke die Zeile ihres Verbands (er kennt die Rolle); so überlebt sie die Faltung der Stufe 1.
3. **Wirt:** der EINE Satz-Stoff der Häuser webt den Verband über `_steinStoff`, die Lage aus Ort und Normale der Ecke (Reihe
   längs der Fall-Linie, Stein quer dazu — Wand und Dach eine Formel). Keine Karte, kein `uv`, kein Sack je Haus: die Zeile
   reist im freien vierten Byte von `aRegler` (snorm8x4, stamm/siedlung-satz.js:1575) — 0 Byte je Ecke mehr, 0 Texturen.
4. Das Fachwerk ab Stufe 2 (Balken als Funktion in der Wand statt eines Brauns) nehme ich in denselben Kopf, wenn der Spike
   den Preis hält; sonst bleibt es als benannter Rest stehen.

Offen an der Basis, bevor ich es behaupte: die neue Zahl je Ecke ändert die Lieferung der Häuser — ob ein Golden-Satz sie
trägt, zeigt der Tor-Satz; ein Re-Mint wäre ein Vertrags-Akt und käme mit Byte-Beweis für alles andere.

## Teil 2 — was auch das Labor noch nicht ist (benannt, NICHT geschnitten — die Breite setzt der Schöpfer)

Quelle: mein Blick auf die 32 Labor-Bilder (`blatt-labor-*`) und die Tafeln des Kerns. Kein vollständiges Audit.

| # | am Bild | welches Gesetz im Kern fehlt |
| --- | --- | --- |
| 1 | **Zehn Kulturen sind derselbe weiße Kasten** — griechisch, römisch, italienisch, spanisch, provenzalisch, andalusisch, französisch, georgian, renaissance, gotisch unterscheiden sich in Dachfarbe, Neigung und Breite. | Ein Tektonik-Gesetz: wie eine Bauweise Last abträgt (Säule und Balken, Bogen, Gewölbe, Blockbau, Skelett) — heute tauscht `STILMODE` nur Rollen-Stoffe über EINEM Fachwerk-Gerüst (fachwerk-core.js:180–187, 6 Zeilen). |
| 2 | **Griechisch und römisch ohne Säule, Gebälk, Giebelfeld, Hof.** | Das Gesetz der Ordnung: Säule, Kapitell, Gebälk in ihren Verhältnissen (Modul = unterer Säulen-Durchmesser). |
| 3 | **Gotisch ohne Spitzbogen-Wand, Strebewerk, Maßwerk; barock ist ein Kasten mit Zwiebel; renaissance ohne Achse und Gesims.** | Das Fassaden-Gesetz: Achsen, Geschoss-Teilung, Gesims, Pilaster — die Wand als gegliederte Ordnung statt als Fläche mit Löchern. |
| 4 | **Chinesisch und japanisch: ein Kasten bzw. Fachwerk unter geschwungenem Dach** — kein Konsolen-Werk, keine Veranda, keine Schiebewand, kein Hof. | Das Gesetz des Skelett-Baus mit tragendem Dach (Stütze trägt Dach, die Wand ist Füllung) samt seinem Hof-Grundriss. |
| 5 | **Russisch, norwegisch, Holzhütte: Fachwerk in Holzfarbe** — kein Blockbau mit Eck-Verkämmung, kein Stabbau, kein Umgang. | Das Blockbau-Gesetz: liegende Stämme, Verkämmung der Ecke, Setzung — der Kern kennt nur das stehende Gerüst. |
| 6 | **Es gibt EINEN Bau-Typ.** Jedes Rezept ist `kind "haus"` (fachwerk-core.js:5245), dazu Marken (Turm, Kuppel, Hochhaus) und Ausstattung (Feuerstelle, Marktstand, Brunnen, Laterne, Grabstein). Keine Kirche, kein Tempel, kein Rathaus, keine Scheune, keine Mühle, keine Schmiede, kein Wirtshaus, kein Wehrbau. | Ein Nutzungs-Gesetz: der Bau folgt aus dem, was in ihm geschieht (Raumprogramm → Grundriss → Körper → Öffnung). |
| 7 | **Jeder Grundriss ist ein Rechteck** (Breite × Tiefe, dazu Bogen, Versatz, Doppelhaus); nur marokkanisch trägt einen Anbau, viktorianisch eine Veranda. | Eine Grundriss-Grammatik: Flügel, Hof, Laube, Erker, Anbau als Regeln über Räumen — L, T, U, Atrium. |
| 8 | **Die Zeit wählt nur den Namen der Kultur** (`REGION_HIST` 6 Regionen, `EPOCHEN` 9 Zeilen, :3357–3382): ein Haus von 1320 und eines von 1860 unterscheiden sich im Rezept, nicht in Technik und Alter. | Ein Zeit-Gesetz in zwei Teilen: das Jahr wählt Werkzeug und Technik (Glas-Größe, Spannweite, Ziegel-Format), das ALTER schreibt Patina, Setzung, Flickwerk und Umbau in denselben Bau. |
| 9 | **Jedes Dach ist dieselbe Deckung in zwei Tönen** — ein Biberschwanz-Maler für alle (`texDach`, :1821); Schiefer, Mönch-Nonne, Schindel, Reet, Grassode, Blech sind Farben, keine Deckungen. | Ein Deckungs-Gesetz: je Art Deckmaß, Überdeckung, Grenz-Neigung, First und Ortgang. |
| 10 | **Jede Mauer ist ein Läuferverband, jeder Stein ein Quader, jeder Putz ein Kellenwurf** (`texZiegelwand`, `texStein`, `texPutz`). | Die Tafel der Verbände und Oberflächen: Block-, Kreuz-, gotischer Verband, Bruchstein, Bossen, Glatt-, Kratz-, Kalkputz. |
| 11 | **Das Fenster ist überall dasselbe Loch mit Rahmen** — keine Gewände, kein Sturz oder Bogen nach Bauweise, keine Bank, Sprossen und Läden kaum nach Kultur. | Das Gesetz der Öffnung: der Sturz trägt, das Gewände fasst, die Bank leitet Wasser — Form aus Spannweite und Stoff. |
| 12 | **Kein Wasser am Bau** — keine Rinne, kein Fallrohr, kein Spritz-Sockel, kein Dachüberstand nach Klima. | Ein Wasser-Gesetz des Baus: Traufe, Überstand und Sockel-Höhe aus Regen und Schnee des Orts (der Regler „Klima" existiert, er formt sie nicht sichtbar). |
| 13 | **Kein Schmuck** — keine Schnitzerei, Malerei, Fliese, kein Stuck, kein Zeichen des Gewerbes. | Ein Ornament-Gesetz: wo eine Kultur schmückt (Kopf des Balkens, Sturz, Giebel, Portal) und womit. |
| 14 | **Der Stoff kommt aus dem Rezept, nicht vom Ort** — das Haus im Kalk-Gebirge und das im Wald tragen dieselben Töne. | Das Orts-Stoff-Gesetz: Stein, Lehm und Holzart des Baus aus dem Gelände-Kern und dem Wald seiner Lage. |
| 15 | **Vierzehn gleiche Häuser im Dorf** (`welt-tag-fern`): gleiche Größe, gleiches Weiß, zwei Dachfarben; kein Rang, kein Gewerbe, kein Anbau. | Ein Haushalt-Gesetz: Größe, Rang und Gewerbe des Haushalts formen sein Haus (die Regler „Personen" und „Wohlstand" stehen im Labor, das Dorf zeigt ihre Spanne nicht). |
| 16 | **Kein Dazwischen** — Zaun, Mauer, Garten, Hof, Stapel, Karren fehlen am Haus; es steht auf einem dunklen Band im Gelände. | Das Grundstücks-Gesetz (Ort-Domäne, nur als Grenze benannt): was zwischen Haus und Weg gehört. |

## Zeit-Zeile dieses Bildpaars (die schuldige)

Wartezeit am Schloss 6,7 min (der Landungs-Dienst maß main) · Server-Start bis „Werkbank bereit" 8 s · Boot bis zum ersten
Weltbild und Ruhe am Messort 49 s · vier Schüsse 3,2 · 14,4 · 8,5 · 6,1 s · Vergleich (mein Blick) ohne Maschine · ganz 91 s.
Labor: 32 Kulturen in rund 2,4 min. Welt-Stoff je Kultur: 7–8 s je Bild, 63 von 64 (russisch Stufe 2 stürzt ab: „DIE BÜHNE: der
Bootstrap der Welt lädt nicht", `diag-blick.cjs` — nicht untersucht).

Der Tag-Fern-Schuss meldet ABNAHME ROT („Blickziel verdeckt von bauSatz in 75 m"): die Kamera schaut über das Dorf auf den
Messpunkt hinter einem Haus — das Bild selbst ist gültig, das Urteil gilt der Ziel-Probe der Station, nicht dem Stoff.

Werkzeug: `p3/n1711/hs/ziel.cjs` (`ZIEL_KAMERA=…/kameras.json` hält die Pose), `labor.cjs`, `werk.sh`, `blatt.cjs`.
Roh: `p3/n1711/hs/ziel-main2`, `labor-alle`, `labor-nacht`, `werk-main` (OMEN).

## Die Stadt vorher (Messort `stadt-voll`, main d3ddb51c, GTX 1060, Mittag) — 18.11. 00:02

Bilder: `stadt-vorher-gasse.jpg` (die Kamera des Spiels am Messort, der Markt) · `stadt-vorher-fern.jpg` (über die Dächer auf die
Mitte des Plans, 600 m zurück, 300 m hoch: der Rand der Stadt steht im Bild) · Kameras `stadt-kameras.json` (dieselben nachher).

**Zeile:** Häuser im Plan 326 (309 + 17 in zwei Siedlungen, Radius 401 m) · Häuser mit Bild 326 (am Markt 192 im Satz, der Rest als
Fernform) · Leiber 1 211 (1 097 draußen) · Frame p95 33,31 ms (p50 16,68 · p99 41,67 · 52,7 fps).

Preis vorher an der Pose: GPU 11,8 ms je Frame (gpu-bank; Band 12,4) · CPU-Takt p95 28,73 ms (p50 16) — die Stadt ist am
Prozessor gebunden, nicht an der Karte · VRAM 176 MB (Band 118: ROT/ÜBER) · 345 Befehle · 524 433 Dreiecke · Programme 86 Vertex /
89 Fragment · Speicher des Renderers 172,4 MB (Texturen 92,1 · Attribute 66,9) · 1 149 Bau-Gruppen.

Der Plan des Messorts trägt an diesem Kopf 326 Häuser, nicht 1 641 (Titel der Station: 295 Häuser / 1 092 Bewohner). Der
Fern-Schuss meldet ABNAHME ROT („Blickziel verdeckt von kamm-krone in 640 m") — das Urteil gilt der Ziel-Probe, das Bild ist gültig.
Im Fern-Schuss stehen 0 Leiber (die Bewohner-Liste ist 600 m vom Ort leer). Roh: `p3/n1711/hs/stadt-vor-d3ddb51c` (OMEN).

## Erstes Bildpaar: d3ddb51c ↔ Kopf 273c3f862 (WIP, Dorf, dieselben Kameras) — 18.11. 00:10

`paar1-tag-nah.jpg` · `paar1-tag-nah-sockel.jpg` (Ausschnitt) · `paar1-tag-fern-dach.jpg` (Ausschnitt ×1,5) · `paar1-nacht-nah.jpg` ·
`paar1-nacht-fern.jpg` — links vorher, rechts der Kopf. ZWISCHENSTAND, keine Abgabe.

Was der Kopf zeichnet: der Sockel trägt den Quaderverband (Tag und Nacht), das Dach nah seine Reihen, fern geht es je Achse in
den Mittel-Ton (die Fern-Regel des Kamms am Schirm). Der Putz trägt die Kellenzüge — in diesem Stand als REGELMÄSSIGES Raster
(9,4 cm): die Wand liest sich als Schalung. Das Labor setzt sie unruhig (9 … 15 Pixel); das heile ich als Nächstes.

Preis an der Pose (Band, vor dem Lauf): GPU 14,90 → 14,94 ms je Frame (gpu-bank 14,78 → 15,26) · VRAM 128,2 → 128,7 MB ·
Puffer bauSatz 5,84 → 5,76 MB (die Zeile reist im freien Byte: 0 Byte je Ecke) · Programme 85/91 → 87/94 · Befehle 132 ↔ 132.
Frame p95 am Kopf 25,14 ms (p50 16,68; vorher am Dorf noch ohne Lauf-Messung — das Paar im selben Boot folgt).
Sonde im Satz (die vierte Stelle von `aRegler` je Ecke): Zeile 2 Deckung 7 170 Ecken · Zeile 3 Putz 40 958 · Zeile 4 Naturstein
14 828 · ohne Verband 71 294.

**a. Die Quelle des Sockel-Brauns ist die Tonkurve, nicht die Farbe:** im Puffer steht der Sockel grau (linear 0,215/0,198/0,161,
sRGB #7f7a6f; Putz 0,825/0,807/0,758). Im Schatten der Giebelseite liegt die Wand vor der Tonkurve bei 0,100/0,104/0,111, der
Sockel bei 0,026/0,026/0,023 — unter dem Knie von Khronos PBR Neutral (0,08), wo die Kurve den gemeinsamen Grau-Anteil abzieht
(Versatz x − 6,25 x²): aus 26 % der Wand werden 6 %, und die Differenz der Kanäle bleibt stehen — Rechnung 20/18/11, gemessen
23/16/11 (Wand 71/73/77). Nicht die Faltung auf den Putz-Stoff, nicht AO (die Häuser lesen die Kontakt-Verdeckung nicht).
Heilen hieße die Tonkurve der Welt anfassen (Licht-Kette, jede Ratsche am Bild) — das schneide ich nicht ohne dein Wort.

**c. Das römische Haus fern ist ein Deckel nach dem Gesetz, kein Hof:** Haus 208 ist die „kirche" des Plans mit `arkade: 1`
(studioOv, seed 252174); `arkade` stellt das Dach auf flach (fachwerk-core.js:207, ROOFMODE). Nachgebaut ohne Welt (Stufe 2):
Flachdach in Naturstein x ±7,5 · z ±5,5 · y 3,2 … 5,8 m, darum das Pultdach der Arkade in Ziegel (x ±9,7, y 3,1 … 3,2 m).

## Zweites Bildpaar: d3ddb51c ↔ Kopf 41dd9e32b (WIP, Dorf, dieselben Kameras, selbes Boot) — 18.11. 01:48

Links vorher, rechts der Kopf: `paar2-tag-nah.jpg` · `paar2-putz.jpg` (Ausschnitt ×2,6) · `paar2-tag-fern.jpg` ·
`paar2-tag-fern-dach.jpg` (Ausschnitt ×1,9) · `paar2-nacht-nah.jpg` · `paar2-nacht-fern.jpg` · `paar2-fachwerk-26m.jpg` ·
`paar2-fachwerk-40m.jpg` (das alemannische Haus der Siedlung 200 m nördlich, −657/−668: am Messort steht kein Fachwerk) ·
`schwenk2-vor.jpg` / `schwenk2-nach.jpg` (die ferne Kamera in fünf Schritten zu 0,3°, Ausschnitt der vorderen Dächer).
ZWISCHENSTAND, keine Abgabe.

Neu gegen Runde 1:

- **Putz:** die Züge stehen unruhig (Feld `unruhe` der Zeile: zwei Wellen über die Reihe, Hub aus den Zügen des Malers, 9–15 px
  auf 64) — in Runde 1 las sich die Wand als Schalung.
- **Kreuz der Fugen** (Feld `kreuz`): an der Kreuzung zweier Fugen trug das Produkt der Achsen-Töne die Mörtel-Kreuzung 34× zu hell,
  das Holz-Kreuz wäre schwarz geworden; jetzt min − Produkt, das Mittel hält `eins`.
- **Fachwerk ab Stufe 2 als Zeile 5 der Tafel** (`VERBAND_GESETZ.fachwerk`: Feld 1,7 m · Riegel 0,85 m · Ständer 16 cm · Riegel
  13 cm; Holz und Gefach aus `_colFor`): der Bake gibt jeder Ecke von Wand und Giebel des Stils `alt` ihre Lage im Gefüge
  (`_wandLage` → `aLage`), sie reist in den vierten Stellen von Farbe und Glut (half): 0 Byte je Ecke im Satz, die Lieferung
  +24,2 kB an 5 Teilen (alemannisch · fraenkisch · niedersaechsisch · mittelalterlich · tudor, je Stufe 2, 3 096 Ecken). Byte-Beweis:
  Maler 5 × gleich, Lieferung gleich für 128 Fälle / 799 Teile / 5 065 538 Ecken bis auf Verband und Lage.
- **Wurzel des dunklen Kastens** (WIP 3bbde98f3 zeichnete das Gefüge noch nicht, obwohl die Lage richtig im Puffer lag — Sonde
  `spike-2c`): r184 teilt den Attribut-Knoten je Name, der Satz-Stoff las die Farbe zuerst dreistellig, und das WGSL füllte die
  vierte Stelle mit 1 (`vec4( color.xyz, 1.0 ).w`, `p3/n1711/hs/spike-2g/satz.vert.wgsl`): u stand an jeder Ecke auf dem Ständer, die
  Wand ganz im Ton des Balkens. Farbe und Glut liest der Satz-Stoff jetzt an EINER Stelle vierstellig (41dd9e32b).

**Preis am Dorf** (selbes Boot, derselbe Treiber, der Kopf direkt nach der Basis, kein Warten am Schloss): Frame p95 25,07 ↔ 25,08 ms
(p50 16,67 ↔ 16,66 · p99 25,19 ↔ 33,39, ein Lauf je Seite: die Spitze liegt im CPU-Takt p99 19,99 ↔ 35,05, nicht in der GPU) ·
GPU echt p95 5,27 ↔ 5,40 ms · gpu-bank 14,60 ↔ 12,06 ms je Frame · CPU-Takt p95 12,91 ↔ 13,10 ms · Band VRAM 128,6 ↔ 124,3 MB,
Befehle 132 ↔ 131, Dreiecke 397 302 ↔ 392 770. **Zensus:** Programme 188 ↔ 193 (dieselbe Basis gab in zwei Läufen 176 und 188 —
in der Streuung) · Programm-Speicher 5,09 ↔ 5,24 MB · Renderer gesamt 135,3 ↔ 133,1 MB · Texturen 52 ↔ 52 (91,6 MB gleich: keine
Karte, kein Sack je Haus). Roh `p3/n1711/hs/end-vor`, `end-nach` (OMEN).

**Schwenk:** die Sprünge im selben Fenster sind vorher ↔ nachher gleich (Luma 4,78 ↔ 4,82 auf dem blauen Dach, 4,20 ↔ 4,16 auf
dem roten — sie kommen von Kanten, die durchs Fenster wandern); im Innern des blauen Dachs bleibt σ ≤ 0,41 in beiden Fassungen
(Bilder 0–2): das Schiefer-Raster steht dort im Mittel-Ton, kein Moiré. Das rote Dach davor trägt seine Reihen (σ 0,44 ↔ 2,42).
Werkzeug `p3/n1711/hs/flimmer.cjs`.

**Nacht nah:** der Sockel liest sich im Verband, die Putz-Züge schwach; Fenster-Innen und Lichtschein unberührt (GTX 1050).

**Offen, benannt:** die Streben des fernen Fachwerks · das Raster folgt der Tafel (Feld 1,7 m, Riegel 0,85 m), nicht der
Balken-Lage der Stufe 0/1 — am Wechsel Stufe 1 → 2 springt es (nicht gemessen) · EIN Verhältnis Holz/Gefach für alle Kulturen
(niedersächsisch steht fast schwarz) · das Korn des Putzes (0,8–1,6 cm) nicht gewebt · die fernen Fensterrahmen und
Scheiben-Gründe tragen die Putz-Zeile (sie leihen `M.putz` mit Faktor; fern unter dem Raster, Mittel 1 — kein Fehler am Bild) ·
Teile außerhalb des Satzes lesen die Lage der Welt · Flachdächer nehmen die Achsen der Welt · die Hülle der Stufe 3 flach.

**Absenz der Literale (die zweite Quelle):** `p3/n1711/hs/absenz.cjs` zählt jede Zahl im Rumpf der vier Maler ohne Kommentare und
lässt nur Leinwand (256), Farb-Byte (255) und die Ziehung (Hash-Konstanten) zu — an d3ddb51c ROT in allen vier (`texZiegelwand`
0.24 0.071 0.011 0.84 0.3 · `texDach` 0.32 0.18 0.82 · `texPutz` 5200 0.86 0.20 252 9 7 · `texStein` 0.46 0.28 0.016 …), am Kopf
LEER in allen vier: Maß, Fuge, Versatz und Ton liest der Maler aus `VERBAND_GESETZ`.

### stadt-voll — ABBA im selben Boot (Basis · Kopf · Kopf · Basis), dieselben zwei Kameras wie 00:02, Mittag — 18.11. 02:10

`paar2-stadt-gasse.jpg` (der Markt) · `paar2-stadt-fern.jpg` (über die Dächer, 600 m: vorher ↔ nachher gleich, alles im Mittel-Ton).

| Lauf | Frame p50 | p95 | p99 | CPU-Takt p95 | GPU echt p95 | gpu-bank | VRAM | Programme |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Basis 1 | 16,66 | 25,06 | 33,43 | 23,51 | 3,10 | 11,98 | 174,8 | 194 |
| Kopf 1 | 16,66 | 32,90 | 41,68 | 26,34 | 3,06 | 12,11 | 174,8 | 210 |
| Kopf 2 | 16,68 | 33,38 | 41,71 | 30,01 | 3,07 | 12,72 | 173,7 | 194 |
| Basis 2 | 16,63 | 25,08 | 26,95 | 17,32 | 3,24 | 11,66 | 176,4 | 199 |

(ms, MB; Basis um 00:02 in eigenem Lauf: p95 33,31 · CPU-Takt p95 28,73 · GPU 3,12 · gpu-bank 11,81 · VRAM 176 · Programme 189.)

Lesart: die GPU trägt den Kopf nicht, der Speicher auch nicht. Die Stadt ist am Prozessor gebunden und sitzt an der Vsync-Stufe
25 ↔ 33 ms; im ABBA steht der Kopf zweimal oben, die Basis zweimal unten — aber dieselbe Basis stand um 00:02 selbst oben (33,31).
Ein Boot nennt keinen Täter (Regel: nur über ≥ 2 Boots). Roh `p3/n1711/hs/stadt-end-*` (OMEN).

**Direkt nachgesehen (02:15):** im 20-s-Lauf an stadt-voll rufen die Satz-Glieder, die der Kopf verändert hat (`_satzBlock`,
`_satzBlockEcken`, `_chunkSatzLege`, `_chunkSatzMarke`), **0-mal** — am Stand entsteht kein Block, der neue Code rechnet nichts
(Programme im Lauf 209 → 212, drei neue). Die Phasen des Takts zeigen keinen Kopf-eigenen Anteil (render 9,30 · 6,89 Kopf ↔ 8,79 ·
6,78 · 5,56 Basis, creatures 2,71 · 1,70 ↔ 2,72 · 1,89 · 1,43; Befehle 228, Dreiecke 1,13 Mio., bauSatz-Puffer 39,8–40,1 MB gleich).
Ein dritter Kopf-Lauf steht auf der unteren Stufe: Frame p95 **25,13** ms, CPU-Takt p95 16,72 ms. Kopf 32,90 · 33,38 · 25,13 ↔ Basis
33,31 · 25,06 · 25,08 — beide Fassungen fallen auf beide Stufen; das ABBA-Muster war Zufall, kein Preis des Kopfs.
Roh `p3/n1711/hs/stadt-uhr-nach/uhr.json`.
