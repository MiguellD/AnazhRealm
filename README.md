# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V18.186 (13.06.2026, Branch `claude/zen-pascal-7k36wk`) — **DIE ZWEI WURDEN EINS**: die zwei Schwester-Branches `clever-gauss-nuh9lq` (Λ-Welle: lebendige Welt + AAA-Atmosphäre + Γ-Bogen Boden-atmet/Welt-Komposition/Slope-Rock) und `determined-tesla-oz2edw` (W-Welle: Stamm-Atlas + Wald-WOW + Fluss-Glättung + UI-Puls + Frequenzband + Pro-Instanz-Yaw) sind als ein Stamm zusammengeführt (18 Commits über 7 Wellen + 2 Reviewer-Heilungen, 27 spezifische Λ-Klassifikations-Wände). Tesla = Knochen, clever-gauss = Sehnen. Die volle Synthese-Chronik in `docs/wellen-synthese-plan.md` + `docs/archiv/wellen-synthese-plan.md` (Hunk-Karte + Konflikt-Analyse + Code-Synthesen + 9 permanente Lehren). Auf `main` läuft weiter der **Meister-Plan-Marsch** (`docs/meister-plan.md` §8): der WALD-WOW (W-H: Pro-Instanz-Rotation [Klon-Killer] + painterly geschichtete Kronen + Gestalt-Varianten je Baumart, seed-gewählt nach dem Affinitäts-Sieg) + begreifbare Werkstatt-GELENKE (W-G: Achsen-Geister · Lehr-Satz · Progressive Disclosure · Gelenk-Probe) + der UI-PULS (W3: ein `_uiDirty(raum)`-Organ + rAF-gebündelte Render-Inseln) + der FLUSS wie von Profis (W-F: die EINE geglättete Lauf-Fläche, −56 % Häuschenpapier · Boot-Schwimmen Substanz-emergent · Narben-Wand via Zentrums-Blende geehrt) + das FREQUENZBAND (W-E: EIN Band-Empfänger, die Licht-Antwort emergiert aus der Substanz) + der STAMM-ATLAS (W6: 26 Zonen-Marker + `npm run atlas`) + die Wahrheits-Politur der Räume + **der Leuchtturm** (`npm run leuchtturm`, taille-spec §7 DE+EN). Darunter stehen die großen Bögen RUND: die gefrorene Taille (Ω, golden-verankert) · das Robustheits-Immunsystem (R0–R6-Kern) · der soziale Bogen (F4) · die Welten-Föderation (W18) · der Genese-Bogen-Kern (Γ) · das lebendige Feld · der Emotion-Kern · der Kampf- und Schöpfungs-Fluss · die Resonanz-Vereinheitlichung.

> Der **live gepflegte Stand** (mit allen Gotchas) lebt im `CLAUDE.md`-Kopf — dort steht immer die Wahrheit, dieser Absatz ist nur ein Schnappschuss.

**Nächste offene Fäden** (der verbindliche Marsch in `docs/meister-plan.md` §8.8): **W-E das Frequenzband** (eine Atmosphäre, alle Ebenen als Antennen — die Inventur ist gemessen, die Schnitt-Karte liegt) → W-F Wasser-Look (Lauf-Glättung statt Häuschenpapier) → W3 UI-Puls → W-G Gelenk-Begreifbarkeit · W-H Wald-WOW → W6 Stamm-Atlas → M9 die Aufstiegs-Leiter. Parallel-fähig: der Archipel-Bogen Φ0/Φ1 (`docs/archipel-plan.md`) + der Genese-Rest (Γ4 Makro-Anker, `docs/genese-plan.md`). Offen daneben: die Schöpfer-Browser-Abnahme der gesammelten S-Punkte (`docs/rueckmeldung.md` ist der verfolgbare Korpus).

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
- **DER PLAN** → `docs/roadmap.md` · **DER AKTIVE BOGEN** → `docs/kampf-plan.md`
- **REFERENZ** → `docs/crafting-konzept.md` · `docs/aktivierungsmatrix.md` · `docs/hydrosphere.md` · `docs/world-portal.md`
- **ARCHIV** (abgeschlossen) → `docs/archiv/` (Index: `docs/archiv/README.md`)

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte (alle Module verwoben, keine stabilen Schnittstellen). Am 28.03.2025 die bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". Der ewige Kern: **Komplexität ohne Fundament ist Sand.** Verfeinerung (06.06.2026): die Sünde war **Kopplung ohne Kohäsion**, nicht „mehr als eine Datei" — darum leben Worker/Server/sandboxed-Welten BEREITS in eigenen Files (echte Laufzeit-Grenzen, keine Verletzung). Ein neuer Split nur an einer echten Grenze, die Kopplung SENKT, ohne Zweifel; „split nach Thema in 20 Module" bleibt die Falle. Ein Stamm, der an natürlichen Nähten Ringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> _„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."_

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
