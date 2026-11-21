# Die Front der Karte 2 (21.11., Koordinator)

**Befund am Code** (`vision/buche-2.cjs`, Zweig koordination):
1. Eine Sprosse ist PUNKT, wenn an EINEM Kopf jedes Gerät, das dort ein Urteil setzte, GRÜN misst (Richter und Preis). Ein Gerät allein
   reicht („Nachwache offen“). Die zweite Hälfte nachzumessen gibt keinen Punkt.
2. Eine Leiter zählt nur ihre lückenlose Folge von unten (`while (h < st.length && st[h] === 2) h++`). Ausnahme: `zaehlung: "glieder"`
   (9 Leitern), dort zählt jede Sprosse für sich.
3. Welche Station eine Sprosse richtet, steht in `vision/richter-tafel.json` (Zweig punkte-maschine).

**Folge:** Punkte gibt nur die FRONT — je Leiter die Sprosse `heute + 1`, bei Glieder-Leitern jede ungebuchte.

**Stand 21.11. 16:00** (jüngstes Urteil über die Köpfe c445936d · 31ea3847 · f68dbf09): 253 Leitern, 41 gebucht,
FRONT 298 Sprossen an 229 Stationen.

| Klasse | Sprossen | was sie dreht |
|---|---|---|
| UNGEMESSEN | 71 | messen — 45 „die Welt der Sitzung trägt nicht mehr“, 12 „Last: Referenz“, 4 Frist, 4 Urteils-Zeile fehlt |
| RICHTER FEHLT | 68 | eine Station schreiben (Tafel-Zeile `richter: "gleich"`) |
| ROT anderes | 66 | Spiel-Urteil; 13 davon nur „die Messung der Leiter warf“ (Deckel) |
| ROT Umfang | 50 | ein Gesetz im Spiel fehlt (trägt sein Urteil, bis main sich dort ändert) |
| ROT Leser fehlt | 36 | ein Leser in Spiel oder Station fehlt |
| GRÜN ohne Buchung | 7 | der Preis hält nicht (Heap) |

Hinter der Front stehen 8 GRÜNE ohne Zählung: planet.geologie.platten#2 und gebirge#2 (Front 1: Richter fehlt) ·
leben.pflanzen.biome#3 · mensch.menge.bevoelkerung#2 · mensch.menge.dichte#2 · mensch.stadt.form#3 · mensch.nahrung.erdbau#2 ·
mensch.zeit.kausal#2.

**Entscheid:** die Liste einer Runde ist die Front ohne den Schwanz (Umfang / Leser fehlt) plus die gebucht Grünen als Rückfall-Wache.
Runde 3 der GTX seit 16:00 von Hand so gesetzt: 177 statt 1 428 Stationen (koordination 982d8565). Jeder Auftrag und jeder Anspruch
nennt die Front-Sprosse seiner Leiter.

**Dateien:** `front-liste.txt` (Sprosse · Station · Klasse · Quelle des Urteils) · `front.cjs` (das Werkzeug:
`node front.cjs <repo> <kopf8 jüngster zuerst …> --liste <datei>`; liest Karte, Tafel und Mess-Dateien per `git show`).
