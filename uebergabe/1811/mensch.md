# Stand Kopf A (same.preis.zugang#1) — vorrat9-mensch

- Zweig `vorrat9-mensch`, Kopf **4ea27bf1** (gepusht, [skip ci]; main 08a8397b gemergt in a4056613).
- Was steht (Radeon, werkbank --echt am Dorf, Wechsel auf en im laufenden Spiel, Zählung der sichtbaren Text-Knoten,
  die in de und en gleich bleiben, ohne ganze en-Zeilen der Tafel; vorher a4056613 ↔ nachher 7bb11ee2):
  ICH 8 → 0 · HOF 14 → 0 · WERKSTATT 14 → 0 · offene ICH-Seite im Wechsel 36 → 18 (17 Tafel-gleich + Welt-Name).
  Rest nur Eigennamen (Welt-Name, Wesen, 4 Stil-Namen). Bibliothek 160 von 2550 (6,3 %) = DSL-Wörter (translate=no).
  Klasse: 30 von 30 benannten Stellen — 29 geschnitten, Glieder-Namen einer eigenen Seele FINAL als Spieler-Daten.
- Bilder (Kopf 7bb11ee2): koord/zugang-ich-en.jpg, zugang-ich-de.jpg, zugang-hof-en.jpg („Nexus gesture 1“),
  zugang-werkstatt-en.jpg — selbst angesehen, alles in der Sprache der Seite.
- Tore am Kopf 7bb11ee2/4ea27bf1: format:check · check:statik 0 ✗, Taille dicht · gate:sprache 2461 · gate:v1-pfad GRÜN.
  playtest am 7bb11ee2: 1 ROT („_p2pBroadcastSoul sendet {type:soul, soulName, name}“: der unbenannte Spieler trug
  keinen Namen mehr) — geheilt in 4ea27bf1 (nameEtikett + Tafel-Name), der Nachweis-Lauf wartet am Schloss.

## Was bis zur Abgabe fehlt
- playtest an 4ea27bf1 „Alle Invarianten OK“ und gate:welt-boot (beide warten seit ~00:40 am GPU-Schloss).
- Im Entwurf die Tor-Zeile setzen (PLAYTEST/WELTBOOT sind Platzhalter) und den P2P-Satz ergänzen.

**Nächster Schritt:** sobald die beiden Läufe GRÜN stehen, Tor-Zeile im Entwurf füllen und dem Koordinator melden.

## Fallen
- playtest-Exit ist immer 0 (cmd start): nur „Alle Invarianten OK“ im Log zählt.
- stamm/feld-leben.js steht auf 4000 Zeilen = Decke (stamm-umzug DECKE 4000) — jede neue Zeile dort braucht eine weniger.
- Neue Methoden/Konstanten gehören von Hand in spec/stamm/modul-karte.json (--nach-karte legt WESEN_STIMMUNG falsch ab).
- Das GPU-Schloss ist nachts dicht (Punkte-Sitzung hat Vorrang): ein Lauf wartete 30–100 min.

## Bäume und eigene PIDs
- Bäume: scratchpad welle3/g4 (Arbeit) und welle3/g4-bild (Bild-Baum, detached am Kopf).
- PIDs (Warten am Schloss): g4-tore.sh 46672 → gpu-lauf g4-weltboot 69280/70008/67196;
  gpu-lauf g4-playtest2 17824/43408/63404. Keine Werkbank, kein Save-Server läuft.
- Entwurf: koord/abgabe-zugang.txt; Zähl-Stück für die Station: koord/zugang-zaehl.js.

## Lehre (fünf Zeilen)
1. Zeit kostete das Schloss: ~4 h Warten auf 3 Läufe à 3–5 min; Proben ohne Vorrang verhungern nachts.
2. Getragen hat die Zählung im DOM mit der Tafel als Richter (de-Zeile mit anderer en-Zeile = Täter); nutzlos war die
   Station, die nur Zeilen „beim Wechsel“ zählt — sie sah keine der 36.
3. Übersehen: die erste Abgabe prüfte ich am Chip, nicht an der ganzen Seite; der Netz-Vertrag (name als string) brach erst im playtest.
4. In einen Auftrag gehört das Messverfahren als Werkzeug (Zählung + Fall), nie eine Zahl-Schwelle ohne Werkzeug.
5. Ungefragter Hebel: SPRACH_ZEICHNER aus den Öffnern ableiten (jede Seite meldet ihren Zeichner an `_menueZeigen`), dann fehlt nie wieder einer.
