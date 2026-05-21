# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V9.43-b (21.05.2026) — **der Hydrosphären-Atlas: das Drainage-Netz wird berechnet**. `_computeHydrosphere()` leitet aus der Voxel-Makro-Surface ein deterministisches Drainage-Netz ab — Flüsse, Seen, Wasserfälle als reine Daten in `state.hydrosphere` (der Profi-Weg prozeduraler Welt-Generatoren: Surface-Sampling → Priority-Flood-Depression-Filling → D8-Flow-Direction → Flow-Accumulation → Netz-Extraktion). KEIN Rendering (V9.43-c), KEIN Carven (V9.43-d) — vollständig headless-prüfbar. Zwei Wurzel-Bugs an der echten Messung gefunden: die 16-m-Abtastung der 3D-Crags aliaste zu 276 Mikro-Seen (Fix: glatte Makro-Surface ohne Detail-Oktave), und jede Zelle unter dem Meeresspiegel als Auslass geseedet ließ den Abfluss versickern (Fix: `_hydroMarkOcean` — der Ozean ist nur die rand-verbundene Komponente; eine abflusslose Mulde ist ein See). Ergebnis: 6 Flüsse, 12 Seen, maxAccum 4521, Perf 17 ms. **Davor — Stamm-Pflege-Bogen V9.44-a..f VOLLSTÄNDIG**: ein Code-Hygiene-Audit fand strukturelle Reibung; der Bogen heilte sie als reines verhaltensneutrales Refactoring (Persistenz-Schema vereinheitlicht, `_applyPlayerSpeed`-Setter, `p2pHandleMessage` zum Dispatch-Table, Infrastruktur-Konstanten, `_renderWorkshopDOM` zerlegt, `startEternalLoop` → Orchestrator + 13 `_loop<Phase>`-Methoden). Die drei vom Audit benannten Kontrollfluss-Giganten sind zerlegt; ~7 weitere 200+-Funktionen bleiben (späterer Hygiene-Bogen). Pläne: `docs/hydrosphere.md`, `docs/code-hygiene.md`. Nächste Welle: V9.43-c — Flüsse + Seen werden sichtbar.

**Davor — Voxel-Surface-Politur V9.40–V9.42** (fünf Schöpfer-Browser-Befunde nach V9.39): V9.40 a–f heilte die Chunk-Löcher beim Carve/Fill (Async-Rebuild + Pre-Build-Pattern + die Wurzel: vendored `ammo.wasm` auf 256 MB growable gepatcht) + den fehlenden P2P-Sync der Maus-Voxel-Edits. V9.41 + V9.41-b heilte die Trapeze/Linien auf flachen Hügeln (Schach-Brett-Diagonalen + Laplacian-Smooth gegen die Surface-Nets-Treppen). V9.42 a–d die Insel-Inkonsistenz (Inseln teilen die Surface-Nets-Pipeline + MeshToon-Material + Naht-pad-Smooth). V9.43-b ✅ liefert den Hydrosphären-Atlas (das Drainage-Netz als Daten); offen: V9.43-c/d/e — Rendering der Flüsse/Seen, echte Fluss-Betten ins Terrain carven, Klang. Ausführliche Planung in `docs/hydrosphere.md`. Die volle Versions-Historie lebt in `CLAUDE.md` (kanonisch); `docs/roadmap.md` §3 trägt den Wellen-Plan, `docs/handover.md` die Erstorientierung.

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
npm run playtest        # ~2984 Headless-Invarianten (~60s)
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
