# jagd-quote — Stand-Blatt (GTX 1050, 25.11. 23:15)

**Geschnitten.** Die Beute merkt in ihrer Fluchtdistanz einen Jäger, in dessen Fahne windab sie steht. Sie nutzt dieselbe Funktion (`_scentAt`) und dieselbe Nase (`_scentNase`, jagd.scentRangeM) wie der Jäger, pirschend wie hetzend, ohne Sonder-Zahl (stamm/kreatur-furcht.js `_creatureWarinessEigen`). Die Quelle ist Mech 1966 (Fauna Series 7, sec4): In 7 Jagden (11 Elche) merkten die Elche die Wölfe zuerst und verließen sofort den Ort, und der letzte Reiz kommt über den Geruch.

**Gemessen.** Alle Zahlen sind Rudel-Risse je Jagd mit Hetze an der Bühne jagdkreis (Band 0,2–0,4), headless auf diesem Rechner, wo nicht CI genannt ist.

| Kopf | Rudel | Quote |
|---|---|---|
| c24abc66 (vor z740) | 91/240 | 0,379 (CI 90/240 = 0,375) |
| main 0ee3ed8c (CI) | 113/240 | 0,47 |
| s0-anker (CI) | 119/240 | 0,50 |
| witterung-windab 5a231ac9 allein (Boden f63a69ef) | 20/60 | 0,33 |
| druck-schlaf-uhr 76934255 allein (Boden f63a69ef) | 21/60 | 0,35 |
| main ohne druck-schlaf | 22/60 | 0,37 |
| main ohne witterung | 24/60 | 0,40 |
| main ohne witterung | 91/240 | 0,379 (gleich c24abc66) |
| Schnitt 89183e6c (main 2da17e2e) | 349/890 | 0,392 (Lauf mit 240 Jagden, von der Linse nach ihrer 2-σ-Regel auf 960 verlängert) |

Am Schnitt: einWolf 0/18, kitz 19/19.

Der Täter ist witterung-windab mit ≈ +0,10. Bei druck-schlaf-uhr steht die Quote an 240 Jagden gleich c24abc66. Der direkte Gegenlauf c24abc66 + witterung an 240 Jagden stürzte nach 50 min ab (Seite, unter Last) und steht nicht.

**Die Linse „beute“** (Bühne witterung, gate:kreatur-takt) fragt das Gesetz ohne Takt. Ein pirschender Wolf 30 m luvwärts des Rehs (das Reh in seiner Fahne, Wind 4 m/s) wird gemerkt. Derselbe Wolf windab wird nicht gemerkt (Fluchtdistanz 120 m). Der Täter beute-ohne-nase (die Fahne der Beute trägt nichts) macht sie ROT beim Namen, Selbsttest 3 von 3. Die Suche der Witterung bleibt grün: windab 12,37 s, gegen und quer > 90 s, Faktor ≥ 7,28.

**Offen.**
- geruch#1 an der echten Station (punkte-maschine, Station karte2.erleben.sinne.geruch#1, GTX) ist am Kopf nicht gemessen. Der Lauf wartete 560 s auf die Vorfahrt des CI-Jobs.
- Die Quote 0,392 liegt nahe der oberen Kante. An 240 Jagden ist σ ≈ 0,03, die CI-Linse kann also über 0,4 fallen.
- check:statik zeigte unter Last einmal (T) ALT im ci-deckung-Teil. Allein nachgefahren ist es grün.

**Nächster Schritt.** geruch#1 an der Station am Kopf messen (GTX, nach dem CI-Job) und die Rudel-Quote der CI an 240 Jagden lesen.
