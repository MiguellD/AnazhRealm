# Bericht 2310 Messschuld Radeon am main-Kopf 452972a6 (V18.546.72), Fenster 1920×1080

**Status: ZWISCHENSTAND.** Ich habe nur gemessen und nichts am Code geschnitten.
- **Mess-Baum:** `.claude/worktrees/mess-main`, detached auf `452972a618d58ba02c65c633b31588fcbda60d9e` (`git ls-remote origin refs/heads/main` am 23.10. 07:14).
  - node_modules ist eine Junction auf den Haupt-Klon.
  - Die Lock-Datei ist bis auf die Versionszeile gleich.
- **Bedienter Baum:** Jeder meldete `VERSION = "18.546.72"`.
  - Geprüft über den save-server-Abruf (M43), `constructor.VERSION` in der Seite (M37, M38, M43) und `kernStand` der Albedo-Messung mit SHA 452972a6.
  - M41 dient den eigenen Baum der Linse: `ROOT` = mess-main, `VERSION` in `stamm/dirigent-kern.js`. Das Gerät meldete `[linse-gpu] amd/rdna-3`.
- **Schloss und Ports:** Jeder echte Lauf lief als EIN Befehl unter `gpu-lauf.sh messbahn` (`skripte/reihe.sh`, Wiederholung bei Exit 75 über `skripte/wiederhole.sh`), auf den Ports 7970–7979.
- **Fremdlast:** Die Last steht in `last.txt`.
  - `m*-vor` liegt VOR dem Warten aufs Schloss und taugt nicht als Fremdlast.
  - Ab M37 misst `skripte/mitlast.sh` im Schloss. Die Zeilen `m37-*` zeigen die Gesamt-CPU samt eigenem Browser.
  - Ab M37f/M38e misst `skripte/fremd.ps1` die CPU OHNE den eigenen Browser-Baum und Node, als `fremd%`.
- **Ablage:** Die Rohdaten liegen in `bericht/2310-messschuld-radeon-main/`, die Skripte in `…/skripte/`.
  - Die Skripte sind Kopien aus `2210-messschuld-6cfce/skripte`; die Erweiterungen sind je Messung benannt.
- **M40 fällt aus:** main trägt den Zug 5 nicht. `origin/material-mikro` und `origin/material-lack` sind keine Vorfahren von 452972a6 (`git merge-base --is-ancestor`).

## M41 Vegetation K4: Halm und Büschel in jeder Haus-Box. Soll erfüllt, **Urteil 1**
- **Befehl:** `reihe.sh m41` = `HAUS_WELT_PORT=7976 HAUS_WELT_JSON=… node scripts/diag-haus-welt.cjs --phasen=grund --bild --echt`.
  - Echter Renderer (`linse` = die Radeon), Phase grund, W9 aus dem Ausgabe-Bild.
- **Zahl:**
  - Start-Dorf (42 Häuser) und gesetztes Haus (`haus_skandinavisch` 48/0, `spieler: true`): 43 Häuser, 53 Boxen, 94 Blicke.
  - **Büschel 0** in allen 53 Boxen, **Halm-Pixel 0** in allen 49 gesehenen Boxen.
  - Gegenprobe vor der Tür des gesetzten Hauses: 59 514 px.
  - **4 Boxen ohne freies Auge** (blicke 0, Büschel und Dichte 0): skandinavisch #14, italienisch #22 und #28, provenzalisch #31. Am 21.10. war es eine.
- **Befund (kein Halm, kein Büschel):** Im Turm des gotischen Hauses #41 (8 Proben) liegen **7 366 Boden-Pixel**.
  - Im Bild `grund-41-0-turm-0.png` ist der Turm ohne Diele: Der Boden-Satz ist innen sichtbar, grünbraune Erde.
  - Das hohe Gras steht nur draußen hinter der Öffnung.
  - Die Linse meldet dafür `❌ W9 Bild`.
- **Weitere ROT-Zeilen der Linse:** `W9 Waise` und `W9 Ausstattung` sind „blind“, denn die Phase grund fährt allein. Dazu kommt ein `console.error` „Destroyed texture TRAANode.resolve used in a submit“, Exit 1.
- **Bild (selbst angesehen):**
  - `grund-42-1-haupt-0.png`, das gesetzte Haus innen: Fachwerk-Treppe, Dielenboden, kein Halm.
  - `grund-42-0-anbau-1.png`: der Anbau mit leerem Boden; das Gras steht nur jenseits der Tür.
- **Last:** Die Zeile liegt vor dem Schloss (16 %). Die Messung ist eine Zählung, kein Zeit-Kriterium.
- **Roh:** `m41-grund-bild.json`, `m41.out`, `m41-bilder/` (94 PNG).

## M43 Material K3, Fels-Seite: die Welt zeigt den Fels nur in L0. **Urteil 1** (Fels-Hälfte nach der Definition erfüllt)
- **Befehl 1:** `reihe.sh m43b` = `sitzung.sh` (Werkbank :7972 `--echt`, save-server :7973) + `werkbank eval "$(cat skripte/m43-stufen.js)"`.
  - Die Stufen-Abfrage am Fels des Genesis-Rings: Das EINE Auge der Stufen (`_lodAuge`) rückt von 4 bis 180 m, je Abstand 60 Takte.
- **Zahl:**
  - Der Fels der Tafel-Zeile ist ein `felsturm`, der einzige Fels der Welt, 43,7 m von der Genesis-Mitte.
  - Preset `zacken`, `kindStages [0]`, die Klammer `_foundryDeclaredStage` für den Wunsch 0/1/2/3 ergibt **0/0/0/0**.
  - Der Wunsch der Distanz wechselt 0 → 1 bei 16 m und 1 → 2 bei 30 m (thresh01 12, thresh12 26).
  - Die **servierte Stufe ist 0 in allen 17 Abständen** bis 180 m. Der Kulling-Radius liegt bei 135 m; gezeichnet und instanziert ist der Fels in jedem Abstand.
- **Befehl 2:** `reihe.sh m43` = dieselbe Sitzung + `werkbank albedo --tafel`.
  - Die Tafel des Mess-Baums trägt dazu die Zeilen `fels-l1`/`fels-l2` (`exemplar.stufe` 1/2, `stufeVon fels`; `skripte/m43-tafel-patch.cjs`, danach `git checkout`, nie committet).
- **Zahl:**
  - fels Welt Y 0,2388, Stufen [0], L/W 1,02.
  - **fels-l1 / fels-l2: „das Exemplar zeigt seine Stufe 1 (2) nicht (30 s)“.** Die Welt hat keine Fels-Stufe jenseits L0.
  - Haus frisch am Kopf: L0 0,1593 · L1 0,1581 (**L1/L0 0,992**) · L2 0,1570 (**L2/L0 0,986**), Stufen [1]/[2] gezeichnet.
  - Die Tafel steht 11/14 im Soll. haut 0,86 ist ROT wie bisher; fels-l1 und -l2 sind stumm, wie erwartet.
- **Befund benannt:** Die Welt zeigt den Fels nur in L0. Die Definition von M43 erklärt damit die Fels-Hälfte als erfüllt, die Haus-Hälfte ist belegt.
- **Werkzeug:** Der erste `eval` lief vor dem Formationen-Satz („kein Felsbogen“, nur `start_plattform`). Darum tickt die Abfrage jetzt, bis der Satz steht (14 Takte).
- **Last:** Die Zeilen liegen vor dem Schloss. Die Messung ist kein Zeit-Kriterium.
- **Bild (selbst angesehen):** `m43-tafel/welt-fels.png` zeigt fünf Fels-Gestalten des Satzes auf der Magenta-Maske, grau-oliv, ohne Fremdstoff.
- **Roh:** `m43b-2.txt` (Stufen-Abfrage), `m43-3.txt` (Tafel), `m43-albedo-welt.json`, `m43-tafel/`, `m43-patch.txt`.

## M37 Speicher K1, Radeon-Seite: 20 harte Tode, 4 davon im Dorf-Erwachen. **Urteil 1** an der Radeon (die 2 braucht die GTX)
- **Befehl:** `reihe.sh m37` = `mitlast.sh m37` + `node skripte/echt-k1.cjs 20 main`.
  - Statik-Host :7974 ohne save-server, `GPU_LAUF_MAX_S=2400`.
  - Je Zyklus: W gehalten, alle 1,5 s ein stein_block und ein Edit, Tod hart (`taskkill /F /T`).
- **Neu gegen 6cfce: der Tod im Erwachen.**
  - Der Spieler wird 180 m vor den Ort der nächsten freien Dorf-Zelle gesetzt (wie M36 die Bahn setzt). Die Welt weckt sie im eigenen Takt (`_tickAutoSettlement` → `_autoSettlementSpawnCell` → `_dorfErwachen`).
  - Das erste Bild mit lebendem `_autoSettlementQueue.gang` ist der Gang.
  - **erwachen-mitten** (z3, z11): Tod in diesem Bild.
  - **erwachen-idb / erwachen-platz** (z6, z14): Ein Speichern im Gang (setTimeout → `saveState`, der Weg des Edit-Save-Timers) schließt den Gang synchron (`__GANGENDE__` nach 7 bzw. 8 Schritten). Der Tod fällt am Haken DIESES Stands.
  - Gezählt werden 10 Haken-Tode (idb 3, fest 2, platz 3, erwachen-idb 1, erwachen-platz 1) und 10 zufällige (zufall 8, erwachen-mitten 2).
- **Neu: die halbe Welt des Dorfs.** Je Laden werden die reservierten Zellen (`settlementCells` ohne `d:`) gegen die Orte im Erdbau (`erdbau` ohne `haus:`) gezählt.
- **Zahl:**
  - 20 Tode, 0 Haken verfehlt, Welt-ID 21/21.
  - **Alter max 3,24 s** (erwachen-idb), sonst 0–2,91 s. **0 über 10 s, 0 korrupt, 0 halbe Welten.**
  - Zellen gleich Orte in 21/21 Ladungen. Am Ende stehen 40 Blöcke und 94 Edits.
- **Was der Tod im Erwachen zeigt:**
  - In z6 schrieb der Stand im Gang `platz` 96 ms vor dem Tod (Zellen `-1,2;start`). Der Tod fiel beim `idb`-Put desselben Stands.
  - Geladen wurde der ältere ganze Stand (`start`, 3,24 s). Den Platz-Stand im localStorage, 96 ms jünger, nahm die Rettungs-Kette nicht. Das ist benannt, verletzt das Soll aber nicht.
  - In z14 (Tod 5 ms nach `platz`) lud er den Stand 2,14 s davor.
  - In beiden Fällen ist die Zelle nicht reserviert und ihr Ort nicht im Erdbau, also ganz. Die Zelle erwacht neu.
- **Lage-Toleranz, benannt:** Nach dem fest-Tod z8 steht der geladene Spieler 5/25 mm neben dem Stand, den der fest-Haken 2 ms vor dem Tod meldete. Blöcke 25, Edits 49 und Zellen sind gleich; der Körper wird nach dem Laden aus Bau oder Edit gedrückt.
  - Streng (0 mm) wäre das Alter null, also „halb“. Mit 50 mm Toleranz ist es 0,002 s (`skripte/k1-nachurteil.cjs`, `m37-nachurteil.txt`).
  - Die übrigen 19 Tode sind mit und ohne Toleranz gleich.
- **Last im Schloss:** Gesamt-CPU 7 % am Start (ohne den eigenen Browser), im Lauf 21–69 % samt eigenem Browser, 0 % am Ende. Das ist kein Zeit-Kriterium.
- **Bild (selbst angesehen):** `m37-echt-k1-main.png` (Third nach dem letzten Laden).
  - Der Spieler steht im hohen Gras an einem Hang vor Nadelwald.
  - Bewohner gehen über die Wiese; oben am Weg steht eine Reihe von Menschen.
- **Roh:** `m37-echt-k1-main.json`, `m37.out`, `m37-nachurteil.txt`.

## M37f Speicher K1 nachgezogen: der Tod, NACHDEM der Stand im Gang fest liegt. 4 Tode, **0 halb**
- **Befehl:** `reihe.sh m37f` = `mitlast.sh` + `K1_ARTEN=erwachen-fest,zufall node skripte/echt-k1.cjs 4 main-fest` (:7977).
  - In M37 erreichte kein Stand im Gang die Platte, denn jeder Tod im Erwachen fiel vor dem Commit.
  - Hier fällt der Tod am `fest` (Transaktion committet) des Stands, den saveState im Gang schließt.
- **Zahl:**
  - z0 erwachen-fest: Zelle -2,-2 (nH 16), `__GANGENDE__` nach 8 Schritten, Speichern 53,1 ms, Tod 2 ms nach `fest`.
    - **Geladen: Zellen `-2,-2;start` = 2 Orte im Erdbau, Alter 0,002 s.** Die Häuser nach dem Laden stiegen von 19 auf 39.
  - z2 erwachen-fest: Zelle -3,-1, Speichern 63,5 ms.
    - **Geladen: 3 Zellen = 3 Orte, Alter 0,003 s, 62 Häuser.**
  - Die zwei zufälligen Tode: 0,307 s und 0,195 s.
  - **Alter max 0,307 s, 0 über 10 s, 0 korrupt, 0 halbe Welten.**
- **Fremdlast im Schloss:** 2,6–6,5 % (`fremd.ps1`), 0 fremde Browser.
- **Bild (selbst angesehen):** `m37f-echt-k1-main-fest.png` (Third). Der Spieler steht im Mischwald am Hang, hohes Gras, ein Weg und Fels. Das Dorf liegt 180 m außer Sicht.
- **Roh:** `m37f-echt-k1-main-fest.json`, `m37f.out`, `m37f-nachurteil.txt`.
- **Urteil M37 (Radeon-Seite):**
  - 24 harte Tode, 6 davon im Dorf-Erwachen (2 im ersten Bild des Gangs, 2 am Schreiben seines Stands, 2 nach dessen Commit).
  - Alter max 3,24 s, 0 korrupt, 0 halbe Welten. **Soll 1 erfüllt an der Radeon.**
  - Die 2 braucht dieselbe Folge an der GTX.


## M38 Speicher K2: Speicher-ms je Bild, die Leck-Probe getrennt. Soll erfüllt, **Urteil 1**
- **Neu gegen 6cfce:**
  - Die Zeit der Mess-Haken fällt aus der saveState-Zeit. Das ist `JSON.parse` im setItem/put-Haken, um den Stand zu erkennen; 6cfce zählte sie mit.
  - Die Leck-Probe des Flugschreibers (`_flightRecorderMemProbe`, im `_imLeerlauf` alle 4 s) ist ein EIGENER Posten je Bild.
  - Je Bild = je rAF-Intervall.
- **Im Lauf M37** (19 972 Bilder aus den geernteten Zyklen; die Bilder einer Seite, die im Erwachen starb, gehen mit ihr verloren):
  - Speicher je Bild p95 **0 ms**, p99 0, max 18,1, Mittel 0,084 ms (181 Bilder mit Speicher-Arbeit).
  - saveState je Ruf p50 7,3 / p95 12,0 / max 17,7 ms (325 Rufe).
  - Leerlauf-Rückruf mit Save p50 10,5 / p95 15,4 / max 22,8 ms (64; samt Haken).
  - **Leck-Probe je Bild p95 0 ms**, max 0,5 ms (84 Proben: p50 0,1 / p95 0,3 / max 0,5 ms).
- **Lauf mit erwachender Zelle:** `reihe.sh m38e` = `mitlast.sh` + `node skripte/echt-k1.cjs erwachen main-erwachen` (:7975).
  - EIN Boot ohne Tod, 20 s Ruhe, dann der Stand 180 m vor der Zelle -2,-2 (nH 16). Sie erwacht im Takt, der Autosave läuft frei, dazu EIN Stand im Gang. 90 s, 10 501 Bilder.
  - **Speicher je Bild p95 0 ms**, p99 0, max 47,6 ms (der Stand im Gang), Mittel 0,026 ms.
  - Die 300 Bilder ab dem Gang: p95 0, max 47,6.
  - saveState p50 11,7 / p95 13,5 / max 47,6 ms (20 Rufe).
  - **Leck-Probe je Bild p95 0 ms**, max 0,1 ms (22 Proben, p95 0,1 ms).
  - Danach 2 Zellen = 2 Orte, 40 Häuser.
- **Fremdlast im Schloss:** 4,1–6,4 % (`fremd.ps1`), 0 fremde Browser. Der Lauf zählt für das Zeit-Kriterium.
  - Der erste gültige Lauf (`m38e-lauf4-ohne-schlosslast.out`, max 51,2 ms, p95 0) hatte keine Last-Zeile im Schloss. Er zählt nicht.
- **Benannt:** Ein Stand, der den Gang schließt, kostet in seinem Bild 47,6–63,5 ms an der Radeon, gegen 7–15 ms für einen Stand ohne Gang.
  - In 6 Läufen geschah das 6-mal: je 1 in m38e-Lauf 4 und m38e, je 2 in M37 und M37f.
  - Der p95 je Bild trägt es nicht; es ist EIN Bild von 48–64 ms, wenn ein Speichern in den Gang fällt.
- **Werkzeug-Brüche, benannt:**
  - Lauf 1 und 2 hingen 600 s im Boot (`m38e-lauf1-haenger.out`, `-lauf2-`). Lauf 3 zeigte die Ursache: Der Statik-Host antwortete 403 (`m38e-lauf3-403.out`), weil die Kopie ihm die Wurzel mit Vorwärts-Schrägstrichen gab. Heilung: die Wurzel des Mess-Baums als Standard.
  - Die Boot-Wache mit Debugger-Stapel bleibt im Skript.
- **Roh:** `m38e-erwachen.json`, `m38e.out`; die M37-Zahlen in `m37-echt-k1-main.json`.


---
Geschnitten: nichts (nur Messung).
Gemessen (452972a6, Radeon): M37 24 Tode (6 im Dorf-Erwachen), Alter max 3,24 s, 0 korrupt, 0 halb · M38 Speicher je Bild p95 0 ms, die Leck-Probe getrennt p95 0 ms (max 0,5), der Stand im Gang 47,6–63,5 ms in seinem Bild · M41 Halm 0 und Büschel 0 in 53 Boxen (4 ohne Auge, ein Turm mit 7 366 Boden-Pixeln) · M43 der Fels nur in L0 (kindStages [0], serviert 0 bis 180 m), Haus L1/L0 0,992, L2/L0 0,986 · M40 ausgelassen (Zug 5 nicht auf main).
Pflicht-OFFEN Rest: A · B · E (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
