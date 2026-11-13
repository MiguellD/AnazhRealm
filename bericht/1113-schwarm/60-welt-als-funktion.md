# 60 Die Welt als Funktion der Saat: Reihenfolge, gemerkte Werte, Wanduhr

## Was es den Spieler kostet (kein Bild gesehen — das Thema ist Gleichlauf, nicht Pixel)
- Die Mehrspieler-Wand (gate:mp-sync) ist der Kipper der CI an Zweigen: Stadt-Kopf 22872718 ROT 3/3, studio-welt 6039dc13 kippt
  (UEBERGABE-2026-11-13.md:39, :42, :89). Jeder rote Zug kostet eine Fahrt (~40 min) und hält stadt-grammatik, fassade,
  stoff-fuge, studio-welt fest (UEBERGABE:39) — die ganze Stadt-Kette (C, F) hängt an EINER Wurzel dieses Bereichs.
- Spieler: nach Reload oder beim Mitspieler steht in einer Region eine andere Fauna (vor dem Schnitt „Leben 251 von 335 Zellen
  gleich", Kommentar im Schnitt `w28-mp-boden` stamm/kreatur-leben.js:1682–1687).
- Ankunft: Chunks im Umkreis eines Erdbaus lesen NIE die Platte (Warm-Start) — stamm/gelaende-chunks.js:812–819. Das Dorf am
  Prüfplatz IST Erdbau: der zweite Boot (12,0 s, CLAUDE.md B) baut genau den Ort der Ankunft kalt. Anteil ungemessen.

## Was die Quelle sagt
- DIE WURZEL (gemessen): `_bodenKlasseAt` (stamm/kreatur-leben.js:1681–1687) liest den Hang über `_terrainMacroSurfaceY` =
  gelaende-core `hoehe` SAMT Erdbau; am Erdbau setzt der Kern `aus.hang = 0` (gelaende-core.js:2777–2778). `_bestandFeld`
  merkt die Klasse je Zelle mit Schlüssel NUR `seed` (kreatur-leben.js:2271–2280). Wer vor dem Erdbau fragt, trägt eine andere
  Klasse als danach und als jeder Reload. Leser von `_bodenKlasseAt`: `_bestandFeld` :2280, `_pickFaunaSoulAtPlayer` :1674,
  `_bestandLeibOrt` :2602.
- DAS RICHTIGE MUSTER LIEGT SCHON DREIMAL: der Mulden-Merker im Kern leert sich bei neuem `L.erdbau` (gelaende-core.js:5457–5461);
  `_windForm` schlüsselt Saat+Erbgut+Erdbau (stamm/stoff-material.js:285–293); die Wald-Merker tragen `_erdbauStand`
  (vegetation-baum.js:2541, vegetation-streu.js:62–66). Die Trasse liest bewusst `hoeheGrund` („der Plan ist eine Funktion von
  Saat und Gesetz", gelaende-core.js:2660–2668).
- DIE KLASSE (Merker, der Geschichte liest, ohne ihren Stand im Schlüssel): `_bestandKlassen` (kreatur-leben.js:2272, Schlüssel
  seed) und `_pegelOrte` (stamm/wasser-hydro.js:282–286: Schlüssel cx,cz + Hydro-Region, `y` aus `_terrainMacroSurfaceY` samt
  Erdbau, wird nach einem neuen Ort nie neu gelesen). Weitere Zell-Merker in stamm/ mit nur-seed-Schlüssel: keine gefunden
  (Grep `seed !== seed` → nur :1741 Ströme, :2272, feld-leben.js:1823 Substrat).
- REIHENFOLGE IM ERDBAU (gelesen, ungemessen): `_erdbauRoh` reiht die Orte in Einfüge-Reihe von `worldMeta.erdbau`
  (gelaende-boden.js:771, :778); auf überlappenden Flächen gilt „die letzte gewinnt" (gelaende-core.js:2039–2040, :2167–2212).
  Die Ort-Wahl liest „die Höhe samt dem Erdbau früherer Orte" (gelaende-core.js:2654–2655, :2673–2674; voxel-worker.js:819–820)
  — der Plan eines Orts hängt an der Folge, in der der Spieler Orte nahte. `_ortReistNicht` behauptet „in jeder Folge der Orte"
  denselben Ort (siedlung-ort.js:2610–2611); `unberuehrt` prüft Spieler, Fremd-Slots, Wirt-Abweisung (gelaende-boden.js:1110–1153),
  NICHT fremden Erdbau im Such-Kasten. Reichweite: Zelle 256 m (fachwerk-core.js:3326), Wahl-Ringe 8 × 16 m
  (gelaende-boden.js:3071), Erdbau-Reichweite 16 m (gelaende-core.js:2045) — Überlappen zweier Nachbar-Orte ist möglich.
- ZUFALL: `Math.random` in stamm/ nur in Kennungen (netz-p2p.js:52/696/703, speicher-welten.js:10–438), Klang-Rauschen
  (klang.js:1200/1234), Rauch-Teilchen (siedlung-bewohner.js:94–104), ein UI-Vorschlag (feld-leben.js:1767) — keine Welt-Logik.
  Die Fauna würfelt aus Saat-Strömen; der Bestands-Takt je (Saat, Region, Zeit) frisch (kreatur-leben.js:2348). Session-gezählt
  bleiben die Ströme „fauna" (Boot-Wurf verhalten.js:2337, Gegenwehr kreatur-leben.js:824) und „leib" (:2595) — sie zeichnen
  Leiber, nicht den Bestand.
- WANDUHR: 306 Treffer `performance.now|Date.now` in 47 stamm-Dateien; die Masse sind Fristen (Bau-Budget je Bild). In
  Welt-Logik: der Leben-Trickle der Leiber läuft auf `performance.now` (kreatur-verhalten.js:3185 → feld-leben.js:2450–2455) und
  schreibt einen REISENDEN Feld-Akt (feld-leben.js:2347–2351), den die Äsung des Bestands liest (kreatur-leben.js:2077–2080,
  :2281). Boost-Ablauf auf Wanduhr (koerper-seele.js:159/181, kreatur-leben.js:482/512). Das Gesetz selbst (Bestand, Fraß,
  Brand, Leben-Zerfall feld-leben.js:2064) steht auf `spielZeit` — sauber.
- KONSUM-TIEFE: das Gesetzbuch KANN die Saat-Höhe (`hoeheGrund`, ein Export im Kern); die Welt konsumiert sie an 1 Stelle
  (Trasse) von 3 Saat-Entscheidern (Trasse, Ort-Plan, Boden-Klasse) — 33 %; mit `w28-mp-boden` 67 %.

## Die EINE begrenzende Entscheidung
Was aus der Saat entschieden wird, liest die Saat-Höhe (`hoeheGrund` / `_terrainSaatY`); der Erdbau ist der letzte Term nur für
das, was man sieht und betritt — und jeder Merker, der den Erdbau doch liest, trägt `_erdbauStand` im Schlüssel.

## Der Schnitt (die Klasse ganz)
Stufen in EINER Welle:
1. `_bodenKlasseAt` → `_terrainSaatY` (liegt: `w28-mp-boden` f97fe692, stamm/gelaende-boden.js +15, kreatur-leben.js +10).
2. `_pegelOrte` (wasser-hydro.js:283–286): Gültigkeit zusätzlich an `this._erdbauStand | 0` (das Muster von vegetation-baum.js:2541).
3. Ort-Wahl liest die Saat: `ortCtx.hoeheAt` (gelaende-core.js:2673) → `hoeheGrund(L, x, z, true)`; `wasserAt` (:2674) bleibt
   am Wasser-Urteil des Wirts. Damit wird `_ortReistNicht` (siedlung-ort.js:2610) wahr statt behauptet.
4. Leben-Trickle auf `spielZeit` (kreatur-verhalten.js:3185: `this.state.spielZeit` statt `performance.now()/1000`).
Leser-Liste (vor dem Schnitt):
- Stufe 1: kreatur-leben.js:1674, :2280, :2602; scripts/diag-mp-sync.cjs (Linse im Zweig); spec/stamm/modul-karte.json.
- Stufe 2: `_pegelMarkeVon` → `_chunkIdbKey` gelaende-chunks.js:804 (Platten-Schlüssel), Pegel-Takt wasser-hydro.js:304 ff.
- Stufe 3: fachwerk-core.js ortPlan :8683, Genesis :10374, Ring-Wahl :4347; voxel-worker.js ortWahl :843; das Studio
  (fachwerk.js `buildDorf` über `lageGrund`, erdbau null — wird gleich, nicht anders); gate:settlement Teil O (Plan-Hash Studio
  = Welt, gelaende-core.js:2657). NICHT ändern: `genesisPosen` (worlds/fachwerk/fachwerk.js:596) und die Stationen
  (fachwerk-core.js:10219–10236) — Kamera über der Terrasse liest zu Recht den Erdbau.
- Stufe 4: `_tickCreatureLifeTrickle` (feld-leben.js:2450), `lastLifeTrickle` im Stand (nicht gelesen, ob er reist).
Kosten-Zeile: `_terrainSaatY` = `hoehe` ohne `erdbauY` (billiger, ein Gang weniger); Stufe 2 ein Ganzzahl-Vergleich je Frage;
Stufe 3 im Faden, gleiche Probenzahl; 0 Dreiecke, 0 Programme, kein ms am Schirm. Nichts wächst mit der Weltgröße.
Kriterien der Meisterkarte:
- feld.K2#2 (headless) — Ist: GRÜN gehalten am 95ba6fd6, „Linse seit der Messung geändert" (stand.json:631–637); Zweige ROT 3/3
  ohne ↔ GRÜN 4/4 mit Stufe 1 (erwachen/omen-2026-11-13.md:26–27). Soll: GRÜN am Zug. Station: gate:mp-sync.
- Stufe 3 trägt kein Kriterium mit eigener Station — gemessen wird sie an gate:settlement Teil O (Plan-Hash) und an zwei
  Ankünften mit vertauschter Orts-Folge (Ist ungemessen).

## Was schon liegt
- `w28-mp-boden` f97fe692 (WIP, „[skip ci]") + Merge 77c31f1a; Diff zu main: 4 Dateien, +99/−3. Gemessen: GRÜN 1/1 an aa8e540f
  (Leben 319/319, 283/283); Linse an main: alte Lesart kippt an 397 von 6400 Punkten, an 0 der 64 nahen Zell-Mitten. `check` dort
  ROT an diag-taille.cjs („das Rezept ist null"), nicht aus dem Schnitt gelesen (erwachen/omen-2026-11-13.md:30–33).
  Fehlt: Zahl der Kette zm2/mp-2, `check` am Kopf, leerer Abgabe-Commit „[ci voll]".
- `w28-stadt-grammatik` 156cc903 trägt denselben Schnitt (Merge: main gewinnt im Kommentar, :55).
- Stufen 2–4: nichts liegt.

## Ehrlich offen
- Der Kipper an main-Zweigen (studio-welt) ist durch Stufe 1 NICHT bewiesen (0 von 64 Zell-Mitten kippen; UEBERGABE:89).
  Kandidat aus diesem Bereich: der Trickle auf Wanduhr (Stufe 4) schreibt bildraten-abhängig in das Feld, das die Äsung liest —
  ungemessen, ob er in der Probe der Wand Leiber trägt (`tendsLife`).
- Ob zwei Nachbar-Orte sich im Spiel überlappen (Stufe 3) und ob Genesis-Erdbau und Dorf-Wahl am Prüfplatz um die Reihenfolge
  laufen (Vorlauf `legen=false`, gelaende-boden.js:1064): gelesen, nicht gemessen. Bild der Ankunft kann sich an Häusern
  ändern, die heute auf einer Nachbar-Terrasse stehen — Bildpaar am Dorf ist Pflicht für Stufe 3.
- Kanonische Reihe des Erdbaus (`_erdbauRoh` nach Schlüssel statt Einfügung) würde „die letzte gewinnt" folgenfrei machen,
  bricht aber das Index-Protokoll `erdbauOhne` (gelaende-boden.js:870–894) und den Faden — bewusst NICHT im Schnitt.
- Warm-Start am Erdbau (gelaende-chunks.js:812–819): erst wenn Stufe 3 steht, ist der Erdbau der Orte eine Funktion der Saat und
  ein Platten-Schlüssel aus seinem Hash denkbar (Samen-Kandidat 2). Anteil der Erdbau-Chunks am Zweit-Boot: nicht gemessen.
- Ob Boosts (Wanduhr-`expiresAt`) im Stand reisen: nicht gelesen. gelaende-kollision.js, speicher-welten.js:1704 nur gestreift.

## Rang
Wirkung 4 (Takt: die Mehrspieler-Wand gibt die Stadt-Kette frei; im Bild 1–2 über Stufe 3) · Aufwand S für Stufen 1, 2, 4;
M für Stufe 3 · Risiko: Stufe 3 verschiebt Häuser eines Dorfs, das heute auf dem Erdbau eines Nachbarn plant — ohne Bildpaar
am Prüfplatz nicht landen.
