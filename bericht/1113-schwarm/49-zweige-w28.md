# 49 Liegendes Werk — alle w28-Zweige ohne Landung (gelesen 13.11. ~21:45, origin/main 7f778d44 = z427 karte-stamm)

## Was es den Spieler kostet (und was er sieht)
- Zählung: 100 Zweige `origin/w28-*`, davon **30 Spiel-Zweige mit eigenen Commits außerhalb main** (+ w28-r6-konsum und 11 `*-pm` auf
  Basis punkte-maschine, außer Wertung). Seit Blatt A (17:45) gelandet: leib-genom z426, platte-fein z425, karte-stamm z427 (21:17).
- Kleid: `probe-post/w28-leib-nah/7-paar-nah-heute-kandidat.jpg` — links (heute) reißen weißes und rotes Hemd an Achsel und
  Seite in Fetzen, Oberkörper als Ballon; rechts (Kandidat) beide Hemden ganz, Saum als Linie, Arme frei. Dahinter flache gelbe
  Zacken-Karten der Wiese in beiden Hälften. Der Gewinn liegt 0 Commits hinter main und fehlt dem Spieler nur um einen Abgabe-Kopf.
- Dorf: `probe-post/w28-stadt-grammatik/22872718-dorf-0.5.png` — glatte weiße Kästen mit dunklen Fensterlöchern, Boden brauner
  Teppich, die Gasse ohne Kante mit violettem Schleier, Bewohner als Stummel mit weißen Klötzen.
- Stadt: `.../0698fb92-stadt-0.5.png` — Platz mit Pflaster, Marktständen, Laternen, Turm, Blockhäuser ohne Gliederung; vorn
  Ballon-Oberkörper; links hinten schweben Leiber in halber Höhe ohne Beine. Fassade/Stoff-Fuge/Weg-Körper: kein Bild gesehen
  (probe-post leer; weg-koerper sagt selbst „im Bild noch UNGESEHEN").
- Ziel-Plan: `.../w28-ziel-plan/0146c309-dorf-0.5-rot.png` — ein Bewohner steht unten rechts mit Kopf und Schulter vor der
  Linse; das ist das ganze ROT der Probe.
- Kosten in Zeit: Abgabe → main Median 73 min (FUND, Kurs 17:58); jeder Kopf, der zweimal fährt, kostet einen Zug.

## Was die Quelle sagt
- **Stadt-Kette hängt an EINER Wurzel.** `w28-stadt-grammatik` 45290d87 (21:33) = 0 hinter, 68 vor main, mp-boden 77c31f1a darin
  (`merge-base --is-ancestor` = 0); 33 Dateien +3 484/−1 017, 13 Spiel-Dateien. Darauf stehen: `w28-stoff-fuge` 212b6de9 und
  `w28-weg-koerper` b1ffbea3 (beide auf 22872718), `w28-fassade` b038852b (auf ALTER Basis 204b9c8e, 203 hinter).
  Eigenes über stadt-grammatik: stoff-fuge 8 D +343/−135, weg-koerper 6 D +670/−57; alle drei ändern `fachwerk-core.js`,
  fassade und stoff-fuge prägen beide `spec/asset-contract/v6/golden/haeuser.json` (Konflikt sicher).
- Rot der Stadt: Code-Check 22872718 ROT 14/18 Mehrspieler-Wand (cloud-post/w28-stadt-grammatik.md:3–12). Wurzel
  `stamm/kreatur-leben.js:1687 _bodenKlasseAt` (Hang samt Erdbau, je Zelle gemerkt), Schnitt `_terrainSaatY`
  `stamm/gelaende-boden.js:719`: Stadt-Zweig ohne Schnitt 3/3 ROT, mit 4/4 GRÜN (Leben 322/322, Reload 283/283;
  erwachen/omen-2026-11-13.md:26–29). An main kippt die alte Lesart an 0 von 64 nahen Zell-Mitten (:31) — mp-boden allein
  beweist an main NICHTS; sein Wert liegt nur im Stadt-Zweig.
- Kleid: `w28-leib-nah` 694b85d2 0 hinter / 7 vor; Leser-Liste im Rumpf ace30e73 (koerper-core.js:213 kleidZonen ·
  foundry-core.js:9353 bakeMenschInstance · :6467 __stoffAusHaut · :7086 __mengenPrims · koerper-core.js:3730 leibRelief ·
  stamm/siedlung-bewohner.js:313 _bewohnerTracht). Gemessen GTX 1050: Hose über Hemd 57 → 0 Ecken, Saum σ 0,25 → 0,009 E,
  Frame p50 16,69 → 16,68 ms, Dreiecke 492 889 → 495 464 (erwachen/gtx1050-2026-11-13.md:13–18). Tor-Liste am gemischten
  Kopf: Ergebnis NICHT gelesen (:22–24).
- Ziel-Plan: `w28-ziel-plan-wip` 3005322c trägt `w28-ziel-plan` 0146c309 (Vorfahr = 0). Schnitt in
  `scripts/lib/ausgabe-aufnahme.cjs abnahmeMessen`: Leib mit Blickziel zählt nur im Vordergrund, nicht doppelt in sicht.deckung;
  soll-tafel.json 0 Zeilen Diff (Rumpf 3005322c). Dieselbe Klasse „Leib vor der Linse" ist das „ROT wie an main (bekannt):
  stadt-voll.leib" der Stadt-Probe (cloud-post/w28-stadt-grammatik.md:16).
- Studio: `w28-studio-seiten` ad504fbe trägt `w28-studio-welt` 6039dc13 (Vorfahr = 0); 6039dc13 Check ROT Stall-Akte
  („eigene Schlafe neben sleep: diag-blick.cjs") + Mehrspieler (cloud-post/w28-studio-welt.md:7–16). Ad504fbe = Notbremse, ungeprüft.
- Wiese: `w28-wiese-fern` 476a3ed9 Ego 37,5 → 45,3 ms (+7,3), Third 27,0 → 26,8; vegetation.K1#1 bleibt ROT (Naht −16,7 %);
  vier Bildpaare im Rumpf „besser in jedem". `w28-wiese-mitte` 0bfb8da9 ist dieselbe Stufe und urteilt sich selbst: „der Stand
  landet nicht (von oben Streifen)", nicht Vorfahr von wiese-fern (= 1) → Zwilling.
- Tor: `w28-tor-bruch` c7d0aad4 Probe ABGEWIESEN in 12 s, weil der Rumpf wörtlich „Richter [gpu-probe: gate:…]" trägt
  (cloud-post/w28-tor-bruch.md:3; Rumpf c7d0aad4 Absatz „probe:"); Code-Check 21:21 erneut ROT (Text NICHT gelesen,
  zug-nie-leer.log letzte Zeile).
- Tot, neu belegt: `w28-weltbild-kalt` bdb060ad — sein Inhalt steht in main über `w28-buch-platte` d77047ba
  (stamm/studio-bruecke.js:169 `platte-fiel`, :865 `texte.set(u, quelle)`). `w28-karte-gestalt` — karte-stamm z427 gelandet.

## Die EINE begrenzende Entscheidung
**Kein Arbeiter schneidet an Fassade, Stoff-Fuge oder Weg, bevor `w28-stadt-grammatik` 45290d87 (mp-boden darin) in main
steht; mp-boden landet NICHT allein.** Begründung: 4 Zweige und das ganze Dorf-Bild (Haus + Boden) hängen an diesem einen
Kopf, und mp-boden allein bewegt an main 0 von 64 Zell-Mitten — eine Extra-Landung kostet einen Zug ohne Bild.

## Der Schnitt (die Klasse „Dorf der Ankunft: Haus und Weg" ganz)
- Stufe 0 (heute Nacht, parallel, unabhängige Dateien): `w28-leib-nah` 694b85d2 Abgabe-Kopf nach erwachen/gtx1050:29 — mit
  der Stadt im selben Zug.
- Stufe 1: stadt-grammatik 45290d87 → check + gate:mp-sync am Kopf → leerer Abgabe-Kopf (Vorlage `p3/n1211/sg/abgabe-msg3.txt`
  auf der OMEN) → Zug.
- Stufe 2: fassade + stoff-fuge + weg-koerper als **EINE Abgabe** auf dem gelandeten Stadt-Kopf (ein Zweig, EINE Prägung von
  haeuser.json statt zwei, ein Bildpaar Dorf aus Auge/Hügel/Dach mit den Kameras aus Rumpf b1ffbea3 „KAMERAS"). Fassade zuerst
  einmischen (älteste Basis), dann stoff-fuge, dann weg.
- Leser-Liste (aus den Rümpfen, vor dem Schnitt zu greppen): fachwerk-core.js:199 RAHMEN · :683 gliederung · :1089 fensterAt ·
  :2067 hausTon · :5599 ausRaster (fassade) · stamm/siedlung-wege.js `_wegeKarteMale` ~551 · `_wegeBodenFarbe` ·
  stamm/gelaende-boden.js:113 `_bodenSichtAt` · stamm/gelaende-kollision.js:1127 `_kontaktStoffAt` · stamm/koerper-leib.js:575
  `_standSicht` · stamm/vegetation-baum.js:1913 `_aufWeg` · stamm/siedlung-instanz.js:1007 (Rad) (weg-koerper) ·
  stamm/studio-stoff.js, stamm/siedlung-satz.js (stoff-fuge) · stamm/kreatur-leben.js:1687 (stadt).
- Kosten-Zeile: leib-nah gemessen (16,69 ↔ 16,68 ms, +2 575 Dreiecke); Stadt und Weg-Körper (Pool „siedlung-weg", nah 70 m
  Glieder, mittel 220 m Kisten) UNGEMESSEN — Pflicht vor Stufe 2: Frame p50 + Dreiecke am Dorf heute ↔ Kandidat.
- Kriterien (stand.json 20:54 am ec281422): siedlung.K1 1 P (1/3 Stationen GRÜN; Innen Median 0,083 ↔ ≥ 0,15) · material.K1
  0 P (fels 1,1056, boden 1,296 ↔ 0,9–1,1) — der Boden-Stoff des Wegs · mensch.K4 2 P (gesicht 0,833 ↔ 1, Radeon) — leib-nah
  bewegt ihn nach eigener Aussage NICHT · Pflicht C Verkehr und F Prüfplatz hängen an Stufe 1.

## Was schon liegt (die 20 wertvollsten, nächste Landung zuerst)
| # | Zweig · Kopf | hinter/vor | fehlt bis zur Landung |
|---|---|---|---|
| 1 | leib-nah 694b85d2 | 0/7 | Tor-Liste am gemischten Kopf lesen, leerer Abgabe-Kopf |
| 2 | stadt-grammatik 45290d87 | 0/68 | check + mp-sync am Kopf, Abgabe (trägt mp-boden) |
| 3 | ziel-plan-wip 3005322c | 12/10 | vier Bilder Dorf main ↔ Zweig, Kopf nach w28-ziel-plan schieben |
| 4 | tor-bruch c7d0aad4 | 12/4 | Rumpf ohne „[gpu-probe: gate:…]"; Rot 21:21 lesen; Wachstum ≤ +1 500 Atome |
| 5 | fassade b038852b | 203/44 | auf Stadt-Kopf mischen, haeuser.json neu prägen, Bild (Stufe 2) |
| 6 | stoff-fuge 212b6de9 | 39/67 | Bildpaar mit `SF_KULTUR` (Stufe 2) |
| 7 | weg-koerper b1ffbea3 | 39/62 | erstes Bild auf echter GPU (fwidth ungeprüft), Kosten, main mischen (Stufe 2) |
| 8 | studio-seiten ad504fbe | 21/6 | Notbremse-Stand prüfen (huelle.js, uebersicht.js), Stall-Akte diag-blick.cjs heilen |
| 9 | wiese-fern 476a3ed9 | 32/2 | Gegenprobe `_laubLichtStoff` in `_halmFerne` (stamm/stoff-material.js); Ego ≤ heute |
| 10 | stamm-krone 31f4607c | 138/5 | z416 K4 „Gang haus_alemannisch Bau 39,1 %" zuordnen; phyto-core gegen karte-stamm mischen |
| 11 | seiten-stille 4e0f2942 | 331/1 | main mischen + Abgabe-Kopf (Werkzeug, kein Bild) |
| 12 | reibellipse 92879eab | 237/11 | Gesetz bis 1,3 tragen; Schwelle bleibt (Kurs §2.10) |
| 13 | griff-ellbogen dce88a79 | 89/1 | Halbmesser je Richtung (Befund im Rumpf) |
| 14–15 | mp-boden 77c31f1a · studio-welt 6039dc13 | — | getragen von #2 bzw. #8; landen nicht allein |
| 16 | ziel-plan 0146c309 | 32/8 | getragen von #3 |

TOT beim Namen (16, nicht löschen ohne Wort des Schöpfers): weltbild-kalt (in main über buch-platte) · wiese-mitte (Zwilling
von wiese-fern, Selbsturteil) · karte-gestalt · laub-luma · baum-wechsel · geister-wand · stoff-stufe-null · mensch-stufe
(Diff leer) · wasser-sicht-vorher · samen-karten-stufe · samen-live-tausch · samen-lichtweg · samen-wiese · samen-fahrzeug
(Befunde, kein Landegut) · dazu fenster-wand/w27-wald-saum aus Blatt A (nicht w28 bzw. nicht neu geprüft).

## Ehrlich offen
- Nicht gelesen: Check-Ergebnis von stadt-grammatik 45290d87 und leib-nah 694b85d2 (beide nach 21:30 gemischt); Rot-Text
  tor-bruch 21:21; Inhalt von studio-seiten ad504fbe; ob D9 „Dorf steht vor dir" (älterer Check 8bd897de) am neuen Kopf hält.
- Widerspruch: OMEN plante mp-boden ALLEIN zuerst (erwachen/omen:16); sie selbst mischte es 21:33 in den Stadt-Zweig — ich
  entscheide für den gemischten Kopf.
- Fassade-Diff gegen stadt-grammatik ist unscharf (mehrere Merge-Basen, f46b9e81); eigener Umfang nur aus dem Rumpf.
- Ungemessen: Kosten der Stadt und des Weg-Körpers; das Schweben der Leiber im Stadt-Bild (0698fb92) — Täter unbenannt.
- Die Buchung 221 → 219 (schatten.K3#1/K4#1) ist ohne Täter; keiner dieser Zweige ist geprüft dagegen.

## Rang
1. Stadt-Wurzel landen, dann Haus+Weg als EINE Abgabe — Wirkung 5 (Dorf, Stadt, C, F) · L · Risiko: drei Zweige teilen
   fachwerk-core.js und haeuser.json; ein Konflikt-Fehler kippt Goldens und Mehrspieler-Wand erneut.
2. leib-nah Abgabe — Wirkung 4 (keine Fetzen mehr an jedem Bewohner) · S · Risiko: Tor-Liste am gemischten Kopf ungelesen.
3. ziel-plan-wip + tor-bruch heim — Wirkung 2 (Tag der Bewohner, ein Probe-ROT der Stadt fällt) · S · Risiko: der Zählweg
   des Leibs ist ein Urteil des Apparats — er muss mit Mutante ROT bleiben (Selbsttest L liegt).
