# spiegel-eis — Abgabe (ZWISCHENSTAND)

Zwei Sprossen der Meisterkarte 2: `planet.kopplung.siedlungslage#1` (Steg und Boot folgen dem EINEN Spiegel) und `planet.wasser.eis#2` (das Eis setzt nach Stefan ein).

## Geschnitten

- **Der Anleger** (stamm/wasser-hydro.js `_anlegerOrt` · `_anlegerLage` · `_anlegerLegen` · `_anlegerTakt` · `_schwimmTiefgang`, Konstante `AnazhRealm.ANLEGER`): am Ort sucht er das Ufer, an dem das Wasser Tiefgang + 15 cm Luft hat, und legt einen Schwimmsteg und ein Boot (stamm/bau-vorlagen.js `steg_anleger`, `boot_anleger`, Tiefgang aus der Stoff-Dichte: Steg 0,494 m, Boot 0,052 m). Je Schritt (stamm/dirigent-takt.js `_stepFixedSim`) schwimmen beide am Spiegel, den der Fuß liest (`_koerperWasser`), samt Blocker und Bild. Gelegt am Dorf-Erlebnis (stamm/siedlung-ort.js).
- **Das Eis-Gesetz** (gelaende-core.js `eisDicke`): Stefan h = α·√FDD mit α = 2,7 cm/√(K·d) (Ashton 1986, windiger See ohne Schnee), gedeckelt vom Ideal der Leitung √(2k/ρL) = 3,52. Der alte Übergang H = 20 W/(m²·K) im Wachstum hatte keine Quelle und trug 80 % des Widerstands. `_eisAt` liest jetzt die Dicke des Gesetzes (`_eisDickeAt`) statt der log-interpolierten Linie (die 1–2 Tage spät trug).
- **Die Linse** scripts/diag-wasser-leben.cjs `--selftest`: N1 ANLEGER (die Mutante mit eingefrorener Lage fällt ROT), N2 EIS (die Mutante mit halbem Beiwert fällt ROT bei 13,1 K·d). Am main fällt sie ROT mit `_anlegerOrt is not a function`.
- **Die Stationen**: `pm-spiegel-eis` a42d6812 ändert k2-zusammenspiel.js S1 und k2-planet.js S2 unter meisterkarte-quelle/punkte/stationen/ im Zweig `punkte-maschine`. S1: Steg und Boot lesen `_anlegerLage`, das Schilf den echten Leser der Nah-Streu an der Wasserlinie, das Auge nimmt die freie Pose (wahl 42) am Anleger. S2: die Summe zählt ab dem ersten Eis, Soll (5/2,7)² = 3,43 K·d. Die alte 13,7 im Zweig `punkte-maschine` setzte 10 cm ohne Quelle an und zählte die Abkühlung der Säule mit — so steht es offen im Commit.

## Gemessen (node am Wirt, gleiche Bedingung)

| Sprosse | Akte | vorher main c9da3a64 | nachher spiegel-eis |
|---|---|---|---|
| siedlungslage#1 leserProzent | 48,4 % (c1236fa8) | alte Station 48,4 % · neue 60 % (Steg/Boot ohne Träger) | 100 % (Steg 2/2, Boot 2/2, Hub 1 m ± 0, Gegenlauf 0) |
| eis#2 fddEinsetzen | 18,49 K·d (9d4319c0) | neue Station: Median 10,24, 0 von 8 im Band; See 12,31 | Median 3,23, 8 von 8 im Band (Soll 3,43 ± 20 %); See 3,247 |

## Offen

- eis#2 · Messname `fddEinsetzen` der fremden Saaten (Fächer) · Leser `_eisLinien`/`_eisDeckung`: das Bild deckt nach der Linie aus vier Knoten der Säule, interpoliert; gegen `_eisAt` geht das Bild bis zu 39 h vor oder nach (an Säulen 1–15 m), mit acht Knoten wären es 18 h. Der Shader-Schnitt (bild-sicht.js, gelaende-fern.js) braucht das GPU-Auge und ist nicht gebaut.
- siedlungslage#1 · Messname `anleger` · Leser `_anlegerOrt`: an der flachen Meeresküste (~0,6 % Gefälle) tragen nur 2 von 50 Uferpunkten einen Anleger in 200 m. Das Bild des Anlegers schießt nur das Gerät.
