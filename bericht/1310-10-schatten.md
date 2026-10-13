# Bericht 1310-10 — das Himmelslicht im Baum-Schatten (Augen-Befund 15)

**Status: ZWISCHENSTAND.**

**Urteil:** Auf der OMEN (GTX 1060, main 785cca46) trägt die EINE Licht-Kette mittags im Schatten ihr Himmelslicht, im
Natur-Soll. Die Schatten saufen weder am Wiesen-Messort noch an der Ankunft ab.
- Das Himmelslicht im Schatten trägt ALLEIN die Umgebung (IBL aus `_ensureSkyEnvironment`, PMREM). Die Halbkugel steht auf 0,
  das Ambient auf 0,011.
- Fällt die IBL aus oder kommt sie spät, bleiben im Schatten 0,1 % der besonnten Beleuchtungsstärke, also Schwarz. Das ist der
  Name für den Radeon-Befund.
- Kein Schnitt: Auf der GTX ist kein Term zu schwach, und den Radeon-Ausfall kann ich hier nicht messen.

## Gemessen (OMEN, EINE Sitzung je Ort, Bühne Mittag · Sonne · Sommer)

**Licht-Bilanz** (`werkbank licht`, E auf der 18-%-Karte nach oben, Wiese; `wiese-licht.json`):

| Term | E oben | Anteil |
|---|---|---|
| Sonne (DirectionalLight 7,43) | 7,18 | 76 % |
| Umgebung (IBL, der Himmel) | 2,26 | **24 %** |
| Halbkugel (HemisphereLight 0) | 0 | 0 |
| Ambient (0,011) | 0,01 | 0,1 % |

Im Schatten bleibt auf flachem Boden die Umgebung: 2,26 / 9,45 = **24 % der besonnten Beleuchtungsstärke**, im Natur-Soll
(15–25 %). Die Zeile „alle“ der Linse misst 0 an allen drei Lagen — ein Fehler der Linse beim ersten Schuss; die einzelnen
Terme sind gültig.

**Bild aus dem Ausgabe-Pfad** (je Blick zwei Aufnahmen mit und zwei ohne Sonnenschatten, `shadow.intensity` 1/0 als
Live-Uniform; Maske = Boden-Pixel, die mit Schatten ≥ 1,6× dunkler sind; `schatten-quote.txt`):

| Blick | Schatten-Pixel | linear mit/ohne | Luma mit / ohne (sRGB) |
|---|---|---|---|
| Wiese Gier 0 | 1 958 | 0,47 | 78,5 / 115,6 |
| Wiese an der Birke (4,9 m) | 16 232 | 0,55 | 81,1 / 116,4 |
| Ankunft (36/0, Genesis-Ring) | 106 | 0,52 | 51,7 / 71,6 |

- Im Bild liegt der Quotient über den 24 % der Bilanz. Die Maske trägt auch Halbschatten (gesprenkeltes Laub), und der Boden
  bekommt Licht aus beiden Termen.
- Das Bild `wiese-birke-mit1.jpg` gegen `wiese-birke-ohne1.jpg` zeigt dunkelgrünen, gesprenkelten Schatten, nirgends Schwarz.

**Ankunft, Zeitlinie** (`ankunft-proben.json`, ab dem Start je 0,5 s, 93 Proben):
- `scene.environment` steht ab der ersten Probe (1,3 s), mit der Tag-Farbe des Himmels (Horizont + Zenit 0,80/1,17/1,56).
- Die Uhr steht auf 0,50–0,51 (Mittag), die Sonne auf 7,43. Auf der GTX fehlt das Himmelslicht an der Ankunft also nicht.

## Der Name

- Augen-Befund 15 (Radeon, „fast Schwarz“) passt genau zu einem Ausfall der EINEN Himmels-Quelle im Schatten. Ohne die IBL bleibt
  das Ambient von 0,011 (0,1 %).
- `_ensureSkyEnvironment` baut die IBL per `PMREMGenerator.fromEquirectangular`. Wirft das, bleibt `environment` null (ein
  ERROR im Log). Rechnet es auf der Radeon still falsch oder spät, sieht niemand ein Rot.
- Ein Lauf `werkbank licht` auf der Radeon entscheidet es. Liegt dort die Zeile „umgebung“ nahe 0, ist die IBL der Täter, und der
  Schnitt gehört in diese EINE Quelle (laut statt still, die Linse misst E_umgebung > 0).

## Pflicht-OFFEN Rest

- Der Radeon-Ausfall der IBL: benannt, nicht gemessen (keine Radeon an der OMEN).
- Die Linse `werkbank licht` misst die Zeile „alle“ als 0 (erster Schuss).

## Status ZWISCHENSTAND + Übergabe

- Kein Zweig, kein Code-Commit.
- Werkzeug `p3/k10`: `sitzung.sh` (Wiese), `ankunft.sh` (Zeitlinie + Bild), `schatten-quote.cjs`.
