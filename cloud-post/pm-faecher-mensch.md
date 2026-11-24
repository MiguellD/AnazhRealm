# pm-faecher-mensch — ZWISCHENSTAND (24.11.)

Zweig `pm-faecher-mensch` (vom Zweig `punkte-maschine` 9906eb9). Geändert sind nur `stationen/k2-mensch.js` und die Dateien `stationen/k2-mensch-*.js`.
Nicht angefasst sind `faecher.js`, `punkte.cjs`, `zug/dienst/*`, `auge-klasse.cjs`, die fremden `k2-*.js`, die Leiter `mensch.kopplung.*`,
`mensch.fahrzeug.medium#2` und `mensch.nahrung.tier#2`. Zeilen im Spiel gelten für main c9da3a6 (V18.546.396); main steht inzwischen auf f18576b6.

**Messen:** Die warme Welt lädt in diesem Container nicht. Unter swiftshader standen nach 7 min 0 Chunks und der Ring blieb bei −1. Darum lief hier
kein Lauf. Die Gesetze der Kerne sind headless am Fächer in node gemessen: dieselbe Seiten-Funktion, dieselbe Bauart, `r = null`. Für `nahrung.strom`
und `nahrung.hand` gilt eine Ausnahme: Sie liefen an einem Ersatz-`r` mit den byte-genau ausgeschnittenen Funktionen der Welt
(bau-teile.js:1479–1509, koerper-leib.js:85–90 und :3154–3279). Jede headless-Zahl ist Mechanik, nie das Erlebnis. Gesetze, die die Welt brauchen,
stehen als „in der warmen Welt ungemessen“. **Jede Bildpflicht ist ungemessen bis zum Gerät.**

**Bauart (k2-mensch.js, 748cbfe):** Eine Augen-Sprosse darf jetzt `erwartet: "leser"` mit `fehlt` und `wo` (datei:zeile) tragen. Das heißt: Das
Gesetz trägt den Umfang, aber der Leser im Spiel fehlt. Die Station meldet dann ROT „fehlender Leser“, die Tafel-Zeile ist „gleich“. Vorher kannte
eine Augen-Sprosse nur `erwartet: "nicht"`.

## Je Front (42; Reihe wie die Front-Tafel vom 24.11. 01:03)

Jede Zeile nennt: das Urteil der Station (headless), die gemessene Zahl, die fehlende Fähigkeit mit Datei:Zeile, ob die Station urteilt, und das Bild.

**Bühne Menge (7)**

- `karte2.mensch.sport.kunst#1`
  - Urteil: ROT „fehlender Leser“.
  - Zahl: in der warmen Welt ungemessen. Das Gesetz `LEBENSLAUF.uebung` trägt besteH 10 000 h, amateurH 2 000 h und 3 Künste.
  - Fehlt: Kein Leib zeigt das Können. `koerper-core.js:5484` tagesHaltung liest nur Akt und Rolle. Der einzige Leser der Übung ist `stamm/siedlung-bewohner.js:1292`.
  - Urteilt: ja.
  - Bild: das Blindpaar Meister ↔ Anfänger, ungemessen bis zum Gerät.
- `karte2.mensch.menge.seuche#1`
  - Urteil: Zahl aus abweichung, konsum und bildpaar. Die Mutanten werden ROT bei abweichung 0 und bei konsum 0,5.
  - Zahl headless am Kern (11 Rollen × 50 Saaten): 40,69 % der halben Stunden eines Krank-Tags weichen ab, 10 741 von 10 741 Abweichungen liegen daheim.
  - Der Konsum am Soll der Welt (`stamm/siedlung-bewohner.js:2637`) ist in der warmen Welt ungemessen.
  - Fehlt an S2: Ansteckung gibt es nicht. Krank ist ein Wurf je Bewohner und Woche (`stamm/siedlung-bewohner.js:303`).
  - Urteilt: ja.
  - Bild: das Bildpaar gesund/krank, ungemessen bis zum Gerät.
- `karte2.mensch.stadt.habitat#1` · ROT „Umfang nicht erzeugbar“ · 20 von 20 Adressen: 0 Bewohner unter Grade; 105 von 312 Losen haben einen Keller bis −2,4 m, unter Grade stehen nur Keller, Kohlenkeller, Küche, Vorrat und Zisterne · fehlt: `fachwerk-core.js:236` (Keller 2,40 m), BAU_NUTZUNG.raeume `:2686` ohne Wohnraum unter Grade, DORF `:5218` setzt jedes Los auf Grade · urteilt: ja · kein Bild.
- `karte2.mensch.nahrung.strom#2` · ROT „fehlender Leser“ (`koerper-core.js:5761`) · am Ersatz-`r`, 60 von 60 Adressen: draußen beim Mahl höchstens 291 Personen (31 / 103 / 291 nach Größe), der größte Tisch 173 · fehlt: kein Korb vom Feld, kein Gericht; das Mahl ist eine Zahl je Kopf aus der Scheune (`:5761`, Ernte `:5902`) · urteilt: ja · Bild: das Bildpaar Gericht, ungemessen bis zum Gerät.
- `karte2.mensch.nahrung.hand#3` · ROT „fehlender Leser“ (`stamm/siedlung-wege.js:2975`) · am Ersatz-`r`, 12 von 12 Adressen: am Acker höchstens 122 Personen, an einem einzelnen Acker höchstens 13 · fehlt: der Acker liest nur die Tat des Spielers; es gibt keine Fläche je Stunde (`koerper-core.js:5732`), jedes Werk hat die Haltung pwalk (`:5432`) · urteilt: ja · Bild: der Erntetag, ungemessen bis zum Gerät.
- `karte2.mensch.wirtschaft.beruf#2` · ROT „Umfang nicht erzeugbar“ · 20 Saaten: höchstens 25 Berufe an einer Adresse, EINE Haltung beim Akt arbeit (pwalk), EIN Werkzeug (beil), 0 Berufe mit eigener Handlung · fehlt: die Haltung folgt dem Akt (`koerper-core.js:5484`, `:5432`); dasselbe Werkzeug für jede Hand (`schmiede-core.js:3396`); Leser `stamm/siedlung-bewohner.js:2729` · urteilt: ja · Bild ungemessen bis zum Gerät.
- `karte2.mensch.zukunft.leib#1` · ROT „Umfang nicht erzeugbar“ · 20 Saaten, am Stamm: 0 von 1 200 Leibern tragen ein Ersatzglied; der Gang ist links wie rechts (Schritt 1,000 gegen das Band 0,93–0,98, das nur aus Zusammenfassungen stammt) · fehlt: ein Glied mit Seite im Bau (`koerper-core.js:1634`) · urteilt: ja · Bild ungemessen bis zum Gerät.

**Keine Station (21)**

- `karte2.mensch.leib.verschieden#1` · Augen-Sprosse der Klasse P, wartet aufs Panel · 20 Saaten × 10: 0 Zwillinge (der kleinste Abstand 6,33 px auf 2 m); 121 von 900 Paaren haben dasselbe Gesicht und denselben Haarschnitt · am Gesetz kein ganzer ROT-Grund (`stamm/siedlung-bewohner.js:452`, `:557`, Leser `:607`) · urteilt: nein · Bild ungemessen bis zum Gerät.
- `karte2.mensch.leib.tracht#1`
  - Urteil: ROT „Umfang nicht erzeugbar“.
  - Zahl: Ein idealer Prüfer trifft die Epoche am Rezept zu 0,65, gefordert sind 0,7. 10 von 20 Saaten tragen eine Tracht, deren Epoche über 100 Jahre entfernt ist (höchstens 947 Jahre).
  - Diese Obergrenze liegt am Gesetz; darum ist der ROT-Grund ganz.
  - Fehlt: epocheBei nimmt die erste Epoche der Achse als Boden (`fachwerk-core.js:4945`, `:5295`). Leser ist `stamm/siedlung-bewohner.js:458`.
  - Urteilt: ja.
  - Bild: ungemessen bis zum Gerät.
- `karte2.mensch.leib.ausdruck#1` · Klasse P, wartet aufs Panel · im Stehen 6 Haltungen (das nächste Paar liegt 0,14 rad auseinander), im Gehen EINE (run) · urteilt: nein · der Anteil der Gehenden ist in der warmen Welt ungemessen · Bild ungemessen bis zum Gerät.
- `karte2.mensch.geist.innenleben#1`
  - Urteil: ROT „Umfang nicht erzeugbar“.
  - Zahl: Mit Anlass erscheint nur Furcht, und die nur im Stehen. Zorn gibt es nicht, weil sorrow zu chaos wird (`stamm/kreatur-verhalten.js:2730`).
  - Ohne Anlass ist der Bewohner nicht neutral (`koerper-core.js:5432`). Das Gesicht hat 0 Mienen-Achsen.
  - Urteilt: ja.
  - Die Gemüt-Probe in der warmen Welt ist ungemessen.
  - Bild: der Film, ungemessen bis zum Gerät.
- `karte2.mensch.menge.kollektiv#2`
  - Urteil: Zahl aus front und flucht. Nach Bauart wird die Front ROT.
  - Zahl headless am Kern: Der Fluchtradius aus zweiter Hand ist zeugeM, also 25 m (`tetrapoda-core.js:2068` fluchtRadius, eigen false).
  - Das Gesetz erreicht alle Zeugen bis 25 m im selben Ruf, also in einem Takt von 0,1 s. Daraus folgt eine Front ≥ Saum ÷ 0,1 s. Im Testrahmen der Station waren das 246 m/s, gefordert sind 3–8 m/s.
  - Flucht und Saum sind in der warmen Welt ungemessen.
  - Fehlt: `stamm/siedlung-bewohner.js:2421` _bewohnerZeuge trägt die Kunde nicht über Sicht und Klang und kennt keinen Abstand in der Zeit (zeugeM `:4634`).
  - Urteilt: ja.
  - Bild: die Flucht, ungemessen bis zum Gerät.
- `karte2.mensch.stadt.groesse#1`
  - Urteil: ROT „Umfang nicht erzeugbar“. Der Grund ist das Zwilling-Prädikat über den Fächer, nicht der Umfang: Eine Augen-Sprosse der Klasse P wird nur so ganz ROT.
  - Zahl: 20 Weiler mit 9–23 Bauten; in 9 von 20 stehen Form-Zwillinge (Portanum hat 5 gleiche Scheunen).
  - Fehlt: die Breiten-Klemme `fachwerk-core.js:5221` und die Scheunen-Regel `:5259–5261`.
  - Urteilt: ja.
  - Bild: Panel-2AFC, ungemessen bis zum Gerät.
- `karte2.mensch.stadt.vertikal#2` · ROT „Umfang nicht erzeugbar“ · 90 Adressen (10 Saaten × 9 Epochen) in 25,7 s: der höchste Turm hat 23 Geschosse, das höchste Gebäude ist 70,9 m hoch (Soll 30 Geschosse / 100 m) · fehlt: BAU_NUTZUNG.turm deckelt bei 8–23 Geschossen (`fachwerk-core.js:2711`, DOWNTOWN `:5235`) · urteilt: ja · Bild: die Silhouette, ungemessen bis zum Gerät.
- `karte2.mensch.stadt.breite#1` · Klasse P, wartet aufs Panel · 30 von 30 Orten: 6 Regionen, jede mit eigenen Stilen · urteilt: nein · Bild ungemessen bis zum Gerät.
- `karte2.mensch.stadt.siedlungsnetz#2` · ROT „fehlender Leser“ (`stamm/siedlung-ort.js:3711`) · 300 Fenster (3 Welten × 10 × 10 über 1 000 km): 70 409 Orte, 284 Städte, gerechnet in 586 ms · fehlt: die Welt weckt nur, was ≤ 260 + 160 m vom Spieler liegt; die Ferne baut nur Wort-Städte (`stamm/siedlung-wege.js:2025`) · urteilt: ja · Bild: die Nacht, ungemessen bis zum Gerät.
- `karte2.mensch.stadt.messlatte#1` · Klasse P, wartet aufs Panel · 12 Orte der Stufe 1: 11 tragen eine Straße von ≥ 100 m (Kette, Knick ≤ 35°), mit 3–11 Fassaden und 0–6 Läden · urteilt: nein · Leute und Wagen sind in der warmen Welt ungemessen · Bild ungemessen bis zum Gerät.
- `karte2.mensch.netz.verkehr#2`
  - Status: bestehend, `pflicht.C#1` (g5.js:6421) urteilt.
  - Die fremde Station urteilt das Gesetz an zwei Stunden, nicht an einem Fächer.
  - Tafel: „fehlt“ (`vision/richter-tafel.json:1017`), weil keine Probe von höchstens 60 s 10 min tragen kann.
  - Zahl: in der warmen Welt ungemessen.
  - Eigene Station: nein.
  - Bild: „Wagen im Bild“ urteilt `pflicht.C#2`, ungemessen bis zum Gerät.
- `karte2.mensch.bau.bedarf#1` · Klasse P, wartet aufs Panel · 19 von 20 Dörfern tragen ≥ 4 Funktionen; blind am Rezept getrennt zu 75 %, aus der Form allein zu 79 %, Kirchen zu 50 % · Lücke: markBei (`fachwerk-core.js:5241`) gibt der Kirche kein Mal, das Feld mark (`:2713`) hat keinen Leser · urteilt: nein · Bild ungemessen bis zum Gerät.
- `karte2.mensch.bau.huelle#1` · Klasse P, wartet aufs Panel · 309 von 309 Häusern tragen Tür und Rezept; die 10 häufigsten Kulturen sind blind am Rezept zu 90 % getrennt · urteilt: nein · Bild ungemessen bis zum Gerät.
- `karte2.mensch.fahrzeug.lenker#1`
  - Urteil: Zahl an der warmen Welt (verkehrLauf). Ein Fächer geht nicht, weil das Gesetz eine innere Funktion von `_verkehrFolge` ist.
  - Zahl: in der warmen Welt ungemessen. Die Konstanten sagen ROT voraus: 2,5 m Abstand bei 8,3 m/s sind 0,30 s, das Band ist 1–3 s.
  - Fehlt: eine Zeitlücke (`stamm/siedlung-verkehr.js:1832`, der Abstand an `:2501`; VERKEHR_GESETZ `fachwerk-core.js:5743` trägt keine).
  - Urteilt: ja.
  - Frist: 1 h Spielzeit sind 1 500 Takte. Braucht ein Takt mehr als 40 ms, wird die Station UNGEMESSEN.
- `karte2.mensch.nahrung.erdbau#1` · bestehend, `gelaende.K2#1` urteilt (g1.js:3616) · die fremde Station steht auf einer Bühne an der Graben-Bahn, nicht an einem Fächer; eine eigene Station gäbe eine Kollision in der Tafel · eigene Station: nein · Bild am Gerät der fremden Station.
- `karte2.mensch.wirtschaft.markt#2` · ROT „Umfang nicht erzeugbar“ (vorher „leser“ mit dem veralteten `wo` `stamm/bau-vorlagen.js:1128`) · 20 Saaten: 2 Waren an einem Markt (eisen, kraut), kein Preis · fehlt: herstellung hat 2 Zeilen und kein Brot (`koerper-core.js:5731`), bestandHalter trägt keinen Preis (`:5806`), eine Missernte gibt es nicht (`:5884`) · urteilt: ja.
- `karte2.mensch.wirtschaft.handel#2` · ROT „Umfang nicht erzeugbar“ · in der warmen Welt ungemessen · fehlt: Routen zwischen Orten gibt es (`fachwerk-core.js:5616`, `stamm/siedlung-ort.js:3413`), aber keinen Handel darauf; der Lieferwagen bindet EINE Siedlung (`stamm/siedlung-verkehr.js:476`) · urteilt: ja.
- `karte2.mensch.wirtschaft.technik#2` · ROT „Umfang nicht erzeugbar“ · 50 Saaten: 14 Techniken, 6 Pfadfolgen, 0 Erfindungsjahre · fehlt: die 10² Techniken (`fachwerk-core.js:4305`) und das Jahr je Erfindung (technikStand `:4357`) · urteilt: ja.
- `karte2.mensch.macht.stand#1` · Klasse P, wartet aufs Panel · 20 Saaten: Gini der Wohnfläche 0,152–0,276 (Mittel 0,222; der Ackerbau-Median nach Kohler et al. 2017 liegt bei 0,35); zwei Stände an 85 % der Saaten · urteilt: nein · Bildpaar ungemessen bis zum Gerät.
- `karte2.mensch.kultur.verstaendigung#1` · Zahl, als Fächer über die Kulturen des Orts · in der warmen Welt ungemessen · Täter: _bewohnerKopf (`stamm/siedlung-bewohner.js:2376`) hat keinen Kultur-Eingang, die Geste (`koerper-core.js:7848`) antwortet nicht; Leser `:2190` · urteilt: ja.
- `karte2.mensch.zeit.spanne#1` · ROT „Umfang nicht erzeugbar“ (die Tafel geht von „fehlt“ auf „gleich“) · 5 Saaten × 4 Halte: an 5 von 5 Zellen ist 1600 derselbe Ort wie 1800 · fehlt: epocheDerSaat (`fachwerk-core.js:4395`) · urteilt: ja · Bild VIER ungemessen bis zum Gerät.

**Bühne Umfang sonst (12)**

- `karte2.mensch.leib.spur#1` · ROT „fehlender Leser“ (`stamm/siedlung-bewohner.js:607`) · 20 Saaten × 60: das Genom trägt 2,1–89,6 Jahre, der Leib zeigt höchstens 73,9; 242 von 752 Erwachsenen liegen über 15 Jahre daneben · die Wurzel sind die Gewichte in _bewohnerAbstand (`:538`) · urteilt: ja · Bild ungemessen bis zum Gerät.
- `karte2.mensch.fahrzeug.form#2` · ROT „fehlender Leser“ (vorher „nicht“) · 54 Baupläne auf dem Kipptisch von 5–85°: 0 kippen, nach SSF müssten sie bei 42,9–66,3° kippen · fehlt: die Last wird nur längs verlagert (`vehicle-core.js:3990`), quer gibt es allein die Wank-Feder (`:3909`) · urteilt: ja.
- `karte2.mensch.fahrzeug.gestalt#1` · ROT „Umfang nicht erzeugbar“ · 600 Wagen (100 Saaten × 6 Gattungen): 48 Gestalten, das ist 1 Geometrie × 8 Lacke je Gattung · fehlt: die Geometrie hängt nicht vom Samen ab (`vehicle-core.js:3363`) · urteilt: ja · Bild ungemessen bis zum Gerät.
- `karte2.mensch.nahrung.flur#2` · ROT „Umfang nicht erzeugbar“ · 24 Adressen: die Flur hat höchstens 0,00168 km² (Soll ≈ 1 km²), 101 Äcker zu 107–286 m² · fehlt: 1–2 Äcker je Ende eines Feldwegs (`fachwerk-core.js:6563`) · urteilt: ja · Bild: das Luftbild, ungemessen bis zum Gerät.
- `karte2.mensch.nahrung.jenseits#1` · ROT „Umfang nicht erzeugbar“ · 24 Adressen: 0 Gewächshäuser, 0 Gärten · fehlt: Beete gibt es nur im Hof-Gesetz (`fachwerk-core.js:4196`), ohne Klima und ohne Leser (`:7081`) · urteilt: ja · Bild ungemessen bis zum Gerät.
- `karte2.mensch.kultur.gestalt#1`
  - Urteil: Augen-Sprosse, wartet aufs Panel. Die Zahl-Hälfte trägt das Gesetz.
  - Zahl: 20 Orte, U_eff 14,16 ≥ 10; 10 Kulturen sind am Rezept blind zu 90,4 % getrennt.
  - Korrektur: Der Arbeiter hatte ROT mit der Tracht begründet. Die Tracht steht nicht im Wortlaut der Sprosse („an Häuser-Bildern“); sie bleibt nur als Befund in der Akte (EINE Tracht je Ort, `fachwerk-core.js:5295`).
  - Fehlt in der Bauart: die Klasse P für `mensch.kultur.gestalt#1` in `stationen/auge-klasse.cjs`. Darum trägt die Sprosse formal `erwartet "nicht"`, während die Probe ein Augen-Urteil liefert.
  - Urteilt: nein, keine Anspruchs-Zeile.
  - Bild: das Blindpaar, ungemessen bis zum Gerät.
- `karte2.mensch.kultur.diffusion#1` · ROT „Umfang nicht erzeugbar“ · 20 Orte in 6 Regionen: an einer Grenze stehen 0 gemischte Kulturen (Soll 2) · fehlt: der Auftrag eines Orts trägt keinen Nachbarn (`fachwerk-core.js:11165`), poolAt nimmt nur die eigene Region (`:5206`) · urteilt: ja.
- `karte2.mensch.kultur.strassenleben#1` · ROT „Umfang nicht erzeugbar“ · 10 Orte mit 13–222 Häusern: höchstens 1 Lokal je Ort (Soll 3) · fehlt: das Gasthaus hat `los: 1` (`fachwerk-core.js:5103`), ein Gericht gibt es nicht (`koerper-core.js:5407`) · urteilt: ja.
- `karte2.mensch.zeit.erde#1` · ROT „Umfang nicht erzeugbar“ · 2 Saaten × 3 Orte: alle drei werden Steinstadt in Mitteleuropa, um 100 sind 0 % der Häuser römisch · fehlt: der Auftrag trägt nur seed, nH und epoche (`stamm/siedlung-ort.js:1247`) · urteilt: ja · Bild ungemessen bis zum Gerät.
- `karte2.mensch.zukunft.technik#1` · ROT „Umfang nicht erzeugbar“ · 20 Saaten: +50 Jahre bringen 0 neue Dinge (−50 Jahre bringen 10) · fehlt: DORF schneidet das Jahr an der Gegenwart ab (`fachwerk-core.js:5290`); die Fahrzeug-Achse (`vehicle-core.js:4980`) liest in stamm niemand; die Flotte liest kein Jahr (`stamm/siedlung-verkehr.js:372`) · urteilt: ja · Bild ungemessen bis zum Gerät.
- `karte2.mensch.zukunft.medien#1` · ROT „Umfang nicht erzeugbar“ · 20 Saaten: 0 Bildflächen bei 1 285 Häusern · fehlt: `fachwerk-core.js:7525`, `:8809` · urteilt: ja · Bild ungemessen bis zum Gerät.
- `karte2.mensch.zukunft.maschinenwesen#1` · ROT „Umfang nicht erzeugbar“ · 0 Maschinen unter den 76 Namen der Kerne · fehlt: kein Kern trägt ein Maschinenwesen (Leser `stamm/kreatur-leben.js:2621`) · urteilt: ja · Bild ungemessen bis zum Gerät.

**Bühne Saaten (1)**

- `karte2.mensch.fahrzeug.maschine#2` · ROT „Umfang nicht erzeugbar“ · 8 Adressen (Rad und Segel × Wind 0–1): das Rad dreht bei Flaute mit 0,7 rad/s wie im Sturm, 0 Mühlen-Rezepte unter 126 · fehlt: kein Kern trägt eine Mühle; das Rad dreht nach t · 0,7 (`stamm/koerper-leib.js:3229`) · urteilt: ja · Bild ungemessen bis zum Gerät.

**Bühne Spieler (1)**

- `karte2.mensch.macht.krieg#1` · ROT „fehlender Leser“ (`stamm/kampf.js:92`, vorher „nicht“) · in der warmen Welt ungemessen · fehlt: einen Zweikampf gibt es nicht; der einzige Schwung ist der des Spielers, sein Hieb fegt nur über state.creatures (`:447`) · urteilt: ja · Bild ungemessen bis zum Gerät.

## Anspruch (für zug/anspruch.txt; nur Fronten, deren Station urteilt und deren Tafel-Zeile „gleich“ ist — 32)

```
pm-faecher-mensch karte2.mensch.sport.kunst#1,karte2.mensch.menge.seuche#1,karte2.mensch.menge.kollektiv#2,karte2.mensch.stadt.habitat#1,karte2.mensch.stadt.groesse#1,karte2.mensch.stadt.vertikal#2,karte2.mensch.stadt.siedlungsnetz#2,karte2.mensch.wirtschaft.beruf#2,karte2.mensch.wirtschaft.markt#2,karte2.mensch.wirtschaft.handel#2,karte2.mensch.wirtschaft.technik#2,karte2.mensch.macht.krieg#1,karte2.mensch.leib.tracht#1,karte2.mensch.leib.spur#1,karte2.mensch.geist.innenleben#1,karte2.mensch.zukunft.leib#1,karte2.mensch.zukunft.technik#1,karte2.mensch.zukunft.medien#1,karte2.mensch.zukunft.maschinenwesen#1,karte2.mensch.nahrung.strom#2,karte2.mensch.nahrung.hand#3,karte2.mensch.nahrung.flur#2,karte2.mensch.nahrung.jenseits#1,karte2.mensch.fahrzeug.maschine#2,karte2.mensch.fahrzeug.gestalt#1,karte2.mensch.fahrzeug.form#2,karte2.mensch.fahrzeug.lenker#1,karte2.mensch.kultur.diffusion#1,karte2.mensch.kultur.strassenleben#1,karte2.mensch.kultur.verstaendigung#1,karte2.mensch.zeit.spanne#1,karte2.mensch.zeit.erde#1
```

Ohne Anspruch bleiben zehn Fronten. Acht warten aufs Panel: leib.verschieden#1, leib.ausdruck#1, stadt.breite#1, stadt.messlatte#1, bau.bedarf#1,
bau.huelle#1, macht.stand#1 und kultur.gestalt#1. Zwei stehen bestehend bei fremden Stationen: netz.verkehr#2 und nahrung.erdbau#1.

## Selbsttest

- `k2-mensch.js --selbsttest`: beim Start der Arbeiter 544 Stationen und 5 373 Mutanten mit 0 falsch, nachher 544 Stationen und 5 400 Mutanten mit 0 falsch.
- `punkte.cjs selbsttest --ohne 3c`: vorher 266 von 275 GRÜN. Die 9 ROT kommen aus der Umgebung: BEFEHL TRÄGT, 2 × WACHE, LEBENSZEICHEN DES ZEUGEN und 5 × KONSUM. Nachher 271 von 275 GRÜN, die grüne Zahl ist nicht gesunken. Die 4 ROT sind dieselben wie vorher (BEFEHL TRÄGT mit demselben Wortlaut, 2 × WACHE, LEBENSZEICHEN). Die 5 KONSUM standen diesmal GRÜN; sie hängen von der Umgebung ab.

## Offen (mit Adresse)

- **Warme Welt:** Alle Fächer, die die Welt brauchen, sind ungemessen. Das sind sport.kunst#1, der Konsum von menge.seuche#1, menge.kollektiv#2, wirtschaft.handel#2, macht.krieg#1, kultur.verstaendigung#1, fahrzeug.lenker#1 und die Zensus-Teile. Sie warten auf den Lauf am Gerät (Radeon/GTX, `punkte.cjs run`); in diesem Container lädt die Welt nicht (swiftshader, 0 Chunks).
- **Tafel:** Die Zeilen der Fronten ohne Akte faltet `punkte.cjs tafel --schreibe` in `vision/richter-tafel.json`. Das ist ein Schritt des Koordinators. Neu „gleich“ sind darunter `stadt.groesse#1` und `zeit.spanne#1`.
- **Klasse P fehlt** in `stationen/auge-klasse.cjs` für `mensch.kultur.gestalt#1` ([P, „10 Kulturen an Häuser-Bildern blind getrennt ≥ 80 %“]). Das gilt ebenso für `mensch.fahrzeug.gestalt#1`, sobald das Gesetz 10² Gestalten trägt.
- **Panel (R11):** Acht Sprossen warten mit getragener Zahl-Hälfte: verschieden#1, ausdruck#1, breite#1, messlatte#1, bedarf#1, huelle#1, stand#1 und kultur.gestalt#1.
- **Fremde Leiter `mensch.nahrung.tier`, nicht angefasst:** Nach `return K.nicht(2, …)` sind `k2-mensch-nahrung.js:943` und `:953` unerreichbar, `z` und `wer` sind an `:955–959` nicht definiert. Darum werden S3–S7 UNGEMESSEN.
- **Commit 5276a5b** nennt „39 Fronten“; es sind 37. Mit den 3 aus 9a36dc8 und 748cbfe urteilen 40 Stationen, 2 Fronten bleiben bestehend.
- **Band zukunft.leib#1** (Schritt 0,93–0,98): Es stammt nur aus Zusammenfassungen, den Volltext konnte ich nicht abrufen.

Karte 2 gebucht 83 von 1 718 (`vision/karte-2-stand.json` im Zweig `punkte-maschine` 781aa7d, „heute“: 83; zum Start des Auftrags standen dort 82). Dieser Zweig bucht keine Sprosse.

**Geschnitten:** 40 Fronten des Kapitels mensch urteilen jetzt das Gesetz am Fächer statt an einer Bühne, 2 bleiben bestehend; jede Station trägt eine schlechteste Adresse oder eine Mutante am Täter.
**Gemessen:** headless am Kern unter anderem 0 Bewohner unter Grade, 23 Geschosse als höchster Turm, 70 409 Orte gegen einen Weck-Radius von 420 m, 0 von 1 200 Ersatzgliedern, Front ≥ 25 m in einem Takt, 40,69 % abweichende Krank-Stunden; der Selbsttest k2-mensch steht bei 5 400 Mutanten, 0 falsch.
**Offen:** die Fächer der warmen Welt und jedes Bild (ungemessen bis zum Gerät), der Tafel-Faltschritt, eine fehlende Klasse P in auge-klasse.cjs und der Fehler der fremden Leiter tier.
