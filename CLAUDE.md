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

## Stand (V18.491.39 — DER REALLOC-TOD: die Bewegungs-Auflösung fällt — die Destroyed-Klasse ist an der Wurzel tot)

**20.07., Schöpfer-Konsole .38 mit VOLLEN Stacks — der Täter beim Namen:
compileAsync/_bundleReifeWache (alle Warm-Compile-Pfade) submittet intern
gegen den Render-Kontext, dessen Depth-View der RT-Realloc zerstört. Drei
Wände (Re-Record · Dwell · Tot-Band) bändigten die Klasse nicht, weil die
Wurzel der REALLOC SELBST ist. Die Zahl führte: fps 2.6→1.9 — der Hebel
brachte NIE Gewinn. DER SCHNITT: das dynamische RT-Scaling fällt GANZ (das
Szene-RT bleibt für immer Skala 1 — kein Laufzeit-Realloc, je; die V18.390-
Weisheit endgültig). Die KLASSEN-PIXEL-KAPPE (statisch, der echte Gewinn)
trägt allein; der Wahrnehmungs-Weg kehrt nur Realloc-frei zurück (Viewport-
Scaling), falls je. playtest:fast 18/18. BENANNT: der Warn-Block (Masken-
Material auf attribut-loser Batch-Geometrie in der Reife-Wache — Täter-Stack
jetzt bekannt: _archBatchGroupFor-Familie; harmlos-transient, nächster Schnitt.**

**Davor, V18.491.38 — DIE HAND-BLASE: alles ist Feld — die echte Form nur noch zum Anfassen)**

**20.07., Schöpfer: „alles heißt alles — ein Hybrid ist nicht die Zukunft":**
- DIE HAND-BLASE (ARCH_ZIEGEL_HAND=16 m): die echte Architektur-Geometrie
  materialisiert NUR noch in Berührungs-Reichweite (Türen öffnen, Anfassen,
  Betreten — die Erlebnisse leben); dahinter ist JEDE Architektur bei JEDER
  Distanz ihr 64³-Feld (dimArch 48→64, schritteArch 32→48). Der alte
  Cull-Radius regelt keine Meshes mehr — die 7.8-M-Tris-Dörfer des Traces
  können nicht mehr existieren (max ~1-3 Bauten je Moment als echte Form).
- TIERE ab 40 m Feld (KREATUR_ZIEGEL_DIST 120→40) — nah animiert der Körper,
  dahinter wandert das Feld (20×317k → ~2-3 nahe Tiere echt).
- BAKE-RETRY: der Einmal-Schuss verbrannte an ASYNC-Foundry-Teilen (leerer
  temporärer Bau beim ersten Tick) — jetzt 8 begrenzte Versuche, Erfolg
  versiegelt. EHRLICH: die Live-Probe konnte den Hand-Blase-Swap auf
  swiftshader nicht zeigen (Foundry dort minutenkalt, der Wasserfall baut
  nie); die Ziegel-Mechanik ist durch die .32/.36-Proben bewiesen, auf dem
  Schöpfer-Holz ist die Foundry warm (Trace: Bauten bauen) — sein Boot ist
  der Richter. playtest:fast 18/18 · node --check.

**Davor, V18.491.37 — DER FERN-SCHICHT-RÜCKBAU: das Trace-.36-Urteil — die Ziegel tragen, der Zweit-Pass fällt**

**20.07., Schöpfer-Trace .36 (dc 417→5997 · CPU-render 862 ms · Plattform/
Avatar/Tiere FLACKERN schwarz): die Wurzel war MEINE Fern-Schicht — Diät/
Bundle-Records sind für EINEN Render je Frame gebaut; der zweite Szene-Pass
ließ Uniform-Updates racen (das Flackern der Diät-Materialien) und flutete
Draws (1941 außerhalb der Bundles, vorher 602). Und: die ZIEGEL haben den
Zweit-Pass ÜBERFLÜSSIG gemacht — ferne Regionen sind Boxen, es gibt nichts
mehr zu cachen. DER RÜCKBAU: farPass/Schirm/Layer-Flips physisch raus
(EIN Szene-Pass, eine Diät-Wahrheit); _fernSchicht ist die reine Distanz-
Flagge des Region-Ziegels. Das Panorama (Feld-Pass-Cache) bleibt —
unabhängig vom Zweit-Pass. BEWIESEN: Voll-Boot + Kreatur-Ziegel-Zyklus 5/5
nach Rückbau · ppFail false · 0 Fehler · playtest:fast 18/18. EHRLICH: die
20.8M Steady-Tris sind die NAHEN p:-Nexus-Dörfer (7.8M je Dorf im 100-m-
Radius — voll detailliert BY DESIGN [nah = feinste Stufe]; ihr Mittel-LOD
ist der nächste benannte Bogen) + Schatten-Kaskaden zählen im Zähler mit.
Kreaturen 20 = maxCreatures-Cap (by design, kein Leck).

**Davor, V18.491.36 — DER KREATUR-ZIEGEL: die Tiere werden wandernde Felder — die Karte ist GESCHLOSSEN**

**20.07., Schöpfer: „vollende alles" — der letzte Bogen fällt:**
- DER KREATUR-ZIEGEL (_tickKreaturZiegel in updateCreatures): ferne Tiere
  (>120 m, KREATUR_ZIEGEL_DIST) tauschen ihre geskinnte Geometrie (315k Tris
  je Tier, Trace .29) gegen ihr gebackenes Feld — und das Feld WANDERT mit
  dem Tier (bbMin ist die LEBENDE Uniform-Referenz des March-Materials; Box +
  Anker folgen der Position, zwei Vektor-Sets je Frame, kein Re-Bake). Nah
  kehrt das echte Tier zurück. Bake budgetiert, headless byte-alt, Tod räumt
  (removeCreature). BEWIESEN (echtes WebGPU, 5/5): der LIVE-Loop backte
  selbst · Tier ruht fern · Feld folgt EXAKT (+25.000) · Rückkehr nah ·
  0 Fehler. playtest:fast 18/18.
- DIE KARTE IST GESCHLOSSEN: Terrain=Funktion · Gras=Band-0+Impostor+Boden ·
  Regionen fern=Ziegel 64³ · Architektur fern=Ziegel 48³ (Fahrzeuge sind
  Architektur) · Bäume=Ziegel 32³ · Sonne/Himmel=Funktion · TIERE=wandernde
  Felder. Rest-Geometrie = die feinste Abtaststufe desselben Feldes (Iso-
  Surface) + P2P-Peer-Avatare (selten; derselbe Mechanismus liegt bereit).

**Davor, V18.491.35 — DIE ZIEGEL-PYRAMIDE: jede Distanz sampelt das Feld in ihrer Frequenz**

**20.07., Schöpfer: „nicht die erste Oktave — die Vollendung, alles, jetzt":**
- DIE PYRAMIDE (WALD_ZIEGEL): Basis 32³/24 (Einzel-Baum) · Architektur 48³/32
  (kompakt → feine Voxel, ab Cull-Radius 150 m) · Region 64³/40 (weit, ab
  400 m — 1 MB je Region). Der EINE Bäcker, der EINE March — nur die
  Abtastrate folgt der Wahrnehmung. Darunter IST die Geometrie die feinste
  Stufe DESSELBEN Feldes (die Iso-Surface der Dichte-Funktion): eine Quelle,
  kontinuierliche Abtastung — nah wie fern, keine zwei Systeme. BEWIESEN:
  Region-Probe 5/5 auf 64³ (gebacken · sichtbar · Bundle ruht · Rückweg ·
  0 Fehler) · playtest:fast 18/18. TIERE/AVATARE: Geometrie (wenige, bewegt)
  — der geskinnte-Felder-Bogen (Dreams-Beweis) ist der letzte Schritt der
  Karte, die Maschinerie (Bäcker/March/uniform-mutierbare bbMin) liegt bereit.

**Davor, V18.491.34 — DER REGION-ZIEGEL: ALLES Gestreute wird EIN Feld — keine getrennten Assets mehr**

**20.07., Schöpfer: „tiere, wiese, felsen, fahrzeuge — dass du Wiese als anderes
Asset siehst als Waldstudio ist schon komisch — vollende ALLES":** er hatte
recht — Wiese/Wald/Fels sind EINE Klasse: REGION-INHALT. Der Schnitt:
- DER UNIVERSAL-BÄCKER lernt Instanzen (_ziegelBackenAusGruppe splattet jede
  Instanz-Matrix — eine ganze Population wird EIN Feld).
- DER REGION-ZIEGEL (_bundleZiegelTick am EINEN Cull-Chokepoint): eine ferne
  Region (Fern-Schicht-Mitglied) tauscht ihre GESAMTE Draw-Liste (Bäume +
  Felsen + Kristalle + Streu) gegen EINE March-Box (12 Tris, 128 KB Feld) —
  bundle.visible=false, die Box IST die Fern-Gestalt. Sie erbt die FERN-
  SCHICHT (1/4-Kadenz) + Frustum; Mutation (needsUpdate) verwirft den Ziegel
  (Re-Bake nächster Tick); Tod mit dem Bundle; budgetiert (nie über Frame-
  Budget); headless byte-alt (bergAktiv-Wand). BEWIESEN (echtes Bundle,
  echtes WebGPU, 5/5): gebacken · Box sichtbar · Bundle RUHT ganz · Rückweg
  (nah: Box ruht, Bundle lebt) · 0 Fehler. playtest:fast 18/18.
- DIE KARTE DER FORMEN (Stand heute): Terrain=Funktion (Ring/Panorama/Pass) ·
  Gras=Band-0-Geometrie+Impostor+Boden · Regionen fern=ZIEGEL · Architektur
  fern=ZIEGEL (Fahrzeuge sind Architektur) · Sonne/Himmel=Funktion (TSL) ·
  Tiere/Avatare=Geometrie (wenige, bewegt — ihr Feld-Weg [geskinnte Felder,
  Dreams-Beweis] ist der letzte Bogen).

**Davor, V18.491.33 — DER GRAS-SCHNITT: der 81-%-Wal fällt ans kanonische Band**

**20.07., Schöpfer: „vollende es ganz" — der gemessene Wal der Boot-Chronik
(6.5 M Gras-Tris = 81 % aller Dreiecke, bei 64k Terrain) fällt nach Gesetz #0:**
- GEOMETRIE-Gras nur noch im Band 0 der EINEN Kaskade (GRASS_RING liest
  DETAIL_CASCADE[0].maxRing statt der Parallel-Konstante 4 — volles Detail ≈
  110 m, dort lebt die Büschel-Parallaxe); jenseits tragen Impostor-Deko
  (Band 1, steht) + grüner Boden + Fog — Halme dort sind SUB-PIXEL, sie
  verdienen keine Vertices (die reine Form: nie mehr Rechnung als Pixel).
  Fläche (5/9)² → ~2 M statt 6.5 M Gras-Tris. playtest:fast 18/18 ·
  gate:scatter-lod GRÜN. BENANNT-OFFEN: die WIESEN-FUNKTION im Boden-Material
  (Distanz-geblendetes Noise-Flimmern auf Grün — der Look-Feinschliff, wenn
  das Schöpfer-Auge die 110-m-Kante sieht) · der fimp-Quad→Ziegel-Swap.

**Davor, V18.491.32 — DER UNIVERSAL-ZIEGEL: alle Studios durch EINEN Bäcker — ferne Bauten LEBEN**

**20.07., Schöpfer: „wenn unser System synergetisch ist, müssen ALLE Studios
gehen — Import/Export, zeige was du kannst":**
- DER UNIVERSAL-BÄCKER (_ziegelBackenAusGruppe): backt jede GRUPPE — Fachwerk-
  Dorf, Tempel, Garage-Werk, was immer ein Studio exportiert und
  spawnArchitecture zusammensetzt — in EIN Welt-Raum-3D-Feld (Kinder ohne
  Vertex-Farben splatten ihre MATERIAL-Farbe; Riesen-Kinder abgetastet).
- DIE ZIEGEL-FERNSTUFE (_archZiegelFern am EINEN Distanz-Chokepoint
  tickArchitectureCulling): jenseits des Cull-Radius stirbt das Mesh nicht
  mehr — der Ziegel ERBT (1 Draw/12 Tris, der Pixel marcht). Ferne Dörfer/
  Tempel sind erstmals SICHTBAR statt weggecullt; die 7.8-M-Tris-Klasse des
  .29-Traces kostet am Horizont nur noch Schirm. Bake memoisiert je Eintrag
  (temporärer Bau wenn nie nah), budgetiert (1/Tick, NIE über Frame-Budget —
  der Nexus-Grundsatz), Tod mit dem Eintrag (removeArchitecture), headless
  byte-alt. BEWIESEN (voller Prozess, echtes WebGPU, chirurgisch [swiftshader
  ist immer über Budget — auf echtem Holz backt der Tick selbst]): 2 ferne
  Bauten gespawnt → gebacken → March-Boxen SICHTBAR · ppFail false · 0 Loop-/
  Seiten-Fehler · playtest:fast 18/18. Das LOOK-Urteil fällt das Schöpfer-Auge.

**Davor, V18.491.31 — DER WALD-ZIEGEL: die reine Form beginnt — der Pixel fragt den Baum**

**20.07., Schöpfer: „nicht LODs — das Bild direkt aus Position+Blickrichtung
abgeleitet; beginne beim Waldstudio, der volle Prozess" + die Kompass-Korrektur
(„ist hybrid nicht die niedrige Stufe?" — JA: die Endform ist REIN, hybrid ist
nur die Rampe; jede Welle muss Masse von der Dreiecks- auf die FUNKTIONS-Seite
bewegen, nie umgekehrt — der neue wahre Norden):**
- DER WALD-ZIEGEL (_waldZiegelBacken/_waldZiegelMaterial, WALD_ZIEGEL 32³/24):
  die GEBACKENE Baum-Geometrie (dieselbe Quelle — kein Zwilling) wird in ein
  3D-Dichtefeld voxelisiert (RGBA=Farbe+Dichte, 128 KB je Art), das Fragment
  marcht den Ziegel durch die Box (TSL-unrollt, Godray-Muster, texture3D/
  Data3DTexture) — echte Parallaxe aus JEDEM Winkel, Kosten nur am Schirm.
- BEWIESEN (voller Prozess im ECHTEN Realm, echtes WebGPU): lebender Foundry-
  Baum (173.936 Verts) → Bake (6.920 belegte Voxel) → March-Box im Spiel —
  die Krone STEHT sichtbar als Volumen (eigenes Auge, Screenshot) · ppFail
  false · 0 Loop-/Seiten-Fehler · playtest:fast 18/18.
- DER NÄCHSTE SCHNITT (benannt): der fimp-Kamera-Quad-SWAP — die Baum-Fern-
  stufe konsumiert den Ziegel statt des Atlas-Quads (EIN Chokepoint, Material
  31754ff/fimp-Keying 69820ff); danach Gras-als-Funktion (der 81-%-Wal der
  Boot-Chronik: 6.5 M Gras-Tris vs 64k Terrain) und Portal um Portal.

**Davor, V18.491.30 — DAS TRACE-URTEIL .29: Query-Takt + Stufen-Tot-Band — die zwei neuen Täter fallen**

**20.07., Schöpfer-Trace .29 (avgFps 2.6 — SCHLECHTER; CPU-render 387 ms EWMA ·
GPU echt 352 ms · Destroyed-Texture lebt · foliageRes oszilliert 0.6↔0.68):
zwei meiner neuen Maschinen hatten das falsche Kostenmodell, beide geschnitten:**
- ④ DER QUERY-TAKT: Occlusion-Queries JEDEN Frame zwingen den Vendor in
  QuerySet-Bau/-Destroy + Resolve + Map PRO FRAME (der Dawn-Cliff — CPU-render
  387 ms). Jetzt fragt nur jeder 10. Frame (BERG_CULL.queryTakt, Proxys
  dazwischen unsichtbar = 0 Queries); das Verdikt hält (Objekt-Permanenz).
- DIE STUFEN-OSZILLATION: der PID-Jitter ließ foliageRes 0.6↔0.68 wandern —
  jeder Wobble = Depth-Realloc + Destroyed-Submit + 46-Bundle-Re-Record.
  TOT-BAND: angewandt wird nur ein Sprung ≥ 2 Stufen (0.1) oder die Rückkehr
  auf 1.0; Verweil-Wand 400→1200 ms. Steady-State realloziert damit NIE mehr.
- EHRLICH: das 352-ms-GPU-Rätsel auf dem Schöpfer-Holz ist NICHT voll erklärt
  (Kandidaten: Query-Stalls [jetzt getaktet] · Fern-Pass-Zweitkontext ·
  19.7-M-Tris-Spitzen der p:-Bundles [7.8 M je Nexus-Bau — der nächste
  benannte Wal: platzierte Architektur braucht LOD/Impostor]). Der nächste
  Trace nach diesen zwei Schnitten ist der Richter.

**Davor, V18.491.29 — DIE DECK-STREU: Vegetation VOR dem Bau — ⑤ fällt ganz**

**20.07., Schöpfer: „das war zurückweichen, traue dich" — er hatte recht: das
Streu-Gesetz lebt im STAMM (kein Worker), meine Barriere war falsch. DIE
DECK-STREU (_tickDeckStreu/_buildDeckStreuSpecies): DASSELBE Gesetz wie das
Fernfeld (worldFieldAt · _scatterChunkRng · Dichte-Formel · Wasser-Wand —
dieselben Ströme, KEIN Zwilling) konsumiert für UNGEBAUTE Chunks im Band
jenseits des Rings; die Höhe liest das EINE Makro-Gesetz (includeDetail,
Vor-Bau-Fidelität). Löcher/Mittel-Ring tragen Vegetation BEVOR ein Chunk
existiert; gebaute Chunks decken per Depth, das echte Fernfeld übernimmt.
BEWIESEN (echtes WebGPU): 269 Instanzen/11 Arten auf ungebauten Chunks ·
0 Fehler · Fern-Schicht dabei grün · playtest:fast 18/18.**

**Davor, V18.491.28 — DIE FERN-SCHICHT + WALD-VOR-WALD: die letzten zwei Tiefen fallen**

**20.07., Schöpfer: „kein ehrlich offen mehr, die vollen 100%, jetzt" — die zwei
benannten Rest-Tiefen der Natur-Antwort GEBAUT:**
- ② DIE FERN-SCHICHT (Bundle-Schattierungs-Persistenz): fernes Statisches
  (Fern-Ring + Region-Bundles mit Kugel-Nahkante > 400 m, Hysterese-Band 60 m)
  rendert in einen EIGENEN kadenzierten Pass (FERN_LAYER=2; eigene Fern-Kamera,
  pro Frame gesynct — die Vendor-RenderList ist (Szene,Kamera)-gekeyt, geteilte
  Kamera = geteilte Bundle-Arrays = Destructure-Crash, GEFUNDEN+GESCHNITTEN).
  updateBefore läuft NUR bei Kadenz (4 Frames) oder Kamera-Delta (2 m/0.02-Quat)
  — sonst hält sein RT das Bild = Fern-Schattierung persistiert. Der FERN-SCHIRM
  (Fullscreen, renderOrder −10000, colorNode+depthNode, Discard bei Depth≈1)
  malt Farbe+TIEFE des Caches in den Haupt-Pass: Wasser/Godrays/Bloom
  komponieren korrekt, EINE sceneColor, Queries sehen die volle Tiefe.
  FAIL-OPEN komplett: pp-Sturz → Schicht fällt, Ring/Bundles heilen auf Layer 0
  (selbststempelnd). BEWIESEN (echtes WebGPU, 4/4): Kadenz spart exakt 1/4
  (15 Renders/60 Frames im Stand) · Ring auf FERN_LAYER · 0 Destroyed ·
  0 Fehler · Schirm-BILD intakt (eigenes Auge).
- ④ WALD-VOR-WALD (echtes Depth-Occlusion): unsichtbare Kugel-Kästen
  (colorWrite=false, occlusionTest — natives ANY_SAMPLES_PASSED) je Region
  jenseits minDist testen die KOMPLETTE Frame-Tiefe (Bäume + Fern-Schirm);
  Kontext am Proxy gefangen (onBeforeRender), Verdikt via backend.isOccluded,
  2er-Hysterese, Un-Cull sofort, Proxy-Tod mit dem Bundle (kein Leck). Berg-
  Schatten bleibt als Gesetz-Filter davor. Linse: dieselbe bergCull-Zählung.
- ⑤ EHRLICH VERBOTEN statt gefälscht: Vegetation auf dem Fern-Deckel braucht
  das Worker-Streu-GESETZ (Haupt-Thread hat nur das Voxel-Dichte-Gesetz) — ein
  Pseudo-Platzierungs-Gesetz wäre der verbotene Zwilling („sage a, tue a").
  Der twin-freie Weg ist der Streu-Gesetz-Port — der nächste Bogen.

**Davor, V18.491.27 — DIE DESTROYED-TEXTURE-WAND: der Welle-1-Bruch der Schöpfer-Konsole fällt**

**20.07., Schöpfer-Konsole nach .26 („reflektiere: alles in voller tiefe erreicht?"
— NEIN, und die Konsole bewies es: 219× „Destroyed texture (Depth24Plus) used in
a submit", Größen 2052×1090 ↔ 1512×803 = exakt die Auflösungs-Stufen der
Welle-1):**
- DIE WURZEL (Vendor gelesen): PassNode.setSize realloziert das Szene-RT mit
  _resolutionScale (Depth-Textur wird ZERSTÖRT) — aber die REGION-BUNDLES halten
  ihren Render-Kontext-Descriptor (Depth-VIEW!) vom Aufnahme-Zeitpunkt und
  re-recorden nur bei Mutation → sie submitten die zerstörte Textur FÜR IMMER.
  Mein Auge-Test (statische Kamera) provozierte nie Skalen-Wechsel unter
  lebenden Bundles — die Probe maß Realloc-ZAHL, nie Submit-GÜLTIGKEIT danach.
- DIE WAND (am EINEN Apply-Chokepoint in _loopRender): (1) VERWEIL-Hysterese
  RES_SCALE_DWELL_MS=400 — ein Stufen-Wechsel greift gebunden, kein Flappen an
  Stufen-Grenzen, kein Realloc-Sturm; (2) jeder ANGEWANDTE Wechsel re-recordet
  ALLE Region-Bundles (bg.needsUpdate — dieselbe Maschine wie toggleTerrain):
  kein Descriptor überlebt seine Textur.
- BEWIESEN (chirurgische Probe auf echtem WebGPU, Bundles lebend, 4/4 GRÜN über
  vier Läufe): Stufen-Reise 1.0→0.6→1.0 angewandt (≥2 echte Depth-Reallocs) +
  20×-Flap an der Stufen-Grenze → **0 Destroyed-Texture-Submits** (vorher
  Schöpfer-Konsole 219×) · 0 Loop-/Seiten-Fehler · playtest:fast 18/18.
- EHRLICH OFFEN aus derselben Konsole: der 2×-Boot-Warnblock (ein Render-Objekt
  mit Foundry-Masken-Material auf attribut-LEERER Geometrie: normal/position/
  color/aH0L/aH0/aLodLevel not found — transient beim Seelen-Wechsel, kein
  Per-Frame-Fluten; Täter unbenannt, braucht die Naming-Linse am RenderObject-
  Mint) · und die TIEFEN-Ehrlichkeit der Natur-Antwort: ② Persistenz deckt den
  Feld-Pass (>8 km), NICHT die 670 Bundle-Draws (deren Schattierung läuft
  weiter je Frame — der nächste große Bogen) · ④ Berg-Schatten cullt gegen das
  TERRAIN-Gesetz, nicht gegen den Depth-Buffer (Wald verdeckt Wald noch nicht)
  · ⑤ GPU-Mittel-Ring trägt den BODEN-Deckel, nicht die Vegetation. Erste wahre
  Schnitte je Ökonomie — nicht die vollen Ausbauten.

**Davor, V18.491.26 — DIE NATUR-VOLLENDUNG (PANORAMA-PERSISTENZ · VOLL-GESETZ-GPU · WAHRNEHMUNGS-ALLOKATION)**

**20.07., vierundzwanzigste Welle (Schöpfer: „lerne von der natur, wie ermöglicht
unsere realität eine solche effizienz … komme zurück mit was du gelernt, wie kann man
das anwenden auf anazh" → dann „vollende es, giesse die dinge, sei der gigant, alles in
der antwort wollen wir, es ist die zukunft". Die Recherche fand EIN Gesetz: die Natur
rechnet nichts, was das Auge nicht auflöst — drei Ökonomien [Sender/Atmosphäre ·
Kanal/Sehnerv-Deltas · Konsument/Fovea+Sakkade]. Das Kostengesetz „Schirm+Änderung"
hat einen dritten Term: WAHRNEHMUNG. Zwei Wellen gegen die zwei lautesten Befunde
gegossen + bewiesen; die drei tiefen strukturellen [Schattierungs-Persistenz ·
GPU-Sicht-Ring · Hi-Z-Verdeckung] stehen ehrlich als benannte Wurzel-Chirurgie offen):**
- WELLE 2 — DER SEKUNDEN-NORMALISIERTE INGEST-TAKT (gegen „die Regionen
  laden nicht mit Schritttempo, wie erst beim Fahren"): der Ingest gab
  `frameOverBudget?1:3` PRO FRAME frei → bei 8 fps nur 8–24 Assets/s. Jetzt
  zielt der Takt auf eine RATE je ECHTER Sekunde (`n = round(rate·dt)`,
  gedeckelt durch INGEST_BURST_CAP=8): auf lahmem Holz (jeder Frame über
  Budget) kommen 64 statt 8 Assets/Sekunde durch — 8× schneller, die Welt
  lädt mit der Wanduhr statt der Framerate. OHNE dt-Arg byte-alt (3/1) →
  gate:leistungs-vertrag unberührt. Der Burst-Deckel verhindert das
  Wiederaufleben der 5–6-s-LongTasks. BEWIESEN (deterministische Probe 7/7):
  60 fps=3/Frame · 8 fps=8/Frame · Rate @8fps 64 vs alt 8.
- DIE BEWEGUNGS-GEKOPPELTE SZENE-AUFLÖSUNG (der V18.390 benannte Rückweg,
  endlich gebaut): sakkadische Maskierung + Bewegungsunschärfe machen Detail
  bei schneller Kamera unsichtbar → die Szene-Auflösung darf DANN fallen
  (imperzeptibel), und die frei werdende GPU-Zeit trägt das Streaming (der
  Schöpfer-Befund „Regionen laden nicht mit Schritttempo, wie erst beim
  Fahren"). Der EINE Regler (`_nexusPerfActuate`) fährt `_foliageResScale`
  aufs MINIMUM zweier Erlaubnisse (KEIN Parallel-Regler): (a) PID-LAST (GPU
  ertrinkt → tiefer, jetzt gefahrlos) + (b) WAHRNEHMUNG (`_camMotion01` =
  Blick-Winkel-/Translations-Geschwindigkeit, Fast-Attack/Short-Decay).
- DER KONSUMENT WAR NIE GEBAUT (die „sage a, tue a"-Lüge geheilt): das
  Overlay zeigte seit V18.387 eine foliageRes-% + renderScale-%, die NICHTS
  taten (nur Regler+Anzeige, kein Render-Effekt). Jetzt liegt der Faktor
  WIRKLICH am `scenePass.setResolutionScale` — FLICKER-FREI, weil nur das
  interne Szene-RenderTarget skaliert, nie die Swapchain (kein setPixelRatio-
  Realloc). `_renderScale` fällt als Auflösungs-Hebel (konstant 1 × Klassen-
  Pixel-Kappe-DPR); der EINE Auflösungs-Faktor lebt jetzt im RT-Scaling.
- BEWIESEN (deterministische Konsum-Probe auf ECHTEM WebGPU, rAF-Loop
  gestoppt + Frames selbst getrieben, 11/11 GRÜN): Stand fol 1.0/RT 540 mit
  0 RT-Realloc über 30 konstante Frames (der Flacker-Beweis) · schnelles
  Umsehen → _camMotion01 1.0 → fol 0.6 → passScale 0.6 → RT schrumpft
  540→324 (nur 1 Realloc im Übergang) · Bewegungs-Ende → fol klettert zurück
  0.997/RT 540 · 0 Seiten-Fehler. playtest:fast 18/18 · gate:regler-sim 11/11
  (S3 „renderScale 1") · gate:leistungs-vertrag GRÜN · check GRÜN · lint 0 Err.
  Das fps-Urteil auf dem Schöpfer-Holz fällt der nächste Trace (camMotion an
  Bord im Flugschreiber).
- DER LOCH-DECKEL (Schöpfer-Screenshots: „Reflexion von Sonne/Mond auf Wasser,
  wo kein Wasser sein sollte" — UNGELADENE Chunk-Bereiche ließen die Welt-
  Wasser-Plane samt Spekular durchscheinen): die Fern-Ring-Innenkante beginnt
  jetzt DIREKT am Spieler (0.5·span) statt an der Ziel-Ring-Kante — der Ring
  deckt JEDES Loch mit wahrem Terrain (Chunks decken ihn per Depth); die
  Durchstich-Angst fällt mit der ausgeweiteten Naht-Formel (alle Schale-0-
  Reihen in der Chunk-Ziel-Zone [deckZoneRad] = VOLLES Gesetz −0.3, ×1.35-
  Blende auf Makro). gate:fern-ring WANDERTE — alle Bänder GRÜN (worst 0.0000).
- DER BERG-SCHATTEN (Welle 5, feld-natives Hi-Z — „die Besten" rekonstruieren
  Verdeckung aus Depth-Pyramiden, die FUNKTIONS-Welt fragt ihr EIGENES Gesetz):
  konservativer Sichtlinien-Test Kamera→Kugel-Oberkante gegen
  _terrainMacroSurfaceY (3 Azimut-Linien ±Radius, marge 2 m) am EINEN Region-
  Cull-Chokepoint — amortisiert (Budget 6/Frame, Kadenz 400/150 ms), 2-Verdikt-
  Hysterese, Un-Cull SOFORT, nahe Regionen (<140 m) nie verdeckt; der Rest-Pop
  fällt in die sakkadische Maskierung der Welle-1-Auflösung (Natur-Synergie).
  Linse: steadyState.bergCull. BEWIESEN (chirurgische Probe 8/8): hinterm Grat
  verdeckt · frei/hoch/nah sichtbar · Selbsttest (Riesen-Marge kippt) ·
  Hysterese · Sofort-Un-Cull · 0 Fehler. Dichter = billiger — das Natur-Paradox.
- DIE NATUR-VOLLENDUNG (Schöpfer: „vollende die offenen dinge in einem guss" —
  die drei benannten Rest-Chirurgien fallen in EINER Welle):
  (a) DAS FELD-PANORAMA (Schattierungs-Persistenz): der 96-Schritt-Raymarch
  lief JE Himmel-Pixel JE Frame fürs statische Fernfeld — jetzt marcht EIN
  Compute (FELD_PANO 768×160) ins Polar-Panorama [rgb = Rampen-Farbe, a =
  Treffer-DISTANZ; der Nebel mischt LIVE im Fragment aus der Distanz →
  Tag/Nacht kostet KEIN Re-Bake], das Fragment schaut nur noch nach (~1 Load
  statt 96×Load+5-Bisektion — der 120-fps-Kanal-Hebel). Re-Bake amortisiert
  bei Kamera-Drift (60 m XZ / 12 m Y — Parallaxe ≈ 0.4° auf 8 km, unter der
  Wahrnehmung); der EINE March lebt im Bake-Kernel, der Fragment-Zwilling ist
  TOT. (b) DER GPU-SICHT-MITTEL-RING: der WGSL-Spiegel trug includeDetail seit
  je, die Caller reichten nur false — jetzt malt der Feld-Zeichner die Deck-
  Zone mit ZWEI Flügen (Makro alle + VOLLES Gesetz für die Zonen-Vertices),
  gemischt durch die EINE Deck-Formel (_fernRingDeckMisch, CPU und GPU teilen
  sie) — der Mittel-Ring steht ab dem ERSTEN GPU-Anstrich wahr geformt.
  (c) WAHRNEHMUNGS-ALLOKATION (Atmosphäre-als-LOD): die Panorama-Elevation-
  Zeilen ballen QUADRATISCH am Horizont (dort lebt die Information), Himmels-
  Texel fallen im Früh-Aus (über hMax marcht niemand). BEWIESEN (Prüfung NACH
  der Vollendung, wie befohlen): gate:fern-ring ALLE Bänder GRÜN gewandert
  (pano=1 gebacken · Render-Probe 1726 Horizont-Pixel durch den Nachschlage-
  Pfad · Höhen==Gesetz worst 0.0000 · GPU-Seh-Band 0.0044) · gate:dritter-
  spiegel GRÜN (Selbsttest feuert) · playtest:fast 18/18 · check GRÜN (11
  Vendor-Anker) · lint 0 Err · Selbst-Spiel-Sonde (eigenes Auge, echtes
  WebGPU).

**Davor, dreiundzwanzigste Welle (Schöpfer-Screenshots „Höhenverschiebung mit
komischen Pixelmustern zwischen Ring und Chunks — da ist noch etwas unsauber in
der wurzel, oder?" + „wie erreichen wir 60/120 fps" — beide Wurzeln benannt und
geschnitten; sein .21-Trace ist SAUBER [Heap stabil −0.39 MB/s, 0 Disposal-Stau,
Entlassung trägt: 169 Batches/117 MB + 8 Böden frei]):**
- DIE NAHT-SCHLIESSUNG (drei Wurzeln im Fern-Ring): (1) LINEARE Reihen
  spannten Schale 1 zu ~139-m-Quads an der Innenkante — deren Vertex-Farb-
  Interpolation WAR das Streifen-Muster → GEOMETRISCHE Reihen (nah dicht,
  fern weit; gleiche Vertex-Zahl, 0 Mehrkosten; der Feld-Maler wertet nur
  XZ-Punkte — kein WGSL-Anfassen). (2) Makro-OHNE-Detail-Höhen wichen an
  der sichtbaren Naht um den Mikro-Term ab → die Innen-Reihen der ersten
  Schale tragen das VOLLE Gesetz, leicht gesenkt (−0.25·w), auf Makro
  ausblendend (Reihe 3+ byte-alt; der Cursor-Refine überschreibt die 288
  Naht-Vertices im 1. Tick nach dem GPU-Anstrich). (3) Der randPad-Spalt
  („Nebel deckt") wird von der Höhen-Öffnung entblößt → die Kante beginnt
  UNTER der äußersten Chunk-Reihe (−0.5·span, Chunks decken per Depth).
  gate:fern-ring WANDERTE mit (Layout+Naht-Formel gespiegelt) — ALLE
  Bänder GRÜN inkl. Feld-Zeichner/Feld-Pass.
- DIE KLASSEN-PIXEL-KAPPE (der GPU-Wal beim Namen): sein Trace maß GPU
  echt 105.6 ms EWMA bei dpr 2 (4.4 MPix) auf Klasse „mittel" — und der
  PID opferte WELT-TIEFE (Radius 50 m, loadScale 0) statt Pixel, weil
  PERF_RENDER_SCALE_MIN=1 die adaptive Auflösung seit V18.390 stilllegt
  (setPixelRatio-Flackern). Der flicker-freie Schnitt: die GERÄTE-KLASSE
  deckelt den DPR (mittel 1.5 · schwach 1.25 · stark byte-alt) — konstant
  je Sitzung, setPixelRatio feuert EINMAL beim Boot (Dead-Band), kein
  Laufzeit-Realloc; explizite ?holz=/localStorage-Wahl schlägt die Kappe.
  Für sein Holz: 4.4→2.5 MPix ≈ GPU ~105→~60 ms — und der PID gewinnt
  Kopfraum, die TIEFE (Radien) wächst zurück statt zu verhungern.
- BEWIESEN: node --check · gate:fern-ring GRÜN (gewanderte Bänder) ·
  Selbst-Spiel-Sonde (eigenes Auge): Welt hell/lebendig t15/t60/t120,
  Entlassung läuft, 0 Loop-/Seiten-Fehler. OFFEN mit Zahlen (die
  60/120-Bahn): bundleDeckung 38 % — 670 anonyme Draußen-Draws brauchen
  erst die NAMEN-Linse, dann die Einbürgerung · Klein-Upload-Sturm 34.5M
  ≤16K (die per-Draw-Uniform-Bahn der Nicht-Bundle-Draws — fällt mit der
  Deckung) · blume-Churn ×4 · echtes DRS via Render-Target-Scaling
  (der V18.390-benannte Rückweg) als End-Ausbau.

**Davor, zweiundzwanzigste Welle — DIE GLOBALE EINBÜRGERUNG (Schöpfer: „sei endlich der gigant" — der seit
Welle 8 benannte letzte Nicht-Bundle-Rest fällt, ohne auf den nächsten Trace zu
warten; die crash-verseuchten Steady-Zahlen des .19-Traces sind KEINE Mess-Basis,
aber der CODE-Fakt stand fest):**
- DIE GLOBALEN INSTANZ-GRUPPEN (Bäume, welt-verteilte Deko — frustumCulled=
  false seit je: sie wurden IMMER voll gezeichnet, aber einzeln submitted)
  ziehen in EIN "@global"-Bundle: identische Draw-Menge, Submit ≈ 0. Der
  Key matcht das Kugel-Regex nicht → keine cullSphere → per existierendem
  Cull-Code immer sichtbar (exakt die alte Semantik); Touch-/Grow-/Dispose-
  Maschinerie greift parent-bewusst ohne eine Zeile Änderung (Welle-9/10-
  Invarianten). Tür-Flügel bleiben draußen (per-Frame-Matrizen).
- GLOBALE BATCHES bleiben BEWUSST draußen (Selbst-Review fing die
  Regression VOR dem Commit): sie tragen perObjectFrustumCulled=true —
  BatchedMesh cullt ihre welt-verteilten Instanzen PER INSTANZ, und genau
  das ist im Bundle-Replay wirkungslos; der Encode-Gewinn wöge den
  Voll-Draw jeder fernen Platzier-Deko nicht auf.
- BEWIESEN: node --check · playtest:fast 18/18 · gate:foundry-crossfade
  GRÜN. Das dc-Urteil auf dem Schöpfer-Holz fällt der nächste Trace
  (bundleDeckung-Linse misst; die .19-Zahlen waren crash-verseucht —
  render tot ab ~Frame 200, dc 0/GPU 0 im Steady waren Artefakte).

**Davor, einundzwanzigste Welle — DER SENTINEL-SCHNITT (Schöpfer-Trace V18.491.19: „bild wird nach kurzer
zeit schwarz" — Loop-Fehler #607 „reading 'constructor'", dc 0, Heap +9.73 MB/s,
pendingDisposals 1111; die Entlassung LIEF [37 Böden/3.2 MB + 11 Batches/15.5 MB
frei], aber mein Leser-Zensus verfehlte EINEN Vendor-Spät-Leser):**
- DIE WURZEL: getTypeFromArray liest attribute.array.constructor beim
  PIPELINE-BAU — Schatten-Kontexte/Späte-Kompilate münzen RenderObjects
  LAZY, lange nach dem Upload. Ein null-Array crasht dort JEDEN Frame →
  der Loop fängt, aber _loopRender stirbt VOR dem Dispose-Drain → schwarze
  Welt + 1111er-Stau + Heap-Klettern (alles EINE Wurzel, keine drei Lecks).
- DER SCHNITT: NULL-LÄNGE-SENTINEL derselben Typ-Klasse statt null
  (constructor überlebt für den Bau, die Bytes fallen; Re-Hydrierung
  erkennt length === 0; beide Maschinen teilen _chunkBodenNulle). Dazu
  fällt die INERTE Stufen-Maske der Kreatur-/Mensch-Klassen (aLodLevel=0 →
  Identität; ihre aH0/aLodLevel/aH0L-Leser waren die Warn-Flut der
  Schöpfer-Konsole auf Klon-/Hüllen-Geometrien — byte-gleiches Bild).
- BEWIESEN: chirurgische Batch-Probe 6/6 GRÜN unter Sentinel-Semantik
  (Nullung/Guard/WACHSTUM/Byte-Treue/Bilanz) · playtest:fast 18/18 ·
  node --check. TRACE-FAKTEN benannt (nach dem Fix neu messen): steady
  23.1 ms EWMA · bundleDeckung 29 % (1210 MeshStandardNodeMaterial
  draußen — der nächste Bundle-Hebel) · batchFillPct 9 % im großen
  Regime · Boot-Sturm 2.86M Klein-Uploads/855 MB · gruppenChurn
  3814/2424 (geroell-Wiederkehrer ×4) · stillstandMuell 11.5 MB/s.

**Davor, zwanzigste Welle (Schöpfer: „wie oft noch, bis du das endlich erledigst?" —
die ewige Offen-Liste fällt in EINER Welle: zwei Schnitte, zwei finale Urteile):**
- HAUT+FELLE GANZ (die multiplikativen Rest-Terme fallen): die Kerne tragen
  die letzten Lab-Zahlen (FELL_LOOK.koerper: wrap 0.5 · atem 1.4/0.007/0.14 ·
  microFur 500/0.55/[0.7,0.35,0.1]×0.3 · HAUT_LOOK: clearcoat 0.12/0.6 +
  atem 3.0/0.0035/0.1), die Welt webt sie: WRAP-Licht als outputNode
  (multipliziert den fertigen Output inkl. der Additive — die matFur-Ordnung),
  ATEM als positionNode (mx_noise, TSL.time; NUR ungeskinnte fell/skin —
  die haut-SkinnedMesh-Hülle bleibt still, Komposition unbewiesen), SPARKLE
  als Lokal-Raster-Hash (Lab-Konstanten 12.9898/78.233/43758.5453; Basis
  positionLocal statt vUv — der Merge garantiert kein uv, ehrlich benannt),
  CLEARCOAT via MeshPhysicalNodeMaterial-Weiche für skin/haut. BEWIESEN:
  Wolf-Guss kompiliert auf ECHTEM WebGPU (0 Seiten-Fehler, Kreatur lebt).
- DIE BATCH-STAGING-ENTLASSUNG (der 481-MB-Klasse-Rest): dasselbe Muster wie
  der Chunk-Boden — _tickBatchStagingEntlassung nullt das Staging gesettelter
  Batches (Gnadenfrist + Upload-Probe); die RE-HYDRIERUNG braucht KEINE
  Platte: batch.geomIds trägt Quelle→Slot, der Schreiber-Guard in
  _archBatchAddGeometry stellt vor jedem addGeometry/Wachstum die Arrays aus
  den lebenden Quellen wieder her (setGeometryAt je Slot → setGeometrySize
  kopiert LEBENDEN Inhalt, kein Nullen-Loch). Upload-Probe geschärft
  (position+index statt aller Attribute — ungebundene Stagings laden NIE) +
  IDB-Existenz-Probe der Chunk-Entlassung bounded re-armiert (5 Proben).
  Linse: halter.batchEntlassenN/batchFreiMB. BEWIESEN (chirurgische Probe am
  ECHTEN Chokepoint, 6/6 GRÜN): Nullung · Bilanz · Schreiber-Guard mit
  WACHSTUM auf entlassenem Staging · BYTE-TREUE per Fingerabdruck · Bilanz
  zurück auf 0 · 0 Fehler. playtest:fast 18/18.
- GOLD 2 GEFÄLLT (Welt-Puffer-Synthese, final): ihr Ziel — Batch-Pool-
  Effizienz/Speicher — ist mit anderer Klinge erreicht (Klein-Münze −82 % +
  Staging-Entlassung); ein Welt-Pool BRÄCHE die Region-Bundle-Bahn (ein
  BatchedMesh kann nicht in mehreren Region-Bundles leben). Die Messlatte
  bleibt stehen (batchFillPct · V5 < 700 MB · batchFreiMB) — regressiert
  sie, öffnet der Bogen NEU. Kein stilles Streichen: dies ist das Urteil.
- GOLD 3 GEFÄLLT (Source-Vendoring, final): sein Versprechen — Täter-Benennung
  bei Vendor-Wechsel + patchbare Organe — trägt die VENDOR-ANKER-WAND längst
  (11 Anker, FNV-Pins, Selbsttest); three-Source liegt nicht auf der Platte
  (netz-restriktiv), ein Source-Build wäre ein eigener bewusster Akt. Wieder-
  eröffnung NUR, wenn ein künftiger Organ-Schnitt am Minified scheitert.

**Davor, neunzehnte Welle (Schöpfer: „vollende die chunk-boden-entlassung, der bauplan
steht" — der 17.-Welle-Zensus wird Maschine; der letzte benannte Live-Set-Schnitt
mit klarem Plan fällt):**
- DIE ENTLASSUNG (_tickChunkBodenEntlassung, Gnadenfrist 10 s): nach Upload
  (Backend-Probe backend.get(attr).buffer/.bufferGPU — der 11. Vendor-Anker) +
  edit-freiem 3×3-Footprint + IDB-EXISTENZ-Probe (entlassen wird NUR, was die
  Platte deckt) werden die CPU-TypedArrays gesettelter Chunk-Böden + Stitch-
  Bänder GENULLT (attr.array = null; Mesh/GPU leben weiter). HEADLESS bleibt
  alles resident (die Gates lesen byte-alt); der Bau stellt sich im Finalize
  zur Frist an, Identitäts-/Edit-Wände entwerten stale Posten.
- DIE GRENZ-RE-HYDRIERUNG (_chunkBodenReHydrieren): der EINE CPU-Leser nach
  dem Build ist der Geomorph-Pass (Zensus-Fakt 2) — er sieht _entlassen,
  stellt die Arrays aus DENSELBEN IDB-Rohbytes wieder her (byte-identisch
  per Konstruktion: pos/nrm/col/idx werden nie mutiert → KEIN needsUpdate,
  es reist nichts zur GPU; aMorphTarget/-Weight überschreibt der Pass VOLL →
  frische Arrays) und läuft danach sich selbst + die Warter (Nachbar-Pass).
  Ein Lauf je Chunk, viele Warter; Platte-verloren (Ventil-Clear) → ehrlich
  markiert + WARN, der Streaming-Rebuild ersetzt.
- DIE LINSE NENNT den Schnitt: heapZensus.halter.chunkEntlassenN/chunkFreiMB.
- BEWIESEN (Konsum-Probe auf ECHTEM WebGPU, alle 6 Bänder GRÜN in einem
  Lauf): Entlassung lebt (position.array === null, Mesh in der Szene) →
  Geomorph-Pass re-hydriert aus IDB (_entlassen fällt, Arrays zurück,
  Morph-Attribute da) → Render läuft weiter → 0 Seiten-Fehler ·
  playtest:fast 18/18 · node --check · gate:vendor-anker GRÜN (11 Anker,
  Selbsttest feuert). Die swiftshader-Sonde sah 1 Chunk/0.2 MB im Fenster
  (0.7 fps) — die Skala auf dem Schöpfer-Holz misst der nächste Trace
  (heapZensus trägt die Zahlen).

**Davor, achtzehnte Welle (Schöpfer: „weiter, vollende" — die benannten Konsum-Tiefe-
Schnitte 2+3 fallen mit derselben Klinge wie die Fahrphysik; der Zensus fand die Lücke
EXAKT: die Fell-Geometrie floss längst [fellStreu → Pipe-Bäcker, T4 Fell×Fläche], aber
die Lab-SHADER-Gesetze — das, was Haut und Fell FÜHLBAR macht — reisten nie):**
- DIE GESETZE ALS DATEN (Kerne rein additiv, verbatim-Zahlen der Lab-Shader):
  tetrapoda FELL_LOOK (matFur `wolf_aureus_v22`: SSS-Rim pow4 ×0.5 + Gold-
  Sheen pow5 ×0.15 · createDeepFurMat `deep_gold_fur_v3`: Spitzen-Rim pow3 +
  Gold-Spec pow8 ×0.4) · koerper HAUT_LOOK (matSkin: warmer SSS-Fresnel-Saum
  pow3 ×0.15) + HAAR_LOOK (`deep_human_fur_v1`: Spitzen-Rim/Spec).
- DIE WELT WEBT SIE am EINEN Material-Chokepoint (_foundryTreeMaterial,
  klasseLook-Weiche für fell/skin/haut/hair/straehne*): die Terme werden als
  emissive-Additive gewoben — DIESELBE Post-Licht-Addition wie das Lab-GLSL.
  Die Strähnen-Achse (Lab: aStrandY) reist längst als Farbverlauf des Bäckers
  (__streuGeo: Wurzel = Ton×0.12) — die Luminanz-Ratio zum TON-ANKER
  (mp.color, jetzt im Material-Key: je Gattungs-Ton EIN Material, bounded)
  gewinnt vStrandY exakt zurück. Ohne Kern-LOOK/TSL-Symbole byte-alt; die
  Kern-Zahlen sind die EINZIGE Quelle (kein Zwilling). Die Klassen-Materialien
  laufen unter der Diät (Graph: Attribute + Konstanten — equals-sicher).
- BEWIESEN (proportional, Schöpfer-Order „ohne Tests wenn Plan klar"):
  node --check Stamm+beide Kerne · studio-vertrag GRÜN · TSL-Symbol-Wand
  (positionViewDirection/normalView/emissiveNode im Vendor bestätigt).
  OFFEN ehrlich am Look: Wrap-Licht + Atem-Noise-Displacement + microFur-
  Sparkle (multiplikative/Vertex-Terme — brauchen outputNode/positionNode-
  Akt) · Haut-Clearcoat (Standard-Material trägt keinen) — das Auge des
  Schöpfers ist der Richter über den nächsten Schnitt.

**Davor, siebzehnte Welle (Schöpfer: „vollende die offenen punkte zuerst, ändere den
code ohne zu testen, wenn der plan klar ist" — die zwei Klar-Plan-Punkte fallen, der
dritte bekommt seinen Leser-Zensus statt eines Blind-Schnitts):**
- DER HEAVE-KONSUMENT (N7-Rest): der Squat-Kanal des Kerns (zweispur.heaveA/V/
  KMul/CMul) wird KONSUMIERT — dritte Feder-Dämpfer-Achse neben Nick/Wank
  (Lab-Formel byte: m = −|aLong|·heaveA − |v|·heaveV, k·heaveKMul/c·heaveCMul,
  Klemme ±0.08 m), Konsumenten sind die SITZ-HÖHE (der benannte Rest), das
  Group-Visual und die Instanz-Matrix (dasselbe rp/rr-Muster — 0/undefined =
  byte-alt für alles Nicht-Gerittene). Aufstieg/Abstieg nullen den Zustand.
- DIE ATLAS-WÄCHTER-DIÄT (elfte-Welle-Rest): der Leser-Zensus überführte eine
  KOMMENTAR-LÜGE — die Impostor-Materialien fließen durch _sharedFoliage-
  Material und waren seit Welle 11 längst diätiert („bleiben BEWUSST
  undiätiert" war falsch); ihre lebenden Atlanten lud nur die renderId-
  Lebensader implizit nach. Jetzt urteilt der ATLAS-WÄCHTER beim Namen
  (mat._anazhAtlasTexe im Diät-needsRefresh — Textur-KNOTEN sind für equals()
  unsichtbar, Vendor-Beweis: _bindings.updateForRender läuft NUR unter
  needsRefresh), gestempelt am Impostor-Wiring (map+nmap) und am Blatt-Atlas;
  die MASKEN-Familie (_foundryTreeMaterial: Vertex-Farben + Stempel-Attribute
  + geteilte LOD-Uniforms + statischer Atlas) fällt in die Diät; der
  sharedFoliage-Kommentar sagt wieder die Wahrheit (sage a, tue a).
- DER CHUNK-BODEN-ZENSUS (statt Blind-Schnitt): drei tragende Fakten für die
  Entlassungs-Welle — (1) hasBVH ist tot (24345: „der Mesh trägt nur noch das
  Visual", Physik lebt im Feld), (2) _rebuildLodStitchBand hat EINEN Caller,
  den Geomorph-Pass, der bei Nachbar-LOD-Wechsel pos/tgt NEU beschreibt =
  DAS ist die Grenz-Re-Hydrierungs-Pflicht, (3) onUploadCallback existiert im
  WebGPU-Vendor NICHT (nur core/WebGL) — die Entlassung braucht manuelles
  Array-Nullen + IDB-Re-Hydrierung beim Nachbar-Wechsel. Der Schnitt bleibt
  ehrlich offen, jetzt mit Bauplan statt Vermutung.
- FORMAT VOLLENDET: prettier --write auf dem Stamm (der 16.-Welle-Drift +
  diese Welle in einem Zug), node --check grün. Auf Schöpfer-Order ohne
  Test-Lauf committet (Klar-Plan-Regel; die Konsum-Probe der 16. Welle deckt
  die Fahr-Kette, der nächste Ritt ist der Richter).

**Davor, sechzehnte Welle (Schöpfer: „weder die fahrphysik, noch sonst was ist fertig —
beende die dinge, schliesse sie ab" — der Fahr-Bogen schließt an seiner letzten Lücke:
das Gesetz galt nur Katalog-Presets mit Buch-Rezept; Eigenwerke/Donor-Wagen ritten die
alte richtungs-folgende Physik, first-Person aufs Blech, Pfeile taten nichts):**
- DAS FORM-P-GESETZ (_vehicleProfile, nach dem Rezept-Override): trägt kein
  Rezept die Fahr-Wahrheit (User-Eigenwerk · fahrzeug_wagen-Substanz · kaltes
  Buch), leitet der Host den P-Vektor aus der EIGENEN Form ab (radstand =
  Länge − Default-Überhänge · spur = Breite − Karosserie-Deckung · dach =
  Höhe · radR aus den Rad-Parts — in die Studio-Regler-Domäne geklemmt) und
  ruft DIESELBE exportDrive-Formel wie Probefahrt + Buch-Bau: EINE Formel,
  kein Zwilling. Konsumiert: lenkung/zweispur/spring/kamera/cgH/radR/spur.
  Die Geschwindigkeits-IDENTITÄT bleibt emergent (topSpeedMul/kAcc/kBrake aus
  Substanz+Rädern; vmax bewusst ABWESEND), Sitz bleibt _attachPointFor,
  Blocker bleiben die echten Parts.
- KABINE ≠ CHASE-CAM (_fahrRitt in _loopCamera): die Studio-Chase-Cam gilt
  JEDEM Gesetz-gelenkten Ritt; die Kabinen-Unsichtbarkeit NUR der
  geschlossenen Studio-Karosserie (huelle) — auf dem offenen Eigenbau bleibt
  der Reiter sichtbar.
- DER AUFSTIEG SCHALTET SELBST: mountArchitecture mit Lenk-Gesetz merkt den
  Modus (_mountVorKamera) und schaltet third (dort lebt die Chase-Cam);
  Abstieg UND Auto-Abstieg (Gefährt abgebaut) stellen zurück.
- DIE PFEILE FAHREN WIE IM STUDIO: PFEIL_ALIAS am EINEN Input-Chokepoint
  (keydown/keyup) schreibt die kanonischen w/a/s/d — kein Zweit-Leser im
  Bewegungs-/Lenk-Pfad (die garage liest KeyW||ArrowUp, die Welt jetzt auch).
- BEWIESEN: Konsum-Probe am Substanz-Wagen OHNE Rezept — lenkung/zweispur/
  kamera/spring leben (radstand 2.36 aus der eigenen Form), kAcc byte==
  emergenter Formel, Pfeil-Event→keys.a, Mount→third→Abstieg→first, 150
  Lenk-Ticks 3.26 m mit lebendem steer/0 NaN, Chase-Ast lief, Reiter
  sichtbar, 0 Seiten-Fehler · gate:vehicle-drive GRÜN (alle Bänder, 14.4 m) ·
  playtest:fast 18/18 · check GRÜN inkl. Anker-Wand · voller playtest „Alle
  Invarianten OK". OFFEN ehrlich (unverändert benannt): 481-MB-Batch-Staging
  (Vendor-Akt) · Chunk-Boden-Entlassung · Welt-Puffer-Synthese (GOLD 2) ·
  Source-Vendoring (GOLD 3) · Haut+Felle (Konsum-Tiefe 2+3) · das fps-Urteil
  des nächsten Schöpfer-Traces (heapZensus an Bord).

**Davor, fünfzehnte Welle (Schöpfer: „schmieden wir das Ding zu Gold statt zu Godot" —
Recherche bestätigte: die Community kämpft exakt an unserer Front [per-Objekt-UBO,
20k Objekte = 15 fps, RenderBundles als Antwort]; der GOLD-1-Leser-Zensus WIDERLEGTE
die onUpload-Hypothese ehrlich [entlassbar nur 2.6 MB] und nannte den wahren Wal:
Foundry-Familie 1.06 GB @ Ring 4 — Batch-Staging 623 + f.cache 351 + Quellen 87):**
- GOLD 1 — DIE BATCH-KLEIN-MÜNZE: Batches starten mit ARCH_BATCH_MINT_VERTS
  (8192) statt voller 32k-Reserve und wachsen über den bewiesenen Überlauf-Pfad
  (setGeometrySize + Bundle-Touch). GEMESSEN am Vertrag-Regime: Szene-Live-Set
  819 → 150.6 MB (−82 %). KORRIGIERT in derselben Welle: die 320-MB-Cache-Kappe
  evictete im Warm-Fluss (crossfade-Rot: Proben-Baum fiel zwischen Wärmung und
  Platzierung) → 512 MB bleibt die ehrliche Grenze (Kappe > Ring-Working-Set;
  der Zensus maß 351 MB Working Set — der GC-Schnitt kam NIE aus dem Cache).
- GOLD 2 (eröffnet) — DIE RESIDENZ-BILANZ: heapZensus.halter.batchFillPct
  (genutzte/reservierte Batch-Verts — die Pool-Effizienz-Zahl der künftigen
  Welt-Puffer-Synthese; nach der Klein-Münze 29 % im kleinen Regime).
- GOLD 3 (eröffnet) — DIE VENDOR-ANKER-WAND (gate:vendor-anker, in der
  check-Kette): 3 Vendor-Fingerabdrücke gepinnt (anker.lock.json — ein
  three-Bump ist ab jetzt ein BEWUSSTER Akt) + 10 Anker-Substrings der fünf
  Laufzeit-Organe (Diät · Heimat · Reife-Wache · Batch-Wächter · Pass-Physik) —
  fällt einer, nennt die Wand Täter UND abhängiges Organ; Selbsttest feuert.
- GOLD 4 — V5 SZENE-SPEICHER-BAND im Leistungs-Vertrag: Live-Set der
  gesettelten kleinen Welt < 700 MB (gemessen 150.6) — keine künftige Welle
  wächst das Live-Set still zurück in die GB-Klasse.
- BEWIESEN: leistungs-vertrag GRÜN (V1 0 Mints · V5 150.6 MB · batchFill 29 %) ·
  voller playtest „Alle Invarianten OK" · foundry-crossfade GRÜN (nach der
  Kappen-Korrektur) · check GRÜN inkl. Anker-Wand. OFFEN ehrlich: der
  481-MB-Batch-Staging-Rest (nie CPU-gelesen — bräuchte den Vendor-Akt) ·
  Chunk-Boden-Entlassung (braucht Grenz-Re-Hydrierung; IDB-Rohbytes liegen
  bereit) · die Welt-Puffer-Synthese selbst (GOLD 2, der große Bogen) ·
  Source-Vendoring (GOLD 3, der große Bogen) — beide tragen jetzt Messlatte+Wand.

**Davor, vierzehnte Welle (Schöpfer-Spielbericht: „er sitzt auf dem Dach, wo ist die
Studio-Kamera, die Fahrphysik ist die alte" — die Fahr-Auge-Sonde bewies: die Gesetz-
Kette FLIESST [gesetz/lenkung/zweispur true, Sitz 0.925 == Kern-Formel], aber der
Gesetz-Sitz liegt UNTER dem 1.2-m-GT-Dach — ein Avatar ragte durchs Blech, und die
Welt hatte keine Folge-Kamera):**
- DER FAHRER SITZT IN DER KABINE: beim Gesetz-Fahrzeug-Ritt (huelle vorhanden) ist
  der Avatar unsichtbar (render-only, EIN idempotenter Chokepoint in _loopCamera —
  das Studio rendert keinen Fahrer, die Welt tut es ihm gleich; Physik/Sitz-Anker
  unberührt); Kreatur-/Ross-Ritt bleibt sichtbar mit Sitz-Pose.
- DIE PROBEFAHRT-KAMERA REIST (FAHR-UMZUGS-Muster wie zweispur): FAHR.kamera
  (el 0.34 · dist 9.6 · blickHoehe 0.78 · az/el/pos-Ease-Basen) — die Shell liest
  byte-gleich (5 Literale umgezogen), exportDrive reicht kamera, der Welt-Ritt
  fährt die Chase-Cam HINTER dem Wagen (Kern-Azimut-Ease auf die Gier, Snap beim
  Aufstieg; Boden-Clamp + Kollisions-Raycast erben gratis — gleiche Bahn).
- BEWIESEN: gate:vehicle-drive GRÜN (14.4 m in 120 Fahr-Ticks — die Kette fährt) ·
  playtest:fast 18/18 · node --check Stamm+Kern+Shell. OFFEN ehrlich: das
  fps-Urteil braucht den nächsten Schöpfer-Trace (heapZensus seit .10 an Bord —
  er NENNT den 3-GB-GC-Wal) · Haut + Felle (Konsum-Tiefe Schnitt 2+3).

**Davor, dreizehnte Welle (Schöpfer-Karte §5: „Fail-closed statt fail-soft, wo Kern
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
