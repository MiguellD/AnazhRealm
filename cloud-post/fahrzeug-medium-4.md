## 26.11. 19:48 Koordinator — START-BRIEF (Welle 27.11.; dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Heimholer Fahrt: Bremsweg je Saat auf main“ (medium#2)
- Sprosse: `karte2.mensch.fahrzeug.medium#2` · Zweig `fahrzeug-medium-4` (Basis: heutiges `origin/main`, Code-Stand 4a188bf2) · Wartezimmer `cloud-post/fahrzeug-medium-4.md` in koordination · Regel-Blatt `cloud-post/welle-2611-regeln.md`.
- Arbeite nach IPERKA (`.claude/agents/champion.md`); lade `.claude/skills/anazh-lehren/SKILL.md` vor Kern-Code.

## DIE ROTE ZEILE (Station, Kopf 99649186, GTX 1060, Runde 39, 26.11.) — wörtlich
„S2 ROT: Umfang nicht erzeugbar: Bremsweg 100→0 0–45.39 m (im Band 75 %), 50→0 im Band 63 %, ≥ 130 km/h 120/160 · die Saat ändert die Physik nicht (1 Fahrt je Rezept über 20 Saaten: vehicle-core.js:3474 exportDrive liest keine Saat) · keine Spurrinne (kein Spur-Gesetz) · Fächer 160/160 Adressen (20 Saaten × 8 Orte) in 3125 ms · Les (gemessen 1, Soll 20 Saaten bis 130 km/h mit eigener Physik) · [linse-gpu] nvidia/pascal“

Soll (Zweig `punkte-maschine`, stationen/k2-mensch-fahrzeug.js:508 ff., Leiter mensch.fahrzeug.medium S2): „20 Saaten bis 130 km/h mit eigener Physik“, Bremsweg 100 → 0 im Band 30–50 m (Hebel-Tafel 17–25), Spurrinne nach 10 Durchfahrten sichtbar. Lies die Leiter ganz, bevor du schneidest.

## DER TÄTER (gelesen am main 4a188bf2)
- Die Zeile wanderte: `vehicle-core.js:4077` `function exportDrive(Pin, rezeptId)` (vorher :3474) — Rezept und Parameter, keine Saat, kein Grund des Orts. Am selben Rezept fährt jede der 20 Saaten dieselbe Physik; die 25 % Bremswege außerhalb des Bands sind die Klasse „Wagen hebt ohne Kuppe ab“ (`fahrStand`, 2 cm `luftEps`).
- Geschnitten, NICHT gelandet: die Sitzung fahrzeug-medium-2/-3, WIP auf `origin/claude/practical-edison-4tvc2m` (Basis fahrzeug-stapel 445b4549, liegt in main). Für medium#2: 95258865 (fahrStand federt, Flattern 60 → 0 an Genesis; `_fahrRad` tritt 4,5 Tritte — Rinne nach 10 Durchfahrten 0 → 100 % an Genesis · Dorf · Wiese; Kurvengrenze a_quer ÷ μ·g 0,99–0,999) + Stations-Kandidat `cloud-post/fahrzeug-medium-2-station/` (Diff gegen punkte-maschine 0ba33033, baut auf dem ebenfalls ungelandeten `cloud-post/fahrzeug-medium-station/`). Die Commits d3c1a802/8a5da9ba/bed717dc sind medium#3 (Boot) — NICHT dein Kopf.
- Offen dort (Blatt `cloud-post/fahrzeug-medium-2.md` im WIP): `imWelt` Dorf 49 % · stadt-voll 85 %; gate:fahr-leben VK 10 Uhr Warte-Kreis 8>9 (auch am Stapel ohne Schnitt).

## AUFTRAG: heimholen und die Saat-Klausel schließen
1. `git fetch origin claude/practical-edison-4tvc2m`; Kopf = EIN glatter Commit von 95258865 gegen seine Basis auf dem heutigen `origin/main` (merge-tree zuerst; jaeger-stand und buendel-mittag kamen seither dazu).
2. Lies, ob der Kandidat die Klausel „die Saat ändert die Physik nicht“ trägt (Prüfstand der Saat: μ des Grunds je Saat). Trägt er sie nicht: der EINE Weg, auf dem die Saat die Physik erreicht, ist der Grund des Orts (Reibwert, Nässe) durch den Leser des Spiels (`_fahrHaft`), nicht ein Saat-Parameter in `exportDrive` — kein zweiter Physik-Pfad.
3. Beide Stations-Kandidaten als EIN Kandidat `cloud-post/fahrzeug-medium-4-station/` gegen das heutige `origin/punkte-maschine`.

## IPERKA — das Band
Bremsweg 100 → 0 auf trockenem Asphalt (Pkw, ABS) mit Quelle und Streuung; μ für Gras/Erde/nass. Das Blatt nennt Weaver & Dale 1978 für die Rinne — übernimm, belege den Bremsweg neu, wenn das Blatt keine Zahl trägt.

## ABGABE
- Beleg: die Leiter S2 des Kandidaten headless am eigenen Kopf (`flattert` 0, Bremsweg im Band je Ort, `sicht` 100 %) mit Zahl vorher → nachher im Rumpf; Station nicht gefahren: GPU → Vor-Richter.
- Familie fahrzeug|vehicle|fahr ganz: `gate:vehicle-drive` (104 s) lokal, `gate:fahr-leben` (982 s) nur lokal und in `[ci voll]`.
- Probe-Ruf: `gate:vehicle-drive` · `gate:pruefbuehne-licht` · `gate:weltbild-frost:echt` · `gate:studio-begehen` (berührt der Diff `stamm/koerper-fahrt.js` → Stamm-Wände) — `probe-tag` entscheidet; höchstens vier.
- Ehrlich offen: `imWelt` an Dorf/stadt-voll mit Grund; VK 10 Uhr Warte-Kreis (geerbt, Messname gate:fahr-leben VK).

## PFLICHT (Regel-Blatt `cloud-post/welle-2611-regeln.md` in koordination GANZ lesen — die Abschnitte 13:10 und 10:27 zählen; Karte 2 steht heute bei 130, nicht 119)
- Briefkasten: lies alle ~30 min und vor jedem Push `git fetch -q origin koordination && git show origin/koordination:cloud-post/fahrzeug-medium-4.md` und `…/alle.md` (oberster Abschnitt `## … Koordinator`). Vor dem ersten Schnitt einmal.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`. Alle Stationen der Karte sind GPU-Stationen; in der Wolke stürzt der GPU-Prozess ab (kultur-aus-klima, 26.11.) → schreibe „Station nicht gefahren: GPU“ und daneben den Rumpf der Station headless (Null-Renderer) mit Zahl. Der Vor-Richter (GTX 1050) fährt sie am Vorprüf-Kopf, sein Urteil kommt in deinen Briefkasten (≤ 15 min). ROT dort = weiter schneiden, neuer Kopf. In den Betreff nur, was grün liest.
- Stations-Änderung NIE im Spiel-Zweig: Kandidat unter `cloud-post/fahrzeug-medium-4-station/` (Diff gegen `origin/punkte-maschine` + BEGRUENDUNG.txt), drei Wände: `node punkte.cjs liste` (Basis genau zwei ROT `gelaende.K2#1/#2` „Wand HAKEN“) · Leiter ≤ 60 s · Fächer im Kern behält eine Stichprobe durch den Leser des SPIELS. Du änderst NIE ein Soll und nie den Richter-Text; hältst du ein Soll für falsch, steht es mit Quelle im Blatt — ich entscheide.
- IPERKA: eine äußere Quelle mit Zahl wird das Band des Gesetzes, zitiert im Kern in EINER Zeile (Autor, Jahr, Zahl) und im Commit-Rumpf; nie ein kopiertes Asset; Suchen ohne Projekt- und Personennamen.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall; Kosten an Schirm und Änderung, nie an Weltgröße. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Kein Feld am Spiel, das eine Siedlung überlebt. Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter, Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“/„ist ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (≈ 6 min; `npm run check` bleibt lokal verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` (`grep -i` nach dem Familien-Wort) GANZ, ohne `--nur-…` · ein Pfad aus einem anderen Zweig in `cloud-post/…` trägt im SELBEN Satz „Zweig `punkte-maschine`“.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 (bei Konflikt `git merge origin/main`, beide Seiten ganz) · dann EIN glatter Commit auf dem heutigen `origin/main` (`git reset --soft origin/main && git commit`) · Betreff GENAU `Vorprüfung fahrzeug-medium-4 <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: Pflicht, sobald der Diff `stamm/`, `worlds/`, `index.html` oder eine `*.js` der Wurzel berührt; höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`; zu lang z. B. gate:kreatur-takt 2567 s, gate:fahr-leben 982 s, gate:settlement 570 s — die richtet `[ci voll]`), mindestens ein Tor neben gate:webgl-probe; `sh artifacts/profiband/werkzeug/zug.sh probe-tag fahrzeug-medium-4@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`, wie `.github/workflows/gpu-probe.yml` ihn ruft) über das Log jedes lokal gefahrenen Tors → GRÜN mit 0 roten Zeilen. Das Urteil steht in `probe-post/fahrzeug-medium-4/<sha8>.md` (koordination); SIEH das Bild selbst an.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/fahrzeug-medium-4.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.

## WARTEZIMMER (nach dem Vorprüf-Kopf NICHT enden)
Bis zu 4 h: je Schritt ≤ 9 min (`sleep 270`, zweimal), dann `git fetch -q origin koordination main` und prüfe (a) den Briefkasten auf einen neuen Abschnitt `## … Koordinator`, (b) `probe-post/fahrzeug-medium-4/`, (c) ob der Stempel `w28-fahrzeug-medium-4` in `origin/main` liegt. Post abarbeiten (neuer glatter Kopf n+1), dann weiter warten; zwischen den Schritten die nächste rote Sprosse derselben Leiter beginnen. Ende nur bei „GELANDET“ oder „ENDE“ im Briefkasten oder nach 4 h ohne Post — vorher der letzte Stand im Blatt: Geschnitten · Gemessen (vorher → nachher) · Offen (Grund, Messname, Adresse) · Kopf (40 Zeichen) · beanspruchte Sprossen (voller Name) · Karte 2 gebucht <n> von 1 718 · Status ZWISCHENSTAND.
