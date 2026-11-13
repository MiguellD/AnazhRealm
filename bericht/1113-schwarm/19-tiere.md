# 19 Tiere: Gestalt, Fell, Herde, Verhalten

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- **Nah (2–5 m), Wolf und Reh, GTX 1050:** `KO/probe-post/w28-tiere-nach-bild/7-nach-12000.jpg`, `n8-zug-8000.jpg`. Der Wolf von hinten
  ist EIN glatter sandgoldener Körper wie aus Ton: kein Sattel, kein heller Bauch, keine Locke, kein Strich. Die drei Wölfe in n8
  sind gleichfarbig goldbraun. Das Reh (Hirschkuh, kein Geweih) wirkt mit langem Hals und orangem Leib wie ein Lama.
- **10 m, Gang-Bühne, Radeon e6f0cf7e:** `PM/punkte/messung/roh/e6f0cf7e-radeon/tiere.K3_2-gang.png`. Hirsch, Bär, Fuchs, Wolf im
  Profil, je drei Füße am Boden. Alle vier sind flach und facettiert, einfarbig: Hirsch orange, Bär braun wie ein Kasten, Wolf grau-braun.
  Kein Fell ist zu lesen, kein Muster.
- **8 m, Wolfsrevier, Radeon e6f0cf7e:** `.../e6f0cf7e-radeon/tiere.K2_2-wolfsrevier.png`. Drei Wölfe im hohen Gras, schokobraun und
  glatt wie Otter. Das Gesetz will Grauwolf mit cremeweißer Kehle.
- **46–55 m, Herde am Hang, Radeon ec281422 (heute):** `.../ec281422-radeon/tiere.K1_2-herde-1.png`. Ich sehe KEIN Tier, nur goldgelbes
  Gras und Wald. Erst die Maske (`...herde-1.maske.png`) zeigt fünf Striche bei x≈930–990, y≈530, je ~25 px hoch. Die Station urteilt
  GRÜN („5 sichtbar, 1 Fleck, 240 px").

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Wurzel SPIEL = `.claude/worktrees/leib-kanon-urteil` (main ec281422).
- **Das Fell-Gesetz kann viel.** Das Muster je Art liegt in `tetrapoda-core.js:3644-3706`: der Grauwolf mit Basis 146/132/112, Sattel 86/80/72
  und Bauch 214/204/184, der Rotfuchs, der Braunbär, der Hirsch im Sommerkleid mit Spiegel. `fellFarbe` (`:3806-3857`) färbt je Haut-Punkt
  Sattel, Bauch, Läufe, Maske und Spiegel. Die Schale `FELL_SCHALE` (`:3436-3455`) liefert Locke, Strich 9 und Unterwolle,
  `fellStreu` (`:929`) die Fell-Länge je Art. Alles steht als Daten.
- **Fell ist eine Bildschirm-Stufe:** `stamm/kreatur-verhalten.js:2838-2869` `_fellBildschirmGesetz`. Die Schalen zeichnen nur, solange
  ihre Höhe LOD_SCHIRM.px Bildpunkte trägt. Darunter „trägt die Haut mit FELL_LOOK" (`:2842`), Grobstufe und Satz sind kahl.
  Gemessen in haar.K5 (stand.json:1110): Fell an bei 2 m und 4,3 m, aus ab 14,2 m. Die Auflösung `aufloesung [0.5,1]` px blendet
  die Locke unter ½ Pixel auf den Mittelton (`tetrapoda-core.js:3432-3435`: „Am Third ist das Fell glatt"). Das ist Gebot 7 und
  richtig. Darum hängt das Bild jedes Tiers jenseits von ~5 m an der HAUT der Klasse `fell`.
- **Diese Haut glüht statt zu leuchten (die Wurzel):** `stamm/studio-stoff.js:361-551`. Für `fell` webt der Stoff FELL_LOOK.koerper
  als EMISSION: Rim pow4 ×0,5 in Gold [0,55·0,25·0,07], Sheen pow5 ×0,15 in Gold [0,45·0,25·0,08] und microFur-Glitzer
  (`:490-502`), dazu `mat.emissiveNode = add` (`:542`). Danach dunkelt der Wrap ·(0,5+0,5·N·V) die Mitte (`:545-551`). Für Strähne
  und Schale gilt dasselbe als Emission: Spitzen-Rim und Spec, ebenfalls Gold (`:483-486`).
  Die Daten stammen aus dem Labor-Wolf „wolf_aureus_v22" (`tetrapoda-core.js:3374-3411`), EINE Zeile für alle vier Arten. Grauwolf,
  Bär und Hirsch tragen also dasselbe goldene Leuchten, unabhängig von Sonne, Schatten und Nacht. Das passt zum Bild: der goldene
  Wolf, das Gold im Gras.
- **Der Zwilling:** das Menschen-Haar ist seit w25/w26 LICHT an der Faser. `stamm/studio-stoff.js:504-541` wählt
  `setupLightingModel = HaarLicht` (Kajiya-Kay) über die Tangente `aHaarT`. `_haarLichtModell` steht in `:43-100`, die Zahlen
  `HAAR_LOOK.kk` in `koerper-core.js:847-856`, und der Kommentar sagt „nie als Emission" (`studio-stoff.js:505`). Damit gilt für
  dieselbe Domäne (Haar, Fell) zweierlei: der Mensch trägt Licht, das Tier trägt Emission. Gebot 4 ist gebrochen.
- **Das Labor glüht ebenso:** `worlds/tetrapoda/tetrapoda.js:60, 98-104`. Es schreibt `totalEmissiveRadiance += Rim + Sheen + microFur`
  und zeigt damit dasselbe Gold. Labor = Welt hält, nur eben im Fehler.
- **Herde:** der Wurf liegt in `tetrapoda-core.js:289` (deer [3,7], wolf [3,6], Fuchs und Bär je 1). Der Bestand liegt in `:2000-2011`
  (revierM 113, kopfJeHa 25, ~5 Hirsche je Revier nach `:1997`). Der Verband: `_kreaturWurf` in `stamm/kreatur-leben.js:1845-1899`
  und `_bodenKlasseAt` in `:1681-1687`. Der Tier-Satz (`:3400-3410`, nahLeiber 4, Phasen 32) zeichnet jedes Tier jenseits der vier
  Bedeutendsten als Grobstufe mit den Senken Fell · Glimmen · Rest (`:2714-2722`).
- **Zoo am Prüfplatz (F):** `fachwerk-core.js:9640` trägt `gehege: { gattung: "wolf", n: 3, ruhe: [...] }`, `:9990-10000` reicht
  gattung, n und ruhe in den Plan. Der EINZIGE Stamm-Leser ist `stamm/siedlung-ort.js:2195`, und er liest nur `.rand` für die Bühne.
  Grep „gehege" in stamm/ ergibt 1 Treffer. Am Ort der Ankunft lebt also kein Tier.
- **Meisterkarte tiere = 8/10** (stand.json:4066-4214): K1 1 · K2 2 · K3 2 · K4 2 · K5 1. Der K1#2 Radeon ist an ec281422 GRÜN,
  frisch und in 1,28 min (messung/ec281422-radeon.json:1431); K1#2 GTX ist ungemessen („GPU-Schloss nie bekommen"). haar.K1 = 1/2,
  und #2 hat keine Station (bericht/1113-kurs-B-meisterkarte.md:173).

## Die EINE begrenzende Entscheidung
**Fell ist Licht, nie Emission.** Fell bekommt EIN Lichtmodell mit dem Haar des Menschen, nämlich Kajiya-Kay an der Faser über
`_haarLichtModell`. Die goldene Aureus-Emission (Rim, Sheen, microFur, Spitzen-Rim, Spec) fällt für alle vier Arten und alle drei
Fell-Stoffe. Die Farbe kommt nur noch aus `fellFarbe` (Muster der Art), der Glanz aus Sonne und Himmel am Ort.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Stufen, alle in einer Welle:**
1. Die Haut `fell` an L0, an der kahlen Grobstufe L1 und an der Satz-Senke „Fell".
2. Die Schale `fellSchale`. Ihre Tangente ist der Kamm, den der Shader schon rechnet (`studio-stoff.js:413-415`, `kd`).
3. Die Strähne `straehne*`.
4. Das Labor in GLSL, damit Labor = Welt bleibt.

Die Tangente der Haut kommt als additives Attribut aus dem Ofen: die Legerichtung Kopf→Rute und Lauf abwärts, wie `aHaarT` beim
Menschen. Nah und fern trägt dann derselbe Ton. Das ist die Staffel 2 von haar.K1, „L0 bis Karte ohne Ton-Sprung".

**Leser-Liste (vor dem Schnitt, kommt in den Commit):**
- `tetrapoda-core.js:3382-3411` FELL_LOOK: die Gold-Terme fallen, eine Licht-Zeile `kk` je Fell kommt (Form wie
  `koerper-core.js:847-856`); Export `:4985`
- `stamm/studio-stoff.js:361-551`: der Zweig `klasseLook` für fell, fellSchale und straehne geht auf `setupLightingModel` (Muster `:537-541`,
  Cache-Schlüssel `|fellLicht`); Emission `:542` und Wrap `:545-551` fallen für Fell
- `stamm/studio-stoff.js:43-100` `_haarLichtModell`: das EINE Modell, bekommt eine Faser für Fell
- `foundry-core.js:7925, 7965, 8187-8188, 8501` (`__tierFellSchalen`, Klassen der Haut): das Tangenten-Attribut der Haut, additiv
- `worlds/tetrapoda/tetrapoda.js:60, 72-104` (`laborStoff`): die Emission fällt, dasselbe Modell kommt in GLSL
- `foundry-bruecke.js:630` (die Weber-Namen) · `stamm/koerper-leib.js:1414` (Kommentar) · `stamm/kreatur-verhalten.js:2842` (der Satz
  „Haut mit FELL_LOOK")
- `welt-licht.js:1019` (Ausnahme `fellSchale`, nicht gelesen, was sie tut) · `stamm/kreatur-leben.js:2714-2722` (Satz-Senke Fell)

**Kosten-Zeile:** Es ist ein Ersatz, kein Zwilling. Die Zahl der Programme je Fell-Klasse bleibt gleich (ein Schlüssel ersetzt einen),
also kein neues Programm vor dem Bild, B bleibt eine Kosten-Zeile. Die Rechenlast wächst nur auf Tier-Pixeln: Sichtungen 200–2 000 px
(stand.json:4207), der Wolf nah bis ~5 % des Bilds. Nicht gemessen. Zu messen sind Frame p95 Wiese Ego/Third und Bild − Renderer,
vorher ↔ nachher am selben Kopf.

**Kriterien:**
- `haar.K1`: Ist 1/2 ↔ Soll 2 („jede Gattung, L0 bis Karte ohne Ton-Sprung, beide Geräte"); #2 hat keine Station
  (src/g2.js:367)
- `tiere.K3#2`: das Gang-Bild aus 10 m bleibt GRÜN, dient als Bildpaar-Station (Radeon e6f0cf7e, GTX 6aa7a5a6)
- Pflicht A: die Klasse fell der Soll-Tafel (`spec/abnahme/soll-tafel.json`, Soll nicht gelesen)
- `material.K1`: die Albedo des Fells (Zweige `w24-linse-fell`, `w24-rueckfall-fell`), nicht gelesen

**Bildpaar an fester Kamera, Mittag UND unter Bäumen im Schatten (Emission leuchtet im Schatten):**
(a) die Gang-Bühne aus 10 m (Rezept tiere.K3#2) · (b) der Wolf auf 2–3 m (`tiere-im-blick.js` aus w28-tiere-nach-bild) · (c) die Herde
am Hang auf 46 m (tiere.K1#2) · (d) dasselbe Tier im Labor.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Kein Zweig trägt das Fell-Licht. `haar-fell-soll` (c8da3754, 28.10.) liegt in main: Soll-Tafel fell am Strich.
  `w28-fell-programm` 5eb1f3c3 betrifft nur die Knochen-Klasse.
- Die Faser-Maschine liegt in main: `_haarLichtModell`, `haarAchse`, `aHaarT` (w25-haar-albedo, w26-haar-arm). Zu bauen sind nur die
  Fell-Faser und die Tangente der Haut.
- **Ein freier Punkt, kein Schnitt:** tiere.K1#2 ist an ec281422 Radeon GRÜN. Es fehlt EINE GTX-Fahrt der Station, dann 1 → 2.
- Heute gelandet: `w28-wesen-offen` fd14dbea (die Welt hält offen, solange Wesen ausstehen; GTX 1050 8 Tiere 18,5–22,1 s nach dem Bild)
  und `w28-tiere-nach-bild` 6d5449a3 (die Wiederkehr je Gattung, gezeichnet ab dem ersten Bild).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gemessen ist, dass das Gold im Bild aus der Emission kommt. Die Gegenprobe (FELL_LOOK `rimAmt`, `sheenAmt` und `microFur.amt`
  auf 0, gleiche Pose, ein Bild) steht als ERSTER Schritt des Arbeiters vor dem Schnitt aus. Die nahen Bilder sind Schnee-Wetter (gelbes Licht).
- Nicht gelesen: ob die Satz-Senke „Fell" durch denselben Weber `klasseLook` läuft · was `welt-licht.js:1019` tut · den Soll-Wert
  fell der Soll-Tafel · wie das Labor des koerperstudio Kajiya-Kay in GLSL trägt (Vorlage für tetrapoda).
- **Widerspruch Herde:** tiere.K5 Staffel 2 verlangt „Herde ≥ 20 im Bild in 30 min". Der Wurf wirft Hirsche zu 3–7 (`:289`),
  der Bestand hält ~5 je Revier, und K1(d) verlangt „fremde Verbände verschmelzen nie". Ein Verband ≥ 20 ist im Gesetz unmöglich.
  Der Schöpfer muss sagen, ob das Soll „Tiere im Bild" oder „ein Verband" heißt.
- **Station gegen Auge:** tiere.K1#2 urteilt GRÜN bei 5 × ~25 px auf 46–55 m, mein Auge findet die Herde im Bild nicht (herde-1.png).
- **Zoo (F):** das Gehege mit 3 Wölfen ist Daten ohne Leser (`fachwerk-core.js:9640`, `siedlung-ort.js:2195`). Am Prüfplatz lebt kein Tier.
- **Gestalt:** das Reh liest als Lama (Hals `lang: 1.7`, `tetrapoda-core.js:3698`); das Urteil von gate:tier-anatomie gegen
  ANATOMIE_SOLL (`:3716-3729`) habe ich nicht gelesen. Bär wie Kasten (gang.png): nicht nachgegangen.
- Die Kosten (Frame, Programme) des Schnitts sind nicht gemessen.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- **Fell ist Licht:** Wirkung 4, denn jedes Tier ändert sich in jedem Abstand und jedem Licht, und vier Arten bekommen ihre eigene
  Farbe. Aufwand M. Risiko: Kajiya-Kay auf der Haut braucht eine Tangente aus dem Ofen (foundry-core, nur additiv mit Byte-Beweis),
  und ohne Emission kann das Fell im Gegenlicht stumpfer werden. Das Bildpaar im Schatten richtet das.
- **Zoo bewohnt (F):** Wirkung 3, denn Tiere stehen dort, wo der Spieler ankommt. Aufwand S–M. Risiko: die Wölfe gehen durch
  `_kreaturWurf` und `_kreaturGrundFrei`, und die Geburt verbietet heute die Hülle eines Orts (`kreatur-leben.js:1828-1834`).
- **tiere.K1#2 an der GTX:** Wirkung 1 (ein Punkt, kein Bild). Aufwand S. Risiko: das GPU-Schloss.
