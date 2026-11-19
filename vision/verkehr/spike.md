# DER SPIKE — das Gesetz des Verkehrs (`gesetz.md`) gegen die echte Stadt

**Was lief:** `node --expose-gc vision/verkehr/spike/spike.cjs a b c d e` gegen main `b7ed84194` (Node v22.23.5), Same 7. Die Ausgabe
liegt in `spike/lauf.txt`: das SOLL jeder Probe steht dort VOR ihrer Zahl.

**Das Gesetz als Funktion:** `spike/gesetz.cjs`. Es liest `kachelNetz`, `viertelWort` und `kachelMassen` aus fachwerk-core,
`TAGES_GESETZ` aus koerper-core und `fahrSchritt` aus vehicle-core. Einen Zustand der Stadt hält es nicht.

## Urteile

| Probe | SOLL (vorher, wörtlich in `spike.cjs` `SOLL`) | gemessen (`lauf.txt`) | Urteil |
|---|---|---|---|
| (a) Kosten | „Wer fährt um 08:15 im Kreis 300 m?“: warm p95 ≤ 2 ms · kalt ≤ 500 ms · Heap ≤ 64 MB · 10⁶ ≤ 1,25 × 10⁵ | warm p95 2,98 / 6,13 / 4,71 ms bei 1 641 / 10⁵ / 10⁶ Haushalten · kalt 81 / 1 271 / 660 ms · Heap 45,4 MB ✓ · Wachstum warm 0,77 ✓, kalt 0,52 ✓ (ein Vorlauf: 2,09 / 3,86 / 3,16 ms und 79 / 731 / 452 ms; diese Maschine streut um das 1,7-Fache) | **FÄLLT** |
| (b) Erhaltung | 24 h: jede Minute eine Lage je Wagen · Sprung ≤ 2·v·0,1 s + 1 cm · Tempo ≤ a_max·0,1 s · 0 im Haus · 0 neben der Fahrbahn / außerhalb der Trasse · Fluss morgens hinaus, abends hinein | ✓ 0 Minuten fehlen · ✓ 0 Tempo-Sprünge · ✓ 0 im Haus · ✓ Fluss 197 hinaus / 53 hinein morgens, 48 / 192 abends · ✗ neben der Fahrbahn 4 913, außerhalb der Trasse 3 221 (bis 1,87 m) bei 1 641; 413 / 292 bei 10⁵ · ✗ 4 Sprünge, Tages-Naht 1,0 m | **FÄLLT, im Kern** |
| (c) nah ↔ fern | Fahr-Schritt folgt s(t): Abweichung Ort ≤ 1 m, Tempo ≤ 0,5 m/s · fern→nah ≤ 1 cm · nah→fern: Rest klingt ≤ 5 s, Tempo-Sprung ≤ 1 m/s | 90 Fälle · Ort max 2,43 m · Tempo max 1,36 m/s · fern→nah 0,01 m ✓ · Rest 2,3 m in 2,3 s ✓ · Tempo-Sprung 2,14 m/s | **FÄLLT** |
| (d) Stau | Newell: kein Überholen, Abstand ≥ δ, Abfluss ≤ q_b, Kante = Stoßwelle ± 10 % · die Attrappe V(ρ) dringt durch | 10⁵: Spitze 0,12 Fz/s am stärksten der 48 Tore, Kapazität 0,5, also kein Stau · Engstelle q_b 0,058: 0 überholt, Abstand min 6,93 m = δ, Abfluss 0,0584, Kante −0,15 m/s = Theorie −0,15 · Attrappe: 711 354 Überholungen, Abstand −196 m | **TRÄGT** |
| (e) Determinismus | sha256 der Lagen gleich bei JIT, jitless und anderer Frage-Reihe | 238 380 Lagen, sha256 `04bb1388…c97a` dreimal gleich. Die andere Reihe fragt rückwärts, jede Adresse kalt, mit 96 MB Heap | **TRÄGT** |

## Die Wurzeln

**(a) kalt — der Index baut zu viel.**
- Der Index einer Kachel baut für jedes Paar, das sie kreuzt, die ganze Hauptstraße samt Profil und J/J′.
- In der Mitte von 10⁵ sind das 3 375 Linien: 1 089 der 1 271 ms (86 %).
- Für das Fenster eines Paares genügt eine Schranke; das Profil ist nicht nötig.

**(a) warm — die Gasse wird faul gebaut.**
- Ohne neu gebaute Gasse bleibt eine warme Frage in der Mitte unter 2,08 ms.
- Die Spitzen kommen vom faulen Bauen der Gasse, sobald ein Wagen neu in den Kreis fährt: 25 von 40 Fragen, bis 34 ms.
- Dazu kommen GC-Pausen: 22 ms ohne neue Gasse an 10⁵ [11, 1].

**(a) Merker ohne Grenze.**
- Beim Wandern wachsen die Merker ohne Grenze. Im Vorlauf von (e) lief der Heap über fünf Gebiete auf 96 MB voll (OOM).
- `vergessen()` gibt es jetzt (Satz „am Schirm, verwerfbar“).
- Die Verdrängung nach dem Fenster R_max fehlt.

**(a) Die Stadt ist nicht die Ursache:** von 10⁵ auf 10⁶ wachsen die Kosten nicht (Wachstum < 1).

**(c) Abfahrt und Ankunft (2,43 / 2,34 m) — die Rampe ist nicht fahrbar.**
- Die Rampe von der Spur zum Parkstreifen legt 2,15 m quer auf 6 m.
- Das ergibt ein S aus zwei Bögen von 4,7 m. Der Wendekreis der Wagen ist weiter: die Limousine fährt 6,3 m um ihren Schwerpunkt (fwc:4856).
- Kein Wagen kann dieser Rampe folgen.

**(c) Ecke (2,33 m) — dem Fahrer fehlt die Vorsteuerung.**
- Der Fahrer des Spikes (Pure Pursuit, Vorschau 6 + 0,55·v) schneidet den Bogen R 6.
- Die Lage trägt die Krümmung, der Fahrer nutzt sie nicht zur Vorsteuerung.
- Auf der Geraden bleibt er bei 0,2 m.

## Befund (b): das Gesetz fährt, wo der Kern keinen Wagen kennt, und die Stadt hat keinen Ort für den Wagen

Die Linse in (b) nennt je Verstoß den Täter (`ursache`, `fahrendAufGasseOhneWagen` in `lauf.txt`):

| Ursache | 1 641: neben Fahrbahn / außerhalb Trasse (max) | 10⁵ |
|---|---|---|
| `gasse<breiteM`: die Straße unter dem Wagen ist schmaler als `VERKEHR_GESETZ.breiteM` 4,9 m | 4 391 / 3 078 (1,87 m) | 357 / 260 |
| `ecke`: auf der Fahrstraße dreht die Richtung über 3 m um mehr als 5° | 522 / 44 (1,69 m) | 56 / 5 |
| `stellplatz`: geparkt oder auf der Rampe zur Tür | 0 / 99 (0,60 m) | 0 / 27 |

### 1. Satz 2 widerspricht der kanonischen Quelle (Fehler des GESETZES)

- 52 227 der 120 841 fahrenden Proben (43 %) liegen auf den Gassen gen 1 (3,9 m < `breiteM`).
- Der Kern führt diese Gassen ohne Wagen:
  - `wegArt` (fwc:10109) nennt sie `pflastergasse`, „die gepflasterte Gasse ohne Wagen“, oder Erd-`gasse`;
  - fwc:4347: „unter breiteM: kein Wagen“;
  - das Netz der Wagen nimmt nur Straßen ab `breiteM` (fwc:4912).
- Die Straßen der Kachel-Stadt im Kern (`kachelMassen.strassen`, 25 Kacheln bei 1 641):
  - gen 0 (5 m): 252 `strasse` mit Pflaster und Gehweg 1,8 m, dazu 48 Erd-`gasse` ohne Saum;
  - gen 1 (3,9 m): 528 `pflastergasse` und 672 Erd-`gasse`.
- Spur, Bogen und Park-Versatz des Spikes sind eigene Zahlen (eckR 6, Gassen-Spur w/4, parkM 2,15). Das Gesetz hätte `VERKEHR_GESETZ` konsumieren müssen: spurM 1,25, kurveR 5,5, parkL × parkB 5,4 × 2,3.

### 2. Die Fahrstraße hat keinen Stellplatz (Lücke im KERN)

Ohne die Gasse muss der Wagen an der Fahrstraße stehen. Ihr Querschnitt (`gassenBreite`, `wegQuerschnitt`) lässt dafür keinen Platz:

- Die Fahrbahn ist 5 m breit: zwei Spuren, je `spurM` um die Mitte.
- Der Gehweg ist 1,8 m breit, auf Erde 0 m.
- Die Fassade steht 4,8 m von der Mitte: `einzugM` 4,2 + 0,6 (`kachelMassen`, fwc:4110).
- Zwischen Gehweg-Kante (4,3 m) und Fassade bleiben 0,5 m. `parkB` 2,3 m passt nirgends.

Der Parkstreifen des Spikes (2,15 m von der Mitte) liegt deshalb auf dem Gehweg. Wo keiner ist, liegt er außerhalb der Trasse (`stellplatz` 99, bis 0,6 m).

`einzugM` ist dabei eine eingefrorene Kopie (halbe Fahrbahn 2,5 + Gehweg 1,8 − 0,1). Er wird nicht aus `gehwegVon` abgeleitet, obwohl der Kern diese „die EINE Quelle der Bauflucht“ nennt (fwc:10072). Ein Zwilling.

### 3. Die Ecke ist scharf (gelöst durch 2)

- Der Abbiege-Bogen des Kerns: `kurveR` 5,5, tangential an beide Spuren (fwc:5001 ff.), Kreuzungsradius `kurveR + spurM` (fwc:4967).
- An der rechtwinkligen Kreuzung zweier 5-m-Fahrbahnen liegt die rechte Spur auf der Diagonalen bei spurM + kurveR·(1 − 1/√2) = 2,86 m. Das ist 0,36 m jenseits der Kante.
- Die innere Wagenkante liegt 1,0 m jenseits: auf dem Bord, an der Erd-`gasse` außerhalb der Trasse.
- Die Kacheln tragen keine Eck-Ausrundung. Der Maler vereinigt Kapseln (`_wegStueck`, stamm/siedlung-wege.js:2338).
- Mit Parkstreifen und Parkverbot im Kreuzungsradius reicht der Platz. Rechnerisch reicht die befahrbare Ecke bis 4,8 m; die innere Wagenkante braucht 3,50 m.

### 4. Der Gang fehlt im Gesetz

- Zwei Haushalte der Stadt 1 641 wohnen und arbeiten an derselben Stelle ihrer Gasse; ihr Weg ist ≈ 0 m.
- Ihr Wagen springt 1,0 m zwischen den Park-Seiten. Daher kommen die 4 Sprünge und die Tages-Naht.
- Eine Fahrt von 0 m ist ein Gang.

### 5. Schon in main

Gemessen mit `kern-probe.cjs` (58 Kacheln, 4 055 Häuser): 19 Häuser stehen bis 1,26 m in der Trasse ihrer Straße. Die Blöcke folgen den Sehnen zwischen den Kreuzungen, die Straßen aber der glatten Kurve.

## Der kleinste Schnitt im Kern — Diff, NICHT angewandt: `spike/kern-schnitt.diff`

**fachwerk-core.js gehört zu den Dateien, die diese Sitzung nicht anfasst.** Der Diff gilt mit `patch -p1` sauber auf main `b7ed84194`.

**Was der Diff ändert:**
- `parkVon(plan, rd)` = `VERKEHR_GESETZ.parkB` an jeder Straße der Stadt ab `breiteM`, sonst 0.
- `gassenBreite` wächst um 2 × parkVon; `wegQuerschnitt` trägt `parkM`.
- `kachelMassen` nimmt den Einzug je Platz (`ein`) und an Anfang und Ende der Kante (`kreuzAn`) aus der Trasse der Straße statt aus der Konstante `einzugM`. Die Konstante bleibt Mindestmaß.

**Gemessen** (`kern-probe.cjs <ordner> <parkB>`, 58 Kacheln der Städte 1 641 und 10⁵):
- Mit `parkB` 0 ist `kachelMassen` byte-gleich zu main: sha256 `df571f4d…` in beiden.
- Mit 2,3 m:
  - der Saum der gen-0-Straßen ist 4,1 m (Pflaster) bzw. 2,3 m (Erde);
  - 18 Häuser stehen in der Trasse (main: 19, dieselbe Sehnen-Klasse, tiefstes 1,33 m);
  - je Kachel gibt es ≈ 189 Stellen (Bordlänge beider gen-0-Straßen ÷ parkL, ohne Abzug der Kreuzungen); der Bedarf bei μ 0,5 liegt im Mittel bei 33.

**Nicht gemessen** — diese Leser müssen im selben Schnitt folgen:
- die Plan-Stadt: ihr Rand `wegRand` (fwc:5449) liest `gehwegVon`, ihr Belag (`belagAm`) aber `gassenBreite`;
- die Maler in stamm/siedlung-wege.js (`_wegeBodenFarbe`, `_stadtFerneStrassen`): der Streifen als Fläche, der Bord außerhalb;
- das Bild.

## Was der Befund dem Gesetz abverlangt

- **Satz 2:**
  - Der Wagen fährt nur auf Straßen ab `breiteM`.
  - Seine Fahrt beginnt und endet am Stellplatz auf dem Parkstreifen der Fahrstraße seiner Heim- bzw. Werk-Kachel, außerhalb des Kreuzungsradius.
  - Von der Tür zum Stellplatz geht die Person.
  - Spur, Bogen und Platz kommen aus `VERKEHR_GESETZ`.
- **(a):** das Fenster je Paar als Schranke statt als Profil. Mit der Gasse fällt auch ihr faules Bauen.
- **(c):** Ein- und Ausparken mit dem Wendekreis des Wagens; der Fahrer mit Krümmungs-Vorsteuerung.

## Frühere Befunde (Gesetz v1, vor der einen Linie der Hauptstraße)

- **v1 fiel an den Kosten:** warm 11 ms; der Index trug.
- **18 % Wenden:**
  - Die Route über Knoten 0 jeder Kachel wendete in 18 % der Knicke. Histogramm von 4 129: 0° 725 · 60° 1 283 · 90° 1 377 · 150° 296 · 180° 448.
  - Seitdem ist die Hauptstraße einer Route EINE Linie Tor → Ecke → Tor: 0 Wenden in 87 702 Bögen bei 10⁵.
- **Richtungs-Sprünge:** die 3-m-Abtastung des Netzes ließ die Richtung springen. Mit gerundeten Bögen fiel der Wert von 1 876 über 937 und 55 auf 33 °/s.
- **Stöße an Gasse ↔ Hauptstraße:** mit Anlauf J und Auslauf J′ in jedem Lauf 0 (Sprung, Knick und Tempo je gezählt).

## Grenzen (benannt, nicht gemessen)

- Pendler über R_max (8 Kacheln) fallen aus der Zuteilung.
- (d) prüft eine Kante. Den Rückstau über Tore und Korridore prüft es nicht.
- Gleichheit ist für V8 belegt (JIT und jitless), nicht für andere Engines.
- Zwischen zwei Abtastpunkten gilt gleichförmige Beschleunigung, eine Näherung des Profils.

## Folge

(a) und (b) fallen, (b) im Kern (der Stellplatz). Nach dem Auftrag endet die Sitzung mit diesem Befund:
- die Bahn ist nicht gebaut;
- der Zweig `verkehr-gesetz` ist nicht angelegt;
- `docs/PFLICHT-OFFEN.md` C ist unberührt.
