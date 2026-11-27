# Stand-Blatt sprache-dialekt (Sprosse `karte2.mensch.kultur.sprache#4`) — dritte Sitzung, Start 27.11. 11:52 UTC

Basis: main 52937c92 (V18.546.451). Status: ZWISCHENSTAND. Karte 2 gebucht 149 von 1 718.

## Die rote Zeile gilt am heutigen main

Akte (Zweig `punkte-maschine`) `vision/richter/mensch.kultur.sprache.4.52937c92-radeon.json`, Radeon 890M, 27.11. 11:43 — wörtlich:
„S4 ROT: Umfang nicht erzeugbar: Sprachen mit Dialekt-Kontinuum: die Silben-Tafel einer Region kennt keinen Dialekt (gemessen 2 < 1000)“.

## Täter (Datei:Zeile)

- **Spiel:** `fachwerk-core.js:4917` `spracheVon(region, seed)` — das Blatt (die Sprache) eines Orts ist
  `floor(_sprachU("sprache|R|seed","blatt") · 32)`: ein Hash des Orts-Samens, KEIN Ort im Raum. Zwei Nachbar-Orte und zwei Orte am
  anderen Ende der Welt tragen mit derselben Wahrscheinlichkeit dieselbe Sprache (gemessen 0,0255 über 2 000 Paare; 1/32 = 0,031).
  Die Sprache ist eine Funktion von Region × Same, nie von Region × Ort: es gibt kein Kontinuum, also auch keine Isoglosse, die auf
  einer Barriere liegen könnte (jede Kante zwischen zwei Orten ist mit p ≈ 0,97 eine Sprachgrenze, Barriere oder nicht).
- **Station:** Zweig `punkte-maschine`, `meisterkarte-quelle/punkte/stationen/k2-mensch-kultur.js` Leiter `mensch.kultur.sprache`,
  Glied `{ n: 4, art: "nicht", wert: sprachen }` — `sprachen = z.regionen` (die Regionen der geladenen Stadt, gemessen 2). Die Sprosse
  hat keinen Leser für KL und Isoglossen; auch ein Gesetz in der Welt bliebe dort ROT. Ein Kandidat folgt unter
  `cloud-post/sprache-dialekt-station/` in DIESEM Zweig.

## Täter-Zahl (node, `fachwerk-core.js` am main 52937c92, Buchstaben-Verteilung der Swadesh-Liste je Blatt, KL mit Glättung 0,5)

| Familie | KL Schwestern (Nachbarn im Baum) | KL beliebiger Blätter | KL max |
|---|---|---|---|
| mitteleuropa | 0,054 | 0,127 | 0,484 |
| alpin | 0,041 | 0,088 | 0,338 |
| mediterran | 0,074 | 0,186 | 0,948 |
| nordisch | 0,052 | 0,095 | 0,491 |
| fernost | 0,065 | 0,123 | 0,597 |
| antik | 0,045 | 0,087 | 0,327 |

Der Baum TRÄGT die Nähe (Schwestern KL 0,04–0,07), aber der Raum liest sie nicht: Nachbar-Orte ziehen beliebige Blätter (KL bis 0,95).

## Plan des Schnitts (EINE Quelle)

`spracheVon` bekommt den Ort: das Blatt des Orts ist eine Funktion von Welt-Same, Region und Lage — die Spaltungen des Stammbaums
fallen im Raum auf die Barrieren der Welt (Wasser, Gebirge), Nachbarn teilen den Zweig. Kein zweiter Silben-Weg: ORTSNAME,
`_bewohnerLauf` (Name, Rede), Station lesen dasselbe `spracheVon`.
