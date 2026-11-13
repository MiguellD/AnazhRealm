# 46 Meisterkarte Scheibe 6 (ferne · lod · schatten · tore) — die Station steht nicht, wo ihr Maß steht

Domänen alphabetisch aus `PM/meisterkarte-quelle/punkte/stand.json` (kopf ec281422, zeit 19:48Z), Index mod 8 = 5: ferne (5),
lod (13), schatten (21), tore (29). Gebucht 17/40 (ferne 6 · lod 3 · schatten 5 · tore 3), offen 23 Punkte in 16 Kriterien.
Seitdem: z427 karte-stamm in main (7f778d44 20:51), punkte-maschine f6d76563 bucht 221 am 7f778d44 (21:39).

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `BILD/dorf-main-0.5.png` (Dorf der Ankunft, Mittag): gleich hinter dem Platz steigt ein naher Grashügel bis an den Himmel —
  der ferne Kamm ist von hier aus nicht zu sehen. Die Laternen werfen lange, scharfe Sonnenschatten auf braunen Boden; die
  Bewohner tragen kleine Klecks-Schatten, beim Mann in Rot liegt er neben den Füßen. Der Hausschatten unten rechts ist ein
  blau-schwarz gesprenkelter Fleck. Der Himmel ist dunkel-marine.
- `BILD/ks/bild2/baum_fichte-heute-fern-fern44-voll.png` ↔ `…-schnitt-fern-fern44-voll.png` (Wiese, Waldrand): die fernen Kronen
  rechts haben gegen den Himmel einen Mosaik-Rand aus Blöcken und Sprenkeln (heute); im Schnitt (karte-stamm, jetzt in main)
  sind sie kompakter und weicher, der Rand bleibt verwischt-blockig statt blättrig. Das ist, was lod.K1 als „kante" misst.
- Für schatten.K3/K4/K5 und ferne.K3 an der Ankunft gibt es kein Bild: die Neun speichern ihre Schüsse nicht (Blatt 16 Z. 12).
- tore.K1: kein Bild gesehen; die Zahl sagt 45–168 schwarze Bilder je Durchgang (Ladeschirm, Luma 0,043).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Regel `punkte.cjs:4063`: #1 GRÜN an EINEM Gerät = 1 Punkt, #2 GRÜN an ALLEN = 2. Letzte Messungen aus `PM/…/messung/*.json`.
**Der Ort sprang:** PM ab71fe5be (13.11. 18:36, „der Ort wandert nie mit") stellt die Neun an die Ankunft [-704.2,-880] statt
[-840.7,-866.4] (Blatt 16 Z. 19–24; Ort „dorf" `spec/profiband/haushalt.json:123–129` mit `ortPose: platz`, gerechnet von
`stamm/siedlung-ort.js:742 _ortPose`). Kein Licht-Byte bewegte sich zwischen 1e00bfdb und ec281422 (Blatt 16 Z. 15–18).

| Id | geb. | was fehlt | Ist ↔ Soll (Gerät, Kopf) | Wurzel im Spiel / in der Station |
|---|---|---|---|---|
| ferne.K3 | 0/2 | #1 frisch ROT; #2 ohne Station | Ankunft: Kohärenz 0,2671 (<0,3 hält) über **29** Kamm-Spalten ↔ ≥ 100 (radeon ec281422); alter Ort 0,367 über 275 (dc9eacb0); GRÜN 0,202 bis 067bd771 | Dorf-Hügel deckt den Kamm (Bild); Stand der Probe `g3.js:1092–1105` (`kammStand`·`kammHoch` 25/60/120 m). Alter Ort: Kamm-Krone −16 m seit Merge 4f4b15a4 (`phyto-core.js:2911–2960`, Blatt 10 Z. 47–52) |
| ferne.K4 | 1/2 | #2 ohne Station | 0,1679 ≤ 0,4 frisch GRÜN (ec281422) | — |
| ferne.K5 | 1/2 | #2 ohne Station | 1595 m / 1508 m im Band 1500 ±15 % (radeon, gtx) | — |
| lod.K1 | 0/2 | #1 frisch ROT beide; #2 ohne Station | (a) Tafel-Pose „tanne fehlt (keine Gestalt binnen 1.5 m) · Sicht 0,0 %" an JEDEM Lauf (1cd1c408, dc9eacb0, a41ce72d, ec281422); (b) Spielgang fimp:strauch:L2 0,2710 (radeon ec281422) / 0,2757 (gtx a41ce72d), buche 0,2303 ↔ ≤ 0,22 | (a) **Station**: Tafel-Schritt `--ziel tanne` (`PM/stationen/g3.js:3023`) gegen das Werkzeug der Soll-Tafel `--ziel Blickziel` (`spec/abnahme/soll-tafel.json:743`). (b) Saum der Karte `phyto-core.js:4317 karteSaumSchluessel`; karte-stamm (a9b7a0d9 Rumpf) misst strauch 0,267/0,258, fichte Tafel 0,249 (alte Linse) — NEU ROT |
| lod.K2 | 1/2 | #2 ohne Station | 0,0474 %/s gehalten (c4010773); frisch 0,0597 (1cd1c408) ↔ ≤ 0,05, dann 0,0428 (dc9eacb0): Wackler am Soll | Karten-Wahl im Gang |
| lod.K3 | 1/2 | #2 kein Werkzeug | gtx 87537d3f GRÜN | Haus/Tor fern NUR-WURF, Wagen ohne Karte (`g3.js:3561–3571`) |
| lod.K4 | 1/2 | #2 ohne Station | Ankunft 1,66 % < 2 % GRÜN (ec281422); alter Ort 2,30 % / 3,37 % ROT; karte-stamm 1,53 % | `karteSaumSchluessel` :4340 trägt den Sprung (FUND „w28-laub-luma": phyto zurück → 0,02 %) |
| lod.K5 | 0/2 | #1 frisch ROT beide; #2 headless GRÜN gehalten (6aa7a5a6) | Baum 3,13 px · Tor 1,40 px · Haus 0,18 · Wagen 0,03 ↔ ≤ 1 px (radeon ec281422, gtx dc9eacb0) | Karte trägt Tiefe nur am Gitter `stamm/stoff-karte.js:2030 KARTE_GITTER` (`_relief` `stoff-material.js:1253`); Wechsel `vegetation-streu.js:2969 _wechselGesetz`. Hinausschieben: Mess-Wiese 328 283 → 685 079 Dreiecke (FUND 11.11.) |
| schatten.K2 | 1/2 | #2 ohne Station | radeon 0,00–0,03 % ≤ 0,5 % gehalten; ec281422 „ausgelassen am Budget 8,5 s" | — |
| schatten.K3 | 1/2 | #1 frisch ROT an der Ankunft | Fuß 93,4 % / Sockel 4,6 % ↔ 30–60 %, Sicht 0,9/0,6, Platz [-584.2,-964] = 146 m vom Ort (ec281422) | **Station**: Platz-Suche ±5 m um die Mitte (`g3.js:1234–1253`), nie über den Fußabdruck 4 × 4 m |
| schatten.K4 | 1/2 | #1 frisch ROT an der Ankunft | Gewinn 0,0 % (Wand 0,1849 = 0,1849), hubM 4,10, Boden 0,0981 ↔ ≥ 10 % | **Station**: Platte auf `M.y + max(hub)` (`g3.js:1202–1206`) schwebt 2,4 m über dem Auge (`g3.js:1195`); der Rückstrahl zählt nur Boden 0,5 m unter dem Auge (`stamm/bild-schatten.js:176–182`, `RUECKSTRAHL` :1670–1678) |
| schatten.K5 | 0/2 | #1 frisch ROT; #2 ohne Station | 0,22:1 an laterne_dorf 2,45 m, Lschatten 0,2115 > Llicht 0,0465, **Boden gesehen 0** (ec281422); 0,60:1 glutbrunnen (dc9eacb0); 5,28:1 GRÜN (350e6b11) ↔ ≥ 3:1 | Pose-Wahl `g3.js:1621–1655` nimmt eine Pose ohne gesehenen Boden; das Urteil `g3.js:2149` fragt `boden` nicht. Spiel: EINE Quelle wirft (`bild-schatten.js:464–497`, `LICHT_WURF` :1684–1693) — welche an der Pose warf, nicht gelesen |
| tore.K1 | 0/2 | #1 frisch ROT; #2 nicht gebaut | t 4253 / 10021 ms ↔ ≤ 2000, 45–168 Bilder schwarz, Frame max 553 ms ↔ 100, 2–3 Welt-Wechsel, „kein Tor nach d995146a in d995146a", „es hielt: 4 Programme des Bilds entstehen" (radeon ec281422) | Welt-Wechsel unter dem Ladeschirm + Programme je Welt (Pfad `g5.js:5077–5086`; die Tausch-Stelle im Spiel nicht gelesen) — Klasse B |
| tore.K2 / K4 | 0/2 je | keine Station (`g5.js:5820`) / unmessbar auf einem Gerät (`g5.js:5821`) | — (stehen nicht in `stand.json` je) | — |
| tore.K5 | 1/2 | #2 kein Werkzeug (`g5.js:5816`) | #1 headless 153 ms gehalten (78d37554); #2 zuletzt ROT Kontrolle 7 699 ms (radeon b3f9ae95) | B als eigener Browser neben A |

Bilanz: von 23 offenen Punkten haben **17 keine Station** (13× #2, tore.K2 und K4 je 2) — keine Messung bucht sie. Mit
bestehender #1-Station erreichbar sind **6**: ferne.K3 +1, lod.K1 +1, lod.K5 +2 (das #2 hält schon), schatten.K5 +1, tore.K1 +1.
Gefährdet: schatten.K3#1 und K4#1 (je 1 gebucht, frisch ROT, Buchung um 21:02 221 → 219 verweigert).
Das Gesetzbuch KANN Rückstrahl, GTAO-Kontakt, Feuer-Wurf, Kamm-Krone, Karten-Saum — die Welt konsumiert alle im Spielpfad
(Blatt 16 Z. 36–41); vier der sechs ROT dieser Scheibe sind Urteile über die Lage der Probe, nicht über diese Gesetze.

## Die EINE begrenzende Entscheidung
Die Ankunft ist der Messort (ab71fe5be bleibt, Kurs Punkt 7). Jede Probe dieser Scheibe steht dort, wo ihr eigenes Maß es
beschreibt — Körper auf dem GEZEICHNETEN Boden, Messpunkte auf GESEHENEM Boden, die Tafel-Pose mit dem Ziel der Soll-Tafel.
Soll, Schwelle und Urteil bleiben byte-gleich. Erst wenn die Station an der Ankunft ehrlich steht, zählt ein Spiel-Byte.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Klasse „die Station steht nicht, wo ihr Maß steht", alle Stufen in EINER Welle in `PM/stationen/g3.js`:
1. schatten.K4: Platte als Raster 16 × 16 m, jede Ecke auf `r._bodenSichtAt` + 0,04 (dieselbe Quelle wie K3 `sichtY` :1221) statt
   der Ebene auf `max(hub)` (:1203–1206); `platz()` prüft den Hang auch längs der Normalen bis 16 m (:1045).
2. schatten.K3: der Platz prüft Hang und Halm über den Fußabdruck des Sockels 4 × 4 m (:1234–1253), nah zuerst.
3. schatten.K5: die Pose-Wahl (:1654) nimmt zuerst eine Pose mit gesehenem Boden (wie K3 `sicht`), dann den Pfosten im Blick.
4. ferne.K3: der Stand des Auges (:1092–1105) wählt die Höhe über dem Hügel der Ankunft, bis ≥ 100 Kamm-Spalten im Band stehen —
   das Soll `kamm ≥ 100` (:2182) bleibt.
5. lod.K1: der Tafel-Schritt (:3023) trägt das Werkzeug der Soll-Tafel wörtlich (`--ziel Blickziel`, soll-tafel.json:743).
Leser-Liste: `g3.js:1185` (einziger Rufer von `platz`), :1198–1206, :1253, :1621–1655, :1092–1122 (`kammKrone`-Warten),
:3019–3029 (Folge lod.K1#1); Urteile :2099–2188 und `laubKanteUrteil` :654 unverändert; Selbsttest `neunProben` (:2105–2199) und
`laubKanteProben` :690 — je Stufe ein Fall „Probe neben ihrem Maß"; der Abdruck der Seite (NEUN-BRUCH bei neuem Hash).
Kosten-Zeile: 0 ms am Schirm (kein Spiel-Byte), Probe ≈ +0,1 s (256 Ecken), ferne.K3 höchstens eine Höhe mehr; nie an die
Weltgröße gebunden.
Kriterien: schatten.K4#1 radeon 0,0 % ↔ ≥ 10 % · schatten.K3#1 radeon 93,4/4,6 % ↔ 30–60 % · schatten.K5#1 0,22:1 ↔ ≥ 3:1 ·
ferne.K3#1 kamm 29 ↔ ≥ 100 · lod.K1#1 Tafel ohne Bild + strauch 0,271 ↔ ≤ 0,22. Abnahme: EINE Radeon-Fahrt `--offen` an
7f778d44, PM pusht nur auf SELBSTTEST GRÜN. Danach urteilt jedes dieser fünf über das Spiel — erst dann ist der Spiel-Schnitt
benennbar (lod.K1: Strauch-Saum `phyto-core.js:4317`; lod.K5: Karten-Relief, Kosten vor Punkt).
Fünf Punkte, die ein Bild-Schnitt nebenbei kippt: **lod.K1#1** (jeder Karten-Saum: karte-stamm hob fichte/tanne über 0,22) ·
**lod.K4#1** (dieselbe Karten-Wahl: 1,66 % am Ort, 3,37 % am alten) · **lod.K2#1** (Pop 0,0474 gegen 0,05 — jede Wiese/Baum-Arbeit)
· **schatten.K4#1** (Boden der Ankunft: `w28-weg-koerper` hebt oder senkt die Boden-Luma 0,098, die der Rückstrahl trägt) ·
**schatten.K5#1** (die Laternen des Dorfs: wer wirft, entscheidet der Wurf-Takt).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Stufen 1–2 als Vorschlag in Blatt 16 (kein Zweig). punkte-maschine f6d76563 (21:39), ab71fe5be (Ort), 191f0684a (Absturz =
  UNGEMESSEN). Fehlt: der Schnitt in g3.js, Selbsttest, eine Radeon-Fahrt.
- `w28-karte-stamm` 9597ffb2 GELANDET (z427, 7f778d44): Stamm/Rand der Gestalt; lod.K4 1,67 → 1,52 %, strauch 0,285 → 0,267.
- `w28-baum-wechsel` 37526fb7 (WIP, lod.K5, „nicht zur Landung", Dreiecke ×2) · `w28-baum-wechsel-pm` f7bceb09 (Station
  lod.K5#1 je Vorlage, NICHT in punkte-maschine). `w28-laub-luma` 8f62f28f geparkt (lod.K4 vs. lod.K1 buche 0,244).
  `w28-samen-karten-stufe` 5d6f899e (Befund: Saum erfunden statt Gestalt). `w28-karte-gestalt` 8e308c2b (hebt die Kante, keine Abgabe).
- tore.K1, ferne.K3, schatten.K5 im Spiel: kein Zweig.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- schatten.K5: warum Lschatten 0,2115 > Llicht 0,0465 und `boden` 0 an laterne_dorf — Pose oder Wurf, nicht gemessen.
- schatten.K3 Sockel 4,6 %: Hang allein oder ein Bewohner im Blick — ungemessen (die Schüsse werden nicht gespeichert).
- ferne.K3 am alten Ort: Mechanismus von 4f4b15a4 (Lichtung, Waldgrenze) nicht gemessen; ob ein Stand über dem Hügel an der
  Ankunft überhaupt ≥ 100 Spalten im Band 0,4–4 km trägt, nicht gemessen.
- lod.K1 nach z427: Zahlen der Station am 7f778d44 fehlen; ob Strauch und Fichte gemeinsam ≤ 0,22 kommen, widerspricht dem
  Befund der Karten-Stufe (Buche: Rand ≤ 0,22 und Fläche = Gestalt schließen sich aus).
- tore.K1: die Stelle des Welt-Tauschs im Spiel (`stamm/netz-portal.js`, `speicher-welten.js`) nicht gelesen; „kein Tor nach
  d995146a in d995146a" (Lauf #5) nicht erklärt.
- Die Staffel-2-Texte der 13 Kriterien ohne #2-Station nicht gelesen (nur `quelle` von lod.K3#2, lod.K5#2, tore.K5#2).
- Ob ab71fe5be auch andere Dorf-Stationen kippte: nicht geprüft.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Die Station an der Ankunft (Stufen 1–5): Takt 4 (hält 2 gebuchte, macht 3 Scheinurteile zu Urteilen, entsperrt lod.K1) · Bild 1 ·
  S · Risiko: zeigt die Platte auf dem Boden weiter 0 % Gewinn, ist der braune Ankunfts-Boden ein echtes ROT des Spiels (Boden-Kette).
- lod.K5 Baum ≤ 1 px: Wirkung 3 im Bild, +2 Punkte · L · Risiko: der Schnitt bezahlt in Dreiecken, was die Karte nicht trägt.
- tore.K1: Takt 3 · L · Risiko: es ist die Ankunft-Klasse B im Kleinen, kein eigener Schnitt.
