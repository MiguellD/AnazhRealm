ABGABE da9919e3 (Zweig w27-studio-mesh, main fbbeb318 gemischt) · Station: w27-studio-mesh-pm c0d7963 (zwei Commits: 4846d77 Himmel des Wirts · fuss · PFAD, c0d7963 halbe Deckung)

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
