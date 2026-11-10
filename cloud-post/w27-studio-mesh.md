ABGABE d77c2744 (Zweig w27-studio-mesh, main 900c28e gemischt — dc29205f steht in main seit V18.546.243) · Probe-Ruf: gate:studio-uebergabe, gate:wasser-leben:bild, bild:wiese@0.5 · Station: w27-studio-mesh-pm d8ee61f (die Differenz je Seh-Klasse; davor 4846d77, c0d7963)

## 10.11. 08:54 — GPU-PROBE 972a2bcf auf radeon-890m: ROT in 367 s (gate:garage-labor ROT 105 s auf radeon-890m · gate:studio-uebergabe GRÜN 49 s auf radeon-890m · bild:wiese@0.5 GRÜN 53 s auf radeon-890m) → probe-post/w27-studio-mesh/972a2bcf.md

## 10.11. 02:57 — GPU-PROBE dc29205f auf radeon-890m: GRÜN in 525 s (gate:studio-uebergabe GRÜN 63 s auf radeon-890m · gate:wasser-leben:bild GRÜN 42 s auf radeon-890m · bild:wiese@0.5 GRÜN 71 s auf radeon-890m) → probe-post/w27-studio-mesh/dc29205f.md

## 10.11. 01:59 — GPU-PROBE da9919e3 auf radeon-890m: ROT in 480 s (gate:studio-huelle ROT 152 s auf radeon-890m · gate:wasser-leben:bild GRÜN 32 s auf radeon-890m · bild:wiese@0.5 GRÜN 52 s auf radeon-890m) → probe-post/w27-studio-mesh/da9919e3.md

## 10.11. 08:40 — Neuer Anlauf studios.K4 (Arbeiter w27-studio-mesh) — ZWISCHENSTAND, studios.K4 bleibt 0/7

Anlass: dc29205f ist gelandet (V18.546.243), K4 stand weiter bei 0/7 — der Schöpfer verlangte einen neuen Anlauf. Gemessen wurde lokal
(swiftshader, kienspan, 960 × 540) mit der Station als Bibliothek; neu ist die Zerlegung je Seh-Klasse (Station `d8ee61f`, unten).

**Die Zerlegung (garage an der Prüfbühne, 22,3 %):** Glas 11,6 · Lack (metall) 9,7 · Glut 0,5 · Stoff 0,4 Punkte. schmiede 20,0 %: die Klinge (metall) 19,1.
**Was die Differenz trägt, gemessen:**
- **Messort:** derselbe Lauf am Ort neben der Grundstellung der Wiese 28,3 % → Prüfbühne 22,0 % (Lack 16,0 → 9,5 Punkte): Bäume und Gras im Spiegel
  der Welt (das Spiegel-Feld trägt die Kronen als grüne 2-m-Blöcke in der Scheibe), die Bühne hat kein Feld. Die Probe misst also auch den Ort.
- **Glas = das Bloom der Welt:** die durchsichtige Scheibe der Welt ist heller als ihre beiden Schichten (65,4 Luma; opakes Glas 30,6, Innenraum ohne
  Glas 32,6). Mit `bloomStrength` 0 fällt sie auf 30,8 (Bühne 25,3), garage 22,3 → 18,7 %, schmiede 18,2 % (mit Bloom 20–58 % je Lauf: die Klinge
  glitzert in der Welt, 70,7 gegen 52,3 Luma — die Bühne zeichnet ohne Bloom). Nicht ortsgleich gemessen (die Probe setzt je Lauf 16 m weiter).
- **Die Bloom-Schwelle der Welt** urteilt die Szene VOR der Belichtung (0,86 ≈ 0,44 im Bild bei Belichtung 0,51; der Kommentar will „nicht der
  diffuse Himmel“). Ortsgleich (K4_P fest, Wiese) ohne Wirkung: 16,81 % alt gegen 16,84 % belichtet — nicht geliefert.
- **Die Kamera der Welt in der Bühne** (dasselbe Bloom als EIN Knoten in welt-licht.js, die Bühne zeichnet durch eine Pipeline): gebaut, lokal NICHT
  sauber messbar (die Rücklesung der WebGPU-Bühne über ein Render-Ziel wartet asynchron, die Bühne zeichnete zweimal aus ihrer Labor-Kamera hinein) —
  nicht geliefert; der Versuch liegt als Diff vor (193 Zeilen), er braucht eine Messung auf echter GPU.

**Geliefert (Spiel):** EIN Recht der Welt an den Stoffen der Bühne. Das Wurf-Recht (`teilWirft`: Fell-Schale, Glut und Durchsichtiges werfen nie) und
die Durchsicht (`durchsicht`: transparent, Deckkraft, beide Seiten in EINEM Zug) stehen im Licht-Baustein; die Welt liest sie (`_teilWirft`,
studio-stoff), gate:regler-wirkt liest sie, und `buehneZeichnet` wendet beide in jedem Bild an jedem Mesh jeder Bühne an — bis hier warf die Bühne mit
Scheibe und Lichtern und zog ihr Glas in zwei Zügen. Wirkung auf K4: KEINE messbare (die Scheibe der Bühne 28,3 Luma vorher wie nachher) — eine Wahrheit
der Bühne, kein Punkt. **Geliefert (Station `d8ee61f`):** die Differenz je Seh-Klasse in Ausgabe und Zeile („glas s/a · metall s/a …“), damit die Farm auf
echter GPU den Stoff nennt, der springt.

**Probe 972a2bcf (Radeon):** gate:studio-uebergabe GRÜN, bild:wiese@0.5 GRÜN (gegen dc29205f mittlere |Δ| 0,04 Luma — die Welt unverändert), gate:garage-labor in
sich GRÜN, doch auf swiftshader (die Linse wählt ihren Adapter selbst) — die Probe urteilt das ROT; neu abgegeben als d77c2744 mit Proben, die auf der Karte urteilen.

**Ehrlich offen (mit Messnamen):**
- **studios.K4 Kamera der Bühne:** die Bühne zeigt ohne die Foto-Kette der Welt (Bloom, zeitliche Auflösung); Glas und Klinge springen am Bloom. M.
- **studios.K4 Messort:** der Ort der vorigen Probe; die Prüfbühne senkt die garage um 6 Punkte, die Fahrt-Wand trägt keinen Welt-Wechsel. Entscheid Koordinator.
- **studios.K4 Spiegel der Umgebung:** der Lack der Welt spiegelt Boden und Gras des Orts (Flanke, Felge, Schweller), die Bühne den Boden der Atmosphäre
  (`ATMO_BODEN`); die Welt misst ihren Boden je Bild (`_rueckstrahlLeser().boden`), die Bühne könnte ihn mit dem Himmel erhalten (`enter.himmel`). M.
- Die fünf r128-Studios (portale, fachwerk, terrain, koerperstudio, tetrapoda), je L — unverändert.
- FUND (fremd, wie zuvor): `selbsttest --ohne 3c` an main ab fbbeb318 ROT „log is not defined“ (lod.K3#1 OHNE GERÄT).

## 10.11. 03:00 — Antwort auf Post 02:30 (Arbeiter w27-studio-mesh): `gate:studio-huelle` ist an main ROT — weder Last noch mein Schnitt

**Linse oder Spiel, mit Zahl: keins von beiden aus diesem Zweig — das Rot steht an main, strukturell.**
- **An main gemessen (eure Roh-Ausgabe, kein neuer Lauf nötig):** `meisterkarte-quelle/punkte/messung/roh/78d37554-radeon/studios.K3_2.out`
  (derselbe `gang`, `?bank=12`, Radeon, main 78d37554) trägt für JEDE Mesh-Zeile Stempel gegen Bank weit außerhalb ±5 %:
  garage L0 0,2262 ↔ 8,1546 (CPU je Bild 4,13) · L1 0,199 ↔ 3,93 · schmiede L0 0,0236 ↔ 0,7667 · portale L0 0,2126 ↔ 3,34 · L1 0,3429 ↔ 2,72 ·
  L2 0,027 ↔ 0,97 · L3 0,0196 ↔ 0,25 · fachwerk L0 0,1012 ↔ 0,2617 · L1 0,0354 ↔ 0,1304 · L2 0,017 ↔ 0,1363 · L3 0,0129 ↔ 0,0975;
  H7 dort fachwerk Neubau 1976 ms. Dieselben zehn Schluss-Zeilen wie an meinem Kopf standen am 08.11. auf beiden Geräten
  (heim2-w16-studio-welt 02a61693 Radeon, 2ec2e4b3 / 69818525 GTX). Faktor 3 bis 36, nicht 5 %: das ist keine Last.
- **Byte-Beweis:** `worlds/huelle/huelle.js` (Bank, `zeileUrteil`) und die Linse sind zwischen 78d37554 und 20a01782 im Urteil unberührt
  (einziger Diff: `zeiger`, w27-zeiger); koerperstudio · tetrapoda · terrain laden keine der zehn Dateien meines Schnitts
  (`git diff --stat fbbeb318 da9919e3` gegen die `<script src>` ihrer Seiten). Die Zähl-Regeln der Linse (H3 · H4 · H6 · H8 △/Befehle/VRAM ·
  H9 · H10) sind am Kopf GRÜN (`diag-studio-huelle --engine` swiftshader, Code-Check 42731532372 GRÜN).
- **Die Wurzel (FUND, nicht geheilt — Klasse studios.K3#2, Größe M–L):** `worlds/huelle/huelle.js:1063–1090` misst die Bank als Wanduhr über
  n Bilder des Zähl-Abschnitts (Ziel 1 × 1, nur Vertex-Arbeit: GPU 0,01–0,34 ms), `:1123` nennt sie „GPU-gebunden“, sobald sie über
  1,15 × der JS-CPU liegt. Die Wanduhr trägt aber die CPU des GPU-Prozesses (Dawn/ANGLE, Treiber, das Warten: r128 liest ein Pixel zurück),
  die `cpuJeFrame` nie sieht — der Abschnitt ist auf keinem Gerät GPU-gebunden, die Bank ist eine OBERE SCHRANKE des Stempels, nie seine
  Gegenzahl. Dazu die Auflösung: die Bank-Werte sind Vielfache von 0,1 ms / 12 (0,0833 · 0,1 · 0,125 · 0,4417 …), eine Summe von 1,0 ms trägt
  ± 10 %. Die GTX stempelt dieselben Zeilen mit 0–0,002 ms.
  Ein Gesetz statt der Uhr, das die Gegenzahl ehrlich hält, wäre eine GPU-gebundene Bank (das Werk K-fach instanziert im selben Pass, die Steigung
  Stempel je Instanz gegen Wanduhr je Instanz) — das ändert, was die Leiste als „GPU-ms“ zeigt, und braucht die Karte am Tisch. Die Schranke
  allein (0 < Stempel ≤ Bank) ließe jede Unter-Meldung durch: damit rechne ich die Station nicht grün.
- **H7 ist kein Uhr-Rauschen:** koerperstudio p95 Neubau 1181 · 1521 (Radeon) · 1977 · 2076 ms (GTX), fachwerk 1976 ms (Radeon, 78d37554)
  gegen 1000 ms — der Neubau dieser zwei r128-Studios ist langsam (FUND, studios.K2#2, je Studio M).
- **FUND (Apparat, S):** `.github/workflows/gpu-probe.yml` schneidet jede Probe auf `tail -n 10` — an einem Gate mit mehr als zehn roten Zeilen
  liest jeder (ich um 02:00, ihr um 02:30) nur den Schwanz als „die Täter“. Die Zeile „N rote Zeilen, gezeigt die letzten 10“ fehlt.

**Am Kopf dc29205f GRÜN (swiftshader):** `npm run check` · `playtest:fast` 21/0 · `gate:welt-boot` · `gate:studio-uebergabe` · `gate:betriebsgesetz` (Wachstum Prüf +0 / Spiel +1334).

**GPU-Probe dc29205f GRÜN (Radeon 890M, 525 s, probe-post/w27-studio-mesh/dc29205f.md) · Code-Check 42738406421 GRÜN:** `gate:studio-uebergabe` GRÜN 63 s
(der lebende Avatar gießt neu, Spawn-Faktor 1,4644, Snapshot und Restore), `gate:wasser-leben:bild` GRÜN 42 s, `bild:wiese@0.5` ABNAHME GRÜN
(Luma 57 · σ 32,9, Stand 18.546.241) — das Bild angesehen: Wolken am Himmel, kein Sprenkel, wie da9919e3.

**Was ich deshalb tue:** `gate:studio-huelle` war die falsche Probe für diesen Schnitt (sie urteilt K3#2/K2#2, die an main rot stehen).
Die neue Abgabe ruft, was MEINEN Schnitt auf der Karte urteilt: `gate:studio-uebergabe` (die benannte Wand: der EINE Kanal in der Welt),
`gate:wasser-leben:bild` (der Spiegel-Pass mit `invVPr`) und `bild:wiese@0.5` (der Himmel der Welt). Ehrlich offen bleibt die BÜHNE auf echter
GPU: kein npm-Gate zeigt sie ohne Zeit-Urteil (`gate:garage-labor` G10 ist auf swiftshader geeicht), ihr Bild liefert erst die K4-Probe der Farm
(Messname studios.K4#2, `/bild` der Bühne).

## 10.11. 01:55 — Abgabe w27-studio-mesh (Arbeiter w27-studio-mesh) — ZWISCHENSTAND, studios.K4 bleibt 0/7

**Was ein Mesh-Studio erfüllen muss** (k4-bild.cjs, g4.js `k4Zahl`): die Bühne nennt über ihren Knopf ein Werk des Vertrags; die Welt nimmt es
über den EINEN Kanal, setzt es als Bau (kein Verb „praegung“/„wesen“) und trägt es als Instanz der Familie `f:` in der Stufe am Auge der Pose;
das Welt-Bild besteht seine Abnahme; über der Vereinigung beider Gestalten differieren ≤ 2,1 % der Pixel (nur eine Seite oder ΔLuma > 18); die
Albedo-Zeilen des Studios liegen im Rand 0,10.

**Warum 0 von 7 — sieben Studios, fünf Täter:**
| Studio | Radeon da0e790f | Täter beim Namen |
|---|---|---|
| garage | 23,5 % | Gestalt deckt 99,6 %. Die Welt spiegelt in Lack und Scheibe ihren Himmel MIT Wolken über den Spiegel-Pass, und dessen Normale rauschte (unten); die Bühne trug einen Himmel ohne Wolken und keinen Spiegel |
| schmiede | 24,4 % | wie garage (Klinge, Parier, Griff spiegeln), dazu 2,6 % nur aus dem Raster der Station (sRGB-Leinwand, Schwelle 127) |
| portale | kein Bild | die Abnahme der Welt nannte die eigene Membran des Tors Verdecker („verdeckt von portal-membran in 18.98 m“) |
| fachwerk | kein Bild | das Haus zeichnet der Bau-Satz; die Abnahme fand seinen Eigner nie und nannte die kleinste fremde Hülle („fern-ring in 27.09 m“) |
| terrain | 99,8 % | Maßstab: die Bühne zeigt die Vorlage, die Welt setzt sie × placement.scale × 0,82 (Baum 3,3–4,0-fach); dazu L1 an der Pose, r128, eigenes Licht |
| koerperstudio · tetrapoda | ungemessen | die Station misst Prägung und Wesen nicht (kein gesetzter Bau) |

**Geschnitten (Spiel, da9919e3):**
1. **Der Spiegel der Welt rechnet um das Auge** (stamm/bild-sicht.js:859 `invVPr`, dirigent-kern.js): der Pass rechnete die Nachbar-Punkte der Tiefe in
   Welt-Koordinaten zurück — 32-Bit-Auslöschung, wächst mit dem Abstand vom Ursprung (Prüfbühne, 400 m: ~3 mm Lage auf 5 mm Texel). Die Normale
   sprang 2–3° je Texel, der Lack sprenkelte. Das ist der Hauptteil der 23,5 % und ein Fehler der Welt an JEDEM Glas, Lack und Metall.
2. **EIN Himmel mit Wolken** (welt-licht.js:864 · 883 `wolkenFeld` · `wolkenMenge` · `himmelSicht` · `himmelTafel`, wörtlich aus bild-himmel.js, der
   Stamm ruft sie): die Bühne der Studios trägt ihn als Grund und als Spiegel ihrer glatten Stoffe (`BuehnenUmgebung`, Gewicht `GLANZ_RAUHEIT` wie die
   Welt); ihr Zustand { ort, zeit, zug, deckung, gier } reist beim Betreten (stamm/netz-portal.js:488 `enter.himmel` → `himmelSetzen`, garage + schmiede).
3. **Die Abnahme zählt Membran und Satz-Zelle zum Ziel** (scripts/lib/kamera-nah.cjs:66 · 303), dazu ein Wurf ohne Blatt-Atlas (Prüfbühne nach dem Laden).
   Decke bezahlt in derselben Datei (scripts 0 Atome).

**Gemessen** (swiftshader · kienspan · Prüfbühne · 960 × 540, die Station lokal nachgebaut; die Bühne über ein Render-Ziel gelesen, weil Linux/swiftshader
die WebGPU-Leinwand nicht in ein 2D-Canvas liest):
- Der Nachbau trifft die Farm: portale „verdeckt von portal-membran in 18.98 m … 23.01 m“, fachwerk „fern-ring in 27.05 m … 32.17 m“ — dieselben Zahlen.
- portale kein Bild → Differenz 96,0 % (Gestalt deckt 95,7 %, Welt L2 ohne Sockel) · fachwerk kein Bild → 94,8 % (Gestalt deckt 99,2 %, Welt L2 ohne Gefache).
- Spiegel-Ziel, eine Zeile über das Dach des GT: 0,18 · 1,15 · 0,71 · 0,30 · 0,17 · 0,45 · 0,26 · 1,19 → 0,18 · 0,18 · 0,18 · 0,19 · 0,20 · 0,21 · 0,25 · 0,30.
- Der Himmel der Bühne zeigt dieselbe Wolken-Formation wie die Kuppel der Welt (gleiche Richtung, gleicher Zustand; Bild im Scratch, nicht im Zweig).
- **garage: Bühne von main 16,4 % → 15,0–20,3 % je Lauf (der Ort wandert), A/B am selben Welt-Bild 14,9 → 15,0 %. Lokal KEINE Senkung der Zahl.**
  schmiede 17,7–19,8 % (davon 5,0 % nur eine Seite). Rest lokal: kienspan zeichnet die Welt ohne Schatten (Innenraum hell), Felgen spiegeln Gras
  statt Platte, Halme vor dem Werk, Wolken-Flecken um einige Grad versetzt (Schattier-Normale gegen Tiefen-Normale).
- check, playtest:fast 21/0, welt-boot, studio-uebergabe, post-kette, ego-schatten, kamera-laub, wasser-leben:bild, studio-huelle --engine: GRÜN am Kopf (swiftshader).

**Echte GPU:** studios.K4 ist eine Sitzungs-Probe ohne npm-Gate — der Ruf `[gpu-probe: …]` kann sie nicht fahren. Am Kopf rufe ich
`gate:studio-huelle` (die Bühne unter dem neuen Himmel), `gate:wasser-leben:bild` (der geänderte Pass) und `bild:wiese@0.5`. Die K4-Zahl misst die Farm.

**GPU-Probe da9919e3 (Radeon 890M, 480 s, probe-post/w27-studio-mesh/da9919e3.md):** `gate:wasser-leben:bild` GRÜN (32 s, der Pass mit `invVPr`);
`bild:wiese@0.5` ABNAHME GRÜN (Luma 57,2 · σ 33,2, Wolken am Himmel, kein Sprenkel). `gate:studio-huelle` ROT — geerbt, siehe die Antwort oben.
KORREKTUR (10.11. 03:00): mein Satz „keine Zeile für garage · schmiede · portale · fachwerk“ war falsch gelesen — der Probe-Bericht trägt nur
die LETZTEN zehn Zeilen des Gates (`gpu-probe.yml`: `grep … | tail -n 10`), die Zeilen der ersten Studios schneidet er ab.

**Station (w27-studio-mesh-pm):** der Wirt reicht den Himmel des Schusses (`enter.himmel` samt Gier des Eintrags), `fuss: "false"`, K4_PFAD + welt-licht.js ·
kamera-nah · abnahme-urteil, halbe Deckung 187 auf sRGB. Selbsttest GRÜN 163/163 am main 78d37554. **FUND fremd:** am main fbbeb318 ist
`selbsttest --ohne 3c` ROT an „lod.K3#1 OHNE GERÄT“ (`log is not defined`) — auch am unberührten punkte-maschine 79c8481, seit z355.

**Ehrlich offen (mit Messnamen):**
- **studios.K4#1/#2 ROT.** Fünf Studios (portale, fachwerk, terrain, koerperstudio, tetrapoda) zeichnen auf r128 mit eigenem Licht (H6-Ratsche): bis
  ihre Bühne die der Welt ist, bleibt ihre Zahl bei 95–100 %. Das sind fünf Umzüge, je Studio L.
- **Messort** (Messname „studios.K4 Messort“): die Probe setzt 16 m neben die Grundstellung (Waldrand an der Mess-Wiese — Bäume im Spiegel, lokal die
  Pose-Kamera im Laub). Neutral ist die Prüfbühne (`umstellen --ort buehne`); das ist ein Welt-Wechsel in der Fahrt, die Fahrt-Wand steht bei 1798/1800 s.
  Dort riss lokal einmal die Abnahme der Klinge auf kahlem Boden (`bild.sigma 3.9 < 4`).
- **Schwelle 187** und die Senkung von garage/schmiede sind NICHT auf echter GPU gemessen.
- FUND: fachwerk-core/porta-core L2 an der Pose (31 m / 23 m, das Werk füllt 0,7 des Bilds) · Haus ohne Gefache, Tor ohne Sockel · die Stufen-Grenze
  misst Kanten-Versatz, nie Farbe oder Teile (`_wechselAbstand`) · lod / studios.K4 · M.
- FUND: worlds/terrain/phytogenesis.js:396 + worlds/huelle/huelle.js `werkMass` · die Bühne zeigt Vorlagen-Einheiten, H10 misst gegen den Kern-Bau
  ohne Welt-Skala (blind) · studios.K4 · M.
- FUND: worlds/garage · die Bühne zeichnet ihren Himmel als Grund nicht (schwarz in jedem Schuss, auch main/Radeon; schmiede zeichnet ihn) · S.
- FUND: der Spiegel der Welt trägt Treffer des Schirms (Gras, Boden, das Werk selbst), die Bühne nur den Himmel · bleibender Unterschied an Felge und Flanke · M.
- FUND: Prägung und Wesen brauchen eine gehaltene Pose auf beiden Seiten, bevor die Station sie messen kann · L.
- material.K4 (Spiegel-Treue an Lack, GTX 87537d3f −0,6581) sollte mit Schnitt 1 steigen — bitte neu messen.

**Die Besten als Maßstab:** kamera-relative Rückrechnung (UE5 Large World Coordinates / „translated world space“, Unity HDRP camera-relative rendering);
EIN Himmel für Editor-Vorschau und Level (UE SkyAtmosphere + Sky Light im Preview-Scene-Profil).

---

# Post an w27-studio-mesh / w27-studio-mesh-pm — Koordinator 10.11. 01:42

- **Abgabe w27-studio-mesh-pm 4846d777 angenommen** (2 Dateien +33/−2, merget sauber in punkte-maschine).
- **Sie landet NACH ihrem Leser:** die Probe reicht `enter.himmel`, main liest es erst mit w27-studio-mesh (heute WIP df89af94, nicht in main).
  Eine Probe, die reicht, was das Spiel nicht liest, lande ich nicht. `pm-nach-main.sh` wartet ohne LLM, bis die ABGABE von w27-studio-mesh
  in main steht, mergt dann die pm-Seite, fährt `selbsttest --ohne 3c` und pusht nur auf SELBSTTEST GRÜN.
- **Dein nächster Schritt:** w27-studio-mesh abgeben (Betreff beginnt mit „Abgabe“), mit `[gpu-probe: …]` für studios.K4 und dem Bild.
  Die zwei ehrlich offenen Punkte (Messort der Probe = Ort der vorigen Probe; Schwelle 127 an der sRGB-Leinwand) gehören in dieselbe Abgabe
  geheilt oder dort mit Messnamen offen. Die Atom-Decke fällt mit z356 (w27-decke-wurzel); danach urteilt die Wachstums-Wand am Zug.
- Stand: main fbbeb318 (z355), Schlange z356 → z357 → z358.

---

# Post an w27-studio-mesh — Koordinator 10.11. 02:30

- **Abgabe da9919e3 gelesen. Sie fährt noch nicht: die GPU-Probe am Kopf ist ROT** (Radeon, Lauf 42731532288, 01:52–01:57).
  `gate:wasser-leben:bild` GRÜN, `bild:wiese@0.5` GRÜN (Ziel frei 10 m, Luma 57,2), **`gate:studio-huelle` ROT nach 152 s:**
  `H8 koerperstudio: L1 GPU-ms 0.0232 ↔ 0.4417` · `L2 0.0122 ↔ 0.2167` · `L3 0.011 ↔ 0.1` · `H7 koerperstudio: p95 Neubau 1521 ms > 1000 ms` ·
  `H8 tetrapoda: L0 GPU-ms 0.152 ↔ 0.4833` · `L1 0.0182 ↔ 0.1333` · `H8 terrain: L0 0.019 ↔ 0.125` · `L1 0.013 ↔ 0.1583` · `L2 0.011 ↔ 0.0833` ·
  `DER GANG: 4 von 11 Seiten ohne fremde Engine · 8 Sitzungen`.
- **Dein Schritt: Linse oder Spiel, mit Zahl.** Die Radeon trug in dem Fenster fremde Last (eine `--offen`-Messung, CI, zwei Champions). H8
  vergleicht hier zwei GPU-Zeiten bei ±5 %, H7 eine Wanduhr: prüfe, ob dieselbe Probe an main 20a01782 dieselben Zeilen wirft (dann ist es
  die Linse, die eine Uhr unter Last urteilt, und die Heilung ist ein Gesetz statt einer Uhr: gezählte Größen, oder die GPU-Zeit aus
  EINER Quelle für Leiste und Messung) oder nur an deinem Kopf (dann ist es dein Schnitt). Heile in deinem Zweig und gib neu ab.
- **Danach fährst du von selbst:** `zug-nie-leer.sh` sammelt ohne LLM jede Abgabe auf w27-*, deren Code-Check und GPU-Probe am Kopf GRÜN
  sind und deren Wand-Summe im Bündel passt (du: Prüf 0 / Spiel +1334, das hilft jedem Linsen-Zweig). Kein Pressen für eine Decke mehr:
  es urteilt die Wachstums-Wand am Zug (`zug/brief-gemein.md`).
- Die Probe-Seite `w27-studio-mesh-pm` c0d79630 wartet weiter auf ihren Leser in main (`pm-nach-main.sh`).
