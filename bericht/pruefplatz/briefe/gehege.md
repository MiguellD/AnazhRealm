Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 8 (Spawn-Affinität tag-neutral), 11, 25 und das LEBEN-Gesetz. Der Plan steht in
koordination `bericht/pruefplatz/plan.md` (§2 Zoo, §3 Sektor Zoo, §4 S8/S8f). Du arbeitest in der CLOUD, also gibt es keine Welt-Bilder;
die macht der Koordinator.

# GEHEGE — der Zoo mit fester Zahl: Wolf 3, Hirsch 3, Bär 1, Fuchs 2, dieselben Tiere in jedem Boot (Phase 1)

**Pflicht-OFFEN:**
- A: fell. Heute sind 12 von 12 Zellen „nicht im Bild“; am Spawn steht kein Tier.
- E: die Klasse tier (30 Befehle / 60k Dreiecke) und der Haupt-Faden.

**Chokepoint:** der Bestand der Region in tetrapoda und im Wirt:
- `_bestandAdoptieren` (kreatur-leben.js:2296-2322): jeder gesetzte Leib wird Bestand, danach gelten Geburt, Hunger, Alter und Riss je Takt
  von 10 s (:2220-2241). Bei K = 0 stirbt je Takt mit 0,2 ein Tier (tetrapoda-core.js:1988-2020).
- `_bestandLeibOrt`: ein Leib entsteht nur ≥ 130 m weit und außer Blick (kreatur-leben.js:2410-2423). Schaut der Spieler weg, steht im
  Gehege nachher kein Tier mehr.

**Was stirbt:** nichts Bestehendes. Der wilde Bestand bleibt byte-gleich; das Gehege ist ein Term desselben Gesetzes.

## Vorher → Ziel

**Vorher:**
- Am Spawn steht kein Tier (a-spawn-gtx3: fell 0 von 0 Zellen im Bild).
- Der Wolf aus dem Fell-Gesetz erscheint nur an der Station haar.K1#1. Der Koordinator sah ihn dort fleckig (30.10.).

**Ziel-Bild S8** (−14/−90 → −28/−90, Ego und Third):
- Central Park Zoo und die Freisicht nach Hagenbeck: das Wolfs-Rudel am Felsen seines Geheges, 6–20 m entfernt.
- Der Zaun (werke) steht unten im Bild und schneidet kein Fell.
- **Fern (S8f, −5/−55):** dasselbe Rudel in 42 m.
- **Nachts:** unter den 4 Laternen des Zoo-Wegs.

## Bauen

1. **tetrapoda-core `BESTAND_GESETZ.gehege`**, additiv:
   - Der Bestand je Gehege ist fest `{gattung, n}`.
   - Keine Geburt, kein Hunger- und kein Alters-Tod.
   - Kein Riss: Gehege-Tiere stehen nicht im Verzeichnis der Region (354-m-Kachel, kreatur-leben.js:2102), also reißt kein Wolf einen
     Hirsch über den Zaun.
   - Die Art wählt der Plan, nie ein Tag (Lehre 8).
2. **Wirt (stamm/kreatur-leben.js):**
   - Gehege-Tiere entstehen und bleiben AM Ort. Außer Blick ruhen sie als Zahl ohne Leib und kehren an ihren Ort zurück.
   - Ein eigener Teil der Kappe `maxCreatures` 20 (dirigent-kern.js:277): 9 für das Gehege, solange der Spieler ≤ 150 m entfernt ist.
   - Leiber nur für die nächsten (`KREATUR_SATZ.nahLeiber`). Im Gehege höchstens 1 Leib in L0, der Rest im Tier-Satz L1/L2.
3. **Wand (stamm/kreatur-verhalten.js):** Der Zaun aus werke ist die Hülle. Teil-Schritte gegen die Hülle gibt es schon
   (:1206-1241). Kein Tier verlässt sein Gehege.
4. **Labor = Welt:** worlds/tetrapoda zeigt das Gehege-Tier aus demselben Gesetz.

## Budget

- **S8:** Klasse tier ≤ 30 Befehle / 60k Dreiecke. L0 kostet 62 000 / 8 je Leib und L1 7 000 / 5 (tetrapoda-core.js:44-46), daher
  höchstens 1 Leib in L0.
- **CPU:** ≤ 0,8 ms, also 1 Leib (~0,6 ms, kreatur-leben.js:3576) plus der Satz.
- **VRAM:** ≤ 4 MB für 4 Gattungen und ihre Stufen.
- **Der Zaun** gehört zur Klasse bau ≤ 10 Befehle / 15k (werke).

## Dateien (Besitz)

- tetrapoda-core.js
- stamm/kreatur-leben.js
- stamm/kreatur-verhalten.js
- worlds/tetrapoda/*
- **NICHT anfassen:** fachwerk-core.js (werke baut den Zaun); siedlung-ort.js (ort-plan setzt die Gehege-Flächen).

## Wartet auf

- Den Kern-Teil (1) startest du sofort.
- Den Wirt (2, 3) erst nach z108 (e-stufen-takt: kreatur-leben.js, kreatur-verhalten.js), w4-ort-plan (Gehege-Flächen, Zoo-Weg,
  Laternen) und werke (Zaun).

## Beweis (headless, Zahlen)

- Wilder Bestand byte-gleich: gate:kreatur-* und Golden tetrapoda.
- Nach 600 s Spielzeit stehen 9 Tiere in ihrem Gehege, mit 0 Ausbrüchen, 0 Rissen, 0 Geburten und 0 Toden. Es sind dieselben Tiere (Same)
  nach einem Neuladen und nach dem Wegsehen.
- Die Kappe: Wilde Tiere bekommen weiter ihre 11 Plätze.
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator** (Radeon):
- S8 `bild -14 +1.7 -90 -28 +0.8 -90 --uhr <0.5|0.3|0> --ist fell` in Ego und Third.
- S8f `bild -5 +1.7 -55 -28 +0.8 -90`.
- Dazu `werkbank zaehlen` und `takt` an S8.

**Tor:**
- fell ist an S8 und S8f zu jeder Uhr im Bild (≥ 0,1 %).
- Die Sektor-Hülle hält.
- Der CPU-Anteil liegt bei ≤ 0,8 ms.

## Abgabe

- Zweig: w4-gehege. Commit-Betreff: „Abgabe w4-gehege: …“.
- Bericht in drei Sätzen und die GPU-Proben.

## Lehren der letzten Abgaben

- **stufen-heil** (z102): Die Kreatur-Linse setzt das Auge der Stufen mit `_lodAugeGesetzt()`. Der Tier-Satz fiel von 50 Tieren mit
  227 + 43 auf 44 + 8 Befehle, die Leiber von 43 auf 4. Darum: Leiber nur die nächsten.
- **Das ABAB** hielt die Tiere bisher als `frei.tier` („die Tiere wandern“). Am Platz gilt das nicht mehr: feste Tiere zählen voll.
- **mensch-kopf** riss z107. Darum vor der Abgabe `playtest:fast` am Kandidaten.

## REGELN (Baustein des Koordinators)

- Eigener Worktree unter %TEMP%/claude/w3/<name>/ (nie im Haupt-Klon, nie in fremden Worktrees); node_modules per Junction auf den Haupt-Klon.
- Fetch-Falle: `git fetch origin "+refs/heads/X:refs/remotes/origin/X"`.
- GPU nur über `artifacts/profiband/werkzeug/gpu-lauf.sh`, je Aufruf ≤ 2 min; NIE eine Serie, ein ABAB oder eine ganze Sitzung lokal —
  die GTX der OMEN misst groß. Der echt-Job jedes Zuges teilt das Schloss: wer es lange hält, hält den Zug auf. headless braucht kein Schloss.
- Werkbank-Ports: 4690–4699 gehören dem echt-Job des Radeon-Läufers (sein Hook beendet dort jeden fremden Hörer beim Job-Start); nimm den Port, den der Brief nennt.
- Werkbank: die Welt steht zwischen Befehlen (`window.__loop(true)` nur fürs Warten, danach `__loop(false)`); Pfade an node als Windows-Pfad.
- Beende nur Prozesse, deren PID du selbst gestartet hast — nie nach Name, Muster oder „Elternprozess fehlt“.
- Sichtbares beweist ein Bild vorher/nachher (Pfad im Bericht).
- Commit-Autor: `git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit`; Betreff „Abgabe <zweig>: …“.
- Verbotene Wörter in Commit-Nachrichten: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU. Nie `git stash`.
- Auf Zweigen läuft nur der Puls der CI — warte nie auf die volle Batterie.
- Bericht in drei Sätzen: geschnitten (Datei:Zeile), gemessen (Zahl vorher → nachher), ehrlich offen.
- CLOUD: eine Cloud-Sitzung hat keine GPU — swiftshader baut jede Pipeline synchron (42–292 s je Programm, ein Kopf-Bild 16 min). Sie liefert
  Code + headless Beweis (Zähler, Byte-Diff, Faden-ms, Selbsttest der Linse) und schießt KEINE Welt-Bilder zum Beweis; die Bilder macht der
  Koordinator auf der Radeon (warme Welt, ~3 min) und der GTX (OMEN-Station).
