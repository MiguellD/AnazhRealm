# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V18.83 (08.06.2026) — der **UI-Putz-Bogen ist RUND**: 8 flache Tabs → 6 Kern-Räume (Welt · Hof · Ich · Werkstatt · Bibliothek · Einstellungen) auf dem Werkstatt-Designsystem, der **Omnibox**-Schlüsselstein (Ctrl+K, löst die ~60-Knopf-Duplikation), jeder Raum auf Tiefe gebaut (Spec-Sheets · Bühnen · der zentrale Feed · die Einstellungen als reine Präferenzen, die Welt-Verwaltung in der Bibliothek) + das **freie HUD** (das Chrome weicht beim Spielen, der Chat sitzt unten-links wie bei den Profis, ein Fading-Feed — der Bildschirm gehört der Welt). Davor steht der **Körper der Welt** (Terrain · Wasser-Modell [V18.6: Wasser ist eine Fläche auf dem Spiegel `L`] · Render/Ghibli · Strukturen) UND die **Seele** substanziell: das lebendige Feld (lesen · schreiben · WERTEN), der DSL-Weltregeln-Bogen (Mensch · Nexus · KI schreiben am selben Regel-Satz), der Emotion-Kern, der Kampf-Bogen, der vereinte Schöpfungs-Fluss + die Resonanz-Vereinheitlichung („ein Produkt-Vektor, viele Leser" — Domäne · Rolle · Werkzeug-Op emergieren als argmax-Resonanz) und der Werkstatt-Bogen (die Werkstatt IST der Prozess, die Werte sichtbar + dynamisch, 3D-zentrisch).

> Der **live gepflegte Stand** (mit allen Gotchas) lebt im `CLAUDE.md`-Kopf — dort steht immer die Wahrheit, dieser Absatz ist nur ein Schnappschuss.

**Nächste offene Fäden** (geordnet in `docs/roadmap.md` „⭐ DER PLAN VORWÄRTS"): nach dem UI-Bogen ist der nächste GROSSE Welt-Bogen das **Wasser** — echte Fluid-Dynamik (Wasser fliesst nach wie Minecraft); heute ein statisches 2.5D-Höhenfeld, die volle Wahrheit + die drei Optionen in `docs/wasser-render-architektur-plan.md`. Danach: **Fundament sauber** (H3-Seen/Flüsse · G3 Eingänge/Canyons · LOD-Kaskade · Render-Feinschliff) → **die Seele** (Crafting-Schluss [S6-B erntbare Flora · S11 Werkstatt-Animation] · Kampf [Phase E Bedrohung/Furcht · Mana-Symmetrie] · Vision [Emotion→Regel-Emergenz · W18 in fremden Welten LEBEN]). Offen daneben: der Schöpfer-Browser-Sign-off des UI-Bogens (GPU-Feel) + das Statusbar-Schlanken.

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

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte (alle Module verwoben, keine stabilen Schnittstellen). Am 28.03.2025 die bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". Der ewige Kern: **Komplexität ohne Fundament ist Sand.** Verfeinerung (06.06.2026): die Sünde war **Kopplung ohne Kohäsion**, nicht „mehr als eine Datei" — darum leben Worker/Server/sandboxed-Welten BEREITS in eigenen Files (echte Laufzeit-Grenzen, keine Verletzung). Ein neuer Split nur an einer echten Grenze, die Kopplung SENKT, ohne Zweifel; „split nach Thema in 20 Module" bleibt die Falle. Ein Stamm, der an natürlichen Nähten Ringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> _„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."_

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
