# 23 Die Post-Kette: TRAA, Tonkurve, Spiegel, Kontakt-Verdeckung, Skala 0,75

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/dorf-main-0.5.png` (Dorf, Mittag): der Sockel des weißen Hauses trifft den Boden ohne jede Verdunkelung an der Wand; unter dem Dach des
  Marktstands ist der Boden so hell wie der freie Platz, nur der Sonnenschatten liegt dort. Die Bewohner stehen ohne Dunkel an Fuß und Knöchel; der
  Sonnenschatten des mittleren Bewohners liegt als eigener Fleck unter den Füßen, abgesetzt. Die Fensterscheiben sind flache graue Flächen, kein
  Himmel darin. Der Himmel über dem Dach ist dunkel-marine, die Wände sind fast gleichmäßig weiß, kaum Abstufung zur Traufe.
- `scratchpad/genom-spiel/frontal.png`: die Schattenseite des Hauses (rechts) ist gleichmäßig grau, die Traufe wirft kein weiches Dunkel auf die Wand,
  die Ecke Wand–Boden ist hart. Kanten (Laternenmast, Dachrand) sind sauber geglättet, keine Treppen; der Boden körnig gesprenkelt.
- Was ich NICHT sehe: Flimmern oder Geisterbilder der zeitlichen Auflösung (Standbilder zeigen das nicht).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Die Kette, in dieser Reihenfolge (`stamm/bild-kosten.js:2066-2347`, gerendert in `stamm/dirigent-takt.js:2328-2379`):
1. Szenen-Pass in der Skala `_szeneSkalaWirk` (bild-kosten.js:2031-2036): `SZENE_SKALA = 0.75`, Minimum 0,5 (bild-kosten.js:3704-3705) = 56 % der
   Pixel. Ohne TRAA (Holz kienspan) gilt Skala 1. Szenen-Ziel rg11b10ufloat gedithert (2091, 2097), dazu ein r8-Glanz-Ziel per MRT (1,17 MB bei 1080p, 2095).
2. TRAA als Hochskalierer `_zeitAufloesung` (bild-kosten.js:1538 ff., r184 TRAANode als Basis, Vendor unverändert): Bewegung aus der Tiefe
   (`_traaKameraBewegung` 2366), getragener Leib als Boxen, Geschichte im Ping-Pong ohne Kopie (1569-1573: 0,69 → 0,23 ms). Kosten 04.10. Radeon:
   +1,1 ms und +23,7 MB VRAM (2116-2118). Resolve und Geschichte bleiben rgba16float (2119-2122, gemessene Posterisierung in rg11b10).
3. Nach-Schärfe `ZEIT_SCHAERFE × (1 − Skala)` = 1 × 0,25 (dirigent-takt.js:2340, 2464), geklemmt auf die 4-Nachbar-Spanne (bild-kosten.js:2218-2228).
4. Bloom 9 Abtastungen unbedingt, Schwelle 0,86, Stärke 0,38 (2149-2151, 2236-2253); Godrays 20 Abtastungen nur im Zweig bei Stärke > 0 (2259-2270);
   lokaler Kontrast 4 Abtastungen, Vorgabe 0 (2156-2160, 2281-2290); Auge der Nacht nur bei nightFactor > 0 (2297-2307); Farbsicht als eigene
   Ausgabe (2320-2327).
5. Tonkurve Khronos PBR Neutral + sRGB im Ausgabe-Quad (dirigent-ankunft.js:160-168, Messung 15.10. dort zitiert); die Belichtung setzt das Licht
   (`toneMappingExposure`, bild-himmel.js:1914; `BELICHTUNG` zielKarte 0,22, bild-himmel.js:3284).
6. NACH dem Bild drei Pässe aus der Tiefe dieses Bilds, gelesen im NÄCHSTEN (dirigent-takt.js:2373-2379): Spiegel, Kontakt, Rückstrahl. Bricht die
   Kette (`direkt`), fallen alle drei auf `an = 0` — laut über `_stoffBruch` (2363-2366).

Spiegel (`_spiegelPass`, bild-sicht.js:733 ff.): ein Pass in 1/4 der Ausgabe (`teil: 4`), 48 Schirm-Schritte bis 3000 m (bild-sicht.js:3911-3929),
für Wasser UND jede Fläche mit Glanz > 0,02 (834-837); rechnet nur bei Änderung (dirigent-kern.js:1034-1108, im Stand höchstens jedes 24. Bild).
Konsum: JEDER Standard-/Physical-Stoff liest ihn über die EINE Umgebung `scene.environmentNode = _spiegelUmgebung` (bild-himmel.js:715,
bild-sicht.js:667-719). material.K4: Lack spiegelTreue 0,4468, Glas 0,7656 (Soll ≥ 0,5 an Lack ODER Scheibe), GTX e84fd1fb grün, Radeon ungemessen
(stand.json:2273-2297). Das Gesetz fließt hier ganz.

Kontakt-Verdeckung (`_kontaktPass`, bild-schatten.js:1419-1577): GTAO (XeGTAO-Integral) in HALBER Auflösung des Szenen-Ziels (1595-1596) — bei Skala
0,75 also 0,375 der Ausgabe —, 2 Scheiben × 2 Seiten × 4 Schritte = 16 Tiefen + 5 je Texel, Radius 1,5 m, 3×3-Filter gleicher Tiefe
(`KONTAKT`, 1655-1665). Der Pass rechnet für JEDEN Schirm-Texel mit Tiefe < 0,99999 (1454): Haus, Leib, Stand, Fels, Stamm.
KONSUM: genau EIN Leser — der aoNode des Boden-Stoffs mit `opts.himmelsSicht` (stoff-material.js:1922-1934). Kein Haus, kein Leib, kein Bau-Teil,
kein Fels liest ihn (Grep `_kontaktVerdeckung`: einziger Aufrufer stoff-material.js:1924). Das Gesetzbuch rechnet die Verdeckung des ganzen Bilds,
die Welt konsumiert sie auf dem Anteil der Pixel, die Gelände-Boden sind. Der Vendor-Anker sagt es selbst (spec/vendor-anker.json:1263).
Indirektes Licht am Tag kommt NUR aus der EINEN Umgebung: Ambient = 0,04 × Nacht (bild-himmel.js:2141), die Hemisphäre trägt den Nachthimmel
(bild-himmel.js:2351-2360). Die Umgebung ist damit der EINE Chokepoint, durch den jede Fläche ihr Himmels-Licht holt.

Messung (PM, frische Radeon-Fahrt am ec281422, messung/ec281422-radeon.json:628-705; roh/ec281422-radeon/schatten.K4_1.out:64-65):
- schatten.K3#1 ROT: Fuß-Band 93,4 % des freien Bodens (Sicht 0,9), Sockel 4,6 % (Sicht 0,6), Soll 30–60 %; Platz [-584.2,-964]. Gebucht ist
  GRÜN 53,6 % / 34,9 % an c4010773, Ort [-840.7,-866.4] (stand.json:3160-3175). Der Ort der Station ist gewandert ([-704.2,-880]).
- schatten.K4#1 ROT: Gewinn 0,0 % (Wand 0,1849 mit Boden = 0,1849 mit schwarzer Platte), Boden 0,0981 (gebucht: 31,3 %, Boden 0,4395).

## Die EINE begrenzende Entscheidung
Die Kontakt-Verdeckung fließt durch die EINE Umgebung statt durch den aoNode des Bodens: jede Fläche, die ihr Himmels-Licht aus
`_spiegelUmgebung` holt, liest dieselbe GTAO-Verdeckung, die der Pass ohnehin für jeden Schirm-Texel rechnet. TRAA, Skala 0,75, Tonkurve und Spiegel
bleiben unberührt — sie konsumieren ihr Gesetz schon ganz; die Lücke zwischen „gerechnet" und „gelesen" steht nur am Kontakt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen (alle in EINER Welle): Gelände-Boden (wie heute, byte-gleich) · Hauswand am Sockel, Traufe, Fenster-Laibung, Tür-Nische · Bau-Teile (Marktstand,
Brunnen, Zaun, Laternen-Fuß) · Fels und Stamm am Boden · Leib (Fuß, Achsel, Kinn) · Gehsteig/Bordstein als Körper (w28-weg-koerper macht Wege zu
Körpern — heute verlören sie damit jeden Kontakt). Opt-out mit Grund: Halm und Laub (gemessene Selbst-Verdunkelung und ~1,4 ms GTX, bild-schatten.js:1358-1360).
Der Schnitt:
1. `stamm/bild-sicht.js:693-714` `SpiegelUmgebung.setup`: Bestrahlung (`_rueckstrahlHalbraum(frei, n)`) UND Glanz-Zweig mal `K`, wobei
   `K = builder.material.kontaktNode ?? this._kontaktVerdeckung()` (das Muster `builder.material.receivedShadowPositionNode` steht schon in Zeile 701).
2. `stamm/stoff-material.js:1922-1934`: der Boden nimmt `_kontakt` aus dem aoNode und setzt `mat.kontaktNode = max(kontakt, narbe·wieseGrund)` —
   der Boden liest dieselbe Zahl wie heute, nur an anderer Stelle (aoNode = Himmels-Stufe allein). Byte-Beweis: Boden-Bild an der K3-Pose gleich.
3. `stamm/vegetation-wiese.js:1177` (Halm) und `stamm/stoff-material.js:39` (halm-artiger aoNode): `mat.kontaktNode = float(1)`; dasselbe am Laub-Stoff
   (Datei nicht gelesen — der Arbeiter sucht den Laub-Stoff über `_glanzKnoten`-freie Kronen-Stoffe).
4. Kommentare, die das Alte sagen, fallen im selben Commit: bild-schatten.js:1352-1354 und 1583 („der Boden liest"), spec/vendor-anker.json:1263 `warum`.
Leser-Liste (wer liest, was geändert wird): `_spiegelUmgebung` — jeder Standard-/Physical-Stoff der Welt (bild-himmel.js:715); die Bühne der Studios
liest dasselbe Gesetz `__weltLicht.himmelDerStoffe` (bild-sicht.js:675), aber nicht `_spiegelUmgebung` (ohne Kontakt-Pass bliebe `an` 0 → 1, nicht
geprüft); `_kontaktVerdeckung` (bild-schatten.js:1396) — heute nur stoff-material.js:1924; Station schatten.K3 (g3.js:1216 ff.) misst Fuß/Sockel am
Boden — unverändert; Station schatten.K4 (g3.js:1181-1214) misst die Wand im Eigenschatten mit/ohne Boden-Albedo — beide Schüsse tragen dieselbe
Wand-Verdeckung, der Quotient bleibt, die Platte liegt 0,2 m vor der Wand (neuer Werfer im Radius 1,5 m: prüfen).
Kosten-Zeile: der Pass bleibt (keine neue Abtastung im Pass). Neu je Fragment jedes Standard-Stoffs außer Boden/Halm/Laub: 1 Matrix-Produkt + 1 Ladung
(`_kontaktVerdeckung`, bild-schatten.js:1401-1413) — gebunden an die Pixel des Schirms in Skala 0,75, nie an die Weltgröße. Nicht gemessen; Abgabe nur,
wenn Frame p95 an Wiese und Dorf nicht über heute (Pflicht E).
Kriterien: schatten.K3#1 (radeon) Ist ROT 93,4 / 4,6 % ↔ Soll 30–60 %, gebucht GRÜN 53,6 / 34,9 % — der Schnitt darf es nicht verschieben;
schatten.K4#1 (radeon) Ist ROT Gewinn 0,0 % ↔ Soll ≥ 10 % — Nachbar-Stufe, darf nicht schlechter werden; material.K4#1 (gtx) Lack 0,4468 / Glas
0,7656 ↔ ≥ 0,5 — Nachbar (dieselbe Umgebung). Kein Kriterium misst die Verdeckung an Wand oder Leib: die Abgabe ist das Bildpaar.
Bildpaar: Dorf am Prüfplatz, Mittag, feste Kamera auf Haus-Sockel + Marktstand + zwei Bewohner, einmal Sonnen-, einmal Schattenseite; dazu Nacht
mit Mond (dort trägt das indirekte Licht das Bild).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Kein Zweig trägt diesen Schnitt (git branch -r, Namen kontakt/ao/verdeck/post: w5-kontakt 581e7bd8, w12-kontakt-* 64f2bae2 / d69718a1 betreffen
  den Kontakt-SCHATTEN der Sonne schatten.K1, nicht die Verdeckung).
- `w20-lack-spiegel` e8110daa (07.11.) und `w27-traa-fenster` ab6eeaf4 (11.11.) liegen; ob gelandet, nicht geprüft.
- Neu: main steht seit z427 auf 7f778d44 (nach ec281422); der Schnitt baut auf 7f778d44.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Warum schatten.K3/K4 am ec281422 ROT stehen, ist NICHT benannt: der Ort der Station wanderte (Boden 0,4395 → 0,0981, Platz anders); Gewinn
  exakt 0,0 heißt, der Rückstrahl änderte die Wand nicht — ob `_rueckstrahlZeichne` dort keinen Boden fand (`RUECKSTRAHL.unterAugeM`, `umkreisM`,
  bild-schatten.js:1670-1678) oder die Kette `direkt` fuhr, nicht gelesen. Der Kontakt-Schnitt muss ZUERST gegen diesen Stand gemessen werden.
- Der Sonnenschatten abgesetzt vom Fuß (Bild) ist Kaskade/Bias (schatten.K1), nicht diese Kette.
- Himmel dunkel-marine: Belichtung/Atmosphäre (bild-himmel.js), nicht die Tonkurve allein — nicht gemessen.
- Skala 0,75: keine Messung gelesen, ob das Bild gegen Skala 1 sichtbar weicher ist; kein Bildpaar 0,75 ↔ 1 vorhanden.
- FUND-REGISTER.md:124: die Leser nach dem Durchlauf (Kontakt, Spiegel, Rückstrahl) rechnen im Mess-Fenster mit der ungefensterten Ansicht — trifft
  jede Linse im Fenster, auch den neuen Konsum.
- Laub-Stoff und Bau-Stoffe (fachwerk, Leib) nicht gelesen: ob alle Standard/Physical sind und `environmentNode` lesen (envMapIntensity 1 am Leib:
  FUND-REGISTER.md:30 sagt ja für die Haut).
- Bewegte Leiber: die Verdeckung wird ein Bild alt in Weltlage reprojiziert, `tiefeRand` 4 % (bild-schatten.js:1407) — Geister am gehenden Leib
  nicht gemessen.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 3 (Sockel, Traufe, Stand-Dach, Füße in Schatten und Nacht — in praller Sonne klein, weil nur das indirekte Licht verdeckt wird) ·
Aufwand M · Risiko: Laub/Halm, die das Opt-out verfehlen, verdunkeln sich selbst und kosten je Fragment, und der ungeklärte ROT-Stand von K3/K4
macht ein Vorher↔Nachher an der Station unscharf.
