# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V8.75 (18.05.2026) — **W17 Phase A: der Transport-Shim** — eine fremde Multiplayer-Welt netzwerkt durch AnazhRealms Mesh statt zu einem echten Server. Eine fremde Welt netzwerkt nur über `WebSocket`; der save-server-injizierte Shim ersetzt `window.WebSocket` durch eine postMessage-Brücke — ein `send()` quert die Sandbox-Grenze zu AnazhRealm, die fremde Welt glaubt, sie habe einen Server. Phase A routet noch nicht übers Mesh (das ist Phase B-Relay) — die Akzeptanz ist ein Loopback-Echo. Davor **W16 die Mesh-Welt-Verteilung komplett** (eine vendorte Welt reist peer-to-peer + die Mesh-Bibliothek ist browsbar), **W15 der Auto-Vendor-Pfad komplett** (ein lokales Bündel ODER eine GitHub-Repo-URL dockt OHNE Handarbeit an), V8.70 das **Untrusted-Welt-Tor** (eine echte, ungeprüfte fremde Engine läuft null-origin sandgesichert — `worlds/schwarm/` beweist es) + V8.68/V8.69 der **KI-Übersetzer** komplett. W7 Compute-Sharing, W14 Bibliothek, W13 Vibe-Pass, W12 Welt-Portal — alle komplett. Offen: W17 Phase B+C (Mesh-als-Server + Gruppen-Portal, detailliert in `docs/roadmap.md` §3).

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
npm run playtest        # ~2669 Headless-Invarianten (~60s)
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
