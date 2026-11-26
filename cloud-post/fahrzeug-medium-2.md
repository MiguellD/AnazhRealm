# fahrzeug-medium-2 — Stand-Blatt (ZWISCHENSTAND)

Sprosse: `karte2.mensch.fahrzeug.medium#2`, der Rest aus dem „Offen“ von fahrzeug-medium (Post 05:58, Vorrang 2): (1) `flug`,
(2) `rinne_sichtbar`, (3) die Kurvengrenze je Saat. Dazu die nächste rote Sprosse derselben Familie aus demselben Gesetz (der
Fahr-Kern, Koordinator 11:22): `karte2.mensch.fahrzeug.form#2` — die Kippgrenze ± 15 % gegen die statische Formel an 50 Bauplänen. Gemessen auf main c0634d86 + `fahrzeug-medium-ruf` 15630bf4 (5e332ef); jetzt
aufgesetzt auf `fahrzeug-stapel` 445b4549 (main c814741e, im Bündel `buendel-mittag`) — der Kopf folgt auf dem main, der den Stapel trägt.

## Täter (vorher, am Kern und in der Welt)

- **flug** — `vehicle-core.js` `fahrStand`: das Rad verlor den Griff 2 cm unter der Fallkurve (`luftEps`), nie erst jenseits seines
  Federwegs. Fiel die Ebene unter die Fallkurve, ersetzte die Steig-Rate des Bodens (`vBoden`) je Schritt den Fall; jenseits von 2 cm
  hieß der Wagen `luft`, griff nicht, und landete. Über einer Bodenwelle von 3 cm auf 4 m bei 100 km/h hing er so 80–100 von 180
  Bildern in der Luft (je Gattung), am Genesis-Ort flogen 78 von 120 Bremsungen aus 100 km/h, **60 davon ohne Kuppe** (der Boden
  fiel nie weiter als 0,2 m unter den Wagen). Abgelehnt nach Messung: die Steig-Rate aus dem Pfad der Ebene statt der Sekante der
  Achsen (bodenStoss rms 7 → 17–19 m/s², mehr Luft) — die Ebene hat Knicke, die Sekante über den Radstand glättet sie.
- **Stand-Flattern** (Folge desselben Täters): der GT steht im nassen Gras am Dorf-Ufer; sein Einsinken (4,33 cm, radImBoden) legt
  die Ebene 4,33 cm tiefer, der Spalt 4,33 cm > 2 cm hieß `luft`, in der Luft sinkt kein Rad, die Ebene stieg, er landete — je Bild
  im Wechsel (5 von 12 Bildern in der Luft, einsinken 4,33 / 0 cm).
- **Kurvengrenze** — ungemessen (die Station trug sie als `ungemessen`).
- **rinne_sichtbar** — `_fahrRad` (stamm/koerper-fahrt.js) trat das Rad wie einen Fuß: je Rad und Zelle ein Tritt in das EINE Feld
  (`_tritt`), Vorder- und Hinterrad in einer Spur — 10 Durchfahrten = 20 Tritte; die Wege-Karte malt eine Zelle erst ab der Stufe
  des Pfads (`_trittStufe` 6/8, 27,7 Tritte), der Stoff unter dem Fuß wird erst dort Erde (`_kontaktStoffAt`, Pfad ≥ 0,5). Eine
  Spur von zehn Wagen blieb unsichtbar (B-k am Kopf ohne den Schnitt: gemalt 0 von 24 Zellen, je Zelle 20 Tritte), sichtbar erst
  nach 14 Durchfahrten — ein Wanderer malt nach 28 Schritten. Die Quelle sagt das Gegenteil: Weaver & Dale 1978 (J. Appl. Ecol.
  15:451–457; USDA SDTDC 0423-1201, Kap. 3) — 200 Durchgänge eines Motorrads nahmen auf der Bergwiese (Montana) 9× so viel Bewuchs wie
  200 eines Wanderers.

## Geschnitten

- **`vehicle-core.js` `fahrStand`**: zwischen Aufbau und Boden federt das Rad. Fällt die Ebene unter die Fallkurve, fällt der Aufbau
  frei; jedes Rad folgt seinem Boden um seinen Federweg (`auf.hub` = radHub × radR × k, derselbe, um den es in `fahrEbene` einzeln
  zu seinem Boden federt) und den Reifen (`luftEps`) — erst darüber verliert es den Griff. Im Spalt trägt der Aufbau seine
  Vertikale (`liegt`: kein Ersatz durch die Rate des Bodens), er landet auf den Federn (bodenStoss → Hub-Feder, `hubBoden`).
  Nur wo die Ebene TRÄGT (`fahrEbene` → `traegt`): auf einer Kante liegt der Bauch am Rand, die Räder hängen darüber, der Griff
  endet am Reifen wie zuvor. Ohne diese Grenze ritt der GT am Kern 5 Bilder mit 40° Bug-unten auf der Kante, und in der Welt kroch
  er 330 Bilder an der Klippe, statt abzuheben (gate:fahr-leben S4 ROT: „Flug 0 Takte … 24,2 m längs der Bahn, Kante bei 24,0 m“).
- **`stamm/siedlung-instanz.js` `_archRadMatrix`**: das gezeichnete Rad steht so tief im weichen Boden, wie das Gesetz es sinken
  lässt (`fz.einsinken`, dieselbe Tiefe, um die die Ebene der Sim liegt), geklemmt auf den Federweg.
- **`stamm/siedlung-wege.js` — das Rad tritt mit dem Gewicht der Quelle**: `TRITT.rad` = 4,5 (9× des Wanderers je Durchgang, zwei
  Räder in einer Spur); `_tritt(…, last)` zählt die Last des Schritts (der Fuß 1, das Rad `TRITT.rad`), `_trittDurchfahrten` liest
  die Durchfahrten (Tritte ÷ `TRITT.rad`) — der EINE Leser der Rinne in `_fahrRad` und in der Station. Die Rinne eines reinen
  Wagen-Wegs bleibt die des Kerns (z_k = z₁ (1 + 0,283 ln k), k = die Räder vor diesem), ein Fuß zählt ihr ein 4,5-tel. Folge: nach
  einer Durchfahrt 9 Tritte (Stufe 2/8, nichts gemalt), nach vier 36 (6/8, die Spur ist Pfad und Erde). `spec/stamm/modul-karte.json`
  trägt `_trittDurchfahrten` (stamm-umzug --nach-karte 0 Abweichungen); `scripts/lib/fahr-proben.cjs` nennt im Kommentar die 9
  Tritte einer Probe (unter dem Pfad, jede Probe setzt ihre Spur zurück).
- **Die Linse B-k** in `gate:vehicle-drive` (`spurVerdict`): der gestellte GT fährt zehnmal dieselben 12 m weichen, trockenen Bodens
  um den Spieler durch den Schreib-Akt der Welt (`_fahrRad`), gelesen an den Zellen beider Spuren (Wege-Karte `_pfadFeldAt`, Stoff
  unter dem Fuß, Tritte, die Rinne bei 6 m). Soll: eine Durchfahrt malt nichts, zehn malen jede Zelle und sie ist Erde, die Rinne
  wächst. Selbsttest: gesund schweigt, unsichtbar · eine malt · keine Erde · Rinne steht · kein Ort → je ROT beim Namen. **ROT am
  Gesetz ohne den Schnitt** (`rad` 1): „die Spur von 10 Durchfahrten bleibt unsichtbar (gemalt 0 von 24 Zellen, je Zelle 20 Tritte,
  der Pfad ab 27,7) — das Rad tritt wie ein Fuß (`_fahrRad` → `_tritt`, `TRITT.rad`)“. Konsum-Leser: `_fahrRad`, die Wege-Karte
  (`_wegeKarteMale`), `_kontaktStoffAt` (Leib, Schritt-Klang).
- **Die Linse A10** in `gate:vehicle-drive` (Fahrzeug-Familie, `scripts/diag-vehicle-drive.cjs` `flugMessung`/`flugVerdict`): je
  Gattung mit 100 km/h am Kern die Welle 0,03 m / 4 m (Soll 0 Bilder in der Luft), die Kuppe einer Rampe 25 % bei 90 km/h (Soll:
  er springt) und eine Kante von 6 m bei 15 m/s (Soll 0 Bilder am Boden, wo die Ebene nicht trägt; er fliegt). Selbsttest: gesund
  schweigt, die Welle von main (GT 84 Bilder), eine Rampe ohne Sprung, der Griff auf der Kante (GT 5 Bilder), eine Kante ohne Flug,
  3 Gattungen → je ROT beim Namen. **ROT am Kern der Basis**: „gt hebt über der Welle ab (84 von 180 Bildern in der Luft, Federweg
  0.204 m) · supersport 100 · limousine 82 · kompakt_fwd 98 · suv 81 · transporter 80“; **ROT am Federweg ohne `traegt`**: „gt greift
  auf der Kante 6 m (5 Bilder am Boden, wo die Ebene nicht trägt — vehicle-core.js fahrStand …)“, je Gattung 5. Konsum-Leser:
  `fahrStand` des Kerns, gefahren von `_wagenSchritt`.
- **Der Stations-Kandidat** `cloud-post/fahrzeug-medium-2-station/` (k2-mensch-fahrzeug.js, Diff gegen punkte-maschine 0ba33033,
  BEGRUENDUNG.txt; der Kandidat von fahrzeug-medium bleibt byte-alt) — die Station urteilt die WELT:
  - `flattert` (geurteilt, Soll 0): Welt-Fahrten 100 → 0, die abheben, ohne dass der Boden je weiter als den Federweg unter den
    Wagen fiel; Täter beim Namen (`vehicle-core.js fahrStand`). Am Kern der Basis ROT: „60 Welt-Fahrten heben ohne Kuppe ab“.
  - `imKreis` (geurteilt, Soll 1): die Kurvengrenze — derselbe Wagen im Kreis auf dem Prüfstand der Saat (Lenkung in 6 s auf
    vollen Einschlag, 20 m/s), die Spitze a_quer gegen μ·g (μ = `_fahrHaft` × maxGrip · grip), Band 0,95–1,01.
  - `imWelt` (gemessen): der Weg am Boden × (μ + f_r) des Schritts, die Höhe gutgeschrieben (½v² = g·Σ(μ + f_r)·Δs + g·Δh), im Band
    30–50 m — am Kern auf Steigungen ±15 % und ±30 % 39,0–40,4 m gegen 38,6 m eben.
  - `sicht` (geurteilt, Soll 1; die Karte: „Spurrinne nach 10 Durchfahrten sichtbar“): `SPUR_SICHT` fährt den gt des Kerns zehnmal
    dieselben 12 m weichen Bodens um den Spieler durch den Schreib-Akt der Welt (`_fahrRad` → `_tritt`) und liest an den Zellen
    beider Spuren den Anteil, den die Wege-Karte als Pfad malt (`_pfadFeldAt` ≥ ½ — die Bytes des Boden-Shaders), nach einer und
    nach zehn Durchfahrten; danach kehren das Feld der Tritte und die Karte zurück (der Kasten der Spur malt neu, `rest` = 0).
    Täter beim Namen: „die Spur von 10 Durchfahrten bleibt unsichtbar (… `_fahrRad` → `_tritt`, `TRITT.rad`)“. Dazu fiel ein Rot im
    Selbsttest des Kandidaten selbst: die ATTRAPPE „der Boden bleibt glatt“ trug `imKreis` nicht und nannte darum die Kurvengrenze
    statt der Rinne (5 400 Mutanten, 1 falsch → 5 402, 0 falsch).
  - `ungemessen: Kurvengrenze` fiel.
  - Die drei Wände: die Liste (`meisterkarte-quelle/punkte/punkte.cjs liste`, Zweig `punkte-maschine`) 1976 Stationen · Fehler 2 = genau `gelaende.K2#1/#2` „Wand HAKEN“ wie an der Basis; S2 misst
    in 4,2–5,0 s je Ort; kein Fächer im Kern (die Station fährt durch die Leser des Spiels in der Seite).

## Gemessen (vorher → nachher, gleiche Bedingungen, headless)

| Zahl | vorher (Basis) | nachher (Kopf) |
|---|---|---|
| A10 Welle 0,03 m / 4 m, 100 km/h: Bilder in der Luft von 180 (GT · Supersport · Limousine · Kompakt · SUV · Transporter) | 84 · 100 · 82 · 98 · 81 · 80 | **0 · 0 · 0 · 0 · 0 · 0** |
| A10 Rampe 25 % bei 90 km/h: Bilder in der Luft | — | 60 · 61 · 58 · 57 · 55 · 55 (er springt) |
| Genesis, 120 Bremsungen 100 → 0: Fahrten mit Flug · Flüge · Bilder in der Luft | 78 · 293 · 2 400 | **18 · 29 · 774** |
| Flug ohne Kuppe (Spalt nie > 0,2 m) Genesis · Dorf · stadt-voll | 60 · 13 · — | **0 · 0 · 0** |
| Fahrten mit Flug Dorf · stadt-voll (echte Kuppen und Klippen: Spalt 0,2–11 m, Gefälle bis 96 %) | 98 · 60 | 92 · 45 |
| Bremsweg der Fahrten, die vorher flatterten (Genesis, 60, Median) | 67,1 m | **62,5 m** |
| bodenStoss rms auf denselben Fahrten ohne Flug (Genesis 42 · Dorf 17, Median) | 5,2 · 6,8 m/s² | 5,1 · 7,6 m/s² |
| Stand im nassen Gras (dorf −857/−1069, GT, 12 Bilder): einsinken / luft | 4,33 ↔ 0 cm, 5 von 12 Bildern in der Luft | **4,33 cm, 0 in der Luft** |
| Die Reifen im Bild gegen das Gesetz (4 Naben, cm unter der Fläche) | −4,33 · −4,33 · −4,33 · −1,1 | **−4,33 · −4,33 · −4,33 · −4,33** |
| Station S2 `flattert` Genesis | 60 (ROT) | **0** |
| Station S2 Kurvengrenze a_quer ÷ μ·g Genesis · Dorf · stadt-voll (μ 0,4–0,8), im Band 0,95–1,01 | ungemessen | **0,992–0,997 · 0,992–0,999 · 0,99–0,999**, 100 % |
| Station S2 `imWelt` Genesis · Dorf · stadt-voll | 97 % · — · — | **100 %** · 49 % · 85 % |
| Station S2 Prüfstand 100 → 0 · 50 → 0 im Band (alle Orte) | 100 % · 100 % | 100 % · 100 % (38,14–45,26 m) |
| Station S2 `sicht` Genesis · Dorf · Wiese (24 Zellen je Ort): gemalt nach 1 · nach 10 Durchfahrten · Erde · Tritte je Zelle · `rest` | `TRITT.rad` 1: 0 · **0** · 0 · 20 · 0 — ROT „die Spur von 10 Durchfahrten bleibt unsichtbar“ | 0 · **100 %** · 100 % · 90 · 0 an allen drei Orten |
| Selbsttest k2-mensch mit dem Kandidaten · die Liste der Stationen (Zweig `punkte-maschine`) | 5 400 Mutanten, 1 falsch · Fehler 2 | **5 402, 0 falsch** · Fehler 2 (`gelaende.K2#1/#2` wie an der Basis) |
| A10 Kante 6 m bei 15 m/s: Bilder am Boden, wo die Ebene nicht trägt (je Gattung) · in der Luft | 0 · 65 | **0 · 65** (Federweg ohne `traegt`: 5) |
| fahr-leben S4 Klippe (Kante 5,94 m auf 3 m): abgehoben nach · Flug-Höhe beim Absteigen | 87 Bilder · 5,99 m | **86 Bilder · 5,93 m** (Federweg ohne `traegt`: nie, 420 Bilder) |
| fahr-leben S2 Klippe: Luft-Schritte · größter Sprung je Schritt | 56/531 · 0,19 m | 54/531 · 0,19 m |
| Stadt stadt-voll 10 Uhr, 21 Wagen, die ersten 30 s: Bilder ohne Griff (Kuppen 2–2,7 cm) · Bilder im Spalt | 22 (6 Wagen) · 1 724 | **0** · 1 238 |
| gate:fahr-leben VK 10 Uhr (600 s): Warte-Kreis · Ankünfte | keiner · ✅ | **8>9 ab Sekunde 30** · 9 (ROT, siehe Offen); auf dem Stapel (main c814741e) derselbe Kreis 8>9, 570 s |
| `gate:vehicle-drive` auf dem Stapel (main c814741e) | — | GRÜN in 2 min 13 s (A10 Welle 0 · Rampe 60 · Kante 0; B-j frei 12,64 mm gegen W / kz 12,63 mm) |
| B-k die Spur (Genesis −11,4 / −29,2, 24 Zellen): gemalt nach 1 · nach 10 Durchfahrten · Erde nach 10 · Tritte je Zelle 1 → 10 | 0 · **0** · 0 · 2 → 20 | 0 · **24** · 24 · 9 → 90 |
| B-k die Rinne bei 6 m nach 1 → 10 Durchfahrten (trocken) | 0,17 → 0,28 cm | 0,17 → 0,28 cm (derselbe Kern, `_trittDurchfahrten`) |
| Der Blick von oben auf die Bytes, die der Boden-Shader liest (`_wegeBelagAt`, Wiese über `_bodenSichtAt`; 18 × 5 m, 0,05 m je Pixel, null-Renderer): Pixel Erde ≥ ½ vor der Fahrt · nach 1 · nach 10 Durchfahrten | 0 · 0 · **0** | 0 · 0 · **12 654** (zwei Spuren, je ≈ 1,0 m breit und 15,8 m lang) |
| Auf dem Stapel mit dem Rad-Tritt: `gate:vehicle-drive` · voller Playtest · `gate:persistence` · `gate:fahr-leben` | — | GRÜN 2 min 9 s · 3 710 ✅ 0 ❌ (3 min 9 s, neben fahr-leben) · GRÜN · ROT allein an VK 10 Uhr, dieselbe Zeile (8>9, 570 s) wie ohne den Rad-Tritt |
- **form#2 DIE KIPPGRENZE** (Täter-Zahl zuerst, am Kern 6c1c3d1: 7 von 16 Bauplänen mit μ > SSF — die sieben Gattungen und ihr hoher
  Bauplan — rutschten mit 0,76–1,0 g durch den Kreis und erst bei tan θ = μ vom Kipptisch; kein Bauplan kippte: der Kern trug nur
  die Längs-Lastverlagerung, der Wank war eine Feder mit Anschlag 0,12 rad):
  - `vehicle-core.js` fahrGesetz trägt `kipp` (fahrKippForm: die halbe Spur w, die Schwerpunkthöhe h, SSF = w ÷ h — NHTSA Static
    Stability Factor, 68 FR 59250 / 49 CFR 575.105; das Moment um die Radlinie I ÷ m = ((2w)² + (2h)²)/12 + w² + h², Heydinger
    1999 SAE 1999-01-1336: I_xx ÷ m ≈ 0,25–0,35 m² um den Schwerpunkt; die Flanke rutscht mit μ 0,35, Fricke 1990).
    fahrKipp dreht den Aufbau um die äußere Radlinie, angetrieben von der Querkraft der Reifen je Masse (Fy ÷ m; unter Schritttempo
    die Bahn v · ω und der gehaltene Hangabtrieb, dieselbe Blende wie die Gier) gegen g_N am Hebel der Radlinie; über π/2 liegt er
    (`umgekippt`) und rutscht auf der Flanke aus. Die sechs Straßen-Rezepte (SSF 1,16–1,93 über μ ≤ 1) bleiben byte-gleich: fahrKipp
    kehrt vor dem ersten Abheben zurück. Die erste Fassung trieb den Kipp mit der Bahn v · ω − aG: in der Welt kippten die Kipper an
    der Mess-Wiese bei 0,69–0,95 · SSF · g Reifenkraft (die Bahn liegt im Einlenken über der Kraft der Reifen) — geschnitten auf Fy.
  - `stamm/koerper-fahrt.js` `_wagenLage` (der EINE Schreiber der Pose) legt den gekippten Aufbau um die Radlinie
    (`_wagenKippLage`: die Stütze ist die Radlinie oder die Flanke, die höhere trägt) — Höhe, Querversatz `_rideKippX/Z` und Rolle;
    beide Zeichen-Pfade lesen ihn (`_rittMeshPose`, `stamm/siedlung-bauten.js _archEntryWorldMatrix`). Der liegende Turm-Bauplan:
    linke Flanke 1,15 m, rechte −0,02 bis +0,02 m über dem Boden (vorher −0,15 m im Boden, die Flanken-Stütze schloss es).
  - Linse A11 in `gate:vehicle-drive` (kippMessung/kippVerdict): je Gattung und ihr hoher Bauplan (Dach × 1,6, Fahrhöhe × 3,
    Spur × 0,8) der Kipptisch (Stufe 0,025, halbiert auf 1/64) und der Kreis 20 m/s; Soll: μ > SSF kippt bei tan θ und bei
    a_quer = SSF · g (± 15 %) und liegt; μ < SSF rutscht; der Kreis urteilt, wer das Tempo hält. ROT am Kern ohne den Schnitt:
    „6 von 6 Bauplänen mit μ > SSF kippen nie (… — vehicle-core.js fahrTakt: keine Quer-Lastverlagerung, der Aufbau dreht nie um
    die äußere Radlinie)“; Selbsttest 6 Fälle.
  - Der Stations-Kandidat trägt form S2 (Seite `KIPP`, Maße kippQ ± 15 % · liegt ≥ 1 · steht ≥ 1, `erwartet: "nicht"` fällt):
    63 Baupläne aus dem Stempel der Welt (sieben Gattungen an Land × neun Hebel der Werkstatt), ihr Fahr-Satz aus der Welt
    (`_fahrSatz`), der Kipptisch am Satz und der Kreis in der Welt (`_wagenSchritt` · `_wagenLage` an der Mess-Wiese). Täter beim
    Namen „vehicle-core.js fahrTakt: … kippen nie“. Selbsttest 5 408 Mutanten, 0 falsch (der Kern von main + drei ATTRAPPEN).

Wände am Kopf: siehe „Kopf“.
| A11 Kipptisch tan θ ÷ SSF (gt · limousine · kompakt · suv · transporter hoch · karren · karren hoch) | rutscht bei tan 1,00 (μ), kein Kipp | **1,00 · 1,00 · 1,00 · 1,01 · 1,01 · 1,00 · 1,02** |
| A11 Kreis 20 m/s: Reifenkraft vor dem Abheben ÷ SSF · g · liegt auf der Seite (die fünf hohen Straßen-Baupläne) | 1,05–1,10 g gerutscht, 0 liegen | **1,00 · 0,99 · 1,00 · 1,00 · 1,00, 5 von 5 liegen** |
| Station form S2 an der Mess-Wiese, 63 Baupläne: Kipper am Tisch · tan θ ÷ SSF | 25 · 0 kippen (ROT, kippQ 0) | **25 · 25 kippen, 1,001–1,034** |
| Station form S2: im Kreis liegend · Reifenkraft ÷ SSF · g · Rutscher, die kippen | 0 (liegt 0) · — · 0 von 65 | **9 · 0,962–1,013 · 0 von 65** |
| Die sechs Straßen-Rezepte (SSF 1,16–1,93) | — | byte-gleich: fahrKipp kehrt vor dem Abheben zurück |
| Mit dem Kipp (37d51e7 + Modul-Karte): `gate:vehicle-drive` · voller Playtest · `gate:persistence` · `gate:fahr-leben` · `check:statik` | — | GRÜN (A11 GRÜN, Selbsttest GRÜN) · 3 710 ✅, alle Invarianten · 21/21 · nur VK 10 Uhr Warte-Kreis 8>9 (siehe Offen) · GRÜN |

## Offen (Grund, Messname)

- **gate:fahr-leben VK 10 Uhr ROT an diesem Kopf** (an der Basis 5e332ef GRÜN, um 23 Uhr GRÜN) — mein Rot; sein Schnitt liegt im
  Verkehrs-Gesetz `stamm/siedlung-verkehr.js`, das dieser Zweig nicht anfasst (Bahn knoten-grossstadt). Im Bogen vor der Wende
  746/573 stehen Wagen 8 (Gier 172°, Strecke 37,8 von 177,8 m) und Wagen 9 (Gier −38°, in seiner Wende 163,1 von 243,9 m) ab
  Sekunde 30 bis Sekunde 600 Bug an Bug: 8 hält `durch` (der Erste im Kreis aus Wagen-Kanten, `_verkehrKreisDurch`), doch eine Ecke
  von 9 liegt in seinem Leib samt Ausscheren (`_verkehrFolge`: Lücke 1,58 m, quer 1,84 m); 9 wartet auf 8; beide stehen mit
  Handbremse, ruhig (kein Spalt, die Ebene trägt), keiner setzt zurück — dahinter 14 von 21 Wagen ohne Ziel, 9 Ankünfte, eine
  Fahrt 668 s > 300 s. Der Kern legt die Lage frei: an der Basis verloren in den ersten 30 s sechs Stadt-Wagen 22 Bilder den Griff
  über Kuppen von 2–2,7 cm (Wagen 9 allein 7), am Kopf keiner; Wagen 9 steht dadurch bei Sekunde 30 0,93 m tiefer im Bogen —
  dieselbe Begegnung, die tages-gesetz 2 für ein Eindringen von 0,04–0,10 m in den Raum der Begegnung löste (Kopf 99b234d7), trifft
  jetzt den Leib. Die Basis mit `luftEps` 1 cm oder 3 cm bleibt ohne Kreis (16 · 15 Ankünfte in 120 s): die Lage hängt am Griff, nicht
  am Rauschen. Was fehlt, ist eine Regel des Verkehrs: der Bogen vor der Wende trägt zwei Entgegenkommende nur, wenn einer vor ihm
  wartet (ein Ort für den Bogen) oder der Zweite im Kreis zurücksetzt. Messname: VK 10 Uhr Warte-Kreis 8>9.
- **(2) `rinne_sichtbar` — halb**: die Farbe fiel (die Spur von zehn Durchfahrten ist Pfad und Erde, 24 von 24 Zellen, siehe B-k; die Station urteilt sie: `sicht` 100 % an Genesis · Dorf · Wiese);
  die TIEFE im Netz steht offen. Die Rinne steht im Gesetz, in der Station und im gezeichneten Reifen; das Gelände-Netz senkt sich
  nicht um sie: der Höhen-Leser `_voxelSurfaceY` (stamm/gelaende-chunks.js) liest das Dichtefeld im Schritt 1,2 m, das Netz der
  Stufe 0 trägt 1,8 m — eine Rinne von 0,5 m Zelle und 0,3 cm (trocken) bis 5–9 cm (nass) trägt es nicht ohne einen Leser der
  Zelle im Netz. Messname: `rinne_tiefe_im_netz` (die Fläche über der Spur nach 10 Durchfahrten am feuchten Ufer, dorf, gegen z₁₀).
  Das Bild im echten Frame urteilt der Messplatz: lokal verliert swiftshader das Gerät vor dem ersten Weltbild (`diag-blick`, „WebGPU
  Device Lost“), am reinen main c814741e ebenso; gesehen ist die Spur in den Bytes der Wege-Karte (Gemessen). Messname: `rinne_sichtbar` Bild.
- **`imWelt` am Dorf 49 %, an stadt-voll 85 %**: gemessen, nicht geurteilt. Aus dem Band fallen (a) Fahrten mit echtem Flug — die
  Landung nach 5–11 m Fall frisst die Höhe, die das Maß gutschreibt (stadt-voll Saat 12, 20; Dorf die Klippen bis 96 % Gefälle,
  `imWelt` bis −24 m), (b) Fahrten quer zum Hang ohne Flug (stadt-voll Saat 2, 10, 13, 18: 50–66 m — der Reibkreis trägt die
  Querlage, die Bremse bekommt weniger). Messname: `imWelt` je Ort.
- **`gate:koerper-stand` K8 streu wiese p95 3,3 cm** (Soll ≤ 3) — nicht dieser Baum: am reinen main c814741e steht dieselbe Fichte der
  Streu (`fscatter:fichte:3:1`, −345,1 / −1021,5, Stufe 0) 3,3 cm unter dem gezeichneten Boden, schon im Stand vor jedem Gang; `--k8`
  allein ist am reinen main ROT mit derselben Zahl (n 100, p95 3,3), der volle Lauf kippt mit der Reihenfolge (main voll 0,8, der Stapel
  voll 3,3). Dazu am reinen main 4 rote Zeilen (K7 Aufbau 403 Büschel, 35 Pflanzen, zwei blinde Selbsttests). Täter laut Linse
  `_streuFuss` (stamm/vegetation-streu.js), nicht die Fahrt. Messname: K8 streu wiese.
- **`gate:weltbild-frost:echt` „dritte-person: B das Bild folgt der Kamera — 0,00 % der Blöcke“** (Messplatz, GTX 1060/1050) — nicht
  dieser Baum: ROT an jedem Kopf auf main ab 12029279, auch an einem Kopf ohne eine Datei der Fahrzeuge (werk-am-ort cfa4fc95), am
  Bündel buendel-mittag 52c07c4a dieselbe Zeile; GRÜN an a954d698 und älter. Messname: weltbild-frost dritte-person B.
- **form#2 die Hülle des liegenden Wagens**: der Kontakt des Schritts (`_fahrHuelleStellen`, stamm/koerper-bewegung.js) stellt die
  Hülle mit Nick und Wank der Federn, nicht mit dem Kipp — ein liegender Wagen stößt an Bauten mit dem Grundriss des stehenden
  (die Zeichnung liegt richtig). Messname: `kipp_huelle`.
- **form#2 kein Aufrichten**: ein gekippter Wagen bleibt liegen (`umgekippt`); kein Verb, kein Gesetz richtet ihn auf (die
  Straßen-Rezepte kippen nie, nur Werkstatt-Baupläne mit SSF < μ). Messname: `kipp_aufrichten`.
- **form#2 das Bild des liegenden Wagens**: gemessen an der Matrix, die beide Zeichen-Pfade lesen (die Flanken über dem Boden), nicht
  im echten Frame — lokal verliert swiftshader das Gerät vor dem ersten Weltbild (wie bei der Rinne). Messname: `kipp` Bild.
- bodenStoss misst jetzt die Landung aus dem Spalt (vorher 0 bei jeder Landung): auf den vorher flatternden Fahrten Genesis rms
  9,3 → 12,9 m/s². Die Landung aus echtem Flug (`luft`) trägt bodenStoss weiter 0 (die Hub-Feder nimmt sie). Messname: bodenStoss
  der Landung.

## Kopf

- Kopf: folgt (Vorprüfung fahrzeug-medium-2 1).
- Beanspruchte Sprossen: `karte2.mensch.fahrzeug.medium#2`, `karte2.mensch.fahrzeug.form#2`.
- Karte 2 gebucht 126 von 1 718 · Status ZWISCHENSTAND.
