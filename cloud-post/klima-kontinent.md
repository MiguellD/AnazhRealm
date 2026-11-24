# klima-kontinent — Abgabe (ZWISCHENSTAND)

Zweig `klima-kontinent`, geschnitten von origin/wetter-am-ort (3a87a8f), auf dem Stand von main (Merge 5b0f551a, V18.546.389).
Karte 2 gebucht 77 von 1 718. Diese Abgabe bucht keine Sprosse: gebucht wird erst, wenn der Richter im Zweig `punkte-maschine` sie grün misst.

## Der Schnitt

Das Klima des Planeten ist EIN Gesetz in planet-core `planetKlimaR` (planet-core.js:2201). Jeder Leser liest es: das Δ des Orts
(`planetOrt`), der Faden (voxel-worker.js:1522), das Ort-Gesetz (gelaende-core.js:5991) und das Wetter am Ort (phyto-core `wetterAt`,
phyto-core.js:4787). Es gibt keine Tafel je Ort und keinen Zwilling. Fehlt dem Δ `nebelQuote`, wirft `wetterAt` beim Namen (phyto-core.js:4802).

| Stück | Datei:Zeile | Quelle (Band) |
|---|---|---|
| Sperre und Föhn: Feuchte fällt über das Hindernis mit e^(−Δh/2,5 km), im Lee steigt sie wieder | planet-core.js:2085, :2196 | Smith & Evans 2007 (Süd-Anden, drying ratio ≈ 0,5) |
| Wirbel der Sturmbahn trägt die Feuchte ins Innere (Anteil 0,5, 800 km) | planet-core.js:2102, :2271 | Peixoto & Oort 1992, Kap. 12 (Wirbel tragen rund die Hälfte des Dampf-Flusses) |
| Meeresluft längs des Winds, Winter +14 K / Sommer −2 K an der Westküste | planet-core.js:2097, :2295, :2325 | WMO-Normalwerte (Brest ↔ Wladiwostok, Portland ↔ Halifax: 5–7 K) |
| Monsun-Schub liest die Erwärmung des Lands | planet-core.js:2335 | — |
| Trockenzuschlag nur in warmer Zone (glatt 10…20 °C) | planet-core.js:2354 | — |
| Nebel: Küstenluft + Auftrieb + Feuchte, additiv | planet-core.js:2377–2378, :2835 | Seely & Henschel 1998 (Namib) |
| ks liest die Konvergenz jemals (Gebirge oder Grenze von heute) | planet-core.js:2813 | Dewey & Bird 1970 (Hochgebirge = Kollision oder Naht) |
| Eis-Zeit liest das Jahresmittel des Orts (−10 °C) statt der Breite | planet-core.js:2742, :2837 | North 1975 (Eis-Linie) |
| Gasse als Kanal des Winds: v = κ(d·e)e + (1−κ)d, κ aus H/W | fachwerk-core.js:11785, :11821, :11900; stamm/stoff-material.js:379, :396 | Oke 1988 (H/W 0,3 / 0,7); Soulhac, Perkins & Salizzoni 2008 (SIRANE, u ∝ cos θ) |

## Die Sprossen (vorher → nachher, gleiche Bedingungen)

Die Station wurde nachgerechnet am Export, ohne Browser, auf demselben Weg wie der Faden (planet-ort → Δ → `wetterAt`): 32 Saaten
für land-meer-luft, 12 und 32 Saaten für gegenwart.

| Sprosse | vorher | nachher | Soll | Stand |
|---|---|---|---|---|
| `planet.kopplung.land-meer-luft#3` nebelFaktor | 1 | 4,464 | ≥ 2 | erreicht |
| `land-meer-luft#3` anteil (Zeuge: Wüste) | 0 % | 77,1 % (Wüste 53,6 %) | ≥ 70 % (Wüste ≥ 50 %) | erreicht |
| `land-meer-luft#4` dT | 0,785 K | 5,05 K | ≥ 5 K | erreicht |
| `land-meer-luft#1` luvLee | 1,195 | 1,258 | ≥ 2 | offen |
| `land-meer-luft#5` leeProzent | −1,3 % | −9,5 % | ≤ −50 % | offen |
| `land-meer-luft#2` rang | 0,137 | 0,211 | ≥ 0,7 | offen |
| `planet.kopplung.gegenwart#2` gipfelProzent | 46,3 % (Land 25 %) | 98,6 % (Land 67,8 %), 32 Saaten 98,2 % | ≥ 95 %, Gipfel > Land | Wert erreicht, Zeuge offen |
| `gegenwart#1` ursacheProzent | Findling ← `ort.eis` (Breite ≥ 74,4°) | Findling ← `ort.eis` (Jahresmittel des Orts < −10 °C) | 100 % an ≥ 1 000 Relikten | Zeuge offen |
| `planet.kopplung.stadtklima#1` abweichungGrad | 61,9° (Station) · 45,0° (Stadt, Node) | Stadt 18,3° (131 Häuser, 48 Richtungen) | ≤ 20° | Stadt erreicht, Dorf offen |

## Byte-Beweis und Kosten

- Klima: 110 Orte ohne Meer und Relief in der Nähe (8 Saaten × 16 384; meerLuft 0, kont ≥ 1 500 km, relief 1). 63 sind bitgleich,
  47 weichen nur um den Trockenzuschlag ab (max 2,586 K), ΔP 0.
- ks: absolut bitgleich an 260 von 260 Land-Orten ohne Gebirge. Das übrige Δ ist an 2 000 von 2 000 Land-Orten bitgleich.
  Δks verschiebt sich überall um −0,066, weil der Anker auf 27 m Naht-Ausläufer steht (st 0,0055).
- Eis: 446 von 2 000 Land-Orten tragen es (vorher 120). Die Heimat trägt 0 (Jahresmittel des Ankers 6,4 °C).
- Gasse: 200 m neben der Gasse ist der Wind bitgleich (gate:kopplung F7).
- Kosten: `planetKlimaR` am Land 26,42 → 31,15 µs (+4,73, Deckel +12); `planetPunktR` 4,79 → 4,35 µs; `planetOrt` 698 → 669 µs.
  Die Kosten fallen je Ort-Wechsel an, nie je Bild.
- Anker: ohne Ort bei 512 Proben 0,47 % → 0,08 % der Saaten (diag-planet.cjs, Tafeln neu gedruckt).
  Der Kern heißt planet-h2-13, das Relief steht (VERSION_SHA 5c937970 = Tafel).

## Die Linsen (Selbsttest mit gepflanztem Täter, je ROT genau an seiner Klinge)

`gate:wetter-wache` (L) LAND-MEER-LUFT am echten Kern, 6 Saaten, in `npm run check`, 17,5 s:

| Klinge | am Kern | gepflanzter Täter | Täter-Wert |
|---|---|---|---|
| KAMM | 5,471 (26) | ohne Sperre und Föhn | 1,265 |
| NEBEL | 90 % (38) | ohne Auftrieb | 50 % |
| SPANNE | 5,657 K (31) | ohne Winter der Meeresluft | 2,781 K |
| GIPFEL | 98,4 % (182) | ks nur an der Grenze von heute | 36,3 % |
| EIS | 100 % an 281 kalten Land-Orten | das Eis nur nach der Breite | 0 % |

Jede Klinge nennt ihr Gesetz (`planetKlimaR`, `ortRoh ks`, `ortEisZeit`).

`gate:kopplung` F7 GASSE: synthetische Schlucht mit Wind 45°. Abweichung 0,00°, Faktor 0,707, 200 m daneben bitgleich. Der Mutant
(Siedlung ungelesen) liegt bei 45,0°.

`gate:worker-dichte` K7 SIEDLUNG: Die Linse stand heute auf 79,07° N 0,56° O, einem Ort im Dauer-Frost. Seit der Küste im
ablandigen Wind ihr kontinentaler Sommer gehört, liegt der Sommer dort am Meer bei +0,18 °C statt −2,92 °C (Alert und Eureka auf
80–82° N haben +3…+6 °C). Kein Land dieser Saat trägt noch einen Sommer ≤ −3 °C (0 von 5 756 Land-Orten). Das Gesetz baut dort heute
am Wasser (bau 0,546), und die Linse beschuldigte den Leser („liest `siedlung.bau` nicht") für 15 Dörfer, die das Gesetz trägt. Die
Linse reist jetzt an denselben Ort vor dem modernen Menschen (−1 Ma, `ORT_SIEDLUNG.mensch`: bau 0, wald 0). Vor jedem Urteil über
einen Leser prüft sie ihre Prämisse an der Tafel, die der Wirt liest. Ein Ort mit bau > 0 fällt ROT an „Prämisse“ und beschuldigt
keinen Leser (Selbsttest: bau 0,546 mit 15 Dörfern).

Die Richter: `diag-planet` welle1 13/13 GRÜN, `--selftest` 63 GRÜN, `--anker` und `--bytes` GRÜN, `diag-phyto-tree` Findling GRÜN.

## Ehrlich offen (Sprosse · Grund · Messname)

- **land-meer-luft#1 luvLee 1,258.** 55 % der Kämme der Station sind Plateau-Buckel mit < 300 m Abfall auf einer Seite. Das
  Sperr-Band gibt dort e^(−0,3/2,5) ≈ 11 % weniger Regen, gemessen Verhältnis ~1,1. Kämme mit ≥ 800 m Abfall auf beiden Seiten
  geben 2,92, die Kämme der Linse 5,47. Ein Kamm im 3°-Takt (333 km) löst die Kette nicht auf. Messname `luvLee`.
- **land-meer-luft#5 leeProzent −9,5 %.** Die höchsten Kämme (5–7,5 km) haben gesättigte Lees: nass liegt am Boden ≈ 0,025.
  200 m Hebung geben nach dem Sperr-Band −8 %, gemessen −9,5 %. −50 % verlangte ein Lee ohne Boden. Messname `leeProzent`.
- **land-meer-luft#2 rang 0,211.** Den Regen ordnen die Breiten-Gürtel. Der Prädiktor der Station liest die Breite nicht. Messname `rang`.
- **gegenwart#2 Zeuge.** Der Wert steht (98,6 %), aber die Station schafft im Budget 12 statt 100 Saaten.
  Am Export ergeben 32 Saaten 98,2 %. Messname `gipfelProzent`, Zeuge `saaten`.
- **gegenwart#1 Zeuge.** Die Station verlangt 1 000 Relikte an höchstens 1 000 Punkten um eine Heimat, die nach der Regel des Ankers
  nie unter Eis liegt (6,4 °C). Kein wahres Gesetz füllt das. Dazu trägt die Geschichte des Klimas kein Glazial: die Eisgrenze liegt
  über 0 … −2,6 Ma bei 74,36° → 74,37°, `planetKlimaGlobal` hat keinen Antrieb des Quartärs. Messname `ursacheProzent`, Zeuge `relikte`.
- **stadtklima#1 im Dorf.** Ein Dorf aus Einzelhäusern bildet keine Schlucht (Oke: H/W < 0,3, isolierte Rauheit).
  Über 48 Richtungen: Dorf 26,8° (Saat 4291161376) und 37,6° (Saat 77). Die Station misst den geladenen Ort, ein Dorf mit einer
  Windrichtung, und liest ≤ 20° erst an einer Stadt. Dazu liest der Shader von Gras und Krone `uWindDir`, nicht die Gasse. Messname `abweichungGrad`.
- **bau2 (diag-planet --bau2).** regenschatten 35 → 38 % und gegenlauf 65 → 61 %, beide weiter ROT. Grün sind wueste,
  kuestenseite 0,24, eis 8,7 % und widerspruch (Köppen A 13,3 · B 32,0 · C 9,4 · D 27,7 · E 17,3).

## Für den Richter (Zweig punkte-maschine)

Die Station meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js:365 im Zweig `punkte-maschine` baut das Δ für `wetterAt` als
`{ regenQuote, sturmQuote }`. Es muss das Δ ganz reichen (mit `nebelQuote`, dazu der Schlüssel in :363). Sonst wirft `wetterAt` beim
Namen, gewollt und ohne stillen Rückfall.
