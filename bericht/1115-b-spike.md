# B-Spike „das erste Bild wartet nicht auf die 16 Pipelines unter 0,1 % der Pixel“ — ZWISCHENSTAND

GTX 1050, 15.11. 15:57–16:47, main 2b826a89 (V18.546.293), echter Renderer ohne DevTools, Genesis-Ankunft der Sonde, kalt
(frisches Profil je Lauf), die Fälle im Wechsel. Richter: Bild ab Navigation kalt. Eingriff: `_halten.js` (die Bürger der
Stufe reichen bis zum Bild die Erst-Zeichnung nicht — kein Knoten-Bau, keine Pipeline, kein Warten; danach kommen sie dran).

## Das Urteil: JA, mit einer Bedingung, die der Spike selbst fand

| Fall | Bild ab Navigation kalt, s | Median | gegen heute |
|---|---|---|---|
| heute (n 6, zwei Reihen) | 23,6 · 22,7 · 21,3 · 22,5 · 21,1 · 22,8 | 22,6 | — |
| c2: die Naht und die acht mit 0,00 % (n 3) | 19,8 · 20,9 · 20,4 | 20,4 | −2,2 s |
| c3: alle 16, OHNE Weckruf (n 9) | 26,2 · 25,5 · 18,6 · 18,8 · 24,8 · 22,2 · 27,3 · 22,2 · 26,3 | 24,8 | +2,2 s — 6 von 9 hängen |
| c3: alle 16, MIT Weckruf (n 6: 3 Eingriff, 3 Code-Schnitt) | 18,5 · 18,6 · 20,3 · 20,8 · 19,8 · 19,7 | 19,75 | **−2,9 s (13 %)** |

Zweit-Boot (Platte und Pipeline-Cache warm, n 3 je Fall): heute 9,73 (9,40–10,2) · c2 8,94 · c3 8,90 s — −0,8 s.

Woher die Sekunden kommen (kalt, je Lauf aus den Marken): die Strecke „zeichnung“ (Weltbild − Bild aus der Ferne) fällt von
2,6–3,4 s auf 1,9–2,3 s (c2); der größere Teil liegt DAVOR — der Knoten-Bau bis zum Bild fällt von 4,3 auf 2,6 s
Haupt-Faden, Bäume und Karten stehen früher. Vor dem Bild entstehen 30 statt 43 Pipelines, 1,22 statt 1,94 MB Programm-Text.

## Der Fund: ein verlorener Weckruf hält die Ankunft 6–8 s (Zweig w28-cull-weckruf)

c3 hing in 6 von 9 Läufen mit „3–28 Bäume und Bauten wachsen“ bei LEEREM Haupt-Faden: keine Bestellung unterwegs, keine
Lieferung, keine lange Aufgabe. Der Zeuge (je 700 ms die kalten Einträge der Mesh-Zone): 10–28 Bäume in 39–63 m, Asset
gedockt (`_foundryEntryReady` true), kein Schlaf, kein `_dockNein`, in der Wache des Culls — und kein Gang. Die Wurzel:
`_cullWecken` (stamm/vegetation-baum.js) holt den Schläfer bei seiner Zusage in die Wache, weckt aber den Takt archCull
nicht (`_standRuht` ruht, weil Schläfer in keinem Gang zählen); kam die Zusage als letztes Ereignis, steht er, bis ein
fremdes Ereignis die Bau-Takte regt. Je Lauf über 60 Weckrufe in einen ruhenden Takt. Die Streu weckt ihren Takt an
derselben Stelle (`_standWecken("streuLod")`), der Cull tat es nicht.

Es ist dieselbe Erscheinung wie FUND a3648bfa („3 Bäume und Bauten wachsen“, die Welt hängt vor dem ersten Weltbild, K6):
am blanken main selten (heute 0 von 6), unter dem Halten der 16 in zwei von drei Läufen. Der Schnitt allein macht die
normale Ankunft nicht schneller (22,5 · 21,1 · 22,8 ↔ 22,6 · 22,3 · 22,3 s), er nimmt den Hänger und ist die Bedingung
für jeden Bau, der das Bild früher stellt.

Schnitt (WIP 6cced744): `_cullWecken` ruft `_standWecken("archCull")`, sobald der Eintrag in die Wache tritt. Linse:
gate:stand-takt (W) „die Zusage eines Schläfers weckt archCull“ — ROT am Stamm von main (1 Verletzung, beim Namen), GRÜN am
Kopf, drei Mutanten im Selbsttest.

## OFFEN, ehrlich

- Der Spike hält nach einer NAMENS-Liste, gemessen an EINEM Blick (Wald am Genesis-Ort). Der Bau braucht die Regel, die der
  Wirt VOR dem Draw kennt: an einer Wiese deckt die Nah-Wiese mehr als 0,1 %, und Arenen tragen keine Schranken.
- Die Gehaltenen zeichnen nach dem Bild: im Spike der Reihe nach (eine Klasse je 1,5 s, die letzte nach 13–15 s) — ein Bau
  öffnet sie zugleich. Die längste Aufgabe in den 2 s nach dem Bild steigt kalt von 116 auf 231 ms (der Spieler hat da
  die Kontrolle).
- Die Pixel-Differenz des ersten Bilds mit ↔ ohne die 16 ist heute nicht neu gezählt (13.11.: unter 0,1 % je Klasse).
- 22,6 → 19,75 s ist nicht B (≤ 5 s): das Gewicht liegt vor dem Bild aus der Ferne — Navigation → Renderer 4,5–5,5 s und
  Renderer → Bild aus der Ferne 13–16 s (Boden, Pflanzung, Karten).
- Nur die GTX 1050; das Urteil über B fällt an Radeon und GTX 1060.

Werkzeug: `gc/eingriff/_halten.js` (c1–c3), `_zeuge-bauten.js`, `_wecken-takt.js`, Läufer `tmp/stoff-spike.sh` (Paar kalt +
Zweit-Boot) und `tmp/stoff-kalt.sh` (nur kalt, 50 s je Lauf); Reihen `gc/stoff-b1115*`.
