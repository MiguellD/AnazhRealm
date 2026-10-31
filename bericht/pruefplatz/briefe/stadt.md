Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 13, 14, 23, 25 und Gebot 7 („die Welt ist eine FUNKTION, kein Sack“). Du arbeitest LOKAL:
die Ferne wird nur am echten Gerät beurteilt.

**STARTET ERST, wenn der Schöpfer F in `docs/PFLICHT-OFFEN.md` gesetzt hat** (Vorlage: koordination `bericht/pruefplatz/plan.md` §1).
Setzt er F nicht, fällt dieser Brief FINAL. C bleibt bei w4-verkehr-c: die C-Bühne (Stadt nH 300 am Wort), die Messorte stadt und
stadt-voll und ihre Basis z103 fasst du nicht an.

# STADT (F) — die Silhouette ist die Welt-March-Hülle der Häuser ungebauter Pläne; die Sektoren 2–n wachsen auf ~2 300 Häuser

**Eintrag:** F, die Zone Stadt. Das Kriterium: die Silhouette der Stadt steht vom Platz aus, und an S1, S2, S5 und S6 hält das Band.

**Chokepoint:** die Fernform des Hauses. Sie ist schon die Welt-March-Hülle (fachwerk-core.js:101-103, `fernform: "huelle"`, die Liste der
Stufe 3). Sie wird für Pläne gespeist, deren Häuser noch nicht gebaut sind. Kein Fern-Ring-Zwilling, keine zweite Stadt-Form.

**Was stirbt:** die Ferne ohne Stadt. Fern-Ring und Feld-Pass kennen heute keine Siedlung (0 Treffer).

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`): `stadt-wagen.png`, `stadt-platz.png`.

**Messwerte 31.10.** (z103, GTX, Stadt 91 Häuser): CPU-Takt gehend p95 49,4 ms, 1,29 M Dreiecke, VRAM 188–220 MB. Der Engpass ist der
Haupt-Faden.

**Ziel-Bild:** von der Terrasse (S6) über die Lichtung die Skyline, wie vom Central Park auf Midtown.

**Vorbild:**
- Matrix Awakens (7 000 Häuser auf 16 km² aus Modulen);
- GTA V (~4 155 Befehle, LOD-Ringe, Nebel);
- HLOD bzw. World Partition, Interior Mapping;
- Cities Skylines 2 als Warnung (36 M Dreiecke, 72 % Schatten).

## Bauen

1. **Silhouette:**
   - Der Welt-March zeichnet die Stufe-3-Hülle (`huelle()`) der Slots eines Plans, sobald der Plan gerechnet ist — auch ohne gebaute
     Häuser.
   - Fenster als Interior Mapping im Shader; Schatten werfen nur Häuser im Nah-Ring.
   - Im Ankunftskegel (21,2°–158,8°) liegt sie entweder im Horizont-Term des ersten Bilds oder bei ≤ 0,5 % des K2-Bilds.
2. **Sektoren 2–n:**
   - Pläne mit nH ≤ 500 bei 1,1–1,5 km in freien Richtungen (O, SO, W, NW), nie in der Sicht der Mess-Wiese (−280/−1046, Blick WSW) und
     nie am Dorf-Messort (−841/−861).
   - Ziel ~2 300 Häuser. Live ist nur der Sektor in Zug-Nähe; die anderen stehen als Silhouette.
   - Die festen Einträge im Rang-Gesetz (fachwerk-core.js:3191-3244) und die Sektor-Zeilen in §GENESIS_ORT setzt ort-wirt (benannter
     Besitzer der Haken).
3. **Kosten folgen dem Schirm**, nie der Hauszahl: drei Ringe (live, Hülle, Horizont).

## Budget

- **An S1, S2, S5 und S6:** Silhouette ≤ 2 Befehle / 20k Dreiecke, ≤ 0,5 MB, ≤ 0,2 ms GPU, 0 ms Haupt-Faden.
- **Kalt-Zeile (B):** unverändert; keine Stadt im ersten Bild.
- **Den Haupt-Faden der Stadt** besitzen w4-e-takt und w4-verkehr-c; du verschlechterst ihn nicht.

## Dateien (Besitz)

- stamm/gelaende-fern.js, stamm/bild-sicht.js (nur der Silhouetten-Term)
- **NICHT anfassen:**
  - siedlung-ort.js, §GENESIS_ORT, haushalt.json (ort-wirt);
  - siedlung-verkehr.js, siedlung-bewohner.js (w4-verkehr-c, bewohner);
  - gelaende-core.js;
  - die Messorte stadt und stadt-voll.

## Wartet auf

- w4-e-takt (bild-sicht.js), w4-ankunft-3 und w4-ankunft-5 (bild-sicht.js, gelaende-fern.js), w4-genesis-ort-wirt.
- Lokal auf dem nächsten freien GPU-Platz (höchstens 3 lokal). Werkbank 4680–4689, punkte 8080.

## Beweis

**Headless:**
- Byte-Beweis der Ferne ohne Stadt.
- Die Hülle eines ungebauten Plans ist die Hülle desselben gebauten Plans (Plan-Hash, Studio = Welt).

**Radeon** (≤ 2 min je Lauf):
- Bilder mit Silhouette zu 0,5 und 0 von der Terrasse (S6); gpu-bank an S1 vorher↔nachher.
- Vom Kern verdeckt der Gürtel die Ferne: miss, was dort zu sehen ist, und behaupte nichts.

**OMEN:** Kalt-Zeile 4+4 unverändert; die Band-Zellen an S2 unverändert.

**Tor:** Silhouette im Budget; Kalt-Zeile nicht schlechter; S2 Δ ≤ 0.

## Abgabe

- Zweig: w4-stadt-ring. Commit-Betreff: „Abgabe w4-stadt-ring: …“.
- Bericht in drei Sätzen mit Bild-Pfaden und die vier Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **z94** galt als LANGSAMER, war aber der Wechsel der Messung auf die bewohnte Stadt. Darum fasst du die Basis von C nicht an.
- **b-panorama:** der swiftshader-Gewinn trug auf der GTX nicht. Die Ferne nur am echten Gerät beurteilen.

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
