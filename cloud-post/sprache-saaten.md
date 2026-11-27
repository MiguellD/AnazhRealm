## 27.11. 12:21 Koordinator — DRITTE SITZUNG dieser Bahn (die zweite schob in zwei Stunden nichts): dein Auftrag ist der Abschnitt „27.11. 10:32 … NEUER START-BRIEF“ zwei Abschnitte tiefer, mit diesen Berichtigungen

- **Basis:** main `52937c92786457ffbc7e62e6c4e99949df3c135e` (V18.546.451, gelandet 12:02: Nacht-Licht der Gasse) statt eef726c7; Karte 2 unverändert 149 von 1 718.
- **Zweig `sprache-dialekt`:** existiert er inzwischen doch (`git ls-remote origin refs/heads/sprache-dialekt`), baust du auf SEINEM Kopf weiter — nie force, nie ein zweiter Zweig; existiert er nicht, legst du ihn auf main an.
- **Erster Schub ≤ 45 min nach deinem Start:** `WIP sprache-dialekt: Stand-Blatt mit Täter-Zahl [skip ci]` — ohne diesen Schub gilt die Sitzung als still und die Bahn bekommt eine neue Karte.
- **Post:** dieser Briefkasten NUR über `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/sprache-saaten.md` (curl, im Wartezimmer alle ≤ 9 min); nie `git fetch` des Zweigs koordination.
- **Rennen am main:** die Grund-Probe `mahl` (Kreatur-Linse Teil 2, Job voll 9/18) fällt in Versuch 1 an fremden Köpfen („kein Geruch: der … folgt dem Kadaver nicht (frisst 0 s)“). Steht NUR sie rot und dein Diff berührt keine Kreatur: nenne es in deinem Abgabe-Abschnitt, heile nichts daran — der Neulauf ist meine Sache.
- **Vor-Richter:** fährt an der GTX 1050 oder 1060; eine Sprosse, die an `stadt-voll` misst, nur an der 1060 — nenne den Messort der Station in deinem Abgabe-Abschnitt.

---

## 27.11. 10:42 Koordinator — KORREKTUR zum Weg der Post (dein Auftrag ist der Abschnitt „ZWEITE SITZUNG … NEUER START-BRIEF“ direkt darunter)

Lies diesen Briefkasten ab jetzt über die rohe Adresse `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/sprache-saaten.md` (curl, alle ≤ 9 min im Wartezimmer) — NIE per `git fetch` des Zweigs `koordination`: er trägt > 17 GiB Geschichte und reißt in der Wolke. Läuft bei dir gerade ein solcher Fetch, brich ihn ab. Stationen (`meisterkarte-quelle/punkte/stationen/<datei>`) und Akten (`vision/richter/<leiter>.<n>.<kopf8>-<geraet>.json`) holst du als einzelne Datei über `https://raw.githubusercontent.com/MiguellD/AnazhRealm/punkte-maschine/<pfad>`. Der Satz zum Fetch im Abschnitt darunter ist berichtigt.

---

## 27.11. 10:32 Koordinator — ZWEITE SITZUNG dieser Bahn: NEUER START-BRIEF (sprache#4, Zweig sprache-dialekt) — ersetzt den Start-Brief vom 26.11.; NUR dieser Abschnitt ist dein Auftrag

Du bist die ZWEITE Sitzung dieser Bahn (gestartet 27.11. ≈ 10:15). Die erste hat geliefert und schweigt; alles UNTER diesem Abschnitt ist ihre Geschichte — lies sie als Wissen, baue nichts davon noch einmal. Stand heute: main `eef726c7` (V18.546.450), Karte 2 gebucht 149 von 1 718.

**ERLEDIGT:** sprache#1, #2 und #3 sind gebucht (PUNKT).

**DEINE SPROSSE:** `karte2.mensch.kultur.sprache#4` — Soll „KL ≤ 0,2; Isoglossen auf Barrieren ≥ 70 %“. Rote Zeile (Radeon 890M, main eef726c7, 27.11. 09:20): „S4 ROT: Umfang nicht erzeugbar: Sprachen mit Dialekt-Kontinuum: die Silben-Tafel einer Region kennt keinen Dialekt (gemessen 5 < 1000) (gemessen 5, Soll 1000 Sprachen (U_eff) mit Dialekt-Kontinua)“.

**AUFTRAG:** das Gesetz des Dialekt-Kontinuums als FUNKTION von Ort und Saat — die Sprache einer Region wandelt sich stetig über den Raum, Isoglossen fallen auf die Barrieren der Welt (Gebirge, Meer, Fluss). EINE Quelle: dieselbe, aus der Namen und Sätze heute lesen — kein zweiter Silben-Weg neben ihr. Das Gesetz bekommt ein Band aus einer äußeren Quelle mit Zahl, die du selbst liest (Dialektometrie: Sprach-Abstand gegen Geo-Abstand); die Station nennt, was sie liest (U_eff 1000 Sprachen — also die Funktion über Saaten, nicht die geladene Stadt). Lies die Leiter der Station ganz, benenne den Täter mit Datei:Zeile, dann schneide.

**Regeln** wie im Start-Satz und im Regel-Blatt (`cloud-post/welle-2611-regeln.md`): EIN glatter Vorprüf-Kopf auf dem heutigen main, Zweig `sprache-dialekt`, Betreff `Vorprüfung sprache-dialekt <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: höchstens vier Tore, je ≤ 480 s] [ci voll]`; `npm run check:statik` GANZ vor dem Schub; `probe-tag` muss OK sagen; kein Siegel-Wort (fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU), kein fail-soft, kein Zwilling, kein Schalter. Die Station (Richter) änderst du nie im Spiel-Zweig — ein Stations-Kandidat liegt nur als `cloud-post/sprache-dialekt-station/kandidat.diff` + `BEGRUENDUNG.txt` in deinem Zweig. Schiebe NIE auf einen bestehenden Zweig (`sprache-saaten`, `sprache-saaten-2`) und nie mit `--force`.

**Briefkasten bleibt DIESE Datei** (Wartezimmer wie im Start-Satz). Lies sie über die ROHE Adresse `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/sprache-saaten.md` (curl) — NIE per `git fetch` des Zweigs `koordination` (er trägt > 17 GiB Geschichte und reißt in der Wolke; eine frühere Bahn sah so 4 h lang ihre Post nicht). Akten und Stationen ebenso als einzelne Datei über die rohe Adresse am Zweig `punkte-maschine`. Die rote Zeile einer Sprosse steht im Zweig `punkte-maschine` unter `vision/richter/<leiter>.<n>.<kopf8>-<geraet>.json` (jüngste Datei je Gerät, Feld `geraete[].richter.wert`), die Station unter `meisterkarte-quelle/punkte/stationen/` — lies beide GANZ, bevor du schneidest. Gilt die rote Zeile am heutigen main nicht mehr, melde das als ERSTES im Stand-Blatt deines Zweigs (`[skip ci]`) — dann messe ich nach und du bekommst die nächste Sprosse. Bericht: ZWISCHENSTAND in drei Sätzen (Geschnitten · Gemessen mit Zahl vorher ↔ nachher · offen mit Adresse und Messnamen).

---

## 26.11. 23:08 Koordinator — KORREKTUR zur Zahl und zum Wert deiner nächsten Sprosse: sprache#2 zählt DOPPELT

- Mein Satz von 22:43 „sprache#3 hebt die Karte auf 135“ war falsch. Die Leiter zählt lückenlos (Buchungs-Leser: „Sprosse 2 ohne Sprosse 1 zählt nicht“): sprache#3 steht als Punkt, zählt aber erst, wenn sprache#2 bucht. Die Karte steht bei 134 von 1 718.
- Für dich heißt das: **`karte2.mensch.kultur.sprache#2` bringt zwei Sprossen auf einmal** (sie selbst und den gebankten Punkt #3). Sie ist eine von fünf solchen Lücken-Sprossen der ganzen Karte — der Auftrag von 22:43 (Spiel-Schnitt + Stations-Kandidat `cloud-post/sprache-saaten-2-station/`, Beweis mit dem Rumpf der Station) bleibt wörtlich und hat Vorrang vor allem anderen an dieser Leiter.
- Prüfe vor deinem Vorprüf-Kopf mit dem Rumpf DEINES Stations-Kandidaten, nicht mit einem eigenen Skript: heute fielen zwei Köpfe am Vor-Richter, weil die Bahn headless an anderer Stelle maß als die Station an der GPU.

## 26.11. 22:43 Koordinator — dein Kopf 5f577584 geht zum Vor-Richter; sprache#1 ist am main schon gebucht — deine nächste Sprosse ist sprache#2

- **Dein Kopf 5f577584:** Batterie 21 grün, 0 rot · GPU-Probe GRÜN (Radeon, 1 274 s) · Probe-Ruf vollständig. Der Vor-Richter fährt `karte2.mensch.kultur.sprache#1` und `#3` an deinem Kopf an der GTX 1060 (beide müssen GRÜN bleiben); steht sein Satz GRÜN, stemple ich. Schiebe bis dahin keinen neuen Kopf auf diesen Zweig.
- **Was du wissen musst:** `sprache#1` bucht seit 22:19 am main 45bad33f. Die GTX 1060 urteilt dort wörtlich „S1 GRÜN · Namen richtig zugeordnet 0.99686 (Soll ≥ 0.9) · Saaten der Namen 4 (Soll ≥ 2) · Umfang 1273 … Saaten mediterran/alpin/mitteleuropa/nordisch“. Dein Rumpf sah headless am main „Saaten 1“ — an der GPU trägt stadt-voll seit der Landung z791 (kultur-aus-klima-6) vier Saaten. Dein Schnitt (der Ort kennt seine Nachbarn, Linse C3n) bleibt wahre Tiefe, bucht aber keine neue Sprosse. `sprache#3` bucht ebenfalls (Robinson-Foulds 0,155, 6 Familien, Umfang 192).
- **DEINE NÄCHSTE SPROSSE: `karte2.mensch.kultur.sprache#2`** — die Karte wörtlich: Umfang „U_eff ≥ 10“, Tiefe „Laute, Silben, Wortschatz“, Preis „P · Dorf“, Richter „Sprachen an 20 Sätzen getrennt ≥ 85 %“. Für sie gibt es heute KEINE Station (der Buchungs-Leser nennt die Sprosse nicht einmal). Der Auftrag hat zwei Hälften, beide in EINEM Vorprüf-Kopf:
  1. **Das Spiel:** ≥ 10 Sprachen (U_eff) erzeugen SÄTZE aus ihrem eigenen Laut-Inventar, Silbenbau und Wortschatz — gelesen aus dem EINEN Sprach-Gesetz, das schon Namen und Wortlisten (sprache#1, #3) speist; kein zweiter Erzeuger. Lies zuerst, wo der Satz eines Bewohners heute entsteht und was davon Same ist.
  2. **Die Station (Kandidat `cloud-post/sprache-saaten-2-station/`, Diff gegen den Kopf von `punkte-maschine` + BEGRUENDUNG.txt):** je Sprache 20 Sätze durch den Leser des SPIELS, getrennt durch ein Verfahren, das nur die Sätze sieht (kein Etikett, kein Zwilling des Erzeugers) — Soll ≥ 85 % richtig getrennt, Umfang U_eff ≥ 10 als eigenes Glied. Die vier Wände: (a) `punkte.cjs liste` Basis = Kandidat bis auf deine Sprosse, (b) Leiter ≤ 60 s am Gerät, (c) Konsum durch den Leser des Spiels, (d) vorher ↔ nachher wörtlich.
  - IPERKA: das Band für die Trennbarkeit mit Zahl aus einer äußeren Quelle (Ausgangspunkt zum Prüfen, nicht zum Übernehmen: Zeichen-n-Gramm-Verfahren der Sprach-Erkennung, Cavnar & Trenkle 1994) — die Zahl liest du selbst an der Quelle.
- **Zweig:** nach der Landung deines Kopfs ein neuer Zweig `sprache-saaten-2` auf dem main des Moments. Vorprüf-Kopf wie bisher: EIN Commit auf main, Betreff endet `[gpu-probe: ≤ 4 Tore] [ci voll]`, davor `npm run check:statik` ganz und `probeUrteil` über jedes Probe-Tor.
- Karte 2 steht bei 134 von 1 718 (heute +8; `sprache#3` hebt sie beim nächsten Buchungs-Lauf auf 135).

## 26.11. 19:48 Koordinator — START-BRIEF (Welle 27.11.; dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

## 26.11. 22:16 — GPU-PROBE 5f577584 auf radeon-890m: GRÜN in 1274 s (gate:pruefbuehne-licht GRÜN 61 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 126 s auf radeon-890m · gate:studio-begehen GRÜN 153 s auf radeon-890m · bild:stadt-voll@0.5 GRÜN 153 s auf radeon-890m · gate:webgl-probe GRÜN 46 s auf radeon-890m) → probe-post/sprache-saaten/5f577584.md

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Namen aus zwei Sprachen in der Stadt“ (sprache#1)
- Sprosse: `karte2.mensch.kultur.sprache#1` · Zweig `sprache-saaten` (Basis: heutiges `origin/main`, Code-Stand 4a188bf2) · Wartezimmer `cloud-post/sprache-saaten.md` in koordination · Regel-Blatt `cloud-post/welle-2611-regeln.md`.
- Arbeite nach IPERKA (`.claude/agents/champion.md`); lade `.claude/skills/anazh-lehren/SKILL.md` vor Kern- oder Stamm-Code.

## DIE ROTE ZEILE (Station, Kopf 99649186, GTX 1060, Runde 39, 26.11.) — wörtlich
„ROT: S1 ROT an Saaten der Namen 1 verfehlt ≥ 2 — Täter: die Namen der Bewohner (stamm/siedlung-bewohner.js) und der Orte (fachwerk-core ORTSNAME) · Namen richtig zugeordnet 1 (Soll ≥ 0.9) · Saaten der Namen 1 (Soll ≥ 2) · Umfang 601 (Soll ≥ 100 Namen (Orts- und Personennamen) aus 2 Saaten) · Saaten mediterran · [linse-gpu] nvidia/pascal“

Soll der Station wörtlich (Zweig `punkte-maschine`, meisterkarte-quelle/punkte/stationen/k2-mensch-kultur.js:520): Umfang ≥ 100 „Namen (Orts- und Personennamen) aus 2 Saaten“ · „Namen richtig zugeordnet“ ≥ 0,9 · „Saaten der Namen“ ≥ 2.

## DER TÄTER (gelesen am main 4a188bf2)
- Die Station zählt am Messort `stadt-voll` jede Siedlung in `r._bewohnerSiedlungen`; „Saat“ eines Namens ist `Q.plan.region` seines Orts (k2-mensch-kultur.js:26, :56, :472). Umfang (601) und Zuordnung (1,0) stehen schon — es fehlt allein die ZWEITE Region unter den geladenen Orten.
- `stamm/siedlung-bewohner.js:284` `_bewohnerMelden`: eine Siedlung meldet sich nur, wo ihr Erlebnis steht (`_spawnSettlementErlebnis`). Am Messort ist das genau EINE — die Wort-Stadt, Region mediterran; das Heimat-Dorf steht dort nicht in `_bewohnerSiedlungen` (Befund kultur-aus-klima Kopf 6, 6c5c1749).
- Die Fähigkeit dahinter ist die Hebel-Zeile 3 „Region jenseits der geladenen Siedlung“ (`bericht/2611-hebel/hebel-2611.md` in koordination): die Welt kennt nur, was geladen ist. Die Region eines Orts kommt aus dem Klima (fachwerk-core.js:5622 Regionen-Tafel mit Gewicht und Temperatur).

## IPERKA — das Band
Belege mit einer äußeren Quelle, wie weit benachbarte Siedlungen verschiedener Sprache/Kultur real auseinander liegen (Abstand zur nächsten Sprachgrenze in km, oder Zahl der Sprachen je Fläche) — daraus folgt, ob am Messort eine zweite Region in Reichweite liegen MUSS. Die Zahl ist das Band, nicht ein Schalter „zweite Region erzwingen“.

## DER SCHNITT (an EINER Wurzel)
- Die Welt meldet ihre Nachbar-Siedlungen als Funktion von Saat und Ort (Plan, Region, Namen), nicht erst, wenn ihr Erlebnis geladen ist — der EINE Melder `_bewohnerMelden` bzw. die Stelle, die die Pläne der Region würfelt. Kosten an Schirm und Änderung: ein gemeldeter, ungeladener Ort trägt Plan und Namen, keine Leiber.
- Steht am Messort nach dem Gesetz trotzdem nur eine Region, ist das ein Befund mit Zahl (Abstand zur nächsten Region gegen das Band) — dann kein Zwang, sondern Bericht; ein Messort-Wechsel ist Stations-Sache (Kandidat, siehe Pflicht).
- Grundlage: kultur-aus-klima Kopf 6 (`origin/kultur-aus-klima` 6c5c1749, Wortlisten je Sprachfamilie, `sprachWort`) ist NICHT gelandet. Lies seinen Briefkasten `cloud-post/kultur-aus-klima.md`; liegt er beim Start noch nicht in `origin/main`, baust du NICHT an `fachwerk-core.js` NAMEN/`sprachWort` (sein Gebiet), nur am Melden der Orte.

## ABGABE
- Beleg vor dem Kopf: der Rumpf der Station headless am eigenen Kopf (Zensus wie k2-mensch-kultur.js `zensus` + `zuordnung`), Zeile „Saaten der Namen 1 → n · zugeordnet x“ im Rumpf; Station nicht gefahren: GPU → Vor-Richter.
- Probe-Ruf (der Diff berührt `stamm/siedlung-*`): `gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen` (Pflicht-Wände von `stamm/siedlung-*`, 43 · 135 · 185 s) und als vierte Probe `bild:stadt-voll@0.5` (der Messort der Station); `gate:webgl-probe` hängt der Einlass selbst an; `probe-tag` entscheidet.
- Ehrlich offen darf bleiben: sprache#2–#7 (eigene Stationen), der Klang der Sprache.

## PFLICHT (Regel-Blatt `cloud-post/welle-2611-regeln.md` in koordination GANZ lesen — die Abschnitte 13:10 und 10:27 zählen; Karte 2 steht heute bei 130, nicht 119)
- Briefkasten: lies alle ~30 min und vor jedem Push `git fetch -q origin koordination && git show origin/koordination:cloud-post/sprache-saaten.md` und `…/alle.md` (oberster Abschnitt `## … Koordinator`). Vor dem ersten Schnitt einmal.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`. Alle Stationen der Karte sind GPU-Stationen; in der Wolke stürzt der GPU-Prozess ab (kultur-aus-klima, 26.11.) → schreibe „Station nicht gefahren: GPU“ und daneben den Rumpf der Station headless (Null-Renderer) mit Zahl. Der Vor-Richter (GTX 1050) fährt sie am Vorprüf-Kopf, sein Urteil kommt in deinen Briefkasten (≤ 15 min). ROT dort = weiter schneiden, neuer Kopf. In den Betreff nur, was grün liest.
- Stations-Änderung NIE im Spiel-Zweig: Kandidat unter `cloud-post/sprache-saaten-station/` (Diff gegen `origin/punkte-maschine` + BEGRUENDUNG.txt), drei Wände: `node punkte.cjs liste` (Basis genau zwei ROT `gelaende.K2#1/#2` „Wand HAKEN“) · Leiter ≤ 60 s · Fächer im Kern behält eine Stichprobe durch den Leser des SPIELS. Du änderst NIE ein Soll und nie den Richter-Text; hältst du ein Soll für falsch, steht es mit Quelle im Blatt — ich entscheide.
- IPERKA: eine äußere Quelle mit Zahl wird das Band des Gesetzes, zitiert im Kern in EINER Zeile (Autor, Jahr, Zahl) und im Commit-Rumpf; nie ein kopiertes Asset; Suchen ohne Projekt- und Personennamen.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall; Kosten an Schirm und Änderung, nie an Weltgröße. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Kein Feld am Spiel, das eine Siedlung überlebt. Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter, Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“/„ist ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (≈ 6 min; `npm run check` bleibt lokal verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` (`grep -i` nach dem Familien-Wort) GANZ, ohne `--nur-…` · ein Pfad aus einem anderen Zweig in `cloud-post/…` trägt im SELBEN Satz „Zweig `punkte-maschine`“.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 (bei Konflikt `git merge origin/main`, beide Seiten ganz) · dann EIN glatter Commit auf dem heutigen `origin/main` (`git reset --soft origin/main && git commit`) · Betreff GENAU `Vorprüfung sprache-saaten <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: Pflicht, sobald der Diff `stamm/`, `worlds/`, `index.html` oder eine `*.js` der Wurzel berührt; höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`; zu lang z. B. gate:kreatur-takt 2567 s, gate:fahr-leben 982 s, gate:settlement 570 s — die richtet `[ci voll]`), mindestens ein Tor neben gate:webgl-probe; `sh artifacts/profiband/werkzeug/zug.sh probe-tag sprache-saaten@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`, wie `.github/workflows/gpu-probe.yml` ihn ruft) über das Log jedes lokal gefahrenen Tors → GRÜN mit 0 roten Zeilen. Das Urteil steht in `probe-post/sprache-saaten/<sha8>.md` (koordination); SIEH das Bild selbst an.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/sprache-saaten.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.

## WARTEZIMMER (nach dem Vorprüf-Kopf NICHT enden)
Bis zu 4 h: je Schritt ≤ 9 min (`sleep 270`, zweimal), dann `git fetch -q origin koordination main` und prüfe (a) den Briefkasten auf einen neuen Abschnitt `## … Koordinator`, (b) `probe-post/sprache-saaten/`, (c) ob der Stempel `w28-sprache-saaten` in `origin/main` liegt. Post abarbeiten (neuer glatter Kopf n+1), dann weiter warten; zwischen den Schritten die nächste rote Sprosse derselben Leiter beginnen. Ende nur bei „GELANDET“ oder „ENDE“ im Briefkasten oder nach 4 h ohne Post — vorher der letzte Stand im Blatt: Geschnitten · Gemessen (vorher → nachher) · Offen (Grund, Messname, Adresse) · Kopf (40 Zeichen) · beanspruchte Sprossen (voller Name) · Karte 2 gebucht <n> von 1 718 · Status ZWISCHENSTAND.
