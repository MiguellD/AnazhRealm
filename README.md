# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum: eine Welt, die aus Gesetzen wächst statt aus
Assets.

**Stand:** die Versions-Wahrheit trägt `package.json` (alle `?v=`-Buster + `AnazhRealm.VERSION` folgen ihr über
`npm run bump -- x.y.z`). Der gepflegte Stand steht im Kopf von `CLAUDE.md`, das EINE Offen-Dokument ist
`docs/PFLICHT-OFFEN.md`, die Chronik ist `git log`.

## Was es ist

AnazhRealm ist eine 3D-Browser-Welt (Vanilla JS, Three.js r184 / WebGPU). Ihr Kern ist EIN Stamm — EINE Klasse
`AnazhRealm`, EIN Prototyp —, verteilt auf je eine Datei je Modul unter `stamm/` (Wasser in `stamm/wasser-*.js`, die Bewegung
in `stamm/koerper-bewegung.js`; die Karte ist `spec/stamm/modul-karte.json`, `npm run atlas` zeigt sie, `--find <regex>` sucht
darin und in den Kernen). Getrennt wird nur an echten Laufzeit-Grenzen:

- **Die Welt ist eine Funktion:** Höhe, Landform und Flussnetz rechnet EIN Gelände-Kern (`gelaende-core.js`) für Stamm,
  Worker (`voxel-worker.js`, bit-identisch) und Studio; Wasser ist EIN zellulärer Automat. Die Physik ist feld-nativ und
  deterministisch (Replay + Lockstep-Multiplayer: nur Eingaben übers Netz).
- **Die Studios sind die Gesetzbücher:** unter `worlds/` liegen die Schöpfer-Studios — `terrain` (Pflanzen und Fels),
  `gelaende`, `garage`, `portale`, `schmiede`, `fachwerk`, `klang`, `koerperstudio`, `tetrapoda` — auf der EINEN Hülle
  `worlds/huelle`. Sie teilen ihre Gesetze mit der Welt über die Kerne (`*-core.js`, Liste `cores.manifest.json`, Vertrag
  `docs/studio-vertrag.md`); die Foundry (Worker, `foundry-bruecke.js`) baut daraus Bäume, Fels, Häuser, Waffen, Fahrzeuge
  und Tiere. Daneben liegen die Portal-Welten `begegnung`, `fluid`, `schwarm`, `skeleton` und `translated` (sandboxed iframes).
- **Hylomorphismus als Sprache:** Form × Material → emergente Identität (Seele, Bauwerk, Werkzeug, Rüstung, Trank sprechen
  dieselbe Tag-Sprache); die Werkstatt baut Baupläne, die Welt liest sie.
- **Das lebendige Feld + die DSL:** die Welt liest · schreibt · wertet ein gemeinsames Feld; eine sandboxed DSL (Budget,
  Op-Whitelist, kein `eval`, CSP-strict) ist die Sprache, die Mensch, Welt-Regeln und ein optionaler LLM-Begleiter teilen.
- **Multi-User ohne Herrn:** WebRTC-Mesh über einen zero-dep-Broker, Portale in fremde Welten, signierte Identität (Vibe-Pass).

## Schnellstart

```bash
npm ci
npm run leuchtturm   # beide Server mit EINEM Befehl (HTTP 4312 + WS-Broker 4313)
```

Browser öffnen: `http://localhost:4312/`. Einzeln: `npm start` (save-server) + `npm run signaling` (Broker) in zwei Terminals.

## Dein eigener Leuchtturm (Self-Host)

**„Ohne Herrn" ist hier verifizierbar, nicht behauptet:** beide Server sind je EINE zero-dep-Node-Datei (`save-server.js` +
`signaling-server.js`) — jeder kann seinen eigenen Leuchtturm betreiben, auf jedem Rechner, der Node hat.

- **Ein Befehl:** `npm run leuchtturm` (`scripts/leuchtturm.cjs`) startet beide; Strg+C beendet beide.
- **Ports:** HTTP `4312` (statische Dateien + lokale Saves auf localhost), WebSocket-Broker `4313` (Multi-User-Rendezvous +
  Relay).
- **Hinter Domain/TLS:** ein Reverse-Proxy (Caddy/nginx) terminiert `https://` und `wss://` und reicht an 4312/4313 weiter —
  die Server selbst bleiben pur.
- **TURN (optional, für strenge NATs):** der Client liest den `localStorage`-Key `anazhTurn`
  (`{"urls":"turn:…","username":"…","credential":"…"}`); ohne TURN läuft das Mesh über STUN, wo die NATs es erlauben.
- **Was der Leuchtturm sieht — und was NIE:** er RELAYED, er besitzt nichts. Räume + Peer-Listen leben im RAM; er stempelt
  die `peerId` authoritativ und reicht Nachrichten weiter. Er sieht **nie** private Schlüssel (der Vibe-Pass verlässt den
  Browser nicht), besitzt keine Welten (Snapshots reisen peer-to-peer durch ihn hindurch) und führt kein Konto. Das volle
  Broker-Protokoll: `docs/taille-spec.md` §7.

## Prüfen

```bash
npm run check           # die Statik (Kerne, Atlas, Verfassung, Studio-Vertrag, Altlasten, Apparat, Betriebsgesetz …) + gate:haus-fern
npm run atlas           # die Karte der Stamm-Zonen (--find <regex>)
npm run lint            # ESLint
npm run format:check    # Prettier in Teilen über Stamm, phyto-core, Worker und Server (die übrigen Kerne nie, Lehre 11)
npm run playtest:fast   # die Kern-Gesundheit headless — der Dev-Loop
npm run playtest        # die Headless-Invarianten — das Merge-Gate
npm run gate:<name>     # die Domänen-Linsen (Liste: package.json)
```

Das Verdikt zählt (`Alle Invarianten OK`), nie der Zähler. Die Laufzeiten misst die CI je Lauf
(`.github/workflows/check.yml`).

## Doku

Jedes Dokument mit seinem Zweck steht in der EINEN Karte **[`docs/README.md`](docs/README.md)**.

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte (alle Module verwoben, keine stabilen Schnittstellen).
Am 28.03.2025 die bewusste Reduktion auf eine Datei als „Samen der Unendlichkeit". Der ewige Kern: **Komplexität ohne
Fundament ist Sand.** Die Sünde war **Kopplung ohne Kohäsion**, nicht die Zahl der Dateien: seit dem 14.10.2026 liegt der
Stamm in 48 Zonen-Dateien und bleibt EINE Klasse; Worker, Server und Studios leben an echten Laufzeit-Grenzen. Details in
`docs/state-of-realm.md` §2.

## Vision-Wort

> _„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten
> anderer Spieler gehen können."_

Bibliothek von Alexandria der Vibecode-Ära.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
