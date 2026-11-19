# ZENSUS HAUS · TRAGWERK — Runde 3, Zahl 1 (Lese-Baum n1011-hg main b7ed8419, nur gelesen)

Kern FC = `fachwerk-core.js`, SHA-256 028cc2d0…bea06, byte-gleich mit der Kopie `p3/n1811/bau-spike3/kern/` (das Skript druckt und
vergleicht beide). Skript `v3/zaehl-balken.cjs` (sha256 ae96a6b8…), Ausgabe `v3/zaehl-balken.log` (= `p3/n1811/bau-spike3/zaehl-balken.log`),
Zeilen je Linie `p3/n1811/bau-spike3/zaehl-balken.json`. Laufzeit 23–30 s, node, kein GPU, kein git.
Markierung: **belegt** = gelesen/gezählt mit datei:zeile bzw. Log · **gewählt** = Entscheid dieses Blatts · **unsicher** = nicht nachgeprüft.

## WAS NICHT HÄLT (zuerst)

1. **„0 von 100 Balkenlinien über L_max“ ist am heutigen HAUS nicht knapp verfehlt, sondern umgekehrt: 99 von 100.** Jeder
   Deckenbalken spannt über die volle Haustiefe von Rähm zu Rähm (FC:466–470, 455–457). Im Haus gibt es keinen Unterzug, keinen
   Wechsel und keinen Innenständer. Die Zahl ist darum genau „D − 0,20 > L_max“. Mit D in 0,5-m-Stufen heißt das D ≥ 5,0 m
   (Kontrollzeile im Log: 2 522 = 2 522). **belegt**
2. **Die drei „GRÜNEN mit D > L_max“ der Runde 2 sind ein Lesefehler der Linse, kein getragenes Haus.** G5#62, G26#63 und G5#29
   sind alle `chinesisch/stein` mit `roofCurve 0,95`. Ist `roofCurve ≠ 0`, baut `beam` jedes Glied als BufferGeometry
   (FC:289–295, Bedingung `DEF_cv===0` FC:272/289), also auch die Deckenbalken. `linse-v2.cjs:71` nimmt nur `BoxGeometry` und
   fand darum 0 Lagen: GRÜN ohne einen einzigen Balken. Dieser Leser findet dort 3 / 8 / 35 Balken, davon über L_max 3 / 4 / 25.
   **Die Klasse:** 258 der 2 595 Lose (9,9 %) tragen `roofCurve > 0`, alle 258 haben D − 0,2 > L_max. Unter den 100 der Runde 1
   sind es 5. **belegt** (Log „DIE DREI GRÜNEN“)
3. **Das Treppenloch wird nicht ausgewechselt.** `clipSpanZ` (FC:357–359) schneidet den Balken am Loch (FC:466–469). Ein
   Wechselbalken wird nicht gebaut, auch das Geländer (FC:862–877) trägt nicht. Jedes Stück endet also frei als Kragarm:
   15 974 Linien in 2 467 Häusern, Kragarm Q50 0,98 m, größter 6,99 m. **belegt**
4. **Der gebaute Sparren ist 10 × 10 cm, nicht 10 × 15.** `strut` baut `BoxGeometry(th, len, th)` (FC:297–298) mit th = `P.spar`
   0,10 (FC:780–781). `sparH 0,15` (FC:180) wird nirgends gelesen: Grep `sparH` gibt 1 Treffer, die Definition. Damit gilt die
   Rechnung „Sparren 10 × 15“ in entwurf-stoff-statik.md:110 nicht für das gebaute Haus. **belegt**
5. **Die Lesart „trägt die Innenwand?“ ändert die Hauszahl nicht.** Mit jeder Gefach-Innenwand als Auflager (Lesart B) bleiben es
   2 522 Häuser, nur die Linien fallen von 37 103 auf 22 965. Der Grund: Im Flur (|x| < fw) liegt unter den Balken keine Wand.
   Die Flurwand steht parallel (FC:915), die Querwände stehen nur in den Seitenstreifen (FC:916, x von fw bis W/2). Damit ist die
   Zahl gegen diese Lesart fest. **belegt**

## ERGEBNIS

**HEUTE: 99 von 100 Häusern (Runde 1), 1 610 von 2 298 Deckenbalken-Linien über L_max (Eiche 4,59 m). In der Stadt: 2 522 von
2 595 Häusern, 37 103 von 53 971 Linien.** Dazu:
- Nadel (5,62 m): 87 / 100 Häuser, 2 163 / 2 595.
- Am GEBAUTEN Querschnitt 15 × 21 bei e bis 1,7 m: η > 1 in 100 / 100 bzw. 2 579 / 2 595 Häusern. Dafür reicht L_max 3,64 m.
- Dach (η > 1 am gebauten Glied): 2 398 der 2 438 Häuser mit Sattel-Dachwerk.

## (a) WAS IM GEBAUTEN HAUS EINE BALKENLINIE IST — Glied für Glied (alles **belegt**)

| Glied | Funktion · Zeile | Lage, Querschnitt | Auflager im gebauten Haus |
|---|---|---|---|
| Deckenbalken jeder Lage | `geruest` → `layJoists(L.top)` FC:458–473, je Geschoss auch die oberste (`levels[last].top == eaveY`, FC:473) | x auf jeder Ständerachse `bx = axis(W/2, [−fw, fw])` FC:418–422 (Teilung ≤ bayMax 1,7, FC:181, 420); lang in z über `Dp − 0,04` (FC:470); `balkenB 0,15 × balkenH 0,21` (FC:179) | Rähm vorn/hinten z = ±(D/2 − 0,02) auf Balkenhöhe (`plateRing(L.top − raehm/2)` FC:455–457, 471). Bei GLATT (stein · modern · glas · klinker, FC:207) fällt der Ring (FC:471–472), es trägt die Wand selbst (`wandFelder` FC:678) |
| Unterzug | — | — | **keiner gebaut**: `geruest` legt nur Ständer-Ring, Rähm-Ring und Balken (FC:471–473) |
| Innenständer | — | Ständer nur im Außenring (`postsRing` FC:451–454) | — |
| Innenwände | `innenwaende` FC:897–917 | Flurwand x = ±fw parallel zum Balken mit Türen (FC:915); Querwände an den Raum-Schnitten nur in den Seitenstreifen (FC:916); Rolle `gefach`, 12 cm, Oberkante `L.top − 0,05` (FC:911) | kein Rähm und kein Ständer darüber oder darin: **kein Auflager** (gewählt, §b) |
| Treppenloch | `voids` FC:459–465; Schnitt `clipSpanZ` FC:357–359 | Loch `STAIR` FC:389 an jeder Zwischendecke, an der obersten nur bei Estrich- oder Speichertreppe (FC:463, 465) | **kein Wechsel**: das Stück endet frei |
| Oberste Decke / Dachboden | dieselbe Balkenlage auf eaveY (FC:473) | wie oben | Rähm. Sie trägt den Estrichboden (FC:879–885) und den Kniestock (FC:886–890, 1,15 m mit Ständern auf den Balken), aber NICHT das Dach: der Sparren steht auf der Fußpfette über der Wand |
| Sparren | `dachwerk` FC:778–781 (`strut`) | je W/nS ≈ 0,85 m (FC:778), 10 × 10 cm (FC:297–298) | Fußpfette z = ±D/2 (FC:777), Firstpfette z = 0 (FC:776). Der Kehlbalken ist kein Auflager (§b) |
| Firstpfette | FC:776 | 2·rH + 0,2 lang, 14 × 18 (FC:180) | Firststuhl-Stiele (FC:788–794) und die Giebel-/Gratenden (FC:791). Ohne Stiel (`fpY − colTop ≤ 0,3`, FC:790) spannt sie über die ganze Länge |
| Fußpfette | FC:777 | W + 0,2, auf der Wandlinie | durchgehend auf der Wand: keine Spannweite |
| Kehlbalken | FC:783–787 | 10 × 12, jeder zweite Sparren | hängt an zwei Sparren und trägt den Stiel der Firstpfette als Punktlast (FC:788–794: „Stiel sitzt bündig auf dem Kehlbalken“) |

Nur das Satteldach baut ein Dachwerk (`ROOFMODE` FC:217, Abbruch FC:773). Ohne Dachwerk sind 157 Lose: Zinnen, Kuppel, Arkade
(→ flach oder Kuppel). Flügel und Anbau bauen keine Deckenbalken (fluegel FC:1331–1428: nur Sparren-Streben). Sie sind nicht
gezählt, gezählt ist der Hauptkörper.

## (b) DIE EINE DEFINITION (gewählt; so im Skript, zaehl-balken.cjs:7–17)

- **Balkenlinie** = ein liegendes Holz-Glied, das quer zu seiner Länge Last trägt. Das sind: jedes Deckenbalken-**Stück**
  (Mesh in `subsystems.geruest`, Hülle `balkenB × balkenH`, lang in z), jeder Sparren, die Firstpfette und jeder Kehlbalken, auf
  dem ein Stiel steht.
- **Auflager** = ein Glied des GEBAUTEN Hauses, das unter der Linie liegt oder bündig mit ihr und selbst trägt.
  - Für Deckenbalken: jedes liegende Holz in `subsystems.geruest`, das lang quer zum Balken liegt (Hülle sx > 0,5, sx > 3·sz,
    sy ≤ 0,4) und dessen y-Bereich die Balkenhöhe von unten berührt (zaehl-balken.cjs:118–129). Heute ist das nur das Rähm. Bei
    GLATT ist es die Außenwand an derselben Linie.
  - Für das Dach: Pfetten, Stiele und Giebel.
  - **Kein Auflager** sind die Gefach-Innenwand und der Lochrand.
- **Spannweite** = der LICHTE Abstand zweier benachbarter Auflager-Intervalle unter derselben Linie, gemessen Kante zu Kante.
- **Kragarm** = ein Stück mit nur einem Auflager. Es wird mit seiner Länge gezählt, nicht als Spannweite.
- **Gelesen aus:** `HAUS(THREE, mat, hp).subsystems.geruest` (die Mesh-Hüllen über `Box3.setFromObject`, so dass Box- und
  BufferGeometry gleich gelesen werden), `.subsystems.dachwerk`, `.subsystems.innenwaende` (nur Lesart B), `HAUS.P`
  (balkenB/H, raehm, spar, pfetteB/H) und `HAUS.dims` (D, W, levelsY, eaveY, ridgeY). `hp` = `DORF(DP).houses[a]`, wie im
  Spiel exportiert (`slot.ov.storeys = hp.storeys` an 2 595/2 595, zaehl-hoehe.log). Gebaut wird mit
  `nur` = {geruest, innenwaende, dachwerk}; MK lässt die übrigen Fabriken leer (FC:1764).
- Last und Holz (entwurf-stoff-statik.md §1.1):
  - Decke g 1,5 + q 2,0 kN/m², e = halber Abstand zu den Nachbar-Balken der Lage;
  - Dach 0,75 kN/m² Dachfläche + μ₁(α)·1,51;
  - η = max(w_inst/(l/300), w_fin/(l/250), σ_d/f_m,d), Eiche D30 / Nadel C24, E 11 000 MPa.
  - Die oberste Decke rechnet mit derselben Last wie jede Decke (gewählt; Estrich-Nutzlast nicht gesondert).

**L_max nachgerechnet** (zaehl-balken.log Kopf):
- Eiche d 0,258 → Kreuzholz 14,9 × 21,07 cm, e 0,85: **4,593 m** (Blatt: 4,59 ✓).
- Nadel d 0,30 → 17,32 × 24,49 cm: **5,616 m** (Blatt: 5,62 ✓).
- Der Spiel-Balken 15 × 21 bei e 1,70: 3,643 m (entwurf-stoff-statik.md:96: 3,64 ✓).
- Selbsttest des Lesers GRÜN. Gegenprobe Unterzug GRÜN: ein Holz 16 × 20 quer unter der EG-Decke, eingelegt in `geruest`,
  halbiert die größte EG-Spannweite 10,80 → 5,32 m.

## (c) DIE ZAHLEN (zaehl-balken.log)

| Satz | Häuser > L_max Eiche | Linien > L_max | Nadel (Häuser) | Lesart B (Häuser · Linien) | η > 1 gebaut (Häuser) |
|---|---|---|---|---|---|
| die 100 der Runde 1 (spike/pool.json `hundert`, hp heute byte-gleich 100/100) | **99 / 100** | **1 610 / 2 298** | 87 | 99 · 993 | 100 |
| die 2 595 Lose (30 Pläne G, nH 90) | **2 522 / 2 595** | **37 103 / 53 971** | 2 163 | 2 522 · 22 965 | 2 579 |

**Welche Linien-Art die Überschreitung trägt (Stadt):**

| Art | Linien | > L_max | Häuser damit | η > 1 | Spann Q50 / Q90 / max | η Q50 / Q90 / max |
|---|---|---|---|---|---|---|
| Decke EG | 21 453 | 12 867 | 2 197 von 2 241 mit ≥ 2 Geschossen | 12 721 | 7,3 / 9,8 / 10,8 m | 5,8 / 14,0 / 25,0 |
| Decke OG | 11 264 | 6 294 | 1 059 von 1 070 mit ≥ 3 | 6 270 | 6,8 / 9,8 / 10,8 | 5,4 / 13,1 / 23,0 |
| oberste Decke | 21 254 | 17 942 | 2 522 von 2 595 | 17 778 | 7,3 / 9,8 / 10,8 | 5,8 / 14,8 / 25,9 |
| Dach · Sparren (geneigt, licht) | 57 120 | — | — | 53 363 | 4,74 / 6,39 / 10,35 | 3,8 / 9,3 / 97 |
| Dach · Firstpfette | 2 430 | — | — | 2 121 | 3,42 / 12,34 / 14,84 | 1,7 / 88,7 / 211 |
| Dach · Kehlbalken (Punktlast Stiel) | 3 564 | — | — | 3 427 | 2,97 / 4,72 / 5,47 | 6,3 / 22,7 / 40,2 |

- Der Maßstab L_max ist ein Decken-Maß. Für das Dach zählt darum nur η.
- **Verteilung der Überschreitung** (Decken, Spannweite / L_max), Stadt: Q50 1,59 · Q90 2,13 · max 2,35. In Stufen:
  1–1,25: 4 724 · 1,25–1,5: 11 475 · 1,5–2: 14 039 · > 2: 6 865 Linien. Unter den 100 der Runde 1: Q50 1,70, max 2,57.
- **Je Rolle:** Kaufhaus, Wohnturm, Gasthaus, Schmiede, Kontor und Backhaus liegen zu 100 % über L_max, Wohnhaus 1 641 / 1 691.
- **Unter L_max** bleiben nur Häuser mit D 4,0 und 4,5 m: 73 Lose.

## WAS EIN KÜNFTIGES GESETZ LIEFERN MUSS, DAMIT DASSELBE SKRIPT ES OHNE UMBAU ZÄHLT

1. **Unterzug und Wechsel als Mesh in `subsystems.geruest`:** liegendes Holz, lang quer zum Balken (in x). Die Oberkante liegt
   zwischen Balken-Unterkante − 0,25 m und Balken-Oberkante, die Hülle reicht über die x-Lage der Balken, die es trägt. So liest
   der Leser schon heute das Rähm (zaehl-balken.cjs:118–129). Die Gegenprobe zeigt, dass ein eingelegter Unterzug ohne Umbau
   zählt.
2. **Deckenbalken bleiben `P.balkenB × P.balkenH`, lang in z,** in derselben Gruppe. Der Querschnitt wird aus `HAUS.P` gelesen,
   der Abstand e aus den Lagen der Meshes. Ein eigener Querschnitt des Gesetzes geht also über `P.balkenB/H`.
3. **Sparren-Querschnitt:** Ein Sparren 10 × 15 gilt nur, wenn `strut` `sparH` liest. Heute liest es nur `P.spar` (Punkt 4 oben).
4. **Grenze des Lesers (benannt, nicht gelöst):**
   - Eine Balkenlage, die LÄNGS x spannt (Entwurf A, Ausrichtung s = 'x'), sieht der Leser nicht. Entweder baut das Gesetz die
     Balken lang in z, oder `zaehl-balken.cjs` bekommt den Fall „Balken lang in x, Auflager lang in z“. Das ist eine Zeile je
     Filter, aber nicht gebaut.
   - Ob unter einem Unterzug Ständer bis zum Grund stehen, prüft der Leser nicht.

## WAS UNSICHER BLEIBT
- Ob der Spiel-Bau der Welt (`buildInstance`, Stufen L0–L2, `P.__sehne`) dieselben Glieder legt wie `HAUS(hp)` hier. Gezählt
  ist der HAUS-Bau mit dem exportierten hp, nicht der Bau im Faden.
- Die Lasten sind nicht nachgeschlagen (entwurf-stoff-statik.md §1.1: „unsicher“): g 1,5 · q 2,0 · Deckung 0,75 · s_k 1,51.
  Die Holzklasse je Haus gibt es im Kern nicht: E ist für beide Hölzer gleich, darum sind die η von Eiche und Nadel fast gleich.
- Für den Kragarm am Lochrand ist keine Grenze gezählt, nur seine Länge.
- 24 der 2 595 Lose baut der Nachbau der Höhen-Kette nicht genau nach (zaehl-hoehe.log). Für diese Zählung ist das ohne Belang:
  hier zählt das gebaute hp.
