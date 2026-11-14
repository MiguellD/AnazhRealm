# Befund Linse — wer lebte in 360 Zeilen und schoss in 1080? (14.11., main 68d24688)

ZWISCHENSTAND. Quelle gelesen NUR im Lese-Baum `lese-main` (= main 68d24688), Stationen in `koord-hebel/meisterkarte-quelle/punkte/`,
Bilder unter `artifacts/profiband/auge/` und `origin/koordination:probe-post/`. Kein Spiel, keine GPU gestartet.

## 0. Der Mechanismus an der Quelle (die Wurzel)

1. `scripts/werkbank.cjs:469` — mit `--echt`: Browser im Fenster, `defaultViewport 1920x1080`; ohne `--echt` `null`, headless.
2. `scripts/werkbank.cjs:523` — `if (!ECHT) await page.setViewport({ width: 640, height: 360 })`: JEDE Werkbank ohne `--echt` lebt
   (Boot, `umstellen`, jeder Takt) im Zeichenpuffer 640x360. `werkbankTor` (`scripts/lib/welt-boot.cjs:1949–1966`) reicht
   `--echt` NIE weiter: jede `--eigen`-Welt und jedes `gate:…:echt` mit `--eigen` lebt in 360 (der Name „echt" meint dort nur den
   GPU-Laeufer).
3. `scripts/werkbank.cjs:2104` — ein Bild mit `--ort` setzt `b.klasse` IMMER (der Inhalt des Orts); `:2108` Leinwand mit Klasse
   1920x1080, sonst `max(Fenster, --w/--h)`; `:2110–2112` `setViewport` auf diese Groesse, `:2117` Schuss, `:2119` zurueck.
4. Das Spiel hoert den Wechsel: `stamm/dirigent-ankunft.js:618–631` (resize → `renderer.setSize`, `_schirmMessen()`,
   `_stufenSchirm()`): die SCHWELLEN (Baum thresh01/12, `_baumEpoche`, `stamm/vegetation-streu.js:1922–1945`) folgen sofort.
5. Die WAHL je Ding folgt nicht: sie faellt nur im Takt (`_gameLoopTick`, `stamm/dirigent-takt.js:107–108`; die Masken-Uniform
   `uLodD0` schreibt der Takt, `stamm/dirigent-takt.js:2457`; das Feld der Leiber `_feldGrenzen`, `stamm/vegetation-streu.js:1864`,
   rechnet die Grenze neu, wird aber erst im Takt je Leib gefragt; die Baum-Epoche loest erst `siedlung-bauten.js:155` im Takt).
6. Der Schuss tickt nicht, wenn die Welt „steht": `scripts/lib/ausgabe-aufnahme.cjs:338` („steht sie schon, schiesst die Buehne
   ohne Takt"); `_weltSteht` (`stamm/dirigent-takt.js:765–786`) prueft Regung, Bau, Karte, Offenes, Anker — NIE den Schirm. Mess-
   Saetze (`satz: "messung"`) warten gar nicht (`ausgabe-aufnahme.cjs:910`). `__loopBild` (`welt-boot.cjs:113–116`) und die
   GPU-Bank (`zerlege-linse.cjs:392–399`, `:848–874`) rendern nur — kein Takt.
   → Nach `umstellen` (die Welt steht) zeichnet `/bild` die Stufen-WAHL eines 360-Zeilen-Schirms in den 1080-Puffer.
7. Die Aufnahme selbst schiesst immer in Groesse des Zeichenpuffers (`ausgabe-aufnahme.cjs:897–900`, `__leinwandRot`): jede
   Messung IN der Seite (`__ausgabeAufnahme(W,H)` einer diag-Linse) lebt und misst in derselben Groesse — gleich, wenn auch klein.

Faktor: `_brennweite(z) = z / (2·tan(KAM_FOV_GRAD/2))` (`stamm/vegetation-streu.js:2982–2986`), `KAM_FOV_GRAD = 75`
(`stamm/koerper-fahrt.js:3146`): f(1080) = 703,8 px, f(360) = 234,6 px — Faktor 3,0 in jeder Pixel-Schwelle. Leib
(`LOD_SCHIRM.leib`, `vegetation-streu.js:2884`, `_feldGrenzen` :1870–1873): Mengen-Stufe ab 1,8·f/64 = 19,8 m (1080) gegen
6,6 m (360), hinaus 23,8 gegen 10,6 m — ein Bewohner in 6,6 m steht im 1080-Bild 1,8·703,8/6,6 = 192 px hoch als Mengen-Leib.
Mit `--fov 34` (Bildpaar-Rezept) zusaetzlich tan(37,5°)/tan(17°) = 2,5: der Leib steht 7,5-fach groesser als seine Stufe glaubt
(die Brennweite der Stufe liest `KAM_FOV_GRAD`, nie das Schuss-Sichtfeld — gewollt, `vegetation-streu.js:2958–2959`).

## 1. Die Tafel: wo lebt die Welt, wo wird geschossen oder gemessen

| Werkzeug/Station | Datei:Zeile des Rufs | Welt lebt in | Schuss/Messung in | Urteil | was sie urteilt |
|---|---|---|---|---|---|
| CI GPU-Probe `bild:<ort>@<uhr>` | `.github/workflows/gpu-probe.yml:241` (start ohne --echt), `:248` umstellen, `:264` `bild --wahl 0 --w 960 --h 540 --ort` | 640x360 | 1920x1080 (`--ort` → Klasse, werkbank.cjs:2104/2108) | LUEGT ×3 | ABNAHME + Inhalt des Orts (imBild) — das Beweisbild jeder Abgabe |
| Bildpaar-Rezept der Arbeiter (Werkbank am Dorf, Gedaechtnis „bildpaar-im-spiel-rezept") | `werkbank start --port 4793 --ort dorf`, `bild … --wahl 0 --w 960 --h 540 --uhr 0.5 --ort dorf [--fov 34]` | 640x360 | 1920x1080 | LUEGT ×3 (mit `--fov 34` ×7,5) | Vorher/Nachher-Bild jeder sichtbaren Landung |
| `werkbank bild` ohne --ort/--klasse, ohne --echt | werkbank.cjs:3157–3158 (Vorgabe 640x360), :2108 | 640x360 | max(640x360, --w x --h) | WAHR bei 640x360; LUEGT ×1,5 bei 960x540, ×3 bei 1920x1080 | Hand-Bild |
| `werkbank … --echt` (jede Sitzung) | werkbank.cjs:469 | 1920x1080 | 1920x1080 | WAHR | — |
| Meisterkarte 1, Sitzung je Geraet und SHA | `punkte.cjs:2370` (`start --echt … --ort wiese`); Fenster zurueck `punkte.cjs:2590`, `:3487` | 1920x1080 | 1920x1080 | WAHR; Rest-Risiko: eine Station, die nach einer 640/800/1280-Station OHNE Takt schiesst (die Rueckstellung `/fenster` tickt nicht) — nicht je Station nachgezaehlt | alle Sitzungs-Stationen |
| Soll-Tafel AAAA in der Sitzung (haar.K1/K2, `bild --klasse --ist`) | `stationen/g2.js:1525` (fenster 1920), `:1538` | 1920x1080 | 1920x1080 | WAHR | Klassen-Masse der Soll-Tafel |
| Tier-Bilder der Sitzung (`--w 1920 --h 1080 --klasse '^tier:'`) | `stationen/g2.js:4012/4015`, `:4477/4482` | 1920x1080 | 1920x1080 | WAHR | tiere-Kriterien |
| Stadt am Huegel (siedlung.K2, K4) | `stationen/g5.js:1221/1240–1241`, `:4059/4075` (fenster 1600x900, danach umstellen/eval) | 1600x900 | 1600x900 | WAHR (gleich; der Takt nach dem Fenster laeuft im umstellen) | Stadt-Bild |
| Sitzungs-Stationen im kleinen Fenster (vegetation.K4 W9, leib.K2, leib.K4, Unterwasser, Zugang-Farbe) | `g2.js:29`, `g5.js:640`, `:666`, `:2403`, `:3382` (fenster 640x360, Messung in der Seite) | 640x360 | 640x360 | WAHR (gleich), urteilt einen 360er Schirm | Mechanik, Farbe, Fuss |
| Eigene Welten der Meisterkarte (werkbankTor ohne --echt) | `g2.js:1084` (affekt), `:2193` (Tracht, fenster 960x540 vor umstellen), `:3468` (Haar-Wind 640x360), `g5.js:3375` (Zugang) | Fenster der Station | dasselbe | WAHR (gleich) | Mechanik/Bild klein |
| `gate:pop` / `werkbank pop --eigen` (lod.K2#1) | werkbank.cjs:3180–3186: eigene Welt 360 → `/fenster 1920x1080` → `umstellen` (tickt) → `popGang` | 1920x1080 nach dem umstellen | 1920x1080 | WAHR (headless, Hardware-Adapter) | Pop-Pixel/s, GPU-Bank am Ende |
| `gate:laub-kante` (`werkbank kante --eigen`) | `scripts/lib/abnahme-urteil.cjs:3192–3197`: eigene Welt 360 → `/fenster 1920` → SOFORT `/bild` Tafel-Pose, erst danach umstellen + lauf | Tafel: 360er Wahl (sofern die Welt steht und die Pose nahe dem Spieler liegt; sonst `umstellen` in werkbank.cjs:2077–2078 tickt) | 1920x1080 | Tafel: LUEGT ×3 BEDINGT; Spielgang-Bild nach umstellen: WAHR | laub-kante fimp:atlas:L2 (PFLICHT A) |
| lod.K1#1 (laub-kante in der Sitzung) | `stationen/g3.js:3103–3135` | 1920x1080 | 1920x1080 | WAHR | laub-kante |
| `gate:nah-fern` | `scripts/diag-nah-fern.cjs:25–35` (werkbankTor ohne --echt, umstellen, `albedo --nah-fern`, werkbank.cjs:2242ff tickt selbst) | 640x360 | Albedo-Probe in der Seite | WAHR (gleich; Albedo haengt nicht an der Stufe des Schirms — nicht tiefer gelesen) | Albedo nah gegen fern |
| `gate:tag-achse:echt`, `gate:tafel-ganz:echt`, `gate:licht-weg:echt`, `gate:naesse:echt` (`--eigen`) | `package.json`; werkbank.cjs:3368ff (umstellen, Aufnahme in der Seite) | 640x360 | 640x360 (Puffer) | WAHR (gleich), urteilt einen 360er Schirm | Licht, Tafeln, Naesse |
| Band-Wand / Profi-Band E (`werkbank band`, `omen-messfolge.cjs`) | `scripts/omen-messfolge.cjs:467` (`start --echt`), `:226`/`:615` (fenster 1920x1080, dann umstellen) | 1920x1080 | 1920x1080 | WAHR | p95, VRAM, CPU-Takt |
| `gate:profiband` (diag-profiband.cjs) | liest Mess-Dateien und Ratsche, startet keine Welt (diag-profiband.cjs:6) | — | — | erbt die Quelle (WAHR, wenn aus echt) | Band-Urteil |
| Preis-Lauf Meisterkarte 2 (`vision/preis/befund-gpu.md`, Fenster-ABBA 1920↔960, Block 3) | `/fenster` dann `/gpu-bank` (werkbank.cjs:1936–1939 → `zerlege-linse.cjs:848`, rendert ohne Takt) | 1920x1080 (Wahl) | 960x540 (B-Reihe) | LUEGT ×0,5 (umgekehrt) — sofern zwischen Fenster und Bank kein Takt lief; befund-gpu.md nennt keinen | GPU-Zeit je Pixel |
| Preis-Lauf Heap/VRAM/Bild (befund-heap.md, befund-vram.md, befund-bild.md) | `start --echt`, `fenster 1920 1080`, umstellen (befund-bild.md:4) | 1920x1080 | 1920x1080 | WAHR | Heap, VRAM, Bild |
| Blick-Sonde `npm run blick` (diag-blick.cjs, Studio) | `scripts/diag-blick.cjs:42`, `:179`, `:302`, `:332` | 640x360 | 640x360 | WAHR (gleich), Studio | Studio-Bild |
| `gate:schirm-monotonie` | `scripts/diag-schirm-monotonie.cjs:296–305` (setViewport, DANN Takte `__schirmTakt`) | je Phase | je Phase | WAHR — die eine Linse, die vor dem Zaehlen tickt | Welt je Fenstergroesse |
| diag-Linsen mit eigenem Viewport (analog-nah 640x360, kamera-laub 1280x720, portal-membran 480x270, post-kette 320x240 …) | `grep setViewport scripts/diag-*.cjs` | Fenster der Linse | Puffer = Fenster | WAHR (gleich), klein | ihre Mechanik |

## 2. Was auf der Luege ruht

Gebuchte Kriterien der alten Meisterkarte (223/330) fahren in der Sitzung `--echt` (punkte.cjs:2370): sie ruhen NICHT auf der
360er Luege — die gelesenen Bild-Stationen (haar.K1/K2, tiere, lod.K1#1, siedlung.K2/K4) leben und schiessen gleich. Nicht je
Station nachgezaehlt: ob eine Station nach einem kleinen Fenster einer Vorgaengerin ohne Takt schiesst.

Was auf der Luege ruht (Vermutung zur Richtung je Zeile, nichts umgebucht):
- Jedes Beweisbild der GPU-Probe `bild:<ort>` und jede Ratsche `bekannt` daran (100 Bilder in probe-post seit 12.11., §4): in
  1080 waeren Bewohner bis 19,8 m nah gezeichnet, Haeuser und Tore laenger in L0/L1, Baum-Karten spaeter — die Bilder werden
  BESSER; der Inhalt des Orts (imBild-Anteile je Klasse) verschiebt sich (mehr Leib-/Bau-Pixel der feinen Stufe).
- Die offenen Fern-Funde, soweit an diesen Bildern gesehen: „Boden-Rauschen im Dorf" (bild:dorf — der Boden-Satz haengt an Kacheln,
  nicht an der Pixel-Stufe: vermutlich bleibt er), „ferne Wiese 50–100 m lockerer unter dem Tele" (Tele-Schuss ohne Takt: die
  Wiese `_wieseFern` selbst nicht schirm-gestuft gelesen — offen), „Dach: Flackern der Ziegel unter Bewegung" (Bewegung tickt,
  `--bewegung` → wahr in der Groesse des Fensters; in der 360er Welt zu grob gewaehlt — vermutlich weniger Flackern in 1080, teurer).
- lod.K2#1 Pop (Radeon 0,0487 %, GTX 1050 0,051 %): `werkbank pop` lebt in 1080 (werkbank.cjs:3182–3183) — WAHR, nicht betroffen.
- vegetation.K1#1 rot 4,2 %: Quelle der Zahl nicht gelesen.
- Soll-Tafel PFLICHT A: die 11 GRUEN / ROT laub-kante 0,2635 (Karte fimp:atlas:L2, 17.10., 5deb7cb1) — stammt sie aus `gate:laub-kante`
  (eigene Welt 360, Tafel-Schuss ohne Takt), ist die Tafel-Pose BEDINGT gelogen: in 1080 stuende die Karte L2 weiter weg, ihre Pixel
  wuerden weniger, die Kante eher besser; stammt sie aus lod.K1#1 der Sitzung, ist sie wahr. Welche Quelle die 0,2635 trug: nicht gelesen.
  „Am Spawn misst sie 3 von 12": Quelle nicht gelesen.

## 3. Zeit- und Speicher-Messungen in der falschen Welt

- Profi-Band E (GTX p95 16,8 ms, VRAM 99,6–111,2 MB, CPU-Takt 4,7–6,3 ms): omen-messfolge `--echt` + fenster 1920 + umstellen
  (omen-messfolge.cjs:467, :615) — WAHR. B (Ankunft 16,6 s): Ankunft-Linse nicht gelesen.
- Der schwerste Fall gefunden, umgekehrt: Preis-Lauf `vision/preis/befund-gpu.md` Block 1 „Fenster 1920×1080 ↔ 960×540 → 0,41",
  Block 2 „× 0,42", Block 3 (ungemessen). `/fenster` + `/gpu-bank` rendern ohne Takt: die B-Reihe zeichnet die Wahl der 1080-Welt in
  540 Zeilen (Dreiecke und Befehle einer 1080-Welt). Vermutung: die wahre 540-Welt waehlt groeber, B ÷ A liegt UNTER 0,41 — der
  Schluss „~79 % wachsen mit den Pixeln" unterschaetzt den Pixel-Anteil; „karten waechst kaum mit den Pixeln (0,87)" ist an
  dieser Messung nicht entscheidbar. Ob zwischen Fenster und Bank ein Takt lief: in befund-gpu.md nicht genannt.
- `gpuBank` am Ende von `werkbank pop` (werkbank.cjs:3186): Welt 1080 — WAHR.
- Kosten-Zeilen der GPU-Probe-Bilder (`gesamtMs`) sind keine Kosten-Messung — kein Urteil daran gelesen.

## 4. Die Bilder der letzten zwei Tage

`origin/koordination:probe-post` seit 12.11.: 182 Bilder ohne Masken. 100 tragen den Namen der CI-Probe `<sha8>-<ort>-<uhr>.png`
(gpu-probe.yml:307) → LUEGT ×3. 1 Gate-Bild (`gate-laub-kante-tafel.png`) → BEDINGT. 81 Hand/Werkbank (w28-leib-nah 21,
w28-tiere-nach-bild 16, w28-stadt-grammatik 13 `main-…`/`fund-himmel-…`, w28-kopf-kalotte 9, w28-auge 7, w28-himmel-flaeche 5,
w28-gesicht 5, w28-stoff-stufe-null 4, w28-karte-stamm 1): nach dem Rezept ohne --echt mit `--ort` → LUEGT, wo Leiber/Bauten
jenseits 6,6 m stehen; Nah-Bilder unter 6,6 m (Gesicht, Kopf 1,5 m) sind von der Leib-Schwelle nicht betroffen.
`artifacts/profiband/auge/` seit 12.11.: 1114-ankunft (`main-…`, `sg-…`), w28-auge (`b6d828a0-…` = CI-Probe), w28-himmel-flaeche,
w28-baum-ganz, stadt-mass — alle 1920x1080, an der Groesse allein nicht unterscheidbar.

Gegenprobe mit eigenem Auge (Read der PNGs):
- `auge/w28-auge/b6d828a0-dorf-0.5.png` (CI-Probe): Bewohner in der Gasse als Klumpen-Stapel, der weisse bei x≈470 rund 160 px hoch
  (y 550–710) — 360er Welt. LUEGT.
- `auge/1114-ankunft/sg-22872718-dorf-0.5.png` (CI-Probe-Name): dieselbe Pose, Klumpen ≈ 150 px (x≈485, y 545–695). LUEGT.
- `auge/w28-himmel-flaeche/01-main-cec92db1-dorf-0.5-MIT.png` (Hand, main): dieselben Klumpen ≈ 160 px. LUEGT.
- `probe-post/w28-stadt-grammatik/20f15043-stadt-voll-0.5.png` (die gemergte Abgabe w28-stadt-grammatik, CI-Probe): auf dem
  Markt Klumpen-Stapel von 150–200 px (Mitte x≈1160 und x≈1360, y≈570–720; links am Stand > 200 px). LUEGT.
- `auge/1114-ankunft/main-cec92db1-genesis-0.5-1.png`: kein Leib im Bild, Baeume ab ≈ 20 m als Karten — an Leibern nicht entscheidbar.
- `probe-post/w28-leib-nah/8-paar-10m-heute-kandidat.jpg`: Ausschnitt, zwei Leiber fein — nicht entscheidbar (Zuschnitt, Abstand im
  Namen 10 m liegt zwischen 6,6 und 10,6 m: in der 360er Welt haelt nur die Hysterese den Leib nah).

## 5. Rat fuer den Schnitt

DIE WURZEL: `scripts/werkbank.cjs:2108–2119` — die Leinwand wechselt die Groesse, die Welt nicht: nach `setViewport` (:2111) folgt
kein Takt, weil `_weltSteht` (`stamm/dirigent-takt.js:765`) den Schirm nicht kennt. :523 (640x360 als Leben jeder Werkbank ohne
--echt) macht den Fall zur Regel. Der Schnitt, EINE Entscheidung: der Wechsel der Leinwand IST eine Regung der Welt — `_weltSteht`
steht erst, wenn der letzte Takt am heutigen Zeichenpuffer waehlte (die Hoehe der Wahl gegen `_schirm().hoehe`); dann tickt
`weltStehtWarten` (ausgabe-aufnahme.cjs:338) bis die Wahl folgt, in JEDEM Rufer (/bild, laub-kante-Tafel, Sitzungs-Station nach der
Fenster-Rueckstellung). Die Mess-Saetze (`satz: "messung"`) und die GPU-Bank brauchen denselben Takt nach einem Fenster — oder sie
messen nur im Fenster, in dem die Welt lebt. Linse: Mutante „resize ohne Takt" → Klumpen-Leib ab 6,6 m (der Faktor 3) ROT beim Namen.

Neu messen danach, nach Gewicht:
1. Die GPU-Probe `bild:dorf`, `bild:stadt-voll`, `bild:genesis`, `bild:wiese` an main — die Grundlage, wo die Ferne bricht; die
   Ratsche `bekannt` der Orte neu, weil jedes Urteil am 360er Bild fiel.
2. Die Bildpaare der Hand (Rezept am Dorf, auch `--fov 34`): leib-nah, stadt-grammatik, himmel-flaeche, auge — die Entscheide daran.
3. Preis-Lauf `befund-gpu.md` Fenster-ABBA (Block 1–3) mit Takt nach jedem Fenster — die Kosten-Zahl „79 % an den Pixeln".
4. `gate:laub-kante` Tafel-Pose (laub-kante 0,2635, PFLICHT A) — und klaeren, aus welchem Lauf die 0,2635 stammt.
5. Die offenen Fern-Funde an wahren Bildern: Boden-Rauschen im Dorf, ferne Wiese unter dem Tele, Dach-Flackern (`--bewegung`).
Nicht neu zu messen (gleich): Sitzung der Meisterkarte 1 (`--echt`), Profi-Band E, `werkbank pop` (lod.K2#1), Preis Heap/VRAM/Bild.

Ehrlich offen (nicht gelesen): die Quelle der Soll-Tafel-Zahlen in PFLICHT A und vegetation.K1#1 4,2 %; die Ankunft-Linse (B);
ob `__nahFolgt` (ausgabe-aufnahme.cjs:959) auch Leib-Felder nachzieht; ob Sitzungs-Stationen ohne Takt nach einem kleinen Fenster schiessen.
