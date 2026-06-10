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
  STATISCH — jetzt geht er) · Peer-Seelen · Werkstatt-Readout. GEMESSEN: avatar_waechter →
  Kopf+2×Flügel+2×Bein; Vierbeiner antiphasig exakt. OFFEN: Browser-FEEL (Amplituden) ·
  G1-B Architektur-Idle (Mühle/Tor: rad/segel-Signaturen) · Arm-vs-Bein-Feinschliff.
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
  Contagion · G4-3 Lebenszyklus · Hof zeigt den vollen Vektor.
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
  Substep-Cap senken. **(5b) GEHEILT ✓ (V18.98):** beide Schöpfer-Konsolen-Wurzeln — die
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

## §5 · Der wahre Norden — die Reihenfolge (Fundament vor Seele, Sign-off vor Stapel)

0. **JETZT:** ~~der Spawn-Restbefund~~ **GEHEILT (V18.95** — der leere Welt-Snapshot zählte als
   „schon generiert"; Browser-Pfad-Sonde `diag-genesis-spawn.cjs` rot→grün) + die offenen
   Browser-Sign-offs + N-Naht (N1/N2) — **das Fundament, das alles trägt** (`terrain-koharenz-plan.md` §12).
1. **G6 + G7(1–4)** — Licht/Terrain eins + die Main-Thread-Diebe in den Worker: der Körper wird
   GLATT (beides messbar, beides ohne Look-Risiko-Stapel; CSM ist das eine pixel-sichtbare Stück →
   eigener Sign-off).
2. **G1** — die Werkstatt atmet (Motion-Resonanz). **KERN GEBAUT ✓ (V18.99)** — Kreaturen +
   Custom-Avatare + Peers + Readout; offen: Browser-Feel + G1-B Architektur-Idle.
3. **G4 + Phase E** — Wesen mit Innenleben + der letzte Affekt-Konsument. **G4-1 GEBAUT ✓
   (V18.100** — 6 Achsen, ein Substrat, Erholung, awe-Contagion); offen G4-2/3 + Phase E.
4. **G5** — δ wird Währung (Nexus-Ökonomie + Mana-Symmetrie + Geste→Gesetz + LLM liest die δ-Karte).
   **Schöpfer-Entscheid vorab:** Budget-Formen + Modi-Geltung.
5. **G2 + G3** — die Rekursion + das sich-speisende Netz (+ der soziale Mesh-Bogen als Begleiter).
   Das Ultiversum zeigt, dass es sich selbst enthält.

**Disziplin (gilt unverändert, roadmap §9):** Regel #0 (mein Auge pro Welle, Schöpfer-Auge pro
Merge) · miss-rate-nicht · verdichte-nie-parallel · KONSUM nicht Existenz · keine halben Schritte ·
ein bestätigter Bogen = ein Merge. **Dieses Dokument wird pro vollendeter Säule eine Zeile kürzer.**
