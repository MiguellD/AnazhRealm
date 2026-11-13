# 13 Wald von innen, Unterholz, Streu

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/wiese-mitte/heute-wiese.png` (Ego, Mittag, Wiese an der Ankunft, Blick auf den Waldrand): die Wiese läuft ohne Saum
  UNTER die Kronen. Die Stämme stehen als dünne schwarze Stangen. Zwischen den Stämmen sieht man weit durch, eine Halle ohne
  Strauchmantel. Am Boden unter dem Dach steht dasselbe Gras wie auf der offenen Wiese, nur dunkler. Ich sehe keinen Farn, kein
  liegendes Holz und keine braune Streu. Links vorn stehen zwei kleine Büsche, verloren.
- `scratchpad/wiese-mitte/oben-heute-huegel.png` (vom Hügel): die Schatten der Kronen liegen als dunkle Flecken auf einem
  durchgehenden Grasteppich. Unter den Bäumen ist der Grund Gras, kein Waldboden, und die Kante zwischen Wiese und Wald ist nur
  ein Helligkeitswechsel.
- Ein Bild aus dem Inneren des Walds habe ich nicht gesehen: es gibt keins von heute, und die Station vegetation.K3 schießt nichts
  ins Register.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- **Fünf Erzeuger für Unterwuchs, drei Lichter.** Alle Pfade unter SPIEL = `.claude/worktrees/leib-kanon-urteil`:
  1. Nah-Wiese (Gras): `_bodenLichtFeld` → Kern `groundCover(L).grass`, `stamm/vegetation-wiese.js:125,167-172`.
  2. Nah-Streu (Farn · Gestrüpp · Blume · Totstamm · Stumpf · Geröll nach dem Boden-Gesetz `foundry-core.js:710-779`):
     `_bodenLichtFeld`, `vegetation-wiese.js:1824,1842-1852`. Reichweite nur `NAH_STREU.radius` 24 m + Rand 5
     (`vegetation-wiese.js:1735`).
  3. Strauch-Teppich (busch_hazel auf einem 4,4-m-Raster, echte Einträge): liest das PLATZIERUNGS-Feld `_canopyLightAt`
     (`vegetation-baum.js:1343`, Formel `vegetation-wiese.js:2969-2995`, also wo Wald stehen DARF, nicht wo Kronen stehen). Die
     Chance ist eine Inline-Kopie von `groundCover.shrub` (`vegetation-baum.js:1345-1353` gegen `foundry-core.js:3111`).
  4. Busch-Unterwurf in `_vegetationSampleSpawn` (farn_busch/blume_gross/busch_hazel): `lebendig × meadowF`, ohne Licht
     (`vegetation-baum.js:1614-1660`).
  5. Streu-Schicht „under“ (dieselben drei Arten): `lebendig`/`moisture`, ohne Licht (`vegetation-streu.js:222-226`).
     Gilt erst ab `innerM` 64 m (`phyto-core.js:6559`). Cap 40 je 256-m-Region (`siedlung-instanz.js:1283`), also ≈ 6 je ha.
- **Zwillinge.** Die Arten-Tafel nass/lebendig/sonst steht zweimal (`vegetation-baum.js:1628-1630`, `vegetation-streu.js:223-225`).
  Das Bodenlicht-Gesetz steht zweimal ohne Kern: Labor-Literale `worlds/terrain/phytogenesis.js:1450-1455` (1,15 · q < 6 · 0,85)
  und Host `AnazhRealm.UNDERGROWTH` `vegetation-wiese.js:3712-3716`.
- **Ring-Loch.** Farn und Gestrüpp enden bei 29 m, die Streu beginnt bei 64 m. Dazwischen tragen nur Bäume, Strauch-Teppich und
  Busch-Unterwurf den Boden, und zwei davon sehen kein Licht.
- **Die Helligkeit des Gesetzes.** Unter der Mitte einer Krone ist L = exp(−0,85) = 0,43, und dort wächst Gras zu 52 %
  (`vegetation-wiese.js:165-166`, `foundry-core.js:3107-3109`). Im Mischwald sinkt L auf 0,57 (`foundry-core.js:713-714`). Das
  Gesetz KANN Waldboden: Farn als Schattenart mit Band 0,04–0,72, Laubstreu als Boden-Farbe (`siedlung-wege.js:1896`
  `LAUB_STREU` dichte 0,6). Die Welt KONSUMIERT stattdessen Gras unter den Kronen (die beiden Bilder oben).
- **Ökologie hängt am selben Licht.** `_wuchsAt` = Wasser × Nährstoff × `_bodenLichtFeld` (`vegetation-wiese.js:2566-2571`).
  oekologie.K1–K5 stehen je auf 2 Punkten, headless, gehalten an d3708675 (`pm/punkte/stand.json:2472-2611`).
- **Messung K3** (Station `pm/punkte/stationen/g3.js:1784-1908,2221-2237`, REF `spec/abnahme/real-mischwald.json`):
  - 4d52c7bc (12.11.): 294 Stämme/ha (Soll 370–900), 13 je Bildbreite (Soll 14–34), Deckung 0,3019 (Soll 0,25–0,78),
    Flecken-CV 1,17 gegen offen 0,82 (Soll ≥ 2 × offen), wandern 0,7995 → ROT.
  - Ab 350e6b11 steht der Messort bei (−704, −880) statt (−841, −861), also 137 m weiter. Dort: 24 Stämme/ha, 0 Unterstand,
    Deckung 0,0293.
  - ec281422: „ausgelassen am Budget 8.5 s: schatten.K2, vegetation.K3“ (`roh/ec281422-radeon/vegetation.K3_1.out:70`).
  - Grund für die 24/ha: der Dorfrand schließt den Wald aus. Reichweite 30 + 22·√42 ≈ 173 m plus Saum 40 m
    (`phyto-core.js:2949-2959,2920`), die Station sucht aber nur ±60 m (`waldSuchM` 60).

## Die EINE begrenzende Entscheidung
Unterwuchs wächst nach EINEM Licht, dem Licht der Kronen des Bestands, und durch EIN Gesetz im Kern (`groundCover` +
`bodenGewicht`). Jeder Erzeuger, der kein Licht liest, fällt. Darum endet heute die Wiese nicht am Wald: Gras, Strauch und Farn
fragen drei verschiedene Lichter, und zwei Strauch-Wege kennen gar keins.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Stufen (eine Welle):**
1. phyto-core `bodenLicht(kronen)(x,z)` als EINE Formel. σ 1,15, qMax 6 und canopyK 0,85 bleiben byte-gleich (keine Zahl
   bewegt). Das Labor `canopyLight` (`phytogenesis.js:1430-1457`) und der Host `_bodenLichtFeld` (`vegetation-wiese.js:43-73`)
   lesen sie; `UNDERGROWTH` (`:3712`) fällt.
2. Der Strauch-Teppich liest `bodenLicht` über die Kronen des Bestands-Plans. Das sind die Darts der Zellen ±`WALD_PLAN.reich`,
   die `_waldPlanKasten` vor dem Pflanzen hält (`vegetation-baum.js:1252-1258`). Die Chance kommt aus
   `__terrainCore.groundCover(L).shrub` (`foundry-core.js:3111`); die Inline-Kopie (`vegetation-baum.js:1345-1353`) fällt.
   `_canopyLightAt` (`vegetation-wiese.js:2963-2995`) fällt ganz.
3. Der Busch-Unterwurf (`vegetation-baum.js:1610-1660+`) und die Streu-Schicht „under“ (`siedlung-instanz.js:1278-1290`,
   `vegetation-streu.js:222-226`) fallen. `SAAT_BUSCH` (`vegetation-baum.js:3284`) behält nur den Strauch des Teppichs; die
   Arten-Zwillingstafel stirbt mit.

**Leser-Liste (wer liest, was sich ändert):**
- `vegetation-wiese.js:125,1036,1824,2571`: Wiese nah, Wiese fern, Nah-Streu, Wuchs. Byte-gleich, solange die Formel gleich bleibt.
- `vegetation-baum.js:1343`: der Strauch-Teppich. Er ändert sich: Sträucher wandern vom Platzierungs-Feld an die echten Kronen.
- `scripts/diag-stand-takt.cjs:598,621` liest `_canopyLightAt < 0.6` als Ortswahl und muss auf `_bodenLichtFeld` umziehen.
- `scripts/diag-altlasten.cjs:515-518` führt `_canopyLightAt` schon als Altlast; die Zeilen bleiben als Wand.
- `scripts/playtest/vegetation.cjs:1778-1783` (M4 „alle 3 Schichten“) wird zu zwei Schichten, weil die Schicht fällt.
  Das ist kein Soll.
- `vegetation-streu.js:2339-2365` (die Saat bestellt `SAAT_BUSCH`).
- `stamm/speicher-laden.js:390` und `vegetation-streu.js:131-150` (`scatterCounters.under`).
- `pm/punkte/stationen/g3.js:1854`: K3 zählt `busch_`/`strauch` als Deckung (straeuchR 0,73).

**Kosten-Zeile:**
- Pro Bild nichts. Die Kosten fallen beim Pflanzen an: je Strauch-Punkt die Summe über die Plan-Kronen der Nachbarzellen statt
  `_placementStandAt` + Feuchte.
- Zu messen am Kopf gegen den Kopf, an der GTX kalt: die Zeit des Haupt-Fadens in `_forestPlantChunk` bis zum Weltbild (Pflicht B).
- Die Schicht „under“ fällt: weniger Instanzen und Deko-Gruppen jenseits 64 m. Zählen mit `werkbank zaehlen` (Draw-Calls und
  Dreiecke am Dorf).
- Kein Ring wird größer.

**Kriterien:**
- vegetation.K3#1 (Radeon, Station DIE NEUN `g3.js:2221`). Ist 0/2: 24 Stämme/ha und Deckung 0,0293 am Messort, an ec281422
  ungemessen. Soll: 370–900 Stämme/ha · 14–34 je Bildbreite · Deckung 0,25–0,78 · Flecken ≥ 2 × offen.
- vegetation.K1 (Saum/LAI, 0, ungemessen) als Nachbar: der Saum darf nicht dünner werden.
- oekologie.K1–K5 (je 2, headless) halten, weil das Licht byte-gleich bleibt.
- **Bildpaar** an fester Kamera: Dorf → Waldrand aus Auge, Hügel und Dach (die Posen von `heute-wiese` und `oben-heute-huegel`).
  Soll im Bild: ein Strauchmantel an der Kante, kein Busch auf der offenen Wiese.
- **Zahl:** Sträucher mit L ≥ 0,9 (offen) gegen L ≤ 0,5 (unter Kronen) im Umkreis 250 m der Ankunft, vorher und nachher.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- In main: w16-wald-innen 846320dc (Schicht des Bestands, Farn 36 je 100 m² für K3), w20/heim3-wald-kosten f5283f22
  (Dorfrand-Saum, Unterstand 247 → 36 je ha, `phyto-core.js:2894-2897`), w28-wald-saum 7aa4802d.
- w27-wald-saum 9fbb60af: WIP, nicht in main, `diff --stat` gegen main leer. Der Befund steht nur im Rumpf („die Lichtung bewegt
  den Saum“).
- Für den Schnitt hier gibt es keinen Zweig. Bis zur Landung fehlt alles: Spike mit drei Fällen (offen · Krone · geschlossener
  Bestand), Bildpaar, Leser-Commit.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- **Nicht gelesen:** `_placementStandAt` (ob der Dorfrand-Saum dort wirkt); wie viele Plan-Darts ein Strauch-Punkt fragt (die
  Zellgröße von FOREST); der Rest von `_vegetationSampleSpawn` (ob Bäume ohne Wald dort Büsche als Wiesen-Akzent brauchen); die
  Shader-Ferne der Wiese (`:1036`).
- **Nicht gemessen:** wie viele Sträucher heute auf offener Wiese stehen. Ich vermute es (Platzierungs-Feld bei vom Dorf
  geräumtem Wald), das Bild zeigt es nicht sicher.
- **Widerspruch Helligkeit:** L 0,43 unter der Mitte einer Krone ist heller als ein geschlossenes Buchendach (real 2–10 %).
  Gras zu 52 % unter Bäumen ist das, was die Bilder zeigen. Das Licht dunkler zu stellen gehört NICHT in diesen Schnitt, weil es
  die Bänder von Farn, Blume und Gras und die Ökologie mitbewegt. Erst muss die eine Formel stehen, dann folgt eine eigene Messung.
- **K3 bleibt am Ankunftsort ROT, egal was hier geschieht:** die Station findet im Umkreis ±60 m keinen Wald (Dorfrand ≈ 173 m),
  und am Kopf fiel sie dem Budget 8,5 s zum Opfer. Das sind Ort und Budget der Station, kein Soll; dieses Blatt bewegt sie nicht.
- Für Strahlen im Gegenlicht (K3 Staffel 2) gibt es kein Gesetz (`g2.js:6066`).

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- **Wirkung 3:** der Waldrand vom Dorf bekommt einen Mantel, die offene Wiese verliert ihre verirrten Büsche, und es ist ein
  G4-Schnitt (drei Lichter → eins, zwei Arten-Tafeln → eine).
- **Aufwand M.**
- **Risiko:** fallen Busch-Unterwurf und Schicht „under“, kann der Wiese fern der Bäume ein Akzent fehlen, den heute niemand
  gemessen hat. Darum entscheidet das Bildpaar aus drei Höhen vor der Abgabe, nicht eine Linse.
