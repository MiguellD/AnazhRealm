# Leben-Schau: Fahren am Hang (Q13), Stand 07.10.

Stand: Worktree `vigorous-nash-leben-schau`, detached `828d5ace` (Welle L integriert), nur gelesen, nichts committet.
Gespielt in einem sichtbaren Chrome-Fenster (puppeteer `headless:false`, Radeon 890M, `echteWebGpuArgs()`, 1280×720).
Der save-server lief auf :7860, der Steuer-Server auf :7861. Gefahren wurde mit echten Tasten (E, W/A/S/D) in 8 Schritten.
Unten links stand eine Zeile für Zuschauer, die für jeden Bildschuss ausgeblendet wurde.
Das Werkzeug lag nur im Scratchpad: Fahrlog je Frame mit Takt-Zähler um `_loopFixedStep` und eine Seiten-Kamera nach `_loopCamera`.
Die Bilder liegen in `fahren-gelaende/`.

## Eindruck

- **Was geheilt ist:** Der Wagen fährt jetzt sichtbar wie ein Körper. Er fährt mit vollem Tempo und ohne Ruckeln (0 statt 114 von 114 Teleport-Frames). Die Räder rollen, lenken und federn einzeln, und über eine Kuppe hebt er 3,1 m ab und landet. An Baum, Wagen und Bär hält er an, statt hindurchzufahren.
- **Was gegenüber dem 06.10. bleibt:**
  - In der Verfolger-Sicht ist der eigene Wagen ab etwa 8 m ein gerasterter Geist.
  - Das trockene Seeufer wirkt weiter wie eine Wasserwand: Mit Vollgas kriecht der GT mit 0,39 m/s, und im Bild ist kein Wagen zu sehen.
- **Neu und schwer, zwei Fallen:**
  - Am Hangfuß sinkt der GT nach einem Seitenstoß 1,16 m unter seine Räder und kommt nie wieder frei.
  - An der Kante des Felsspalts hält ihn aus 11,4 m/s eine unsichtbare Wand fest.

## Alt → jetzt (die 10 DEFEKTE vom 06.10.)

| # | Defekt 06.10. (Klasse) | jetzt | Beleg |
|---|---|---|---|
| D1 | Ritt verwirft den Sim-Weg: 114/114 Teleport, 25,95 m simuliert gegen 10,27 m gefahren (Q1) | **geheilt** | 0/485 Teleport-Frames, Sim-Weg 27,12 m = Fahr-Weg 27,12 m; auch in jedem anderen ausgewerteten Lauf (Bremsen, Hang, Kuppe, Baum, Spalt) 0 |
| D2 | Dreht ohne Lenkung, 84° beim Zurückrollen (Q1) | **geheilt** | Hang 26–30° (GT, SUV), 3 s ohne Taste: 0,00 m und 0,0° Gier. Querhang, 7,6 s Stand: 0,006 m und 0,0° |
| D3 | Eigener Wagen als Geist in der Verfolger-Kamera, 45 % sichtbar (Q14) | **offen** | `04b-kuppe-geist-ausschnitt.png`: Schachbrett-Dither bei ~9 m, ebenso das Dach in `01`. Bei 6 m steht er voll (`05`). Pixel-Anteil nicht neu gemessen |
| D4 | Kollision über die Reiter-Kapsel: Bug 1,97–2,32 m im Stamm, Bär ganz im Wagen (Q5) | **geheilt** | Eiche frontal: 10,41 → 0,16 m/s, Bug 0,11 m vor der Rinde (`05`). Geparkter GT: Lücke 0,016 m bei 11,3 m/s. Bär: Hülle 1,45 m vor seiner Mitte (der Leib hält; die Bären-Box überlappt den Bug um 0,51 m, Kopf/Schnauze) |
| D5 | Drei Wasser-Wahrheiten: nasse Wand, Kriechen, Holzkarren-Dichte | **offen** | Trockener Uferstreifen bei (−878/−607): Boden 21,84, See 23,84, Zell-Spiegel 23,40, Lauf-Fläche null. Reiter in 221/221 Frames „unter Wasser", Vollgas 6 s = 1,6 m (max 0,39 m/s). Die Verfolger-Sicht zeigt keinen Wagen (`06`). Der GT meldet weiter `floats: true`. Swim-Drag am Reiter `anazhRealm.js:89544` |
| D6 | Vertikale klebt; im Spalt 7,95-m-Sprung, danach hängt der Wagen 16,7 m in der Luft (Q13) | **teilweise** | **Kuppe** R 11 m: 272 Flug-Frames, bis 3,11 m über Grund, Landung bei vy −9,07 m/s, größter Sprung je Frame 0,30 m. **Spalt** (23 m tief, −904/−975): Stopp in einem Frame von 11,44 auf 0,19 m/s an der Kante, Gas bewegt den Wagen 0,00 m, er fällt nie (`08`) |
| D7 | Hang-Klasse halb: 0,00 m Abdrift am 35°-Querhang, Räder schweben, SUV am schlechtesten (Q13) | **teilweise** | **Querhang 28–37°:** In Fahrt talwärts vlat 0,93–0,97 m/s. Alle Räder am Boden (Rest 0,000 m statt 4,5–19 cm). Im Stand rutscht nichts: μ 1,0 überall, also eine Grenze von 45° (Grip je Boden L1 fehlt). **30°-Hang aus der Senke:** GT 0,87 m, SUV 0,49 m in 5 s; der Bug bleibt an der Böschungskante −6°→31° hängen, deshalb ist der Reibkreis selbst nicht isoliert gesehen |
| D8 | Studio-Instanz starr: kein Rad rollt oder lenkt, Vorderräder 7–11 cm im Boden (Q13) | **geheilt** | Rolle 80,4 rad auf 27 m, Einschlag A +0,46 / D −0,40 rad. Beim Bremsen liegt die starre Ebene bis 0,12 m unter dem Boden, die Einzelfeder deckt es (Rest 0,000 m). Räder sichtbar auf dem Boden (`05`) |
| D9 | Labor-Tacho ×12 (126 „km/h" bei 10,5 m/s) | **geheilt** | 44 km/h bei 12,21 m/s (= ×3,6), `07`. Labor und Welt tragen denselben Fahr-Zustand (`car` hat die Felder von `fahrZustand`) |
| D10 | Reiter „in der Luft" in 421/421 Frames | **geheilt** | `isInAir` in 0 von 485 Frames, ebenso 0 in jedem Lauf |

Bilanz: 6 geheilt, 2 teilweise, 2 offen.

## Neue Defekte

1. **Hangfuß-Falle (schwer).**
   - *Gemessen:* (−852/−861,2), Gier 92,3, zweimal deterministisch:
     - Der Kontakt-Löser schiebt den GT bei 9,3 m/s in einem Frame 0,97 m quer (Glutbrunnen bei −848,9/−861,8), auf Grund 0,248 m über seiner Höhe.
     - Die Stufe beträgt nur 0,18 m. Deshalb greift der Wand-Zweig `vehicle-core.js:2720` (`z.vy = 0`), und die Höhe des Wagens friert für immer ein.
     - Der Wagen fährt weiter, sinkt bis 1,16 m unter seine Rad-Ebene und hat ein Rad 1,02 m im Boden.
   - *Folge:* Die Gelände-Wand der Hülle rechnet ihre Ebene aus dem eingefrorenen `fz.y` (`anazhRealm.js:89353–89378`) und sperrt deshalb jede Richtung. W und S bewegen ihn 0,00 m.
2. **Unsichtbare Wand an der Spaltkante.**
   - *Gemessen:* Bei (−904/−975) fällt das Tempo in einem Frame von 11,44 auf 0,19 m/s; 2,5 s Gas bringen danach 0,00 m. Der Bug ragt über die 23-m-Kante (`08`).
   - *Täter:* Vermutet wird die Gelände-Wand der Hülle (`_fahrHuelleKontakt` :89364ff); isoliert ist er nicht.
3. **Jeder Stoß ist ein Stopp ohne Folge.**
   - *Gemessen:* Baum 10,41 → 0,16, geparkter GT 11,28 → 0,00 und Bär 9,27 → 0,17 m/s, jeweils in EINEM Frame.
   - *Folge:* Es gibt keinen Rückprall, und Gegner-Wagen wie Bär bewegen sich nicht. Weder Kamera noch Klang geben eine Rückmeldung.
4. **KERN-PFLICHT beim Boot.**
   - *Gemessen:* In 2 von 2 Boots fängt der Loop je einmal den Fehler `phyto:lod.budget (gras)` ab: `_foundryBudgetZeile` liest vor dem Buch (`anazhRealm.js:70445`).
5. **Labor: Maß-Beschriftungen in der Probefahrt.**
   - *Gemessen:* RADSTAND 2900, ÜH-H 920 und die anderen Maße liegen während der Fahrt über dem Wagen (`07`).
   - Sie standen schon am 06.10. in Bild `24`, wurden aber nicht benannt.

Nicht geprüft: die Furt (im Umkreis von 150 m keine saubere Einfahrt; der alte Startpunkt −864/−660 liegt an einem 42°-Querhang, dort steht der GT, 0,16 m in 5 s).
