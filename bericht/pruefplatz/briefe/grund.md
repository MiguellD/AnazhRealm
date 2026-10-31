Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 11 (Byte-Beweis), 19, 21 und 22, dazu die Quelle WASSER (die Ruhe ist der Fixpunkt, der
Spiegel ist Kern). Der Plan steht in koordination `bericht/pruefplatz/plan.md` (§2, §3, §4, §6). Du arbeitest LOKAL: der Look wird am
echten Gerät beurteilt.

# GRUND — altes Kopfsteinpflaster als Term des Boden-Stoffs und ein Teich, dessen Spiegel das Kern-Gesetz hält (Welle a Kern, Welle d Wirt)

**Pflicht-OFFEN:**
- A: wasser, 12 Zellen ohne Bild → an S6 nah und fern im Bild.
- E: der Belag kostet 0 Befehle, 0 Dreiecke und 0 MB.
- B: im ersten Bild kein neues Programm; der Teich füllt sich nach der Kontrolle.

**Chokepoint:**
- das Boden-Gesetz in gelaende-core beim Zellen-Stein `schuttKornO` (gelaende-core.js:3254, CPU und WGSL);
- der Kern-Spiegel (`wasserSpiegel`, `seeBecken` gelaende-core.js:5197). Heute bleibt eine trockene Mulde trocken (:5649-5665).

**Was stirbt:** die graue gesprenkelte Scheibe (sie fällt mit ort-wirt) und der Platz aus getretener Erde. Heute kennt die Wege-Karte
nur Erde und Acker (RG, siedlung-wege.js:53 und :400).

**Nicht hier** (Vorlage F): Asphalt, Sand, die Querneigung `trasse.quer` und das Belag-nach-Epoche-Gesetz. Die Art des Belags je
Fläche ist Ort-Gesetz (`belag`, dasselbe Feld wie `platz.typ`, fachwerk-core.js:4321) und gehört ort-gesetz; dir gehört sein Muster.

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `scheibe-third.png`: eine graue, gesprenkelte Stein-Scheibe ohne Fuge und ohne Stein.
- `stadt-wagen.png`: Gassen aus getretener Erde (die Stadt bleibt in Teil I so).

**Ziel-Bild:**
- **Kopfstein:**
  - Granit-Kleinpflaster 9–11 cm im Kern, Großpflaster 14–16 cm auf Speichen, Ring-Weg und Mall.
  - Segmentbogen um M, Reihenverband auf den Wegen.
  - Sandfugen 8–12 mm, gewölbte, abgelaufene Köpfe mit Glanz der Laufspur, Moos in den Fugen am Rand zum Rasen.
- **Teich:** ein ruhiger Spiegel bei 0/140, in dem der Ramble und das Bootshaus stehen (S6).

**Vorbild:** Prager Altstadt, Grand-Place in Brüssel; Central Park Lake unter der Bethesda Terrace.

## Bauen (additiv; ohne Plan bleibt die Welt byte-gleich)

1. **`belagO` pflaster** in gelaende-core neben `schuttKornO`, als reine Funktion (CPU + WGSL):
   - Steinmaß-Band 0,09–0,16 m und Verband `bogen` oder `reihe`, aus der Weltlage xz;
   - Fugen-Anteil 8–15 %, Kuppe ≤ 0,012 m, Glanz der Laufspur, Moos am Rand.
   - Die Farbe des Steins liest der Wirt aus porta `STEIN_GESETZ.quader` (nur lesen): EIN Stein-Gesetz der Farbe.
   - Labor = Welt: `?studio=gelaende` zeigt dieselbe Funktion.
2. **Der Belag im Boden-Stoff** (stamm/stoff-material.js):
   - ein Term des BESTEHENDEN Programms, kein neuer Stoff, kein neues Programm vor dem ersten Bild;
   - „wo“ trägt die Wege-Karte oder der Erdbau des Plans, ohne neuen Textur-Kanal (VRAM Δ 0). Entscheide die Form selbst und miss sie
     (siedlung-wege.js `_wegeKarteMale`, :406).
3. **Teich:**
   - Der Becken-Term des Plans (`becken`: Ellipse 40 × 25 m bei 0/140, Spiegel 1,5 m unter der Terrasse) gehört IN den Kern-Spiegel.
     Er ist kein neuer Schreiber: heute sind es 8, die Seen doppelt.
   - Seine Ruhe ist der Fixpunkt: `_ensureWaterCALevel` (stamm/wasser-zellen.js:2020) legt das Level auf das Gesetz und liest den Term über
     den bestehenden Weg; stamm/wasser-hydro.js reicht ihn, falls die Hydrosphäre ihn trägt.
   - Der Spiegel entsteht nach der Kontrolle (Phase S2 der Ankunft); vor dem ersten Bild zeichnet kein Wasser-Programm neu.
4. **Die Haken in den Plan** setzt ort-wirt (ab Welle d Besitzer von siedlung-ort.js und §GENESIS_ORT): er stellt die Belag-Zeilen von
   `weg` auf `pflaster`, sobald dein Term landet. Der Boden-Stoff wirft laut auf eine unbekannte Art — kein stiller Rückfall auf Erde.
   Melde ihm die Form, falls der Plan ein Feld mehr braucht.

## Budget

- **Belag:** 0 Befehle, 0 Dreiecke, 0 MB. GPU-Zeit am Pixel ≤ +0,2 ms (gpu-bank an S1, vorher↔nachher).
- **Teich:** ≤ 1 Befehl plus Wasser-Satz; Spiegel +1,7 MB (`tex:spiegel`, heute 1 MB an Genesis und 2,7 MB an der Wiese). An S2 zählt
  er im Δ ≤ 0 des Platzes (der Teich ist dort resident); ≤ 1,0 ms GPU an S6.
- **CPU:** 0 ms auf dem Haupt-Faden; der Belag lebt im Worker und im Shader.

## Dateien (Besitz)

- gelaende-core.js: nur `belagO` und der Becken-Term. Die Datei gehört allein dir, bis F sie ruft.
- worlds/gelaende/* (Labor).
- stamm/stoff-material.js (Term im Boden-Stoff), stamm/siedlung-wege.js (Belag „wo“), stamm/wasser-zellen.js und stamm/wasser-hydro.js
  (nur die Leser des Becken-Terms).
- **NICHT anfassen:** vegetation-wiese.js (gras-saum), porta-core.js (tore), fachwerk-core.js (ort-gesetz, danach ort-wirt),
  siedlung-ort.js (ort-wirt).

## Wartet auf

- Kern-Teil (1, 3 im Kern): sofort.
- Wirt-Teil (2, 3 im Stamm): nach w4-gras-saum (siedlung-wege.js, stoff-material.js), w4-ankunft-3 und w4-ankunft-5 (stoff-material.js)
  und w4-genesis-ort-wirt (Belag-Flächen, Becken im Plan).

## Beweis

**Headless:**
- Byte-Beweis des Gelände-Kerns ohne Plan (Golden gelaende).
- Selbsttest `belagO`: Steinmaß im Band, Fugen-Anteil 8–15 %, Richtung des Verbands, Determinismus.
- Teich: der Spiegel steht nach 600 s Spielzeit auf ±0,05 m.
- Zählung der Wasser-Schreiber vorher → nachher (8 → ≤ 8).
- `npm run playtest:fast` am Merge-Kandidaten.

**Lokal auf der Radeon** (Werkbank 4670–4679, punkte 8060, je gpu-lauf ≤ 2 min):
- Bild S1 Ego (Pflaster 2–10 m), S1 Third, S6 Ego und Third (0/112 → 0/150), zu 0,5 und 0; neben die Vorher-Bilder.
- gpu-bank an S1 vorher↔nachher.
- Programme vor dem Bild vorher = nachher (Kalt-Zeile-Zähler, ein Lauf).

**Tor:**
- Belag 0 Befehle, 0 MB; gpu-bank Δ ≤ 0,2 ms.
- wasser an S6 nah und fern im Bild (≥ 0,1 %).
- Kein neues Programm vor dem ersten Bild.

## Abgabe

- Zweig: w4-grund. Commit-Betreff: „Abgabe w4-grund: …“.
- Bericht in drei Sätzen mit Zahl vorher → nachher (gpu-bank, MB, Schreiber) und den Bild-Pfaden; dazu die vier Zeilen des
  BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **b-panorama:** Der swiftshader-Gewinn trug auf der GTX nicht. Darum GPU-Zeit nur am echten Gerät.
- **genesis-tore:** Der Stein bekam sein Gesetz (`STEIN_GESETZ`); er ist dein Farbleser, kein Zwilling.
- **gras-saum** besitzt die Wiese; du stellst nur den Belag daneben.

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
