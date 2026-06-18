# DER KÖRPER — DIE GEMESSENE NEUANLAGE (Plan, 18.06.2026)

> **Einmal detailliert planen — was & wie — dann umsetzen, rendern, kontrollieren, bei Bedarf
> erneut.** (Schöpfer-Auftrag.) Kein blindes Iterieren mehr, kein Augen-Tunen Beschwerde für
> Beschwerde. Die Grundwahrheit liegt in `referenz/` (verankert 18.06.). Dieser Plan definiert pro
> Teilsystem das Vorgehen, bevor eine Zeile geändert wird.

## §0 · Die Lehre, die diesen Plan erzwingt

Der Körper scheiterte **nicht am Metaball-Limit**, sondern an der Arbeitsweise: generische
Ellipsoide an *geratenen* Koordinaten, ohne Grundwahrheit, commit-für-commit nachgetunt („auf Sand
bauen"). Der Beweis liegt im Bild (`artifacts/ecorche-*.png`): der Rumpf ist ein Krater-Knäuel, weil
~211 Teile mit zu scharfem `kScale` kollidieren; die Hände sind Klauen. Tempel & Bäume funktionieren,
weil ihre Struktur die *Formel* ist. Der Körper bekommt jetzt dieselbe Disziplin.

## §1 · Die Maschinerie (verdichtete Ist-Analyse)

Pipeline: `_humanoidLandmarks` (Gelenk-Koords, EINE Quelle) → `_humanoidSkeleton` (Part-Liste:
Knochen + Muskel + Fleisch) → `_buildCreatureSkinGeometry` (Parts → SDF-Metaball-Iso-Fläche) →
`_buildHumanoidRig` (Geometrie + Bones → SkinnedMesh) → `_animateHumanoidRig`.

Drei Befunde, die den Umbau sicher + gezielt machen:

1. **Das Skinning ist RÄUMLICH** (`_buildHumanoidRig` Z. 16241–16301): jeder Vertex bindet an die 4
   nächsten *Bone-Segmente*, nicht an eine Part→Bone-Tabelle. → **Jede Muskel-Änderung in
   `_humanoidSkeleton` ist rig-sicher** (kein Mapping nachzupflegen).
2. **Das Muskel-Gesetz existiert schon:** `musk(ax,ay,az, bx,by,bz, bulge, opts)` (Z. 14938) spannt
   eine Spindel zwischen ZWEI benannten Landmarken (`def:true` + `kScale`). Der **MUSKEL-ATLAS**
   (`MUSC`-Tabelle Z. 15290–15346, 33 Einträge × 2 Seiten = 66 Teile) nutzt ihn bereits sauber.
   → Der Atlas ist die RICHTIGE Form; er wird *erweitert/korrigiert*, nicht ersetzt.
3. **Die Sünde sind die Magie-Koordinaten-Teile** (feste Zahlen, nicht via Landmark): Rumpf-Skelett
   (Rippen-Loop, Wirbelsäule, Brustkorb-Ovoid, Sternum, Bauch, Gesäß), Rectus/Obliques/Serratus/
   Erector-Loops, der **ganze Kopf-Cluster + Gesicht**, und der **innere Hand-/Fuß-Bau**.

Die Blend-Hebel (`_buildCreatureSkinGeometry`): `k = max(kFloor, min(kMax, …)·kScale·matK)` mit
`kFloor=0.04` (darunter REISST die Haut → Krater), `kMax=0.12`, `matK=0.66` für Knochen. `displace`
(Avatar an) setzt `def`-Muskeln als smoothstep-Tropfen statt Union-Bälle. `seamGroove` schnitzt die
Muskel-Furche analytisch. AO aus Konkavität. Avatar-Iso: `res 120, taubin 3, displace:true,
seamGroove 13, creaseSharpen/Mix 0` (Z. 16188).

## §2 · DAS GESETZ DER NEUANLAGE (das universelle „WIE" — gilt für JEDE Region)

1. **Jeder Muskel = `musk()` zwischen zwei benannten Landmarken** (Ursprung→Ansatz). Keine
   Magie-Box/-Ei mehr. Fehlt eine Landmarke, kommt sie in `_humanoidLandmarks` (die EINE Quelle,
   gelesen von Haut UND Bones) — nie hartkodiert in `_humanoidSkeleton`.
2. **Die FORM folgt der Referenz, nicht dem Gefühl:**
   - *Fächer* (Pec/Deltoid/Trapez/Lat) = mehrere Spindeln, die einen Ursprung teilen und zu
     verteilten Ansätzen *auffächern* (echter Fächer, keine Scheibe).
   - *Strang* (SCM/Sartorius) = eine dünne Spindel.
   - *Blatt* (Gesicht/Obliques) = dünne, breite Masse (kleine z-Tiefe).
   - *Fusiform* (Bizeps/Gastrocnemius) = ein Bauch, der zu Sehnen tapert.
3. **Blend KONSISTENT:** eine Muskel-Gruppe teilt ein `kScale`-Band; NICHT viele tight-`kScale`-Teile
   an einem Ort stapeln (die Krater-Ursache). Teile-Zahl senken, wo Kollisionen das Feld zerkratern.
4. **Knochen zeigt sich NUR, wo die Referenz ihn zeigt:** Hände/Füße = blanker Knochen-Fächer,
   Schädel-Kuppe oben blank; sonst deckt Muskel (der COVERAGE-Pass schrumpft `struct`-Knochen tief
   ins Fleisch).
5. **MESSEN (die Abnahme):** pro Region `ecorche skel` (Struktur) + `ecorche smooth` (Haut) an der
   Regions-Ansicht rendern, **neben das passende `referenz/`-Bild legen**, die Abweichung benennen.
   Abnahme = Struktur trifft die Referenz-Formen UND `smooth` hat KEINE Krater/Löcher.

## §3 · Die Reihenfolge + pro Teilsystem der Plan

Reihenfolge-Logik: erst das Gerüst (Proportionen), dann die klar kaputten, abgegrenzten Stücke
(Hand/Fuß), dann die großen Silhouette-Träger (Rumpf/Rücken/Arm/Bein), zuletzt Hals/Kopf.

### T0 — PROPORTIONS-GERÜST (Landmarks + Rumpf-Skelett)
- **Referenz:** `anatomie-front` + `anatomie-seite`: 8-Kopf, Schulter ~2 KH, Wirbelsäulen-S-Kurve,
  Brustkorb-Tiefe, Becken-Neigung.
- **Ist:** Proportionen grob ok, ABER Rippen/Wirbel/Brustkorb/Sternum sind feste Magie-y.
- **Was:** die Skelett-Stationen aus Landmarken ableiten (eine `ribcage`/`spineLumbar/Thoracic/
  Cervical`-Landmarken-Familie in `_humanoidLandmarks`), die S-Kurve gegen `anatomie-seite` setzen.
- **Wie:** Landmarken hinzufügen → Rumpf-Skelett-`add()` darauf umstellen → COVERAGE prüfen.
- **Messen:** `side` + `front` skel; Abnahme = Profil-S-Kurve + Brust-Tiefe treffen die Referenz.

### T1 — HÄNDE
- **Referenz:** `anatomie-detail-oberkoerper` (unten rechts): blanker **Knochen-Fächer** — Karpus-Block
  + 5 Mittelhand-Strahlen + Phalangen, Handgelenk-Retinaculum-Band, Unterarm-Sehnen laufen ein.
- **Ist:** „skelettierte Klauen" (Z. 15186–15202) — richtige Kategorie (Knochen), hässliche Form.
- **Was:** sauberer Karpus (ein Block) → fächernde Metakarpalen (leicht gespreizt) → kurze Phalangen;
  Retinaculum als schmales Band; die Unterarm-Flexor/Extensor-Sehnen als dünne `limb` zum Karpus.
- **Wie:** `hand`/`wrist`-Landmarken + neue `carpus`/`knuckle[t]`-Knoten; den Innenbau auf sie stellen.
- **Messen:** `arm`-Ansicht skel neben Referenz; Abnahme = lesbarer Knochen-Fächer, keine Klaue.

### T2 — FÜSSE
- **Referenz:** `anatomie-detail-ruecken-bein` (unten links): Talus/Calcaneus + Mittelfuß-Strahlen +
  Phalangen, Knöchel-Retinaculum, Achilles/Tibialis-Sehnen.
- **Ist:** fester Strahlen-Loop (Z. 15263–15282), bulböse Knochen-Klumpen.
- **Was:** Calcaneus (Ferse, hinten) + Talus (Knöchel) + gewölbter Mittelfuß-Fächer + flache Zehen;
  Retinaculum-Band; Achilles-Sehne (Gastrocnemius→Calcaneus).
- **Wie:** `heel`/`ankle`/`foot`-Landmarken + `tarsus`/`toe[t]`; den Fuß auf sie stellen.
- **Messen:** `foot`-Ansicht skel neben Referenz; Abnahme = gewölbter Knochen-Fuß, keine Wolke.

### T3 — RUMPF-FRONT (der schlimmste Bereich)
- **Referenz:** `anatomie-detail-oberkoerper` (unten links) + `front`: Pec = zwei gefächerte Schilde;
  Rectus = Sixpack mit Linea-alba-Mittelrinne + queren Sehnen-Furchen; Obliques tapern zur Adonis-V;
  Serratus = schräge Finger-Slips.
- **Ist:** Krater-Knäuel — Rectus 8 Magie-Boxen + Obliques 2 + Serratus 6 + Erector 2, kollidieren.
- **Was:** Pec-Fächer im Atlas schärfen (3 Köpfe, klavikulär/sternal/kostal, spreizen zu `pecIns`);
  Rectus auf ZWEI saubere Säulen reduzieren (Xiphoid→Pubis), die **Sehnen-Furchen via `seamGroove`**
  schnitzen (statt 8 kollidierende Boxen); Obliques als Blatt (Rippen→`iliac`, Adonis-V-Taper);
  Serratus als 3 dünne diagonale Slips (`musk`, Rippen→Skapula-Region).
- **Wie:** Magie-Boxen durch landmark-abgeleitete `musk()` ersetzen, Teile-Zahl senken, ein
  konsistentes `kScale`-Band, `seamGroove` trägt die Definition.
- **Messen:** `torso` + `front` skel & smooth neben Referenz; Abnahme = lesbares Sixpack + Pec-Fächer,
  KEINE Krater.

### T4 — RÜCKEN
- **Referenz:** `anatomie-detail-ruecken-bein` (oben rechts): Trapez-Diamant (Schädel/C7→Akromion +
  →Mitte-Rücken), Lat-V (Becken/Lendenfaszie→Achsel), Erector-Mittelrinne.
- **Ist:** Lat/Trapez/Erector im Atlas vorhanden, aber Erector zusätzlich als Magie-Boxen.
- **Was:** Trapez als Diamant-Fächer schärfen; Lat als breites V-Blatt (`iliacBack`→`axilla`); Erector
  als zwei Säulen mit **Mittelrinne via `seamGroove`** (Sacrum→`erectorTop`).
- **Wie:** Atlas-Einträge schärfen, Magie-Erector entfernen, seamGroove für die Wirbel-Furche.
- **Messen:** `back` skel & smooth neben Referenz; Abnahme = Diamant + V + Rinne lesbar.

### T5 — SCHULTER + ARM
- **Referenz:** `anatomie-detail-oberkoerper` (oben rechts): Deltoid-Kappe (3 Köpfe), Bizeps/Trizeps
  fusiform, Unterarm-Bündel tapert zum Handgelenk.
- **Ist:** Deltoid/Bizeps/Trizeps im Atlas (gut), Form-Schliff nötig.
- **Was:** Deltoid als saubere 3-Kopf-Kappe (Akromion→`deltoidIns`, fächernd); Bizeps/Trizeps-Bäuche
  voller + taper; Unterarm-Flexor/Extensor als zwei Bündel zum Handgelenk.
- **Wie:** Atlas-Bulge/belly/kScale gegen die Referenz justieren (gemessen, nicht geraten).
- **Messen:** `arm` skel & smooth neben Referenz; Abnahme = Deltoid-Kappe + Arm-Trennung lesbar.

### T6 — BEINE
- **Referenz:** `anatomie-front` + `anatomie-detail-ruecken-bein` (oben/unten links): Quad mit
  Vastus-med/lat-Tropfen, Hamstring, Gluteus, Gastrocnemius (2 Köpfe)→Achilles, Adduktor.
- **Ist:** im Atlas vorhanden + Vollkachelung; Form/Volumen-Schliff nötig.
- **Was:** Quad-Gruppe (Rectus femoris + Vastus med/lat-Tropfen), Hamstring (`ischium`→`kneeBack`),
  Gluteus voller, Gastrocnemius 2 Köpfe→Achilles-Sehne, Adduktor (`pubis`→`thighInner`).
- **Wie:** Atlas justieren; Vastus-med-Tropfen am inneren Knie (`kneeIn`) betonen.
- **Messen:** `front` + `side` skel & smooth neben Referenz; Abnahme = Bein-Muskel-Trennung lesbar.

### T7 — HALS + KOPF/GESICHT
- **Referenz:** `anatomie-detail-oberkoerper` (oben links) + `anatomie-detail-ruecken-bein` (unten
  rechts): Schädel-Kuppe oben blank, Gesichtsmuskeln als dünne Blätter (Frontalis/Temporalis/Masseter/
  Orbicularis), SCM-Strang (Mastoid→Sternum), Trapez an den Schädel.
- **Ist:** Magie-Kopf-Cluster + 4 Gesichts-Boxen; rote Augen-/Ohr-Partie liest „wund".
- **Was:** EIN sauberes Schädel-Ovoid (Scheitel+Occiput, oben blank), Kiefer/Jochbein landmark-fest;
  Gesichtsmuskeln als dünne `def`-Blätter (kleine z-Tiefe, Augen-Partie FREI → kein rotes Leck);
  SCM + Trapez-Joch sauber an den Schädel.
- **Wie:** Kopf-Cluster auf `head`/`mastoid`/`cheek`/`jawAngle`-Landmarken stellen; Gesichts-Blätter
  dünn + augen-frei; Rim-Leck (CLAUDE.md: warm-rim leckt rot in Spalten) durch breiteres kScale dort.
- **Messen:** `head` + `front` skel & smooth neben Referenz; Abnahme = ruhiges Gesicht, kein Wund-Look.

## §4 · Die Mess-Schleife (konkret, pro Region)

```
node scripts/diag-werk-render.cjs ecorche skel     # die rohe Struktur (alle Ansichten)
node scripts/diag-werk-render.cjs ecorche smooth   # die Haut-Iso (Krater-Test)
```
→ `artifacts/ecorche-<view>.png` neben `referenz/<passend>.webp` legen, Abweichung benennen, fixen,
neu rendern, bis Abnahme. Dann `npm run playtest:fast` (Rig baut), **ein Commit pro Region** mit den
Render-Artefakten als Beweis. Voller `npm run playtest` vor dem Merge.

## §5 · Die Wände (Risiken)

- `kFloor 0.04` ist der Boden — darunter reißt die Haut (Krater). Definition kommt aus `seamGroove` +
  Massen-Trennung, NICHT aus tighterem k.
- Skinning ist räumlich → rig-sicher, aber Teile in der Körper-AABB halten (COVERAGE-Pass).
- `_humanoidSkeleton` ist für den Avatar **tag-neutral** (die Affinitäts-Tags liegen in der separaten
  Soul-`bodyParts`-Liste) — die Neuanlage ändert keine Spawn-Affinität.
- EINE Quelle: neue Landmarken in `_humanoidLandmarks`, gelesen von Haut UND Rig.
- Nach jeder Region `playtest:fast`; das volle Gate vor dem Merge.

## §6 · Was NICHT in diesem Bogen liegt (Saat, bewusst vertagt)

Motion-Konvergenz (`_animateCompoundMotion` ↔ Rig), die getragene `_buildHumanGroup`/`_animateHuman`-
Parallel-Pfad-Vereinheitlichung, die Kreatur-Körper (teilen `_buildCreatureSkinGeometry`, profitieren
aber separat). Hier: NUR der humanoide Anblick gegen die Referenz.
