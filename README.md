# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V8.86 (18.05.2026) — **Ambient-Drone-Politur** — Schöpfer-Browser-Befund: über der Lofi-Harmonie lief ein zu intensiver Dauerton. Diagnose: der Ring-4-V1-Ambient-Drone (Sägezahn bei 110 Hz) — eine eigene Schicht, kein Bug, aber zu laut, seit die Lofi-Harmonie die Musik trägt. Fix: der Drone wird eine leise Grundierung (Dreieck statt Sägezahn, Gain halbiert). Davor **W4 V3 Phase 1: die generative Symphonie — die Harmonie wächst** — die feste Lofi-Akkord-Schleife wird eine seed- + emotion-getriebene funktionale Markov-Progression (Tonleiter + Stufen-Übergangs-Gewichte; joy/hope → helle Stufen, sorrow → dunkle; Mulberry32-RNG aus `worldMeta.seed` — jede Welt ihr eigenes Lied). Kein Loop mehr. Phasen 2-4 (Melodie, Groove, Orchester) eingeplant. Davor **W4 V2: die Lofi-Pad-Schicht** — eine vierte Symphonie-Schicht (Pad, ~60 BPM, Web-Audio nativ). Davor **Flaky-Test-Heilung** — der `Dialogue-Box`-Playtest war timing-flaky; Wurzel: `grokRender` blankte den Dialog bei leerem Text. Fix: `grokRender` ignoriert leeren Text am Sprech-Engpass; der Playtest misst jetzt deterministisch. Davor **W17 P-Vendor: die `serverMode`-Vendor-Ketten-Naht** — `serverMode` (relay/js-compute) fliesst jetzt durch die ganze Vendor-/Mesh-Kette (Spiegel der `multiplayer`-Naht von V8.78); eine VENDORTE js-compute-Welt verlor ihn sonst still und degradierte zu relay. Damit ist **W17 inkl. der Vendor-Deklaration vollständig**. Davor **W12 P3-Härtung: Rate-Limit für den Portal-Rückkanal** — ein Selbst-Audit plante alle offenen Punkte in `docs/roadmap.md` §3 ein und schloss den einen echten Befund: `_portalReceiveEvent` (Sub-Welt → Heimat-Journal) deckelt jetzt die Ereignisse je Sekunde. Davor **W17 Phase B-JS-Compute Phase 2: Host-Migration** — verlässt der Compute-Host einer JS-Compute-Welt das Mesh, übernimmt ein Nachfolger: der Host annonciert seine Mitglieder-Roster an alle Gäste, bei seinem Abgang wählt jeder Gast deterministisch denselben Nachfolger (die kleinste peerId), der einen frischen Server-Kontext baut. Kein Wahl-Protokoll — die geteilte Roster + die deterministische Regel genügen. Ehrliche Grenze: der Server-Zustand geht verloren (der neue Kontext startet frisch). Zwei-Browser-verifiziert. Damit ist **W17 für Relay- + JS-Compute-Welten vollständig**. Davor **W17 Phase B-JS-Compute Phase 1: der Compute-Host** — eine JS-Compute-Welt hat eine echte autoritative Server-JS-Logik (nicht blosser Relay); ein Peer wird Compute-Host und führt die Server-JS in einem verborgenen, null-origin-sandgesicherten Server-Kontext-iframe aus, das Mesh trägt den Verkehr host-zentriert. Davor **W17 die Multiplayer-Welt-Deklaration** — eine vendorte Welt erklärt sich selbst mehrspielerfähig (`multiplayer`-Flag durch Vendor-Pfad, Welt-Katalog, Bündel-Transfer). Davor **W17 Phase A+B-Relay+C komplett**: der Transport-Shim trägt den `WebSocket`-Verkehr einer fremden Welt über die Sandbox-Grenze, das Mesh-als-Server verteilt ihn peer-to-peer, das Gruppen-Portal (`portal-invite` + In-Game-Banner „X öffnete ein Tor — mitkommen?") bringt eine Gruppe gemeinsam in eine Relay-Multiplayer-Welt. Davor **W16 die Mesh-Welt-Verteilung komplett** (eine vendorte Welt reist peer-to-peer + die Mesh-Bibliothek ist browsbar), **W15 der Auto-Vendor-Pfad komplett** (ein lokales Bündel ODER eine GitHub-Repo-URL dockt OHNE Handarbeit an), V8.70 das **Untrusted-Welt-Tor** (eine echte, ungeprüfte fremde Engine läuft null-origin sandgesichert — `worlds/schwarm/` beweist es) + V8.68/V8.69 der **KI-Übersetzer** komplett. W7 Compute-Sharing, W14 Bibliothek, W13 Vibe-Pass, W12 Welt-Portal — alle komplett. Offen im Fremd-Engine-Bogen: nur B-WASM (ein Rust→WASM-Server in einem Peer-Tab — per-Projekt, bewusst nicht automatisch), detailliert in `docs/roadmap.md` §3.

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
npm run playtest        # ~2767 Headless-Invarianten (~60s)
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
