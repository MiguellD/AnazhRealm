# Abgabe Welle `samen-ein-baum` — EIN Samen-Baum, der Würfel je Los, je DSL-Op ihr Strom (OMEN GTX 1060, 20.11.)

**Kopf:** `samen-ein-baum` **b0b898696 (leerer Abgabe-Commit über 1c574fb1b)**. Baum = 1c574fb1b:
- die Welle 3e68a828a;
- Merge main 3da9d9ae9 (Kosmos) und Merge `ein-schreiber-wand` c16c528cc mit dem Register-Anker (151204179);
- die Prüfstand-Seite (fc148849f);
- drei Schnitte am Ort: Stand (6713f6d8f), Platz-Saum und C-K5 (24759f111);
- Merge main 31ea3847e (Wand, stein-ein-gesetz) und Merge main 3e362397e (z635: los-huelle-2, Zeit-Kalender, Vorab-Statik; V18.546.349).

Zweig ab main 92b7afd07. Ich stempele nicht. Roh liegt auf dem OMEN unter `p3/n1911/samen/`.

## Die Zahlen
| | main | Kopf |
|---|---|---|
| mulberry32-Leiber im Code (Wurzel · stamm · worlds · scripts) | 16 in 13 Dateien | **1** (samen-core.js) |
| Ein-Schreiber-Wand, Größe Samen (`gate:constitution`) | 141 Stellen in 24 Dateien (c16c528c) | **123 in 20** (gesamt am Kopf 280 in 89) |
| (a) Front eines Loses ±5 cm → ein ANDERES Haus anders (153 Lose, 306 Proben) | 267/306 ohne, Σ 466 Häuser | **299/306, Σ 68** |
| (b) Wiederholung byte-gleich | 5/5 | **5/5** |
| (c) ±1 cm → 0 andere Häuser | 283/306, Σ 285 | **304/306, Σ 6** |
| DSL: Orte nach einer Op, die mehr zieht, verschoben | 42/42 | **0/42** |
| Math.random im Sim-Pfad | 2 | **0** (beide Rückfälle brechen beim Namen) |
| Stufe 1 (nur der Generator zieht um): Züge mit Abweichung | — | **0 von 4,63 Mio.**; v1 128/128 Bau-Abdrücke byte-gleich |
| Auto-Dorf −4,−4: GT auf dem Dorfweg (gate:settlement O) | 71,03 m in 6,3 s | **82,97 m in 6,7 s** (vor dem Stand-Schnitt 1,83 m) |
| Auto-Dorf −4,−4: Sockel max | 0 | **0** (vor dem Platz-Saum 0,868 m, Slot 9) |

Roh: `messung-26baeab7/` (`loswurf-final.log`, `dsl-op-2.log`, `paritaet.log`, `v1-vm.log`, `stufe1-siedlung.log`). Die Wand: `constitution-vorher-c16c528c.log` ↔ `constitution-2.log`. Settlement: `gpu-15120417/settlement-voll-*.log`.

## Der Schnitt
- **samen-core.js** (`__samenCore`, §9-Gesetz-Kern): `mulberry32`, der EINE Leib; `mulberrySchritt`; `samenHash`, der EINE FNV-1a; `salzStrom`; `samenBaum(wurzel)` → `samen(pfad)`.
  - Er lädt vor jedem Kern in jedem Kontext.
  - Alle 15 Kopien rufen ihn mit unveränderter Saat-Formel.
  - Die Seite `__aw.html` des Asset-Prüfstands lud ihn nicht. gate:asset-contract riss dort beim Namen („der Samen-Kern fehlt“); fc148849f lädt ihn jetzt.
- **los-wurf** (fachwerk `dorfLayout`): je Los `samen('los:'+i)`, je Baum-Versuch `baum:<n>`. Der Brunnen weicht dem Zulauf der Wende.
- **DSL**: Der Same des Programms ist die Wurzel; jede Op zieht aus `dsl:op:<n>`.
- **FLUEGEL_WINKEL = 0,62**: der EINE Schreiber beider Flügel-Zeilen.
- **Der erste Leser im Spiel**: Das Auto-Dorf −4,−4 legte sich neu. Daran fielen zwei schlafende Gesetze des Orts; beide sind an der Wurzel geschnitten.
  - *Der Stand steht nie auf dem Weg* (fachwerk `standFrei`): Im Dorf fragte er keinen Weg. Ein Hauptweg lief über den Platz, und der GT steckte nach 1,8 m vor `marktstand_dorf`.
  - *Der Saum des Platzes liegt vor den Grundrissen wie jeder Weg*: Bisher lag die ganze Platte samt Saum hinter den Häusern. Auf der Fläche gewinnt der letzte Splat, also schnitt der Saum (y 42,05) den Rand von Slot 9 (42,92). Für den Torplatz gilt dasselbe.
  - Der Genesis-Ort bleibt byte-gleich, Slots und Wege bleiben gleich, je Platz kommt eine Kern-Platte hinzu (`platz/vergleich.log`).
- **Die Linse des Orts nennt den Täter beim Namen** (Gebot 10): den Bau vor dem steckenden GT; je Sockel Slot, Weg-Rand, Nachbar und den Splat, der den tiefsten Punkt deckt; beim Hänger von C-K5 den Zustand des Dorf-Zugs.
  - C-K5 misst den Ring jetzt am Ort des Vorrats, wie die Welt (`ort = w || i3`).
  - Die Ort-Wahl rückte den Vorrat 48 + 16 m; die Probe stand am Wunsch, und die Zelle erwachte nie (3 637 Takte).
- **Die Merges:**
  - Kosmos fällte den Würfel-Himmel.
  - `check:vorab` trägt jetzt `node --check samen-core.js`.
  - In los-proben und settlement stehen beide Proben nebeneinander: der Würfel je Los und die Brandwand B1.

## Goldens neu geprägt (beim Namen)
`spec/asset-contract/v6/golden/siedlung.json` (2 SHA) und `siedlung-lose.json`, am Kern beider Wellen:
- Die Lagen folgen dem Würfel je Los.
- An 2/120 rücken 8 Häuser um 0,066–0,178 m; das ist das Los-Gesetz von los-huelle-2.
- Stand und Platz-Saum bewegen kein Golden; 7/12 und 12345/6 waren vor dem Merge byte-gleich.
- Unberührt: v1 (132), v4, v5, v6 haeuser + ausstattung.

## Bildpaar (gleiche Posen, main 3e362397e ↔ Kopf 1c574fb1b) — `bericht/2011-samen/`
Die Bilanz: main 8/8, Kopf 8/8, fuge-offen 3/3, `fehler` [] (`gpu-1c574fb1/bild-*.log`). Die JPG haben q82, `<name>-main.jpg` ↔ `<name>-kopf.jpg`.

- **`b15-dachlandschaft-60m`** (Stadt 7/4750, Mitte): Straßen und Blöcke sind gleich. Die Lose der Mitte sind neu gewürfelt: Kuppelbau, Turm und Hofhaus tauschen ihr Los. Das ist der Würfel je Los als erster Leser.
- **`b02-reihe-gleicher-haeuser`** (Auto-Dorf −4,−4, Pose von main):
  - Das Dorf liegt am Kopf am Ort seines Vorrats, der Spieler steht bei −720/−922 statt −704/−880.
  - Die Häuser stehen beidseits des Wegs, der Stand neben dem Weg und nicht darauf.
  - Es sind 16 Häuser mit denselben Rollen.
- **`b10-kein-hof`** (feste Pose −688,9/−848,0): main sieht die Wand des alten Dorfs, der Kopf einen leeren Hang. Das Dorf ist gerückt, nicht verloren.
- **`b07-ferne-stadt-260m`**: Die ferne Stadt steht.
- **j1–j4** (Gelenk 712412↔400335): Der Bau rückt mit dem Los 0,37 m (804,81 → 804,44).
- **fuge-offen j1–j3** (665720↔961288): Das Paar trägt am Kopf die offene Fuge (Ehrlich offen 1).

## Tore am Kopf 1c574fb1b
- **Code-Check, Node: 59/59 grün, 1003 s** (`tore-1c574fb1/ZUSAMMEN.txt`). Darin:
  - `check:vorab` und check:statik 00–50, ohne diag-taille; die läuft am Gerät;
  - fachwerk-, porta- und schmiede-contract;
  - settlement `--selftest` und `--nur-a`;
  - haus-fern (273 s), studio-vertrag und format-teile.
- **Probe am Gerät: 10/10 EXIT 0** (je Lauf über `p3/gpu-lauf.sh`, eine Kette, `gpu-1c574fb1/kette.txt`). Die Laufzeiten:
  - gate:welt-boot 87 s
  - gate:asset-contract 1656 s
  - gate:settlement voll 504 s
  - gate:haus-welt 1/2 758 s und 2/2 725 s
  - gate:kreatur-leben 138 s
  - gate:pflanzen-nah 18 s (31 Fälle)
  - gate:taille 7 s
  - gate:wasser-leben 405 s
  - gate:werk-im-wasser 352 s (Selbsttest und Lauf)
- **Gegen main 0e93ca0c7** (V18.546.350, register-gang-frisch und welt-boot-profil-taeter): Der Probe-Merge geht sauber durch, ohne Konflikt. Danach tragen alle 83 `?v=` in `index.html` 18.546.350, auch `samen-core.js`. Ich habe ihn wieder abgebrochen; der Kopf trägt ihn nicht.

## Ehrlich offen
1. **Die 0,70-m-Fuge fällt NICHT mit dem Würfel.** An Stadt 7/4750 (3 × 3 Kacheln) zählen Fugen von 1 cm bis 1,0 m main 325, Kopf 323 (`fuge-final.log`).
   - Die Wurzel beim Namen (`fuge-diag.log`): Der Reihen-Snap entscheidet an `dims.W`, nicht am Körper. 230 Paare sieht er nie; 80 öffnet die Kette wieder.
   - Ein Prototyp bringt 325 → 19–30, bricht aber 4 Gesetze von gate:settlement Teil A. Er liegt außerhalb dieser Abgabe (`fc-fuge-prototyp.js`).
   - Die Bilder fuge-offen j1–j3 (665720↔961288) zeigen ein Paar, das die Fuge am Kopf trägt.
2. **Rest-Proben des Wurfs:** Die 7 + 2 kippen am Setz-Gesetz, nicht am Würfel (7/60 Los 10 −5 cm: 41 Häuser; die Kirche als Anker).
3. **Die übrigen Generatoren bleiben**, benannt in der Ratsche der Wand: `_samenStrom` (LCG des Stamms), die LCG und xorshift von fachwerk, foundry `__streuGeo`, die Ströme von phyto, die FNV-Kopien, klang-core.
4. **Ein Felsbogen wackelt.** An 1 von 5 Settlement-Läufen am Zweig stand ein `felsbogen` (Wahrzeichen der Chunk-Vegetation, Spawn-Schlange) auf dem Grund des Auto-Dorfs; main 0 von 1.
   - Die Räumung (`_naturRaeumen`) räumt nur Grundriss und Weg, die Probe zählt den ganzen Grund (`!_ortFrei`).
   - Nicht geschnitten.
5. **haus-fern** am 980bf4887: Der 1. Lauf starb nach 28 s ohne Meldung neben einem GPU-Lauf, der 2. Lauf war grün (285,6 s).
6. **`npm run check`** ganz habe ich nicht gefahren; die Batterie fährt CI mit `[ci voll]`.
