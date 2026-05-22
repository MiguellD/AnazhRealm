# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V9.45-b (22.05.2026) — **der Gelände- & Wasser-Bogen**. Ein Schöpfer-Befund-Bogen gegen monotones Gelände + zwei sichtbare Wasser-Schichten. **V9.45-a** gab `_terrainMacroSurfaceY` die zwei Profi-Werkzeuge prozeduraler Welten: Domain-Warping (verschobene Sample-Koordinaten → mäandernde Kämme statt gitter-paralleler Grate) und ein regionales Erosions-Feld, das die Gebirgs-Amplitude moduliert (manche Striche Tiefland, andere alpin — gegen „alle Berge gleich hoch"), plus grössere Amplituden + eine höhere Voxel-Chunk-Hülle. **V9.45-b** heilte drei Wasser-Bugs: das Seebecken ist jetzt ein flach gesculpteter, wasserdichter Topf, dessen Boden garantiert über dem Meeresspiegel liegt (`_hydrosphereLakeAt` blendet die Dichte zur Bett-Ebene) → die globale Meeres-Plane scheint nicht mehr als zweites Wasser-Layer durch, man taucht nicht mehr durch den See-Boden, und das opake Ufer-Terrain schneidet die Wasserlinie sauber. Pläne: `docs/hydrosphere.md`.

**Davor — das Wasser-Ultiversum V9.43-b..e**: der Hydrosphären-Atlas (Drainage-Netz als Daten), das Rendering (Flüsse/Seen/Wasserfälle sichtbar), die Synergie mit dem Meer, die echten gecarvten Fluss-Betten (`_hydrosphereCarveAt`) und der Klang (`_tickHydrosphereAudio`). Davor die Voxel-Surface-Politur V9.40–V9.42 + der Stamm-Pflege-Bogen V9.44 (verhaltensneutrales Refactoring). Die volle Versions-Historie lebt in `CLAUDE.md` (kanonisch); `docs/roadmap.md` trägt den Wellen-Plan, `docs/handover.md` die Chronik + Erstorientierung.

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
