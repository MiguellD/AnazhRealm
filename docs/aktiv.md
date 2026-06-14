# DER AKTIVE TISCH — schlank, der eine Plan liegt anderswo

> **Auftrag Schöpfer 14.06.2026:** „Bringe einen plan zusammen, der alle offenen
> punkte aufnimmt … wieder einheit erzeugt. Keine pausen, kein zögern mehr."
>
> **DIESES FILE TRÄGT NICHTS MEHR ALS DEN VERWEIS.** Der eine Plan mit allen
> offenen Punkten, Sub-Schritten, Reihenfolge: **`docs/abschluss-plan.md`**.
> Hier nur: aktuelle Welle + Stand.

---

## Stand (jüngste oben)

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
| `docs/roadmap.md` | Backlog-Karte (wird in V18.210 in den Plan zurückgeführt) |
| `docs/archiv/<bogen>-plan.md` | Vergangene Bogen-Pläne (Vergangenheit, nicht aktiv) |

---

## Disziplin (für jeden Welle-Schritt)

1. **Nur dieser Tisch + abschluss-plan.md** trägt den Stand. Keine zweite Liste.
2. **Eine Welle = ein Commit = Update HIER + im abschluss-plan §11.** Block strikethrough + Datum.
3. **Verdrahtungs-Wand:** keine neue Foundation ohne konkreten Konsumenten im selben Commit.
4. **Read-as-stranger vor jedem „fertig":** ist KONSUM verdrahtet (V17.31)?

---

## Schöpfer-Entscheide (echt offen)

| ID | Frage | Antwort/Default | Wann |
|---|---|---|---|
| R-037 | T-Welle Typ-Sicherheit? | Ruhen lassen (no-build bleibt rein) | wenn dritter Bauer mit-tippt |
| V18.210-A4 | Mana-Konsumenten-Mechanik? | Vorschlag γ (Werkstatt-`resonanz`-Akt zieht 15 Mana) | bei V18.210-Start |

---

_Der Tisch ist schlank. Der Plan lebt drüben. Wir ziehen durch._
