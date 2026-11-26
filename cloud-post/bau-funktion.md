# Briefkasten bau-funktion (neueste Nachricht oben)

## 27.11. 00:50 Koordinator — START-BRIEF (dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Der Bau zeigt seine Funktion“ (bau.bedarf#1)
- Sprosse: `karte2.mensch.bau.bedarf#1` — die Front-Sprosse der Leiter `mensch.bau.bedarf` · Zweig `bau-funktion` (Basis: `origin/main` des Moments, Code-Stand 38194f83) · Wartezimmer `cloud-post/bau-funktion.md` · Regel-Blatt `cloud-post/welle-2611-regeln.md` (beide im Zweig koordination, zu lesen NUR über die rohe Adresse, siehe PFLICHT).
- Arbeite nach IPERKA (`.claude/agents/champion.md`); lade `.claude/skills/anazh-lehren/SKILL.md` vor Kern- oder Stamm-Code. Karte 2 steht bei 136 von 1 718.

## DIE SPROSSE (Karte, wörtlich)
„Dorf: 4 Funktionen · Funktion am Außenbild erkennbar · Preis P · Dorf · Richter: 50 Bauten blind nach Funktion ≥ 80 %“ (Klasse Ort; die Leiter hat 6 Sprossen)

## DIE ROTE ZEILE (Blind-Prüfer an der Radeon 890M, Kopf 45bad33f, 27.11.) — wörtlich
„Treffer 5 von 44 = 11,4 % [3,8–24,6] gegen ‚≥ 80 %‘“ — Rate-Niveau bei neun Optionen. Das Blatt: 44 Bilder (480 × 320) an 23 Häusern des Dorfs am Messort `dorf`, Mittag, je Haus bis drei Ansichten 0/30/45/60° neben der Tür-Achse, das ganze Haus im Bild; Frage „Welche Funktion hat das Gebäude in der Bildmitte?“, Optionen Gasthaus · Kirche · Patrizierhaus · Rathaus · Scheune · Schmiede · Werkstatt · Wohnhaus · Zunfthaus.
Verwechslungen (wahr → gelesen): Kirche 2 von 9 (sonst Rathaus, Patrizierhaus, Zunfthaus, Wohnhaus) · Rathaus 0 von 3 (Zunfthaus, Werkstatt) · Scheune 0 von 3 · Schmiede 0 von 7 (4 × Wohnhaus) · Gasthaus 0 von 7 (3 × Scheune) · Wohnhaus 3 von 8 · Patrizierhaus 0 von 3 · Werkstatt 0 von 2 · Zunfthaus 0 von 2.
Das Auge des Koordinators am Bogen: Kirche und Rathaus tragen einen Turm, die Scheune ist ein Holzkasten — Gasthaus, Schmiede, Wohnhaus, Patrizierhaus, Werkstatt und Zunfthaus sind DASSELBE braune Fachwerkhaus mit Schornstein.

## DER TÄTER (gelesen am main 38194f83 — prüfe jede Zeile an der Quelle, die Nummern wandern)
- `fachwerk-core.js:2863–2880`: das Raumprogramm je Rolle steht im Gesetzbuch (schmiede: `esse_werkraum`, `beschlagstand` an der Straße · gasthaus: `gaststube` an der Straße · zunfthaus: `trinkstube` im Obergeschoss · patrizierhaus `stein:stadtpalais`) — der Bedarf ist also bekannt.
- `fachwerk-core.js:4551` und `:4555`: die Rolle zeichnet am Eingang nur Kleinteile (gasthaus → drei Kisten, schmiede → ein Tränktrog).
- `fachwerk-core.js:10210–10222`: `SCHILD_WORT`/`SCHILD_GESETZ` — ein Schild je Gewerbe, im Bild auf Hauslänge nicht lesbar.
- Was fehlt: die GESTALT folgt dem Bedarf nicht. Der Beschlagstand ist keine offene Front mit Esse und Rauch, die Gaststube kein Ausleger mit Bänken und großen Fenstern, das Tenntor der Scheune kein Tor, das Zunfthaus kein Saal-Geschoss mit Zeichen, das Patrizierhaus kein Stein mit Erker.

## IPERKA — das Band
Woran liest ein Mensch die Funktion eines vormodernen Baus aus 20–30 m? Belege mit äußerer Quelle und Zahl (Hausforschung, Bauaufnahmen, Freilichtmuseen): Öffnungsmaß und Lage (Tenntor ≥ 3 m, offene Werkstatt-Front, Laube), Esse und Schlot der Schmiede, Ausleger-Schild und Maß der Gaststuben-Fenster, Turm und Chor der Kirche, Saal-Geschoss und Uhr des Rathauses, Geschosszahl und Stoff des Patrizierhauses. Je Quelle EINE Zeile im Kern (Autor, Jahr, Zahl), nie eine Typen-Liste von Meshes und nie ein kopiertes Asset. Suchen ohne Projekt- und Personennamen.

## DER SCHNITT (an EINER Wurzel: der Bedarf zeichnet die Gestalt)
- EIN Gesetz im Gesetzbuch: aus dem Raumprogramm der Rolle folgen die Öffnungen, Anbauten und Zeichen, die von der Straße zu sehen sind — der Raum an der Straße bestimmt die Front. Die Kisten (:4551) und der Trog (:4555) gehen in dieses Gesetz auf; kein zweites Register neben dem Raumprogramm, kein Flag, kein stiller Rückfall auf das Einheits-Haus.
- Der Stamm liest über die EINE Naht, über die er heute das Haus liest (Studio = Welt = Bake: dasselbe Haus im Fachwerk-Studio und im Dorf). Kosten an Schirm und Änderung.
- Sichtbar zuerst: je Rolle ein Bild vorher ↔ nachher vom selben Standpunkt (Messort `dorf`, Mittag, das ganze Haus) im Blatt; nenne je Rolle das EINE Merkmal, an dem ein Fremder sie erkennt.
- Die Wahrheit des Prüfers ist `plan.slots[].rolle` der Siedlung (Station `meisterkarte-quelle/punkte/stationen/k2-mensch-bau.js:38`, Zweig `punkte-maschine`) — daran änderst du nichts; das Blatt schießt und urteilt der Blind-Prüfer nach deiner Abgabe neu.

## ABGABE
- Beleg vor dem Kopf mit Zahl im Rumpf des Commits: (1) je Rolle die Liste der Merkmale, die das Gesetz jetzt aus dem Raumprogramm zeichnet, und ihr Maß; (2) ein eigener Lese-Test ohne GPU ist NICHT der Richter — nenne ihn nicht als Urteil; (3) die Stationen der gebuchten Sprossen der Leitern `mensch.bau.*` bleiben grün am Rumpf IHRER Station (wörtliche Zeilen); (4) Tris und Draw-Calls je Haus vorher ↔ nachher am Messort `dorf` (headless zählbar).
- Station nicht gefahren: GPU → der Blind-Prüfer fährt das Blatt am Vorprüf-Kopf.
- Probe-Ruf (der Diff berührt `fachwerk-core.js`): `gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen` und als vierte Probe `bild:dorf@0.5`; `probe-tag` entscheidet.
- Ehrlich offen darf bleiben: bedarf#2 und höher (eigene Stationen).

## PFLICHT
- Regel-Blatt GANZ lesen (Abschnitte 13:10 und 10:27 zählen): `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/welle-2611-regeln.md`.
- Briefkasten: lies alle ~30 min und vor jedem Push `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/bau-funktion.md` und `…/cloud-post/alle.md` (oberster Abschnitt `## … Koordinator`) — NIE per `git fetch` des Zweigs koordination (er trägt > 17 GiB Geschichte und reißt in der Wolke). Stationen holst du als einzelne Datei über dieselbe rohe Adresse am Zweig `punkte-maschine`.
- WARTEZIMMER: nach der Abgabe NICHT enden — bis zu 3 h in Warte-Schritten von ≤ 9 min alle 5 min den Briefkasten auf einen neuen Abschnitt `## … Koordinator` prüfen, Post abarbeiten, wieder warten.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`; in der Wolke stirbt der GPU-Prozess → „Station nicht gefahren: GPU“ und daneben der Rumpf der Station headless (Null-Renderer) mit Zahl. In den Betreff nur, was grün liest. Du änderst NIE ein Soll und nie den Richter-Text.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter (die Rolle zeichnet die Gestalt nicht), Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (`npm run check` bleibt verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` GANZ.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 · EIN glatter Commit auf dem `origin/main` des Moments · Betreff GENAU `Vorprüfung bau-funktion <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`); `sh artifacts/profiband/werkzeug/zug.sh probe-tag bau-funktion@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`) über das Log jedes lokal gefahrenen Tors.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/bau-funktion.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.
