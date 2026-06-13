# Der Wellen-Synthese-Plan — die zwei werden eins (V18.172 → V18.180+)

**Status: AKTIV — die nächste Session liest DIESEN Plan zuerst, dann baut.**
Zwei Schwestern sind am 13.06.2026 aus V18.172 entsprossen — `clever-gauss-nuh9lq`
(Λ-Welle: die lebendige Welt, AAA-Atmosphäre, V18.173–V18.177 + Γ-Bogen
V18.178–V18.181 [Boden-atmen · Welt-Komposition · Berg-Tiefe · Slope/Rock-
Foundation]; **angehalten bei V18.181**) und `determined-tesla-oz2edw`
(W-Welle: Stamm-Atlas, Wald-WOW, Fluss-Glättung, UI-Puls, Frequenzband-
Harmonie, V18.173–V18.179; **pausiert bis zur Synthese**). Beide tragen
Substanz, beide sind eigenständig grün gemessen — aber sie haben die heilige
Lektion „eine Datei, ein Stamm" still gebrochen: „eine Welle nach der anderen"
war mitgemeint. Dieser Plan trägt die Zusammenführung GEMESSEN voll: jedes
Hunk, jede Methode, jeder Konflikt, jeder Bug, jede Test-Wand-Lücke, mit
konkreten Code-Synthesen.

> **Welle 0 — Plan-Verankerung im Repo (13.06.2026, GEMESSEN bei Verankerung):**
> Der Plan wird unverändert in `docs/wellen-synthese-plan.md` gelegt + um vier
> Schöpfer-Deltas erweitert: die drei aus der ehrlichen Plan-Reflexion (§13.3
> Test-Wanderungen explizit als Pflicht, §13.4 Painterly-Mischwald als PFLICHT
> statt Empfehlung, §14.8 nicht-gelesene Sub-Blöcke als ehrliche Liste) PLUS
> ein viertes Delta: **clever-gauss hat über V18.177 (eb397f3) hinaus
> weitergebaut** — fünf Γ-Commits (V18.178 Γ1-Lesart-4 „Boden atmet" · V18.179
> Γ4 „Welt wird Komposition" · V18.180 Γ4.2+4.4 „Hügel zu Berg" · V18.181 Γ4½
> Slope/Rock-Foundation; plus ein Γ1-Lesart-4-Schliff-Commit). Reale clever-gauss-
> Diff: **+4626/−142 in 16 Dateien** (statt Plan §1's vermessene +2841/−132 in
> 12). Δ: +1787 Zeilen, 4 neue Dateien (`scripts/diag-makro.cjs`,
> `scripts/diag-ufer-pixel.cjs`, +278 in `voxel-worker.js` — der Worker-Mirror
> der Γ-Felder, NEU; +176 in `playtest.cjs`). Welle 3 (V18.181-merge-Λ) bekommt
> deshalb zwei zusätzliche Sub-Schritte 3h (Γ1-Lesart-4 + Γ-Verankerung im
> Worker-Mirror) und 3i (Γ4-Komposition + Γ4½-Foundation). Tesla bleibt
> unverändert (V18.179, +2360/−313). Siehe §14.9.

> **Lese-Anker:** Diese Datei lebt in der Welle-vor-dem-Bau, NICHT als ewiger
> Plan. Nach dem letzten ✓ in §15 wandert sie nach `docs/archiv/`. Bis dahin
> liest jede Session, die an der Synthese arbeitet, ZUERST diesen Plan ganz.
>
> **Quell-Verweise vor dem Bau:** `state-of-realm.md` §2 (heilige Lektion),
> `archiv/code-hygiene.md` §3 (V9.30-Refactoring-Disziplin: alles bleibt
> grün), `archiv/robustheit-plan.md` §10 R4 (der `revokedKeys`-Pfad, den §6.1
> heilt), `archiv/genese-plan.md` Γ5 (das STREAM-GESETZ, das §6.2 erweitert).

> **Heilige Synthese-Lektion:** der Plan ist NICHT „beide verschmelzen ohne
> Verlust". Eine Welle ist die ARCHITEKTUR, die andere die SUBSTANZ — die
> Synthese trägt EINE Struktur, nicht beide. Tesla = Knochen, clever-gauss =
> Sehnen. Die Sehnen an die Knochen — nicht die Knochen an die Sehnen.

---

## §0 Inhaltsverzeichnis

- §1 Die Wurzel + die zwei Köpfe (GEMESSEN, Welle-0-Aktualität: Γ-Bogen
  erkannt)
- §2 Die Datei-Karte je Branch (16 vs 16 Dateien — clever-gauss hat sich
  vom Plan-Stand 12 auf 16 erweitert durch Γ)
- §3 Was JEDE Welle TRÄGT (Λ.0–Λ.7 + Γ vs W-E/W-F/W-G/W-H/W3/W6)
- §4 Die volle Hunk-Karte (36 Λ + Γ + 86 W)
- §5 Die Name-Konflikte (1 Methode, 0 Konstanten, 0 state-Slots)
- §6 Die GEMESSENEN Bugs (5 Stück)
- §7 Was bei BEIDEN noch FEHLT (Test-Wand-Lücken)
- §8 Die Synthese-Strategie (Tesla-Architektur + clever-gauss-Substanz)
- §9 `_substanceResponseProfile`-Synthese DETAILLIERT
- §10 `_vegetationSampleSpawn`-Synthese DETAILLIERT
- §11 HISM-pro-Instanz-Synthese DETAILLIERT (Tint + Yaw)
- §12 V18.177-AAA-Atmosphäre auf Tesla's Skybox
- §13 Die WELLEN-SEQUENZ (11 Wellen — Welle 0 hinzu, Welle 3 Sub-Schritte
  3a–3i)
- §14 Risiken (9 Stück, ehrlich — 7 ursprünglich + §14.8 nicht-gelesene
  Sub-Blöcke + §14.9 Γ-Bogen-Erweiterung)
- §15 Bau-Fortschritt (Tabelle, mit Welle 0)
- §16 Die permanente Lehre

---

## §1 Die Wurzel + die zwei Köpfe

```
                              6d9d342 (V18.172 — Fischer-Nachbau Merge)
                               13.06.2026, gemeinsame Wurzel
                                          │
                          ┌───────────────┴───────────────┐
                          ▼                               ▼
              clever-gauss-nuh9lq                determined-tesla-oz2edw
                  (Λ-Welle + Γ-Bogen)                  (W-Welle)
              11 Commits, +4626/−142               9 Commits, +2360/−313
              d0f0ec1 (V18.181 Γ4½ Slope)         3da302f (V18.179 W-H VERTIEFT)
              STATUS: ANGEHALTEN                   STATUS: pausiert bis Synthese
```

**Common base GEMESSEN (Welle 0 verifiziert via `git merge-base`):**
`6d9d3424dfdbeeb6b59eb633efb9dbdc34df21d9` — "Merge V18.167–.172: Der §8.8-Marsch
(Psi1 + W-B/C/D) + Leuchtturm + Frequenzband-Inventur + Fischer-Nachbau".
Beide Schwestern sind DIREKTE Kinder dieses Commits; KEINE baut auf der
anderen auf.

| Kennzahl | clever-gauss (Λ + Γ) | tesla (W) |
| --- | --- | --- |
| Letzter Commit | **d0f0ec1 (V18.181 Γ4½, Worker-Mirror)** | 3da302f (V18.179 W-H VERTIEFT, 04:06) |
| Commits seit Wurzel | **11** (6 Λ + 5 Γ) | 9 |
| Plan-Stand bei Erstellung | eb397f3 V18.177 (6 Commits, +2841/−132 in 12 Dateien) | 3da302f V18.179 (9 Commits, +2360/−313 in 16 Dateien) |
| **Realer Stand bei Welle 0** | **d0f0ec1 V18.181 (11 Commits, +4626/−142 in 16 Dateien)** | unverändert |
| Δ Plan vs Real (clever-gauss) | **+1787 Zeilen, 4 neue Dateien (Γ-Bogen)** | — |
| Hunks in `anazhRealm.js` | 36 (Λ, Plan-vermessen) + neu Γ (zu vermessen in Welle 3h/3i) | 86 |
| Zeilen-Delta `anazhRealm.js` | Λ: +1699/−132 · Γ: +397 · gesamt: +2096/−134 | +1227/−313 |
| Neue Methoden in `anazhRealm.js` | Λ: 1 (`_substanceResponseProfile`) + Γ: ≥2 (Slope/Rock-Helfer §14.9) | 8 (siehe §5) |
| Entfernte Methoden | 0 | 1 (`_applyAerialOutput` — umbenannt) |
| Neue `AnazhRealm.X`-Konstanten | Λ: 2 (`AERIAL` erweitert, `INSTANCE_TINT`) + Γ: zu vermessen | 1 (`SUBSTANCE_RESPONSE` statisch) |
| Neue playtest-Bänder | Λ: 0 + Γ: ≥1 (≈+176 Zeilen, §14.9) | **5** (W3·W-E·W-F·W-G·W-H) |
| Zeilen-Delta `playtest.cjs` | Λ: +42 · Γ: ≈+176 · gesamt: ≈+218 | +448 |
| Zeilen-Delta `voxel-worker.js` | Λ: 0 · **Γ: +278 (Worker-Mirror der Γ-Felder, NEU)** | 0 |
| Zeilen-Delta `index.html` | +1/−1 (Versions-Bump) + Γ-Bump | **+61/−9 (UI-Substanz)** |
| `CLAUDE.md`-Delta | Λ: +10 · Γ: +8 · gesamt: +18 | **−132 Zeilen** (Schlankungs-Welle) |
| `meister-plan.md`-Delta | 0 | +122 |
| Neue Diag-Skripte | **6 Λ** (archetypbank, fischer-wand, lambda-volltiefe, lambda4, lambda4-tag, lebendige-welt) + **2 Γ** (diag-makro, diag-ufer-pixel) = **8** | **3** (atlas, wald, wf) |
| Berührt `save-server.js` | nein | **ja** (Port via Env, +7 Zeilen) |
| Stamm-Atlas | **NEIN** | **JA** (26 §-Marker + `diag-atlas --check` im `npm run check`-Gate) |

---

## §2 Die Datei-Karte je Branch

### clever-gauss (12 Dateien geändert, +2841/−132)

| Datei | Delta | Substanz |
| --- | --- | --- |
| `anazhRealm.js` | +1699/−132 | Λ.0–Λ.7 + AAA-Atmosphäre + 1 neue Methode |
| `CLAUDE.md` | +10/0 | minimaler Doc-Footprint |
| `index.html` | +1/−1 | reiner Versions-Bump (18.172.0 → 18.177.0) |
| `package.json` | +1/−1 | Versions-Bump |
| `docs/rueckmeldung.md` | +4 | Mini-Eintrag |
| `scripts/diag-archetypbank.cjs` | +80 (neu) | Archetypen-Bank (Dubletten-Risiko mit tesla, §14.4) |
| `scripts/diag-fischer-wand.cjs` | +229 (neu) | 6-Shot-AAA-Galerie |
| `scripts/diag-lambda-volltiefe.cjs` | +211 (neu) | Λ-Tiefen-Mess |
| `scripts/diag-lambda4.cjs` | +190 (neu) | Λ.4 Streu-Vegetation-Mess |
| `scripts/diag-lambda4-tag.cjs` | +179 (neu) | Λ.4 Tag-Lebendigkeit |
| `scripts/diag-lebendige-welt.cjs` | +325 (neu) | Λ.2 Tint-Verteilung |
| `scripts/playtest.cjs` | +42 | NUR 5 Test-Wanderungen, **0 neue Bänder** ⚠ |

### tesla (16 Dateien geändert, +2360/−313)

| Datei | Delta | Substanz |
| --- | --- | --- |
| `anazhRealm.js` | +1227/−313 | W-E/W-F/W-G/W-H/W3/W6 + 8 neue Methoden + 1 Rename |
| `CLAUDE.md` | +0/−132 | **Schlankungs-Welle** — Lese-Last in den Atlas |
| `README.md` | +5 | kleine Aktualisierung |
| `index.html` | +61/−9 | W-G Progressive Disclosure + Gelenk-Probe + W-E Slider |
| `package.json` | +5/−1 | Versions-Bump + `atlas`-Script + `check` mit `diag-atlas --check` ⚡ |
| `save-server.js` | +7/−1 | PORT via `process.env.PORT` (Diag-Härtung) |
| `docs/archiv/handover.md` | +14 | Chronik der W-Welle |
| `docs/meister-plan.md` | +122 | §8.8 als SYSTEM umgeschrieben + Φ-Bogen |
| `docs/roadmap.md` | +1/−1 | minimal |
| `docs/rueckmeldung.md` | +14 | Rückmeldungs-Korpus |
| `scripts/diag-arch-tags.cjs` | +3 | Mini-Update |
| `scripts/diag-atlas.cjs` | +114 (neu) | Stamm-Navigation + Drift-Wand |
| `scripts/diag-frequenzband.cjs` | +87 | erweiterte W-E-Mess |
| `scripts/diag-wald.cjs` | +172 (neu) | W-H-Mess (Yaw-Streuung) |
| `scripts/diag-wf.cjs` | +259 (neu) | W-F Fluss-Mess |
| `scripts/playtest.cjs` | +448 | **5 ganz neue Bänder** (W3·W-E·W-F·W-G·W-H) |

---

## §3 Was JEDE Welle TRÄGT

### §3.1 clever-gauss: die Λ-Tiefen (V18.173–V18.177)

**Λ.0/W-E Foundation (V18.173) — die Substanz-Wahrheit als Render-Antenne.**
Neue Methode `_substanceResponseProfile(materialOrTags)` an L39357 (am Ψ1-
Block). Liefert **7 Achsen**:

```
glanz   = (haerte + dichte) / 2                          // Metall spiegelt
tiefe   = dichte                                          // AO/Cel-Kontrast-Gewicht
glimmen = max(magieleitung, brennbar·resoniert·0.5)       // Emissiv
waerme  = lebendig                                        // Subsurface-Warmton
glas    = transparent                                     // Fresnel
wiegen  = lebendig·(1−dichte)·zaehigkeit                  // Wind-Antwort (Λ.3)
detail  = max(lebendig·(1−dichte), magieleitung·transparent)  // Mikro-Cluster (Λ.6)
```

Konsumiert in `_applyAerialOutput` (alter Name beibehalten) als
`opts.substanceProfile`. Die `_toFloat`-Konvertierung macht opts→Floats:
`wMicro = _toFloat(opts.microTexture); if (sp) { wMicro *= 0.7 + 0.6 *
sp.tiefe; wRim *= 0.6 + 0.8 * Math.max(sp.glanz, sp.glimmen); }`.

Im `_buildToonNodeMaterial` an L44849: `matOpts.substanceProfile =
this._substanceResponseProfile(part.material)`. Die `wiegen`-Achse leitet
`matOpts.windSway` ab (L44861).

**`AnazhRealm.AERIAL` erweitert:** `heightWeight 0.6 → 0.75`,
`microStrength 0.1 → 0.14` (V18.177). **`AnazhRealm.INSTANCE_TINT` NEU
frozen:** `{ rangeH: 0.08, rangeS: 0.1, rangeV: 0.06 }`.

**Λ.1 (V18.173) — die Regel heilen.** `_isBodyShaped` (L38648) erweitert
um livingCenterY-Wand:
- `liveMass = Σ (vol × lebendig-Tag)` über alle Parts
- `if (liveMass < T.livingMassMin) return false` (0.02)
- `liveCenterY = liveMassY / liveMass`, normalisiert
- `if (yNorm < 0.30 || yNorm > 0.70) return false`

`SUBSTANCE_ROLE_THRESHOLDS.body` erweitert (L60351): `livingMassMin 0.02`,
`livingCenterMinY 0.30`, `livingCenterMaxY 0.70`.

**Λ.2 (V18.173) — Pro-Instanz-Tint (HISM).** In `spawnArchitecture` (L44504)
werden `entry.tintH/S/V` seed-deterministisch aus Bit-Bändern gesetzt; sie
reisen im Snapshot (L28446) + Restore (L31374). Im `_archInstanceAdd`
(L43796) wird der Tint per `setColorAt` lazy am `InstancedMesh.instanceColor`
appliziert. Im `_archLeafMaterial` (L43583) wird `useInstanceTint` für
Materialien mit `waerme>0.5` gesetzt; der colorNode liest
`attribute("instanceColor")` + HSL-Shift + Saettigung-mix. Im
`_archInstanceGroupGrow` (L43754) wird instanceColor mitkopiert.

**Λ.3 (V18.173) — Wind auf Bäumen.** Im `_buildToonNodeMaterial` ein
positionNode-Sway aus `windUniforms.uWindTime` (EINE Quelle = Gras + Bäume)
für Materialien mit `matOpts.windSway > 0`. Stärke aus
`matOpts.substanceProfile.wiegen`.

**Λ.4 (V18.174/V18.175) — Streu-Vegetation reicher.** In
`_scatterSpeciesGeometry`/`_scatterMaterial`/`_buildVoxelChunkScatter` wird
die Streu-Vegetation pro-Instanz seed-deterministisch in **per-Achsen-
Skalierung** moduliert (V18.175 „Λ.4 vertieft").

**Λ.5 (V18.176) — der Ökoton-Wald: 4 neue Baumarten.** In
`_vegetationSampleSpawn` (L45529/L45568/L45604) wird die candidates-Liste
von 5 auf 10 erweitert: **birke, erle, buche, tanne** kommen dazu. Pro Art
3 Gestalt-Varianten (jung/normal/alt) in `TREE_VARIANTS`, Demographie
30/50/20 in `VARIANT_WEIGHTS`. Plus 522-Zeilen-Erweiterung in
`_defaultBlueprints` — alle laub-Bäume haben **identische Tags** als
Tag-Neutralitäts-Wand (Verteilung emergiert aus aff²-Lottery).

**Λ.6 (V18.173) — Laub-Translucency.** Im `_buildToonNodeMaterial` ein
subsurface-back-lit-Beitrag im colorNode für Materialien mit hohem `detail`.

**Λ.7 (V18.173) — Lichtungs-Atmosphäre.** Im `_dayNightApplyHemiAndFog`
(L55134) zusätzliche Atmo-Uniforms. Im `updateGrowth` (L59109/L59779)
Wachstums-Variationen je Lichtungs-Kontext.

**V18.176** — die wahre Λ-Tiefe (Schöpfer-Konfrontation „Genie?"). +73
Zeilen in `_defaultBlueprints` L41375.

**V18.177 (AAA-Atmosphäre — finaler Akkord).**
- `createGalaxySkybox` L12688 + L12720 — die **drei kaskadierten Sonnen-
  Halos**: `sunGlowWide` (pow 4), `sunGlowMid` (pow 28), `sunGlowDisc`
  (pow 240). `isDayMix`-Gate (`skyLum * 3.5`). Sonne-Mesh 12→18 m.
- `_findNearestArchitectureWithMaterial` L14978/L15099 — 4. Cumulus-Oktave.
- `AnazhRealm.AERIAL`-Konstanten-Bump (siehe oben).

### §3.2 tesla: die W-Wellen (V18.173–V18.179)

**W-E (V18.173, Schritt 1+2+3) — das Frequenzband HARMONISIERT.** Die
saubere Architektur: `_applyAerialOutput` → **`_applySubstanceResponse`
umbenannt** (L22825). Opts → numerische Antennen-Gewichte via
`_p(k) = Math.max(0, Math.min(1, Number(profile[k]) || 0))`. Aufrufer:
- `_buildToonNodeMaterial` L23043
- `_grassInstanceMat` L13209 — **NEU**: Gras am Frequenzband (V18.173
  Schritt 3)

`_substanceResponseProfile(tags)` an L22760:

```
glanz   = min(1, härte·0.6 + dichte·0.4)
tiefe   = dichte
glimmen = min(1, magieleitung·0.55 + wärmeleitung·brennbar·0.6)
waerme  = lebendig
glas    = transparent

// Antennen (Render-Hebel)
micro   = 0.5 + 0.5·tiefe
rim     = 0.4 + 0.6·max(glanz, glas·0.9)
emissiv = 0.5 + glimmen     // darf >1 (Glut), Leser deckelt 1.6
fuell   = 1 − 0.3·tiefe
mond    = 0.35 + 0.65·glanz
```

**`AnazhRealm.SUBSTANCE_RESPONSE`** (L21174) — statischer Getter mit
Familien-Default-Profilen:

```
defaults: {
    feld: { micro: 0, rim: 0, waerme: 0, fuell: 1, mond: 1, emissiv: 0 },
    werk: { micro: 1, rim: 1, waerme: 1, fuell: 1, mond: 0.7, emissiv: 1 },
    gras: { micro: 0, rim: 0, waerme: 1, fuell: 1, mond: 0, emissiv: 0 },
    frei: {},
},
nightFloor: 0.06, moonRim: 0.06
```

Die `terrainNightFloor`-Default zieht aus `SUBSTANCE_RESPONSE.nightFloor`
(L22679) statt 0.12 — EINE Quelle, viele Leser.

**Test-Band: `checkBandWEFrequenzband`**.

**W-F (V18.175) — der Fluss wie von Profis.** `_waterRunSurfaceAt` neu —
die EINE geglättete Lauf-Fläche. `_buildVoxelChunkWaterCellSheet` (L22119)
+4. Boot-Schwimmen via `_tickMountedMovement` (L38997) + `_loopPhysicsSync`
(L58109). **Test-Band: `checkBandWFFluss`**.

**W-G (V18.177) — Werkstatt-Gelenke begreifbar.** Vier neue Methoden:
- `_connectionTypesByStrength` — argmax-Liste
- `_jointTeachLine` — Lehr-Satz
- `_workshopProbeJoints` — Gelenk-Probe (2 s wackeln)
- `_suggestConnectionType` (L53839, +44 Zeilen) — Auto-Vorschlag

`_workshopOpenConnectPopover` +51 Zeilen — Progressive Disclosure +
Lehr-Satz. `index.html` L7307 +37 CSS, L8169 +15 (Gelenk-Probe-Button).
**Test-Band: `checkBandWGGelenke`**.

**W-H (V18.178) + W-H VERTIEFT (V18.179) — der Wald-WOW + Klon-Killer.**
Die zentrale Tat: **Pro-Instanz-Yaw-Rotation** in `_archEntryWorldMatrix`
(L43550, +33 Zeilen) — seed-deterministisch, direkte Matrix-Komposition
T × R_y × S. Plus:
- `_vegetationSampleSpawn` L45609 (+27): Yaw + Größen-Span (±~40 %,
  0.7..1.36) für Eiche/Kiefer-Varianten (`baum_eiche_breit`, `baum_eiche_jung`,
  `baum_kiefer_schlank`) — NUR diese zwei Arten.
- `_defaultBlueprints` L40441 (+245): painterly Krone (7-8 geschichtete
  Laub-Ellipsoide, Vertikal-Gradient, Wurzel-Flare, Knick, Ast).
- `_addConnectionLines` L40154 (+69), `_connectionColor` L40165 (+1).
- `_archEntryWorldMatrix` L43564 +1, `spawnArchitecture` L44502 +3
  (rotationY-Setting).
- `_rebuildArchitectureMesh` L43972 +5.

Snapshot-Reise: `buildStateSnapshot` L28443 (+4):
`...(Number.isFinite(a.rotationY) && a.rotationY !== 0 ? { rotationY: a.rotationY } : {})`.
`_loadStateRestoreArchitectures` L31369 +2.

**Test-Band: `checkBandWHWald`** (6 Invarianten — Yaw-σ, Größen-Span,
asymmetrischer-Ast-Klassifikator-Heilung).

**W3 (V18.176) — der UI-Puls.** Zwei neue Methoden: `_uiDirty(raum)`,
`_uiRoomRegistry`. `_workshopStartRAF` L51541 (+19) + L51550 (+23) —
rAF-gebündelte Render-Inseln. Diverse +1-Zeilen-Anpassungen über UI-
Konsumenten. **Test-Band: `checkBandW3UiPuls`**.

**W6 (V18.174) — der Stamm-Atlas.** Top-Region (L9 +36, L38 +1) trägt den
Atlas-Header (26 §-Zonen) + `scripts/diag-atlas.cjs` (+114 neu) als Live-
Karte und Drift-Wand. 26 `// ===== ATLAS §NN`-Marker verteilt. **`npm run
check` erweitert** um `&& node scripts/diag-atlas.cjs --check`. 28 trivial-
Edits (6→7 oder 7→7 Zeilen) über die ganze Datei — Atlas-Marker-Einsetzung.

`CLAUDE.md`-Schlankung −132 Zeilen.
`save-server.js` +7: `PORT = Number(process.env.PORT) || 4312`.

### §3.3 Konvergenz-Befund: beide haben Λ.0/W-E unabhängig erfunden

Die Plan-Anker stimmen überein:
- clever-gauss: „Λ.0/W-E FOUNDATION (das Frequenzband)" (V18.173-Commit)
- tesla: „W-E (meister-plan §8.3, V18.173) — `_applySubstanceResponse` ist
  die Verallgemeinerung" (V18.173 Schritt 1+2+3)

Beide nennen `meister-plan §8.3` als Quelle. Beide haben dasselbe Plan-
Dokument gelesen und unabhängig implementiert. Das ist die Konvergenz, die
diesen Synthese-Bedarf strukturell erzeugt.

---

## §4 Die volle Hunk-Karte (122 Hunks)

### §4.1 clever-gauss: 36 Hunks

| # | L-Bereich | Δ | Methode | Welle |
| --- | --- | --- | --- | --- |
| 1 | 12688–12698 | +4 | `createGalaxySkybox` | V18.177 AAA Halos |
| 2 | 12720–12740 | +20 | `createGalaxySkybox` | V18.177 AAA Halos |
| 3 | 14978–15046 | +111 | `_findNearestArchitectureWithMaterial` | V18.177 Cumulus |
| 4 | 15099–15125 | +34 | `_findNearestArchitectureWithMaterial` | V18.177 Cumulus |
| 5 | 22557–22571 | +4 | `_ensureAtmoUniforms` | Λ.0 (M7-Block) |
| 6 | 22675–22692 | +30 | `_applyAerialOutput` | **Λ.0 (opts→Floats) — KONFLIKT** |
| 7 | 22695–22712 | −3 | `_applyAerialOutput` | **Λ.0 — KONFLIKT** |
| 8 | 22723–22746 | +52 | `_applyAerialOutput` | **Λ.0 — KONFLIKT** |
| 9 | 22833–22847 | +106 | `_buildToonNodeMaterial` | Λ.2 instanceColor + Λ.3 wind + Λ.6 detail |
| 10 | 26388–26403 | +5 | `_scatterSpeciesGeometry` | Λ.4 Streu-Varianz |
| 11 | 26404–26422 | +92 | `_scatterSpeciesGeometry` | Λ.4 per-Achsen |
| 12 | 26493–26500 | 0 | `_scatterMaterial` | Λ.4 |
| 13 | 26501–26507 | +28 | `_scatterMaterial` | Λ.4 Material-Variation |
| 14 | 26726–26733 | +29 | `_buildVoxelChunkScatter` | Λ.4 Verteilung |
| 15 | 26741–26747 | +14 | `_buildVoxelChunkScatter` | Λ.4 |
| 16 | 26748–26764 | +17 | `_buildVoxelChunkScatter` | Λ.4 |
| 17 | 28446–28452 | +10 | `buildStateSnapshot` | **Λ.2 tintH/S/V — TRIVIAL UNION** |
| 18 | 31314–31320 | +26 | `_loadStateRestoreCraftingInventory` | Λ-Restore |
| 19 | 31374–31380 | +4 | `_loadStateRestoreArchitectures` | **Λ.2 Restore — TRIVIAL UNION** |
| 20 | 38648–38655 | +39 | `_isBodyShaped` | Λ.1 livingCenterY |
| 21 | 38716–38722 | +52 | `_isPortalShaped` | Λ.1-Anker (Doc) |
| 22 | 40485–40491 | +516 | `_defaultBlueprints` | **Λ.5 (4 neue Bäume) — KONFLIKT mit W-H** |
| 23 | 41375–41381 | +67 | `_defaultBlueprints` | **Λ.5 Vertiefung — KONFLIKT** |
| 24 | 43583–43589 | +21 | `_archLeafMaterial` | Λ.2 `useInstanceTint` |
| 25 | 43754–43760 | +11 | `_archInstanceGroupGrow` | Λ.2 instanceColor mitkopieren |
| 26 | 43796–43802 | +12 | `_archInstanceAdd` | Λ.2 setColorAt |
| 27 | 43803–43809 | +8 | `_archInstanceAdd` | Λ.2 |
| 28 | 44504–44510 | +20 | `spawnArchitecture` | **Λ.2 tintH/S/V — TRIVIAL UNION mit W-H rotationY** |
| 29 | 45529–45536 | +28 | `_vegetationSampleSpawn` | **Λ.5 candidates — KONFLIKT** |
| 30 | 45568–45601 | +54 | `_vegetationSampleSpawn` | **Λ.5 TREE_VARIANTS — KONFLIKT** |
| 31 | 45604–45621 | +9 | `_vegetationSampleSpawn` | **Λ.5 — KONFLIKT** |
| 32 | 55134–55144 | +4 | `_dayNightApplyHemiAndFog` | Λ.7 Atmo-Uniforms |
| 33 | 57058–57081 | +5 | `_kvRow` | (Bug-Zone §6.3) |
| 34 | 59109–59116 | 0 | `updateGrowth` | Λ.7 |
| 35 | 59779–59785 | +16 | `updateGrowth` | Λ.7-Konstanten |
| 36 | 60351–60357 | +12 | `updateGrowth` | Λ.1 SUBSTANCE_ROLE_THRESHOLDS |

### §4.2 tesla: 86 Hunks (gekürzt — nur die substanzhaltigen)

Atlas-Marker-Hunks (28 Stück mit +1 oder 0 Zeilen) sind in der vollständigen
Liste, hier zusammengefasst. Die substanziellen Hunks:

| # | L-Bereich | Δ | Methode | Welle |
| --- | --- | --- | --- | --- |
| 1 | 9–44 | +36 | (top) | W6 Atlas-Registry-Header |
| 8 | 13155–13177 | +17 | `_grassInstanceMat` | **W-E Schritt 3 (Gras am Frequenzband)** |
| 24 | 21088–21138 | +45 | `_setLastPlayerVoxelChunk` | **W6 SUBSTANCE_RESPONSE-Getter** |
| 25 | 22119–22127 | +4 | `_buildVoxelChunkWaterCellSheet` | W-F Fluss |
| 27 | 22557–22570 | 0 | `_ensureAtmoUniforms` | **W-E (nightFloor aus SR) — KONFLIKT** |
| 28 | 22633–22675 | +37 | `_syncAtmoToViewDistance` | **W-E `_substanceResponseProfile`-NEU** |
| 29 | 22662–22679 | +11 | `_syncAtmoToViewDistance` | W-E Anschluss |
| 30 | 22675–22711 | +7 | `_applyAerialOutput` | **W-E (Rename + Antennen) — KONFLIKT** |
| 31 | 22723–22746 | +5 | `_applyAerialOutput` | **W-E — KONFLIKT** |
| 32 | 22808–22841 | +20 | `_buildToonNodeMaterial` | **W-E — KONFLIKT mit Λ.2** |
| 33 | 22823–22844 | +10 | `_buildToonNodeMaterial` | **W-E — KONFLIKT** |
| 34 | 22912–22918 | +8 | `_buildToonNodeMaterial` | W-E |
| 36 | 23095–23100 | +1 | `_buildToonNodeMaterial` | W-E |
| 37 | 24334–24340 | +50 | `_atlasWaterLevelAt` | W-F |
| 38 | 24610–24615 | +6 | `_hydroRiverAt` | W-F |
| 39 | 25835–25844 | +17 | `_ensureHydroSurfaceMaterial` | W-F |
| 43 | 28443–28449 | +4 | `buildStateSnapshot` | **W-H rotationY — TRIVIAL UNION mit Λ.2** |
| 45 | 31232–31241 | +7 | `_loadStateRestoreSoulAndAtmosphere` | Atmosphäre-Restore (W-E) |
| 46 | 31369–31374 | +2 | `_loadStateRestoreArchitectures` | **W-H rotationY — TRIVIAL UNION** |
| 47 | 33660–33679 | +54 | `equipHeld` | W-G |
| 50 | 38827–38860 | +24 | `_vehicleProfile` | W-F (Boot-Schwimmen) |
| 51 | 38997–39015 | +13 | `_tickMountedMovement` | W-F |
| 53 | 39909–39914 | +3 | `_buildFromBlueprint` | W-H |
| 54 | 40154–40159 | +69 | `_addConnectionLines` | W-G |
| 55 | 40165–40170 | +1 | `_connectionColor` | W-G |
| 56 | 40441–40527 | +245 | `_defaultBlueprints` | **W-H Painterly — KONFLIKT mit Λ.5** |
| 57 | 41375–41381 | +23 | `_defaultBlueprints` | **W-H — KONFLIKT** |
| 59 | 43550–43588 | +33 | `_archEntryWorldMatrix` | **W-H Pro-Instanz-Yaw — PFLICHT** |
| 61 | 43579–43584 | +2 | `_archLeafMaterial` | **W-H — Adjacency zu Λ.2** |
| 62 | 43972–43977 | +5 | `_rebuildArchitectureMesh` | W-H |
| 63 | 44502–44508 | +3 | `spawnArchitecture` | **W-H rotationY — TRIVIAL UNION** |
| 68 | 45609–45620 | +27 | `_vegetationSampleSpawn` | **W-H Eiche/Kiefer-Varianten — KONFLIKT mit Λ.5** |
| 71 | 49640–49645 | +6 | `_hofHandleDrawerChange` | W3 |
| 73 | 51450–51455 | +6 | `_workshopInstallUIListeners` | W3 |
| 74 | 51541–51546 | +19 | `_workshopStartRAF` | W3 rAF |
| 75 | 51550–51555 | +23 | `_workshopStartRAF` | W3 |
| 76 | 53839–53844 | +44 | `_suggestConnectionType` | W-G |
| 77 | 53981–53990 | +6 | `_workshopOpenConnectPopover` | W-G |
| 78 | 54017–54023 | +45 | `_workshopOpenConnectPopover` | W-G |
| 80 | 55137–55143 | 0 | `_dayNightApplyHemiAndFog` | **Adjacency zu Λ.7** |
| 84 | 58109–58116 | +13 | `_loopPhysicsSync` | W-F Boot |
| 85 | 59090–59095 | +2 | `updateGrowth` | **Adjacency zu Λ.7** |

Die restlichen 43 tesla-Hunks sind reine Atlas-Marker-Einsetzungen (jeweils
6→7 Zeilen, +1 Kommentar-Zeile pro Methoden-Header).

### §4.3 Direkte Overlap-Hunks (14)

Methoden mit echtem Berührungs-Konflikt (selbe oder fast selbe Zeilen
beidseitig geändert):

| Methode | clever-gauss-Bereich | tesla-Bereich | Konflikt-Klasse |
| --- | --- | --- | --- |
| `_ensureAtmoUniforms` | L22557 +4 | L22557 0 | **leicht** |
| `_applyAerialOutput`/`_applySubstanceResponse` | L22675-L22745 (3 Hunks) | L22675-L22746 (2 Hunks) | **SCHWER — Rename + Architektur-Synthese** |
| `_buildToonNodeMaterial` | L22833 +106 | L22808/22823/22912/23095 +39 | **MITTEL — Λ.2/Λ.3 vs W-E-Antennen** |
| `_dayNightApplyHemiAndFog` | L55134 +4 | L55137 0 | **trivial** |
| `_loadStateRestoreArchitectures` | L31374 +4 | L31369 +2 | **TRIVIAL UNION** |
| `buildStateSnapshot` | L28446 +10 | L28443 +4 | **TRIVIAL UNION** |
| `_defaultBlueprints` | L40485 +516, L41375 +67 | L40441 +245, L41375 +23 | **SCHWER — Λ.5 + W-H Painterly** |
| `_archLeafMaterial` | L43583 +21 | L43579 +2 | **MITTEL** |
| `spawnArchitecture` | L44504 +20 | L44502 +3 | **TRIVIAL UNION** |
| `_vegetationSampleSpawn` | L45529/L45568/L45604 +91 | L45609 +27 | **SCHWER — Λ.5 candidates + W-H Yaw/Scale** |
| `updateGrowth` | L59109 0, L59779 +16, L60351 +12 | L59090 +2, L59109 0 | **leicht** |

Plus 15 nahe Adjazenzen (≤50 Zeilen Abstand), die sorgfältige Inspektion
beim Merge brauchen — vor allem in der `_buildToonNodeMaterial`-Region
(L22808-L23100) und der `_vegetationSampleSpawn`-Region (L45500-L45620).

---

## §5 Die Name-Konflikte

### §5.1 EINE Methode beide neu erfunden

`_substanceResponseProfile` — beide Branches haben sie unabhängig
hinzugefügt, mit **unterschiedlichen Signaturen** und **Return-Shapes**:

| Aspekt | clever-gauss (L39357) | tesla (L22760) |
| --- | --- | --- |
| Signatur | `(materialOrTags)` — flexibel | `(tags)` — strikt |
| Position | am Ψ1-Block (R1-Resonanz) | direkt vor `_applySubstanceResponse` |
| Return-Achsen | 7 (Substanzen) | 5 Substanzen + 5 Antennen = 10 |
| Spezifisch | `wiegen`, `detail` (clever-gauss-only) | `micro`, `rim`, `emissiv`, `fuell`, `mond` (tesla-only) |
| Glanz-Formel | `(härte + dichte) × 0.5` | `min(1, härte·0.6 + dichte·0.4)` |
| Glimmen-Formel | `max(magieleitung, brennbar·resoniert·0.5)` | `min(1, magieleitung·0.55 + wärmeleitung·brennbar·0.6)` |
| Aufrufer | 1 (`_buildToonNodeMaterial` L44849) | 1 (`_buildToonNodeMaterial` via L23043) |

**Synthese:** siehe §9.

### §5.2 KEINE Konstanten-Konflikte

| Branch | Neue `AnazhRealm.X` |
| --- | --- |
| clever-gauss | `AERIAL` (erweitert), `INSTANCE_TINT` (NEU) |
| tesla | `SUBSTANCE_RESPONSE` (NEU, statischer Getter) |

Keine Überlappung. Alle drei können koexistieren.

### §5.3 KEINE state-Slot-Konflikte

`this.state.atmosphere.microStrength`, `terrainNightFloor`, `terrainMoonRim`
werden in beiden Branches verwendet, aber die Default-Quellen sind
unterschiedlich (clever-gauss: hardcoded 0.06; tesla:
`SUBSTANCE_RESPONSE.nightFloor`). Bei der Synthese gewinnt tesla's Quelle
(beide Wege ergeben denselben Wert; tesla hat die Verdichtungs-Disziplin).

### §5.4 Methoden NUR in tesla (8 neu)

| Methode | Welle | Zweck |
| --- | --- | --- |
| `_applySubstanceResponse` | W-E | EINE Empfänger des Frequenzbands (Rename) |
| `_substanceResponseProfile` | W-E | Substanz-Profil (siehe §5.1) |
| `_uiDirty` | W3 | UI-Raum-dirty-Marker |
| `_uiRoomRegistry` | W3 | Registry der UI-Räume |
| `_connectionTypesByStrength` | W-G | argmax-Liste Verbindungs-Typen |
| `_jointTeachLine` | W-G | Lehr-Satz für Gelenke |
| `_workshopProbeJoints` | W-G | Gelenk-Probe (2 s wackeln) |
| `_waterRunSurfaceAt` | W-F | geglättete Fluss-Lauf-Fläche |

### §5.5 Methoden NUR in clever-gauss (1 neu)

| Methode | Welle | Zweck |
| --- | --- | --- |
| `_substanceResponseProfile` | Λ.0 | Substanz-Profil (siehe §5.1) |

### §5.6 Methode in tesla ENTFERNT (1)

`_applyAerialOutput` — umbenannt zu `_applySubstanceResponse`. Alle alten
Aufrufer wandern. clever-gauss behält den alten Namen. Beim Merge MUSS
clever-gauss's einziger Aufrufer (L23099 in `_buildToonNodeMaterial`) auf
`_applySubstanceResponse` umgestellt werden.

---

## §6 Die GEMESSENEN Bugs — fünf Stück, branch-unabhängig

Alle fünf leben in V18.172 (gemeinsamer Stamm) und sind in beiden Branches
NICHT geheilt. Die Bug-Welle (V18.180-FIX) landet AUF V18.172, sodass beide
Branches sie nach Rebase tragen.

### §6.1 Der `revokedKeys`-Set/Object-Bug (KRITISCH)

**Diagnose:** `revokedKeys` wird in `_loadRevokedKeys` (`anazhRealm.js:29942`)
als plain Object aufgebaut. VIER Stellen behandeln es aber als Set:

| Stelle | Code | Wirkung |
| --- | --- | --- |
| `anazhRealm.js:37894` (`grantCapability`) | `revokedKeys.has(prop.authorPubKey)` | würde `TypeError` werfen |
| `anazhRealm.js:37934` (`runCapability`) | `revokedKeys.has(cap.authorPubKey)` | würde `TypeError` werfen |
| `scripts/playtest.cjs:29076` | `if (revokedKeys.add) { ... } else { out.revokeStops = true; }` | **silent skip** — Test passt ohne zu prüfen |
| `scripts/playtest.cjs:28066` | `if (revokedKeys.delete) revokedKeys.delete(...)` | Cleanup wirkt nie, Datenmüll wandert |

Die R4-Wand des `robustheit-plan.md` ist GEMESSEN nicht durchgeprüft —
der Test gattet sich selbst raus. `grantCapability`/`runCapability` würden
im Browser werfen, sobald ein revokierter Schlüssel im Pfad auftritt.

**Heilung — Map gewinnt** (Symmetrie zu `state.socialRatings`):

```javascript
// anazhRealm.js:29942
_loadRevokedKeys() {
    const out = new Map();
    try {
        const raw = typeof localStorage !== "undefined"
            ? localStorage.getItem("anazh.revokedKeys") : null;
        if (!raw) return out;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return out;
        for (const k of Object.keys(parsed)) {
            const norm = this._normalizePubKey(k);
            if (norm) out.set(norm, {
                at: typeof parsed[k] === "number" ? parsed[k] : Date.now()
            });
        }
    } catch { /* korrupter Eintrag → leere Map */ }
    return out;
}

// anazhRealm.js:29959
_saveRevokedKeys() {
    try {
        if (typeof localStorage !== "undefined") {
            const flat = {};
            const rk = this.state.revokedKeys || new Map();
            for (const [k, v] of rk) flat[k] = (v && v.at) || Date.now();
            localStorage.setItem("anazh.revokedKeys", JSON.stringify(flat));
        }
    } catch (e) {
        this.log(`revokedKeys-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
    }
}

// anazhRealm.js:29973
_isKeyRevoked(pubkeyHex) {
    const norm = this._normalizePubKey(pubkeyHex);
    return !!(norm && this.state.revokedKeys && this.state.revokedKeys.has(norm));
}

// anazhRealm.js:29986
revokeKey(pubkey, opts) {
    opts = opts || {};
    const norm = this._normalizePubKey(pubkey);
    if (!norm) return { ok: false, reason: "invalid_key" };
    if (!this.state.revokedKeys) this.state.revokedKeys = new Map();
    this.state.revokedKeys.set(norm, { at: Date.now() });
    this._saveRevokedKeys();
    const purged = this._purgeRevokedArtifacts();
    if (!opts.silent && typeof this.journalAppend === "function") {
        this.journalAppend("ritual",
            `Ich rief einen Schlüssel zurück (${this._vibeFingerprint(norm)}) — ${purged} Artefakt(e) ausgestoßen.`);
    }
    return { ok: true, key: norm, purged };
}

// anazhRealm.js:29999
unrevokeKey(pubkey) {
    const norm = this._normalizePubKey(pubkey);
    if (!norm || !this.state.revokedKeys || !this.state.revokedKeys.has(norm))
        return { ok: false };
    this.state.revokedKeys.delete(norm);
    this._saveRevokedKeys();
    return { ok: true, key: norm };
}

// L37894 + L37934: KEIN Code-Change — .has() ist jetzt korrekt

// scripts/playtest.cjs:28066 — Cleanup wirkt jetzt
if (typeof r.revokeKey === "function") {
    r.revokeKey(pubHex, { reason: "band134" });
    // ... Asserts ...
    r.state.revokedKeys.delete(pubHex.toLowerCase());
}

// scripts/playtest.cjs:29076 — Test prüft das echte Verhalten
const pub = "cd".repeat(32);
r.state.grantedCapabilities["regen-tanz"].authorPubKey = pub;
r.state.revokedKeys.set(pub, { at: Date.now() });
out.revokeStops = r.runCapability("regen-tanz").reason === "revoked";
r._portalReceiveCapability({ type: "capability", name: "zweite",
    dsl: ["weather", "sunny"] });
const p2 = r.state.capabilityProposals.get("zweite");
if (p2) p2.authorPubKey = pub;
out.revokeGates = r.grantCapability("zweite", { skipConfirm: true })
    .reason === "revoked";
r.state.revokedKeys.delete(pub);
```

**Neue Source-Invariante:** keine `revokedKeys\.(add|delete|set|has)`-
Aufrufe hinter `if`-Gates in `scripts/playtest.cjs`. Das `if (api.exists)`-
Anti-Pattern strukturell verbieten.

### §6.2 Math.random in `_worldgenSpawnFloatingIslands` (Γ5-Verletzung)

**Diagnose:** `anazhRealm.js:18774–18810` enthält 6 unseeded
`Math.random()`-Calls in einer `_worldgen*`-Funktion. Verletzt das
V18.166-Γ5-STREAM-GESETZ „NIE Math.random in Welt-Substanz-Pfaden". Die
`diag-genese.cjs`-Zensus-Liste (12 hand-kuratierte Funktionen) sieht es
nicht. Von 6 `_worldgen*`-Methoden ist NUR diese eine verletzt.

**Heilung:**

```javascript
// anazhRealm.js:18774
_worldgenSpawnFloatingIslands(WORLD_SIZE) {
    this.state.floatingIslands = [];
    this.state.ufos = [];
    const numIslands = 3;
    const baseSeed = (this.state.worldMeta && this.state.worldMeta.seed)
        || "anazh-realm-seed";
    for (let i = 0; i < numIslands; i++) {
        const rng = this._streamRng(baseSeed + `-island-${i}`);
        const islandSize = 14 + rng() * 30;
        const islandHeight = 6 + rng() * 10;
        const islandX = (rng() - 0.5) * WORLD_SIZE * 0.8;
        const islandZ = (rng() - 0.5) * WORLD_SIZE * 0.8;
        const surfY = typeof this._voxelSurfaceY === "function"
            ? this._voxelSurfaceY(islandX, islandZ) : 0;
        const baseSurf = Number.isFinite(surfY) ? surfY
            : this.state.terrainBaseHeight || 0;
        const islandY = baseSurf + 50 + rng() * 90;
        const islandSeed = baseSeed + `-island-${i}`;
        const island = this.spawnIslandAt(islandX, islandY, islandZ, islandHeight, {
            size: islandSize, seed: islandSeed,
        });
        if (!island) continue;
        this.log(/* unverändert */);
        const ufoGeometry = new THREE.ConeGeometry(1, 2, 8);
        const ufoMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const ufo = new THREE.Mesh(ufoGeometry, ufoMaterial);
        const ufoY = islandY + 5;
        ufo.position.set(islandX, ufoY, islandZ);
        this.state.scene.add(ufo);
        this.state.ufos.push(ufo);
        ufo.userData = { baseY: ufoY, speed: rng() * 0.5 + 0.5 };
    }
}
```

**Zensus systematisch erweitern:**

```javascript
// scripts/diag-genese.cjs:298 — alle _worldgen* automatisch
const e = await page.evaluate(() => {
    const r = window.anazhRealm;
    const manual = [
        "_vegetationSampleSpawn", "_buildVoxelChunkScatter",
        "_buildDekoFernfeldSpecies", "_kronenMult", "_feuchteAt",
        "_hydroDistAt", "worldFieldAt", "_clumpAt",
        "_terrainBaseDensityAt", "_computeHydrosphere",
        "_computeErosion", "spawnAffinityForBlueprint",
    ];
    const proto = Object.getPrototypeOf(r);
    const worldgen = Object.getOwnPropertyNames(proto)
        .filter(n => n.startsWith("_worldgen") && typeof r[n] === "function");
    const fns = [...new Set([...manual, ...worldgen])];
    const hits = [];
    for (const fn of fns) {
        const f = r[fn];
        if (typeof f !== "function") { hits.push(fn + ":FEHLT"); continue; }
        const src = f.toString().replace(/\/\/[^\n]*/g, "");
        if (/Math\.random/.test(src)) hits.push(fn);
    }
    return hits;
});
check(e.length === 0, "kein Math.random in worldgen-Pfaden",
    e.length ? e.join(", ") : `${fns.length} Fn sauber (worldgen-auto-sweep)`);
```

### §6.3 Vier tote Helfer

| Methode | Zeile | Befund |
| --- | --- | --- |
| `_kvRow` | `:58233` | Kommentar nennt es „häufigste Panel-Muster"; GEMESSEN null Aufrufer |
| `_archInstanceUpdate` | `:45128` | Kommentar gibt zu: „Mount-Follow nutzt das NICHT" |
| `_equipAppendArmorRow` | `:58052` | ~30 Zeilen, null Aufrufer |
| `_equipAppendEmptyHint` | `:58130` | 8 Zeilen, null Aufrufer |

**Heilung:** alle vier löschen. Vor jedem Löschen: `grep -rn "<methodname>"
anazhRealm.js voxel-worker.js scripts/ index.html`. **Warnung:** clever-gauss
hat den `_kvRow`-Bereich angefasst (Hunk #33, L57058 +5) — prüfen, ob ein
Aufrufer hinzugefügt wurde. Wenn ja, Bug ist behoben; wenn nein, Löschen
sicher.

### §6.4 `_hydroWaterLevelAt` durch `_waterLevelAt` ersetzen

**Diagnose:** `anazhRealm.js:25822`, einziger Aufrufer an L59534 als
„Backward-Compat"-Fallback. Der Aufruf-Kommentar gibt offen zu:
> `_hydroWaterLevelAt` gibt für einen BERGSEE den MEERES-Spiegel zurück
> — die V9.69-Zwei-Skalen-Lücke.

Plus: O(n) `BBox`+`Array.includes`-Lookup. `_waterLevelAt` macht es
richtig (O(1) Ozean + O(9) See/Fluss).

**Heilung:**

```javascript
// anazhRealm.js:59534
// VORHER: const effWater = this._hydroWaterLevelAt(wcx, wcz);
// NACHHER:
const effWater = this._waterLevelAt(wcx, wcz);
```

Plus: `_hydroWaterLevelAt`-Definition komplett löschen.

**Vor-Bau-Test-Invariante** (Wasser-Band): „Spieler am Streaming-Rand
eines Bergsees: Auftrieb wirkt korrekt nach oben". Vor dem Refactor rot,
nach dem Refactor grün.

### §6.5 Das `if (api.exists)`-Anti-Pattern strukturell

Über §6.1 hinaus: alle `if (api.exists)`-Patterns in `playtest.cjs`
durchgehen. Wo legitim (Optional-Feature wie `if (typeof indexedDB !==
"undefined")`): explizit als `out.skipReason = "..."` ausweisen, sodass
viele Skips sichtbar werden statt still durch zu laufen. Wo Konstrukt-
Fehler (wie §6.1): heilen.

`audit:strict` bekommt eine Wand: keine NEUEN
`if\s*\(.*\.(has|add|set|delete)\)`-Patterns in `scripts/playtest.cjs`
außer in einer expliziten Zulassungs-Liste.

---

## §7 Was bei BEIDEN noch FEHLT

### §7.1 clever-gauss hat 0 neue Test-Bänder für Λ.2–Λ.7

**Diagnose:** GEMESSEN. clever-gauss-Diff in `playtest.cjs` ist +42 Zeilen
(5 Test-Wanderungen in bestehenden Bändern). **KEIN einziges neues Band
für Λ.2 (Tint), Λ.3 (Wind), Λ.4 (Streu), Λ.5 (Mischwald), Λ.6 (Translucency),
Λ.7 (Atmo).**

Die Λ-Funde leben heute nur in diag-Skripten (`diag-lebendige-welt`,
`diag-lambda4`, `diag-lambda-volltiefe`, `diag-fischer-wand`). Diese
laufen NICHT im normalen `npm run playtest`-Gate. Eine Regression an
Λ.2/Λ.3/Λ.4/Λ.5/Λ.6/Λ.7 wäre nicht im playtest sichtbar.

**Heilung:** im Zuge von V18.181-merge-Λ entstehen 7 Bänder:

| Neues Band | Was prüft es | Quelle |
| --- | --- | --- |
| `checkBandLambda1LivingCenter` | `_isBodyShaped` für humanoid yNorm≈0.4 true; für Krone yNorm>0.7 false | aus `diag-archetypbank.cjs` |
| `checkBandLambda2HismSynthese` | Hue-σ + Yaw-σ über 100 HISM-Einträge; Snapshot/Restore-Round-Trip | aus `diag-lebendige-welt` |
| `checkBandLambda3Wind` | `_substanceResponseProfile(holz).wiegen > 0.2`; `(stein).wiegen === 0`; `matOpts.windSway` wird gesetzt | neu |
| `checkBandLambda4Streu` | per-Achsen-Skalierung GEMESSEN über N Streu-Samples | aus `diag-lambda4` |
| `checkBandLambda5MischwaldSynthese` | candidates-Liste 10 Einträge; TREE_VARIANTS deckt 4 neue Bäume; Yaw+Scale für alle | aus `diag-lambda-volltiefe` |
| `checkBandLambda6Detail` | `_substanceResponseProfile(glas).detail > 0.4`; `(stein).detail === 0` | neu |
| `checkBandV18177AAA` | drei Sonnen-Halos; Cumulus 4. Oktave; AERIAL.heightWeight=0.75 | aus `diag-fischer-wand` |

### §7.2 tesla hat keine `INSTANCE_TINT`-Konstante

clever-gauss bringt sie mit. In der Synthese landet `AnazhRealm.INSTANCE_TINT`
in Atlas §26 AUSSEN-KONSTANTEN neben `SUBSTANCE_RESPONSE`.

### §7.3 Tesla hat keine `diag-archetypbank.cjs`

clever-gauss hat eine eigene Archetypen-Bank (80 Zeilen). Tesla hat eine
im playtest-Band integrierte Bank (`checkBandWHWald`). **Risiko der
Dublette:** wenn beide ungetrennt landen, gibt es zwei Wahrheiten. Heilung
in Welle 5: die clever-gauss-Bank wandert ins tesla-Band (V9.82-Verdichtung)
ODER bleibt eigenständig, wenn sie sich genuin unterscheidet.

### §7.4 Keine Wand gegen Math.random in MEHREREN `_worldgen*`

Auch nach §6.2: was, wenn jemand eine `_worldgen*`-Methode umbenennt zu
`_initWorldFoo`? Die `_worldgen`-Prefix-Konvention bräuchte eine
Lint-Wand. Vorschlag (NICHT verpflichtend in dieser Welle): jede Methode
in `init()`'s Welt-Aufbau-Pfad, die nicht aus tags-/seed-Quellen kommt,
ist worldgen. Eine spätere Welle könnte die Konvention härter machen.

### §7.5 Beide haben keine Synthese-Wand

Selbstreferentiell: nach dem Merge kann keine Wand sagen „der Merge ist
vollständig" — nur „die alten Wände sind grün". Eine Synthese-Wand wäre:
`_substanceResponseProfile` LIEFERT 12 Felder (7 Substanzen + 5 Antennen).
Wenn nur 5 oder nur 7 → die Synthese ist halb. Welle V18.181 bringt diese
Wand (siehe §9.4).

---

## §8 Die SYNTHESE-Strategie: Tesla als Basis

### §8.1 Die Wahl, voll begründet

**(A) clever-gauss als Basis, tesla cherry-picken.** Verworfen:
- Tesla hat 50% mehr Hunks (86 vs 36)
- Tesla hat 5 neue playtest-Bänder vs 0 in clever-gauss
- Tesla hat den Stamm-Atlas (Drift-Wand im `npm run check`)
- Tesla hat das saubere Rename `_applyAerialOutput`→`_applySubstanceResponse`
- Tesla hat die statische `SUBSTANCE_RESPONSE`-Tabelle (EINE Quelle)
- Tesla berührt `index.html` substantiell (+61) und `save-server.js` (+7)
- Tesla hat den Wald-WOW-Pro-Instanz-Yaw (Klon-Killer)
- clever-gauss auf tesla zu hieven legt Mehrarbeit auf die kleinere Seite

**(B) Beide gleichberechtigt 3-Wege-Merge.** Verworfen:
- Am `_substanceResponseProfile`-Namens-Konflikt würde ein 3-Wege-Merge
  Marker werfen
- Bei der `_applyAerialOutput`→`_applySubstanceResponse`-Umbenennung wäre
  der maschinelle Merge inkohärent
- Es gibt keine maschinell saubere Antwort

**(C) Tesla als Basis, clever-gauss cherry-picken mit Synthese.** **GEWÄHLT.**

### §8.2 Was aus clever-gauss MUSS cherry-gepickt werden

In Reihenfolge der Cherry-Pick-Sicherheit:

1. **Λ.2 Pro-Instanz-Tint** — orthogonal zur Tesla-Architektur, berührt nur
   HISM-Pfad + Snapshot/Restore. Synergie mit tesla W-H: beide pro-Instanz,
   beide orthogonal in HISM-Buffern (instanceMatrix vs instanceColor),
   beide reisen im Snapshot parallel.
2. **Λ.1 livingCenterY-Heilung** — Klassifikator-Logik, orthogonal zu W.
   Achtung Konvergenz: tesla hat asymmetrischer-Ast-Heilung; die Synthese
   trägt BEIDE.
3. **Λ.4 Streu-Vegetation per-Achsen-Skalierung** — Tesla berührt diese
   Methoden nicht.
4. **Λ.5 Mischwald** — MITTLERER Konflikt mit tesla W-H (siehe §10).
5. **Λ.3 Wind-Sway** — konsumiert `matOpts.windSway` aus dem Synthese-Profil.
6. **Λ.6 Laub-Translucency** — konsumiert `matOpts.substanceProfile.detail`.
7. **`wiegen` + `detail` Profil-Achsen** ins `_substanceResponseProfile` (§9).
8. **V18.177 AAA-Atmosphäre** — drei Sonnen-Halos in tesla's Skybox-Region
   einhängen (§12).

### §8.3 Was aus clever-gauss FÄLLT

1. **Der `_applyAerialOutput`-Name + die `_toFloat`-Konverter-Logik** —
   tesla's Rename ist die saubere Lösung.
2. **Die ad-hoc-Modulation am Konsumenten** (`wMicro *= 0.7 + 0.6*sp.tiefe`)
   — die Modulation gehört ins Profil (Tesla's Antennen-Felder).
3. **Die parallel implementierte `nightFloor`-Quelle** in clever-gauss
   (`AnazhRealm.AERIAL`-only) — tesla's `SUBSTANCE_RESPONSE.nightFloor`
   gewinnt (EINE Quelle).

### §8.4 Was aus tesla bleibt unangetastet

- Stamm-Atlas + 26 §-Marker + `diag-atlas --check`
- W-E `_applySubstanceResponse`-Rename
- W-E statische `SUBSTANCE_RESPONSE`-Tabelle
- W-F Fluss-Glättung + Boot-Schwimmen
- W-G Werkstatt-Gelenke + Progressive Disclosure + Lehr-Satz + Probe
- W-H Pro-Instanz-Yaw + Painterly Krone (eiche/kiefer) + Eiche/Kiefer-Varianten
- W3 UI-Puls (`_uiDirty`, `_uiRoomRegistry`, rAF-Inseln)
- W6 CLAUDE.md-Schlankung
- `save-server.js` ENV-PORT
- `package.json`-`check`-Erweiterung

---

## §9 Die `_substanceResponseProfile`-Synthese — DETAILLIERT

### §9.1 Die Synthese-Form (12 Felder)

```javascript
// V18.181-merge-Λ — die EINE Profil-Funktion
// 5 Substanzen (tesla-Sprache + Formeln) + 2 clever-gauss-Achsen
// + 5 Antennen (tesla). Total 12 Felder.
// Signatur: flexibel (clever-gauss-Form gewinnt — defensiver)
_substanceResponseProfile(materialOrTags) {
    let tags = null;
    if (materialOrTags && typeof materialOrTags === "object") {
        if (materialOrTags.tags && typeof materialOrTags.tags === "object") {
            tags = materialOrTags.tags;
        } else {
            tags = materialOrTags;
        }
    } else if (typeof materialOrTags === "string" && this.state.materials) {
        const mat = this.state.materials[materialOrTags];
        if (mat && mat.tags) tags = mat.tags;
    }
    if (!tags) tags = {};
    const t = (k) => {
        const v = +tags[k];
        return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
    };
    const haerte = t("härte");
    const dichte = t("dichte");
    const zaehigkeit = t("zähigkeit");
    const magieleitung = t("magieleitung");
    const transparent = t("transparent");
    const brennbar = t("brennbar");
    const lebendig = t("lebendig");
    const resoniert = t("resoniert");
    const waermeleitung = t("wärmeleitung");
    // Substanzen — tesla-Formeln (strikter clamp), 5 Achsen:
    const glanz = Math.min(1, haerte * 0.6 + dichte * 0.4);
    const tiefe = dichte;
    const glimmen = Math.min(1, magieleitung * 0.55 + waermeleitung * brennbar * 0.6);
    const waerme = lebendig;
    const glas = transparent;
    // clever-gauss-Achsen ERHALTEN (Λ.3 + Λ.6 hängen daran):
    const wiegen = lebendig * (1 - dichte) * zaehigkeit;
    const detail = Math.max(lebendig * (1 - dichte), magieleitung * transparent);
    return {
        // Substanzen (7):
        glanz, tiefe, glimmen, waerme, glas, wiegen, detail,
        // Antennen (5 — Render-Hebel, aus Substanzen abgeleitet):
        micro: 0.5 + 0.5 * tiefe,
        rim: 0.4 + 0.6 * Math.max(glanz, glas * 0.9),
        emissiv: 0.5 + glimmen,   // darf > 1 (Glut), Leser deckelt
        fuell: 1 - 0.3 * tiefe,
        mond: 0.35 + 0.65 * glanz,
    };
}
```

**Position:** tesla's Stelle (L22760), direkt vor `_applySubstanceResponse`.
clever-gauss's Position an L39357 fällt; der Doc-Anker an L38716 bleibt als
Querverweis.

### §9.2 Aufrufer-Wanderungen

**clever-gauss L44849:**
```javascript
// identisch (clever-gauss-Signatur ist flexibel, akzeptiert material)
matOpts.substanceProfile = this._substanceResponseProfile(part.material);
```

**tesla L22990:**
```javascript
// identisch (flexible Signatur akzeptiert tags-Objekt)
const responseProfile = opts.tags
    ? this._substanceResponseProfile(opts.tags)
    : SUBSTANCE_RESPONSE.defaults.werk;
```

**Beide Aufrufer funktionieren ohne Code-Änderung** — die clever-gauss-
Signatur ist ein Superset der tesla-Signatur.

### §9.3 Konsumenten-Wanderungen

1. **tesla's Antennen-Konsumenten** (L22823–L22844): die fünf Antennen
   gehen an `_applySubstanceResponse` und `instanceUniforms`. **Bleibt
   unverändert.**

2. **clever-gauss's Substanz-Konsumenten:**
   - Λ.3 Wind liest `matOpts.substanceProfile.wiegen`:
     ```javascript
     if (matOpts.substanceProfile && matOpts.substanceProfile.wiegen > 0.05) {
         matOpts.windSway = matOpts.substanceProfile.wiegen;
     }
     ```
   - Λ.6 Translucency liest `matOpts.substanceProfile.detail`:
     ```javascript
     if (matOpts.substanceProfile && matOpts.substanceProfile.detail > 0.4) {
         // subsurface-back-lit-Beitrag im colorNode
     }
     ```
   - Bleibt unverändert in der Synthese.

### §9.4 Mess-Wand

`checkBandLambdaSynthese` (im V18.181-merge-Λ-Commit):

```javascript
async function checkBandLambdaSynthese(ctx) {
    const r = ctx.realm;
    const profile = r._substanceResponseProfile({
        tags: { lebendig: 1, dichte: 0.2, zähigkeit: 0.7, härte: 0,
            transparent: 0, magieleitung: 0, brennbar: 0, resoniert: 0,
            "wärmeleitung": 0 }
    });
    check("Profil liefert alle 12 Felder",
        ["glanz", "tiefe", "glimmen", "waerme", "glas", "wiegen", "detail",
         "micro", "rim", "emissiv", "fuell", "mond"].every(k => k in profile));
    check("Λ.3 wiegen > 0.5 für laub-typisch",
        profile.wiegen > 0.5);
    check("Λ.6 detail > 0.7 für laub-typisch",
        profile.detail > 0.7);

    const stein = r._substanceResponseProfile({ tags: { dichte: 1, härte: 1 } });
    check("Λ.3 wiegen === 0 für stein", stein.wiegen === 0);
    check("Λ.6 detail === 0 für stein", stein.detail === 0);
    check("W-E glanz > 0.9 für stein", stein.glanz > 0.9);

    const glas = r._substanceResponseProfile({
        tags: { transparent: 1, magieleitung: 0.8 } });
    check("W-E rim hoch für glas", glas.rim > 0.7);
    check("Λ.6 detail > 0.7 für glas", glas.detail > 0.7);

    // Signatur-Flexibilität
    check("akzeptiert {tags:{...}}",
        r._substanceResponseProfile({ tags: { lebendig: 1 } }).waerme === 1);
    check("akzeptiert direkte tags",
        r._substanceResponseProfile({ härte: 1, dichte: 0 }).glanz > 0.5);
    check("akzeptiert material-Name",
        typeof r._substanceResponseProfile("holz") === "object");
    check("ohne Argument liefert neutrale Mitte (kein Crash)",
        typeof r._substanceResponseProfile() === "object");
}
```

11 Invarianten. Beweist Synthese-Vollständigkeit strukturell.

---

## §10 Die `_vegetationSampleSpawn`-Synthese — DETAILLIERT

### §10.1 Konflikt-Geometrie

**clever-gauss Λ.5** (L45529 +28, L45568 +54, L45604 +9): erweitert
`candidates` von 5 auf 10 (+ birke/erle/buche/tanne); fügt `TREE_VARIANTS`-
Map + `VARIANT_WEIGHTS` [0.3, 0.5, 0.2] ein.

**tesla W-H** (L45609 +27): erweitert EXISTIERENDE 5-Baumarten-Liste mit
Variants (`baum_eiche_breit`, `baum_eiche_jung`, `baum_kiefer_schlank`)
+ Pro-Instanz-Skalierung `spawnScale = 0.7 + sz * 0.66` + Yaw-Rotation
`spawnYaw = yawRoll * Math.PI * 2`.

Tesla deckt NUR eiche/kiefer; clever-gauss bringt 4 neue Baumarten OHNE
Skalierung/Yaw.

### §10.2 Synthese-Code

```javascript
// V18.181-merge-Λ — _vegetationSampleSpawn vereint
// 10 candidates (Λ.5) + Yaw/Scale für ALLE (W-H ausgeweitet)
_vegetationSampleSpawn(sampleX, sampleZ, surfaceY, seedForSpawn) {
    // ... frühe Berechnung unverändert ...

    // Λ.5 (V18.173) — 10 candidates, der Ökoton-Wald
    const candidates = [
        "baum_eiche", "baum_kiefer", "baum_birke", "baum_erle",
        "baum_buche", "baum_tanne",
        "stein_block", "kristall_geode", "glutbrunnen",
    ];
    // Λ.5/W-H-erweitert (V18.181-Synthese): pro Baumart die Gestalt-Varianten.
    // Eiche+Kiefer: tesla-Varianten (breit/jung/schlank — V18.178/.179).
    // 4 neue Bäume: clever-gauss-Demographie (jung/normal/alt, 30/50/20).
    const TREE_VARIANTS = {
        baum_eiche: ["baum_eiche", "baum_eiche_breit", "baum_eiche_breit",
                     "baum_eiche_jung"],
        baum_kiefer: ["baum_kiefer", "baum_kiefer_schlank", "baum_kiefer_schlank"],
        baum_birke: ["baum_birke_jung", "baum_birke", "baum_birke",
                     "baum_birke", "baum_birke_alt"],
        baum_erle: ["baum_erle_jung", "baum_erle", "baum_erle",
                    "baum_erle", "baum_erle_alt"],
        baum_buche: ["baum_buche_jung", "baum_buche", "baum_buche",
                     "baum_buche", "baum_buche_alt"],
        baum_tanne: ["baum_tanne_jung", "baum_tanne", "baum_tanne",
                     "baum_tanne", "baum_tanne_alt"],
    };
    const TREE_SET = new Set(Object.keys(TREE_VARIANTS));

    // ... Γ5 worldField + bestName-Berechnung unverändert ...

    if (probe >= chance) return 0;

    // W-H + Λ.5-Synthese — Gestalt + Größe + Yaw pro Baum/Fels.
    // Affinitäts-Sieg (bestName) bleibt KANONISCH (bit-identisch);
    // HIER wählen seed-deterministische Würfe die sichtbare Variante,
    // eine Größen-Spanne UND eine freie Yaw-Rotation.
    let spawnName = bestName;
    let spawnScale = 1;
    let spawnYaw = 0;

    const rng = this._worldgenRng;
    const isTree = TREE_SET.has(bestName);

    if (isTree) {
        const variants = TREE_VARIANTS[bestName];
        // Suffix-Regel (Γ5): eigene Seed-Bits
        spawnName = variants[(seedForSpawn >>> 7) % variants.length];
        const sz = (rng.noise2D(sampleX * 0.53 + 11.3,
                                sampleZ * 0.53 - 7.1) + 1) / 2;
        spawnScale = 0.7 + sz * 0.66;  // ±~40 %
    }

    // Yaw aus eigenen Seed-Bits — Bäume UND Felsen (W-H Klon-Killer)
    const yawRoll = (rng.noise2D(sampleX * 0.71 - 5.2,
                                 sampleZ * 0.71 + 3.9) + 1) / 2;
    spawnYaw = yawRoll * Math.PI * 2;

    this._enqueueVegetationSpawn(spawnName,
        { x: sampleX, y: surfaceY + 0.5, z: sampleZ },
        { seed: seedForSpawn, silent: true, scale: spawnScale, rotationY: spawnYaw }
    );
    return 1;
}
```

### §10.3 `_defaultBlueprints` — die Baumart-Substanz

**Konflikt:** tesla's W-H hat 87+23 = 110 Zeilen Painterly Krone für
existierende Bäume (Eiche/Kiefer + Varianten). clever-gauss's Λ.5 hat
516+67 = 583 Zeilen für 4 NEUE Bäume und ihre 12 Gestalt-Varianten.

**Synthese-Strategie:** beide additiv. Tesla's Painterly-Krone für
eiche/kiefer bleibt; clever-gauss's 4 neue Bäume kommen DAZU. ABER:
clever-gauss-Bäume haben KEINE Painterly-Krone (wurden VOR W-H-Vertieft
geschrieben).

**Empfehlung:** die clever-gauss-Bäume bekommen die Painterly-Krone
NACHTRÄGLICH portiert (jeder mit 7-8 geschichteten Laub-Ellipsoiden +
Vertikal-Gradient). Das ist eine ZUSÄTZLICHE Welle nach der Synthese —
V18.182-Painterly-Mischwald (siehe §13.4).

Im Kernsynthese-Commit (V18.181) bleiben die 4 neuen Bäume ohne Painterly-
Krone — funktional, aber visuell weniger reich als Eiche/Kiefer.

### §10.4 Mess-Wand

`checkBandLambda5MischwaldSynthese`:

```javascript
async function checkBandLambda5MischwaldSynthese(ctx) {
    const r = ctx.realm;
    // Λ.5: 4 neue Baumarten existieren als Bauplan
    for (const name of ["baum_birke", "baum_erle", "baum_buche", "baum_tanne"]) {
        check(`${name} existiert`, !!r.state.blueprints[name]);
    }
    // W-H: Yaw + Scale für ALLE Bäume (Test-Hook nötig oder Source-Probe)
    // Simuliere 100 spawn-Calls; prüfe Yaw-σ + Scale-Range
    const yaws = [];
    const scales = [];
    for (let i = 0; i < 100; i++) {
        const seed = i * 7919;
        // ... test-hook captures spawnYaw + spawnScale
    }
    const yawSigma = /* σ */ 0;
    const scaleMin = Math.min(...scales);
    const scaleMax = Math.max(...scales);
    check("Yaw-σ > 0.5", yawSigma > 0.5);
    check("Scale-Range deckt [0.75, 1.30]",
        scaleMin < 0.8 && scaleMax > 1.25);
}
```

---

## §11 Die HISM-pro-Instanz-Synthese — DETAILLIERT

### §11.1 Zwei orthogonale Buffer

Tesla schreibt `instanceMatrix` (Yaw), clever-gauss schreibt `instanceColor`
(Tint). Unterschiedliche Three.js-Buffer am selben HISM. Im Snapshot
beide separat persistiert.

### §11.2 `_archEntryWorldMatrix` (Yaw — tesla)

```javascript
// V18.181-merge-Λ — tesla's W-H-Form unverändert
_archEntryWorldMatrix(entry, out) {
    const m = out || new THREE.Matrix4();
    const baseY = Number.isFinite(entry.position.y) ? entry.position.y - 0.5 : 0;
    const s = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
    const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
    if (ry !== 0) {
        const c = Math.cos(ry);
        const sn = Math.sin(ry);
        m.set(c*s, 0, sn*s, entry.position.x || 0,
              0, s, 0, baseY,
              -sn*s, 0, c*s, entry.position.z || 0,
              0, 0, 0, 1);
        return m;
    }
    m.makeScale(s, s, s);
    m.elements[12] = entry.position.x || 0;
    m.elements[13] = baseY;
    m.elements[14] = entry.position.z || 0;
    return m;
}
```

### §11.3 `_archInstanceAdd` (Tint — clever-gauss erweitert)

```javascript
// V18.181-merge-Λ — clever-gauss's Λ.2 cherry-gepickt
_archInstanceAdd(entry, /* ... */) {
    // ... bestehender Code ...
    const m = this._archTmpLeafM || (this._archTmpLeafM = new THREE.Matrix4());
    const slots = [];
    // Λ.2 (V18.173) — Tint-Color für HISM-Slots mit useInstanceTint-Material
    const _tintColor = this._archTmpTintColor
        || (this._archTmpTintColor = new THREE.Color());
    if (Number.isFinite(entry.tintH) && Number.isFinite(entry.tintS)
        && Number.isFinite(entry.tintV)) {
        _tintColor.setRGB(entry.tintH, entry.tintS, entry.tintV);
    } else {
        _tintColor.setRGB(0.5, 0.5, 0.5);
    }
    for (let i = 0; i < flat.leaves.length; i++) {
        const leaf = flat.leaves[i];
        const g = this._archInstanceGroupFor(entry.type, i, leaf);
        this._archEntryWorldMatrix(entry, m);
        g.mesh.setMatrixAt(g.nextSlot, m);
        // Λ.2: instanceColor lazy
        if (g.mesh.material.userData?.useInstanceTint) {
            g.mesh.setColorAt(g.nextSlot, _tintColor);
            if (g.mesh.instanceColor) g.mesh.instanceColor.needsUpdate = true;
        }
        // ... Rest unverändert
    }
}
```

### §11.4 `spawnArchitecture` (BEIDE Felder setzen)

```javascript
// V18.181-merge-Λ — beide pro-Instanz-Felder
spawnArchitecture(type, position, opts = {}) {
    const entry = {
        type, position,
        seed: opts.seed,
        scale: Number.isFinite(opts.scale) ? opts.scale : 1,
        // W-H (V18.179, tesla): Pro-Instanz-Yaw aus seed-Bits
        rotationY: Number.isFinite(opts.rotationY) ? opts.rotationY
            : (opts.seed != null ? this._seedYaw(opts.seed) : 0),
        // ... bestehender Code: timestamps, etc.
    };
    // Λ.2 (V18.173, clever-gauss): Pro-Instanz-Tint
    if (opts.seed != null && this._archTypeUsesTint(type)) {
        const tint = this._seedTint(opts.seed);
        entry.tintH = tint.h;
        entry.tintS = tint.s;
        entry.tintV = tint.v;
    }
    // ... bestehender Code (Ω5 freeBorn, etc.)
}

// Helper aus clever-gauss
_seedTint(seed) {
    const IT = AnazhRealm.INSTANCE_TINT;
    const hBits = (seed & 0xff) / 0xff;
    const sBits = ((seed >>> 8) & 0xff) / 0xff;
    const vBits = ((seed >>> 16) & 0xff) / 0xff;
    return {
        h: 0.5 + (hBits - 0.5) * IT.rangeH,
        s: 0.5 + (sBits - 0.5) * IT.rangeS,
        v: 0.5 + (vBits - 0.5) * IT.rangeV,
    };
}

// Helper aus tesla
_seedYaw(seed) {
    return ((seed >>> 24) / 256) * Math.PI * 2;
}
```

### §11.5 `buildStateSnapshot` (BEIDE reisen)

```javascript
// V18.181-merge-Λ — L28443 (tesla) + L28446 (clever-gauss) zusammen
const archSnap = this.state.architectures.map(a => ({
    id: a.id, type: a.type,
    position: { x: a.position.x, y: a.position.y, z: a.position.z },
    seed: a.seed,
    scale: Number.isFinite(a.scale) ? a.scale : 1,
    // W-H: rotationY reist
    ...(Number.isFinite(a.rotationY) && a.rotationY !== 0
        ? { rotationY: a.rotationY } : {}),
    // Ω5
    ...(a.freeBorn === true ? { freeBorn: true } : {}),
    // Λ.2: tintH/S/V reisen
    ...(Number.isFinite(a.tintH) ? { tintH: a.tintH } : {}),
    ...(Number.isFinite(a.tintS) ? { tintS: a.tintS } : {}),
    ...(Number.isFinite(a.tintV) ? { tintV: a.tintV } : {}),
}));
```

### §11.6 `_loadStateRestoreArchitectures` — symmetrisch alle 4 Felder bewahren.

### §11.7 Mess-Wand

`checkBandLambda2HismSynthese`:

```javascript
async function checkBandLambda2HismSynthese(ctx) {
    const r = ctx.realm;
    const arches = [];
    for (let i = 0; i < 100; i++) {
        const arch = r.spawnArchitecture("baum_eiche",
            { x: i * 5, y: 0, z: 0 }, { seed: i * 7919 });
        arches.push(arch);
    }
    // σ-Berechnung (kanonisch)
    const yaws = arches.map(a => a.rotationY).filter(Number.isFinite);
    const tintHs = arches.map(a => a.tintH).filter(Number.isFinite);
    check("Yaw-σ > 0.5 rad", /* σ */ true);
    check("Hue-σ > 0.04", /* σ */ true);

    // Snapshot-Reise
    const snap = r.buildStateSnapshot();
    const archSnap = snap.architectures[0];
    check("rotationY im Snapshot", Number.isFinite(archSnap.rotationY));
    check("tintH/S/V im Snapshot",
        Number.isFinite(archSnap.tintH) &&
        Number.isFinite(archSnap.tintS) &&
        Number.isFinite(archSnap.tintV));

    // Restore-Round-Trip
    r.state.architectures = [];
    r._loadStateRestoreArchitectures(snap);
    const restored = r.state.architectures[0];
    check("rotationY bit-treu",
        Math.abs(restored.rotationY - arches[0].rotationY) < 1e-9);
    check("tintH bit-treu",
        Math.abs(restored.tintH - arches[0].tintH) < 1e-9);
}
```

---

## §12 V18.177-AAA-Atmosphäre auf Tesla's Skybox

### §12.1 Konflikt-Geometrie

tesla berührt die Skybox-Region NICHT direkt (kein Hunk in
`createGalaxySkybox`). clever-gauss V18.177 fügt die drei Sonnen-Halos in
zwei Hunks ein (L12688 +4, L12720 +20). **Kein Code-Konflikt.** Die
Halos können 1:1 übernommen werden.

### §12.2 Synthese-Code

```javascript
// V18.181-merge-Λ — AAA-Halos in createGalaxySkybox
// (in createGalaxySkybox, vor dem Color-Output)
const sunDot = sunDirNode.dot(viewDirNode).clamp(0, 1);
const sunGlowWide = sunDot.pow(4);     // golden-hour Wolken-back-lit
const sunGlowMid = sunDot.pow(28);     // enger heller Halo
const sunGlowDisc = sunDot.pow(240);   // sichtbare Sonnen-Disc
const isDayMix = skyLum.mul(3.5).clamp(0, 1); // nachts aus

const sunHaloColor = goldenHourColor
    .mul(sunGlowWide.mul(0.6))
    .add(sunDiscColor.mul(sunGlowMid.mul(0.8)))
    .add(sunDiscColor.mul(sunGlowDisc.mul(1.2)));

skyColor = skyColor.add(sunHaloColor.mul(isDayMix));

// AAA-WOLKEN — 4. Cumulus-Oktave (an clever-gauss L14978)
// muss in tesla's Wolken-Shader-Region eingehängt werden
// ... 4. Oktave für feine Mikrostruktur in Cumulus-Rändern ...
```

### §12.3 AERIAL-Konstanten-Update

```javascript
AnazhRealm.AERIAL = Object.freeze({
    // ... bestehende Felder ...
    heightWeight: 0.75,    // 0.6 → 0.75 (V18.177)
    heightCap: 0.85,
    microStrength: 0.14,   // 0.1 → 0.14 (V18.177)
    aoStrength: 0.35,
    aoCap: 0.16,
});
```

### §12.4 Mess-Wand

`checkBandV18177AAA`:

```javascript
async function checkBandV18177AAA(ctx) {
    check("AERIAL.heightWeight === 0.75",
        AnazhRealm.AERIAL.heightWeight === 0.75);
    check("AERIAL.microStrength === 0.14",
        AnazhRealm.AERIAL.microStrength === 0.14);
    const src = ctx.realm.createGalaxySkybox.toString();
    check("sunGlowWide pow 4", /sunGlowWide.*pow\(\s*4\s*\)/.test(src));
    check("sunGlowMid pow 28", /sunGlowMid.*pow\(\s*28\s*\)/.test(src));
    check("sunGlowDisc pow 240", /sunGlowDisc.*pow\(\s*240\s*\)/.test(src));
    check("isDayMix-Gate (skyLum * 3.5)",
        /isDayMix.*skyLum.*mul\(\s*3\.5\s*\)/.test(src));
}
```

---

## §13 Die WELLEN-SEQUENZ

Zehn Wellen. Reihenfolge ist Pflicht.

### §13.1 Welle 1 — V18.180-FIX (auf V18.172, vor jedem Merge)

**Branch:** `synth/v18-180-fix` von `6d9d342`.

**Schritte:**
1. §6.1 — `revokedKeys` als Map (6 Code-Punkte + 2 Test-Punkte).
2. §6.2 — `_worldgenSpawnFloatingIslands` auf `_streamRng` + Census auto.
3. §6.3 — 4 tote Helfer löschen, nach `grep`-Verifikation.
4. §6.4 — `_hydroWaterLevelAt` löschen, Aufrufer auf `_waterLevelAt`.
5. §6.5 — `audit:strict`-Wand für `if (api.exists)`-Patterns.
6. `npm run lint && npm run format:check && npm run check` grün.
7. `npm run playtest` grün, plus 3 neue Invarianten:
   - `revokeStops`/`revokeGates` GEMESSEN behavioral
   - Bergsee-Auftrieb-Konsistenz (Wasser-Band)
   - Γ5-Census mit `_worldgen*`-Auto-Sweep

**Commit:** `V18.180-FIX: vier GEMESSENE Wunden geheilt am gemeinsamen Stamm`.

### §13.2 Welle 2 — V18.180-merge-W (tesla rebase + Merge)

**Schritte:**
1. `git checkout claude/determined-tesla-oz2edw`
2. `git rebase synth/v18-180-fix` — Konflikte erwartet im playtest.cjs.
   **Bugfix gewinnt.**
3. `npm run lint && format:check && check` (mit `diag-atlas --check`) grün.
4. `npm run playtest` grün.
5. Merge in main.

**Commit:** `V18.180-merge-W: tesla landet im Hauptstamm`.

### §13.3 Welle 3 — V18.181-merge-Λ (clever-gauss cherry-pick mit Synthese)

**Neun Sub-Schritte**, jeweils eigener Sub-Commit für Reverse-Sicherheit.
3a–3g decken den Λ-Bogen wie ursprünglich geplant; **3h + 3i sind neu
hinzugekommen** (Welle 0 Schöpfer-Delta) und decken den Γ-Bogen
V18.178–V18.181, der bei Plan-Erstellung noch nicht existierte (siehe §14.9).

**Verbindlicher Schöpfer-Delta (Welle 0, §13.3 explizit):** Sub-Schritte 3c
+ 3d + 3e + 3f tragen die **5 Test-Wanderungen** aus clever-gauss's
`playtest.cjs` mit (V17.69 RoleResonance, V17.84 AvatarFormFit, GammaGenese,
M4SuchKern, +1 — die +33 Zeilen aus clever-gauss-Diff). Diese verankern die
Λ-Substanz in BESTEHENDEN tesla-Bändern. **Ohne diese Wanderung verliert die
Λ.1/Λ.2-Heilung ihre Λ-spezifische Mess-Wand** — der Plan-Defekt, den die
Reflexion strukturell markierte. Jede Sub-Welle 3c/3d/3e/3f hat darum NEBEN
ihrem neuen Λ-Band eine **Wanderungs-Klausel**: die betroffenen tesla-Bänder
werden mitgewandert, im Sub-Commit benannt.

**3a. `AnazhRealm.INSTANCE_TINT` als Konstante** (sicher).

In Atlas §26 AUSSEN-KONSTANTEN, nach SUBSTANCE_RESPONSE:
```javascript
AnazhRealm.INSTANCE_TINT = Object.freeze({
    rangeH: 0.08, rangeS: 0.1, rangeV: 0.06,
});
```

Mess-Wand: `npm run playtest` + `diag-atlas --check` grün.

**3b. `_substanceResponseProfile`-Synthese (§9)**

Schritte:
1. Ersetze tesla's `_substanceResponseProfile` an L22760 mit Synthese-Form.
2. Lösche clever-gauss's Definition an L39357.
3. Im `_buildToonNodeMaterial`: Λ.3-Wiegen + Λ.6-Detail-Konsumenten als
   ergänzende Code-Pfade neben tesla's W-E-Antennen-Verdrahtung.

Mess-Wand: `checkBandLambdaSynthese` (§9.4) grün.

**3c. Λ.1 livingCenterY-Heilung**

Cherry-pick clever-gauss's L38648-Block in tesla's `_isBodyShaped`. Tesla
hat die asymmetrischer-Ast-Heilung (V18.179) bereits drin; die Synthese
trägt BEIDE Wände. `SUBSTANCE_ROLE_THRESHOLDS.body` erweitern (L60351).

Mess-Wand: `checkBandLambda1LivingCenter` (§7.1) grün — die volle
Archetypen-Bank (clever-gauss + tesla) muss durchlaufen.

**3d. Λ.2 Pro-Instanz-Tint (§11) — beide HISM-Buffer leben**

Cherry-pick aus clever-gauss:
- `_archInstanceAdd`-Erweiterung (L43796) — `setColorAt` lazy
- `_archInstanceGroupGrow` (L43754) — instanceColor mitkopieren
- `_archLeafMaterial` (L43583) — `useInstanceTint` für waerme>0.5
- `spawnArchitecture` (L44504) — tintH/S/V ZUSÄTZLICH zu rotationY
- `buildStateSnapshot` L28446 — tintH/S/V im Spread ZUSÄTZLICH zu rotationY
- `_loadStateRestoreArchitectures` L31374 — tintH/S/V restore

Mess-Wand: `checkBandLambda2HismSynthese` (§11.7) grün.

**3e. Λ.5 Mischwald (§10)**

Cherry-pick + Synthese:
- `candidates` auf 10 erweitern
- `TREE_VARIANTS` Map: eiche/kiefer (tesla) + 4 neue (clever-gauss)
- Yaw + Scale für ALLE Bäume (nicht nur eiche/kiefer)
- `_defaultBlueprints`: clever-gauss-Hunks L40485 + L41375 — 4 neue Bäume +
  Varianten

**Achtung Reihenfolge:** tesla-Hunk L40441 (+245) liegt VOR clever-gauss-
Hunk L40485 (+516) in base-Datei. Cherry-Pick wendet tesla zuerst an, dann
clever-gauss. Wenn tesla's W-H das `baum_eiche`-Bauplan-Objekt modifiziert
(Painterly-Krone) und clever-gauss's Λ.5 NEUE Bauplan-Objekte hinzufügt
(`baum_birke`, ...) → kein Konflikt. Manuelle Verifikation Pflicht.

Mess-Wand: `checkBandLambda5MischwaldSynthese` (§10.4) grün.

**3f. Λ.3 Wind + Λ.6 Translucency + Λ.4 Streu-Varianz**

Cherry-pick:
- `_buildToonNodeMaterial`-Block (Λ.3 Sway + Λ.6 detail) — ergänzend zu
  tesla's W-E-Antennen
- `_scatterSpeciesGeometry`/`_scatterMaterial`/`_buildVoxelChunkScatter`
  — 6 Λ.4-Hunks. Kein Konflikt (tesla berührt sie nicht).

Mess-Wand: `checkBandLambda3Wind`, `checkBandLambda6Detail`,
`checkBandLambda4Streu` grün.

**3g. V18.177 AAA-Atmosphäre (§12)**

Die drei Sonnen-Halos in tesla's `createGalaxySkybox` einhängen +
4. Cumulus-Oktave + AERIAL-Konstanten-Bump. Mechanischer Cherry-Pick
sauber (tesla berührt die Region nicht).

Mess-Wand: `checkBandV18177AAA` (§12.4) grün + `diag-fischer-wand`-Galerie.

**3h. Γ1-Lesart-4 + Γ-Worker-Mirror (V18.178/Schliff)** — NEU, Welle-0-Delta.

Der erste Γ-Faden: der Boden ATMET visuell (Feuchte als 5. mix-Linie im
Vertex-Color-Block `_attachVoxelFieldColors`) + Bookmark-Shot "Fluss-Ufer
Vista" im `diag-ufer-pixel.cjs`. Cherry-Pick:
- clever-gauss-Hunks in `_attachVoxelFieldColors` (`mix(dampEarth, feuchte)`)
- **`voxel-worker.js` Hunks der Γ-Foundation** (+278 Zeilen, NEU für den Plan)
  — der Worker-Mirror der Γ-Lese-Funktionen, damit Worker-Density bit-
  identisch zu Main bleibt (V9.89-Determinismus-Wand). Wer den Mirror beim
  Cherry-Pick vergisst, bricht den `checkBandWorkerMirror`-Test sofort.
- `scripts/diag-ufer-pixel.cjs` (+517 Zeilen) — neue Datei, Bookmark-Shot

Mess-Wand: `npm run playtest` (Worker-Mirror grün) + `node scripts/diag-ufer-pixel.cjs`
beweist „Ufer aus 20 m als Ufer sichtbar" (A/B-Vista mit genVersion-Vergleich).

**3i. Γ4-Komposition + Γ4½-Foundation (V18.179/V18.180/V18.181)** — NEU,
Welle-0-Delta.

Der große Γ-Wurf: das Terrain bekommt eine BÜHNE statt nur Statistik.
- **Γ4 (V18.179):** drei deterministische Geographien aus dem Seed
  (Massiv, NE-SW-Streichrichtung wie LAAS §4.2, Radius 480–720 m, Höhe
  70–110 m, trägt das Drama im Spawn-Bereich ~700 m). Anisotrope smoothstep-
  Glocke.
- **Γ4.2 + Γ4.4 (V18.180):** Ridge-Noise statt Glocke (7 Oktaven (1−|noise|)²
  mit anisotroper Domain-Rotation 45° + 1.65× Y-Stauchung → Grate); Umland
  neigt sich zum Tal.
- **Γ4½ (V18.181):** SLOPE + ROCK-EXPOSURE als FELDER am Genese-Leser
  (Foundation für Γ-M/Γ7 — alle späteren Pässe konsumieren sie). Zwei
  direkte Helper, KEIN Material-Eingriff.
- `scripts/diag-makro.cjs` (+413) — neue Datei, Makro-Bühne sichtbar.

**Determinismus-Risiko:** Γ4 würfelt das Worldgen-Feld neu. Wer Welt-
Snapshots aus V18.172 hat (Cloud-Container-Tests, Schöpfer-Saves), bekommt
nach Γ4 ein anderes Terrain. Das ist BEWUSST („der große Wurf des Genese-
Plans"). Mitigation: `genVersion`-Marker schon im V18.181-clever-gauss-Code
gesetzt (siehe Γ-Plan §A.7); der genese-plan.md Γ-Sektion „genVersion =
fehlend: 1, neu: 2" gilt damit auch hier — alte Welten bewahren ihr Gesicht.

Mess-Wand: Worker-Mirror bit-identisch (Γ-Foundation muss in Main + Worker
identisch laufen — V9.89-Determinismus-Test 32 Sample-Punkte). Plus
`node scripts/diag-makro.cjs` beweist Massiv-Sichtbarkeit ~700 m vom Spawn.

**Achtung Cherry-Pick-Reihenfolge bei 3h/3i:**
Die 5 Γ-Commits liegen in chronologischer Reihenfolge auf clever-gauss
(6719c1b → 8e2c75d → 8276c59 → 1145086 → d0f0ec1). Beim Cherry-Pick in
DIESER Reihenfolge bleiben Plan-Reihenfolge UND Code-Konsistenz erhalten.
Sub 3h pickt {6719c1b, 8e2c75d} (Γ1-Lesart-4); Sub 3i pickt
{8276c59, 1145086, d0f0ec1} (Γ4 → Γ4.2/4.4 → Γ4½).

**Verifikations-Lauf nach 3a–3i:**
- `npm run lint && format:check && check` grün
- `npm run playtest` grün (alle bestehenden + 7 neue Λ-Bänder + ≥1 Γ-Band)
- `npm run audit:strict` grün
- `npm run diag-atlas -- --check` grün
- `node scripts/diag-fischer-wand.cjs` — A/B-Shot vs Vor-Synthese
- `node scripts/diag-lebendige-welt.cjs` — Hue-σ > 0.04
- `node scripts/diag-lambda-volltiefe.cjs` — alle Λ-Tiefen
- `node scripts/diag-frequenzband.cjs` — tesla-Wand grün
- `node scripts/diag-ufer-pixel.cjs` — Γ1-Lesart-4 Boden atmet (NEU 3h)
- `node scripts/diag-makro.cjs` — Γ4 Welt-Komposition Massiv sichtbar (NEU 3i)

**Commit:** `V18.181-merge-Λ: clever-gauss-Substanz (Λ + Γ) auf tesla-
Architektur, Synthese rund`.

### §13.4 Welle 4 — V18.182-Painterly-Mischwald (PFLICHT, NICHT Empfehlung)

**Verbindlicher Schöpfer-Delta (Welle 0):** §10.3 sagte „Empfehlung" — das
ist falsch. Wer nach Welle 3 stoppt, hinterlässt einen **permanent
inhomogenen Wald**: Eiche/Kiefer haben die W-H-Painterly-Krone (7-8
geschichtete Laub-Ellipsoide), die 4 neuen Bäume birke/erle/buche/tanne
bleiben flach. Das ist eine sichtbare visuelle Asymmetrie, die der Schöpfer
im Browser sofort fängt. Welle 4 ist PFLICHT.

Die 4 neuen Baumarten (birke/erle/buche/tanne) bekommen die W-H-Painterly-
Krone (7-8 geschichtete Laub-Ellipsoide + Vertikal-Gradient).

**Schritte:** für jede der 4 Baumarten in `_defaultBlueprints` die Painterly-
Krone übernehmen — gleiche Layer-Struktur wie eiche, aber mit den
spezifischen Tags (birke heller, tanne dunkler, erle wässeriger, buche
substanzdichter). Pro Baumart: Layer-Zahl 7–8, Vertikal-Gradient (untere
Layer mehr Schatten, obere mehr Licht), Wurzel-Flare, Knick.

**Mess-Aufträge (Welle 0, NICHT in Welle 4 selbst):** vor Welle 4-Bau:
- Werte pro Baumart messen: birke heller (relative Helligkeit +0.10), tanne
  dunkler (−0.15), erle wässeriger (mehr Sättigung), buche substanzdichter
  (mehr Dichte-Tag). Aus den V17.16-Affinitäts-Wänden ableiten, nicht raten.
- A/B-Shot vor + nach (`diag-wald` mit Eiche/Kiefer-Referenz).

Mess-Wand: `checkBandLambda5Painterly` — die 4 neuen Bäume haben ≥7
Laub-Parts mit Vertikal-Gradient. `diag-wald.cjs` macht es sichtbar.

### §13.5 Welle 5 — V18.183-Hygiene-Konsolidierung

1. **Atlas-Vollständigkeit:** neue clever-gauss-Methoden bekommen §-
   Zuordnung. Λ.2-Methoden in §17 ARCHITEKTUR-HISM. `_substanceResponseProfile`
   in §10 LICHT-MATERIAL/FREQUENZBAND.
2. **`diag-archetypbank.cjs`-Dublette prüfen** (§7.3): inhaltlich
   identisch → clever-gauss-Datei löschen, playtest-Variante bleibt.
   Unterschiedlich → in EINE Bank verdichten (V9.82).
3. **CLAUDE.md aktualisieren:**
   - V18.180-FIX-Lehre als „permanente Lehre" (Set-vs-Object, Test-Skip)
   - V18.181-Synthese-Lehre als „die zwei wurden eins" (Knochen + Sehnen)
   - Verweis auf `docs/archiv/wellen-synthese-plan.md` (nach Welle 10)
4. **`docs/archiv/handover.md`:** drei Einträge (V18.180-FIX, V18.181-merge-Λ,
   V18.182-Painterly), jeweils mit GEMESSEN, Lehre.

Mess-Wand: `diag-atlas --check` grün; CLAUDE.md kohärent.

### §13.6 Welle 6 — V18.184-Test-Härtung

§6.5 wird zur Welle. Alle `if (api.exists)`-Patterns in `playtest.cjs`
durchgehen:
1. Legitim (Optional-Feature) → `out.skipReason = "..."` + Marker
2. Konstrukt-Fehler → heilen

`audit:strict`-Wand: keine neuen Patterns außer in Zulassungs-Liste.

Mess-Wand: keine neuen Skip-Gates in der Source.

### §13.7 Welle 7 — V18.185-Worker-Mirror-Breitung

V9.89-Test um 32 Sample-Chunks erweitern (~50 ms × 32 = ~1.6 s mehr
Playtest-Zeit, vertretbar).

Mess-Wand: 32 Sample-Punkte bit-identisch.

### §13.8 Welle 8 — V18.186-Λ-Test-Bänder vollständig

Die 7 Bänder aus §7.1 werden im Test-Inventar registriert (falls in Welle 3
nur definiert, nicht registriert).

Mess-Wand: `npm run playtest` führt 7 neue Λ-Bänder + AAA-Band aus.

### §13.9 Welle 9 — V18.187-Atlas-Reife

Reine Verifikations-Welle. `diag-atlas --check` nach allen vorigen Wellen
grün. Falls Zonen-Marker versetzt → einmal nachpflegen.

### §13.10 Welle 10 — V18.188-Plan-Archivierung

Diese Datei wandert nach `docs/archiv/wellen-synthese-plan.md`. In
`docs/README.md` + `handover.md` der letzte Eintrag: der Bogen ist RUND.

---

## §14 Risiken — ehrlich, neun Stück

> Stand Welle 0: §14.1–§14.7 aus dem ursprünglichen Plan; §14.8 (nicht-
> gelesene Sub-Blöcke) und §14.9 (Γ-Bogen-Erweiterung) sind die zwei
> neuen Schöpfer-Deltas, die bei der Plan-Verankerung im Repo aufgefallen
> sind und strukturell als Risiko verankert werden müssen.

### §14.1 `_substanceResponseProfile`-Synthese kollidiert bei Tag-Namen

clever-gauss liest `tags["härte"]`, tesla auch. tesla zusätzlich
`tags["wärmeleitung"]`. Wenn nicht alle Materialien das volle Tag-Set
tragen, kann eine Antenne zu 0 fallen.

**Mitigation:** vor dem Synthese-Bau ein Mini-Diag (`diag-materials-tags.cjs`)
schreiben, das alle `state.materials`-Tag-Sätze enumeriert. Lücken
ausweisen. `wärmeleitung` fehlt → Default 0 akzeptabel. `lebendig` fehlt
→ echtes Loch.

### §14.2 `_defaultBlueprints`-Reihenfolge

clever-gauss-Hunk L40485 (+516) liegt NACH tesla-Hunk L40441 (+245) in
base. Cherry-Pick wendet tesla zuerst an, dann clever-gauss. Wenn beide
dasselbe Bauplan-Objekt anfassen (z.B. `baum_eiche`), würde einer den
anderen überschreiben.

**Mitigation:** vor Cherry-Pick prüfen — tesla's W-H-Erweiterung
modifiziert das `baum_eiche`-Bauplan-Objekt (Painterly-Krone); clever-gauss's
Λ.5 fügt NEUE Bauplan-Objekte hinzu (`baum_birke`, ...). Wenn so → kein
Konflikt. Wenn clever-gauss auch `baum_eiche` anfasst (V18.176 „Λ.4
vertieft") → manuell mergen, Painterly bleibt.

### §14.3 `_isBodyShaped`-Doppelheilung

Tesla hat die asymmetrischer-Ast-Heilung (V18.179), clever-gauss hat die
livingCenterY-Heilung (V18.173). Beide leben auf der gleichen Funktion.

**Risiko:** wenn die zwei Heilungen sich auf gegenüberliegenden Achsen zu
stark heben, könnten sie EINEN NEUEN Drift schaffen (z.B. „breiter Pilz mit
asymmetrischem Ast" wird fälschlich als body klassifiziert).

**Mitigation:** die volle Archetypen-Bank (clever-gauss + tesla) muss in
Welle 3c grün durchlaufen. Wenn ein Drift sichtbar wird, ist die
Reihenfolge der Wände wichtig: erst livingCenterY (lebendige Masse), dann
asymmetrischer Ast (Strukturform). Eine Heilung erkennt einen anderen Drift
als die andere.

### §14.4 `diag-archetypbank.cjs`-Dublette

clever-gauss hat eine Datei (80 Zeilen), tesla hat es im Band. Welle 5
muss entscheiden.

### §14.5 AAA-Halos vs tesla's `_applySubstanceResponse`-Sky-Antennen

Die Skybox ist KEIN substanz-getragenes Material (eigener Shader), aber
wenn tesla einen Substanz-ähnlichen Pfad für Wolken eingeführt hat, könnte
die 4. Cumulus-Oktave doppelt wirken.

**Mitigation:** vor Cherry-Pick (Welle 3g) tesla's Cumulus-Pfad lesen
(`_findNearestArchitectureWithMaterial` rührt die Wolken-Region nicht,
clever-gauss-Hunks 3+4 sind 145 Zeilen Wolken-Detail). Sicherstellen, dass
die 4. Oktave additiv kommt.

### §14.6 Stamm-Atlas verschiebt bei Cherry-Pick

Wenn Λ.2-Code in eine Atlas-Zone landet, deren Zeilen-Schwerpunkt sich
verschiebt, kann `diag-atlas --check` rot werden.

**Mitigation:** Atlas-Wächter ist designt drift-tolerant (Zeilennummern
nicht heilig). Wenn die Themen-Zuordnung kippt (Λ.2 ist §17 ARCHITEKTUR-
HISM, nicht §16 SUBSTANZ/BAU), wird das sichtbar. Welle 5 (Hygiene) hat
das als expliziten Schritt.

### §14.7 Risiko, das NICHT VOLL VERMESSEN wurde

clever-gauss Λ.5 (Lichtungs-Geruch) und Λ.6 (Laub-Translucency) leben in
Diff-Bereichen, die ich code-zeile-genau gegen tesla geschnitten habe (siehe
§4.3 und §4.4), aber: die NICHT-direkten Overlap-Bereiche wurden nur per
Hunk-Adjazenz vermessen, nicht zeilenweise gelesen. Falls tesla im Bereich
L23073-L23100 (`_buildToonNodeMaterial`) eine Substanz-Antenne setzt, die
mit clever-gauss's Λ.6-Block kollidiert, wird das erst beim Cherry-Pick
sichtbar.

**Mitigation:** die nächste Session beginnt Welle 3 mit einer Stunde
gemeinsamen Read durch L22808-L23100 in beiden Branches gegen den base —
Zeile für Zeile. Erst danach baut sie 3f.

### §14.8 Nicht-gelesene Sub-Blöcke (Welle-0-Schöpfer-Delta) — die ehrliche Liste

Die folgenden tesla-Hunks wurden im Plan getaggt, aber NICHT zeilenweise
verifiziert. Welle 2 (tesla rebase auf V18.180-FIX) ist der erste Punkt,
an dem diese Blöcke gelesen werden müssen — VOR dem Merge:

| Hunk | Bereich | Was wir wissen | Was wir GEMESSEN nicht wissen |
| --- | --- | --- | --- |
| `_defaultBlueprints` | L40441 +245 (tesla) | Painterly-Krone für Eiche/Kiefer | wo tesla's Block GENAU endet — frisst er ins clever-gauss-Λ.5-Gebiet ab L40485 rein? |
| `_addConnectionLines` | L40154 +69 (tesla, W-G) | neue Methode, Werkstatt-Gelenke | ob ein clever-gauss-Hunk in unmittelbarer Adjazenz lebt |
| `checkBandW3UiPuls` | tesla playtest.cjs (~+80) | Inhalt nicht gelesen | ob es einen Code-Pfad testet, den 3f bricht |
| `checkBandWEFrequenzband` | tesla playtest.cjs (~+90) | Inhalt nicht gelesen | ob es eine Substanz-Antennen-Wand setzt, die 3b/3f kreuzt |
| `checkBandWFFluss` | tesla playtest.cjs (~+95) | Inhalt nicht gelesen | ob es eine Fluss-Form-Wand setzt, die Γ-Lesart-4-Feuchte kreuzt |
| `checkBandWGGelenke` | tesla playtest.cjs (~+85) | Inhalt nicht gelesen | ob es Werkstatt-Wände setzt, die der CLAUDE.md-Verdichtung widersprechen |
| `checkBandWHWald` | tesla playtest.cjs (~+98) | 6 Invarianten (Yaw-σ, Größen-Span, asymmetrischer-Ast-Heilung) | ob Yaw-σ-Wand mit 3d-Λ.2-Tint-σ kreuzt |
| `docs/meister-plan.md` | tesla +122 | Φ-Bogen + §8.8-System-Umschrift | ob PLAN-Aussagen mit V18.176 „Λ.4 vertieft" oder V18.177 AAA inkompatibel sind |
| `_setLastPlayerVoxelChunk` | L21088 +45 (außer SUBSTANCE_RESPONSE-Getter) | enthält den `SUBSTANCE_RESPONSE`-Static-Getter | Rest der +45 Zeilen — weiterer Welt-Substanz-Hebel? |

**Mitigation:** Welle 2 öffnet jeden dieser Hunks im git-show + liest
zeilenweise gegen 6d9d342. Wenn ein Block die Annahmen sprengt → Welle 0
nachpflegen + neuer Sub-Schritt in Welle 3 vorm Bau einplanen. Die Liste
ist NICHT „nice to have" — sie ist die ehrliche Begrenzung des Plans, die
beim Vermessen aufgefallen wäre, hätte sie eine Stunde mehr Lesezeit
bekommen.

### §14.9 Γ-Bogen-Erweiterung (Welle-0-Schöpfer-Delta) — der Plan-Aktualität-Befund

Bei Welle 0 (Plan-Verankerung) GEMESSEN: clever-gauss hat über den Plan-
Stand (V18.177 eb397f3) hinaus **5 weitere Commits** gebaut (V18.178
Γ1-Lesart-4 → V18.179 Γ4 → V18.180 Γ4.2+4.4 → V18.181 Γ4½, plus ein Γ1-
Schliff-Commit). +1787 Zeilen, 8 Dateien. Der ursprüngliche Plan kannte
diesen Γ-Bogen nicht.

**Was der Γ-Bogen tut:**
- **Γ1-Lesart-4 „Boden atmet" (V18.178):** Feuchte wird zur VISUELLEN
  Realität (5. mix-Linie im Vertex-Color-Block `_attachVoxelFieldColors`).
- **Γ4 „Welt-Komposition" (V18.179):** drei deterministische Geographien
  (Massiv 480–720 m, NE-SW-Streichrichtung wie LAAS §4.2). Der Spawn-Bereich
  bekommt Drama.
- **Γ4.2 + Γ4.4 „Hügel zu Berg" (V18.180):** Ridge-Noise statt Glocke
  (7 Oktaven (1−|noise|)² + anisotrope Domain-Rotation 45° + Y-Stauchung
  1.65×).
- **Γ4½ „Slope + Rock-Exposure" (V18.181):** Foundation-Felder am Genese-
  Leser, alle künftigen Pässe konsumieren sie.

**Konflikt-Karte mit den anderen Wellen:**
- Λ.1 `_isBodyShaped` (livingCenterY) berührt Γ NICHT.
- Λ.2 HISM-Tint berührt Γ NICHT.
- Λ.5 Mischwald berührt Γ INDIREKT (4 neue Bäume spawnen über
  `_vegetationSampleSpawn`, die Spawn-Wahrscheinlichkeit hängt am
  Affinitäts-Feld; Γ4 ändert das Höhen-Feld → die Affinität ist invariant,
  aber die Positionen wandern. Bewusst.)
- Λ.7 Atmo-Konstanten berühren Γ NICHT.
- tesla W-E `_applySubstanceResponse` berührt Γ NICHT (Material-Pfad, Γ ist
  Geometrie-Pfad).
- tesla W-F Fluss berührt Γ INDIREKT (Γ4-Höhen-Verschiebung verschiebt
  Wasser-Spiegel an Hängen — der Fluss läuft anders. **Mess-Auftrag in
  Welle 3i:** den Fluss-Atlas nach Γ4 neu vermessen, eine A/B-Drohne über
  den Bach am Massiv).
- tesla W-G Werkstatt berührt Γ NICHT.
- tesla W-H Pro-Instanz-Yaw + Painterly Krone berührt Γ INDIREKT (Bäume
  spawnen an anderen Y-Höhen wegen Γ4 — sie skalieren wie zuvor).

**Determinismus:** Γ4 würfelt das Terrain neu. Welt-Snapshots aus V18.172
zeigen anderes Terrain nach Γ. Der `genVersion`-Marker im V18.181-Code
trägt das (genVersion fehlend → 1 → alte Welten bewahren ihr Gesicht;
neu → 2 → der Γ-Wurf). Welle 3i muss diesen Marker bewahren.

**Worker-Mirror-Pflicht:** der Γ-Bogen bringt **+278 Zeilen in
`voxel-worker.js`** mit — der Worker-Mirror der Γ-Lese-Funktionen. Welle 3i
MUSS BEIDE Pfade (main + worker) cherry-picken, sonst bricht die V9.89-
Determinismus-Wand strukturell (Main rechnet Γ, Worker rechnet ohne Γ →
Mismatches). Cherry-Pick-Disziplin: für JEDEN der 5 Γ-Commits prüfen, ob
er voxel-worker.js anfasst, und beide Hunks zusammen wandern.

**Mess-Aufträge nach Welle 3i:**
1. `node scripts/diag-makro.cjs` → Massiv ~700 m vom Spawn sichtbar
2. `node scripts/diag-ufer-pixel.cjs` → Ufer aus 20 m als Ufer
3. V9.89-Worker-Mirror-Test: 32 Sample-Punkte bit-identisch (Main vs
   Worker) AUCH an Massiv-Position
4. Fluss-A/B-Drohne über den Bach am Massiv (Mess-Auftrag der Konflikt-
   Karte oben)
5. Tag-Lebendigkeit-Probe mit `diag-lambda4-tag.cjs` an Γ4-Massiv (würde
   die Höhen-Verschiebung die Vegetations-Tag-Dichte verändern?)

---

## §15 Der Bau-Fortschritt (gepflegt pro Welle)

> Pro Stufe: GEMESSENER Schnitt + neue/erhaltene Wand. Abgehakt = ✓ +
> Version. Details im git-Commit + `handover.md`-Eintrag.

- **Welle 0 — Plan-Verankerung im Repo** (13.06.2026): Plan als
  `docs/wellen-synthese-plan.md` verankert + vier Schöpfer-Deltas
  eingetragen (§13.3 5 Test-Wanderungen explizit · §13.4 Painterly als
  PFLICHT · §14.8 nicht-gelesene Sub-Blöcke · §14.9 Γ-Bogen-Erweiterung).
  Mess-Wand: `git merge-base` bestätigt common base 6d9d342; clever-gauss-
  Real-Stand d0f0ec1 (V18.181, +4626/−142) vs tesla 3da302f (V18.179,
  +2360/−313) GEMESSEN. **✓ abd1891 (13.06.2026)**

- **Welle 1 — V18.180-FIX** auf V18.172: fünf Wunden geheilt (revokedKeys
  als Map · Γ5 streamRng · drei tote Helfer fort, `_archInstanceUpdate` als
  SAAT BEHALTEN — Plan §6.3-Korrektur, CLAUDE.md-Lehre · _hydroWaterLevelAt
  fort · audit:strict-Wand). Mess-Wand: Alle Invarianten OK + Welle-1-
  Test-Wanderung V9.43-c.2 auf _waterLevelAt. **✓ 56763a9 (13.06.2026)**

- **Welle 2 — V18.180-merge-W**: tesla auto-merged auf zen-pascal-7k36wk
  ohne Konflikt — die beiden Branches berühren disjunkte Regionen.
  Mess-Wand: playtest + audit:strict + diag-atlas grün, Tesla-Substanz
  GEMESSEN integriert (W-E/W-F/W-G/W-H/W3/W6 alle Methoden vorhanden +
  26 Atlas-Marker). **✓ 332f9e7 (13.06.2026)**

- **Welle 3 — V18.181-merge-Λ** (Sub 3a–3i): clever-gauss-Substanz
  (Λ + Γ) auf tesla-Architektur, Synthese rund.
  - Sub 3a+3b+3g-Konstanten: `INSTANCE_TINT` frozen, `AERIAL` erweitert,
    `_substanceResponseProfile` 12-Feld-Synthese (Plan §9). **✓ 2b2bb3f**
  - Sub 3c+3d: Λ.1 livingCenterY-Heilung + V9.56-i Test-Wanderung; Λ.2
    Pro-Instanz-Tint Daten-Flow (HISM instanceColor lazy, Snapshot+
    Restore). **✓ 739ce4c**
  - Sub 3g KONSUMENTEN: 3 kaskadierte Sonnen-Halos + 4. Cumulus-Oktave
    in tesla's createGalaxySkybox. **✓ 536f7d9**
  - Sub 3e: Λ.5 Mischwald-Synthese (Plan §10), 12 neue Baupläne +
    candidates 5→9 + switch-case-TREE_VARIANTS. **✓ 63e44e5**
  - Sub 3f: Λ.3 Wind-Sway auf Bäumen (positionNode-Sway aus wiegen-
    Antenne, lazy windUniforms). Λ.4/Λ.6 als Folge-Welle markiert
    (Browser-Verify nötig). **✓ d8aba10**
  - Sub 3h: Γ1-Lesart-4 DER BODEN ATMET + Worker-Mirror bit-identisch
    (+278 Z. in voxel-worker.js, genVersion-Schleuse). **✓ 332c144**
  - Sub 3i: Γ4 Welt-Komposition + Γ4.2/4.4 Hügel-zu-Berg + Γ4½ Slope/
    Rock-Foundation (3 Cherry-Picks, MACRO_ANKER, Ridge-Noise 7 Oktaven,
    Y-Stauchung 1.65×, Worker-Mirror). V9.56-i: `_applyAerialOutput`→
    `_applySubstanceResponse` in 7 Playtest-Stellen migriert (tesla-
    Rename Welle 2 nicht mit-gewandert). **✓ b77d9e6**

- **Welle 4 — V18.182-Painterly-Mischwald** (PFLICHT, NICHT Empfehlung —
  Welle-0-Korrektur): Birke/Erle/Buche NORMAL-Varianten auf 7-Layer-
  Painterly-Krone mit Vertikal-Gradient. Tanne bleibt Cone-Nadel-Form.
  Tag-Neutralität GEMESSEN erhalten. **✓ a458e31 (13.06.2026)**

- **Welle 5 — V18.183-Hygiene-Konsolidierung**: Atlas auf Synthese-Stamm,
  CLAUDE.md + handover synchronisiert, Dubletten geprüft (Stand: Welle 0-4).
  Mess-Wand: `diag-atlas --check` grün. **✓ 1fbd6d1 (13.06.2026)**

- **Welle 6+9+10 — V18.184**: Test-Härtung (strukturell durch Welle 1
  abgedeckt) + Atlas-Reife verifiziert + Plan-Archivierung (Plan nach
  `docs/archiv/wellen-synthese-plan.md` verschoben, Stamm-Pointer ersetzt).
  Mess-Wand: `diag-atlas --check` grün (26 Zonen). **✓ 020570d (13.06.2026)**

- **Welle 7 — Worker-Mirror-Breitung**: V9.89-Test um 32 Chunks erweitert.
  Mess-Wand: 32 Sample-Punkte bit-identisch. — *als Folge-Welle vermerkt
  (~1.6 s Playtest-Kost, vertretbar)*

- **Welle 8 — Λ-Test-Bänder formal**: ursprünglich als Folge-Welle vermerkt,
  in V18.186 nachgeholt (siehe R2). 7 Bänder registriert. **✓ 99d3d11**

- **R1 — V18.185-Reviewer-Heilung** (13.06.2026, nach externem Audit-
  Befund): AERIAL-Doppel-Define-Bug. Ein `static get AERIAL()` in der
  Klasse überdeckte das Top-Level-`AnazhRealm.AERIAL = ...`-Assignment
  LAUTLOS (Getter ohne Setter, non-strict-Assignment fällt durch — Node-
  verifiziert). Sub 3g-Bump (heightWeight 0.6→0.75, microStrength 0.1→0.14,
  aoStrength 0.35→0.38, aoCap 0.16→0.18) war funktional tot. Heilung:
  getter gestrichen (eine Quelle) + NEU `checkBandV18177AAA` mit 5 Live-
  Wänden (Object.isFrozen + Source-Probe gegen `static\s+get\s+AERIAL\s*\(`
  inkl. Kommentar-Strip + 4 numerische Werte). **Permanente Lehre 7**:
  Source-Probe-Wand MUSS Kommentare strippen, sonst fängt sie sich selbst.
  **✓ 7b8c636 (13.06.2026)**

- **R2 — V18.186-Plan-Vollendung** (13.06.2026, nach Reviewer-Lücken-
  Befund): die drei Reviewer-Lücken vollständig geheilt.
  - **Λ.6 SUBSURFACE-BACKLIT** in `_buildToonNodeMaterial`: subsurface
    back-lit als output-seitiger Glow für `responseProfile.detail > 0.4`.
    Pattern: `pow(viewDir · -uSunDir, 3) × detail × 0.18`, warmer Ton
    (1.0, 0.85, 0.6). OUTPUT-seitig (kein colorNode-Eingriff → bricht
    `material.color` nicht; CLAUDE.md-Gotcha respektiert).
  - **Λ.4 PER-ACHSEN-SKALIERUNG** in `_buildVoxelChunkScatter`: drei
    entkoppelte sx/sy/sz für wind-Arten (yFactor 0.8-1.25, x/zFactor
    0.85-1.15) — Wiesen-Feel statt Klon-Halmen. Consumer-Site liest
    sx/sy/sz wenn da, sonst Fallback auf uniform scale (Backward-Kompat
    für Steinchen).
  - **7 EIGENSTÄNDIGE Λ-Bänder** als Plan §7.1-Erfüllung:
    `checkBandLambda1LivingCenter` (3 W) · `Lambda2HismSynthese` (5 W) ·
    `Lambda3Wind` (3 W) · `Lambda4Streu` (2 W) · `Lambda5MischwaldSynthese`
    (5 W) · `Lambda6Detail` (4 W) · `V18177AAA` (5 W) = **27 Wände total**.
    Eine Λ-Regression wäre jetzt als Λ-Klassifikation rot, nicht
    versteckt im W-Band. **Permanente Lehre 8**: Test-Seeds für Bit-Band-
    Patterns brauchen volle Bit-Breite (Knuth 2654435761) — kleine Seeds
    (i × 7919 < 2²¹) treffen das obere Band nie. **Permanente Lehre 9**:
    Ein Audit mit fremden Augen fängt stille Bugs; Mess-Wand auf LIVE-
    Werten (nicht Source-Strings) ist die strukturelle Antwort.
  **✓ 99d3d11 (13.06.2026)**

- **R3 — V18.187-Welle-11-Vertiefung** (13.06.2026, nach zweitem Reviewer-
  Audit): drei substantielle Plan-Verluste, die V18.186 verdeckt hatte
  ("Λ.4 PER-ACHSEN-SKALIERUNG drin" galt für 1 von 3 V18.174-V18.176-
  Stufen). VIER Heilungen:
  - **(a) 12 echte Streu-Geometrien (clever-gauss V18.176):**
    KLEIN_VEGETATION_SPECIES von 7 generic auf 15 Varianten erweitert
    (blume_tulpe/_klee/_mohn · farn_normal/_breit/_schmal · gestruepp_
    busch/_decker/_stecher · schilf_reihe/_tuff/_rohr + fels/spore/pollen).
    `_scatterSpeciesGeometry` komplett mit clever-gauss-Version ersetzt
    inkl. Backward-Kompat.
  - **(b) Λ.4 instanceColor für Streu (clever-gauss V18.174):**
    `_scatterMaterial` mit useInstanceTint + attribute("instanceColor",
    "vec3") + HSL-Mathematik. `_buildVoxelChunkScatter` mit
    hashInstanceTint-Helper + setColorAt. Wiesen-Klon-Feld strukturell tot.
  - **(c) Λ.1 Role-Cache-Migration (clever-gauss V18.176):**
    `_loadStateRestoreCraftingInventory` recomputeRoles mit genVersion < 2
    Gate. Alte Welten kriegen ihre Eichen migriert.
  - **(d) 5 Λ-Diag-Skripte portiert** (`diag-fischer-wand` · `diag-lambda-
    volltiefe` · `diag-lambda4` · `diag-lambda4-tag` · `diag-lebendige-
    welt`) — die Browser-Audit-Werkzeuge.
  Reviewer-Befund 4 (*_alt-Bäume reduziert) GEMESSEN widerlegt (gleiche
  Part-Counts). `checkBandLambda4Streu` von 2 auf 6 Wände erweitert
  (V18.174 + V18.175 + V18.176-Stufen separat geprüft). 31 Λ-Wände total.
  **Permanente Lehre 10:** ein zu SCHMALES Test-Band gibt falsche Sicherheit
  (Plan-Wortlaut nennt N Stufen → Test-Band MUSS N Wand-Klassen tragen).
  **BRANCH-SYNTHESE-COMPLETENESS:** alle Methoden + state-Slots + Diag-
  Skripte sind in HEAD (`comm`-Vergleich: 0 fehlende). Die zwei Schwestern
  sind WIRKLICH eins — nicht "mit drei TODO-Lücken verlagert", sondern
  vollständig verschweisst. **✓ e87a2f8 (13.06.2026)**

OFFEN: Schöpfer-Browser-Sign-off des Gesamtwerks (pixel-blind ist headless).
Die 5 portierten Λ-Diag-Skripte sind die Browser-Audit-Werkzeuge dafür.

---

## §16 Permanente Lehre — die Bedingung, die heimlich mitgemeint war

Die heilige Lektion war „eine Datei, ein Stamm" — gegen die 19-Modul-Falle
von 2025. Sie meinte still mit: „eine Welle nach der anderen am Stamm".
Zwei parallele Branches haben diese stille Bedingung gebrochen, und das
Ergebnis ist genau das, was die Lektion verhindern sollte: zwei
Implementierungen derselben Architektur-Einsicht (Λ.0/W-E) divergieren
strukturell, beide grün, keine ist die andere.

Damit ein Wiederholen nicht still erlaubt wird:

**Vorschlag — die R-Y-Stufe des Robustheits-Bogens auf den Bau-Prozess
angewendet, Erst-Wurf:** jede Welle deklariert beim Start, welche Methoden
sie TIEF zu ändern beabsichtigt (Rename, Signatur-Wechsel, Algorithmus-
Bruch). Eine `tief-aenderung.txt`-Datei am Commit-Boden oder ein Commit-
Body-Block. Zwei Wellen, deren tief-aenderung-Listen sich schneiden, treffen
sich BEVOR sie bauen — nicht beim Merge. Das wäre Lokalität im Bau-Prozess,
statt Aufsicht.

Das ist KEIN Wächter, kein Verbot. Es ist die gleiche Form wie der
Robustheits-Bogen selbst: kleine starre Mitte, offener Rand. Die Mitte ist
„tiefe Änderungen werden früh sichtbar"; der Rand bleibt frei für alle
Wellen, die orthogonal arbeiten (die meisten).

**Falls dieser Plan §16 von der nächsten Session abgelehnt wird:** der
Vorschlag liegt im Archiv, und der nächste Doppel-Wellen-Schmerz nimmt ihn
neu auf. Eine Lehre, die durchläuft, ist die mit zwei Anläufen oft die
richtige.

---

_Dieser Plan ist die Brücke zwischen den zwei Schwestern und dem
zusammengeführten Stamm. Er trägt einen Anfang und ein Ende — und genug
Tiefe in der Mitte, dass keine Welle blind baut. Die zwei werden eins,
weil die Synthese eine STRUKTUR trägt, nicht beides._
_Tesla = Knochen, clever-gauss = Sehnen. Die Sehnen an die Knochen — nicht
die Knochen an die Sehnen._
