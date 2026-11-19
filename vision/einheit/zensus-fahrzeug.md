# Zensus FAHRZEUG — unterste Ebene (Leser, main b7ed8419, 19.11.)

Gelesen: vehicle-core.js (5 095 Z.), worlds/garage/garage.js (786), stamm/siedlung-verkehr.js (2 412), stamm/koerper-fahrt.js (3 263),
stamm/bild-kosten.js (TRAA), stamm/studio-bruecke.js (KIND_POLICY, Fernform), fachwerk-core.js (EPOCHEN, VERKEHR_GESETZ), docs/PFLICHT-OFFEN.md C.

## 1. Was ein Fahrzeug im Gesetz IST
- Einheit: EIN Rezept aus `PRESETS` (vehicle-core.js:4566) — 5 Gattungen `kind:"vehicle"`: gt, supersport, limousine, kompakt_fwd, suv
  (vehicle-core.js:4567/4598/4632/4666/4700). Die EINE Bau-Funktion `buildInstance(rezeptId, seed, lod, ov, werk)` (vehicle-core.js:4892).
- Anker: `hardpoints(P)` (vehicle-core.js:629) aus 16 Reglern `PARAMS` (vehicle-core.js:4399): radstand, spur, ueberhangV/H, taille, radR,
  fahrhoehe, guertel, dach, kabineMitte, kabineLaenge, tumblehome, springRate, damping, grip, epoche. Lehren/Toleranzbänder `LEHREN` (:536).
- Teile/Untersysteme: Rahmen `buildFrame` (:664) · Räder `makeWheel`/`buildWheels` (:758/:877) + Zeit-Räder `zeitRad` (:701), Kufen (:740) ·
  Karosserie `buildSkin` (:1379), Verjüngung `taperBody` (:1014), `bowEnds` (:1338) · Innenraum `buildPackage` (:2190) · Glas `glassPane` (:945) ·
  Licht `lightStrokes` (:422), `headlightShape` (:1180), Grill (:1230) · Deichsel (:2349) · eigene Gestalten `TOPO` kutsche/motorwagen/kanzel
  (:3059) · Fahrwerk/Antrieb im Kern: `fahrGesetz` (:3636), `fahrFeder` (:3787), `fahrStand` (:3807), `fahrKraefte` (:3892), `fahrLeistung` (:4127).
- Stoff: `materials()` (:70) — Lack `MeshPhysicalMaterial` clearcoat 1,0 / clearcoatRoughness 0,03–0,04 (:81–88, `LACK_ART` :307),
  Glas transparent 0,42, DoubleSide, envMapIntensity 3,0 (:89–98); 9 Lacke `LACK_GESETZ` (:3333), Same → Lack (`lackIndex` :297).

## 2. Die Zeit-Achse — im Studio da, in der Welt tot
- `EPOCHE_GESETZ` (vehicle-core.js:4771): 6 Stufen schlitten −5000 · ochsenkarren −3000 · kutsche 1700 · motorwagen 1900 · heute 2025 · zukunft 2150,
  je Stufe Form `s`, gestufte Topologie, Antrieb (Zugtiere/Motor/leise), Stoff-Tafel; `epocheForm` (:4848) interpoliert stetig.
- Brücke Jahr → Achse existiert: `epocheAusJahr` (vehicle-core.js:4869, exportiert :5025). **Leser in stamm/ und foundry-*: 0** (grep `epocheAusJahr`).
- Die Garage konsumiert die Achse (garage.js:235 `VC.epocheForm(P)`, Tafel :273–281). Die Welt nicht.
- Die Stadt kennt ihr Jahr: fachwerk `EPOCHEN` antike 80 … moderne 1935 (fachwerk-core.js:3622–3631), Plan `erbe.jahr` (:4018).
- Der Wagen der Stadt: `typ = gen.pick("wagen", V.wagen)` (siedlung-verkehr.js:383) aus `["kompakt_fwd","limousine","suv"]` (:2249), gestempelt
  als `fahrzeug_<typ>` OHNE `ov.epoche` (siedlung-verkehr.js:620–631). Folge: die Hanse-Stadt 1560 fährt SUVs.
- **ZWILLING Z1 (Zeit):** zwei Zeit-Achsen beantworten „welche Zeit ist hier" verschieden — fachwerk `EPOCHEN` (benannt, Region+Jahr+Spanne,
  fachwerk-core.js:3622) gegen vehicle `EPOCHE_GESETZ` (Stufen mit Jahr, vehicle-core.js:4771); die Naht `epocheAusJahr` hat keinen Leser.
- SCHNITT S1: `_verkehrWagenStellen` (siedlung-verkehr.js:619) reicht `ov.epoche = VC.epocheAusJahr(S.plan.erbe.jahr)` in den Stempel; die
  Gattungs-Liste `VERKEHR.wagen` (:2249) stirbt, die Gattung wählt das Gesetz der Epoche (Kutsche/Karren tragen ihre eigene Gestalt). Messung:
  Absenz-Grep `VERKEHR.wagen` = 0, Linse zählt je Stadt `epocheStufe` der Wagen gegen das Jahr der Stadt.

## 3. Weg in die Welt
- Verkehr: `spawnArchitecture("fahrzeug_"+typ, …, {ausGesetz, precise})` (siedlung-verkehr.js:621) → Foundry-Buch → `buildInstance` im Worker →
  Draw-Faltung `budgetErzwingen` (foundry-bruecke.js:959, phyto-core.js:6555) → Instanz-Slot `_archInstanceUpdate` (siedlung-instanz.js:927).
- Gestalten je Rezept = Lacke − 1 = 8 (vehicle-core.js:3353, eingetragen :5007) → Stadt höchstens 3 × 8 = 24 Geometrien.
- Stufen `kindStages.vehicle = [0, 1]` (vehicle-core.js:41); L1 = `FAHRZEUG_DETAIL_1 k 0,4` (:62); fernform `"gesetz"` = Box-Satz (:51).
- Spieler-Ritt: koerper-fahrt.js, Fahr-Schritt-Leser `_fahrSchrittGesetz` (koerper-fahrt.js:3147) — derselbe Kern-Schritt wie der Verkehr.
- **ZWILLING Z2 (Fernform):** vehicle-core sagt fern = Box-Satz `"gesetz"` (vehicle-core.js:51; Leser `_foundryFernForm` studio-bruecke.js:2961);
  `KIND_POLICY.vehicle.impostor: true` „8-Winkel-Billboard" (studio-bruecke.js:3724–3735) macht den Wagen über `_foundryPresetIsTree`
  (studio-bruecke.js:2828–2833) zum Baum — **17 Aufrufer** (studio-gestalt 8, vegetation-streu 4, siedlung-bauten 2, siedlung-instanz 1,
  dirigent-ankunft 1, werkstatt-vorschau 1); `LOD_SCHIRM` bestätigt: „der Wagen wechselt an der Maske des Baums" (vegetation-streu.js:2889).
  Welche Antwort im Bild gewinnt: unbelegt (nicht gespielt).
- SCHNITT S2: `impostor` fällt aus `KIND_POLICY.vehicle`; `_foundryPresetIsTree` liest nur noch `lod.budget[kind].fernform === "karte"` — EINE Frage, EIN Leser.
- **ZWILLING Z3 (Antrieb):** `FAHR.hostEmergent` „die Fallback-Fahr-Formel des Wirts" (vehicle-core.js:3103–3112, Leser koerper-fahrt.js:921)
  neben `fahrGesetz/fahrStand` (vehicle-core.js:3636/3807) — zwei Antworten auf „wie beschleunigt ein Fahrzeug". SCHNITT S3: das Teile-Werk
  erzeugt aus seinen Teilen ein `P` (Radstand, Spur, Masse) und fährt `fahrStand`; hostEmergent stirbt.

## 4. Kosten je Wagen (aus Tafeln, nicht gemessen)
- Budget-Zeile (vehicle-core.js:49–50): L0 32 000 Dreiecke (Band-Ziel 20 000), 12 Draws, wirft nicht; L1 10 600 Dreiecke, 10 Draws, wirft.
- Profi-Band 680 000 Dreiecke · 208 Befehle (docs/PFLICHT-OFFEN.md:19): **21 Wagen in L0 oder 64 in L1 füllen die ganzen Dreiecke; 17 Wagen L0
  füllen die Befehle** (208/12), sofern ohne Instanz-Teilung — wie viele Draws je Instanz-Gruppe wirklich anfallen: unbelegt.
- `buildInstance` baut bis zu 5-mal neu, bis die Zeile hält (vehicle-core.js:4903–4925): die Kosten-Kontrolle sitzt im Wagen-Kern, nicht im Wirt.
- Anzahl heute: `verkehrVon` N = ceil(Lose / 15) (`hausJeWagen: 15`, fachwerk-core.js:4865–4868) → nH 300 = 20 Wagen (= Kriterium C).
  Höchste Zahl einer Metropole: unbelegt.

## 5. Spiegelung und Schlieren bei Fahrt
- Spiegelung = nur die Himmels-Umgebung: `scene.environment` = PMREM der 128×64-Equirekt (bild-himmel.js:657, :705, :715–724). Keine
  Rückstrahl-SSR: „Rückstrahl" ist das Boden-Licht (bild-schatten.js:264–309). Stadt, Bäume, andere Wagen spiegeln sich NIE im Lack.
- Die zeitliche Auflösung ist zugleich der Hochskalierer: Szene in `SZENE_SKALA 0,75` (bild-kosten.js:2992), TRAA löst auf (:1644–1720).
- **Wurzel der Schlieren:** die Bewegung je Pixel ist NUR die Kamera aus der Tiefe — „die Welt ist statisch, also ist Kamerabewegung EXAKT
  reprojezierbar … Was sich selbst bewegt, fängt die Varianz-Klemme" (bild-kosten.js:2500–2510, :2280); `T.velocity`-MRT ausdrücklich abgelehnt.
  Ausnahme nur der Leib des Spielers + Hand-Gerät (`_traegerTeile`, bild-kosten.js:2647–2665, `TRAEGER.teile 24` :3011).
  Der gerittene Wagen und jeder Verkehrs-Wagen sind NICHT darunter → ihre Pixel holen Geschichte vom Grund, über den die Kamera zog;
  der Klarlack (Rauheit 0,03) trägt scharfe Lichter, die die 3×3-Klemme (`ZEIT_GAMMA_RUHE 1,25`, :2997) nicht hält → Schliere.
  Glas transparent DoubleSide (vehicle-core.js:89–98): ob es Tiefe schreibt und damit die Reprojektion falsch verankert — unbelegt.
- SCHNITT S4: `_traegerTeile` (bild-kosten.js:2647) trägt den Kasten jedes im Bild FAHRENDEN Wagens als starre Box (wie `_traegerStarr` des
  Geräts) — der Umriss liegt fertig als `__mass` (vehicle-core.js:4926ff.), die Lage schreibt `_verkehrBild` ohnehin je Bild
  (siedlung-verkehr.js:670). EINE Klasse „starr bewegt" statt Spieler-Sonderfall; Deckel `TRAEGER.teile` wächst um die Wagen im Blick.
  Messung: Werkbank Fahrt GT 20 m/s, Luma-Fehler der Lack-Pixel Frame zu Frame vorher↔nachher.

## 6. Die Lücke zu „Millionen von Fahrzeugen entsprechend ihrer Umgebung"
Was die Kosten heute an die ANZAHL bindet (je Stelle O(N) aller Wagen, gleich ob im Bild):
- Jeder Wagen ist ein Architektur-Eintrag mit Fahrzeug-Profil, Fahr-Zustand und 1–2 Fahrern mit Leib (siedlung-verkehr.js:384–440, :621).
- Sim-Schleife über alle Wagen aller Siedlungen je Schritt (siedlung-verkehr.js:1435–1460); die Leiter dünnt nur die Rate
  (1/1 · 1/2 ab 40 m · 1/4 ab 100 m · 1/8 ab 200 m, :2306–2311), Kappe 12 Schritte je Siedlung (:2295, :1462–1468) — die Schleife bleibt O(N).
- Bild-Schleife über alle Wagen je Frame (siedlung-verkehr.js:757–800).
- Culling-Scan fragt JEDEN Eintrag je Frame (studio-bruecke.js:3417).
- Belegung/Warte-Graph je Wagen (`_verkehrBelegung`, :1438; Zählung `arbeit` :2335).
- Die Anzahl selbst folgt den Häusern (1 je 15 Lose, fachwerk-core.js:4865), nie dem Schirm.
SCHNITT S5 (der EINE, der die Bindung löst): der Verkehr wird eine FUNKTION des Netzes — je Spur ein Fluss `f(Same, Zeit) → Lage aller Wagen
auf der Strecke` (Abstand, Tempo und Epoche aus dem Gesetz der Stadt), ausgewertet nur für Strecken im Schirm; Architektur-Einträge mit
Fahrer-Leib und `fahrStand` entstehen nur im Nah-Kreis (`VERKEHR.genauM 12`/`huelleM 12`, :2312–2313 sind die vorhandene Grenze) und
fallen beim Verlassen zurück in den Fluss. Ferne Wagen zeichnet EIN Instanz-Zug je (Gattung × Epoche × Lack) mit Matrizen aus dem Fluss.
Kosten = Strecken im Schirm + Nah-Wagen; die Stadt kann 20 oder 2 000 000 Wagen tragen. Messung: ms des Verkehrs-Takts bei 20 vs 2 000 Wagen
gleicher Kamera — soll gleich.

## 7. Die Einheit, nach der der Schöpfer fragt (LOD je Studio)
- 7 Kerne tragen je ein eigenes `PORTAL_RENDER_CONFIG.lod` (fachwerk, foundry, koerper, porta, schmiede, tetrapoda, vehicle; grep).
- EINS ist schon Einheit: die Draw-Faltung `budgetErzwingen` (phyto-core.js:6555, Wirt foundry-bruecke.js:959) für alle Kerne; der Wechsel-
  Abstand am Schirm `LOD_SCHIRM` (vegetation-streu.js:2895) für alle Arten.
- Die Dreieck-Reduktion ist je Kern eigen: vehicle `teil()` × k 0,4 + Neubau-Schleife (vehicle-core.js:61–64, :4903–4925), porta
  `TOR_DETAIL_1` + `baueStufe` (porta-core.js:260, :1542), schmiede `teil` (schmiede-core.js:4224); fachwerk/koerper/tetrapoda: unbelegt im Detail.
- SCHNITT S6: die Zeile `tris` je Stufe erzwingt der Wirt am selben Ausgang wie `draws` — `budgetErzwingen` bekommt die Dreieck-Seite (EIN
  Vereinfacher über die gelieferten Meshes, Kanten-Fehler gegen `LOD_SCHIRM.px`), die Kern-Schleifen (vehicle :4903–4925) sterben.

## 8. PFLICHT-OFFEN C (docs/PFLICHT-OFFEN.md:18)
Kriterium: Stadt nH 300, Tag und Nacht, ≥ 20 Wagen mit Bewohnern am Steuer 10 min, 0 Berührungen, jedes Ziel erreicht, Profi-Band hält.
Der Code trägt Fahrer, Spuren, Zonen, Vorrang, Zähler `stoss`/`ziele` (siedlung-verkehr.js:2324–2338). Ob C heute grün misst: unbelegt.
S1 (Epoche) und S4 (Schlieren) ändern C nicht; S5 trägt die Last-Seite von C (Profi-Band) und macht „Millionen" erst möglich.

## Unbelegt
Bild der Fernform (Karte vs Box), echte Draws je Instanz-Gruppe, Glas-Tiefe in der Reprojektion, Metropolen-Wagenzahl, C-Messung heute,
Detail-Reduktion in fachwerk/koerper/tetrapoda.
