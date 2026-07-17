# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## Stand (V18.486 — DER SPIEGEL-ZENSUS: die Realität ist der Spiegel, der Wirt lernt)

**Die Zensus-Welle (17.07., Schöpfer-Wette bestätigt): 6-Domänen-Matrix
(`docs/zensus-matrix-v18486.md`, 94 Befunde) + Abbau:** das „darf" fiel (Vertrag+
Validator für fx.bewegung/VERHALTEN/ARENA/FAHR.lenkung + SCHWIMM-PARITÄTS-WAND) ·
REALITÄTS-EICHUNG (Gehen 1.5 m/s · sprintMul-Gesetz 4.5 · Sprung 0.53 m · g 9.81
überall · Klettern 0.6 · Schwimmen 1.0/speedMul 0.85/leanSoul; gesetz-relative
Speed-Floors; vmax-Anker des Ritts; 10 Playtest-Bänder gewandert) · STEIGUNGS-
DREIKLANG (Hangabtrieb + Gelände-Nick/Wank im Ritt + Probestrecken-Hügel aus EINER
bodenY-Quelle) · KAMPF-ZENSUS (Hieb-Geometrie/Stoß/Kipp/Pfeil-Flug→ARENA, Kampf-
Quartett→koerper-Koeffizienten, die tote Waffen-GÜTE erreicht den Schaden) ·
KREATUR-ZENSUS (Jagd/Furcht/Temperament/Wandern→tetrapoda-VERHALTEN, Gegenwehr =
EINE Reichweite) · GENESIS-PORTAL-RING (alle Welt-Portale im Kreis R 11 m um den
ersten Spawn, doppelt idempotent). OFFEN: Matrix-Rest (bewegung-Rest/welt/
fahrzeug-Rest, roadmap §0c) · Konsum-Wächter (gate:konsum-bilanz — Export>Import
wird Lern-Liste statt stillem must-ignore; benannt, nächste Welle).

Davor V18.485 — DIE WARME MASCHINE: aus der eigenen Telemetrie gebaut.

**Die Ultracode-Welle (16.07.): die eigenen Messwerkzeuge (Hitch-Telemetrie + Selbstspiel)
nannten die Hebel, der Wander-Zensus entschied, alles GEMESSEN:** DER PIPELINE-WARM-OFEN
(das V18.367-Loch: gewärmt wurde PLAIN, konsumiert wird InstancedMesh+Fassade+Tint/
BatchedMesh — andere Pipeline-Keys, ~15.8 Sync-Kompilate/s IM SPIEL; jetzt merkt
`_pipeOfenMerke` an den zwei Gruppen-Münz-Chokepoints jede neue Familie und
`_pipeOfenTick` wärmt 1 Posten/Frame unter Budget mit der LEBENDEN Gruppe [Key matcht
exakt] durch den EINEN `_warmCompilePipeline`; gate:hitch-telemetrie Band 7: 11 Familien
gemünzt→gewärmt→Queue 0, Trace trägt pipelines.ofen*) · DIE RÜCK-WANDERUNG (Wander-
Zensus: 1 km Wandern ⇒ 14.8M GEFRORENE private L1-Boden-Tris [B2-Einweg-Freeze, ~9×
die sichtbare steady-Last]; Wurzel-Fix: die Null-Skala ERBT die Instanz-Position
[der Ursprungs-Sphere-Hazard fällt, WEGEN dem B2 existierte] + Demote-Gate im LOD-Tick
[nur → Fern-Stufe, Fade-Marge; Promotions bleiben Region-Lifecycle]; GEMESSEN
14.8M→4.4M [−70 %; Rest = einstufige geroell-Buchhaltung, gleiche Geometrie je Stufe];
gate:scatter-lod +4 D-Bänder, scatter-ab/slice byte-grün) · MULTI-SEED-SPIEGEL
(gate:dritter-spiegel sweept 3 Welten in EINEM Boot — chirurgische Regenesis der 6
seed-abhängigen Größen [wm.macro-ERBGUT fällt mit, sonst gewinnt es über den Seed];
alle in mm-Klasse: meanAbs 0.47/0.86/0.94 mm) · ERLEBNIS-RESTE (Rutsch-Pose aus
koerper-core `parkour.slidePose` [Überschreib-Schicht NACH dem Rig-Grundlauf, nur der
lokale Spieler] · Bogen-Auszug-HUD [vierte Stats-Row, `_tickBogenZug` frame-genau]).

Davor V18.484 — DAS FELD ZEICHNET, DER GRUNDSTEIN: der Renderer wird ein Leser des Feldes.

**Die Schöpfer-Vision (16.07., normativ `docs/das-feld-zeichnet.md`): die Welt ist eine
FUNKTION, kein Sack — Render-Kosten binden an den SCHIRM, nicht an die Welt. V18.484
gießt den Grundstein, alles GEMESSEN:** DER DRITTE SPIEGEL (`feld-wgsl.js` +
`gate:dritter-spiegel`: das Terrain-Makro-Gesetz komplett in WGSL, GPU trifft f64-JS auf
meanAbs 0.86 mm/p95 3.1 mm/max 8.3 mm über 5184 Proben; SEH-Spiegel, nie Physik-Wahrheit;
Tabellen/Overlays aus den LEBENDEN Quellen) · HITCH-TELEMETRIE (`gate:hitch-telemetrie`:
LongTasks·GC-Ring·Pipeline-Compiles·Upload-Bytes-Tap [queue.writeBuffer-Wrap, vendor
byte-alt] in Flugschreiber/Panel/Trace — fing sofort 4.2-s-LongTask + 153 Pipeline-
Compiles im Boot) · DAS FELD URTEILT (Dither-Wal: Nicht-Baum-Scatter ALLER Stufen
region-gekeyt → `@s:`-Super-Region-Cull; nie-geculltes Foliage 3.14M→1.74M Tris [−43 %];
gate:scatter-ab byte-grün) · WARM-START (`gate:warm-start`: uneditierte Chunk-Bytes in
IDB [Foundry-Disziplin, VERSION|genVersion|anker-Stempel], zweiter Boot ~1.7×, Byte-
Gleichheit per FNV, Edit-Bypass ehrlich) · FERN-RING (`gate:fern-ring`: 3 Schalen bis
8 km aus `_terrainMacroSurfaceY(x,z,false)`, welt-gesnappt, budgetiert, quantisiert;
Höhen==Gesetz worst 0.0000). SELBST GESPIELT (ich-spiele-Sonde, echtes WebGPU: steady
1.66M Tris/40 dc [alt 20–26M/1733]) — zwei Sicht-Blocker gefunden+gefixt: KAMERA-KLIPPE
(camera.far 1000 clippte die 8-km-Schalen → Ring-eigene Weitung + Dispose-Rücknahme) ·
HÖHEN-ÖFFNUNG (fog.far öffnet sich NUR über der Umgebung [4 takt-gecachte Proben,
FERN_RING.oeffnung*]; Waldboden byte-alt — Schöpfer-Wort geehrt). OFFEN benannt:
Stufe-2-Vollausbau (GPU-Cull/indirekte Draws + Fullscreen-Feld-Pass) NUR nach
Trace-Urteil (roadmap §0b) — Ofen/Rück-Wanderung/Multi-Seed fielen an V18.485.

Davor V18.483 DIE GEFÜHLS-NAHT (die Erlebnisräume der Studios erreichen die Welt,
sechs Wellen, Kerne rein additiv: Dorf-in-Terrain [Footprint-Höhe + `_archFundamentBox`
= EINE Wahrheit für Blocker+Podest] · Schwimm-Heimat [`fx.bewegung.schwimmen`] ·
Kreatur-Leben [Körper-Zustand führt die Motion-Brücke + `fx.verhalten` 12 Aktionen/
6 Stimmungen, FNV-deterministisch] · Arena-Gefühl [`ARENA`: energie-skalierter
Hit-Stop, Bogen-Vereinigung + Auszug] · Fahr-Gefühl [`FAHR.lenkung`: fahrzeug-eigener
Ritt, Drift] · Parkour [`fx.bewegung.parkour`: Wand-/Doppelsprung, Klettern, Rutsch];
benannt-offen: Fahrzeug-Billboard-LOOK + P2P-Kreatur-Gestalt · klang ohne Stufen-Zeile
[meshfrei] · Kreatur-Aktions-Feinschliff; Detail = git log) ·
V18.482 DIE VERBINDUNGEN (Dörfer 0.1→7/km² + Start-Dorf · Submit-Wal: CPU
4.28→1.23 ms, dc 1566→0 in der Sonde · Physik byte-paritätisch + Bogen-Verb komplett) ·
V18.481 ERLEBNIS-VOLLENDUNG (T2 Kaskaden 32→30M · T3 Bundles · T4 Fell×Fläche · T6
Körper-UI · T7 Boden) · V18.480 KANON (35 Alt-Doppel→0, Werkstatt-LOD-Knöpfe daten-
getrieben) · V18.479 ERLEBNIS-ZIEL (roadmap §0.0 normativ + T0 AUGEN [`npm run blick`:
echtes WebGPU headless via swiftshader-Vulkan] + T1 Blob-Tod + T2 Messung) · V18.478
NAHT-VOLLENDUNG (P2P-Gestalt · Reload-Treue · §8.5-Stufenzeile · Bäcker-ov) · V18.477
NIVEAU-VOLLENDUNG (Prägung-Welt · Fahrzeug-Fernstufe · Tier-Hysterese · Studio-
Übergabe) · V18.476 ORAKEL-UMSETZUNG (acht Tier-1-Linsen; Detail = git log). Der Bogen
darüber: **der Schöpfer spielt V18.483, der Flugschreiber-Trace urteilt** (GPU echt +
Tri-Zensus, POSTet automatisch → committen; V18.481-Trace maß noch 96.9 ms CPU-Render
VOR dem Submit-Wal-Fix). OFFEN daneben: Kommentar-Diät des Stamms (roadmap §0) ·
typeof-Ratchet (nur-sinkend) · Abnahme-Drehbuch (look-golden --mint · DoD 5) ·
Bogen-1-Rest (Kreatur-GPU-Skinning, roadmap §0.5).

## Architektur (die Karte)

- **Stamm** `anazhRealm.js` (~91k, EINE Klasse, `npm run atlas` = 26 Zonen): Boden (Chunks/Wasser/
  Genese/Ökologie) · Speicher (Snapshot/Taille) · Spieler (Seelen/Bewegung/Werkstatt/Ökonomie) ·
  Anschluss (P2P/Portale) + die Verben (appear·place·body·drive·wield·portal·rule) + KIND_POLICY.
- **Kerne** (10, cores.manifest.json): reine Daten+Mathe; Vertrag v1.2 = `PARAMS_BY_KIND` + must-ignore
  + fail-closed (`docs/studio-vertrag.md`). Der Host ist der OFEN (bauMensch-/bauTier-Guss + Lofi).
- **Worker:** Foundry (= terrain-Brücke; Kanäle `get-book` 1×Boot · `build-asset(id,seed,lod,ov)` ·
  `export-settlement`; IDB disk-first, SHA-Stempel der Quellen) · voxel-worker (bit-identischer
  Spiegel).
- **Server:** save-server (state/.bak · perf-trace · llm-proxy · vendor) · signaling (WS→WebRTC;
  Kanäle pos·input-Lockstep·dsl·soul·vibe).

## Die tragenden Lehren

1. **Gesetz #0:** EINE kanonische Größe je Domäne, alle LESEN sie; nach jeder Fehler-Klasse die
   LINSE bauen (Gate/Verdikt), nie auf Wachsamkeit bauen.
2. **EINE Quelle, kein Parallelpfad;** Invarianten in den CHOKEPOINT, nicht an Aufrufer.
3. **Ganz oder gar nicht:** Abschied = Def+Maschine+Spiegel+Tests+Doku in EINER Welle, physisch.
   must-ignore gilt FREMDEN Artefakten (Taille), nie dem eigenen System. `gate:altlasten` wächst mit.
4. **Ich entscheide, geliefert wird Gebautes** — der Schöpfer wertet Ergebnisse, nie Optionslisten;
   Bericht = drei Sätze, kein Theater. Ein benannter Fehler → die ganze KLASSE in derselben Welle.
5. **Miss zuerst, die Zahl führt;** verifiziere KONSUM, nicht Existenz; SPIELEN/sehen vor behaupten
   (headless beweist Mechanik, nie das Erlebnis; swiftshader-Screenshots sind farbtreu —
   schauen schlägt greppen).
6. **Tests wandern mit dem Code;** Absenz-Greps über `window.__codeOf` (Kommentare zitieren).
7. **Worker-Spiegel bit-identisch** (Main ↔ voxel-worker; jede Sheet-/Density-Änderung in BEIDE +
   `diag-worker-watersheet` maxDiff 0). Welt-Substanz zieht aus Γ5-Seed-Streams, nie Math.random.
8. **Spawn-Affinität ist TAG-NEUTRAL** (winner-take-all; die Tiere sind bewusst tag-identisch —
   Differenzierung über die Größen-/Gattungs-Achse, nie über Tags).
9. **`gate | tail` maskiert Exit-Codes** — Exits IMMER explizit (`echo EXIT=$?`).
10. **Jede versionierte Datei braucht den `?v=`-Cache-Buster** (Worker/Bootstrap/importScripts).
11. **Studio-Code nur unter BYTE-BEWEIS anfassen** — die Benchmark bewegt sich nie; Goldens sind
    eingefroren, ein Re-Mint ist ein begründeter Vertrags-Akt. Kerne leben AUSSERHALB des
    format:check-Scopes — nie `prettier --write` auf Gesetzbücher (verbatim-Blöcke!), neue
    Abschnitte rein additiv. `__`-Schlüssel in ov sind STEUER-Passagiere (nie in Bau-Parameter).
12. **Monolith-Chirurgie:** `cut-method` (AST-sicher) · sofort `node --check` + eslint ·
    seriell committen, nie Batch; worktree-Agenten zweigen von main ab.
13. **Der Loop/Regler:** Streaming ist heilig (prio 0), Bewegung hängt nie am Render-Signal;
    EIN PID, Totband 59–77 fps; NaN-Wände vor jedem EWMA-Gedächtnis; Existenz vor Framerate —
    der Ring wächst bis `RING_EXIST_FLOOR` OHNE fps-Gate, der PID atmet nur darüber.
14. **Schwere deterministische Arbeit:** gecacht + im Idle vorgebacken + frame-adaptiv, nie synchron
    auf dem Interaktions-Pfad.
15. **git ist das Archiv:** kein Doppel-Archiv im Baum — Chronik = Commit-Messages, vollendete
    Pläne fallen (git trägt sie), dauerhafte Lehren = EINE Zeile hier, Offenes = roadmap §0.
    Vor jedem Datei-Schnitt: KONSUM prüfen (Gates/CI/Docs, transitiv), nicht Existenz raten.

## Workflows

Dev-Loop: `npm run playtest:fast` (~20 s) · Merge-Gate: `npm run playtest` (Verdikt
„Alle Invarianten OK" zählt, nie der Zähler) · Statik: `npm run check` (inkl. source-probes ·
constitution · studio-vertrag · altlasten · apparat) · `npm run lint` / `format:check` ·
Navigation: `npm run atlas` (+ `--find <regex>`). Gates je Domäne: `gate:*` in package.json.
Commits klein + thematisch, emoji-frei, deutsch — **die Message ist der Chronik-Eintrag**;
Push auf den Feature-Branch; PR nur auf Wunsch.

## Doc-Map (die EINE Karte: docs/README.md)

`docs/roadmap.md` §0 = was offen ist (+ Narben · Teilsysteme · Samen/gemerkte Fäden) ·
`docs/studio-vertrag.md` = die Naht (normativ) · `docs/taille-spec.md` = die Taille (normativ) ·
`docs/neues-kleid-verfassung.md` = die Pipeline-Verfassung (normativ) ·
`docs/das-lebendige-feld.md` = der wahre Norden (vor Feld/Emotion/Nexus/DSL zuerst) ·
`docs/state-of-realm.md` = Vision · `docs/abnahme-drehbuch.md` = die EINE Schöpfer-Runde ·
Chronik + alles Gefallene: `git log`.
