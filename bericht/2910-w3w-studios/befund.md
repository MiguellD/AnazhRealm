# w3w-studios — Befund studios.K1 · studios.K4 (29.10.)

## K1 — die Regler urteilen am Bild (Zweig `w3w-studios`, gemessen headless)

- `gate:regler-wirkt` urteilt jede Mesh-Zeile am BILD des gebauten Werks (`bauBild`, scripts/lib/asset-worker-harness.cjs): Raster
  aus der Vorschau-Pose der Welt (Gier 0,6 und Gegenblick, Neigung 0,32) im Rahmen des Grund-Baus, Albedo je Dreieck unter EINEM
  Licht, belichtet nach BELICHTUNG der Welt (Karte 0,18 → Luma 169) durch Khronos PBR Neutral; wirksam ab 1 % der Gestalt-Pixel mit
  ΔLuma > 18. Selbsttest: Würfel 0,1 mm → 0,01 % (tot), 3 cm → 4,30 % (wirkt). Der Ofen (koerper, kreatur) gießt in Knochen-Lage
  und hasht über den EINEN `bauAbdruck` (sein eigener FNV-Hasher fiel). Tor · Wagen · Klang wirken zusätzlich an ihrem Leser der Welt.
- Zahl: **112/118 = 94,9 %** (Teil 1 91/97 · Teil 2 11/11 · Teil 3 10/10), davon 17 an ihrem Leser (Membran · Ritt · Ohr; porta
  realm wirkt über die Membran-Palette). Vorher am Hash 118/118 — der Hash zählte sechs Zeilen, die das Bild nicht bewegen.
- Tot am Bild (reglerTot, beim Namen): fachwerk ausstattung/bank/leiter `verwitterung` (≤ 0,90 %: Erdsaum nur unter 0,25 m,
  Sonnenbleiche × 1,05), porta `weather` (0,98 %: nur ein Stein-Versatz ± 1 cm), koerper `mass` (0,65 %: die Haut folgt fatScale
  1 → 1,7 nicht, Rahmen ≤ 7 mm) und `hairVol` (0,61 %). Die Baum-Zeilen fehlen in PARAMS_BY_KIND (die Regler-Zeilen sprengten an
  ihren Rändern das Stufen-Budget, staffel 0) — Staffel 2 bleibt offen.

## K4 — Studio = Welt im Bild (Zweig `w3w-studios-koord`, GPU-Probe)

- Gemessen ist am Kopf nichts. Die Probe `skripte/k4-bild.cjs` misst je Mesh-Studio dasselbe Werk (die Bühne nennt es über ihren
  Knopf „In der Welt ansehen", die Welt nimmt es über `_studioUebergabeEmpfang` und setzt es mit `spawnArchitecture`) bei der
  Vorschau-Pose der Welt (`_workshopRahmen`, fov 45) aus dem Ausgabe-Pfad beider Seiten, dazu die Albedo-Tafel beider Seiten.
  Unerprobt in der Cloud (keine GPU- oder swiftshader-Bildläufe) — der erste Lauf auf der Karte ist ihr Richter.
- Die Wurzel des Bruchs, beim Namen: sechs Bühnen zeichnen mit eigener r128-WebGL und ACES (`worlds/fachwerk/fachwerk.js:566`,
  `worlds/schmiede/schmiede.js:11`, `worlds/portale/porta.js:143`, `worlds/tetrapoda/tetrapoda.js:236`,
  `worlds/koerperstudio/koerperstudio.js:78`, `worlds/terrain/phytogenesis.js:531`), jede mit eigenem Key/Rim/Fill; die Garage
  rendert r184 (`worlds/garage/garage.js:16`), aber unter eigenem Licht und eigener Umgebung. Das Licht-Gesetz der Welt
  (`stamm/bild-himmel.js` `_dayNightApplyBelichtung`, BELICHTUNG zielKarte 0,44) und ihr Stoff-Bauer (`stamm/studio-gestalt.js:60`
  `_foundryBuildMesh` → `_foundryTreeMaterial`, transitiv 41 Methoden · 1 678 Zeilen) leben nur im Stamm, den H6
  (`scripts/diag-studio-huelle.cjs`) aus der isolierten Studio-Seite hält. Selbst die Vorschau der Welt-Werkstatt zeichnet unter
  einem eigenen Licht (`stamm/werkstatt-vorschau.js:209–217`: Umgebung 0,55, Key 0,85, Fill 0,35).
- Der Schnitt: Licht-Gesetz und Stoff-Bauer aus dem Stamm in EINEN geteilten Baustein, den Welt und Bühne laden (Lehre 2), die
  Bühne der Hülle als `buehne(kind)` auf ihm — die Studio-Renderer fallen. Nicht in dieser Welle: ohne Bild auf der Karte wäre
  jede Umstellung blind.

GPU-PROBEN: studios.K4#1, studios.K4#2
