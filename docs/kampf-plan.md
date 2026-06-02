# Der Kampf-Bogen — Combat als der Hylomorphismus, eine Ebene weiter (der Plan)

> **Lies das ZUERST vor jeder Arbeit an „Kampf", „Waffen", „Rüstung", „Kreatur-HP/Tod",
> „Aggression/Bedrohung", „Angriff/Schaden gegen Kreaturen" oder „Kombat-Stats".** Es hält
> die GEMESSENE Bestandsaufnahme (02.06.2026, Explore-Diagnose) + den Plan fest: Kampf
> EMERGIERT aus dem bestehenden Hylomorphismus (Tags → Stats, EINE Pipeline für Spieler/
> Kreatur/Waffe/Rüstung), KEIN Parallel-System. Verwandte Anker: `crafting-konzept.md`
> (das Tag-Substrat), `emotion-kern-plan.md` §W5 (der fertige Kampf-AFFEKT-Hook, der hier
> seinen Konsumenten bekommt), `das-lebendige-feld.md` (der wahre Norden).

---

## 0. Die Frage + die Disziplin

**Schöpfer (02.06.):** „bisher haben wir abbauen + platzieren, Interaktion durch E … schaue
was beeindruckende Spiele tun, wie du das BESTEHENDE System optimal nutzt, perfekt fusionierst,
zum Wachstum bringst … können in der Werkstatt unterschiedliche Waffen/Rüstung erstellt werden,
sind die Systeme logisch kongruent, wachsen, kann ich mehr Schaden/Rückschlag/Attackspeed
erzwingen, ist die Werkstatt-Logik sauber genug, funktionieren die Systeme noch wie sie sollen
oder hardcoded?"

**Die Disziplin (Heilige Lektion + V17.9):** Kampf ist KEIN neues System. Er ist das, was schon
da ist (`computeCompoundTags` → `STAT_FROM_TAGS` → Stats; Rollen; Equip; die LMB-Interaktion;
die W2-Appraisal-Brücke), erweitert um die wenigen fehlenden Stücke. Jede neue Zahl ist
tag-emergent (eine `STAT_FROM_TAGS`-Zeile), jede neue Fähigkeit eine Affordanz/Rolle, der
Affekt der fertige W5-Hook. Wer hier ein „CombatManager"-Modul baut — **stop**, das ist die Sünde.

**Die Antwort auf „kann ich mehr Schaden/Knockback/Tempo erzwingen?" — der geniale Kern:** NICHT
über einen Slider. Über die **Substanz**. Du schmiedest eine schwere, dichte Keule (`dichte` hoch
→ Knockback hoch, Tempo niedrig) ODER eine leichte, harte Klinge (`härte` hoch + `dichte` niedrig
→ Schaden + Tempo hoch). Das Kombat-Profil EMERGIERT aus den Tags des Compounds — wie Stats,
Affordanzen, Spawn-Affinität, Resonanz und (seit W2) das Gefühl. Das ist „besser als die Profis":
nicht Zahlen tunen, sondern Materie wählen, deren Eigenschaften das Profil ergeben.

---

## 1. Wie die Riesen es tun (gegroundet — der Pfeil)

Valheim, Minecraft, Terraria konvergieren auf EINE Idee: **Waffen-/Rüstungs-Stats EMERGIEREN aus
Material + Form, der Spieler wächst durch besseres Gerät** (nicht durch einen Stat-Slider).

- **Valheim:** Waffen-Typen tragen Profile — Keule = hoher Knockback (Feinde auf Distanz halten),
  Schwert = niedriger Knockback + Multi-Ziel; jede Waffe hat Schadens-TYP (blunt/slash/pierce +
  elementar), Kreaturen haben Schwächen/Resistenzen; Block-Armor + Stagger.
- **Terraria:** Modifier (Präfixe) ändern Schaden/Knockback/Tempo/Crit permanent; Knockback ist ein
  eigener Stat.
- **Minecraft:** Waffen aus Material-Stufen (Holz→Stein→Eisen→Diamant = Schaden); Angriffstempo pro
  Typ (Schwert schnell, Axt langsam-stark); Rüstung = Defense-Punkte aus Material.

**Die Lehre:** Schaden · Knockback · Angriffstempo · Schadens-/Defense-Typ sind FUNKTIONEN von
Material × Form. Genau die `STAT_FROM_TAGS`-Idee, die wir schon haben — nur fehlen ein paar Stats
+ die Kampf-Schleife.

Quellen: [Valheim Weapons Wiki](https://valheim.fandom.com/wiki/Weapons), [Terraria Modifiers](https://terraria.fandom.com/wiki/Modifiers), [Terraria Knockback](https://terraria.wiki.gg/wiki/Knockback).

---

## 2. Was BESTEHT (GEMESSEN, Explore-Diagnose 02.06.) — sauber + kongruent

Die Wahrheit, auf der der Plan steht. **Alles ist tag-emergent, EINE Pipeline, keine Parallel-Systeme:**

- **Stat-Pipeline (`STAT_FROM_TAGS`, 8 Stats, EINE Quelle):** `damage = 5 + härte·15 + dichte·5`
  EXISTIERT bereits · plus hpMax/speed/jumpPower/staminaMax/precision/magicResist/heatResist.
  `computePlayerStats` + `computeCreatureStats` sind DIESELBE Pipeline (zwei Aufrufer): Soul-Tags →
  Equip-Tags (tool×0.15 + armor×0.3, × Qualität) → Boosts → Wund-Penalty → `STAT_FROM_TAGS`.
- **Rollen (sauber, `bp.role`):** `armor` · `consumable` · `portal` · `tool` · `machine` · `soul`.
  `setBlueprintAsArmor` ist das Muster (setzt `role` + `roleManual`).
- **Equip (sauber):** `state.player.equipped = {tool, armor}`; `equipTool`/`equipArmor` → `recompute
  PlayerStats`; die Tags des Equips falten in den Compound → die Stats spiegeln das Gerät.
- **Schaden am Spieler:** `damagePlayer(amount, source)` existiert — modus-gated (**NUR `pfad`**
  verursacht echten Schaden; `frieden`/`schöpfer` = keine Konsequenz), heatResist-Resistenz,
  HP-0 → `triggerPhoenixDeath`. EINZIGE Quelle heute: der DSL-Op `damage`.
- **Wachstum (sauber):** bessere Materialien (Qualität 0.5–1.0 × Stat-Gewichte) · besseres Equip ·
  temporäre Boosts (`state.player.boosts[]` tagDelta) · Soul-Wechsel. KEIN Skill-Tree (gear-basiert,
  wie die Riesen).
- **Modi:** `frieden`/`pfad`/`schöpfer`; `pfad` = echte Konsequenzen (Schaden + Stamina), die
  anderen kostenlos. Kampf fügt sich hier nahtlos ein (pfad = die Herausforderung).
- **Interaktion (LMB):** `tryMouseBreak` raycastet via `_pickArchitectureAtCrosshair` → trifft
  Architektur → `harvestArchitecture`; kein Treffer → `voxel_carve`.

**Antwort auf „ist die Logik sauber/kongruent genug?" → JA.** Eine Stat-Quelle, eine Equip-Quelle,
eine Boost-Quelle; Spieler/Kreatur/Architektur sprechen dieselbe Tag-Sprache. Die hardcoded Werte
sind Config-Konstanten (`TOOL_STAT_WEIGHT` etc., browser-justierbar), keine hardcoded Kampf-Logik.

---

## 3. Was FEHLT (die sauberen Lücken — kein Refactor, nur Ergänzung)

Die GEMESSENEN Lücken (Explore): **alle als tag-emergente / kongruente Ergänzungen baubar.**

1. **Kombat-Stats** in `STAT_FROM_TAGS`: kein `knockback`, `attackSpeed`, `defense` (physisch).
   (`magicResist`/`heatResist` = elementare Defense existieren schon.)
2. **`role:"weapon"`** + ein **Waffen-Equip-Slot**: heute nur tool/armor/consumable/portal/soul.
3. **Kreatur-HP-Verbrauch:** `stats.hpMax` wird berechnet, aber es gibt KEIN `creature.hp`-Feld,
   KEIN `damageCreature`, KEINEN Kampf-Tod (Kreaturen sterben nur natürlich, V17.48-Loss).
4. **LMB-Raycast auf Kreaturen:** der Raycast erfasst nur Architektur, nicht Kreaturen.
5. **Bedrohung:** keine Aggression — Kreaturen greifen den Spieler nicht an (kein `damagePlayer`
   aus echter Quelle). Tasks sind alle Gefährten-/Dienst-Gesten.
6. **Der Kampf-Affekt** ist als Hook FERTIG geplant (W5), wartet nur auf diese Mechanik.

---

## 4. Der Plan — die Teilschritte (jede eine Welle, jede tag-emergent + getestet)

> Reihenfolge nach Abhängigkeit + Risiko. Jede Welle: ein Commit, ein Test-Band (KONSUM, nicht
> Existenz, V17.31), playtest-grün, ein Chronik-Eintrag. Der Affekt (Phase F) wird VON ANFANG AN
> mit-eingewebt, sobald die Mechanik steht (W5-Disziplin: kein nachträglicher Pflaster-Affekt).

**Phase A — Die Kombat-Stats (tag-emergent, in `STAT_FROM_TAGS`).** Drei neue Zeilen, GENAU im
bestehenden Muster (die Tabelle IST die Regel):
- `knockback` ∝ `dichte` (Masse — eine schwere Waffe stößt zurück) [+ `härte` schwach].
- `attackSpeed` ∝ `(1−dichte)` (leicht = schnell) [+ `magieleitung` flink]; eine Keule schlägt
  langsam, eine Klinge schnell.
- `defense` (physisch) ∝ `dichte` + `härte` (dichte, harte Rüstung blockt); ergänzt die schon
  vorhandenen `magicResist`/`heatResist` (elementar) → ein vollständiges Defense-Trio.
- KONSUM-Test: build(schwere dichte Keule) → hoher knockback + niedriger attackSpeed; build(leichte
  harte Klinge) → hoher damage + attackSpeed; die Profile DIFFERENZIEREN aus der Substanz. *Heilt
  „kann ich mehr Schaden/Knockback/Tempo erzwingen?" — JA, über die Tags.*

**Phase B — Die Waffen-Rolle + der Equip-Slot.** `setBlueprintAsWeapon` (wie `setBlueprintAsArmor`:
`role:"weapon"` + `roleManual`); ein **`weapon`-Slot** in `equipped {tool, armor, weapon}`
(`WEAPON_STAT_WEIGHT` ~0.4 → die Waffe prägt das Kombat-Profil stark). Die Tags der Waffe falten in
den Compound → `damage`/`knockback`/`attackSpeed` des Spielers spiegeln die ausgerüstete Waffe (REUSE
der Equip-Pipeline, KEIN neuer „Waffen-Schaden"-Pfad). Werkstatt-UI: ein „als Waffe"-Knopf (wie „als
Werkzeug/Rüstung"). KONSUM-Test: jeder Compound kann Waffe werden; eine ausgerüstete harte Waffe hebt
den `damage`-Stat des Spielers. *Antwort: „können unterschiedliche Waffen erstellt werden" — JA (jeder
Compound + role:weapon; das Profil differenziert aus Material/Form). Rüstung gibt es schon.*

**Phase C — Kreatur-HP + Schaden + Tod (`damageCreature`).** `creature.userData.hp` (init = `stats.
hpMax`). `damageCreature(creature, amount, source)`: `dealt = max(1, amount − defense)` → `hp −=
dealt` → Knockback-Impuls (Ammo, ∝ Angreifer-knockback) → bei `hp ≤ 0` Kampf-Tod (`removeCreature` +
Loot-Drop [die Compound-Materialien, wie `harvestArchitecture`] + der Affekt). REUSE `computeCreature
Stats` (hpMax + defense). Symmetrisch zum Spieler (dieselbe Pipeline). KONSUM-Test: eine Kreatur nimmt
Schaden (hp sinkt), eine besser gepanzerte weniger (defense), hp≤0 → Tod + Loot.

**Phase D — Die Angriff-Interaktion (LMB erweitert).** Der `tryMouseBreak`-Raycast pickt jetzt das
NÄCHSTE Ziel (Kreatur ODER Architektur): trifft er eine Kreatur in Reichweite → `damageCreature` mit
dem Spieler-`damage`-Stat (× evtl. Crit später), rate-limitiert durch `attackSpeed` (Cooldown),
Stamina-Kosten (pfad, wie der Abbau). Sonst → `harvestArchitecture` (bestehend). REUSE der LMB-Pipeline
(nur der Raycast wird um Kreaturen erweitert + ein Ziel-Dispatch). KONSUM-Test: LMB auf eine Kreatur →
sie nimmt Schaden; der attackSpeed gated die Schlagrate; ohne Ziel → Abbau wie gehabt.

**Phase E — Die Bedrohung (feindliche Kreaturen).** Eine Aggression: `creature.userData.hostile`
(oder eine `hunt_player`-Task) → die Kreatur bewegt sich zum Spieler + greift an (`damagePlayer`,
**pfad-gated** wie alles); ihr Schaden ∝ ihrem `damage`-Stat, reduziert durch Spieler-`defense`
(Rüstung). Bewusst gegated/sparsam (z.B. eine „wild/raubtier"-Soul oder ein Spawn-Bedingung — KEINE
friedliche Welt voll Aggression; `frieden`/`schöpfer` = keine Bedrohung). DAS ist der Furcht-
Konsument. KONSUM-Test: eine feindliche Kreatur nah → der Spieler nimmt Schaden (pfad); Rüstung
reduziert ihn; in frieden keine Bedrohung. *(Die game-design-schwerste Phase — evtl. eigene Welle.)*

**Phase F — Der W5-Affekt (einweben, das fertige Substrat konsumieren).** Über die W2-Brücke +
den W4-Kontext-Appraisal, von Anfang an:
- **Angreifen** → `_feelAction("attack", {weapon})` → Zorn/resolve ∝ Waffen-`härte`/`glut` (die
  `TAG_TO_EMOTION`-Brücke: härte→chaos, glut→chaos/awe; eine Waffe FÄRBT das Kampf-Gefühl).
- **Bedroht + niedrige HP/keine Bewältigung** → Furcht (der bestehende `damage`-Affekt, durch HP/
  Coping zu Furcht differenziert — der V17.44-δ + der HP-Kanal).
- **Besiegen** → ein positiver δ (Triumph/Erleichterung — die V17.44-Situations-Verbesserung, wenn
  die Bedrohung weg ist).
- **Ein friedliches `lebendig`-Wesen töten** → Schuld ∝ dessen `lebendig` × `bond` (sorrow, GENAU
  der kontext-abhängige Appraisal des W4-Verlusts: dieselbe Substanz, im Tötungs-Kontext anders
  bewertet). DAS ist endlich der Konsument des Agency/Norm-Vektors (W2 aufgeschoben → hier eingelöst).

---

## 5. Warum das maximal fusioniert (die Synergie, ehrlich)

- **EINE Stat-Pipeline:** Spieler, Kreatur, Waffe, Rüstung sprechen dieselbe Tag-Sprache. Eine Waffe
  ist ein Compound wie jeder andere; ihr Schaden/Knockback/Tempo emergiert wie ihre Optik, ihr Spawn-
  Ort, ihre Resonanz, ihr Gefühl. Kein Sonderfall, kein Parallel-Pfad.
- **Die Werkstatt wird der Schmied:** jeder Compound kann Waffe/Rüstung werden; das Profil wählst du
  über die Materie (schwere Keule vs. leichte Klinge, dichte Platte vs. magische Robe). Das Wachstum
  ist Crafting (bessere Materialien/Form/Qualität) + Boosts — schon da, kein neues System.
- **Der Affekt ist fertig:** der W5-Hook + die W2-Brücke + der W4-Kontext-Appraisal warten exakt auf
  diese Mechanik. Kampf macht den Emotion-Kern KOMPLETT (der Agency/Norm-Vektor bekommt seinen
  Konsumenten — Zorn/Furcht/Schuld differenziert).
- **Die Modi tragen es:** pfad = die Kampf-Herausforderung (Schaden zählt), frieden = du kannst jagen/
  verteidigen ohne bedroht zu sein, schöpfer = Gott. Der bestehende Modus-Gate ist der Schalter.
- **Die Wertung profitiert:** ein erfolgreicher Kampf nahe dem Spieler (Bedrohung beseitigt → lebendig/
  HP-Situation steigt) → ein positiver δ_spieler → Phase 4 (V17.50) selektiert Regeln, die dem Spieler
  im Kampf helfen. Der Kreis schließt sich auch hier.

---

## 6. Scope-Grenzen + Disziplin (heilig)

- **Kein neues Modul, kein Parallelpfad.** Drei `STAT_FROM_TAGS`-Zeilen, eine Rolle + ein Equip-Slot,
  ein `creature.hp` + `damageCreature`, ein erweiterter Raycast, eine Aggression-Task, der W5-Hook.
- **Tag-emergent, nicht hardcoded:** jede Kombat-Zahl kommt aus den Tags (Schaden/Knockback/Tempo/
  Defense); die Gewichte/Kosten sind Config-Konstanten (browser-justierbar).
- **Modus-gated** (pfad = Konsequenz), wie `damagePlayer`/Stamina heute. Determinismus/Multi-User:
  `creature.hp` ist Laufzeit-State (wie die Task — reaktiv, nicht zwingend persistiert; entscheiden
  pro Phase). Knockback nutzt den bestehenden Ammo-Impuls-Pfad.
- **Der Affekt von Anfang an** (W5-Lehre: kein nachträglicher Pflaster-Affekt) — Phase F begleitet
  C/D/E, nicht danach.
- **Browser-Wahrheit:** ob Kampf sich GUT anfühlt (Wucht, Tempo, Gefahr, Spaß) ist der Schöpfer-
  Browser; headless beweisbar sind die Mechanik + die Tag-Emergenz + der Affekt-Konsum.

---

## 7. Reihenfolge + Abnahme

**A (Kombat-Stats) → B (Waffen-Rolle + Slot) → C (Kreatur-HP + damageCreature) → D (LMB-Angriff) →
F-Teil (Angriff/Tod-Affekt mit C/D) → E (Bedrohung) + F-Teil (Furcht/Schuld).** A+B sind reine
Verdichtung (niedriges Risiko, sofort testbar). C+D bringen den Kern-Loop (Spieler schlägt Kreatur).
E ist die game-design-schwerste (Aggression-Balance) — evtl. eigene Welle. Jede Welle: miss vorher/
nachher, KONSUM verifizieren, playtest-grün, ein Commit. Der Schöpfer-Browser ist die finale Wucht-/
Spaß-/Balance-Wahrheit. **Damit bekommt der Emotion-Kern seinen letzten Konsumenten + die Welt eine
Kampf-Schleife, die — wie alles hier — aus der Substanz emergiert.**
