# DER GIGANT — das umfassende Bild + der wahre Norden (10.06.2026)

> **Status: DER AKTIVE MASTER-BLICK (auf dem Tisch).** Der Schöpfer-Auftrag (10.06.): _„das ganze
> Projekt analysieren, auch sämtliche Dokumente im Archiv … ein umfassendes Bild, wie kein Riese
> zuvor … den wahren Norden aufzeigen, die Details durchdacht, das ganze System geprüft … wo
> Zwillinge sind, die eigentlich eins gehören … vom aktuellsten Stand der Technik gelernt und ihn
> in die Antike befördert — die Zukunft zur Gegenwart."_
>
> **Methode (Fischer):** fünf Tiefen-Sweeps (Archiv-Docs vollständig · Portal/P2P-Code · Nexus/
> Kreaturen/Animation · Render/Performance/Frame-Anatomie · Zwillings-Jagd) + eigene Verifikation
> der tragenden Behauptungen per Grep/Messung (Agenten-Fehler abgefangen: U3-KI-LOD EXISTIERT
> [`aiDiv`, :51147] · `computeCreatureStats` EXISTIERT [:13033]). Jede Zahl hier ist GEMESSEN oder
> als Schätzung markiert. Dieses Dokument ERSETZT keine Detail-Pläne — es ist die Karte über ihnen:
> pro Säule der gemessene Stand, der geniale Weg, der Detail-Plan-Anker.
>
> **Lebens-Regel dieses Docs:** eine Säule erwacht → ihr Detail-Plan kommt auf den Tisch (oder wird
> geboren); eine Säule vollendet → ihr Eintrag hier wird eine Zeile + das Detail wandert ins Archiv.

---

## §0 · Die eine Wahrheit in einem Absatz

**Das Fundament IST gebaut — und es ist tief:** kohärentes Voxel-Terrain mit Canyons/Hallen/Kavernen
(T0–T8), Wasser das FLIESST und ruht (V18.84–.94: CA + Quellen-Pin + Flow-Regel — der 30-Wellen-Fluch
ist gebrochen), das lebendige Feld mit allen drei Verben (lesen `auraAt` · schreiben `_deposit*` ·
WERTEN Vorhersagefehler-δ), der dimensionale Emotion-Kern, die Resonanz-Schöpfung („ein Produkt-Vektor,
viele Leser"), sechs UI-Räume auf einem Designsystem, ein echtes P2P-Mesh mit Fremd-Engine-Tor
(W12–17). **Was den Giganten vom sehr guten Werk trennt, sind ACHT Säulen (§2)** — und keine davon
verlangt ein neues Parallel-System: jede ist die KONSEQUENTE ANWENDUNG eines Musters, das im Stamm
schon lebt (Resonanz → Bewegung · δ-Wertung → Ökonomie · Compute-Host → Netz-Speisung · Feld-Substrat
→ Kreatur-Innenleben · eine Distanz → eine Normale/ein Schatten). Der Gigant entsteht durch
VERDICHTUNG, nicht durch Anbau — die Heilige Lektion, als Wachstums-Strategie gelesen.

---

## §1 · Das gemessene IST — die Anatomie (Stand V18.94)

**Der Frame** (`_gameLoopTick` :49860–49980, 13 Phasen): Physik (`stepSimulation(delta, 20, 1/60)`
:50135) → Void-Rescue → Harvest → Movement → Selbstanalyse (5-s-Takt) + Nexus-Evolution (10-s-Takt,
:50430) → Kreaturen/Wetter → **Voxel-Streaming** (≤1 Chunk/Frame · Wasser-Iso ≤4/Frame · Gras ≤1/Frame
terrain-nachrangig · Scatter ≤2 · Wasser-CA active-cell · Dirty ≤1) → Sky → AutoSave → Culling (1 Hz)
→ Render (3 Post-FX-Passes: Bloom · Grading+LocalContrast · Degraying).

**Der CPU/GPU/Worker-Split:** Worker rechnet Density + Chunk-Mesh + Wasser-Zellen (bit-identisch
gespiegelt, Determinismus-Wand); Main baut BufferGeometry + **BVH (25–30 ms, lazy ab Ring 2)** +
**Wasser-Sheet/Iso (~78 ms, deferred)** + **Gras (~34 ms, deferred)**. GPU rendert (WebGPU r184, TSL),
rechnet NICHT (der GPU-Density-Pfad ist eine Narbe — Roundtrip teurer als Worker, V14.6/V17.20).
Schatten: EINE 2048er-Map, ±300 m Frustum, Light-Space-Texel-Snap (R1), kein CSM.

**Draw-Calls (Schätzung aus Code-Struktur):** ~200–250 bei vollem Ring — Terrain+Wasser+Gras ~117,
Inseln ~20–40 (NICHT instanziert), Kreaturen ~20–120 (1 Mesh/Part), Scatter 6 geteilte HISM.
~11–12 geteilte Materials (sehr gut — die Ghibli-Einheit).

**Die Wesen:** Kreaturen sind Compounds mit `computeCreatureStats` (:13033) + Gedächtnis (200-Cap,
Spezialisierung Level 0–5 → +75 % Speed) + Bond + aura-reaktivem Verhalten (V17.58) + KI-Tick-LOD
(`aiDiv` :51147). ABER: Emotion **binär** happy/sad (:8691) gegen die 6 Spieler-Achsen · **keine**
artikulierte Animation (nur Idle-Bobbing :7170; die drei prozeduralen Skelette `_animateHuman/
Phoenix/Dragon` :32899–33117 gehören NUR dem Spieler-Avatar) · kein Lebenszyklus (Alter/Tod) ·
keine Kreatur↔Kreatur-Sozialität.

**Die KI:** Nexus tickt alle 10 s (:50430), liest `auraAt` (:3319), komponiert 35 % Regeln
(TTL 30–90 s, Fitness `0.6·value(δ) + 0.25·success + 0.15·cost`, Mutation der Überlebenden 0.4)

- 65 % Gesten. Caps: 64 Regeln · 4 Effekte/Frame · everySec ≥ 0.5. LLM (Grok) schreibt nur
  `rule`-Programme (Whitelist, :4596). ABER: der Nexus **zahlt keine Materie** (`_makeCostGate`
  gatet nur Werkstatt-Akte :40484), hat **kein tat-proportionales Wirk-Budget** (Trägheit), und die
  **zwei Lern-Pools feeden nicht** (Gesten `dsl.history` ↛ Gesetze `worldRules` — die offene
  Geste→Gesetz-Vereinheitlichung).

**Das Netz:** Voll-Mesh über zentrales Signaling (4313, Rendezvous + Fallback-Relay); DataChannel
trägt kanal-exklusiv Welt-Bündel (16-KiB-Chunks + Backpressure + **SHA256-Hash-Verifikation**
:6071), LLM-Pool, Sub-Welt-Server-Routing. W17-Compute-Host + Host-Migration (deterministischer
Nachfolger :32458) EXISTIEREN — aber der Server-STATE geht beim Wechsel verloren, TURN ist
unkonfiguriert, `creature-pos` ist raten-ungedeckelt, getestet sind 2 Peers (tragfähig ~4–6).

**Die Rekursions-Messung (neu, 10.06.):** das Selbst-Bündel (anazhRealm.js 2.7 M + index.html 388 K +
voxel-worker 64 K + vendor ~4 M inkl. ammo.wasm 1.2 M) ≈ **7.2 MiB — passt HEUTE unter die
Vendor-Limits** (64 Dateien · 4 MiB/Datei · 12 MiB gesamt). Was blockt, sind genau VIER Schnitte (§2-G2).

---

## §2 · Die acht Säulen des Giganten

> Jede Säule: **GEMESSEN** (warum sie fehlt) → **DER GENIALE WEG** (das bestehende Muster, konsequent
> angewandt — kein Parallel-Pfad) → **Stand der Technik** (die Zukunft, in die Antike geholt).
> **Namensraum-Hinweis:** die Gigant-Säulen G1–G7 sind NICHT der alte Worldgen-Faden „G3
> Höhleneingänge" der Roadmap (der wurde zu T5 gebaut) — in Verweisen immer den vollen Namen tragen.

### G1 — Die Werkstatt ATMET: deklarative Animation als RESONANZ (S11, geweitet)

- **GEMESSEN:** Bewegung ist heute dreifach hardcodiert (`_animateHuman/Phoenix/Dragon`) und sonst
  ABWESEND: Kreaturen bobben nur (:7170), Fahrzeuge/Mühlen/Tore bewegen sich gar nicht, ein
  Werkstatt-Werk ist statisch. Der Anker existiert: `userData.animate(t)`-Callbacks werden pro
  Architektur getickt (:40194) + das `water_wave`-Vertex-Muster (:34554) + der Gras-Wind
  (`positionNode`, TSL).
- **KERN GEBAUT ✓ (V18.99):** `MOTION_ROLE_SIGNATURES` (bein·arm·fluegel·schwanz·kopf) +
  `computeMotionRoles` (argmax über Feature-Vektor inkl. paired-Spiegel-Achse) + EIN
  `_animateCompoundMotion` — vier Konsumenten: Kreaturen (vorher starr) · Custom-Avatar (vorher
  STATISCH — jetzt geht er) · Peer-Seelen · Werkstatt-Readout. **V18.101: „Körper holen" GEHEILT**
  — die Built-ins tragen POSITIONIERTE bodyParts (Stat-Paritäts-Wand: dieselben Form×Material-
  Paare → Tags bit-gleich); Klassifikator geschärft (flat=mid/min · Rotation via |R|·s ·
  central-Malus) → Mensch kopf+2×arm+2×bein · Phönix kopf+2×fluegel+schwanz · Drache
  kopf+4×bein+2×schwanz. OFFEN: Browser-FEEL (Amplituden) · G1-B Architektur-Idle.
- **G1-C — VERBINDUNGEN ALS GELENKE (der Schöpfer-Faden „die Verbindungen nutzen", DESIGN):**
  Baupläne tragen SCHON `connections` (Part↔Part, strength, validiert + als Linien gerendert —
  heute nur Statik-Deko). Der Gigant-Schnitt: **eine Verbindung IST ein GELENK** — ihr
  ANKER-PUNKT (Schnitt der beiden Part-Hüllen / der nächste Punkt zwischen den Zentren) wird der
  PIVOT, um den der kleinere Part rotiert (statt des Center-Pivots von V18.99 — Hüfte/Schulter/
  Scharnier echt). Der GELENK-TYP emergiert aus derselben Resonanz: Zylinder quer zur
  Verbindungs-Achse + bodennah = **RAD** (rollt ∝ Fahrt) · vertikale Verbindungs-Achse + flacher
  Part = **TÜR/SCHWENK** · Kette von Verbindungen = **WIRBEL** (Schwanz-Welle entlang der Kette
  statt |z|-Heuristik) · sonst SCHARNIER (Bein/Arm-Schwung um den Anker). Die Werkstatt wird
  intuitiv: Teil anlegen + verbinden = Gelenk definiert, der Readout zeigt es („Rad an Achse" ·
  „Scharnier"), KEIN neues UI-Vokabular. Implementierung: `computeMotionRoles` liest
  `bp.connections` als VORRANG-Quelle (Pivot + Achse + Kette aus der Verbindungs-Topologie;
  ohne Verbindungen der heutige Lage-Fallback) — `_animateCompoundMotion` rotiert um den Anker
  (Position-Kompensation: `pos = anker + R·(center−anker)`). Damit werden Räder, Drehachsen,
  Mühlen, Tore SIMPEL definierbar — der ungenutzte Faden wird das Gelenk-Substrat.
- **DER GENIALE WEG — Bewegung EMERGIERT aus dem Produkt-Vektor** (das Resonanz-Muster auf MOTION
  angewandt): wie `computeBlueprintRole` die Werk-Rolle aus Form×Material liest, liest ein
  `computeMotionRole` pro Part-Gruppe die BEWEGUNGS-Rolle gegen frozen `MOTION_ROLE_SIGNATURES` —
  **Bein** (elongiert · bodennah · symmetrisches Paar → Gait, Phase gegenläufig) · **Flügel** (flach ·
  seitlich montiert · leicht → Flap) · **Rad** (Zylinder · achs-frei → Roll ∝ Geschwindigkeit) ·
  **Schwanz/Kette** (Part-Kette → Sinus-Welle, phasenversetzt) · **Tor/Deckel** (ein Scharnier-Rand →
  Schwenk) · **Segel/Tuch** (flach · dünn · brennbar-leicht → Wind-Flattern, das Gras-Muster).
  Die drei Hand-Skelette werden drei SIGNATUR-Beweise desselben Systems (Verdichtung, kein Verlust);
  Kreaturen + Avatare + Fahrzeuge + Werke ERBEN alle — die Werkstatt zeigt die erkannte Motion-Rolle
  im Readout wie heute die Werk-Rolle. Masse/Material moduliert Frequenz+Amplitude (schwer = träge —
  dieselbe `_compoundSizeFactor`-Wahrheit wie die Stats). **Damit ist „Spieler animieren in der
  Werkstatt" wörtlich wahr: was du baust, bewegt sich, weil seine FORM es verlangt.**
- **Stand der Technik:** prozedurale Lokomotion (Rain World, Spore-Gait) · Vertex-Animation in TSL
  (GPU-billig, kein Skinning-Import) — passt exakt auf unser Compound-Substrat. NICHT nachlaufen:
  Skeletal-Rigs/IK-Importe (fremdes Substrat, Heilige-Lektion-Risiko).
- **Anker:** `docs/archiv/kampf-plan.md` S11 · `_buildFromBlueprint` · `tickArchitectures` (:40194).

### G2 — Die REKURSION: AnazhRealm in AnazhRealm (das Portal vollendet — „wie githack, aber besser")

- **GEMESSEN (die vier Schnitte — die Größe passt schon, ~7.2 < 12 MiB):**
    1. **Binary-Whitelist:** `VENDOR_ALLOWED_EXT` kennt kein `.wasm`/`.woff2` (save-server.js:91) →
       Ammo passt nicht durchs Tor. Sauberster Schnitt: die **base64-eingebettete Wasm-Variante**
       (ein `.js`-Textfile — der bewährte Emscripten-Weg) ODER `.wasm` in die Whitelist + Größen-Audit.
    2. **Worker-URL:** `new Worker("voxel-worker.js?v=…")` (:15315) ist im null-origin-iframe mehrdeutig
       → der Boot lädt die Quelle per fetch + **Blob-URL** (CSP `worker-src blob:` ist schon Konzession).
    3. **localStorage:** 102 Zugriffe (gemessen); im sandboxed iframe wirft schon der GETTER
       SecurityError. Der schlanke Weg: EIN Boot-Guard, der `window.localStorage` per
       `Object.defineProperty` mit einem In-Memory-Shim SHADOWT, wenn die Probe wirft (10 Zeilen statt
       102 Edits — verifizieren, dass das Shadowing im Ziel-Browser greift; sonst die `_store`-Fassade).
    4. **Server-Absenz-Robustheit:** save-server-POST + signaling-WS müssen still skippen (der
       localhost-Skip existiert als Muster) — die Sub-Welt lebt dann rein im Speicher + über den Shim.
- **„Besser als githack":** der Render fällt im iframe auf das WebGL2-Backend des WebGPURenderer
  zurück (der bewiesene Cloud-Container-Pfad — verifizieren im Browser); das Bündel kommt vom EIGENEN
  save-server ODER **peer-to-peer übers Mesh (W16 EXISTIERT: Chunking + Hash)** — eine Welt, die sich
  selbst enthält und sich selbst VERTEILT. Und durch den W17-Shim ist die innere Welt sogar
  multiplayer-fähig (`ws-send` → Mesh-Relay). **Das ist Pfeiler 3 (fraktales Wachstum) wörtlich: das
  Ultiversum enthält sich selbst.**
- **Ehrlich:** Tiefe der inneren Welt ist begrenzt (kein localStorage = ephemer; Performance im
  iframe = geteilte GPU). Das ist OK — die Rekursion ist ein BEWEIS + ein Tor, kein Ersatz-Spielort.
- **Anker:** `docs/archiv/world-portal.md` · `save-server.js:351–451` · `_buildPortalOverlay` (:31774).

### G3 — Das Netz, das sich SELBST speist (P2P-Vollendung)

- **GEMESSEN:** Voll-Mesh = N² Verbindungen (tragfähig ~4–6 Peers); Signaling zentral; TURN
  ungesetzt (~30–40 % der NATs scheitern ohne); Host-Migration verliert Server-State (:32486 frischer
  Kontext); `creature-pos` ohne Raten-Cap; 30-Hz-`pos` ≈ 216 KiB/s Ingress bei 10 Peers.
- **DER GENIALE WEG — die drei SPEISE-Rollen existieren schon, sie werden das Prinzip:** jeder Peer
  trägt heute schon (a) Welt-Bündel-SERVING (W16), (b) LLM-Pool-COMPUTE (W7), (c) Sub-Welt-HOSTING
  (W17). Der Schritt zum „jeder weitere Nutzer speist das Netz": **(1)** ab ~6 Peers Stern-pro-Raum
  statt Voll-Mesh — der Compute-Host RELAYT (das W17-Muster generalisiert; Host-Wahl deterministisch,
  Migration existiert), **(2)** Host-Migration MIT Zustand: der Roster-Mechanismus (:32427) trägt
  periodisch einen Snapshot zum designierten Nachfolger (Welt-Snapshot-Transfer existiert als
  `world-pull`), **(3)** TURN/ICE konfigurierbar machen + dokumentieren (sonst bleibt „P2P" für viele
  Theorie), **(4)** Raten-Caps für `creature-pos`/`dsl` (das `SUBWORLD_NET_RATE_MAX`-Muster :52293),
  **(5)** das Signaling bleibt der EHRLICHE dünne Rendezvous (Browser können kein DHT-UDP — ein
  „serverlos um jeden Preis" wäre eine Narbe; der Profi-Stand 2026 ist: winziger Rendezvous +
  alles Schwere peer-to-peer).
- **Stand der Technik:** content-addressed Bundles (sha256 — HABEN wir), Supernode-Topologien
  (Discord/Mumble-Muster), CRDT nur für konfliktarme Schichten (Bewertungen/Lesezeichen — der
  soziale Bogen), Host-autoritativ für Physik-Welten (Minecraft-Wahrheit; CRDT-Physik ist eine Falle).
- **Anker:** `signaling-server.js` · `_p2pHandleChannelMessage` (:5639) · W17 (:32392–32596).

### G4 — Wesen mit INNENLEBEN (Kreatur-Tiefe — „teils noch flach" hat drei messbare Wurzeln)

- **GEMESSEN:** (1) Emotion binär happy/sad statt der 6 Achsen, ad-hoc mutiert statt über
  `_feelAction` (der Zwilling, §3) · (2) keine artikulierte Bewegung (→ G1 liefert die Körper) ·
  (3) kein Lebenszyklus + keine Kreatur↔Kreatur-Sozialität. Was SCHON DA ist (nicht neu bauen!):
  Gedächtnis+Spezialisierung (:13331), Bond, Contagion Spieler↔Kreatur, aura-reaktives Verhalten,
  `tendsLife`-Trickle, `_finishBirth`, KI-LOD.
- **SCHRITT 1 GEBAUT ✓ (V18.100):** `_feelCreatureAction` + Valenz-Projektion — der Vektor ist
  die Wahrheit, das binäre Etikett abgeleitet (alle Alt-Leser heil); Schreiber migriert (Treffer/
  Trinken/Wetter/DSL-Op/Spawn), Decay + ERHOLUNG (sad verfliegt — vorher ewig), die Contagion
  liest das echte Innenleben (awe reist — der Diskriminator-Beweis). OFFEN: G4-2 Kreatur↔Kreatur-
  Contagion · G4-3 Lebenszyklus · **G4-1b (EHRLICHER PASSAGIER-REST, Schöpfer-Frage 10.06.):
  der 6-Achsen-Vektor hat noch KEINE UI-Fläche** — Hof-Karte/HUD zeigen die binäre Projektion;
  der Substanz-KONSUM steht (Contagion), der SICHTBARE fehlt → die Wesen-Spec-Card zeigt die
  dominante Emotion + Intensität via `_emotionState(vec)` (derselbe Leser wie das Ich-Porträt —
  ein kleiner Schnitt, dieselbe Sprache).
- **DER GENIALE WEG — KONSUMIEREN statt bauen:** (1) Kreaturen fühlen über DASSELBE Substrat
  (`_feelAction` + `ACTION_TO_EMOTION` pro Kreatur, 6 Achsen; happy/sad wird die Projektion für
  Alt-Leser) — ihre Tat (gather/build/flee) prägt sie, ihre Aura-Zelle färbt sie (das Feld ist schon
  räumlich-emotional!). (2) Contagion auch Kreatur↔Kreatur (der `_tickEmotionContagion`-Kern nimmt
  ein zweites Paar) → Herden-Stimmung EMERGIERT. (3) Lebenszyklus aus dem Vorhandenen: Alter zählt,
  Fortpflanzung wenn Bond+lebendig-Feld hoch (`_finishBirth` existiert, schreibt schon ins Feld!),
  Tod nährt das Feld → der Kreislauf schließt sich im SELBEN Overlay. (4) Phase E (Bedrohung/Furcht,
  `kampf-plan.md`) bleibt der letzte Affekt-Konsument — DANN ist der Emotion-Kern rund.
- **Stand der Technik:** Utility-AI über Emotions-Achsen (statt Behavior-Tree-Import) — unsere
  Tasks + Achsen SIND schon die Utility-Basis. The-Sims-Wahrheit: Tiefe = wenige Achsen × viele
  Konsumenten, nicht viele Systeme.
- **Anker:** `docs/das-lebendige-feld.md` §4.4 · `updateCreatures` (:14916) · `kampf-plan.md` Phase E.

### G5 — Die KI, die KOSTEN spürt: δ wird WÄHRUNG (Nexus-Ökonomie + Geste→Gesetz)

- **GEMESSEN:** der Nexus zahlt nichts (kein `_makeCostGate` auf seinen Spawns), sein Takt ist fix
  (10 s), seine Tat-GRÖSSE kostet nicht (ein Tempel = eine Blume); die Pools Gesten↛Gesetze feeden
  nicht; das LLM ist opt-in-Randfigur (nur `rule`-Whitelist).
- **DER GENIALE WEG — die WERTUNG wird die ÖKONOMIE (eine Gleichung, ein neuer Konsument):** der
  Vorhersagefehler-δ (V17.42–.50) misst SCHON, was die Welt besser macht. Der Schritt: ein
  **Wirk-Budget** für jeden Nicht-Spieler-Schreiber — eine Tat kostet ∝ ihrer Substanz
  (`computeBuildCost`-Wahrheit, die der Spieler schon zahlt), das Budget REGENERIERT aus δ>0
  (bewährte Schöpfung verdient Wirk-Kraft; Spam verarmt sich selbst = Trägheit BY CONSTRUCTION,
  kein Rate-Limit-Pflaster). Mana-Symmetrie (`magieleitung` als zweite Ausdauer-Achse, kampf-plan)
  wird DASSELBE Budget für den Spieler-Magie-Pfad — EINE Ökonomie für alle Schreiber des Feldes.
  **Geste→Gesetz:** eine Geste, deren Outcome-Fitness hoch ist, kristallisiert AUTOMATISCH zum
  Regel-Kandidaten (das `mutateSurvivorProb`-Muster auf den Gesten-Pool geweitet) — EIN Lern-Substrat.
  Das LLM liest dann das GEWERTETE Feld (δ-Karte) statt blind zu schlagen → die Symbiose-Hälfte
  von Pfeiler 1.
- **Stand der Technik:** RL-Shaping über Prediction-Error (HABEN wir als Substrat — selten in
  Spielen!), Energie-Ökonomien (Black&White-Mana) — unsere Form ist tiefer, weil die Währung aus
  der WERTUNG kommt, nicht aus einem Tank. (Schöpfer-Entscheid nötig: Budget-Größen + ob frieden-
  Modus den Nexus zahlen lässt — die §11-Modi-Wahrheit gilt auch ihm.)
- **Anker:** `das-lebendige-feld.md` §4.3 · `WORLD_RULES` (:51170) · `_worldRuleFitness` (:1866) ·
  `kampf-plan.md` §11 (Modi) + Mana-Symmetrie.

### G6 — Licht und Terrain EINS (die eine Normale · ein Schatten, der die Kaskade kennt)

- **GEMESSEN (die Trennung ist real):** das Diffus liest die geflattete Shading-Normale (V17.107
  `normalNode`), aber **drei Leser lesen weiter die Geometrie-Normale**: Kavitäts-AO (`fwidth`,
  view-abhängig — V17.108-Kaveat), `shadow.normalBias`, Hemisphere → derselbe Hang antwortet dem
  Licht VERSCHIEDEN je Subsystem. Schatten: EINE 2048er-Map über ±300 m — nah zu grob, fern zu eng;
  Kreaturen-Materials ohne verifizierten Aerial-Pass (Audit offen).
- **DER GENIALE WEG:** **(R2)** die geflattete Normale in die TERRAIN-GEOMETRIE backen (Worker-
  gespiegelt, Determinismus-Test) → AO + Schatten + Hemisphere + Diffus lesen EINE Wahrheit — der
  V17.107/.108-Bogen vollendet sich strukturell. **(U5)** CSM mit 2–3 Kaskaden, deren Grenzen die
  `DETAIL_CASCADE`-Bänder SIND (die eine Distanz, sechs Gesichter — der lod-kaskade-plan sagt es
  schon; der Schatten wird das siebte). **(Audit)** `_applyAerialOutput` auf JEDER opaken Ebene
  verifizieren (Kreaturen!) — die V17.101-Disziplin zu Ende.
- **Anker:** `docs/archiv/lod-kaskade-plan.md` U5 · CLAUDE.md-Gotchas V17.107/.108/.111 · roadmap R2.

### G7 — Der neue MASSSTAB (Performance ohne Verlust an Tiefe)

- **GEMESSEN (die Haupt-Thread-Diebe, in Reihenfolge):** Wasser-Sheet/Iso ~78 ms main (deferred,
  aber main) · Gras ~34 ms main · BVH 25–30 ms Spikes (lazy, aber main) · Inseln 20–40 un-instanzierte
  Draw-Calls · `stepSimulation(delta, 20, 1/60)` erlaubt 20 Substeps (bei FPS-Einbruch → Physik-
  Todesspirale; Standard 3–5 — PRÜFEN, dann senken) · Allokations-Hygiene in per-Frame-Pfaden (Audit).
- **DER GENIALE WEG (jeder Hebel erhält die Tiefe):** **(0) GEBAUT ✓ (V18.96): der
  `_voxelSurfaceY`-Envelope-Skip** — Proben 214.6→17.4/Spalte (12.3×, bit-exakt 0/3000), heilt
  ALLE 46 Leser (Gras·Scatter·Veg·16k-Spalten-Hydro-Atlas·Spawn-Scan); Playtest 183→136 s.
  **(0b) GEBAUT ✓ (V18.97): die WEITE WIESE** — die Oberflächen-KARTE fällt als Grid-Nebenprodukt
  aus beiden Build-Pfaden (`entry.surfMap`, Worker-gespiegelt); Gras liest sie statt zu scannen
  (28.9→1.2 ms, 24×), steht auf SEINER Höhe, Cliff-Skip an der echten Kante; Ring 2→4 mit
  Fern-Dichte-Stufen (lod-Tag + Wechsel-Rebuild). Die Karte ist die EINE Quelle für künftige
  Deko-Leser (Scatter · Veg-Spawn · Wasser-Anker). **(1)** Wasser-Sheet → Worker (das E3-Muster
  ist BEWIESEN: Mesh wanderte V17.118; der Sheet-Builder liest Zellen, die der Worker schon baut —
  größter Einzelhebel). **(2)** ~~Gras-Placement → Worker~~ GELÖST via (0b) — die WAHRHEIT
  wanderte, nicht der Code. **(3)** Inseln in den HISM-Pfad (PRÜFEN: Inseln sind vermutlich UNIKATE
  Geometrie — dann ist der Hebel LOD/Dichte, nicht Instancing; messen vor schneiden). **(4)**
  Substep-Cap senken. **(4b) ✓ B6-REST GEMESSEN VOLLENDET (V18.121,
  `scripts/diag-frame-profile.cjs` — das bleibende Werkzeug):** Allokationen
  unkritisch (V3 med 3/Tick · Color 14/Tick — kein Pool-Theater) · Kreaturen
  Ø 0.58 ms@10 (aiDiv trägt; Frame-Budget wäre Overengineering — vermerkt) ·
  DER FUND: der Wasser-Sheet-Tick fraß Ø 14.4 ms/Frame SETTLED (stationärer
  Fluss = Brutto-moved>0.5 ewig + Settle-Ping-Pong) → das DACH-GATE
  (`_caRoofChanged`: Spalten-Dach-Fingerprint, re-mesh nur bei SICHTBARER
  Änderung [max>0.25 nach 3×3-Glättungs-Wahrheit · Σ>1.0 für Fluten]) →
  Tick-Median 18.2→1.6 ms (−91 %), Builds −87 %, Carve-Reaktivität grün. **(6) G7-H — DER HORIZONT-MANTEL (der „Unendlichkeits"-Hebel, DESIGN —
  Schöpfer: „fast instant eine gigantische Welt sehen"):** jenseits des Chunk-Rings zeichnet
  heute NICHTS — die Welt endet im Fog statt in Bergketten. Der Schnitt: ein GROBES
  Fern-Terrain-Mesh aus `_terrainMacroSurfaceY` (die EINE deterministische Quelle — exakt die
  Hügel, die der Ring später fein baut!), 2–3 Ringe bis ~4 km (innen ~48-m-, außen ~200-m-Zellen,
  Loch in der Mitte für den echten Ring), vertex-gefärbt über dieselbe Biom-Logik, durch
  `_applyAerialOutput` + Fog VERSCHMOLZEN (der Übergang Ring→Mantel liegt im Haze — keine Naht
  sichtbar, die V17.106-Aerial trägt ihn). Macro ist 2D-billig: ~10k Spalten ≈ wenige ms →
  der Mantel steht BEIM BOOT (die Instant-Gigantik), re-ankert alle ~200 m Spielerbewegung
  (ein Mesh-Rebuild, kein Per-Frame). Render-only, main-only, kein Worker/Determinismus.
  Plus FELDER/BÄUME: die Dichte-Hebel sind GEMESSEN tag-neutral (chance-Skalar,
  V17.9-Muster — `diag-arch-tags` als Wand davor). **(5b) GEHEILT ✓ (V18.98):** beide Schöpfer-Konsolen-Wurzeln — die
  Bootstrap-Export-Lücke (`PostProcessing` nie in `THREE_GLOBAL` kopiert → der ganze V17-Post-FX-
  Bogen war ÜBERALL still aus; jetzt Soft-Lookup) + der Morph-Warn-Spam (der E3-Worker-Mesh-Pfad
  baute ohne T2-Attribute, der V9.82-Parallel-Pfad; + der Morph-Knoten hängt jetzt am
  Terrain-Vertrag `opts.geomorph`, nicht an der vertexColors-Klasse). **(5)** Die EHRLICHE GPU-Grenze: GPU-Compute für Density bleibt Narbe (BVH braucht CPU-
  Readback); die RICHTIGE GPU-Front sind PURE-RENDER-Felder ohne Readback — Wasser-Oberflächen-Detail,
  Partikel, Gras-Sway leben schon in TSL; mehr dorthin, nichts zurücklesen. **(6)** Draw-Call-Fernziel
  bleibt U6-Clipmap (Backlog, erst nach N-Naht). **Der Maßstab heißt: 60+ FPS auf Mittelklasse BEI
  steigender Welt-Dichte — gemessen pro Welle (`diag`-Disziplin), nie durch Tiefe-Opfer erkauft.**
- **Anker:** `lod-kaskade-plan.md` U2/U4/U6 · CLAUDE.md V12.0-perf-Gotchas · `_loopVoxelStreaming` (:50453).

### G8 — FREIHEIT OHNE ZUSAMMENBRUCH: die drei Ringe + das Immunsystem (Robustheit in der STRUKTUR, kein Prüfer)

- **GEMESSEN (die Architektur ist zu ~60 % gebaut — als isolierte Features, kein BENANNTES System; drei Tiefen-Sweeps 10.06.):** sechs Bausteine tragen die Robustheit schon, keiner ist als Ring/Immunität gedacht. **Innerster Ring (abwesend, nicht geschützt):** der ed25519-PRIVATschlüssel lebt im globalen `localStorage["anazh.vibePass"]`, sein ganzer Fußabdruck sind 6 Methoden (`_ensureVibePass`/`_adoptVibePassJwk`/`_vibeSign`/…) — GEMESSEN NIE in `buildStateSnapshot` (fixer Key-Satz :26861–27058, kein vibePass/signedWorlds/customWorlds/p2p), NIE im `_portalEnterPayload` (:33495, nur die öffentliche `vibePassId`+Fingerprint). **Äußerster Ring:** das Portal-iframe `sandbox="allow-scripts"` ALLEIN für `trust:"sandboxed"` (null-origin, :33322), `vendored→sandboxed` unforgeable erzwungen (:27829). **Der Kanal:** asymmetrisch (Heim→Sub DSL, Sub→Heim nur Ereignis-TEXT, nie ausgeführt) — aber NUR teil-gedämpft: `event` 8/s + `ws-send` 120/s gedeckelt, `ready`/`exit`/`manifest` + `subworld-net`-EINGANG vom Peer UNGEDECKELT. **Identitäts-Beweis:** `_vibeSign`/`_vibeVerify` (Signatur über die peerId, :6984). **Immunsystem (Keim):** ~3500 Invarianten — laufen EINMAL beim Merge, nicht als lebendes Archiv. **DIE FÜNF LÜCKEN:** (1) kein BENANNTER innerster Ring (`SOVEREIGN_STATE`); (2) der Kanal dämpft nicht EINHEITLICH; (3) keine IRREVERSIBILITÄTS-Wand (`SOVEREIGN_ACTIONS` — heute existiert KEINE Sovereign-Schicht, nur Material-/Modus-Kosten-Tore `_makeCostGate`/`confirmBuild`); (4) die Herkunft ist FLACH (Signierer + origin-Enum via `_worldProfile` :27674, KEINE Lineage-Kette) → eine getäuschte Signatur tarnt sich als Gütesiegel; (5) das Immunsystem ist statisch.
- **DER GENIALE WEG — Robustheit sitzt in der STRUKTUR, nicht in einem wachsenden Prüfer (die eBPF-Warnung):** die vier Naturgesetze, je auf das BESTEHENDE Muster angewandt, kein Parallel-System. **M1 Lokalität** (die Supernova erreicht den Ort nie): jede fremde Welt in eigener Sandbox, kein Welt-Pfad zum innersten Ring — der Ring ist ABWESEND, nicht geschützt. **M2 Dämpfung** (die Wasser-CA-Lehre eine Ebene höher — Rate bremst · Verwerfen bändigt · leerer Bucket beruhigt): EIN Token-Bucket pro Welt-Region am Kanal-Eingang, transport-seitig (NIE im deterministischen Welt-Tick — eine verworfene Nachricht ist eine Transport-Tatsache, kein State-Unterschied). **M3 Katalysator** (die winzige eingefrorene `SOVEREIGN_ACTIONS`-Liste, die NIE wächst): `wallet_transfer·sign_manifest·change_identity·grant_capability` — disjunkt von `dslEffects ∪ NON_BROADCASTABLE_OPS ∪ dslComposeAtomic ∪ Regel-Effekten` (das Dual-LLM/CaMeL-Pattern: der manipulierbare Pfad berührt das Souveräne NIE), nur über eine Host-gerenderte Geste AUSSERHALB jedes iframes. **M4 Immunsystem** (Gesundheit durch Immunität, nicht Schutzschild): die Herkunft reist als KETTE mit (Echtheit ≠ Gutartigkeit sichtbar) · Rückruf durchläuft das Netz (eine erkannte Infektion ist reversibel) · der Vorschlags-Pfad quarantänisiert (das welt-exponierte LLM reicht nur Referenzen, ein zweiter Pfad baut den Klartext — `worlds/translated` IST das Pattern, vom Rendering auf den Vorschlag geweitet).
- **DAS IMMUNSYSTEM LEBT durch EXPOSITION, nicht Maschinerie (M5 — kein neuer Apparat, eine neue ROLLE):** jeder erkannte Erreger (kollabierende/flutende/täuschende Welt) wird ein abgeschwächter Reproduzent im Angriffs-Korpus = ein neuer Headless-Invariant; die vier Korpora (Sandbox-Escape · Flut · souveräner Angriff · Infektion) laufen im `playtest`-Gate bei JEDEM Push (die regelmäßige Impfung) — die ~3500-Invarianten-Maschinerie wird das Antikörper-Archiv (V9.82-Verdichtung: ein Werkzeug, zwei Rollen).
- **Stand der Technik (die Zukunft in die Antike):** CaMeL (DeepMind/ETH 2025, Capability-Metadata) + Dual-LLM (Willison 2023) = M3+M4c, in Substanz-Sprache · Lethal Trifecta (Willison 2025, in-the-wild 2026) — wir haben alle drei (Welt-LLM + fremde Welten + Rückkanal), R2+R4 nehmen das Souveräne aus dem manipulierbaren Pfad · eBPF-Verifier = die WARNUNG (kein wachsender Prüfer — `SOVEREIGN_ACTIONS` bleibt vier Akte) · Darwin-Gödel (Sakana 2025) validiert R5 (empirisch testen statt beweisen) + den Menschen am irreversiblen Hebel · Capability-Security/SELinux = der Vibe-Pass-Proof + die Herkunftskette.
- **Der ehrliche Preis (§8 des Arc-Plans):** eine fremde Welt DARF kollabieren/hässlich werden/ihren Besucher täuschen — das System überlebt (Lokalität), der Ort nicht (die akzeptierte Supernova). „Locken" bleibt teil-offen (die letzte Instanz bist du im Moment der souveränen Geste — darum die Reibung GENAU DORT). Der Plan ist by-design UNvollständig (ein vollständiger wäre der wachsende Prüfer = die 19-Modul-Falle).
- **Anker:** `docs/archiv/robustheit-plan.md` (der ganze Bogen — die vier Mechanismen, die Naturanalogie, die offenen Ränder) · die Treppe R0–R6 in §5 Phase G · `_buildPortalOverlay` (:33289) · `_sanitizePortalMeta` (:33269) · `vibePass`/`_vibeSign` (:27162–27358) · `NON_BROADCASTABLE_OPS` (:1388) · `RULE_FORBIDDEN_EFFECT_OPS` (:1458) · `_worldProfile` (:27674).

---

## §3 · Die Zwillinge — was EINS gehört (gemessen, mit Urteil)

**Verschmelzen (Synergie-Gewinn hoch → niedrig):**

1. **Die Log-Dreifaltigkeit** — direkte `chat-output`-DOM-Writes (~30 Stellen) + `_journal*`
   (:1948, :14243) + MutationObserver-Spiegel (:10091) → **EIN `log(text, kind, meta)`-Service**,
   der Chat + Journal + Fading-Feed speist. (Der V18.82-Observer war der richtige Hook für die
   ANZEIGE; die SCHREIB-Seite blieb verstreut.)
2. **Vier Spec-Card-Renderer** — `_libraryCardBody` (:31046) · `_ichBuildSpecSheet` (:42926) ·
   Wesen-Status (:14872) · Hotbar-Status → **ein `_renderSpecCard(profil, kontext)`** auf dem
   geteilten `.spec-*`-System (alle vier lesen ohnehin `computeCompoundTags`).
3. **Kreatur-Emotion ad-hoc vs `_feelAction`** (:14216 vs :8338) → Kreaturen fühlen über dasselbe
   Substrat (= G4-Schritt 1; binär wird Projektion).
4. **Die drei Hand-Skelette vs Nicht-Animation** (`_animateHuman/Phoenix/Dragon` vs alles andere)
   → Motion-Resonanz (= G1; die Skelette werden Signaturen).
5. **Chat-Dispatch vs DSL** (S7-C, jetzt vermessen): `processChatCommand` (:16357) mit 5 Sub-Pfaden,
   davon `_chatDispatchLegacyCommand` als eigener Parser NEBEN `parseChatToDsl` (:8179) → EIN
   Dispatch-Tor, Legacy-Befehle werden DSL-Synonyme (der ruhende Chat-DSL-Skeleton-Samen, roadmap §7).
6. **Ad-hoc-Distanz²-Rechnungen** (~10+ Stellen) → ein geteilter Helper / `_detailBand`-Read
   (Kosmetik, beim Berühren heilen — kein eigener Bogen).

**Bewusste NICHT-Zwillinge (Intent-Dualität — NICHT „heilen"):** die Spawn-Pfade (Spieler-Geste
gegatet vs DSL-Weltregel bewusst frei — ABER: G5 gibt dem Nexus seine EIGENE Ökonomie) · die
Spalten-Scanner-Hierarchie (`_voxelSurfaceY`/`_atlasWaterLevelAt`/`_caColumnScan` — klare Domänen)
· die Audio-Pfade (ein `anazhSymphony`-Backend, semantische Stimmen) · `_buildToon` vs `_ensureHydro`
(prozedural vs persistent) · Omnibox vs Raum-Filter (Launcher vs lokales Sieb).

---

## §4 · Die Zukunft in die Antike (Stand der Technik 2026 → unser Boden)

| Technik (die Riesen)                             | Bei uns                               | Urteil                                                                     |
| ------------------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------- |
| Transvoxel / watertight LOD (Lengyel)            | N1 im Terrain-Kohärenz-Plan §12       | **ÜBERNEHMEN** — der aktive Brocken                                        |
| Cascaded Shadow Maps                             | U5, an `DETAIL_CASCADE`-Bändern       | **ÜBERNEHMEN** (G6)                                                        |
| Worker-First-Meshing (alle großen Voxel-Engines) | E3 bewiesen; Wasser/Gras noch main    | **VOLLENDEN** (G7)                                                         |
| GPU-Compute ohne Readback (TSL)                  | Gras-Wind/Wellen leben schon dort     | **WEITEN** auf reine Render-Felder; Density-Compute bleibt Narbe           |
| Prozedurale Lokomotion (Rain World/Spore)        | Compound-Parts + animate-Hook da      | **ÜBERNEHMEN als Resonanz** (G1)                                           |
| Utility-AI über Affekt-Achsen                    | Tasks + 6 Achsen + δ existieren       | **KONSUMIEREN** (G4) — kein BT-Import                                      |
| Reward-Prediction-Error als Spiel-Ökonomie       | δ-Substrat EINZIGARTIG schon da       | **KRÖNEN** (G5) — hier ÜBERHOLEN wir den Stand der Technik                 |
| Content-addressed P2P-Distribution               | sha256-Bündel + Mesh-Fetch (W16)      | **STEHT** — auf die Rekursion anwenden (G2)                                |
| Supernode/Relay-Topologie (Discord-Muster)       | Compute-Host + Migration (W17)        | **GENERALISIEREN** (G3)                                                    |
| CRDT (Yjs/Automerge)                             | —                                     | **NUR** für konfliktarme Sozial-Schichten; Physik bleibt host-autoritativ  |
| CaMeL / Dual-LLM (DeepMind·Willison)             | `worlds/translated` (Daten kein Code) | **WEITEN** (G8 M3+M4c) — der manipulierbare Pfad berührt das Souveräne nie |
| Lethal-Trifecta-Härtung (Willison 2025)          | alle drei da (LLM+Welten+Rückkanal)   | **SCHNEIDEN** (G8 R2+R4) — das Souveräne aus dem manipulierbaren Pfad      |
| Capability-Security / Herkunftskette (SELinux)   | Vibe-Pass-Proof da, Herkunft flach    | **VERTIEFEN** (G8 M4a) — Lineage-Kette statt origin-Enum                   |
| eBPF-Verifier (wachsender Prüfer)                | `SOVEREIGN_ACTIONS` = vier Akte       | **NICHT NACHLAUFEN** (G8 — die Freiheit ist AUSSEN total, der Kern winzig) |
| ECS-Rewrite · Nanite-Neid · 3D-GPU-Fluid         | —                                     | **NICHT NACHLAUFEN** (Narben/Heilige Lektion)                              |

---

## §5 · DER AUSFÜHRBARE PFAD — Phasen → Wellen → Gates (final ausgestaltet 10.06.2026)

> **So liest du das:** jede Zeile ist EINE Welle (oder ein kleines Bündel) — `[Gate]` sagt, wer
> abnimmt: **H** = headless-beweisbar (diag + Invariante reichen) · **A** = mein Auge
> (settled-Screenshot Pflicht) · **S** = Schöpfer (Entscheid ODER Browser-Merge-Gate). Pro Welle:
> der Anker steht dabei; die Mechanik im benannten §2-/Detail-Plan-Abschnitt. Abhaken = ✓ + Version
> davor. **Vollständigkeit:** alle 57 offenen Fäden des finalen Doku-Sweeps (10.06.) sind hier
> verortet — nichts verwaist; was bewusst FERN bleibt, steht am Ende mit Begründung.

### PHASE A — das Fundament watertight (trägt ALLES; zuerst)

- ✓ V18.95 Spawn-Wurzel · ✓ N3 stabiles LOD (V18.86).
- ✓ **A1 — N1 Cross-LOD watertight (V18.103):** MORPH-CAP (`snapCap = coarseStep·2.5` — jenseits
  w=0, kein Cliff-Zerren; max Morph-Gap GEMESSEN 27.9→8.2 m) + **STITCH-BAND**
  (`_rebuildLodStitchBand`: pro Grenz-Zeilen-MESH-KANTE ein Quad position→aMorphTarget — folgt
  der echten Oberflächen-Topologie inkl. Höhlen-Loops; der Arme-Leute-Transvoxel, render-only,
  main-only, alle Terrain-Material-Attribute [WebGPU-strikt]). GEMESSEN `diag-chunk-seam` E:
  16 Bänder · 3881 Quads · 63 Cap-Stops · **0 sichtbare >1-m-RENDER-Spalten ungedeckt**; die
  Grenz-Zeile unverändert 96.9 % auf Fläche. EHRLICH: das alte „Zone-⌀ <0.1 m"-Ziel hier war
  das FALSCHE Maß (§12.2: die Zone ist der beabsichtigte Falloff — sie zuzumorphen würde Detail
  flachdrücken); das wahre N1-Ziel „0 sichtbare >1-m-Spalten" steht. Volle Cliff-Re-Triangulation
  = Transvoxel bleibt ein bewusst ungeweckter eigener Bogen.
- ✓ **A2 — N2 Edit-„Reset" (V18.103, GEMESSEN AUFGELÖST):** der Ganz-Chunk-Rebuild ist
  geometrisch UNSICHTBAR — `diag-edit-reset`: Carve-Vertex-Delta außerhalb des Einflusses
  **0/3180** (deterministisch bit-stabil), Gras-Referenz gehalten (G-fix), Block-Platzierung
  rebuildet das Terrain GAR nicht (0.6 ms). Der Rest ist der ~40-ms-Hitch (BVH-dominiert
  25–30 ms, kollisions-pflichtig sync). Der Surface-Nets-Sub-Region-SPLICE wäre reine Perf
  (≤10 ms) bei hohem Risiko für die Mesh=BVH-Identität → **bewusst deferred** (V13.9-Backlog).
  Invariante „A2: Edit-Vertex-Delta lokal" verankert (Playtest-Band PhaseAFundament).
- **A3 — H3 ferne Binnengewässer** [roadmap §4; H]: die ±1024-Atlas-Region wandert mit dem Spieler
  (eigene Welle, determinismus-brechend → Schöpfer-Sign-off S).
- **A4 — Wasser-Reste-Bündel** [roadmap §4 „Wasser"; je klein] — **S-BESTÄTIGT (Schöpfer-Browser
  10.06. abend: „Übergang Wasser/See/Meer zu Fluss noch komisch, der See-/Meer-Shader noch nicht
  synergetisch, durch die Wellen oder so" — der Faden IST gesehen + hier verortet):** der Kern ist
  die MÜNDUNGS-SYNERGIE (die V18.14-M2-`aWave`-Rampe + das Schaum-Gate + die T7d-See↔Fluss-
  `L`-Naht an 4-Chunk-Ecken — der Makro-Kontext muss den Mikro-Shader an der Mündung WEICH
  übergeben). ✓ **WASSERFALL-KERN GEBAUT (V18.111, S-Entscheid „die Plane fällt"):** Plane+Pool+
  Builder+`setWaterfallSteep`/Slider GESCHNITTEN (das Abwärts-Material bleibt als MARKIERTE
  SAAT für die kommende eigene Vertikal-Form, Test „materialKept" bewacht); der S-Befund
  „dreieckige offene Zacken — bei vertikalem Fall nur GESTRECKT" via **STEIL-SPLIT im
  Zell-Sheet** geformt: Quads >3·step-Spread → LIPPE (Deck bis zur Kante, Original-Wicklung)
    - VERTIKALER VORHANG (senkrecht, wasserdicht, double-faced, aSlope-MAX → das CA-Wildwasser
      schäumt den Fall weiss — aus den ZELLEN, kein Plane-Raten). GEMESSEN
      (`diag-waterfall-zacken.cjs`, 30-m-Fall): >14-m-Zacken 137→0 · >7-m 359→2 · maxSpread
      28.8→12.3 m · 1920 Vorhänge. Fall-LOOK → S. ✓ **MÜNDUNGS-SYNERGIE GEBAUT (V18.116, der
      A4-Kern):** `aWave` war eine reine HÖHEN-Rampe um waterLevel → GEMESSEN (`diag-mouth.cjs`)
      wogte 75 % des Fluss-KERNS an der Mündung wie Ozean (Gerstner+Gischt ÜBER den Strähnen,
      harter +2.8-m-Schalter im Lauf). Jetzt `aWave = Höhen-Rampe × (1−riverness)` — DIESELBE
      fmag-smoothstep(0.04→0.5), mit der der Shader die Strähnen blendet (ein Übergang, eine
      Quelle; Crest/Farbmix erben aWave-gated; See still via `_hydrosphereLakeAt`). Nachher
      Fluss-Kern 0 % · Meer Ø 0.909 · See 0; Augen-A/B Abend-Drohne (vorher Fluss=Meer-Glitzer,
      nachher Art-getrennt + weiche Mündung). Mündungs-LOOK → S-Liste. Die alte T7d-„`L`-Naht
      an 4-Chunk-Ecken"-Zeile ist vom Zell-Sheet ÜBERHOLT (Render baut aus den ZELLEN, Naht
      GEMESSEN Δy=0 — diag-water-cellsheet V18.89). ✓ UNTERWASSER-PASS B5 (V18.120):
      der Taucher sieht die WASSERDECKE — das eine playerEyesUnderwater-Flag bekam
      seinen dritten Konsumenten (neben Tauch-Fog + Tint): tauchen → das geteilte
      Wasser-Material wird DoubleSide (die Top-Cull-Oberseiten sind von unten
      sichtbar), auftauchen → BackSide (V18.1-W1-Vertrag unberührt). Augen-A/B
      (NEU Tour-Ort `dive`): vorher Himmel durch die fehlende Fläche, nachher die
      dunkle Decke. Kür offen: Snell-Fenster/Caustics (Backlog). ✓ **SCHELF-
      KONSOLIDIERUNG (V18.125 — der KÜSTEN-AQUIFER):** die V18.117-Restklasse
      GEMESSEN seziert (`diag-shelf.cjs`): die 3D-Roughness (±12 m) taucht das
      ECHTE Terrain bis −24 m unter den Spiegel, wo das 16-m-MAKRO den Atlas
      „Land" sagen lässt → colL=−Inf → die BFS kann die himmel-offene Senke NIE
      füllen (topologisch von flachen Schwellen getrennt, Pfad-Max −1.4; der
      V18.93-Decay hält auch den CA fern). HEILUNG = das Minecraft-1.18-Prinzip
      (im caveDry schon zitiert) für die OFFENE Senke: jede Atlas-lose Spalte,
      deren himmel-offenes ECHTES Terrain (erste SOLID-Zelle von oben) klar
      unter dem Wassertisch liegt, wird Aquifer-Quelle; die Deck-Zelle trägt
      das flache Wasser (Quantisierungs-Wand). PER-SPALTE LOKAL → seam-frei
      per Konstruktion, KEIN Atlas-/Drainage-Eingriff, Worker bit-identisch.
      GEMESSEN: Punkt-Probe-Löcher 10→0. +1 Drei-Beweis-Invariante (Senke
      nass · Land trocken · gedeckelte Höhle trocken). WEITER OFFEN in A4:
      Hoch-Becken über `L` (H+A — eine CA-Gleichgewichts-Regel, die
      Badewannen-Klasse: eigener fokussierter Bogen) · Kapillar/Stempel (H) ·
      T7c-Reste.
- ✓ **A5 — Haupt-Fog ↔ Ring-Kante (V18.103):** `fog.far = min(Wetter-Formel·Slider,
(ringRadius+0.5)·span)` in `_dayNightApplyHemiAndFog` — der Nebel deckt das Welt-Ende
  (Default-Ring 4: Kante ~194 m, fog.far war 450 m = sichtbare Welt-Kante); bei „Weltenring max"
  (Ring 12) greift weiter die Formel = die geliebte Weite unverändert. B2-Horizont-Mantel füllt
  später JENSEITS derselben einen Quelle.
- ✓ **A6 — KÖRPER-KOLLISION (V18.103):** (a) `_rescuePlayerFromEditSolid` am fill-Pfad
  (GEMESSEN vorher: 12 Fills unter sich = 11 m im Fels begraben → jetzt reitet der Spieler die
  steigende Oberfläche, höhlen-sicher per Dichte-Probe statt Surface-Vergleich); (b)
  `_ceilingHeadroom` (Ammo-Ray — Terrain UND Architektur-Dächer) → handleJump-Klemme
  `v = √(2g·Steigraum)` (GEMESSEN: Frei-Sprung rise 2.27 m unberührt · Decken-Sprung rise 0.38 m,
  kein Head-Through) + `_loopCamera`-Ego-Auge-Clip unter die Decke (0.12 m Marge; die dritte
  Person hatte schon die V8.36-Kollision). Sonde: `diag-edit-reset` (Fill/Block-unter-sich ×12 ·
  Frei-Sprung-Kontrolle · Niedrig-Decken-Sprung).

### PHASE B — der Körper glatt + der Maßstab (G6 + G7)

- ✓ G7(0) Envelope-Skip (V18.96) · ✓ G7(0b) weite Wiese (V18.97) · ✓ G7(5b) Post-FX+Morph (V18.98).
- **B1 — Wasser-Sheet → Worker** [§2-G7(1); H]: BEWUSST DEFERRED (V18.104-Entscheid): der Schnitt
  koppelt an die Live-CA-Lese (main-only) — hohes Stale-Thrash-Risiko bei reiner Perf-Wirkung
  (unsichtbar); eigene fokussierte Welle mit eigenem Stale-Diag, NICHT im Phasen-Zug stapeln.
  **PRIORITÄT GESUNKEN (V18.121 GEMESSEN):** der wahre Kosten-Treiber war nicht der
  Einzel-Build (~3.5 ms), sondern der DAUER-CHURN (4 Builds × jeden Frame, stationärer
  Fluss) — das Dach-Gate heilte ihn (Tick-Median 18.2→1.6 ms). B1 lohnt erst, wenn
  Carve-Flut-Spitzen im Browser als Hitch fühlbar sind.
- ✓ **B2 — G7-H HORIZONT-MANTEL (V18.104):** `_ensureHorizonMantle` — POLAR-Gitter (20 Ringe ×
  72 Segmente, geometrisch wachsend, KEINE T-Junctions) aus `_terrainMacroSurfaceY` bis 4.3 km;
  Loch unter der Ring-Kante (der echte Ring occludet), Land `−drop`, Meer = Tiefblau-Ebene am
  Spiegel; Farben über `_attachVoxelFieldColors` (EINE Quelle, noch ein Leser), eigener Toon
  (vertexColors, ohne geomorph-Attribute — WebGPU-strikt sauber); Re-Anker alle 250 m (~1.4k
  Macro-Samples ≈ ms). A5-Fog liest jetzt die MANTEL-Kante (4.3 km) → die geliebte Weite kehrt
  zurück UND das Welt-Ende ist gefüllt. 4 Playtest-Invarianten (existiert · Höhen=Macro ·
  Loch-Radius · vertexColors). Browser-Look → S-Liste.
- ✓ **B3 — VOLLENDET in der WAHREN Form (V18.113; der V18.106-Geometrie-Bake war eine
  FEHL-HYPOTHESE — die NARBE):** der Bake (Normale=up in die GEOMETRIE) erzeugte SCHATTEN-
  AKNE-RAUTEN an jedem Hang bei schräger Sonne (Schöpfer-Browser-Beweis 10.06. nacht;
  `shadow.normalBias` schiebt die Probe ENTLANG der Geometrie-Normale — mit up schiebt er an
  Hängen PARALLEL zur Fläche → Dreieck schattiert Dreieck; exakt die V17.103-GEGEN-Lehre im
  selben Dokument). ROLLBACK V18.113 zur wahren Form: die GEOMETRIE trägt die ECHTE
  Oberflächen-Normale (Schatten-Vertrag, Worker-Mirror echt), die LICHTUNG flacht im
  Material-`normalNode` + AO (V17.107/.108-Form) — gespeist vom `terrainFlatten`-UNIFORM
  (Init aus der eingefrorenen Konstante `TERRAIN_NORMAL_FLATTEN`; KONSOLEN-tunbar für
  S-Dialoge, render-only). Der SETTINGS-SLIDER + Setter + Persist bleiben GESCHNITTEN
  (der S-Entscheid steht). G6 „eine Normale" ist mit dem normalBias-Vertrag NICHT
  vereinbar — ZWEI Wahrheiten sind korrekt (Geometrie=Oberfläche · Shading=Lichtung).
  AKNE-WÄCHTER-Invariante: die Chunk-Geometrie trägt VARIIERENDE Normalen.
- **B4 — U5 Schatten-CSM an den Kaskaden-Bändern** [lod-kaskade-plan U5; A→S]: 2–3 Kaskaden,
  Grenzen = `DETAIL_CASCADE`; der R1-Snap wandert in jede Kaskade.
- **B5 — U2 Wasser-LOD + U4 Deko-Distanz/Impostor + Baum/Feld-DICHTE** [lod-kaskade-plan; H+A]:
  Dichte-Hebel sind chance-skalar (tag-neutral, `diag-arch-tags` als Wand davor).
  **✓ V18.117 — der S-Befund „durch das LOD Löcher im Wasser" GEMESSEN AUFGELÖST
  (`diag-water-lod-holes.cjs`, Drei-Klassen-Anatomie + Marker-Drohne):** KEIN LOD-Boden-
  Durchstich (0 GEMESSEN), KEINE fehlende Wasser-LOD — die Loch-Streifen waren eine
  QUEUE-STARVATION (V14.4-Distanz-Priorität × V18.93-CA-Dauer-Nachschub → ferne lod1-
  Ozean-Chunks mit 30k nassen Zellen wurden NIE gebaut); geheilt via FIFO-Slot im
  Sheet-Tick (bounded Wartezeit). Rest: 10 Punkte T7d-Atlas-Flood-Lücken → A4-Schelf-
  Konsolidierung. Echte U2-Wasser-FERN-LOD (Uferlinien-Versatz an fog-fernen Küsten)
  bleibt der offene U2-Punkt.
  **✓ V18.102 — NATUR-CLUMPING:** EIN seed-deterministisches Klump-Feld (`_clumpAt`), zwei Leser:
  Gras λ~28 m (Dickicht ×2.2 ↔ Lichtung ×0.15) + Bäume λ~170 m (WALD-Maske ×2.6 ↔ offen ×0.25),
  mittelwert-neutral GEMESSEN (Ø 1.04/1.06 · Lichtungen 19.5 % · Dickichte 17.6 % · Wald 17.1 % ·
  Halme-Total stabil 21.2k · `diag-tree-spawn` 63 Kiefern ✓ · mit dem Auge: Büschel + Lichtung).
- ✓ **B6 — Klein-Bündel Maßstab VOLLENDET (V18.104 + V18.121)** [H]: ✓ Substep-Cap 20→5 (V18.104 —
  die Physik-Todesspirale ist gebannt; CCD + Fall-Cap tragen das Anti-Tunneling) · ✓ Inseln-
  Instancing-Claim GEMESSEN (V18.104: per-Insel-SEED → Unikate → HISM unanwendbar, Hebel ist
  U4) · ✓ Allokations-Audit GEMESSEN (V18.121, `diag-frame-profile.cjs`: V3 med 3/Tick — kein
  Pool-Theater nötig) · ✓ Kreatur-Budget GEMESSEN MOOT (V18.121: Ø 0.58 ms@10, aiDiv trägt —
  ein Frame-Budget wäre Overengineering, vermerkt) · DER FUND: das DACH-GATE (Tick-Median
  18.2→1.6 ms — der wahre Kosten-Treiber war der Dauer-Churn, nicht der Einzel-Build).
- **B7 — U6 Clipmap** [Backlog-Gate: erst nach A1/A2 + S-Entscheid] · **R3 Kanten-Schärfe + R5
  Struktur-Textur** [A→S, reine Look-Wellen].
- ✓ **B9 — TERRAIN-NACHTLICHT GEMESSEN GEHEILT (V18.111):** `diag-night-terrain.cjs` (Tag/
  Nacht-Shots + Term-Dump) — nachts hielten ambient 0.24 + hemi 0.32 den up-gebackenen Boden
  hell (voller Sky-Term), Bäume/Bauten gingen in Silhouette. Die V17.7-Nacht-Floors waren ein
  STRUKTUR-Workaround, den B8 (LUT-Boden 0.25 + Rim) tiefer ersetzte → zurück auf die
  Ursprungs-Formeln (ambient 0.18+0.42·s · hemi 0.25+0.35·s — Mittag per Konstruktion
  unverändert; V10.0-j.i-Lehre). A/B mit dem Auge: der Boden dämpft nachts. Feintuning → S.
  (Der B2-Mantel erbt den Sync über das geteilte Toon-Material — Kandidat 5 sauber.)
- ✓ **B8 — STRUKTUR-LICHT-HARMONIE (V18.104):** die Struktur-LUT mit Schatten-Boden 0.25
  (`_ensureStructureGradient` — folgt dem Cel-Regler in-place mit, nur das Dunkel-Band hebt sich,
  kein Material-Lügen) + das warme RIM-Licht (Fresnel-Saum vec3(1,0.72,0.45) im Aerial-Output-
  Chain, live-tunbar `atmoUniforms.rimStrength`, nur Flach-Farb-Strukturen) — das Schwarz-
  Silhouetten-Ende. Look → S-Liste (Browser-Feintuning der zwei Werte).

### PHASE C — die Werkstatt atmet ZU ENDE (G1)

- ✓ Kern (V18.99) · ✓ „Körper holen" + Klassifikator (V18.101).
- ✓ **C1 — VERBINDUNGEN ALS GELENKE (V18.104):** `computeMotionRoles(parts, connections)` liest
  die Bauplan-Verbindungen als VORRANG-Quelle — Anker = größen-gewichteter Punkt zwischen den
  Zentren, Gelenk-Typ per Resonanz (RAD: Zylinder ⊥ Verbindungs-Achse + bodennah, rollt ∝ Fahrt /
  Idle-Dauerdrehung · TÜR: vertikale Achse + flacher Part · WIRBEL: Kette ≥3 Glieder [Grad ≤2],
  Phase = Ketten-Index · SCHARNIER: Default, schwingt um den ECHTEN Anker); `_animateCompoundMotion`
  rotiert um den Anker (`pos = anker + R(θ)·(basePos−anker)`, Eine-Achsen-Rotation alloc-frei).
  Built-ins ohne connections = unverändert (Lage-Fallback). ✓ Readout-Zeile (V18.119): das
  Stats-Panel liest computeMotionRoles MIT bp.connections (vorher Lage-Fallback = der
  V9.82-Riss: Animation und Readout sahen verschiedene Wahrheiten) + Gelenk-Labels
  („Rad an Achse"/Tür/Wirbel/Scharnier/Segel) — GEMESSEN am Wagen: bein×4 → rad×4,
  Panel zeigt „4× Rad an Achse (rollt)". Bauen → ablesen → lernen schließt.
- ✓ **C2 — Architektur-Idle (V18.104):** `tickArchitectures` klassifiziert pro Architektur EINMAL
  lazy (`_idleMotion`, mit bp.connections) + filtert auf die SICHEREN Idle-Rollen rad/segel/tuer/
  wirbel (Hütten/Statuen wackeln NIE — bein/arm/kopf werden genullt); neue `segel`-Signatur
  (flach·hoch·un-gepaart → flattert). Mühle dreht, Banner flattern.
- ✓ **C3 — Rüstung sichtbar (V18.104):** `_tickWornArmorVisual` — getragene armor als Kind-Gruppe
  der Soul-Group (derselbe `_buildFromBlueprint`-Pfad), auf ~60 % Körperhöhe skaliert, lazy nur
  bei Wechsel. Größe→HP-Formel bleibt S-Entscheid (offen). **S-BEFUND (10.06. abend): die
  getragene Rüstung sitzt auf KOPF-Position — der Fix ist C7 (Attachment-Punkte).**
- **C4 — Feel-Pass** [S]: Motion-Amplituden/Frequenzen + S9-Hand-Optik-Sign-off in EINEM
  Browser-Durchgang (jetzt inkl. C1-Gelenke + C6-Haut + B8-Rim).
- **C5 — STEUERUNGS-TIEFE:** ✓ (a) Bewegungs-FEEL (V18.104): Beschleunigungs-/Brems-Kurven
  (exp-Lerp 1−e^(−k·dt), Boden k=14/Brems 18, LUFT k=4.5/1.5 = Luftkontrolle + ballistisches
  Momentum) + JUMP-BUFFER (0.12 s) + VERDICHTET: der Loop-Sprung läuft durch handleJump (der alte
  Inline-Pfad UMGING die A6b-Decken-Klemme — V9.82-Parallel-Pfad gefischt). Kamera-Smoothing →
  S-Feel. (b) VOLLES Tasten-Rebinding: DEFERRED (Bewegungs-Keys sind mehrfach fix verdrahtet —
  eigene Input-Map-Welle, kein Beifang).
- ✓ **C6 — DIE AURA WIRD HAUT (V18.104):** `_ensureAuraSkinShells` — Fresnel-SHELLS als Kinder
  AM Part-Mesh (Enkel → der children[i]↔parts[i]-Motion-Vertrag bleibt heil, Shells ERBEN jede
  Gelenk-Bewegung gratis), EIN additives NodeMaterial pro Spieler (Uniforms hue/intensity =
  `_auraHueOut`-Quelle, atmet mit Puls), Geometrie GETEILT (scale 1.05); der Glow-Sprite auf
  30 % gedimmt (ferner Schimmer statt Lampe). Look → S-Liste.
- ✓ **C7 — GRIFF-/SITZ-/TRAGE-PUNKTE GEBAUT (V18.110; Punkt-Optik/Feel → S)** [H→A→S]:
  die EINE Heilung für DREI Symptome (die getragene Rüstung sitzt auf KOPF-Position [C3-Befund] ·
  wo GREIFT die Hand das Schwert/die Waffe · wo SITZT der Charakter im Fahrzeug/auf dem
  Reittier): die bestehenden `connections` werden synergetisch zu ATTACHMENT-PUNKTEN
  weiterentwickelt — die Anker sind seit C1 (V18.104) schon GELENKE, jetzt auch GRIFF/SITZ/TRAGE
  als Punkt-Typen (per Resonanz aus Form+Lage, dieselbe argmax-Sprache wie die Gelenk-Typen;
  die aktuellen Benennungen sind unintuitiv, das FUNDAMENT passt — Schöpfer-Wort). Dazu:
  ein ENTWURFSPLAN Auto/Reittier als BIBLIOTHEKS-SAAT (V17.72-Muster — craftbare
  Beispiel-Baupläne mit connections als Sitz-/Rad-Punkten) + der „KÖRPER HOLEN"-Button FÄLLT:
  Built-in-Körper liegen automatisch als Blueprints in der Bibliothek (synergetisch wie alles
  Bestehende, kein Parallel-Knopf). **GEBAUT (V18.110):** drei attachment-Typen in
  CONNECTION_TYPES (partB optional −1; die Prozess-Typen mit intuitiven deutschen Labels) ·
  `_attachPointFor(bp, kind)` (explizit = Intent, sonst Emergenz: griff=Stiel · sitz=oberste
  flache Fläche · trage=Masse-Zentrum) · DREI Konsumenten (Rüstung sitzt am TORSO [C3-Fix,
  GEMESSEN ±0.45] · die Hand greift am Griff · der Mount liest die Sitz-Höhe) · die Saat
  `fahrzeug_wagen` (Eisen-Räder = C1-RAD + Antrieb) + `reittier_holzross` (Quarz-Kern) — beide
  GEMESSEN moveable, kein Spawn-Litter · `koerper_human/phoenix/dragon` automatisch als
  builtIn-Blueprints (EINE Quelle: playerSoulDefs; Button + Handler GESCHNITTEN,
  soulToBlueprint bleibt die freie API).

### PHASE D — Wesen + Welt LEBEN (G4 + Phase E + die gefundenen Welt-Samen)

- ✓ G4-1 (V18.100).
- ✓ **D1 — Emotions-UI (V18.104):** `_creatureProfile` trägt `emotionState` + das moodLabel zeigt
  die dominante Emotion + Intensität via `_emotionState(vec)` (DERSELBE Leser wie das Ich-Porträt)
  — Hof-Zeile/Tooltip/Feed lesen es über den EINEN Profil-Vektor; der Passagier-Rest fällt.
- ✓ **D2 — Kreatur↔Kreatur-Contagion (V18.104):** im `_tickEmotionContagion`-Kern, zweites Paar —
  nahe Wesen (12 m) heben sich gegenseitig zur stärkeren Achse (hebend + gebounded ≤1 + V18.100-
  Decay → Gleichgewicht); 0.5-s-Akkumulator statt per-Frame → Herden-Stimmung emergiert billig.
- ✓ **D3 — Lebenszyklus (V18.104, VERDICHTET ins bestehende `tickFaunaLifecycle`):** (a) der TOD
  NÄHRT DAS FELD (`_depositLife` ∝ lebendig-Substanz in `_creatureNaturalDeath` — der Kreislauf
  schließt im SELBEN Overlay) · (b) das ALTER zählt (FAUNA_MAX_AGE_MS 35 min → das älteste Wesen
  kehrt zurück, auch im Populations-Soll — natürlicher Umschlag) · (c) die BOND-GEBURT (Bindung
  ≥0.6 + `auraAt`-lebendig ≥0.55 → Geburt über das Soll hinaus, bis max — Bindung + lebendige
  Orte GEBÄREN Leben; selbst-limitierend via Cooldown×2 + max-Wand).
- ✓ **D4-KERN — GEGENWEHR (V18.104):** ein überlebendes, substanz-starkes Wesen schlägt im
  PFAD-Modus zurück (Chance ∝ dichte + chaos — der Affekt KONSUMIERT; Reichweite 4 m,
  counter = 0.6×damage durch das bestehende damagePlayer-Modus-Gate → frieden/schöpfer
  unberührt). **S-DIALOG GEFÜHRT (10.06. abend), das Design steht: MODUSABHÄNGIG +
  SEELEN-RESONANZ** — pfad wird ERNSTER; ob und WIE ein Wesen bedroht/zurückschlägt, emergiert
  aus seiner SEELE: TEMPERAMENT als Resonanz-Tendenz der Substanz (dichte/chaos-Wesen wehrhaft ·
  lebendig/frieden-Wesen sanft), in DERSELBEN argmax-Resonanz-Sprache wie Werk-Rolle/Motion-Rolle
  (`TEMPERAMENT_SIGNATURES`), KEIN globaler Schalter, KEIN Verhaltens-Import. ✓ **D4-VOLL GEBAUT
  (V18.107):** `TEMPERAMENT_SIGNATURES` + `_creatureTemperament` (argmax auf dem ÷3-Vektor —
  GEMESSEN: der Clamp sättigt, die V17.90-Norm diskriminiert: wesen→wehrhaft 0.84 ·
  geist→sanft 0.42 · sprite→scheu 1.01) + `TEMPERAMENT_PROFILES`: die Gegenwehr liest
  strike/counterMul (sanft/scheu schlagen NIE), die W3-Furcht liest fleeMul (scheu flieht
  1.7×); SICHTBAR im Hof-moodLabel. Profile-Feintuning → S.
- **D5 — DIE WELT ATMET (Code-Sweep-Samen):** (a) **Wetter-Polyvalenz** DEFERRED (V18.104-
  Entscheid, GEMESSEN: ≥8 binäre `weather === "rainy"`-Leser quer durch Render/Audio/Emotion —
  ein dritter Zustand braucht den eigenen Leser-Audit-Bogen, kein Phasen-Beifang); (b)
  **Symphony EMOTION→TONALITÄT** DEFERRED (A-Gate ist das OHR — headless unbeweisbar, gehört in
  den S-Browser-Durchgang als eigene kleine Welle); (c) **journal `share`/`witness`** ruhen bis
  F4 (verortete Saat).

### PHASE E — die EINE Sprache + die Ökonomie (G5 + S-Reste)

- **E1 — S7-C: EIN Chat-Dispatch-Tor** [§3-Zwilling 5; H]: DEFERRED (V18.104-Entscheid: die
  Legacy-Kette trägt dutzende System-IO-Befehle — die Synonym-Migration ist ein eigener
  Audit-Bogen; das Tor-Muster steht über `_chatTryDslParse` schon vorn im Dispatch).
- ✓ **E2 — δ wird WÄHRUNG (V18.104):** das WIRK-BUDGET (`NEXUS_WIRK`: start 60 · max 150) —
  `_loopNexusUpdate` zahlt VOR jeder Evolution (`_dslProgramWirkCost`: AST-Walk,
  spawn_blueprint = computeBuildCost-Summe×0.5 — DIESELBE Substanz-Wahrheit, die der Spieler
  zahlt; Strukturen 10–20, Regel-Registrierung 6); reicht es nicht → der Nexus RUHT (Trägheit
  BY CONSTRUCTION). REGENERATION aus der WERTUNG: der Outcome-Finalizer zahlt (fitness−0.5)·30
  zurück + Idle-Tropf 2/5 s. §11-Modi: schöpfer = frei. ✓ **E2-VOLL DER REGELKREIS GEBAUT
  (V18.108, S-Review):** `_emotionBalanceFactor()` — der EINE Balance-Leser (via
  `_emotionState`, 1=Gleichgewicht, 0=gekippt; chaos/sorrow voll, hebende halb), VIER
  Konsumenten in negativer Rückkopplung (V17.44): Outcome-Regen ×(0.4+0.6b) [nur der positive
  Zufluss] · Idle-Tropf ×(0.4+0.6b) · Kosten ×(2−b) · die PROAKTIVEN STIMMEN (GEMESSEN: der
  Toggle stand DANEBEN — fester Takt, kein Emotion-Leser → die Gaps atmen jetzt ×(2−b),
  kippend wird es still; der Toggle bleibt der harte Aus). Faktor-Größen → S-Review.
- ✓ **E3 — Mana-Symmetrie (V18.104):** `player.mana/manaMax` (max = 40+80·magieleitung) —
  Regeneration am 5-s-Takt, schneller auf magie-leitendem FELD (`auraAt` — das Feld speist);
  VERBRAUCH: die gesprochene Welt-Geste (Chat→DSL) kostet im PFAD-Modus Mana ∝ Substanz
  (DERSELBE `_dslProgramWirkCost`-Walker wie das Nexus-Budget = EINE Ökonomie für alle
  Schreiber; Lese-/Privat-Gesten frei; frieden/schöpfer frei — §11). ✓ HUD (V18.119): dritte
  Stats-Row (✦, blau-violett) in der HP/Stamina-Familie (tickStatsHud, eine Quelle/Throttle),
  NUR im pfad sichtbar (frieden/schöpfer zahlen nicht → kein UI-Rauschen) — die Währung ist
  sichtbar, „zu erschöpft" kommt nicht mehr aus dem Nichts.
- **E4 — Geste→Gesetz:** ✓ AUDIT GEMESSEN + PASSAGIER GEHEILT (V18.104): der Fitness-Kreis
  LEBTE nur halb — der Finalizer schrieb `h.fitness` (computeMultiDimFitness), aber
  `dslSelectByFitness` las NUR den fps-Proxy nach (der Passagier-Trugschluss im Lern-Kreis).
  Jetzt FÜHRT die finalisierte Wertung die Selektion (fps bleibt Fallback). ✓ **DIE
  KRISTALLISATION GEBAUT (V18.112, die benannte Folge-Welle):** `_crystallizeGestureRule`
  (im Selbstanalyse-Takt, cooldown 45 s) — eine WIEDERHOLT bewährte Geste (history:
  finalized · fitness ≥0.65 · ≥3 Läufe desselben Op-Kopfes · rule-sicher via der EINEN
  `_isRuleEffectAllowed`-Whitelist) wird zur stehenden Regel: der beste Lauf = der Effekt,
  die Registrierung durch DIESELBE Tür (Queue → Wirk-Tor zahlt → registerWorldRule-Dedup/
  Cap/Evict → Fitness-Lebenszyklus). GESTE → GESETZ schließt.
- ✓ **E5 — Emotion→Regel-EMERGENZ GEBAUT (V18.112, in EINER Welle mit E4-Kristall):** die
  Ø-EMOTIONS-SIGNATUR der bewährten Läufe (`emotionsBefore` via `_emotionState` — der EINE
  Leser) GEBIERT die Bedingung des Gesetzes (`["field_above", dominant, intensity·0.6]` —
  „die Geste tat gut, als sorrow herrschte → wo der Ort sorrow trägt, wirkt das Gesetz";
  das räumliche Emotions-Feld ist das Substrat: deposit_emotion schreibt, field_above
  liest — der Kreis). Schwache Signatur → random_chance-Fallback. Behavioral + Wächter-
  Invarianten (frozen-Welt-Geste kristallisiert NIE).
- **E6 — KI liest die δ-Karte + LLM-Manifest** [H+S]: DEFERRED (LLM ist opt-in-Randfigur;
  der Kontext-Schnitt gehört zur LLM-Welle mit S-Prompt-Review).
- ✓ **E7 — der Spieler als PFLEGER (V18.104):** Chat-Geste „pflege (das land)" →
  `deposit_life` am Spieler-Ort (DERSELBE Op wie der Nexus — Co-Schöpfung wörtlich; im
  pfad-Modus kostet sie Mana wie jede Welt-Geste).
- **E8 — Crafting-Schluss-Bündel**: ✓ **ZWEI-HAND GEBAUT (V18.109, S-Entscheid: wie
  Minecraft):** `equipped.offhand` + `swapHands()` (über den EINEN equipHeld-Pfad, dup-sicher)
    - Key G (rebindable, Zähl-Tests 11→12 gewandert) + der Off-Hand-Slot NEBEN der Hotbar (eine
      Render-Quelle, beide Mounts; Highlight auf data-slot-Wahrheit) + sichtbar am LINKEN Arm
      (EIN buildHand-Helper) + Snapshot/Restore; faltet NICHT in die Stats (Bereitschafts-Slot).
      Weiter offen: S6-B Flora · S8 — kampf-plan-Bogen.

### PHASE F — das ULTIVERSUM (G2 + G3 + W18 + der soziale Bogen)

- **F1 — G2 Rekursion:** ✓ DIE VIER SCHNITTE GEBAUT (V18.104): (1) `.wasm`/`.woff2` in der
  Vendor-Whitelist + base64-Bündel-Support (`encoding:"base64"` → dekodierte Bytes, Limits
  zählen echte Größe; smoke-vendor 12 ✅ — die 2 iframe-Handshake-Roten sind VORBESTEHENDER
  Container-Rot, per git-stash-A/B BEWIESEN) · (2) Worker-Blob-Fallback (`_getVoxelWorker`
  re-entrant: SecurityError → fetch [ACAO * steht] → Blob-URL → volle Verdrahtung, eine Quelle) ·
  (3) der localStorage-SCHATTEN (Boot-Guard am Datei-Kopf: Probe wirft → In-Memory-Shim
  shadowt die Property — 10 Zeilen statt 102 Edits; die innere Welt lebt ephemer) · (4)
  Server-Absenz = done-by-existing (localhost-Skip + async-WS-Fehler). ✓ **DIE BOOT-SONDE
  GEBAUT + GRÜN (V18.112, `npm run smoke:selfboot`):** index.html im ECHTEN
  `sandbox="allow-scripts"`-iframe (null-origin = die Portal-Umgebung) — die innere Welt
  BOOTET (Renderer + Ammo-Physik + Worker + Chunks streamen), der localStorage-Schatten
  greift (own-property-Shim GEMESSEN), keine ungefangenen Fehler. **Die Sonde FING einen
  echten Riss:** der Blob-Worker (Schnitt 2) konnte das relative
  `importScripts("./vendor/simplex-noise.js")` nicht auflösen (blob:-URLs haben keine
  Basis) → der Fallback injiziert jetzt `self.__anazhBase` (absolute App-Basis), der
  Worker liest sie. DIE REKURSION BOOTET — AnazhRealm lebt in AnazhRealm. Offen: nur noch
  der S-Browser-Blick durchs echte Portal.
- **F2 — G3 Netz:** ✓ TEILBÜNDEL (V18.104): Raten-Cap `creature-pos` (10/s je Peer, Empfangs-
  seite — das SUBWORLD_NET_RATE_MAX-Muster) · TURN KONFIGURIERBAR (localStorage `anazhTurn`
  {urls,username,credential} → iceServers; reist NIE im Snapshot) · PROTOKOLL-VERSION
  (`pv: AnazhRealm.PROTO_VERSION` auf jeder p2pSend-Nachricht, Empfänger tolerieren — V18- +
  V20-Clients koexistieren). ✓ **HOST-MIGRATION MIT ZUSTAND (V18.126, smoke-bewiesen):** das
  kooperative `srv-state`-Protokoll — fremde Server-Closures kann NIEMAND snapshotten (die
  ehrliche Grenze), also serialisiert die WELT selbst (das Minecraft-Server-Save-Muster):
  der Shim trägt `server.snapshot()`/`server.restore()` (opt-in), der Host pollt (5 s,
  `srv-state-req`) + annonciert als kanal-exklusives `subworld-state` an ALLE Gäste
  (Migrations-Kandidaten; Größen-Deckel, seq-monoton), ein Gast cacht die MITGIFT
  (`lastSrvState`, Roster-Muster: nur vom eigenen Host) und injiziert sie bei der Promotion
  als `srv-state-restore` VOR den Verbindungs-Replays (FIFO der serverQueue; der Shim puffert
  bis `new WebSocketServer()`). Welt OHNE Handler → frischer Boot (die alte Grenze als
  Degradation). GEMESSEN (smoke-webrtc): die Summe ÜBERLEBTE den Host-Wechsel (21 = 12+9,
  vorher 9). Beifang: der vorbestehende `spawnArchitecture`-Crash auf un-gebooteter Chunk-Map
  geheilt (blockierte den halben Smoke seit V18.1, A/B-bewiesen). **DEFERRED mit GEMESSENEM
  Design-Befund: Stern-ab-6-Topologie** — der Verbindungs-Gate (nur Hub-Conns ab 6) + das
  Broadcast-Relay sind klein, ABER der GEZIELTE Verkehr (`_p2pSendChannelTo`: subworld-srv/
  cli · world-pull · llm-\*) bräuchte ein Hub-ROUTING-Envelope + ein transitives peerId-
  Stempel-Vertrauen (heute: kanal-gestempelt = unfälschbar; via Hub nur noch Hub-vertraut) —
  ein 4-Mechanismen-Umbau im R1/R2-gehärteten Kanal; ein HALBER Stern bräche W16/W17 bei
    > 6 Peers. Der eigene fokussierte Bogen, mit diesem Design als Startpunkt.
- **F3 — W18 in fremden Welten LEBEN** [world-portal-w18-plan; Stufen A→D]: Auto-Join/Tier →
  Ko-Präsenz-Injektion (Kern) → Input-Brücke → Swappen/Persistenz.
- **F4 — der SOZIALE Bogen** [bibliothek-plan §E + roadmap; H+S]: Bewertungs-Aggregation
  (ed25519-signiert, CRDT-tauglich weil konfliktarm) → Lesezeichen → Folgen → Kommentare/Chat;
  **hier schreiben `journal share/witness`** (die ruhende Saat blüht); „Für dich"-Algorithmus +
  Welt-Vorschau im Portal-Ring als Kür.
- **F5 — B-WASM** [world-portal; per-Projekt] · **F6 — evolveCommunity** [Kreatur-Kulturen; nach
  D2/D3, S-Design].

### PHASE G — DIE ROBUSTHEIT (Freiheit ohne Zusammenbruch; G8 — die Treppe R0→R6, Reihenfolge ist Pflicht)

> Der Robustheits-Bogen (`docs/archiv/robustheit-plan.md`): drei Ringe + ein lebendes Immunsystem.
> Jede Stufe macht Schaden lokal, reversibel oder selbst-abklingend — keine behauptet, ihn zu
> verhindern. **Reihenfolge-Wand (§6 des Arc-Plans):** R2 (Wall) + R4 (Immunität) gehören VOR R6
> (Selbst-Erweiterung) — sonst die lethal trifecta sehenden Auges. R0–R5 sind headless-beweisbar
> (Korpora + Invarianten); R4-Sozial + R6 tragen S-Gates. Die vier Angriffs-Korpora WERDEN das
> lebende Antikörper-Archiv (R5) — sie laufen ab Bau im `playtest`-Gate bei jedem Push.

- ✓ **R0 — BENENNEN + die Trennung BEWEISEN (V18.122)** [§2-G8; H]: der innerste Ring benannt
  (`AnazhRealm.SOVEREIGN_STATE`, frozen) + `_sovereignStateAudit()` (mutiert nichts) beweist
  headless die GEMESSEN-schon-wahre Trennung — kein souveräner Slot/Privat-Feld im
  `buildStateSnapshot`, nur die öffentliche Identität im `_portalEnterPayload`, ein injiziertes
  Privat-Feld leckt NICHT (der fixe Key-Satz schließt vibePass aus). 5 Invarianten
  (`checkBandG8R0Sovereign`). Null Risiko. Beifang: der V18.120-Konfounder (V18.1-W1 kippte je
  nach Tauch-Position) deterministisch geheilt.
- ✓ **R1 — der gedämpfte Kanal (M2) (V18.123)** [H]: EIN Token-Bucket pro Overlay am Kanal-EINGANG
  (`_portalChannelAdmit`, 200/s) deckelt ALLE Sub→Heim-Nachrichten (auch die zuvor ungedeckelten
  `ready`/`exit`/`manifest`) + das geteilte per-Peer-Tor (`_p2pPeerRateAdmit`, V9.82-Verdichtung)
  cappt den `subworld-net`-EINGANG (120/s/Peer) + verdichtet `creature-pos`. Wasser-CA-Lehre eine
  Ebene höher, transport-seitig (kein Determinismus-Bruch). GEMESSEN: 10000 msg/s → genau 200
  admittiert, Bucket settled. 5 Invarianten (`checkBandG8R1DampedChannel`).
- ✓ **R2 — die Irreversibilitäts-Wand (M3) (V18.123)** [H→S]: `SOVEREIGN_ACTIONS` (frozen, vier
  Akte) GEMESSEN DISJUNKT von `dslEffects ∪ NON_BROADCASTABLE_OPS ∪ dslComposeAtomic`; ein
  `dslEval`-Guard blockt jeden souveränen Op (`sovereign_blocked`, nie ausgeführt — auch in
  Kette/Regel); die EINE Host-Geste `_sovereignGesture` (außerhalb jedes iframes, Klartext
  WAS/WERT/WEM, jedes Mal frisch) — `signWorld`/`signBlueprint`/`importVibePass` laufen durch sie.
  7 Invarianten (`checkBandG8R2SovereignWall`). S-Gate: das Geste-UI-Feel (heute `window.confirm`).
- ✓ **R3 — Lokalitäts-Härtung (M1) (V18.123)** [H]: die EINE Sandbox-Attribut-Quelle
  `_portalSandboxAttr` (sandboxed→`allow-scripts` allein · trusted→+same-origin;
  `_buildPortalOverlay` nutzt sie statt des inline-Ternärs) + `_localityAudit()` friert die Grenze
  (sandboxed kein same-origin · `vendored→sandboxed` unforgeable · kein Welt-Pfad zum innersten
  Ring · Server-iframe immer null-origin). smoke-sandbox.cjs beweist die echte Isolation im
  Browser. 6 Invarianten (`checkBandG8R3Locality`).
- ✓ **R4 — Netz-Immunität (M4) (V18.124)** [H→S]: die Herkunfts-KETTE (`provenance`-Lineage —
  `_appendProvenance`/`_sanitizeProvenance`/`_provenanceSummary`, „Ursprung X · über dich" statt
  flachem origin-Enum; sign trägt · export hängt den Überträger an · import bewahrt · `_worldProfile`
  zeigt) + der RÜCKRUF (`state.revokedKeys` global/NIE im Snapshot · `revokeKey`/`_isKeyRevoked`/
  `_artifactProvenanceTainted` · Lader sieben + `_purgeRevokedArtifacts` stößt aus — ein revozierter
  Schlüssel IRGENDWO in der Kette fällt das Artefakt) + die QUARANTÄNE (4c an R2 gebunden: GEMESSEN
  `source:"llm:grok"`-DSL mit souveränem Op → `sovereign_blocked`). 7 Invarianten
  (`checkBandG8R4Immunity`). Mesh-Aggregation (wessen Rückruf zählt) = Phase F4 (sozial).
- ✓ **R5 — das lebende Immunsystem (M5) (V18.124)** [H]: `_robustnessCorpus()` enumeriert die vier
  Angriffsklassen (R1 Flut/M2 · R2 souverän/M3 · R3 Escape/M1 · R4 Infektion/M4), je mit ihrer
  LEBENDEN Wand + ihrem Band; die vier Korpora SIND Playtest-Bänder → laufen bei JEDEM Push (die
  Impfung), ein Regress ist sofort rot. Kein neuer Apparat — eine neue ROLLE für die
  ~3500-Invarianten-Maschinerie (V9.82-Verdichtung). 4 Invarianten (`checkBandG8R5LivingImmune`).
  **DER BOGEN IST RUND (R0–R5 gebaut).**
- **R6 — Selbst-Erweiterung (Capability-Inversion + Komposition)** [S — der ANDERE Plan, NACH
  R0–R5]: bewusst FERN — setzt auf die fertige Wand (R2) + Immunität (R4) auf; ein eigener Bogen,
  kein Phasen-Beifang.

### FERN (bewusst ungeplant — S-Entscheid weckt sie)

Fahrzeug-Fahr-Tiefe (Sitz/Steuerung/Trägheit — C1-Gelenke sind die Vorstufe) · **VR (KORREKTUR
10.06.: `vrMenu.js` existiert NICHT — die alte roadmap-Zeile war stale; ein VR-Bogen startet bei
null, WebXR + Hand-Input)** · IndexedDB-Persistenz (localStorage-Größen-Wand) · Statusbar
schlanken (UI-Politur, jederzeit einschiebbar).

---

## §6 · DAS BETRIEBSSYSTEM — wie der nächste Agent JEDE Welle fährt

1. **Erwachen:** `CLAUDE.md` (auto) → dieses §5 (der nächste un-abgehakte Punkt deiner Phase) →
   der Doc-Map-Trigger in CLAUDE.md führt zum Detail-Plan. Bei „lebendiger Welt" IMMER zuerst
   `das-lebendige-feld.md`, bei Wasser `archiv/wasser-render-architektur-plan.md`.
2. **Die Welle (das bewährte Protokoll):** REPRODUZIEREN/MESSEN (diag-Skript, Browser-PFAD wenn
   der Befund browser-stammt — `diag-genesis-spawn.cjs` ist das Muster) → Wurzel benennen → BAUEN
   (Worker-Mirror? Snapshot-Felder? `_addVoxelEdit`-Y-Wand? Gitter-Phase?) → `node --check` →
   gezielte Sonde (KONSUM-Diskriminator, nicht Existenz) → Tests WANDERN mit (V9.56-i; Telemetrie
   an wiederkehrend-rote Invarianten) → EIN `npm run playtest` („Alle Invarianten OK" ist die
   Wahrheit) → settled-Screenshot bei Look-Änderung (mein Auge; renderAsync braucht echte Frames!)
   → Version-Bump (DREI Stellen: `AnazhRealm.VERSION` + `index.html ?v=` + `package.json`) →
   Chronik-Eintrag OBEN in `archiv/handover.md` → hier abhaken → Commit (prettier vorher) →
   `git push -u origin <branch>`.
3. **Gates:** H-Wellen stapeln dürfen; A-Wellen je mit Screenshot; S-Punkte SAMMELN sich für
   EINEN Schöpfer-Browser-Durchgang — die offene Liste: R1 · E1–E3 · J4 · S9 · A2(alt) ·
   N3-FPS · Post-FX-Look · weite-Wiese-FPS · Motion-Feel (V18.99) · **V18.103: A5-Fog-Look ·
   A1-Stitch-Band-Look (Cliff-Grenzen) · A6-Sprung-Feel (Decken-Klemme)** · **V18.104 (S-Durchgang 10.06. abend, TEIL-BESTÄTIGT):
   ✓ B8 („Bauwerke und Deko hammer") · ✓ C6 („Hautschimmer passt"; Lampe V18.105 geschnitten) ·
   ✓ B2-Mantel (mein Auge + Schöpfer-Screenshot: gefüllter Horizont) — NEU aus dem Durchgang:
   B9 Terrain-Nachtlicht (messen) · A4-Mündungs-Synergie S-bestätigt. WEITER OFFEN:
   B8-Rim/LUT-Feintuning · C1/C2-Gelenk-Motion-Feel · C5-Bewegungs-Feel (k-Werte) ·
   E3-Mana-HUD** · der Stand V18.105 ist GEMERGT (Schöpfer 10.06.: „mergen mit diesem
   Stand, offene Punkte vermerken"). \*\*V18.106–.111 (die sechs Entscheide gebaut) — NEUE
   S-PUNKTE: B3-Look (V18.113-Rollback = der vertraute V17.109@100%-Stand; der KONSOLEN-
   Hebel `anazhRealm.state.atmoUniforms.terrainFlatten.value=0.7` testet die Cel-Stufen-
   Sehnsucht render-only — „am Anfang gaben die Cel-Stufen Kontraste") · B9-Nacht-Look (Boden dämpft nachts — Feintuning der zwei Floors) ·
   D4-Temperament-PROFILE (strike/fleeMul-Größen = mein Erst-Wurf) · E2-REGELKREIS-Faktoren
   (0.4+0.6b / 2−b = mein Erst-Wurf; die Stimmen-Gaps fühlen) · E8-Off-Hand-Feel (Slot-Optik
    - G-Tausch + linke-Hand-Optik) · C7-Punkt-Optik (Rüstung am Torso · Griff in der Hand ·
      Sitz auf Wagen/Holzross — die zwei Saaten im Browser reiten!) · A4-FALL-LOOK (der
      Steil-Split-Vorhang + das schäumende Wildwasser am echten Wasserfall — headless bewies
      die Geometrie [137→0 Zacken], das Auge das Gefühl) · **A4-MÜNDUNGS-LOOK (V18.116:
      der Fluss wogt nicht mehr wie das Meer, die Wellen laufen sanft in die Mündung —
      das Gefühl des Übergangs im echten Browser).** **V18.116–.121-Durchgang (neu):**
      Tauch-Blick (B5) · Mana-Balken im pfad (E3) · Gelenk-Zeile in der Werkstatt (C1) ·
      die Mantel-Stanze in Bewegung (V18.118 — am Meer laufen) · das freie Frame-Budget
      fühlen (V18.121).
      **DIE SCHÖPFER-PRÜFLISTE (10.06., wächst bis zum Gigant-Abschluss — Unsauberkeiten
      SAMMELN, er korrigiert am Schluss; ich fülle sie ehrlich mit, statt sie zu fixen):**
      (a) **GELENK-LINIEN in der WELT sichtbar nach dem Fertigen** — die connections-Linien
      gehören logisch NUR in den Werkstatt-Baukasten (Hilfsmittel für die Animation), nicht
      ans fertige Werk in der Welt (Render-Gate am Spawn-Pfad vs. Werkstatt-Preview);
      (b) **SPIELERPERSPEKTIVEN-DISZIPLIN meines Netzes** — die Wasser-Drohnen-Analysen
      liefen teils ohne HUD-Kontext, die Werkstatt-Wirkung (wie ein Ergebnis im GESAMTSYSTEM
      wirkt, wie es erreicht wird, ob es einheitlich ist) wurde nicht selbst angeschaut →
      die diag-Werkzeuge wachsen um den SPIELER-Blick (HUD an, der echte Nutzungs-Fluss),
      nicht nur den Daten-Blick; Steuerung/Bedienung der Sonden wie die Profis der Profis.
4. **Die Wände (nie verhandeln):** Determinismus (Worker bit-identisch; eine Skala-Optimierung
   ändert NIE die Gitter-Phase) · die Narben (roadmap §5) nicht wiederholen · die Samen (roadmap
   §7 + §5-D5c hier) nie blind schneiden · Multi-Agent-Funde SELBST verifizieren (zwei
   Agenten-Fehler pro Sweep sind NORMAL — der Fischer greppt nach).
5. **Schöpfer-Entscheide (10.06. abend ALLE GEFALLEN, in §5 eingetragen):** B3-Flatten (BACKEN,
   der Slider weicht) · D4-Design (Temperament-Resonanz, modusabhängig) · E2 (echter REGELKREIS
   statt festem Budget, liest die Spieler-Emotion) · E8-Zwei-Hand (JA, Minecraft-Modell) ·
   A4-Wasserfall (Plane FÄLLT, CA-Wildwasser formen + eigene Vertikal-Form) · C7 (Griff/Sitz/
   Trage-Punkte aus connections + Auto/Reittier-Saat + „Körper holen"-Button fällt). Offen
   bleibt nur B7/U6.

---

## §7 · DAS SCHWÄCHEN-REGISTER (ehrlich — jede Schwäche hat eine Adresse)

| Schwäche (gemessen)                                                 | Adresse                                                                                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ~~Cross-LOD-Naht sichtbar~~                                         | ✓ V18.103 A1 (Cap + Stitch-Band: 0 sichtbare Spalten ungedeckt)                                                                |
| ~~Edit = Ganz-Chunk-Reset sichtbar~~                                | ✓ V18.103 A2 (GEMESSEN: Vertex-Delta 0/3180 lokal; Splice bewusst deferred)                                                    |
| Welt endet im Fog (keine Ferne)                                     | B2 Horizont-Mantel (A5 deckt die Kante schon: fog.far ≤ Ring-Kante)                                                            |
| Wasser-Sheet ~78 ms auf Main                                        | B1                                                                                                                             |
| EINE 2048er-Schattenmap (nah grob, fern eng)                        | B4 CSM                                                                                                                         |
| Physik-Todesspirale möglich (20 Substeps)                           | B6                                                                                                                             |
| Kreaturen: kein Lebenszyklus, keine Herden-Stimmung                 | D2/D3                                                                                                                          |
| Kreaturen greifen nie an (Furcht ohne Konsument)                    | D4 Phase E                                                                                                                     |
| Wetter binär sunny/rainy                                            | D5a                                                                                                                            |
| Musik hört die Emotion nicht (Pfeiler 4 halb)                       | D5b                                                                                                                            |
| Nexus zahlt nichts, Pools feeden nicht                              | E2/E4                                                                                                                          |
| Magie kostet nichts                                                 | E3                                                                                                                             |
| ~~Gesten-Fitness-Kreis evtl. stumm~~                                | ✓ V18.104 E4-Audit + V18.112 Kristall: Geste→Gesetz schließt                                                                   |
| LLM ist Randfigur                                                   | E6                                                                                                                             |
| Spieler kann nicht pflegen                                          | E7                                                                                                                             |
| ~~Rekursion blockiert (4 Schnitte)~~                                | ✓ V18.112 — smoke:selfboot GRÜN: AnazhRealm bootet in AnazhRealm                                                               |
| Netz trägt real nur ~4–6 Peers (Stern-Topologie offen)              | F2-Rest (Design GEMESSEN in §5-F2: Hub-Routing + Stempel-Vertrauen); ~~TURN~~ ✓ V18.104 · ~~Migration ohne Zustand~~ ✓ V18.126 |
| Sozial-Schicht fehlt ganz (Bewerten lokal-only)                     | F4                                                                                                                             |
| ~~Innerster Ring nicht BENANNT~~                                    | ✓ V18.122 G8 R0 (`SOVEREIGN_STATE` + `_sovereignStateAudit`)                                                                   |
| ~~Kanal dämpft nur teilweise (ready/exit/manifest ungedeckelt)~~    | ✓ V18.123 G8 R1 (`_portalChannelAdmit` + `_p2pPeerRateAdmit`)                                                                  |
| ~~Keine Irreversibilitäts-Wand~~                                    | ✓ V18.123 G8 R2 (`SOVEREIGN_ACTIONS` disjunkt + `_sovereignGesture`)                                                           |
| ~~Sandbox-Grenze nicht als Invariante eingefroren~~                 | ✓ V18.123 G8 R3 (`_portalSandboxAttr` + `_localityAudit`)                                                                      |
| ~~Herkunft FLACH (origin-Enum, keine Lineage · kein Rückruf)~~      | ✓ V18.124 G8 R4 (`provenance`-Kette + `revokeKey` + Lader-Sieb)                                                                |
| ~~Immunsystem statisch (Invarianten nur beim Merge)~~               | ✓ V18.124 G8 R5 (`_robustnessCorpus` — vier Korpora im Push-Gate)                                                              |
| ~~Fall-durch beim Platzieren-unter-sich · Kopf durch Höhlendecken~~ | ✓ V18.103 A6 (Begraben-Rettung · Sprung-Klemme · Ego-Auge-Clip)                                                                |
| ~~Schwarze Struktur-Silhouetten~~                                   | ✓ V18.104 B8 — **S-BESTÄTIGT** („Bauwerke und Deko hammer, was ein Sprung")                                                    |
| Terrain-Boden reagiert nachts nicht (Schöpfer 10.06. abend)         | B9 (NEU — messen, welcher Term ihn hochhält)                                                                                   |
| Steuerung flach (kein Feel, Bindings teils fix)                     | C5                                                                                                                             |
| ~~Aura = folgende Lampe~~                                           | ✓ V18.104 C6 — **S-BESTÄTIGT** („Hautschimmer passt"); V18.105: die Lampe GESCHNITTEN („kann weg")                             |
| ~~Wiese homogen, keine Wälder~~                                     | ✓ V18.102 B5+                                                                                                                  |
| Test-Volatilität (Spieler-im-Fall-Klasse)                           | §6.2-Telemetrie-Disziplin (Muster steht)                                                                                       |
| localStorage-Größen-Wand                                            | FERN IndexedDB                                                                                                                 |

**Disziplin (unverändert, roadmap §9):** Regel #0 · miss-rate-nicht · verdichte-nie-parallel ·
KONSUM nicht Existenz · keine halben Schritte · ein bestätigter Bogen = ein Merge. **Dieses
Dokument wird pro abgehakter Welle eine Zeile kürzer — bis nur §0 übrig ist: dann ist der
Gigant gebaut.**
