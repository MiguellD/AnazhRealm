# fahrzeug-gestalt — Stand-Blatt (ZWISCHENSTAND)

Sprosse: `karte2.mensch.fahrzeug.gestalt#1` (Vorrang 1 des Koordinators, 05:58: (a) das Wagenglas liest das EINE Glas-Gesetz,
Fresnel/Schlick, n 1,52 → F₀ 0,04, derselbe Leser wie das Hausfenster · (b) der Reifen als Gestalt aus `huelle.radB`, D: Flanke,
Lauffläche, Felge als drei Stoffe, ein flacher Aufstand nach der Last W — dasselbe W wie `radImBoden` · (c) ≥ 5 Gattungen der Stadt).
Basis: main + `fahrzeug-medium-ruf` 15630bf4 (Probe GRÜN 06:42, Läufer gtx1050).

## Täter (vorher, node am Kern der Basis)

- **Die Scheibe trug kein Gesetz.** `welt-licht.js` `durchsicht` mischte das Glas mit seiner Deckkraft (0,42) — der Spiegel stand
  im Fragment und fiel mit der Deckkraft: das Hausfenster spiegelte senkrecht 0,04 × 0,42 = **1,7 %** (Floatglas ≈ 8 %). Der Wagen
  glich das mit eigenen Zahlen aus: Klarlack 1 und Umgebung × 3 auf dem Glas (`vehicle-core.js` `materials().glass`) — ein zweiter
  Glanz neben dem der Welt. Das Licht-Datum der Fenster teilte durch die Deckkraft (`_leuchtStoff`); im Bau-Satz (Deckkraft je
  Ecke, `materialOpacity` 1) trug das Fenster nachts **42 %** seiner cd/m².
- **Der Reifen war ein Ring.** Die getonnte Lauffläche wölbte kreisrund bis radR und hing an der rollenden Felge (`spin`): kein
  Aufstand (eine Ecke unter der Nabe, Sehne 0), keine Einfederung (dz 0), Lauffläche und Flanke EIN Stoff.

## Geschnitten

- **Das Gesetz der Scheibe** `welt-licht.js:1310` `scheibe` (gerufen aus `durchsicht` :1291, wenn ein F₀ kommt): je Fläche F₀ aus
  der Zeile glas der schmiede, die Scheibe (zwei Flächen, Stokes) F = 2F₀/(1+F₀), Schlick über |n·v|; der Spiegel und das Leuchten
  stehen GANZ im Bild, der Körper nach der Deckkraft a, das Dahinter mit (1 − F)(1 − a) — die Blende α = 1 − (1 − F)(1 − a), das
  Fragment vor dem Nebel ÷ α (der Nebel bleibt richtig). `customProgramCacheKey` + „|scheibe“.
- **Der EINE Leser** `stamm/studio-stoff.js:694` `_glasOptikWert` (schmiede `STOFF_GESETZ.zeile("glas")` → `fresnel0` des grünen
  Kanals; ohne Zeile `_kernPflichtBruch`), `_glasOptik` (EIN Uniform), `_glasOptikWirkt` (die Zeile wirkt neu). Jeder Stoff der
  Seh-Klasse glas mit Deckkraft < 1 wird Scheibe (`:850`): das Fenster des Hauses (Satz und Einzel-Stoff), die Scheibe des Wagens,
  der Kopf der Laterne — derselbe Stoff-Weg (`_foundryTreeMaterial`), kein zweiter.
- **Der Zwilling fiel** `vehicle-core.js:92`: das Wagenglas trägt keinen Klarlack und keine Umgebung × 3 mehr.
- **Das Leuchten** `stamm/stoff-material.js:2390` `_leuchtStoff`: kein Teilen durch die Deckkraft; ein Licht-Datum an einem Stoff,
  der keine Scheibe ist, bricht laut.
- **Der Reifen unter seiner Last** `vehicle-core.js:723` `reifenGestalt`: W = `radLast` (`:4350`, die EINE Last je Rad — derselbe
  Leser speist `fahrGesetz(...).rad.W`, das `radImBoden` liest), kz = kz0 · √(b·D / (b0·D0)) (`FAHR.reifen.kz` `:3869`, Bezug
  205/60 R15, kz0 240 kN/m: die Mitte des Pkw-Bands 200–300 kN/m; die Gestalt p·√(b·D) nach Rhyne 2005, Tire Sci. Technol. 33(3) —
  die Gestalt der Formel, nicht ihre Zahlen), dz = W / kz, rFrei = radR + dz (radR ist der statische Halbmesser: die Nabe steht ihn
  über dem Aufstand). `makeWheel` `:797` baut zwei Teile: `dreht` (die Felge) rollt, `steht` (Lauffläche + Flanke) hängt an der Nabe
  (`buildWheels` `:951`) — lenkt und federt, rollt nie, der Aufstand bleibt unten. `crownedTread` `:1135` legt die Lauffläche unter
  der Nabe als Sehne auf radR. Drei Stoffe: Lauffläche `tire` (Gummi, rau 0,85), Flanke `flanke` (`:109`, Gummi, seidig 0,6),
  Felge `rimM`. Das starre Rad der Zeit, die Kufe und das Boot federn nicht (dz 0, byte-alt in der Gestalt).
- **Der Radlauf** umschließt den freien Reifen: `buildSkin` (`:1444` rFrei für Bogen-Halbbreite, Scheitel, Brauen, Reifen-Kanten,
  Schweller), `buildPackage` (Radhaus-Lücken), die Taille der Coke-Linie (`:1037`).
- **Das Byte-Raster am Ausgang** `vehicle-core.js:5814` `ausRaster` (das Muster fachwerk/porta, das Soll der Ratsche v3): am
  Re-Mint des Reifens kippte hypot ±1 ULP 10 Fälle statt 5. Lage 2^-16, Drehung 2^-20, Attribute 2^-12, Normalen 2^-14; die Stoff-
  Zahlen bleiben roh (sie sind das Gesetz, die Lacke auf 1e-6). Ratsche v3 atan2 20 · sin 24 · cos 23 · hypot 5 → **0**
  (`spec/asset-contract/plattform-ratsche.json`). VERTRAGS-AKT: die 27 Goldens neu gemintet (`spec/asset-contract/v3/golden/vehicles.json`).
- **Die Linsen** in der Fahrzeug-Familie, `gate:vehicle-drive` am gestellten GT der Welt (der echte Leser: die Stoffe seiner
  Instanz-Gruppen und der Foundry-Flat der servierten Stufe):
  - **B-i SCHEIBE** (`scripts/diag-vehicle-drive.cjs:87` `scheibeVerdict`, Sonde `:670`): jede durchsichtige trägt das Gesetz, ihr F₀
    ist das der Zeile glas, und die Zeile mit halber Brechkraft setzt es (`_glasOptikWirkt`). ROT am Kern der Basis: „Scheiben ohne
    Gesetz: 1 von 1“.
  - **B-j REIFEN** (`:100` `reifenVerdict`, Sonde `:705`): die Blätter am Umfang rollen nicht, liegen als Sehne ≥ 2 cm in der Ebene
    der Räder und stehen um W / kz frei — W aus `_fahrSatz(...).rad.W`. ROT am Kern der Basis: rollt 2 von 2 · Sehne 0 · dz 0 statt
    12,7 mm (node, `buildInstance("gt")`).
  - Selbst-Test: je Verdikt gesund still, je gebrochenem Wert EIN Täter (5 + 6 Fälle, GRÜN).

## Gemessen (vorher → nachher, gleiche Bedingungen)

| Zahl | vorher (Basis) | nachher (Kopf) |
|---|---|---|
| F₀ der Scheibe, senkrecht (Zeile glas n_grün 1,4943 → F₀ je Fläche 0,0393) | Haus 1,7 % · Wagen eigene Zahl (Klarlack + Umgebung × 3) | **7,6 %** Haus und Wagen (Floatglas-Band ≈ 8 %) |
| Spiegel bei 60° · 75° (Schlick) | — | 10,4 % · 28,2 % |
| Licht-Datum der Fenster nachts im Bau-Satz | 42 % der cd/m² | **100 %** |
| Reifen GT · Supersport · Limousine · Kompakt · SUV · Transporter: dz (mm) | 0 · 0 · 0 · 0 · 0 · 0 | **12,7 · 10,3 · 16,0 · 12,5 · 15,9 · 23,7** |
| … W je Rad (N), dieselbe Zahl wie `radImBoden` | — | 3 286 · 2 733 · 4 116 · 3 150 · 4 532 · 6 040 |
| … kz (kN/m) | — | 258 · 266 · 258 · 252 · 285 · 255 (Band 200–300) |
| … Aufstand unter der Nabe (m) / Sehne der Ecken (m) | −radR / 0 (eine Ecke) | −radR ± 0,0001 / **0,104–0,224** |
| … rollt der Reifen mit | ja | **nein** (die Felge rollt) |
| Stoffe des Rads | Gummi · Felge · Nabe · Sattel (4) | **Lauffläche · Flanke · Felge** · Nabe · Sattel (5) |
| Tris L0 je Gattung (node, `buildInstance`) | 28 424 · 27 956 · 28 528 · 28 716 · 30 624 · 31 404 | 28 568 · 28 036 · 28 672 · 28 860 · 30 880 · 31 516 (+0,3–0,8 %, die Bögen um rFrei; Deckel 32 000) |
| Tris L1 je Gattung | 9 808 · 9 660 · 9 896 · 10 056 · 10 512 · 10 548 | 9 808 · 9 708 · 9 896 · 10 120 · 10 528 · 10 596 (Deckel 10 600) |
| Meshes je Wagen (Draw-Quelle vor der Faltung) | 328 · 328 · 344 · 359 · 355 · 333 | gleich; Stoffe 19 → 20 (die Flanke faltet in die Seh-Klasse stoff, Deckel draws 12) |
| Ratsche v3 (Transzendenten ±1 ULP, kippende Fälle) | atan2 20 · sin 24 · cos 23 · hypot 5 | **0** |
| Gattungen der Stadt (B-h, stadt-voll, GTX 1060, Probe 5f14914a) | 6 · Wagen 21/21 | 6 (der Reifen und die Scheibe ändern die Flotte nicht; die Probe misst nach) |

Wände am Kopf: gate:vehicle-contract GRÜN (VERTRAGS-AKT, Plattform-Probe 0) · gate:vehicle-drive `--selftest` GRÜN ·
gate:gegenstand-stoff GRÜN (Selbst-Test · Welt · `--tafel` · `--gesetz` 104/104) · gate:nervensystem-vehicle GRÜN · gate:studio-vertrag
GRÜN · diag-charakter-achsen GRÜN · gate:altlasten GRÜN · format:check 0 · check:statik (siehe Kopf) · stamm-umzug `--nach-karte` 0.
dc und ms der Welt: die GPU-Probe (der Ruf unten) — die Zahl landet in `probe-post/fahrzeug-gestalt/`.

## Offen (Grund, Messname)

- **Der Durchlass des Wagenglases** liegt senkrecht bei (1 − F)(1 − a) = **53,6 %** (FMVSS 205: die Frontscheibe ≥ 70 %). Grund:
  der Innenraum der Kabine steht im vollen Tageslicht (kein Raum-Licht in der Kabine; Kandidat das Gesetz des Hauses, fachwerk
  `raumLicht`, Tageslicht-Quotient ≈ 0,10) — klareres Glas zeigte ihn hell. Messname: B-i `durchlass ≥ 0,70` mit Raum-Licht.
- **Die Bühne der Studios** (Garage, Hülle: `stoffRecht`, lädt keinen schmiede-Kern) zeichnet ihr Glas ohne das Gesetz der Scheibe.
  Messname: gate:garage-labor Scheibe.
- **Das BILDPAAR in der Stations-Pose**: die Pose `stadt-voll` (Platz) zeigt keinen Wagen (Probe 5f14914a und 15630bf4, selbst
  angesehen) — Reifen und Scheibe stehen dort nicht im Bild. Der Ruf trägt darum `bild:stadt@0.5` (die Trasse, ein fahrender Wagen).
  Die Stations-Pose (12 m vor einem GT) ist keine Pose der Probe. Messname: `bild:stadt`.
- **Die Flanke bauscht nicht** unter der Last (nur die Sehne der Lauffläche): ohne Zahl einer Quelle kein Faktor. Messname: Bausch je
  dz.
- **Die Zahlen von Rhyne** (0,00028 · p · √(S_N · D_R) + 3,45) sind nicht an der Quelle gelesen — die Gestalt √(b·D) trägt, die Konstante
  ist die Mitte des Pkw-Bands. Messname: kz je Reifen gegen eine Last-Einfederungs-Kurve.

## Kopf

- Kopf: folgt (Vorprüfung fahrzeug-gestalt 1, auf main e71f2721 + fahrzeug-medium-ruf 15630bf4).
- Probe-Ruf `[gpu-probe: bild:stadt-voll@0.55, bild:stadt@0.5, gate:vehicle-drive, bild:dorf@0.42]` — stadt-voll das BILDPAAR
  gegen 15630bf4, stadt der fahrende Wagen, dorf@0.42 das Hausfenster in der Dämmerung gegen 5f14914a (derselbe Leser der Scheibe).
  Die drei Pflicht-Tore der Bewohner/Satz-Köpfe entfallen: der Kopf fasst `stamm/siedlung-bewohner.js` und `stamm/siedlung-satz.js`
  nicht an.
- Beanspruchte Sprosse: `karte2.mensch.fahrzeug.gestalt#1`.
- Karte 2 gebucht 119 von 1 718 · Status ZWISCHENSTAND.
