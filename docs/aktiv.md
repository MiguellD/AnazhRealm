# DER AKTIVE TISCH — schlank, der eine Plan liegt anderswo

> **Auftrag Schöpfer 14.06.2026:** „Bringe einen plan zusammen, der alle offenen
> punkte aufnimmt … wieder einheit erzeugt. Keine pausen, kein zögern mehr."
>
> **DIESES FILE TRÄGT NICHTS MEHR ALS DEN VERWEIS.** Der eine Plan mit allen
> offenen Punkten, Sub-Schritten, Reihenfolge: **`docs/abschluss-plan.md`**.
> Hier nur: aktuelle Welle + Stand.

---

## Stand (jüngste oben)

**14.06.2026 — V18.210 VERDRAHTUNGS-WELLE GEBAUT, Branch `claude/relaxed-hawking-dzkj9g`:**

Die vier Sub-Akte aus `docs/abschluss-plan.md §1` sind verdrahtet, alle Wände
grün (~3500 Invarianten), `npm run smoke:multiuser` grün:
- **A1** Γ7 Worldgen-Hook: `_growTreeBlueprintForSpawn` mit REGION-Caching
  (256m-Grid × Welt-Seed × Species → 1 Bauplan/Hain, Instancing wirkt), gen
  Default 3→4, V17.16-Tag-Wand
- **A2** R5 Live-Slider: `setStructureBoost` + Live-TSL-Uniform + DOM-Slider
  „Struktur-Tiefe", Default 1.0→1.3 (sichtbar), `_applySubstanceResponse` liest
  Uniform statt Konstante
- **A3** _scentAt KI: wild-Temperament wittert scheu/sanft/wehrhaft-Beute in
  50m, 4-Richtungs-Gradient, strike via `damageCreature("jagd")`, replaced
  NEUTRAL-wander-Branch
- **A4** Mana-Konsument γ: `phaseChange`-Op-Klasse (imbue/ritueller-stab/
  soulwork-Werkstatt) zieht 15 Mana statt 10 Stamina, Floor 5, Anti-Scope §3
  (keine DSL-Op-Schleuse), Werkstatt + Hand-Pfad spiegeln EXAKT

**Permanente Lehre (V18.210-A1):** ein Hash-Per-Spawn-Cache (jeder Spawn anderer
Hash → N×InstancedMesh mit je 1 Instance) BRICHT das Instancing-Pattern.
Region-basierter Cache (~256m-Grid) ist die synergetische Form: lokaler Wald-
Stil emergiert + Instancing wirkt. Generell: wer einen Generator in den
Worldgen-Hook hängt, MUSS Cache-Granularität GEGEN den Konsumenten messen
(Instancing erwartet wenige Bauplane, viele Instances; nicht umgekehrt).

**Nächste Welle: V18.211 — Browser-Sign-off-Galerie** (siehe abschluss-plan
§2, 25 Schliffe B1-B25 inkl. der vier verdrahteten Foundations: Γ7 Wald-Stil
emergent · R5 Strukturen sichtbar tiefer · Scent-Hunt fühlbar · Mana-Drain
sichtbar). Vorher: Commit + Doku-Sync.

---

## Quellen-Karte (was wo lebt)

| Quelle | Was sie trägt |
|---|---|
| **`docs/abschluss-plan.md`** | DER EINE PLAN — alle offenen Punkte mit Sub-Schritten + Reihenfolge V18.210-V18.230+ |
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
