# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand:** die Versions-Wahrheit trägt `package.json` (alle `?v=`-Buster + `AnazhRealm.VERSION` folgen ihr über `npm run bump -- x.y.z`). Der live gepflegte Stand steht im `CLAUDE.md`-Kopf, das EINE Offen-Dokument ist `docs/PFLICHT-OFFEN.md`, die Chronik ist `git log`.

## Was es ist

AnazhRealm ist eine 3D-Browser-Welt (Vanilla JS, Three.js r184 / WebGPU) mit EINEM Stamm (`anazhRealm.js`, ~104 000 Zeilen, eine Klasse) und Ringen an echten Laufzeit-Grenzen:

- **Die Welt ist eine Funktion:** Voxel-Terrain aus einem Dichtefeld (Main + `voxel-worker.js` bit-identisch), Wasser als zellulärer Automat, die Ferne als Raymarch aus demselben Höhen-Gesetz (`feld-wgsl.js`). Die Physik ist feld-nativ und deterministisch (Replay + Lockstep-Multiplayer Stufe 2: nur Inputs übers Netz).
- **Die Studios sind die Gesetzbücher:** acht Schöpfer-Labore unter `worlds/` (terrain · garage · portale · schmiede · fachwerk · klang · koerperstudio · tetrapoda) teilen ihre Gesetze mit der Welt über die Kerne (`*-core.js`, Vertrag `docs/studio-vertrag.md`); die Foundry (Worker) baut Bäume, Fels, Häuser, Waffen, Fahrzeuge und Tiere aus ihnen.
- **Hylomorphismus als Sprache:** Form × Material → emergente Identität (Seele, Bauwerk, Werkzeug, Rüstung, Trank sprechen dieselbe Tag-Sprache); die Werkstatt baut Baupläne, die Welt liest sie.
- **Das lebendige Feld + die DSL:** die Welt liest · schreibt · wertet ein gemeinsames Feld; eine sandboxed DSL (Budget, Op-Whitelist, kein `eval`, CSP-strict) ist die Sprache, die Mensch, Welt-Regeln und ein optionaler LLM-Begleiter teilen.
- **Multi-User ohne Herrn:** WebRTC-Mesh über einen zero-dep-Broker, Portale in fremde Welten (sandboxed iframes), signierte Identität (Vibe-Pass).

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
  Broker-Protokoll: `docs/taille-spec.md` §7.

## Tests + Audit

```bash
npm run check           # Statik: node --check aller Kerne + Atlas/Source-Probes/Studio-Vertrag/Altlasten/Betriebsgesetz
npm run atlas           # die LIVE-Karte der Stamm-Zonen (<1 s; --find <regex>)
npm run lint            # ESLint
npm run format:check    # Prettier (der Stamm braucht einige Minuten)
npm run playtest:fast   # ~18 Kern-Gesundheits-Checks (~45 s) — der Dev-Loop
npm run playtest        # ~5000 Headless-Invarianten über ~240 Bänder (~4 min, GPU-frei) — das Merge-Gate
npm run gate:<name>     # die Domänen-Linsen (Liste: package.json)
```

Pre-Push-Empfehlung: `npm run check && npm run lint && npm run playtest`. Das Verdikt zählt (`✅ Alle Invarianten OK`), nie der ✅-Zähler.

## Doku-Map

Die **EINE kanonische Doc-Landkarte** lebt in **[`docs/README.md`](docs/README.md)** — sie ordnet jedes Dokument nach Zeit-Ebene des Wissens (Einstiege · lebendige Anker · aktive Pläne · Referenz · Archiv). Die wichtigsten Routen:

- **JETZT** (Stand + Gesetze + Lehren) → `CLAUDE.md` (auto-geladen)
- **OFFEN** (die EINE Offen-Liste) → `docs/PFLICHT-OFFEN.md` · **DER WEG + die v1.0-Ziellinie** → `docs/roadmap.md`
- **DIE VISION** → `docs/state-of-realm.md` · **DER WAHRE NORDEN** → `docs/das-lebendige-feld.md`
- **NORMATIV** → `docs/studio-vertrag.md` (Studio↔Welt) · `docs/taille-spec.md` (Draht-Formen) · `docs/neues-kleid-verfassung.md` (Pipeline)
- **DIE CHRONIK** → `git log` (die Commit-Message ist der Chronik-Eintrag; gelöschte Pläne/Archive leben dort)

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte (alle Module verwoben, keine stabilen Schnittstellen). Am 28.03.2025 die bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". Der ewige Kern: **Komplexität ohne Fundament ist Sand.** Verfeinerung (06.06.2026): die Sünde war **Kopplung ohne Kohäsion**, nicht „mehr als eine Datei" — darum leben Worker/Server/sandboxed-Welten BEREITS in eigenen Files (echte Laufzeit-Grenzen, keine Verletzung). Ein neuer Split nur an einer echten Grenze, die Kopplung SENKT, ohne Zweifel; „split nach Thema in 20 Module" bleibt die Falle. Ein Stamm, der an natürlichen Nähten Ringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> _„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."_

Bibliothek von Alexandria der Vibecode-Ära.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
