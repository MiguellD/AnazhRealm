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

## 8. STAND 12:20 (gilt vor Abschnitt 7; der lebende Stand ist der oberste NACHTRAG in LAGE.md — nur die ersten 190 Zeilen lesen, die Datei hat 690 000 Zeichen)
- main daee7541 (V18.546.401); fünf Macher-Landungen 10:39–11:57 (z711–z714). Karte 2: 83 von 1 718. Runde 20 am daee7541 seit 11:59.
- Gestempelt: `w28-spiegel-eis` 04aa7ca9. In der Batterie: `auge-der-art` 3 f55b3018 · `probe-deckel-einlass` f4158c03 · `haus-gestalt` 5e497a9f ·
  `haus-stoff` 51a7a9cb (gestapelt — erst haus-gestalt stempeln). Die Stempel-Sätze liegen gesichert unter `bericht/2411-werkzeug/satz-<zweig>.txt`.
- Bei OMEN: `auftrag/2411-omen-ort-2.md` (Merge, grüner Cloud-Kopf mit Konflikt) · `auftrag/2411-omen-sport-3.md` (deterministisch rot).
- Was heute WIRKTE (wiederholen): (1) ein Zuarbeiter `general-purpose` mit Web-Zugang schreibt Maße mit URL, URSACHE je Merkmal und
  Referenz-Fotos in den Scratch (`bericht/2411-quellen/`), die Macher lesen die Datei — 13 min, 60 Zahlen; (2) der Brief verlangt je Merkmal
  „warum · welcher Eingang der Welt · welches bestehende Gesetz“ und EINE Gegenprobe mit Mutante — der Haus-Macher fand so den wahren Täter
  (die Region wurde über den Planeten gewürfelt) statt des vermuteten; (3) Stufen von 20–60 min mit Bildpaar, jede landet für sich
  (haus-gestalt → haus-stoff → Dach), statt einer großen Welle; (4) `ci/gruen-warte.sh` weckt nur bei echtem Urteil.
- Neue Fehler dieser Stunden: meine Merge-Probe las den Exit von `head` statt von git (ort-ausstattung sah konfliktfrei aus) — immer
  `git merge-tree --write-tree … >/dev/null 2>&1; echo $?`; `ci-warte2.cjs` hält „abgebrochen“ für „durch“; Uhrzeiten nur aus `date`.
- Engpass ist die CI-Reihe (20 Läufer, 22 Jobs je Batterie): `ci/vorfahrt-waechter.sh 2` und `ci/main-veraltet.sh 2` nach dem Start neu aufsetzen.

## 7. Stand der Zweige um 10:50 (überholt, siehe Abschnitt 8)
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

## 9. STAND 13:37 (gilt VOR Abschnitt 8; die lebende Zeile ist der oberste NACHTRAG in LAGE.md)

- **main a8dd22b5** (V18.546.403), sechs Landungen heute (z711–z716), Runde 22. Karte 2: 83 von 1 718.
- **Der Ratschen-Commit 28240b1bff13e4f1b7eeb9039c15195fd8b1309c** (GTX 1050): die Zeichenzahl des Boden-Programms ist kein Tor mehr.
  Jeder Zweig mit main ab bf5a1542 pflückt ihn, bis `probe-deckel-einlass` (Vorprüf-Kopf cf7deb94) gelandet ist — danach genügt main
  einmischen. Wort des Schöpfers dazu: „ist das wirklich ein problem? was ist das wahre ziel dieser regel“.
- **Was ich falsch machte:** (1) Ich jagte 15 Minuten den „Täter“ einer Decke, statt zuerst zu fragen, was sie schützt. (2) Ich schob
  nach 44 Minuten Stille einen eigenen Zwilling des Ratschen-Schnitts (`licht-ratsche-zahl`, zurückgezogen) — die GTX 1050 lieferte in
  derselben Minute. Sie antwortet nicht in Minuten, sie arbeitet 45 Minuten still und liefert dann ganz: vor einem Zwilling ihren
  Zweig per `git ls-remote` UND eine kurze Nachfrage. (3) Zwei Macher-Abgaben kamen mit grünem Bild und roter Batterie zurück
  (haus-gestalt 5 Linsen, fahrzeug-gattung 6): der Brief verlangte `check:statik`, aber nicht die Linsen, die ALLE Häuser oder ALLE
  Fahrzeug-Rezepte durchlaufen. Neuer Brief-Satz: „Vor dem Push laufen lokal die Linsen der berührten Familie beim Namen aus
  .github/workflows/check.yml — für ein Haus: gate:haus-welt (beide Teile), Kreatur-Linse 1 und 3, Fahr-Linse des Lebens; für ein
  Fahrzeug: Asset-Vertrag v1, Regler wirkt 1, Fahr-Linse des Lebens, Settlement-Kanal.“ (4) Ein Arbeiter beendete chrome.exe nach
  Muster und riss die Mess-Sitzung der Runde — Brief-Satz „nur eigene PIDs“ (Gedächtnis `arbeiter-nur-eigene-pids`).
- **Was trug:** die Täter-Zeilen aus den Job-Logs wörtlich in den Heil-Auftrag (`job-log.cjs <job> <ziel>`, dann grep auf ❌); EIN
  Zweig je Stapel statt drei Batterien; überholte Batterien sofort abbrechen (20 Läufer, 22 Jobs je Batterie).
- **Laufend beim Schreiben:** Arbeiter `haus-stoff-heil` (Baum AnazhRealm-front-pl) und `fahrzeug-gattung` (Baum AnazhRealm-acker) heilen
  ihre roten Linsen; OMEN pflückt den Ratschen-SHA auf ort-ausstattung (Vorprüfung 3) und sport-regeln 3; Wächter
  `ci/vorfahrt-waechter.sh 2` und `ci/main-veraltet.sh 2` laufen bis etwa 15:10. Der Stempel-Satz für haus-stoff liegt als
  `satz-haus-stoff.txt` bereit (um die Heilung ergänzen).
- **Offen beim Schöpfer:** die Auslagerungsdatei auf OMEN (systemverwaltet, heute + 11 GB) — gefragt um 13:00, ob OMEN eine
  Klick-Datei für eine feste Größe vorbereiten soll; bis zu seiner Antwort nichts anfassen.

## 10. STAND 15:06 (gilt VOR Abschnitt 9; die lebende Zeile ist der oberste NACHTRAG in LAGE.md)

**main 499f8b572290130d2a8264cf306f500dace25eba** — z717 `w28-probe-deckel-einlass` gelandet 14:38, SIEBTE Landung heute (nur
Werkzeug, kein Laufzeit-Byte: darum KEIN Runden-Sprung; die Runde 22 steht am a8dd22b5). main trägt die Zeichen-Ratsche selbst,
niemand pflückt 28240b1b mehr. **Karte 2 gebucht 83 von 1 718** (Stand-Datei punkte-maschine 0c01bc55).

**Der Lande-Engpass ist EINE Linse, und ich habe sie drei Stunden falsch gelesen.** Mensch-Anatomie R4 („die Lagen des Rumpfs ohne
Folge unter dem Arm … 1 Linse(n) vakuös“) ist kein Wackler: wo ihr Selbsttest LÄUFT, ist sie seit mensch-nah (z712, 85aec8c18,
`__hautUnterStoff` im foundry-core) fest rot; die „grünen“ Läufe druckten „R6 ruht: … --selftest — 15 Dateien“ (der Selbsttest lief
nicht). GTX 1050 hat die Ursache (die Mutante nullt nur die Kopie der Lage) und schiebt EINEN pflückbaren Commit `anatomie-r4-heil`
über main 499f8b57 — Auftrag `auftrag/2411-r4-kein-wackler.md` (053131fd), mit der zweiten Hälfte: gehört foundry-core.js nicht zum
Ruhe-Schlüssel der Linse (scripts/lib/ci-klasse.cjs), kommt es hinein, mit Selbsttest. SOBALD DER SHA KOMMT: an OMEN (ort-ausstattung
Vorprüfung 5, sport-regeln 3) und an den Fahrzeug-Arbeiter weiterreichen. Lehre (Memory roter-job-erst-versuch-zwei): vor dem Wort
„Wackler“ im Log des GRÜNEN Laufs lesen, ob der Schritt lief.

**Abgaben, die warten:**
- `ort-ausstattung` 4 **4612f450** (OMEN): GPU-Probe grün, 20 von 22, rot NUR R4 (Stand-Takt ging im dritten Versuch durch — der ist
  ein echter Wanduhr-Wackler, 1 von 3). Neuläufe sind gestrichen; grün wird sie mit dem gepflückten Heil-Commit. Satz
  `satz-ort-ausstattung.txt`, Ansprüche nach der Landung schrift#1 · bildkunst#1 · grenze#1 · megastadt#1.
- `haus-stoff` **c6cec836** (Radeon-Arbeiter, Baum AnazhRealm-front-pl): 18 von 22, DREI echte Rots — Haus-Asset-Vertrag v6 (Golden
  `holzhuette-s7-L0`, dazu „v6 sin kippt 12 > 11 ← fachwerk-core.js:321 · atan 19 > 18 ← :264“), Haus-Fernkörper („holzhuette/s1:
  Glas L2: Farbe 0.195 von der L0“), Settlement-Kanal N5.7 („O Akt: Plan-Hash Studio ≠ Welt“ — bestellt: das Klima wird EIN Eingang
  des EINEN Kanals, keine Ausnahme der Linse). Satz `satz-haus-stoff.txt` (Heil-Sätze ergänzen); der Stempel braucht den Namen
  `w28-haus-stoff2` (5. Argument stempel-msg.sh, 4. stempel.sh). `haus-dach` liegt lokal obenauf (Bildpaar mit --echt), schiebt
  erst nach grünem haus-stoff.
- `fahrzeug-gattung` 86697613 (Radeon-Arbeiter, Baum AnazhRealm-acker): Bildpaar gesehen und gut (main 0 → 3 Anleger), heilt fünf
  Linsen (R4 ist ihm abgenommen), dann Kopf + Batterie. Satz noch nicht geschrieben (Zahlen im NACHTRAG 13:35 der LAGE).
- `sport-regeln` 3 (OMEN): Kopf am Remote noch 998254be. Danach `scherbe-liegt` (Stand-Takt zählt Schritte statt Wanduhr,
  `auftrag/2411-wackler-vorrang.md`), danach `dienst-frist`.

**Brief-Pflicht neu (dritte Abgabe mit gutem Bild und roter Batterie):** „vor dem Push laufen lokal ALLE Schritte aus
.github/workflows/check.yml grün, deren Name oder Befehl das Wort der Familie trägt (grep -i), beim Namen im Bericht; ein neu
geprägtes Golden nennt seine Fälle im Commit“ — eine von Hand gezählte Linsen-Liste reichte zweimal nicht (Memory
brief-pflicht-statik-2411). Die Wurzel, ein Werkzeug, das aus den berührten Dateien die Schritte der Familie druckt, ist NICHT gebaut.

**Radeon-Fund:** nach dem Sprung 13:34 maß die Radeon-Sitzung die alte Liste am alten Kopf weiter bis 14:28 (zug/runde.txt zeigte
„radeon offen 0/0“ mit Alarm). Nach jedem Sprung die Radeon-Zeile nach 5 min lesen; die Wurzel (die Sitzung liest den Runden-Kopf
nicht an der Stations-Grenze) ist offen.

**Offen beim Schöpfer:** die Auslagerungsdatei am OMEN (systemverwaltet, wuchs heute um etwa 11 GB) — gefragt gegen 13:00, ob OMEN
eine Klick-Datei für eine feste Größe vorbereiten soll; unbeantwortet, niemand fasst sie an.

**Verbrauch 15:07:** 94 % alle Modelle, 91 % Fable. Bei 98 %: TaskStop der Arbeiter und Wächter, notbremse.sh, dann wechselt er das Konto.
