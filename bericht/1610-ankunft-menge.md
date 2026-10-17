# Bericht 1610 Ankunfts-Menge — was das erste Weltbild trägt (985a923b + streu-rang cd20288c, GTX, kalt --echt, M1–M4)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16./17.10.:
1. Die Boot-Phasen 0–6,5 s mit dem Profil des Haupt-Fadens.
2. Die Ankunfts-Menge je Anfrage: Art, Stufe, Distanz, im ersten Blick ja/nein, Werk- bzw. Bäcker-Sekunden, Summen je Klasse.
3. Welche Menge das erste ganze Weltbild tragen MUSS, ihr Preis, und warum eine Karte ~1,5 s kostet.

## Urteil

- **Weltbild kalt 20,0–21,6 s** (M1 21,59 · M2 19,99 · M3 21,28 · M4 20,61). Bis 7,1 s geht keine einzige Asset-Anfrage hinaus, weil
  erst dann das Buch kommt. Der Worker liest `get-book` 1,6 s nach seinem Skript-Start, das Blatt-Atlas-Bild kostet 1,8 s, die Fracht
  0,8 s.
- **Ab 7,1 s sind die drei Werk-Bahnen bis zum Weltbild zu 89–99 % belegt.** Das sind 127 Aufträge mit 35–42 Bahn-Sekunden. Buch +
  Bahn-s/3 ergibt 19,3–21,1 s, gemessen sind 20,0–21,6 s.
  - Die Häuser tragen davon die Hälfte (47 Aufträge, 17–23 Bahn-s).
  - Jedes Haus baut neben seiner L2 die Wurf-Stufe L3 (`nurWurf`, 96 Dreiecke). L3 kostet so viel wie eine L2 (Median 0,30–0,39 s
    gegen 0,29–0,46 s).
- **Fast die Hälfte der Menge liegt außer Blick** (33,4 von 71 Bahn-s): Das Tor wartet auf jeden Bau und Baum der Mesh-Zone und auf
  jede Karte, nicht auf das, was das erste Bild zeigt.
- **Eine Karte kostet steady 0,98 s** von Senden bis Antwort: L1-Neubau 0,37 + BC-Kodieren 0,35 + Zustellung 0,11 (Median von 60
  Karten). Die 1,4–2,4 s je Karte einer Bahn kommen aus dem ersten Lauf jedes Bäckers: 1,5–4,5 s Anlauf plus 4–6 neue Programme.

## (1) Die Phasen 0 → Weltbild und der Haupt-Faden

CPU-Profil 0,5 ms, mit den Takt-Marken auf die Seiten-Uhr gelegt. Ein Fenster reicht von der Marke bis zur nächsten. Die Spannen gelten
über M1–M4.

| Phase (Marke → nächste) | ab s | Haupt-Faden ms | idle | was ihn trägt (Selbstzeit ms) |
|---|---|---|---|---|
| Navigation → DOM interaktiv | 0 | ~100 | 24–32 % | – |
| Skripte bis zur Instanz | 0,12–0,15 | 1 120–1 240 | 6–13 % | native (Übersetzen) 300–460 · `_chatEcho` 07.js:2328 91–170 · phyto-core `grow` 106–193 · 16.js `_loadPath` 72–119 · `_holzWahl` 05b.js:538 32–147 |
| Instanz → DOM fertig | 1,25–1,38 | 580–1 100 | 0 % | zu 98–100 % native „(program)“, JS < 10 ms; das JS-Profil löst es nicht auf |
| DOM fertig → Renderer · Foundry · Spieler | 1,93–2,38 | 330–370 | 0 % | gelaende-core 89–109 · 08.js 68–75 · 11b.js 43–51 (erster Chunk und Hydrosphäre auf dem Haupt-Faden) |
| Renderer bereit → erster Chunk / Ring 0 | 2,30–2,61 | 1 310–2 120 | 0–2 % | three.webgpu 594–941 (`build`, `getDataFromNode`, `_getChildren`) · 08.js 318–537 (`_voxelExtractSurfaceVertices`, `_voxelChunkGeometry`, `_voxelHoehlenGraph`) · gelaende-core 48–141 |
| Ring 0 → Buch | 3,92–4,51 | 3 470–4 500 | 5–13 % | 11c.js 349–459 (`_fernRingKlassen`) · 16.js 283–393 (`computePartTags`, `computeCompoundTags`) · 11a.js 223–299 · fachwerk-core `_karte` 227–263 · phyto-core 191–250 · three.core 216–287 |
| Buch → Weltbild | 7,92–8,42 | 11 570–13 670 | 1–2 % | three.webgpu 1,9–2,1 s · 20c.js 1,0–1,3 s (`_ortGestaltSame` 333–520) · 15b.js 0,76–1,08 s · 20a.js 0,74–1,0 s (`_waldPlanKasten` 282–396) · 20d.js 0,60–0,77 s (`_forestDartSteht`) · 11a.js 0,63–0,78 s · GC 0,19–0,30 s |

- **Lange Aufgaben bis zum Weltbild:** 59–66, zusammen 16,3–17,0 s, davon 17–20 über 300 ms. Ab dem ersten Chunk ist der Haupt-Faden
  fast nie frei.
- **Die Buch-Marke liegt 0,6–1,0 s nach der Annahme:** Sie steht bei 7,9–8,4 s, die Annahme bei 7,1–7,4 s. Die Marke wartet auf die
  lange Aufgabe des Ingests (0,24–0,61 s).

**Die Kette bis zur ersten Anfrage** (das Buch, `foundry-bruecke.js` mit der Stations-Uhr):

| Schritt | M1 | M2 | M3 | M4 |
|---|---|---|---|---|
| Seite sendet `get-book` (s ab Navigation) | 2,31 | 2,56 | 2,43 | 2,39 |
| Worker: Skript-Start (ms ab seiner Geburt) | 451 | 521 | 412 | 541 |
| Worker liest `get-book` (ms ab seiner Geburt) | 2 137 | 2 189 | 2 064 | 2 120 |
| Buch-Daten · Welt · Render · Siedlung (ms) | 3 · 0 · 0 · 0 | 2 · 0 · 1 · 0 | 3 · 0 · 1 · 0 | 3 · 0 · 1 · 0 |
| Blatt-Atlas-Bild `bakeLeafAtlasBild` (ms) | 1 813 | 1 764 | 1 806 | 1 724 |
| Fracht `blattAtlasFracht` in der Schale (ms) | 806 | 713 | 713 | 773 |
| Haupt-Faden nimmt an (s) | 7,09 | 7,44 | 7,22 | 7,20 |

Die Nachricht wartet ~1,6 s hinter dem eigenen Skript des Workers (die Kerne laden). Danach sind fast alles Blatt-Atlas und Fracht. Bis
6,5 s baut die Foundry kein einziges Asset.

## (2) Die Ankunfts-Menge je Anfrage

Erfasst ist jeder `_foundryAuftrag` bis zum Weltbild: 147 Aufträge in jedem Lauf, alle vor dem Weltbild beantwortet; danach kommen 56.

- **Bahn-Sekunden in Antwort-Reihenfolge je Bahn:** Der Faden ist einer. Die Zeit seit der vorigen Antwort derselben Bahn (oder seit dem
  Senden) trägt die Antwort, die sie beendet. Die Bahnen sind nicht streng FIFO, weil Platten-Leser asynchron antworten.
- **Erster Blick:** ein Frustum-Test beim Weltbild (Kamera [0, 93,4, 0], fov 75, Ego-Start am Genesis-Platz). Eine Karte zählt „im
  Blick“, wenn ein Körper derselben Art und Saat im Blick steht.

| Art | Klasse | erster Blick | Aufträge | Stufen (M1) | Distanz (M1) | Arten | Bahn-s bis Weltbild (Median je Lauf) |
|---|---|---|---|---|---|---|---|
| Körper | haus | im Blick | 39 | L2 19 · L3 20 | 11–145 m | drachentor, maschine, kathedrale, gotisch, alpenchalet, schwarzwald, skandinavisch | **17,51** |
| Karte | baum | außer Blick | 10 | – | 23–105 m | weide, tanne, fichte, eiche, birke, buche | **15,47** |
| Karte | baum | im Blick | 6 | – | 21–88 m | tanne, birke, fichte, mammut | 6,03 |
| Körper | baum | außer Blick | 10 | L1 10 | 25–357 m | weide, tanne, fichte, eiche, birke, buche | 5,85 |
| Körper | leib | (am Auge) | 2 | L0 1 · L1 1 | 0 m | mensch | 5,33 |
| Karte | sonst (gt) | im Blick | 1 | – | 19 m | gt | 4,42 |
| Karte | boden-klein (strauch) | außer / im Blick | 1 | – | 32–64 m | strauch | 3,80–4,08 |
| Körper | fels | außer Blick | 18 | L0 16 · L1 1 | 16–273 m | karst, zacken, kristalle | 3,35 |
| Körper | haus | außer Blick | 8 | L1 1 · L2 3 · L3 4 | 11–19 m | alemannisch, geisttor, maurentor, ruine | 3,16 |
| Körper | fels | im Blick | 18 | L0 16 · L2 1 · L3 1 | 11–130 m | verkalkt, kristalle, zacken | 2,31 |
| Körper | baum | im Blick | 6 | L1 6 | 21–88 m | tanne, birke, fichte, mammut | 1,39 |
| Karte | fels | außer Blick | 1 | – | 67 m | karst | 0,88 |
| Körper | ausstattung | im Blick | 8 | L1 4 · L3 4 | 111–129 m | laterne, brunnen, marktstand, wandlaterne | 0,73 |
| Körper | sonst (gt) | im Blick | 1 | L1 | 19 m | gt | 0,70 |
| Körper | ausstattung | außer Blick | 4 | L1 2 · L3 2 | 52–63 m | feuerstelle | 0,51 |
| Körper | boden-klein | alle | 14 | L0–L2 | 16–64 m | gras, blume, farn, gestrüpp, totstamm | 0,26 |

**Summen** (Median je Lauf): im Blick 37,4 Bahn-s · außer Blick 33,4 · ohne Ort 0,2. Nach Faden-Art:

| | im Blick | außer Blick | zusammen |
|---|---|---|---|
| Werk (Körper) | 22,7 + Leib 5,3 | 12,9 | 35–42 je Lauf |
| Bäcker (Karten) | 14,3 | 20,4 | ~35 |

- **Die Bahnen bis zum Weltbild:**
  - werk, werk1 und werk2 je 30–55 Aufträge (zusammen 127), belegt 10,8–14,4 s von 12,1–14,5 s ab ihrem ersten Senden (7,1–7,9 s),
    also 89–99 %.
  - bäcker, bäcker1 und bäcker2 je 4–9 Karten, belegt 9,0–11,0 s von 11,2–13,8 s, also 67–90 %. Leer ist der Anlauf des ersten Laufs.
- **Häuser je Stufe** (M1–M4):
  - L2: 22 Aufträge, 8,0–11,1 Bahn-s, Median 289–463 ms je Auftrag.
  - **L3 (`nurWurf`, 96 Dreiecke): 24 Aufträge, 8,1–11,9 Bahn-s, Median 296–386 ms.**
  - L1: 1 Auftrag, 0,5–1,1 s.
  - Das Budget `haus[2].schatten = 3` in fachwerk-core.js:99 lässt die L3 im selben Zug vor der L2 reisen (`_foundryZug` … `vor`,
    stamm/20c.js:1038). Die L3 rechnet das ganze Haus-Gesetz für 96 Dreiecke.
- **Leib:** mensch L0 braucht 3,1–4,8 s auf der Haupt-Werk-Bahn (r1, die erste Anfrage nach dem Buch), L1 0,9–1,6 s. Der Term „leib“
  schließt bei 10,4–11,9 s.

## (3) Was das erste ganze Weltbild tragen MUSS

**Das Tor heute** (`_weltbildLuecken`, stamm/25c.js:2583) wartet auf welt · boden (Ring 3) · horizont · leib · buch · bauten · dorf ·
pflanzung · streu · karten.
- „bauten“ heißt: jeder Bau und Baum der Mesh-Zone R ist gezeichnet, ohne Blick.
- „karten“ heißt: die ganze Bäck-Schlange ist leer.

Zuletzt offen (Lens-Proben im 0,5-s-Raster, Median M1–M4):

| buch | boden | leib | pflanzung | dorf | horizont | karten | streu | bauten | **Weltbild** |
|---|---|---|---|---|---|---|---|---|---|
| 7,1 | 8,4 | 11,9 | 11,9 | 13,6 | 17,5 | 19,9 | 20,4 | 21,1 | **21,3** |

Am Ende halten die Bauten und die Streu das Bild, also der Durchsatz der Werk-Bahnen. Der Horizont (Fern-Ring, ein Gang auf dem
Haupt-Faden) schließt erst bei 15,1–17,5 s: Er steht von 5,6 s bis 11 s bei 11 %, solange der Haupt-Faden besetzt ist.

**Was das erste Bild liest und darum tragen muss:** Boden (Ring 3), Horizont, Leib (im Third im Bild) und die Menge im Blick:
- 39 Haus-Aufträge (19 L2 + 20 Wurf-L3),
- 6 Baum-Körper L1 und die 8 Karten der Arten im Blick (mit gt und strauch),
- 18 Felsen, 8 Ausstattungen, 1 gt-Körper.

**Ihr Preis:** Werk 22,7 + Leib 5,3 = 28 Bahn-s, Bäcker 14,3 Bahn-s. Auf 3 + 3 Bahnen sind das ~9,3 s Werk nach dem Buch, also ein
Weltbild bei ≈ 16,4 s, solange Buch, Haus-L3 und Haupt-Faden bleiben, wie sie sind.

**Nicht im ersten Bild:** 8 Häuser, 10 Baum-Körper, 10 Karten, 18 Felsen und 4 Ausstattungen außer Blick, zusammen 33,4 Bahn-s (47 %).

**Die Hebel in der Menge im Blick, nach Größe** (benannt, nicht geschnitten):
1. **Die Wurf-L3 jedes Hauses:** 24 × ~0,35 s ≈ 8–12 Bahn-s, davon ~7 im Blick. Für 96 Dreiecke läuft das ganze Haus-Gesetz ein zweites
   Mal. Im selben Werk-Lauf wie die L2 gebaut, kostete sie nahe null.
2. **Die Kette vor 7,1 s:** Worker-Skript 1,6 + Blatt-Atlas 1,8 + Fracht 0,8 ≈ 4,2 s, und kein Teil davon ist ein Asset des ersten Bilds.
3. **Die Karte:**
   - Der L1-Neubau im Bäcker (0,37 s, `buildInstance(sp, seed, 1)`) baut dieselbe L1 noch einmal, die das Werk für den Körper baut.
   - Das BC-Kodieren in der Schale kostet 0,35 s.
4. **Der Haupt-Faden:** 16,3–17 s lange Aufgaben vor dem Bild. Der Horizont wartet auf ihn bis 15–17,5 s.

**Warum eine Karte ~1,5 s kostet** (76 Karten, Weg im Bäcker mit der Stations-Uhr; Start = t0 des Bäckers plus Versatz der Bahn):

| | Anlauf (gesendet → Start) | L1-Neubau | 8 Ansichten × 2 Pässe | Rest (Dilatation, Rücklesen) | BC-Kodieren (Schale) | Zustellung | gesendet → Antwort |
|---|---|---|---|---|---|---|---|
| steady (60 Karten, Median) | 0,04 s | 0,37 s (0,10–1,53; eiche bis 1,53) | 0,007 s | 0,013 s | 0,35 s (0,12–0,65) | 0,11 s (bis 0,61) | **0,98 s** (0,40–2,52) |
| erste Karte je Bäcker (12) | 1,5–2,3 s (M4 zweimal 4,5 s) | 0,07–0,31 s | 0,12–1,10 s mit 4–6 neuen Programmen | 0,03–0,27 s | 0,47–1,13 s | 0,03–0,59 s | **2,8–6,0 s** |

- **Eine Karte ist je Bahn im Flug:** Die nächste wird 0,04–0,3 s nach der Antwort gesendet. 19 Karten auf 3 Bahnen sind 4–9 je Bahn,
  die Spanne einer Bahn beträgt 11,2–13,8 s, also 1,4–2,4 s je Karte.
- **Die ~1,5 s sind damit das Mittel einer Bahn:**
  - Der erste Lauf je Bäcker zahlt Anlauf und neue Programme.
  - Jede Antwort wartet auf den besetzten Haupt-Faden.
  - Die Karte selbst arbeitet steady ~0,75 s im Bäcker. Davon ist die Hälfte der L1-Neubau, knapp die Hälfte das BC-Kodieren.
  - Die 16 Ansicht-Pässe kosten 7 ms.

## Methode

- **Stand:** abab-am = 985a923b + streu-rang (cd20288c) + Stationslinse v2. Die Bäcker- und Buch-Uhr sitzt in `foundry-bruecke.js` und
  in der Schale `stamm/20a.js`. Sie ist nur für die Station, nicht für main (`stationslinse-abab-am.diff`).
- **Linse:**
  - `diag-boot-stage --kalt --echt --sek 180`, CPU-Profil 0,5 ms mit Takt-Marken (häufigster Versatz ± 3 ms).
  - Die Probe `menge-probe.js` erfasst je `_foundryAuftrag` Ort und Distanz, macht beim Weltbild den Frustum-Test, setzt alle 20 ms eine
    Phasen-Marke, hüllt `_foundryAntwort` für die Bäcker-Uhr ein und hält Buch-Anfrage und -Annahme fest.
- **Ablauf:** GPU-Schloss je Boot, M1–M4 hintereinander 04:22–04:25. Die Linse endet mit exit 1 (Weltbild > 5 s, die Pflicht B); die
  Messung gilt.
- **Leib:** Der Frustum-Test sieht den Leib am Auge (0 m) nicht. Im Third steht er im Bild.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten liegen in `bericht/1610-ankunft-menge/`:
  - `M1–M4.json` und `.txt`, `analyse-M1-M4.txt` (alle Tafeln je Lauf, jede Karte mit ihrem Weg),
  - die Skripte `menge-probe.js`, `menge-analyse.cjs`, `diag-boot-stage.menge.cjs`, `serie.sh` und den Stations-Diff.
  - Die CPU-Profile (je ~7 MB) liegen auf dem OMEN in `p3/k1610am/`.
- **Offen:** B (Ankunft ≤ 5 s kalt). Die Zahlen nennen vier Hebel: Wurf-L3, Buch-Kette, Karte, Haupt-Faden. Welche Menge das Tor hält,
  entscheidet der Koordinator.
