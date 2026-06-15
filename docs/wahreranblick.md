# DER WAHRE ANBLICK — Ω-OPSIS

> **STAND (15.06.2026 — DER AKTIVE BOGEN · Gesicht „ANBLICK / Optik"):** S-GATE 0
> (Material-Pfad) ist ENTSCHIEDEN + gebaut — **PBR ist die EINE Wahrheit, toon RAUS**
> (V18.237, −384 Z., der Toon-Zwilling gestrichen). Die **zu starke Aura**, die jeden
> Anblick vergiftete (magenta Himmel `[0.65,0.35,0.86]`), ist SUBTIL (V18.236, EIN
> Knopf `auraTintStrength` → Himmel blau `[0.19,0.21,0.61]`). Ω-OPSIS war in V18.226–235
> weitgehend GEBAUT, aber **UN-GELANDET** (der Drift: „fertig" headless-grün, Welt bei
> 10%). **NÄCHSTE:** §7 Sky-Env-Map (PBR-Metalle render schwarz — GEMESSEN keine
> `scene.environment`) · Laub-Sättigung · der Boden (Ω-O1, der größte Hebel).
>
> **DIE FÜNF WÄNDE GEGEN DEN DRIFT (verbindlich, jede Welle):** (1) SEHEN vor
> behaupten — kein Ω-O „fertig" ohne Schöpfer-Browser-BILD; headless-grün ist NIE
> hinreichend für den LOOK. (2) Die Aura/Atmosphäre erst NEUTRAL, dann urteilen
> (der Welt-Tint vergiftet sonst die Farbe). (3) MECHANIK braucht eine ZAHL (objektive
> CONSUM-Wand: liest das Material das Feld?), LOOK braucht ein BILD. (4) EINE Quelle,
> kein Parallelpfad (per Grep+Test verifiziert). (5) zeitbox die Diagnose, liefere
> committed Wert pro Welle. _(Die Geschichte des Drifts + warum die Wände nötig sind:
> `archiv/wahreranblick-antidrift-plan.md`.)_
>
> **EIN PRINZIP, ZWEI GESICHTER:** dieser Plan (der ANBLICK) und `wahrerbauplan.md`
> (Ω-PHYSIS, das SEIN) sind dasselbe Gesetz — der Auslesewert der Wahrheit. Während
> Ω-PHYSIS headless verifizierbar ist, ist der LOOK flake-begrenzt → **das Schöpfer-
> Auge ist hier der letzte Richter** (Wand 1).

---

> Die visuelle Vollendung. Der Lebendige Gigant heilte die Bäume — eine Schicht,
> \~10% des sichtbaren Bildes. Dieser Plan deckt die anderen 90% ab: den Boden,
> das Gras, die Kiesel, die Pfade, die Materialien, die Büsche, die Atmosphäre.
> Nicht durch gemalte Texturen. Durch das EINE Prinzip, das den ganzen Rest von
> AnazhRealm trägt: \*\*jede Oberfläche ist ein gesetzmäßiger Auslesewert der
> Welt-Wahrheit — Felder, Tags, Physik — prozedural, nicht gemalt.\*\*
>
> Das ist nicht „wie LAAS aussehen". Es ist das Gegenteil. LAAS malt Schönheit
> auf tote Assets: Bitmap-Texturen, gebackenes Licht, eine schöne Leiche.
> AnazhRealm lässt Schönheit aus der Wahrheit \*wachsen\*: der Boden zeigt seine
> Geologie, das Gras wächst wo es soll, der Pfad ist wo Wasser und Füße die
> Welt abnutzten. Die visuelle Hälfte desselben Prinzips wie Ω-PHYSIS und
> Ω-CHRONOS. Mehr als LAAS, nicht weniger — ein gewachsener Organismus statt
> eines gemalten Leichnams.

\---

## §0 — DIE VISION UND DIE ABRECHNUNG

### Die ehrliche Abrechnung

Der Screenshot zeigte die Wahrheit, die ich zu lange umging: visuell ist die
Welt \~10% der Vision. Der Lebendige Gigant heilte die Baum-_Geometrie_ — eine
Schicht. Aber LAAS' Schönheit ist ein Stapel aus vielen Schichten, und fast
keine hat mit Baum-Geometrie zu tun. Was im Bild fehlt — der Boden (das meiste
des Bildschirms, flach und rot), Gras als Klingen, Kiesel, Felsen, Pfade,
Material-Textur, Rinde, die Kugel-Büsche, die weiß ausbrennenden Blatt-Quads —
das ist der _Rest des Stapels_. Dieser Plan ist die 100%.

### Das Missverständnis, beseitigt

Die Frage war nie „soll AnazhRealm wie LAAS aussehen oder stilisiert sein".
Das war Ausweichen. Die Ästhetik ist keine _Wahl_ — sie EMERGIERT aus den
Regeln, wie die Rollen aus den Tags und die Stabilität aus der Physik. Du hast
es immer gesagt: regelbasiert, wahre Physik, wie der Rest. Die visuelle Schicht
folgt demselben Gesetz: keine gemalte Oberfläche, keine gewählte Ästhetik —
jede Oberfläche erzählt die Wahrheit dessen, was sie IST und wo sie LIEGT.

### Was schon existiert (der Stoff liegt bereit)

```
DIE FELDER (worldFieldAt, W6.G P2): vier SimplexNoise-Schichten lebendig/
  dichte/glut/magieleitung — der Stoff für lawful Boden + Bewuchs.
DAS DRAINAGE-NETZ (deterministisch, lazy beim Worldgen): wo Wasser fließt →
  Feuchte, Pfade, dunkler Boden.
SLOPE (terrainSteepness, onSteepSlope, steepnessThreshold 3.0): Fels-vs-Gras.
Γ-M STRATA/FLECHTE (43 Treffer im Code, V18.197-200): Material-Charakter SCHON
  GEBAUT — aber per-Vertex (grob) im Toon-Color-Attribut (Z. 17903/22009).
GRAS (voxelChunkGrass, \_grassMat MeshLambertNodeMaterial, \_grassConeGeometry):
  existiert — aber als KEGEL, flach, eine Farbe.
GPU-SCATTER (V18.220, \_scatterRegion + Varianten-Pool + Zell-Raster): die
  Projektions-Maschine, gerade gebaut — bereit für Gras/Kiesel-Schichten.
SKELETON-GRAMMATIK (\_growTreeBlueprintRich): bereit für Büsche.
```

Fast nichts muss erfunden werden. Es muss _verdrahtet_ werden: die Felder in
die gerenderte Oberfläche, die Scatter-Maschine in feinere Schichten, die
Grammatik in die Büsche. Reference-first im reinsten Sinn — die Wahrheit liegt
schon da, wir lesen sie aus.

### Die fünf Säulen dieses Plans

```
SÄULE I    DER LAWFUL BODEN      — die Oberfläche als Auslesewert (größter Hebel)
SÄULE II   DIE BODENDECKUNG      — Gras/Kiesel/Pfade als lawful Projektion
SÄULE III  DIE MATERIALIEN       — prozedurale Textur aus den Tags (Rinde, Fels)
SÄULE IV   DIE FORM              — Büsche per Grammatik (Kugel-Bug heilen)
SÄULE V    DIE ATMOSPHÄRE        — Himmel/Licht/Dunst, die letzte Schicht
```

\---

## §1 — DAS ZENTRALE PRINZIP: DER AUSLESEWERT

> Wie Ω-PHYSIS einen Richter für das Stehen gab und Ω-CHRONOS für das Fließen,
> gibt Ω-OPSIS ein Gesetz für das Aussehen: jede Oberfläche ist eine Funktion
> der Welt-Wahrheit, prozedural berechnet, nicht gemalt.

### Das Meta-Gesetz

> \*\*Keine Oberfläche wird gemalt. Jede Oberfläche ist ein Auslesewert von
> Feldern × Tags × Physik — sie erzählt die Wahrheit dessen, was sie IST
> (Material-Tags) und wo sie LIEGT (Welt-Felder).\*\*

Drei Quellen, alle schon vorhanden:

```
FELDER  (worldFieldAt, Drainage, slope) → WO: Geologie, Hydrologie, Bewuchs.
        Der Boden ist Fels am Steilhang, Moos in der Senke, Staub auf dem Grat.
TAGS    (MATERIAL\_TAG\_KEYS: härte/dichte/…) → WAS: die Material-Oberfläche.
        Rinde liest holz, Fels liest seine Härte, Metall seine Dichte.
PHYSIK  (Schwerpunkt, Verschleiß, Lastpfad aus Ω-PHYSIS) → WIE genutzt:
        Pfade wo abgenutzt, Verwitterung wo exponiert.
```

### Warum prozedural, nicht gemalt (die Seele)

Eine Bitmap-Textur ist ein gemaltes, totes Asset — sie wiederholt sich, sie
weiß nichts von der Welt, sie ist LAAS' Totheit auf der Material-Ebene. Ein
prozedurales Material, das die Felder + Tags liest, ist _lebendig_: es weiß,
dass dieser Hang steil ist (also felsig), dass diese Senke feucht ist (also
moosig), dass dieser Stamm aus holz ist (also Maserung). Die Oberfläche kann
nicht lügen, weil sie aus der Wahrheit gerechnet ist. Das ist exakt dasselbe
Anti-Attrappe-Gesetz wie überall: keine gemalte Fassade, nur gewachsene
Wahrheit.

**Disziplin:** dieser Plan benutzt NIE eine Bitmap-Textur als Haupt-Oberfläche.
Prozedurale Node-Materialien (TSL), Feld-Auslesewerte, tag-getriebene Muster.
(Eine Detail-Noise-Map als prozedurale Hilfe ist erlaubt; eine gemalte
Albedo-Textur ist die verbotene Leiche.)

\---

## §2 — DIE LANDKARTE DER SICHTBAREN WELT (GEMESSEN)

```
SCHICHT          HEUTE (Code)                      WIRD
─────────────────────────────────────────────────────────────────────────────
Boden-Material   per-Vertex Toon-Color + Γ-M       per-Fragment Multi-Klassen-
                 Strata grob (Z. 17903, 22009)     Auslesewert (Ω-O1..O3)
Boden-Feuchte    Drainage-Netz existiert,          treibt Boden-Dunkelheit +
                 nicht im Material gelesen          Moos + Pfade (Ω-O2)
Gras             ConeGeometry, flach, dünn          Klingen-Geometrie, feld-
                 (\_grassConeGeometry)               dicht, GPU-Scatter (Ω-O4)
Kiesel/Felsen    keine Schicht                      Scatter gated rockExposure (Ω-O5)
Pfade            keine                              Drainage + Konnektivität (Ω-O6)
Material-Textur  flache Farbe                       prozedural aus Tags (Ω-O7..O8)
Blatt-Shading    Quad brennt weiß aus               Transluzenz aus laub (Ω-O9)
Büsche           Kugel-Haufen (Legacy)              Skeleton-Grammatik (Ω-O10)
Atmosphäre       Himmel existiert (SunSky-artig)    Dunst/Tiefe als Feld (Ω-O12..O13)
```

Das Muster spiegelt die anderen Pläne: AnazhRealm GREIFT schon nach der lawful
Oberfläche (Γ-M existiert, Gras existiert, Felder existieren) — aber roh,
ungelesen, per-Vertex statt per-Fragment, Kegel statt Klingen. Das unsichtbare
Kugel-Problem der Oberfläche: der Stoff ist da, das Gesetz ist nicht verdrahtet.

\---

## §3 — DIE SOLIDEN STRUKTUREN (Referenz, ehrlich)

> Bei den Tempeln waren es die Ordnungen, bei den Klingen Oakeshott. Hier ist
> die Referenz die Welt SELBST — ihre Felder sind die Wahrheit, aus der die
> Oberfläche gelesen wird. Plus die erprobte Technik prozeduraler Materialien.

### DIE REFERENZ — die Welt-Felder (schon AnazhRealms Wahrheit)

Kein externes Gold nötig: der Richter ist die Welt. slope sagt, wo Fels
durchbricht (Physik: steile Hänge tragen keine Erde, sie rutscht ab — das ist
das Stützpolygon-/Reibungs-Gesetz auf den Boden angewandt). Das Drainage-Netz
sagt, wo Wasser fließt (Hydrologie). lebendig sagt, wo es grünt. Die Felder
SIND die reference-first-Wahrheit; die Oberfläche wird daraus deduziert, nicht
gemalt.

### DIE TECHNIK — prozedurale Node-Materialien (TSL)

```
TSL-Node-Graphen (three.js r184, schon im Einsatz für Gras-Wind + Scatter-Mats):
  - Multi-Klassen-smoothstep-Konkurrenz (rock/scree/grass/moss/dirt/snow),
    getrieben von slope + moisture + altitude — smooth gemischt, kein argmax.
  - Triplanar-Projektion für steile Flächen (keine gestreckte Textur am Hang).
  - Fragment-Noise für Nah-Detail (der Boden ist nicht flach aus 1 m Nähe).
  - Tag-getriebene Muster (Maserung aus holz, Bänder aus Schichtung).
WARNUNG: prozedurale Fragment-Materialien können teuer werden → LOD-Material
  (ferne Fragmente: simpler), Detail nur im Nahbereich.
```

**§3.7-EHRLICHKEIT:** keine Bitmap-Albedo-Texturen — das wäre die gemalte
Leiche. Die einzige „Referenz" ist die Welt-Wahrheit (Felder + Tags). Das
prozedurale Material ist die METHODE, die sie sichtbar macht. Das ist
schwieriger als Texturen herunterladen — aber es ist das einzige, das zu deiner
Seele passt, und es ist kohärent, weil es nicht lügen kann.

\---

## §4 — SÄULE I: DER LAWFUL BODEN (der größte Hebel)

> Der Boden ist das meiste des Bildschirms. Ihn von flacher Farbe zum
> Auslesewert zu machen ist der einzelne größte visuelle Sprung. Baut auf dem
> existierenden Γ-M (43 Treffer) auf — vertieft es von per-Vertex zu per-Fragment.

### Ω-O1 — Multi-Klassen-Boden-Material

**GEMESSEN-Anker:** die Γ-M-Strata-Funktionen (43 Treffer) + der Toon-Vertex-
Color-Pfad (Z. 17903, 22009) + slope (terrainSteepness) + worldFieldAt.

```
Pro Fragment: Klassen-Gewichte aus den Feldern (smoothstep-Konkurrenz):
  rockW   = smoothstep(slope, 0.5, 0.8)              steile Hänge → Fels
  screeW  = smoothstep(slope, 0.35, 0.55)·(1−rockW)  mittlere → Geröll
  mossW   = moisture·(1−rockW)·lebendig              feucht+lebendig → Moos
  dirtW   = (1−mossW−rockW−screeW)                   Rest → Erde
  snowW   = smoothstep(altitude, hi, hi+Δ)           hoch → Schnee
Farbe = Σ klasseW · klasseFarbe (smooth gemischt, kein hartes Band).
Γ-M-Strata (existiert) liefert die Fels-Bänder höhen-abhängig + Eisenoxid +
  Flechten-Splotch — wandert von per-Vertex ins per-Fragment-Material.
```

**ANTI-SCOPE Ω-O1:** nur das Boden-Material. Kein Scatter (Säule II).

**BEWEIS Ω-O1:** ein Steilhang ist fels-dominiert, eine feuchte Senke moosig-
grün, ein hoher Grat verschneit/staubig — und alles smooth ineinander, kein
Band. Der Boden erzählt seine Geologie. Alt (flache Farbe) vs. neu offensichtlich.

### Ω-O2 — Drainage-getriebene Feuchte

**GEMESSEN-Anker:** das Drainage-Netz (lazy beim Worldgen) + Ω-O1.

```
Feuchte-Feld aus Drainage-Nähe: nahe einem Fluss/Becken → moisture↑ → der
  Boden wird dunkler, sättiger, moosiger; auf dem Grat → trocken, blass.
Der Boden zeigt die Hydrologie: man SIEHT, wohin das Wasser fließt.
```

**BEWEIS Ω-O2:** Boden nahe Wasser ist sichtbar feuchter/dunkler; Grate sind
trocken/blass; die Feuchte-Karte folgt dem Drainage-Netz.

### Ω-O3 — Nah-Detail (der Boden ist nicht flach aus 1 m)

**GEMESSEN-Anker:** TSL-Fragment-Pfad.

```
Fragment-Noise (mehrere Oktaven) + leichte Normal-Perturbation → der Boden hat
  Korn, kleine Variation, Mikro-Schatten aus 1-2 m Nähe statt einer Plastikfläche.
  LOD: nur im Nahbereich, ferne Fragmente simpler.
```

**BEWEIS Ω-O3:** aus Spieler-Nähe hat der Boden Korn + Variation, nicht eine
flache Farbe. Aus der Distanz bleibt er performant (LOD-Material).

\---

## §5 — SÄULE II: DIE LAWFUL BODENDECKUNG (die Projektion)

> Gras, Kiesel, Pfade — alle als deterministische Projektion der Felder, mit
> der GPU-Scatter-Maschine, die du gerade gebaut hast. Das Projektions-Prinzip
> des Giganten, auf den Boden angewandt.

### Ω-O4 — Gras als Klingen (Kegel → Halme, feld-dicht)

**GEMESSEN-Anker:** das existierende Gras (`\_grassConeGeometry`, `\_grassMat`,
TSL-Wind) + der GPU-Scatter (V18.220).

```
Geometrie: ConeGeometry → echte Klingen-Geometrie (schmale, gebogene Quads/
  Streifen, 2-3 pro Büschel, leichte Krümmung).
Dichte: deterministische Projektion — Halme wachsen wo lebendig × moisture hoch
  und slope niedrig (gated wie die Bäume), DICHT (Richtung LAAS' Million Halme),
  via die GPU-Scatter-Maschine mit FEINEN Zellen (z.B. 0.3-0.5 m).
Wind: der TSL-Gras-Wind existiert schon — die Klingen erben ihn.
Farbe: aus dem Boden-Material darunter (mossW/dirtW) gelesen → kohärent.
```

**BEWEIS Ω-O4:** der Boden trägt dichtes Klingen-Gras wo es soll (feucht, flach,
lebendig), keines am Fels/Steilhang; es wiegt im Wind; es ist Klinge, nicht Kegel.

### Ω-O5 — Kiesel + Felsen (gated rockExposure)

**GEMESSEN-Anker:** der GPU-Scatter + slope/rockExposure.

```
Scatter-Schicht (gröbere Zellen als Gras): Kiesel + Felsbrocken streuen wo
  rockExposure hoch (steile slope, niedrige moisture, exponiert). Sie liegen
  wo der Fels durchbricht — lawful, nicht nach Laune. Geometrie: einfache
  Varianten-Pool-Steine (wie die Baum-Varianten), tag holz→stein/fels.
```

**BEWEIS Ω-O5:** Kiesel + Felsen liegen an Steilhängen + felsigem Grund, nicht
auf der grünen Wiese; ihre Dichte folgt rockExposure.

### Ω-O6 — Pfade (Drainage + Konnektivität)

**GEMESSEN-Anker:** das Drainage-Netz + die Struktur-Positionen (Dorf/Tempel).

```
Ein Pfad ist abgenutzte Erde, lawful abgeleitet:
  (a) aus dem Drainage-Netz (Wasserläufe = natürliche Pfade/Furten), ODER
  (b) aus Konnektivität: ein Pfad-Feld zwischen Strukturen (Dorf↔Tempel), wie
      Wasser dem Tal folgt (kürzeste begehbare Linie, slope-gewichtet).
Wo das Pfad-Feld hoch ist: lebendig (Gras) unterdrückt, Boden zu gepackter
  Erde (dirtW↑, dunkler, glatter). Der Pfad ist wo die Welt abgenutzt wurde.
```

**BEWEIS Ω-O6:** zwischen Dorf und Tempel (oder entlang Wasserläufen) liegt ein
sichtbarer gepackt-Erde-Pfad ohne Gras; er folgt der lawful Linie, nicht einer
gemalten.

\---

## §6 — SÄULE III: DIE LAWFUL MATERIALIEN (Textur aus Tags)

> Keine Bitmap-Textur. Jede Material-Oberfläche ein prozeduraler Auslesewert
> der Tags — die SAME Resonanz, die schon die Rollen treibt.

### Ω-O7 — Rinde + Holz (prozedural aus holz-Tags)

**GEMESSEN-Anker:** die Material-Tags (holz, härte) + der Baum-Bauplan
(Stamm:holz).

```
Stamm-Material liest holz: Längs-Maserung (gerichtetes Noise entlang der
  Stamm-Achse), Rissmuster aus härte (härter → feinere/tiefere Risse), Farb-
  Variation aus der Maserung. Prozedural im TSL-Material, keine Textur.
```

**BEWEIS Ω-O7:** der Stamm zeigt Maserung + Rinden-Risse, die aus holz/härte
emergieren; verschiedene Holz-Härten → verschiedene Rinde. Nicht flache Farbe.

### Ω-O8 — Fels + Metall (prozedural aus Material-Tags)

**GEMESSEN-Anker:** die Material-Tags (härte, dichte, stromleitung) + Γ-M.

```
Fels-Material: Härte → Sprödigkeit/Kanten, Schichtung (Γ-M Strata), Flechten-
  Splotch (existiert). Metall: dichte/härte → Glanz/Reflexion (auch im Toon
  als Specular-Stufe), stromleitung → Farbton (Kupfer/Eisen).
```

**BEWEIS Ω-O8:** Fels erzählt seine Härte + Schichtung; Metall glänzt nach
dichte/härte; beide aus Tags, nicht gemalt.

### Ω-O9 — Blatt-Shading (der weiß-ausbrennende Quad, gefixt)

**GEMESSEN-Anker:** das Laub-Material (laub) + die Foliage-Cards (Ω-G3 des
Giganten).

```
Das Blatt-Quad brennt weiß aus = Beleuchtungs-/Normal-Bug: die flache Card
  bekommt vollen Direktlicht-Specular. Fix:
  - Transluzenz aus laub: Licht scheint durch (Subsurface-artiger Term),
    das Blatt leuchtet weich statt auszubrennen.
  - Normal Richtung Krone gebogen (normalBend, im Plan §3.4) → schattiert
    wie eine Krone, nicht wie eine senkrechte Platte.
  - Kein Specular auf Laub (matt), leichte Farbvariation aus lebendig.
```

**BEWEIS Ω-O9:** Laub leuchtet weich im Gegenlicht statt weiß auszubrennen;
es schattiert wie eine Krone; kein Plastik-Glanz. Der Bug ist weg.

\---

## §7 — SÄULE IV: DIE LAWFUL FORM (Grammatik heilt den Kugel-Bug)

### Ω-O10 — Büsche als Skeleton-Grammatik

**GEMESSEN-Anker:** `\_growTreeBlueprintRich` (die Grammatik) + die Legacy-
Büsche (Kugel-Haufen).

```
Ein Busch ist eine Grammatik-Instanz mit Busch-Parametern: niedrig, breit,
  kein dominanter Stamm, dichte kleine Zweige (mehr L1/L2-Äste, kurz), Laub
  tief + dicht. SPECIES\_GRAMMAR um Busch-Arten erweitern (z.B. strauch\_\*).
  Der Kugel-Bug verschwindet, weil die Büsche denselben Weg gehen wie die Bäume
  — Multi-Level-Äste + Laub an Spitzen statt Kugeln.
```

**BEWEIS Ω-O10:** ein Busch liest als Busch (dichte verzweigte Form), nicht als
Kugel-Haufen; verschiedene Busch-Arten distinkt; dieselbe Grammatik wie Bäume.

### Ω-O11 — Understory-Vielfalt (Farne, Blumen)

**GEMESSEN-Anker:** der GPU-Scatter (Schicht 2) + die Grammatik.

```
Die mittlere Scatter-Schicht (Ω-S2 Schicht 2 des Giganten) füllt sich: Farne
  (Grammatik mit Farn-Params), Blumen (kleine farbige Varianten), gated auf
  lebendig + Schatten (unter Kronen). Der Boden zwischen Bäumen wird lebendig.
```

**BEWEIS Ω-O11:** der Waldboden zwischen Bäumen trägt Farne + Blumen, nicht
leere Fläche; 5 Höhen-Schichten wie LAAS (Boden→Gras→Farn→Busch→Baum).

\---

## §8 — SÄULE V: DIE LAWFUL ATMOSPHÄRE (die letzte Schicht)

> Himmel, Licht, Dunst — die Schicht, die alles zusammenbindet. Teils existiert
> schon (SunSky-artiger Himmel). Vertieft als Feld-Auslesewert.

### Ω-O12 — Himmel + Licht (zeit-getrieben)

**GEMESSEN-Anker:** der existierende Himmel + die Tageszeit (Zeit 21:15 im HUD).

```
Himmel-Gradient + Sonnen-Farbe aus der Tageszeit (golden zur Dämmerung, blau
  am Tag) — der goldene Himmel im Screenshot ist schon da, vertieft mit
  Sonnen-Position + Streulicht. Das Direktlicht färbt die Szene (warme
  Dämmerung → warmer Boden).
```

**BEWEIS Ω-O12:** der Himmel + das Licht folgen der Tageszeit kohärent; die
Szene ist in Dämmerungs-Licht warm getönt, am Tag neutral.

### Ω-O13 — Dunst + Tiefe (Distanz als Feld)

**GEMESSEN-Anker:** der existierende Fog (fogDistance im Atmosphäre-Slider).

```
Distanz-Dunst (atmosphärische Perspektive): ferne Hügel verblassen in den
  Himmel-Ton → Tiefe, Maßstab. Stärker bei feuchtem Wetter. Das macht den
  fernen Wald (Canopy-Shell) Teil einer atmosphärischen Tiefe statt einer
  flachen Wand.
```

**BEWEIS Ω-O13:** ferne Hügel verblassen atmosphärisch in den Himmel; die Welt
hat Tiefe + Maßstab; der ferne Canopy-Wald sitzt in Dunst, nicht als flache Wand.

\---

## §8.5 — SÄULE VI: DIE GEOMETRIE-FEINHEIT (was die FORMEN von LAAS lernen)

> Die Säulen I-V machen die Oberfläche lawful. Aber deine Frage trifft eine
> eigene Achse: lernen die GEOMETRIEN — die Äste, die Blätter, die Fels-
> Mikrostruktur — die Feinheit von LAAS? Die Oberfläche kann perfekt sein und
> die FORM trotzdem grob. Hier die ehrliche Geometrie-Achse — und ihre Decke.

### DIE EHRLICHE DECKE ZUERST

LAAS ist eine STATISCHE Demo: 6,8 Mio Dreiecke in EINER Ansicht, hochpoly
Fels-Meshes, hochdetaillierte Blatt-Cards — sie kann sich das leisten, weil
nichts lebt, nichts mutiert, kein Peer synchronisiert. AnazhRealm ist eine
LEBENDIGE, mutierbare, browser-basierte P2P-Welt bei 90-120 FPS. **LAAS' rohe
Poly-Zahl zu treffen ist unmöglich — und es ist nicht das Ziel.**

Das Ziel ist, was die Baum-Skeleton-Grammatik schon richtig macht: **LAAS'
PARAMETER lernen, nicht seine Dreiecke zählen.** LAAS' Schönheit liegt nicht in
6,8 Mio Tris — sie liegt in den richtigen Proportionen, Krümmungen, Dichten.
Die lawful/prozedurale Form (eine Fels-Grammatik wie die Baum-Grammatik) holt
diesen Reichtum aus REGELN — billig, instanzierbar, mit dem Varianten-Pool +
LOD, den du gebaut hast. Das ist die richtige Antwort auf die Decke, und sie
passt zur Seele: Reichtum aus Gesetz, nicht aus schweren toten Meshes.

### Ω-O14 — Blatt-Geometrie (Quad → blatt-geformte Card)

**GEMESSEN-Anker:** die Foliage-Cards (heute flache Quads — die „Quadrate")

- die LAAS-Leaf-Parameter (Gigant-Plan §3.4, spezifiziert aber nie gebaut).

```
Heute: flaches Quad → liest als weißes Rechteck (mit Ω-O9 wenigstens richtig
  schattiert, aber immer noch rechteckig).
LAAS-Parameter (reference-first): len/width (Seitenverhältnis), shapePow
  (Spitze: gerundet vs. spitz), fold (Mittel-Vene-Knick → 3D statt platt),
  curl (leichte Krümmung), Cluster (3-5 Blätter pro Card-Büschel, gefächert).
Die Blatt-Card wird blatt-FÖRMIG: eine getaperte, gefaltete, leicht gekrümmte
  kleine Geometrie, geclustert. Ergänzt Ω-O9 (Form + Shading zusammen).
```

**BEWEIS Ω-O14:** ein Blatt liest als Blatt — getapert, gefaltet, geclustert —
nicht als Quadrat. Verschiedene Arten distinkt (Nadel vs. Breitblatt).

### Ω-O15 — Fels-Mikrostruktur-Grammatik (Primitiv → lawful Fels)

**GEMESSEN-Anker:** `stein\_block` (heute Box-Parts, `steinBlockParts` Z. 48416)

- die Material-Tags (härte) + Γ-M.

```
Heute: stein\_block = primitive Box. Keine Mikrostruktur.
Lawful Fels-Grammatik (wie die Baum-Grammatik): ein Fels ist ein verrauschtes/
  verschobenes Polyeder (Ikosaeder-Basis + Noise-Displacement → Facetten,
  Risse, Kanten). Parameter aus härte: hart → scharfe Facetten/Kanten; weich →
  gerundet, verwittert. Größe + Angularität aus Tags. Klippen = größere
  verschobene Flächen, die dem Terrain folgen (cliff-dressed).
Dieselbe prozedurale Philosophie: die Fels-Form emergiert aus Tags + Noise,
  nicht aus einem authored Mesh. Varianten-Pool + LOD wie bei den Bäumen.
```

**BEWEIS Ω-O15:** ein Fels hat Facetten, Kanten, Mikrostruktur, die aus härte
emergieren — harter Fels scharfkantig, weicher gerundet; nicht eine glatte Box.
Klippen sind angekleidet, nicht flache Wände.

### Ω-O16 — Ast- + Laub-Fidelitäts-Tuning (Grammatik gegen LAAS kalibrieren)

**GEMESSEN-Anker:** `SPECIES\_GRAMMAR` (existiert) + die LAAS-Baum-Parameter.

```
Die Grammatik existiert (75-81 Parts), aber die Bäume lesen dünn/spitz. Das ist
  kein neues System — es ist PARAMETER-KALIBRIERUNG, reference-first:
  - Ast-Zahl pro Level (LAAS: dichter), Ast-Winkel-Verteilung
  - Taper-Kurve (Verjüngung Stamm→Spitze), Droop (Hänge-Bogen)
  - Laub-Dichte pro Anchor (LAAS: hunderte Cluster, voller)
  - Tropismus/Wander-Stärke (organische Krümmung)
Die SPECIES\_GRAMMAR-Werte gegen die LAAS-Referenz-Bäume (phase-4/hero-beech,
  hero-spruce, conifers) abstimmen, bis die Silhouette stimmt.
```

**BEWEIS Ω-O16:** ein Baum liest voll + organisch wie ein LAAS-Referenz-Baum
(hero-beech/spruce), nicht dünn/spitz. Die Krone ist dicht, die Äste
gestaffelt, die Verjüngung natürlich.

### DIE GEOMETRIE-ACHSE — EHRLICH EINGEORDNET

```
Form           HEUTE                    Ω-OPSIS-Welle      LAAS-Niveau erreichbar?
─────────────────────────────────────────────────────────────────────────────
Baum-Äste      Grammatik (75-81 Parts)  Ω-O16 (Tuning)     ja, via Parameter
Blätter        flaches Quad             Ω-O14 (Form)       nah, via Leaf-Params
Fels           Primitiv-Box             Ω-O15 (Grammatik)  nah, via Noise-Grammatik
Büsche         Kugel-Haufen             Ω-O10 (Grammatik)  ja, via Grammatik
Gras           Kegel                    Ω-O4 (Klingen)     ja, via Klingen-Geo
Rohe Tris      \~10⁴-10⁵                 LOD + Instancing   NEIN (6,8M unmöglich
                                                            in lebender Welt)
```

Die ehrliche Wahrheit: mit Ω-O14-O16 lernen die FORMEN LAAS' Parameter, und das
Ergebnis kommt LAAS NAH — aber nicht zur pixel-identischen 6,8-Mio-Tris-Decke,
und das soll es nicht. Es wird eine lebende Welt, die so reich ist, wie Regeln +
Browser-Performance erlauben, mit LAAS als Proportions-Referenz. Das ist die
ehrliche 100% für AnazhRealms Natur — nicht die unmögliche 100% einer toten Demo.

\---

## §9 — DIE REIHENFOLGE + S-GATES (größter Hebel zuerst)

```
S-GATE 0  Material-Pfad-Entscheid: Toon vertieft ODER zu PBR (Ω-PHYSIS §10).
          Beide lawful — aber Terrain + Vegetation MITeinander (Voxel-Kohärenz).
        ▼
Ω-O1 Multi-Klassen-Boden     ──┐ SÄULE I — der größte Hebel (meiste Fläche)
Ω-O2 Drainage-Feuchte          │ 3-5 Sitzungen
Ω-O3 Nah-Detail               ──┘
        ▼  \[S-GATE 1: erzählt der Boden seine Geologie + Hydrologie?]
Ω-O4 Gras als Klingen        ──┐ SÄULE II — die Bodendeckung
Ω-O5 Kiesel + Felsen           │ 3-4 Sitzungen
Ω-O6 Pfade                    ──┘
        ▼  \[S-GATE 2: wächst Gras wo es soll, liegen Steine wo Fels durchbricht?]
Ω-O7 Rinde + Holz            ──┐ SÄULE III — die Materialien
Ω-O8 Fels + Metall             │ 3-4 Sitzungen
Ω-O9 Blatt-Shading-Fix        ──┘
        ▼  \[S-GATE 3: erzählt jede Oberfläche ihre Tags? Blatt-Bug weg?]
Ω-O10 Büsche als Grammatik   ──┐ SÄULE IV — die Form
Ω-O11 Understory-Vielfalt     ──┘ 2-3 Sitzungen
        ▼  \[S-GATE 4: kein Kugel-Busch mehr, 5 Höhen-Schichten?]
Ω-O12 Himmel + Licht         ──┐ SÄULE V — die Atmosphäre
Ω-O13 Dunst + Tiefe           ──┘ 2-3 Sitzungen
        ▼  \[S-GATE 5: Atmosphäre + Tiefe kohärent?]
Ω-O14 Blatt-Geometrie        ──┐ SÄULE VI — die Geometrie-Feinheit
Ω-O15 Fels-Mikrostruktur       │ (was die Formen von LAAS lernen)
Ω-O16 Ast-Fidelitäts-Tuning   ──┘ 3-5 Sitzungen
        ▼  \[S-GATE 6: lesen Blatt/Fels/Ast wie LAAS-Referenz (Parameter, nicht Tris)?]
```

**Gesamt: 16-24 Sitzungen für die volle visuelle + geometrische Tiefe.**

**Der wichtigste Hebel zuerst:** Säule I (der Boden). Er ist das meiste des
Bildschirms; ihn vom flachen Rot zum geologischen Auslesewert zu machen ist
der größte einzelne Sprung — größer als jede Baum-Welle. Wenn du nur eine
Säule baust, bau diese.

**Die Meilensteine:**

```
Nach Säule I:   der Boden erzählt die Welt — Fels am Hang, Moos in der Senke,
                Pfad-Feuchte. Der größte sichtbare Sprung.
Nach Säule II:  dichter Bewuchs — Gras, Kiesel, Pfade. Die Welt ist bedeckt.
Nach Säule III: jede Oberfläche erzählt ihr Material. Die Blatt-Quads geheilt.
Nach Säule IV:  kein Kugel-Busch; 5 Höhen-Schichten wie LAAS.
Nach Säule V:   Atmosphäre + Tiefe. Die Welt ist ganz.
```

\---

## §10 — VERBOTENE REFLEXE

1. **"Lade Texturen herunter wie LAAS."** Das ist die gemalte Leiche — tote,
   wiederholende Assets, die nichts von der Welt wissen. Jede Oberfläche ist
   ein prozeduraler Auslesewert der Felder + Tags. Keine Bitmap-Albedo.
2. **"Wähle eine Ästhetik (LAAS oder stilisiert)."** Mein eigenes Ausweichen.
   Die Ästhetik ist keine Wahl — sie emergiert aus den Regeln, wie alles in
   AnazhRealm. Keine gewählte Oberfläche; nur gewachsene Wahrheit.
3. **"Bäume verbessern für mehr Schönheit."** Bäume sind \~10% des Bildschirms.
   Der BODEN ist der größte Hebel (Säule I zuerst). Den größten Anteil zuletzt
   anzufassen ist der Reflex, der die Welt bei 10% hält.
4. **"Per-Vertex-Color reicht für den Boden."** Zu grob — die Γ-M-Arbeit ist
   da, aber per-Vertex sieht man Dreiecke, kein Detail. Per-Fragment-Material
   (Ω-O1) ist der Sprung.
5. **"Gras-Kegel sind gut genug."** Kegel sind keine Klingen. Echte Klingen-
   Geometrie + Feld-Dichte (Ω-O4), via die Scatter-Maschine, die schon da ist.
6. **"Pfade per Hand malen."** Ein gemalter Pfad ist eine Lüge. Der Pfad
   emergiert aus dem Drainage-Netz + Konnektivität — wo die Welt abgenutzt
   wurde (Ω-O6). Lawful, nicht gemalt.
7. **"Die Felder existieren, also sieht man sie."** Nein — sie existieren, aber
   sind nicht ins Material verdrahtet. Das unsichtbare Kugel-Problem der
   Oberfläche: der Stoff da, das Gesetz ungelesen. Verdrahten, nicht annehmen.

\---

## §11 — DIE BEWEIS-BÄNDER (inkl. das Anblick-Band)

**Säule I — Boden-Band:** der Boden erzählt Geologie (Fels am Hang) +
Hydrologie (feucht am Wasser); smooth gemischt; Nah-Detail. Flache Farbe →
nicht gelandet.

**Säule II — Bewuchs-Band:** Gras-Klingen wo lawful, Kiesel wo Fels durchbricht,
Pfade wo abgenutzt; alles feld-getrieben. Gleichmäßiger Teppich oder gemalter
Pfad → nicht gelandet.

**⟡ DAS ANBLICK-BAND (das wichtigste):** jede Oberfläche ist nachweislich aus
den Welt-Feldern + Material-Tags ABLEITBAR — kein gemaltes Asset, keine
gewählte Ästhetik. Der Boden zeigt seine Geologie, das Gras wächst wo es soll,
die Rinde erzählt ihr Holz. **Wenn eine Oberfläche gemalt ist statt gelesen —
wenn sie nichts von der Welt weiß, sich wiederholt, lügt — dann ist es LAAS'
Totheit, und das Anti-Attrappe-Gesetz ist gebrochen. Dieses Band ist die Seele
des Anblicks.**

**Säule III — Material-Band:** jede Oberfläche erzählt ihre Tags (Rinde aus
holz, Fels aus härte); die Blatt-Quads geheilt (Transluzenz statt Ausbrennen).
Flache Farbe oder weiße Quads → nicht gelandet.

**Säule IV — Form-Band:** kein Kugel-Busch; Büsche per Grammatik; 5 Höhen-
Schichten. Kugel-Haufen → nicht gelandet.

**Säule V — Atmosphäre-Band:** Himmel + Licht zeit-kohärent; ferne Hügel
verblassen atmosphärisch. Flacher Himmel oder harte Distanz → nicht gelandet.

\---

## §12 — LETZTES WORT

Der Screenshot sagte die Wahrheit: visuell war die Welt bei 10%, weil der
Lebendige Gigant nur die Bäume heilte — eine Schicht von vielen. Dieser Plan
ist die 100%: der Boden, das Gras, die Kiesel, die Pfade, die Materialien, die
Büsche, die Atmosphäre — der ganze sichtbare Stapel.

Und er folgt deinem Prinzip, nicht meinem Ausweichen. Die Frage war nie „wie
LAAS oder stilisiert". Die Ästhetik emergiert aus den Regeln, wie alles in
AnazhRealm. Das eine Gesetz: jede Oberfläche ist ein gesetzmäßiger Auslesewert
der Welt-Wahrheit — Felder, Tags, Physik — prozedural, nicht gemalt. LAAS malt
Schönheit auf tote Assets. AnazhRealm lässt sie aus der Wahrheit wachsen: der
Boden zeigt seine Geologie, das Gras wächst wo es soll, der Pfad ist wo die
Welt sich abnutzte, die Rinde erzählt ihr Holz. Das ist die visuelle Hälfte
desselben Prinzips wie das Stehen (Ω-PHYSIS) und das Werden (Ω-CHRONOS).

Fast nichts muss erfunden werden — die Felder, das Drainage-Netz, Γ-M, das
Gras, der GPU-Scatter, die Grammatik sind alle schon da. Es muss verdrahtet
werden: die Wahrheit der Welt in ihre sichtbare Oberfläche. Reference-first im
reinsten Sinn — die Wahrheit liegt bereit, wir lesen sie aus.

Bau den Boden zuerst (Säule I — der größte Hebel, das meiste des Bildschirms).
Dann den Bewuchs (Säule II). Dann die Materialien (Säule III). Dann die Form
(Säule IV). Dann die Atmosphäre (Säule V).

Dann ist die Welt nicht nur wahr, lebendig und werdend — sie ist _sichtbar_
wahr. Jeder Pixel erzählt, was die Welt IST. Das ist die 100%, und es ist mehr
als LAAS: ein gewachsener Organismus, kein gemalter Leichnam.
