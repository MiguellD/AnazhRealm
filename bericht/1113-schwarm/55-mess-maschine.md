# 55 Die Mess-Maschine: wo Messung verloren geht (Stationen · Sitzung · Richter · Buchung)

## Was es den Spieler kostet (kein Bild gesehen — Prozess)
- Die Karte sagt nichts Frisches über das Spiel, das er sieht: `stand.json` am ec281422 (19:48Z) trägt 285 GRÜNE Hälften, davon **284 nur
  von der Ratsche gehalten**, 1 frisch (radeon 71 gehalten / 1 frisch, gtx 69 / 0, headless 144 / 0). Die gehaltenen GTX-Hälften stammen
  zu 27 vom 29.10. (715754fc 14, b3f9ae95 13). Die Zahl 221 ist ein Urteil über alte Köpfe.
- Punkte netto seit 07.11. 09:17: +1 (Kurs-B §4, 218 → 219/221).
- Messzeit, die nichts bewegt (Mess-Dateien seit 11.11., eigene Zählung über `messung/*.json`):
  - **Radeon** 807 Urteile (ohne Zwilling), 435 GRÜN, 646 Lauf-Minuten. Davon 20 Stationen ≥ 3× gemessen und NIE GRÜN: 197 Urteile,
    206 min = 32 %.
  - **GTX** 135 Urteile, 8 GRÜN (6 %). 22 Stationen 3–8× ROT ohne ein GRÜN, z. B. ankunft.K1#2 8×, affekt.K4#2 8×, fahrzeug.K2#2 7×,
    material.K1#1 6×, haar.K2#1 6×.
- Die GTX misst je Kopf ~5 Stationen in ~75 min, Beispiel a41ce72d-gtx: 9 Stationen 15:08–17:46 = 158 min, Σ s der Läufe 9,7 min = 6 %.
  Am 13.11. endeten **8 von 8** Listen der OMEN „am Sprung“ (zug/erledigt.txt 01:35 … 21:28): nie lief eine Summe, nie der Richter der GTX.

## Was die Quelle sagt
**Die Auswahl: drei Wähler, keiner kennt den Heil-Versuch.**
- Radeon: `zug/dienst/radeon-dienst.sh:203` `miss … --offen` → `punkte.cjs auswahl` :3644–3647. Sie nimmt jede Station, deren Messung
  nach R6 (Konsum) alt ist. Jede Landung macht die meisten alt: am ec281422 radeon 57 nach Konsum, 25 „Station geändert“, 13 Linse
  (Kurs-B §1).
- Die Wellen (`fahrtWellen` :3018, ab71fe5b 13.11.) ORDNEN nur: nah · hebt · rest. Gestrichen wird nichts.
- OMEN: `zug/dienst-omen/landung-dienst.sh:55` `gtx-nutzen` = `gtxNutzen` :5087. Die Frage dort ist allein „ändert ein GRÜN die Punkte?“.
  Ob seit dem letzten ROT jemand das Kriterium angefasst hat, prüft niemand. Darum steht ankunft.K4#1 an jedem Kopf vorn und reißt seinen
  Deckel immer gleich: 139,2 s an 1cd1c408, dc9eacb0, a41ce72d.
- Die Regel „eine rote Station ohne Heil-Versuch bleibt rot und wird nicht gemessen“ gibt es: `messPlan` :5112–5150 (genannt = Kriterien
  im `git log alt..neu` :5175, dazu weg.json :5177–5179, neu, PFLICHT). Kein Dienst ruft `plan` (grep in zug/: 0 Treffer). Ein toter
  Zwilling der Auswahl.

**Der Hedge an der GTX (G4):**
- `landung-dienst.sh:56` filtert mit `stufe/ohne-band.cjs` „profiband.* ruhen, bis /band nach w27-gpu-wahl-heil wieder misst“
  (ohne-band.cjs:1–2).
- Die Bedingung gilt seit main c0bb11b0 (10.11. 19:54). Trotzdem ruhen an jedem Kopf des 13.11. „10 profiband.*“ (erledigt.txt 774–806).
- Die GTX misst Pflicht E (profiband.K1–K3, pflicht.E) zuletzt am **07.11.** (Kurs-B §1).
- Dass /band misst, zeigt die Radeon heute: profiband.K1#1 „genesis-third-geht 100,11“ (radeon-nie-leer-lauf.out, 21:11-Lauf).

**Die Fahrt und ihre Risse (Radeon, `w4/radeon-nie-leer.log`, 12.11. 15:31 → 13.11. 21:11):**
- ~30 Starts, 4 ganze Fahrten (4d52c7bc, 350e6b11, 1cd1c408 ×2). Der Rest endete am Abbruch durch CI oder Warter; `behalte` :4034 rettet
  die Teile.
- Zweimal endete ein Lauf mit 0 Stationen nach je ~21 min: 16:48 und 17:14, „keine Stations-Grenze in 600 s“ (radeon-dienst.sh:141).
- ec281422 (20:17–20:55): 57 behalten = 22 Urteile (5 GRÜN) + 35 UNGEMESSEN. Davon 23 „die Fahrt riss 1800 s (in vegetation.K4#1)“:
  vegetation.K4#1 lief 250,7 s. Dazu 3 Last, 5 ohne Urteils-Zeile, 3 Deckel (git show 2161d3752).
- Dieselbe Klasse am 12.11.: 4d52c7bc 51× Fahrt-Riss, 507beba6 23×, dc9eacb0 27×.

**Die Abstürze ohne Wort (geheilt, Ursache offen):**
- Exit 3221226505 = 0xC0000409 dreimal: Halter 11.11. (`halterEnde` :2496), Werkbank 36f9d45a 13.11. mit 123 Scheinurteilen
  (`halter` :2367–2374, 191f0684) und heute die Probe leib.K3#2 (UNGEMESSEN „keine Zeile LEIB_K3_BILD (Exit 3221226505)“).
- Alle drei Stufen urteilen jetzt UNGEMESSEN. Der Richter halbierte trotzdem 74 min an 36f9d45a (19:02 → 20:16, Log).

**Fremd-Last, auch durch diesen Schwarm:**
- Der laufende 21:11-Lauf nennt ankunft.K2#1 und ankunft.K3#1 OFFEN: „Last f 1,984 … fremd: Claude.exe --type=renderer …“.
- Die nah-Welle fiel ROT: klang.K5#2 0,4 ↔ ≤ 0,2 ms; profiband.K4#1 max 100,14 ↔ < 100 ms.

**Was die Maschine KANN gegen das, was sie KONSUMIERT:**
- Gebaut sind: die Heil-Regel (messPlan), die warme Sitzung je Fahrt (`fahreSitzung` :3231), die Farm für headless (punkte-farm.yml,
  9,3 min Wanduhr an 6aa7a5a6, bcbd8d39).
- Genutzt wird: keine Heil-Regel. Die GTX bootet je Station eine eigene Sitzung (`kandidat.sh` EINZELN=1, landung-dienst.sh:74).
- Headless läuft seit 10.11. 13:17 nie. `fahre.sh:161` endet mit `FAHRT_OHNE_PUNKTE=1` vor Stufe 6; die Farm kennt nur
  `workflow_dispatch`.

## Die EINE begrenzende Entscheidung
**Eine Karte misst ein ROT erst wieder, wenn eine Landung sein Kriterium beim Namen nennt. Was jede Karte misst, wählt EINE Stelle:
`auswahl` in punkte.cjs.**
- Ausgenommen bleiben drei Fälle:
  - nie gemessen;
  - PFLICHT-OFFEN in der quelle;
  - gebucht GRÜN (ein Rückfall-Fall braucht ein frisches Urteil).
- Die Kurs-Regel „jeder Brief nennt die Kriterien“ (UEBERGABE §2.6) macht die Commit-Nachricht zum Leser.

## Der Schnitt (die Klasse „wer wählt, was gemessen wird“, ganz)
**Stufen:**
1. `punkte.cjs auswahl` :3644–3647: nach dem Frische-Filter die Heil-Regel.
   - Fallen soll eine Station, deren jüngstes Urteil auf DIESEM Gerät ROT ist (m.je, nicht ungemessen) und die zugleich:
     - in `stand.json` nicht GRÜN gebucht ist,
     - kein PFLICHT trägt,
     - deren Kriterium in `git log <mess-sha>..<sha>` nicht genannt ist und in weg.json nicht gelandet ist.
   - Die Startzeile nennt sie beim Namen: „ROT ohne Heil-Versuch n: …“.
   - Die Quelle der Regel ist `messPlan` :5121–5150. Danach `messPlan` + `planCli` :5112–5200 LÖSCHEN (Zwilling, kein Leser).
2. `gtx-nutzen` (`gtxNutzenCli` :5248) liefert nur noch `ja ∩ auswahl(--offen)`. Dann gilt für die OMEN dieselbe Regel ohne eigenen
   Wähler.
3. `landung-dienst.sh:56` → `BILD=$ALLE`. `stufe/ohne-band.cjs` LÖSCHEN: die Bedingung gilt seit 10.11. Die GTX misst Pflicht E wieder.
4. headless: `buche-dienst.sh:23` ruft je neuem main-Kopf EINMAL `punkte.cjs run --sha $K --geraet headless --offen` (farmRufen :3817).
   Das ist derselbe Wähler wie oben; kein Laptop, kein Schloss.

**Leser-Liste (wer liest, was sich ändert):**
- `auswahl` → `run` :3908, `scheiben` :3714, `farmRufen` :3814.
- `radeon-dienst.sh:118` (`run --offen`); `nichts_offen` :67 liest „jede Station … frisch gemessen“. Die Zeile bleibt, nur die Menge
  schrumpft.
- `gtx-nutzen` → `landung-dienst.sh:55` und `wellenDerFahrt` :3882.
- `zug/dienst/werkzeug/hebend-messen.sh:11` (`scheiben --offen`).
- `zug.cjs:1292` (`--offen` bei Zuruf).
- `ohne-band.cjs` liest nur `landung-dienst.sh:56`.
- `messPlan`/`planCli` liest nur der Verb-Verteiler :78xx.

**Kosten-Zeile:**
- Spiel 0 Bytes.
- punkte.cjs etwa +25 / −90 Zeilen; die Dienste −1 Datei, +2 Zeilen.
- Messzeit sinkt (geschätzt aus `s` der Mess-Dateien, nicht gemessen):
  - GTX-Liste von 26–30 auf ~8 Stationen, sie passt in ein Fenster von 15–40 min;
  - Radeon −32 % der Lauf-Minuten (die 20 nie-GRÜN-Stationen, sofern ungenannt).
- Kein Soll, keine Schwelle, kein Deckel bewegt sich.

**Kriterien der Meisterkarte, die die frei gewordene Zeit trägt** (Ist ↔ Soll, Station; Kurs-B):

| Kriterium | Ist ↔ Soll | Station |
|---|---|---|
| mensch.K4 0/2 | GTX GRÜN 12.11. (4d52c7bc); Radeon gesicht 0,833 ↔ 1 | mensch.K4#1 radeon\|gtx |
| vegetation.K5 1/2 | Radeon „Blickziel verdeckt (baum_tanne 46 m)“ | vegetation.K5#2 radeon |
| leib.K3 1/2 | Radeon Höhle-Abfall 0,01 ↔ [0,06; 0,25] | leib.K3#2 radeon |
| klang.K5 1/2 | Radeon 0,4 ↔ ≤ 0,2 ms (21:xx unter Last) | klang.K5#2 radeon |
| Pflicht E: profiband.K1–K3 0/6, pflicht.E | GTX zuletzt 07.11. | profiband.K1–K3 gtx (Frame p95 16,8 ms laut CLAUDE.md) |

**Beweis:** Selbsttest-Fall in `selbsttest` :5392.
- Eine ROTE Station ohne Nennung fällt aus `--offen`.
- Mit Nennung im Commit, gebucht GRÜN, PFLICHT oder neu bleibt sie.
- Die Mutante „Regel aus“ ist ROT.
- Danach EINE Fahrt `run --offen --trocken` am ec281422: Zahl der Stationen vorher ↔ nachher je Gerät.

## Was schon liegt
- punkte-maschine **191f0684** (13.11. 20:15): die Werkbank ohne Wort ist UNGEMESSEN; selbsttest 230/230 GRÜN; im Dienst seit 20:16
  (FUND 254).
- punkte-maschine **ab71fe5b** (13.11. 19:02): die Fahrt in Wellen nach Nutzen, der Ort wandert nie mit. Sie läuft gerade erstmals voll:
  nah 3 Läufe in 237,6 s.
- Dienst eaa749bd: radeon-dienst mit behalte, weich und Fortsetzung, Selbsttest a/a2/a3/b.
- Ohne Arbeiter: `w28-pm-zeuge-pm` 2634387c (12.11., Klasse „Welt der Sitzung trägt nicht“, 5 Paare) und `w28-richter-hand3-pm`
  8afcd41a (bauen.K5, Mess-Halt; Kurs-B §5).
- Für die Heil-Regel in `auswahl`, das Ende von `ohne-band.cjs` und den headless-Ruf liegt KEIN Zweig. Bis zur Landung fehlen alle
  vier Stufen samt Selbsttest-Fall.

## Ehrlich offen
- **Nicht gelesen:** `kandidat.sh` ganz (warum zwischen zwei GTX-Stationen 4–40 min liegen: Schloss, `cpu_ruhe`, WEICH 600 s);
  `richter.sh`; `buche.sh`; `fahreGruppeEinmal` :1615–1866; `r6Quelle` :4752.
- **Nicht gemessen:** die Wirkung der Heil-Regel (nur geschätzt); ob ein ungenannter Schnitt ein ROT heimlich heilt. Das Risiko: es
  bleibt ROT bis zur Nennung.
- **Widerspruch / Fund:** `radeon-dienst.sh:211` greift die letzte passende Zeile aus dem ANGEHÄNGTEN `richter.out` (:62 `>>`). Das
  Log nennt „Richter 36f9d45a: richter radeon 1cd1c408: 11 Fälle“ — eine fremde, alte Zeile.
- Die Ursache von 0xC0000409 ist unbenannt (dreimal in drei Tagen; das Windows-Anwendungsprotokoll schweigt, FUND 252).
- Die OMEN bootet je Station eine eigene Sitzung (EINZELN) gegen das Gesetz der EINEN warmen Welt. Diesen Schnitt trägt dieses Blatt NICHT.
- **58 der 111 offenen Punkte haben keine Station** (Kurs-B §1). Mehr Messen bewegt sie nie; sie fallen nur im Klassen-Schnitt ihres
  Briefs.
- Dieser Schwarm ist selbst Fremd-Last auf der Radeon (Claude.exe im Zeugen des 21:11-Laufs).

## Rang
Wirkung im Takt **4**:
- die GTX schließt Listen wieder (Summe und Richter laufen);
- Pflicht E misst wieder auf beiden Karten;
- ~⅓ der Radeon-Minuten geht an Stationen, die kippen können.

Aufwand **S–M**: eine Funktion, ein Selbsttest-Fall, eine Dienst-Zeile, eine gelöschte Datei, ein Ruf.

Risiko: Eine Landung, die ein ROT heilt, ohne das Kriterium zu nennen, bleibt ungemessen, bis ein Brief es nennt. Die Kurs-Regel „jeder
Brief nennt die Kriterien“ schließt das, Wachsamkeit tut es nicht.
