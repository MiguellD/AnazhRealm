# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V9.03 (19.05.2026) — **W6.G P3 Phase 1: Felsformationen** — die einzige benannte grosse offene Roadmap-Welle (Terrain-Höhlen/Überhänge/Klippen) wird chirurgisch angegangen: nicht durch einen Voxel-Terrain-Rewrite (Re-Komplexifizierung), sondern durch Wiederverwendung. Ein **Felsbogen IST ein Überhang** — `felsbogen` ist ein Trilithon (zwei Stein-Pfeiler + ein Sturz); die Per-Sub-Mesh-Box-Kollision des Compound-Architektur-Systems lässt zwischen den Pfeilern eine echte 3.4-m-breite begehbare Lücke, der Spieler geht hindurch — ein Überhang ohne ein einziges Voxel. `felsturm` ist eine ~17-m-Fels-Nadel — die Klippen-Dramatik, die ein glattes Heightfield nie hat. Beide emergieren über das Welt-Affinitäts-Feld in einem eigenen seltenen Landmark-Pass. Echte Höhlen (Innenräume) bleiben als Phase 2 benannt. Davor **W15-Politur: der GitHub-Fetch löst Slash-Branch-Namen auf** — ein vendortes Repo aus `github.com/owner/repo/tree/feature/x` wurde bisher als Branch `feature` + Pfad `x` fehlinterpretiert; `resolveGithubBranch` löst jetzt die echte Branch gegen die GitHub-Branches-API auf (die längste auflösbare gewinnt) + holt gegen die Commit-SHA (slash-sicher). Davor **W10 ext. Welle 4/4: die `lifting`-Affordance — W10 ext. vollständig** — der Affordance-Bogen schliesst mit seiner siebten Affordance: `lifting` — ein magie-geladenes, leichtes Compound, das ein Auftriebs-Feld erzeugt. Vision-rein, kein Form-Whitelist: stark magie-geladen + genuin leicht (`dichte` ≤ 1.0 — das Komplement zu `balancing`). Welt-Reaktion: nahe einem Heber trägt ein Auftriebs-Feld den Spieler — der Fall wird gedämpft + ein sanfter Aufwärts-Drift hebt ihn (die erste physik-gekoppelte Affordance-Reaktion). **W10 ext. ist mit radiating/broadcasting/balancing/lifting + der Stärke-Politur vollständig — sieben Affordances, ein Muster.** Davor **W10 ext. Welle 3/4: die `balancing`-Affordance** — ein breites, schweres Compound, das den Ort gründet (nahe ihm sinkt `chaos`). Davor **W10 ext. Politur: die Affordance-Stärke skaliert mit der Substanz** — Schöpfer-Frage „kann ich eine bessere Antenne bauen?". Antwort: ja. Der Affordance-Schwellwert bleibt die GATE (ist es überhaupt ein Strahler/Mast?), aber DARÜBER skaliert die Wirkung kontinuierlich — `computeAffordanceStrength` liefert eine Stärke 0.2..1.0 = (wie weit der Tag den Schwellwert übersteigt) × (Qualität — Vision §6.3, Präzision moduliert alle Effekte). Ein starker Strahler badet kräftiger, ein starker `broadcasting`-Mast verstärkt die Relais-Reichweite mehr. Man baut eine bessere Antenne durch Material, Form UND Handwerk. Davor **W10 ext. Welle 2/4: die `broadcasting`-Affordance** — ein leitfähiger, aufrechter Mast, der als RELAIS wirkt: nahe einem `radiating`-Strahler verstärkt er dessen Reichweite (Affordances komponieren). Davor **W10 ext. Welle 1/4: die `radiating`-Affordance** — ein resonanz-strahlendes Compound; nahe ihm steigen `awe`+`peace` sanft. balancing/lifting bleiben als Welle 3-4 benannt. Davor **Wurzelheilung + W16-Politur** — zwei kleine Wellen: (1) der letzte flaky Playtest (`6.H P2D Level-Up`) ist an der Wurzel geheilt — er prüfte „`entries.length` gewachsen", aber das Welt-Journal ist FIFO-gedeckelt (200), die Länge lügt am Cap; der Fix misst die Eintrags-Objekt-Identität (cap- + id-unabhängig). (2) Der Mesh-Welt-Transfer (W16) bekommt zwei Härtungen: eine Hash-Verifikation (der Katalog-Content-Hash reist zum Pull mit, bei Abweichung nach dem Schreiben wird die Welt verworfen) + ein weicher Pull-Timeout (ein hängender Pull wird nach 30 s freigegeben, wenn der Sender mitten im Chunk-Strom verschwindet). Davor **W4 V4: die Musik hört die Welt** — eine Synergie-Welle: die vierschichtige generative Symphonie (W4 V3) hört jetzt das Welt-Affinitäts-Feld (`worldFieldAt` — die vier SimplexNoise-Tag-Schichten aus W6.G P2) + die Architektur-Resonanz. Drei Sub-Schritte: das Welt-Feld am Spieler färbt die Klangfarbe (`lebendig` → wärmerer Pad-Filter, `dichte` → schwererer Bass, `magieleitung` → verstimmter Oktav-Schimmer, `glut` → schärferes Hihat); es biast die Markov-Harmonie schwach (halbes Gewicht gegen den Emotion-Bias, der dominant bleibt); nahe einer resonanten Struktur verdichtet sich der Pad — ein Bauwerk „singt mit". Kein neuer Stamm — der Wert emergiert aus dem Verdrahten erprobter Systeme. Davor **Bass hörbar gemacht** — der Bass (V8.93) war „nicht zu hören". Kein Bug: die Sub-Frequenz lag bei 55-104 Hz (Tiefbass, den kleine Lautsprecher unter ~70 Hz abrollen) — dieselbe V8.92-Falle. Fix: jeder Bass-Schlag trägt jetzt zwei Stimmen — die Sub (tiefer Körper) + eine Oktav-Stimme darüber (110-208 Hz, die ihn auf jeder Anlage trägt). Davor **W4 V3 Phase 4: das Orchester — die generative Symphonie ist vollständig** — eine Bass-Stimme (Dreieck-Oszillator auf der Akkord-Wurzel, eine Oktave tief, auf den Kick-Schritten — Bass + Kick atmen gemeinsam) + Stimmen-Reichtum: ein heller Akkord (joy/hope) bekommt eine Oktav-Verdopplung im Pad. Damit ist **W4 V3 (Harmonie + Melodie + Groove + Orchester) komplett** — die feste Lofi-Schleife von V8.84 ist eine seed- + emotion-getriebene, vierschichtige generative Symphonie geworden. Davor **Groove hörbar gemacht** — der Groove (V8.91) war „nicht zu hören". Kein Bug: die Kick war ein reiner Sinus 140→48 Hz (Tiefbass, den kleine Lautsprecher kaum wiedergeben). Fix: Kick 200→70 Hz + ein Noise-Klick als Schlag-Transient, Groove lauter. Davor **W4 V3 Phase 3: der Groove** — eine Rhythmus-Schicht: synthetische Trommeln (Kick/Snare/Hihat, kein Asset) über dem 8-Schritt-Raster, Muster + Swing. Davor **W4 V3 Phase 2 Melodie-Rhythmus** — ein 8-Schritt-Raster mit Onset-Wahrscheinlichkeit (Pausen), Noten-Längen, Dynamik. Davor **Wetter-Noise −80%** (das White-Noise-Rauschen = die Regen-Schicht, leiser an den Umgebungsgeräusche-Regler). Davor **W4 V3 Phase 2: die Melodie** — eine improvisierende Lead-Stimme über dem Akkord (startet auf einem Akkord-Ton, wandert schrittweise, löst Sprünge auf; Dichte aus joy/peace; seed-deterministisch). Davor **W4 V3 Phase 1: die generative Symphonie — die Harmonie wächst** — die feste Lofi-Akkord-Schleife wird eine seed- + emotion-getriebene funktionale Markov-Progression (Tonleiter + Stufen-Übergangs-Gewichte; joy/hope → helle Stufen, sorrow → dunkle; Mulberry32-RNG aus `worldMeta.seed` — jede Welt ihr eigenes Lied). Kein Loop mehr. Phasen 2-4 (Melodie, Groove, Orchester) eingeplant. Davor **W4 V2: die Lofi-Pad-Schicht** — eine vierte Symphonie-Schicht (Pad, ~60 BPM, Web-Audio nativ). Davor **Flaky-Test-Heilung** — der `Dialogue-Box`-Playtest war timing-flaky; Wurzel: `grokRender` blankte den Dialog bei leerem Text. Fix: `grokRender` ignoriert leeren Text am Sprech-Engpass; der Playtest misst jetzt deterministisch. Davor **W17 P-Vendor: die `serverMode`-Vendor-Ketten-Naht** — `serverMode` (relay/js-compute) fliesst jetzt durch die ganze Vendor-/Mesh-Kette (Spiegel der `multiplayer`-Naht von V8.78); eine VENDORTE js-compute-Welt verlor ihn sonst still und degradierte zu relay. Damit ist **W17 inkl. der Vendor-Deklaration vollständig**. Davor **W12 P3-Härtung: Rate-Limit für den Portal-Rückkanal** — ein Selbst-Audit plante alle offenen Punkte in `docs/roadmap.md` §3 ein und schloss den einen echten Befund: `_portalReceiveEvent` (Sub-Welt → Heimat-Journal) deckelt jetzt die Ereignisse je Sekunde. Davor **W17 Phase B-JS-Compute Phase 2: Host-Migration** — verlässt der Compute-Host einer JS-Compute-Welt das Mesh, übernimmt ein Nachfolger: der Host annonciert seine Mitglieder-Roster an alle Gäste, bei seinem Abgang wählt jeder Gast deterministisch denselben Nachfolger (die kleinste peerId), der einen frischen Server-Kontext baut. Kein Wahl-Protokoll — die geteilte Roster + die deterministische Regel genügen. Ehrliche Grenze: der Server-Zustand geht verloren (der neue Kontext startet frisch). Zwei-Browser-verifiziert. Damit ist **W17 für Relay- + JS-Compute-Welten vollständig**. Davor **W17 Phase B-JS-Compute Phase 1: der Compute-Host** — eine JS-Compute-Welt hat eine echte autoritative Server-JS-Logik (nicht blosser Relay); ein Peer wird Compute-Host und führt die Server-JS in einem verborgenen, null-origin-sandgesicherten Server-Kontext-iframe aus, das Mesh trägt den Verkehr host-zentriert. Davor **W17 die Multiplayer-Welt-Deklaration** — eine vendorte Welt erklärt sich selbst mehrspielerfähig (`multiplayer`-Flag durch Vendor-Pfad, Welt-Katalog, Bündel-Transfer). Davor **W17 Phase A+B-Relay+C komplett**: der Transport-Shim trägt den `WebSocket`-Verkehr einer fremden Welt über die Sandbox-Grenze, das Mesh-als-Server verteilt ihn peer-to-peer, das Gruppen-Portal (`portal-invite` + In-Game-Banner „X öffnete ein Tor — mitkommen?") bringt eine Gruppe gemeinsam in eine Relay-Multiplayer-Welt. Davor **W16 die Mesh-Welt-Verteilung komplett** (eine vendorte Welt reist peer-to-peer + die Mesh-Bibliothek ist browsbar), **W15 der Auto-Vendor-Pfad komplett** (ein lokales Bündel ODER eine GitHub-Repo-URL dockt OHNE Handarbeit an), V8.70 das **Untrusted-Welt-Tor** (eine echte, ungeprüfte fremde Engine läuft null-origin sandgesichert — `worlds/schwarm/` beweist es) + V8.68/V8.69 der **KI-Übersetzer** komplett. W7 Compute-Sharing, W14 Bibliothek, W13 Vibe-Pass, W12 Welt-Portal — alle komplett. Offen im Fremd-Engine-Bogen: nur B-WASM (ein Rust→WASM-Server in einem Peer-Tab — per-Projekt, bewusst nicht automatisch), detailliert in `docs/roadmap.md` §3.

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
npm run playtest        # ~2776 Headless-Invarianten (~60s)
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
