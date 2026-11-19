# Entwurf ERHALTUNG — Wasser, Energie und Masse als Flüsse am Ort (main 0469be5e, nur gelesen)

**Entscheidung.** Wasser, Brennstoff-Masse und Wärme sind Bilanzen je Ort. Sie laufen auf EINEM Raster (64-m-Glut-Block,
4 × 4 Zellen à 16 m), auf EINER Prozess-Uhr (Welt-Uhr × 24, der Pegel-Tag) und in SI. Ihr einziger Antrieb ist das Wetter am
Ort `wetterAt(saat, x, z, t, ort)` (phyto-core.js:4423–4454). Das ist eine Wanderwelle, also eine reine Funktion von Saat,
Ort und Zeit. Darum ist jede Bilanz eine GESCHLOSSENE FUNKTION von (Saat, Ort, t): Sie wird als Integral mit verblassendem
Gedächtnis über ein gemessenes Fenster gelesen, nicht getickt. Gespeichert wird nur das Delta, die Tat `brand` mit der
verbrannten Masse.
Die EINE Welt-Nässe fällt (bild-himmel.js:3077–3082) und mit ihr alle Leser.
Die Last aus Rauschen fällt (feld-brand.js:222, :302). Die Last ist die gezeichnete Bedeckung, dasselbe Gesetz wie der Wiesen-Wurf.
Das Bett aus gebauten Karten fällt (gelaende-kollision.js:1130–1133 im Brand).
Der Wind aus dem Wort des Spielers fällt (stoff-material.js:239). Der Wind ist U₁₀ in m/s am Ort.

Was heute und hier lief (headless, nur Kerne geladen; Befehle mit `S=/tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/entwurf-erhaltung`, je Lauf ≤ 60 s):

| Skript | Was es misst |
|---|---|
| `node $S/wetter-ort.cjs /home/user/AnazhRealm` | Wanderwelle, Zeilen-Anteile, Fenster, Preis `wetterAt` |
| `node $S/feuchte.cjs /home/user/AnazhRealm` | Brennstoff-Bilanz heute gegen Varianten, P = rain · 10 mm/h |
| `node $S/feuchte-zusatz.cjs /home/user/AnazhRealm` | Gate bei Z 1, Regen-Statistik, Preis des Integrators |
| `node $S/energie.cjs` | Rothermel-Abschrift gegen CSIRO, Wärme-Buch, Last |
| `node $S/bilanz.cjs /home/user/AnazhRealm` | DAS Gesetz: P_ref folgt, Boden, Abfluss, Bilanz-Identität, Lösch- und Trocken-Zeiten |
| `node $S/fenster.cjs /home/user/AnazhRealm`, `node $S/fenster2.cjs /home/user/AnazhRealm` | Fenster-Fehler der geschlossenen Funktion, Kalt-Preis je Block, Versatz in der Zelle |
| `node $S/film.cjs /home/user/AnazhRealm` | Wasser-Film der Oberfläche; van Genuchten gegen die Bänder von `_feuchteAt` |

**Nicht gelaufen:**
- der Stamm (kein Null-Renderer, kein Fenster, keine GPU);
- der Preis von `_bodenFarbeAt`/`_voxelSurfaceY` je Bett-Punkt;
- die Bedeckung p an echten Orten;
- die Bild-Folge der van-Genuchten-Feuchte;
- die Station;
- der Pegel mit echtem Bett `tf`;
- der Preis des Memo-Zugriffs je Zelle.

**Korrektur im Lauf:** bilanz.cjs rechnete den Boden-Speicher zuerst in m statt kg/m² (D 0,1 statt 100). Die Schicht war damit
1000× zu dünn. Nach der Korrektur fällt Laub-brennbar von 15,8–17,8 % auf 14,9–17,3 %; Gras bleibt 19,3–21,6 %. Es gelten nur
die korrigierten Zahlen.

---------------------------------------------------------------------------------------------------------------------------
## (1) DAS GESETZ

**In einem Satz.** Je Ort gilt: Wasser im Brennstoff, in der Boden-Schicht und im Oberflächen-Film ändert sich nur um Regen
minus Verdunstung minus Abfluss minus Versickerung. Brennstoff-Masse ändert sich nur um Wuchs minus Brand; Brand-Wärme ist
h · w_netto. Das alles ist eine geschlossene Funktion der Regen-, Wind- und Strahlungs-Geschichte am Ort. Diese Geschichte
folgt aus dem Samen, denn das Wetter ist eine Wanderwelle.

### 1.1 Raster und Uhr
```js
// RASTER: der Glut-Block 64 m (4 × 4 Zellen à 16 m, Tafel 6.2; Brand-Suche in Blöcken feld-brand.js:542), Ursprung (0, 0) wie
// LIFE_FIELD.cell (feld-leben.js:3078). Block (bi, bk) = (floor(x/64), floor(z/64)). Der Block ist ein MEMO, nie Wahrheit.
// UHR: Welt-Uhr spielZeit [s] (dirigent-takt.js:48). Prozess-Uhr τ = Z · spielZeit [s], Z = 86 400 / PEGEL_TAG_S = 24
// (daten.js:165; derselbe Tag wie Pegel, Narbe, Werk-Alter). Tag-Phase = frac(spielZeit / PEGEL_TAG_S + 0,5) (die Welt
// beginnt am Mittag, daten.js:151). Die Mechanik bleibt 1:1 auf der Welt-Uhr: Front-Tempo R [m/s], U₁₀ [m/s], Zug 11 m/s,
// Flammen. Feuer und Wasser koppeln über den ZUSTAND M, nie über Raten.
```

### 1.2 Kern phyto-core (rein, additiv; `wetterAt` byte-gleich)
```js
// Das Wetter am Ort in SI. Die Zeile, ihre Kanäle und die Front wie wetterAt; dazu:
wetterAmOrt(saat, x_m, z_m, t_s, ort) → {
  zeile, front, feuchte,          // wetterAt unverändert
  mix,                            // WX_GESETZ-Kanäle {fog, sun, grey, wind, rain} als Kasten-Mittel über 45 s am Ort
                                  // (= 495 m Front längs des Zugs, die Wanderwelle); heute 45 s Übergang am Spieler, daten.js:143
  U10_ms,                         // = mix.wind · WIND_FELD.sturmMS (24): dieselben Werte 1,44 / 2,4 / 7,2 / 8,4 / 24 m/s, am Ort
  P_mmh,                          // Regen in Prozess-mm je Prozess-h = (feuchte ≥ REGEN.qDampf ? mix.rain : 0) · REGEN.P_ref_mmh
}
REGEN = { qDampf: 0.5,      // gewählt: Regen erreicht den Boden nur, wo die Feuchte-Welle Dampf trägt (sonst Virga)
          P_ref_mmh: 0.834 } // FOLGT (2.1): P̄ / ⟨rain·Gate⟩; heute 10 mm/h gesetzt (gelaende-core.js:1577–1579)
windRichtung(saat, t_s, ort)  // + ort: θ0 aus ort.wetter.windX/windZ, wo der Planet ihn schreibt (planet-core.js:2336, TS3);
                              // ohne diesen Eintrag θ0 aus der Saat wie heute
```

### 1.3 Kern gelaende-core (rein, additiv, eine Funktion je Größe)
```js
bodenSe(h_m) → Se_1                    // van Genuchten, Lehm (Carsel & Parrish 1988: θr 0,078 · θs 0,43 · α 3,6/m · n 1,56),
                                       // h = Höhe der Oberfläche über dem Wasser-Spiegel (dieselben Bezüge wie heute,
                                       // `_waterLevelAt`); θ_grund = θr + (θs − θr)·Se — die Kapillar-Ruhe über dem Grundwasser
emc(rh_1, T_C) → M_kgkg                // Simard 1968 (NFDRS)
et0(T_C, U10_ms, ea_kPa, sun_1, sinH_1) → Ep_mmh  // FAO-56 stündlich (Allen et al. 1998, Gl. 53)
wasserSchritt(z, a, dt_s) → z           // EIN Schritt der Bilanz je Säule; z = {M: {gras, laub}, theta, film};
                                        // a = {P_mmh, Ep_mmh, rh, T_C}; liefert die Bilanz-Identität mit (1.6)
wasserBlock(L, saat, bx, bz, y_m, t_s, ort) → { M: {gras_kgkg, laub_kgkg}, theta_m3m3, film_mm, fehler_kgm2 }
                                        // das Integral über das Fenster (Gras 1, Laub 2, Boden 10 Prozess-Tage, 2.4), ab der
                                        // Kapillar-Ruhe θ_grund und M = EMC; Schritt 5 s Welt (Brennstoff), 60 s (Boden)
PEGEL.regen = 0.0060                    // FOLGT: Beiwert 0,3 · P_ref · 24 h (heute 0,072, gelaende-core.js:1600)
```

### 1.4 Die Säule (je Bett EINE Säule über ihrer Boden-Schicht d 0,1 m; W = M·w in kg/m²)
| Bilanz | Gleichung | Quelle der Konstanten |
|---|---|---|
| Regen auf Brennstoff | dW/dt = c · P · (1 − M/M_sat), c = 1 − exp(−σ·w/(π·ρp)) | Gras c 0,823, Laub 0,997; M_sat 2,5 (`BRAND.feuchte.nass`, Matthews 2006) |
| freies Wasser (M > 0,35) | dW/dt = −Ep | FSP 0,35 (`BRAND.feuchte.faser`) |
| gebundenes Wasser | dM/dt = (EMC − M)/τ, τ 1 Prozess-h | Fosberg & Deeming 1971 |
| Luft | RH aus Dampfdruck e = RH̄(q) · e_s(T_Tag); RH̄ = 0,3 + 0,7 · min(1, q/0,72) | RH_min 0,3 gewählt; 0,72 = Nebel-Stufe des Kerns (phyto-core.js:4313), Sättigung |
| Laub-Luft | RH_bett = RH + (1 − RH) · β(θ) | Gras steht in der Luft; die Grenzschicht über nassem Boden ist gewählt; β nach Noilhan & Planton 1989 |
| Boden-Schicht | ΔS = (1 − 0,3)·Durchfall − β·Ep − (θ − θfc)·d/τD − Sättigungs-Überschuss | Beiwert 0,3 (gelaende-core.js:1579); θfc = θ(3,37 m) = 0,164; τD 1 Tag gewählt; θ ≥ θ_grund |
| Film (versiegelt, Bild) | dS/dt = P − Ep, 0 ≤ S ≤ 1 mm | Muldenspeicher versiegelter Flächen 0,5–2 mm; 1 mm gewählt |
| Temperatur | gelaende-core-Gesetz (gelaende-core.js:1313–1355), gelesen zur Tag-Phase der Welt-Uhr und mit `sun`/`rain` am Ort | — |

### 1.5 Masse und Energie (feld-brand, Stamm)
```js
lastAm(x, z, bett) → w_kgm2        // Gras: BRENN.gras.last (0,166) · p(x, z)
                                    //   p = groundCover(L, m, rk, ∞).grass · gruen · pfad · (1 − asche)
                                    //   — DASSELBE p wie der Wiesen-Wurf (vegetation-wiese.js:172, `_wieseGrund` :778–784),
                                    //   gruen aus der geschlossenen Boden-Farbe `_bodenFarbeAt` (gelaende-boden.js:2536)
                                    //   über `_voxelSurfaceY` (Feld-Scan, gelaende-chunks.js:2144) statt aus der Boden-Karte
                                    //   gebauter Chunks
                                    // Laub: BRENN.laub.last (0,654) · Kronen-Deckung als Erwartung
                                    //   (`forestKronenDeckung`, phyto-core.js:2974); fern liest die Physik die Erwartung,
                                    //   nah das Bild die Verwirklichung wie bei `fussM`
abbrand(zelle) → { w_verbrannt_kgm2, asche_kgm2: S_T·w, waerme_Jm2: h·w·(1 − S_T) }  // S_T 0,0555 (Rothermel 1972)
byram(zelle) → I_B_Wm = h · w_n · R  // die EINE Energie-Quelle für Flammen, Licht und Ohr; I_R bleibt Treiber im Tempo
tat brand = { x, z, h, w_verbrannt }  // das EINZIGE Gespeicherte; die Zelle sperrt nicht, sie wächst nach p zurück
```

### 1.6 Schreiber, Leser, Bilanz je Takt
- **Schreiber:** keiner. M, θ und Film sind Funktionen.
- **Memo:** EIN Memo `_wasserAm(x, z, t)` im Stamm. Es hält je Block das Ergebnis von `wasserBlock` und schreitet mit 5 s Welt
  fort, solange ein Leser den Block fragt.
- **Zellen im Block:** Eine Zelle liest den Block-Verlauf um Δs/zug verschoben (Wanderwelle). Gemessen ist ein Fehler von
  höchstens 7,2·10⁻³ kg/kg an der Block-Ecke, 45 m windab (`fenster.cjs`).
- **Leser:**
  - der Brand je Zelle zu ihrer eigenen Zeit;
  - das Bild am Auge (Film → `atmoUniforms.naesse`);
  - der Wagen am Rad;
  - der Wuchs (θ);
  - der Pegel (P an der Mitte der Hydro-Kachel).
- **Bilanz je Takt:** Je Block-Schritt prüft das Memo die Identität ΔW = P − Abfluss − E_Brennstoff − E_Boden − Drainage.
  - Fehlerziel: ≤ 10⁻¹² kg/m².
  - Gemessen: 5,1·10⁻¹⁵ kg/m² (`bilanz.cjs`).
  - Je Abbrand gilt w_vor − w_nach = w_verbrannt, Asche = S_T · w_verbrannt und Σ Wärme = h · w_n · A_Zelle (relativ ≤ 10⁻⁶).
  - Eine Verletzung ist ein benannter Fehler mit Block und Term, kein Klemmen.

**Kein Zwilling, kein Flag, kein Ersatz:**
- `wetterAt` wirft schon bei nicht-endlichen Werten (phyto-core.js:4424).
- `wasserBlock` wirft ohne `L.hydroGesetz`, ohne Saat und ohne Höhe.
- Die Welt hat eine Vergangenheit: Das Fenster liest t < 0, also trägt die Ankunft ihre Feuchte schon. Einen Kalt-Start mit
  Schätzwert gibt es nicht.

---------------------------------------------------------------------------------------------------------------------------
## (2) DIE HERLEITUNG — gesetzt → folgt

### 2.1 Regen: Stärke und Ort
- **Ortsabhängig:** Ja. `s = x·dx + z·dz − zug·t + biegeM·sin(2πq/querM + biege)` (phyto-core.js:4428–4431); Front und
  Feuchte hängen nur an s (:4433–4439).
- **Die Wanderwelle ist exakt:** wetterAt(x, z, t) = wetterAt(x − g·zug·Δ, z − g·zug·Δ, t − Δ). Gemessen über 756 Paare (3 Saaten,
  4 Orte, Δ 30/300/3000 s): max |Δ| 2,30·10⁻¹⁴ (`wetter-ort.cjs`).
- **Die Regen-Geschichte folgt aus dem Samen:** Die Geschichte am Ort ist die Gegenwart windauf. Damit ist die Fosberg/Nelson-Frage
  bejaht: Die Feuchte ist eine Funktion des Samens, ohne Speicher.
- **Gate (gewählt):**
  - Heute regnet jede Zeile mit `rain` > 0,05 überall: nass 58,4 % der Zeit, 26 383 mm/a bei 10 mm/h (`feuchte-zusatz.cjs`).
  - Mit Gate q ≥ 0,5 regnet die Front nur, wo die Feuchte-Welle Dampf trägt: nass 29,2 %.
  - Die trockenen Fronten (29,2 %) tragen Wind ohne Regen. Das ist die trocken-windige Lage, die heute fehlt (B2, K3).
  - Die Zeilen und der Himmel bleiben unverändert.
- **Stärke folgt aus der Masse:**
  - Der Pegel setzt die mittlere Abfluss-Spende 0,0009 m/Tag (gelaende-core.js:1600) und den Wiesen-Beiwert 0,3 (:1579).
    Daraus folgt P̄ = 0,0009/0,3 = 3,0 mm je Prozess-Tag (1095 mm/a).
  - Mit ⟨rain·Gate⟩ = 0,1499 folgt P_ref = 3,0/24/0,1499 = 0,834 mm/h je Regen-Einheit (`bilanz.cjs`). Heute sind 10 mm/h gesetzt,
    das ist der Faktor 12.
  - Gemessen am Ort: 2,98–3,04 mm/Tag (12 Läufe: 3 Saaten × 4 Orte).
  - **Reise-Welten:** P_ref ist eine Konstante der Heimat. Auf einer Reise-Welt verschieben `regenQuote`/`sturmQuote` die Stufen
    (phyto-core.js:4443–4447). Daraus folgen ⟨rain⟩_ort, P̄_ort und die Spende des Orts.
- **Pegel (heute 24,1× zu viel):**
  - Heute: 0,072 · ⟨rain⟩ 0,301 = 21,7 mm/Tag schneller Abfluss gegen 0,9 mm/Tag Spende, also 24,1× (`bilanz.cjs`).
  - Gesetz: `PEGEL.regen` = 0,3 · 0,834 · 24 = 6,0 mm/Tag je Regen-Einheit.
  - Hub je tf bei F = 1 (gelaende-core.js:1629): heute 12,97, Gesetz 2,40. Befehl: `node -e` mit (1 + regen/0,0009)^0,6 − 1;
    beide Werte werden an der Krone gekappt.
  - Gemessener Abfluss in der Bilanz: 0,70–0,72 mm/Tag. Das sind 0,8× der Spende; die Interzeption verdunstet den Rest.
  - `_regenMittel` an (0, 0) (wasser-hydro.js:247–257, Z8) fällt: Das Mittel ist P̄, eine Konstante.

### 2.2 Brennstoff-Feuchte: Vorher ↔ nachher (30 Prozess-Tage, 3 Saaten × 4 Orte, Anteil der Welt-Zeit mit M < mx)
| Gesetz | Gras | Laub | Quelle |
|---|---|---|---|
| heute (EINE Nässe, M = 0,06 + 0,29·boden + 2,5·Nässe, feld-brand.js:284) | 0,0–0,3 % | 0,0–0,3 % | `feuchte.cjs` |
| Bilanz Z 24, ohne Gate (P 10 mm/h) | 0,0–0,2 % | — | `feuchte.cjs` |
| Bilanz Z 1, mit Gate | 0,0–1,5 % | — | `feuchte-zusatz.cjs` |
| Bilanz Z 24, Gate 0,5 (P 10 mm/h) | 18,1–20,2 % | 9,8–11,2 % | `feuchte.cjs` |
| **DAS GESETZ** (Z 24, Gate 0,5, P_ref folgt, Boden, Laub über dem Boden) | **19,3–21,6 %** | **14,9–17,3 %** | `bilanz.cjs` |

**Folgen:**
- **Was die Klasse heilt:** Erst Bilanz, Prozess-Uhr und Gate zusammen heilen K1. Die Bilanz allein lässt das Gras bei 0,2 %. Ohne
  Prozess-Uhr bleiben die trockenen Fenster (Median 235 s, max 340 s, `wetter-ort.cjs`) kürzer als das Trocknen.
- **Brennbar und windig:** Gras brennbar UND U₁₀ ≥ 5 m/s: 10,6–12,2 %.
- **Brennfenster:** Median 695 s, p90 1045 s, max 1140 s Welt (n 242). Die Station braucht 60 s.
- **Löschen:**
  - Regen (0,50 mm/h): Gras 3,8 s Welt, Laub 39,9 s.
  - Sturm (0,83 mm/h): 2,3 s bzw. 23,9 s.
  - Bewölkt (0,10 mm/h): 18,8 s bzw. 199 s.
  - Heute: Regen 6,1 s, Bewölkt trocknet nie (B3).
- **Trocknen:** Nach voller Sättigung, klar, mittags: Gras 355 s, Laub 394 s. Heute 605 s (klar) bzw. 980 s (Nebel), B3.
- **Boden:** θ 0,128–0,153, Mittel 0,140, unter θfc 0,164, ab Prozess-Tag 12.

### 2.3 Welche gesetzten Größen fallen oder folgen
| heute gesetzt | danach | Marke |
|---|---|---|
| Nässe-Ziel `rain > regenAb ? 1 : 0` (bild-himmel.js:3078) | Interzeption c·P·(1 − M/M_sat) am Ort | c belegt (Silhouette, Beer); M_sat belegt (Matthews 2006) |
| `BRAND.feuchte.trocken` 0,06 fest (feld-brand.js:975) | EMC(RH, T) mit τ 1 h | belegt (Simard 1968; Fosberg & Deeming 1971) |
| `faser · boden` (feld-brand.js:284) | Laub über dem Boden: RH + (1 − RH)·β(θ); Gras in der Luft | β belegt (Noilhan & Planton 1989); Mischung gewählt |
| Bänder von `_feuchteAt` (gelaende-boden.js:1555–1558; Gewicht 0,85, Reichweite 26 m, 1,5/7 m) | bodenSe(h) van Genuchten | Lehm belegt (Carsel & Parrish 1988); ein Boden für alle gewählt |
| Regen 10 mm/h (gelaende-core.js:1579), `PEGEL.regen` 0,072 (:1600) | P_ref 0,834 mm/h, `PEGEL.regen` 0,0060 | FOLGT aus Spende und Beiwert |
| Last `last · min(1, lebendig)` (feld-brand.js:302) | `last · p(x, z)` | FOLGT (dasselbe p wie der Wurf) |
| Tat sperrt die Zelle (feld-brand.js:217) | p wächst nach (`_wieseGrund` liest die Asche) | FOLGT; `minStoff` 0,15 bleibt (gewählt) |
| `iw` = heiz/1000 · last · min(1, leb), brutto (feld-brand.js:437) | I_B = h · w · (1 − S_T) · R | belegt (Byram 1959; S_T Rothermel 1972) |
| Wind-Stärke aus `state.weather` (stoff-material.js:239) | `mix.wind` am Ort | FOLGT (dieselben Zeilen-Werte) |
| Temperatur zur Sicht-Uhr `timeOfDay` (bild-himmel.js:2879) | Tag-Phase der Welt-Uhr | FOLGT (daten.js:151, :165) |
| Nässe-Dosis `nassTage` aus dem Wort am Spieler (bild-himmel.js:3075–3076) | ⟨rain·Gate⟩ · spielZeit / PEGEL_TAG_S | FOLGT (das Klima-Mittel; die Front mittelt sich über Prozess-Tage aus) |
| Film-Trocknen `verdunstS` 480 s (stoff-material.js:3790–3791) | Film 1 mm, −Ep | Film-Größe gewählt (Spanne belegt) |

### 2.4 Funktion statt Zustand — die Fenster (`fenster.cjs`, `fenster2.cjs`)
Fenster mit verblassendem Gedächtnis gegen einen Langlauf über 40 Prozess-Tage; 120 Proben an 3 Orten; Start M Gras 0,1, Laub 0,2.

| Fenster | Gras |ΔM| | Gras falsch | Laub |ΔM| | Laub falsch |
|---|---|---|---|---|
| 1 Tag | 9,8·10⁻⁵ | 0/120 | 0,19 | 3/120 |
| 2 Tage | 0 | 0/120 | 0,029 | **0/120** |
| 3 Tage | 0 | 0/120 | 0,013 | 0/120 |
| 4 Tage | 0 | 0/120 | 4,9·10⁻³ | 0/120 |

- **„Falsch“:** der Brennbar-Entscheid M < mx weicht vom Langlauf ab.
- **Warum Laub länger braucht:** Laub hält freies Wasser über die Nacht (Ep ≈ 0).
- **Boden:** 10 Tage geben |Δθ| 1,3·10⁻³ (5 Tage: 4,2·10⁻³).
- **Entscheidung:** Gras 1, Laub 2, Boden 10 Prozess-Tage (gemessen).

### 2.5 Energie
- **Energie ist kein Feld:** I_R ist der innere Treiber im Tempo (Rothermel 1972/Albini 1976, abgeschrieben aus
  feld-brand.js:300–338).
- **Vorheizen:** ξ · I_R gegen ρb · ε · Q_ig an der Nachbarin, mit IHRER Feuchte und IHRER Last. Heute erbt sie Feuchte und `mx`
  der Quelle (feld-brand.js:448, :509–510, B7).
- **Extinktion:** η_M → 0 bei M ≥ mx (Gras 0,12, Laub 0,25, bau-vorlagen.js:1646–1649), je Zelle zu ihrer Zeit; damit fällt B8,
  die einmal gemerkte Boden-Feuchte (feld-brand.js:218–219, :268).
- **Wärme-Buch je m²** (volle Last, M 0,06, U₁₀ 7,2):

  | Bett | I_R | t_r | I_R·t_r | h·w_n | Anteil |
  |---|---|---|---|---|---|
  | Gras | 157,8 kW/m² | 6,6 s | 1,04 MJ | 2,92 MJ | 0,356 |
  | Laub | — | — | — | — | 0,237 |

  Die Flamme verbraucht nie mehr als die Chemie (Anteil < 1); der Rest ist Glimmen nach der Front. Byram Gras: 3276 kW/m
  (`energie.cjs`).
- **T bleibt eine Funktion** (gelaende-core.js:1313–1355). Sie wird zur Tag-Phase der Welt-Uhr und mit dem Wetter am Ort gelesen.
  Das heilt UB1 und Z16.
- **Nicht in diesem Entwurf:** Feuer → Temperatur (K7, Plume) und Feuer → Wind (feuer#6).

### 2.6 Masse
- **Die Last folgt der Bedeckung**, an der Station heute p50 0,499 (Tafel B5):

  | Last | R bei U₁₀ 7,2 m/s | R bei U₁₀ 1,44 m/s |
  |---|---|---|
  | `lebendig` p50 0,499 (heute) | 0,524 m/s | 0,072 m/s |
  | volle Bedeckung p = 1 (offene Wiese) | 1,061 m/s | 0,077 m/s |

  Unter klar hilft die Last nicht; das ist B1, das Gesetz des Feuers, nicht der Bilanz.
- **Asche** bei voller Last: 9,2 g/m² (S_T · w).
- **Nachwuchs:**
  - Heute ist der Wuchs `w` bei der Tat eingefroren (vegetation-wiese.js:2215–2219, SP7).
  - Gesetz: Narben-Rest = 1 − ∫ wuchs(θ(τ), L, N) dτ / stunden.
  - `_wuchsAt` (vegetation-wiese.js:2078–2089) liest θ am Ort statt `_feuchteAt`. Damit ist Regen → Wuchs gekoppelt (K6).
  - Die Dürre senkt θ, der Nachwuchs stockt.
- **Grund-Feuchte, van Genuchten gegen die Bänder** (`film.cjs`):

  | h [m] | 0 | 0,5 | 1 | 1,5 | 3 | 5 | 7 | 10 | 20 | 50 |
  |---|---|---|---|---|---|---|---|---|---|---|
  | Se | 1,00 | 0,64 | 0,47 | 0,38 | 0,26 | 0,20 | 0,16 | 0,13 | 0,09 | 0,05 |
  | Band heute | 0,85 | 0,85 | 0,85 | 0,85 | 0,69 | 0,26 | 0 | 0 | 0 | 0 |

  Ufer 1–3 m werden trockener, das Hochland feuchter als 0. Die Bild-Folge ist **nicht gemessen** (Bahn E misst sie an der
  Blick-Sonde, HOLZ-Profil vorher ↔ nachher).

### 2.7 Wind
- **Eine Quelle:** U₁₀ [m/s] = `mix.wind` am Ort · 24 · Wob · Form · Böe. Das ist `_windAt` mit der Stärke vom Ort statt vom
  Wort (stoff-material.js:239). Alle Leser übergeben schon ihren Ort (stoff-material.js:233).
- **Werte:** In den Brennfenstern ist U₁₀ im Median 7,2 m/s (`feuchte.cjs`).
- **Richtung:** Der Mäander ±41° um θ0 bleibt. Am Boden gegen die Front ist das die Ekman-Drehung (20–45° über Land) und kein
  Zwilling.
- **Sprosse:** Die gewählte ±20° von wetter-welt#2 bleibt rot (6).

---------------------------------------------------------------------------------------------------------------------------
## (3) WAS FÄLLT

| Stelle | was stirbt / wird umgeschrieben | heilt |
|---|---|---|
| bild-himmel.js:3077–3082 | `st.naesse` als EIN Skalar; Ziel binär; der Uniform `naesse` = Film am Auge / 1 mm, `regen` = P am Auge | B3, K1, UB8, Z9 (Nässe-Teil) |
| feld-brand.js:282–285 | `_brandFeuchte(boden)` mit `state.naesse`, `faser·boden` → M der Zelle aus `_wasserAm` | B3, K1, FS4, EB3 |
| feld-brand.js:222, :224, :302, :437 | `leb = auraAt().lebendig` als Last, Byram brutto → `lastAm`, I_B netto | B5, Z1, EB4, TS10 (Teil) |
| feld-brand.js:217 | die Tat sperrt die Zelle bis zur Heilung | B5 |
| feld-brand.js:218–219, :268; :448, :509–510 | Bett samt Boden-Feuchte einmal gemerkt; die Nachbarin erbt `mx`/`boden` | B8, SP6, B7 |
| feld-brand.js:244 → gelaende-kollision.js:1130–1133 | das Bett aus `_kontaktStoffAt` (Grün-Kanal gebauter Chunks, Kronen-Streu im Fenster der Wege-Karte) → `lastAm` aus Funktionen; `_kontaktStoffAt` bleibt Schritt-Klang und Kontakt, nie Brennstoff | B4, FS1, FS2, K2 |
| vegetation-wiese.js:2362–2400 | die Boden-Glut-/Bett-Wahl am gebauten Ring (:2370) | B4 |
| stoff-material.js:239 | Stärke `_weatherFieldFor(this.state.weather).wind` → `mix.wind` am Ort | Z8 (Wind), EB1 (die Einheit steht: m/s) |
| bild-himmel.js:2874–2882 | `_temperaturAt(y, traegTage)` mit `timeOfDay` und dem Wort → `_temperaturAt(x, z, y, traegTage)` zur Welt-Uhr | UB1, Z16, Z26 (Teil) |
| bild-himmel.js:3075–3076 | `nassTage` als Integral über den Weg des Spielers | Z8, UB8 |
| gelaende-core.js:1577–1579, :1600 | 10 mm/h gesetzt, `regen` 0,072 → P_ref, 0,0060 | EB2, Pegel 24,1× |
| wasser-hydro.js:247–257 | `_regenMittel` an (0, 0) über Züge → P̄ | Z8 |
| wasser-hydro.js:127–143, :154ff | Stempel `_regenWeg` aus dem Wort am Spieler → Knoten von P_mmh an der Mitte der Hydro-Kachel aus der Funktion (wie `_pegelVergangenheit` die Vergangenheit legt) | Z8 (Regen-Ort des Pegels) |
| gelaende-boden.js:1538–1563 + voxel-worker.js:2090–2128 | die Bänder und ihr Hand-Spiegel → EINE Kern-Funktion `bodenSe` | Z5; FS3 bleibt benannt offen (ob eine Genese-1-Welt einen Spiegel trägt, gelaende-boden.js:1529–1539: nicht verifiziert, Bahn E) |
| vegetation-wiese.js:2215–2219 | `_tatDauer` mit gefrorenem `w` → Integral | SP7 |
| speicher-laden.js:2685, :2688 | `naesse` im Stand (eine Funktion reist nicht) | SP2 |
| koerper-fahrt.js:1811, siedlung-wege.js:626, bild-himmel.js:1075/1084 | Leser von `state.naesse` → Film am eigenen Ort (Rad, Auge) | B3 |
| scripts/diag-stand-takt.cjs:872, :1025, :1374, :1603, :2899–2900; diag-fahr-leben.cjs:762–777; diag-kreatur-leben.cjs:148–191; fahr-proben.cjs:441; ausgabe-aufnahme.cjs:389 | Stubs, die `state.naesse` setzen (cloudy + Nässe 0) → die Proben suchen das Brennfenster aus der Funktion | Z28 |
| dirigent-takt.js:1733 | bleibt, aber nur noch als Wort am Auge für Himmel, Klang und Bewohner; die Physik liest es nie (Absenz-Grep, Bahn F) | Z8 (Rolle) |

---------------------------------------------------------------------------------------------------------------------------
## (4) DER PREIS — gebunden an Schirm + Änderung

### 4.1 Gemessene Bausteine
| Baustein | Preis | Quelle |
|---|---|---|
| `wetterAt` | 233 ns | `wetter-ort.cjs` |
| Integrator-Schritt | 443–550 ns; Kalt-Preis je Block 1,06 ms / 1920 Schritte | `feuchte-zusatz.cjs`; `fenster.cjs` |
| Rothermel-Ruf | 512 ns | `energie.cjs` |
| Kalt-Block (Boden 480 × 60 s + Brennstoff 1440 × 5 s) | 1,06 ms | `fenster.cjs` |
| Brand heute je Zelle und Schritt | 3,7 µs | Zitat feld-brand.js:458, Tafel 6.1 |

### 4.2 Rechnung (Ruhe = 0: ein Block ohne Leser wird nie integriert)
- **Brand mit 2000 Zellen** (feuer#2): 125 Blöcke × 0,55 µs je 5 s Welt = 14 µs je Welt-s. Dagegen der Brand selbst:
  2000 × 3,7 µs = 7,4 ms je Welt-s. Die Bilanz kostet also **+0,19 %**.
- **Brand-Bild r 160 m** (≈ 314 Zellen, ≈ 20–25 Blöcke): heiß 2,2–2,8 µs je Welt-s. Kalt 21–27 ms einmal; im Budget 0,25 ms je
  Bild in 85–106 Bilder geschnitten (1,4–1,8 s bei 60 Hz).
- **Ring 4** (≈ 590 Zellen, 7 × 7 Blöcke): wird NUR integriert, wo ein Brand steht oder das Auge ist. Heiß 49 × 0,55 µs je 5 s =
  5,4 µs je Welt-s.
- **Erste Zündung:** 1 Kalt-Block = 1,06 ms, auf 5 Bilder geschnitten (83 ms). Die Zündung urteilt im ersten Brand-Schritt (1 s),
  also unsichtbar.
- **Front-Vorlauf:** Bei 1,06 m/s (U₁₀ 7,2, volle Last) quert die Front einen Block in ≈ 60 s. Die acht Nachbar-Blöcke vorwärmen
  kostet 8 × 1,06 ms je 60 s = 0,14 ms je Welt-s.
- **Film am Auge:** 1 Block, heiß 0,55 µs je 5 s. Nach Teleport oder Ankunft 1,06 ms kalt, geschnitten.
- **Wind am Ort:** Memo je Block und Welt-s. Das 45-s-Kasten-Mittel braucht 5 `wetterAt` = 1,2 µs je Block-s; 25 sichtbare Blöcke
  ergeben 29 µs je Welt-s, also ≈ 0,5 µs je Bild.
- **Bedeckung je Zelle:** Memo, statisch bis zur nächsten Tat. Der Preis von `_bodenFarbeAt` + `_voxelSurfaceY` (≈ 25
  Dichte-Proben je Spalte, gelaende-chunks.js:2152–2155) je Bett-Punkt ist **nicht gemessen** (Stamm nicht gelaufen).

### 4.3 Funktion gegen getickten Zustand
Geprüft (2.4): Gelesen wird die Funktion, das Memo ist ein Cache.
- Ein Zeitsprung von 10 Jahren kostet 1 Kalt-Block je gelesenem Block, nicht 10 Jahre Takte (UB8 heilt).
- Die Temperatur liest nicht mehr den Regler `timeOfDay` (NON_BROADCASTABLE, feld-dsl.js:949), sondern die Welt-Uhr (UB1). Ob
  die Welt-Uhr zwischen Mitspielern gleich läuft, ist nicht verifiziert.

---------------------------------------------------------------------------------------------------------------------------
## (5) DIE BAHNEN — ausschließlicher Datei-Besitz

### 5.1 Reihenfolge
A ∥ B, dann C ∥ D ∥ E, dann F; G parallel zu F. Jede Kern-Bahn belegt „außerhalb byte-gleich“ mit
`node scripts/werkbank.cjs abdruck --gegen 0469be5e`.

### 5.2 Die Bahnen
| Bahn | Dateien (ausschließlich) | Inhalt | ZIELBILD |
|---|---|---|---|
| **A Kern Wetter** | phyto-core.js | `wetterAmOrt` (mix 45 s, U10_ms, P_mmh, Gate, P_ref); `windRichtung(…, ort)` mit θ0 aus `ort.wetter`; `wetterAt` byte-gleich | Mess-Wiese (−280,4 \| −1045,6), Saat „anazh-realm-seed“, t = 0: Zeile regen, q 0,030 → trockene Front, U₁₀ 8,4 m/s (gerechnet). Ego, 1,7 m, Blick windab (Grundrichtung +x 0,607 / +z 0,795): Gras biegt stark, der Himmel ist grau, **kein Tropfen** fällt. |
| **B Kern Wasser** | gelaende-core.js | `bodenSe`, `emc`, `et0`, `wasserSchritt`, `wasserBlock` mit Identität; `PEGEL.regen` folgt; `ORT_FELDER.wetter` trägt windX/windZ (:5701); `pegelLauf` mit `mittel` = P̄ | Fluss nächst der Mess-Wiese, Third 12 m hinter, 5 m hoch, Blick aufs Ufer: Nach einer Regen-Front hebt sich der Spiegel sichtbar, bleibt aber im Bett (Hub ≤ 2,4·tf statt 13·tf an der Krone). |
| **C Brand** | stamm/feld-brand.js, stamm/dirigent-kern.js (Licht der Ellipse :1806) | `lastAm`; M je Zelle zu ihrer Zeit aus `_wasserAm`; B7/B8; Tat {w_verbrannt}, keine Sperre; I_B netto treibt Flammen und Licht | Mess-Wiese, Third 12 m hinter dem Herd, 6 m hoch, Blick windab, im Brennfenster (Median 695 s). Die Fackel zündet. Die Front läuft als Ellipse windab mit ≈ 1 m/s; nach 30 s steht der Kopf ≈ 30 m vorn, dahinter ist die Schneise schwarz. Erreicht die Regen-Kante die Front, erlischt das Gras binnen 4 s. Eine Zelle 2 km entfernt brennt weiter. |
| **D Ort-Leser** | stamm/bild-himmel.js, stamm/stoff-material.js, stamm/stoff-karte.js, stamm/koerper-fahrt.js, stamm/siedlung-wege.js, stamm/speicher-laden.js, stamm/wasser-hydro.js, stamm/klang.js | `_wasserAm`-Memo; Pegel-Stempel an der Kachel; Film am Auge → Uniform; `_windAt` mit Stärke am Ort; `_temperaturAt(x, z, y, traegTage)` zur Welt-Uhr (Rufer feld-brand.js:315 per C, koerper-fahrt.js:2398, siedlung-wege.js:581, klang.js:492); `nassTage` als Funktion; `naesse` fällt aus dem Stand | Straße an der Mess-Wiese, Ego im Wagen: Nach dem Regen-Ende trocknet die Fahrbahn in ≈ 10 min Welt (Median 620 s, p10 235 s, p90 1370 s; `film.cjs`). Fährt man der Front 1 km entgegen, ist die Straße dort trocken, am Rad ändert sich der Griff. Den Sicht-Regler auf Nacht ziehen ändert die Zünd-Wärme nicht mehr. |
| **E Boden & Bett** | stamm/gelaende-boden.js, voxel-worker.js, stamm/vegetation-wiese.js, stamm/gelaende-kollision.js, stamm/feld-leben.js | `_feuchteAt` → `bodenSe` (Main und Faden aus EINER Kern-Funktion); `lastAm`-Bausteine (p geschlossen, `forestKronenDeckung`-Erwartung); `_wuchsAt` liest θ; Narbe als Integral (feld-leben.js:2683–2691, `_tatDauer`); `_temperaturAt`-Rufer feld-leben.js:2484, :2509 | 1 km von der Mess-Wiese, jenseits Ring 4, Third 20 m hoch: Die Fackel zündet dort wie am Spawn. Null-Renderer: „ohne Karte“ 1926 von 2401 → 0 Zellen. Ufer der Mess-Wiese, HOLZ-Profil vorher ↔ nachher der Wiese. |
| **F Linse** | scripts/lib/stand-linse.cjs, scripts/diag-stand-takt.cjs, scripts/diag-fahr-leben.cjs, scripts/diag-kreatur-leben.cjs, scripts/fahr-proben.cjs, scripts/ausgabe-aufnahme.cjs | Familie der Brand-Linse (stand-linse.cjs:396, :454), Einzelheiten unter 5.3 | — |
| **G Richter** | Zweig koordination: meisterkarte-quelle/punkte/stationen/g1.js | Bett-Filter liest `f.anteil` (feld-brand.js:256–262) statt `f.leb / auraAt().lebendig` (k:g1.js:1424–1425); der Herd sucht das Brennfenster am Ort aus der Funktion statt eigener Uhr (UB11); neue Sollwerte (7) | Herd mit Bett 1, beide Geräte: Flammen ≥ 200 px **und** Ort-Probe. |

### 5.3 Linse (Bahn F)
- **Identität ROT am Täter:** ROT nennt Block und Term, z. B. Es fehlt. Mutant: Term Es weg ⇒ ROT.
- **Ort-Probe headless:**
  - Herd A im Regen, Herd B 2 km entfernt im Brennfenster.
  - Soll: A erlischt ≤ 10 s, B brennt ≥ 60 s.
  - Mutant: die Welt-Nässe zurück ⇒ ROT.
- **Absenz-Grep, Ziel 0 Treffer:**
  - `state.naesse` in stamm/ und scripts/;
  - `_weatherFieldFor(this.state.weather)` in `_windAt` und `_temperaturAt`;
  - `timeOfDay` in `_temperaturAt`;
  - `lebendig` und `_kontaktStoffAt` in feld-brand.js.
- **Laufzeit:** ≤ 3 min.

---------------------------------------------------------------------------------------------------------------------------
## (6) DIE SPROSSEN

**Können fallen:**
- **kaskade#1** (Regen löscht Brand): Der Regen trifft die Zelle an ihrem Ort.
  - Löschen: Gras 3,8 s, Laub 39,9 s.
  - „Hält im Trockenen“ ist jetzt ein Test: Die Ort-Probe hält, Brennfenster Median 695 s. Heute ist der Test leer (A3).
- **kaskade#2** (Regen → Nässe → Stoff → Brand → Licht): Jedes Glied liest seinen Vorgänger am Ort; das Licht liest I_B.
  - Festhalte-Probe: P halten ⇒ M steht ⇒ Front steht.
  - Im Sturm erstickt Gras nach 2,3 s statt 3,6 s.
- **physik.feuer#1** (zündet trocken, nass nicht): Das Bett trägt überall (B4), M am Ort.
- **stoerung#1** (Brand schwärzt die Zelle): Die Asche S_T · w an der Zelle; die Zelle ist nicht mehr auf die Bett-Maske des
  Rings beschränkt.
- **wetter-welt#3** (Nässe, Pfützen, Pegel): Der Film ist am Ort, ohne Stand (SP2), der Pegel im Bett. Das Luma-Band bleibt U
  (Tafel).
- **gewalt#4** (Dürre → Brand, der W-Teil 100 %): Die Dürre senkt θ, β fällt, die Laub-EMC fällt, Laub brennt eher.
- **zeitreise#3 / #6** (Teil): Nässe und Feuchte sind Funktionen der Uhr (UB8); die Temperatur ist für alle gleich (UB1).
- **kohaerenz#2** (Teil): Relief → Wasser → Feuchte → Pflanze über EINE `bodenSe` (Z5). Z1/Z3 Wald-Dichte nicht.

**Teilweise:**
- **physik.feuer#2:**
  - Bedient: trocken-windige Lage, Bett überall, Halt an nassem Gras und am Wasser.
  - Rot bleibt das Tempo bei schwachem Wind: Code/CSIRO 0,26 bei 2,4 m/s und 0,41 bei 5 m/s (B1, das Gesetz des Feuers).
  - B6 (Bild ≤ 32 Zellen) und EB8 (2000 Zellen ≠ 10⁴ m²) bleiben.
- **physik.feuer#7:** B4 und B5 bedient. Nicht bedient: SP1 (die Front reist nicht, nur die Tat) und K15 (Saison).
- **stoerung#2:** SP7 bedient. UB4 nicht (das Jahr 2400 s).

**Nicht bedient:**
- **stoerung#3** (Abfluss nach Brand, K8): Der Pegel liest Stempel je Kachel, nicht den Beiwert der Narbe.
- **gewalt#1** (Blitz, K13).
- **terraform#1:** `_setWeather` (feld-dsl.js:943) setzt das EINE Wort, keine Tat am Ort.
- **wetter-welt#2:** Das Soll ±20° ist gewählt, Ekman spricht für 20–45°.
- **wetter-welt#4** (Bewohner, TL3, K10).
- **ereignis#2** (Bewohner weichen, K4).
- **kohaerenz#3** (Regenschatten, K9).

---------------------------------------------------------------------------------------------------------------------------
## (7) DIE FALSIFIKATION

### 7.1 Was diesen Entwurf widerlegt
1. **Ort-Probe im Spiel** (Bahn F/G, 20 Saaten):
   - Brennt der Herd im Brennfenster nicht ≥ 60 s, während 2 km entfernt Regen fällt, trägt das Gesetz nicht.
   - Ebenso, wenn der Herd im Regen am Ort nicht binnen 10 s erlischt.
   - Grenze: > 0 von 20 Fehlern. Dann lebt der Zwilling Welt-Nässe weiter.
2. **Bilanz:** Ein Block-Schritt mit |Fehler| > 10⁻⁹ kg/m² im Spiel bricht die Erhaltung (headless 5,1·10⁻¹⁵).
3. **Funktion:** Nach einem Welt-Uhr-Sprung von 1 h weicht der Brennbar-Entscheid zwischen Memo und Neurechnung in > 1 % der Zellen
   ab. Dann trägt die geschlossene Funktion nicht (headless 0/120 bei Laub 2 Tage).
4. **Kopplung an Wind und Feuchte:** Hängt R in der Ort-Probe nicht messbar an beiden, trägt die Kopplung nicht.
   - Grenzen: R(U₁₀ 24)/R(1,44) < 2 oder R(M 0,03)/R(M 0,09) < 1,5 bei 7,2 m/s.
   - Der Code heute: 34,4× bzw. 1,8×; CSIRO 1,91×.
5. **Preis:** Kostet die Bilanz am Kopf mit 2000 brennenden Zellen > 1 % des Brand-Schritts (> 74 µs je Welt-s; gerechnet 14 µs),
   ist der Preis falsch gebunden.

### 7.2 Zirkel-Gefahr (beweist nichts)
- **Die Brennbar-Anteile** (19,3–21,6 % Gras, 14,9–17,3 % Laub) sind Ausgaben des eigenen Modells. Sie sind Messgrößen, kein Soll.
- **„Abfluss = Spende“** ist eine Identität, denn P_ref ist aus der Spende abgeleitet. Die Pegel-Zahl beweist nur die Rechnung,
  nicht die Natur.
- **Unabhängig sind:**
  - (a) CSIRO für das Tempo (Cheney, Gould & Catchpole 1998): R_code/R_CSIRO ∈ [0,5, 2] bei U₁₀ 2,4 / 7,2 / 10 m/s und M 0,06.
    Heute 0,26 / 0,59 / 0,85, also rot bei 2,4.
  - (b) die Lösch-Zeit gegen die Extinktions-Feuchte nach Anderson; diese Schwelle ist eine Konstante, also nur halb unabhängig.
  - (c) P̄ 1095 mm/a gegen das Klima-Band Mitteleuropas 600–1200 mm/a.
  - (d) Der Regen fällt in 29,2 % der Zeit, real sind es ≈ 7–15 % der Stunden. Das ist ein Befund gegen die Zeilen des Wetters,
    nicht gegen die Bilanz: P_ref 0,834 mm/h ist Niesel, weil die Front zu oft regnet.

### 7.3 Die rote Station (k:g1.js:1425)
- **Wer heilt:** Die Heilung besitzt Bahn G. Der Filter liest `f.anteil ≥ 0,99`. Nach diesem Gesetz verschwindet `leb` aus
  `_brandStoff` ohnehin.
- **Was das Soll misst:** Das Soll (≥ 1 Zelle, ≥ 200 Flammen-Pixel, `trockenS` 60, k:g1.js:1660) misst EXISTENZ, keine Kopplung.
- **Neues Soll** für kaskade#1/feuer#2: Ort-Probe (7.1.1) und Festhalte-Probe (6). Das Tempo richtet physik.feuer#2 mit dem
  CSIRO-Band (belegt, unabhängig von Rothermel, also kein Zirkel).
