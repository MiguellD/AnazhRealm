# Der aktive Tisch — DER EINE PLAN VORWÄRTS

> **Was hier liegt:** alle offenen Wellen + alle Schöpfer-Entscheide + die Reihenfolge.
> Volle Vergangenheit: `docs/archiv/handover.md` Chronik. Vision: `docs/state-of-realm.md` +
> `docs/das-lebendige-feld.md`. Die vollendeten Pläne (kampf · ui-putz · taille · robustheit ·
> sozial · welten-föderation · meister-marsch · genese-bogen · wellen-synthese) leben im Archiv —
> ein Bogen erwacht → sein Plan kommt auf den Tisch.

**Stand 13.06.2026 (V18.190 — `claude/stoic-archimedes-36l2it`):** **Φ-BOGEN ZU 6/7 GEBAUT.**
V18.188: Φ0/Φ1/Φ2 (Last-Sonde · Welt-Adressen · Wohnzimmer-Stufen). V18.189: Φ3/Φ4/Φ5
(Regions-Archipel · Anwesenheit · Mittragen). **V18.190: Φ7** (Portal-Hallen — kuratierte
Welt-Verzeichnisse als signierte Artefakte; N Adressen im Kreis materialisiert, jeder Slot
trägt seine EIGENE entry-level worldAddress). Nur **Φ6 Vorberechnung + verteiltes Immunsystem**
bleibt offen (eigene große Welle — Job-Queue, Stichproben-Verify, Worker-Pool). Der Tisch trägt
jetzt nur noch: Φ6 (groß), M9-Sprossen 4-7 (S-Dialog), Γ-Reste, LOD-Reste, Wasser-Entscheid
+ drei Schöpfer-Entscheide + die Browser-Sign-offs.

---

## §0 — Status (alle abgeschlossenen Bögen)

| Bogen | Wann | Aktenort |
|---|---|---|
| Kampf · Schöpfungs-Fluss · Resonanz-Vereinheitlichung | V17.59–.85 · §11 RUND V18.148 | `docs/archiv/kampf-plan.md` |
| Wasser-CA (Fluid-Sim auf Voxel) | V18.84–.94 | `docs/archiv/terrain-t4-wasser-ca-plan.md` |
| Wasser-Render (3 Schichten, V18.31 konsolidiert) | V18.0–.31 (Schöpfer-Entscheid §6 offen — siehe §3) | `docs/archiv/wasser-render-architektur-plan.md` |
| UI-Putz (6 Kern-Räume + Werkstatt-Referenz) | V18.32–.83 | `docs/archiv/ui-putz-plan.md` + 4 Raum-Pläne |
| Taille Ω (gefroren, golden) | V18.137–.141 | `docs/taille-spec.md` + `docs/archiv/taille-plan.md` |
| Robustheit (R0–R6 Kern) | V18.122–.152 | `docs/archiv/robustheit-plan.md` |
| Sozial F4 (Zeugnisse · Folgen · Kommentare · Für-dich) | V18.134–.147 | gigant-plan §5 F4 (archiviert) |
| Welten-Föderation F3/W18 (Ko-Präsenz + Wohnen) | V18.144–.146 | `docs/archiv/world-portal-w18-plan.md` |
| Meister-Marsch §8 (W-A · W-B · W-C · W-D · W-E · W-F · W-G · W-H · M1–M8) | V18.154–.179 | `docs/archiv/meister-plan.md` |
| Genese-Bogen Γ (Γ1-Kern · Γ2 · Γ5 V18.166; Γ1-Lesart-4 · Γ4 · Γ4.2/4.4 · Γ4½ V18.179-.181 via Synthese) | V18.166 + V18.180-FIX-Bogen | `docs/archiv/genese-plan.md` |
| Branch-Synthese (clever-gauss × tesla → ein Stamm) | V18.180-FIX bis V18.187 (20 Commits, 10 permanente Lehren) | `docs/wellen-synthese-plan.md` + Archiv-Voll-Datei |
| **Φ-Bogen Φ0+Φ1+Φ2 (M9-Sprosse 1 — Welten-Netz: Last-Sonde · Welt-Adressen · Wohnzimmer-Stufen)** | **V18.188** | `docs/archipel-plan.md` §2 (Φ0/Φ1/Φ2 gebaut, Φ3–Φ7 offen) |
| **Φ-Bogen Φ3+Φ4+Φ5 (M9-Sprossen 2+3 — Regions-Archipel · Anwesenheits-Schicht · Mittragen)** | **V18.189** | `docs/archipel-plan.md` §2 (Φ3/Φ4/Φ5 gebaut, Φ6/Φ7 offen als Kür) |
| **Φ-Bogen Φ7 (Portal-Hallen — kuratierte Welt-Verzeichnisse als signierte Artefakte)** | **V18.190** | `docs/archipel-plan.md` §2 (6/7 Wellen gebaut, NUR Φ6 Vorberechnung offen) |

---

## §1 — Die fünf offenen Bögen

### A. Φ — Welten-Netz/Archipel (Sprossen 1+2+3 GEBAUT; Φ6/Φ7 als Kür)

M9-Sprossen 1+2+3 sind GEBAUT (V18.188 + V18.189). Φ6 (verteilte Vorberechnung) ist die nächste
große Vision-Welle; Φ7 (Portal-Hallen) ist Kür.

| Welle | Was | Status |
|---|---|---|
| Φ0 | Last-Sonde (Snapshot 4.1 KiB brotli, Chunk-Build avg 116 ms, Adresse 394 B, REGION_CHUNKS=8 Erst-Wurf) | **GEBAUT V18.188** (`scripts/diag-archipel-last.cjs`, Report `artifacts/archipel-last.json`) |
| Φ1 | Welt-Adressen + tragendes Portal (`signWorldAddress` · `_admitForeignWorldAddress` · `setPortalAddress` · Bestätigungs-Karte + Antikörper „lügendes Portal") | **GEBAUT V18.188** (`checkBandPhiArchipel` 12 Wände) |
| Φ2 | Sichtbarkeit (4-stufig, Lobby-Bridge) + Gast-Rechte (3-stufig, Default frieden) + Hausrecht (kick · banPeer · banVibePassKey · Sieb am world-snapshot) | **GEBAUT V18.188** (R2 strukturell durch DSL-Disjunktheit) |
| Φ3 | Regions-Archipel V1 (opt-in via `regionsActive`, FROZEN REGION_CHUNKS=8 · SPAN=345.6m · HYSTERESIS=10m; Mathe-Helper + Auto-Detection + `_p2pRegionHandoff` als Re-Join) | **GEBAUT V18.189** (R6-Sanftheit: Default OFF; 9 Wände in `checkBandPhiArchipelV2`) |
| Φ4 | Anwesenheits-Schicht (Broker `world-presence` regional aufgelöst + Client-Cache + opt-in pro Welt) | **GEBAUT V18.189** (5 Wände + `smoke-multiuser` END-TO-END mit 3-Peer-Region-Probe grün) |
| Φ5 | Spenden-Schicht I: Mittragen (`pinCurrentWorld` · `_p2pMaybeServeAsCarrier` + Persistenz + hash-validiert) | **GEBAUT V18.189** (7 Wände — das Torrent-Modell wirkt) |
| Φ6 | Spenden-Schicht II: Vorberechnung + verteiltes Immunsystem (Präcompute-Jobs · signiertes Artefakt · Stichproben-Verify) | groß, eigene Welle |
| Φ7 | Portal-Hallen als Artefakte (signierte Welt-Verzeichnisse mit Φ1-Adressen, Kreis-Materialisierung mit entry-level worldAddress) | **GEBAUT V18.190** (12 Wände in `checkBandPhi7PortalHalls`; Coalesce-Lehre `entry.portalMeta || bp.portalMeta` — N gleiche Bauplan-Tore, N verschiedene Welten) |

**Voll-Plan:** `docs/archipel-plan.md`. **Φ-Bogen 6/7 GEBAUT.** **S-Browser-Abnahmen für
V18.188+V18.189+V18.190 offen** (Portal-Karte fühlen, Visibility-Wechsel, Lobby-Auftritt;
im Multi-Browser: zwei Peers in zwei Regionen einer Welt — Anwesenheits-Aura wenn gewünscht;
eine Halle mit 4-8 Adressen kuratieren + materialisieren + durch die Tore reisen).

### B. M9 — Aufstiegs-Leiter (die Krone, eigener Bogen)

Sieben Sprossen, jede braucht den S-Dialog am Tisch.

- **Sprosse 1** = Φ1+Φ2 ✓ V18.188 (das Netz)
- **Sprosse 2** = Φ3 ✓ V18.189 (das Archipel)
- **Sprosse 3** = Φ5 ✓ V18.189 (Mittragen-Foundation; F2-Stern als Selbst-Erweiterung ist eine separate Welle)
- **Sprosse 4-7** = S-Dialog, je Vision-getrieben

**Voll-Plan:** `docs/archiv/meister-plan.md` §3 + §8.6. **Φ und M9 verzahnen — Sprossen 1–3 stehen.**

### C. Γ-Reste (klein, optional, gut zu picken)

Der Γ-Kern ist gebaut (Γ1+Γ2+Γ5 V18.166, Γ4-Bogen V18.179-.181 via Synthese-Sub-3h+3i).

- **Γ7 Baum-Varianten-Grammatik** (`_growTreeBlueprint` emittiert Bauplan-Varianten) — video-getrieben zuletzt
- **Γ1 Lesart 5** (Ψ2-Nase — Geruch des Feldes) — die ferne fünfte Welt-Stimme als Nase
- **Γ3 Feld-Charakter** (Domain-Warp + Frequenz-Fächer) — optional, das kontinuierliche Feld interdigitiert schon
- **Γ-M Multi-Class-Material** (Strata/Iron-Bands/Lichen — ersetzt das alte Γ8)
- **Γ8 Kies+Saum** (schrumpft — Γ4½-Foundation-Felder konsumieren das)
- **Γ2 Totholz-Option** (Entscheid 4)

**Voll-Plan:** `docs/archiv/genese-plan.md`. Reihenfolge: Γ-M nach Γ4½ (steht), Γ7 video-getrieben zuletzt.

### D. LOD-Kaskade-Reste

U1/U3/U4/U5 gebaut. Offen:

- **U2 Wasser-LOD** (die FPS-Wurzel über fernem Wasser) — wartet auf Wasser-Render-Schöpfer-Entscheid
- **U6 echtes Clipmap** (größter Umbau, mehr-skaliges Chunk-Grid, eigener Bogen — die „Zukunft")

**Voll-Plan:** `docs/archiv/lod-kaskade-plan.md`. U2 erst nach §3 Wasser-Pfad-Entscheid sinnvoll.

### E. Wasser-Render-finale-Form (Schöpfer-Entscheid)

`docs/archiv/wasser-render-architektur-plan.md` §6 dokumentiert DREI Optionen mit Trade-offs (Schöpfer-Wahl).

---

## §2 — Die GEMERKTEN FÄDEN (Schöpfer 11.06.: „alle wichtig, nie vergessen")

| Faden | Status | Weck-Moment |
|---|---|---|
| R6 Selbst-Erweiterung | ✓ Kern V18.152 | (Rest = M9-Sprosse 3) |
| Phase E Bedrohung/Furcht | ✓ V18.148 | — |
| IndexedDB-Persistenz | ✓ V18.151 | — |
| Fahrzeug-Fahr-Tiefe | ✓ V18.150 | — |
| Statusbar schlanken | ✓ V18.149 | — |
| **B1 Wasser-Sheet→Worker** | OFFEN | wenn ein fühlbarer Carve-Hitch beim Schöpfer auftritt |
| **echtes V18→V19-Zeit-Portal** | OFFEN | wenn das erste Alt-Build-Artefakt geladen werden soll |
| **VR/WebXR** | OFFEN | wenn der Schöpfer es ruft (startet bei null) |

---

## §3 — Schöpfer-Entscheide (echt offen, projekt-unaufklärbar)

| ID | Frage | Default (Erst-Wurf) | Alternative | Wann anstehen |
|---|---|---|---|---|
| **R-031** | Werkzeug-Abnutzung? | ∞-Katalysator gilt (Gesamt-Abnahme 11.06.) | Mühe-Senke + „Reparieren"-Geste (taille-konform) | wenn Schöpfer einen Abnutzungs-Wunsch hat |
| **R-037** | T-Welle Typ-Sicherheit? | Ruhen lassen (no-build bleibt rein) | state-Typisierung investieren (490 tsc-Fehler, davon 416 TS2339 auf state-Bag — dann echtes Ratschen-Signal) | wenn ein dritter Hand mit-tippt |
| **Wasser-Pfad** | Welche der drei §6-Optionen? | dokumentiert in `wasser-render-architektur-plan.md` §6 | drei Optionen mit Trade-offs | wenn U2 Wasser-LOD ansteht |
| **R-039** | Devlog/Monatliche Welle-Schau? | unklar (Schöpfer-Domäne) | „Mensch+KI bauen ein Ultiversum" — Content den es nicht gibt | jederzeit |

Diese vier sind die ehrlich offenen Fragen — ALLE anderen offenen Wellen folgen aus Vision + Projekt-Kontext.

---

## §4 — Die S-Browser-Abnahmen (gebaut, Schöpfer-Auge offen)

Pflicht-Sign-offs:

- **R-001 bis R-036** (siehe `docs/rueckmeldung.md`) — alle als „gebaut, S-Abnahme offen" markiert.
- **Die Synthese-Werke V18.180-FIX bis V18.187:** Wald-WOW · AAA-Atmosphäre (3 Sonnen-Halos · 4. Cumulus · heightWeight 0.75 · microStrength 0.14) · Boden atmet bei genVersion ≥ 2 · Massiv ~700 m vom Spawn · 12 Streu-Vegetations-Varianten · pro-Halm-HSL-Tints · pro-Eichen-HSL-Tints · Λ.3 Wind-Sway · Λ.6 Subsurface-Backlit am Laub.

**Werkzeuge für den Schöpfer-Browser:**

| Skript | Was zeigt |
|---|---|
| `scripts/diag-fischer-wand.cjs` | AAA-Atmosphäre 6-Shot-Galerie |
| `scripts/diag-lambda-volltiefe.cjs` | Λ-Tiefen aller Achsen |
| `scripts/diag-lambda4.cjs` | Λ.4 Streu-Vegetation |
| `scripts/diag-lambda4-tag.cjs` | Λ.4 Tag-Lebendigkeit |
| `scripts/diag-lebendige-welt.cjs` | Λ.2 Tint-Verteilung |
| `scripts/diag-makro.cjs` | Γ4 Massiv+Tal+Becken A/B-Vista |
| `scripts/diag-ufer-pixel.cjs` | Γ1-Lesart-4 Boden-atmet A/B-Vista |
| `scripts/diag-wald.cjs` | W-H Wald-WOW (Yaw-σ + Painterly) |
| `scripts/diag-wbc-nachbau.cjs` | W-B/W-C/W-D Räume im Nutzer-Zustand |

---

## §5 — Empfohlene Reihenfolge

1. **S-Browser-Abnahme V18.188 + V18.189 + V18.190** (das Schöpfer-Auge prüft Φ1/Φ2/Φ3/Φ4/Φ5/Φ7 — Portal-Karte fühlen, eine Welt verlinken, Region wechseln, Anwesenheit pollen, eine fremde Welt pinnen, eine Halle kuratieren+materialisieren+durch die Tore reisen)
2. **Φ6 Spenden II** (Vorberechnung + verteiltes Immunsystem — die Tiefe der Mitträger-Schicht, eigene große Welle)
3. **ODER B1 Worker-Sheet** (Performance-Faden, wenn Carve-Hitch fühlbar)
4. **ODER U2 Wasser-LOD** (sobald Wasser-Render-Pfad-Entscheid steht)
5. **ODER Γ7 Baum-Varianten** (klein, video-getrieben)

Die größeren Pakete (Φ6 · M9-Sprossen 4+ · U6 · Wasser-Render-Bogen · Γ-M) sind eigene Bogen-Phasen, die am Tisch designt werden.

---

## §6 — Disziplin (aus der Synthese-Welle gelernt)

Der Synthese-Schluss V18.180-FIX bis V18.187 hat die heilige Lektion in NEUEN Formen gezeigt — die zehn permanenten Lehren leben in `CLAUDE.md` "Aktueller Stand"-Block + `docs/archiv/wellen-synthese-plan.md` §16. Besonders relevant für die nächsten Bögen:

- **Lehre 7 (V18.185):** Ein `static get X()` ohne Setter überdeckt `Klasse.X = ...` LAUTLOS in non-strict mode. Source-Probe-Wand MUSS Kommentare strippen.
- **Lehre 9 (V18.185):** Ein Reviewer mit fremden Augen fängt stille Bugs — Mess-Wand auf LIVE-Werten (nicht Source-Strings).
- **Lehre 10 (V18.187):** Ein ZU SCHMALES Test-Band gibt FALSCHE Sicherheit. Plan-Wortlaut nennt N Stufen → Wand MUSS N Klassen tragen.

Plus die Branch-Heilige-Lektion: „eine Welle nach der anderen am Stamm" — zwei parallele Branches haben die stille Bedingung gebrochen, und nur die Synthese hat das geheilt.

---

_Der Tisch trägt nur die nächste Tat. Ein Bogen erwacht → sein Plan kommt aus der Bibliothek
auf den Tisch. Er vollendet → zurück ins Archiv._
