# Vorprüfung tages-gesetz — der Tag hat zwei Spitzen, der Haushalt kauft am Markt-Morgen

**Basis.** Der Zweig trägt main 78ed3167 (Merge 7e7b8cef, ohne Konflikt). Er bringt die Ankunft zur Stunde
(`tagesKette` · `tagesZiel`) und das Tages-Gesetz in koerper-core.js. Leser sind der Wirt (stamm/siedlung-bewohner.js) und die
Linsen gate:koerper-kern (M1 · M2 · M5), gate:mensch-zuege und gate:kreatur-takt zielplan (die Stunde aus dem Akt, die Ganglinie
des Tags).

## Der Heil-Kopf (tages-gesetz 4, 25.11.): die CI des Kopfs 20451ac6 stand ROT in voll 4/18

Die Zeile der CI: „❌ VK (Leiter mensch.netz.verkehr) der Verkehr der Stadt um 10 Uhr — berührt Bewohner 11×“. Lokal am Kopf samt
main f63a69ef (Merge b04af94e, Selbsttest gate:koerper-kern 52 Täter) dieselbe Zeile, deterministisch: das Kind 7:288:5 in Wagen 7
bei 838/432, Bild 33148–33188, 6,5 m vor dem Stand des Richters (836,2/438,5). Beide Schnitte liegen in stamm/siedlung-verkehr.js.

1. **Wer in einer Bahn stand, betrat die Bahn des anderen** (`_verkehrVorrang`). Das Kind ging längs in der Bahn eines Wagens, die
   der beanspruchte, und trat 3 m vor dem Bug von Wagen 7 (8,2 m/s) in dessen Bahn: Wagen 7 traf und trat (Q[0] 0,03 s), und doch gab
   der Vorrang „frei“. Die eine Bahn hob das Warten vor der anderen auf (`return traf && tritt && !drin`). Der Wagen bremste bis
   4,4 m/s und stand auf dem Kind. Schnitt: das Warten am Rand der Bahn, die ein anderer beansprucht, gilt immer (`return traf &&
   tritt`). Wer in einer Bahn steht, räumt sie quer, wenn er die Querung schafft, sonst geht er seinen Weg, nie in die Bahn eines
   anderen. Berührt Leib 11 → 0.
2. **Die Rampe des Umfahrens begann neben dem Wagen** (`_verkehrUmfahren`). Mit Schnitt 1 stand eine neue Zeile ROT: Ausscheren
   über dem Band 0,612 m, SUV 17 an der Wende 854/407 (10 Uhr). Er hielt 4,3 m vor dem stehenden Leib. Die Rampe (Kern hl + R + 1,
   `umfahrRampeM` 6 m) lag um den Leib, wo immer der Wagen stand. Die neue Linie begann an ihm 66° neben seiner Gier, und nach
   0,88 m ragte seine Ecke 0,612 m über das Band. Schnitt an der Wurzel der Linie: wer dem Stehenden näher ist als Kern + Rampe,
   umfährt nie, er wartet, und der Leib tritt beiseite (`_bewohnerPlatz`). Eine „weiter“-Linie beginnt so nie quer zur Gier.
3. **Die Fahr-Linse lokal GRÜN** (Kopf b04af94e mit beiden Schnitten, stadt-voll, 600 s je Stunde, ein Hand-Lauf an der
   Stations-Grenze), wörtlich:
   - „✅ VK-V (mensch.K2) die Stunde ohne Vorgeschichte: dieselbe Saat, dasselbe Bild — {"stunde":10,"bilder":[1200,1200],"erst":-1,"einAnkunft":false,"wer":[]}“
   - „✅ VK (Leiter mensch.netz.verkehr) der Verkehr der Stadt um 10 Uhr“
   - „✅ VK (Leiter mensch.netz.verkehr) der Verkehr der Stadt um 23 Uhr“

| stadt-voll | Kopf 3 + main (vorher) | Schnitt 1 | Kopf 4 (beide Schnitte) |
|---|---|---|---|
| berührt Bewohner 10 Uhr | 11 (7:288:5 in Wagen 7) | 0 | 0 |
| Ausscheren über dem Band 10 Uhr | 0,036 m (SUV 14) | 0,612 m (SUV 17, ROT) | 0,025 m |
| Ausscheren über dem Band 23 Uhr | — (die Stunde lief nach dem ROT nicht) | 0,026 m | 0,026 m |
| knapp (Wagen an Wagen) 10 · 23 Uhr | 0,30 · — | 0,31 · 0,33 | 0,32 · 0,33 |
| Ziele erreicht 10 · 23 Uhr | 164 · — | 163 · 163 | 163 · 163 |
| langsamste Minute 10 Uhr | 138 m (Wagen 7) | 121 m (Wagen 7) | 121 m (Wagen 7) |
| Sim-Takt je Schritt 10 · 23 Uhr | 0,975 ms · — | 0,959 · 0,930 ms | 1,021 · 0,936 ms |

Wagen 21 von Soll 21 je Stunde, keiner fest, kein Stoß, kein Wagen in Wagen, keiner ohne Schlüssel im Ort. Ehrlich offen: die
langsamste Minute fiel 138 → 121 m. Das ist der Preis des Wartens am Rand der anderen Bahn (Schnitt 1); der Boden der Linse
(`weg60M` 30 m) hält.

BILD-PLATZHALTER

## Der Heil-Kopf (tages-gesetz 3, 25.11.): die CI des Kopfs 1d2f7e03 stand ROT an zwei Aufträgen dieses Zweigs

1. **Die Fahr-Linse des Lebens (voll 4/18): die Akte stand in `_bewohnerNetz`.** Gemessen an stadt-voll (Villaalto, lokal, niedrige
   Priorität): 10 Uhr 300 s 4 638 Rufe, EIN Bau, 65 Stände ohne gekippte Kante, 156 ms zusammen; 23 Uhr 104 s 2 032 Rufe, 147 ms. Die
   Tür-Regel plant nie neu (0 in 300 s) — die Hypothese „jeder ohne freien Stand sucht jede Runde“ fiel an der Zahl. Der Bau: 2 467
   Knoten in 18 Teilen, keine Naht frei; die Naht-Suche prüfte Teil 0 × alle Knoten, 60–105 von 92–169 ms je Bau, und jeder Stand,
   der eine Kante kippt, suchte sie ganz. Schnitt: die nahen Paare des Grunds (bis `naehtM` 25 m, Raster, je Siedlung einmal,
   `G.nahPaare`) in derselben Reihe (d, i, j) — 200 Zufalls-Netze, 45 749 Paare, 0 ungleich. Ehrlich offen: den Stall der CI zeigt
   die Stadt lokal nicht (die Akte urteilt auch in grünen Läufen, Kreatur-Linse Teil 3: JS-SCHLEIFE in `updateCreatures`, der Puls
   kehrt zurück); der Richter ist die CI dieses Kopfs.
2. **Die Kreatur-Linse Teil 3 (voll 12/18)** am Kopf samt Schnitt lokal GRÜN: Täter 44 von 44 rot beim Namen, Grund 12 von 12, 1 015 s.
   zielplan trug 301 s (DAUER_S 80) — offen, ob die CI daran riss; ihre rote Zeile steht nicht im Satz.
3. **main 804ca10c (Brand-Feld) ist eingemergt**, spec/stamm/modul-karte.json ohne Konflikt (zwei Zeilen, je eine Seite).

## Der Heil-Kopf (tages-gesetz 2, 25.11.): die CI des Kopfs 99b234d7 stand ROT an vier Aufträgen

1. **Der Warte-Kreis zweier Wagen ist ein Fehler des Verkehrs an main; das Tages-Gesetz hat ihn nur geweckt.** stamm/siedlung-verkehr.js
   ist zwischen main und dem Kopf 99b234d7 byte-gleich. Die neue Nachfrage stellte zwei Entgegenkommende in den Bogen vor der Wende
   746/573: Wagen 8 heraus bei 747/555, Wagen 9 hinein bei 748/548 hinter 18. Jeder stand 0,04–0,10 m im Raum der Begegnung des
   anderen. Der Warte-Graph löste nur Kreise über Halter und Kopf, nie einen Kreis aus reinen Wagen-Kanten: ab Sekunde 30 standen
   21 von 21 Wagen. Der Schnitt liegt an EINER Stelle (`_verkehrKreisDurch`, gelesen in `_verkehrZonen` und `_verkehrFolge`). Im Kreis
   aus Wagen-Kanten fährt, wer einen Ort hält, sonst die kleinste Nummer. Er fährt an dem vorbei, vor dem er hält, ohne den Rand der
   Begegnung; sein Leib samt Ausscheren bleibt frei. Der Halter behält seine Kette. Der Löser gilt für jeden Kreis, nicht für eine
   Wende. Gemessen am Kopf (stadt-voll, 600 s je Stunde): Täter `--mutante-kreis` (der Rang still) → ROT beim Namen,
   Warte-Kreis ["8>9", 30 s ab Sekunde 30] an 747/555 · 748/548. Mit dem Schnitt um 10 und 23 Uhr kein Kreis, kein Wagen in Wagen,
   keiner ohne Schlüssel im Ort, die Arbeit im Soll. Erst geschnitten und gefallen: das Ausscheren je Seite (außen die Ecke, innen
   die Flanke). Es löste die Wende, aber an der Messung standen die Wagen ineinander (−0,04 m, 5 174×), und der Kreis wanderte an
   die Kreuzung 836/438 (8>10, 437 s).
   **Der Fuß wandert** (`_verkehrLinie`). Mit dem Kreis-Schnitt stand eine Zeile ROT: „Ausscheren über dem Band“ an 826/442, 10 Uhr
   SUV 14 0,374 m (rund 0,27, 16° schräg zur Linie), 23 Uhr Supersport 0 0,259 m. Die Hypothese „der Leib dreht nach dem Bau“
   fiel an der Messung: beim Bau einer Linie der Route voraus stand er schon 13,5° schräg, 0,29 m vor der Probe. Der Schräg-Block
   (DER LEIB AUS SEINER LAGE) las diese Lage richtig und schrieb 0,607 an das Stück 2. Der Fuß der Bug-Ecke lag 0,29 m weiter auf
   Stück 3, dort stand das rund des Bogens (0,2696 beim Bau, 0,27 in der Probe); keiner überschrieb es. Die Linie trägt je Meter
   einen Punkt, der Fuß einer Ecke geht zwischen zwei Punkten über die Stücke dazwischen. Jetzt gilt das rund einer Ecke an jedem
   Stück von ihrem Fuß am einen Punkt bis zu dem am nächsten. VK 10 Uhr 480 s: GRÜN, das Weiteste über dem Band 0,036 m (Raum 0,1),
   rund an Stück 3 0,632; 23 Uhr 600 s: GRÜN, 0,02 m. Stoß 0, Berührung 0, ohne Schlüssel 0 zu beiden Stunden. Die Zeile trägt den Beweis: Gier beim Bau, Weg seit dem Bau, Bau
   (anfang · weiter), das Stück am Fuß, das Stück des Leibs und das rund dort beim Bau.
2. **„ohne Ziel 18 Uhr 6 %“ war die Probe, nicht der Tag.** Sie las den Plan zur Uhr (`tagesPlan`), der Wirt geht aber nach der Kette
   (`tagesZiel` über `_bewohnerKette`). Der Händler auf dem Weg zum Besuch (haendler #936614 → haus#279359, sein Werk bis 18,5 Uhr)
   zählte am Werk, also ohne Ziel. Mit dem EINEN Leser: ohne Ziel um 6 · 10 · 13 · 18 · 23 Uhr = 0 · 0 · 0 · 0 · 0.
3. **Die Ganglinie meldet, sie urteilt nicht** (Entscheid des Koordinators 13:06). Fußwege tragen werktags vier Spitzen (8 · 12 · 15 · 18
   Uhr ± 1 h), Autofahrten drei (7 · 12 · 17), nur der ÖV zwei: FHWA NHTS 2017, Brief „Non-Motorized Travel“. Das Soll „2 Spitzen“ der
   Linse war ohne Herkunft und ein Zwilling der Station rhythmus#2, die allein urteilt. Die Täter zielplan-wenden und zielplan-spitze15
   fielen mit dem Soll. Die Mittags-Spitze ist Gesetz: um 12 Uhr gehen arbeit>mittag 62 und mittag>arbeit 55 (Stadt, 477 Bewohner),
   134 und 112 (stadt-voll), der Gang zum Tisch daheim und zurück.
4. **Der Hof-Gang trägt einen zur Zeit** (`_bewohnerImHof`). Die Achse von der Tür bis vor das Tor jedes Hof-Hauses liegt zwischen
   Mauern, dort weicht keiner aus. Über sie geht nur, wer im Haus wohnt; Besuch und Kunde stehen vor dem Tor. Wer hinaus soll, tritt
   erst aus der Tür, wenn die Achse frei ist, und wer vor dem Tor hinein will, wartet, solange einer hinausgeht. Bis hier traten um
   8,45 Uhr das Kind von haus_provenzalisch #81761 und der heimgehende Werkstatt-Mann auf dieselbe 9 m lange Achse; beide standen
   Bug an Bug (2 Steckenbleiber bei 752/476). Mit dem Schnitt: 0 Steckenbleiber. OFFEN: der Täter des Hof-Gangs im Selbsttest. Nach
   dem Sprung der Uhr auf 8,3 Uhr entsteht die Begegnung nicht (0 Steckenbleiber im Fenster des Täters).
5. **Drinnen nur durch seine Tür** (`_bewohnerSchritt`). Neu gegen main (dort 0 von 402) stand „nicht über die Tür 1 von 404“:
   kind #946741 um 20,52 Uhr, drinnen bei 674,8/434,8, 80,0 m vor seiner Tür (Ziel tuer, Akt abend, drinnen soll), an keinem seiner
   Orte. Ein Wagen bat es auf dem Heimweg beiseite (`_bewohnerPlatz`). Der Schritt beiseite ersetzt den Weg, nie das Soll, und an
   seinem Ende ging jeder ins Haus, der drinnen soll. Jetzt geht nur ins Haus, wessen Weg an seiner Tür endet; am Ende des Schritts
   beiseite steht er, bis der Gang zurück ihn an die Tür trägt. Täter `bewohner-tuer` (das alte Weg-Ende; die Stadt ab 19,5 Uhr bittet
   jeden auf dem Heimweg einmal beiseite; jeder Täter der Stadt trägt dafür seine eigene Uhr, bis hier fuhr jeder 5–8 Uhr) → ROT beim
   Namen: nicht über die Tür 67 von 78, drinnen soll, 9,5 m vor seiner Tür. Am Kopf: 0.

## Das Gesetz (EIN Gesetz im Kern, TAGES_GESETZ · `_tagesWenden` · `_tagesWendenOrt` · `tagesPlan`)

| Teil | vorher | jetzt | Quelle |
|---|---|---|---|
| Beginn des Werks | 8 ± 0,5 Uhr für jeden ohne eigene Stunden | je Mensch aus dem Band der Abfahrten (`werkAb`), das Werk dauert wie das des Gesetzes | US Census, ACS 2009, Table B „Time of Departure to Go to Work“: vor 5 Uhr 4,1 % · 5–6 8,3 · 6–7 18,9 · 7–8 28,1 · 8–9 16,6 · 9–12 10,4 |
| Aufstehen · zu Bett | ein Weg über die Schwelle (vor die Tür, aus ihr hinein) | im Haus: der Morgen bis zum Aufbruch, der Abend nach der Bank vor der Tür (`_bankWende`: gleich verteilt über höchstens `bankH` 1 h nach der Heimkehr, nie über die Ruhe; bis zur Ruhe gleich verteilt staute sich die Schwelle vor ihr — im Kern-Spike um 21 Uhr 372 Wege bei der halben Spitze 354, die dritte Spitze) | Band: 22 % der Fußwege 18–6 Uhr (NHTS 2017; National Academies 2025, „Improving Pedestrian Safety at Night“) — der Kern-Spike 30,8 → 26,5 %; die Dauer ist ANGENOMMEN |
| Heimkehr vom Treff | abendTreffH fest | abendTreffH ± 0,25 h (× 0,5–1,5 hob den Ausgeglichenen bis 2,25 h an den Treff, der Zuordner las ihn gesellig) | — |
| Mittag | 12 ± 0,5 Uhr | 12 ± 1 Uhr | — |
| Der Tisch des Heimwerkers | der Fleißige isst am Werk, auch wenn das Werk sein Haus ist | wessen Werk an seinem Heim liegt (näher als der Gang `gangM` 2 m), isst am Mittag an seinem Tisch, auch der Fleißige (`_tagesWendenOrt`, `_amHeim`): der Zug nimmt dem Tag keinen Weg. An der Stadt trifft es 29 von 1 356 | die Probe bewohner nannte den Täter: rathaus/rathaus #952 im Start-Dorf, 3 Wege (mensch.K2#2 4–10) |
| Zeit-Art je Akt | — (der Zuordner las jede wache Viertelstunde im Haus als Freizeit) | `zeitArt`: arbeit · bedarf (schlaf · morgen · mittag) · haushalt (einkauf) · frei (besuch · abend · spiel und das Spiel des Abends) | Szalai 1972 (work · personal needs · free time); HETUS 2008 Guidelines (0 persönlicher Bedarf · 1 Erwerb · 36 Einkauf · 5–7 Freizeit) |
| Einkauf | jeder Mensch jeden Morgen eine Stunde über den Markt (morgenPlatzH) | EINER je Haushalt (die Tür) am Markt-Morgen VOR seinem Werk: Beginn ab der Öffnung 7 Uhr, gleich verteilt bis zum letzten Beginn, den der Schluss um 11 Uhr und sein Werk tragen; er bleibt 0,5 h je Erwachsenem seines Haushalts (`tagesEinkaufFuer`), trägt die Ware heim und geht zum Werk — kein Gang aus dem Werk; DER KAUF SCHRUMPFT NIE: den Markt verlässt er erst `morgenH` nach seiner Ankunft, ein langer Weg verschiebt sein Werk (`tagesKette`; bis hier fraß der Weg den Kauf, Kern-Spike am Platz um 8 Uhr 87 → 110); sein Stand am Platz geht ihm zuerst (`_bewohnerListe`) | Marktordnung Amberg (Laschinger 2024, Verh. Hist. Verein Oberpfalz 164, S. 103–123): 1847 April–September 7–11 Uhr, Oktober–März 8–11 Uhr, Öffnung mit Marktfahne und Rathausglocke; bis zum Schluss kaufen Bürger und Inwohner „zur Nothdurfft ihrer Haushaltung“, Fürkäufer erst danach (1544, 1606). Dauer: Einkauf und Anstehen 0,50 h je Tag (Pskow 1965; Szalai 1975 (je Befragtem: der eine Einkäufer trägt die Zeit aller), Futures 7:394, Table 5). Die Verteilung über die Marktzeit ist ANGENOMMEN |
| Leute des Markts | Werk zur Stunde ihrer Rolle (Händler 7 ± 0,5, Kaufmann und Kontor 8 ± 0,5) | ab der Öffnung (`marktAuf`) | wie oben |

Der Akt heißt `einkauf` (ATUS 07, Consumer Purchases). Der Wirt wählt den Einkäufer je Tür, wenn jede Rolle steht
(`_einkaufAnlegen`, koerper `tagesEinkaeufer`): der Erwachsene, dessen Werk am spätesten beginnt, nie ein Kind. An stadt-voll
sind es 295 Haushalte für 1 356 Menschen.

Der Feierabend im Haus (WIP dfa1e8d0, heim zum Abendbrot vor Treff oder Bank) fiel wieder: Er trug das Dorf der Linse von 3 auf 4
Wege, an der Stadt kostete er nach langem Weg die Bank (Kern-Spike: Tage mit 3 Wegen 36–40, rhythmus#2 am GTX 1 Spitze).

Der blinde Zuordner der Linse gate:mensch-zuege liest den Zug aus dem Plan in einer Kaskade: fleißig (Werk über dem Gesetz
≥ 1,5 h) · gesellig (Treff ≥ 2 h) · häuslich (Anteil frei daheim ≥ Q + 0,15 = 0,89 und frei daheim ≥ 2 h) · sonst ausgeglichen.
Q = 0,74 aus ATUS 2019 Table 11A (15 Jahre und älter: Fernsehen 2,81 + Lesen 0,27 + Ruhe und Denken 0,31 + Spiele und Computer
0,43 = 3,82 h von 5,19 h Freizeit; Band 0,74–0,80, ANGENOMMEN die Tätigkeit als Ort). Ein Akt ohne Zeit-Art ist ROT.

## Der Kern-Spike (stadt1, 1 356 Bewohner, Ganglinie wie die Station: Zielwechsel ≥ 2 m im Fenster [h, h + 0,1) × 10)

Der Spike eicht gegen das GTX: am Kern 73fef2f0 1 Spitze um 17 Uhr, Umfang 930 (GTX: 1 Spitze, 1 190 — Faktor 1,28).

| Kern | Spitzen | 21 Uhr (volle Stunde) | halbe Spitze | ab 18 Uhr | am Platz um 8 Uhr | K3 außer 4–10 |
|---|---|---|---|---|---|---|
| 73fef2f0 (Feierabend) | 1 um [17] | 447 | 473 | — | 87 | 36–40 Tage mit 3 Wegen |
| Bank bis zur Ruhe, Kauf schrumpft nie | 3 um [8, 16, 21] | 372 | 354 | 30,8 % | 110 | 0 |
| 4459df9c (`bankH` 1 h) | 2 um [8, 18] | 164 | 386 | 26,5 % | 110 | 0 |
| eb2de14f (Tisch des Heimwerkers) | 2 um [8, 18] | 164 | 386 | 26,4 % (1 654 von 6 263) | 110 | 0 (am Start-Dorf: Rathaus-Tage mit 3 Wegen 4 → 0) |

Die Treff-Streuung (± 0,25 h gegen × 0,5–1,5) ändert die volle Stunde um 21 Uhr nicht (372 gegen 366); der Unterschied im
Fenster der Station war Stichprobe.

## Die Stationen an der GTX vorher ↔ nachher

Gemessen wurde EIN Block am OMEN (GTX 1060, Runde 29 gehalten von 10:40:28 an der Stations-Grenze). main 78ed3167 stammt aus Block 1
(09:23–09:52, dieselbe Sitzung). rhythmus#2 und absicht#1 liefen mit den Stations-Kandidaten des Koordinators (koordination e08a6692,
`bericht/2511-stationen/`: rhythmus S2 mit dem Umfang ≥ 1 000 Bewohner und der Spitze ≥ 316 Wege je Stunde; absicht S1 als blinde
Kaskade mit festen Ankern). Sie liefen im eigenen schlanken pm-Baum, nie im Dienst-Baum. **Diese Kandidaten sind die Voraussetzung
für den Anspruch an rhythmus#2.**

| Station | main 78ed3167 | Kopf eb2de14f |
|---|---|---|
| mensch.K2#2 | GRÜN · Wege 5–9 (außer 4–10: 0) · Wiederkehr 0/1 424 | **GRÜN** · Wege 4–9 (außer 4–10: 0) · Wiederkehr 0/1 424 (max 1,695 m) · Sprünge 0 · Plan bit-gleich |
| karte2.mensch.menge.rhythmus#2 | ROT (lebende Station) · 3 Spitzen um [6, 18, 22] · Spitze 1 480 · Spitze zu Tal 110 | **GRÜN (Kandidat)** · 2 Spitzen um [8, 17] · Spitze 970 (≥ 316) · Spitze zu Tal 19 · 1 356 Bewohner · 6 140 Wege am Tag |
| karte2.mensch.menge.bild#2 (Auskunft) | ROT 84 im Bild · 32 gehend (drinnen 0, außer Bild 968, verdeckt 303) | ROT 72 · 19 (drinnen 536, außer Bild 566, verdeckt 174) |
| karte2.mensch.geist.absicht#1 (Kandidat) | — | ROT 0,51 (erste 20: 0,55) · kein Anspruch |
| karte2.mensch.sport.regeln#1 | — | GRÜN · ρ Rangfolge ↔ Leib 0,843 · 20 Läufe |
| karte2.mensch.netz.verkehr#1 | Nachmessung läuft (Phase 4) | ROT · nicht angekommen (2 311 von 2 396 m) · 1 Steckenbleiber |
| karte2.mensch.macht.recht#1 | Nachmessung läuft (Phase 4) | UNGEMESSEN · `/eval` ohne Antwort binnen 40 s |

**bild#2 je Stunde** (wie die Station, am Platz von stadt-voll; 8 Uhr am Kopf eb2de14f, die übrigen Stunden am Kopf 7e7b8cef, der
um 8 Uhr dasselbe trägt): 7 Uhr 28 im Bild · 14 gehend · 8 Uhr 72 · 19 · 9 Uhr 75 · 14 · 10 Uhr 78 · 7. main um 8 Uhr: 84 · 32. Bei
main stand der Morgen vor der Tür: drinnen 0 von 1 356. Am Kopf ist der Morgen im Haus (drinnen 536). Dass das
Bild um 8 Uhr ärmer wird, ist ehrlich: Das Gesetz verbietet den Morgen vor der Tür, und die Stunde wird nicht verschoben.

**rhythmus je Stunde** (GTX, Kopf): [0, 0, 0, 0, 30, 80, 190, 480, 570, 510, 40, 120, 230, 170, 30, 140, 610, 970, 820, 430, 230, 110,
170, 210]. Von 18 bis 6 Uhr liegen 2 080 der 6 140 Wege, das sind 33,9 % (Kern-Spike 26,4 %, Band 22 %).

**Die Züge je Zug** (absicht#1, die echte Station, die ersten 100): häuslich 0/29 (daheim frei 3,53 h, wach daheim 4,77 h) · fleißig
12/29 (1,48 h · 2,59 h) · ausgeglichen 26/27 (3,57 h · 4,96 h) · gesellig 13/15 (1,37 h · 3,23 h). Die Linse gate:mensch-zuege (100
Samen, Kern-Plan ohne Kette) liest 0,95 und 0,88. Die Abweichung je Zug ist offen (unten).

## Pflicht vor dem Kopf (OMEN, im Baum des Kopfs, EXIT beim Namen)

Block B, Phase 3, 11:17:31–11:33:12, im Baum des Kopfs eb2de14f. probeUrteil (scripts/lib/urteil-zeile.cjs) über jedes Probe-Log:

| Schritt | Exit | Urteil |
|---|---|---|
| format:check | 0 | GRÜN |
| lint | 0 | GRÜN |
| stamm-umzug --nach-karte | 0 | GRÜN |
| check:statik | 0 | GRÜN (530 s; ROT stehen nur die Mutanten der Selbsttests) |
| gate:pruefbuehne-licht (Probe) | 0 | GRÜN · S0 Nacht luma 21,8 · Gesetz 22,76 |
| gate:weltbild-frost:echt (Probe) | 0 | GRÜN · die Frost-Wand steht |
| gate:studio-begehen (Probe) | 0 | GRÜN |
| probe-tag (die Pflicht-Regeln des Zugs, Zweig koordination) | 0 | PROBE-TAG OK · 11 Dateien, keine Überschneidung mit 78ed3167 · Tag gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen (3 von höchstens 4) |

Das Tag trägt die drei Pflicht-Wände von Bau und Haus (der Beitrag fasst stamm/siedlung-bewohner.js an), 3 von höchstens 4.

## Das Bild (GTX 1060, dasselbe Auge für main und Kopf, 960 × 540)

Für „main“ lagen koerper-core.js und stamm/siedlung-bewohner.js von main im Baum des Kopfs. Das sind die einzigen Laufzeit-Dateien
des Beitrags. Die Rücknahme lief immer (trap), danach war der Baum sauber.

**Der Platz um 8 Uhr**, der Stand der Station bild#2 (stadt-voll, 8 Uhr). Das Auge ist NICHT die Kamera der Station: Die Blick-Wahl
der Werkbank (`bild`) fand das Ziel der Stationskamera [836,7 · 58 · 453,4] verdeckt (bauSatz in 15 m) und wählte Pose 39
[863,4 · 66,7 · 439,7], für main und Kopf dieselbe (Akte `*.abnahme.json`: ABNAHME GRÜN, weltTakte 0):
`cloud-post/tages-gesetz-bild/main-platz-08_00.jpg` ↔ `kopf-platz-08_00.jpg`. main zeigt 84 im Bild und 32 gehend, drinnen 0. Der
Kopf zeigt 72 und 19, drinnen 536. Mein Auge: Beide Märkte sind voll. Bei main stehen die Leute verstreut auf dem Platz, am Kopf ziehen
sie in Strömen über ihn, und am Rand fahren Wagen. Die schiefen fernen Leiber oben rechts stehen in beiden Bildern; sie gehören nicht
zu dieser Welle.

**Eine Wohngasse um 6:30** (`main-wohngasse-06_30.jpg` ↔ `kopf-wohngasse-06_30.jpg`). Das Auge wählte main: 7 m vor der dichtesten
stehenden Gruppe draußen (4 m), über 40 m vom Platz (51 m), in Augenhöhe 1,7 m, frei von Grundrissen, mit der Regel `pose` der STADT.
Der Kopf steht am selben Auge (px 789,78 · pz 458,29 → 784,69 · 453,48). Im Umkreis von 15 m um das Ziel: Bei main stehen 8 draußen
(9 im Akt morgen), 2 gehen, 2 schlafen drinnen. Am Kopf steht 1 draußen, 1 geht, 7 sind drinnen (6 im Akt morgen). Die ganze Stadt
um 6:30 hat bei main 791 draußen und 565 drinnen, am Kopf 293 draußen und 1 063 drinnen. Mein Auge: Bei main stehen und gehen die
Bewohner der Gasse vor ihren Türen. Am Kopf ist die Gasse leer, und der Morgen ist im Haus.

## Offen

- **absicht#1 ROT 0,51, ohne Anspruch.** Die echte Station liest jeden Zug anders als die Linse (häuslich 0/29, fleißig 12/29). Der
  Täter je Zug folgt aus der Abfrage je Person: die Kaskade der Station wörtlich, daneben dieselben 100 aus dem reinen Plan ohne Kette.
  Liegt er an der Lesung der Station, entscheidet der Koordinator den Kandidaten. Liegt er im Gesetz, ist er ein Schnitt der nächsten
  Welle und nicht dieser.
- **verkehr#1 ROT und recht#1 UNGEMESSEN am Kopf.** Die Nachmessung main ↔ Kopf läuft im selben Block während der CI. Ein Grün an main
  landet nie ROT.
- **bild#2 bleibt Auskunft**, 72 · 19 gegen Soll 100 · 40. Die Wege über den Platz sind die nächste Welle (der Zensus der 239, die um 8
  Uhr gehen, und wohin sie gehen).
- **`bankH` 1 h ist ANGENOMMEN.** Band: 22 % der Fußwege zwischen 18 und 6 Uhr. Gemessen: Kern 26,4 %, GTX 33,9 %.
- Die Stations-Kandidaten (koordination e08a6692) sind nicht lebend. Ihre Buchung nach punkte-maschine folgt der Landung.
