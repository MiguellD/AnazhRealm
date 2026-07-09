> **GEPARKT 09.07.2026 (Nervensystem-Plan, Phase-Regel):** dieser Kalibrierungs-Lauf wurde bei Lauf 3/5 gestoppt — die Schwellen sind NICHT festgezogen, diag-parity blieb auf dem W2-Stand (Look-Watch, kein Merge-Gate; Parität ist dem Nervensystem-Plan untergeordnet, DONE = H3/H4 + Sign-off).
> **H3 STEHT (09.07.2026, Phase γ):** der Zensus-Keim ist zur EINEN Inventur-Linse gewachsen — `scripts/diag-asset-inventory.cjs` (`npm run gate:asset-inventory`, per-push-CI, ersetzt `gate:silhouetten-zensus`). Die 222 unbekannten Emitter sind AN DER QUELLE klassifiziert (Instrumentierung, nicht geraten): `streu-klein` (`_acquireScatterMesh`, ~194) · `deko-fernfeld` (`_buildDekoFernfeldSpecies`, ~12) · `terrain-stitch` (`_rebuildLodStitchBand`, ~16) · `wetter-regen` (`_ensureRainSystem`, nur bei rainy/stormy) — je ein `userData.inventar`-Identitäts-Stempel am Bau-Chokepoint, kein Verhalten. Dazu die H3-Hälfte: requested ⊆ visible|cached (f.requested gegen f.cache + fscatter/f:/fimp:/Gras-Memo-Attestierung; LRU-Räumungen via `f.lruEvicted`-Inventur-Buch bewusst, kein Verlust). Erstlauf GRÜN: 1119 Emitter erklärt · 0 Fremd-Silhouetten · 174 Keys, 0 verloren, 0 hängend; Selbst-Tests (3 injizierte Fremd-Emitter + 1 synthetisch verlorener Key) feuern.

# Paritäts-Kalibrierung V18.433 (W6-Rest: Schwellen + Zensus, 09.07.2026)

**Zweck:** die W6-Schwellen-Kalibrierung auf dem stabilen Bild (nach W5.1/.2, W5.3/.4, W6) +
die stehende Silhouetten-Zensus-Linse. Die V18.429-Baseline (`paritaet-baseline-v18429.md`)
bleibt unangetastet — sie ist die Geschichte; dieses Doc trägt die Kalibrierung.

## 0 · Der Haupt-Befund ZUERST: die Mess-Bühne war selbst kontaminiert

Die Kalibrier-Läufe 1+2 (alte Bühne, je ~13,5 min) zeigten ein nebel-ertränktes ANAZH-Bild
(Kanten-Dichte ≈ 0,005 überall — die V18.429-Baseline hatte 0,137 in der Mitte). Die neue
Nebel-/Fronten-Sonde in `diag-parity` (Lauf 2) maß die Wurzel als Zahl:

```
{"fogNear":7.6,"fogFar":21.6,"chunks":3,"activeRing":0,"ringRadius":0,
 "builtK":0,"grassK":0,"waterK":0,"pendingGrass":0,"pendingWaterIso":0}
```

**Der Perf-Regler schrumpfte die Mess-Bühne selbst:** der Pump-Kontext (Ticks Rücken an
Rücken) macht die gemessene Frame-Zeit ≈ Tick-Kosten (> throttleMs) → sustained over-budget
→ der Ring-Atem (V18.306) schrumpfte den aktiven Ring auf 0, die 9-Chunk-Bühne wurde auf
3 Chunks geprunt, und die harte Wasser-Kappe (V18.358) zog `fog.far` auf
`(waterK+0.5)·span = 21,6 m` — das Bild maß einen **Regler-Transienten**, kein Welt-Bild.
Eine Schwellen-Kalibrierung auf diesem Zustand wäre exakt die V18.346-Kontamination
(Teilmenge nicht unabhängig klassifiziert) und obendrein timing-abhängig = Flake per
Konstruktion.

**Die Bühnen-Heilung (nur `scripts/diag-parity.cjs`, kein Monolith-Edit):**

1. **Bühnen-Pin:** die Mess-Bühne IST die kleine Studio-Welt — `chunkRingRadius = 1` +
   `_activeRingRadius = 1` (9 Chunks, ±65 m ≈ Studio-R 64 m), je Pump-Iteration erneuert.
   Damit ist die Bühne AM ZIEL (`_worldRamping` false → kein Reveal-Cap), der Regler hat
   nichts zu rampen/schrumpfen, und der Nebel öffnet auf die Ring-Kante
   `(1+0.5)·43.2 = 64,8 m` — das Studio-Analogon, ganz innerhalb der Welt-Gesetze
   (KEIN künstlicher Nebel-Wert).
2. **Front-Settle:** vor dem Schuss werden `_frameOverBudget` je Tick gelöst (das
   diag-no-second-treebuilder-Rezept) + Gras/Wasser gedraint, bis die Fronten
   (`_builtRingRadius`/`_builtGrassRingRadius`/`_builtWaterRingRadius`) den Ring-1-Stand
   erreichen; danach konvergiert der geglättete Nebel-Rand (Inertia max 4 m/Anwendung,
   V18.350) über wiederholtes `_applyDayNightToScene`.
3. **Nebel-Sonde bleibt stehen:** jeder Lauf loggt `fog.near/far · chunks · Ring · Fronten`
   — eine kontaminierte Bühne ist ab jetzt EINE laute Zeile, kein Bild-Raten (Gesetz #0).

Nebenbefund am Rande: die Welt der Parity-Bühne ist **deterministisch** (frischer Boot →
Fallback-Seed `"anazh-realm-seed"`): beide Läufe wählten den IDENTISCHEN Kamera-Spot
(bx 33.1 · bz −84.7 · stand 0.9 · treesInView 20). Die Lauf-zu-Lauf-Varianz misst also
Timing/Render-Nichtdeterminismus, NICHT Welt-Varianz.

## 1 · Die Mess-Läufe

### Läufe 1+2 — alte Bühne (VORHER, dokumentiert als Kontaminations-Beleg)

| Größe                     | Lauf 1                                     | Lauf 2                             |
| ------------------------- | ------------------------------------------ | ---------------------------------- |
| STUDIO Himmel/Mitte/Boden | [62,78,52] / [130,140,107] / [151,145,119] | (identisch — dasselbe Studio-Bild) |
| ANAZH Himmel              | [201,211,210]                              | (s. Lauf-2-Log)                    |
| ANAZH Mitte (grün %)      | [179,181,165] (5.8 %)                      | (s. Lauf-2-Log)                    |
| ANAZH Kanten [sky/mid/gr] | [0.0073, 0.0051, 0.008]                    | (s. Lauf-2-Log)                    |
| Mitte-RGB-Δ               | 86.3                                       | —                                  |
| Boden-RGB-Δ               | 24.3                                       | —                                  |
| fog.far @Schuss           | (ohne Sonde)                               | **21.6 m · chunks 3 · Ring 0**     |
| Impostor-RTT              | baked 0 · err „Unsupported WebGL type"     | baked 0 · dito                     |
| Stamm-Sonde bark          | [0.212, 0.174, 0.126] ×2                   | [0.212, 0.174, 0.126] ×2           |
| Laufzeit                  | 13 m 28 s                                  | ~13,5 min                          |

Analyzer-Eigen-Jitter (zweiter analyze auf denselben PNGs, anderes Browser-Profil):
±1 RGB / ±0.005 Kanten — der Boden der erreichbaren Schwellen-Schärfe.

### Läufe 3+4 — gepinnte Bühne (das KALIBRIER-PAAR)

(wird nach den Läufen gefüllt)

## 2 · Die festgezogenen Schwellen (Herleitung)

(wird nach den Läufen gefüllt)

## 3 · Warte-Zonen (E-D-Entscheid 09.07.: Himmel/Wasser ZÄHLEN, sind aber noch nicht übersetzt)

- **Himmel-RGB-Δ + Kanten-Δ (Himmel):** WARTE-Band, nicht-gatend, sichtbar als ⏳ im
  Verdikt. Der Wolken-Dome ist bis W9 nicht übersetzt — eine enge Schwelle auf dem alten
  Dome wäre kalibrierte Kontamination. Nach W9 werden die Bänder festgezogen.
- **Luma-Hist-L1:** misst das GANZE Bild inkl. Himmel → wartet strukturell mit W9.
- **Wasser:** keine eigene Bild-Zone — die Kamera-Wahl meidet Wasser (`g > wl+2`),
  Fern-Wasser ist im Studio-Regime aus (W6-Provisorium). Die Wasser-OBERFLÄCHEN-Zone
  entsteht mit W10 (dann fällt auch das Fern-Wasser-Provisorium zurück auf AN).

## 4 · Der Silhouetten-Zensus (die stehende W6-Linse → seit 09.07. Teil der Asset-Inventur)

Der Zensus lebt jetzt als Hälfte 1 der EINEN Inventur-Linse `scripts/diag-asset-inventory.cjs`
(H3, Nervensystem Phase γ — siehe Kopf-Note). Erstlauf auf V18.433+: 1119 Emitter erklärt,
0 VERLETZUNGEN (Studio 721 · Substanz 368 [darin die vier gestempelten Bau-Quellen] ·
Entscheid 30). Die Klassifikation bleibt fail-closed: ein unerklärter Emitter ODER eine
unbekannte `inventar`-Klasse ist rot, bis sie klassifiziert wird.

## 5 · Vergleich zur V18.429-Baseline

**Die zentrale Vorsicht:** die V18.429-Baseline wurde auf der FRAGILEN Bühne gemessen
(ohne Pin/Settle/Nebel-Sonde) — ihr Nebel-Zustand ist unbekannt (ihre Kanten-Werte
[sky 0.341 · mid 0.137] beweisen aber klare Luft über ~50 m, also revealK ≥ 1, anders als
die heutigen Läufe 1+2 mit Ring-Schrumpf auf 0). Ein Zahl-zu-Zahl-Vergleich alte Baseline ↔
neue Kalibrier-Läufe vermischt deshalb ZWEI Bewegungen: (a) die bild-ändernden Wellen
W5.1–W6 und (b) den Bühnen-Zustand. Erst die gepinnte Bühne trennt sie.

(Detail-Vergleich wird nach den Läufen gefüllt)

## 6 · CI-Entscheidung

- `diag-parity` = **zwei swiftshader-Renders, gemessen ~13,5 min/Lauf** → bleibt
  **manuell/nightly** (`npm run diag:parity`), NICHT per-push (der per-push-Gate ist
  bewusst leicht).
- Die **Asset-Inventur** (Zensus + H3-Inventur; Null-Renderer, foundry-ON, GPU-frei,
  ~1–2 min) steht im **per-push-CI** (playtest-Job, nach `gate:no-second-treebuilder`):
  `npm run gate:asset-inventory` (läuft immer mit `--selftest`; ersetzt den früheren
  `gate:silhouetten-zensus`-Eintrag — EINE Linse, Gesetz #0).
