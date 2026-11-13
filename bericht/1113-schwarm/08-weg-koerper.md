# 08 Weg, Strasse, Gehsteig, Platz als Koerper

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- BILD/dorf-main-0.5.png = BILD/genom-spiel/gruppe.png (Dorf der Ankunft, Mittag, main): der ganze Grund zwischen Laterne, Marktstand und
  Haus ist EINE braun gesprenkelte Flaeche. Gasse, Platz, Vorplatz und Hausgrund sind nicht voneinander zu trennen. Links und rechts
  liegen blass-lavendelfarbene Schleier im Braun (links hinter der Frau, rechts vor dem Schatten), ohne Linie. Die Grenze zur Wiese ist
  ein weicher Uebergang, die Halme stehen als gelbe Zacken direkt am Rand. Kein Stein, keine Rinne, keine Spur, keine Kante.
- KO/probe-post/w28-stadt-grammatik/22872718-dorf-0.5.png: dieselbe Klasse an einer Dorfgasse. Brauner Boden bis an die Hauswand, ein
  lila Hauch links im Braun, Gras nur als Saum am Fuss der Haeuser. Ob die Gasse 5 m oder 15 m breit ist, kann das Auge nicht sagen.
- KO/probe-post/w28-stadt-grammatik/22872718-stadt-voll-0.5-rot.png (Markt der Stadt): Kopfstein im Segmentbogen von Wand zu Wand,
  gut lesbar in der Naehe. Keine Fahrbahn, kein Bord, kein Gehsteig, keine Kante zwischen Platz und Gasse.
- Vom Zweig w28-weg-koerper gibt es KEIN Bild. Das sagt der Commit-Rumpf b1ffbea3 selbst: „im Bild noch UNGESEHEN“.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
KANN (Labor, worlds/fachwerk/fachwerk.js an main):
- :280–281 Belag je Epoche: Asphalt (> 1880 und staedtisch) · Pflaster (ab 1640) · Erde. :299–303 eigene Farben fuer Fahrbahn, Gehweg
  und Fussgaengerzone. :304 und :309 die Zone ist ein Kreis um die Platz-Mitte (r = max(ex,ez) + 11) und deckt die GANZE Strasse.
- :310–320 BORDSTEIN-GLIEDER: je Seite ein Randstein (0,35 m breit, 0,115 m hoch, mit Flanke bis in die Rinne) und ein Gehweg-Streifen
  (1,1 m auf 0,13 m), dazu Kollisions-Kisten 0,13 m.
- :321–324 Querprofil: Pflaster mit Bombierung kr ≤ 0,075 m und Rinnstein-Mulde −0,02 m. Erd-Gasse mit MITTELRINNE −0,026 m.
- :326–336 Gully, Mittellinie, Zebra (nur Moderne). :337–338 SPURRILLEN in Erde (gen 0, ±0,78 m, 0,32 m breit). :340 Platz als Kasten.
KONSUMIERT (Welt, stamm/siedlung-wege.js an main ec281422):
- Ein Weg ist nur Farbe in EINER Karte (rg8, Mitte 127): R + getretene Erde / − Rasen, G + Acker / − Pflaster (:1875–1888).
  Nah-Stufe 512 m bei 0,5 m je Texel, Fern-Stufe 2048 m bei 2 m je Texel. Der weiche Rand ist ±0,6 m (`randM` :1880).
- `_wegeKarteMale` :551–596 malt jede Form als Smoothstep-Gewicht (:490–494, an der Kante 0,5). Der Saum :563–565 malt den Gehweg
  einer gepflasterten Gasse nur als BREITERE Form mit demselben Belag. Fahrbahn und Gehsteig haben also eine Farbe und eine Hoehe.
- `_wegeBodenFarbe` :861–925 mischt das Gewicht LINEAR zur Erdfarbe (:921, EIN Ton `P.dirt`) und zum Kopfstein (:924). Der Verlauf um
  jede Kante ist also 1,2 m breit, ohne Linie. Das ist der „braune Teppich“.
- Der Belag ist eine Funktion von Rang × Groesse × Jahr (fachwerk-core.js:8520–8534, Pflaster erst ab Reife ≥ 2 bis 6). Das Dorf der
  Ankunft (Jahr −136, Rumpf b1ffbea3) hat Reife < 0. Darum sind ALLE Wege dort Erde (w 5), der Platz Erde (19,6 × 6 m) und die
  Vorplaetze Erde (:1616 `belagAm` → „weg“). Der Hausgrund deckt als Erde um eine Texel-Spanne mehr (:557–561).
- Die Welt kennt keinen Bordstein, keinen Gehsteig, keine Rinne und keine Spur. „Bordstein“ steht in stamm/ nur in Kommentaren
  (siedlung-bewohner.js:2107, :2145). Gemessen am Labor kommt in der Welt der Belag an (1 von 6 Gliedern des Querschnitts), sonst nichts.
- Lavendel: gelaende-boden.js:2438 nennt „Stein mit dem Magie-Violett: weiss-lavendel“ als Vertex-Farbe der Geologie (`P.magie` :2453).
  Meine Lesart, NICHT gemessen: wo das Erd-Gewicht unter 1 faellt (Rand ±0,6 m, `_begehbar` am Hang :883), scheint diese
  Vertex-Farbe durch.

## Die EINE begrenzende Entscheidung
Der Querschnitt eines Wegs hat EINE Quelle: fachwerk-core `WEG_GESETZ` · `wegArt` · `wegQuerschnitt` · `wegZone`. Das gilt fuer alle
Arten (pfad, gasse, pflastergasse, strasse) und fuer den Platz. Seine Kante ist die Hoehenlinie ½ der EINEN Wege-Karte, die Stufe des
Gehsteigs ist Erdbau des Plans v2. Welt und Labor zeichnen nur, was das Gesetz liefert. Es gibt keine zweite Geometrie-Quelle fuer Wege
und kein eigenes Mass im Labor. Abgenommen wird am DORF DER ANKUNFT (Art gasse, Erde), die Stadt ist die zweite Stufe derselben Welle.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Der Zweig b1ffbea3 landet als EINE Welle. Dazu kommt das Glied, das an der Ankunft fehlt: die Erd-Gasse bekommt ihren Querschnitt aus dem
Kern statt aus dem Labor.
Stufen (alle in derselben Welle):
1. pfad/gasse (Erde, die Ankunft): Kante an Gewicht ½ mit Rausch-Zunge, Kies-Korn, nasser Rand (WIP `WEG_BILD`). NEU: `WEG_GESETZ.erde`
   = {spur: ±0,78 m, 0,32 m breit, nur gen 0; rinne −0,026 m} aus fachwerk.js:324/:337 in den Kern. Die Welt zeichnet die Spurrillen als
   Art „spur“ im vorhandenen Pool „siedlung-weg“ (`_wegKoerperAufgaben`, Ruhe auf `_bodenSichtAt` wie der Kantstein). Das Labor liest
   dieselbe Zahl. Die zwei Spuren sind das Glied, das die Gasse im Braun vom Platz und vom Hausgrund trennt.
2. Platz: Feldstein-Fassung (Erde) bzw. Kantstein (Pflaster), wo aussen weder Weg noch Haus liegt (WIP `_wegKoerperStueck`, Art platz).
3. pflastergasse: Kantstein 0,03 m an der Bauflucht, Laeuferreihe im Boden-Stoff (WIP).
4. strasse: Fahrbahn = Erde unter Pflaster (`belag.fahrbahn`, Ton 0,7). Bord 0,12 × 0,16 m in Gliedern von 1 m. Gehsteig als
   Erdbau-Trasse +0,12 m mit Platten 0,5 m. Die Zone liegt je PUNKT ≤ 11 m am Platz-Rechteck (WIP).
5. Ferne: bis 70 m jedes Glied, bis 220 m eine Kiste je Stueck, dahinter die gemalte Linie (WIP `WEG_KOERPER`).
Leser-Liste (Pfade an main ec281422; gegreppt, die WIP-Zeilen stehen im Rumpf b1ffbea3):
- Karte: `_wegeBelagAt` siedlung-wege.js:818 → `_bodenSichtAt` gelaende-boden.js:113, `_kontaktStoffAt` gelaende-kollision.js:1092,
  `_wegeFeldAt` :809 (Wiese, Streu; der WIP verdoppelt dort das Pflaster: erde + 2·pflaster).
- Maler-Rufer `_stlWegeBuild` :1416: siedlung-ort.js:569, :2089, :2887, :2957 · siedlung-verkehr.js:220 · gelaende-kollision.js:445.
- Stand: `_standSicht` koerper-leib.js:588 (WIP liest dort `_wegKoerperAt`) ← koerper-bewegung.js:1942, kreatur-leben.js:1081,
  kreatur-verhalten.js:1171/:2690/:2707/:3513, siedlung-instanz.js:1007 (Rad).
- Plan: `ortPlan` Erdbau-Reihe (Gehsteig-Trassen), `verkehrsBoden` liest `aufFahr` (WIP). Labor: fachwerk.js:280–350.
Kosten-Zeile: ein Pool mit einem Befehl, Fuellung ≤ 1,5 ms je Takt (`fristMs`), neu nach 8 m Gang. Die Kosten haengen am Kreis von
70 / 220 m um den Spieler, nie an der Groesse der Stadt. Shader: +1 Rausch-Probe (`ebene`, Korn) und +2 fwidth je Boden-Pixel.
Beides ist UNGEMESSEN, Pflicht ist Ego und Third am Dorf vorher↔nachher auf GTX und Radeon, nicht ueber heute.
Kriterien: KEIN Kriterium der Meisterkarte misst Weg, Bord oder Gehsteig (kurs-B, 58 Punkte ohne Station). Die Abgabe ist das BILDPAAR
an festen Kameras aus dem Rumpf: Dorf auge-gruppe, auge-gasse, huegel, dach · Stadt auge-steig, auge-bord, hang, dach · vorher 22872718.
Mitberuehrt, vorher↔nachher lesen: material.K1#1 gtx ROT „boden 1,2969“ gegen 0,9–1,1 an ec281422 (stand.json:2181), denn der Erd-Ton
aendert sich · fahrzeug.K2#2 (Wagen auf `aufFahr`, ungemessen) · siedlung.K3 Gassen-Gefaelle (headless gehalten, Byte-Beweis Dorf 7/12
c92a1562 und 3/14 4d11605f laut Rumpf) · ankunft.K4 (AAAA am Spawn, nie gemessen).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `origin/w28-weg-koerper` b1ffbea3 = ein WIP-Commit auf `w28-stadt-grammatik` 22872718. Das Delta sind 6 Dateien, +670 −57:
  fachwerk-core.js +114, siedlung-wege.js +526, koerper-leib.js +7, fachwerk.js 73, modul-karte, asset-inventory.
- Lokal liefen check Exit 0 und playtest:fast 21/0, beide VOR den letzten zwei Edits. Kein Bild auf echter GPU. Der Shader-Text
  (fwidth, `ebene`) ist ungeprueft.
- Was fehlt: (1) die Basis. stadt-grammatik ist nicht gelandet und haengt an `w28-mp-boden` der OMEN (UEBERGABE §4). Origin/main
  7f778d44 liegt 39 Commits vor der Merge-Basis 1e00bfdb, und koerper-leib.js aenderte sich dort (leib-kanon). Das gibt einen Konflikt
  an `_standSicht` (2) Stufe 1 NEU (Spurrillen und Rinne in den Kern) (3) das Bildpaar (4) Konsum: die Kapsel steht auf der Stufe
  0,12, Bewohner auf dem Gehsteig, Wagen auf der Fahrbahn (5) Kosten-Zeile (6) die Zwillings-Spur im Labor (siehe unten).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Das Lavendel im Braun hat KEINEN benannten Taeter. Die Lesart oben (Geologie-Violett durch das Rest-Gewicht) ist nicht gemessen.
  Wenn das stimmt, macht erst die scharfe Kante (WIP eKante) sie unsichtbar. Das Bildpaar zeigt es.
- Widerspruch zur Ankunft: fast der ganze WIP (Bord, Gehsteig, Fahrbahn, Platten) wirkt nur an der Fahrstrasse der Stadt (staedtisch,
  gepflastert, w ≥ 4,9). Am Dorf der Ankunft wirken nur Kante, Korn und Feldstein. Ohne Stufe 1 NEU bleibt der Teppich dort
  wahrscheinlich ein Teppich mit Rand.
- Der Asphalt der Moderne bleibt labor-eigen (fachwerk.js WIP-Zeile `steinMat` modernS). Das ist ein Zwilling nach G4. Ob die Welt je
  einen Ort > 1880 staedtisch traegt, habe ich nicht gelesen. Steht keiner, faellt der Ast im Labor in derselben Welle (FINAL STREICHEN).
- „Stufe im Netz verschliffen“ (Zellen 1,8 m): die Fahrbahn woelbt am Bord bis ~6 cm (Rumpf). Das ist nicht gemessen.
- Nicht gelesen: gelaende-core `erdbauFlaeche`/`erdbauY`, die Fern-Stufe des Bodens (voxel-worker `bodenFarbe`), siedlung-verkehr.js
  `_verkehrFahrbahnM`, die Linsen gate:weg-boden und diag-settlement Teil O gegen die neue Kante.
- material.K1 „boden 1,2969“: welche Flaeche die Probe welt-boden misst (Wiese oder Weg), habe ich nicht gelesen.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 4. Den Boden sieht jedes Ankunfts-Bild, und Stadt und Dorf gewinnen in einer Welle Kante und Koerper. Am Dorf allein waere es 2,
ohne die Spurrillen.
Aufwand M. Der Code liegt zu ~85 %, es fehlen Basis, Stufe 1 NEU, Bildpaar und Kosten.
Risiko: die Basis (stadt-grammatik und mp-boden) landet nicht. Dann haengt die ganze Welle, und der Merge auf 39 Commits main trifft
`_standSicht`, das der Leib-Kanon gerade umbaute.
