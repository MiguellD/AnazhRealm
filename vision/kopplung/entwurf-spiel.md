# Entwurf vom Spiel her — was der Spieler sieht und auslöst

Winkel: das Spiel. Jede Größe steht hier, weil eine Szene sie braucht, die der Spieler sieht oder auslöst.
Gelesen: CLAUDE.md (DIE GOLDENE DEFINITION), `brief-entwurf.md`, `vision/kopplung/tafel.md` ganz, der Code an den genannten
Zeilen, die Station über `git show origin/koordination:meisterkarte-quelle/punkte/stationen/g1.js` (Kopie
`…/scratchpad/entwurf-spiel/g1.js`, zitiert als k:g1.js). Die Bruch-Namen (B1–B8, K1–K16, Z1–Z29, FS, TS, TL, UB, EB, SP, A1–A4)
sind die der Tafel.

---

## 0. Was lief, was nicht lief

Alle Skripte liegen in `S = /tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/entwurf-spiel/`.
Jeder Lauf dauerte unter 60 s. Die Kern-Läufe laden `phyto-core.js` im node; die übrigen sind reine Rechnung mit
abgeschriebenen Gesetzen (Quelle im Kopf jedes Skripts).

| Befehl | Was | Zahl |
|---|---|---|
| `node $S/ort-feuchte.cjs /home/user/AnazhRealm` | Brennstoff-Feuchte am Ort über 48 Welt-h, 3 Saaten × 3 Orte, dt 5 s. V0 = heute, V1 = Feuchte-Physik ohne Tor, V2 = V1 + Tor der Luftmasse | Gras brennbar: V0 0,0–0,2 % · V1 0,0–0,1 % · V2 31,0–31,8 %. Brandwetter (M < 0,12 und U10 ≥ 4): V0 0,0–0,1 % · V2 16,7–17,2 %. Regen-Anteil V0 61,9–64,2 % · V2 32,8–33,2 %. Längstes Gras-Fenster V0 0–3,6 min · V2 16,9–18,4 min. Regen-Ende → sichtbar trocken (M < 0,35) V2 2,6–2,7 min; → Gras zündet (M < 0,12) V2 7,4–7,7 min (V1: nie) |
| dasselbe | Kosten und Gestalt von `wetterAt` | 254–264 ns je Frage; `wetterAt(x + zug·d, t + 1) = wetterAt(x, t)` in 2000/2000 Fällen |
| `node $S/front.cjs` | Nachbau von `_brandTempo` (feld-brand.js:302–338) gegen CSIRO-Gras und Alexander 1985 | U10 6 m/s, M 0,06: R 0,748 m/s gegen CSIRO 1,507 (× 0,50), L/B 2,81 gegen 1,90, Flamme 2,73 m, I 2310 kW/m, Schmerz ≤ 44 m, Holz zündet ≤ 8,8 m. U10 1,44: R 0,078 gegen 0,233 (× 0,34) |
| `node $S/band.cjs` | dasselbe an den Wind-Stufen der Zeilen, die das Tor trocken lässt (Böe ± 18 %) | bewoelkt/regen U10 6,9–9,9 m/s: × 0,57–0,85 CSIRO, L/B 3,34–6,07 gegen Alexander 2,21–3,65. bewoelkt 5,9: × 0,49. Sturm 19,7–28,3: × 0,30–0,61 (die Wind-Kappe 0,9·IR, feld-brand.js:330). nebel 2,0–2,8: × 0,26–0,28 |
| `node $S/szene72.cjs` | die Brand-Szene der Station bei U10 7,2 m/s | M 0,06: 60 s → Spitze 64 m; 300 s → 322 m, 2,38 ha = 93 Zellen, Saum 45; 900 s → 965 m, 837 Zellen, Saum 134, 1,9 Zellen/s fangen. M 0,09: 60 s → 47 m; 300 s → 234 m, 1,26 ha = 49 Zellen |
| `node $S/szenen.cjs /home/user/AnazhRealm` | Tag/Nacht, Funktion gegen Takt, Kosten, Lösch-Linie, Mäander, Pixel | Gras zündet Tag 33,5 % / Nacht 32,2 %; trocken UND U10 ≥ 6: 18,0 %. Funktion (Fenster 1500 s) gegen getickt: höchstens 5,51·10⁻⁵ kg/kg, Urteil verschieden 0/65. Ein Schritt 407 ns, eine Funktion 106,6 µs. Gras erstickt nach 5,4 s (regen 6 mm/h) / 3,3 s (sturm 10) / 26,7 s (bewoelkt 1,2); die Lösch-Linie läuft 59 / 36 / 294 m hinter dem Rand des Bands. Mäander > 20° in 43,8 % der Zeit, höchstens 41,3° → Faktor 0,485. 500 m: 1,41 px/m, Flamme 3,8 px (540 Zeilen: 1,9), Zelle 23 px, Glut-Saum 7,0 px, Rauch 100 m = 141 px |
| `node $S/rest.cjs` | FM1-Bett, Rauchfahne, Gleichgewichts-Feuchte, Rauch-Temperatur | FM1-Norm-Bett × 0,17–0,45 CSIRO (der Abstand ist das Modell, nicht EB5). Eine 64-m-Kachel bei I 2310: 56 g/s PM2,5; windab 100 / 500 / 1000 / 2000 m: 66 / 3,3 / 1,02 / 0,34 mg/m³, Sicht 15 / 293 / 960 / 2905 m. EMC 15 Uhr 5,5–10,7 %, 3 Uhr 9,9–26,5 % (feuchte 0–0,8). Rauch 300 K gegen 291 K: Auftrieb × 1,0102 |
| `node $S/leib.cjs` | Wärme am Leib und am Holz vor der Front | I 2407 kW/m: 3 m → 38,3 kW/m², 1. Grad nach 0,6–1,0 s, Holz zündet nach 6 s; 10 m → 11,5 kW/m², Holz nie. I 3311: 10 m → 15,8 kW/m², Holz nach 36 s |
| `node $S/preis.cjs` | Kosten der neuen Leser-Fragen | Rauch am Ort über 40 Kacheln 822 ns; Wärme am Ort über 134 Saum-Zellen 3292 ns |

**Nicht gelaufen:** nichts im Wirt, kein Fenster, keine GPU. Nicht gemessen sind: die Kosten von `_bodenFarbeAt`; die Last aus der
gezeichneten Bedeckung gegen `lebendig` an der Mess-Wiese; die Station selbst; jede Radeon- und GTX-Zahl; der Streifen im
Shader; die Takt-Rate des Bewohner-Wirts; die Reihenfolge Grundstellung → Stand beim Laden. Die 3,7 µs je Zell-Schritt sind ein
Zitat (feld-brand.js:458), am Kopf nicht gemessen.

---

## 1. Die Szenen und ihre Pflicht-Größen

| Szene | Pflicht-Größe | Einheit | Auflösung | Latenz | Quelle heute | Bruch |
|---|---|---|---|---|---|---|
| **FUNKE** Fackel (kampf.js:2436–2450), Brennglas (koerper-fahrt.js:2294, :2355), DSL (`lava` feld-dsl.js:991–994 → `_lavaZuendet` siedlung-wege.js:621–626; kein DSL-Op ruft `_brandEntfachen`) | Brennstoff-Feuchte M am Ort; Grenze mx der Bett-Zeile; Bett-Art; Einstrahlung E an der Linse; der GRUND einer Absage | kg/kg; W/m² | M je 16-m-Zelle; Bett 2 m | ≤ 5 s Welt | M = 0,06 + 0,29·boden + 2,5·naesse (feld-brand.js:282–285), naesse EIN Skalar der Welt; E nur unter dem Wort „sunny" (koerper-fahrt.js:2294); die Absage ist ein Satz für alle Gründe (kampf.js:2448, daten.js:2328) | B3, B2, K1, K3, Z15 |
| **WINDRICHTUNG** Gras, Rauch, Wolken, Front | Richtung θ und Stärke U10 am Ort | rad; m/s | θ ortlos je t; U10 je Band (km) × Form (16 m) | je Bild | θ: Mäander ±41° gegen θ0 (phyto-core.js:4357, Z11); U10: das Wort am Spieler für jeden Ort (stoff-material.js:239); Planeten-Wind tot (planet-core.js:2336, TS3) | Z11, Z12, TS3 |
| **REGENFRONT** löscht örtlich; Wiese trocknet sichtbar | Regen P am Ort; Film (freies Wasser über Faser-Sättigung) | mm/h; 0–1 | 4 m längs der Front-Achse | ≤ 5 s Welt | EINE Nässe der Welt, binäres Ziel (bild-himmel.js:3078–3080) → Brand (feld-brand.js:284) und Shader (bild-himmel.js:3082) | B3, UB8, UB10, SP2, EB2, EB3 |
| **VERBRANNTE SCHNEISE** schwarz, Asche, verkohlte Stämme; bleibt; kein Brennstoff mehr; Totholz und Bauten brennen | Asche/Narbe am Ort; Last; Wärmestrom q am Werk; Zündzeit t_ig | 0–1; kg/m²; kW/m²; s | 2 m (Maske); 16 m | 1 s Welt | Bild ≤ 32 Zellen bis 160 m (feld-brand.js:930, :937); Last = `lebendig` (feld-brand.js:222, :302), nie verbraucht; Bäume verschwinden in der Narbe (vegetation-wiese.js:2196–2209); Tag `brennbar` ohne Feuer-Leser (bau-vorlagen.js:1769) | B5, B6, K5, Z20 |
| **NACHWUCHS** | Fortschritt der Sukzession = ∫ Wuchs dt; Wasser des Bodens aus dem Regen am Ort | Prozess-h; 0–1 | 10 m längs der Front-Achse | O(1) je Frage | `a.w` einmal beim Schreiben gefroren (vegetation-wiese.js:2217; feld-brand.js:563) | K6 |
| **WESEN** Tiere fliehen Front und Rauch; Bewohner meiden die Front, gehen bei Regen AM ORT hinein; Feuer verletzt den Leib | Rauch C am Tier; Ankunft der Front je Zelle; P am Bewohner; q und Dosis am Leib | mg/m³; s; mm/h; kW/m², (kW/m²)^(4/3)·s | 64-m-Kachel; 16 m | 1 s | Furcht nur auf Glut ≤ 22 m (kreatur-furcht.js:87–103); Bewohner lesen das Wort am Spieler (siedlung-bewohner.js:2223); kein Feuer ruft `damagePlayer` (koerper-seele.js:317–319, TL1) | K4, TS10, TL1, TL3, Z8 |
| **FERNE** Brennstoff überall aus dem Samen; ein Feuer ist aus 500 m sichtbar | Bett-Art und Last als Funktion; Glut und Rauch je Kachel im Fern-Bild | — | 2 m; 64 m bis 1 km | 1 s | Bett nur am gebauten Ring, sonst still `_terrainMaterialAt` (gelaende-kollision.js:1130–1133, FS1); Laub nur im Fenster (siedlung-wege.js:421–440, FS2); Bild-Kappe 160 m (B6) | FS1, FS2, B4, B6 |
| **ROTE STATION** | Anteil des Betts; Uhr des Spiels; Abstand der Spitze | — | 16 m | 1 s | `anteil = f.leb / lebendig` = 1 (k:g1.js:1424–1425, A1); nur `_tickBrand` tickt (A4); `zellen ≥ 1` prüft Existenz (A3) | A1, A3, A4, TL2 |
| **PREIS** | ms je Bild gebunden an Saum und Schirm | ms | — | — | 3,7 µs je Zell-Schritt (Zitat), Budget 0,25 ms ≈ 68 Zellen, Bild 160 m ≈ 314 Zellen | — |

Die Antworten der Szenen in einem Satz je Szene:
- **FUNKE:** Die Fackel zündet, wo am Ort M < mx (Gras 0,12, Laub 0,25) und ein Bett liegt. Sonst sagt sie den Grund mit Zahl
  („Gras feucht: 0,21 kg/kg über 0,12 — zündet in etwa 5 min"). Der Spieler SIEHT nass am Film (M ≥ 0,35 dunkelt die Albedo).
  Im Zwischenband 0,12 ≤ M < 0,35 qualmt die Fackel ohne Flamme: ein Rauch-Hauch an der Kontaktstelle.
- **WINDRICHTUNG:** EINE Richtung θ(t) = θ0 + Mäander × 0,485 (±20°). Gras, Rauch und Brand lesen θ(t); Wolken und Front ziehen
  auf θ0. Der Abstand bleibt ≤ 20° (wetter-welt#2).
- **REGENFRONT:** Der Regen fällt im Band, das über den Ort zieht. Er löscht die Front 36–59 m hinter dem Rand des Bands (regen und
  sturm), auf der trockenen Seite brennt sie weiter. Die Wiese ist 2,6–2,7 min Welt (≈ 65 Prozess-min) nach dem Band sichtbar
  trocken und zündet nach 7,4–7,7 min Welt (≈ 3 Prozess-h).
- **SCHNEISE:** Die Asche nimmt die Last (× (1 − Asche)). Stämme stehen verkohlt, bis die Sukzession den Wald bringt. Ein Werk
  zündet, wenn q seine Zündzeit trägt (≤ 8,8 m vor einer 2310-kW/m-Front).
- **NACHWUCHS:** Der Fortschritt integriert den Wuchs am Ort samt Regen. Ein trockener Hügel heilt langsamer als ein Bachufer.
- **WESEN:** Die Herde flieht ab 1 mg/m³ (Sicht < 1 km), das trifft 300 m–1 km windab einer brennenden Kachel. Bewohner verlassen
  Zellen mit Ankunft < 60 s und gehen bei P an IHREM Ort hinein. Der Leib nimmt Schaden aus der Dosis q^(4/3)·t.
- **FERNE:** Gras liegt, wo die Farb-Funktion des Bodens Grün sagt, überall. Ab 160 m zeichnet je glühender 64-m-Kachel ein
  Glut-Saum (7 px auf 500 m) und eine Rauchsäule (141 px).

---

## 2. DAS GESETZ

> **Jede Größe, die das Feuer und seine Zeugen lesen — Regen P, Wind θ und U10, Luft T und Td, Brennstoff (Art, Last) und
> Brennstoff-Feuchte M —, ist EINE Funktion von Samen, Ort und Welt-Uhr. Getickt wird nur die Front auf den 16-m-Zellen, die
> brennen oder auf ihre Ankunft warten. Gespeichert wird nur das Delta: Narbe, aktive Front, Taten.**

### 2.1 Signaturen (SI)

| Funktion | Ort | Rückgabe | Gesetz |
|---|---|---|---|
| `wetterAt(saat, x, z, t, ort)` | phyto-core.js:4423 (erweitert) | `{zeile, front, feuchte, regenMmH, windMs}` | `regenMmH` = 10 · row.rain · ss(0,4; 0,6; feuchte) [mm/h]; `windMs` = row.wind · `sturmMS` 24 [m/s, ohne Böe]; `zeile`, `front`, `feuchte` byte-gleich |
| `windRichtung(saat, t, ort)` | phyto-core.js:4354 | Einheitsvektor | θ = θ0 + 0,485·(0,5 sin(0,009t + φ1) + 0,22 sin(0,0257t + φ2)); θ0 = atan2(ort.windX, ort.windZ), wo ein Δ des Orts besteht, sonst `windGrund(saat)` |
| `brennFeuchteSchritt(M, T, Td, P, dtP)` | phyto-core.js (neu, rein) | M [kg/kg] | EMC = Simard(T, rF), rF = e_s(min(Td, T))/e_s(T) (Magnus); M ← EMC + (M − EMC)·e^(−dtP/3600 s); bei P > 0: M += 0,425·P·(dtP/3600)·e^(−100/(251 − 100M)), M ≤ 2,5 |
| `regenTafel(saat, ort)` | phyto-core.js (neu, rein, gemerkt je Saat und Ort) | drei Präfix-Tafeln über s̃, 10 m: ΣP [mm], θ_regen [0–1], ∫θ_regen | Die Geschichte eines Orts liegt auf der Front-Achse: s(t′) = s̃ − zug·t′ (2000/2000) |
| `taupunktAus(feld, saison, feuchte)` | gelaende-core.js (neu, neben `TEMPERATUR` :1313) | Td [°C] | Td = Tagesmittel(y, saison) − 15 K·(1 − feuchte); im Regen Td = T |
| `temperaturAus(feld, saison, uhr, wetter)` | gelaende-core.js (unverändert) | T [°C] | `uhr` = frac(`_weltTag()`) (feld-leben.js:2604), nie `timeOfDay` |
| `_feuchteAm(x, z, y, t)` | stamm/bild-himmel.js (neu) | M [kg/kg] | geschlossen: 300 Schritte Δ 5 s über H = 1500 s = 10τ, Raster global ⌊t/5⌋·5, Start EMC; aktive Zellen ticken denselben Schritt weiter |
| `_regenAm(x, z, t)` | stamm/bild-himmel.js (neu) | P [mm/h] | `wetterAt(...).regenMmH`, im Kreis einer Regen-Tat deren Zeile |
| `_filmAm(s̃)` / Streifen | stamm/bild-himmel.js → Shader | Film [0–1], Bedeckung [0–1], U10-Faktor | Film = clamp((M − 0,35)/(2,5 − 0,35)); 500 Texel × 4 m über s̃ ± 1 km um das Auge |
| `_kontaktStoffAt(x, y, z)` | stamm/gelaende-kollision.js:1121 | Stoff | „gras" bei Grün von `_bodenFarbeAt` (gelaende-boden.js:2536) ≥ ½, „laub" bei Wald-Dichte `auraAt().lebendig` ≥ ½; nie die gebaute Karte |
| `_brandEntfachen(x, z, …)` | stamm/feld-brand.js:343 | `{ok}` oder `{grund, M, mx, etaS}` | `grund` ∈ kein-bett · nass · asche · wasser; `etaS` = erste Zeit, zu der M < mx, aus demselben Gesetz vorwärts |
| `_brandWaermeAm(x, z)` | stamm/feld-brand.js (neu) | q [kW/m²] | Linienquelle χr·I/(2πd), nächste Saum-Zelle, I = H·w·R (feld-brand.js:437) |
| `_rauchAm(x, z, y)` | stamm/feld-brand.js (neu) | C [mg/m³] | Summe der Gauß-Fahnen je brennender 64-m-Kachel, Briggs D, Quelle = Verbrauch · 7 g/kg |
| `_brandAnkunftAm(x, z)` | stamm/feld-brand.js (neu) | s bis zur Ankunft, ∞ ohne Brand | die Ankunftszeit der wartenden Zelle (`_brandZuenden` :373–449) |

s̃ ist die Orts-Koordinate der Front: s̃ = x·dx + z·dz + biegeM·sin(2πq/querM + b) (phyto-core.js:4430–4431 ohne den Term
−zug·t). Ein Ort hat ein s̃, für alle Zeit.

### 2.2 Raster

| Raster | Zelle | Ursprung | Wer |
|---|---|---|---|
| Brand-, Leben- und Hydro-Zelle | 16 m | ⌊x/16⌋ (kampf.js:2444; Hydro-Ursprung −1024 = −64 Zellen, deckungsgleich) | Front, M je aktive Zelle, Ankunft |
| Bett-Maske | 2 m (16 m / `bettGitter` 8) | wie die Zelle | Bett-Art, Asche, Flammen |
| Kachel | 64 m (`blockZellen` 4) | wie die Zelle | Rauch-Quelle, Fern-Glut, Furcht-Suche |
| Streifen | 4 m über s̃ | s̃ des Auges ± 1000 m | Film, Bedeckung, U10-Faktor im Shader |
| Regen-Tafel | 10 m über s̃ | s̃ = 0, wächst beidseitig auf Anfrage | ΣP, θ_regen, ∫θ_regen |

### 2.3 Uhren

| Uhr | Takt | Was | Quelle |
|---|---|---|---|
| Welt-Uhr `spielZeit` | 1 s Welt (`schrittS`) | Front, Flamme, Zündzeit, Leib-Dosis, Furcht — was der Spieler brennen SIEHT, läuft 1:1 | feld-brand.js:897ff |
| Prozess-Uhr = 24 × Welt-Uhr | Δ 5 s Welt, globales Raster | Regen [mm/h], Timelag τ 1 h = 150 s Welt, EMC, Film, Wasser des Bodens, Sukzession | `PEGEL_TAG_S` = 3600 s (daten.js:165) = 1 Prozess-Tag |
| EIN Tag | frac(`_weltTag()`) | Temperatur, Taupunkt, Sicht-Himmel | feld-leben.js:2604. Der Regler schreibt `worldMeta.tagNull` (reist zu jedem Mitspieler), `timeOfDay` ist ihr Spiegel |

### 2.4 Ein Schreiber je Größe

| Größe | Einziger Schreiber | Fällt |
|---|---|---|
| P, U10, θ, feuchte, Zeile | phyto-core `wetterAt` / `windRichtung` | das Wort als Physik-Quelle |
| T, Td | gelaende-core `temperaturAus` / `taupunktAus` | `timeOfDay` als Prozess-Uhr |
| M, Film | `_feuchteAm` + Streifen (bild-himmel.js) aus `brennFeuchteSchritt` | `state.naesse`, `_naesseTakt`, NAESSE |
| Wasser des Bodens, ΣP am Ort | `regenTafel` | `wm.nassTage` |
| Bett-Art, Last | `_kontaktStoffAt` über `_bodenFarbeAt` und `auraAt` × (1 − Asche) | die gebaute Boden-Karte als Bett |
| Front, Ankunft | `_brandZuenden` / `_brandSchritt` | — |
| Narbe, Asche | Tat `brand` (feld-brand.js:575) | — |
| Regen der Spieler-Tat | Tat `regen` aus dem DSL-Op `weather` (feld-dsl.js:943) | das globale Spieler-Wort als Physik |

### 2.5 Leser

Die Regel: **Physik-Leser lesen den ORT, Erlebnis-Leser lesen das WORT am Spieler.**
- Physik am Ort: Brand, Fackel, Brennglas, Lava-Zündung, Reifen, Shader-Film und Pfütze, Regen-Partikel am Auge, Wuchs und
  Sukzession, Werk-Alter, Bewohner, Tiere, Leib.
- Erlebnis am Wort: Gemüt, Journal, Musik, Ton des Himmels, Nexus, Katalog — `_weatherIsWet` (bild-himmel.js:2861) bleibt dort.
- Das Wort am Spieler bleibt eine Lesung desselben Gesetzes, kein Zwilling. Der Wetter-Zug (dirigent-takt.js:1714–1740) spricht
  es aus der Zeile am Spieler. Eine `regen`-Zeile, die das Tor trocken lässt, spricht `cloudy`; ein trockener `sturm` bleibt
  `stormy` (Wind ohne Regen).

---

## 3. HERLEITUNG — GESETZT → FOLGT

Marken: **belegt** (Quelle) · **gewählt** (Grund) · **unsicher**.

**3.1 Der Regen bekommt eine Einheit.**
- GESETZT: Pegel 1 ≙ 10 mm/h (gelaende-core.js:1579) — belegt durch den Anker des Stamms.
- FOLGT: P = 10 mm/h · rain. regen 6, sturm 10, bewoelkt 1,2 mm/h (EB2 heilt).

**3.2 Die Raffung folgt aus dem Pegel-Tag.**
- GESETZT: `PEGEL_TAG_S` 3600 Welt-s = 1 Prozess-Tag (daten.js:165).
- FOLGT: Raffung 24. Timelag τ 1 h (belegt: 1-h-Brennstoff, Fosberg/NFDRS) = 150 s Welt. Das Fenster H = 10τ = 1500 s trägt die
  Funktion: höchstens 5,51·10⁻⁵ kg/kg gegen den Takt, 0/65 Urteile verschieden.

**3.3 Die Feuchte-Physik.**
- Gleichgewichts-Feuchte Simard 1968 (belegt), Magnus (belegt, Alduchov & Eskridge 1996), Benetzung Van Wagner 1987 Gl. 3a
  differentiell (belegt), Deckel 2,5 kg/kg (belegt, Matthews 2006; derselbe `feuchte.nass` feld-brand.js:975).
- Faser-Sättigung 0,35 (belegt; `feuchte.faser` des Stamms) ist die Schwelle des Films.
- FOLGT: V1 allein heilt NICHT. Gras brennbar 0,0–0,1 % (V0: 0,0–0,2 %), denn jede Zeile mit Wind ≥ 0,3 trägt Regen ≥ 0,12 (B2).

**3.4 Das Tor der Luftmasse ist der Chokepoint.**
- GESETZT: `wetterAt.feuchte`, die 31-km-Welle (heute ohne Leser, TS2).
- Gewählt: das Tor ss(0,4; 0,6) — Regen nur, wo die Luftmasse Wasser trägt. Gewählt und unsicher: der Taupunkt-Abstand 15 K der
  trockensten Luftmasse (SMAX). Der erste Ansatz Td = 18 − 15·(1 − feuchte)·max(0, 1 − f/0,6) machte die Luft zu feucht (Gras
  1,5–1,8 %) und ist verworfen.
- FOLGT (V2): Regen 61,9–64,2 % → 32,8–33,2 % der Zeit. Gras brennbar 0,0–0,2 % → 31,0–31,8 %. Brandwetter 0,0–0,1 % →
  16,7–17,2 %. Längstes Fenster 0–3,6 → 16,9–18,4 min Welt. Trocken UND U10 ≥ 6 m/s: 18,0 % der Zeit. Die Zeile, Bewölkung und
  Licht bleiben byte-gleich; nur der Regen sitzt an der Luftmasse.

**3.5 Die Feuchte ist eine Funktion des Orts.**
- GESETZT: `wetterAt` hängt von (x, z, t) nur über s ab (phyto-core.js:4430–4431; 2000/2000).
- FOLGT: Die Regen-Geschichte eines Orts ist ein Stück der Front-Achse. Der Film ist ein 1-D-Streifen über s̃, die
  Präfix-Tafeln geben ΣP und ∫θ in O(1). Der Tagesgang hängt an t, nicht an s. Deshalb tickt der Streifen (Δ 5 s), statt fest zu
  stehen.
- Unsicher: der Streifen rechnet mit der Höhe des Auges. Die Höhe wirkt nur über die EMC, der Film liegt darüber; nicht gelaufen.

**3.6 Regen löscht örtlich.**
- FOLGT: Gras von M 0,06 erstickt nach 5,4 s (6 mm/h), 3,3 s (10 mm/h), 26,7 s (1,2 mm/h). Bei Zug 11 m/s steht die Lösch-Linie
  59 / 36 / 294 m hinter dem Rand des Bands.
- Heute löscht jeder Regen am Spieler jeden Brand der Welt (B3; 6,1 s).

**3.7 Die Wiese trocknet sichtbar.**
- FOLGT: Regen-Ende → Film weg 2,6–2,7 min Welt (≈ 65 Prozess-min) → Gras zündet 7,4–7,7 min Welt (≈ 3 Prozess-h).
- Heute trocknet der Film in 10,3 min Welt (UB10), und Brandwetter (M < 0,12 und U10 ≥ 4) besteht nur in 0,0–0,1 % der Zeit.

**3.8 Die Windrichtung.**
- GESETZT: Mäander höchstens 41,3° gegen θ0, > 20° in 43,8 % der Zeit (Z11).
- Gewählt aus der Sprosse wetter-welt#2 („±20°"): Faktor 0,485. FOLGT: höchstens 20,0°.
- θ0 aus dem Planeten, wo ein Δ des Orts besteht (planet-core.js:2336, TS3). Die Heimat liest den Planeten nie
  (gelaende-core.js:5694) und behält `windGrund(saat)`.
- U10 bleibt Zeile × 24 m/s (EB1, GESETZT); das heilt der Entwurf nicht.

**3.9 Die Front.**
- GESETZT: `_brandTempo` (Rothermel/Albini, feld-brand.js:299–338) unverändert.
- Unabhängiges Soll: CSIRO-Gras (Cheney, Gould & Catchpole 1998) für das Tempo (belegt); Alexander 1985 für L/B (belegt für Wald,
  unsicher für Gras).
- FOLGT: In den Zeilen, die das Tor trocken lässt (bewoelkt/regen, U10 6,9–9,9 m/s), liegt der Code bei × 0,57–0,85 CSIRO, im
  Band [½, 2]. Bei 5,9–6 m/s liegt er bei × 0,49–0,50, auf der Kante. Im trockenen Sturm (19,7–28,3 m/s) liegt er bei
  × 0,30–0,61 (Wind-Kappe).
- Das FM1-Norm-Bett ist noch langsamer (× 0,17–0,45). Der Abstand ist also das Modell, nicht EB5.

**3.10 Rauch und Wärme an Wesen.**
- Gauß-Fahne Briggs 1973 offenes Land, Klasse D (belegt); EF PM2,5 7 g/kg (unsicher, Andreae & Merlet 2001); MEE 4 m²/g (unsicher);
  Koschmieder 3,912/b (belegt).
- Gewählt: Flucht-Schwelle 1 mg/m³ = Sicht 978 m. FOLGT: Sicht < 1 km bis 1000 m windab einer Kachel; der Auftrieb der Fahne ist
  vernachlässigt (unsicher).
- Linienquelle mit χr 0,3 (unsicher). Schmerz 2,5 kW/m² und geführte Holz-Zündung 12,5 kW/m² (belegt). kρc 0,15 (Kiefer, unsicher).
  Dosis-Band 1. Grad 80–130, 2. Grad 240–730 (kW/m²)^(4/3)·s (unsicher, TNO/Hymes).
- FOLGT: 3 m vor einer 2407-kW/m-Front 38,3 kW/m², 1. Grad nach 0,6–1,0 s. Holz zündet nur ≤ 8,8–10 m vor der Front.
- Rauch-Temperatur 300 K gegen die Luft am Ort: × 1,0102 im Auftrieb. Z26 fällt wegen der einen Quelle, nicht wegen der Wirkung.

**3.11 Das Brennglas.**
- GESETZT: Der Fleck strebt mittags gegen ≈ 570 K über der Luft und ist linear in der Einstrahlung (koerper-fahrt.js:3254–3258).
- FOLGT mit E = 1000 W/m² · sun(Zeile an der Linse):
  - bewoelkt (sun 0,32) → ≈ 182 K über der Luft, unter den 237 K, die Gras braucht (533 K gegen 296 K) → kein Funke;
  - klar → Funke;
  - nebel (0,48) → ≈ 274 K, aber das Bett ist nass (rF 100 %) → Absage „nass".

**3.12 Der Nachwuchs.**
- GESETZT: TAT_NARBE brand 72 Prozess-h (feld-leben.js:3098) = 180 min Welt; Stufen asche [0,08; 0,3], busch [0,3; 0,6], wald
  [0,6; 1] (vegetation-wiese.js:2120).
- FOLGT bei w = 1: Gras nach ≈ 54 min Welt, Busch ≈ 108 min, junger Wald ≈ 180 min.
- Wasser = basis + (1 − basis)·(θ_h + (1 − θ_h)·θ_regen); basis 0,75 (vegetation-wiese.js:2078–2090).
- Gewählt und unsicher: θ_regen = 1 − e^(−A/25 mm) mit A = Σ P·e^(−Δt/5 Prozess-Tage). Nicht gelaufen.

**3.13 Der Tagesgang.**
- FOLGT: Tag 33,5 % gegen Nacht 32,2 % — der Tau trägt fast nichts. Unsicher; es hängt an SMAX.

---

## 4. WAS FÄLLT

Die drei größten Stellen zuerst.

**1. Die EINE Nässe der Welt `state.naesse` — Schreiber und alle Leser, als Klasse.**
- Schreiber: `_naesseTakt` bild-himmel.js:3060–3087 (binäres Ziel :3078, Zustand :3080, Uniform :3082, `wm.nassTage` :3076);
  Konstanten NAESSE stoff-material.js:3788–3803.
- Leser:
  - Brand: feld-brand.js:284.
  - Reifen: koerper-fahrt.js:1811.
  - Lava-Merk: siedlung-wege.js:626.
  - Stand: speicher-laden.js:2685–2688.
  - Regen-Ruhe: bild-himmel.js:1075, :1084.
  - Shader: stoff-material.js:2119–2250 (über `atmoUniforms.naesse`); stoff-karte.js:1292–1295.
  - Werk-Alter: siedlung-satz.js:797, :1372 (`nassTage`, `geburtNass`).
- Ersatz: `_feuchteAm` (Physik), der Streifen (Shader) und `regenTafel` ΣP am Ort (Werk-Alter).
- Heilt B3, K1, FS4, SP2, UB8, UB10, EB3 und die Örtlichkeit von kaskade#1.

**2. Der Regen am Wind geklebt — die Zeilen von `WX_GESETZ` (phyto-core.js:4287–4293).**
- Bruch: Jedes Wort mit Wind ≥ 0,3 trägt Regen ≥ 0,12 (B2).
- Ersatz: Das Tor der Luftmasse in `wetterAt` liest `.feuchte` (TS2).
- Heilt B2, K3, TS2, EB2. Gras brennbar 0,0–0,2 → 31,0–31,8 %.

**3. Das Bett aus der gebauten Bild-Karte.**
- Bruch: `_kontaktStoffAt` gelaende-kollision.js:1130–1133 (FS1, B4) und Laub nur im Fenster siedlung-wege.js:421–440 (FS2) als
  Bett-Quelle. Die Last ist Saat-Rauschen und wird nie verbraucht (feld-brand.js:222, :302; B5).
- Ersatz: Grün der Farb-Funktion `_bodenFarbeAt` (gelaende-boden.js:2536 — die Haupt-Faden-Form von voxel-worker.js:3381) und
  Wald-Dichte `auraAt().lebendig`; Last × (1 − Asche).
- Heilt FS1, FS2 als Bett-Quelle, B4, Z1, den Verbrauch aus B5. Das Feuer brennt auf jedem Mitspieler gleich, weil kein Bett mehr am
  eigenen Chunk-Ring hängt.

**Weiter fallen:**

| Stelle | Datei:Zeile | Heilt |
|---|---|---|
| Station: der Anteil aus dem alten Vertrag | k:g1.js:1424–1425 | A1, TL2 |
| Station: eigene Uhr, gesetzte Wörter | k:g1.js:1395–1403, :1596 | A4, UB11 |
| Station: Existenz statt Abstand | k:g1.js:1660 (`zellen >= 1`) | A3 |
| Wind-Stärke aus dem Wort am Spieler | stoff-material.js:239 | Z12 (Stärke), Z8 |
| Mäander ±41° | phyto-core.js:4357 | Z11 |
| Planeten-Wind tot | planet-core.js:2336 → `ORT_FELDER.wetter` gelaende-core.js:5701 trägt windX/windZ | TS3 |
| Temperatur an der Sicht-Uhr; freie Tag-Länge der Seite | bild-himmel.js:2879; :2634–2635 | UB1, Z16 |
| Das Wort als Physik-Quelle (Wetter-Zug am Spieler) | dirigent-takt.js:1733 | FS8 verliert jeden Physik-Leser |
| Bewohner-Regen ohne Ort | siedlung-bewohner.js:2223 | Z8, TL3 |
| Brennglas hinter dem Wort | koerper-fahrt.js:2294 | Z15 |
| Spieler-Wetter global | feld-dsl.js:943 | wird Tat `regen` mit Ort |
| Gefrorener Wuchs der Tat | vegetation-wiese.js:2217; feld-brand.js:563 | K6 |
| Die Nachbarin erbt die Feuchte | feld-brand.js:448 | B7 |
| Boden-Feuchte einmal je Brand | feld-brand.js:218–219, :268 | B8, SP6 |
| Rauch mit 300 K | feld-brand.js:746 | Z26 |
| Bild-Kappe 32 Zellen / 160 m als einziges Bild | feld-brand.js:930, :937 | B6 |
| fbm-Wolke mit globaler Schwelle; `cloudCover` aus dem Wort | welt-licht.js:901–944; bild-himmel.js:1763 | Z14, Z10 |
| Tag `brennbar` | bau-vorlagen.js:1769, :1879, :1931 | Z20 |
| Furcht nur auf Glut | kreatur-furcht.js:87–103 | TS10, K4 |
| Baum verschwindet in der Narbe | vegetation-wiese.js:2196–2209 | verkohlter Stamm |
| Kein Feuer-Rufer von `damagePlayer` | koerper-seele.js:317–319 | TL1, K4 |
| Eine Absage für alle Gründe | kampf.js:2448; daten.js:2328 | der Grund mit Zahl |
| Brand stirbt beim Reload | feld-brand.js:204; Stand speicher-welten.js (neben :1306) | SP1 |

---

## 5. PREIS

### 5.1 Was eine Funktion ist und was nicht

| Feld | Funktion von (Samen, Ort, Zeit)? | Kosten |
|---|---|---|
| P, U10, θ, Zeile | ja, geschlossen | 254–264 ns |
| T, Td | ja, geschlossen (`temperaturAus`) | nicht gemessen; O(1) |
| M | ja, als Fenster-Integral (H 1500 s); aktive Zellen ticken | 106,6 µs als Funktion; 407 ns je Schritt |
| Film, Bedeckung, U10-Faktor | ja (aus M und Zeile); der Streifen tickt um das Auge | 407 ns je Texel und 5 s |
| ΣP, θ_regen, ∫θ_regen | ja, Präfix-Tafeln über s̃ | O(1) |
| Bett-Art, Last | ja: Samen + Taten (Asche) | `_bodenFarbeAt` nicht gemessen |
| **Front** | **nein**: Die Ankunftszeit ist ein kürzester Weg vom Herd durch ein zeitlich wechselndes R-Feld. Eine Frage kostet ∝ verbrannte Fläche, nie O(1). Darum tickt sie, und ihr Delta (Saum, Asche) wird gespeichert | 3,7 µs je Zell-Schritt (Zitat) |
| Rauch C, Wärme q, Ankunft | ja, gegeben die Front | 822 ns (40 Kacheln); 3292 ns (134 Saum-Zellen); Ankunft ein Map-Griff |

### 5.2 ms je Bild bei 60 Hz, gebunden an Saum und Schirm

| Posten | Menge (aus §0) | Rechnung | je Bild |
|---|---|---|---|
| Front-Schritt | Saum 9–134 Zellen (szene72, 60–900 s) | 134 × 3,7 µs je s | ≤ 8,3 µs |
| Neue Zelle: M als Funktion | 0,1–1,9 Zellen/s | 1,9 × 106,6 µs je s | ≤ 3,4 µs |
| Aktive Zellen: M ticken | ≤ 2 × 134 | 268 × 407 ns je 5 s | ≤ 0,4 µs |
| Regen an brennenden Zellen | ≤ 134 | 134 × 254 ns je s | ≤ 0,6 µs |
| Streifen, Spieler steht | 500 Texel | 500 × 407 ns je 5 s = 0,04 ms/s | 0,7 µs |
| Streifen, Spieler fährt 30 m/s längs der Achse | 7,5 neue Texel/s | 7,5 × 106,6 µs = 0,8 ms/s | ≤ 13 µs |
| Bewohner: Regen am Ort + Ankunft | 300 | 300 × (254 ns + Map) je s | ≈ 1,3 µs |
| Tiere: Rauch am Ort | ≤ 50 × 40 Kacheln | 50 × 822 ns je s | 0,7 µs |
| Spieler: Wärme am Leib | 1 | 3292 ns je Bild | 3,3 µs |
| Werke am Saum: Wärme | Werke in Kacheln mit Saum | je Werk 3292 ns je s | nicht gezählt |
| **Summe in der 900-s-Szene** | | | **≤ 31 µs** gegen Budget 250 µs |
| **Ruhe (kein Brand)** | | | **≈ 2 µs** (Streifen + Bewohner) |

- Die Kosten tragen der Saum (Änderung) und die Breite des Streifens (Schirm). Die Größe der Welt kommt nicht vor.
- Das Fern-Bild kostet ≤ 40 Kacheln × (1 Saum + 1 Säule) auf der GPU. Nicht gemessen.
- Das Budget 0,25 ms trägt ≈ 4000 brennende Zellen je Welt-Sekunde; die 900-s-Szene braucht 134.

---

## 6. BAHNEN

Jede Datei gehört genau einer Bahn. Reihenfolge: **0 → 1 → (2 ∥ 3) → 4**.
- Bahn 2 ist groß, weil die Nässe EINE Klasse ist: feld-brand.js:284 ist ein Leser von `state.naesse`. Schreiber und alle Leser
  fallen in derselben Bahn, sonst läuft zwischen zwei Bahnen ein Zwilling oder ein toter Leser.
- Abnahme jeder Bahn: `node scripts/werkbank.cjs abdruck --gegen <Basis-sha>` nennt genau ihre Dateien.

### Bahn 0 — Der Richter (zuerst, misst VORHER ROT)

- **Datei:** `koordination:meisterkarte-quelle/punkte/stationen/g1.js`.
- **Schnitt:**
  - Der Anteil liest `f.anteil` (A1).
  - Die Station läuft auf `_gameLoopTick` und setzt nie ein Wort (A4).
  - Sie wählt aus dem Gesetz die Welt-Uhr t* an der Mess-Wiese (M < 0,09, Zeile bewoelkt/regen, P = 0, U10 6,9–10 m/s) und springt
    mit `_weltUhrNimm`.
  - Sie zündet über `_fackelZuenden` (kampf.js:2436), nicht über `_brandEntfachen` direkt.
- **Glieder und Soll (alle physisch, nicht aus dem eigenen Gesetz):**
  1. **Funke:** Zündet bei t*. Bei einem t mit M ≥ 0,12 sagt die Absage „nass" mit der Zahl M (physik.feuer#1).
  2. **Kopf nach 60 s:** Abstand ≥ ½ · R_CSIRO(U10, M) · 60 s und ≥ 2 Zellen vom Herd (statt `zellen ≥ 1`); ≥ 200 warme Pixel an
     Kamera A.
  3. **Ellipse nach 300 s:** aus `_ascheAt` auf dem 2-m-Gitter. Hauptachse ±20° zu θ, L/B ≥ 1,5 und ≤ 2 × Alexander.
  4. **Örtlichkeit:** Herd B 3 km quer zur Front-Achse mit gleichem s̃. Der DSL-Op `weather rainy`, gesprochen am Herd A, ist
     derselbe Ruf vorher und nachher. A hat ≤ 60 s danach keine Flamme mehr (≤ 20 warme Pixel), B wächst weitere 300 s.
  5. **Narbe:** Asche ≥ 90 % der verbrannten Zellen; sie steht nach +1 Welt-h und nach Reload.
- **ZIELBILD:**
  - Ort: Mess-Wiese (−280,4 / −1045,6).
  - Kamera A: 20 m quer zum Wind, 12 m hoch, Blick auf den Herd. Kamera B: 60 m seitlich, 25 m hoch.
  - Nachher: nach 60 s ein Ei 47–64 m lang, die Spitze windab, ≥ 200 warme Pixel (heute +35).
  - Vorher ROT: Unter dem echten Takt zündet die Wiese in 0,0–0,2 % der Zeit, und der Regen an A löscht auch B.

### Bahn 1 — Der Kern

- **Dateien:** `phyto-core.js`, `gelaende-core.js`.
- **Schnitt:**
  - `wetterAt` gibt `regenMmH` (Tor) und `windMs` zurück; `zeile`, `front` und `feuchte` bleiben byte-gleich.
  - `windRichtung` nimmt `ort` und den Mäander × 0,485.
  - `wetterVersatz` stellt die Quoten auf die gemeinsame Verteilung von (f, feuchte), damit `regenQuote` mit dem Tor trifft.
  - Neu: `brennFeuchteSchritt`, `regenTafel`, `taupunktAus`; `ORT_FELDER.wetter` trägt windX/windZ.
  - `treeParams(…, alter = −1)` ist der verkohlte Stamm: keine Krone, Rinde im Ton der Asche. Die Werte alter ≥ 0 bleiben
    byte-gleich.
- **ZIELBILD:**
  - Ort: der höchste Hügel ≤ 1 km um die Mess-Wiese, Third, 30 m hoch, Blick windab θ0, Zeile `sturm`.
  - Man sieht: Gras-Neigung, Rauch eines Brands und Wolkenzug in einem Bild innerhalb ±20° (heute bis 41,3°).
  - Auf einer Reise mit Δ zeigt der Wolkenzug in die Richtung von windX/windZ des Planeten.

### Bahn 2 — Die Nässe fällt: Wasser und Brand am Ort

- **Dateien:** `stamm/bild-himmel.js`, `stamm/stoff-material.js`, `stamm/stoff-karte.js`, `stamm/dirigent-takt.js`,
  `stamm/koerper-fahrt.js`, `stamm/siedlung-wege.js`, `stamm/siedlung-satz.js`, `stamm/speicher-laden.js`,
  `stamm/speicher-welten.js`, `stamm/feld-dsl.js`, `welt-licht.js`, `stamm/feld-brand.js`, `stamm/kampf.js`, `stamm/daten.js`,
  `stamm/bau-vorlagen.js`.
- **Schnitt, Wasser:**
  - `_naesseTakt` und `state.naesse` sterben samt allen Lesern (§4.1).
  - Neu: `_feuchteAm`, `_regenAm`, der Streifen (Film, Bedeckung, U10-Faktor) im Shader; die Wolken-Schwelle aus dem Streifen.
  - Das Werk-Alter liest ΣP am Ort des Werks und `_brandNarbe` an seiner Grundfläche. Der Schreiber dieser Tat läuft heute schon
    (feld-brand.js:575).
  - Die Uhr: Die Temperatur liest den Tag der Welt; der Regler schreibt `tagNull`.
  - Das Brennglas liest sun der Zeile an der Linse.
  - Der Op `weather` schreibt die Tat `regen` (Ort, Radius 400 m gewählt, 600 s Welt). Das Wort am Spieler folgt §2.5.
- **Schnitt, Brand:**
  - Jede Zelle liest ihr M zum Zeitpunkt (B7, B8).
  - Last = Bett × (1 − Asche) (B5).
  - Rauch mit T am Ort; neu `_brandWaermeAm`, `_rauchAm`, `_brandAnkunftAm`.
  - `_brandEntfachen` gibt den Grund; die Fackel qualmt im Zwischenband.
  - Fern-Bild: Ab 160 m bis 1 km malt je glühender 64-m-Kachel ein Glut-Saum über `_deckeStufeMalen` und steht eine Rauchsäule; nah
    bleiben `zellenMax` 32.
  - Werke: eine Brenn-Zeile `holz`, Zündung nach t_ig(q); der Tag `brennbar` fällt (Z20).
  - Der Stand trägt die aktive Front (SP1).
- **ZIELBILD:**
  - **(a) Regenkante:** Mess-Wiese, Ego, Blick gegen θ0. Die nasse, dunkle Kante läuft mit 11 m/s auf die Kamera zu. 2,6–2,7 min
    nach dem Band ist die Albedo zurück. Die Fackel sagt bis ≈ 7,5 min „Gras feucht: … kg/kg — zündet in etwa … min" und qualmt;
    danach zündet sie.
  - **(b) Brand am Ort:** Kamera B von Bahn 0 bei U10 ≈ 7. Nach 300 s eine Spitze 234–322 m, 1,3–2,4 ha schwarz. Das Regenband
    löscht die Flammen 36–59 m hinter seinem Rand, die trockene Seite brennt im selben Bild weiter.
  - **(c) Ferne:** vom Hügel aus 500 m, 1080 Zeilen. Glut-Saum ≥ 7 px, Rauchsäule ≈ 141 px, schwarze Narben-Zellen 23 px.

### Bahn 3 — Brennstoff aus dem Samen (parallel zu Bahn 2, nach Bahn 1)

- **Dateien:** `stamm/gelaende-kollision.js`, `stamm/vegetation-wiese.js`, `stamm/vegetation-baum.js`.
- **Schnitt:**
  - `_kontaktStoffAt` liest Grün aus `_bodenFarbeAt` und die Wald-Dichte aus `auraAt`. Der stille Fall auf `_terrainMaterialAt` bei
    Gras/Laub stirbt (FS1).
  - `_tatDauer` integriert w über `regenTafel` statt `a.w` zu frieren.
  - `_baumAlter` gibt −1 (verkohlt) in der Brand-Narbe, bis die Wald-Stufe der Sukzession greift. `vegetation-baum.js` reicht −1
    an `treeParams`.
- **ZIELBILD:**
  - Ort: 2 km vom Spawn, jenseits des gebauten Rings.
  - Die Fackel auf grünem Boden zündet; auf Kies sagt sie „kein Bett".
  - In der Narbe stehen schwarze Stämme ohne Krone.
  - Im Zeitsprung kehrt bei w = 1 das Gras nach ≈ 54 min Welt zurück, der Busch nach ≈ 108 min, der junge Wald nach ≈ 180 min.
  - Am trockenen Hügel dauert es länger als am Bach.

### Bahn 4 — Die Wesen (nach Bahn 2)

- **Dateien:** `stamm/kreatur-furcht.js`, `stamm/siedlung-bewohner.js`, `stamm/koerper-seele.js`.
- **Schnitt:**
  - Die Furcht liest `_rauchAm` ≥ 1 mg/m³ und `_brandAnkunftAm` < 60 s; die Flucht geht quer zum Wind, weg vom Saum.
  - Die Bewohner lesen `_regenAm` an IHREM Ort in `tagesPlan`; die Schwelle bleibt `regen.ab` 0,3 ± 0,15 × 10 mm/h
    (koerper-core.js:5218).
  - Die Bewohner weichen Zellen mit Ankunft < 60 s über `_bewohnerWeichen` (siedlung-bewohner.js:2173–2179).
  - Der Leib nimmt Schaden aus der Dosis über `damagePlayer` mit Quelle „feuer" (der `heatResist`-Zweig bekommt seinen Rufer).
- **ZIELBILD:**
  - Ort: das Dorf neben der Mess-Wiese.
  - 0 Bewohner in Zellen mit Ankunft < 60 s.
  - Die Herde 300 m–1 km windab flieht, sobald C ≥ 1 mg/m³.
  - An der Regenkante gehen die Bewohner im Band binnen 10 s hinein (gewählt; die Takt-Rate des Wirts nicht gemessen), die
    draußen bleiben.
  - 3 m vor den Flammen nimmt der Spieler Schaden (1. Grad nach 0,4–1,0 s).

---

## 7. SPROSSEN

**Können fallen:**

| Sprosse | Bahn | Richter |
|---|---|---|
| physik.feuer#1 — Feuer-Hälfte (zündet / nass nicht) | 2 + 0 | Glied 1. Die Eis-/Lava-Hälfte (Eis trägt ±5 cm, Lava erstarrt) bedient der Entwurf nicht; diese Sprosse fällt also nur mit ihr ganz |
| physik.feuer#2 — Front 0,5–2 m/s, Halt an Fluss/Fels/nassem Gras, Regen löscht | 2 + 3 + 0 | Glieder 2–4; R 0,7–2,0 m/s bei U10 6,9–9,9. Das Soll EB8 setzt 1 ha = 39 Zellen. Die p95 ≤ 33 ms an beiden Geräten ist nicht gelaufen und bleibt die Bedingung |
| kaskade#1 — Regen löscht Brand | 2 + 0 | Glied 4 (örtlich) |
| kaskade#2 — 4 Glieder an einem Ort | 2 | P → M (Film) → Stoff (Albedo) → Brand → Licht; Festhalte-Probe: P gehalten → M steht |
| stoerung#1 — Brand schwärzt die Zelle | 2 + 3 + 0 | Glied 5 |
| stoerung#2 — Asche düngt, Gras → Busch → Wald, r(Tempo, Feuchte × Licht) ≥ 0,5 | 3 | Zeitsprung 1 Spieljahr |
| ereignis#2 — 1 ha, Bewohner weichen 100 % | 4 + 2 | Zielbild Bahn 4; die p95 im brennenden Hektar ist nicht gelaufen |
| wetter-welt#2 — eine Windrichtung ±20° | 1 | Mäander 41,3° → 20,0° |
| wetter-welt#3 — Nässe, Pfützen am Ort | 2 | Luma-Band am Ort statt eines Skalars |
| zeitreise#2 — Tat + 1 Jahr, gleich nach Reload | 2 + 3 | Stand trägt die Front (SP1); Werk-Alter aus ΣP am Ort |

**Nicht bedient (mit Grund):**
- **wetter-welt#4**, Hälfte Tiere suchen Schutz (K10): Die Herde kennt kein Gesetz des Unterstands; die Bewohner-Hälfte trägt Bahn 4.
- **terraform#1**, Bilanz ±10 % und „im Lee tiefer": Die Tat `regen` legt Regen an einen Ort, die Luftmasse hat aber keinen
  Wasserhaushalt. „Fällt, wo gesät; nebenan fehlt er" trägt der Entwurf.
- **gewalt#1, erdsaat#2** (Brand von selbst, Rate im Real-Band): kein Blitz-Gesetz (K13).
- **physik.feuer#3–8:** kein Raum-, Kronen-, Funkenflug- oder Stadtbrand-Gesetz (K5, K7). Ein Werk zündet und brennt, es stürzt
  nicht ein.
- **kaskade#3–7, stoerung#3+** (Abfluss nach dem Brand, K8; Rückkehr der Tiere), **kohaerenz, aufwaerts, erdsaat (außer #2
  oben), ereignis#3+, terraform#2–6, zeitreise#3–7:** keine Größe dieses Entwurfs trägt sie.
- **Der Pegel an (0, 0)** (Z8, wasser-hydro.js:254–255): Der Pegel ist ein Zustand je Fluss ohne Ort des Regens. Die Tafel über s̃
  könnte ihn speisen; das ist eine eigene Kopplung (K8).
- **Z3** (zwei Wald-Dichten: `sd` phyto-core.js:2788 gegen `lebendig` :7065): Das Bett liest `lebendig`, nach dem die Bäume
  stehen. Der Zwilling `sd` bleibt ein Bruch der Tafel.

---

## 8. FALSIFIKATION

1. **Funke:** Gibt `_feuchteAm` im Wirt an der Mess-Wiese über 48 Welt-h Gras brennbar < 10 % (node: 31,0–31,8 %), trägt das
   Gesetz die Szene nicht.
2. **Front:** Liegt die Spitze im Moment der Station (U10 6,9–10, M < 0,09) außerhalb [½, 2] × CSIRO (node: × 0,57–0,85), fällt das
   Front-Modell. Das ist ein Risiko des Brand-Gesetzes, nicht der Kopplung. Bei 5,9–6 m/s liegt der Nachbau mit × 0,49–0,50 auf der
   Kante; im trockenen Sturm mit × 0,30–0,61 darunter.
3. **Örtlichkeit:** Löscht `weather rainy` an A auch den Brand B in 3 km Abstand bei gleichem s̃, ist die Nässe noch ein Skalar.
   Heute sterben beide.
4. **Ellipse:** Hauptachse > 20° von θ, oder L/B < 1,5 bzw. > 2 × Alexander bei U10 ≥ 6,9 (Alexander 2,21–3,65; Code 3,34–6,07,
   × 1,5–1,7).
5. **Film:** Weicht im Wirt die Zeit Regen-Ende → Albedo zurück um mehr als Faktor 2 von 2,6–2,7 min ab, rechnet der Wirt ein
   anderes Gesetz als der Nachbau.
6. **Preis:** Kosten Brand + Feuchte > 0,25 ms je Bild in der 900-s-Szene (Saum 134, Rechnung ≤ 31 µs) → die Bindung an die
   Änderung ist falsch. Nicht gelaufen (GPU/Kopf).
7. **Tagesgang:** 33,5 % Tag gegen 32,2 % Nacht ist schwach gegen echte Gras-Brände mit Nachmittags-Gipfel. Fällt ein Bildpaar
   Nacht/Tag gleich aus, ist SMAX das Glied, das prüft.

**Die Kreisgefahr:**
- Die Lösch-Zeit (3,3–26,7 s) und die Trocken-Zeit (7,4–7,7 min) kommen aus Van Wagner und Simard, also aus dem eigenen Gesetz.
  Eine Station, die sie als Soll nimmt, misst sich selbst. Sie stehen nur als „unsicher", nie als Richter.
- Nicht-kreisförmig sind:
  - das Tempo gegen CSIRO;
  - die Gestalt gegen Alexander;
  - die Richtung ±20° aus der Sprosse;
  - die räumliche Örtlichkeit (A erlischt, B brennt);
  - das Luma-Band nass/trocken aus wetter-welt#3.
- Die Wahl von t* aus dem Gesetz ist erlaubt: Das Gesetz liefert die Eingänge (U10, M), das Urteil kommt aus einem fremden Modell.
