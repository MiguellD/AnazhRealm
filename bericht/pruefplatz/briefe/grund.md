Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 11 (Byte-Beweis), 19, 21, 22 und 26. Der Plan steht in koordination
`bericht/pruefplatz/plan.md` (§1, §2, §3).

# GRUND — der Boden des Prüfplatzes: Kopfstein, Asphalt, Sand, der Teich mit gehaltenem Spiegel, die Steilkurve (Phase 1)

**Pflicht-OFFEN:**
- A: boden-nah am Rand des Pflasters; wasser an S6.
- B: Der Belag ist ein Term des Boden-Stoffs, kein Bau. Er kostet 0 Befehle und kommt mit dem Chunk.
- E: 0 Befehle, 0 MB, GPU ≤ 0,2 ms.

**Chokepoint:** das Boden-Gesetz in gelaende-core, beim Zellen-Stein `schuttKornO` (gelaende-core.js:3254-3300, CPU und WGSL).

**Was stirbt:** die graue gesprenkelte Scheibe (sie fällt mit ort-plan) und der Platz aus getretener Erde. Heute kennt die Wege-Karte nur
Erde und Acker (siedlung-wege.js:53, :406), und `_wegeBodenFarbe` mischt nur Laubstreu, Asche, Erde und Acker (:653-700).

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `scheibe-third.png`: eine graue, gesprenkelte Stein-Scheibe ohne Fuge und ohne Stein.
- `stadt-wagen.png`: die Gassen der Stadt sind getretene Erde, Wagen und Leute fahren auf Erde. Es ist derselbe Mangel; dein Gesetz
  hebt auch die Stadt.

**Ziel-Bild:**
- **Altes Kopfsteinpflaster:**
  - Granit-Kleinpflaster 9–11 cm im Kern, Großpflaster 14–16 cm auf den Speichen.
  - Verband im Segmentbogen um M (Bogenpflaster), Reihenverband auf den Wegen.
  - Sandfugen 8–12 mm, gewölbte, abgelaufene Köpfe mit Glanz auf der Laufspur, Moos in den Fugen am Rand zur Wiese.
- **Asphalt** auf Strecke und Fahrweg; **Sand** in Arena und Spielplatz.
- **Teich:** ein Spiegel, in dem der Ramble steht.

**Vorbild:** Prager Altstadt, Grand-Place in Brüssel (Pflaster); Central Park Lake mit Bethesda Terrace (Teich).

## Bauen (additiv, Byte-Beweis: ohne Plan bleibt die Welt byte-gleich)

1. **`BELAG_GESETZ` in gelaende-core**, als reine Funktion (CPU + WGSL wie `schuttKornO`):
   - pflaster:
     - Steinmaß-Band 0,09–0,16 m und Verband `bogen` oder `reihe`, aus der Weltlage xz.
     - Fugen-Anteil 8–15 %.
     - Kuppe ≤ 0,012 m.
     - Abnutzung: Glanz der Laufspur aus dem Plan.
     - Moos am Rand.
   - asphalt, sand und kies ebenso.
   - Die Farbe der Steine liest der Wirt aus porta `STEIN_GESETZ.quader` (Ton, fugeTon; nur lesen). Damit gibt es EIN Stein-Gesetz der
     Farbe; die Geometrie des Belags gehört dir.
   - Labor = Welt: der Studio-Modus `?studio=gelaende` zeigt dieselbe Funktion.
2. **Der Belag je Fläche kommt aus dem Plan** (`belag` an Platz, Wegen und Zonen; die Zeilen setzt ort-plan).
   - Er wird ohne neuen Textur-Kanal getragen, denn das VRAM-Budget ist 0. Die Wege-Karte (4 MB) trägt „wo“, das „was“ kommt als Tafel
     des Orts.
   - Entscheide die Form selbst und miss sie.
3. **Teich:** ein Becken-Term des Plans im Gesetz des Spiegels (`wasserSpiegel`, Hydrosphäre).
   - Die Mulde ist eine Ellipse bei 0/140 mit Halbachsen 40 × 25 m, der Spiegel liegt 1,5 m unter der Terrasse.
   - Die Ruhe ist sein Fixpunkt. Heute hält ein Stau nur hinter einem Werk (gelaende-core.js:5649-5661), und eine trockene Mulde bleibt
     trocken.
   - Der Teich ist Kern-Gesetz; seinen Stamm-Leser rufst du über den bestehenden Weg, kein zweiter Wasser-Schreiber.
4. **ERDBAU `trasse.quer`:** die Querneigung in rad, das Vorzeichen zeigt zur Innenseite der Kurve. Das Feld ist optional; ohne `quer`
   bleibt alles byte-gleich (`TRASSE_ZAHL`, gelaende-core.js:1643). Leser ist die Steilkurve der Strecke (18°).

## Budget

- **Belag:** 0 Befehle, 0 Dreiecke, 0 MB. Die GPU-Zeit am Pixel steigt um ≤ 0,2 ms (gpu-bank an S1, vorher↔nachher).
- **Teich:**
  - Höchstens 1 Befehl plus Wasser-Satz.
  - Der Spiegel kostet +1,7 MB (`tex:spiegel` heute 1 MB an Genesis und 2,7 an der Wiese) und ≤ 1,0 ms GPU.
  - Er gehört zur Park-Hülle (plan.md §3).
- **CPU:** 0, der Belag lebt im Worker und im Shader.

## Dateien (Besitz)

- gelaende-core.js: nur §BELAG_GESETZ, §Becken und §ERDBAU `trasse.quer`. Die Datei gehört allein dir.
- worlds/gelaende/* (Labor).
- stamm/siedlung-wege.js (Belag in Karte und Tafel) und stamm/stoff-material.js (Term im Boden-Stoff). Beide erst, wenn w4-gras-saum
  gelandet ist.
- **NICHT anfassen:** stamm/vegetation-wiese.js (gras-saum), porta-core.js (tore), fachwerk-core.js (ort-plan, werke).

## Wartet auf

- Den Kern-Teil (1, 3, 4) startest du sofort.
- Den Wirt-Teil (2, die Haken) erst nach w4-gras-saum (siedlung-wege.js, stoff-material.js) und w4-ort-plan (Belag-Zeilen, Teich-Fläche).
- **Übergaben:** an strecke `trasse.quer` und asphalt; an stadt den Belag der Gassen nach Epoche. Das Belag-Gesetz der Moderne lebt heute
  nur im Labor (worlds/fachwerk/fachwerk.js:279-302); bring es in dein Gesetz, das Labor liest dann dich.

## Beweis

**Headless:**
- Byte-Beweis des Gelände-Kerns ohne Plan (Golden gelaende).
- Selbsttest von `belagO`: Steinmaß im Band, Fugen-Anteil 8–15 %, Richtung des Verbands, Determinismus.
- Der Teich: der Spiegel steht nach 600 s Spielzeit ±0,05 m (Ruhe-Fixpunkt).
- `trasse.quer`: Höhe quer zur Achse = tan(quer) · Abstand ± 0,02 m.

**Lokal auf der Radeon** (Werkbank 4670–4679, punkte 8060, je gpu-lauf ≤ 2 min):
- Bild S1 Ego nah (Pflaster 2–10 m), S6 (0/110 → 0/150, der Teich) und S1 Third, zu 0,5 und 0.
- gpu-bank an S1 vorher↔nachher.
- Die Bilder legst du neben die Vorher-Bilder.

**Tor:**
- Belag 0 Befehle, 0 MB.
- gpu-bank Δ ≤ 0,2 ms.
- wasser ist an S6 nah und fern im Bild (≥ 0,1 %).
- boden-nah misst an den Keilen und an S5 unverändert.

## Abgabe

- Zweig: w4-grund. Commit-Betreff: „Abgabe w4-grund: …“.
- Bericht in drei Sätzen mit Zahl vorher → nachher (gpu-bank, MB) und den Bild-Pfaden.

## Lehren der letzten Abgaben

- **b-panorama:** Der swiftshader-Gewinn trug auf der GTX nicht. Darum: GPU-Zeit nur am echten Gerät.
- **genesis-tore:** Der Stein bekam sein Gesetz (`STEIN_GESETZ`). Er ist dein Farbleser, kein Zwilling.
- **gras-saum** besitzt die Wiese. Du stellst nur den Belag daneben; jeder Halm bleibt sein Gesetz.

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
