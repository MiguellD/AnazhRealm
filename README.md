# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V9.53 (23.05.2026) — **Drift-Heilung im Playtest, die geordnete Invarianten-Namen-Liste ist jetzt deterministisch**. 9 driftende Werte (perf-ms, worldgen-Counts, populated-Chunks-Size) aus dem Test-Namen in den Detail-String verschoben → `diff` zwischen Läufen zeigt jetzt ECHTE Regression statt harmlosen Zahlen-Drift. Drei aufeinanderfolgende Läufe bewiesen Determinismus (3060 Invarianten bit-identisch, ZERO Diff). Damit ist die Test-Disziplin-Wende geschafft, die der V9.52-f-Reflexions-Befund einforderte.

**Davor — V9.52-a..f Playtest-Pflege-Bogen geschlossen**. `scripts/playtest.cjs` war eine 31 574-Zeilen-async-IIFE mit Median-Einrückung 20 (~3000 Invarianten in einem Topf, die zweitgrößte Reibung des Projekts); ist jetzt 29 554 Zeilen mit Median-Einrückung 8, schlanker Orchestrator (207 Z.), 41 benannten Band-Funktionen je 432-1396 Z. + 5 Helfer (`safeEvaluate`, `gatherInitialFinalState`, `checkInitialState`, `checkRing1Grok`, `checkRing2Dsl`). Sechs Sub-Wellen a-f: a (Gerüst + 4 erste Funktionen) → b (11 Band-Funktionen Band 1) → c (8 Band-Funktionen Band 2) → d (8 Band-Funktionen Band 3) → e (10 Band-Funktionen Band 4 — der `else`-Block erschöpft) → f (Helfer-Durchzug: 196 inline `page.evaluate().catch()`-Boilerplate-Stellen durch `safeEvaluate(page, ...)` ersetzt). Plan-§6-Akzeptanz erfüllt. Verhaltens-identisch über 11 Baseline-Läufe (3060-Invarianten-Satz bit-identisch). Datei netto −2020 Zeilen (−6.4%). Voller Bogen-Bericht: `docs/playtest-hygiene.md` (jetzt mit §7 — Akzeptanz nach f).

**Davor — Hydrosphäre-/Wasser-Bogen V9.43–V9.51**: der Tarn-Pass Bergseen (V9.51, `_hydroSeedTarns` setzt nach der Erosion Gauss-Mulden an hohen, sanften Spots, das bestehende Priority-Flood füllt sie zum See), das Chunk-Wasser-Mesh aus derselben Quelle wie das Terrain (V9.50, Uferlinie exakt per Konstruktion), das vereinte Wasser-System (V9.49), Hydrosphäre-Politur (V9.48). Design + Lernschlüsse: `docs/hydrosphere.md` §12–§15.

**Davor — Hydrosphäre-Politur V9.48** (See-Ufer-Schaum + Flow-Speed nach Gefälle, `docs/hydrosphere.md` §9) + **fluviale Erosion V9.47**: die Welt war see-dominant (die Becken 12–20 m tief). V9.47 formt das Gelände via **Stream-Power-Inzision** um (Braun & Willett / Fastscape — das geomorphologische Standard-Modell): `_computeErosion` lässt Terrain + Drainage über 36 Iterationen ko-evolvieren, das Stream-Power-Gesetz `Δh = k·A^m·S^n` schneidet proportional zu Drainage-Fläche × Gefälle ein — aber NUR in Kanälen (`accum ≥ channelMinArea`). Ergebnis: Gipfel exakt erhalten, dendritische Tal-Netze gecarvt, See-Fläche halbiert, Flüsse länger + offener.

**Davor — lange Flüsse V9.46** (Flüsse durch Seen hindurch als eine logische Polylinie) + **der Gelände- & Wasser-Bogen V9.45-a..c** (Domain-Warp + Erosions-Feld gegen monotones Gelände; Seebecken als wasserdichte Töpfe; Auftrieb an die See-Plane gekoppelt). Davor das Wasser-Ultiversum V9.43-b..e (Hydrosphären-Atlas, Rendering, gecarvte Fluss-Betten, Klang), die Voxel-Surface-Politur V9.40–V9.42 + der Stamm-Pflege-Bogen V9.44. Die volle Versions-Historie lebt in `CLAUDE.md` (kanonisch); `docs/roadmap.md` trägt den Wellen-Plan, `docs/handover.md` die Chronik + Erstorientierung.

## Was es ist

AnazhRealm ist eine 3D-Browser-Sandbox in **einer einzigen Datei** (`anazhRealm.js`, ~36 000 Zeilen, Vanilla JS + Three.js + Ammo.js). Drei zentrale Vision-Pfeiler:

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
| `docs/handover.md` | **Die Chronik + Erstorientierung** — volle Wellen-Historie, drei heilige Gesetze, wie du eine Session startest |
| `docs/state-of-realm.md` | **Die Vision** — fünf Pfeiler, Heilige Lektion, Stand-vs-Vision-Matrix |
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
