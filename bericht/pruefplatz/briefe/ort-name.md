Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 3, 6 und 12 (Stamm-Chirurgie). Der Plan steht in koordination `bericht/pruefplatz/plan.md`
(§2, §7 Nr. 1–2, §8 Welle b). Du arbeitest in der CLOUD, also gibt es keine Welt-Bilder; die macht der Koordinator.

# ORT-NAME (0a) — der Ort-Takt heißt `_genesisOrt`: die A-Seite des Platz-ABAB, byte-gleiches Verhalten

**Pflicht-OFFEN:** E. Das Instrument fährt beide Seiten eines ABAB nur, wenn beide denselben Ort-Takt-Namen tragen; A = dieser Zweig
(der Ring von heute), B = ort-wirt (der Plan).

**Chokepoint:** der Ort-Takt des Messorts genesis (haushalt.json:90-92 `ortTakt: ["_genesisPortalRing", "_portalApproachPrefetch"]`),
den die Werkbank als `window.__ortTakt` je Takt ruft (werkbank.cjs, `umstellen`), und `_tickGenesisOrt` (siedlung-ort.js:2784-2791).

**Was stirbt:** die zwei Takt-Glieder als getrennte Einträge. `_genesisPortalRing` selbst stirbt erst mit dem Abschied in ort-wirt;
bis dahin ruft ihn NUR `_genesisOrt` (und die Linsen, die ort-wirt umhängt).

## Bauen (ein kleiner Commit)

1. stamm/siedlung-ort.js: `_genesisOrt(pos)` ruft `_genesisPortalRing(pos)` und `_portalApproachPrefetch(pos)`, in dieser Reihenfolge
   wie heute. `_tickGenesisOrt` ruft nur noch `_genesisOrt`. Der Modul-Karte den Eintrag des neuen Glieds geben (Lehre 12),
   `diag-atlas --check` und `npm run stamm:lint`.
2. spec/profiband/haushalt.json: genesis `ortTakt: ["_genesisOrt"]`.
3. scripts/omen-messfolge.cjs:1222: der Text der Takt-Prüfung nennt `[_genesisOrt]`.

Kein Verhalten ändert sich: dieselben zehn Tore auf R 11, dieselben vier Vorschauen, dieselbe Reihenfolge.

## Budget

0. Das ist der Beweis: dieselben Befehle, Dreiecke, VRAM und Takt-ms an S2 wie am Kopf davor.

## Dateien (Besitz)

- stamm/siedlung-ort.js (nur `_genesisOrt` neu und `_tickGenesisOrt`), spec/stamm/modul-karte.json (nur der neue Eintrag)
- spec/profiband/haushalt.json (nur genesis.ortTakt)
- scripts/omen-messfolge.cjs (nur :1222)
- **NICHT anfassen:** alles andere; die Leser von `_genesisPortalRing` hängt ort-wirt um.

## Wartet auf

- w4-studios-heim im main (siedlung-ort.js, omen-messfolge.cjs).
- w4-gras-saum im main (haushalt.json und die 12 Ratschen).
- Starte vom Kopf von integ-probe; merge main, bevor du meldest.

## Beweis (headless, Zahl vorher → nachher)

- Am Messort genesis ruft der Takt genau EIN Glied; `__codeOf('_tickGenesisOrt')` nennt `_genesisOrt`.
- Byte-gleiches Verhalten: Zahl der Tore ≤ 20 m um M = 10 und der Vorschauen = 4, vorher = nachher (Null-Renderer, Standard-Welt).
- `diag-atlas --check`, `npm run stamm:lint`, `npm run playtest:fast` am Merge-Kandidaten, `npm run check`.

**Für den Koordinator (OMEN):** ABAB g-third und g-ego, A = Kopf davor, B = dieser Zweig, je 4 Boots — erwartet „gleich“. Dieser Kopf
ist danach die A-Seite des Platz-ABAB.

**Tor:** Verhalten gleich, ABAB gleich unter 2σ.

## Abgabe

- Zweig: w4-genesis-ort-name. Commit-Betreff: „Abgabe w4-genesis-ort-name: …“.
- Bericht in drei Sätzen (geschnitten Datei:Zeile, gemessen vorher → nachher, ehrlich offen) und die vier Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **genesis-tore** ist das Muster: ABAB nicht langsamer, sonst nichts bewegt.
- **mensch-kopf** riss z107 nach 90 min. Darum `npm run playtest:fast` am Merge-Kandidaten, bevor du meldest.

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
