# Zensus STUFE (LOD) — Kopf b7ed8419, nur lesend, 19.11.

Frage: Bauen wir je Studio ein eigenes LOD? Antwort: die WAHL hat schon einen Stamm (`_stufeNachGrenzen` + `_wechselGesetz`).
Gespalten sind drei Dinge: die Studio-Tafeln, die Einheiten und alles, was nicht Mesh-Stufe ist (Boden, Ringe, Kappen, Sim-Takt).

## 1 Die Tafel (je System eine Zeile)

| # | System | Datei:Zeile | Einheit der Schwelle | Leser | eigene Hyst./Speicher | teilt Code mit |
|---|---|---|---|---|---|---|
| 1 | Wechsel-Gesetz (Kern der Familie A) | stamm/vegetation-streu.js:2985 (`_wechselGesetz`), :2895 (`LOD_SCHIRM`) | Pixel (px 1 an 1080 Zeilen) × Fehler je Vorlage, mindestens Haushalt in m | `_wechselAbstand` :1857, `_gelenkGrenzen`, `_feldGrenzen` :1881 | Hyst 0,1 Anteil | A |
| 2 | EINE Wahl | stamm/siedlung-bauten.js:3265 (`_stufeNachGrenzen`) | Meter × Skala | 7 Aufrufer in 5 Dateien (koerper-leib:416, siedlung-bauten:487, stoff-instanz:2654, vegetation-streu:1904/1917/2087) | Zustand je Eintrag | A |
| 3 | Baum L0/L1/Karte | vegetation-streu.js:2081, :1939; foundry-core.js:432 (d0 12, d1 26, hyst 3,4, ref 12) | Wahrnehmungs-Meter (Abstand × ref/Sichthöhe) | `_archStufeUrteil` siedlung-bauten.js:450 | Hyst 3,4 m eigen | A (Zeile `tree: je({})` leer, :2907 → nur Haushalt) |
| 4 | Baum-Maske GPU | phyto-core.js:3769 (`lodCrossfadeMask`), foundry-bruecke.js:223 (uLodRef) | dieselben Wahrnehmungs-Meter + Bänder fade 8/fade0 4 | Shader | Dither statt Hyst | Spiegel von 3 |
| 5 | Haus/Tor/Ausstattung | studio-bruecke.js:2925 (`_archStufenGrenzen`); fachwerk-core.js:86, porta-core.js:63 | px-Fehler je Vorlage (vegetation-streu.js:2907–2965), Haushalt: Tor `ab` 9,5/12 m, Haus KEIN `ab` → d0/d1 des Baums (vegetation-streu.js:3006–3014) | `_archStufeUrteil`, `_foundryLodForEntry` stoff-instanz.js:2639 | Hyst 0,1 | A |
| 6 | Fahrzeug | vehicle-core.js:40 (kindStages [0,1], kein `ab`); studio-bruecke.js:3728 (`impostor: true`) | Baum-Wahrnehmungs-Meter (keine Fehler-Zeile → Baum-Pfad siedlung-bauten.js:494) | `_archStufeUrteil` | Baum-Hyst | A, geliehen |
| 7 | Leib Gelenk L0→L1 | vegetation-streu.js:1868 (`_gelenkGrenzen`); tetrapoda-core.js:41 (`ab` 35 m × Körpergröße), koerper-core.js:39 (`ab` 40 m) | Meter × Größe | koerper-leib.js:408 `_gelenkStufe` | Hyst 0,1 | A |
| 8 | Feld / Menge (Leib → Satz → Welt-March) | vegetation-streu.js:1881; kreatur-leben.js:3722 (ANALOG_NAH_M 64) | Meter 64, Menge: Pixel (mengePx 64 bei 1,8 m) | Tier, Bewohner, Streu-Fernform | feldHystM 10 m, mengeHystM 4 m | A |
| 9 | Nah-Streu / Nah-Wiese | vegetation-streu.js:1909 (`_nahStufe`); vegetation-wiese.js:1223 (stufe0 3,5, radius 24); daten.js:505 (stufe1 5, radius 10) | Meter | vegetation-wiese.js:963, :1786 | Rand 0,75 / 0,5 m | A |
| 10 | Kappe nahLeiber Tier | kreatur-leben.js:3744 (4), Wahl :2836 | Anzahl, gerankt nach `_bedeutung` vegetation-streu.js:1923 (px × Tempo) | `_tickTierSatz` | nein | `_bedeutung` |
| 11 | Kappe nahLeiber Bewohner | siedlung-bewohner.js:3945 (4, ringLeiber 6, nahM 8), :1841 | Anzahl + Meter | Bewohner-Takt | nahHystM 1, ringHystM 3 | `_bedeutung` |
| 12 | maxCreatures | dirigent-kern.js:280 (20); kreatur-leben.js:98, :2581 | Anzahl | Bestand | nein | nein |
| 13 | Tier-Satz | kreatur-leben.js:3743 (cap 256, phasen 32) | Anzahl | Satz-Senken | eigener Speicher | nein |
| 14 | Boden CDLOD | gelaende-boden.js:3191 (36/100/388,8 m), :2764 | Meter Chebyshev | Chunk-Strom | halt 4 m, nur beim Vergröbern | nein (eigene Kette, stetiger Morph) |
| 15 | Detail-Kaskade | dirigent-ankunft.js:1873 (maxRing 2/8/10/∞, aiDiv 1/1/3/6) | Chunk-Ringe | gelaende-boden.js:2749, vegetation-wiese.js:1878, dirigent-ankunft.js:404 | nein | nein |
| 16 | Fern-Ring | gelaende-fern.js:2360 (800/3000/8000 m) | Meter, Masche snap 6/24/64 | gelaende-fern, bild-sicht | reanchorDist 180 | nein |
| 17 | Stadt-Ferne | siedlung-wege.js:2975 (nahM 300, bandAbM 768, reichM 3000) | Meter | siedlung-wege, studio-bruecke | nein | nein |
| 18 | Rand-Radien | dirigent-regler.js:2119 (Bau 150), :2124/2125 (Laub 70–240), `_randSchirm` :278 | Meter | Regler, vegetation-baum | Wachs-Schritt 2,5 m | nein |
| 19 | Verdeckung | siedlung-bauten.js:3402 (occDist 30, thrHi 3,6 / thrLo 2,8) | Meter + Kronen-Gewicht | `_archStufeUrteil` :397 | eigenes Schwellenpaar | nein |
| 20 | Verkehr Sim-Detail | siedlung-verkehr.js:2278 (radFeinM 20), :2312 (genauM 12), :2293 (ausBlick 4) | Meter / Teiler | `_verkehrSchritt` :1506 | nein | nein |
| 21 | Bewohner leben/gehen | siedlung-bewohner.js:1589 (nearM × fernFaktor 1,25) | Meter × Faktor | Geburten | nein | nein |
| 22 | Tuch-Gitter | koerper-core.js:9019, :8499 (gitterM 0,05/0,1, gitterPx 12) | Pixel je Zelle | Löser | gitterHyst Anteil | nein |
| 23 | Gelände-Oktaven | gelaende-core.js:1860 (`netzStufe`, NETZ_TRAGT 2,5) | Fußabdruck m je Masche | wildnisY :1871, Fern-Ring gelaende-fern.js:1218 | keine (zustandslos) | nein |
| 24 | Planeten-Karte | planet-core.js:1822, :1836 (fuss = Spanne / Pixel) | Fußabdruck km je Texel | planetKarte | nein | nein |
| 25 | Schatten-Kaskade | bild-schatten.js:1723 (texelM 0,045/0,17/0,47), :1641 (Reichweite 170) , Takt :1335 | Meter je Texel | Schatten | fernFaktor-Takt | nein |
| 26 | Pfeil-Sicht | kampf.js:2672 (40 m), :1418 | Meter | Pfeile | nein | nein |
| 27 | Foundry-Speicher | studio-gestalt.js:1536 (FOUNDRY_CACHE_CAP 512) | Anzahl Gestalten | Gestalt-Cache | eigener LRU | nein |
| 28 | Ankunft aus der Ferne | dirigent-ankunft.js:1918 (×128) | Faktor auf jeden Abstand | siedlung-bauten.js:476, stoff-instanz.js:2655 | nein | A |

## 2 Die Zahlen
- Stufen-Tafeln in Kernen: **8** gleich gebaute `PORTAL_RENDER_CONFIG.lod` (foundry-core:432, porta:63, schmiede:61, tetrapoda:41, koerper:39, fachwerk:86, vehicle:40, worlds/neuntes-buch/stele-core:25). Eine Grenze `ab` tragen 4 (porta, tetrapoda, koerper, stele); 3 tragen keine (fachwerk haus, vehicle, schmiede).
- Unabhängige Entscheider (eigene Funktion): **20** von 28 Zeilen; Familie A (Zeilen 1–9, 28) ist EINER mit 8 Lesern.
- Verschiedene Einheiten: **8** (Meter · Wahrnehmungs-Meter · Meter × Größe/Skala · Pixel · Chunk-Ringe · Anzahl · Fußabdruck je Masche/Texel · Faktor).
- Hysterese-Formen: **5** (Anteil 0,1 · Meter 0,5–10 · Wahrnehmungs-Meter 3,4 · Schwellenpaar 2,8/3,6 · nur-beim-Vergröbern 4 m).
- Meter-Nahgrenzen, die „bis wohin nah" verschieden beantworten: 8 · 10 · 12 · 20 · 24 · 26 · 30 · 35 · 36 · 40 · 64 · 100 · 130 · 150 · 240 · 300 — **16** Zahlen.
- Fehler-Zeilen am Schirm (LOD_SCHIRM.fehler): 4 Arten (tree leer, gate 10, haus, ausstattung 6); Fahrzeug, Leib, Waffe, Stele: **0**.

## 3 Zwillinge (zwei Stellen, eine Frage, zwei Antworten)
- **Z1 Haushalt geliehen:** Haus und Fahrzeug fragen „ab wann gröber?" und bekommen die Baum-Zahlen d0 12 / d1 26 m (vegetation-streu.js:3006–3014; siedlung-bauten.js:494; Kommentar :2885 „der Wagen wechselt an der Maske des Baums"). Tor, Tier, Mensch, Stele antworten mit eigenem `ab`.
  Schnitt: `ab` wird Pflicht je Budget-Zeile (wie `fernform`), der Rückfall auf d0/d1 in `_wechselHaushalt` fällt; fehlt `ab`, ist es KERN-PFLICHT-Bruch.
- **Z2 Kappe nahLeiber doppelt:** KREATUR_SATZ.nahLeiber 4 (kreatur-leben.js:3744) und BEWOHNER.nahLeiber 4 + ringLeiber 6 (siedlung-bewohner.js:3945); beide ranken nach derselben `_bedeutung`. Zwei Töpfe für dieselbe Frage „wie viele Leiber voll?".
  Schnitt: EIN Topf der Leiber (Tier + Mensch + Fahrer), gerankt nach `_bedeutung`, Größe aus dem Haushalt in ms statt Kopfzahl.
- **Z3 „Nah" in 16 Metern:** ANALOG_NAH_M 64, Rand-Radien 150/240, Kaskaden-Ring ~130, STADT_FERNE 300, Boden 36/100, Verdeckung 30, Pfeil 40, Rad 20 (Zeilen 8, 14–20, 26) — jede Domäne hat ihren Kreis.
  Schnitt: jede Meter-Grenze wird Ausgabe von `_wechselGesetz(art, stufe, größe)`; die Tafeln liefern Fehler (m) statt Kreise.
- **Z4 Boden zweimal gestuft:** BODEN_STUFEN (gelaende-boden.js:3191, Meter) und DETAIL_CASCADE (dirigent-ankunft.js:1873, Ringe) teilen den Boden in zwei Ketten; Gras endet am Ring (vegetation-wiese.js:1878), der Boden-Morph an 36 m.
  Schnitt: DETAIL_CASCADE fällt, ihre drei Leser lesen BODEN_STUFEN.

## 4 Am nächsten an Gebot 7 („Detail = Funktion des Fußabdrucks am Schirm und der Änderung")
- **netzStufe** (gelaende-core.js:1860): Detail = Oktaven, die der Fußabdruck (m je Masche) trägt; zustandslos, ohne Stufen-Tafel, Kosten folgen dem Fußabdruck (Kommentar :1856: 3,1 s → Fern-Feld frei). Ein reines Gesetz, aber nur am Fern-Ring konsumiert (gelaende-fern.js:1218); der Chunk-Boden fragt ohne `fuss`.
- **_wechselGesetz + LOD_SCHIRM** (vegetation-streu.js:2985) ist die breiteste Einheit (8 Leser), misst Pixel am Schirm, aber: diskrete Stufen, `max(Pixel, Haushalt)` lässt den Meter-Haushalt gewinnen, wo die Fehler-Zeile fehlt (Baum, Wagen, Leib = Haushalt allein). Änderung (Tempo) liest nur `_bedeutung` (vegetation-streu.js:1923), nie die Stufen-Wahl selbst (Kommentar :2973 „Tempo legt keine Stufe um").
- **_tuchStufeWahl** (koerper-core.js:9019) und **CDLOD-Morph** (gelaende-boden.js:2812) sind stetig bzw. pixel-rein, aber je eine Insel.

## 5 Was ein Studio liefern müsste, damit Gestalt eine FUNKTION statt Stufen ist
1. Eine Fehler-Funktion e(k): der geometrische Kanten-Versatz (m bei Skala 1) der Feinheit k gegen das Ideal — heute nur als Messung von außen für 2 Stufen × 20 Vorlagen (vegetation-streu.js:2907–2965), nicht vom Studio geliefert.
2. Einen stetigen Feinheits-Regler im Bau: vehicle-core hat ihn schon (`teil(n, min)` mit k, vehicle-core.js:62 FAHRZEUG_DETAIL_1 k 0,4), porta TOR_DETAIL_1/2, koerper `_tuchStufe` — heute auf 2–4 feste k gelegt. Lieferung: `buildInstance(P, k)` für jedes k ∈ (0,1], monoton in Dreiecken.
3. Die Fernform als Grenzwert k → 0 (`fernform`: huelle/gesetz/karte/boden ist schon Pflicht je Budget-Art, studio-bruecke.js:2970) und die Wurf-Gestalt als k_wurf.
4. Der Wirt wählt k = Funktion(Fußabdruck = Größe × Brennweite / Abstand, Änderung) über `_wechselGesetz`; Speicher quantisiert k in Oktaven (Foundry-Cache 512, studio-gestalt.js:1536), Hysterese einheitlich als Anteil.
Schnitt: B2c bekommt die Pflichtfelder `fehler(k)` und `k`-Regler; die 8 Tafeln behalten Budget-Zeilen nur noch als Messpunkte von e(k).

## Unbelegt
- Ob Schlieren der Spiegelung bei Fahrt mit einer Stufe zusammenhängen (Umwelt-Karte, nicht LOD) — nicht gelesen.
- Epochen-Wahl der Fahrzeuge (`epocheStufe` vehicle-core.js:4875) ist Zeit, keine Detail-Stufe — nicht geprüft.
- Millionen Fahrzeuge: kein Satz/Feld-Pfad für Wagen gefunden (Fernform "gesetz" Box-Satz, vehicle-core.js:44); Menge nicht gemessen.
- Kosten in ms je System: keine Messung in diesem Lauf.
