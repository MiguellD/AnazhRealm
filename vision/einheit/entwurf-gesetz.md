# ENTWURF DER EINHEIT — Stufe · Stoff · Zeit (Opus-Leser, 19.11.; gelesen am Baum b7ed8419, nicht am bestellten dabd69bb)

Quellen: die sechs Leser-Blätter dieses Ordners (zensus-stufe/-stoff/-fahrzeug/-haus, muster-und-bremsen, luecke-vision), dazu selbst
nachgelesen: vegetation-streu.js:2926–2961 (`LOD_SCHIRM.fehler.haus`), :2985–3010 (`_wechselGesetz`, `_wechselHaushalt`),
vehicle-core.js:4869 (`epocheAusJahr`), koerper-fahrt.js:3251 (`KAM_FOV_GRAD` 75), schmiede-core.js:2860/2911. Ein Entwurf, keine Varianten.

## 0 Die Antwort auf das Wort, in drei Zahlen
- Ja, wir bauen die Stufe je Studio — beim BAUEN (7 Kerne mit eigenem `kindStages`, 5 Stufen-Bauer; zensus-haus §3) und bei der GRENZE:
  von 64 Haus-Wechseln (32 Vorlagen × L1/L2, vegetation-streu.js:2926–2961) stehen **58 an den geliehenen Baum-Zahlen 12 / 26 m**
  (foundry-core.js:432; nachgerechnet: Brennweite 1080 / (2·tan 37,5°) = 703,7 px/m, der Pixel-Term schlägt den Haushalt nur bei
  niedersaechsisch L1 und 5 L2-Zeilen). Der Wagen: 5 von 5 Gattungen ohne Fehler-Zeile, also 100 % Baum-Zahl (vegetation-streu.js:2889).
- Stoff: **120 `roughness`- und 123 `metalness`-Literale** gegen EIN `STOFF_GESETZ` (schmiede-core.js:2860), Holz hat 8 Rauheiten (zensus-stoff Z1).
- Zeit: `epocheAusJahr` (vehicle-core.js:4869) hat **0 Leser** in stamm/ und foundry-*, `HAUS` liest `baujahr` 0-mal (fc:168–1800).
- Die Einheit der WAHL existiert schon: `_wechselGesetz` (vegetation-streu.js:2985) mit 8 Lesern. Der Vorschlag `stufeFuer(radiusM, distM,
  schirmZeilen)` in foundry-core (muster-und-bremsen M7) wäre ihr Zwilling — er fällt hier, bevor er gebaut wird.

## 1 DAS STUFEN-GESETZ
Größen (je mit Einheit):
- `px` — der Versatz, den ein Wechsel tragen darf, Bildpunkte (Soll 1; vegetation-streu.js:2895 `LOD_SCHIRM.px`).
- `f(zeilen)` — Brennweite des Schirms, px je m Größe in 1 m Abstand (`_brennweite`, vegetation-streu.js:2997; 703,7 an 1080 Zeilen, 75°).
- `e[art][vorlage][k]` — Kanten-Versatz der Stufe k gegen L0, m bei Welt-Skala 1, gemessen am Abstand, an dem er 1 px trägt.
- `g` — Größe der Instanz (Skala, dimensionslos); `h` — Hysterese als Anteil 0,1 (`LOD_SCHIRM.hyst`), die EINE Form.
Die eine Funktion: `d_k = e[art][vorlage][k] · f(zeilen) / px · g` — Stufe k gilt jenseits d_k, hinein ab (1+h)·d_k, zurück unter (1−h)·d_k
(`_stufeNachGrenzen`, siedlung-bauten.js:3265). Kein `max(…, Haushalt)`: der Meter-Haushalt ist keine Stufen-Größe, sondern Kosten.
Sitz: der Körper von `_wechselGesetz` zieht als `FoundryCore.stufeGrenze(e, zeilen, px, g)` in foundry-core.js (additiv, neben `lod`
:432), damit die Studio-Seiten ohne Stamm dieselbe Zahl rechnen; `AnazhRealm._wechselGesetz` wird der Aufruf dieses einen Körpers.
Was ein Studio liefert (Pflicht, sonst `_kernPflichtBruch`, vegetation-streu.js:2990):
1. je Vorlage und Stufe die Zeile `fehler` — das Studio misst sie selbst im Kern gegen seine L0 (heute misst sie die Welt von außen,
   und für Zeilen, die das Soll am Haushalt tragen, steht nur der Versatz AM Haushalt, vegetation-streu.js:2885–2887 — eine Untergrenze);
2. die `fernform` (schon Pflicht, studio-bruecke.js:2970); 3. die Zeilen `tris`/`draws` je Stufe als Kosten-Zeile, die der Wirt am
   Ausgang erzwingt (`budgetErzwingen`, foundry-bruecke.js:959), nicht der Kern in eigener Neubau-Schleife.
Die Klasse, die in EINER Welle fällt („bis wohin nah, in Metern, je Domäne"):
- `lod.d0` 12 · `d1` 26 · `ref` 12 (foundry-core.js:432) und der Rückfall in `_wechselHaushalt` (vegetation-streu.js:3001–3010);
- die `ab`-Meter je Kern: porta-core.js:87–88 (9,5 / 12) · tetrapoda-core.js:46 (35 × Größe) · koerper-core.js:49 (40) ·
  worlds/neuntes-buch/stele-core.js:30–31 (14 / 32);
- `KIND_POLICY.vehicle.impostor` (studio-bruecke.js:3724–3735), der den Wagen über `_foundryPresetIsTree` (:2828–2833) zum Baum macht;
- die Studio-Ringe `lodPlan(rin, rout)` fachwerk-core.js:4574 · `lodTick` worlds/fachwerk/fachwerk.js:131 · `updateTreeLOD`
  worlds/terrain/phytogenesis.js:2731 — sie lesen `FoundryCore.stufeGrenze`;
- `SEIL_NAH_M` 40 (stamm/koerper-seele.js:1809) · `ANALOG_NAH_M` 64 (stamm/kreatur-leben.js:3722) als Stufen-Grenzen;
- `DETAIL_CASCADE` (dirigent-ankunft.js:1873) fällt, ihre drei Leser lesen `BODEN_STUFEN` (gelaende-boden.js:3191) — Zwilling Z4;
- die Neubau-Schleife bis 5× im Wagen-Kern (vehicle-core.js:4903–4925) — Kosten erzwingt der Wirt;
- das Stufen-Soll des Hauses an L1 statt L0 (fc:2672–2678) und der Luma-Faktor `tonUebertrag` (fc:2712, Klemme 0,25–4 :2709).
Nicht in dieser Klasse, offen mit Grund: Kappen und Sim-Takt (zensus-stufe Zeilen 10–13, 20–21: Anzahl/Teiler, nicht Gestalt) gehören
dem Kosten-Gesetz „Haushalt in ms im Blick"; Schatten-Texel, Tuch-Gitter, Gelände-Oktaven, Planeten-Karte (Zeilen 22–25) tragen schon die
Form „Fußabdruck je Einheit" und werden Leser derselben Brennweite, ohne eigene Welle. Absenz-Linse: neue `*_NAH_M`/`ab:`/`rin` in
Gestalt-Wahl heißt ROT beim Namen (Atlas-Familie).

## 2 DAS STOFF-GESETZ
Sitz: `STOFF_GESETZ` (schmiede-core.js:2860, REIN 26 + MISCH 4) bleibt die EINE Tafel, additiv erweitert. Neue Spalten in `SPALTEN`
(:2911) mit Einheit: `albedo` (linear 0..1, Mitte des Bands aus scripts/diag-gegenstand-stoff.cjs:74–85 — das Soll zieht vom Richter ins
Gesetz) · `f0` (aus `n`, `fresnel0` hat heute 1 Leser, wasser-hydro.js:860) · `poren` (0..1, ersetzt die 7 kind-Einträge
stoff-material.js:3798) · `alter` (Ziel-Albedo linear + Tage, aus bau-vorlagen.js:1684–1693, für jede Zeile statt 3 von 21) · `seit`
(Jahr der ersten Nutzung, s. §3). Schichten: eine Zeile darf `ueber: <Zeile>` tragen (Lack über Holz, Wasserfilm über Klarlack) — die
benannte Schicht statt eines eigenen Stoffs.
Die eine Funktion: `stoffAntwort(name, schicht, alterTage, naesse) → {albedo, rauheit, metall, f0, …}`; `budgetRegler`
(phyto-core.js:5965) liest sie über `mp.stoff` — DER Schlüssel jedes Studio-Stoffs ist dann der Q1-Name.
Was ein Studio liefert: je Teil NUR den Q1-Namen + Schicht. Keine Hex-Farbe, keine Rauheit, keine Metallik.
Fehlende Zeilen, die der Schöpfer nennt: Asphalt, Beton, Stahlbeton, Lehm, gebrannter Ziegel, Kalkputz, Reet/Laub, Marmor (0 Zeilen heute,
zensus-stoff §5.9, zensus-haus §5.2), Hornhaut n 1,336 (Z3).
Die Klasse, die in EINER Welle fällt: die Kern-Tafeln Q3 schmiede `M` (schmiede-core.js:79–140) · Q4 vehicle `materials()`/LACK_ART/
EPOCHE_STOFF_ART (vehicle-core.js:70–186, :307, :331) · Q5 fachwerk 27 Stoffe (fc:2062–2091, mit `glasfern` als Metall :2091) · Q8/Q9
Haut/Fell/Auge (koerper-core.js:739, tetrapoda-core.js:3688) · Q10 Defaults des `budgetRegler` (phyto-core.js:5965–5995) · Q2-Hex
(bau-vorlagen.js:1756–1942) · `WERK_ALTER.seh` (siedlung-satz.js:1980, alles „stoff" altert als Stein) · VERBAND_GESETZ als Zeile von
STEIN_GESETZ (fachwerk-core.js:1847 → porta-core.js:301) · sRGB→linear an 10 Stellen (Z6) · Sinus-Hash (studio-stoff.js:607,
foundry-core.js:911). Messung: Absenz-Grep der Literale in den sechs Zweit-Kernen 120 → 0, Holz-Rauheiten 8 → 1.
Naht zum Licht, offen mit Grund: Emission in cd/m² trägt der ungelandete Zweig `licht-eine-skala` (5 WIP-Commits, zensus-stoff §4); das
Stoff-Gesetz bleibt einheitenlos (Albedo, F0) und hängt nicht an ihm. Schlieren bei Fahrt: Hypothese bis zur Ursache belegt
(bild-kosten.js:2500–2510, nur Kamera reprojiziert; Träger nur Spieler-Leib + Gerät :2647–2665) — der Schnitt S4: `_traegerTeile`
trägt die Box jedes fahrenden Wagens im Blick (`__mass`, vehicle-core.js:4926), eine Klasse „starr bewegt". Ob der gerittene Wagen
schon Träger ist: unbelegt.

## 3 DIE ZEIT ALS GRÖSSE
Größe: `jahr` (Jahr n. Chr., negativ v. Chr.) des Orts, EINE Quelle: der Plan der Stadt `erbe.jahr` (fc:4018). Kein Bauplan je Epoche —
das Jahr wirkt nur über stetige Größen, die die Gesetze schon tragen:
- Fahrzeug: `ov.epoche = epocheAusJahr(jahr)` (vehicle-core.js:4869) in den Stempel `_verkehrWagenStellen` (siedlung-verkehr.js:619);
  `epocheForm` (:4848) interpoliert die Form schon stetig, `EPOCHE_GESETZ` (:4771) trägt Antrieb und Topologie (Karren/Kutsche/Motor).
  Die Gattungs-Liste `VERKEHR.wagen` (siedlung-verkehr.js:2249) stirbt. Folge im Bild: in der Hanse 1560 fährt der Karren statt des SUV.
- Haus: der Stoff der Wand/Decke/Dach = der Q1-Zeilen-Name, den Region × `jahr` erlaubt (`seit` ≤ jahr); das Tragwerk folgt aus dem
  Stoff (E, σ) × Spannweite — dieselbe Regel, die das Möbel schon trägt (`spanMax`, fc:1121–1122), statt `bayMax` 1,7 fest (fc:181);
  jede KULTUR-Zeile (fc:2121–2154) trägt ihre Spanne [von, bis], die Wahl Region × Jahr → Kultur ist EINE Funktion.
- Laubhütte und Burg entstehen so aus Zeilen: Reet/Laub mit frühem `seit` + Stab-Tragwerk; die Burg bleibt Haus mit `zinnen/turm`
  (fc:4473) auf Naturstein. Die Klemmen W ≤ 15, D ≤ 11, 12 Geschosse (fc:183, 2207–2208) fallen erst mit dem Tragwerk aus Festigkeit —
  das ist die Statik-Welle aus `vision/bau/entscheid.md` (0 von 100 Häusern tragen ihre Balkenlage), nicht diese.
Die Klasse der Zeit-Zwillinge, die fällt: fachwerk `EPOCHEN`-Pools (fc:3622–3632) und `STADT_GRAMMATIK.zeit` (fc:4321) lesen die Spannen
der KULTUR; die drei Grenzen 1700 / 1750 / 1800 (fc:4470, 5342, 4321) werden Zeilen derselben Achse; „Kultur des Herrn" zweimal
(fc:4325 gegen fc:4472) wird eine. Messung: je Stadt Anteil Wagen, deren `epocheStufe` zum Jahr der Stadt passt: heute 0 %, Soll 100 %.
Galaxien und Zeit jenseits von −5000 / 2150 (EPOCHE_GESETZ): kein Gesetz, kein Zensus (luecke-vision §1 kosmos) — offen.

## 4 DIE REIHENFOLGE: Zensus (steht, 4 Blätter) → EIN Gesetz (§1) → Spike → EINE Welle
Erster Spike, der kleinste Bau, der die Einheit an zwei Studios zugleich beweist: **Haus und Wagen wechseln am eigenen Pixel-Fehler,
der Baum-Rückfall stirbt für beide.** Bau: vehicle-core liefert `fehler.vehicle[gattung][1]` für 5 Gattungen, fachwerk misst seine 32
Zeilen am 1-px-Abstand neu (nicht am Haushalt); `_wechselHaushalt` gibt für `haus`/`vehicle` nichts mehr, `impostor` fällt aus
`KIND_POLICY.vehicle`. Garage und Fachwerk-Studio lesen dieselbe `FoundryCore.stufeGrenze`.
Soll (vor der Rechnung, ins erste Commit `soll.json`):
- Wechsel mit Quelle d0/d1: heute 58 von 64 Haus + 5 von 5 Wagen → Soll 0 von 69.
- Kanten-Versatz am Wechsel je Zeile ≤ 1,0 px an 1080 Zeilen (Linse gate:haus-fern P, sie liest dieselbe Funktion) — 69 von 69.
- Dreiecke im Blick am Messort stadt-voll, gleiche Pose, GTX: nachher ≤ vorher. Frame p95: nachher ≤ vorher + 0,3 ms.
- Studio = Welt: die Garage meldet für die Limousine dieselbe Grenze in m wie die Welt (Differenz 0,0 m).
Vorhersage: die Limousine trägt am Baum-Wechsel 12 m nur 0,02 px (vegetation-streu.js:2889); skaliert der Versatz mit 1/d, liegt ihr
1-px-Abstand bei ~0,24 m — jeder Verkehrswagen im Blick fällt von L0 32 000 auf L1 10 600 Dreiecke (−67 %, vehicle-core.js:49–50), L0
bleibt dem Ritt. Die Häuser wechseln früher als 12 m (31 L1-Zeilen tragen heute < 1 px am Haushalt); um wie viel: unbelegt bis zur
Messung. Spike nein = stopp: eine Zeile > 1,0 px am neuen Wechsel nennt sich beim Namen, die Welle wartet auf ihre Heilung.
Danach EINE Bau-Welle: die ganze Klasse §1 (alle 8 Tafeln, die Studio-Ringe, Z4); dann der Stoff-Spike (Holz: Wagen und Haus lesen eine
Zeile, Rauheiten 8 → 1, Bildpaar Werkstatt) und die Stoff-Welle §2; die Zeit (§3) reitet auf der Stoff-Spalte `seit` und landet mit ihr.

## 5 Die drei Heilungen als Werkzeug, zuerst gebaut (aus muster-und-bremsen)
1. **Soll vorab erzwungen (M5):** das Stempel-Werkzeug des Zugs verweigert, wenn der erste Commit des Zweigs nicht `soll.json` ist oder
   ein späterer sie ändert. Ort: der Stempel-Griff in `zug/dienst/` (Datei unbelegt, im Blatt nicht genannt). Trägt die Methode §4.
2. **Puls statt Prosa (M6, deckt M11 und M1):** der Kopf von `messplatz-blick.cjs --kurz` bekommt die Spalte „Stationen gebucht in
   15 min" (0 → STEHT mit Gerät) und die Zeile `wellen-landung` (Tokens seit letzter Landung ÷ Landungen, > 10 M ROT); `pushe()`
   (radeon-dienst.sh:105–112) endet ROT statt still. Ohne sie misst niemand den Spike (drei Tage Radeon-Messung kamen nie an, LAGE:197).
3. **Äste mit Frist (M2):** `zug/dienst/ungelandet.cjs` nennt je Zweig Alter und Besitzer; > 72 h ohne Abgabe-Commit → `refs/archiv/<datum>`
   + eine Zeile „fällt offen" in LAGE. Heute 37 ungelandet, der älteste seit 12.11.; die 5 Licht- und 4 Heap-Zwillings-Zweige zuerst.

## 6 Was der Plan bis 17.12. ehrlich trägt (luecke-vision §3)
Rate: 5,0 Sprossen je Tag (7 Tage), nötig 60,1 (1 683 offen in 28 Tagen) = 12,0-fach; bei 5,0 stehen am 17.12. 175 von 1 718
(10,2 %), bei 8,9 (seit Buchungsbeginn) 284 (16,5 %). Die drei Grundgesetze tragen dem Wort nach 339 Sprossen (19,7 %, Untergrenze).
Trägt: die Stufen-Welle (§1) und die Stoff-Welle mit Zeit an Wagen und Haus (§2, §3) in main; Pflicht C mit 20 Wagen der richtigen Epoche;
die drei Werkzeuge §5. Offen, mit Grund und Messname: Millionen Wagen (Fluss je Spur, S5 zensus-fahrzeug §6 — Messname: ms des
Verkehrs-Takts bei 20 vs 2 000 Wagen, Soll gleich); Bauten über 22 m Traufe und 15 m Breite (Statik-Welle); Licht in cd/m² (Zweig
licht-eine-skala); Kosmos/Galaxien (kein Zensus); 1 718 Sprossen — die Rate deckt sie nicht, auch nicht verdreifacht.
Zwilling im Plan: PLAN-1712 trägt 0 der 14 Wörter des Schöpfers und ordnet nach Kapitel-Gewicht (PLAN:33) — der Koordinator setzt die
Reihenfolge §4 an diese Stelle; die Zahl der Rate schreibt `vision/buche-2.cjs`, nicht die Hand.

## Unbelegt
Der wahre 1-px-Abstand der 31 Haus-Zeilen mit Versatz < 1 px am Haushalt; ob Versatz fern mit 1/d skaliert (Wagen-Vorhersage hängt daran);
welcher Leser `ab:` der Leiber außer `_gelenkGrenzen` liest; die Datei des Stempel-Griffs; ob der gerittene Wagen Träger der Reprojektion
ist; echte Draws je Instanz-Gruppe; die `seit`-Jahre der Stoffe (Geschichte, keine Code-Quelle); kein Bild, kein GPU-Lauf in diesem Lauf.
