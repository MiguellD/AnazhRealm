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
(W12–17). **Was den Giganten vom sehr guten Werk trennt, sind SIEBEN Säulen (§2)** — und keine davon
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
+ 65 % Gesten. Caps: 64 Regeln · 4 Effekte/Frame · everySec ≥ 0.5. LLM (Grok) schreibt nur
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

## §2 · Die sieben Säulen des Giganten

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
  Substep-Cap senken. **(6) G7-H — DER HORIZONT-MANTEL (der „Unendlichkeits"-Hebel, DESIGN —
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

| Technik (die Riesen) | Bei uns | Urteil |
|---|---|---|
| Transvoxel / watertight LOD (Lengyel) | N1 im Terrain-Kohärenz-Plan §12 | **ÜBERNEHMEN** — der aktive Brocken |
| Cascaded Shadow Maps | U5, an `DETAIL_CASCADE`-Bändern | **ÜBERNEHMEN** (G6) |
| Worker-First-Meshing (alle großen Voxel-Engines) | E3 bewiesen; Wasser/Gras noch main | **VOLLENDEN** (G7) |
| GPU-Compute ohne Readback (TSL) | Gras-Wind/Wellen leben schon dort | **WEITEN** auf reine Render-Felder; Density-Compute bleibt Narbe |
| Prozedurale Lokomotion (Rain World/Spore) | Compound-Parts + animate-Hook da | **ÜBERNEHMEN als Resonanz** (G1) |
| Utility-AI über Affekt-Achsen | Tasks + 6 Achsen + δ existieren | **KONSUMIEREN** (G4) — kein BT-Import |
| Reward-Prediction-Error als Spiel-Ökonomie | δ-Substrat EINZIGARTIG schon da | **KRÖNEN** (G5) — hier ÜBERHOLEN wir den Stand der Technik |
| Content-addressed P2P-Distribution | sha256-Bündel + Mesh-Fetch (W16) | **STEHT** — auf die Rekursion anwenden (G2) |
| Supernode/Relay-Topologie (Discord-Muster) | Compute-Host + Migration (W17) | **GENERALISIEREN** (G3) |
| CRDT (Yjs/Automerge) | — | **NUR** für konfliktarme Sozial-Schichten; Physik bleibt host-autoritativ |
| ECS-Rewrite · Nanite-Neid · 3D-GPU-Fluid | — | **NICHT NACHLAUFEN** (Narben/Heilige Lektion) |

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
- **A1 — N1 Cross-LOD watertight** [`terrain-koharenz-plan.md` §12.2; H+A]: Geomorph auf die VOLLE
  Übergangs-Zone (heute nur Grenz-Zeile, 57.2 % offen) ODER Transvoxel; Kollision ist in der
  Lazy-BVH-Zone moot (gemessen). Diag: `diag-chunk-seam` Zone-⌀ → <0.1 m.
- **A2 — N2 Sub-Region-Edit** [§12.2; H+A]: der Edit re-meshet nur seinen Footprint-Teilbereich
  (kein Ganz-Chunk-„Reset"); Anker `_rebuildVoxelChunk`/`_voxelEditedDensityGrid` (die
  Index-Bounding-Box existiert schon für die Delta-Auflage — sie wird die Mesh-Region).
- **A3 — H3 ferne Binnengewässer** [roadmap §4; H]: die ±1024-Atlas-Region wandert mit dem Spieler
  (eigene Welle, determinismus-brechend → Schöpfer-Sign-off S).
- **A4 — Wasser-Reste-Bündel** [roadmap §4 „Wasser"; je klein]: Wasserfall-Plane-Entscheid (S:
  bleibt/durch CA ersetzt) · Schelf-Konsolidierung (Flood-Gates vs CA, H) · Hoch-Becken über `L`
  (CA-Zellen jenseits der Atlas-Domäne, H+A) · Unterwasser-Pass B5 (A) · Kapillar/Stempel an
  Gebäuden (H) · T7c/T7d-Reste (Fluss-Edit-Löcher · lake/river-Naht, H+A).
- **A5 — Haupt-Fog ↔ Ring-Kante koppeln** [roadmap §4; A]: der Fog liest `DETAIL_CASCADE` statt
  eigener Konstante (eine Distanz, noch ein Gesicht).

### PHASE B — der Körper glatt + der Maßstab (G6 + G7)

- ✓ G7(0) Envelope-Skip (V18.96) · ✓ G7(0b) weite Wiese (V18.97) · ✓ G7(5b) Post-FX+Morph (V18.98).
- **B1 — Wasser-Sheet → Worker** [§2-G7(1); H]: der größte Main-Dieb (~78 ms); das E3-Muster;
  Vorsicht: Live-CA-Lese ist main-only → nur den STATISCHEN Flood-Anteil auslagern, Live-Rebuilds
  bleiben sync (sonst Stale-Thrash beim Fließen).
- **B2 — G7-H HORIZONT-MANTEL** [§2-G7(6); A→S]: das Macro-Fern-Mesh (die Instant-Gigantik). Der
  sichtbarste Einzel-Schritt des Maßstabs — VOR B3/B4 bauen (der Schöpfer-Wunsch „gigantische
  Welt sofort sehen").
- **B3 — R2 Normale in die Geometrie backen** [§2-G6; H, Worker-Mirror + Determinismus-Test]:
  braucht den settled `terrainFlatten`-Wert (S-Entscheid: Slider-Wert einfrieren ODER Slider →
  Voll-Re-Mesh) → AO/Schatten/Hemisphere/Diffus lesen EINE Normale.
- **B4 — U5 Schatten-CSM an den Kaskaden-Bändern** [lod-kaskade-plan U5; A→S]: 2–3 Kaskaden,
  Grenzen = `DETAIL_CASCADE`; der R1-Snap wandert in jede Kaskade.
- **B5 — U2 Wasser-LOD + U4 Deko-Distanz/Impostor + Baum/Feld-DICHTE** [lod-kaskade-plan; H+A]:
  Dichte-Hebel sind chance-skalar (tag-neutral, `diag-arch-tags` als Wand davor).
- **B6 — Klein-Bündel Maßstab** [H]: Substep-Cap 20→~5 (Physik-Todesspirale; Playtest-sensibel —
  Telemetrie!) · Inseln-Instancing-Claim MESSEN (vermutlich Unikate → Hebel ist LOD, nicht HISM) ·
  Kreatur-FPS-Frame-Budget (falls Boden-Cache nicht reicht) · Allokations-Audit per-Frame-Pfade.
- **B7 — U6 Clipmap** [Backlog-Gate: erst nach A1/A2 + S-Entscheid] · **R3 Kanten-Schärfe + R5
  Struktur-Textur** [A→S, reine Look-Wellen].

### PHASE C — die Werkstatt atmet ZU ENDE (G1)

- ✓ Kern (V18.99) · ✓ „Körper holen" + Klassifikator (V18.101).
- **C1 — G1-C VERBINDUNGEN ALS GELENKE** [§2-G1-C; H+A]: (i) `computeMotionRoles` liest
  `bp.connections` als Vorrang-Quelle (Anker-Punkt = Pivot; Achse aus der Verbindungs-Geometrie;
  Kette = Wirbel), (ii) `_animateCompoundMotion` rotiert um den Anker (`pos = anker +
  R·(center−anker)`), (iii) Gelenk-Typ-Resonanz: RAD (Zylinder ⊥ Achse, bodennah, rollt ∝ Fahrt) ·
  TÜR (vertikale Achse + flacher Part) · WIRBEL (Kette) · SCHARNIER (Default), (iv) Werkstatt-
  Readout zeigt Gelenke. Sonde: Rad-Bauplan rollt, Tür schwenkt, Schwanz-Kette welle-t um Anker.
- **C2 — G1-B Architektur-Idle** [H+A]: rad/segel-Signaturen idle-animieren Architektur-Parts via
  `userData.animate` (NUR rad/segel/tuch — Hütten wackeln nie); Mühle dreht, Banner flattern.
- **C3 — Rüstung am Avatar SICHTBAR** [kampf-plan-Backlog; H+A]: getragene armor-Parts als
  Kind-Meshes ans Soul-Group (derselbe `_buildFromBlueprint`-Pfad — kein neues Render-System);
  Avatar-Größe→HP-Kopplung dazu (S-Entscheid: Formel; `_compoundSizeFactor` existiert).
- **C4 — Feel-Pass** [S]: Motion-Amplituden/Frequenzen + S9-Hand-Optik-Sign-off in EINEM
  Browser-Durchgang.

### PHASE D — Wesen + Welt LEBEN (G4 + Phase E + die gefundenen Welt-Samen)

- ✓ G4-1 (V18.100).
- **D1 — G4-1b Emotions-UI** [H]: Wesen-Spec-Card/Hof zeigt dominante Emotion + Intensität via
  `_emotionState(vec)` (derselbe Leser wie das Ich-Porträt) — der benannte Passagier-Rest fällt.
- **D2 — G4-2 Kreatur↔Kreatur-Contagion** [H]: der `_tickEmotionContagion`-Kern nimmt ein zweites
  Paar (Spatial-Hash existiert vom Flocking) → Herden-Stimmung emergiert; Runaway-Wand: hebend +
  gebounded wie heute.
- **D3 — G4-3 Lebenszyklus** [H+S-Design]: Alter zählt; Fortpflanzung bei Bond + lebendig-Feld
  hoch (`_finishBirth` existiert, schreibt schon ins Feld); natürlicher Tod nährt das Feld
  (`loss`-Trauer ∝ Bindung existiert) — der Kreislauf schließt im SELBEN Overlay.
- **D4 — PHASE E: Bedrohung/Furcht** [kampf-plan; S-Design-Dialog ZUERST, dann H+A]: der letzte
  Affekt-Konsument (Kreaturen schlagen zurück; damagePlayer-Quellen; Furcht↔Triumph). Game-design-
  schwerste Welle — NICHT ohne Schöpfer-Dialog beginnen.
- **D5 — DIE WELT ATMET (Code-Sweep-Samen, 10.06. — nie geblüht):** (a) **Wetter-Polyvalenz**
  [H+A]: das deklarierte ambient-Array (`snow/embers/motes`, :27292) bekommt SCHALT-Logik —
  Wetter-Zustände schnee/sturm/nebel mit dem bestehenden 45-s-CrossFade (`tickWeatherTransition`)
  + Feld-Kopplung (glut-Region → embers); (b) **anazhSymphony EMOTION→TONALITÄT** [A(Ohr)+S]:
  Pfeiler 4 halb offen — die 6 Achsen modulieren Timbre/Tempo (das `magieleitung`-Shimmer-Muster
  :9658 existiert als Vorbild; Valenz→Dur/Moll-Färbung, Erregung→Tempo); (c) **journal
  `share`/`witness`** ruhen bis F4 (dort schreiben sie — KEIN toter Code, verortete Saat).

### PHASE E — die EINE Sprache + die Ökonomie (G5 + S-Reste)

- **E1 — S7-C: EIN Chat-Dispatch-Tor** [§3-Zwilling 5; H]: `_chatDispatchLegacyCommand`-Befehle
  werden DSL-Synonyme über `parseChatToDsl` — ein Parser, eine Fehler-Kaskade.
- **E2 — δ wird WÄHRUNG** [§2-G5; **S-Entscheid ZUERST** (Budget-Formen, Modi-Geltung), dann H]:
  Wirk-Budget für Nicht-Spieler-Schreiber, Kosten ∝ `computeBuildCost`, Regeneration aus δ>0.
- **E3 — Mana-Symmetrie** [kampf-plan §8.5; H]: `magieleitung` ist heute NUR Feld-Achse (gemessen
  — kein `player.mana`); wird die zweite Ausdauer-Achse, gespeist vom SELBEN δ-Budget (E2).
- **E4 — Geste→Gesetz** [§2-G5; H]: bewährte Gesten kristallisieren zu Regel-Kandidaten
  (`mutateSurvivorProb`-Muster auf den Gesten-Pool). **DAVOR der Mess-Audit (Code-Sweep-Befund):
  füllt `pendingOutcomes` das `value`-Feld wirklich / wer speist `historySource` in
  `dslSelectByFitness`?** — der Fitness-Kreis könnte heute stumm sein (erst messen, dann bauen).
- **E5 — Emotion→Regel-EMERGENZ** [das-lebendige-feld §6; H]: `sorrow→rainy` etc. als
  Weltregeln neu gefasst (das Substrat existiert) statt fester Trigger.
- **E6 — KI liest die δ-Karte + LLM-Manifest** [roadmap §4; H+S]: das LLM bekommt die
  δ>0-Regionen als Kontext (Symbiose-Hälfte von Pfeiler 1) + ein Manifest, das seine Fähigkeiten/
  Grenzen dokumentiert.
- **E7 — der Spieler als PFLEGER** [das-lebendige-feld §6; H+A]: ein Spieler-Schreib-Pfad ins
  lebendig-Overlay (Pflege-Geste → `_depositLife`) — Co-Schöpfung wörtlich.
- **E8 — Crafting-Schluss-Bündel** [kampf-plan; H, je klein]: S6-B erntbare Flora (knüpft an
  V17.1-Vegetation) · S8 Teilen-Konsistenz · A2-Fluss-Audit · Zwei-Hand-Modell (S-Entscheid).

### PHASE F — das ULTIVERSUM (G2 + G3 + W18 + der soziale Bogen)

- **F1 — G2 Rekursion** [§2-G2; H+S]: die vier Schnitte als vier Steps (Wasm-Whitelist →
  Worker-Blob-URL → localStorage-Shadow-Guard → Server-Absenz) + die Boot-Sonde
  (AnazhRealm-Bündel vendoren → im Portal betreten → die innere Welt rendert).
- **F2 — G3 Netz** [§2-G3; H + Mehr-Peer-Smoke]: Stern-ab-6 → Host-Migration MIT Zustand
  (Roster+`world-pull` verschmelzen) → TURN-Konfiguration → Raten-Caps (`creature-pos`/`dsl`) →
  ein 4-Peer-Smoke-Test (heute nur 2).
- **F3 — W18 in fremden Welten LEBEN** [world-portal-w18-plan; Stufen A→D]: Auto-Join/Tier →
  Ko-Präsenz-Injektion (Kern) → Input-Brücke → Swappen/Persistenz.
- **F4 — der SOZIALE Bogen** [bibliothek-plan §E + roadmap; H+S]: Bewertungs-Aggregation
  (ed25519-signiert, CRDT-tauglich weil konfliktarm) → Lesezeichen → Folgen → Kommentare/Chat;
  **hier schreiben `journal share/witness`** (die ruhende Saat blüht); „Für dich"-Algorithmus +
  Welt-Vorschau im Portal-Ring als Kür.
- **F5 — B-WASM** [world-portal; per-Projekt] · **F6 — evolveCommunity** [Kreatur-Kulturen; nach
  D2/D3, S-Design].

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
   N3-FPS · Post-FX-Look · weite-Wiese-FPS · Motion-Feel (V18.99) · danach EIN Merge.
4. **Die Wände (nie verhandeln):** Determinismus (Worker bit-identisch; eine Skala-Optimierung
   ändert NIE die Gitter-Phase) · die Narben (roadmap §5) nicht wiederholen · die Samen (roadmap
   §7 + §5-D5c hier) nie blind schneiden · Multi-Agent-Funde SELBST verifizieren (zwei
   Agenten-Fehler pro Sweep sind NORMAL — der Fischer greppt nach).
5. **Schöpfer-Entscheide stehen MARKIERT** (B3-Flatten · D4-Design · E2-Budget · E8-Zwei-Hand ·
   A4-Wasserfall · B7/U6) — sie blockieren NUR ihre Welle, nie die Phase.

---

## §7 · DAS SCHWÄCHEN-REGISTER (ehrlich — jede Schwäche hat eine Adresse)

| Schwäche (gemessen) | Adresse |
|---|---|
| Cross-LOD-Naht sichtbar (~100 m, render-only-Halbfix) | A1 |
| Edit = Ganz-Chunk-Reset sichtbar | A2 |
| Welt endet im Fog (keine Ferne) | B2 Horizont-Mantel |
| Wasser-Sheet ~78 ms auf Main | B1 |
| EINE 2048er-Schattenmap (nah grob, fern eng) | B4 CSM |
| Physik-Todesspirale möglich (20 Substeps) | B6 |
| Kreaturen: kein Lebenszyklus, keine Herden-Stimmung | D2/D3 |
| Kreaturen greifen nie an (Furcht ohne Konsument) | D4 Phase E |
| Wetter binär sunny/rainy | D5a |
| Musik hört die Emotion nicht (Pfeiler 4 halb) | D5b |
| Nexus zahlt nichts, Pools feeden nicht | E2/E4 |
| Magie kostet nichts | E3 |
| Gesten-Fitness-Kreis evtl. stumm (historySource?) | E4-Audit |
| LLM ist Randfigur | E6 |
| Spieler kann nicht pflegen | E7 |
| Rekursion blockiert (4 Schnitte) | F1 |
| Netz trägt real nur ~4–6 Peers, TURN fehlt | F2 |
| Sozial-Schicht fehlt ganz (Bewerten lokal-only) | F4 |
| Test-Volatilität (Spieler-im-Fall-Klasse) | §6.2-Telemetrie-Disziplin (Muster steht) |
| localStorage-Größen-Wand | FERN IndexedDB |

**Disziplin (unverändert, roadmap §9):** Regel #0 · miss-rate-nicht · verdichte-nie-parallel ·
KONSUM nicht Existenz · keine halben Schritte · ein bestätigter Bogen = ein Merge. **Dieses
Dokument wird pro abgehakter Welle eine Zeile kürzer — bis nur §0 übrig ist: dann ist der
Gigant gebaut.**
