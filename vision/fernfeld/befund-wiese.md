# Befund Wiese — „Größe statt Zahl": Schirm-Gesetz oder Zwilling in Metern?

Stand 14.11.2026 (date: 22:35), gelesen im Lese-Baum `lese-main` = main 68d24688 (V18.546.289). Nur Quelle, keine GPU, keine Welt.
Pfade relativ zu `lese-main`, wo nicht anders genannt. Rechnungen mit node aus den Zahlen der Quelle (Zeilen genannt).
Neu geschrieben über den abgebrochenen Vorgänger (ad2ca5c7, 22:20). Dessen Fehler: die Leib-Zeile nannte `nahM` 8 m / `nahLeiber` 4
als Schalter der Mengen-Stufe — falsch: `nahM`/`nahLeiber` wählen Leib ↔ Satz (Animation, `siedlung-bewohner.js:1618-1631`), die
Mengen-Stufe wählt `LOD_SCHIRM.leib.mengePx` 64 über `_feldGrenzen` (`vegetation-streu.js:1864-1883`). Dazu fehlte ihm, dass ALLE
Stufen-Gesetze den Tele absichtlich NICHT lesen (unten §1.4) und dass der Grund der Wiese den Rest schon in Metern deckt (§1.3).

## 1. Die Formel des Falls

Quelle: `_wieseFern` `stamm/vegetation-wiese.js:577-587`, `_wieseFuss` `:609-615`, Zahlen `NAH_WIESE` `stamm/daten.js:496-522`
(radius R = 10 m, fern.fuss f = 13,8 m, skalaMax 2,5, bis 200, saum 20, auge 1,5). `WIND_ZAHLEN` ist nur die Zahl-Algebra; dieselbe
Rechnung läuft als Zahl (Takt `_wieseFernSchranke` `:645-666`, Tafel `:631-637`, Wand), als TSL (Stoff `_halmFerne`,
`stamm/stoff-material.js:63-115`) und als WGSL (GPU-Wahl, `vegetation-wiese.js:592-602`) — EINE Quelle, drei Algebren.

Eingang Q = dist · (h/S)^(1/3) (Fußabdruck-Abstand; flach Q = dist). **Q enthält weder Zeilen noch Sichtfeld.**

```
Lücke  l(Q) = min(1, R/Q)                      Beer-Lambert längs des Strahls (n·d konstant)
Kappe  k(Q) = (f/Q)^3                          „Büschel je Pixel" ∝ a·Q^3 ≤ f^3 — Pixel als FESTER Raumwinkel gedacht
Anteil a(Q) = min(l, k) · Saum(d)              die ZAHL
Größe  s(Q) = min(skalaMax, sqrt(max(1, l/k))) gleichförmig um den Fuß
```

Schnitte: l = k bei **Q_k = sqrt(f^3/R) = 16,21 m** (`scripts/diag-profiband.cjs:302` rechnet dieselbe Zahl);
s = skalaMax bei **Q_s = 2,5 · Q_k = 40,53 m**.

### 1.1 Die Erhaltungs-Größe

Im Band Q_k … Q_s gelten drei Invarianten zugleich:
1. **Deckung im Blick** D = a · s² / l = 1 (Fläche n·w·h längs des Strahls wie an der Übergabe) — geprüft `diag-profiband.cjs:320`.
2. **Büschel je Raumwinkel** a · (Q/f)³ = 1 (Kappe bindet) — geprüft `:307` (Soll ≤ 2, heute 1,00).
3. **Sichtwinkel des Büschels** s/Q = 1/Q_k = 0,0617 /m konstant — das Büschel steht im Bild gleich groß, egal wie fern.

| Q (m) | 16,2 | 20 | 30 | 40,5 | 50 | 75 | 100 | 150 | 180 |
|---|---|---|---|---|---|---|---|---|---|
| Anteil a | 0,617 | 0,329 | 0,097 | 0,040 | 0,021 | 0,0062 | 0,0026 | 0,0008 | 0,0005 |
| Größe s | 1,00 | 1,23 | 1,85 | 2,50 | 2,50 | 2,50 | 2,50 | 2,50 | 2,50 |
| Deckung D | 1 | 1 | 1 | 1 | 0,66 | 0,29 | 0,16 | 0,07 | 0,05 |

Fällt: die Zahl a ∝ Q⁻³. Steigt: die Größe s ∝ Q. Bleibt: D, Zahl je Raumwinkel, Sichtwinkel. Die Kappe sitzt bei Q_k, weil dort die
Lücke (∝ Q⁻¹) die Raumwinkel-Schranke (∝ Q⁻³) schneidet; f = 13,8 statt 14 nimmt 4 % Zahl, die Größe gleicht aus
(`vegetation-wiese.js:558-561`; Spike 8709ac07: 67 035 → 66 273 Dreiecke).

Jenseits Q_s: **D(Q) = (Q_s/Q)²** exakt (Tafel oben). Die Wand sieht das nicht: sie prüft D ≥ 0,99 nur, solange s < skalaMax
(`diag-profiband.cjs:320` `else if (g.skala < F.skalaMax - 1e-6)`), und der Mutant „Größe ohne Höchstwert" (`:1169`) verbietet genau
das, was D jenseits 40 m hielte (s = Q/Q_k: 100 m 6,2-fach, 180 m 11-fach). `skalaMax` 2,5 trägt in der Quelle keine Zahl als Grund,
nur „die Gestalt bleibt die des Studios" (`vegetation-wiese.js:569-571`).

### 1.2 Meter oder Schirm? — METER (genauer: fester Raumwinkel)

Die Kappe heißt „Büschel je Pixel", rechnet aber Büschel je Meter³ des Fußabdrucks: ein Pixel ist (dist · p)² mit
p = 2·tan(fov/2)/zeilen. Das wahre Pixel-Gesetz wäre a ≤ (f/Q)³ · (p_ref/p)². Die Quelle trägt p nirgends — `_wieseFern` und
`_wieseFuss` lesen weder `_schirm()` noch `_brennweite` (`vegetation-wiese.js:577-615`). Die Eichung f = 13,8 m ist „je Pixel nie mehr
als vor w28-wiese-schale" (`:558-561`) — relativ zum alten Gesetz, nicht zu einem Pixel. Folge (gerechnet):

| Schirm | Pixel je Meter Abstand | Pixel bei 40 m · 75 m · 100 m |
|---|---|---|
| 1080 Zeilen, fov 75° (Spiel, `KAM_FOV_GRAD`, `koerper-fahrt.js:3146`) | 1,42 mm | 5,7 · 10,7 · 14,2 cm |
| 360 Zeilen, fov 75° (Werkbank ohne `--echt`, `werkbank.cjs:523`) | 4,26 mm | 17,1 · 32,0 · 42,6 cm |
| 1080 Zeilen, fov 20° (die Probe wiese-fov20) | 0,33 mm | 1,3 · 2,4 · 3,3 cm |

Unter fov 20° fallen je Pixel (tan 37,5°/tan 10°)² = **18,9-mal weniger Büschel** als am Ruhe-Schirm — dieselbe mittlere Deckung D,
aber nicht mehr gemittelt, sondern als einzelne Körper mit Grund dazwischen.

Das EINZIGE Glied am Schirm ist der Ein-Pixel-Halm: jede Halm-Ecke rückt bis zum halben Pixel an ihrem Abstand
(`stoff-material.js:96-100`, `_halmFernePixel` = 1/(pxJeM · Szenen-Skala), `vegetation-wiese.js:1196-1199`; pxJeM aus `cam.fov` und
dem Zeichenpuffer, `stamm/bild-kosten.js:3571`). Das liest den WAHREN Schirm, auch den Tele — und es ist eine versteckte
Deckungs-Quelle, die das Gesetz nicht zählt: D = a·s²/l rechnet mit der Halm-Breite des Studios, bei 75 m ist der Halm aber 10,7 cm
breit (1 px) statt der Studio-Breite (Blatt-Breite nicht gelesen; `HALM_GESETZ.aderM` 0,7 mm je Ader, `phyto-core.js:6554`).

### 1.3 Der benannte Rest „50–100 m lockerer unter dem Tele" — erklärt

Drei Glieder, alle aus der Quelle:
1. **D = (40,5/Q)²** jenseits Q_s — der Rest besteht an JEDEM Schirm (50 m 0,66 · 75 m 0,29 · 100 m 0,16). Gemessen in der Abgabe
   0b303b08 (Radeon, ABAB 3 × 3): Boden-Anteil 80–200 m Kandidat 48,9 % (40–80 m 2,3 %, main 87,4 %).
2. **Der Ein-Pixel-Halm verdeckt den Rest am Ruhe-Schirm**: bei 75 m wird jeder ferne Halm auf 10,7 cm gespreizt — unter fov 20° nur
   auf 2,4 cm (4,4-mal schmaler). Am normalen Schirm füllt der Pixel-Boden die fehlende Deckung zum Teil, unter dem Tele nicht.
3. **Der Grund trägt den Rest als Ton — in Metern**: der Boden-Stoff mischt jenseits der Übergabe das Mittel des Halms
   (`terrain:wiesenTintMittel`, `daten.js:560-568`) ÷ halmSchatten ein, über radius/2 … radius ein und über 0,4 … 0,8 × bis
   (80 … 160 m) zurück zum Bestand (`stoff-material.js:3188-3212`). Die Blende liest `_camW` in Metern, nicht D(Q). Unter dem Tele
   bleibt der Grund also grün getönt, aber flach — Ton ohne Silhouette.

Ein Meter-Gesetz kennt kein Tele: JA, das erklärt ihn — und zwar nicht allein der Wiese wegen. **Kein Stufen-Gesetz des Spiels liest den
Tele**: `_brennweite` rechnet mit `KAM_FOV_GRAD` 75 (`vegetation-streu.js:2982-2986`), „Tempo und Fernglas legen keine Stufe um"
(`vegetation-streu.js:2959`, `:1848`), auch nicht das Sichtfeld, das der Spieler wählt (`state.zugang.fov` 60–100°, `koerper-fahrt.js:3146`).
Was Pixel-Wahrheit liest, ist nur, was im Stoff aus der Ableitung kommt: der Ein-Pixel-Halm und `steinTonMittel` (`fwidth`, §2).

Die Probe-Linse (Fund B): `_schirmMessen` läuft je Takt (`dirigent-takt.js:107`); ruht die Welt beim Schuss, trägt `_halmFernePixel` den
360-Zeilen-Schirm → ferne Halme 3-fach breit im 1080-Bild, die Ferne liest dichter als im Spiel. Ob die Bildpaare der Abgabe
(`artifacts/profiband/auge/w28-wiese-deckung/`) ohne `--echt` liefen: aus Log und Abnahme nicht entscheidbar (`[linse-gpu]` druckt
beide Rezepte, `werkbank.cjs:478`; die Abnahme nennt nur die Leinwand 1920 × 1080).

## 2. Das WAS der groben Stufe — je Klasse

Das Schirm-Gesetz (LOD_SCHIRM) wählt WANN. Was die Stufe ZEIGT, ist die zweite Frage. **„fehler" in LOD_SCHIRM ist gemessen** — der
Kanten-Versatz (Chamfer der SILHOUETTEN in Bildpunkten, `scripts/lib/kronen-linse.cjs:29`) jeder Stufe zur L0, an der Grenze
nachgemessen von gate:haus-fern P (`scripts/diag-haus-fern.cjs:12-16`, in `npm run check`, `package.json:19`) — aber als eingefrorene
Tafel (`vegetation-streu.js:2880-2950`), und er misst NUR den Umriss: Ton, Relief, Normale der Stufe gehen in keine Zahl ein
(barock L1 0, grabstein 0). Für Baum und Leib gibt es keine Zeile: `tree: je({})`, `menge`/`tier` ohne Tafel (`:2892`, `_wechselGesetz` `:2970-2979`).

| Klasse | WANN (Datei:Zeile) | WIE die grobe Stufe entsteht · was sie erbt | Integral oder Hand | Lücke |
|---|---|---|---|---|
| **Wiese** | `_wieseFern` in Metern/Raumwinkel (§1.2) | dieselben Büschel der Nähe (L2 des Studios), Zahl ↓ Größe ↑ (`vegetation-wiese.js:713-750`, `:577-587`); Ton jenseits: Grund × `wiesenTintMittel` (Erwartungswert von `wiesenTint`, `daten.js:560-568`) | Zahl und Größe: Gesetz (Integral der Deckung bis 40,5 m). Grund-Blende: Hand (Meter 5–10 / 80–160, `stoff-material.js:3203`) | D = (40,5/Q)² jenseits Q_s; kein Pixel im Gesetz; Ein-Pixel-Halm deckt ungezählt; Grund-Blende kennt D nicht |
| **Krone / Karten-Stufe** | Haushalt d0/d1 in Bäumen der Referenz-Höhe (`_stufenSchirm` `vegetation-streu.js:1922-1945`, `_wechselHaushalt` `:2990-2998`) — Winkel, ohne Zeilen | Karte aus der servierten **L1** gebacken (`stamm/stoff-karte.js:425-431`), nicht aus der L0; Stamm der Karte = BHD der L0 (93864c40) | Integral (gerendert aus einer wahren Gestalt) — aber der L1 | Kanten-Versatz mit L1-Quelle Eiche 4,67 · Birke 5,08 · Weide 12,06 · Fichte 3,23 px (mit L0 3,54 · 3,74 · 9,97 · 2,82, `stoff-karte.js:428-430`), Soll 1 px; Wechsel nicht am Pixel (keine Tafel-Zeile) |
| **Kamm-Krone** (Gelände-Ferne) | mit dem Anker des Rings | Umriss je Baum DESSELBEN Bestands, aber als Ellipse/Kegel mit Radius T des Plans, Ton = Studio-Laubfarbe × Selbstbeschattung × Saison (`stamm/gelaende-fern.js:533-540`) | Hand-Primitiv auf Gesetz-Zahlen (Bestand, Höhe, Ton echt; Gestalt nicht) | Silhouette nicht aus der Krone gerendert |
| **Leib (Mensch der Menge)** | `_feldGrenzen`: 1,8 m × Brennweite / 64 px, gedeckelt ANALOG_NAH_M 64 m (`vegetation-streu.js:1864-1883`, `kreatur-leben.js:3406`) — 1080 Zeilen: 19,8 m (GTX-Messung der LAGE) | Stufe 2 = EIN SDF-Guss des ganzen Leibs (`foundry-core.js:7125` `__mengenLeib`), 1 700 Dreiecke, Kleider-Farbe im Stoff (`koerper-core.js:50-55`); Feld-Ton = Mittel der Ton-Tafel je Kapsel (`stamm/koerper-leib.js:1896-1910`) | Integral (aus der Gestalt gegossen, Ton gemittelt) | `mengePx` 64 ist von Hand: kein gemessener Fehler der Menge-Stufe zur L0 (keine Tafel-Zeile) — wie viel Umriss bei 64 px fehlt, misst niemand; Sprung 40 000 → 1 700 Dreiecke (`koerper-core.js:48,55`). Leib ↔ Satz (`nahM` 8 m, `nahLeiber` 4, `siedlung-bewohner.js:3583-3585`) ist Animations-Haushalt, Meter + Kopfzahl |
| **Haus** | gemessener Fehler je Vorlage × Brennweite / px (`_wechselGesetz` `vegetation-streu.js:2970-2979`) — der Schirm-Fall | L2 = `lod2Koerper`: die Massen des Baus nach Rang bis zur Budget-Zeile (`fachwerk-core.js:2637-2656`, 3060); Wand-Ton = `wandTonAus`, flächengewichtete Farbe der Vertikalflächen der Stufe 1 (`:2163`, gesetzt `:3249`, gelesen `_wandFaktor` `:2623-2629`); Fenster = `fensterFern` aus derselben Fenster-Liste, mit Kreuz der L0, 14–16 Dreiecke je Fenster (`:2462-2473`) | Integral für Ton und Fenster-Takt; Silhouette aus denselben Massen | Ton = Vertex-Farbe, nicht das beleuchtete Relief (keine Mittel-Normale); bei Putz-Stilen hat schon die L0 kein Relief zu vererben (`fachwerk-core.js:196`); Fehler misst nur Umriss |
| **Dach / Mauer / Stein** | im Stoff je Pixel (`fwidth`) | `porta:steinTonMittel`: je Achse Spanne des Pixels in Steinen, unter einem Stein sein Ton, über die Fuge nach Deckung gemischt, n Steine → Streuung × 1/√n (`porta-core.js:316-347` im Zweig `origin/w28-stoff-fuge`); Leser `stoff-material.js:2885-2900` dort, Spanne `T.fwidth(x)` (`:2845` dort) | **Integral am wahren Pixel** — das reinste Schirm-Gesetz im Spiel, Tele inklusive | NICHT in main (`merge-base --is-ancestor` geprüft, 22:33). Normale nur als E[k²] der Kuppe (½ bzw. ⅓), keine Mittel-Normale je Pixel |
| **Boden** | Mikro-Relief: drei schirm-gebundene Oktaven, fract-Blende (`stoff-material.js:2663-2676`, Vorgänger-Lesung, nicht neu geprüft) | feste Oktaven (Klumpen, Kiesel) in Welt-Frequenz (`:2670-2671`) | Teil Integral, Teil fest | feste Oktaven nicht pixel-gemittelt — Kandidat Boden-Rauschen im Dorf, nicht gemessen |
| **Gelände-Ring** | Schalen in Metern 800 / 3000 / 8000, Snap 6 / 24 / 64 m, 192 Winkel, geometrische Reihen (`gelaende-fern.js:2117-2126`, `:991-996`) | Höhe auf dem VOLLEN Gesetz an der Naht (`:1400-1403`) | Gesetz (Abtastung), Raster in Metern/Winkel | 192 Spalten: 1,875° je Spalte = 33,5 px an 1920 Breite (hfov 107,5°, gerechnet) — fest, unabhängig von Zeilen; Kosten des Rings nicht gelesen |

## 3. Kosten des Falls

- Abgabe 0b303b08 / 7ccf6200 (Radeon, Mess-Wiese Ego, ABAB 3 × 3): Ferne **Lf 65 948–66 146 → 64 312–64 373 Dreiecke** (main
  Lf 80 599 + Schale 28 041); GPU je Bild 28,8 → 32,2 ms (+3,4 gegen den Kandidaten, main 44,7–53,7); Spitze `_tickNahWiese` ≤ 1,7 ms
  (main 2,6). Instanzen-Zahl der Ferne steht in keinem Commit (nur Dreiecke).
- Das Gesetz davor mit 1,67 × Kappe: Lf 80 731 + Schale 28 041 = 91 450 Dreiecke, GPU +1,1 bis +4,9 ms (`vegetation-wiese.js:562-563`).
- **Hängt an Raumwinkel, nicht an der Welt, nicht am Pixel** (gerechnet): Büschel im Ring ∝ ρ · 2πQ · a(Q);
  N ∝ 2πρ [R(Q_k − R) + f³(1/Q_k − 1/180)] = 2πρ [62 + 148], der Rest jenseits 180 m nur 2πρ · 14,6 — das Integral konvergiert,
  `bis` könnte wachsen, die Weite der Welt kostet fast nichts. Aber N hängt weder an Zeilen noch an fov: 360, 1080 und 2160 Zeilen
  zahlen dieselben Büschel; nur die Füllrate (s² bis 6,25 je Büschel) wächst mit dem Pixel — gemessen ist sie nirgends.
- Der Preis der Größe am Pop: gate:pop 0,0207 % (Kandidat ohne Größe) → **0,0487 %** Pop-Pixel/s (Abgabe 0b303b08: „größere ferne
  Büschel tragen mehr Pixel beim Sinken") — das ist genau die Zahl, die als lod.K2#1 Radeon offen steht.

## 4. Zufall der Klasse und Gesetz — fünf Sätze

Zufall der Wiese ist, dass ihr Element gleichförmig wachsen darf, ohne dass das Auge die Größe als Lüge liest — bei Leib, Haus und Krone
ist Größe Identität, dort darf nur Zahl oder Detail fallen. Gesetz ist die Invariante des Bands 16–40 m: gleiche Deckung, gleiche Zahl
je Raumwinkel, gleicher Sichtwinkel des Elements — so kostet die Ferne ein konvergentes Integral, unabhängig von der Weite der Welt.
Zufall (und Fehler) ist, dass sie in Metern geeicht ist (f = 13,8 m, skalaMax 2,5, Grund-Blende 80–160 m), was nur hält, solange
Zeilen und Sichtfeld fest sind; das Gesetz liest den Pixel p = 2·tan(fov/2)/zeilen — und das fehlt heute ALLEN Stufen-Gesetzen beim
Tele, nur die Stoff-Ableitungen (Ein-Pixel-Halm, `steinTonMittel`) sehen ihn. Gesetz ist, dass die Erhaltung am Ende des
Größen-Spielraums in den TON unter dem Pixel übergehen muss — Grund × D · Halm-Mittel statt Meter-Blende, wie `steinTonMittel` es
für Steine aus dem Integral rechnet. Gesetz ist schließlich, dass „fehler" heute nur den Umriss misst: die grobe Stufe jeder Klasse
braucht dieselbe Messung für Ton und Normale (Haus `wandTonAus` ist Vertex-Farbe, Menge `mengePx` 64 ohne Messung), sonst wählt das
Schirm-Gesetz das WANN richtig und zeigt das WAS falsch.

## Ehrlich offen

- Nicht gemessen: ein wahres Tele-Bild (1080 Zeilen, `--echt`), Anteil von Glied 1 ↔ 2 in §1.3, Füllrate der Ferne, Instanzen-Zahl.
- Nicht entscheidbar aus Artefakten: ob die Bildpaare von w28-wiese-schale in der 360-Zeilen-Welt entstanden.
- Nicht gelesen: Blatt-Breite des Halms im Studio, Kosten des Gelände-Rings, Boden-Oktaven neu (Zeilen vom Vorgänger übernommen),
  der Grund für `mengePx` 64.
