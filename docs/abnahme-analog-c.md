# Abnahme Analog C

> Pflicht C: CODE TEIL / BEWEIS OFFEN. Arch-Box + Verteilungs-Gesetz tragen;
> Oktanten + Feld-Listen-Batch-Raster + dimArch sind fail-closed tot.
> Fachwerk-Grammatik-Fit (V18.491.73: `_archFachwerkFit` für `haus_`/`studioOv`)
> trägt inkl. Diagonal-Verbände (AABB) + Sattel-**Prism**-Dach + Gaube/Flügel-Stub.

## Ist-Karte (analog vs. tot/Parallel)

| Pfad | Status |
|------|--------|
| `_archZiegelFern` → `_weltKapselSpawn` / `aarch:type:variant` | **analog** — Box-Satz |
| `_archBoxFit` (≤24 AABB-Boxen je Vorlage) | **analog** — Fallback Mesh-AABB |
| `_archFachwerkFit` (`haus_`/`studioOv` → Balken/Gefach/Verbände/Dach-Prism) | **analog TEIL** — Grammatik-Maße + Diagonal-AABB + Dach-Prism + EG/OG-Fenster-Lücken |
| Shader Box/Ellipsoid/Prism (`pA.w < 0`, `pB.w` 0/1/2|3) | **analog** |
| Oktanten / klemmBox | **tot** (Kommentar-Reste) |
| `dimArch` / `schritteArch` | **tot** — fail-closed in `_ziegelBackenAusGruppe` |
| Keys `arch:…` via `_weltFeldSpawn` | **tot** — fail-closed |
| `_streuGesetzSpawn` + `gesetzKacheln` / `gesetzBlock` | **analog** — Verteilungs-Gesetz |
| Shader Gesetz-Branch (`einheit < 0`) | **analog** |
| Batch-Raster auf Feld-Liste (1 Slot/Instanz) | **tot** — Chokepoint = Gesetz |
| Band-0 Mesh (`_scatterInstanceAdd`) | **lebend Hybrid** (Anfassen, wie Baum LOD0) |
| `_buildVoxelChunkScatter` / Deck-/Deko-Impostor | **lebend Hybrid** (CLAUDE: Band-0 + Ringe) |
| Region-Fern-CACHE (`_ziegelBackenAusGruppe` + `dimRegion`) | **erlaubt** (PFLICHT-Header) |
| BatchedMesh Hand-Nähe (`useBatchedArch`) | **lebend Hybrid** (Interaktion) |

## Code (trägt)
1. Architektur: Dedup-Key `aarch:type:variant`; Payload `_archFachwerkFit` (haus_/ov) sonst `_archBoxFit`; Mesh nur Hand-Blase unsichtbar.
2. Klein-Streu LOD≥1: `_streuGesetzSpawn` → Block je 64-m-Kachel; Vorlage teilt `abaum:…`-Kapsel-Fit.
3. Fail-closed: `_weltFeldSpawn("arch:…")` → null; `_ziegelBackenAusGruppe(dimArch)` → null.
4. Trace: `weltMarch.gesetzBloecke` / `gesetzPlaetze`.

## Lücke bis C-Schließung
1. ~~**Prism**-Primitive~~ **TEIL** (V18.491.69): Pack `def.prism` → `pB.w=2|3`; March×4 Wedge-SDF; Dach = zwei Prism-Hälften (nicht AABB). Rest: dünnere Dachhaut / Gauben-Prism.
2. Fachwerk-Grammatik-Fit **TEIL** (V18.491.69): Wände/Balken + Diagonal-Verbände (Andreas/K/Mann AABB, EG+OG Front/Back/Seiten) + Sattel-Prism; Rest: Flügel/Gauben.
3. Streu-Vorlage: Fels/Kristall eher **Box-Fit** statt `_baumKapselFit` (Kapsel-Näherung).
4. Beweis E: Bild-Paar Armlänge vorher↔nachher + Tris/dc/weltMarch-Sonde (Arch + Streu).
> Honesty .156: Prism+Gaube/Flügel **CODE denseness done-ish ≤.95** (nicht „Prism offen“); Bild **TEIL** `analog-c-mittag.png`. Residual bis Schließung = **E Metrologie / human Bild** — siehe `docs/abnahme-analog-e.md`.

## Abnahme (Michael)
1. Fern-Haus: Box-Feld, keine Voxel-Treppe; Mesh unsichtbar außerhalb Hand.
2. Zwei Bauten gleicher type×variant: ein `kapselCache`-Key (`aarch:…`), refs≥2.
3. Absenz: kein `arch:…`-Brick; `dimArch`-Bake liefert null; keine Oktanten-Leiter.
4. Klein-Streu LOD≥1: `gesetzBloecke`/`gesetzPlaetze` > 0; keine 1:1-Feld-Slots je Stein.
5. Band 0: Mesh/Instanz zum Anfassen/Pflücken bleibt.

Gates: `node --check anazhRealm.js` · `gate:betriebsgesetz`

## Sonde Architektur (09.09.) — TEIL / FAIL
- Datei: `AnazhRealm-denken/analog-c-architektur.png` (v18.491.54, rainy/Nebel)
- Konsole zeigte `baue dorf hierblwv` → Chat-Regex `^baue … hier$` matcht nicht → kein Spawn.
- Sicht: Terrain + Baum, **kein** Bauwerk → Beweis C Bild weiter offen.
- Nächster Versuch: exakt `baue dorf hier`, sunny, 8 m vor Spieler, warten auf async `spawnSettlement`.
- Chat 18.491.55: Suffix-Müll nach Suggest (`hierblwv`) wird wie Near-Exact ausgeführt.

## Sonde Dorf (09.09.) — FAIL Sicht
- `analog-c-dorf.png` (noch UI `.54`, night/stormy): Chat „dorf vor dir gebaut“, **kein** Bauwerk im Blick.
- Ursache-Kandidaten: sofortiges Describe vor async Settlement; Spawn ggf. fail-closed nur im Log; Nacht/Nebel; Häuser außerhalb Blick.
- 18.491.56: `_chatEcho` nach Settlement Erfolg/Fail (kein stilles Nichts im Chat).

## Sonde Bau (09.09.) — FAIL Sicht/Nacht
- `analog-c-bau-fail.png` (UI `.56`, 01:18 rainy): Chat „wasserfall vor dir gebaut“, Viewport **schwarz** — kein Bau erkennbar.
- Kopf: Echo vor Mesh/Ziegel; Mesh in Hand-Blase unsichtbar, Sicht = `aarch`-Feld; ohne Licht = Blindflug.
- 18.491.58: Chat `setze uhrzeit mittag` → DSL `set_time_of_day`.

## Sonde Mittag (09.09.) — TEIL
- Datei: `AnazhRealm-denken/analog-c-mittag.png` (v18.491.58, sunny, 12:00)
- Chat: wetter sunny · uhrzeit mittag · tempel + wasserfall „vor dir gebaut“
- Sicht: **Wasserfall-Struktur** erkennbar (Nacht-Blindflug gelöst). Tempel/Haus-Box-Feld weiter zu schärfen.
- 18.491.60: `_archFachwerkFit` — Settlement/`haus_` mit ov → Feld-Silhouette aus Fachwerk-Maßen (nicht nur Mesh-AABB); Prism + Verbände/Flügel offen.
- 18.491.65: Diagonal-Verbände in `_archFachwerkFit` (Andreas-X / K / Mann als dünne AABB-Stufen, timber-prio, ≤24); Prism + Flügel/Gauben weiter offen.

## Konsum Hand-Dichte 18.491.63
- Portal-Spiel: Studio-Haus dicht (Balken/Ziegel/Tür/Treppe).
- Host: `haus_*` Mesh in Hand-Blase **sichtbar** (Studio-Dichte); Fern weiter `aarch`-Feld. Nicht-Haus unverändert Feld-only.

## Diagonal-Verbände 18.491.65
- `_archFachwerkFit`: bei `brace`/`stil`-Fachwerk → EG Front/Back Andreas-X (oder K/Mann) als 2-Stufen-AABB entlang der Strebe; Holz-Prio, Cap 24.
- Residual: Prism-Dach, Flügel/Gauben, ov-unabhängiger Dedup-Key.

## OG-Verbände 18.491.66
- `_archFachwerkFit`: Diagonal-Verbände auch OG Front/Back (storey 1) wenn storeys≥2 und timber-prio-2-Raum im ≤24-Cap; OG 1 Stufe/Diagonale (2 wenn Platz), EG unverändert.

## ov-Dedup 18.491.67
- `_archZiegelFern`: Dedup-Key bei `studioOv` → `aarch:type:variant:ov:<hash>` (`_studioOvHash`); ohne ov byte-alt; `_archFachwerkFit` unverändert.

## Seiten-Verbände 18.491.68
- `_archFachwerkFit`: Diagonal-Verbände auch Left/Right (EG 1 Stufe/Diag wenn Cap; OG Left/Right wenn ≤24 timber); Andreas/K/Mann; Front/Back unverändert.

## Prism-Dach 18.491.69
- Pack `_weltKapselHolen`: `def.prism` (+ optional `prismFlip`) → gleicher Texel-Pack wie Box, Typ-Flag `pB.w=2` (First +local z) / `3` (First −z).
- March: alle 4 `pA.w<0`-Zweige (Gesetz+Kapsel × SDF+Normale) diskrimieren Box (`≈0`) / Ellipsoid (`≈1`) / Prism (`≈2|3`); SDF = `max(sdBox, plane)` (Wedge).
- `_archFachwerkFit`: Sattel-Dach emittiert zwei Prism-Hälften; Wände/Balken/Verbände bleiben AABB-Boxen; First-Balken Box.
- Residual: Flügel/Gauben; Beweis-E Bild.

## Fenster-Lücken 18.491.70
- `_archFachwerkFit`: EG-Front Gefach mit Fenster-Lücken (1–2, `ov.winW`/`winH` ≈1.0×1.2 unter Traufe); Seiten optional bei Cap; Tür-Lücke unverändert; Timber/Prism-Prio ≤24.

## OG-Fenster-Lücken 18.491.71
- `_archFachwerkFit`: OG-Front Gefach Fenster-Lücken (1–2, `ov.winW`/`winH`) bei storeys≥2; OG-Seiten optional bei Cap; EG-Tür/Fenster + Prism unverändert; Timber-first ≤24.

## Gaube-Stub 18.491.72
- `_archFachwerkFit`: eine Front-Gaube (Box + optional Mini-Prism, nur −z) bei storeys≥2 wenn `ov.gaube` oder stil alt/huette + W≥7 + Soft-Cap ≤24; fail-soft; Tür/Fenster/Verbände/Sattel-Prism unverändert.

## Flügel-Stub 18.491.73
- `_archFachwerkFit`: ein Seitenflügel (+x/−x, `ov.fluegelSide`) bei `ov.fluegel` oder stil alt/huette + W≥8 + Soft-Cap ≤24; 1 Geschoss, solid Gefach, kein Verbände-Satz; fail-soft; Gaube/Prism/Fenster unverändert.

## Portal-Preview dense studioOv 18.491.91
- `_ensurePortalPreview`: fachwerk/`haus_*` spawn trägt dense `studioOv` (alt/andreas/gaube/fluegel) → Host-Fit Lab-ish dichter; Flügel-Stub landed .73 (Kommentar sync).

## Gaube-Default stil-alt 18.491.92
- `_archFachwerkFit`: `wantGaube` — explizites `ov.gaube` (false = fail-closed) sonst Default bei fachwerk + stil alt/huette/stroh; storeys≥2; Soft-Cap ≤24 Sort (prio 2 hält Dorf-Gaube). Portal dense ov .91 unverändert.

## Flügel-Default wantFluegel 18.491.93
- `_archFachwerkFit`: `wantFluegel` — explizites `ov.fluegel` (false = fail-closed) sonst Default bei fachwerk + stil alt/huette/stroh + W≥8; Soft-Cap Sort (prio 1 — Wing fällt vor Gaube/timber prio 2), kein hartes `kand.length≤20`. Unter andreas+Gaube droppt Cap den Wing oft; mit Cap-Raum (brace none) bleibt er. fluegelSide unverändert. → supersediert durch slim wing .94.

## Slim wing Soft-Cap 18.491.94
- `_archFachwerkFit`: slim Flügel — 2× prio-2 (solid Annex-Körper + Dachplatte) statt 5× prio-1; Soft-Cap ≤24 hält Silhouette neben Andreas/Gaube; `wantFluegel` / fluegelSide / fail-closed `ov.fluegel===false` unverändert; fW clamp max 3.2.

## Fit-Stack denseness 18.491.96
- **CODE denseness Host≈Portal: done-ish** (nicht Bild). Soft-Cap ≤24 hält; slim wing = 2× prio-2 under andreas+gaube.
- Landed stack: Verbände / Prism / Fenster / Gaube-Default .92 / Slim-Flügel Soft-Cap .94 / Portal dense ov .91 / Settlement ov brace.
- Residual sync: human Bild/Beweis E; Soft-Cap tradeoffs; mauer/laternen absichtlich `exportSettlement`-stripped.
- Kein Fake-PFLICHT-leer — siehe `AnazhRealm-denken/C-FIT-STACK-DICHTE.md`.
