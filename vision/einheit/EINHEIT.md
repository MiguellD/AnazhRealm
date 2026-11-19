# EINHEIT — Stufe · Stoff · Zeit. Schluss-Blatt zum Entscheid (Opus-Leser, 19.11.)
Gelesen am Baum **b7ed8419** (`git rev-parse`), NICHT am bestellten dabd69bb. Quellen: die sieben Blätter dieses Ordners; jeder Riss des
Gegners (R1–R6, S1–S5, Z1–Z4, §4) steht am Satz. Selbst nachgelesen: vegetation-streu.js:2880–2889, foundry-bruecke.js:945–960,
bild-kosten.js:2647–2665, siedlung-ort.js:1204–1206, fachwerk-core.js:4176–4190, :4018, koerper-fahrt.js:1209–1216.
Kürzel: vs = stamm/vegetation-streu.js · fc = fachwerk-core.js · vc = vehicle-core.js · sc = schmiede-core.js.

## §1 Befund in Zahlen
- **Stufen:** 28 Systeme, 20 unabhängige Entscheider, 8 Einheiten, 5 Hysterese-Formen, 16 Meter-Grenzen für „nah“ (zensus-stufe §2).
  Gebaut wird je Kern (7 `kindStages`, 5 Stufen-Bauer; zensus-haus §3). Die Wahl hat EINE Stelle: `_wechselGesetz`, 8 Leser (vs:2985).
  58 von 64 Haus-Wechseln hängen an den Baum-Zahlen 12 / 26 m (foundry-core.js:432; doppelt nachgerechnet, gegner §5), Wagen 5 von 5 (vs:2889).
- **Stoff:** 15 Quellen + 2 Licht-Nähte (zensus-stoff §1); Holz hat 8 Rauheiten. Literale je Muster 120/123, 116/119 oder 129/126 (meine
  Zählung: `roughness\s*:` mit worlds/, ohne lib/). Die Zahl hängt am Muster, deshalb misst das Gate mit EINEM festen Befehl (§6).
  `envMapIntensity` steht in 38 Zeilen in 9 Spiel-Dateien (meine Zählung per git grep -c; der Gegner nennt 32).
- **Zeit:** KULTUR 32 Zeilen ohne Jahr (fc:2121–2154) · EPOCHEN 9, von 80 bis 2005 (fc:3622–3632) · `STADT_GRAMMATIK.zeit` 2 Bänder (fc:4321) ·
  `EPOCHE_GESETZ` 6 Stufen, −5000 bis 2150 (vc:4771). **3 Achsen** führen vom Jahr zur Epoche: `epocheImJahr` (fc:4181, Leser
  siedlung-ort.js:1206), `epocheAusJahr` (vc:4869, 0 Leser), `bandVon` (fc:4377). `baujahr` 21-mal in fc (meine Zählung, wie gegner Z1).
  Der Stil `stroh` hat 0 Erzeuger.
- **Takt:** Landungen je Tag 16, 10, 4 (17.–19.11.); Abgabe-Commits 34, 15, 5; 37 Zweige ungelandet, der älteste seit 12.11. (muster §0, §3).
- **Rate:** Karte 2 steht bei 35 von 1 718 (Gipfel 40). 7 Tage: 5,0 je Tag, nötig 60,1 (12,0-fach); am 17.12. wären das 175 (10,2 %).
  Stufe, Stoff und Zeit tragen zusammen mindestens 339 Sprossen (19,7 %; luecke-vision §3–4).

## §2 Das Stufen-Gesetz
Die Stufe bleibt ganzzahlig, nur die Grenze wird stetig (R5). Grund: Goldens je `lod` (scripts/diag-vehicle-contract.cjs:36–38),
Netz-Identität `{cx,cz,lod}` (stamm/netz-identitaet.js:1676–1688), Kollision je Eintrag (gelaende-kollision.js:1332).
**Größen:** `px` (Soll 1, vs:2895) · `f(zeilen)` (Brennweite, px je m; `_brennweite` vs:2997; 703,7 bei 1080 Zeilen und 75°) · `g` (Skala) ·
`h` = 0,1. Je Art, Vorlage und Stufe k gibt es drei Abstände in m bei Skala 1:
- `b_k`: Abstand, an dem der Kanten-Versatz im Farbbild 1 px trägt.
- `w_k`: derselbe Abstand für die Schatten-Kanten (R1). Der Wurf hängt an der Stufe: `schatten` fc:81, `_lod2` wirft nie
  (siedlung-bauten.js:1849–1852). Ohne `w` verlören 15 von 32 Häusern ihren Schatten unter 12 m.
- `haelt_k`: Reichweite der Handlung, die Stufe k braucht (R2; die Tür des Tors lebt in seiner L0, vs:2965–2966). Das Studio liefert
  diese Funktions-Größe; mit den geliehenen Baum-Metern hat sie nichts zu tun. Der Ritt ist schon gedeckt: Der Reiter sitzt im Abstand 0 und
  hält L0 bei jeder Grenze über 0 (koerper-fahrt.js:1213).
**Die eine Funktion:** `d_k = g · max(b_k, w_k, haelt_k)`; `b` und `w` werden am Schirm über `f(zeilen)/px` umgerechnet. Hinein gilt
(1+h)·d_k, zurück (1−h)·d_k (`_stufeNachGrenzen` siedlung-bauten.js:3265).
`b` und `w` werden am wahren Abstand GEMESSEN, nie über 1/d hochgerechnet: fern skaliert der Versatz laut vs:2886 nicht mehr mit 1/d (R3).
**Sitz:** Der Körper von `_wechselGesetz` zieht als `FoundryCore.stufeGrenze` nach foundry-core.js (additiv neben :432); der Stamm ruft ihn.
**Pflicht je Studio:** je Vorlage und Stufe `{b, w, haelt}`, im Kern gegen die eigene L0 gemessen; fehlt die Zeile, gilt `_kernPflichtBruch`
(vs:2990). Dazu `fernform` (schon Pflicht, studio-bruecke.js:2970).
**Dreiecke senkt nur der Kern (R4):** `budgetErzwingen` faltet nur Draws (foundry-bruecke.js:950–953, gelesen). Die Neubau-Schleife
vc:4903–4925 bleibt deshalb.
**Gefallen (R6, offen):** Das Tempo ist keine Stufen-Größe. Die Sichtbarkeit eines Stufen-Sprungs in Fahrt ist ungemessen, `_bedeutung` (vs:2903)
rankt nur die Kappe, und das Tempo legt keine Stufe um (vs:2973). Die Schliere hat ihre Wurzel in der zeitlichen Auflösung (§3).

## §3 Das Stoff-Gesetz
**Sitz:** `STOFF_GESETZ` (sc:2860, REIN 26 + MISCH 4) bleibt die EINE Tafel und wird additiv erweitert. Neue Spalten in `SPALTEN` (sc:2911):
- `albedo`: linear; das Soll zieht aus scripts/diag-gegenstand-stoff.cjs:74–85 in das Gesetz.
- `f0` aus `n`, nur für Dielektrika.
- `f0rgb` für jede Metall-Zeile (S1: Kupfer, Eisen und Holz tragen `n = null`).
- `absorb` in 1/m je Kanal (S2; `transmission`/`thickness` in den Kernen 0-mal, Glas ist heute Metall, fc:2091).
- `sheen` und `streu` (freie Weglänge, m) für Fell und Haut (S3).
- `poren` statt der 7 kind-Einträge (stoff-material.js:3798).
- `alter` für jede Zeile statt für 3 von 21 (bau-vorlagen.js:1684–1693).
- `seit` (§4).
Eine Zeile darf als Schicht `ueber: <Zeile>` tragen, zum Beispiel Lack über Holz oder Wasserfilm über Klarlack.
**Die eine Funktion:** `stoffAntwort(name, schicht, alterTage, naesse) → {albedo, rauheit, metall, f0|f0rgb, absorb, sheen, streu}`.
`budgetRegler` (phyto-core.js:5965) liest sie über `mp.stoff`. Ein Studio liefert je Teil NUR den Q1-Namen und die Schicht.
**Glanz der Umgebung (S4):** `envMapIntensity` (38 Zeilen) fällt in derselben Klasse. Die Spiegelung folgt aus `f0` und Rauheit, eine eigene
Stärke je Kern gibt es nicht mehr.
**Neue Zeilen** (heute 0; zensus-stoff §5.9, zensus-haus §5.2): Asphalt, Beton, Stahlbeton, Lehm, gebrannter Ziegel, Kalkputz, Reet/Laub,
Marmor, Hornhaut (n 1,336).
**Maß (S5, umgestellt):** 8 Holz-Literale → 0; die Rauheit folgt aus Zeile × Schicht × Alter. Die Zahl verschiedener Werte ist kein Ziel.
**Die Schliere bei Fahrt** ist eine Frage der zeitlichen Auflösung, nicht des Stoffs. `_traegerTeile` trägt nur `playerMesh` und das Gerät in
der Hand (bild-kosten.js:2647–2665, gelesen); TRAA reprojiziert nur die Kamera (:2500–2510). Schnitt: Jeder fahrende Wagen im Blick wird
starrer Träger seiner Box (`__mass` vc:4926). Messname `lack-luma-fahrt` (GT bei 20 m/s, Luma-Fehler der Lack-Pixel von Frame zu Frame).

## §4 Die Zeit als Größe
Zwei Größen (Z1), keine Baupläne je Epoche:
- `jahr` ist die Gegenwart des Orts. Die EINE Achse ist EPOCHEN (fc:3622); ihr Leser liegt schon im Spiel: `epocheImJahr` (fc:4181 →
  siedlung-ort.js:1206). „Der Ort steht am Ende ihrer Spanne“ (fc:4177–4179), also Gegenwart = `erbe.jahr + erbe.spanne` (fc:4018).
  Ob jeder Leser so rechnet: unbelegt.
- `baujahr` gilt je Objekt, mit baujahr ≤ jahr. Die 21 Leser in fc bleiben; Stoff (`seit` ≤ baujahr), Tragwerk und Alter lesen es.
**Drei Achsen werden eine (Z2):** `bandVon`/`STADT_GRAMMATIK.zeit` (fc:4321, 4377) lesen die Spannen von EPOCHEN. `epocheAusJahr` (vc:4869)
ist keine Achse mehr, sondern das Form-Gesetz des Wagens, das `jahr` liest. Die Grenzen 1700/1750/1800 (fc:4470, 5342, 4321) werden Zeilen
der Achse. Die Kultur des Herrn (fc:4325 gegen fc:4472) wird EINE Funktion.
**Fahrzeug:** `ov.epoche = epocheAusJahr(jahr)` geht in `_verkehrWagenStellen` (siedlung-verkehr.js:619; heute fehlt es, gelesen :620–631).
`VERKEHR.wagen` (:2249) stirbt.
**Gespann (Z3), in derselben Welle:** 1560 ergibt 1,97, also `kutsche` mit `antrieb:"zugtier"` (vc:4772–4800). Die Deichsel steht
(vc:2349–2361), ein Tier fehlt (`zugtier`/`gespann` in stamm/: 0). Lösung: ein tetrapoda-Leib als Komposit an der Deichsel, wie der Fahrer
(`_kompositErbt` siedlung-bauten.js:1836), dazu vGang 2,3 m/s in der Trasse. Ein Karren ohne Tier wäre fail-soft und landet nicht.
**Haus:** Region × `baujahr` bestimmt die KULTUR (jede Zeile trägt [von, bis]) und den Stoff (`seit`). Die Laubhütte ist die Zeile Reet/Laub
mit frühem `seit` und ersetzt `stroh`. Die Burg bleibt ein Haus mit `zinnen/turm` (fc:4473) auf Naturstein.
**Goldens** ohne `epoche` bleiben byte-gleich (vc:4846–4847, Z4).

## §5 Der erste Spike: Haus und Wagen wechseln am eigenen Fehler, der Baum-Rückfall stirbt für beide
**Schritt 0, messen vor dem Bau:** In Node (`kantenVersatz`, vs:2882) `b` und `w` für 32 Häuser × L1/L2 und 5 Wagen × L1 bei
d ∈ {3, 6, 12, 26, 50, 100} m messen. Die Annahme 1/d fällt (R3); die Entwurfs-Vorhersage (0,24 m, −67 %) fällt als unbelegt.
**Bau:** vc und fc liefern `{b, w, haelt}`. `_wechselHaushalt` antwortet für `haus` und `vehicle` nicht mehr. `impostor` fällt
(studio-bruecke.js:3724–3735). Garage und Fachwerk-Studio lesen `stufeGrenze`. gate:haus-fern P bekommt die Art `vehicle` (vorher ROT: 5 von 5
Zeilen fehlen, vs:2887).

| Soll (`soll.json` als erster Commit) | Maß | Soll | rot, wenn |
|---|---|---|---|
| S1 Versatz am neuen Wechsel, 1080 Zeilen | gate:haus-fern P, 64 Haus + 5 Wagen | ≤ 1,0 px, 69/69 | eine Zeile falsch gemessen |
| S2 Schatten-Pixel im Nahfeld ≤ 26 m | Pose stadt-voll | vorher ± 0,5 % | `w` fehlt (R1) |
| S3 Tür und Sitz in L0 innerhalb `haelt` | Griff-Probe Tor + Wagen | 100 % | `haelt` fehlt (R2) |
| S4 Dreiecke im Blick an stadt-voll | Zahl aus Schritt 0 | ± 10 % | Grenze ≠ Messung |
| S5 Frame p95 GTX, ABAB mit Referenzfahrt | Rauschen der zwei A-Läufe | Differenz ≤ Rauschen | Kosten wachsen |
| S6 Garage gegen Welt, Grenze in m | 1080 Zeilen, 75°, ohne `fovPlus` (garage.js:608–612) | 0,0 m | zwei Körper rechnen |

„d0/d1-Quelle 69 → 0“ ist kein Soll mehr: es misst die Form des Codes und steht als Absenz-Grep in §6.
**Vorhersage:** Die Limousine trägt bei 12 m nur 0,02 px (vs:2889), ihr `b` liegt also unter 12 m, solange der Versatz zur Nähe hin nicht
überlinear wächst. Die genaue Zahl liefert Schritt 0. Die 31 L1-Häuser, die am Haushalt unter 1 px liegen, wechseln früher, außer `w` hält sie.
**Spike nein = stopp:** Jede rote Zeile nennt ihre Vorlage. Danach die Reihenfolge Spike → §6a → Stoff-Spike (Holz-Zeile gemeinsam für Wagen
und Haus, Bildpaar Werkstatt) → §6b → §6c mit Gespann.

## §6 Die Klasse, die fällt (je eine Welle)
**a Stufe** (Maß: Absenz-Grep `d0|d1|_NAH_M|ab:` in der Gestalt-Wahl = 0):
- `lod.d0/d1/ref` (foundry-core.js:432) und der Rückfall `_wechselHaushalt` (vs:3001–3010);
- `ab` an porta-core.js:87–88, tetrapoda-core.js:46, koerper-core.js:49 und worlds/neuntes-buch/stele-core.js:30–31 → `haelt`;
- `impostor` (studio-bruecke.js:3724–3735);
- `lodPlan` fc:4574, `lodTick` worlds/fachwerk/fachwerk.js:131 und `updateTreeLOD` worlds/terrain/phytogenesis.js:2731 → `stufeGrenze`;
- `SEIL_NAH_M` (stamm/koerper-seele.js:1809), `ANALOG_NAH_M` (stamm/kreatur-leben.js:3722);
- `DETAIL_CASCADE` (dirigent-ankunft.js:1873) → `BODEN_STUFEN` (gelaende-boden.js:3191);
- das Haus-Soll an L1 (fc:2672–2678) und `tonUebertrag` (fc:2712).
Gestrichen aus der Klasse, offen benannt: die Neubau-Schleife vc:4903–4925 (R4).
**b Stoff** (Maß: `git grep -c -E "(roughness|metalness|envMapIntensity)\s*:"` über die sechs Zweit-Kerne → 0, im Gate fest geschrieben):
- Q3 sc:79–140 · Q4 vc:70–186, :307, :331 · Q5 fc:2062–2091 · Q8 koerper-core.js:739 · Q9 tetrapoda-core.js:3688;
- die Defaults von Q10 (phyto-core.js:5965–5995) und die Hex-Werte von Q2 (bau-vorlagen.js:1756–1942);
- `WERK_ALTER.seh` (siedlung-satz.js:1980);
- `VERBAND_GESETZ` fc:1847 als Zeile von `STEIN_GESETZ` porta-core.js:301;
- sRGB→linear an 10 Stellen (zensus-stoff Z6), der Sinus-Hash (studio-stoff.js:607, foundry-core.js:911), `envMapIntensity` (38 Zeilen).
**c Zeit** (Maß: Wagen mit `epocheStufe` passend zum `jahr` der Stadt: 0 % → 100 %; Kutschen mit Tier: 100 %):
- EPOCHEN-Pools fc:3622–3632 · `STADT_GRAMMATIK.zeit` fc:4321 · Grenzen fc:4470/5342 · Kultur des Herrn fc:4325/4472 ·
  `VERKEHR.wagen` siedlung-verkehr.js:2249.

## §7 Drei Werkzeug-Heilungen der Muster (vor dem Spike)
1. **Soll vorab (M5):** Der Stempel verweigert, wenn der erste Commit nicht `soll.json` ist oder ein späterer Commit sie ändert. Die Datei
   des Stempel-Griffs ist unbelegt (`zug/dienst/` ist im Haupt-Baum leer, eigene ls-Probe).
2. **Puls (M6, M11, M1):** `messplatz-blick.cjs --kurz` bekommt die Spalte „Stationen gebucht in 15 min“ (0 → STEHT mit Gerät) und die Zeile
   `wellen-landung` (Tokens ÷ Landungen, über 10 M ROT). `pushe()` (radeon-dienst.sh:105–112) endet ROT statt still.
3. **Äste mit Frist (M2):** `ungelandet.cjs` nennt Alter und Besitzer. Nach 72 h ohne Abgabe-Commit wandert der Zweig nach
   `refs/archiv/<datum>` und bekommt in LAGE die Zeile „fällt offen“. Zuerst die 5 Licht- und 4 Heap-Zwillinge.

## §8 Ehrlich offen (Grund · Messname)
- Kurve `b`/`w` über d: Node-Messung war in diesem Lauf verboten · `stufe-kurve`.
- Tempo als Stufen-Größe: Sichtbarkeit in Fahrt ungemessen · `pop-px-fahrt` (Versatz am Wechsel bei 20 gegen 0 m/s).
- Millionen Wagen: Sim-, Bild- und Culling-Schleife sind O(N) (siedlung-verkehr.js:1435, :757; studio-bruecke.js:3417); Weg: Fluss je Spur
  (zensus-fahrzeug §6) · `verkehr-ms-20-gegen-2000`.
- Bauten über 22 m Traufe oder 15 m Breite: Die Klemmen (fc:183, 2207–2208) fallen erst mit dem Tragwerk aus Festigkeit (0 von 100 Häusern
  tragen ihre Balkenlage, vision/bau/entscheid.md) · `statik-traegt`.
- Licht in cd/m²: Zweig licht-eine-skala ungelandet (5 WIP-Commits) · `licht-skala`.
- Galaxien und Zeit vor −5000 oder nach 2150: weder Gesetz noch Zensus (kosmos 61 Sprossen, 1 gebucht) · `kosmos-zensus`.
- `seit`-Jahre der Stoffe: Geschichte ohne Code-Quelle; der Leser setzt sie mit Beleg.
- Ob der gerittene Wagen unter `playerMesh` hängt: unbelegt. Das GTX-p95-Rauschen: unbelegt, S5 misst es.
- Rate: Mit 5,0 je Tag erreicht keine Welle 1 718 Sprossen; die Einheit bewegt mindestens 339. PLAN-1712 enthält 0 der 14 Wörter des
  Schöpfers; die Reihenfolge §5 gehört an PLAN:33, die Rate schreibt `vision/buche-2.cjs`.
- Kein Bild, kein GPU-Lauf, nicht am Kopf dabd69bb gelesen.
