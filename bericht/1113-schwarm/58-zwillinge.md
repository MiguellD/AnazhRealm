# 58 Code-Gesundheit: Zwillinge und verletzte EINE Quelle

Gelesen am Code von main ec281422 (Baum leib-kanon-urteil), Zweige per `git show/diff origin/…`. Nur gelesen, nichts gemessen.

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/dorf-main-0.5.png` (Dorf der Ankunft, Mittag): das Haus rechts ist ein weißer Kasten mit glatter Putzfläche, flachen Fenstern und
  einer blauen Dachkante ohne Ziegel; der Platz ist brauner, gesprenkelter Teppich, die Wege sind violette Schlieren ohne Kante, ohne Bord.
  Die Menschen tragen aufgeblähte Oberkörper. Himmel dunkel-marine mit weißen Wolkenfetzen.
- `scratchpad/studio-welt/kandidat-fachwerk-bild.png` (Studio-Bühne): dasselbe Gesetzbuch zeigt ein Dach mit sichtbarem Ziegelraster und
  eine Backstein-Wand mit Ton je Stein. Das Labor kann, was die Welt nicht zeigt.
- `scratchpad/studio-welt/heute-fachwerk-diff.png`: fast ganz rot, für mich nicht deutbar (kein Urteil daraus).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Die zehn teuersten Zwillinge (A ⇄ B), nach Wirkung im Bild der Ankunft geordnet:
1. **Stein im Verband ×4 Knoten + 2 Labor-Karten.** `_steinStoff` stoff-material.js:2779–2829 (Fuge als Box-Abdeckung :2784–2791, Ton per
   sin-Hash :2792, Gesetz `porta:STEIN_GESETZ` porta-core.js:292) ⇄ `_kopfsteinFarbe` siedlung-wege.js:935–970 („dieselbe Rechnung wie
   `_steinStoff`" :931, eigener Kamm :948–956, eigener Hash :958–960) ⇄ NEU auf w28-stoff-fuge 212b6de9: `_fugeStoff` in studio-stoff.js
   (eigener Kamm, eigene Ableitungen, Gesetz `fachwerk:FUGE {breiteM 0,025, ton 0,11}`, Ton `steinTon` als Ganzzahl-Hash in fachwerk-core)
   ⇄ Labor-Karten fachwerk-core.js:1799 `texZiegelwand` (NF 24×7,1 cm, Fuge 1,1), :1832 `texStein` (46×28, Fuge 1,6, Ton 0,88–1,12).
   porta-core.js:281/:283 schreibt die Zahlen von `texStein` als Zahl-Zwilling ab. Drei Fugen-Breiten, drei Ton-Hashes, drei
   Fern-Regeln (Kopfstein blendet unter 2,5–5 px aus :968, `_steinStoff` nicht).
2. **Weg-Querschnitt.** Labor `worlds/fachwerk/fachwerk.js:308–330` baut Bordstein mit Flanke (profBi/profBa :311–312), Gehweg, Bombierung
   2,5 %, Gully, Mittellinie als Körper; eigene Epochen-Grenzen `jahr>1880`/`>=1640` (:280–281) ⇄ Kern `BELAG_GESETZ`
   fachwerk-core.js:8520 (jahr0 1200, je 200 J.) ⇄ Welt malt nur eine Karte: `_wegeKarteMale` siedlung-wege.js:551–596, Gehweg = breiterer
   Saum desselben Belags (:563–565). Kein Bordstein-Leser im stamm (kurs-C Z. 14).
3. **Haus-Karte reist nicht.** fachwerk-core.js:53–58 „Durchs Portal reist keine Karte"; `materials()` :1911–1948 hängt `map` an ziegel,
   ziegel2, backstein, putz, stein (:1912) — nur das r128-Labor liest sie. Die Welt baut `_foundryMats` studio-stoff.js:157–751 ohne Karte.
4. **Poncho.** koerper-core.js:250–255: „das Lab drapiert ihn", die Welt setzt `dicke: 0` = Hülle über den Teilen (Ballon im Bild).
5. **Haupt ⇄ Faden, ~50 „Mirror"-Marken in voxel-worker.js.** `ortFrei` :1188–1212 ⇄ `_ortFrei` gelaende-boden.js:1236–1260 (Zeile für Zeile
   gleich); FEUCHTE-Literale :1840–1843 ⇄ gelaende-boden.js:3112–3116 („bei Änderung hier mit-ziehen" :1838); `feuchteAt`/`pathFieldAt`
   :1847/:1883 ⇄ :1467/:1498; `caColumnScan`/`buildWaterSheetGeometry` :1922/:1954 ⇄ wasser-zellen.js:2440/:952; Höhlen :2635 ⇄
   gelaende-boden.js:1932; Wasser-Zellen „OHNE Architektur-Stempel" :3135 (vereinfacht). Das Gegenmuster liegt schon: :1807–1820 ruft
   `G.wasserSpiegel(state, …)` aus gelaende-core — eine Funktion, zwei Fäden.
6. **Himmel des Labors.** phytogenesis.js:455–494: Verlauf mit Literalen uHor 0xbcd2e0, uBot 0x3a4250, uCover 0,15 (:458–462); nur die
   Wolken-Zahlen teilt `HIMMEL_GESETZ` foundry-core.js:118–133 ⇄ Welt `createGalaxySkybox` bild-himmel.js:234 (EINE Atmosphäre).
7. **Bild-Pipeline.** 5 von 7 Bild-Studios r128 mit eigenem Licht und ACES (fachwerk, koerperstudio, tetrapoda, portale, terrain;
   kurs-D Z. 27), 9 `WebGLRenderer` in worlds/ (SYSTEMKARTE.md:136) ⇄ `welt-licht.js buehne` (nur garage, schmiede).
8. **Material-Familie.** fachwerk-core.js:1913–1941 MeshStandardMaterial je Rolle (Labor) ⇄ studio-stoff.js `_foundryMats` (Welt, TSL);
   „der Stoff der Welt läuft in KEINEM Studio" (kurs-D Z. 28).
9. **Nadel der L2.** foundry-core.js:2610 und :2719 `vegFarbe(0x2e5526)` ⇄ phyto-core.js:2081 `conifer 0x2e5526`; die Mammut-Zeile
   :2082 (0x3a6a30) liest die L2 nie (FUND-REGISTER.md:56, heute noch da).
10. **Licht-Achsen** Tag-Achsen ×5, Belichtungs-Schreiber ×3, Lichtwege ×4 (SYSTEMKARTE.md:127, Stand 18.10.) — nicht nachgeprüft.
Gefallen seit dem Audit (nicht mehr teuer): der Stripper (EIN `ohneKommentare` scripts/lib/stamm.cjs:737 mit Tafel :874), die
57 pageerror-Sammler (Gedächtnis decke-zahlstelle), der Wetter-Zwilling (daten.js:99), der Tier-Gang (koerper-leib.js:474–484).

## Die EINE begrenzende Entscheidung
**Der Stein im Verband hat EINEN Stoff-Knoten und EIN Schema, bevor w28-stoff-fuge landet.** `_steinStoff` wird der einzige Kamm (Fuge als
Abdeckung, Ton je Stein, Kante, Fern-Mittel); jede Zeile — Quader des Tors, Kopfstein, Backstein-Gefach, Bord und Kantstein von
w28-weg-koerper — ist eine Zeile desselben Schemas `{fuge, fugeTon, ton, fase, steinM|raster}` mit EINER Ton-Funktion. `_fugeStoff`
landet nicht als zweiter Knoten, `_kopfsteinFarbe` ruft den Kamm statt ihn zu kopieren. Kein Soll, keine Schwelle bewegt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Stufen (eine Welle, auf w28-stoff-fuge, vor seiner Abgabe):**
1. Kamm und Ton als EINE Funktion: Ton-Hash der Welt = `steinTon` des Kerns (ganzzahlig, dieselbe Zahl CPU und GPU) — der sin-Hash
   stoff-material.js:2792 und siedlung-wege.js:958–960 fallen. Fern-Regel EINMAL (die Pixel-Schwelle aus siedlung-wege.js:968 für alle).
2. `_fugeStoff` (Raster aus SATZ_FUGE) und `_kopfsteinFarbe` (Raster aus der Welt-Lage) liefern nur ihr (u, v, Lage) in den Kamm.
3. Die Zahlen: Backstein-Zeile `FUGE` und Quader `STEIN_GESETZ` in demselben Schema; porta-core.js:281/:283 zitiert keine Labor-Zahl mehr.
4. Labor: `texZiegelwand`/`texStein`/`texDach`/`texPutz` (fachwerk-core.js:1799–1856) lesen bis zum Umzug dieselben Zeilen; sie fallen ganz,
   sobald fachwerk auf der Bühne steht (w28-studio-seiten).
**Leser-Liste (vor dem Schnitt, im Commit):** `_steinStoff` ← studio-stoff.js:585–593 (`mp.stein`, Tore am Genesis-Ring) ·
`_kopfsteinFarbe` ← siedlung-wege.js:924 (`_wegeBodenFarbe` → gelaende-boden, gelaende-fern, feld-leben, stoff-material laut Rumpf
b1ffbea3) · w28-weg-koerper `_kopfsteinMittel`, `_wegKoerperFarben` · w28-stoff-fuge `_fugeStoff`, `fugeDeckung`, `steinTon` (Bake der
Stufe 0, Goldens spec/asset-contract/v6/golden/haeuser.json) · Labor `materials()` fachwerk-core.js:1912 ← fachwerk.js:22, `_mmFor` :2060 ·
porta.js `steinLabor` (nicht gelesen) · Linsen material.K3 (Stufen-Gleichheit Haus), gate:fachwerk-contract.
**Kosten-Zeile:** reine Pixel-Arbeit am Schirm, kein Befehl, kein Dreieck, keine Textur; ein Knoten statt drei Graphen senkt eher die
Programm-Zahl (ungemessen). Kosten nicht über heute: `gpu-bank` Dorf vorher ↔ nachher, gleiche Kamera; Ankunft (B) unverändert erwartet.
**Bildpaar:** feste Kameras aus dem Rumpf von b1ffbea3 (auge-frontal −702,73 39,32 −882,10 → −705,87 39,02 −882,71; huegel; dach),
`--uhr 0.5`, vorher main ec281422, nachher Kandidat; Haus, Platz und Tor in einem Blick, aus Auge, Hügel und Dach.
**Kriterien:** material.K1#1 Welt/Labor im Band 0,9–1,1: Ist 11/13 (fels 1,1056 · boden 1,2969) ↔ Soll 13/13, Station gtx ROT an
ec281422, radeon ungemessen · material.K3#1 Haus L1/L0 1,008 (radeon) / 0,992 (gtx) ↔ 0,95–1,05, gehalten — darf nicht kippen ·
stoffe.K1#1 stein 4/7, gehalten. Ein Kriterium, das die Fuge selbst misst, habe ich nicht gefunden (ehrlich: die Abgabe ist das Bildpaar).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-stoff-fuge` 212b6de9 (WIP, OMEN): `_fugeStoff` + `FUGE`/`steinTon`/`fugeDeckung`, Goldens 113 von 258 neu geprägt; 36 Dateien,
  +3728/−1149. Fehlt: Stufen 1–3 oben, dann Bildpaar und Abgabe nach w28-stadt-grammatik.
- `w28-weg-koerper` b1ffbea3 (WIP, Fable): WEG_GESETZ im Kern, Labor liest Querschnitt aus dem Kern (Zwilling 2 fällt bis auf „Asphalt der
  Moderne bleibt labor-eigen"); liest porta-Kopfstein — gut. Fehlt: Bild auf echter GPU, Konsum-Proben, Kosten.
- `w28-studio-seiten` ad504fbe (WIP): alle Seiten auf die Bühne — damit fallen Zwillinge 3, 6, 7, 8 und Stufe 4.
- `w28-leib-nah` 694b85d2 (GTX 1050): Poncho als Stoff aus der Haut — Zwilling 4.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gelesen: porta.js `steinLabor`, das Poncho-Drape im koerperstudio, `_fugeStoff` ganz (nur die ersten 45 Zeilen des Diffs).
- Zwilling 5 (Faden-Spiegel) ist der größte im Code (~50 Marken, gezählt nach Kommentar, nicht nach Funktionsvergleich) und kostet jede
  Gelände-Änderung doppelt — er steht nicht im Bild; Schnitt dort: jede Spiegel-Funktion als `f(state, …)` nach gelaende-core (Muster
  voxel-worker.js:1807–1820). Nicht Teil dieser Welle.
- Zwilling 10 und die Ort/Räumer-Zwillinge (SYSTEMKARTE.md:82) sind vom 18.10., nicht nachgeprüft.
- Ob ein Knoten auf r184 wirklich weniger Programme baut: nicht gemessen. Ob porta-core im Foundry-Faden vor fachwerk-core lädt: nicht
  gelesen (darum bleiben die Zeilen in ihren Kernen, nur das Schema und der Knoten werden eins).
- material.K1 fiel 10.11. durch TERRAIN_BUMP (kurs-B Z. 58), nicht durch Stein — der Schnitt hebt es nicht sicher.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Stein im Verband EIN Knoten: **Wirkung 4** (jedes Haus, jeder Platz, jedes Tor der Ankunft trägt dann dieselbe Fuge) · **M** · Risiko: die
  Goldens der Häuser (113 von 258 schon neu geprägt) und die Stufen-Gleichheit material.K3 verschieben sich mit dem Ton-Hash.
- Faden-Spiegel nach gelaende-core: Wirkung 3 im Takt (jede Erdbau-/Wasser-Karte zahlt einmal statt zweimal) · L · Risiko: die
  Determinismus-Wand (gate:worker-dichte) bricht bei jeder Bit-Abweichung.
- Labor-Himmel/Material/Pipeline: fallen mit w28-studio-seiten · M · Risiko: kein eigener Schnitt, nur Mitnahme.
