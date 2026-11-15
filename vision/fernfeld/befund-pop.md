# Befund Pop — Schnitt 5 „der Eintritt“ (15.11.2026, 01:30, nur gelesen + EIN Lauf an der Radeon)

Lese-Stand: main 11d8de3d (Lese-Baum lese-main). Lauf: Baum lese-pop = w28-probe-schirm 68df6ac0 (main 11d8de3d + `_weltSteht`
liest den Schirm), `WERKBANK_FENSTER=1920x1080` — die Welt lebt ab dem Boot in 1920 × 1080, `r._schirm()` = 1920 × 1080 in jedem
Schuss. Radeon 890M, GPU-Schloss `gpu-lauf.sh befund-pop` (ART bild), 01:19–01:27, Port 4793 danach frei. Der Gang ist `popGang`
Zeile für Zeile (8 Schritte × 0,5 m, je 12 Takte, ΔLuma > 18), dazu je Schritt jedes Ding mit Namen, Abstand, Pixel-Höhe und je Klasse
die Maske „Klasse ab“ in A und B. Rohdaten: `pop-roh/radeon-0115-namen.json`, Sonde `pop-roh/pop-namen.js`, Lauf `pop-roh/pop-lauf.sh`.
Herkunft: [q] Quelle · [m] gemessen · [r] gerechnet.

**Gemessen (Radeon, dieselbe Art Welt wie die GTX-Gegenprobe):** 1,6257 % Pop-Pixel/s (33 711 px) [m] — GTX 1,63–1,72 % [q pop-roh].

## (1) Wie die Linse misst

- Pop-Pixel: |Luma709(B) − Luma709(A)| > 18 über das GANZE Bild, A = Stand der Welt vom vorigen Ort, B = nach 12 Takten am neuen,
  dieselbe Pose [q scripts/werkbank.cjs:394, :406, :419–422]. Kein Pixel wird einem Ding zugeordnet.
- „Karten-Ding erstmals gezeichnet“ (`ein`): JEDER Eintrag von `state.architectures`, der nach B gezeichnet ist (`_archIsRendered`:
  Mesh oder Instanz, stamm/siedlung-bauten.js:1791) und vorher nicht gezeichnet war ODER vorher gar nicht existierte (`!v?.[1]`)
  [q werkbank.cjs:402, :425]. Kein Blick-Kegel, keine Klasse, keine Pixel-Größe. Der Abstand ist xz vom Schuss-Ort p1 [q :425].
- Folge: `+94@103` (GTX) heißt „94 Einträge in jeder Richtung, der nächste 103 m“ — nicht „94 Dinge im Bild“. Schritt 1 der GTX trug
  94 Einträge und 159 Pop-Pixel [q pop-roh main-gesetz-ab-boot-1080.txt].

## (2) Wer in 100–206 m erstmals zeichnet — der Täter beim Namen

- 547 von 554 Einträgen des Gangs sind **NEU GEPFLANZT** (es gab sie in A nicht), alle **Würfe des Felds** (`feldWurf`): Baum
  (tanne, fichte, eiche, birke, weide; 277 Stück), Strauch (strauch), Fels (zacken), Ausstattung (feuerstelle) [m]. `state.architectures`
  wächst im Gang von 1 547 (nach `umstellen`) auf 2 483 (+936) [m].
- Ihr Erzeuger ist die Saat des Walds am Laub-Rand (`_foliageChunkInRadius`, Kommentar studio-bruecke.js:3407–3413), ihre Stufe die
  Karte: Klasse `fimp:atlas:L2` (Leaf `_impostorLeaf`, stamm/stoff-karte.js:598) samt Wurf-Zwilling `fimp:atlas#S:L2` [m Masken].
- Der Laub-Rand stand nach `umstellen` (653 Takte, „steht“) bei **129,6 m** = (Ring 2 + 1) × 43,2 m, und wuchs IM GANG: A₀ 149,6 →
  162,1 → 177,1 → 197,1 → 212,1 → 216,0 m ab Schritt 3 [m `_laubRand()` je Schritt]. Der Wald der Ringe 3 und 4 wird während der 4 m
  gepflanzt; jede Saat tritt sofort ein, weil ihr Rand `max(R 150, Laub-Rand − Saum)` ist [q studio-bruecke.js:3421–3428].
- Die Pixel (Klasse ab, Pop-Pixel ∩ Klassen-Maske): Schritt 3 — 5 765 px, davon 5 484 (95 %) in den Kästen der Dinge dieses Schritts;
  in A **Himmel** 5 454, in B **Karte L2** 5 528 [m]. Schritt 4 — 16 390 px, nur 10 in Kästen dieses Schritts; Karte L2 in A 16 062 und
  B 16 078, Himmel hinter der Karte 11 969 → 3 910: die Karten von Schritt 3 blenden weiter ein [m]. 93–99 % der Pop-Pixel werden
  dunkler (Baum vor Himmel; heller nur 221/5 765, 351/16 390) [m]. Alle Schritte: 30 · 479 · 53 · 5 765 · 16 390 · 3 923 · 5 928 · 1 143 [m].
- Vorbehalt der Masken: „Klasse ab“ nimmt auch Wurf und Umgebungs-Licht der Klasse (bodenSatz trägt in B bis 15 817) — Obergrenzen.

**Der Täter:** die Saat der Wald-Ringe 3–4 (Würfe des Felds, Baum-Karten L2 in 107–206 m), die NACH dem „steht“ der Welt geschieht,
weil der Laub-Rand ein Wachstums-Zustand ist und kein Gesetz des Auges.

## (3) Das Gesetz des Eintritts-Horizonts — und warum die Zahl den Zeilen „folgt“

- Kein Schirm-Gesetz legt ihn: der Baum trägt keine Zeile in `LOD_SCHIRM.fehler` (`tree: je({})`, vegetation-streu.js:2892), sein
  `_wechselGesetz` fällt auf den Haushalt in Metern (`e = 0`, :2977–2978) [q]. Der Laub-Rand ist Meter: `_randSchirm("laub")` gibt
  trotz Namen fest `PERF_FOLIAGE_RADIUS_MAX` 240 [q dirigent-regler.js:269–271, :1986], gekappt an die Kante des aktiven Rings
  `(_activeRingRadius + 1) × span` [q :337–343], gewachsen um `PERF_FOLIAGE_GROW_STEP` 2,5 m je Takt [q :376, :1987]. Der Ring wächst
  erst nach dem Nachlauf und ohne Rückstau von Boden und Gras [q gelaende-boden.js:2893–2900]; unter dem Ladeschirm nur bis
  `RING_EXIST_FLOOR` 2 [q :2892, :3102]. Eintritt = `max(R, Laub-Rand − Saum)`, Saum 0–32 m aus dem Samen [q studio-bruecke.js:3426–3427,
  :3826]; Karten-Horizont `SCATTER.outerM` 384 − Saum [q :3424, siedlung-instanz.js:1251].
- Brennweite: f(360) = 360 / (2 tan 37,5°) = 234,6 px, f(1080) = 703,7 px [r; vegetation-streu.js:2982–2985]. Ein 15-m-Baum in 150 m:
  70,4 px bei 1080, 23,5 px bei 360 [r]. Aber der Schuss der Linse ist IMMER 1920 × 1080 [q werkbank.cjs:378] — die Zeilen ändern
  hier nicht die Pixel-Größe des Eintritts, sondern den Zustand der Welt beim Start des Gangs.
- Die Zahl folgt also nicht der Stufen-Wahl, sondern dem Laub-Rand am Start: 360-Welt (GTX, main) +1 Eintritt je Schritt in 154–207 m =
  der Saum-Eintritt bei Laub-Rand 216 (216 − 32 … 216) [q pop-roh + r]; 1080-Welt: Laub-Rand 129,6 m am Start, 13–96 Saaten je Schritt [m].
- **Warum** die 1080-Welt mit Ring 2 „steht“ und die 360-Welt nicht: UNGEMESSEN. Kandidaten an der Quelle: die vier Riegel von
  `_ringWaechst` (gelaende-boden.js:2895–2898: `_nachlauf`, gebauter Ring, `voxelMeshPending`, `pendingGrass`) und der Wachs-Schritt
  im Aktuator (dirigent-regler.js:376) — und `_weltSteht` fragt weder Ring < Ziel noch Laub-Rand < Ziel. Messname: nach `umstellen` in
  beiden Welten `eval` `_activeRingRadius · _nachlauf · voxelMeshPending.size · pendingGrass.size · foliageRadius`.

## (4) Größe beim Eintritt und die Blende

- Pixel-Höhe = Sichthöhe × 703,7 / Abstand [r aus m]: Bäume 25–232 px (277 Stück, Median 66, p10 40, p90 128; Fichte 232 px in 108 m),
  im Blick 30–189 px; Strauch 6–14 px, Fels 18–24 px, Feuerstelle 19–24 px [m]. Der größte Eintritt ist 232-mal das Soll von 1 px.
- Die Blende ist NICHT `lodCrossfadeMask` (die trägt nur L1 ↔ Karte, `_keepFin`, stoff-material.js:1371–1386), sondern `aEin`: die Rampe
  `(uLodTakt − aEin) / KARTEN_EINTRITT_TAKTE` gedithert (`_ditherIGN`), 32 Takte [q stoff-material.js:1395–1407, studio-bruecke.js:3829,
  siedlung-instanz.js:824–827]. Der Gang gibt je 0,5 m 12 Takte [q werkbank.cjs:394] → 37,5 % der Rampe je Schritt [r]; bei
  Kontrast Himmel–Baum C verschiebt ein Schritt die Luma um 0,375 × C — über 18 schon ab C = 48 [r]. Die Blende verteilt den Pop auf
  drei Schritte, sie senkt ihn nicht (Schritt 4: 16 390 px aus Karten, die in Schritt 3 eintraten [m]).

## (5) Was vorher an ihrer Stelle stand — die Lücke

- Vorher: **Himmel** (Schritt 3: 5 454 von 5 765 Pop-Pixeln in A Himmel [m]); Kamm-Krone 165 und Fern-Ring 126 px sind Rand [m].
- Eine LÜCKE, keine Doppelung: die Kamm-Krone beginnt erst bei `SCATTER.outerM` 384 m [q gelaende-fern.js:552]; zwischen Laub-Rand und
  384 m trägt nur der BODEN das Kronendach als Farbe (`_fernKroneOhneWald`: smoothstep(waldR, waldR + 30, d), waldR = Laub-Rand)
  [q gelaende-fern.js:1755–1766, :1704] — flach, ohne Umriss gegen den Himmel. Am Start des Gangs: Lücke 129,6 → 384 m; nach dem
  Wachsen: 216 → 384 m (168 m Grat ohne Umriss) [r]. Die Kamm-Krone liegt außer Scope (Preis-Schwarm, gelaende-fern.js).

## (6) Was ein wahrer Eintritt kostete [r]

- Karte ab 1 px: ein 15-m-Baum wird 1 px hoch in 15 × 703,7 = 10,6 km [r] — kein Eintritts-Rand der Saat kann das; unter 1 px kommt
  ein Ding nur über einen Träger, der denselben Umriss schon zeichnet (Kamm-Krone innen bis zum Laub-Rand) — außer Scope.
- Der Wald bis 216 m steht im DAUERZUSTAND ohnehin (360-Welt, alle gebuchten Bänder): +936 Einträge, die Karte 8 Dreiecke je Instanz
  (Gitter 2 × 2, stoff-karte.js:542–551, :2046) → +7,5 k Dreiecke, mit Wurf-Zwilling +15 k [r]; die GTX maß im Gang +30 k (349 154 →
  379 240) [q pop-roh], Befehle unverändert 94–99 [q, m 99]. VRAM: je Slot ~96 B (Matrix 64 + aKarte 16 + aEin 4 + Farbe 12) × 2
  (Bild + Wurf) × 936 ≈ 0,18 MB [r]. Haushalt `karten` 1 Befehl / 1 000 Dreiecke [q spec/profiband/haushalt.json:508–519] — 848 Karten ×
  8 = 6 784 Dreiecke [r]; ob die Regel Instanzen oder die Vorlage zählt, ist ungeprüft.
- Neu ist nur der ORT der Kosten: die Saat zieht aus dem Gang vor das erste Bild (Ankunft B). Platzieren gedockter Karten: 197 Plätze in
  2,5 ms (vegetation-baum.js:3272–3274) → 936 ≈ 12 ms [r]; Saat, Wald-Plan und Atlas-Bake der Ringe 3–4 ungemessen.

## Die Wurzel in einem Satz

Der Laub-Rand — und mit ihm der Eintritt jedes Wurfs des Felds — ist ein Wachstums-Zustand (Ring-Rampe ab Ring 2, +2,5 m je Takt,
dirigent-regler.js:337–376 · gelaende-boden.js:2887–2901), kein Gesetz des Auges: die Welt meldet „steht“ mit dem Wald bis 129,6 m, und
der Wald der Ringe 3–4 tritt danach in 107–206 m als 25–232 px hohe Karte vor den Himmel.

## Der Schnitt-Vorschlag (EINER)

**Der Laub-Rand steht mit dem Weltbild.** Unter dem Ladeschirm gilt für den Laub-Rand der Ziel-Ring (`chunkRingRadius`), nicht
`RING_EXIST_FLOOR`: `_nexusPerfActuate` setzt `foliageRadius` = `_randSchirm("laub")` gekappt an `(chunkRingRadius + 1) × span`, und
das Weltbild wartet auf die Saat bis dorthin (`_weltbildLuecken`).
- Dateien: stamm/dirigent-regler.js (:332–376 Laub-Rand), stamm/gelaende-boden.js (:2887–2901, der Boden-Ring bis zum Laub-Rand vor dem
  Bild), stamm/dirigent-ankunft.js (`_weltbildLuecken`: „Wald bis zum Laub-Rand“).
- Was stirbt: `PERF_FOLIAGE_GROW_STEP` und das Wachsen des Laub-Rands nach dem Bild (:376, :1987), `PERF_FOLIAGE_RADIUS_MIN` als
  Start, die Kappe des Laub-Rands an `_activeRingRadius` (:337–343) — kein Rückfall, kein Schalter.
- Annahme: `gate:pop` in der 1080-Welt (WERKBANK_FENSTER=1920x1080) ≤ 0,0565 % (der Dauerzustand der 360-Welt, GTX) und ≤ main gleicher
  Art (Z2); Laub-Rand am Start = 216 m und 0 neue Saaten je Schritt im Blick; VRAM und Heap ≤ main nach dem Gang; Ankunft (B) gemessen
  vorher ↔ nachher, ihr Zuwachs steht als Kosten-Zeile im Bericht. Der Rest-Pop (Saum-Eintritt bei 184–216 m, ~1 Karte je Schritt)
  bleibt über 0,05 % ROT und ist das Ziel des Trägers (Kamm-Krone bis zum Laub-Rand) — außer Scope dieser Welle.
- Leser-Liste: `_laubRand` (dirigent-regler.js:276) → `_archKartenHorizont` (studio-bruecke.js:3421), `_foliageChunkInRadius`,
  `_fernKroneOhneWald` (gelaende-fern.js:1704, nur Leser), die Streu (`_scatterRegion`), `_weltbildLuecken`, gate:pop, gate:ankunft,
  gate:regler-sim (der Aktuator), die Kamm-Krone (Grenze der Fern-Krone).

## Ehrlich offen

- Warum die 360-Welt ihren Wald vor dem Gang trug und die 1080-Welt nicht (Abschnitt 3, Messname dort) — ungemessen.
- Der Laub-Rand stand nach `umstellen` gleich dem Boot-Ring; ob der SPIELER nach jeder Ankunft dasselbe Wachsen sieht (Ring 2 → 4 nach
  dem Nachlauf), folgt aus der Quelle (gelaende-boden.js:2880–2886), ist aber nicht im echten Fenster geschossen.
- Die Linse nennt Einträge ohne Blick-Kegel und Pixel ohne Klasse (werkbank.cjs:422–426); die Sonde dieses Befunds (Klasse ab je Schritt)
  ist der Weg, sie beim Namen zu machen — nicht gebaut.
- Zeit: keine (Bild-Lauf, keine ms-Aussage).
