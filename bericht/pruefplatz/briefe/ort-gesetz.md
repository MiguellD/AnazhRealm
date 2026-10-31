Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 2, 7, 10 (Gebot: die Linse nennt den Täter), 11 (Byte-Beweis) und 19 (Labor = Welt). Der Plan
steht in koordination `bericht/pruefplatz/plan.md` (§2, §3, §5); die Posen-Probe, die du zur Linse machst, liegt dort als
`geo2/stationen2.cjs`. Du arbeitest in der CLOUD, also gibt es keine Welt-Bilder; die macht der Koordinator.

# ORT-GESETZ (0b) — der Genesis-Ort ist EIN Plan des Ort-Gesetzbuchs, mit seinen Stationen als Daten und der Posen-Linse

**Pflicht-OFFEN:**
- A: jede der 14 Klassen bekommt ihre Station nah und fern (heute 54 Zellen ohne Bild).
- B: der Plan ist eine reine Funktion, die der Voxel-Faden als ersten Auftrag rechnet (≤ 50 ms).

**Chokepoint:** fachwerk `ortPlan` (das Ort-Gesetz jedes Dorfs) und `platz.typ` (fachwerk-core.js:4321).

**Was stirbt:** die Maße des Genesis-Orts im Wirt (`GENESIS_PLATZ { ringR: 11, rand: 4 }`, siedlung-ort.js:3621) — ihre Quelle wird
dein Abschnitt; den Wirt-Abschied macht ort-wirt.

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `genesis-ego-alt.png`: Ego, alter Ring R 11 — die graue Scheibe füllt das untere Drittel, die Tore stehen 6,9 m dicht.
- `spawn-third-alt.png`: die Scheibe Ø 13 m mit Quarz-Kern („Plattform verdeckt 27 % im Vordergrund“).

**Ziel:** Ein Plan, aus dem der Wirt den Platz liest. Er besteht aus einem Kopfstein-Rondell r 10 mit 11 Speichen, zehn Toren auf r 22
(Sehne 12,4 m), der Mall mit Eichen-Allee zur Terrasse, dem Teich, der Wiese mit Fels und Arten-Saum, dem Bootshaus, dem Wolfs-Gehege mit
Graben (r 265) und dem Start-Viertel (Wunsch r 190). Jede Zahl steht in plan.md §3.

**Vorbild:** Greensward-Plan 1858 (Mall → Terrasse → Teich), Disneyland-Hub (EIN Wienie in der Achse), Peach's Castle (die Bilder sind
die Tore).

## Bauen (fachwerk-core additiv; jeder Dorf-Plan bleibt byte-gleich)

1. **Abschnitt `GENESIS_ORT` am Ende** — die Maße aus plan.md §3 als Daten:
   - Kern, Speichen, Keile, Ring-Weg, Slots, Slot-Tafel Welt ↔ k (§3).
   - Vorschau-Zeilen k 3, 4, 8, 9 mit `nahM: 14`.
   - Ausstattung: 4 Kern-Laternen, Wache-Laterne, 4 Bänke, Brunnen, 2 Terrassen-, 1 Wiesen- und 4 Zoo-Laternen.
   - Bäume mit `art` je Zeile (Allee Eiche, Saum Fichte/Tanne/Birke/Weide) und der Kappe des Plans.
   - Haus-Slot Bootshaus, Formation Fels.
   - Becken Teich (Ellipse, Spiegel relativ zur Terrasse).
   - Gehege `{gattung: 'wolf', n: 3, lager, rand, graben}`.
   - Wache-Punkt, Viertel-Wunsch, Wege, die erklärten Flächen (`zonen`) und `belag` je Fläche (Grau-Fassung `weg`).
2. **`genesisLayout(seed, welten)`** liefert Plan v1. Ist die Slot-Tafel unvollständig oder fehlt eine Welt, wirft es laut — fail-closed,
   nie ein Ersatz.
3. **`ortPlan` mit `art:'genesis'`** liefert Plan v2 mit `erdbau`:
   - der Kern als 4 um 22,5° gedrehte Platten;
   - Speichen, Ring-Weg, Mall und Wege als Trassen, die Terrasse als Platte;
   - das Teich-Bett als Platte auf Bett-Höhe, der Graben als 4 Trassen 2 m unter Grund. ERDBAU kennt nur `platte`, `trasse`, `frei` und
     `grund` (gelaende-core.js:1630-1660); du brauchst keinen neuen Typ.
   - `belag` reichst du je Fläche durch; es ist dasselbe Feld wie `platz.typ`. In der Grau-Fassung steht `weg` (die Art, die der Boden
     heute kennt); auf `pflaster` stellt ort-wirt um, sobald grund den Term liefert.
4. **`stationen`:** S1 … S11 als Funktionen der Elemente (z. B. S8 = Zoo-Mitte − 2 m → Gehege; S1L = 11,4 m auf a_10). Third je Station
   als Spieler-Ort; nie eine zweite Koordinaten-Liste.
5. **Labor = Welt:** worlds/fachwerk/fachwerk.js zeigt den Genesis-Plan über denselben Weg wie jedes Dorf (`ortPlan` → Plan v2).
   Plan-Hash Studio = Welt.
6. **Die Posen-Linse** in der Familie diag-fachwerk-contract (rein node, ≤ 3 min CI, kein Browser). Sie liest `genesisLayout` und prüft
   je Station in Ego und Third:
   - die Kamera steht in keinem Grundriss, keinem Wasser und nicht im Gürtel abseits eines Wegs;
   - das Ziel liegt im Bildwinkel (53,8° halb, Rand 4°);
   - der Abstand stimmt (nah ≤ 30 m bzw. fern > 30 m);
   - der Anteil nach der Lochkamera (f = 704 px) liegt ≥ 0,1 %, bei fern-Zeilen ≥ 200 px je Instanz;
   - die Sichtlinie verläuft je Meter auf erklärtem Grund oder Wasser.

   Sie listet außerdem die fremden Zonen im Kegel ≤ 150 m und die residenten Zonen ≤ 210 m. Leser ist der Koordinator vor dem Landen von
   ort-wirt.

   **Selbsttest:** drei gepflanzte Fehler sind ROT beim Namen — eine Kamera im Gürtel, eine Sichtlinie über Feld-Wurf, eine fern-Station
   in 25 m. Vorlage ist `geo2/stationen2.cjs` (dort 32/32 GRÜN).

## Budget

- `genesisLayout` + `ortPlan` art genesis ≤ 50 ms in node, kalt gemessen. Der Wert ist der Stellvertreter des Faden-Auftrags; ort-wirt
  misst ihn im Faden.
- 0 Laufzeit-Kosten außerhalb des Plans.

## Dateien (Besitz)

- fachwerk-core.js: der neue Abschnitt `GENESIS_ORT`, der Zweig `art:'genesis'` in `ortPlan` und das Feld `belag`. Die Daten-Zeilen
  gehen nach deiner Landung an ort-wirt.
- worlds/fachwerk/fachwerk.js (nur das Zeigen des Genesis-Plans).
- scripts/diag-fachwerk-contract.cjs (nur der neue Abschnitt der Posen-Linse) und sein Selbsttest.
- **NICHT anfassen:** stamm/* (ort-wirt), porta-core.js (tore), gelaende-core.js (grund), die Epochen-Belag-Zeilen des Labors
  (worlds/fachwerk/fachwerk.js:279-280, Vorlage F).

## Wartet auf

- w4-studios-heim im main (fachwerk-core.js, diag-fachwerk-contract.cjs).
- Starte vom Kopf von integ-probe; merge main, bevor du meldest.
- **Übergaben:**
  - an ort-wirt: der Plan v2 und die Form von `stationen`;
  - an mess: `stationen` als die EINE Quelle der Posen;
  - an grund: `belag` und `becken`;
  - an gehege: die Zeile `gehege`;
  - an bewohner: der Wache-Punkt.

## Beweis (headless, Zahlen)

- Byte-Beweis: jeder bestehende Dorf-Plan bleibt byte-gleich (gate:settlement Plan-Hash, Golden fachwerk unverändert).
- Plan-Hash Studio = Welt für den Genesis-Plan.
- t(`genesisLayout` + `ortPlan`) in ms, kalt.
- Die Posen-Linse ist GRÜN (32/32 wie die Probe); ihr Selbsttest ist ROT an den drei gepflanzten Fehlern beim Namen.
- `npm run check`, `npm run playtest:fast` am Merge-Kandidaten.

**Tor:** Byte-Beweis, Plan-Hash, Linse GRÜN mit Selbsttest, ≤ 50 ms.

## Abgabe

- Zweig: w4-genesis-ort-gesetz. Commit-Betreff: „Abgabe w4-genesis-ort-gesetz: …“.
- Bericht in drei Sätzen und die vier Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **Plan Fassung 1:** Sichtschutz nur auf Pixel, 3 Kameras im Gürtel. Darum entscheidet die Posen-Linse, nicht das Auge auf der Skizze.
- **a-spawn-gtx** lief mit leerem Skript und meldete Exit 0. Die Linse bricht leer ROT ab.
- **mensch-kopf** riss z107. Darum `playtest:fast` am Kandidaten.

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
