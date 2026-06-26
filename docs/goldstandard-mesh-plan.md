# GESCHLOSSEN — die Terrain-Naht, GEMESSEN gesund (kein „Plan", eine Entscheidung)

**Schöpfer (V18.372): „was ist der profiweg? muss kein system rein aus prinzip, keine
alibiübungen. Aber weichen nicht zurück falls es der wahre schritt ist, aber nicht für nichts."**

Dies ist KEIN Aufschub-Plan mehr — es ist die GEMESSENE Antwort, damit niemand (auch ich nicht)
die Frage noch einmal von vorn aufrollt. Die Terrain-Naht ist für den SICHTBaren Look gesund;
der „Goldstandard" (intrinsisches Transvoxel) ist code-bewiesen das falsche Werkzeug für DIESE
Streaming-Engine. Beides mit einer ZAHL belegt, nicht mit Bauchgefühl.

## Die zwei Größen einer Naht — miss SHADING getrennt von GEOMETRIE

Die zentrale Lehre (V18.372, der Grund warum dieser Bogen sich auflöste statt zu wuchern):
**eine Naht hat zwei Größen — POSITION (Geometrie) und NORMALE (Shading) — und man muss die
messen, die das LICHT liest, nicht die, die intuitiv „die Naht" scheint.**

- **SAME-LOD (nah, sichtbar) — GEFIXT V18.372.** Die POSITIONEN teilen Nachbarn schon ~95–100 %
  bit-exakt (pad+crop, `diag-seam-normal` nn-Median 0). Der echte Riss war die NORMALE (bis 69°
  divergent = Lichtungs-Naht). Heilung: die Rand-Schalen-Normale via `sample()` (reine Funktion
  der Welt-Position) → konform (0.022°). Worker-gespiegelt, bit-deterministisch.
- **CROSS-LOD (LOD0↔LOD1 ~108 m) — GEMESSEN für-nichts, NICHT gebaut.** Die GEOMETRIE-Normale
  divergiert dort 24,85° (`diag-crosslod-normal`) — sah aus wie der nächste „wahre Schritt".
  ABER: das Terrain-SHADING liest NICHT die Geometrie-Normale. `TERRAIN_NORMAL_FLATTEN = 1.0` →
  die Lichtungs-Normale ist `up + bump`; der bump fadet bei `TERRAIN_BUMP.lodFar = 95 m` aus,
  die LOD0↔LOD1-Grenze liegt bei ~108 m → dort ist die Lichtungs-Normale auf BEIDEN Seiten reines
  `up` → **die diffuse Lichtung ist über die Naht stetig, EGAL wie die Geometrie-Normale
  divergiert.** Die 24,85° speisen nur den `shadow.normalBias` (subtil). → Cross-LOD-Normalen zu
  konformieren wäre genau die „Alibiübung für nichts", die der Schöpfer verbot. NICHT gebaut.

## Warum intrinsisches Transvoxel das FALSCHE Werkzeug für Streaming ist (code-belegt)

`_voxelChunkLodFor` zeigt: LOD ist STATEFUL mit Hysterese (verfeinern sofort, vergröbern träge),
und ein Chunk baut, BEVOR seine Nachbarn existieren. Ein intrinsisches Mesh müsste die Geometrie
eines Chunks an die LODs seiner Nachbarn binden → es baut mit einem GERATENEN Nachbar-LOD und
muss REBUILDEN, sobald ein Nachbar-LOD anders landet (Churn beim Laufen über Band-Grenzen + eine
Korrektheits-via-Rebuild-Abhängigkeit). Der DEKOPPELTE Geomorph umgeht beides (er konformiert die
POSITION zur Render-Zeit, NACHDEM die Nachbarn da sind, + re-läuft bei Nachbar-Ankunft) — das ist
die professionell richtige Wahl für eine Streaming-Welt, kein Pflaster.

## Was WIRKLICH offen bleibt (ehrlich, nicht weggeredet)

- **Tiefe-LOD-Positions-Lücken** („Sterne durch Berge" an LOD2↔LOD3): der Skirt (V18.370) deckt
  sie per Konstruktion, aber im swiftshader-Container nicht fern-LOD-verifizierbar. DORT würde ein
  intrinsisches Mesh helfen — aber es ist das falsche Werkzeug (s.o.). Pragmatisch: der Skirt
  trägt; ein echter Befund im Schöpfer-Browser („sehe noch Sterne durch Berge") ist der einzige
  Auslöser, das Tiefe-LOD-Positions-Problem fokussiert anzugehen. Bis dahin: kein Eingriff.

## Die Linsen (bleiben)

- `npm run gate:seam` — same-LOD geteilte % + cross-LOD 0 ungedeckte Spalten (ring-4-erzwungen).
- `npm run gate:seam-normal` — same-LOD-Rand-Normalen ≤1° (im per-push-CI).
- `node scripts/diag-crosslod-normal.cjs` — cross-LOD-Geometrie-Normal-Divergenz (der Beweis, dass
  sie das Shading NICHT erreicht, solange `TERRAIN_NORMAL_FLATTEN=1.0` + bump < Naht-Distanz).
