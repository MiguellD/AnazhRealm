# AnazhRealm Roadmap — Vollumfänglich

Stand: 20.05.2026 (V9.28, Voxel-Terrain-Bogen Phase 5c.1+ — V9.25 Phase 5b ehrlich abgeschlossen (updateCreatures voxel-aware via getTerrainHeightAt) + heightData-Allokation für Voxel-Welten übersprungen (~768 KB + 65k-Noise-Schleife gespart). Phase 1-5b komplett, Phase 5c-Start (V9.26) + 5c.1 (V9.27) + 5c.1+ (V9.28) live; offen in 5c: Ammo-Heap-Leck-Fix (eigene Welle — `btBvhTriangleMeshShape`-Auxiliars cascadieren nicht beim `Ammo.destroy(body)`) + die grosse Heightfield-Code-Entfernung + Test-Suite-Umschreibung — sobald die Migrations-Erfahrung gefestigt ist. ~2935 Invarianten grün, Audit-Strict 0 Failures. Der Fremd-Engine-Bogen (W12-W17) ist komplett; offen darin nur B-WASM (per-Projekt). Volle Wellen-Historie in `CLAUDE.md`.)

Diese Doc beschreibt das **gesamte Projekt vom heutigen Stand bis zum Vision-Endziel** (Welten-Ultiversum). Sie ergänzt `state-of-realm.md` (Was/Warum) um eine puren Plan-Sicht (Wann/Wie). Aufwandsschätzungen sind realistische Tage für eine fokussierte Claude-Session pro Ring/Phase; gerechnet wird linear, ohne Puffer.

**Wichtig**: diese Roadmap ist ein lebendes Dokument. Sie wird nach jedem Ring-Abschluss aktualisiert. Pfeile zwischen Ringen sind weiche Abhängigkeiten — Reihenfolge kann sich verschieben.

---

## 1. Wo wir stehen (Mai 2026, V9.20)

✅ **Ring 0-11.5 + Welle 1-14 + W7 sind live.** Der Kern atmet (Hylomorphismus-Crafting, Tag-Nacht, lebendige Welt), der Multi-User ist tief und mesh-nativ (der Mitspieler ist sein echter Soul — man sieht/spürt/kennt/**hört** ihn, der Präsenz-Bogen ist mit W11 V4 geschlossen; ein WebRTC-Mesh trägt pos/dsl/soul/aura/vibe/companion-say peer-to-peer), das Welt-Portal trägt fremde Engines (W12), der Avatar ist eine souveräne ed25519-Identität (W13), die Bibliothek von Alexandria steht (W14), und das Compute-Sharing ist gebaut (W7 — WebRTC-Mesh, Welt-Snapshot mesh-nativ, LLM-Pool, Public-Lobby). Der Fremd-Engine-Bogen läuft: das Untrusted-Welt-Tor (W12-Erweiterung) + der Auto-Vendor-Pfad (W15) + die Mesh-Welt-Verteilung (W16 komplett) sind gebaut, und W17 (Multiplayer-Sub-Welten) ist vollständig — Phase A (Transport-Shim) + B-Relay (Mesh-als-Server) + C (Gruppen-Portal) + die Multiplayer-Welt-Deklaration (V8.78) + B-JS-Compute Phase 1 (V8.79 — der Compute-Host) + Phase 2 (V8.80 — Host-Migration, verlässt der Host das Mesh, übernimmt ein deterministisch gewählter Nachfolger). Eine Gruppe taucht gemeinsam in eine vendorte Relay- ODER JS-Compute-Multiplayer-Welt; offen im Bogen nur B-WASM (per-Projekt). Chunk-Physik nutzt `btBvhTriangleMeshShape` (visuelles Mesh = Collider). 120 fps im Browser, **~2910 Playtest-Invarianten grün**, Audit-Strict 0 Failures.

**Die drei jüngsten großen Bögen**:

- **Untrusted-Welt-Tor (V8.70)** — eine echte, ungeprüfte fremde Engine läuft null-origin sandgesichert hinter dem Portal: `portalMeta.trust:"sandboxed"` → das iframe bekommt `allow-scripts` allein (opake null-Herkunft), voller Lauf drinnen, null Reichweite zu AnazhRealm. `worlds/schwarm/` (eine eigenständige 2D-Boids-Engine) beweist es. Detail: `docs/world-portal.md`.
- **KI-Übersetzer (V8.68-V8.69)** — ein LLM dockt eine fremde Welt automatisch an: erst ein Portal-Manifest, dann eine deklarative Szene, die der generische `worlds/translated/`-Renderer betretbar macht. Der LLM-Output bleibt durchgehend DATEN (sanitiert), nie ausgeführter Code.
- **W7 Compute-Sharing (V8.62-V8.66)** — der WebRTC-Mesh: echte peer-to-peer DataChannels (Position/DSL/Soul/Aura/Stimme), mesh-nativer Welt-Snapshot, geteilter LLM-Pool, Public-Lobby. Davor W12 Welt-Portal, W13 Vibe-Pass, W14 Bibliothek.

Alle 5 Vision-Pfeiler (Symbiose, Emotion, Fraktal, Multisensorik, Stimme) sind in V2+. Das Hylomorphismus-Crafting ist vertikal integriert, der Co-Schöpfer-Kreis geschlossen, das Welten-Ultiversum (Ringe 8-11.5) vollständig. **Was jetzt vor uns liegt**: die grossen Vision-Ringe sind gebaut — W12 Welt-Portal, W13 Vibe-Pass, W14 Bibliothek, W7 Compute-Sharing alle komplett. Der **KI-Übersetzer** ist vollständig (V8.68 Manifest + V8.69 deklarative Szene). In Arbeit ist der **echte Fremd-Engine-Bogen** — das automatische Tor zu fremden Vibecode-Engines: **V8.70** baute seinen Schlüsselstein (das Untrusted-Welt-Tor — eine echte fremde Engine läuft null-origin sandgesichert), **V8.71+V8.72** den Auto-Vendor-Pfad **komplett** (W15 — ein fremdes Welt-Bündel dockt ohne Handarbeit an, aus einem lokalen Ordner ODER direkt aus einem GitHub-Repo, sandgesichert), **V8.73+V8.74** die Mesh-Welt-Verteilung **komplett** (W16 — Phase 1: eine vendorte Welt reist peer-to-peer; Phase 2: der browsbare Welt-Katalog). Die letzte grosse Schicht des Bogens — die Multiplayer-Sub-Welten (W17) — ist mit Phase A+B-Relay+C komplett: **V8.75** der Transport-Shim, **V8.76** das Mesh-als-Server, **V8.77** das Gruppen-Portal (eine Gruppe tritt gemeinsam durch ein Tor — `portal-invite`-Broadcast + In-Game-Prompt + `joinPortalInvite`). Eine Gruppe taucht gemeinsam in eine Relay-Multiplayer-Welt, kein echter Server. **V8.78** schloss die Multiplayer-Welt-Deklaration (eine vendorte Welt erklärt sich selbst mehrspielerfähig — das Gruppen-Portal greift damit end-to-end für vendorte Welten). **V8.79** baute B-JS-Compute Phase 1 — der Compute-Host: ein Peer der Gruppe führt die autoritative Server-JS einer JS-Compute-Welt in einem verborgenen, sandgesicherten Server-Kontext aus. **V8.80** baute Phase 2 — die Host-Migration: verlässt der Compute-Host das Mesh, wählt jeder Gast aus der annoncierten Roster deterministisch denselben Nachfolger, der einen frischen Server-Kontext baut. Damit ist W17 für Relay- + JS-Compute-Welten vollständig; offen im Bogen nur B-WASM (per-Projekt). **Detailliert in §3 — „Der Fremd-Engine-Bogen (W15–W17)" mit dem W17-Phasen-Detailplan.**

---

## 2. Pfad-D Übersicht (Ringe 0-11+)

| Ring | Pfeiler | Status | Aufwand | Vorbed. |
|---|---|---|---|---|
| 0 | Stabiles Fundament (Bewegung, Physik, Chunks, Save, CI) | ✅ erledigt | – | – |
| 1 | Grok-Stimme (`dialogue-box`, narrative Reflexion) | ✅ V1 live | – | – |
| 2 | DSL als gemeinsame Sprache | ✅ Phase 1-7 vollständig | – | – |
| 3 | Player-Emotionen → Welt | ✅ V1+V2 live | – | – |
| 4 | `anazhSymphony` V1 (Web Audio) | ✅ V1 live | – | – |
| UI | Bedien-Oberfläche (Painterly) | ✅ V1+V2 live, V3 optional | 2-3 h Rest | – |
| 5 | `createPlayerSoul` (Mensch/Phönix/Drache) | ✅ V1+V2 live | – | – |
| 6 | `architectureTemplates` V1+V2 (Bauplan-Universum mit Hotbar + Werkstatt) | ✅ V1+V2 live | – | Ring 2 Phase 3 |
| 7 | **IQ-Schicht statt brain.js** (lernt aus Verhalten + Emotion + 4 LLM-Provider) | ✅ Schicht 1+2 live | – | Ring 3 + Ring 2 Phase 3 |
| W1 | **Welt-Journal + LLM-Selbstwissen** (Welt erinnert, weiß wer sie ist) | ✅ live | – | Ring 7 |
| W2 | **Schöpfer-Ops + Fraktale Baupläne** (define_blueprint/ability, blueprint-Refs) | ✅ live | – | Ring 6.6 |
| W3 | **Welt-Initiative + Welt-Tor** (Grok V2-Trigger, Welt-Info, Teilen/Empfangen) | ✅ live | – | W1 |
| W4 | **Hylomorphismus atomar** — Materialien + Aktivierungs-Matrix + Werkzeuge | ✅ P1+P2+P3 live | – | Ring 6 + Ring 7 |
| W5 | **Hylomorphismus räumlich + mechanisch + rekursiv** — Verbindungen (§5.1) + 5 räumliche Prinzipien (§5.2) + Bauplan-als-Werkzeug (§4.3) | ✅ A+B+C live | – | W4 |
| 8 | Welt-Identität als Multi-Welt-Verwaltung (mehrere worldIds parallel) | ✅ **8 + 8.1 + 8.2 live** — Welt-Index + Per-Welt-Save + Switch/Create/Delete + Person-Übernahme + Per-Welt-Seed + Spieler-Position-Restore + Status-Bar-Welt | – | W3 |
| 9 | Welt-Export/Import (erweitert) — Drei-Wahl Ersetzen/Daneben/Fusionieren | ✅ **live** — `<dialog>` mit drei Aktionen, `importWorldBeside` mit parentWorlds-Spur + Slug-Kollisions-Auflösung + Witness-Journal, Fusion-Button disabled bis Ring 10 | – | Ring 8 |
| 10 | Welt-Fusion + Cascade-Rewire (zwei DSL-Programm-Sets mergen mit parentWorlds) | ✅ **live** — drei Strategien (sequence/random-mix/tag-merge), 2-Spalten-Dialog, Stammbaum mit klickbaren Eltern-Welt-Links, Cascade-Bugfix (sourceBlueprint + refName folgen Rename), Schema 10.0-fusion-v1 | – | Ring 9 |
| 10.1 | Rezepte aus anderer Welt holen (ohne Fusion) | ✅ **live** — `importRecipesFromWorld(srcId)`, 1:1-Inhalt, `-import`-Suffix bei Kollision, Cascade-Rewire wie Fusion, „Rezepte holen"-Button pro Welt-Picker-Reihe | – | Ring 10 |
| 10.5 | Welt-Modifizierbarkeit (pro-Chunk DSL-Delta) | ✅ **live** — `state.worldMeta.chunkDeltas` mit FIFO-Cap 100/Chunk, `modify_terrain(x, z, r, dh)` mit Smoothstep-Falloff, `_rebuildChunkPhysics` aus aktuellen Vertices, `applyChunkDelta` als Hook in `ensureChunkAt`, Chat `grabe loch`/`hebe hügel`, Schema `10.5-chunk-delta-v1` | – | Ring 10 |
| 11 V1 | Multi-User Position-Sync via WebSocket-Broker | ✅ **live** — `signaling-server.js` (RFC-6455 von Hand, zero deps), `state.p2p` mit peers-Map, 30 Hz pos-Broadcast, Remote-Peer-Avatare als Cone+Sphere-Group (HSL-Hash aus peerId), UI-Toggle in Einstellungen, CSP um ws:// erweitert, Sandbox-Grenze (KEIN p2p-DSL-Op) — KEIN DSL-Sync | – | Ring 10.5 |
| 11 V2 | DSL-AST-Broadcast für Welt-Synchronisation | ✅ **live** — Chat-DSL eines Spielers wird via `p2pBroadcastDsl(program)` an alle Mitspieler gesendet, jeder Empfänger ruft `dslRun(program, {source: "remote:<peerId>"})` auf. Drei Loop-Schutz-Schichten (source-Check, peerId-Filter, Server-except-Sender). LLM-/Nexus-DSL bleibt lokal. modify_terrain + weather + spawn_creature synchronisieren beide Welten. | – | Ring 11 V1 |
| 11 V2.1 | LAN-Fähigkeit + Sync-Korrektheit (Bug-Fixes) | ✅ **live** — signaling-server bind 0.0.0.0 (LAN reachable, LAN-IPs werden geloggt), CSP `connect-src ws: wss:` allgemein (statt enge IP-Whitelist), `state.p2p.roomOverride` für ad-hoc-Räume, spawn_*-Chat-Patterns embedden Position+Seed bei Build-Zeit (Empfänger spawnt am SENDER-Ort, gleicher Seed → gleiche Geometrie), `NON_BROADCASTABLE_OPS`-Set für Spieler-private Ops (player_jump_power, player_speed, player_size_mul, player_soul, set_visible werden NIE gesendet) | – | Ring 11 V2 |
| 11.5 | Intuitiver Multi-User-Setup (Modus-Wahl + Einladungs-Code) | ✅ **live** — Neue-Welt-Dialog mit Modus (Allein/Mit-anderen) + Rolle (Host/Joinen). Host: Banner mit `anazh://lan-ip:port/worldId` + Copy-Button, Auto-P2P-Start nach Reload. Join: temp-WS sendet `world-request` → empfängt `world-snapshot` vom Host → `_importGuestWorld` schreibt Welt unter host-worldId mit `role:"guest"`+`hostInfo`, Auto-P2P-Start nach Reload. Server: targeted-delivery via `{to: peerId}`, LAN-Adressen im welcome, Frame-Cap 1 MiB. Schema `11.5-multiuser-v1`. | – | Ring 11 V2.1 |
| W6 | **Crafting-Polish + UX + Stats + Welt-Sinne + Kreaturen-Aufträge** — acht Sub-Blöcke (A–H) | ✅ **Welle 6.A/B/C/D/E/F/G(1-2)/H V2 live**, 6.G Phase 3 offen | 22-28 Sessions verteilt, ~24 abgeschlossen | W5 + Rings 8-11.5 |
| W9 | **Werkzeug-Domains + Welt-Werkstätten + emergente Bauplan-Rolle** (B+C Hybrid) | ✅ **9a-d live (V8.07)** — 6 TOOL_DOMAINS, 5 neue Domain-Werkzeuge, 5 Workshop-Station-Bauplane, Maschinen-Bonus, Seelen-Bauplane | – | W4 + W5 |
| W10 | **Präzision-Multiplikator + Compound-Tag-Affordances** | ✅ **10a + 10b.1-3 live (V8.07)** — Präzision moduliert Stat-Pipe pro Quelle, Affordances als Welt-Schicht (moveable/magnifying/focusing) mit räumlicher Analyse + Tag-Sprache (kein Form-Whitelist). Drei Welt-Reaktionen: E-Mount, Z-Zoom, Sunny-Brennglas-Ignite | – | W9 |
| W10 ext. | **Weitere Affordances** — balancing/broadcasting/lifting/radiating als kleine Erweiterungen | 🔴 offen, ~1 Session pro Affordance | – | W10 Foundation |
| **W6.X** | **Polish-Sammel (Audit 17.05.2026)** — fünf Sub-Phasen: 6.X.1 Bug-Quartett (A1 Jump-Stand, A2 Ghost-rot-Block, A3 Armor-UI+Markier-Filter, A4 1st-Person-Aura-Hide), 6.X.2 UI-Politur (B1 Logbuch-Toggle, B2 Welt-Bauwerke entfernen, B4 Scrollrad-Hotbar), 6.X.3 Vision-Quick-Wins (C1 Spawn-Offset, C3 Soul-bound-Sprung), 6.X.4 Stats-HUD+Audio-Slider+Begleiter-Name (B3+D2+F1), 6.X.5 Performance-Caching (D1: isPlayerGrounded-Cache) | ✅ **live (V8.08-V8.12, 17.05.2026)** — alle fünf Sub-Phasen in einer Sitzung, +78 Invarianten (1791→1869) | – | – |
| W6.G3 | **Welt-Lebendigkeit** — Tag-Nacht-Zyklus, sanfte Wetter-Übergänge, Fauna-Lifecycle. | ✅ **V1 live (V8.24)** + ✅ **V2 Welt-LEBT-statt-animiert live (V8.25, 17.05.2026)** — V1: drei Schichten (timeOfDay/Slider/Status, requestWeatherTransition 45s, Fauna mit Trauer). V2-Heilung nach Schöpfer-Audit: drei Wurzel-Helper (_affinityPickFromCandidates, _tagToFrequency, _emotionModulate), acht Hardcode-Wunden geheilt (Soul-Wahl via Affinity-Pick; Lebewohl-Frequenz aus Tags; Spawn-Position-Affinity; FAUNA_TARGET emergiert aus lebendig; Birth/Death-Wahrscheinlichkeit emotion-moduliert; Sky-Tint × Welt-Feld-Tint × Emotion-Tint; Wetter-Dauer emotion-moduliert), Sonne+Mond als sichtbare Meshes folgen DirectionalLight, Sterne im Skybox-Shader nur nachts via neuem `starIntensity`-Uniform, Symphonie-Ambient atmet mit Tageszeit (Gain + Filter-Cutoff). Plus audit-strict 5. Schicht „Atmosphäre-Hardcode-Audit" (Pattern-Match auf `[ATMOSPHERE]`-markierte Methoden) + 28 Vision-Tests (Emergenz, nicht Mechanik). +28 Vision-Invarianten 1938→1966. | – | W6.X |
| W6.G4 | **Atmosphäre-Tiefe** (V8.27-V8.33) — Welt-unter-wandernder-Sonne (Hemisphere+Lambert+Fog), Welt-Atem-Vollendung (Sterne-als-Points, Terrain aus Affinität, Cel-Shading, Wind/Wolken/Wasser), Die lebendige Welt (Instanced-Gras, adaptives Wasser, Genesis-Plattform), Schnittstellen-Politur (Sterne-Tiefe, Avatar-Korrektur, Wasser-Wellen+Physik, Fog an Custom-Shader), Wasser-Vollendung (Tauchen, Schwimm-Animation, Gerstner). | ✅ **komplett (V8.27-V8.33)** — 1976→2061 Invarianten. **Polish-Punkte alle in V8.33 (6.G4.e) geschlossen**: (a) **Tauchen+Auftauchen** — reiner Helper `_swimVerticalVelocity`, Shift taucht ab / Space hebt (Minecraft-Konvention, kontextuell statt neue Keybinding-Taste — eine `sneak`-Taste ohne Land-Crouch wäre ein halbes Feature gewesen). (b) **Schwimm-Animation** — `animatePlayerSoul` reicht `playerUnderwater` durch, alle drei Seelen neigen sich + stroken/paddeln/wellen, `rotation.order = "YXZ"` für den lokalen Vorwärts-Lehnen. (c) **Gerstner-Wellen** — horizontale Vertex-Stauchung zu den Kämmen → spitze Kämme, Kreuzprodukt-Normalen. Wasser-Physik bleibt bewusst flach (Wellen visuell ±~1 m). | ✅ **komplett (V8.27-V8.33)** | – | W6.G3 |
| W11 V3 | **Soul-Sync (Multi-User echt körperlich)** — Peer-Avatar wird der echte Soul des Mitspielers (Mensch/Phönix/Drache/Custom), nicht Cone+Sphere. | ✅ **live (V8.34)** — neue WS-Nachricht `soul` (event-driven: Join + Soul-Wechsel) trägt soulName + bodyParts + Avatar-Namen; Empfänger baut den Avatar (Built-in via `def.build()`, Custom via `_buildFromBlueprint`), Cone+Sphere bleibt Platzhalter bis die Seele bekannt ist. Voll animiert: `_p2pUpdatePeer` leitet isMoving/underwater aus dem Positions-Stream ab → `def.animate` (Geh-/Schwimm-Zyklus, keine Extra-Bandbreite). **Aura-Sync** über die `aura`-Nachricht (~1 Hz, dominante Tag-Hue + Intensität); Peer-Aura ist immer sichtbar (der lokale 1st-Person-Hide gilt nur die eigene Kamera) — Audit-Punkt C2 geschlossen. **Name-Schild** über jedem Peer (Avatar-Name) — zwei Spieler mit derselber Seele bleiben unterscheidbar. `player_soul` bleibt in `NON_BROADCASTABLE_OPS` — Soul-Sync ist ein dedizierter Kanal, keine DSL-Mutation. +17 Invarianten 2061→2078, smoke-multiuser um soul/aura-Relay erweitert. | – | Ring 11.5 |
| W11 ext. | **Substanz-Rolle (Hylomorphismus auf Steroiden)** — emergente Rollen aus der ganzen Substanz: Soul aus Körper-Symmetrie, Werkzeug/Rüstung/Maschine/Konsumable aus der opChain-Domain, Nahrung aus lebendig+weicher Substanz, Bauwerk als Default. „Eine Sprache, beliebige Identitäten." | ✅ **live (V8.35)** — `computeBlueprintRole` ist eine Prioritäts-Kaskade: (1) opChain-Krafting-Domain, (2) intrinsische Form (`_isBodyShaped`: bilateral-symmetrischer Glieder-Körper + Vertikalitäts-Kriterium → soul), (3) intrinsisches Material (`_isFoodLike`: lebendig ≥ 0.6 + härte ≤ 0.5 → consumable), (4) architecture. Neue form-agnostische Helfer `_compoundSymmetry`/`_isBodyShaped`/`_isFoodLike` im `_isMoveable`-Stil. KEIN 11. Tag (Heilige Lektion — Nahrung emergiert aus den 10 bestehenden Tags). `consumableMeta` jetzt optional → emergente Nahrung ist essbar. Domain-Priorität zuerst (sonst hijackt jede symmetrische Form die Domain-Rolle — im Playtest gefangen). +15 Invarianten 2078→2093. | – | W6.X + W10 Foundation |
| W4 V2 | **Lofi-Musik-Schicht** — Pad-Layer (60 BPM, Minor-7th-Akkorde), Emotion-Modulation (hope→Major, sorrow→Tempo-Down). Web-Audio nativ, kein Asset. Antwort auf Audit-Punkt #3 (F2). | ✅ **live (V8.84)** | erledigt | Ring 4 V1 |
| W4 V3 | **Die generative Symphonie** — die feste Lofi-Schleife wächst zu einer seed- + emotion-getriebenen vierschichtigen Symphonie: Harmonie (Markov-Akkordfolge), Melodie (improvisierende Lead-Stimme), Groove (synthetische Trommeln + Swing), Orchester (Bass + Stimmen-Reichtum). Detail in §3 „W4 V3". | ✅ **komplett (V8.85-V8.93)** | erledigt | W4 V2 |
| W11 V4 | **Voice-Sync (Begleiter-Stimme im Multi-User)** — nach Soul-Sync (V3): andere Spieler hören deinen Companion-Output. Broadcast: `companion-say { peerId, text, voice }`. Empfänger spielt SpeechSynthesis mit gewählter Voice ab. Vision §1.4 Multisensorik durch alle Peers. Vorbedingung W11 V3. | ✅ **live (V8.67)** — `companion-say`-Broadcast aus `grokRender`, Empfänger-SpeechSynthesis gegated auf den eigenen Stimme-Toggle, wählbare Begleiter-Stimme | erledigt | W11 V3 |
| W7 | **Compute-Sharing (WebRTC-Mesh)** — P1 echte WebRTC-DataChannels, P2 Welt-Snapshot mesh-nativ (chunked), P3 LLM-Pool über Peers (eine geteilte Stimme), P4 Public-Lobby (Räume browsbar). Plus Multi-User-Bau-Sync + Kreatur-Sicht-Sync. „Distributed Chunk-Pre-Gen" entfiel bewusst (deterministisches Terrain rechnet jeder Client selbst — die echte Last war der Snapshot). | ✅ live (V8.62-V8.66) | erledigt | — |
| W12 | **Welt-Portal (Bibliothek von Alexandria, V8.23 umbenannt von WebGPU)** — Bauplan-Rolle „portal" + portalMeta (engine + manifest). Sub-Engine-Adapter in iframe/Worker mit Sandbox. DSL als Universal-Bridge zwischen Engines (jede Engine implementiert DSL-Subset). Welt-Manifest-Schema (engine + dsl_subset + signature). PoC mit `three-fluid-fx` (13 KB, klare DSL-Subset, visueller WOW). Detail in `docs/world-portal.md`. | ✅ **Phase 1+2+3 komplett (V8.51-V8.53)** — Phase 1: Portal-Skelett (emergente Rolle „portal", sandboxed iframe, Betreten/Pause/Rückkehr). Phase 2: zwei fremde Engines (three-fluid-fx + three.terrain.js), das generische DSL-Protokoll (Manifest pro Welt), die `WORLD_REGISTRY` + spieler-erreichbares Portal-Zielen, avatar-abgeleitete Tor-Größe. Phase 3: der Rückkanal (Sub-Welt → Heimat-Journal, geloggt nie ausgeführt — die Asymmetrie ist die Sicherheits-Wand) + die native Manifest-Stufe (jede Welt bringt ihr `manifest.json` mit; Drei-Stufen-Klarheit ausgestellt/übersetzt/nativ). Schöpfer-Browser-Test bestätigt P1+P2. Der KI-Übersetzer (fremdes Repo automatisch andocken) bleibt W14. | ✅ komplett | W11 ext. + audit:strict |
| W13 | **Vibe-Pass (Self-Sovereign Identity)** — Crypto-Keypair (ed25519, lokal generiert). Schöpfer signiert eigene Baupläne/Welten. Avatar-Identifier = Public-Key. Kein Coin/NFT-Hype, nur Authentizität. Vorbedingung für Welt-Portale die Authentizität brauchen. | ✅ **komplett (V8.54-V8.56)** — Phase 1: Schlüssel-Grundlage (ed25519-Keypair, WebCrypto nativ; Sign/Verify-Primitive; globale localStorage-Persistenz `anazh.vibePass`, nie im Welt-Save). Phase 2: Bauplan-Signaturen — `signBlueprint`/`verifyBlueprintSignature` signieren die Substanz (nicht den Namen), vier Status-Stufen, Werkstatt-Anzeige, Signatur reist durch Save/Welt-Tor/Fusion. Phase 3: Vibe-Pass-Identität im Multi-User — der `vibe`-WS-Typ trägt vibePassId + einen peerId-gebundenen Beweis, der Mitspieler ist beweisbar sein Schlüssel, verifiziertes Name-Schild. | ✅ komplett | W12 ✅ |
| W14 | **Bibliothek (Welt-Registry)** — die letzte große Vision-Schicht. Browsbarer Bibliothek-Tab + „Portal holen" (P1 ✅ V8.58); der Spieler signiert eine Welt mit dem Vibe-Pass, „signiert von <Autor>" + W13 V2 (P2 ✅ V8.60); fremde Welt-Manifeste exportieren/importieren, die Bibliothek wird ein wachsender Index (P3 ✅ V8.61). Der KI-Übersetzer ist mit V8.68/V8.69 vollständig; V8.70 (Untrusted-Welt-Tor) lässt eine echte, ungeprüfte fremde Engine null-origin sandgesichert laufen. | ✅ **komplett (V8.58/V8.60/V8.61)** | — | W13 ✅ |
| W13 V2 | **Vibe-Pass trägt das Schaffen (§4)** — der Pass speichert nicht nur den Schlüssel, sondern die Avatar-Anpassungen: Custom-Seele, eigene Materialien, eigene Werkzeuge reisen mit, wenn der Spieler durch ein Portal in eine fremde Welt geht (`world-portal.md` §4). | ✅ live (V8.60, W14 P2 Teil B) | — | W13 ✅ |
| W11 V4 | **Voice-Sync (Begleiter-Stimme im Multi-User)** — Mitspieler hören deinen Companion-Output (`companion-say`-Broadcast → SpeechSynthesis). Schließt den Präsenz-Bogen sehen/spüren/kennen/**hören**. | ✅ **live (V8.67)** | erledigt | W11 V3 ✅ |

**Summe verbleibend**: die grossen Roadmap-Ringe sind gebaut. **Stand nach V8.93**: Atmosphäre ✅ → Multi-User-Tiefe ✅ → Hylomorphismus-Vollausbau ✅ (V8.35) → Welt-Portal-Protokoll ✅ (W12) → souveräne Identität ✅ (W13) → Bibliothek ✅ (W14 Phase 1-3) → Compute-Sharing ✅ (W7 Phase 1-4) → Voice-Sync ✅ (W11 V4) → KI-Übersetzer ✅ (V8.68/V8.69) → Untrusted-Welt-Tor ✅ (V8.70) → Auto-Vendor-Pfad ✅ (W15 — V8.71/V8.72) → Mesh-Welt-Verteilung ✅ (W16 — V8.73/V8.74) → **Multiplayer-Sub-Welten ✅ vollständig (W17 — Phase A V8.75, B-Relay V8.76, C V8.77, Multiplayer-Welt-Deklaration V8.78, B-JS-Compute Phase 1 V8.79, Phase 2 Host-Migration V8.80)** inkl. der `serverMode`-Vendor-Ketten-Naht ✅ (V8.82) → **die generative Symphonie ✅ vollständig (W4 V3 — Harmonie V8.85, Melodie V8.87/90, Groove V8.91/92, Orchester V8.93)**. **Offen im Fremd-Engine-Bogen**: nur B-WASM (ein Rust→WASM-Server in einem Peer-Tab — bewusst per-Projekt, nicht automatisch).

**Hinweis**: WebGPU+TSL ist nicht mehr eine eigene Welle — es ist eine **optionale Renderpipeline für eine andere Welt-Engine** im Welt-Portal-Konzept. Wenn jemand eine WebGPU-Welt veröffentlicht, läuft sie als Sub-Engine im iframe. Kein Pflicht-Migrationspfad für den AnazhRealm-Kern.

---

## 3. Detail pro Ring

### Ring 2: DSL als Brücke (Restarbeit Phase 3-7)

**Ziel**: Mensch und Nexus teilen vollständig eine Sprache. Alle Chat-Befehle gehen durch dieselben DSL-Primitives, die der Generator nutzt. `new Function`/`eval` komplett raus, strict CSP wird möglich.

**Phase 3 — Chat-Parser → DSL** (1-2 d)

**Phase 3a ✅ erledigt** (dieser Commit): `parseChatToDsl(text)` und `chatSuggest(text)` (Levenshtein, Distanz ≤ 4) live. Acht welt-betreffende Chat-Befehle laufen jetzt durch denselben Interpreter wie der Nexus:

| Chat | DSL |
|---|---|
| `setze wetter sunny/rainy` | `["weather", $1]` |
| `spawne kreaturen <n>` | `["repeat", n, ["spawn_creature", ["at_player"], 1, "happy"]]` |
| `ändere sternenhimmel <color>` | `["skybox_color", color]` |
| `setze terrain steilheit <v>` | `["terrain_steepness", v]` |
| `setze terrain basishöhe <v>` | `["terrain_base_height", v]` |
| `erhöhe sprungkraft um <n>` | `["player_jump_power", current+n]` |
| `heile welt` | `["chain", ["weather","sunny"], ["creatures_emotion","happy"], ["gravity",-14.715]]` |
| `vereine chaos ordnung` | `["chain", ["terrain_steepness",1.0], ["creatures_color","white"]]` |

Sechs neue Playtest-Invarianten verifizieren Parser, End-to-end-Routing und Levenshtein-Vorschlag. `state.dsl.lastUserProgram` + `state.dsl.lastUserOutcome` halten den letzten Menschen-Befehl für Diagnose/Persistenz fest.

**Phase 3b ✅ erledigt** (dieser Commit): Zwei neue DSL-Primitives `set_visible(target, visible)` (Whitelist „terrain"/„creatures", unbekannte Targets werden geloggt) und `record_narrative(text)` (Cap 500 Zeichen, schreibt in `state.knowledgeBase`). Fünf neue Chat-Patterns: `boden/kreaturen × aktivieren/deaktivieren` + `erzähle <text>`. Vier neue Playtest-Invarianten. Damit gehen 13 von ~25 Chat-Befehlen durch die DSL.

**Verbleibend nicht-migriert** (Phase 4/5 oder Ring 4):
- `lerne/entwickle fähigkeit`, `füge code` → Phase 5 mit `new Function`-Cleanup + Save-Migration
- `aktiviere anazh-symphonie` → Ring 4 (Web Audio)
- System-IO (`speichere/lade/lade datei`), `aktiviere version`, `füge trainingsdaten`, `behebe physik-tunneling`, `optimiere physik`, `boden nicht sichtbar`, `aktiviere/deaktiviere debug-logs`, `spawne neue welt` bleiben bewusst legacy (System-Ops, kein Welt-Effekt)

**Phase 4 ✅ erledigt** (dieser Commit-Block): `buildStateSnapshot` persistiert `dslAbilities` als Quelle der Wahrheit, die Legacy-`abilities`-Namensliste fliegt raus. `loadState` rehydriert das Array UND legt die zugehörigen `state.abilities[name]`-Wrapper an, damit „Führe Fähigkeit aus" und Keyboard-Loop nach Reload weiter funktionieren. Alte Saves (mit `abilities: string[]`) gehen weiter durch `restoreAbility` → Legacy-Namen-Mapping. `worldMeta.schemaVersion === "7.66-dsl-v1"` bleibt das Vertrags-Feld.

**Phase 5 ✅ erledigt** (dieser Commit-Block): `createDynamicAbility`, `codeParser`, `developAdvancedPhysics`, `developAdvancedRenderer` gelöscht. Chat-Befehle `füge code` und `entwickle fähigkeit` raus. `learnAbility` produziert DSL-Programme via `parseAbilityDescriptionToDsl` (5 Pattern + Catch-All als `say`). `addNewAbility` akzeptiert ausschließlich DSL-Arrays. `aktiviere anazh-symphonie` wird als statisches DSL-Programm gespeichert (V1-Stub, echte Web-Audio mit Ring 4). `processOptimization` ruft direkt `optimizePhysics()`, der Legacy-`evolution.impl`-Pfad in der Loop fliegt raus. CI-Gate „kein `new Function`/`eval` im Bundle" hart aktiviert (fail), Playtest verifiziert dass die toten Methoden weg sind.

**Phase 6 ✅ erledigt** (dieser Commit): `<meta http-equiv="Content-Security-Policy">` in `index.html` aktiviert. `default-src 'self'`, `object-src 'none'`, `base-uri 'self'` strict. Drei dokumentierte Konzessionen:
- `script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval'` — Ammo (WASM) braucht das erste, TF.js (WebGL-Kernel-Compilation) das zweite. Unser eigener Code nutzt **kein** eval; CI-Gate „Verbotenes dynamisches Auswerten" sichert das hart.
- `style-src 'self' 'unsafe-inline'` — Three.js setzt Inline-Styles aufs `<canvas>` für Größe/Position. Risiko gering, kein User-CSS injizierbar.
- `worker-src 'self' blob:` — TF.js erstellt einen Backend-Worker aus blob-URL.

Plus: inline-styles aus `index.html` entfernt (`#fps`, `#state-file-input`), Inline-Bootstrap-`<script>` durch `<script src="anazhRealm.js" defer>` ersetzt. Sechs neue Playtest-Invarianten verifizieren CSP-Meta + dass über die Laufzeit keine CSP-Violations im Console-Buffer landen.

**Phase 7 ✅ erledigt** (dieser Commit): `dslSelectByFitness` (Roulette-Wheel über `state.dsl.history`; Gewicht `max(0.05, 1 − fpsDamage/100)`, Floor verhindert Aussterben), `dslMutate` (Sub-AST-Replacement, ±20 % Numeric-Shift, Chain-Wurzel-Schutz), `dslCompose({ historyProbability })` defaults auf 0.3 mit History ≥ 3 — der Nexus startet random, lernt aber zunehmend aus eigenen Outcomes. Fünf neue Playtest-Invarianten: high-fitness wird ≥ 2× häufiger gewählt (gemessen 11.2×), Selektion null-frei, Mutation behält `chain`-Root + Array-Sub-Strukturen, Compose nutzt History bei `historyProbability=1` zu 30/30.

**Akzeptanz Ring 2 vollständig** ✅ — alle Phasen 1-7 abgeschlossen.

---

### Ring 3: Player-Emotionen → Welt

**Ziel**: Spieler-Emotionen sind ein zentraler Welt-Treiber, nicht nur ein UI-Detail.

**V1 ✅ erledigt** (dieser Commit):
- `state.player.emotions = { joy, awe, sorrow, hope, peace, chaos }` (6 Achsen, 0..1)
- `collectPlayerEmotions(text)` regelbasiert: deutsche Stichwörter (z. B. „schön/fröhlich/liebe" → joy, „traurig/dunkel/trauer" → sorrow, „chaos/wild/sturm" → chaos). Jeder Treffer +0.1, geclampt.
- Eingehängt in `processChatCommand` → jeder Chat-Befehl füttert die Achsen.
- `updatePlayerEmotions(currentTime)` läuft im Hauptloop: Decay 0.005/s, drei Schwellen-Trigger als DSL-Programme (joy > 0.7 → `["skybox_color", "#f7d358"]`, sorrow > 0.7 → `["weather", "rainy"]`, chaos > 0.7 → `["creatures_speed_mul", 1.5]`). 30 s Cooldown pro Achse verhindert Spam.
- Neue DSL-Condition `emotion_above(name, threshold)` — der Nexus kann selbst auf Emotionen reagieren.
- Save persistiert `playerEmotions`. Sieben neue Playtest-Invarianten (Collect, Decay, Trigger, Cooldown, DSL-Cond, Save).

**V2 ✅ erledigt** (dieser Commit): drei stille Achsen (awe, hope, peace) bekommen Welt-Kopplungen — awe→`["skybox_color", "#d4a3ff"]` (magisches Lila), hope→`["chain", ["weather", "sunny"], ["creatures_emotion", "happy"]]` (Licht), peace→`["creatures_speed_mul", 0.7]` (Beruhigung). Generator-Bias in `dslComposeAtomic`: joy verschiebt sunny-/happy-Wahrscheinlichkeit nach oben, sorrow nach unten (±0.3 sanft, Clamp 0.05..0.95). Fünf neue Playtest-Invarianten verifizieren die drei neuen Trigger und die Generator-Bias-Richtung statistisch (1000 Samples, Ratio > 2× gemessen). **Bug nebenbei gefunden und gefixt**: `skybox_color`-DSL-Op schrieb in `tintColor`, das Skybox-Uniform heißt aber `nebulaColor` — war seit Phase 1 stiller No-Op.

**V3 offen** (später, wenn nötig):
- Mehr Achsen (`longing`, `melancholy`) wenn Vokabular es einfordert.
- Grok-Stimme: neuer Trigger „emotionShift" wenn eine Achse abrupt steigt.

**Akzeptanz** ✅: 5 Min chatten mit emotionalem Vokabular → die Welt antwortet sichtbar (Skybox, Wetter, Kreatur-Geschwindigkeit).

---

### Ring 4: anazhSymphony

**Ziel**: Multisensorik. Welt hat Klang, der mit ihrem Zustand atmet.

**V1 ✅ erledigt** (dieser Commit):
- `state.symphony = { ctx, enabled, masterGain, ambient, weather, lastWeather, creaturePingCount }` lazy initialisiert.
- Drei Klangschichten gebaut:
  - **Ambient**: zwei verstimmte Sägezahn-Oszillatoren (110 / 111.5 Hz) → langsame Schwebung. Tiefpass-Filter mit LFO (0.08 Hz) auf Cutoff. Atmet konstant.
  - **Wetter**: White-Noise-Loop → Bandpass 1500 Hz → Gain. Bei `weather === "rainy"` Cross-Fade auf 0.18, sunny → 0. `symphonyTick()` ist idempotent (nur Wechsel triggern Rampe).
  - **Kreatur-Pings**: `playCreaturePing(emotion)` mit kurzem Sinus + ADSR-Envelope. Happy = 659 Hz (E5), sad = 220 Hz (A3). Aufgerufen aus `spawnCreatureAt` (DSL-Spawns), initialer Spawn-Loop ausgenommen.
- Toggle-Button `#anazh-symphony-toggle` (analog Grok-Stimme): erster Klick startet AudioContext, weitere Klicks muten via `masterGain`.
- `disposeSymphony()` räumt komplett auf (osc.stop, ctx.close, alle Referenzen null). Acht neue Playtest-Invarianten.
- Headless-Tests funktionieren mit `--autoplay-policy=no-user-gesture-required` als Puppeteer-Arg.

**V2 offen** (später, klein, additiv):
- Emotion-Modulation der Klangschichten: hohe joy → Filter-Cutoff höher (heller), hohe sorrow → tiefer (dunkler). Höhe peace → Master-Gain leiser, chaos → LFO schneller.
- Player-Y-Position moduliert Ambient-Pitch (höher oben → höher in Frequenz).
- Reverb-Send für Echo-Effekte (Halle bei großer Höhe).

**Akzeptanz** ✅: Spieler hört die Welt — alles synthetisiert, kein Asset geladen, keine externe Library.

---

### Bedien-Oberfläche / UI (V1+V2 live, V3 offen)

**Ziel**: Sichtbare Welt-Steuerung — was im Code passiert, soll auch ohne DevTools fühlbar sein.

**V1 ✅ erledigt** (4 Commits): Status-Panel mit Welt-Daten + Emotion-Balken, Quick-Action-Buttons, Hilfe-Drawer mit allen Chat-Befehlen klickbar, Abilities-Liste mit Run-Button + Source-Tag, Save/Load-Aktionen, Live-Tuning-Slider für emotionThreshold/Decay/Cooldown. DOM-Cache + 0.4 s Throttle.

**V2 ✅ erledigt** (3 Commits — Mockup-Adaption):
- **Painterly Identity** (`36d2364`): vendored Cinzel + IM Fell English + JetBrains Mono (~190 KB Latin-Subset, CSP-strict), Color-Tokens als CSS-Custom-Properties (`--parch-*` / `--iron-*` / `--brass-*` / `--violet-*` + Emotion-Farben), Tag/Nacht-Theme via `body[data-theme]` mit localStorage-Persistenz, Pergament-Hintergrund (SVG-Noise) + Eisen-Rahmen mit Eckschrauben.
- **Topbar + Tab-Drawer-System** (`2eb6771`): aus dem langen Status-Panel werden sechs Drawer pro Tab plus eine Topbar mit Titel + Tabs + Latch-Toggles plus eine Status-Bar mit Live-Welt-Daten. `state.uiActiveDrawer` trackt den aktiven Tab.
- **Konsole + Brass-Scrollbars** (`4f638cb`): Chat + Logbuch + Input werden ein einklappbares `#console`-Panel links. Custom-Brass-Scrollbars für alle scrollbaren Container (Webkit + Firefox).

**V3 offen** (~2-3 h, optional/Polish):
- **Astrolabium** als rotierendes SVG-Live-Element in der Topbar (rotierende Ringe als „Anazh-Stein"). Live-Daten: Spieler-Position, Wetter, Anomalien.
- **Custom-Slider mit Rail/Knob** statt nativem `<input type="range">` — passt zum Painterly-Aesthetic. Drei Slider in Einstellungen-Drawer + zwei potenzielle für Terrain (Welt-Drawer).
- **Toggle-Cards für Wetter** mit Icon (Sonne/Regen) statt Buttons.
- **Logbuch separat darstellen** mit Zeitstempeln aus `state.logBuffer` (statt rohem Log-String).
- **Welt-Modifikatoren in Welt-Drawer**: Slider für Terrain-Steilheit / Basishöhe (mit Klippen-Warnung, weil Welt-Regen nur bei nächstem Worldgen greift).

**Akzeptanz V1+V2** ✅: Welt-Status, Emotionen, Fähigkeiten und alle Befehle ohne DevTools sichtbar und manipulierbar. Painterly-Theme spiegelt die Vision (Pergament + Eisen + Portal-Violett).

---

### Ring 5: createPlayerSoul (~1-2 d)

**Ziel**: Spieler ist nicht mehr der rote Würfel. Er wählt seine Form.

- Spielstart-Menü (`<dialog>`-Element): „Wer bist du?" mit 4 Optionen + „Frei" (random)
  - **Mensch**: speed 6, jump 12, size 1, color skin
  - **Phönix**: speed 8, jump 18, size 0.8, color orange + leichtes Glühen
  - **Drache**: speed 5, jump 14, size 1.3, color dunkelgrün
  - **Riese**: speed 4, jump 10, size 2.0, color grau
- `state.playerSoul` persistiert in localStorage und im Save
- Mesh wird entsprechend gestaucht/gefärbt (kein neues Modell — Box-Geometry mit Skalierung + Farbe reicht für V1)
- Spätere Erweiterung: Soul-spezifische DSL-Ops (z. B. `phoenix_dash`, `dragon_breathe`)

**Akzeptanz**: nach Auswahl spielt sich die Welt fühlbar anders — Phönix springt höher, Riese ist schwerer.

---

### Ring 6: architectureTemplates V1 (~2 d)

**Ziel**: Aus „Spawne Häuser" wird wirkliche Architektur.

- Drei DSL-Primitive (zusätzlich zum bestehenden Pool):
  - `spawn_village(position, size)`: 3-8 Boxen unterschiedlicher Größe in lockerer Anordnung, Holz-/Stein-Farbtöne
  - `spawn_temple(position)`: zentrale Säule + 4 umgebende Säulen + Plattform
  - `spawn_waterfall(position, height)`: vertikale Linie von THREE.PointsMaterial-Partikeln, fließt nach unten
- Alle prozedural, kein Asset. Geometrie aus simplen Three.js-Meshes.
- Generator-Pool um diese drei erweitern (geringe Gewichte, ~2-3 % je)
- Chat: „bau ein dorf bei mir" → `["spawn_village", ["near_player", 20], 5]`

**Akzeptanz**: nach 5 Min Nexus-Evolution stehen 1-2 Dörfer oder Tempel in der Welt; via Chat kann der Spieler gezielt eines bauen.

---

### Ring 7: brain.js-Welt (~3-4 d)

**Ziel**: Welt lernt selbst aus dem Spieler.

- `brain.js` aus `vendor/` einbinden (kleines Neural-Net-Modul, ~20 KB)
- `state.worldNeural`: 2-Schicht Net, Input = Spieler-Position-Trajectory (letzte N Punkte) + aktuelle Emotionen, Output = Empfehlung (DSL-Op + Argumente)
- Training: jeden Frame `state.dsl.history` als Trainings-Set nutzen — Programme mit hoher Fitness werden positiver beispielhaft
- Vorhersage: alle 30 s wird der Output abgefragt und als zusätzlicher Nexus-Vorschlag in die Evolution-Queue gelegt
- Test: nach 10 Min Spiel sind die generierten DSL-Programme erkennbar an die Spieler-Vorlieben angepasst (z. B. wenn der Spieler oft springt, kommen mehr Sprungkraft-Buffs)

**Akzeptanz**: messbar — die durchschnittliche Fitness der Generator-Outputs in den letzten 50 Programmen ist >0.7, gegenüber initial ~0.5.

---

### Welle 6: Crafting-Polish + UX + Stats (sechs Blöcke A–F, bewusst nachgelagert)

**Status**: 🟡 in Arbeit — **Phase 1-6 (V7.72) erledigt**: 6.A komplett (Wall-Sliding, Erdung, Slope-Anti-Klebe, Raycast-Place, Stabilitäts-Visual), 6.E1+E2 (Fähigkeit-Beschreibung + Intro), 6.F1+F2 (Verbindungs-Linien + Brech-Warning), **6.D Stat-System komplett** (Etappen 1+1.5+1.6+1.7+2+3a+3b: STAT_FROM_TAGS-Matrix, Seele-als-Bauplan-aus-Körperteilen, define_soul DSL, visueller Avatar-Editor, Boosts aus 3 Quellen, Phönix-Wandlung + persistente Tod-Wunde, Min-Regel-Hybrid decay 0.7, Werkzeug-Kosten, Rüstung-Stacking, Aura-Glow). **1014 Playtest-Invarianten grün**.

**Gesamt-Schätzung**: ~18-22 Sessions, verteilt auf 3-4 Monate Echtzeit, in sechs Blöcken **6.A bis 6.F** organisiert.

**Detaillierte Design-Notizen + Brainstorm** in [`docs/archiv/wave-6-design.md`](./archiv/wave-6-design.md). Roadmap-Eintrag hier ist die Milestone-Übersicht; die Begründungs- und Konzept-Tiefe lebt im Design-Doc.

#### Sechs Blöcke

| Block | Themen | Aufwand | Vorbedingung |
|---|---|---|---|
| **6.A — Interaktion-Polish** | Wall-Sliding (no-stick) ✅, Erdung auf Strukturen ✅, **Slope-Anti-Klebe ✅** (6.A3 neu), Bau-Phantom mit Raycast-Place ✅, Stabilitäts-Visual ✅ (6.A5), Maus-Aktionen LMB/RMB (6.A3 alt — wartet) | 3-4 Sessions, **5/6 erledigt** | – |
| **6.B — CAD-Werkstatt** ✅ vollständig (V7.99-V8.07) | 3D-Preview + Orbit/Pan/Zoom-zum-Cursor, voller Tinkercad-Manipulator (Move/Rotate/Scale/Connect/Snap), HTML5-Drag-Sources (Formen+Material+Werkzeug+Farbe), Klick-Klick-Connection-Erzeugung, Stats-Panel mit Stern-Rating für emergente Tags, Resize-Handles + Default-Werkstatt-Größe. Drei Phasen + sieben UX-Iterationen aus Schöpfer-Browser-Tests. | abgeschlossen | 6.F1 (Linien-Renderer) |
| **6.C — Inventar + Modi + Keys** | Erweitertes Inventar mit Tag-Profilen, **frieden/pfad/schöpfer**-Modi, Keybindings-UI | 4 Sessions | 6.D (Stats für pfad-Modus) |
| **6.D — Stats fraktal** ⭐ | Soul × Soul-Material → Tags → Stats; Boosts (Konsum + Emotion + Welt-Effekt); Min-Regel-Hybrid (decay 0.7); Tod = Phönix-Wandlung + Welt-Trauer | 3-4 Sessions | W5 + 6.F2 |
| **6.E — Lesbarkeit** | Fähigkeit-Beschreibung ✅ (6.E1), Intro-Overlay ✅ (6.E2), subtile Tooltips (6.E3 — wartet) | 2 Sessions, **2/3 erledigt** | – |
| **6.F — Original-Crafting (alt 6.1-6.7)** | Visuelle Verbindungs-Linien, Brech-Mechanik, Energiequellen, Kreaturen-Körper als Baukasten, Physik-Constraints (Ammo Hinge/Fixed), Rüstung → in 6.D integriert | 8-10 Sessions | W5 |
| **6.G — Welt-Sinne** (NEU, 13.05.2026) | **Phase 1 ✅ V7.73** + **Phase 1.5 ✅ V7.74** + **Phase 2 ✅ V7.75** (Welt-Affinitäts-Feld — 4 SimplexNoise-Schichten als Tag-Sprache, populateChunkVegetation füllt Chunks via Affinity-Resonanz, drei neue Baupläne stein_block/kristall_geode/glutbrunnen, organische Region-Emergenz ohne Biome-Tabelle, Schöpfer-Vision „wie kommt Welt-Leben rein" beantwortet). Phase 3 grösstenteils ✅ von W6.G4 (V8.27-V8.33: Schatten, Shader, Sterne-Stabilisierung + Variation, Wasser als Material+Layer). Phase 3 W6.G-P3-Rest **Phase 1 ✅ V9.03** (Felsformationen — `felsbogen` + `felsturm`). Echte Höhlen/Tunnel/Überhänge → der **Voxel-Terrain-Bogen** (ab V9.07, §3) — das Heightfield wird ein 3D-Dichte-Feld | 7-9 Sessions, **Phase 1+1.5+2 + W6.G4 + P3-Felsformationen erledigt**, der Rest läuft im Voxel-Bogen | – (Phase 1+2) / 6.D (Phase 3) |
| **6.H — Kreaturen-Aufträge** (NEU, 13.05.2026) | Autonome Co-Schöpfer. **Phase 1 ✅ V7.79** (wander/follow_player/wait + Aura + Audio + Journal). **Phase 2A ✅ V7.80** (Hylomorphismus — Kreaturen sind Compounds aus bodyParts×Material wie Spieler+Architektur). **Phase 2B.1 ✅ V7.81** (gather + memory). **Phase 2B.5 ✅ V7.82** (harvestArchitecture als Wurzel-Funktion + Material-Inventar + carrying-Bring-Phase). **Phase 2C ✅ V7.83** (computeBuildCost als wertneutrale Spiegelung, modus-symmetrisch). **Phase 2B.2 ✅ V7.84** (Kreatur baut für Spieler — Geste-Umkehrung zu gather: take→walk→spawn). **Phase 2D ✅ V7.85** (Spezialisierung aus Memory: gather:material und build:blueprint je 3 Erfolge ein Level, max 5; Speed-Bonus +15 %/Level; Audio + Journal bei Level-Up; UI-Pills Sammler/Bauer in Liste; KEINE Persistenz — Vision §1.1 konsequent). **Phase 2E 🔴 offen** (Konversationen — „Nira, was hast du gesehen?" via LLM-Provider mit pro-Kreatur memory + Specs als System-Prompt-Erweiterung; Specs sind jetzt Identitäts-Anker). 4-5 Sessions Original-Schätzung; aktuell 7 Sessions investiert (V7.79-V7.85) — bewusst tiefer als Plan, weil Hylomorphismus-Wurzel sich beim Bauen offenbarte | original 4-5 Sessions, jetzt 7/8 erledigt | 6.F4 (Multi-Mesh-Kreaturen, in 6.H P2A integriert) + 6.A4 (Raycast, in 6.A6 erledigt) |

**Vision-Hebel der Welle**: Block 6.D macht den Spieler zum **Compound im selben Hylomorphismus-System** wie Materialien und Bauwerke. `STAT_FROM_TAGS`-Matrix analog `FORM_TAG_ACTIVATION`. Wenn das Stat-System ohne Bezug zu `MATERIAL_TAG_KEYS` funktioniert, wurde die Vision verfehlt — explizite Warnung im Design-Doc §9.

**Beschlossene Reihenfolge** (Schöpfer hat 13.05.2026 freie Hand gegeben, Entscheidungen in `docs/archiv/wave-6-design.md` §10.6):
1. 6.A1+A2 (Sliding + Erdung) ✅ V7.72
2. 6.A3 (Slope-Anti-Klebe, ad-hoc) ✅ V7.72
3. 6.A4+A5 (Raycast-Place + Stabilitäts-Visual) ✅ V7.72
4. 6.E1+E2 (Ability-Beschreibung + Intro-Overlay) ✅ V7.72
5. 6.F1+F2 (Verbindungs-Linien + Brech-Warning) ✅ V7.72
6. **6.D Stat-System komplett** (Etappen 1+1.5+1.6+1.7+2+3a+3b) ✅ V7.72 — der Vision-Pfeiler ist live
7. **Schöpfer-Reflexions-Polish** ✅ V7.72 — sechs Reflexions-Runden in Welle 6.D fanden + behoben: Avatar-Editor-UI (Etappe 1.7), Konsumables aus Compound-Tags (Logik statt Tabelle), Werkzeug-Stamina-Kosten (Anti-Stapeln), persistente Tod-Wunde, Aura-Glow (Sprite + Radial-Gradient), WASD-Geometrie + Drache-Animation-Wahrnehmung, **Sprint-Bug-Fix** (player_speed sync't sprintSpeed), **Tag-Clamp [0,1]** in computePlayerStats für die Stat-Pipe, Speed-Base 6→7
8. ✅ **6.G Welt-Sinne Phase 1** V7.73 — fliegende Inseln + Bäume kollidierbar (btBvhTriangleMeshShape für Inseln aus echten Vertices, btCylinderShape am Baumstamm), drei tote DSL-Ops aktiviert, toter needsPhysics-Pfad gelöscht, 24 neue Invarianten → 1038 total
8.6. ✅ **6.G Welt-Sinne Phase 2** V7.75 — **Schöpfer-Vision-Antwort auf „organische Verteilung"**: Welt-Affinitäts-Feld. Vier SimplexNoise-Schichten (lebendig/dichte/glut/magieleitung) bilden ein Tag-Feld; jeder Bauplan resoniert über Dot-Product seiner Compound-Tags mit dem Welt-Feld. `worldFieldAt(x,z)` + `spawnAffinityForBlueprint(name,x,z)` + `populateChunkVegetation(cx,cz)` — drei neue Methoden auf AnazhRealm (Heilige Lektion: kein Modul). Drei neue Built-in-Baupläne (stein_block/kristall_geode/glutbrunnen) decken die vier Welt-Achsen. Hook in `ensureChunkAt` für neue Chunks + Initial-Worldgen für 64 Chunks. Idempotent via state.populatedChunks. Silent-Opt verhindert Welt-Effekt-Flut. Bug-Fixes: Stamm 0.5→0.8, Culling 1→2Hz. 18 neue Invarianten → 1066 total.
8.5. ✅ **6.G Welt-Sinne Phase 1.5** V7.74 — **Schöpfer-Vision-Korrektur**: Hylomorphismus-Unification. Bäume sind jetzt Compound-Architekturen über baum_eiche/baum_kiefer-Baupläne (Stamm:holz + Krone:laub/laub-cone), laub als 12. Built-in-Material, spawn_tree DSL-Op routet durch spawnArchitecture, Worldgen-Bäume in state.architectures, eigene spawnTreeAt + _buildTreeCollision gelöscht (Parallelcode weg), Insel-Visual-Fix (Vollkörper + Lambert), Topbar-Version-Sync, 32 6.G P1.5-Invarianten total → 1048 total
9. ✅ **6.C2 Spielmodi** V7.76 — drei Welt-Beziehungs-Modi (frieden/pfad/schöpfer). worldMeta.gameMode-Persistenz, setGameMode/getGameMode-Methoden, set_mode DSL-Op in NON_BROADCASTABLE_OPS (Multi-User-privat), Chat-Patterns mit dt./engl. Aliasen, UI-Radio in Einstellungen-Drawer + #status-mode Status-Bar. damagePlayer-Gate (frieden+schöpfer blockieren) + applyOpToPart-Stamina-Gate (nur pfad kostet 10). 26 neue Invarianten → 1092 total.
10. ✅ **6.C1 Hylomorphismus-Inventar + Drag&Drop** V7.77+ — 27-Slot-Overlay mit Tab-Toggle, Tag-Resonanz emergiert aus Compound-Tags (resoniert summt + brennend glüht + magieleitung schimmert + lebendig sprießt + dichte schattet), Audio-Hover-Ping mit Tag-spezifischen Frequenzen. **Drag&Drop nach vier Schöpfer-Iterationen**: alle vier Pfade konsistente Move-Semantik (inv↔inv Swap, inv→hot Slot-Move, hot↔hot Swap, hot→inv Move/Stack mit Daten-Schutz). HTML5-Drag mit Pointer-Lock-Management (exitPointerLock beim Open, kein Re-Lock beim Close), Tab-Listener auf Capture-Phase, WASD bleibt aktiv (Minecraft-Konvention), state.drag mit Top-of-method Cleanup. Click-State-Workflow parallel als Touch/Keyboard-Fallback. add_to_inventory DSL-Op in NON_BROADCASTABLE_OPS, state.player.inventory persistiert. 34 + 16 (Drag) + 5 (Lock) + 4 (Iteration-3) + 4 (Iteration-4) Invarianten = **127 total für 6.C1** → 1153 invariants overall.
11. **6.A-Maus + 6.C3** ← jetzt offen (LMB/RMB-Aktionen für Welt-Interaktion + Keybindings-UI)
    - 6.A3 Maus-Aktionen: LMB = abbauen (Architektur in Raycast-Reichweite via apply_op-Pfad), RMB = platzieren (heutiges F-Verhalten als Maus-Geste). F bleibt als Tastatur-Alternative.
    - 6.C3 Keybindings-UI: Sektion in Einstellungen-Drawer, Liste aller Game-Actions, Klick→Rebind→localStorage-Persistenz, Konflikt-Erkennung.
10. 6.C1 + 6.A-Maus + 6.C3 (Inventar + LMB/RMB + Keybindings-UI)
11. 6.B (CAD-Werkstatt — minimal magic)
12. 6.G Phase 2 (Schatten, Wasser, Höhlen, Sterne)
13. 6.F3 + 6.F4 + 6.F5 (Energie + Kreaturen-Körper + Constraints)
5. **6.D** Stats komplett (Vision-Pfeiler) ⭐
6. 6.G Phase 1 (Inseln + Bäume kollidierbar)
7. 6.C2 (Modi frieden/pfad/schöpfer)
8. 6.C1 + 6.A3 + 6.C3 (Inventar + Maus + Keybinds)
9. 6.B (CAD minimal)
10. 6.G Phase 2 (Schatten + Wasser + Höhlen + Sterne)
11. 6.F3 + 6.F4 + 6.F5 (Energie + Kreaturen-Körper + Constraints)
12. **6.H** (Kreaturen-Aufträge — autonome Co-Schöpfer)

**Beschlossene Antworten zu §10**:
- **Modi-Namen**: `frieden` / `pfad` / `schöpfer` statt friedlich/survival/kreativ — antik-modern verschmolzen
- **Stats-Sichtbarkeit**: Auren default, Zahlen bei Hover/Inspect (Inspect-Panel)
- **Tod im pfad-Modus**: Phönix-Wandlung (5 min) + Welt-Trauer (sorrow +0.3, awe +0.2) + Journal-Eintrag; im frieden/schöpfer kein Tod
- **CAD-Komplexität**: Min Viable Magic — 3D-Preview + Drag + Grid-Snap. KEIN Boolean/MultiSelect/Symmetrie. Wer mehr will, geht zum Code-Editor
- **Min-Regel-Hybrid**: für Werkzeug-Präzision `min + (max-min) × 0.7^N`-Decay (poliert kann teilweise heben), für Verbindungs-Last + Compound-Tags bleibt min/max streng
- **6.G Welt-Sinne** als eigener Block (fliegende Inseln + Bäume kollidierbar, Schatten, Shader, Sterne, Höhlen, Wasser) — siehe Design-Doc §11

**Was beachten (Welle 6 als Ganzes)**:
1. **Heilige Lektion**: 6.B, 6.C, 6.D sind die Stamm-gefährdenden Blöcke — Reflex „separates Modul" abwehren.
2. **Schema-Bumps** bei 6.C1, 6.C2, 6.D, 6.F5 — defensive Migration testen.
3. **Diskriminations-Tests** pro Block (Beispiele in Design-Doc §9.3).
4. **Reflexions-Pausen** zwischen 6.A→6.E, 6.F1+F2→6.D, Rest.
5. **Vision-Treue von 6.D** ist nicht-verhandelbar: Spieler-Stats müssen aus Tag-Aggregation kommen, nicht als separates RPG-System danebenstehen.

#### Alt-Plan-Archiv

Der ursprüngliche Welle-6-Plan (sieben Teilschritte 6.1-6.7) ist vollständig in den Block **6.F** überführt. Details siehe `docs/archiv/wave-6-design.md` §7. 6.6 (Rüstung) wird Teil von 6.D (Stats), 6.7 (Min-Regel) wird Teil von 6.D §5.5.

---

### Welle 6 ALT — ursprünglicher Plan (jetzt 6.F)

(Bleibt unten zur Referenz, ist aber durch die Sechs-Blöcke-Struktur oben ersetzt. Beim Implementieren ist die Detail-Tiefe der 6.1-6.7-Teilschritte hilfreich — daher nicht gelöscht.)



**Status**: 🔴 offen — **bewusst nach Ringe 8-10 verschoben** (Entscheidung 13.05.2026). Die Hylomorphismus-Schicht ist mechanisch vollständig (W4 + W5 A+B+C), Welle 6 ist Polish + Erweiterung, kein Fundament. Rings 8-10 (Welten-Ultiversum) ziehen die Vision-Krönung vor; Welle 6 läuft danach als Feinabstimmung.

**Ziel**: Die Crafting-Schicht visuell + mechanisch + körperlich „atmen" lassen. Heute existieren Verbindungen, Lasten, Tags, Werkzeuge nur als Datenschicht und Stern-Anzeige — Welle 6 macht sie sichtbar, fühlbar und konsequent.

**Teilschritt 6.1 — Visuelle Verbindungs-Linien** (~1 Session)

- Three.js-Tube/Cylinder/Line zwischen `bp.parts[a].position` und `bp.parts[b].position`, gerendert pro Connection in `state.blueprints[].connections`
- Pro Connection-Type eigener visueller Stil: `lashing` = Tube mit braunem Seil-Material, `pinning` = Cylinder mit Eisen-Material, `welding` = kurze geometrische Naht, `magic_bind` = emissive Linie mit awe-Farbe, `hafting` = keilförmiger Übergang, `gluing` = dünne flache Naht, `masonry` = Mörtel-Streifen, `sewing` = gestrichelte Linie
- Pro-Spawn-Renderpfad in `_buildFromBlueprint` nach Part-Render, vor Compound-Group-Return
- Editor-Vorschau: dieselben Linien im Workshop-Mesh-Preview (sobald 6.6 — Realtime-Preview — fertig ist; sonst nur bei gespawntem Compound)

**Caveats:**
- Linien dürfen **nicht** Kollisionen erzeugen — sie sind rein dekorativ, gehen nicht in den Compound-Body
- Mesh-Culling muss greifen: bei `tickArchitectureCulling` ebenso disposed wie der Rest
- Bei W5-A Lastfaktor < 0.7 (heute rötliche Stern-Anzeige) → Linien-Material rötlich tinten als „diese Verbindung trägt nicht"

**Teilschritt 6.2 — Brech-Mechanik bei zu schwacher Last** (~1-2 Sessions)

- Trigger: beim Spawn eines Compounds mit `connection.load < 0.7` (oder konfigurierbar `WORLD_EFFECT_THRESHOLDS.connection_brittle`)
- Drei Varianten zur Wahl:
  - **Sanft**: Compound spawnt, aber Part(s) hinter schwacher Verbindung visuell „abgehängt" — leicht ge-offset, halb-transparent, ohne Kollision für den unverbundenen Sub-Tree
  - **Hart**: Beim ersten Welt-Effekt-Trigger (`_applyCompoundWorldEffects`) zerteilt sich der Compound in N separate dynamische `btRigidBody`s, die mit Schwerkraft fallen
  - **Editor-Warn-Only**: Stern-Anzeige bleibt + Tooltip „diese Verbindung würde brechen", aber kein Spawn-Effekt — sicherste Variante, behält die heutige Semantik
- Empfehlung: **6.2 startet mit Editor-Warn-Only** als „opt-out: bauen geht weiter", dann separat-Commit für Spawn-Effekt
- Journal-Eintrag bei Bruch: `journalAppend("structure_failure", "Die ${name} hielt ihre Last nicht.")` — die Welt erinnert das Versagen

**Caveats:**
- **Min-Regel-Entscheidung (Learning #95) muss vor 6.2 fallen**. Heute deckelt der schlechteste opChain-Schritt; bei harter Brech-Mechanik wäre das doppelt grausam (schlechte Präzision → schlechte Tags → schwache Last → Bruch). Drei Optionen: (a) min bleibt, Brechen ist UX-Bestrafung; (b) später-poliert hebt (max statt min); (c) Decay-Modell (jeder Op multipliziert mit eigenem Faktor, end-Wert = Produkt). Schöpfer-Entscheidung in einem expliziten Commit dokumentieren.
- Body-Recreate-Pfad für zerteilte Sub-Bodies ist nicht trivial (Compound→Liste-of-Bodies + 8 Half-Extent-Berechnungen + correct Welt-Position) — Test-First

**Teilschritt 6.3 — Energiequellen für Maschinen** (~1-2 Sessions)

- Konzept §4.1: vier Quellen — `hand` / `wasserrad` / `dampf` / `magisch`
- Erweitert `state.tools[name]` um `{energySource, energyAvailable}` (default `"hand"` / `1.0` für alle Built-ins)
- Welt-Effekt: ein Compound mit `tags.fließend ≥ 0.7` + nahem Bauplan mit `toolMeta` → Wasserrad-Bonus, hebt `energyAvailable` von 0.6 auf 1.0 → opChain-Cap multipliziert mit `energyAvailable`
- DSL-Op `set_energy_source(toolName, source)` für Schöpfer-Hand
- UI: Energie-Quelle als Auswahl-Feld in der Werkzeug-Liste, neben opClass und precisionCap

**Caveats:**
- **Nicht im `dslComposeAtomic`-Pool** (gleiche Regel wie `apply_op`, `define_material`) — Nexus darf keine Werkzeuge willkürlich umkonfigurieren
- Snapshot-Cap-Regel (Welle 5 C) bleibt: `precisionCap` wird beim Register eingefroren, aber `energyAvailable` ist Live-Lookup gegen Welt-Kontext (Wasserrad in der Nähe = ja/nein) — das ist OK, weil es ein Zustand, kein Wert ist
- Wasser-Animation-Hook in `tickArchitectures` muss „nahe genug" effizient finden — KD-Tree wäre Overkill, einfache Distanz-Schleife reicht bei <50 Architekturen sichtbar

**Teilschritt 6.4 — Kreaturen-Körper als Baukasten** (~2 Sessions)

- Kreaturen sind heute Single-Mesh (Würfel/Kugel mit Farbe). Spieler-Seele V2 hat schon Multi-Mesh-Group mit Walk-Cycle (Mensch/Phönix/Drache). Welle 6 zieht die gleiche Schicht in Kreaturen hoch.
- `state.creatureSouls` analog `playerSoulDefs` — drei Built-ins (z. B. Pflanzenfresser/Räuber/Geist), jeder mit `build()` + `animate(g, t, ph, mv)` Multi-Mesh
- DSL-Op `creature_soul(name)` setzt die Standard-Form für neu gespawnte Kreaturen
- **Bridge zur Bauplan-Schicht**: Kreaturen als Baupläne ausdrücken, wenn man Ring 5 V3 Idee #3 (Spieler-Seele aus Werkstatt) mitnimmt — eine Kreatur ist dann ein Bauplan mit `role: "creature"` + `creatureMeta: {animatePattern, speed, jumpPower}`
- Material-Tags auf Kreaturen-Compound → Welt-Effekte ähnlich Architekturen (eine Quarz-Kreatur singt, eine Eisen-Kreatur ist robust)

**Caveats:**
- Performance: heute spawnen wir 10 Kreaturen initial; Multi-Mesh mit Walk-Cycle ist pro Kreatur ~5-10× teurer in Vertex-Count + per-frame `animate`-Hook. Cap evtl. von 50 auf 20 senken, oder LOD (nahe = Multi-Mesh, fern = Single-Mesh-Proxy)
- Movement-Worker (off-screen Kreaturen) muss Multi-Mesh aushalten — der heutige Worker rechnet nur `position`, das reicht; Animation läuft im Main-Thread bei sichtbaren Kreaturen
- Bei Bauplan-als-Kreatur muss `spawnArchitecture` vs. `spawnCreature` getrennt bleiben — beide leben in unterschiedlichen Welt-Schichten (Architekturen sind statisch + cullbar, Kreaturen sind bewegt + physikalisch)

**Teilschritt 6.5 — Physik-Baukasten für Compound-Körper** (~2-3 Sessions, anspruchsvoll)

- Heute: Compound-Bodies aus `btBoxShape` pro Sub-Mesh (Architektur) ODER Single-Body (Kreatur, Spieler)
- Vision: Verbindungen aus W5-A werden zu **echten Ammo-Constraints** — `hafting` → `btFixedConstraint`, `pinning` → `btHingeConstraint` (1 DoF), `lashing` → `btGeneric6DofSpringConstraint` (weich), `magic_bind` → distanz-erhaltendes Constraint
- Erlaubt physikalische Spielzeuge: Wippe (Achse + Brett mit Pinning), Schaukel (Lashing), Tür (Hinge), Marionetten-Kreaturen
- Brech-Mechanik (6.2) bekommt damit Substanz: `constraint.setBreakingImpulseThreshold(load * factor)` lässt das echte Solver-System entscheiden, ob die Verbindung hält
- Pro Bauplan optional `dynamic: true` — dann werden Parts zu separaten dynamischen Bodies, verbunden durch Constraints, statt zu einem Compound

**Caveats:**
- **Ammo-Constraint-Binding-Lücken** (ähnlich zu `getHalfExtentsWithMargin`-Problem): nicht alle Constraint-Typen sind in der JS-Schicht vollständig erreichbar. Vor Start: Spike mit `btHingeConstraint` + `btFixedConstraint`, sehen was geht.
- **Performance**: 6 Parts mit 5 Constraints = 6 Bodies + 5 Constraints, der Solver kann bei dichten Compounds (Dorf mit 30 Häusern, je 8 Parts) explodieren. Defaults dynamic=false halten, dynamic nur opt-in pro Bauplan.
- **Sleep-Falle wie Player-Teleport** (CLAUDE.md): nach Constraint-Erzeugung `body.activate(true)` auf beiden Seiten, sonst hängen die Parts in der Luft
- Save-Schema: `bp.dynamic` + `bp.constraints` (mit hinge-axis etc.) ergänzen — Schema-Version-Bump fällig

**Teilschritt 6.6 — Rüstung (tragbare Compounds)** (~2 Sessions)

- Bauplan mit `role: "armor"` + `armorMeta: {slot, tagsToPlayer}` — z. B. `slot: "head"`, „helmet"
- `state.player.armor = {head, body, legs}` — drei Slots, jeder hält einen Bauplan-Namen oder null
- Material-Tags + räumliche Tags der Rüstung **wirken auf den Spieler**: `magieleitung` → Spell-Schutz, `härte` → Damage-Reduction, `sprödigkeit` → HP-Penalty (Konsequenz statt Bestrafung), `resoniert` + hohe Präzision → Sing-Effekt, der Kreaturen besänftigt
- **Vorbedingung — Spieler-Stats-System**: heute hat der Spieler nur Bewegung, keine HP/Resistance/Damage. Welle 6.6 muss ein minimales Stat-System einführen: `state.player.stats = {hp, maxHp, defense, magicResist}` + Tick-Damage z. B. bei Lava-Berührung (heute noch nicht modelliert).
- DSL-Ops `equip_armor(slot, bp)` und `unequip_armor(slot)`
- Visuell: Rüstungs-Bauplan rendert um die Spieler-Mesh herum, skaliert auf 1.2× Spieler-Größe, folgt yaw

**Caveats:**
- **Größter Eingriff in Welle 6** — Stat-System ist neuer Welt-Pfeiler, nicht nur Polish. Wenn das zu groß wirkt: 6.6 könnte rein kosmetisch starten (Rüstung visuell tragen, keine Stat-Effekte), dann später Stats nachziehen.
- Animations-Sync: bei Player-Soul-Wechsel (Mensch ↔ Drache) muss die Rüstung mit-skalieren oder verschwinden — Drache trägt keinen Mensch-Helm sinnvoll
- Save: `armor` in `playerSoul`-Sektion, mit defensive Migration (alte Saves haben keine Rüstung → `null` pro Slot)

**Teilschritt 6.7 — Min-Regel-Entscheidung dokumentieren** (~0.5 Sessions, in 6.1 oder 6.2 inkludiert)

- Learning #95 als expliziter Commit mit drei dokumentierten Optionen + Schöpfer-Entscheidung
- Konzept-Doc `docs/crafting-konzept.md` §2.3 aktualisieren (heute „min", evtl. „min mit nachträglich-poliert hebt Stein-für-Stein um 20 %")
- Test-Invarianten anpassen: heute prüft Welle 4 P3 Diskriminations-Schwelle 0.4 vs. 0.97 — bei neuer Regel evtl. andere Werte

**Akzeptanz Welle 6 gesamt**: 
- Verbindungen sind im 3D-Bild sichtbar, Connection-Type erkennbar an Look
- Eine schwach verbundene Konstruktion zeigt Konsequenz (Warnung oder Bruch)
- Maschinen können energiegekoppelt sein (Wasserrad-Drehbank)
- Kreaturen haben Multi-Mesh-Körper mit Walk-Cycle
- Mindestens 2 der 8 Verbindungstypen funktionieren als echtes Constraint
- Rüstung lässt sich tragen, hat (zumindest visuell) Konsequenz
- Min-Regel-Diskussion ist mit klarem Commit beendet

**Vorbedingung**: W5 abgeschlossen ✅. Ring 8-10 müssen NICHT fertig sein, aber **wir verschieben Welle 6 bewusst nach 8-10**, um die Welten-Schicht nicht durch Polish zu verzögern.

**Was beachten (Welle 6 als Ganzes):**
1. **Heilige Lektion**: 6.4 + 6.5 + 6.6 sind die schwersten Brocken — wenn der Reflex „separate Kreaturen-Datei + Physik-Modul + Stat-Manager" auftaucht, ist es ein Smell. Stamm bleibt, Wachstumsringe wachsen IN `anazhRealm.js`.
2. **Schema-Version bumpen** bei 6.5 (constraints) und 6.6 (armor + stats) — Save-Migration testen mit alten Saves vor dem Commit.
3. **Diskriminations-Tests** für 6.1 (visuelle Linien) und 6.3 (energy): zwei minimal verschiedene Setups, prüfen dass Welt-Reaktion zwischen ihnen liegt.
4. **Reflexions-Pause** zwischen 6.3 und 6.4 — der Übergang von Crafting-Mechanik zu Kreaturen/Körper ist konzeptionell groß genug, um nochmal die Vision-Treue zu prüfen.

---

### Ring 8: Welt-Identität & Sichtbarkeit (~2-3 d)

**Ziel**: jede Welt ist ein identifizierbares Universum mit eigenen Regeln.

- `state.worldMeta`-Felder sind bereits da (worldId, slug, creator, visibility, parentWorlds, schemaVersion). Jetzt: **Logik dahinter**.
- Chat-Befehle:
  - „benenne welt <slug>" → `state.worldMeta.slug` ändern
  - „mach welt öffentlich/privat" → `visibility` toggeln
  - „neue welt" → frische worldId, vorhandene Welt wird in localStorage unter `anazhRealmState_<worldId>.json` archiviert
- localStorage-Struktur: ein Index-File `anazhRealmWorlds` mit `[{worldId, slug, lastPlayed}]` + ein Daten-File pro Welt
- UI: ein kleiner Welt-Picker (`<select>`-Element, zeigt slug + lastPlayed) zum Welt-Wechseln
- Pro Welt eigenes Save, eigener Seed, eigener `chunkMap`, eigene DSL-Abilities

**Akzeptanz**: der Spieler hat 3 Welten, wechselt zwischen ihnen, jede behält ihren Zustand.

**Vorbedingung**: Ring 2 Phase 4 (Save-Migration), damit alte Single-World-Saves sauber in das neue Multi-World-Schema überführt werden.

---

### Ring 9: Welt-Export/Import (~2 d)

**Ziel**: Welten sind teilbar.

- „welt exportieren": JSON-Datei mit allen DSL-Programmen, Seeds, Metadaten — **nicht** mit Mesh-Snapshots (die sind aus DSL+Seed regenerierbar)
- „welt importieren": drag-drop oder File-Dialog. Drei Wahlmöglichkeiten:
  - Ersetzen: importierte Welt wird aktuelle Welt
  - Neu daneben: importierte Welt bekommt eine neue worldId und wird zur Liste hinzugefügt
  - Fusionieren: → Ring 10
- Signing optional V2 (für vertrauenswürdige Provenienz): SHA-256 der Welt-JSON in einem `signature`-Feld, vom Spieler-Schlüssel signiert. V1 nur Hash.
- Test: Welt exportieren, localStorage clearen, importieren → identische Welt wieder da.

**Akzeptanz**: ich kann eine Welt mit einem Freund tauschen (per Datei oder Link).

---

### Ring 10: Welt-Fusion (~3-4 d)

**Ziel**: zwei Welten begegnen sich und werden eine dritte.

- DSL-Programme zweier Welten werden gemerged:
  - **Naive Strategie**: `[chain, weltA_root, weltB_root]` — beide laufen sequentiell
  - **Random-Mix**: pro Generations-Tick wird mit 50:50 ein Programm aus A oder B gewählt
  - **Conflict-Resolution**: wenn beide Welten widersprechende terrain_steepness setzen, wird gewichtet (zb 70 % A, 30 % B)
- Neue Welt: `worldId` neu, `parentWorlds: [worldA.id, worldB.id]`
- UI: 2-Spalten-Picker, „diese ⊕ diese → neue Welt"
- Test: Fusion zweier Welten ergibt eine dritte, deren Verhalten erkennbar Elemente beider zeigt.

**Akzeptanz**: Stammbaum-Visualisierung in `parentWorlds` ist navigierbar.

---

### Ring 11: Multi-User-Sync

**Ziel**: zwei Spieler erleben dieselbe Welt zur gleichen Zeit.

#### V1 ✅ (13.05.2026, live) — Position-Sync via WebSocket-Broker

Geliefert in einer Session (in Kombination mit Ring 10.5 für die Vorbedingung):

- **`signaling-server.js`**: Mini-WebSocket-Broker (~225 Zeilen, ZERO npm-Dependencies). RFC-6455 Frame-Handling von Hand, Health-Endpoint `/health`, HOST/PORT via env.
- **Protokoll**: `join { room, peerId }` → `welcome { peers[] }`, `pos { x, y, z, yaw }` wird an alle Mitglieder desselben Raums broadcastet, ohne den Absender.
- **Client (`state.p2p`)**: `peerId`, `room`, `ws`, `peers: Map<peerId, {x,y,z,yaw,mesh,lastSeen}>`, 30 Hz pos-Broadcast im Game-Loop (intern gedrosselt), Idle-Purge nach >10 s ohne Update.
- **Remote-Avatare**: THREE.Group aus Cone + Sphere, deterministische HSL-Farbe aus peerId-Hash.
- **UI**: Toggle + URL-Input + Status-Anzeige im Einstellungen-Drawer. Auto-Connect nach Init wenn `p2p.enabled === true` in localStorage.
- **CSP**: `connect-src` erweitert um `ws://127.0.0.1:4313` + `ws://localhost:4313` + wss-Varianten.
- **Trust-Boundary**: KEIN neuer DSL-Op (`p2p_send`/`peer_dsl`/`remote_run`) — V1 trägt strikt nur Position + Rotation. Playtest-Invariante prüft die Abwesenheit explizit.
- **Heilige-Lektion-Disziplin**: EINE neue Datei (signaling-server.js), zehn Methoden auf der einen `AnazhRealm`, drei Sub-Hooks im Game-Loop. KEIN P2PManager-Modul.

**Ehrliche V1-Grenzen** (V2-Aufgaben):
- Modifikationen (Ring 10.5 `modify_terrain`, Architekturen, Kreaturen) werden NICHT zwischen Spielern synchronisiert. Jeder erlebt seine eigene Welt-Variante.
- Avatar ist immer Cone+Sphere, nicht die echte Spieler-Seele (Phönix/Drache).
- Kein DSL-AST-Broadcast — Chat-Befehle wirken nur lokal.

**Acceptance-Test** (manuell): `npm run signaling` + zwei Browser-Tabs derselben Welt → in Einstellungen Multi-User aktivieren → beide Spieler bewegen sich sichtbar als bunte Kegel.

#### V2 (offen, ~3-5 d): DSL-AST-Broadcast für Welt-Sync

- Chat-Befehle werden als DSL-AST über WebSocket an alle Mitglieder gesendet
- Eingehender AST läuft durch denselben `dslRun`-Sandbox-Pfad wie eigene Programme (identische Budget-Limits, Op-Whitelist, kein Bypass)
- `modify_terrain`-Ops werden so synchron — beide Spieler sehen dasselbe Loch
- Nexus-Programm-IDs (statt ganzem Programm) für Outcome-Dedup
- Public Welten: `visibility: "public"`, jeder mit der worldId kann beitreten
- Private Welten: Schöpfer generiert Token-Link

**Vorbedingung**: Ring 11 V1 (Position-Sync stabil) + saubere DSL-Sandbox (existiert seit Ring 7).

---

### Welle 6.X: Polish-Sammel (Audit 17.05.2026, ~4-5 Sessions)

**Ziel**: 18 vom Schöpfer kuratierte Bugs/UX/Vision-Punkte in einer fokussierten Welle abarbeiten BEVOR neue Atmosphäre/Mechanik kommt. Logik: ein Spieler der in Reibung steckt, kann die nächsten Vision-Schichten nicht spüren.

**6.X.1 — Bug-Quartett (1 Session)**
- **A1 Jump-im-Stehen**: `playerBody.activate(true)` vor `setLinearVelocity` in beiden Jump-Pfaden (`handleJump` Zeile 22593 + Loop-Jump Zeile 22895). Ammo-Sleep-State weckt sich sonst nicht.
- **A2 Ghost-rot-aber-platzierbar**: in `confirmBuild` vor `spawnArchitecture` prüfen `if (getGameMode() === "pfad" && !bm.phantomOnGround) return false;`. Frieden+Schöpfer bleiben durchlässig (Vision §10.1).
- **A3 Rüstung-Markier-Filter**: `renderPlayerEquipUI` zeigt JETZT alle eigenen Baupläne in Markier-Sektion, außer `bp.roleManual === true` — emergente Welle-9-Rolle blockt nicht mehr explizite Geste. Plus Stat-Panel-Zeilen „Trägt: <armor>" + „Werkzeug: <tool>".
- **A4 1st-Person-Aura-Hide**: `tickPlayerAura` setzt `glow.visible = state.cameraMode !== "first"`. Mitspieler-Sicht unverändert (P2P sync't keine Aura).

**6.X.2 — UI-Politur (1 Session)**
- **B1 Logbuch-Toggle**: `#log` und Section-Wrapper bleibt im DOM, aber default `hidden`. Toggle in Einstellungen-Drawer „Logbuch sichtbar". Power-User-Pfad bleibt offen.
- **B2 Welt-Bauwerke entfernen**: Vier Quick-Spawn-Buttons (Dorf/Tempel/Wasserfall/Fraktal) aus dem world-drawer entfernen. Hotbar+Werkstatt ersetzt sie.
- **B4 Scrollrad-Hotbar**: `wheel`-Listener auf Canvas, `e.deltaY > 0 ? next : prev` modulo 9. Im Build-Mode deaktiviert (zukünftig: Phantom-Distance-Wheel).

**6.X.3 — Vision-Quick-Wins (1 Session)**
- **C1 Struktur-Spawn-Offset**: neuer DSL-Resolver `at_player_forward(dist=5)` der `p + yaw-Vektor × dist` liefert. Chat-Patterns „Baue Dorf hier" → `["spawn_village", ["at_player_forward", 8]]` statt `["at_player"]`. Vision §11 — Welt-Geste wirkt selbst-entschieden.
- **C3 Soul-bound-Sprung**: Jump-Block prüft `if (state.onSteepSlope) return` PLUS soul-abhängige Steilheits-Toleranz: `maxJumpFromSlope = soul.tags.lebendig * 0.7 - dichte * 0.3` o.ä. Phönix klettert wo Drache nicht. Hylomorphismus-Pipeline (Vision §1.3 fraktal).

**6.X.4 — Stats-HUD + Audio-Slider + Begleiter-Name (1-2 Sessions)**
- **B3 HP/Stamina-Bar**: SVG-Bars über `#hotbar`, painterly-Style (Pergament+Kupfer). Refresh-Loop pro Frame mit `hp/hpMax`. Tooltip auf Hotbar-Items für slow Stats (Damage/Speed/Präzision) — schneller Stat oben, langsamer im Tooltip ("satisfying slow Stats").
- **D2 Audio-Slider**: drei Slider in Einstellungen (Master / Kreatur-Pings / Chunk-Distance 3..9-Ring).
- **F1 Begleiter-Name + Avatar-Name**: `state.llm.companionName` (default "Grok") + `state.player.name` (default "Schöpfer"). Beide editierbar im UI, in System-Prompts referenziert. Optional: Voice-Auswahl aus `speechSynthesis.getVoices()`.

**6.X.5 — Performance-Caching (1 Session)**
- **D1 Raycast-Throttle**: `isPlayerGrounded()` Result cachen für 2 Frames (Variable `_groundedCache` + `_groundedAt`). 540 → 270 Raycasts/Sek. Aura-Update alle 5 Frames (Atem-Animation via performance.now sowieso).
- Plus Parallel-Code-Audit-Sweep: Suche nach Doppel-Pfaden seit Welle 6.G P1.5 (alle wahrscheinlich sauber, aber Vision-Disziplin).

**Akzeptanz Welle 6.X**: 1791 → ~1840 Playtest-Invarianten. Spieler kann 30 Min spielen ohne Reibung, Welt fühlt sich aufgeräumt + lebendig an.

---

### Welle 11 V3: Soul-Sync (Multi-User echt körperlich, ~2-3 Sessions)

**Ziel**: Mitspieler werden echte Phönixe/Drachen/Custom-Souls, nicht Cone+Sphere.

**Architektur**: bei jedem `applyPlayerSoul`/`applyPlayerSoulFromBlueprint` broadcastet der Spieler einen `soul-snapshot { peerId, soulName?, soulBauplan? }`-Frame. Empfänger ruft `_buildFromBlueprint(bp)` und ersetzt den Cone+Sphere-Group durch das echte Soul-Mesh. Soul-Compound-Tags werden NICHT übertragen (Empfänger berechnet sie eh aus dem Bauplan emergent). Bandbreite: ~2-5 KB einmalig pro Soul-Change.

**Multi-User-Disziplin**: Soul-Sync ist KEIN DSL-Op (würde Loop-Schutz brechen), sondern eigene Message-Type. Welcome-Frame enthält aktive Souls aller Peers. P2P-Welt-Snapshot beim Join (Ring 11.5) erweitert um Soul-Liste.

**Akzeptanz**: zwei Browser-Tabs, ein Spieler wechselt zu Phönix → Mitspieler sieht ihn flatterten statt Kegel. Custom-Soul via define_soul → Mitspieler sieht das Multi-Part-Mesh.

---

### Welle 11 ext.: Substanz-Rolle (Hylomorphismus auf Steroiden, ~3-4 Sessions)

**Ziel** (Audit-Punkt #13 / C5, eines der größten Vision-Worte): Bauplan-Rolle emergiert vollständig aus Substanz, ohne `setBlueprintAs*`-Manualität. „Universum-Freiheit mit wenigen Stabilisierungs-Mechanismen."

**Vier Stabilisatoren** (so wenig wie möglich):
1. **`bp.bodyParts`-Marker** (Soul): hat eine humanoide/quadruped/winged räumliche Symmetrie + ≥3 Glied-Compounds → Identität = Avatar/Kreatur
2. **opChain-Domain-Dominanz** (Werkzeug/Rüstung/Trank): bereits in Welle 9a — forging+scharf → tool, forging+dicht → armor, alchemy → consumable
3. **`compoundTags.nahrhaft`** (Nahrung): neues Tag `nahrhaft = lebendig × verarbeitung_alchemy`. Compounds > 0.5 ohne Domain → Nahrung-Rolle, regeneriert HP/Stamina bei Konsum
4. **Default → Bauwerk** (alles andere geht als Architektur in die Welt)

**Plus**: Schöpfer-Override via `bp.roleManual = true` bleibt (Welle 9a-Disziplin) — explizite Geste sticht Emergenz.

**Vision-Wort**: „**Substanz-Rolle**" — Identität geht aus der Substanz hervor, nicht aus Etikette. Wie im echten Universum: ein Stein wird Stein, weil er Stein-Material ist, nicht weil jemand ihn als „Stein" markiert hat.

**Akzeptanz**: Schöpfer baut einen Bauplan ohne explizite Rolle → System erkennt korrekt, was er gebaut hat (Schwert / Helm / Trank / Brot / Turm). Markier-UI wird optional — ein „Was wäre wenn"-Button zum überschreiben der emergenten Rolle.

---

### Ring 4 V2: Lofi-Chill-Musik (~1-2 Sessions, Audit-Punkt #3 / F2)

**Ziel**: Welt-Musik atmet langsamer, „minecraft relax", lofi hip hop vibes. Web-Audio nativ, keine Assets.

**Drei neue Schichten** (additive zu V1 ambient + weather + creature):
- **Chord-Pad**: drei Sinus-Oszillatoren spielen Akkord (Default F#m7 = F# + A + C# + E). LFO 0.05 Hz auf Filter-Cutoff. Akkord-Wechsel alle 8 Takte zufällig aus [F#m, A, C#m, E].
- **Soft Kick** (optional): Sinus 60 Hz mit kurzem Decay bei Beat 1 von 4 (60 BPM). −18 dB, fast subliminal.
- **Vinyl-Crackle**: White-Noise + Bandpass 2-4 kHz + sehr leise Gain (−25 dB). Lofi-Charakter.

**Emotion-Modulation**:
- `hope > 0.6` → Major-Akkord-Pool [F#, A, D, E]
- `sorrow > 0.6` → 50 BPM statt 60, Filter dunkler
- `peace > 0.7` → Vinyl-Crackle aus (zu klar), Tempo 45 BPM
- `chaos > 0.6` → Dissonante Sus2-Akkorde

**Toggle**: separat zu V1 (Spieler darf nur Drone oder Drone+Lofi). Default off.

---

### Welle 12 + 13: ✅ erledigt (Detail in `world-portal.md` + `CLAUDE.md`)

**W12 Welt-Portal (V8.51-V8.53)** und **W13 Vibe-Pass (V8.54-V8.56)** sind vollständig live. Der ausführliche Wellen-Eintrag steht in `CLAUDE.md` (V8.51-V8.56), die Vision-Tiefe in `docs/world-portal.md` §3-§4. Kurz: W12 baute das Tor (sandboxed iframe, zwei fremde Engines, generische DSL-Brücke, beidseitiger Kanal, native Manifest-Stufe), W13 die Identität (ed25519-Schlüssel, Bauplan-Signaturen über die Substanz, peerId-gebundene Multi-User-Identität). Beide sind die Vorbedingung für W14.

---

### Welle 14: Bibliothek (Welt-Registry) — die letzte große Vision-Schicht (~8-10 Sessions, 3 Phasen)

**Ziel** (`docs/world-portal.md` §2 Schicht 3, §9): AnazhRealm wird das Tor, das andere Welten *sammelt*. Eine Welt-Registry, in der man fremde Welten browst, mit einem Klick einen Portal-Bauplan ins Inventar legt, ihn in der Heimat-Welt platziert und immer wieder hindurchgeht. W12 baute das Tor, W13 die Identität — **W14 baut die Bibliothek dahinter**. „Die Bibliothek von Alexandria der Vibecode-Ära."

**Die Schnittstellen, auf die W14 aufsetzt** (alles steht schon — W14 verbindet, baut keinen neuen Stamm):

- `AnazhRealm.WORLD_REGISTRY` (W12) — die EINE Quelle, welche Sub-Welten es gibt (`{id, label, world, dsl}`). Heute Daten ohne Browse-Sicht.
- `aimBlueprintAtWorld(blueprint, welt)` + DSL-Op `set_portal` (W12) — ein Bauplan wird auf eine Welt gerichtet.
- `_portalReceiveManifest` + die Drei-Stufen-Marke ausgestellt/übersetzt/nativ (W12 P3) — eine Welt beschreibt sich über ihr `manifest.json`.
- `_vibeSign` / `_vibeVerify` / `vibePassId()` (W13) — die Krypto-Primitive, um ein Manifest zu signieren und zu prüfen.
- `addToInventory(name, count)` (Welle 6.C1) — der Pfad, einen Bauplan ins Inventar zu legen.
- Welt-Tor Export/Import (Ring 9) — der bestehende Welt-Teilen-Mechanismus (JSON-Datei).

**Phase 1 — die Bibliothek wird ein Ort** ✅ **live (V8.58)** (~1-2 Sessions):

1. Ein neuer „Bibliothek"-Tab (8. Drawer in der Topbar) listet die `WORLD_REGISTRY`-Einträge browsbar.
2. Pro Welt eine Karte: Label, DSL-Vokabular (was die Welt versteht), Drei-Stufen-Marke, kurze Beschreibung.
3. Aktion „Portal holen" → `aimBlueprintAtWorld` baut einen Portal-Bauplan für die Welt → `addToInventory`. Der Spieler platziert ihn in seiner Welt und betritt ihn.
4. Playtest-Invarianten + Schöpfer-Browser-Test.

→ Damit wird die Registry vom Entwickler-Datum zum **spieler-erreichbaren Ort**. (W12 notierte selbst: „die 3 Welten wirken hardcoded" — Phase 1 schließt genau das.) **Umgesetzt in V8.58**: `renderLibraryUI`/`obtainPortalForWorld`/`libraryInitDOM`, `WORLD_REGISTRY` um ein `desc`-Feld erweitert, achter Topbar-Tab „Bibliothek", 13 neue Invarianten — Detail in `CLAUDE.md` V8.58.

**Phase 2 — eine Welt veröffentlichen + signieren** ✅ **live (V8.60)** (~2-3 Sessions):

1. Eine eigene (Sub-)Welt in die Bibliothek eintragen.
2. Beim Veröffentlichen signiert der Vibe-Pass das `manifest.json`: `authorPubKey` + `signature` (`world-portal.md` §3.3) — `_vibeSign` über den kanonischen Manifest-Inhalt.
3. Das Portal-Overlay prüft die Signatur bei `_portalReceiveManifest` via `_vibeVerify` und zeigt „signiert von &lt;Autor&gt;" / „unsigniert". **Hier trifft W13 auf W14.**
4. Hier landet auch **W13 V2** (Vibe-Pass §4): der Pass trägt das Schaffen des Spielers — Custom-Seele, eigene Materialien, eigene Werkzeuge reisen mit, wenn er durch ein Portal in eine fremde Welt geht.

**Phase 3 — fremde Welten empfangen** ✅ **live (V8.61)** (~3-4 Sessions, Horizont):

1. Welten teilen + in die eigene Bibliothek importieren (der dezentrale Teil — `world-portal.md` §2 Schicht 3).
2. Realistischer Anfang: die bestehende Welt-Tor-JSON (Ring 9) IST der Teilen-Mechanismus; die Bibliothek wird ein Index importierbarer Welten. Kein IPFS, keine zentrale Authority (Heilige Lektion — kein neuer Dienst, wo ein bestehender reicht).
3. Der KI-Übersetzer ist die Krönung — **vollständig (Phase 1 V8.68 + Phase 2 V8.69)**: Phase 1 die Manifest-Übersetzung (eine fremde Welt-Beschreibung → ein sanitiertes Portal-Manifest, LLM-Output als Daten); Phase 2 die deklarative Szene + der generische Renderer `worlds/translated/` — die übersetzte Welt wird betretbar. Der LLM-Output bleibt durchgehend DATEN, kein ausgeführter Code: statt einen fremden Adapter zu vendorn, wird die Welt in AnazhRealms eigene deklarative Sprache wiedergeboren.

**Folgerung / Disziplin**: W14 ist groß, aber kein neuer Stamm — eine browsbare Registry + Portal-Baupläne sind ein Wachstumsring auf W12+W13. Phase 1 + 2 sind klar umrissen und browser-testbar; Phase 3 (Dezentralisierung) ist ein Horizont, der konkret ausgearbeitet wird, *wenn* P1+P2 stehen — nicht vorher (keine Spec für ein Szenario, das es noch nicht gibt).

**Akzeptanz**: der Schöpfer öffnet den Bibliothek-Tab, sieht die verfügbaren Welten, holt sich mit einem Klick ein Portal, platziert es, geht hindurch — und beim Betreten einer veröffentlichten Welt steht „signiert von &lt;Autor&gt;".

**Vision-Wort**: „**Andere bauen Welten FÜR Spieler. Wir bauen das Tor, das sie alle verbindet.**" Der Knotenpunkt, durch den man geht.

---

### Der Fremd-Engine-Bogen (W15–W17): das echte automatische Welt-Tor

**Stand**: der Fremd-Engine-Bogen ist im Kern **vollständig**. Das Untrusted-Welt-Tor (V8.70) ist der Schlüsselstein — eine echte, ungeprüfte fremde Engine läuft null-origin sandgesichert hinter dem Portal (`worlds/schwarm/` beweist es). **W15 — der Auto-Vendor-Pfad — ist gebaut (V8.71 Bündel-Pfad, V8.72 GitHub-Fetch)**: ein fremdes Repo dockt ohne Handarbeit an. **W16 — die Mesh-Welt-Verteilung — ist komplett (V8.73 Welt-Bündel-Transport, V8.74 der browsbare Welt-Katalog)**: eine vendorte Welt reist peer-to-peer zu einem Mitspieler, und die Mesh-Bibliothek ist browsbar. **W17 — die Multiplayer-Sub-Welten — ist komplett (V8.75 Transport-Shim, V8.76 Mesh-als-Server, V8.77 Gruppen-Portal, V8.78 Multiplayer-Welt-Deklaration, V8.79 B-JS-Compute Phase 1 Compute-Host, V8.80 B-JS-Compute Phase 2 Host-Migration)**: eine Gruppe taucht gemeinsam in eine vendorte Relay- ODER JS-Compute-Multiplayer-Welt, und verlässt der Compute-Host das Mesh, übernimmt ein deterministisch gewählter Nachfolger. Niemand muss die Bibliothek verlassen, um gemeinsam ein Buch zu lesen. Offen bleibt nur B-WASM (ein Rust→WASM-Server in einem Peer-Tab — bewusst per-Projekt, nicht automatisch) + eine kleine Vendor-Ketten-Naht (`serverMode` durch die ganze Vendor-Kette).

**Das Vollbild — fünf Schichten.** Jede baut auf der vorigen; eine fremde Welt nutzt so viele, wie sie braucht.

| Schicht | Was | Stand |
|---|---|---|
| 0 — Sandbox | das null-origin-iframe: fremder Code läuft voll, kann AnazhRealm nicht berühren | ✅ V8.70 |
| 1 — DSL-Brücke | der universelle Befehls-Kanal (postMessage, JSON, asymmetrisch) | ✅ W12 |
| 2 — Transport-Shim | die Netz-APIs der fremden Welt (`WebSocket`/`fetch`/`RTCPeerConnection`) werden durch AnazhRealm umgeleitet | ✅ V8.75 (`WebSocket`; `fetch`/`RTC` spätere Schichten) |
| 3 — Mesh-als-Server | AnazhRealms W7-Mesh trägt den Verkehr; ein Peer hostet die Server-Logik | ✅ V8.76 Relay-Welten + V8.79 JS-Compute Phase 1 (Compute-Host) + V8.80 Phase 2 (Host-Migration) |
| 4 — Gruppen-Portal | eine Gruppe tritt gemeinsam durch ein Tor, teilt den Mesh-Raum der Sub-Welt | ✅ V8.77 (`portal-invite` + In-Game-Prompt + `joinPortalInvite`) |

**Die ehrliche Server-Taxonomie.** Nicht jede fremde Welt ist gleich. Der Auto-Vendor (W15) fragt vor jeder Welt: *was tut ihr Server — falls sie einen hat?*

1. **Rein-clientseitige Welt** (three-fluid-fx, THREE.Terrain, die Schwarm-Welt) — kein Server. Läuft schon vollständig (V8.70). ✅
2. **Relay-Server-Welt** — der „Server" ist nur ein Nachrichten-Verteiler (A sendet, der Server broadcastet an B/C/D). **Voll lösbar:** der Transport-Shim leitet die `WebSocket` der Welt auf AnazhRealms W7-Mesh um — das Mesh IST der Relay. Die Welt läuft komplett peer-to-peer, ohne je einen echten Server.
3. **JS-Compute-Server-Welt** — der Server rechnet autoritativ (Node/JS). **Lösbar:** JS läuft im Browser — ein Peer der Gruppe wird der Compute-Host (sein Tab IST der Server), das Mesh trägt den Verkehr, Host-Migration fängt das Verlassen ab. Der Multiplayer-Shooter (WS-Server, meist Relay + etwas Logik) fällt hierher.
4. **Native-Compute-Server-Welt** (voxelize — Rust-Server) — **zwei Wege:** (a) Rust kompiliert zu **WASM** — lässt sich der Server `wasm32`-bauen, läuft er in einem Peer-Browser wie ein JS-Server; (b) lässt er sich nicht client-seitig bauen (echte TCP-Sockets, Datenbank, OS-Zugriff), ist die Welt eine **Brücken-Welt**: ihr Server läuft extern (der Vibecoder hostet ihn, oder ein Community-Seed-Knoten), AnazhRealm verbindet sich dorthin. **Auch dann verlässt niemand die Bibliothek** — man tritt durch das AnazhRealm-Portal, mit seiner Gruppe, über das Mesh; nur die schwere Server-Maschine steht draußen. Das Buch wird durch ein Fenster gelesen — aber gemeinsam, von hier aus.

Der Auto-Vendor klassifiziert jede Welt in diese vier Stufen und schreibt die Stufe ins Manifest (`portalMeta.server`). Das Portal weiß dann, was zu tun ist.

#### W15 — Auto-Vendor-Pfad (~3–5 Sessions)

**Stand:** **✅ komplett (V8.71 + V8.72)**. **Phase 1 (V8.71)** baute die Schreib-Seite: der `/api/vendor-world`-Endpunkt nimmt ein hochgeladenes Bündel + schreibt es nach `worlds/<id>/` (strenge Wand — Punkt 1+2 unten), `vendorWorldBundle` registriert die Welt als `customWorlds`-Eintrag mit `trust:"sandboxed"`. **Phase 2 (V8.72)** fügte die Fetch-Seite hinzu: derselbe Endpunkt nimmt auch eine GitHub-Repo-URL — `parseGithubRepoUrl` parst sie zu owner/repo/branch, `vendorFromGithub` löst den Default-Branch auf, liest den Baum (Trees-API), holt die Text-Dateien (Raw-Fetch, zero-dep `https`) und reicht sie an dieselbe Phase-1-Schreib-Seite (`applyVendorBundle`). Kein SSRF — die API-/Raw-Bases sind operator-konfigurierbar (`VENDOR_GH_*`), nicht request-gesteuert. Der LLM-Manifest-Schritt (Punkt 3 unten) blieb bewusst offen — der Spieler tippt id/Name/DSL, oder die Welt bringt ihr `manifest.json` selbst mit.

**Ziel:** ein fremdes Repo dockt ohne Handarbeit an. Heute sind `worlds/fluid/`, `worlds/terrain/`, `worlds/schwarm/` hand-vendort; W15 automatisiert das.

1. Der save-server (läuft lokal, hat schon den V7.96-LLM-Proxy) bekommt einen `/api/vendor-world`-Endpunkt: er nimmt eine Repo-URL (oder ein hochgeladenes Bundle), holt die Dateien, schreibt sie nach `worlds/<id>/`.
2. **Sicherheits-Disziplin** (wie der LLM-Proxy): URL-Whitelist (`github.com`/`raw.githubusercontent.com`/npm), Größen-Deckel, Pfad-Sanitizing (kein `..`-Ausbruch aus `worlds/`), kein Ausführen beim Vendoren — nur Schreiben.
3. Ein LLM-Schritt liest das Repo + schreibt das Manifest (`{id, label, desc, dsl, engine-entry, server-Stufe}`). Der LLM schreibt **nicht** die Engine (das ist der fremde Code, unangetastet) — nur das Bindeglied: bei einer ES-Modul-Welt den bare-Import-Patch (wie three-fluid-fx in W12 hand-gemacht), bei einer Server-Welt den vorangestellten Transport-Shim.
4. Die vendorte Welt ist `trust:"sandboxed"` (V8.70) — sie läuft null-origin. Sie landet in `worlds/<id>/` + bekommt einen Registry-Eintrag.
5. **Der git-Kern ist die unzerstörbare Bibliothek:** eine vendorte + committete Welt ist für jeden Spieler dauerhaft da — versioniert, brennt nie. Der save-server-Pfad funktioniert in der Dev-Umgebung; ein Mensch reviewt + committet; danach hat es jeder.

**Ehrlicher Umfang:** W15 vendort rein-clientseitige + Relay-Welten zuerst (sie laufen sofort). Compute-Server-Welten werden vendort + klassifiziert, aber erst mit W17 spielbar.

**Akzeptanz:** der Schöpfer gibt eine GitHub-URL eines kleinen Three.js-Projekts ein, klickt „andocken", und nach dem Vendoren steht die Welt in der Bibliothek + ist betretbar. ✅ erfüllt (V8.72).

**Offene Ränder von W15 (ehrlich benannt — denkbares „W15.1"-Polish, kein Blocker für W16):**
- **Binär-Assets werden nicht vendort.** Beide Pfade vendoren nur Text (`html/js/css/json/…`); der GitHub-Fetch filtert Binär-Endungen (`.png`/`.glb`/`.wasm`) aus dem Baum. Eine fremde Welt mit Texturen/Modellen verliert sie. Eine spätere Schicht müsste Binär base64-kodiert mitschreiben (der save-server-Endpunkt + `applyVendorBundle` müssten ein `encoding`-Feld lernen).
- **Der LLM-Manifest-Schritt (Punkt 3) ist nicht gebaut.** Der Spieler tippt id/Name/Beschreibung/DSL selbst, oder die Welt bringt ihr `manifest.json` mit (W12 P3 native Stufe). Ein LLM, der das Repo liest + das Manifest schreibt, wäre der bequeme letzte Schritt.
- **Branch-Namen mit Slash** (`feature/x`) werden nicht aufgelöst — die Trees-API bekommt den Branch roh; einfache Branches (`main`/`master`/`dev`) gehen. Ein slashed Branch bräuchte erst eine SHA-Auflösung.
- **Das echte GitHub-Antwort-Schema ist nicht CI-getestet** — `smoke-vendor.cjs` Teil C nutzt ein Fake-GitHub, das das dokumentierte Schema spiegelt (wie `llmCall` nie gegen den echten Provider läuft). Ein Schema-Drift bei GitHub fiele erst im echten Gebrauch auf.

#### W16 — Mesh-Welt-Verteilung (~3–4 Sessions)

**Stand:** **✅ komplett (V8.73/V8.74)**. **Phase 1 (V8.73)** baute den Welt-Bündel-Transport: zwei kanal-exklusive Nachrichten `world-bundle-pull`/`world-bundle-chunk` (Spiegel von W7 P2 `world-pull`/`world-chunk`); `requestWorldBundleFromPeer(worldId, peerId)` holt eine vendorte Welt von genau einem Peer, der Sender liest sein Bündel über die save-server-Lese-Seite `GET /api/vendor-bundle` zurück, der Empfänger reassembliert + reicht es an die erprobte `vendorWorldBundle`-Schreib-Seite (ein dritter Eingang nach lokalem Bündel + GitHub). Eine peer-empfangene Welt läuft `trust:"sandboxed"`. **Phase 2 (V8.74)** fügte den browsbaren Welt-Katalog hinzu (Punkt 1 unten): jeder Mitspieler annonciert seine vendorten Welten als `[{id,label,hash}]` über den `soul`-Kanal (wie `worldRole`/`voiceShared`), der Bibliothek-Drawer rendert sie pro Peer mit einem Holen-Knopf — das blanke worldId-Feld + Peer-Dropdown der Phase 1 ist weg. Ein deterministischer sha256-Content-Hash (der save-server rechnet ihn — `applyVendorBundle`/`readVendorBundle` liefern ihn als `bundleHash`) gibt einer Welt eine peer-unabhängige Identität; `_haveWorldByHashOrId` dedupt über id ODER Hash → die Katalog-Zeile zeigt „✓ vorhanden" statt eines Knopfes. `_vendorRegisterWorld` re-annonciert den `soul` → eine frisch angedockte Welt propagiert über das Mesh. Punkt 2-4 unten waren mit Phase 1 erfüllt.

**Ziel:** Welten reisen peer-to-peer. Eine Welt, die ein Spieler hat, kann ein anderer betreten, ohne dass sie im Repo liegt — die Spieler tragen die Bibliothek.

1. Eine vendorte Welt wird **content-adressiert** (Hash über ihr Bundle). W7 P2 streamt schon den Welt-Snapshot in 16-KiB-Stücken über die DataChannels — derselbe Mechanismus trägt ein Welt-Bundle (`world-bundle-pull`/`world-bundle-chunk`, Spiegel von `world-pull`).
2. Will ich das Portal einer Welt betreten, die ein Mitspieler hat und ich nicht, holt mein Client das Bundle peer-to-peer von ihm.
3. **Die ehrliche Schicht-Trennung:** das git-Repo ist die *persistente* Bibliothek (was committet ist, ist immer da); das Mesh ist die *lebende* Verteilung (Welten reisen zwischen Online-Spielern). Ein Browser-Tab ist ein schwacher Knoten — fällt er weg, ist die Welt nicht verloren, nur über das Repo oder einen anderen Peer zu holen. Keine reine Browser-Wolke trägt die Bibliothek allein; das Repo ist der Boden.
4. Eine peer-empfangene Welt läuft `trust:"sandboxed"` — eine fremde Welt von einem fremden Peer ist per Konstruktion ungeprüft; der Sandbox (V8.70) ist die Wand.

**Akzeptanz:** zwei Spieler im selben Mesh-Raum; einer hat eine Welt vendort, der andere nicht; der zweite holt ihr Bündel peer-to-peer, beide haben sie in der Bibliothek. ✅ erfüllt von Phase 1 (V8.73 — `smoke-webrtc.cjs` beweist es). Phase 2: er findet sie BROWSBAR im Katalog (kein worldId-Raten) + die Welt trägt einen Content-Hash. ✅ erfüllt von Phase 2 (V8.74 — `smoke-webrtc.cjs` prüft, dass A's Welt mit Label + echtem sha256-Hash in B's Katalog erscheint).

**Offene Ränder von W16 (ehrlich benannt — kein Blocker, denkbares Polish):**
- **Dev-verankert auf BEIDEN Enden.** Der Sender liest sein Bündel über `GET /api/vendor-bundle` (braucht seinen save-server), der Empfänger schreibt über `POST /api/vendor-world` (braucht seinen). Auf githack (kein save-server) degradiert es anmutig (`save_server_unreachable`/`world-bundle-fail`), aber W16 lebt in der Dev-Umgebung — wie W15. Eine save-server-lose Verteilung (ein Service-Worker, der ein In-Memory-Bündel ins Portal-iframe serviert) ist eine eigene spätere Schicht.
- **Nur Text- + `vendored`-Welten.** W15-Erbe: Binär-Assets werden nicht übertragen; eine importierte Manifest-Welt (kein `vendored`) hat keine lokalen Dateien → erscheint nicht im Katalog + wird nicht herausgegeben. Eine übersetzte Welt (`worlds/translated/` + `scene`) wäre metadaten-only transferierbar (kein Datei-Bündel) — eine denkbare spätere Ergänzung.
- **Kein Pull-Timeout.** Verstummt der Sender mitten im Chunk-Strom (Tab geschlossen), bleibt `pendingBundlePull` gesetzt, bis der nächste Pull es überschreibt (der `world-bundle-fail`-Pfad deckt nur „Sender kann nicht liefern", nicht „Sender verschwand"). Mirror von W7 P2 (`pendingWorldSnapshot` hat auch keinen Timeout) — ein weicher Timeout ist eine Politur.
- **Keine Hash-Verifikation des empfangenen Bündels.** Der Katalog trägt den Content-Hash, aber der Empfänger prüft nach dem Pull NICHT, ob sein selbst-berechneter Hash dem angekündigten gleicht. Die harten Wände stehen (die `worldId`-Annahme-Wand + die Sandbox); die Hash-Verifikation als zusätzliche Integritäts-Schicht ist eine denkbare Politur. Der Transport `requestWorldBundleFromPeer` bleibt id-basiert — die hash-bewusste Dedup sitzt allein in der UI.


#### W17 — Multiplayer-Sub-Welten: der Transport-Shim + das Mesh-als-Server (~6–8 Sessions, mehrere Phasen)

**Die Antwort auf „wie tauchen wir gemeinsam in eine Server-Welt?".** Niemand verlässt die Bibliothek.

**Phase A — der Transport-Shim.** Eine fremde Browser-Welt kann nur über `WebSocket`, `fetch`, `RTCPeerConnection`, `XMLHttpRequest` netzwerken — und alle vier sind globale Objekte. Der Auto-Vendor (W15) stellt der Welt-`index.html` ein kleines, von AnazhRealm geschriebenes **Shim-`<script>`** voran, das diese Globalen überschreibt, BEVOR der fremde Code läuft. Das Shim-`WebSocket` öffnet keinen echten Socket — es `postMessage`t an AnazhRealm. Die fremde Welt glaubt, sie habe einen Server; in Wahrheit fließt ihr Verkehr durch AnazhRealm. **Ein null-origin-iframe braucht dafür GAR KEINE Netz-Berechtigung** — `postMessage` quert die Sandbox-Grenze ohne CSP. Eine sandgesicherte Multiplayer-Welt ist so voll vernetzt, ohne je selbst ins Netz zu dürfen.

**Phase B — das Mesh-als-Server.** AnazhRealm empfängt den Shim-Verkehr und routet ihn über das W7-Mesh:
- **Relay-Welt:** das Mesh broadcastet — es IST der Server. Kein Host, kein externer Knoten.
- **JS-Compute-Welt:** ein Peer der Gruppe wird der **Compute-Host** — die Server-Logik der Welt (JS) läuft in seinem Tab; das Mesh trägt den Verkehr. Verlässt der Host, wandert die Rolle (Host-Migration — W7s `worldRole`-Mechanik kennt Host/Guest schon).
- **Native-Compute-Welt:** der Server als WASM in einem Peer-Tab, oder die Brücken-Welt (externer Server).

**Phase C — das Gruppen-Portal.** Ein Mesh-Raum gruppiert schon Spieler (W7 P4 Lobby). Öffnet einer ein Portal, bekommen die anderen einen Prompt „X öffnete ein Tor nach <Welt> — mitkommen?". Sagen sie ja, betritt jeder sein eigenes Portal-iframe; die iframes sind über das Mesh verbunden (jeder AnazhRealm relayt für sein eigenes iframe). Die Gruppe ist gemeinsam in der fremden Welt, ihr Multiplayer läuft auf dem geteilten Mesh. „Meta" (man sieht sich als AnazhRealm-Avatare im Vorraum) UND „direkt" (man ist zusammen IN der fremden Engine) — je nachdem, was die Welt zulässt.

**Phasen-Reihenfolge:** A (Shim) ✅ → B-Relay (das Einfachste, voll p2p) ✅ → C (Gruppen-Portal) ✅ → B-JS-Compute Phase 1 (der Compute-Host) ✅ V8.79 → B-JS-Compute Phase 2 (Host-Migration) ✅ V8.80 → B-WASM (per-Projekt, offen). Jede Phase eine eigene, browser-verifizierte Welle.

#### Phasen-Detailplan (Sub-Schritte, ausgearbeitet — Stand V8.80; Phase A + B-Relay + C + Multiplayer-Welt-Deklaration + B-JS-Compute Phase 1 + Phase 2 gebaut, offen nur B-WASM)

**Phase A — der Transport-Shim ✅ komplett (V8.75).** Ziel: der `WebSocket`-Verkehr einer fremden Welt quert die Sandbox-Grenze als `postMessage`; AnazhRealm empfängt ihn. Phase A routet noch NICHT (das ist B) — die Akzeptanz ist ein Loopback. Alle vier Sub-Schritte gebaut, playtest-grün (+9 Invarianten), browser-verifiziert (`smoke-shim.cjs`):
- **A1 ✅ der Shim selbst.** Die Konstante `PORTAL_TRANSPORT_SHIM` (JS-String im save-server, ~50 Zeilen): ersetzt `window.WebSocket` durch eine Shim-Klasse. Pro Instanz eine Kanal-id; `send(data)` → `parent.postMessage({__anazhNet:true, kind:"ws-send", channel, data}, "*")`; ein `message`-Listener fängt `{kind:"ws-recv"}` und feuert `onmessage`. `readyState`/`onopen`/`onclose` modelliert (das `onopen` nach einem Microtask). Unterstützt BEIDE Idiome (`ws.onmessage = …` UND `ws.addEventListener`). Phase A shimt NUR `WebSocket` (`fetch`/`XHR`/`RTCPeerConnection` sind bewusst spätere Schichten).
- **A2 ✅ Injektion zur Serve-Zeit.** `sendStaticFile` injiziert den Shim als ERSTES `<script>` in `<head>` einer Welt-`index.html`, wenn die Anfrage `?anazh-shim=1` trägt (der Query ändert die Basis-URL NICHT — relative Ressourcen lösen weiter auf; gelesen VOR dem V8.41-Query-Strip). Vor jeder Welt-CSP. Die Welt-Dateien auf der Platte bleiben unberührt. Dev-verankert wie W15/W16. — **Die offene Design-Frage (Serve-Zeit vs. eingebacken) wurde zugunsten der Serve-Zeit-Injektion entschieden** (Dateien bleiben rein).
- **A3 ✅ die Portal-Seite.** `portalMeta` trägt `multiplayer:true` (`_sanitizePortalMeta` whitelistet es, `buildStateSnapshot` persistiert es feldweise — V8.59-Lehre). `_buildPortalOverlay` lädt eine Multiplayer-Welt mit dem `?anazh-shim=1`-Marker. `_portalNetReceive` (im `onMessage`-Zweig `else if (msg.__anazhNet === true)`) nimmt die `__anazhNet`-Nachrichten an (Envelope + Kanal-id validiert, gegated auf `po.multiplayer`).
- **A4 ✅ Akzeptanz: Loopback.** `_portalNetReceive` echot ein `ws-send` direkt als `ws-recv` an dasselbe iframe zurück. `smoke-shim.cjs` beweist es: eine Test-Welt im echten `sandbox="allow-scripts"`-iframe öffnet einen Shim-`WebSocket`, sendet einen Ping, empfängt das Echo.

**Phase B-Relay — das Mesh-als-Server ✅ komplett (V8.76).** Ziel: der Shim-Verkehr aller Gruppen-Mitglieder wird über das W7-Mesh gebroadcastet — das Mesh IST der Server, kein Host. Alle drei Sub-Schritte gebaut, playtest-grün (+7 Invarianten), Zwei-Browser-verifiziert (`smoke-webrtc.cjs`):
- **B1 ✅ der `subworld-net`-Kanal.** Ein neuer Mesh-Nachrichtentyp `subworld-net` (`{worldId, data}`) — Zeile für Zeile das `companion-say`-Muster (Kanal-`ALLOWED`-Whitelist + expliziter signaling-server-Handler). `_portalNetReceive` macht aus einem `ws-send` einen `subworld-net`-Broadcast via `p2pSend` (broadcastet nur an Peers — der Sender bekommt seinen Verkehr nicht zurück, wie ein echter Relay-Server). `ws-open`/`ws-close` verfolgen die offenen Kanäle des iframes; `_portalNetDeliver` (der neue Empfänger) stellt eine mesh-empfangene Nachricht als `ws-recv` in jeden offenen Kanal zu.
- **B2 ✅ die Sub-Raum-Eingrenzung.** Der Sub-Raum-Schlüssel ist der Welt-Pfad (`po.world`); `_portalNetDeliver` verwirft eine Nachricht, deren `worldId` nicht zum eigenen Portal passt — sonst sähe ein Mesh-Mitspieler ohne Portal (oder in einem anderen Portal) fremden Sub-Welt-Verkehr.
- **B3 ✅ Rate-Limit + Größen-Deckel.** `_portalNetReceive` deckelt mit einem Fenster-Zähler (`SUBWORLD_NET_RATE_MAX` 120/s) + verwirft Übergröße/Nicht-String (`SUBWORLD_NET_MAX_BYTES` 16 KiB) auf BEIDEN Pfaden; der signaling-server deckelt als Backstop.
- **Akzeptanz ✅:** zwei Browser betreten dasselbe Relay-Multiplayer-Portal; A's `ws-send` erscheint bei B als `ws-recv` — peer-to-peer, kein echter Server (`smoke-webrtc.cjs`, beide Richtungen). Trägt Relay-Welten (Server = blosser Rebroadcast: viele einfache .io-Spiele, geteilter Zustand per Broadcast); NICHT Welten mit autoritativer Server-Rechnung (das ist B-JS-Compute).

**Phase C — das Gruppen-Portal ✅ komplett (V8.77).** Ziel: öffnet einer ein Portal, bekommen die anderen einen „mitkommen?"-Prompt. Alle drei Sub-Schritte gebaut, playtest-grün (+18 Invarianten), Zwei-Browser-verifiziert (`smoke-webrtc.cjs`):
- **C1 ✅ der `portal-invite`.** `enterPortal` ruft `_p2pBroadcastPortalInvite()` — broadcastet einen `portal-invite` (`{worldId, label}`, Mesh-Nachricht, Zeile für Zeile das `companion-say`-Muster: `ALLOWED`-Whitelist + signaling-server-Handler). Nur ein Multiplayer-Portal lädt ein; `_resolvePortalWorldId` löst die worldId aus dem Portal-Welt-Pfad gegen `_libraryWorlds()` auf (eine nicht-library-bekannte Welt lädt niemanden ein). `aimBlueprintAtWorld` trägt jetzt `multiplayer` aus dem Eintrag.
- **C2 ✅ der Prompt.** `_p2pHandlePortalInvite` legt die Einladung in `state.p2p.pendingInvite` + rendert `#portal-invite-banner` (ein fixes Tor-grünes Overlay-Element mit Mitkommen-/Schließen-Knopf). Gegated: nicht, wenn der Empfänger selbst gerade in einem Portal ist; verlässt der einladende Peer das Mesh, verfällt die Einladung.
- **C3 ✅ annehmen → mitreisen.** `joinPortalInvite` ruft `obtainPortalForWorld` + betritt das Portal direkt via `_buildPortalOverlay` — der Overlay erzwingt `multiplayer:true` (der Empfang der Einladung BEWEIST, dass die Welt multiplayer ist), sodass die B2-Sub-Raum-Eingrenzung die Gruppe verbindet. Hat der Spieler die Welt nicht, ehrlicher Hinweis (erst aus dem Welt-Katalog holen — W16).
- **Akzeptanz ✅:** A betritt ein Multiplayer-Portal, B bekommt den Prompt, nimmt an, beide sind im selben Multiplayer-Portal (`smoke-webrtc.cjs`).

**Phase B-JS-Compute Phase 1 ✅ komplett (V8.79) — der Compute-Host.** Für Welten, deren Server eine echte autoritative JS-Logik ist (nicht blosser Relay): ein Peer der Gruppe wird Compute-Host. `portalMeta.serverMode` (`relay`/`js-compute` — `_sanitizePortalMeta` whitelistet es + erzwingt `multiplayer`, `aimBlueprintAtWorld` trägt es, `buildStateSnapshot` persistiert es feldweise). Host-Wahl OHNE Präsenz-Tabelle: wer ein js-compute-Portal direkt betritt, wird Host (`enterPortal` → `computeRole:"host"`); wer einer Phase-C-Einladung folgt, wird Gast des Einladenden (`joinPortalInvite` → `hostPeerId = inv.peerId` — die Einladung trägt die Host-Identität schon). Der Host baut ein zweites, verborgenes null-origin-iframe — den Server-Kontext (`?anazh-server=1`, der save-server injiziert `PORTAL_SERVER_SHIM`, ein `WebSocketServer`-Global; fremder Server-Code läuft `sandbox="allow-scripts"` ALLEIN). Host-geroutetes Transport: ein Gast-`ws-send` geht NUR an den Host (`subworld-srv`, kanal-exklusiv), der Host feeds es in den Server-Kontext, die Server-JS rechnet, die Antwort kommt gezielt zurück (`subworld-cli`). +19 Invarianten, Zwei-Browser-verifiziert (`smoke-webrtc.cjs` — eine laufende Summe 12=7+5, von EINEM Server autoritativ berechnet).

**Phase B-JS-Compute Phase 2 ✅ komplett (V8.80) — Host-Migration.** Phase 1's ehrliche Grenze: verlässt der Compute-Host das Mesh, endet die Sub-Welt. Phase 2 schliesst sie: der Compute-Host annonciert seine Mitglieder-Roster (`subworld-roster`, kanal-exklusiv) an jeden Gast bei jeder `serverConns`-Änderung; jeder Gast cacht sie (`_portalRosterReceive`). Verlässt der Host das Mesh, ruft `_p2pRemovePeer` bei jedem Gast `_portalMigrateHost` — jeder wählt aus der gecachten Roster deterministisch denselben Nachfolger (die kleinste peerId ohne den Abgegangenen — wie die W7-P1-Initiator-Regel; kein Wahl-Protokoll, kein Announce). Der Nachfolger (`_portalPromoteToHost`) flippt `computeRole` guest→host + baut einen FRISCHEN Server-Kontext (`_portalSpawnServerContext`, aus `_buildPortalOverlay` extrahiert); die übrigen Gäste zeigen auf ihn + melden ihre Verbindung neu an. Ehrliche Grenze: der Server-Zustand geht verloren (der neue Kontext startet frisch — ein Handoff bräuchte, dass der alte Host vor dem Gehen serialisiert, unmöglich bei einem Absturz). +12 Invarianten, Zwei-Browser-verifiziert (`smoke-webrtc.cjs` — A verlässt das Mesh, B wird Compute-Host, B's Verkehr läuft durch B's frischen Server, die Summe startet bei 0).

**Phase B-WASM (per-Projekt, offen).** Ein Rust→WASM-Server in einem Peer-Tab, oder die Brücken-Welt (externer Server). Bewusst „per-Projekt, nicht automatisch" — manche native Server portieren sauber, manche nie; der Auto-Vendor klassifiziert ehrlich. Eine kleine Naht bleibt: `serverMode` durch die ganze Vendor-/Mesh-Kette tragen, damit eine VENDORTE js-compute-Welt sich selbst deklariert (wie V8.78 für `multiplayer` — V8.79/V8.80 deklarieren `serverMode` über die Portal-Nähte, nicht die volle Vendor-Kette).

**Akzeptanz (Gesamt-W17):** eine Gruppe in einem AnazhRealm-Raum tritt gemeinsam durch ein Portal in eine vendorte Relay-Multiplayer-Welt; sie sehen einander dort, ihr Verkehr fließt peer-to-peer über das Mesh, kein echter Server existiert.

**Ehrliche Grenzen des Bogens:**
- Ein Browser-Tab als Compute-Host ist schwach (Hintergrund-Drosselung, begrenzte CPU, schließt jederzeit) — Host-Migration mildert, beseitigt es nicht. Gut für Koop, rau für kompetitive Twitch-Spiele.
- Latenz: ein peer-gehosteter Server hat die Latenz des Hosts.
- Rust→WASM ist nicht automatisch — manche native Server portieren sauber, manche nie. Der Auto-Vendor klassifiziert ehrlich; eine nicht-portierbare Welt wird eine Brücken-Welt, kein Versprechen-Bruch.
- Eine Brücken-Welt braucht einen externen Server — Repo + Mesh tragen sie nicht allein. Aber der Eintritt bleibt das AnazhRealm-Portal, mit der Gruppe.

**Vision-Wort:** „**Man muss die Bibliothek nicht verlassen, um gemeinsam ein Buch zu lesen.** Manche Bücher liest man von den Regalen der Bibliothek selbst, manche durch ein Fenster zu einem fernen Turm — aber immer von hier aus, immer zusammen."

---

### Offene Punkte nach V8.80 — eingeplant (Audit 2026-05-18)

Ein Selbst-Audit nach V8.80 sammelte alle ehrlich-benannten offenen Punkte und plant sie hier nach Priorität ein. Drei Kategorien: **konkrete Wellen** (klar umrissen, abschließbar), **bewusst per-Projekt** (kein Versäumnis — die Heilige Lektion korrekt angewandt) und **Doc-Sync**.

**Konkrete Wellen — in Reihenfolge:**

| # | Welle | Was | Aufwand | Stand |
|---|---|---|---|---|
| 1 | **W12 P3-Härtung** | `_portalReceiveEvent`-Rate-Limit — der Portal-Rückkanal (Sub-Welt → Heimat-Journal) deckelt die Ereignisse je Sekunde (Fenster-Zähler, Spiegel von `_portalNetReceive` B3). V8.53 als „W14 (fremde Welten) MUSS" geflaggt; mit den vendorten Sandbox-Welten (V8.70/71/73) ist das Szenario real geworden — eine flutende fremde Welt verdrängte sonst das 200-Eintrag-Journal in Sekunden. | ~1 Session | ✅ **live (V8.81)** |
| 2 | **W17 P-Vendor** | die `serverMode`-Vendor-Ketten-Naht — `serverMode` fliesst durch die ganze Vendor-/Mesh-Kette (Spiegel von V8.78 für `multiplayer`): `_sanitizeImportedManifest`, `_vendorRegisterWorld`, `vendorWorldBundle`/`-FromRepo`, `_p2pBuildCatalog`/`-Sanitize`/Katalog-Signatur, signaling-server-`soul`-Handler, Bündel-Transfer, `exportWorldManifest`, ein `serverMode`-Vendor-Bedienelement. Ohne sie verliert eine VENDORTE js-compute-Welt still ihren `serverMode` → sie degradiert zu relay, die autoritative Server-JS läuft nie. | ~1 Session | ✅ **live (V8.82)** |
| 3 | **W4 V2** | Lofi-Musik-Schicht (Pad-Layer 60 BPM, emotion-moduliert) — siehe §2-Tabelle. | 1-2 Sessions | ✅ **live (V8.84)** |
| 4 | **W16-Politur** | (a) Hash-Verifikation des empfangenen Welt-Bündels (der Katalog trägt den Content-Hash, der Empfänger prüft ihn nach dem Pull — bei Abweichung wird die Welt verworfen); (b) ein weicher Pull-Timeout (`_p2pCheckBundlePullTimeout` aus `p2pTick` gibt einen hängenden Pull nach 30 s frei). | ~1 Session | ✅ **live (V8.96)** |
| 5 | **W10 ext.** | ✅ **VOLLSTÄNDIG** — vier weitere Affordances, räumliche Analyse + Welt-Reaktion, KEIN Form-Whitelist. `radiating` (V8.97) + `broadcasting` (V8.98) + Stärke-Politur (V8.99, die Wirkung skaliert mit der Substanz) + `balancing` (V9.00) + `lifting` (V9.01 — ein magie-geladenes leichtes Compound erzeugt ein Auftriebs-Feld, die erste physik-gekoppelte Reaktion). Sieben Affordances, ein Muster. | erledigt | ✅ 4/4 + Stärke-Politur |
| 6 | **W15-Politur** | Branch-Namen mit Slash (`feature/x`) im GitHub-Fetch auflösen (braucht eine SHA-Auflösung vor der Trees-API). | ~0.5 Session | ✅ **live (V9.02)** |
| 7 | **W6.G P3-Rest** | Terrain-Höhlen/Überhänge/Klippen. **Phase 1 ✅ (V9.03 — Felsformationen)**: `felsbogen` + `felsturm` als emergente Compound-Architekturen. **Echte Höhlen/Tunnel/Überhänge** sind seit V9.07 in den **Voxel-Terrain-Bogen** überführt (siehe unten — der Schöpfer-Reframe: das Heightfield wird ein 3D-Dichte-Feld; die alte „Portal-Höhle Phase 2" ist damit überholt). | Phase 1 erledigt; der Rest → Voxel-Bogen | ✅ Phase 1 (V9.03); Rest → Voxel |
| 8 | **W6.G P4 — das Terrain wird Materie** | Schöpfer-Befund: alles Materielle spricht die Hylomorphismus-Sprache, nur das Terrain nicht — der Boden abbauen gab nichts. Ein Grabe-Hieb yieldet jetzt Material aus `_terrainMaterialAt` (die dominante `worldFieldAt`-Achse → erde/stein/glut/quarz) — die Farbe = das Material. Kein Voxel-Rewrite, keine Biom-Tabelle. | erledigt | ✅ **live (V9.04)** |
| 9 | **Visuelle Synergie Struktur/Terrain** | Volumenkörper (Bauwerke, Felsen) wirken aufgesetzt-starr auf dem Terrain-Sheet — kein Einbetten, keine Verzahnung (Schöpfer-Befund V9.03). Ein Sockel/Saum am Strukturfuss, leichte Terrain-Verformung um die Standfläche, weniger Box-Starrheit. Ästhetik-Welle. | 1-2 Sessions | 🔴 offen |

#### W4 V3 — die generative Symphonie (Schöpfer-Wunsch 18.05.2026) — ✅ VOLLSTÄNDIG (V8.85-V8.93)

Der Schöpfer-Befund nach V8.84: die Lofi-Schicht ist „noch starr, hardcoded, keine Melodien" — „Symphony, doch ein Brummen". Die Antwort: Musik wächst aus wenigen Regeln + einem Seed, wie die Welt selbst. Ein Song = `worldMeta.seed` + Regel-Schichten; jede Welt bekommt ihr eigenes Lied, es atmet mit Emotion/Welt-Feld/Tageszeit. Genre (Jazz/HipHop/Lofi) = ein **Parameter-Preset** EINER Engine, kein eigenes System. Alle vier Phasen sind gebaut (V8.85 Harmonie, V8.87/90 Melodie, V8.91/92 Groove, V8.93 Orchester); ein Genre-Wähler-UI bleibt eine benannte kleine Folge-Naht. Vier Phasen:

| Phase | Was | Stand |
|---|---|---|
| 1 — Harmonie | die feste Akkord-Schleife → eine seed- + emotion-getriebene funktionale Markov-Progression (Tonleiter + Stufen-Übergangs-Gewichte; joy/hope → helle Stufen, sorrow → dunkle) | ✅ **live (V8.85)** |
| 2 — Melodie | eine Lead-Stimme improvisiert über den aktuellen Akkord (Akkord-/Durchgangston-Regel, Kontur, Dichte aus Emotion) — das fehlende „keine Melodien" | ✅ **live (V8.87)** |
| 3 — Groove | eine Rhythmus-Schicht (Kick/Snare/Hihat synthetisch) + Swing; Genre = Parameter-Preset (Swing, Tempo, Akzente, Timbre) | ✅ **live (V8.91)** — Kick/Snare/Hihat + Swing; Genre-Wähler-UI eine kleine Folge-Naht |
| 4 — Orchester | mehr Synth-Stimmen (Bass folgt den Akkord-Wurzeln, Pad, Lead), Stimmen-Zahl wächst mit der Welt-Stimmung | ✅ **live (V8.93)** — Bass auf den Kick-Schritten + emotion-gesteuerte Oktav-Dopplung des Pads |

**Tradeoff:** generative Musik kann ziellos klingen — jede Phase braucht ein Schöpfer-Browser-Ohr (wie die Shader: headless prüft Funktion, der Browser prüft Erfahrung).

**Bewusst per-Projekt / dauerhaft aufgeschoben (kein Versäumnis — die Heilige Lektion):**
- **B-WASM** — ein Rust→WASM-Server im Peer-Tab, Stufe 4 der Server-Taxonomie. Kein baubares Feature: manche native Server portieren sauber nach `wasm32`, manche nie; der Compute-Host-Mechanismus (V8.79/80) trägt einen wasm-Server strukturell schon. Vorbedingung: Binär-Asset-Vendoring + eine echte Test-Welt. Spekulativ zu bauen verletzte „keine Validierung für Szenarien, die nicht eintreten".
- **Binär-Asset-Vendoring** — der Vendor-Pfad trägt nur Text; `.png`/`.glb`/`.wasm` werden gefiltert. Wird konkret, sobald B-WASM eine echte Welt hat (dann base64-kodiert mitschreiben).
- **fetch/XHR/RTC-Transport-Shims** — Phase A shimt nur `WebSocket`; die übrigen Netz-APIs sind bewusste spätere Schichten (gebaut, wenn eine Sub-Welt sie braucht).
- **save-server-lose Verteilung** (Service-Worker) — eine eigene Architektur-Schicht.

**Doc-Sync (mit diesem Audit erledigt):** §1-Header V8.70→V8.80; Ring-5-Zeile (war „🔴 offen", ist seit V2 live); der 6.G-Phase-3-Text in der „Welle 6 ALT"-Tabelle (listete W6.G4-erledigte Punkte noch als offen). Rest-Drift im historischen „Welle 6 ALT"-Block (z. B. 6.H Phase 2E) bewusst stehen gelassen — der §2-Tabellenkopf ist die kanonische Status-Quelle.

---

#### Der Voxel-Terrain-Bogen — das formbare Terrain (geplant, 19.05.2026)

**Schöpfer-Einsicht nach V9.06:** „Voxel-Terrain scheint der wahre Weg — alles andere fake, nicht die volle Vision." Richtig. Das Heightfield ist eine HALB-formbare Welt: man kann Säulen heben/senken, nicht schnitzen. Der Felsbogen (V9.03, ein Trilithon AUF dem Terrain) und die Portal-Höhle (ein separater Raum) sind ehrliche Ingenieursarbeit MIT einem Heightfield — aber Workarounds. Die Vision (§1.3 fraktal, der Spieler als Co-Schöpfer, Materie ist formbar) verlangt, dass der **Boden selbst** wahre, formbare Materie ist: echte Tunnel, echte Höhlen, echte Überhänge — in den Hügel geschnitzt, nicht daneben gestellt.

**Zur Heiligen Lektion:** sie warnt vor *Komplexität OHNE Fundament* (der 19-Modul-Kollaps). Ein Voxel-Terrain ist NICHT 20 Module — es ist EIN Subsystem (das Heightfield) durch seine wahrere Form ersetzt, auf einem heute soliden Fundament (~2850 Invarianten, ein erprobtes Chunk-System). Es ist ein grosser Wachstumsring, kein Re-Komplexifizieren — solange er **phasiert + parallel + jede Phase playtest-grün** gebaut wird.

**Was das Projekt schon trägt** (es ist überraschend gut positioniert):
- Chunk-Streaming + Distance-Culling — bleibt unverändert.
- `btBvhTriangleMeshShape`-Kollision aus Chunk-Vertices — bleibt (ein Voxel-Mesh liefert dieselbe Kollision).
- `caveNoise.noise3D()` — die 3D-Noise-Infrastruktur ist schon da.
- `aField`-per-Vertex (Terrain-Shader) — trägt über.
- `chunkDeltas` (persistierte Welt-Modifikationen) — werden 3D-Edits statt 2D.
- V9.03 Felsformationen + V9.04 Terrain-als-Materie — bleiben (Felsen + Grabe-Yield AUF/IN dem Voxel-Terrain).

**Disziplin:** das Voxel-Terrain wird PARALLEL gebaut + bewiesen, bevor es das Heightfield ablöst — nie das Funktionierende brechen. Hinter einem Flag, bis solide.

**Phasen:**
1. **✅ ERLEDIGT (V9.07) — das Dichte-Feld + Surface Nets (ein Chunk).** `_terrainDensityAt(x,y,z)` — 3D-Noise, >0 fest / <0 Luft, mit echten Höhlen + Überhängen. `_voxelChunkGeometry` — Surface Nets (statt einer fehler-anfälligen 256-Marching-Cubes-Tabelle die explizite Zwei-Pass-Form). `_spawnVoxelTestChunk` + Chat `voxel test` — der Beweis-Chunk. Parallel-System, kein Eingriff ins Heightfield. +10 Invarianten.
2. **Kollision + Chunk-Streaming.** **Phase 2a ✅ ERLEDIGT (V9.08) — Voxel-Chunk-Kollision.** Der gemeshte Voxel-Chunk bekommt `btBvhTriangleMeshShape` über den generisch extrahierten `_buildStaticTriMeshCollision` (eine Sprache für Inseln + Voxel-Chunks); `_spawnVoxelTestChunk` baut + räumt die Kollision. **Phase 2b ✅ ERLEDIGT (V9.09) — der Voxel-Chunk-Ring.** Voxel-Chunks streamen um den Spieler (`_ensureVoxelChunkAt`/`_tickVoxelChunkStreaming`/`_pruneDistantVoxelChunks` — Spiegel des Heightfield-Streamings); `state.voxelTerrainActive` (Default aus) schaltet um — aktiv ruht das Heightfield (`_setHeightfieldDormant`: Mesh/Gras unsichtbar, Kollision aus dem physicsWorld, reversibel), der Voxel-Ring streamt; Chat `voxel terrain on`/`off`. Der Spieler geht durchgehend auf Voxel-Terrain. +9 Invarianten. **Phase 2b-Politur ✅ ERLEDIGT (V9.10/V9.11)** — Schöpfer-Browser-Befund „Übergänge nicht sauber, alles ein Biom": V9.10 = der 1-Zellen-Naht-Skirt (`_ensureVoxelChunkAt` mesht `dim+1` Zellen → Überlappung) + per-Vertex-Welt-Feld-Farbe (`_attachVoxelFieldColors`). V9.11 = die Naht-Wurzelheilung: in `_voxelChunkGeometry` Pass 2 aliaste `ci(dim,j,k)` an der Randebene in einen fremden Zell-Slot → ein Streck-Dreieck an jeder Chunk-Naht; ein `cv(i,j,k)`-Helfer (−1 für jeden out-of-range Index) schliesst es. V9.12 = der Chunk fasst das ganze Oberflächen-Band: er war ein 45-m-Würfel, das Band reicht aber ~`base±30` → Klipp-Löcher; `_voxelChunkGeometry` ist jetzt nicht-würfelförmig (`dimX/dimY/dimZ`), der Chunk eine 72-m-Säule. +8 Invarianten. **Phase 2c ✅ ERLEDIGT (V9.13) — per-Welt-Persistenz.** `setVoxelTerrainActive` schreibt `worldMeta.voxelTerrain` + `saveState` (das `gameMode`-Muster); `_restoreVoxelTerrain` aktiviert das Voxel-Terrain beim Welt-Aufbau, wenn das Flag gesetzt ist — eine Welt bleibt voxel-basiert über Reload + Welt-Wechsel. +6 Invarianten. (Das „Voxel"-Häkchen im Neue-Welt-Dialog ✅ V9.21 — eine Welt wird voxel-basiert geboren, `createNewWorld({voxelTerrain})` setzt `worldMeta.voxelTerrain`.)
3. **✅ ERLEDIGT (V9.14/V9.15) — 3D-Graben + Aufschütten.** `carveVoxelSphere` schnitzt eine Kugel „Luft", `fillVoxelSphere` schüttet eine Kugel „Fest" auf (gemeinsamer `_addVoxelEdit`, `mode:"carve"|"fill"`); der Edit landet in `worldMeta.voxelEdits` (persistiert, FIFO-256), `_terrainDensityAt` zieht ab / addiert, die Voxel-Chunks werden neu gemesht. LMB gräbt, RMB schüttet auf (bei aktivem Voxel-Terrain ohne Bau-Modus); Chat `voxel carve`/`voxel fill`. +13 Invarianten. Der Voxel-Boden ist voll formbar. **Politur (V9.16)**: die Voxel-Normalen kommen aus dem Dichte-Gradienten (`−∇d`) statt aus `computeVertexNormals` — kein hartes Facetten-Rauten-Muster mehr. **Phase 3c (V9.17)**: der Material-Erhaltungs-Kreis — im pfad-Modus kostet das Aufschütten Material aus dem Inventar (`_voxelFillGate`, Spiegel von `_buildMaterialGate`), in frieden + schöpfer frei.
4. **✅ ERLEDIGT (V9.18 + Politur V9.19 + Grösse V9.20) — Höhlen + Überhänge + Massstab in der Generierung.** `_terrainDensityAt` trägt: eine fraktale 2D-Oberfläche aus drei Oktaven (kontinental `0.0042×26` ≈ 35 Chunks, ridged `(1−|noise|)²×22` für Grate/Felswände, fein `0.045×4`), die zwei V9.17-3D-Roughness-Bänder (Crags, Überhänge) + Wurm-Höhlen aus EINEM ridged-Noise-Feld (`1−|noise3D|`, der Grat folgt der Noise-Nullfläche → zusammenhängende begehbare Kavernen). Eine Tiefen-Hüllkurve hält die Höhlen zwischen `surf-6` und `base-28`. Der Voxel-Chunk wuchs mit dem Band (V9.20: `dimY` 40→68, `oy=base-50`, 122-m-Säule — fasst `base-50..base+72`, die V9.12-Garantie hält). V9.19 heilte zwei V9.18-Befunde (feines Band restauriert, Höhlen aus einem Feld), V9.20 den V9.19-Befund (Massstab durch Oktaven-Hierarchie). +3 Invarianten.
5. **Materialien + Shader + Politur + Ablösung.** Cel-Shading (MeshToonMaterial), per-Vertex-Welt-Feld-Farbe (V9.10), Terrain-Material-Harvest (V9.04, geteilt seit V9.14) sind ✅ live. **Voxel-Gras ✅ V9.22** — der Voxel-Boden grünt mit eigenem Instanced-Gras. **Phase 5a ✅ V9.23 — Voxel als Default für neue Welten** (Schöpfer-Wahl „schrittweise"): `createNewWorld` baut neue Welten per Default voxel-basiert, die Dialog-Checkbox ist zum Heightfield-Opt-out gekippt; alte Welten + die Eingangs-Welt behalten ihr Heightfield. **V9.24 — die Verbindungen geheilt**: der Sicht-Ring-Regler greift jetzt in einer Voxel-Welt (`_voxelChunkConfig().ringRadius` folgt `chunkRingRadius`), und die Welt-Affinitäts-Vegetation streamt mit den Voxel-Chunks (`_populateVoxelChunkVegetation`, Strukturen auf dem Voxel-Boden). **Phase 5b ✅ V9.25 — die Voxel-Welt wird höhen-ehrlich**: `getTerrainHeightAt` ist voxel-aware (`_voxelSurfaceY`), Wasser/Killplane/`findSurfaceAbove`/Kreatur-Spawn/Genesis-Plattform erben die wahre Höhe. **Phase 5c-Start ✅ V9.26**: (a) Chunk-Loch-Heilung — `dimY` 68→80, `oy=base-58`, Marge ~22 gegen ridged-Spike-Löcher am erweiterten Sicht-Ring (der V9.20-Chunk passte nicht für die Rand-Chunks bei Sicht-Ring 4-8); (b) Migrations-Flip in `ensureWorldMeta` — eine GELADENE alte Welt ohne `voxelTerrain`-Flag wird voxel-basiert; eine FRISCHE Eingangs-Welt (Playtest, brandneuer Spieler) bleibt heightfield; ein expliziter Heightfield-Opt-out bleibt heightfield. **Phase 5c.1 ✅ V9.27 — die Heightfield-Generierung für Voxel-Welten übersprungen**: der Gate in `generateTerrainWithParameters` liest `worldMeta.voxelTerrain` (von V9.26-Migration + `_preloadActiveWorldMeta` gesetzt, BEVOR `generateNewWorld` läuft); bei `true` wird der 64-Chunk-Initial-Loop ganz übersprungen, das `terrainMaterial` bleibt erhalten (Reversibilität: `voxel terrain off` lädt vom Streaming-Ring nach). +3 Invarianten. **Phase 5c.1+ ✅ V9.28 — V9.25 Phase 5b ehrlich abgeschlossen + heightData-Skip**: (a) `updateCreatures` war der letzte missed Höhen-Konsument aus V9.25 (las `groundHeightField` direkt am voxel-aware `getTerrainHeightAt` vorbei) — jetzt route auch dieser Pfad voxel-aware; (b) damit liest in einer Voxel-Welt niemand mehr `groundHeightField`/`minHeight`/`maxHeight` → die 256×256×3-Float-Allokation (~768 KB) + die 65k-Noise-Schleife wird komplett übersprungen, der Heightfield-Waterfall-Loop (las heightData direkt) mit-gegated. +7 Invarianten. **Noch offen — die grosse 5c-Aufräumarbeit**: (c) der Ammo-Heap-Leck-Fix: `Ammo.destroy(body)` cascadiert NICHT zu seinen Shapes/MotionStates/TriangleMeshes — der heightfield-Chunk-Cleanup in `generateTerrainWithParameters` (Zeile 13242+) lässt `btTriangleMesh`/`btBvhTriangleMeshShape`/`btDefaultMotionState` leaken. Spiegel des V8.26-§6.2-`wallBoxes-Cleanup`-Audit-Musters auf Heightfield-Chunks anwenden. Eigene saubere Welle, ~1 Session. (d) die Heightfield-Code-Entfernung (`_terrainHeightAtWorld`, `ensureChunkAt`, `generateChunk`, `groundHeightField`, `_setHeightfieldDormant`, `populateChunkVegetation`-Heightfield-Pfad); (e) die Test-Suite-Umschreibung — der Playtest läuft heute auf der Heightfield-Eingangs-Welt; beim Eingangs-Welt-Flip werden alle heightfield-spezifischen Invarianten auf Voxel umgeschrieben. Eine eigene grosse Welle, sobald die Migrations-Erfahrung gefestigt ist.

**Ehrliches Risiko:** gross. Marching Cubes ist rechenintensiver als ein Heightfield-Grid; die Save-Migration alter Heightfield-Welten; die schiere Menge (Mehr-Sessions-Bogen). Darum die Disziplin: parallel, phasiert, jede Phase grün — und ein Browser-Beweis pro Phase (headless prüft die Mechanik, das Schöpfer-Auge die Erfahrung).

---


Alle drei Sub-Schritte in einem Commit, playtest-grün (+6 Invarianten): (1) `_lofiWorldField` → `_lofiApplyWorldTimbre` färbt die Klangfarbe (`lebendig` → Pad-Filter 750-1050 Hz, `dichte` → `bassGain` 0.40-0.56, `magieleitung` → verstimmter Oktav-Schimmer, `glut` → schärferes Hihat); (2) `_lofiNextDegree` bekommt den schwachen Welt-Feld-Bias (Gewicht 0.4 gegen Emotion 0.8 — seed-fix gemessen, dass die Emotion dominant bleibt); (3) `_lofiNearResonantArchitecture` gated die Pad-Stimmen-Dopplung — ein resonantes Bauwerk „singt mit". Synergie-Welle, kein neuer Stamm. Detail: `CLAUDE.md` V8.95.

Der Schöpfer-Befund nach V8.94: die generative Symphonie (W4 V3) ist hörbar — sie wächst aus Seed + Emotion + Tageszeit + Wetter. **Was noch fehlt**: die Musik hört das **Welt-Affinitäts-Feld** (die vier SimplexNoise-Tag-Schichten aus W6.G P2 — `worldFieldAt(x,z)` → `{lebendig, dichte, glut, magieleitung}`, die schon regeln, *was wo wächst*) und die **Architektur-Resonanz** (`computeSpatialTags.resoniert`) nicht. Eine `magieleitung`-Region klingt heute wie eine `glut`-Region. W4 V4 schliesst diese Synergie — kein neuer Stamm, keine neue Engine: die vorhandenen Welt-Daten fliessen in die schon stehende vierschichtige Symphonie ein. Eine **Synergie-Welle** — der Wert emergiert aus dem Verdrahten erprobter Systeme.

**Vision-Pfeiler**: §1.3 fraktal (eine Sprache — die 10 Material-Tags / das Welt-Feld — regelt Form, Verteilung UND jetzt Klang) + §1.4 multisensorisch (man HÖRT, wo man steht).

| Sub-Schritt | Was | Disziplin |
|---|---|---|
| 1 — Welt-Feld → Timbre | `worldFieldAt` am Spieler moduliert die Klangfarbe, nicht die Noten: `lebendig` → wärmeres Pad (sanftere Filter-Öffnung), `dichte` → tieferer/schwererer Bass-Anteil, `magieleitung` → ein Schimmer (eine leise verstimmte Oktav-Stimme, das `_lofiPlayChord`-Dopplungs-Muster), `glut` → eine Spur Spannung (eine kleine Sekunde / ein schärferer Hihat). | Timbre, NICHT Tonhöhe — die Markov-Harmonie bleibt die Noten-Autorität; das Welt-Feld färbt nur. |
| 2 — Welt-Feld → sanfter Harmonie-Bias | `magieleitung`/`lebendig` heben die hellen Markov-Stufen, `glut` die dunklen — ein **schwacher** zweiter Bias neben dem Emotion-Bias (V8.85). Die zwei Kanäle dürfen sich nicht überschreien: das Welt-Feld biast mit halbem Gewicht, Emotion bleibt der stärkere. | Anti-Doppel-Modulation — erst messen (über N Picks), dass Emotion dominant bleibt, bevor das Gewicht festgezurrt wird. |
| 3 — Architektur-Resonanz → Reichtum | steht der Spieler nahe einer Struktur mit hohem `computeSpatialTags.resoniert` (≥ `WORLD_EFFECT_THRESHOLDS.resonance_strong`), verdichtet sich die Symphonie — mehr Stimmen-Dopplung im Pad (das V8.93-`voiceMults`-Muster, jetzt resonanz-gegated statt nur emotion-gegated). Ein resonantes Bauwerk „singt mit". | spiegelt den schon bestehenden V8.84-`_applyCompoundWorldEffects`-Singing-Sinus — dieselbe Quelle, jetzt in die Symphonie statt einer Einzel-Sinus-Schicht. |

**Tradeoff** (wie W4 V3): generative Modulation kann ziellos klingen — jeder Sub-Schritt braucht ein Schöpfer-Browser-Ohr (headless prüft, DASS das Welt-Feld die Klangfarbe ändert; ob es SCHÖN klingt, prüft das Ohr). **Honest geschnitten**: W4 V4 ist die Synergie-Naht; ein dynamischer Genre-Wechsel (Jazz/HipHop/Lofi als Welt-Feld-abgeleitetes Preset) bleibt eine benannte spätere Folge-Naht, kein stilles Versprechen.

---

## 4. Meilensteine

Gruppierung der Ringe in größere Phasen mit deutlichen User-Eindrücken.

### Meilenstein A — „Lebendige Welt" (Ringe 2-Rest + 3 + 4)

**Ziel**: Welt fühlt sich lebendig an. Mensch + Welt sprechen, hören, fühlen.

- Ring 2 Phase 3-7 (DSL voll)
- Ring 3 (Emotionen)
- Ring 4 (Symphony)

**Geschätzter Aufwand**: 7-9 Tage  
**Wann „fertig"**: Welt reagiert hörbar und sichtbar auf den Spieler-Zustand.

### Meilenstein B — „Du bist jemand" (Ringe 5 + 6)

**Ziel**: Spieler-Identität + reichhaltigere Welt-Strukturen.

- Ring 5 (Soul)
- Ring 6 (architectureTemplates)

**Geschätzter Aufwand**: 3-4 Tage  
**Wann „fertig"**: Spieler ist nicht mehr der Würfel, Welt hat Dörfer und Tempel.

### Meilenstein C — „Welt lernt" (Ring 7)

**Ziel**: System wird intelligent.

**Geschätzter Aufwand**: 3-4 Tage  
**Wann „fertig"**: messbares Lernen über Zeit (Fitness-Score steigt).

### Meilenstein D — „Welten existieren" (Ringe 8-10)

**Ziel**: Welten sind portierbar, fusionierbar, gehören jemandem.

- Ring 8 (Identität)
- Ring 9 (Export/Import)
- Ring 10 (Fusion)

**Geschätzter Aufwand**: 7-9 Tage  
**Wann „fertig"**: ein Stammbaum aus 3+ Welten existiert, dokumentierbar.

### Meilenstein E — „Begegnung" (Ring 11)

**Ziel**: Mehrere Spieler in einer Welt.

**Geschätzter Aufwand**: 5-7 Tage  
**Wann „fertig"**: Multi-Browser-Tab-Demo läuft.

### Meilenstein F — „Bibliothek von Alexandria" (Welle 12-14 + 7)

**Ziel**: AnazhRealm wird nicht eine Welt, sondern ein Tor zu Welten. Der Spieler geht durch Portale in fremde Engines, trägt eine souveräne Identität, browst eine Registry anderer Welten.

- Welle 12 (Welt-Portal) ✅ — das Tor in fremde Engines
- Welle 13 (Vibe-Pass) ✅ — die souveräne Identität
- Welle 14 (Bibliothek) ✅ — die Welt-Registry (Phase 1+2+3 komplett, V8.58/V8.60/V8.61; KI-Übersetzer ✅ vollständig — V8.68 Manifest, V8.69 deklarative Szene; Untrusted-Welt-Tor ✅ V8.70 — eine echte fremde Engine läuft null-origin sandgesichert; Auto-Vendor-Pfad ✅ komplett V8.71/V8.72 — ein fremdes Bündel ODER ein GitHub-Repo dockt sandgesichert an; Mesh-Welt-Verteilung W16 ✅ komplett V8.73/V8.74 — eine vendorte Welt reist peer-to-peer + die Mesh-Bibliothek ist browsbar; W17 Multiplayer-Sub-Welten ✅ vollständig — Phase A V8.75 + B-Relay V8.76 + C V8.77 + Multiplayer-Welt-Deklaration V8.78 + B-JS-Compute Phase 1 V8.79 + Phase 2 Host-Migration V8.80, offen nur B-WASM per-Projekt)
- Welle 7 (Compute-Sharing) ✅ — WebRTC-Mesh (Phase 1-4 komplett, V8.62-V8.66; Kanäle → Welt-Snapshot → LLM-Pool → Public-Lobby + Multi-User-Bau-/Kreatur-Sync)

**Wann „fertig"**: der Schöpfer browst im Bibliothek-Tab fremde Welten, holt sich ein Portal, geht hindurch — und seine Identität reist mit.

**Gesamt-Roadmap**: ~25-33 Arbeitstage in fokussierten Sessions, realistisch 3-4 Monate kalendarisch.

---

## 5. Querschnitts-Themen

Themen, die kein eigener Ring sind, sondern durch alle Ringe ziehen.

### 5.1 Test-Coverage (CI-Gate)

- Stand V9.20: **~2910 Invarianten** in `scripts/playtest.cjs` (Headless-Chromium, ~25 s Log-Sammlung) + `audit-strict.cjs` (5 generische Audit-Schichten) + `smoke-multiuser.cjs` + `smoke-webrtc.cjs` + `smoke-translated.cjs` + `smoke-sandbox.cjs` + `smoke-vendor.cjs` + `smoke-shim.cjs`
- Pro Welle +6-35 neue Invarianten (Effekt sichtbar, kein Crash, Save-Schema OK, Emergenz statt Mechanik)
- Disziplin: nach jeder substanziellen Änderung das Playtest-Gate, nicht nur Code-Analyse

### 5.2 Performance

- Heute: 120 fps mit BVH-Triangle-Meshes, im Headless-Playtest 52 fps avg
- Eskalations-Pfade falls FPS irgendwann zu niedrig wird:
  1. `btTriangleIndexVertexArray` statt `btTriangleMesh` (~2× schneller Trace)
  2. LoD pro Chunk (weiter weg = niedrigere Vertex-Dichte)
  3. Web Worker für Chunk-Generation
- Performance-Invariante im Playtest: avg-FPS muss >30 bleiben

### 5.3 CSP & Security

- Stand V8.57: CSP **strict** seit Ring 2 Phase 6 — `script-src` ohne `eval`/`inline`, nur dokumentierte Vendor-Konzessionen (`wasm-unsafe-eval` für Ammo, `unsafe-inline` style für Three.js, `worker-src blob:`). CI-Gate erzwingt „kein dynamisches Auswerten im eigenen Bundle".
- Multi-User: eingehende DSL läuft durch dieselbe `dslRun`-Sandbox wie eigene Programme (Op-Whitelist + Budget-Limits). `NON_BROADCASTABLE_OPS` schützt Spieler-private Ops, `CREATURE_PROPOSED_OPS` die Kreatur-Welt-Aktion.
- W13 Vibe-Pass: WebCrypto-Ed25519 nativ (keine CSP-Lockerung), privater Schlüssel global in `localStorage`, NIE im teilbaren Welt-Save.

### 5.4 Doku-Pflege

- Nach jedem Ring: `state-of-realm.md` §3 (Matrix), §4 (Commit-Archiv), §5 (Pfad-D-Tabelle) aktualisieren
- Nach jedem Meilenstein: `roadmap.md` Status-Updates + nächste Phase aufschlagen
- `CLAUDE.md`: bei substanzieller Architektur-Änderung Gotchas-Sektion ergänzen
- `nexus-dsl.md`: bei neuen DSL-Primitives ergänzen

### 5.5 Browser-Reichweite

- Heute: Chrome/Edge funktionieren, andere Browser ungetestet
- Vor Ring 11 (Multi-User): cross-browser smoke test (Safari, Firefox)
- WebRTC kann in manchen Setups problematisch sein → Fallback-Plan: WebSocket über signaling-server

---

## 6. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Performance bricht bei Ring 7 ein (brain.js + viele Chunks) | mittel | Performance-Invariante hält das auf; falls Crash: brain.js training in Web Worker auslagern |
| Multi-User (Ring 11) ist mehr Arbeit als geschätzt | hoch | Falls Zeit knapp: V1 nur Position-Sync, kein DSL-Sharing |
| Save-Schema-Bruch bei Ring 8 frustriert bestehende Spieler | mittel | Schema-Version + Migration-Hook (Phase 4) muss vorher sauber stehen |
| Welt-Fusion (Ring 10) ergibt unspielbare Resultate | mittel | Conflict-Resolution mit gewichteter Random-Wahl, Player kann manuell wieder „splitten" |
| Heilige-Lektion-Verstoß: irgendwann doch in Module gesplittet | hoch | jeder Code-Review prüft auf Stamm-Treue; bei Zweifel `state-of-realm.md` §2 nachlesen |
| CSP-strict bricht eine Browser-Funktion | niedrig | Phase 6 testet vor merge; Fallback: `'wasm-unsafe-eval'` für Ammo behalten |

---

## 7. Wann ist das Projekt „fertig"?

Es ist nicht fertig — es ist ein **lebendes Werk**. Aber es gibt natürliche Stops:

- **Nach Meilenstein A**: AnazhRealm ist eine lebendige Solo-Welt, fühlbar reaktiv. Eine spielbare Demo.
- **Nach Meilenstein C**: Welt lernt aus dem Spieler. Ein echtes „Ultiversum"-Erlebnis im Kleinen.
- **Nach Meilenstein D**: das Co-Creation-Werk hat Persistenz und Geschichte. Welten haben Eltern, Geschwister.
- **Nach Meilenstein E**: das Ultiversum ist offen. Spieler begegnen sich.

Nach E ist die Roadmap nicht zu Ende — neue Ringe (VR, prozedurale Quests, Welten-Marktplatz, KI-Mitspieler über die Anthropic API) werden dann sinnvoll. Aber dann ist es kein „Projekt aufbauen" mehr, sondern **eine Welt pflegen**.

---

## 8. Wie diese Doc gepflegt wird

- Nach jedem Ring-Abschluss: Status in §2 + §3 aktualisieren, Aufwand auf 0 setzen, **was tatsächlich umgesetzt wurde** kurz dokumentieren
- Nach jedem Meilenstein: §4 mit echtem Datum versehen
- Bei größeren Vision-Verschiebungen (z. B. neuer Pfeiler aus User-Feedback): §1 + `state-of-realm.md` §11 entsprechend ergänzen, dann hier neue Ringe ergänzen
- Beim Lesen aus einer neuen Session: zuerst §1 (Stand), dann §2 (Übersicht), dann den aktuellen Ring vertiefen

Die Roadmap ist **kein Vertrag**, sondern eine **Karte**. Wenn der Schöpfer mitten in der Reise sagt „eigentlich brauchen wir erst Y bevor X", wird Y eingeschoben und die Tabelle nachgezogen.

---

*Geschrieben nach Commit `9fcf1ff`. Wird nach jedem nennenswerten Schritt aktualisiert.*
