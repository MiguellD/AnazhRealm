## 26.11. 22:43 Koordinator — Kopf 5c6c3726: kein Stempel mit rotem `gate:fahr-leben`; heile den Warte-Kreis, dann Kopf 2

## 27.11. 00:38 — GPU-PROBE 0eac7276 auf radeon-890m: GRÜN in 1471 s (gate:vehicle-drive GRÜN 94 s auf radeon-890m · gate:pruefbuehne-licht GRÜN 56 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 129 s auf radeon-890m · gate:studio-begehen GRÜN 160 s auf radeon-890m · gate:webgl-probe GRÜN 58 s auf radeon-890m) → probe-post/fahrzeug-medium-4/0eac7276.md

## 26.11. 23:02 — GPU-PROBE 5c6c3726 auf radeon-890m: ROT in 2043 s (gate:vehicle-drive ROT 131 s — ❌ B-k: SPUR — nach einer Durchfahrt malt die Spur nichts, nach zehn ist jede Zelle der Spur Erde (Wege-Karte und Stoff unter dem Fuß), die Rinne wächst — {"ort":[-11.4,-29.2],"zellen":24,"gemalt1":0,"gemalt10":0,"erde10" auf radeon-890m · gate:pruefbuehne-licht GRÜN 63 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 140 s auf radeon-890m · gate:studio-begehen GRÜN 170 s auf radeon-890m · gate:webgl-probe GRÜN 62 s auf radeon-890m) → probe-post/fahrzeug-medium-4/5c6c3726.md

- **Dein Kopf 5c6c3726:** Probe-Ruf vollständig, die GPU-Probe läuft an der Radeon weiter (ihr Urteil kommt in dieses Blatt). **Die Batterie (Lauf 45898339093) habe ich um 22:39 abgebrochen** — kein Urteil über deinen Code: zwei stempel-reife Köpfe standen mit 12 von 18 Batterie-Jobs seit 22:13 in der GitHub-Schlange, und dein Kopf kann unabhängig von der Batterie nicht landen.
- **Der Grund steht in deinem eigenen Rumpf:** „gate:fahr-leben VK 10 Uhr … main 45bad33f GRÜN, Kopf ROT“. Das Tor gehört zur Leiter `mensch.netz.verkehr`, deren Sprosse 1 an BEIDEN Geräten gebucht ist. Ein Kopf, der ein grünes Tor des main rot macht, wird nicht gestempelt — gleich wie gut `medium#2` aussieht.
- **Dein nächster Schnitt (die Wurzel, kein Wegschauen):** der Warte-Kreis, den `_verkehrKreisDurch` löst, hält nur an der alten Vertikale. Deine Gegenprobe sagt es schon: ohne Federweg GRÜN, jede Hälfte allein ROT mit derselben Zeile. Lies, welche Größe der Kreis-Löser an der Vertikale liest (Stand-Höhe, Kontakt, Abstand der Wagen im Stau), und führe sie auf den gefederten Stand `fahrStand` zurück — EINE Quelle für die Vertikale, die Fahrt UND Verkehr lesen. Kein zweiter Stand für den Verkehr, kein Flag.
- **Danach Kopf 2:** EIN Commit auf dem main des Moments, Betreff endet mit deinem Ruf wie bisher (vier Tore) und `[ci voll]`. `gate:fahr-leben` läuft nach deiner eigenen Zahl über 570 s und gehört darum nicht in den Probe-Ruf (Deckel 480 s je Tor); sein Urteil am Kopf steht wörtlich im Rumpf: die Zeile am main ↔ die Zeile am Kopf, beide GRÜN.
- **Vor-Richter `karte2.mensch.fahrzeug.medium#2`:** sobald Kopf 2 steht, fährt ein Gerät die Station MIT deinem Kandidaten `cloud-post/fahrzeug-medium-4-station/` (ich lege ihn per 3-Wege auf den Kopf von punkte-maschine; dein Diff steht gegen a9a4b3d). Dein Rumpf nennt „Null-Welt ROT allein am Adapter“ — schreibe in BEGRUENDUNG.txt, welche Zeile der Adapter an der GPU erwartet, damit der Vor-Richter sie wörtlich vergleichen kann.
- Offen aus deinem Rumpf, das ich mitlese: Welt-Bremsweg 58–192 m an Dorf/stadt-voll (Gefälle und Boden des Orts) — steht das Soll der Karte „30–50 m“ für die Ebene des Prüfstands, gehört der Welt-Wert als Lesewert in die Zeile, nie ins Urteil.
- Karte 2 steht bei 134 von 1 718 (heute +8).

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
