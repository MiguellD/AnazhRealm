# Bericht Baum Schnitt 3: Die Verdeckung in Metern stirbt, der Baum hinter der Krone wählt wie jeder Baum (ZWISCHENSTAND)

Stand 15.11.2026 (date) · Zweig `w28-baum-schirm` 7743db46 (WIP, nicht gelandet) · main-Kopf 01a6714a (V18.546.291, vor dem ersten
Bild eingemischt: 1019a646) · Gerät Radeon 890M, jede Welt `werkbank start --echt`, `r._schirm()` = 1920 × 1080, pxJeM 703,7.

## Spike (der Schalter `state.useOcclusionDemotion` auf main, EINE Welt, A = mit Gitter, B = ohne, A B B A B A A B, je Zustand eingeschwungen + GPU-Bank)

| Ort | verdeckte Bäume mit → ohne | Anteil ohne − mit (Punkte der GPU-Zeit), Median ± SE | Dreiecke (band) mit → ohne |
|---|---|---|---|
| **P3** (−323, −1074,2), Blick auf Baum 16,2 m in 33,5 m (−339,7, −1103,3), gefunden über das Kronen-Gitter: 5 Bäume ≥ 15 m verdeckt | 5 → 0 (L1 55 → 60, L2 1806 → 1801) | **−2,18 ± 3,36** (ohne billiger) | gesamt 651k → 656k, `baum` 266k → 266k |
| P2 Mess-Wiese (−280,4, −1045,6) | 0 → 0 (Nullprobe: gleicher Zustand) | +1,77 ± 2,25 | 583k → 583k, `baum` 105k → 105k |
| P1 Genesis (0, 0) | 0 → 0 (Nullprobe) | +0,54 ± 3,07 | — |

Soll „ohne ≤ mit + 1 Punkt“: an P3, dem einzigen Ort, an dem der Schalter wirkt, gehalten. P2 und P1 tragen keinen verdeckten Baum: ihre
Zahlen sind das Rauschen (gleicher Stufen-Zustand). Referenzfahrt vorher f 1,61–1,72, nachher 1,22–1,32 → unter Last gemessen; das
Urteil ist einseitig (ohne Gitter nicht teurer). Die Dreiecke der Klasse `baum` ändern sich nicht. Rohdaten:
`artifacts/profiband/auge/w28-baum-schirm/schnitt3/spike.log`, `spike-abba-p3.json`, `spike-abba-p2.json`, `spike-abba-p1.json`.

## Geschnitten (24dc4a3c gegen main 01a6714a, 13 Dateien, +68 −194)

- stamm/siedlung-bauten.js: `_rebuildOcclusionGrid` · `_maybeRebuildOcclusionGrid` · `_occlusionOccludes` (main :74–134), der Schalter
  `occlOn` und der Gitter-Neubau im Takt (:148–152, :180), `gitterAlt` samt Grund „das Gitter der Verdeckung ist älter als die Welt“
  (:229–231, :254–256), der Rand `occDist` im Spielraum (:393–395), die Demotion samt `_occluded` (:504–531), `AnazhRealm.OCCLUSION`
  (:3374–3392). `_archStufeUrteil(entry, pm, z)`, `_archStufeSpiel(entry, dist, visH, grenzen, distAuge)`, `_archBewegteUrteilen(pm)`.
- stamm/siedlung-instanz.js: `_lodSlotVoll` liest nur Brücke und Halt (:448); `_lodSlotOcclusionRefresh` heißt `_lodSlotVollNachzug`
  (:434), weil Brücke und Halt ihn weiter rufen.
- stamm/stoff-karte.js:183 und stamm/stoff-material.js:1383: `occlNode` heißt `vollNode`, weil das Vorzeichen von aKarte.w weiter die
  Brücke trägt. Der Kern-Term vOcc in `lodCrossfadeMask` bleibt unverändert im Kern.
- stamm/dirigent-kern.js:829–832 (`useOcclusionDemotion`), stamm/dirigent-takt.js:2248 (der Stempel des Schalters),
  stamm/bild-kosten.js:3541 (`_blendeBehaelt(…, voll)`), spec/stamm/modul-karte.json.
- Die Leser in scripts: diag-stand-takt.cjs (der Treue-Täter stellt jetzt still eine Brücke statt eines Verdeckt-Urteils),
  diag-foundry-crossfade.cjs:759, diag-fernwald.cjs:379, diag-ankunft.cjs (Name).
- Die Linse in der Familie gate:altlasten: neun Namen (`useOcclusionDemotion`, `AnazhRealm.OCCLUSION`, `_occlusionOccludes`,
  `_rebuildOcclusionGrid`, `_maybeRebuildOcclusionGrid`, `_occlGrid`, `_occluded`, `_lodSlotOcclusionRefresh`, `occlNode`), dazu die
  vier Prüf-Skripte und playtest. **Auf main ROT mit 20 Tätern beim Namen** (siedlung-bauten.js:79/80/81/102/114/152/514/521,
  siedlung-instanz.js:434/449, stoff-karte.js:183, stoff-material.js:1383, dirigent-kern.js:832, dirigent-takt.js:2248,
  diag-stand-takt.cjs:1475/1478/1483, diag-foundry-crossfade.cjs:759, diag-fernwald.cjs:379, diag-ankunft.cjs:973), am Kandidaten
  GRÜN (815 Namen, 108 Dateien). Selbsttest GRÜN. Ein Rückkehrer eines der neun Namen ist der Mutant.

Statik: `npm run check` EXIT 0 · `stamm:lint` EXIT 0 · Format (format-teile) GRÜN · `diag-atlas --check` GRÜN.

## Gemessen: Kandidat gegen main, je in einer eigenen Welt, beide in 1920 × 1080

- **Annahme Bild, P3: Karten über der Bild-Höhe ihres Gesetzes im Blick: main 3 → Kandidat 0.** Auf main stehen dort drei Bäume als
  Karte, 30,2 / 32,9 / 43,9 m hoch, in 31,9 / 35,2 / 44,2 m, also 666 / 658 / 698 px. Ihre Wahrnehmungs-Distanz liegt bei
  12,1–12,8 m, ihr Gesetz verlangt also eine 3D-Stufe. Am Kandidaten zählt der Zensus L1 im Blick 35 → 44, L2 117 → 108.
- Pixel mit Luma-Unterschied über 18 zwischen den beiden Bildern: P3 170 px (0,008 %), nur in den Lücken der Kronen in der Tiefe des
  Bilds (`diff-p3.png`). P3b 128 px (0,006 %). Die verdeckten Bäume stehen fast ganz hinter der vorderen Krone. Mein Urteil: gleich, nirgends
  schlechter. Den Gewinn zeigen nur die Lücken.
- Pop an der Mess-Wiese (`werkbank pop`, Ego, Welt `--echt`), je drei Läufe: main 0,0672 · 0,0679 · 0,0651 % (Median 0,0672) ↔
  Kandidat 0,0736 · 0,0490 · 0,0537 % (Median **0,0537**). Damit gilt Kandidat ≤ main (Z2).
- Preis: die Spike-Zahl an P3, −2,18 ± 3,36 Punkte. Dazu der CPU-Takt `_tickArchitectureLOD` an P3 im Gang über 80 Takte, zwei Läufe
  je Seite: main p50 2,34 / 1,91 ms und p95 8,26 / 4,85 ms ↔ Kandidat p50 1,82 / 1,09 ms und p95 4,05 / 2,74 ms. Das ist nicht über
  main. Die Seiten liefen nacheinander, main zuerst; die Zahlen gelten nur relativ.
- Heap und VRAM nach zwei GC an P3, in zwei Läufen mit umgekehrter Reihenfolge:
  - main zuerst: Heap 410,1 ↔ 419,6 MB, VRAM 141,1 ↔ 139,8 MB.
  - Kandidat zuerst: Heap 369,2 ↔ 368,3 MB, VRAM 138,0 ↔ 137,3 MB.
  - Der Heap folgt der Reihenfolge und nicht dem Schnitt. Der VRAM liegt beide Male unter main. Der Schnitt legt keinen Puffer an und
    entfernt die Map des Gitters.

## Bilder (`C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/auge/w28-baum-schirm/schnitt3/`, 1920 × 1080, `r._schirm()` = 1080 Zeilen je Bild)

- `main-p3-rot.png` ↔ `kandidat-p3-rot.png`: Das Ziel steht hinter Laub, die Abnahme heißt deshalb „VERDECKT“. Das ist der Ort, nicht
  ein Fehler. Dazu `paar-p3-mitte-800.png`, `paar-p3-ausschnitt-400.png` (main · Kandidat · Unterschied) und `diff-p3.png`.
- `main-p3b.png` ↔ `kandidat-p3b.png` mit `paar-p3b-mitte-800.png`: der 34-m-Baum (−157,8, −1020,2). Die Blick-Wahl der Werkbank setzte
  die Kamera auf (−163, 33,7, −1039,7); das Paar ist eine Kontrolle mit 0 Karten über dem Gesetz auf beiden Seiten.
- Zensus je Pose: `*-zensus.json`, Speicher `*-speicher-p3*.json`, Läufe `paar.log`, `nach.log`, `heap.log`.

## Ehrlich offen

- Zeit gibt es nur von der Radeon und nur unter Last (f 1,2–1,7). Die GTX 1060 ist ungemessen.
- Der Kern-Term vOcc in `lodCrossfadeMask` lebt weiter (Kern, kein Byte bewegt). Die Welt reicht ihm nur noch VOLL der Brücke.
- Im Labor (worlds/terrain/phytogenesis.js) lebt das Kronen-Gitter `_occG` weiter. Das gehört zum Studio und lag nicht in diesem Scope.
- Gates, die die Dateien treffen (Radeon, unter dem GPU-Schloss):
  - gate:stand-takt GRÜN. Ihr Treue-Täter ist jetzt die still gestellte Brücke.
  - gate:foundry-crossfade GRÜN.
  - gate:fernwald GRÜN (1159 Bäume als Karte).
  - gate:ankunft war im ersten Lauf ROT: „TypeError: Cannot create property 'offen' on boolean 'false'“. Täter war
    scripts/diag-ankunft.cjs:982, das `_archStufeUrteil` noch mit dem gefallenen Schalter rief, ein Leser, der in der Leser-Liste des
    Entscheids fehlte. Geheilt in 7743db46, danach GRÜN.
- Der Zweig steht auf 7743db46 (WIP, `[skip ci]`). Die volle CI und die Abgabe sind nicht gelaufen; die Abgabe prägt der Koordinator.

Geschnitten: Kronen-Gitter, Marsch, `OCCLUSION.occDist` 30 m, Schalter `useOcclusionDemotion` und Urteil `_occluded` (stamm/siedlung-bauten.js:74–134, :504–531, :3374–3392 auf main), Linse gate:altlasten (main ROT mit 20 Tätern beim Namen).
Gemessen: P3 ohne Gitter −2,18 ± 3,36 Punkte GPU-Zeit, Karten über ihrem Gesetz im Blick 3 → 0, Pop-Median 0,0672 → 0,0537 %, VRAM nicht über main.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
