# (a) SONNE · HIMMEL · MOND · STERNE · TAG-ACHSE — Zensus-Blatt

Stand: Arbeitsbaum `strahler-leuchte` = 2ce8a033d. Nur gelesen. Mit „gerechnet“ markierte Zahlen habe ich aus den Konstanten im Baum
nachgerechnet, sie stehen so nicht im Code.

## 0. Kernantwort: in welcher Einheit trägt die Welt Sonne, Himmel und Mond?

- **Sonne + Himmel:** in der „Welt-Einheit“ = Bestrahlung im three-r184-Sinn (DirectionalLight.intensity, BRDF mit 1/π), ohne
  physikalischen Maßstab. Ihr Betrag kommt aus `E0 = KEY_BASE · π · lightIntensity` = 2,6 · π = **8,168** (welt-licht.js:49, :53,
  :788-790). Der Durchlass (Hillaire, foundry-core.js:359-399) und die Tafeln (Himmel je Einheit E0, welt-licht.js:559-700)
  sind physikalisch. Der Betrag 2,6 ist ein r128-Studio-Wert (welt-licht.js:47-49), keine Lux-Größe.
- **Mond:** dieselbe Welt-Einheit, aber eine eigene, gesetzte Stärke `MOND_STAERKE` **0,65** (welt-licht.js:169). Ihr Anker ist
  ein Bild-Maß („Boden Luma ≥ 22“, Radeon, :200-202) und kein Lux-Wert. Das Mondlicht hat keine Phase: es ist immer Vollmond
  (welt-licht.js:813-817).
- **Sterne, Dämmerung, Ambient, Hemi:** Welt-Einheit. Sterne und Dämmerung sind linear als Bruchteil von `MOND_E` gesetzt
  (:225-226). Ambient und Hemi sind feste Stellwerte (bild-himmel.js:2251, :2492).
- **Lux** kommen nur über die Skala S zurück (welt-licht.js:84-115). Ein Wert der Welt wird dabei mit zwei Einheiten gelesen:
  Der Tag zählt linear (1 Welt-Einheit = 115 000 / 7,83 = **14 687 lx**, gerechnet), der Rest der Nacht über S⁻¹ (Exponent 1/p = 5).

**Wo aus 385 000 : 1 das Verhältnis 13,1 : 1 wird.** Es gibt keine Stelle, die die Stauchung rechnet. Sie entsteht aus zwei
gesetzten Stärken, und die Skala S beschreibt sie erst danach:
1. welt-licht.js:49 `KEY_BASE = 2.6` (gesetzt, r128-Rig) × welt-licht.js:53 `LEGACY_LICHT = π` → welt-licht.js:788-790 `e0()`
   → bild-himmel.js:1505-1507 `_atmoE0` → bild-himmel.js:1621-1622 `U.licht` (Himmel = Tafel × E0, welt-licht.js:914) und
   bild-himmel.js:1889 (Richtlicht Sonne = KEY_BASE · π · a.lum · lightIntensity · direkt).
2. welt-licht.js:169 `MOND_STAERKE = 0.65` (gesetzt) → welt-licht.js:203-208 `MOONLIGHT.intensity` → bild-himmel.js:1897
   (Richtlicht Mond = 0,65 · lightMul · direkt · `_mondDurchlass`) und bild-himmel.js:1624-1625 `U.mondE = 0,65 · lightMul / E0`
   (der Mond in der Tafel, also sein Himmel). Direkt ist das 8,168 / 0,65 = **12,6 : 1** bei gleicher Höhe (gerechnet). Dazu kommt
   der Ton: Luma des Mondtons 0x9fb8dc roh = 0,711 (foundry-core.js:312, welt-licht.js:172 → MOND_E = 0,462).
3. Die Ersatz-Lichter der Nacht heben den Nenner: Ambient 0,04 · nacht (bild-himmel.js:2251), Hemi 0,1 · nacht · luma(0x0d1931)
   ≈ 0,0095 (bild-himmel.js:2492, gerechnet) und Sternenlicht ≈ 0,0006 (welt-licht.js:225, gerechnet).
4. Die Summe bildet der EINE Lichtmesser `_waagrechtIrradianz` (bild-himmel.js:2186-2229): mittags 7,83 (Sonne 6,39 + Himmel
   1,44), in der Vollmond-Nacht 0,598. Beide Zahlen stehen nur im Kommentar welt-licht.js:56-57 und sind gemessen mit
   `werkbank licht`. Ihr Quotient ist **13,1 : 1**. Gerechnete Zerlegung der Nacht: Mond direkt ≈ 0,44 bei 74,2° + Mondhimmel ≈ 0,09–0,12
   + Ambient 0,04 + Hemi 0,0095.
5. welt-licht.js:84-94 `AUGE`: Mit `welt` 7,83 (:89, die gemessene Zahl als Konstante kopiert) und `lux` 115 000 (:90, ohne Quelle)
   wird `p` 0,2 (:85) aus ln 13,1 / ln 385 000 abgeleitet (:57-58). „385 000“ steht nirgends als Zahl im Code. Gerechnet ist es
   115 000 / 0,2987 lx, und 0,2987 lx ist genau das Urbild S⁻¹(0,598). Der Anker ist damit zirkulär: Das ehrliche Verhältnis
   folgt aus der Welt-Zahl und nicht umgekehrt.

Hätte der Mond das physikalische Verhältnis, wäre `MOND_STAERKE` ≈ 8,168 / 385 000 ≈ 2,1·10⁻⁵ (gerechnet).

## 1. TAFEL DER GRÖSSEN

Format: Name · Wert · Einheit · Anker · Definition · Leser · FOLGT/GESETZT

**Sonne und Licht des Tags**
- S1 `KEY_BASE` · 2,6 · Stellwert ohne Einheit · gesetzt (r128-Studio-Rig, „Mittag ≈ 2.6·0.913“) · welt-licht.js:49 · welt-licht.js:783, :789; bild-himmel.js:1889 (über AnazhRealm.KEY_BASE bild-himmel.js:3387) · GESETZT
- S2 `LEGACY_LICHT` · π · Faktor · three r155 (BRDF 1/π, Vendor-Konvention) · welt-licht.js:53 · welt-licht.js:783, :789; bild-himmel.js:1889, :2092; worlds/fachwerk/fachwerk.js:658 · FOLGT (Konvention)
- S3 `E0` · 8,168 · lightIntensity · Welt-Einheit · aus S1·S2 · welt-licht.js:788-790 · bild-himmel.js:1506, :1621-1628; welt-licht.js:1230 · FOLGT
- S4 `lightMul` = WX_LICHT.sockel 0,35 + sonne 0,65 · sun · Faktor · gesetzt (phyto-core) · phyto-core.js:4302 → stamm/daten.js:25 · bild-himmel.js:1212, :1624, :1897, :2492, :2612 · GESETZT
- S5 Gefühls-Faktoren auf `lightIntensity` (joy · 0,15, sorrow · 0,2, × auraK 0,3) · Faktor · gesetzt · bild-himmel.js:1219, :1259, :1267 · E0 bild-himmel.js:1506 (die Sonne, nie der Mond: :1624 liest lightMul) · GESETZT

**Die EINE Atmosphäre (foundry-core `ATMO_GESETZ`)**
- A1 `erdeM` / `randM` · 6 360 / 6 460 km · m · Bruneton/Hillaire · foundry-core.js:291 · foundry-core.js:343-344 · FOLGT (Physik)
- A2 `rayleighH` · 8 000 · m · Physik · foundry-core.js:292 · foundry-core.js:327 · FOLGT
- A3 `rayleighTiefe` · [0,044 0,1 0,23] · optische Tiefe · Bucholtz 1995 · foundry-core.js:293 · foundry-core.js:329, :346; bild-himmel.js:1416 (Gesetz der Welt) · FOLGT
- A4 `wellenNm` · [680 550 440] · nm · Physik · foundry-core.js:294 · foundry-core.js:336-341 · FOLGT
- A5 `mieG` · 0,7 · ohne Einheit · AERONET (Dubovik 2002) · foundry-core.js:299 · foundry-core.js:350 · FOLGT
- A6 `mieAngstroem` · 1,3 · ohne Einheit · AERONET · foundry-core.js:300 · foundry-core.js:337, :340 · FOLGT
- A7 `mieAlbedo` · 0,9 · ohne Einheit · ohne Zitat (Hillaire-Vorgabe implizit) · foundry-core.js:301 · foundry-core.js:340 · GESETZT, Anker implizit
- A8 `ozon` · Mitte 25 km, halb 15 km, Absorption [0,65 1,881 0,085]·10⁻⁶ · 1/m · Hillaire implizit · foundry-core.js:302 · foundry-core.js:351-355, :376 · FOLGT
- A9 `luft.sichtKlarM` · 20 000 · m · Beobachtung · foundry-core.js:305 · foundry-core.js:324; bild-himmel.js:2274 · FOLGT
- A10 `luft.sichtSturmM` · 1 500 · m · Beobachtung · foundry-core.js:305 · bild-himmel.js:2275 · FOLGT
- A11 `luft.betaRayleigh` · 1,16·10⁻⁵ · 1/m · Physik · foundry-core.js:305 · foundry-core.js:328, :334 · FOLGT
- A12 `luft.kontrast` · 0,02 · ohne Einheit · Koschmieder · foundry-core.js:305 · foundry-core.js:324 · FOLGT
- A13 `luft.skalenHoeheM` · 1 000 · m · „Grenzschicht“ · foundry-core.js:305 · foundry-core.js:347 · FOLGT
- A14 `durchlassSchritte` · 40 · Schritte · Stellwert der Rechnung · foundry-core.js:313 · welt-licht.js:34; bild-himmel.js:1438 · GESETZT (Auflösung)

**Die Nacht im Gesetz (`ATMO_GESETZ.nacht`)**
- N1 `nacht.skala` · 0,16 · sin der Höhe · gesetzt · foundry-core.js:312 · foundry-core.js:390 (Farbe des Richtlichts unter dem Horizont, bild-himmel.js:1894) · GESETZT
- N2 `nacht.lum` · 0,06 · ohne Einheit · gesetzt · foundry-core.js:312 · foundry-core.js:397. In der Welt **ungelesen**: `.lum` wird nur bei Sonne ≥ 0 gelesen (bild-himmel.js:1885-1889, welt-licht.js:781 bei e = 1), dort ist night = 0. Gelesen nur im Labor worlds/terrain/phytogenesis.js:3487 · GESETZT
- N3 `nacht.mond` · 0x9fb8dc (roh als linear) · Ton · „Purkinje“ ohne Messung · foundry-core.js:312 · welt-licht.js:172, :204-206; foundry-core.js:393-395 · GESETZT
- N4 `nacht.himmel` · 0x0d1931 · Ton · „0x0a1326 × 1,3, geeicht an der Nacht vor D3“ (Look) · foundry-core.js:312 · welt-licht.js:228 (nur Ton), bild-himmel.js:2467-2470 (Farbe des Hemi) · GESETZT
- N5 `nacht.glutHoeheM` · 90 000 · m · Airglow-Schicht (Physik, ohne Zitat) · foundry-core.js:312 · welt-licht.js:611 · FOLGT

**Boden der Atmosphäre**
- B1 `ATMO_BODEN` · [0,1003 0,1385 0,0449] · Albedo linear · Messung (spec/farbe/albedo-tafel.json) · welt-licht.js:39 · welt-licht.js:780, :1214; bild-himmel.js:1428 · FOLGT
- B2 `ATMO_ERDE` · Luma von B1 · Albedo · aus B1 · welt-licht.js:44-46 · welt-licht.js:311 · FOLGT

**Mond**
- M1 `MOND_STAERKE` · 0,65 · Welt-Einheit · Bild-Messung („Boden Luma ≥ 22“, Radeon), kein Lichtmaß · welt-licht.js:169 · welt-licht.js:172, :207 → bild-himmel.js:1624, :1897; welt-licht.js:1232 · GESETZT
- M2 `MOND_E` · 0,462 · Welt-Einheit · aus M1 · luma(N3) · welt-licht.js:172 · welt-licht.js:180, :225, :226 · FOLGT
- M3 `mondRichtung` = −Sonne (immer Vollmond) · Richtung · gesetzt · welt-licht.js:815-817 · bild-himmel.js:1150 (eigene Kopie `sunDir.clone().negate()`), :2619; welt-licht.js:1217 · GESETZT. Eine Phase gibt es nicht (gesucht: mondphase, moonphase, lunar, synodisch → nicht gefunden).
- M4 `U.mondE` · 0,65 · lightMul / E0 · Ton · in E0 · aus M1 · bild-himmel.js:1623-1625 · welt-licht.js:650, :915, :1115 · FOLGT
- M5 `_mondDurchlass` · Luma-Durchlass / Zenit · Faktor · Hillaire · bild-himmel.js:1798-1807 · bild-himmel.js:1897 · FOLGT

**Sternenlicht und Dämmerlicht**
- ST1 `STERNENLICHT.leuchtdichte` · MOND_E · 0,0005 / 0,3965 / π = 1,85·10⁻⁴ (gerechnet) · Welt-Leuchtdichte · USNO Circular 171 über die REF. Die zwei Zahlen sind von Hand kopiert, die REF-Datei selbst liest hier keiner · welt-licht.js:225 · welt-licht.js:239 → bild-himmel.js:1515-1520 → :1628 `U.nachtE`; welt-licht.js:1234-1237 · FOLGT (linear aus M2)
- ST2 `STERNENLICHT.daemmer` · MOND_E / π = 0,147 · Welt-Leuchtdichte · gesetzt: „am Ende der bürgerlichen Dämmerung so viel wie der Vollmond“. Die REF sagt 3,01 lx bei −6° = 7,6 × Vollmond · welt-licht.js:226, :233-235 · welt-licht.js:239 · GESETZT
- ST3 `DAEMMER_ENDE` · tagAchse(sin −6°).daemmerung · ohne Einheit · aus T2 · welt-licht.js:236 · welt-licht.js:239 · FOLGT

**Tag-Achse und Bahn**
- T1 `sonnenRichtung` (z = sin(w/2) · 0,4; Mittag 74,2°) · Richtung · gesetzt. Die Meeus-Bahn steht laut Kommentar „OFFEN“ (welt-licht.js:797-805) · welt-licht.js:806-812 · bild-himmel.js:1376-1378; welt-licht.js:1216 · GESETZT
- T2 `GRENZGROESSE` · [10 −5] [2 −4,5] [0 −3] [−6 1,5] [−12 4] [−18 6] · Grad, Größenklasse · Dämmerungs-Definitionen (Physik). Die drei Tag-Knoten sind gesetzt · welt-licht.js:187-196 · welt-licht.js:823-835; bild-himmel.js:3340 · GESETZT (teilweise)
- T3 `tagAchse.nacht` (smoothstep s / sin −6°) · 0…1 · bürgerliche Dämmerung · welt-licht.js:844, :853 · bild-himmel.js:1396, :2251, :2492; welt-licht.js:239; stamm/klang.js:2066 · FOLGT
- T4 `tagAchse.tag` (linear h von `nachtGrad` −32° bis 0°) · 0…1 · gesetzt (die astronomische Nacht liegt bei −18°) · welt-licht.js:182, :851 · bild-himmel.js:1904 (nightFactor der Post-Kette) · GESETZT
- T5 `tagAchse.hell` · 0,045 + 0,955 · smoothstep((s + 0,18) / 0,6) · relativ · gesetzt · welt-licht.js:838, :854 · bild-himmel.js:2624-2625 · GESETZT
- T6 `tagAchse.daemmerung` · aus T2 · 0…1 · FOLGT · welt-licht.js:850 · welt-licht.js:238, :1219

**Ersatz-Lichter der Nacht**
- E1 Ambient · 0,04 · nacht · Welt-Einheit · Bild-Messung (Wand 3 : 1) · bild-himmel.js:2251 · bild-himmel.js:2228 (Messer), alle Stoffe (three) · GESETZT
- E2 Ambient-Gefühl · +0,08 joy, +0,05 awe, −0,04 sorrow · Welt-Einheit · gesetzt · bild-himmel.js:2252; stamm/dirigent-kern.js:1572-1589 (additiv, **auch am Tag**: nicht mit `nacht` gewichtet) · GESETZT
- E3 Hemi · 0,1 · nacht · lightMul, Farbe N4 × Tönung · Welt-Einheit · gesetzt · bild-himmel.js:2492 · bild-himmel.js:2227 · GESETZT
- E4 Hemi-Boden · 0x463c2e · Ton · „Vorlagen-Hemi phytogenesis“ · bild-himmel.js:2471 · bild-himmel.js:2489 · GESETZT

**Die Skala des Auges**
- AU1 `AUGE.welt` · 7,83 · Welt-Einheit · Messung (`werkbank licht --uhr 0.5`), als Konstante kopiert und nicht aus S1–S3 abgeleitet · welt-licht.js:89 · welt-licht.js:94, :105; stamm/dirigent-kern.js:1619; stamm/stoff-material.js:714; worlds/fachwerk/fachwerk.js:666 · GESETZT (Mess-Kopie)
- AU2 `AUGE.lux` · 115 000 · lx · ohne Quelle („Mittag der Mess-Wiese“). Die REF bei 74,2° wäre ≈ 117 170 lx (gerechnet, linear zwischen 60° und 75°) · welt-licht.js:90 · welt-licht.js:94, :105 · GESETZT
- AU3 `AUGE.p` · 0,2 · ohne Einheit · aus ln 13,1 / ln 385 000 (Kommentar), also aus AU1 und der Nacht 0,598 · welt-licht.js:85 · welt-licht.js:94, :105 · FOLGT (zirkulär)
- AU4 `MESOPISCH` · staebchenCd 0,005 · zapfenCd 5 · karte 0,18 → `zustandMinLux` 0,0873 · cd/m², lx · CIE 191:2010 · welt-licht.js:83, :88 · welt-licht.js:117; stamm/bild-kosten.js:3009-3018 · FOLGT
- AU5 `NACHT_AUGE.luxJeEinheit` · 0,26 / 0,224 = 1,161 · lx (cd/m²) je Welt-Einheit, LINEAR · Vollmond 0,26 lx ≙ Nacht-Bestrahlung 0,224. Das ist der Stand vor w28-nacht-licht, heute ist die Nacht 0,598 · stamm/bild-kosten.js:3011 · stamm/bild-kosten.js:2211 · GESETZT (veraltet)
- AU6 `BELICHTUNG.nachtKnotenE` · = MOND_E 0,462 · Welt-Einheit · aus M2 · welt-licht.js:180 · welt-licht.js:772 · FOLGT

**Körper am Himmel und Sterne**
- K1 `HIMMEL.sonneLeucht` · 4 · lightMul, Farbe (1, 0,92, 0,7) fest · Welt-Leuchtdichte (Stellwert) · gesetzt („über dem Hof ≈ 2,6“) · bild-himmel.js:3355, :2612-2613 · Sonnen-Mesh · GESETZT
- K2 `HIMMEL.sonneWinkelGrad` · 0,53 · ° · Physik · bild-himmel.js:3354 · stamm/dirigent-ankunft.js:323 · FOLGT
- K3 `HIMMEL.koerperAbstandM` · 380 · m · gesetzt (Geometrie) · bild-himmel.js:3353 · bild-himmel.js:2596; stamm/dirigent-ankunft.js:323 · GESETZT
- K4 Mondscheibe · Radius 9 m (aus 380 m = 2,71°, echt 0,52°; gerechnet) · Farbe 0xd0d4e0 · Deckung 0,9 / 0,98 · gesetzt · stamm/dirigent-ankunft.js:339-347; bild-himmel.js:2625 · Mond-Mesh · GESETZT
- K5 `HIMMEL.mondGegenHimmel` · 0,5 · Verhältnis · „≈ 2 500 : 5 000 cd/m²“ ohne Zitat · bild-himmel.js:3349 · bild-himmel.js:2625 · FOLGT (Anker ohne Quelle)
- K6 `sternMagSchwach` · 6 · Größenklasse · Physik (bloßes Auge) · bild-himmel.js:3341 · bild-himmel.js:3361 · FOLGT
- K7 `sternZaehlung` · 0,47 · d log N / dm · Sternzählung · bild-himmel.js:3342 · bild-himmel.js:3361 · FOLGT
- K8 `sternKontrast` · 0,6 · ohne Einheit · gesetzt · bild-himmel.js:3343 · bild-himmel.js:410 · GESETZT
- K9 Sternfeld · 2 800 Punkte · 3–6,5 px · Töne warm/kühl · Helligkeit = Alpha × skyMul, **ohne Lichtmaß** · gesetzt · bild-himmel.js:318-376, :386, :411, :1789 · GESETZT
- K10 `wandelsterne` · −4,2 / −2,3 / −1,0 · Größenklasse · Physik (Venus, Jupiter, Mars) · bild-himmel.js:3344-3348 · bild-himmel.js:317, :375, :3365 · FOLGT

**Referenz**
- R1 spec/farbe/tag-ref.json · 16 Zeilen Sonnenhöhe → lx (USNO Circular 171) · lx · Messung · spec/farbe/tag-ref.json · nur die Linse scripts/lib/licht-linsen.cjs:1228, :1320. **Die Welt liest sie nicht.** Kopiert sind 0,0005 und 0,3965 (welt-licht.js:225) sowie die Stufen −0,87 / −2,17 (welt-licht.js:179) · Anker

## 2. DIE RECHENWEGE

W1 **Sonne direkt (Richtlicht).** ATMO_RECHNUNG.sonne (foundry-core.js:386-399; Durchlass :359-385, km und 1/km) → `_atmoSonne`
(bild-himmel.js:1436-1440, an der Höhe des Spielers :1487-1493) → dl.color = col, dl.intensity = KEY_BASE · π · lum ·
lightIntensity · direkt (bild-himmel.js:1886-1889). Einheit: Durchlass (rein) × E0 (Welt-Einheit). Die Einheit bricht bei KEY_BASE:
Ab hier gibt es keinen Lux-Bezug mehr.

W2 **Himmel der Sonne (Tafeln).** Hillaire-Marsch je Einheit E0 (welt-licht.js:564-634) → Himmels-Sicht (:635-653), Umgebung
(:668), Bestrahlungs-Tafel (:676-700) → Rücklesung `tafelAusPixeln` (:883-889) → `bestrahlung` (:898-919): so = licht · Tönung · Tafel
an der Sonnenhöhe. Kuppel, Umgebung und Stoffe lesen `umgebungLicht` (:934 ff.) mit E0 · Tönung. Einheit: physikalisch je E0, dann ×
E0 in der Welt-Einheit. Der Anteil `so` geht als „Tag“ in den Messer ein (bild-himmel.js:2209, :2226).

W3 **Mond direkt.** dl.intensity = 0,65 · lightMul · direkt · `_mondDurchlass(md.y)` (bild-himmel.js:1897, :1798-1807); der Ton ist
atm.col, unter dem Horizont mit `nacht.skala` zum Mondton gelerpt (foundry-core.js:390-396). Einheit: Welt-Einheit aus M1, gesetzt.

W4 **Himmel des Mondes.** `U.mondE` = MOONLIGHT · lightMul / E0 (bild-himmel.js:1623-1625) als zweite Quelle im Marsch
(welt-licht.js:650) und in der CPU-Bestrahlung (welt-licht.js:915: m · Tafel an der Mondhöhe). Einheit: Bruchteil von E0.
Physikalisch derselbe Streuweg wie bei der Sonne, nur der Betrag kommt aus M1.

W5 **Sternenlicht und Dämmerlicht.** `nachtHimmel(achse)` (welt-licht.js:237-240) = ST1 · (1 − Dämmerung) + ST2 · nacht ·
min(1, d / DAEMMER_ENDE) → `_atmoSternenLicht` (bild-himmel.js:1513-1521) → `U.nachtE` / E0 (:1628) → Marsch mit van Rhijn
(welt-licht.js:610-614) und letzter Texel der Bestrahlungs-Tafel (:678, :915). Einheit: Welt-Leuchtdichte, LINEAR als Bruchteil
von MOND_E, nicht auf S.

W6 **Ambient und Hemi der Nacht.** Ambient = 0,04 · nacht + Gefühl (bild-himmel.js:2251-2252); Hemi = 0,1 · nacht · lightMul mit
dem Ton N4 und dem Boden E4 (:2467-2492). Einheit: three-Intensität, gesetzt. Kein Lichtweg dahinter, sie sind Stellwerte.

W7 **Der Lichtmesser.** `_waagrechtIrradianz` (bild-himmel.js:2186-2229): Richtlicht · Horizont-Sicht (:2203) + Tafel-Himmel
(:2211-2225) + Hemi (:2227) + Ambient (:2228) → rgb in der Welt-Einheit. `_belichtungTag` = Luma der Sonne + Luma des
Sonnen-Himmels (:2209, :2226). Leser: die Kamera (:1948-1966) und der Licht-Takt (stamm/dirigent-kern.js:1611-1619).

W8 **Skala S (Welt → Lux → Bild).** `augeLux(welt, tag)` (welt-licht.js:102-106) = 115 000 · tag / 7,83 (linear) + 115 000 ·
((welt − tag) / 7,83)^5 (über S⁻¹). `augeMass` (:112-115) = welt / S(augeLux): Nacht 1, Mittag 1, Sonne 0° = 0,019 (Kommentar :109).
Gelesen von stamm/dirigent-kern.js:1614-1623 (lichtAuge, Glut, Lava) und bild-himmel.js:1957-1959 (das Becken im Messer). Die
Einheit bricht hier zweimal: Lux → Welt-Einheit hat je Glied eine andere Funktion, und eine Welt-Einheit ist am Tag 14 687 lx,
in der Nacht 0,598 ≙ 0,2987 lx (gerechnet).

W9 **Die Kamera der Nacht.** `belichtung` (welt-licht.js:769-774): Der Messer liest nie unter `nachtKnotenE` = MOND_E · smoothstep
(Boden). Einheit: Welt-Einheit. Übergabe an die Kamera-Domäne.

W10 **Das Nacht-Auge der Post-Kette.** nightFactor = 1 − tag (bild-himmel.js:1904) und `_nachtAuge` (stamm/bild-kosten.js:2205-2215):
Leuchtdichte × `luxJeEinheit` 1,161 → cd/m² gegen das mesopische Band. Einheit: eine dritte, lineare Skala Welt → cd/m².

W11 **Sonnen- und Mondscheibe.** Sonne: L = 4 · lightMul · (1, 0,92, 0,7) (bild-himmel.js:2612-2613). Die Farbe folgt nicht dem
Durchlass. Mond: 0xd0d4e0, Deckung 0,98 / (1 + hell / 0,5) (stamm/dirigent-ankunft.js:341-347, bild-himmel.js:2625). Einheit: Bild-Stellwert.

W12 **Sterne.** Größenklasse je Punkt (bild-himmel.js:368, `_sternMag` :3359-3362) gegen die Grenzgröße der Tag-Achse
(:404-411, :1790) → Alpha × skyMul. Einheit: Größenklasse wird zu Alpha, ohne Bezug zu ST1 (das Licht der Sterne im Himmel) und
ohne Lux.

Kopien: Die **Bühne der Studios** (welt-licht.js:1202-1305) rechnet W1, W2, W4 und W5 mit e0(1) nach. Sie ist ein eigener Rufer
derselben Funktionen und kein Zwilling.

## 3. ZWILLINGE UND BRÜCHE

Z1 **Fünf Lux-Werte für denselben Vollmond.** 0,26 lx (welt-licht.js:59; stamm/bild-kosten.js:2996, :3011) · 0,18 lx
(welt-licht.js:68, gemessene Umgebung an der Gasse) · 0,3965 lx (welt-licht.js:212, :225) · 0,397 lx (spec/farbe/tag-ref.json Zeile −90,
mit Nachthimmel) · 0,2987 lx, das Urbild von 0,598 unter S und damit implizit in „385 000“ (welt-licht.js:57, gerechnet). Dazu zwei
Verhältnisse für dasselbe: „385 000 : 1“ (:57) und „1/400 000“ (:232).

Z2 **Die Stauchung ist gesetzt, nicht gerechnet.** KEY_BASE 2,6 (welt-licht.js:49, r128-Rig) gegen MOND_STAERKE 0,65
(welt-licht.js:169, Bild-Luma) erzeugen 13,1 : 1. Das AUGE nimmt beide gemessenen Summen als Konstanten (:89) bzw. als Kommentar
(0,598, :57) und leitet p daraus ab (:85, zirkulär). `AUGE.welt` 7,83 ist eine Mess-Kopie ohne Verbindung zu E0: Ändert sich
KEY_BASE, das Medium oder der Ersatz, bleibt S stehen.

Z3 **Zwei Einheiten in EINER Zahl.** `_waagrechtIrradianz` (bild-himmel.js:2186-2229) summiert den linearen Tag und die
Ersatz-Lichter auf S. `augeLux` trennt beide über `tag` wieder (welt-licht.js:102-106), die Kamera (`belichtung` :769-774) liest die
gemischte Summe als eine Größe. `augeMass` fällt zwischen Mittag und Nacht auf 0,019 (Sonne 0°, :109): Die Skala ist über den Tag
kein einziges Gesetz.

Z4 **Sternen- und Dämmerlicht stehen nicht auf S**, entgegen welt-licht.js:58. ST1 ist linear 1/793 des Mondes: Bestrahlung
π · 1,85·10⁻⁴ = 5,8·10⁻⁴, auf S wäre 0,0005 lx dagegen S(0,0005) = 0,167 (gerechnet, Faktor ≈ 290). ST2 setzt das Dämmerlicht bei
−6° gleich dem Mond (Bestrahlung ≈ 0,46). Die REF gibt 3,01 lx, und S(3,01) = 0,95 (gerechnet).

Z5 **Eine dritte Skala im Nacht-Auge.** `NACHT_AUGE.luxJeEinheit` = 0,26 / 0,224 (stamm/bild-kosten.js:3011) ist LINEAR mit
1,161 lx je Einheit und auf der Nacht 0,224 vor w28-nacht-licht geeicht. Unter S trägt die Nacht 0,58 ≙ 0,26 lx, also 0,45 lx je
Einheit (gerechnet).

Z6 **Die REF ist nur Text.** spec/farbe/tag-ref.json liest die Welt nicht, nur die Linse (scripts/lib/licht-linsen.cjs:1228, :1320).
Die Welt trägt Handkopien (welt-licht.js:179, :225). `AUGE.lux` 115 000 liegt 1,9 % unter der REF bei 74,2° (gerechnet). Bei Sonne
10,8° trägt die Welt 0,508 Einheiten ≙ 7 460 lx (welt-licht.js:99-100), die REF ≈ 12 500 lx (gerechnet), also −40 %.

Z7 **Mond ohne Phase und ohne eigene Bahn.** welt-licht.js:815 setzt immer Vollmond gegenüber der Sonne. Die Sonnenbahn trägt die
gesetzte Neigung z · 0,4 (:809). Meeus steht als „OFFEN“ im Kommentar (:797-805).

Z8 **Zwei Mondfarben und zwei Mondgrößen.** Licht 0x9fb8dc (foundry-core.js:312) gegen Scheibe 0xd0d4e0
(stamm/dirigent-ankunft.js:343). Die Sonnenscheibe hat den echten Winkel 0,53° (K2), die Mondscheibe 2,71° (9 m auf 380 m,
stamm/dirigent-ankunft.js:339).

Z9 **Die Sonnenscheibe folgt dem Durchlass nicht.** Ihre Farbe ist fest (1, 0,92, 0,7) × 4 (bild-himmel.js:2613), während Richtlicht
und Wolken `atm.col` lesen (:1886, :1921).

Z10 **Gefühl ändert Sonne und Mond ungleich, und Ambient auch am Tag.** E0 trägt lightIntensity mit joy und sorrow
(bild-himmel.js:1259, :1267, :1506), der Mond nur lightMul (:1624, :1897). Das Ambient addiert +0,08 · joy ohne Gewicht `nacht`
(:2252, stamm/dirigent-kern.js:1580-1582): ein Ersatz-Licht am Mittag.

Z11 **`nacht.lum` 0,06 ist in der Welt ungelesen** (foundry-core.js:397, siehe N2). Das Labor phytogenesis liest es als
Schlüssellicht der Nacht (worlds/terrain/phytogenesis.js:3487, 2,65 / 3,13 · atm.lum). Das ist ein Sonnen-Zwilling mit eigener
Basis neben KEY_BASE 2,6, mit Hemi 0,78 · (0,1 + 0,9 · lum) (:3490) und Rim/Fill/Back (:3496-3498).

Z12 **Das Fachwerk-Labor ruft augeLux ohne das Glied des Tags.** worlds/fachwerk/fachwerk.js:666 übergibt `augeLux(AUGE.welt ·
Σ/Σmittag)` mit tag = 0, also den ganzen Tag über S⁻¹. Genau das nennt welt-licht.js:98-101 als behobenen Fehler der Welt. Dazu
kommt der Zeitplan ZEIT mittag/morgen/abend/nacht (i 2,1 / 1,7 / 1,45 / 0,32, fachwerk.js:661-664, fachwerk-core `ZEIT_GESETZ`).
Gerechnet: Die Labor-Nacht steht bei ≈ 41 lx, der Morgen bei ≈ 52 000 lx.

Z13 **Klammern, Böden und Deckel im Lichtweg.**
- `nachtKnotenE` als Boden des Messers (welt-licht.js:772)
- `BELICHTUNG.min` 0,05 (:773)
- `zustandMinLux` als Boden der Umgebung (:117)
- Wasser-Licht `Math.max(0.22, dl.intensity)` (bild-himmel.js:2566): ein Licht-Boden des Wassers, das am Tag die Sonne trägt und nachts nie unter 0,22 fällt
- `lum` max 1e-4 (foundry-core.js:388)
- `_atmoE0` max 0 und E0 max 1e-6 (bild-himmel.js:1624, :1628)

Z14 **Zwei Quellen für die Himmelsbestrahlung.** Die synchrone Tafel (`_himmelsBestrahlung`, bild-himmel.js:1715-1724) speist Messer
und Kamera. Die zurückgelesene Umgebung (`_himmelsIrradianz`, stamm/bild-sicht.js:2770) speist Unterwasser (bild-himmel.js:2526) und
Feld-Pass (Kommentar :1712).

Z15 **Kopie der Mondrichtung.** `moonDir = sunDir.clone().negate()` (bild-himmel.js:1150) neben `__weltLicht.mondRichtung`
(welt-licht.js:815). Gleiche Formel, zweite Stelle.

## 4. ZAHLEN DER DOMÄNE

- Getrennte Lichtwege: **12** (W1–W12). Dazu kommen die Bühne als Rufer derselben Funktionen und zwei Labor-Zwillinge (phytogenesis,
  fachwerk ZEIT).
- Größen: **61** (S1–S5, A1–A14, N1–N5, B1–B2, M1–M5, ST1–ST3, T1–T6, E1–E4, AU1–AU6, K1–K10, R1).
- Davon GESETZT ohne physikalischen Anker: **25**:
  - Sonne und Wetter: S1, S4, S5
  - Nacht im Gesetz: N1, N2, N3, N4
  - Mond, Sterne, Dämmerung: M1, M3, ST2
  - Tag-Achse: T1, T2 (Tag-Knoten), T4, T5
  - Ersatz-Lichter: E1, E2, E3, E4
  - Skala des Auges: AU2, AU5
  - Körper und Sterne: K1, K3, K4, K8, K9

  A7 und A14 (Anker implizit bzw. Auflösung) sowie AU1 (Mess-Kopie) zähle ich nicht dazu.
- Benannte Zwillinge und Brüche: **15** (Z1–Z15).
- Ungelesen: **1** in der Welt (N2 `nacht.lum`). Dazu R1 (tag-ref.json), das nur die Linse liest.

## 5. NICHT GELESEN — ÜBERGABEN

Nicht gelesen:
- welt-licht.js:283-555: Durchlass-, Ψ_ms- und Himmels-Pässe im Einzelnen. Nur der Marsch :556-700 ist gelesen.
- welt-licht.js:934-1150: umgebungLicht, himmelGrau, Wolken der Kuppel. Nur gestreift.
- stamm/bild-sicht.js `_himmelsIrradianz` und `_weltLicht` / `_weltLichtHimmel`.
- `_atmoTakt` ab bild-himmel.js:1640 (Tafel-Zeichnung, Rücklesung).
- `_dayNightApplySkybox` (bild-himmel.js:1728 ff.).
- fachwerk-core.js `ZEIT_GESETZ`.
- worlds/terrain/phytogenesis.js außerhalb von :3330-3530.
- scripts/lib/licht-linsen.cjs und das Werkzeug `werkbank licht`. Die Messungen 7,83 und 0,598 sind dort nicht nachgeprüft.

Übergaben:
- Quellen/Auge: `AUGE.q` · `anteil` · `eps` · `saum`, `augeZeig` / `augeGlut` / `augeReichweite` (welt-licht.js:120-148), `_lichtPoolTerm`, `_leuchtTakt` (stamm/dirigent-kern.js:1600-1632), bild-schatten.js:496-503
- Kamera: BELICHTUNG, `belichtungStufen` / `belichtung` / `belichtungAnker` (welt-licht.js:173-183, :743-784), `_raumBlendeTakt` (bild-himmel.js:1983-2031), Augenlicht (:2065-2112)
- Post-Kette: `_nachtAuge` (stamm/bild-kosten.js:2205 ff.), `staebchenStaerke` 1,22 (:3016)
- Wetter: WX_LICHT (phyto-core.js:4302), WEATHER_TINTS (stamm/daten.js:13-34), `_luftBeta` (bild-himmel.js:2270-2278)
- Studios und Labore: phytogenesis.js:3487-3530, fachwerk.js:645-670
- Wasser: Licht-Boden 0,22 (bild-himmel.js:2566)
