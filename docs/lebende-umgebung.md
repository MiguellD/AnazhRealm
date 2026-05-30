# Der „Lebende Umgebung"-Bogen — Plan (V16)

> **Status: PLAN (kein Code an der Welt). Stand 30.05.2026, nach V15.4.1.**
> Dieses Dokument ist der Schöpfer-Entscheidungs-Anker für den Vegetations-/
> Leben-Bogen. Es wird Ring für Ring abgearbeitet, jeder Ring ein
> Schöpfer-Browser-Audit. Geschrieben NACH einer gründlichen Code-Diagnose
> (Zeilennummern unten), nicht geraten.

## Der Schöpfer-Wunsch (wörtlich, V15.3.1–V15.4)

> „ist es nicht möglich lebende wiesen, strukturen wie in der welt die fraktal,
> effizient laden? gibt es keine genialen twists die umgebung zu erwecken?"
> … „ich liebe es den weltenring auf max zu stellen, nebel auf etwa 150 und
> dann die weite entdecken, die ruft."

Plus der frühere Befund: das Gras lädt nur sehr nah (kahl dahinter, sichtbares
Pop-in), wirkt uniform/spärlich, „lebt nicht wirklich", „keine Felder mit
Wiesen". Und: die V15.1–V15.4-Albedo-Tricks waren die unterste Liga (Farbe im
Material) — der Schöpfer spürt zu Recht, dass das nicht die geniale Lösung ist.

## Die Diagnose (gemessen, mit Zeilennummern)

**Was HEUTE existiert — ein schlafender Riese:**

1. **`worldFieldAt(x,z)`** (Z~31648) liefert VIER fraktale, deterministische
   Simplex-Noise-Felder: `lebendig`, `dichte`, `glut`, `magieleitung`
   (λ~200 m, seeded). Das ist die fraktale Welt-Wahrheit, die der Schöpfer
   sucht — sie ist DA.
2. **`_vegetationSampleSpawn`** (Z~31945) wählt schon PER AFFINITÄT aus fünf
   Kandidaten (`baum_eiche`, `baum_kiefer`, `stein_block`, `kristall_geode`,
   `glutbrunnen`) den passendsten für jeden Ort → „die Welt erzählt, was wo
   wächst". ABER: nur 8×8 Samples/Chunk (Z~32087), spärlich, als einzelne
   Compound-Meshes mit Physik (teuer, keine Fern-LOD).
3. **Gras** (`_buildVoxelChunkGrass`, Z~20197): Dichte = `lebendig·14` Halme
   pro 16×16-Sample-Zelle, NUR bei LOD 0 (`if (lod === 0)`, Z~18167, ~86 m
   Ring). GPU-InstancedMesh, gut gepoolt.
4. **Wind** (`windUniforms`, Z~10320): TSL-positionNode, `uWindTime` im Loop
   (Z~41047), stärker bei Regen. Funktioniert, aber per-Halm-periodisch, keine
   großen Wind-Wellen übers Feld, keine Partikel.

**Die Buffer-Geschichte — KORRIGIERT (Schöpfer fragte kritisch nach, zu Recht):**

Eine frühere Fehl-Folgerung in dieser Session: „`GRASS_MAX_BLADES = 256` ist
eine GPU-Hardware-Alignment-Grenze (16384 Bytes)". **Das ist FALSCH.** Die
Wahrheit aus dem Code + CLAUDE.md Z213/217: `16384 = 256 × 64` ist bloß
`GRASS_MAX_BLADES × Matrix4-Größe` — die **Crash-SIGNATUR** (die Byte-Zahl, an
der man den kaputten Buffer im Fehler-Log ERKANNTE), NICHT eine Hardware-
Schranke. Die 256 ist eine **frei gewählte Konstante.**

Der ursprüngliche Bug hing mit **WebGPU** zusammen — aber NICHT mit „WebGL→
WebGPU-Übersetzung". Es war ein **Three.js r160 WebGPU-Backend-Bug**: stale
Bind-Group-Layout-Cache beim InstancedMesh-Recycling + das DynamicDrawUsage-
writeBuffer-auf-disposed-Buffer-Gift (V10.0-i/j). **Dieser Bug ist seit r184
strukturell GEHEILT** (V12.0-d, CLAUDE.md-Zitat: „Improve Bind Group Layout
cache system" r182 + „compileAsync truly non-blocking" r182 + writeBuffer-nur-
bei-needsUpdate). Das Projekt läuft längst auf r184.

**Korrigierte Lage für diesen Bogen:**
- Die **256 ist frei änderbar** (z.B. 512/1024) — nur eine Konstante.
- Die ECHTE Disziplin ist **Uniform-Capacity** (alle Pool-Meshes desselben
  Pools teilen denselben Cap → kein Cache-Pollution). Das heißt **„konstant",
  NICHT „klein/256".** Ein neuer Cap ist fein, solange er pool-uniform ist.
- Der Crash-Vendor-Bug ist geheilt → mehr Instanzen sind auf r184 **kein
  Crash-Risiko mehr, nur eine FPS-Frage** (mehr Instanzen = mehr GPU-Last).

**Das macht V16.0 (Mess-Diagnose) zum echten Fundament:** sie misst, wie viele
Instanzen das FPS-Budget WIRKLICH trägt — statt aus alter (falscher) Angst bei
256 zu bleiben. Mehr Halme/Veg sind erlaubt; die einzige Grenze ist gemessene
Performance, kein Phantom-Crash. Trotzdem bleibt das Ring-Prinzip (nah 3D, fern
Billboard/Albedo) der EFFIZIENTE Weg — Billboards sind pro Pixel billiger als
Voll-3D-Halme, also trägt man die Ferne smarter als mit roher Instanz-Zahl.

## Das Leitprinzip — die EINE Erkenntnis

> **„Wiese bis zum Horizont" lösen Profis NICHT mit mehr Grashalmen.**
> Witcher 3 / Ghost of Tsushima / BotW / Genshin nutzen **Ringe**: nah echte
> 3D-Halme, mittel Instanz-Cluster + Billboards, fern der Boden-als-Wiese +
> atmosphärische Tiefe. Jeder Ring eine andere, billige Technik. Die Illusion
> trägt, weil das Auge ferne Einzel-Halme ohnehin nicht auflöst — es liest
> Farbe, Fläche, Bewegung, Silhouette.

Und der zweite Schlüssel: **die Welt erzählt sich selbst.** `worldFieldAt` ist
schon fraktal — wir müssen nichts erfinden, nur den schlafenden Streuer
WECKEN und reicher machen.

## Der Bogen — vier Ringe

### V16.0 — Mess-Diagnose + dieser Plan (Vorbedingung, kein Welt-Eingriff)
Ein `scripts/diag-vegetation.cjs` (Stamm-Muster wie `diag-relief`): misst über
einen Radius (±200 m, gebinnt) — wie viele Gras-Halme + Veg-Objekte laden in
welchem Distanz-Ring? Wo sind die kahlen Zonen? FPS-Budget pro Veg-Schicht?
Plus: Veg-Dichte vs `lebendig`-Feld (greift der Floor 0.22 zu hart?).
**Liefert die harten Zahlen, gegen die V16.1–.3 gemessen werden** (die V14.0-
Lehre: „die Akzeptanz wird die Metrik"). Risiko: null (read-only Skript).

### V16.1 — Den fraktalen Streuer wecken (der größte sichtbare Hebel)
`_vegetationSampleSpawn` + `_populateVoxelChunkVegetation` reicher + dichter:
- Kandidaten-Liste erweitern um **GPU-instanzierbare Klein-Vegetation**:
  Blüten-Cluster, Farne, Büsche, Gräser-Tuffs, kleine Steine — als
  **InstancedMesh-Typen** (NICHT als teure Compound-Mesh-mit-Physik wie Bäume).
- Streuung aus `worldFieldAt`: `lebendig` → Wiesen-Blumen/Farne; `glut` →
  trockenes Gestrüpp/Glut-Flora; `magieleitung` → leuchtende Sporen/Kristall-
  Moos; `dichte` → Fels-Brocken. **Die vier Felder werden zu vier Biom-Stimmen.**
- Mehrere Instanz-Typen, jeder mit EIGENEM `MAX`-Cap (Uniform-Capacity-Pattern
  wie Gras — KEIN Bruch des 256-Gras-Caps, sondern neue, eigene, sicher
  dimensionierte Instanz-Pools pro Typ).
- **Risiko: mittel.** Berührt Streuung (Determinismus — deterministischer rnd
  wie Gras, Z~20205) + neue InstancedMesh-Pools (die Buffer-Klasse, aber als
  NEUE konstante Caps, nicht als Resize des bestehenden). Worker-Mirror NICHT
  nötig (Streuung ist main-only, wie die heutige Veg). Playtest-Gate Pflicht.

### V16.2 — Der Fern-Ring: Billboard-Impostoren (Wiese bis weit, ohne Buffer-Risiko)
Das **Stern-Billboard-Pattern existiert schon** (Z~10207: InstancedMesh +
camera-facing Quads + Soft-Falloff). Darauf aufbauend:
- Für den mittleren/fernen Ring (jenseits ~86 m, wo heute LOD 1 + nichts ist):
  **Vegetations-Billboards** — flache, camera-facing Quads mit Gras-/Busch-
  Textur, GPU-instanziert, viel billiger als 3D-Halme → tragen die Wiese
  optisch bis an den Sichtrand (Weltenring max!).
- Cross-Fade nah↔fern (3D-Halm blendet in Billboard, Billboard in Boden-
  Albedo) → kein Pop-in mehr.
- **Risiko: mittel.** Neue Instanz-Pools (eigene Caps), eine Quad-Textur
  (prozedural oder simpel). Render-lastig aber buffer-sicher (konstante Caps).
  Das ist der eigentliche „lädt bis weit"-Hebel — und er kämpft NICHT gegen
  den Nebel/die Weite (anders als das V15.4-Fog-Pflaster).

### V16.3 — Bewegung/Leben: die Welt atmet
- **Wind-Wellen übers ganze Feld**: statt per-Halm-Periodik eine große,
  langsame Böen-Welle (ein zweites, nieder-frequentes `uWind`-Feld), die
  sichtbar über die Wiese läuft → „der Wind geht durchs Gras".
- **Partikel in lebendigen Zonen**: Pollen/Funken/Schmetterlinge (InstancedMesh-
  Billboards, gegated auf hohes `lebendig`/`magieleitung`) → Leben in der Luft.
- **Optional**: Gras weicht dem Spieler aus (Distanz-Bend im positionNode).
- **Risiko: niedrig** (render-/shader-only, kein Buffer-Resize, kein
  Determinismus-Eingriff — Partikel sind kosmetisch). Der billigste Erweck-
  Hebel, bewusst zuletzt, weil er auf der dichteren Veg (V16.1/.2) am besten wirkt.

## Disziplin für den ganzen Bogen

- **Uniform-Capacity statt „klein"** (V10.0-j.c-Lehre, korrigiert): jeder
  Instanz-Pool nutzt einen KONSTANTEN Cap (alle Meshes desselben Pools gleich
  groß → kein Bind-Group-Cache-Pollution). Der Cap darf größer als 256 sein
  (der r160-Crash-Bug ist seit r184 geheilt, V12.0-d) — er muss nur
  pool-uniform sein. Mehr Instanzen = FPS-Frage, kein Crash-Risiko → gegen die
  V16.0-Metrik messen, nicht aus alter Angst klein bleiben. Trotzdem:
  Billboards (V16.2) sind pro Pixel billiger als Voll-3D-Halme → die Ferne
  smart tragen, nicht mit roher Instanz-Zahl.
- **Determinismus**: Streuung nutzt den deterministischen Chunk-rnd (Z~20205),
  damit dieselbe Welt-Region immer dieselbe Vegetation trägt (kein Flackern
  beim Re-Streamen). Playtest-Gate nach jeder Welle.
- **Messen vor schneiden** (V14.0): V16.0 baut die Metrik, V16.1–.3 messen
  dagegen. Browser-Audit nach JEDEM Ring (Render-Qualität ist pixel-blind
  headless — die V13-Lehre).
- **Kein Pflaster** (V15.4-Lehre): keine Technik, die ein Symptom verdeckt
  (Nebel reinziehen) statt die Wurzel zu beleben.

## Was das NICHT ist

Kein 3D-Fluid, kein Foto-PBR, keine Engine-Neuschreibung (Heilige Lektion).
Es ist Worldgen-Streuung aus einem schon-fraktalen Feld + Genre-erprobte
Instanz-/Billboard-/Wind-Technik. Simpel, effizient, emergent — der Riese
schläft schon in `worldFieldAt`, wir wecken ihn.

---

## V16.0 — Mess-Diagnose (ERLEDIGT, Stufe-1-Code-Analyse, kein Browser)

Nach der V9.94.r-Disziplin (Stufe 1: Frage durch Code-Lesen beantwortbar?) —
die Streu-Mathematik steht im Code, kein Puppeteer nötig. Harte Zahlen aus
den Konstanten (span=43.2 m, chunkRingRadius default 4):

### Befund 1 — der 256-Cap ist DIE Enge (nicht die Streuung)
- Gras: 16×16=256 Zellen/Chunk, Dichte `floor(lebendig·14 + rnd·2)`.
- Bei dichter Wiese (lebendig≈1): ~3840 Halme erzeugt, aber `GRASS_MAX_BLADES
  =256` rendert nur 256 → **93 % weggeworfen**. Schon EINE volle Zelle sprengt
  den Cap. **Das** macht es spärlich, nicht die Streu-Logik.
- Korrigiert (Schöpfer-Nachfrage): der Cap ist frei erhöhbar, der r160-Crash
  ist seit r184 geheilt → nur eine FPS-Frage.

### Befund 2 — Gras deckt nur 11 % der Sichtfläche
- Sicht-Ring 9×9 Chunks (389 m breit), Gras NUR im 3×3-LOD-0-Kern (130 m).
- **89 % der Sicht ist per Konstruktion grasfrei** → der „weiter weg sehr
  kahl"-Befund, exakt erklärt. (V15.3.1-Wiesen-Boden mildert das optisch, aber
  echte Halme/Detail fehlen jenseits 65 m.)

### Befund 3 — Vegetation doppelt gedrosselt
- 8×8=64 Stellen/Chunk, `chance = 0.4·affinität²`.
- Selbst perfekte Affinität → nur 40 % Spawn; mittlere (0,5) → nur 10 %.
- ~6 Veg-Objekte/Chunk → die Welt ist absichtlich sehr licht.

### Die drei Stellschrauben (gemessen, für V16.1+)
1. **Gras-Cap 256 → höher** (z.B. 512/1024, FPS-gemessen im Browser).
2. **Gras-Ring 3×3 → weiter** + Fern-Ring (Billboards, V16.2).
3. **Veg-`chance`-Kurve großzügiger** + GPU-instanzierte Klein-Vegetation.

### Was NUR der Browser messen kann (offen, Schöpfer-Auge)
- FPS-Kurve vs Halm-Zahl (welcher Cap trägt 60 FPS auf der Schöpfer-GPU?).
- Visuelle Dichte-Wirkung (wann „liest" es sich als echte Wiese?).
- → diese justieren wir im Browser-Loop, nicht headless (V13-Render-Lehre).
