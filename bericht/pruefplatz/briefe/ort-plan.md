Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind hier Lehre 3 (ganz oder gar nicht), 7, 12 (Stamm-Chirurgie), 14, 22 und 25. Der Plan steht
in `%TEMP%/claude/w3/pruefplatz/plan.md`. Der Koordinator legt ihn als `bericht/pruefplatz/plan.md` in den Zweig koordination; lies dort
§1, §2, §4, §5 und §6.

# ORT-PLAN — der Genesis-Ort wird EIN Plan des Ort-Gesetzes, die Plattform fällt ganz (Phase 0, das Rückgrat des Prüfplatzes)

**Pflicht-OFFEN:**
- A: die Stationen S1–S13; jede Klasse steht an ihrem Ort.
- B: der Plan vor dem ersten Chunk; im Kegel nur Billiges.
- E: das Kern-Budget, und das ABAB g-third ist dein Kostenbeweis.

**Chokepoint und was stirbt:**
- Chokepoint ist fachwerk-core `GENESIS_ORT` + `genesisLayout()` → `ortPlan()` → `_ortPlaene` → `_genesisOrt()`.
- Es sterben:
  - `start_plattform`: bau-vorlagen.js:133-149, :1027-1033.
  - `_ensureGenesisPlatform`, `_genesisScheibe`, `_genesisGrund`, `_findOpenSpawnSpot`: gelaende-boden.js:402-477.
  - `_genesisPlattform` (siedlung-ort.js:2132) und `GENESIS_PLATZ` (:3621).
  - Der Ring über `Object.keys(bps)` (:2183-2215) und die Vorschau-Tafel `rows` (:2357-2362).
  - Die Saat-Phase des Start-Dorfs (:2401-2431).

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `genesis-ego-alt.png`: Ego, alter Ring. Die graue Scheibe füllt das untere Drittel, die Tore stehen 6,9 m dicht und seitlich.
- `spawn-third-alt.png`: Third. Die Scheibe Ø 13 m mit hellblauem Quarz-Kern, Tore als graue Platten. Die Abnahme sagte:
  „Plattform verdeckt 27 % im Vordergrund“.
- `genesis-ego-tore.png`: der neue Ring blickt zur Mitte, aber die Scheibe bleibt.

**Ziel-Bild S1** (Ego, Gier 0, nach N):
- Ein Rondell r 10 m. In der Grau-Fassung trägt es noch Belag `weg`; grund bringt später das Kopfstein.
- 11 Speichen und Rasen-Keile.
- T10 (maschine) rechts und T1 (drachentor) links stehen frontal in 22 m, mit Membran.
- Die Mall läuft als Zentralperspektive zwischen 2 × 8 Buchen bis zum Brunnen in 106 m.
- Kein Scheiben-Rand, kein Quarz. Die Tore stehen 12,4 m auseinander.

**Vorbild:** Rondell und Place de l'Étoile; Disneyland-Hub mit EINEM Wienie in der Achse; Peach's Castle (die Bilder sind die Tore).

## Bauen

**0a, eigener kleiner Commit (Zweig w4-genesis-ort-name), vor allem anderen:**
- `_genesisOrt(pos)` = heute `_genesisPortalRing` + `_portalApproachPrefetch`; `_tickGenesisOrt` ruft ihn.
- haushalt.json genesis bekommt `ortTakt: ["_genesisOrt", "_portalApproachPrefetch"]`.
- Das ist die A-Seite des Platz-ABAB, denn das Instrument muss beide Seiten fahren können.
- haushalt.json gehört bis zur Landung von w4-gras-saum diesem Zweig. Fahre 0a erst danach oder im selben Zug wie gras-saum.

**1. fachwerk-core, neuer Abschnitt `GENESIS_ORT`** (am Ende, additiv):
- Die Maße aus plan.md §2 als Daten: Kern r 10, Speichen r 10–20, Ring-Weg 20–24, Tore r 22, 11 Slots a_k = 90° + k · 32,727°,
  Achse k 0, Vorschau r 30, Freiraum r 32, Gürtel 32–55, die Zonen-Flächen, Allee, Solitäre, Mobiliar und die Slot-Tafel Welt ↔ k.
- `genesisLayout(seed, welten)` liefert Plan v1. Ist die Slot-Tafel nicht vollständig, wirft es laut (fail-closed, nie ein Ersatz).
- `ortPlan` nimmt `art:'genesis'`:
  - Der Kreis-Platz wird 4 um 22,5° gedrehte Platten.
  - Speichen, Ring-Weg (11 Sehnen), Mall, Terrasse und Pfade werden Trassen.
  - tore, park, zonen und viertel reicht `ortPlan` durch.
- REIN: Byte-Beweis, dass jeder bestehende Dorf-Plan byte-gleich bleibt (gate:settlement, Plan-Hash Studio = Welt).

**2. Wirt `_genesisOrt` (EIN Leser für Spiel und Werkbank):**
- **Ort:**
  - Ort-Wahl im Ort-Faden am Wunsch 0/0 (`_ortWahl`, gelaende-boden.js:869).
  - Der Erdbau liegt, BEVOR der Chunk-Ring am Spawn baut. Der Spawn-Ruf in gelaende-chunks.js:970-975 ruft `_genesisOrt` statt
    `_ensureGenesisPlatform`.
  - Der Spieler steht an M auf Grund + 1,2 m, Gier 0.
  - `worldMeta.genesisOrt {key, x, z}`; `_genesisMitte()` liest nur ihn.
- **Tore:** an `plan.tore[k]` (Welt → Slot, Gier zur Mitte), idempotent über Stempel und Existenz-Probe wie heute.
- **Vorschau:** aus `plan.tore[k].vorschau`, sie entsteht erst, wenn der Spieler ≤ 14 m vor ihrem Tor steht.
- **Park:**
  - Laternen, Bänke, Brunnen, Bootshaus (fachwerk-Haus bei −60/150), Fels-Formation bei 78/−40, Allee und Solitäre.
  - Phase 0 kennt keinen Inhalt der Sektoren, nur ihre Flächen. Die Flächen sind Grundrisse der EINEN Natur-Wand (`_grundrissVon` →
    `_imGrundriss`, vegetation-baum.js:2057).
  - Jedes Ding trägt `zone`, damit die Zählung je Zone geht.
- **Start-Viertel:**
  - `_autoSettlementStartInfo` liest den Wunsch −95/−165 aus dem Plan.
  - Die Ort-Wahl erhält `frei` = Fußabdruck des Platzes.
  - Alles andere des Start-Dorfs bleibt (fällig, bestellen, Wecker).
- **Wegenetz:** Knoten `genesis` (`_wegenetzNachbarn`).
- **Respawn** (koerper-seele.js:348-369): an M auf Grund + 1,2 m.
- **Prüfbühne:** Wo die Wildnis nicht trägt (`_wildnisTraegt`), legt der Plan nur Kern und Tore. Die Prüfbühne zählt danach weiter 21 Werke.
- **Bestehende Welten** ziehen EINMAL um: die alte Scheibe und die Ring-Tore ≤ 20 m fallen, der Plan legt sich. Nie zwei Formen.
  Spieler-Bauten im Fußabdruck nimmt der Plan nicht. Die betroffene Fläche fällt laut, ihr Zähler steht im Plan.

**3. Abschied ganz (Lehre 3):**
- Definition, Maschine, Spiegel, Tests und Doku fallen in EINER Welle.
- Absenz über `window.__codeOf` für `start_plattform|GENESIS_PLATZ|_genesisPlattform|_genesisScheibe|_genesisGrund|_findOpenSpawnSpot`,
  Kommentare dürfen sie zitieren.

**4. Leser umhängen** (plan.md §6, Nr. 1 und 3–6):
- haushalt.json: Titel; Täter-Regeln (Pflaster = boden, Bänke/Laternen/Brunnen/Bootshaus = bau); `g:start_plattform` fällt aus der Klasse bau.
- diag-ankunft.cjs:
  - D9 mit dem Plan als Anker; die leere Richtung zählt jeden Grundriss.
  - Rundblick und Baum-Fälle stellt die Probe selbst her, sie borgt nie vom Wald (:467-469, :545, :565).
  - dorfFaellig hängt am Start-Viertel.
- diag-v1-pfad V-D1: ein Ort, Ring-Mitte ≤ 1 m, keine Krone über r 32.
- playtest/bild.cjs: der Ort steht und ist idempotent.
- diag-haus-welt W8 (Lichtung → Fußabdruck) und W10 (Start-Viertel).
- diag-tor-fern: Summe und dM für R 22 aus dem Plan, nie fest.
- diag-fahr-leben F1: der GT an jedem Tor außerhalb r 32.
- diag-settlement C5, diag-portal-konformanz, diag-portal-membran, diag-pruefbuehne.

## Budget

- **Kern an S1 und S2, GTX, beide Sichten:** ≤ 45 Befehle, 110k Dreiecke, 6 MB Puffer, 0,3 ms CPU.
  - Heute zeigt die Ratsche für bau Ego 45 / 94k und Third 60 / 143k; der Kern muss in die Hülle.
  - Netto am selben Kopf: VRAM ≤ 0, CPU ≤ 0.
- **Ankunft:** Plan ≤ 50 ms im Faden, ≤ 2 ms auf dem Haupt-Faden.
- **Im Kegel:** kein Akteur, nur Kern, Allee und Brunnen in billigster ganzer Stufe.

## Dateien (Besitz; nichts außerhalb)

- **Code:**
  - fachwerk-core.js §GENESIS_ORT (neuer Abschnitt; die Zeilen `stadt` bekommt später die Zone stadt).
  - stamm/siedlung-ort.js · stamm/gelaende-boden.js · stamm/gelaende-chunks.js (Spawn-Ruf) · stamm/bau-vorlagen.js (nur start_plattform).
  - stamm/vegetation-baum.js (Lichtung) · stamm/koerper-seele.js · spec/profiband/haushalt.json.
- **Leser:** scripts/diag-ankunft.cjs, diag-v1-pfad.cjs, playtest/bild.cjs, diag-haus-welt.cjs, diag-tor-fern.cjs, diag-fahr-leben.cjs,
  diag-settlement.cjs, diag-portal-konformanz.cjs, diag-portal-membran.cjs, diag-pruefbuehne.cjs.
- **NICHT anfassen:**
  - porta-core.js: tore.
  - gelaende-core.js: grund.
  - §WERKE in fachwerk-core.js: werke.
  - dirigent-ankunft.js: ankunft-5.
  - siedlung-wege.js und stoff-material.js: gras-saum/grund.
  - vegetation-wiese.js: gras-saum.

## Wartet auf (Übergaben)

- w4-studios-heim2 im main: fachwerk-core.js, siedlung-ort.js.
- z108 (b-streu): gelaende-boden.js, vegetation-baum.js.
- w4-ankunft-3 (ankunft-heim) und w4-ankunft-5: diag-ankunft.cjs, diag-v1-pfad.cjs.
- w4-gras-saum: haushalt.json.
- Starte den Zweig vom Kopf von integ-probe. Bevor du die Abgabe meldest, merge main.
- **Übergabe an ankunft-5:** Die Terme „das Dorf wird geplant/gegründet“ (dirigent-ankunft.js:1160-1165) halten das erste Bild ohne
  Blick-Prüfung. Melde es; du schneidest es nicht selbst.

## Beweis

**Headless (Zahl vorher → nachher):**
- Plan-Hash Studio = Welt.
- Faden-ms der Ort-Wahl des Genesis-Plans.
- Haupt-Faden-ms von `_genesisOrt` bis zum Spawn.
- Absenz 0.
- `_genesisMitte` = 0/0 ± 1 m in der Standard-Welt (Anker-Wand werkbank.cjs:944-953).
- Die Leser aus Punkt 4 sind GRÜN.
- playtest:fast und der volle Playtest: „Alle Invarianten OK“.
- gate:pruefbuehne: 21 Werke.

**Radeon (lokal, je gpu-lauf ≤ 2 min, Werkbank 4560–4569):**
- `werkbank zaehlen` an S1 und S2, Ego und Third, je Zonen-Marke.
- Ein Bild S1 Ego zur eigenen Kontrolle.

**Für den Koordinator** (Radeon-Bilder und OMEN):
- `umstellen --ort genesis --sicht ego|third` und `bild` an S1 (0/0 → 0/50), S2 (0/0 → −10/0), S3 (0/−17 → 0/22), S4 (0/80 → 0/0),
  S5 (−40/60 → −85/95), S9 (−45/128 → −60/150), S13 (0/−5 → 0/−9), Mittag.
- OMEN: Kalt-Zeile `zug/ankunft-kalt.sh` 3× am 0a-Kopf und am Kopf dieses Zweigs; ABAB g-third + w-ego mit A = 0a und B = dieser Zweig.

**Tor:**
- ABAB nicht-langsamer.
- Kalt-Zeile: Median nachher ≤ vorher.
- Absenz 0.
- Jede Klasse, deren Inhalt es gibt (tor-*, laub, laub-kante, boden-nah, boden-nah-farbe, himmel-licht, haus, fels, mensch/haar Third),
  steht an ihrer Station mit ≥ 0,1 % im Bild.

## Abgabe

- Zweige: w4-genesis-ort-name (0a) und w4-ort-plan.
- Commit-Betreff: „Abgabe w4-ort-plan: …“.
- Bericht in drei Sätzen:
  - geschnitten (Datei:Zeile);
  - gemessen (Zahl vorher → nachher: Faden-ms, Befehle/Dreiecke an S1/S2, Absenz);
  - ehrlich offen.
- Dazu die vier Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **genesis-tore** ist das Muster: Bild vorher/nachher und ABAB nicht-langsamer.
- **mensch-kopf** riss z107 nach 90 min. Darum: `npm run playtest:fast` am Merge-Kandidaten, bevor du meldest.
- **ankunft-3** lief schneller, aber K2 brach. Darum: die Kalt-Zeile zählt K2 mit.

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
