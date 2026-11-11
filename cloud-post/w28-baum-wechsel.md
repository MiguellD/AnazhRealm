# Post an w28-baum-wechsel

## 11.11. 14:40 UTC w28-baum-wechsel — ZWISCHENSTAND 2: der Schnitt steht, die Messung verbietet seine Landung (KEINE Abgabe)
**Geschnitten** (Zweig `w28-baum-wechsel`, Kopf 32152798, WIP [skip ci], NICHT zur Landung): der Baum fragt das Gesetz mit Vorlage. `LOD_SCHIRM.fehler.tree` trägt neun Zeilen je Meter Sichthöhe (stamm/vegetation-streu.js:3038); `_baumStreck(vorlage)` (:1871) teilt den Abstand von `_wechselGesetz` durch den Haushalt, je Grenze; die Stufen tragen ihn als SCHIRM-HÖHE ihrer Grenze — `aH0L` × Streck der 01-Grenze, `aH0` und die Sichthöhe der Karte × Streck der 12-Grenze (`_foundryStufenHoeheAngleichen` :2106, studio-gestalt.js:1199, studio-bruecke.js:2847). Maske (stoff-karte.js `_lodCrossfadeMaskNode`) und Wahl der GPU (`PASS_WAHL_WGSL`) bleiben byte-gleich: sie messen wie bisher d · min(Bezug / Stempel, 1); der Wind teilt den Streck wieder heraus (vierte Art-Größe `windArt.w` = die Zeile, Uniform `uLodSchirm`, stoff-instanz.js:245/274/568); die Wahl der CPU liest je Grenze die Schirm-Höhe (`_chooseLODForDistance` :2213, `_lodBandPartnerFor` und `_archStufeSpiel` in siedlung-bauten.js, `_streuZelleMerke`); der Wechsel des Schirms stempelt Fassaden und Karten neu (`_schirmHoehenNeu`). playtest:fast 21/0, `npm run check` grün (Exit 0), Atlas-Ratsche OK, Werkbank swiftshader: die Welt steht, kein STOFF-Bruch.
**Gemessen** (Werkbank swiftshader, EINE Welt, Mess-Wiese Ego 1920 × 1080, `zaehlen`, A/B über `_baumStreck`):

| Lauf | Dreiecke | Befehle | Baum L0 | Baum L1 |
|---|---|---|---|---|
| vorher (ohne Streck, wie main) | 328 283 | 95 | 21 900 | 28 400 |
| nur die Karten-Grenze nach ihrer Zeile | 685 079 | 125 | 21 900 | 370 708 |
| beide Grenzen nach ihrer Zeile | 1 247 485 | 141 | 655 448 | 296 676 |

Das Band (680k) reißt an der Wiese schon mit der Karte allein, mit beiden Grenzen um das 1,8-Fache. An der Wiese stehen neben den 220 Streu-Zellen ~90 gepflanzte Bäume im Blick (31 Tannen, 31 Fichten, 19 Eichen, 9 Birken ab 19 m) — mein Zensus von 13:50 zählte nur die Zellen. lod.K2#1 und die Zeit habe ich NICHT gemessen (kein Kopf zur Probe: der Zweig darf so nicht landen). Die Folge der Station (kanten.js) kam auf swiftshader in 40 min nicht zur Antwort — die Zeilen stammen aus dem Modell am Bau (Weide am Haushalt 5,99 px gegen 5,15 px der Radeon).
**Entscheidung nach Messung:** Hinausschieben ist für JEDE verbreitete Vorlage zu teuer; Schritt 3 (der Fehler fällt an der Quelle) ist die einzige Tür — und sie liegt nicht in meinen Dateien:
- FUND 1 · foundry-core.js:2080–2110 (die Wedel-Grammatik; Haushalt :501) · Wurzel: die L1 der Nadel-Arten trägt die Silhouette ihrer L0 nicht — am Haushalt Fichte 1,79 · Tanne 1,91 · Mammut 1,80 px, und ihre Karte wird aus dieser L1 gebacken (2,5–2,9 px). Die Nadel-Arten tragen den Löwenanteil der Kosten (Tanne + Fichte ≈ 250k der 370k L1-Dreiecke, 655k als L0). Ein Dreh am Haushalt heilt es nicht (gemessen, nicht committet: `breite` 2,03 → 1,65: Fichte 1,91 · Tanne 1,95 px; dazu `nadel` 0,03 · `spalte` 1,25: 1,55 · 1,66 px bei +40 % Dreiecken) — die Strähne muss den Umriss der L0-Zweige tragen · Kriterium lod.K5 (beide Zeilen der drei Arten) · Größe M–L.
- FUND 2 · stamm/stoff-material.js (`_relief`, `KARTE_GITTER`) + die Zelle 128 × 256 · Wurzel: w27 (Post 10.11. 02:20): die Karte fällt unten hinter die Halme (Tiefe nur an 3 × 3 Ecken) und trägt Flecken ohne L0 — die GPU misst an der Weide 5,15 px, das Modell mit Relief 3,16; dazu die Schranke: ein Baum ≥ 12 m steht am Haushalt 325 px hoch auf 256 Texeln · Kriterium lod.K5 (die Zeile jeder Karte; heute Faktor 3,0–12, mit heiler Karte laut w27-Modell 1,65–3,5) · Größe M.
- FUND 3 · meisterkarte-quelle/punkte/stationen/g3.js (lod.K5#1) + bericht/2910-lod-k5/kanten.js:41 · Wurzel: die Station misst am Baum nur die Weide — für die Stufe 1 ist sie die BESTE Vorlage (0,20 px), die schlechtesten sind Totholz 3,43 und Tanne 1,91 px; `fehler-am-bau.cjs` liest noch die Tafel je Art (`S.fehler[kind][stufe]`, seit w25-lod-pop je Vorlage) und misst am Baum nichts mehr · Kriterium lod.K5#1 (ein GRÜN an der Weide wäre kein GRÜN der Familie) · Größe S.
- FUND 4 · Totholz-L1 3,43 px am Haushalt 12 m (dieselbe Klasse wie FUND 1, die Rinde ohne Laub) · Größe S–M.
**Der Weg, den die Zahlen zeigen:** FUND 1 und 2 senken die Zeilen; danach trägt dieser Zweig sie ohne weiteren Stoff-Umbau in Maske und Wahl (die Tafel neu messen: `bericht/1111-baum-wechsel/baum-fehler.cjs`, je Vorlage ~25 s). Mit den Zeilen des w27-Modells (Eiche 1,65 · Birke 1,74 · Fichte 2,9) läge die Karten-Grenze nach Fläche bei rund einem Fünftel der heutigen Mehrkosten — das ist eine Rechnung, keine Messung.
**Werkzeuge** (koordination `bericht/1111-baum-wechsel/`): `baum-fehler.cjs` (Fehler am Bau je Vorlage × Stufe in Welt-Metern, sucht den 1-px-Abstand; `ARTEN=… STUFEN=… node <pfad>/baum-fehler.cjs` im Spiel-Baum) · `zensus.js` und `kanten-baum.js` (Seiten-Code für `werkbank eval`) · `fehler-am-bau-main-e699a834.jsonl` · `zaehlen-wiese-swiftshader.jsonl` (die drei Läufe je Klasse).
**Ehrlich offen:** lod.K5#1 bleibt bei 0 Punkten. Die Linse der Mechanik (Mutante „ohne Vorlage hält der Haushalt") und die Schärfung der Station (FUND 3) baue ich erst mit einem landbaren Kopf — sag an, ob ich FUND 3 jetzt als `w28-baum-wechsel-pm` liefern oder die Wedel-Grammatik (FUND 1, foundry-core.js) dazunehmen soll; ich warte nach brief-gemein.

## 11.11. 13:50 UTC w28-baum-wechsel — ZWISCHENSTAND 1 (Messung, noch kein Schnitt; main e699a834)
**Wurzel bestätigt:** `LOD_SCHIRM.fehler.tree` ist `je({})` (stamm/vegetation-streu.js:2879), `_wechselAbstand("tree", s, ref)` fragt ohne Vorlage (:1929) → e = 0, es hält der Haushalt.
**1. Fehler am Bau je Art × Stufe** (fehler-am-bau-Modell der Station, in WELT-Metern: Vorlage × Welt-Skala, Abstand = Haushalt × max(H, 12)/12, 1920 × 1080; die Karte als ihre nächste gebackene Ansicht, ohne Relief):

| Vorlage | H m | L1 am Haushalt | Karte am Haushalt | Karte ≤ 1 px ab | Faktor | Zeile (e/H) |
|---|---|---|---|---|---|---|
| eiche | 21,4 | 0,05 px @ 21 m | 2,84 px @ 46 m | 177 m | 3,8 | 0,0118 |
| birke | 16,6 | 0,05 @ 17 | 3,11 @ 36 | 171 | 4,8 | 0,0147 |
| buche | 27,6 | 0,05 @ 28 | 2,56 @ 60 | 180 | 3,0 | 0,0093 |
| weide | 9,9 | 0,20 @ 12 | 5,99 @ 26 (GPU 5,15) | 258 | 9,9 | 0,0306 |
| karst | 11,1 | 0,22 @ 12 | 6,04 @ 26 | 222 | 8,5 | 0,0263 |
| fichte | 32,3 | **1,79 @ 32** | 2,69 @ 70 | 340 | 4,9 | 0,0150 |
| tanne | 31,4 | **1,91 @ 31** | 2,90 @ 68 | 346 | 5,1 | 0,0157 |
| mammut | 48,1 | **1,80 @ 48** | 2,53 @ 104 | 436 | 4,2 | 0,0129 |
| totholz | 8,9 | **3,43 @ 12** | 3,17 @ 26 | 103 | 3,9 | 0,0122 |

Befund dazu: (a) JEDE Baum-Karte trägt am Haushalt 2,5–6 px, nicht nur die Weide der Station; (b) die L1 der Nadel-Arten und des Totholzes reißt das Soll selbst (1,8–3,4 px), die Station sieht es nicht (sie misst nur die Weide); (c) die Schranke ist das Texel: ein Baum ≥ 12 m steht am Haushalt immer 325 px hoch (12 m × 704 / 26 m), die Zelle trägt 256 Texel — die Karte ist dort > 1,27 px je Texel.
**2. Kosten des Hinausschiebens** (Werkbank swiftshader, Mess-Wiese, Zensus der Streu-Zellen: 220 Bäume bis 356 m, Höhen-Median 25–38 m, Skala 0,6–2,08; heute 8 auf L1, 0 auf L0, nächster Baum 65 m): Bäume im Ring Haushalt … k × Haushalt im Blick (107° waagrecht) × L1-Dreiecke samt Wurf: k 2 → 15 Bäume, +33k · k 3 → 35, +76k · k 4 → 56, +124k · k 5 → 76, +168k. Mit den Zeilen oben (k 3,0–9,9) sind das an der Wiese +130–170k Dreiecke im Blick auf p95 548–587k: das Band (680k) reißt. Reines Hinausschieben ist zu teuer.
**3. Der Träger in der Maske** (gelesen): die L1 braucht je Instanz drei Zahlen — die wahre Höhe (der Wind liest `aH0`, stoff-instanz.js:265), die Blatt-Höhe der 01-Grenze (`aH0L`, gekappt) und die gestreckte Höhe der Karten-Grenze —, getragen werden zwei; ein dritter Vertex-Puffer ist nicht frei (WebGPU 8, siedlung-satz.js:1654), und die Arena zeichnet viele Arten in EINEM Zug (kein Stoff-Wert je Art). Frei ist die vierte Zahl der Art-Größen des Winds (`windArt` vec4 im Speicher der Arena, stoff-instanz.js:553) und `fenster.w` des Auftrags der GPU-Wahl.
**Läuft:** die Folge der Station im echten Renderer (swiftshader, Weide + Eiche, Karte bei 1× · 2× · 3,5× Haushalt) — sie entscheidet, wie weit das Relief die Zeilen gegenüber dem Modell senkt. Danach der Schnitt.
