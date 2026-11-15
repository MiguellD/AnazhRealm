# DIE BREMSEN, GEMESSEN — Befund 2 (15.11.2026, Konto 13 → 14)

**Wird die Integration schneller? JA:** eine Abgabe wartet bis zum Merge im Median 1,0–1,2 h statt 2,8 h (10.11.), p90 1,8 h statt 9,2 h, und seit 13.11. 08:20 fuhr kein Zug rot (14.–15.11.: 0 von 19, am 10.11. 13 von 17).
**Werden wir besser? NEIN:** die alte Karte steigt seit 12.11. um +1 je Tag (221 → 223), kein Pflicht-OFFEN-Eintrag fiel seit 13.11., und die sieben Wellen-Workflows seit 14.11. 16:00 verarbeiteten etwa 61 M Tokens neu, ohne eine einzige Landung.
**Was bremst am meisten:** nicht der Zug (er stand seit 14.11. 17:00 zu 68 % leer), sondern (1) Wellen ohne Landung je Schnitt, (2) der Richter an der Radeon ist blind — seit 13.11. 05:28 kein Mess-Lauf mit GRÜN > 0, weil der Messdienst nach 600 s jeder wartenden Hand weicht, (3) jede dritte Prägung kommt als „heim“ zurück (33 heim gegen 64 Landungen seit 12.11.).

Legende: [m] von mir gemessen oder gerechnet · [q] gelesen · [s] geschätzt. Skripte und Rohdaten: Scratch `klarheit/bremsen/` (durchlauf2.cjs, zug.cjs, radeon2.cjs, puls.cjs, wf-summe.cjs, punkte.cjs), Stand 15.11. 11:22–11:35 (Get-Date).

## 1 Durchlauf je gelandetem Zweig (10.11. – 15.11. 06:25)

Quelle: `git rev-list origin/main` (Kopf 4ee205bd), Merges „Merge <zweig> in integ-probe“ auf der first-parent-Linie; erster eigener Commit = ältester Nicht-Merge der ersten-Elter-Kette des Zweig-Kopfs bis zur main-Linie; Abgabe = Commit-Zeit der zweiten Elter-Spitze; „Merge“ = Commit-Zeit des Merges (Zug-Start; die Fahrt dauert danach Median 41–50 min [m] zug-nie-leer.log). 121 Landungen [m].

| Zeitraum | n | Bau (erster → Abgabe) Median · p90 | Warten (Abgabe → Merge) Median · p90 · max | gesamt Median · p90 |
|---|---|---|---|---|
| 10.11. – 14.11. 16:00 | 111 | 2,81 h · 15,6 h | 1,44 h · 9,22 h · 16,47 h | 5,40 h · 19,7 h |
| ab 14.11. 16:00 | 10 | 6,80 h · 92,9 h | 1,18 h · 1,77 h · 1,77 h | 8,09 h · 93,3 h |

Je Tag [m]: Warten Median 10.11. 2,81 h · 11.11. 2,54 · 12.11. 1,42 · 13.11. 0,81 · 14.11. 1,02 · 15.11. 1,62 h.
Die zehn Landungen ab 14.11. 16:00 [m]: w28-wiese-schale · w28-gesicht · w28-stadt-grammatik (Bau 92,9 h, 69 Commits) · w28-auge · w28-satz-wand-ruhe · w28-probe-schirm · w28-gesicht-grob · w28-stadt-funktion · w28-fenster-wechsel · w28-schirm-steht — jede ein Einzel-Zweig, KEINE aus einem der Wellen-Workflows unten.

## 2 Die Wellen seit 14.11. 16:00 (dazu Meisterkarte 2 von 11:45)

Quelle: Journale `subagents/workflows/wf_*/journal.jsonl` und je Agent `agent-*.jsonl` (Summe der `usage` je Antwort, je Nachricht-ID einmal) [m]; „totalTokens“ aus `tasks/w*.output` [q] (nur fünf Workflows schrieben eine Ausgabe; die Zahl ist kleiner als die Summe der usage und zählt anders). „neu“ = input + output + cache_creation.

| Welle | Workflow | Zeit | h | Agenten | Tokens neu [m] | totalTokens [q] | gelandet | warum nicht / gefallen |
|---|---|---|---|---|---|---|---|---|
| Meisterkarte 2 | wf_410cfb66 | 14.11. 11:45–14:33 | 2,8 | 88 | 13,2 M | 12,44 M | 0 Sprossen gebucht | kein Richter der Karte je gefahren (Ergebnis des letzten Agenten; MEISTERKARTE-2.md Z.1–2: 0 von 1 718, 19 im Kern) |
| Planet Welle 1 | wf_009a85a5 | 16:02–20:59 | 4,9 | 17 | 6,1 M | 1,86 M | 0 | Kern im Zweig w28-planet-kern, Konsum im Spiel 0 % [q Rahmen]; ein Bauer ohne Ergebnis (bau:platten-relief) |
| Preis des Orts | wf_ff614e40 + lokaler Heiler | 18:22–07:43, Heilung 2 bis 10:56 | 13,4 + 3,2 | 11 | 21,6 M | 3,55 M | 0 | Abgabe fcd4661e 10:56 → **heim 11:18**: Code-Check ROT voll 10/18 („KERN-PFLICHT verletzt: phyto:lod.budget … unlesbar“) und voll 12/18 („T18: die Saat steht nicht nach 3000 Takten“) [q cloud-post/w28-preis-ort.md] |
| Planet Welle 2 | wf_b99fb715 | 21:03–04:22 | 7,3 | 9 | 5,8 M | 2,98 M | 0 | sechs Ursachen im Kern geheilt (932749bc), Tür ins Spiel fehlt |
| Fernfeld-Befund | wf_b9eb5940 (nach 10 min abgebrochen, 3 Entwürfe ohne Ergebnis) + wf_5acc7cc3 | 22:17–22:56 | 0,6 | 6 + 3 | 1,3 M | 0,52 M | Befund (nur Lesen) | Täter „Probe-Bild lügt“ beim Namen (werkbank.cjs:2108–2119); w28-probe-schirm landete 01:02 [s: Folge dieses Befunds] |
| Baum unter dem Schirm | wf_616f7628 | 23:01–10:47 | 11,8 | 13 | 17,4 M | — (gestoppt) | 0 | Spike NEIN an Schnitt 1 · 2 · 4 · 5 [q bericht-baum-schnitt{1,2,4,5}.md]; Schnitt 1 GEBAUT und zurückgenommen (06af6f67 → b0be0435), Schnitt 4 GEBAUT und zurückgenommen (1313a0cd) — der Spike kam nach dem Bau; Schnitt 3 steht ohne Abgabe; ein Bauer (bau:2) ohne Ergebnis |
| Planet-Reise | wf_c6e4f786 | 04:27–10:47 | 6,3 | 7 | 8,7 M | — (gestoppt) | 0 | **Kontingent:** bau:2 und bau:3 FAILED 08:32 (Fable-Limit, Modell `<synthetic>`); Gegner: F1 `_planetAnker` holt den Samen der Welt (stamm/gelaende-chunks.js:627) [q UEBERGABE-2026-11-15.md] |
| Himmel-Korn | lokaler Champion (Fable) | 14.11. – 15.11. 08:20 | — | 1 | nicht gemessen | — | 0 | gebaut, ungemessen; Champion starb am Fable-Limit [q Übergabe] |
| Stadt-Netz | OMEN | — | — | 1 | nicht gemessen | — | 0 | Gehen 16,0 % > 6,3 % Bilder über 33 ms [q Übergabe] |
| Wange | GTX 1050 | bis 10:46 | — | 1 | nicht gemessen | — | wartet | Abgabe 073b6d17 steht am Zug |

Summe der sieben Workflows ab 14.11. 16:00 [m]: **66 Agenten · 60,9 M Tokens neu · 0 Landungen.** Die Meisterkarte 2 davor: 88 Agenten, 13,2 M, 0 gebuchte Sprossen.
Ursachen der Fälle [m aus der Tafel]: Spike nein 4 (Baum) · Kontingent-Limit 2 Agenten + 1 Champion · CI rot nach Prägung 1 (Preis) · Prämisse falsch 1 (Wange „der Satz trägt kein Gesicht“ korrigiert) · Datei-Konflikt 0.

## 3 Das GPU-Schloss der Radeon

Quelle: `dienst/puls.out` (eine Zeile je Minute: Halter, Wartende) [m]; `w4/radeon-nie-leer.log` (Mess-Läufe des Dienstes) [m].

| Zeitraum | Minuten | frei | Messdienst | CI | Arbeiter | Wartende Mittel · max | Minuten mit ≥ 3 Wartenden |
|---|---|---|---|---|---|---|---|
| 12.11. | 1 347 | 161 (12 %) | 609 | 385 | 192 | 0,47 · 4 | 36 |
| 13.11. | 1 375 | 145 (11 %) | 582 | 319 | 329 | 1,24 · 15 | 273 |
| 14.11. bis 16:00 | 927 | 83 (9 %) | 269 | 164 | 411 | 1,85 · 6 | 254 |
| 14.11. ab 16:00 | 451 | 14 (3 %) | 145 | 77 | 215 | 1,47 · 4 | 107 |
| 15.11. bis 11:28 | 679 | 17 (3 %) | 156 | 72 | 434 | 2,30 · 8 | 301 |

Ab 14.11. 16:00 hielten Arbeiter 649 von 1 130 Minuten (57 %) (größte Halter: w28-himmel-korn 52, befund-gpu-genesis 33, w28-baum-schnitt3 28).

Mess-Läufe des Dienstes je Tag [m]: gestartet · durchgemessen · abgebrochen (davon CI)
10.11. 6 · 5 · 2 (2) — 11.11. 29 · 3 · 26 (26) — 12.11. 37 · 2 · 32 (22) — 13.11. 22 · 3 · 20 (7) — 14.11. 72 · 22 · 47 (16) — 15.11. 21 · 2 · 19 (5).
**Der letzte durchgemessene Lauf mit GRÜN > 0: 13.11. 05:28** (1cd1c408, 29 Stationen, 4 GRÜN). Danach: 13.11. 19:01 123 Stationen 0 GRÜN („die Welt der Sitzung startet nicht“); 14.11. 22 Läufe mit 0 Stationen; 15.11. 02:08 und 04:17 248 und 232 Stationen, 0 GRÜN (die Blendung durch `/fenster`, geheilt in z446 06:25 [q Übergabe §3]). Nach z446: 7 Läufe, alle abgebrochen, 9 GRÜN behalten.
Täter gelesen: `zug/dienst/radeon-dienst.sh:33` `HAND_NACH_S=600` und `:144` — nach 600 s weicht die Fahrt JEDER wartenden Hand an der nächsten Stations-Grenze; bei 1,5–2,3 Wartenden im Mittel wartet immer jemand. Dazu die Regel „höchstens drei GPU-Arbeiter“, überzogen auf bis zu acht Wartende (15.11.).

## 4 Der Zug

Quelle: `w4/zug-nie-leer.log` [m], Tage aus dem Mitternachts-Sprung der Uhrzeiten.

| Tag | Züge | rot | gelandet | „heim“ (roter Check) | Züge ohne Wartende | Fahrt Median · max |
|---|---|---|---|---|---|---|
| 10.11. | 12 | 13 | 4 | 0 | 2 | 50 · 89 min |
| 11.11. | 20 | 9 | 10 | 1 | 1 | 39 · 77 min |
| 12.11. | 21 | 10 | 11 | 9 | 6 | 40 · 78 min |
| 13.11. | 11 | 2 | 9 | 12 | 3 | 41 · 57 min |
| 14.11. | 16 | 0 | 15 | 11 | 4 | 41 · 55 min |
| 15.11. | 3 | 0 | 4 | 1 | 3 | 50 · 59 min |

(„rot“ zählt Zug-Enden ohne GELANDET, auch Fahrten ohne Kandidat; Zug-Starts und -Enden über Mitternacht verschieben je eine Zeile.)
Der Zug fuhr von 14.11. 17:00 bis 15.11. 11:30 (1 110 min) acht Mal, zusammen 360 min [m]: **68 % der Zeit stand er leer**, von 06:25 bis 10:46 (4,3 h) ohne bereite Abgabe.
„heim“ seit 12.11.: 33 Fälle gegen 64 Landungen [m] — etwa jede dritte Prägung kehrt rot zurück; einzelne Zweige mehrfach (w28-tor-bruch 3 ×, 13.11. 18:59 bis zur Landung 14.11. 14:19; w28-wiese-schale 2 ×; w28-stadt-grammatik 3 ×).
CI-Dauer über die GitHub-API: offen (Messname `ci-dauer-je-job`), nicht gemessen in diesem Fenster.

## 5 Die alte Karte je Tag

Quelle: `git log origin/punkte-maschine`, Zeilen „Meisterkarte N/330“ [m].

| Tag | 05.11. | 06.11. | 07.11. | 08.11. | 09.11. | 10.11. | 11.11. | 12.11. | 13.11. | 14.11. |
|---|---|---|---|---|---|---|---|---|---|---|
| Stand am Ende | 206 | 212 | 218 | 221 | 224 | 215 | 220 | 221 | 222 | 223 |
| Zuwachs | +12 | +6 | +6 | +3 | +3 | −9 (Neuzählung 224 → 212, 6135f764) | +5 | +1 | +1 | +1 |
| Buchungs-Commits | 14 | 6 | 6 | 5 | 4 | 23 | 22 | 22 | 54 | 80 |

Am 14.11. buchten 80 Commits ein Plus von 1. Der Rückgang der Buchungs-Ernte folgt dem Ende der durchgemessenen Radeon-Läufe (11.11.: 3 Läufe, 319 Stationen, 26 GRÜN; ab 13.11. 05:28 keiner mit GRÜN) [s: zeitlich gekoppelt, kausal nicht in buche.sh gelesen].

## DIE DREI BREMSEN

### Bremse 1 — Wellen bauen ohne Landung (60,9 M Tokens · 66 Agenten · 0 Landungen seit 14.11. 16:00)
Ursache: die Wellen-Skripte setzen „Befund → Entscheid → Bau aller Schnitte → Gegner → Heilung“ in EINEM langen Zweig hintereinander (Phasen-Spalte der Journale); die Abgabe kommt erst nach der Heilung. Preis: 16,6 h bis zur Abgabe, dann heim in 22 min. Baum: der Spike entschied NACH dem Bau (Schnitt 1 und 4 gebaut, gemessen, zurückgenommen). Der billigste Schwarm (Fernfeld-Befund, 1,3 M, 0,6 h) trug die einzige Folge-Landung.
Schnitt: **jeder Schnitt einer Welle ist eine eigene Abgabe** — Spike (≤ 30 min, drei Fälle) VOR jedem Bau, dann Bau, Bildpaar, Prägung, Zug; die Gegner greifen die gelandete Abgabe an, nicht den Zweig. Ein Schnitt ohne Abgabe in 4 h fällt offen.
Messname: `wellen-landung` = Landungen je 10 M Tokens neu je Welle (heute 0) und Stunden vom Wellen-Start bis zur ersten Landung (heute > 16 h, ohne Ende).

### Bremse 2 — der Richter an der Radeon ist blind (letzter Mess-Lauf mit GRÜN > 0: 13.11. 05:28 · Schloss frei 3 % · Karte +1 je Tag)
Ursache: `zug/dienst/radeon-dienst.sh:33,144` — der Messdienst weicht nach 600 s jeder wartenden Hand; ab 14.11. 16:00 hielten Arbeiter 57 % der Karte, im Mittel warteten 1,5–2,3 Läufe, max 8. 86 Mess-Läufe brachen seit 13.11. ab; durchgemessen wurden nur leere oder geblendete.
Schnitt: **EIN durchgemessener Lauf je gelandetem main-SHA gehört dem Richter** — der Messdienst hält die Karte bis zum letzten Station-Ende dieses SHA (am 10.11. 59 Stationen in 32 min, 17:08 → 17:40), Hände reihen sich dahinter; das Schloss nimmt keinen vierten GPU-Arbeiter an (gpu-schloss.sh verweigert, statt zu stapeln).
Messname: `richter-lauf-je-sha` = durchgemessene Läufe mit GRÜN > 0 je Landung (heute 0 seit 13.11. 05:28; Soll ≥ 1) und `karte-je-tag` (heute +1).

### Bremse 3 — jede dritte Prägung kehrt heim (33 heim gegen 64 Landungen seit 12.11.)
Ursache: der volle Check (18 Stationen) läuft erst NACH der Prägung am Kopf; der Arbeiter prägt auf lokale Proben und Bildpaare. Beispiel Preis: CI voll 10/18 und 12/18 rot am Kopf fcd4661e, 22 min nach der Prägung, nach 16,6 h Arbeit. Kein Täter im Code gelesen (offen: warum `phyto:lod.budget` am Kopf unlesbar ist).
Schnitt: **der Code-Check läuft am WIP-Kopf, bevor der Koordinator prägt** — eine Prägung ist erst erlaubt, wenn der Check am selben SHA grün steht (der Zug-Dienst liest ihn heute schon: „Code-Check nicht GRÜN“); die WIP-Pushes tragen dafür `[ci voll]` statt `[skip ci]` einmal je Schnitt.
Messname: `heim-quote` = heim-Fälle ÷ (heim + Landungen) je Tag (heute 33 ÷ 97 = 34 % seit 12.11.; Soll ≤ 10 %).

## Offen beim Namen
`ci-dauer-je-job` (GitHub-API nicht abgefragt) · die Kopplung Mess-Lauf → Buchung in buche.sh nicht gelesen · Tokens der lokalen Champions (Himmel-Korn, Heilung 2, OMEN, GTX 1050) nicht in den Workflow-Journalen.

Geschnitten: nichts am Code; das Blatt vision/BREMSEN.md mit fünf Messungen und drei Bremsen samt Messname.
Gemessen: Warten Abgabe → Merge Median 2,81 → 1,02–1,18 h · rote Züge 13/17 → 0/19 · Wellen 60,9 M Tokens, 0 Landungen · Radeon frei 3 %, letzter GRÜN-Lauf 13.11. 05:28 · heim 33 gegen 64 Landungen (34 %) · Karte +1 je Tag seit 12.11.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
