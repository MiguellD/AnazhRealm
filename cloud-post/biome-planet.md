# biome-planet 1 — Vorprüfung (ZWISCHENSTAND)

Zweig `biome-planet` auf main 38194f83, Sprosse `karte2.leben.pflanzen.biome#4` („ein Planet ~10⁸ km², mit Mangrove, Moor,
Küstenwüste · Kontinentalgefälle, Regenschatten · Preis P · Orbit"). Diese Abgabe bucht keine Sprosse; gebucht wird, was der Richter
grün misst. Karte 2 gebucht 137 von 1 718 (`vision/karte-2-stand.json` im Zweig `punkte-maschine`, Stand 2fd289bb).

## Geschnitten

Der Chokepoint ist die EINE Rechnung des Wuchses im Kern (`planet-core.js` `pflanzenDeckung`), die der Atlas (`biomFarbe`), der
Anker (`planetAnker`) und der Ort (`planetOrt().wuchs` → voxel-worker `planetOrtAuftrag` → `delta.wuchs`) lesen.

- **Die Wurzel: zwei Verdunstungen.** Der Abfluss rechnete Turcs eigenes L(T) = 300 + 25T + 0,05T³, die Deckung `400 + 45·T⁺`.
  Im kalten Inneren sah der Abfluss Überschuss (N 238 mm bei −8,8 °C: 186 mm), die Deckung desselben Orts Trockenheit
  (N/PET 0,59) — 80 von 81 Fehl-Orten der Station. Jetzt EINE PET für Trocken-Zuschlag, Abfluss, Deckung und Wasser:
  **Holdridge 1967**, PET = 58,93 mm/K · Biotemperatur (12 Monate des Jahres-Gangs, je Monat in [0, 30] °C). Der Abfluss ist
  **Pike 1964**, E = P / √(1 + (P/PET)²) (`aetPike`, EIN Leser für Klima und Linse). Gemessen gegen Thornthwaite 1948: die Spende
  der Heimat fiel auf 229 mm (das Spiel trägt 328,5), Station 84,9 %; Holdridge trägt 335 mm wie main.
- **Der Wald am Überschuss.** `wald` liest den Abfluss desselben Orts (Stephenson 1990: Biome aus AET und Defizit; halb bei
  50 mm/a) × die Baumgrenze am 10-°C-Sommer **auf Meereshöhe** (Köppen 1936, Körner & Paulsen 2004) — im Rahmen, in dem der Ort
  reist (`delta.klima` ohne Lapse); die Höhe trägt das Spiel an seinem Gelände (phyto-core `forestWaldgrenze`). Eine Grenze am
  Planeten-Gipfel zählte die Höhe doppelt (Station 93,7 → 85,5 %, gemessen und verworfen).
- **Die Zeilen des Lebensraums** (`LEBENSRAUM`, je Zeile eine Quelle mit Zahl):
  - *Mangrove*: kältester Monat ≥ 20 °C (Walsh 1974, Duke 1998), ≤ 30 km von der Küste (je Seite), in der Küsten-Ebene des
    16-km-Reliefs (Alongi 2002: Gezeiten-Zone). 0,05 % des Landes — Erde 0,09 % (Giri et al. 2011: 137 760 km²).
  - *Moor*: P/PET 1,5…2,5 × Kühle × Wuchs-Wärme (Charman et al. 2013) × flacher Grund (Gallego-Sala & Prentice 2013; Yu et al.
    2010), im Rahmen der Reise. 1,66 % des Landes — PEATMAP 2,84 % (Xu et al. 2018); die Feuchte-Kante ist unempfindlich
    (1,66…1,75 %). Das Hochmoor ist baumarm: Wald × (1 − 0,7 · Moor) (Succow & Joosten 2001).
  - *Küstenwüste*: arid (UNEP 1992, P/PET < 0,2) über kaltem Rand-Strom, landein mit dem Nebel abklingend (Seely & Henschel
    1998). 0,62 % des Landes; sie nimmt die Krautschicht.
  Der Atlas tönt sie (Gezeiten-Wald dunkelgrün, Moor olivbraun, Nebelwüste grauweiß); der Faden sendet sie absolut
  (`lebensraum`, dazu `biom`: Köppen, Hauptklasse, Whittaker) — kein Δ, ihr Leser ist die Station.
- **Ohne warmen Monat** (PET 0) wächst nichts: P/PET ist 0, nie 0/0.
- **Die Linsen wandern mit** (`scripts/diag-planet.cjs`): `pet.eine` zählt die Holdridge-Formel; `wasser.trocken` fragt `pet > 0`;
  `farbe.stetig` treibt die Farbe über die Deckung; `ort.frage.bytes` neu eingefroren (vorher b1545ac3 / 34fd43fc, nachher
  9c5f0a85 / 697ddec1, je Feld gezählt im Kommentar); `anker.jede-saat` neu gedruckt (ocd04u und w49s5c tragen bei 512 Proben
  einen Anker, 21x0cu und 26z7ei treten ein: 5 von 6 000 Saaten, 0,083 %). VERSION planet-h2-15, Relief-SHA erde-09 bit-gleich.

## Gemessen

**Der Stations-Rumpf headless** (k2-leben S3–S6 wörtlich: Punkt-Sätze aus dem q()-Strom, `ref`/`spiel`/`passt`/`kappa`; der Kern
statt des Fadens, 351 Land-Punkte der Kugel, 229 des Kontinents, 100 Saaten × 12):

| Maß | vorher (main 38194f83) | nachher | Soll |
|---|---|---|---|
| S4 passtProzent | 76,923 % | **99,430 %** | ≥ 90 % |
| S3 κ Kontinent | 0,317 | **0,863** | — |
| S5 vorhersagbar | 43,2 % | **58,1 %** | — |
| S6 konsistenz | 82,385 % | **86,992 %** | — |
| Anker der Heimat | −50,51° / −98,27° | bit-gleich, Wald 1, Spende 335 mm | — |
| Endsee-Land (B3) | 27,4 % | **22,1 %** | [10, 30] %, Erde ~18 % |
| Abfluss ins Meer (B3) | 22 909 km³/a | **27 102 km³/a** | [18 600, 74 600], Erde ~37 000 |

Zwischenschritte am selben Rumpf: nur die EINE PET (400 + 45·T⁺ in Turc-Pike) 93,73 % — aber Endsee 36,6 % und Abfluss 18 475
ROT; Pike genau 87,7 %; Holdridge mit Wald aus N/PET 76,1 %; Wald am Überschuss ohne Rahmen des Moors 91,2 % (die Heimat ein Moor).

**Bilder** vorher | nachher, Schicht `biom` des Atlas (`biome-planet-bild/`): `orbit-vor-nach.png` (der Planet 512 × 256),
`mangrove-vor-nach.png` (−6,11° / −46,38°, 600 km), `moor-vor-nach.png` (47,65° / −93,61°), `kuestenwueste-vor-nach.png`
(27,45° / 136,68°). Gesehen: der dunkle Gezeiten-Saum an der warmen Küste, die olivbraune Moor-Ebene, der grauweiße Nebel-Saum
vor der Wüste; das kalte Innere trägt grün, wo es Wasser übrig hat.

**Tore:** `node scripts/diag-planet.cjs` GRÜN · `--anker` GRÜN · `--anker --selftest` GRÜN · `--selftest` GRÜN bis auf
`welle1.basis` (der Klon ist flach: `git show b7ed8419` fehlt, auf main ebenso) · `gate:worker-dichte` GRÜN (Anker 25,1 s, Anker-Selbsttest 12,2 s) ·
`npm run check:statik` GRÜN (ganz) · `npm run format:check` GRÜN (20,6 s).

## Stations-Kandidat (nur am Leser)

`biome-planet-station/k2-leben-s4.diff`: die Zeile der Station liest `lebensraum` (mangrove, moor, kuestenwueste) aus der Antwort
`planet-ort`; S4 meldet `lebensraumProzent` (Anteil des Lands ≥ 0,5); headless am Rumpf: Mangrove 0 %, Moor 0,28 %,
Küstenwüste 0,85 % von 351 Land-Punkten (die Mangrove ist für 351 Punkte zu selten: 0,05 % erwartet 0,2 Punkte). Das „nicht" nennt
die Orbit-Pose.

## Ehrlich offen

- **orbitAehnlich ungemessen.** Das Spiel zeichnet den Planeten nicht aus der Ferne: `planetKarte` liest nur
  `scripts/diag-planet.cjs`; `AnazhHuelle.kugel` ist die Kamera um ein Werk, keine Kugel des Planeten. Eine Orbit-Pose braucht
  einen Leser des Atlas im Spiel und ein Referenz-Mosaik (Blue Marble) im Baum — beides fehlt; die Orbit-Bilder hier sind der Atlas
  des Kerns.
- Moor 1,66 % gegen PEATMAP 2,84 % (−42 %); Mangrove 0,05 % gegen 0,09 %.
- S5/S6 (fremde Saaten) stehen unter 90 %: jede Saat trägt die Spende ihres Ankers gegen die 328,5 mm der Heimat.
- Das Spiel liest `lebensraum` noch nicht (keine Gestalt der Mangrove, kein Moor-Boden); Moor und Nebelwüste wirken über Wald und
  Decke (`delta.wuchs`).
