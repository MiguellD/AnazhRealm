# ENTSCHEID: die Stadt als Netz — das Viertel ist eine Kachel (OMEN, 15.11., ZWISCHENSTAND)

Auftrag des Koordinators 15.11. 03:05, nach der Abgabe w28-stadt-funktion b0f25c2d („als Funktion trägt es, als Bild ist es keine
Stadt“). Der Spike sagt in allen drei Fragen JA; der Bau läuft im Zweig `w28-stadt-netz`.

## Der Spike (GTX-Rechner, Node, Kratz-Haken `dp.netz` im Kern, nichts gelandet; `vision/stadt/spike-netz.cjs`, Bild `spike-netz-2x2.png`)

Kachel 256 m (= eine Zelle der Welt), 5 Tore je Kante aus dem Samen der KANTE, die Straßen glatte Kurven von Tor zu Tor (an der
Kante senkrecht), je Reihe und Spalte eine Hauptstraße über alle Kacheln; die Lose und Häuser setzt das bestehende `dorfLayout`
auf diesem Netz (statt auf dem gewachsenen `strassengraph`), außerhalb der Kachel steht nichts.

| Frage | Messung | Zahl |
|---|---|---|
| (i) Naht | 10 000 zufällige Nachbar-Paare (Samen, Ort, Ost oder Süd) | 0 ungleich · Abstand der Tore **0 m**, byte-gleich aus beiden Richtungen · die Straße quert die Kante auf **0,17°** senkrecht |
| (ii) Dichte flach | Häuser/ha im Streifen ± 30 m um die Kante gegen die Mitte (120 × 120 m) | **30,6 gegen 29,9 — 1,02** (Soll ≥ 0,8) · 0 Überdeckungen über die Naht |
| (ii) Dichte am echten Grund | Welt-Saat „anazh-realm-seed“ am Anker von stadt-voll (`lageGrund`, `hoehenRaster`, `ortPlan`) | **29,3 gegen 29,2 — 1,00** · je Kachel 193–194 Häuser, **kein Los fällt** |
| heute am selben Grund | dorf 7 500 (das Wort der Wand) | 357 Lose von 490 (in Node gleich dem Spiel): 6 Häuser/ha auf der Scheibe r 435 m |
| (iii) Stufe 1 | Tore, Straßen, Kreuzungen, Blöcke je Kachel | **0,146 ms** (45 Knoten, 60 Strecken, 36 Blöcke), byte-stabil |
| (iii) Viertel-Frage | `viertelWort` bei 10⁴ / 10⁶ Häusern (Abgabe b0f25c2d) | 13–27 µs — bleibt, das Ring-Gesetz zählt künftig Kacheln |
| (iii) Stufe 2 | der Export der Kachel (188–199 Häuser) | **4,4–4,6 s** kalt = 121–128 ms je Block; Plan 329–345 KB (Kurve: 160 Häuser 2,3 s, 300 4,7–6,1 s, 500 7,3–9,2 s) |
| der Plan am Ort | `ortPlan` der Kachel, flach | 315 ms · 199 Slots · an den 4 Toren der Hauptstraßen stehen heute 32 Wenden (Plan v2 1041 KB) |

Das Bild von oben (2 × 2 Kacheln, 770 Häuser auf 26 ha): EIN Gewebe — die Straßen laufen über jede Kante, die Hauptstraßen
durch alle Kacheln, Blöcke mit Häusern an jeder Straße, keine Naht zu sehen.

## Der Schnitt (im Kern; der Wirt liest)

1. **`STADT_NETZ` + `kachelNetz(samen, ix, iz)`** (fachwerk-core, Stufe 1): die Tore je Kante aus (samen, Achse, Kanten-Id), die
   Straßen, die Kreuzungen, die Blöcke — der Graph in der Form des `strassengraph`. Die Klasse einer Straße trägt ihre REIHE
   (Hauptstraße über alle Kacheln einer Reihe oder Spalte). Zustandslos, ≤ 1 ms; die Stadt in der Ferne liest später dieselbe Stufe.
2. **Das Wort der Stadt über der Wand ist ein Netz von Kacheln.** `viertelWort` zählt Kacheln im Raster EINER Zelle (Schritt 1
   statt 4): Ring um die Mitte, von innen voll, der letzte Ring teilt den Rest; die Zahl je Kachel ist, was ihr Netz trägt
   (≈ 190 Häuser bei 256 m, `STADT_NETZ.jeKachel`). Die Mitte (0, 0) trägt den Markt; es gibt keinen runden Kern von 500 mehr.
   Alles bis zur Wand (500) bleibt byte-gleich — ein Dorf ist ein Dorf.
3. **Stufe 2 = `exportSettlement` mit `dp.kachel` {samen, nH, i, k}**: der Kern baut das Netz der Kachel selbst, setzt Lose und
   Häuser mit `dorfLayout` auf ihm, hält alles in der Kachel (außen `belegt`), erbt Region, Jahr und Spanne der Mitte.
4. **Die Mauer gehört dem Rand der Stadt**: eine Kante, deren Nachbar keine Kachel der Stadt ist, trägt Mauer-Stücke zwischen
   ihren Toren (dieselbe Form `mauer.segs/towers`, die `_stlMauerBuild` heute liest); zwischen zwei Kacheln nie.
5. **Ein Tor ist kein Ende**: `verkehrsNetz` sucht an einem Straßen-Ende auf der Kante der Kachel keine Wende (heute 8 je Ende).
6. **Wirt**: `_viertelInfo` liest das Raster mit Schritt 1; eine Kachel steht FEST an ihrem Platz (die Ort-Wahl rückt sie nie —
   sonst reißt die Naht; `_dorfBereiten` mit fester Wahl wie die Wiederkehr); EINE Zelle, EIN Sprecher: im Reich der Stadt
   gründet kein Wort eines anderen (`_dorfAkt` weist es ab, Befund Brandau), und ein Ort des Rangs steht dort nicht.

## Was stirbt

- `STADT_FUNKTION.schritt 4`, der runde Kern von 500 als Mitte einer Stadt über der Wand, `teil` (Viertel von einem Viertel der
  Wand an den Kanten) — das Ring-Gesetz bleibt, es zählt Kacheln.
- Die Feldwege des Wegenetzes ZWISCHEN den Vierteln einer Stadt (`_wegenetzNachbarn`: `maxStadt`, „zwischen zwei Orten EINER
  Stadt zählt als Dritter nur ein Ort dieser Stadt“): die Straßen treffen sich an der Kante selbst. Das Wegenetz hängt die Stadt
  als GANZE an die Dörfer der Welt (über ihre Rand-Kacheln).
- Die Wenden an den Kanten der Kachel.
- Der Kratz-Haken `dp.netz` des Spikes (er wird `dp.kachel`, das Netz baut der Kern).

## Leser (jeder liest dieselbe Funktion)

`exportSettlement` (Stufe 2) · `dorfLayout` (das Netz statt `strassengraph`) · `viertelWort` / `stadtRinge` (Kacheln) ·
`verkehrsNetz` (Tor ≠ Ende) · Wirt `_viertelInfo`, `_zellZeit`, `_dorfBereiten` (fest), `_dorfAkt` (ein Sprecher),
`_wegenetzNachbarn` · gate:settlement Z4 + Selbst-Test S (Summe, Erbe, zustandslos) und neu die Naht (Tore je Kante aus beiden
Richtungen gleich, Mutante: ein Tor aus dem Samen der KACHEL) · später die Ferne (Block-Massen aus Stufe 1).

## Annahme (vom Koordinator gesetzt)

Im echten Spiel, Welt ab dem Boot in 1920 × 1080, je Bild `r._schirm()` und `r._laubRand()`, am Kopf der Abgabe:
(1) EINE Straße über eine Kachel-Kante gegangen, das Bild AN der Kante: die Straße läuft durch, Häuser auf beiden Seiten, keine
Wiese, keine Mauer; (2) aus 90 m Höhe mindestens drei Kacheln als EIN Gewebe; (3) das Paar zu heute mit identischer Kamera
(Vorher: `bericht/1115-stadt-funktion/kern-rand-blick-viertel.png`, Kamera 476,5 / 140,7 / 446,1 → Blick −133,3 / 69,9 / 456,8).
Dazu: byte-gleich bis zur Wand (dieselben 12 ortPlan-Worte, 8 Exporte, die Rang-Welt 56fef038); Naht 10⁴ Paare Abstand 0;
Dichte an der Naht ≥ 0,8 × Mitte flach und am Grund; Stufe 1 ≤ 1 ms.

## Offen, beim Namen

- **Der Preis von Stufe 2 je Kachel (4,4–4,6 s kalt für 190 Häuser) liegt über der Kurve** (160 Häuser 2,3 s): die Kachel ist dichter
  bebaut, als ein Wort gleicher Zahl es heute ist, und ihr Export baut alle 36 Blöcke in einem Stück. „Je Block“ (≈ 125 ms) ist
  heute nur eine Rechnung — der Export je Block ist ein eigener Schnitt (Messname: Stufe 2 je Block, ms).
- **Die Höhe der Straße an der Kante**: jede Kachel legt ihren Erdbau selbst; ob die Fahrbahn an der Kante ohne Stufe weiterläuft,
  zeigt erst das Spiel (Messname: Sprung der Fahrbahn an der Kante, m).
- **Der Verkehr über die Kante** (Wagen fahren von Kachel zu Kachel) ist nicht Teil dieser Welle: das Tor ist kein Ende, aber noch
  keine Durchfahrt (PFLICHT-OFFEN C bleibt, wie sie steht).
- **„Steht, ehe es im Blick ist“** (Zug 3,3–3,6 Häuser/s; Erwachen 467 m gegen ~1100 m bei Wagen-Tempo) und **der Zug, der unter
  dem Spieler ohne Ende wartet** (`_dorfOffen` 1, 230 s): außer Scope, beides hängt an `_bauer` (Preis-Schwarm).

Geschnitten: nichts gelandet (Spike mit Kratz-Haken).
Gemessen: Naht 10 000 Paare Abstand 0 m; Dichte Naht/Mitte 1,02 flach, 1,00 am echten Grund (193–194 Häuser je Kachel, kein Verlust; heute 357 von 490 auf r 435 m); Stufe 1 0,146 ms; Stufe 2 4,4–4,6 s je Kachel.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
