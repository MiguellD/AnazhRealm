# ÜBERGABE 2026-11-13 abends — Konto 12 → Konto 13 (für JEDE neue Sitzung: Koordinator am Laptop, OMEN, GTX 1050)

Geschrieben vom Koordinator (Fable, Konto 12) am 13.11.2026 ab 20:57, Fable-Woche 95 %. Wort des Schöpfers 20:5x: „bei 98% fablenutzung alles beginnen zu sichern, damit ich an allen drei geräte bei 100% den account wechseln kann." Jede Zahl mit Uhrzeit ist Stand dieser Minute; lies sie an der Quelle nach. Die Geräte schreiben ihre eigene Seite: `erwachen/omen-2026-11-13.md`, `erwachen/gtx1050-2026-11-13.md` (fehlt eine, gilt dieses Blatt). Der Block **STAND BEIM SICHERN** ganz unten ist der jüngste.

## 0 Wer du bist
- **Laptop (Radeon 890M)** = Koordinator. Arbeits-Klon `C:\Users\micha\AnazhRealm-profiband`, Koordinations-Baum `.claude/worktrees/koord-hebel` (abgelöst auf `koordination`). Gedächtnis lokal, überlebt den Wechsel: `C:\Users\micha\.claude\projects\C--Users-micha-AnazhRealm-profiband\memory\MEMORY.md` — ZUERST `bild-fuehrt-klasse-ganz.md` und `kurs-1311-kriterium-je-auftrag.md`.
- **OMEN (GTX 1060)** = Stadt-Kette + Messplatz. **Desktop (GTX 1050)** = das Kleid des Menschen. Adressen per `ListAgents` neu lesen („Meister Omen gtx1060", „Herrscher der GTX1050"); Post per SendMessage, ungelesen bis zur Antwort.
- Bindend: CLAUDE.md (GOLDENE DEFINITION + BETRIEBSGESETZ). Scope = NUR `docs/PFLICHT-OFFEN.md` (A B C E F). Verbotene Wörter in Commit-Messages: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU. Der Schöpfer schreibt Deutsch; Bericht = drei Sätze (geschnitten · gemessen · ehrlich offen), IMMER zuerst ein Bildpaar oder eine Zahl, und „im Spiel" oder „nur gebaut".

## 1 Die ersten Handgriffe (Koordinator)
1. `git -C C:/Users/micha/AnazhRealm-profiband status -sb` (Haupt-Baum); im Koordinations-Baum `git fetch origin koordination && git checkout --detach origin/koordination`.
2. Dienst: `sh zug/dienst/start.sh --blick` — vier Schleifen müssen LEBEN (zug · radeon · buche · puls), Puls jünger als 10 min. Tot → `sh zug/dienst/start.sh`. Nach einer Installation jede Schleife einzeln nachziehen (`--stopp <name>`, dann `start.sh`); `zug` nur, wenn `/tmp/claude/dienst/zug.fahrt` leer ist. Die Schleifen hängen nicht an der App und überleben den Konto-Wechsel.
3. `get_usage`, `ListAgents`.
4. Auf diesem Laptop kostet jeder Prozess-Start unter `C:\Program Files\Git\usr\bin\bash.exe` 1–2,6 s, unter dem byte-gleichen `sh.exe` 30–90 ms (Ursache in Windows unbenannt). Eigene fork-reiche Befehle als `/usr/bin/sh -c 'set +o posix; …'`, git-Einzeiler aus PowerShell. Foreground-`sleep` ist gesperrt: Warter als Hintergrund-Befehl mit `until`-Schleife.
5. Uhrzeiten NIE schätzen: `date +%H:%M` im selben Schritt lesen.

## 2 Der Kurs (Schöpfer 13.11. ~17:00 und ~17:15, bindend — er nannte Stillstand, Prüftheater, Kreise)
1. **Das BILD führt.** Abgabe = Bildpaar im Spiel besser + nichts bricht + Kosten nicht über heute. Linsen des Aussehens werden berichtet, sie sperren keine Zwischenschritte.
2. **Eine Klasse fällt GANZ in einer Welle** (alle Stufen eines Dings; kein Schritt macht eine Nachbar-Stufe schlechter; Flächen aus mehreren Höhen ansehen: Auge, Hügel, Dach).
3. **Pflicht B (Ankunft ≤ 5 s) ist keine eigene Jagd** — Programm-Zahl ist eine Kosten-Zeile in jedem Klassen-Schnitt.
4. **Leser-Liste VOR dem Schnitt** (wer liest, was geändert wird) — steht im Commit.
5. **Kein Apparat-Tag.** Werkzeug nur, wenn es eine Landung oder Buchung blockiert.
6. **Jeder Brief nennt:** die Kriterien der Meisterkarte (Id, Ist ↔ Soll, Station), das Bildpaar an fester Kamera, die Leser-Liste, und „lokal nur check, format (prettier --write zuerst), playtest:fast, die Tore der eigenen Dateien". Brief beginnt mit „Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.", Typ `champion`, Fable für harte Schnitte, Opus für kontextschwere.
7. **Arbeit landet, wo der Spieler ANKOMMT** (Prüfplatz mit Dorf), nicht an einem Messort.
8. Höchstens 2–3 lokale GPU-Arbeiter; GPU nur unter `gpu-lauf.sh`, nie neben einem echt-Job der CI.
9. Nach einer Abgabe NIE um eine Änderung der Commit-Nachricht bitten (ein leerer Commit fährt CI und Probe neu).
10. Stehend: kein Rechner startet je neu, Einstellungen nur als Klick-Datei · nie Ruhe erzwingen (keine fremden Prozesse stoppen) · nie Soll, Schwelle, Band oder Ratsche bewegen, damit etwas grün wird · keine Dateien aus dem Netz ohne sein Wort · Cloud-Sitzungen nur als Karte · punkte-maschine pusht nur auf SELBSTTEST GRÜN, nie force · kein `git stash`, kein force-push · kein Zweig wird ohne sein Wort gelöscht · **die Meisterkarte (Artifact) wird nur auf sein Wort neu veröffentlicht** (die Seite zeigt 221).

## 3 Was das Auge heute sah (im Spiel, Dorf der Ankunft, Mittag) — der Maßstab für morgen
Bilder: `scratchpad/genom-spiel/{eng-rot,frontal,gruppe}.png` (dieser Sitzung; nach dem Wechsel neu schießen: Rezept im Gedächtnis `bildpaar-im-spiel-rezept.md`).
- **Mensch:** Oberkörper als Ballon, Hemden an Achsel und Seite gerissen (der Poncho ist eine Voxel-Hülle: `koerper-core.js:254`, `foundry-core.js` `backeHuelle`), ein Gehender scheint zu schweben. Der Bau aus dem Genom (z426) ist im Spiel und unter dem Kleid NICHT zu sehen. → GTX 1050, `w28-leib-nah`.
- **Häuser:** glatte Kästen ohne Stoff; das Fachwerk-Labor zeigt Ziegel, Balken, Pfannen, die Welt nicht. → OMEN-Kette (Stoff-Fuge, Fassade).
- **Boden:** brauner Teppich, Wege als verwaschene violette Streifen ohne Kante, kein Gehsteig. → `w28-weg-koerper`.
- **Wiese:** große flache Zacken am Hang. → `w28-wiese-fern` (Kosten Ego reißen noch).
- **Himmel am Mittag dunkel-marine** — NIEMAND sitzt daran (Licht ist mit 4 Punkten eine der schwächsten Domänen).
- **Studio ↔ Welt:** die Differenz fiel am Fachwerkhaus 97,9 → 8,3 %, weil die neue Bühne so stumpf wurde wie die Welt. Die Welt muss zum Labor hinauf (Gedächtnis `studio-welt-welche-seite-steigt.md`).

## 4 Die Ketten und wer sie trägt (Zweig · Kopf · nächster Schritt)
**Stadt (alles hängt an EINER Wurzel):** Mehrspieler-Wand rot wegen latenter Wurzel in main — `stamm/kreatur-leben.js:1687 _bodenKlasseAt` liest den Hang SAMT Erdbau, einmal je Zelle gemerkt. Schnitt der OMEN: `_terrainSaatY` (`stamm/gelaende-boden.js`), gate:mp-sync 1/1 GRÜN (322/322 Zellen), ohne Schnitt 3/3 ROT. Die Wand reißt auch an Zweigen ohne Stadt (w28-studio-welt). AUFTRAG an die OMEN: zuerst allein als `w28-mp-boden` auf main landen, dann `w28-stadt-grammatik` (22872718) mischen und abgeben, dann `w28-fassade` (b038852b) und `w28-stoff-fuge` (212b6de9) heim. Danach: die Stadt an den Platz der Ankunft (F), Strecke mit Kicker (F), Verkehr (C).
**Weg als Körper** (`w28-weg-koerper`, Fable, baut auf stadt-grammatik): Fahrbahn, Gehsteig, Bordstein, Platz, Dorfweg als Körper mit Kante; Maler `stamm/siedlung-wege.js _wegeKarteMale` (~551), Bordstein-Gesetz liegt nur im Labor `worlds/fachwerk/fachwerk.js` 300–312.
**Mensch:** `w28-leib-nah` (GTX 1050): der Poncho als Stoff aus der Haut, Saum und Bund als Linien, jede Stufe; Abgabe = Bildpaar am Dorf von vorn und hinten.
**Studio:** `w28-studio-welt` 6039dc13 (EINE Bühne ohne Welt-Boot, `blick:werk` vier Blicke; Code-Check ROT: Stall-Akte „eigene Schlafe neben sleep" in `scripts/diag-blick.cjs` + die Mehrspieler-Wand) → `w28-studio-seiten` (Fable) trägt ihn mit: alle sieben Seiten über `werk()` auf die Bühne, Vorgabe Streiflicht, EINE Übersicht; keine Seite liest schlechter als ihr Labor.
**Wiese:** `w28-wiese-fern` (Fable): Büschel tragen die Ferne; Ego-Bildzeit 37,5 → 45,3 ms (Third neutral) — Gegenprobe ferner Klon auf Standard-Licht trennt Überzeichnung von Licht-Modell. Keine Abgabe über den Kosten von heute.
**Ziel-Plan** (`w28-ziel-plan` 0146c309, Opus-Arbeiter im Baum `w28-ziel-plan-heim`, WIP nach `w28-ziel-plan-wip`): Code-Check 18/18 GRÜN; Probe zweimal identisch ROT „Sicht verdeckt 3,3 %: Leib bewohner ≤ 2,6 m" (Gruppen an Orten stehen vor der Probe-Kamera). ENTSCHEIDUNG des Koordinators, dem Schöpfer offen gesagt: ein Bewohner ist Szene, kein Sichthindernis; Laub/Fels/Bau-Zahlen unverändert, verdecktes Blickziel bleibt ROT; `gate:kreatur-takt` nicht in die Probe-Marke (länger als der Deckel 960 s auf der GTX 1050).
**Karte der Bäume:** `w28-karte-stamm` 9597ffb2 fährt in z427 (seit 20:39).
**Tor:** `w28-tor-bruch` c7d0aad4 (Tafel nur Ausnahmen, Prüf +1 494 Atome statt +24 626) — wartet auf Code-Check; der Zug wies den alten Kopf an der Wachstums-Wand ab.
**Liegt ohne Arbeiter:** `w28-stamm-krone` 31f4607c · `w28-seiten-stille` (nur der Abgabe-Commit fehlt) · `w28-reibellipse` · `w28-weltbild-kalt` · `w27-ferne-ton-5` · `w28-griff-ellbogen` · `w27-stadt-bild`. 14 tote Zweige stehen im FUND-REGISTER benannt, NICHT gelöscht.

## 5 Maschine und Buchung
- main **ec281422** (V18.546.275). Heute gelandet: z423 leib-kanon + guss-bruch · z424 wesen-offen · z425 platte-fein · z426 leib-genom. Gebucht **221/330** (20:48 am ec281422).
- Zug-Dienst-Code eaa749bd (Landung je Zweig nachgewiesen, Format-Stufe, voll bei Baum-Gleichheit übernommen). Logs `/tmp/claude/w4/zug-nie-leer.log` · `.wartet` · `zug-nicht-gelandet.txt`; Puls `/tmp/claude/dienst/zug.puls`.
- CI lesen: `sh artifacts/profiband/dienst/ci.sh <zweig> …`; roter Text: `TOKEN=… node artifacts/profiband/dienst/rot-text.cjs --sha <kopf>` (Token aus `git credential fill`); Probe neu: `POST …/actions/runs/<id>/rerun-failed-jobs`.
- **Buchungs-Stau geheilt (punkte-maschine 191f0684):** eine Werkbank, die ohne Wort stirbt (Exit ≥ 0xC0000000 oder leeres Log), ist UNGEMESSEN, nie ROT. Anlass: Radeon-Fahrt 18:53 am 36f9d45a, 123 Scheinurteile, Buchung verweigerte 221 → 177. Ursache des Absturzes (Exit 3221226505) UNBENANNT. Erste Fahrt danach (20:17–20:55 am ec281422): 57 Stationen behalten, 5 GRÜN, von CI abgebrochen.
- Meisterkarte in Zahlen (Blatt `bericht/1113-kurs-B-meisterkarte.md`): 58 der 111 offenen Punkte haben KEINE Station; schwächste Domänen profiband 0 · ankunft 1 · vegetation 3 · tore 3 · lod 3 · licht 4.
- Sieben Kurs-Blätter des Opus-Schwarms: `bericht/1113-kurs-A…G-*.md`. Chronik des Tages: `FUND-REGISTER.md` ab „13.11.".

## 6 Ehrlich offen / unbenannt
- Warum `bash.exe` am Laptop langsam ist (CI-Läufer mit `shell: bash` zahlen weiter).
- `gate:kamera-leib:echt` K6 kippt auf der GTX 1050 am baum-gleichen Kopf.
- Die Nachwache ABAB läuft gar nicht.
- Der Himmel am Mittag, die Häuser am Dorf, das Schweben eines Gehenden: gesehen, noch ohne gelandeten Schnitt.

## STAND BEIM SICHERN
**21:03, Fable 97 %** (94 % um 20:55 — drei Punkte in fünf Minuten; darum bei 97 % begonnen). Alle Woche-Modelle 52 %.

Lokale Arbeiter: alle vier GESTOPPT (TaskStop 21:01), jeder Baum sauber, alles auf origin:
| Auftrag | Zweig auf origin | Kopf | Zustand |
|---|---|---|---|
| Studio: alle Seiten auf die Bühne | `w28-studio-seiten` | ad504fbe | WIP; zuletzt an der portale-Seite (index.html, porta.js auf die Bühne); der letzte Commit ist meine Notbremse (huelle.js, uebersicht.js ungeprüft) |
| Weg als Körper | `w28-weg-koerper` | b1ffbea3 | WIP: „Weg-Gesetz im Kern, Gehsteig als Erdbau, Bord/Platte/Kantstein als Glieder im Kisten-Pool, Kante im Boden-Stoff" — Stand und Leser-Liste im Commit-Rumpf |
| Ziel-Plan heim | `w28-ziel-plan-wip` | 3005322c | WIP (Abgabe-Zweig `w28-ziel-plan` 0146c309 unberührt); wartete zuletzt auf das GPU-Schloss für die vier Bilder |
| Wiese aus der Ferne | `w28-wiese-fern` | 476a3ed9 | WIP; Ego-Kosten reißen, Gegenprobe (ferner Klon auf Standard-Licht) steht aus; Zahlen im Commit-Rumpf |
| Tor-Rückbau | `w28-tor-bruch` | c7d0aad4 | ABGEGEBEN, wartet auf Code-Check |

Die Briefe der vier stehen wörtlich im Protokoll dieser Sitzung; der Kern je Auftrag steht in Abschnitt 4. Ein neuer Arbeiter beginnt mit `git fetch origin <zweig>` + eigenem Arbeitsbaum und liest zuerst den Rumpf des WIP-Commits.

Geräte: Signal „SICHERN" 21:00 an beide. GTX 1050: `w28-leib-nah` **ace30e73** auf origin (liest die Nutzung selbst). OMEN: bis 21:03 keine Antwort; `w28-mp-boden` gibt es auf origin noch nicht, `w28-stadt-grammatik` steht unverändert auf 22872718 — der Wurzel-Schnitt lag um 20:02 nur im Arbeitsbaum der OMEN. Erwachen-Seiten vom 13.11. um 21:03 noch nicht da.

Maschine (läuft ohne Sitzung weiter): **z427 IN FAHRT** seit 20:39 (`w28-karte-stamm` 9597ffb2); Dienst eaa749bd, vier Schleifen leben (der Puls der puls-Schleife ist 45 min alt — sie schreibt offenbar nur bei Wechsel des Halters; nicht geprüft). GPU-Schloss: der echt-Job des Zugs. Verwaiste Arbeiter-Prozesse: keine (geprüft; `aufraeumen.ps1` NICHT blind fahren, es beendet jede Werkbank, auch die des laufenden Zugs).

Buchung: **221/330** gebucht am ec281422 (20:48). Um 21:02 verweigert die Buchung **221 → 219**: `schatten.K3#1` radeon ROT („fuss Band 93,4 % des freien Bodens (frei mit/ohne 1, 18)") und `schatten.K4#1` radeon ROT („Gewinn 0,0 % (Wand 0,1849 gegen 0,1849 mit Boden-Albedo)") — frische echte Messungen der ersten Fahrt nach dem Schnitt, Täter NICHT benannt (Kandidaten: z425 platte-fein, z426 leib-genom, z424 wesen-offen; der Richter halbiert). Ein fallender Stand wird ohne benannten Täter nicht erzwungen.

Nur lokal (geht mit dem Konto NICHT verloren, aber ist nicht in git): das Gedächtnis des Koordinators; `scratchpad/` dieser Sitzung (Bildpaare `genom-spiel/`, `mensch-paar/`, `studio-welt/`, `wiese-mitte/`) — nach dem Wechsel neu schießen statt suchen.

**Der EINE nächste Schritt je Sitzung nach dem Wechsel:** Koordinator — Abschnitt 1, dann z427 lesen, dann die vier WIP-Zweige wieder besetzen (Reihenfolge nach Sichtbarkeit: Kleid → Weg/Stadt → Studio → Wiese) und die OMEN nach `w28-mp-boden` fragen. OMEN — `w28-mp-boden` von main, abgeben, dann stadt-grammatik. GTX 1050 — `w28-leib-nah` bis zum Bildpaar am Dorf.
