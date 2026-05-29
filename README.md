# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.


**Stand**: V13.5 (29.05.2026) — **V13-Wasser-Profi-Bogen**: das Voxel-Wasser ist effizient + korrekt wie die Riesen (zell-basiert + reaktiv wie Minecraft, gerendert wie die Giganten), die weichen Übergänge kommen aus dem Tiefenpuffer. V13.0 Diagnose · V13.1 Klassifikation (Hang-Schatten 51,7 → 0,1 %) · V13.2 Grenzflächen-Meshing (~150 → ~3 ms/Chunk) · V13.3 Flow-Bias · V13.4 Glättung · V13.5 Schicht-3-Tiefen-Ufer-Shader (weiche Uferlinie via `viewportLinearDepth` pro-Pixel + Tiefen-Farbe + Emotions-Haken; Geometrie wieder dumm-flach). Davor: V12-Genie-Bogen (Three.js r184 + WebGPU-required, 119 FPS steady) + V10.0-NodeMaterial/TSL-Bogen.

**Nächste Welle: V13.6 — Sub-Region-Edit-Remesh** (nur die berührte Zell-Sektion neu statt des ganzen Chunks). Danach V13.7 LOD, V13.8 Audit; dann V14 — die lebendige Welt (System-Kopplungen E/F/G). Reflexion-Leitsatz: Wasser ist drei Schichten — Wahrheit/Zellen + dumme Geometrie + Shader-Erscheinung.

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

| Datei | Was |
|---|---|
| `docs/handover.md` | **Die Chronik + Erstorientierung** — volle Wellen-Historie, drei heilige Gesetze, wie du eine Session startest |
| `docs/state-of-realm.md` | **Die Vision** — fünf Pfeiler, Heilige Lektion, Stand-vs-Vision-Matrix |
| `docs/roadmap.md` | Vollständige Roadmap aller Ringe + zukünftige Wellen (V13-Plan in §1.4) |
| `docs/hydrosphere.md` | **Wasser-Design** — Drainage-Netz + Voxel-Cell-Wasser (Algorithmus, Datenstrukturen, Wellen-Schnitt) |
| `docs/world-portal.md` | **W12-Vision-Anker** — Bibliothek von Alexandria der Vibecode-Ära |
| `docs/crafting-konzept.md` | Hylomorphismus-Konzept |
| `docs/aktivierungsmatrix.md` | Form × Tag Aktivierungs-Matrix v2 |
| `docs/archiv/` | Abgeschlossene Dokumente — fertige Designs + Plan-Bögen + Audit-Snapshots (eigener Index in `docs/archiv/README.md`) |
| `CLAUDE.md` | Projektgedächtnis — kompakter Top-Stand, wird bei Session-Start geladen |

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wer „split alles in 20 Module" vorschlägt, verletzt diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> *„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."*

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
