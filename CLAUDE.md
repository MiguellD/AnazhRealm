# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## DIE GOLDENE DEFINITION (bindend — VOR allem anderen; destilliert aus den Worten des Schöpfers)

**DER MASSSTAB.** Jede Arbeit misst sich an Weltklasse: gebaut, um Profis in den Schatten zu
stellen — nicht, um durchzukommen. „Fertig" heißt IM ECHTEN SPIEL eingefädelt; fühlbar im Spiel
schlägt messbar im Trace, und der Beweis ist nie ein grünes Gate allein, sondern das BILD.
Gemessen wird Konsum-TIEFE, nie Existenz: wie viel vom Wahren fließt — „aus den Kernen fließt
nur ein Teil des Wahren" ist ein Urteil, das nie wieder fallen darf. Halb Gebautes heißt ehrlich
halb, mit Prozent; fail-soft ist der Bruch. Und „das war 5 % der offenen Punkte" ist die
Niederlage: benannte offene Punkte fallen GANZ, der Rest steht ehrlich offen mit Grund und Messnamen.

**DIE GEBOTE.**
1. Schneide an der WURZEL, am EINEN Chokepoint — „nicht pflastern — tief im Kern die Synergie".
2. Mache den GROSSEN Schnitt statt Ameisenschritten; ein benannter Fehler zieht die ganze KLASSE
   in derselben Welle.
3. LIES die Quelle — Vendor, Kern, Gesetz — statt zu raten: „Wurzel lesen, schneiden, committen".
4. Sage a, tue a: EINE kanonische Quelle je Domäne — deklariere nie Gesetz-Konsum, während ein
   vereinfachter Zwilling fährt.
5. Verifiziere KONSUM, nie Existenz: real ist nur, was ein echter Leser liest UND die Welt
   beobachtbar ändert.
6. Miss zuerst, die Zahl führt: vorher↔nachher unter gleichen Bedingungen — die Zahl steht im
   Commit, der nächste Trace ist der Richter.
7. Binde Kosten an Schirm+Änderung, nie an Weltgröße — „die Welt ist eine FUNKTION, kein Sack".
8. Entscheide selbst und liefere Gebautes, nie Optionslisten — „Ich entscheide, geliefert wird
   Gebautes".
9. Beweise proportional: gezielt und schnell (Konsum-Probe, Blick, byte-Diff) — nie
   minutenlanges Absicherungs-Theater.
10. Nach jeder Fehler-Klasse baue die LINSE, die den Täter beim NAMEN nennt — baue nie auf
    Wachsamkeit.

**DIE VERBOTE.** Melde nie „fertig", was nur im Testrahmen lebt (headless beweist Mechanik, nie
das Erlebnis) · baue nie fail-soft (der stille Fallback, der byte-alt weiterspielt, IST der
Bruch) · baue nie parallel (kein Zwilling, kein Flag, kein Sonder-Modul — „das ist das Pflaster,
das wir abgeschafft haben") · streiche nie still (Scope fällt nur offen, benannt, final) ·
zitiere nie stale Gates/Allow-Listen als Beweis · mach den Schöpfer nie zum ersten Messgerät:
spiele und SIEH selbst — Grep ersetzt nie das Auge.

**DER TON.** Bericht = Ergebnis in drei Sätzen: was geschnitten, was gemessen, was ehrlich
offen — kein Theater, keine Prosa-Tapete. Arbeite mit Stolz, Mut und Freude am Bändigen — keine
Unterwürfigkeit; der Mut kommt aus der Verifikation, nie aus der Kleinheit.

**DIE WEITERGABE.** Jeder Arbeiter-Prompt (Agent/Workflow) beginnt mit: „Lies zuerst DIE GOLDENE
DEFINITION in CLAUDE.md — sie ist bindend." Ultracode-Arbeiter laufen als `champion`
(.claude/agents/champion.md), nie als Standard-Arbeiter.

## Stand (V18.491.12 — DIE ZWILLINGS-JAGD: 15 Pflicht-fail-softs fallen als Klasse, 4 Domänen)

**19.07., dreizehnte Welle (Schöpfer-Karte §5: „Fail-closed statt fail-soft, wo Kern
Pflicht ist" + „Doku = Version" — die erste champion-Welle unter der goldenen
Definition: 2 Finder + 15 adversariale Skeptiker, 29 Befunde → 15 bestätigt,
14 sauber widerlegt [„bereits fail-closed" ist jetzt bewiesen, nicht behauptet]):**
- KOERPER (7 Schnitte): die Konstruktor-Trias speed/sprintSpeed/jumpPower 6/12/12
  (der DRITTE Zahlensatz derselben Domäne!) → Null-Sentinel, die Eichung setzt das
  Gesetz; maxWalkableSlopeY-State-Zwilling fiel (drei Leser lesen _bewegungsBlock
  („hang") direkt, fail-closed); fünf Parkour-Fallback-Ternaries (kontaktFrische
  0.18 UND der 0.15-Drift-Zwilling · wandsprungMul · doppelsprungMul ·
  kletterAusdauerProS) fielen, die Parkour-Gültigkeits-Wand trägt vier neue
  Pflicht-Felder; Pfeil-dmg „|| 5" liest _kampfKoeff("damage").base.
- KLANG (4): Raum-Bus-Init fail-closed — der 2400-Hz/0.35-DRIFT gegen Kern-2800/
  0.42 ist tot (die Doku-Lüge in Audio-Form) · _klangGenreAusKern fail-closed,
  LOFI_SCALE/LOFI_BPM/GROOVE_SWING/LOFI_GROOVE_PATTERN physisch gefallen ·
  _lofiTick-Raum-Sync fail-closed · Groove aus RHYTHMUS_MUSTER (Kern-Swing
  deckt byte-gleich).
- PORTA/SCHMIEDE/FACHWERK (3): _tuerOffenRad fail-closed (TOR_FLUEGEL_OFFEN
  1.95 physisch raus) · Bogen-matMul über __schmiedeCore.ableitenBogen mit
  holz-Anker-Weiche · _siedlungEpoche fail-closed (kein stilles Würfeln mehr).
- LINSEN GEWACHSEN: ZWILLINGE +5 Namen · altlasten-FORBIDDEN +maxWalkableSlopeY
  (37 Token) · DOKU=VERSION-Wand (CLAUDE.md-Stand-Kopf == package.json, dieselbe
  Wand wie Buster/AnazhRealm.VERSION) · Bänder gewandert (playtest · kopplung ·
  nervensystem-labs: 4 rote → 1 Baseline-Rest S8).
- BEWIESEN: voller playtest „Alle Invarianten OK" · check grün (Absenz-Selbsttests
  feuern) · gate:kopplung (Steilhang-Rutsch 6.44 m auf Kern-Wahrheit) · format+lint.
  Warmer Kern = byte-gleich AUSSER den drei absichtlich getöteten Drifts.

**Davor, zwölfte Welle (Schöpfer: „aus den Kernen fließt ein Bruchteil des Wahren —
weder Haut noch Felle noch die Fahrzeugphysik" — der Konsum-TIEFE-Bogen beginnt bei
der härtesten Fühlbarkeit; die Wahrheit stand im Kern selbst: „das volle Slip-
Winkel-Modell bleibt die Lab-Sim"):**
- N7 — DAS ZWEISPUR-GESETZ REIST: vehicle-core exportiert das komplette Modell
  der Probefahrt (exportDrive.zweispur: Achsabstände b/c · Gier-Trägheit Izz =
  m·(L²+W²)/12·izzK · Schräglauf-Steifigkeiten CA_F/CA_R · Reibkreis-Kappe
  maxGrip×grip · Achslast m·G mit Längs-Lastverlagerung über cgH/L · Lenksäulen-
  Lerps · kinematische Stand-Blende); die fünf Lab-privaten Literale zogen als
  FAHR.zweispur in den Kern (FAHR-UMZUGS-Muster, Shell liest byte-gleich —
  KEIN Zwilling bleibt).
- DER WELT-RITT FÄHRT DAS MODELL: der Lenk-Pfad integriert Newton-Euler im
  Körperframe wie updateVehicle — Schlupfwinkel je Achse → Seitenkräfte gegen
  den Schlupf, am Reibkreis×Achslast gesättigt (Grip-Grenze ENTSTEHT; Bremsen
  belädt vorn, Gas hinten), Gier aus dem Reifenmoment, Handbremse bricht die
  Heck-Seitenführung (Übersteuern/Drift emergent statt simuliert), Stand-Blende
  gegen Instabilität. Gesamt-aLong GEMESSEN (Antrieb+Bremse+Hang+Reifen) speist
  Lastverlagerung + Feder. fail-closed: ohne zweispur (kaltes Buch/Kreatur-Ritt)
  der byte-alte gripK-Pfad.
- DIE FEDER WIRD ZWEITE ORDNUNG: Nick/Wank sind Feder-Dämpfer-ZUSTÄNDE
  (x″ = m − k·x − c·x′, Rezept-k/c, Stabilitäts-Klemme dt ≤ 33 ms) statt
  exp-Annäherung — der Bug taucht beim Bremsen ÜBER das Gleichgewicht und
  schwingt aus, die Karosserie legt sich in die Kurve; gespeist aus den ECHTEN
  Modell-Beschleunigungen (aLat aus Reifenkräften statt v·ω-Näherung).
  Frischer Aufstieg = frischer Fahrzustand (kein Geister-Drift).
- BEWIESEN (schnell, kein Theater): node --check beide · playtest:fast 18/18.
  OFFEN ehrlich: Heave (Squat-Kanal braucht seinen Sitz-Höhen-Konsumenten) ·
  Haut + Felle (die nächsten zwei Konsum-Tiefe-Schnitte, gleiche Klinge).

**Davor, elfte Welle (Schöpfer: „das war 5 % der offenen Punkte" — die benannten
offenen Punkte des Bogens fallen, weiter unter Test-Verbot):**
- DIÄT-AUSWEITUNG auf die 164 sharedFoliage-Singletons (materialZensus-Spitze —
  der größte verbliebene Jeden-Frame-Refresher): möglich durch den BATCH-TEXTUR-
  WÄCHTER im Diät-Observer — BatchedMesh trägt seine Instanz-Wahrheit in Daten-
  Texturen (_matricesTexture/_colorsTexture/_indirectTexture), deren Versionen
  equals() nicht sieht; der Wächter prüft sie selbst (Mutation → EIN Refresh).
  Ihr Graph hängt nur an geteilten Sätzen (Toon-Builder: Atmo/LOD/Wind) +
  Attributen + Instanz-Daten. Die Masken-/Impostor-PBR-Materialien (Atlas-
  Textur-KNOTEN — für equals unsichtbar, Atlanten backen live) bleiben BEWUSST
  undiätiert (der ehrliche Rest, nach Trace-Urteil).
- DER LIVE-SET-ZENSUS (steadyState.heapZensus): GC-Pausen skalieren mit dem
  LIVE-SET (3-GB-Heap), der Trace kannte nur Zähler — jetzt summiert die Linse
  die CPU-TypedArray-Bytes der Szene je Familie (dedupliziert — Singletons
  zählen einmal) + die großen Halter (Foundry-Cache N+MB aus der kanonischen
  cacheBytes-Bilanz · Batch-Zahl · Impostor-Atlanten). Der nächste Trace NENNT
  den GC-Wal statt zu raten.
- EHRLICH OFFEN bleibt: der Wasser-Bundle-Weg (Vendor-Physik: viewportLinearDepth
  bricht den Pass — bräuchte eine Depth-Copy VOR dem Bundle-Replay, Vendor-Akt) ·
  die Impostor-/Masken-Diät (Atlas-Knoten-Wächter nötig) · der Live-Set-SCHNITT
  selbst (der Zensus liefert erst die Ziele).

**Davor, zehnte Welle (Schöpfer-Spielbericht auf .8: „Terrain/Bäume erscheinen erst
beim Abbauen/Platzieren" — Test-Verbot des Schöpfers: Wurzel lesen, schneiden, committen):**
- DIE REIFE-WACHE (`_bundleReifeWache`): der Vendor-Record zeichnet nur, was
  `_pipelines.isReady` bejaht, und versiegelt das Bundle DANACH bedingungslos
  (`u.version = s.version`) — ein frisch gestreamter Bürger, dessen Pipeline noch
  ASYNC kompiliert (der Ofen wärmt bewusst asynchron; der Wiederanker der neunten
  Welle machte das Fenster HÄUFIG), fiel STUMM aus dem Replay, bis eine spätere
  Mutation die Region zufällig neu recordete — das Abbauen des Schöpfers. Jetzt
  kompiliert JEDER Bundle-Beitritt (Chunk-Anker · Stitch-Folge · Batch-/Instanz-
  Münze · Feld-Cull-Gewand) seinen Bürger asynchron FERTIG und touched DANN den
  aktuellen Bundle-Parent — der Re-Record kommt garantiert NACH der Reife (heiße
  Pipelines: sofortiger Cache-Treffer, ein Touch, an Änderung gebunden).
- REVIEW-NACHARBEIT (adversariale Diff-Review der neunten Welle, 3 bestätigte
  Befunde geschnitten): `uSeasonMul` bricht das Pflicht-Paar (per Frame mutiert,
  vom diät-behandelten Gras konsumiert, aber per-Objekt-geklont → Saison-
  Patchwork) → in die Uniform-Heimat · `toggleTerrain` schaltete `visible`
  bundle-blind (der Record liest visible, das Replay nie → Toggle inert/split-
  brain) → re-recorded jetzt ALLE Region-Bundles · die Diät wächtert das
  Pflicht-Paar selbst (kein renderGroup-Export → keine Diät, byte-alt) · auch
  die fc-Familie (Feld-Cull-Gewand) verlässt beim Tod den Ofen-Dedup.
- Bestätigt-sicher (Review, Vendor-Beweise): instanceMatrix.version lebt (Core-
  Setter) · renderId ist je Pass (Schatten-Pass unbetroffen, Override-Material
  nie diät-behandelt) · alle vier teilen-Aufrufe liegen VOR jedem ersten Build ·
  Chunk-Schatten reisen durchs Bundle (je-Kontext-Records) · alle Dispose-Pfade
  der fünf Populationen parent-bewusst. Getragene Invariante (dokumentiert):
  Attribut-Uploads reisen im Replay NIE — jede Instanz-Mutation der Chunk-
  Populationen MUSS über Remove+Add (Pool-Re-Anker) laufen; heute überall wahr.

**Davor, neunte Welle (sechster Trace: avgFps 4.5→9.2, dc 631, GPU echt 14.6 ms — aber
render-CPU 49 ms, 60M Klein-Uploads, 6067 Pipelines, LongTasks 454 s/718 s, Deckung 10 %.
Der Schöpfer: „nicht pflastern — tief im Kern die Synergie". Der Vendor wurde GELESEN):**
- DIE UNIFORM-HEIMAT (`_uniformHeimatTeilen`): r184 KLONT jede nicht-geteilte Uniform-
  Gruppe je RenderObject — unsere vier Welt-Sätze (windUniforms inkl. uWindDir/uBend ·
  atmoUniforms ~20 · lodUniforms 7 · hydroSurfaceUniforms 18) lebten als per-Objekt-
  Kopien = der 60M-Klein-Upload-Sturm (9.3 GB ≤16K, ~9k writeBuffer/Frame bei 631 dc).
  Jetzt: EIN renderGroup-Buffer je Satz, EIN Write je Render. Semantisch identisch per
  Konstruktion (geteilte Singletons an geteilten Materialien — per-Objekt-Variation
  reist in dieser Welt IMMER als Attribut).
- DIE OBSERVER-DIÄT (`_materialObserverDiaet`): der r184-Monitor kurzschließt auf
  hasNode (containsNode = true für JEDES TSL-Material) und befragt seine EIGENE
  Änderungs-Erkennung (equals: worldMatrix · Material-Props · Attribut-Versionen ·
  Geometrie-id · Morphs) NIE — jedes Objekt zahlte jeden Frame updateBefore/update/
  Bindings. Die Diät (Chunk-Boden/Stitch · Gras · Streu/deko-fernfeld · Wasser)
  stellt auf die equals()-Bahn; der renderId-Satz hält die Takt-Uniforms lebendig
  (erstes Objekt je Material je Render). VENDOR-LOCH geschlossen: equals sieht
  instanceMatrix/instanceColor NICHT (leben am Mesh, nicht in geometry.attributes)
  — der Diät-Observer prüft ihre Versionen selbst (Pool-Refill = EIN Refresh).
- DIE CHUNK-EINBÜRGERUNG (`_chunkBundleAnker`, p:-Keying wie die Platzier-Bahn):
  Terrain-Boden · LOD-Stitch · Gras · Streu ziehen in die Region-BundleGroups
  (Add/Remove = Re-Record NUR der Region; `_bundleKugelWeite` weitet die Cull-
  Kugel um Berg-Chunks — Unter-Inklusion wäre ein Pop). WASSER BLEIBT DRAUSSEN
  (GEMESSEN, blick-Sonde: sein viewportLinearDepth zwingt copyFramebufferToTexture
  zum Pass-Bruch — currentPass.end existiert im Bundle-Encoder nicht); Bäume
  bleiben bewusst global (V18.390-Kompromiss), beide tragen trotzdem Diät/Heimat.
- DER OFEN-WIEDERANKER: r184 evictet Pipelines, wenn der letzte RenderObject einer
  Familie stirbt — die Wander-Wiederkehr kompilierte SYNCHRON (6067 total, 24er-
  Bursts in 7-s-Frames), der Ofen schwieg (Familie für immer in _pipeOfenDone).
  Der Gruppen-Dispose entlässt die Familie (`g._ofenKey`) → Re-Mint wärmt ASYNC.
  Dazu: DIE LINSE WIRD AKTUATOR — die Gnadenfrist skaliert mit der Mint-Zahl der
  Churn-Linse (×Mints, Deckel ×6 = 60 s; die ×14-Blume im 51-s-Orbit stirbt).
- BEWIESEN: voller playtest „Alle Invarianten OK" · check · foundry-crossfade ·
  scatter-lod · leistungs-vertrag (Quieszenz, 0 Stand-Mints, 1217→1217) · blick
  auf ECHTEM WebGPU grün (Substanz Tag+Nacht, Komposition == vorher) · Härtetest
  Teleport+Rebuild+Pool-Zyklen unter Diät: 0 Seiten-Fehler. Szene-Kinder 523→~46.
  Der nächste Schöpfer-Trace ist der Richter (bundleDeckung/uploadKlassen/render-CPU).
- OFFEN daneben: Heap-Live-Set ~2.4 GB (GC-Pausen skalieren damit — Zensus fehlt) ·
  Wasser-Bundle-Weg (bräuchte Depth-Copy VOR dem Bundle-Replay) · Diät auf die
  Foliage-/Arch-Materialien ausweiten (nach Trace-Urteil).

**Davor, achte Welle (der Schöpfer verlangt den GROSSEN Schnitt statt Ameisenschritten —
die Nicht-Bundle-Chirurgie beginnt an ihrer Wurzel):**
- DER GRANULARITÄTS-KOLLAPS: der pauschale `instanceShare`-Zwang schickte auch das
  200-Vert-Blümchen in eine EIGENE region-gekeyte InstancedMesh — 1126 Wrapper ≈
  Art×Variante×Blatt×Region WAREN die 2211–3219 Draw-Calls, der 65k/s-Klein-Upload-
  Sturm und die ~10 Pipeline-Mints/s des fünften Traces. Am EINEN heavyLeaf-
  Chokepoint (`_archInstanceGroupFor`) zählt instanceShare jetzt nur noch als
  heavy, wenn das Teilen sich lohnt oder die Semantik es verlangt: Verts >
  ARCH_BATCH_KLEIN_VERTS (2048, der Batch KOPIERT je Geometrie) · Tür-Flügel
  (Scharnier-Matrizen) · MASKIERTE Stufen-Leaves (aLodLevel>0.5 — die Instanz-
  Fassade trägt aH0×Skala) · aOccl-Träger (Impostor-Quads, Kleber-Wand-Decode).
  ALLE anderen kleinen Foundry-Leaves kollabieren in die Region-BatchedMesh —
  und damit ins RenderBundle; für unmaskierte Leaves ist die Fassaden-Semantik
  inert (Maske gated auf aLod>0.5), der Kollaps ist look-treu.
- GEMESSEN (gleicher Headless-Boot, 900 Ticks, vor↔nach): Szene-InstancedMeshes
  2127 → 411 (−81 %), Wrapper gesamt (inst+batch) 2349 → 655 (−72 %; Batches
  222→244 tragen die Kollabierten). BEWIESEN: gate:leistungs-vertrag GRÜN mit
  QUIESZENZ-Band (das 570-Mints-Rot war Boot-Streaming im zu kurzen Settle —
  jetzt druckt+prüft das Gate die Quieszenz; Stand 0 Mints, Gruppen 1208→1208) ·
  voller playtest „Alle Invarianten OK" · gate:foundry-crossfade (Stufen/Bänder/
  Bilanz byte-grün) · gate:scatter-lod (Quell-Probe-Fenster 2600→8000 — der
  Kollaps-Block sitzt zwischen Keying und Batch-Zweig) · npm run check. Der
  nächste Schöpfer-Trace ist der Richter über dc/Uniform-Sturm — die
  bundleDeckung-Linse misst den Fortschritt.
- OFFEN daneben: die VIER Nicht-Bundle-Chunk-Populationen (Terrain ≤625 · Gras
  ~289 · Streu ~375 · Wasser/Stitch) + globale Baum-Gruppen in die Bundle-Bahn.

**Davor, siebte Welle (ULTRACODE — die Profi-Doktrin „Kosten binden an Schirm+Änderung,
nie an Weltgröße" wird Maschine; Verstehens-Sweep 4 Leser + adversariale Diff-Review):**
- DER INGEST-TAKT: Worker-Reply- UND Platten-Treffer-Bursts bündelten ihre Konversionen
  (_foundryBuildGroup, bis ~170k Verts) als Microtasks in EINER Task = die 5–6.4-s-
  LongTasks. Der EINE Chokepoint `_foundryRequest` → `_foundryIngestTakt`: jedes
  Ergebnis passiert die Takt-Queue, der Loop gibt 3/Frame frei (über Budget 1, nie 0 —
  Fortschritts-Garantie), Reihenfolge bleibt, Misses sofort, headless sofort (Gates
  byte-schnell). Alle Konsumenten waren schon null-tolerant (Sweep-verifiziert, 0 awaits).
- DER LEISTUNGS-VERTRAG (gate:leistungs-vertrag): 0 Stand-Churn · Gruppen klettern im
  Stand nicht (1214→1214) · Takt-Sätze (nie synchron, 3/1, Reihenfolge, kein Verhungern,
  headless sofort) · Linsen-KONSUM im Trace — die Laufzeit-Ökonomie ist versiegelt wie
  die Gesetz-Zwillinge (gate:altlasten-Idee für die Ökonomie).
- NEUE LINSEN: bundleDeckung (drin/draußen + Top-Draußen-Familien — die per-Draw-
  Uniform-Bahn bekommt Ziele) · ingestTakt (frei/stau/stauMax) · stillstandMuellMBProS
  (Median-Heap-Wachstum in Steh-Sekunden ohne GC — Loop-Müll ohne Streaming-Alibi).
- ZWEI-KREISE-MINI: echtes gpuMs über der Frame-Decke setzt die Radius-Ruhe-Uhr zurück
  (der Radius wächst nie in eine volle GPU; Proxy/Sim byte-alt).
- MÜLL-WAL GESCHNITTEN (Review-Nacharbeit derselben Welle): der EINE ctx-lose
  Chokepoint `_terrainBaseDensityAt` füllt einen privaten SCRATCH statt je Feld-
  Probe (Gradient x±/z± · Raycast-DDA · Kreatur-Rays · Fixed-Steps) einen frischen
  Spalten-Kontext zu münzen (Werte byte-identisch — gate:worker-watersheet maxDiff 0;
  Halter-Pfade münzen weiter frisch); `_tickScatterLod`-Keys-Spiegel nur bei
  Größen-Wechsel + 128er-Auffrisch (~1–1.5 MB/s Stand-Müll tot).
- REVIEW-NACHARBEIT (adversariale Diff-Review, 2 Prüfer): der Ingest-Drain wandert
  auf die LÄUFT-IMMER-Seite des Frames (ein persistenter Phasen-Fehler hätte ihn
  sonst für immer ausgehungert) · stillstandMuell zählt nur noch Sekunden OHNE
  Ingest/Mints/Stall-Slots und nur mit echtem Speicher-Signal · die Mint-Map-
  Schranke ist amortisiert + hart (Top-256-Fallback).
- OFFEN (die letzte große Chirurgie, Ziele benannt): die VIER Nicht-Bundle-Chunk-
  Populationen (Terrain ≤625 · Gras ~289 · Streu ~375 · Wasser/Stitch) + globale
  Baum-Gruppen in die Bundle-Bahn — die bundleDeckung-Linse misst den Fortschritt.

**18.07., sechste Welle (vierter Trace: die Linsen überführen den GRENZZYKLUS — Radius
atmete 58↔130 m, Churn-Linse nennt fscatter:blume ×6/1132 Wiederkehrer, GPU echt blieb
10–15 ms in den 5-s-Frames [die Proxy-Verdikte LOGEN — 5–6.4-s-LongTasks vom Worker-
Reply-Ingest deckten die Lücke]):**
- GRENZZYKLUS-SCHNITT: der Radius-Aktuator bekommt die Zeit-Wand — WACHSEN nur nach
  PERF_FOLIAGE_GROW_RUHE_S (4) Sim-Sekunden ohne Über-Budget-Frame (jede Welle setzt
  die Uhr zurück; Sim-Zeit via sense.frameMs, gate-deterministisch), SCHRUMPFEN erst
  ab PERF_FOLIAGE_SHRINK_TOTBAND (8 m) Ziel-Abstand. Der Kreis „wachsen→Ingest-Sturm→
  Kollaps→schrumpfen→Zellen frei→wachsen" ist tot. gate:regler-sim S6 (11/11):
  gepulster Kopfraum Δ 0 · anhaltende Ruhe wächst 75→216.
- PROXY-LÜGEN-WAND im Verdikt: deckt der LongTask-Akku >60 % der gpuGap-Lücke, urteilt
  der Flugschreiber HAUPTTHREAD-BLOCKIERT (Worker-Reply-Ingest/Compile) statt „GPU-
  gebunden" — echtes timestamp-gpuMs bleibt die Wahrheit.
- Die Wale sind benannt: die fünf 4kV-InstancedMeshes sind das Studio-GRAS (3564-Vert-
  Büschel, castShadow aus, ~12M der 18M Tris) — GPU trägt sie (echt 10–15 ms); OFFEN
  bleibt die per-Draw-Uniform-Bahn (20M Klein-Uploads) + der synchrone Reply-Ingest
  (der nach dem Zyklus-Tod nur noch beim echten Streamen feuert).

**18.07., vierte Welle (zweiter Schöpfer-Trace 6.7 fps + Konsole urteilen — GPU echt 17 ms,
CPU-render 88 ms: der Wal ist die CPU-Submit-/Fehler-Bahn, nie die GPU):**
- WGSL-SPEC-WAND: der Feld-Pass-Raymarch mischte `i32 % u32` + `clamp(i32,·,u32)`
  (textureDimensions = vec2<u32>) — das Schöpfer-Chrome-150-Dawn warf CreateShaderModule,
  die invalide Pipeline riss JEDEN Queue.Submit ihres Render-Kontexts mit (weiße Welt,
  21.9-s-Frames); der swiftshader-Dawn der Gates war nachsichtig. Einmal i32-casten;
  gate:fern-ring Band 8 bleibt grün (echte Render-Probe).
- ATTRIBUT-WAND: 957 Direkt-Konsumenten der geteilten foundry-Masken-Materialien
  (Kreatur-Ofen u.a.) liefen ungestempelt → three warnte je RenderObject (aH0/aH0L/
  aLodLevel-Konsolen-Flut). Null-Stempel am EINEN Konversions-Chokepoint
  (_foundryBuildMesh, byte-gleiches Rendering); gate:foundry-crossfade ATTRIBUT-WAND-Band
  (957 geprüft/0) + Band Z folgt jetzt dem LIVE-Formel-Zwilling (die 12.6-Kante war stale —
  LOD_TRI_BUDGET_MUL macht thresh01 12/Kante 4.6; das Band war seit T2 nie grün).
- UPLOAD-KLASSEN: der writeBuffer-Tap zählt Größen-Klassen (≤16K/≤256K/≤2M/>2M) —
  die 38–53 MB/s Dauer-Uploads des Traces bekommen in der nächsten Datei einen Namen.
- Der zweite Trace bestätigt die dritte Welle: Impostoren 115/115 gebacken, 0 wartend
  (Kleber-Wand + Bake-Fluss leben), Seed klasse=mittel 0.6 konsumiert; OFFEN benannt:
  Heap-Sägezahn (~25 MB/s Müll, GC-LongTasks 335 s/535 s) + CPU-render 88 ms bei 1281 dc
  (die Nicht-Bundle-Draws) = die nächsten Wale, jetzt mit Mess-Namen.

**18.07., fünfte Welle (dritter Trace: uploadKlassen überführt 12.8M Klein-Uploads ≤16K
[2.4 GB, ~55k writeBuffer/s = die per-Draw-Uniform-Bahn ÜBER ALLE PÄSSE] + Gruppen-Churn
+366/176 s bei stehendem Spieler):**
- GNADENFRIST DES LEER-DISPOSE: Familien oszillieren beim Wandern/LOD-Wechsel um
  liveCount 0 — der Sofort-Reap (V18.485) machte jede Oszillation zum Voll-Dispose +
  Re-Mint (Pipeline-Cache-Eintrag · voller Matrix-Upload [795 MB ≤256K-Klasse] ·
  Heap-Müll). Der EINE Leer-Chokepoint `_archGroupLeerDispose`: headless reapt SOFORT
  (byte-alte Gates), echt hält ARCH_LEER_GNADE_MS (10 s) + `_tickArchGruppenReaper`;
  Realloc in der Frist = 0 Re-Mints. gate:foundry-crossfade GNADENFRIST-Band (4 Sätze).
- CHURN-LINSE: die zwei Gruppen-Münz-Chokepoints + der Disposer zählen Mints/Tode,
  ein Ring nennt die Top-WIEDERKEHRER-Schlüssel — steadyState.gruppenChurn im Export.
- OFFEN (mit Mess-Namen): die per-Draw-Uniform-Bahn (~55k Klein-Uploads/s ≈ CPU-render
  86 ms — Hebel: weniger Draws in die Bundles/Batches, Pass-Zahl) · Heap-Sägezahn.

**Davor: 18.07., dritte Welle (der erste Schöpfer-Trace urteilt — 2.8 fps auf starkem Holz +
„Objekte hängen an der Kamera"):**
- KAMERA-KLEBER-WAND: tote Impostor-Slots (`_archGroupFree` Null-3×3 + lebende Translation)
  machten den Normal-Probe singulär (0/0→NaN bzw. 1e-5-Clamp→_sInst 1e5) — ein welt-
  spannendes camera-facing Quad mit dem Familien-Atlas (Fels/Kristall/Auto/Feueresse …).
  Die Wand am EINEN Shader-Chokepoint: `_lebt = probe²>1e-12` + select (NaN·0=NaN!) ⇒
  toter Slot: _sInst 0 UND _alpha 0. gate:foundry-impostor Teil C (echtes WebGPU):
  Monster 3936 px (Selbsttest) · nach Free 0 px.
- GERÄTE-PROFIL = REGLER-SEED: `_geraeteProfil` (EINE Quelle für Flugschreiber UND PID) —
  Klasse schwach/mittel/stark × Pixel-Zuschlag → loadScale-STARTWERT (Prior, nie Urteil;
  headless byte-alt). gate:regler-sim S5.
- KEIN-WEBGPU BEWIESEN: `_gpuComputeFaehig` (Backend-Urteil, Existenz-Prüfungen waren
  blind) wall Feld-Cull · Fullscreen-Feld-Pass (rohes WGSL) · Region-Bundles (API lebt NUR
  im WebGPU-Backend — Crash-Klasse); Rückfall EINMAL laut (WARN), rendererType ehrlich
  (webgl-fallback). gate:webgl-probe (forceWebGL-Hook, alle 5 Renderer-Münzstellen):
  lebende sichtbare Welt auf swiftshader-GL, 0 Seiten-Fehler.
- TRACE-BLINDSTELLEN GEHEILT: triZensus nennt Wale (Marker+Struktur-Label, Chunk-Boden
  benannt) · steadyState trägt ALLE Stellgrößen · gruppenKlassen (Präfix-Zensus des
  660er-Wachstums) · materialZensus (der Pipeline-Münzer der nächsten Datei).

**Davor: 18.07., zweite Welle (ABSOLUTE VOLLENDUNG — die DoD-Matrix aus dem lebenden Code, jede
Zelle grün oder final gestrichen; Merge-Gate + npm run check komplett grün):**
- WAISEN-NULL: der Konsum-Wächter urteilt über DREI Flächen (Stamm · Ofen · Kern-Maschine,
  3 Selbsttests) — die 136-Eintrag-Lern-Liste war Linsen-Blindheit, sie ist LEER; tote
  Kern-Exporte fielen physisch (ANTHROPOS-Rest · DESTNUR/TURMNUR/NOISEAMP/_MAPPED/
  LOD1SKIP · gapStadt), laneiv wird byte-gleich konsumiert.
- KATALOG EIN EINTRAG: `_katalogSichtbar` = der EINE Sicht-Chokepoint (Werkstatt ·
  Rezeptbuch · Omnibox · Auftrag-Select) — grown_*/Varianten-Doppel treten nirgends auf.
- SIEDLUNG GANZ: Zäune + Äcker (Wege-Pool) · Marktstände (marktstand_dorf) · Hof-Bäume
  (Studio-Bäume) leben; der Export trägt NUR gelebte Schichten (gate:settlement C-S6).
- FELS-HÜLLE: Streu-Formationen (fels/kristall_var*) decken die GEMESSENE Studio-Hülle
  (fx.huelle, im Worker über 4 Varianten vermessen) — vierter Gesetz-Blocker-Zweig.
- ZWILLINGS-NULL: sprintMul/FAHR+hostEmergent fail-closed (_sprintMulGesetz/_fahrGesetz,
  Gültigkeits-Wände), Parkour-Rutsch-Ternaries + tetrapoda-Motion-Drittsätze tot, die
  Kampf-Kapsel liest ARENA (kapselRK/RMin/Y0/Y1), die Emotionen erreichen den Mensch-Rig.

**Davor am selben Tag — DIE VOLLENDUNGS-SCHNITTE (erste Welle, je Riss EIN Commit):**
- HAUS-DOPPELBAU tot: slot.ov reist als studioOv — Kirche/Gasthaus/Armut bauen die Export-
  Wahrheit (Optik == Blocker); gate:settlement C-S5 + lebende ov-Hash-Trennung.
- FAHRZEUG-DONOR tot: exportDrive trägt sitz+huelle (Kern-Stationen); Blocker-Chokepoint +
  mountArchitecture lesen `_fahrzeugGesetzFor` (Tor-Klasse, Lockstep-fest); Donor bleibt
  NUR Substanz/Judge + Emergenz-Quelle der User-Compounds. gate:vehicle-drive sitz/huelleKern.
- EINHEITSBREI tot: schmiede.kampfMasze (prepP+measure) misst jede Gattung — Dauer ∝ √I
  (dauerProSqrtIKg), Reichweite = S.L, Schaden × mEff/mEffRefKg (ARENA additiv);
  gate:kampf-gefuehl: byte-gleiche Donor-Parts ⇒ ≥3 distinkte Dauern/Reichweiten/Faktoren.
- DIAL-/PALETTE-ZWILLING tot: foundry-core PRESETS reist SYNCHRON (__terrainCore.PHYTO_PRESETS)
  — gefühlt == gesehen (buche→mammut, erle→weide, karst/palme/zypresse folgen ihrer Seen-Map);
  Literale physisch raus (Rückkehr-Wand 35 Namen).
- HIMMEL/WASSER-ZWILLINGE tot: terrain steht in GESETZ_KERNE (__terrainCore), beide Leser
  fail-closed (_kernPflichtBruch); Inline-Fallback-Wand (gate:studio-vertrag) + der Konsum-
  Wächter rastert die Welt-Look-Gesetze (foundry-core 185 Blätter statt blind).
- PORTA-FOG lebt: mu.fog speist den TSL-Bodennebel am Tor-Fuß (buildFog-Port, nähe-aktiviert)
  + EIN geteiltes Portal-Licht (Lab-Atem-Formel); gate:portal-membran N-Block: Dial→mu→
  Uniform→Draw lebendig.
- GENRE-STIMMEN leben: inst.harmony/lead/bass wählen Wellenform+Pegel+Anschlag, tilt (dB)
  mischt alle vier Rollen, form rahmt die Progression; der Konsum-Wächter urteilt inst/tilt
  per KOMPOSITUM (die Wort-Kollisions-Blindheit ist geheilt, Selbsttest feuert).
- BOOT-LITERALE tot: Haut/Haar aus SKIN_TONES/HAIR_COLORS (Γ5-Anker aus dem Welt-Seed), EIN
  Farb-/Key-Münzer für Guss UND Prefetch (der Boot-Avatar trifft warm), das Peer-Identitäts-
  Leck ist zu; der Bäcker-Default = benannte Kern-Anker (karamell/darkbrown, fail-closed).
- AUGEN-GLUT tot: der Bäcker liest kl.ei (0.3 statt 2.8×-Phantom-Default); foundry-core
  steht mit in der Rückkehr-Wand.

VISIONSSCOPE GESTRICHEN (final, kein Backlog): Stadtmauer-/Laternen-Schichten des
Settlement-Exports (Stadt-Gestalt ohne Welt-Mechanik — nur ein neuer Schöpfer-Auftrag
öffnet das wieder) · Klang = WAHL+Parameter am Host-Ofen (Genre wählt Stimmen/Mixer/Form/
Raum; die Lab-Synthese-Engine bleibt Shell — DAS ist die eine Klang-Wahrheit) · Nebel ohne
Depth-Soft-Pre-Pass (depthTest deckt) · blume-Palette neutral (kein Farb-Gesetz im Studio).
OFFEN (das letzte Wort): die Schöpfer-Abnahme — docs/abnahme-drehbuch.md (20 Schritte,
deckt die Matrix) + `npm run look-golden -- --mint` auf dem Schöpfer-Holz.

Davor V18.489 — DIE SCHLUSS-WELLE (17.07. nachts): die 9 Tetrapoda-Zeilen fallen (VERHALTEN,
fail-closed, Absenz-Wand 18 Namen) · 4 Teils→Ganz (Zorn-Achse→angry · schmiede-Vertrags-Akt
[10 tote Exporte] · klang-RAUM [hall/echo/Sends] · Lab-Vorschau deklariert) · Feld-Cull-
Puffer-Tod (Churn → Grundlinie 0/0/0, Leck-Selbsttest rot) · selbst gespielt (echtes WebGPU).

Davor V18.488 — DIE OFFENEN PUNKTE FALLEN (17.07. abends): DER FULLSCREEN-FELD-PASS (Ferne
jenseits der Schalen = NULL Vertices: Polar-Höhenfeld 192×48 bis 40 km vom
GPU-Feld-Zeichner + Fullscreen-WGSL-Raymarch als letzter Draw; gate:fern-ring
Band 8: Texel==Gesetz worst 9.1 mm, echte Render-Probe 4608 Treffer-Pixel) ·
DER FELD-CULL (Compute-Frustum-Cull + indirekte Draws, atomicAdd-Kompaktierung,
setIndirect; gate:feld-cull: 11/11 → 0 bei 180°-Drehung, Selbsttest rot; halb
~10 %: Puffer-Destroy beim Churn unvermessen) · DER ZENSUS-REST (alle 94
Matrix-Befunde gestempelt: +20 ganz [Genre-Engine 22 Genres · Fahrzeug-Rest ·
Kampf-Rest · Bewegungs-P3] · 4 teils · 23 offen mit Grund) · DER WAISEN-ABBAU
(281→136: klang 121 + EPOCHEN 14 + BOGENMAT 6 wirklich konsumiert) ·
KREATUR-FEINSCHLIFF mit AUGEN (Blick-Sonde, tetrapoda-Winkel).

Davor V18.487 — DIE VOLLENDUNGS-WELLE: erst erstellen, dann reparieren.

**Das Schöpfer-Wort (17.07., bindend): „fertig" heißt IM ECHTEN SPIEL eingefädelt —
halb Gebautes heißt ehrlich halb (mit %), fail-soft ist der Bruch.** Gebaut:
KERN-PFLICHT (fachwerk-/klang-core FEHLTEN in index.html — Gesetze existierten
nur im Testrahmen! Jetzt laden alle 10, `_kernPflichtWand` schreit rot) · DER
EINE GESETZ-STROM (`AnazhRealm.Gesetz("kern:Weg")` — Namensraum/PRESETS-fx, memo,
8 Leser-Familien) · DIE FALLBACK-ZWILLINGE FALLEN (17 Stamm-Größen weg
[SCHWIMM/LUFT/SPRUNG/SCHRITT/VERHALTEN/ARENA_FALLBACK · SWING_/BOGEN_LAWS ·
COMBAT_REACH_M · MOUSE_ACTION_STAMINA_COST · CREATURE_*/TEMPERAMENT_*]; alle
Leser fail-closed via `_kernPflichtBruch`; ZWILLINGS-ABSENZ-WAND + Selbsttest in
gate:studio-vertrag; 12 Playtest-Stellen + 2 Gates gewandert) · DORF-ERLEBNIS
(Straßen/Platz/Brunnen aus dem Siedlungs-Export heben mit [`_stlWege*`,
Rebuild-Gedächtnis über Reload]; Häuser BETRETBAR: Tür-Flügel-Separation im
fachwerk-Kern [Vertrags-Akt, Goldens neu gemintet] + tuer-Zeile im Export →
Blocker mit Tür-Lücke + `_tickHausTueren` öffnet dem Reisenden) · DER
FELD-ZEICHNER (feld-wgsl IM SPIEL konsumiert: voller Fern-Ring-Refresh = EIN
GPU-Compute, Horizont steht im nächsten Frame, CPU verfeinert aufs f64-Gesetz
ab Live-Cursor; gate:fern-ring Band 7 mit echtem WebGPU: ready bei Cursor
600/2880, worst 3.2 mm auf 8 km) · KONSUM-WÄCHTER (gate:konsum-bilanz, 281
Waisen als Lern-Liste) · GENESIS-PORTAL-RING (alle Welt-Portale R 11 m um den
ersten Spawn). OFFEN (ehrlich, kein Warte-Tor): GPU-Cull/indirekte Draws +
Fullscreen-Feld-Pass (§0b) · Matrix-Prio-2/3-Rest + Waisen-Abbau (§0c) ·
Kreatur-Aktions-Feinschliff am Schöpfer-Auge.

Davor V18.486 — DER SPIEGEL-ZENSUS (17.07., Schöpfer-Wette bestätigt):
6-Domänen-Matrix (94 Befunde) + Abbau — das „darf" fiel (Vertrag+Validator für
fx.bewegung/VERHALTEN/ARENA/FAHR.lenkung) · REALITÄTS-EICHUNG (Gehen 1.5 m/s ·
sprintMul 4.5 · Sprung 0.53 m · g 9.81 · Klettern 0.6 · Schwimmen 1.0/speedMul
0.85; gesetz-relative Floors; vmax-Anker des Ritts; 10 Bänder gewandert) ·
STEIGUNGS-DREIKLANG (Hangabtrieb + Gelände-Nick/Wank + Probestrecken-Hügel aus
EINER bodenY-Quelle) · KAMPF-/KREATUR-ZENSUS (Geometrie/Stoß/Kipp/Flug→ARENA,
Quartett→koerper, Verhalten→tetrapoda, Waffen-GÜTE in den Schaden).

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
