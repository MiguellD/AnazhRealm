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

## §4¾ — DIE META-LEHRE, PRO GENRE GEFOLGERT (das Bau-Rezept je Bereich, reibungsfrei)

> Die Frage des Schöpfers: was BEDEUTET die Meta-Lehre für die spezifischen Baupläne,
> wie müssen sie GEBAUT werden, damit kaum Reibung bleibt? Hier die Folgerung — EIN
> Bau-Verfahren, auf jedes Genre konkret angewandt.

### Die Meta-Lehre in EINEM Satz

> **Jedes Genre hat ein reales GESETZ, das seine Form regiert. Die Tiefe kommt daher,
> DIESES Gesetzes wenige ACHSEN zu kodieren und das VERHALTEN aus dem Ω-PHYSIS-Richter
> FOLGEN zu lassen — nie aus Appearance-Tuning, nie aus gesetzten Verhaltens-Werten.**
> Die Referenz sagt WELCHE Achsen + ihre SPANNEN; der Richter GARANTIERT das Ergebnis.
> Darum „kaum Reibung": ich leite nichts neu her und tune nichts blind — ich (1) nenne
> das Gesetz/die Referenz, (2) kodiere seine Achsen via Genom, (3) lasse den Richter
> urteilen. Immer derselbe Drei-Schritt.

### Die FOLGERUNG #1 — die Genres KOLLABIEREN (kein „hundert Rezepte")

Die ~37 statischen Baupläne werden NICHT 37 Generatoren — sie fallen in **~7 Genome**
zusammen, weil dasselbe Gesetz viele „Arten" trägt:

```
EIN BAUM-GENOM trägt:  Baum · Strauch · Farn · Blume · GIGANT · jung/alt/breit/schlank ·
                       Totholz  (= sizeClass + Alter + Blatt-Typ + Krone — eine Familie)
EIN FELS-GENOM trägt:  Kiesel · Brocken · Block · Bogen · Nadel · Stapel · Geröll
EIN KRISTALL-GENOM:    Druse · Cluster · Geode · Säulen-Quarz · Riesen-Kristall
EIN BAU-GENOM trägt:   Tempel · Hütte · Werkstatt · Bauwerk · Portal  (Größe+Palette+Stil)
EIN GERÄT-GENOM trägt: Schwert · Hammer · Axt · Spitzhacke  (Hebel/Keil/Klinge)
EIN KÖRPER-GENOM:      jede Kreatur/Avatar  (Template + Allometrie)
EIN FAHRZEUG-GENOM:    Wagen · Karre · Kutsche  (SSF)
```

DAS ist „die volle Palette ohne hundert Rezepte": ein Dutzend Genome × den Seed.

### Die FOLGERUNG #2 — das Bau-Rezept je Genre (das Gesetz · die Achsen · das Verhalten folgt · die Reibung vorweg)

```
FELS  ─ GESETZ: Geologie (Bruch + Verwitterung; Sediment-Bänderung; härte→Angularität)
        ACHSEN: Form-Klasse (Brocken/Bogen/Nadel/Stapel) · Größe · Schichtung (Y-Bänder)
                · Verwitterung (gerundet↔scharf, aus härte) · Flechten (feucht)
        GEBAUT: die `noiserock`-Saat (V18.227) + Form-Klasse-Selektor; die Y-Schichtung
                aus `_terrainGeologyAlbedo` WIEDERVERWENDEN (kein neuer Pfad).
        FOLGT:  steht (Ω-Φ2) — ein Bogen/Stapel muss den Lastpfad schließen (Ω-Φ5).
        REIBUNG: SCATTER → Tags FROZEN; nur Form/Größe/Noise variieren, KEIN Material.
                noiserock ist in FORM_TAG_ACTIVATION (=box) → tag-sicher.

KRISTALL ─ GESETZ: Kristallographie (HABITUS — die charakteristische Wuchsform; Facetten
                aus dem Kristall-System, z.B. Quarz 6-seitig + Pyramiden-Spitze)
        ACHSEN: Habitus (Einzel/Cluster/Geode/Säulen-Druse) · Facetten-Zahl · Größe ·
                Termination (Pyramiden-Kappe) · Glanz/Glut (aus magieleitung→emissiv)
        GEBAUT: parametrische Prismen+Pyramiden-Montage (cone/pyramid/octahedron da);
                Habitus ordnet N Prismen (Cluster/Druse/Geode-Schale).
        FOLGT:  emissiv aus dem Material-Tag (Stefan-Boltzmann, schon im PBR-Profil).
        REIBUNG: SCATTER → quarz-Material fix; nur Form/Größe/Facetten variieren.

GLUT  ─ GESETZ: Thermodynamik (Gefäß + Flamme; Glut = emissiv ∝ Intensität)
        ACHSEN: Becken-Größe · Flammen-Höhe · Öffnung · Intensität (→ emissiv)
        GEBAUT: Becken (cylinder) + Flamme (cone, emissiv) × Intensität.
        FOLGT:  emissiv aus responseProfile.emissiv (schon da); kein gesetzter Glow.
        REIBUNG: SCATTER → glut/stein fix; nur Größe/Höhe/Intensität.

BÜSCHE/FARN/BLUME ─ GESETZ: dieselbe Botanik wie Bäume, Lebensform=Strauch.
        → KEIN eigenes Genre: das BAUM-GENOM mit sizeClass=Strauch + Blatt-Typ
          (Farn=Wedel, Blume=blüten-Karte). Die größte Synergie: ein Genom, Moos→Mammut.

WERKSTATT/PORTAL/BAUWERK ─ GESETZ: Funktion bestimmt Form (Esse=Ofen+Esse+Amboss;
                Webstuhl=Rahmen+Kette; Portal=Ring/Tor) + Architektur-Solidität.
        ACHSEN: Größe · Proportion · Material-Palette · Detail-Dichte (das Tempel-Muster).
        GEBAUT: die bestehende Parts-Liste PARAMETRISIEREN (Größe/Palette via Genom),
                NICHT neu erfinden — das `_classicalTempleVariant`-Muster.
        FOLGT:  steht + Lastpfad (Ω-Φ2/Φ5).
        REIBUNG: GESTEN-gespawnt → Material/Palette FREI; aber die FUNKTION muss lesbar
                bleiben (eine Esse liest als Esse) → das Genom variiert Größe/Detail, NIE
                die funktionale Essenz. Im Form-Satz bleiben (keine neue spawnbare Form).

GERÄT/RÜSTUNG/TRANK ─ GESETZ: die einfache Maschine (Hebel τ=Kopf·Stiel; Keil-Winkel;
                Klinge=Flächenträgheit/Hohlkehle Ω-Φ3) — die FUNKTION ist Physik.
        ACHSEN: Kopf-Masse · Stiel-Länge · Keil-Winkel · Klingen-Profil/Hohlkehle ·
                Material (eisen/holz) · (Rüstung: Platten-Deckung; Trank: Phiole/Farbe)
        GEBAUT: parametrische Montage Kopf+Stiel/Knauf+Griff+Parier+Klinge (das
                `_buildBladedWeapon`-Muster, Oakeshott).
        FOLGT:  Balance/Schlagpunkt/Hebel GERECHNET (Ω-Φ4), NIE gesetzt — wie das Schwert.
        REIBUNG: eine neue spitze/Klingen-Form MUSS in SPATIAL_POINTED_SHAPES (V18.242),
                sonst kippt die emergente Rolle (Klinge→Brecher).

FAHRZEUG ─ GESETZ: Fahrdynamik (SSF = Spur/(2·Schwerpunkt-Höhe) — die echte Kipp-Schwelle)
        ACHSEN: Kabinen-Breite · Rad-Größe · Radstand · Spur · Material
        GEBAUT: parametrische Räder+Achsen+Kabine.
        FOLGT:  Stabilität = SSF (Ω-Φ2), GERECHNET — ein kopflastiger Wagen liest instabil.
        REIBUNG: `rollable` liest die HORIZONTALE Zylinder-Achse (Rad), nicht Rundheit
                (ein vertikaler Stamm rollt nicht, V18.239).

KREATUR/AVATAR ─ GESETZ: Biomechanik (Quadrat-Kubik — der Riese braucht überproportional
                dicke Glieder; DASSELBE Gesetz wie der Gigant-Baum)
        ACHSEN: Skelett-Template (Anker, fix) + sizeClass + ALLOMETRISCHE Glied-Dicke
        GEBAUT: das Template (CREATURE_SOULS) skaliert allometrisch (Glied-Dicke ∝ √Masse).
        FOLGT:  steht (Ω-Φ2) + Glieder tragen (Ω-Φ3-b) — der Richter fängt den zu-dünnen
                Riesen, EXAKT wie beim Baum (Ω-B5 = die sizeClass-Achse am Körper).
        REIBUNG: Symmetrie/Template ist gesperrt (V18.209) → NUR allometrisch skalieren,
                das Template nicht verbiegen.
```

### Die FOLGERUNG #3 — warum das die Reibung TÖTET

```
- EIN Verfahren (Gesetz → Achsen → Richter) → ich rate nie, tune nie blind, leite nie neu her.
- EIN Roller (_rollGenome, UNSIGNED) → der Vorzeichen-Bug ist strukturell unmöglich.
- DER RICHTER garantiert (steht/knickt/Lastpfad) → kein „sieht stabil aus aber kippt".
- DIE REFERENZ kalibriert die Spannen (Sequoia 30-80 m, SSF≥1.2, Oakeshott) → kein Ausreißer.
- DIE KOLLAPS (37→7 Genome) → ich baue 7 Dinge, nicht 37 → die Vielfalt ist Seed, nicht Arbeit.
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

> **⚠ S0–S7 sind ✅ GEBAUT, ABER nur die HEADLINE-Achse je Genre (das GERÜST, V18.255).
> Die VOLLE Tiefe der §4-Achsen-Landkarte fehlt weitgehend — siehe `§9` (der ehrliche Stand
> + die Voll-Tiefe-Punktliste T1–T6). „✅ GEBAUT" unten = der Kern steht + ist verifiziert,
> NICHT „in voller Tiefe".**

```
S0  DER GENOM-ROLLER  ✅ GEBAUT — `_rollGenome(seed, namespace)` (UNSIGNED, eigener
        Stream je Achse: axis/range/int/pick/chance/seq). Temple + Hut refaktoriert
        darauf (das inlined Bit-Slicing + der Vorzeichen-Bug strukturell weg).
        ▼
S1  BÄUME — DIE DREI FEHLENDEN ACHSEN  ✅ GEBAUT (der Kern):
      sizeClass (Strauch 1.5-4 · Baum · Gross · GIGANT 30-80 m, nur baum_*; Büsche
        bleiben klein) · age (jung dünn/sparse ↔ alt dick/knorrig/voll) · foliageVar
        (Sommer ↔ Herbst, tag-neutral). + Allometrie ECHT (trunkBaseR ∝ sizeFactor^1.15,
        segLenBase + radius-floor ∝ Segment-Länge = der Euler-Knick-Constraint strukturell).
        GEMESSEN diag-genom: Höhen 1.6-77 m über 4 Klassen, JEDER Gigant knickt nicht,
        deterministisch, Tags frozen (Gigant == Normal), nur holz+laub.
        ▼
S2  LEGACY-SCHNITT  ✅ GEBAUT — der `switch(bestName){…_jung/_alt/_breit…}`-Scatter-
        Pool ist raus (→ `spawnName = bestName`); kein statischer Blob spawnt mehr in
        der gewachsenen Welt. (Die 12 statischen DEFINITIONEN bleiben als Tag/Affinität-
        Test-Fixtures registriert — sie spawnen nie; ihre Entfernung ist all-or-nothing
        gekoppelt an eslint-unused + 2 Test-Migrationen → getrackter Sediment-Cleanup.)
        ▼
S3  FELS-GENOM  ✅ GEBAUT (V18.252) — `_rockVariant(seed)` über den Roller: Form-Klasse
      (Brocken/Stapel/Nadel/Geröll) · Größe · Verwitterung (noiseStrength) · Detail, NUR
      noiserock+stein (tag-frozen = stein_block, V17.17). Ein Pool `fels_var0..11` (Built-
      ins, `_defaultBlueprints`), den der Scatter NACH dem stein_block-Affinitäts-Sieg
      region-deterministisch wählt. PHYSIK-GARANT (Fels ist FREISTEHEND, anders als der Baum):
      jeder steht (Ω-Φ2) · Lastpfad intakt (Ω-Φ5, der Stapel achsen-parallel) · die Nadel
      knickt nicht (Ω-Φ3-b) — GEMESSEN diag-genom (FELS-Bänder grün).
S4  KRISTALL · GLUT · BÜSCHE  ✅ GEBAUT (V18.253) — `_crystalVariant` (Habitus: Einzel/
      Cluster/Geode/Druse · Größe · Facetten, quarz, tag-frozen zu kristall_geode) +
      `_glutVariant` (Becken/Flamme/Intensität, stein+glut, tag-frozen zu glutbrunnen);
      Pools `kristall_var0..7` + `glut_var0..5`, der Scatter wählt sie über die
      generalisierte `SCATTER_VARIANT_POOL`-Karte (EINE Landmark-Pick-Mechanik). PHYSIK-
      garant (steht/intakt/knickt-nicht — breite quarz-Matrix, gedrungenes Becken),
      GEMESSEN diag-genom (KRISTALL+GLUT-Bänder grün). Büsche erben S1 (sizeClass-gated
      auf normal, age variiert). → die GANZE SCATTER-Welt ist jetzt Genom-gewachsen.
S5  BAUWERKE  ✅ GEBAUT (V18.254) — Tempel/Dorf/Hütte sind schon generativ; die
      FUNKTIONALEN Bauten (Werkstätten · Portale) PARAMETRISIERT über `_stationVariant(parts,
      seed)` (uniform-Skala + Palette-Tönung, BASIS-verankert = kein Schweben). Die FUNKTION
      bleibt lesbar (eine Esse liest als Esse; role bleibt). PHYSIK: uniform-Skala ist margin-
      invariant (steht weiter), Tags neutral — GEMESSEN diag-genom (BAUWERK-Bänder grün).
S6  GERÄT  ✅ GEBAUT (V18.254) — das SCHWERT aus dem Genom (`_bladedWeaponVariant`: ein
      OAKESHOTT-Typ aus dem Roller, die Balance Ω-Φ4 GERECHNET) + die SPITZHACKE
      (`_toolVariant`: Stiel-Länge · Kopf-Masse · Keil-Winkel = der Hebel Ω-Φ4; IMMER spitz
      → liest als Gerät, U4) + Rüstung/Trank via `_stationVariant`. GEMESSEN diag-genom
      (GERÄT-Bänder grün: Oakeshott-Varianten, Balance gerechnet, Hebel-Varianten, liest als
      Gerät). [Das FAHRZEUG bleibt der eigene gemerkte Faden „Fahrzeug-Fahr-Tiefe" — sein
      sitz-Punkt/moveable/mount ist sensibel, die Skala verschöbe die feste Sitz-Höhe.]
S7  KREATUR-ALLOMETRIE (Ω-B5)  ✅ GEBAUT (V18.255) — `_creatureBodySize(netId)` würfelt eine
      per-Kreatur-Körpergröße in BÄNDERN (klein 0.6 · normal · gross · GIGANT 2.7, der Koloss
      selten), deterministisch aus der netId (→ über Peers + Re-Wachstum konsistent, ohne
      Sync-Feld) bzw. aus dem Snapshot (Restore). Das locked Template (V18.209) wird NUR
      UNIFORM skaliert (group.scale + Hitbox), nicht verbogen — die Symmetrie bleibt, und
      jede Physik ist margin-/schlankheits-INVARIANT unter uniform-Skala (ein Koloss steht
      wie das Zwerg-Template, Ω-Φ2 GEMESSEN). STAT-gekoppelt (die per-Kreatur-Größe speist
      DIESELBE V18.208-Symmetrie → ein Koloss ist robust + träge). GEMESSEN diag-genom
      (KREATUR-Bänder grün). → DER GANZE BOGEN S0–S7 ist RUND.
```

**Minimal-Wahrheit (der Kern): S0 + S1 + S2 GEBAUT + GEMESSEN (`scripts/diag-genom.cjs`).**
Das allein heilt „mamutbäume + bäume von früher". S3–S7 ziehen die Tiefe über die GANZE
Palette (der AUGEN-Sign-off des LOOKs bleibt dem Schöpfer-Browser — Wand 1).

**ZWEI GEMESSENE PHYSIK-LEHREN (S1, „miss zuerst"):** der Richter für einen BAUM ist
NICHT derselbe wie für einen freistehenden Bau. (1) Ω-Φ2 KIPP-Stabilität (Schwerpunkt
über dem Stützpolygon) gilt NICHT — ein verwurzelter Baum mit asymmetrischer Krone kippt
nicht (die Wurzeln tragen das Moment); der echte Constraint ist Ω-Φ3-b KNICKEN (Greenhill/
Euler: ein zu dünner Riese knickt). (2) Ω-Φ5 LASTPFAD (AABB-Berührungs-BFS) gilt NICHT —
`_partWorldExtents` UNTER-deckt ROTIERTE dünne Zylinder (GEMESSEN: zwei Ast-Segmente, ein
segLen auseinander, teilen einen Punkt außerhalb beider AABBs → Phantom-Lücke); der Baum
IST per Konstruktion verbunden, der AABB-BFS ist für AXIS-ALIGNED Montage-Bauten. Der
Knick-Richter ist UNBERÜHRT (er prüft nur nahe-vertikale Glieder, wo der Proxy korrekt
ist). Die holz-Knick-Schwelle ist crit ≈ 10.1 (härte 0.2) — die Allometrie hält jede
Spitze size-invariant unter ~8.2. Diese Lehre gilt FÜR JEDES gewachsene Genre (S4-Büsche,
S7-Kreatur): rooted/gewachsen → Knicken, NICHT Kippen/Lastpfad-AABB.

---

## §6½ — DIE GELERNTEN DISZIPLINEN (damit der Plan in EINEM Schub durchgeht)

> Die Iterationen dieser Session (LAAS-Rückgriff · Karten-Chaos · Blatt-Proportion ·
> begehbare Häuser · Dorf-Struktur · das Vorzeichen-Bug) sind hier als VORWEG-GENOMMENE
> Disziplinen verbaut — jeder S-Punkt kennt seine Falle, BEVOR er sie tritt. Kein
> Re-Iterieren derselben Lehre. Vor jedem S-Punkt: lies die passende Unter-Sektion.

### §6½.0 — Die QUER-Disziplinen (für JEDES Genom)

```
1. LERNE VON DER QUELLE, nicht von der Heuristik. Bei „X sieht fake aus" die ECHTE
   Referenz holen (LAAS-Repo · Botanik · Oakeshott · die Ordnungen) + die METHODE
   anwenden, NICHT den eigenen Regler tunen. Das war der 90%-Sprung (Atlas-baked-from-
   geometry vs flache Karte). Disziplin VOR jedem Genre-Bau, nicht danach.
2. UNSIGNED-Shift. Jeder Achsen-Roll `h >>> n` (NIE `h >> n` — signed leakt das
   Vorzeichen → negativer Index → undefined; der V18.250-Paletten-Bug, der den Welt-
   Tempel still auf Default zwang). Der `_rollGenome` kapselt das EINMAL → strukturell weg.
3. DER RICHTER IST DIE WAND. Jede gewürfelte Variante durch Ω-PHYSIS (steht/knickt/
   Lastpfad) — der Gigant, der intim-Bau, der Riesen-Kristall. Die Referenz (Allometrie/
   Ordnung) hält die Proportion, der Richter fängt den Ausreißer. Der Test bestätigt, der
   Richter garantiert.
4. AFFINITÄT: Form/Größe/Farbe sind tag-neutral — ABER eine FORM-Affordanz kann
   emergieren. Keine neue Form/Material → Tags frozen (scatter-safe, V17.17). Eine Größen-
   Weitung kann aber eine FORM-getriebene Affordanz wecken (balancing aus flachen Flächen,
   V18.247) → „kein-Affordanz"-Test-Kontrollen IMMER auf einen garantiert-leeren Compound
   (`stein_block`), nie auf eine Struktur, deren Größe driftet.
5. SERIELL MESSEN. Render-Diags + Playtests NIE gleichzeitig (CPU-Contention → die Welt
   blutet in den isolierten Render + Screenshot-Timeout). Nicht zu viele schwere Objekte
   auf EINEN Render-Lauf (OOM 137 gemessen) — ein Genre, ein Lauf, wenige Werke.
6. KOMPENSATIONS-WURZEL. Ein Quality-Befund hat oft eine Über-Korrektur-Wurzel (Karten
   16→3 → Karten ×4.2 vergrößert → Mega-Blätter). Senkst du eine Achse, prüfe, ob du eine
   andere über-korrigierst — fixe BEIDE zusammen, nicht einen Regler.
7. „KEINE STRUKTUR" = oft „die Struktur ist nicht SICHTBAR". Die generative Grammatik
   existiert; das LAYOUT/die Anordnung muss sie ZEIGEN (Dorf: Platz+Wege+Orientierung).
8. AUGEN VOR BEHAUPTEN (Wand 1). Kein Genre „fertig" ohne Schöpfer-Browser-Bild an einer
   sauberen, settled, nahen Position. Headless beweist Mechanik/Physik, nicht den LOOK.
```

### §6½.1 — BÄUME (die LAAS-Lehren, vorweg verbaut — gilt S1/S2)

```
- Blatt = GEBACKENES Cluster-Atlas (echte Blatt-Silhouetten, Alpha-Maske), NIE flache
  Farb-Karte/runde Maske. §3.7-konform (Auslesewert der Grammatik, kein Bitmap-Download).
- Karten-ZAHL ↔ Atlas-DICHTE gekoppelt: jede Karte IST ein ~30-Blatt-Büschel → WENIGE
  Karten/Anker (LAAS 1-2, wir ~5), NIE 16 (= Brei). Die Dichte steckt im Atlas, nicht in
  der Karten-Zahl. (Beim Blatt-TYP-Bake dieselbe Kopplung halten.)
- PROPORTION: die Karten-GRÖSSE = die scheinbare Blatt-Größe (Blatt:Krone realistisch);
  NIE die Karte vergrößern, um wenige Karten zu kompensieren (Mega-Blatt-Falle, V18.249).
- RADIAL, nicht Fächer: das Atlas-Büschel strahlt golden-angle vom Zentrum nach AUSSEN
  (liest aus jedem Karten-Winkel) — kein Aufwärts-Fächer (zeigt bei Zufalls-Drehung falsch).
- Krone: Kronen-Hülle (volle gerundete Form) + niedriger innerFill (Ast-Gerüst sichtbar) +
  gedappelte Tiefe (per-Karte Höhe-Helligkeit). Schon gebaut → gilt für JEDE Größenklasse.
- GIGANT: die DREI Schlösser ZUSAMMEN lösen (height-Range + `segLenRatio`-Achse +
  dynamischer MAX_BRANCH_PARTS pro Größenklasse) + Allometrie (überproportional dicke
  Glieder, Quadrat-Kubik) — sonst knickt der Riese (der Richter fängt ihn, Ω-Φ3-b). Erst
  die Achse + GEMESSEN ein STEHENDER Gigant, DANN selten/regional spawnen.
- Blatt-TYP: je ein Atlas-Bake (Laub-Oval · Nadel-Strich · Palme-Wedel · Schuppe), gekeyt
  auf `foliage.kind` (der Atlas ist heute GETEILT — ein neuer Typ = ein neuer Bake).
- Legacy-Schnitt erst NACH der Alter-Achse (V17.20: erst ersetzt, dann schneiden — kein Loch).
```

### §6½.2 — ARCHITEKTUR (begehbar + Struktur, vorweg verbaut — gilt S5)

```
- BEGEHBAR = per-Part-Kollision (GEMESSEN): ein hohles Haus (4 Wände + Tür-Lücke) ist
  begehbar BY CONSTRUCTION — die Kollision baut EINEN Box-Shape pro gerendertem Part, die
  Tür-Lücke hat KEIN Part. Die Kollisions-Wahrheit (per-Part vs Voll-AABB) VOR dem Bau
  bestätigen. Ein echter Eingang ist eine ÖFFNUNG (Lücke), kein gemaltes/recessed Panel.
- DACH sauber: Walm (Pyramide) braucht Basis √2·(Spannweite+Überstand) + 45°-Drehung (die
  FLÄCHEN, nicht die Diamant-Ecken, decken die Wände); ein Giebel ohne `gableTriangle` lässt
  einen offenen Giebel-Spalt → Walm ODER den Giebel mit einem Tympanon schließen.
- LAYOUT = STRUKTUR: ein Cluster (Dorf/Lager/Ruine) braucht sichtbare Struktur (Platz +
  Wege + organisch seed-gestreute, KOLLISIONSFREIE, zur-Mitte-gewandte Positionen) — nicht
  „im Kreis". Größere Bauten → größerer Radius (kein Überlappen, V18.250 gemessen).
- Affinität: das Dorf/der Tempel ist gesten-gespawnt → Material/Farb-Palette FREI; aber im
  Form-Satz bleiben (box/pyramid/cylinder + die Custom-Meshes) → keine neue spawnbare Form.
```

### §6½.3 — DIE ÜBRIGEN GENRES (das bewährte Muster anwenden — S3/S4/S6)

```
Fels · Kristall · Glut · Büsche · Werkstatt · Portal · Gerät · Fahrzeug: KEIN neues
Render-Verfahren erfinden — das Tempel/Haus-Muster anwenden (das Genom rollt Form/Größe/
Material-Farbe/Detail-Dichte, der Builder baut, der Richter prüft, die Affinität-Wand hält).
Fels nutzt die `noiserock`-Saat (V18.227); Kristall/Glut die emissiv-Achse; Werkstatt/Portal
das Größe+Palette-Muster. Jedes Genre erbt §6½.0 + die geteilte `_rollGenome`-Quelle.
```

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

---

## §9 — DER EHRLICHE STAND (Selbst-Audit 16.06.2026, V18.255) — KERN ✅ vs. VOLLE TIEFE ⚠

> ## ✅ DER VOLLENDUNGS-AUFTRAG IST ABGEARBEITET (16.06.2026 — T1–T6 in EINEM Schub)
>
> **Die VOLLE-TIEFE-Schicht ist gegossen — T1–T6, je die FORM (`_<genre>Variant`/
> `_growTreeBlueprintRich`) + der PHYSIK-Richter + der headless-baubare ANBLICK,
> alle in `scripts/diag-genom.cjs` mit der PLAN-ZAHL bewiesen (nicht Existenz).**
> Der ganze Bogen lief in EINEM Schub (kein „sag weiter"-Slicing), je T-Welle ein
> eigenes diag-Band + voller Playtest. Was GEBAUT + GEMESSEN ist:
>
> - **T1 — Blatt-TYPEN + Brettwurzel:** `baum_palme` (palm) · `baum_zypresse` (scale)
>   in SPECIES_GRAMMAR; der Foliage-Atlas backt 4 KIND-Spalten (Breitblatt/Nadel/
>   Palme/Schuppe, Ω-O14), die Karten-UVs routen je `foliage.kind`; Brettwurzeln am
>   Giganten (5–7 holz-Zylinder, tag-frozen). diag: 4 Typen · Atlas-Spalten distinkt ·
>   Gigant 5–7 / Normal 0 · UV palm→Spalte 2. Scatter-gated (selten in-Welt).
> - **T2 — Bauwerk-Genom PARAMETRISCH:** `_stationVariant` ÜBER scale+tint —
>   NON-UNIFORM Proportion (eigene x/y/z, physik-garant: jede Variante STEHT) +
>   DETAIL-Dichte (0–3 Ornament-Studs, tag-frozen). diag: prop+detail variieren, stands.
> - **T3 — Geologie/Mineralogie-Glanz:** per-Variante `emissiveBoost` (Kristall-glow /
>   Glut-Intensität, skaliert den tag-Glimmen, tag-neutral); Kristall Facetten-Achse;
>   Glut Öffnungs-Achse; Fels Sediment-Strata (Höhen-Farb-Bänder) + Moos/Flechten.
> - **T4 — Rüstung/Trank-Genome + Fahrzeug-SSF:** `_armorVariant` (Platten/Artikulation/
>   eisen-bronze) · `_potionVariant` (Phiole-Form + Glasur aus der Wirkung) ·
>   `_vehicleVariant` (Ω-Φ4 SSF: Spur · Kabine · RAD-GRÖSSE variieren ECHT — das Gefährt
>   RE-VERANKERT sich an seiner Geometrie [`mountArchitecture` leitet `_groundClear` aus
>   `_compoundBottomY` ab, kein gefrorenes Maß] → die Unterkante ruht IMMER auf dem Terrain,
>   ein großes Rad hebt das Gefährt [höherer CoM = ehrlich kippiger]; SEAT-SAFE, Gelenke heil,
>   kein Versinken, M3 GEMESSEN gegen die ABGELEITETE Erwartung statt einer Magie-Zahl).
> - **T5 — Kreatur-Allometrie (Ω-B5 Galileo):** `_applyCreatureAllometry` — die Glieder
>   verdicken ÜBERPROPORTIONAL (Querschnitt ∝ L^1.5, Länge isometrisch); der Koloss ist
>   STOCKIG statt vergrößerter Zwerg. diag: Glied-Schlankheit gigant 2.53 < iso 4 < klein 4.78.
> - **T6 — Kronen-Formen/Lean/Phyllotaxis/Mehrstämmig:** crownForm (weeping/vase/schirm) ·
>   lean · phylloDiv · multiStem (Birken-Klumpen). Alle tag-neutral + kein Knicken
>   (worst-Schlankheit 8.40 < 10.1, GEMESSEN über alle T6-Variationen).
>
> **FULLSTACK (Schöpfer-Nachfrage „bis zur Platzierung?", 16.06.) — DIE PLATZIERUNG REICHT BIS
> ZUR FORM:** bei den BLÄTTERN reicht das Genom von der untersten Ebene (das Blatt) bis zur
> Platzierung (Palme → warmes Feld). Bei den LANDMARKS war die Platzierung ein BLINDER Region-
> Hash. GEHEILT: `_landmarkVariantIdx` wählt die Form nach der HANGNEIGUNG (`_slopeAt`) — steile
> Hänge → aufragende Formen (Nadel/Stapel/Druse/tiefe Esse), flaches Land → gedrungene (Brocken/
> Geröll/Cluster/flacher See); jede Variante trägt ihre `_formClass`. So reicht das Landmark-
> Genom jetzt von der Form bis zur Platzierung, wie der Blatt-Typ zum Feld. GEMESSEN steepTall=1.0/
> flatSquat=1.0. **DIE EHRLICHE VERTIKAL-BILANZ je System** (lowest → assembly → placement):
> Bäume/Blätter ✅ voll · Landmarks (Fels/Kristall/Glut) ✅ voll (NEU) · Gerät/Rüstung/Trank/
> Fahrzeug ✅ within-nature (intent-platziert: der Spieler IST die Platzierung; Micro-Mesh beim
> Schwert/Werkzeug erreicht [`bladeProfile`/Kegel], Rüstung/Trank-Oberfläche fix). **NOCH NICHT
> voll:** KREATUR (scatter-platziert, aber die FORM folgt NICHT dem Feld — nur die Größe per netId;
> full-stack = Form/Accessoire nach Region/Feld) · BAUWERK (Assembly = scale+ornament fixer Teile,
> NICHT from-scratch wie der Tempel; Micro-Teil-Geometrie fix). Das sind die zwei nächsten Voll-
> Stack-Ziele.
>
> **WAS BEWUSST OFFEN BLEIBT (ehrlich, niedrig-prioritär / AUGEN-bound — kein Über-Claim):**
> 1. **Der LOOK (Ω-OPSIS Wand 1)** — Mammutbaum/Palmen-Hain/Koloss/Trauerweide/Basalt-
>    Strata/Lava-See/Oakeshott-Klinge im echten Schöpfer-Browser. Headless beweist
>    FORM+PHYSIK+Atlas-Bake, NICHT den finalen Anblick. **Der nächste Schritt: das Auge.**
> 2. **S0** — der Baum-`r01()`-Noise-Stream auf `roller.seq()` ziehen (V9.82 EINE Quelle).
>    BEWUSST aufgeschoben: ein Wechsel re-rollt JEDE Welt (sichtbare Form-Änderung, NULL
>    sichtbarer Gewinn) → unklug kurz vor dem Schöpfer-Auge. Eine eigene, angekündigte Welle.
> 3. **S2** — die 12 statischen `baum_*_jung/_alt`-DEF-Blöcke schneiden (eslint-unused +
>    2 Test-Fixtures migrieren). Pure Sediment-Tilgung, getrackt.
> 4. **Ω-B4 LOD-Swap je Scatter-Variante** (fels/kristall/glut) — die Varianten-Pools tragen
>    EINE Auflösung; der per-Variante-LOD-Swap ohne Pop bleibt offen (die Variants sind
>    schon low-poly → marginaler Perf-Gewinn, hoher Instanced-Refactor-Aufwand).

> **Die ehrliche Wahrheit nach S0–S7 (Schöpfer-Frage „hast du wirklich in voller Tiefe
> umgesetzt, oder einige Dinge nur an der Oberfläche gekratzt?"): JA, teils gekratzt.**
> Was STEHT: das GERÜST des Bogens — das Genom-PRINZIP ist über ALLE 8 Genres bewiesen
> (ein Roller, je eine `_<genre>Variant`-Funktion, je die HEADLINE-Achse, physik-garant +
> headless verifiziert in `diag-genom`). Das ist real (der 77-m-Gigant der STEHT, die 4
> Fels-Formen, das Oakeshott-Schwert, der Koloss). **Was NICHT steht: die VOLLE Tiefe der
> §4-Achsen-Landkarte.** Jedes Genre bekam seine wichtigste Achse, aber die REICHEN
> Sekundär-Achsen fehlen weitgehend. Der frühere Schluss „der Bogen ist RUND" war ÜBER-
> CLAIM — korrekt ist: **das Gerüst ist rund, die volle Tiefe ist die nächste Schicht.**
> Diese §9 ist die konkrete Punktliste, damit die nächste Sitzung sie WIRKLICH vollendet.

**DAS TIEFEN-PRINZIP (warum §4 die Wahrheit ist, nicht §6):** §4 (die Achsen-Landkarte) IST
die volle Tiefe je Genre. §6 (S0–S7) baute pro Genre die EINE Headline-Achse. Voll-Tiefe =
die übrigen §4-Achsen bauen, jede mit Referenz (Botanik/Geologie/Oakeshott) + Richter +
diag-Band. KEIN neues Framework — dieselbe `_<genre>Variant` + Roller, nur reicher.

```
GENRE   KERN ✅ (gebaut+verifiziert)        FLACH/FEHLT ⚠ (die volle §4-Tiefe)            NÄCHSTE WELLE (konkret)
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
S0      _rollGenome + Temple/Hut            der BAUM behält seinen eigenen r01()-Noise-   den Tree-r01 auf roller.seq()
        refaktoriert, UNSIGNED              Stream PARALLEL zum Roller; _buildBladed-      ziehen (EINE Quelle, V9.82);
                                            Weapon selbst nicht refaktoriert              eine harmlose Saat, aber Schuld
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
S1      sizeClass · age · foliage-FARBE     Blatt-TYPEN fehlen: kein PALME-Wedel, kein    (1) Blatt-Typ-Achse mit JE
BÄUME   (Sommer↔Herbst) + Allometrie;       SCHUPPE (Zypresse) — `foliageVar` ist nur     eigenem Atlas-Bake (Palme/
        Gigant 77 m STEHT (gemessen)        FARBE, nicht TYP (nur Laub/Nadel existieren,  Schuppe), gekeyt auf foliage.kind
                                            §4.1 wollte „je eigener Bake"). KEINE BRETT-  (2) Brettwurzel-Geometrie am
                                            WURZELN am Giganten (er ist ein skalierter    Giganten (geflarte Sequoia-Basis,
                                            Normalbaum, keine geflarte Sequoia-Basis).    nicht nur die flache Ω-K2-Disk)
                                            KEINE Kronen-Formen weeping/vase/Schirm.      (3) Kronen-Form-Achse (Trauer-
                                            KEIN Mehrstämmig · Neigung/Lean · Phyllo-     weide/Akazie/Schirm) (4) Lean +
                                            taxis-Varianz.                                Mehrstämmig + Phyllotaxis
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
S2      Scatter-Schnitt (Blobs spawnen      die 12 statischen DEF-Blöcke + ihre Parts-    die DEFs + Parts-Arrays schneiden,
LEGACY  NICHT mehr in der Welt)             Arrays liegen noch (eslint-unused-gekoppelt   die 2 Test-Fixtures (playtest 31244
                                            an 2 Test-Migrationen) — aufgeschoben         + diag-lambda-volltiefe) migrieren
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
S3      4 Formen (Brocken/Stapel/Nadel/     SCHICHTUNG fehlt (Sediment-Y-Bänder, §4.2 —   (1) Sediment-Schichtung (Y-Bänder
FELS    Geröll) physik-garant               `_terrainGeologyAlbedo` wiederverwenden).     aus _terrainGeologyAlbedo) (2)
                                            FLECHTEN/MOOS-Deckung fehlt (feucht). FIXER   Flechten/Moos-Deckung im feuchten
                                            12-Pool statt grow-for-spawn (nicht infinite- Feld (3) optional grow-for-spawn
                                            from-seed wie die Bäume)                      (infinite statt 12-Pool)
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
S4      Habitus (Druse/Cluster/Geode) +     FACETTEN-ZAHL-Achse fehlt (Kristall). GLANZ/  (1) emissiv AUS magieleitung→Tag
KRIST.  Becken/Flamme-Formen                GLUT EMISSIV aus magieleitung fehlt (nur      koppeln (Kristall+Glut) (2)
GLUT    physik-garant                       opacity gesetzt). Öffnung + Intensität-       Facetten-Zahl-Achse (3) Glut-
                                            emissiv-Kopplung (Glut) fehlt. Fixe Pools.    Öffnungs-Achse
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
S5      _stationVariant (uniform-Skala +    DER FLACHSTE — NUR Skala + Farb-Tönung. KEINE (1) ein echtes Werkstatt/Portal-
BAUTEN  Palette-Tönung), margin-invariant   PROPORTION (nicht-uniform, physik-garant),    Genom: die Teile PARAMETRISCH
                                            KEINE Detail-Dichte (Ornamente/Teile hinzu/   generieren (wie der Tempel), nicht
                                            weg), KEINE funktionale Variation. §4.5       nur skalieren (2) Proportion-Achse
                                            wollte „Proportion · Detail-Dichte"           (3) Detail-Dichte-Achse
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
S6      Schwert (OAKESHOTT-Typ + Balance)   RÜSTUNG nur scale+tint (kein echtes Platten-  (1) Rüstungs-Genom (Platten-Größe/
GERÄT   + Werkzeug (Stiel/Masse/Keil-       Größe/Artikulation/Material-Genom). TRANK     Artikulation/Material) (2) Trank-
        Winkel-Hebel) genuin TIEF           nur scale+tint (kein Phiole-Form/Glasur-      Genom (Phiole-Form, Glasur-Farbe
                                            Genom). FAHRZEUG KOMPLETT zurückgestellt      aus der Wirkung) (3) Fahrzeug-SSF-
                                            (→ „Fahrzeug-Fahr-Tiefe"-Faden)               Genom (sitz-bewusste Skala, §4.7)
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
S7      per-Kreatur-Größe (klein→GIGANT),   ALLOMETRISCHE Glied-Dicke fehlt (NUR UNIFORM/ (1) skelett-bewusstes allometrisches
KREATUR uniform-skaliert, physik-invariant, isometrisch — der Koloss hat KEINE stockigeren Skalieren (Beine ∝ √Masse, die
        stat-gekoppelt (robust+träge)       Beine, §4.7 wollte „∝ Quadrat-Kubik"). KEINE  Galileo-Allometrie) (2) Accessoire-
                                            Accessoires (keine Part-Varianz). Die abs-    Achse (3) ggf. ein realistischeres
                                            trakten Templates haben keine echten Glieder  Skelett-Template als Voraussetzung
```

**WAS GENUIN TIEF IST (kein Kratzen, der Stolz-Teil — fair zu sich selbst):** das Genom-
PRINZIP über alle 8 Genres · der PHYSIK-Richter (rooted-vs-freistehend, margin-/schlankheits-
Invarianz, Knicken, Oakeshott-Balance, alles GEMESSEN nicht geraten) · die HEADLINE-Achse je
Genre (der stehende 77-m-Gigant, die 4 Fels-Formen, der Oakeshott-Typ, der Koloss) · die
gelernten + ANGEWANDTEN Lehren (Spitzhacke-IST-spitz, der Test wandert, Vehicle-Revert, die
uniform-Invarianz). Das Gerüst trägt — die Sekundär-Achsen bauen jetzt auf ihm auf.

**DIE REIHENFOLGE DER VOLL-TIEFE (nach sichtbarem Hebel × Reife der Referenz):**
```
T1  S1-Blatt-TYPEN (Palme/Schuppe, je Atlas-Bake) + Brettwurzel am Giganten  ← der größte
      sichtbare Sprung (ein Palmen-Hain, ein echter Mammutbaum mit Basis), LAAS-Methode reif
T2  S5-Bauwerk-Genom ECHT (Teile parametrisch, nicht scale+tint)  ← der flachste Punkt, hebt
      sich am meisten; das _classicalTempleVariant-Muster auf Werkstätten/Portale anwenden
T3  S4-emissiv-Kopplung (Kristall/Glut leuchten aus dem Tag) + S3-Schichtung/Moos  ← Geologie/
      Mineralogie-Tiefe, der Fern-Look
T4  S6-Rüstung/Trank-Genom + Fahrzeug-SSF (sitz-bewusst)  ← die restliche Crafting-Palette
T5  S7-allometrische Glied-Dicke (skelett-bewusst) + Accessoires  ← die Kreatur-Biomechanik
T6  S1-Kronen-Formen/Lean/Mehrstämmig/Phyllotaxis + S0-Tree-r01→roller.seq + S2-DEF-Schnitt
      ← die Politur + die Schuld-Tilgung
```
Jede T-Welle: dieselbe Disziplin (§4-Achse nennen → Referenz → `_<genre>Variant` erweitern →
Richter → diag-Band → Schöpfer-Browser für den LOOK). **Erst wenn T1–T6 stehen, ist der Bogen
WIRKLICH rund — vorher ist er ein verifiziertes GERÜST mit der Headline-Achse je Genre.**

---

## §9.1 — DIE DREI-PLAN-WAHRHEIT (woher die VOLLE Tiefe kommt — der nächste Sitzung das Gesamtbild)

**Dieser Bogen ist EINER von DREI, die DASSELBE Genre formen — und die volle Tiefe
lebt erst, wenn alle drei für ein Genre stehen.** Der Selbst-Audit (§9) maß nur die
GEOMETRIE-Achse (`_<genre>Variant`, dieser Plan). Aber „ein echter Mammutbaum",
„ein Koloss, der biomechanisch steht", „eine Werkstatt, die nicht geklont wirkt"
sind PRODUKTE aus drei Schichten:

```
                 ┌─────────────────────────────────────────────────────────────┐
                 │  EIN GENRE, DREI PLÄNE — das Produkt ist ihr Skalarprodukt    │
                 ├──────────────┬──────────────────┬───────────────────────────┤
                 │ FORM/GEOMETRIE│ PHYSIK (das SEIN)│ ANBLICK (die OPTIK)        │
                 │ wahrerwuchs   │ wahrerbauplan    │ wahreranblick             │
                 │ (DIESER Plan) │ (Ω-PHYSIS)       │ (Ω-OPSIS)                 │
                 │ _<g>Variant   │ steht/knickt?    │ Oberfläche · Atlas · PBR  │
                 └──────────────┴──────────────────┴───────────────────────────┘
```

**Der Bogen entstand aus den zwei Quell-Plänen — was sie noch OFFEN tragen, das
diese Geometrie-Schicht NICHT allein schließt (die nächste Sitzung integriert es):**

```
T-Welle  FORM (wahrerwuchs §4)         PHYSIK (wahrerbauplan)      ANBLICK (wahreranblick)
─────────────────────────────────────────────────────────────────────────────────────────
T1       S1 Blatt-TYPEN + Brettwurzel  (Ω-Φ3-b trägt schon —       Ω-O14 Blatt-Geometrie
         (Palme/Schuppe, Atlas-Bake)   der Gigant knickt nicht)    (Quad→blatt-FÖRMIG,
                                                                   Nadel≠Breitblatt distinkt)
                                                                   ← der AUGEN-bound Look-Kern
─────────────────────────────────────────────────────────────────────────────────────────
T2       S5 Bauwerk-Genom PARAMETRISCH Ω-B4 Varianten-Pool + LOD   (Ω-O folgt — die Bauten
         (Teile generieren wie der     pro Struktur-Typ (mein S5   erben den PBR-Pfad schon)
         Tempel, nicht scale+tint)     ist FIXER Pool, der LOD-
                                       Swap je Variante OFFEN)
─────────────────────────────────────────────────────────────────────────────────────────
T3       S4 emissiv-Kopplung +         (Ω-Φ trägt — Fels/Kristall  Ω-O15 Fels-Mikrostruktur
         S3 Sediment-Schichtung/Moos   stehen)                     (noiserock SCHON gebaut
                                                                   V18.227 — mein S3 FORM-
                                                                   Genom sitzt DARAUF; die
                                                                   Schichtung/Moos ist neu)
─────────────────────────────────────────────────────────────────────────────────────────
T4       S6 Rüstung/Trank-Genom +      Ω-Φ4 Fahrzeug-SSF (sitz-    (Material-PBR trägt schon)
         Fahrzeug-SSF (sitz-bewusst)   bewusste Skala, der zurück-
                                       gestellte Faden)
─────────────────────────────────────────────────────────────────────────────────────────
T5       S7 allometrische Glied-Dicke  Ω-B5 KREATUR-ALLOMETRIE     (die neuen Körper-Formen
         (skelett-bewusst, ∝√Masse)    (Galileo Quadrat-Kubik —    sind AUGEN-bound)
                                       mein S7 ist ISOMETRISCH,
                                       genau die vom Plan benannte
                                       „starre Skalierung"-FALLE)
─────────────────────────────────────────────────────────────────────────────────────────
T6       S1 Kronen-Formen/Lean/        (trägt)                     Ω-O16 Ast+Laub-Fidelität
         Phyllotaxis + S0/S2-Tilgung                               (LAAS-Kalibrierung, dünn→
                                                                   voll — laufende Politur)
```

**DIE ZWEI SCHARFEN OFFENEN FÄDEN AUS DEN QUELL-PLÄNEN (die ich NICHT voll
integriert habe — Wahrheit, kein Verstecken):**

1. **Ω-B5 (wahrerbauplan §6) — die KREATUR-ALLOMETRIE ist NICHT erfüllt, nur
   ANGEFANGEN.** Der Plan verlangt wörtlich (Z. 792–802): „Glied-Proportionen
   ALLOMETRISCH skalieren (Quadrat-Kubik), **nicht isometrisch** — große Kreatur →
   überproportional dicke Glieder, sonst brechen sie" + BEWEIS „nicht als **starre
   Skalierung**". Mein S7 (`_creatureBodySize` → `group.scale.setScalar`) ist EXAKT
   die starre/isometrische Skalierung, die der Plan als FALLE benennt — der Koloss
   ist ein 2.7× vergrößerter Zwerg, kein biomechanischer Riese. Das ist **T5** + die
   Voraussetzung dafür ist ein gliedmaßen-bewusstes Template (heute sind die
   Kreatur-Templates abstrakt, ohne echte trag-fähige Glieder, §9-Tabelle S7). **Bis
   T5 steht: Ω-B5 bleibt OFFEN, der Skalierungs-Haken existiert (V18.255), die
   Allometrie nicht.**

2. **Ω-B4 (wahrerbauplan §6) — der Varianten-Pool ist da, der LOD-Swap je Variante
   NICHT.** Mein S3/S4/S5 streuen FIXE Varianten-Pools (fels/kristall/glut/station)
   in die geteilten HISM-Gruppen (das Instancing erbt sich), aber jede Variante
   trägt nur EINE Auflösung — der per-Variante-LOD-Swag ohne Pop (`_tickArchitectureLOD`,
   wie ihn der Baum/Tempel hat) ist für die neuen Pools OFFEN. Das ist **T2**
   (zusammen mit dem echten parametrischen Bauwerk-Genom).

**DIE INTEGRATIONS-REGEL FÜR DIE NÄCHSTE SITZUNG:** eine T-Welle ist erst „voll
tief", wenn ihre DREI Plan-Schichten stehen — die FORM (`_<genre>Variant` erweitern,
dieser Plan §4), die PHYSIK (gegen den Ω-Φ-Richter messen, wahrerbauplan), der
ANBLICK (gegen die Genre-Referenz im Schöpfer-Browser, wahreranblick Wand 1). Die
§9-Tabelle nennt die FORM-Achse, diese §9.1-Tabelle nennt die zwei Schwester-Fäden.
Wer T1 baut, liest Ω-O14; wer T5 baut, liest Ω-B5; wer T2 baut, liest Ω-B4. **So
erreicht der Bogen die ULTIMATIVE Tiefe statt nur das Gerüst — Fischer UND Gigant.**

---

## §10 — DER VOLLE VERTIKAL-BOGEN (das WAS-FEHLT, in voller Synergie + Tiefe)

> **STAND 16.06.2026 (nach T1–T6 + dem Landmark-Fullstack):** Der Schöpfer sah den
> tiefsten Bruch — *„bei den Blättern sind wir bis zur untersten Ebene gelandet, hoch
> bis zum Baum, sogar bis zur PLATZIERUNG. Haben wir das bei den anderen Systemen
> ebenfalls getan?"* Die ehrliche Antwort: NEIN, noch nicht überall. §10 ist der
> aktive Plan, der das vollendet — KEIN Gerüst mehr, der volle vertikale Guss.

### §10.1 — DAS PRINZIP: das Genom ist eine VERTIKALE KETTE, keine flache Insel

Ein wahres Genom reicht durch VIER Ebenen, und an jeder Ebene durch die DREI Pläne:

```
          FORM (wahrerwuchs)   PHYSIK (wahrerbauplan)   ANBLICK (wahreranblick)
  MICRO   das einzelne          trägt das Primitiv?      die Oberfläche/Silhouette
          Primitiv (Blatt,      (Knick/Last je Glied)    (Atlas-Bake, Maserung)
          Klinge, Glied, Teil)
    │
  ASSEMBLY  wie die Primitive    steht/schließt der       die zusammengesetzte
            sich fügen           Lastpfad (Ω-Φ2/Φ5)?      Gestalt
    │
  GESTALT   das ganze Ding       die Gesamt-Balance       der Gesamt-Look
            (Größe/Alter/Stil)   (SSF/Schwung Ω-Φ4)
    │
  PLATZIERUNG  WO/WELCHE Variante  steht es am Ort?         der Anblick im Kontext
            erscheint — feld-                              (Hain/Formation/Herde)
            bedeutsam ODER Intent
```

**Die Synergie:** EIN Seed treibt JEDE Ebene; DER RICHTER garantiert JEDE Ebene; DIE
REFERENZ ankert JEDE Ebene; DIE PLATZIERUNG liest das Feld (scatter) ODER folgt der
Absicht (Werkstatt/Gerät). Das ist „den grossen Plan im Kopf": nicht eine
Variant-Funktion, sondern eine durchgehende Kette vom Korn bis zur Welt-Stelle.

### §10.2 — DIE EHRLICHE VERTIKAL-BILANZ (welches System erreicht welche Ebene)

```
SYSTEM            MICRO         ASSEMBLY   GESTALT    PLATZIERUNG→FORM      VOLL?
──────────────────────────────────────────────────────────────────────────────────
Bäume/Blätter     ✅ Atlas/Typ  ✅          ✅          ✅ Feld (Wärme→Palme)  ✅ VOLL
Landmarks F/K/G   ✅ Form-Klasse ✅          ✅          ✅ Hang→Form (NEU)     ✅ VOLL
Gerät Schwert/Werkz ✅ bladeProfile ✅       ✅          ⊙ Intent (Spieler)    ✅ within-nature
Rüstung/Trank     ⚠ Oberfläche fix ✅        ✅          ⊙ Intent              ~ (Micro offen)
Kreatur           ✗ Template fix  ⚠ nur Größe ⚠ nur Größe ✗ Form folgt Feld NICHT  ✗ FLACH
Bauwerk Werkstatt/Portal ✗ Teil-Geo fix ⚠ scale+ornament ✅ ⊙ Intent           ✗ FLACH (Assembly)
```

Zwei Systeme sind FLACH (eine Variant-Funktion, ohne die volle Kette): **KREATUR**
(die Form ignoriert das Feld, nur Größe variiert) + **BAUWERK** (der Bau skaliert+
ornamentiert FIXE Teile, statt sie wie der Tempel from-scratch zu generieren). Das
sind die zwei nächsten Voll-Stack-Ziele. Dazu zwei Micro-Reste (Rüstung/Trank-
Oberfläche) + die Schuld-Tilgung + der LOOK.

### §10.3 — V1: KREATUR voll-vertikal (der klarste scatter-Fall, direkt analog Blatt→Wärme)

> Der EINZIGE scatter-platzierte Bürger, dessen Form das Feld noch ignoriert. Heute:
> `_creatureBodySize(netId)` → nur eine Größe; das Template (CREATURE_SOULS) ist fix.

- **FORM (wahrerwuchs):** (a) die KÖRPER-FORM folgt der Region/dem Feld — ein
  `_creatureFormForField(field, netId)` wählt Seele/Körper-Profil nach dem Welt-Feld
  (karges Hochland → karge/harte Wesen, üppiges Tal → saftige; glut-Region → Glut-
  Wesen), genau wie `_scatterSpeciesForCell` den Baum nach moisture/lebendig wählt.
  (b) per-Wesen FORM-Variation: Glied-Proportion (Bein-Länge, Kopf-Größe, Rumpf-Bulk)
  + symmetrische ACCESSOIRES (Hörner/Kamm/Stacheln-Paare) aus dem netId-Genom, INNERHALB
  der V18.209-Symmetrie (beide Glieder eines Paares gleich → das locked Template wird
  symmetrisch variiert, nie verbogen). Das ist die unterste Ebene (die Körper-Teile
  variieren per Wesen, wie das Blatt per Baum).
- **PHYSIK (Ω-B5/wahrerbauplan):** die variierten/akzessorierten Glieder müssen TRAGEN
  (der Stand/Knick-Richter); die T5-Allometrie (∝L^1.5) gilt weiter; die Symmetrie-
  Wand bleibt (kein verbogenes Template).
- **ANBLICK (wahreranblick):** die neuen Körper-Formen + Accessoires AUGEN-bound (Wand 1).
- **PLATZIERUNG→FORM:** der scatter/spawn-Pfad liest das Feld am Spawn-Ort → die Form
  folgt (die Kette reicht bis zur Platzierung, wie beim Blatt).
- **DISZIPLIN:** reference-first (echte Tier-Biomechanik/Allometrie); der Richter
  garantiert (steht/trägt); diag-band (Form korreliert mit Feld + Symmetrie-treu + steht);
  der Look am Schöpfer-Auge. Migrations-Falle: die Opacity/Index-Kopplung
  (children[i]↔bodyParts[i]) — Accessoires am ENDE anhängen, den Vertrag wahren.

### §10.4 — V2: BAUWERK from-scratch (das §9-T2-Ideal vollendet)

> Heute: `_stationVariant` skaliert+tönt+ornamentiert die FIXE Parts-Liste. Die
> unterste Ebene (die Teil-Geometrie) erreicht das Genom nicht.

- **FORM:** ein echtes Werkstatt/Portal-Genom — die Teile PARAMETRISCH generieren (das
  `_buildClassicalTemple`-Muster): die Esse aus Ofen+Esse+Amboss-Parametern (Höhe/Breite/
  Schlot), der Webstuhl aus Rahmen+Kette, das Portal aus Ring-Radius+Membran+Pfeiler.
  Die FUNKTION bleibt lesbar (§6½.2: eine Esse liest als Esse; `_computeWorkshopDomain`
  muss sie weiter erkennen). Im Form-Satz bleiben (box/cylinder/pyramid + Custom-Meshes).
- **PHYSIK:** steht (Ω-Φ2) + Lastpfad (Ω-Φ5) — jede generierte Werkstatt physik-garant.
- **ANBLICK:** die generierten Teile + Detail-Dichte AUGEN-bound.
- **PLATZIERUNG:** Intent (Gesten/Nexus/Spieler platziert) — within-nature voll, kein Feld.
- **DISZIPLIN:** ein Builder pro Funktions-Typ (Esse/Brennkolben/Webstuhl/Altar/Drehbank/
  Portal), reference-first (die funktionale Essenz), der Domänen-Leser bleibt grün.

### §10.5 — V3: DER MICRO-REST (Rüstung/Trank-Oberfläche) — die letzte unterste Ebene

- Rüstung: die Platten-OBERFLÄCHE (Nieten/Riefen/Wappen aus dem Material-Tag, wie die
  Rinde-Maserung Ω-O7) statt flacher Farbe. Trank: das Glas/die Phiolen-Oberfläche
  (Lichtbrechung/Glasur-Tiefe). Beide ANBLICK-nah (Shader/Geometrie-Detail), AUGEN-bound.

### §10.6 — V4: DER LOOK (Ω-OPSIS Wand 1 — das Schöpfer-Auge, der letzte Richter)

Headless beweist FORM+PHYSIK+Atlas-Bake; den finalen ANBLICK urteilt nur das Auge:
Mammutbaum · Palmen-Hain · Herbstwald · Trauerweide · Fels-Formationen (Spire vs Brocken
am Hang) · Kristall-Druse glüht · Lava-See · Oakeshott-Klinge · Koloss-Beine · die neuen
Kreatur-Formen · die generierten Bauten. Jeder Punkt ein Schöpfer-Browser-Sign-off.

### §10.7 — V5: DIE SCHULD-TILGUNG (niedrig-prioritär, getrackt)

- **S0** — der Baum-`r01()`-Noise auf `roller.seq()` (V9.82 EINE Quelle). Re-rollt JEDE
  Welt sichtbar bei null Gewinn → eine EIGENE, angekündigte Welle (nicht beiläufig).
- **S2** — die 12 toten `baum_*_jung/_alt`-DEF-Blöcke schneiden + 2 Test-Fixtures
  (playtest 31244 + diag-lambda-volltiefe) migrieren.
- **Ω-B4 LOD-Swap je Scatter-Variante** — die Pools sind low-poly → marginaler Perf-
  Gewinn, hoher Instanced-Refactor-Aufwand. Nur wenn ein gemessener FPS-Druck es weckt.

### §10.8 — DIE REIHENFOLGE (nach Vertikal-Lücke × Hebel)

```
V1  KREATUR form-folgt-dem-Feld + per-Wesen-Form    ← der klarste FLACHE Fall, scatter,
      (FORM × Ω-B5 × Anblick)                          direkt analog Blatt→Wärme
V2  BAUWERK from-scratch (Werkstatt/Portal-Genom)    ← die zweite FLACHE Stelle (Assembly)
V3  MICRO-Rest (Rüstung/Trank-Oberfläche)            ← die letzte unterste Ebene
V4  DER LOOK (alle T1–T6 + V1/V2 am Schöpfer-Auge)   ← Wand 1, der letzte Richter
V5  Schuld-Tilgung (S0 · S2 · Ω-B4-LOD)              ← Politur, getrackt
```

**Die EINE Regel (wie für T1–T6):** jede V-Welle ist erst voll, wenn ihre DREI Plan-
Schichten stehen — die FORM (dieser Plan), die PHYSIK (der Richter, `archiv/wahrerbauplan.md`),
der ANBLICK (`wahreranblick.md`, Wand 1) — UND die VERTIKALE Kette reicht (Micro →
Assembly → Gestalt → Platzierung). MISS die Plan-Zahl (diag-genom erweitern), nicht
Existenz. Dann erst — und dann ganz — ist der Wuchs-Bogen WIRKLICH rund.

---

## §11 — DIE FIDELITÄT (die WURZEL-Diagnose des Schöpfer-Katalogs, 16.06.2026)

> ## ⚑ DAS MANDAT (lies das ZUERST, nächster Agent — bindend, unausweichlich)
>
> **Giesse wie ein GIGANT auf den Schultern von RIESEN.** Der Schöpfer-Katalog
> (`scripts/diag-werk-render.cjs`) zeigte: „kaum ein Upgrade, es fehlen viele Details."
> Die WURZEL ist KEIN fehlender Hand-Mesh — sie ist ein fehlendes **GESETZ**. Sieben
> Wände, die den nächsten Schub binden (verletze KEINE):
>
> 1. **DAS GESETZ ERZEUGT DAS DETAIL, NIE DIE HAND.** Detail ist ein AUSLESEWERT der
>    Gesetz-Schärfe (das Projekt-Axiom auf die Geometrie). Du baust pro Domäne ein
>    SCHARFES generatives GESETZ (Grammatik/Skelett/Simulation), aus dem das Detail
>    EMERGIERT — wie der Tempel aus der dorischen Ordnung, das Schwert aus Oakeshott.
>    Ein „bau einen Detail-Mesh von Hand"-Reflex ist die FALLE (Brute-Force, skaliert
>    nicht, verletzt das Axiom). Hand-Arbeit ist NUR die ~20 %-Politur.
> 2. **SCHULTERN VON RIESEN — RECHERCHIERE ZUERST.** Für JEDE Domäne ZUERST das Profi-
>    Vorbild (CGA/Split-Shape-Grammatik · L-System · creature-Skelett+Metaball+Marching-
>    Cubes · Kristallographie/Voronoi · Erosion/Fraktur · Lathe/Revolve). Nie erfinden,
>    nie raten — das etablierte Gesetz holen, DANN giessen. „Wir sind nicht die ersten."
> 3. **DAS GESETZ IST AUCH DAS TOR.** Eine scharfe Grammatik emittiert KEINEN Blob; die
>    geschärfte Resonanz weist ihn ab. Heile das Leck `roleManual` (ein Blob beansprucht
>    eine Rolle, ohne sie über die FORM zu verdienen). Ziel: die Rolle EMERGIERT aus der
>    gesetz-erzeugten Form — „sonst wären diese Systeme gar nicht durchgekommen".
> 4. **BREITE: ALLE Systeme (F1–F6), kein Auslassen.** Kreatur · Gerät · Werkstatt/Portal ·
>    Kristall/Fels · Fahrzeug · Bäume/Glut — jedes bekommt sein Gesetz. Der Katalog ist
>    erst rund, wenn JEDES Werk als das Ding liest.
> 5. **TIEFE: pro Domäne das GANZE Gesetz in EINEM Guss** (kein halber Mesh, kein „sag
>    weiter"-Slicing, V17.30). Das Genom (T1–T6-Varianz) reitet OBEN auf dem Gesetz
>    (Fidelität × Varianz, nicht statt).
> 6. **AUGEN VOR BEHAUPTEN.** Jedes gesetz-erzeugte Werk in den `diag-werk-render`-Katalog
>    + ANSEHEN, BEVOR „fertig" — liest es als das Ding? Headless-grün ≠ Fidelität. (Die
>    §11-Geburts-Lehre: ich baute Varianz auf Blobs, OHNE zu rendern.)
> 7. **DER RICHTER HÄLT.** Jeder gesetz-erzeugte Mesh durch Ω-PHYSIS (steht/knickt/
>    Lastpfad/Balance) + die Affinität-Wand (scatter tag-frozen, library/gesten frei).
>
> **Reihenfolge:** F1 (Kreatur-Skelett-Gesetz, die schlimmste Lücke) zuerst. **Stop-
> Bedingung je F (alle JA):** (a) das Domänen-GESETZ recherchiert + gegossen, Detail
> emergiert; (b) der `diag-werk-render`-Katalog zeigt das Werk als das DING (kein Blob,
> Schöpfer-Auge); (c) das Genom variiert DARAUF; (d) der Richter + das Tor (Blob fällt
> durch) halten; (e) diag-genom erweitert + grün. **Erst wenn ALLE F1–F6 das tragen,
> ist der Wuchs-Bogen WIRKLICH ein Upgrade.** Die HOW-Tiefe steht in §11.7; die WARUM-
> Diagnose in §11.1–6; die Profi-Quellen + per-Domäne-Gesetz in §11.7.

> **Der Schöpfer sah die gerenderten Bilder aller Systeme: „da fehlt ja noch einiges,
> sehe kaum ein Upgrade ehrlicherweise, es fehlen viele Details."** Er hat recht — und
> der Befund schneidet TIEFER als §10. §11 ist die ehrliche Wurzel + der Plan, der den
> SICHTBAREN Upgrade liefert. Diese §11 ist ab jetzt die PRIORITÄT (vor §10-Vertikal).
> **§11.1–6 = die DIAGNOSE (warum Blobs); §11.7 = die METHODE (das Gesetz, korrigiert).
> Das ⚑ MANDAT oben bindet beide.**

### §11.1 — DIE WURZEL (gemessen am Katalog `scripts/diag-werk-render.cjs`)

Das Genom (T1–T6) gab **VARIATION** (Größe · Proportion · Farbe · Form-Klasse aus dem
Seed). ABER die BASIS-GEOMETRIE der meisten Werke ist eine **rohe Primitiv-Montage**
(Box + Kugel + Zylinder + Kegel) OHNE die definierenden Merkmale der Referenz. GEMESSEN
am Bild:

```
LIEST ALS DAS DING (Fidelität ✓ — dedizierter Detail-Mesh):
  Tempel  → kannelierte Säulen (Entasis) + Triglyphen + Giebel + Stufen  (flutedColumn)
  Schwert → distal-verjüngte Klinge + Hohlkehle + Knauf + Parier         (bladeProfile)
  Palme   → kahler Schaft + fiedrige Wedel-Krone                          (palm-Atlas)

LIEST ALS BLOB (Fidelität ✗ — nackte Primitive, die Varianz ist UNSICHTBAR):
  Rüstung  = Box + 2 Kugeln          (liest als Box, NICHT als Panzer)
  Kristall = glatte Kugel            (liest als Ball, NICHT als Kristall)
  Kreatur  = Box + Kopf + Stummel    (liest als Blob, NICHT als Tier)
  Esse     = Box + Kuppel + Kugeln   (liest kaum als Schmiede)
  Wagen    = Box + Rad-Scheiben      (liest als Kiste auf Rädern)
  Trank/Spitzhacke/Portal/Glut/Fels  = Primitiv-Montagen, geringes Detail
```

**Die Lehre:** die Varianz IST da (verschiedene Größen/Farben), aber sie liest nicht als
Tiefe, weil jedes EINZELNE Werk ein roher Blob ist. **Das Genom war die META-Schicht
(Varianz); die FIDELITÄT (der detaillierte, reference-grounded Mesh je System) ist die
fehlende BASIS — sie macht die Varianz erst sichtbar.** „Kaum ein Upgrade" = genau das.

**Ehrliche Selbst-Kritik (die Fischer-Lehre, scharf):** ich baute T1–T6 (Varianz) auf
rohen Primitiven, OHNE den Anblick je Werk zu RENDERN. Hätte ich den Katalog WÄHREND
T1–T6 gerendert (Wand 1, das Auge), hätte ich gesehen, dass die Basis-Werke Blobs sind.
Der Schöpfer-Wunsch „rendere Bilder" hat es aufgedeckt — DARUM ist das Auge der Richter.

### §11.2 — DAS PRINZIP (was Tempel + Schwert beweisen)

Ein Werk liest als das, was es IST, NUR wenn seine GEOMETRIE die **definierenden
Merkmale der Referenz** trägt — NICHT ein skalierter Block, sondern ein dedizierter,
reference-grounded DETAIL-Mesh (`flutedColumn` trägt Entasis+Kannelur in EINER Geometrie;
`bladeProfile` die distale Verjüngung+Hohlkehle). Das ist die FIDELITÄT. Das Genom (Varianz)
reitet OBEN DRAUF: `_classicalTempleVariant` würfelt Ordnung/Säulen/Palette auf dem
detaillierten Säulen-Mesh. **Erst Fidelität, dann Varianz — sonst variiert man Blobs.**

### §11.3 — DAS NEUE ORGANISIERENDE PRINZIP: FIDELITÄT × GENOM × VERTIKAL

```
FIDELITÄT (NEU, §11 — die Priorität): jedes System bekommt die Tempel/Schwert-Behandlung —
            ein dedizierter Detail-Mesh-Builder, der die definierenden Merkmale trägt.
GENOM     (gebaut, T1–T6): die Varianz (Größe/Proportion/Farbe/Form) reitet oben drauf.
VERTIKAL  (§10, teils): die Platzierung reicht zur Form (Landmarks ✓, Kreatur offen).
```

Die FIDELITÄT ist die fehlende, SICHTBARE Schicht. Sie ist der „echte Upgrade". §10
(Vertikal) bleibt gültig, rückt aber HINTER §11 — denn ein form-folgt-dem-Feld-Blob ist
immer noch ein Blob.

### §11.4 — PER-SYSTEM: die Fidelitäts-Lücke (was fehlt)

> **ACHTUNG (Korrektur §11.7):** die „Mesh-Builder"-Spalte unten benennt die DIAGNOSE der
> Lücke (welches Detail fehlt) — NICHT die Methode. Der WEG ist NICHT „diesen Mesh von Hand
> bauen", sondern das Domänen-GESETZ (Grammatik/Skelett/Sim) schärfen, aus dem genau dieses
> Detail EMERGIERT (§11.7 + das ⚑ Mandat). Lies die Spalte als „was das Gesetz erzeugen muss".

```
SYSTEM     LIEST HEUTE          DEFINIERENDE MERKMALE (Referenz)          DER MESH-BUILDER (wie flutedColumn)
──────────────────────────────────────────────────────────────────────────────────────────────────────────
KREATUR    Box+Kopf+Stummel     echtes ANATOMIE-Skelett: Quadruped       _buildCreatureBody(skelett, allometrie)
(F1, die    (kein Tier)          (Rumpf+4 Beine+Hals+Kopf+Schwanz) ODER    — echte Glieder + Gelenke + Proportion,
schlimmste)                      Biped (Rumpf+2 Bein+2 Arm+Kopf), Gelenke  NICHT 3 Primitive. Tier-Anatomie.
RÜSTUNG    Box+2 Kugeln         gewölbte Brustplatte + Lamellen (fauld) + _buildBreastplate — gewölbte Platte +
(F2)                            Hals-Öffnung + Schulter-Lamellen           artikulierte Lamellen (gebogene Mesh).
TRANK      Kugeln+Zylinder      geformte Phiole (Hals/Bauch/Boden) +      _buildPhiole — Glas-Profil (lathe/
(F2)                            Korken + Flüssigkeits-Meniskus             revolve), Flüssigkeit innen, Korken.
SPITZHACKE Zylinder+Kegel       gebogener Pickel-Kopf + Gegen-Adze +      _buildPickaxeHead — gebogene Spitze
(F2)                            Bindung am Stiel                           (custom), nicht ein Kegel.
ESSE/      Box+Kuppel+Kugeln    funktionale Teile: Amboss · Blasebalg ·   _buildForge/_buildLoom/_buildPortal —
WERKSTATT  (kaum Schmiede)      Schornstein · Kohlenbett (Esse); Rahmen+   dedizierte funktionale Teile (das
PORTAL (F3)                     Kettfäden (Webstuhl); Ring+Glyphen (Portal) §10-V2, aber mit ECHTEM Detail).
KRISTALL   glatte Kugel         hexagonales Prisma + pyramidale           _buildCrystalCluster — prismatische
(F4)                            Termination + scharfe Facetten + Glanz     Facetten + Termination, NICHT sphere.
FELS       faceted Brocken      geometrische STRATIFIKATION (Schichten)+  noiserock + Sediment-Schicht-Geometrie
(F4)                            Verwitterungs-Risse + scharfe Kanten       (nicht nur Farbe) + Riss-Detail.
FAHRZEUG   Box+Rad-Scheiben     Fahrgestell: SPEICHEN-Räder + Rahmen/Bett _buildCart — Speichen-Räder (custom) +
(F5)                            + Achsen + Deichsel/Joch + Sitz            Rahmen + Deichsel.
BÄUME      Atlas-Laub (gut),    dichtere Krone + sichtbares Gabelungs-    Ω-O16-Politur: cardsPerAnchor + Kronen-
(F6)       Krone sparse         GERÜST (LAAS) + tiefere Karten             Hülle + Ast-Gabelung sichtbar.
GLUT       Becken+Kugel         züngelnde Flamme (mehr Zungen) + Glut-    _buildGlut — geschichtete Flammen-
(F6)                            Bett-Detail + stärkeres Emissiv            Zungen + emissive Glut-Brocken.
```

### §11.5 — DIE DISZIPLIN (die Tempel/Schwert-Lehre, verallgemeinert auf jeden Mesh-Builder)

```
1. REFERENCE-FIRST: die echte Form (Plattenrüstung 15. Jh. · Quarz-Kristallographie · Quadruped-
   Anatomie · Apotheker-Phiole), nicht erfunden. Das definierende Merkmal benennen, DANN bauen.
2. EIN MERKMAL = EINE custom Geometrie (Face-Disziplin): flutedColumn trägt Entasis+Kannelur in
   EINEM Mesh, nicht N Groove-Parts. Ein gebogener Panzer ist EIN Mesh, nicht 1 Box. (V18.242-Lehre.)
3. EIN NEUER SHAPE koppelt an DREI Stellen: das `_makePartGeometry`-switch, die
   `validateBlueprintParts`-Whitelist + Feld-Bewahrung (User-Zugriff), die Form-LESER
   (SPATIAL_POINTED_SHAPES etc.). Built-ins umgehen die Validierung.
4. DER RICHTER GARANTIERT: jeder Detail-Mesh durch Ω-PHYSIS (steht/knickt/Lastpfad/Balance);
   die Referenz hält die Proportion solide (die Ordnung/Oakeshott/Anatomie).
5. DAS GENOM REITET OBEN: nach dem Detail-Mesh würfelt `_<genre>Variant` die Achsen DARAUF
   (wie der Tempel Ordnung/Palette auf flutedColumn) — Fidelität × Varianz, nicht statt.
6. AFFINITÄT: scatter (Fels/Kristall/Glut/Kreatur) → Tags FROZEN (Form/Detail tag-neutral);
   gesten/library (Werkstatt/Gerät/Rüstung) → Material/Detail frei. Ein neuer Shape MUSS tag-
   neutral bleiben ODER die FROZEN-Baseline wird neu vermessen (diag-arch-tags).
7. AUGEN VOR BEHAUPTEN (die §11-Geburts-Lehre): jeden Detail-Mesh im Werk-Katalog RENDERN
   (`diag-werk-render`) + ANSEHEN, BEVOR „fertig" — liest er als das Ding? Headless-grün ≠ Fidelität.
```

### §11.6 — DIE REIHENFOLGE (nach sichtbarem Hebel — der Katalog ist der Maßstab)

```
F1  KREATUR/AVATAR — ein echtes Anatomie-Skelett (Quadruped/Biped, Glieder+Gelenke+Proportion).
      Die schlimmste Lücke + das lebendigste System. Vereint mit §10-V1 (Form-folgt-Feld) + T5-Allometrie.
F2  GERÄT-FIDELITÄT — Brustplatte (gewölbt+Lamellen) · Phiole (Glas-Profil) · Pickel-Kopf (gebogen).
      Kleine, klar referenzierte Meshes, hoher Lese-Gewinn.
F3  WERKSTATT/PORTAL — funktionale Detail-Builder (Amboss/Blasebalg/Schornstein · Rahmen/Kette · Glyphen-Ring).
      Das §10-V2, jetzt mit ECHTEM Detail.
F4  KRISTALL + FELS — kristallographische Facetten/Termination · Sediment-Schicht-Geometrie + Risse.
F5  FAHRZEUG — Speichen-Räder + Rahmen + Deichsel (das Fahrgestell, sitz-safe wie T4).
F6  BÄUME + GLUT — Krone-Dichte/Ast-Gerüst (Ω-O16) · züngelnde Flammen + Glut-Bett.
```

**Die EINE Regel:** jedes F ist erst voll, wenn (a) der Detail-Mesh die definierenden Merkmale
trägt (reference-first), (b) er im `diag-werk-render`-Katalog als das Ding LIEST (das Auge,
Wand 1), (c) das Genom DARAUF variiert (Fidelität × Varianz), (d) der Richter + die Affinität-
Wand halten. **Erst wenn der Katalog jedes Werk als das Ding zeigt (kein Blob), ist der Wuchs-
Bogen WIRKLICH ein Upgrade — vorher ist er Varianz auf Primitiven.** Der nächste Schub: F1.

### §11.7 — DIE TIEFERE WURZEL (Schöpfer-Korrektur 16.06.): das GESETZ erzeugt das Detail, nicht der Hand-Mesh

> **Schöpfer: „hast du geschaut wie es Profis machen? die Gesetze die sie verbinden —
> je schärfer und klarer die Gesetze, umso detaillierter und besser die Blueprints,
> oder? Dann wären diese Systeme gar nicht erst durchgekommen."** — Das korrigiert §11.1–6
> an der WURZEL. Mein §11 (F1–F6 „einen Detail-Mesh je System von Hand bauen") war das
> BRUTE-FORCE-Gegenteil des Projekt-Gesetzes. Der synergetische, professionelle Weg ist:
> **das Detail EMERGIERT aus einem SCHARFEN generativen GESETZ (Grammatik), es wird nicht
> gemalt.** Detail ist ein AUSLESEWERT der Gesetz-Schärfe — exakt das Projekt-Axiom
> (_jede Eigenschaft gerechnet/gelesen, nie geraten/gemalt_), auf die GEOMETRIE angewandt.

**Wie es Profis machen (recherchiert, die Referenzen):**
- **Gebäude** — CGA/Split-Shape-Grammatik: ein Massen-Modell → REKURSIVE Split-Regeln (Fassade
  → Stockwerke → Fenster → Rahmen) → Detail EMERGIERT aus der Grammatik, kein gemaltes Mesh.
  Der Tempel (dorische Ordnung) IST genau so eine Mini-Grammatik (Säulen-Zahl → Kannelur →
  Triglyphen-Rhythmus → Giebel) — DARUM trägt er Detail.
- **Pflanzen** — L-System: rekursive Wuchs-Regeln → fraktales Geäst, Detail auf jeder Skala
  (LOD via Subdivision). Unser Baum-Grammatik-System IST ein L-System.
- **Kreaturen** — SKELETT + Metaball + Marching-Cubes: ein virtuelles Skelett (Wirbelsäulen-
  Spline + Glied-Paare + Kopf) → Metabälle entlang der Knochen → eine GLATTE Haut (marschiert),
  Bone-Weights emergieren. NICHT Box+Kugel+Stummel — eine skelett-getriebene Gestalt.
- **Der HYBRID (80/20):** die Grammatik macht ~80 % (das Detail emergiert), Hand-Politur die
  letzten ~20 %. Mein §11 hatte es INVERTIERT (Hand-Mesh als Basis).

**Die zwei verbundenen Wahrheiten, die der Schöpfer benennt:**

1. **DETAIL = AUSLESEWERT DER GESETZ-SCHÄRFE.** Je schärfer das generative Gesetz (die
   Domänen-Grammatik), umso reicher EMERGIERT das Blueprint — automatisch, für JEDE Variante.
   Der Tempel/das Schwert beweisen es (scharfes Gesetz → Detail). Die anderen Systeme haben
   KEIN scharfes Gesetz — nur hand-platzierte Primitive + ein paar Varianz-Achsen → Blobs.

2. **DAS GESETZ IST AUCH DAS TOR (die „wären gar nicht durchgekommen"-Wahrheit).** Wenn das
   Blueprint von seiner Grammatik ERZEUGT würde (statt von Hand montiert), KÖNNTE ein Blob
   nicht existieren — die Grammatik emittiert nur gesetz-konformes Detail (eine Kristall-
   Grammatik gibt nie eine glatte Kugel aus; eine Rüstungs-Grammatik gibt nie einen nackten
   Kasten aus). Der LECK ist `roleManual`: er lässt einen hand-montierten Blob eine Rolle
   BEANSPRUCHEN, ohne sie über seine FORM zu verdienen. Das scharfe Gesetz macht die Rolle
   EMERGENT (kein Override) UND weist den Blob ab (die Resonanz/der Richter fordert die
   definierenden Merkmale). Schärfe das Tor → der Blob fällt durch, das Detail wird Pflicht.

**DIE RE-FRAMUNG VON F1–F6: nicht „Hand-Mesh", sondern „das Domänen-GESETZ schärfen":**
```
SYSTEM     DAS SCHARFE GESETZ (die Grammatik, aus der das Detail EMERGIERT)
─────────────────────────────────────────────────────────────────────────────────────────
KREATUR    ein SKELETT-Gesetz: Wirbelsäule + Glied-PAARE + Kopf/Gelenke → Metaball/Tube-Haut →
(F1)       die Gestalt EMERGIERT (wie das pro creature-gen). Die T5-Allometrie + §10-Feld reiten drauf.
STATION    eine SHAPE-GRAMMATIK je Funktion: Masse → Split → KOMPONENTEN (Amboss/Blasebalg/
(F3)       Schornstein als Grammatik-Teile, wie CGA-Fassaden-Detail). Der Tempel ist die Blaupause.
KRISTALL   ein KRISTALLOGRAPHIE-Gesetz: Gitter → prismatische Facetten + Termination (Symmetrie/
(F4)       Voronoi). Die Grammatik gibt NIE eine Kugel aus.
FELS       ein FRAKTUR/EROSIONS-Gesetz: Voronoi-Bruch + Noise-Displacement + Sediment-Strata.
(F4)
RÜSTUNG/   ein KÖRPER-KONFORMES Gesetz: die Platte FOLGT der Torso-Kurve, Lamellen artikulieren
GERÄT (F2) (eine Grammatik über die Körper-Form). Glas-Phiole = Lathe/Revolve-Profil-Gesetz.
FAHRZEUG   ein FAHRGESTELL-Gesetz: Speichen-Rad (radiale Subdivision) + Rahmen + Achse.
(F5)
BÄUME (F6) das L-System SCHÄRFEN (Gabelung/Dichte/Phyllotaxis sichtbarer), nicht ersetzen.
```

**DIE DISZIPLIN (die korrigierte §11-Regel):**
1. Pro Domäne ZUERST das GESETZ (die Grammatik/das Skelett/die Simulation) — recherchiert
   am Profi-Vorbild (CGA · L-System · creature-skeleton · Kristallographie · Voronoi-Fraktur).
2. Das Detail EMERGIERT rekursiv aus dem Gesetz (Subdivision → Detail auf jeder Skala, LOD-fähig).
   Hand-Mesh ist nur die ~20 %-Politur, NIE die Basis.
3. Das GESETZ schärft das TOR: die Resonanz/der Rollen-Leser FORDERT die definierenden Merkmale
   → ein Blob fällt durch. `roleManual` wird zum Verdacht (verdient die FORM die Rolle, oder
   beansprucht sie ein Blob?). Ziel: die Rolle EMERGIERT aus der gesetz-erzeugten Form.
4. AUGEN VOR BEHAUPTEN bleibt (`diag-werk-render`): liest das gesetz-erzeugte Werk als das Ding?
5. Die Varianz (T1–T6-Genom) reitet OBEN auf dem scharfen Gesetz (Fidelität × Varianz).

**Die Selbst-Lehre (verbindlich):** der erste Reflex „bau einen Detail-Mesh" ist die Brute-
Force-Falle — sie verletzt das Projekt-Axiom (Auslesewert statt Hand-Werk) UND skaliert nicht
(N bespoke Meshes statt EIN Gesetz). Die professionelle, synergetische Antwort ist IMMER: das
GESETZ schärfen, bis das Detail emergiert + der Blob durchs Tor fällt. F1 (Kreatur-Skelett-Gesetz)
ist der erste Schub — recherchiert (creature-skeleton/metaball), gesetz-getrieben, kein Hand-Blob.

---

## §12 — DER FIDELITÄTS-SCHUB (Stand 16.06.2026 — F1–F6 GEBAUT, ehrliche Bilanz)

> **Schöpfer-Rüge (mitten im Schub): „ich kann nichtmehr zusehen wie du dir auf die
> Schulter klopfst während die Ergebnisse kaum 5% erreichen."** Recht gehabt — die
> ersten Schritte (Kreatur als brauner Kasten-Vierbeiner, ein leicht besserer Kristall)
> waren als „grosser Upgrade" gefeiert, während der Katalog noch Blobs zeigte. Die
> KORREKTUR: nicht das einzelne System feiern, sondern den GANZEN Katalog auf „liest als
> das Ding" heben — über reference-grounded GEOMETRIE-GESETZE (das Detail EMERGIERT), nicht
> Hand-Meshes. Danach ging es in die Breite.

**GEBAUT + verifiziert (diag-genom alle Bänder grün · diag-werk-render am Auge · playtest):**
sieben neue Geometrie-GESETZE ersetzen die Primitiv-Montagen, das Genom (T1–T6) reitet oben:

```
GESETZ (neuer Shape)        DOMÄNE              WAR              LIEST JETZT ALS
─────────────────────────────────────────────────────────────────────────────────────
limb (verjüngte Kapsel)     F1 Kreatur          Box+Kopf+Stummel  Vierbeiner/Klauen-Raubtier
crystalPoint (Prisma+Term.) F4 Kristall          glatte Kugel      Quarz-Säule/Druse/Geode
latheProfile (Revolve)      F2 Trank · F6 Glut   Ball+Zyl/Becken+K Glas-Phiole · Brazier-Flamme
plateShell (Zyl-Sektion)    F2 Rüstung           Box+2 Kugeln      Kürass+Pauldrons+Fauld
spokeWheel (radiale Subdiv) F5 Fahrzeug          Kiste auf Scheiben Wagen mit Speichen-Rädern
pickHead (Pick+Adze)        F2 Werkzeug          Kegel             Spitzhacke (scharfe Spitze)
_buildForgeParts (Grammatik)F3 Werkstatt         Box+2 Kugeln      FORGE (Feuer/Haube/Amboss)
+ Portal grounded+Runen     F3 Portal            schwebender Ring  stehendes Runen-Tor
```

**Die DISZIPLIN, die hielt (jedes Gesetz):** (1) AFFINITÄT — jede neue Form-Aktivierung ==
die der ersetzten (limb==cylinder · crystalPoint==octahedron · plateShell==box · latheProfile==
sphere · spokeWheel==cylinder · pickHead==cone) → Tags BIT-IDENTISCH, scatter-frozen hält
(V17.16); glutwesen bleibt box+cone (wild-Temperament tag-emergent); die Esse bleibt FORGING
(GEMESSEN). (2) RICHTER — jede Variante steht (Ω-Φ2) · knickt nicht (Ω-Φ3-b, Schlankheit
gebunden) · Lastpfad schliesst (Ω-Φ5). (3) GELENKE — spokeWheel in die RAD-Erkennung (isCyl) +
rollable + isWheel → Fahr-Tiefe/Mount-Achse heil (V18.119/.150/M3). (4) AUGE — jedes Werk im
`diag-werk-render`-Katalog angesehen BEVOR „fertig" (die §11-Geburts-Lehre eingelöst).

**DER QUALITÄTS-LIFT (Schöpfer-Kalibrierung „Baum genial, Tempel 90%, Dorf 70%, Wagen-
Räder gut/Rest 60%" + „schärfst du das Gesetz zu wahrer Physik oder spielst du nur mit dem
Material?"):**
- **WAGEN** von ~60% auf einen echten Bauern-KARREN gehoben — Bord-Wände + Eck-Pfosten +
  Achs-Balken + DEICHSEL + Singletree (nach den Rädern, Index 5+ → die sitz/hafting-Gelenke
  0–4 + rad=4/Achse-x bleiben heil).
- **KREATUR-Körper** von der blockigen Box auf einen ORGANISCHEN LEIB gehoben: der box-Kern
  ist jetzt ein KOMPAKTER dichter Nugget GANZ INNERHALB einer Kapsel-Tonne (`limb`) → die
  Würfel-Kanten verschwinden, der Koloss liest als stockiges Tier. Tag-neutral (limb==cylinder,
  der stein-Kern hält dichte=3 → wesenMoreDichte/HasLebendig + die V18.208-Monotonie unberührt,
  GEMESSEN; das Raubtier bleibt angular).
- **DER TIEFEN-SCHRITT (Schöpfer „einen Schritt zurück und dann in die volle Tiefe") — DIE
  METABALL-HAUT (das §11.7-Skelett-Gesetz):** statt hand-gestapelter Kapseln EMERGIERT die
  Kreatur-Gestalt jetzt aus dem GESETZ — `_buildCreatureSkinGeometry`: ein Metaball-FELD aus
  den Skelett-Knochen (Kapsel-Distanz, benachbarte Knochen VERSCHMELZEN via Falloff>Radius),
  dessen Isofläche **SURFACE NETS** (die Terrain-Mesher-Technik der Welt = EINE Quelle, die
  heilige Lektion) als eine glatte organische HAUT zieht, in der die Glieder in den Rumpf
  fliessen. Die Knochen-TEILE bleiben (verborgen) als die WAHRHEIT für Tags/Physik/Motion/
  Allometrie (children-Index + alle Gesetze GEMESSEN unberührt: diag-genom grün, T5 csy=1);
  die Haut ist die sichtbare Gestalt (`soul.skin`, nur `wesen` — das Raubtier bleibt angular,
  seine Kegel-Klauen verschmelzen nicht sauber + die Kante IST die Bedrohung). Damit liest
  `wesen` als gewachsenes Tier (Glieder fusioniert), nicht als Kapsel-Stapel.
- **DIE PHYSIK-SCHÄRFUNG (der Method-Befund):** `_workshopStationPrecision` liest jetzt MASSE
  (Compound-dichte) + die ROHE Material-HÄRTE des härtesten Bauteils (der Amboss-Stahl, NICHT
  form-verstärkt — ein scharfes Horn ist kein härteres Werkzeug; daran sättigte die alte
  Compound-härte). Die Forge-Steigerung EMERGIERT jetzt aus der Amboss-Härte (Eisen 0.93 >
  Stein 0.904, weil Eisen härter IST), kein Etikett-Tausch — ein Auslesewert der Schmiede-Physik.

**EHRLICH OFFEN (kein Über-Claim — die Kalibrierung ehren):** die `wesen`-Haut ist organisch
(verschmolzene Glieder), aber die FÜSSE laufen spitz aus (Metaball folgt der Kapsel-Spitze →
ein Fuss-Knochen fehlt) + Kopf/Gesicht ohne Merkmale (Augen/Ohren) + die Haut ist STATISCH
(die Beine laufen nicht; das volle Skelett+SkinnedMesh-Bone-Skinning, das die Haut der Motion
folgen lässt, ist der nächste Schritt — die Knochen+Skeleton stehen dafür bereit). Die
Forge/Phiole/Kürass lesen klar, aber low-poly. WEITERE Werkstätten (brennkolben/webstuhl/
drehbank/altar) + der holzross-Mount tragen noch ihre alten Box-Listen (Kandidaten für die
Forge-Grammatik / das Skelett+Haut-Gesetz). BÄUME (F6 Ω-O16) Krone/Gabelung nicht angefasst.
Der finale LOOK bleibt AUGEN-bound (Schöpfer-Browser im echten WebGPU).
