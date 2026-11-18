# ZENSUS VERKEHR — die unterste Ebene (Pflicht C), gelesen am Kopf main b7ed8419 (V18.546.339), 18.11.

Fünf Leser, je ein Blatt mit datei:zeile; Zahlen headless in Node 22 gegen die echten Kerne gemessen (kein Browser, keine GPU).
Kürzel: fwc = fachwerk-core.js · vc = vehicle-core.js · kc = koerper-core.js · sv = stamm/siedlung-verkehr.js · sb =
stamm/siedlung-bewohner.js · kf = stamm/koerper-fahrt.js · so = stamm/siedlung-ort.js · sw = stamm/siedlung-wege.js ·
dt = stamm/dirigent-takt.js. „folgt“ = aus einem Gesetz gerechnet, „gesetzt“ = eine Zahl von Hand.

**Drei Befunde vorab.** (1) Die Netz-Stadt ist auf Stufe 1 eine echte FUNKTION: `kachelNetz(samen, i, k)` rechnet eine
256-m-Kachel in 0,22–0,27 ms, zustandslos, byte-gleich, und ihre Straßen laufen über jede Kachel-Naht weiter (die Tore einer
Kante sind EINE Funktion beider Nachbarn) — die ganze Stadt ist ein gekrümmtes Gitter von 5 × 5 Straßen je Kachel, je Reihe
und Spalte eine durchgehende Hauptstraße. (2) Der Verkehr liest dieses Netz NICHT: er fährt auf `verkehrsNetz` je Plan, das
an Toren keine Wende sucht — in einer Kachel der Netz-Stadt fährt nach dem Code kein Wagen (fwc:5081, sv:117, sv:158). Er
lebt nur in der Plan-Stadt „dorf 7 300“ (stadt-voll), als gehaltener Sack von 20 Wagen mit Agenten-Suche, Zufallsziel und
einem Takt, der mit n wächst. (3) Der Tag des Bewohners ist schon eine reine Funktion von (Person, Uhr) — die Fahrt nicht.

## (a) Die Trassen

| Größe | Einheit | Anker | Leser | folgt/gesetzt |
|---|---|---|---|---|
| Kachel `SIEDLUNG.cellM` | 256 m | fwc:3662, 3845 | so:1499, 1523; sw:2062 | gesetzt |
| Tore je Kachel-Kante (5, Spiel 0,4, Hash der KANTE) | Stück | fwc:3819, 3827–3833 `kachelTore` | fwc:3846; scripts/lib/ort-proben.cjs:453 | gesetzt |
| Straße j (O–W) / i (N–S): glatte Kurve Tor j West → Tor j Ost, an der Kante senkrecht | m | fwc:3844–3848 `kachelNetz` | dorfLayout fwc:5365; kachelMassen fwc:4077 | folgt aus den Toren |
| Knoten = Kreuzung j × i (Fixpunkt, 4 Iterationen), 25 je Kachel + 20 Tor-Knoten | m | fwc:3849 | fwc:5370 | folgt |
| Hauptstraße gen 0: EINE je Reihe (`kachelHaupt(samen,1,iz)`) und je Spalte, durchgehend über alle Kacheln; Knoten 0 = ihre Kreuzung | – | fwc:3836–3838, 3850 | fwc:4085, 4912 | gesetzt (Hash) |
| Kante `{a, b, pts[{x,z,th}], w, gen, len}`, 60 je Kachel (je Straße 6 Stücke) | – | fwc:3852–3857 | fwc:5366; fwc:4082 | – |
| Breite w: 5,0 (gen 0) · 3,9 (gen 1) | m | fwc:3857, `DORF_NORM.strasseW` | fwc:4912; sv:182 | gesetzt |
| Linienzug je `DS` = 3 m, Krümmung nur implizit (kein Feld) | m | fwc:3845, 3854 | fwc:5367 | folgt |
| Blöcke 36 je Kachel, Häuser traufständig an ihren Kanten | m | fwc:3864–3865; fwc:4086–4095 | fwc:9977 | folgt |
| Spuren 2, Versatz `spurM` 1,25 (nur im Plan-Netz) | m | fwc:4865, 4961, 4974–4989 | sv:48, 88–89, 227–243 | gesetzt |
| Richtung: keine Einbahn; Abbieger erlaubt/verboten je Kreuzung (nur Plan-Netz) | – | fwc:5021–5045 | sv:49, 103–121 | folgt |
| Wende `wendeM` 7, `wendeAbM` [7, 80], Parkplatz 5,4 × 2,3; ein Tor ist kein Ende | m | fwc:4865–4866, 5080–5081 | sv:51, 117, 158 | gesetzt |
| Höhe/Steigung | m | Stufe 1: kein Gelände-Argument (fwc:3844); Plan v2: Erdbau `trasse` y0/y1 fwc:5196, 5210, `hangMax` 0,3 | Stufen-Wand sv:53–102 | Stufe 1: fehlt |
| Belag (Jahr × Rang), Gehweg 1,8 | Stufe, m | fwc:10060–10075; fwc:4364 | fwc:4084, 5516 | folgt |
| Häuser je Kachel `viertelWort(..).nH` (Clark-Profil, Deckel 190) | Haus | fwc:3925–3951, 4006–4021, 3819 | fwc:4075, 9731 | folgt aus der Zahl des Worts |
| „Adresse“ | – | nicht gefunden; Schlüssel heute (Kachel, Block·4+Kante, Platz j) fwc:4094 bzw. (Plan, Los) fwc:4878 | – | – |

**Funktion oder Sack.** Stufe 1 ist Funktion: Kachel = round((x − Anker)/256), die Frage kostet in jeder Stadtgröße gleich
(Kachel am Rand 0,33–1,4 ms bei nH 501 … 475 000; der Plan der Stadt einmal, gemerkt: 11,7 ms bei 47 500, 46,9 ms bei
475 000). `viertelWort` gemessen 1,9–25 µs je Ruf (warm). Stufe 2 (`exportSettlement` 1,8–1,95 s je Kachel, Foundry-Faden)
und `verkehrsNetz` (Voxel-Faden, fwc:11219–11223) sind ein Sack je Kachel/Plan; es gibt keinen Graphen über die Stadt, keine
Abfrage (x, z) → Kante, und die Tür eines Loses nennt ihre Straße nicht (fwc:9444–9447).
**Zahlen** (Same 7): nH 1 641 → 25 Kacheln (R 2); nH 100 000 → 1 597 Kacheln (R 22); nH 1 000 000 → 15 965 Kacheln (R 71,
≈ 36 km Durchmesser); Stadt 7/4750: 69 Kacheln, 3 105 Knoten, 4 140 Kanten (828 Hauptstraße), 176,7 km in 15–19 ms;
`kachelMassen` 3–7 ms je Kachel (5 167 Häuser der 4750er-Stadt in 68–83 ms). Die „1 641“ ist der Lauf vom 15.11. im Spiel
(3 × 3 Kacheln wach, sw:2118), headless heute 1 472 Lose / 1 680 Massen. Determinismus: `kachelNetz(7,0,0)` sha256
39b383ed43ca zweimal; x, z entstehen nur aus + − × / (Glättung `glatt` ist ein Polynom) — `th` aus atan2 ist der einzige
transzendente Wert.

## (b) Die Wagen

| Größe | Einheit | Anker (vc) | Leser in der Welt | folgt/gesetzt |
|---|---|---|---|---|
| Masse (Volumen × `masseDichte` 150) | m³ / kg | carPhys :3399–3402, :3141 | Schritt; kg `_fahrMasse` kf:3024 | folgt (Kompakt 1 286 · Limousine 1 680 · SUV 1 850 kg) |
| Leistung, Anfahr-Moment, Kennlinie min(aEngine, aLeist/v) | W/kg, m/s² | :3412–3414, :3984 | Schritt | gesetzt / folgt; Getriebe: nicht gefunden |
| vmax (Bisektion) | m/s | :3420–3427 | :4108; kf:958 | folgt (40,3–57,3) |
| Bremse 14 · Handbremse 9 · Ausrollen 1,0 | m/s² | :3077–3079 | Schritt | gesetzt |
| Haftung, Reifen (Pacejka C 1,6, Spitze 8,5°, 240 Hz) | – | :3083, :3292–3296, `fahrReifen` :3708 | Schritt; `_fahrHaft` kf:1810 | gesetzt |
| Radstand L, Spur W, Radradius | m | PARAMS :4401, :4410, :4446 | Schritt; `fahrAufstand` :3598 ← kf:1392 | gesetzt |
| Lenkwinkel max 0,52; Wenderadius L/tan 0,52 = 4,54–5,33 m | rad, m | :3076; Wenderadius im Kern nicht geführt | Stadt plant mit eigenen `kurveR` 5,5, `wendeM` 7 (fwc:4865) — liest den Kern nicht | Zwilling |
| Fahrersitz | m | `exportDrive.sitz` :3463 | `_sitzHoehe` kf:635, `_sitzOrt` kf:651 | folgt |
| Lenkrad-Lage · Pedale | m | nur im Bau :2340 · nicht gefunden | kein Leser | – |
| Hülle (Länge 3,84–4,93, Breite 1,81–1,92) | m | `huelle` :3467, `gestaltMass` :4937 | gelaende-kollision.js:1296; `_fahrUmriss` koerper-bewegung.js:278 → sv:646 | folgt |
| Arten: PRESETS 5, EPOCHE_GESETZ 6 Stufen | – | :4566, :4771 | `VERKEHR.wagen` kompakt_fwd · limousine · suv (sv:2249) | gesetzt |
| Kern-Fahrer `fahrerLinie` (Pure Pursuit, rein) | – | :4152–4169 | nur `worlds/garage/garage.js:585` | – |

Der Fahr-Schritt des Kerns (`fahrSchritt` = `fahrKraefte` + `fahrStand`) läuft in Node ohne THREE: 1,42 µs je Schritt bei
1/60 s (Kompakt), 4 Rezepte × 3 600 Schritte zweimal byte-gleich. Die Lage hängt an der dt-Folge (Leiter k = 8: 0,66 m nach
10 s), und die Leiter des Verkehrs hängt am Auge (sv:1449–1456): der Weg eines Wagens ist heute f(Same, t,
Kamera-Geschichte). Wechsel Kante → Physik: aus (Lage, Tangente, v, Krümmung κ) plus der stationären Umkehr der
Reifenkurve gesetzt, fährt der Wagen nach 3 s 3 mm (Kreis 10 m/s) bis 0,22 m (Kreis 1,9 m/s) neben dem Original; heute nullt
jede Setzung im Verkehr das Tempo (`VERKEHR_STEHT`, sv:915/975/1007). Zwei Fahrer für eine Domäne: der Stamm-Fahrer
`_fahrerLinie`/`_fahrerSchritt` (kf:1873, 1954, Stanley) neben dem Kern-Fahrer (vc:4169).

## (c) Die Bewohner

| Größe | Einheit | Anker | Leser | folgt/gesetzt |
|---|---|---|---|---|
| Köpfe je Haus `leuteVon` (1–12, aus Wohnfläche) | Person | fwc:9526–9538 | sb:779, 839 | folgt aus dem Haus |
| Haushalt `{personen, wohl}` | – | fwc:2174, 2221, 2246 | nur Labor (worlds/fachwerk/fachwerk.js:629); jeder Welt-Ruf übergibt `null` (fwc:4381 ff.) | Eingang fehlt in der Welt |
| Person-Same „plan.seed:si:k“, Genom (sex, kh, alter 0,05–0,5) | – | sb:848, 890; stamm/koerper-leib.js:36–55 | sv:354; sb:921 | folgt aus (Plan, Slot, k); keine Kinder |
| Heim, Tür | u32, m | sb:888; sb:762–777, 842 | sb:1018, 1716 | folgt aus dem Slot |
| Liste `S.liste` (~70 Felder je Person) | Objekt | sb:458 `*_bewohnerListe`, sb:887–899, 2003 | Takt sb:1554 ff. | **Sack** je Siedlung im Nah-Ring; Stände hängen an der Reihe der Liste (sb:466, 547) |
| `TAGES_GESETZ` (wach 6,5 · werk [8, 17] · streuH ±0,5 · fahrer [7, 19] · nachtfahrer versatzH 12) | h | kc:5126–5219 (fahrer :5153–5160) | kc:5222, 5328 | gesetzt |
| `tagesOrte(plan, steht)` · `tagesBindung(TC, same, rolle, heimI, orte, ohne)` · `tagesPlan(same, rolle, stunde, orte, nass)` | – | kc:5240, 5269, 5326 (Hash `_tagZahl` kc:5227) | sb:2222–2225 | **Funktion** (19 200 von 19 200 Rufen bit-gleich, 1,42 µs) — `ohne` ist Wirt-Zustand |
| Wagen je Stadt `ceil(slots/15)` städtisch | Stück | fwc:4865–4879 `VERKEHR_GESETZ`, `verkehrVon` | sv:33 | gesetzt (`hausJeWagen` 15) |
| Fahrer = Person 0 des Fahrer-Slots, nachts Person 1/Nachbar | Person | sv:349–368 | sv:772–775 | Wirt setzt |
| Fahrt-Ziel | Wende | sv:946–951 `gen.axis("ziel"+zielN++)` | sv:950 | **Würfel mit gehaltenem Zähler**, kein Anlass |
| Sitz-Pose (fest, „Zügel-Geste“), Hüfte auf dem Sitz-Anker | rad, m | kf:513–543 `_applySeatPose`, kf:553–620 `_sitzLage` | sv:811 `_verkehrSitz` | gesetzt |
| Hand am Lenkrad | – | nicht gefunden (`lenkrad` im Stamm: 0 Leser) | – | fehlt |

Menge heute: stadt-voll 295 Häuser, 1 092 Bewohner (spec/profiband/haushalt.json:322), 20 Wagen (3,7 % der Köpfe fahren),
das Dorf 0 Wagen. Wer kein Fahrer ist, fährt nie; es gibt keinen Akt „Fahrt“ im Tag. Die Vision: Adresse → Haushalt →
Raumprogramm → Fläche (vision/bau/entwurf-mensch-nutzung.md:13–19, `haushalt(adr)` :100; entscheid.md:179 Köpfe =
2 + kinder[klasse] + Σ gesinde) — Wagen-Besitz steht dort nicht, und die Richtung ist Plan (entscheid.md:61–63).

## (d) Was heute fährt — Urteil

| Ding | datei:zeile | Urteil |
|---|---|---|
| Wagenzahl `verkehrVon` | fwc:4867–4879, sv:2324–2338 | Gesetz — die Zahl folgt künftig aus dem Haushalt |
| Plan-Netz `verkehrsNetz` (Strecken, Kreuzungen, Wenden) | fwc:4899–5251 | Gesetz als Geometrie; für die Netz-Stadt ohne Fahrt über Kacheln: Attrappe |
| gehaltene Liste `S.verkehr.wagen`, `_verkehrAnlegen` | sv:27–441 (Liste sv:34–42) | Zwilling (der Sack) |
| `_tickVerkehr`, `_verkehrSchritt` (Belegung, Leiter, Kappe 12) | sv:749 (dt:1704), sv:1425 (dt:1174) | Zwilling — O(n), 0,866 ms je Sim-Schritt um 10 Uhr |
| `_verkehrBelegung` (16-m-Raster), `_verkehrFolge`, `_verkehrUmfahren`, `_verkehrZonen` (+ `_verkehrReihe`, `_verkehrKreis`) | sv:1560, 1576, 1828, 1886, 2343, 2357 | Zwilling — Agenten suchen einander |
| `_verkehrVorrang` (Fußgänger fragt jeden Wagen) | sv:533 (sb:2830) | Zwilling — O(Leiber × Wagen) |
| `_verkehrAnkunft`, `_verkehrSprung` | sv:882, sv:1041 | Zwilling — der Ort ist kein f(t) |
| `_verkehrZielNeu`, `_verkehrHeim`, `_verkehrParken` | sv:938–1004 | Attrappe — Ziel ohne Anlass |
| `_verkehrImRaster` | sv:2119 (sb:1670) | Zwilling — alle Wagen statt der am Schirm |
| Route (`_verkehrZuege`, `_verkehrWegZu` Dijkstra-Memo) | sv:1095–1258 | Gesetz (Weg im Graphen) |
| Spur-Fragen, Trassen-Boden | sv:454–492, sv:2047–2102 | Gesetz (Geometrie) |
| Stellen und Bild (`_verkehrWagenStellen` … `_verkehrGleit`), Sitz, Einsteigen | sv:619–719, 811, 853 | Leser — folgen, wenn sie Ort(t) lesen |
| `_wagenSchritt` (vc `fahrKraefte`) | kf:1575 | Gesetz |
| Stamm-Fahrer `_fahrerLinie`, `_fahrerSchritt`, `FAHRER` | kf:1873, 1954, 3053 | Zwilling von vc `fahrerLinie` (vc:4152–4194) |
| `fahrerSetzen` (Autopilot des Spielers) | kf:1866 | Testrahmen (nur Linsen) |
| Spielerwagen (`_rittSchritt`, `fahrKraefte`) | kf:1629; koerper-bewegung.js:1571 | Gesetz |
| Rennstrecke `bahnNormal` | gelaende-core.js:200–322 | für die Welt Attrappe (nur Garage, die Prüfplatz-Strecke ist nicht in main) |
| Demo-Wagen, Pfad-Folger | grep `pfadFolg`, `demo`: leer | gibt es nicht |
| Messbühne Stadt-Gipfel | spec/profiband/haushalt.json `stadt` :283, `stadt-voll` :321 (Anker 836,09 / 438,24, „dorf 7 300“), `hochhaus-dach` :366, `gipfel-blick` :386 | kein eigenes Fahren; das Band fährt dieselben `S.verkehr`-Wagen |

**Die Stationen** (Register im Zweig `koordination`, `meisterkarte-quelle/punkte/`): `pflicht.json` C →
[`pflicht.C#1`, `pflicht.C#2`]; C#1 headless (`stationen/g5.js:6447–6479`, `node scripts/diag-fahr-leben.cjs --verkehr`,
Soll `PFLICHT_C` g5.js:6482 {stunden [10, 23], wagen 20, sek 600, weg60M 30}, Urteil liest die Zeile „VERKEHR {json}“,
Mutanten `pflichtCProben`); C#2 am Gerät (`stationen/g6.js:4030–4047`, `PB_C_BAND`, `PB_C_WAGEN` 20). Beide ungemessen
(stand.json, die Linse hat sich geändert). Die Linse VK: scripts/diag-fahr-leben.cjs:840–960, Selbsttest :2465–2586;
`gate:fahr-leben` (package.json:141), `gate:verkehr-takt` (:142). `karte2.mensch.netz.verkehr` (g5.js:6330–6379) misst nur
den Spielerwagen. Chronik (FUND-Register): 11.11. stadt-voll 63 Ankünfte, längste Fahrt 503 s, Wagen an Wagen 0,21 m;
12.11. Wenden auf dem Torplatz, 20–34 m je Minute < 30; 13.11. ein Bewohner auf einer Haube; Verkehr 1,24 von ~17 ms CPU.

## Die Vision (Meisterkarte 2) zum Verkehr

Pflicht C liegt auf `mensch.netz.verkehr` S2 (vision/BRUECKE.md:392): 10 Wagen, je ein Bewohner am Steuer, 0 Berührung,
0 Stillstand. S4: 10³ sichtbar, 10⁴ in der Stadt, Fundamentaldiagramm ± 25 %, Stauwelle 15–20 km/h; S5: 10⁵ Wege am Tag mit
Anlass, Spitzenstunde aus Tagesplänen; S6: 10⁷ Fahrzeuge (Tokio-Maß), P = Bildzeit bei 10⁶ ≤ Bildzeit bei 10⁴ + 10 %.
Der Satz, an dem das Gesetz hängt (vision/blatt/15-menge.md:20): „Die Person ist eine reine Funktion p(samen, i, t), und die
Menge ist ihr Integral … mittel ein Fluss-Feld (das Fundamentaldiagramm …), fern eine Dichte-Textur und eine Ganglinie. Alle
drei lesen dieselbe Funktion, sodass ein Mensch, der aus dem Strom tritt, genau der ist, den der Strom gezählt hat.“ Und die
offene Frage der Karte selbst: „ob die Funktion statt der Simulation reicht, entscheidet ein Spike, nicht die Karte.“
Preis der Klasse Stadt (vision/REGELN.md:37): p95 ≤ 34 ms, kein Bild über 101 ms, Ankunft kalt ≤ 5 s, Heap ≤ 600 MB, VRAM
≤ 256 MB; Megastadt (:38): Heap ≤ 1 GB, kein Wachstum mit dem Weg.
