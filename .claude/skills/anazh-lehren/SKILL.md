---
name: anazh-lehren
description: Die tragenden Lehren 1–27 von AnazhRealm (die Anker, die der Code als „Lehre N" zitiert), die Architektur, die Quelle je Domäne und die Workflows (Gates, Playtest, CI, Messplätze). Laden vor Stamm-Chirurgie (stamm/, cut-method, stamm-umzug, Modul-Karte), vor jeder Linse, jedem Gate und jeder Sonde, vor Studio- oder Kern-Code (worlds/, die Kerne, Byte-Beweis), vor GPU-Messung (gpu-bank, werkbank, ABAB auf OMEN oder Radeon), vor Merge oder Push mit [ci voll] — und immer, wenn ein Kommentar „Lehre N" zitiert.
---

# AnazhRealm — die Lehren und die Karte

Über allem stehen DIE GOLDENE DEFINITION und DAS BETRIEBSGESETZ in `CLAUDE.md`; hier lebt das Handwerk. Ein Satz „heute:" nennt
den gemessenen Bruch gegen das Gesetz, den Beleg trägt die Systemkarte (`git show origin/koordination:SYSTEMKARTE.md`).

## Architektur

- **Stamm** `stamm/` (~117k Zeilen in 50 Dateien ≤ 4 000 Z., EINE Klasse, EIN Prototyp), je Datei ein Modul der Karte
  `spec/stamm/modul-karte.json` (19 Module, Datei = `<modul>[-<teil>].js`): der Kern `stamm/dirigent-kern.js` (Konstruktor + Naht,
  VERSION), jede Zone trägt sich mit ihrem Naht-Ruf auf `AnazhRealm`, ihre Außen-Konstanten dahinter; die Liste = die Stamm-Tags in
  index.html; `npm run atlas` die Karte live (+ `--find`: Glieder, Außen-Ziele, zugewiesene Methoden, Kerne, die Arten je
  Gesetzbuch), `diag-atlas --check` die Ratsche (R7: jedes Glied in der Datei seines Moduls). Boden · Speicher · Spieler · Anschluss + die Verben
  (appear·place·body·drive·wield·portal·rule) + KIND_POLICY. Heute: die Karte ordnet nach Modul, nicht durchweg nach Domäne —
  Kreatur-Glieder (`_kreaturGangBis`, `_creatureGroundY`) und der Fahrzeug-Boden `_werkBoden` liegen in `stamm/wasser-hydro.js`.
- **Kerne** (9 Kerne in 10 Dateien, cores.manifest.json): Daten+Mathe, Vertrag v1.2 `PARAMS_BY_KIND` + must-ignore + fail-closed
  (`docs/studio-vertrag.md`); der Host ist der OFEN (bauMensch-/bauTier-Guss + Lofi).
- **Studios** `worlds/` (14 Verzeichnisse + die Hülle): die Gesetzbücher und Nebenwelten. Die EINE Hülle `worlds/huelle` ist NUR UI
  (Regler · Sitzung · Kosten-Leiste · Portal-Brücke, 12 von 12 trusted Studios). Heute fährt die Engine der Welt nur `gelaende` (Modus
  `index.html?studio=gelaende`), die übrigen zeichnen mit eigenem `WebGLRenderer` (r128 bis r183) — Labor = Welt ist dort Gesetz, nicht Stand.
- **Worker:** Foundry lädt die EINE Brücke `foundry-bruecke.js` auf three r128 (`get-book` 1×Boot · `build-asset(id,seed,lod,ov)` ·
  `export-settlement`; die IDB-Platte der Schale trägt jede Lieferung — build-asset · Dorf-Export · Blatt-Atlas · Karte —
  unter dem Gesetz-SHA der Kerne, die sie liest) · `voxel-worker.js`. **Server:** save-server
  (state/.bak · perf-trace · llm-proxy · vendor) · signaling (WS→WebRTC; pos · input-Lockstep · dsl · soul · vibe).

## Die Quelle je Domäne

- TERRAIN = Funktion: Höhe (2D), Landform und Flussnetz = EIN Gelände-Kern `gelaende-core.js` (Stamm · Worker · Studio · Playtest),
  Chunks = Iso-CACHE mit EIGENER Stufen-Kette (`BODEN_STUFEN`; der Wechsel morpht deckungsgleich nach CDLOD, K51), Wildnis = EIN Term ·
  WELT-MARCH EIN Pass · Edits = EINE Karte je Chunk (`_voxelEditKarte`, im Kern `editKarte`) · die 3D-Dichte (Höhle, Kanal,
  See-Becken, Edit) und der Wasser-Spiegel sind Kern-Gesetz (`dichte`, `wasserSpiegel`), Stamm und voxel-worker rufen sie
  (`gate:worker-dichte --kern` mutiert sie).
- WASSER: die Hydrosphäre (gelaende-core `hydrosphaere`, gerechnet im voxel-worker, per Transfer im Main) → Zellen → Automat, die Ruhe ist sein Fixpunkt (`_ensureWaterCALevel`), sein Blick EIN
  Baustein (`_wasserBlick`); ein Stau ist Gesetz des Spiegels (`atlasSpiegel` liest die Felder, gelaende-core `stauFelder`, im
  Faden gerechnet, `_stauFelder` bestellt sie; der Automat ruht auf ihm). Heute keine EINE Wahrheit: 8 Schreiber, die Seen doppelt (Gelände-Kern und Stamm); der Spiegel ist Kern.
- ORT: der Genesis-Platz (`GENESIS_PLATZ`), jedes Bauwerk und jeder Dorfweg sind Grundriss gegen Natur, das Dorf EIN Plan des
  Fachwerk-Studios auf dem Gelände-Kern (`_ortPlaene`), jeder Wurf des Felds weicht ihm (`FELD_WURF`, `_weichtDemBau`). Heute hält die
  Instanz-Wand (`_naturWand`) Bauten frei, die Schicht (Halm, Nah-Wiese) noch nicht.
- GESTALT < 64 m Studio-Mesh + LOD-Kette, EIN Auge der Stufen (`_lodAuge`), jede Karte eine Schicht des EINEN Atlas, fern
  Glieder-Kapseln · jede Senke zeichnet über ihren Zeichner (`_instanzZeichner`: count 1 über einer InstancedBufferGeometry-Fassade,
  Matrizen im Storage-Puffer) · Baum = Studio-Karte bis 384 m, EINE Ableitung aus `treeParams` (gen ≥ 5), der gefühlte Baum ihr Skelett
  (`skelettDerGestalt`), EIN Wind-Term über die Naht `_weltNaht`, Blende je Instanz, laut (`_blendeBruch`) · Haus und Tor fern NUR-WURF,
  das Fenster Glas in jeder Stufe, der Tor-Hinterflügel eine Instanz (`_foundryFluegelInstanz`).
- BODEN Rausch-Gesetz, Fels und Halm-Schichten als reine WGSL-Funktionen, EIN Leser `_bodenSichtAt`, Fels-Stoff im Worker (`_felsStoff`).
- LICHT EIN Leuchtquellen-Gesetz (`kelvin`, EIN Pool) · EIN Himmel · EINE Koschmieder-Luft · Schatten 2 Kaskaden (`_schattenBias`), EIN
  Werfer je Gestalt · Sätze EIN Pool je Stoff, EIN Programm je Signatur · alles Opake in EINER Reihe (`_zeichenRang`: Bau · Boden · Fern ·
  Himmel), Kinder `_buendelKinderReihe`. Heute doppelt: Tag-Achsen ×5, Belichtungs-Schreiber ×3, Lichtwege ×4 (W7).
- KOSTEN die EINE Skala (TAAU: `SZENE_SKALA` 0,75, Spieler-Wahl `state.szeneSkala`, `_zeitAufloesung` auf volle Ausgabe) · `_passTrifft`
  + `_wahlHaelt` · `_schirm` · `TAKT_DECKEL_S` · Takt-Nähe `_blockerUmPlatz` · Boden-Satz `_satzPacke` · `_instanzAbschied` +
  `_gpuKehraus` · `_foundryAuftrag` · `_foundrySchale` · BRUCH = EIN Melder (`_stoffBruch` → `_bruchMelden`) · ANKUNFT = EIN Schreiber des
  ersten Weltbilds (`_weltbildSteht`).
- LEBEN EIN Leib-Löser, Gang EIN Gesetz (`gangSchritt`; heute geht das Labor `worlds/tetrapoda` noch eigenen PD-Sinus) · Kamera
  `_loopCamera` (heute 4 Zweige ohne Rig; die EINE Kugel ist Gesetz, nicht Stand) · Sturz = das Aufprall-Tempo des Leib-Lösers
  (`LEIB.sturz` in `_loopPhysicsSync`, nie ein Höhen-Zähler) · Tod `_kreaturFaellt`, seine Lage in Ereignis-Zeit (die Haut im Tod
  gelesen, `TOD_LAGE.vorlaufSec`, `_todLageFrist`) · Lebenswerte = Zustand (`recomputePlayerStats`), sie und die Bindung reisen im
  Stand · Blocker-Netz · Klang-Gesetz · Uhr + Wetter = Spieler-Wort · SPEICHER atomar (tmp + Rename + .bak).
- PRÜFEN 6 Golden-Sätze + Ofen · Messorte (`spec/profiband/haushalt.json`): Wiese −280,4/−1045,6 (K55, bd38fb16; der alte Ort −900/−850
  ist seit K16 ein Nadelwald-Hang), Genesis-Ring (`_genesisMitte`), Dorf, Prüfbühne `spec/pruefbuehne`, der Stadt-Gipfel (stadt-voll ·
  hochhaus-dach · gipfel-blick: Orte mit `anlauf`, das Dach am Träger der Kapsel; das Band misst sie, `ungemessen` bis zur Ratsche) ·
  12 Ratschen Ort × Gerät × Sicht ·
  Linsen-Start `lib/software-gpu.cjs` (`linsenWebGpuArgs`: lokal die echte GPU, CI swiftshader) · das Beweisbild urteilt selbst
  (`lib/abnahme-urteil.cjs`).

## Die tragenden Lehren (die Nummern sind Anker — der Code zitiert sie)

1. **Gesetz #0:** EINE kanonische Größe je Domäne, alle LESEN sie; nach jeder Fehler-Klasse die LINSE (Gebot 10) in einer bestehenden Familie.
2. **EINE Quelle, kein Parallelpfad;** Invarianten in den CHOKEPOINT, nicht an Aufrufer.
3. **Ganz oder gar nicht:** Abschied = Def+Maschine+Spiegel+Tests+Doku in EINER Welle, physisch; must-ignore gilt FREMDEN Artefakten
   (Taille), nie dem eigenen System; `gate:altlasten` wächst mit.
4. **Ich entscheide, geliefert wird Gebautes;** der Schöpfer wertet Ergebnisse, nie Optionslisten oder Fragen; ein benannter Fehler → die
   ganze KLASSE; fast Gebautes wird zu Ende gebaut und gemergt, bevor Neues beginnt (Maß: gemergter, sichtbarer Fortschritt je Token).
5. **Miss zuerst, KONSUM statt Existenz, SPIELE vor behaupten** (headless beweist Mechanik, nie das Erlebnis; schauen schlägt greppen);
   Beweisbilder aus dem AUSGABE-Pfad (`scripts/lib/ausgabe-aufnahme.cjs`) — ein eigenes Render-Target ist linear und ungetont (r184).
6. **Tests wandern mit dem Code;** Absenz-Greps über `window.__codeOf` (Kommentare dürfen Gefallene zitieren); eine Linse, die Code am
   Rumpf-TEXT einordnet, fällt mit dem Schnitt, den sie bewacht — Zugehörigkeit gehört an eine Liste oder Laufzeit-Marke; eine Sonde ohne
   Messung ist ROT. Eine Linse, die abstürzt und Exit 0 meldet, ist still grün (`gate:nah-fern` seit K16, b0df2d93): jedes Werkbank-Tor
   bricht bei Linsen-Fehler ROT.
7. **Gesetz statt Spiegel:** die Höhe ruft EIN Gesetzbuch (`gelaende-core.js`, Lage = Worker-`state` bzw. `_gelaende()`); ein
   Worker-Spiegel ist bit-identisch (Sheet/Density in BEIDE, der Band `checkBandWasserSheetSpiegel` maxDiff 0, `gate:worker-dichte` auch
   über dem Band); Substanz aus Γ5-Seed-Streams, nie `Math.random`; ein Zwillings-Abdruck ist ein MUSTER über jede Datei und jedes
   Skript, nie ein Variablen-Name. Das Gesetzbuch trägt die 2D-Höhe, die 3D-Dichte und den Wasser-Spiegel (gelaende-k1k4).
8. **Spawn-Affinität ist TAG-NEUTRAL** (winner-take-all; Tiere bewusst tag-identisch, Differenzierung über Größe/Gattung, nie über Tags).
9. **Exit-Codes IMMER explizit** (`echo EXIT=$?`) — `gate | tail` maskiert sie; Backslash-Ersetzungen (Regex, WGSL) nur per Edit-Werkzeug.
10. **Jede versionierte Datei trägt den `?v=`-Cache-Buster** (Worker/Bootstrap/importScripts); `npm run bump -- x.y.z` setzt alle Träger.
11. **Studio-Code nur unter BYTE-BEWEIS:** die Benchmark bewegt sich nie, Goldens eingefroren (Re-Mint = Vertrags-Akt); Kerne außerhalb
    von format:check, nie `prettier --write` auf Gesetzbücher (verbatim-Blöcke), neue Abschnitte additiv; `__`-Schlüssel in ov sind
    Steuer-Passagiere.
12. **Stamm-Chirurgie:** Werkzeug liest den Stamm NUR über `scripts/lib/stamm.cjs` (`text()` = der virtuelle Stamm, `ort()`, `dateiVon()`;
    die alte Datei `anazhRealm.js` ist tot, ein Leser auf ihren Namen ist ROT); ein neues Glied trägt seinen Eintrag in der Modul-Karte, über der
    Decke teilt die Karte das Modul (`Modul/teil`), dann `node scripts/stamm-umzug.cjs --nach-karte`; ein Zweig von vor dem Umzug zieht per
    `stamm-rehome` um; jeder Merge vereint Karte, Stamm-Tags und `?v=` je Name im Treiber `merge=register` (die Versions-Stufe
    `scripts/bump-version.cjs`, je Klon einmal `npm run setup:merge`); `cut-method` (AST-sicher) · sofort `diag-atlas --check` +
    `npm run stamm:lint` · seriell committen, nie Batch;
    Arbeiter zweigen vom Kopf von integ-probe ab, nie von einem ungemergten R3-Zweig (gestapelte Zweige erben jede Röte).
13. **Der Loop:** Streaming prio 0, Bewegung nie am Render-Signal; EIN PID, Totband 59–77 fps; NaN-Wand vor jedem EWMA; Existenz vor
    Framerate (der Ring wächst im Strom bis zu seinem Ziel, nie an Bildrate oder Regler, `_ringWaechst`; der PID regelt nur
    die Qualität, nie die Existenz).
14. **Schwere deterministische Arbeit:** gecacht + im Idle vorgebacken + frame-adaptiv, nie synchron auf dem Interaktions-Pfad (der
    Chunk-Stoff entsteht im Worker, nie im Haupt-Thread; die Hydrosphäre, das Stau-Feld und die Platte des Bodens ebenso —
    `--faden` in gate:worker-dichte zählt K4/K5 und den Stau). Heute ist der Faden bis zum ersten Weltbild 97 % belegt (W6).
15. **git ist das Archiv:** kein Doppel-Archiv im Baum; Chronik = Commit-Message (Rumpf ≤ 600 Zeichen), vollendete Pläne fallen, Lehre =
    EINE Zeile hier, Offenes = PFLICHT-OFFEN; vor jedem Schnitt KONSUM prüfen (transitiv). Siegel-Wörter meiden auch Auftrags-, Zweig- und
    Bericht-Namen: der Name wandert in die Merge-Message, und die liest `gate:betriebsgesetz` am HEAD.
16. **Der Null-Renderer ist blind** für Feld-Fit, Slots, March — Analog-Befunde nur mit echtem Renderer (`diag-arch-feld`, `diag-beweis-e`);
    ein Fit liest eine FERTIGE Quelle (Foundry-Flat), nie ein Async-Mesh (leer → ausgebrannt → für immer unsichtbar); Budgets: Lehre 25.
17. **Sonden mit echtem Renderer:** je Schuss ruht der Loop, `__buehne` hält Mittag · Sonne · Sommer (Wetter-Zug 120 s, Saison-Drift
    2400 s), die Schatten-Map wird neu markiert, die Blick-Wahl sucht freie Sicht; `Number(null) === 0` — Default-Helfer prüfen `v == null`
    zuerst; swiftshader (CI) verbirgt Präzisionsfehler echter GPUs (Fern-Ring 3,5 m auf 8 km nur auf der Radeon) — Bild-Urteile auf
    echter Hardware.
18. **Erst das Soll-Bild, dann die Welle:** Referenz + Budget (Tris/dc je LOD) + EIN Spike mit echtem Renderer an der Mess-Wiese, nah UND fern.
19. **Kosten gehören ins Asset:** ein LOD, das nicht reduziert, heilt am Studio, nie im Host; was die Lab-Karte trägt, trägt kartenlos der
    Vertex (die Welt liest nur Vertex-Farben); Labor = Welt: das Labor zeigt den Körper, den der Ofen der Welt baut (K45: Labor-Wolf L0
    1 299 852 → 54 894, d7559531). Nach Push die CI lesen; Zeitfrist-Läufe nie parallel; kein Warter trifft sich (`pgrep -f "[x]yz"`).
20. **Eine Frage, kein Neustart:** Look-Fragen an die Werkbank (`scripts/werkbank.cjs`: EINE Welt offen, Methode live tauschen, Bild
    ~45 s), nur bei eingefrorener Welt; Richter je Commit bleiben die Beweis-Sonden.
21. **Die Licht-Kette ist EINE Eichung:** Paletten-Hex = sRGB, Albedo linear (FARB-GESETZ: foundry-core, fachwerk · porta · vehicle ·
    schmiede); die Welt fügt nur den echten Himmel als EINE Umgebung hinzu, Fill · Rim · Back leben im Labor; Belichtung aus dem Licht
    (Karte Mittelgrau +1 EV, Nacht-Deckel 1,0); Albedo `werkbank albedo` / `diag-albedo-tafel --labor` (Karte 0,180), Verhältnisse
    `werkbank licht` — nie das Auge. Heute trägt die Eichung den Mesh-Lichtweg; Feld/Panorama, Wasser und die Karten-Sonne rechnen eigen (W7).
22. **Der sichtbare Boden ist das Mesh:** Surface-Nets auf 1,8 m trägt die Feinform nicht (±0,2 m); was AUF dem Boden steht, liest
    `_bodenSichtAt` (gebautes Mesh, je Ecke die oberste Fläche aus Eigner und Nachbarn), Körper stehen auf dem Gesetz; r184 rechnet den
    positionNode VOR der Instanz-Matrix (am Vendor entschieden, integ-547 08b57ed8; `gate:foundry-impostor` C4): dort sind
    `positionLocal`, `normalLocal` und `positionWorld` Vorlage — wer die Welt braucht (Wind, Blick der Karte, Blende), liest die EINE Naht
    `_weltNaht`; Höhen-Gewichte lesen `positionGeometry`.
23. **WebGPU zieht jeden Draw einzeln:** BatchedMesh = `drawIndexed` je Instanz, ein Puffer ohne Namen heißt `NodeBuffer_<id>` (je
    Geometrie ein Programm), der Bundle-Replay bucht nichts ins Info (`werkbank zaehlen`). Ein Bundle trägt nur, was sein Replay refresht:
    `_renderScene` stapelt `_currentRenderBundle`, nimmt unter overrideMaterial nie auf; die Diät geht jeden Knoten EINMAL je
    Render-Abschnitt, Stempel = (Render-Id, `info.calls`), gewechselt beim Betreten UND Verlassen jedes Renders (`gate:kamera-treue`);
    BundleGroups zeichnen in Szenen-Reihenfolge vor losen Objekten — die Reihe ALLES Opaken ist EIN Gesetz (`_zeichenRang` über
    setOpaqueSort, auch in den Kaskaden; T3: Genesis Ego −17 %), nie die Ankunft beim Boot. Die GPU-Zeit trägt die Pixel-Arbeit, nicht die
    Befehls-Zahl: die Szene rendert in der EINEN Skala (TAAU, `SZENE_SKALA` 0,75, kein zweiter Auflösungs-Regler; gpu-bank Genesis
    33,9 → 18,3 ms, 8a00348e).
24. **Der Haupt-Thread trägt keine Bytes:** Worker-Antworten per Transfer (ein Klon kostet den Empfänger je MB), die Platte im Worker (ein
    IDB-Put serialisiert synchron im Aufrufer), über den Kanal nur `FOUNDRY_LESEN` (`_foundrySchale`, `werkbank fluss`).
25. **Der Takt kostet, was ihn betrifft:** billige Filter zuerst, teure Rechnung nur für Betroffene; geteilte Budgets NAH zuerst über ALLE
    (`_weltBakeErlaubt(d2)`), nie verhungert (Nah-Schwelle die erste Fenster-Hälfte, eine Zähl-Hülle reicht die Argumente durch); die
    Foundry-Schlange `_foundryAuftrag` hält je Faden `FOUNDRY_IM_FLUG` (12) im Flug, die Pumpe (`_foundryPumpe`) wählt nah zuerst, vor dem
    ersten Weltbild den Blick zuerst, nie verhungert; die Freigabe danach ist FIFO (`INGEST_RATE_PER_S` 180/s, ≤ 8 je Bild) —
    `werkbank takt` zerlegt.
26. **Der Schatten liest, was das Auge sieht:** der r184-Schattenpass (Kaskaden-Kamera) liest nur colorNode.a · map.a · maskShadowNode,
    nie opacityNode — LOD-Masken vom Auge (`uLodAuge`), Ausschnitte in colorNode.a (`gate:foundry-crossfade`); Bundles nach jedem
    castShadow-Wechsel neu. Ein normalNode liest nie `normalWorld` (EINE Variable je Programm), sondern `normalWorldGeometry` ×
    `faceDirection`. CPU-Raster-Linsen fahren `?holz=kienspan` (swiftshader kompiliert synchron, 42–292 s je Pipeline); `_gameLoopTick`
    rendert selbst, darum trägt jeder benannte Linsen-Aufruf höchstens EINEN kalten Programm-Schlüssel (`gpu-lens`); Wände urteilen in
    Bau-Ereignissen, nie in Wanduhr-Sekunden. castShadow IST die Wurf-Ebene (`_wurfEbene`, K72): die Kaskade sieht nur Werfer und
    Lichter, r184 projiziert keinen Nicht-Werfer.
27. **Die GPU hält, was das Bild zeichnet:** r184 hält jedes Attribut (`info.memoryMap`) bis `_attributes.delete` —
    `InstancedMesh.dispose()` gibt nichts frei, `geometry.dispose()` nur das erste Render-Objekt, dessen Geometrie-Hörer fällt
    (`_renderObjektRegister`), jede Textur hält die Bindegruppen ihrer Leser; Senken fallen über `_instanzAbschied`, Ungezeichnetes nimmt
    `_gpuKehraus`, ein Attribut unter der Observer-Diät nie (ohne Versions-Sprung lädt sie nichts neu); `werkbank puffer` nennt jeden
    Halter, `buf:ruhend` / `buf:verwaist` sind Lecks (`gate:profiband`).

## Workflows

- `npm run playtest:fast` (Lauf 18 s, 18.10.) · Merge-Gate `npm run playtest` („Alle Invarianten OK" zählt, nie der Zähler) · `npm run check`
  (Statik, source-probes, constitution, studio-vertrag, altlasten, apparat, betriebsgesetz und die Selbsttests) · `npm run lint` /
  `npm run format:check` · `npm run atlas` (+ `--find`).
- Lokal der Puls der berührten Methoden + playtest:fast; der Integrator fährt den VOLLEN Playtest je Merge, die volle Batterie einmal je
  Version; gemergt bei grüner Zweig-CI.
- CI (`.github/workflows/check.yml`): Puls in 2 Gruppen je Push; die volle Batterie in 18 Gruppen (1–7 CPU, 8–18 GPU; Playtest = Gruppe 1)
  auf integ-probe, main, nachts und bei `[ci voll]` in der Commit-Message, hinter dem Kopf-Richter; `node scripts/ci-zeiten.cjs` misst und
  verteilt, `gate:ci-deckung` hält die Waage; `[skip ci]` überspringt beides.
- GPU-Zeit nur `werkbank gpu-bank` (OMEN = GTX 1060; die Radeon 890M lokal per `werkbank --echt`), A/B bei gleicher Szene oder ≥ 4 Boots
  je Seite; Aufträge und Berichte der Messplätze leben im Zweig `koordination`, nie in main.
- Commits klein, deutsch, emoji-frei, die Message ist der Chronik-Eintrag; PR nur auf Wunsch. Docs: `docs/README.md` ist die EINE Karte.
