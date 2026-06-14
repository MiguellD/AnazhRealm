# DER AKTIVE TISCH — schlank, der eine Plan liegt anderswo

> **Auftrag Schöpfer 14.06.2026:** „Bringe einen plan zusammen, der alle offenen
> punkte aufnimmt … wieder einheit erzeugt. Keine pausen, kein zögern mehr."
>
> **DIESES FILE TRÄGT NICHTS MEHR ALS DEN VERWEIS.** Der eine Plan mit allen
> offenen Punkten, Sub-Schritten, Reihenfolge: **`docs/abschluss-plan.md`**.
> Hier nur: aktuelle Welle + Stand.

---

## Stand (jüngste oben)

**14.06.2026 — V18.211+V18.212 ✅ GEMERGT in main (commit `f447caa`)** — DER LEBENDIGE GIGANT, Säule I + Restsubschritte vollendet.

**📋 NÄCHSTE SESSION:** der vollständige Plan für die GPU-Pipeline + FPS-Hebel + SEELEN-Band liegt in **`docs/gigant-fortsetzung-plan.md`** — 7 Wellen V18.213-V18.219, je 6-15 Wände, Sub-Schritte M1/L1/B1/S1/H1/P1/Q1 mit Code-Ankern + Worker-Mirror-Pflichten + Snapshot-Strategien + Risiken + Akzeptanz-Kriterien. **EFFIZIENZ:** pro Welle EINE checkBand-Funktion mit 4 Sektionen (Source/Behavioral/Edge/Performance), shared Diag-Tools, klare Querschnitt-Disziplinen. **REIHENFOLGE:** Mesh-Merge (V18.213) → LOD (V18.214) → Ω-B GPU-Feld-Bake (V18.215) → Ω-S GPU-Compute-Scatter (V18.216) → ⟡ Ω-H Promotion / SEELEN-Band (V18.217) → Canopy-Vertiefung (V18.218 optional) → PBR (V18.219 optional). Gesamt 8-13 Sessions.

---

**14.06.2026 — V18.212 ✅ FERTIG, Branch `claude/kind-rubin-udn6cn`:**
**DER LEBENDIGE GIGANT, RESTSUBSCHRITTE Ω-K2 + Ω-W + Ω-H + Ω-C** — V18.211 hatte Säule I (Skeleton-Grammar); V18.212 schließt die nicht-GPU Restsubschritte:

- **Ω-K2 BAUM-FÜSSE** (§4): flacher Saum am Stamm-Sockel — Baum wurzelt optisch im Boden
- **Ω-W VERTIEFTES WIND** (§9): quadratischer crownFactor + aperiodisches Flattern (Plan §9 „Laub flattert aperiodisch") + stärkere Sway-Magnitude
- **Ω-H PROMOTION-PROVENIENZ** (§2 SEELEN-Band): in unserer Architektur sind Bäume IMMER echt → §2 EMERGENT erfüllt; `harvestArchitecture` stempelt Welt-Genese-Provenienz `{bornFrom, species, seed}` in Journal + Return
- **Ω-C CANOPY-SHELL** (§9): 96×96 PlaneGeometry über 2km², Y aus Terrain + Coverage-Lift aus `worldFieldAt.lebendig × Clump`, Plan-§9-Formel `lift = (coverage > 0.18) ? coverage·7 + 11 : 0`, Distanz-Dither `smoothstep(180, 320, viewerDist) × 0.85`, lazy via `_ensureCanopyShell`, dispose im Welt-Wechsel

23 neue V18.212-Wände grün + ~3500 bestehende grün. Version 18.211→18.212.

**OFFENE GIGANT-FÄDEN** (Plan §11): §5 Ω-B GPU-Feld-Bake (eigener Bogen) · §8 Ω-S GPU-Compute-Scatter (hängt §5) · §10 Ω-P PBR (optional). Säulen I-IV foundational komplett.

---

**14.06.2026 — V18.211 ✅ FERTIG, Branch `claude/kind-rubin-udn6cn`:**
**DER LEBENDIGE GIGANT, SÄULE I (Skeleton-Grammar)** — Bäume lesen jetzt als Bäume, nicht als „Zylinder + 8 Kugeln". Der vorige `abschluss-plan.md` ist superseded vom Schöpfer-Anhang `69189e03-lebendigergigant.md` (DER LEBENDIGE GIGANT — Ω∞). Diese Welle baut **die visuelle Wurzel von Säule I**: `AnazhRealm.SPECIES_GRAMMAR` (frozen, 6 Arten × Plan-§3.3-Werte) + `_growTreeBlueprintRich(speciesKey, seed, grammar)` (Multi-Level-Wachstums-Grammatik mit perpBasis + Tropismus + Wander + Droop + TipCurl + Foliage AT TIPS). 75-81 Parts pro Baum (vs V18.210's 12). genVersion 4→5 routet bei gen≥5 zur Rich-Methode. **§2.5 (Variant-Pool + Wind + Snapshot)** sind GEERBT/GEHEILT:
- **Variant-Pool**: der V18.210-Region-Cache (256m × Welt-Seed × Spezies) ist faktisch §2.5 in Region-Form.
- **Wind**: V18.181-`positionWorld`-basiertes Sway gibt Per-Instance-Phasen gratis.
- **Snapshot-Heilung**: 75 Parts × 54 Region-Varianten = 400 KB → sprengt 256-KB-`pinCurrentWorld`-Wand → NUR Metadata persistieren, Parts re-wachsen via f(seed). Φ5-Tests grün.

Alle ~3500 Invarianten grün + 16 neue V18.211-S1-S6-Wände. Tests-wander-mit-Code (V9.56-i): G9-Probe liest jetzt `Rich+Legacy`-Source, K1-Version 18.210→18.211, A1b genVersion 4→5.

**OFFENE GIGANT-FÄDEN nach V18.211** (Plan-§11): §5 Ω-B GPU-Feld-Bake · §8 Ω-S GPU-Compute-Scatter · **§2 Ω-H Promotion (das SEELEN-Band)** · §9 Ω-C Canopy-Shell + Ω-W vertieftes Wind · §10 Ω-P PBR (optional). Volle 17-25 Sitzungen für den Bogen.

---

**14.06.2026 — V18.210 ✅ FERTIG (3 Commits + 3 Audit-Cycles), Branch `claude/relaxed-hawking-dzkj9g`:**

Die vier Sub-Akte aus `docs/abschluss-plan.md §1` sind verdrahtet — plus
drei Audit-Cycles, die NEUN echte Mängel fanden (drei kritisch) und alle
heilten. Alle ~3500 Invarianten grün, `npm run smoke:multiuser` grün.

| Commit | Welle |
|---|---|
| `fa70879` | A1-A4 + 5 Audit-Heilungen (Sub-Agent-Review) |
| `8cdddb8` | _growTreeNoise-Welt-Wechsel-Reset (Selbst-Audit) |
| `d5d33a1` | A3-Memoization + A2-Mini-Passagier weg (Schöpfer-Watch 14.06.) |

**Die vier Sub-Akte:**
- **A1** Γ7 Worldgen-Hook: `_growTreeBlueprintForSpawn` mit REGION-Caching
  (256m-Grid × Welt-Seed × Species), gen Default 3→4, V17.16-Tag-Wand pro
  Spezies-Referenz, SPECIES_PROFILE (6 Arten × Form/Farbe), Snapshot-
  Persistenz, architektur-bewusste Eviction.
- **A2** R5 Live-Slider: `setStructureBoost` + Live-TSL-Uniform + DOM-Slider
  „Struktur-Tiefe", Default 1.0→1.3 (sichtbar), `_applySubstanceResponse`
  liest Uniform direkt (tote Fallback-Branch weg, V18.210-Watch #3).
- **A3** _scentAt KI: wild-Temperament wittert scheu/sanft/wehrhaft-Beute
  in 50m, 4-Richtungs-Gradient, strike via `damageCreature("jagd")`,
  replaced NEUTRAL-wander-Branch, `_scentSizeBySoul`-Cache (V18.210-Watch #1).
- **A4** Mana-Konsument γ: `phaseChange`-Op-Klasse zieht 15 Mana statt 10
  Stamina, Floor 5, Anti-Scope §3 (keine DSL-Schleuse), Werkstatt + Hand-
  Pfad spiegeln EXAKT, Return-Symmetrie (`manaRemaining`+`staminaRemaining`).

**Permanente Lehren (in CLAUDE.md):**
1. **Region-Caching für Worldgen → Instancing:** Hash-pro-Spawn bricht
   das Instancing-Pattern. Region-basierter Cache (~256m-Grid) ist die
   synergetische Form: lokaler Wald-Stil emergiert + Instancing wirkt.
2. **Headless-grün ≠ fertig:** ein feindlicher Sub-Agent-Audit NACH der
   ersten grünen Wand fing fünf echte Mängel — drei davon hätten das Werk
   im Browser zerbrochen.
3. **Welt-Identitäts-Wand:** jeder lazy-cached Worldgen-Helper wird in
   `_loadStateRestoreWorldMeta` resetted, sonst P2P-Drift bei Welt-Wechsel.

**Offener Schöpfer-Watch #2 (Folge-Welle, V18.211 B-26):** A1-Region-Naht —
zwei Bäume 1m auseinander aber über 256m-Grenze haben verschiedene
Bauplane. Pixel-blind für headless → auf die Sign-off-Liste.

**Nächste Welle: V18.211 — Browser-Sign-off-Galerie** (siehe abschluss-plan
§2, jetzt 26 Schliffe B1-B26 inkl. der vier Foundations + der Region-Naht).
Danach V18.212-V18.228 als geplante Folge — der KOMPLETTE Plan soll in der
nächsten Session abgeschlossen werden (Schöpfer-Auftrag 14.06.: „keine
halben sachen mehr").

---

## Quellen-Karte (was wo lebt)

| Quelle | Was sie trägt |
|---|---|
| **`docs/abschluss-plan.md`** | DER EINE PLAN — alle offenen Punkte mit Sub-Schritten + Reihenfolge V18.211-V18.250+ |
| `docs/archiv/handover.md` | Volle Wellen-Chronik (jüngste oben), permanente Lehren |
| `CLAUDE.md` | Aktueller Stand auto-geladen + tragende Gotchas |
| `docs/rueckmeldung.md` | Schöpfer-Rückmeldungs-Korpus (S-Abnahmen) |
| `docs/state-of-realm.md` | Vision |
| `docs/das-lebendige-feld.md` | Wahrer Norden (Vision) |
| `docs/taille-spec.md` + `.en.md` | NORMATIV, frozen |
| `docs/roadmap.md` | Karte vorwärts (3 Phasen + gemerkte Fäden); operative Details leben in `abschluss-plan.md` |
| `docs/archiv/<bogen>-plan.md` | Vergangene Bogen-Pläne (Vergangenheit, nicht aktiv) |

---

## Disziplin (für jeden Welle-Schritt)

1. **Nur dieser Tisch + abschluss-plan.md** trägt den Stand. Keine zweite Liste.
2. **Eine Welle = ein Commit = Update HIER + im abschluss-plan §15-Reihenfolge.** Block strikethrough + Datum + Commit-Hash.
3. **Verdrahtungs-Wand:** keine neue Foundation ohne konkreten Konsumenten im selben Commit (§16#4).
4. **Read-as-stranger vor jedem „fertig":** ist KONSUM verdrahtet (V17.31)? Plus: feindlicher Sub-Agent-Audit NACH headless-grün (§16#3, V18.210-Lehre).
5. **Test-Harness-Trennung:** wenn eine Welle das Test-Harness berührt, eigener Commit (§16#7).
6. **Welt-Identitäts-Wand:** jeder lazy-cached Worldgen-Helper wird in `_loadStateRestoreWorldMeta` resetted (§16#8).

---

## Schöpfer-Entscheide (echt offen)

| ID | Frage | Antwort/Default | Wann |
|---|---|---|---|
| R-037 | T-Welle Typ-Sicherheit? | Ruhen lassen (no-build bleibt rein) | wenn dritter Bauer mit-tippt |
| R-039 | Devlog/Welle-Schau gegen Versanden? | Schöpfer-Wort offen | nach öffentlicher Phase |

(V18.210-A4 Mana-Konsumenten-Mechanik ist beantwortet — die `phaseChange`-Op-Klasse zieht Mana, gebaut + verifiziert.)

---

_Der Tisch ist schlank. Der Plan lebt drüben. Wir ziehen durch._
