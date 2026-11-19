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
2 s und lädt nur `phyto-core.js`. Die Skripte des Nachtrags nach dem Spike liegen in
`N = /tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/nachtrag/` (je < 3 s; sie laden die
Kern-Kopien des Spikes über `vision/kopplung/spike/kopien.cjs` `bauKopien`, unverändert). Die Zahlen des Spikes tragen seinen
Befehl in `vision/kopplung/spike.md`.

**Vor dem Spike nicht gelaufen — danach:**
- der Stamm: gelaufen im Spike (headless, Null-Renderer, Kopien der Kerne);
- der Preis des Betts je Zelle: gemessen im Spike (Median 115 µs);
- die Front-Kosten selbst: gemessen im Spike (2,5–3,4 µs je Zelle und Welt-s, das Zitat 3,7 trifft);
- die EINE Sonnenbahn im Integrator: gelaufen im Spike an EINEM Ort (Gras brennbar 18,7 %), die Welt-Stichprobe fehlt;
- weiter nicht gelaufen: jede Zahl am Kopf (GTX, Radeon), die Fenster-Probe des Films, der Film-Streifen, das Laub-Bett.

---------------------------------------------------------------------------------------------------------------------------
## DIE ENTSCHEIDUNG

Was Feuer, Wasser und ihre Zeugen lesen, ist EINE Funktion von Saat, Ort, Welt-Uhr und Taten. Dazu gehören Regen P, Wind θ und
U₁₀, Luft T und RH, die Brennstoff-Last w, die Brennstoff-Feuchte M und der Film S der Oberfläche. Alles rechnet aus EINEM
Antrieb im Kern, `ortWetter`.

Getickt wird nur die Brand-Front auf ihren 16-m-Zellen. Gespeichert wird nur das Delta: die Taten `brand` und `wetter`.

**Der Entscheid hat den Spike eingearbeitet** (`vision/kopplung/spike.md`, Commit 40e0ffd95). Jede Zahl, die der Spike widerlegt
hat, ist an ihrer Stelle ersetzt: der Preis (4), die Uhr (1.2), der brennbare Anteil (1.8, (2)), die Ferne und B4 (1.8), die
Prämisse und die Schranke von Fall III ((7)), die Sprossen (6) und das Offene (8). Der Spike widerlegt das Gesetz der Kopplung
nicht. Er widerlegt den Preis (× 6–14), den Null-Punkt der Uhr, den Punkt-Wert „27 % brennbar“, B4 als ganz geheilt und vier
Sätze des Solls: (a) an der Sturm-Stufe, Prämisse und Schranke von Fall III, die 16-m-Grenze von Fall II. Das Urteil je Fall
und der ERSTE Schnitt der Bau-Welle stehen in (9): der Preis, gleitender Kasten und Geburt in Scheiben.

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

**Was der Spieler sieht:** Eine trockene Wiese ist im Sommer in 19–27 % der Zeit brennbar statt in 0–0,3 % (das Band:
18,7 % an EINEM Ort im Stamm, 26,7–27,3 % in node über 4 Orte; offen `kopplung.anteil_brennbar`). Die Front läuft als Ellipse
mit dem Wind. Die Regenkante löscht sie dort, wo sie fällt, und 2 km weiter brennt es 185–195 s länger (Spike, 6/6).

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

**Tag-Phase:** `frac(_weltTag())`, mit `_weltTag()` = tagNull + spielZeit / 3600 (feld-leben.js:2604–2607).
- **Heute (gelesen, im Spike gemessen):** `_weltTag` liest `+tagNull || 0`. `_weltTagEichen` (feld-leben.js:2612–2616) schreibt
  tagNull nur beim Laden eines Stands (speicher-laden.js:532), und zwar auf die Stunde der Sicht: tag + timeOfDay −
  spielZeit/3600. Eine Welt ohne Stand (der Erststart, jeder Boot der Linsen) trägt keinen Null-Punkt. Im Spike war in jedem Boot
  tagNull undefined und timeOfDay 0,501: Der Prozess-Tag beginnt um Mitternacht, der Sicht-Tag am Mittag (dirigent-kern.js:300).
  Das sind 12 h Versatz. Beim ersten Neuladen eicht `_weltTagEichen` dieselbe Welt auf die Sicht, und der Prozess-Tag springt
  (gelesen, nicht gelaufen).
- **Entschieden:** `_weltTagEichen` ist der EINE Schreiber des Null-Punkts und läuft in JEDER Welt, deren `worldMeta` keinen
  trägt: beim Laden wie heute und neu beim ersten Lesen von `_weltTag()`. Er legt den Prozess-Tag auf die Stunde der Sicht in
  diesem Augenblick. Eine Welt ohne Stand bootet mit timeOfDay 0,5 und spielZeit ≈ 0, also mit tagNull 0,5: Prozess- und Sicht-Tag
  beginnen am Mittag. In der Vorgabe (`dayLengthMinutes` 60 = `PEGEL_TAG_S`) laufen sie gleich schnell und bleiben phasengleich,
  bis der Spieler den Sicht-Regler zieht (das darf er; es ist Bild). Danach ist tagNull ein Weltfakt im Stand und springt nie
  wieder. Kein Regler schreibt ihn (die Ablehnung in 1.8 bleibt). Die Zeile „Eine neue Welt beginnt bei 0“ (feld-leben.js:2611)
  fällt. Messname `kopplung.uhr.phase` (Bahn 2).

**Saison:** `frac(wm.saisonNull + (_weltTag() − wm.tagNull) / TEMPERATUR.jahrTage)`.
- Vorgabe saisonNull 0,375 (dirigent-kern.js:305); jahrTage 365 (gelaende-core.js:1319).
- `set_season` schreibt saisonNull als Weltfakt. Der Op ist broadcastbar, feld-dsl.js:958.
- Mit `autoSeason` false steht die Saison auf saisonNull.

**Sicht-Uhr:** `timeOfDay` (bild-himmel.js:2648) und der Regler `dayLengthMinutes` sind reines BILD: Himmel, Licht und
Sonnenstand im Bild. Keine Größe der Kopplung liest sie. Das ist der Satz, den der Code schon über sich sagt (bild-himmel.js:2746–2747, „die Uhr des Spielers ist SICHT (w28-lava-nachlauf): kein Prozess liest sie“).
In der Vorgabe (60 min) laufen Sicht-Tag und Prozess-Tag gleich schnell. Am Mittag beginnen beide erst mit dem Null-Punkt aus
der Tag-Phase oben; heute beginnt der Prozess-Tag ohne Stand um Mitternacht.

### 1.3 Raster

**Physik:**
- Rechenpunkt ist die 16-m-Zelle `LIFE_FIELD.cell` (feld-leben.js:3078): ihre Mitte, auf der Höhe der Oberfläche.
- Dieselbe Zelle trägt die Brand-Front, M, das `ortWetter`-Memo und die Last.
- Bett-Maske 2 m (`bettGitter` 8) und Glut-Block 64 m (`blockZellen` 4) bleiben.

**Bild:** Der Film-Streifen läuft längs der Front-Koordinate s̃ in 16-m-Texeln über den Chunk-Ring, auf der Höhe des Auges.

Dabei gilt: s̃ = x·dx + z·dz + biegeM·sin(2πq/querM + b). Das ist s ohne den Term −zug·t (phyto-core.js:4428–4431). Ein Ort
hat für alle Zeit EIN s̃.

**Zeit:** M und der Film schreiten auf dem globalen Raster 5 s Welt. Die Front schreitet mit `schrittS` 1 s (feld-brand.js:894).
Das 5-s-Raster ist die Auflösung jeder Löschzeit: Jede Löschzeit unter 5 s erscheint als 5 s (Spike Fall III, Herd C).

### 1.4 Signaturen — Kern (rein, additiv)
```js
// phyto-core.js — wetterAt, windSaat, windGrund, forestKronenDeckung byte-gleich
WETTER_ORT = { kastenS: 45, rasterS: 5 }        // der Kasten des Übergangs (heute daten.js:143, dort künftig gelesen)
REGEN = { P_ref_mmh: 0.834,                      // FOLGT: (spende/Beiwert) / 24 / ⟨rain·Tor⟩ — Linse kopplung.regen.masse
          torAb: 0.4, torVoll: 0.6 }             // gewählt: Tor = smoothstep(0,4; 0,6; feuchte) der Luftmasse
ortWetter(saat, x_m, z_m, t_s, ort, taten, ring) → {
                                                 // ring (optional, im Memo des Rufers): {t, zeilen[9]} — der gleitende Kasten (4):
                                                 //   liegt t genau 5 s nach ring.t, EIN neues wetterAt, sonst neun; bitgleich
  zeile, front, feuchte,                         // wetterAt(saat, x, z, t, ort) unverändert (mit Ring: die Zeile j = 0)
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
_feuchteFenster(cx, cz, y, t, art, frist) → { M, S, fertig }
                                                 // bild-himmel.js: das Fenster in Scheiben bis `frist` (4); das Memo trägt e, u, M, S,
                                                 //   den Ring des Kastens und ab e + H das Fenster der nächsten Epoche
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
  - Nach dem Spike nachgerechnet MIT dem 45-s-Kasten des Gesetzes (das Skript oben rief `wetterAt` ohne Kasten; `node
    $N/h-fehler.cjs`, 11,8 s: der Schritt der Spike-Kopie, 3 Orte — A, Mess-Wiese, B — × 40 Proben gegen 40 Prozess-Tage):

    | H | Gras max abs(ΔM) | Laub max abs(ΔM) | gekippt (Gras · Laub, von 120) |
    |---|---|---|---|
    | 0,5 Prozess-Tag | 1,7·10⁻² | — | 1 · — |
    | 1 Prozess-Tag | **4,5·10⁻⁶** | 2,2·10⁻¹ | 0 · 0 |
    | 2 Prozess-Tage | — | **1,3·10⁻³** | — · 0 |

    Gras H 1 und Laub H 2 halten ε_M (2,4·10⁻³ bzw. 5·10⁻³). Der Abstand des Laubs zu ε_M schrumpft mit dem Kasten von × 250 auf
    × 3,8; die Fenster-Probe von Bahn 6 misst ihn im Stamm.
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
  - Mit ×1 bleibt Gras in 0,0–1,5 % der Zeit brennbar (Entwurf Erhaltung `feuchte-zusatz.cjs`), mit ×24 in 18,7–27,3 %
    (18,7 % im Stamm an Ort A über 200 Sommer-Tage, Spike `fall3.cjs gesetz s`; 26,7–27,3 % in node über 4 Orte).
- **Das Jahr ist 365 Prozess-Tage = 1 314 000 s Welt.** Es folgt aus `TEMPERATUR.jahrTage` (gelaende-core.js:1319). Der Kern
  rechnet die Trägheit der Jahres-Welle damit schon heute (:1335).
  - Das Jahr von 2 400 s ist kürzer als ein Prozess-Tag (UB4). Es fällt mit seinen drei Ersatz-Literalen (dirigent-kern.js:311,
    bild-himmel.js:933, :970, speicher-laden.js:543).
  - Sichtbare Folge: Eine Saison dauert 91 Welt-h. Der Saison-Wechsel alle 10 min endet; Herbst zeigt `set_season` oder ein
    Zeitsprung.
  - Die Brandsaison ist echt (`node $E/anteil-entscheid.cjs … 0.375 / 0.875`; node, Breite 50°, Temperatur am Spiegel):

    | Saison | Gras brennbar | Laub brennbar |
    |---|---|---|
    | Sommer | 26,7–27,3 % (Stamm, Ort A, EINE Sonnenbahn, Höhe der Zelle: 18,7 %) | 29,5–30,2 % (Stamm: nicht gemessen) |
    | Winter | 7,5–8,7 % (Stamm: nicht gemessen) | 0,0 % |

    Die Zahl ist ein Band, kein Wert. Die beiden Messungen unterscheiden sich in drei benannten Stücken: Sonnenbahn (Breite 50°
    gegen die EINE Bahn), Temperatur (Spiegel gegen Höhe der Zelle) und Stichprobe (4 Orte × 30 Tage gegen 1 Ort × 200 Tage).
    Welches Stück die 8 Punkte trägt, ist nicht gemessen; offen bleibt `kopplung.anteil_brennbar` (8).
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
- **Gemessen:** Regen fällt in 32,9–37,1 % der Zeit (P ≥ 0,1 mm/h in 27,1–29,0 %), heute in 58,4 %. Gras brennbar UND
  U₁₀ ≥ 5 m/s gilt in 10,0–16,1 % der Zeit. Das untere Ende misst der Spike im Stamm an Ort A (200 Sommer-Tage), das obere node
  über 4 Orte.

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
- Das Gesetz hat keinen Rand: Bett, Last, M und Front gibt es überall. Die Front tickt, wo sie brennt; ihr Preis hängt am Saum.
- **B4 heilt nur halb (Spike).**
  - Das Bett ist überall da: B in 2 km trägt 10/10 Zellen, D in 1,1 km ebenso. Vorher sind es 0/10 und 0/62 Linien ab 424 m.
  - Es ist aber noch keine reine Funktion des Orts. 34–38 von 400 Zellen ändern p·anteil um > 0,05 (größtes |Δp| 0,99), wenn
    der Spieler am Ort, an der Mess-Wiese (850 m) oder 4,2 km fern steht.
  - Die Ursache ist gelesen: Das p der Wiese liest das Licht der stehenden Kronen (`_bodenLichtFeld`, vegetation-wiese.js:43–72)
    aus `wegeKarte.kronen`, einem Register im Fenster um den Spieler (1 000 Kronen am Ort, 989 an der Mess-Wiese, 785 fern).
  - **Den Rest schneidet Bahn 5 BETT.** Das Gras-Bett liest das Licht der Kronen aus der Deckung am Ort, also aus der EINEN
    Kern-Montage `kronenDeckungAm`, die auch das Laub-Bett und der Fern-Boden lesen. Die Licht-Formel bleibt
    exp(−canopyK · Deckung). Die Nah-Wiese im Bild liest weiter das Register; das ist eine Bild-Folge wie die Ferne.
  - Messname `bett.ort_frei`: 0 von 400 Zellen ändern sich mit dem Ort des Spielers. Der Abstand zwischen Bett-p und Bild-p
    nahe am Auge ist offen (`bett.bild_nah`, (8)).
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
| Gras brennbar (M < mx), Sommer | 0,0–0,3 % | **18,7–27,3 %** (Stamm, Ort A: 18,7 %; node, 4 Orte: 26,7–27,3 %) | Entwurf Erhaltung `feuchte.cjs`; `node $E/anteil-entscheid.cjs /home/user/AnazhRealm 0.375`; Spike `node fall3.cjs gesetz s` |
| Laub brennbar, Sommer | 0,0–0,3 % | 29,5–30,2 % (node; im Stamm nicht gemessen) | `node $E/anteil-entscheid.cjs` |
| Gras brennbar und U₁₀ ≥ 5 m/s | 0,0–0,1 % (Entwurf Spiel) | **10,0–16,1 %** (Stamm, Ort A: 10,0 %; node: 14,9–16,1 %) | dasselbe wie Zeile 1 |
| Gras-Brennfenster | 0–3,6 min (Entwurf Spiel) | Median 810 s, p90 1 035 s, max 1 115 s Welt (n 276; node, M < mx); im Stamm an Ort A, enger gezählt (P = 0, M < 0,09, ≥ 300 s): Median 665 s, max 855 s (n 130) | dasselbe; Spike `node fall3.cjs gesetz s` |
| Niederschlag | 26 383 mm/a (Entwurf Erhaltung) | 2,99–3,04 mm/Tag (1 095 mm/a) | `node $E/lauf.cjs /home/user/AnazhRealm 0.375` |
| Pegel, schneller Abfluss | 24,1 × Spende | Bilanz-Abfluss 0,66–0,68 mm/Tag (Spende 0,9; der Rest ist Interzeptions-Verdunstung) | dasselbe |
| Löschen Gras / Laub, regen 0,50 mm/h | 6,1 s, alle Brände der Welt (Entwurf Erhaltung) | 3,8 s / 39,9 s Welt in node, am Ort; im Stamm auf dem 5-s-Raster **5 s** (Gras gemessen, Spike Herd C) / 40 s (Laub, Rechnung) | dasselbe; Spike `node fall3.cjs gesetz cd 538140` |
| Löschen sturm 0,83 / bewölkt 0,10 mm/h (konstantes P) | — / trocknet nie | 2,3 / 23,9 s · 18,8 / 199,4 s in node; auf dem 5-s-Raster 5 / 25 s · 20 / 200 s (Rechnung: der erste Schritt danach) | dasselbe |
| Löschen unter einem Band der Welle (P steigt von 0) | — | Gras 35–65 s ab dem ersten P > 0; A erlischt im Niesel, 20–35 s bevor P ≥ 0,45 die Linie erreicht (6/6) | Spike `node fall3.cjs gesetz ab <t_A>` |
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
| feld-brand.js:553–583 `_brandArbeit`, :559, :915 `mindestJeBild` | die Frist nur zwischen zwei Stück, mindestens 8 Stück (Aschen und Zündungen) je Bild, jede Zündung mit ihrer ganzen Geburt → Geburten in Scheiben unter der Frist; `mindestJeBild` zählt nur Aschen und Zündungen mit fertigem M (4) | Preis: ein Bild bis 4,6 ms (Spike) |
| feld-brand.js:975 `feuchte.trocken` | → EMC | — |
| stoff-material.js:239 | Stärke `_weatherFieldFor(this.state.weather).wind` → `_wetterAm(x, z).mix.wind` | Z8, Z12 |
| phyto-core.js:4357 | Mäander ±41,3° → × 0,485 | Z11 |
| bild-himmel.js:2874–2882 `_temperaturAt(y, traegTage)` | `timeOfDay` und das Wort → (x, z, y, traeg) zur Tag-Phase, Wetter am Ort; Rufer feld-brand.js:315, feld-leben.js:2484, :2509, klang.js:492, koerper-fahrt.js:2398, siedlung-wege.js:581 | UB1, Z16 |
| dirigent-kern.js:311; bild-himmel.js:933, :970; speicher-laden.js:543 | Jahr 2 400 s samt Ersatz-Literalen → 365 Prozess-Tage | UB4 |
| feld-leben.js:2604–2616 `_weltTag`, `_weltTagEichen` | `+tagNull \|\| 0` und „Eine neue Welt beginnt bei 0“ (Prozess-Tag um Mitternacht, Sicht am Mittag) → `_weltTagEichen` in jeder Welt ohne Null-Punkt, auch ohne Stand (1.2) | Uhr: 12 h Versatz, Sprung beim ersten Neuladen |
| vegetation-wiese.js:43–72 `_bodenLichtFeld` als Licht des Gras-Betts | Register `wegeKarte.kronen` im Fenster um den Spieler → Deckung am Ort aus `kronenDeckungAm` (1.8 Die Ferne); das Bild der Nah-Wiese liest weiter das Register | B4 (Rest: 34–38 von 400 Zellen) |
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
- `seasonYearSeconds`;
- `tagNull) || 0` in feld-leben.js.

**Bleibt (beim Namen, fällt NICHT): der Wind-Deckel feld-brand.js:330.**
- Er ist Rothermel 1972: φ_W wird bei U_Flamme ≤ 0,9·I_R gedeckelt, U in ft/min auf Flammenhöhe, I_R in Btu/(ft²·min). Der Code
  setzt ihn in genau diesen Einheiten um: I_R :313, u nach Albini–Baughman 1979 aus dem 20-ft-Wind (÷ 1,15) :327–329, der Deckel
  :330. Er ist also richtig umgesetzt.
- Er greift im Spike bei U₁₀ 24 in 100 % der Zellen. Dort ist u = 1 546 ft/min, die Grenze 533–647 ft/min (leb 0,88, M 0,09 /
  0,06; `node $N/deckel.cjs`). Bei 7,2 m/s liegt u mit 472 ft/min darunter.
- Er ist umstritten: Die Nachprüfung Andrews, Cruz & Rothermel 2013 hält ihn für zu eng. Darum stand er schon im Entscheid und
  im Spike als „unsicher“.
- Er ist aber NICHT die Wurzel der Abweichung gegen CSIRO. Ohne ihn stiege R(24)/R(7,2) auf 11,3 (CSIRO 2,90), und R/R_CSIRO
  läge bei 24 m/s bei 2,74–2,97 statt gemessen 0,33–0,45 (Rechnung aus den Konstanten des Codes, ebenes Gelände; `deckel.cjs`
  rechnet aus den gerundeten R des Spikes 0,34–0,46). Die Rechnung trifft das
  gemessene 7,2/2,4 auf demselben Bett-Stück: 7,29 gegen 7,25–7,26.
- Die Wurzel ist die Wind-Funktion selbst: φ_W ∝ u^2,07 (B aus σ 3 500 1/ft) steigt in Gras steiler als CSIRO (U^0,844). Schon
  7,2/2,4 zeigt es mit 7,25 gegen 3,16.
- Das ist das Gesetz des Feuers (B1), nicht die Kopplung. Keine Bahn dieses Gesetzes ändert die Wind-Funktion; es bleibt offen
  unter `brand.kopf_csiro` bei U₁₀ 2,4 und 24 (8).
- Für Bedingung (a) heißt das: An der Sturm-Stufe urteilt (a) über den Deckel, nicht über die Kopplung. Berichtigt prüft (a) den
  Weg des Winds an die Zelle und das Tempo unter dem Deckel ((7)); so trägt Fall I ((9)).

---------------------------------------------------------------------------------------------------------------------------
## (4) DER PREIS — EINE Basis (gemessen im Spike, gebunden nach dem Spike)

**Basis:**
- µs je Bild bei 60 Hz (30 Hz genannt). Das EINE Budget ist `BRAND.budgetMs` 0,25 ms je Bild (feld-brand.js:914), also
  15 000 µs je Welt-s bei 60 Hz und 7 500 bei 30 Hz.
- Front = Saum-Zellen (brennend + wartend, 16 m). Geburt = das erste Fenster einer Zelle, ihr M zu ihrer Ankunft.
- Schrittweite: M und Film 5 s Welt, Front 1 s Welt.

**Gemessen im Spike** (Fall I bei U₁₀ 7,2 und M 0,06, die Kopien im headless Stamm; `cd vision/kopplung/spike && node fall1.cjs
fest p` bzw. `vorher p`):

| Baustein | vorher | nachher (die Kopie) |
|---|---|---|
| ns je Schritt von M | — | **3 789** |
| Geburt Gras (728–1 434 Schritte) | — | **Median 4,03 ms**, Mittel 4,14, max 7,8 |
| Geburt Laub (1 473–2 874 Schritte) | — | Median 8,45 ms, max 11,2 |
| Bett je neue Zelle (`_brandStoff`) | Median 50 µs, max 500 | Median 115 µs, Mittel 210, max 1 755 |
| der ganze `_tickBrand` je Zelle und Welt-s | 2,4–3,6 µs | **21,7–22,8 µs**, davon M 85–89 % |
| ohne M (Front und Malen) | 2,4–3,6 µs | 2,5–3,4 µs; das Zitat 3,7 (feld-brand.js:458) trifft |
| je Bild nach 300 s | Mittel 170, p95 485, max 915 µs (Saum 97) | Mittel 197, p95 330, **max 4 635 µs** (Saum 207) |
| je Bild nach 900 s | Mittel 107, p95 165, max 365 µs (Saum 80) | Mittel 170, p95 230, **max 4 150 µs** (Saum 222) |
| Kapazität 60 Hz (15 000 µs / je Zelle·s) | — | **660–690 Saum-Zellen** (330–345 bei 30 Hz) |

Gerechnet hatte der Entscheid 431–554 ns je Schritt, 0,31–0,80 ms je Gras-Geburt und 1 180–1 400 Saum-Zellen. Das war im Schritt
× 6,8–8,8 und in der Geburt × 5,0–13 zu klein. Ein frisches Fenster ging in EINEM Bild, also trug ein Bild bis 4,6 ms gegen das
Budget 0,25 ms.

**Woraus die Geburt besteht** (`node $N/schritt.cjs 6`, drei Läufe: die Kern-Kopien des Spikes in node, der Schritt der Kopie
wörtlich, kopien.cjs:292–339):
- Eine Geburt sind H…2H / 5 s = 728–1 434 Schritte. Jeder Schritt ruft `ortWetter` einmal.
- Der ganze Schritt kostet in node 2 609–3 012 ns (ein Ausreißer 4 079). Davon trägt `ortWetter` 2 585–2 855 ns (90–94 %). Es
  ruft `wetterAt` zehnmal, je Ruf 297–355 ns: einmal am Ort und neunmal für den 45-s-Kasten an t_k − 5j (1.4).
- Der Rest des Antriebs kostet 179–241 ns (2 × `temperaturAus`, `luftFeuchte`, Sonnenhöhe, `et0`); `feuchteSchritt` und
  `filmSchritt` kosten zusammen 25–62 ns.
- Das Skript des Entscheids (`node $E/fenster-entscheid.cjs`, heute 547 ns, im Spike 596 ns) rief `wetterAt` EINMAL je Schritt,
  ohne Kasten. Der Faktor des Spikes ist darum zu × 4,4–5,5 der Kasten des Gesetzes und nur zu × 1,26–1,45 der Stamm (3 789 ns
  gegen 2 609–3 012 ns in node).
- Bett (115 µs je Geburt) und Front (2,5–3,4 µs je Zelle·s) sind daneben klein.

**DIE ENTSCHEIDUNG: zwei Schnitte am Fenster, keiner an der Physik.**

1. **Der Kasten gleitet** (Bahn 1, `ortWetter` in phyto-core).
   - Zwei Schritte im Abstand von 5 s teilen 8 der 9 Kasten-Zeilen.
   - `ortWetter(…, ring)` nimmt den Ring des Rufers {t, zeilen[9]}. Liegt t genau 5 s nach ring.t, rechnet es EINE neue Zeile
     und schiebt; sonst rechnet es neun.
   - Die Summe läuft in derselben Folge j = 0…8, und w ist die Zeile j = 0 (t auf dem Raster). Es bleibt EINE Funktion. Der
     Ring ist ein Cache wie das Memo und liegt in ihm (im Fenster, im Streifen-Texel).
   - Gemessen: **bitgleich 72 000 / 72 000 Schritte** (Zeile, front, feuchte, tor, mix, U₁₀, P; 50 Zellen × 1 440 Schritte).
     M und Film am Ende der Fenster sind 50 / 50 bitgleich.
   - Das Verhältnis Ring/Kasten je frisches Fenster ist **0,206–0,244** in 11 von 12 Paaren der ersten beiden Läufe (ein Paar
     0,370). Der dritte Lauf beim Gegencheck gibt 0,224–0,248 in 5 von 6 Paaren (ein Paar 0,158, dort lief der Kasten mit
     4 079 ns). Die Rechnung unten nimmt 0,206–0,244; die obere Kante 0,248 hebt sie um 1,6 %. In node kostet der Schritt mit
     Ring 587–642 ns statt 2 609–3 012 ns.
2. **Die Geburt geht in Scheiben unter der EINEN Frist** (Bahn 2 `_feuchteFenster`, Bahn 4 `_brandArbeit`).
   - Das Fenster ist schon fortsetzbar, denn das Memo trägt e, u, M und S. Die Kopie rechnet es aber im Getter zu Ende
     (kopien.cjs:331–337). `_brandArbeit` prüft die Frist nur zwischen zwei Stück (Asche oder Zündung) und geht mindestens
     `mindestJeBild` 8 Stück je Bild (feld-brand.js:559, :915). Darum trug ein Bild in Fall I (0,5 Geburten je Welt-s) bis
     4,6 ms. Bei Saum 2 000 und 70 s Verweildauer (28,6 Geburten je Welt-s) gingen bis zu 8 frische Fenster in ein Bild:
     8 × 4,03 = 32 ms (Rechnung).
   - `_feuchteFenster(cx, cz, y, t, art, frist)` schreitet bis zur Frist und meldet, ob M zu t fertig ist (1.5).
   - `_brandArbeit` reiht die Arbeit:
     1. Aschen und Zündungen mit fertigem M; nur sie zählen für `mindestJeBild`;
     2. die Fenster der fälligen Zellen nach `an`;
     3. die Fenster der wartenden Zellen nach `an` — eine Geburt beginnt, wenn die Zelle ins Feld tritt, nicht bei ihrer Ankunft;
     4. neue Texel des Streifens nach Abstand zum Auge.
   - Eine lesende Zelle trägt ab e + H das Fenster ihrer nächsten Epoche im Memo mit. Ihr Epochen-Wechsel ist dann keine Geburt.
   - Eine fällige Zelle ohne fertiges M hält den Schritt: Er ist nicht ganz, und die Brand-Uhr steht (feld-brand.js:485). Die
     Zelle zündet zu IHRER Ankunft `an`. Die Physik ist dieselbe wie ohne Frist; sie wird nur später gezeigt.
   - **`kopplung.rueckstand`** nennt im Trace Welt-Uhr − Brand-Uhr in s und die Zahl der Zellen, die auf ihr M warten. Nichts
     wird still verworfen.
   - Die Probe `kopplung.frist.gleich` (Bahn 6): Derselbe Brand mit Frist 0,25 ms und mit Frist ∞ gibt dieselben Zündzeiten je
     Zelle, 0 ungleich.
- **Verworfen: die Geburt je 64-m-Block.** Sie teilt die Rechnung durch bis zu 16. Aber M würde eine Funktion des Blocks statt
  des Orts, und an der Ecke des Blocks kippen 2 von 120 Urteilen (1.6). Der Ring spart × 4,1–4,9 und bleibt bitgleich.

**Rechnung nach den Schnitten** (`node $N/preis-nachtrag.cjs`: die Stamm-Zahl des Spikes × r; im Stamm misst sie erst
`kopplung.preis.us_je_bild`):
- Schritt 781–925 ns. Geburt Gras 0,83–1,01 ms (max 1,61–1,91), Laub 1,74–2,06 ms (max 2,31–2,73).
- Je Zelle und Welt-s 6,4–8,2 µs: ohne M 2,4–3,4, dazu M 19,3–19,4 × r.
- **Kapazität (Mischung von Fall I): 1 840–2 360 Saum-Zellen bei 60 Hz**, 920–1 180 bei 30 Hz.
- **Gebunden an die Änderung:** Bei Saum S trägt das Budget (15 000 µs − S · 2,4–3,4 µs) / 0,83–1,01 ms Geburten je Welt-s.
  Für Saum 207 sind das 14–17, für Saum 2 000 bei 60 Hz 8–12 und bei 30 Hz 0,7–3,3.
- **Ein Bild** trägt von M höchstens die Frist 250 µs und einen Schritt (≤ 1 µs). Die Front geht ihren eigenen Schritt weiter in
  einem Bild (vorher max 915 µs); das ist kein Posten dieses Gesetzes.

| Szene | Front (ohne M) | Geburten | Schreiten + Epochen | Streifen | Summe je Bild | Budget |
|---|---|---|---|---|---|---|
| Ruhe, stehend | 0 | 0 | 0 | 0,4 | **0,4 µs** | 250 µs |
| Ruhe, Fahrt 30 m/s längs der Achse | 0 | 0 | 0 | 26,7–31,6 | **27–32 µs** | 250 |
| 1 ha = 39 Zellen (Sprosse feuer#2), Verweildauer 70 s | 1,6–2,2 | 7,7–9,4 | 0,4–0,5 | 0,4 | **10–13 µs** | 250 |
| Fall I nach 300 s (Saum 207, 152 Zellen in 300 s) | 8,2–11,8 | 7,0–8,5 | 2,2–2,6 | 0,4 | **18–23 µs** | 250 |
| Szene A (Saum 134, 1,9 neue Zellen/s; Entwurf Spiel) | 5,3–7,6 | 26,3–32,0 | 1,4–1,7 | 0,4 | **33–42 µs** | 250 |
| Szene A, Fahrt 30 m/s | 5,3–7,6 | 26,3–32,0 | 1,4–1,7 | 26,7–31,6 | **60–73 µs** | 250 |
| Saum 2 000 (feuer#2), Verweildauer 70 s, 60 Hz | 80–114 | 395–481 | 21–25 | 0,4 | **496–620 µs** | 250 → Brand-Uhr 40–50 % der Welt-Uhr, Rückstand +0,50–0,60 s je Welt-s |
| Saum 2 000, Verweildauer 70 s, 30 Hz | 159–228 | 790–962 | 42–49 | 0,8 | **992–1 240 µs** | 250 → 20–25 %, +0,75–0,80 s je Welt-s |
| Saum 2 000, Verweildauer 259 s wie Fall I, 60 Hz | 80–114 | 107–130 | 21–25 | 0,4 | **208–269 µs** | 250 → 93–100 %, +0–0,07 s je Welt-s |

- **Ruhe kostet ≈ 0.** Ein Feld ohne Leser wird nie integriert. Die Größe der Welt kommt in keiner Zeile vor; es zählen Saum,
  Geburten und die Breite des Rings.
- **Was trägt die Kosten:** Großbrände tragen die Geburten (78–80 % bei Saum 2 000 und 70 s). Das ist der Preis der Exaktheit am
  Rechenpunkt.
- **Die Falsifikation des Preises** („Szene A > 250 µs je Bild“, (7)) ist im Spike im Max eingetreten: 4 150 µs nach 900 s
  (vorher 365). Im Mittel (170) und im p95 (230) ist sie nicht eingetreten. Die Schnitte binden das Max an die Frist; das Mittel
  von Szene A rechnet 33–42 µs.
- **Ankunft und Teleport:** Der Streifen des Rings wird VOR dem ersten Bild gerechnet. Ring 4 (25 Texel) kostet 21–25 ms (ohne
  Ring 101–103 ms), Ring 12 (68 Texel) 56–69 ms (ohne Ring 274–281 ms). Das ist ein benannter Posten für PFLICHT-OFFEN B:
  +0,12–0,15 % bzw. +0,34–0,41 % von 16,6 s. Danach rechnet der Streifen einen Ring voraus.
- **Fackel:** Ein frisches Fenster von 0,83–1,01 ms (max 1,91) geht in Scheiben zu 250 µs. Das Urteil steht nach 4–5 Bildern,
  höchstens nach 8 (134 ms bei 60 Hz).
- **Offen** (gemessen nur in node bzw. headless; Messname `kopplung.preis.us_je_bild`): der Ring im Stamm und an beiden Geräten;
  die Laub-Geburt (kein Fall misst Laub); der Streifen (im Spike nicht gebaut).

---------------------------------------------------------------------------------------------------------------------------
## (5) DIE BAHNEN — ausschließlicher Datei-Besitz

### 5.1 Reihenfolge
1. **Zuerst der Spike (7) — gelaufen** (`vision/kopplung/spike.md`, 40e0ffd95). Die Regel hieß: „Fällt eine Falsifikation,
   beginnt keine Bahn.“ Eingetreten sind vier, jede mit benannter Ursache, keine im Gesetz der Kopplung (9):
   - Fall I (a) 1,60 < 1,70: der Wind-Deckel des Feuers (feld-brand.js:330), nicht die Kopplung (1.8, (8) `brand.kopf_csiro`);
   - Fall III, die Prämisse (0-mal in 200 Tagen) und die Schranke im Wortlaut (0,001–0,23): das Soll war falsch gestellt ((7)
     berichtigt);
   - der Preis im Max (4 150 µs gegen 250): das unteilbare Fenster und der Kasten ohne Ring ((4)).

   Dazu ist ein Soll knapp verfehlt, keine Falsifikation: Fall II (2) 94,1 % < 95 %, weil die Grenze 16 m die Diagonale 22,6 m
   als Fehlgriff zählte ((7) berichtigt; mit der Diagonale 17/17).

   Die Bahnen beginnen. Die Regel gilt weiter für jede Falsifikation, deren Ursache die Kopplung selbst ist. Der ERSTE Schnitt ist
   der Preis (9): Bahn 1 friert `ortWetter(…, ring)` mit ein; Bahn 2 und 4 bauen zuerst die Scheiben, und
   `kopplung.preis.us_je_bild` und `kopplung.rueckstand` messen sie im Stamm auf der Bühne von Fall I, bevor ihre übrigen
   Schnitte beginnen. Gelandet wird weiter gemeinsam (5.).
2. **Bahn 1 KERN.** Sie friert die Signaturen aus 1.4 und 1.5 ein, mit dem Ring in `ortWetter` (4).
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
- Bahn 4 ruft `_feuchteAm` und `_temperaturAt` (Bahn 2), und in `_brandArbeit` die Scheiben `_feuchteFenster(…, frist)`
  (Bahn 2, 1.5).
- Bahn 2 ruft `ortWetter(…, ring)` (Bahn 1, 1.4).
- Bahn 4 ruft `_wieseDeckungAt` und `_kronenDeckungAm` (Bahn 5).
- Bahn 2 reiht Streifen-Texel über `_brandArbeit` (Bahn 4).
- Bahn 3 liest `_wetterAm` (Bahn 2).

### 5.3 Je Bahn: Schnitt · Zielbild · Messname

**Bahn 1 KERN**
- **Schnitt:**
  - phyto-core: `WETTER_ORT`, `REGEN`, `ortWetter`, `kronenDeckungAm`; Mäander × 0,485 in `windRichtung`.
  - `ortWetter(…, ring)` mit dem gleitenden Kasten (4): eine neue Kasten-Zeile je 5-s-Schritt statt neun, dieselbe Summe in
    derselben Folge.
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
  - `kopplung.kasten.bitgleich`: `ortWetter` mit Ring ↔ ohne Ring über Fenster von 1 440 Schritten, 0 ungleich (in node
    72 000 / 72 000, `node $N/schritt.cjs 6`); dazu das Verhältnis der Kosten, Soll ≤ 0,25 (node 0,206–0,244).
  - `kopplung.wind.abweichung_grad`: ≤ 20,0.
  - `kopplung.regen.masse`: P_ref · 24 · ⟨rain·Tor⟩ = spende/Beiwert ± 1 %.

**Bahn 2 WASSER & UHR AM ORT**
- **Schnitt:**
  - `_wetterAm`; `_feuchteAm` mit Epochen-Anker; Film-Streifen → Shader (stoff-material, stoff-karte).
  - `_feuchteFenster(cx, cz, y, t, art, frist)` schreitet in Scheiben bis zur Frist und trägt den Ring des Kastens im Memo (4).
  - Der Null-Punkt der Uhr: `_weltTagEichen` läuft beim ersten `_weltTag()` jeder Welt ohne tagNull; die Zeile „Eine neue Welt
    beginnt bei 0“ fällt (1.2).
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
- **Zielbild (b) Sicht-Regler auf Mitternacht:** In einer neuen Welt zeigen Himmel und Prozess-Tag denselben Mittag (tagNull 0,5
  aus `_weltTagEichen`). Der Regler zieht Himmel und Licht auf Nacht. Fackel, Brennglas und Grillen-Temperatur bleiben
  unverändert, weil der Prozess-Tag weiter seinen Mittag trägt.
- **Zielbild (c) Wagen:** Der Wagen fährt 1 km der Front entgegen. Dort ist die Straße trocken, und der Griff am Rad ändert sich
  beim Übertritt.
- **Messname:**
  - `kopplung.film.kante`: die Kante im Bild läuft mit 11 m/s ± 10 %.
  - `kopplung.uhr.sicht_frei`: Regler 0 ↔ 0,5 gibt ΔT = 0 an jedem Prozess-Leser.
  - `kopplung.uhr.phase`: in einer neuen Welt ohne Stand |frac(_weltTag()) − timeOfDay| < 1/1 440 (1 Sicht-Minute) beim ersten
    Bild und nach 600 s ohne Regler; nach Speichern und Laden springt `_weltTag()` um 0. Heute 0,501 (12 h).
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
  - `_brandArbeit` ist die EINE Kappung mit Rückstand. Sie reiht die Scheiben der Geburten unter der Frist (4); `mindestJeBild`
    zählt nur Aschen und Zündungen mit fertigem M (heute zählt es jede Zündung samt frischem Fenster, feld-brand.js:559).
  - Der Wind-Deckel `Math.min(0.9 * IR, u)` (feld-brand.js:330) bleibt: Rothermel 1972, richtig umgesetzt (1.8).
- **Zielbild:**
  - Ort: Mess-Wiese, im Brennfenster (Median 810 s in node; an Ort A im Stamm 665 s, (2)). Kamera: Third, 12 m hinter dem Herd,
    6 m hoch, Blick windab.
  - Die Fackel zündet. Die Front läuft als Ellipse windab (Spike Fall I: L/B 4,73 nach 300 s, FCFDG O-1 4,98).
  - Nach 300 s steht die Spitze 234–322 m vorn, 1,3–2,4 ha sind schwarz (Entwurf Spiel `szene72.cjs` bei U₁₀ 7,2, M 0,06–0,09).
  - Erreicht der Regen die Front, erlischt das Gras dort. Unter der Tat (P konstant 0,50 mm/h) geschieht das in EINEM 5-s-Schritt
    (Spike C: 5 s). Unter einem Band der Welle erlischt sie im Niesel, 35–65 s nach dem ersten P > 0 (Spike A, 6/6). Die trockene
    Seite brennt im selben Bild weiter.
  - Vom Hügel aus 500 m sind die Glut-Säume jenseits 160 m zu sehen.
- **Messname:**
  - `brand.kopf_csiro`: R/R_CSIRO ∈ [0,5; 2] bei U₁₀ 6,9–10 (Spike 0,565 / 0,603); bei 2,4 und 24 gemessen, kein Soll (8).
  - `brand.ort_probe`: A erlischt, B brennt.
  - `kopplung.rueckstand`: unter einem Schritt (< 1 s; der Spike misst vorher wie nachher ≤ 0,983 s) und 0 Zellen, die auf ihr M
    warten — in Ruhe, in Fahrt, in Szene A, in Fall I und auf 1 ha. Über der Kapazität (Saum 2 000) steht er als Zahl im Trace (4).
  - `brand.absage_satz`: die Fackel-Absage nennt Grund und Zahl (Spike Fall II: der Grund ist gemessen, der Satz an den Spieler
    fehlt, kampf.js:2448).

**Bahn 5 BETT**
- **Schnitt:**
  - `_wieseDeckungAt(x, z)`: das p des Wiesen-Wurfs als Funktion, dieselbe Rechnung wie vegetation-wiese.js:162–172 und
    :778–784, kein Zweitweg.
  - `_kronenDeckungAm(x, z)` über den Kern, mit dem Haupt-ctx aus `_waldStandSchluessel` (vegetation-wiese.js:3037) und seinen
    Nachbarn.
  - Das Licht im Bett: `_wieseDeckungAt` liest das Kronen-Licht aus `_kronenDeckungAm`, nicht aus `_bodenLichtFeld`
    (vegetation-wiese.js:43–72, aus `wegeKarte.kronen`, einer Karte im Fenster um den Spieler). Das schneidet den Rest von B4
    (Spike: 34–38 von 400 Zellen ändern p um > 0,05 mit dem Ort des Spielers, max 0,99). Das Bild der Nah-Wiese
    (vegetation-wiese.js:125–172) bleibt beim Register; ob es dasselbe Licht liest, misst `bett.bild_nah` (8).
  - `fernFarbeTeile` (voxel-worker.js:4291) ruft `kronenDeckungAm`, byte-gleich.
- **Zielbild:**
  - Ort: 2 km vom Spawn, jenseits des gebauten Rings. Kamera: Third, 20 m hoch.
  - Die Fackel zündet auf grünem Boden wie am Spawn. Auf Kies sagt sie „kein Bett". Unter Wald brennt Laub.
- **Messname:**
  - `bett.ohne_karte`: Null-Renderer; die 1 926 von 2 401 Zellen „ohne Karte" (Entwurf Erhaltung) tragen alle ein Urteil aus der
    Funktion.
  - `bett.faden_gleich`: Kronen-Deckung Haupt ↔ Faden bitgleich an 81 Punkten.
  - `bett.ort_frei`: dieselben 400 Zellen, der Spieler am Ort ↔ an der Mess-Wiese ↔ 4,2 km fern: 0 Zellen mit |Δ(p·anteil)| > 0
    (Spike vorher 34–38, max 0,99).
  - `bett.laub_erwartung`: Erwartung ↔ gezählte Kronen je Zelle im Ring. Gemessen, kein Soll.

**Bahn 6 LINSE**
- **Familie:** die Brand-Linse (scripts/lib/stand-linse.cjs:396, :454).
- **Proben:**
  - Ort-Probe headless: Herd A erlischt unter dem nahenden Band, im Niesel davor; Herd B 2 km windab brennt weiter und erlischt
    185–195 s nach A (Spike 6/6; die Kinematik des Kerns sagt mit dem Versatz der Köpfe 187–202 s). Die Probe zählt die Ordnung
    (A vor B) und Δt_ext gegen den Abstand der Köpfe / zugMS ± 20 s, nicht die Löschzeit.
  - Fenster-Identität: Memo ↔ Neurechnung bitgleich, auch nach einem Welt-Uhr-Sprung von 1 h; 0 ungleich (Spike 4 100 / 4 100).
  - `kopplung.frist.gleich`: derselbe Brand mit Frist 0,25 ms und mit Frist ∞ gibt dieselben Zündzeiten je Zelle, 0 ungleich (4).
  - `kopplung.kasten.bitgleich` (Bahn 1) läuft hier mit.
  - Fenster-Probe H für Gras, Laub und Film: Fenster ↔ Langlauf über 40 Prozess-Tage, max abs(ΔM) ≤ ε_M (node mit Kasten:
    Gras 4,5·10⁻⁶, Laub 1,3·10⁻³; 1.6), der Film unter `kopplung.fenster.film`.
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

**Können fallen** (vor dem Spike entschieden; die letzte Spalte ist das Urteil nach dem Spike, mit Zahl und dem, was die Sprosse
noch braucht):

| Sprosse | Bahnen | was trägt | Soll: Zirkel oder unabhängig | nach dem Spike |
|---|---|---|---|---|
| kaskade#1 — „Bildpaar: Brand erlischt im Regen, hält im Trockenen, beide Geräte" | 2 + 4 + 7 | Regen am Ort, M je Zelle; „hält im Trockenen" ist ein echter Test (Herd B) | **unabhängig:** qualitativ und örtlich. Die Löschzeit des Modells ist kein Soll. | **KANN, bestätigt:** B lebt 185–195 s länger als A (6/6); D wächst 700,6 m neben dem Kreis um 67 Zellen; C erlischt in einem 5-s-Schritt. Vorher war der Fall nicht stellbar (B und D ohne Bett: 0/10, 0/62). Es fehlt das Bildpaar an beiden Geräten: `g1.kopplung` Glied 4. |
| kaskade#2 — „Glieder, deren Bild sich ändert und beim Festhalten des Vorgängers stehen bleibt, ≥ 4" | 2 + 4 + 6 | P → Film (Albedo) → M → Brand → Licht (die Ellipse, dirigent-kern.js:1800–1809); Festhalte-Probe über die Tat `wetter` | **unabhängig:** strukturell | **KANN, halb gemessen:** P → M → Brand trägt (Fall II: M der Kreis-Mitte 0,068 → 2,454 unter der Tat, 0 von 258 Zündungen mit M ≥ mx; Fall I (b) 1,30). Das Film-Glied ist im Spike nicht gebaut (der Film-Streifen im Bild), die Festhalte-Probe nicht gelaufen. Die Sprosse hängt an Bahn 2: `kopplung.film.kante`, `kopplung.linse`. |
| physik.feuer#1 — „zündet / zündet nicht" | 4 + 5 + 7 | Bett überall (B4), M am Ort, Absage mit Zahl | **halb:** „nass" heißt M ≥ mx; mx 0,12 ist Anderson 1982 FM1, dieselbe Quelle wie der Code-Wert. Die Eis-/Lava-Hälfte („Eis trägt ±5 cm, Lava erstarrt") misst dieses Gesetz nicht; die Sprosse fällt GANZ nur, wenn Bahn 7 die Eis-y-Probe und die erstarrte Lava mitmisst (Code steht: bau-vorlagen.js:1644, gelaende-core.js:1848). | **KANN, mit drei Bedingungen:** Fackel 4/4 (vorher 0/4 im Grund), Bett in 2 km 10/10 (vorher 0/10). Es fehlen: (i) der Absage-Satz mit Grund und Zahl (kampf.js:2448 sagt `welt.fackel-faengt-nicht`; Bahn 4, `brand.absage_satz`); (ii) der Rest von B4 (34–38 von 400 Zellen hängen am Spieler; Bahn 5, `bett.ort_frei`); (iii) Eis und Lava (Bahn 7). mx 12 % gegen CSIRO, das erst bei 20 / 24 % stoppt, ist Gesetz des Feuers (`brand.mx_csiro`, (8)). |
| physik.feuer#2 — „Front-Tempo im Rothermel-Band, Halt in 100 % der Proben, Bild-p95 ≤ 33 ms während 2 000 Zellen brennen, beide Geräte" | 2 + 4 + 5 + 7 | trocken-windige Lage, Halt an Fluss/Fels/nassem Gras, Regen löscht, Fern-Glut (B6 teilweise) | **„Rothermel-Band" ist ZIRKEL**, denn der Code ist Rothermel. Unabhängig ist CSIRO-Gras. „Halt 100 %" ist strukturell, p95 unabhängig. Die p95 an beiden Geräten entscheidet Bahn 7. | **KANN NUR mit dem Preis-Schnitt (4).** Ohne Ring und Scheiben ist die Kapazität 660–690 Saum-Zellen, und bei Saum 2 000 (28,6 Geburten je Welt-s) gehen bis zu `mindestJeBild` 8 frische Fenster in ein Bild: 8 × 4,03 = 32 ms (Rechnung, feld-brand.js:559). Mit den Schnitten trägt M je Bild ≤ 250 µs; Saum 2 000 bei 70 s Verweildauer läuft mit Brand-Uhr 40–50 % (Rückstand benannt), bei 259 s mit 93–100 %. Gegen CSIRO: bei 7,2 0,565 / 0,603 im Band; bei 2,4 0,36–0,42 und bei 24 0,33–0,45 darunter (B1, (8)). Halt an nassem Gras: 0 Zündungen mit M ≥ mx, 0 / 17 Halte > 32 m vor dem Rand. Fluss und Fels sind nicht gemessen. Messnamen `kopplung.preis.us_je_bild`, `kopplung.rueckstand`, `g1.kopplung`. |
| stoerung#1 — „Bildpaar Zelle vor / nach dem Brand, beide Geräte" | 4 + 5 | Asche am Ort, Bett nicht mehr an der Ring-Maske | **unabhängig:** Existenz, W | **KANN, unverändert:** Der Spike misst die Asche nicht; das Bett trägt jenseits des Rings (B 10/10). Glied 5 von `g1.kopplung`. |
| wetter-welt#2 — „Gras, Bäume, Wolken, Rauch, Wasser zeigen dieselbe Richtung ±20°, Lee < frei < Düse" | 1 + 2 | Mäander 20,0°, Stärke am Ort, Form (stoff-material.js:233–252) | **±20° mit Zirkel-Gefahr:** 0,485 ist gewählt, um ±20° zu treffen. **Unabhängig:** Lee < frei < Düse, die Strömung am Relief. | **KANN, unverändert:** Der Spike misst die Richtung nicht (node 20,0°). `kopplung.wind.abweichung_grad`. |
| wetter-welt#3 — „Luma porös nass/trocken 0,5–0,8; Pfützen in Senken r ≥ 0,5" | 2 | Film am Ort statt EIN Skalar; Pfützen in den Mulden (gelaende-boden.js:2509) | **Luma-Band U** (ohne Quelle, nicht aus dem Modell). **Unabhängig:** Pfützen ↔ Senke, das Relief. | **KANN, unverändert und ungemessen:** Der Film-Streifen ist im Spike nicht gebaut. `kopplung.film.kante`. |

**Nach dem Spike fällt keine Sprosse aus der Liste.** Bestätigt ist kaskade#1. An einer Bedingung hängen kaskade#2 (das
Film-Glied), physik.feuer#1 (Absage-Satz, B4-Rest, Eis und Lava) und physik.feuer#2 (der Preis-Schnitt). Ungemessen sind
stoerung#1, wetter-welt#2 und wetter-welt#3.

**Nicht — mit Grund:**

| Sprosse | Grund |
|---|---|
| ereignis#2 | Bewohner weichen der Front: K4, offen |
| ereignis#1 | unberührt; Glut und Lava laufen schon |
| ereignis#3–7 | — |
| gewalt#1 | Blitz K13. Der Blocker „Gras in 0,0–0,1 % brennbar" fällt aber: brennbar und U₁₀ ≥ 5 m/s 10,0 % (Stamm, Ort A) bis 16,1 % (node). |
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
| physik.feuer#7 | B5 heilt, die Brandsaison entsteht; B4 heilt nach dem Spike nur halb (das Bett ist überall da, hängt aber in 34–38 von 400 Zellen am Spieler; der Rest ist Bahn 5, `bett.ort_frei`). SP1 und der FARSITE-/GWIS-Vergleich bleiben. |
| kaskade#3–7 | — |
| kohaerenz#1–7 | #2 braucht `bodenSe` (Z5, offen) |
| aufwaerts#1–8 | keine Größe dieses Gesetzes |
| erdsaat#1–6 | keine Größe dieses Gesetzes |

---------------------------------------------------------------------------------------------------------------------------
## (7) DER AUFTRAG AN DEN SPIKE (so weitergegeben; gelaufen, `vision/kopplung/spike.md` 40e0ffd95)

Der Auftrag steht, wie er lief. Jede Stelle, die der Spike widerlegt hat, trägt darunter eine Zeile **Spike:** mit der Zahl und
der Berichtigung. Für einen zweiten Lauf gilt die berichtigte Fassung.

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
>
>     **Spike:** eingetreten an EINER Stelle, 24/7,2 bei M 0,09: R_Kopf 1,60 < 1,70. Die Ursache ist der Wind-Deckel des Feuers
>     (feld-brand.js:330, Rothermel 1972, richtig umgesetzt; (3) „Bleibt“), nicht die Kopplung: U₁₀ an der Zelle 23,1–23,7 m/s.
>     Berichtigt, (a) in zwei Gliedern:
>     - (a1) der WEG: U₁₀ am Ort im Verhältnis der Zeilen, Schwelle die halbe Log-Spanne wie oben (gewählt): 7,2/2,4 ≥ √3,0 = 1,73,
>       24/7,2 ≥ √3,33 = 1,83. Gemessen 7,14 / 2,38 = 3,00 und 23,1–23,7 / 7,14 = 3,24–3,32.
>     - (a2) das Tempo unter dem Deckel: R(7,2)/R(2,4) ≥ 1,78. Gemessen 4,27–7,26.
>
>     R(24)/R(7,2) setzt bei u > 0,9·I_R das Gesetz des Feuers selbst; mit dem Deckel rechnet es 1,02–1,99 über M 0,06/0,09 und
>     leb 0,8–0,9 (`node $N/deckel.cjs`),
>     die Schwelle 1,70 liegt also mitten in seiner eigenen Spanne. Es ist Bericht unter `brand.kopf_csiro` (8), kein Urteil über
>     die Kopplung.
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
>
>   **Spike:** bei 7,2 0,565 / 0,603 (im Band, knapp); bei 2,4 0,42 / 0,36 statt 0,26; bei 24 0,33 (M 0,09) und 0,45 (R_Stück,
>   M 0,06), in 0,30–0,61.
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
>
>   **Spike:** (1) 0 von 258; (3) Eintritt tIgn + 481,9 s nach t_mx 445–455 s (gemessen unter der Kontroll-Kopie bewoelkt,
>   14 Uhr, ab M 2,454; die ≈ 355 s oben gelten für klar am Mittag ab 2,5), 0 von 118 vor ihrem t_mx; (4) 4/4, der Satz mit Zahl
>   ist nicht gebaut. (2) 16 / 17 = 94,1 % ≤ 16 m: Die eine Quelle liegt 18,3 m entfernt, in der diagonalen Nachbarin (22,6 m).
>   Berichtigt: (2) ≤ eine Zelle einschließlich der Diagonale, also ≤ 22,6 m, in ≥ 95 %; gemessen 17 / 17.
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
>
>   **Spike:** Diese Prämisse kommt an A in 200 Sommer-Tagen 0-mal vor. P = mix.rain · tor · P_ref, und tor steigt stetig mit der
>   feuchte: Jedes Brennfenster endet im Niesel am Saum des Bands (tor 0,000–0,513 am Ende, P der ersten 60 s 0,09–0,33 mm/h), das
>   Band mit P ≥ 0,45 folgt 70–105 s später. Berichtigt (so gelaufen): t_A ist das Ende eines Brennfensters durch Regen (erster
>   5-s-Schritt mit P > 0), und P ≥ 0,45 folgt binnen 300 s (42 Fenster durch Regen beendet, 17 davon mit Band).
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
>
>     **Spike:** Die Formel mit konstantem P ist unter einem Band widerlegt. Mit P am Einsatz gibt sie 0,001–0,23 × (6/6), mit dem
>     P des Bands 31 ×. Konstantes P gilt nur unter der Tat (C: 5 s gegen 3,24 s, 1,54 ×). Berichtigt: Die Schranke ist das
>     Integral, der erste t mit ∫ c·P dt ≥ (mx − M₀)·w über P(t) des Gesetzes an der Kopf-Zelle; so gibt sie A 1,09–1,15 und
>     B 1,01–1,13. Das ist ein Zirkel (dasselbe P, c, w, mx wie das Modell) und darum Bericht, kein Soll. Jede Löschzeit steht
>     auf dem 5-s-Raster (1.3): Das Soll [1; 3] × S wird [5⌈S/5⌉; 5⌈3S/5⌉] s. Unter 5 s ist keine Löschzeit sichtbar.
>   - **Δt_ext = 2 000 m / zugMS 11 m/s = 182 s ± 20 s.** Das ist die Kinematik der Front des Kerns (WIND_FELD, phyto-core.js:4320)
>     und unabhängig von der Feuchte-Physik.
>
>     **Spike:** 185–195 s (6/6), im Band. Die Kinematik mit dem Versatz der Köpfe (B steht 62–226 m weiter windab) sagt
>     187–202 s; das Soll ist berichtigt auf Abstand der Köpfe / zugMS ± 20 s. Es bleibt Kinematik des Kerns (zugMS gesetzt).
>   - **B wächst** zwischen t_ext(A) und t_A + 150 s.
>   - **D wächst** 300 s.
> - **Falsifikation:**
>   - B erlischt binnen 60 s nach A, oder D mit C: dann lebt eine Welt-Nässe weiter;
>   - Δt_ext weicht um mehr als 20 s von 182 s ab: dann folgt das Löschen nicht dem Band;
>   - eine Löschzeit liegt außerhalb [1; 3] × Massen-Schranke: dann erhält die Bilanz das Wasser nicht.
> - **Zirkel-Gefahr:** Die Massen-Schranke nutzt dasselbe c (σ, w, ρp des Modells), sie ist also halb unabhängig. Die
>   Löschzeiten des Modells selbst (3,8 / 2,3 / 18,8 s) sind KEIN Soll. Unabhängig sind die Kinematik und die Örtlichkeit.
>
>   **Spike:** Die Löschzeiten 3,8 / 2,3 / 18,8 s sind node-Zahlen und im Stamm nicht sichtbar; auf dem 5-s-Raster sind es 5 / 5 /
>   20 s (gemessen C: 5 s). Unter einem Band der Welle erlischt A in 35–65 s ab dem ersten P > 0, im Niesel, 20–35 s bevor
>   P ≥ 0,45 die Linie erreicht. Unabhängig bleiben die Örtlichkeit (D wächst 700,6 m neben dem Kreis um 67 Zellen) und die
>   Ordnung (A vor B, C vor D).
> - **Vorher:** Die Nässe gilt am Spieler. Erwartet: A und B erlöschen zugleich, D stirbt mit C.
>
>   **Spike:** Vorher lässt sich der Fall nicht stellen. B und D tragen kein Bett (0/10 Zellen in 2 km; 0 von 62 Linien quer von
>   424 bis 1 400 m), und C erlischt 19 s nach dem Wort, das für die ganze Welt gilt (5,2–5,9 × Schranke).
>
> **Dazu der Preis, gleiche Bedingung vorher ↔ nachher:**
> - µs je Zelle und Welt-s der Front, gemessen; sie ersetzt das Zitat 3,7 µs von feld-brand.js:458;
> - µs je neue Zelle für das Bett (64 Punkte) und für `_feuchteAm`;
> - µs je Bild in Fall I bei U₁₀ 7,2 nach 300 s.
>
> Falsifikation des Preises: Szene A > 250 µs je Bild.
>
> **Spike:** eingetreten im Max, nicht im Mittel. Nach 900 s Mittel 170, p95 230, max 4 150 µs (vorher 107 / 165 / 365). Ein
> frisches Fenster ging in EINEM Bild. Die Schnitte und die neue Rechnung stehen in (4).
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
| Wind-Deckel 0,9·I_R (feld-brand.js:330): Rothermel 1972, richtig umgesetzt, bleibt (3). Er greift bei U₁₀ 24 in 100 % der Zellen (Spike) und setzt R(24)/R(7,2) auf 1,60–2,46 gegen CSIRO 2,90. Ohne ihn läge R/R_CSIRO bei 24 bei 2,74–2,97 statt 0,33–0,45 (`node $N/deckel.cjs`) | Gesetz des Feuers (B1): die Wurzel ist φ_W ∝ u^2,07 gegen CSIRO U^0,844, nicht der Deckel; die Nachprüfung (Andrews, Cruz & Rothermel 2013) ist unsicher | `brand.kopf_csiro` bei U₁₀ 24 |
| Tempo bei schwachem Wind (B1): R/R_CSIRO bei 2,4 m/s 0,36–0,42 (Spike; die Entwürfe erwarteten 0,26) | Gesetz des Feuers | `brand.kopf_csiro` bei U₁₀ 2,4 |
| Erlöschungs-Feuchte: mx Gras 12 % (Anderson 1982 FM1, dieselbe Quelle wie der Code) gegen CSIRO, wo φ_M erst bei 20 % (U < 10 km/h) bzw. 24 % null wird (Spike `node csiro.cjs`) | Gesetz des Feuers; nach CSIRO stünde t_mx der Fackel-Zelle von Fall II früher (M/mx 1,67 bei ~330 s statt 455 s) | `brand.mx_csiro` |
| Die Fackel-Absage mit Grund und Zahl („nass: M 0,131 über mx 0,12“): der Grund ist gemessen (Fall II 4/4), der Satz an den Spieler nicht gebaut (kampf.js:2448 sagt `welt.fackel-faengt-nicht`) | Bahn 4; Bedingung von physik.feuer#1 | `brand.absage_satz` |
| EB1: U₁₀ trägt die Einheit m/s, aber die Zeilen-Werte 1,44 … 24 sind gesetzt | die Zeilen des Wetters | `wetter.u10_band` |
| EB5: FM1-Norm-Bett × 0,17–0,45 CSIRO (Entwurf Spiel) | das Modell, nicht die Kopplung | `brand.fm1_csiro` |
| Regen-Häufigkeit P > 0 in 32,9–37,1 % der Zeit (node 32,9 %; Stamm an Ort A 37,1 %, P ≥ 0,1 mm/h 27,1–29,0 %). Daher ist P_ref 0,834 mm/h Niesel. Der Vergleichswert 7–15 % der Stunden steht im Entwurf Erhaltung ohne Quelle (unsicher). | Befund gegen die Zeilen (`WIND_FELD.front.stufen`), nicht gegen die Bilanz | `regen.anteil_zeit` |
| Die Flaute vor dem Band: U₁₀ an den Zündungen von B fällt 185–345 s vor seinem Regen von 6–8 auf 1,1–2,2 m/s und steigt mit dem Band auf 4–8 m/s (Spike Fall III, Mittel je 40 s) | Beobachtung ohne Soll und ohne Quelle; sie macht „B wächst“ dünn (2–7 Zellen) | `wetter.flaute_vor_band` |
| Laub-Streu im Bild nur im Fenster der Wege-Karte (siedlung-wege.js:421–440; FS2 im Bild) | Bild; das Bett liest es nicht mehr | `bild.laub_streu_fern` |
| `gruenSchwelle` 0,04 (daten.js:635) | gewählt (Look); entscheidet jetzt auch das Gras-Bett | `bett.gruen_schwelle` |
| TS3: Planeten-Wind tot (planet-core.js:2336) | Reise-Welten behalten θ0 aus der Saat; EINE Quelle bleibt gewahrt | `wind.reise_theta0` |
| Gleichlauf der Welt-Uhr zwischen Mitspielern | nicht verifiziert (Entwurf Erhaltung) | `uhr.gleichlauf_p2p` |
| Film jenseits des Chunk-Rings (Fern-Boden ohne Film) | Bild | `bild.film_fern` |
| Streifen an der Augen-Höhe gegen die Höhe des Bodens im Ring | Bild-Näherung; 4 m Höhe sind 0,44 K | `bild.film_hoehe` |
| Fenster H des Films (1 Prozess-Tag, unsicher) | nicht gemessen | `kopplung.fenster.film` (Bahn 6) || Der brennbare Anteil als Band: Gras brennbar im Sommer 18,7–27,3 % (Stamm mit der EINEN Sonnenbahn an EINEM Ort 18,7 %; node mit Breite 50° an 4 Orten 26,7–27,3 %); brennbar und U₁₀ ≥ 5 m/s 10,0–16,1 % | Ein Ort ist keine Stichprobe; die Welt-Stichprobe im Stamm fehlt | `kopplung.anteil_brennbar` |
| Der Preis im Stamm nach den Schnitten: gemessen sind im Spike Bett (Median 115 µs je Geburt) und Front (2,5–3,4 µs je Zelle·s); der Ring ist nur in node gemessen (0,206–0,244), alles nach dem Schnitt ist Rechnung (4) | an GTX und Radeon nicht gemessen; die Laub-Geburt misst kein Fall; der Streifen ist nicht gebaut | `kopplung.preis.us_je_bild` |
| Saum über der Kapazität: nach den Schnitten 1 840–2 360 Saum-Zellen bei 60 Hz, 920–1 180 bei 30 Hz (Rechnung; vor den Schnitten gemessen 660–690 / 330–345). feuer#2 „2 000 Zellen" liegt bei 70 s Verweildauer darüber (Brand-Uhr 40–50 %), bei 259 s darunter (93–100 %) | benannter Rückstand, nie still; die Verweildauer eines Saums von 2 000 ist nicht gemessen | `kopplung.rueckstand` |
| Das Bild der Nah-Wiese (vegetation-wiese.js:125–172) liest das Licht weiter aus `wegeKarte.kronen`, nachdem das Bett es aus `_kronenDeckungAm` liest (Bahn 5) | Bild, kein Glied der Kopplung; ob Bild und Bett am selben Ort dasselbe p zeigen, ist nicht gemessen | `bett.bild_nah` |
| terraform#1: Bilanz der Luftmasse (die Tat `wetter` schafft Regen ohne Herkunft) | kein Wasser-Haushalt der Luft | terraform#1 |
| Herden suchen Schutz (K10) | kein Unterstands-Gesetz der Herde | wetter-welt#4 (Tier-Hälfte) |

---------------------------------------------------------------------------------------------------------------------------
## (9) NACH DEM SPIKE — Urteil je Fall, Falsifikationen, Zirkel, der erste Schnitt

Quelle: `vision/kopplung/spike.md` (40e0ffd95), headless Stamm mit den Kopien, vorher ↔ nachher unter gleicher Bedingung. Jede
Zahl trägt dort ihren Befehl.

**Urteil je Fall:**

| Fall | Urteil | Zahl nachher (vorher) |
|---|---|---|
| I — trockene Wiese, Wind × Feuchte | **TRÄGT NICHT im Wortlaut; die Kopplung trägt** | (a) 24/7,2 bei M 0,09: R_Kopf **1,60 < 1,70** (vorher mit dem Stub 0,88–0,99: der Sturm wirkte nicht), Wind-Deckel in 100 % der Zellen; 7,2/2,4 4,27–7,26 ≥ 1,78. (b) 1,30–1,36 ≥ 1,176. (c) 0,000 % (vorher −100 % / +724 % je Zelle). (d) ΔM 0 (vorher M 0,06 → 2,56). R/R_CSIRO bei 7,2 0,565 / 0,603. In der berichtigten Lesart von (a) ((7): U₁₀ am Ort 3,00 und 3,24–3,32 ≥ 1,73 / 1,83; R 7,2/2,4 ≥ 1,78) trägt der Fall. |
| II — feuchte Wiese stirbt gegen mx | **TRÄGT** | (1) **0 / 258** Zündungen mit M ≥ mx. (3) Eintritt 481,9 s nach t_mx 445–455 s, 0 / 118 vor ihrem t_mx. (4) Fackel **4 / 4** (vorher 0 / 4 im Grund). Überlöschen 0 / 17. (2) 94,1 % ≤ 16 m, mit der Diagonale 17 / 17. Vorher fehlt dem Kreis das Bett zu 98 %, und M bleibt im Regen 0,060. |
| III — Regenfront über dem Brand | **TRÄGT in Örtlichkeit und Kinematik, NICHT in Prämisse und Schranke** | Δt_ext **185–195 s** (6/6; Soll 182 ± 20). D wächst **67 Zellen** 700,6 m neben dem Kreis. C erlischt in **5 s** = 1,54 × Schranke. Prämisse **0-mal** in 200 Tagen. Schranke im Wortlaut 0,001–0,23 ×, als Integral 1,01–1,15 × (Zirkel). B wächst nur dünn (2–7 Zellen). Vorher nicht stellbar (B und D ohne Bett; C stirbt 19 s nach dem Wort der ganzen Welt). |
| Preis | **Falsifikation im Max eingetreten** | Szene A nach 900 s: Mittel 170, p95 230, **max 4 150 µs** gegen 250 (vorher 107 / 165 / 365). Schritt 3 789 ns, Gras-Geburt 4,03 ms, Kapazität 660–690. Bitgleich 4 100 / 4 100. |

**Eingetretene Falsifikationen, je mit Ursache:**
1. **Fall I (a), Sturm-Stufe.** Die Ursache ist das Gesetz des Feuers: Der Wind-Deckel (feld-brand.js:330) ist Rothermel 1972 und
   richtig umgesetzt (3); er greift bei U₁₀ 24 in 100 % der Zellen. Die Wurzel der Abweichung gegen CSIRO ist φ_W ∝ u^2,07
   (ohne Deckel R/R_CSIRO 2,74–2,97 bei 24). Die Kopplung bringt den Wind an die Zelle: U₁₀ 23,1–23,7 von 24 m/s. Offen B1,
   `brand.kopf_csiro`.
2. **Fall III, Prämisse.** Das Tor ist stetig (smoothstep der feuchte, gewählt): Jedes Brennfenster endet im Niesel, das Band
   folgt 70–105 s später. Das Soll war falsch gestellt; der Fall lief mit dem gelockerten, benannten Kriterium ((7)).
3. **Fall III, Schranke im Wortlaut.** P steigt an der Rampe von 0; eine Formel mit konstantem P passt nur unter der Tat (C 1,54).
   Berichtigt als Integral auf dem 5-s-Raster ((7)).
4. **Der Preis im Max.** Das frische Fenster war unteilbar, und jeder Schritt rechnete den Kasten neu (zehn `wetterAt`).
   Geschnitten in (4).

Nicht eingetreten: Fall I (b), (c), (d) und „Ausbreitung < 2× über den Wind-Bereich“ (× 8,5–10,1); Fall II alle vier; Fall III
„B erlischt binnen 60 s nach A“, „D erlischt mit C“, „Δt_ext weicht > 20 s ab“, „Löschzeit C außerhalb [1; 3] × Schranke“.

**Zirkel — was der Spike beweist und was nicht:**
- Aus dem eigenen Modell, ohne Beweiskraft: die M-Werte (die Bisektion setzt sie über das Gesetz); mx 0,12 (Anderson 1982 FM1,
  dieselbe Quelle wie der Code); t_mx; das Soll 182 s (zugMS ist gesetzt); die Schranke als Integral (dasselbe P, c, w, mx); L/B
  nach Anderson 1983 (im Code); die Schwellen 1,78 / 1,70 (aus CSIRO abgeleitet, aber gewählt); der Mäander 0,485 (gewählt für
  ±20°).
- Unabhängig: CSIRO-Gras (Cheney, Gould & Catchpole 1998); L/B nach FCFDG 1992 O-1 (4,73 gegen 4,98) und Alexander 1985; die
  Örtlichkeit (B brennt 185–195 s länger, D wächst neben dem Kreis); die Ordnung (A vor B, C vor D, kein Eintritt vor t_mx).
- Der Spike beweist also den WEG: Ort, Zeit, Wind und M erreichen die Zelle, und das Wort und die Welt-Nässe erreichen sie nicht
  mehr. Er beweist nicht die Physik des Feuers (B1, mx gegen CSIRO) und keine Löschzeit (CSIRO hat keinen Regen-Term).

**An Ort und Stelle berichtigt:** die Uhr (1.2, Bahn 2: `_weltTagEichen` in jeder Welt ohne Null-Punkt, `kopplung.uhr.phase`);
der brennbare Anteil als Band 18,7–27,3 % (1.8, (2), (8)); B4 halb und sein Rest in Bahn 5 (1.8, `bett.ort_frei`); der
Wind-Deckel bleibt (3); der Preis (4); die Prämisse, die Schranke, das 5-s-Raster der Löschzeiten, Δt_ext und die 16-m-Grenze
((7)); die Ort-Probe und das Zielbild des Löschens (5.3); die Sprossen (6); das Offene (8); das H des Gras-Fensters mit dem
Kasten (1.6).

**Was die Bau-Welle als ERSTES schneidet:**
1. **Der Preis** — Ring in `ortWetter` (Bahn 1) und Geburt in Scheiben in `_feuchteFenster` und `_brandArbeit` (Bahn 2 + 4), in
   EINEM Zug. Grund: Er ist die einzige eingetretene Falsifikation, deren Ursache im Bau der Kopplung selbst liegt; ohne ihn
   trägt ein Bild bis 4,6 ms (Fall I) bzw. bis 32 ms (Saum 2 000, Rechnung), und physik.feuer#2 kann nicht fallen. Beweis im
   Stamm auf der Bühne von Fall I (U₁₀ 7,2, M 0,06, 300 s und 900 s), vorher ↔ nachher:
   - `kopplung.kasten.bitgleich` 0 ungleich; `kopplung.frist.gleich` 0 ungleich;
   - `kopplung.preis.us_je_bild`: M je Bild ≤ 250 µs plus ein Schritt (vorher max 4 635 / 4 150 µs); Mittel gerechnet 18–23 µs
     nach 300 s;
   - `kopplung.rueckstand` unter einem Schritt (< 1 s; vorher wie nachher ≤ 0,983 s) und 0 Zellen, die auf ihr M warten.
2. **Der Null-Punkt der Uhr** (Bahn 2, feld-leben.js:2604–2616). Jede Zündzeit, jedes Brennfenster und jede Löschzeit liest die
   Tag-Phase; heute liegt sie in jeder neuen Welt 12 h neben dem Himmel. `kopplung.uhr.phase` von 0,501 auf < 1/1 440.
3. **Der Rest von B4** (Bahn 5): `bett.ort_frei` von 34–38 auf 0 von 400 Zellen.

Danach laufen die Bahnen nach 5.1.

---------------------------------------------------------------------------------------------------------------------------
## Gerechnet (Befehle, `E` wie oben; alles node, je < 2 s)

**1. Bilanz unter dem entschiedenen Gesetz:** `node $E/lauf.cjs /home/user/AnazhRealm 0.375`. Das Skript ersetzt Stufe → Tor,
Jahr → 365·3 600 und Saison → S0. Ergebnisse:
- ⟨rain·Tor⟩ 0,1499; P̄ 3,00 mm/Tag (1 095 mm/a); P_ref 0,834 (Faktor 12,0 gegen 10).
- Pegel heute 24,1×.
- Bilanz-Fehler 5,1·10⁻¹⁵ kg/m².
- Abfluss 0,66–0,68 mm/Tag.
- Löschzeiten und Trocknen wie in (2).
- Regen P > 0 in 32,9 %, P ≥ 0,1 mm/h in 29,0 % der Zeit. Im Stamm an Ort A (Spike, 200 Sommer-Tage): 37,1 % und 27,1 %.

**2. Brennbare Anteile ohne Boden-Glied:** `node $E/anteil-entscheid.cjs /home/user/AnazhRealm 0.375` bzw. `0.875`. Das ist node
mit Breite 50° an 4 Orten. Der Stamm mit der EINEN Sonnenbahn gibt an EINEM Ort (A, Sommer) 18,7 % Gras brennbar und 10,0 %
brennbar mit U₁₀ ≥ 5 m/s (Spike `node fall3.cjs gesetz s`). Die Zahlen unten gelten darum nur als obere Kante des Bands
18,7–27,3 %, offen unter `kopplung.anteil_brennbar` (8).

| | Gras | Laub | Gras und U₁₀ ≥ 5 | Brennfenster |
|---|---|---|---|---|
| Sommer | 26,7–27,3 % | 29,5–30,2 % | 14,9–16,1 % | Median 810 s, p90 1 035 s, max 1 115 s (n 276) |
| Winter | 7,5–8,7 % | 0,0 % | 3,9–4,7 % | Median 520 s, p90 735 s, max 835 s (n 126) |

**3. Fenster:** `node $E/fenster-entscheid.cjs /home/user/AnazhRealm`. Die Tabelle steht in 1.6. Das Skript ruft `wetterAt`
einmal je Schritt, ohne den 45-s-Kasten (heute 547 ns je Schritt). Seine Zeit ist darum NICHT der Preis des Gesetzes: Der Schritt
des Gesetzes kostet in node 2 609–3 012 ns und im Stamm 3 789 ns; der Preis steht in (4). Seine Fehler-Spalten sind mit dem
Kasten nachgerechnet: `node $N/h-fehler.cjs` (11,8 s) gibt Gras H 1 Prozess-Tag 4,5·10⁻⁶, Laub H 2 Prozess-Tage 1,3·10⁻³, je
0/120 gekippt (die Tabelle in 1.6).

**3a. Der Schritt zerlegt und der Ring:** `node $N/schritt.cjs 6` (6 Paare je Lauf, drei Läufe, 4,1 s Wanduhr gemessen).
- Ring ↔ Kasten bitgleich 72 000 / 72 000 Schritte; M und Film am Ende 50 / 50 (in jedem Lauf).
- Schritt mit Kasten 2 609–3 012 ns (ein Ausreißer 4 079), mit Ring 587–642 ns (ein Ausreißer 1 004).
- Ring/Kasten je frisches Fenster 0,206–0,248 in 16 von 18 Paaren (Ausreißer 0,158 und 0,370); die Rechnung (4) nimmt
  0,206–0,244 aus den ersten beiden Läufen.
- Zerlegung: `ortWetter` 2 585–2 855 ns, `wetterAt` 297–355 ns je Ruf, übriger Antrieb 179–241 ns, `feuchteSchritt` +
  `filmSchritt` 25–62 ns.

**3b. Der Wind-Deckel:** `node $N/deckel.cjs` (`_brandTempo` mit den Konstanten des Codes, ebenes Gelände).
- leb 0,88: I_R 719 (M 0,06) bzw. 593 Btu/ft²/min (M 0,09); Grenze 0,9·I_R 647 bzw. 533 ft/min; u 157 / 472 / 1 546 ft/min bei
  U₁₀ 2,38 / 7,14 / 23,4.
- Mit Deckel 7,2/2,4 = 7,29–7,33 (gemessen R_Stück 7,25–7,26), 24/7,2 = 1,02–1,99 über M 0,06/0,09 und leb 0,8–0,9 (1,28–1,89
  bei leb 0,88). Ohne Deckel 24/7,2 = 11,28–11,29, R/R_CSIRO bei 24 2,74 (M 0,06) bzw. 2,97 (M 0,09). B = 2,071.

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
- Massen-Schranke 3,6 / 2,2 / 18,1 s mit konstantem P. Unter einem Band der Welle ist sie widerlegt (Spike: 0,001–0,23 ×); sie
  gilt als Integral, und jede Löschzeit steht auf dem 5-s-Raster ((7)).

**8. Preis-Tabelle:** `node $N/preis-nachtrag.cjs`, siehe (4). Sie ersetzt `node $E/preis-entscheid.cjs`, dessen Bausteine der
Spike × 6–14 zu klein fand.
