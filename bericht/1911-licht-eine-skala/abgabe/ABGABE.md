# Abgabe licht-eine-skala, Welle 1 — EINE Skala (GTX 1050, 19.11.)

Kopf **085b9ee10** (Zweig `licht-eine-skala`, gepusht; trägt main **dabd69bb** per Merge 3d5b1807e, Probe-Merge sauber).
Alle Zahlen und Bilder unten an DIESEM Kopf, die main-Seite der Paare an f68dbf09 (dieselbe Kamera, 1920 × 1080).

**Satz:** EINE Skala steht, die Ausgabe ist farbton-treu, der Tag bewegt sich nicht (wiese-mittag 77,68 = 77,71); das Bild an der Quelle ist halb —
Flamme farbig statt weiß, Steinkreis flach, Hof halb. Die Skala gilt für alles außer der Klasse Erscheinung, 9 Mitglieder
(Membran-Zielbild, Filigran, Saum, Scheibe, Rahmen-Glut, Tor-Beschläge, Kreatur-Aura, Platzhalter, Namensschild — das
Namensschild ist der neunte Name, als Berichtigung); Rest ohne Gesetz 1 (Tierauge).

## Stempel (Entwurf — ich stemple nicht)

```
Abgabe licht-eine-skala Welle 1: EINE Skala in Welt-Einheiten, farbton-treue Ausgabe, Saum als Licht [gpu-probe: bild:dorf@0.0] [ci voll]
```

## Soll-Tafel S1–S13 (Kopf ↔ main)

| # | Zeile | Kopf ↔ main | Urteil |
|---|---|---|---|
| S1 | Mittag bildgleich | Mess-Wiese, unteres Drittel 113,62 ↔ 113,80 (ganz 77,68 ↔ 77,71); k 0,5272 | hält |
| S2 | Mittag mit Himmel | oberes Drittel 139,30 (Soll 138,7 ± 1; main 142,86) | hält |
| S3 | Nacht darstellbar | Mond-Wiese k 46 786: verschiedene Puffer-Werte R 199 · G 164 (Soll ≥ 100) | hält |
| S4 | k-Sprung | k × 2 bei stehender Kamera: 77,6 → erste Lesung 113,21 = stehend 113,21, zurück 77,6 = 77,6 | hält |
| S5 | Kette nachts | — | Welle 2 (benannt) |
| S6 | kein Leser ohne k_vor | Wand Klasse Erscheinung in diag-altlasten (check:statik): 6 Belichtungs-Teiler, 9 Namen, Rest 1 | hält |
| S7 | Streulicht am Deckel | keine Zahl gemessen | offen |
| S8 | Rückstrahl ohne Selbstleuchter | grün an cd2cd289c, am Kopf NICHT neu gemessen | ungemessen am Kopf |
| S9 | tote Zahlen | luxJeEinheit 0 · einheitCdM2 0 · PHYS 0 · 0.224: 1 Treffer, eine Körper-Breite (koerper-core.js:1402), kein Licht | hält |
| S10 | jede Quelle physikalisch | 13 gemessen + 7 Hypothese mit Band von 46; X 14 beim Namen (unten) | ROT |
| S11 | Preis | gpu-bank 240 × 3, Mess-Wiese, main dabd69bb ↔ Kopf, ABAB: 11,29 / 10,92 ↔ 10,82 / 10,92 ms, Mittel −0,24 ms (Soll ≤ +0,05) | hält, siehe offen |
| S12 | Herd nah ist ein Bild | kein Wald, kein Halm über dem Ring; Flamme farbig (paar-herd-nah.jpg) | hält |
| S13 | Sterne | m ≤ 2 im Bild 10, sichtbar 8 (×3,4–8,9 über dem Himmel daneben); die zwei anderen hinter einer Krone (Schwarz; Kronensaum), am freien Himmel 8 von 8 | hält |

Wächter Tag: wiese-mittag Bild-Mittel 77,68 ↔ main 77,71. Kreuz-Maß dorf-nacht am Kopf 0,298 (Soll ≥ 0,12; Ratsche 0,307 an sprosse-Pose).

## Geschnitten (seit dem letzten Bericht, in Reihenfolge)

- Fenster-Kreuz (5ee7c2ce2): die Scheibe steht mittig in der Tiefe des Kreuzes, das Kreuz deckt sie von beiden Seiten.
- Sprosse der Flächen-Stufe (eecca81c5): Sprosse und Rahmen tragen ihre Flanken, 36 → 52 Dreiecke je Flügel (nur L1; 62 Fälle,
  1 135 Flügel, +18 160 Dreiecke). Verworfen: die zwei Sprossen-Flächen auf die Scheibe legen (fast koplanar, flimmert).
  Vertrags-Akt: Re-Mint haeuser.json nur Daten.
- Linse „das Kreuz steht vor der Scheibe, von beiden Seiten“ (e5799c220, gate:fachwerk-contract): Ratsche L0 ≥ 0,3 / L1 ≥ 0,8
  (Ist 0,333 / 0,861–0,868), Mutant „Scheibe an alter Lage“ 0,029–0,056 ROT.
- Kreuz-Maß als Werkzeug (3cd30a0d5): `scripts/lib/kreuz-mass.cjs`, `scripts/diag-kreuz-mass.cjs`, Selbsttest in check:statik.
  Maske „Scheibe“ = 13×13-Median ≥ 0,45; dorf-nacht main 0,035 · vor dem Schnitt 0,040 · Kreuz 0,267 · mit Flanken 0,307
  (Ratsche). Die frühere Zahl 0,168 stand an einer anderen Maske, kein Widerspruch.
- Klasse Schein-Emissiv (35f5a1013, b080b6c53, dec71421f): Haut-Saum, Fell-Rim/Sheen/Funkeln, Strähnen-Rim/Glanz sind Rückwurf
  des Lichts am Ort (`_saumLichtModell`: direkt × N·L ÷ π, Umgebung ÷ π), nie Emission; der Saum sitzt auf dem Lichtmodell, das
  der Stoff selbst baut (die Menschen-Haut behält ihren Klarlack). Die Regen-Schliere liest das Licht des Messers (`uLicht`).
  Linse Schein-Emissiv (ea36817af) mit vier Mutanten.
- Daten-Leser: Scheiben-Farbe Sonne/Mond/Sterne auf Luma 1 (96c83a561). Namensschild = neunter Name der Klasse Erscheinung
  (427710283), Linse „genau 9 Namen“.
- Zurückgenommen, offen für Welle 2: Rolle feuer (fd4450530 — `FEUER_LEUCHTDICHTE` × Vertex-Farbe drückte die heißeste Ecke von
  13 840 auf 5 160 cd/m², unter das Band 13 800–16 000) · Esse (c509489ab — der Schnitt wurde im Bild nicht gelesen, vier
  Seiten 0,03–0,42/255; der Weg Bauplan-Teil → Stoff verliert `leuchtdichte`, wo ist ungelesen).
- Das ferne Fenster trägt sein Glas im Flügel, nicht in der Öffnung (085b9ee10): an der L0 ist jede Öffnung leer (`fensterAt`
  schwenkt jeden Flügel um 0,62 rad), fern glühte dort eine zweite Scheibe. Vertrags-Akt: Re-Mint haeuser.json nur Daten,
  65 Fälle L2 und 2 L1 der Türme, keine L0.
- Heil-Commits am Merge-Kopf: Quelltext-Wand (diag-altlasten stamm 8 → 10, die zwei neuen Struktur-Wände der Welle) ·
  Mutanten der Wand Schein-Emissiv folgen dem Saum auf dem Modell des Stoffs · Klarlack-Kommentar trägt die gemessene Zahl.

## Gemessen

- **Sprosse:** am offenen Flügel steht die Quer-Sprosse im schrägen Nah-Blick als EINE dunkle Linie (sprosse-nah.jpg, Nacht | Tag).
- **Fell, Mess-Wiese** (Bär bei −276,4/−1045,6, Kamera am Auge des Spielers): Nacht ohne Quelle Tier P99 197,3 → 58,1, Gras
  daneben 69,9 → 69,8. Mittag an EINEM eingefrorenen Bild: mit Saum ↔ Saum-Modell abgeschaltet 0,29/255, zwei gleiche Schüsse
  0,18. Einschränkung: „ohne Saum“ steht für „vor“, am Vor-Kopf selbst nicht gemessen, weil die Pose über Commits nicht einfriert.
- **Klarlack** am Gesicht, Mittag, EIN eingefrorenes Bild, Abstand etwa 2,5 m: der Lack allein Mittel 0,43/255, Glanzpunkt bis
  10/255; zwei gleiche Schüsse 0,00.
- **Haus-Ferne, Zeile G** (gate:haus-fern): Glut L2/L0 1,151 [1,017; 1,271] (vor dem Kreuz-Schnitt) → 1,274 [1,095; 1,421]
  (5ee7c2ce2 setzt das Kreuz vor die nahe Scheibe) → **0,986 [0,835; 1,104]** am Kopf (Soll ≤ 1,20); Farbe max 0,116
  (≤ 0,15); L1/L0 0,980 [0,842; 1,008]. Zerlegung: an der L0 ist jedes Fenster offen (wach, geschlossen: n = 0); der
  Überschuss saß zu rund zwei Dritteln im Glas der leeren Öffnung, zu einem Drittel im Kreuz auf der Öffnung.
- **Haus-Ferne, Farbe** (Paar `modern` fern, fern-modern.jpg: L0 | L2 vor den Flanken | L2 am Kopf, Albedo-Bild am Kern): die
  Flanken bewegen die Ferne um Mittel 0,47/255 (max 5), griechisch 0,14 (max 1). Tafel je Stoff (Sicht-Mittel, euklidisch linear
  × 255, Abstand L2 ↔ L0 vor → nach): modern putz 13,05 → 13,84 · stein 6,62 → 6,67 · metall 7,45 → 9,36 · griechisch putz
  8,31 → 8,92 · stein 5,10 → 5,02 — 7 von 10 Paaren WEG um 0,05–1,9 auf einem Sockel von 5–14, der vor den Flanken stand. Die
  Ton-Messung an L1 rückt mit den Flanken NÄHER an L0 (Klasse flach modern 0,0780 | 0,0692 → 0,0730). Täter des Sockels:
  `tonUebertrag` (EIN Luma-Faktor je Klasse) — Fund-Zeile Haus-Ferne. Berichtigung: die zuerst gemeldeten „13,39/255“ waren der
  größte Einzelkanal linear × 255, nicht sRGB; „≤ 0,12/255“ galt nur für L1.
- **S10:** 13 gemessen physikalisch + 7 physikalisch nur als Hypothese mit Band (18 Herdfeuer, 19 Glut ohne Gestalt, 20 Laterne,
  21 Wandlaterne, 25 Tor, 29 Fensterglas, 30 Laternenglas) · E 7 · K 1 (Augen-Licht) · F 4 · X 14 beim Namen: 10 Sterne ohne
  Extinktion · 11 Sonnenscheibe (0,95, kein Durchlass) · 12 Mondscheibe (27-facher Raumwinkel, konstant) · 14 Godrays ·
  17 Wasser-Phong × 1,35 · 22 Stahl der Esse · 24 Lava-Licht (T⁴, Farbe 2 000 K) · 27 Rolle feuer · 32/33 Fahrzeug ·
  36 Glutbett · 37/38 Glimmen (Boost, Deckkraft, Farb-Luma, Achse × 2) · 42 Brand-Zunge (T⁴, Spitze 37-fach zu hell).
  Sie sind der Eingang der Welle 2.

## Tore am Kopf 085b9ee10

- gate:tag-achse:echt GRÜN, die Zeile der Wiese wörtlich: „TAG wiese GRUEN: Karte 125.4 · Sprung 0.09 (Uhr 0.276) · Buckel 0.00 (Uhr 0) · Sonne 10° -1.06 EV R/B ×1.07 | -1.31 EV R/B ×0.80 · Nacht -3.46 EV Luma 31.1 · REF -0.11 (Uhr 0.72) · nur die Wand (--kurz)“
- gate:asset-contract GRÜN (128 Goldens byte-gleich, 420 s) · gate:fachwerk-contract GRÜN (cv:6, mit der Linse Kreuz vor der Scheibe) · gate:nervensystem-fachwerk GRÜN mit Selbsttest · gate:haus-fern GRÜN (G oben)
- check:statik GRÜN am Merge-Kopf (der letzte Kopf ändert danach nur fachwerk-core.js + haeuser.json und einen Kommentar; fachwerk-Familie dort neu gelaufen)
- Nicht am Gerät gelaufen, der Cloud überlassen: die übrigen Gruppen von [ci voll].

## Fallen gelassen mit Grund

- A1 (Sättigung 0,75 am Fuß — ein Fuß-Artefakt) · A4 und K1 (Michelson P10/P90 lasen den Verlauf der Scheibe an main, nie das
  Kreuz; ersetzt durch „das Kreuz steht dunkel vor der leuchtenden Scheibe“, Kreuz-Maß oben) · A6/H (der Hof 0,0786 → 0,0363,
  die Kurve bewegt ihn nicht) · A7 (Sonnenscheibe 45°/0,141 gegen main 60°/0,036).
- K3: bei Tag steht das Kreuz jetzt als Balken VOR dem Glas an allen fünf Fenstern der Ostfront; an main lag es hinter der
  Scheibe — mein Soll war falsch gesetzt. Kein Flimmern gesehen.
- Paar „mondlos“ gefallen (der Mond steht jede Nacht dem Sonnenort gegenüber, `stamm/bild-himmel.js:1150`).
- S5 (Kette nachts) geht in Welle 2.

## Ehrlich offen

- Am Nacht-Bild: die Sprosse liest als dünner Riss, etwa ⅓ der Breite (main ~14 px, Kopf 4–6 px) — der Hof frisst die Kanten
  (Welle-2-Punkt); dazu die Zeile am offenen Flügel (die Scheibe des Flügels leuchtet, der Raum dahinter ist schwarz).
- Sterne im Dorf: sie stehen im Bild, neben den Laternen schwach; k liest keine Quelle (`_belichtungAusLicht` →
  `_waagrechtIrradianz`), mein früherer Satz „k folgt der Szene“ war geraten.
- Feuer trägt zwei Zahlen (Fläche 13 840 aus `LEUCHT_FEUER` 2,5 × Farbe, Flächenlicht `FEUER_LEUCHTDICHTE` 15 000) — beide im Band
  13 800–16 000, die EINE Zahl fällt mit der Palette je Temperatur (Welle 2).
- Regen-Schliere: Rückwurf mit Laborzahlen (Helligkeit 0,623, Deckung 0,72).
- S11 ist zwischen Köpfen gemessen (main ↔ Kopf, je Boot), nicht AN ↔ AUS im selben Boot, wie die Zeile verlangt.
- Werkzeug: ein Tier steht über Köpfe nicht an fester Pose.
- Der Maß-Zwilling des fernen Fensters (`fachwerk-core.js:2799–2802`) fällt nicht byte-gleich (FLUEGEL_LAGE = cos/sin 0,62 auf
  7 Stellen) — Fund-Zeile.
- Fund-Zeilen im Register (koordination c0c00a8de und folgende): tonUebertrag · offener Flügel · Tier-Pose · vakuöser Selbsttest
  (einen Commit lang rot, erst check:statik nannte ihn) · Esse-Weg · Genesis-Sprung 0,34 EV · Sterne berichtigt · Maß-Zwilling.

## Bilder (koordination `bericht/1911-licht-eine-skala/`)

`abgabe/paar-*.jpg` (koordination ab01416fe), je main f68dbf09 | Kopf 085b9ee10, 1920 × 1080 halbiert: wiese-mittag · sonne-mittag · mond-frei · mond-himmel · mond-gegen · herd-nah · kronendach (ABNAHME ROT gewollt, an beiden) · innen-a…d (a und d ROT an beiden) · dorf-nacht · tor-nah-tag · tor-nah-nacht · tor-fern-nacht. `abgabe/fern-modern.jpg`, `fern-griechisch.jpg` (L0 | L2 vor den Flanken | L2 am Kopf, Albedo am Kern). Davor: sprosse-nah.jpg, fell-fest.jpg, saum-ab.jpg, lack-gesicht.jpg, herd-daten.jpg, kreuz-*.jpg, schein-*.jpg.
