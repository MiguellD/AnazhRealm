# DER WAHRE ANBLICK — der Plan, der HÄLT

> Geschrieben neu am 15.06.2026 nach dem Schöpfer-Auftrag: _„Reflektiere zuerst,
> über die letzten Branches — verstehst du das Ziel, wo wir hin wollen, den Drift,
> der immer passiert? Aktualisiere die Planung, dass sie HÄLT, und wir dem Ziel
> endlich näher kommen, es erreichen — Synergie, Tiefe und Ordnung, effizient."_
>
> Dieser Plan ersetzt die alte „offene Punkte"-Liste. Er ist nach EINEM Prinzip
> gebaut: **er soll den Drift verhindern, der drei Sessions hintereinander am
> ANFANG gestrandet ist.** Lies §0 ZUERST — jedes Mal.

---

## §0 — DAS ZIEL · DER DRIFT · DIE WÄNDE (lies das ZUERST, jedes Mal)

### Das ZIEL (der wahre Norden, `docs/das-lebendige-feld.md`)

Eine **lebendige, schöne, physik-basierte (PBR) Welt**, die SUBTIL mit Emotion
atmet — EIN Feld, von allen gelesen·geschrieben·gewertet, nie ein Pflaster-Pfad.
„PBR" ist die Regel-Form (Physik, kein Gefühl-Override). Das Aura-Feld TÖNT die
Welt, aber als **Hauch, nicht als Anstrich**. Synergie · Tiefe · Ordnung · Effizienz:
EINE Quelle, viele Leser.

### Der DRIFT (warum wir scheitern — benannt, damit er aufhört)

Drei Sessions sind am selben Ort gestrandet. Die Muster, GEMESSEN:

1. **Stranden am SEHEN.** Headless-WebGPU LÜGT: Präsentations-Flake (zeigt einen
   stale Frame), Unterwasser-Tönung, falsches Framing, Laub das in den Himmel
   verschwindet. Wer dem blind glaubt, jagt Geister. (Diese Session verlor ich
   damit, einen Metall-Turm als Baum-Stamm zu diagnostizieren.)
2. **Die zu starke AURA maskiert ALLES — die tiefste Wurzel.** Am Spawn malte das
   Feld (glut 0.95 + awe 1.0 → der Nexus tönt awe→lila) den Himmel MAGENTA
   (`sky=[0.65,0.35,0.86]`). Jeder Screenshot sah „alien/kaputt" aus → niemand
   (ich eingeschlossen) konnte sagen, ob das RENDERING gut ist → Thrash, Phantom-
   Fixes, blinde „fertig"-Behauptungen. **Die zu starke Aura war eine URSACHE des
   Drifts.** → GEHEILT V18.236 (§1).
3. **„Fertig" behaupten ohne zu SEHEN.** Der V18.226–234-Bogen erklärte „alle 6
   Säulen fertig" headless-grün, während die Welt bei 10 % war.
4. **Über-werkzeugen, NULL liefern.** Eine ganze Session in Diagnose-Tooling, kein
   einziger Commit am echten Werk.
5. **Parallel-Pfade.** Fünf diag-Seh-Tools nebeneinander; toon + pbr nebeneinander.
   Die Heilige Lektion, missachtet.

### Die WÄNDE (verbindlich — jede Welle hält sie)

- **W1 — Erst die Aura/Atmosphäre NEUTRAL, dann urteilen.** Kein Render-Urteil,
  solange der Welt-Tint die Farbe vergiftet. (Jetzt by-default subtil; für Albedo-
  Tests `auraTintStrength=0` setzen.)
- **W2 — SEHEN heißt: EIN Objekt, sauber isoliert, ÜBER Wasser, neutrales Licht,
  GRAUER Hintergrund, exaktes Framing.** Sonst misst man den Hintergrund/Geister.
  Die objektiven Zahlen (Color-Attribut, Geometrie-Counts, Instanz-Zahl) sind die
  HARTE Wahrheit; das Schöpfer-Auge im Browser ist der LETZTE Richter.
- **W3 — VISUELLE Behauptung braucht ein BILD (mein geschärftes + dann deins).
  MECHANISCHE Behauptung braucht eine ZAHL (Test/Messung).** Nie „headless-grün =
  schön".
- **W4 — Zeitbox die Diagnose. Liefere committed, sichtbaren Wert pro Welle.**
  Wenn ich 30 min am Werkzeug bin ohne das Werk zu berühren → STOP, das ist Muster 4.
- **W5 — EINE Quelle. Kein Parallel-Pfad.** Verifiziert per Grep + Test, nicht
  behauptet.

---

## §1 — DIE AURA: SUBTIL ✅ GEBAUT (V18.236) — die Wurzel des „alles sieht falsch aus"

**Das Fundament: erst muss die Welt NATÜRLICH lesen, dann ist Rendering beurteilbar.**

- **EIN Knopf `atmosphere.auraTintStrength`** (Default 0.15) skaliert ALLE
  Feld+Emotion-Tint-Beiträge: Schicht 2 (glut/awe/lebendig) + Schicht 3
  (joy/sorrow/awe/chaos) in `_dayNightComputeTint`, UND der Mood/DSL-`skyTint`-Blend
  in `_dayNightApplySkybox` (der Nexus tönte awe→lila = die Magenta-Quelle).
- **GEMESSEN:** Himmel `[0.65,0.35,0.86]` (magenta) → `[0.19,0.21,0.61]` (BLAU). Der
  Browser-Shot zeigt jetzt einen blauen Himmel. Die Welt atmet noch (ein Hauch
  Wärme bei glut), aber sie vergiftet die Beurteilung nicht mehr.
- **GEMESSEN-Grenze:** die Basis-Mittag-Himmel-Farbe hat fast kein Rot (`r=0.07`) →
  sie ist rot-empfindlich; darum 0.15, nicht 0.3. Der Mensch kann den Knopf heben.
- **AKZEPTANZ:** ✅ blauer Himmel im Bild + der `auraTintStrength`-Knopf existiert +
  live-justierbar. (Schöpfer-Browser-Sign-off des Gesamt-Looks bleibt der letzte Schliff.)

---

## §2 — PBR die EINE WAHRHEIT, TOON RAUS (Schöpfer: „toon soll endlich raus")

`materialMode` ist schon Default `"pbr"` (V18.234) — die WELT rendert bereits PBR.
Toon ist nur noch ein toter Fallback-Pfad + ein Toggle. „Raus" = die Schuld tilgen.

- **W2.1 — PBR unbedingt machen.** Den `materialMode`-Toggle + den Toon-Zweig in
  `_buildToonNodeMaterial` entfernen; die Methode baut IMMER PBR (alle Hunderte
  Aufrufer bleiben unverändert — ein Stamm-Verdichtungs-Schnitt, kein Rename).
- **W2.2 — Den toten Toon-Code schneiden** (`MeshToonNodeMaterial`-Pfad,
  `_refreshToonGradient`/`_ensureStructureGradient`, `toonGradientMap`), NUR was
  VERIFIZIERT (Grep) nirgends sonst lebt. Die Saat-Disziplin (V17.20): schneide nur,
  was tiefer ersetzt wurde — PBR ist der tiefere Ersatz.
- **W2.3 — Die Tests mit-wandern** (V9.56-i): die ~6 toon-Source-Proben in
  `playtest.cjs` (`isMeshToonMaterial`, `gradientMap`, `_buildToonNodeMaterial.toString()`)
  auf den PBR-Pfad umstellen, NICHT den Toon-Marker künstlich erhalten.
- **AKZEPTANZ:** ein Grep beweist KEIN aktiver Toon-Render-Pfad mehr; alle ~3500
  Invarianten grün; der Look im Bild unverändert (PBR war schon Default).

---

## §3 — DAS SEH-WERKZEUG: EINES, zuverlässig (die §1-Lehren festgeschrieben)

Diese Session lehrte teuer, WIE man headless einen Baum sieht. Das gehört in EIN Tool.

- **Der EINE Verifier** (`diag-anblick.cjs`, die anderen vier — diag-sicht /
  -settled-view / -sichtbar / -krone — konsolidieren oder löschen, W5):
    - **Isoliert:** den ECHTEN Bauplan (`_archFlattenBlueprint` = die MERGED Geometrie
      mit eingebackenem Grün, NICHT `_buildTreeSkeletonLeaves`) als Plain-Meshes
      bauen, ÜBER Wasser (y≈500, sonst Unterwasser-Tönung), ALLES andere unsichtbar.
    - **Neutrales Licht:** weisse Sonne, NEUTRAL-graue Hemisphäre (die Standard-Hemi
      ist BLAU → wäscht Aufwärts-Laub blau), grauer Hintergrund (Laub gegen Himmel-Blau
      ist unsichtbar).
    - **Präsentation:** `renderAsync` auf das ECHTE `s.scene` (Plain-Szene-Tausch
      rendert headless LEER — die Krone-Tool-Sackgasse dieser Session).
    - **Zahlen + Bild:** Color-Attribut (grün?), bbox, foliageVerts, Instanz-Zahl,
      Dreiecke — inkrementell als Artefakt; PLUS der Bild-Shot.
- **AKZEPTANZ:** auf Befehl ein sauberer, zentrierter, neutral-beleuchteter EINZEL-
  Baum-Shot gegen Grau, der die Krone GRÜN + lush (oder nicht) zeigt — reproduzierbar.

---

## §4 — EINE BAUM-QUELLE (Kugeln raus, verifiziert)

Die alten **Kugel-Bauplane** (`baumEicheParts`…, registriert als `baum_eiche`/
`_kiefer`/`_buche`/`_tanne`) leben noch neben der `SPECIES_GRAMMAR`.

- **GEMESSEN:** gen≥4 spawnt sie NIE (V18.235); fresh = gen 8 → moderne Welten sind
  schon Kugel-frei. Der gen<4-Switch + die Bibliotheks-Sichtbarkeit bleiben.
- **W4.1 — Den gen<4-Legacy-Spawn-Switch + `_growTreeBlueprintLegacy` schneiden** →
  die Grammatik ist die EINZIGE Baum-Quelle für ALLE Gens.
- **W4.2 — Die Kugel-Bauplane aus dem Bibliotheks-Browser** (nie sichtbar; als reine
  Tag/Affinität-Fixtures dürfen sie als Daten bleiben, wenn ein Test sie braucht).
- **AKZEPTANZ:** ein Grep beweist EINE Spawn-Quelle (Grammatik); kein Kugel-Bauplan
  im Browser; ~3500 grün.

---

## §5 — LUSHE GRÜNE KRONEN (der dominante visuelle Hebel)

Mit §1 (Aura subtil) + §3 (echtes Sehen) ist DIES jetzt ehrlich beurteilbar.

- **W5.1 — Im §3-Tool MESSEN:** liest die Krone grün + lush (geschlossene Silhouette
  gegen die LAAS-Hero-Form) oder sparse/blass? Das Color-Attribut ist grün
  (`[0.19,0.51,0.14]`) — also ist die Frage DICHTE + Form, nicht Albedo.
- **W5.2 — Dichte/Form tunen** (`FOLIAGE_DENSITY.cardsPerAnchor`, MAX_FOLIAGE_PARTS,
  Ast-Zahl/Taper/Droop gegen die Referenz-Silhouette) bis EIN Baum nah als Baum liest.
- **AKZEPTANZ:** A/B Vorher/Nachher im §3-Tool + Schöpfer-Auge: lush grüne Krone.

---

## §6 — DICHTE (FPS UND Dichte — Engineering, kein Schnitt)

Caps zurück hoch (Understory 800→…), LOD/Impostoren, GPU-Compute-Scatter (pcg2d
bit-fertig). `docs/gigant-fortsetzung-plan.md` trägt die Mechanik. **AKZEPTANZ:**
sichtbar dicht (LAAS-Wald) UND FPS gehalten (§3-Last-Zähler + Schöpfer-GPU).

---

## §7 — OBERFLÄCHEN + STRUKTUREN-LICHT (jeder Ω-O im Bild bestätigt)

Das ANBLICK-BAND (jede Fläche ein sichtbarer Auslesewert) + zwei GEMESSENE Befunde:

- **Strukturen schwarz bei Mittag — GEMESSEN-Wurzel (15.06.):** ZWEI Ursachen.
  (a) **PBR-METALLE haben KEINE `scene.environment`** (grep: nirgends gesetzt) → ein
  Metall (Eisen-Turm, metalness 0.85) reflektiert NICHTS → render SCHWARZ (außer dem
  direkten Specular). Das ist der klassische PBR-ohne-IBL-Fehler. **Fix: eine Sky-
  Environment-Map** (PMREM/`computeEnvironmentAsync` des Himmels ODER ein neutraler
  Studio-Env) → Metalle reflektieren den Himmel statt Schwarz. ACHTUNG: IBL HELLT die
  ganze Welt (Augen-Sign-off Pflicht, W3; kann den getunten Look auswaschen). (b) die
  **dielektrischen Vertikalen** (Stein-Tor) kriegen bei Zenit-Sonne ~0 Direktlicht +
  Ambient×dunkle-Albedo ≈ dunkel → ein PBR-Schatten-Boden (der Toon-B8-LUT-0.25-Boden
  fiel mit §2 weg, war toon-only) ODER die Mittag-Sonne leicht aus dem Zenit kippen.
  Beides render-only, beides Augen-bound (über die ZUVERLÄSSIGEN Welt-ground-Shots
  verifizierbar — nicht den flake-isolierten Baum).
- **Geologie/Rinde/Fels/PBR-roughness** (Ω-O1/O5/O7/O8/O15): pro Ω-O ein Bild, das
  das Landen beweist (W3). „browser-justierbar" war eine Schuld, kein Abschluss.

---

## §8 — DIE REIHENFOLGE + DIE WAND

```
§1 Aura subtil ✅  ──► die Welt liest natürlich (das Fundament für jedes Urteil)
        ▼
§2 PBR/Toon-raus  ──► EINE Material-Wahrheit
        ▼
§3 Seh-Werkzeug   ──► ich kann EINEN Baum sauber SEHEN (eines, zuverlässig)
        ▼
§4 Eine Baum-Quelle ──► die Kugeln raus
        ▼
§5 Lushe Kronen   ──► der dominante visuelle Hebel
        ▼
§6 Dichte (GPU)   ──► Dichte UND FPS
        ▼
§7 Oberflächen + Strukturen-Licht ──► jeder Ω-O im Bild bestätigt
```

**DIE WAND:** kein Punkt ist „erledigt", bevor das AUGE (meins geschärft, dann deins
als Richter) es im Bild bestätigt — ODER eine ZAHL die Mechanik beweist. Headless-
grün zählt die Mechanik, nie den Look. Kein Parallel-Pfad bleibt. Keine Behauptung
ohne Sehen. **Das ist der Plan, der hält — weil er den Drift beim Namen nennt und an
jeder Welle die fünf Wände hält.**
