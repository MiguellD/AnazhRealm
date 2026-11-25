# Vorprüfung knoten-grossstadt — Knoten der Großstadt: Folge und Vorfahrt aus EINEM Gesetz

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 118 von 1 718 (der Stand der Karte im Zweig
`punkte-maschine`, c5f7265b; diese Abgabe bucht keine Sprosse — gebucht wird erst, wenn der Richter sie grün misst).

**Geschnitten:** Folge und Vorfahrt lesen EIN Gesetz, fachwerk `VERKEHR_GESETZ`: die Folge ist das IDM (T 1,5 s, s0 2 m,
a 0,73, b 1,67), die Vorfahrt ist Lückenannahme nach HCM (t_c, t_f je Strom), der Rang jeder Strecke kommt aus `WEGE_KLASSE`;
der feste `abstandM` der Folge fiel an beiden Stellen (Kern und Wirt). **Gemessen:** stadt-voll 10 Uhr, 600 s: VK ROT (11
Berührungen) → GRÜN, Zeitlücke zum Vorderen 1,9 → 2,74 s (p05 1,78 s), 0 Lücken unter t_c, 0 Folgen unter t_f, Sim-Takt
1,142 → 1,113 ms je Schritt; am Knoten 8>9 Fluss 1 062 → 960 Wagen/h. **Ehrlich offen:** Reisetempo 0,725 → 0,666 (lenker#1
will ≥ 0,8, also 50 % dieser Sprosse); verkehr#2 steht an der Station als „fehlt“ (headless, Kandidat unter
`cloud-post/knoten-grossstadt-station/`), von vier Teilen des Richters sind zwei grün (50 %); kein Bild in der Wolke.

Basis: main 2da17e2e hineingeholt, `git merge-tree --write-tree origin/main HEAD` gibt eine Zeile. Der Zweig stand bei Übergabe
auf tages-gesetz 2 (1d2f7e03, nicht in main); der Kopf von tages-gesetz (347bdb65, Vorprüfung 4) vereint sich mit diesem Kopf
ohne Konflikt (`git merge-tree` gibt eine Zeile). Die Vorher-Messung lief auf c66f2be1 (dieselbe Basis ohne den Schnitt).

## Der Schnitt

Quelle: das Zensus-Kapitel Rang 10 „Knoten der Großstadt“ (`bericht/2511-referenz-zensus/netz.md` im Zweig `koordination`);
die Bänder: IDM nach Treiber, Hennecke und Helbing (2000), die Grenz- und Folgezeitlücken der unsignalisierten Kreuzung nach
HCM (TWSC): Linksabbieger der Hauptrichtung [4,1; 2,2] s, Nebenrichtung rechts [6,2; 3,3], gerade [6,5; 4,0], links [7,1; 3,5].

- `fachwerk-core.js`, `VERKEHR_GESETZ`: die Glieder des IDM und `luecke` [t_c, t_f]; `verkehrsNetz` schreibt je Kreuzung
  `rang` (aus `WEGE_KLASSE`) und `vorrang` [t_c | null, t_f]. Der höhere Rang gewinnt; bei gleichem Rang weicht der
  Linksabbieger dem Entgegenkommenden mit t_c der Hauptrichtung; sonst gilt rechts vor links als REIHENFOLGE: t_c ist null, der
  Wartepflichtige weicht nur einem, der binnen t_f nach ihm selbst ankommt (zugleich). Erst so lief der Markt: mit t_c für alle
  vier gleichen Arme stand Wagen 1 am Westarm 48 s vor 7,1 s Lücke, Reisetempo 0,543.
- `stamm/siedlung-verkehr.js`, `_verkehrVorfahrt`: je Wagen nur der erste Wagen eines Arms (Strom, nie die Reihe), ein
  stehender zählt nur, wenn er fahren kann; die Uhr ist die Uhr der Stadt, die Nähe eine Zellen-Suche je 0,25 s. Die
  Folgezeitlücke t_f gilt nur, solange einer naht (StVO § 8: die Wartepflicht entsteht am Berechtigten). Die Kante „vorfahrt“
  steht im Warte-Graphen, seine Kreise löst `_verkehrKreisDurch`.
- Kein Zwilling, kein Flag: der feste Abstand lebt nur noch als Mutante der Linse (`--mutante-folge`: folgeT 0).

## Gemessen — die Täter-Tabelle am Knoten

Gleiche Bedingungen: stadt-voll (Haushalt), Knoten 8>9 (747/552, Radius 20 m), 10 Uhr, 600 s, `node scripts/diag-fahr-leben.cjs
--verkehr`, null-Renderer.

| Größe am Knoten 8>9 | vorher (c66f2be1) | nachher (dieser Kopf) |
| --- | --- | --- |
| Fluss | 1 062 Wagen/h (177 durch) | 960 Wagen/h (160 durch) |
| mittleres Tempo · gegen Reisetempo | 6,28 m/s · 0,757 | 5,53 m/s · 0,667 |
| Schlange max (mittel) | 3 Wagen, 28,1 m (0,2) | 2 Wagen, 30,3 m (0,17) |
| Abstand Bug an Bug, min | 2,13 m (8\|9 an 748/554, 0,1 s) | 2,20 m (6\|14 an 748/553, 0,3 s) |
| Zeitlücke zum Vorderen, Median | 1,8 s | 2,83 s |
| Lücke Median | 11,95 m | 14,12 m |

Der Knoten 8>9 ist keine Kreuzung, sondern der Bogen vor der Wende (746/573): dort wirkt die Folge, nicht die Vorfahrt. Der
kleinste Abstand steht nun auf s0 des Gesetzes (2,2 m, 0,3 s), ohne Kreis. Der Fluss sinkt um 10 %, weil die Zeitlücke steigt
— das ist das Gesetz (T 1,5 s), nicht ein Stau.

## Gemessen — die Stadt

| Größe, stadt-voll, 600 s | vorher 10 Uhr | nachher 10 Uhr | nachher 23 Uhr |
| --- | --- | --- | --- |
| VK (Leiter mensch.netz.verkehr) | ROT: 11 Berührungen an 838/432 | GRÜN | GRÜN |
| Reisetempo | 0,725 | 0,666 | 0,656 |
| Zeitlücke Median · p05 | 1,9 s · ungemessen | 2,74 s · 1,78 s | 2,63 s · 1,81 s |
| Vorfahrt [genommen, Folgen, gelassen, ein] | ungemessen | [0, 0, 4 294, 220] | [0, 0, 4 398, 216] |
| Arbeit (Soll ≤ 5,25) | 4,15 | 4,25 | 4,43 |
| Sim-Takt je Schritt | 1,142 ms | 1,113 ms | 1,039 ms |
| fahrend je Minute, min | 138 m | 140 m | 130 m |
| Ziele erreicht · längste Fahrt | 164 · 181 s | 152 · 182 s | 150 · 201 s |

Die gelassene Lücke nach wem (10 Uhr): 256 einer Folge, 613 einem Stehenden, der fahren kann, 3 425 einem Strom. Die
23-Uhr-Messung vorher fehlt; die p05 vorher ist ungemessen (die Mutante mit festem Abstand zeigt p05 0,56 s).

## Die Linse (die Fahr-Linse VK, `scripts/lib/fahr-proben.cjs` und `scripts/diag-fahr-leben.cjs`)

- **Neu in VK:** „Zeitlücke zum Vorderen [Median, p05, n]“ (Soll Median 1–3 s, p05 ≥ 1 s) · „Vorfahrt [genommen, Folgen, …]“
  (Soll 0 Lücken unter t_c, bei rechts vor links unter t_f, 0 Folgen unter t_f, solange einer naht) · der Täter der stehenden
  Minute mit Lage und Grund je Sekunde · die gelassene Lücke nach wem.
- **Selbsttest:** grün (die Zeilen der Zeitlücke und der Vorfahrt fangen ihre Attrappen beim Namen).
- **Mutanten → ROT:** `--mutante-luecke` (600 s): Vorfahrt [10, 6, 58, 0], Warte-Kreis „0>3“ an der Wende 746/573 für 479 s,
  Reisetempo 0,16 · `--mutante-folge` (300 s, der feste Abstand): Zeitlücke [1,61; 0,56; 38 433] — p05 unter 1 s.

## verkehr#1 (gebucht) — vorher und nachher

`node scripts/diag-fahr-leben.cjs --wegenetz` in der Wolke (swiftshader): vorher und nachher gleich — Länge 2 396 m, bis 2 311 m
gefahren, Anteil 0,840 / 0,840, Schritte 12 902 / 12 905; beide stecken bei 2 311 m, und der GPU-Prozess von swiftshader stirbt
(„WebGPU Device Lost“). Das ist die Grenze der Wolke, nicht der Schnitt. Konsum-Probe: der Fahrer der Wegenetz-Fahrt
(`fahrerSetzen`, `stamm/koerper-fahrt.js`) liest keines der geänderten Glieder; `verkehrsNetz` liest nur
`stamm/siedlung-verkehr.js`; die Route `_wegenetzRoute` (`stamm/siedlung-ort.js`) liest es nicht. Der Richter von verkehr#1 misst
auf der echten GPU (Radeon, GTX) — dort ungemessen von dieser Abgabe.

## Was der Station noch fehlt

- **verkehr#2** (`bestehend 2` → pflicht.C#1, im Zweig `punkte-maschine` in `meisterkarte-quelle/punkte/stationen/k2-mensch-netz.js`):
  die Station liest „fehlt“, weil die Mechanik nur headless misst und keine Probe ≤ 60 s 10 min trägt. Von den
  vier Teilen des Richters sind zwei grün (Mechanik 10 Uhr und 23 Uhr, 0 Berührung, 0 Stillstand), zwei offen: Wagen im Bild
  (pflicht.C#2 an stadt-voll) und P · Marktplatz (Bild p95 ≤ 33 ms am Markt) — 50 %. Der Kandidat
  `cloud-post/knoten-grossstadt-station/verkehr-s2.js` lässt die Station die Akte der Probe lesen; Soll und Richter-Text bleiben
  wörtlich, die Entscheidung ist Sache des Richters.
- **lenker#1:** Zeitlücke grün (Median 2,74 s), Reisetempo 0,666 unter 0,8 und unter vorher 0,725 (−8 %) — 50 %. Die Wurzel des
  Reisetempos ist offen: der Halt an Orten (ort:halter allein 432 von 1 104 stehenden Proben) trägt mehr als die Vorfahrt
  (allein 69, mit dem Halt zusammen 216).
- **Bild:** kein Bild in der Wolke. Die Pose für die Radeon: stadt-voll, Third, 25 m über Knoten 8>9 (747/552, vor der Wende
  746/573), 10 Uhr.
- **Sprosse 3** (Zeitlücke Median 1–3 s, 0 Konflikte) misst dieselbe Probe schon als Linsen-Zeilen; ihr Umfang (10² Teilnehmer
  an Ampel und Übergang) fehlt, die Szene trägt keine Ampel.
