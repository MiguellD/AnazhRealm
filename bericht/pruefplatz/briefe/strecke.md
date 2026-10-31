Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 11, 13 (Bewegung nie am Render-Signal), 19 und 25. Du arbeitest in der CLOUD, also gibt es
keine Welt-Bilder; die macht der Koordinator.

**STARTET ERST, wenn der Schöpfer F in `docs/PFLICHT-OFFEN.md` gesetzt hat** (Vorlage: koordination `bericht/pruefplatz/plan.md` §1).
Setzt er F nicht, fällt dieser Brief FINAL. C (Verkehr in der Stadt nH 300) gehört w4-verkehr-c, nicht dir.

# STRECKE (F) — ein Rundkurs mit Steilkurve, Kuppe und Kicker als Gesetz des Fahr-Studios; Wagen mit Bewohnern am Steuer aus dem EINEN Verkehr

**Eintrag:** F, die Zone Strecke. Das Kriterium:
- ein Wagen fährt die Runde in 55–65 s mit 18–22 m Kicker-Flug;
- vier Wagen mit Bewohnern am Steuer fahren 10 Runden ohne Berührung;
- an der Station hält das Band in Fahrt.

**Chokepoint:**
- der EINE Fahr-Schritt in vehicle-core (vehicle-core.js:2634-2654; Abheben bei v²/R > g :2885-2904; im Flug starre Lage :2918);
- der EINE Fahrer (stamm/koerper-fahrt.js:1416-1545; er hält am Linien-Ende `F.ende`, :1528).

**Was stirbt:**
- die starre Lage im Flug;
- der Fahrer, der nur zu einem Ende fährt;
- Pylonen und cos²-Hügel nur im Labor (worlds/garage/garage.js:274-335).

## Vorher → Ziel

**Vorher:** kein Rundkurs. Die Stadt fährt Kompakt, Limousine und SUV mit 30 km/h (siedlung-verkehr.js:1400-1444).

**Ziel-Bild:** ein Kurs wie in SuperTuxKart (Runde 40–70 s, nach jedem Sprung eine Landezone, die Straße voraus immer sichtbar), Breite
nach McMillan (2 Spuren zu 1,6 Wagenbreiten plus Bankett, 9 m). Er umfasst:
- die Start/Ziel-Gerade 180 m mit Tribüne;
- eine Steilkurve 18°;
- eine Kuppe R 60 m;
- einen Kicker (Rampe 12°, ~20 m Flug, Landung 8° abwärts auf 40 m);
- eine S-Kurve und zwei Haarnadeln.

**Lage:** der Rahmen x 355…675, z −184…36: ≥ 355 m von M und ≥ 364 m vom Anlauf 400/400 der Messorte stadt/stadt-voll
(haushalt.json:278, :321), deren Einschwingen er nie mitmisst. Der Zugang führt über das garage-Tor (T8, 351,8°).

## Bauen

1. **vehicle-core `STRECKE_GESETZ`**, additiv:
   - Bauteile gerade, kurve (R, Winkel, quer), kuppe (R), kicker (rampe°, lippe, flug, landung°); Grenzen aus Reibkreis und v²/R > g.
   - `streckeLegen(rahmen, seed)` liefert Mittellinie, Trassen mit `quer`, Checkpunkte und Rennlinie, rein und deterministisch.
2. **Flug:** Die Lage dreht aus dem Drehimpuls beim Absprung und landet in der Hub-Feder. Der Fahr-Schritt bleibt EINER.
3. **Fahrer:** die Runde als Schleife statt `F.ende`; Tempo vor der Kurve aus dem Reibkreis; Folgen und Überholen nur über das EINE
   Fahr-Gesetz.
4. **`trasse.quer`** im ERDBAU (gelaende-core, `TRASSE_ZAHL` :1644, optional) und **`belagO` asphalt**. Ohne `quer` bleibt alles
   byte-gleich. Die Datei gehört dir erst nach der Landung von grund und spielplatz.
5. **Wagen mit Bewohnern am Steuer:** derselbe Leib am Steuer und dieselbe Setzung wie im Verkehr der Stadt (`_verkehrAnlegen`,
   siedlung-verkehr.js:24). Nach der Landung von w4-verkehr-c gehört dir dort NUR die Setzung auf den Strecken-Trassen. Kein zweiter
   Fahrer.
6. **Ruhe:** jeder Wagen jenseits 60 m oder außer Blick ruht als Zahl (nicht „jeden 2./4./8. Schritt“).
7. **Mess-Fahrt:** eine feste Eingabe-Spur des Spieler-GT über eine Runde, deterministisch.
8. **Labor = Welt:** worlds/garage zeigt die Bauteile aus dem Gesetz.
9. **Haken (benannter Besitzer ort-wirt):** Die Zeile `strecke {rahmen, seed}` in §GENESIS_ORT. Der Wirt ruft `streckeLegen` und legt die
   Trassen über `_erdbauSetzen` (gelaende-boden.js:671) unter dem Schlüssel des Plans.

## Budget (an der Station Strecke, in Fahrt; die Summe hält das Band)

- 4 Wagen im Bild: ≤ 16 Befehle / 45k Dreiecke (die Wagen im Bau-Satz; heute L1 je Wagen 10 / 10,6k, vehicle-core.js:48-50).
- Tribüne und Banden ≤ 10 / 20k.
- CPU Δ ≤ 1,0 ms; Frame p95 ≤ 33 ms (GTX).
- Kosten-Anker: die volle Fahrt über die Mess-Wiese lag bei CPU-Takt p95 31,3 ms (z9c). Das ist die Bremse.

## Dateien (Besitz)

- vehicle-core.js, stamm/koerper-fahrt.js, worlds/garage/garage.js
- gelaende-core.js nur `trasse.quer` und `belagO` asphalt (nach grund und spielplatz)
- siedlung-verkehr.js nur die Setzung auf der Strecke (nach w4-verkehr-c)
- **NICHT anfassen:** siedlung-ort.js, §GENESIS_ORT, haushalt.json (ort-wirt); siedlung-bewohner.js; die Messorte stadt/stadt-voll.

## Wartet auf

- w4-studios-heim im main (vehicle-core.js, koerper-fahrt.js), w4-verkehr-c, grund.

## Beweis (headless, Zahlen)

- Golden vehicle: der Fahr-Schritt ohne Strecke bleibt byte-gleich.
- Runde des KI-GT 55–65 s; Flug am Kicker 18–22 m, Landung ohne Überschlag 10/10.
- 4 KI-Wagen fahren 10 Runden: 0 Berührungen, jeder erreicht jeden Checkpunkt.
- Mess-Fahrt deterministisch: zwei Läufe, dieselbe Spur ± 0,1 m.
- Ruhe: jenseits 60 m Takt-ms je Wagen = 0.
- `npm run playtest:fast` am Merge-Kandidaten.

**Für den Koordinator:** Radeon die Mess-Fahrt in Third (≤ 2 min je Lauf), Bilder an Steilkurve, Kicker-Flug und Landung; OMEN die
Fahrt-Zelle.

## Abgabe

- Zweig: w4-strecke. Commit-Betreff: „Abgabe w4-strecke: …“.
- Bericht in drei Sätzen und die vier Zeilen des BETRIEBSGESETZES.

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
