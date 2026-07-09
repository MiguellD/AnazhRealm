# N7.1 — DUAL-REGIME-INVENTUR: alle `_foundryEnabled()`-Sites (Stand 09.07.2026)

> **Bogen:** `docs/nervensystem-plan.md` Phase γ, N7 „Dual-Regime senken" (H6).
> **Zähl-Methode (kanonisch, fortschreibbar):** `grep -c "_foundryEnabled()" anazhRealm.js`
> — zählt Zeilen mit dem Symbol inkl. Klammern (Definition + Kommentar-Zitate zählen mit).
> **Baseline VOR N7.2:** 35 Zeilen-Treffer = 1 Definition + 5 Kommentar-Zitate + **29 echte Call-Sites**.
> (Die Plan-Baseline „34" aus §3.3 entspricht den Nennungen ohne die Definitions-Zeile.)
> **NACH N7.2 (erste Scheibe, dieser Stand):** 28 Zeilen-Treffer = 1 Definition + 5 Kommentar-Zitate
> + **22 echte Call-Sites** — der H6-Zähler sinkt um 7.

## 0. Klassen-Definition

| Klasse             | Bedeutung                                                                                                                            | N7-Schicksal                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| **BOOT**           | Verdrahtung: Worker starten / ensure / prefetch — kein Verhaltens-Regime, nur „gibt es die Foundry?"                                | bleibt (idealerweise EIN Chokepoint `_ensureAssetFoundry`) |
| **POLICY**         | Gabel: foundry-an = Studio-Pfad · foundry-aus = Grammatik-/Alt-Pfad                                                                   | Senkungs-Kandidat (N7.2 sofort, wenn byte-gleich ersetzbar; sonst N7.3) |
| **LEGACY**         | Wache: ein NUR-ohne-Foundry-Pfad (Totholz, Tuft, Kulissen)                                                                             | Senkung erst nach N7.3 (Gate übt den off-Pfad via Hook) |
| **HOOK-NAHT**      | Der Test-Hook `__anazhGateNoFoundry` selbst (lebt IN `_foundryEnabled`)                                                                | bleibt strukturell (der EINE Schalter)                  |

**Die eine Wahrheit:** `_foundryEnabled()` = `Worker existiert` UND `!__anazhGateNoFoundry`.
Im Produktions-Browser ist sie **ab Frame 0 konstant WAHR** — jeder foundry-aus-Zweig lebt dort
NUR für den foundry-off-Gate (voller Playtest setzt den Hook GLOBAL) bzw. exotische Worker-lose
Einbettungen. Das macht die N7.2-Scheibe möglich: Sites, deren beide Zweige sich auf eine
billigere strukturelle Wahrheit abbilden lassen (die EINE Dichte-Quelle · der EINE Boot-Chokepoint),
sinken OHNE dass irgendein Band kippt.

## 1. Die Inventur (29 Call-Sites vor N7.2; Zeilen = Stand VOR dem Schnitt)

| #  | Zeile (alt) | Symbol                        | Was die Gabel tut                                                                     | Klasse | Urteil |
| -- | ----------- | ----------------------------- | -------------------------------------------------------------------------------------- | ------ | ------ |
| 1  | 15133       | `_ensureCanopyShell`          | Studio: Fern-Kulisse AUS (dispose); sonst byte-alte Canopy-Shell                        | POLICY (Kulisse) | **N7.3-abhängig** — die B2-/Canopy-Bänder üben den off-Pfad via Hook (V18.423) |
| 2  | 33936       | `_grassStudioGeometry` (Leer-Wand 1) | Resolved-leer: Studio → `"leer"`, sonst `false` (Alt-Tuft)                        | POLICY | **GESENKT N7.2** (Dedup: EIN `_leerVerdikt`-Read, s. §2.1) |
| 3  | 33961       | `_grassStudioGeometry` (Leer-Wand 2) | dieselbe Wand nach dem Merge                                                       | POLICY | **GESENKT N7.2** (liest das eine Verdikt) |
| 4  | 34019       | `_buildVoxelChunkGrass` (Halm-Zweig) | Studio: Halm = Studio-Asset; sonst Tuft                                            | POLICY | **GESENKT N7.2** (Dedup mit #5, s. §2.2) |
| 5  | 34051       | `_buildVoxelChunkGrass` (`grassStudio`) | farFactor 1 vs 0.35 + Dichte 1 vs Regler                                        | POLICY | bleibt als der EINE Regime-Read der Methode |
| 6  | 34844       | `_buildVoxelChunkScatter` (densityScale) | Dichte 1 vs `_foliageDensityScale` — Duplikat der W1-Quelle                    | POLICY (Dichte) | **GESENKT N7.2** → liest `_effectiveFoliageDensity()` (s. §2.3) |
| 7  | 35370       | `_buildDekoFernfeldSpecies` (fdScale) | Dichte 1 vs Regler — Duplikat der W1-Quelle                                       | POLICY (Dichte) | **GESENKT N7.2** → liest `_effectiveFoliageDensity()` |
| 8  | 35714       | `_ensureHorizonMantle`        | Studio: Fern-Bergkulisse AUS; sonst byte-alt                                            | POLICY (Kulisse) | **N7.3-abhängig** (Mantle-Bänder üben off via Hook) |
| 9  | 35880       | `_ensureFarWaterSheet`        | W6-Provisorium: Fern-Wasser im Studio-Regime default AUS, `atmosphere.farWater===true` überstimmt | POLICY | bleibt bis Entscheid **E-D/W8** (bewusst reversibel) |
| 10 | 36510       | `generateNewWorld` (paralleler Saug) | Worker VOR dem Worldgen-Sync-Block starten                                        | BOOT | **GESENKT N7.2** — redundant zum Chokepoint `_ensureAssetFoundry` (prüft selbst, s. §2.4) |
| 11 | 50421       | `_buildVariantLODs`           | DER Nachbau-Chokepoint: Studio ready+kennt Art → null (Grammatik strukturell unmöglich) | POLICY (Chokepoint) | **bleibt strukturell** (Verfassung Gesetz 1; das Herz von V18.411) |
| 12 | 50651       | `_switchArchitectureLOD`      | Studio serviert die LOD-Stufe; sonst Grammatik-LOD-Pfad                                 | POLICY | **N7.3-abhängig** (LOD-Bänder foundry-off) |
| 13 | 50763       | `_updateFoundryLodBand`       | Crossfade-Band nur im Studio-Regime                                                     | POLICY | **N7.3-abhängig** — `entry.instFoundry` deckt fast, aber ein lokal-Hook-Band mit lebender Foundry braucht die Wand (gate:foundry-crossfade) |
| 14 | 51261       | `_effectiveFoliageDensity`    | DIE EINE Dichte-Quelle (W1): Studio → 1, sonst Regler                                   | POLICY (= die Quelle) | **bleibt strukturell** — Raptor/Gesetz #0; Proben pinnen (`playtest` 18658f, `gate:constitution` Gesetz 7); N7.2 macht sie zur Quelle von 3 weiteren Lesern |
| 15 | 51301       | `_scatterRegion` (Prefetch-Defer) | Boot-Fenster: Region entsteht LEER statt halb                                       | POLICY | **N7.3-abhängig** — `this._foundry?._prefetching` deckt den Voll-Gate (dort existiert `_foundry` nie), aber eine unter kurz-gelüftetem Hook erzeugte, dann hook-restaurierte lebende Foundry braucht den Read (sonst deferrierte der Grammatik-Gate-Pfad Regionen) |
| 16 | 51565       | `_scatterPass` (foundryPreset) | Kern-Gabel: Studio-Asset vs Grammatik-Streu                                            | POLICY (Kern) | bleibt (die zentrale appear-Gabel; N7.3/N4.3-Territorium) |
| 17 | 51593       | `_scatterPass` (tree-continue) | bei lebender Foundry KEIN Baum-Grammatik-Nachbau                                       | POLICY (Chokepoint) | **bleibt strukturell** — `gate:constitution` prüft das LITERAL `layer.kind === "tree" && this._foundryEnabled()) continue` |
| 18 | 51933       | `_tickFoliageThin`            | Studio: Streu dünnt NIE                                                                 | POLICY | **bleibt** — Proben pinnen den Read (`playtest` 18717 `thinFoundryGated` + `gate:constitution` Gesetz 7) |
| 19 | 51981       | `_tickGrassThin`              | Studio: Wiese dünnt NIE                                                                 | POLICY | **N7.3-abhängig** (`gate:grass-thin` übt den off-Pfad: 4/4 foundry-aus) |
| 20 | 52025       | `_tickGrassStage`             | Stufen-Nachbau NUR im Studio-Regime                                                     | POLICY | **N7.3-abhängig** (Studio-only-Tick; off-Zweig = No-op by design) |
| 21 | 62458       | `_archInstanceAdd` (Kalt-Wand) | foundry-bekannte Art + Grammatik-Flat → NICHT platzieren (wartet kalt)                 | POLICY (Chokepoint) | **bleibt strukturell** — die „keine gewachsene Geometrie in die Welt"-Wand am EINEN Slot-Chokepoint |
| 22 | 62657       | `_rebuildArchitectureMesh`    | Studio platziert; sonst Klassik                                                         | POLICY | **N7.3-abhängig** |
| 23 | 64309       | `_ensureAssetFoundry`         | DER Boot-Chokepoint: foundry-aus → null, kein Worker                                    | BOOT (Chokepoint) | **bleibt strukturell** — die EINE Boot-Wahrheit; N7.2 macht ihn zum einzigen Prüfer für die Boot-Aufrufer (#10/#29) |
| 24 | 65558       | `_foundryRewarmColdTrees`     | Rewarm-Tick nur mit Foundry                                                             | BOOT/POLICY | **N7.3-abhängig** — `!f \|\| !f.ready` (Folge-Zeile) deckt den Voll-Gate (globaler Hook → `_foundry` existiert nie), aber ein Band, das den Hook kurz LÜFTET (Loop-Tick erzeugt die Foundry) und wiederherstellt, hinterlässt eine lebende Foundry unter Hook — dort trägt der Read |
| 25 | 66156       | `_forestPlantChunk` (`studioDensity`) | Studio: kein fd-Dünnen der Baum-Darts                                            | POLICY (Dichte) | **GESENKT N7.2** — `fd = _effectiveFoliageDensity()` subsumiert die Wache byte-gleich (Studio → fd=1 → Check feuert nie, s. §2.5) |
| 26 | 66213       | `_forestPlantChunk` (Totholz) | Totholz-Spawn NUR ohne Foundry (W6: Fremd-Silhouette)                                   | **LEGACY** | **benannt, bleibt** — das V18.190-Band übt den off-Pfad via Hook; der Γ-Totholz-Faden ist Saat (roadmap §4), Schnitt = eigene Welle mit 0-Aufrufer-Beweis |
| 27 | 66251       | `_forestPlantChunk` (Strauch-Teppich) | Busch-Raster NUR im Studio-Regime; sonst Alt-Lücken-Pfad                         | POLICY | **N7.3-abhängig** (der Alt-BUSH_RATE-Pfad ist der geübte off-Zweig) |
| 28 | 73349       | `_workshopFoundryPreviewGroup` | Werkstatt-Vorschau aus dem Studio-Asset; sonst Klassik-Preview                         | POLICY | **senkbar in Scheibe 2** — `_ensureAssetFoundry()` (wird eh gerufen) gibt foundry-aus null → gleiche Rückgabe; nur die Auswertungs-Reihenfolge ändert sich (Preset-Lookup ist pur) → konservativ vertagt |
| 29 | 80529       | `startEternalLoop` (Früh-Start) | Foundry am Frame-Start anwerfen, solange `!this._foundry`                             | BOOT | **GESENKT N7.2** — redundant zum Chokepoint (identische Read-Zahl je Frame, s. §2.4) |

**Klassen-Zähler (29 Call-Sites vor N7.2):** BOOT 4 (#10 #23 #24 #29) · POLICY 24 · LEGACY 1 (#26).
Die 5 Kommentar-Zitate (Zeilen ~34067/34070/51980/62453/62656 alt) + die Definition (64283) zählen
im Zeilen-Grep mit, sind aber keine Regime-Leser.

## 2. N7.2 — die gesenkte Scheibe (7 Sites, jede byte-gleich in BEIDEN Regimen)

Kriterium der Scheibe: der foundry-aus-Zweig läuft im Produktions-Boot nachweislich nie
(Worker existiert im Browser immer; der Hook ist Gate-only) UND die Ersetzung ist eine
**billigere strukturelle Wahrheit mit identischem Wert in beiden Regimen** — kein Band kann
kippen, weil sich kein beobachtbares Verhalten ändert. Der Hook bleibt der EINE Schalter
(N7.3 unberührt).

### 2.1 `_grassStudioGeometry` — Leer-Verdikt-Dedup (−1)

Zwei identische `_foundryEnabled() ? "leer" : false`-Wände in EINER synchronen Methode
(kein await/User-Code dazwischen → der Wert kann sich zwischen den Reads nicht ändern).
Gehoben zu EINEM `_leerVerdikt`-Read, beide Wände lesen ihn. Byte-gleiches Verdikt.

### 2.2 `_buildVoxelChunkGrass` — `grassStudio` einmal (−1)

Der Halm-Zweig (Z. 34019 alt) und die farFactor/Dichte-Entscheidung (Z. 34051 alt) lasen
dieselbe Wahrheit zweimal in derselben synchronen Methode. `grassStudio` wird jetzt EINMAL
vor dem Halm-Zweig berechnet; beide Leser unverändert. Byte-gleich.

### 2.3 `_buildVoxelChunkScatter` + `_buildDekoFernfeldSpecies` — der Dichte-Draht (−2)

Beide Methoden trugen ein wörtliches DUPLIKAT der W1-Quelle
(`_foundryEnabled() ? 1 : _foliageDensityScale ?? 1` == exakt der Körper von
`_effectiveFoliageDensity`). Jetzt lesen sie die EINE Quelle (Gesetz #0 — genau die
V18.427/W1-Heilung, auf die zwei verbliebenen Selbst-Rechner ausgedehnt). Identischer Wert
in jedem Zustand (Studio → 1 · sonst Regler · headless → Regler=1 → voll, gate-treu).
**Probe gewandert (V9.56-i):** `playtest.cjs` `scatterReadsDensity` prüft jetzt
`_effectiveFoliageDensity` in `_buildVoxelChunkScatter` (via `__codeOf`); die Kette
Quelle→`_foliageDensityScale` beweist die bestehende `farScatterReadsDensity`-Probe.

### 2.4 `generateNewWorld` + `startEternalLoop` — der Boot-Chokepoint prüft selbst (−2)

Beide Aufrufer gateten `_ensureAssetFoundry()` doppelt (`!this._foundry && _foundryEnabled()`).
`_ensureAssetFoundry` prüft `_foundryEnabled()` in seiner ERSTEN Zeile (vor jedem Seiteneffekt)
→ der Außen-Read war ein reines Duplikat (die V18.268-Chokepoint-Lehre: der Invariant lebt IM
Chokepoint, nicht an N Aufruf-Orten). Jetzt: `if (!this._foundry) try { this._ensureAssetFoundry(); }`.
Foundry-aus: vorher wie nachher exakt EIN `_foundryEnabled()`-Read pro Frame/Aufruf, Ergebnis
null, kein Worker — byte-gleicher No-op. Foundry-an: nach dem ersten Frame ist `_foundry`
gesetzt → `!this._foundry` kurzschließt → null Zusatzkosten.

### 2.5 `_forestPlantChunk` — die Dichte-Wache subsumiert (−1)

`fd` las den ROHEN Regler, eine separate `studioDensity`-Wache schaltete das Dünnen im
Studio-Regime ab. Jetzt liest `fd` die EINE Quelle: Studio → fd=1 → `fd < 1` ist false →
der Dünn-Check feuert nie (identisch zur alten Wache); sonst fd = Regler-Wert → identisches
Dünnen. Wahrheitstafel deckungsgleich in allen vier Quadranten (Studio×fd). Der
`this.state &&`-Guard der Alt-Zeile war toter Defensiv-Code (Instanz-Methode, state steht
ab dem Konstruktor; alle bestehenden `_effectiveFoliageDensity`-Leser laufen ohne ihn).

## 3. H6-Fortschreibung

```text
Baseline (Plan §3.3, V18.432):   34 Nennungen (ohne Definitions-Zeile) · 29 Call-Sites
Nach N7.2 Scheibe 1 (09.07.):    27 Nennungen (ohne Definition)        · 22 Call-Sites
grep -c "_foundryEnabled()" :    35 → 28
```

## 4. Was N7.3 / N7.4 braucht (der Rest-Pfad zu ≤10, dann ≤5)

- **N7.3 (Gate auf foundry-ON umbauen; NICHT diese Welle):** 10 Sites hängen daran —
  #1 #8 (Kulissen) · #12 #13 #15 #19 #20 #22 #24 #27. Ihr foundry-aus-Zweig wird heute von
  Bändern über den globalen/lokalen Hook GEÜBT; erst wenn der Voll-Gate foundry-ON fährt
  (Fixtures) und `__anazhGateNoFoundry` nur noch Unit-Richter ist, können diese Gabeln auf
  Default-appear-on kollabieren (Legacy hinter explizitem Hook).
- **Scheibe 2 (ohne N7.3 möglich):** #28 `_workshopFoundryPreviewGroup` (Chokepoint deckt,
  nur Auswertungs-Reihenfolge; hier konservativ vertagt) — Potenzial −1.
- **Bleiben strukturell (die Ziel-Menge „Boot + Hook + Chokepoints", ~7):**
  #5 (der eine Gras-Regime-Read) · #9 (bis E-D) · #11 #17 #21 (Nachbau-Chokepoints,
  Verfassungs-gepinnt) · #14 (die eine Dichte-Quelle) · #16 (Kern-Gabel appear) ·
  #18 (Proben-gepinnt bis die Probe mit einem N7.3-Umbau wandert) · #23 (der Boot-Chokepoint) ·
  #26 (LEGACY-Saat Totholz, eigener Schnitt-Entscheid).
  N7.4 (≤10 → ≤5) verlangt danach zusätzlich, die Dichte-/Thin-Gabeln (#5 #18 #19 #20) in
  EINE Regime-Quelle zu falten (z. B. `_effectiveFoliageDensity`-Schwester für „Studio-Regime?"
  als memoisierter Frame-Read) — das ist N7.3-nachgelagert, weil die Proben-Pins mitwandern müssen.
- **Tote Zweige (benannt, NICHT geschnitten — Saat-Regel):** kein untersuchter foundry-aus-Zweig
  ist heute UNGEÜBT: die Kulissen (#1 #8), Tuft (#2–#5-off), Totholz (#26), Grammatik-Streu
  (#16/#17-off) und die Thin-Pfade werden alle vom foundry-off-Voll-Gate erreicht. Ein echter
  0-Aufrufer-Beweis (Schnitt-Welle) wird erst NACH N7.3 möglich, wenn der Hook auf Unit-Richter
  schrumpft.
