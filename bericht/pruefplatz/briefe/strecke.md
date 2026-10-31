Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 11, 13 (Bewegung nie am Render-Signal), 19 und 25. Der Plan steht in koordination
`bericht/pruefplatz/plan.md` (§2 Strecke und Fahrweg, §3 Sektor Strecke, §4 S11). Du arbeitest in der CLOUD, also gibt es keine
Welt-Bilder; die macht der Koordinator.

# STRECKE — ein Rundkurs von ~1,1 km mit Steilkurve, Kuppe und Kicker samt Landezone; KI-Wagen mit Bewohnern am Steuer; die Mess-Fahrt (Phase 1)

**Pflicht-OFFEN:**
- C: Wagen mit Bewohnern am Steuer, 0 Berührungen, jeder Wagen erreicht sein Ziel. Die Strecke ist die Probe der Fahr-Seite; die Bühne von
  C bleibt die Stadt nH 300.
- E: Frame p95 und CPU-Takt in Fahrt (neue ABAB-Zelle pp-fahrt) und die Übergänge F1–F6 unter Bewegung. E misst heute nur im Stehen.

**Chokepoint:**
- Der EINE Fahr-Schritt in vehicle-core (vehicle-core.js:2634-2654). An einer Kuppe mit v²/R > g hebt der Wagen ab (:2885-2904); in der
  Luft behält der Aufbau seine Lage (:2918).
- Der EINE Fahrer (stamm/koerper-fahrt.js:1416-1545). Er folgt einer Linie und hält an ihrem Ende (`F.ende`, :1528).

**Was stirbt:**
- Die starre Lage im Flug.
- Der Fahrer, der nur zu einem Ende fährt; die Runde gehört künftig zu seinem Gesetz.
- Die Pylonen und der cos²-Hügel nur im Labor (worlds/garage/garage.js:274-335). Das Labor zeigt künftig die Bauteile des Gesetzes.

## Vorher → Ziel

**Vorher:**
- Es gibt keinen Rundkurs.
- Die Stadt fährt Kompakt, Limousine und SUV mit 30 km/h (siedlung-verkehr.js:1400-1444).
- 4 der 10 nächsten Wagen fuhren am Kopf ohne Bild (koordination UEBERGABE-2026-10-31.md:60).
- `stadt-wagen.png` (koordination `bericht/pruefplatz/vorher/`): Wagen auf Erde zwischen Fußgängern.

**Ziel-Bild:**
- Ein Kurs im Sinne von SuperTuxKart: Runde 40–70 s, nach jedem Sprung eine Landezone, die Straße voraus immer sichtbar.
- Breite nach McMillan: 2 Spuren zu 1,6 Wagenbreiten plus Bankett, also 9 m.
- Der Start wie das Festival in Forza Horizon: Start und Ziel liegen an der West-Seite, am Weg von T10 (Garage, 57,3°), mit dem GT als
  Vorschau.
- Die Elemente:
  - Start/Ziel-Gerade von 180 m mit Tribüne.
  - Steilkurve mit 18° Überhöhung.
  - Kuppe mit R 60 m.
  - Kicker: Rampe 12°, Lippe, ~20 m Flug, Landung 8° abwärts auf 40 m.
  - S-Kurve und zwei Haarnadeln.
- Belag: Asphalt (grund). Rahmen x 70…390, z 150…370; der nächste Punkt liegt ≥ 160 m von M, also außerhalb der Mesh-Zone der Ankunft.

## Bauen

1. **vehicle-core `STRECKE_GESETZ`**, additiv:
   - Bauteile: gerade, kurve (R, Winkel, quer), kuppe (R), kicker (rampe°, lippe, flug, landung°).
   - Die Grenzen aus dem Reibkreis und aus v²/R > g (wo der Wagen abhebt, wo er landet).
   - `streckeLegen(rahmen, seed)` liefert die geschlossene Mittellinie, die Trassen für ERDBAU mit `quer`, die Checkpunkte und die
     Rennlinie. Rein und deterministisch.
2. **Flug:** Die Lage dreht aus dem Drehimpuls beim Absprung und landet in der Hub-Feder. Der Fahr-Schritt bleibt EINER.
3. **Fahrer** (stamm/koerper-fahrt.js):
   - Die Runde als Schleife statt `F.ende`.
   - Das Tempo vor der Kurve aus dem Reibkreis (das Bremsen in 120 m Sicht gibt es schon, :2522-2542).
   - Folgen und Überholen nur über das EINE Fahr-Gesetz.
4. **KI-Wagen mit Bewohnern am Steuer:** derselbe Leib am Steuer wie im Verkehr der Stadt (siedlung-verkehr.js gehört Verkehr-C). Melde
   den Haken dort, baue keinen zweiten Fahrer.
5. **Mess-Fahrt:** eine feste Eingabe-Spur für den Spieler-GT über eine Runde, für S11 und die Zelle pp-fahrt.
6. **Labor = Welt:** worlds/garage zeigt die Bauteile aus demselben Gesetz.

## Budget

- **S11, Verfolger in Third:**
  - Wagen (Klasse bau) ≤ 16 Befehle / 45k Dreiecke bei 4 Wagen im Bild. Heute kostet L1 je Wagen 10 Befehle / 10,6k (vehicle-core.js:48-50),
    darum müssen die Wagen in den Bau-Satz je Stoff.
  - Strecken-Bauten (Tribüne, Banden) ≤ 10 / 20k.
  - Fahrer ≤ 4 / 8k.
- **CPU:** ≤ 1,0 ms für 4 Wagen. Ferne Wagen rechnen nur jeden 2./4./8. Schritt (siedlung-verkehr.js:1460-1465).
- **Frame:** p95 ≤ 33 ms in Fahrt (E).
- **Kosten-Anker:** Die volle Fahrt über die Mess-Wiese lag bei CPU-Takt p95 31,3 ms (z9c, alt). Dieser Wert ist die Bremse.

## Dateien (Besitz)

- vehicle-core.js
- stamm/koerper-fahrt.js
- worlds/garage/garage.js
- **NICHT anfassen:**
  - gelaende-core.js: grund liefert `trasse.quer` und asphalt.
  - siedlung-verkehr.js und siedlung-bewohner.js: Verkehr-C, familien.
  - siedlung-ort.js: ort-plan setzt den Rahmen und den Fahrweg.

## Wartet auf

- w4-studios-heim2 im main (vehicle-core.js, koerper-fahrt.js).
- grund (`trasse.quer`, asphalt), w4-ort-plan (Rahmen), w4-verkehr-c (Wagen mit Bewohnern).
- Das Gesetz 1–3 kannst du nach studios-heim2 sofort bauen.

## Beweis (headless, Zahlen)

- Golden vehicle: Der Fahr-Schritt ohne Strecke bleibt byte-gleich.
- Runde des KI-GT: 55–65 s.
- Flug am Kicker: 18–22 m, Landung ohne Überschlag in 10/10 Läufen.
- 4 KI-Wagen fahren 10 Runden mit 0 Berührungen; jeder erreicht jeden Checkpunkt.
- Die Mess-Fahrt ist deterministisch: zwei Läufe, dieselbe Spur ± 0,1 m.
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator:**
- Radeon: die Mess-Fahrt S11 in Third, ≤ 2 min je Lauf; Bilder an Steilkurve, Kicker-Flug und Landung.
- OMEN: ABAB-Zelle pp-fahrt.

**Tor:**
- Die Sektor-Hülle hält in Fahrt.
- Frame p95 ≤ 33 ms (GTX).
- 0 Berührungen.

## Abgabe

- Zweig: w4-strecke. Commit-Betreff: „Abgabe w4-strecke: …“.
- Bericht in drei Sätzen und die GPU-Proben.

## Lehren der letzten Abgaben

- **Verkehr-C** (e7cc34c9): Fuß und Wagen teilen die Straße nach EINEM Gesetz; jeder Wagen fährt zu einem Ziel. Halte dich an dieses
  Gesetz, nicht an eine zweite Regel.
- **Der Schöpfer fand am 17.10. sechs Brüche unter Bewegung** (F1–F6: Sicht-Wechsel in Fahrt, Tempo …). Prüfe die Übergänge in Fahrt,
  nicht nur im Stehen.
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
