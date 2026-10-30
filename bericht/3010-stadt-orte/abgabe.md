# w4-stadt-orte — die erste Welle der Orte im Stadt-Gesetz (Zwischenstand 30.10.)

Zweig `claude/festive-hawking-6b9aa9` (Abgabe auf integ-probe V18.546.132), Stationen auf `w4-stadt-orte-koord`.

**Geschnitten:** Das Stadt-Gesetz (`fachwerk-core.js`) trägt jetzt EINE Straßen-Hierarchie (haupt · gasse · feldweg), Quartiere mit
Rolle und zwei Orte mit Rolle am Rand jeder Stadt: den Rundkurs (eine geschlossene Bahn auf EINER Ebene) und das Gehege (eine
Wiese im Zaun mit Aussicht). Der Wirt liest die Fläche je Rolle über EINE Registratur (die Formen der Wege-Karte mit `rolle`):
die Natur-Wand, die Geburt und die Engstelle des Felds (`dslEvalPos`) halten sie frei, das Gehege setzt und hält seine Herde.
**Gemessen:** siehe Tafel; die Welt-Zahlen am Null-Renderer (Lauf 6/7, `welt-null-lauf*.log`), die Linse `diag-settlement` Teil R
mit Selbsttest. **Ehrlich offen:** Rundkurs in 12 von 14 Städten (86 %); Welt-Bilder headless nicht erreicht; Pflicht-OFFEN A, B,
C, E unverändert.

| Ort | Gesetz-Wurzel (Datei:Zeile) | Zahl vorher → nachher | Bild |
|---|---|---|---|
| Straßen-Rang („dorf 7 120") | `fachwerk-core.js:4524` STRASSEN_RANG · Verkehr `:3951` · Gehweg `stamm/siedlung-bewohner.js:1496`, `stamm/siedlung-verkehr.js:162` | Wege mit Rang 0/29 → 29/29 (11 Hauptstraßen 450 m · 18 Gassen 961 m); der Verkehr fährt dieselben Wege, jetzt am Rang statt an der Breite 4,9 m (an der Rang-Stadt 207 m, die Mutante „alle Wege gasse" 0 m) | `stadt-vorher.png` → `stadt-nachher.png` |
| Häuser an einer Straße | (unverändert: die Häuser sind byte-gleich) | 94,6 % → 94,6 % (87/92), davon an einer Hauptstraße 27/92 | — |
| Quartiere | `fachwerk-core.js:4538` stadtQuartiere | 0 → 11 (stadt: Kern · 4 Wohnen · 4 Vorstadt · Rennen · Tiere), 10 (stadt-voll), 5 (Gipfel-Metropole) | `stadt-voll-nachher.png` |
| Gewerbe | `fachwerk-core.js:4538` (EIN Quartier: die meisten Hallen) | erreichbar 0 von 14 Städten (Schwelle 0,3; stärkstes Viertel der Moderne 16/70) → Gipfel-Metropole 19/105 (50 Hallen), die Moderne 16/70 | `moderne-nachher.png` |
| Rundkurs | `fachwerk-core.js:4633` ORTE_GESETZ · `:4762` stadtOrte · `:4643` bahnEbene · ortPlan `:9020` | 0 → 12/14 Städte (86 %); fehlen laut: Gipfel-Metropole 2,−14 und Großstadt 2,11; Rest des Grunds um die Ebene ≤ 1,34 m (Soll ≤ 6,5) | `stadt-nachher.png` |
| Gehege | `fachwerk-core.js:4633` · `:4693` gehegeSicht | 0 → 14/14 Städte; Sicht der Aussicht 1,0 (25/25 Punkte, Soll ≥ 0,91) | `stadt-nachher.png` |
| Zufahrt | `fachwerk-core.js:4633` (zufahrtM 500) | 15/20 Orte bei 180 m → 26/26 (alle Städte der Welt) | alle Karten |
| Abstand der Orte zum Plan | Teil R `scripts/diag-settlement.cjs:951` | — → ≥ 23,0 m zu jedem Grundriss, Weg, Feld, Platz, Mauer (Soll ≥ 1,17) | — |
| Würfe des Felds auf Rundkurs und Gehege (Welt) | `stamm/feld-dsl.js:389` · `stamm/vegetation-baum.js:1782` · `stamm/siedlung-wege.js:1064` | kein Ort → Natur 0, Würfe 0, Tiere aus Wurf 0; Natur-Wand und Geburt halten 1600/1600 + 225/225 Raster-Punkte; Nexus `at` 50/50 abgewiesen; 2000 Fernwürfe: 168 an der Rolle abgewiesen, 0 auf einem Ort | — |
| Herde frei im Blick (Welt) | `stamm/kreatur-leben.js:1823` · Zaun `stamm/kreatur-verhalten.js:1408` · Bestand `stamm/kreatur-leben.js:2354` | 715754fc GTX: in 14 Posen kein freier Blick → 7/7 Tiere fliehen im Zaun, 0 Takte außerhalb, der erste Schuss 45,0 m (Fenster 40–50 m) | GPU nach der Abgabe (Station tiere.K1#2) |
| Rundkurs gefahren (Welt) | `bericht/3010-stadt-orte/tempo5.js` (fahrzeug.K3 #1/#2) | Weg der Probe über die Mess-Wiese → Rundkurs der Stadt: Gerade 240 m, Natur auf der Bahn 0, Stoß 0 (Unfall 0), vmax 15,38 m/s, FOV +9,6°, Arm +18,6 % | GPU nach der Abgabe |

## Die Wände (Stand nach dem Merge von integ-probe V18.546.132)

`check:statik` (darin die DECKE: scripts −59 Atome, die Zahlstelle −3224 bezahlt Teil R +3165), `gate:welt-boot`, `gate:haus-fern`,
`playtest:fast`, `diag-settlement` (Selbsttest und voll), `diag-fahr-leben --verkehr` — Zahlen im Abgabe-Commit.

## Ehrlich offen

- **Rundkurs 12/14 (86 %):** an der Gipfel-Metropole (Rest 6,7 m > 6 bei 4 % Gefälle) und der Großstadt 2,11 trägt kein Ort in vier
  Stufen die Bahn; mit zwölf Stufen läge er 755 m und 354 m hinaus — die Wahl entscheidet die Weite noch nicht, der Export nennt die
  beiden laut (`orteFehlen`).
- **Bilder:** die vorher-Bilder des Koordinators lagen bis 05:02 UTC nicht unter `bericht/3010-stadt/`; die nachher-Bilder hier sind
  die Karten des Gesetzes (headless). Welt-Bilder headless: die Werkbank (swiftshader) schwingt die Stadt nicht ein (Ring 2 nach
  5 min), der Null-Renderer zeichnet nicht (`__ausgabeAufnahme` fehlt) — die GPU-Bilder fährt der Koordinator.
- **Kriterium-Text:** tiere.K1#2 heißt in der Karte noch „Herde am Hang"; die Station misst seit dieser Welle am Gehege.

## Die Proben (hier, reproduzierbar)

`orte-null.cjs` (Null-Renderer-Harness, „dorf 7 120" am Messort stadt) mit `herde-ort.js`, `orte-welt.js`, `tempo5.js`;
`plan-karte.cjs` (die Karten vorher ↔ nachher, alter Kern aus `git show 88da99be:fachwerk-core.js`); `orte-zensus2.cjs`,
`zufahrt-probe.cjs`, `quartier-zensus.cjs`, `ist-stadt.cjs` (die Zählungen über die Städte der Welt).
