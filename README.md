# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V9.43-e (21.05.2026) — **das Wasser-Ultiversum bekommt Klang**. `_tickHydrosphereAudio` moduliert zwei positions-abhängige White-Noise-Layer nach der Spieler-Distanz: Fluss-Rauschen (heller Bandpass) wächst nah an der Fluss-Mittellinie, Wasserfall-Donnern (dunkler Lowpass) trägt weiter + lauter. Vision §1.4 multisensorisch — man hört, wo Wasser fließt. Damit ist das Wasser-Ultiversum V9.43 vollständig (Atlas → Rendering → Synergie → Carven → Klang). **Davor — V9.43-d** carvt echte Fluss-Betten: `_terrainDensityAt` fragt die Hydrosphäre über einen O(1)-Bucket-Index, der Chunk-Mesher produziert echte Rinnen mit Ufern + gemuldete See-Becken (`_hydrosphereCarveAt`). **Davor — V9.43-b/c/c.2** lieferten den Hydrosphären-Atlas (das Drainage-Netz als reine Daten), rendern ihn (Flüsse/Seen/Wasserfälle sichtbar, eine Wasser-Sprache — Vision §1.3 fraktal) und machten das Wasser synergetisch mit dem Meer (Mündungs-Blend + schwimmbare Seen). Pläne: `docs/hydrosphere.md`. Offen: nur eine kosmetische Wasser-Politur-Naht (See-Ufer-Schaum, Flow-Speed nach Gefälle).

**Davor — Voxel-Surface-Politur V9.40–V9.42** (fünf Schöpfer-Browser-Befunde nach V9.39): V9.40 a–f heilte die Chunk-Löcher beim Carve/Fill (Async-Rebuild + Pre-Build-Pattern + die Wurzel: vendored `ammo.wasm` auf 256 MB growable gepatcht) + den fehlenden P2P-Sync der Maus-Voxel-Edits. V9.41 + V9.41-b heilte die Trapeze/Linien auf flachen Hügeln (Schach-Brett-Diagonalen + Laplacian-Smooth gegen die Surface-Nets-Treppen). V9.42 a–d die Insel-Inkonsistenz (Inseln teilen die Surface-Nets-Pipeline + MeshToon-Material + Naht-pad-Smooth). V9.43-b ✅ liefert den Hydrosphären-Atlas (das Drainage-Netz als Daten), V9.43-c ✅ rendert es (Flüsse/Seen/Wasserfälle sichtbar), V9.43-d ✅ carvt echte Fluss-Betten + See-Becken ins Terrain, V9.43-e ✅ gibt dem Wasser Klang. Ausführliche Planung in `docs/hydrosphere.md`. Die volle Versions-Historie lebt in `CLAUDE.md` (kanonisch); `docs/roadmap.md` §3 trägt den Wellen-Plan, `docs/handover.md` die Erstorientierung.

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
| `docs/crafting-konzept.md` | Hylomorphismus-Konzept |
| `docs/aktivierungsmatrix.md` | Form × Tag Aktivierungs-Matrix v2 |
| `docs/archiv/` | Abgeschlossene Dokumente — fertige Designs + Audit-Snapshots (`wave-6-design.md`, `nexus-dsl.md`, `code-hygiene.md`, `system-audit*.md`) |
| `CLAUDE.md` | Projektgedächtnis — kompakter Top-Stand, wird bei Session-Start geladen |

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wer „split alles in 20 Module" vorschlägt, verletzt diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> *„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."*

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
