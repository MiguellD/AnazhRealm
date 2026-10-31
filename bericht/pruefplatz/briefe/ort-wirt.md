Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 3 (ganz oder gar nicht), 6, 7, 12 (Stamm-Chirurgie), 14, 22, 24 und 25. Der Plan steht in
koordination `bericht/pruefplatz/plan.md` (§2, §3, §4, §6, §7, §9). Du arbeitest LOKAL: die Grau-Fassung muss gesehen werden, und der
Zweig ist Stamm-Chirurgie.

# ORT-WIRT (0c) — der Wirt liest den Genesis-Plan, die Plattform fällt ganz, der Plan rechnet im ersten Faden-Auftrag (Phase 0, Tor 0)

**Pflicht-OFFEN:**
- A: die Stationen S1–S11 stehen in der Welt; jede Klasse, deren Inhalt es gibt, ist an ihrer Station im Bild.
- B: der Plan ist der erste Auftrag des Voxel-Fadens; im ersten Bild kommt kein neuer Stoff dazu.
- E: an S2 Δ ≤ 0 in Befehlen, Dreiecken, VRAM und CPU-Takt (ABAB 4+4, A = w4-genesis-ort-name).

**Chokepoint:** `_genesisOrt(pos)` — der EINE Leser des Plans, den Spiel und Werkbank gleich fahren.

**Was stirbt:** 9 Namen in 29 Dateien mit 104 Treffern, in EINER Welle (Definition, Maschine, Spiegel, Tests, Doku):
`start_plattform|GENESIS_PLATZ|_genesisPlattform|_genesisScheibe|_genesisGrund|_findOpenSpawnSpot|_ensureGenesisPlatform|_genesisPortalRing|genesisPortalRing`.

| Datei | Zeilen |
|---|---|
| stamm/gelaende-boden.js | 399–463 (Spirale, Scheibe, Grund, `_ensureGenesisPlatform`) |
| stamm/siedlung-ort.js | 2126–2133 (`_genesisMitte`, `_genesisPlattform`), 2176–2220 (Ring über `Object.keys(bps)`), 2357–2362 (Vorschau-Tafel `rows`), 2790, 3618–3621 (`GENESIS_PLATZ`) |
| stamm/gelaende-chunks.js | 966–975: Spawn-Ruf samt fail-soft `try/catch` „Genesis-Plattform fehlgeschlagen“ |
| stamm/bau-vorlagen.js | 1025–1033 und die Teile von `start_plattform` |
| stamm/koerper-seele.js | 348–359 (Rückkehr am Genesis-Anker) |
| stamm/vegetation-baum.js | 1942, 2069 (Lichtung aus `GENESIS_PLATZ`) |
| scripts/diag-v1-pfad.cjs | 927–931, 960–962, 1095–1106, 1135, 1215, 1450, 1969, 2696–2697 |
| scripts/diag-haus-welt.cjs | 1160–1161, 1196–1197, 1211, 1353 |
| scripts/playtest/bild.cjs | 876–881, 914 |
| scripts/diag-settlement.cjs | 2026–2043 |
| scripts/diag-pruefbuehne.cjs | 270, 583, 1084 |
| scripts/diag-werkstatt-weg.cjs | 352, 359, 920 |
| scripts/diag-asset-inventory.cjs | 19, 176, 183 (Entscheid E-F) |
| scripts/diag-ankunft.cjs | 1080, 1577 |
| scripts/diag-nervensystem.cjs | 66, 209 |
| scripts/lib/kampf-proben.cjs | 3109, 3176 |
| spec/haus-welt/defekte.json | 124–125 |
| spec/profiband/haushalt.json | 91, 590 |
| spec/stamm/modul-karte.json | 67, 83 |
| je eine Zeile | diag-fahr-leben.cjs:1254 · diag-portal-konformanz.cjs:757 · diag-weltgrenze.cjs:193 · omen-messfolge.cjs:1222 · playtest/bau-buch.cjs:48 · playtest/speicher.cjs:148 · werkbank.cjs:926 · spec/profiband/probe-1110-12.json:1277 · docs/abnahme-drehbuch.md:37 · .claude/skills/anazh-lehren/SKILL.md:40 |

Zieh den Grep vor dem Start neu am Kopf; die Zahl im Bericht ist die am Kopf.

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `genesis-ego-alt.png`, `spawn-third-alt.png` — die Scheibe und der dichte Ring.
- `genesis-ego-tore.png` — der Ring blickt zur Mitte, die Scheibe bleibt.

**Ziel-Bild S1** (Ego, 0/0 → 0/50, Mittag):
- Ein Rondell r 10, in der Grau-Fassung mit Belag `weg` (das Kopfstein bringt grund), dazu 11 Speichen und Rasen-Keile.
- T1 (drachentor) links und T10 (geisttor) rechts stehen frontal in 22 m.
- Die Mall läuft als Zentralperspektive zwischen 2 × 8 Eichen.
- Kein Scheiben-Rand, kein Quarz, keine Laterne und keine Bank im Ankunftsblick.

**Vorbild:** Place de l'Étoile, Disneyland-Hub, Peach's Castle.

## Bauen

1. **Der Plan im Faden** (Lehre 14, 24):
   - Der Voxel-Faden rechnet `genesisLayout` + `ortPlan` als ersten Auftrag nach der Heimat-Hydrosphäre (gelaende-chunks.js:960-962),
     `fest` an 0/0, ohne Ring-Suche, ohne Ort-Faden, ohne Warten auf Hydro-Kacheln. Heute warten `_ortWahlImFaden` und `_nebenFaden`
     darauf (gelaende-boden.js:901-911, gelaende-chunks.js:363-392).
   - Trägt das Gesetz an 0/0 den Kern nicht, rückt der Ort nach der Regel von `_findOpenSpawnSpot` — als reine Funktion im Faden auf
     Dichte und Kern-Spiegel.
   - Der Erdbau steht im Faden-Zustand, bevor ein Chunk des Spawn-Rings rechnet.
   - Plan v2 per Transfer an den Haupt-Faden; `worldMeta.genesisOrt {key, x, z}`.
2. **Der Spawn-Ruf** (gelaende-chunks.js:966-975):
   - `_genesisOrt`; das `try/catch` fällt, ein Wurf meldet laut über `_bruchMelden`.
   - Der Spieler steht an M auf Grund + 1,2 m, Gier 0.
3. **`_genesisOrt(pos)` liest nur den Plan:**
   - **Tore** an `plan.tore[k]` mit Gier zur Mitte, idempotent über Stempel und Existenz-Probe wie heute.
   - **Vorschau** aus `plan.tore[k].vorschau`, erst ≤ 14 m vor ihrem Tor.
   - **Ausstattung:**
     - S1 vor der Kontrolle: 4 Kern-Laternen, 4 Bänke, alle außerhalb des Ankunftskegels.
     - S2 nach der Kontrolle über den Weg von `_bootDeferCreatures` (gelaende-chunks.js:966 → `_tickBootPhase3`): Brunnen,
       Terrassen-Laternen, Fels, Arten-Saum, Bootshaus.
   - **Bäume** mit `art` je Zeile und der Kappe des Plans (heute Eiche/Birke, Kappe 12: siedlung-ort.js:1669, :3558); Dorf-Pläne ohne
     `art` bleiben byte-gleich.
   - **Flächen:** die erklärten Flächen (`zonen`) sind Grundrisse der EINEN Natur-Wand (`_grundrissVon` → `_imGrundriss`) — kein
     Feld-Wurf auf Ufer, Wiese, Bootshaus-Hof, Zoo-Fläche und Wege-Korridoren.
   - **`_genesisMitte()`** liest nur `worldMeta.genesisOrt`.
   - **Start-Viertel:** `_autoSettlementStartInfo` (siedlung-ort.js:2400-2431) liest den Wunsch r 190 auf 253,6°, die Ort-Wahl erhält
     `frei` = Fußabdruck des Platzes. Fällig, Bestellen und Wecker bleiben.
   - **Wegenetz-Knoten** `genesis`. **Respawn** (koerper-seele.js:348-359) an M auf Grund + 1,2 m.
   - **Prüfbühne:** wo die Wildnis nicht trägt (`_wildnisTraegt`), nur Kern, Tore und die 8 Kern-Werke.
4. **Umzug bestehender Welten** (EINMAL): die alte Scheibe und die Ring-Tore ≤ 20 m fallen, der Plan legt sich. Spieler-Bauten im
   Fußabdruck nimmt der Plan nicht; die Fläche fällt laut, ihr Zähler steht im Plan. Nie zwei Formen.
   - Der Umzug nennt keinen alten Namen im Code: ein Eintrag ohne Bauplan fällt beim Laden laut mit Zähler, ein Tor neben seinem Slot
     rückt auf ihn (Existenz-Probe des Plans), ein unbekannter worldMeta-Schlüssel fällt beim nächsten Speichern.
5. **Abschied** (Tabelle oben) samt Absenz über `window.__codeOf` und je einer Zeile der 9 Namen in gate:altlasten
   (scripts/diag-altlasten.cjs `FORBIDDEN`, Lehre 3: die Wand wächst mit). `werkbank.cjs:926` wartet auf `worldMeta.genesisOrt`; die Anker-Wand
   (:944-953) prüft 0/0 ± 1 m.
6. **Der Entscheid E-F** (diag-asset-inventory.cjs:19, docs/abnahme-drehbuch.md:37): Das Schöpfer-Wort vom 31.10. („der platz aus alten
   klopfsteinen, statt diese komische plattform“) hebt ihn für die Plattform auf; die fliegenden Inseln bleiben.
7. **haushalt.json genesis:**
   - der Titel nennt den Plan;
   - die Täter-Regel bau ohne `start_plattform` (:590);
   - die `soll`-Zeilen aus dem Spike S0 (Tore R 22 in L2 im Bild, L3-Wurf je Tor, Kern-Werke) wie die „Tor-Hülle“ (:94-101).
   Der Plan führt keine eigene Hülle.
8. **Ab Welle d bist du der Besitzer der Haken** (siedlung-ort.js, §GENESIS_ORT-Daten, haushalt.json). Die Zonen grund, gehege und
   bewohner schicken dir ihre Zeilen; du setzt sie.

## Budget

- An S1 und S2, Ego und Third: Δ ≤ 0 in Befehlen, Dreiecken, VRAM und CPU-Takt gegen w4-genesis-ort-name (ABAB 4+4, unter 2σ).
  - Es fallen die Plattform, der Ring R 11, 4 residente Vorschauen und der Wald im Freiraum r ≤ 32.
  - Es kommen die Tore R 22, 4 Laternen, 4 Bänke, die Allee als Karte und die residenten Park-Zonen (§4: an S2 Kern, Allee, Terrasse,
    Teich, Wiese, Fels, Saum, Bootshaus, Start-Viertel).
- t(Plan) ≤ 50 ms im Faden, ≤ 2 ms Haupt-Faden beim Empfang.
- Vor dem Bild 0 neue Programme (Kalt-Zeile).

## Dateien (Besitz; in Folge nach §9 des Plans)

- **Code:**
  - scripts/diag-altlasten.cjs (nur die 9 Zeilen in `FORBIDDEN`);
  - stamm/siedlung-ort.js, stamm/gelaende-boden.js, stamm/gelaende-chunks.js (Spawn-Ruf), voxel-worker.js (der erste Auftrag);
  - stamm/vegetation-baum.js (:1942, :2069), stamm/koerper-seele.js (:348-359);
  - stamm/bau-vorlagen.js (nur `start_plattform`; erst nach der Landung von tore);
  - spec/profiband/haushalt.json, spec/stamm/modul-karte.json.
- **Leser:** alle Dateien der Tabelle oben; scripts/werkbank.cjs nur :926 und die Anker-Wand, erst nach der Landung von mess-1.
- **NICHT anfassen:**
  - fachwerk-core.js bis zur Landung von ort-gesetz;
  - porta-core.js (tore), gelaende-core.js (grund), dirigent-ankunft.js (ankunft-5);
  - siedlung-wege.js und stoff-material.js (grund, gras-saum), vegetation-wiese.js (gras-saum);
  - kreatur-* (gehege), siedlung-bewohner.js (bewohner).

## Wartet auf (gelesen aus den Dateilisten der laufenden Zweige, 31.10.)

- w4-genesis-ort-gesetz im main (der Plan).
- w4-studios-heim (148 Dateien): siedlung-ort.js, werkbank.cjs, omen-messfolge.cjs, playtest/speicher.cjs, diag-ankunft,
  diag-asset-inventory, diag-fahr-leben, diag-haus-welt, diag-nervensystem, diag-portal-konformanz, diag-pruefbuehne, diag-settlement,
  diag-v1-pfad, diag-weltgrenze, diag-werkstatt-weg.
- w4-ankunft-3 und w4-ankunft-5: diag-ankunft, diag-v1-pfad, diag-boot-stage.
- w4-verkehr-c: diag-ankunft, diag-fahr-leben, diag-v1-pfad, diag-werkstatt-weg.
- w4-stadt-takt (4 Commits, ungemergt): diag-ankunft, diag-pruefbuehne, diag-settlement, diag-werkstatt-weg, lib/kampf-proben.
- w4-gras-saum: haushalt.json.
- mess-1 (werkbank.cjs) und tore (bau-vorlagen.js).
- Starte vom Kopf von integ-probe; merge main, bevor du meldest.
- **Übergabe an ankunft-5:** Die Terme „das Dorf wird geplant“ (dirigent-ankunft.js:1161) und „das Dorf wird gegründet“ (:1166) halten
  das erste Bild ohne Blick-Prüfung. Melde es; du schneidest es nicht selbst.

## Beweis

**Headless (Zahl vorher → nachher):**
- Absenz der 9 Namen = 0 (Treffer am Kopf → 0).
- t(Plan) im Faden in ms.
- Haupt-Faden-ms von `_genesisOrt` bis zum Spawn.
- `_genesisMitte` = 0/0 ± 1 m in der Standard-Welt.
- Migrations-Probe (playtest/speicher.cjs): ein alter Stand mit Scheibe, Ring R 11 und Voxel-Edits wird EIN Plan, die Edits bleiben, 0
  Scheiben und 0 Tore ≤ 20 m alter Form.
- gate:pruefbuehne zählt die Werke aus dem Plan (7 Prüfkörper + 10 Tore + 8 Kern-Werke = 25).
- Die Leser der Tabelle sind GRÜN; die Posen-Linse (ort-gesetz) ist GRÜN am Plan.
- `npm run playtest:fast` und der volle Playtest: „Alle Invarianten OK“.

**Radeon (lokal, je gpu-lauf ≤ 2 min, Werkbank 4560–4569, punkte 8020):**
- `werkbank zaehlen` und `werkbank puffer` an S1 und S2, Ego und Third, je Zonen-Marke.
- Ein Bild S1 Ego für das eigene Auge.

**Für den Koordinator:**
- Bilder an S1, S1L, S1M, S2, S3, S4, S5, S7, S7f, S9, S9f, S11 in Ego und Third zu Mittag (Posen aus `stationen`).
- OMEN: ABAB g-third + g-ego mit A = w4-genesis-ort-name und B = dieser Zweig, 4+4; Kalt-Zeile 4+4 mit t(Plan), t(Weltbild),
  t(Kontrolle).

**Tor 0:**
- ABAB nicht langsamer; Kalt-Zeile nicht schlechter, K2-halb ≤ vorher, 0 neue Programme vor dem Bild.
- Absenz 0, Posen-Linse GRÜN, Migration GRÜN.
- Jede Klasse, deren Inhalt es gibt (tor-* L1/L2, laub, laub-kante, boden-nah, boden-nah-farbe, himmel-licht, haus, fels, mensch/haar
  Third), steht an ihrer Station mit ≥ 0,1 %.

## Abgabe

- Zweig: w4-genesis-ort-wirt. Commit-Betreff: „Abgabe w4-genesis-ort-wirt: …“.
- Bericht in drei Sätzen:
  - geschnitten (Datei:Zeile, Treffer → 0);
  - gemessen (t(Plan), Befehle/Dreiecke/VRAM an S1/S2 vorher → nachher, Kalt-Zeile);
  - ehrlich offen.
- Dazu die vier Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **genesis-tore** ist das Muster: Bild vorher/nachher, ABAB nicht langsamer.
- **ankunft-3** lief schneller, aber K2 brach. Darum zählt die Kalt-Zeile K2 mit.
- **b-streu:** ein Faden-Schnitt trägt erst, wenn er am echten Gerät gemessen ist.
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
