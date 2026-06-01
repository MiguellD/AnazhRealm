# Der Tiefe-Bogen — Plan (V17.10–V17.13) — ✅ ALLE 4 WURZELN DURCH (Browser-Audit offen)

> **STATUS (31.05.2026): alle vier Wurzeln gebaut + verifiziert + gepusht.**
> V17.10 Wolken (mx_noise) · V17.11 Bäume (Ghibli-Geometrie + Affordance-
> Schärfung) · V17.12 Terrain-Makrotextur (triplanar) · V17.13 Strukturen-
> Kontrast (Post-FX-Unsharp). Zwei Schöpfer-Korrekturen unterwegs: (a) der
> `staticDecor`-Hardcode-Versuch gestoppt → emergente `_isMoveable`-Schärfung;
> (b) die Geometrie-Glättung als Fehlpfad für „Treppen" gestoppt → triplanar-
> TEXTUR. Der Browser-Audit des ganzen Stapels ist der Schluss.

> **Schöpfer-Befund (zweiter V17-Audit, 31.05.2026):** „V17.8 immernoch nur die
> Oberfläche, war tiefer geplant. Bäume nicht lebendig/genial — du hast das
> Bestehende belassen, kaum Steigerung. Strukturen kaum Kontraste. Wolken
> interferieren, nicht sauber, mehr geschnitten als vertieft — keine Harmonie
> in den Funktionen." → „plane alle 4 Wurzeln zuerst aus, beachte Effizienz,
> bestehende Systeme, alte Learnings, dann Schritt für Schritt."

Die ehrliche Selbstkritik: die „render-only + klein + sicher"-Disziplin wurde
zur Ausrede für mutlose Mini-Tweaks (±0.05 Farbe, AO leicht gedämpft, Bäume nur
dichter). Tiefe kostet echte Eingriffe — den Noise-Kern, die Geometrie, die
Bauplan-Daten. Dieser Plan ruht auf gründlicher Code-Durchforstung (zwei
Explore-Sonden + Bauplan-Lesung), nicht auf Raten.

---

## Wurzel 1 — Wolken: die Disharmonie an der Quelle heilen (V17.10)

**Diagnose (gemessen):** Der Skybox-`createGalaxySkybox` nutzt einen **selbst-
gebauten Hash-Wert-Noise** (`hash3 = fract(sin(dot(p, vec3(12.98,78.23,45.54)))
·43758.5453)`, Z9968–10007). Bei `vDir·2.3 + Zeit-Drift` wachsen die Sample-
Koordinaten → `sin(große Zahl)` ist **Float-Präzisions-Chaos** auf der GPU
(WGSL §3.6: sin hat implementation-defined precision für große Argumente) → das
„Interferieren/Flackern, nicht sauber". Das ist die fehlende **Harmonie in den
Funktionen**: der Himmel nutzt einen ALTEN, gerasterten Noise, während die
ganze restliche Welt (Terrain V15.1, Vegetation V17.1) das saubere, vendored
**`mx_noise_float`** (MaterialX-Simplex, glatt, bandbegrenzt) nutzt.

**Heilung (die EINE Noise-Sprache):** den `hash3`/`noise3` im Skybox-Shader
durch `mx_noise_float` (oder `mx_fractal_noise_float`) ersetzen — exakt das, was
die Vegetation/das Terrain schon teilen. Damit:
- KEIN Präzisions-Flackern mehr (Simplex ist für die ganze Domäne stabil).
- bauschige, organische Wolken (Simplex-FBM statt gerastertem Wert-Noise).
- `mx_fractal_noise_float` macht die 4 Oktaven INTERN → weniger Knoten, billiger.
- Die Nebula-Sterne-Schicht (n1/n2/n3) ebenfalls auf mx_noise → ein Himmel, eine
  Sprache, eine Harmonie.

**Bestehende Systeme genutzt:** `THREE.TSL.mx_noise_float` ist schon im Barrel
(V17.1 nutzt es). `cloudCover`/`uSunDir`/`skyboxUniforms` bleiben unverändert
(der wetter-/sonnen-Sync ist korrekt — nur der Noise-KERN wird getauscht).

**Alte Lehre:** V15.1 (mx_noise_float für Terrain-Mikrotextur), V13-Render-Lehre
(Render-Wahrheit nur im Browser). Determinismus: Skybox ist render-only, kein
Buffer/Worker → kein Mirror nötig.

**Risiko:** niedrig (render-only, try/catch-Fallback). Effizienz: gleich/besser
(mx_fractal macht Oktaven intern). Aufwand: 1 fokussierte Welle.

---

## Wurzel 2 — Bäume neu erschaffen: die Bauplan-Geometrie aufwerten (V17.11)

**Diagnose (gelesen):** `baumEicheParts` (Z29840) = **EIN Zylinder + EINE
Kugel.** `baumKieferParts` = EIN Zylinder + EIN Kegel. Das ist die Wurzel von
„nicht lebendig, nicht genial, kaum Steigerung" — die Geometrie SELBST ist
trivial. V17.6/V17.9 haben nur die DICHTE/Platzierung verändert, nie die Form.

**Heilung (im bestehenden System — die Bäume bleiben abbaubar/instanziert):**
die `parts`-Arrays zu echten Ghibli-Bäumen aufwerten — reine DATEN-Änderung,
KEIN neuer Code-Pfad (Heilige Lektion):
- **Eiche:** geneigter/mehrsegmentiger Stamm (2–3 cylinder-Parts leicht versetzt
  → organischer Wuchs) + **3–4 überlappende Laub-Kugeln** verschiedener Größe/
  Position/Farbe (statt einer perfekten Kugel → bauschige, asymmetrische Krone)
  + evtl. 1–2 Ast-Andeutungen (dünne geneigte cylinder).
- **Kiefer:** Stamm + **3 gestapelte Kegel** abnehmender Größe (die klassische
  Tannen-Silhouette) statt EINEM Kegel.
- **Farbvariation:** die Laub-Parts bekommen leicht variierende `color`-Overrides
  (sattes Grün → helleres Grün an der Spitze) → Tiefe in der Krone.

**Bestehende Systeme genutzt:** `_buildFromBlueprint` (rendert beliebig viele
Parts), HISM-Instancing (instanziert die ganze Group, egal wie viele Parts —
prüfen: trägt das Instancing Multi-Part-Groups? → Explore-Verifikation vor Bau),
`harvestArchitecture` (Holz+Laub bleibt, da material-basiert), Lazy-Collision
(die Stamm-AABB bleibt der solide Teil). KEINE Geometrie-Engine-Änderung.

**Alte Lehre:** V7.74 (Bäume sind Compound-Architekturen, eine Sprache), V17.9
(nie parallel — die echten Bäume vertiefen). Pro-Part-AABB (V9.65): die Laub-
Kugeln sind nicht-solide (dichte<0.3), nur der Stamm blockt → bleibt korrekt.

**Risiko:** mittel (mehr Parts/Baum × viele Bäume = mehr Vertices; aber HISM
rendert sie in EINEM Draw-Call → tragbar; FPS = Browser). Effizienz-Wächter:
die Part-Zahl moderat halten (~6–8 statt 2), Instancing trägt den Rest.
Aufwand: 1 Welle.

---

## Wurzel 3 — Terrain-Geometrie glätten: die Treppen an der Wurzel (V17.12)

**Diagnose (Explore-Sonde):** das Surface-Nets-Mesh läuft durch **GENAU EINEN**
Laplacian-Smoothing-Pass (`_voxelLaplacianSmoothPositions`, lambda=0.5, KEINE
Iterations-Schleife — anazhRealm.js Z16944, voxel-worker.js Z657). Die
„Treppen/Trapeze/Linien" sind die ungenügend geglätteten Surface-Nets-Facetten.
V17.8 dämpfte nur die Shading-LINIEN (Kosmetik); die Geometrie blieb facettiert.

**Heilung (Geometrie-Tiefe):** den einen Pass zu **2–3 Iterationen** machen
(eine Schleife um die bestehende Smoothing-Logik, lambda evtl. leicht senken auf
0.45 für Stabilität). Mehr Pässe = rundere Hügel, weichere Übergänge → die
„brutale Tiefe", die der Schöpfer sucht.

**KRITISCH (alte Lehre, V9.89/V9.91):** der Worker-Mirror (`voxel-worker.js`
Z657) MUSS bit-identisch mit-wandern, sonst bricht der Determinismus-Test
(`posMismatches=0`-Invariante, playtest Z14524). BEIDE Stellen ändern, identische
Iterations-Zahl + lambda. Der bit-identisch-Test ist die Sicherheits-Wand.

**Bestehende Systeme genutzt:** dieselbe Smoothing-Funktion (nur Schleife
drum), die Gradient-Normalen (V9.85, glätten sich mit), Pad+Crop (V9.79, bleibt
naht-frei). KEINE neue Pipeline.

**Risiko:** mittel-hoch. (a) **Performance:** jeder Pass ~linear (1→2 Pässe ≈
+Smoothing-Zeit, bei ~3000 Vertices/Chunk moderat, aber messbar — Worker trägt
das Gros, Main nur Sync-Chunks). (b) **Über-Glättung:** zu viele Pässe runden
scharfe Klippen/Berge weg (der V14-Terrain-Charakter) → bei 2–3 bleiben, nicht
mehr. (c) **Determinismus:** Worker-Mirror Pflicht. (d) **Hülle:** Smoothing
verschiebt Vertices leicht → die Decken-Marge (V14.6) prüfen. Aufwand: 1 Welle +
Determinismus-Verifikation.

---

## Wurzel 4 — Strukturen-Kontrast (V17.13) — PLAN KORRIGIERT nach Explore-Verifikation

**Diagnose (V17.7-Lehre):** die Flach-Farb-Bauten (`_buildToonNodeMaterial`
ohne vertexColors) haben KEINE Mikro-Textur/AO. Darum „kaum Kontraste, basic,
pappig".

**VERWORFENE Wege (Explore-Agent-Verifikation, 31.05.2026):**
- ❌ `material.outputNode`: existiert in Three.js r184 NUR fürs Post-Processing
  (`pp.outputNode`, Z42034), NICHT auf MeshToonNodeMaterial. Ein blind gebauter
  `mat.outputNode` wäre gescheitert. (Der Agent bewahrte mich davor.)
- ❌ `colorNode` direkt: bräche die dynamischen `material.color`-Mutationen
  (Kreatur-Lerp Z12993, Markierung setRGB Z33560) — die V17.7-Falle.
- ⚠️ `TSL.materialColor` (Material-Color als Node lesen, `colorNode =
  materialColor.mul(kontrast)`): theoretisch sauber (dynamische Farbe fließt
  durch), ABER V10.0-g-Lehre = Crash-Risiko (ReferenceNode.update null) + nur
  WebGPU-Pfad heute + headless nicht verifizierbar. Zu riskant blind.

**KORRIGIERTE Heilung — zwei sichere, getrennte Hebel:**
1. **Geometrie-Tiefe (wie die Bäume):** die Bauten sind so basic, weil ihre
   `parts` trivial sind (box/cylinder). Aber das ist pro-Bauplan-Arbeit (Dorf/
   Tempel/Tor haben je eigene parts) — ein großer, eigener Bogen. NICHT V17.13.
2. **Post-Processing lokaler Kontrast (sicher, global, EINE Stelle):** im schon
   laufenden V17.0/V17.3-Grading (`_ensurePostProcessing`, beweisbar sicher,
   try/catch) einen **lokalen Kontrast-/Mikro-Detail-Boost** ergänzen — z.B. ein
   sanftes Unsharp-Mask (Differenz zur lokal-gemittelten Helligkeit hebt Kanten/
   Binnen-Kontraste). Das macht ALLE Oberflächen (Bauten UND Terrain) plastischer
   OHNE ein einziges Material anzufassen → kein Risiko für dynamische Farben.

**V17.13 = der Post-Processing-Kontrast-Boost** (sicher, sofort, global). Die
Bauten-Geometrie-Aufwertung ist ein späterer, eigener Bogen (pro Bauplan).

**Risiko:** niedrig (Post-FX, try/catch, wie V17.3). Effizienz: ein paar
Extra-Taps im schon laufenden Pass. Aufwand: 1 Welle.

---

## Reihenfolge + Disziplin

1. **V17.10 Wolken-Wurzel** (niedrigstes Risiko, reine Noise-Ersetzung, sofort
   sichtbare Harmonie) — zuerst, baut Vertrauen.
2. **V17.11 Bäume** (Daten-Änderung, mittleres Risiko, größter „Wow") — die
   sichtbarste Steigerung.
3. **V17.13 Strukturen-Kontrast** (outputNode, mittel) — vor dem Terrain, weil
   render-only + kein Determinismus-Risiko.
4. **V17.12 Terrain-Glättung** (höchstes Risiko: Determinismus + Performance +
   Charakter-Erhalt) — zuletzt, mit voller Verifikation.

**Pro Welle (V9.56-Disziplin):** Block-Inspektion → Playtest-Invariante VOR dem
Bau → ein Commit + Chronik-Eintrag → Browser-Audit am Schluss. Jede Welle
einzeln verifiziert (node-check/format/lint/playtest), NICHT alle auf einmal.

**Permanente Lehre (dieser Bogen):** „render-only + sicher" ist kein Freibrief
für mutlose Mini-Tweaks. Tiefe heißt an die WURZEL gehen — den Noise-Kern, die
Bauplan-Geometrie, die Mesh-Glättung, den Post-Lighting-Pfad. Die Sicherheit
kommt aus Verifikation (Determinismus-Test, try/catch, Browser-Audit), nicht
aus der Kleinheit der Änderung.
