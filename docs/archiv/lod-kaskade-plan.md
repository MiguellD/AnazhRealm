# Die DETAIL-KASKADE — der vereinte LOD-Plan (eine Distanz, alle Gesichter)

> **Status:** schlafender Plan — U1/U3/U4/U5 ✓, U2/U6 offen; ZUERST lesen für LOD/Streaming (04.06.2026, Schöpfer-Auftrag „plane wie ein Profi — man baut nicht 10 LOD-Systeme; ein Profi bringt Synergie, klare Flüsse, Regelkreise die sich selbst stabilisieren").
>
> **Stand V18.31: U1 ✅ GEBAUT (V17.114)** — `_detailBand` + die frozen `DETAIL_CASCADE`-Tabelle (Code); `_voxelChunkLodFor` liest sie byte-identisch, Aerial-`hazeFar` an die Ring-Kante gekoppelt. **U3 ✅ GEBAUT (V17.115)** — Kreaturen lesen die Kaskade (`aiDiv`, ferne KI seltener, glatt). **OFFEN: U2** (Wasser-LOD) + **U6** (echtes Clipmap); ~~U4~~ ✓ GEBAUT V18.131 (Band-getrieben + das EINE Fernfeld-Impostor-Mesh pro Art) · ~~U5~~ ✓ GEBAUT V18.130 (r184-CSMShadowNode an den Band-Kanten, Snap pro Kaskade eingebaut) — Look-Sign-offs → S-Liste (gigant-plan §6.3). Reihenfolge (roadmap Phase 2): erst das Wasser-System sauber (Phase 1.5), dann U2 darauf.
>
> **Vor Arbeit an LOD / Streaming / Wasser-Ferne / Schatten / Deko-Distanz / Draw-Calls / Kreatur-Perf ZUERST lesen.**

---

## Die Vision: EINE Kaskade, viele Gesichter

Heute trifft jede Welt-Schicht ihre „Detail nach Distanz"-Entscheidung selbst (gemessen, Explore-Audit 04.06.): Terrain-LOD, Wasser-Iso, Deko-Ring, Kreatur-Gates, Schatten-Frustum, Fog, Aerial-Dunst — **acht Domänen, je eigene Schwelle.** Das ist die „10 LOD-Systeme"-Falle.

Ein Profi baut EINE Quelle. Die Lehre dieses Projekts kennt das Muster schon dreimal:

- **Die Aura** — `auraAt(x,z)`: EIN Feld über dem Ort, das alle lesen (lebendig/dichte/…).
- **Die Atmosphäre** — `_applyAerialOutput`: EINE Funktion, die alle opaken Ebenen POST-lighting teilen (V17.101).
- **Die Resonanz** — der Produkt-Vektor: EIN Vektor, viele Leser (Rolle/Domäne/Op, V17.67–.71).

**Die DETAIL-KASKADE ist die Distanz-Schwester der Aura:** ein FELD über der Distanz-vom-Auge, das alle lesen für „wie viel Detail HIER". Und sie ist nicht neu erfunden — die **Aerial-Perspektive (V17.106) ist bereits ein kamera-relatives Distanz-Feld für FARBE** (Dunst nach Augen-Distanz). Die Kaskade weitet DIESELBE kamera-relative Distanz auf alle anderen Detail-Achsen:

| Gesicht | Achse | heute |
| --- | --- | --- |
| Aerial-Perspektive | **Farbe** verblasst | ✅ V17.106 (kamera-relativ) |
| LOD-Pyramide | **Geometrie** vergröbert | ◐ V17.112 (Chunk-`r`) |
| Schatten-Kaskaden (CSM) | **Licht** vergröbert | ✗ eine Map |
| Deko-Fade + Impostor | **Leben** dünnt aus | ✗ per-Art ad-hoc |
| Kreatur-Tick-Rate | **Verhalten** verlangsamt | ◐ V17.113 (Boden-Cache) |
| Chunk-Größe (Clipmap) | **Draw-Calls** bündeln | ✗ gleich-groß |

**EINE Distanz-Kaskade. Sechs Gesichter. Ein Regelkreis.**

---

## §1 — Der Kern: die EINE Quelle

Die kanonische Distanz-Metrik existiert schon: **`r` = Chebyshev-Chunk-Distanz vom Spieler-Chunk** (`_voxelChunkLodFor`), Welt-Distanz `= r · 43.2 m`. Sie ist **kamera-relativ** (folgt dem Spieler, wie die Aura, die Aerial-Perspektive, die Himmelskörper V17.102) und **derived** (kein State → kein Drift).

Wir erheben sie zur EINEN Detail-Autorität:

```
DETAIL_CASCADE  (frozen, ein Static — die EINE Tabelle, browser-tunbar)
  Band 0  r ≤ 1   (≤  86 m)  LOD0  · volles Detail · Kollision · Mesh-Deko · Schatten-Kaskade 0
  Band 1  r 2–8   (≤ 346 m)  LOD1  · die geliebte Mittelsicht · Mesh-Deko-Fade · Kaskade 0/1
  Band 2  r 9–10  (≤ 432 m)  LOD2  · Impostor-Deko · Wasser-LOD2 · Kaskade 2
  Band 3  r ≥ 11  (≤ 518 m)  LOD3  · keine Deko · Wasser-LOD3 · Kaskade 2 · Fog-Schleier

_detailBand(r) → { lod, dekoMode, waterLod, shadowCascade, creatureTickDiv }
```

Eine Funktion, eine Tabelle. JEDE Schicht liest `_detailBand(r)` — nie eine eigene Schwelle. (Heutiges `_voxelChunkLodFor` wird ihr `.lod`-Feld; `chunkRingRadius` bleibt der Regler für die äußerste Band-Grenze.)

---

## §2 — Die Synergie: alle Übergänge an DENSELBEN Band-Grenzen → selbst-verbergend

Der Profi-Trick (Witcher 3 / Horizon): **kein Übergang ist sichtbar, weil jeder mit dem Fog-Schleier zusammenfällt.** Wenn die LOD-Vergröberung, die Schatten-Kaskaden-Grenze, das Deko→Impostor-Tauschen UND der Fog-Schleier ALLE am selben Ring-Band liegen, dann „poppt" nichts — jeder Übergang sitzt hinter dem Dunst, der ihn verbirgt.

Darum die EINE Regel (U1): **der Fog-`far` + der Aerial-`hazeFar` werden an die äußerste Band-Grenze GEKOPPELT** (`ringRadius · 43.2`). Kurbelt der Schöpfer den Sicht-Ring, wandert der Schleier automatisch mit — die ferne LOD3-Naht ist IMMER im Dunst. Das ist die Synergie, die heute fehlt (Fog ist ad-hoc, nicht an den Ring gekoppelt).

---

## §3 — Der Regelkreis, der sich selbst stabilisiert

Alles ist `f(r)`, und `r` ist kamera-relativ. Bewegt sich der Spieler, aktualisiert sich `r`, ALLE Gesichter folgen — **kein per-Schicht-State, kein Drift, keine Schwelle, die desynchronisieren kann.** Das ist der „Regelkreis, der sich selbst stabilisiert": EIN Regler (die Distanz), alle Schichten gehorchen. Wie die Aura kein State ist (derived), wie die Aerial-Perspektive pro Frame aus `cameraPosition` neu fällt.

Die ehrliche Grenze (V17.23-Harmonie-Disziplin): wo eine Unterscheidung GEMESSEN nicht aus der Distanz emergiert (z.B. der Spieler-Chunk braucht IMMER Kollision, egal wie nah — eine Sicherheits-Wand), bleibt ein Intent-Override. Das ist kein Bruch des Prinzips — es ist die V17.70-Lehre (nicht alles emergiert; manche Unterscheidung ist Zweck). Aber es ist die AUSNAHME, klar markiert, nicht die Regel.

---

## §4 — Die Leser (Explore-Audit 04.06., die Vereinheitlichungs-Kandidaten)

**Schon an `r` gekoppelt (das Fundament, das beweist, dass es geht):** Chunk-Streaming · Prune · Vegetation-Scatter · Lazy-BVH lesen ALLE `chunkRingRadius`/`r`.

**Noch ad-hoc (die Kandidaten, die heim ins Band kommen):**
- Wasser-Iso: IMMER LOD0 (eigene Schwelle) → Band-`waterLod`.
- Deko: per-Art `ring: 1/2` → Band-`dekoMode` (mesh/impostor/keine) + Dichte-Skala.
- Kreatur: Raycast 70 m · Wasser-Kontext 50 m · Boden-Budget 20 · P2P-Cap 40 → Band-`creatureTickDiv` + Distanz-Bänder.
- Schatten: EINE Map ±300 m → Kaskaden an den Bändern (CSM).
- Fog/Haze: `fogDistance`/`hazeNear`/`hazeFar` ad-hoc → an die äußerste Band-Grenze gekoppelt (§2).

---

## §5 — Die Teilschritte (jeder: Ziel · Mechanik · Messung · Risiko · Sign-off)

Reihenfolge-Logik: **Fundament → FPS → Reichtum → Qualität → Weite.** Jeder Schritt routet EINE Schicht durch die Kaskade; nach jedem ist die Welt grün + spielbar.

### **U1 — Die Kaskade als Fundament** — ✅ GEBAUT (V17.114) (Risiko: niedrig)
- **Ziel.** `_detailBand(r)` + die frozen `DETAIL_CASCADE`-Tabelle als EINE Quelle. Fog-`far` + Aerial-`hazeFar` an die äußerste Band-Grenze koppeln (§2-Synergie).
- **Mechanik.** `_voxelChunkLodFor` → liest `_detailBand(r).lod` (byte-identisch zur V17.112-Zuweisung). `_dayNightApplyHemiAndFog` + `atmoUniforms` lesen `ringRadius·43.2` statt fester Werte.
- **Messung.** `diag-lod-kaskade.cjs`: jede Schicht liest `_detailBand`; Fog-far == Ring-Kante; LOD-Bänder byte-identisch zu V17.112.
- **Sign-off.** Der Fog-Schleier sitzt am Sicht-Rand (kurbeln → Dunst wandert mit).

### **U2 — Wasser liest die Kaskade** (Risiko: mittel — FPS-Wurzel über Wasser)
- **Ziel.** Fernes Wasser (Band 2/3) meshet auf der Chunk-LOD statt erzwungenem LOD0 → die ferne Wasser-Iso wird billig (der gemessene GPU-Verdacht von FPS 13 über Wasser).
- **Mechanik.** `_buildVoxelChunkWaterIsoSurface` liest `_detailBand(r).waterLod`; nah bleibt LOD0 (naht-frei), fern LOD2/3. Die Cross-LOD-Wasser-Naht liegt im Fog-Schleier (§2). V9.93-Invariante („Wasser immer LOD0") wandert mit (V9.56-i).
- **Messung.** `diag-water-truth` + Wasser-Vertex-Zahl/Frame fern: LOD0→LOD2 = ~16× weniger.
- **Sign-off.** FPS über Wasser bei Ring 12; ferne Wasser-Naht unsichtbar im Dunst.

### **U3 — Kreaturen lesen die Kaskade** — ✅ GEBAUT (V17.115) (Risiko: niedrig-mittel — FPS bei 120+)
- **Ziel.** Die Kreatur-Arbeit skaliert mit ihrem Band: ferne Kreaturen ticken seltener (KI), refreshen den Boden seltener. Verallgemeinert den V17.113-Boden-Cache + die ad-hoc-70/50-m-Gates.
- **Mechanik.** `_detailBand(r_creature).creatureTickDiv` (Band 0: jeden Frame, Band 2: jeden 4., Band 3: jeden 8.) — die volle KI/Bewegung nur im fälligen Frame, dazwischen Interpolation der Position. Die V17.113-Budget-Disziplin bleibt der Schutz.
- **Messung.** Tick-Kosten @ 120 Kreaturen über die Bänder verteilt; kein KI-Tiefe-Verlust nah.
- **Sign-off.** FPS bei 120 Kreaturen; ferne Kreaturen leben sichtbar weiter (nur langsamer).

### **U4 — Deko liest die Kaskade** (Risiko: niedrig — Reichtum)
- **Ziel.** Deko-Distanz + Dichte aus dem Band (nicht per-Art `ring`). „Mind. eine Reihe weiter" + die 2×-Verdopplung, die der Schöpfer will. Mesh nah (Band 0/1), Impostor-Billboards fern (Band 2), nichts (Band 3).
- **Mechanik.** `KLEIN_VEGETATION_SPECIES` verliert `ring`; `_buildVoxelChunkScatter` liest `_detailBand(r).dekoMode` + einen globalen Dichte-Faktor (browser-Slider). Impostor = die V16.2-Billboard-Idee, an Band 2 gehängt.
- **Messung.** Deko-Instanz-Zahl pro Band; Dichte-Slider × 2 = 2× Halme nah, gebounded fern.
- **Sign-off.** Üppige nahe Wiese + Deko bis in die Ferne (Impostoren), FPS hält.

### **U5 — Schatten lesen die Kaskade (CSM)** (Risiko: hoch — pixel-blind, Render-Umbau)
- **Ziel.** Cascaded Shadow Maps an den Band-Grenzen. Nah = scharfe kleine Kaskade (Band 0/1), fern = grobe große (Band 2/3). Heilt das mittags-Flackern + das 400-m-Flackern (Schöpfer-Befund) — DAS ist „Schatten ins LOD" (Schöpfer-Instinkt).
- **Mechanik.** N Shadow-Maps, jede mit ihrem Frustum an einer Band-Grenze; der R1-Light-Space-Snap PRO Kaskade; das Fragment wählt die Kaskade nach Distanz. Sonnen-Bewegung-Schimmer: die nahe Kaskade ist klein genug für scharfe Texel; die ferne ist im Fog.
- **Messung.** headless: N Kaskaden-Targets bauen ohne Crash; Snap pro Kaskade. **Pixel-Wahrheit nur im Browser** (V10.0-g.r).
- **Sign-off.** Schatten mittags ruhig (kein Flackern), an vertikalen Wänden scharf, kein Rasterkriechen bei Sonnen-Bewegung.

### **U6 — Draw-Calls lesen die Kaskade (echtes Clipmap)** (Risiko: hoch — Grid-Umbau, die „Zukunft")
- **Ziel.** Ferne Bänder nutzen GRÖSSERE Chunks (ein Band-2-Chunk deckt 2×2 Band-0-Fußabdrücke, Band-3 4×4) → drastisch weniger ferne Tiles → die Draw-Call-Wand (289→625 bei Ring 12) fällt → WIRKLICH riesige Weite (Ring 20+). Die „künftige geniale Struktur", die der Schöpfer erahnte.
- **Mechanik.** Das Chunk-Grid wird mehr-skalig (genestete Clipmap-Ringe); die Naht zwischen Chunk-Größen via U5-artigem Stitching/Geomorph oder Fog-Tarnung (§2). Der größte Umbau — eigener Bogen.
- **Messung.** Draw-Calls bei Ring 20 ≈ heute bei Ring 12; Sicht > 800 m.
- **Sign-off.** Gewaltige Weite bei hoher FPS, keine sichtbaren Größen-Nähte.

---

## §6 — Ehrliche Grenzen + die Reihenfolge

- **U1–U4 sind großteils headless messbar + niedrig-risiko** (Daten-Flüsse + Geometrie-Kosten). **U5 (CSM) + U6 (Clipmap) sind pixel-blind + die historischen Wunden** (Schatten-Qualität, Cross-LOD-Naht) → eigener Browser-Loop, nicht blind, nicht in einen Merge gerusht (V10.0-g.r · V9.70).
- **Die FPS-13-Wurzel teilt sich** (gemessen V17.113): CPU (Kreaturen, U3 — der Boden-Cache half schon) + GPU (fernes Wasser U2, Draw-Calls U6, Schatten-Pass U5). **U2 + U3 sind die schnellen FPS-Siege**; U5/U6 die tiefen.
- **Reihenfolge:** U1 (Fundament) → **U2 + U3 (FPS-Fundament)** → U4 (Reichtum, billig) → U5 (Schatten-Qualität) → U6 (Weite). Nach jedem Schritt: Playtest grün + Schöpfer-Browser-Blick.
- **Was NICHT emergiert, bleibt Intent** (§3): der Spieler-Chunk-Kollisions-Zwang, die P2P-Cap. Klar markiert, die Ausnahme.

**Der Nordstern:** nach U1–U6 gibt es EINE Distanz-Kaskade. Farbe, Geometrie, Licht, Leben, Draw-Calls — alle lesen sie, alle vergröbern an denselben Bändern, alle verborgen vom selben Schleier. Ein Regler, der sich selbst stabilisiert. Reich + weit + flüssig — wie die wahren Genies.
