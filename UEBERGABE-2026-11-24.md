# ÜBERGABE 24.11. — Konto 18 (Koordinator Fable an der Radeon) an den Nachfolger

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Angelegt 10:50 bei 76 % Wochenverbrauch (alle Modelle; Fable 69 %); der
Schöpfer wechselt das Konto bei 98 %. Der lebende Stand steht in `LAGE.md` (Block „STAND 24.11.“), dieses Blatt trägt, was bleibt.

## 1. Die ersten zehn Minuten (in dieser Reihenfolge)
1. Haupt-Klon `C:/Users/micha/AnazhRealm-profiband`: `git fetch origin main`, dann `git diff --stat origin/main -- .claude CLAUDE.md`. Weicht
   etwas ab: je Datei `git show origin/main:<pfad> > <pfad>` und `git add`. Am 24.11. lief der Arbeitsbaum mit einer ALTEN champion.md —
   alle lokalen Arbeiter ohne WebSearch/WebFetch und ohne IPERKA. Lokales `main` ist eine Test-Fixtur; immer `origin/main` lesen.
2. `LAGE.md` (koordination, per `git show`), dann die Karten-Zahl aus `vision/karte-2-stand.json` am Kopf von `punkte-maschine` — nie aus dem Kopf.
3. `zug/runde.txt`: gtx- und radeon-Zeile. 15 min ohne Fortschritt = Alarm. Nach JEDEM Runden-Sprung nach 5 min beide Zeilen prüfen.
4. Geräte-Sitzungen per NAME anschreiben: „Omen Meister“ und „GTX1050 Meister“ (SendMessage). Die bridge-Adressen kamen nicht an; ListAgents
   kostet 106 Zeilen Kontext — nicht rufen. Zustellung ist nie bestätigt: jeder Auftrag liegt zusätzlich als `auftrag/<datum>-<name>.md` in koordination.
5. `get_usage`. Kontext: Bilder in voller Größe und breite Greps fraßen heute 130 k Token in 30 min — Bilder klein halten, Ausgaben schneiden.

## 2. Worte des Schöpfers vom 24.11. (bindend, wörtlich)
- ~02:00: „wir bauen gerade wieder nur richter, messen statt zu bauen“ → nie mehr Richter- als Macher-Karten.
- 10:20: „das bau/macherniveau scheint immernoch fern von AAAA... Arbeiten die arbeiter jetzt mit quellen, schauen reale bilder... das boot ist
  fern von einem realen boot, sehe kaum fortschritte … sieht fast alles noch gleich aus wie vor 12 h?“
- 10:30, auf meine Frage nach Referenz-Fotos: „Ja, nur ansehen“ (nur Bilddateien seriöser Quellen, eigenes Scratch-Verzeichnis, nie ins Repo,
  nie als Textur/Mesh/Vorlage).
- 10:35: „bei den fotos lernst du wie die realität die umgebung formt, finde die darunterliegenden gesetzte, parallelen, um die synergie nicht
  zu verlieren, damit du nicht atrappen baust, sondern prozedurale synergetische systeme (aus wenigen beispielen wird es uns möglich sämtliche
  systeme zu zeigen)“.
- 10:36: „fahre fort in deinem tempo, werde nach 98% den account wechseln. Sei dem nächsten ein vorbild“.

## 3. Der Kurs: Gestalt vor Kopplung
Die Wellen der Nacht bewegten Kopplungen, die node misst (Eis-Summe, Störungszone, Austrieb, Gang-Winkel) — das Bild blieb. AB JETZT:
- Fronten wählen nach dem, was der Spieler SIEHT: `mensch.bau.bauen#1` (Labor ↔ Welt 98 %, Soll ≤ 2,1 %), `mensch.fahrzeug.gestalt#1`
  (3 von 5 Gattungen; das Boot gehört HIERHER, als Gattung des Fahrzeug-Studios), `mensch.bau.innen#2` (Innen-Bild 0 von 18 lesbar).
- Jeder Brief für Sichtbares trägt: BILD-PFLICHT (Bildpaar vorher ↔ nachher im Spiel an derselben Kamera, der Macher sieht es selbst an und
  urteilt je Merkmal), zwei äußere Quellen mit Zahl, URSACHE je Merkmal (warum ist es so, welcher Eingang der Welt speist es, welches
  bestehende Gesetz liefert ihn) und mindestens EINE Gegenprobe (Eingang ändert sich → Gestalt ändert sich, ohne neue Vorlage).
- Gestalt kommt aus dem Gesetzbuch eines Studios, nie als Kasten-Vorlage in `stamm/bau-vorlagen.js`.
- Der Koordinator sieht das Bild an, BEVOR die Batterie läuft.

## 4. Brief-Pflichten (jede fehlte einmal und kostete eine Batterie)
`npm run check:statik` ganz · `npm run format:check` + `npm run lint` (CI „puls 2/2“) · `node scripts/stamm-umzug.cjs --nach-karte` ·
gate:betriebsgesetz · probe-tag · Zitat-Satz („Zweig `punkte-maschine`“) · Merge-Probe `git merge-tree --write-tree origin/main HEAD` exit 0 ·
Soll-Regel (ein Macher ändert nie das Soll seines Richters; eine gemeldete „korrigierte Station“ lese ich gegen eine unabhängige Quelle) ·
die Frage „standen WebSearch/WebFetch in deinem Werkzeug (ja/nein)“. Radeon: höchstens ZWEI lokale Arbeiter, GPU-Lauf ≤ 180 s unter dem
EINEN gpu-schloss, nie zwei zugleich, RAM frei ≥ 8 GB. Jeder Agent-Start nennt model „opus“ und subagent_type „champion“.

## 5. Meine Fehler (damit du sie nicht wiederholst)
1. Start: die Radeon mit zu vielen Arbeitern ans Limit gefahren — das alte Learning stand im Gedächtnis, ich las es nicht ganz.
2. Die veraltete Arbeiter-Definition fand ich erst auf die Frage des Schöpfers, nicht selbst.
3. Der Brief für den Anleger verlangte nur die Kopplung; das Kasten-Boot sah ich erst nach der Abgabe. Fünf Bild-Läufe für EIN Bild, einer
   davon neben einer CI-Probe.
4. Ein Arbeiter ersetzte das Eis-Gesetz und zog das Soll seines Richters nach — im Brief stand keine Soll-Regel.
5. Format/Lint und die Merge-Probe fehlten in den Briefen (drei rote oder abgebrochene Batterien).
6. Nach dem Runden-Sprung 10:00 standen BEIDE Messgeräte über 38 min: meine Nachricht an OMEN ging an die bridge-Adresse, und ich prüfte die
   runde.txt-Zeile nicht nach 5 min (eigene Regel).
7. Verbrauch: 65 % → 76 % von 08:46 bis 10:36; der Kontext lief in 30 min von 35 % auf 72 %.

## 6. Werkzeug (gesichert unter `bericht/2411-werkzeug/`; in den eigenen Scratch kopieren, die Pfad-Konstante S am Kopf jeder Datei anpassen)
- Stempel: `stempel-msg.sh <zweig> <kopf40> <satz-datei> <msg-datei>` → `stempel.sh <zweig> <kopf40> <msg-datei>`; nach ~5 min erbt der Kopf, der Zug fährt.
- Nach der Landung: `nach-landung.sh <zug-nr> <kommentar> <anspruch-zeile>` → `runde-jetzt.cjs sprung <repo> <runden-kopf40> <main40> <grund>` → OMEN per Name.
- Stationen: `pm-merge.sh bau <zweig…>` → `pm-pruef.sh <commit>` (erwartet genau zwei ROT gelaende.K2#1/#2 HAKEN) → `pm-merge.sh schub`.
- CI: `ci/ci-rot.cjs <sha40>` · `ci/ci-warte2.cjs <sha40> [min] [läufe]` · `ci/abbruch.cjs <lauf>` · `ci/lauf-jobs.cjs <lauf>` · `job-log.cjs <job> <ziel>` ·
  `ci/vorfahrt-waechter.sh <stunden>` (bricht wartende Macher-Batterien ab, wenn der Zug Läufer braucht, und startet sie neu — abgebrochen ist NICHT rot).
- LAGE: Block-Datei mit `@@ZEIT@@` → `lage-block.cjs <block> <ziel> <anfang des alten Blocks>` → `ko-datei.cjs <quelle> LAGE.md <betreff-datei>`.
- Bild im Spiel: `anleger-bild.sh` als Muster (eigener Port, wartet auf die Karte, 640×360 gelingt, größere fielen an der Frist).

## 7. Stand der Zweige um 10:50 (danach gilt LAGE.md)
- main f18576b6 (z710 `w28-nerv-schwung`). GESTEMPELT, warten auf den Zug: `w28-wind-saison` 5166b746 · `w28-mensch-nah` 28e4f478.
- IN DER BATTERIE ohne Rot: `klima-hebung` 43ea39ed · `saison-schatten` db7a8245 · `tat-aufwaerts` 03d2bba8 · `sport-regeln` 998254be. Die Stempel-Sätze
  liegen als `satz-<zweig>.txt` im Scratch der Sitzung 020b359f; fehlen sie, aus `cloud-post/<zweig>.md` des Zweigs neu schreiben.
- BEIM ARBEITER: `spiegel-eis` 3 (das Eis ohne Anleger, Baum AnazhRealm-acker) · `haus-gestalt` (Baum AnazhRealm-front-pl, `mensch.bau.bauen#1`).
- `auge-der-art` 380dc644: die GPU-Probe ist rot am Zeit-Deckel (gate:kreatur-takt 1 134 s > 960 s auf der GTX; das Tor braucht keine GPU und
  misst in der Cloud 2 275 s in drei Teilen — Bericht der GTX 1050, 10:47). Kein Urteil über das Verhalten; die Cloud-Batterie entscheidet.
- GTX 1050 schneidet `probe-deckel-einlass`: EIN Deckel `PROBE_DECKEL_S` 480, der Einlass weist jedes Tor über dem Deckel ab (zehn Tore).
- NICHT GEMERGT in punkte-maschine: pm-auge-der-art 42009563 · pm-saison-schatten 66cc8276 · pm-spiegel-eis (kommt neu) · pm-sport-regeln 3581c6ac ·
  pm-mensch-nah (Diff im Scratch `mensch-nah/station-eigenes-tuch.diff`).
- NÄCHSTER MACHER, sobald ein Platz frei ist: das Boot als Gattung des Fahrzeug-Studios (`worlds/garage`, `mensch.fahrzeug.gestalt#1`), der Steg
  als Zimmerwerk; die Mechanik „liegt am Ufer, folgt dem Spiegel“ steht im lokalen Zweig `anleger-gestalt` (Kopf 2c04ae52, Baum AnazhRealm-acker).
  Maß-Quellen: Ruder-Skiff 4,6–6,7 m lang, 1,02–1,22 m breit, Seitenhöhe 0,33–0,42 m, 3–5 Plankengänge je Seite; Deck: Fuge ≥ 4 mm, Balken alle
  450 mm bei 19-mm-Bohlen, 600 mm bei 32 mm.
