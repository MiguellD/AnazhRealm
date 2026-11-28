# Stand-Blatt sprache-dialekt (Sprosse `karte2.mensch.kultur.sprache#4`) — dritte Sitzung, Start 27.11. 11:52 UTC

Basis: main 52937c92 (V18.546.451), Kopf 1 auf 7e73426e, Kopf 2 auf main 9a75d61c (V18.546.457), Kopf 3 2d05e947 auf main 27d2f60e. Status: ZWISCHENSTAND. Karte 2 gebucht 158 von 1 718.

## SICHERUNG 28.11. 08:5x UTC (auf Zuruf: ein WIP-Commit, keine Batterie, nichts Neues)

**Geschnitten:**
- Kopf 4 = 52f7f1aa auf main bbb97563: der Preis der Mundart (R15).
- Kopf 5 als WIP (61499cd und dieser Commit), kein Vorprüf-Kopf: `karte2.mensch.kopplung.kultur#1`, der Baustoff folgt dem Vorrat,
  die Legende gilt, wo ihr Ort sie trägt. Dazu Linse R16 und Stations-Kandidat. Einzelheiten im Abschnitt Kopf 5 unten.

**Letzte Zahl:**
- kultur#1 an den 32 Zellen der Station mit dem Eingang der Zelle: 11 → 30 von 32 (34,4 → 93,8 %), Soll ≥ 85 %.
- Ohne Boden sind 80 Pläne byte-gleich (sha 4ca7ccb7).
- Kopf 5: `check:statik` RC=0 in 685 s.
- `gate:settlement` an Kopf 5: unterbrochen (der Arbeiter der Wolke startete neu), kein Ergebnis.
- `gate:worker-dichte` an Kopf 5: nicht gefahren.

**Rote Zeilen wörtlich:**
- Post 28.11. 05:04: „GPU-PROBE 52f7f1aa auf keinem Läufer: ABGEWIESEN in 304 s („gate:settlement“: misst in der Cloud 1077 s
  (spec/ci/ci-zeiten.json), der Deckel je Probe ist 480 s — kein Läufer hält es, sein Richter ist die Cloud-Batterie (check.yml, [ci voll]))“.
  Mein Fehler: Ich habe gate:settlement als Probe-Ruf genannt, obwohl es über dem Deckel liegt. Kopf 4 trägt keine GPU-Probe. Sein Richter ist [ci voll].
- `check:statik` (Kopf 4 und Kopf 5, RC=0), die bekannte falsch-rote Mutanten-Zeile: „[H Mutant Objekt-Liste] 16 Häuser · 5779 Teile · 1644
  Blocker · 276 Byte je Teil (Deckel 128) — ROT: Objekt-Liste gehalten (`_hausHuelle.teile` an 16 von 16 Häusern) · Byte je Hüll-Teil
  276 über dem Deckel 128“.
- R16 offen (gemessen, ohne Soll): „heimat/stein 0.0 %“ und „mittelmeer/holz 0.0 %“. Kein Pool im Klima baut den Stoff um 880.
- `karte2.mensch.kultur.sprache#6` · ROT · geparkt (347a5c2, kandidat-6).

**Nächster Schritt:**
1. Kopf 5 an der Wolke: `gate:settlement` (R16, die Mutanten der Familie R) und `gate:worker-dichte` (Leser von `_rockExposureAt`).
2. Danach den Vorprüf-Kopf 5 auf dem main des Moments.
   - Probe-Ruf nur mit Toren unter 480 s laut spec/ci/ci-zeiten.json. gate:settlement nicht in die Probe, sein Richter ist [ci voll].
   - Station: den Kandidaten aus dem Stations-Ordner gegen punkte-maschine d35d07e.
3. Danach sprache#6 aus dem geparkten Stand zurückholen.
4. Die Worktrees der Wolke räume ich beim Ende.

## Kopf 5: `karte2.mensch.kopplung.kultur#1` „Baustoff aus Boden und Klima“ — geschnitten, gemessen

**Gemessen an den 32 Zellen der Station** (Null-Renderer, die Zellen um Genesis wie KULTUR S1, `_autoSettlementCellInfo`; der Plan mit dem
Eingang der Zelle, wie der Zug ihn bestellt): passend **11 → 30 von 32 (34,4 → 93,8 %)**, Soll ≥ 85 %. Der Boden fordert Holz 27,
Lehm 5; die Pläne bauen Holz 25, Lehm 7 (Regionen alpin 14, nordisch 11, mitteleuropa 7). Der Plan wie die Station heute bestellt
(`{seed, nH}` ohne Eingang) bleibt bei 10 von 32: darum der Stations-Kandidat.

**Täter beim Namen (drei Glieder derselben Klasse, alle am Chokepoint `fachwerk-core.js` DORF):**
1. Die Region würfelte nur im Klima, nie im Vorrat. Jetzt fällt der Wurf zu 90 % auf die Regionen, deren Pool im Jahr des Wurfs den
   Stoff des Bodens baut (`stoffDesBodens`, `regionBaut`, `imVorrat`; Region und Wurf bleiben EIN Zug des Samens).
2. Das Haus wählte seine Kultur blind im Pool, die Scheune war außerhalb des Mittelmeers immer aus Holz. Jetzt baut das Haus zu 90 % im
   Stoff des Bodens, wo der Pool ihn trägt, und die Scheune im Stil ihres Hauses, wenn das Haus im Stoff des Bodens steht.
3. Die Epochen-Legende (jede dritte Zelle, `siedlungsEpoche`) setzte Region und Pool ohne den Ort: das mediterrane Dorf im Wald der
   Heimat, das alpine Holzdorf auf der Wiese. Jetzt gilt sie nur, wo ihre Region im Klima-Band liegt und ihr Pool den Stoff des Bodens
   baut, sonst nur im Rest des Bands (`legendeAmOrt`).
Der Eingang der Zelle trägt den Boden am Anker des Dorfs (`_zellEingang` → `boden` {fels, wald}); der Fels liest den Hang der Höhe
der Saat (`_rockExposureAt` mit Fläche `_terrainSaatY`), nicht das gebaute Netz: der Plan bleibt eine Funktion von Saat und Gesetz,
das Gedächtnis rechnet denselben Plan.

**Band:** in Finnland, Norwegen und Schweden sind 90 % der Einfamilienhäuser aus Holz (Schauerte 2010, zitiert in Silva Fennica,
Artikel 10503; Statistik Finnland 2017: 84 % der Wohngebäude). Daraus der Anteil 0,9 im Gesetz (`BODEN_STOFF.anteil`).

**Byte-Beweis:** ohne Boden (das Labor, das Wort, die Kachel einer Stadt) 80 Pläne in zwei Klimaten gleich (sha 4ca7ccb7 = 4ca7ccb7).

**Linse:** gate:settlement **R16** „der Baustoff folgt dem Vorrat“ (Familie R): 32 Saaten je Fall, jede mit der Legende ihrer Saat;
Heimat/Holz 87,5 % der Pläne und 90,6 % der Wohnhäuser und Scheunen, Heimat/Lehm 87,5 · 82,2 %, Mittelmeer/Stein 100 · 100 %,
Fernost/Holz (gemischter Pool) 87,5 · 84,1 %; Soll ≥ 85 % der Pläne und ≥ 80 % der Häuser je Fall, ohne Boden 0 von 8 anders.
Die Mutanten fallen alle in R16 beim Namen: „die Region liest den Boden nicht“ 46,9 % → ROT, „das Haus liest den Boden nicht“ Heimat/Lehm
63,7 % der Häuser → ROT, „die Legende liest den Ort nicht“ 56,3 % → ROT; Kopf 4 (vor dem Schnitt) ist ROT, der Plan liest keinen Boden.

**Stations-Kandidat:** `cloud-post/sprache-dialekt-station/kandidat-kultur1.diff` gegen punkte-maschine d35d07e (≥ 5e895684): BAU_AN
bestellt den Plan MIT dem Eingang der Zelle (`..._zellEingang(mit.zelle[a.saat], a.saat)`); kein Soll, kein Richter-Text geändert.

**Offen mit Messname:** der Fels der Heimat (Heimat/Stein 0 %) und der Wald am Mittelmeer (0 %) — kein Pool im Klima baut den Stoff um
880, dort bleibt der Wurf des Klimas (R16 misst beide, ohne Soll). In der Welt der Station trägt keine Zelle Fels (Stein 0 von 32).
Die Region aus dem Hausbild (R11, ≥ 70 %, Panel) — Station nicht gefahren: GPU.

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

**Gemessen nach der Landung (27.11., main b56b51f0 gegen 23b593ac):** an stadt-voll unter gleichen Bedingungen, Null-Renderer.
Die Stadt ist von Hand aufgezogen wie in gate:klang-zensus Mk („dorf 7 300“ am Anker, bis jeder Bewohner seinen Leib trägt, dann 10 s
Spielzeit), Heap nach doppelter GC:

| main | `_mundartAm` | Bewohner | Stadt steht nach | Heap gehalten |
|---|---|---|---|---|
| 23b593ac (vor) | nein | 1 356 | 149,1 s | 115,7 MB |
| b56b51f0 (nach) | ja | 1 356 | 150,0 s | 115,6 MB |
| 23b593ac (vor) | nein | 1 356 | 150,0 s | 115,9 MB |

Das Spiel mit Mundart trägt **0 MB** und **0 s** mehr. Die 200 MB und 42 s des Vor-Richters kommen aus der Sitzung der Station
(die Seiten #2, #3 und #4 und das Gitter MUNDART in EINER Sitzung) oder aus dem Renderer, nicht aus dem Spiel. Ein Heap-Schnitt
in Kopf 3 entfällt.


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

## Der Preis an stadt-voll (Post 28.11. 02:00) — Kopf 4: gemessen, geschnitten, ehrlich offen

**Vorprüf-Kopf 4 = 52f7f1aa auf main bbb97563** (28.11. 04:0x, ohne Anspruch). `check:statik` RC=0 (614 s, die Zeile „[H Mutant
Objekt-Liste]“ ist die bekannte falsch-ROTE Mutanten-Zeile). gate:settlement GRÜN (R15 ✅, beide Täter ROT beim Namen; Wolke 1 300 s).
gate:klang-zensus GRÜN (Wolke 490 s). Probe-Ruf: gate:settlement, gate:klang-zensus.

**Gemessen im Haupt-Faden** (Null-Renderer, die Stadt von Hand aufgezogen wie gate:klang-zensus Mk, 1 356 Bewohner, danach
600 Takte zu 1/60 s, gleiche Pose; je Glied des Wirts Rufe und ms; ABAB):

| Stand | Takt Mittel | Takt p95 | `_tickBewohner` je Takt | `_bewohnerLautTakt` je Takt | `_mundartAm` | Heap gehalten |
|---|---|---|---|---|---|---|
| main 27d2f60e (3 Läufe) | 8,35 · 8,54 · 7,42 ms | 15,18 · 14,09 · 11,65 ms | 1,51 · 1,57 · 1,30 ms | 0,25 · 0,27 · 0,24 ms | Ankunft 21×, 16,4 ms · Takt 0× | 116,7 · 116,3 · 116,4 MB |
| Kopf + Merkbücher (3 Läufe) | 7,34 · 7,66 · 7,77 ms | 11,22 · 12,40 · 11,90 ms | 1,31 · 1,37 · 1,40 ms | 0,24 · 0,24 · 0,23 ms | Ankunft 21×, 4,2 ms · Takt 0× | 115,9 · 115,9 · 116,0 MB |
| sprache#6 OHNE Merkbuch | 8,95 ms | **19,38 ms** | 1,78 ms | 0,24 ms | Ankunft 20×, 24,5 ms | 116,0 MB |

**Befund, ehrlich:** am main rechnet die Mundart im Takt **nie** (`_mundartAm` 0× in 600 Takten), bei der Ankunft 21× (16 ms
gesamt). Der Heap mit und ohne meine Schnitte ist gleich (±0,8 MB). Die Rede der Menge kostet 0,24 ms je Takt. Die Mundart im
Haupt-Faden trägt die vsync-Kante an der GTX nicht; die Streuung main ↔ Kopf liegt im Rauschen der Läufe. Woher 41,7 ↔ 33,4 ms
an derselben Version und 730 MB gegen 505–540 MB kommen, sagt dieser Lauf nicht: Renderer und GPU fehlen der Wolke (Lehre 16).

**Täter beim Namen (geschnitten, byte-gleich, 28 800 Abfragen 0 verschieden, sha 1204006b = Kopf 3):**
1. `fachwerk-core.js` `mundartVon` rechnete JEDEN Ruf neu (105 Wörter × 5 Ebenen × 9 Herde): **374 µs je Ruf, auch warm**, an jedem
   Eingang einer Zelle (`stamm/siedlung-ort.js` `_zellEingang` → `_mundartAm`: Export, Gedächtnis, Melden der Nachbarn in 720 m).
   Jetzt EINMAL je Senke (`_MUNDART_SENKE`, ≤ 4 096): **2,7 µs**, dasselbe Objekt je Tal.
2. `fachwerk-core.js` `spracheVon` baute je Ruf den Schlüssel aus 105 Wörtern (6,2 µs je Name, je Satz). Jetzt EINMAL je Ort
   (`_ORTSPRACHE`, WeakMap am Mundart-Objekt des Plans): **0,6 µs**. Mit sprache#6 hätte derselbe Ruf **702 µs** gekostet (p95 19,4 ms
   im Lauf oben) — der Preis-Schnitt fängt das, bevor #6 kommt.

**Linse:** gate:settlement **R15** „die Mundart rechnet einmal je Senke und Ort“ (Familie R, neben R13): zwei Rufe an derselben Senke
geben dasselbe Objekt; die Sprache des Orts warm unter der Hälfte des alten Schlüssels allein (relativ, die Wand hängt nicht an der
Maschine). Kern 64/64, 0,05 µs gegen 4,6 µs. Täter „die Mundart rechnet je Ruf neu“ 0/64 → ROT, „die Sprache rechnet je Bewohner
neu“ 5,07 µs → ROT.

**sprache#6 parkt bis Kopf 5** (Commit 347a5c2): mit #6 spricht jeder Ort die Stufe seines Jahrs, die Zeugen von #3/#4 an der
Station rechnen ohne kandidat-6 die Gegenwart — der Preis-Schnitt soll diese zwei gebuchten Punkte halten, nicht gefährden.

**Offen mit Messname:** „der Lauf selbst“ p95 ≤ 33,3 ms an der GTX 1060 in zwei von zwei Läufen, Heap unter dem Stand vor
sprache#3 — Station nicht gefahren: GPU. Erwartung ehrlich: die Merkbücher senken die Ankunft und den Bewohner-Takt um wenige Prozent;
hält die GTX danach weiter auf der Stufe 41,7 ms, liegt der Täter nicht in der Sprache.

## R11-Zuteilung: `karte2.mensch.kopplung.kultur#1` „Baustoff aus Boden und Klima“ — Täter-Zahl (Bau nach Kopf 4)

Soll (Zweig `punkte-maschine`, die Station Zusammenspiel, KULTUR S1): 32 Saaten, passender Baustoff ≥ 85 % (Boden der Zelle: Fels ≥ 0,3 →
Stein, Wald ≥ 0,5 → Holz, sonst Lehm; der Plan: der Mehrheits-Stil seiner Häuser), Region aus Hausbild ≥ 70 % (Panel).
Gemessen am Kopf (Null-Renderer, die 32 Zellen der Station um Genesis, `_autoSettlementCellInfo`):
- Plan wie die Station (`_foundryRequestSettlement({seed, nH})`): **10 von 32 = 31,3 %** passend.
- Plan mit dem Eingang der Zelle (`_zellEingang`: Klima, Mundart): **11 von 32 = 34,4 %**.
- Der Boden fordert Holz 27, Lehm 5, Stein 0; die Pläne bauen Holz 10, Stein 7, Lehm 14, Glas 1 (Regionen alpin 8, mitteleuropa 19,
  mediterran 3, nordisch 2).
Täter: `fachwerk-core.js` `bauRezept` — der Stil folgt der Region (dem Wurf des Samens im Klima-Band), nie dem Vorrat am Ort; der
Eingang der Zelle trägt keinen Boden. Der Schnitt gehört an denselben Chokepoint wie die Mundart (`_zellEingang` → `DP` → Plan) und
verlangt einen Stations-Kandidaten (die Station bestellt ohne Eingang). Er folgt nach Kopf 4, damit Kopf 4 nur den Preis trägt.

## Kopf 3 (2d05e947, sprache#5) — GPU-Probe GRÜN (Post 28.11. 01:34), Urteil offen

Die vier Tore plus webgl-probe auf radeon-890m GRÜN in 1 177 s (das Probe-Blatt zu 2d05e947 im Zweig koordination). Ich warte auf das Urteil
bzw. GELANDET; Kopf 4 baue ich erst auf dem main danach. Nachtrag 03:05: gelandet im Bündel w28-buendel-nacht (main bbb97563).

## `karte2.mensch.kultur.sprache#6` „Sprachstufen über Epochen“ — gebaut als WIP (b5dd1f9 + Station), geparkt in 347a5c2, Kopf 5

**Täter (am main):** `fachwerk-core.js` `spracheVon(region, mundart)` kennt kein Jahr. Die Sprache eines Orts im Jahr −1500 ist byte-gleich
der von 1900, und die Station sagt „die Silben-Tafel ist zeitlos“ (`erwartet: "nicht"`).

**Der Schnitt (EINE Quelle):** `spracheVon(region, mundart, jahr)`. Der Stammbaum bekommt eine Zeit (`SPRACH_ZEIT.gegenwart` 2000, die
Wurzel `ERSATZ.alter` = 4 000 J davor, 800 J je Kante): das Lautgesetz eines Knotens fällt in der ersten Hälfte seiner Kante, ein Wort-
Ersatz danach bis zum Kantenende. Ohne Jahr (und ab der Gegenwart) ist jedes Blatt **byte-gleich** zum main. Der EINE Leser des Spiels
ist `spracheDesOrts(plan)`: das Jahr des Plans (Schnitt der Chronik bzw. Export `jahr + spanne`). Ihn lesen Name und Rede der Leute
(`stamm/siedlung-bewohner.js`), der Klang der Menge (`stamm/klang.js:941`), der Ortsname (`ORTSNAME`) und die Zensus-Sonde.

**Gemessen (node, welt-1):**

| Maß | Wert | Soll |
|---|---|---|
| Byte-Beweis ohne Jahr | gleich | gleich |
| Wurzel = Ursprache | 192/192 | alle |
| Stufen je Sprache (Schritt 25 J) | 49,5 | – |
| Umfang (× U_eff 10 116) | ≈ 500 637 | ≥ 100 000 ✅ |
| Ursprache rekonstruiert (Mehrheit der 32 Töchter) | 0,759 | ≥ 0,6 ✅ |
| Jahreswechsel am Spiel (40 Leute, `_bewohnerLauf` „rede“) | 25/40 Sätze anders, 28 ms | ≤ 1 s ✅ |
| Swadesh-Retention je 1 000 J | 0,876 | 0,70–0,86 → ROT |

**Retention ist ROT, mit Grund:** `ERSATZ.halten` = 0,86 nach Swadesh 1955 (100er-Liste, 86 %, Spanne 81–90; Lees 1953 0,805 für die
200er-Liste). Die Grundwörter der Orte und „haus“ bleiben fest (das Toponym ist die beständigste Schicht), darum liegt das Mittel der
ganzen Liste über 0,86. Die Wurzel wäre, die Konstante als Retention der GANZEN Liste zu lesen. Das ändert aber jede Wortliste und damit
jeden Ortsnamen der Welt und die gestempelte Messung von #4. Ich schneide das nicht ohne Wort des Richters.

**Linse:** `gate:settlement` R14 „die Sprache trägt ihre Zeit“ (Wurzel = Ursprache, Blatt = Gegenwart, Rekonstruktion ≥ 0,6, die Pläne
der Epochen sprechen ihre Stufe). Täter im Selbsttest: „die Sprache kennt keine Zeit“ und „der Ort liest sein Jahr nicht“ → beide ROT beim
Namen R14, Selbsttest GRÜN in 715 s (probeUrteil GRÜN). Hauptlauf GRÜN 656 s.

**Station:** `cloud-post/sprache-dialekt-station/kandidat-6.diff` (ÜBER `kandidat.diff`): die Seite ZEIT und die #6-Zeile als Zahl.
**PFLICHT:** Kopf 5 (sprache#6) und kandidat-6 landen ZUSAMMEN; Kopf 4 trägt nur den Preis und braucht keinen Kandidaten. Ohne ihn lesen die Zeugen von #3/#4 die zeitlose Gegenwart, die Orte sprechen aber
ihr Jahr, und ihre Namen fallen auseinander.

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

**Soll mit Quelle, zur Entscheidung (ich ändere es nicht):** das Band für „Satz ↔ Handlung“ ist schmal. Ibbotson, Lieven & Tomasello
2013 (Journal of Child Language) zählen in der Rede an Kinder etwa **30 %** der Beschreibungen als Handlungen im Hier und Jetzt;
gelesen habe ich nur die Kurzfassung. Bindet das Gesetz 30 % der Sätze an den Akt und lässt den Rest frei, trifft ein Hörer im 2AFC
0,3 + 0,7 · 0,5 = **0,65**, also unter dem Soll 0,8. Das Soll 0,8 verlangt mindestens 60 % gebundene Sätze, das Doppelte des Bands.
Nachtrag: Täter 2 ist gebaut, in der Lesart „2AFC über Sätze am Akt“. Wer einen Akt trägt, spricht das Verb seines Akts
(`SATZ_GESETZ.handlung`); ohne Akt bleibt der Satz byte-gleich frei. Der Markt misst 38 von 38. Das 30-%-Band gilt für Rede
über alles; hier zählen nur Sätze am Akt. Das Soll bleibt beim Richter.

Art „auge“: auch mit Gesetz bleibt die Sprosse bis zum Blindpaar am Gerät offen (Klasse P). Meine Bahn kann den Laut bauen (die
Konsonanten als Quelle aus Rauschen und Verschluss im EINEN `stimmPuffer`, Band: Klatt 1980, die Parallel-Zweige für Frikative) und den
Satz an den Akt binden. Das Urteil spricht das Ohr.

### sprache#5 Täter 2 geschnitten: der Satz spricht von seinem Akt (27.11. 23:5x, WIP über Kopf 2)

Die Lesart entscheide ich selbst, das Soll bleibt unverändert: Ein Satz, der während eines Akts fällt, trägt das Verb dieses Akts.
- fachwerk `SATZ_GESETZ.handlung`: 17 Akte → das nächste Verb der Grundliste (QUELLE UNGEPRUEFT in der Zuordnung; Swadesh kennt kein arbeiten, spielen, kämpfen); wer es tut, sind Leute. `sprachSatz(L, saat, akt)`: ein Akt ohne Zeile bricht laut, ohne Akt spricht der Satz frei.
- Byte-Beweis: Sätze ohne Akt alt ↔ neu 0 von 1 800 verschieden. Damit liest die Station #2 (Bewohner ohne Akt) dieselben Sätze.
- Wirt `_bewohnerLauf` „rede“ reicht `b.akt`; die Rede der Menge merkt sich ihn (`z.akt`, klang.js).
- node, 400 Sätze je Familie: gebunden 1,000; frei trägt das Verb nur durch Zufall 0,05–0,17.
- Linse gate:klang-zensus Mk „Satz ↔ Handlung“ (Soll ≥ 0,8): Markt **38 von 38**. Selbsttest S31 „der Satz vergisst seinen Akt“ ist ROT (27 von 41, noch mit Sätzen vor dem Mutanten). `--markt --selftest` rc=0 · check:statik GRÜN.

### sprache#5 Täter 1 geschnitten (WIP 88c3e75, 27.11. 22:43, über Kopf 2, kein Vorprüf-Kopf vor dem Urteil)

Der Schnitt an der EINEN Wurzel, der Lautung des Satzes:
- **fachwerk `sprachSilben(satz, L)`** ersetzt `sprachKerne`; Leser, Linse und Doku fallen in derselben Welle (Lehre 3).
  - Jede Silbe ist { an, k, ab } mit Lauten der Tafel `SPRACH_LAUTE` (Art, Ort, Stimme).
  - Die Schrift wird als längste Buchstabenfolge gelesen; die Familie liest z und w nach ihrer `schrift`.
  - Die Grenze ist der maximale Anlaut unter steigender Sonorität (Clements 1990), dazu das s-Cluster.
  - Je Familie neu: `einsatz` behaucht/unbehaucht (Lisker & Abramson 1964).
- **klang `stimmRede`:** die Dauern nach Klatt 1979 (ICPhS, Tafel 1 INHDUR/MINDUR und Regeln 2–11, an der Quelle gelesen).
- **klang `stimmPuffer` spricht sie:**
  - Reibung über einen parallelen Bandpass am Gipfel des Orts (Jongman, Wayland & Wong 2000, Tafeln 1–3 gelesen), ihr Pegel am Vokal desselben Lauts.
  - Knall, Verschluss mit Stimmbalken in der vorstimmhaften Reihe, VOT als Behauchung durch dieselbe Kaskade.
  - Nasal, Liquid und Gleitlaut als leise Stimme.
- **Wirt** `_bewohnerLautTakt`: Teile nach Silben-Dauer (`mengeSilben(sek, rede)`, `mengeSek(rede)`).

Gemessen, node, 24–60 Sätze je Familie:
- **%V je Familie** (Rede aus Kernen 1,00 →):

  | Familie (Seite vor ↔ node nach Regel 7) | %V |
  |---|---|
  | mitteleuropa | 0,48 → 0,480 |
  | alpin | 0,544 → 0,530 |
  | mediterran | 0,654 → 0,657 |
  | nordisch | 0,541 → 0,528 |
  | fernost | 0,675 → 0,673 |
  | antik | 0,506 → 0,495 |

  Band 0,40–0,54 nach Ramus, Nespor & Mehler 1999; die Klassenmittel 41,2 · 44,2 · 53,1 % hat Dellwo, Abb. 1, gelesen.
- **Gipfel nach Jongmans Messung** (Mann/Frau im Wechsel): f 7 850 / 7 678 · s 6 800 / 6 882 · v 7 225 / 7 678 · ʃ 3 825 / 3 712 · z 7 250 / 6 882 Hz.
- **Konsonanten im Ohr** 0 → alle (jeder Laut der Silbe ein Segment).
- **Byte-Beweis:** Die Laute ohne Satz (Gruß · Lachen · Mühe · Seufzer · Halten) sind byte-gleich, 54 von 54 Puffern.
- **Bild:** Spektrogramm vorher ↔ nachher mit Knall, Reibung und Nasal sichtbar (Blick-Sonde im Scratchpad).

Linse gate:klang-zensus (Sp):
- %V ≤ 0,70 je Familie und der Gipfel je Frikativ ±15 % zu Jongman.
- Selbsttest S29 „die Rede ohne An- und Abglied“, also der Stand am main, ist **ROT** mit 7 Befunden: 6 Familien mit %V 1, dazu „kein Frikativ“.
- Ganzer Zensus auf der Seite (`--selftest`, 453 s): ✅ S1–S23, S28, S29 · Markt 259 Reden, 0 ohne Silben, L_Aeq 65,35 dB(A). Der Mk-Mutant S29 löschte noch `kerne` und blieb unbemerkt (rc=1). Er trifft jetzt die Fracht `rede`, die Rede wird an ihrem Einsatz erkannt: `--markt --selftest` ✅ S24–S27, S29 („97 von 97 Reden ohne die Silben eines Satzes“), S30, rc=0 (4e782ea).
- Nach Regel 7 (8e7bcdf) ganzer Zensus auf der Seite, 446 s, rc=0: %V mitteleuropa 0,466 · alpin 0,53 · mediterran 0,653 (außer Band) · nordisch 0,527 · fernost 0,668 (außer Band) · antik 0,491; Gipfel f 7 850 · s 6 725 · v 7 175 · ʃ 3 700 · z 7 250 Hz; ✅ S1–S23, S28, S29 · ✅ S24–S27, S29, S30.

Ehrlich offen:
- Regel 7 nach Klatt S. 296: die Segmente der unbetonten Silbe kürzen, das Abglied der betonten nicht mehr (mein Schnitt kürzte es). Damit liegen alpin und nordisch im Band; ΔC mitteleuropa 5,39 cs (Englisch bei Ramus 5,35).
- Zwei Familien liegen über dem Band ≤ 0,54: mediterran 0,657 und fernost 0,673. Die Wand prüft ≤ 0,70. Fast nur offene CV-Silben treffen Klatts englische Vokale (V 147 ms, C 67 ms); das Tempo heilt das nicht, Klatt S. 297: „most of the rate change is realized by manipulating pause durations“. Klatts Dauern sind Englisch, ein Sprecher. Das Japanische trägt kurze Kurzvokale, das Italienische lange Konsonanten. Messname `Sp %V außer Band`.
- QUELLE UNGEPRUEFT im Wert:
  - x (velar);
  - die Breite der Rausch-Gipfel;
  - Pegel und Lage von Knall und Behauchung;
  - Pegel und Form der Sonoranten;
  - die Dauern von x · ts · pf.

Täter 2 (Satz ↔ Handlung) wartet auf die Entscheidung zum Soll.

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
