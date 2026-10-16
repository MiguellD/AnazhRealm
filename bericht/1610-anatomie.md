# Bericht 1610 Anatomie — wohin Zeit, Kontext und Aufmerksamkeit der Arbeiter gehen (Workflow wf_34499403-bac)

**Status: ZWISCHENSTAND.** Frage des Schoepfers 16.10.: Bauer 1–2 h, Pruefer 30–60 min — ist das System KI-gerecht organisiert?

## Entscheide des Koordinators (gebaut, 16.10.)

1. **CI zuerst** (artifacts/profiband/werkzeug/karte.js): nach Bau und jeder Nachbesserung liest ein billiger CI-Waechter die Zweig-CI; ROT geht direkt an den Nachbesserer, der Pruefer kommt nur auf gruene CI und faehrt keine CI-Gates nach. Beleg: 39 von 60 Nein-Runden trugen ein rotes CI-Urteil, Prueferzeit darin 10,6–22 h.
2. **champion traegt 9 statt 48 Werkzeuge** (integ 1d92c02b).
3. **Wackel-Linsen in Ereignis-Zeit:** Karte SO (Settlement Teil O), OMEN S5/W5 — 8 Runden, 9,6 h.
4. **D2 zu Ende** (Pflicht D(2)), der EINE Rumpf-Schneider heilt die Klasse erster Text-Treffer.
5. **KI1:** die Laufzeit-KI sah 40 von ~70 Ops (stamm/02b.js:1147 slice(0, 40)).
6. **OMEN in EINER Welt** fuer Schalter-Aenderungen (Minuten statt 3 h).

Verworfen nach Gegenpruefung: Tuer/schreibt als deklarierte Daten (Zwilling von rufe()/zustand oder Engstelle), --betroffen als Speisung von voll (haette 3 von 13 roten Gates uebersprungen), Abdruck je Glied als Tafel-Heilung (77 von 161 Marken aus Kernen).

## Zeit-Anatomie (288 Arbeiter, 212,6 h)

Datensatz: 288 Arbeiter-Agenten aus zwei Sitzungen, 14.10. 19:30 bis 16.10. 13:14 UTC (6fa51df3: 259, a8ac36ca: 29; die 3 laufenden Mess-Agenten dieses Workflows sind ausgenommen). 31 537 API-Nachrichten, 34 255 Werkzeug-Aufrufe, 212,6 h Arbeiter-Wanduhr.

**A. Rollen (Median / Summe)**

| Rolle | n | Wanduhr Median min | Wanduhr Summe h | Aufrufe Median | Aufrufe Summe | Kontext-Ende Median k | Kontext-Ende Summe M | Kontext-Volumen Median M | Kontext-Volumen Summe M | Output Summe M | Übergaben |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Bauer | 50 | 49 | 47,2 | 163 | 8 163 | 368 | 18,0 | 36,3 | 1 887 | 6,6 | 25 |
| Nachfolger (bauN + fixN-M) | 57 | 51 | 57,3 | 145 | 7 990 | 305 | 17,7 | 27,2 | 1 626 | 6,1 | 25 |
| Prüfer | 99 | 20 | 41,0 | 76 | 7 636 | 220 | 21,8 | 11,6 | 1 216 | 5,3 | 0 |
| Nachbesserer | 53 | 45 | 48,7 | 143 | 7 463 | 313 | 16,4 | 28,6 | 1 466 | 6,0 | 10 |
| ALLE (inkl. 5 Einzel, 24 Sonstige) | 288 | 37 | 212,6 | 115,5 | 34 255 | 272 | 81,7 | 20,0 | 6 782 | 26,4 | 60 |

- **Kontext-Ende** ist der Kontext der LETZTEN API-Nachricht. Genau diese Zahl summiert workflows/*.json als totalTokens; die Gegenprobe stimmt auf 0,2 %.
- **Kontext-Volumen** ist dieselbe Größe, summiert über ALLE API-Nachrichten. Das ist die Menge, die tatsächlich gelesen wird: 83-mal so viel wie gebucht.
- Je Karte im Median: 115 M Kontext-Volumen gegen 1,29 M gebuchte totalTokens.

**B. Wanduhr-Anteile je Rolle**

Die Zeit ist fair geteilt, wenn Aufrufe parallel liefen. Modell = Wanduhr minus Werkzeug-Zeit.

| Gruppe | Bauer | Nachfolger | Prüfer | Nachbesserer | alle h | alle % |
|---|---|---|---|---|---|---|
| Modell (Denken, Schreiben, API-Latenz) | 38,2 % | 31,9 % | 35,9 % | 33,6 % | 74,6 | 35,1 % |
| Warten (Schloss, eigene Läufe, CI) | 28,9 % | 35,3 % | 34,4 % | 25,9 % | 66,8 | 31,4 % |
|   davon GPU-Schloss | 13,3 % | 21,6 % | 15,7 % | 11,7 % | 32,8 | 15,4 % |
|   davon eigener Mess-Lauf | 8,8 % | 9,8 % | 6,6 % | 5,2 % | 16,1 | 7,6 % |
| Prüf-Apparat (gate/diag, playtest, check, puls) | 18,4 % | 16,3 % | 11,5 % | 24,6 % | 35,9 | 16,9 % |
| Messen und Bild (werkbank, Sonden, Scratch-Skripte) | 10,3 % | 13,4 % | 9,4 % | 12,8 % | 24,8 | 11,6 % |
| Lesen (Read, sed/grep/cat, git show/log, atlas) | 3,0 % | 2,5 % | 5,5 % | 2,2 % | 7,3 | 3,4 % |
| Gestell (npm ci, Worktree, git schreiben, Ports) | 0,9 % | 0,4 % | 3,1 % | 0,7 % | 2,5 | 1,2 % |
| Edit/Write | 0,1 % | 0,0 % | 0,0 % | 0,1 % | 0,1 | 0,0 % |

**C. Karten in karte.js (46 Workflow-Karten)**

- **Bau-Kette** (Bauer + Nachfolger): Median 91 min, Summe 72,7 h. Gezählt über 39 Karten mit Bau.
- **Abnahme** (Prüfer + Nachbesserer + deren Nachfolger): Median 126 min, Summe 103,4 h (Prüfer 40,6 h, Nachbesserung 62,8 h). Gezählt über 39 Karten mit Abnahme.
- **Abnahme-Anteil an der Karten-Arbeiterzeit: 58,7 %.** Workflow-Dauer im Median 207 min.
- **Prüfer-Urteile:** 72 „merge-reif: nein“ gegen 26 „ja“.
- **Abgleich mit dem Gefühl des Schöpfers:**
  - „1–2 h Bauer“ stimmt für die Bau-Kette: Median 1,5 h.
  - Ein einzelner Prüfer braucht nur 20 min im Median.
  - Die Abnahme je Karte (2 Prüfer + Nachbesserung) ist mit 126 min aber länger als der Bau.

### Senken

- **Abnahme-Schleife: Prüfen, ROT, Nachbesserung, erneut prüfen. 73 % der Prüfer-Urteile sind „nein“, und jedes Nein startet einen frischen Nachbesserer. Der ganze Kontext wird dafür neu aufgebaut.** — 58,7 % der Karten-Arbeiterzeit (103,4 von 176,1 h): Nachbesserung 62,8 h, Prüfer 40,6 h. Abnahme je Karte Median 126 min, Bau-Kette Median 91 min. (bericht.md §10 (node aggregate.js agents-roh.jsonl <wurzeln> > bericht.md). Urteile 72 nein / 26 ja in vertiefung.txt §4 (node vertiefung.js agents-roh.jsonl <wurzeln>; Quelle journal.jsonl je Workflow, Label pruef*).)
- **Modellzeit (Denken, Schreiben, API-Latenz). Das ist Arbeit, aber sie wächst mit dem Kontext: je API-Nachricht von 6,8 s im Kontext-Quartil 1 (141k) auf 8,9 s im Quartil 4 (253k), +31 %.** — 35,1 % der Arbeiter-Wanduhr (74,6 h) (bericht.md §2. Quartile in modell-kontext.txt (node modell-kontext.js agents-roh.jsonl).)
- **Kontext-Grundlast: Jede API-Nachricht liest den Start-Kontext von Median 74k Tokens (p10 69k, p90 77k) neu. Er enthält 48 Werkzeug-Schemata, davon 20 Browser-, 3 Docs-, 2 Visualize- und 5 Session/Turn-Werkzeuge, die kein Arbeiter braucht. Dazu kommen CLAUDE.md mit 21,6 KB (≈ 6–7k), der Auftrag (Median 10,6k Zeichen ≈ 3k) und der System-Text (5 160 Zeichen). Der Rest von ≈ 60k ist als Differenz abgeleitet, nicht gezählt.** — 34,2 % des gesamten Kontext-Volumens (6 782 M Tokens) (modell-kontext.txt (Grundlast = ctxErst × Zahl der API-Nachrichten). Werkzeug-Liste in agent-*.prefix.json state.toolNames (48 Namen), systemCharCount 5160.)
- **Warten gesamt. Erstens auf das EINE GPU-Schloss: 23,8 h davon sind direkte Poll-Schleifen auf gpu-schloss/. Zweitens auf eigene Hintergrund-Läufe und das CI-Polling (eigener Mess-Lauf 16,1 h, Hintergrund-Task 5,8 h, sonst 5,6 h, CI-Abfrage per curl 3,0 h). Die Warte-Schleifen laufen in den 10-min-Deckel des Bash-Werkzeugs: 235 Timeout→Hintergrund in 104 Agenten, dazu 951 run_in_background.** — 31,4 % der Arbeiter-Wanduhr (66,8 h). Das GPU-Schloss allein trägt 15,4 % (32,8 h). Betroffen sind 137 von 288 Agenten (47,6 %); sie verlieren 24,3 % ihrer Wanduhr (Median 7 min, Max 87 min). Nachfolger verlieren 21,6 %. (bericht.md §2/§8, schloss-split.txt (node schloss-split.js agents-roh.jsonl). 97 % der Schloss-Wartezeit fällt an, wenn ≥ 4 Arbeiter gleichzeitig laufen. Im Mittel liefen letzte Woche 5,2 gleichzeitig (Max 11), heute 9,1 (Max 12); siehe vertiefung.txt §3.)
- **Übergaben am Kontext-Deckel und Nachfolger. 60 Übergaben fielen bei Median 151,5 Aufrufen, 356k Kontext und 47 min, obwohl die Regel ~120 Aufrufe sagt; 133 von 288 Agenten liegen über 120 Aufrufen. Der Nachfolger startet mit 75k Grundlast und liest zu 70,6 % Dateien neu, die sein Vorgänger derselben Karte schon gelesen hatte (76,6 % der Lese-Bytes).** — 26,9 % der Arbeiter-Wanduhr (57,3 h Nachfolger). Ihre Re-Orientierung bis zum ersten Repo-Edit kostet 9,1 h, 2 352 Aufrufe und 7,5 MB. (bericht.md §7, §9 (Re-Lesen = Datei-Lese-Akte, deren Pfade alle schon ein früherer Agent desselben wf+Karte las). Prüfer 69,6 % und Nachbesserer 73,3 % Re-Lesen.)
- **Orientierung vor dem ersten Repo-Edit. Dazu gehören Lesen (3 810 Aufrufe, 14 MB), die Linse vorher ROT (gate-diag 994 Aufrufe, 1,1 h), werkbank und eigene Sonden (1 230 Aufrufe, 3,2 h) sowie das Warten auf eigene Mess-Läufe (1,3 h).** — Bauer: 26,6 % der Wanduhr, 40,1 % der Aufrufe und 68,1 % des Ergebnis-Zuflusses kommen vor dem ersten Edit (Median 11 min, 62,5 Aufrufe, 209 KB). Nachfolger 16,6 % / 61,0 %, Nachbesserer 16,3 % / 59,0 %. (bericht.md §4 (erster Edit/Write auf einen Pfad unter AnazhRealm-*, Temp ausgenommen))
- **Späte Aufrufe im aufgeblähten Kontext. Weil jeder Aufruf den ganzen Kontext neu liest, wächst das Volumen quadratisch mit der Aufrufzahl.** — API-Nachrichten ab Nr. 61 tragen 62,9 % des Kontext-Volumens, ab Nr. 121 noch 22,6 %. (modell-kontext.txt und bericht.md §9 (ctxSeq je API-Nachricht aus usage, je message.id dedupliziert))
- **Prüf-Apparat: gate/diag 21,2 h (5 330 Aufrufe in 273 Agenten), npm run check 8,2 h (172 Läufe, Mittel 172 s, 128 Agenten), playtest 3,9 h (playtest:fast in 116 Agenten), Puls (eslint/prettier/node --check) 2,3 h. Insgesamt 672 rote Exits in 209 Agenten.** — 16,9 % der Arbeiter-Wanduhr (35,9 h), bei Nachbesserern 24,6 %. Die Ausgaben machen 18,5 % des Ergebnis-Zuflusses aus (11,4 MB). (bericht.md §2/§3. Zeit je benanntem Gate in vertiefung.txt §1 (check 5,9 h, check:statik 2,9 h, diag-asset-contract 1,35 h, diag-settlement 1,28 h mit 27/46 rot).)
- **Lese-Zufluss in den Kontext über sed -n und grep statt über einen Index. 2 432 Suchen per grep -n nach _Methoden im Stamm in 271 Agenten stehen 228 Aufrufen von atlas --find gegenüber. Ein Bauer liest im Median 9 verschiedene Stamm-Dateien je Karte (Max 20), ein Nachfolger 7.** — Lesen trägt 50,1 % aller Werkzeug-Ergebnis-Bytes (31,1 MB ≈ 8,9 M Tokens ≈ 14,7 % des Kontext-Zuwachses von 60,4 M). sed -n allein liefert 14,7 MB (47 % der Lese-Bytes), davon 12,1 MB aus stamm/. (vertiefung.txt §2, streuung.txt (node streuung.js agents-roh.jsonl), bericht.md §3)
- **Messen und Bild: werkbank 18,9 h (4 249 Aufrufe in 263 Agenten), eigene Scratch-Sonden 4,7 h, node -e 1,2 h. Zusätzlich kommen 1 322 Bilder in den Kontext.** — 11,6 % der Arbeiter-Wanduhr (24,8 h); 12,1 % des Ergebnis-Zuflusses (bericht.md §2/§3)

### Orientierung

Orientierung heißt hier: vom Start des Agenten bis zum ersten Edit oder Write in eine Repo-Datei (Pfad unter AnazhRealm-*, Temp ausgenommen).

**Was die Orientierung je Rolle kostet**
- **Bauer** (44 von 50 mit Repo-Edit): Median 62,5 Aufrufe, 11 min und 209 KB Ergebnis-Text. Das sind 40,1 % ihrer Aufrufe, 26,6 % ihrer Wanduhr und 68,1 % aller Ergebnis-Bytes, die sie je in den Kontext holen.
- **Nachfolger:** 46 Aufrufe, 9 min, 138 KB (31,6 % der Aufrufe, 16,6 % der Zeit, 61,0 % der Bytes).
- **Nachbesserer:** 37 Aufrufe, 7 min, 123 KB (28,3 % / 16,3 % / 59,0 %).
- **Prüfer** editieren nie: Median 76 Aufrufe, und 50,3 % ihrer Ergebnis-Bytes sind Lesen.
- Dazu kommt bei jedem Agenten die Grundlast von 74k Tokens, bevor er überhaupt etwas tut.

**Was vor dem ersten Edit passiert** (Bauer + Nachfolger + Nachbesserer zusammen)
- Lesen: 3 810 Aufrufe, 2,1 h, 14,0 MB.
- gate-diag (Linse vorher ROT): 994 Aufrufe, 1,1 h, 3,9 MB.
- werkbank/Bild: 927 Aufrufe, 1,6 h, 2,8 MB.
- Eigene Scratch-Sonden: 303 Aufrufe, 1,6 h.
- Warten auf eigene Mess-Läufe: 50 Aufrufe, 1,3 h.
- Gestell (git worktree add, npm ci, netstat, git fetch/merge): klein in Zeit, aber in fast jedem Agenten.

**Was in der Orientierung gelesen wird** (Zahl der bauenden Agenten, n = 165)
- docs/PFLICHT-OFFEN.md: 99, obwohl CLAUDE.md den Spiegel trägt.
- package.json: 77 (Skript- und Gate-Namen nachschlagen).
- stamm/26c.js (Konstanten): 60.
- scripts/atlas.cjs: 57 (das Werkzeug lesen statt es zu benutzen).
- stamm/25c.js: 55; 20a: 41; phyto-core.js: 40; 17c, 07 und foundry-core je 38; 20c: 37; 11c: 33.
- auftrag/nordstern.md: 32; vendor/three.webgpu.min.js: 31; scripts/lib/welt-boot.cjs: 28.

**Gefahrene Befehle in der Orientierung**
- git ls-remote 160/165, git log 155, git status 132, git diff 109, git fetch 90.
- atlas --find 57 + 25 (npm-Variante), git worktree add 51, netstat 45, npm ci 40, werkbank start 21.

Quelle: bericht.md §4/§4b/§4c (node aggregate.js agents-roh.jsonl <wurzeln>).

### Wiederholt

Viele Arbeiter finden dieselben Dinge unabhängig voneinander neu heraus.

**1) Dieselben Dateien** (Agenten von 288 · Lese-Akte · KB, bericht.md §5)
- package.json: 166 · 288 · 298 — Gate- und Skript-Namen nachschlagen; es gibt keinen maschinenlesbaren Index „welche Linse bewacht welche Domäne“.
- docs/PFLICHT-OFFEN.md: 152 · 177 · 617.
- stamm/26c.js: 104 · 211 · 575.
- stamm/25c.js: 100 · 281 · 1 147 (Kosten- und Ankunfts-Schicht, liegt unter „HUD“).
- stamm/20a.js 81, 20c.js 77, 07.js 77, 11c.js 76.
- scripts/atlas.cjs: 75 · 82.
- index.html (Stamm-Tags): 73.
- foundry-core.js: 69 · 334 · 779; phyto-core.js: 68 · 236.
- stamm/17c.js: 67.
- .github/workflows/check.yml (CI-Gruppen verstehen): 63 · 132.
- vendor/three.webgpu.min.js: 62 · 235 Akte.
- scripts/lib/software-gpu.cjs (Linsen-Start): 58.
- scripts/lib/welt-boot.cjs 47, spec/abnahme/soll-tafel.json 46, uebergabe-2026-10-14.md 37, auftrag/nordstern.md 34.
- Summen: stamm/*.js 3 879 Lese-Akte und 12,5 MB; *-core.js 1 067 Akte und 2,5 MB; scripts/ 1 138 Akte und 2,5 MB.

**2) Innerhalb derselben Karte** lesen spätere Arbeiter zu ~70 % Dateien, die ein Vorgänger schon gelesen hat:
- Nachfolger 70,6 % der Akte (76,6 % der Bytes).
- Prüfer 69,6 %.
- Nachbesserer 73,3 %.

Quelle: bericht.md §7.

**3) Dieselben Befehle** (Agenten · Aufrufe, bericht.md §6)
- git ls-remote 270 · 668; git log 283; git diff 261; git status 253.
- netstat (Port-Prüfung) 194 · 353.
- git worktree add 193 · 244 (davon 118 Prüfer-Worktrees); git worktree remove 144.
- npx eslint 170; npx prettier 150.
- npm ci 141 · 159 (mit Junctions 253 Installationen in 159 Worktrees; Median 2 s, Summe 0,7 h — billig, aber überall).
- npm run playtest:fast 129 · 154.
- curl 118 · 711 und git credential 106 · 643: jeder Agent baut sich sein eigenes CI-Polling über die GitHub-API.
- git merge-tree 110; node diag-atlas.cjs --check 108; node diag-betriebsgesetz.cjs 99 · 180; npm run stamm:lint 89; npm run check 85 · 123.
- node werkbank.cjs start / stop / eval / umstellen: je 57–65 Agenten.
- sleep 229 Agenten · 1 185 Aufrufe; until 154 · 608 — handgebaute Warte-Schleifen.
- Zum Finden einer Methode: 2 432 grep -n-Suchen nach _Methoden im Stamm in 271 Agenten, aber nur 228 atlas --find (streuung.txt).

**4) Dieselben Fallen** (Agenten · Ereignisse · Rohdauer, bericht.md §8)
- **GPU-Schloss-Warten:** 137 · 516 · 32,8 h, davon 23,8 h direktes Pollen auf gpu-schloss/ (schloss-split.txt). Meldungen „belegt / KEIN SCHLOSS“ in 64 · 122; VERWAIST in 58 · 77.
- **Bash-Deckel → Hintergrund:** 104 · 235 · 32,7 h Rohdauer. Davon fallen 11,7 h auf Schloss-Warten und 5,9 h auf das Warten auf eigene Läufe.
- **Linsen- oder Sonden-Absturz** (TypeError, Target closed, Protocol error, Page crashed … in gate/werkbank/playtest-Ausgabe): 120 · 184.
- **ENOENT:** 183 · 386.
- **EXIT ≠ 0 in Prüf-Befehlen:** 209 · 672 (enthält die gewollte Linse vorher ROT).
- **EADDRINUSE:** nur 22 · 28. Die netstat-Vorprüfung in 194 Agenten hält diese Falle klein, kostet aber selbst in jedem Agenten Aufrufe.
- **Timeouts im Ergebnis-Text:** 26 · 54.
- **EBUSY/EPERM:** 5 · 6.
- **npm ci je Worktree:** 181 Agenten, nur 0,7 h.

**5) Ohne eigenes Werkzeug gelöst:** dieselbe Lauf-Infrastruktur (Schloss nehmen, Lauf starten, Log pollen, Schloss lösen) baut fast jeder Arbeiter selbst im Scratch nach. Belege: eigene lauf.sh, warte-schloss.cjs, schloss-ab2.cjs und node -e-Tick-Schleifen; Beispiele in kat-probe2.txt.

## Gegenpruefung (wörtlich)

**Gegenprüfung des Entwurfs „der Graph, in dem eine Änderung simpel wird“**

Der Entwurf hält in der Diagnose. In der Bilanz und im ersten Schnitt hält er nicht: Belegbar fallen durch den Graph nur 5,8 bis 9,0 h von 212,6 h, nicht „bis ¼“. Der größte billige Hebel ist eine Workflow-Regel: den Prüfer erst auf grüner Zweig-CI rufen, das sind 10,6 bis 22,0 h.

Wurzeln:
- S = `C:\Users\micha\AppData\Local\Temp\claude\C--Users-micha-AnazhRealm-profiband\a8ac36ca-5aac-4e92-aeb3-ddb04484de2b\scratchpad\gegenpruefung\`
- Z, E, K = `…\Temp\claude\anatomie-zeit`, `…\anatomie-entwurf`, `…\anatomie-kopplung`
- I = `C:\Users\micha\AnazhRealm-integ` (cee33f91; `git status` leer, nichts verändert)

## (a) Tragen die Zahlen?

**Nachgerechnet und richtig:**
- 58,7 % Abnahme-Anteil, 72 Nein gegen 26 Ja, 49 Nein-Urteile beginnen mit „CI“, 73 von 193 Apparat-Punkten
- 1 041 Text-Vorkommen gegen 3 `__consumes`-Rufe (playtest.cjs:1005, 1008, 1009)
- 2 432 grep gegen 228 `atlas --find`, 141 Gates erben welt-boot, 339 und 52 `state`-Schlüssel, `time_passed` liest die Wanduhr (02a.js:2155)
- 172 173 = 124 199 Dateizeilen + 40 811 Prüf-Lesezeilen + 7 163 Ruf-Fenster (aus K\domaene.json)

**Falsch oder überzogen:**

| Behauptung | Nachgerechnet | Rohdatei · Befehl |
|---|---|---|
| Apparat-Abnahme „sicher mindestens 28 h“ | Zu zählen ist je Runde, nicht je Urteil: 21 von 60 Nein-Runden tragen nur Apparat-Punkte, zusammen 15,8 h Nachbesserung + 8,5 h Prüfung. Nur 8 Runden liegen ganz in Klassen, die der Graph trifft (Linse am alten Code, Konflikt, Tafel-Zahl): **5,8 h**. 8 der 21 Runden tragen Flackern (9,6 h). | S\runden.txt · `node S\runden.js E`; S\runden-zeit.txt · `node S\runden-zeit.js Z S\runden.txt` |
| Modellzeit bei kleinem Kontext ≤ 9,8 h | Die Latenz je Output-Token ist in allen vier Kontext-Quartilen gleich (9,9 / 10,5 / 9,9 / 9,9 ms). Die +31 % Zeit je Nachricht folgen der Output-Länge (685 → 900 Tokens), nicht dem Kontext. Weniger Kontext spart Tokens, keine Zeit. | S\modell-je-token.txt · `node S\modell-je-token.js Z` |
| GPU-Schloss 32,8 h „vermeidbar“; 23,8 h direktes Pollen | Nach der Warte-Bedingung warten nur 4,7 h nachweisbar auf das Schloss, 2,0 h gemischt, 4,9 h unklar. 21,2 h warten auf die Ende-Marke des **eigenen** Laufs, also samt eigener GPU-Arbeit (Physik). Die 23,8 h sind ein Wort-Treffer auf `gpu-schloss`. Die 97 % Warten bei ≥ 4 Arbeitern stehen gegen eine Basisrate von 79,6 %. | S\schloss-ziel.txt · `node S\schloss-ziel.js Z`; S\modell-je-token.txt |
| Vermeidbar mindestens 47,0 h | Belegbar sind **18,9 h** (47,0 − 32,8 + 4,7). | wie oben |
| Nachfolger 6,4 h | Die Re-Orientierung (9,2 h) besteht aus 5,8 h Modell und 3,4 h Werkzeug; Lesen sind davon nur 0,71 h, also ≤ 0,5 h Ersparnis. Wer frisch startet, muss die zu ändernden Dateien ohnehin neu lesen. | S\nachfolger-orient.txt · `node S\nachfolger-orient.js Z` |
| Bauer 4,3 h Lesen | Die 7,3 h sind alle Rollen; der Bauer hat 1,4 h. 47 % der Lese-Bytes sind `sed -n`-Fenster, die schmalere Dateien nicht verkleinern. | Z\bericht.md §2; Z\vertiefung.txt |
| Integrator 4,4 h | `npm run check` ist eine &&-Kette aus etwa 60 statischen Schritten, gefahren von Bauer und Nachbesserer. Das Gate-Verhältnis 79/173 gilt dafür nicht. | I\package.json `check:statik` |
| „heute 79 von 173 Gates“ | Mit Libs, also der heutigen Erwähnung, sind es 151. 79 ist die Variante ohne Libs. Diese hätte 3 von 13 tatsächlich roten Gates übersprungen (asset-contract an K10-6, mp-sync und schatten-terminator an B3), mit Libs 1 von 13. | S\auswahl-rot.txt · `node S\auswahl-rot.cjs I K\modul-karte-d2.json K\glied-diff.json` |
| 52 Schlüssel mit mehreren Schreibern | 29 davon schreibt auch Speicher (das Laden); ohne den Ladepfad bleiben 36. | S\zustand-ohne-speicher.txt · `NODE_PATH=I\node_modules node S\zustand-ohne-speicher.cjs …\anatomie-beste\main` |
| tools:-Zeile ≈ 17 % | Die Zahl ist nach Anzahl verteilt (30/48 × ~60k), nicht nach Größe. Meine Schätzung nach Größe: ~10k von 74k Tokens, also 4–5 % des Volumens, und es spart Tokens, keine Zeit. Messen lässt es sich mit einem Agenten mit tools:-Zeile (erster Kontext vorher und nachher). | ungezählt |
| „Linse am alten Code 15 → 0“ | Nur 2–3 der 15 hängen am Ort (D2 trifft Aufruf statt Definition, K62 ruft das gefallene `_materialObserverDiaet`, K38-N2 sucht alte Signaturen). Der Rest sind Wert, Golden, Semantik oder Umgebung; K62/07.js:1397 ist eine **richtige** Rot-Meldung der Rückkehr-Wand. | S\linse-alt.txt · `node S\linse-alt.js E` |
| Datei-Besitz löst 11 Konflikte | Nur 3 der 11 berühren `stamm/`; 8 liegen in Goldens, soll-tafel, playtest.cjs, werkbank.cjs, welt-orte und Docs. | S\konflikt.txt · `node S\konflikt.js E` |
| 49 Urteile mit „CI rot“ → 0 und 711 curl → 0 durch Schnitt 3 | Beide Zahlen fallen durch die Workflow-Regel, nicht durch Schnitt 3. Unter den 49 sind echte Spiel-Regressionen (D8 WebGL, K62 PMREM, K60 mp-sync 1,924 m). | S\ci-zuerst.txt |
| Die Laufzeit-KI lernt ihre Ops aus Prosa | Die Op-Liste kommt aus `dslEffects`, ist aber bei 40 von 70 abgeschnitten (02b.js:1147). rule, chain, when und 27 weitere fehlen. | S\dsl-prompt.txt · `node S\dsl-prompt.cjs I` |

## (b) Zwilling oder Ersatz?

- **Gerechnetes ist kein Zwilling, solange es nicht gespeichert wird:** Ruf-Kanten aus `rufe()`, Linse → Glied, Lehre → Glied.
- **Die Tür ist ein Zwilling.** Wer fremd gerufen wird, rechnet heute schon ein Skript aus: 850 Glieder bei 19 Modulen, 1 339 (47,1 %) bei den D2-Teilmodulen (`oberflaeche-main.json`, `grenzen.txt`).
- **„schreibt“ ist ebenfalls ein Zwilling**; `zustand.cjs` rechnet die Schreiber.
- **Deklariert man beide als Norm mit Prüfung, wird die Karte zur Engstelle.** 9 der 17 Stamm-Karten hätten die Tür ändern müssen (43 Einträge), 1 Karte das „schreibt“. modul-karte.json würde damit das neue 26c.js (10 von 19 Karten). Beleg: S\tuer-churn.txt · `node S\tuer-churn.cjs I K`.
- **Die Lauf-Spur in welt-boot ist ein zweites Protokoll neben der Zweig-CI**, und Läufe auf dem eigenen Rechner sind kein Beweis.
- **Vieles, was der Graph „ersetzt“, leistet schon D2:** Es gibt kein 26c.js mehr, und 5ef73a3d führt den EINEN Rumpf-Schneider ein, womit 27 Klammer-Zähler in 21 Linsen fallen.

## (c) Wer hält ihn wahr, wird er ROT, wenn er lügt?

- **Mitgliedschaft im Modul:** ja, `diag-atlas` Regel R7 wird rot. Trotzdem brauchten beide integ-Merges seit D2-Start eine Karten-Commit von Hand (fa9ab13d, 25463946).
- **Tür und „schreibt“:** Der Entwurf nennt keine Prüfung. Sie veralten also still.
- **Tafel nach Modul mit Abdruck je Glied:** Sie kann falsch GRÜN melden, wenn ein nicht deklariertes Modul das Bild ändert. Außerdem kommen 77 der 161 veralteten Marken aus Kern-Dateien (foundry-core steht in 10 von 12 Zeilen), und Kerne liegen außerhalb der Stamm-Karte. Beleg: S\tafel-kern.txt · `node S\tafel-kern.js I K`.
- **`--betroffen`:** Es lügt grün bei Kopplung ohne Ruf-Kante. Beispiel: B3 änderte den Lade-Takt, rot wurde mp-sync. Speist es auch `voll`, laufen solche Brüche bis integ durch.
- **`stammLib.rumpf("x")`:** Das liest weiter Quelltext; D(3) verbietet das für Präsenz-Proben.
- **„1 041 → 0“:** Das nähme auch die Wächter gegen Zwillinge mit, etwa `countOcc(…) === 1` in diag-vehicle-drive A5. Solche Prüfungen lassen sich nicht in `__consumes` übersetzen.

## (d) Ist Schnitt 1 der billigste mit der größten Wirkung?

Nein.

- **Prüfer erst auf grüner Zweig-CI.** karte-script.js:25 sagt dem Bauer heute „NICHT auf die CI warten“, der Prüfer startet direkt danach.
  - 39 von 60 Nein-Runden tragen ein Urteil mit Kopf „CI“.
  - Prüferzeit in diesen Urteilen: 22,0 h. In den 27 Urteilen, die nur CI-Punkte tragen: 10,6 h (S\ci-zuerst.txt · `node S\ci-zuerst.js Z E`).
  - Die Diagnose der roten CI wandert dann zum Nachbesserer; die Netto-Ersparnis ist ungemessen.
- **Flackern auf Ereignis-Zeit:** 8 Runden, 9,6 h.
- **Prüfer fährt keine CI-Gates nach:** etwa 4,7 h.
- **Vorgewärmte Worktrees:** höchstens 1,3 h.
- **Ein geteilter Werkbank-Dienst über mehrere Zweige** ist nicht möglich, weil jeder Zweig eigenen Code und eine eigene Welt fährt.
- **D2 mergen** bleibt richtig, aber weil es Pflicht D(2) ist, nicht wegen der Graph-Rechnung.

## (e) Scope-Erfindung gegen das BETRIEBSGESETZ

**In D:**
- D2 mergen und `diag-atlas --check` rot bei fremdem Glied (D(2))
- `__codeOf`-Präsenz-Proben → `__consumes`, playtest.cjs zerlegen, EIN Stripper (D(3))

**Außerhalb von A/B/D/E:**
- Tür und „schreibt“, `--paket`, `--betroffen`
- Übergabe-Schema mit Lauf-Spur in welt-boot
- Lehre → Modul
- §5 DSL-Op-Knoten (Feature-Stopp)
- „Spielzeit an 16 Stellen“, soweit es nicht Linsen-Reparatur ist

Neue Werkzeuge in `scripts/` müssten außerdem unter die DECKE, die nur sinken darf. Die Workflow-Änderungen (karte.js, tools:-Zeile) betreffen das Repo nicht und sind kein Scope.

## Ende

**Fallen:**
- „bis ¼ der Wanduhr“: Durch den Graph belegbar sind 5,8–9,0 h von 212,6 h (S\runden-zeit.txt).
- Tür und „schreibt“ als deklarierte Daten: Sie sind ein Zwilling von `rufe()` und `zustand`, oder als Norm eine Engstelle, die 9 von 17 Karten berührt hätte (S\tuer-churn.txt).
- `--betroffen` als Speisung von `voll`: Die Auswahl ohne Libs hätte 3 von 13 tatsächlich roten Gates übersprungen (S\auswahl-rot.txt).
- Abdruck je Glied als Heilung der Tafel: 77 der 161 Marken kommen aus Kernen, und es gibt keine Rot-Meldung gegen falsches Grün (S\tafel-kern.txt).
- „Linse am alten Code 15 → 0“ und „Datei-Besitz löst 11 Konflikte“: Es sind nur 2–3 von 15 und 3 von 11 (S\linse-alt.txt, S\konflikt.txt).
- Modellzeit ≤ 9,8 h: 9,9 ms je Output-Token in jedem Kontext-Quartil (S\modell-je-token.txt).
- §5 als Teil des Wegs: kein Eintrag in PFLICHT-OFFEN.

**Bleiben:**
- D2 zuerst mergen, als Pflicht D(2) und schon gebaut (origin/stamm-domaene 15e2ecf7).
- Linsen nennen ihr Glied beim Namen; das heilt die Klasse „trifft Aufruf statt Definition“ (pruef1:D2, 5ef73a3d).
- Prüfer erst auf grüner Zweig-CI, aufgewertet zum ersten Hebel mit 10,6–22,0 h (S\ci-zuerst.txt).
- Flackern auf Ereignis-Zeit, 8 Runden und 9,6 h (S\runden-zeit.txt).
- Die tools:-Zeile, als Token-Hebel.

**Geändert:**
- „Vermeidbar ≥ 47 h“ wird zu belegbar 18,9 h, weil 21,2 h der Schloss-Zeit auf den eigenen Lauf warten (S\schloss-ziel.txt).
- Nachfolger 6,4 h wird zu ≤ 0,5 h Lese-Werkzeugzeit (S\nachfolger-orient.txt).
- 52 Mehrfach-Schreiber werden zu 36 ohne den Ladepfad (S\zustand-ohne-speicher.txt).
- „79 Gates heute“ wird zu 151 mit Libs (E\libs.txt).
- „Die KI lernt aus Prosa“ wird zu: Die Op-Liste ist bei 40 von 70 abgeschnitten, 02b.js:1147 (S\dsl-prompt.txt).
- tools:-Zeile 17 % wird zu geschätzt 4–5 % des Volumens, ungezählt.

**Offen:**
- wer das Schloss hält, ohne die GPU zu nutzen
- die Netto-Verschiebung der Diagnose zum Nachbesserer
- die echte Token-Größe der Werkzeug-Schemata
- der Gewinn einer parallelen `check:statik`

## Entwurf (wörtlich, vor der Gegenpruefung)

# Entwurf: der Graph, in dem eine Änderung simpel wird

Stand 16.10. Ich habe nur gelesen: Kopplung, Auswahl und DSL an integ-probe cee33f91, Oberfläche und Zustand an main aa74c324, die Zeit über 288 Arbeiter. Meine eigenen Skripte und Rohdaten liegen in `C:\Users\micha\AppData\Local\Temp\claude\anatomie-entwurf\` (Kürzel [E]). Die anderen Kürzel stehen unter Quellen am Ende.

**Antwort.** Der Verdacht stimmt, aber es liegt nicht an langsamen Arbeitern. Das System kann die Frage „was berührt meine Änderung?" nicht maschinell beantworten, also beantwortet jede Rolle sie neu:
- der Bauer per grep: 2 432 Suchen gegen 228 `atlas --find`
- die CI per voller Batterie: 173 Gates
- der Prüfer per CI-Lesen: 49 von 72 Nein-Urteilen beginnen mit „CI rot"
- der Nachfolger per Neu-Lesen: 70,6 % seiner Lese-Akte

Die Antwort ist EIN Graph aus der Modul-Karte, der Glieder, Zustand, Linsen, Tafel und Messorte verbindet. Die Knoten gibt es schon (Modul-Karte D2, `stamm.cjs`, `__consumes`, `codeAbdruck`), es fehlen die Kanten. Erwartet: bis ¼ der Arbeiter-Wanduhr fällt (obere Schranke 56 von 213 h); die Physik bleibt (eine GPU, Boot, Bild).

## 1 Diagnose

| Senke | Anteil | Organisation oder Physik |
|---|---|---|
| **Zeit: Abnahme-Schleife** | 58,7 % der Karten-Arbeiterzeit (103,4 von 176,1 h); 72 nein gegen 26 ja [Z §10] | Mindestens 22 von 72 Nein-Urteilen (31 %) tragen NUR Apparat-Punkte. Von 193 roten Punkten sind mindestens 73 (38 %) Apparat: Linse blind 20 · Linse am alten Code 15 · Flackern 13 · Konflikt 11 · Tafel-Zahl 9 · Decke 5 [E urteile2]. Der Rest ist echte Prüfung (Bild, Verhalten, Kosten). |
| **Zeit: Warten** | 31,4 % der Wanduhr (66,8 h), davon GPU-Schloss 15,4 % (32,8 h) [Z §2] | Das Schloss ist Reihenfolge: 97 % des Wartens fallen an, wenn ≥ 4 Arbeiter gleichzeitig laufen; 23,8 h sind direktes Pollen [Z schloss-split]. Die eigenen Läufe (16,1 h) sind Physik. |
| **Kontext: Grundlast und späte Aufrufe** | Grundlast 34,2 % des Kontext-Volumens (74k je Nachricht); Nachrichten ab Nr. 61 tragen 62,9 % [Z modell-kontext] | Organisation: 30 der 48 Werkzeug-Schemata braucht kein Arbeiter (20 Browser, 3 Docs, 2 Visualize, 5 Sitzung), denn `champion.md` hat keine `tools:`-Zeile. Gelesen wird nach Datei statt nach Glied. |

**Bilanz der 212,6 h:**
- **Vermeidbar (Organisation), mindestens 47,0 h (22 %):** Schloss 32,8 · Lese-Überschuss nach Datei 4,3 · `npm run check` auf Unbetroffenem 4,4 · CI-curl 3,0 · Gestell 2,5.
- **Physik, etwa 40,9 h (19 %):** eigene Läufe 16,1 · Messen und Bild 24,8.
- **Modell, 74,6 h (35 %):** das ist Arbeit, wird aber mit dem Kontext langsamer (6,8 → 8,9 s je Nachricht von Quartil 1 zu 4). Höchstens 9,8 h davon sind Aufblähung.

**Aufmerksamkeit:** Der Bauer verbringt 40,1 % seiner Aufrufe und 68,1 % seines Zuflusses vor dem ersten Edit. Die meistgelesenen Dateien sind Nachschlagewerke: package.json (166 Agenten, für Gate-Namen), PFLICHT-OFFEN (152), `26c.js` (104) [Z §4/§5].

**Die Wurzel in der Struktur [K]:**
- 45,1 % der 8 715 Aufruf-Kanten kreuzen eine Modul-Grenze, ohne dass eine Tür deklariert ist.
- 52 `state`-Schlüssel werden von mehreren Modulen geschrieben [B].
- Linsen finden ihr Glied am Text: 1 041 Text-Vorkommen gegen 3 `__consumes`.
- Die Tafel stempelt ganze Dateien: 161 veraltete Zeilen-Marken in 30 Karten.

## 2 Die Tag-Struktur: EIN Graph

Die Quelle ist `spec/stamm/modul-karte.json` (D2: 3 368 Namen in 50 Teil-Modulen, `ordnung` = Dateien). Deklariert wird nur, was der Code nicht selbst sagt. Alles andere rechnet der EINE Leser `scripts/lib/stamm.cjs`, und `diag-atlas.cjs` druckt es. Gerechnetes wird nie gespeichert, deshalb entsteht kein Zwilling.

| Knoten / Kante | Herkunft | heute |
|---|---|---|
| Modul → Datei, Glieder | Karte | vorhanden (D2, Zweig `stamm-domaene`) |
| Modul → **Tür** (öffentliche Glieder) | Karte, deklariert | fehlt; 850 von 2 481 Gliedern werden fremd gerufen [B] |
| Modul → **schreibt** (`state`-Schlüssel) | Karte, deklariert; das Lesen wird gerechnet | fehlt; 339 Schlüssel, 52 mit mehreren Schreibern |
| Glied → Glied (Ruf) | `stamm.cjs rufe()` | vorhanden |
| Linse → Glied | gerechnet aus den Zugriffen `__consumes(…,"x")` und `stammLib.rumpf("x")` | 3 Kanten; die 1 041 Text-Vorkommen sind für den Graph unsichtbar |
| Tafel-Klasse → Modul, Messort | `klasse.quellen` als Modul-Namen | heute 112 Datei-Verweise |
| Lehre → Modul | gerechnet aus den CLAUDE.md-Zeilen, die ein Glied zitieren | nur Prosa |

Daraus folgt maschinell, als Befehle des bestehenden `npm run atlas`:

- **(a) Kontext-Paket** `--paket <modul|glied>`. Es enthält:
  - die Modul-Datei
  - die Signaturen (nicht Rümpfe) der fremden Ziele, mit liest/schreibt
  - die fremden Schreiber seiner Schlüssel
  - die konsumierenden Linsen mit Befehl
  - Tafel-Zeilen, Messorte und Lehren

  Die Lese-Zeilen der sechs gemessenen Domänen sinken mit den D2-Dateien von 172 173 auf 71 424 (−58 %) [K domaene]. Signaturen statt Rand-Fenster senken weiter: beim Dirigenten 196 Signatur-Zeilen statt 10 601 Rumpf-Zeilen [B].

- **(b) Puls** `--betroffen <basis>`: Glied-Abdruck (Token-Hash ohne Kommentare) → Module → konsumierende Gates, dazu die feste Welt-Menge (Echt-Gruppe, Lehre 17).
  - Nach bloßer Erwähnung wählt das heute im Median 79 von 173 Gates je Stamm-Karte (Spanne 33–142, 16 Karten) [E auswahl/libs].
  - Mit den geteilten Libs wären es 151, weil `ausgabe-aufnahme.cjs` Namen aus 11 Modulen trägt und 142 Gates sie erben.
  - Erst die Konsum-Kante schneidet das.

- **(c) Übergabe als Daten:** `{kopf, basis, glieder (aus b), laeufe [gate·kopf·exit·roh], linse {vorher, jetzt}, hypothese}`. Nur die Hypothese bleibt Prosa. Die Läufe schreibt `welt-boot.cjs`, durch das 141 von 173 Gates gehen: EIN Chokepoint, keine neue Datei.

- **(d) Abdruck je Glied:** `codeAbdruck` rechnet über die Glieder der Module einer Klasse statt über Dateien.
  - G4a machte 10 von 12 Zeilen veraltet, obwohl keine Klasse Kreatur liest.
  - Der D2-Umzug schrieb 639 Tafel-Zeilen nur wegen der Dateinamen um [K].
  - Dieselbe Klasse trifft den Spieler: Der Platten-Stempel der Foundry hasht Kern-Bytes (20a.js:1216). 58 von 202 Commits machten den Cache jedes Spielers kalt, auch durch eine reine Kommentar-Zeile.

**Was der Graph ersetzt, damit die Decke sinkt:**
- 1 041 Text-Vorkommen
- 15 eigene Rumpf-Schneider und 32 Klammer-Zähler
- die Datei-Listen der Tafeln
- R0–R3 und `[ci voll]` als Auswahl durch Menschen
- die Prosa-Übergabe
- die feste Puls-Liste in `check.yml`

## 3 Die Rollen

| Rolle | entfällt | Ersparnis (Herleitung) |
|---|---|---|
| Bauer | Suchen (grep, package.json), Lesen ganzer Dateien, eigene Schloss- und Poll-Skripte | Lesen 7,3 h × 58 % ≈ 4,3 h; Modellzeit bei kleinem Kontext ≤ 9,8 h (74,6 h × (7,8 − 6,8)/7,8) |
| Nachfolger | das Neu-Lesen dessen, was der Vorgänger schon las (70,6 % der Akte) | Re-Orientierung 9,1 h × 0,71 ≈ 6,4 h |
| Prüfer | CI per curl pollen (711 Aufrufe in 118 Agenten, 3,0 h), Wiederholungs-Läufe, Urteile nur über den Apparat | wird erst auf grünem Kopf gerufen; Urteile nur über den Apparat: 41,0 h × 22/98 ≈ 9,2 h |
| Nachbesserer | Runden für Apparat-Punkte | 62,8 h × 22/72 ≈ 19,2 h |
| Integrator | Konflikte suchen, die Batterie raten | Datei-Besitz folgt aus Modul → Datei (11 Konflikt-Punkte); `check` nur betroffen statt alles: 8,2 h × 54 % ≈ 4,4 h |
| OMEN | Mess-Auftrag aus Prosa | Klasse → Messort → welche der 12 Ratschen laufen; die GPU-Zeit selbst bleibt Physik |

Die Summe ist höchstens 56 h von 212,6 h (26 %); darin überlappen Rolle und Tätigkeit. Ohne Überlapp sind sicher mindestens 28 h (der Abnahme-Apparat).

Zwei Senken fallen nicht durch den Graph:
- Das Flackern (13 von 73 Apparat-Punkten) fällt nur durch Ereignis-Zeit.
- Das Schloss-Warten (32,8 h) fällt nur, wenn der Mess-Auftrag ein Datum in EINER Schlange wird statt einer Poll-Schleife je Arbeiter.

Dazu drei Änderungen am Workflow, ohne Repo-Schnitt:
- eine `tools:`-Zeile im Kopf von `champion.md` (30 ungenutzte Schemata, geschätzt etwa 17 % des Kontext-Volumens; abgeleitet, nicht gezählt)
- den Prüfer erst auf grüner Zweig-CI rufen
- das Übergabe-Schema aus (c)

## 4 Der Weg: drei Schnitte, jeder einzeln mergbar

| # | Schnitt | D-Teil | Messname · vorher → nachher |
|---|---|---|---|
| 1 | **D2 mergen, die Karte wird Wurzel:** Stamm nach Modul; die Tafel-`quellen` werden Modul-Namen (D2 schreibt sie ohnehin um, danach nie wieder); `diag-atlas --check` wird ROT bei einem Glied in fremder Datei; dazu `atlas --paket` | D(2) | `domaene.cjs` Lese-Zeilen der 6 Domänen 172 173 → 71 424 · `26c.js` mit 305 Konstanten aus 17 Modulen → 0 · Tafel-Zeilen je reinem Umzug 639 → 0 |
| 2 | **Konsum statt Text:** jedes Text-Vorkommen wird ein Zugriff mit Glied-Namen (`__consumes` zur Laufzeit, `stammLib.rumpf` statisch); eine Regex auf Stamm-Text in `scripts/` ist ROT in `gate:apparat` | D(3) | `textlinsen.cjs` 1 041 → 0 · `__consumes` 3 → jede Präsenz-Probe · Prüfer-Punkte „Linse am alten Code" 15 → 0 (`urteile2.js`) · `scripts/` netto < 0 |
| 3 | **Playtest nach Modulen, Puls aus dem Graph:** `playtest.cjs` → `scripts/playtest/<modul>.cjs`; `atlas --betroffen` speist Puls und `voll`; die Lauf-Spur entsteht in `welt-boot.cjs` | D(3) | größte Datei 54 724 → ≤ 4 000 Zeilen · Gates je Stamm-Karte 173 → ≤ 79 (`auswahl.cjs`) · Nein-Urteile mit erstem Punkt „CI rot" 49/72 → 0 · curl-Polling 711 → 0 |

Schnitt 1 kommt zuerst, weil D2 gebaut ist und gerade an einem Bruch der Klasse 1 hängt (Text-Linse): `diag-vehicle-drive.cjs:192` trifft nach dem Umzug den Aufruf statt der Definition (pruef1:D2). Schnitt 2 kommt vor Schnitt 3, weil die Auswahl nur so genau ist wie ihre Kanten.

## 5 Selbst-Programmierung von innen

**Schon Gesetz-Daten:**
- die Gestalt (10 Kerne, Vertrag v1.2 `PARAMS_BY_KIND`, fail-closed)
- das Gelände als Funktion
- der Satz → `spawn_studio` → `_studioStampFor`
- stehende Regeln `["rule", cond, eff, {everySec}]`
- das Feld

**Noch Code ist die Tür selbst:**
- 70 Effekt-Ops und 14 Bedingungen haben keine Schema-Tafel.
- Jeder Op steht im Median an 4 weiteren Stellen: Listen, `DSL_WELTAKTE`, Erzähl-Tafel in `07.js`, Prompt-Prosa in `02b.js:1203`. `spawn_studio` steht an 7 Stellen [E dsl-ops]. Die Laufzeit-KI lernt ihre Tür also aus Prosa.
- `time_passed` liest `performance.now()` (02a.js:2155). Eine selbst geschriebene Regel ist deshalb nicht wiederholbar und damit nicht prüfbar.

**Derselbe Graph trägt beide KIs.** Der Op wird ein Knoten neben seiner Implementierung: `{op, params [typ], liest, schreibt, weltakt, privat, erzaehlung}`. Liste, Weltakte, Prompt-Abschnitt, Erzählung und die fail-closed-Prüfung vor `dslEval` werden daraus gelesen, nicht daneben geführt.

- Die Laufzeit-KI komponiert dann gegen Typen, und Drehbuch-Schritt 18 wird ohne Schlüssel prüfbar.
- Ein Satz, den kein Op deckt, wird eine Karte: das Modul folgt aus `schreibt`, das Paket aus (a), der Puls aus (b).

Das ist die Schleife von innen: Satz → fehlende Tür → Karte mit Paket → neuer Op-Knoten → Satz. Voraussetzung ist Spielzeit statt Wanduhr an den 16 Stellen der Klasse 3, an denen die Wanduhr entscheidet, WAS geschieht.

## Ehrlich offen

- Die Klassen der Prüfer-Punkte sind eine Regex-Heuristik, bei der „Spiel" der Rest ist. Die Apparat-Anteile sind deshalb Untergrenzen.
- Die Auswahl nach Erwähnung ist eine Obergrenze der Gate-Menge. Die Zahl nach Konsum entsteht erst mit Schnitt 2.
- Die Ersparnisse sind obere Schranken mit Überlapp. Die Schema-Tokens sind abgeleitet, nicht gezählt.
- Die Nachher-Zahl für (d) ist ungemessen; dafür muss jede Klasse erst ihre Module deklarieren.

## Quellen

- **[Z]** `C:\Users\micha\AppData\Local\Temp\claude\anatomie-zeit\`:
  - bericht.md: `node aggregate.js agents-roh.jsonl <wurzeln> > bericht.md`
  - modell-kontext.txt: `node modell-kontext.js agents-roh.jsonl`
  - schloss-split.txt: `node schloss-split.js agents-roh.jsonl`
- **[K]** `…\anatomie-kopplung\`: domaene.txt, tafel-veraltet.txt, textlinsen.txt und grenzen.txt, je mit `node <skript>.cjs C:/Users/micha/AnazhRealm-integ`.
- **[B]** `…\anatomie-beste\`: kopplung-main.json, oberflaeche-main.json und zustand-main.json, je mit `node werk\<skript>.cjs main`.
- **[E]** `C:\Users\micha\AppData\Local\Temp\claude\anatomie-entwurf\`:
  - urteile.txt und urteile-nein.jsonl: `node urteile.js <B>/a8ac36ca-5aac-4e92-aeb3-ddb04484de2b <B>/6fa51df3-2aff-4c17-ad6e-f72b9a955836`, wobei B = `C:/Users/micha/.claude/projects/C--Users-micha-AnazhRealm-profiband`
  - urteile2.txt und urteile-klassen.txt: `node urteile2.js`
  - auswahl.txt: `node auswahl.cjs C:/Users/micha/AnazhRealm-integ ../anatomie-kopplung/modul-karte-d2.json ../anatomie-kopplung/glied-diff.json`
  - libs.txt: `node libs.cjs` mit denselben Argumenten
  - dsl-ops.txt: `node dsl-ops.cjs C:/Users/micha/AnazhRealm-integ`

An `C:\Users\micha\AnazhRealm-integ` wurde nichts verändert (`git status` leer).
