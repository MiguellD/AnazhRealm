# Stand-Blatt sprache-dialekt (Sprosse `karte2.mensch.kultur.sprache#4`) — dritte Sitzung, Start 27.11. 11:52 UTC

Basis: main 52937c92 (V18.546.451), Kopf 1 auf 7e73426e, Kopf 2 auf main 9a75d61c (V18.546.457). Status: ZWISCHENSTAND. Karte 2 gebucht 149 von 1 718.

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

Kopf 1 trug den glatten Baum auf main 7e73426e, Kopf 2 trägt ihn auf main 9a75d61c (erster Elter, `git diff 9a75d61c <kopf>` = genau 12
Dateien; gegen Kopf 1 kommt allein der Rang über `rang` und dieses Blatt hinzu). Der zweite Elter ist die Spitze meiner WIP-Kette, weil der Auftrag „nie force“ sagt: der Schub ist ein Fast-Forward, kein Stand wird
überschrieben. Wer einen Elter braucht, nimmt den Baum (`git commit-tree <kopf>^{tree} -p 9a75d61c`), er ist byte-gleich.

## Heap 740 MB und Einlauf 83 s am Vor-Richter (Post 21:27): was ich messen konnte, was offen bleibt

**Gemessen im Kern** (node, `--expose-gc`, Heap nach GC vor ↔ nach, Kopf = Stempel 2fa60e40):
- **Gesetz im Spiel:** `_mundartAm` je Zelle (talWeg → mundartVon) an 1 089 Zellen zu 256 m um den Ort (±4 km, mehr als der Nah-Ring
  260 m fragt) kostet 610 ms und **+0,2 MB** gehalten.
- **Seite MUNDART der Station:** das Gitter 48 × 48 auf 1,6 km (77 km, jede Kette bis zur Senke) kostet 1 026 ms und **+1,5 MB** gehalten.

`talWeg` merkt sich je Knoten am EINEN Netz der Lage (`netzFuer` → `N.talWege`). Die Kosten folgen den gefragten Orten, nicht der
Welt. Weder mein Gesetz noch das Gitter der Station trägt also im Kern 200 MB. Der Heap des Vor-Richters (740 MB gegen 505–540 MB)
kommt nicht aus `talWeg`.

**Nicht messbar in der Wolke:** die Welt an stadt-voll headless (Null-Renderer, `ortZug` stadt-voll, main b3740dd5 gegen Stempel). Der
GPU-Prozess stand in `gl.clientWaitSync` (#1264), nach 2 371 s gab es 0 Bewohner in 9 Siedlungen, Heap 85,9 MB. Das ist kein Bild der
Stadt und kein Vergleich. Offen mit Messname: **Preis stadt-voll am main nach der Landung, Heap und Einlauf, einmal OHNE die Seite
MUNDART** (an der GTX 1060).

Auch das Merkbuch der Sprachen ist gemessen. Die Seite MUNDART ruft `spracheVon` für 2 304 Orte × 6 Familien = 1 152 Sprachen
(`_MUNDARTEN` ≤ 4 096) in 216 ms, gehalten werden **+3,5 MB**. Zusammen trägt die Seite MUNDART im Kern ≈ 5 MB, das Spiel an den Zellen
0,2 MB. Die 200 MB über dem Band kommen aus keinem der beiden Glieder meines Schnitts. Sie sind offen bis zum Lauf oben. Steht der Heap
dort bei 505–540 MB, trägt sie die Sitzung der Station (die Seiten #2, #3 und #4 in EINER Sitzung). Steht er ≥ 700 MB, trägt sie die
Welt, und dann schneide ich als ersten Schnitt von Kopf 3 an der Zahl, die der Lauf nennt.

## Die nächste rote Sprosse: `karte2.mensch.kultur.sprache#5` „hörbare Sprachen“ (Täter-Zahl am main b3740dd5, Post 20:57)

Die Leiter (Zweig `punkte-maschine`, `meisterkarte-quelle/punkte/stationen/k2-mensch-kultur.js:764`): `{ n: 5, art: "auge", um: 7000 }`. Vorbild:
„Tonaufnahme einer realen, den Hörern unbekannten Sprache (Linguisten-Blindtest 2AFC ≤ 60 %); Satz ↔ Handlung ≥ 80 %“. Der Umfang liest
`sprachen` (die Regionen der Stadt, 2), genau wie #4 vor dem Kandidaten. Darüber liegen #6 (Stufen über Epochen) und #7 (Planeten).

**Täter 1, das Ohr hört nur Vokale:** `klang-core.js:1640` `stimmPuffer` macht aus jeder Silbe den ERSTEN Vokal ihres Kerns
(`STIMME.kern[K[i].charAt(0)]`). Die Quelle ist allein stimmhaft (Rosenberg-Puls, Klatt-Kaskade aus fünf Resonatoren). Es gibt keinen
Verschluss, kein Reibe-Rauschen und keinen Nasal. `fachwerk-core.js:5071` `sprachKerne` reicht nur die Vokal-Folgen weiter.
Gemessen über 3 000 Sätze in 6 Familien (`sprachSatz`, Ursprache):
- 59 307 Laute, davon 35 790 Konsonanten (0,603);
- im Ohr kommen davon 20 548 an (**0,346**), die Konsonanten **0**;
- 2 964 von 20 548 Zwielauten sind auf ihren ersten Vokal gekürzt.

Ein 2AFC-Blindtest gegen eine Tonaufnahme trennt eine Rede ohne Konsonanten mit Sicherheit (Soll ≤ 60 %).

**Täter 2, der Satz kennt seine Handlung nicht:** `stamm/siedlung-bewohner.js:403` `sprachSatz(…, \`${b.seed}:${tag}\`)`. Der Same ist
der Mensch und die Nummer der Rede, der Akt (`b.akt`) geht nie ein. Das Verb zieht `sprachSatz` aus 19 Verben des `SATZ_GESETZ` unabhängig
vom Tun. Satz ↔ Handlung liegt also beim Zufall (1/19 ≈ 0,05), das Soll ist ≥ 0,8.

**Täter 3, der Umfang:** die Station zählt Regionen (2 < 7 000). Mit #4 trägt die Welt Mundarten, gemessen U_eff 1 097–1 233 je Welt
auf 77 km. Die Zahl 7 000 verlangt den Leser der Mundarten über Welten (die Seite MUNDART des Kandidaten) und nicht den der Regionen.

Art „auge“: auch mit Gesetz bleibt die Sprosse bis zum Blindpaar am Gerät offen (Klasse P). Meine Bahn kann den Laut bauen (die
Konsonanten als Quelle aus Rauschen und Verschluss im EINEN `stimmPuffer`, Band: Klatt 1980, die Parallel-Zweige für Frikative) und den
Satz an den Akt binden. Das Urteil spricht das Ohr.

## Antwort auf 19:50 (Stand 2. Merge d. h. main 948f68ee herein, 730f25b4)

Die Stall-Akte steht an meinem Stand GRÜN („✅ eigene Ränge neben rang: Träger keiner statt FREMD keiner · gepflanzt 2/2 gefasst“,
`npm run gate:welt-boot` 82 s). `--teil=2/3` an meinem Kopf allein (auf main 948f68ee) trägt keine Probe mengebild, denn die lebt nur
im Zweig `werk-am-ort-2`, auch main 9a75d61c trägt sie nicht. Dort gefahren steht „Menschen im Bild“ ohne meinen Diff auf **127** und mit
meinem Diff auf **127**, Gehende 90 = 90. Teil 2/3 an meinem Stand: Täter 56/56, Grund 15/15 GRÜN (mahl jetzt grün). Teil 1/3: 54/54, Grund 9/9.
Teil 3/3: 48/48, Grund 12/12. gate:settlement: Selbsttest und Lauf GRÜN. Kopf 2 folgt auf main 9a75d61c, sobald check:statik steht.

## Post 27.11. 16:54 (buendel-abend 29015b4e, Lauf 46017245179) — abgearbeitet für Kopf 2

- **Stall-Akte** („eigene Ränge neben rang: Träger diag-settlement.cjs“): R13 las das p95 der KL von Hand
  (`kls[Math.floor(kls.length * 0.95)]`). Jetzt liest es das geteilte `rang` aus `scripts/lib/welt-boot.cjs` (`rang(kls, 0.95)`,
  `kls.sort(aufsteigend)`); die eigene Kopie fällt. Die Zahl ändert sich nicht, denn für q < 1 ist die Definition dieselbe. Lokal
  `npm run gate:welt-boot` GRÜN (79 s), die Zeile lautet „✅ eigene Ränge neben rang: Träger keiner statt FREMD keiner · gepflanzt 2/2 gefasst“.
  Über alle `scripts/**/*.cjs` gefahren, trägt außer welt-boot keine Datei das Muster.
- **mengebild ist nicht meins.** Die Probe gibt es nur im Zweig `werk-am-ort-2` (e0f43e13). Ich habe sie dort zweimal gefahren
  (`--proben mengebild`), unter gleichen Bedingungen:
  - werk-am-ort-2 allein: **Menschen im Bild 127**, Gehende 90, Bewohner 1 356 · GRÜN;
  - werk-am-ort-2 mit meinem Diff (7e73426e..a5d9417): **Menschen im Bild 127**, Gehende 90, Bewohner 1 356 · GRÜN, byte-gleich.

  Mein Stamm-Schnitt ändert nur den Namen und die Rede (`spracheVon(region, plan.mundart)`, gecacht), nie den Ort oder den Takt eines
  Menschen. Die 24 im Bild des Bündels kommen aus seiner Mischung, nicht aus sprache-dialekt.
- **Kreatur-Linse am Kopf (auf main bed6256c), GANZ:**
  - `--teil=1/3` GRÜN (54/54 Täter, Grund 9/9).
  - `--teil=3/3` GRÜN (48/48, Grund 12/12).
  - `--teil=2/3`: Täter 56/56, Grund 14/15. Das eine Rot ist die Grund-Probe **mahl**: „das Rudel frisst nicht: 19.1 kg in seine Mägen
    (50.8 kg) … (Soll ≥ 40 %)“, knapp unter 20,3 kg. Allein gefahren (`--proben mahl`) steht mahl GRÜN, am main bed6256c wie an meinem
    Kopf. Mein Diff berührt keine Kreatur; mahl ist die Bahn mahl-uhr (buendel-a). Genannt, nicht geheilt.

## Offen (mit Adresse)

- Messort stadt-voll, Station nicht gefahren: GPU (der Vor-Richter fährt nur an der GTX 1060).
- Die Kacheln der Stadt des Worts und die Wort-Pläne sprechen die Ursprache, weil ihr Ort erst nach dem Plan feststeht
  (fachwerk `spracheVon(region, null)`). Die Seite MUNDART misst das Gitter der Welt.
