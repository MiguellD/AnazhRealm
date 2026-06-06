# DAS EINE RESONANZ-SYSTEM — die systematische Vereinheitlichung

> **✅ VOLLENDET + ARCHIVIERT (V17.80–.85).** Die Resonanz-Vereinheitlichung ist KOMPLETT gebaut: ein
> Produkt-Vektor → ein Rollen-Register → die Wirkung tief für ALLE Effekt-Träger → der Katalysator
> sichtbar → die Klassifikation richtig (U1–U6, V17.80–.84 + der Schöpfer-Browser-Pass V17.85). Dieses
> Dokument beschreibt das fertige System + bleibt die Referenz dafür; es wird nicht mehr gepflegt. Der
> lebende Code: `_blueprintProductVector`, `ROLE_SIGNATURES`, `_blueprintRoleFit`/`_blueprintRoleSpectrum`,
> `_computeFormRole`, `_blueprintCatalystHint`. Verwandt: `docs/crafting-konzept.md` (das Substrat) +
> `docs/aktivierungsmatrix.md` (die Form-Tag-Matrix) + `docs/kampf-plan.md` §11.10 (die Anwendung im Kampf-Bogen).

**Status:** ✅ VOLLENDET (V17.80–.85, archiviert). Ursprung (03.06.2026, nach dem Schöpfer-Auftrag „all die Funktionen überlegen … was bedeuten die Klassen/Rollen in ihren jeweiligen Parametern, nicht nur einer, sondern über die GESAMTE Resonanz … welche Achsen wie gedreht, um den perfekten Katalysator zu erreichen, damit Spieler frei + kreativ sein können, das Ganze systematisch — so war es doch ursprünglich im Archiv beschrieben").

**Der wahre Norden dieses Plans:** `docs/crafting-konzept.md` §2–9 + `docs/aktivierungsmatrix.md` (die ursprüngliche, kohärente Vision) + `docs/kampf-plan.md` §11.10 (die begonnene Resonanz-Vereinheitlichung R1–R3/S10) + `docs/das-lebendige-feld.md` (lesen·schreiben·werten).

---

## 0. DER BEFUND (gemessen, nicht behauptet)

Das Archiv beschrieb EIN System: **ein Produkt ist ein PUNKT im Resonanz-Raum** (Material-Vektor × Form-Aktivierung × räumliche Prinzipien × Präzision), und **JEDE Lesart** (Rolle · Domäne · Op · Affordanz · Stat · Emotion) liest DENSELBEN Vektor — nur mit anderen Gewichten. Kein Whitelist, keine Rezept-Tabelle: der Spieler baut einen Punkt, die Welt LIEST seine Achsen.

Die Implementierung wuchs aber **fragmentiert**: 7 Signatur-Systeme, jedes erfand seine Achsen unabhängig.

| Lesart | bodyShape | portalShape | pointedFraction | räumlich (sym/spread/hollow) | 10 Material-Tags |
| --- | --- | --- | --- | --- | --- |
| `STAT_FROM_TAGS` (Wirkung) | ✗ | ✗ | ✗ | ✗ | ✓ |
| `FORM_ROLE_SIGNATURES` (Rolle) | ✓ | ✓ | ✗ | ✗ | ✓ |
| `ROLE_FIT_SIGNATURES` (Passung, V17.79) | ✗ | ✗ | ✓ | ✗ | ✓ (nur 3 Rollen) |
| `OP_CLASS_SIGNATURES` (Katalysator-Op) | ✗ | ✗ | ✓ | ✗ | ✓ |
| `WORKSHOP_DOMAIN_SIGNATURES` (Domäne) | ✗ | ✗ | ✗ | ✗ | ✓ |
| `AFFORDANCE_THRESHOLDS` (Welt-Reaktion) | ✗ | ✗ | ✗ | ✓ (eigene Gates) | ✓ |

**Die drei Kern-Risse:**

1. **Die FORM ist in der WIRKUNG unsichtbar.** `STAT_FROM_TAGS` liest nur die 10 Material-Tags → eine scharfe Klinge und ein stumpfer Klotz aus DERSELBEN Materie haben denselben Stat. Die Form (Schärfe, Körper, Hohlraum, Symmetrie) — die HÄLFTE des Hylomorphismus — fließt nicht in Schaden/Verteidigung/Geschwindigkeit. (V17.79 heilte das nur an den Ausrüstungs-Faltungen über `_blueprintRoleFit`, nicht in `STAT_FROM_TAGS` selbst.)

2. **Jede Rolle ist MEHRFACH + INKONSISTENT definiert.** „armor" lebt in `FORM_ROLE_SIGNATURES` (dichte+härte), in `ROLE_FIT_SIGNATURES` (dichte+härte, andere Gewichte), im `_computeForgingRole`-Split (dichte+zähigkeit+wärme), und gar nicht in `STAT_FROM_TAGS`. Es gibt KEINE EINE Wahrheit „was ist eine gute Rüstung über ALLE Achsen".

3. **Die Definitionen sind FLACH (1–2 Achsen).** Eine Rolle „achtet auf eine Form + eine Dichte". Das Archiv wollte den VOLLEN Vektor: ein Schwert ist `pointed↑ härte↑ zähigkeit↓ dichte~ elongation↑ magieleitung~`, nicht nur „pointed + härte".

---

## 1. DIE VISION — der perfekte Katalysator

> Ein **Produkt** ist ein Punkt im ~17-dimensionalen Resonanz-Raum.
> Eine **Rolle** ist eine RICHTUNG in diesem Raum (ihre Signatur).
> Der **perfekte Katalysator** für eine Rolle ist der Punkt, der ihre Signatur-Resonanz MAXIMIERT.
> Der **Spieler** baut frei einen Punkt; die Welt liest seine Resonanz gegen ALLE Rollen und sagt, was er IST + wie gut er es ist.

Drei Wirk-Schichten, alle aus DEMSELBEN Vektor:

```
WIRKUNG = MATERIAL            ×  FORM                 ×  HANDWERK
          (was es kann)          (wie gut es passt)      (wie fein gemacht)
          STAT_FROM_TAGS         Rolle-Resonanz          Präzision (Werkstatt)
          (heute material-only)  (V17.79, nur 3 Rollen)  (V17.76–.78, fertig)
```

Das Ziel der Vereinheitlichung: **ALLE drei Schichten lesen den GLEICHEN vollen Vektor; jede Rolle hat EINE volle Signatur; die Form ist überall sichtbar.**

---

## 2. DIE ACHSEN — der volle Produkt-Vektor

### 2.1 Material-Tags (10, vorhanden, `MATERIAL_TAG_KEYS`)

`härte · dichte · zähigkeit · wärmeleitung · stromleitung · magieleitung · transparent · brennbar · resoniert · lebendig`

Aggregiert via die Form-Tag-Aktivierungs-Matrix (`FORM_TAG_ACTIVATION`, 9 Formen × 10 Tags, 0–3) + MAX über die Parts (`computeCompoundTags`). **Das ist solide + vollständig — der Kern des Archivs.**

### 2.2 Form-Achsen (die räumliche Schicht)

**Vorhanden im `_blueprintProductVector`:** `bodyShape` (0/1), `portalShape` (0/1), `pointedFraction` (0–1).

**FEHLEND — die räumlichen Prinzipien (crafting-konzept §5.2), die als Helfer EXISTIEREN, aber NICHT im Vektor sind:**

| Achse | Prinzip (§5.2) | Quelle (Helfer existiert) | Bedeutung |
| --- | --- | --- | --- |
| `elongation` | Aspekt-Verhältnis (Nadel vs Klotz) | `_compoundBBox` (längste/mittlere Spanne) | gestreckt = Klinge/Stab/Welle; kompakt = Block/Kern |
| `hollowness` | Hohlraum enthält/dämpft/verstärkt | (neu, aus Part-Volumen vs BBox-Volumen) | Becher/Glocke/Helm/Behälter — Trank-Container, Rüstungs-Polster |
| `axialSymmetry` | Symmetrieachse trägt Alignment | `_axialAlignment` / `_compoundSymmetry` | Stab/Schwert/Schild richten entlang der Achse |
| `spread` | Trag-Basis vs Säule | `_isMoveable`-Support-Spread (schon berechnet) | Fahrzeug/Bauwerk-Standfläche vs Mast/Säule |

→ **Schritt 1 der Vereinheitlichung: diese 4 Achsen in den Produkt-Vektor heben** (die Helfer existieren, sie sind nur nicht im Vektor). Dann ist der Vektor ~17-dimensional + VOLLSTÄNDIG (Material ⊕ Form).

---

## 3. DER KATALOG — jede Rolle über die VOLLE Resonanz

Die Heilung des „flach"-Befundes: jede Rolle als VOLLER Signatur-Vektor (nicht 1–2 Achsen). `±` = positiv/negativ gewichtet, `~` = neutral/egal. Die Gewichte sind die ersten Schätzungen (an Archetypen zu MESSEN + browser-justierbar) — die STRUKTUR ist der Punkt: jede Rolle liest viele Achsen.

### 3.1 GERÄTE (Energie konzentrieren)

| Rolle | Signatur (die wichtigsten Achsen) | Katalysator |
| --- | --- | --- |
| **Klinge/Schwert** | `pointedFraction++ härte++ elongation+ zähigkeit− dichte~ axialSymmetry+` | langer scharfer harter spröder Kegel |
| **Stich (Pfriem)** | `pointedFraction+++ härte++ elongation++ zähigkeit−− dichte−` | extrem spitz, kein Puffer |
| **Wucht (Keule/Hammer)** | `dichte++ härte+ pointedFraction−− elongation~ zähigkeit+` | dichte stumpfe Masse |
| **Stab (magisch)** | `magieleitung++ resoniert+ stromleitung+ elongation++ axialSymmetry+ pointedFraction+` | langer Leiter, End-Fokus |
| **Grabwerkzeug** | `zähigkeit++ härte+ dichte+ pointedFraction~` | zäh, breit, bodentauglich |

### 3.2 RÜSTUNG (Energie verteilen)

| Rolle | Signatur | Katalysator |
| --- | --- | --- |
| **Platte** | `dichte++ härte++ zähigkeit+ hollowness+ pointedFraction−− spread+` | dicht, hart, gewölbt, gepolstert |
| **Kette/Leder** | `zähigkeit++ dichte+ härte~ hollowness+ lebendig~` | flexibel, energie-absorbierend |

### 3.3 TRANK (chemische Umwandlung)

| Rolle | Signatur | Katalysator |
| --- | --- | --- |
| **Heiltrank** | `lebendig++ transparent+ resoniert+ härte−− hollowness+ (Behälter zäh+transparent)` | lebendig, sichtbar, im Glas |
| **Feuer/Mut** | `magieleitung+ brennbar+ wärmeleitung+ lebendig~` | feurig, leitend |

### 3.4 SEELE/AVATAR (Emotion × Material)

| Rolle | Signatur | Katalysator |
| --- | --- | --- |
| **Seele** | `bodyShape++ lebendig+ axialSymmetry+ (Glieder) resoniert+ wärmeleitung~` | symmetrischer lebendiger Körper mit Gliedern |

### 3.5 PORTAL · WERKSTATT · MASCHINE · FAHRZEUG · BAUWERK

| Rolle | Signatur | Katalysator |
| --- | --- | --- |
| **Portal** | `portalShape++ magieleitung++ transparent+ resoniert+` | magie-leitender Ring/Oktaeder |
| **Werkstatt** | `dichte+ härte+` (Präzision) **+ die Domäne** (forging: dichte+wärme · alchemy: transparent · soulwork: magie+resoniert · textile: zäh+lebendig−härte · mechanism: strom+wärme) | solide Substanz + Domänen-Signal |
| **Maschine** | `stromleitung++ wärmeleitung+ dichte+ spread+` | leitend, bewegt, standfest |
| **Fahrzeug** | `spread++ zähigkeit++ dichte~ (max:magieleitung,stromleitung)+ elongation+ lebendig−` | Trag-Basis, federnd, angetrieben, mittel-dicht |
| **Bauwerk** | `dichte++ härte+ spread+ pointedFraction−` | massiv, standfest, kein Gerät |

**Der Schlüssel:** das sind keine 1-Achs-Regeln, sondern PROFILE. Eine Klinge ist nicht „pointed" — sie ist `pointed↑ härte↑ zähigkeit↓ elongation↑`. Ein Fahrzeug ist `spread↑ zähigkeit↑ Antrieb↑ dichte~ lebendig↓`. Der Spieler dreht die Achsen, um den Katalysator zu treffen.

**EHRLICHE GRENZE (V17.70-Lehre):** manche Rollen sind SUBSTANZ-ZWILLINGE (Rüstung ↔ Bauwerk: beide dicht+hart; Forge ↔ Bauwerk: beide dichte Masse). Sie unterscheiden sich durch INTENT (Zweck), nicht durch die Substanz allein → der `roleManual`-Override bleibt der ehrliche Weg für die GEMESSEN-nicht-emergenten Unterscheidungen. Die Resonanz trennt, was die Form trennt; der Intent trennt den Rest.

---

## 4. DIE LESER — eine Quelle, viele Projektionen

Derselbe Produkt-Vektor, gelesen von jedem Subsystem über den EINEN Resonanz-Kern (`_blueprintResonance` = Σ achse·gewicht):

| Leser | Was er ableitet | Signatur-Satz | Status |
| --- | --- | --- | --- |
| **ROLLE** | was es IST | `ROLE_SIGNATURES` (§3) | teilweise (FORM_ROLE_SIGNATURES, nur Form-Rollen) |
| **DOMÄNE** | welche Werkstatt es bedient | `WORKSHOP_DOMAIN_SIGNATURES` | ✓ (R1, V17.68) |
| **OP-KLASSE** | welche Transformation es katalysiert | `OP_CLASS_SIGNATURES` | ✓ (S10, V17.71) |
| **AFFORDANZ** | wie die Welt reagiert (fahrbar/strahlend/…) | `AFFORDANCE_THRESHOLDS` | ✓ (eigene Gates) |
| **STAT** | seine Roh-Kraft (Schaden/Verteidigung/…) | `STAT_FROM_TAGS` | ✗ form-blind |
| **EMOTION** | wie es sich anfühlt | `TAG_TO_EMOTION` | ✓ (V17.46) |

**Die Asymmetrie, die wir heilen:** Rolle/Domäne/Op/Affordanz lesen schon Resonanz-Signaturen, aber (a) der STAT ist form-blind, (b) die Rolle ist nicht über ALLE Achsen definiert (nur Form-Rollen, flach), (c) jede Rolle ist mehrfach + inkonsistent definiert.

---

## 5. DER PFAD — die Vereinheitlichung (Schritte, je ein checkBand)

**Prinzip: ADDITIV + GEMESSEN, kein Regress. Jeder Schritt zentriert um die heutige Balance (×1.0 im Schnitt), die Gewichte an Archetypen GEMESSEN (`diag-quality-rolefit`-Muster) + browser-justierbar.**

- **U1 ✅ GEBAUT (V17.80)** — der volle Produkt-Vektor: die 4 fehlenden Form-Achsen (`elongation · hollowness · axialSymmetry · spread`) in `_blueprintProductVector` gehoben (`_compoundVisualExtent` + `_compoundSymmetry` + neuer `_compoundSpread`). Additiv, inert (kein Leser referenziert sie noch) → kein Regress. GEMESSEN (`checkBandV1780FormAxes`, 6 grün: Klinge elongation 1 > Würfel 0, Trag-Basis spread 1 > Säule 0, Körper symmetry 1 > Klumpen 0, Behälter hollowness 0.74 > Block 0).

- **U2 ✅ GEBAUT (V17.81)** — EIN Rollen-Signatur-Register: `ROLE_SIGNATURES` (§3, alle Rollen, volle Signaturen über alle Achsen) ersetzt das 3-Rollen-`ROLE_FIT_SIGNATURES`; `_blueprintRoleFit` liest es. GEMESSEN (`checkBandV1781RoleRegister`, 6 grün: die TIEFE — Klinge.Waffe 1.18 > Block.Waffe 0.904, derselbe Block Bauwerk 1.176 [Rollen-Relativität]; vehicle Basis 1.198 > Mast 1.057 [die neuen Form-Achsen tragen die neue Rolle]; V1779-KONSUM Schwert 45 > Klotz 34 bleibt grün, balance-zentriert). Die Ausrüstungs-Stats werden damit automatisch tiefer (die V17.79-Faltungen rufen `_blueprintRoleFit`). FORM_ROLE_SIGNATURES (Klassifikation) bleibt bis U4.

- **U3 — die FORM in die WIRKUNG (der Kern-Riss):** die Rolle-Passung (`_blueprintRoleFit`, jetzt über das volle U2-Register für ALLE Rollen, nicht nur 3) moduliert die Stats — entweder (a) der bestehende Ausrüstungs-Fold (V17.79, erweitert auf alle Rollen) ODER (b) ein form-bewusster Term in `STAT_FROM_TAGS` selbst (eine scharfe Klinge → mehr Schaden, eine kompakte dichte Form → mehr Rückschlag). GEMESSEN: zentriert um die heutige Balance. Test: die Form diskriminiert die Stats (Klinge > Klotz, gemessen V17.79 — jetzt für alle Rollen).

- **U3 ✅ GEBAUT (V17.82) [Plan-U4]** — der KATALYSATOR sichtbar: `_blueprintRoleSpectrum` (die normierte Resonanz gegen ALLE Rollen, sortiert) + `_blueprintCatalystHint` (die positive Achse mit dem größten ungenutzten Potenzial) im Werkstatt-Readout („Resonanz: Gerät 1.0 · …" + Tooltip „mehr Schärfe → besserer Katalysator"). GEMESSEN (`checkBandV1782CatalystReadout`, 3 grün: die Klinge ist eine starke Waffe + diskriminiert gegen eine weiche Kugel, der Hinweis nennt die Schärfe, der Readout rendert). EHRLICH: die Spektrum-Scores saturieren für Metall (dicht+hart → viele Rollen hoch) — die Klassifikation Klinge→Waffe macht erst U4; die refs sind browser-justierbar zum Spreizen.

- **U4 ✅ GEBAUT (V17.83) [Plan-U5]** — die Rolle-KLASSIFIKATION an der Wurzel: `_computeFormRole` erkennt eine greifbare KLINGE/SPIKE (`_isGraspableBladeForm` = spitz UND gestreckt, klein) als Waffe/Werkzeug (argmax weapon/tool, normiert), NICHT mehr „architecture" — der Substanz-Zwilling Klinge/Bauwerk über die FORM getrennt. EHRLICH eng (vision-treu): nur spitz+gestreckt = eindeutig eine Klinge; ein spitzes KOMPAKTES Ding (Kristall-Cluster) UND ein stumpfes elongiertes (Stab/Säule/Körper) bleiben den Form-Rollen (sonst falsche Reklassifikation). GEMESSEN (`checkBandV1783ImplementClassification`, 6 grün: spike→weapon [das Schöpfer-Beispiel], handle→architecture [konservativ], large/cube→architecture, Körper→soul; V17.69-Baseline wiederhergestellt). Migriert (V9.56-i): V17.72 (geraet_spitzhacke = Spitzhacke spitz+gestreckt → jetzt korrekt Werkzeug, nicht architecture). Die Substanz-Zwillinge Rüstung/Bauwerk bleiben Intent-Override (V17.70). `_blueprintUseKind` (Hotbar-Gate) nutzt weiter das breitere `_isGraspableImplementForm` (spitz ODER elongiert für „hold").

- **U5/U6 [Plan-U6] — die Subsysteme:** das U2-Register enthält BEREITS Fahrzeug + Trank + Avatar als volle Rollen (vom Spektrum U3 + der Rolle-Passung U2 gelesen). **Trank ✅** (consumable-Resonanz moduliert die Potency, V17.79). **Avatar ✅ (V17.84)** — die FORM in die WIRKUNG für die Seele: `soulMul = 0.5 + 0.5·Präzision·soulFit` in `computePlayerStats` (ein körper-förmiger Custom-Avatar wirkt stärker, gemessen 149 HP > 136 für einen Klumpen); NUR Custom-Avatare, die Built-in-Seelen bleiben neutral (kein Balance-Bruch). **Rüstung ✅** (V17.79). **Held/Waffe/Werkzeug ✅** (die Held-Faltung). **Werkstatt ✅** (Präzision aus Substanz, V17.76). **Fahrzeug + Portal:** im Register/Spektrum sichtbar, aber ihr GAMEPLAY-Effekt (Bewegung / Portal-Stärke) existiert noch nicht (Backlog — wenn es landet, liest es die Resonanz direkt, kein Sonder-Pfad). **Damit erreicht die FORM-Passung ALLE Rollen, die einen Effekt tragen — die systematische Vereinheitlichung ist KOMPLETT: ein Produkt-Vektor (U1) → ein Rollen-Register (U2) → die Wirkung tief, für ALLE Effekt-Träger (U2+U6) → der Katalysator sichtbar (U3) → die Klassifikation richtig (U4).**

- **V17.85 ✅ — der SCHÖPFER-BROWSER-PASS heilt die SICHTBARKEIT (keine neue Resonanz, die bestehende richtig ZEIGEN):** der Browser-Pass des fertigen Systems fand, dass die emergente Rolle korrekt BERECHNET, aber im Werkstatt-Readout falsch ANGEZEIGT wurde — `bp.role || DEFAULT` zeigte „Bauwerk" für einen rollenlosen Bauplan (Spitzhacke), obwohl `computeBlueprintRole` „tool" sagt (U4). Geheilt mit `_displayRole(bp)` (deklarierter Override ODER built-in-Saat → autoritativ; sonst die emergente Rolle) an beiden Readout-Stellen + `cloneBlueprint` materialisiert die emergente Rolle. Plus `removePartOp` (der Prozess-Fluss wird umkehrbar — die opChain bleibt append-only, aber der Spieler kann die letzte Op zurücknehmen + die Rolle re-emergiert). GEMESSEN (`checkBandV1785RoleDisplayAndUndo`, 7 grün). **Verständnis-Klärungen (kein Code): ein Portal ist eine FORM** (`_isPortalShaped`, ein magie-leitender Torus — kein „Portal-Prozess"); **die Werkstatt-Präzision IST die Qualität aus der Substanz** (V17.76, kein Zirkel) + die DOMÄNE emergiert (`_computeWorkshopDomain`, R1) — eine Station bedient eine DOMÄNE (forging fertigt Waffe UND Rüstung; die Form des PRODUKTS entscheidet die Rolle, nicht die der Werkstatt → kein Henne/Ei). **LEHRE: eine emergente Eigenschaft im UI über den emergenten Berechner lesen, NIE das rohe persistierte Feld; ein append-only Verlauf braucht trotzdem einen Rückwärts-Akt.**

---

## 6. DAS ZIEL — Freiheit durch Emergenz

Kein Whitelist, kein Rezept-Lookup. Der Spieler hat:

- **9 Formen** (die Aktivierungs-Matrix) × **N Materialien** (Vektoren) × **4 Op-Klassen** × **5 räumliche Prinzipien** × **Präzision**.

Daraus baut er einen PUNKT. Die Welt liest seine volle Resonanz + sagt:

- WAS er ist (Rolle, argmax),
- WIE GUT er es ist (Rolle-Passung, die volle Signatur),
- WIE STARK (Stat = Material × Form × Handwerk),
- WIE die Welt reagiert (Affordanz),
- WIE er sich anfühlt (Emotion).

Der **perfekte Katalysator** jeder Rolle ist berechenbar (der Signatur-Maximierer) + zeigbar (U4) — aber nie vorgeschrieben. Der Spieler entdeckt ihn, dreht die Achsen, findet Überraschungen (eine Papierkugel mit hoher Resonanz = ein Musik-Ball). **NICHTS ist falsch — manches ist nützlich, manches nutzlos, manches genial. Das System emergiert, statt zu verschreiben.**

Das ist die ursprüngliche Vision des Archivs (`crafting-konzept.md` §8–9), jetzt als EIN kohärentes Resonanz-System über alle Subsysteme — der wahre Norden, auf den V17.59–.79 schon hinarbeiteten, hier vollständig artikuliert + als Pfad U1–U6 gelegt.
