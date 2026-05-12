# AnazhRealm – Projektgedächtnis für Claude

Persistente Notizen über das Projekt. Diese Datei wird bei jeder neuen Session automatisch geladen und dient als Langzeitgedächtnis. Bitte aktuell halten.

## Projektüberblick

- **Was:** 3D-Browser-Sandbox „AnazhRealm v7.65" – KI/Nexus-gesteuertes „Ultiversum" mit Physik, Kreaturen, Wetter, Chat-Steuerung.
- **Stack:** Vanilla JS + CDN-Libs (Three.js r134, Ammo.js, TensorFlow.js 3.21, simplex-noise 2.4). Lokaler Node-Save-Server. Kein Build, kein Modulsystem, keine Tests.
- **Branch für Entwicklung:** `claude/check-github-files-1MqpQ`
- **Architekturkern:** Eine `AnazhRealm`-Klasse (3494 Zeilen) in `anazhRealm.js`. State wird in `anazhRealmState.json` persistiert (alle 10 s lokal, alle 30 s via `save-server.js` → POST `/api/save-state`).

## Roadmap (Prioritäten)

Status-Legende: `[ ]` offen · `[x]` erledigt · `[~]` in Arbeit

### Sofort (Stunden) – risikoarme Quick-Wins
- [x] **B1** Duplikate Methodendefinitionen entfernt (Commit 9642934).
- [x] **B2** Single-Quote-Template-Bug in `updateSkyboxWeather` gefixt (Commit 9642934).
- [x] **B6** Trainingsdaten-Parser via Regex auf `x=…`/`z=…`.
- [x] **B12** `loadState` ruft `restoreAbility` für Nexus-bekannte Namen; benutzerdefinierte Abilities werden mit Warnung verworfen (Code wird nicht persistiert).
- [x] **B20/C11** `save-server.js`: `ALLOWED_STATE_FILES`-Allowlist + Dirname-Check.
- [ ] **B25** Konsistente Einrückung (4 Spaces) in `anazhRealm.js`.

### Kurzfristig (Tage)
- [ ] **C2** Chat-Command-Map statt Mega-If-Else.
- [ ] **C3** Ammo-Pool / zentrales `disposeAmmo` (behebt **B3** Memory-Leak).
- [ ] **C4** Worker-Singleton in `updateCreatures` (behebt **B4** Worker-Spawn-Leak).
- [x] **B7** `learnAbility` case-insensitiv: `indexOf` über lowercased `command`, alle `.includes(...)` gegen `lower`.
- [ ] **B9** Skybox-Uniform korrekt setzen (`.value.set(color)`).
- [x] **B11** XSS-Schutz: `flushLog` nutzt `textContent`, Chat-Output appendet `<div>`-Elemente mit `textContent`.
- [x] **B16** `lastWallCollisionUpdate` (und `lastSelfAnalysis`) initial im State.
- [x] **B17** `recordWeakness()`-Helper mit Dedup + Cap 50.
- [x] **B19** `cacheNoise()`-Helper als FIFO-LRU mit Cap 100k.
- [ ] **C14** ESLint + Prettier + `package.json` einrichten.

### Mittelfristig (Wochen)
- [ ] **C1** Modul-Split (engine / physics / ai / chat / persistence / world).
- [ ] **C6** TypeScript-Migration, State-Schema definieren.
- [ ] **C7** Tests für Chat-Parser, Persistenz, Terrain-Generator.
- [ ] **C12** Seed in State persistieren (aktuell nirgends gesetzt).
- [ ] **B26** `extendTerrain` Noise-Konsistenz mit `generateTerrainWithParameters` angleichen.

### Langfristig
- [ ] **C8/C9/C16** Echtes ML-/Nexus-System statt 3 hardcoded Evolution-Snippets.
- [ ] **C10** Three.js / WebGPU Upgrade.
- [ ] **C13** Instanced Mesh für Kreaturen/Vegetation.

## Wichtige Gotchas

- `anazhRealm.js` hat **mehrere doppelt definierte Methoden** – immer die *spätere* prüfen, da sie die wirksame ist.
- `Ammo.btVector3` / `btTransform` allokieren WASM-Heap. **Immer `Ammo.destroy()`** nach Gebrauch.
- `processChatCommand` lowercased `command` *nur für `parts`*, das Original-`command` behält Casing.
- Save-Endpoint ist nur an `127.0.0.1` gebunden, aber jede lokale Seite kann via CORS-`*` darauf zugreifen.
- Branch-Konvention: alle Entwicklung auf `claude/check-github-files-1MqpQ`. Push mit `git push -u origin <branch>` und exponential backoff bei Fehlern.

## Konventionen

- Keine emojis im Code/Commits außer auf expliziten Wunsch.
- Commits klein und thematisch (z. B. „remove duplicate methods", nicht „misc fixes").
- Keine Backwards-Compat-Layer für veralteten Code – sauber löschen.
- Pull Requests nur auf expliziten Wunsch des Users.
