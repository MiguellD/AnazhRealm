# DER PRÜFPLATZ — Plan des Vertical Slice am Genesis-Ort

Stand: main b4bcf19c (V18.546.146), koordination 5139026e. Grundlage: die fünf Inventur-Leser (spawn · messung · bausteine1 ·
bausteine2 · beste). Selbst gelesen habe ich `stamm/siedlung-ort.js`, `stamm/gelaende-boden.js`, fachwerk `ortPlan`, gelaende `ERDBAU`,
`stamm/dirigent-ankunft.js` `_weltbildLuecken`, `spec/profiband/haushalt.json`, die Ratschen genesis/wiese × gtx, `spec/abnahme/soll-tafel.json`,
`zug/a-spawn.cjs` und `bericht/a-spawn-gtx3/urteil.txt`. Angesehen habe ich `inventur/spawn-third-*.png` (GTX, alter Ring) und
`../blick-tore-bild/genesis-ego-nach.png` (Radeon, neuer Ring).

**Chokepoint:** EIN Ort-Plan des Genesis-Orts. Die Kette ist fachwerk-core `GENESIS_ORT` + `genesisLayout()` → `ortPlan()` → `_ortPlaene`
→ der EINE Wirt-Leser `_genesisOrt()`. Ihn ruft das Spiel als Ort-Takt (`_tickGenesisOrt`), und die Werkbank fährt ihn als `ortTakt`.

**Was stirbt:**
- `start_plattform`: Bauplan und Teile (bau-vorlagen.js:133-149 und :1027-1033), `_ensureGenesisPlatform`, `_genesisScheibe`, `_genesisGrund`
  und die Spirale `_findOpenSpawnSpot` (gelaende-boden.js:402-477).
- `_genesisPlattform` (siedlung-ort.js:2132) und `GENESIS_PLATZ` (:3621).
- Der Ring aus der Schlüsselfolge der Baupläne (:2183-2215).
- Die Vorschau-Tafel im Wirt (`_portalApproachPrefetch` rows, :2357-2362).
- Die Start-Dorf-Phase aus der Saat (:2401-2431). Den Wunsch-Ort setzt künftig der Plan.

## 0 · Warum so: die Bremse in Zahlen

- **Die Besten gehen in dieser Reihenfolge vor:**
  1. Alle Systeme verbunden, in schlichter Fassung (Pfeifer, „Connected Systems Playable“).
  2. EIN Ort auf Versand-Niveau (Cerny, Volition).
  3. Dann die Breite.

  Dieser eine Ort steht in der echten Welt unter voller Last, sonst bricht er beim Einbau (Witcher 3).
- **Die Grundlinie vom 31.10.** (a-spawn-gtx3, GTX, main b4bcf19c): 22 von 114 Zellen im Bild sind GRÜN.
- **54 von 168 Zellen haben gar kein Bild:** wasser, fels und fell je 12, mensch-kopf und haar je 9. Am Spawn steht keins davon.
- **Von den 92 ROT-Zellen sind nur 24 Befunde am Bild.** Der Rest kommt aus dem Apparat oder der Tafel:
  - 48 sterben am Apparat: „die Teilung hält ihr Rauschen nicht“, zwei gleiche Schüsse weichen in 0,23–0,57 % der Pixel ab (Wand 0,2 %).
    Das trifft in Third jede Klasse, in Ego die fernen Zellen.
  - 8 haben kein Soll (himmel-licht zu 0,3 und 0).
  - 12 messen gegen eine veraltete Albedo-Tafel (haus, veraltet seit 1dcb844f).
- **Folge, und das ist der Plan:**
  1. Ein Ort, an dem jede Klasse steht, und ein Instrument, das zweimal dasselbe Bild schießt (Phase 0).
  2. Jede Zone auf ihr Ziel-Niveau (Phase 1).
  3. Die ganze Tafel in einem Boot messen (Phase 2).
  4. Schleifen (Phase 3).

## 1 · EINE Quelle: Architektur und Besitz

**Der Plan:**
- fachwerk-core (das ORT-Gesetzbuch) bekommt den Abschnitt `GENESIS_ORT` (die Maße aus §2 als Daten) und
  `genesisLayout(seed, welten)`.
- Das liefert Plan v1 `{art:'genesis', platz{kreis, belag}, tore[], wege[], park{}, zonen{}, viertel{}}`.
- `ortPlan()` macht daraus wie für jedes Dorf Plan v2 mit `erdbau`: der Kreis-Platz als 4 um 22,5° gedrehte Platten, die Wege als Trassen.
- Die Wahl rechnet der Ort-Faden (`_ortWahl`, gelaende-boden.js:869), Wunsch 0/0, Schlüssel `ort:<seed>:0,0`.

**Der Wirt liest nur:**
- `_genesisOrt(pos)` setzt den Ort, die Tore, die Vorschauen, das Mobiliar und die Zonen-Flächen. Er ersetzt `_genesisPortalRing`,
  `_ensureGenesisPlatform` und die Vorschau-Tafel.
- `_genesisMitte()` liest `worldMeta.genesisOrt`.
- Bestehende Welten ziehen EINMAL um: die alte Scheibe und die alten Ring-Tore im Umkreis von 20 m fallen. Zwei Formen gibt es nie.
- Was ein Spieler in den Fußabdruck gebaut hat, nimmt der Plan nicht. Die betroffene Zonen-Fläche fällt laut, ihr Zähler steht im Plan.

| Element | Gesetzbuch heute | Erweiterung (additiv, Byte-Beweis) | Zone |
|---|---|---|---|
| Grundriss, Wege, Zonen-Flächen, Anker der Stationen | fachwerk `ortPlan` / `dorfLayout` | `GENESIS_ORT` + `genesisLayout` | ort-plan |
| Kopfstein, Asphalt, Sand | gelaende `schuttKornO` (Zellen-Stein, :3254); die Wege-Karte kennt nur Erde/Acker | `BELAG_GESETZ` als reine Funktion CPU + WGSL; der Belag je Fläche kommt aus dem Plan, kein neuer Textur-Kanal | grund |
| Teich mit gehaltenem Spiegel | Hydrosphäre, `seeBecken`; ein Stau hält nur hinter einem Werk (:5649) | Becken-Term des Plans im Gesetz des Spiegels | grund |
| Steilkurve | ERDBAU `trasse`, quer eben (:1633-1644) | `trasse.quer` (Querneigung) | grund |
| 7 porta-Tore | porta-Gestalten | Membran-Farbe in jeder Stufe und zu jeder Uhr | tore |
| Lyra-, Vitruv-, Tier-Tor | Teile-Primitive (bau-vorlagen.js:677, :726, :761), ohne Membran | porta-Gestalten mit dem Motiv ihres Studios, L0–L3 | tore |
| Vorschauen | Wirt-Tafel (siedlung-ort.js:2357) | Zeile `vorschau` je Tor im Plan | ort-plan |
| Allee, Solitäre, Gürtel, Ramble | phyto `treeParams`, Feld-Wurf | – (der Plan setzt Bäume wie die Hof-Bäume eines Dorfs) | ort-plan; das Bild trägt laub-saum |
| Rasen-Keile, Wiese | Nah-Wiese, Boden-Satz | – | gras-saum (läuft) |
| Bank, Laterne, Brunnen, Bootshaus, Fels | fachwerk WERKE/AUSSTATTUNG/haus, Formationen | – | ort-plan (setzt sie) |
| Schaukel, Rutsche, Klettergerüst, Sandkasten, Wippe, Zaun, Pergola, Torii | fachwerk WERKE kennt nur Bank, Leiter, Brücke (:6157-6190) | neue Arten mit Stufen; dazu die Leib-Verben Pendel, Gleiten, Wippen | werke |
| Kinder, Familien, Sitzen, Spielen, Wächter | koerper `age` 18–80; der Tagesplan kennt weder Sitzen noch Spielen | Kind-Proportion unter 18, Tätigkeiten, Rolle `waechter`, Besucher-Haushalte des Plans, Kopf-Klasse der Bewohner | familien |
| Zoo mit fester Zahl | tetrapoda-Bestand mit Geburt/Tod/Riss; ein Leib entsteht erst ≥ 130 m weg | `BESTAND_GESETZ.gehege`: fest, am Ort gezeichnet, eigener Teil der Kappe 20 | gehege |
| Arena in der Welt | schmiede `ARENA` (Gefühl lebt in der Welt); die Geräte nur in der Shell (177 Meshes, 28× `Math.random`) | Geräte als schmiede-Gestalten L0–L2 mit Saat; Verben über den einen Stoß | arena |
| Rennstrecke | vehicle-Fahrschritt (Abheben bei v²/R > g); der Fahrer hält am Routen-Ende | `STRECKE_GESETZ` (Bauteile zur geschlossenen Linie), Runde im Fahrer, Lage im Flug | strecke |
| Start-Viertel | Start-Dorf 110–170 m, Phase aus der Saat | Wunsch-Ort aus dem Plan, Ort-Wahl mit `frei` = Fußabdruck des Platzes | ort-plan |
| Stadt (C-Bühne) und Stadt-Ring | stadt-voll entsteht nur durch das Wort am Anlauf | Sektor 1 = die C-Bühne steht durch den Plan, dazu Sektoren 2–n und die Silhouette aus denselben Plänen | stadt |

## 2 · Grundriss (relativ zu M = `_genesisMitte`, in der Standard-Welt 0/0)

**Konvention:**
- Achsen: +x = Ost, +z = Nord. Winkel mathematisch, 0° = Ost, 90° = Nord. Gier 0 blickt nach +z.
- Slots: a_k = 90° + k · 32,727° für k = 0 … 10. k = 0 ist die Achse und trägt kein Tor.
- Ein Tor steht bei (22 · cos a_k, 22 · sin a_k) und öffnet zur Mitte (Gier atan2(−cos a, −sin a), wie heute :2211).
- Abstand der Tore: Sehne 12,4 m (heute 6,9 m).

| Element | Mitte (x/z) | Maß | Ausrichtung / Inhalt |
|---|---|---|---|
| Kern-Platz | 0/0 | Kreis r 10 m | Kopfstein im Bogenverband um M, dunklere Windrose in der Mitte (Muster, 0 Befehle); Erdbau-Platte auf dem Median des Grunds |
| Speichen | a_k | r 10–20 m, Breite 3 m (k = 0: 10 m) | radial, Pflaster |
| Rasen-Keile | zwischen den Speichen | r 10–20 m (innen 2,7 m breit, außen 8,4 m) | Nah-Wiese |
| Ring-Weg | 0/0 | r 20–24 m | Pflaster, die Tore stehen darauf |
| Tore | r 22 an a_1 … a_10 | Gestalt des Studios | Öffnung zur Mitte; Zuordnung in der Slot-Tafel unten |
| Vorschauen | r 30 auf a_k | je Studio | entstehen, wenn der Spieler ≤ 14 m vor seinem Tor steht. Heute gilt ≤ 22 m vor dem Tor; bei R 22 hieße das, alle vier stünden schon an M |
| Laternen am Kern | r 10 bei a_k + 6° | 11 × `laterne_dorf` | – |
| Bänke am Kern | r 9,5, zwischen den Speichen | 9 (ohne die Achse) | Blick zur Mitte |
| Wächter-Laterne | 0/−9 | 1 Laterne | nachts steht der Wächter dort (familien) |
| Freiraum | 0/0 | r ≤ 32 m | ohne Krone, Busch und Fels (heute 15 m) |
| Gürtel | 0/0 | r 32–55 m | Wald mit Unterholz (Feld-Wurf bleibt), 11 Wege führen hindurch; trägt den Sichtschutz |
| Mall | x −5…5, z 24…100 | Breite 10 m | Pflaster; Allee aus 2 × 8 Buchen bei x = ±7, z = 30, 40 … 100 (EINE Art, 2 Samen) |
| Terrasse | 0/106 | 30 × 12 m | Erdbau-Platte, Pflaster; `brunnen_dorf` bei 0/106 |
| Teich | 0/140 | Ellipse mit Halbachsen 40 × 25 m | Spiegel 1,5 m unter der Terrasse, Becken-Term (grund) |
| Bootshaus | −60/150 (Westufer) | fachwerk-Haus | r 161,6 m, außerhalb der Mesh-Zone der Ankunft und abseits der Strecke |
| Ramble | N jenseits z 165; W–SW 170°–240° bei r 55–250 | Wald | Feld-Wurf |
| Wiese | x −110…−20, z 55…115 | 90 × 60 m | Rasen; 3 Solitär-Eichen bei −55/80, −85/100, −95/70; Laterne bei −40/60 |
| Spielplatz | 60/−55 | 36 × 28 m, Sand und Rasen | Längsachse zur Mitte |
| Fels | 78/−40 | Formation ~12 × 8 × 5 m | Vorbild Umpire Rock |
| Zoo | 0/−90 | Rundweg r 14 um die Mitte, Eingang N bei 0/−76 | Gehege: Wolf 3 (−28/−90), Hirsch 3 (28/−90), Bär 1 + Fuchs 2 (0/−118), je 18 × 16 m; 4 Laternen am Rundweg |
| Arena | 85/5 | Hof Ø 32 m, Sand | Torii am W-Eingang 69/5, Pergola/Dojo 98/5 |
| Strecke | Rahmen x 70…390, z 150…370 | Mittellinie ~1,1 km, Breite 9 m | nächster Punkt ≥ 160 m von M; Start/Ziel an der W-Seite, Zugang über den Weg von T10 (57,3°) |
| Fahrweg | von 360/330 über den Anlauf 400/400 | Breite 7 m, Asphalt | Wegenetz-Knoten `genesis` ↔ C-Bühne |
| Start-Viertel | Wunsch −95/−165 | Start-Dorf-Gesetz (8–17 Häuser) | r 190 m bei 240°, außerhalb des Ankunftskegels und der Zonen |
| C-Bühne | Markt 836,2/438,5 | `dorf 7 300` (295 Häuser) | wie der Messort stadt-voll (944 m, 27,7°); steht durch den Plan erst mit Zone stadt |

**Slot-Tafel:** Jedes Tor öffnet zur Zone seines Studios. Die Vorschauen bleiben die vier von heute.

| k | Winkel | Tor (Welt · Gestalt) | Vorschau | Weg zur Zone |
|---|---|---|---|---|
| 0 | 90° | – (Achse) | – | Mall → Terrasse → Teich |
| 1 | 122,7° | fluid · drachentor | – | Teich-Ufer West |
| 2 | 155,5° | terrain · verkalkt | – | Wiese |
| 3 | 188,2° | portale · kathedrale | Drachentor | Ramble (Mitte des Messblicks −x) |
| 4 | 220,9° | skeleton · geisttor | – | Ramble SW |
| 5 | 253,6° | klang · Lyra-Tor | – | Zoo West, Start-Viertel |
| 6 | 286,4° | tetrapoda · Tier-Tor | – | Zoo |
| 7 | 319,1° | koerperstudio · Vitruv-Tor | – | Spielplatz und Fels |
| 8 | 351,8° | schmiede · maurentor | Esse | Arena |
| 9 | 24,5° | fachwerk · ruine | Haus | Fahrweg zur Stadt |
| 10 | 57,3° | garage · maschine | GT | Strecke |

**Sichtachsen:**
- **Ankunft:** Ego, Gier 0, nach N. In den ersten Blick fallen alle Dinge im Kegel ±(Sicht/2 + 15°) + 12 m (`ERSTER_BLICK`, dirigent-ankunft.js:1455).
  Das sind T9, T10, T1 und T2, die Mall als Zentralperspektive, der Brunnen in 106 m, der Teich als Glanz dahinter und der Ramble als
  Abschluss. Das ist der Haupt-Wienie.
- **Messblick −x** (S2, unverändert): T2, T3 und T4 vor dem Ramble. Der Westen bleibt Wald wie heute.

```
                                        N (+z)
            RAMBLE (Wald)                                  . . . . . . . . . . . . . . . . . . . .
                         [Bootshaus  .-----------------.      .  STRECKE  x 70…390 · z 150…370   .──► Fahrweg ENE
     .--------------------. −60/150](  TEICH 0/140      )     .  ~1,1 km · Steilkurve · Kuppe    .    → Anlauf 400/400
     |  WIESE  x −110…−20 |         (  40 × 25          )     .  Kicker · Start/Ziel W-Seite     .    → C-Bühne 836/438
     |  z 55…115 · 3 Sol. |          `----.-------.----´      . . . . . . . . . . . . . . . . . . . .
     `--------------------´   [TERRASSE 0/106 · Brunnen]           (nächster Punkt ≥ 160 m von M)
                                 ♣ |  MALL   | ♣    Allee Buche x ±7, z 30…100
                                 ♣ |  b 10 m | ♣
    ~ ~ ~ ~ ~ ~ ~ ~ GÜRTEL r 32–55 (Wald + Unterholz), 11 Wege hindurch ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
                 T2 terrain    T1 fluid  ║A║  T10 garage   T9 fachwerk
         T3 portale                .------------.                        
   W ◄──                         (  KERN r 10    )  Speichen r 10–20 · Ring-Weg r 20–24 · Tore r 22    T8 schmiede ──► ARENA 85/5
         T4 skeleton               `------------´  Vorschauen r 30                                              Hof Ø 32
                 T5 klang     T6 tetrapoda    T7 koerperstudio ──► SPIELPLATZ 60/−55 · Fels 78/−40
   START-VIERTEL                      │
   Wunsch −95/−165             ZOO 0/−90  (Wolf W · Hirsch O · Bär+Fuchs S)
                                        S (−z)
```

## 3 · Zonen und Budget

**Sichtschutz-Regel:** Jede Station sieht den Sockel, den Kern, den Park und höchstens EINE Sektor-Zone. Das tragen der Gürtel (r 32–55) und
die Waldstreifen zwischen den Sektoren. Probe: an jeder Sektor-Station zeichnet kein Ding einer anderen Sektor-Zone (Zählung je
Zonen-Marke = 0). Jedes Ding des Plans trägt dafür seine `zone`.

**Hüllen:** GTX 1060, 1920 × 1080, Regler voll, stehend. Befehle und Dreiecke zählen Hauptbild plus Kaskaden, wie es die Ratschen tun.

| Hülle | Inhalt | Befehle | Dreiecke | VRAM | CPU-Takt p95 | gilt an |
|---|---|---|---|---|---|---|
| Sockel | Himmel, Boden-Satz samt Belag, Fern-Ring, Fern-Wasser, Spieler, Feld-Pass, Karten L2, Post | 40 | 160k | 86 MB fest (TRAA 31,6 · Kaskaden 16 · Ausgabe/Tiefe 8,8 · Wege-Karte 4 · Flacker 4 · Tor-Ziel 3,5 · Karten 5,6 · Rest) | ≤ 4,0 ms | jeder Station |
| Kern | Tore + Membranen ≤ 30/80k · Vorschauen ≤ 7/20k · Laternen, Bänke, Brunnen ≤ 8/10k | 45 | 110k | ≤ 6 MB | ≤ 0,3 ms | S1–S4, S13 |
| Park | Baum ≤ 36/120k · Busch ≤ 8/20k · Nah-Wiese ≤ 4/80k · Streu ≤ 6/10k · Fels und Teich ≤ 4/8k · Bootshaus ≤ 2/2k | 60 | 240k | ≤ 10 MB (Teich-Spiegel +1,7) | ≤ 0,5 ms | jeder Station |
| Sektor (je EINER) | siehe unten | 45 | 140k | ≤ 6 MB | ≤ 1,0 ms | S7–S11 |
| Reserve | – | 18 | 30k | ≤ 10 MB | – | – |
| **Σ = Band (E)** | | **208** | **680k** | **118 MB** | **5,8 ms** | Frame p95 ≤ 33 ms, Ziel 16,7 |

| Sektor | Klassen-Anteil | Befehle | Dreiecke | CPU | Bedingung |
|---|---|---|---|---|---|
| Zoo | tier ≤ 30/60k + bau (Zaun, Laternen) ≤ 10/15k | 40 | 75k | ≤ 0,8 ms | 9 Tiere fest, höchstens 1 Leib in L0, der Rest im Tier-Satz |
| Spielplatz | bewohner ≤ 16/80k + bau (Geräte, Bänke) ≤ 12/15k + Fels ≤ 4/10k | 32 | 105k | ≤ 0,5 ms | 13 Leute fest, höchstens 4 Leiber |
| Strecke | bau (Wagen im Bau-Satz) ≤ 16/45k + Strecken-Bauten ≤ 10/20k + Fahrer ≤ 4/8k | 30 | 73k | ≤ 1,0 ms | 4 Wagen, ferne nur jeden 2./4./8. Schritt |
| Arena | bau (Geräte) ≤ 30/45k + Pergola/Torii ≤ 6/10k | 36 | 55k | ≤ 0,5 ms | die Verben rechnen nur bei Treffer |

**Heute (Ratsche gtx genesis, alter Ring):**
- Klasse bau: Ego 45 Befehle / 94k Dreiecke, Third 60 / 143k. Die Klasse erlaubt 40 / 60k, der Kern muss also schneiden.
- Kurzfristige Stände (K3#1 ec989990): VRAM 116,8 / 122,2 MB, CPU-Takt Third 6,5 ms (z106).
- **Netto gilt:** Der Kern und der Park bringen vorher↔nachher am selben Kopf VRAM ≤ 0 und CPU ≤ 0. Den Überzug von heute (VRAM +4,2 MB,
  CPU +0,7 ms) trägt E (siehe Risiken).

**Messung:**
- `werkbank zaehlen` je Station nach Zonen-Marke; `werkbank takt` für den ms-Anteil je Takt-Glied; `werkbank puffer` für VRAM.
- Die Radeon misst der Koordinator, die GTX die OMEN-Station.

## 4 · Prüf-Posen (Stationen, relativ zu M)

**Regeln:**
- Höhen: Ego = Grund + 1,7 m. Third = der Arm des Spiels (6 m / 2 m).
- Uhr: 0,5 / 0,3 / 0, gehalten von der Bühne.
- nah ≤ 30 m und fern > 30 m werden je Pixel aus der Tiefe bestimmt (a-spawn). Eine Klasse gilt als im Bild ab 0,1 % (2 074 px).
- Akteure stehen im Schuss still (Zone mess).
- Nachts tragen die Laternen des Plans das Licht an S5–S9 und S13.

| Station | Ort → Blick | Klassen × Zelle |
|---|---|---|
| S1 Ankunft | 0/0 → 0/50 (Gier 0) | tor-* nah (T10, T1 in 22 m) · boden-nah nah (Keile 10–14 m) · laub fern (Allee, Gürtel) · himmel-licht |
| S2 Messort E | 0/0 → −10/0 (Gier −π/2, unverändert) | tor-* nah (T2–T4) · mensch-kopf/haar Third nah (Spieler) · Band und ABAB g-third/g-ego |
| S3 Tor-Gegenblick | 0/−17 → 0/22 | tor-* fern (T1, T10 in 38 m) |
| S4 Mall-Rückblick | 0/80 → 0/0 | tor-* fern Stufe L2 (Ring in 58–102 m) · laub und laub-kante nah (Allee in 7 m, Kronen gegen den Himmel) |
| S5 Wiese | −40/60 → −85/95 | boden-nah nah und fern · boden-nah-farbe (2–5 m) · himmel-licht · laub nah (Solitär −55/80 in 25 m) · laub-kante fern (Waldrand 70 m) |
| S6 Teich | 0/110 → 0/150 | wasser nah (5–30 m) und fern (30–55 m) · laub-kante fern (Ramble im Spiegel) |
| S7 Spielplatz | 52/−48 → 64/−58 | mensch-kopf/haar Ego nah (Familie 3–8 m, Uhr 0,5) · fels nah (27 m) |
| S7f Spielplatz fern | 30/−20 → 60/−55 | mensch-kopf/haar fern (Gruppe 46 m, ≥ 0,1 %) · fels fern (52 m) |
| S8 Zoo | −14/−90 → −28/−90 | fell nah (Wölfe 6–20 m) |
| S8f Zoo fern | −5/−55 → −28/−90 | fell fern (42 m) |
| S9 Bootshaus | −45/128 → −60/150 | haus nah (26,6 m) |
| S9f Bootshaus fern | 0/110 → −60/150 | haus fern (72 m) |
| S10 Arena | 66/5 → 85/5 | E-Last-Pose (Treffer-Serie); keine Klasse der Tafel |
| S11 Strecke | Verfolger auf der Mess-Fahrt (feste Eingabe-Spur, 1 Runde) | E in Fahrt (Zelle pp-fahrt) · C-Probe (Wagen mit Bewohnern, 0 Berührungen) |
| S12 Stadt | Messort stadt-voll | C-Bühne · haus fern · E (Stadt) |
| S13 Wächter | 0/−5 → 0/−9 | mensch-kopf/haar Ego nah zu 0,3 und 0 (Wächter in 4 m unter der Laterne) |

**Jede Klasse in ihren 12 Zellen** (Ego/Third × nah/fern × 3 Uhren):
- boden-nah: S5 (nah, fern), dazu S1.
- boden-nah-farbe: S5.
- himmel-licht: S5.
- laub: S4 und S5 nah, S1 und S5 fern.
- laub-kante: S4 nah, S5 und S6 fern.
- haus: S9, S9f.
- wasser: S6.
- tor-fern, tor-bunt, tor-ziel: S1 und S2 nah, S3 und S4 fern.
- fels: S7, S7f.
- mensch-kopf, haar: Third nah S2, Ego nah S7 (0,5) und S13 (0,3/0), fern S7f.
- fell: S8, S8f.

**Ziel nach Phase 2: 168 Zellen im Bild, 0 „nicht im Bild“.**

Die Stationen sind Daten des Plans und hängen an seinen Elementen. Zeigt eine Station ihre Klasse nicht mit ≥ 0,1 %, rückt man sie im
Plan, nie im Skript. Phase 0 und 1 prüfen das.

**Tafel-Lücken (Zone mess):** Hier fehlt heute ein Soll. Gefüllt wird mit Quelle, nie durch ein gesenktes Soll.
- himmel-licht zu 0,3 und 0 (Quelle `spec/farbe/tag-ref.json`).
- boden-nah-farbe fern.
- mensch-kopf/haar fern: der Kopf ist jenseits 30 m kleiner als 40 px. Gemessen wird das Albedo-Verhältnis von Haut und Haar der Mengen-Stufe
  gegen das Labor, als neue Zeile der Albedo-Tafel.
- Die Kopf-Klasse der Bewohner-Leiber für die Teilung (familien).

## 5 · Lade-Reihenfolge der Ankunft (B ≤ 5 s kalt)

- **S−1, vor dem ersten Chunk am Spawn:**
  - Der Plan des Orts entsteht im Ort-Faden: Ort-Wahl am Wunsch 0/0, deterministisch aus Saat und Gesetz.
  - Der Erdbau liegt, bevor der Chunk-Ring am Spawn baut. Sonst baut jeder Chunk zweimal, weil `_erdbauWirkt` die Gedächtnisse wirft.
  - Der Spieler steht an M auf Grund + 1,2 m, Gier 0.
  - Soll: Faden ≤ 50 ms, Haupt-Faden ≤ 2 ms. Der Ruf sitzt in gelaende-chunks.js:970-975 (heute `_ensureGenesisPlatform`).
- **S0, hält das erste Bild** (Kegel ±(Sicht/2 + 15°) + 12 m, Mesh-Zone ≤ 150 m, dirigent-ankunft.js:1129):
  - Boden mit Erdbau und Belag. Das Pflaster ist ein Term des Boden-Stoffs: 0 Befehle, kein eigener Bau.
  - Licht, Leib, Horizont.
  - T9, T10, T1, T2 in ihrer billigsten ganzen Stufe, die Membranen mit dem Ziel-Atlas.
  - 16 Buchen der Allee: EINE Art, 2 Samen, also 2 Gestalten.
  - Laternen und Bänke im Kegel, der Brunnen in 106 m.
  - **NICHT im ersten Bild:** Vorschauen (erst ≤ 14 m vor dem Tor), Akteure, Sektor-Inhalte, Bootshaus (161 m), Start-Viertel, Stadt.
- **S1, Nachlauf rundum:** T3–T8, das Mobiliar ringsum, der Gürtel.
- **S2, bei Annäherung** (≤ 150 m + 60 m Vorlauf an die Zone): Zoo-Bestand, Familien, Geräte, Arena, Strecken-Wagen, Bootshaus.
- **S3, Dorf-Zug:** das Start-Viertel am Wunsch −95/−165, außerhalb des Kegels.
  - **Übergabe an ankunft-5:** Die Terme „das Dorf wird geplant“ und „das Dorf wird gegründet“ (dirigent-ankunft.js:1160-1165) halten
    das erste Bild heute ohne Blick-Prüfung, also auch für ein Dorf im Rücken (B5: die Kette hielt bis 16,07 s). Liegt der Wunsch-Ort außer
    Blick, dürfen sie es nicht halten.
- **S4, Stadt:** C-Bühne und Sektoren nie vor dem ersten Bild. Ihre Silhouette liegt außerhalb des Kegels, oder ihr Bild-Anteil
  im K2-Bild bleibt ≤ 0,5 %.

**Regeln:**
1. Im Kegel bis 150 m steht kein Akteur und nichts, was sich in 60 s bewegt (K2 ≤ 2 %, diag-boot-stage.cjs:54), bis mess den Schuss
   mit allen Akteuren hält.
2. Jede Gestalt im Kegel steht in ihrer billigsten ganzen Stufe.
3. Die Kalt-Zeile (zug/ankunft-kalt.sh, 3 Boots je Kopf, am selben Gerät vorher↔nachher) ist das Tor jeder Zone, die etwas in den Kegel stellt.

## 6 · Mess-Kopplungen: was in derselben Welle neu geeicht wird

| # | Kopplung | was der Platz bricht | neu geeicht · von wem · wann |
|---|---|---|---|
| 1 | haushalt.json, Messort genesis (Titel „R 11 m“, `ortTakt`, Täter-Regeln) | neue Arten ohne Regel machen die Linse `haushalt` ROT | Titel, `ortTakt = [_genesisOrt, _portalApproachPrefetch]`, Regeln: Pflaster = boden, Geräte/Zaun/Pergola = bau, Gehege = tier, Familien = bewohner; `g:start_plattform` fällt · ort-plan · Phase 0 |
| 2 | Ort-Takt-Name als Instrument (das Instrument ist eine Seite des ABAB) | die A-Seite kennt `_genesisOrt` nicht | Vor-Commit 0a: `_genesisOrt` ruft den Ring von heute und wird die A-Seite · ort-plan · vor allem |
| 3 | Anker-Wand werkbank.cjs:944-953 | ein Ort neben 0/0 bricht `umstellen` | Ort-Wahl am Wunsch 0/0, Prüfung `_genesisMitte` 0/0 ± 1 m in der Standard-Welt · ort-plan |
| 4 | gate:ankunft D9 · Rundblick · Baum-Fälle · dorfFaellig | `pl.position` fehlt; der Wald unter 30 m ist geräumt | Anker = Plan; die leere Richtung zählt jeden Grundriss; Rundblick und Baum-Fälle stellt die Probe selbst her; dorfFaellig hängt am Start-Viertel · ort-plan |
| 5 | V-D1 (diag-v1-pfad) · playtest/bild · haus-welt W8/W10 · tor-fern (Summe 88 538, dM 13/15/17) · fahr-leben F1 · settlement C5 · portal-konformanz · portal-membran | jeder Leser liest Scheibe oder Ring 11 m | lesen den Plan: ein Ort, Ring-Mitte ≤ 1 m, keine Krone über r 32, Summe für R 22 · ort-plan |
| 6 | gate:pruefbuehne (300 m ohne Tier, Dorf, Pflanzung) | Zonen am Genesis jeder Welt | die Prüfbühne trägt nur Kern und Tore (Wildnis 0 → `_wildnisTraegt`), 21 Werke · ort-plan |
| 7 | soll-tafel: Kameras von tor-* absolut (−11,6/90,24/36,48 …) | R 22 trifft kein Tor | Posen relativ zum Ring (Ziel `tor-platz`) · mess · Phase 0 |
| 8 | zug/a-spawn.cjs (8 Blicke ab M) | Klassen stehen an Zonen | Stationen S1–S13 aus dem Plan; vorher die Tafel am alten Platz · mess |
| 9 | K2-Bild: `SCHUSS` hält nur Kreaturen (ausgabe-aufnahme.cjs:477-493) | Akteure zählen als Lücke | der Schuss hält jeden Akteur; bis dahin gilt Regel 1 der Ankunft · mess |
| 10 | ABAB g-third und w-ego | der Platz ändert, was die Station sieht | A = 0a, B = ort-plan; nicht-langsamer heißt unter 2σ (gpu-bank 0,56 ms · Belegung 0,74 · CPU-Takt 0,4) · Koordinator, OMEN |
| 11 | 4 Ratschen genesis × {gtx, radeon} × {ego, third} | jeder Platz-Bau ist ROT | Re-Mint am Platz-SHA mit je 4 Boots; `frei.tier` entfällt am Platz · Koordinator · nach Phase 0 und 1 |
| 12 | Punkte profiband genesis-* (Uhren 7/11/58 s) | mehr Inhalt verlängert das Einschwingen | Reihen neu ab Platz-SHA, Uhren neu, vorher den Stau buchen · mess + Koordinator |
| 13 | Punkte am Genesis-Ort: tore.K3, siedlung.K1#2, halten.K4, ferne.K1/K2, licht.K1#1, material.K2#1, vegetation.K3#2, bauen.K3#1, gelaende.K2#1 | Orte wandern mit; die Eiche „an der Plattform“ | Stationen nachziehen, Tag-Kurve am Spawn neu · mess |
| 14 | Albedo-Tafel, Welt-Seite am Ort genesis; haus veraltet seit 1dcb844f | Exemplare geräumt bzw. veraltet | `werkbank albedo --tafel` auf der Radeon · mess · sofort |
| 15 | Tafel-Lücken (§4) | Zellen ohne Soll | neue Zeilen mit Quelle · mess |
| 16 | Messorte stadt/stadt-voll (das Wort am Anlauf) | steht die Stadt, kollidiert das Wort | ohne Wort; neue Basis der ABAB-Zelle `stadt` in derselben Welle · stadt |
| 17 | boden-nah am Platz | Pflaster hat per Bau LAI 0 | boden-nah misst an S5 und an den Keilen, nie auf dem Pflaster · mess |

## 7 · Phasen und Tore

**Phase 0: Blockout und Apparat.** Der Platz steht als EIN Plan in der Grau-Fassung, jede vorhandene Klasse an ihrer Station, die Kosten sind gemessen.
- **0a (ort-plan, klein, nächster Zug):** `_genesisOrt` als Ort-Takt-Name mit dem Inhalt von heute, haushalt `ortTakt` nachgezogen. Das ist
  die A-Seite des Platz-ABAB.
- **ort-plan, Grau-Fassung:**
  - Plan und Erdbau. Die Flächen tragen Belag `weg`, bis grund das Pflaster bringt.
  - Die Tore an ihren Slots; Allee, Solitäre, Laternen, Bänke, Brunnen, Bootshaus, Fels; das Start-Viertel am Wunsch.
  - Zonen ohne Inhalt bleiben Fläche, nie eine graue Ersatz-Box.
- **mess, Teil 1:**
  - Rauschen halten, bis zwei gleiche Schüsse ≤ 0,2 % auseinanderliegen, in Ego UND Third zu jeder Uhr.
  - Albedo für haus neu.
  - Soll für himmel-licht zu 0,3 und 0.
  - Tor-Posen relativ zum Ring.
- **Koordinator:**
  - Radeon: Bilder S1–S6, S9 und S13 in Ego/Third zu Mittag, mit eigenem Auge geprüft; `zaehlen`/`takt`/`puffer` je Station.
  - OMEN: ABAB g-third + w-ego (A 0a, B ort-plan), Kalt-Zeile 3× vorher/nachher, a-spawn-Tafel GTX an den Stationen.
- **Tor 0:**
  - ABAB nicht-langsamer.
  - Kalt-Zeile: Median nachher ≤ vorher (GTX).
  - Absenz `start_plattform|GENESIS_PLATZ|_genesisPlattform|_genesisScheibe|_findOpenSpawnSpot` = 0 (über `__codeOf`).
  - Jede Klasse, deren Inhalt es gibt (tor-*, laub, laub-kante, boden-nah, boden-nah-farbe, himmel-licht, haus, fels, mensch/haar
    Third), steht an ihrer Station mit ≥ 0,1 % im Bild.
  - gate:pruefbuehne zählt 21 Werke.
  - Re-Mint der 4 Ratschen.

**Phase 1: die Zonen parallel auf Ziel-Niveau.** Die Zonen sind grund, tore, werke, familien, gehege, strecke, stadt und zuletzt arena.
- Je Zone: das Gesetz kommt additiv in den Kern, das Alte bleibt per Byte-Beweis gleich, Labor = Welt. Der Haken in den Plan kommt nach ort-plan.
- **Tor je Zone:**
  - Zonen-Budget an ihrer Station (Radeon-Zählung).
  - Ihre Klassen im Bild.
  - Kalt-Zeile, wenn sie etwas in den Kegel stellt.
  - ABAB g-third nicht-langsamer, wenn sie am Kern baut.

**Phase 2: Licht und Messung.**
- A-Tafel 14 × 12 = 168 Zellen an S1–S13, Radeon (Koordinator) und GTX (Station), 0 „nicht im Bild“.
- ABAB g-third und w-ego, dazu neue Zellen pp-spiel (S7), pp-zoo (S8), pp-fahrt (S11).
- Kalt-Zeile an beiden Geräten.
- Ratschen und Buchung.

**Phase 3: Schleifen.** Jede ROT-Zelle geht an ihren Täter beim Namen:

| Klasse | Täter-Studio |
|---|---|
| boden-nah | vegetation-wiese |
| laub, laub-kante | phyto/foundry-Karten |
| haus | fachwerk |
| wasser | gelaende/Wasser-Blick |
| tor-* | porta |
| fels | Formationen |
| mensch, haar | koerper/Mensch-Ofen |
| fell | tetrapoda |
| himmel-licht | Licht-Kette |

**Start-Wellen** (die laufenden Arbeiter bestimmen die Reihenfolge; Datei-Besitz in §8):
- **Welle a, sofort:**
  - 0a, sobald gras-saum gelandet ist (haushalt.json).
  - mess: Tafel und Albedo sofort, werkbank/Aufnahme nach z108.
  - Die Kern-Teile von grund (gelaende-core), familien (koerper-core) und gehege (tetrapoda-core).
- **Welle b, nach Tor 0 der laufenden Zweige** (studios-heim2, z108, w4-ankunft-3, w4-ankunft-5, w4-gras-saum im main): ort-plan, tore, werke, strecke.
- **Welle c, nach ort-plan im main:** die Wirt-Haken aller Zonen. siedlung-bewohner.js erst nach w4-verkehr-c, kreatur-* nach z108,
  siedlung-wege.js/stoff-material.js nach gras-saum.
- **Welle d:**
  - stadt, nach e-takt + w4-ankunft-5, lokal auf dem nächsten freien GPU-Platz.
  - arena: außerhalb von Pflicht-OFFEN, kommt zuletzt.

## 8 · Zuordnung Zone → Arbeiter → Dateien (Besitz)

| Zone | Arbeiter · Zweig | Dateien (nur diese) | wartet auf | Ort | Ports |
|---|---|---|---|---|---|
| ort-plan | champion ort-plan · w4-genesis-ort-name (0a), w4-ort-plan | fachwerk-core.js §GENESIS_ORT (neuer Abschnitt am Ende) · stamm/siedlung-ort.js · stamm/gelaende-boden.js · stamm/gelaende-chunks.js (Spawn-Ruf) · stamm/bau-vorlagen.js (start_plattform) · stamm/vegetation-baum.js (Lichtung → Fußabdruck) · stamm/koerper-seele.js (Respawn) · spec/profiband/haushalt.json · die Leser aus §6 Nr. 4–6 | studios-heim2 · z108 (b-streu) · w4-ankunft-3 · w4-ankunft-5 · gras-saum | Lokal: die Grau-Fassung muss gesehen werden, der Zweig ist Stamm-Chirurgie | Werkbank 4560–4569 · punkte 8020 |
| mess | champion mess-platz · w4-mess-platz (main), w4-mess-platz-koord (koordination) | koordination: zug/a-spawn.cjs, zug/a-spawn.sh · main: scripts/lib/ausgabe-aufnahme.cjs, scripts/werkbank.cjs (nur `bild`/Bühne), spec/abnahme/soll-tafel.json, spec/farbe/albedo-tafel.json | z108 (werkbank.cjs, haenger-linse) · A-Gesicht (abnahme-urteil.cjs, falls berührt) · ort-plan (Stationen) | Lokal (Rauschen nur auf echter GPU) | 4660–4669 · 8040 |
| grund | champion grund · w4-grund | gelaende-core.js (§BELAG_GESETZ, §Becken, §ERDBAU `trasse.quer`) · worlds/gelaende/* · stamm/siedlung-wege.js · stamm/stoff-material.js | Kern-Teil sofort · Wirt-Teil nach gras-saum + ort-plan | Lokal (Look) | 4670–4679 · 8060 |
| tore | champion tore-teile · w4-tore-teile | porta-core.js · worlds/portale/porta.js · stamm/bau-vorlagen.js (nur die Einträge welt_klang/-koerperstudio/-tetrapoda :1385–:1420 und ihre Teile-Listen :677–:800) | studios-heim2 | Cloud | – |
| werke | champion werke · w4-werke | fachwerk-core.js §WERKE (AUS_ARTEN-Zeilen und die Bauer der neuen Arten) · worlds/fachwerk/fachwerk.js · stamm/koerper-bewegung.js (Verben) | studios-heim2 | Cloud | – |
| familien | champion familien · w4-familien | koerper-core.js · worlds/koerperstudio/* · stamm/siedlung-bewohner.js · stamm/koerper-leib.js (Kopf-Klasse) | Kern sofort · Wirt nach z108 + w4-verkehr-c + ort-plan + werke | Cloud | – |
| gehege | champion gehege · w4-gehege | tetrapoda-core.js · stamm/kreatur-leben.js · stamm/kreatur-verhalten.js · worlds/tetrapoda/* | Kern sofort · Wirt nach z108 + ort-plan + werke (Zaun) | Cloud | – |
| strecke | champion strecke · w4-strecke | vehicle-core.js · stamm/koerper-fahrt.js · worlds/garage/garage.js | studios-heim2 · grund (`trasse.quer`, Asphalt) · ort-plan (Rahmen) · w4-verkehr-c (KI-Wagen) | Cloud | – |
| stadt | champion stadt-ring · w4-stadt-ring | fachwerk-core.js §GENESIS_ORT (nur die Zeilen `stadt`, nach ort-plan) · stamm/gelaende-fern.js · stamm/bild-sicht.js · stamm/siedlung-ort.js (feste Sektoren; erst nach ort-plan) · haushalt.json (Messorte stadt/stadt-voll) | ort-plan · e-takt · w4-ankunft-5 · w4-verkehr-c | Lokal (Fern-Bild) | 4680–4689 · 8080 |
| arena | champion arena · w4-arena-welt | schmiede-core.js · stamm/kampf.js · worlds/schmiede/schmiede.js | ort-plan (Hof); zuletzt | Cloud | – |

- **Abschnitt-Besitz in fachwerk-core.js:** ort-plan den neuen Abschnitt `GENESIS_ORT`, werke `WERKE` (:6157-6190 und neue Bauer), stadt
  nur Daten-Zeilen in `GENESIS_ORT` und erst nach ort-plan.
- gelaende-core.js gehört nur grund.
- siedlung-ort.js gehört erst ort-plan, danach stadt.
- **Höchstens 3 GPU-champions lokal:** ort-plan, mess, grund. stadt wartet auf den ersten freien Platz.

## 9 · Referenzen der Besten je Zone

| Zone | Vorbild | was es setzt |
|---|---|---|
| Kern, Tore | Alexander Pattern 61 (Platz ≤ 21 m), Gehl (< 25 m Details), Disneyland-Hub (EIN Wienie in der Achse), Peach's Castle in Mario 64 (die Bilder sind die Tore), Epic Content Examples (Station je Thema) | Kern r 10, Sehne 12,4 m, Achse auf den Brunnen; die Membran zeigt ihr Ziel |
| Park | Greensward-Plan 1858: Mall mit Ulmen-Gewölbe → Bethesda Terrace → Lake → Ramble; Sheep Meadow 6 ha gegen Ramble 15 ha; Bow Bridge | Achse, Terrasse, Teich, Kontrast von Wiese und Wald |
| Grund | Granit-Kleinpflaster 9–11 cm und Großpflaster 14–16 cm im Segmentbogen, Sandfuge 8–12 mm (Prager Altstadt, Grand-Place) | Steinmaß, Fuge, Kuppe, Glanz der Laufspur, Moos am Rand |
| Spielplatz, Familien | Heckscher Playground am Umpire Rock (Central Park) | Geräte, Fels, Bänke der Eltern |
| Zoo | Central Park Zoo (2,6 ha, kleine Gehege), Hagenbeck (Gehege ohne Gitter im Blick), Horizon (deterministische Setzung) | feste Zahl, dieselben Tiere in jedem Boot |
| Strecke | SuperTuxKart (Runde 40–70 s, Landezone nach jedem Sprung, Straße immer sichtbar), McMillan 2011 (Spur 1,6 Wagenbreiten, Bankett 50–75 %), GTA Cunning Stunts (Bauteile), Forza Horizon (Festival-Hub als Start) | Bauteil-Gesetz, Runde ~60 s, Start am Platz |
| Stadt | Matrix Awakens (7 000 Häuser auf 16 km² aus Modulen), GTA V (~4 155 Befehle, LOD-Ringe, Nebel), HLOD/World Partition, Interior Mapping, Horizon (Setzung als GPU-Funktion); Cities Skylines 2 als Warnung (36 M Dreiecke, 72 % Schatten) | Kosten folgen dem Schirm, nie der Hauszahl; drei Ringe |
| Arena | Neben-Wienie (Matterhorn); das Arena-Labor der Schmiede | Hof, Geräte, Pergola, Torii |
| Mess | Unreal Functional Screenshot Test (Noisy Rendering Features aus, Toleranz, Soll-Bild im VCS), AC Origins (tägliche Welt-Tests), Epic AutomatedPerfTesting | ein Boot fährt alle Stationen, Rauschen gehalten |

## 10 · Risiken

1. **Haupt-Faden (E, CPU-Takt).**
   - Genesis Third liegt schon vor jedem Akteur bei 6,5 ms > 5,8 (z106).
   - Jeder Akteur kostet den Faden: ein Tier-Leib ~0,6 ms, der Bewohner-Takt an der Stadt bis 5,9 ms, dazu die Wagen.
   - Ohne den Schnitt von e-takt am Sockel (≤ 4,0 ms) hält E an keiner Sektor-Station.
   - Gegenmittel: Akteure außer Blick oder > 60 m ruhen als Zahl. Höchstens 1 Tier-Leib und 4 Bewohner-Leiber, ferne Wagen nur jeden
     8. Schritt. Jede Zone misst ihren ms-Anteil vorher↔nachher.
2. **Ankunft (B).**
   - Der Plan liegt auf dem kritischen Pfad: Ort-Wahl und Erdbau müssen vor dem ersten Chunk stehen.
   - K2 verbietet jedes Nachwachsen im Kegel.
   - Das Start-Dorf hält das Bild heute ohne Blick-Prüfung.
   - Gegenmittel: der Plan ≤ 50 ms im Faden; im Kegel nur Kern, Allee und Brunnen in billigster Stufe; das Start-Viertel außer Blick und
     der dorf-Term an ankunft-5 übergeben. Die Kalt-Zeile ist das Tor jeder Zone.
3. **Vergleichbarkeit und Apparat.**
   - Der Platz-Merge bricht 4 Ratschen, die Punkte-Reihen genesis-* und die Tor-Posen.
   - 48 der 92 ROT-Zellen sind heute Rauschen.
   - Neue Akteure heben das σ im ABAB.
   - Gegenmittel:
     - Vor-Commit 0a.
     - Ort 0/0 ± 1 m und Blick −x bleiben fest.
     - Akteure fest aus EINEM Samen und im Schuss gehalten.
     - Re-Mint in derselben Welle.
     - mess läuft vor allen Zonen.

**Weitere Risiken:**
- **VRAM:** Third steht heute bei 122,2 > 118 MB. Der Platz bleibt netto ≤ 0, den Überzug trägt E.
- **Klasse bau:** 40 / 60k tragen Tore und Wagen nicht. Die Wagen müssen in den Bau-Satz (strecke/vehicle), die Tore auf L2 in der Ferne (tore).
- **Datei-Stau:** ort-plan startet erst, wenn studios-heim2, z108, ankunft-3/-5 und gras-saum gelandet sind.
- **Tafel-Lücken:** Sie füllen Zellen ohne Maß; ein gesenktes Soll sind sie nicht.
- **Die Arena** trägt keinen Pflicht-Eintrag. Sie kommt zuletzt und nimmt keinem A/B/C/E-Arbeiter Budget.

## 11 · Lehren der letzten Abgaben (vorher↔nachher, in jedem Brief)

**Gutes Muster: genesis-tore** (Cloud, 4ec9f71d):
- Abgabe mit Bild vorher/nachher (Radeon).
- ABAB z106 nicht-langsamer.
- Der Kern blieb byte-gleich, bis auf den Re-Mint von 24/37 uv.

**Fehlschläge und ihre Regel:**

| Abgabe | was geschah | Regel |
|---|---|---|
| mensch-kopf (Cloud) | z107 riss nach 90 min (351× keine L2-Gestalt) | jede Laufzeit-Abgabe fährt `npm run playtest:fast` am Merge-Kandidaten, bevor sie gemeldet wird |
| ankunft-3 | Kalt-Zeile schneller, aber K2 öfter halb (3/4 statt 1/3) | K2 zählt vor dem Landen |
| b-panorama | swiftshader 8,0 → 5,3 s, auf der GTX kein früheres Weltbild | ein Gewinn zählt nur am echten Gerät |
| a-spawn-gtx | lief mit leerem Skript und meldete Exit 0 | jede Station prüft ihre Eingabe und bricht leer ROT ab |
| b-streu | Streu-Faden 1,0–1,4 → 0,23–0,30 s, Kontrolle 20,7 → 17,8/18,9 s (GTX) | ein Faden-Schnitt trägt, wenn er am echten Gerät gemessen ist |

## 12 · Vor dem Versand (Koordinator)

- **Vorher-Bilder** nach koordination `bericht/pruefplatz/vorher/` committen. Die Briefe nennen sie dort; Cloud-Sitzungen sehen kein %TEMP%.
  - `inventur/gegenwart-genesis-ego-auge.png` → `genesis-ego-alt.png`
  - `inventur/spawn-third-0.5-laub-0.png` → `spawn-third-alt.png`
  - `inventur/spawn-third-wahl-fell-90.png` → `scheibe-third.png`
  - `inventur/spawn-third-wahl-wasser-225.png` → `teile-tore-third.png`
  - `../blick-tore-bild/genesis-ego-nach.png` → `genesis-ego-tore.png`
  - `inventur/gegenwart-stadt-wagen.png` → `stadt-wagen.png`
  - `inventur/gegenwart-stadt-platz.png` → `stadt-platz.png`
  - `inventur/gegenwart-wiese-ego.png` → `wiese-ego.png`
  - `inventur/gegenwart-waldrand-ego.png` → `waldrand-ego.png`
- **Port-Bänder** in `w3/port-baender.txt` eintragen: 4560–4569 ort-plan, 4660–4669 mess, 4670–4679 grund, 4680–4689 stadt.
- **Wache:** die lokalen Zweige in `WACHE_STILL`, die Cloud-Zweige nicht.
- **Stau:** vor dem Platz-Zug (ort-plan) den Stau buchen, denn die Reihen genesis-* beginnen neu.
