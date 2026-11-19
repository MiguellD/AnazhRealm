# Lese-Blatt (h) — DIE RICHTER der Kopplung

Zensus der Kopplung, Thema (h). Wer urteilt, ob Feuer, Wetter, Wasser, Stoff, Nachwuchs und Wesen aneinander hängen. Gelesen am Arbeitsbaum
(main-Kopf b7ed841 plus Zensus-Blätter) und an `origin/koordination` (Stand `meisterkarte-quelle/punkte/stand.json`, Kopf b7ed8419).
Abkürzungen: `k:` = `origin/koordination:meisterkarte-quelle/punkte/stationen/`, `km:` = `origin/koordination:meisterkarte-quelle/punkte/messung/`.

## 1. Kopf

- **Was die Richter sind:** Im Code gibt es drei Arten von Richtern.
  1. Die **Stationen der Punkte-Maschine** (`k:g1.js` und weitere, nur im Zweig `koordination`): eine Station = Befehl + Urteil + Proben.
  2. Die **Linsen in `scripts/`**, die headless in CI laufen: `diag-stand-takt`, `diag-kreatur-leben` (über `diag-kreatur-takt`), `fahr-proben` (W-Kette), `diag-wasser-leben`, `diag-kopplung`.
  3. Die **Spiel-Proben** `scripts/playtest/*.cjs`: Sie fassen weder Brand noch Nässe an (Grep nach `brand|naesse` in `scripts/playtest/` und `scripts/playtest.cjs` ist leer).
- **Was jeder Richter liest:** Alle Brand-Richter lesen dasselbe Feld `state.brandFeld` (16-m-Zellen, `stamm/feld-leben.js:3078`). Getaktet wird es von `_tickBrand` (`stamm/feld-brand.js:470–499`). Die Nässe ist EIN globaler Skalar `state.naesse` (`stamm/bild-himmel.js:3060–3087`).
- **Die Kaskaden-Probe `karte2.same.kopplung.kaskade#1`** steht in `k:g1.js:5796` (Registrierung), `k:g1.js:1385–1612` (Probe `brandSitzungProbe`) und `k:g1.js:1644–1668` (Urteil `kaskadeUrteil`). Sie läuft nur auf GPU-Geräten (radeon, gtx), nie in CI.
- **Die Prämisse im Brief ist falsch:** Das Soll der Kaskade ist NICHT „≥ 200 Zellen“. Es ist **≥ 1 brennende Zelle UND ≥ 200 warme Flammen-PIXEL** (`k:g1.js:1660`).
  - In allen 19 gebuchten Messungen mit Zahl stehen „1 brennende Zellen“ und „Regen löscht nach 7 s“ (22 Dateien `km:*.json`, 3 davon Proben-Fehler).
  - Das ROT kam jedes Mal aus dem BILD.

## 2. DIE GRÖSSEN

| # | Name | Einheit oder „Stellwert ohne Einheit" | Wert/Bereich | Anker (datei:zeile) | Schreiber | Leser | FOLGT oder GESETZT |
|---|------|------|------|------|------|------|------|
| 1 | Kaskade Trocken-Dauer `trockenS` | s Spielzeit | 60 | `k:g1.js:1587` | `brennen` `k:g1.js:1400–1403` | `kaskadeUrteil` `k:g1.js:1660` | GESETZT (die Leiter S1 nennt keine Dauer) |
| 2 | Kaskade: brennende Zellen nach 60 s | Zellen à 16 m | Soll ≥ 1; gemessen 1 (19/19) | `k:g1.js:1660` | `brennt` `k:g1.js:1404` | `k:g1.js:1660` | GESETZT (Leiter S1 „eine Zelle") |
| 3 | Kaskade: Flammen im Bild `fB` | Pixel je Bild 960×540 | Soll ≥ 200; Radeon +261 (`km:d39e0d6e-radeon.json`), GTX +35 (`km:18058dba-gtx.json`) | `k:g1.js:1660`; Grund „Gras-Rauschen ±150" `k:g1.js:1651`, `:5816` | `schuss` `k:g1.js:1550–1575` | `k:g1.js:1660` | GESETZT |
| 4 | Warm-Regel eines Pixels | 8-bit RGB | R ≥ 150, R ≥ 1,3·G, G ≥ 1,15·B | `k:g1.js:1466` | — | `k:g1.js:1466` | GESETZT |
| 5 | Sätze MIT/OHNE/OHNE | Anzahl / ms | 5 / 500 | `k:g1.js:1550` | — | Median `k:g1.js:1574` | GESETZT |
| 6 | Kaskade: Regen-Löschzeit `regenS` | s Spielzeit | Soll ≤ 60; gemessen 7 (19/19) | `k:g1.js:1596`, `:1660` | `brennen(300, takt)` `k:g1.js:1596` | `k:g1.js:1660` | Soll GESETZT; die 7 s folgen aus #24–#29 |
| 7 | Kaskade: Rest-Flammen nach dem Regen `fC` | Pixel | ≤ 20 | `k:g1.js:1660` | `schuss("erloschen")` `k:g1.js:1602` | `k:g1.js:1660` | GESETZT |
| 8 | Kaskade: Herd-Ring | Zellen | 2–8 um die Mess-Wiese | `k:g1.js:1427` | — | `k:g1.js:1427–1435` | GESETZT |
| 9 | `BETT_VOLL` | Anteil des Betts | 0,99 | `k:g1.js:1424` | — | `k:g1.js:1430` | GESETZT |
| 10 | `KRONE_OFFEN` | Stellwert ohne Einheit (`_kronenStreuAt`) | 0,05 | `k:g1.js:1417` | — | `k:g1.js:1430` | GESETZT |
| 11 | FRONT-MIT (stoffe.K2#1) | m/s | Soll 0,5–2; gebucht 0,911 (18 Köpfe, d3708675) | `scripts/lib/stand-linse.cjs:454`; `k:g1.js:5096` | `scripts/diag-stand-takt.cjs:2905–2932` | `stand-linse.cjs:454` | GESETZT (liegt im Literatur-Band 0,1–3) |
| 12 | FRONT-GEGEN | m/s | Soll ≤ 0,2; gebucht 0,023 | `stand-linse.cjs:455` | wie #11 | `stand-linse.cjs:455` | GESETZT |
| 13 | BRAND-BLIND (Mutante ohne Wind) | m/s | Soll < 0,5; gebucht 0,041 | `stand-linse.cjs:456` | `diag-stand-takt.cjs:2933–2934` | `stand-linse.cjs:456` | GESETZT |
| 14 | Köpfe mit dem Wind | Anzahl | ≥ 3 | `k:g1.js:5096` | `diag-stand-takt.cjs:2930–2931` | `k:g1.js:5096` | GESETZT |
| 15 | REGEN (`--brand`, stoffe.K2#2) | s Spielzeit | Soll ≤ 60; gebucht 7 (Mutante 300) | `diag-stand-takt.cjs:802` | `brandSeite` `diag-stand-takt.cjs:846–1179` | `brandUrteil` `:793–817` | GESETZT |
| 16 | Brand-Flucht der Herde | Anteil | ≥ 0,8 binnen 10 s; Herd 15 m entfernt; ohne Brand 0 | `scripts/diag-kreatur-leben.cjs:164`, `:1471–1475` | `:143–197` | `:1471–1475` | GESETZT |
| 17 | Ketten-Tiefe (feld.K1) | Glieder | ≥ 2 (#1), ≥ 4 (#2) | `k:g1.js:4825`, `:4853` | `scripts/lib/fahr-proben.cjs:401–477` | Station | GESETZT (Leiter kaskade S2 „≥ 4") |
| 18 | Pegel-Hub P4 (wetter.K3) | m | ≥ 0,2 nach 20 min Sturm, gehalten 0 | `scripts/diag-wasser-leben.cjs:315` | `:28`, `:314` | `:315` | GESETZT |
| 19 | Sukzession r (stoffe.K5#1) | Korrelation | ≥ 0,5; gebucht 0,825 | `k:g1.js:5388` | `diag-stand-takt.cjs --nachwuchs` | Station | GESETZT (Leiter stoerung S2) |
| 20 | Zelle | m | 16 | `stamm/feld-leben.js:3078` | — | jeder Brand-Richter, `brennt` `k:g1.js:1404` | GESETZT (das Hydrosphären-Raster) |
| 21 | Brand-Schritt `schrittS` | s Spielzeit | 1 | `stamm/feld-brand.js:894` | — | `_tickBrand` `stamm/feld-brand.js:495` | GESETZT |
| 22 | Wind je Wort | Stellwert ohne Einheit | klar 0,06 · bewölkt 0,3 · nebel 0,1 · regen 0,35 · sturm 1 | `phyto-core.js:4288–4293` | `_windAt` `stamm/stoff-material.js:239` | `_brandTempo` `stamm/feld-brand.js:321–329` | GESETZT |
| 23 | `sturmMS` | m/s in 10 m Höhe | 24 | `phyto-core.js:4318` (Kommentar `:4314`) | — | `_windAt` | GESETZT |
| 24 | Regen je Wort `rain` | Stellwert ohne Einheit | klar 0 · nebel 0 · bewölkt 0,12 · regen 0,6 · sturm 1 | `phyto-core.js:4288–4293` | — | `_naesseTakt` `stamm/bild-himmel.js:3078`; `koerper-core.js:5341` | GESETZT (kein mm/h im Code: Grep „mm/h" in `stamm/`, `phyto-core.js` leer) |
| 25 | `NAESSE.regenAb` | Stellwert ohne Einheit | 0,05 | `stamm/stoff-material.js:3789` | — | `bild-himmel.js:3078`; `stoff-material.js:2232` | GESETZT |
| 26 | `NAESSE.benetzenS` | s | 150 | `stoff-material.js:3790`; Anker „Regen 0,6 nach 10 min 0,91" `:3778` | — | `_naesseKurve` `stoff-material.js:2232` | GESETZT (der Anker ist ein gewählter Satz) |
| 27 | Nässe `state.naesse` | Stellwert ohne Einheit, 0–1, EIN Wert je Welt | 0…1 | `bild-himmel.js:3080` | `_naesseTakt` `bild-himmel.js:3080` | `_brandFeuchte` `feld-brand.js:284`; W-Kette `fahr-proben.cjs:440–442` | GESETZT (Kurve aus #24–#26) |
| 28 | Feuchte trocken / faser / nass | kg/kg | 0,06 / 0,35 / 2,5 | `feld-brand.js:975` (Quellen `:888–889`) | — | `_brandFeuchte` `feld-brand.js:284` | FOLGT (Rothermel 1972, Anderson 1982, Matthews 2006); `nass` × #27 setzt kg/kg auf einen Stellwert |
| 29 | Erlöschungs-Feuchte `mx` Gras / Laub | kg/kg | 0,12 / 0,25 | `stamm/bau-vorlagen.js:1647–1648` | — | `feld-brand.js:310` | FOLGT (Anderson 1982, Modelle 1 und 9) |
| 30 | Gras-Bett σ, Last | 1/m, kg/m² | 11483, 0,166 | `bau-vorlagen.js:1647` | — | `feld-brand.js:302` | FOLGT (Anderson 1982, Modell 1: 3500 1/ft, 0,034 lb/ft²) |
| 31 | Gras-Bett Tiefe | m | 0,42 (`GRASS_BLADE_H`) | `stoff-material.js:3827`; `bau-vorlagen.js:1647` | — | `feld-brand.js:302`, `:327–329` | GESETZT (Halm-Höhe statt Modell 1 mit 1 ft = 0,305 m) |
| 32 | Wind-Deckel `min(0,9·I_R, u)` | ft/min | — | `feld-brand.js:330` | — | `feld-brand.js:330` | FOLGT (Rothermel 1972); in der Literatur strittig, siehe 5.3 — unsicher |
| 33 | `lbMax` | Verhältnis L/B | 8 | `feld-brand.js:977` | — | `feld-brand.js:336` | FOLGT (Anderson 1983, Kommentar `:891`) |
| 34 | Regen-Schwelle der Bewohner | Stellwert ohne Einheit | ab 0,3 ± 0,15 | `koerper-core.js:5218` | — | `koerper-core.js:5341` | GESETZT; ohne Richter |

Gezählt: **34 Größen, davon 5 FOLGT (#28, #29, #30, #32, #33) und 29 GESETZT. 6 tragen keine Einheit (#10, #22, #24, #25, #27, #34).**
Jedes Soll eines Richters (#1–#19) ist GESETZT. Keines folgt aus der Physik, die es richtet.

## 3. DIE FLÜSSE — welche Kopplung welcher Richter liest

### 3.1 Die Richter-Liste

Spalten:
- **E/K:** Existenz oder Konsum.
- **Selbsttest:** ob der Richter am Täter ROT wird.
- **Soll:** belegt, gewählt oder unsicher.

| Richter | Ort | Kopplung | E/K | Selbsttest | Soll | CI |
|---|---|---|---|---|---|---|
| `karte2.same.kopplung.kaskade#1` | `k:g1.js:5796`, Probe `:1385–1612`, Urteil `:1644–1668` | Nässe → Brand; Brand → Bild | K für das Bild und den Regen. E für „hält im Trockenen": ≥ 1 Zelle hält der Herd allein, siehe 4.B2 | 17 Roh-Zeilen, 17/17 urteilen wie erwartet. Keine Zeile prüft mehr als eine Zelle | gewählt (#1–#7) | nein (GPU) |
| `karte2.same.kopplung.stoerung#1` | `k:g1.js:5771`, Urteil `:1631–1641`, dieselbe Probe | Brand → Boden-Bild (Schwärze, Asche) | K (Bildpaar) | 8/8 Roh-Zeilen | gewählt (Luma-Verhältnis ≤ 0,5, Asche ≥ 0,99) | nein |
| `karte2.mensch.zeit.erleben#1` | `k:g1.js:5833`, dieselbe Probe | Brand → Ort danach anders | K (Bildpaar) | 5/5 Roh-Zeilen | gewählt (≥ 50 % des Ausschnitts um ≥ 30 % dunkler) | nein |
| `karte2.same.kopplung.ereignis#1` | `k:g1.js:5856` | Lava → Glut → Stein (kein Feld-Brand) | K (Bild) | 13/13 Roh-Zeilen | gewählt | nein |
| stoffe.K2#1 | `k:g1.js:5081`; Linse `diag-stand-takt.cjs:2890–2949`, `stand-linse.cjs:443–460` | Wind → Front | K am echten `_tickBrand` in der Stand-Welt, aber Nässe gestubbt (`:2900`) | 0 Roh-Zeilen in der Station; die Linse hat Datenzeilen-Mutanten (`diag-stand-takt.cjs:539–549`) und EINE Live-Mutante (Wind aus, `:2933`) | gewählt, im Band | ja: Lauf ohne Flag, `package.json:78`, `check.yml:674` |
| stoffe.K2#2 | `k:g1.js:5156`; `diag-stand-takt.cjs --brand` `:846–1179` | Boden-Feuchte → Halt, Regen → Erlöschen, Brand → Licht/Rauch/Kante/Asche | K, aber `trocken()` stubbt die Nässe (`:872`) | Datenzeilen `:1864`; Mutanten in der Linse | gewählt | **nein** (`--brand` steht in keinem Gate) |
| stoffe.K5#1/#2 | `k:g1.js:5388`, `:5460`; `sukzessionUrteil` `diag-stand-takt.cjs:826–844` | Asche → Nährstoff → Nachwuchs | K headless | Mutante „Nährstoff gleich" in der Linse | r ≥ 0,5 aus der Leiter | **nein** (`--nachwuchs` steht in keinem Gate) |
| feld.K1#1/#2 | `k:g1.js:4825`, `:4853`; `fahr-proben.cjs:401–477` | Regen → Nässe → Stoff → Brand → Licht | K der Glieder, headless. Der Brand geht EINEN Schritt nach einem Sprung von 20 min (`:401–405`) | Halte-Mutanten `festRegen`/`festNaesse`/`festBrand` (`:456–467`) | Tiefe aus der Leiter | ja: `package.json:141`, `check.yml:795` |
| feld.K3#2 | `k:g1.js:4696` | Brand-Kosten, -Asche, -Licht (BRAND-*) | K headless | wie stoffe.K2#1 | gewählt | ja (wie stoffe.K2#1) |
| Brand-Flucht | `diag-kreatur-leben.cjs:143–197`, Urteil `:1471–1475` | Glut → Tier-Furcht (`_kreaturGlutNah`, `stamm/kreatur-furcht.js:87`) | K am echten Leser | ja: Täter `brand-flucht` deckt `_kreaturGlutNah` (`:150`, Regex `:1535`) | gewählt | ja: `gate:kreatur-takt` (`package.json:100`, `check.yml:971–979`). **Keine Station liest ihn** (oekologie.K3 `k:g2.js:5604` richtet die Furcht, nicht die Glut) |
| P4 Regen → Pegel | `diag-wasser-leben.cjs:28`, `:314–315` | Regen → See und Bach | K headless | Datenzeilen `:717–719`, gehaltenes Regen-Feld | gewählt | ja: `check.yml:1166` |
| F3 FELD (wetter.K5) | `scripts/diag-kopplung.cjs:222–267` | Wind → 6 Leser (Gras, Wasser, Regen, Tuch, Rauch, Wagen) | K | ja: Mutation je Leser `:260–267` | gewählt | ja: `check.yml:1105`. Die Brand-Front ist keiner der 6 Leser; sie deckt stoffe.K2 BRAND-BLIND |
| `diag-wetter-wache` | `scripts/diag-wetter-wache.cjs:3–6` | das Schreiber-Gesetz von Uhr und Wetter | Struktur, keine Kopplung | ja | — | ja (`check:statik`) |
| `diag-brennglas-takt` | `scripts/diag-brennglas-takt.cjs:3–6` | Kosten des Brennglas-Takts | Kosten, keine Kopplung | ja | — | ja (`check:statik`) |
| `diag-mp-sync` | `scripts/diag-mp-sync.cjs:211`, `:986–996` | der Brand-Zustand ist auf allen Seiten gleich | Netz, keine Physik | — | — | (nicht nachgelesen) |

### 3.2 Gerichtete Kopplungen

| Kopplung | Richter | Lauf |
|---|---|---|
| Wind → Front | stoffe.K2#1 | CI |
| Nässe → Erlöschen | stand-takt BRAND-ERLISCHT (CI), stoffe.K2#2 REGEN (nicht CI), feld.K1 (CI), kaskade#1 (GPU) | gemischt |
| Boden-Feuchte (Hydrosphäre) → Halt | stoffe.K2#2 HALT | nicht CI |
| Brand → Licht / Klang / Rauch | stoffe.K2#2 LESER; stand-takt BRAND-LESER | CI |
| Brand → Asche → Nachwuchs | stoffe.K5 | nicht CI |
| Glut → Tier-Flucht | `diag-kreatur-leben` | CI, ohne Station |
| Regen → Pegel | P4 | CI |

### 3.3 Kopplungen OHNE Richter (benannt, mit Ort)

1. **Hang → Front.** Der Hang-Term `phiS` steht in `stamm/feld-brand.js:332`. Kein Richter: Grep nach `phiS|Hang|bergauf` in `scripts/diag-stand-takt.cjs` und `scripts/lib/stand-linse.cjs` ist leer.
2. **Ausbreitung im GEKOPPELTEN Wetter.** Jeder Ausbreitungs-Richter hält die Nässe auf 0: `diag-stand-takt.cjs:2900`, `:872`, `:1374`, `:1603`. Kein Richter misst die Front, während das Wort seinen Regen schreibt (4.B3, 4.B4).
3. **Lufttemperatur → Zünd-Wärme.** `_brandTempo` liest `_temperaturAt` (`stamm/feld-brand.js:315`). Kein Richter.
4. **Brand → Körper.**
   - `damagePlayer` dämpft Feuer-Quellen (`stamm/koerper-seele.js:317`). Kein Schreiber aus dem Brand-Feld.
   - Die Rufer sind `dirigent-takt.js:1144` („sturz“), `feld-dsl.js:1842` (DSL) und `kreatur-verhalten.js:1553` („jagd“).
   - Weder Kopplung noch Richter.
5. **Brand → Gebäude.** `stamm/feld-brand.js` liest `architectures` an 0 Stellen (Grep-Zahl 0). Weder Kopplung noch Richter.
6. **Brand → Bewohner meiden die Front** (ereignis S2).
   - Die Glut liest nur die Tier-Furcht (`stamm/kreatur-furcht.js:87`).
   - In den Siedlungs-Dateien steht kein Glut-Leser: Grep `glut|_brandLebt|_brandGlutUm` trifft dort nur Bau-Satz-Farben, `stamm/siedlung-satz.js:91`.
   - Weder Kopplung noch Richter.
7. **Brand → Abfluss/Pegel** (stoerung S3 „Pegel-Spitze ≥ 1,3×"). Kein Leser, kein Richter.
8. **Tier-Rückkehr nach 3–10 a** (stoerung S3). Kein Richter.
9. **Regen → Bewohner drinnen** (mensch.kopplung.leben S1).
   - Die Kopplung steht: `koerper-core.js:5208–5218`, gelesen in `:5341`.
   - Der Kommentar nennt eine einmalige Zählung („31 von 77“).
   - Es gibt keine Station (Grep `kopplung.leben` in `k:g*.js` trifft nur `leben.kopplung.leben-formt-planet`) und keine Linse (Grep `regen.ab|TAGES_GESETZ.regen` in `scripts/` leer).
10. **Regen → Boden-Feuchte → Wuchs.**
    - `_feuchteAt` (`stamm/gelaende-boden.js:1538`) trägt keinen Nässe-Term.
    - `_wuchsAt` (`stamm/vegetation-wiese.js:2078`) setzt eine konstante Wasser-Basis.
    - Weder Kopplung noch Richter.
11. **Örtliche Nässe → Brand** (Dach, Krone, Senke). `state.naesse` ist EIN Wert je Welt (`bild-himmel.js:3080`). Jede Brand-Zelle liest denselben Wert (`feld-brand.js:284`). Kein Richter könnte einen örtlichen Unterschied sehen.

## 4. DIE BRÜCHE

- **B1 — Pixel und Zelle verwechselt.**
  - „Soll ≥ 200 Zellen nach 60 s“ steht in keinem Richter.
  - Die Kaskade verlangt `e.brennt.zellen >= 1 && … && fB >= 200` (`k:g1.js:1660`). Die 200 sind warme Flammen-Pixel.
  - Das ROT am main-Kopf kommt aus dem BILD der GTX: `km:18058dba-gtx.json` hat Herd −248,−1080, Bett 1, +35 Pixel und „4 Flammen gezeichnet“.
  - Die letzte grüne Radeon-Messung `km:d39e0d6e-radeon.json` hat Herd −248,−1064, +261 Pixel und 32 Flammen.
  - Der Stand hat Kopf b7ed8419 und 0 Punkte; gtx ist „ungemessen“ (R6: `fachwerk-core.js`, `draw-zaehler.cjs`, `shader-kosten.cjs` +8).
- **B2 — Existenz statt Konsum im Trocken-Glied.**
  - `zellen >= 1` (`k:g1.js:1660`) erfüllt der Herd allein.
  - Unter „sunny“ (`k:g1.js:1395–1398`) läuft der Kopf mit 0,076 m/s. Die Zelle ist 16 m breit, also brennt der Herd etwa 210 s, plus 6,6 s Verweilzeit (`tr` aus `feld-brand.js:338`).
  - „Hält im Trockenen“ kann deshalb nicht reißen, sobald der Herd fängt.
  - Keine der 17 Roh-Zeilen prüft eine zweite Zelle.
- **B3 — Zwilling der Bedingung in jedem Ausbreitungs-Richter.**
  - stoffe.K2#1 zündet unter „cloudy“ und ersetzt `_naesseTakt` durch `st.naesse = 0` (`diag-stand-takt.cjs:2899–2900`). `--brand` macht dasselbe (`:872`).
  - Im Spiel liegt der Regen von „bewölkt“ (0,12, `phyto-core.js:4289`) über `regenAb` 0,05 (`stoff-material.js:3789`), also ist das Ziel der Nässe 1 (`bild-himmel.js:3078`).
  - Gras erstickt dann nach 31 s (5.3).
  - Der Kommentar `:2890–2891` erklärt den Stub. Gebucht ist trotzdem stoffe.K2 GRÜN mit 0,911 m/s — eine Front, die die gekoppelte Welt nicht trägt.
- **B4 — Kein Wort ist trocken und windig.**
  - In `WX_GESETZ` (`phyto-core.js:4287–4294`) trägt jedes Wort mit Wind ≥ 0,3 einen Regen ≥ 0,12, also über `regenAb`.
  - Der stärkste regenfreie Wind ist „nebel“ mit 0,1, das sind 2,4 m/s.
  - Im gekoppelten Spiel kommt eine Front daher in 60 s höchstens auf 2 Zellen (Modell-Probe, 5.4). Das ist ein Bruch des Wetter-Gesetzes. Für die Richter heißt er: Die Ausbreitung, die sie messen, gibt es nur im Stub.
- **B5 — Die Uhr der Kaskade ist nicht die Uhr des Spiels.**
  - **Trocken:** 60 s laufen nur über `_tickBrand` (`k:g1.js:1400–1403`, `:1587`). Weder Spiel-Schleife noch `_naesseTakt` noch Wetter-Zug laufen.
  - **Regen:** Die volle Schleife `_gameLoopTick` läuft, aber mit 1 s Spielzeit je Bild (`k:g1.js:1401`, `:1596`).
- **B6 — Der Herd wandert zwischen den Messungen.**
  - Der Kommentar `k:g1.js:1420–1423` nennt −248/−1080 die Kies-Zelle mit Anteil 0,2 („25 schwache Flammen, +0 Pixel“). `BETT_VOLL` sollte genau sie ausschließen.
  - Trotzdem zündet die GTX an 18058dba und 1f300260 wieder bei −248,−1080, mit „Bett 1“ und 4 Flammen (`km:18058dba-gtx.json`, `km:1f300260-gtx.json`).
  - Warum, ist nicht gelesen (Abschnitt 6).
- **B7 — Der Selbsttest der Station prüft das Urteil, nicht die Welt.**
  - Die Roh-Zeilen sind synthetische JSON-Zeilen (kaskade 17, stoerung 8, erleben 5, ereignis 13).
  - Die Stationen stoffe.K2, stoffe.K5, feld.K1 und feld.K3 tragen 0 Roh-Zeilen.
  - Täter in der Welt gibt es nur in den Linsen: Wind-Mutante `diag-stand-takt.cjs:2933`, Halte-Mutanten `fahr-proben.cjs:456–467`, Deckel `diag-kreatur-leben.cjs:150`.
- **B8 — Richter, die außerhalb der CI laufen.**
  - `gate:stand-takt` fährt nur `--selftest`, den Lauf ohne Flag und `--narbe` (`package.json:78`, `check.yml:674`).
  - `--brand` (HALT, REGEN, LESER, KANTE, ASCHE) und `--nachwuchs` (Sukzession) laufen nur auf der Punkte-Maschine.
- **B9 — Ein Richter ohne Station.** Die Brand-Flucht (`diag-kreatur-leben.cjs:143–197`) läuft in CI. Keine Station der Meisterkarte bucht sie. Die Leiter stoerung S3 (Tierdichte) hat keinen Richter.
- **B10 — Toter Leser.** `damagePlayer` erkennt Feuer-Quellen (`stamm/koerper-seele.js:317`). Aus dem Brand-Feld schreibt keine Quelle hinein (3.3 Nr. 4).
- **B11 — Konstanten ohne physikalischen Anker hinter einer Mess-Zahl.**
  - Die 7 s Löschzeit sind das Produkt aus `rain` 0,6 (ohne Einheit, `phyto-core.js:4293`) und `benetzenS` 150. Den Anker von `benetzenS` setzt das Gesetz selbst: „Regen 0,6 nach 10 min 0,91“, `stoff-material.js:3778`.
  - `nass` 2,5 hat seinen Anker in der Sättigung der Streu (Matthews 2006, `feld-brand.js:889`). Dass die Nässe 0–1 linear auf die Feuchte wirkt, ist eine Wahl.
  - Die Sollwerte REGEN ≤ 60 s (`diag-stand-takt.cjs:802`, `k:g1.js:1660`) und FRONT-MIT 0,5–2 (`stand-linse.cjs:454`) tragen keine Quelle.
- **B12 — Leiter-Beleg ohne Bild.** Die Leiter kaskade bucht „Tiefe 4 mit Festhalte-Probe (feld.K1) — headless“ als Beleg. feld.K1 misst nach einem Sprung von 20 min EINEN Brand-Schritt (`fahr-proben.cjs:401–405`). Sprosse S2 verlangt den „Spielgang Sturm“ mit Bild.

## 5. Die Sprossen aus meisterkarte-2 — und was heute dient

Die Leitern haben kein eigenes Feld „Messname / Soll / Ort“. Gelesen werden: Messname = `id#nr` plus `umfang`/`tiefe`, Soll = `richter`, Ort = `klasse` (nur S1 trägt sie). Quelle: `origin/koordination:vision/meisterkarte-2.json`.

### 5.1 `same.kopplung.*` (wörtlich)

**same.kopplung.kaskade — „Die Kette der Stoff-Physik"**

- **Kopf:** heute 0, kern 0, fuss „gemessen“, alt `feld.K1`.
- **beleg:** „Kette regen → nässe → stoff → brand → licht, Tiefe 4 mit Festhalte-Probe (feld.K1) — headless; Bruch, Fluid mit Impuls und Beben fehlen als Glieder.“
- **#1:** „2 Glieder, eine Zelle“ · „Regen löscht Brand“ · preis „P im Ereignis-Fenster“ · klasse „Ort“ · richter „Bildpaar: Brand erlischt im Regen, hält im Trockenen, beide Geräte“.
  - Dient heute: `k:g1.js:5796`. Radeon GRÜN gehalten (d39e0d6e, +261 Pixel), GTX ROT/ungemessen (18058dba: +35 Pixel). 0 Punkte.
- **#2:** „4 Glieder an einem Ort (Regen → Nässe → Stoff → Brand → Licht)“ · „jedes Glied liest seinen Vorgänger“ · richter „Spielgang Sturm: Glieder, deren Bild sich ändert und beim Festhalten des Vorgängers stehen bleibt, ≥ 4“.
  - Dient heute nur headless: feld.K1#2 (B12). Kein Bild.
- **#3:** „Bruch → Körper → Fluid, 10³ m³“ · richter „N = 20 Saaten: Anteil, in dem jedes Glied im Bild eintritt ≥ 90 %“. Dient nichts.
- **#4:** „Beben → Bruch → Brand, ein Viertel“ · „Einsturz nach Lastpfad, Brand aus Herd und Stoff, Ausbreitung nach Bauweise“ · richter „N = 20: vollständige Ketten ≥ 80 %, Festhalte-Probe je Glied“.
  - Dient nichts. Der Brand liest keine Gebäude (3.3 Nr. 5).
- **#5:** „Beben → Bruch → Brand → Flut, eine Küstenstadt“ · richter „… vollständige Ketten ≥ 70 %; Wellen-Ankunft ±10 % gegen √(g·h)“. Dient nichts.
- **#6:** „Ausbruch → Asche → Dachlast → Einsturz → Lahar → Ernte, eine Region“ · richter „N = 20 Vulkan-Saaten: ≥ 5 von 6 Gliedern im Bild“. Dient nichts.
- **#7:** „Ketten, die nie als Klasse geschrieben wurden, auf 100 Fremd-Planeten“ · richter „Anteil der Planeten mit ≥ 1 Kette von ≥ 3 Gliedern … ≥ 80 %“. Dient nichts.

**same.kopplung.stoerung — „Die Antwort auf die Störung"**

- **Kopf:** heute 0, alt `stoffe.K5`.
- **beleg:** „Brand schwärzt, Asche düngt, Sukzession r = 0,825 (stoffe.K5) — Mechanik headless; Tier-, Wasser-, Siedlungs-Antwort fehlt.“
- **#1:** „1 Domäne, Stunden“ · „Brand schwärzt die Zelle“ · klasse „Ort“ · richter „Bildpaar Zelle vor / nach dem Brand, beide Geräte“.
  - Dient heute: `k:g1.js:5771`. Radeon GRÜN (Luma ÷ 0,320, Asche 1), GTX ungemessen. 0 Punkte.
- **#2:** „3 Domänen (Boden, Pflanze, Licht), 1 Jahr“ · „Asche düngt, Gras → Busch → Wald“ · richter „Zeitsprung 1 Spieljahr: Nachwuchs auf Asche, r(Tempo, Feuchte × Licht) ≥ 0,5“.
  - Dient heute: stoffe.K5#1, headless, nicht in CI.
- **#3:** „5 Domänen (+ Tier, Wasser), 10 Jahre“ · „Tiere fliehen und kehren zurück, Abfluss steigt“ · richter „Tierdichte −50 % sofort, Rückkehr in 3–10 a; Pegel-Spitze ≥ 1,3×“.
  - Die Flucht hat nur die Linse ohne Station (B9). Rückkehr und Pegel: nichts.
- **#4–#7:** Siedlung, Wirtschaft, Kultur, Wurzel. Dient nichts.

**same.kopplung.ereignis — „Mitten im Ereignis"**

- **Kopf:** heute 1, fuss „ungemessen“.
- **#1:** „eine 16-m-Zelle, 0 Menschen“ · „Glut, Lava erstarrt zu Stein“ · klasse „Ort“ · richter „Bild der Zelle in Glut und erstarrt, beide Geräte“.
  - Dient heute: `k:g1.js:5856`, beide Geräte GRÜN. 0 Punkte im Stand.
- **#2:** „1 ha, 10 Menschen“ · „Feuerfront mit Wind und Hang; Bewohner weichen“ · preis „P während der Front“ · richter „Frame p95 während 1 ha brennt; Bewohner meiden die Front = 100 %“.
  - Dient nichts.
  - 1 ha = 39 Zellen. Im gekoppelten Wetter brennen sie nie gleichzeitig (B4).
  - Bewohner lesen keine Glut (3.3 Nr. 6). Ein Hang-Richter fehlt (3.3 Nr. 1).
- **#3–#7:** km², Stadtbrand, Tsunami und mehr. Dient nichts.

**Ohne Brand- oder Wetter-Richter, je S1:**

| Leiter | S1 (richter) |
|---|---|
| `same.kopplung.aufwaerts` | „Haus bauen, aufsteigen: Pixel aus 400 m an seiner Stelle; Bildpaar an 10 Orten im Umkreis“ |
| `same.kopplung.kohaerenz` | „100 Saaten × 50 Punkte: Wasserläufe bergab in Senke oder Meer ≥ 95 %“ |
| `same.kopplung.gewalt` | „Blitz-Brand aus Trockenheit × Gewitter des EINEN Wetters“; richter „100 Spieljahre Zeitraffer: Brände je km² und Jahr im Faktor 3 der Real-Rate“ |
| `same.kopplung.erdsaat` | „Bildvergleich gegen Relief-Modell; der Vulkan bricht von selbst aus“ |
| `same.kopplung.zeitreise` | „Baum-Anteil ≤ 30 %, Stümpfe sichtbar, beide Geräte“ |
| `same.kopplung.terraform` | „Bildpaar mit und ohne Eingriff …“ |

Keine dieser Leitern hat eine Station (Grep `kriterium: "karte2.same.kopplung` in `k:g*.js` trifft nur stoerung, kaskade und ereignis). gewalt S1 setzt ein trockenes Gewitter voraus — das Wetter-Gesetz hat kein solches Wort (B4).

**Andere Kopplungs-Leitern, die Feuer oder Wetter nennen:**

| Leiter | Sprosse | Station |
|---|---|---|
| `planet.kopplung.wetter-welt` | S1 „Bildpaar klar/Sturm an derselben Pose: Richtlicht gedimmt, Himmel grau“ | `k:g3.js:2948`, beide Geräte GRÜN, 0 Punkte |
| | S2 „Gras, Bäume, Wolken, Rauch, Wasser zeigen dieselbe Richtung ±20°“ | ohne Station |
| | S3 „Luma porös nass/trocken 0,5–0,8; Pfützen in Senken r ≥ 0,5“ | ohne Station |
| `mensch.kopplung.leben` | S1 „1 Siedlung: Wetter ändert den Tag“ · „Regen → drinnen“ · richter „Anteil draußen sinkt ≥ 0,3“ | keine; Kopplung im Code, ohne Richter (3.3 Nr. 9) |
| | S2 „Missernte, Brand → Not“ | keine |
| `mensch.kopplung.sport` | S2 „Partien bei Regen ↓ ≥ 50 %“ | keine |
| `mensch.kopplung.leib` | S1 „Regen → Kapuze“ | keine |

### 5.2 Die Kaskade im Einzelnen (`k:g1.js:1385–1668`)

**1. Wetter.** `trocken()` setzt über `__wetterSetzen` das Wort des Spielers „sunny“ und ruft `_naesseTakt(1e6)` (`k:g1.js:1395–1398`). Die Nässe trocknet damit auf 0. Sommer, Mittag 0,5 (`:1409–1411`).

**2. Ort.** Der Herd ist die erste Gras-Zelle im Ring von 2–8 Zellen um die Mess-Wiese (`:1427–1435`) mit diesen Eigenschaften:
- voller Bett-Anteil ≥ 0,99,
- `_brandFeuchte(boden) < mx`,
- `_nassAt` falsch,
- Kronendach ≤ 0,05.

Gebucht: Herd −248,−1064 (Radeon) und −248,−1080 (GTX an 18058dba).

**3. Zündung.** `_brandEntfachen(hx, hz)` am Mittelpunkt der Zelle (`:1392`, `:1586`). Das ist derselbe Akt wie beim Brennglas, über `_brandFangen` (`stamm/feld-brand.js:344–363`).

**4. Wind.**
- Wort klar: 0,06 × 24 = 1,44 m/s in 10 m Höhe.
- `_brandTempo` liest `_windAt` (`feld-brand.js:321`) und nimmt die Böe heraus (`:327–329`) und rechnet den Wind auf Flammenhöhe um.
- Kopf R = 0,076 m/s, L/B 1,23 (Analyse in 5.4).

**5. Feuchte.** M = 0,06 + 0,29·boden + 2,5·0 (`feld-brand.js:282–285`). Der Herd ist so gewählt, dass M < 0,12.

**6. Takt trocken.** `brennen(60)`: 60 Schritte zu `schrittS` = 1 s, je Schritt `st.spielZeit = _brandUhr + 1` und nur `_tickBrand` (`:1400–1403`, `:1587`). Danach 30 volle `_gameLoopTick` und die Zahl der gezeichneten Flammen (`:1588–1591`).

**7. Gezählt (trocken).**
- `brennt()` = Zellen in `state.brandFeld` mit `t0 !== null` (`:1404`).
- Flammen im Bild (BRENNT) bei stehender Bild-Uhr = Median aus 5 Sätzen MIT − OHNE warmer Pixel im ROI. Der ROI ist die Zellmitte ±¼ Zelle, die Kamera steht 20 m quer und 12 m hoch (`:1442–1454`, `:1550–1575`).

**8. Takt Regen.** Das Wort wird „rainy“ (`:1593–1595`). Dann `brennen(300, takt)` mit vollem `_gameLoopTick` und 1 s Spielzeit je Bild (`:1596`).

**9. Gezählt (Regen).**
- `regenS` = Spielzeit bis zum Erlöschen.
- `nachRegen` = brennende Zellen danach.
- Dann 600 Takte, trocken, Mittag, ERLOSCHEN-Schuss (`:1597–1602`).

**10. Urteil** (`:1660`): `trockenS ≥ 60 ∧ zellen ≥ 1 ∧ flammenListe ≥ 1 ∧ fB ≥ 200 ∧ regenS ≤ 60 ∧ nachRegen = 0 ∧ erloschen.zellen = 0 ∧ fC ≤ 20`.

**Konsum oder Zwilling?**
- **Konsum:** Feld, Akt, Feuchte-Gesetz, Nässe-Kurve und Renderer sind echt. Kein Zwillings-Code.
- **Abweichung von Spielpfad und Bedingung:**
  - Das Wetter ist das Wort des Spielers, nicht der Zug der Welt.
  - Die Trocken-Phase läuft ohne Spiel-Schleife.
  - Der Regen läuft 60-fach gerafft (B5).
  - Das Trocken-Glied prüft Existenz (B2).
- **Was nie gemessen wird:** Ausbreitung. Die Leiter S1 verlangt sie auch nicht („eine Zelle“).

### 5.3 Ob das Soll physikalisch trägt — die Rechnung

Rechnung in `rechnung.cjs` im Scratchpad, Befehl `node rechnung.cjs`, unter 1 s.

**(a) „200 Zellen nach 60 s“ (die Lesart des Briefs, die kein Richter trägt).**

200 Zellen × 16 m × 16 m = 51 200 m² = 5,12 ha in 60 s. Das verlangt diese Tempi:

| Form der Brandfläche | nötiges Tempo |
|---|---|
| Kreis (windstill), Radius 127,7 m | 2,13 m/s in JEDE Richtung, auch gegen den Wind. Rückfeuer im Gras im Code: 0,01–0,02 m/s |
| Ellipse, Zündung im hinteren Brennpunkt, L/B 1,23 | Kopf 224 m → 3,7 m/s |
| Ellipse, L/B 3,55 | Kopf 471 m → 7,9 m/s |
| Ellipse, L/B 4,5 | Kopf 535 m → 8,9 m/s |
| Ellipse, L/B 8 | Kopf 719 m → 12,0 m/s |

- Das Gras-Feuer-Band 0,1–3 m/s (Rothermel 1972; Cheney & Gould 1995 — Literatur, nicht im Repo) liegt bei jedem L/B darunter.
- Dazu kommt: Ein Punkt-Feuer erreicht sein quasi-stationäres Tempo erst nach Minuten, wenn der Kopf breit genug ist (Cheney & Gould 1995, Literatur, die Zahl nicht am Text geprüft).
- Das Gesetz im Code kennt keine Anlauf-Phase: `_brandZuenden` (`feld-brand.js:374–451`) rechnet R ab der ersten Sekunde.
- **Urteil: 200 Zellen in 60 s tragen physikalisch nicht.**
- Das Gesetz selbst schafft in 60 s:
  - analytisch 11–25 berührte Zellen (L/B 3,55–8),
  - im Modell 9–11 brennende Zellen, Nässe gehalten.
- 200 Zellen erreicht es erst nach 253–414 s (analytisch). Im Modell unter „cloudy“ liegt die Marke zwischen 300 s (87) und 600 s (288).

**(b) Das Tempo des Gesetzes gegen die Literatur.**

Vergleich mit der CSIRO-Gras-Formel (Cheney, Gould & Catchpole 1998, „natural pasture“, M = 6 %, voll gereift). Die Formel ist aus der Literatur, nicht im Repo:

| Wort | Wind in 10 m | CSIRO | Code |
|---|---|---|---|
| sunny | 1,44 m/s | 0,23 m/s | 0,076 m/s |
| cloudy | 7,2 m/s | 1,79 m/s | 1,06 m/s |
| rainy | 8,4 m/s | 2,06 m/s | 1,44 m/s |
| stormy | 24 m/s | 5,19 m/s | 2,66 m/s |

- Der Code liegt mit dem Faktor 0,3–0,7 darunter, im Band bis auf „sunny“ (< 0,1).
- Im Sturm deckelt `min(0,9·I_R, u)` (`feld-brand.js:330`). Ab U 0,5 ist R konstant 2,661 m/s.
- Andrews, Cruz & Rothermel (2013) raten, diesen Deckel so nicht anzuwenden (Literatur, nicht im Repo — unsicher).

**(c) „Regen löscht nach 7 s“.**

- Die Herleitung: Gras erstickt bei M ≥ mx = 0,12, also bei Nässe ≥ (0,12 − 0,06)/2,5 = 0,024. Mit `_naesseKurve` (`stoff-material.js:2229–2234`) gilt t = 150/0,6 · ln(1/(1 − 0,024)) = 6,07 s, auf dem 1-s-Raster 7 s.
- Für Laub sind es 19,8 s, also 20.
- Der Kommentar `feld-brand.js:890` sagt dazu „Gras nach 6 s“.

Andere Wörter:

| Wort | Gras | Laub |
|---|---|---|
| bewölkt | 31 s | 99 s |
| sturm | 4 s | 12 s |

Gegenrechnung in Wasser:
- ΔM = 0,06 × Last 0,166 kg/m² ≈ 0,010 kg/m² = 0,010 mm Wasser.
- In 6,07 s sind das 5,9 mm/h, oder 4,7 mm/h bei lebendig 0,8.
- Das gilt nur, wenn das Bett 100 % des Regens fängt und die Flamme ihr Bett nicht vorwärmt oder trocknet.
- Mäßiger Regen liegt bei 2,5–7,6 mm/h (Literatur, nicht im Repo).

**Urteil: Die 7 s haben die richtige Größenordnung, wenn „rain 0,6“ etwa 5–6 mm/h wären.** Diese Einheit steht nirgends im Code, und `benetzenS` 150 ist gewählt (B11). Die Feuchte-Spalten und `mx` sind belegt; die Zeit ergibt sich aus zwei Stellwerten. → **unsicher**.

**(d) „1 Zelle nach 60 s“ (was die Station misst).** Das folgt aus dem Gesetz unter „sunny“:
- 0,076 m/s × 60 s = 4,6 m < 8 m bis zur Kante. Die Front erreicht die Nachbarzelle erst nach 105 s.
- Unter „nebel“ (R 0,144) wäre es nach 56 s eine zweite Zelle.

Das Soll „≥ 1“ ist damit konsistent, aber leer (B2).

### 5.4 Gelaufene Proben (headless, je unter 60 s)

**Station kaskade#1: nicht gelaufen.**
- Sie braucht das warme Sitzungs-Fenster mit GPU-Renderer und die Punkte-Maschine. Der Brief verbietet Fenster und GPU.
- Unter Software-Rendering wäre sie ohnehin ROT: Die Roh-Zeile „swiftshader“ urteilt ROT.

**Selbsttest der Stationen gegen ihr eigenes Urteil.**
- Befehl: `node proben.cjs ./k/meisterkarte-quelle/punkte/stationen/g1.js` (Scratchpad `richter/`, Export von `k:g1.js`, byte-gleich geprüft mit `cmp`). Dauer 66 ms.
- Ergebnis:
  - kaskade#1: 17/17
  - stoerung#1: 8/8
  - erleben#1: 5/5
  - ereignis#1: 13/13
  - stoffe.K2#1/#2, stoffe.K5#1/#2, feld.K1#1/#2, feld.K3#1/#2: je 0/0

**Modell-Probe des echten Brand-Gesetzes.** Das ist NICHT die Station und NICHT das Spiel.
- Echt: `_brandFangen` → `_brandZuenden` → `_brandTempo` sowie `_tickBrand` → `_brandSchritt`.
- Gestubbt ist die Welt: flach, jede Zelle Gras mit lebendig 0,8, kein Wasser, Boden-Feuchte 0, 20 °C, Wind des Worts in Richtung +x.
- Befehl: `node kaskade-modell.cjs wort=<w> t=600 [naesse=echt]` (Scratchpad `richter/`), je 0,3–0,4 s.

Nässe auf 0 gehalten:

| Wort | R am Herd m/s | brennend nach 60 s | brennend + Asche nach 300 s | brennend + Asche nach 600 s |
|---|---|---|---|---|
| sunny | 0,076 | 1 | 6 | 15 |
| cloudy | 1,060 | 9 | 87 | 288 |
| rainy | 1,443 | 10 | 106 | 356 |
| stormy | 1,574 | 11 | 113 | 371 |

Mit der echten Nässe-Kurve des Worts (`naesse=echt`):

| Wort | Verlauf |
|---|---|
| cloudy | 2 / 2 / 3 brennend nach 10 / 20 / 30 s; nach 45 s 0 brennend, 3 Aschen |
| nebel (`foggy`) | 1 → 2 Zellen nach 60 s (R 0,144) |
| sunny | 1 |

Am Sturm liegt R unter dem analytischen Wert 2,661: Der Deckel 0,9·I_R hängt an der Last (lebendig 0,8 gegen 1).

**Analytik.** Befehl: `node tempo.cjs` (Scratchpad `richter/`), etwa 1,6 s. Es ruft das echte `_brandTempo` mit `_defaultMaterials` auf, Gras lebendig 1, und zählt die von der Ellipse berührten Zellen.

| Wort | R m/s | L/B | Zellen nach 60 s | 200 Zellen nach |
|---|---|---|---|---|
| windstill | 0,041 | 1 | 1 | 2996 s |
| sunny | 0,077 | 1,23 | 1 | 2738 s |
| cloudy | 1,061 | 3,55 | 11 | 414 s |
| rainy | 1,444 | 4,5 | 14 | 346 s |
| stormy | 2,661 | 8 | 25 | 253 s |

Laub läuft unter jedem Wort mit 0,007–0,307 m/s.

## 6. Nicht verifiziert

- **Nicht gelaufen:**
  - Die Station `karte2.same.kopplung.kaskade#1` und die anderen GPU-Stationen. Grund: Fenster und GPU sind verboten.
  - `diag-stand-takt.cjs` (alle Modi), `diag-kreatur-takt.cjs`, `diag-fahr-leben.cjs`, `diag-wasser-leben.cjs`, `diag-kopplung.cjs`. Sie brauchen eine Browser-Sitzung von 4–8 min (`k:g1.js:5088`, `:5163`), über der Grenze von 60 s, und `npm run check` ist verboten.
  - Die gebuchten Zahlen (0,911 m/s; 7 s; Flucht) stammen aus Stand und Messungen, nicht aus einem eigenen Lauf.
- **Nicht gelesen:**
  - Warum die GTX an 18058dba wieder bei −248,−1080 zündet und dort nur 4 Flammen zeichnet (B6). Der Weg `_brandBild` (`feld-brand.js:605`) ist nicht nachverfolgt.
  - Wie viele Spielzeit-Sekunden das Spiel je Wand-Sekunde geht. Davon hängt ab, was „60 s“ im Erleben heißt.
  - Die Brand-Teile von `diag-mp-sync.cjs` über `:211` und `:986–996` hinaus.
  - Was `diag-kreatur-leben.cjs` im Lauf ohne Sitzung in `check:statik` (`package.json:20`) prüft.
- **Literatur aus dem Gedächtnis, nicht am Text geprüft** (nichts davon steht im Repo):
  - Rothermel 1972
  - Cheney & Gould 1995
  - Cheney, Gould & Catchpole 1998, mit den Koeffizienten der CSIRO-Formel
  - Andrews, Cruz & Rothermel 2013
  - die Regenklassen 2,5–7,6 mm/h
