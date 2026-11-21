# Übergabe 21.11.2026 — an den nächsten Agenten, auf JEDEM der drei Geräte

Geschrieben am Ende von Konto 16 (Radeon-Sitzung, Koordinator), Wochenbudget 96 %. Dieses Blatt gilt für die Radeon, die OMEN (GTX 1060) und die GTX 1050 gleich. Der Zustand mit allen Köpfen steht in `LAGE.md`, Block „STAND BEIM SICHERN 21.11.“ und sein Nachtrag. Hier steht, was kein Diff zeigt: die Wunden, was sie lehren, und wie wir drei als EIN Team bauen.

## Das Wort des Schöpfers, 21.11. abends

„wir beginnen nun zu bauen, oder? der messaperat steht, evt. nicht perfekt, aber dafür bauen wir nun umso perfekter … der exponentielle wachstum soll starten, die sprossen erklumen werden, AAAA niveau, von bilder über physik bis zur interaktionen, den seed welcher den planeter erde abbildert, über zeit und das universum … wir müssen grösser, weiter und tiefer denken als je zuvor, und dabei die synergie und übersicht behalten … evt. in zukunft die anderen beiden geräte noch besser in die teamarbeit einbeziehen, euch gegenseitig stützen wenn sich jemand verirrt, lastverteilung.“

Meine Auslegung: der Apparat wird nicht weiter poliert, er wird benutzt. Ab jetzt zählt nur, was eine Sprosse der Karte 2 an der FRONT grün macht oder ein Bild im echten Spiel hebt.

## Wo wir stehen (Zahlen, 21.11. 22:00)

- Karte 2: **44 von 1 718**, 8 im Kern. Plan für den 21.11. waren ≥ 80. Ziel 17.12.
- main 1e204f83 (V18.546.362), heute 13 Landungen. Fünf Köpfe stehen über Nacht in der CI: front-brand f1b0a2f3, stufe-ein-auge 7e1d2af8, nacht-lichter-2 f41a7c82, front-planet-leben 0860d60e, front-klang-koerper 78fd9aa9; saat-argument 92c2c411 landet nach front-brand.
- Zum Apparat fehlen genau zwei Stücke: `pm-front-f1` (60 %; drei Front-Stationen ROT → GRÜN warten darin) und der Runde-Umbau `runde-aenderung-wip` (80 %; die Radeon-Liste fällt mit der Front von 222 auf 5 Stationen). Danach wird nur noch gebaut.

## Die Wunden — jede ist heute WIEDER aufgegangen, obwohl sie im Gedächtnis stand

1. **Elf Arbeiter an EINER Karte.** 104–162 `bash.exe`, ein bash-Start 14 s, das GPU-Schloss der Radeon 17:53–21:30 ohne Pause belegt, ein Selbsttest 132 min. Ertrag in 6–8 h: EIN Vorprüf-Kopf, kein Stempel. Die Regel „höchstens drei mit Radeon“ stand seit dem 20.11. im Gedächtnis. **Lehre:** die Rate ist Richter × Inhalt × Mess-Zeit — mehr Bauer hinter demselben Richter machen langsamer. Höchstens FÜNF lokale Arbeiter, drei mit GPU; vor jedem Start `(Get-Process bash).Count` (über 60 startet keiner).
2. **Auftrag ohne den Satz der Karte.** Der Erde-Schlüssel lief 6 h an eine Leiter, deren erste Sprosse einen Plan-Korpus und ein Fach-Panel verlangt — dort konnte er nie punkten. **Lehre:** vor jedem Auftrag den Richter-Satz der FRONT-Sprosse lesen (`vision/meisterkarte-2.json`, Feld `richter`) und in den Brief schreiben.
3. **Eigene Zahl als Wahrheit.** Ich gab der GTX 1050 das Ziel „≤ 512“ und die Prämisse „liest je Bild neu“ mit. Beides war falsch; sie hat an der Quelle gelesen und mich berichtigt (Schritt 11 sind ZWEI Zündungen, kein Chokepoint unter 895). **Lehre:** was der Koordinator schickt, ist eine Hypothese mit Messnamen, kein Soll. Soll setzt die Karte oder die Linse.
4. **Bild und Stempel-Text vor der CI.** Bei der Stufe sah ich das Bildpaar an und schrieb den Stempel, dann fielen fünf Wände. **Lehre, Reihenfolge am Abgabe-Kopf:** probe-tag → CI grün → Bild → main einmergen, wenn main seither landete → Stempel.
5. **Uhr geraten.** Dreimal eine Zeit in LAGE geschrieben, die nicht stimmte. **Lehre:** die Zeit kommt aus `date`, nie aus dem Kopf (in meinen Buchungen jetzt als Platzhalter `@UHR@`, den der Befehl füllt).
6. **Drei rote Landungen, EINE Wurzel.** front-brand, saat-argument und Stufe fielen alle an `gate:stand-takt` — nicht an sich, sondern am Brand-Schritt von main selbst (1 099 bis 1 105 von 1 024 Einheiten). Solange ich sie einzeln ansah, sahen sie wie drei Wackler aus. **Lehre:** rote Urteile nach der fehlenden Fähigkeit gruppieren, bevor jemand heilt; ein Lauf am Laptop, der den Schritt nicht trifft, beweist nichts.

Warum sie wieder aufgingen: eine Regel im Gedächtnis wirkt nicht im Moment des Handelns. Jede Lehre gehört an den ORT — in das Werkzeug, die Brief-Vorlage, die Linse. Wer eine Wunde zum zweiten Mal sieht, baut am selben Tag die Wand, nicht den nächsten Merksatz.

## Die Metas — was Vielfalt UND Effizienz zugleich möglich macht

- **Die Welt ist eine Funktion des Auges.** Seine Vision vom 21.11. (ein allumgebendes Feld, das nur die Kamera zeichnet, wie ein Lidar, der in der Bewegung korrigiert) ist dasselbe wie Gebot 7. Die Stufe (EIN Auge, Wiese als Fächer: Bestand 27 → 15 Kacheln bei gleichem Bild) ist der erste Schnitt in diese Richtung; jeder weitere Bestand folgt demselben Auge `_lodAuge`, nie einem eigenen Ring.
- **EIN Leser je Grundgröße.** Die besten Schnitte des Tages waren Ein-Leser-Schnitte an der Wurzel: `_saatJe` (37 Saat-Leser in 19 Dateien, Anteil am Brand-Schritt 231 → 0) und der Säulen-Marsch je Zündung (drei → einer). Der nächste dieser Art liegt offen: die Breite des EINEN Stoff-Lesers `_kontaktStoffAt` (≈ 58 Einheiten je Bett-Punkt über ~30 Leser) — Sache des Stoff-Gesetzes im Kern, nicht von feld-brand.
- **Punkte gibt nur die Front.** Eine Leiter zählt ihre lückenlose Folge von unten. Die drei Punkte heute kamen aus geheilten Front-Stationen, nicht aus neuen Features. Die billigsten nächsten liegen in `pm-front-f1`.
- **Ein fehlendes Gesetz ist ein Fund, kein Hindernis.** Heute beim Namen: das Genom liest kein Jahr (`kopplung.leib#5`), der Wurf liest die Offenheit des Lebensraums nicht (`masse#1`), die Heimat lag nie unter Eis (`gegenwart#1`). Solche Sprossen fallen im Studio/Kern, nicht in der Welt.
- **Das Bild führt.** Jedes Bild, das ich ansah, trug einen Mangel, den keine Zahl nannte (der Flammen-Ring als Perlenkette; dunkle Punkte über den Kronen; Laternen in der Antike). Ansehen, beim Namen nennen, als nächste Sprosse führen.

## Das Team der drei Geräte (meine Regel als Dirigent, gilt ab sofort)

- **Jedes Gerät besitzt Wurzeln, nicht Botengänge.** OMEN (GTX 1060): Saat/Samen, Takt und Präsenz, und sie ist das Buchungs-Gerät der Front. GTX 1050: Stoff, Brand, Stein. Radeon: Koordination, Landung, Punkte-Maschine. Wer eine Wurzel besitzt, liest die Quelle selbst und schneidet dort.
- **Gegenlesen statt Doppelmessen.** Nicht alles wird an zwei Geräten gemessen. Aber die EINE Zahl, die eine Landung trägt, bestätigt das andere Gerät einmal mit 3 Läufen (heute: Brand-Schritt 1 099 an der GTX 1050, 1 105 an der GTX 1060 — danach war die Wurzel sicher).
- **Widerspruch ist Pflicht.** Trägt ein Auftrag des Koordinators an der Quelle nicht, schneidet das Gerät NICHT und meldet die Berichtigung mit Zahl (so die GTX 1050 heute, zweimal). Umgekehrt ruft jedes Gerät den Koordinator, wenn der oberste LAGE-Block älter als 90 min ist oder ein Auftrag dem Satz der Karte widerspricht.
- **Verirrt-Signal.** 60 min ohne neuen Kopf und ohne neue Zahl: EINE Nachricht „STEHT: wo · was versucht · was ich als Nächstes täte“. Der Empfänger antwortet mit einem Entscheid, nicht mit einer Frage.
- **Last.** Die GPU der Radeon ist zuerst Lande-Gerät (CI-Läufer, Front-Messung), nicht Prüfstand für viele Bauer. Bild-Arbeit geht in die Slots von OMEN und GTX 1050 oder in die Cloud; lokal höchstens fünf Arbeiter.
- **Meldung.** Ein Gerät meldet nur: Abgabe an EINEM Kopf (Geschnitten · Gemessen · offen) oder einen harten Block. WIP liegt immer auf `<zweig>-wip` an origin.

## Die ersten Handgriffe des Nachfolgers (nichts davon ist ein neuer Plan — alles steht in LAGE und Karte 2)

1. Gedächtnis-Tafeln lesen (Radeon: `zwoelf-lehren-und-ihr-ort`, `front-der-karte`, `stempel-vorpruefung-1811`, `schwarm-start-baum-last`), dann den LAGE-Block, `get_usage`, den Blick (`node artifacts/profiband/dienst/messplatz-blick.cjs --kurz`).
2. Die fünf CI-Urteile lesen; front-brand zuerst stempeln (Text liegt bereit: Scratch `stempel-front-brand.txt`), dann saat-argument und Stufe je mit eingemergtem main, dann Nacht-Lichter, Klang-Körper, Planet+Leben (dort erst Abdruck und `eis.zeit` klären).
3. `pm-front-f1` zur Abgabe bringen und landen; die Geräte messen die Front; buchen.
4. Runde-Umbau installieren, Schleife `radeon` starten.
5. Dann bauen: je Auftrag der Richter-Satz der Front-Sprosse, ein Bildpaar, EIN Gerät als Besitzer.

## Ehrlich offen

R8 (ohne Kalt-Ankunft ≤ 5 s höchstens 762 Punkte) · R11 (198 Panel-Sprossen, 28 Korpus: gesetzt, nicht bestellt; geladen wird nichts ohne sein Wort) · Heap +2,24 MB je Weltwechsel · der Rückstand zum Plan (44 statt ≥ 80 am 21.11.).

## OMEN (GTX 1060) — die Wunden des Tages mit Zahl, und was ich dem Nächsten an dieser Karte rate

1. **Der Sparse-Baum der Punkte-Maschine fehlte Dateien:** der Selbsttest fiel an RICHTER-AKTE (vision/buche-2.cjs, BRUECKE.md, karte-2-stand.json, seite-bauen.cjs nicht im Sparse; ein Lauf à 650 s verloren), und `git sparse-checkout add /vision/…` machte MSYS zu „C:/Program Files/Git/vision“. **Rat:** vor dem ersten Selbsttest `node vision/richter-akte.cjs --selbsttest` (21/21 in Sekunden); Pfade mit führendem `/` nur mit `MSYS_NO_PATHCONV=1`.
2. **Gemessen im Baum, in dem ich schneiden wollte:** die Stand-Takt-Kette schaltete n1911-main auf main um, der Schnitt wartete 18 min. **Rat:** den Schnitt als Skript gegen eine Kopie proben (p3/n2111/saat-arg/brand/schnitt.cjs) und nach der Messung anwenden — oder main in einem eigenen detached Baum messen.
3. **Die Vorher-Zahl am main kam zu spät:** vom Rot des Zweigs (1 336 Einheiten, Schritt 11) waren 1 105 main selbst; drei Läufe am main (9 min) tragen die Zuordnung, bevor einer deutet. **Rat:** jedes Rot eines Zweigs zuerst 3× an main messen.
4. **Buchen ist ein Ganz-Datei-Schreiber:** `runde.cjs push-pfade` setzt messung/<kopf8>-gtx.json und referenz-gtx.json ganz — vorher prüfen, was origin trägt (heute 0 Dateien an 1e204f83), die Referenz auf origin stellen; die Buche trocken braucht `--karte vision/meisterkarte-2.json` (mit karte-2-stand.json: „karte.preisTreppe is not iterable“).
5. **Der Kreatur-Takt (3 Teile) braucht hier über 30 min:** er stand am Ende meiner Tor-Kette und lief beim Sichern noch. **Rat:** die längste Wand zuerst fahren, nie zuletzt vor einer Budget-Grenze.
