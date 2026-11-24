# spiegel-eis 3 — Abgabe (ZWISCHENSTAND)

Eine Sprosse der Meisterkarte 2: `planet.wasser.eis#2` (das Eis setzt nach der Frostgrad-Summe der Feldregel ein). Karte 2 aus `vision/karte-2-stand.json` im Zweig `punkte-maschine`: 82 von 1 718 gebucht.

Steg und Boot am Ufer (Sprosse `planet.kopplung.siedlungslage#1`) verlassen diesen Zweig ganz: ihre Gestalt waren Kästen aus einer von Hand gesetzten Vorlage, kein Gesetz, und die Pipeline-Abnahme nannte beide Vorlagen als Waisen des Stammbaums. Sie liegen in einem lokalen Zweig; ihre Gestalt kommt dort aus einem Gesetz des Fahrzeug-Studios.

## Geschnitten

- **Das Eis-Gesetz** (gelaende-core.js `eisDicke`) bleibt h²/2k + h/H, Wachsen und Schmelzen über dasselbe H, jetzt mit der Quelle: Ashton 1989, „Thin ice growth“, Water Resources Research 25(3), 564–566 (H_ia 10–30 W/(m²·K)). H = 13 statt 20, geeicht an der Feldregel (1 Zoll je 15 °F·d): mit k = 2,2, ρ = 917, L = 334 kJ/kg trägt das Eis (5 cm) nach 15,65 K·d ab dem ersten Eis. H = 12 gäbe 16,78 K·d (+6,9 %), darum 13. `_eisAt` liest die Dicke des Gesetzes (`_eisDickeAt`) statt der log-interpolierten Linie.
- **Die Linse** scripts/diag-wasser-leben.cjs `--selftest`: N2 EIS gegen das feste Soll 15,7 K·d (liest den Kern nicht). Die Mutanten setzen am Eingang des Gesetzes an, der Schmelzwärme L des Stoffs: L × 0,695 (die Summe von H = 20) fällt ROT bei 10,28 K·d, L × 0,22 (die Summe des einfachen Stefan ohne Übergang) fällt ROT bei 3,21 K·d. Am main fällt sie ROT mit `_eisDickeAt is not a function`.
- **Die Station**: `pm-spiegel-eis` ändert nur meisterkarte-quelle/punkte/stationen/k2-planet.js im Zweig `punkte-maschine` (eis#2): die Summe zählt stündlich ab dem ersten Eis, Soll 15,7 K·d ± 20 % (Gold 1971 4,8 cm ÷ Feldregel 2,54 cm je 8,33 K·d). Die Station zu siedlungslage#1 steht wieder auf dem Stand von `origin/punkte-maschine`.

## Gemessen (node am Wirt, gleiche Bedingung)

| Sprosse | Akte | vorher main c9da3a64 (H = 20) | nachher spiegel-eis 3 (H = 13) |
|---|---|---|---|
| eis#2 fddEinsetzen, Median der Heimat | 18,49 K·d (9d4319c0) | 10,24, 0 von 8 im Band | 14,79, 8 von 8 im Band (Soll 15,7 ± 20 %) |
| eis#2 See 1816/−6168 | — | 12,31 K·d, erstes Eis → tragend 197 h, Eis-Ende Tag 40, trägt 124 Tage | 14,83 K·d, 225 h (9,4 Tage), Eis-Ende Tag 46, trägt 129 Tage |

Nebenwirkung: mit H = 13 schmilzt das Eis langsamer, das Eis-Ende des Sees rückt von Tag 40 auf Tag 46. Die Familie: gate:gegenstand-stoff (selftest, Lauf, `--tafel`, `--gesetz`) GRÜN; die Kante E4 der Browser-Linse wasser-leben verlangt ≥ 2 Tage vom ersten Eis zum tragenden (jetzt 9,4).

## Offen

- eis#2 · Messname `fddEinsetzen` · Leser `_eisLinien`/`_eisDeckung` (stamm/bild-sicht.js, stamm/gelaende-fern.js): das Bild deckt nach der Linie aus vier interpolierten Knoten der Säule; gegen `_eisAt` geht das Bild bis zu 39 h vor oder nach (Säulen 1–15 m), mit acht Knoten wären es 18 h. Der Shader-Schnitt braucht das GPU-Auge und ist nicht gebaut.

