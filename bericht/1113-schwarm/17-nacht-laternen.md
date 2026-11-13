# 17 Nacht: Laternen, Licht-Pool, leuchtende Fenster

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Kein Bild der ECHTEN Welt bei Nacht gesehen (BILD trägt nur Mittag: `dorf-main-0.5.png`, `genom-spiel/`). Gesehen: die Spike-Szene des
  Samens (Dorf-Platz, 14 Laternen, echte r184-Shader, swiftshader), Kopien in `BILD/befunde/`:
- `befunde/li-bild-heute-nacht.png` (heute, Auge 2,8 m neben einer Laterne): die Köpfe der Laternen an den Häusern glühen als weiße Punkte,
  ihr Fuß bleibt schwarzblau; Boden und Mauer VOR dem Auge stehen orange (das Licht kommt von Laternen neben/hinter dem Auge). Die
  Fenster glühen als flache orange Quadrate, die Wände um sie bleiben dunkel. Wirkt wie ein Platz mit EINER Lampe im Rücken.
- `befunde/li-bild-pass-nacht.png` (Kandidat Licht-Pass, 16 Quellen): unter jeder Laterne ein warmer Kreis am Boden, die Hauswand hinter
  der Mitte-Laterne glüht, der Baum trägt warme Kanten — ein beleuchteter Platz statt Punkten.
- `befunde/li-bild-heute-nacht-oben.png` (von oben, heute): vier Laternen links unten werfen Kreise, die rechte und hintere Hälfte des
  Platzes liegt mit glühenden Köpfen im Dunkel — sichtbar die Grenze „4 Plätze".

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- Gesetzbuch KANN: `LICHT_GESETZ` (`fachwerk-core.js:5347–5351`) — laterne 1900 K, staerke 19, reichweiteM 12, abfall 2, kernM 0,1,
  hoeheM 3,6, Zeitplan abend/nacht 1; fenster 2800 K, Glut abend 0,42 / nacht 0,85; feuer 2000 K, nacht 45; wandlaterne aus Wand-Gesetz
  (`:5358–5375`); Abstand-Soll 9 m, „zwischen zwei Laternen 0,44 davon, Band 2–5 lx" (`:5338–5339`). Abfall `lichtAbfall` (`:5397`).
- Welt KONSUMIERT: `LICHT_POOL = { plaetze: 4, umkreisM: 48, wahlS: 0.25, wahlM: 1, blendeS: 0.5 }` (`stamm/stoff-material.js:3754`).
  Jede Laterne steht als Eintrag `_blockerMit("licht")` (`dirigent-kern.js:1758`, Plan → `siedlung-ort.js:506,585`), aber nur 4 tragen Licht.
- Der Pool ist ein Term IM Programm jedes beleuchteten Stoffs: `knoten[licht] = em.add(this._lichtPoolTerm(…))` (`stoff-material.js:2064`);
  Schleife `Te.Loop(lichtLage.length)` (:2421), je Platz 4 `_jePlatz`-Select-Ketten (:2439–2443), Bedingung + Abfall + Lambert/GGX
  (`_lichtPlatz` :2450–2475, `_punktLichtBrdf` :2482–2500); `select(bedingung, beitrag, 0)` (:2474) wählt NACH der Rechnung.
- Wahl `_leuchtTakt` (`dirigent-kern.js:1601–1704`): alle 0,25 s / 1 m die 4 mit kleinstem Rang (:1634–1636), Rang = Kugel außerhalb Kegel
  +1e9, sonst Abstand×1e3 (:1752); waagrecht > 48 m keine Wahl (:1760). Uniforms fest ab Boot (`stoff-material.js:687–694`).
- Wurf: EIN Platz trägt Würfel-Schatten 256 px (`bild-schatten.js:399–454`, Wahl `_lichtWurfTakt` :464–529), sein Faktor lebt IM Pool-Term
  (`stoff-material.js:2419,2429`).
- Fenster: `M.glas.userData.__licht='fenster'` (`fachwerk-core.js:1946`), Schlaf-Glas dunkel (:1938, `fensterAt` :1062); fern als Scheibe
  `M.glas` vor Innenkörper (`fensterFern` :2465–2486) — die Fenster GLÜHEN (Glut, `stoff-material.js:2059–2063`), sie LEUCHTEN NICHTS an:
  `fenster` trägt weder staerke noch reichweiteM (`fachwerk-core.js:5349`), ist kein Eintrag im Pool.
- Zahlen des Samens (`origin/w28-samen-lichtweg:samen/lichtweg/BEFUND.md` §1/§3, swiftshader): Spike-Szene heute **0 von 7** Laternen im Bild
  beleuchten ihren Fuß am Auge, **4 von 12** von oben; pool16 und pass je 6/7 · 9/12. Bild-ms Nacht heute 182 · pool16 **1029** · pass 254.
  Echte Welt vor Weltbild: Fragment heute 59 Module 2,16 MB · pool16 2,37 MB · pass 2,00 MB (−7 %). Pool = 8,8 KB je Programm × 20.
  Mittag: heute ↔ pool16 ↔ pass byte-gleich.
- Meisterkarte: `schatten.K5` „Nachts wirft das Feuer" 0/2 (`PM/punkte/stand.json`); frische Radeon-Zahl am ec281422
  (`PM/punkte/messung/roh/ec281422-radeon/schatten.K5_1.out`): quelle `laterne_dorf`, abM 2,45, imPool true, **Llicht 0,0465 ·
  Lschatten 0,2115 · Kontrast 0,22:1** (Soll ≥ 3:1, Station `stationen/g3.js:2145–2150`) — der Boden HINTER dem Pfosten ist heller als daneben.

## Die EINE begrenzende Entscheidung
„Das Licht der Quellen ist ein Term im Programm jedes Stoffs" — darum sind es 4 Plätze, und darum bleiben 10 von 14 Laternen Punkte.
ENTSCHEIDUNG: das Quellen-Licht verlässt den Stoff und wird EIN Licht-Pass auf dem Schirm (Kandidat (c) des Samens), 16 Plätze, derselbe
Schreiber `_leuchtTakt`, Kosten je Pixel × Quellen — an den Schirm gebunden, nie an die Zahl der Laternen der Welt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
- Stufen (alle in EINER Welle): (1) `_lichtPoolTerm` fällt aus `_leuchtStoff` (`stoff-material.js:2064`), die Glut (`:2059–2063`) bleibt im
  Stoff. (2) Der Szenen-Pass schreibt zwei Ziele mehr (Normale+Metall, Albedo+Rauheit, rgba8) neben `output`/`glanz`
  (`bild-kosten.js:2097`), mit `MRTNode.setBlendMode(ziel, MaterialBlending)` (Loch am Glas zu, BEFUND §3.3). (3) EIN Licht-Programm
  zwischen Szenen-Pass und TRAA rechnet `_lichtPlatz`/`_punktLichtBrdf` aus G-Puffer + Tiefe, Uniform-Reihe statt 4 Ketten, addiert vor der
  Tonkurve; zeichnet NUR, wenn ein Platz Stärke > 0 trägt (mittags kein Pass: sonst +105 ms swiftshader, BEFUND §4.2). (4) Der Wurf-Faktor
  (`bild-schatten.js:443`, `W.platz`) zieht in den Pass. (5) Der Himmels-Ersatz des Augen-Lichts braucht `aHimmel` als Kanal (BEFUND §1.11) —
  in den vierten Kanal von Normale/Metall. (6) `LICHT_POOL.plaetze` 4 → 16 (`stoff-material.js:3754`); `umkreisM` 48 bleibt (Schirm-Grenze).
- Was stirbt: die Schleife in 20 Programmen, `_jePlatz` für das Licht (bleibt für den Dach-Pool, `stoff-material.js:2236`),
  `userData.lichtPool = true` (:2067) als Stoff-Marke.
- Leser-Liste (Stamm): `stoff-material.js:687–694` (Uniforms), :2037–2069, :2414–2500; `dirigent-kern.js:1601–1704` (Schreiber),
  :1744–1760 (Wahl); `bild-schatten.js:399–529` (Wurf); `bild-kosten.js:2097` (MRT); `bild-himmel.js:2555,2641` (setzen `_leuchtPool.t`);
  `speicher-welten.js:3573`. Linsen (Anker mitziehen, kein Soll): `scripts/diag-hoehlen-sicht.cjs:1436–1474` (prüft `.Loop(atmo.lichtLage
  .length` IM Stoff-Term), `scripts/diag-pruefbuehne.cjs:175,245,400–403,1308,1331,1710` (`userData.lichtPool` je Stoff),
  `scripts/diag-settlement.cjs:500–504,3024–3029` (poolSoll = min(Quellen, plaetze) — steigt mit 16 von selbst),
  `scripts/lib/shader-kosten.cjs:464`, `scripts/lib/licht-linsen.cjs:897`, `scripts/lib/ausgabe-aufnahme.cjs:370`; PM `stationen/g3.js:1559`.
- Nicht-Leser (reißen, benannt): Glas/Rauch/Vorschau-Geister (durchsichtig, `studio-stoff.js:242`, `siedlung-bauten.js:1181`) tragen kein
  Quellen-Licht mehr — Fenster- und Laternenglas glühen weiter über ihre Glut; Wasser trägt den Pool schon heute nicht (`bild-sicht.js:1557`);
  Haar rechnet Kajiya-Kay (`studio-stoff.js:27–43`) — liest es heute den Pool: nicht gelesen.
- Kosten-Zeile: Fragment-Text 2,16 → 2,00 MB (−7 %), Module 59 → 59 + 1 Licht-Programm (7,4 KB); +2 rgba8-Ziele = 9,3 MB VRAM bei 1080p
  (Band heute 99,6–111,2 MB); Bild-Zeit auf der Karte UNGEMESSEN — Abgabe nur, wenn GTX 1060 Dorf-Nacht und Wiese-Mittag p95 nicht über heute.
- Kriterien: `schatten.K5` Ist 0,22:1 (Radeon ec281422) ↔ Soll ≥ 3:1, Station `g3.js:2145` (radeon; Wurf zieht in den Pass, der Täter des
  hellen Schattens wird am selben Pfosten benannt) · `licht.K5` „Wetter und Nacht ohne Bruch" 1/2, #2 ohne Station · gate:settlement
  DORF-LICHT (Pool-Quellen der Gasse ≥ min(sichtbar, plaetze)) · Pflicht E (Kosten-Zeile).
- Bildpaar: Dorf am Prüfplatz (Messort `dorf`, `spec/profiband/haushalt.json`), Uhr 0, Ego an fester Kamera längs der Gasse + Hügel + von oben;
  dazu Mittag byte-gleich als Gegenprobe.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-samen-lichtweg` d8887125 (nicht in main): nur `samen/lichtweg/` (Befund, `platz.js` 508 Zeilen mit dem Pass als Spike, `mess-welt.cjs`).
  Fehlt: der Schnitt im Stamm (Stufen 1–6), die Linsen-Anker, die Karten-Messung GTX 1060/Radeon (heute ↔ Pool raus ↔ pool16 ↔ pass, ABAB).
- In main: `w28-nacht-licht` 250b98cb und `w28-nacht-bilanz` fc583c8d (Mond trägt die Nacht, Nacht-Knoten der Kamera) — der Grund, auf dem die
  Laternen-Kreise stehen.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gesehen: ein Nachtbild der echten Welt am Dorf. Nicht gemessen: Füllrate und Bild-ms des Passes auf einer Karte; ob ein Treiber den
  leeren Platz heute schon kürzt (dann kosten 4 Plätze weniger als die WGSL-Lesart sagt).
- Widerspruch: schatten.K5 stand 12.11. 5,28:1 GRÜN, 13.11. 0,60:1, am ec281422 0,22:1 mit Lschatten > Llicht — der Täter (Wurf an falschem
  Platz, Karte nicht gezeichnet, oder Augen-Licht) ist unbenannt; der Schnitt muss ihn am selben Pfosten benennen, nicht übermalen.
- Nicht gelesen: ob Haus-Fernstufen jenseits `fensterFern` (Fern-Ring, Impostor) die Fenster-Glut tragen; ob das Haar den Pool liest.
- Fenster leuchten nichts an (kein staerke/reichweite im Datum) — bleibt so; Einträge für Fenster als Quelle wären Scope-Erweiterung.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 4 im Nachtbild (0/7 → 6/7 Laternen-Kreise am Auge), 0 am Mittag und für die Ankunft (−7 % Text) · Aufwand L · Risiko: zwei
MRT-Ziele mehr kosten Füllrate auf GTX 1060/Radeon, die niemand gemessen hat — reißt Pflicht E, fällt der Schnitt.
