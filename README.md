# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V9.43-d (21.05.2026) — **die Flüsse carven echte Betten**. Das V9.43-b-Drainage-Netz senkt jetzt das Terrain selbst: `_terrainDensityAt` fragt die Hydrosphäre über einen O(1)-Bucket-Index, der Chunk-Mesher produziert echte Fluss-Rinnen mit Ufern + gemuldete See-Becken (`_hydrosphereCarveAt` + `_hydroBuildCarveIndex`); `_buildRiverRibbon` sampelt `_voxelSurfaceY` live → das Wasser liegt sichtbar IN der Furche statt als Sheet darauf. Zirkel-frei über ein transientes `_hydroComputing`-Suppress-Flag. Offen: V9.43-e (Klang). **Davor — V9.43-c.2** — das Wasser wird synergetisch. Schöpfer-Browser-Befund nach V9.43-c: die Seen/Flüsse schweben ein paar Meter über dem Meer, nicht synergetisch. Eine Höhen-Messung trennte Bug von Hydrologie: Seen ÜBER dem Meer sind korrekt (aufgesetzte Wasserkörper), aber (1) Flüsse endeten bis 2 m über der Meeresoberfläche statt in ihr — `_buildRiverRibbon` blendet die Mündung jetzt auf den Meeres-/See-Spiegel, der Fluss fließt sichtbar ins Wasser; (2) man konnte in Seen nicht schwimmen — `_hydroWaterLevelAt` speist den effektiven Wasserspiegel in die Schwimm-Physik, ein See ist jetzt schwimm-/tauchbar wie das Meer. **Davor — V9.43-c** rendert das V9.43-b-Drainage-Netz: `_buildHydrosphereMeshes()` baut See-Planes (ein Quad je See-Zelle), Fluss-Ribbon-Meshes (Breite ∝ √Akkumulation, Flow im per-Vertex-`aFlow`) + netz-verankerte Wasserfall-Planes; Meer, See, Fluss, Wasserfall = eine Wasser-Sprache (Vision §1.3 fraktal). **Davor — V9.43-b** lieferte den Hydrosphären-Atlas (das Drainage-Netz als reine Daten: Surface-Sampling → Priority-Flood → D8-Flow-Direction → Flow-Accumulation → Netz-Extraktion). Pläne: `docs/hydrosphere.md`, `docs/code-hygiene.md`. Nächste Welle: V9.43-e — Politur + Klang (Fluss-Rauschen, Wasserfall-Donnern).

**Davor — Voxel-Surface-Politur V9.40–V9.42** (fünf Schöpfer-Browser-Befunde nach V9.39): V9.40 a–f heilte die Chunk-Löcher beim Carve/Fill (Async-Rebuild + Pre-Build-Pattern + die Wurzel: vendored `ammo.wasm` auf 256 MB growable gepatcht) + den fehlenden P2P-Sync der Maus-Voxel-Edits. V9.41 + V9.41-b heilte die Trapeze/Linien auf flachen Hügeln (Schach-Brett-Diagonalen + Laplacian-Smooth gegen die Surface-Nets-Treppen). V9.42 a–d die Insel-Inkonsistenz (Inseln teilen die Surface-Nets-Pipeline + MeshToon-Material + Naht-pad-Smooth). V9.43-b ✅ liefert den Hydrosphären-Atlas (das Drainage-Netz als Daten), V9.43-c ✅ rendert es (Flüsse/Seen/Wasserfälle sichtbar), V9.43-d ✅ carvt echte Fluss-Betten + See-Becken ins Terrain; offen: V9.43-e — Klang. Ausführliche Planung in `docs/hydrosphere.md`. Die volle Versions-Historie lebt in `CLAUDE.md` (kanonisch); `docs/roadmap.md` §3 trägt den Wellen-Plan, `docs/handover.md` die Erstorientierung.

## Was es ist

AnazhRealm ist eine 3D-Browser-Sandbox in **einer einzigen Datei** (`anazhRealm.js`, ~34900 Zeilen, Vanilla JS + Three.js + Ammo.js). Drei zentrale Vision-Pfeiler:

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
npm run playtest        # ~3000 Headless-Invarianten (~60s)
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
