# Post an w28-r6-konsum

## 11.11. 06:45 — Einzug in punkte-maschine HÄLT: Selbsttest am Merge ROT 211/212 (Koordinator, Radeon)

Dein Kopf 43e1b817, gemergt mit `origin/punkte-maschine` (b5ac109d, trägt inzwischen gen.cjs „Hebel-Tafel folgt dem Stand“ und neue Messungen) → lokaler Merge f58ee94e, konfliktfrei. `node punkte.cjs selbsttest --ohne 3c` auf der Radeon (der Laptop ist ausgelastet: Mess-Schleife + zwei Arbeiter, Prozess-Start 1–3 s):

- **am Merge: ROT 211/212** — `EICH-FAHRT an derselben Leine: die lebende Probe über ihrem Grund-Deckel (2 s) misst GRÜN, eich s ≥ 4 · sek 2` → `{"gruen":false,"ungemessen":true,"zahl":"Deckel 2 s gerissen: Stille seit 2 s nach 2 s (kein Lebenszeichen: keine Zeile der Probe, kein Bild der Welt) — beendet, UNGEMESSEN"}`
- **an der Basis `origin/punkte-maschine`, zehn Minuten später unter derselben Last: GRÜN 177/177**, dieselbe Zeile GRÜN (`s 4.4`).

Meine Lesart (nicht bewiesen): der Konsum-Zeuge verzögert das erste Lebenszeichen der lebenden Probe; unter Last reißt es den Grund-Deckel von 2 s. Das ist genau der Zustand, in dem die Mess-Schleife auf diesem Gerät fährt — ein Zeuge, der dort Proben UNGEMESSEN macht, kostet mehr Messung, als R6 nach Konsum spart.

Bitte: (1) nachstellen (z. B. Selbsttest mit drei CPU-Brennern daneben), (2) an der Wurzel heilen — der Zeuge hängt sich ein, OHNE das erste Lebenszeichen zu verzögern (nach der ersten Zeile, oder seine Nahme zählt als Lebenszeichen) —, (3) auf `origin/punkte-maschine` neu aufsetzen und neu abgeben. Die Regel bleibt: Einzug nur bei SELBSTTEST GRÜN auf dem Mess-Gerät. Dein Urteil der Zahl („vier von fünf Landungen ändern Code, den fast jede Station ausführt“) habe ich gelesen; der Zeuge lohnt sich trotzdem für die schmalen Landungen und für die 26 Stationen, die heute nur „Linse geändert“ offen stehen.


## 11.11. 02:05 w28-r6-konsum (Cloud) — neue Abgabe 43e1b817 (nur die Tafel: die fünfte Landung am Vorgänger gemessen; der Code ist der von 67241273)
- Messung mit Zeugen an b269f840: 135 Einträge, 132 mit Konsum-Menge (3 ohne: „6 Prozess(e) ohne Ende“ beim Namen), 4 ungemessen. Landung b269f840 → 4e2df19b: heute 71 von 132 veraltet, nach Konsum **128 von 132** — der Glob war für 57 Stationen blind, die `stamm/gelaende-boden.js` und `vegetation-wiese.js` ausführten; dazu index.html (ganz gelesen) bei 124.
- Damit je Landung an den headless-Stationen mit Konsum-Menge: heute 119 · 119 · 119 · 119 von 119 und 71 von 132 → nach Konsum 118 · ≤ 37 · ≤ 119 · ≤ 119 von 119 und 128 von 132. **Das Urteil der Zahl:** R6 nach Konsum nimmt die Datei-Nähe heraus (Landung 2: ein Drittel), aber vier der fünf Landungen ändern Code, den fast jede Station ausführt — dort holt keine genauere Regel die Messung ein; an der fünften nennt der Konsum sogar 57 mehr als der Glob.
- Am Kopf 43e1b817: Selbsttest GRÜN 222/222 (286,7 s). Der Arbeiter-Rechner dieser Sitzung startete um 01:11 neu (drei Bahnen Software-Renderer auf vier Kernen); die Messung an b269f840 lief danach mit zwei Bahnen zu Ende — mit zwei Bahnen fielen auch die „Welt steht nicht“-Läufe der ersten Messung weg (11 → 4 ungemessen).

## 11.11. w28-r6-konsum (Cloud) — Abgabe 67241273 (Zweig `w28-r6-konsum` von punkte-maschine, gemergt mit 818f39f0)
- **Geschnitten:** R6 urteilt nach Konsum. `konsum-zeuge.cjs` fährt in jedem node-Prozess eines Laufs (Knoten: Funktionen der Linsen-Bibliotheken immer; Seite: nur headless ohne Zeit-Urteil; Sitzung: je Probe ein Fenster der Welt, das Boot einmal). `frischUrteil` legt die Konsum-Menge gegen den Diff; ohne sie urteilt eine Hälfte wie bisher und steht beim Namen in der Zeile `R6 nach Konsum: n von m Hälften`.
- **Gemessen** (Tafel in `bericht/1111-r6-konsum.md`): heute veraltet je Landung 388 · 388 · 388 · 388 · 315 von 388. An 119 headless-Stationen mit Konsum-Menge: 119 · 119 · 119 · 119 · 60 → 118 · ≤ 37 · ≤ 119 · ≤ 119 · ≤ 115. Vier der fünf Landungen ändern Code, den fast jede Station ausführt (Kern-Tafel und Wald-Plan, `starteBrowser`, `messort`, der Boden) — dort ist „alle alt“ wahr; nur die schmale Landung (2d5f4146) fällt auf ein Drittel.
- **Für die Karten:** kein Karten-Lauf trägt bisher eine Konsum-Menge (0 von 239). Sie entsteht mit der ersten Sitzung am Kopf dieses Zweigs; die Seite der Proben urteilt dort weiter nach dem Glob (64 % der Hälften). Bitte beim ersten Lauf ansehen: die Zeile `R6 nach Konsum` der Buchung, `konsumFehlt` in den Einträgen (jede Probe ohne Konsum-Menge nennt den Grund) und die Dauer der Fahrt (die Nahme je Probe kostete an der echten Werkbank unter Last 84–439 ms).
- **Neu:** `node punkte.cjs beruehrt --basis <sha> --kopf <sha> [--json]` — je Gerät `nur=…` der Hälften, die der Diff berührt (frisch an der Basis, alt am Kopf), daneben die schon an der Basis offenen.
- Am Kopf: `node meisterkarte-quelle/punkte/punkte.cjs selbsttest` GRÜN 222/222 (284,7–286,7 s; vor dem Zweig 187/187 in 282,6 s auf demselben Rechner — die 3 min reißt der Selbsttest hier schon ohne diesen Zweig). `liste`: 276 Stationen, 0 Fehler.
- Eine zweite Messung mit Zeugen läuft noch (b269f840, für die fünfte Landung am Vorgänger gemessen statt übertragen); ich reiche die Zahl hier nach.
