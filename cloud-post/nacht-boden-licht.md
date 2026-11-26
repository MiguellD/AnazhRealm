# nacht-boden-licht — karte2.erleben.bild.nacht#1 (GTX 1050, 26.11.)

Zweig `nacht-boden-licht` auf main 45bad33f, Kopf 1b703cc0 (Vorprüfung 1, `[gpu-probe: gate:nacht-licht:echt, bild:dorf@0.95, gate:pruefbuehne-licht, gate:weltbild-frost:echt] [ci voll]`; check:statik GRÜN am Kopf). ZWISCHENSTAND: Karte 2 gebucht unverändert; die Sprosse bucht erst der Richter.

## Der EINE Ort

**Der Boden las das Licht der Quelle durch den Haken des Himmelskörpers.**

- r184s `ShadowNode.setup` legt `material.receivedShadowNode` auf JEDEN Schatten-Knoten, den ein Stoff liest. `PointShadowNode` erbt diesen Rumpf; das ist am Vendor gelesen, `three.webgpu.min.js`.
- Der Würfel der Laterne (`WurfSchatten` in `_lichtWurf`, stamm/bild-schatten.js) bekam damit die Zuwendung des Bodens zum aktiven Himmelskörper: `_zu = smoothstep(0, zuwendungSaum, N·uSunDir)`, stamm/stoff-material.js:2205–2211.
- Zur Uhr 0,95 steht die Sonne unter dem Horizont (uSunDir.y −0,253). `_zu` ist dort 0, also trug der Boden für die Wurf-Laterne den Faktor 0.
- Das Gras hat keinen Haken und lag daneben im vollen Licht.
- Um Mitternacht steht der Mond, und der Haken trägt 1. Darum sah keine Mitternachts-Linse den Fehler.

**Dieselbe Klasse im selben Schnitt:**

- die Sonnen-Sicht der Karte (`_sicht`, stamm/stoff-material.js:1786);
- die Sonne im Schlitz der Fuge (`stein.sonne`, stamm/studio-stoff.js:1320–1321).

Beide sind Gesetz des Himmelskörpers und lagen ebenso auf dem Würfel.

**Der Schnitt** sitzt am EINEN Knoten.

- `WurfSchatten.setup` baut r184s Rumpf ohne den Haken.
- Die Zuwendung zum Feuer trägt der Pool selbst: N·L je Platz in `_lichtPlatz`.
- Es gibt keinen zweiten Lichtweg und keinen Aufheller.
- gate:vendor-anker pinnt den Rumpf, dazu die fehlende eigene `setup` des PointShadowNode und seine Würfel-Tiefe: 3 neue Anker, 258 → 261.

## Gemessen (GTX 1050, Werkbank `--ort dorf`, `umstellen -718.5 -924.5`, Schuss des Koordinators `bild -718.5 44 -924.5 -721.5 42.3 -916.9 --uhr 0.95 --wahl 0`, 30 s nach dem Sprung)

| | vorher (45bad33f) | nachher (Schnitt) |
|---|---|---|
| Abnahme B | ROT · Luma 18,8 · schwarz 63,8 % | GRÜN · Luma 35,7 · schwarz 47,0 % |
| Abnahme A (beim Sprung) | ROT · schwarz 63,7 % | GRÜN · schwarz 46,7 % |
| Boden im Ring 2 m um die Wurf-Laterne (13 Punkte) | Luma 5,2 | 72,4 |
| Gras am selben Ring (3 Punkte) | 123,1 | 124,1 |
| Boden im Ring 1,5 m (15 Punkte) | 2,3 | 72,5 |
| Boden im Ring 2,5 m (10 Punkte) | 4,3 | 67,9 |
| Ring 2 m, nachher MIT gegen OHNE Wurf | — | 82,1 = 82,1 (der Wurf nimmt dem freien Boden nichts) |
| Kontrolle: die zweite Laterne ohne Wurf, Ring 2 m | 107,2 | 107,9 |
| ms je Bild (Median / p95) | 13,2 / 36,9 | 12,4 / 34,9 |

Der Boden bleibt dunkler als das Gras: 72 gegen 124 sRGB-Luma. Das ist Albedo und N·L zur Laterne in 3,6 m Höhe, nicht der Wurf; mit und ohne Wurf ist der Boden byte-gleich.

## Die Linse (Gebot 10)

**Wo sie sitzt.** In der Familie der Nacht-Linse: `nachtSicht` / `nachtUrteil` in scripts/lib/licht-linsen.cjs, Gate `gate:nacht-licht:echt`.

**Was sie misst.** „Der Wurf am freien Boden“ zur Uhr `wurfUhr` 0,95, wenn der Himmelskörper unter dem Horizont steht:

- derselbe Ring um die Quelle, die das Spiel wirft;
- der Median mit gegen ohne Wurf;
- Soll ≥ −0,5 EV.

**Das Urteil.** ROT nennt den Täter `_lichtWurf` (Haken des Stoffs auf dem Würfel, `ShadowNode.setup` → `receivedShadowNode`). Ungemessen ist ROT beim Namen.

- Selbsttest 10/10 mit der Mutante „Haken auf dem Würfel“ (−3,8 EV) und den Fällen „nur ungemessen“ und „ungemessen neben gemessen“.
- Am Gerät (GTX 1050, `licht --nacht stadt-voll:third,dorf:third --eigen`): VORHER (bild-schatten.js von 45bad33f) stadt-voll third **−2,64 EV ROT beim Täter `_lichtWurf`** (laterne_dorf 2,1 m, 21 Punkte, Himmelskörper y −0,253) → NACHHER **0 EV GRÜN**. Bodenfleck, Kelvin und Karte unverändert (11/12 · ±38 K).
- Dorf third: die Laterne, die das Spiel wirft, trägt ihren Ring hinter dem Auge (0 Punkte gesehen). Ungemessen je Ort färbt nichts, solange ein anderer Ort misst; misst keiner, ist der Lauf ROT beim Namen.

## Fenster und Glas — nicht dieselbe Wurzel

- **Das Fenster** glüht nur über die Emission seines Datums: `_leuchtTakt`, stamm/dirigent-kern.js:1609–1611, Glut = 8 cd/m² × Schaltplan ÷ EINHEIT_LX. Zur Uhr 0,95 trägt es 0,001, die Laterne 0,045.
  - Fenster stehen nicht in `_leuchtQuellen` (stamm/dirigent-kern.js:2152), also wirft und empfängt dort kein Würfel.
  - Seine Helligkeit ist Gesetz des Datums (`LICHT_GESETZ.fenster.cdM2`) und die Sprosse nacht#3 (fenster_abw), nicht dieser Schnitt.
- **Das Glas der Leuchte** liest seine Glut je Ecke (`_leuchtStoff`, stamm/stoff-material.js:2374–2392) und trägt keinen Schatten-Haken.

## Der Stations-Wortlaut — kein Kandidat

**Was die Station nimmt.** schatten.K5 / nacht#1 S1 nimmt die nächste Quelle aus `_leuchtQuellen` mit Datum (g3.js:1981–1986).

- Dort stehen nur Flammen: Laterne, Wandlaterne, Glut und Feuer, Brand. Kein Fenster und kein Ersatz-Licht.
- An der Gasse ist die nächste Flamme eine Laterne (Kern 0,023 m, 1 900 K).

**Warum der Wortlaut stimmt.** Die Laterne ist das Feuer des Gesetzes, und der Wurf des Spiels (`_lichtWurfTakt`) wirft für jede Flamme gleich. „Pfosten 2 m vom Feuer“ und die Messung stimmen überein.

**Offen beim Namen.** Die Station misst um Mitternacht unter dem Mond, wo der Haken 1 trug. Den Kontrast 2,36 : 1 (pm-nacht-front) erklärt dieser Schnitt also nicht. Er ist offen für den Richter am Kopf.

## Das Bildpaar (selbst angesehen)

`scratchpad/nacht/l1/B-rot.png` ↔ `scratchpad/nacht/l2/B.png` (GTX), dieselbe Pose 30 s nach dem Sprung.

- **Vorher:** Um die rechte Laterne liegt ein schwarzes Loch. Das Gras darin steht hell wie ausgeschnitten.
- **Nachher:** Der Boden liegt im Licht, und der Pfosten wirft seinen Fuß-Schatten.

Was ein Art Director noch Amateur nennt:

- Der Fuß-Schatten des Pfostens ist ein scharf gerandeter schwarzer Fleck statt eines weichen Kontakt-Schattens.
- Der Boden fällt zwischen den Laternen kaum ab: der Platz liest sich gleichmäßig orange geflutet.
