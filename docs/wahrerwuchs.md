# DER WAHRE WUCHS — das Bauplan-Genom (Ω-GENESIS der Form)

> **STAND (16.06.2026 — der verfeinerte Plan des aktiven Bogens, Schöpfer „wirklich
> die volle palette möglich, sogar mamutbäume, ohne hundert rezepte ... hast du
> kritisch hinterfragt welche achsen formbar sein sollten ... wende es auf ALLE
> baupläne an").** Der dritte Stand des Ω-PHYSIS-Säule-III-Bogens (Bauplan-Grammatik):
> von „je ein generativer Bauplan (Tempel · Dorf · Schwert · Baum)" zu **EINEM
> Prinzip über die GANZE Palette** — jede Substanz der Welt wächst aus einem Seed
> durch wenige, kritisch gewählte, FORMBARE Achsen. Die volle Vielfalt der Natur
> (Moos → Mammutbaum, Kiesel → Felsturm, Kate → Tempel) emergiert, ohne hundert
> Rezepte. Auf den Schultern der Riesen (L-Systeme · LAAS · prozedurale Botanik ·
> die klassischen Ordnungen).

---

## §0 — DIE ENTDECKUNG (gemessen, nicht erhofft)

Das System hat die drei tragenden Dinge schon: den **Samen** (seed → deterministisch),
den **Richter** (Ω-PHYSIS — steht es? knickt es? schließt der Lastpfad?), die
**Referenz** (LAAS-Grammatik, klassische Ordnungen). Und es hat schon DREI generative
Baupläne als Beweis, dass es trägt: `_classicalTempleVariant` · `_villageHutVariant` ·
`_buildBladedWeapon` · `_growTreeBlueprintRich`.

**Was die Vielfalt EINSPERRT — drei gemessene Befunde:**

1. **Die Achsen-SPANNEN sind zu eng.** Bäume 3,5–14 m → kein Mammutbaum (Sequoia
   30–80 m), kein Palme-Wedel, kein Herbst-Rot. Der Tempel war hell-marmor-only
   (V18.250 geheilt: Stein-Palette + 4–10 Säulen). Die Häuser 0,92–1,34× (V18.250
   geweitet: 0,78–1,73×). Aber der GROSSTEIL der Achsen ist noch eng oder fehlt.

2. **Der LEGACY-Pfad lebt.** ~12 STATISCHE alte Kugel-Bäume sind als Baupläne
   registriert + scatter-gespawnt: `baum_eiche_jung` · `baum_eiche_breit` ·
   `baum_kiefer_schlank` · `baum_birke_jung/_alt` · `baum_buche_jung/_alt` ·
   `baum_erle_jung/_alt` · `baum_tanne_jung/_alt` · `stamm_gefallen` (hardcoded
   sphere/plane-Arrays). DAS sind die „bäume die noch von früher kommen, schlecht
   aussehen" — sie spawnen neben den Grammatik-Bäumen. Die Grammatik kann jung/alt/
   breit ÜBER ACHSEN (Alter · Kronen-Breite), die statischen Blobs sind redundant.

3. **~37 BAUWERKE sind STATISCHE Klone ohne Genom.** Fels (`stein_block` ·
   `felsbrocken` · `kiesel` · `felsbogen` · `felsturm`), Kristall (`kristall_geode`),
   Feuer (`glutbrunnen`), Büsche (`farn_busch` · `blume_gross` · `busch_hazel`),
   Bauten (`waterfall` · `damm` · `start_plattform`), Werkstätten (`esse` ·
   `brennkolben` · `webstuhl` · `seelenstein_altar` · `drehbank`), Portale
   (`welt_portal` · `welt_strom` · `welt_terrain`), Bibliothek (`geraet_spitzhacke` ·
   `ruestung_brustpanzer` · `trank_lebenssaft` · `avatar_waechter`), Fahrzeuge
   (`fahrzeug_wagen` · `reittier_holzross`). JEDER spawnt als EXAKTER Klon.

**Die Wurzel:** die Vielfalt ist nicht „fehlt", sie ist GEFLASCHT — der Samen + der
Richter sind da, aber die meisten Baupläne haben kein GENOM (keine formbaren Achsen),
und manche tragen noch das tote Holz des Legacy-Pfads.

---

## §1 — DIE VISION: DAS BAUPLAN-GENOM

> Wie in der echten Natur: ein Eichbaum und ein Mammutbaum teilen DASSELBE
> Genom-Schema (Stamm · Äste · Blätter · Wuchs-Achsen) — die Vielfalt liegt im
> WERT der wenigen Gene, nicht in zwei getrennten Rezepten. Eine Tomate und ein
> Redwood unterscheiden sich in ~Dutzend Achsen, nicht in 10.000 Zeilen.

**Das Prinzip:** jeder Bauplan-Typ ist eine reine Funktion

```
_<genre>Variant(seed) → ROLL die Achsen (das Genom) → BAUE die Parts
```

Die KUNST sind die wenigen, kritisch gewählten **formbaren Achsen** — aus denen, wie
in der Botanik, die ganze Palette emergiert. Die Arten/Stile (Eiche · Tanne · dorisch ·
Kate) werden zu **ANKERN (Presets)** in einem WEITEN, kontinuierlichen Achsen-Raum;
zwischen den Ankern + darüber hinaus wächst das Neue (der Mammutbaum ist „Baum-Genom
mit Größenklasse=Gigant + Nadel + Brettwurzel" — kein neues Rezept).

**Kein Rezept-Wildwuchs:** statt 100 hand-geschriebener Baupläne — ein Dutzend GENOME
(ein Schema je Genre) × den Seed = unendliche, kohärente Vielfalt.

---

## §2 — DAS GESETZ (die vier Wände, schon bewährt)

Jede Achse, jede Variante steht unter denselben vier Wänden (sie sind der Grund,
warum nichts „komisch" wird):

```
1. DETERMINISTISCH   seed → bit-identische Achsen über alle Peers
                     (FNV-Hash, UNSIGNED-Shifts — V18.250-Lehre: h>>n leakt das
                     Vorzeichen, h>>>n ist die Wand)
2. PHYSIK-GARANT     der Ω-PHYSIS-Richter prüft JEDE Rolle: steht sie (Ω-Φ2)?
                     knickt ein Glied (Ω-Φ3-b)? schließt der Lastpfad (Ω-Φ5)?
                     → der Ausreißer wird gefangen, die Referenz hält die Proportion
3. REFERENCE-FIRST   echte Botanik/Architektur als Anker (Sequoia-Allometrie,
                     Oakeshott, klassische Ordnungen) — keine erfundene Formel
4. AFFINITÄT-BEWUSST scatter-gespawnt (Bäume/Fels) → die Compound-TAGS bleiben
                     FROZEN (V17.16); gesten-gespawnt (Tempel/Dorf/Portal) → Material/
                     Farbe frei. Form/Größe sind IMMER frei (tag-neutral, V17.17)
```

**Die heilige Lektion:** das Genom ist KEIN neues Framework-Modul — es ist ein
geteilter HELFER + ein Daten-Schema je Genre im Stamm (hohe Kohäsion, niedrige
Kopplung). Kein „Variation-Engine"-Überbau.

---

## §3 — DIE SYNERGIE: DER GETEILTE GENOM-ROLLER

Heute wiederholt JEDER Generator dieselbe Hash-Bit-Arithmetik
(`let h = FNV(seed); const x = (h>>n)&mask`). Das ist Parallelcode (V9.82) + die
Quelle des V18.250-Vorzeichen-Bugs. **EINE Quelle:**

```
_rollGenome(seed, namespace) → ein deterministischer Achsen-Sampler:
   .axis(name)            → [0,1) deterministisch (eigener Stream je name, UNSIGNED)
   .pick(name, list)      → ein Element (kein Vorzeichen-Leak)
   .range(name, lo, hi)   → lo + axis·(hi−lo)
   .chance(name, p)       → bool
```

Jeder `_<genre>Variant(seed)` rollt seine Achsen über DIESEN Roller (deklarativ,
auditierbar, kein Vorzeichen-Bug möglich). Der Roller ist ~20 Zeilen, ersetzt die
Bit-Arithmetik in ALLEN Generatoren → der Achsen-Satz eines Genres wird LESBAR
(was ist formbar?) an EINER Stelle.

---

## §4 — DIE ACHSEN-LANDKARTE (kritisch gewählt, von der echten Vielfalt gelernt)

> Pro Genre: die wenigen Achsen, aus denen die volle Palette emergiert. „×" = der
> Multiplikator/Bereich; „neu" = heute fehlend.

### §4.1 — BÄUME (die Botanik-Achsen — der Kern der Schöpfer-Frage)

```
ACHSE              heute            soll (weit)                       emergiert
──────────────────────────────────────────────────────────────────────────────
Größenklasse  neu  fix 3.5-14 m     Strauch 1-4 · Baum 8-25 ·         Mammutbaum/Redwood
                                    GIGANT 30-80 m (skaliert ALLES)   ↔ Moos-Strauch
Stamm-Form         taper/flare      + Brettwurzeln (Giganten) ·       Würgfeige · Birken-
                                    Mehrstämmig · Neigung/Lean         klumpen · Mangrove
Krone              5 Formen+Hülle   + weeping · vase · Schirm          Trauerweide · Akazie
Verzweigung        density/angle/   + Phyllotaxis (whorl/spiral) ·    licht-/schatten-Baum
                   droop/levels     Asymmetrie (Licht-Konkurrenz)
Blatt-TYP     neu  EIN Atlas        Laub · Nadel · PALME/Wedel ·      Palme · Zypresse ·
                                    Schuppe · kahl (je eigener Bake)   Totholz · Farn-Baum
Blatt-Dichte/Farbe fix je Art       dünn↔dicht · grün/gelb/rot/       Herbstwald · karg
                                    herbst · per-Region-Tönung
Alter/Gesundheit  neu fix           jung(dünn,sparse)↔alt(dick,voll,  Jungwuchs ↔ Urwald-
                                    knorrig)↔tot(kahl) — EINE Achse    Riese (ersetzt die
                                                                       12 _jung/_alt-Blobs!)
```

**Der Schlüssel:** `Größenklasse` + `Alter` + `Blatt-Typ` sind die drei FEHLENDEN
Achsen. Mit ihnen wird `_growTreeBlueprintRich` zur EINEN Quelle für jung/alt/breit/
schlank/gigantisch — die 12 statischen Legacy-Blobs werden überflüssig (sie sind
genau „Alter/Breite-Achse, hart geklont"). Die Allometrie (Ω-B5) wird hier ECHT:
ein Gigant braucht überproportional dicke Glieder (Quadrat-Kubik) — der Richter
fängt den zu-dünnen Riesen (Ω-Φ3-b).

**Drei GEMESSENE Architektur-Schlösser, die den Mammutbaum heute sperren (alle lösbar):**

```
(1) height-Spanne fix 3.5-14 m  → die Grammatik-Range weiten ([30,80] für Sequoia) +
    ein `trunkScaler` (Stamm-Radius ×, heute max ~0.6 m, Gigant braucht 3-5 m).
(2) segmentLength HARTCODIERT 0.55 m  → eine formbare Achse `segLenRatio`: Giganten-
    Limbs brauchen 2-5 m-Segmente (sonst tausend Mikro-Zylinder). DAS ist der
    eigentliche Hebel (heute global 0.55, Z. 45227).
(3) MAX_BRANCH_PARTS = 40 (Z. 45301)  → ein DYNAMISCHER Cap pro Größenklasse (der
    Gigant baut EINE gemergte Tube, kein per-Part-Draw — der Cap ist eine Instancing-
    Wand, kein FPS-Gesetz; größenklassen-skaliert lösbar). + optional L4-Ebene.
Plus der Blatt-TYP: der Foliage-Atlas ist heute GETEILT (ein Bake für alle
leafCluster, einer für needleSpray) → ein Blatt-Typ-Achse braucht je einen Atlas-
Bake (Laub-Oval · Nadel-Strich · Palme-Wedel · Schuppe), gekeyt auf `foliage.kind`.
```

### §4.2 — FELS (Geologie-Achsen)

```
Größe ×0.4-4 · Form (Brocken · Bogen · Nadel/Spire · Stapel/Stack · Geröll-Streu) ·
Angularität (aus härte: scharf↔gerundet, schon im noiserock) · Schichtung (Sediment-
Strata, Welt-Y) · Verwitterung (Risse/Kanten) · Flechten/Moos-Deckung (feucht).
→ vom Kiesel zum Felsturm, EIN Genom. (noiserock ist die Saat, V18.227.)
```

### §4.3 — KRISTALL (Mineralogie-Achsen)

```
Größe · Habitus (Einzel-Spitze · Cluster · Geode · Säulen-Druse) · Facetten-Zahl ·
Farbe (aus dem Material-Tag) · Glut/Glanz (aus magieleitung). → von der Druse zum
Riesen-Quarz.
```

### §4.4 — FEUER / GLUT (`glutbrunnen`)

```
Becken-Größe · Flammen-Höhe · Öffnungs-Weite · Glut-Intensität (emissiv). Material
glut/stein bleibt (scatter-affinität FROZEN → nur Form/Größe/emissiv variieren).
```

### §4.5 — BAUWERKE (Architektur — schon weit, jetzt verallgemeinert)

```
TEMPEL  ✓ V18.250  Ordnung · 4-10 Säulen · Durchmesser 0.7-1.4 · Stein-Palette
HÜTTE   ✓ V18.248-250  Größe 0.78-1.73 · Geschoss · Fenster · Dach · 8 Töne · HOHL
DORF    ✓ V18.249  Platz · Wege · organische Streuung · 5-7 Häuser
+ Werkstätten (esse/brennkolben/webstuhl/drehbank/altar) · Bauten (waterfall/damm/
  start_plattform) · Portale (welt_portal/strom/terrain): je Größe · Proportion ·
  Detail-Dichte · Material-Palette. Das Tempel-Muster (Palette + Größe + Physik-Garant).
```

### §4.6 — GERÄT / RÜSTUNG / TRANK (schon teils, jetzt vollendet)

```
SCHWERT ✓  Oakeshott-Typ · Hohlkehle · Balance (Ω-Φ4)
+ Spitzhacke/Werkzeug (Keilwinkel · Stiel-Länge · Kopf-Masse — der Hebel Ω-Φ4) ·
  Rüstung (Platten-Größe · Artikulation · Material) · Trank (Phiole · Glasur-Farbe).
```

### §4.7 — FAHRZEUG / KREATUR (die schwereren Genome)

```
FAHRZEUG  Kabinen-Breite · Rad-Größe · Achs-Stand (SSF Ω-Φ2) · Material.
KREATUR   Skelett-Template (fix) + ALLOMETRISCHE Skalierung (Größe → Glied-Dicke
          ∝ Quadrat-Kubik) + Accessoires. Ω-B5: heute KEIN Skalierungs-Haken
          (GEMESSEN) → der Haken IST die Größenklasse-Achse (wie beim Baum).
```

---

## §5 — DIE LEGACY-BEREINIGUNG (das tote Holz)

Nach der Saat-Disziplin (CLAUDE.md): schneide NUR, was VERIFIZIERT durch etwas
Tieferes ersetzt wurde.

```
SCHNEIDEN (verifiziert ersetzt durch die Grammatik-Achsen):
  baum_eiche_jung/_breit · baum_kiefer_schlank · baum_birke_jung/_alt ·
  baum_buche_jung/_alt · baum_erle_jung/_alt · baum_tanne_jung/_alt
  → ersetzt durch `_growTreeBlueprintRich` + die Alter/Kronen-Breite-Achse (§4.1).
  Der Scatter-Pool spawnt dann die GRAMMATIK-Art mit gewürfeltem Alter, statt der
  statischen Blob-Variante. DISZIPLIN: erst die Alter-Achse bauen + GEMESSEN ein
  junger/alter Grammatik-Baum, DANN die Blobs schneiden (kein Loch).
PRÜFEN (vielleicht Saat, vielleicht tot):
  stamm_gefallen (Totholz/Liege-Stamm) — die Grammatik hat `baum_totholz`; wenn der
  liegende Stamm eine eigene Lesart ist, bleibt er, sonst Achse „gefallen" im totholz.
GEMESSEN (der Legacy-GROW-Pfad ist schon dormant): `_growTreeBlueprintLegacy` (8
  Kugeln) feuert NUR bei genVersion < 5; neue Welten sind gen 9 → der Grow-Pfad ist
  unerreichbar im normalen Spiel. Die SICHTBAREN „Bäume von früher" sind die
  STATISCHEN Bauplan-Varianten (`baum_*_jung/_alt/_breit`, hardcoded sphere-Arrays),
  NICHT der Grow-Pfad. Der Schnitt zielt auf die statischen Baupläne (+ ihren Eintrag
  im Scatter-Pool), nicht auf den (eh dormanten) Grow-Pfad — der bleibt als Alt-Welt-
  Kompat (gen<5) bis das echte V18→V19-Zeit-Portal ihn ablöst.
```

---

## §6 — DIE REIHENFOLGE (S-Punkte, je physik-garant + render + playtest)

```
S0  DER GENOM-ROLLER  `_rollGenome` + die 4 bestehenden Generatoren darauf
                      refaktorieren (kein Verhaltens-Sprung, nur EINE Quelle).
        ▼
S1  BÄUME — DIE DREI FEHLENDEN ACHSEN (der Kern):
      Größenklasse (Strauch/Baum/GIGANT) · Alter (jung/alt/knorrig) · Blatt-TYP
      (Laub/Nadel/Palme/kahl, je ein Atlas-Bake). + die Allometrie (Ω-B5) echt.
        ▼  [S-GATE: ein Mammutbaum (30-80 m) steht + knickt nicht; ein Strauch; ein
           junger + ein uralter derselben Art — GEMESSEN verschieden]
S2  LEGACY-SCHNITT — die 12 statischen Tree-Blobs raus (durch S1 ersetzt).
        ▼
S3  FELS-GENOM (Form/Größe/Schichtung/Verwitterung) — der größte sichtbare Fern-Hebel.
S4  KRISTALL · GLUT · BÜSCHE — Genome (Größe/Habitus/Farbe/Dichte).
S5  BAUWERKE verallgemeinert — Werkstätten · Bauten · Portale (Tempel-Muster:
      Palette + Größe + Detail, physik-garant).
S6  GERÄT/RÜSTUNG/TRANK · FAHRZEUG — Genome (der Hebel/SSF physik-wahr).
S7  KREATUR-ALLOMETRIE (Ω-B5) — die Größenklasse-Achse am Körper, falls der
      Schöpfer es will (heute bewusst fix, V18.209).
```

**Minimal-Wahrheit (der Kern):** S0 + S1 + S2 — der Genom-Roller, die drei fehlenden
Baum-Achsen, der Legacy-Schnitt. Das allein heilt „mamutbäume + bäume von früher".
S3–S7 ziehen die Tiefe über die GANZE Palette.

---

## §7 — DIE BEWEIS-BÄNDER (`diag-genom.cjs`)

```
SPANNWEITEN-BAND   pro Genre: N Seeds → die Achsen spannen den vollen Bereich
                   (Baum-Höhen 1-80 m gemessen, nicht 3.5-14; Fels Kiesel-bis-Turm).
PHYSIK-BAND        JEDE gewürfelte Variante steht + knickt nicht + Lastpfad schließt
                   (der Gigant-Baum, der intim-Tempel, der Riesen-Kristall) — der
                   Richter ist die Wand, kein Ausreißer.
AFFINITÄT-BAND     scatter-Genome: die Compound-Tags bleiben bit-identisch über ALLE
                   Achsen-Werte (Form/Größe/Farbe tag-neutral, V17.17 GEMESSEN).
LEGACY-BAND        kein statischer Tree-Blob mehr im Scatter-Pool; gen>=5 trifft den
                   Legacy-Pfad NIE.
DETERMINISMUS-BAND zwei Rolls desselben Seeds → bit-identisch (UNSIGNED-Shift-Wand).
AUGEN-BAND (Wand 1) der finale LOOK je Genre im Schöpfer-Browser (kein „fertig" ohne
                   Bild) — der Mammutbaum, der Palmen-Hain, der Basalt-Tempel.
```

---

## §8 — LETZTES WORT

Der Tempel, das Dorf, das Schwert, der Baum bewiesen je EINZELN, dass der Samen +
der Richter + die Referenz tragen. Dieser Plan macht aus den vier Einzel-Beweisen
EIN Gesetz über die ganze Welt: jede Substanz ein Genom, jede Vielfalt aus wenigen
formbaren Achsen, der Richter als die Wand, die Referenz als der Anker. Dann gibt es
keine „Bäume von früher" mehr und keine statischen Klone — nur den einen Wuchs, vom
Moos zum Mammutbaum, aus dem Samen in die Höhe getrieben, auf den Schultern der Riesen.
