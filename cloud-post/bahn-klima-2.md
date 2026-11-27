# bahn-klima-2: karte2.planet.kopplung.bahn-klima#2 (GTX 1050, 27.11.)

## 27.11. 02:08 — GPU-PROBE c4dcd25c auf gtx1050-desktop: GRÜN in 711 s (bild:wiese@0.5 GRÜN 106 s auf gtx1050-desktop · gate:webgl-probe GRÜN 112 s auf gtx1050-desktop) → probe-post/bahn-klima-2/c4dcd25c.md

ZWISCHENSTAND. Vorprüf-Kopf `c4dcd25c8d` auf `origin/bahn-klima-2`, EIN Commit auf main 38194f83.

- Er fasst nur `planet-core.js` an (+10/−2 Zeilen).
- `npm run check:statik` EXIT 0 (32 min an der GTX 1050).
- probe-tag: `planet-core.js` trifft keine Regel von PROBE_PFLICHT, das Tag trägt 1 Probe (`bild:wiese@0.5`).

## Die Zahl

Die Station lief an der GTX 1050, vorher am main 38194f83, nachher am Kopf, beide Läufe ohne Last daneben.

**bahn-klima#2**

| Wert | Soll | vorher | nachher |
|---|---|---|---|
| amp0Prozent | ≤ 10 % | 0 % ✓ | 0 % ✓ |
| amp45Faktor | ≥ 2 | 1,884 ✗ | **2,121 ✓** |
| schneelinieVersatzM | > 0 | 156,167 m ✓ | 164,728 m ✓ |
| Urteil | | ROT | **GRÜN** |

- Beide Läufe maßen „vor dem Wurf der Leiter nach 30 s“: der Fächer der GTX 1050 ist im Deckel nicht ganz durch.
- Die Station in Node nachgebaut, über den ganzen Fächer (`spanne.cjs`, 21 Saaten × 15/45/75° an der Länge des Erd-Ankers): 1,947 → **2,166**. Die 1,947 trifft die Akte der GTX 1060 am 45bad33f wörtlich.
- Je Adresse lag der Faktor bei 1,212 … 2,908 und liegt jetzt bei 1,383 … 3,375.

**bahn-klima#1 und #3 am Kopf**

- #3 GRÜN: rLaskar 0,978 gegen ≥ 0,7.
- #1 ROT: „Sommer − Winter 93.269 m (Soll ≥ 100)“. Am main ist die Zeile an der GTX 1050 wörtlich gleich: winter Bild 68.393 m, sommer Bild 161.662 m.
- Das Spiel trägt die Erde, die Bit für Bit gleich ist. #1 rot ist also ein Befund des Geräts, kein Befund des Schnitts.

## Die Wurzel

Die Einstrahlung ist an jeder Breite genau linear in sin ε. Es gilt Q(φ, δ) − Q(φ, −δ) = π·sin φ·sin δ, auch jenseits der Polarkreise.

- Die Geometrie trägt daher an jeder Adresse sin 45° ÷ sin 23,44° = 1,778.
- Das Gesetz `amp = (5 + 28·cL)·(sin β ÷ 0,39782)·|sin φ|·fJ` ist linear in sin β.
- Nur die Schnee-Dämpfung in cL hob den Faktor auf 1,947.

**Was fehlte: die Wirbel.**

- Die Spanne des Lands ist die Antwort der P1-Mode auf den Gang, Q₁/(B + 2D) (North & Coakley 1979).
- Das D tragen die Wirbel der Mittelbreiten, und die nährt das Gefälle des Jahrs (Green 1970, Stone 1972).
- Bei 45° Neigung ist das Gefälle flach: T2 liegt bei −12,04 K gegen −27,71 K an der Erde. Die Wirbel sind schwach, und der Gang des Lands wird weniger abgeführt.
- Bis hier rechnete die Spanne mit dem D der Erde an jedem Körper.

## Der Schnitt

Ein Faktor fD an der Land-Antwort (`28·cL·fD`), auch im Präzessions-Term `ampP`:

```
fD = (B + 2·D0) ÷ (B + 2·D0·|T2 ÷ T2_Erde|)
```

- T2 ist das Gefälle des Jahres-Gleichgewichts (`planetKlimaGlobal`). Die Kopplung hat keinen Schalter und keinen Faktor an der Neigung: sie liest das Gefälle, das die Neigung macht.
- Die Neigung 90° kehrt das Gefälle um. Weil fD |T2| liest, trägt sie wieder ein starkes D, wie im Band.

**Band.** Ferreira u. a. 2014 (Icarus 243, gekoppelter Wasserplanet):

- D ≈ 0,7–0,8 W/m²K bei 23° und 90° Neigung, 0,15 bei 54°.
- Ihr Satz: die Wärme-Effizienz D „varies by almost an order of magnitude across climates“.
- D ∝ |T2| trägt hier ×0,43 bei 45° (D 0,22). Das liegt im Gang des Bands (×0,2 bei 54°).
- Die Zeile steht im Kern an `planetKlimaR`.

## Die Erde

**Heute (t = 0) Bit für Bit gleich.** Am Körper der Erde ist T2 = T2_Erde, also x/x = 1 genau.

- 216 Gitterpunkte (planetKlima Sommer · Winter · Jahr), der Anker und die 11 Messorte (planetOrt-Delta) sind byte-gleich.
- Die Station-Nachbildung zeigt an allen 63 Erd-Adressen dieselbe Spanne, ampErde 11,9279 ↔ 11,9279.

**Die Vergangenheit.** Gemessen bei −0,021, −0,115, −0,4 und −1 Ma:

- Jahresmittel und Meeresspiegel sind byte-gleich. S3 liest Meer und Laskar-Insolation, seine Werte bleiben.
- Die Spanne der Jahreszeiten folgt dem Gefälle der Zeit. Im Glazial (−21 ka) ist das Gefälle steiler, also schwingt das Land enger: am Anker 1,06 K, im Gitter höchstens 2,05 K.
- Das ist dieselbe Physik in die andere Richtung.

## Widerlegt (gemessen am gepoolten Maß, Kopie des Kerns)

| Variante | amp45Faktor | Urteil |
|---|---|---|
| A: Dämpfung an der eigenen Schneelinie | 1,756 | Die Erde schwingt mehr, die 45°-Welt nicht. |
| C: Meer unter Winter-Eis (−12 °C) wie Küstenland | 1,569 | Die Pole der Erde frieren, die der 45°-Welt nicht. |
| F: Eis unter −1,8 °C | 1,894–1,904 | unter 2 |
| G: Dämpfung am eigenen Jahresmittel | 2,104 | Die 2 an der falschen Erde: der 75°-Kontinent fiele von 36,1 auf 17,0 K. Real schwingen Chatanga 46 K und Werchojansk 64 K. |
| H2: D ∝ T2 auch im Jahres-Gleichgewicht | 2,102 | Das Glazial der Erde stiege von −5,73 auf −4,80 K und fiele aus dem Band −6,1 K (Tierney 2020). |

**These des Koordinators: Albedo im Winter.**

- Bei 45° Neigung ist die Einstrahlung zur Winter-Sonnwende an 45° und 75° Breite gleich 0 (Polarnacht).
- Eine Winter-Albedo kühlt dort nichts. Sie kühlt die Winter der Erde und senkt den Faktor.

## Offen beim Namen

- **Zwei D im Kern.** Das Jahres-Gleichgewicht (`klimaStrahlung`) hält sein D geeicht (0,50). Erst eine neue Eichung des Glazials (`EIS_BAHN.glazialWm2`) trägt D(T2) auch dort. H2 hat den Preis gemessen.
- **Das Bild.** Der Beleg der Station fehlt vorher wie nachher: „ABNAHME ROT [Vordergrund 30.0 % näher als 8 m“ am Ort `wiese` (75 Stationen fragen diesen Ort).
  - Das Spiel fragt keinen fremden Körper (Zeile `ungemessen` der Station). Ein Bild der 45°-Welt im Spiel gibt es daher nicht.
  - Einen Posen-Kandidaten habe ich nicht gebaut.
- **Karte 2 gebucht:** unverändert, bis der Richter (OMEN) den Kopf misst.

## Bildpaar

`bahn-klima-2/spanne-bildpaar.png` zeigt die Jahres-Spanne (Sommer − Winter) über den Globus. Ich habe es angesehen.

- **Zeilen:** oben die Erde, unten die Neigung 45°. **Spalten:** links main, rechts der Kopf.
- **Skala:** 0 K dunkelblau, 40 K grün, 70 K gelb, 100 K orange, 130 K weiß.
- **Erde:** links und rechts identisch (Flächenmittel 12,57 K).
- **45°-Welt:** die Kontinente der hohen Breiten schwingen stärker, die Meere bleiben. Flächenmittel 23,15 → 26,39 K, Maximum 115 → 137 K.

**Satz des Laien:** Auf der Erde ändert sich nichts. Auf einer Welt mit 45° Achsneigung werden die Sommer der Kontinente heißer und die Winter kälter, weil die schwachen Winde der Mittelbreiten die Wärme nicht mehr ausgleichen.

## krieg#1 als zweite Stimme (GTX 1050, main 38194f83)

**OFFEN, zweimal: kein Urteil.**

- Lauf 1 (01:03, check:statik lief daneben) und Lauf 2 (01:36, ohne Last) fielen gleich.
- Die Zeile, wörtlich: „SITZUNG Ort stadt-voll vor karte2.mensch.macht.krieg#1 steht nicht — die Tür trägt nicht: /reload: {"ms":61169,"fehler":"Navigation timeout of 60000 ms exceeded" …“, dann „/umstellen ohne Antwort binnen 300 s — die Welt starb am Ort (vor karte2.mensch.macht.krieg#1), kein Urteil, UNGEMESSEN“.
- Die Welt stand vorher nach 17,1 s am Start.
