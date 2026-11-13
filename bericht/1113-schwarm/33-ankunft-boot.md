# 33 Pflicht B — die Boot-Kette bis zum ersten Bild (Programme statt Tor)

## Was es den Spieler kostet (mit Bildpfad)
- `KO/probe-post/w28-stoff-stufe-null/1-heute-erstbild.jpg` (GTX 1050 kalt, 21,6 s ab Navigation, Genesis-Sonde): unten brauner,
  gesprenkelter Boden über die halbe Höhe, links und rechts je eine Baumwand, in der Mitte eine Lücke mit flachem Horizont,
  darüber blauer Himmel mit weißen Wolkenbändern. Das Bild ist ganz. Bis dahin sieht der Spieler ~22 s lang den Ladeschirm.
- `.../2-stufe0-erstbild.jpg` (Stufe 0, 17,8 s): Boden, Kronen und Ferne weiß, nur die Felsen tragen Farbe — 4 s früher, aber ein
  anderes Bild. Diesen Preis zahlt der Spieler nicht (siehe Entscheidung).
- Zahlen der Wartezeit: GTX 1050 kalt Bild 22,1 s ab Navigation, davon vor dem Renderer 4,2–5,9 s, Bild − Renderer 16,3–16,8 s;
  Zweit-Boot 9,84 s (`KO/bericht/1113-bild-wartet.md:8,27,42`). Karte: `ankunft.K1` GTX 1060 12,03 s ↔ Soll 10 (11.11.), Radeon
  12,95 s ↔ 5, „Bild nicht ganz" (13.11.) (`KO/bericht/1113-kurs-B-meisterkarte.md:141`). Der CLAUDE.md-Stand (16,6 s, 18.10.) ist alt.

## Was die Quelle sagt
- Das Tor: `stamm/dirigent-ankunft.js:786` `_ankunftsBild` fragt `_weltbildLuecken` (:1136); jede offene Lücke hält (:794–811), erst
  leer ruft es den EINEN Schreiber `_weltbildSteht` (:854, :882). Term „zeichnung" :1206–1214 liest `_bildWartet` (`stamm/bild-kosten.js:1170`).
- Der Eintrag: `stamm/bild-kosten.js:1106–1107` `_erstWartet` trägt JEDEN Bürger der Welt-Szene ein, der zeichnen wollte (`:575`
  `buerger`, `:645` `getDrawParameters()`), in jedem Pass samt Kaskaden; Kegel und Schirm-Fläche fragt er nicht. Die Liste leert der
  Takt je Bild (`stamm/dirigent-takt.js:66`).
- Was vor dem Bild entsteht (GTX 1050 kalt, n 3, `1113-bild-wartet.md:8–26`): 43 Pipelines, Knoten-Bau Σ 4,24 s im Haupt-Faden,
  Übersetzung Σ 41,9 s (überlappend, EINE Schlange des GPU-Prozesses), 1,99 MB Text. Sichtbar ≥ 0,1 %: 8 (Σ 11,8 s, 0,64 MB);
  Einmal-Render 18 (Σ 12,9 s, 0,39 MB); Bürger < 0,1 %: 16 (Σ 17,2 s, 0,95 MB, acht mit 0,00 %).
- Kalt gegen warm: Übersetzung Σ 41,9 → 7,6 s, Knoten-Bau 4,24 → 3,12 s, Bild 22,1 → 9,84 s (`:8,27`). Die Station misst kalt MIT
  leerem Shader-Speicher (`PM/punkte/pflicht.json:27`) — jedes KB Text zählt in B voll.
- Text zu Zeit (Spike Stufe 0, `KO/bericht/1113-stoff-stufe-null.md:31–35`): 1,99 → 1,03 MB und 4,06 → 1,25 s Knoten-Bau senkten
  Bild − Renderer kalt 16,8 → 13,7 s. Ableitung, nicht Gesetz: rund 3 s je MB auf der GTX 1050.
- Tor früher öffnen trägt nicht: c2 (die acht 0,00 % zurückgehalten) 14,0 · 14,3 s gegen heute 16,3 s (n 1); c3 (alle 16) 13,4 · 18,1 s
  (`1113-bild-wartet.md:117`). Umordnen nach Fläche: kalt 16,8 → 17,9 s, später (`1113-stoff-stufe-null.md:23–25,31`).
- Die Familien mit mehr als einem Programm vor dem Bild (Tabelle `1113-bild-wartet.md:70–113`):
  Nah-Wiese 3 (`nahWiese:L1:0:0` · `Lf:schale` · `Lf:0:0,1:0`): Knoten 517 ms, Übersetzung 4,6 s, 285 KB, im Bild 0,02 %.
  Fern-Ring 2 (frei 142 KB · Naht 152 KB): die Naht wird erst bei 19,22 s bestellt und steht 0,42 s vor dem Bild als letzte; sie deckt
  0,03 %. Ihr Draw-Bereich startet leer (`stamm/gelaende-fern.js:452–453`), ein leerer Bürger baut nur als Arena vor (`bild-kosten.js:650–652`).
  Bäume 2 (Teil 0 und Teil 2, 177 KB). Würfe 8 (≈ 147 KB, 7 davon ≤ 0,02 %). Ein Wurf mit Ausschnitt baut je Graph sein eigenes
  Programm (`stamm/stoff-material.js:586–619`).
- Der Licht-Pool steht als Term in JEDEM beleuchteten Programm: `stamm/stoff-material.js:2064` und Schleife :2421, 8,8 KB je Programm
  × 20. Fragment-Text vor dem Bild 2,16 → 2,00 MB, wenn das Licht ein Pass wird (`KO/bericht/1113-schwarm/17-nacht-laternen.md:20–32`).
- Gesetzbuch KANN gegen Welt KONSUMIERT: die Programm-Probe zählt jede Pipeline des Boots mit der Länge ihres Texts
  (`scripts/diag-boot-stage.cjs:167–196`), kalt nennt sie nur die ANZAHL (`:204`), nie KB. Keine Abgabe führt diese Zeile.
- Vor dem Renderer (kein Programm): Browser-Start 2,35–2,40 s, 102 Skripte mit 15,4 MB in 1,7–1,9 s, `renderer.init` 0,85–1,5 s
  (`1113-bild-wartet.md:42–53`); `index.html` trägt 80 `<script`-Zeilen.

## Die EINE begrenzende Entscheidung
B fällt NUR durch weniger Programm-Text bei byte-gleichem Bild. Kein Tor öffnet früher (`_erstWartet`/`_ankunftsBild` bleiben, wie sie
sind), kein Ersatz-Stoff, keine Umordnung. Gezählt wird mit der Programm-Zeile vor dem Bild (GTX 1050 kalt, dieselbe Pose:
heute 43 Pipelines · 1,99 MB · 4,06 s Knoten-Bau). Sie steht als Kosten-Zeile in JEDER Klassen-Abgabe und steigt nie über heute.

## Der Schnitt (die Klasse ganz)
Die Klasse heißt „ein Term oder eine Stufe, die als eigenes Programm oder in jedem Programm vor dem Bild übersetzt". Sie fällt in den
Klassen-Wellen, die ohnehin fahren. B ist dort nur die Zeile, nie eine eigene Jagd.
- Stufe 1, die Zeile: `scripts/diag-boot-stage.cjs:204` nennt kalt neben der Anzahl auch Σ KB (die Länge steht schon in der Kennung
  `:175`) und die Pipelines bis `_weltbildDa`. Das ist eine Zeile einer bestehenden Probe: kein Soll, keine Schwelle, kein neues Gate.
- Stufe 2, Wiese (`w28-wiese-fern`): die Schale fällt, damit −1 Pipeline (`nahWiese:Lf:schale`: 92 KB, 158 ms Knoten, 1,49 s Übersetzung).
  Leser: `stamm/vegetation-wiese.js:1104–1211` (`_wieseSchaleSenke`), :1029 (`_wieseSchaleDaten`), :462–464, :590–611 (WGSL Art 7).
- Stufe 3, Licht: der Pool verlässt jeden Stoff und wird EIN Pass (Blatt 17), −160 KB Fragment, +1 Programm 7,4 KB. Leser:
  `stamm/stoff-material.js:687–694, 2037–2069, 2414–2500`, `dirigent-kern.js:1601–1704`, `bild-schatten.js:399–529`, `bild-kosten.js:2097`.
- Stufe 4, Fern-Ring: die Naht wird mit dem freien Stoff bestellt, nicht erst bei der Teilung. Die letzte Kette vor dem Bild
  (Teilung → Draw → 2,42 s Übersetzung) wird damit parallel. Untere Marke 0,5 s (`1113-bild-wartet.md:59`). Leser: `gelaende-fern.js:258,
  290–394, 452–461, 1292–1349`, `dirigent-ankunft.js:1186` (Term „wird geteilt"), `bild-kosten.js:645–652`. Band 12 von gate:fern-ring
  (die Weiche kostet nur an der Naht) bleibt; zwei Programme bleiben zwei.
- Kosten-Zeile, Summe der Stufen 2–4 als Ableitung: 43 → 42 Pipelines (+1 Licht-Pass, aber nach Blatt 17 nicht mittags), 1,99 →
  ~1,74 MB, Bild − Renderer kalt ~−0,8 s plus ≤ 0,5 s Naht. Nicht gemessen. Frame-Kosten je Stufe nach ihrem eigenen Blatt.
- Kriterien: `ankunft.K1#1` GTX 12,03 s ↔ ≤ 10 s, Radeon 12,95 ↔ ≤ 5 s (Station `PM/punkte/stationen/g6.js:2840–2866`, beide);
  `ankunft.K1#2` ≤ 5 s an beiden (:2868–2888); `ankunft.K5#1` Radeon: längste Aufgabe 494 ↔ ≤ 250 ms, belegt 11,95 ↔ ≤ 4 s (:2894–2909).
  Alle stehen heute UNGEMESSEN (`PM/punkte/stand.json:133–262`, Exit 3221226505 an 36f9d45a).
- Bildpaar: das erste Bild kalt an der Sonde (Genesis) UND am Dorf des Prüfplatzes, vorher ↔ nachher byte-gleich im Rauschen
  (≤ 0,24 % laut Pixel-Boden der Zählung, `1113-bild-wartet.md:60`). Ein anderes Bild ist ein Bruch, kein Gewinn.

## Was schon liegt
- `w28-wiese-fern` 476a3ed9 (WIP): die Schale fällt (Lf 77 201 + Schale 27 820 → Lf 90 266 Dreiecke, 94 → 93 Befehle). Ego reißt
  +7,3 ms (37,5 → 45,3 ms). Die eine Gegenprobe steht aus (`_halmFerne` ohne `_laubLichtStoff`). Bis zur Landung fehlen Ego-Kosten,
  das Einmischen von main und die Programm-Zeile im Rumpf.
- Licht-Pass: Samen `origin/w28-samen-lichtweg` (Blatt 17). Kein Arbeiter, kein Code im Stamm.
- `w28-stoff-stufe-null` 0343f9e8: TOT benannt (FUND-REGISTER 13.11.). Er hält das Werkzeug `zug/werkzeug-gtx1050/stoff-spike/`
  (`_bild-wartet.js`, `wartet-lesen.cjs`), das die Programm-Liste mit Pixeln zählt; das ist die Quelle der Zahlen oben.
- `w28-weltbild-kalt` bdb060ad (WIP, 11.11.): das Buch des Spielers hält die Platte (`stamm/studio-bruecke.js` +53/−21). Das ist die
  Lieferung, nicht die Programme. Er senkt B nur am Faden, nicht an der Übersetzung.

## Ehrlich offen
- Nicht gemessen: die Kosten-Zeile der Stufen 2–4 als Summe, die Radeon (alle Programm-Zahlen sind GTX 1050), der Dorf-Blick
  (die Liste stammt nur vom Genesis-Wald, an einer Wiese deckt die Nah-Wiese mehr).
- Widerspruch der Zählweise: Blatt 17 nennt „59 Module 2,16 MB", die GTX-Liste „43 Pipelines 1,99 MB". Module ≠ Pipelines, andere
  Welt und andere Probe. Die Stufe-1-Zeile setzt EINE Zählung.
- Was die Übersetzung je KB kostet, ist nur aus EINEM Spike abgeleitet. Die Schlange des GPU-Prozesses kann je Treiber anders parallel
  laufen.
- B ≤ 5 s hält auf der GTX 1050 auch mit 0 Programmen nicht: vor dem Renderer liegen schon 4,2–5,9 s (Browser, 15,4 MB Skripte).
  Zählen nur Radeon und GTX 1060, ist das offen, aber nicht gemessen. Den Boot vor dem Renderer hat dieses Blatt nicht zerlegt.
- Nicht gelesen: die drei namenlosen Grund-Stoffe (`Mesh < Scene`, 138 + 35 + 18 KB), ob die Station `ankunft.K1` an der Sonde oder am
  Dorf ankommt, `index.html` jenseits der Skript-Zählung, die Leib-Kette nach z426 (B5 vom 18.10. maß sie bei 10,5 s).

## Rang
- Stufe 1 (Zeile): Wirkung im Takt 2 (macht B in jeder Abgabe sichtbar) · Aufwand S · Risiko: wer die Zeile als Schwelle liest, baut
  einen neuen Apparat — sie bleibt Bericht.
- Stufe 2 (Wiese ohne Schale): Wirkung im Bild 4 / im Takt 2 · M (liegt) · Risiko: Ego +7,3 ms reißt, bis die Gegenprobe den Täter nennt.
- Stufe 3 (Licht als Pass): Wirkung im Bild 4 nachts / im Takt 2 · L · Risiko: +9,3 MB VRAM und Bild-Zeit ungemessen, Glas verliert das Quellen-Licht.
- Stufe 4 (Naht früher): Wirkung im Takt 2 (≤ 0,5 s) · S · Risiko: wird die Pipeline vor dem Bild früher bestellt, rückt sie in der EINEN
  Schlange vor die, auf die das Bild wartet (+0,7…+1,5 s am Leben-Vorbau, `bild-kosten.js:638–640`).
