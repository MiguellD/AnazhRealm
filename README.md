# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V17.20 (01.06.2026) — **der HEILUNG-Bogen läuft: V17.19 das Werkstatt-Auge geheilt (Bauplan-Preview WebGLRenderer→WebGPURenderer; visuelle Wahrheit = Schöpfer-Browser) + V17.20 tote Glieder geschnitten (~−1430 Z., der GPU-Density-Cluster raus — der Worker bleibt die Produktions-Density). Davor: der Render-/Tiefe-Bogen + die Architektur-Aufwertung sind durch; die Welt-OBERFLÄCHE lebt (Ghibli-malerisch).** V17.0–.13 Render-Realismus (Post-FX-Bloom/Grading · fraktale Klein-Vegetation · gemalter Wolkenhimmel · Entgrauen · Böen+Pollen · `mx_noise`-Wolken · Ghibli-Bäume · triplanar Terrain-Makrotextur · Unsharp-Strukturkontrast); V17.14–.15 Halm-Variation + Dorf/Tempel-Binnenstruktur; **V17.16.2 REVERT** (eine Architektur-Aufwertung killte das Baum-Spawning — die Wurzel war eine entfesselte Material-Resonanz, nicht ein Crash); **V17.17** disziplinierter Neuanlauf (Turm + Steintor tag-neutral angereichert) + Affinitäts-Tag-Wächter; **V17.18** der Turm wird die Antenne (felsturm stein→eisen → `broadcasting`-Relais). Davor: V14 Terrain-Bogen (epische Geomorphologie, Feature-Größe 176→464 m, Anden-Ketten, DREI Region-Typen) · V15 Render-Bogen · V16 Lebende-Umgebung/Gras-Riese · V13 Wasser-Profi-Bogen (pausiert @ V13.14) · V12 Genie-Bogen (r184 + WebGPU, 119 FPS).

**Nächste — die TIEFEN, noch nicht in voller Tiefe angepackten Roadmap-Fäden** (der aktuelle Stand + Gotchas leben im `CLAUDE.md`-Kopf, der Plan in `docs/roadmap.md`): die Welt-OBERFLÄCHE/Körper steht (Terrain · Render · Strukturen) — offen ist die **TIEFE darunter**: **(1) Wasser-Finish (V18)** — die ±1024-Hydrosphäre-Region (ferne Chunks tragen heute KEIN Wasser/Drainage) + frame-sauberer Sub-Region-Carve + die Render-Sync-Wurzeln; **(2) die lebendige Welt (V19, Pfeiler E/F/G)** — Emotion ↔ lokale Welt, Hylomorphismus-Cluster-Resonanz, Multi-Spieler-Vibe (die emotionale SEELE des Ultiversums, mehrfach verschoben); **(3) effiziente Höhe** — adaptives vertikales Chunk-Band (gewaltige Berge OHNE den V14.6-Clamp-Deckel). Reihenfolge-Disziplin (V9.51): Fundament (Terrain ✅ + Wasser) vor Vision-Vollendung.

Die **volle Wellen-Chronik** (jede Welle ein Eintrag) lebt in `docs/handover.md`; der **aktuelle Stand + Gotchas** in `CLAUDE.md`; der **Plan vorwärts** in `docs/roadmap.md`; die **Vision** in `docs/state-of-realm.md`.

## Was es ist

AnazhRealm ist eine 3D-Browser-Sandbox in **einer einzigen Datei** (`anazhRealm.js`, ~42 000 Zeilen, Vanilla JS + Three.js r184/WebGPU + Ammo.js). Drei zentrale Vision-Pfeiler:

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
npm run playtest        # ~3300 Headless-Invarianten (~60s)
npm run audit:strict    # 5 generische Audit-Schichten (~25s)
```

Pre-Push-Empfehlung: `npm run check && npm run playtest && npm run audit:strict`.

## Doku-Map

| Datei                        | Was                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `docs/handover.md`           | **Die Chronik + Erstorientierung** — volle Wellen-Historie, drei heilige Gesetze, wie du eine Session startest       |
| `docs/state-of-realm.md`     | **Die Vision** — fünf Pfeiler, Heilige Lektion, Stand-vs-Vision-Matrix                                               |
| `docs/roadmap.md`            | Vollständige Roadmap aller Ringe + zukünftige Wellen (V13-Plan in §1.4)                                              |
| `docs/hydrosphere.md`        | **Wasser-Design** — Drainage-Netz + Voxel-Cell-Wasser (Algorithmus, Datenstrukturen, Wellen-Schnitt)                 |
| `docs/world-portal.md`       | **W12-Vision-Anker** — Bibliothek von Alexandria der Vibecode-Ära                                                    |
| `docs/crafting-konzept.md`   | Hylomorphismus-Konzept                                                                                               |
| `docs/aktivierungsmatrix.md` | Form × Tag Aktivierungs-Matrix v2                                                                                    |
| `docs/archiv/`               | Abgeschlossene Dokumente — fertige Designs + Plan-Bögen + Audit-Snapshots (eigener Index in `docs/archiv/README.md`) |
| `CLAUDE.md`                  | Projektgedächtnis — kompakter Top-Stand, wird bei Session-Start geladen                                              |

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wer „split alles in 20 Module" vorschlägt, verletzt diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> _„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."_

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
