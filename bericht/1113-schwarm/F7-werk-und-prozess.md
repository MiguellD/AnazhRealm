# F7 werk-und-prozess
Verdichtet aus 49–56 (13.11. ~22:30). Quelle: main 7f778d44 (SPIEL-Baum ec281422), Zweige per `git log/diff origin/…`. Selbst gesehen:
`probe-post/w28-leib-nah/7-paar-nah-heute-kandidat.jpg`: links reißen beide Hemden an Achsel und Seite, die Fetzen flattern. Rechts sind
die Hemden geschlossen, der Saum ist eine Linie, die Schultern bleiben Kugeln. `scratchpad/dorf-main-0.5.png`: Himmel dunkel-marine, der
Hang als gelbe Zacken-Wimpel, das Haus ein weißer Kasten mit Fenstern ohne Gewände, der Boden ein brauner Sprenkel mit violetten Schlieren
ohne Kante, sieben Bewohner, alle stehen. `scratchpad/wiese-mitte/heute-wiese.png`: Laubkronen von Hausbreite auf strichdünnen schwarzen
Stangen.

## Die Schnitte, gereiht (9)

**1 · Kleid des Bewohners (Stufe A) · `w28-leib-nah` a9a3d136 · S**
- Mangel im Bild: zerrissene Hemden, Ballon (Bild 7 links, dorf-main). Wurzel: `koerper-core.js:254` `dicke: top === "poncho" ? 0 : 0.032`.
  Der Poncho bleibt eine Hülle (geprüft). Die Voxel-Hülle `foundry-core.js` backeHuelle (Zeile laut Blatt 51 :9181, nicht gelesen).
- Entscheidung: das Kleid ist Stoff aus der Haut mit Saum, Bund und Weite, in jeder Stufe. Die Hülle mit Dicke 0 stirbt.
- Schnitt: Tor-Liste am Kopf lesen (`erwachen/gtx1050-2026-11-13.md:27`), dann den leeren Abgabe-Kopf nach :29. Dazu das Bildpaar am Dorf
  von vorn und hinten. Fährt im selben Zug wie Schnitt 2, Stufe 1. Die Dateien sind unabhängig: leib-nah ändert nur `foundry-core.js`,
  347 Zeilen (diff gezählt).
- Leser-Liste: `koerper-core.js:213` kleidZonen · `foundry-core.js:9353` bakeMenschInstance, `:6467` __stoffAusHaut, `:7086` __mengenPrims
  · `koerper-core.js:3730` leibRelief · `stamm/siedlung-bewohner.js:313` _bewohnerTracht (Rumpf ace30e73).
- Kosten am Dorf (GTX 1050): Frame p50 16,69 → 16,68 ms, Dreiecke 492 889 → 495 464 (gtx1050:17–18). Gemessen und neutral.
- Kriterien: mensch.K4#1 gtx ungemessen (der Schnitt bewegt ihn laut gtx1050:44 nicht) · haar.K4#1 am neuen Poncho ungemessen (:46).
- Liegt: der Kopf a9a3d136 (21:37) steht 0 hinter und 8 vor main (rev-list). Blatt 49 nennt 694b85d2 0/7, Blatt 51 nennt ace30e73: beide
  sind überholt.

**2 · Dorf der Ankunft: Haus und Weg ganz · `w28-stadt-grammatik` 45290d87 → fassade + stoff-fuge + weg-koerper · L**
- Mangel im Bild: glatte Kästen ohne Stoff, Wege ohne Kante, kein Gehsteig (dorf-main).
- Wurzel der Sperre: `stamm/kreatur-leben.js:1681` `_bodenKlasseAt`, in main ohne `_terrainSaatY` (Grep: 0 Treffer in stamm/). Das ROT
  der Mehrspieler-Wand am Stadt-Zweig: 3/3 ohne Schnitt, 4/4 GRÜN mit Schnitt (erwachen/omen-2026-11-13.md:26–31).
- Entscheidung (aus 49): kein Schnitt an Fassade, Stoff-Fuge oder Weg, bevor 45290d87 in main steht. mp-boden landet nie allein:
  `merge-base --is-ancestor` 77c31f1a in 45290d87 ist 0 (geprüft), und an main kippt es 0 von 64 Zell-Mitten (omen:31).
- Stufen:
  - Stufe 1: Stadt-Kopf → check + gate:mp-sync → Abgabe → Zug.
  - Stufe 2: fassade b038852b, stoff-fuge 212b6de9, weg-koerper b1ffbea3 als EINE Abgabe, gemischt in dieser Reihenfolge, mit EINER
    Prägung von `spec/asset-contract/v6/golden/haeuser.json`. Beide Zweige prägen die Datei: fassade +996, stoff-fuge +226 Zeilen. Beide
    ändern auch `fachwerk-core.js`: +1170 und +1045 (diff --stat).
  - Bildpaar Dorf aus Auge, Hügel und Dach mit den Kameras aus Rumpf b1ffbea3.
- Leser-Liste: wie 49:62–66. `fachwerk-core.js` :199 / :683 / :1089 / :2067 / :5599 · `siedlung-wege.js` _wegeKarteMale ·
  `gelaende-boden.js:113` · `gelaende-kollision.js:1127` · `koerper-leib.js:575` · `vegetation-baum.js:1913` · `siedlung-instanz.js:1007`.
- Kosten: Stadt und Weg-Körper UNGEMESSEN. Pflicht vor Stufe 2: Frame p50 und Dreiecke am Dorf, heute ↔ Kandidat.
- Kriterien (Blatt 49, stand.json 20:54):
  - siedlung.K1: 1 P, Innen 0,083 ↔ ≥ 0,15.
  - material.K1: 0 P, boden 1,296 ↔ 0,9–1,1.
  - PFLICHT C und F hängen an Stufe 1.

**3 · Tag ohne Buchung: Kriterium-Ids in Brief und Commit, Buchung je Kriterium · S**
- Mangel im Takt: 12.11. ~0,03 P/% gegen 0,81 am 26.10. (kurs-F:44, :47). Die Merges 12.–13.11. tragen die Namen von Dingen, nie von
  Kriterien (56).
- Wurzel: `pm/zug/dienst/werkzeug/buche.sh:56–63`. Fällt die SUMME, wird nichts gebucht, auch kein Gewinn, bis jemand `BUCHE_FALL=1`
  setzt (gelesen).
- Die Ratsche je Kriterium gibt es schon: `punkte.cjs:5268–5296`, „gehalten … Rückfall“. Damit sitzt der Schnitt NUR an buche.sh:57.
- Entscheidung: die Einheit ist die Klasse mit ihren Kriterium-Ids (Wert, Station) im Brief und in der Abgabe-Nachricht. Gebucht werden
  die Gewinne. Ein frisch gefallenes Kriterium bleibt auf seinem gebuchten Stand und steht benannt ROT in `buche-verlust.cjs`.
- Stufen: (a) Brief-Kopf und Abgabe-Rumpf tragen `<dom>.K<n>#<p>`. (b) Die Bedingung in buche.sh:57 gilt je Kriterium statt je Summe.
  (c) Selbsttest-Fall mit Mutante: ein Gewinn und ein Fall in derselben Fahrt buchen +1 und halten −1.
- Leser-Liste: `buche-dienst.sh:6` · `buche-verlust.cjs:3` · `zug/budget.txt` `karte=` (buche.sh:56) · `meisterkarte.html` (:50).
- Kosten: 0 Spiel-Byte. Kriterien: keines einzeln. Das Maß ist P/% je Tag und die gebuchte Summe 221 ↔ 330. Heute 21:02 fiel 221 → 219
  an schatten.K3#1/K4#1 ohne Täter (UEBERGABE:81).

**4 · Wer wählt, was gemessen wird: die Heil-Regel in `auswahl` · S–M**
- Mangel im Takt: GTX 135 Urteile mit 8 GRÜN. Radeon: 32 % der Lauf-Minuten gingen an Stationen, die nie GRÜN waren (Zählung von
  Blatt 55, nicht nachgezählt). Die OMEN ließ 10 profiband.* an jedem Kopf ruhen.
- Wurzel: `punkte.cjs:3644–3647` `auswahl` filtert nur nach Frische (gelesen). Die Heil-Regel steht als toter Zwilling in
  `messPlan` :5121–5150 („eine rote Station ohne Heil-Versuch … wird nicht gemessen“, :5115). Kein Dienst ruft sie (Grep in zug/:
  0 Treffer).
- Hedge: `zug/dienst-omen/ort/n0611/stufe/ohne-band.cjs:1–8` hält profiband.* an, gerufen aus `landung-dienst.sh:56` (gelesen).
- Entscheidung: ein ROT wird erst wieder gemessen, wenn eine Landung sein Kriterium nennt. Ausnahmen: nie gemessen, PFLICHT, gebucht
  GRÜN. Was gemessen wird, wählt nur `auswahl`.
- Stufen: Regel in auswahl, danach messPlan und planCli löschen · `gtxNutzenCli` :5248 ∩ auswahl · `ohne-band.cjs` löschen und
  `BILD=$ALLE` · headless einmal je main-Kopf aus buche-dienst · Selbsttest mit Mutante · `run --offen --trocken`: Stationen vorher ↔
  nachher.
- Leser-Liste: wie 55:84–92.
- Kosten: 0 Spiel-Byte. Kriterien, die die frei gewordene Zeit trägt: Pflicht E profiband.K1–K3 gtx (zuletzt 07.11.) · mensch.K4#1 ·
  leib.K3#2 · vegetation.K5#2 · klang.K5#2.

**5 · Der Zug urteilt jede Wand einmal · Dienst-Code koordination · S**
- Mangel im Takt: Abgabe → main im Median 73 min (kurs-G:21). Die lokale Vorprobe kostete 9, 7 und 8 min an z425–z427 (Blatt 53). Die
  Fahrt-Enden 18:47, 20:02 und 21:17 bestätigt `zug-nie-leer.log:264–272`.
- Wurzel: `zug-sammler7.sh:73–82`. Die Proben entfallen nur, wenn der Baum gleich ist; sonst fahren :83–112 Statik und playtest:fast als
  Zwilling von puls 1/2.
- `zug.cjs:265–267`: ohne Erbe heißt es LAEUFT bis `run.status === "completed"`. :298–301: Versuch 2 für jeden Nicht-Wackler (gelesen).
- Entscheidung: am Kandidaten urteilt jede Wand genau einmal, in der CI. Ein rotes puls ist sofort ROT, der Lauf wird abgebrochen.
- Stufen: Vorprobe fällt für jedes Ein-Zweig-Bündel · `urteilVon`: Puls-ROT ohne Versuch 2, plus `cancel` · `wand-summe.sh` bleibt die
  EINE Vorprüfung · Selbsttest-Fälle: Ein-Zweig ohne Probe, roter Puls.
- Leser-Liste: wie 53:53–61, dazu `zug.cjs:1359–1364` nachweis (die FÄLLT-Zeile entfällt).
- Kosten: 0 Spiel-Byte. −6 bis −8 min je grünem Ein-Zweig-Zug, aus den drei gemessenen Proben-Zeiten. Der rote Puls ist geschätzt.

**6 · Ein Wartender ist offen · Spiel-Dateien, Verhalten byte-gleich · S**
- Mangel im Takt: das falsche ROT „DER BAU STEHT NICHT … nichts mehr offen“ steht neben „nahWiese wartet“ in 9 Mess-Dateien. Grep zählt
  38 Stellen (1561bf3a, 28c74a9f, 3fd9a25a-gtx, 6a571e3b, 77265b04 ×2, c4010773, e6f0cf7e, f52b3a03).
- Wurzel: `scripts/lib/welt-boot.cjs:368–375` zählt `!auf` nur über `_weltOffen`. `stamm/dirigent-takt.js:531–553` kennt kein Feld für
  den Fege-Takt. `_weltSteht` verneint über `return !this._standGeht()` (:705). `stamm/dienst.js:1945` speichert `!!offen` (alles gelesen).
- Entscheidung: `_weltOffen` trägt `fege` = Zahl der Wartenden. Nur ein Warten, das sich 3600 Gänge nicht rührt, fällt als HÄNGT.
- Stufen: dienst.js:1945 speichert eine Zahl · vegetation-wiese.js:438 und :2177 melden eine Zahl · Feld `fege` in `_weltOffen` ·
  Selbsttest in gate:stand-takt mit Mutante.
- Leser-Liste: 54:66–72 (31 Dateien rufen `__weltStehtNach`).
- Kosten: eine Schleife über ~10 Takte je Takt, 0 Draw-Calls.
- Kriterien: mensch.K1#1, mensch.K2#2 radeon · vegetation.K1#1, profiband.K2#1, profiband.K3#1, wetter.K2#1 gtx. Die Abgabe nennt sie
  alle, sonst fallen sie unter Schnitt 4 aus dem Messen.
- Liegt: kein Zweig.

**7 · Stamm des Laubbaums aus der Krone · `w28-stamm-krone` 31f4607c · S–M**
- Mangel im Bild: Kronen auf Pfählen (heute-wiese.png). Am Dorf sehe ich keinen Stamm im Bild: die Wirkung gilt der Wiese und dem
  Waldrand, nicht der Ankunft.
- Wurzel: `phyto-core.js:99–103` `trunkR = … P.hoeheM / P.hd / 2 …` (gelesen).
- Entscheidung: der Brusthöhen-Durchmesser (BHD) folgt aus dem Schirm der Krone (`stammAusKrone`). `hd` stirbt als Eingang des Laubbaums.
- Stufen: main einmischen. Der Zweig steht 138 hinter und 5 vor (rev-list). main änderte seit der Basis `phyto-core.js` (+176) über
  karte-stamm und halm-trieb, darum alle Karten-Goldens neu prägen. Das ROT von z416 zuordnen (kurs-G:12 „Kamera-Leib K4“). Bau-ms des
  bis zu 5-fachen Neu-Baus in `buildInstance` messen. Bildpaar Wiese und Dorfrand.
- Leser-Liste: 50:48–51.
- Kosten: L0 gleich, L1 Eiche +54 Dreiecke. Bau-ms, Frame und Pop sind UNGEMESSEN.
- Kriterien: kein Kriterium misst Krone/BHD. Berührt werden lod.K1#1 / laub-kante (Pflicht A 0,2635 ↔ ≤ 0,22, die Karte bäckt neu) und
  vegetation.K1#1.

**8 · Zwei Abgaben heim: `w28-ziel-plan-wip` 3005322c + `w28-tor-bruch` c7d0aad4 · S**
- Ziel-Plan: `ausgabe-aufnahme.cjs:743–746` zählt den Leib mit Ziel zweimal. Dagegen steht `kamera-nah.cjs:317` (Blatt 54, nicht selbst
  gelesen). Es fehlen vier Bilder vom Dorf (main ↔ Zweig) und der Abgabe-Kopf.
- Tor-Bruch: die Probe wurde abgewiesen, weil der Rumpf „[gpu-probe: gate:…]“ trägt (cloud-post/w28-tor-bruch.md:3). Rumpf neu, das Rot
  von 21:21 ist ungelesen. Kriterien: keines direkt. Das ROT stadt-voll.leib der Stadt-Probe fällt mit.

**9 · Register mit Leser · FUND-REGISTER.md · S (nur koordination)**
- Mangel im Takt: der Kopf `FUND-REGISTER.md:3` steht auf „Stand 02.11.“ (gelesen). Seit 06.11. starb keine Zeile mit ihrem Schnitt
  (Blatt 52, git log nicht nachgezählt).
- Geheilt, steht aber noch im Register (stichprobenweise geprüft): `siedlung-wege.js:1413` „Bis hier hielt eine stille Kappe von 900“ ·
  `_annahmeN` und `_genesisPortalRing` mit 0 Treffern in stamm/.
- Entscheidung: jede offene Zeile wird Stufe genau eines besetzten Zweigs und steht in dessen Brief (Schnitt 3a). Sonst fällt sie offen
  als TOT.
- Stufen: die sieben Geheilten löschen, je mit dem Commit, der heilte · Zuordnung nach 52:65–67, ohne die gestrichenen Teile unten · TOT:
  Zeilen 22, 30, 26.

## Kopplungen (Reihenfolge ohne Kreis)
- **3 trägt 4.** Die Heil-Regel liest Kriterien aus `git log`. Ohne Ids im Commit fiele jedes ROT aus dem Messen, und heute heißen die
  Merges nach Dingen. Also landet 3a vor 4. Stufe 3b ist unabhängig.
- **6 vor 4 und vor dem Mischen von wiese-fern.** Die Landung von 6 nennt ihre sieben Kriterien, sonst friert 4 sie als ROT ein.
  wiese-fern schreibt `stamm/vegetation-wiese.js` um (530 Zeilen im diff), 6 trifft dort :438 und :2177. Wer zuerst landet, zwingt den
  anderen zum Mischen. 6 ist kleiner, darum zuerst.
- **5 trägt 1 und 2.** Kleid und Stadt fahren im selben Zug. Dann gilt die Vorprobe weiter, denn sie bleibt bei ≥ 2 Zweigen. Als
  Ein-Zweig-Züge gewinnt jeder 6–8 min.
- **2, Stufe 1 vor Stufe 2.** fassade (203 hinter, alte Basis), stoff-fuge und weg-koerper bauen auf dem Stadt-Kopf. Zwei Prägungen von
  haeuser.json in zwei Zügen wären ein sicherer Konflikt.
- **7 nach karte-stamm (in main) und vor wiese-fern.** Beide ändern `phyto-core.js` und `foundry-core.js` sowie
  `spec/asset-contract/v1/golden/manifest.json` (laut 50). Der dickere Stamm bäckt neu in die Karte und trifft Pflicht A laub-kante.
- **1 und 7 teilen nur `foundry-core.js`**, in getrennten Bereichen (:6xxx–9xxx gegen :5402). Kein Zwang zur gemeinsamen Welle.
- **9 hängt an 3a.** Die Zeilen sterben nur, wenn der Brief sie nennt.
- Reihe: 1 + 2/Stufe 1 (ein Zug) · gleichzeitig 3, 5, 6 (Dienst und kleine Spiel-Dateien) · dann 4 · dann 7 · dann 2/Stufe 2 · 8 und 9
  in jeder Lücke.

## Widersprüche zwischen den Blättern und was die Quelle sagt
- **Ein Kleid-Stamm-Halm-Wurf (51) gegen getrennte Abgaben (49, 50).** Die Quelle: die drei ändern verschiedene Bereiche, und Halm ab 5 m
  reißt Ego +7,3 ms (Rumpf 476a3ed9). Entscheidung: drei Abgaben, je ein Ding ganz. „Ersatz-Träger“ ist eine Linse, kein Ding. Das
  Kleid, das bereit ist, wartet nicht auf die Wiese.
- **Rang des Stamms: Wirkung 4 (50) gegen 2 (51) gegen #10 (49).** Das Bild sagt: Pfahl unter der Krone an der Wiese, am Dorf kein Stamm
  zu sehen. Die Wirkung an der Ankunft ist klein, darum Rang 7.
- **Zweig-Köpfe.** 52 nennt stadt-grammatik 156cc903 und mp-boden f97fe692 (Stand 21:05). Die Quelle zeigt 45290d87 (21:33) und
  77c31f1a. 49 und 51 nennen für leib-nah 694b85d2 bzw. ace30e73, die Quelle zeigt a9a3d136 (21:37).
- **mp-boden zuerst allein (UEBERGABE §4) gegen nie allein (49).** Die OMEN mischte es selbst in den Stadt-Zweig (Abstammung geprüft),
  und an main bewegt es 0/64 (omen:31). Es gilt 49.
- **Die Wurzel der Wimpel.** 52 nennt `stamm/daten.js:563` `streckMax: 14` (gelesen: es steht im Block `fern`). 51 nennt die L2 mit
  einem Dreieck je Blatt (`foundry-core.js:3134` `stuetzen: [[0, 1]]`, gelesen; Breite 121–133 mm laut :3127). Beide Zeilen stehen so in
  main. Welche das Bild am Hang trägt, ist nicht gemessen. Darum ist der Halm hier kein Schnitt.
- **K6 heißt „STEHT NICHT“ (FUND-REGISTER:246) oder „HÄNGT“ (54).** `cloud-post/w28-leib-genom.md:5` trägt beides. Die äußere Hülle
  kommt aus `welt-boot.cjs:322`, der innere Wurf ist HÄNGT aus :374. Schnitt 6 heilt K6 nicht beweisbar, wie 54:90 selbst sagt.
- **Weltbild-kalt „tot, Inhalt in main“ (49) gegen den Blob-CSP-Fund (52).** `index.html:35` `connect-src` trägt bis heute kein `blob:`
  (gelesen). Zumindest der CSP-Teil des Zweigs ist nicht in main. Ob die Platte noch über blob: holt, habe ich nicht gelesen.
- **„Fünf Samen-Befunde TOT“ (FUND:245) gegen „fünf Kern-Entscheidungen ungeschnitten“ (50).** Beides stimmt. Tot ist der Wegwerf-Code,
  der Befund lebt. Nur der Stamm hat gebaute Arbeit, und die steht in Schnitt 7.

## Gestrichen
- **Die Licht-Klasse als neuer Zweig (52 Stufe 2: Himmel, Kontakt, Fell, Sonnenbahn, Nacht).** Die Wurzel des Mittag-Himmels hat
  niemand gelesen (52:89). Ein neuer Zweig ohne Datei:Zeile ist kein Schnitt. Sie steht unter Ehrlich offen.
- **52: Funde 8 und 9 sterben mit dem Kleid.** 8 (Block-Leiber ab 5–8 m) gehört zu Teil B von leib-nah, der offen ist
  (gtx1050:46). 9 (Tätigkeit der Bewohner) gehört zu ziel-plan. Mit der Kleid-Abgabe stirbt keine der beiden Zeilen.
- **52: die S-Schnitte 12, 13 und 14 „sofort, ohne Klassen-Zweig“.** Das widerspricht dem Kurs §2.2, nach dem eine Klasse ganz fällt.
  13 verschiebt die Haut aller Menschen ohne Bildpaar (52:98). Die Zeilen bleiben im Register, bis ein Zweig sie trägt.
- **53 „~15 min je rotem Puls-Zug“ und 55 „GTX-Liste ~8 Stationen“, „Radeon −32 %“.** Das sind Schätzungen, keine Messungen. Sie gehen
  nicht als Zahl in einen Commit.
- **Die Twists 1, 2, 5, 6 und 7 neu öffnen (Kandidaten-Liste im Gedächtnis).** 51 belegt es: 1 ist verworfen, 2 gelandet, 7 liegt im
  Kern (`kreatur-leben.js:2236` aufholS, gelesen), 5 betrifft die Nacht, 6 bewegt ein Soll.

## Ehrlich offen
- Nicht gelesen: der Text des ROT von z416 (Z:231) · das Check-Ergebnis von 45290d87 und a9a3d136 · das Rot von tor-bruch 21:21 · der
  Inhalt von studio-seiten ad504fbe · die Station-Zeilen in g1/g5.
- Nicht selbst geprüft: der Merge von stamm-krone gegen main (merge-tree, nur Lese-Auftrag).
- Ungemessen: die Kosten von Stadt und Weg-Körper · die Bau-ms des Stamm-Neu-Baus · die Wirkung von 3, 4 und 5 auf P/% und Fahrt-Minuten
  (der nächste Zug und die nächste Buchung sind der Richter).
- Der Himmel am Mittag ist dunkel-marine (dorf-main). Niemand sitzt daran, die Wurzel ist ungelesen. Das ist der größte gesehene
  Bildfehler ohne Zweig.
- Das Schweben eines Gehenden: die Wurzeln stehen 46–52 cm über dem Gesetz-Boden (gtx1050:41). Ein Täter ist nicht benannt.
- Die Klasse von Schnitt 6 kann größer sein. „nichts mehr offen“ steht in 46 Mess-Dateien, darunter roh bauen.K5_2 und physik.K2_2
  (archLod). Nur 9 davon nennen den Fege-Takt.
- Die Ursache von 0xC0000409 (dreimal in drei Tagen) ist unbenannt. Die Täter von schatten.K3#1/K4#1 (221 → 219) sind unbenannt.
- Halm ab 5 m (`w28-wiese-fern`): keine Abgabe, bis die Gegenprobe Licht ↔ Überzeichnung gemessen ist und Ego ≤ 37,5 ms hält.
