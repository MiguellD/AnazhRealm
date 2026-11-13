# 02 Das Kleid am Leib: Poncho, Oberteile, Saum, Schuh

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- main, Dorf der Ankunft (`scratchpad/genom-spiel/eng-rot.png`, `probe-post/w28-leib-nah/1-heute-poncho.jpg`): zwei Bewohner von hinten,
  rot und weiß. Der Oberkörper ist ein aufgeblasener Sack: Kugel-Schultern, die bis zum Ellbogen reichen, kein Hals-Ausschnitt. An Achsel
  und Flanke hängt der Stoff in Fetzen, durch die die Haut des Arms sticht. Darunter Shorts (sand, burgund), barfuß.
- main frontal (`scratchpad/genom-spiel/frontal.png`): der sandfarbene Träger hat dieselbe Ballon-Brust, an beiden Achseln stehen Zipfel ab.
  Alle im Bild sind barfuß; links ein Bewohner im Schritt, die Füße sichtbar über dem Boden.
- Kandidat `w28-leib-nah` (`probe-post/w28-leib-nah/7-paar-nah-heute-kandidat.jpg`, rechte Hälfte; `10-poncho-vorn-hinten.jpg`):
  keine Fetzen mehr, der Hals ist frei, Ärmel enden mit Kante, der Saum ist EINE waagrechte Linie über der Hose. Das rote „Poncho“ ist
  eine weite, kurzärmelige Tunika. Der Stoff ist glatt wie Kunststoff: keine Falte unter der Achsel, keine am Saum, keine Dicke am Rand.
- `8-paar-10m-heute-kandidat.jpg` (Satz der Menge, 10 m): links eckige Blöcke mit Knick am Rücken, rechts lesbares Hemd mit Ärmel.
  `13-grobstufe-poncho-hemd.jpg`: die Grobstufe zeigt im Kandidaten dieselbe Linie wie die feine.
- `12-pullover-vorn-hinten.jpg` (Kandidat): Pullover mit langem Ärmel liest gut. Die Schulter-Kappe ist weiterhin zu rund.
  Rechts hinten schwebt ein Bewohner sichtbar über dem Weg.
- Einen Schuh habe ich in keinem Bild gesehen: das Dorf der Ankunft trägt die Tracht `antike`.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- Die Tracht am Dorf ist `antike`: `top:'poncho', bottom:'shorts', shoes:'none'`, Farben white/sand/burgundy/red
  (fachwerk-core.js:3287). Leser: `_bewohnerTracht` (stamm/siedlung-bewohner.js:313–317), Nah-Gestalten :255 und Menge :301.
  Die Farben im Bild passen genau dazu, deshalb sind alle barfuß. Das ist Gesetz und kein Fehler im Ofen.
- main, die Quelle des Kleids: `kleidZonen` (koerper-core.js:212–305). Hemd und Pullover haben `dicke 0.032` (Stoff aus der Haut). Der
  Poncho hat `dicke 0` (koerper-core.js:254) und landet deshalb in `backeHuelle` (foundry-core.js:9181, Aufruf :9355): Voxel-Feld über den
  Teil-Kugeln, `abstand 0.12` E (~3,5 cm rundum, :247), danach `__stoffErbtHaut` (:9364). Daher kommen Ballon und Fetzen.
- Der Poncho trägt Ärmel: deltoid + Oberarm 0..3 (koerper-core.js:230–233). Damit ist er im Gesetz eine Tunika und kein Umhang.
- Der Schuh ist die LETZTE Kleid-Hülle: `teile ['ankle1','ankle-1']`, `inflate 1.12`, `abstand 0.05`, `sohle:true`
  (koerper-core.js:290–302) → `backeHuelle` + Sohlen-Pressung (foundry-core.js:9359, :9431–9460). Darunter liegt die Fuß-Haut
  (`fussHaut`, foundry-core.js:9792–9815), die beim Schuh ausfällt (`__imKleid`, :9361 / :9801). Die EINE Leib-Haut lässt Hand und
  Fuß aus (foundry-core.js:7351).
- Was die Welt vom Stoff verbraucht: `webe` → Farb-Rauschen im Shader (stamm/studio-stoff.js:570–578, `koerper:WEBE`), `rough` je Schnitt
  (koerper-core.js:248). Normale, Glanz oder Falte liest kein Leser. Der Tuch-Löser läuft zur Laufzeit auf jedem `__seh==="stoff"`-Mesh
  in der Nähe (stamm/koerper-fahrt.js:160–260, Wahl :269–285) und drapiert einmal je Vorlage (stamm/koerper-leib.js:437–453). Er bewegt
  das Tuch, eine Falte im Ruhebild erzeugt er nicht (im Kandidatenbild ist keine zu sehen).
- Der Zweig `w28-leib-nah` (ace30e73, Diff 6 Dateien +389/−191) schneidet die Oberteile an der Wurzel. `kleidZonen` bekommt
  `saum`/`bund`/`weite`/`reicht`. Der Poncho wird `dicke 0.05` + Weite bis 0,2 E um `neckBase`. `__stoffAusHaut` schneidet an waagrechten
  Linien, `__stoffSpannt` spannt den weiten Stoff. Wegfallen `__stoffErbtHaut`, `erbt`, `MENSCH_MENGE.fall`, `ARM_RUHE.faelltAb/.ueber`.
  Neu sind `kleidUrteil` + `KLEID_SOLL` (Diff koerper-core.js um :3104). Der Zweig-Rumpf (ace30e73) führt die Leser-Liste mit 10 Lesern.
- Gemessen am Zweig (erwachen/gtx1050-2026-11-13.md, Ofen L0 Ruhe): Saum des Hemds 2 Ringe σ 0,25 → 1 Ring σ 0,009 E · Bund σ 0,036 →
  0,003 · Hose über dem Hemd 57 → 0 Ecken (Poncho 46 → 0) · Poncho-Saum 1,38 × Hemd (Menge 1,12). Kosten am Dorf (GTX 1050)
  Frame p50 16,69 → 16,68 ms, GPU 1,08 → 1,03 ms, Befehle 95 → 96, Dreiecke 492 889 → 495 464 (+0,5 %).

## Die EINE begrenzende Entscheidung
Das Kleid hat EINE Quelle für seine Gestalt: die gehobene Haut (`__stoffAusHaut`, Region + Linien + Hebung). `backeHuelle` stirbt als
Weg für das Kleid ganz: zuerst landet der Poncho (w28-leib-nah, liegt), in derselben Welle folgt der Schuh als Stoff aus der Fuß-Haut,
mit der Sohle als Linie. Ein Kleid, das die Haut nicht tragen kann (Umhang über dem Arm), gibt es nicht. Der Schnitt `poncho` heißt,
was er ist (Tunika), und wird an Länge und Weite erkannt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen (alle in einer Welle):
1. Oberteil · Hose · Unterhose, Stufe 0 (fein) und 1 (grob): w28-leib-nah ace30e73 landen, nichts dazubauen.
2. Menge (Stufe 2/3): Weite im Satz (`__mengenPrims`, Zweig ~foundry-core.js:7127), liegt im Zweig.
3. Schuh, Stufe 0/1: Zone `ankle` → Stoff aus der Fuß-Haut. `fussHaut` (foundry-core.js:9798) wird VOR den Kleid-Zonen gegossen. Die
   Schuh-Zone hebt sie um `dicke`, der Schaft endet an einer waagrechten Linie über dem Knöchel (die `saum`-Mechanik des Zweigs), die
   Sohle ist die Linie unten (statt der Pressung :9431–9460). `backeHuelle` hat danach im Kleid keinen Rufer mehr (Absenz-Grep
   `backeHuelle(` in den Kleid-Zonen = 0).
4. Schuh in der Menge: `z.sohle`-Zweig in `__mengenPrims` (main foundry-core.js:7089–7092) auf `dicke` statt `abstand`.
Leser-Liste (vor dem Schnitt, für den Schuh; die Oberteile stehen im Rumpf von ace30e73):
- koerper-core.js:285–303 `kleidZonen` shoes (Quelle) · foundry-core.js:9273/:9359 `sohlen` · :9431–9460 Sohlen-Pressung
- foundry-core.js:9361 `__imKleid` · :9801–9805 Fuß-Haut fällt im Schuh · :7351 Leib-Haut ohne ankle
- foundry-core.js:7029 + :7089 Menge-Zone des Schuhs · koerper-core.js:4488 `armAnlage` (liest `__lage`, Schuh nicht am Rumpf)
- stamm/koerper-fahrt.js:269–285 `_tuchTeileVon`: der Schuh ist `__seh "stoff"` und kommt so in den Tuch-Löser (Wirkung nicht gelesen)
- fachwerk-core.js:3288–3295 (die Trachten mit boot/sneaker: mittelalter, hanse, barock, gruenderzeit, alpin, mediterran, moderne)
Kosten-Zeile: Oberteile gemessen neutral (oben). Für den Schuh fallen ein Voxel-Feld (vox 0,06) und der Kollaps je Fuß weg. Die Fuß-Haut
gießt er dann in jeder Tracht, also kommen Dreiecke hinzu. Die Zahl je Leib bleibt unter dem Budget 40 000/14 000 (gemessen am Zweig
39 992/13 997, sehr eng). Gemessen wird am Dorf auf der GTX 1050 mit `lauf 15`, Kandidat gegen heute.
Kriterien:
- haar.K4#1 headless gehalten: „der Schnitt allein 16,6 % (≥ 5 %)“, gemessen mittelalter poncho ↔ moderne tshirt. Am neuen Poncho nicht
  gemessen. Rückt der Poncho ans Hemd heran, fällt die Zahl.
- haar.K4#2 headless gehalten: Tuch „poncho/pants 8245/2877 Tuch-Ecken · Durchdringung 0“ → die Zahl der Ecken ändert sich, Durchdringung bleibt 0.
- mensch.K4#2 headless: „Leib/Wurf je Typ 1700/360“ → unverändert (der Zweig misst 1 700/360).
- leib.K2#1/#2 radeon+gtx gehalten: Fuß cm p95 (hang 1,2–1,4) → die neue Sohle darf ihn nicht heben.
- mensch.K4#1 gtx ungemessen (Schloss), radeon gehalten · PFLICHT-OFFEN A (AAAA je Klasse).
Bildpaar: Dorf der Ankunft, vorn und hinten ≤ 3 m, dazu EINE Tracht mit Schuh (mittelalter: poncho/pants/boot), feste Kamera.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-leib-nah` **ace30e73** auf origin (main ec281422 eingemischt, Baum sauber, kein Abgabe-Kopf). Bilder 1–13 in
  `probe-post/w28-leib-nah/`. Am gemischten Kopf liefen die Tore beim Sichern noch, das Ergebnis ist nicht gelesen. `check` war vor
  c45b1126 ROT (ZITAT-WAND CONTRACT.md:63) und ist danach nicht neu gelesen (erwachen/gtx1050-2026-11-13.md).
- Bis zur Landung fehlt: die lokale Tor-Liste am Kopf, dann ein leerer Abgabe-Commit (Text steht wörtlich im Erwachen-Blatt) mit
  `[gpu-probe: bild:dorf@0.5, gate:kamera-leib:echt, gate:tier-gang] [ci voll]`.
- Zum Schuh liegt nichts. Die Mechanik (Linie, Hebung, `unter`) steht im Zweig und kann so übernommen werden.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht gelesen: `scripts/diag-mensch-anatomie.cjs` KL1–KL5 · `TUCH_GESETZ.webe` für leather/rubber · ob der Tuch-Löser den
  Schuh-Stoff wirklich simuliert · `__huelleAusFeld` · der Plan, der dem Dorf `antike` gibt (nur über die Farben im Bild geschlossen).
- Nicht gemessen: haar.K4#1 am neuen Poncho · die Dreiecke einer Fuß-Haut im Schuh · `gate:kamera-leib:echt` K6 kippt auf der GTX 1050
  am baum-gleichen Kopf (UEBERGABE §6), Ursache unbenannt.
- Falte: es gibt kein Gesetz für die Ruhe-Falte. `__stoffSpannt`/Laplace glätten sie aus Absicht, der Tuch-Löser bewegt nur. AAAA-Falte
  (Achsel, Bund, Ellbogen) ist eine eigene Stufe und gehört nicht in diesen Schnitt.
- Saum ohne Dicke: der Rand ist eine einzelne Fläche ohne Umschlag. Im Bild 13 fällt das auf 3 m nicht auf.
- Widerspruch: `poncho` trägt Ärmel (koerper-core.js:230) und ist damit eine Tunika. Der Arbeiter der GTX 1050 sagt dasselbe („liest als
  weite Tunika“). Ein echter Umhang über dem Arm kommt aus der Haut nicht. Für `antike` ist die Tunika das historisch richtige Bild.
- Barfuß am Dorf ist Gesetz der Epoche (fachwerk-core.js:3287). Ob `antike` Sandalen tragen soll, entscheidet das Gesetzbuch und nicht
  der Ofen. Mit dem Schuh als Sohlen-Linie wäre eine Sandale ein Schnitt mit einer Zeile.
- Schweben eines Gehenden: die Wurzel liegt 46–52 cm über dem Gesetz-Boden (Erwachen-Blatt), ungeklärt. Das ist nicht Kleid, ich
  nenne es hier nur, weil es im Bild 12 zu sehen ist.
- Die Ballon-Schulter unter Hemd und Pullover gehört zum LEIB (halbe Breite der Haut 25,4 cm, Stoff 0,9 cm darüber) und nicht zum Kleid.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Oberteile landen (w28-leib-nah): Wirkung **5** (jeder Bewohner bei jeder Ankunft, Ballon und Fetzen weg) · Aufwand **S** · Risiko:
  haar.K4#1 kann unter 5 % fallen, wenn Poncho und Hemd zu ähnlich werden — vor der Abgabe headless messen.
- Schuh aus der Fuß-Haut: Wirkung **3** (am Dorf der Ankunft unsichtbar, in jeder Epoche mit Schuh sichtbar; schließt die Klasse) ·
  Aufwand **M** · Risiko: die Sohle verschiebt den Stand (leib.K2 Fuß cm p95), und das Budget von 40 000 Dreiecken je Leib ist schon fast voll.
