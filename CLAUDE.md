# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## Stand (V18.470 — DIE KONSUM-MATRIX: Gattung × Facette, gemessen statt geglaubt)

**Die Schöpfer-These „die meisten Konsume sind gleich" ist jetzt eine MASCHINE**
(`gate:konsum-matrix`): 9 Gattungen × 8 Facetten (LODs·Rahmen·Bewegung·Material·Körper·
Platzierung·Anwendung·Dynamik), Vertragsseite über die ECHTE Pipe (Harness jetzt
manifest-getrieben = Produktions-Boot, alle 107 Rezepte aller Kerne im Buch; Daten-Kanal-
Goldens begründet re-gemünzt, 52 Geometrie-Goldens byte-unberührt) + Weltseite über
verifizierte Chokepoint-Proben. 55 Zellen verankert (nur-wachsend), 21 Differenzen benannt.
**Die größten gemessenen Lücken (Korrektur nach Voll-Vertrags-Lesung — zusatzKindStages
zählt mit):** (1) die LOD-LEITER: haus [0,1,2] EHRLICH (3 distinct durch die Pipe) ·
fahrzeug/tor/klinge [0] = bewusstes Vertrags-Urteil (Wirt gradiert; Tor-Impostor gebaut
V18.465, Fahrzeug-Fernstufe offen: gt=328 Meshes auf jede Distanz) · kreatur/koerper/klang
tragen GAR KEINE Stufen-Zeile (wolf=81 Meshes, kein Geometrie-LOD für mensch/tier);
(2) die BÄCKER-VEREINIGUNG ist GEBAUT — beidseitig (V18.471): der RTT-Nachbau
(`_bakeImpostorAtlasRTT` + Blit/Dilate/Szenen) fiel physisch; `_tickImpostorBake` konsumiert
`bake-impostor`, `_applyStudioImpostorPayload` malt die vertikal-gestapelten bottom-up-Pixel
Y-geflippt in den horizontalen Atlas + übernimmt den Studio-Rahmen (EINE Quelle, ATOMIC-Swap,
`_reframeImpostorFlat` für instanzierte Quads); Studio-Seite worker-tauglich (OffscreenCanvas-
Renderer, innerWidth-Guard; `gate:baecker-kanal` = Live-Beweis: voller 8-Winkel-Atlas im
Worker). Review-Ernte gefixt: M1 Kind-Wächter + NICHT-LEERE-WAND (ein Zweit-Kern-Preset —
Tor — bäckte im Pflanzen-Bäcker eine LEERE Karte als „Erfolg" → ferne Tore fallen jetzt ehrlich
auf die Skelett-Silhouette, Zensus ehrlich; die Zweit-Kern-Bäckerei im Studio ist der benannte
Folgeschritt) · M2 Bake-Subjekt = Welt-Baum (ov reist VERBATIM — vorher Studio-Wald-Konstanten
→ Karte≠Baum-Pop am 40-m-Crossfade). Disziplin blieb: 1 Bake in Flug · Watchdog · 3×-Retry ·
Zensus · headless bäckt nie.

Der Bogen darüber ist der **Schöpfer-Browser-Befund (14.07., roadmap §0.1):** Erstarren
(nach Reset kurz spielbar, friert wiederkehrend — CPU-Hälfte entlastet: `gate:erstarren`,
Membran-Recompile-Wand V18.469; **die GPU-Hälfte braucht `anazhRealmPerf.json` vom echten
Holz**, der Flugschreiber POSTet beim Spielen automatisch → committen, der Trace trägt den
Impostor-Zensus) · Baum-L2 = Blobs · Regler-Blueprints + LOD-Leitern je Gattung ·
Straßensystem/Stadtpflanzung/Fahrzeugphysik/Schwertschwung-Tiefe. Davor V18.468
Informations-Diät (git ist das Archiv, Lehre 15) · V18.467 Rinden-Vereinigung · V18.466
Charakter-Achsen · V18.465 lebendige Tore · V18.464 volle Passage (Detail = git log).
OFFEN daneben: Kommentar-Diät des Stamms (roadmap §0) · typeof-Ratchet (nur-sinkend) ·
das formale Abnahme-Drehbuch (look-golden --mint · DoD 5).

## Architektur (die Karte)

- **Stamm** `anazhRealm.js` (~88k, EINE Klasse, `npm run atlas` = 26 Zonen): Boden (Chunks/Wasser/
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
