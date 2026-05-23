# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V9.51 (22.05.2026) — **der Tarn-Pass: Bergseen**. Der Wasser-Bogen V9.43–V9.51 ist damit komplett: das Drainage-Netz (Flüsse/Seen/Wasserfälle/Meer als ein Hydrosphären-System), das Chunk-Wasser-Mesh aus derselben Quelle wie das Terrain (Uferlinie exakt per Konstruktion), und jetzt Bergseen als additive Hochmulden — `_hydroSeedTarns` setzt nach der Erosion Gauss-Mulden an hohen, sanften Spots, das bestehende Priority-Flood füllt sie zum See. Design + Lernschlüsse: `docs/hydrosphere.md` §12–§15.

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
