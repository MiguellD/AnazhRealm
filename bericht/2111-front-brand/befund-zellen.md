# front-brand — BRAND-ZELLEN am Brand-Schritt (Zwischenstand 21.11., 21:50, GTX 1050)

## Geschnitten (stamm/feld-brand.js, f488cb126)

- `_brandStoff`: das Gefälle des Betts (gx, gz) liest die EINE 2D-Höhe `_terrainMacroSurfaceY` — auf jeder Seite dieselbe Zahl.
  Vorher marschierte jede Zündung für Höhe und Gefälle dreimal durch ihre Säule (`_voxelSurfaceY`, je Marsch 17 Dichte-Proben +
  17 `_mitEdits` = 57 Einheiten). Die Höhe y des Betts bleibt die der Säule (Höhle, Edit). Keine Zahl → `_bruchMelden` BRAND-GEFÄLLE.
- `_brandMalen`: der Wiesen-Neubau fällt nur über dem Rechteck der Viertel, deren Asche-Texel sich änderten (`b.wieseNeu`), nicht
  über der ganzen Zelle ±½ (vorher 100 `_nahStreuKachelFaellt` + 36 Wiesen-Kacheln je Neubau).
- Linse: Selbsttest-Zeile „zwei Zündungen lesen ihre Säule je dreimal (8e2d76d1)" — die Zahlen des Täters (1 099 bei 16) ROT.

## Gemessen (gate:stand-takt, `amSoll` der Zeile „Sim-Wecken brand")

| Stand | Schritt | Einheiten | Zellen | Soll | Anteil |
| --- | --- | --- | --- | --- | --- |
| 8e2d76d1 (CI-Probe 44943679460 + 2 Läufe GTX 1050; OMEN main 1e204f83: 1 105) | 11 | 1 099 | 16 | 1 024 | 107 % ROT |
| f488cb126, ruhiger Lauf | 11 | 895 | 16 | 1 024 | 87 % grün |
| f488cb126, zwei Läufe parallel unter Last | 88 · 50 | 7 033 · 3 674 | 35 + 2 Masken · 27 + 1 Maske | — | 67 % · 63 % grün |

`--narbe` grün (Exit 0), Selbsttest grün, stamm:lint 0, Atlas 0. Leser nachher am Schritt 11: `_gelaende` 110,
`_nahStreuKachelFaellt` 60, `_erdbauLage` 50, `_bodenFlaeche` 36, `_fieldDensityAt` 34, `_mitEdits` 34.

Die Prämisse „liest je Bild neu" trägt nicht: `_brandStoff` läuft EINMAL je Zündung und hält sein Ergebnis an der Zelle
(`_brandBett`). Der Schritt 11 sind ZWEI Zündungen in einem Takt; die Kosten sind die der Zündung.

## Anatomie EINER Zündung (vorher ≈ 450 Einheiten, nachher ≈ 340)

- Säulen-Märsche `_voxelSurfaceY`: 3 × 57 → 1 × 57.
- fünf Bett-Punkte `bettGrob` × `_kontaktStoffAt` ≈ 48 je Punkt = 240; davon ≈ 35 je Punkt die Kette von `_bodenSichtAt`
  (die Stufen-Naht K51 seit pop-treue: `_voxelChunkConfig` · `_erdbauLage` · `_genVersion` · `_bodenFlaeche` je Punkt neu).
- ein Punkt ohne Gras: + zwei Märsche in `_terrainMaterialAt` (einer selbst, einer über `_feuchteAt` ohne surfY).
- Aura, Nässe, Feuchte, Tempo ≈ 40.

## Offen, ehrlich

- **Ziel ≤ 512 nicht erreicht (895).** saat-argument trägt + 231 (`_saat` 126, `_saatMerk` 105): 895 + 231 = 1 126 > 1 024 —
  ihre Landung bleibt an diesem Schritt rot, bis der nächste Handgriff fällt.
- **BERICHTIGT 22:00 — kein Chokepoint je Bett-Punkt.** Der zuerst genannte Handgriff („`_bodenSichtAt` hält die Stufen-Naht je
  Chunk, ≈ 35 von 48 Einheiten je Punkt") war falsch zugeordnet. Gelesen an Quelle und Leser-Liste (Tiefen-Lauf, 69 Bett-Punkte
  in einem Schritt): je Bett-Punkt ≈ 58 Einheiten über ~30 Leser — Stufen-Lesung ≈ 15 (`_voxelChunkConfig` 5, `_bodenFlaeche` 4,
  `_bodenStufeMisch` + `_stufeGewichtAuge` + `_stufeGewicht` 5, `_bodenSichtAt` 1; je Chunk haltbar nur `_voxelChunkConfig`, der
  Geomorph wiegt je PUNKT), Lage-Leser `_genVersion` + `_erdbauLage` + `_gelaende` ≈ 15, die Köpfe der Stoff-Kette (Auflage,
  Blocker, Lava, Eis, Streu, Decke, Belag) ≈ 12, Grün-Gesetz + Hydro ≈ 12, `_stoff` 3. Die Naht je Chunk trüge ≈ 40 von 895 —
  ein Ameisenschritt, NICHT geschnitten. Die Masse ist die Breite des EINEN Stoff-Lesers `_kontaktStoffAt` × 10 Punkte (zwei
  Zündungen); das Ziel 512 fällt an diesem Schritt mit keinem sauberen Schnitt in feld-brand oder `_bodenSichtAt`.
- **Was saat-argument öffnet:** bei der Basis 895 bleiben 129 Einheiten bis zum Soll; ihr + 231 (`_saat` 126 + `_saatMerk` 105
  bei zwei Zündungen) ist der nähere Hebel.
- **Der lebende Mutant** steht als N9 in `--narbe` (front-brand-wip 8b63ff7d0): SÄULE — `_voxelSurfaceY` unter `_brandStoff` = 1
  Marsch (Mutante im Stand 8e2d76d1: 3), WIESE — der Neubau nach der Zündung < Zelle ±½. Selbsttest grün; der Live-Lauf stand
  beim Schreiben aus (die GPU-Maschine trug die CI).
- Das Bildpaar `paar-vor-nach.jpg` ist der Stand 8e2d76d1; nach dem Gefälle-Schnitt nicht neu geschossen (Richter im Zug:
  gate:post-kette und gate:pruefbuehne-licht der GPU-Probe).

## reaktion v2 — Arbeitsstand, UNGEMESSEN (nicht landen)

Die zweite Hälfte der Karte („Rauchmenge sichtbar proportional") als gerichtetes Wort `rauch_prop_abw_pct ≤ 10`: drei Herde
(1 · 3 · 9 Zellen, nur sie fangen), je Herd die optische Fläche der geborenen Ballen (τ·A) je kg Holz, das die Front im Fenster
verzehrte; größte Abweichung vom Mittel, die Folge nach Holz muss die nach Fläche sein, sonst kein Wert.

- `v2-arbeit/reaktion-seite2.js` — die Probe der Seite · `v2-arbeit/reaktion-lauf2.sh` — ihr Läufer (Werkbank, GPU-Schloss)
- `v2-arbeit/pm-patch2.cjs` — setzt sie in `stationen/k2-same.js` (Kopf punkte-maschine 43dddf46d), `node --check` grün
- `v2-arbeit/k2-same-reaktion-v2.UNGEMESSEN.patch` — das Diff. Der einzige Lauf an der GPU starb am Boot der Werkbank
  (Navigation timeout unter Parallel-Last) — KEINE Zahl der zweiten Hälfte steht.
