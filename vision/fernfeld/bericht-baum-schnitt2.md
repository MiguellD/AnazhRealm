# Bericht Baum, Schnitt 2 — der Baum liest seine Zeile (ZWISCHENSTAND, Spike NEIN)

Stand 15.11.2026 01:49 (date). Baum `w28-baum-schirm` = origin/main 11d8de3d (Merge a53bb33f, kein Laufzeit-Byte darüber); Gerät
Radeon 890M, EINE Welt `werkbank start --echt` gegen den save-server dieses Baums, `r._schirm()` = 1920 × 1080 (pxJeM 703,7) in jedem
Fall; die Schwelle live gestellt (`LOD_DISTANCES.thresh12` × Faktor, thresh01 12 m bleibt; Lehre 20), je Fall `werkbank band --ort
wiese` (P2 Mess-Wiese, Ego, eingeschwungen, ungebaut 0). Rohdaten: `artifacts/profiband/auge/w28-baum-schirm/schnitt2/`
(spike.log, spike-band-x*.json; `spike-band-x1-nach-zaehlt-nicht.txt` zählt nicht: der Rücklauf auf × 1 brach an der Puffer-Lesung).

## Geschnitten

Nichts. Der Spike sagt nein, also bleibt `tree: je({})` (stamm/vegetation-streu.js:2892) stehen, ebenso der Ruf ohne Vorlage
(:1929–1930) und der Satz „DER BAUM trägt keine Zeile“ (:2873). Einen Teil-Bau gibt es nicht.

## Gemessen (Dreiecke der Klasse `baum` je Pass, Ratsche `spec/profiband/ratsche-wiese-radeon-ego.json` haupt 62 336 · k0 12 950 · k1 1 612, Toleranz + 5 000)

| thresh12 | haupt | k0 | k1 | Summe (Haushalt 150 000) | GPU je Bild (gelesen) | CPU je Bild (gelesen) |
|---|---|---|---|---|---|---|
| × 1 = 26 m (main) | 66 414 (in der Toleranz) | 6 142 | **17 038 (ROT schon auf main)** | 89 594 | 24,5 ms | 2,7 ms |
| × 1,5 = 39 m | **108 908 (1,75 × Ratsche)** | 6 556 | 38 882 | **154 346 > 150 000** | 26,7 ms | 2,3 ms |
| × 2,5 = 65 m | 285 738 (4,6 ×) | 6 556 | 99 292 | 391 586 | 29,4 ms | 2,4 ms |
| × 3,16 = 82 m | 405 046 (6,5 ×) | 6 556 | 133 496 | 545 098 | 71,0 ms | 14,3 ms |

- Die größten Posten bei × 1,5 sind die Nadel-L1: Tanne 53 056 (bei × 1 waren es 27 546), Fichte 51 288 (21 676), Streu-Fichte
  14 242 (7 212). Bei Eiche, Birke und Mammut steigt die Zahl kaum. Das Gesetz würde die Fichte bei × 2,66 legen (Zeile 0,0082).
  Die Tanne hat keine gemessene Zeile.
- Die Referenzfahrt stand vorher bei f 1,13–1,17. Danach lag sie bei f 1,66–1,74, die Zeit-Spalten sind deshalb „UNGEMESSEN unter
  Last“ und nur gelesen. Die Dreiecks-Zahl hängt nicht am Takt.
- Bei × 1,5 kam das Einschwingen schon nach 65 Takten zur Ruhe (ungebaut 0). Wenn dabei noch L1-Bauten fehlten, liegt die Zahl
  eher zu tief, das Nein bleibt.

**Urteil: Spike NEIN.** Schon bei × 1,5 reißt die Ratsche der Klasse `baum` im Hauptbild (108 908 > 67 336), und der Haushalt
(154 346 > 150 000) reißt mit.

## Bilder

Es gibt keine, denn ohne Schnitt gibt es kein Paar.

## Ehrlich offen

- Der Schnitt fällt OFFEN und benannt unter dem Messnamen lod.K5 „Kanten-Versatz Karte ↔ L0 je Vorlage“: 1,50–3,16 px am Haushalt
  26 m (Eiche 1,50 · Birke 1,58 · Karst 2,41 · Fichte 2,66 · Weide 3,16).
- Die Ratsche k1 der Klasse `baum` reißt schon auf main in der 1080-Welt: 17 038 gegen 1 612. Sie ist älter als die Laub-L1 mit
  der Krone der L0. Bewegt habe ich nichts.
- Ein Fund aus der Quelle, falls der Schnitt je wiederkommt: der Wind (stamm/stoff-instanz.js:265) und die Maske der L1 am Tausch zur
  Karte (`_lk` aus aH0, stamm/stoff-karte.js:202 → f1o) lesen dasselbe Feld aH0. „Nur |aH0L| und aKarte.w“ trägt die Stufen-Höhe der
  L1 deshalb nicht. Die L1 braucht drei Zahlen je Instanz: Stufe 1, Stufe 2 und die wahre Höhe. Heute hat sie zwei Felder.
- Ungemessen sind e₁, die GTX 1060 und P1.

Geschnitten: nichts — Spike NEIN, die Zeile des Baums bleibt leer, Messname lod.K5 „Kanten-Versatz Karte ↔ L0 je Vorlage“.
Gemessen: Dreiecke `baum` haupt 66 414 → 108 908 bei thresh12 × 1,5 (Ratsche 62 336 + 5 000), Summe 154 346 > Haushalt 150 000.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md).
Status: ZWISCHENSTAND
