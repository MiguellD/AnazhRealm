# URSACHE — die zwei Befunde der Körper-Hülle (`koerperHuelle`) gegen main

Nur gelesen, gerechnet, belegt; nichts geschnitten, nichts committet. Kerne: main = `n1911-main/fachwerk-core.js` (dabd69bb, = 986eff04 in dieser Datei) ↔ Kopf = `n1911-los/fachwerk-core.js` (34d507d6f, = cd6daea07 in dieser Datei). **Der einzige Unterschied der beiden Kerne, den das Layout liest, ist `ext`**: `git diff dabd69bb4 34d507d6f -- fachwerk-core.js` ändert nur die Marken `oeffnung` (Zeilen 910–1773), `koerperHuelle` (:5943) und ihren Leser `massBau` (:5966 statt `Box3.setFromObject`); `dorfLayout` (:5464–5760) ist Zeichen für Zeichen gleich. Beleg: main-Kern mit den Kopf-Hüllen ergibt den Kopf, Haus für Haus (Start-Dorf 18, jede der 9 Kacheln „= Kopf“).

Werkzeug (alles in `p3/n1911/los-huelle/ursache/`): `spur-patch.cjs` schreibt Spur-Kopien der beiden Kerne (`fc-main-spur.js`, `fc-kopf-spur.js`; 19 Stempel nur in `dorfLayout`: Zähler des Würfels `rnd`, je Los die Zeiger-Wahl, je Versuch die Probe, die fällt, an der Weg-Probe Abstand und Schwelle; ein Haken, der `ext` ersetzen darf). Gelände wie `../start18.cjs` (Lage `lageGrund("anazh-realm-seed")`, Raster `hoehenRaster(L, Ort, trasseRahmen(nH))` wie der Ort-Faden).

## Befund 1 — Same 431794 wandert 85 m: die Zeile ist die WEG-PROBE des Rathauses (Los #4), :5620–5625

Roh: `start-folge.log` (Los-Folge, Kreuz- und Ein-Los-Proben), `start-detail.log` (je Versuch die Probe), `start-marge.log`, `start-stoer.log`.

### Die Entscheidung

Das Start-Dorf ist eine Stadt der Grammatik (walled, Markt, `eng`-Zeiger). Die Lose #0–#3 setzen an main und Kopf mit denselben Versuchen (Würfel-Zähler 431/504/566/720/760 gleich; Orte ≤ 0,15 m versetzt, nur um die schmalere Breite). **Los #4, Same 952 schwarzwald/rathaus** (exH main 9,632 → Kopf 9,537 m: am Giebel +x ragte eine Öffnung 0,189 m über den Körper) nimmt an beiden Seiten nach sieben `eng`/vollen Zeigern den Zeiger **W0− (die Hauptstraße Ost, Seite −) bei cur 7,28**. Erster Versuch, `tryPlace` fachwerk-core.js:5620–5625 (DIE WEG-PROBE: kein Punkt eines fremden Wegs näher als `rr.w/2 + 0,25` an der Hülle):

| | sc | Abstand der Hülle zur Gasse W16 (quer, Gasse, Breite 2,8) | Schwelle `1,4 + 0,25` | Urteil |
|---|---|---|---|---|
| main | 16,91 | **1,553 m** | 1,650 m | fällt — und noch 20-mal (`weg:16 ×21`, je +1,1 m), hält erst bei sc **40,01** → 41,7/−4,4 |
| Kopf | 16,82 | **1,742 m** | 1,650 m | hält → 18,4/−8,4 |

Warum 0,189 m: der Kasten des Loses steht ab dem Zeiger (`cu.cur`) in voller Breite `2·exH` (:5600 `sc=cu.cur+exH`, :5604–5605); die Box mit der Öffnung am hinteren Giebel (+x zeigt zum Anfang der Straße) schob den ganzen Körper um ihre Tiefe nach vorn — die vordere Giebelwand stand 0,189 m näher an der Gasse W16 und fiel in deren Freihaltung. Am Kopf-Ort, mit der main-Box gemessen, steht dieselbe Wand ebenfalls 1,742 m von W16 (`start-marge.log`): die Öffnung ragt nach hinten, nie zur Gasse.

### Die Folge Los für Los (Gelände, Ort = Mitte der obb plan-lokal, W = Weg, ± = Seite, @ = sc)

| # | Same | Rolle | exH main/Kopf | Würfel vor dem Los | Ort main | Ort Kopf | Grund |
|---|---|---|---|---|---|---|---|
| 0 | 613181 | gotisch/kirche | 6,37/6,25 | 431/431 | 6,1/26,9 W1−@25,7 | 6,1/26,8 W1−@25,6 | dieselben Versuche |
| 1 | 419347 | alpenchalet/gasthaus | 9,64/9,64 | 504/504 | −20,3/12,7 W13+@11,2 | −20,2/12,7 | dieselben Versuche |
| 2 | 16036 | schwarzwald/pfarrhaus | 5,58/5,46 | 566/566 | −18,6/45,6 W5−@8,1 | −18,5/45,7 W5−@8,0 | dieselben Versuche |
| 3 | 946581 | schwarzwald/patrizierhaus | 7,99/7,99 | 720/720 | −27,7/−19,5 W8−@11,8 | gleich | dieselben Versuche |
| **4** | **952** | **schwarzwald/rathaus** | **9,63/9,54** | 760/760 | **41,7/−4,4 W0−@40,0** | **18,4/−8,4 W0−@16,8** | **KIPPT: Weg-Probe :5625 gegen W16, 1,553 < 1,650 (main) ↔ 1,742 (Kopf)** |
| 5 | 508675 | schwarzwald/zunfthaus | 6,83/6,71 | **857/837** | 5,0/−20,8 W3+@14,1 | 4,0/−22,0 W3+@16,2 | ab hier läuft der Würfel versetzt (main 21 Versuche mehr am Rathaus): andere Zeiger-Wahl (:5707 `rnd()*2`), anderer Versatz `jit` |
| 6 | 809070 | schwarzwald/wohnhaus | 7,22/7,21 | 1006/988 | **−5,5/−33,1 W3+@32,1** | **38,8/−3,1 W0−@37,6** | Kopf: W3+ ab 23,59 trägt es nicht mehr — sc 23,59 + 2,2 + 7,21 = 33,00 > 33,00 = Ende der Gasse W3 (36 m, `pts·3 − 6`, **:5600**), weil das Zunfthaus #5 2,1 m weiter steht; es nimmt W0− (frei, weil das Rathaus bei 16,8 steht) |
| 7 | 724672 | schwarzwald/wohnhaus (Hof) | 8,78/8,77 | 1064/1048 | 40,6/−22,5 W16+@29,1 | 39,7/−18,2 W16+@24,7 | an der Gasse W16 sperrt main das Rathaus (`los:4 ×17`), der Kopf 809070 (`los:6 ×13`): der Hof steht 4,4 m anders |
| 8 | 680407 | schwarzwald/scheune | 3,76/3,71 | 1154/1134 | **OHNE** (Mauer-Probe :5683–5684 ×5) | **49,7/−14,4** | hinter dem Hof bei Radius 46,4 liegt jeder Stand im Mauerband, hinter dem Hof bei 43,7 hält Stand 1 |
| 9 | 773347 | alpenchalet/wohnhaus | 7,03/6,96 | 1156/1136 | 22,0/−8,3 W16−@11,9 | 24,7/−23,4 W16−@27,3 | Folge |
| 10 | 28191 | alpenchalet/werkstatt | 6,18/6,13 | 1252/1250 | 24,4/−22,2 W16−@25,9 | 20,5/13,2 W0+@22,2 | Folge |
| 11 | 239842 | alpenchalet/schmiede | 3,22/3,21 | 1297/1310 | 17,8/11,0 W0+@19,3 | 49,3/0,8 W0−@48,7 | Folge |
| 12 | 617311 | schwarzwald/wohnhaus | 7,22/7,21 | 1363/1386 | −33,7/−33,9 W6−@16,3 | −33,8/−33,8 W6−@16,3 | Folge |
| 13 | 45665 | schwarzwald/wohnhaus | 7,36/7,21 | 1415/1438 | −30,2/37,2 W5−@22,8 | −29,9/37,5 W5−@22,4 | Folge |
| 14 | 614278 | schwarzwald/wohnhaus | 6,61/6,46 | 1454/1477 | −46,1/−19,3 W2+@49,1 | −45,9/−19,3 W2+@48,9 | Folge |
| 15 | 746991 | skandinavisch/wohnhaus | 4,86/4,74 | 1542/1547 | −12,5/28,4 W1+@29,7 | −12,5/28,2 W1+@29,6 | Folge |
| 16 | 601540 | alpenchalet/wohnhaus | 7,73/7,62 | 1632/1637 | 75,6/17,4 W9+@10,2 | 75,5/17,4 W9+@10,1 | Vorstadt beidseits |
| **17** | **431794** | **skandinavisch/wohnhaus** | **6,74/6,74** | 1681/1687 | **72,7/0,5 W9−@16,9 (Vorstadt)** | **−6,4/−33,1 W3+@32,5** | main: W3+ steht bei 39,96 (809070 nahm den Stand) → `ende`; jeder Zeiger im Ring `eng`/`ende`/Mauer → die Vorstadt W9. Kopf: W3+ ab 23,59 frei, 431794 ist schmaler als 809070 (13,48 gegen 14,42 m): sc 32,54 ≤ 33,00 hält |

Ort plan-lokal = Mitte der obb (`pl[i].obb`); die Welt-Slots (start-18.md: 74,0/−0,6 ↔ −5,5/−31,6) sind dieselben Lose mit Mitte des Hauses statt Mitte des Loses.

### Beweis, dass es DIESES eine Los ist (`start-folge.log`, „EIN LOS j“)

main-Kern, main-Hüllen, nur Los j mit der Kopf-Hülle, je j: **nur j = 4 macht das Kopf-Dorf** (18 Häuser, 431794 bei −6,4/−33,4, Scheune steht); jedes andere der 16 veränderten Lose allein lässt 17 Häuser, 431794 in der Vorstadt, die Scheune ohne Platz. Auch die Hülle des Hofs #7 selbst (ezH −0,103) bewegt die Scheune nicht: die Zeile in start-18.md „die schmalere Körper-Hülle rückt den Hof 4,4 m“ ist zu korrigieren — den Hof rückt das Rathaus. Das 18. Haus und die 85 m sind EINE Ursache.

Gegenprobe (`start-stoer.log`, main-Kern mit main-Hüllen): ±1 mm an allen Losen → 17 Häuser, nichts rückt (die Folge ist hier nicht Millimeter-empfindlich); 5 cm und 10 cm schmaler je Seite → das Kopf-Bild (Rathaus 18,4/−8,4, 431794 innen, 18 Häuser); **5 cm BREITER je Seite → ebenfalls 18 Häuser** (die Scheune steht bei 50,5/−17,8, 431794 bleibt in der Vorstadt). Die Weg-Probe des Rathauses ist monoton (schmaler hält), das 18. Haus ist es nicht: es hängt am Mauerband hinter einem Hof, den jede Änderung der Reihe verschiebt.

## Befund 2 — +11 in den wachen 3 × 3 Kacheln: EIN Eingang (`ext`), KEINE eine Probe — die Folge wird neu gewürfelt

Roh: `kacheln.log` (erste Fassung, „anders“ = Ort), `kacheln2.log` (anders = DISKRET: Würfel-Zähler, gesetzt/ohne, je Zeiger die Proben), `kacheln-v2.log` (Plan v2 am Ort, Wasser), `stoer.log` (Kontrollen). Gelände je Kachel am Ort des Welt-Dumps (`jeSiedlung` ox/oz), dp wie stamm `_ortDp` (Mitte {7, 4750, kachel 0,0}, Viertel `viertelWort(7, 4750, i, k)`), Welt-Schlüssel x,z ↔ i = x − 3, k = z − 1. Die Kacheln sind Netz-Kacheln (`plan.netz`): keine Mauer (`walled` false, :5470), kein `eng`, kein Wasser im Layout (`nassAm` nur `stadt`), Fuge `gap` 0,06 m (:4535).

### Je Kachel

| Kachel | Welt alt → neu | Node Gelände alt → neu | Σ 2·exH (m) | erstes DISKRET anderes Los: Zeiger, Versuch, Probe main ↔ Kopf | nur main (am Kopf ohne Platz) | nur Kopf (an main ohne Platz) | nur Los #0 (Kirche) mit Kopf-Hülle | Kontrolle 5 cm schmaler / breiter je Seite |
|---|---|---|---|---|---|---|---|---|
| Mitte 3,1 | 165 → 165 (0) | 165 → 165 (0) TRIFFT | −21,48 | #8 651003 kontor (Hülle gleich): W45−, V13: Ende der Gasse :5600 ↔ Nachbar Los 2 :5618 | 1 Scheune (Nachbar :5685 ×5) | 1 Scheune (Weg :5689 ×5) | −5 | −5 / −11 |
| 3,2 | 165 → 171 (+6) | 165 → 171 (+6) TRIFFT | −21,34 | #15 294979 kaufhaus: die Zeiger-Wahl :5707 kippt (W9 ↔ W44, Würfel-Zähler gleich 2123) | 1 Scheune (Nachbar) | 7 Wohnhäuser #166–#172 (alle 138 Zeiger am Ende :5600) | −2 | +2 / −5 |
| 2,1 | 170 → 171 (+1) | 171 → 172 (+1) | −18,75 | #17 667874 patrizierhaus: W22+, V10: Ende ↔ Nachbar Los 2 | 0 | 1 Scheune (Weg) | −5 | −1 / −4 |
| 4,1 | 121 → 125 (+4) | 157 → 159 (+2) | −21,93 | #18 301784 patrizierhaus: W21−, V7: Ende ↔ Weg-Probe W51 :5625 | 0 | 2 Wohnhäuser #158–#159 (136 Zeiger Ende) | 0 | −5 / 0 |
| 3,0 | 174 → 173 (−1) | 174 → 173 (−1) TRIFFT | −21,60 | #17 450810 patrizierhaus: W14−, V5: Ende ↔ Weg-Probe W44 | 1 Scheune (Nachbar) | 0 | +5 | 0 / −1 |
| 2,2 | 149 → 154 (+5) | 168 → 175 (+7) | −16,63 | #21 99537 patrizierhaus: W17−, V8: belegt ↔ Nachbar Los 13 | 0 | 1 Scheune (Nachbar) + 6 Wohnhäuser #169–#174 | +4 | +1 / +2 |
| 4,2 | 154 → 156 (+2) | 162 → 163 (+1) | −19,22 | #14 410412 kaufhaus: W8+, V18: Ende ↔ Nachbar Los 0 | 0 | 1 Wohnhaus #163 | +8 | +7 / −3 |
| 2,0 | 140 → 141 (+1) | 140 → 141 (+1) TRIFFT | −14,50 | #12 291803 kaufhaus: W56−, V7: Nachbar Los 2 ↔ Nachbar Los 3 | 0 | 1 Scheune (Nachbar) | 0 | +1 / 0 |
| 4,0 | 160 → 153 (−7) | 176 → 169 (−7) | −17,24 | #14 655184 kaufhaus: W15+, V3: Ende ↔ Weg-Probe W51 | 3 Scheunen + 6 Wohnhäuser der Reihen-Spitze (#171 …) | 1 Scheune + bergfried #180 | 0 | +2 / 0 |
| **Summe** | **1398 → 1409 (+11)** | **1478 → 1488 (+10)** | **−172,67 (−0,80 %)** | | **12** (6 Scheunen, 6 Reihen-Spitze) | **22** (5 Scheunen, 17 Reihen-Spitze) | **+5** | **+2 / −22** |

Kreuz-Probe main-Kern + Kopf-Hüllen: in allen 9 Kacheln = Kopf (1488). ±1 mm an allen Losen (beide Vorzeichen) und +1 mm an Los #0: 0 in jeder Kachel. Plan v2 (`ortPlan` mit `ortCtx(L)`) streicht in keiner Kachel ein Haus im Wasser (0 → 0), v2 = Export. „Ende der Gasse“ (:5600) gezählt 78 689 → 77 428 (−1 261) auf dem Gelände (plus11.md, eben: −948).

### Was die Zahlen sagen

1. **Ein Eingang**: nur `ext` unterscheidet die Kerne (Kreuz-Probe 9/9). Die Körper-Hülle ist im Mittel 0,103 m schmaler je Los (Σ −172,67 m über 1 680 Lose).
2. **Keine eine Probe**: in jeder Kachel laufen die Lose #0 … #7–#20 mit denselben Versuchen, nur stetig um die schmalere Breite versetzt; das erste diskret andere Los (#8–#21) kippt an einer Schwelle, an der der stetige Versatz eine Probe über- oder unterschreitet — sechsmal am Ende der Gasse (:5600) gegen Nachbar (:5618) oder Weg (:5625), einmal an der Zeiger-Wahl (:5707, die Metrik `edepth·34 + cu.cur` kippt), einmal belegt ↔ Nachbar, einmal Nachbar ↔ anderer Nachbar. Ab da steht der Würfel `rnd` (:5466, EIN Strom für das ganze Layout) meist um einen Zug versetzt (Mitte 1260/1261, 2,1 2225/2226, 4,1 2547/2548 …; wo nicht, steht ein Haus an einer anderen Front und versetzt ihn beim nächsten): jeder `jit` (:5601) und jede Zeiger-Wahl (:5707 `rnd()*2`) danach ist neu gewürfelt — gleiche Folge danach 0–5 von ~180 Losen, gleicher Ort (≤ 1 cm) 2–5 je Kachel.
3. **Wer fällt**: die Netz-Kachel trägt mehr Lose (141–205) als Front; gesetzt wird in Los-Reihenfolge, bis jeder Zeiger sein Ende erreicht (:5600; im Dorf frisst jeder gescheiterte Versuch 1,1 m Front, :5639). Was fällt, sind die LETZTEN Lose (die Reihen-Spitze #158–#180: alle 130–138 Zeiger „Ende“) und Scheunen hinter einem Hof, dessen Ort neu gewürfelt ist (5 Stände an Nachbar :5685–5686 oder Weg :5689). Die +10 in Node: Reihen-Spitze +11 (6 → 17), Scheunen −1 (6 → 5).
4. **Gesetz oder Wurf**: die Richtung folgt dem Gesetz der Front nur im Mittel — dieselbe Schmälerung gleichmäßig (5 cm je Seite, Σ −168 m, fast genau die −173 m der Körper-Hülle) gibt **+2** statt +10, die Weitung **−22**; nur die Kirche #0 schmaler (0,12–0,26 m an EINEM Los) bewegt die Kacheln um −5 … +8 (Σ +5). Die Zahl je Kachel (−7 … +7) ist ein Wurf der Folge, die Summe +10/+11 liegt in seiner Streuung um die grobe Erwartung „schmaler → etwas mehr“ (Front durch Breite: +0,8 % von 1 478 ≈ +12; nicht gemessen, nur gerechnet).

Die Frage „lässt die engere Hülle mehr Lose die Kollisions-/Wand-Probe bestehen?“: nicht als Klasse — es gibt keine Probe, die an main systematisch fällt und am Kopf hält. Die Häuser kommen und gehen an der Reihen-Spitze, an der die Front endet.

## Urteil

**Beide Befunde sind das gewollte Gesetz der EINEN Hülle, kein Fehler der Hülle.** Kein stiller Zwilling (alle Leser im Layout lesen `ext` aus `koerperHuelle`, fachwerk-core.js:5966; dorfLayout ist in beiden Kernen gleich), keine Probe mit falscher Hülle an den Wanderern: die Weg-Probe des Rathauses (:5620–5625) urteilt am Körper, und am Kopf-Ort steht auch die Box mit der Öffnung 1,742 m von der Gasse W16 (die Öffnung ragt nach hinten). Kein Haus im Haus an den Körpern: Grundriss in Grundriss > 1 cm über alle Häuser der Welt-Dumps main 4 Paare ↔ Kopf 14 Paare, tiefste 1,7 ↔ 1,8 cm (`koerper-koerper.log`; Reihen-Schluss, keine Durchdringung von Belang).

Was die Wanderung so groß macht, ist älter als die Hülle und gilt an main ebenso: `dorfLayout` würfelt ALLE Lose aus EINEM Strom `rnd` (fachwerk-core.js:5466) — ein Los, das an einer Schwelle einen Versuch mehr oder weniger braucht, versetzt `jit` und Zeiger-Wahl jedes späteren Loses (:5601, :5707). Darum rückt ein 9,5 cm schmaleres Rathaus ein anderes Haus 85 m, und die Kirche allein bewegt eine Kachel um 8 Häuser.

### Ehrlich offen

- **Öffnung im Nachbarn (Kandidat eines echten Fehlers, nur im Grundriss gesiebt, Höhe ungeprüft)**: `haus-im-haus2.log` — mit dem Brandwand-Stempel des Exports ragt am Kopf an **26 Paaren / 25 Häusern** der 3 × 3 die Öffnung einer Seite OHNE Brandwand > 1 cm in den Körper des Nachbarn (main: 0 — dort stand die Öffnung in der Box). 244 weitere Treffer liegen auf Brandwand-Seiten (fensterlos, kein Überstand). Größter: Mitte, 712412 italienisch/wohnturm Seite x0 → 400335 patrizierhaus 0,265 m (Überstand 0,259, Körper-Fuge −0,006 — anliegend, aber ohne Brandwand). Vermuteter Grund (nicht nachgerechnet): `brandwand` (fachwerk-core.js:9848–9866) urteilt „anliegend“ an `dims.W/D` und den Mitten der obb mit Toleranz `gap + 0,15`, das Los an der Hülle — zwei Maße für dieselbe Fuge, an main durch die breitere Box verdeckt. NÄHERUNG: Überstand aus der Hülle des LOSES (plan.lose), nicht des Baus seines Jahrs; ob die Teile in Höhe des Nachbarn liegen (ein Wohnturm überragt sein Patrizierhaus), sagt nur das BILD — nicht gefahren; Pose: Mitte „d:7@836,438“, Paar 712412/400335.
- In 5 Kacheln trifft Node die Welt nicht in der Zahl (2,1 / 4,1 / 2,2 / 4,2 / 4,0: Node 171/157/168/162/176 gegen Welt 170/121/149/154/160), im Δ gleich in 2,1 und 4,0, anders in 4,1 (+2/+4), 2,2 (+7/+5), 4,2 (+1/+2). Wasser des Gelände-Kontexts streicht 0; vermutet: das Raster des Ort-Fadens trägt die Hydrosphäre (Kerbe der Flüsse), Node nicht — UNGEMESSEN. Der Mechanismus ist in den 4 treffenden Kacheln derselbe.
- Das Rathaus-Teil, das 0,189 m über den Giebel +x ragt, ist nicht benannt (Balkon-Gitter, Stock oder Bogen; nur die Hüllen verglichen).

## Vorschlag (EINE Stelle, nicht geschnitten)

Für die beiden Befunde: **kein Schnitt** — die Hülle tut, was sie soll. Der eine Schnitt, den die Zahlen nahelegen, ist der **Würfel je Los statt EIN Strom**: fachwerk-core.js:5466 (`rnd` aus `seed`) → in der Los-Schleife :5669 je Los ein eigener Strom aus `seed` und dem Los-Index. Dann wandert ein Haus nur, wenn sich SEINE Front ändert (die Ketten über `cu.cur` und belegte Fronten bleiben), und eine Hülle, ein Flügel oder eine Kirche würfelt nicht mehr die ganze Stadt neu (hier: 85 m für 9,5 cm, ±8 Häuser für eine Kirche). Linse dazu: gate:settlement Teil A mit der Ein-Los-Probe (ein Los ±5 cm → Zahl der Lose mit anderem Ort ≤ seine Front-Nachbarn). Byte-Folge: jede Siedlung würfelt neu (alle Goldens) — das ist eine Welle, kein Rest; das Wort hat der Koordinator. Die Öffnung im Nachbarn (oben) ist davor per Bild zu klären.
