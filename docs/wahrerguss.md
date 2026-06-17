# DER WAHRE GUSS — der Weg zum atemberaubenden Bauplan

> **STAND (16.06.2026 — DER EINE AKTIVE MASTER-PLAN).** Dieser Plan ersetzt + vereint die
> drei fragmentierten Gesichter-Pläne (`wahrerwuchs` · FORM, `wahreranblick` · ANBLICK,
> `wahrerbauplan` · PHYSIK), die sich gegenseitig re-diagnostizierten. Sie sind archiviert
> (ihre volle Tiefe bleibt durchsuchbar; das hier Wichtige ist herausgezogen). **EIN
> Plan, EIN Gesetz, EIN Weg** — vom Seed zum atemberaubenden, variantenreichen,
> professionellen Werk. Auf den Schultern der Riesen (CGA/Split-Shape-Grammatik ·
> L-System · creature-Skelett+Metaball+Marching-Cubes · Catmull-Clark-Subdivision ·
> prozedurales PBR/Triplanar · Skeletal-Skinning · Oakeshott/die klassischen Ordnungen).

---

## §0 — DIE WAHRHEIT (gemessen am Werk-Katalog, eigene Augen)

Der Render-Katalog (`scripts/diag-werk-render.cjs`, 22 Werke, mit eigenen Augen geprüft)
sagt die ehrliche Wahrheit — in **beide** Richtungen, kein Über-Claim:

```
LIEST ALS DAS DING ✓ (das Gesetz erzeugt das Detail)
  Tempel   — dorische Ordnung: kannelierte Säulen + Triglyphen + Giebel + Stufen (Goldstandard)
  Schwert  — Oakeshott: distale Klinge + Hohlkehle + Knauf + Parier
  Wagen    — Speichen-Räder + Bordwände + Eck-Pfosten + Deichsel
  Esse     — Feuer-Bett + Haube + Schornstein + Amboss (Forge-Grammatik)
  Kristall — hexagonales Prisma + pyramidale Termination
  Portal   — Ring + Membran + Sockel-Pfeiler

CRUDE, ABER LEGIBLE ~
  Rüstung  — plateShell liest wie ein Fass-Kürass (Komponenten verschoben, „getragen noch komischer")
  Baum     — Stamm + Brettwurzel ✓, aber Krone DÜNN + kaum Blätter + kaum Rinde-Kontrast

BLOB ✗ (das Gesetz fehlt/ist schwach — die Wurzel)
  Avatar    — zerfallener Strichmann: Kopf/Arme SCHWEBEN getrennt, lose Zylinder-Glieder
  Glutwesen — Box + Box + lose Kegel-Beine, kein Tier
  Kreatur   — organischer Klumpen ohne Anatomie (~10 %, „sieht überhaupt nicht wie eine Kreatur aus")
```

**Die zwei Wahrheiten:** (1) das Gesetz erzeugt das Detail, **wo es scharf ist** —
Tempel/Schwert/Wagen sind der lebende Beweis. (2) Das **lebendige Herz** des Spiels —
Avatar + Kreaturen — ist der katastrophale Rest-Blob. Und **alles** ist low-poly +
flach-einfarbig, selbst der Tempel „wird sich kaum ändern, immer ähnlich sein" — der
beste Fall ist statisch in der Vielfalt. **„Kaum ein Profi würde das als fertig
bezeichnen"** (Schöpfer) — und das stimmt.

### Die Reflexion: warum jede Iteration zu kurz griff

Jede bisherige Welle (auch meine: T1–T6-Genom, F1–F6-Fidelität) bekämpfte den Blob am
**Geometrie-Niveau pro Objekt** — mehr Shapes, ein dedizierter Mesh je Domäne. Das ist
der **Instinkt des Amateurs**: „das Ding sieht falsch aus → modelliere das Ding
detaillierter." Es führt nie zu einem atemberaubenden, variantenreichen, professionellen
Werk. Der Katalog beweist es: 50+ Iterationen, immer noch Blobs am lebendigen Herz und
flach überall.

### Der Weg, den Profis kaum sichtbar gehen

Ein Profi fasst das **einzelne Objekt fast nie an**. Er baut eine Handvoll **geteilter,
komponierbarer Systeme** und lässt jedes Werk ein dünner **Auslesewert** davon sein.
Das ist exakt das Projekt-Axiom (_jede Eigenschaft gerechnet/gelesen, nie geraten/
gemalt_) — nur war es auf die GEOMETRIE nie angewandt. Vier Systeme, die kein einzelner
Screenshot verrät:

```
1. SUBSTANZ      ein Werk lebt zu ~70 % vom MATERIAL + LICHT, nicht von der Form.
                 Ein einfacher Mesh mit reicher Substanz schlägt einen komplexen
                 flach-einfarbigen. „Detail ≠ Geometrie. Detail = Substanz."
2. GRAMMATIK-TIEFE  Vielfalt ist ein Auslesewert der REKURSIONS-TIEFE der Grammatik,
                 nicht von ein paar Skalar-Achsen. 4–5 Regel-Ebenen → Tausende, nie
                 identische Werke. Mein Tempel ist EINE Ebene → darum „immer ähnlich".
3. SKELETT       eine Kreatur ist erst atemberaubend, wenn sie glaubhaft STEHT und sich
                 BEWEGT. Skelett→Haut→Skinning→Animation als EINE Pipeline. Und Rüstung
                 ist eine SCHALE über der Körper-Oberfläche (darum verschoben: isoliert
                 gebaut, nie am Avatar angepasst).
4. DETAIL-PASS   Subdivision + Displacement → grobe Käfige werden reiche Oberflächen
                 auf jeder Skala. Die Metaball-Haut ist EIN Beweis — nur auf `wesen` gesperrt.
```

**Der Kern-Befund:** das Projekt **beweist jedes dieser Systeme schon einzeln** — der
Surface-Nets-Mesher (Terrain+Wasser+Haut), der triplanare Terrain-Albedo, die L-System-
Bäume, die Metaball-Haut. Aber sie sind **versiloed** (der Albedo dient nur dem Boden,
die Haut nur `wesen`). **Die Zukunft ist nicht „neue Systeme erfinden" — sie ist, die
bereits bewiesenen Systeme zu GENERALISIEREN, sodass JEDER Bauplan durch sie fließt.**
Dann verbessert EIN Pass die ganze Welt auf einmal — das ist der Hebel, den Laien nicht
sehen.

---

## §1 — DAS EINE GESETZ (die kristallklare Logik)

> Ein Bauplan ist kein Mesh. Er ist ein **Gesetz** — eine rekursive Grammatik, die einen
> groben Käfig emittiert, der durch geteilte Pässe zum Werk wird.

```
DETAIL    ist der Auslesewert der GRAMMATIK-SCHÄRFE   (System C+D)
VIELFALT  ist der Auslesewert der GRAMMATIK-TIEFE     (System C)
SCHÖNHEIT ist der Auslesewert der SUBSTANZ            (System A)
LEBEN     ist der Auslesewert des SKELETTS            (System B)
WAHRHEIT  ist der Auslesewert der PHYSIK              (Ω-PHYSIS, schon im Code)
ROLLE     ist der Auslesewert des DETAILS             (das Tor, §4)
```

**Erzeugung (Grammatik) und Tor (Resonanz) und Substanz (Material) sind drei Gesichter
EINER Quelle.** Das ist die Vereinigung der drei alten Pläne: `wahrerwuchs` (FORM, die
Grammatik erzeugt), `wahrerbauplan` (PHYSIK, der Richter liest die Wahrheit),
`wahreranblick` (ANBLICK, die Substanz wird sichtbar) — kein „Skalarprodukt dreier
Docs" mehr, sondern EINE Produktions-Kette, durch die jeder Bauplan fließt.

**Kein Hand-Werk pro Objekt.** Ein Amateur baut 50 detaillierte Meshes; ein Gigant baut
4 Systeme und gewinnt 5000 Werke. Verbessere EINEN Pass → die ganze Welt hebt sich.

---

## §2 — DIE PRODUKTIONS-KETTE (was ein Bauplan IST, neu)

```
              SEED
               │  GRAMMATIK (System C — rekursiv, kombinatorisch → VIELFALT)
               ▼
        GROBER KÄFIG  (Parts / Knochen — die tragende Struktur, physik-geprüft)
               │  ┌─ Lebendiges: SKELETT (System B — Wirbelsäule+Glied-Paare+Gelenke)
               │  └─ DETAIL-PASS (System D — subdivide + displace → Reichtum je Skala)
               ▼
       REICHE OBERFLÄCHE
               │  SUBSTANZ-PASS (System A — prozedurales PBR: Krümmung·AO·Gradient·Tags·Faser)
               ▼
            DAS WERK
            ╱   │   ╲
   ┌───────┘    │    └────────┐
 TOR (§4)   RICHTER         GENOM (T1–T6)
 Resonanz   Ω-PHYSIS        die Varianz reitet
 liest die  steht/knickt/   OBEN auf der Grammatik
 Struktur-  Lastpfad/       (Größe·Alter·Palette·Form-Klasse)
 Reichtum-  Balance
 Achse →                    
 Rolle                      
 emergiert,                 
 Blob fällt                 
 durch                      
            ╲   │   ╱
               ▼
            RENDER  ──►  WAND 1 (das Schöpfer-Auge — der letzte Richter des LOOKs)
```

Jede Stufe ist ein Auslesewert, kein Hand-Werk. Die Grammatik liefert STRUKTUR +
VIELFALT; die geteilten Pässe liefern DETAIL + SCHÖNHEIT + LEBEN; der Richter garantiert
die WAHRHEIT; das Tor erzwingt die FIDELITÄT; das Auge richtet den LOOK.

---

## §3 — DIE VIER GETEILTEN SYSTEME (das Herz des Plans)

> Jedes System: das GESETZ (Schultern der Riesen) · was es ABSORBIERT (bewiesene Anker) ·
> der MECHANISMUS (konkret, ausführbar) · die WIRKUNG je Werk · die DISZIPLIN · das BEWEIS-BAND.

### SYSTEM A — DIE SUBSTANZ (prozedurales PBR — der breiteste Hebel, zuerst)

> Der größte „wirkt-professionell"-Sprung, der am wenigsten von Laien gesehene Hebel.
> Hebt JEDES Werk gleichzeitig, ohne eine einzige Form zu ändern.

- **DAS GESETZ:** keine Oberfläche wird gemalt — jede ist ein Auslesewert von
  **Feldern × Tags × Physik**. Prozedurales PBR (kein Bitmap-Albedo, die „gemalte
  Leiche"). Referenz: Substance-Designer-Prinzipien (Krümmungs-Maskierung,
  Kavitäts-AO, Höhen-Gradient), triplanare Projektion, tag-getriebene roughness/
  metalness/emissiv.
- **ABSORBIERT (GEMESSEN bereit):** `_buildPbrNodeMaterial` (PBR ist die EINE Wahrheit,
  V18.237, Toon raus) · `_terrainGeologyAlbedo` (Multi-Klassen-Boden, der triplanare
  Beweis) · Γ-M Strata/Flechten (43 Treffer) · `_ensureSkyEnvironment` (Sky-IBL, sonst
  render Metalle schwarz, V18.239) · die Welt-Felder (`worldFieldAt`) + das Drainage-Netz.
- **DER MECHANISMUS (ein geteilter Material-Pass, durch den JEDES Werk fließt):**
  ```
  Pro Fragment, aus EINEM TSL-Node-Graphen (das _terrainGeologyAlbedo-Muster generalisiert):
    KRÜMMUNG    fwidth(normal) → Kanten heller (Verschleiß), Mulden dunkler (Kavitäts-AO)
    GRADIENT    positionWorld.y / objekt-lokales Y → Schichtung (Strata, Rost am Fuß, Schnee oben)
    TAGS        härte → Riss-/Faser-Frequenz · dichte → roughness · stromleitung → metalness/Ton
                magieleitung/glut → emissiv (Stefan-Boltzmann, schon im Profil) · holz → Längs-Maserung
    FELD        moisture (Drainage) → dunkler/sättiger · lebendig → Moos-Anflug · slope → Fels-vs-Erde
    NOISE       Fragment-Detail (mehrere Oktaven) für Nah-Korn, LOD-gegated (fern simpler)
  ```
  Der Avatar/die Kreatur/das Schwert/der Tempel — ALLE bekommen denselben Pass; die
  Tags+Felder sagen, was emergiert. Bark-Kontrast (Schöpfer-Befund) = die Holz-Maserung
  + Krümmung; „flach-einfarbig" = behoben, weil die Substanz aus der Wahrheit wächst.
- **WIRKUNG je Werk:** Tempel-Stein bekommt Strata+Kavität · Schwert-Stahl Metall-Glanz+
  Schliff · Baum-Rinde Längs-Faser+Riss · Kristall emissiven Glanz · Boden seine Geologie ·
  Rüstung Metall+Nieten-Krümmung. **Jeder Pixel erzählt sein Material.**
- **DISZIPLIN:** kein Bitmap-Albedo (die Leiche) · die Aura/Atmosphäre erst NEUTRAL, dann
  urteilen · Mechanik braucht eine ZAHL (liest das Material das Feld? — CONSUM-Probe),
  LOOK braucht ein BILD (Wand 1) · LOD-Material (fern simpler, Perf).
- **BEWEIS-BAND:** `diag-werk-render`-Katalog vorher/nachher am Auge — liest jedes
  Material als echtes Material? + eine CONSUM-Source-Probe (der Material-Pass liest
  Krümmung/Gradient/Tag/Feld). **Die volle Pfeiler-Tiefe Ω-O1..O16 (Boden·Gras·Kiesel·
  Pfade·Rinde·Fels·Blatt·Atmosphäre) liegt in `archiv/wahreranblick.md` — sie sind die
  Detailliste dieses Systems.**

### SYSTEM B — DER KÖRPER (Skelett + Haut + Bewegung — das lebendige Herz)

> Der zweite Guss. Heilt die schlimmsten Blobs (Kreatur ~10 %, Avatar-Strichmann,
> Rüstung-getragen) als EIN System. Der sensibelste Build (berührt Motion/Physik/das
> gesperrte Template V18.209) — darum reference-first + richter-garantiert.

- **DAS GESETZ:** eine lebende Gestalt ist ein **anatomisches Skelett** (Wirbelsäulen-
  Spline + Glied-PAARE + Hals + Kopf + Schwanz, mit Gelenken + allometrischen
  Proportionen), das DREI Dinge zugleich ist: die FORM (die Haut umhüllt es), die
  BEWEGUNG (die Knochen animieren), die TRAG-FLÄCHE (Rüstung konformt sich daran).
  Referenz: creature-skeleton + Metaball + Marching-Cubes (procedural creatures);
  Galileo-Allometrie (Glied-Querschnitt ∝ L^1.5); Skeletal-Skinning.
- **ABSORBIERT (GEMESSEN bereit):** `_buildCreatureSkinGeometry` (Metaball→Surface-Nets,
  der Beweis — nur für `wesen` gesperrt) · `CREATURE_SOULS` + `_creatureSkeleton` (die
  Templates, heute abstrakt) · `_creatureBodySize` + `_applyCreatureAllometry` (Größe +
  Galileo-Querschnitt) · der Surface-Nets-Mesher (die EINE Quelle) · `_armorVariant`
  (plateShell, heute frei-schwebend).
- **DER MECHANISMUS:**
  ```
  (1) ANATOMIE-SKELETT-GRAMMATIK: _creatureSkeleton wird eine echte Grammatik —
      Wirbelsäulen-Spline → N Glied-PAARE (4 Beine Quadruped / 2+2 Biped) → Hals → Kopf
      → Schwanz, mit GELENKEN (Hüfte/Knie/Schulter), proportions-/anker-bewusst. Die
      Glieder VERBINDEN (keine schwebenden Zylinder). Die V18.209-Symmetrie bleibt: die
      Paare werden gespiegelt, nie verbogen.
  (2) HAUT FÜR ALLE SEELEN: die Metaball-Haut (`skin:true`) wird der Default für JEDE
      lebende Seele — Avatar, Glutwesen, jede Kreatur. Die Knochen verschmelzen via
      Falloff → eine glatte organische HAUT (der Strichmann verschwindet by construction).
      Raubtiere dürfen angular bleiben (die Kante IST die Bedrohung) — aber VERBUNDEN.
  (3) SKINNING (Bewegung): die Haut folgt der Motion (Bone-Weights aus der Metaball-
      Nähe). Der Walk-Cycle bewegt die Knochen → die Haut deformiert mit. Erst dann lebt es.
  (4) FÜSSE + KOPF: Fuß-Knochen am Glied-Ende (kein spitzes Auslaufen, §12-Befund);
      Kopf-Merkmale (Augen/Ohren/Schnauze als kleine Skelett-Anker).
  (5) RÜSTUNG KONFORM AM KÖRPER: plateShell wird eine SCHALE über der Torso-Oberfläche
      des Skeletts (die Platte folgt der Körper-Kurve), getestet AM Avatar-Skelett →
      „getragen" ist korrekt, nicht „verschoben". Rüstung + Körper = dasselbe System.
  ```
- **WIRKUNG je Werk:** Kreatur liest als Tier (verbundene Glieder, Anatomie) · Avatar als
  Wesen (kein Strichmann) · Glutwesen als angular-verbundenes Raubtier · Rüstung sitzt
  korrekt am Körper. **Das lebendige Herz schlägt.**
- **DISZIPLIN:** reference-first (echte Tier-Biomechanik) · der Richter garantiert (steht
  Ω-Φ2, Glieder tragen/knicken nicht Ω-Φ3-b, Allometrie ∝ L^1.5) · die V18.209-Symmetrie-
  Wand (Paare gespiegelt, nie verbogen) · die Index-/Opacity-Kopplung (children[i]↔
  bodyParts[i]) wahren (Accessoires am ENDE anhängen) · Affinität: scatter-Kreaturen
  tag-frozen (limb==cylinder, das Wesen-Temperament bleibt tag-emergent).
- **BEWEIS-BAND:** `diag-genom` (Skelett verbunden · steht · knickt nicht · Allometrie
  stockig · Symmetrie-treu) + `diag-werk-render` (Avatar/Kreatur/Glutwesen am Auge:
  liest als Wesen?) + die Form-folgt-dem-Feld-Kette (§10-V1: Region → Körper-Profil).

### SYSTEM C — DIE GRAMMATIK-TIEFE (rekursiv → endlose Vielfalt)

> Tötet „immer ähnlich" (Schöpfer-Befund am Tempel). Vielfalt ist ein Auslesewert der
> Rekursions-Tiefe, nicht von Skalar-Achsen.

- **DAS GESETZ:** eine Grammatik gewinnt Reichtum + Vielfalt aus REKURSIVEN, bedingten
  Regeln, die KOMBINATORISCH feuern — nicht aus ein paar Achsen. Referenz: CGA/Split-
  Shape-Grammatik (Masse → Split → Komponente → Detail, 4–5 Ebenen), L-System (fraktales
  Geäst, Detail je Skala).
- **ABSORBIERT:** `_buildClassicalTemple` (dorische Mini-Grammatik, EINE Ebene — die
  Saat) · `_growTreeBlueprintRich` (L-System, das tiefste bestehende) · `_rollGenome`
  (der UNSIGNED-Roller, EINE Quelle) · die GRAMMAR-Variant-Funktionen (`_rockVariant`,
  `_crystalVariant`, `_armorVariant`, `_glutVariant`, `_potionVariant`, `_toolVariant`).
- **DER MECHANISMUS:**
  ```
  (a) DIE EINE-EBENE-GRAMMATIKEN VERTIEFEN: der Tempel bekommt rekursive Sub-Regeln —
      Flügel/Seiten-Hallen · Fries-MUSTER (Metopen-Variation) · Dach-Typen · ALTER
      (Ruine/Verwitterung/fehlende Säulen) · Asymmetrie. Der Ausgabe-Raum wird vast,
      nie identisch. Der Baum bekommt dichtere rekursive Kronen (Ω-O16).
  (b) DAS GETEILTE GRAMMATIK-VOKABULAR (die Synergie, Drei-JA-geprüft): ein dünner
      Helfer mit komponierbaren Operatoren, die ALLE Builder teilen statt je neu
      zu implementieren:
        array(n, fn) · mirrorPair(fn) · taper(profil) · stack(n, schrumpf) ·
        radialRing(n) · revolve(profil) · alongSpline(spline, fn) · split(achse, regeln)
      Das macht NEUE Domänen-Gesetze billig (Station/Fahrzeug von scale+tint zu echter
      Grammatik) UND verdichtet den duplizierten Primitiv-Platzierungs-Code. KEIN
      Framework-Überbau (Heilige Lektion): ein Helfer wie der Roller/Mesher, von den
      bestehenden Buildern KOMPONIERT, nicht über sie gestülpt.
  (c) DIE SCALE+TINT-RESTE HEILEN: `_stationVariant` (Esse-Grammatik existiert schon,
      aber brennkolben/webstuhl/drehbank/altar tragen Box-Listen) + `_vehicleVariant`
      bekommen echte funktionale Grammatiken (das §10-V2 — die Teile parametrisch
      generieren, die FUNKTION lesbar halten).
  ```
- **WIRKUNG je Werk:** Tempel/Werkstatt/Portal nie wieder identisch · die scale+tint-
  Werke werden echte Grammatik · neue Arten emergieren aus Tiefe, nicht aus Rezepten.
- **DISZIPLIN:** der Drei-JA-Test vor dem Vokabular-Helfer (echte Naht? senkt Kopplung?
  zweifelsfrei der geniale Pfad?) · die FUNKTION bleibt lesbar (eine Esse liest als Esse,
  `_computeWorkshopDomain` erkennt sie) · ein neuer Shape koppelt an drei Stellen
  (`_makePartGeometry`-switch · `validateBlueprintParts` · die Form-Leser) · scatter tag-frozen.
- **BEWEIS-BAND:** `diag-genom` Spannweiten-Band (N Seeds → vast, nie identisch) +
  Determinismus-Band (UNSIGNED) + der Richter (jede Variante steht) + `diag-werk-render`
  (liest die Werkstatt als Werkstatt, der Tempel variiert sichtbar?).

### SYSTEM D — DER DETAIL-PASS (Subdivision/Displacement → Reichtum je Skala)

> Macht aus groben Käfigen reiche Oberflächen. Faltet sich in A (Substanz) + B (Haut).

- **DAS GESETZ:** Detail emergiert aus REKURSIVER Verfeinerung eines groben Käfigs —
  Subdivision (Catmull-Clark glättet) + Displacement (Noise/Tag-getrieben fügt Reichtum
  je Skala). LOD-fähig (mehr Subdivision nah, weniger fern). Referenz: Subdivision-
  Surfaces, die Marching-Cubes/Surface-Nets-Technik (schon im Mesher).
- **ABSORBIERT:** der Surface-Nets-Mesher (Terrain+Wasser+Haut — die EINE Quelle) · die
  Metaball-Haut (System B) · `noiserock` (verschobenes Polyeder aus härte+Noise, V18.227).
- **DER MECHANISMUS:** der grobe Käfig (Parts) → ein optionaler Glättungs-/Displacement-
  Pass (für organische Werke die Metaball-Haut, für harte Werke ein Noise-Displacement
  aus den Tags wie `noiserock`) → reiche Oberfläche, die der Substanz-Pass (A) dann
  einkleidet. Die low-poly-Facetten verschwinden.
- **WIRKUNG:** Kreatur-Haut glatt-organisch · Fels mit Mikrostruktur · jede flache
  Facette bekommt Korn. Hebt das „low-poly"-Gefühl des ganzen Katalogs.
- **DISZIPLIN:** Perf (LOD — nah dicht, fern grob; Subdivision ist teuer) · die EINE-
  Quelle-Disziplin (kein zweiter Mesher) · der Richter prüft den Käfig, nicht die Haut.
- **BEWEIS-BAND:** `diag-werk-render` (verschwinden die Facetten? am Auge) + Perf-Probe.

---

## §4 — DAS TOR: FIDELITÄT ALS AUSLESEWERT (die strukturelle Heilung)

> Die fehlerhafte Struktur: Fidelität ist heute KEIN Auslesewert von irgendetwas. Der
> Resonanz-Produkt-Vektor liest Material-Tags + grobe Form-Achsen — aber NICHTS, das
> misst „trägt dies das definierende Detail seiner Domäne?". Eine Eisen-BOX resoniert als
> „armor" genauso stark wie ein plateShell-Kürass. `roleManual`/`builtIn` lässt den
> Katalog sogar das grobe Tor umgehen. **Das verletzt das Projekt-Axiom** — Fidelität ist
> die EINE Eigenschaft, die hand-gesetzt statt gerechnet/getort ist.

- **DIE HEILUNG:** eine **STRUKTUR-REICHTUM-Achse** in den Produkt-Vektor
  (`_blueprintProductVector`) — sie liest, ob das Werk die definierenden Merkmale seiner
  Domäne trägt: hat die Rüstung eine konforme Schale (plateShell mit Wrap)? Hat das
  Werkzeug eine Klinge/Spitze? Hat die Kreatur ein verbundenes Skelett mit Glied-Paaren?
  Das Tor (`_computeFormRole` / die Resonanz-Signaturen) FORDERT diese Achse → ein Blob
  resoniert schwächer, die gesetz-erzeugte Form gewinnt. Die Rolle EMERGIERT aus der
  Form (kein Override nötig).
- **`roleManual` WIRD DIE GEPRÜFTE NOTLUKE, nicht die Krücke:** der Spieler darf weiter
  intentional deklarieren („diese Box IST meine Rüstung") — aber die built-in Bibliothek
  + die gesten-gespawnten Werke lehnen sich nicht mehr darauf, um die Form zu überspringen
  (sie sind dann gesetz-erzeugt + verdienen die Rolle). Fremde Artefakte: `roleManual`
  bleibt gestrippt (Anti-Spoofing, V18 — das hält).
- **DAS GESETZ IST AUCH DAS TOR (die Schöpfer-Wahrheit „sonst wären sie gar nicht
  durchgekommen"):** wenn die Form aus der Grammatik erzeugt UND vom Tor gefordert wird,
  KANN ein Blob nicht durchkommen — die Grammatik emittiert nur gesetz-konformes Detail,
  und die Resonanz weist den nackten Kasten ab. Erzeugung und Tor schließen sich.
- **DISZIPLIN:** die Achse muss KONSUM haben (ein echter Leser, kein Passagier — eine
  Stat/Rolle liest sie messbar) · die FROZEN-Signaturen neu kalibrieren + mit `diag-blass`
  messen (skalen-konsistent, [0..1]) · scatter-Tags bleiben bit-identisch.
- **BEWEIS-BAND:** ein A/B (`diag-physis-ab`-Muster): ein gesetz-erzeugtes Werk gewinnt
  seine Rolle, ein nackter Box-Blob derselben Tags fällt durch (resoniert unter dem Floor).

---

## §5 — DER WEG (nach Hebel-Breite × Projekt-Wahrheit)

```
GUSS 1  SYSTEM A — SUBSTANZ           ← der breiteste Hebel, hebt JEDES Werk auf einmal;
        (prozeduraler Material-Pass)    der „pros-sehen-es-kaum"-Sprung (flach→echt);
                                        ändert keine Form, sofort am Auge prüfbar.
        ▼ [S-GATE A: erzählt jedes Material seine Wahrheit? Bark-Kontrast? kein flach-einfarbig?]
GUSS 2  SYSTEM B — KÖRPER             ← das lebendige Herz; heilt die schlimmsten Blobs
        (Skelett+Haut+Bewegung+Rüstung)  (Kreatur/Avatar/Rüstung-getragen) als EIN System.
        ▼ [S-GATE B: liest die Kreatur als Tier? der Avatar als Wesen? bewegt sich's? sitzt die Rüstung?]
GUSS 3  §4 — DAS TOR                  ← die strukturelle Heilung; die Fidelität wird
        (Fidelität als Auslesewert)     erzwungen, kein Blob kommt mehr durch.
        ▼ [S-GATE Tor: gewinnt die gesetz-Form ihre Rolle, fällt der Box-Blob durch?]
GUSS 4  SYSTEM C — GRAMMATIK-TIEFE    ← tötet „immer ähnlich"; das Vokabular macht neue
        (rekursiv + das Vokabular)      Gesetze billig + heilt die scale+tint-Reste.
        ▼ [S-GATE C: variiert der Tempel sichtbar? sind Station/Fahrzeug echte Grammatik?]
GUSS 5  SYSTEM D — DETAIL-PASS        ← die low-poly-Facetten weg; faltet sich in A+B.
        ▼ [S-GATE D: verschwinden die Facetten? Perf hält?]
```

**Der wichtigste Hebel zuerst: SYSTEM A (Substanz).** Es hebt die ganze Welt auf einmal,
ist der am wenigsten gesehene Profi-Sprung, ändert keine Form (risikoarm), und ist sofort
am Katalog-Auge prüfbar. **Wenn nur EIN System gebaut wird, bau dieses.** Das lebendige
Herz (B) ist der unmittelbare zweite Guss.

---

## §6 — DIE DISZIPLIN (die Wände, die jede Welle binden)

```
1. AUGEN VOR BEHAUPTEN (Wand 1). Kein Werk „fertig" ohne Schöpfer-Browser-Bild an einer
   sauberen, settled, nahen Position. Headless beweist Mechanik/Physik, NIE den LOOK.
   Jeden Detail-Mesh im diag-werk-render-Katalog ANSEHEN, BEVOR „fertig". (Die Geburts-
   Lehre: T1–T6 wurde auf Blobs gebaut, weil nie gerendert wurde.)
2. EINE QUELLE, kein Parallelpfad (V9.82). Ein geteilter Pass/Helfer, durch den alle
   Werke fließen — kein zweiter Mesher, kein Material-Zwilling. Grep + Test verifiziert.
3. DETAIL = AUSLESEWERT, NIE HAND-MESH. Das Gesetz (Grammatik/Skelett/Pass) erzeugt das
   Detail. Hand-Arbeit ist nur die ~20 %-Politur, nie die Basis (das Projekt-Axiom).
4. SCHULTERN VON RIESEN — RECHERCHIERE ZUERST. Pro Domäne das Profi-Vorbild holen (CGA ·
   L-System · creature-skeleton · Subdivision · Substance/Triplanar · Skinning), DANN giessen.
5. DER RICHTER HÄLT (Ω-PHYSIS, `archiv/wahrerbauplan.md`). Jeder Käfig durch steht/knickt/
   Lastpfad/Balance. rooted/gewachsen → Knicken (Ω-Φ3-b), freistehend → Kippen (Ω-Φ2).
6. KEIN FRAMEWORK-ÜBERBAU (Heilige Lektion). Jeder Pass/Helfer ist ein dünner geteilter
   Stamm-Bewohner (wie Roller/Mesher), von den Buildern KOMPONIERT — der Drei-JA-Test
   (echte Naht? senkt Kopplung? zweifelsfrei genial?) vor jedem neuen Schnitt.
7. AFFINITÄT-WAND. scatter (Fels/Kristall/Glut/Kreatur) → Tags FROZEN (Form/Detail/
   Substanz tag-neutral, V17.17); gesten/library (Werkstatt/Gerät/Rüstung) → frei. Eine
   neue Form/ein neuer Shape MUSS tag-neutral bleiben ODER die FROZEN-Baseline wird neu
   vermessen (`diag-arch-tags`).
8. MECHANIK BRAUCHT EINE ZAHL, LOOK EIN BILD. Ein Pass ist erst verdrahtet, wenn ein
   echter Konsument ihn liest (CONSUM-Source-Probe, kein Passagier); der LOOK ist erst
   gut, wenn das Auge ihn am Katalog bestätigt.
9. VOLLE TIEFE IN EINEM GUSS pro System (kein „sag weiter"-Slicing, V17.30) — aber die
   GROSSEN Güsse (A/B) am Schöpfer-Auge bestätigt, bevor der nächste stapelt.
```

---

## §7 — DIE BEWEIS-BÄNDER

```
SUBSTANZ-BAND (A)   jedes Material erzählt seine Wahrheit (Krümmung/Gradient/Tag/Feld);
                    kein flach-einfarbig; CONSUM-Probe (der Pass liest die Quellen).
KÖRPER-BAND (B)     Skelett verbunden (keine schwebenden Glieder) · steht/knickt nicht ·
                    Allometrie stockig · Symmetrie-treu · Haut auf ALLEN Seelen · bewegt sich.
TOR-BAND (§4)       gesetz-Form gewinnt die Rolle, Box-Blob derselben Tags fällt durch.
VIELFALT-BAND (C)   N Seeds → vast, nie identisch (Tempel/Station variieren sichtbar);
                    Determinismus (UNSIGNED); die FUNKTION bleibt lesbar.
DETAIL-BAND (D)     die low-poly-Facetten verschwinden; Perf hält (LOD).
AFFINITÄT-BAND      scatter-Tags bit-identisch über alle Achsen/Pässe (V17.17 GEMESSEN).
AUGEN-BAND (Wand 1) der finale LOOK je Werk im Schöpfer-Browser — der letzte Richter.
```

Werkzeuge: `scripts/diag-werk-render.cjs` (der Werk-Katalog — das Auge) ·
`scripts/diag-genom.cjs` (Spannweite/Physik/Affinität/Determinismus) ·
`scripts/diag-blass.cjs` (Resonanz-Skala) · `scripts/diag-physis-ab.cjs` (das Tor) ·
`scripts/playtest.cjs` (die ~3500 Invarianten).

---

## §8 — DIE OFFENEN FÄDEN (herausgezogen aus wuchs/anblick — nichts verloren)

```
GEBAUT, REITET OBEN (Varianz auf der Grammatik — bleibt gültig):
  Genom T1–T6: sizeClass · Alter · Blatt-TYPEN (Palme/Schuppe, Atlas-Bake) · Brettwurzel ·
  Kronen-Formen (weeping/vase/schirm) · Lean/Phyllotaxis/Mehrstämmig · Bauwerk-Proportion ·
  Geologie-emissiv · Rüstung/Trank/Fahrzeug-SSF · Kreatur-Allometrie. Der Roller _rollGenome
  (UNSIGNED). Diese Varianz REITET auf den vier Systemen — Fidelität × Varianz, nicht statt.

SUBSTANZ-DETAIL (System A — die Pfeiler-Liste, archiv/wahreranblick.md Ω-O1..O16):
  Boden Multi-Klassen + Drainage-Feuchte + Nah-Detail · Gras als Klingen (Kegel→Halm) ·
  Kiesel/Felsen gated · Pfade (Drainage+Konnektivität) · Rinde-Maserung · Fels/Metall-Tag ·
  Blatt-Transluzenz (weiß-Ausbrennen-Fix) · Atmosphäre/Dunst · Geometrie-Feinheit O14–O16.

FORM-DETAIL (System B/C — die §4-Achsen + die Vertikal-Kette, archiv/wahrerwuchs.md):
  Kreatur form-folgt-dem-Feld (§10-V1: Region → Körper-Profil) · Bauwerk from-scratch
  (§10-V2 → System C) · Krone dichter/Gabelung sichtbar (Ω-O16) · Fahrzeug-Fahr-Tiefe.

SCHULD (niedrig-prioritär, getrackt):
  S0  der Baum-r01()-Noise auf roller.seq() (V9.82 EINE Quelle — re-rollt jede Welt, eigene Welle).
  S2  die 12 statischen baum_*_jung/_alt-DEF-Blöcke schneiden + 2 Test-Fixtures migrieren.
  Ω-B4-LOD  per-Variante-LOD-Swap für die scatter-Pools (fels/kristall/glut) — marginaler Perf.

DIE GEMERKTEN FÄDEN (roadmap §4 — dem Schöpfer ALLE wichtig, nie still streichen):
  Phase E (Bedrohung/Furcht) · R6 Selbst-Erweiterung · Mana-Symmetrie · Wasser-Nachfliessen ·
  das echte V18→V19-Zeit-Portal · VR · IndexedDB · Statusbar.
```

---

## §9 — DAS ARCHIV (was wanderte, warum)

```
archiv/wahrerwuchs.md   (FORM/Ω-GENESIS) — die Genom-Iteration T1–T6/F1–F6/S0–S7 ist
                        verarbeitet; die Varianz reitet jetzt oben (§8), das Genom-PRINZIP
                        lebt in System C. Die volle §4-Achsen-Tiefe bleibt durchsuchbar.
archiv/wahreranblick.md (ANBLICK/Ω-OPSIS) — die Substanz-Pfeiler Ω-O1..O16 + die fünf
                        Wände; sie sind die Detailliste von System A. Bleibt die tiefe Referenz.
archiv/wahrerbauplan.md (PHYSIK/Ω-PHYSIS) — schon archiviert; der Richter lebt im Code
                        (_stability/_failsUnderLoad/_swingDynamics/_loadPath). NORMATIV — §6#5.
```

Die drei Gesichter-Pläne re-diagnostizierten sich gegenseitig (fünf überlappende „was-ist-
flach"-Sektionen allein in wahrerwuchs) — das Symptom des fehlenden EINEN Gesetzes. Dieser
Plan ist die Konvergenz: aus dem Tagebuch ein Gesetz-Blatt.

---

## §10 — LETZTES WORT

Der Katalog sagte die Wahrheit: die Fidelität landet, WO das Gesetz scharf ist (Tempel,
Schwert, Wagen) — und das lebendige Herz (Avatar, Kreatur) ist ein Blob, alles flach,
selbst der beste Fall „immer ähnlich". Jede Iteration griff zu kurz, weil sie den Blob am
Objekt-Niveau bekämpfte — der Instinkt des Amateurs.

Der Weg, den Profis kaum sichtbar gehen, ist EIN Prinzip: **fasse das Objekt nicht an,
baue die geteilten Systeme.** Detail · Schönheit · Vielfalt · Leben werden Auslesewerte
von vier Pässen — Substanz, Körper, Grammatik-Tiefe, Detail — durch die JEDER Bauplan
fließt. Verbessere einen Pass, und die ganze Welt hebt sich. Das Genom (Varianz) reitet
oben, der Richter (Ω-PHYSIS) garantiert die Wahrheit, das Tor erzwingt die Fidelität, das
Auge richtet den LOOK.

Fast nichts muss erfunden werden — der Surface-Nets-Mesher, der triplanare Albedo, die
L-System-Bäume, die Metaball-Haut sind die Beweise, die nur GENERALISIERT werden müssen.
Bau die Substanz zuerst (der breiteste Hebel, das ganze Bild auf einmal). Dann den Körper
(das lebendige Herz). Dann das Tor, die Tiefe, den Detail-Pass.

Dann ist ein Bauplan kein Mesh mehr, sondern ein Gesetz — und das Werk ist atemberaubend,
variantenreich, professionell, weil jeder Pixel die Wahrheit erzählt, aus dem Samen in die
Höhe getrieben, auf den Schultern der Riesen.

---

## §11 — DER SELEKTIONS-RICHTER (der Körper behauptet sich) — die gefundene Wurzel

> **STAND (16.06.2026):** Schöpfer-Befund „in der Natur muss sich jeder Körper behaupten — hier
> nicht, der ineffiziente Klumpen kommt durch". Fünf Forschungs-Stränge (Wolffsches Gesetz ·
> Topologie-/Fully-Stressed-Optimierung · Cost-of-Transport · Karl-Sims-evolvierte-Morphologie ·
> die smin/Round-Cone-Praxis) KONVERGIEREN auf EINE Wurzel + EINE Heilung.

**DIE WURZEL (gemessen am Code + bestätigt):** der Physik-Richter ist ein **PASS/FAIL-TOR**
(steht? knickt? schwebt?), kein **SELEKTIONS-DRUCK**. Ein ineffizienter Klumpen besteht die
Hürden → „kommt durch". In der Natur formt SELEKTION (Fitness/Effizienz) den Körper; das Tor
WERTET nicht. Zwei Geometrie-Symptome dazu: (a) uniforme Kapsel-Glieder → Wurst-Beine; (b) ein
zu großes globales smin-`k` → die Glieder schmelzen in den Körper (der Schmelz-Blob).

**GEBAUT (V18.x, dieser Guss) — die zwei Geometrie-Fixes (formel-belegt):**
- **Wolffsches Gesetz / Round-Cone:** Glied-Radius getapert proximal-dick → distal-dünn
  (`r(x) ∝ M(x)^(1/3)`, fully-stressed; Masse proximal minimiert die Glied-Trägheit Σmᵢrᵢ²).
  `sdTaper` (interpolierter Radius) statt uniformer Kapsel → effiziente Beine, keine Würste.
- **Pro-Gelenk-`k`** (`k ≈ 0.32·min(ra,rb)`, kompakter Polynom-smin-Träger) statt globalem 0.045
  → scharfe Gelenke statt Schmelz-Blob; die im Rumpf SITZENDEN Wurzeln verbinden trotzdem.

**OFFEN — DER KERN-GUSS (die genialste Achse, der dritte Vers WERTEN):** der Richter wird vom
TOR zum **SELEKTOR**. Der Körper muss seine Form VERDIENEN — `_buildCreatureGroup` (oder ein
`_selectFittestBody`) würfelt **N Proportions-Kandidaten** (Archetyp ± Streuung) und nimmt den
**argmax einer biomechanischen FITNESS**, statt des ersten, der ein Tor passiert:
```
fitness = w1·stabilität(Schwerpunkt-Marge)         (Ω-Φ2, existiert)
        + w2·struktur-effizienz(Stärke/Gewicht)    (Z/A je Glied; fully-stressed η=σ/σ_allow→1)
        − w3·glied-trägheit(Σ mᵢ·rᵢ² um die Hüfte)  (proximale Masse, leichte Füße)
        − w4·cost-of-transport(P/(m·g·v)-Proxy)     (Fr=v²/gL; effiziente Fortbewegung)
        − w5·knick-risiko(Euler-Schlankheit KL/r)   (Ω-Φ3-b, existiert)
```
Das macht den Klumpen STRUKTURELL unmöglich (er scored niedrig, fällt durch) UND vereint
Form·Physik·Selektion zu EINER Quelle (Karl-Sims-Prinzip auf das Familie+WERTEN-Axiom). Profi-
Zahlen liegen bereit (Wolff `r∝M^⅓` · CoT∝M^−0.32 · McMahon `d∝L^1.5` · Sims-Fitness=Leistung
an simulierter Physik · smin-`k`≈0.1–0.3·r).

---

## §12 — DER HUMANOIDE AVATAR: SKELETT → HAUT → SKINNING → BEWEGUNG (GUSS 1/2/2b GEBAUT)

> **STAND (16.06.2026, Schöpfer-Auftrag „prozedural schärfen, auf Ready-Player-Me-Niveau,
> mit dem Wissen aller Profis").** Der Katalog-Befund „Avatar = zerfallener Strichmann"
> (§0) ist GEHEILT. Die Wurzel war NICHT der „Selektions-Richter" (§11, eine Quadruped-
> Idee) — sie war, dass der HUMANOIDE Avatar nie durch die Metaball-Pipeline lief: er
> kombinierte lose Primitive (Box-Torso + schwebende Zylinder-Arme). Profi-recherchiert
> (Loomis/Vitruv-Proportionen · Kontrapost · Three.js-SkinnedMesh · Walk-Cycle · Froude).

**GEBAUT — drei verifizierte Güsse (`diag-werk-render` humanoid/humanoidrig/playeravatar, eigene Augen):**

- **GUSS 1 — `_humanoidSkeleton(g)` (static):** ein biped Skelett-Gesetz aus echten 8-Kopf-
  Proportionen (Schritt = Körpermitte 4 KH · Nabel auf φ · Schulter 2 KH · V-Taper/Sanduhr
  über `sex` · gegliederte Glieder in A-Pose). Läuft durch die bewährte
  `_buildCreatureSkinGeometry` (SDF-Metaball + Surface-Nets + Taubin). Der Rumpf ist eine
  STATIONS-KETTE mit glatten Breite- UND Tiefe-Profilen → die Silhouette + Körper-Tiefe
  emergieren (kein Wespentaillen-Kink, kein Brett). Die Glieder ÜBERLAPPEN Schulter/Becken
  → die Haut verschmilzt sie. Der Strichmann verschwindet by construction.
- **GUSS 2 — `_buildHumanoidRig(g)` + `_animateHumanoidRig`:** ein echtes 17-Bone-
  `THREE.Skeleton` (anatomische Hierarchie) + die Haut wird ein `SkinnedMesh`; skinWeights
  fallen aus der BONE-SEGMENT-NÄHE (top-4-Blending → weiche Gelenke, kein Schulter-Riss).
  Posen über Bone-Rotation: Kontrapost-Ruhe (S-Kurve), 4-Posen-Walk-Cycle (Bein gegenphasig,
  Knie nur beugen, Arme gegen die Beine, CoM-Bob doppelte Frequenz), Schwimmen. Auf WebGPU
  mit NodeMaterial automatisch geskinnt (KEIN `SkeletonUtils.clone` — Crash #32236; KEIN
  `positionNode`-Override — umginge die Skinning-Injektion).
- **GUSS 2b — Integration:** der getragene Spieler-Avatar (`_buildHumanGroup`) IST jetzt das
  Rig (Fallback auf den alten Box-Avatar, wenn SkinnedMesh fehlt). Die load-bearing
  `userData.parts`-Schnittstelle gewahrt: → die WRIST-/HÜFT-Bones (equipHeld hängt das Gerät
  an die Hand), `userData.rig` für die Pose; `_animateHuman`/`_applySeatPose` branchen aufs Rig.

**PERMANENTE LEHREN dieser Güsse:**
1. **Verschmolzene Haut UND Bewegung = SkinnedMesh** — es gibt keinen Mittelweg. Separate
   animierbare Glied-Gruppen (alt) lesen als Strichmann an den Gelenken; eine verschmolzene
   Metaball-Haut ist starr. Nur Skinning (eine Haut, über Bones deformiert) hat beides.
2. **Eine Avatar-Refaktorierung bricht die Tests, die seine ALTEN Internas prüfen (V9.56-i)** —
   3 Invarianten fielen (Schwimm-`group.rotation.x` · Material-Farbe · Sitz-`parts.leftLeg`).
   Die Heilung BEWEGT das Verhalten an seinen neuen Ort / heilt die Wurzel, sie WEICHT den
   Test NICHT auf. (Schwimmen: der ganze Körper legt sich horizontal — auch korrekter als der
   Spine-Bend.)
3. **MISS, bevor du den Test änderst (V13.0)** — der Material-Fehlschlag SAH aus wie ein
   fehlendes `isMeshStandardMaterial`-Flag; eine Probe zeigte die WAHRE Wurzel: ich nahm
   `playerSoulDefs.human.color` (0xff0000, grell) statt des gedämpften 0xc0392b. Kein
   Test-Change nötig — ein Farb-Fix. Fast hätte ich den Test fälschlich aufgeweicht.

**GUSS 3 GEBAUT (Gesicht · glatte Haut · echte Hände/Füße · entspannte Arme) — selbstkritische
Augen-Auswertung (Schöpfer: „die Analyse oft noch nicht echt"):** jeder Winkel gerendert
(front/seite/hinten/3-4 + NORMALEN-Ansicht), die Fehler wie ein strenger Art-Director benannt,
DANN gelöst:
- **GESICHT** (war blankes Ei = Schaufensterpuppe): `_addHumanoidFace` — mandelige, kleine, auf
  Kopf-MITTE eingesenkte Augen + Catchlight + subtile Brauen + Nase, Kind des Kopf-Bones (folgt
  der Bewegung). Erst-Wurf hatte Doll-Augen (zu groß/hoch) → nachgeschärft bis ruhige Miene.
- **HAUT** (war fleckig): `opts.skin` dämpft Fell-Korn + SSS-Rim (0.36→0.12, sonst orangener
  Hotspot am Unterarm) → glatte Haut.
- **KOPF/HALS** (war Vorragen + Nacken-Kerbe): Cluster Schädel+Occiput+Kiefer, Hals vertikal.
- **HÄNDE** (war Flossen): Handteller+Daumen+Finger. **FÜSSE** (war Latschen): Ferse+Spann.
- **RUHE-ARME** (war A-Pose-Spreiz): adduziert (~8°), entspannter Hang.

**EHRLICH NOCH OFFEN (nicht „fertig" — der nächste Pass):**
- **Rück-Winkel-Augen-Bleed** im swiftshader-Diag (Tiefen-Quirk des Hide-Materials; NORMALEN-
  Ansicht beweist solide/geschlossene Geometrie) → echte-WebGPU-Browser-Abnahme.
- **Achsel-Skinning** kollabiert leicht beim Arm-Schwung (clavicle-Helper-Bone / Weights).
- **Waden spindeldürr**, Hände noch klobig (Fäustlinge), Rest-Rim in der Arm-Hüft-Falte.
- **Phoenix/Dragon** noch am alten Box-Pfad (`_buildPhoenixGroup`/`_buildDragonGroup`).
- **Kreatur-Politur:** lose Box-Füße verbinden, Beine, S-Curve.
- **Selektions-Richter (§11)** für die KREATUR-Vielfalt (Quadruped) — eigener Guss.

**PERMANENTE LEHRE (Schöpfer 16.06.): die Augen-Analyse muss ECHT sein.** Bilder erstellen
genügt nicht — jeden Winkel rendern (auch hinten + Normalen-Ansicht), die Fehler wie ein
strenger fremder Art-Director benennen (kein „Durchbruch!"), DANN lösen. Ein „sieht gut aus"
ohne Mehr-Winkel-Prüfung ist die Beschönigungs-Falle.

### §12-GUSS 6 (17.06.2026) — KÖRPER-POLITUR + GESICHTS-RELIEF (ehrlich bewertet, ~5→~6)

> **STAND:** Schöpfer-Korrektur mitten in der Welle — „du lobst wieder Dinge, die kaum eine
> 5/10 sind". RICHTIG. Ich war zurück in die Beschönigungs-Falle gerutscht („großer Sprung",
> „8.5"). Die ehrliche Bilanz unten ist neu kalibriert: der Avatar ist ein **~6** (anständiger
> stilisierter Charakter), NICHT 10 — der Metaball-Blob + aufgesetztes Gesicht hat eine **Decke**.

**GEBAUT + AM AUGE VERIFIZIERT (echte, aber inkrementelle Fixes — kein „Durchbruch"):**
- **Knie-Skinning (geteilt):** der eps im Gelenk-Blend (`wEps ∝ kh²`) verbreitert das Misch-
  band → das Schienbein REISST nicht mehr unter Animation (war der schlimmste „Strichmann-in-
  Bewegung"-Tell). Der klarste Fix der Welle.
- **Bein-Trennung:** Stand verbreitert (Spalt > smin-`k`) → die Beine verschmelzen nicht mehr
  zur Säule. **Auflösung** (`opts.res`=80, Avatar einmal gebaut, 538 ms gemessen) → glatter +
  löst den Spalt + die Finger auf. Scatter-Kreaturen bleiben bei 64 (Perf).
- **Hände** Klauen→Hand-Masse · **Füße** Ski→Ferse/Rist/Zehen · **Schultern** Regal→Trapezius-
  Schräge · **Profil** Brett→Gesäß+Brustkorb-Tiefe · **Proportion** dürr→voller.
- **Gebackene AO (System A, geteilt):** Konkavität pro Vertex → Vertex-Farbe, die das Hide-
  Material multipliziert (Gelenk-/Muskel-Relief, gerechnet aus der Form). Boden 0.6/Stärke 1.5
  (ein dunkles Material darf nicht in Schwarz erdrückt werden — Glutwesen-Befund).
- **Kreatur-Füße (geteilt):** der Huf war `feature:true` (nicht umhüllt) + das dünne Bein
  erodierte durch Glättung → **schwebende Box**. Huf umhüllt + Bein kräftiger → verbunden.
- **Gesicht:** Punkt-Augen→Mr.-Potato-Head (SCHLECHTER, aufgesetzte Raupen-Brauen+Kartoffel-
  Nase)→Nase/Brauen IM SCHÄDEL-FELD verschmolzen + gedeckelte Mandel-Augen + gewölbte Lippen.
  Liest jetzt als Gesicht, nicht als gruselige Schaufensterpuppe — aber nur ~6.

**ZWEI PERMANENTE LEHREN dieser Welle:**
1. **Aufgesetzte Detail-Meshes auf einem Metaball-Blob = Mr.-Potato-Head** (sie verschmelzen
   nicht). Der Profi-Weg: das Detail EMERGIERT aus dem Feld (Nase/Brauen als Schädel-Teile, die
   der smin einschmilzt) — exakt das §0-Axiom „Detail = Auslesewert, nie Hand-Mesh", auf das
   Gesicht angewandt. GEMESSEN am Kopf-Close-Up: aufgeklebt (Potato) → integriert (liest).
2. **Der Rückfall ins Selbstlob ist schleichend.** Headless-grün + ein Bild, das „besser" ist,
   verführt zu „großer Sprung". Die Wand: eine NÜCHTERNE Zahl vergeben (~6), die Decke benennen
   (Metaball + aufgesetztes Gesicht ≠ AAA), und den Schöpfer das letzte Wort haben lassen.

**EHRLICH NOCH OFFEN (die Decke + der nächste echte Hebel):**
- **Die Oberfläche ist matter Ton, nicht Haut/Stoff.** Der Avatar ist NACKT + merkmalslos —
  kein Profi zeigt das. Ein echter Sprung bräuchte KLEIDUNG/Material-Vielfalt (System A/C).
- **Das Gesicht ist ~6** (gedeckelte Augen + integrierte Nase + Lippen), aber die Augen sind
  dunkle Mandeln (kein Sklera/Iris-Leben), die Mittelgesichts-Ebene ist leer.
- **Die Metaball-Decke:** ein glatter Blob + Stuck-Features wird „anständig stilisiert" (~6–7),
  KEINE echte 10. Ein wahrer 10er bräuchte eine reichere Repräsentation (sculpted Mesh / echte
  Gesichts-Topologie / Kleidung) — eine Architektur-Entscheidung, kein Tweak.
- Phoenix/Dragon noch am alten Box-Pfad · Kreatur-Beine spindeldürr + Augen glubschig ·
  Selektions-Richter §11 (Quadruped-Vielfalt) · echte-WebGPU-Browser-Abnahme.

### §12-GUSS 7 (17.06.2026) — DIE UNSAUBERKEITEN HEILEN, NICHT VERSTECKEN (Profi-recherchiert)

> **STAND:** Schöpfer-Korrektur: „Kleider verstecken das, beheben aber nicht die Unsauberkeiten;
> für eine 10/10 — forsche, recherchier, setze um, Fischer." RICHTIG: Kleidung wäre ein Cover-up
> über einer wobbeligen, klumpigen Metaball-Oberfläche gewesen. Die Wurzel ist die Oberfläche selbst.

**RECHERCHE → UMSETZUNG (die bewährte Profi-Technik, KEIN Neu-Erfinden):** SDF-/implizite-Flächen
werden mit der **FELD-GRADIENTEN-NORMALE** geshadet (∇field via zentrale Differenzen), NICHT mit
der vom Dreiecks-Mesh gemittelten Normale. Vorbild: **Media Molecule „Dreams"** (reine SDF-Welt,
butterweich), **Clayxels**, **Inigo Quilez** (raymarched SDF). `computeVertexNormals()` mittelt die
Surface-Nets-WOBBEL → sie werden als Lumpen/Risse im Shading sichtbar = die „Unsauberkeiten". Die
Gradienten-Normale liest das GLATTE, symmetrische Feld → eine saubere, links/rechts-symmetrische
Oberfläche, UNABHÄNGIG von der Tesselierung. GEMESSEN am Auge (Avatar + Kreatur, geteilt): die
klumpige Ton-Haut → glatte Gestalt. Plus: AO-Boden 0.66/Stärke 1.3 + etwas Arm-LUFT zum Rumpf →
keine pechschwarzen Kontakt-Falten-Risse mehr.

**EHRLICHE BILANZ:** der Avatar ist jetzt ~6.5–7 (saubere, glatte stilisierte Gestalt). Die
Oberflächen-Unsauberkeit ist mit einer recherchierten Technik geheilt, nicht versteckt. Was zur
echten 10 bleibt (die Decke ehrlich): die NACKTHEIT/Material-Armut, das basale Gesicht (Mandel-
Augen ohne Sklera/Iris), die Silhouette-Schlankheit, und letztlich die Repräsentations-Decke.
Der nächste echte Hebel ist NICHT Kleidung-als-Versteck, sondern: das Gesicht aus dem Schädel-
FELD weiter schärfen (Augen-Höhlen als Feld-Senke, statt aufgesetzt) + die Silhouette füllen.
