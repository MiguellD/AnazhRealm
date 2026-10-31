Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 11 (Byte-Beweis, Re-Mint als Vertrags-Akt), 18, 19, 21 und 23. Der Plan steht in
koordination `bericht/pruefplatz/plan.md` (§1, §2 Slot-Tafel, §4). Du arbeitest in der CLOUD, also gibt es keine Welt-Bilder; die macht
der Koordinator.

# TORE — alle zehn Tore auf Studio-Niveau, jede Membran bunt in jeder Stufe und zu jeder Uhr, die Tore im Kern in ihrer Klasse (Phase 1)

**Pflicht-OFFEN:**
- A: tor-fern, tor-bunt und tor-ziel an S1–S4.
- E: die Klasse bau am Kern.

**Chokepoint:** porta-core, das Gesetzbuch der Tore (`PORTAL_RENDER_CONFIG`, kindStages.gate [0, 1, 2, 3], porta-core.js:64; `membranPalette`).

**Was stirbt:**
- Die drei Teile-Tore als offene Primitive: Lyra (bau-vorlagen.js:677), Vitruv (:726), Tier-Tor (:761). Sie bleiben nur als unsichtbare
  Substanz, wie bei `welt_portal`.
- Die drei Tore ohne Membran (siedlung-ort.js:643).

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `teile-tore-third.png`:
  - Vitruv ist ein grauer Quarz-Torus zwischen zwei Holzpfosten.
  - Lyra ist ein Holzrahmen mit 3 Saiten.
  - Daneben steht das Kathedralen-Filigran in Gold und Blau; der Abstand ist sichtbar.
- `spawn-third-alt.png`: Das Tier-Tor besteht aus Holzbeinen mit Balken und einer Kopf-Kugel.
- `genesis-ego-tore.png`: das Niveau der sieben porta-Tore. Quader mit Fuge, goldenes Gitter-Filigran, eine Membran mit dem Panorama des Ziels.

**Ziel-Bild:** Die drei werden porta-Gestalten mit dem Motiv ihres Studios und auf dem Niveau der sieben:
- Lyra-Tor (klang): Joch und Arme einer Leier bilden den Bogen, die Saiten sind Licht-Fäden.
- Vitruv-Tor (koerperstudio): Kreis und Quadrat in Bronze, der Mensch als Relief im Scheitel.
- Tier-Tor (tetrapoda): ein Bogen aus Geweih und Knochen.

Jedes trägt eine Membran mit seinem Ziel-Panorama (`worlds/tor-ziele.json`).

**Vorbild:** die Bilder in Peach's Castle (Mario 64): das Tor zeigt, wohin es führt.

**Membran heute:**
- a-spawn-gtx3, Ego: C*ab ist ROT in L1, 18,64 am Mittag und 10,61 in der Nacht (Soll ≥ 20).
- a-spawn-gtx2, Third: in L2 12,6, nachts 2,6.
- tor-fern und tor-ziel sind in Ego GRÜN.

## Bauen (porta-core additiv; die sieben bleiben byte-gleich)

1. Die drei Gestalten in PRESETS und den Stufen L0–L3 wie die sieben. Saat statt Zufall. Labor = Welt: `worlds/portale/porta.js` zeigt
   sie aus demselben Kern.
2. bau-vorlagen.js: `welt_klang`, `welt_koerperstudio` und `welt_tetrapoda` tragen `studioGestalt` (wie `welt_portal` :1279ff). Ihre
   Teile bleiben unsichtbare Substanz (Tags, Blocker, Auslöser).
3. Die Membran ist bunt in jeder Stufe, die die Station zeigt (L1, L2), und zu jeder Uhr.
   - In der Nacht leuchtet sie nach dem EINEN Licht-Gesetz (`kelvin`, EIN Pool), ohne Sonderweg.
   - Soll C*ab ≥ 20 und milchweiss ≤ 0,05.
4. Die Tore am Kern stehen bei r 22 m und damit in der doppelten Distanz von heute. Wähle die Stufen-Grenzen der Tore aus dem
   Bildschirm-Anteil (`_lodAuge`), damit sie an S1/S2 die Kern-Hülle halten.

## Budget

- **Je Tor:** L1 ≤ 8 000 Dreiecke / 3 Befehle, L2 ≤ 1 500 / 2, Tor-Hülle L0 ≤ 60 000 (haushalt.json genesis `soll`).
- **Alle Tore im Bild an S1/S2, beide Sichten, mit Membranen und Kaskaden:** ≤ 30 Befehle / 80k Dreiecke. Heute zeigt die Ratsche für bau
  Ego 45 / 94k und Third 60 / 143k, bei Ring 11 m.
- VRAM ≤ +0,5 MB für die drei neuen Gestalten.

## Dateien (Besitz)

- porta-core.js
- worlds/portale/porta.js
- stamm/bau-vorlagen.js, nur die Einträge welt_klang, welt_koerperstudio, welt_tetrapoda und ihre Teile-Listen (:677–:800). start_plattform
  gehört ort-plan.
- **NICHT anfassen:** siedlung-ort.js (ort-plan) und das Ring-Gesetz. Die Slots setzt der Plan.

## Wartet auf

- w4-studios-heim2 im main (porta-core.js, porta.js).
- Starte vom Kopf von integ-probe, sobald er gelandet ist.

## Beweis (headless, Zahlen vorher → nachher)

- porta-contract: Dreiecke und Befehle je Stufe der drei, im Budget.
- Golden der sieben byte-gleich. Ein Re-Mint nur für die neuen Gestalten ist ein Vertrags-Akt mit Grund.
- C*ab der Membran-Palette je Stufe und Uhr, gerechnet aus `membranPalette` und `membranUniforms`, im Labor-Rechner ohne Welt-Bild.
- gate:portal-konformanz: jede der zehn Welten ist durch ihr Tor erreichbar.
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator** (Radeon, Standard-Welt, M = 0/0):
- `werkbank umstellen --ort genesis --sicht ego` bzw. `--sicht third`.
- `werkbank bild 0 +1.7 0 0 +2 50 --uhr <0.5|0.3|0> --ist tor-bunt` (S1).
- Dasselbe mit `--ist tor-fern` und `--ist tor-ziel`.
- S3: `bild 0 +1.7 -17 0 +2 22`.
- S4: `bild 0 +1.7 80 0 +2 0`.

**Tor:**
- tor-bunt, tor-fern und tor-ziel sind GRÜN in Ego und Third, nah und fern, zu 0,5 / 0,3 / 0.
- Die Tore-Hülle hält an S1/S2.
- ABAB g-third nicht-langsamer (OMEN).

## Abgabe

- Zweig: w4-tore-teile. Commit-Betreff: „Abgabe w4-tore-teile: …“.
- Bericht in drei Sätzen.
- Liste der GPU-Proben mit Pose und Erwartung.

## Lehren der letzten Abgaben

- **genesis-tore** (4ec9f71d) ist dein Vorbild: Ring-Tore L2 → L1 7/7, Stein mit Gesetz, ABAB nicht-langsamer.
- **mensch-kopf** riss z107: ein Ofen, der eine Gestalt fail-closed nicht liefert, hält die ganze Welt an. Darum: jede Stufe liefert, die
  Vorzug-Probe `playtest:fast` läuft am Kandidaten.
- Das Bild urteilt; die grüne Zahl allein ist kein AAAA. Der Koordinator legt vorher/nachher nebeneinander.

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
