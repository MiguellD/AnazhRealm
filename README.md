# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.


**Stand**: V14.8 (30.05.2026) — **Terrain-Bogen „Die wahre Tiefe des Geländes" (epische Geomorphologie, V14.0–.8, Browser-Audit-getrieben)**: das Makro-Relief von uniform-spitz-alpin zu abwechslungsreich-wie-die-Erde — kontinentale Basis (V14.1) + thermische Erosion (V14.2) + regionale Differenzierung (V14.3) + echte Ebenen (V14.4) + Harmonie-Heilung (V14.5) + Fern-Heilung (V14.6) + Maßstab-Streckung (V14.7, eine glatte λ2860-Hub-Oktave → **Feature-Größe 176→464 m**; `terrainSteepness` verdrahtet) + gerichtete Uplift-Maske (V14.8, der Hub wird RIDGED `(1−|noise|)²` λ3570 + Flow-Warp → lineare **Anden-Ketten**, Ketten-Elongation 1,82→2,28). **Über den Bogen (gemessen): Anteil steil (>45°) 26 %→0 %, Median-Hangneigung 35°→14,6°, sanft-Anteil 6,7 %→33,6 %, Hochland-Kohäsion →0,96, Ketten-Elongation →2,28, 9–14 lange Flüsse, FPS 119.** Davor: V13-Wasser-Profi-Bogen (pausiert @ V13.14, Finish → V15) + V12-Genie-Bogen (Three.js r184 + WebGPU-required, 119 FPS steady) + V10.0-NodeMaterial/TSL-Bogen.

**Nächste Welle: V14.9 — Browser-Audit-Bogen-Schluss** (Anden/Everest-Charakter, Vielfalt Ketten↔Plateaus↔Ebenen, epische Felder). Offener Trade (V14.8): eine Uplift-Oktave gibt Ketten ODER breite Plateaus — falls mehr Felder gewünscht, das REGIONALE Modell (Plateau-Regionen + Gebirgs-Gürtel). Dann V15 (Wasser-Finish: Render-Sync-Wurzeln + ±1024-Wasser-Region), V16 (lebendige Welt: E/F/G). Reflexions-Leitsätze: episches Terrain ist Worldgen-Mathematik — **die dominante Skala muss die größte sein** (Feature-Größe ∝ Wellenlänge, nicht Amplitude); lineare Ketten = ridged-Oktave + Flow-Warp; **Ketten UND Plateaus brauchen REGIONALE Differenzierung**; **wer die Terrain-Höhe/-Skala ändert, muss ALLE co-getuneten Annahmen nachziehen** (surf-relative Schichten, Voxel-Decke, Density-Mirror Worker+GPU, Foundation-Tests surf-relativ); Render nur im Browser-Loop justieren (Headless ist pixel-blind).

Die **volle Wellen-Chronik** (jede Welle ein Eintrag) lebt in `docs/handover.md`; der **aktuelle Stand + Gotchas** in `CLAUDE.md`; der **Plan vorwärts** in `docs/roadmap.md`; die **Vision** in `docs/state-of-realm.md`.

## Was es ist

AnazhRealm ist eine 3D-Browser-Sandbox in **einer einzigen Datei** (`anazhRealm.js`, ~42 000 Zeilen, Vanilla JS + Three.js r184/WebGPU + Ammo.js). Drei zentrale Vision-Pfeiler:

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
npm run playtest        # ~3300 Headless-Invarianten (~60s)
npm run audit:strict    # 5 generische Audit-Schichten (~25s)
```

Pre-Push-Empfehlung: `npm run check && npm run playtest && npm run audit:strict`.

## Doku-Map

| Datei | Was |
|---|---|
| `docs/handover.md` | **Die Chronik + Erstorientierung** — volle Wellen-Historie, drei heilige Gesetze, wie du eine Session startest |
| `docs/state-of-realm.md` | **Die Vision** — fünf Pfeiler, Heilige Lektion, Stand-vs-Vision-Matrix |
| `docs/roadmap.md` | Vollständige Roadmap aller Ringe + zukünftige Wellen (V13-Plan in §1.4) |
| `docs/hydrosphere.md` | **Wasser-Design** — Drainage-Netz + Voxel-Cell-Wasser (Algorithmus, Datenstrukturen, Wellen-Schnitt) |
| `docs/world-portal.md` | **W12-Vision-Anker** — Bibliothek von Alexandria der Vibecode-Ära |
| `docs/crafting-konzept.md` | Hylomorphismus-Konzept |
| `docs/aktivierungsmatrix.md` | Form × Tag Aktivierungs-Matrix v2 |
| `docs/archiv/` | Abgeschlossene Dokumente — fertige Designs + Plan-Bögen + Audit-Snapshots (eigener Index in `docs/archiv/README.md`) |
| `CLAUDE.md` | Projektgedächtnis — kompakter Top-Stand, wird bei Session-Start geladen |

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wer „split alles in 20 Module" vorschlägt, verletzt diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> *„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."*

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
