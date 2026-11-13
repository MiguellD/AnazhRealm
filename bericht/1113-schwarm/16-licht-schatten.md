# 16 Licht und Schatten — der Kipper von schatten.K3/K4 ist der Messort, nicht das Licht

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `probe-post/w28-leib-genom/45805bda-dorf-0.5.png` (KO, GTX 1050, Dorf der Ankunft, Mittag, Kamera -704.22 / -880.02): der Wurf
  des Hauses auf dem Boden ist ein blau-schwarzer, grob gesprenkelter Fleck — deutlich dunkler und bunter als alles andere im Bild.
  Die Giebelwand im Eigenschatten liest fast so hell wie die besonnte Seite; nur am Sockel trennt eine dunkle Leiste Haus und Boden.
- `scratchpad/dorf-main-0.5.png` (BILD): derselbe Platz — der Hausschatten unten rechts wieder blau-violett-schwarz gesprenkelt;
  die Schatten der Bewohner sind kleine Kleckse, beim Mann in Rot liegt der Klecks sichtbar neben den Füßen (er scheint zu
  schweben); die Laterne wirft einen klaren, langen Schatten. Der Himmel ist dunkel-marine.
- `messung/roh/ec281422-radeon/ankunft.K4_1-blick/ego-0.png` (PM, Prüfplatz): Bank und Laterne werfen kurze Schatten, das
  Pflaster im Licht ist gleichmäßig grau; Kontakt-Dunkel am Fuß der Tore sehe ich nicht.
- Für die beiden ROT-Proben selbst gibt es KEIN Bild: die Station `neun` speichert ihre Schüsse nicht (nur Zahlen im `.out`).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- KEIN Licht-Byte hat sich bewegt: `git diff --stat 1e00bfdb9 ec281422` über stamm/bild-schatten.js, bild-himmel.js,
  stoff-material.js, welt-licht.js, bild-kosten.js, bild-sicht.js, siedlung-ort.js, siedlung-satz.js → nur
  stamm/siedlung-bewohner.js (+38/−2, das Skelett aus dem Genom, z426). z424 wesen-offen, z425 platte-fein, z426 leib-genom
  tragen keinen Leser von Sonne, Kaskade, Umgebung, Rückstrahl oder Kontakt.
- DER ORT DER STATION SPRANG: K3/K4 an c4010773 (GRÜN) Ort [-840.7,-866.4]; an ec281422 (ROT) Ort [-704.2,-880]
  (`messung/c4010773-radeon.json` Z. 1934 / `ec281422-radeon.json` Z. 702). Der Sprung ist die punkte-maschine selbst:
  PM-Commit **ab71fe5be** (13.11. 18:36) „DER ORT WANDERT NIE MIT (spielerStand)": nach jeder Probe wird der Stand geprüft und
  neu umgestellt. Erste Fahrt danach: ec281422, 19:31. Die Bild-Probe `bild:dorf` steht seit w27-ort-pose an
  -704.22 / -880.02 (19 Dateien `probe-post/*/…md`, z. B. `w27-ort-pose/8dedeab6.md:19`) — die Station maß tagelang NICHT dort,
  wo der Spieler ankommt; jetzt misst sie dort.
- K4 an der Ankunft (`roh/ec281422-radeon/schatten.K4_1.out:64`): LA 0,1849 = LB 0,1849, **hubM 4,1043** (c4010773: 0,6246),
  Boden 0,0981 (c4010773: 0,4395), Wand-Platz [-704.2,-902]. Die Station legt die schwarze Platte (16 × 16 m, Mitte 8,2 m vor
  der Wand) auf `M.y + max(0, hub) + 0,04` (`stationen/g3.js:1202–1206`), `hub` = der höchste Boden bis 15 m vor der Wand.
  Das Auge steht 7 m vor der Wand auf `M.y + 1,7` (`g3.js:1195`): die Platte schwebt 2,4 m ÜBER dem Auge, das Auge sieht ihre
  Unterseite, der Rückstrahl-Pass (`stamm/bild-schatten.js:173–186`, Boden nur `unterAugeM` 0,5 m unter dem Auge) misst den
  Hang darunter wie vorher → Gewinn exakt 0. `platz()` prüft den Hang nur über ±4 m (`g3.js:1045`), nie über den Fußabdruck
  der Platte. Seite des Toon-Stoffs (FrontSide?) nicht gelesen; das gleiche LA/LB auf 4 Stellen trägt den Befund.
- K3 an der Ankunft (`…schatten.K3_1.out:65`): Fuß-Band 0,9337 (Soll 0,30–0,60), Sockel 0,0459, Sicht 0,9 / 0,6, Platz
  [-584.2,-964] Hang 0,109 (Grenze `hangMax` 0,12). c4010773: Fuß 0,5358, Sockel 0,3489, Sicht 1 / 1, Hang 0,106. Ein Sockel-
  Band bei 4,6 % des freien Bodens ist kein Himmels-Verlust (GTAO `KONTAKT.potenz` 2,5, `bild-schatten.js:1655–1665`, maß an
  der Mess-Wiese 0,56 / 0,39, Z. 1361–1362), sondern die Geometrie am Hang (40 % der Punkte ungesehen) — Ursache UNGEMESSEN.
- Das Gesetzbuch KANN: Rückstrahl aus dem gezeichneten Boden (`_rueckstrahlPass` Z. 107–202, `_rueckstrahlHalbraum` Z. 101),
  GTAO-Kontakt am Boden (Z. 1341–1415, aoNode nur ins indirekte Licht), drei Kaskaden mit Kontakt-Kaskade 15 m
  (`stamm/dirigent-ankunft.js:406–415`), kein Füll-Rig am Tag (Z. 443–446: Schattenseite 145 : 219 ohne Rig).
  Die Welt KONSUMIERT: alle drei laufen im Spielpfad (`_rueckstrahlAn` Z. 312–316, an = 1 außer unter Dach). Was der Rückstrahl
  aber trägt, ist der braune Boden der Ankunft (Luma 0,098 an der Ankunft gegen 0,44 am alten Ort) — der blau-schwarze Wurf im
  Bild ist Himmel × Boden-Albedo, kein fehlender Leser.

## Die EINE begrenzende Entscheidung
Kein Bisekt über z424–z426 und kein Revert: der Täter ist der Messort (PM ab71fe5be), das Licht ist byte-gleich. Der Ort an der
Ankunft ist der RICHTIGE Ort (Kurs Punkt 7); also hält die Station dort ihre eigene Beschreibung „freier, ebener Boden"
(`g3.js:881`) über dem GANZEN Fußabdruck ihrer Körper — Soll, Schwelle und Maß bleiben unverändert.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Klasse: „ein Prüf-Körper der Schatten-Familie liegt nicht auf dem gezeichneten Boden der Ankunft". Stufen in EINER Welle:
1. K4 Platte: die Platte liegt AUF dem gezeichneten Boden — ein Raster 16 × 16 m (1 m Masche), jede Ecke auf
   `r._bodenSichtAt` + 0,04 (dieselbe Quelle wie K3 `sichtY`, `g3.js:1221–1225`, Lehre 22), statt der Ebene auf `max(hub)`.
2. K4 Platz: `platz(4, …)` verlangt den Hang ≤ `hangMax` auch längs der Normalen bis 16 m (der Fußabdruck der Platte) —
   `g3.js:1045` um die Punkte `n · e` (e 2…16) erweitert; dieselbe Regel, kein neues Soll.
3. K3: der Platz (`g3.js:1234–1253`) prüft den Hang über den Fußabdruck des Sockels (4 × 4 m) statt ±5 m um den Mittelpunkt,
   und `sicht` < 1 macht den Teil UNGEMESSEN beim Namen statt ROT (eine halb gesehene Probe ist kein Urteil über das Spiel).
Leser-Liste: `g3.js:1185` (einziger Rufer von `platz`), `g3.js:1198–1206` (hub, platte), `g3.js:1253` (K3-Fund),
`g3.js:2114–2138` (Urteile K3/K4 — unverändert), `punkte.cjs` Selbsttest `neunProben` (`g3.js:2124`, `2138`), der Abdruck
der Seite (`schatten.K4_1.out:7–10`: NEUN-BRUCH bei neuem Hash — die Befehls-Zeile trägt ihn mit).
Kosten-Zeile: 0 ms am Schirm (nur Station), Probe +~0,1 s (256 Ecken statt 4).
Kriterien: **schatten.K4#1** radeon Ist Gewinn 0,0 % ↔ Soll ≥ 10 % (gebucht GRÜN 31,3 % am c4010773) · **schatten.K3#1** radeon
Ist Fuß 93,4 % / Sockel 4,6 % ↔ Soll 30–60 % (gebucht 53,6 / 34,9 %). Station `stationen/g3.js` „DIE NEUN", Sitzung dorf.
Gewinn: die Buchung 219 → 221 zurück, gemessen an der Ankunft statt an einem Ort, an dem kein Spieler steht.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Kein Zweig. Die Station lebt in der punkte-maschine (PM, git-Baum `C:/Users/micha/AppData/Local/Temp/claude/w3/pm`, Kopf mit
  191f0684a „UNGEMESSEN statt ROT bei Absturz"). Bis zur Landung: der Schnitt in `g3.js`, Selbsttest `neunProben` grün, EINE
  Radeon-Fahrt `--offen` für schatten.K3#1/K4#1 an ec281422, PM pusht nur auf SELBSTTEST GRÜN.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- K3 Sockel 4,6 %: ob der Hang allein es erklärt oder ein Bewohner/Stand im Blick (Sicht 0,6) — UNGEMESSEN; die Station schießt
  `mit`/`ohne`/`mark` (`g3.js:1281–1294`), speichert sie aber nicht.
- Warum der besonnte Boden vor der K4-Wand 0,098 liest (Ankunfts-Boden „brauner Teppich" oder Wurf des Hangs) — nicht gemessen.
- schatten.K5 am selben Ort: `laterne_dorf` 2,45 m, Lschatten 0,2115 > Llicht 0,0465, Kontrast 0,22 (`schatten.K5_1.out:69`) —
  derselbe Ort-Sprung, nicht untersucht.
- Bild-Klasse ohne Täter: der blau-schwarze, gesprenkelte Wurf und die fast gleich helle Schattenseite (Bilder oben). Quelle
  vermutlich Boden-Albedo und dunkler Mittags-Himmel (Übergabe §3, „niemand sitzt daran"), nicht gemessen; der Wurf neben dem
  Fuß des Bewohners (Satz-Wurf, `siedlung-bewohner.js` „DER WURF IST DER SATZ") nicht gelesen.
- Ob `_buildToonNodeMaterial` einseitig zeichnet: nicht gelesen. Ob der Ort-Sprung auch andere Dorf-Stationen kippte: nicht geprüft.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Takt 4 (zwei gebuchte Punkte an der Ankunft statt Scheinurteil, die Buchung läuft wieder), Bild 1 · Aufwand S · Risiko: zeigt die
Platte auf dem Boden weiter 0 % Gewinn, ist der Rückstrahl an der Ankunft ECHT schwach (brauner Boden) — dann ist es ein
ehrliches ROT des Spiels und gehört in die Boden-Kette (`w28-weg-koerper`), nie in die Station.
