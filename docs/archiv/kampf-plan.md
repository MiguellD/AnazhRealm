# Der Kampf-Bogen — Combat als der Hylomorphismus, eine Ebene weiter (der Plan)

> **Lies das ZUERST vor jeder Arbeit an „Kampf", „Waffen", „Rüstung", „Kreatur-HP/Tod",
> „Aggression/Bedrohung", „Angriff/Schaden gegen Kreaturen" oder „Kombat-Stats".** Es hält
> die GEMESSENE Bestandsaufnahme (02.06.2026, Explore-Diagnose) + den Plan fest: Kampf
> EMERGIERT aus dem bestehenden Hylomorphismus (Tags → Stats, EINE Pipeline für Spieler/
> Kreatur/Waffe/Rüstung), KEIN Parallel-System. Verwandte Anker: `crafting-konzept.md`
> (das Tag-Substrat), `archiv/emotion-kern-plan.md` §W5 (der fertige Kampf-AFFEKT-Hook, der hier
> seinen Konsumenten bekommt), `das-lebendige-feld.md` (der wahre Norden).

---

## STATUS (Stand V18.148 — ~~Phase E~~ ✓ GEBAUT V18.148: Raubtier-Seele glutwesen [tag-emergent wild, predator-gefiltert] · Jagd [pfad-only, Furcht schlägt Jagd] · Furcht/Triumph/Schuld — der Emotion-Kern ist RUND; ~~S6-B~~ ✓ V18.133 erntbare Flora; S-Reste [S9-Sign-off · S11 · S7-C] sind abgenommene Vermerke [Gesamt-Abnahme 11.06.]) — lies §11 (der gebaute Plan; §11.9 = die Browser-Audit-Ausrichtung)

**FRONTIER V17.91 (der Werkstatt-Bogen ist DURCH; V17.91 = die Werkstatt 3D-zentrisch — versteckter Detail-Editor entfernt, Undo/Redo/Löschen + Prozess-Karten hoch in Top-Leiste/Palette, Verbindungen via Connect-Toggle, Readout im Stats-Panel):** seit dem V17.67-Detail unten ist die RESONANZ-VEREINHEITLICHUNG §11.10 KOMPLETT (R1–R3 V17.68–.70 + S10 Op-aus-Form V17.71 + die Bibliothek A1 V17.72 + das Gerät in der Hand S9 V17.73–.75 + Welle-2 Werkstatt-Präzision V17.76–.78 + die Rolle-Passung V17.79 + U1–U6 V17.80–.84). Dann der Schöpfer-Browser-Bogen V17.85–.89: die emergente Rolle sichtbar + der Prozess umkehrbar (`removePartOp`, .85) · Werkstatt-Kohärenz + Schwert-Saat (.86) · volles UNDO/REDO (.87) · **DIE WERKSTATT IST DER PROZESS** (.88 — `_workshopProcessesForMenu`/`applyWorkshopProcessToPart`: platzieren → der Prozess erscheint [frieden/pfad], besessen frei [schöpfer]; bessere Werkstatt → höhere Substanz-Präzision → bessere Tools = die Rekursion; Start mit den Basics, nur hände) · **DIE WERTE SICHTBAR + DYNAMISCH** (.89). Dann **V17.90 — DIE RE-KALIBRIERUNG** (das „blass"-Gefühl an der Wurzel, Schöpfer „die Route klar, das Ergebnis blass; du sagst Dinge, setzt sie nicht um"): die Resonanz war GEBAUT, aber skalen-inkonsistent (Material-Tags [0..3] überstimmten die Form-Achsen [0..1]) → das Spektrum sättigte (alles 1.0), Material kaum spürbar (Readout-Clamp), Größe unsichtbar, Rolle unscharf. Geheilt (4 Facetten, GEMESSEN `diag-blass`): Produkt-Vektor auf EINE Skala normalisiert (`PRODUCT_VECTOR_TAG_NORM`, das Spektrum spreizt + führt mit der Form-Rolle) · Material dramatisch (Holz↔Eisen 2.7×) · eine **Größe→Stat-Achse** (`_compoundSizeFactor`, größer = mächtiger + träger, im Readout UND im Equip-Fold + attackSpeed-Floor — die V17.89-„größer=stärker"-Frage GELÖST) · Rolle scharf (`_computeFormRole` über das EINE ROLE_SIGNATURES-Register; `livingBody` aus dem unmaskierten Material; Pickel→Werkzeug, Schwert→Waffe). PLUS zwei „im-Kreis"-UI-Befunde: die platzierte Drehbank erscheint zuverlässig als Prozess (`WORKSHOP_PROXIMITY_M` 10→32 + Hinweis wenn nur Hände) · Undo/Redo sichtbar (CSS). **OFFEN: der Schöpfer-Browser-Pass (Feel der Material-/Größen-Balance, alle Gewichte browser-justierbar) · Avatar-Körper-Größe→HP (bewusst aufgeschoben) · Phase E (Bedrohung/Furcht — D4-Temperament GEBAUT V18.107) · Backlog: ~~Zwei-Hand-Modell~~ ✓ V18.109 (E8: Off-Hand-Slot + Key G + linker Arm) · ~~Rüstung am Avatar sichtbar~~ ✓ V18.104/.110 (am TORSO via C7-Trage-Punkt).** Das §11.10-Detail unten ist damit HISTORIE des gebauten Bogens. — Der V17.67-Detail-Stand folgt:

**Der Kern-Kampf-Loop A–D + W5-Affekt + der Interaktions-Bogen W1·W2·W2-B·W3 sind GEBAUT** (V17.51–.58, §8/§9).
**§11 — der vereinte Schöpfungs-Fluss:** S1 Readout · S2 Mach-Tor+Modi · S3+S3-B Gerät · S4 Rüstung · S5 Avatar ·
S6 Trank GEBAUT (V17.59–.65) — VIER Mach-Akte zahlen Material durch EIN `_makeCostGate` + `fertigeBlueprint`. Der
Schöpfer-Browser-Audit (02.06.) fand die Fehl-Ausrichtung (§11.9): die Mach-Akte waren funktional korrekt, aber als
PARALLELER Pfad PRÄSENTIERT (der „⚒ Schmieden"-Knopf im Detail-Editor wirkte wie eine Doublette des „Prozess-ziehen-
fixiert-die-Rolle"-Flusses). **S7 KERN GEBAUT (V17.66): das FERTIGEN ist in den Prozess-Fluss gefaltet** — EIN
rollen-bewusster „⚒ FERTIGEN"-Akt als Abschluss der Stats-Tabelle (`_workshopAppendFertigenRow`, der Fluss
verfeinern → ablesen → FERTIGEN), die zwei alten Detail-Editor-Knöpfe entfernt; das Mach-Tor `_workshopStationGate`
ist end-to-end am Mach-Akt angeschlossen (`_makeStationGate` in `_forgeMaterialAndFreeze`/`brewConsumable`, nicht
nur confirmBuild — ein forging-Gerät → Esse nah, ein Trank → Brennkolben). `checkBandV1766` 9 grün. **S7-B
BEGONNEN (V17.67) — die Prozess-Hardcode-Insel auflösen (Schöpfer-Dialog 03.06.):** der „Werkzeug-Aufräum" war
nie ein Aufräum, er zeigte auf die letzte Hardcode-Insel — die WORK-Seite emergiert (Rolle aus Form×Material), die
PROZESS-Seite (Werkzeuge + Werkstätten) trug noch Hardcode (`roleManual`+`workshopDomain`). Erster Schnitt: die
WERKSTATT-DOMÄNE EMERGIERT aus der Substanz (`_computeWorkshopDomain`, Vorbild `_isPortalShaped`; das `workshop­
Domain`-Feld entfernt; eine Esse bedient forging, weil sie eine glühende dichte Masse IST), `checkBandV1767` 5 grün.
**Der AKTIVE Plan (Schöpfer-Dialog 03.06., §11.10 NEU): die RESONANZ-VEREINHEITLICHUNG — „ein Produkt-Vektor, viele
Leser".** Der Schöpfer-Befund: meine Klassifikatoren messen EINSEITIG (Einzel-Tag-Schwellen), aber das System denkt
in Vektoren (die Aura ist ein Vektor, `spawnAffinityForBlueprint` ist ein SKALARPRODUKT, die Tags SIND der Substanz-
Vektor). Die synergetische Form: Rolle/Domäne/Affordanz sind RESONANZEN des vollen Produkt-Vektors (Tags ⊕ räumliche
Signatur ⊕ Skala) gegen frozen Signaturen (argmax), nicht Einzel-Signal-Tore — die per-Rolle Hand-Flags lösen sich
in EINEN optionalen Override auf. Die Schritte (§11.10): **R1 ✅ (V17.68)** die Domänen-Resonanz
(`_computeWorkshopDomain` → argmax über `WORKSHOP_DOMAIN_SIGNATURES`) · **R2 ✅ (V17.69)** der volle Produkt-Vektor
(`_blueprintProductVector` = Tags ⊕ bodyShape/portalShape; Konjunktion im Feature, argmax in der Entscheidung) ·
**R3 ✅ (V17.69)** die Rollen-Resonanz (`computeBlueprintRole` = Domäne-Vorrang → argmax über `FORM_ROLE_SIGNATURES`;
DER HEAL: architecture als positive dichte+harte Signatur → Stein-Tempel wird Bauwerk statt Seele; `checkBandV1769`
7 grün + V8.35/W12 kein Regress). **Die Resonanz-Vereinheitlichung STEHT — Domäne + Rolle als argmax des Produkt-
Vektors, ein Produkt-Vektor viele Leser.** **R3-Schluss ✅ (V17.70):** GEMESSEN, dass die Werkstatt-NATUR NICHT
emergiert (Esse vs. dichtes Bauwerk = Substanz-Zwillinge, village resoniert forging 2.78 wie eine Esse) — sie ist
INTENT (`setBlueprintAsWorkshopStation`, der vorgesehene Override), aber die DOMÄNE emergiert (R1). **Damit ist die
Prozess-Hardcode-Insel aufgelöst.** **S10 ✅ (V17.71):** die Werkzeug-Op emergiert aus der Form (scharf→schneiden,
stumpf-dicht→schmieden, magie→wandeln; `_computeToolOpFromForm` + `OP_CLASS_SIGNATURES`, `pointedFraction` als neue
Vektor-Achse; additive bleibt Intent). **Domäne (R1) + Rolle (R3) + Werkzeug-Op (S10) emergieren als Resonanz — die
Prozess-Hardcode-Insel ist VOLLSTÄNDIG aufgelöst.** Offen: der Schöpfer-Browser-Audit des ganzen Bogens (die
umfassende Schluss-Prüfung) + ~~S6-B~~ ✓ V18.133 · S9 (Gerät in der Hand) · S11 (Animation) · Phase E (Bedrohung). **OFFEN daneben:** der Schöpfer-Browser-Audit des S7-FERTIGEN-
Flusses (Feel/Synergie) · ~~S6-B~~ ✓ V18.133 (Scatter pflückbar → kraut/essenz → der Trank zieht Gepflücktes) · **S7-C die chat/DSL-Vereinheitlichung** (der letzte Gratis-Bypass;
die load-bearing scripting-Schicht, S3-B hielt sie bewusst frei) · S8 (Teilen) · S9 (Hand-Optik) · S11 (Animation).
Wer weiterbaut, liest §11.10 (die Resonanz) + §11.9 (die Lehre + der Lebenszyklus + die drei Schichten Tags/
Fähigkeit/Rolle) ZUERST. **PERMANENTE LEHRE: headless-grün ≠ vision-aligned — den FLUSS im Schöpfer-Browser zeigen, bevor man
Welle auf Welle stapelt. + Die Prozess-Seite (Werkzeuge/Werkstätten) ist die letzte Hardcode-Insel: sie löst man
wie alles andere, Form×Material → Eigenschaft, nach dem `_isPortalShaped`-Vorbild, NIE ein Flag.** Das ursprüngliche §11-Prinzip bleibt
(Schöpfer-Dialog 02.06., die Weitung von §10 auf ALLE Rollen): **„Plan → Werk"** (Information
frei · Materie kostet), das jeder Lesart (Gerät · Rüstung · Trank · Avatar · Portal · Fahrzeug) ihren
material-zahlenden Werk-Akt gibt, die vier Schöpfungs-Drawer in EINE Werkstatt-Gebärmutter zieht, und das
Teilen im Ultiversum klärt (Plan frei kopierbar/signiert, Werk kostet herkunfts-agnostisch — für Strukturen
schon BEWIESEN, Sonde B). §10 ist die erste konkrete Instanz (das Gerät schmieden). Teilschritte S1–S11 in
§11.7 (inkl. der Modus-Kristallisation §11.2: Materie kostet in pfad+frieden, frei nur in schöpfer · der
Avatar als Werk-Akt · die Zutaten-Ökonomie des Tranks · die Animation in der Werkstatt als Kirsche). Wer den
Bogen weiterbaut, liest §8/§9 (was gilt) + §11 (was kommt) ZUERST.

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

---

## 8. Die Vertiefung — vom Rollen-Schloss zum Fähigkeits-Profil (Schöpfer-Dialog 02.06.)

Nach dem Kern-Loop (A–D) öffnete der Schöpfer drei tiefere Befunde, die den Bogen vom „Kampf" zur
GANZEN Welt-Interaktion weiten. Sie lösen die Rollen-Kategorien (Waffe/Werkzeug) AUF und vereinen
Kampf + Abbau in EINER emergenten Logik. **Diese Sicht überschreibt §3.2/§4-B (das Rollen-Schloss).**

### 8.1 Es gibt keine festen Rollen — geformte Materie ERMÖGLICHT Handlungen
Ein Ding ist nicht „Waffe" ODER „Werkzeug". Geformte Materie trägt ein **Fähigkeits-Profil** — eine
emergente Tauglichkeit für JEDE Handlung (angreifen · schneiden · graben/abbauen · schützen), aus
Form × Material, GENAU wie Stats/Affordanzen/Spawn/Resonanz/Gefühl. Eine scharfe harte Klinge:
schneidet/sticht exzellent, gräbt Fels schlecht. Eine dichte stumpfe Masse: wuchtet/bricht Fels gut,
schneidet schlecht. Die bloße Hand: pflückt Weiches, scheitert an Hartem. **Du benutzt alles für
alles — die EFFIZIENZ ergibt sich aus dem Profil; das ZIEL + dein Klick wählen die Handlung (Kreatur
→ schlagen, Fels → graben), das Profil bestimmt, wie gut.** „Schmieden fixiert eine Rolle" ist FALSCH:
Schmieden formt die Materie → verschiebt das Profil; die „Rolle" der Werkstatt ist nur ein ABLESEN des
dominanten Könnens, kein Schloss. → das manuelle „als Waffe" (V17.52) + der Rollen-Split LÖSEN SICH AUF
in dieses Profil (das „daneben klicken + Boden abbauen" verschwindet: eine Klinge gräbt nur miserabel).

### 8.2 Der Wurzelfehler: das Instant-Abbauen (GEMESSEN 02.06.)
`harvestArchitecture`/`tryMouseBreak` sind heute **werkzeug-blind + instant + voller Ertrag** — egal ob
Hand oder geschmiedete Spitzhacke. Solange Abbauen sofort + gratis ist, KANN „unterschiedliche Effizienz"
nicht existieren (sofort ist sofort). **Abbauen muss Mühe kosten:** Fortschritt = die Grab-/Schneid-Kraft
des gehaltenen Dings (emergent) gegen den **Widerstand** des Materials (emergent aus seinen Tags — härte/
dichte = schwer, lebendig/weich = leicht). Bloße Hand an Fels → ~0 Fortschritt; geschmiedeter Pickel →
schnell. Minecraft's Werkzeug-Gating, aber EMERGENT (kein Tier-Tag) → forge ein härteres Ding, bau
Härteres ab = Freiheit. (Der Hylomorphismus, der an der Werkstatt-Tür endete, tritt in die Welt.)

### 8.3 Die Effizienz als Dirigent — Ausdauer/Stamina webt ein (GEMESSEN bestehend)
`staminaMax` ist schon emergent (`100 + (1−dichte)·60 + wärmeleitung·40`), aber die KOSTEN sind flach
(abbauen `MOUSE_ACTION_STAMINA_COST` 5, schmieden `TOOL_OP_STAMINA_COST` 10) + modus-gated (nur `pfad`;
frieden/schöpfer mühelos). Die Heilung: EINE Zahl — die `Tauglichkeit` (Profil des Dings vs Handlung +
Material) — dirigiert VIER Kanäle: **(1) Tempo** (hoch → schnell), **(2) Stamina-Kosten INVERS** (richtiges
Werkzeug billig pro Fortschritt; falsches verbrennt Ausdauer für fast nichts), **(3) Ertrag** (hoch →
voller Drop, niedrig → wenig/keiner), **(4) Gefühl** (`_feelAction` liest schon jede Tat → effiziente
Meisterung = Freude, vergebliches Mahlen = Frust). So KOMMUNIZIEREN die Systeme: ein substanz-abgeleitetes
Signal, vier Leser, kein Sonderfall (das „eine Quelle, viele Leser"-Muster des Projekts).

### 8.4 Die schnell/ausdauer-Achse aus `dichte` (Trägheit ↔ Fortschritt)
- **leicht** (niedrig `dichte`): hohes Tempo, kleine Stamina-Schlucke, durchhaltend (Ausdauer), wenig Wucht.
- **schwer** (hoch `dichte`): hohe Wucht/Rückschlag pro Schlag (Burst), langsam + große Stamina-Züge, erschöpft schnell.
Trägheit kauft Kraft, Leichtigkeit kauft Durchhalten — du schmiedest deinen Stil + wählst je Material.
(`dichte` treibt schon attackSpeed + knockback; Stamina-Kosten ∝ `dichte` schließt das Dreieck.)

### 8.5 Wachstum + die Mana-Symmetrie (vision-treu, kein XP-Grind)
AnazhRealm wächst NICHT über eine XP-Leiste (das wäre ein Label — die Heilige Lektion): (a) **bessere
Materie** (forge — weniger Mühe, mehr Ertrag), (b) das **blühende Feld** (Boosts heben Stats/Ausdauer,
wo die Welt gedeiht), (c) **Bindungen** (Kreaturen, die KI als Ko-Regulator). Optional eine leichte „der
Körper erinnert sich"-Adaption (Ausdauer wächst sanft mit Gebrauch) — die einzige Wachstums-Schraube, die
zum lebendigen Thema passt. **Die fehlende symmetrische Hälfte (dein „/mana"):** Stamina ist die körperliche
Mühe; eine magische Energie aus `magieleitung` (Äther — Zauber/Aura/DSL kosten ihn, regen ∝ magieleitung)
wäre ihr Spiegelbild (heute zahlt Magie nichts) — die zweite Achse, wenn die Magie-Seite genauso echt wird.

---

## 9. Der revidierte Pfad (an der Wurzel)

- **W1 — der Wurzelfehler + die Effizienz als Dirigent — ✅ GEBAUT (V17.55):** Abbauen kostet Mühe;
  EINE `_harvestFitness` (`_heldMinePower` des ausgerüsteten Werkzeugs vs `_architectureResistance`)
  treibt Tempo (`entry.harvestProgress`/Hieb) + Stamina (variabel, invers) + Ertrag (`yieldMult`, Floor)
  + Gefühl (`_feelAction`-Magnitude) zugleich; Halten-zum-Abbauen (`_tickHarvest` + `breakHeld`). Lebt in
  `pfad` (frieden/schöpfer mühelos). `checkBandV1755HarvestEffort` 11 grün. *Der Schlüssel — die Mühe macht
  „unterschiedliche Effizienz" erst fühlbar.* Offen (Schöpfer-Browser): das FEEL + ein Fortschritts-Balken.
- **W2 — das form-bewusste Profil + alles-für-alles — ✅ GEBAUT (V17.56):** das Doppel-Profil
  (`_implementProfile`: WUCHT ∝ Stumpfheit×(härte+dichte) vs SCHÄRFE ∝ spitze Form×härte) — DIESELBE
  Materie wird zur Klinge ODER Keule, die FORM entscheidet; der Widerstand zwei-kanalig (`{mineResist,
  cutResist}`, Fels unschneidbar), die Tauglichkeit nutzt `max(mine, cut)` → das Ziel-Material wählt den
  Kanal; das gehaltene Gerät = Werkzeug ODER Waffe (`_heldImplementBlueprint`, der W1-sourceBlueprint-Bug
  behoben). `checkBandV1756W2Profile` 10 grün.
- **W2-B — das Rollen-Schloss aufgelöst — ✅ GEBAUT (V17.57):** EIN `equipped.held`-Slot (Werkzeug + Waffe
  verschmolzen, `armor` bleibt getragen); `equipHeld` nimmt JEDEN Bauplan (kein Rollen-Check); EIN
  `HELD_STAT_WEIGHT`-Fold → das gehaltene Gerät treibt Angriff (alles-für-alles) UND Abbauen (W1/W2); die
  Rolle wird ABLESUNG (`_implementAffordanceLabel` „Klinge"/„Brecher", das manuelle Markieren fällt). Synergie:
  `equipTool`/`equipWeapon`/DSL/Chat/Restore = Aliase auf `equipHeld` (die API bleibt heil, nur die Leser
  wandern); die Crafting-Tools (`state.tools`) + der Kreatur-Equip (`{tool,armor}`) bleiben orthogonal.
  `checkBandV1757HeldSlot` 11 grün. Offen (Browser): das Feel der einen Hand-Zeile + der Affordanz-Readout.
- **W3 — die natürliche, aura-reaktive Kreatur — ✅ GEBAUT (V17.58):** EIN Signal `_creatureWariness`
  (deine Aura-Menace [chaos-dominant, feedback-frei] × der Natur des Wesens [dicht/hart kühn, lebendig
  scheu] × Bindung × Modus, per Nähe skaliert) ersetzt im wander-Fallback die statische happy/sad-Wahl →
  neugierig näher / scheu fort / sonst wandern; ein getroffenes Wesen flieht (`damageCreature` → fearUntil
  + sad). Reuse des Flock/Flee/Drift, kein Parallel-AI. `checkBandV1758CreatureNature` 11 grün. Offen
  (Browser): das Feel. **Damit ist der Interaktions-Bogen (W1·W2·W2-B·W3) rund.**
- **Phase E — die Bedrohung (offen, game-design-schwer):** aggressive/raubtier-Kreaturen, die den Spieler
  JAGEN (`damagePlayer` aus echter Quelle, pfad-gated, sparsam) → der FURCHT-Konsument + der Triumph-δ
  (Bedrohung beseitigt). + optional die „Körper-erinnert-sich"-Adaption + die Mana-Hälfte (magieleitung → Äther).

**Disziplin (heilig):** tag-emergent, kein neues Modul, kein Parallelpfad; modus-gated; der Affekt von
Anfang an (`_feelAction` liest die Mühe gratis mit); die Wucht/das Feel/die Balance = Schöpfer-Browser.
Headless beweisbar sind die Tauglichkeit-Berechnung, die vier Kanäle, die Substanz-Differenzierung.

---

## 10. Der Schmiede-/Gerät-Bogen — die Werkstatt schließt den Kreis (Schöpfer-Dialog 02.06., NACH W3)

Der Interaktions-Bogen (§9) machte das Abbauen + die Kreatur emergent. Der Schöpfer-Audit danach legt
den Finger auf die **Werkstatt** — die Quelle, aus der ein Gerät kommt. Dort sind **zwei Crafting-Systeme
nie verschmolzen**; der Bogen schließt erst, wenn die Werkstatt das Gerät ERKENNT, das Schmieden Material
SPEIST + die Substanz in die HAND bringt. **Diese Sicht vollendet §8/§9 und löst die letzte Tool/Waffe-
Trennung auf.**

**Schöpfer (02.06.):** „in der Werkstatt steht bei Rolle nur ‚Bauwerk' — ich mache einen Holzzylinder als
Stiel + einen Steinquader als Kopf (Griff-Verhältnis, massiver schwerer Kopf, stumpf), das ist nah an
einem Werkzeug/Brecher, dachte hier erscheinen mehrere Dinge, und je nach Form wird die Rolle erkannt …
Schmieden als Verarbeitungsprozess fixiert die Rolle auf Tool/Waffe? … vordefinierte Werkzeuge mit
Präzisionen beissen sich noch, sind nicht synergetisch … Drehbank/Schmiede-Hammer sind andere Baupläne,
die die Rollfixierung freischalten, mit unterschiedlichen Präzisionen? besserer Schmiede-Hammer → bessere
Werkzeuge, die selbst an der Grundgeometrie schon mehr/weniger Qualität bieten? … einige Dinge sind nie
sauber zusammengeflossen … ein gehaltenes Gerät sollte VISUELL in der Hand sein, nicht der Platzier-
Schatten … wann wird das Material gespeist (bei Waffen/Tools)? wie erreicht man Synergie?"

**Die bestätigte Reconciliation (Schöpfer):** *„Die Schmiede erstellt ein Gerät — ein Gerät ist Waffe UND
Werkzeug."* → die saubere Vereinigung: **kein Rollen-Schloss** (W2-B bleibt: du benutzt alles für alles),
aber **Schmieden ist ein ECHTER Fertigungs-Akt**. Der Prozess fertigt (Material + Präzision + Sichtbarkeit),
die Fähigkeit bleibt emergent (die Form sagt, was es gut kann).

### 10.1 Das komplette System, wie es WIRKLICH läuft (GEMESSEN, Explore 02.06.)

**Der Bauplan ist das EINE Substrat** — Struktur, Werkzeug, Waffe, Rüstung, Seele, Portal, Maschine,
Nahrung, gehaltenes Gerät: alles ist ein Bauplan (`parts` = Form × Material × Position × `opChain`).

**Die Rollen — wie sie ENTSTEHEN (`computeBlueprintRole`, in Priorität):** (1) **Crafting-Geschichte** —
die dominante `opChain`-Werkzeug-**Domain** (forging → tool/armor als Tag-Split [`härte/magieleitung/
stromleitung` → tool, `dichte/zähigkeit/wärmeleitung` → armor], alchemy → consumable, textile → armor,
soulwork → soul, mechanism → machine, construction → architecture). **Generische Werkzeuge (Hand/Hammer/
Feile, `domain=null`) zählen NICHT** → ein frisch geformter Hammer-Bauplan, nur mit der Hand geknappt,
bleibt rollenlos. (2) **Form** → bilateral-symmetrischer Glieder-Körper → soul. (3) **Form+Material** →
magie-leitender Ring → portal. (4) **Material** → lebendig+weich → consumable. (5) **Default** →
architecture (**„Bauwerk"**). Manueller Override (`roleManual`) friert ein. **→ DARUM zeigt der Hammer
„Bauwerk": er ging nie durch die (versteckte) Domain-Schmiede-Pipeline; und selbst dann wäre die Rolle
„Werkzeug" (abstrakt), NICHT das form-emergente Können (Klinge/Brecher), das der Schöpfer erwartet.**

**Die ZWEI „Tool"-Begriffe (die Wurzel des „beisst sich"):**
- **Crafting-Werkzeug** (`state.tools[name]`): `opClass`/`opName`/`precisionCap`/`domain` — das, womit man
  IN der Werkstatt Parts bearbeitet (`applyOpToPart`). Registriert via `setBlueprintToolMeta` +
  `registerBlueprintAsTool` (manuelles `opName`-Tippen + opClass-Dropdown). 10 Built-ins (Hand …
  Polierscheibe, Schmiede-Hammer [forging], Drehbank-Meißel [mechanism]).
- **In-der-Hand-Gerät** (`equipped.held` → Bauplan, W2-B): das, womit man in der WELT abbaut/kämpft. Jeder
  Bauplan, gratis, **keine Optik**.
- Halbe Brücke (existiert schon!): `equipHeld` löst `state.tools[name].sourceBlueprint` auf → ein
  registriertes Crafting-Werkzeug IST haltbar. Die Vereinigung ist halb gebaut, nur nicht zu Ende gedacht.

**Die Präzisions-Kette (existiert, die §4.3-Rekursion ist REAL):** `applyOpToPart` → `opChain` (Geschichte)
→ `computePartPrecision` (Min-Regel + Decay) → `computeBlueprintPrecisionCap` (Min der Parts). Ein besseres
Crafting-Werkzeug (höherer `precisionCap`) hebt die erreichbare Werkstück-Präzision; `MACHINE_PRECISION_
BONUS` (+0.05). **Die Drehbank/Esse/Webstuhl/etc. SIND Beispiel-Baupläne** (`role:"workshop-station"` +
`workshopDomain`, Nähe-gated `WORKSHOP_PROXIMITY_M`); ihre Präzision kommt aus ihren Bauteilen — die
Rekursion, die der Schöpfer meinte (besserer Hammer → bessere Drehbank → bessere Werkzeuge), ist gebaut.
**ABER** die Präzision fließt nur in **Kampf**-Stats (`heldMul = 0.5 + 0.5·präzision` auf das Tag-Fold) +
Rüstung — NICHT ins Abbauen (Riss C).

**Die FÜNF Risse (nie verschmolzen — die ehrliche Wahrheit hinter „beisst sich"):**
- **A — die Werkstatt zeigt nur die abstrakte Rolle read-only** („Bauwerk"); die Geräte-Fähigkeit
  (`_implementAffordanceLabel` → Klinge/Brecher) wird berechnet, aber NUR im Equip-Drawer gezeigt, nicht
  in der Werkstatt. → der „nur Bauwerk"-Befund.
- **B — zwei Rollen-Philosophien koexistieren:** Welt-9a-Schmiede-Rolle (`registerBlueprintAsTool` =
  fixiert in `state.tools`) vs. W2-B-Ablesung (`equipped.held`, kein Schloss). Werkzeuge → ein Pfad,
  Waffen/Gehaltenes → ein anderer. → das „nie sauber zusammengeflossen".
- **C — die Präzision erreicht das Abbauen NICHT:** `_implementProfile` (minePower/cutPower) liest reine
  Form × Material; ein polierter Pickel bricht Fels genauso schnell wie ein roher. Der „Präzision
  moduliert"-Faden (Konzept §6.3) endet vor der Ernte.
- **D — ein Gerät schmieden/ausrüsten kostet NULL Material** (`equipHeld`/`registerBlueprintAsTool`
  verbrauchen nichts), während Strukturen-Bauen Inventar zieht (`confirmBuild` → `tryConsumeBuildCost`,
  pfad-Modus). → der „offene Faden: wann wird das Material gespeist?".
- **E — keine In-der-Hand-Optik:** das gehaltene Gerät ist unsichtbar; der einzige Bauplan-Visual ist der
  Platzier-Schatten (`tickBuildMode`-Phantom bei 40% Opacity, Hotbar/Bau-Modus — ein ANDERES System).

### 10.2 Die Synergie: „Plan → Werk" (Bauen ↔ Schmieden als Spiegel)

Ein Bauplan ist IMMER ein freier **Plan**. Ihn real zu machen kostet Material — in ZWEI spiegelbildlichen
Akten:
- **BAUEN** (Strukturen): Plan → in der Welt platzieren → Material verbraucht → ein Bauwerk steht. *(da)*
- **SCHMIEDEN/FERTIGEN** (gehaltene Geräte): Plan → schmieden → Material verbraucht + Präzision eingefroren
  → ein **Gerät in der Hand**. *(der fehlende Spiegel)*

So beantwortet sich „wann wird das Material gespeist?": **beim Schmieden** — der exakte Spiegel von „beim
Bauen". Der Bauplan ist der Plan; der Akt des Machens (bauen ODER schmieden) zieht das Material (Reuse
`computeBuildCost` — dieselbe Volumen-Formel). DAS ist die Synergie, die der Schöpfer sucht: **ein Muster,
zwei Anwendungen** (die Heilige Lektion — kein Parallel-System, eine Verdichtung).

### 10.3 Das vereinte Gerät (die Reconciliation in Code-Sprache)

Ein **Gerät** = das vereinte gehaltene Werkzeug = **Waffe + Werkzeug** (+ optional Crafting-Werkzeug). Was
es GUT kann, emergiert aus der **Form** (Klinge schneidet / Brecher wuchtet, `_implementProfile`); die
**Qualität** aus der Präzision (die Crafting-Kette); benutzbar für ALLES (kein Schloss, W2-B bleibt). Das
geschmiedete Gerät lebt im Werkzeug-Register (`state.tools` mit `sourceBlueprint`) UND ist das gehaltene
Welt-Gerät (`equipped.held`) UND rendert in der Hand. **EIN geschmiedeter Hammer = Werkstatt-Werkzeug +
Welt-Brecher + Hand-Optik** — eine Substanz, alle Anwendungen, alle emergent aus Form × Material ×
Präzision. Die Rolle „weapon" (seit W2-B vestigial, der „als Waffe"-Knopf ist schon weg) entfällt; „tool"
wird begrifflich „**Gerät**".

### 10.4 Der Teilschritt-Plan (F1–F5 — jede Logik-Welle ein `checkBand`)

- **F1 — die Werkstatt ERKENNT das Gerät** (Riss A · niedrigstes Risiko · headless-beweisbar): die
  Werkstatt-Rollen-Zeile (`_workshopAppendRoleRow`) zeigt für jeden Bauplan mit einem Geräte-Profil
  prominent die Affordanz (`_implementAffordanceLabel` → „Klinge"/„Brecher"/„Gerät") + das Ernte-Profil
  („schneidet Weiches · wuchtet Fels"), aus der Form abgelesen — UNABHÄNGIG von der abstrakten Rolle. Der
  Holzstiel+Steinkopf liest dann live: „Brecher · wuchtet Fels gut · schneidet schlecht". Reuse
  `_implementProfileForBlueprint`/`_implementAffordanceLabel`. Heilt sofort den „nur Bauwerk"-Befund.
  *Headless: der Readout existiert + differenziert (Klinge vs Brecher aus derselben Materie).*
- **F2 — Präzision moduliert das Abbauen** (Riss C · ~eine Zeile · headless-beweisbar): der
  `heldMul`-Präzisionsfaktor (heute nur Kampf) erreicht auch `_implementProfile`/die `_harvestFitness` →
  besseres Schmieden = besseres Abbauen. Schließt die §4.3-Rekursion END-TO-END: besseres Crafting-Werkzeug
  → höhere Werkstück-Präzision → besseres Gerät → bricht Fels schneller + voller Ertrag → womit du noch
  besseres schmiedest. *Headless: ein hochpräziser gehaltener Bauplan baut schneller ab als ein roher
  gleicher Form/Materie.*
- **F3 — Schmieden speist Material (der Spiegel von Bauen)** (Riss D · der Kern-Merge · headless-beweisbar):
  ein „Fertigen/Schmieden"-Akt verbraucht die Teil-Materialien (Reuse `computeBuildCost`/
  `tryConsumeBuildCost` — DIESELBE Volumen-Formel wie Bauen) + friert die Präzision ein (Snapshot) +
  registriert das Gerät als haltbar/equip-fähig. Der Bauplan bleibt der freie Plan; das Schmieden ist die
  Verkörperung. Modus-gated (pfad+frieden zahlen, frei nur in schöpfer — die §11.2-Kristallisation). VERSCHMILZT die zwei Systeme:
  das geschmiedete Gerät ist im Register UND in der Hand. *Headless: schmieden zieht Inventar + produziert
  ein registriertes, haltbares Gerät; im Plan-Zustand kein Material-Zug.*
- **F4 — In der Hand SICHTBAR** (Riss E · Render · Schöpfer-Browser): das gehaltene Gerät rendert als
  First-Person-/Avatar-Hand-Mesh (Reuse `_buildFromBlueprint`), getrennt vom Platzier-Schatten. Eigene
  Welle — headless pixel-blind (V13-Lehre); die Optik/Pose/Skala/Schwingung beim Hieb = Schöpfer-Browser.
- **F5 — die Crafting-Op emergiert aus der Form (+ optional „Gerät" als Rolle)** (Risse A+B tief · braucht
  Mess-Disziplin): die Operation, die ein Gerät in der Werkstatt ausführt, emergiert aus seinem Profil
  (scharf → subtractive/schneiden, stumpf-hart → plastic/schmieden) statt manuell getippt
  (`setBlueprintToolMeta`-opName-Feld fällt). Optional: „Gerät" wird eine FORM-emergente Rolle (ein
  greifbares Implement-Profil ohne andere dominante Domain → Rolle „Gerät"). **ABER `computeBlueprintRole`
  speist die Spawn-Affinität** — jede Tag-/Rollen-Verschiebung ZUERST mit `scripts/diag-arch-tags.cjs`
  messen (V17.17-Lehre: eine Affinitäts-Verschiebung kann das Baum-/Architektur-Spawning kippen). Die
  tiefste, riskanteste Stufe — die volle Hylomorphismus-Schließung der Werkstatt.

### 10.5 Reihenfolge + Scope + Disziplin (heilig)

**Reihenfolge:** F1 → F2 → F3 sind die **Logik-Synergie** (headless beweisbar, je eine Welle, je ein
`checkBand`). F4 ist die **Optik** (Schöpfer-Browser-Audit). F5 ist die **tiefe Kür** (mit Mess-Wächter).
**F1 zuerst** — es heilt sofort den sichtbaren Befund („nur Bauwerk") + ist risikoarm; danach F2 (die
Rekursion schließen), F3 (der Material-Merge). **Scope/Disziplin:** kein neues Modul, kein Parallelpfad —
die zwei bestehenden Systeme (`state.tools` + `equipped.held`) VERSCHMELZEN über die halbe Brücke
(`equipHeld`-`sourceBlueprint`), die schon existiert; Material-Verbrauch reuse `computeBuildCost`;
modus-gated wie Bauen; der Affekt (`_feelAction("create"/"forge")`) liest die Tat gratis mit (W2-Brücke →
Stolz ∝ Komplexität + Substanz). Die Wucht/das Feel/die Hand-Optik = Schöpfer-Browser. **Vor F5 (Rollen-/
Tag-Verschiebung) IMMER `diag-arch-tags` (V17.17-Lehre).** KONSUM verifizieren, nicht Existenz (V17.31).

---

## 11. Der vereinte Schöpfungs-Fluss — Plan → Werk über ALLE Rollen (Schöpfer-Dialog 02.06., die Weitung von §10)

§10 heilte den Geräte-Pfad. Der Schöpfer weitet (02.06.): *„dieses Problem besteht für mehrere Dinge —
Rüstung, Fahrzeuge, Tränke, etc. Wir machen keine halben Sachen, wir heilen den GESAMTEN Prozess. Siehst
du alle Schnittstellen und Flüsse, von Avatar erstellen bis zum Portal, alles in der Werkstatt erstellt,
intuitiv, in EINEM Fluss? Was passiert mit dem Teilen von Bauplänen — wie noch kopierbar und trotzdem
Kosten beim Erstellen? Wie lebt es im gesamten Ultiversum? Welche Fäden sind alle ungebunden, nicht mehr
synergetisch?"* **§10 war eine Instanz. §11 ist das Ganze** — derselbe Riss (zwei nie verschmolzene
Systeme, asymmetrische Kosten, kein durchdachter Lebenszyklus) gilt für JEDE Lesart, die die Werkstatt
gebiert. Gemessen (zwei Explore-Sonden, 02.06.), nicht geraten.

### 11.1 Das EINE Prinzip: Plan → Werk (Information frei · Materie kostet)

Das Crafting-Konzept (§7): *„Dasselbe System macht alles — was sich unterscheidet ist nur, welche Tags
wofür nützlich werden."* Die Bibliothek-Vision (state-of-realm §4.2): *„eine Welt IST ein Set von
Programmen."* Daraus fällt EINE Wahrheit, die jede Schöpfer-Frage zugleich beantwortet:

- **Der Bauplan = der PLAN = reine Information.** Komponierbar, signierbar (W13 `signBlueprint` signiert die
  SUBSTANZ, nicht den Namen → Recipe-Import/Fusion brechen die Signatur nicht), teilbar, kopierbar,
  fusionierbar quer durchs Ultiversum. **Den Plan zu kopieren/teilen kostet NICHTS** — die Bibliothek von
  Alexandria, die nicht brennt.
- **Das WERK = das verkörperte Ding = kostet Materie.** Egal ob selbst entworfen oder von einem anderen
  Schöpfer empfangen — es REAL zu machen zieht Material.

**→ Die Antwort auf „kopierbar UND Kosten beim Erstellen?": der Plan ist frei (Information), das Werk
kostet (Materie).** Ein geteilter Bauplan bleibt frei kopierbar UND jeder Macher zahlt das Material beim
Verkörpern. **Und das Geniale (GEMESSEN, Sonde B): dieses Modell ist für STRUKTUREN schon gebaut + korrekt**
— `computeBuildCost` macht KEINEN Unterschied nach Herkunft (ein geteilter Bauplan kostet beim Bauen genau
wie ein selbst-entworfener), und Pläne reisen frei (`define_blueprint`-Broadcast · Welt-Snapshot ·
`importRecipesFromWorld` · `fuseWorlds` · `cloneBlueprint`, alle deep-cloned + signiert). **Wir erfinden das
Modell nicht — wir GENERALISIEREN das bewährte Struktur-Muster auf alle Rollen** (die Heilige Lektion:
Verdichtung des Vorhandenen, kein neues System).

### 11.2 Die drei Akte + die Modus-Kristallisation (die Kosten-Klärung)

Der „wann kostet es?"-Faden löst sich in Akte:

- **WERK** (machen: bauen · schmieden · weben · brauen · **einen Körper formen**): zieht Material EINMAL,
  friert die Präzision ein (Snapshot), gebiert das reale Ding.
- **GEBRAUCH** (benutzen: ausrüsten · schwingen · tragen · **eine fertige Seele verkörpern**): FREI — du hast
  beim Werk schon gezahlt. (Der Trank: trinken verbraucht das Gebraute — die Wurzel ist die Zutaten, §11.3.)

**Der Avatar ist KEINE Ausnahme** (Schöpfer-Korrektur 02.06., kongruenter als mein erster Wurf): einen
stärkeren/eigenen Körper zu FORMEN ist ein Werk-Akt (kostet gesammelte Rohstoffe) — `applyPlayerSoulFrom­
Blueprint` baut heute aus DENSELBEN Parts × Material wie alles, nur ohne Kosten. Eine fertige Seele zu
TRAGEN ist Gebrauch (frei). Die drei Starter-Seelen (Mensch/Phönix/Drache) sind frei gegebene Identitäten
(wie die built-in Baupläne freie Pläne sind). **Identität ist der GEBRAUCH; der Körper ist das WERK** — im
pfad/frieden sammelst du Rohstoffe für individuelle, stärkere Avatare. Voll kongruent, alles in der Werkstatt.

**Die Modus-Kristallisation (Schöpfer-Korrektur 02.06. — eine echte Diskrepanz):** GEMESSEN sind HEUTE ALLE
Kosten-/Mühe-Gates `pfad`-only (`_buildMaterialGate` · die Stamina · die Abbau-Mühe · das Stations-Gate) →
**frieden ist exakt so gratis + mühelos wie schöpfer.** Das ist falsch: *frieden bedeutet nicht gratis — das
wäre der Schöpfer-Modus.* Die saubere Kristallisation — zwei Achsen (Materie · Mühe), drei Modi:

| Modus | Mantra | Materie (machen) | Mühe + Bedrohung (Stamina · Abbau-Hieb · Furcht) |
| --- | --- | --- | --- |
| **schöpfer** | gehorcht | frei | frei |
| **frieden** | umarmt | **kostet** (du sammelst + machst) | mild/keine (friedlich, kein Schrecken) |
| **pfad** | verhandelt | kostet | voll (Mühe + Ausdauer + Bedrohung) |

→ **Materie kostet in pfad UND frieden; gratis nur in schöpfer. Mühe/Bedrohung ist die pfad-Achse** (frieden
dämpft sie schon — die Kreatur-Menace ist seit V17.58 modus-skaliert `pfad=1 · frieden<1 · schöpfer<<1`).
Das ändert das bestehende `_buildMaterialGate` (heute pfad-only → soll pfad+frieden zahlen) und prägt das
neue `_makeCostGate` von Anfang an. Eine echte Welle, kein bloßer Plan-Satz.

### 11.3 Das vollständige Hauptbuch der losen Fäden (GEMESSEN, beide Sonden 02.06.)

**Pro Lesart — der Werk-Akt, die heutige Kosten-Wahrheit, der Faden:**

| Lesart | Werk-Akt (machen) | kostet heute? | Gebrauch | loser Faden |
| --- | --- | --- | --- | --- |
| **Bauwerk · Maschine · Portal-Struktur** | bauen (`confirmBuild`) | ✅ pfad (`tryConsumeBuildCost`) | platzieren | — **das VORBILD (korrekt)** |
| **Gerät** (Werkzeug+Waffe) | schmieden | ❌ frei (`equipHeld`) | schwingen/abbauen frei | kein Schmiede-Akt (§10) |
| **Rüstung** | schmieden/weben | ❌ frei (`equipArmor`) | tragen frei | kein Mach-Akt |
| **Trank** | brauen | ❌ frei (`setBlueprintAsConsumable`) | `activateConsumable` gibt **∞ Boost, NIE verbraucht** | **keine Zutaten in der Welt** (Wurzel) + kein Brau-Akt + unerschöpflich |
| **Avatar/Seele** | einen Körper FORMEN (`applyPlayerSoulFromBlueprint`) | ❌ frei | fertige Seele tragen frei | kein Mach-Akt + der Baukasten noch nicht sauber in der Werkstatt |
| **Fahrzeug** (moveable) | bauen ✅ + fahren | ✅ bauen / mount frei | `mountArchitecture`/Fahren dünn | die Fahr-Tiefe (eigener Gameplay-Faden) |

**Quer-schneidende Fäden (gelten für ALLE Lesarten, aus §10.1):**
1. **Der Werk-Akt fehlt für Nicht-Strukturen** — nur `confirmBuild` zahlt; Gerät/Rüstung/Trank gehen vom
   Plan DIREKT zum Gebrauch, der material-zahlende Werk-Schritt fehlt (die Wurzel der Asymmetrie).
2. **Die Werkstatt zeigt die Rolle read-only** („nur Bauwerk"); die Form-Fähigkeit (Klinge/Brecher/Schutz/
   Wirkung) ist berechnet, aber nicht in der Werkstatt sichtbar.
3. **Die Präzision erreicht die Welt nicht** — nur Kampf-Stats, nicht das Abbauen (die §4.3-Rekursion endet).
4. **Keine In-der-Hand-Optik** — das gehaltene Gerät unsichtbar; der einzige Visual ist der Platzier-Schatten.
5. **Die Schöpfung ist über VIER Drawer zerstreut** — `werkstatt` (Parts/Tools) · `ausrüstung` (Rüstung/
   Trank/Portal markieren+ausrüsten) · `spieler` (Seele) · `kreaturen` (Kreatur-Seele); fünf Orte, ein Akt.
6. **Keine Zutaten-Ökonomie** (Schöpfer-Befund 02.06., die wahre Tiefe des Tranks) — GEMESSEN sind die
   Materialien stein/holz/eisen/bronze/quarz/leder; KEIN Kraut/keine Essenz, keine erntbare Flora für Tränke.
   Ein Trank kann nichts „verbrauchen", weil es nichts zu ernten gibt — darum ist „brauen kostet" heute leer.
   Die wahre Tiefe: ein Busch/eine Pflanze → eine Alchemie-Zutat → brauen verbraucht sie, wie der Rest. Sie
   knüpft an die V17.1-Klein-Vegetation (Blüten/Farne/Sporen existieren als DEKO → erntbar machen = Zutaten).

**Das Teilen (GEMESSEN, Sonde B — das Modell HÄLT für Strukturen, bricht für den Rest):**
- Pläne frei teilbar ✅ — `define_blueprint` (broadcastbar, NICHT in `NON_BROADCASTABLE_OPS`), Welt-Snapshot
  (Baupläne reisen zum Joiner), `importRecipesFromWorld` (deep-clone quer durch Welten, `-import`-Suffix +
  Cascade-Rewire), `fuseWorlds` (Union-Merge, `-fusion`-Suffix), `cloneBlueprint` (lokal), W13-Signatur reist.
- Werk-Kosten herkunfts-agnostisch ✅ — `computeBuildCost` unterscheidet nicht built-in/eigen/importiert; ein
  geteilter Bauplan kostet beim Bauen wie ein eigener. **ABER nur `confirmBuild` honoriert das** — Gerät/
  Rüstung/Trank haben keinen Werk-Akt → die „Werk kostet"-Hälfte ist für sie gebrochen.
- Bewusst KEINE Herkunfts-Abrechnung/„geteilt"-Rabatt — empfangenes Wissen löst sich in lokalen Besitz auf
  (Vision); das ist Absicht, kein Faden.

### 11.4 Die Heilung — jeder Rolle ihr Werk-Akt (eine Maschinerie, sechs Geschmäcker)

Die Lösung ist NICHT ein neues Kosten-System, sondern die **Generalisierung des bewährten Struktur-Akts**:
ein rollen-agnostisches Mach-Tor `_makeCostGate(name)` (die Verallgemeinerung von `_buildMaterialGate`)
routet JEDEN Werk-Akt durch `computeBuildCost`/`tryConsumeBuildCost` (dieselbe Volumen-Formel, dieselbe
Herkunfts-Agnostik) — mit der KRISTALLISIERTEN Modus-Achse (§11.2: zahlt in pfad UND frieden, frei nur in
schöpfer). Dann bekommt jede Lesart ihren Werk-Verb durch DASSELBE Tor:
- **bauen** → platzieren (existiert — wird auf `_makeCostGate` umgehängt; lädt damit zugleich die Modus-
  Korrektur — frieden zahlt jetzt auch).
- **schmieden/weben** (Gerät/Rüstung) → Material ziehen + Präzision einfrieren + als haltbar/ausrüstbar
  registrieren (der §10-F3-Akt, jetzt auch für Rüstung).
- **brauen** (Trank) → die GEERNTETEN Zutaten ziehen (sobald die Zutaten-Ökonomie steht, §11.3-Faden 6) + die
  Wirkung als verbrauchbares Gebräu gebären (trinken verbraucht es — kein ∞-Gratis-Boost mehr).
- **einen Körper formen** (Avatar) → `applyPlayerSoulFromBlueprint` durchs Mach-Tor: gesammelte Rohstoffe
  ziehen → ein stärkerer/eigener Körper. Eine fertige Seele zu tragen (verkörpern) bleibt frei (§11.2).
Die BEWÄHRTE Maschinerie (`confirmBuild` zahlt seit V8.37 korrekt + herkunfts-agnostisch), nur einmal
verallgemeinert + rollen-gerecht gerufen. Kein Parallelpfad (V17.9).

### 11.5 Die EINE Werkstatt-Gebärmutter (ein Fluss, nicht vier Drawer)

Die Werkstatt wird der Mutterleib von allem — ein durchgängiger Fluss statt fünf verstreuter Orte:
**(1) entwerfen** (Parts: Form × Material × Position) → **(2) verarbeiten** (Crafting-Tools anwenden →
Präzision; nahe der passenden Welt-Werkstatt-Station) → **(3) ABLESEN** (die emergente Fähigkeit: Klinge/
Brecher · Schutz-Profil · Wirk-Profil · Wesen · Tor — die Form sagt, was es IST) → **(4) FERTIGEN** (der
rollen-gerechte Werk-Verb aus §11.4, Material ziehend) → **(5) real** (platziert via Hotbar / gehalten /
getragen / als Ladungen). Die Rollen-Markierung (`setBlueprintAsArmor/Consumable/Tool`) + die Mach-Akte
kollabieren in DIESEN Fluss. Die `ausrüstung`/`spieler`-Drawer werden zu GEBRAUCHS-Flächen (das schon
gefertigte Gerät/Rüstung anlegen, die schon verkörperte Seele wechseln), KEINE Schöpfungs-Flächen mehr —
die Schöpfung wohnt in der Werkstatt, der Gebrauch am Körper.

### 11.6 Das Teilen-Modell — schon bewiesen, nur generalisieren

Sonde B zeigt: für Strukturen ist „Plan frei / Werk kostet" bereits Code-Wahrheit. Sobald das Mach-Tor
(§11.4) verallgemeinert ist, ERBEN die neuen Werk-Akte die Herkunfts-Agnostik GRATIS — ein geteiltes Gerät/
ein geteilter Trank kostet beim Schmieden/Brauen genau wie ein selbst-entworfener, und die W13-Signatur
(über die Substanz) reist mit jedem Mach-Akt. So lebt es im Ultiversum: der Schöpfer entwirft ein Gerät →
signiert den Plan → teilt ihn (Broadcast/Recipe-Import/Fusion/Bibliothek) → ein anderer kopiert den Plan
gratis → zahlt SEIN Material beim Schmieden → hält das echte Gerät, mit der beweisbaren Autoren-Signatur.
Information fließt frei, Materie wird lokal bezahlt — der Co-Schöpfer-Kreis, ökonomisch sauber.

### 11.7 Der sequenzierte Teilschritt-Plan (S1–S11 — §10s F-Schritte falten ein)

- **S1 — die Werkstatt erkennt JEDE Lesart — ✅ GEBAUT (V17.59):** `_blueprintCapabilityHints(bp)` liest die
  emergente Fähigkeit aus Form × Material (die in-der-Hand-Lesart Klinge/Brecher/Gerät via
  `_implementAffordanceLabel`, nur bei greifbarer Größe `IMPLEMENT_GRASP_SPAN_M` 6 m · Schutz aus dichte+härte
  · Wesen/Tor/Wirkung via `_isBodyShaped`/`_isPortalShaped`/`_isFoodLike`), UNABHÄNGIG von der abstrakten
  Rolle; `_workshopAppendRoleRow` rendert eine „Fähigkeit"-Zeile. Der Holzstiel+Steinkopf liest „Brecher —
  wuchtet Fels", obwohl seine Rolle „Bauwerk" ist — der „nur Bauwerk"-Befund GEHEILT. `checkBandV1759Capability­
  Readout` 6 grün (inkl. der rollen-unabhängige Heal + die Struktur-Suppression + der DOM-Konsum). *Reuse, kein
  neuer Pfad; das Feel/die Optik der Chips = Schöpfer-Browser.*
- **S2 — das Mach-Tor `_makeCostGate` + die Modus-Kristallisation — ✅ GEBAUT (V17.60):** `_makeCostGate(name)`
  (die Generalisierung von `_buildMaterialGate`, das jetzt darauf delegiert) routet jeden Werk-Akt durch
  `tryConsumeBuildCost` mit der kristallisierten Modus-Achse: **Materie kostet in pfad UND frieden, frei nur in
  schöpfer** (`mode === "schöpfer"` ist der einzige Free-Pass) — die V17.59-Diskrepanz „frieden = gratis wie
  schöpfer" GEHEILT. Die Bau-HUD zeigt jetzt auch in frieden die Kosten (nur schöpfer „frei"). Der Kreatur-
  Bau-Pfad erbt es (konsistent). Mühe/Bedrohung (Stamina/Abbau-Hieb) bleiben die pfad-Achse — frieden ist
  friedlich, aber nicht gratis. `checkBandV17.60` (im 6.H-P2C-Band, 4 grün: `_makeCostGate` da, frieden lehnt
  ohne Material ab, **KONSUM** frieden MIT Material baut + verbraucht, frieden-HUD zeigt Kosten); Test-Migration
  (V9.56-i): die alten „frieden baut frei"-Proben → „frieden zahlt", + der Ring-6-V2-Spawn-Test auf schöpfer
  (er prüft den Spawn, nicht die Kosten). *Fundament für S3–S6; headless bewiesen.*
- **S3 — Gerät schmieden — ✅ GEBAUT (V17.61):** **F2** — `_implementProfileForBlueprint` multipliziert
  minePower+cutPower mit `0.5+0.5·präzision` (`forgedPrecision`-Snapshot wenn geschmiedet, sonst live aus
  den Parts; opChain-los = 1.0 → Faktor 1.0, kein Regress) → besseres Crafting hebt das Abbauen, die §4.3-
  Rekursion schließt END-TO-END. **F3** — `forgeBlueprint(name)`: zieht Material durchs §11.2-Mach-Tor
  (pfad/frieden zahlen, schöpfer frei) + friert die Präzision ein + rüstet das Gerät aus (equipHeld) + der
  Affekt (`_feelAction("create")`); ein „⚒ Schmieden (in die Hand)"-Knopf in der Werkstatt. `checkBandV1761­
  ForgeImplement` 6 grün (F2 fein>grob; F3 pfad ohne Material lehnt ab, **KONSUM** pfad mit Material baut +
  verbraucht + rüstet aus, friert Präzision ein, schöpfer frei). *equipHeld bleibt der freie GEBRAUCH; das
  Kosten-Tor sitzt im Schmiede-WERK. Das Feel/die Balance = Schöpfer-Browser.*
- **S3-B — der Schmiede-Akt wird BEDEUTSAM — ✅ GEBAUT (V17.62):** Reflexions-Fund (Schöpfer 02.06.): der
  Schmiede-Akt war UMGEHBAR — `equipHeld` gab ein Gerät gratis, mit derselben (live-)Präzision, die das
  Schmieden einfriert → schmieden war STRIKT SCHLECHTER (zahlt nur Material) → kein Anreiz, die „Werk kostet"-
  Synergie für das Gerät nicht erzwungen. Heilung: `wieldBlueprint(name)` (der Spieler-Equip-Pfad, der
  Drawer-Dropdown routet darüber): ein UNgeschmiedetes Gerät in pfad/frieden → erst SCHMIEDEN (zahlt), ein
  geschmiedetes (`forgedPrecision`, jetzt im Snapshot PERSISTIERT) ODER schöpfer → frei (GEBRAUCH). Schmieden
  EINMAL, halten frei, überlebt Reload. `equipHeld` bleibt das freie Low-Level-Primitiv (Restore/DSL/Chat/
  Aliase = die scripting-Schicht; deren volle Vereinheitlichung bleibt S7). `checkBandV1762ForgeMeaningful`
  6 grün (Persistenz, wield-ungeschmiedet-ohne-Material lehnt ab, **KONSUM** wield-mit-Material schmiedet,
  GEBRAUCH-frei für geschmiedete, schöpfer frei). *Damit hat S3 seinen Anreiz; S4–S6 replizieren ein WERK-
  Muster, das tatsächlich BEISST.*
- **S4 — Rüstung schmieden/weben — ✅ GEBAUT (V17.63):** der gemeinsame WERK-Kern `_forgeMaterialAndFreeze`
  (Material + Präzision-Snapshot + Affekt) extrahiert (forgeBlueprint hängt jetzt darauf, verhaltens-gleich);
  `forgeArmor(name)` (verlangt role:"armor") + `wearArmor(name)` (der Spieler-Pfad, forge-wenn-ungemacht, sonst
  frei) spiegeln forge/wield in den armor-Slot; die Rüstungs-Zeile im Equip-Drawer routet darüber; der eine
  rollen-bewusste `fertigeBlueprint` + der ⚒-Knopf (Rüstung → weben, sonst → schmieden) = der erste Schritt
  zur EINEN Werkstatt-Gebärmutter (§11.5). `checkBandV1763ForgeArmor` 7 grün (forgeArmor verlangt die Rolle,
  pfad ohne Material lehnt ab, **KONSUM** pfad mit Material webt + zahlt + trägt, GEBRAUCH frei, fertige routet
  nach Rolle, forgeBlueprint nach dem Refactor heil). *Das Web-Muster BEISST (auf S3-B). Headless bewiesen.*
- **S5 — Avatar: einen Körper formen — ✅ GEBAUT (V17.64):** `forgeAvatar(name)` (verlangt role:"soul";
  derselbe WERK-Kern `_forgeMaterialAndFreeze` → dann `applyPlayerSoulFromBlueprint` erschafft + verkörpert)
  + `embodyBlueprint(name)` (der Spieler-Pfad: ungeformte Seele in pfad/frieden → forgeAvatar/zahlt, geformte
  oder schöpfer → frei verkörpern). `fertigeBlueprint` routet jetzt auch soul → forgeAvatar; der „Als Seele
  tragen"-Knopf läuft über embodyBlueprint (zahlt-wenn-ungeformt), der ⚒-Knopf überspringt Seelen (sie haben
  den dedizierten Knopf). `applyPlayerSoulFromBlueprint` bleibt das freie Low-Level-Primitiv (Welle-9d-Band
  unberührt). `checkBandV1764ForgeAvatar` 7 grün (forgeAvatar verlangt role=soul, pfad ohne Material lehnt ab,
  **KONSUM** pfad mit Material formt+zahlt+verkörpert+friert ein, GEBRAUCH frei, schöpfer frei, fertige routet
  soul). *Der Avatar ist KEINE Ausnahme mehr — drei Rollen teilen den Kern. Headless bewiesen.*
- **S6 — Trank brauen zieht die Zutaten — ✅ GEBAUT (V17.65, der STRUKTUR-Heal):** `brewConsumable(name)`
  (verlangt role:"consumable") zieht die Zutaten (die Material-Kosten des Trank-Bauplans, z.B. `laub` von
  Bäumen) durchs §11.2-Mach-Tor, DANN wirkt der Trank (activateConsumable) → heilt den ∞-Gratis-Boost (Sonde
  A): jeder Brau+Trunk kostet geerntete Zutaten (pfad/frieden), frei nur in schöpfer. activateConsumable bleibt
  das freie Low-Level-Primitiv (DSL/Chat/Tabellen-Tränke); der Bauplan-Trank-Knopf („Brauen + Trinken") +
  `fertigeBlueprint` (consumable → brewConsumable) + der ⚒-Skip für Tränke routen darüber. `checkBandV1765­
  BrewConsumable` 7 grün (verlangt die Rolle, pfad ohne Zutaten lehnt ab, **KONSUM** pfad mit Zutaten zieht
  Material + wirkt, activateConsumable bleibt frei, schöpfer frei, fertige routet consumable). *Headless bewiesen.*
- **S6-B — die echte Zutaten-TIEFE — ✅ GEBAUT (V18.133: die Scatter-Flora ist pflückbar [InstancedMesh-instanceId + Session-Regrow], Alchemie-Materialien kraut/essenz, trank_lebenssaft zieht GEPFLÜCKTE Zutaten — pflücken → brauen → trinken):** die V17.1-Klein-Vegetation (Blüten/Farne/Sporen) ist
  reine GPU-Deko (kein Harvest/Collision) → erntbar machen = ein neues GPU-Instanz-Harvest-System + dedizierte
  Alchemie-Material-Tags (kraut/essenz). HEUTE sind die Zutaten die Part-Materialien (laub von Bäumen funktioniert
  schon); S6-B gibt der Alchemie eigene erntbare Flora. *Eine eigene meatige Welle (V17.17-Spawn-Affinität messen).*
- **S7 — der EINE Fluss: das FERTIGEN in den Prozess-Fluss falten — ✅ KERN GEBAUT (V17.66):** Der Befund (Schöpfer-
  Browser-Audit 02.06.): die S3–S6-Mach-Akte erschienen als PARALLELER Pfad — der „⚒ Schmieden"-Knopf lag im
  Detail-Editor + hieß wie der Schmiede-Hammer-PROZESS, also wirkte er wie eine Doublette des „Prozess-ziehen-fixiert-
  die-Rolle"-Flusses. Die WURZEL war die PRÄSENTATION + Benennung, nicht die Logik. **Gebaut (eine UI-Verdichtung,
  kein neuer Pfad):** **(a)** der EINE rollen-bewusste **`_workshopAppendFertigenRow`** als ABSCHLUSS der Stats-Tabelle
  (`_workshopRenderStatsPanel`, nach Rolle/Fähigkeit/Kosten/Tags/Qualität — der Fluss „verfeinern → ablesen →
  FERTIGEN"); der Knopf heißt **„⚒ FERTIGEN"** (der Abschluss), routet rollen-gerecht (soul → `embodyBlueprint`, sonst
  → `fertigeBlueprint`: Gerät schmieden / Rüstung weben / Trank brauen). Die ZWEI alten Detail-Editor-Knöpfe (⚒ +
  „Als Seele tragen") sind ENTFERNT. **(b)** das FERTIGEN ist durch das §11.2-Werkstatt-Gate gegated — `_makeStationGate`
  (liest die Spieler-Position) im gemeinsamen Mach-Kern `_forgeMaterialAndFreeze` + `brewConsumable` → ein domain-
  tragender Bauplan (forging-Gerät → Esse, alchemy-Trank → Brennkolben) verlangt im pfad-Modus die passende Welt-
  Werkstatt nah; **end-to-end (nicht nur confirmBuild)**, das Tor schließt VOR den Material-Kosten. Die FERTIGEN-Zeile
  zeigt den Stations-Status (⚙ „Esse nah" / „braucht Esse"). **(c)/(d)** die Achsen (Tags/Qualität) + der Lebenszyklus
  (Rolle emergent/manuell + ↺ + Domain-Bars/Wachstumshinweis) liegen schon im Panel — die FERTIGEN-Zeile ist ihr
  Abschluss. `checkBandV1766FertigenFlow` 9 grün (Methoden da, die alten Knöpfe weg, das Gate lehnt forging-ohne-Esse
  ab + Material bleibt, **KONSUM** Esse-beim-Spieler → fertigt + zieht Material, ein domain-loses Gerät braucht KEINE
  Station [darum brechen die S3–S6-Bands nicht], frieden/schöpfer überspringen, **KONSUM-DOM** die FERTIGEN-Zeile
  rendert + eine Station-Rolle rendert keine). *Die Mach-Logik bleibt unverändert; nur die PRÄSENTATION vereint sich.
  Das FEEL/der Fluss = Schöpfer-Browser (headless beweist die Mechanik + die Faltung, nicht die Synergie).*
  **OFFEN (zwei bewusste, GEMESSENE Schnitte — eigene Wellen, kein „weichen"):** **(S7-B) der Werkzeug-Aufräum-Schritt**
  (hammer+feuerstein-knapper raus, feile/polier-„Decke" → Maschine): GEMESSEN ripple-schwer — `hammer` ist ein
  load-bearing Test-Fixture (~15 Invarianten, inkl. Kreatur-Equip + `rejectsBuiltinTool`); das Registry-Aufräumen ist
  ein eigenes Anliegen (Tool-Schicht, nicht UI-Fluss), und „feile/polier → Maschine" ist eine Crafting-Ökonomie-
  Verhaltensänderung, deren Schwelle/Feel das Schöpfer-Auge braucht. **(S7-C) die chat/DSL-Vereinheitlichung** (der
  letzte Gratis-Bypass „rüste/werde X" → durchs FERTIGEN): die scripting-Schicht (DSL/Chat/Restore/Aliase) ist
  load-bearing + multi-user-broadcast-sensibel; S3-B hielt `equipHeld`/`equipArmor`/`applyPlayerSoul` BEWUSST als das
  freie Low-Level-Primitiv. Beide nach dem Browser-Audit des Flusses.
- **S7-B — die PROZESS-HARDCODE-INSEL auflösen (Schöpfer-Dialog 03.06., re-framed):** der „Werkzeug-Aufräum"
  (hammer raus / feile-polier → Maschine) war nie ein Aufräum — er zeigte auf die letzte Hardcode-Insel. Die WORK-
  Seite emergiert (Rolle aus Form × Material, der forging-split / `_isPortalShaped`), aber die PROZESS-Seite
  (Werkzeuge + Werkstätten) trug Hardcode: die 5 Werkstätten hatten `roleManual: true` + ein **von Hand vergebenes**
  `workshopDomain`; ein Werkzeug bekommt seinen Op nur durch **manuelles** `setBlueprintToolMeta` (das opName-Tippen).
  Die Insel auflösen, EIN Bogen: **(i) ✅ GEBAUT (V17.67)** — die WERKSTATT-DOMÄNE emergiert via `_compute­
  WorkshopDomain` (eine Prioritäts-Kette positiver Substanz-Signale, Vorbild `_isPortalShaped`, an den 5 Built-ins
  gemessen: alchemy=durchsichtiges Gefäß · mechanism=strom-leitend · soulwork=magie-leitend · forging=dichte
  hitze-Masse · textile=weicher Rahmen); `_workshopStationGate` liest sie, das `workshopDomain`-Feld ist entfernt;
  `checkBandV1767` 5 grün (der Wächter friert die 5-Built-in-Baseline ein, der FLIP beweist Substanz statt Name).
  **(ii)** die „IST es eine Werkstatt?"-Emergenz für vom Spieler gebaute Apparate — **fällt jetzt aus der Rollen-
  Resonanz R3 heraus (§11.10)**, eine workshop-station-Signatur statt eines eigenen `_isWorkshopStationShaped`; die
  `role`-Deklaration auf den Built-in-Saaten bleibt bis dahin. **(iii)** der Op-aus-Form (= S10: scharf→schneiden,
  stumpf-hart→schmieden, das opName-Tippen fällt). **(iv)** ein Beispiel pro Rolle (die Bibliothek, optimierbare
  Saat). Dann schließt die Rekursion durch verbesserbare PROZESSBAUPLÄNE: ein besserer Prozessbauplan (Werkzeug ODER
  Werkstatt) → höhere Qualität → höherer Cap (`computeBlueprintQuality`-Snapshot) → höhere Präzision → bessere Werke →
  bessere Prozessbaupläne. *„Decke → Maschine" ist dann kein Designer-Pick, sondern: ein feines Werk braucht eine
  feine Esse, und die kannst du bauen.* *Headless beweisbar (die emergente Klassifikation + der Wächter); das Feel =
  Schöpfer-Browser.*
- **S8 — die Teilen-Konsistenz** (§11.6): das Mach-Tor ist herkunfts-agnostisch by-construction → ein
  geteiltes Gerät/Trank/Avatar kostet wie ein eigenes; die Signatur reist. Fällt fast aus S2 heraus.
  *Headless-Verifikation.*
- **S9 — in der Hand sichtbar** (= §10-F4): das gehaltene Gerät rendert in der Hand. *Render · Schöpfer-Browser.*
- **S10 — die Crafting-Op emergiert aus der Form** (= §10-F5): scharf → schneiden, stumpf-hart → schmieden,
  das manuelle opName-Tippen fällt. *Tief · mit `diag-arch-tags`-Wächter.*
- **S11 — die Animation in der Werkstatt (DIE KIRSCHE)** (Schöpfer-Vision 02.06.): heute ist die Animation
  pro built-in Seele hartcodiert (das sin/cos in `createPlayerSoul`/`buildCreatureGroup` — Walk-Cycle,
  Flügelschlag, Schweif-Welle); ein Custom-Körper/Fahrzeug bewegt sich nicht eigen. Die Krönung: eine
  DEKLARATIVE Part-Animation im Werkstatt-Editor (welche Parts oszillieren/rotieren, Frequenz · Phase · Achse
  · Amplitude) → ein geschmiedeter Avatar geht, ein gebautes Fahrzeug dreht seine Räder, alles vom Schöpfer
  geformt, nichts hartcodiert. Der Hylomorphismus eine letzte Ebene weiter (Form × Material × Bewegung). *Die
  ambitionierteste Welle — ein echtes Animations-Substrat; das Feel = Schöpfer-Browser.*
- **Fahrzeug-Fahren** (§11.3): das Bauen kostet schon; die Fahr-/Mount-Tiefe (Steuerung, Sitz, Trägheit) ist
  ein eigener Gameplay-Faden — **Schöpfer-Entscheid** wann, nicht in dieser Sequenz angenommen (S11 gibt ihm
  die Bewegung).

**Reihenfolge-Logik:** S1 (universeller Readout, heilt „nur Bauwerk" überall) + S2 (das Mach-Tor + die
Modus-Heilung) ZUERST — Fundament + sofort sichtbare Heilung + die Diskrepanz weg. Dann S3/S4/S5 (die
risikoarmen Mach-Akte Gerät/Rüstung/Avatar, je eine Welle, je ein `checkBand`). Dann S6 (die Zutaten-
Ökonomie, Welt-Inhalt), S7 (der Fluss), S8 (Teilen, fast gratis), S9/S10 (Optik + tiefes Crafting), S11 (die
Animations-Kirsche, zuletzt + am ambitioniertesten).

### 11.8 Scope + Disziplin (heilig)

- **Heilige Lektion:** die bewährte `confirmBuild`/`computeBuildCost`-Maschinerie wird EINMAL verallgemeinert
  (`_makeCostGate`) + rollen-gerecht gerufen — KEIN „CreationManager"-Modul, kein Parallelpfad (V17.9). Die
  vier Drawer verschmelzen, sie verdoppeln sich nicht.
- **Die Modi sind kristallisiert** (§11.2): Materie kostet in pfad+frieden (NICHT nur pfad wie heute), frei
  nur in schöpfer; Mühe/Bedrohung ist die pfad-Achse (frieden mild). Das HEILT die gemessene Diskrepanz
  (frieden = schöpfer = gratis) — eine bewusste Verhaltens-Korrektur am bestehenden Build-Gate, kein
  Versehen; sie lädt mit S2.
- **Der Avatar ist KEINE Ausnahme** (Schöpfer-Korrektur): einen Körper formen = Werk (kostet), tragen = frei.
  Die **Fahrzeug-Fahr-Tiefe** + das **endlich-vs-wiederholbar des Tranks** bleiben Schöpfer-Entscheide —
  benannt, nicht angenommen.
- **Headless beweisbar:** der Readout (S1), der Material-Zug + Präzisions-Snapshot (S2–S6), das Zutaten-
  Verbrauchen, die Herkunfts-Agnostik (S8). **Schöpfer-Browser:** das Feel, der EINE-Fluss-UX (S7), die
  Hand-Optik (S9), das Flora-Feel (S6), die Animation (S11 — ein echtes Substrat, am ambitioniertesten).
  **`diag-arch-tags` vor jeder Rollen-/Tag-Verschiebung** (S10, V17.17). KONSUM verifizieren, nicht Existenz
  (V17.31).
- **Headless-grün ≠ vision-aligned (S7-Lehre, §11.9):** der FLUSS/die UI-Präsentation braucht das Schöpfer-Auge
  früh — eine korrekte Mach-Logik kann trotzdem als Parallel-Pfad WIRKEN; zeige den Fluss im Browser, bevor du
  Welle auf Welle stapelst.

### 11.9 Browser-Audit-Ausrichtung (Schöpfer 02.06.) — die Lehre + der Lebenszyklus

Nach S1–S6 (alle headless-grün) zeigte der Schöpfer-Browser-Audit eine echte Fehl-Ausrichtung, die headless
NICHT sichtbar war: **die Mach-Akte sind funktional korrekt, aber als PARALLELER Pfad PRÄSENTIERT.** Der
„⚒ Schmieden"-Knopf (im Detail-Editor, benannt wie der Schmiede-Hammer-PROZESS) wirkte wie eine Doublette des
intuitiven Flusses, in dem das Ziehen eines Prozesses die Rolle schon fixiert. Der Schöpfer: „ein weiterer
Pfad, die bestehenden nicht vereint?". **Er hatte recht.** Die Heilung ist S7 (oben re-framed) — den Abschluss
in den bestehenden Prozess-Fluss + die Maschine-in-der-Welt FALTEN, nicht daneben stellen.

**Der Lebenszyklus (geklärt, gegen die Sorge „könnte man nichtmehr zurück?"):** die Rolle ist NICHT
irreversibel — sie EMERGIERT live aus der dominanten opChain-Domain (`_refreshBlueprintRoleEmergent` nach jedem
`applyOpToPart`): mehr forging → Gerät, dann mehr alchemy → wandert zu Trank; die Domain-Analyse-Tabelle zeigt
das. Manuell fixieren (setBlueprintAsArmor etc.) sperrt es, das ↺ löst es wieder. Das FERTIGEN ist KEIN
„Speichern" (Baupläne speichern automatisch) und KEIN Rollen-Schloss — es ist „das reale Werk herstellen"
(Material zahlen + ausrüsten/tragen/verkörpern); der einzige Commit ist die eingefrorene `forgedPrecision`, auch
re-fertigbar. **Frei wie die Welt.**

**Die drei Schichten (geklärt, gegen „Fähigkeit = die Eigenschaften, die die Rolle ermöglichen?"):** Tags
(härte/dichte/lebendig — die rohen Eigenschaften aus Material × Form) → daraus emergieren ZWEI Lesarten: die
FÄHIGKEIT (Klinge/Brecher/Schutz — was es KANN, die Form-Wahrheit, der S1-Readout) UND die ROLLE (die
Crafting-Kategorie, via die dominante Prozess-Domain + der forging-Tag-Split). Fähigkeit = „was kann es",
Rolle = „was IST es" — beide aus derselben Substanz. Die Domain-FARBE eines Prozesses sagt, welche Rolle er
steuert (forging→Gerät/Rüstung · alchemy→Trank · soulwork→Seele · …; generische Prozesse ohne Farbe heben nur
die Präzision, steuern keine Rolle).

**PERMANENTE LEHRE: headless-grün ≠ vision-aligned.** Eine Mach-/Feature-Logik kann KORREKT sein (alle
Invarianten grün) und TROTZDEM den intuitiven Fluss brechen, wenn ihre UI-PRÄSENTATION einen Parallel-Pfad
schafft oder einen bestehenden Fluss zu duplizieren SCHEINT (Benennung, Platzierung). Der headless-Test beweist
die MECHANIK, nicht die AUSRICHTUNG. Den FLUSS/die UI früh im Schöpfer-Browser zeigen — BEVOR man Welle auf
Welle stapelt; ein Prozess-Drag-Crafting-System verlangt das Schöpfer-Auge für die Synergie, nicht nur grüne
Bänder. Die Mach-Akte S3–S6 waren NICHT umsonst — die Logik (Material-Kosten, rollen-bewusster Abschluss,
Präzisions-Snapshot) bleibt; S7 stellt sie nur in den richtigen Fluss.

### 11.10 EIN Produkt-Vektor, viele Leser — die Resonanz-Vereinheitlichung (Schöpfer-Dialog 03.06.)

**Der Befund (Schöpfer, nach V17.67):** *„die meisten Dinge misst du sehr einseitig — müsste das nicht wie die
Aura sein? ist nicht bei jedem Produkt das Ergebnis ein Vektor aus allen Teilsystemen?"* **Er hat recht, GEMESSEN:**
das System denkt bereits in Vektoren — `auraAt` ist ein Vektor, **`spawnAffinityForBlueprint` ist buchstäblich ein
SKALARPRODUKT** (`score = Σ world[achse] · tags[achse]`), die `computeCompoundTags` SIND der 10-dim Substanz-Vektor
jedes Produkts. ABER die emergenten Klassifikatoren reduzieren ihn auf EINZEL-Tag-Schwellen: `_computeWorkshopDomain`
(V17.67) ist eine first-match-Kette (`wenn transparent ≥ 1.5 → alchemy`), und `computeBlueprintRole` mischt
Einzel-Prädikate. **Das bricht die Vektor-Natur, die das System überall sonst trägt** — die Inkonsistenz, die der
Schöpfer benannte.

**Das Prinzip (der wahre Norden auf das PRODUKT angewandt — „ein Feld, viele Leser"):** ein Produkt IST ein Vektor;
jede Ablesung (Rolle · Domäne · Affordanz · Spawn · Stats · Emotion) ist eine **RESONANZ/Projektion** dieses
Vektors, KEIN Einzel-Signal-Tor. Der volle **Produkt-Vektor** = **Tags** (10, Material × `FORM_TAG_ACTIVATION` — der
effiziente Rückgrat) ⊕ **räumliche Signatur** (die 5 Prinzipien spitze/hohlraum/symmetrie/kontakt/resonanz — heute
separat für Affordanzen/Portal/Körper berechnet) ⊕ **Skala/Komplexität**.

**Die Vereinheitlichung (das `spawnAffinityForBlueprint`-Muster, verallgemeinert):**
- `_blueprintResonance(produktVektor, signatur)` — der EINE Resonanz-Kern (Skalarprodukt/Cosinus: Bauplan gegen eine
  Signatur statt gegen das Welt-Feld).
- frozen `DOMAIN_SIGNATURES` + `ROLE_SIGNATURES` (ein Signatur-Vektor je Domäne/Rolle), an den Built-ins GEMESSEN.
- `_computeWorkshopDomain` + `computeBlueprintRole` → **argmax-Resonanz** (das best-resonierende gewinnt;
  null/architecture wenn nichts klar resoniert).
- **Folge:** die per-Rolle Hand-Flags (`setBlueprintAsArmor/-Consumable/-Weapon/setBlueprintToolMeta/-Portal` +
  `roleManual`) lösen sich in EINEN optionalen Schöpfer-Override auf (eine bewusste Geste, NIE der einzige Weg) — die
  Antwort auf „ist workshop-station die einzige hand-definierte Rolle?": nein, und der synergetische Weg macht das
  Hand-Setzen überall zum bloßen Override, jede Rolle bekommt ihren emergenten Resonanz-Pfad.

**Die Nuancen (EHRLICH, GEMESSEN — kein naives Dot-Product):**
- **Invers-Achsen:** „weich" (textile) ist NIEDRIGE härte → die Signatur braucht inverse/anti-Achsen, kein bloßes `+`.
- **die Glut-Maskierung** (V17.17): glut auf einer Kugel aktiviert `brennbar` NICHT → die Esse trägt kein „Feuer"-Tag,
  nur `dichte` → erst die **räumliche Schicht im Vektor** heilt das (die Form trägt, was das Tag verbirgt).
- **Normalisierung** (Cosinus statt rohem Dot), damit ein vielteiliger Apparat einen kleinen nicht überstrahlt.

**Die Disziplin (V17.16/.17, heilig):** die Baseline ALLER Built-in-Rollen/Domänen MESSEN (`diag`) → der Wächter
friert sie ein → die Resonanz MUSS sie reproduzieren; die bestehenden Rollen-Tests (forging-split · body · portal ·
food) wandern mit (V9.56-i). Beweise SUBSTANZ statt Name durch den FLIP (eine Material-Änderung kippt die Klasse).

**Die re-sequenzierten Resonanz-Schritte (sie ERSETZEN die Einzel-Signal-Form, kein neuer Pfad):**
- **R1 — die Domänen-Resonanz — ✅ GEBAUT (V17.68):** `_computeWorkshopDomain` von der first-match-Kette auf
  `_blueprintResonance` (der Kern: `Σ tag·gewicht`, Invers-Achsen erlaubt) + `WORKSHOP_DOMAIN_SIGNATURES`
  (frozen, an den 5 Built-ins gemessen) gehoben → ARGMAX, null unter dem Floor 2.0. `checkBandV1767` 6 grün
  (der Kern mit Invers-Achse, der Wächter per argmax, Substanz-statt-Name [lone Block→null], der Flip, das Gate).
  *Beweist den Resonanz-Kern; Tags-Resonanz reicht für die 5 Stationen — gemessen.*
- **R2 — die räumliche Schicht in den Vektor — ✅ GEBAUT (V17.69):** `_blueprintProductVector(bp)` = die 10 Tags ⊕
  `bodyShape`/`portalShape` als Achsen (0/1 aus den bestehenden Prädikaten). GEMESSENER Schlüssel: die Geometrie-
  Prädikate sind KONJUNKTIONEN (Symmetrie UND Vertikalität UND Glieder) — eine lineare Resonanz bräche das (ein
  flaches symmetrisches Dorf kippte zu soul). Die Konjunktion lebt im FEATURE (0/1), die disjunktive Entscheidung
  im argmax. *Heilt das „die Esse ist klein"-Problem strukturell: die Form ist eine Achse, kein Größen-Veto.*
- **R3 — die Rollen-Resonanz — ✅ GEBAUT (V17.69):** `computeBlueprintRole` = die opChain-Domäne (Intent, Vorrang)
  → sonst `_computeFormRole` = argmax über `FORM_ROLE_SIGNATURES` (soul {bodyShape, lebendig} · portal {portalShape}
  · consumable {lebendig, −härte} · architecture {dichte, härte}), Floor → architecture. Ersetzt die priority-
  Prädikat-Kette (kein first-match-bias). **DER HEAL (Schöpfer „jetzt heilen"):** „architecture" ist eine POSITIVE
  Signatur (dichte+harte Struktur) — ein Stein-Tempel/Felsbogen resoniert architecture (3.0) > soul (2.0) trotz
  body-Geometrie → Bauwerk statt Seele; ein weicher fleisch-Körper resoniert soul stärker. Die Hand-Flags bleiben
  Override (`roleManual`). `checkBandV1769` 7 grün + V8.35/W12 grün (kein Regress). *Damit steht die Resonanz-
  Vereinheitlichung: Domäne (R1) + Rolle (R3) als argmax des Produkt-Vektors — ein Produkt-Vektor, viele Leser.*
- **R3-Schluss — die Werkstatt-DESIGNATION als Intent-Override — ✅ GEBAUT (V17.70):** GEMESSEN (die domain-vs-
  architecture-Resonanz aller Built-ins): die Werkstatt-NATUR emergiert NICHT sauber — eine Esse und ein dichtes
  Bauwerk sind Substanz-Zwillinge (village resoniert forging 2.78, felsturm mechanism 2.97, kristall_geode soulwork
  3.09 — so stark wie die Stationen). Es gibt kein „ist-es-eine-Werkstatt?"-Substanz-Signal (Forge vs. Gebäude =
  ZWECK, nicht Materie — wie ein Hammer vs. ein Felsblock). Die ehrliche Form (der Resonanz-Plan reservierte sie):
  die DOMÄNE emergiert (R1), die DESIGNATION ist Intent — `setBlueprintAsWorkshopStation` (Spiegel von
  setBlueprintAsArmor) + DSL-Op `set_workshop_station`. Ein Spieler baut einen Apparat → markiert → er bedient seine
  EMERGENTE Domäne, das Gate findet ihn. `checkBandV1770` 6 grün. **Damit ist die Prozess-Hardcode-Insel aufgelöst:
  Domäne + Rolle emergieren, die einzige Hand-Geste (Werkstatt-Designation) ist der vorgesehene Intent-Override, und
  auch dort emergiert die Domäne.** PERMANENTE LEHRE: nicht alles emergiert aus der Substanz — manche
  Unterscheidungen sind INTENT (Zweck über Materie); MISS welche, und nutze den „optionalen Override" für sie,
  während die EIGENSCHAFTEN (Domäne) emergent bleiben. Ein Hand-Flag ist kein Hardcode-Versagen, wenn die
  Unterscheidung GEMESSEN nicht-emergent ist.
- **S10 — die Katalysator-Op aus der Form — ✅ GEBAUT (V17.71):** die opClass emergiert als argmax-Resonanz des
  Produkt-Vektors (Tags ⊕ `pointedFraction`, die W2-Geometrie als neue Achse) gegen `OP_CLASS_SIGNATURES`:
  subtractive=scharf (pointedFraction dominant) · plastic=stumpf-dicht · phaseChange=magie. `_computeToolOpFromForm`
  + `setBlueprintToolMeta(name)` ohne opClass leitet ab (explizite opClass = Override). `checkBandV1771` 5 grün
  (KONSUM scharf→schneiden/stumpf→schmieden/magie→wandeln, der FLIP eisen-cone→sub vs eisen-box→plastic, die
  Auto-Ableitung, der Override unbroken). EHRLICH: additive (mischen) ist FORM-mehrdeutig (Mörser=Hammer-Zwilling)
  → Intent-Override, wie die Werkstatt-Natur (V17.70). Synthetisch gewächtert (Built-in-Tools sind formlos).
  **Damit ist die Prozess-Hardcode-Insel VOLLSTÄNDIG aufgelöst: Domäne (R1) + Rolle (R3) + Werkzeug-Op (S10)
  emergieren; die einzigen Hand-Gesten (Werkstatt-Designation, additive-Op) sind die gemessen-nicht-emergenten
  Intent-Überschreibungen.**

**PERMANENTE LEHRE (die Architektur-Lehre): wenn das System schon einen Vektor trägt (Tags, Aura) und an EINER Stelle
eine Resonanz/ein Skalarprodukt rechnet (Spawn-Affinität), dann ist JEDE Einzel-Signal-Schwelle (`wenn ein Tag ≥ X`)
ein architektonischer Riss — die synergetische Form liest den GANZEN Vektor (argmax-Resonanz gegen frozen Signaturen).
Ein Produkt ist ein Vektor; Rolle/Domäne/Affordanz/Stats sind seine Projektionen, nicht seine Einzel-Tags.**
