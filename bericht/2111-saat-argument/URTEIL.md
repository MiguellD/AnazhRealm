# saat-argument — derselbe Ort an Saat A, an Saat B, wieder an A (OMEN, GTX 1060)

Zweig `saat-argument`, Kopf e01547976. Bilder und Zahlen stammen vom Baum f67f02219; der Spiel-Code ist derselbe, danach kamen nur
Linse, Register und Vertrag. Werkbank `--echt` 1920 × 1080 ·
Mess-Wiese −280,4 / −1045,6 · EINE Sitzung · Saat A `anazh-realm-seed`, Saat B `saat-b-2111`.

Treiber in `p3/n2111/saat-arg/` der OMEN:
- `wechsel.cjs`: Bilder, Kosten, Heap, Klang
- `leck.cjs` / `leck2.cjs`: VRAM je Erzeuger
- `puffer-probe2–4.cjs`: Heap-Ruhe und Halter

## Die Bilder (identische Kamera, aus A gesetzt)

| Bild | Kamera |
|---|---|
| `1-saat-A-oben.jpg` · `2-saat-B-oben.jpg` · `3-saat-A-wieder-oben.jpg` | 40 m hinter, 60 m über dem Grund von A, Blick 160 m voraus |
| `4-saat-A-auge.jpg` · `5-saat-B-auge.jpg` · `6-saat-A-wieder-auge.jpg` | 1,7 m über dem Grund von A, Blick 120 m voraus |

Die Kamera steht in allen drei Welten an derselben Stelle (Höhe aus A). Der Grund von B liegt dort 7,0 m tiefer (20,6 m statt 27,6 m),
also steht das Auge in B 8,7 m über dem Boden — mitten in einer Eichenkrone (Bild 5).

| Vergleich (Pixel mit Δ > 8 · mittleres Δ) | ganz | Grund (untere 70 %) |
|---|---|---|
| oben A ↔ A′ | 9,49 % · 2,52 | **0,49 % · 0,31** |
| oben A ↔ B | 81,86 % · 41,43 | **93,82 % · 50,47** |
| Auge A ↔ A′ | 21,98 % · 5,63 | 8,07 % · 1,80 |
| Auge A ↔ B | 98,88 % · 70,96 | 99,17 % · 73,20 |

- Zwischen den Schüssen zieht der Himmel: die Wolken laufen an der Wetter-Uhr weiter.
- Der Rest auf Augenhöhe sind die Halme im Wind, 1,7 m vor der Linse.
- Am Abdruck gilt A′ = A: gleiche Höhe 27,612 m, gleicher Fels `fels_var0` (256), gleiche Klang-Saat.

## Die Zahlen

**Kosten je Wechsel**
- Erste Geburt von B: 5,03 s. Erster Rückweg nach A: 3,82 s.
- Reihe von 20 Wechseln A ↔ B: Median 0,69 s (0,55–5,00 s). Teuer ist allein der erste Besuch einer schon geborenen B.

**VRAM**
- Gefunden: `tex:wolken-karte` (r8 512², 0,34 MB mit Mips) wuchs um 3,33 MB über 10 Wechsel (`leck.cjs`).
- Ursache: Die Karte fehlte in `WELT_GRENZE.seite`. Jede Welt legte eine neue an, und die bleibenden Stoffe (`_wolkenSchatten`)
  lasen still die alte — deren Mitte und `aktiv` liefen nicht mehr mit.
- Geschnitten: Die Wolken-Karte reist mit der Seite. Danach bleibt es 1 Karte über 16 Wechsel, und der VRAM pendelt über
  20 Wechsel zwischen 88,1 und 89,3 MB (A/B je ±1 MB): **er kehrt zurück**.
- Linse: `gate:weltgrenze`, Weg saat. Ohne den Schnitt nennt sie die gefallene Karte in allen 4 Wechseln.

**Heap nach erzwungenem GC**
- Nach dem Boot 254,5 MB, nach zwei Wechseln 450,6 MB.
- Über 20 Wechsel steigt er von 398,1 auf 440,6 MB, also **+2,24 MB je Wechsel** (zweite Hälfte +2,28).
- Nach 12 schnellen Wechseln und 15 / 30 / 60 s Ruhe steht er bei 241,7 / 241,7 / 241,8 MB. **Er kehrt nicht zurück.**
- `/puffer` selbst hält nichts: 10 Rufe ohne Wechsel bleiben bei 242,9 MB.
- Der Halter: fast der ganze Wuchs liegt in Typed Arrays unter `r.state.renderer._nodes` (dem Knoten-Speicher von three).
  Über 12 Wechsel wuchs er um +25,3 MB (Typed Arrays 33,9 → 59,2 MB, Heap +27,7 MB).
- Tiefer gelesen (`puffer-probe4.cjs`):
  - `renderer._nodes.nodeBuilderCache[].updateNodes[]` +20,4 MB
  - `renderer._nodes.nodeBuilderCache[].bindings[]` +4,9 MB

  Die Knoten-Bauzustände der alten Welt behalten ihre Typed Arrays über den Wechsel. Ein Bauzustand fällt in three erst, wenn
  sein letztes Render-Objekt gelöscht ist (`usedTimes` 0), und am Abschied der Welt geschieht das nicht.
- Offen: nicht in diesem Kopf geschnitten. Der Schnitt gehört an den Abschied der Welt (`_weltAbschied`): das Render-Objekt der
  alten Welt geht ganz.

**Klang-Saat** (Ruf- und Harmonie-Strom)
- Vorher (×31-Hash, klang.js bis 44446d65): A 1993327950 / 2361581414, B 1307205618 / 2722878218.
- Nachher (`samenHash`, der EINE Leser): A 1609570371 / 977166281, B 3284041583 / 4215790173.
- Die Ströme tragen die Saat ihrer Welt (`_klangStrom("umwelt").saat`: A → B → A).

## Mein Urteil

**Der Wechsel trägt.**
- A′ ist A am Abdruck und im Bild: 0,49 % am Grund von oben, es zieht nur der Himmel.
- B ist eine andere Welt, nicht dieselbe in neuer Farbe:
  - A: sanfte Hügel mit Schneekamm, dichter Mischwald um die Lichtung.
  - B: eine weite Flussebene mit mäandernden Bächen, Geröllfeldern und lichterem Wald.

  Die Saat erzeugt dort die Landschaft selbst.

**Offen und ehrlich**
- Der Heap wächst je Wechsel um +2,2 MB im Knoten-Speicher des Renderers (`nodeBuilderCache`). Das ist benannt, aber nicht geschnitten.
- Ein Art-Director sähe zuerst drei Dinge:
  - Die nahen Kronen zerfließen zu weichen Klecksen.
  - In B stehen die Laubkarten auf Augenhöhe als flache Aufkleber, mit gestreckten Schlieren, wo eine Karte hochkant steht.
  - Die fernen Nadelwald-Inseln in B schweben als dunkle Kegel-Silhouetten ohne Bodenschluss.

  Das ist nicht der Gegenstand dieser Welle, aber es ist das Bild.
