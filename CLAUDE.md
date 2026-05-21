# AnazhRealm – Projektgedächtnis für Claude

Diese Datei wird bei jeder Session automatisch geladen. Sie trägt **nur, was JETZT gilt** — den aktuellen Stand, die technischen Gotchas, die Konventionen. Drei getrennte Heimaten für die drei Zeit-Ebenen des Wissens:

- **JETZT** (diese Datei) — was gilt: Stand, Gotchas, Konventionen, Doc-Map.
- **DIE CHRONIK** (`docs/handover.md`) — die volle Wellen-Historie, jede Welle ein ausführlicher Eintrag, plus „wie du eine Session startest".
- **DER PLAN** (`docs/roadmap.md`) — was vorwärts kommt. Die Vision in `docs/state-of-realm.md`.

## Aktueller Stand (V9.43-d, 21.05.2026)

**Wo wir stehen:** eine Voxel-basierte 3D-Browser-Sandbox in einer Datei (`anazhRealm.js`, ~36 000 Zeilen). ~3000 Playtest-Invarianten grün, Audit-Strict 0 Failures. Der Playtest-Konsolen-Zähler driftet ±2-3 je Lauf — „Alle Invarianten OK" ist die Wahrheit, nicht die exakte Zahl.

**Letzte Arbeit — das Wasser-Ultiversum (V9.43-b..d):** die Hydrosphäre. `_computeHydrosphere` leitet aus der Voxel-Surface ein deterministisches Drainage-Netz ab (Flüsse/Seen/Wasserfälle); `_buildHydrosphereMeshes` rendert es; die Flüsse carven echte Betten ins Terrain (`_hydrosphereCarveAt`, Phase 7), Seen sind schwimmbar. Algorithmus + Wellen-Schnitt: `docs/hydrosphere.md`.

**Davor — der Stamm-Pflege-Bogen (V9.44-a..f), abgeschlossen:** ein Code-Hygiene-Bogen, reines verhaltensneutrales Refactoring (`docs/code-hygiene.md`). Die drei Kontrollfluss-Giganten zerlegt (`startEternalLoop` 696→157, `_renderWorkshopDOM`, `p2pHandleMessage`), Persistenz-Schema vereinheitlicht, kanonische Setter, Mesh-Router-Dispatch-Table, Konstanten konsolidiert. KEIN neues Modul, kein State-Manager — der Heiligen Lektion treu.

**Nächste Welle:** V9.43-e — Politur + Klang (Fluss-Rauschen, Wasserfall-Donnern); damit ist das Wasser-Ultiversum V9.43 vollständig.

**Ehrliche offene Rest-Grenze:** ~7 weitere Kontrollfluss-Funktionen >200 Zeilen (`loadState` 380, `generateTerrainWithParameters` 303, `_applyDayNightToScene` 287, `processChatCommand` 285, `_voxelChunkGeometry` 269, `_tickCreatureTaskDirection` 267, `fuseWorlds` 239) + vier 200+-UI-Builder (`_workshopRenderStatsPanel`, `renderLibraryUI`, `renderSoulEditorUI`, `renderPlayerEquipUI`). Standen nicht im V9.44-Audit-Scope — Kandidat für einen späteren Hygiene-Bogen, nicht jetzt.

## Projektüberblick

- **Was:** „AnazhRealm" – ein als **Ultiversum** entworfenes Co-Creation-Werk Mensch + KI. Aktuell technisch eine 3D-Browser-Sandbox in einer Datei. Vision: emotion-getriebene, fraktal-wachsende, multisensorische Welt; Mensch (Schöpfer/Null) + KI (Grok/Eins) erschaffen gemeinsam durch Chat. Vollständige Vision in `docs/state-of-realm.md`.
- **Stack:** Vanilla JS, Vendor-Libs in `vendor/` (Three.js r134, Ammo.js WASM, simplex-noise 2.4). TF.js wurde im Mai 2026 entfernt (toter Code). Lokaler Node-Save-Server. ESLint v9 + Prettier + GitHub-Actions-CI mit Playtest-Gate.
- **Branch:** Feature-Branch pro PR (`claude/<thema>`-Konvention, z. B. `claude/wave-6a-interaction-polish`). Niemals auf `main` pushen ohne explizite Anweisung.
- **Architekturkern:** Eine `AnazhRealm`-Klasse in `anazhRealm.js` (~36 000 Zeilen, Stand V9.43-d). State in `localStorage` + optional `anazhRealmState.json` über save-server. Globale Referenz: `window.anazhRealm`.

## Die heilige Lektion (Versionslog 03/2025)

Das Projekt durchlief eine 19-Modul-Phase, die unter eigener Komplexität kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wenn jemand vorschlägt „split alles in 20 Module", verletzt das diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

## Pfad D — Stamm + Wachstumsringe

Das Projekt wächst nach Pfad D: EIN Stamm (`anazhRealm.js`, eine `AnazhRealm`-Klasse), der Wachstumsringe ablegt — nie ein neuer Datei-Split (die Heilige Lektion). Der aktuelle Stand steht oben unter „Aktueller Stand". Die vollständige Ring-Übersicht 0-11+ (Aufwand, Vorbedingungen, Status) lebt in `docs/roadmap.md`; die Vision + Stand-vs-Vision-Matrix in `docs/state-of-realm.md`; die volle Wellen-Chronik in `docs/handover.md`.

## Wichtige Gotchas (technisch)

Kuratierte **quer-schneidende Stolperdrähte** — die Fallen, die in jeder Welle beißen, nach Domäne gruppiert. Die vollständige, chronologisch gewachsene Gotcha-Sammlung (jede Welle ihre Tiefen-Notizen, ~290 Einträge) lebt als `## Gotcha-Vollarchiv` in `docs/handover.md` — dort nachschlagen, wenn ein wellen-spezifisches Detail fehlt.

### Terrain + Chunks

- Voxel-/Heightfield-Chunks haben `position=(0,0,0)`, Vertices in Welt-Koords. NIEMALS in `state.rigidBodies` pushen — der Physik-Sync-Loop überschriebe sonst `mesh.position` und verschöbe den ganzen Chunk. Body über `mesh.userData.physicsBody` greifen.
- Visual = Collision per Konstruktion: jeder Chunk hat ein `btBvhTriangleMeshShape` aus EXAKT denselben Triangle-Indices wie sein `BufferGeometry`. Wer den einen Pfad ändert, ändert den anderen.
- Eine Quelle für die Voxel-Chunk-Geometrie (`_voxelChunkGeometry`), eine für Höhen (`getTerrainHeightAt(x,z)` — voxel-aware seit V9.25). ALLE Höhen-Konsumenten routen durch `getTerrainHeightAt`, NIE `state.groundHeightField[idx]` direkt (das ist in Voxel-Welten `null`).
- Player-Chunk-Math braucht den `+WORLD_SIZE/2`-Offset: `floor((playerX + 150) / chunkWorldSize)`. Vergessen = nahe Chunks werden gepruned.
- `state.voxelTerrainActive` ist seit V9.35 effektiv konstant `true` (alle Welten sind voxel-basiert, es gibt keinen Schreib-Pfad mehr). Die `if (state.voxelTerrainActive)`-Gates bleiben als Defense-in-Depth.

### Ammo / Physik

- `Ammo.btVector3`/`btTransform` allokieren WASM-Heap → immer `Ammo.destroy()` nach Gebrauch ODER den `state.tmpVec1/2`/`state.tmpTransform`-Pool + `setVec()` nutzen.
- `Ammo.destroy(body)` cascadiert NICHT zu Shape/MotionState/TMesh — jeder Build-Pfad MUSS die Auxiliars separat tracken + destroyen. Disziplin: VOR einer Ammo-Allokations-Welle `grep -n 'new Ammo\.' anazhRealm.js` laufen, ZUERST den `_disposeX`-Helper bauen, DANN den Body. Eine Sequenz von `new Ammo.*` in ein `partial`-Array sammeln + im `finally` ALLE räumen — sonst Heap-Snowball bei OOM partway.
- Der Player-Body schläft NIE: `forceActivationState(4)` (DISABLE_DEACTIVATION) bei der Erschaffung. Niemals `forceActivationState(1)` auf ihn rufen — er schliefe im Stand wieder ein (Stand-Sprung-Bug-Klasse).
- Das vendored `ammo.wasm.wasm` ist ohne `ALLOW_MEMORY_GROWTH` gebaut — `scripts/patch-ammo-memory.cjs` patcht den Heap-Header auf 256 MB (idempotent, automatisch via `postinstall`). Bei einem `ammojs3`-Vendor-Update: einmal `npm run patch:ammo`.
- CCD wird beim Player-Body-Spawn aktiviert. Statische Bodies (mass=0) gehen NICHT in `state.rigidBodies`.

### Sentinels + State

- „Noch nie passiert"-Zeitstempel sind `-Infinity`, NIE `0` — `0` ist ein gültiger Seitenstart-Zeitpunkt, und `now - 0 < cooldown` ist in den ersten `cooldown`-ms WAHR (ein Rate-Limit feuert dann fälschlich beim allerersten Aufruf). Muster: `map.has(k) ? map.get(k) : -Infinity`.
- `buildStateSnapshot`/`loadState` kopieren Baupläne/Kreaturen mit FESTEM Feld-Satz. Ein neues persistentes Feld MUSS in BEIDEN Stellen ergänzt werden (V8.59-Bug-Klasse: `portalMeta` fehlte im Restore → ein geholtes Portal verlor beim Reload seine Ausrichtung). Ein neues Welt-Katalog-/`soul`-Feld zusätzlich im `signaling-server.js`-Handler (feldweise Rekonstruktion).
- `state.p2p` + `state.vibePass` sind Laufzeit-/global-localStorage-State — NIE im Welt-Snapshot. Eine Welt-Datei wird geteilt/exportiert; ein privater Schlüssel darin leckte die Identität.
- Tag-Clamp [0,1] für die Stat-Pipe: `computePlayerStats`/`computeCreatureStats` clampen die Compound-Tags VOR den Stat-Formeln (Tags können bis ~3 reichen → sonst negative Speed). Tags >1 leben für Welt-Effekte weiter.
- Gekoppelte Felder über EINEN Setter: `state.sprintSpeed` MUSS `2× state.speed` sein → `_applyPlayerSpeed(v)` ist die eine Quelle (V7.72-Bug-Klasse: zwei Schreibpfade vergaßen die Kopplung).

### DSL / Multi-User

- `NON_BROADCASTABLE_OPS`: Spieler-private Ops (`player_*`, `set_mode`, Inventar, Kreatur-Tasks, `set_time_of_day`) gehen NIE über P2P. Enthält ein Programm irgendwo im AST einen davon, wird der GANZE Broadcast übersprungen.
- Welt-Geometrie-Ops (`terrain_steepness`, `terrain_base_height`, `modify_terrain`, `voxel_carve`/`voxel_fill`, `spawn_*`, `player_soul`) sind bewusst NICHT im `dslComposeAtomic`-Pool — der Nexus soll die Welt unter dem Spieler nicht willkürlich umpflügen.
- Eingehende Remote-DSL läuft durch dieselbe `dslRun`-Sandbox (Budget-Limits, Op-Whitelist, kein `eval`) wie eigene Programme. Loop-Schutz dreifach: `source`-Check in `dslRun`, eigene-peerId-Filter, Server schickt nie an die Quelle zurück.
- Ein neuer WS-Nachrichtentyp braucht einen EXPLIZITEN `signaling-server.js`-Handler (der die authoritative peerId stempelt) — es gibt keinen generischen Fallthrough. Kanal-exklusive Typen (`world-pull`, `llm-request`, `subworld-srv`, …) leben direkt in `_p2pHandleChannelMessage` (nicht WS-injizierbar).
- `processChatCommand` lowercased NUR `parts`; das Original-`command` behält sein Casing.

### Test / Playtest

- `setTimeout` INNERHALB `page.evaluate()` yieldet im Headless-Chromium nicht zuverlässig an `requestAnimationFrame`. Wer auf einen Loop-Tick warten muss: `evaluate` beenden, AUSSEN warten (`await new Promise(setTimeout)`), in einer ZWEITEN `evaluate` ablesen. Loop-getriebene Features deterministisch über `_gameLoopTick()` synchron treiben, nicht auf rAF warten.
- Headless-Teleport-Falle: `playerBody.setWorldTransform()` reaktiviert den Body nicht — ohne `body.activate(true)` fällt der Spieler nach einem Reset durch den Boden.
- Ammo-Binding-Lücken: nicht jede C++-Methode ist im JS-Binding (`btBoxShape.getHalfExtentsWithMargin()` wirft) — Größen via `THREE.Box3.setFromObject(mesh)` prüfen.
- Ein Test, der auf den rAF-Loop wartet, ist im Headless prinzipiell flaky — den Mess-Punkt an die MECHANIK legen, nicht an einen volatilen Proxy (ein FIFO-Cap, die Zufalls-Umgebung nach einem Autonom-Lauf). Derselbe Commit rot + grün = Fingerabdruck eines flaky Tests.

### Save-Server / CSP / Build

- Save-Server-POST nur auf localhost — auf CDN/GitHack stiller Skip, State lebt nur im `localStorage` (+ Download-Button als Backup). `anazhRealmState.json` ist NICHT git-getrackt; taucht sie getrackt auf, ist es ein Bug (`git rm --cached`).
- CSP ist strict (`script-src 'self'`, kein `eval`, CI-Gate hart). Dokumentierte Vendor-Konzessionen: `wasm-unsafe-eval` (Ammo), `unsafe-inline` styles (Three.js Canvas), `worker-src blob:`, `frame-src 'self'`, `connect-src` mit den LLM-Provider-Hosts + `https:`-Wildcard (gehostetes Ollama) + `ws:`/`wss:` + `stun:`.
- `index.html` lädt `anazhRealm.js?v=<version>` — der `?v=`-Cache-Buster MUSS bei jedem Version-Bump mitziehen, sonst serviert das githack-CDN eine stale Datei gegen eine frische `index.html`. `save-server.js` strippt den Query-String.
- `generateNewWorld` hat einen 30-s-Cooldown.

### WASD-Geometrie

- `state.right` ist irreführend benannt: bei yaw=0 ist `state.right = (1,0,0) = +X`, aber player-anatomisch RECHTS ist `−X`. Mapping: A → `+state.right` (player-links), D → `−state.right` (player-rechts). Nicht „intuitiv" invertieren — das funktionierende System bricht sonst (beim asymmetrischen Drache-Avatar sichtbar).

### Multi-Welt

- Drei localStorage-Keys spannen Multi-Welt: `anazhRealmWorlds` (Index), `anazhRealmState_<worldId>` (pro Welt ein Snapshot), `anazhRealmActiveWorld` (Zeiger). Der Legacy-Key `anazhRealmState` wird beim ersten Start einmalig migriert + gelöscht.
- Welt-Wechsel ist reload-basiert (`switchToWorld`/`createNewWorld`/`deleteWorld` nehmen `{reload:false}` für Tests). Per-Welt-Terrain-Seed in `worldMeta.seed`. Sub-Welt-Eigenschaften (`trust`, `serverMode`, `multiplayer`) reisen feldweise durch die Vendor-/Mesh-Kette — wer eine vergisst, hat ein Leck.

## Workflows

- **Lokaler Audit:** `npm run check && npm run format:check && npm run lint && npm run playtest`
- **Web-Sessions:** ein SessionStart-Hook (`.claude/hooks/session-start.sh`, registriert in `.claude/settings.json`) ruft `npm install` — Lint/Format/Audit/Playtest sind in Claude-Code-on-the-web-Sessions sofort lauffähig (frischer Clone hat sonst kein `node_modules`).
- **Slash-Befehl:** `/audit` führt die Prüfung in jeder Claude-Session aus (`.claude/commands/audit.md`).
- **CI:** zwei parallele Jobs (`check` für statische Checks + `playtest` für Runtime-Invarianten) bei jedem Push.
- **Git:** kleine thematische Commits, `git push -u origin <branch>` mit exponential backoff bei Netzfehlern.

## Konventionen

- Keine emojis im Code/Commits außer auf expliziten Wunsch.
- Commits klein und thematisch.
- Keine Backwards-Compat-Layer für veralteten Code – sauber löschen.
- Pull Requests nur auf expliziten Wunsch des Users.
- **Vision treu bleiben**: jeder Vorschlag sollte die Heilige Lektion respektieren (keine Re-Komplexifizierung). Bei Zweifel: `docs/state-of-realm.md` §2 nachlesen.
- **Test-First-Mentalität**: nach jeder substanziellen Änderung Playtest-Gate, nicht nur Code-Analyse. Drei Selbst-induzierte Regressionen in dieser Session entstanden durch zu späte Browser-Tests.
- **Doku-Disziplin — drei Zeit-Ebenen, drei Heimaten, jede Datei EINE Aufgabe**: `CLAUDE.md` = was JETZT gilt (auto-geladen, schlank) · `docs/handover.md` = die Chronik (volle Wellen-Historie, jüngste oben) + wie du startest · `docs/roadmap.md` = der Plan vorwärts · `docs/state-of-realm.md` = die Vision. Pro Welle → **ein git-Commit** (die Geschichte) + **ein Chronik-Eintrag oben in `handover.md`**. Gilt eine Lehre DAUERHAFT (eine Bug-Klasse, ein technischer Stolperdraht) → **eine kuratierte Zeile in der `## Wichtige Gotchas`-Sektion dieser Datei**. **Der erzählerische Wellen-Bericht lebt NIE in dieser auto-geladenen Datei** — sonst wächst sie zur Halde (die Heilige Lektion, eine Schicht höher). Fertige Designs + Audit-Snapshots wandern nach `docs/archiv/` (verschieben, nicht löschen). **Doc-Sync ist eine Grep-Aufgabe** (W15-Lehre, V8.72): vor jedem Commit `grep -rn "<alte-Version>\|<alte-Invariantenzahl>" docs/*.md CLAUDE.md README.md` laufen und jeden Treffer heilen.

## Doc-Map

| Datei | Was |
|---|---|
| `docs/handover.md` | **Die Chronik + wie du startest** — die volle Wellen-Historie (jede Welle ein ausführlicher Eintrag, jüngste oben) plus die Orientierung für den nächsten Agenten (heilige Gesetze, Rhythmus, bewährte Muster). Beim Erwachen den Start-Kopf lesen, die Chronik bei Bedarf durchsuchen. |
| `docs/state-of-realm.md` | **Die Vision** — die vier Testamente kondensiert + Stand-vs-Vision-Matrix. |
| `docs/roadmap.md` | **Vollständige Projekt-Roadmap** — alle Ringe 0-11+ mit Aufwand, Vorbedingungen, Meilensteinen, Risiken |
| `docs/nexus-dsl.md` | DSL-Design für Ring 2 (Mensch+Grok teilen Sprache) |
| `vendor/README.md` | Vendor-Libs Versionen + Update-Befehl |
| `docs/crafting-konzept.md` | **Hylomorphismus-Konzept** — Bausteine, Operationen, Compounds, räumliche Prinzipien (Welle 4-6 Vorlage) |
| `docs/aktivierungsmatrix.md` | Form-Tag-Aktivierungs-Matrix v2 (9 × 10), Quellcode für `AnazhRealm.FORM_TAG_ACTIVATION` |
| `docs/world-portal.md` | **W12-Vision-Anker** — AnazhRealm als Tor zu anderen Vibecode-Welten („Bibliothek von Alexandria"). Vor einer Welle 12+ ZUERST lesen. |
| `docs/hydrosphere.md` | **V9.43-Wasser-Design** — das Drainage-Netz (Flüsse/Seen/Wasserfälle/Meer als ein Hydrosphären-System). Algorithmus, Datenstrukturen, Wellen-Schnitt b/c/d/e. Vor V9.43-b+ ZUERST lesen. |
| `docs/code-hygiene.md` | **V9.44-Stamm-Pflege-Plan** — der Code-Hygiene-Bogen (Befund, Vision-Abgleich, sechs verhaltensneutrale Refactoring-Sub-Wellen a-f, bewusste Nicht-Wellen). Kommt VOR der Hydrosphäre. Vor V9.44-a+ ZUERST lesen. |
| `docs/archiv/` | **Abgeschlossene Dokumente** — fertige Designs (`wave-6-design.md`) + Audit-Snapshots (`system-audit.md` V7.71, `system-audit-v8.25.md`). Reine Referenz, nicht mehr gepflegt. Ein frisches Audit erzeugt `/audit`. |
| `scripts/playtest.cjs` | Headless-Playtest mit **~3000 Invarianten** als CI-Gate (Stand V9.43-d; der Konsolen-Zähler driftet ±2-3 je Lauf — „Alle Invarianten OK" ist die Wahrheit) |
| `scripts/smoke-multiuser.cjs` | End-to-End-Test des signaling-servers: spawnt ihn, öffnet zwei WS-Clients, prüft welcome/peer-join/pos/dsl/soul/aura/vibe/rtc-Relay/peer-leave-Flow (`npm run smoke:multiuser`) |
| `scripts/smoke-webrtc.cjs` | W7+W16+W17 — echter Zwei-Browser-WebRTC-Test: zwei Puppeteer-Seiten treten einem Raum bei, bauen einen RTCDataChannel auf, Positions-/Bau-/Kreatur-/Stimm-Traffic fliesst peer-to-peer; W16 — A vendort eine Welt, B holt ihr Bündel peer-to-peer über das Mesh; W17 B-Relay — beide betreten dasselbe Multiplayer-Portal, A's Sub-Welt-`ws-send` erscheint bei B als `ws-recv`; W17 C — A betritt ein Multiplayer-Portal, B bekommt die `portal-invite` + folgt ihr ins selbe Portal; W17 B-JS-Compute — A wird Compute-Host, B Gast, B's Verkehr fliesst peer-to-peer durch A's Server-Kontext (die laufende Summe 12=7+5 beweist die autoritative Rechnung); W17 B-JS-Compute Phase 2 — A verlässt das Mesh, B übernimmt als Compute-Host mit frischem Server-Kontext (`npm run smoke:webrtc`) |
| `scripts/smoke-translated.cjs` | KI-Übersetzer Phase 2 — Browser-Beweis des generischen Translated-World-Renderers: öffnet `worlds/translated/`, schickt eine Beispiel-Szene per enter-Handshake, prüft den fehlerfreien Aufbau + screenshottet (`npm run smoke:translated`) |
| `scripts/smoke-sandbox.cjs` | V8.70 — Browser-Beweis des Untrusted-Welt-Tors: spannt ein echtes `sandbox="allow-scripts"`-iframe auf, lädt die Schwarm-Welt null-origin hinein, prüft dass die fremde Engine läuft UND beweisbar isoliert ist (`npm run smoke:sandbox`) |
| `scripts/smoke-vendor.cjs` | V8.71/V8.72 — W15: End-to-End-Beweis des Auto-Vendor-Pfads. Teil A POSTet echte Bündel an `/api/vendor-world` (Schreiben + Sicherheits-Wand), Teil B lädt die frisch vendorte Welt in ein null-origin-iframe + prüft, dass sie läuft + isoliert ist, Teil C startet ein lokales Fake-GitHub + lässt den save-server ein Repo holen (W15 P2 GitHub-Fetch — offline, deterministisch) (`npm run smoke:vendor`) |
| `scripts/smoke-shim.cjs` | W17 Transport-Shim: Browser-Beweis. Der save-server injiziert den Shim bei `?anazh-shim=1` (+ NICHT ohne Marker); eine Test-Welt im echten `sandbox="allow-scripts"`-iframe öffnet einen Shim-`WebSocket`, sendet einen Ping — AnazhRealms `_portalNetReceive` macht daraus einen `subworld-net`-Mesh-Broadcast (W17 Phase B-Relay; den Zwei-Browser-Durchlauf prüft `smoke-webrtc.cjs`) (`npm run smoke:shim`) |
| `signaling-server.js` | Multi-User-WebSocket-Broker (RFC-6455 von Hand, zero deps); seit W7 P1 auch WebRTC-Rendezvous (rtc-offer/answer/ice). `npm run signaling` startet auf Port 4313 |
| `start.bat` | Windows-Starter: bootet save-server.js + signaling-server.js + öffnet Browser. Mac/Linux: `npm start` (Save-Server) + `npm run signaling` (separat) |
| `.claude/commands/audit.md` | `/audit`-Slash-Befehl Definition |
| `.github/workflows/check.yml` | CI-Definition (zwei Jobs) |

## Erledigte Roadmap (Archiv)

Die ursprüngliche B/C-Roadmap mit 30+ Items aus der ersten Audit-Runde ist weitgehend erledigt. Detaillierte Liste mit Commit-Hashes in `docs/state-of-realm.md` §4.
