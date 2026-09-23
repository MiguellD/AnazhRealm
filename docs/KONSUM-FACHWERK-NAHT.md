# KONSUM · Fachwerk-Naht

> Host-Konsum der Studio-Haus-Grammatik als `aarch`-Feld-Silhouette (`_archFachwerkFit`),
> ohne Mesh-AABB-Ersatz und ohne dimArch. Dedup-Key: `aarch:type:variant` (+ ov-Hash wenn studioOv).

## Ist (V18.491.96)

| Slice | Status |
|-------|--------|
| Balken / Gefach / Fundament / Dach | **trägt** (≤24, timber-prio) |
| Diagonal-Verbände (Andreas-X · K · Mann) | **trägt** — EG/OG Front/Back/Seiten (Cap) |
| Hand-Blase Mesh (`haus_`) | **sichtbar** (Studio-Dichte); Fern = Feld |
| Prism-Dach | **TEIL** (V18.491.69: Wedge `pB.w=2|3`, zwei Hälften) |
| Gaube / Flügel | **TEIL** (Gaube .72/.92 · Flügel-Stub .73 · wantFluegel .93 · slim wing 2×prio-2 Soft-Cap .94; Soft-Cap ≤24) |
| Portal-Preview fachwerk dense `studioOv` | **trägt** (.91 — brace/gaube/fluegel am Preview-Spawn) |
| ov-Dedup-Key | **TEIL** (.67 — `ov:<hash>` wenn studioOv) |

## Residual (kurz)

1. ~~Prism-Primitive~~ TEIL 18.491.69 — Feinschliff Dachhaut / Gauben-Prism.
2. ~~Flügel / Gauben~~ TEIL .72/.73/.92/.93/.94 — Gaube-Default (wantGaube) + Flügel-Default (wantFluegel) + slim wing 2×prio-2 hält Cap neben Andreas/Gaube; fail-closed `ov.fluegel===false`; Portal dense ov .91.
3. Optional: weitere OGs / Annex ohne Cap-Druck.
4. Beweis E (Bild-Paar) weiter bei Analog C.
5. Alte `portalPreviewFachwerk`-Stempel ohne ov: Meta clear / neue Welt für dichtere Preview.

Gates: `node --check anazhRealm.js` · `diag-arch-fachwerk-fit` · `diag-puls-konsum` · kein Commit in dieser Slice.

> Stempel V18.491.100: Studio-Cache-Buster Align — kein Mesh/Feinschliff; Residual Dachhaut/Gauben-Prism unverändert.
