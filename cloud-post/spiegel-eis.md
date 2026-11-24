# spiegel-eis 2 — Abgabe (ZWISCHENSTAND)

Zwei Sprossen der Meisterkarte 2: `planet.kopplung.siedlungslage#1` (Steg und Boot folgen dem EINEN Spiegel) und `planet.wasser.eis#2` (das Eis setzt nach der Frostgrad-Summe der Feldregel ein).

## Geschnitten

- **Der Anleger** (stamm/wasser-hydro.js `_anlegerOrt` · `_anlegerLage` · `_anlegerLegen` · `_anlegerTakt` · `_schwimmTiefgang`, Konstante `AnazhRealm.ANLEGER`): am Ort sucht er das Ufer, an dem das Wasser Tiefgang + 15 cm Luft hat, und legt einen Schwimmsteg und ein Boot (stamm/bau-vorlagen.js `steg_anleger`, `boot_anleger`, Tiefgang aus der Stoff-Dichte: Steg 0,494 m, Boot 0,052 m). Je Schritt (stamm/dirigent-takt.js `_stepFixedSim`) schwimmen beide am Spiegel, den der Fuß liest (`_koerperWasser`), samt Blocker und Bild. Gelegt am Dorf-Erlebnis (stamm/siedlung-ort.js).
- **Das Eis-Gesetz** (gelaende-core.js `eisDicke`) bleibt h²/2k + h/H, Wachsen und Schmelzen über dasselbe H, jetzt mit der Quelle: Ashton 1989, „Thin ice growth“, Water Resources Research 25(3), 564–566 (H_ia 10–30 W/(m²·K)). H = 13 statt 20, geeicht an der Feldregel (1 Zoll je 15 °F·d): mit k = 2,2, ρ = 917, L = 334 kJ/kg trägt das Eis (5 cm) nach 15,65 K·d ab dem ersten Eis. H = 12 gäbe 16,78 K·d (+6,9 %), darum 13. `_eisAt` liest die Dicke des Gesetzes (`_eisDickeAt`) statt der log-interpolierten Linie.
- **Die Linse** scripts/diag-wasser-leben.cjs `--selftest`: N1 ANLEGER (die Mutante mit eingefrorener Lage fällt ROT), N2 EIS gegen das feste Soll 15,7 K·d (liest den Kern nicht). Die Mutanten setzen am Eingang des Gesetzes an, der Schmelzwärme L des Stoffs: L × 0,695 (die Summe von H = 20) fällt ROT bei 10,28 K·d, L × 0,22 (die Summe des einfachen Stefan ohne Übergang) fällt ROT bei 3,21 K·d. Am main fällt sie ROT mit `_anlegerOrt is not a function`.
- **Die Stationen**: `pm-spiegel-eis` b964f975 ändert meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js (S1) und meisterkarte-quelle/punkte/stationen/k2-planet.js (S2) im Zweig `punkte-maschine`. S1: Steg und Boot lesen `_anlegerLage`, das Schilf den echten Leser der Nah-Streu an der Wasserlinie, das Auge nimmt die freie Pose (wahl 42) am Anleger. S2: die Summe zählt stündlich ab dem ersten Eis, Soll 15,7 K·d ± 20 % (Gold 1971 4,8 cm ÷ Feldregel 2,54 cm je 8,33 K·d).

## Gemessen (node am Wirt, gleiche Bedingung)

| Sprosse | Akte | vorher main c9da3a64 (H = 20) | nachher spiegel-eis 2 (H = 13) |
|---|---|---|---|
| siedlungslage#1 leserProzent | 48,4 % (c1236fa8) | alte Station 48,4 % · neue 60 % (Steg/Boot ohne Träger) | 100 % (Steg 2/2, Boot 2/2, Hub 1 m ± 0, Gegenlauf 0) |
| eis#2 fddEinsetzen, Median der Heimat | 18,49 K·d (9d4319c0) | 10,24, 0 von 8 im Band | 14,79, 8 von 8 im Band (Soll 15,7 ± 20 %) |
| eis#2 See 1816/−6168 | — | 12,31 K·d, erstes Eis → tragend 197 h, Eis-Ende Tag 40, trägt 124 Tage | 14,83 K·d, 225 h (9,4 Tage), Eis-Ende Tag 46, trägt 129 Tage |

Nebenwirkung: mit H = 13 schmilzt das Eis langsamer, das Eis-Ende des Sees rückt von Tag 40 auf Tag 46. Die Familie: gate:gegenstand-stoff (selftest, Lauf, `--tafel`, `--gesetz`) GRÜN; die Kante E4 der Browser-Linse wasser-leben verlangt ≥ 2 Tage vom ersten Eis zum tragenden (jetzt 9,4).

## Offen

- eis#2 · Messname `fddEinsetzen` · Leser `_eisLinien`/`_eisDeckung` (stamm/bild-sicht.js, stamm/gelaende-fern.js): das Bild deckt nach der Linie aus vier interpolierten Knoten der Säule; gegen `_eisAt` geht das Bild bis zu 39 h vor oder nach (Säulen 1–15 m), mit acht Knoten wären es 18 h. Der Shader-Schnitt braucht das GPU-Auge und ist nicht gebaut.
- siedlungslage#1 · Messname `anleger` · Leser `_anlegerOrt`: an der flachen Meeresküste (~0,6 % Gefälle) tragen nur 2 von 50 Uferpunkten einen Anleger in 200 m. Kein Gerät hat den Anleger gesehen.

## Das Bild des Anlegers (Radeon, ein Lauf, Deckel 180 s, ungeprüft)

```
timeout 180 bash -c 'node scripts/werkbank.cjs start --echt --ort dorf & sleep 75; node scripts/werkbank.cjs umstellen 15012 -9561 && node scripts/werkbank.cjs eval "r._anlegerLegen(15016.5, -9557.2, \"auge\"); return r._anleger.size" && node scripts/werkbank.cjs bild 15012.3 2 -9561.4 15024.3 -2.5 -9549.4 --datei anleger-vor.png --wahl 42 && node scripts/werkbank.cjs eval "r.state.waterLevel += 1; r._anlegerTakt(); return r.state.waterLevel" && node scripts/werkbank.cjs bild 15012.3 2 -9561.4 15024.3 -2.5 -9549.4 --datei anleger-nach.png --wahl 42; node scripts/werkbank.cjs eval "r.state.waterLevel -= 1; r._anlegerTakt()"; kill %1'
```
