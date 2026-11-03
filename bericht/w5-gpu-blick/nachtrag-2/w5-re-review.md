# w5 Re-Review an der GTX 1060 (OMEN, 03.11. 15:48–16:20): fernschatten 35414866 · kontakt 8ed70734 · licht-sprung b4bb2f62

Anker main 0e3eadad. Dieselbe Station (g3 NEUN wörtlich, punkte-maschine 6444b257, Ort dorf, Teil B 640 × 360), dieselben Posen und
Kosten wie im ersten Blick. Je Seite 2 Boots: ein Lauf `blick.cjs`, ein Lauf `nach.cjs kosten`. Adapter nvidia/pascal. Nichts gebucht.

| Zweig | Urteil | Kern |
|---|---|---|
| w5-fernschatten 35414866 | **Kosten GRÜN, licht.K4 ROT** | +0,4 ms an der Wiese (vorher +6,9). Mittags klar wie main. Das Muster zieht nicht: r 0,79 @ [0,0], und σ 0,026 liegt unter dem Soll von 0,03 |
| w5-kontakt 8ed70734 | **ROT (K3), Saum geheilt** | Der helle Saum am Fuß ist weg (1,063 → 1,00). Am Dorf-Ort gibt es weiter keine Verdeckung im Soll. K2 ist nicht mehr schlechter (4,85 %). Kosten +1,0 ms an der Wiese |
| w5-licht-sprung b4bb2f62 | **K4 GRÜN, K5 ROT** | K4 hat **23,2 %** Gewinn. Die Verdunkelung um 91 % ist geheilt (Licht 0,164 wie main). Der Pfosten wirft keinen Schatten (0,762 : 1). Mittags +0,3 ms |

## Zahlen der Station (main 0e3eadad → Zweig)

| Kriterium | main 0e3eadad | Zweig | Soll |
|---|---|---|---|
| licht.K4 σ / r @ Versch. (fernschatten) | 0,0019 / 0,9753 @ [0,0] | 0,0262 / **0,7917 @ [0,0]** | σ ≥ 0,03, r ≥ 0,6 mit Versch. ≠ 0 ✗ |
| ferne.K4 (fernschatten) | 0,4914 aus 3/7 | **0,2415** aus 3/7 | ≤ 0,4 ✓, ≥ 5/5 Orte ✗ (FUND der Station) |
| schatten.K3 Fuß band/frei (kontakt) | 1,000 / 1,000 | **0,9998 / 1,0176** | 0,4–0,7 ✗ |
| schatten.K3 Sockel band/frei (kontakt) | 1,000 / 1,000 | **0,9216 / 1,0464** | 0,4–0,7 ✗ |
| schatten.K2 max / Mittel (kontakt) | 4,63 % / 3,89 % | 4,85 % / 4,08 % | ≤ 0,5 % ✗ (wie main) |
| schatten.K4 Gewinn (licht-sprung) | 0,0 % (0,1626 / 0,1626) | **23,2 %** (LA 0,2095 / LB 0,170) | ≥ 10 % ✓ |
| schatten.K5 (licht-sprung) | 0,768 : 1, Licht 0,161 | **0,762 : 1**, Licht 0,164, ohne Pfosten 0,762 | ≥ 3 : 1 ✗ |

## Kosten an der GTX (gpu-bank 120 × 3 ms/Frame, Ego; 2 Boots je Seite)

| | Wiese | Δ | Dorf | Δ |
|---|---|---|---|---|
| main 0e3eadad | 16,03 · 16,30 | | 13,86 · 14,46 | |
| fernschatten 35414866 | 16,41 · 16,74 | **+0,4** | 14,24 · 14,81 | +0,4 |
| kontakt 8ed70734 | 17,01 · 17,23 | **+1,0** | 14,73 · 14,89 | +0,7 |
| licht-sprung b4bb2f62 | 16,36 · 16,63 | **+0,3** | 13,94 · 14,73 | +0,2 |

lauf Wiese fps: main 57,5 · 53,5, fernschatten 56,9 · 53,8, kontakt 53,9 · 51,3, licht-sprung 56,4 · 51,2. Der Pass `kontakt:verdeckung`
kostet 0,30–0,38 ms. k0/k1 sind bei licht-sprung wieder 0,62/0,22, wie main im selben Boot (k0 0,61).

## Das Auge

- **fernschatten** (`fernschatten-wiese-ego.jpg`): Mittag sunny ist so klar wie main, die Sonnenflecken unter den Kronen sind zurück. In
  `fernschatten-licht-K4-S.jpg` bleibt das Wolken-Muster S zwischen t und t+5 s an seinem Platz. Es zieht in 5 s nicht sichtbar mit,
  auch die Blöcke am fernen Rand behalten ihre Form. Die Welt-Karte 512² zu 16 m wandert also entweder langsamer als einen Block in 5 s, oder sie folgt der
  Bild-Uhr der Bühne nicht. Zu prüfen ist, ob ihr Versatz aus `_bildZeit` kommt oder aus dem Takt, der in der Aufnahme steht. ferne.K4: die
  Hänge unter dem Grat sind dunkel wie im ersten Lauf.
- **kontakt** (`kontakt-schatten-K3.jpg`, `kontakt-wiese-third.jpg`): Am Fuß ist kein Saum mehr. Eine Verdeckungskante an Haus und Körper ist
  im Bild aber nicht zu sehen; das Gras am Dorf-Ort deckt das Band von 2–18 cm (die Radeon zeigt dort 0,99/0,96: Linsen-Fund, nicht
  Zweig-Fund). Im Third an der Wiese ist das Gras nicht mehr so schwer abgedunkelt wie im ersten Lauf.
- **licht-sprung** (`licht-sprung-schatten-K4*.jpg`, `licht-sprung-schatten-K5.jpg`): Die Wand vor der besonnten Wiese ist sichtbar heller als
  vor der schwarzen Platte. K4 trägt. Am Glutbrunnen ist die Nacht wieder warm ausgeleuchtet wie main. Hinter dem Pfosten liegt aber kein
  Schatten: der Wurf erreicht diese Pose nicht (Kontrast = Kontrolle). Zu prüfen ist, ob die Würfel-Karte an der Quelle `glutbrunnen` überhaupt zeichnet
  (Wahl `_lichtWurfTakt` mit dem Pool der Probe) oder ob ihre Reichweite oder nahe Ebene den Pfosten in 2 m ausschließt.

## Belege

`p3/n0311/w5/aus/{0e3eadad,35414866,8ed70734,b4bb2f62}/` (neun.json, Kosten, bilder/) und `aus2/<sha8>-16xx/` (Kosten, 2. Boot).
Treiber `review2.sh`. Die Läufe liefen unter `p3/gpu-lauf.sh`; die Vorprüfung pausierte so lange (PAUSE).
