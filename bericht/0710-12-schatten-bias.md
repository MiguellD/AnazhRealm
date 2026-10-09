# Bericht 0710-12: der Schatten-Bias ist das Gesetz der Kaskade — kleine Werfer werfen ihren Schatten

Auftrag: `auftrag/0710-12-omen-schatten-bias.md`. Kopf: **welle-m-schatten 36191f63** (Basis main 76c9624d, per `git ls-remote`).
CI: Lauf 37964999684 am Kopf 36191f63 — 5 von 5 grün (check, erst-zeichnung, playtest 1/3, 2/3, 3/3).

**Richtigstellung 09.10. (Nachtrag 0710-12, Gegenprüfung):** Die Nachher-Zahlen stammten nicht aus der Rohdatei des Kopfs.
Jede Zahl unten steht jetzt so in `bericht/0710-12/wand-nachher-kopf.txt` (nachher) bzw. `wand-vorher-main.txt` (vorher) und
`rand-sweep.txt` (Rand). Gefallen: die Rand-Zeile „1 / 1,5 (erster Bau)“ und „vorher 1“ beim Fern-Busch (in keiner Rohdatei).
Die Quell-Wand nennt auf main sechs Befunde, nicht fünf. Das Gate steht nicht in `npm run check`; die CI fährt den Selbsttest
(check.yml:297–303), das Bild-Urteil nur `--echt`. Neue Messungen und die Kopf-Fixes: `bericht/0710-12-nachtrag.md`.

## In drei Sätzen

Geschnitten: Der Schatten-Bias ist EIN Gesetz je Karte (`_schattenBias`) aus der Texel-Kante der Kaskade, 0,5 Texel
normal und 0,75 Texel Tiefe. Vorher galt 1 m normal und −0,25 / −0,5 m Tiefe für jede Kaskade. Die EINE Quelle
`atmosphere.shadowBias` ist jetzt der Hebel auf das Gesetz.

Gemessen auf der GTX 1060 mit der neuen Wand `gate:schatten-bias --echt`: Wolf, Fuchs, Busch und Zaun-Pfosten werfen jetzt.
Die Boden-IoU mit einem Texel Saum steigt seitlich von 0,00–0,07 auf 0,90–1,00 und mittags von 0,00–0,19 auf 0,97–0,99. Akne
bleibt auf allen neun Platten bei 0,00 % (die Gegenprobe zeigt 10,6 %). Die Schatten-Pässe kosten gleich viel.

Ehrlich offen:
- In der fernen Kaskade (k1, 130 m) liegen Wolf und Fuchs unter der Auflösung des Bildes, nur der Busch trägt dort ein Signal.
- In der Ego-Sicht wirft der Spieler gar keinen Schatten. `_applyEgoSicht` blendet die Haut aus, das ist eine eigene Klasse.

## Das Gesetz

```
normalBias = normalTexel (0,5) · Hebel (atmosphere.shadowBias, 1 = das Gesetz) · Texel
bias       = −tiefeTexel (0,75) · Texel / Tiefe der Box
```

- `Texel` ist die gröbere Kante der Karte (Box-Breite bzw. -Höhe durch die Kartengröße), `Tiefe` ist Fern- minus Nah-Ebene der
  Kaskaden-Kamera.
- Leser:
  - `_kaskadeFit`: je neue Box, statt `biasM`;
  - `_hauptSchattenBias`: das Haupt-Licht, also der Rückfall ohne Kaskaden und die Vorlage der Kaskaden-Lichter, bei Init,
    `setShadowBias` und `_applyEffectiveShadowRange`;
  - `setShadowBias`: stellt jede Kaskade sofort mit ihrer letzten Box.
- An der Wiese ergibt das k0 0,08 m normal und 0,12 m Tiefe, k1 0,20 m und 0,31 m. Vorher waren es 1 m und 0,25 / 0,5 m.
- `SCHATTEN_KASKADE.biasM` fällt.
- Jeder gespeicherte Stand trägt `shadowBias: 1` und ist damit das Gesetz. Der Regler heißt „Schatten-Bias ×“.

**Vendor-Quelle** (r184, gepinnt in gate:vendor-anker):
- ShadowNode verschiebt die Probe: `h = normalWorld.mul(normalBias)`, `p = shadowMatrix.mul(positionWorld.add(h))`. Das sind
  Welt-Meter.
- `setupShadowCoord` addiert `bias` auf die Tiefe der Schatten-Koordinate (`n.add(i)`).

**Kein Hang-Bias.** Der Auftrag fragte nach einem slope-skalierten Bias, „wo r184 ihn trägt“. r184 trägt ihn nicht verlässlich:
- Er existiert nur als polygonOffset des Override-Stoffs je Licht (`getShadowMaterial` → Pipeline `depthBias` /
  `depthBiasSlopeScale`).
- Der Pipeline-Schlüssel des WebGPU-Backends enthält polygonOffset nicht (`getRenderCacheKey`), und der Stoff-Schlüssel kennt Zahlen
  nur als 0 oder ≠ 0.
- Gemessen in der Werkbank: Bei der Geburt der Kaskaden auf 1,5 gesetzt, standen die Stoffe der beiden Kaskaden im Lauf wieder auf
  0. Ein Bias, der nach dem nächsten Neubau still fehlt, wäre der Bruch.
- Der Sweep zeigt außerdem, dass er nicht gebraucht wird (siehe Rand).

## Die Linse: gate:schatten-bias

`scripts/diag-schatten-bias.cjs`. In CI-Gruppe 1 läuft der Selbsttest samt Quell-Wand am Stamm (`npm run gate:schatten-bias`,
check.yml:297–303; nicht in `npm run check`). Am echten Renderer misst nur `--echt` am OMEN.

**(Q) Quell-Wand (AST):** `normalBias` und den Tiefen-Bias einer Schatten-Karte (`….shadow.bias` / `sh.bias`) schreibt nur das
Gesetz. Main fällt mit sechs Befunden rot (drei feste normalBias-Schreiber, zwei Tiefen-Nudges, kein Gesetz).

**(S) Der Schatten:**
- Je Werfer (Wolf, Fuchs, Busch, Zaun-Pfosten, Spieler) auf der ebenen Bühne der Mess-Wiese, bei Sonne seitlich (26°) und
  mittags.
- Erwartung: die Schatten-Dreiecke des Werfers (castShadow, gehäutet, je Instanz), entlang des Lichts auf den gezeichneten Boden
  projiziert.
- Messung: die Boden-Pixel, die er dunkler macht (MIT gegen LEER; was zwischen LEER und LEER2 sich ändert, zählt nicht).
- Urteil: IoU mit einem Saum von einem k0-Texel auf dem Schirm, ≥ 0,4. Der Bias versetzt jeden Schatten um seine eigene Größe:
  normalBias · cot(Sonnenhöhe) zum Werfer hin. Ohne Saum straft die IoU jeden Bias, auch einen richtigen; sie steht zusätzlich in
  der Tabelle.

Die Labor-Bedingungen, jede mit ihrem Grund:
- **Isolation:** Während einer Messung sieht jede Kaskaden-Kamera nur die Ebene 30, auf der allein der Werfer liegt. Die Bühne
  liegt am Waldrand, und bei 26° Sonne lag sie ganz im Baumschatten. So maß vorher wie nachher 0 px, ein Urteil über den Bias war
  nicht möglich.
- **Die Uhr steht:** Jeder Spiel-Takt rückte die Tageszeit vor. Zwischen LEER und LEER2 wanderte die Sonne von 27° auf 36°, und
  12 665 Pixel „strömten“.
- **Der Himmel folgt der Sonne sofort**, sonst baute er sich im ersten Werfer-Halt neu.
- **Die Schatten-Pipeline wird vorgewärmt.** Ein frisch gesetzter Körper zeichnet unter der Isolation erst bei der Aufnahme zum
  ersten Mal in den Schatten-Pass, und r184 überspringt den Zug, bis seine Pipeline steht.
- **Entfernen braucht Takte.** Der entfernte Fuchs stand sonst noch im LEER des Pfostens.
- **Der Busch steht auf der nahen Stufe:** Der unsichtbare Spieler steht nah dabei, die Stufen-Wahl geht von ihm aus.
- **Der Spieler wird in der 3rd-Sicht gemessen.**

**(A) Die Akne:**
- Je Sonne (11°, 26°, Mittag) drei Platten 8 × 8 m auf einem offenen Fleck: eben, im Streiflicht (10° gegen das Licht) und
  Dach 40°.
- Gemessen wird isoliert, nur die beleuchteten, sichtbaren Seiten, nur ruhende Pixel. Dunkler mit eigenem Wurf heißt Akne,
  Grenze ≤ 1 %.
- Warum 2 mm dick: r184 zeichnet bei FrontSide-Stoffen die RÜCKSEITEN in die Karte (`side = KS[side]`). Ein 0,4 m dicker Quader
  ist so nie aknefähig.
- Warum ein heller Stoff: Bei 11° Sonne trägt die Fläche nur N·L ≈ 0,2 direktes Licht. Auf dunklem Stein blieb selbst volle Akne
  unter der Schwelle.
- **ZÄHNE** (die Gegenprobe): 0,1 Texel normal ohne Tiefen-Bias muss Akne zeigen. Gemessen 10,6–11,4 % (alle Rohdateien), im Bild die typischen
  Streifen.

## Gemessen (GTX 1060, Mess-Wiese, 960×540, je ein Lauf vorher = main 76c9624d, nachher = Gesetz)

Boden-IoU mit Saum (in Klammern ohne Saum):

| Werfer | seitlich vorher | seitlich nachher | mittags vorher | mittags nachher |
|---|---|---|---|---|
| Wolf | 0,000 (0,00) | **0,981** (0,66) | 0,083 (0,01) | **0,974** (0,52) |
| Fuchs | 0,004 (0,00) | **0,988** (0,50) | 0,193 (0,03) | **0,983** (0,44) |
| Busch | 0,072 (0,06) | **0,897** (0,69) | 0,000 (0,00) | **0,980** (0,44) |
| Zaun-Pfosten | 0,000 (0,00) | **0,999** (0,69) | 0,005 (0,00) | **0,985** (0,55) |
| Spieler (3rd) | 0,513 (0,37) | **0,981** (0,82) | 0,989 (0,35) | **0,995** (0,68) |

Akne:
- Vorher und nachher je 0,00 % auf allen neun Platten.
- Zähne: vorher 10,90 %, nachher 10,62 %.
- Urteil: vorher ROT (acht Werfer-Befunde, dazu die Quell-Wand), nachher GRÜN.

**Der Rand** (Sweep, Live-Versuche des Bias über dieselbe Sonde, Akne bei 11° und 26°, Wolf/Fuchs/Pfosten seitlich):

| normal / Tiefe (Texel) | Akne | IoU mit Saum | IoU ohne Saum |
|---|---|---|---|
| **0,5 / 0,75 (das Gesetz)** | 0,00 % | 0,968–0,998 | 0,52–0,79 |
| 0,25 / 0,4 | 0,00 % | 0,99–1,00 | 0,58–0,70 |
| 0 / 1 | **4,88 % im Streiflicht 26°** (eben 11°: 0,16 %, Streiflicht 11°: 0,02 %) | 0,996–0,997 | 0,62–0,72 |
| 1 / 0 | 0,00 % | 0,90–0,99 | 0,32–0,66 |
| 0,1 / 0 (Zähne) | **10,8–11,4 %** | — | — |

Der Normal-Anteil trägt das Streiflicht, der Tiefen-Anteil allein nicht. Die Akne-Kante der idealen Fläche liegt zwischen 0,1/0
und 0,25/0,4. Das Gesetz hält doppelten Abstand zu ihr, für gekrümmten Boden, Laub-Karten und die gestufte Sonne.

**Zeit** (`zerlegen --nur schatten,k0,k1 --runden 6`, ABAB mit frischen Boots, 1080p, Wiese, ein Instrument):

| Boot | Schatten gesamt | k0 | k1 |
|---|---|---|---|
| 1A main | 0,09 ± 0,18 ms | 0,11 | −0,06 |
| 2B Gesetz | 0,09 ± 0,03 ms | 0,07 | −0,02 |
| 3A main | 0,17 ± 0,13 ms | 0,12 | −0,05 |
| 4B Gesetz | 0,10 ± 0,05 ms | 0,12 | 0,02 |

Gleich. Die Draws in k0 liegen bei 9,5 je Frame auf beiden Seiten.

**Fern (k1)**, der Werfer auf dem offenen Fleck, die Kamera 130 m senkrecht darüber, k1-Texel 0,25–0,27 m:
- Der Busch dunkelt in seitlicher Sonne nachher 29 der 50 erwarteten Pixel ab (31 Pixel außerhalb der Silhouette). Die Lupe zeigt
  nachher den Fleck neben der Silhouette. Vorher gibt es nur das Bild (`fern-busch-0.32-vorher.png`), die Fern-Probe lief im
  main-Lauf nicht — keine Zahl.
- Wolf und Fuchs erwarten dort nur 7–16 Pixel. Das liegt unter der Auflösung, ein Urteil ist da nicht möglich.

## Bilder (selbst angesehen; `bericht/0710-12/`)

Alle Bilder kommen aus dem Ausgabe-Pfad (`__ausgabeAufnahme`).
- `wolf|fuchs|busch-{0.32,0.5}-{vorher,nachher}.png`, isoliert: Vorher steht der Werfer ohne Schatten auf der besonnten Wiese,
  nachher fällt seine Form vom Fuß weg.
- `akne-zaehne-0.28.png`: die Gegenprobe mit den waagrechten Akne-Streifen.
- `akne-eben-0.28-gesetz.png`: dieselbe Platte unter dem Gesetz, sauber.
- `dach-echt-0.5.png`: das echte Fachwerkhaus auf Stufe 0 auf dem offenen Fleck, mittags, ohne Isolation. Auf dem Dach liegen die
  echten Schatten von Ast und Krone, keine Streifen auf Dach und Wänden.
- `dach-echt-0.28-stufe2.png`: dasselbe Haus bei 11° Sonne, aus dem Vorlauf mit Stufe 2. Mit dem Spieler am Fleck verdeckt
  dort ein Baum den Blick von der Sonnenseite.
- `hang-echt-0.28.png`: der echte Hang (24,8°) bei 11° Sonne, nur das Rausch-Muster des Boden-Stoffs, keine Streifen.
- `fern-busch-0.32-{vorher,nachher}.png`: die Lupe der fernen Kaskade.

## Wände

Exit UND Urteils-Zeile gelesen, alle grün:

| Wand | Urteil |
|---|---|
| check | `GRÜN arch-fachwerk-fit` (letztes Glied der Kette; der Selbsttest von gate:schatten-bias steht nicht darin) |
| lint | 0 Fehler, 3 Warnungen wie auf main |
| format:check | „All matched files use Prettier code style!“ |
| gate:vendor-anker | „steht — … 167 Anker“ (normalBias-Uniform, Probe in Welt-Metern, bias auf der Koordinate) |
| gate:schatten-bias | SELBSTTEST GRÜN (Quell-Wand am Stamm, fester Meter-Wert, leerer Schatten, vakuöse Probe, Akne, blinde Probe) |
| gate:schatten-werfer | GRÜN |
| gate:schatten-takt | GRÜN |
| gate:foundry-crossfade | GRÜN |
| playtest:fast | „Kern-Gesundheit OK“ |
| playtest (voll, 155 s) | „Alle Invarianten OK“ (darunter: setShadowBias propagiert auf die Kaskaden; normalBias > 0, bias < 0) |
| diag-schatten-bias --echt | GRÜN (`bericht/0710-12/wand-nachher-kopf.txt`; main: ROT, `wand-vorher-main.txt`) |

## Offen (mit Grund)

- **k1 für Tiere:** In 130 m Abstand sind Wolf und Fuchs 4–5 Pixel groß. Die Wand misst k0, wo der Bild-Bruch sichtbar war. Das
  Gesetz ist je Kaskade dasselbe (Texel · Faktor).
- **Der Spieler in der Ego-Sicht wirft keinen Schatten.** `_applyEgoSicht` setzt Kopf und Haut `visible = false`, r184 zeichnet
  Unsichtbares in keinem Pass. Das ist eine eigene Klasse (Sichtbarkeit, kein Bias). Ein Werfer nur für den Schatten wäre der
  Schnitt. Die Sonde misst den Spieler in der 3rd-Sicht.
- **Die Akne auf echtem Laub** (DoubleSide-Karten) steht nur im Bild, nicht in Zahlen.
