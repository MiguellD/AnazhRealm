# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V18.238 (15.06.2026) — der **AKTIVE BOGEN** ist EIN Prinzip in zwei Gesichtern (_jede Eigenschaft ist ein Auslesewert der Wahrheit, gerechnet/gelesen, nie geraten/gemalt_): **`docs/wahrerbauplan.md`** (Ω-PHYSIS · das SEIN — der Physik-Schiedsrichter; Ω-Φ1 Schwerpunkt gebaut, headless-verifizierbar) + **`docs/wahreranblick.md`** (Ω-OPSIS · der ANBLICK — jede Oberfläche ein Auslesewert; PBR die eine Material-Wahrheit, toon raus, die Aura subtil). Das WERDEN (Wasser-CA, Ω-CHRONOS) ist gebaut. Darunter stehen die großen Bögen RUND: die gefrorene Taille (Ω, golden-verankert) · das Robustheits-Immunsystem (R0–R6-Kern) · der soziale Bogen (F4) · die Welten-Föderation (Φ/W18) · der Genese-Bogen (Γ) · das lebendige Feld · der Emotion-Kern · der Kampf-/Schöpfungs-Fluss · die Resonanz-Vereinheitlichung · der Lebendige Gigant (Wald).

> Der **live gepflegte Stand** (mit allen Gotchas) lebt im `CLAUDE.md`-Kopf — dort steht immer die Wahrheit, dieser Absatz ist nur ein Schnappschuss.

**Nächste offene Fäden:** der aktive Bogen — Ω-PHYSIS Ω-Φ2→Φ5 + Säule II–IV (`docs/wahrerbauplan.md`, headless-verifizierbar) · Ω-OPSIS §7 Sky-Env-Map + Boden + Laub-Sättigung (`docs/wahreranblick.md`, augen-bound). Die **gemerkten Fäden** (Phase E · R6 · Mana · KI-Symbiose · Wasser-Nachfliessen · VR · …) in `docs/roadmap.md §4`.

Die **volle Wellen-Chronik** (jede Welle ein Eintrag) lebt in `docs/archiv/handover.md`; der **aktuelle Stand + Gotchas** in `CLAUDE.md`; der **Plan vorwärts** in `docs/roadmap.md`; die **Vision** in `docs/state-of-realm.md`.

## Was es ist

AnazhRealm ist eine 3D-Browser-Sandbox in **einer einzigen Datei** (`anazhRealm.js`, ~61 000 Zeilen, Vanilla JS + Three.js r184/WebGPU + Ammo.js). Drei zentrale Vision-Pfeiler:

- **Hylomorphismus als Sprache**: Form × Material × Werkzeug × räumliche Konfiguration → emergente Identität. Player-Seele, Bauwerk, Kreatur, Werkzeug, Rüstung, Trank — alles spricht dieselbe Compound-Tag-Sprache.
- **DSL als Co-Schöpfer-Werkzeug**: 41 Ops, Sandbox mit Budget-Limits + Op-Whitelist + kein `eval`. Mensch und Welt-LLM teilen sich die Sprache. CSP-strict.
- **Multi-User-Symbiose**: WebRTC-Mesh mit echten peer-to-peer DataChannels (Position, DSL, Soul, Aura, Begleiter-Stimme), mesh-nativer Welt-Snapshot, geteilter LLM-Pool, Public-Lobby. Kein authoritativer Server.

## Schnellstart

```bash
npm install
npm run leuchtturm   # beide Server mit EINEM Befehl (HTTP 4312 + WS-Broker 4313)
```

Browser öffnen: `http://localhost:4312/` (oder `index.html` direkt). Einzeln:
`npm start` (save-server) + `npm run signaling` (Broker) in zwei Terminals.

## Dein eigener Leuchtturm (Self-Host)

**„Ohne Herrn" ist hier verifizierbar, nicht behauptet:** beide Server sind je
EINE zero-dep-Node-Datei (`save-server.js` + `signaling-server.js`) — jeder kann
seinen eigenen Leuchtturm betreiben, auf jedem Rechner, der Node hat.

- **Ein Befehl:** `npm run leuchtturm` startet beide; Strg+C beendet beide.
- **Ports:** HTTP `4312` (statische Dateien + lokale Saves auf localhost),
  WebSocket-Broker `4313` (Multi-User-Rendezvous + Relay).
- **Hinter Domain/TLS:** ein Reverse-Proxy (Caddy/nginx) terminiert `https://`
  und `wss://` und reicht an 4312/4313 weiter — die Server selbst bleiben pur.
- **TURN (optional, für strenge NATs):** der Client liest `localStorage`-Key
  `anazhTurn` (`{"urls":"turn:…","username":"…","credential":"…"}`); ohne TURN
  läuft das Mesh über STUN, wo die NATs es erlauben.
- **Was der Leuchtturm sieht — und was NIE:** er RELAYED, er besitzt nichts.
  Räume + Peer-Listen leben im RAM; er stempelt die `peerId` authoritativ und
  reicht Nachrichten weiter. Er sieht **nie** private Schlüssel (der Vibe-Pass
  verlässt den Browser nicht), besitzt keine Welten (Snapshots reisen
  peer-to-peer durch ihn hindurch) und führt kein Konto. Das volle
  Broker-Protokoll: `docs/taille-spec.md` §7 (englisch:
  `docs/taille-spec.en.md`).

## Tests + Audit

```bash
npm run check           # Syntax-Check (node --check) + Stamm-Atlas-Drift
npm run atlas           # die LIVE-Karte der 26 Stamm-Zonen (<1 s; --find <regex>)
npm run lint            # ESLint
npm run format:check    # Prettier
npm run playtest        # ~3500 Headless-Invarianten (~90s; render-frei, V17.72-Twist)
npm run audit:strict    # 5 generische Audit-Schichten (~25s)
```

Pre-Push-Empfehlung: `npm run check && npm run playtest && npm run audit:strict`.

## Doku-Map

Die **EINE kanonische Doc-Landkarte** lebt in **[`docs/README.md`](docs/README.md)** — sie ordnet jedes Dokument nach Zeit-Ebene des Wissens (Einstiege · lebendige Anker · aktive Pläne · Referenz · Archiv). Die wichtigsten Routen:

- **JETZT** (Stand + Gotchas) → `CLAUDE.md` (auto-geladen)
- **DIE CHRONIK** (Wellen-Historie + Start) → `docs/archiv/handover.md`
- **DIE VISION** → `docs/state-of-realm.md` · **DER WAHRE NORDEN** → `docs/das-lebendige-feld.md`
- **DER AKTIVE BOGEN** (ein Prinzip, zwei Gesichter) → `docs/wahrerbauplan.md` (Ω-PHYSIS · das Sein) · `docs/wahreranblick.md` (Ω-OPSIS · der Anblick) · **DER WEG** → `docs/roadmap.md`
- **REFERENZ** → `docs/archiv/crafting-konzept.md` · `docs/archiv/aktivierungsmatrix.md` · `docs/archiv/hydrosphere.md` · `docs/archiv/world-portal.md`
- **ARCHIV** (abgeschlossen) → `docs/archiv/` (Index: `docs/archiv/README.md`)

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte (alle Module verwoben, keine stabilen Schnittstellen). Am 28.03.2025 die bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". Der ewige Kern: **Komplexität ohne Fundament ist Sand.** Verfeinerung (06.06.2026): die Sünde war **Kopplung ohne Kohäsion**, nicht „mehr als eine Datei" — darum leben Worker/Server/sandboxed-Welten BEREITS in eigenen Files (echte Laufzeit-Grenzen, keine Verletzung). Ein neuer Split nur an einer echten Grenze, die Kopplung SENKT, ohne Zweifel; „split nach Thema in 20 Module" bleibt die Falle. Ein Stamm, der an natürlichen Nähten Ringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> _„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."_

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/archiv/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
