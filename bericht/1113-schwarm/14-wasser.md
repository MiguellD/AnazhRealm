# 14 Wasser: Bach, See, Ufer, Unterwasser — zwei Optiken eines Wassers

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- See, Ego-Pose der Station gelaende.K3 (Radeon, b3f9ae95): `PM/punkte/gegenlauf/roh/b3f9ae95-radeon/gelaende.K3_1-werk/wasser.png`.
  Links hinter hohem Gras ein schmaler Streifen See mit dunkler, glatter Spiegelung der Baumkronen, am fernen Ufer ein heller
  Sandsaum. Unter der Fläche ist kein Grund zu sehen, auch nah am Ufer nicht. Das Wasser deckt grob ein Zehntel des Bilds.
- Dorf der Ankunft: `BILD/dorf-main-0.5.png`. Kein Wasser im Bild, kein Bach, kein Brunnen.
- Hügel von oben: `BILD/wiese-mitte/oben-heute-huegel.png`. Oben links liegt eine dunkle, grau-grüne, gesprenkelte Fläche.
  Ob das Wasser ist, kann ich nicht sicher sagen. Falls ja, ist es undurchsichtig und dunkel.
- Bach von oben und Unterwasser: kein Bild gesehen. Die Bilder in `KO/probe-post/w28-wasser-sicht/*-wasser-bild-*.png` sind
  Linsen-Bühnen (schwarzer Grund, ein Bogen-Streifen), kein Spielbild.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
**Das Gesetzbuch kann:**
- `foundry-core.js:172`: `WASSER_GESETZ.koerper` trägt je Art die Optik pro Meter, kd (Abfall des Lichts) und c (Strahl-Schwächung).
  - see: kd 0,45/0,15/0,3, c 0,55/0,25/0,35
  - bach: kd 0,4/0,1/0,19, c 0,45/0,2/0,3
  - fluss: kd 2,0/1,3/1,7, c 4,0/3,5/3,8
  - Quellen: Pope & Fry 1997, Davies-Colley & Smith 2001.
- `foundry-core.js:163-164` sagt selbst: „wK oben ist eine Look-Zahl über der NORMIERTEN Tiefe depth01 des Studio-Spiegels,
  keine Absorption je Meter.“ Gemeint ist wK = 6,5/2,0/1,2 (`:146`).
- `gelaende-core.js:760` `gewaesserArt(breiteM)` ist die EINE Quelle der Art (Bach unter 100 km² ≈ 27,8 m Breite).
  `stamm/wasser-hydro.js:590` `_wasserArtAt` ist ihr einziger Welt-Leser.

**Die Welt konsumiert:**
- **Unter Wasser richtig.** `stamm/bild-himmel.js:2414` liest `koerper[_wasserArtAt]` (kd, c). Sicht am Bach 19,56 m,
  1,118 m vor w13-bach-klar (stand.json luftwasser.K3, d3708675).
- **Von oben die Look-Zahl als Physik.**
  - `stamm/bild-sicht.js:1447`: Durchlass = exp(−wK·(wegM + aDepth)).
  - `stamm/bild-sicht.js:226` `_wasserKoerper`: R∞ = 0,33·koerperStreu/(wK + koerperStreu)/n², eine Zeile für jedes Wasser, ohne Art.
- **Was das am Bach bedeutet.** Der Grund liegt 1 m tief, der Lichtweg ist rund 2 m. Der Durchlass (Luma) ist dann:
  - heute mit wK: 0,020, der Grund ist unsichtbar
  - mit der Gesetzes-Zeile bach (c): 0,605
  - Bei 1 m Weg: 0,119 gegen 0,775.
  - Das ist das, was ich am See sehe: kein Grund am Ufer.
- **Dieselbe Look-Zahl lesen auch:**
  - der Fern-Ring: `stamm/gelaende-fern.js:1496` über `_wasserKoerper`, T = 0 (`:1481`)
  - der Feld-Pass über denselben Baustein (`stamm/gelaende-chunks.js:3365`, Kommentar)
  - das Gefäß: `stamm/bau-teile.js:2920` exp(−wK·flach)
  - die Linsen: `scripts/lib/licht-linsen.cjs:1993`, `scripts/diag-wasser-leben.cjs:996`
- **Der Fund ist benannt, aber nie geschnitten:** `KO/FUND-REGISTER.md:76` (06.11., „zwei Optiken eines Wassers (Gebot 4) · L“),
  dazu `:21` (w12-unterwasser) und der Rumpf von 2d04d714b (w13-bach-klar).
- **Was sonst schon aus dem Gesetz kommt:**
  - Fresnel aus n(λ) der Stoff-Zeile (`stamm/wasser-hydro.js:782-790`)
  - Spiegel-Pass statt Panorama (`:795-820`)
  - Sonnen-Sicht (`:769`)
  - Weißkappe nach Monahan (`stamm/bild-sicht.js:1472-1484`)
  - Fluss-Phase (`:1234-1239`)
  - Eis (`stamm/wasser-hydro.js:711`)
- **Der Sheet-Bau steht zweimal (Zwilling).** `voxel-worker.js:2324-2331` und `stamm/wasser-zellen.js:1366-1373` schreiben
  aWave, aDepth, aSlope und aFlow je Vertex. Keiner schreibt die Art.

## Die EINE begrenzende Entscheidung
Die Welt hat pro Meter EINE Optik je Wasserkörper: `WASSER_GESETZ.koerper[gewaesserArt]`. wK bleibt allein die depth01-Look-Zahl
des Terrain-Studios (`worlds/terrain/phytogenesis.js:1983`). Kein Welt-Leser liest wK mehr. Die Absenz ist das Maß.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Stufen (alle in einer Welle):**
1. **Gesetz, additiv.** `foundry-core.js:172` bekommt je Art die Rückstreuung `bb` (1/m).
   - Heute steht `koerperStreu` 0,1 für jedes Wasser. Der Kommentar `:162` nennt für Binnenseen 0,01–0,2.
   - Ohne eigene Zeile würde R∞ des Sees mit kd rund 10× heller und grün. Das ist gerechnet, nicht gesehen.
   - Byte-Beweis: asset-contract.
2. **Art je Vertex.** Neues Attribut `aArt` (0 see, 1 bach, 2 fluss) aus `G.gewaesserArt(G.flussAm(...).breite)`, ein See hat Art see.
   - Worker: `voxel-worker.js:2327-2331`, Dupe-Vertex `:2339-2342`, Leser `hydroRiverAt` `:1810`
   - Main-Sync: `stamm/wasser-zellen.js:1369-1373`, Dupe-Vertex `:1385-1388`
   - Hülle: `stamm/wasser-zellen.js:924-927`
   - Fern-Sheet: `stamm/gelaende-fern.js:137-138` (see), `:172-173`
3. **Der Stoff von oben.** `stamm/bild-sicht.js:1447`: Durchlass = exp(−c·wegM − kd·aDepth), die Zeile per `aArt`.
   - Körper `:1246` aus `_wasserKoerper(WG, n, art)` (`:225`): R∞ = 0,33·bb/(0,85·kd)/n²
   - drei vec3-Uniforms, Mischung nach aArt
4. **Fern-Ring und Feld-Pass.** `stamm/gelaende-fern.js:1492-1496` lesen die Zeile see (oder fluss, wo der Ring einen Lauf trägt).
5. **Gefäß.** `stamm/bau-teile.js:2920`: exp(−kd_see·flach) statt wK.
6. **Fläche von unten.** In `_wasserBlick` (`stamm/wasser-hydro.js:769`) gilt bei `kameraUnterWasser` (`stamm/bild-himmel.js:2390`)
   der Fresnel von innen.
   - Jenseits des Grenzwinkels (48,6° bei n 1,333) liegt die Totalreflexion, mit dem Körper der Art statt Panorama
     (FUND-REGISTER `:21`).
   - Die Seite schaltet schon `:2445`.

**Leser-Liste (wer liest, was sich ändert):**
- Wasser-Stoff: `bild-sicht.js:1246`, `:1447`
- Fern-Ring: `gelaende-fern.js:1482`, `:1496`
- Gefäß: `bau-teile.js:2920`
- Sheet-Bau, zweifach: `voxel-worker.js:2328`, `wasser-zellen.js:1370`
- Medium der Kamera: `bild-himmel.js:2414`, unverändert, Vergleich
- Linsen: `scripts/lib/licht-linsen.cjs:1993` (R∞), `scripts/diag-wasser-leben.cjs:996` (`__wasserKoerper`)
- Station: punkte-maschine `stationen/g5.js:1941` trägt einen Art-Zwilling `_hydroRiverAt ? "fluss" : "see"`
  (Rumpf 2d04d714b). Sie fällt im selben Zug auf `_wasserArtAt`.
- Absenz nach dem Schnitt: `grep -n "\.wK\b" stamm/ voxel-worker.js` = 0.

**Kosten-Zeile:**
- 4 B je Wasser-Vertex.
- Je Fragment drei vec3-Mischungen statt einer Konstante.
- 0 CPU je Takt.
- Je Vertex beim Sheet-Bau ein `flussAm` (O(1) über den Kanal, `wasser-hydro.js:581`), im Faden.
- Messen: Wasser-ms über `werkbank zerlegen gehend` vorher↔nachher (Basis A1-n1: Wasser mit Pass 2,95 ms Radeon,
  `wasser-hydro.js:814`) und die Sheet-Bauzeit. Keine Abgabe über den Kosten von heute.

**Kriterien:**
- **leib.K3:** Ist 1 ↔ Soll 2. Staffel 2 heißt „Unterwasser-Bild aus der EINEN Wasser-Wahrheit … beide Geräte“
  (`PM/src/g5.js:250`). leib.K3#2 gtx ist GRÜN. leib.K3#2 radeon ist UNGEMESSEN (Absturz Exit 3221226505 an 36f9d45a).
- **gelaende.K3:** Ist 1 ↔ Soll 2 (`PM/src/g1.js:42`).
  - spiegelTreue: Ist 0,73 an der GTX (e84fd1fb), 0,830 an der Radeon (f2904a72), Soll ≥ 0,6. Sie darf nicht fallen.
  - Die 2 verlangt 12 Posen und eine Fließ-Anisotropie ≥ 1,5. Für K3#2 fehlt das Werkzeug. Dieser Schnitt bewegt die 2 nicht allein.
- **luftwasser.K3:** 2, die Sicht am Bach 19,56 m hält.

**Bildpaar an fester Kamera (Mittag), aus drei Höhen:**
- Bach der Mess-Wiese −309,8/−822,5: Auge, Hügel 10 m, Dach 25 m.
- See-Pose der Station: 1866,6/−6193,9, Gier −1,309.
- Eine Tauchpose 1 m unter dem Spiegel des Sees.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- In main gelandet:
  - `w13-bach-klar` 2d04d714b: Art, koerper.bach, `_wasserArtAt`
  - `w12-unterwasser`: Medium der Kamera
  - `w28-wasser-sicht` 6fd33f42: Weißkappe, Sonnen-Sicht
  - `wasser-leser`: EINE Wasser-Wahrheit am Körper
  - `w22-wasser-fix`
  - geprüft per `merge-base --is-ancestor` gegen origin/main
- Für diesen Schnitt gibt es keinen Zweig. Unter `*wasser*`, `*bach*`, `*ufer*` (26 Remote-Zweige) trägt keiner `aArt` oder
  koerper im Wasser-Stoff. Inhalte der alten Zweige a-wasser, d3c-wasser, welle-*-wasser habe ich nicht gelesen.
- Bis zur Landung fehlt alles aus Stufe 1–6, dazu das Bildpaar.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- **Ankunft.** Der Kurs (UEBERGABE §2.7) sagt: Arbeit landet, wo der Spieler ANKOMMT. Am Dorf der Ankunft sah ich kein Wasser
  (`dorf-main-0.5.png`). Ob der Prüfplatz einen Bach oder Brunnen trägt: nicht gelesen. Der Gewinn zeigt sich am ersten Ufer,
  nicht am Spawn.
- **Nur gerechnet, nicht im Bild gesehen.** Die bb-Werte je Art und die R∞-Farben sind gerechnet. Die Zahlen 0,020 → 0,605 sind
  Formel-Rechnung, keine Messung.
- **Kosten am Ufer.** FUND-REGISTER `:109`: Am See baut das Wassernetz ständig neu (9 108 Fälle in 2 829 Takten, Nah-Wiese ~13 ms
  je Takt). Ob F3 (`stamm/wasser-zellen.js:842-851`) das ganz heilt, ist nicht gemessen. Das ist E-Kosten, nicht diese Optik.
- **Belichtung unter Wasser.** Sie adaptiert nie (FUND `:21`, −0,6 EV im klaren See). Sie gehört dem Licht und ist nicht Teil
  dieses Schnitts.
- **Radeon-Absturz.** Die Ursache (Exit 3221226505) ist unbenannt (UEBERGABE §5). Bis dahin misst die Radeon weder leib.K3#2 noch
  gelaende.K3 noch K2.
- **Bach-Flächen nicht gesehen.** Weder von oben noch von unten habe ich im Spiel einen Bach gesehen. Das Bild vom Hügel ist mehrdeutig.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- **Wirkung 3.** An jedem Bach und Seeufer wird aus der undurchsichtigen dunklen Fläche ein Wasser mit sichtbarem Grund. Am Spawn
  ist es unsichtbar.
- **Aufwand M–L.** Sechs Stufen, Sheet-Bau zweifach, ein additives Kern-Feld.
- **Risiko.** Die spiegelTreue am See (0,73 GTX) kann fallen, wenn der Ufer-Grund durchscheint. Ohne eigene `bb`-Zeile kippt der
  See-Körper ins helle Grün.
