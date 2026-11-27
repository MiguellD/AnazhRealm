# arten-gattung — Stand-Blatt (ZWISCHENSTAND)

Sprosse: `karte2.leben.pflanzen.arten#1` · Zweig `arten-gattung` · Kopf 1 auf main 38194f83.

## Täter-Zahl (vor dem Schnitt)

- Blind-Urteil des Koordinators: 17/53 = 32,1 % gegen ≥ 80 %. Die Gestalt der Gattung fehlte im Gesetz:
  - Kiefer gab es nicht: phyto-core `FOREST_SPECIES.labToHost` las sie als `baum_fichte` (Kegel, H 25,3 m, freier Schaft 0,40).
  - Erle gab es nicht: sie lief als `baum_weide` (Trauerweide: H 6,8 m, Krone bis zum Boden, Kronenfuß −3,4 m, Schirm 7,1 m).
  - Tanne: Seitenast 26,2° unter der Waagrechten (`coniferDroop` 0,1425) — gelesen wie die Fichte.

## Geschnitten

- Gestalt-Gesetz je Gattung (phyto-core `FOREST_PACK.form`, `koniferenKegel(profil)`): Kegel für Fichte/Tanne/Mammut, Schirm
  (r = √(1 − (1 − k)²)) für die Kiefer; eine Konifere ohne Zeile bricht laut (KERN-PFLICHT). `schaftHub` liest `kronenForm.krone`.
- foundry-core: Presets `kiefer` (H 21,47 m Ertragstafel WIEDEMANN 1953; Rinde 0x5a4a40 → 0xc0663c, LWF Wissen 57, SDW) und `erle`
  (H 25 m MITSCHERLICH 1945; wipfelschäftig LWF 42; Krone 3,45 m). Tanne `coniferDroop` 0,5: Seitenast 3° über waagrecht (SDW).
- Pfad: phyto-core `FOREST_SPECIES` kiefer↔`baum_kiefer`, erle↔`baum_erle`; Stamm `STREU_NAMEN`/`ALT_DOPPEL`; Terrain-Labor
  `phytogenesis.js` (Lab-Wahl, Saum der Nässe, Verjüngung — der stille Ersatz-Pool fällt, wirft jetzt).
- L1-Anlauf (foundry-core `strandRings`): unter `fh` trägt die Baum-L1 jeden Ring — die Erle maß L1/L0 in Brusthöhe 1,120.
- Werk-Bühne (`worlds/huelle/huelle.js` `B.engine`): der Wirt ohne Ankunft trägt die Eingangs-Welt (`_weltMetaHeil`) —
  `diag-blick --werk` brach an main 38194f83 an jedem Werk („Die Saat der Welt fehlt“).

## Gemessen (vorher → nachher, Same 1, gleiche Pose)

| Gattung | vorher | nachher |
|---|---|---|
| Tanne | Seitenast 26,2° unter waagrecht | 2,8° — Quirle stehen waagrecht |
| Kiefer (war Fichte) | H 25,3 m, freier Schaft 0,40 H, Kegel | H 20,75 m, freier Schaft 0,644 H, flache Kronenspitze |
| Erle (war Weide) | H 6,8 m, Schirm 7,1 m, Krone bis zum Boden | H 24,2 m, freier Schaft 0,46 H, Schirm 3,2 m, r/H ≤ 0,133 |

- gate:pflanzen-nah GRÜN (37 Fälle): Krone Kiefer 2,90 m (Tafel 2,75), Erle 3,45 (3,45); Höhen-Zensus Kiefer 23,4–24,4 m
  H/D 83, Erle 24,2–25,8 m H/D 91; Stufen-Stamm Erle 1,120 → 1,052.
- L1-Dreiecke durch den Anlauf: +12 bis +248 je Baum (Birke s7 5 068 → 5 080, Mammut s7 6 400 → 6 648).
- gate:asset-contract GRÜN: 152 Goldens byte-gleich (neu gemünzt: Baum-L1, Tanne L0–L2, Kiefer und Erle neu, Daten-Kanäle).
  Bild-Tafel T3: nur die Zeilen von Kiefer, Erle und Tanne neu, die übrigen bleiben T2. Plattform-Ratsche: 43 → 49 Fälle,
  die Kipp-Zahlen halten (pow 2 · hypot 10 · sin 4 · cos 1).
- gate:daten-contract · gate:streu-wahrheit · diag-phyto-tree GRÜN · check:statik GANZ GRÜN · format:check GRÜN.
- Bildpaare (diag-blick --werk, L0, Mittag, links vorher, rechts nachher): `cloud-post/arten-gattung-bild/`
  (`tanne-`, `kiefer-`, `erle-vorher-nachher.png`; `alle-nah-vorher-nachher.png` ist die Nah-Ansicht von vorn).

## Offen

- Kiefer: im Bild ist die Krone eine gewölbte Kuppel, kein flacher Schirm. Die obere Rinde liest im Bild nicht rötlich:
  Schaft-Luma 31–53, r:g ≈ 1,1. Der Kronen-Anteil 0,35 ist UNGEPRÜFT.
- Buche, Mammut, Blume nicht geschnitten:
  - An der Wiesen-Pose steht keine Buche.
  - Die Blume hat in `_scatterSichtHoehe` die Sichthöhe 0, weil sie ein Foundry-Preset ohne Karte ist.
  - Messname `leben.pflanzen.arten#1`.
- Anlauf Tanne/Fichte L1 (1,15/1,06) wird nicht vom Gate gemessen (FUND).
- gate:foundry-impostor C5 („Wache der Reihen“) ROT unter swiftshader, byte-gleich wie an main 38194f83. Das kommt nicht von
  diesem Schnitt. Richter ist die GPU-Probe.
- Die Laub-L1 driftet an main gegen T2 bis 0,905, innerhalb der Bänder; die Tafel zieht sie nicht still nach.
- Gefolgt: biome#4 (`biome-planet`).

Karte 2 gebucht 136 von 1 718 · Status ZWISCHENSTAND
