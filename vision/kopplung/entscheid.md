# ENTSCHEID — das EINE Gesetz der Kopplung (Richter, main b7ed84194, nur gelesen)

Gelesen: CLAUDE.md (GOLDENE DEFINITION, BETRIEBSGESETZ), der Brief der Entwerfer, `vision/kopplung/tafel.md` ganz, beide
Entwürfe ganz (`entwurf-erhaltung.md`, `entwurf-spiel.md`), das Muster `origin/koordination:vision/leben/entscheid.md`.
An der Quelle nachgeprüft (Code auf d29c40572; `git diff --stat b7ed84194 HEAD -- stamm phyto-core.js gelaende-core.js
voxel-worker.js welt-licht.js scripts spec` ist leer):
- **Kerne:** phyto-core.js:4287–4366, 4423–4454, 2960–2990, 7142–7148; gelaende-core.js:1282–1352, 1573–1600, 5698–5701,
  5850, 7879–7896.
- **Wetter, Uhr, Nässe:** stamm/bild-himmel.js:891–970, 1075–1084, 1375–1386, 2631–2660, 2836–2862, 2874–2882, 3054–3087;
  stamm/daten.js:140–172, 628–640, 2326–2329; stamm/dirigent-kern.js:298–312, 1798–1812; stamm/feld-leben.js:2482–2510,
  2605–2616; stamm/siedlung-satz.js:786–799, 1370–1373; stamm/wasser-hydro.js:127–131, 210–257; stamm/speicher-laden.js:543,
  2683–2688.
- **Brand:** stamm/feld-brand.js:214–285, 302, 437, 446–511, 744–747, 894–976; stamm/kampf.js:2435–2450;
  stamm/siedlung-wege.js:576–640.
- **Wind und Bett:** stamm/stoff-material.js:214–252, 2119–2136, 3105–3115, 3788–3803; stamm/dirigent-takt.js:1728–1742,
  2462–2472; voxel-worker.js:1413–1468, 4285–4340; stamm/vegetation-wiese.js:162–172, 778–784, 2770–2830, 3037–3064.
- **Leser der Uhr und des Regens:** stamm/siedlung-bewohner.js:1564, 1991, 2157, 2223, 2420–2423;
  stamm/kreatur-leben.js:2062–2064; stamm/kreatur-fauna.js:42, 69, 624; stamm/koerper-fahrt.js:1807–1811, 2292–2296, 2396–2399;
  stamm/klang.js:490–493; stamm/feld-dsl.js:129–160, 943–972.
- **Station:** k:g1.js (Kopie `…/scratchpad/entscheid/g1.js` von origin/koordination): :160–165, :1394–1397, :1424–1431, :1596,
  :1657–1660.
- **Greps:** `naesse` über scripts/ und spec/, `_bodenFarbeAt` über scripts/, `gruenSchwelle`, `forestKronenDeckung`,
  `_wetterAmOrt(`, `dayLengthMinutes`, `seasonPhase|seasonYearSeconds`, `NON_BROADCASTABLE`.

Jede Zahl unten trägt ihren Befehl. Die Skripte liegen in
`E = /tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/entscheid/`. Jeder Lauf dauert unter
2 s und lädt nur `phyto-core.js`.

**Nicht gelaufen:**
- der Stamm;
- jede Zahl am Kopf;
- der Preis des Betts je Zelle;
- die Front-Kosten selbst (3,7 µs ist ein Zitat);
- die Fenster-Probe des Films;
- die EINE Sonnenbahn im Integrator (gerechnet ist mit Breite 50° des Entwurfs Erhaltung).

---------------------------------------------------------------------------------------------------------------------------
## DIE ENTSCHEIDUNG

Was Feuer, Wasser und ihre Zeugen lesen, ist EINE Funktion von Saat, Ort, Welt-Uhr und Taten. Dazu gehören Regen P, Wind θ und
U₁₀, Luft T und RH, die Brennstoff-Last w, die Brennstoff-Feuchte M und der Film S der Oberfläche. Alles rechnet aus EINEM
Antrieb im Kern, `ortWetter`.

Getickt wird nur die Brand-Front auf ihren 16-m-Zellen. Gespeichert wird nur das Delta: die Taten `brand` und `wetter`.

**Die Wasser-Bilanz stammt aus dem Entwurf Erhaltung.**
- Interzeption c·P·(1 − M/M_sat);
- freies Wasser −Ep nach FAO-56;
- gebundenes Wasser (EMC − M)/τ;
- P_ref 0,834 mm/h folgt aus der Masse.

**Aus dem Entwurf Spiel stammen:**
- das stetige Tor der Luftmasse;
- der Faktor 0,485 des Mäanders;
- der Film-Streifen im Bild;
- die Tat `wetter` aus dem Wort;
- die Station als Richter;
- die Regel „Physik liest den Ort, Erlebnis liest das Wort".

**Neu in diesem Entscheid:**
- **Epochen-Anker:** Er macht M zu einer echten Funktion. Beide Entwürfe ließen ein fortschreitendes Memo laufen, also einen
  verdeckten Sack.
- **Rechenpunkt = die Brand-Zelle selbst:** Der 64-m-Block mit Versatz kippt 2 von 120 Urteilen.
- **Laub ohne Boden-Glied.**
- **Jahr = 365 Prozess-Tage:** Das Jahr des Kerns, gelaende-core.js:1319.

**Was fällt, ganz und in EINEM Zug:**
- die EINE Welt-Nässe samt allen Lesern;
- die Last aus Rauschen;
- das Bett aus gebauten Karten;
- der Wind aus dem Wort;
- die Temperatur an der Sicht-Uhr;
- das 40-min-Jahr;
- der Regen von 10 mm/h.

**Was der Spieler sieht:** Eine trockene Wiese brennt im Sommer in 27 % der Zeit statt in 0–0,3 %. Die Front läuft als
Ellipse mit dem Wind. Die Regenkante löscht sie dort, wo sie fällt, und 2 km weiter brennt es weiter.

---------------------------------------------------------------------------------------------------------------------------
## (1) DAS GESETZ

### 1.1 In einem Satz
> Jede Größe der Kopplung ist `f(Saat, Ort, Welt-Uhr, Taten)` in SI. Ihr einziger Antrieb ist `ortWetter` (Kern). Ihre Uhr
> ist die Prozess-Uhr τ = 24 · spielZeit (1 Prozess-Tag = `PEGEL_TAG_S` 3 600 s Welt, 1 Jahr = 365 Prozess-Tage); die Mechanik
> (Front-Tempo, U₁₀, Zug 11 m/s, Flamme, Leib) läuft 1:1 auf der Welt-Uhr. Getickt wird nur die Front; gelesen wird die
> Funktion; das Memo ist ein Cache, der bitgleich zur Neurechnung ist.

### 1.2 Uhr

**Welt-Uhr:** `spielZeit` [s] (dirigent-takt.js:48). Sie ist die einzige laufende Uhr der Physik.

**Prozess-Uhr:** τ = 24 · spielZeit. Die 24 folgen aus 86 400 / `PEGEL_TAG_S`, und `PEGEL_TAG_S` = `DAY_LENGTH_DEFAULT_MINUTES`
· 60 (daten.js:159–166).

**Tag-Phase:** `frac(_weltTag())`, mit `_weltTag()` = tagNull + spielZeit / 3600 (feld-leben.js:2605–2607). Eine neue Welt
beginnt bei tagNull 0,5, also am Mittag (feld-leben.js:2612–2616).

**Saison:** `frac(wm.saisonNull + (_weltTag() − wm.tagNull) / TEMPERATUR.jahrTage)`.
- Vorgabe saisonNull 0,375 (dirigent-kern.js:305); jahrTage 365 (gelaende-core.js:1319).
- `set_season` schreibt saisonNull als Weltfakt. Der Op ist broadcastbar, feld-dsl.js:958.
- Mit `autoSeason` false steht die Saison auf saisonNull.

**Sicht-Uhr:** `timeOfDay` (bild-himmel.js:2648) und der Regler `dayLengthMinutes` sind reines BILD: Himmel, Licht und
Sonnenstand im Bild. Keine Größe der Kopplung liest sie. Das ist der Satz, den der Code schon über sich sagt (bild-himmel.js:2746–2747, „die Uhr des Spielers ist SICHT (w28-lava-nachlauf): kein Prozess liest sie“).
In der Vorgabe (60 min) laufen Sicht-Tag und Prozess-Tag gleich schnell und beginnen beide am Mittag.

### 1.3 Raster

**Physik:**
- Rechenpunkt ist die 16-m-Zelle `LIFE_FIELD.cell` (feld-leben.js:3078): ihre Mitte, auf der Höhe der Oberfläche.
- Dieselbe Zelle trägt die Brand-Front, M, das `ortWetter`-Memo und die Last.
- Bett-Maske 2 m (`bettGitter` 8) und Glut-Block 64 m (`blockZellen` 4) bleiben.

**Bild:** Der Film-Streifen läuft längs der Front-Koordinate s̃ in 16-m-Texeln über den Chunk-Ring, auf der Höhe des Auges.

Dabei gilt: s̃ = x·dx + z·dz + biegeM·sin(2πq/querM + b). Das ist s ohne den Term −zug·t (phyto-core.js:4428–4431). Ein Ort
hat für alle Zeit EIN s̃.

**Zeit:** M und der Film schreiten auf dem globalen Raster 5 s Welt. Die Front schreitet mit `schrittS` 1 s (feld-brand.js:894).

### 1.4 Signaturen — Kern (rein, additiv)
```js
// phyto-core.js — wetterAt, windSaat, windGrund, forestKronenDeckung byte-gleich
WETTER_ORT = { kastenS: 45, rasterS: 5 }        // der Kasten des Übergangs (heute daten.js:143, dort künftig gelesen)
REGEN = { P_ref_mmh: 0.834,                      // FOLGT: (spende/Beiwert) / 24 / ⟨rain·Tor⟩ — Linse kopplung.regen.masse
          torAb: 0.4, torVoll: 0.6 }             // gewählt: Tor = smoothstep(0,4; 0,6; feuchte) der Luftmasse
ortWetter(saat, x_m, z_m, t_s, ort, taten) → {
  zeile, front, feuchte,                         // wetterAt(saat, x, z, t, ort) unverändert
  mix,                                           // {fog, sun, grey, wind, rain}: Mittel der WX_GESETZ-Zeilen an t_k = 5⌊t/5⌋ − 5j, j = 0…8
  tor_1,                                         // smoothstep(0,4; 0,6; feuchte)
  U10_ms,                                        // mix.wind · WIND_FELD.sturmMS (24)
  P_mmh }                                        // mix.rain · tor · P_ref; im Kreis einer Tat `wetter` (r, t0, dauer): rain(zeile der Tat) · P_ref
windRichtung(saat, t_s)                          // θ = θ0 + 0,485·(0,5·sin(0,009t + p1) + 0,22·sin(0,0257t + p2)); |θ − θ0| ≤ 20,0°
kronenDeckungAm(ctx, x_m, z_m, y_m, fussM_m) → deckung_1
                                                 // die EINE Montage forestBestand → forestNische → forestKronenDeckung,
                                                 // heute nur im Faden (voxel-worker.js:4317–4333); ctx = {fbm, baseH, wuchs, K, stand, schnee, ort}

// gelaende-core.js — temperaturAus/temperaturFeld byte-gleich
emc(rh_1, T_C) → M_kgkg                          // Simard 1968 (NFDRS)
et0(T_C, U10_ms, ea_kPa, sun_1, sinH_1) → Ep_mmh // FAO-56 stündlich (Allen et al. 1998, Gl. 53), u2 = 0,748·U10
luftFeuchte(feuchte_1, T_C, Tmittel_C) → { rh_1, ea_kPa }
                                                 // ea = RH̄·e_s(T_Tagesmittel), RH̄ = 0,3 + 0,7·min(1, feuchte/0,72); im Regen rh = 1
feuchteSchritt(M_kgkg, bett, a, dtW_s) → M_kgkg  // bett = {c, w, mx}; a = {P_mmh, Ep_mmh, rh_1, T_C}; dt_Prozess = 24·dtW
                                                 //   P > 0:    M_sat − (M_sat − M)·exp(−c·P·dt/(w·M_sat))      (Interzeption)
                                                 //   M > FSP:  max(FSP, M − Ep·dt/w)                          (freies Wasser)
                                                 //   sonst:    EMC + (M − EMC)·exp(−dt/τ), τ 3 600 s Prozess (gebunden)
filmSchritt(S_mm, a, dtW_s) → S_mm               // dS = (P − Ep)·dt, 0 ≤ S ≤ S_max 1 mm
PEGEL.regen = 0.0060                             // FOLGT: 0,3 · 0,834 mm/h · 24 h (heute 0,072, gelaende-core.js:1600)
```
Bett-Konstanten: c = 1 − exp(−σ·w/(π·ρp)). Gras: σ 11 483, w 0,166, ρp 350 → c 0,823, mx 0,12. Laub: σ 8 202, w 0,654,
ρp 300 → c 0,997, mx 0,25 (die Brenn-Zeilen, bau-vorlagen.js:1646–1649). M_sat 2,5, FSP 0,35 (`BRAND.feuchte`,
feld-brand.js:975).

### 1.5 Signaturen — Stamm (EIN Wrapper je Größe; jeder wirft, keiner ersetzt)
```js
_wetterAm(x_m, z_m, t_s = spielZeit)             // bild-himmel.js: ortWetter mit Saat, ort, worldMeta.taten; Memo je 16-m-Zelle × 5 s
_wetterAmOrt(x_m, z_m, t_s)                      // bild-himmel.js:2843, bleibt das WORT (Erlebnis): Zeile regen mit tor < ½ spricht das Wort von bewoelkt
_temperaturAt(x_m, z_m, y_m, traegTage)          // bild-himmel.js: temperaturAus(temperaturFeld(L, y, traeg), _saison(), frac(_weltTag()),
                                                 //   {sun: mix.sun, rain: mix.rain·tor}) — nie timeOfDay, nie das Wort
_feuchteAm(x_m, z_m, y_m, t_s) → { gras, laub, film_mm }
                                                 // bild-himmel.js: je Spalte das Fenster ab dem Epochen-Anker (1.6), Start EMC,
                                                 //   Raster 5 s; Antrieb je Schritt: _wetterAm, _temperaturAt, luftFeuchte, et0 mit
                                                 //   der Sonnenhöhe der EINEN Sonnenbahn (__weltLicht.sonnenRichtung) zur Tag-Phase
_filmStreifen                                    // bild-himmel.js → stoff-material.js: film/1 mm je 16-m-Texel über s̃ im Chunk-Ring
_windAt(x_m, z_m, t_s)                           // stoff-material.js:233: Stärke = _wetterAm(x, z).mix.wind × Wob × Form × Böe; Richtung windRichtung
lastAm(cx, cz) → { bett, w_kgm2 je Bett-Punkt }  // feld-brand.js: Gras = brenn.gras.last · p(Wiese) · gruen; Laub = brenn.laub.last · kronenDeckungAm
```

### 1.6 Die Funktion M — der Epochen-Anker (der Streitpunkt „Fenster gegen Zeitkonstante")
- **Anker:** M(t) wird integriert ab e(t) = φ + H·⌊(t − φ)/H⌋ − H, auf dem 5-s-Raster. Der Start ist M(e) = EMC(e).
- **Fensterlänge:** Sie liegt zwischen H und 2H.
- **Phase:** φ = H · frac(hash(Saat, cx, cz)), auf 5 s gerundet. Damit wechseln die Epochen der Zellen nicht im selben Bild.
- **Memo:** Innerhalb einer Epoche schreitet das Memo Schritt für Schritt vor. Das ist BITGLEICH zur Neurechnung, denn es sind
  dieselben Schritte ab demselben Anker.
- **Folgen:** Zwei Mitspieler, ein Reload und ein Zeitsprung lesen dieselben Bits. Ein Sprung von 10 Jahren kostet ein frisches
  Fenster je gelesener Zelle, keine 10 Jahre Takte.
- **Was die Entwürfe hatten:**
  - Erhaltung: Das Memo schreitet fort, „solange ein Leser den Block fragt".
  - Spiel: „aktive Zellen ticken denselben Schritt weiter".
  - Beide hängen damit am Zeitpunkt des ersten Lesers. Das ist ein Zustand mit Fehler ≤ ε, also ein Sack. Er fällt.
- **H folgt aus ε_M = 0,02 · mx:** Gras 2,4·10⁻³, Laub 5·10⁻³ kg/kg (`node $E/fenster-entscheid.cjs`, 3 Orte × 40 Proben
  gegen einen Langlauf von 40 Prozess-Tagen):

| H | Gras max abs(ΔM) | Laub max abs(ΔM) | Urteil M < mx gekippt (Gras · Laub, von 120) |
|---|---|---|---|
| 0,5 Prozess-Tag (1 800 s Welt) | 2,0·10⁻² | 4,8·10⁻¹ | 0 · 4 |
| **1 Prozess-Tag (3 600 s)** | **1,3·10⁻⁷** | 1,1·10⁻² | 0 · 0 |
| **2 Prozess-Tage (7 200 s)** | 0 | **2,0·10⁻⁵** | 0 · 0 |

  - Gras: H = 1 Prozess-Tag. Laub: H = 2 Prozess-Tage. Film: H = 1 Prozess-Tag, als unsicher markiert; seine Fenster-Probe
    misst Bahn 6.
  - Spiels H = 1 500 s trägt dieses Gesetz nicht. Gras hält freies Wasser über die Nacht, und schon 1 800 s geben einen Fehler
    von 2,0·10⁻².

- **Physik:** Interzeption (c aus dem Bett, Beer-Silhouette), M_sat 2,5 (Matthews 2006), FSP 0,35, Ep nach FAO-56,
  EMC nach Simard 1968, τ 1 h (Fosberg & Deeming 1971).
- **Näherung:**
  - RH aus der Feuchte-Welle: RH_min 0,3 gewählt, Nebel = Sättigung (phyto-core.js `stufen.nebel` 0,72).
  - Ep des Feinbrennstoffs = Gras-Referenz ET₀; Rn grob. Beides unsicher.
  - Der Antrieb ist stückweise konstant auf 5 s.
  - Laub steht in der Luft wie Gras; ein Boden-Glied fehlt (Boden offen, (8)).

**Zur Wahl des Rechenpunkts:** Er bleibt die Zelle selbst, ohne Raster längs s̃ und ohne Höhenstufe. Gemessen wurde, wie stark M
im gebundenen Bereich über kurze Wege schwankt (`node $E/raster-trocken.cjs`, `node $E/hoehe-trocken.cjs`, 120 Proben):

| Abstand | Gras abs(ΔM) | Urteil gekippt |
|---|---|---|
| 8 m längs s̃ (halbe Zelle) | 6,4·10⁻³ | 0 |
| 45 m längs s̃ (Ecke des 64-m-Blocks) | 1,7·10⁻² | 2/120 |
| 4 m Höhe (0,44 K bei Kühlung 0,111 K/m, gelaende-core.js:5850) | 5,6·10⁻³ | 0 |
| 12,5 m Höhe | 1,1·10⁻² | 1/120 |

- Der Block des Entwurfs Erhaltung fällt deshalb.
- Die Höhe der Zelle gehört in den Rechenpunkt.

### 1.7 Ein Schreiber je Größe

| Größe | Einheit | Raster | Uhr | EINZIGER Schreiber | Leser (lesen am eigenen Ort) |
|---|---|---|---|---|---|
| Zeile, front, feuchte | — | Punkt | Welt | phyto-core `wetterAt` | `ortWetter` |
| mix, U₁₀, tor, P | m/s · mm/h | Punkt; Memo 16-m-Zelle × 5 s | Welt, Kasten 45 s | phyto-core `ortWetter` | `_wetterAm` → Brand, `_windAt`, `_temperaturAt`, `_feuchteAm`, Bewohner, Pegel-Stempel, Regen-Partikel, Wort am Auge |
| θ0 | rad | Saat | — | phyto-core `windGrund` | Front, Wolken-Zug (bild-himmel.js:1765–1769) |
| θ(t) | rad | Saat | Welt | phyto-core `windRichtung` | `_windAt` → Gras, Bäume, Rauch, Brand, Wasser, Shader am Auge |
| T | °C | Punkt (x, z, y) | Tag-Phase, Saison | gelaende-core `temperaturAus` | `_temperaturAt` ← Brand :315, Leben 2484/2509, Klang 492, Brennglas 2398, Lava 581 |
| M_gras, M_laub | kg/kg | 16-m-Zelle | Prozess, 5-s-Raster, Epoche H | gelaende-core `feuchteSchritt` über `_feuchteAm` | Brand je Zelle zu ihrer Ankunft, Fackel, Lava-Zündung, Brennglas |
| Film S | mm | Zelle (Physik) · Streifen 16 m über s̃ (Bild) | Prozess | gelaende-core `filmSchritt` | Shader (Albedo, Pfütze), Rad |
| Last w, Bett | kg/m² | Bett 2 m in der Zelle | Taten | feld-brand `lastAm` | Brand |
| Asche, Narbe | — | Tat | Welt | Tat `brand` (feld-brand.js:575) | Wiese (p), Decke |
| Regen der Spieler-Tat | — | Kreis r 400 m | Welt, 600 s | Tat `wetter` aus dem Op `weather` | `ortWetter` |
| Nässe-Dosis des Werks | Prozess-Tage | Welt | Prozess | ⟨rain·Tor⟩_ort · Tage seit Geburt | `_werkAlter` (siedlung-satz.js:788) |
| Pegel-Regen | mm/h | Hydro-Kachel 2 048 m, ihre Mitte | Pegel-Sekunde | `_wetterAm(Kachel-Mitte)` | `_regenStempel` (wasser-hydro.js:127) |

**Leser-Regel:** Physik liest den ORT, Erlebnis liest das WORT am Auge.
- **Erlebnis am Wort bleibt:** Gemüt, Journal, Musik, Ton des Himmels, Nexus, Katalog, `_weatherIsWet`; dazu Vogel-Lied,
  Schwarm und Bienen (kreatur-fauna.js:42, 69, 624).
- **Das Wort ist eine Lesung desselben Gesetzes:** `_wetterAmOrt` am Auge, mit Tor und Taten.

**Kein Ersatzwert:**
- `wetterAt` wirft bei nicht-endlichen Werten (phyto-core.js:4424).
- `ortWetter` wirft ohne Saat.
- `_feuchteAm` und `_temperaturAt` werfen ohne Ort oder Höhe.
- `lastAm` wirft, wenn Wiese oder Krone nicht antworten. Den stillen Fall auf `_terrainMaterialAt` gibt es nicht mehr.

### 1.8 Die Streitpunkte — entschieden

**Uhr.**
- **Prozess-Uhr ×24 für alles, was trocknet, nässt, altert und den Tagesgang trägt.** Beide Entwürfe sind sich einig.
  - Grund: Auf der Welt-Uhr (×1) dauert τ 1 h = 3 600 s Welt. Die trockenen Fenster der Welle sind kürzer (Median 235 s,
    Entwurf Erhaltung).
  - Mit ×1 bleibt Gras in 0,0–1,5 % der Zeit brennbar (Entwurf Erhaltung `feuchte-zusatz.cjs`), mit ×24 in 26,7–27,3 %.
- **Das Jahr ist 365 Prozess-Tage = 1 314 000 s Welt.** Es folgt aus `TEMPERATUR.jahrTage` (gelaende-core.js:1319). Der Kern
  rechnet die Trägheit der Jahres-Welle damit schon heute (:1335).
  - Das Jahr von 2 400 s ist kürzer als ein Prozess-Tag (UB4). Es fällt mit seinen drei Ersatz-Literalen (dirigent-kern.js:311,
    bild-himmel.js:933, :970, speicher-laden.js:543).
  - Sichtbare Folge: Eine Saison dauert 91 Welt-h. Der Saison-Wechsel alle 10 min endet; Herbst zeigt `set_season` oder ein
    Zeitsprung.
  - Die Brandsaison ist echt (`node $E/anteil-entscheid.cjs … 0.375 / 0.875`):

    | Saison | Gras brennbar | Laub brennbar |
    |---|---|---|
    | Sommer | 26,7–27,3 % | 29,5–30,2 % |
    | Winter | 7,5–8,7 % | 0,0 % |
- **Die Temperatur liest die Tag-Phase der Welt-Uhr und das Wetter AM ORT** (bild-himmel.js:2874–2882 → 1.5).
  - Mit ihr fallen alle Prozess-Leser von `timeOfDay`:
    - Bewohner-Stunde, siedlung-bewohner.js:1564, :1991, :2157;
    - Spielstunde aus dem Regler, :2420–2423 → `PEGEL_TAG_S`/24;
    - Tätigkeit der Tiere, kreatur-leben.js:2063;
    - Brennglas, koerper-fahrt.js:2294.
  - Spiels „der Regler schreibt `tagNull`" ist **abgelehnt**. Ein Regler, der die Prozess-Uhr verschiebt, lässt Werk-Alter, Narbe
    und Pegel springen. Das ist der Bruch w28-lava-nachlauf, den siedlung-satz.js:795 beim Namen nennt.

**Regen-Einheit und Entkopplung vom Wind.**
- **P_ref ist 0,834 mm/h je Regen-Einheit.** Es folgt aus der Masse: P̄ = spende 0,0009 m/Tag / Beiwert 0,3
  (gelaende-core.js:1600, :1579) = 3,0 mm je Prozess-Tag, und P_ref = P̄ / 24 / ⟨rain·Tor⟩ 0,1499 (`node $E/lauf.cjs … 0.375`).
- **Spiels 10 mm/h ist abgelehnt.** Es ergäbe 10 · 0,1499 · 24 · 365 = 13 132 mm/a; das unabhängige Klima-Band liegt bei
  600–1 200 mm/a. Das Gesetz gibt 1 095 mm/a.
- **Die Entkopplung läuft auf EINEM Weg: das Tor der Luftmasse in `ortWetter`.** Das Tor ist smoothstep(0,4; 0,6; feuchte),
  stetig (aus dem Entwurf Spiel) statt der Stufe ≥ 0,5 des Entwurfs Erhaltung.
  - Es ist punktsymmetrisch um 0,5. Darum bleibt ⟨rain·Tor⟩ gleich 0,1499 wie bei der Stufe, und P_ref ändert sich nicht.
  - Zeile, front und feuchte bleiben byte-gleich. `wetterAt` bleibt, wie es ist; jede Physik liest `ortWetter`.
- **Gemessen:** Regen fällt in 32,9 % der Zeit (P ≥ 0,1 mm/h in 29,0 %), heute in 58,4 %. Gras brennbar UND U₁₀ ≥ 5 m/s gilt in
  14,9–16,1 % der Zeit.

**Die Brennstoff-Feuchte M.**
- **Die Bilanz stammt aus dem Entwurf Erhaltung.** Sie erhält die Masse; der Bilanz-Fehler je Schritt ist 5,1·10⁻¹⁵ kg/m².
  Das c der Interzeption kommt aus denselben Bett-Konstanten, die das Feuer liest.
- **Spiels Van-Wagner-Zuschlag ist abgelehnt.** Er ist eine empirische Tagesregel, differentiell umgeschrieben, und hat kein
  eigenes Bett.
- **Spiels Taupunkt-Gesetz ist abgelehnt.** Es hat zwei gewählte Zahlen (15 K, SMAX); die RH-Abbildung des Entwurfs Erhaltung
  hat eine (RH_min).
- **M ist eine Funktion mit Epochen-Anker (1.6), kein Zustand.**

**Das Bett.**
- **„`_bodenFarbeAt` gegen `bodenSe`" ist keine Wahl:** `bodenSe` ist die Feuchte des Bodens, kein Brennstoff, und bleibt
  offen (8).
- **Gras-Bett:** Die Bedeckung ist das p des Wiesen-Wurfs (vegetation-wiese.js:162–172, `_wieseGrund` :778–784). Sie liest das
  Grün von `_bodenFarbeAt` (gelaende-boden.js:2536) über die EINE Wiesen-Wache `gruenSchwelle` (daten.js:635).
  - Die Haupt-Form und die Faden-Form der Farbe hält die bestehende Linse `diag-worker-dichte.cjs:300–320` bitgleich. Es
    entsteht also kein neuer Zwilling.
- **Laub-Bett:** die Kronen-Deckung als Erwartung, über die NEUE EINE Kern-Montage `kronenDeckungAm`. Faden und Haupt rufen
  sie gleich.
  - Spiels `auraAt().lebendig` ist abgelehnt; es ist der Zwilling Z3 der Wald-Dichte.
- **Last:** last · Bedeckung · (1 − Asche) über die Narbe. Die Tat sperrt nicht mehr; die Zelle wächst nach p zurück.
- **`_kontaktStoffAt` bleibt** Schritt-Klang und Kontakt (gelaende-kollision.js:1121–1134). Das Feuer ruft es nicht mehr.

**Der Wind.**
- **EINE Quelle:** `windGrund(saat)` gibt θ0 für Front und Wolken. `windRichtung` gibt θ(t) = θ0 + 0,485 · Mäander für jeden
  Beweger.
- **Abweichung:** höchstens 20,0°, Effektivwert 10,7°; heute 41,3° bzw. 22,1° (`node $E/maeander.cjs`).
- **Die Stärke** ist U₁₀ = mix.wind · 24 m/s, der 45-s-Kasten AM ORT. Das Wort am Spieler (stoff-material.js:239) fällt als Quelle.
- **Erhaltungs Ekman-Begründung ist abgelehnt.** Ekman ist eine feste Drehung mit der Höhe. Der Mäander schwingt in der Zeit
  ±41° um 0 und ist darum kein Ekman.
- **Der Faktor ist gewählt**, um das Soll ±20° der Sprosse zu treffen. Die Zirkel-Gefahr steht in (6).

**Die Ferne.**
- Sie ist eine Bild-Folge, kein Teil des Gesetzes.
- Das Gesetz hat keinen Rand: Bett, Last, M und Front gibt es überall als Funktion (B4 heilt). Die Front tickt, wo sie brennt;
  ihr Preis hängt am Saum.
- Jenseits der 32 gezeichneten Zellen bis 160 m (feld-brand.js:930, :937) malt die Brand-Bahn je glühendem 64-m-Block einen
  Glut-Saum über den Block-Index (`_brandGlutUm`, feld-brand.js:542) bis zum Fern-Ring. Rauchsäulen gehören zu K4/TS10 und
  bleiben offen.

### 1.9 Verworfen aus den Entwürfen (beim Namen)

**Aus dem Entwurf Spiel:**
- `regenTafel`: Präfix-Tafeln über s̃, die mit zug·t wachsen; ein Sack.
- `taupunktAus`.
- Van-Wagner-Zuschlag.
- H 1 500 s.
- P 10 mm/h.
- Streifen-Texel 4 m. Der 45-s-Kasten glättet P über 495 m; 4 m löst nichts auf, was das Gesetz trägt.
- „Regler schreibt tagNull".
- Qualm im Zwischenband: Bild, kein Gesetz.

**Aus dem Entwurf Erhaltung:**
- 64-m-Block-Memo mit Versatz.
- Boden-Säule mit β(θ) und `bodenSe`. Beides wird offen benannt (8).
- Ekman.
- θ0 aus `ort.wetter`: TS3, offen (8).
- Narben-Integral: SP7, offen.
- Licht aus I_B. Das Licht liest schon die Ellipse des Brands (dirigent-kern.js:1800–1809), das Glied kaskade#2 steht also.

**Aus beiden:** das fortschreitende Memo.

---------------------------------------------------------------------------------------------------------------------------
## (2) DIE HERLEITUNG — Zählung nach dem Gesetz

Die Regel der Tafel gilt (§1.0): Ein Raster- oder Takt-Literal ist GESETZT; jede Größe zählt einmal.

| | n | FOLGT | GESETZT | ohne Einheit |
|---|---|---|---|---|
| heute (Tafel §1.1) | 224 | 60 (26,8 %) | 164 | 84 |
| fallen (6) | −6 | 0 | −6 | −4 |
| G → F (4) | 0 | +4 | −4 | 0 |
| neu F (6) | +6 | +6 | 0 | 0 |
| neu G (6) | +6 | 0 | +6 | +1 |
| **nach dem Gesetz** | **230** | **70 (30,4 %)** | **160** | **81** |

**Es fallen (Register-Zeile, Urteil):**
- `naesse` G°;
- `regenAb` G°;
- `versickern` G°;
- `benetzenS` G;
- `verdunstS` G;
- `BRAND.licht` G°, tot (TS1).

**GESETZT → FOLGT:**

| heute | danach | Marke |
|---|---|---|
| `BRAND.feuchte.trocken` 0,06 (feld-brand.js:975) | EMC(RH, T), τ 1 Prozess-h | belegt: Simard 1968; Fosberg & Deeming 1971 |
| `PEGEL.regen` 0,072 (gelaende-core.js:1600) | 0,3 · P_ref · 24 h = 0,0060 m/Tag | FOLGT aus Spende, Beiwert, ⟨rain·Tor⟩ |
| `seasonYearSeconds` 2 400 (U22, dirigent-kern.js:311) | jahrTage 365 · `PEGEL_TAG_S` | FOLGT aus dem Kern (gelaende-core.js:1319) |
| Rauch-Steigen mit 300 K (feld-brand.js:746) | T am Ort + 273,15 K | FOLGT |

**Neu FOLGT:**
- **P (mm/h):** über P_ref aus der Masse.
- **τ:** 1 Prozess-h = 150 s Welt; belegt (1-h-Brennstoff).
- **c:** 0,823 / 0,997; belegt (Silhouette σw/(πρp)).
- **Ep:** belegt (FAO-56); die Strahlungs-Näherung ist unsicher.
- **H:** folgt aus ε_M und der Messung 1.6.
- **Tag-Phase:** frac(_weltTag()).

**Neu GESETZT:**
- Tor 0,4/0,6: gewählt; symmetrisch um die Mitte der Feuchte-Welle, damit das Mittel der Stufe bleibt.
- RH_min 0,3: gewählt.
- ε_M = 0,02·mx: gewählt.
- S_max 1 mm: gewählt; die Spanne 0,5–2 mm der Muldenspeicher ist belegt.
- Tat-Radius 400 m: gewählt.
- Tat-Dauer 600 s: gewählt.

**Keine neue Zählung:**
- Der Mäander behält seine zwei Amplituden-Zeilen, nur mit dem Wert × 0,485. Bleibt G.
- Der Kasten 45 s ist U17. Er bekommt nur einen Physik-Leser und wandert in den Kern.
- Die Streifen-Texel sind `LIFE_FIELD.cell` (G1).

**Vorher ↔ nachher (gleiche Saaten, Orte, 30 Prozess-Tage ab Tag 12):**

| Größe | heute | nach dem Gesetz | Quelle |
|---|---|---|---|
| Gras brennbar (M < mx), Sommer | 0,0–0,3 % | 26,7–27,3 % | Entwurf Erhaltung `feuchte.cjs`; `node $E/anteil-entscheid.cjs /home/user/AnazhRealm 0.375` |
| Laub brennbar, Sommer | 0,0–0,3 % | 29,5–30,2 % | dasselbe |
| Gras brennbar und U₁₀ ≥ 5 m/s | 0,0–0,1 % (Entwurf Spiel) | 14,9–16,1 % | dasselbe |
| Gras-Brennfenster | 0–3,6 min (Entwurf Spiel) | Median 810 s, p90 1 035 s, max 1 115 s Welt (n 276) | dasselbe |
| Niederschlag | 26 383 mm/a (Entwurf Erhaltung) | 2,99–3,04 mm/Tag (1 095 mm/a) | `node $E/lauf.cjs /home/user/AnazhRealm 0.375` |
| Pegel, schneller Abfluss | 24,1 × Spende | Bilanz-Abfluss 0,66–0,68 mm/Tag (Spende 0,9; der Rest ist Interzeptions-Verdunstung) | dasselbe |
| Löschen Gras / Laub, regen 0,50 mm/h | 6,1 s, alle Brände der Welt (Entwurf Erhaltung) | 3,8 s / 39,9 s Welt, am Ort | dasselbe |
| Löschen sturm 0,83 / bewölkt 0,10 mm/h | — / trocknet nie | 2,3 / 23,9 s · 18,8 / 199,4 s | dasselbe |
| Trocknen 2,5 → mx, klar, Mittag | 605 s (Entwurf Erhaltung) | Gras 355 s, Laub 394 s | dasselbe |
| Wind-Abweichung zu θ0 | 41,3° | 20,0° | `node $E/maeander.cjs /home/user/AnazhRealm` |

---------------------------------------------------------------------------------------------------------------------------
## (3) WAS FÄLLT — beim Namen, ganz, in derselben Landung

| Stelle | was stirbt / wird umgeschrieben | heilt |
|---|---|---|
| bild-himmel.js:3054–3087 `_naesseTakt` | `st.naesse` als EIN Skalar, Ziel `rain > regenAb ? 1 : 0` (:3078), Uniform (:3082), Integral `nassTage` (:3075–3076) → `_feuchteAm` + Film-Streifen | B3, K1, UB8, UB10, SP2, Z9 (Nässe) |
| stoff-material.js:3788–3803 `NAESSE` | `regenAb`, `benetzenS`, `verdunstS`, `versickern` | EB3, UB10 |
| stoff-material.js:2119–2136 ff. (bis 2250), stoff-karte.js:1292–1295 | Shader-Leser von `atmoUniforms.naesse` → Film-Streifen am Ort des Fragments | B3 (Bild) |
| bild-himmel.js:1075, :1084 | Regen-Ruhe am Schlüssel `naesse` → am P des Auges | B3 |
| koerper-fahrt.js:1811 | Griff am Rad aus `state.naesse` → Film des Streifens am Rad | B3 |
| siedlung-wege.js:626 | Lava-Schlüssel „Nässe in Zwanzigsteln" → 5-s-Raster von M | B3 |
| speicher-laden.js:2683–2688 | `naesse` im Stand (eine Funktion reist nicht) | SP2 |
| feld-brand.js:282–285 `_brandFeuchte(boden)` | `trocken + faser·boden + nass·state.naesse` → `_feuchteAm` der Zelle zu ihrer Ankunft | B3, K1, FS4, EB3 |
| feld-brand.js:216–217 | die Tat sperrt die Zelle → Last × Bedeckung (Narbe) | B5 |
| feld-brand.js:218–219, :268 | Bett mit Boden-Feuchte einmal gemerkt → Bett statisch bis zur Tat, M je Zeit | B8, SP6 |
| feld-brand.js:222, :302 | `leb = auraAt().lebendig` als Last → `lastAm` | B5, Z1 |
| feld-brand.js:244 | `_kontaktStoffAt` als Bett-Quelle (Grün-Kanal gebauter Chunks, Kronen-Streu im Fenster) → `lastAm` aus Funktionen | B4, FS1, FS2, K2 |
| feld-brand.js:446–448, :509–510 | die Nachbarin erbt `mx` und `boden` der Quelle → ihre eigene Zeile, ihr M zur Ankunft | B7 |
| feld-brand.js:437 | `iw` brutto → I = h · w · (1 − S_T) · R, S_T 0,0555 (Rothermel 1972) | EB4 |
| feld-brand.js:746 | Rauch-Auftrieb mit 300 K → T am Ort | Z26 |
| feld-brand.js:913 `BRAND.licht` | tot, fällt | TS1 |
| feld-brand.js:975 `feuchte.trocken` | → EMC | — |
| stoff-material.js:239 | Stärke `_weatherFieldFor(this.state.weather).wind` → `_wetterAm(x, z).mix.wind` | Z8, Z12 |
| phyto-core.js:4357 | Mäander ±41,3° → × 0,485 | Z11 |
| bild-himmel.js:2874–2882 `_temperaturAt(y, traegTage)` | `timeOfDay` und das Wort → (x, z, y, traeg) zur Tag-Phase, Wetter am Ort; Rufer feld-brand.js:315, feld-leben.js:2484, :2509, klang.js:492, koerper-fahrt.js:2398, siedlung-wege.js:581 | UB1, Z16 |
| dirigent-kern.js:311; bild-himmel.js:933, :970; speicher-laden.js:543 | Jahr 2 400 s samt Ersatz-Literalen → 365 Prozess-Tage | UB4 |
| gelaende-core.js:1577–1579 (10 mm/h), :1600 `regen` 0,072 | → P_ref 0,834, `regen` 0,0060 | EB2, Pegel 24,1× |
| wasser-hydro.js:247–257 `_regenMittel` an (0, 0) über Züge | → ⟨rain·Tor⟩ aus dem Kern | Z8 |
| wasser-hydro.js:127 ff. `_regenStempel`, :210–219 | Stempel aus dem Wort am Spieler → P an der Mitte der Hydro-Kachel | Z8 |
| siedlung-satz.js:797, :1370–1373 | `wm.nassTage` − `geburtNass` → ⟨rain·Tor⟩_ort · Tage seit Geburt (`geburtNass` stirbt) | UB8, SP2 |
| siedlung-bewohner.js:2223 | `_weatherFieldFor().rain` ohne Ort → `_wetterAm(Bewohner).P_mmh` | Z8, TL3 |
| siedlung-bewohner.js:1564, :1991, :2157; :2420–2423 | Stunde aus `timeOfDay`, Spielstunde aus dem Regler → Tag-Phase, `PEGEL_TAG_S`/24 | UB1 |
| kreatur-leben.js:2063 | `_lichtUhr` aus `timeOfDay` → Tag-Phase | UB1 |
| koerper-fahrt.js:2294 | Brennglas nur unter dem Wort „sunny" → sun von `mix` an der Linse, Sonnenhöhe zur Tag-Phase | Z15 |
| dirigent-takt.js:1728–1742 | der Wetter-Zug als Physik-Quelle, der Wunsch setzt das Welt-Wort → Wort nur am Auge; ein erfüllter Wunsch schreibt eine Tat `wetter` am Ort des Wünschenden | FS8 verliert jeden Physik-Leser |
| feld-dsl.js:943 ff. `_setWeather` | das EINE Wort der Welt → Tat `wetter` {x, z, r 400, t0, dauer 600, zeile} | terraform#1 (Ort) |
| kampf.js:2448, daten.js:2328 | EINE Absage für alle Gründe → Grund mit Zahl (kein Bett · nass M/mx · Asche · Wasser) | Z15-Klasse |
| voxel-worker.js:4317–4333 | Montage der Kronen-Deckung nur im Faden → `kronenDeckungAm` im Kern | Z3 (für das Bett) |
| daten.js:143 | 45 000 als Literal → liest `WETTER_ORT.kastenS` des Kerns | — |
| k:g1.js:1424–1425 | `anteil = f.leb / lebendig` ≡ 1 → `f.anteil` | A1, TL2 |
| k:g1.js:160–165, :1394–1397, :1596 | „sunny" und `_naesseTakt(1e6)`, eigene Uhr → t* aus dem Gesetz, `_gameLoopTick`, kein Wort | A4, UB11 |
| k:g1.js:1659 | Urteil auf Existenz (`zellen ≥ 1`) → Abstand gegen CSIRO, Örtlichkeit | A3 |
| scripts/diag-stand-takt.cjs:872, :1025–1028, :1374–1375, :1603–1604, :2843–2948; scripts/diag-fahr-leben.cjs:762–777, :1741–1744; scripts/diag-kreatur-leben.cjs:148–191; scripts/lib/fahr-proben.cjs:166, :441–454; scripts/lib/ausgabe-aufnahme.cjs:388–429 | Stubs, die `state.naesse` setzen oder `_naesseTakt` halten → die Proben wählen das Brennfenster aus der Funktion | Z28 |

**Absenz nach der Landung, je 0 Treffer:**
- `state.naesse`, `_naesseTakt`, `NAESSE` in stamm/ und scripts/;
- `_weatherFieldFor(this.state.weather)` in `_windAt` und `_temperaturAt`;
- `timeOfDay` in jedem Prozess-Leser;
- `lebendig` und `_kontaktStoffAt` in feld-brand.js;
- `seasonYearSeconds`.

---------------------------------------------------------------------------------------------------------------------------
## (4) DER PREIS — EINE Basis

**Basis:**
- µs je Bild bei 60 Hz (30 Hz genannt);
- Front = Saum-Zellen (brennend + wartend, 16 m);
- Schrittweite: M und Film 5 s Welt, Front 1 s Welt.

**Bausteine:**
- **gemessen** (`node $E/fenster-entscheid.cjs`, zwei Läufe):
  - Schritt (Antrieb + Schritt) 431–554 ns;
  - frisches Fenster 720 Schritte 278–324 µs, 1 440 Schritte 541–550 µs.
- **Zitat:** Front 3,7 µs je Zelle und Welt-s (feld-brand.js:458), am Kopf nicht gemessen.
- **Daraus:** Eine neue Gras-Zelle kostet 0,31–0,80 ms (Mittel 0,47–0,60 ms), eine neue Laub-Zelle 0,62–1,60 ms.

Rechnung: `node $E/preis-entscheid.cjs`.

| Szene | Front | neue Zellen (M) | Schreiten + Epochen | Streifen | Summe je Bild | Budget |
|---|---|---|---|---|---|---|
| Ruhe, stehend | 0 | 0 | 0 | 0,2–0,3 | **0,3 µs** | 250 µs |
| Ruhe, Fahrt 30 m/s längs der Achse | 0 | 0 | 0 | 14,7–19,0 | **15–19 µs** | 250 |
| 1 ha = 39 Zellen (Sprosse feuer#2) | 2,4 | 4,3–5,6 | 0,2 | 0,3 | **7–9 µs** | 250 |
| Szene A, 900 s nach der Zündung (U₁₀ 7,2, M 0,06: Saum 134, 1,9 neue Zellen/s; Entwurf Spiel) | 8,3 | 14,7–18,9 | 0,8–1,0 | 0,3 | **24–29 µs** | 250 |
| Szene A, Fahrt 30 m/s | 8,3 | 14,7–18,9 | 0,8–1,0 | 14,7–19,0 | **39–47 µs** | 250 |
| Saum 2 000 (Sprosse feuer#2), 60 Hz | 123 | 222–285 | 11–15 | 0,3 | **357–423 µs** | 250 → Rückstand |
| Saum 2 000, 30 Hz | 247 | 443–570 | 23–30 | 0,5 | **714–847 µs** | 250 → Rückstand |

- **Ruhe kostet ≈ 0.** Ein Feld ohne Leser wird nie integriert. Die Größe der Welt kommt in keiner Zeile vor; es zählen Saum,
  neue Zellen und die Breite des Rings.
- **Was trägt die Kosten:** Großbrände tragen die frischen Fenster der neuen Zellen (62–67 %). Das ist der Preis der Exaktheit am
  Rechenpunkt. Ein geteiltes Raster längs s̃ wäre billiger, kippt aber Urteile (1.6).
- **Kapazität bei 250 µs je Bild:**
  - Je Saum-Zelle 10,7–12,7 µs je Welt-s, mit Verweildauer 70 s (Saum 134 / 1,9 je s).
  - Bei 60 Hz trägt das Budget **1 180–1 400 Saum-Zellen**, bei 30 Hz 590–700.
- **Kappung ohne Verwerfen:**
  - Das EINE Budget ist `BRAND.budgetMs` 0,25 ms je Bild (feld-brand.js:914). `_brandArbeit` reiht die Arbeit:
    1. Front-Schritte der brennenden Zellen;
    2. Fenster der wartenden Zellen nach ihrer Ankunft `an`;
    3. neue Texel des Streifens nach Abstand zum Auge.
  - Jedes Fenster ist eine fortsetzbare Integration in Scheiben. Nichts wird verworfen.
  - Eine Zelle, deren M zur Ankunft fehlt, wartet; ihre Zündung verspätet sich.
  - Die Linse `kopplung.rueckstand` nennt die größte Verspätung in s Welt und die Texel ohne Wert im Ring. Soll: 0 in Ruhe, in
    Fahrt, in Szene A und auf 1 ha. Über der Kapazität steht der Rückstand als Zahl im Trace, nie still.
- **Ankunft und Teleport:** Der Streifen des Rings wird VOR dem ersten Bild gerechnet. Ring 4 hat 25 Texel und kostet
  12–15 ms; Ring 12 hat 68 Texel und kostet 32–41 ms. Das ist ein benannter Posten für PFLICHT-OFFEN B (+0,2 % von 16,6 s).
  Danach rechnet der Streifen einen Ring voraus.
- **Fackel:** Ein frisches Fenster von 0,3–0,8 ms in ≤ 4 Scheiben. Das Urteil steht nach ≤ 4 Bildern.
- **Nicht gemessen** (der Spike misst es):
  - das Bett je neuer Zelle: 64 Bett-Punkte × `_bodenFarbeAt` und die Wiese; heute ebenso unbekannt für `_kontaktStoffAt`;
  - die Front selbst (Zitat).

---------------------------------------------------------------------------------------------------------------------------
## (5) DIE BAHNEN — ausschließlicher Datei-Besitz

### 5.1 Reihenfolge
1. **Zuerst der Spike (7).** Er liefert vorher ↔ nachher. Fällt eine Falsifikation, beginnt keine Bahn.
2. **Bahn 1 KERN.** Sie friert die Signaturen aus 1.4 und 1.5 ein.
3. **Dann parallel:** 2 WASSER & UHR, 3 WORT & WESEN, 4 BRAND, 5 BETT.
4. **Dann:** 6 LINSE ∥ 7 RICHTER.
5. **Landung:** Alle Bahnen landen gemeinsam über EINE Integrations-Probe auf main. Auf main gibt es also keinen Zustand, in dem
   ein Leser der Nässe ohne Schreiber läuft, und keinen, in dem ein Schreiber ohne seine Leser läuft.

Jede Bahn belegt „außerhalb byte-gleich" mit `node scripts/werkbank.cjs abdruck --gegen b7ed84194`; genannt werden genau ihre
Dateien.

### 5.2 Datei → Bahn (38 Dateien, jede genau einmal)

| Bahn | Dateien |
|---|---|
| **1 KERN** | phyto-core.js · gelaende-core.js |
| **2 WASSER & UHR AM ORT** | stamm/bild-himmel.js · stamm/stoff-material.js · stamm/stoff-karte.js · stamm/koerper-fahrt.js · stamm/siedlung-satz.js · stamm/speicher-laden.js · stamm/wasser-hydro.js · stamm/dirigent-kern.js · stamm/klang.js · stamm/feld-leben.js |
| **3 WORT & WESEN** | stamm/dirigent-takt.js · stamm/feld-dsl.js · stamm/siedlung-bewohner.js · stamm/kreatur-leben.js |
| **4 BRAND** | stamm/feld-brand.js · stamm/kampf.js · stamm/daten.js · stamm/siedlung-wege.js |
| **5 BETT** | stamm/vegetation-wiese.js · voxel-worker.js |
| **6 LINSE** | scripts/lib/stand-linse.cjs · scripts/diag-stand-takt.cjs · scripts/diag-fahr-leben.cjs · scripts/diag-kreatur-leben.cjs · scripts/diag-wasser-leben.cjs · scripts/diag-kollision-bild.cjs · scripts/diag-werkstatt-weg.cjs · scripts/diag-ci-deckung.cjs · scripts/werkbank.cjs · scripts/lib/licht-linsen.cjs · scripts/lib/fahr-proben.cjs · scripts/lib/ausgabe-aufnahme.cjs · scripts/lib/wasser-linse.cjs · spec/ci/tor-klassen.json · spec/stamm/modul-karte.json |
| **7 RICHTER** | Zweig koordination: meisterkarte-quelle/punkte/stationen/g1.js |

**Unberührt** (beim Namen, kein stilles Weglassen):
- gelaende-kollision.js: `_kontaktStoffAt` bleibt Kontakt.
- gelaende-boden.js: `_bodenFarbeAt` wird nur gelesen; `bodenSe` ist offen.
- kreatur-fauna.js: Erlebnis am Wort.
- welt-licht.js: die Wolken Z14/Z10 sind offen.
- speicher-welten.js: SP1 ist offen.
- bau-vorlagen.js: Z20 ist offen.
- vegetation-baum.js: verkohlte Stämme sind offen.
- kreatur-furcht.js, koerper-seele.js: K4 ist offen.
- planet-core.js: TS3 ist offen.

**Aufgelöste Konflikte der Entwürfe:**
- **feld-brand.js:** Erhaltung C gegen Spiel 2. Es gehört zu Bahn 4. Spiels Grund, „Schreiber und Leser der Nässe in EINER
  Bahn", erfüllt die gemeinsame Landung.
- **gelaende-kollision.js:** Erhaltung E gegen Spiel 3. Keine Bahn.
- **vegetation-wiese.js:** Erhaltung E gegen Spiel 3. Bahn 5.
- **siedlung-wege.js:** Erhaltung D gegen Spiel 2. Bahn 4.
- **dirigent-kern.js:** Erhaltung C. Bahn 2; das Licht bleibt unverändert, nur das Jahr fällt.
- **feld-leben.js:** Erhaltung E. Bahn 2, wegen Uhr und Temperatur.
- **dirigent-takt.js, feld-dsl.js:** Spiel 2. Bahn 3, wegen Wort und Tat.
- **kampf.js, daten.js:** Spiel 2. Bahn 4.
- **welt-licht.js, speicher-welten.js, bau-vorlagen.js:** Spiel 2. Keine Bahn.
- **gelaende-boden.js:** Erhaltung E. Keine Bahn.
- **vegetation-baum.js:** Spiel 3. Keine Bahn.
- **kreatur-furcht.js, koerper-seele.js:** Spiel 4. Keine Bahn.
- **Station:** Erhaltung G, Spiel 0. Bahn 7.

**Rufe über Bahn-Grenzen gehen nur an Signaturen aus 1.4/1.5:**
- Bahn 4 ruft `_feuchteAm` und `_temperaturAt` (Bahn 2).
- Bahn 4 ruft `_wieseDeckungAt` und `_kronenDeckungAm` (Bahn 5).
- Bahn 2 reiht Streifen-Texel über `_brandArbeit` (Bahn 4).
- Bahn 3 liest `_wetterAm` (Bahn 2).

### 5.3 Je Bahn: Schnitt · Zielbild · Messname

**Bahn 1 KERN**
- **Schnitt:**
  - phyto-core: `WETTER_ORT`, `REGEN`, `ortWetter`, `kronenDeckungAm`; Mäander × 0,485 in `windRichtung`.
  - gelaende-core: `emc`, `et0`, `luftFeuchte`, `feuchteSchritt`, `filmSchritt`; `PEGEL.regen` 0,0060.
  - Byte-gleich bleiben: wetterAt, windSaat, windGrund, forestKronenDeckung, temperaturFeld, temperaturAus. Beweis: 300 000 Fälle
    samt Rand und NaN, wie K60.
- **Zielbild:**
  - Ort: der höchste Hügel ≤ 1 km um die Mess-Wiese (−280,4 | −1 045,6), Saat „anazh-realm-seed".
  - Kamera: Third, 30 m hoch, Blick windab θ0 (+x 0,607 / +z 0,795, θ0 37,4°; `node $E/grund.cjs`).
  - Zeile sturm, trocken (tor 0).
  - Zu sehen: Gras-Neigung, Rauch eines Feuers und Wolkenzug in einem Bild innerhalb von ±20°; heute bis 41,3°.
- **Messname:**
  - `kopplung.kern.bytegleich`: 0 ungleich.
  - `kopplung.wind.abweichung_grad`: ≤ 20,0.
  - `kopplung.regen.masse`: P_ref · 24 · ⟨rain·Tor⟩ = spende/Beiwert ± 1 %.

**Bahn 2 WASSER & UHR AM ORT**
- **Schnitt:**
  - `_wetterAm`; `_feuchteAm` mit Epochen-Anker; Film-Streifen → Shader (stoff-material, stoff-karte).
  - Regen-Partikel aus P am Auge.
  - `_temperaturAt(x, z, y, traeg)` zur Tag-Phase und `_saison()` aus dem Kern-Jahr.
  - `_naesseTakt`, `state.naesse` und `NAESSE` sterben.
  - Das Rad liest den Streifen; das Brennglas liest sun am Ort und die Sonnenhöhe zur Tag-Phase.
  - Werk-Alter aus dem Klima-Mittel.
  - Pegel-Stempel an der Kachel-Mitte; `_regenMittel` = ⟨rain·Tor⟩.
  - `_wetterAmOrt` spricht das Wort mit Tor und Taten.
- **Zielbild (a) Regenkante:**
  - Ort: Mess-Wiese. Kamera: Ego, 1,7 m, Blick gegen θ0, eine Zeile regen mit tor ≥ 0,9 naht.
  - Zu sehen: Die dunkle Kante des Bodens kommt mit 11 m/s auf die Kamera zu. Hinter dem Band hellt der Boden nach dem Trocknen
    des Films wieder auf.
  - Vorher ROT: heute dunkelt der ganze Boden zugleich.
- **Zielbild (b) Sicht-Regler auf Mitternacht:** Himmel und Licht werden Nacht. Fackel, Brennglas und Grillen-Temperatur bleiben
  unverändert, weil die Welt-Uhr Mittag trägt.
- **Zielbild (c) Wagen:** Der Wagen fährt 1 km der Front entgegen. Dort ist die Straße trocken, und der Griff am Rad ändert sich
  beim Übertritt.
- **Messname:**
  - `kopplung.film.kante`: die Kante im Bild läuft mit 11 m/s ± 10 %.
  - `kopplung.uhr.sicht_frei`: Regler 0 ↔ 0,5 gibt ΔT = 0 an jedem Prozess-Leser.
  - `kopplung.naesse.absenz`: 0 Treffer.
  - wetter-welt#1 bleibt grün: Bildpaar klar/Sturm an derselben Pose.

**Bahn 3 WORT & WESEN**
- **Schnitt:**
  - Der Wetter-Zug spricht nur das Wort am Auge. Ein erfüllter Wunsch wird eine Tat `wetter` am Ort des Wünschenden, zur Zeit
    des Zugs.
  - Der Op `weather` schreibt die Tat `wetter`; `set_time_of_day` bleibt Sicht.
  - Bewohner: P am eigenen Ort, Stunde zur Tag-Phase, Spielstunde = `PEGEL_TAG_S`/24.
  - Tiere: Tätigkeit zur Tag-Phase.
- **Zielbild:**
  - Ort: das Dorf neben der Mess-Wiese. Kamera: Third, 20 m hoch.
  - Die Kante eines Regenbands liegt über dem Dorf. Unter dem Band gehen die Bewohner hinein; jenseits bleiben sie draußen.
  - Der Op „weather rainy" am Dorfrand: Regen fällt im Kreis von 400 m, 1 km weiter ist es klar.
- **Messname:**
  - `kopplung.bewohner.regen_ort`: Anteil im Freien unter dem Band ≤ 30 % des klaren Werts, außerhalb ≥ 90 %.
  - `kopplung.tat.wetter_ort`: P im Kreis > 0, 1 km außerhalb = das Gesetz.

**Bahn 4 BRAND**
- **Schnitt:**
  - Last und Bett: `lastAm`; die Tat sperrt nicht.
  - Feuchte: M je Zelle zu ihrer Ankunft; die Nachbarin hat ihre eigene Zeile.
  - Energie: `iw` netto; Rauch mit T am Ort.
  - Fallende Konstanten: `BRAND.licht` und `feuchte.trocken`.
  - Fackel-Absage mit Grund und Zahl, z. B. „Gras feucht: 0,21 kg/kg über 0,12".
  - Lava-Schlüssel auf dem 5-s-Raster.
  - Fern-Glut je 64-m-Block über den Block-Index bis zum Fern-Ring.
  - daten.js:143 liest den Kern.
  - `_brandArbeit` ist die EINE Kappung mit Rückstand.
- **Zielbild:**
  - Ort: Mess-Wiese, im Brennfenster (Median 810 s). Kamera: Third, 12 m hinter dem Herd, 6 m hoch, Blick windab.
  - Die Fackel zündet. Die Front läuft als Ellipse windab.
  - Nach 300 s steht die Spitze 234–322 m vorn, 1,3–2,4 ha sind schwarz (Entwurf Spiel `szene72.cjs` bei U₁₀ 7,2, M 0,06–0,09).
  - Erreicht die Regenkante die Front, erlischt das Gras dort in ≈ 4 s. Die trockene Seite brennt im selben Bild weiter.
  - Vom Hügel aus 500 m sind die Glut-Säume jenseits 160 m zu sehen.
- **Messname:**
  - `brand.kopf_csiro`: R/R_CSIRO ∈ [0,5; 2] bei U₁₀ 6,9–10.
  - `brand.ort_probe`: A erlischt, B brennt.
  - `kopplung.rueckstand`: 0 in Szene A.

**Bahn 5 BETT**
- **Schnitt:**
  - `_wieseDeckungAt(x, z)`: das p des Wiesen-Wurfs als Funktion, dieselbe Rechnung wie vegetation-wiese.js:162–172 und
    :778–784, kein Zweitweg.
  - `_kronenDeckungAm(x, z)` über den Kern, mit dem Haupt-ctx aus `_waldStandSchluessel` (vegetation-wiese.js:3037) und seinen
    Nachbarn.
  - `fernFarbeTeile` (voxel-worker.js:4291) ruft `kronenDeckungAm`, byte-gleich.
- **Zielbild:**
  - Ort: 2 km vom Spawn, jenseits des gebauten Rings. Kamera: Third, 20 m hoch.
  - Die Fackel zündet auf grünem Boden wie am Spawn. Auf Kies sagt sie „kein Bett". Unter Wald brennt Laub.
- **Messname:**
  - `bett.ohne_karte`: Null-Renderer; die 1 926 von 2 401 Zellen „ohne Karte" (Entwurf Erhaltung) tragen alle ein Urteil aus der
    Funktion.
  - `bett.faden_gleich`: Kronen-Deckung Haupt ↔ Faden bitgleich an 81 Punkten.
  - `bett.laub_erwartung`: Erwartung ↔ gezählte Kronen je Zelle im Ring. Gemessen, kein Soll.

**Bahn 6 LINSE**
- **Familie:** die Brand-Linse (scripts/lib/stand-linse.cjs:396, :454).
- **Proben:**
  - Ort-Probe headless: Herd A im Band erlischt; Herd B 2 km windab brennt, bis das Band ihn nach 182 s erreicht.
  - Fenster-Identität: Memo ↔ Neurechnung bitgleich, auch nach einem Welt-Uhr-Sprung von 1 h; 0 ungleich.
  - Fenster-Probe des Films (H).
  - Masse: `kopplung.regen.masse`.
  - Absenz-Grep (3).
  - Die Stubs fallen (3).
- **Mutanten, je ROT am Täter:**
  - die Welt-Nässe zurück;
  - der Wind wieder aus dem Wort;
  - die Epoche ohne Anker;
  - `timeOfDay` in `_temperaturAt`.
- **Laufzeit:** ≤ 3 min.
- **Messname:** `kopplung.linse`.

**Bahn 7 RICHTER (k:g1.js)**
- **Schnitt:**
  - `f.anteil`;
  - Takt über `_gameLoopTick`; kein Wort wird gesetzt;
  - t* aus dem Gesetz an der Mess-Wiese (M < 0,09, P = 0, U₁₀ 6,9–10);
  - Sprung mit `_weltUhrNimm`;
  - Zündung über `_fackelZuenden` (kampf.js:2435).
- **Glieder:**
  1. Funke; bei M ≥ mx die Absage „nass" mit Zahl.
  2. Kopf nach 60 s ≥ ½ · R_CSIRO · 60 s und ≥ 2 Zellen; ≥ 200 warme Pixel.
  3. Ellipse nach 300 s: Achse ±20° zu θ.
  4. Örtlichkeit: Op „weather rainy" an A; A ohne Flamme binnen 60 s, B (3 km quer) wächst 300 s.
  5. Narbe ≥ 90 % der verbrannten Zellen, auch nach +1 Welt-h.
- **Geräte:** beide.
- **Zielbild:**
  - Kamera A: 20 m quer zum Wind, 12 m hoch, auf den Herd. Kamera B: 60 m seitlich, 25 m hoch.
  - Nach 60 s ein Ei, 47–64 m lang, mit ≥ 200 warmen Pixeln. Heute +35 Pixel (GTX).
- **Messname:** `g1.kopplung` mit den Gliedern 1–5.

---------------------------------------------------------------------------------------------------------------------------
## (6) DIE SPROSSEN (id#nr wörtlich aus Tafel §5)

**Können fallen:**

| Sprosse | Bahnen | was trägt | Soll: Zirkel oder unabhängig |
|---|---|---|---|
| kaskade#1 — „Bildpaar: Brand erlischt im Regen, hält im Trockenen, beide Geräte" | 2 + 4 + 7 | Regen am Ort, M je Zelle; „hält im Trockenen" ist ein echter Test (Herd B) | **unabhängig:** qualitativ und örtlich. Die Löschzeit des Modells ist kein Soll. |
| kaskade#2 — „Glieder, deren Bild sich ändert und beim Festhalten des Vorgängers stehen bleibt, ≥ 4" | 2 + 4 + 6 | P → Film (Albedo) → M → Brand → Licht (die Ellipse, dirigent-kern.js:1800–1809); Festhalte-Probe über die Tat `wetter` | **unabhängig:** strukturell |
| physik.feuer#1 — „zündet / zündet nicht" | 4 + 5 + 7 | Bett überall (B4), M am Ort, Absage mit Zahl | **halb:** „nass" heißt M ≥ mx; mx 0,12 ist Anderson 1982 FM1, dieselbe Quelle wie der Code-Wert. Die Eis-/Lava-Hälfte („Eis trägt ±5 cm, Lava erstarrt") misst dieses Gesetz nicht; die Sprosse fällt GANZ nur, wenn Bahn 7 die Eis-y-Probe und die erstarrte Lava mitmisst (Code steht: bau-vorlagen.js:1644, gelaende-core.js:1848). |
| physik.feuer#2 — „Front-Tempo im Rothermel-Band, Halt in 100 % der Proben, Bild-p95 ≤ 33 ms während 2 000 Zellen brennen, beide Geräte" | 2 + 4 + 5 + 7 | trocken-windige Lage, Halt an Fluss/Fels/nassem Gras, Regen löscht, Fern-Glut (B6 teilweise) | **„Rothermel-Band" ist ZIRKEL**, denn der Code ist Rothermel. Unabhängig ist CSIRO-Gras. „Halt 100 %" ist strukturell, p95 unabhängig. Bei 2 000 Saum-Zellen reißt das Budget (357–423 µs); der Rückstand ist benannt. Die p95 an beiden Geräten entscheidet Bahn 7. |
| stoerung#1 — „Bildpaar Zelle vor / nach dem Brand, beide Geräte" | 4 + 5 | Asche am Ort, Bett nicht mehr an der Ring-Maske | **unabhängig:** Existenz, W |
| wetter-welt#2 — „Gras, Bäume, Wolken, Rauch, Wasser zeigen dieselbe Richtung ±20°, Lee < frei < Düse" | 1 + 2 | Mäander 20,0°, Stärke am Ort, Form (stoff-material.js:233–252) | **±20° mit Zirkel-Gefahr:** 0,485 ist gewählt, um ±20° zu treffen. **Unabhängig:** Lee < frei < Düse, die Strömung am Relief. |
| wetter-welt#3 — „Luma porös nass/trocken 0,5–0,8; Pfützen in Senken r ≥ 0,5" | 2 | Film am Ort statt EIN Skalar; Pfützen in den Mulden (gelaende-boden.js:2509) | **Luma-Band U** (ohne Quelle, nicht aus dem Modell). **Unabhängig:** Pfützen ↔ Senke, das Relief. |

**Nicht — mit Grund:**

| Sprosse | Grund |
|---|---|
| ereignis#2 | Bewohner weichen der Front: K4, offen |
| ereignis#1 | unberührt; Glut und Lava laufen schon |
| ereignis#3–7 | — |
| gewalt#1 | Blitz K13. Der Blocker „Gras in 0,0–0,1 % brennbar" fällt aber. |
| gewalt#4 | Dürre → Brand braucht Boden θ (offen) |
| gewalt#2, #3, #5, #6 | — |
| stoerung#2 | Wuchs bei der Tat gefroren (SP7, offen). UB4 heilt. |
| stoerung#3–7 | — |
| zeitreise#2 | Der Brand reist nicht (SP1). |
| zeitreise#3 | UB2 Wasser-Automat, SP7; UB8 heilt nur für die Nässe |
| zeitreise#6 | UB1 heilt für die Temperatur; die Sprosse verlangt Äonen und Milliarden Taten |
| zeitreise#1, #4, #5, #7 | — |
| wetter-welt#4 | Die Hälfte der Herden fehlt (K10); die Bewohner-Hälfte trägt Bahn 3. |
| wetter-welt#5, #6 | — |
| terraform#1 | Die Tat legt Regen an einen Ort, aber die Luftmasse hat keine Bilanz (±10 %, „im Lee tiefer"). |
| terraform#2–6 | — |
| physik.feuer#3–6, #8 | Raum, Krone, Stadt, Phasen: K5, K7 |
| physik.feuer#7 | B4 und B5 heilen, die Brandsaison entsteht; SP1 und der FARSITE-/GWIS-Vergleich bleiben. |
| kaskade#3–7 | — |
| kohaerenz#1–7 | #2 braucht `bodenSe` (Z5, offen) |
| aufwaerts#1–8 | keine Größe dieses Gesetzes |
| erdsaat#1–6 | keine Größe dieses Gesetzes |

---------------------------------------------------------------------------------------------------------------------------
## (7) DER AUFTRAG AN DEN SPIKE (wörtlich weiterzugeben)

> Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.
>
> **Auftrag.** Du prüfst das Gesetz `vision/kopplung/entscheid.md`, bevor eine Bahn baut. Kein Commit. Kein Edit an Kernen,
> `vendor/` oder stamm/. Arbeitsordner `…/scratchpad/spike-kopplung/`. Jeder Lauf dauert ≤ 60 s.
>
> **Harness.** Du nimmst den headless Stamm der Brand-Linse (Null-Renderer, die Familie von `scripts/lib/stand-linse.cjs`). Je
> Fall läuft er zweimal unter gleicher Bedingung:
> - VORHER mit den Original-Modulen von main b7ed84194;
> - NACHHER mit den Kopien unten.
>
> Die Kopien tragen dieselben Export-Namen und andere Datei-Namen. Du lädst sie an Stelle der Originale. Das Original wird nie
> verändert.
>
> **Die Kopien.**
> - `spike-kopplung/phyto-core.kopplung.js` = phyto-core.js + `WETTER_ORT`, `REGEN`, `ortWetter`, `kronenDeckungAm`, Mäander × 0,485 (1.4).
> - `spike-kopplung/gelaende-core.kopplung.js` = gelaende-core.js + `emc`, `et0`, `luftFeuchte`, `feuchteSchritt`, `filmSchritt`; `PEGEL.regen` 0,0060.
> - `spike-kopplung/feld-brand.kopplung.js` = feld-brand.js mit:
>   - M je Zelle zu ihrer Ankunft aus `_feuchteAm`;
>   - `lastAm` (Gras: p der Wiese; Laub: `kronenDeckungAm`);
>   - keiner Sperre durch die Tat;
>   - keinem Erben von `mx`/`boden`;
>   - `iw` netto.
> - `spike-kopplung/wetter-am.kopplung.js` = Mixin mit `_wetterAm`, `_feuchteAm` (Epochen-Anker 1.6) und `_temperaturAt(x, z, y, traeg)` zur Tag-Phase.
> - `spike-kopplung/phyto-core.kopplung-fest.js` (Kontroll-Kopie): `ortWetter` gibt im Kreis von 1 km um die Mess-Wiese FESTE
>   Eingänge zurück: Zeile bewoelkt, tor 0, P 0, U₁₀ und feuchte je Zelle des Versuchs. Außerhalb gilt das Gesetz.
>
> Jede Zahl, die du bringst, trägt Befehl und Kopie.
>
> **Fall I — trockene Wiese mit Wind gegen ein belegtes Band (≥ 3 Windstärken × 2 Feuchten).**
> - **Eingaben:**
>   - Saat „anazh-realm-seed", Mess-Wiese (−280,4 | −1 045,6), Sommer (saisonNull 0,375), Tag-Phase 14 Uhr.
>   - Kontroll-Kopie `phyto-core.kopplung-fest.js` mit U₁₀ ∈ {2,4; 7,2; 24} m/s; das sind die Zeilen-Werte nebel, bewoelkt und sturm.
>   - feuchte so, dass das Gesetz M_Gras ∈ [0,055; 0,065] bzw. [0,085; 0,095] gibt, nach einem Einlauf ≥ 1 Prozess-Tag unter
>     festen Eingängen.
>   - Bett Gras: der Ort mit Wiesen-Bedeckung p ≥ 0,95 nächst der Mess-Wiese.
>   - Linien-Zündung: 10 Zellen = 160 m quer zu θ0. Die Breite des Kopfs bestimmt das Tempo (Cheney & Gould 1995).
> - **Messgröße:** R_Kopf = Weg des Kopfs längs θ zwischen 120 s und 300 s / 180 s [m/s]. Dazu: Punkt-Zündung mit L/B nach 300 s;
>   das ist Bericht, kein Urteil.
> - **Soll mit Herkunft (unabhängig):** CSIRO-Gras, natürliches Weideland, voll ausgehärtet (Cheney, Gould & Catchpole 1998).
>   - R = (1,4 + 0,838·(U − 5)^0,844) · exp(−0,108·MC) km/h für U ≥ 5 km/h und MC < 12 %. Rechne es aus der Quelle nach.
>   - Probe: U₁₀ 6 m/s, M 0,06 → 1,507 m/s.
>   - Gerechnet (`node $E/csiro-69.cjs`):
>
>     | | U₁₀ 2,4 | U₁₀ 7,2 | U₁₀ 24 m/s |
>     |---|---|---|---|
>     | M 0,06 | 0,566 | 1,789 | 5,193 m/s |
>     | M 0,09 | 0,409 | 1,294 | 3,756 m/s |
>
>   - Verhältnisse nach CSIRO: Wind 7,2/2,4 = 3,16; 24/7,2 = 2,90; Feuchte 0,06/0,09 = 1,383.
> - **Falsifikation der KOPPLUNG** (das Gesetz trägt nicht, wenn eine Zeile zutrifft):
>   - (a) R(7,2)/R(2,4) < 1,78 oder R(24)/R(7,2) < 1,70 bei einer der beiden Feuchten. Das ist die halbe Log-Spanne von CSIRO;
>     dann fließt der Wind nicht durch.
>   - (b) R(M_lo)/R(M_hi) < √(CSIRO-Verhältnis der verwirklichten M), also < 1,18 für 0,06/0,09, bei U₁₀ 7,2. Dann fließt die
>     Feuchte nicht durch.
>   - (c) Mutante Wort: `state.weather` auf „stormy" bzw. „sunny" gesetzt, ändert R um > 1 %. Dann kommt der Wind noch aus dem
>     Wort (Z8).
>   - (d) Mutante Nässe: ein gesetztes `state.naesse` = 1 ändert R oder M. Dann lebt die Welt-Nässe.
> - **Bericht, kein Urteil über die Kopplung:**
>   - R/R_CSIRO je Punkt. Bei U₁₀ 7,2 muss es in [0,5; 2] liegen; liegt es draußen, fällt das Gesetz des FEUERS (B1-Klasse), nicht
>     die Kopplung.
>   - Bei 2,4 m/s erwarten die Entwürfe × 0,26 („Tempo bei schwachem Wind", offen).
>   - Bei 24 m/s erwarten sie × 0,30–0,61 (Wind-Deckel 0,9·I_R, feld-brand.js:330, offen).
> - **Zirkel-Gefahr:** Ein Soll aus Rothermel („Rothermel-Band") beweist nichts. Die M-Werte stammen aus dem Gesetz; geurteilt wird
>   nur gegen CSIRO am selben (U₁₀, M).
> - **Vorher:** dieselben Zellen mit den Originalen. Erwartet: R hängt am Wort (c ROT), M = 0,06 + 0,29·boden + 2,5·Nässe.
>
> **Fall II — feuchte Wiese stirbt gegen mx.**
> - **Eingaben:**
>   - die Kopien des Gesetzes; außerhalb des Kreises die Kontroll-Kopie: bewoelkt, P 0, U₁₀ 7,2, feuchte so, dass M_Gras ≈ 0,06.
>   - eine Tat `wetter` {x, z: Mitte 550 m windab des Herds (der Rand liegt 150 m windab), r 400 m, t0, dauer 600 s, zeile regen},
>     direkt in `worldMeta.taten` geschrieben.
>   - Linien-Zündung von 10 Zellen bei t0 + 600 s.
>   - Fackel-Reihe: 4 Zündversuche an Zellen im Kreis, zu Zeiten, zu denen das Gesetz dort M = {0,90; 0,97; 1,03; 1,10} × mx gibt
>     (während der Kreis trocknet).
> - **Messgröße:**
>   - (1) Zahl der Zellen im Kreis, die zünden, während ihr M zur Ankunft ≥ mx ist;
>   - (2) Abstand der letzten verbrannten Zelle zum Kreisrand je Randzelle [m];
>   - (3) Eintritt in den Kreis vor oder nach t_mx. t_mx ist die Zeit, zu der das Gesetz im Kreis M < mx gibt (nach dem Entwurf
>     etwa t0 + 600 s + 355 s);
>   - (4) Fackel-Urteile mit Grund und Zahl.
> - **Soll mit Herkunft:**
>   - (1) = 0;
>   - (2) ≤ 16 m (eine Zelle) in ≥ 95 % der Randzellen;
>   - (3) kein Eintritt vor t_mx;
>   - (4) 4/4: zündet bei 0,90 und 0,97; Absage „nass: M … über mx …" bei 1,03 und 1,10.
>   - mx Gras 0,12 ist Anderson 1982 FM1 (bau-vorlagen.js:1646–1649).
> - **Falsifikation:**
>   - eine Zündung mit M(Ankunft) ≥ mx (> 0), denn dann liest die Zelle nicht IHR M zu IHRER Zeit (B7, B8);
>   - ein Halt > 32 m vor dem Rand in > 5 % der Randzellen (Überlöschen durch Erbe);
>   - Fackel ≤ 3/4.
> - **Zirkel-Gefahr:** mx ist eine Konstante des Modells. Der Fall beweist die KOPPLUNG je Zelle und Zeit, nicht die Physik der
>   Extinktion; t_mx kommt aus dem Gesetz und ist nur eine Ordnung, kein Soll.
> - **Bericht, kein Urteil:** Nach CSIRO fällt φ_M oberhalb von 12 % linear statt auf 0. Rechne nach der Quelle die Spanne, in der
>   Gras nach CSIRO noch läuft. Das betrifft das Gesetz des Feuers (offen), nicht die Kopplung.
> - **Vorher:** Mit den Originalen kennt der Kreis keine Nässe am Ort. Erwartet: Die Front läuft durch den nassen Kreis oder
>   stirbt überall, je nach Wort.
>
> **Fall III — Regenfront über dem Brand: Löschzeit, und der Brand außerhalb brennt weiter.**
> - **Eingaben:**
>   - die Kopien des Gesetzes, keine Kontroll-Kopie: die Welle selbst.
>   - Suche mit dem Gesetz in node ein t* und einen Ort ≤ 3 km um die Mess-Wiese, an dem:
>     - ein Band mit tor ≥ 0,9 (P ≥ 0,45 mm/h) den Herd A bei t_A erreicht;
>     - davor ≥ 300 s Brennfenster liegen (M_Gras < 0,09, P = 0).
>   - Herd A: Linien-Zündung bei t_A − 300 s.
>   - Herd B: 2 km windab von A längs θ0 (dasselbe q), gezündet zur selben Zeit.
>   - Dazu die Tat-Örtlichkeit:
>     - Herd C im Brennfenster, eine Tat `wetter` regen r 400 m über C;
>     - Herd D 1 km von C, außerhalb des Kreises.
> - **Messgröße:**
>   - Löschzeit A = t_ext(A) − t_A. Dabei ist t_A der erste Schritt mit P > 0 an der Kopf-Zelle und t_ext der erste Schritt ohne
>     brennende Zelle;
>   - Δt_ext = t_ext(B) − t_ext(A);
>   - die Fläche von B zwischen t_ext(A) und t_A + 150 s;
>   - Löschzeit C ab Tat-Beginn;
>   - die Fläche von D über 300 s.
> - **Soll mit Herkunft:**
>   - **Löschzeit:** A und C ∈ [1; 3] × Massen-Schranke (mx − M₀)·w / (c·P). Die Erhaltung des Wassers sagt: So viel Regen braucht
>     das Bett, um mx zu erreichen. Gerechnet (`node $E/csiro.cjs`) für Gras, M₀ 0,06: regen 0,50 mm/h → 3,6 s; sturm 0,834 → 2,2 s;
>     bewölkt 0,10 → 18,1 s Welt. Der Faktor 3 ist gewählt.
>   - **Δt_ext = 2 000 m / zugMS 11 m/s = 182 s ± 20 s.** Das ist die Kinematik der Front des Kerns (WIND_FELD, phyto-core.js:4320)
>     und unabhängig von der Feuchte-Physik.
>   - **B wächst** zwischen t_ext(A) und t_A + 150 s.
>   - **D wächst** 300 s.
> - **Falsifikation:**
>   - B erlischt binnen 60 s nach A, oder D mit C: dann lebt eine Welt-Nässe weiter;
>   - Δt_ext weicht um mehr als 20 s von 182 s ab: dann folgt das Löschen nicht dem Band;
>   - eine Löschzeit liegt außerhalb [1; 3] × Massen-Schranke: dann erhält die Bilanz das Wasser nicht.
> - **Zirkel-Gefahr:** Die Massen-Schranke nutzt dasselbe c (σ, w, ρp des Modells), sie ist also halb unabhängig. Die
>   Löschzeiten des Modells selbst (3,8 / 2,3 / 18,8 s) sind KEIN Soll. Unabhängig sind die Kinematik und die Örtlichkeit.
> - **Vorher:** Die Nässe gilt am Spieler. Erwartet: A und B erlöschen zugleich, D stirbt mit C.
>
> **Dazu der Preis, gleiche Bedingung vorher ↔ nachher:**
> - µs je Zelle und Welt-s der Front, gemessen; sie ersetzt das Zitat 3,7 µs von feld-brand.js:458;
> - µs je neue Zelle für das Bett (64 Punkte) und für `_feuchteAm`;
> - µs je Bild in Fall I bei U₁₀ 7,2 nach 300 s.
>
> Falsifikation des Preises: Szene A > 250 µs je Bild.
>
> **Rückgabe:** höchstens 10 Sätze. Je Fall die Zahl vorher ↔ nachher, welche Falsifikation griff (oder keine) und der Befund des
> Feuers (Bericht).

---------------------------------------------------------------------------------------------------------------------------
## (8) WAS OFFEN BLEIBT — je mit Grund und Messnamen

| Offen | Grund | Messname |
|---|---|---|
| K4: Wesen lesen den Brand (Furcht auf Rauch und Ankunft, Bewohner weichen, Leib-Schaden; TL1, TS10) | eigene Kopplung Brand → Wesen; Spiels Rauch-, Wärme- und Ankunfts-Funktionen stehen bereit, aber außerhalb dieses Gesetzes | ereignis#2 `bewohner.weichen_anteil`, `leib.dosis` |
| K5 und Z20: Feuer nimmt Bauten (Tag `brennbar` ohne Leser, bau-vorlagen.js:1769) | Werk-Brennzeile und Zündzeit t_ig(q) | physik.feuer#5 |
| verkohlte Stämme (vegetation-wiese.js:2196–2209: der Baum verschwindet in der Narbe) | Bild der Narbe, kein Glied der Kopplung | `narbe.staemme` |
| SP1: Der Brand reist nicht im Stand (feld-brand.js:204) | Die Front ist Zustand, keine Funktion; braucht ein Stand-Format | zeitreise#2 `brand.reload` |
| Boden θ (`bodenSe`, van Genuchten), K6 (Wuchs liest θ), SP7 (Wuchs bei der Tat gefroren), gewalt#4 (Dürre → Brand), Z5 (Hand-Spiegel von `_feuchteAt`, gelaende-boden.js:1538–1563 ↔ voxel-worker.js:2090–2128) | 10-Tage-Fenster (×10 Preis); die Bild-Folge der Grund-Feuchte auf die Wiese ist nicht gemessen (HOLZ-Profil) | `boden.theta`, stoerung#2 |
| Wolken Z14/Z10 (welt-licht.js:901–944; `cloudCover` aus dem Wort, bild-himmel.js:1763) | Bild des Himmels | wetter-welt#1 bleibt grün |
| Wind-Deckel 0,9·I_R (feld-brand.js:330) | unsicher (Andrews, Cruz & Rothermel 2013) | `brand.kopf_csiro` bei U₁₀ 24 |
| Tempo bei schwachem Wind (B1): Code/CSIRO 0,26 bei 2,4 m/s | Gesetz des Feuers | `brand.kopf_csiro` bei U₁₀ 2,4 |
| EB1: U₁₀ trägt die Einheit m/s, aber die Zeilen-Werte 1,44 … 24 sind gesetzt | die Zeilen des Wetters | `wetter.u10_band` |
| EB5: FM1-Norm-Bett × 0,17–0,45 CSIRO (Entwurf Spiel) | das Modell, nicht die Kopplung | `brand.fm1_csiro` |
| Regen-Häufigkeit 32,9 % der Zeit. Daher ist P_ref 0,834 mm/h Niesel. Der Vergleichswert 7–15 % der Stunden steht im Entwurf Erhaltung ohne Quelle (unsicher). | Befund gegen die Zeilen (`WIND_FELD.front.stufen`), nicht gegen die Bilanz | `regen.anteil_zeit` |
| Laub-Streu im Bild nur im Fenster der Wege-Karte (siedlung-wege.js:421–440; FS2 im Bild) | Bild; das Bett liest es nicht mehr | `bild.laub_streu_fern` |
| `gruenSchwelle` 0,04 (daten.js:635) | gewählt (Look); entscheidet jetzt auch das Gras-Bett | `bett.gruen_schwelle` |
| TS3: Planeten-Wind tot (planet-core.js:2336) | Reise-Welten behalten θ0 aus der Saat; EINE Quelle bleibt gewahrt | `wind.reise_theta0` |
| Gleichlauf der Welt-Uhr zwischen Mitspielern | nicht verifiziert (Entwurf Erhaltung) | `uhr.gleichlauf_p2p` |
| Film jenseits des Chunk-Rings (Fern-Boden ohne Film) | Bild | `bild.film_fern` |
| Streifen an der Augen-Höhe gegen die Höhe des Bodens im Ring | Bild-Näherung; 4 m Höhe sind 0,44 K | `bild.film_hoehe` |
| Fenster H des Films (1 Prozess-Tag, unsicher) | nicht gemessen | `kopplung.fenster.film` (Bahn 6) |
| Integrator mit der EINEN Sonnenbahn statt Breite 50° | gerechnet nur mit Breite 50° | Spike, `kopplung.anteil_brennbar` |
| Preis des Betts je neuer Zelle; Front-Kosten am Kopf | nicht gemessen; der Spike misst | `kopplung.preis.us_je_bild` |
| Saum über der Kapazität (1 180–1 400 bei 60 Hz, 590–700 bei 30 Hz); feuer#2 „2 000 Zellen" liegt darüber | benannter Rückstand, nie still | `kopplung.rueckstand` |
| terraform#1: Bilanz der Luftmasse (die Tat `wetter` schafft Regen ohne Herkunft) | kein Wasser-Haushalt der Luft | terraform#1 |
| Herden suchen Schutz (K10) | kein Unterstands-Gesetz der Herde | wetter-welt#4 (Tier-Hälfte) |

---------------------------------------------------------------------------------------------------------------------------
## Gerechnet (Befehle, `E` wie oben; alles node, je < 2 s)

**1. Bilanz unter dem entschiedenen Gesetz:** `node $E/lauf.cjs /home/user/AnazhRealm 0.375`. Das Skript ersetzt Stufe → Tor,
Jahr → 365·3 600 und Saison → S0. Ergebnisse:
- ⟨rain·Tor⟩ 0,1499; P̄ 3,00 mm/Tag (1 095 mm/a); P_ref 0,834 (Faktor 12,0 gegen 10).
- Pegel heute 24,1×.
- Bilanz-Fehler 5,1·10⁻¹⁵ kg/m².
- Abfluss 0,66–0,68 mm/Tag.
- Löschzeiten und Trocknen wie in (2).
- Regen P > 0 in 32,9 %, P ≥ 0,1 mm/h in 29,0 % der Zeit.

**2. Brennbare Anteile ohne Boden-Glied:** `node $E/anteil-entscheid.cjs /home/user/AnazhRealm 0.375` bzw. `0.875`.

| | Gras | Laub | Gras und U₁₀ ≥ 5 | Brennfenster |
|---|---|---|---|---|
| Sommer | 26,7–27,3 % | 29,5–30,2 % | 14,9–16,1 % | Median 810 s, p90 1 035 s, max 1 115 s (n 276) |
| Winter | 7,5–8,7 % | 0,0 % | 3,9–4,7 % | Median 520 s, p90 735 s, max 835 s (n 126) |

**3. Fenster und Preis:** `node $E/fenster-entscheid.cjs /home/user/AnazhRealm`. Die Tabelle steht in 1.6. Schritt 431–554 ns;
frisches Fenster 1 Tag 278–324 µs, 2 Tage 541–550 µs.

**4. Raster und Höhe:** `node $E/raster-trocken.cjs /home/user/AnazhRealm` und `node $E/hoehe-trocken.cjs /home/user/AnazhRealm`.
Gras im gebundenen Bereich:

| Abstand | max abs(ΔM) | Urteil gekippt |
|---|---|---|
| 2 m längs s̃ | 3,3·10⁻³ | 0/120 |
| 8 m längs s̃ | 6,4·10⁻³ | 0/120 |
| 45 m längs s̃ | 1,7·10⁻² | 2/120 |
| 1 m Höhe | 4,4·10⁻⁴ | 0/120 |
| 2 m Höhe | 3,3·10⁻³ | 0/120 |
| 4 m Höhe | 5,6·10⁻³ | 0/120 |
| 12,5 m Höhe | 1,1·10⁻² | 1/120 |

Ohne Bereichs-Filter (`raster-entscheid.cjs`, `hoehe-entscheid.cjs`) dominiert der nasse Bereich, und abs(ΔM) bis 1,3·10⁻¹ ist
eine echte Kante des Regens.

**5. Mäander:** `node $E/maeander.cjs /home/user/AnazhRealm` → max 41,3°, rms 22,1°; Faktor 0,485 → 20,0°, 10,7°.

**6. Grundrichtung:** `node $E/grund.cjs /home/user/AnazhRealm` → θ0 37,4° (+x 0,607, +z 0,795). An der Mess-Wiese bei t 0:
Zeile regen, feuchte 0,030, also tor 0 und eine trockene Front.

**7. CSIRO und Massen-Schranke:** `node $E/csiro.cjs` und `node $E/csiro-69.cjs`.
- Probe 1,507 m/s.
- Verhältnisse 3,16 / 2,90 / 1,540 (M 0,04/0,08) bzw. 1,383 (M 0,06/0,09).
- Halbe Log-Schwellen 1,78 / 1,70 / 1,241 bzw. 1,176.
- Massen-Schranke 3,6 / 2,2 / 18,1 s.

**8. Preis-Tabelle:** `node $E/preis-entscheid.cjs`, siehe (4).
