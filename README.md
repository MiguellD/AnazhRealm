# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V9.42-c/d (21.05.2026) — **Voxel-Surface-Politur Welle C: Inseln teilen die Surface-Nets-Pipeline**. Fliegende Inseln (V7.74) waren separate radiale-Noise-Geometrie mit eigenem Material — Vision §1.3 fraktal verletzt. V9.42 vereinheitlicht: `_voxelChunkGeometry` bekommt einen `densityFn`-Callback, `_islandDensityAt` liefert per-Insel-Density, `spawnIslandAt` ersetzt seine 80-Zeilen-Vertex-Schleife durch EINEN Mesher-Aufruf. Alle Inseln nutzen jetzt `MeshToonMaterial` + per-Vertex-Farbe (`_attachIslandColors` — grün/erdig/felsig nach Normale), die Cel-Sprache des Voxel-Bodens; der ~180-Zeilen-Terrain-Shader-Block ist als toter Code gelöscht. Worldgen-Inseln spawnen auf echter Voxel-Surface-Höhe (`_voxelSurfaceY + 50..140 m`), mit variabler Grösse (14..44 m) + height-skalierter Wölbung; DSL `spawn_island` nimmt ein `size`-Argument. Plus: die Chunk-Naht wird voll-deterministisch gesmootht — `_voxelChunkGeometry` meshed mit einem `cropMargin`-pad über den Skirt hinaus, smootht voll, schneidet den Überhang ab; jeder Naht-Vertex hat damit seinen vollen Eingabe-Kontext (141/146 Naht-Vertices < 1 mm).

**Davor — Voxel-Surface-Politur V9.40–V9.42** (fünf Schöpfer-Browser-Befunde nach V9.39): V9.40 a–f heilte die Chunk-Löcher beim Carve/Fill (Async-Rebuild + Pre-Build-Pattern + die Wurzel: vendored `ammo.wasm` auf 256 MB growable gepatcht) + den fehlenden P2P-Sync der Maus-Voxel-Edits (Maus-Pfad durch den broadcastbaren DSL-Op geroutet). V9.41 + V9.41-b heilte die Trapeze/Linien auf flachen Hügeln (Schach-Brett-Diagonalen + Laplacian-Smooth gegen die Surface-Nets-Treppen). V9.42 a–d die Insel-Inkonsistenz (siehe oben). Offen: V9.43 — das Wasser-Ultiversum (Wasserfälle/Strömung/Bäche als geteilter Plane-Shader). Die volle Versions-Historie lebt in `CLAUDE.md` (kanonisch); `docs/roadmap.md` §3 trägt den Wellen-Plan, `docs/handover.md` die Erstorientierung.

## Was es ist

AnazhRealm ist eine 3D-Browser-Sandbox in **einer einzigen Datei** (`anazhRealm.js`, ~31000 Zeilen, Vanilla JS + Three.js + Ammo.js). Drei zentrale Vision-Pfeiler:

- **Hylomorphismus als Sprache**: Form × Material × Werkzeug × räumliche Konfiguration → emergente Identität. Player-Seele, Bauwerk, Kreatur, Werkzeug, Rüstung, Trank — alles spricht dieselbe Compound-Tag-Sprache.
- **DSL als Co-Schöpfer-Werkzeug**: 41 Ops, Sandbox mit Budget-Limits + Op-Whitelist + kein `eval`. Mensch und Welt-LLM teilen sich die Sprache. CSP-strict.
- **Multi-User-Symbiose**: WebRTC-Mesh mit echten peer-to-peer DataChannels (Position, DSL, Soul, Aura, Begleiter-Stimme), mesh-nativer Welt-Snapshot, geteilter LLM-Pool, Public-Lobby. Kein authoritativer Server.

## Schnellstart

```bash
npm install
npm start            # save-server (Port 4312)
# In neuem Terminal:
npm run signaling    # WebSocket-Broker für Multi-User (Port 4313)
```

Browser öffnen: `http://localhost:4312/` (oder `index.html` direkt).

## Tests + Audit

```bash
npm run check           # Syntax-Check (node --check)
npm run lint            # ESLint
npm run format:check    # Prettier
npm run playtest        # ~2966 Headless-Invarianten (~60s)
npm run audit:strict    # 5 generische Audit-Schichten (~25s)
```

Pre-Push-Empfehlung: `npm run check && npm run playtest && npm run audit:strict`.

## Doku-Map

| Datei | Was |
|---|---|
| `docs/handover.md` | **Für den nächsten Agenten** — Schnell-Lage + drei heilige Gesetze |
| `docs/state-of-realm.md` | Vision, Historie, Stand, Plan, ~120 Learnings |
| `docs/roadmap.md` | Vollständige Roadmap aller Ringe + zukünftige Wellen |
| `docs/world-portal.md` | **W12-Vision-Anker** — Bibliothek von Alexandria der Vibecode-Ära |
| `docs/nexus-dsl.md` | DSL-Design |
| `docs/crafting-konzept.md` | Hylomorphismus-Konzept |
| `docs/aktivierungsmatrix.md` | Form × Tag Aktivierungs-Matrix v2 |
| `docs/archiv/` | Abgeschlossene Dokumente — fertige Designs + Audit-Snapshots (`wave-6-design.md`, `system-audit*.md`) |
| `CLAUDE.md` | Projektgedächtnis — kompakter Top-Stand, wird bei Session-Start geladen |

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wer „split alles in 20 Module" vorschlägt, verletzt diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> *„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."*

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
