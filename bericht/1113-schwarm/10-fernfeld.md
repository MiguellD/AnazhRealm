# 10 Fernfeld, Horizont, ferne Gelände- und Wald-Stufen — die Ferne tauscht nur ganz

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Dorf der Ankunft, Mittag (`BILD/dorf-main-0.5.png`): KEINE Ferne im Bild. Der Hang hinter dem Platz schließt den Blick nach
  ~100–200 m; seine Kante sind gestreckte Gras-Zacken und Fels, darüber ein dunkel-marineblauer Himmel. Ein Kamm, ein ferner
  Wald, ein Horizont kommen am Ort der Ankunft nicht vor. Dasselbe in `genom-spiel/eng-rot.png` und `wiese-mitte/oben-heute-dorf-rot.png`.
- Wiese, enges Objektiv (`BILD/wiese-mitte/heute-wiese-fov20-rot.png`): links ein glatter grau-brauner Hang ohne Gras-Struktur
  mit einzelnen Stämmen; am Horizont eine Reihe fast schwarz-blauer, flacher Spitz-Dreiecke (meine Lesart: Nadel-Kegel der
  Kamm-Krone) vor grau-weißem Himmel — sie sind dunkler als der Hang davor, Luft-Perspektive sehe ich an ihnen nicht.
- Hügel/Dach (`wiese-mitte/oben-heute-huegel.png`, `oben-heute-dach.png`): Blick nach unten, kein Horizont im Bild.
- Kein Bild gesehen von: einem Re-Anker (Gang > 180 m, Fahrt, Teleport), dem „blassen Fächer" am Dorf (FUND-REGISTER Z. 177,
  Bilder nur auf der GTX 1050 `.git/gtx1050-werkzeug/gc/reihe*/bild/`), einem Kamm aus Höhe.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Stufen des fernen Walds/Geländes (SPIEL = main ec281422):
1. Karte (fimp:atlas) bis `SCATTER.outerM` 384 m (`stamm/siedlung-instanz.js:1251`).
2. Kronendach als FARBE auf Boden und Ring jenseits davon (`_fernKroneNahMisch`, `stamm/gelaende-fern.js:1775`; die EINE
   Grenze `_fernKroneOhneWald` :1755). Keine Höhe: der Wald der Ferne ist Anstrich.
3. Kamm-Krone: je Baum am Kamm ein flacher Umriss (8 Ecken, dem Anker zugewandt), `_kammKroneBau` :652, Stoff :845,
   Bestand aus `phyto-core.js:3190 forestKammKronen` über `voxel-worker.js:4194 kammKrone` (dVon 384 m, dBis 6 km, 8 Sektoren,
   `gelaende-fern.js:2155`).
4. Fern-Ring: 3 Schalen bis 8 km, 192 Winkel (`gelaende-fern.js:2117`), Reihen nach `_fernRingReihen` :1619 → 40 + 16 + 12 =
   68 Reihen = 13 056 Ecken, 21 Floats je Ecke ≈ 1,1 MB (gerechnet aus den Konstanten, nicht gemessen); 4 Draws (frei/Naht).
5. Fern-Wasser bis 720 m (`:2103`), baut immer ganz (build-before-dispose :179).

DER BRUCH (gelesen, nicht im Bild gesehen) — der Re-Anker zeigt einen halben Stand:
- `stamm/bild-sicht.js:2824–2829`: ab 180 m (`reanchorDist`) setzt der Takt SOFORT Anker und `uAnker` neu und ruft
  `_fernRingNeuBestellen` (`gelaende-fern.js:1944`): cursor 0, vollY NaN — die Netze bleiben SICHTBAR.
- `_fernRingEinhaengen` (:1963) schreibt Punkt für Punkt in Index-Folge (nah zuerst) die NEUE Welt-Lage
  (`_fernRingSetzVertex` :1378, `_fernRingOrt` :999 aus `fr.anchorX`); alle übrigen Ecken tragen bis dahin Lage und Höhe des
  ALTEN Ankers. Die Dreiecke zwischen alter und neuer Reihe spannen über ≥ 180 m. Die Sichtbarkeit wartet nur beim ersten
  Ring (`:2003–2005`, Kommentar :1959 „kein Null-Blob") — beim Re-Anker nie. 26 Scheiben à 512, außerhalb des Lade-Takts
  höchstens 3 im Flug (`:1829`, `scheibenImFlug` :2138); die Dauer des Nachfüllens ist ungemessen.
- Kamm-Krone (`gelaende-fern.js:611–614`): neuer Anker → `sektoren` alle null; die ERSTE Antwort baut das Netz aus allen
  Sektoren neu (:641–642, :661 `if (!a) continue`) — 7 von 8 Sektoren des Umrisses verschwinden, bis sie einzeln
  wiederkommen (Faden-Zeit am Gesetz: 76° ≈ 28 s, `:2150`).
- Die Fern-Karte des nahen Bodens tut es richtig: sie tauscht erst, wenn sie ganz steht (`:1714`, `bereit` :1736). Zwei
  Regeln für eine Domäne.
- Meine Lesart (UNBEWIESEN): der „blasse Fächer" am Dorf, in 2 von 3 Boots an main, „harte Oberkante, Streifen wie ein
  Dreiecks-Fächer" (FUND Z. 177), ist ein halb neu verankerter Ring — `werkbank bild --ort dorf` stellt den Spieler um, das
  ist ein Re-Anker, und ob das Bild ins Nachfüllen fällt, hängt am Gang des Boots.

ferne.K3 (der Saum am Kamm, Station `PM/…/stationen/g3.js:1073–1178`, Urteil :2182: kamm ≥ 100, zweiKm ≥ 30, Kohärenz < 0,3,
Schwankung ≥ 3 m) — Radeon-Reihe aus `PM/…/messung/roh/*/ferne.K3_1.out` (Azimut 180°, Auge 25 m):
| Kopf | Ort | kamm | Kohärenz | Relief über Gesetz |
|---|---|---|---|---|
| eb3cc7f3 … fbbeb318, 067bd771 (bis 10.11. 03:10) | dorf alt [-841,-861] | 273 | 0,200–0,203 | +18,0 … +19,1 m |
| 6aa7a5a6 (10.11. 11:29) … dc9eacb0 | dorf alt | 273–275 | 0,367–0,372 | +2,7 … +3,2 m |
| ec281422 (13.11.) | Prüfplatz [-704,-880] | 29 | 0,2671 | +9,9 m |
- Zwischen 067bd771 und 6aa7a5a6 berührt nur EIN Merge den Bestand: `4f4b15a4` w27-wald-kosten-heim (phyto-core: Lichtung,
  Schluss, Waldgrenze, Siedlungs-Saum in `forestKronenDeckung`/Geburt, `phyto-core.js:2911–2960`; `forestStehende … nurDach`
  :3162). Der Kamm verlor 16 m Krone; den Mechanismus habe ich nicht gemessen.
- Am neuen Ort deckt das Dorf den Kamm: 29 Spalten statt ≥ 100 (FUND Z. 131 nannte es am 11.11.).

Kosten am ersten Bild (`KO/bericht/1113-bild-wartet.md` Z. 18–19): die Naht des Fern-Rings ist die LETZTE Pipeline vor dem
Bild (143 KB Fragment, 2,42 s Übersetzung, 0,03 % der Pixel), Fern-Ring frei 133 KB, 1,58 %.

## Die EINE begrenzende Entscheidung
Die Ferne tauscht nur GANZ: ein neuer Anker wird hinter dem Bild vollständig aufgebaut und in EINEM Takt getauscht —
Ring-Lage, `uAnker`, Maske, Teilung und Kamm-Krone zusammen. Bis dahin zeichnet der alte Stand unverändert. Ein halber
Stand wird nie gezeigt (das ist das fail-soft, das die Goldene Definition verbietet). Die Fern-Karte (:1714) ist das Vorbild.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen (alle in derselben Welle): Schale 0 frei + Naht, Schale 1, Schale 2, Kamm-Krone, Fern-Neigung. Das Fern-Wasser baut
schon ganz und bleibt.
- RING: `_tickFernRing` (`bild-sicht.js:2824`) merkt den neuen Anker als `fr.neu` und lässt Anker und `uAnker` stehen.
  `_fernRingPunkt` (:961) rechnet die Scheiben am neuen Anker. `_fernRingSetzVertex` (:1373) schreibt in einen zweiten
  Geometrie-Satz (Ping-Pong der `geos` und der Teil-Geometrien :443–453, keine Kopie). Bei `cursor ≥ totalVerts` tauschen in
  einem Takt: `meshes[i].geometry`, `anchorX/Z`, `uAnker`, `maske` (neu gerechnet), `teilung.schluessel = ""`.
  `bild-himmel.js:2884` (`standBleibt`, gleicher Anker) läuft durch denselben Tausch.
- KAMM-KRONE: `_kammKroneTakt` (:611–642) baut erst, wenn jeder Sektor des neuen Ankers steht (`sektoren.every(Boolean)`),
  dann EINMAL `_kammKroneBau`. Bis dahin steht das alte Netz.
- Leser-Liste (wer liest, was der Tausch ändert): `_fernRingTeilung` :1303 (xzGen :1376) · `_fernRingMaske` :1235 und
  `_fernRingMaskeHoch` :516 · `_fernRingDeckWache` :2015 · `_fernRingUmEdits` :1901 (Edit während des Nachfüllens: in den
  neuen Satz) · `_fernNeigungTakt` :1085 · `_tickFeldPass` (`bild-sicht.js:2847`, nicht gelesen) · `_kammKroneTakt` :609
  (`fr.ready`, Anker) · Stoff der Naht (`uAnker`, `uMaskeZelle0` :263, :318) · Station ferne.K3 `g3.js:1115–1121` (wartet auf
  alle Sektoren — liest danach dasselbe) · Linse `diag-fern-ring` (`refreshed`, cursor; Kommentar :2012) · `_fernRingCamFar` (:2856).
- Kosten-Zeile: Draws ±0 (4 Ring + 1 Krone), Programme ±0 (dieselben zwei Ring-Stoffe, ein Kronen-Stoff), keine neue Pipeline
  vor dem Bild; GPU-Speicher +≈ 1,1 MB (ein zweiter Attribut-Satz, gerechnet); die Kamm-Krone baut je Anker 1× statt bis 8×.
  An die Weltgröße gebunden ist nichts; die Arbeit hängt am Anker-Wechsel.
- Kriterien: KEIN Kriterium der Meisterkarte misst den Re-Anker. lod.K2 (1/2, Pop ≤ 0,05 %/s im Gang 4 m/s, Ist 0,0474 %)
  sähe ihn nur, wenn der Gang 180 m quert (nicht gelesen). ferne.K3 0/2 (#1 Radeon, `stationen/ferne-k3-radeon-0411.json`;
  Ist ec281422 kamm 29 ↔ ≥ 100, Kohärenz 0,2671 ↔ < 0,3, UNGEMESSEN) bewegt dieser Schnitt nicht.
- Abgabe = Bildpaar an fester Kamera: (a) `werkbank bild --ort dorf --uhr 0.5`, je 3 Boots heute ↔ Zweig — der Fächer in
  0 von 3; (b) Gang 200 m auf der Wiese am Kamm, Bild 0,5 s und 5 s nach dem Re-Anker — kein Streifen im Ring, der Umriss
  der Kamm-Krone steht ganz. Höhen: Auge, Hügel, Dach.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Für diesen Schnitt: nichts. Kein Zweig berührt `_fernRingNeuBestellen` oder `_kammKroneTakt`.
- `w27-ferne-ton-5` 155abda9 (Abgabe 790ed766 und WIP 529cf20c NICHT in main, 505 hinter, `bericht/1113-kurs-A` Z. 23): die
  Tafeln der Luft zeichnen erst, wenn ihre Pipeline steht (`stamm/bild-kosten.js:1052–1056` trägt an main noch die alte
  Regel); Schnee über der Narbe. ferne.K1#2 ist an der Radeon heute GRÜN gehalten (1cd1c408) — ob der Zweig noch nötig ist,
  weiß ich nicht. Fehlt: Rebase, S0 ROT (Nacht-Luma 11,5).
- `w28-weltbild-kalt` bdb060ad: 3 Dateien (`studio-bruecke.js` Platte, `diag-fluss`, `diag-pack-contract`), Ankunft B,
  nicht diese Klasse. Fehlt: Abgabe-Commit und Messung.
- `w28-wiese-fern` 476a3ed9: die Ferne der Wiese (Büschel), Ego +7,3 ms — Nachbar, nicht dieser Schnitt.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht gemessen: wie lange ein Re-Anker nachfüllt; ob der Fächer (FUND Z. 177) der halbe Ring ist — erst ein Bild im
  Nachfüllen beweist es. Ob die echte Ankunft einen Re-Anker trägt (Ring entsteht am Startpunkt, der Spieler dann am
  Prüfplatz?) — nicht gelesen.
- `_tickFeldPass` und der Feld-Pass jenseits der Schalen: nicht gelesen.
- ferne.K3: Täter-Fenster = Merge 4f4b15a4; Mechanismus (Lichtung? Waldgrenze? Saum?) nicht gemessen. Kurs-B nennt
  Kohärenz 0,367 am 13.11.; die Roh-Datei ec281422 sagt 0,2671 über nur 29 Spalten — beides wahr, verschiedene Orte.
- Die dunklen Kegel am Horizont: dass es die Kamm-Krone ist, ist meine Lesart; ihr Luft-Anteil nicht gelesen.
- Kandidat 4 der Samen (Fernfeld als Feld): das Kronendach hat Farbe, keine Höhe — kein Spike, keine Zahl.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Die Ferne tauscht nur ganz: Wirkung 3 (jede Fahrt, jeder Gang > 180 m, vielleicht der Fächer am Dorf) · Aufwand M ·
  Risiko: Maske, Teilung und `uAnker` müssen im selben Takt tauschen, sonst zeigt die Naht für ein Bild Löcher.
- ferne.K3 an der Wurzel (Bisektion 4f4b15a4^1 ↔ 4f4b15a4 auf der Radeon, dann Schnitt im Bestand): Wirkung 2 im Bild,
  +2 Punkte · Aufwand M · Risiko: der Kamm wurde womöglich WAHRER (Lichtungen), dann ist die nackte Kammlinie der Fehler.
