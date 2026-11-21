# front-brand — BRAND-ZELLEN am Brand-Schritt (Zwischenstand 21.11., 22:40, GTX 1050)

**Nachtrag 22:40:** CI am Abgabe-Kopf f1b0a2f30 — GPU-Probe 44948419103 GRÜN (omen-gtx1060, 22:03–22:08: post-kette, stand-takt,
pruefbuehne-licht), Code-Check 44948419092 16 von 18 Scherben grün, 15 und 16 liefen noch. Der lebende Mutant N9 ist live grün
(front-brand-wip 7ecef4e14), reaktion v2 ist gemessen (beide Hälften grün, EIN Lauf) — die Abschnitte unten sind nachgeführt.

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
- **Der lebende Mutant N9 in `--narbe` — LIVE GRÜN** (front-brand-wip 7ecef4e14; GTX 1050, zwei Läufe 22:28 und 22:33, gleiche
  Zahlen): SÄULE — die Zündung marschiert 1-mal durch ihre Säule (`_voxelSurfaceY` unter `_brandStoff`), die Mutante im Stand
  8e2d76d1 3-mal. WIESE — in den ersten zwölf Schritten des Brands 4 Neubauten zu je 36 Streu-Kacheln (ein Viertel mit Rand), die
  Mutante (ganze Zelle ±½) 3 Neubauten zu 75 · 53 · 53 (60,3 je Neubau). Der ERSTE Live-Lauf (22:23) fiel rot an der Linse
  selbst: sie zählte nur den Schritt der Zündung, der Neubau fällt aber erst mit der Asche (Deckel `BRAND.wieseS` 3 s) — 0 Kacheln
  echt wie Mutante. Gerichtet auf zwölf Schritte und das Maß „Kacheln je Neubau" (die Mutante brennt auf der Asche des ersten
  Laufs und baut seltener, die Summe trüge das mit). Landet als eigener kleiner Kopf nach dem Stempel an f1b0a2f30.
- Das Bildpaar `paar-vor-nach.jpg` ist der Stand 8e2d76d1; nach dem Gefälle-Schnitt nicht neu geschossen (Richter im Zug:
  gate:post-kette und gate:pruefbuehne-licht der GPU-Probe).

## reaktion v2 — GEMESSEN 22:30 (GTX 1050, Werkbank mit echtem Renderer, EIN Lauf mit drei Herden)

Die zweite Hälfte der Karte („Rauchmenge sichtbar proportional") als gerichtetes Wort `rauch_prop_abw_pct ≤ 10`: drei Herde
(1 · 3 · 9 Zellen, nur sie fangen), je Herd die optische Fläche der geborenen Ballen (τ·A) je kg Holz, das die Front im Fenster
verzehrte; größte Abweichung vom Mittel, die Folge nach Holz muss die nach Fläche sein, sonst kein Wert.

| Wort | Zahl | Soll |
| --- | --- | --- |
| `masse_abw_pct` (Holz 21,978 kg → Asche 1,22 + Rauch 20,929) | 0,776 (Lauf 22:25: 0,765) | ≤ 10 |
| `rauch_prop_abw_pct` (Folge nach Holz = Folge nach Fläche) | 4,49 | ≤ 10 |

| Herd | Ballen | Holz kg | optisch m² | m² je kg |
| --- | --- | --- | --- | --- |
| 1 Zelle | 42 | 0,072 | 5,206 | 72,8 |
| 3 Zellen | 85 | 0,236 | 18,761 | 79,4 |
| 9 Zellen | 85 | 0,548 | 41,897 | 76,4 |

- **Ablage:** `k2-same-reaktion-v2.patch` (Basis-Blob 6462512e = punkte-maschine 6b9f14702, `patch -p1 --dry-run` sauber,
  `node --check` grün), der Lauf `v2-arbeit/v2-lauf2.json`, die Probe `v2-arbeit/reaktion-seite2.js`, ihr Läufer
  `reaktion-lauf2.sh`, der Setzer `pm-patch2.cjs`. Der ungemessene Vorläufer `…UNGEMESSEN.patch` ist damit ersetzt und fällt.
- **Ehrlich offen:** (1) EIN Lauf der zweiten Hälfte; die Station selbst (`L.ev` im Geschirr der Punkte-Maschine) lief hier
  nicht — gemessen ist die Probe der Seite über die Werkbank, gebucht ist nichts. (2) Die Karte nennt für „sichtbar
  proportional" keine eigene Zahl; die ±10 % sind die des Satzes (seine erste Hälfte) — meine Lesart, zu bestätigen. (3) Das
  Maß liest die Ballen, die der Renderer zeichnet (τ·A je Ballen, gedeckelt bei `RAUCH_BILD.deckMax`), nicht die Pixel. (4) Bei
  3 und 9 Zellen stehen je 85 Ballen: die Fläche wächst dort über die Ballen selbst; jenseits von 9 Zellen ist ungemessen, ob
  der Deckel die Proportion bricht.
- **Der erste Versuch (22:25)** maß nur den Herd aus 1 Zelle: die Herde 2 und 3 fingen 0 Zellen, weil `_feldAkt` die Tat einreihte
  (`_feldFolgeSteht` — die Probe hatte die Welt-Uhr von Hand gestellt). Gerichtet wie in der Linse; ein Herd, der nicht fängt,
  steht jetzt beim Namen (`fehler` → `L.umfang(1, 0, …)`), ein fehlender Wert urteilt rot (Station Z. 89: nur eine endliche Zahl
  besteht).
