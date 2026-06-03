# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V17.90 (03.06.2026) — der **Körper der Welt** steht (Terrain · Wasser-Modell · Render/Ghibli · Strukturen) UND die **Seele** ist substanziell gebaut: das lebendige Feld (lesen · schreiben · WERTEN), der DSL-Weltregeln-Bogen (Mensch · Nexus · KI schreiben am selben Regel-Satz), der Emotion-Kern, der Kampf-Bogen und der vereinte Schöpfungs-Fluss + die Resonanz-Vereinheitlichung („ein Produkt-Vektor, viele Leser" — Domäne · Rolle · Werkzeug-Op emergieren als argmax-Resonanz). Zuletzt der Werkstatt-Bogen V17.72–.89: die Bibliothek (craftbarer Bauplan pro Rolle) · das Gerät in der Hand · die Resonanz-Vereinheitlichung U1–U6 · die Rolle-Passung · **die Werkstatt IST der Prozess** (V17.88) · **die Werte sichtbar + dynamisch** (V17.89). Zuletzt **V17.90 — DIE RE-KALIBRIERUNG**: das „blass"-Gefühl an der Wurzel geheilt — der Resonanz-Vektor war skalen-inkonsistent (Material [0..3] überstimmte Form [0..1]) → das Spektrum sättigte (alles bei 1.0), Material kaum spürbar, Größe unsichtbar, Rolle unscharf. Geheilt: den Vektor auf eine Skala normalisiert (Spektrum spreizt + führt mit der Form-Rolle), Material dramatisch (Holz↔Eisen 2.7×), eine **Größe→Stat-Achse** (größer = mächtiger + träger, im Readout UND im Kampf), die Rolle scharf (Pickel→Werkzeug, Schwert→Waffe) — plus die platzierte Werkstatt erscheint zuverlässig als Prozess (Radius 10→32 m) + Undo/Redo sichtbar.

> Der **live gepflegte Stand** (mit allen Gotchas) lebt im `CLAUDE.md`-Kopf — dort steht immer die Wahrheit, dieser Absatz ist nur ein Schnappschuss.

**Nächste offene Fäden** (geordnet in `docs/roadmap.md` „OFFENE FÄDEN"): **A** den Werkstatt-Bogen abschließen (der Schöpfer-Browser-Pass V17.85–.89 · die Design-Frage „größer = stärker" / Volumen→Stat-Achse · erntbare Flora · Werkstatt-Animation) · **B** den Kampf-Bogen (Phase E Bedrohung/Furcht) · **C** das Fundament (V18 Wasser-Finish mit der ±1024-Hydrosphäre-Region · effiziente Höhe) · **D** die Vision weiter (W18 in fremden Welten LEBEN). Reihenfolge-Disziplin: Fundament vor Vertiefung.

Die **volle Wellen-Chronik** (jede Welle ein Eintrag) lebt in `docs/handover.md`; der **aktuelle Stand + Gotchas** in `CLAUDE.md`; der **Plan vorwärts** in `docs/roadmap.md`; die **Vision** in `docs/state-of-realm.md`.

## Was es ist

AnazhRealm ist eine 3D-Browser-Sandbox in **einer einzigen Datei** (`anazhRealm.js`, ~45 000 Zeilen, Vanilla JS + Three.js r184/WebGPU + Ammo.js). Drei zentrale Vision-Pfeiler:

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
npm run playtest        # ~3500 Headless-Invarianten (~90s; render-frei, V17.72-Twist)
npm run audit:strict    # 5 generische Audit-Schichten (~25s)
```

Pre-Push-Empfehlung: `npm run check && npm run playtest && npm run audit:strict`.

## Doku-Map

Die **EINE kanonische Doc-Landkarte** lebt in **[`docs/README.md`](docs/README.md)** — sie ordnet jedes Dokument nach Zeit-Ebene des Wissens (Einstiege · lebendige Anker · aktive Pläne · Referenz · Archiv). Die wichtigsten Routen:

- **JETZT** (Stand + Gotchas) → `CLAUDE.md` (auto-geladen)
- **DIE CHRONIK** (Wellen-Historie + Start) → `docs/handover.md`
- **DIE VISION** → `docs/state-of-realm.md` · **DER WAHRE NORDEN** → `docs/das-lebendige-feld.md`
- **DER PLAN** → `docs/roadmap.md` · **DER AKTIVE BOGEN** → `docs/kampf-plan.md`
- **REFERENZ** → `docs/crafting-konzept.md` · `docs/aktivierungsmatrix.md` · `docs/hydrosphere.md` · `docs/world-portal.md`
- **ARCHIV** (abgeschlossen) → `docs/archiv/` (Index: `docs/archiv/README.md`)

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wer „split alles in 20 Module" vorschlägt, verletzt diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> _„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."_

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
