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

## Der Schnitt (EINE Quelle)

- **Gesetz:** die Mundart eines Orts ist eine Funktion von Welt-Saat und SENKE seines Einzugsgebiets: `mundartVon(saat, x, z)`
  (fachwerk-core) auf gelaende-core `talWeg` (Kette `unter`). Je Baum-Ebene t = 1..5 setzt der nächste Herd im Maßstab σ·2^(5−t)
  das Bit (σ = 5 km, Burridge 2017 PRX 7 031008: 5–15 km). Der Fächer: jedes Wort liest seinen Punkt um 0,3·Maßstab versetzt
  (Wang 1969, der Rheinische Fächer). `spracheVon(region, mundart)` hat keinen Samen-Weg mehr. Ohne Ort spricht ein Plan die Ursprache
  seiner Familie, und eine Mundart ohne Form wirft.
- **Leser:** der Wirt `_mundartAm` → die Zelle `_zellEingang` → DORF `mundart` → der Export → `_bewohnerLauf` (Name, Rede) und
  ORTSNAME. Die Welt-Probe ergibt 12/12 Zellen GLEICH (anazh-realm-seed, Schritt 24).
- **Linse:** gate:settlement R13 „die Mundart folgt dem Tal“ (KL ≤ 0,2 · Isoglossen ≥ 0,7 · U_eff ≥ 1000). Täter: „die Sprache liest
  den Raum nicht“ (σ 5, Fächer 0 = EIN Blatt je Ort wie main) → ROT KL 0,319 U_eff 192; „die Mundart kennt keinen Fächer“ → ROT
  KL 0,216 U_eff 180. main 52937c92 → ROT „mundartVon fehlt“.

## Gemessen vorher → nachher (node, 48×48 Orte auf 1,6 km)

| Saat | KL-p95 | Isoglossen auf Barrieren | Basis | U_eff |
|---|---|---|---|---|
| main 52937c92 | bis 0,95 | — (jede Kante ≈ 0,97 Grenze) | — | 2 (Akte) |
| welt-1 | 0,094 | 1,000 | 0,395 | 1 097 |
| welt-2 | 0,107 | 1,000 | 0,402 | 1 233 |
| anazh | 0,094 | 1,000 | 0,412 | 1 190 |
| 7 | 0,097 | 1,000 | 0,416 | 1 167 |

Station-Kandidat: `cloud-post/sprache-dialekt-station/` (gegen punkte-maschine d14d0aa2). `liste` am Kopf f757fb6a meldet genau 2 ROT,
gelaende.K2#1/#2 (Wand HAKEN).

## Vertrags-Akt

Golden `spec/asset-contract/v6/golden/siedlung.json` neu geprägt: ein Plan ohne Ort spricht die Ursprache. Der byte-Diff des Exports
gegen main betrifft nur `name` und `mundart` (null): Lausi → Lusi, Dindwirt → Kolenwert; die Slots sind gleich. gate:settlement
Teil O reicht die Mundart der Zelle aus den Kernen (`talWeg` → `mundartVon`, wie `ortKlima`); „Plan-Hash Studio = Welt“ steht.

## Gates lokal (probeUrteil je Log)

gate:settlement Selbsttest GRÜN (beide R13-Täter → ROT beim Namen) · Lauf GRÜN · check:statik Exit 0 · format:check · lint Exit 0.
`probe-tag` nicht fahrbar: `artifacts/profiband/werkzeug/zug.sh` liegt in keinem Zweig; den Ruf halte ich von Hand gegen
`spec/ci/ci-zeiten.json` (fachwerk-contract 122 s · gelaende-studio 42 s · klang-zensus 437 s).

## Form des Kopfs

Der Vorprüf-Kopf trägt den glatten Baum auf main 7e73426e (erster Elter, `git diff 7e73426e <kopf>` = genau 12 Dateien). Der zweite
Elter ist die Spitze meiner WIP-Kette 457526ae, weil der Auftrag „nie force“ sagt: der Schub ist ein Fast-Forward, kein Stand wird
überschrieben. Wer einen Elter braucht, nimmt den Baum (`git commit-tree <kopf>^{tree} -p 7e73426e`), er ist byte-gleich.

## Offen (mit Adresse)

- Messort stadt-voll, Station nicht gefahren: GPU (der Vor-Richter fährt nur an der GTX 1060).
- Die Kacheln der Stadt des Worts und die Wort-Pläne sprechen die Ursprache, weil ihr Ort erst nach dem Plan feststeht
  (fachwerk `spracheVon(region, null)`). Die Seite MUNDART misst das Gitter der Welt.
