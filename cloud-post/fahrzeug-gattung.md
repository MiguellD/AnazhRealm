# Vorprüfung fahrzeug-gattung — das Boot am Anleger aus dem Gesetz des Fahrzeugs, der Steg aus dem Zimmerwerk

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 83 von 1 718 (Stand `vision/karte-2-stand.json` im Zweig
`punkte-maschine`; diese Abgabe bucht keine Sprosse, gebucht wird, wenn der Richter sie grün misst). Zweig `fahrzeug-gattung`
auf main 5ef0404b.

**Die Stufe:** der Anleger am Dorf am Wasser, der Steg und das Boot. Der Leiterwagen steht als Gattung im Kern und im
Asset-Vertrag; im Spiel steht er noch nicht (siehe Offen).

**Geschnitten:** `vehicle-core.js` trägt zwei neue Gattungen im EINEN Gesetz (PRESETS `boot`, `karren`, derselbe Durchgang
`epocheForm` → `gattungForm`, derselbe Bau `baueFahrzeug` → TOPO). Der Rumpf des Boots ist eine Funktion seiner Eingänge
(`bootRumpf`: Welle Hs, Last, Brettbreite), die Welle eine Funktion der Streichlänge (`bootWelle`, JONSWAP). `fachwerk-core.js`
trägt das Werk `stegfeld` (Art `steg`) auf der Maschine des Jochfelds (`jochBau`). Der Wirt legt am Dorf am Wasser den Anleger
(`_anlegerLegen`: der Steg reicht bis an das tragende Wasser, das Boot trägt seine Welle als Stempel). Ein Werk, dessen Bauplan
erst mit dem Buch geboren wird, wartet auf die Geburt (`_wartetAufBauplan` → `_wartendeTreten` in
`_foundryAutoRegisterSpecies`), statt still auszufallen. Die Kasten-Vorlagen `steg_anleger`/`boot_anleger` des Zweigs
anleger-gestalt sind nicht übernommen.

## Sprosse `karte2.planet.kopplung.siedlungslage#1` (der Spiegel + 1 m, 100 % der Leser folgen)

| Maß | main 5ef0404b | diese Abgabe |
|---|---|---|
| Anleger am Dorf am Wasser (Radeon, Dorf 15012/−9561) | keiner | Steg 2 Felder (7,4 m), Boot `fahrzeug_boot` |
| das Boot folgt dem Spiegel + 1 m (N1, node) | — | Hub 1,000 m, Bild 1,000 m; Mutante „eingefrorener Spiegel“ ROT |
| Leser Steg/Boot in der Station | 0 + 0 (fest) | 0 + 0 (fest, die Station liest sie nicht) |

## Sprosse `karte2.mensch.fahrzeug.gestalt#1` (≥ 5 Fahrzeug-Typen, ein Wagen am Messort stadt-voll)

| Maß | main 5ef0404b | diese Abgabe |
|---|---|---|
| Gattungen im Kern (`GATTUNGEN`) | 6 | 8 (+ boot, karren) |
| Flotte der Stadt (`flotte(21)`) | 6 Gattungen | 6 Gattungen, byte-gleich (boot und karren tragen keinen Anteil an `FLOTTE`) |
| Asset-Vertrag v3 | 20 Fälle | 27 Fälle, die 20 alten byte-gleich |

Die Messung der Station (30e01e75, 3 Typen) lag vor der Landung von w28-fahrzeug-gattungen (1feab29c); auf main fährt die Stadt
schon sechs Gattungen, der Richter misst neu.

## Tris und Stoffe je Gattung (Stufe 0 / Stufe 1)

| Werk | Tris | Stoffe |
|---|---|---|
| Boot, Kahn (Hs ≤ 0,3 m) | 1 556 / 796 | 2 |
| Boot, Spitzboot (Hs > 0,3 m) | 4 916 / 2 484 | 3 |
| Leiterwagen | 5 388 / 2 168 | 3 |
| Stegfeld (Steg) | 1 268 / 132 | 14 Teile |

## Ursache je Merkmal (welcher Eingang der Welt es speist)

| Merkmal | Ursache | Eingang | Gemessen / Leser |
|---|---|---|---|
| Form des Rumpfs: Kahn ↔ Spitzboot | ruhiges Wasser erlaubt den Plattboden aus breiten Brettern, welliges verlangt Kiel und Klinker | Hs aus der Streichlänge (`_anlegerStreich` → `bootWelle`) | A9 Gegenprobe: Hs 0,1 → 0,5 m: Höhe 0,61 → 1,11 m, Ecken 940 → 2 872; Mutante `hs = 0.1` ROT |
| Länge, Zahl der Duchten | eine Ducht je Sitzendem | Last (kg) | A9: 200 → 400 kg: 8,23 → 11,07 m; Mutante `last = 200` ROT |
| Seitenhöhe, Zahl der Gänge | der Bord steht über Tiefgang + Welle, die Seite ist die Zahl der Bretter × ihre Breite | Hs, Brettbreite, Archimedes | Kahn: EIN Brett je Seite (0,43 m bei 110°) |
| Tiefgang am Steg | Archimedes, die Masse der Bretter | Masse (Eiche 700 kg/m³) | Tleer 0,080 m, beladen 0,143 m |
| Höhe der Bahn des Stegs | dieselbe Welle wie der Rumpf, mindestens der Freibord `fMin` | Hs, Spiegel | im Spiel F 194 m, Hs 0,057 m: Bahn 0,20 m über dem Spiegel |
| Länge des Stegs | er reicht über die Flachwasserzone, bis das Wasser das Boot trägt | Säule unter dem Steg | 2 Felder |
| Lage des Boots | es schwimmt am Spiegel, den der Fuß liest | `_koerperWasser` je Takt | N1 Hub 1,000 m, Mutante ROT |

## Quellen mit Zahl (Band)

- Fischerschelch vom Main (Keweloh 1995/1996): L 8,17–8,36 m, B 1,04–1,16 m, Boden 0,66 m, Seite EIN Brett 0,43 m × 25 mm bei 110°,
  Seitenhöhe 0,39 m, Duchten 0,2 × 0,03 m. Gesetz: L 8,29 m (3 Duchten), B 0,96 m (über dem Dollbord gemessen fehlen 8–20 cm: offen unten).
- Imsumer Boot (Sahr): Spanten 0,75–0,9 m, 5–6 Gänge, Planken 1–2 cm. Gesetz Spitzboot: 6 Gänge, Spant 0,8 m, Planke 16 mm.
- Hardanger 5,6 m mit 2 Ruderern, Sunnfjord 6,6 m mit 4 (Sahr). Gesetz: 6,6 m mit 3 Duchten.
- JONSWAP (Hasselmann 1973): g·Hs/U² = 0,0016 (g·F/U²)^½, gedeckelt bei 0,243. Wind 8 m/s: F 895 m → Hs 0,122 m.
- Zugtier (FAO-INNS): Dauerzug 12–14 % des Leibs beim Pferd. Gesetz 800 N bei 600 kg.
- Steg: Fuge ≥ 4 mm (Gesetz 8 mm), Träger-Abstand ≤ 0,6 m (Gesetz 0,4 m).

Unbelegt und beim Namen genannt (Annahmen im Gesetz, nie geschätzt als belegt): `fMin`, `beiwerk`, `spitzAb`, `sitzM`, `cb`, `lwl`,
Freibord und Tiefgang nur aus der Rechnung (Boot); alle Steg-Maße außer Fuge und Träger-Abstand (`jochM`, `lichtM`,
`gelaenderM`, `pfahlM`); alle europäischen Maße des Leiterwagens.

## Bild (Radeon, 640 × 360, gleiche Kamera 14919,03/−0,80/−9346,52 → 14911,59/−2,80/−9341,92, fov 40, Mittag)

- vorher (main 5ef0404b): `scratchpad/bild/fest/anleger-vor.png`
- nachher (diese Abgabe): `scratchpad/bild/fest/anleger-nach.png`

BILDURTEIL

## Offen, mit Leser

| Was | Grund | Messname | Leser |
|---|---|---|---|
| Steg und Boot zählen in der Station nicht | `k2-zusammenspiel.js:207` addiert Steg und Boot als feste 0 | `leserProzent` | Station `planet.kopplung.siedlungslage#1`, Zweig `punkte-maschine` |
| der Leiterwagen steht im Spiel an keiner Scheune | Eingang: das Tor der Scheune (`slot.tuer`, Plan `hof:scheune`); am Dorf trug der Platz vor dem Tor beim Heben der Scheune die Bau-Wand (`_bauFrei` false an 8 von 8 Scheunen), Sekunden später frei (5 von 6) — der Täter der Wand ist unbenannt | `typen`, `bauFreiAn` | Station `mensch.fahrzeug.gestalt#1` |
| die Breite des Kahns 0,96 m gegen 1,04–1,16 m | das Gesetz rechnet die Breite am Bord ohne Dollbord-Überstand | `B` | `gate:vehicle-drive` A9 |
| die Räder des Leiterwagens: europäische Maße unbelegt | nur US-Museumsmaße | `radR`, `radVorn` | FUND-REGISTER (Zweig koordination) |
| das Boot trägt den Spieler nicht über das Wasser | das Fahr-Gesetz kennt kein Medium Wasser für die Gattung | `exportDrive` | `gate:vehicle-drive` |
