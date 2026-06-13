# Der aktive Tisch — DER EINE PLAN VORWÄRTS

> **Was hier liegt:** alle offenen Wellen + alle Schöpfer-Entscheide + die Reihenfolge.
> Volle Vergangenheit: `docs/archiv/handover.md` Chronik. Vision: `docs/state-of-realm.md` +
> `docs/das-lebendige-feld.md`. Die vollendeten Pläne (kampf · ui-putz · taille · robustheit ·
> sozial · welten-föderation · meister-marsch · genese-bogen · wellen-synthese) leben im Archiv —
> ein Bogen erwacht → sein Plan kommt auf den Tisch.

**Stand 13.06.2026 (V18.191 — `claude/stoic-archimedes-36l2it`):** **DER WELTEN-NETZ-BOGEN Φ IST RUND
(7/7 GEBAUT).** V18.188 Φ0+Φ1+Φ2 · V18.189 Φ3+Φ4+Φ5 · V18.190 Φ7 · **V18.191 Φ6** (Compute-Spende
+ Antikörper-Lauf-Aggregat — Worker-Asymmetrie als Geschenk-Schicht, Anti-Scope §3 ehrt: KEINE
Rechen-Währung). 58 neue Wände in 4 Test-Bands, smoke-multiuser end-to-end, alle Wände grün.
**M9-Sprossen 1+2+3 stehen** (Sprosse 1=Φ1+Φ2, Sprosse 2=Φ3, Sprosse 3=Φ5). Der Tisch trägt jetzt
nur noch: M9-Sprossen 4-7 (S-Dialog), Γ-Reste (klein, optional), LOD-Reste (S-Wahl),
Wasser-Render-Entscheid + die drei Schöpfer-Entscheide + die Browser-Sign-offs.

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
| **Φ-Bogen Φ0–Φ7 (M9-Sprossen 1+2+3 — DAS WELTEN-NETZ, RUND 7/7)** | **V18.188–V18.191** | `docs/archiv/archipel-plan.md` (ALLE Wellen GEBAUT; 58 Wände in 4 Test-Bands; smoke-multiuser end-to-end) |

---

## §1 — Die offenen Bögen

### A. Φ — Welten-Netz/Archipel (VOLLENDET 7/7, V18.188–V18.191; archiviert)

Alle sieben Wellen GEBAUT (`docs/archiv/archipel-plan.md`):

| Welle | Was | Wände |
|---|---|---|
| Φ0 | Last-Sonde (`scripts/diag-archipel-last.cjs`; Snapshot 4.1 KiB brotli · Adresse 394 B · REGION_CHUNKS=8 Erst-Wurf) | Report-Artefakt |
| Φ1 | Welt-Adressen + tragendes Portal (signiert · admittiert · Bestätigungs-Karte + Antikörper „lügendes Portal") | 12 (V18.188) |
| Φ2 | Sichtbarkeit 4-stufig + Lobby-Bridge · Gast-Rechte 3-stufig · Hausrecht (kick·ban·banVibePassKey · Sieb am world-snapshot) | (V18.188) |
| Φ3 | Regions-Archipel (opt-in `regionsActive` Default OFF · R6-Sanftheit · FROZEN-Geometrie · Mathe + Hysterese-Handoff) | 9 (V18.189) |
| Φ4 | Anwesenheits-Schicht (Broker `world-presence` regional · Client-Cache · opt-in pro Welt) | 5 + smoke-multiuser end-to-end |
| Φ5 | Mittragen-Schicht (`pinCurrentWorld` · `_p2pMaybeServeAsCarrier` · Persistenz · hash-validiert) | 7 (V18.189) |
| Φ6 | Compute-Spende + Antikörper-Lauf (`pinComputeContribution` · `verifyComputeContribution` Stichproben-Wand · `recordPlaytestRun` · R4-Eskalation bei forged) | 13 (V18.191) |
| Φ7 | Portal-Hallen als Artefakte (signierte Welt-Verzeichnisse · Coalesce `entry.portalMeta \|\| bp.portalMeta` · Kreis-Materialisierung) | 12 (V18.190) |

**M9-Sprossen 1+2+3 ✓** (Sprosse 1=Φ1+Φ2 das Netz · Sprosse 2=Φ3 das Archipel · Sprosse 3=Φ5+Φ6
die tragende+rechnende Menge). **S-Browser-Abnahmen offen** (Portal-Karte fühlen,
Visibility-Wechsel, Region wechseln, Anwesenheit pollen, eine Welt pinnen + als Mitträger
antworten, Halle kuratieren+materialisieren+durchreisen, Compute-Beitrag verifizieren).

### B. M9 — Aufstiegs-Leiter (Sprossen 1–3 GEBAUT, 4-7 S-Dialog)

- **Sprosse 1** = Φ1+Φ2 ✓ V18.188 (das Netz)
- **Sprosse 2** = Φ3 ✓ V18.189 (das Archipel)
- **Sprosse 3** = Φ5+Φ6 ✓ V18.189+V18.191 (Mittragen + Compute-Spende)
- **Sprosse 4-7** = S-Dialog, je Vision-getrieben

**Voll-Plan:** `docs/archiv/meister-plan.md` §3 + §8.6.

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

1. **S-Browser-Abnahme V18.188–V18.191** (das Schöpfer-Auge prüft den ganzen Φ-Bogen — Portal-Karte fühlen, Welt verlinken, Region wechseln, Anwesenheit pollen, Welt pinnen + als Mitträger antworten, Halle kuratieren+materialisieren+durchreisen, Compute-Beitrag verifizieren)
2. **B1 Worker-Sheet** (Performance-Faden, wenn Carve-Hitch fühlbar)
3. **ODER U2 Wasser-LOD** (sobald Wasser-Render-Pfad-Entscheid steht)
4. **ODER Γ7 Baum-Varianten / Γ1 Lesart 5 (Geruch) / Γ3 Feld-Charakter / Γ-M Strata** (klein, gut zu picken)

Die größeren Pakete (M9-Sprossen 4+ · U6 · Wasser-Render-Bogen · Γ-M) sind eigene Bogen-Phasen, die am Tisch designt werden.

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
