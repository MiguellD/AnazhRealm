# LAGE — die lebende Seite (zuerst lesen; jedes Konto schreibt sie fort, statt eine neue Übergabe zu schreiben)

Stand 15.11.2026 11:42 (Get-Date) · main = integ-probe 4ee205bd [m git ls-remote 11:42] · Konto 13 → 14 · Chronik dieser Seite: `git log origin/koordination -- LAGE.md`.
Marken: [m] gemessen/gerechnet · [q] gelesen · [s] geschätzt. Belege: `vision/BREMSEN.md` · `vision/meisterkarte-2-richter.md` · `vision/PFAD.md` · `vision/ORDNUNG.md`.

**An den Schöpfer, drei Sätze.**
1. **Ja, die Meisterkarte 2 ist noch leer (0 von 1 718 gebucht, 19 im Kern)** — aber nicht, weil kein Richter fuhr: 22 Gerät-Messungen stehen, der Richter ist 22/22 GRÜN; der Preis reißt in 21/22 (VRAM nach GC 113–136 MB gegen 118), Radeon und GTX fuhren nie am selben SHA (die Radeon-Karten-Sitzung brach in 27 von 33 Starts am Schloss ab), und nur 10 von 1 718 Sprossen tragen eine Preis-Klasse [m meisterkarte-2-richter.md §1].
2. **Ja, die Integration wurde schneller:** Abgabe → Merge Median 2,81 h (10.11.) → 1,02 h (14.11.), p90 9,22 h → 1,77 h, rote Züge 13 (10.11.) → 0 (14. und 15.11.) [m BREMSEN.md §1, §4].
3. **Nein, wir werden nicht besser:** die alte Karte steigt seit 12.11. um +1 je Tag (221 → 223), seit 13.11. fiel 0 von 5 Pflicht-OFFEN, und die sieben Wellen seit 14.11. 16:00 verarbeiteten 60,9 M Tokens neu mit 0 Landungen — die Bremse ist der Weg von der Welle zur Abgabe, nicht der Zug [m BREMSEN.md §2, §5].

## §0 Wozu
- Das Ultiversum wächst aus GESETZEN statt aus Assets; Mensch (Schöpfer) und KI erschaffen es, die Welt selbst ist der dritte Mitspieler [q CLAUDE.md:3–4].
- Die Studios in `worlds/` und die Kerne sind die Gesetzbücher; AnazhRealm ist Boden · Speicher · Spieler · Tür zu den Studios und erzeugt nichts, was ein Studio kann [q CLAUDE.md:4–5].
- Alles prozedural und offen: Planeten, Millionen Orte aus EINEM Samen, gemessen an Weltklasse im echten Bild [q Gedächtnis vision-schoepfer, meisterkarte-2-vision-1411].
- **Ziellinie v1.0** (docs/roadmap.md §0.v1): EIN gespielter Pfad — ankommen · laufen+sehen · in der Werkstatt bauen · mit der KI erschaffen (Satz → `spawn_studio` → `_studioStampFor`) · benutzen/teilen — bei p95 ≤ 33 ms auf JEDEM Standardgerät; Richter: das Profi-Band (Pflicht E) [q CLAUDE.md:75–77].

## §1 Stand in Zahlen
| Zahl | Wert | Datum · Quelle |
|---|---|---|
| main | 4ee205bd, letzte Landung z446 06:25:05; seitdem 0 Züge, 11:19 preis-ort heim | 15.11. [q `w4/zug-nie-leer.log` letzte Zeilen] |
| alte Karte (330) | 206 (05.11.) · 224 (09.11.) · 215 (10.11., Neuzählung) · 220 · 221 · 222 · 223 (14.11.); am 14.11. 80 Buchungs-Commits für +1 | [m BREMSEN.md §5, `git log origin/punkte-maschine`] |
| Meisterkarte 2 | 0 / 1 718 gebucht, 19 im Kern; Richter-Code 6 Sprossen, Teil-Code 13, nur Text 1 699; Klasse an 10 | 15.11. [m `buche-2.cjs --trocken`, meisterkarte-2-richter.md §2] |
| Pflicht-OFFEN | A · B · C · E · F stehen, 0 gefallen seit 13.11.; Status-Zahlen von A, B, E stammen vom 17./18.10. | [q docs/PFLICHT-OFFEN.md an 4ee205bd] |
| Landungen je Tag | 05.11 16 · 06.11 32 · 07.11 38 · 08.11 30 · 09.11 17 · 10.11 29 · 11.11 28 · 12.11 22 · 13.11 10 · 14.11 27 · 15.11 5 | [m `git log origin/main --first-parent`, PFAD.md §0] |
| Abgabe → Merge | Median 2,81 h (10.11.) · 2,54 · 1,42 · 0,81 · 1,02 (14.11.) · 1,62 (15.11.); ab 14.11. 16:00 p90 1,77 h | [m BREMSEN.md §1, 121 Landungen] |
| Zug leer | 14.11. 17:00 – 15.11. 11:30: 8 Fahrten, 360 von 1 110 min, 68 % leer | [m BREMSEN.md §4] |
| heim-Quote | 33 heim gegen 64 Landungen seit 12.11. = 34 % | [m BREMSEN.md §4] |
| Radeon-Schloss | frei 3 % ab 14.11. 16:00, Arbeiter 57 %, Wartende Mittel 1,5–2,3, max 8; letzter Mess-Lauf mit GRÜN > 0: 13.11. 05:28 | [m BREMSEN.md §3, `dienst/puls.out`, `w4/radeon-nie-leer.log`] |
| Wellen-Ertrag | ab 14.11. 16:00: 7 Workflows, 66 Agenten, 60,9 M Tokens neu, 0 Landungen; Meisterkarte 2 davor: 88 Agenten, 13,2 M | [m BREMSEN.md §2] |
| Kontingent | Fable-Woche 58 % (04:25) → 93 % (07:48) → 100 % (etwa 08:20); alle Modelle 44 % (04:25) → 73 % (10:44) | 15.11. [q UEBERGABE-2026-11-15.md:3, :41, :54] |

Offene Zweige [m git ls-remote 11:42]: w28-preis-ort fcd4661e (ABGABE 10:56, heim 11:19) · w28-wange 073b6d17 (ABGABE 10:46; GPU-Probe ROT nur an gate:kamera-leib:echt, Code-Check-Urteil fehlt im Zug-Log) · w28-himmel-korn 6323f43d (gebaut, ungemessen) · w28-baum-schirm bef69ba3 (Schnitt 3 steht) · w28-planet-kern 71dfb7af (Konsum im Spiel 0 %) · w28-stadt-netz c5f725ab (OMEN, Gehen über Soll).

## §2 Die drei Bremsen und der EINE Schnitt je Bremse
**Bremse 1 — Wellen bauen ohne Landung** (60,9 M Tokens · 66 Agenten · 0 Landungen; Preis 16,6 h bis zur Abgabe, dann heim in 22 min; Baum: Spike NEIN NACH dem Bau an Schnitt 1 und 4) [m BREMSEN.md §2].
- Schnitt: **jeder Schnitt einer Welle ist eine eigene Abgabe** — Spike (≤ 30 min, drei Fälle) VOR dem Bau, dann Bau, Bildpaar, Prägung, Zug; Gegner greifen die gelandete Abgabe an. Ein Schnitt ohne Abgabe in 4 h fällt offen.
- Misst sich an `wellen-landung`: Landungen je 10 M Tokens neu (heute 0) und Stunden Wellen-Start → erste Landung (heute > 16 h).

**Bremse 2 — der Richter an der Radeon ist blind** (Schloss frei 3 %; 86 Mess-Läufe abgebrochen seit 13.11.; letzter Lauf mit GRÜN > 0 am 13.11. 05:28) [m BREMSEN.md §3].
- Täter gelesen: `zug/dienst/radeon-dienst.sh:33` `HAND_NACH_S=600` und `:144` — der Messdienst weicht nach 600 s jeder wartenden Hand.
- Schnitt: **EIN durchgemessener Lauf je gelandetem main-SHA gehört dem Richter** — der Dienst hält die Karte bis zur letzten Station dieses SHA (10.11.: 59 Stationen in 32 min); `gpu-schloss.sh` verweigert den vierten GPU-Arbeiter, statt zu stapeln.
- Misst sich an `richter-lauf-je-sha` (Läufe mit GRÜN > 0 je Landung; heute 0, Soll ≥ 1) und `karte-je-tag` (heute +1).

**Bremse 3 — jede dritte Prägung kehrt heim** (33 heim gegen 64 Landungen = 34 %) [m BREMSEN.md §4].
- Ursache: der volle Check (18 Schritte) läuft erst NACH der Prägung; Beispiel preis-ort fcd4661e ROT in 10/18, 12/18, 14/18, alle „KERN-PFLICHT verletzt … unlesbar" [q cloud-post/w28-preis-ort.md].
- Schnitt: **der Code-Check läuft am WIP-Kopf, bevor geprägt wird** — eine Prägung erst, wenn der Check am selben SHA GRÜN steht (ein WIP-Push je Schnitt mit `[ci voll]`).
- Misst sich an `heim-quote` = heim ÷ (heim + Landungen) je Tag (heute 34 %, Soll ≤ 10 %).

## §3 Die Front der Meisterkarte 2 und die ersten Richter-Fahrten
Vier Riegel mit Täter [m meisterkarte-2-richter.md §1]:
- R-a **Preis ROT** an VRAM/Heap: VRAM nach GC über 118 MB in 19/21; Soll Ort: Heap ≤ 400, VRAM ≤ 118 (`vision/REGELN.md:36`). Das ist Pflicht E, kein Karten-Werk.
- R-b **Sage a ≠ tue a:** `buche-2.cjs:178` urteilt die Spitze OHNE GC, `vision/REGELN.md:40` verlangt den Wert nach GC.
- R-c **Keine gepaarte Fahrt:** 9 SHAs, nur 337846dc trägt beide Geräte, dort die GTX ohne Urteil.
- R-d **Klasse fehlt** an 1 708 Sprossen: `buche-2.cjs:170` → höchstens KERN. Die Zuordnung Sprosse → Klasse ist ein Daten-Schnitt in `meisterkarte-2.json` (R5), keine GPU.

Die erste Fahrt (gereiht nach Sprossen je GPU-Minute):
- **Fahrt 1:** Karten-Sitzung am selben Kopf, beide Geräte, ohne Weichen — `--nur vegetation.K2#1,vegetation.K5#2,klang.K4#2,siedlung.K4#2,gelaende.K2#1`; 6 Sprossen; Radeon etwa 13 min, GTX etwa 10 min [m 11,1 + 8,0, s +2 je Gerät]. Befehl Radeon: `node meisterkarte-quelle/punkte/punkte.cjs run --sha <kopf40> --geraet radeon --nur <ids>`; GTX: Zeile in `zug/warteschlange.txt` [q ERSTE-RICHTER.md:11].
- Davor `buche-2.cjs` auf den Speicher nach GC stellen (R-b, keine GPU).
- Am nächsten am Punkt: `leben.pflanzen.kraft` S 1 — GTX 68d24688 Zeit GRÜN (p95 25,5 ms, f 1,03); es fehlen nach GC GTX 15 MB VRAM + 12 MB Heap, Radeon 8ddf3de9 7 MB VRAM.
- Über die Brücke ohne Fahrt buchbar: 0 [m].

Die Front: 29 Leitern (planet 3 · kosmos 2 · leben 3 · mensch 9 · erleben 7 · same 4 · zusammenspiel 1); 9 tragen eine Klasse an der nächsten Sprosse, 20 brauchen sie aus R5 [m meisterkarte-2-richter.md §6]. Stufe A (Richter ist Code): kraft S 1 · jahreslauf S 1 · erdbau S 1 (nie gefahren) · palimpsest S 1 · klang.ereignis S 1 + S 2.

Berichtigt: `vision/MEISTERKARTE-2.md:3` „kein Richter dieser Karte ist je gefahren" ist seit e97cfecd (14.11. 17:22) widerlegt; die Zeile ersetzt der nächste `buche-2`-Lauf.

## §4 Die ersten 24 Stunden (Stunde 0 = Konto-Start)
Annahme der Reihenfolge: der Preis ist der EINE Chokepoint — er hält E und alle 1 718 Sprossen auf 0; `w28-preis-ort` teilt Dateien mit baum-schirm (2), planet-kern (3), stadt-netz (2) [m PFAD.md §3]. Landet er zuerst, mischt jeder andere EINMAL.

| # | Stunde | Gerät | Modell | Handgriff | Annahme | Richter |
|---|---|---|---|---|---|---|
| 0 | 0–1 | alle | Opus | `zug/dienst/start.sh --blick`, Zug-Log, `probe-post/`, `git ls-remote`; keine neue Welle | — | Köpfe = §1 |
| R0 | 0–1 | Laptop | Opus | Bremse 2: `radeon-dienst.sh` hält die Karte je main-SHA; `gpu-schloss.sh` ≤ 3 Arbeiter; `buche-2.cjs` nach GC (R-b) | ohne diesen Schnitt bricht R3 ab wie 27 von 33 Starts | `richter-lauf-je-sha` ≥ 1 nach der nächsten Landung |
| R1 | 0–4 | Radeon (CPU) | Opus | preis-ort heilen, Check lokal GRÜN (`npm run check`), Abgabe mit ≤ 3 Proben | EIN Täter hinter den drei KERN-PFLICHT-Brüchen — erst lesen, dann schneiden | Zug GELANDET |
| G1 | 0–1 | GTX 1050 | Opus | Wange durch den Zug | gate:kamera-leib:echt ROT ist dieselbe Klasse wie an w28-gesicht (landete z440) | Zug GELANDET |
| R2 | 0–2 | Radeon | Opus | himmel-korn messen: sechs Paare, Linse (K), Nacht S0, Albedo | erde 0,95 · stein 0,75 halten material.K2#1 | Linse K + Bildpaar; Abgabe oder offen gefallen |
| O1 | 0–8 | OMEN | Fable | stadt-netz: Ferne aus Stufe 1 (`kachelMassen`) | Block-Massen fern senken die Gehen-Spitzen | Gehen ≤ 6,3 % · ≤ 258 ms, Fahren ≤ 16,0 % · ≤ 192 ms, je zwei Läufe gegen main |
| G2 | 1–2 | GTX 1050 | Opus | EIN Bild des Satzes | Prämisse „der Satz trägt kein Gesicht" ist unbelegt | ja/nein |
| G3 | 2–8 | GTX 1050 | Opus | B-Spike: das erste Bild wartet nicht auf die 16 Pipelines < 0,1 % der Pixel | ihre Übersetzung (Σ 17,2 s) liegt vor den 8 sichtbaren | Bild ab Navigation kalt, n = 3, Basis 22,1 s; Spike nein = stopp |
| R3 | 4–6 | Radeon + OMEN | Messdienst | an der neuen main: Fahrt 1 (§3) an BEIDEN Geräten + `preis-lauf-zerlegt` (CPU · GPU · Drossel f) | Heap ≤ 400, VRAM ≤ 118, Wachstum ≤ 5 folgen dem Speicher-Schnitt; p95 bleibt ROT (Kopf 58,68 ms) | Preis-Akte `leben.pflanzen.kraft.1` an beiden Geräten |
| R4 | 6–14 | Radeon | Fable | baum-schirm Schnitt 3 nach Neu-Mischen, am entschiedenen Maß | die Karte `fimp:atlas:L2` trägt laub-kante (A) und 20–31 % der GPU (E) | K5 laub-kante ≤ 0,22, gate:schirm-stufen |
| R5 | 14–20 | Radeon | Opus | das Radeon-ABAB von E am Kopf (Wiese + Genesis × Ego + Third), dann Spike Auflösung + TRAA | — | `diag-profiband` ABAB; Spike nein = stopp |

Erfolg nach 24 h [PFAD.md:5]: ≥ 4 von preis-ort · wange · himmel-korn · baum-schirm in main; Preis-Akte kraft.1 an beiden Geräten Heap ≤ 400 · VRAM ≤ 118 · Wachstum ≤ 5 MB/min; das erste Radeon-ABAB von E steht als Zahl.
Ruht 24 h (mit Ursache): planet-kern (Konsum 0 %, F1 hoch `stamm/gelaende-chunks.js:627`, drei Dateien mit preis-ort) · jede Neufassung der Meisterkarte 2 (12,44 M Tokens, 0 Sprossen) · C und F (beide verlangen, dass E hält) · Schwärme mit mehr als drei Agenten.

## §5 Die Regeln, die gelten (das BETRIEBSGESETZ in CLAUDE.md gilt unverändert darüber)
1. **Kein Siegel-Wort (die Liste in CLAUDE.md:58–59), solange PFLICHT-OFFEN Einträge trägt; jeder Bericht ist ZWISCHENSTAND.** Warum: früh melden ist der benannte Bruch-Modus (CLAUDE.md:53–59).
2. **Der Scope ist `docs/PFLICHT-OFFEN.md` (max 5), neue Einträge setzt nur der Schöpfer; ein Eintrag fällt ganz oder bleibt.** Warum: 5 % einer Klasse als 100 % zu melden ist die Niederlage (CLAUDE.md:61–66).
3. **Konsum statt Existenz: real ist nur, was ein echter Leser liest und die Welt beobachtbar ändert.** Warum: planet-kern trägt 47 Commits bei 0 % Konsum im Spiel.
4. **Das Bild führt: vor jeder sichtbaren Prägung das Bildpaar im Spiel selbst ansehen (Welt ab Boot in 1080); der Schöpfer ist kein Merge-Tor.** Warum: headless beweist Mechanik, nie das Erlebnis; das Probe-Bild ohne Schirm lügt um Faktor 3.
5. **Eine Zahl ohne gelesenen Täter trägt keine Ursache.** Warum: drei Fehlzuordnungen in einer Nacht (UEBERGABE-2026-11-15.md:21).
6. **Spike (≤ 30 min, drei Fälle) VOR dem Bau; Spike nein = stopp.** Warum: Baum Schnitt 1 und 4 wurden erst gebaut, dann zurückgenommen.
7. **Miss zuerst, vorher ↔ nachher am selben Gerät und SHA; GRÜN unter Last gilt, ROT unter Last wird mit Referenzfahrt geprüft.** Warum: die Radeon misst gedrosselt × 1,7–1,9 (befund-gpu.md:67–71).
8. **Kontingent JE MODELL lesen; gesichert wird bei 98 % des knappsten Modells; Fable nur für harte Kern-Schnitte, Lesen und Heilen als Opus.** Warum: Fable stand bei 100 %, als alle Modelle 73 % zeigten, und die Fable-Arbeiter starben (ORDNUNG.md §4 Nr. 11).
9. **Höchstens drei GPU-Arbeiter an der Radeon; der Richter-Lauf je main-SHA geht vor.** Warum: Schloss frei 3 %, bis zu 8 Wartende.
10. **Eigener Scratch-Ordner je Arbeiter; Server und Welt im trap beenden; fremde Bäume und Prozesse nie anfassen.** Warum: ein Champion überschrieb zwei fremde Skripte, verwaiste Server standen als Welten im Puls.
11. **Push in koordination nur über einen eigenen Index, Rückgabe prüfen, am Ursprung nachzählen; git über PowerShell; Uhrzeit nur aus Get-Date.** Warum: geteilte Bäume tragen fremde Entwürfe, git unter bash.exe braucht 1–2,6 s je Start.
12. **Diese Seite wird überschrieben, nie kopiert; eine Übergabe ist ein LAGE-Commit mit „Übergabe" in der Nachricht.** Warum: 22 datierte Übergaben, die Lage lebte zuletzt in zwei Blättern plus einem Block „gilt vor dem Block darüber".

## §6 Wo was liegt — je Faden und Domäne die EINE geltende Datei
| Faden / Domäne | die EINE Quelle |
|---|---|
| Gesetz, Scope | main `CLAUDE.md` + `docs/PFLICHT-OFFEN.md` |
| Code je Domäne | main `.claude/skills/anazh-lehren/SKILL.md` „Die Quelle je Domäne" (Z38) |
| Lage | koordination `LAGE.md` (diese Seite) |
| Bremsen, Messnamen | `vision/BREMSEN.md` |
| Pfad der nächsten 24 h | `vision/PFAD.md` |
| Ordnung, Archiv-Kandidaten, Widersprüche | `vision/ORDNUNG.md` |
| Handgriffe beim Erwachen, Kurs | `UEBERGABE-2026-11-13.md` §0–§2 + `KURS-KONTO13.md` (bis ein Regel-Blatt sie trägt) |
| offene Funde | `FUND-REGISTER.md` (Kopf „Stand 02.11." ist stale, 24 Erledigt-Zeilen stehen) |
| alte Karte (330) | `MEISTERKARTE.md`; Buchung im Zweig punkte-maschine |
| Meisterkarte 2 | `vision/MEISTERKARTE-2.md` + `vision/REGELN.md`; Befund `vision/meisterkarte-2-richter.md`; Akten `vision/richter/` |
| Preis des Orts | `vision/preis/ENTSCHEID.md` + `BERICHT.md`; Zug-Urteil `cloud-post/w28-preis-ort.md` |
| Baum | `vision/fernfeld/ENTSCHEID-BAUM.md` + `bericht-baum-schnitt{1..5}.md` (eine `BERICHT-BAUM.md` gibt es nicht) |
| Hausschatten / Licht | `vision/licht/bericht-himmel-korn.md` |
| Planet | `vision/planet/ENTSCHEID-REISE.md` |
| Stadt-Netz (OMEN) | `vision/stadt/ENTSCHEID-NETZ.md` + `erwachen/omen-2026-11-15.md` |
| Gesicht, Wange (GTX 1050) | `erwachen/gtx1050-2026-11-15.md` |
| Maschine | `zug/dienst/` (Code); Logs am Laptop: `%TEMP%/claude/w4/zug-nie-leer.log`, `w4/radeon-nie-leer.log`, `dienst/puls.out` |

Stale an main, eigener Abgabe-Zweig nötig: `CLAUDE.md:73` nennt main ff88b82d vom 18.10. (main ist 4ee205bd), `CLAUDE.md:94` verweist auf die SYSTEMKARTE vom 18.10. [q ORDNUNG.md §4 Nr. 3, 4].
Offen beim Namen: Code-Check-Urteil `w28-wange` · Täter der KERN-PFLICHT-Brüche an fcd4661e · `preis-lauf-zerlegt` · `ci-dauer-je-job` · Status-Zahlen A, B, E (`diag-boot-stage --kalt --echt`, ABAB Radeon).

Geschnitten: kein Code — EINE lebende Seite LAGE.md aus vier Befunden: Stand in Zahlen, drei Bremsen mit je einem Schnitt und Messnamen, Front der Meisterkarte 2, Fahrplan 24 h, 12 Regeln, die EINE Quelle je Faden.
Gemessen: Meisterkarte 2 0/1 718 (Richter 22/22 GRÜN, Preis 21/22 ROT) · Abgabe → Merge 2,81 → 1,02 h · rote Züge 13 → 0 · Wellen 60,9 M Tokens, 0 Landungen · alte Karte +1 je Tag · heim 34 %.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
