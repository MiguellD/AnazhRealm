# Abnahme Analog B

> Pflicht B: CODE TEIL / GRAMMATIK TEIL (Slice 1+2). Brick-Parallel der Baum-Bahn ist tot;
> Kronen-**Ellipsoid** + Ast-**Kegel** (sdCappedCone) tragen; Noise (Slice 3) im March (18.491.76).

## Code (trägt)
1. Bahn bleibt: Zellen-LOD ≥ 1 → Feld-Kapsel (`_baumFeldSpawn`), LOD 0 → Instanz (Anfassen/Fällen).
2. Dedup-Key: `abaum:preset:variant` (Vorlage; **ohne** dim/Stufe — LOD-Wechsel = derselbe Key, kein Churn). Spec-Wording „Vorlage×Stufe“ = Bahn-LOD; Payload-Key ist Vorlage.
3. Payload analytisch: `_baumKapselFit` → mit Beipack `_baumGrammatikFit` (Top-N **Cone** + 1 Kronen-Ellipsoid); ohne Beipack AABB — fail-closed.
4. Brick-Parallel fail-closed: `_weltFeldSpawn("baum:…")` → null; `_waldZiegelBacken` → null. Region-Fern-CACHE (`dimRegion`) bleibt erlaubt.
5. **Slice 1 (18.491.57):** Pack `_weltKapselHolen` akzeptiert `def.ellipsoid`; March diskriminiert Box (`pB.w≈0`) vs Ellipsoid (`pB.w≥1`) in allen 4 `pA.w<0`-Zweigen. Arch-Box unverändert (`pB.w=0`).

6. **Slice 2 (18.491.74):** Foundry `__baumGrammatik`-Beipack + Flatten; Pack `def.cone`; March×4 `sdCappedCone`.

7. **Slice 3 (18.491.76):** March×4 Kronen-Ellipsoid (`pB.w≈1`) + billiger Noise (`sdEllipsoidCrown`, 2×sin, amp=0.035·min(h)); Pack unverändert.

### Cone-Encoding (Slice 2 — Pack-Audit)
| Art | pA.w | pB.w | Layout |
|-----|------|------|--------|
| Kapsel | r ≥ 0 | colorPack ≥ 0 | a,r / b,color |
| **Cone** | **r0 ≥ 0** | **−(colorPack+(r1+1)/10) < 0** | **a,r0 / b,packed(r1,color)** |
| Box/Ellipsoid/Prism | −(c+1) | 0 / 1 / 2\|3 | unverändert |

- Decode: `r1=fract(−pB.w)*10−1` (r1<9), `color=floor(−pB.w)`. `pB.w=4` Negativ-Ast verworfen (9 Floats > 8-Slot).

## Lücke bis B-Schließung
1. ~~Ast-Kegel + Beipack (Slice 2)~~ → Code **18.491.74** (Sichturteil Tanne/Nadel offen).
2. ~~**Noise-Detail-Term** im Analog-March (Slice 3)~~ → Code **18.491.76**.
3. Beweis E: Bild-Paar Armlänge vorher↔nachher + Tris/dc/weltMarch-Sonde (Fernwald-Sichturteil Kronen weicher nach Slice 1).
> Honesty .156: Grammatik-SDF **CODE zu .76** (nicht offen); Residual bis Schließung = **E Metrologie / human Bild** — siehe `docs/abnahme-analog-e.md`.

## Abnahme (Michael)
1. Fernwald LOD≥1: Kapsel-Feld, keine Voxel-Treppe am Stamm; Instanz-Slots leer; Kronen runder (Ellipsoid) als reine Kapsel-Kugeln.
2. Zwei Zellen, gleiche Vorlage×Variante, LOD 1 und 2: ein `kapselCache`-Key (`abaum:…`), refs≥2; mind. 1 Texel-Paar `pA.w<0` & `pB.w≥1` bei Laub-Vorlage.
3. Absenz: kein `baum:…:dim`-Brick; `_waldZiegelBacken` liefert null; `aarch:` Boxen bleiben `pB.w==0`.
4. Nah (LOD 0): Instanz-Geometrie für Fällen/Anfassen.

Gates: `node --check anazhRealm.js` · `gate:betriebsgesetz`

## Sonde Fernwald (09.09.)
- Datei: `AnazhRealm-denken/analog-b-fernwald.png`
- Sunny Fernwald — Stämme/Äste glatt/kapselig, nicht Voxel-Treppe (Sichturteil). Slice-1-Ellipsoid: Sichturteil Kronen nach Reload mit V18.491.57.

## Sonde Fernwald .59 (09.09.) — TEIL Sicht / E FAIL
- `analog-b-fernwald-ellipsoid.png`: Stämme kapselig, Kronen spitz (Ellipsoid nicht klar).
- `analog-b-fernwald-e.png` / `analog-c-mittag-e.png`: **kein** `E OK`-Zeile — nur Input `metrologie` ohne Submit; C-e = Wald-Duplikat, kein Wasserfall.

## E-Stempel B (09.09.)
- Datei: `AnazhRealm-denken/analog-b-e-stempel.png` (v18.491.59, sunny ~12:39)
- Live: `E OK V18.491.59 tris=258821 dc=43 belegt=84 bricks=0 kapseln=36 gesetzB=0 gesetzP=0 pos=48/52/0`
- bricks=0 (Brick-Parallel tot erwartet); kapseln=36 > 0 → Bahn trägt am Moment.
