# 34 Shader-Programme und TSL-Knoten — derselbe Text, zwanzigmal übersetzt

## Was es den Spieler kostet (kein Bild gesehen)
- Ankunft kalt: GTX 1060 16,6 s (CLAUDE.md, Pflicht B), GTX 1050 22,1 s ab Navigation bis zum Bild, 43 Pipelines, 1,99 MB
  Programm-Text, Knoten-Bau Σ 4,24 s im Haupt-Faden, Übersetzung Σ 41,9 s (überlappend) (`KO/bericht/1113-bild-wartet.md:8–9`).
- Ein kleines Standard-Programm übersetzt in 0,60–0,70 s, die fünf geteilten Bausteine des Lichts tragen davon 0,5–0,7 s (nicht
  additiv) — „der Kern trägt die Übersetzung, nicht die Art" (`KO/FUND-REGISTER.md:164`). ≈ 11 ms je KB Text, ≈ 16 ms je KB `main`;
  derselbe Text ein zweites Mal 2–12 ms (`FUND:143`).
- Kriterium ankunft.K1#1: kalt ≤ 10 000 ms auf nvidia, sonst ≤ 5 000 (`PM/stationen/g6.js:4330`); Stand 0 Punkte, beide Geräte
  UNGEMESSEN seit 36f9d45a (`PM/punkte/stand.json:133–175`).

## Was die Quelle sagt
1. r184 schlüsselt das Modul nach dem TEXT: `programs.fragment.get(n.fragmentShader)` (`vendor/three.webgpu.min.js` Z. 6) — gleicher
   Text = ein Modul, ein anderer Knoten-Graph mit gleichem Text kostet nur den Knoten-Bau. Den Knoten-Bau schlüsselt r184 nach der
   Knoten-Identität (`stamm/stoff-material.js:2034–2036`); darum teilen Foundry-Stoffe ihren Graphen je Signatur
   (`_graphTeilen`, `stamm/studio-stoff.js:110–122`, Signatur aus 19 Achsen `:710–742`), Werke je Folge der Stoff-Werte (`stoff-material.js:1824`).
2. Die echte Welt vor dem ersten Bild (`holz=voll`, swiftshader mit Attrappen-Shader, 4 Läufe): 59 Fragment-Module 2,16 MB, 55 Vertex
   0,36 MB, 116 307 Knoten, Knoten-Bau 1553–1745 ms. 20 Bauten tragen den Licht-Pool (18 Standard, 2 Physical), Ø 76,5 KB, Σ 1,49 MB =
   68 % (`origin/w28-samen-lichtweg:samen/lichtweg/BEFUND.md` §1.6–1.7, Tafel `mess/welt-tafel.json`).
3. Je Pool-Programm steht derselbe Licht-Kern als eigener Text: Kaskaden-Empfang 19,8 KB · Umgebung 8,5 · Licht-Pool 8,8 · Nässe 4,0 ·
   Luft 2,3 = 37,9 KB (50 %), 2 264 Knoten (56 %) (BEFUND §1.8). r184 legt jede Knoten-Variable als `var<private>` auf Modul-Ebene
   (15,9 KB je kleinem Programm) und schreibt `main` als EINEN Rumpf (55,4 KB, nur 9 Funktionen) (`FUND:161`).
4. Die Liste der Welt-Bauten (`welt-heute-1.json`, `bau[]`, selbst gelesen): neun Standard-Stoffe auf `geometrie-arena`
   (56–126 KB), drei `bauSatz` (70–84 KB), `bodenSatz` 124 KB, `formationenSatz` 84 KB, zwei „Mesh" Standard 133/143 KB (Fern-Ring frei
   und Naht), zwei Physical 46/51 KB; ZWEI Bauten mit byte-gleichem Text (`Mesh`, `quelle`, je 35 040 B, 1 665 Knoten) — ein Modul,
   aber zweimal Knoten-Bau. Zwölf `ShadowMaterial`-Werfer, darunter der Wurf des Karten-Atlas mit 54,9 KB Fragment (`1113-bild-wartet.md:104`).
5. DIE KASKADEN: das Addon schreibt jede der drei Kaskaden als eigenen Zweig in den Text — `_setupFade` ruft `this._shadowNodes[i]`
   in einer JS-Schleife `for i < cascades` je in einem `If` (`vendor/CSMShadowNode.js:399–440`); Text 3×, die GPU läuft einen Zweig,
   im Saum zwei. `cascades: 3`, `fade = true` (`stamm/dirigent-ankunft.js:408–416`).
6. k1 und k2 tragen DASSELBE Filter-Gesetz: `filterTexel [0.25, 1, 1]`, `sucheM [0.25, 0, 0]` (`stamm/bild-schatten.js:1717, 1720`) —
   der Filter (`_schattenFilter`, `:1041–1089`) verzweigt nur an `sucheM > 0`; für k1/k2 bleiben fünf Vergleiche, die Werte
   (`mapSize`, `anazhBoxM`) liest er als Referenz am Schatten (`:1047–1048`). Text unterscheidet sie nur in der Bindung der Karte.
7. r184 kann Schatten aus einer Tiefen-REIHE lesen: die eingebauten Filter tragen `depthLayer` und `depthTexture.isArrayTexture`
   (`.depth(layer)`, `vendor/three.webgpu.min.js` Z. 6, Filter `V_`/`k_`/`G_`).
8. Der Host ersetzt Addon-Methoden je Instanz ohne Vendor-Bruch: `csm._init` (`dirigent-ankunft.js:417`), `csm.updateBefore`,
   `csm._updateShadowBounds` (`:430–431`) — `csm.setup` ist dieselbe Tür.
9. Schon gefallen: die vier ausgeschriebenen Pool-Plätze als EINE `Loop` (−5,0 KB je Programm, zwölf Programme Σ 9,49 → 8,97 s, GPU
   gleich; `stoff-material.js:2400–2412`); die fünf Abgriffe des Kaskaden-Filters als Schleife wurden VERWORFEN (+0,35–0,47 ms GPU
   je Bild für −0,6 s Übersetzung, `:2411–2412`).
10. Widerlegt am 13.11.: EIN Stoff-Interpreter trägt das erste Bild nicht (weiß, ohne Kaskaden-Schatten; Ablösung 15 s, Bild-Abstand
    96 statt 38 ms) — offen blieb dort ausdrücklich „ein Schatten ohne die Kaskaden im Fragment" (`KO/bericht/1113-stoff-stufe-null.md:11–22, 80–81`).

## Die EINE begrenzende Entscheidung
r184 schreibt ein Gesetz als Text dort, wo es gebaut wird — WGSL kennt keine Bibliothek zwischen Modulen, also zahlt die Übersetzung
den Licht-Kern (37,9 KB, 50 %) in jedem der 20 beleuchteten Programme neu, und INNERHALB eines Programms steht der Kaskaden-Empfang
dreimal, obwohl k1 und k2 dasselbe Gesetz tragen. Begrenzend ist nicht die Zahl der Arten (sie teilen schon je Signatur), sondern
die Wiederholung desselben Gesetzes im Text: was je Fragment nur EINMAL läuft, darf nur EINMAL im Text stehen.

## Der Schnitt
**Die Klasse:** „dasselbe Gesetz mehrfach im Text EINES Programms". Die Pool-Plätze sind gefallen (Punkt 9); was steht, sind die
Kaskaden. EIN Ort: der Host übernimmt `csm.setup` (wie `_init`, `dirigent-ankunft.js:417`):
- **Stufe 1 — k1+k2 als EINE Tiefen-Reihe** (zwei Schichten, eine Bindung): `_kaskadenZiele`/`_kaskadenKarten` (`bild-schatten.js:1014–1015,
  1100–1119`) legen k1 und k2 in EIN Array-Ziel. Beide stehen laut Kommentar auf 2048² (`:1098`, Karte-Max 2048 `:1722`), der
  Speicher bleibt also gleich (nicht gemessen). k0 (Kontakt, mit Suche) bleibt eigene Karte.
- **Stufe 2 — EIN Zweig für k1/k2:** die Kaskade wählt der Fragment-Ort, ihre Matrix wählt ein `select` über die Schicht (Muster `_jePlatz`,
  `stoff-material.js:2439–2443`), der Filter läuft EINMAL mit `depthLayer`. Im Saum würfelt das EINE Rauschen der Blende (`_ditherIGN`
  mit `uDitherT`, `bild-schatten.js:1034–1040`) die Kaskade, TRAA mittelt — statt zwei Auswertungen eine.
- **Stufe 3 — die Sonnen-Sicht und der Empfang des Bodens** hängen einmal hinter der Wahl: `csm.anazhSicht` (`dirigent-ankunft.js:423`)
  und `receivedShadowNode` (Zuwendung des Bodens, `stoff-material.js:1904–1909`; „wirkt nur je Kaskade", `dirigent-ankunft.js:421`).
- **Was stirbt:** der Zweig je Kaskade für k1/k2 im Text aller 20 Pool-Programme und aller Werfer, die Doppel-Auswertung im Saum
  k1↔k2. Kein Flag, kein Rückweg: das Addon-`setup` läuft nicht mehr.

**Leser-Liste (vor dem Schnitt):** `_kaskadenGeburt` `bild-schatten.js:1006–1016` · `_schattenFilter` `:1041` · `_kaskadenKarten` `:1100` ·
`_kaskadenSaum` `:698, :786, :1110` · `_kaskadeFit` (Bias, Box) · `_passSicht`/`_kaskadenPassen` (Pässe je Karte) · `csm.anazhSicht`
`dirigent-ankunft.js:423` · Boden-Zuwendung `stoff-material.js:1909` · Laub-Unterseite (Durchlass × Schatten, `_laubLichtModell`,
`bild-schatten.js:1039`) · WebGL2-Rückfall (GLSL lädt keine Tiefe aus `sampler2DShadow`, gate:webgl-probe W5, `:1032`) ·
Linsen: schatten.K1 (Kanten cm/m, Kontakt-Kaskade k0 ms), schatten.K2 (Reprojektion), gate:weltbild-frost:echt, gate:vendor-anker.

**Kosten-Zeile:** Text je Pool-Programm −1 Kaskaden-Zweig von 3 (Schätzung bis ~6,6 KB = ⅓ von 19,8; × 20 Programme ≈ −0,13 MB von
2,16); Übersetzung nach ≈ 11 ms/KB je Programm ≈ −70 ms (Schätzung, nicht gemessen). GPU: im Saum k1↔k2 ein Filter statt zwei
(Gewinn), sonst gleich; VRAM gleich, falls k2 heute 2048² trägt (nicht gemessen). An den Schirm gebunden, nicht an die Welt.

**Kriterien:** ankunft.K1#1 (kalt ≤ 10 s nvidia, Ist 16,6 s GTX 1060, UNGEMESSEN) · ankunft.K3#1 (warm, `g6.js:4332`, UNGEMESSEN) ·
schatten.K1#1/#2 halten (gehalten: Uhr 0,5 Ego 0,945 cm/m, 44/44 Kanten, Kontakt-Kaskade k0 0 ms GTX, `stand.json:3100–3141`) ·
schatten.K2#1 halten (Reprojektion ≤ 0,5 %, Ist max 0,03 %, `stand.json:3146`). Station: Bildpaar am Dorf der Ankunft, Mittag und
Uhr 0,3, Ego + Hügel, k1↔k2-Saum im Blick; Text-Zahl mit `samen/lichtweg/mess-welt.cjs heute` (Haken an `createShaderModule`).

## Was schon liegt
- `w28-samen-lichtweg` d8887125 (WIP, nicht in main): Befund + `mess-welt.cjs` — das Werkzeug, das Text, Module und Knoten je Bau zählt.
- `w28-stoff-stufe-null` 0343f9e8 (WIP, nicht landen): der Befund, dass die Kaskaden die Brücke sind; Werkzeug `zug/werkzeug-gtx1050/stoff-spike/`.
- `w28-baum-programm` (in main): das Muster `Loop` + `_jePlatz` und die Shader-Kosten-Linse, die Fn-Rümpfe liest (f016f5d7).
- `zug/werkzeug-gtx1050/gc/` (`uebersetz-sonde`, `halb-bau.cjs`, `baustein-lesen.cjs`): Übersetzung je Text allein auf der Karte.
- Fehlt bis zur Landung: der Spike (heute ↔ k1/k2-Reihe ↔ Gegenprobe alle drei in einer Reihe mit k0 auf 2048²), das Bildpaar, die
  Übersetzungs-Zahl auf der GTX 1050.

## Ehrlich offen
- NICHT gelesen: ob r184 in eine Schicht eines Array-Tiefen-Ziels zeichnet (`setRenderTarget(rt, layer)` bzw. `activeCubeFace` als
  Schicht) und ob `ShadowNode` ohne eigenes `shadow.map` baut — die Frage 1 des Spikes. Ebenso nicht gelesen: wie viel der 19,8 KB
  der Filter ist und wie viel `setupShadowPosition`/Bias/Frustum-Test je Kaskade.
- NICHT gemessen: die wahre Größe von k2 (nur Kommentar `bild-schatten.js:1098`), die Übersetzung nach dem Schnitt, das Rauschen
  des gewürfelten Saums unter TRAA.
- Kleiner Fund daneben: zwei Bauten mit byte-gleichem Text (35 040 B, 1 665 Knoten, `quelle`) bauen den Knoten-Graph zweimal — Täter
  nicht beim Namen gelesen. Die Nah-Wiese baut in 3 von 24 Boots zwei Text-Formen desselben Stoffs (1 102 ms, `FUND:178`).
- Bewusst NICHT in der Klasse: Fern-Ring frei ↔ Naht (133 ↔ 143 KB) sind zwei Programme mit Absicht — die Tiefe aus dem Fragment
  auf allen Schalen kostete +1,28 ms je Bild (Radeon, `stamm/gelaende-fern.js:257–261`).
- Widerspruch: der Lichtweg-Befund (§1.3) sagt, jeder Pool-Platz koste jedes Fragment die ganze BRDF; der Code (`stoff-material.js:2389–2394`)
  sagt, r184s `select` schreibe `if/else`, die BRDF zahle nur eine Welle mit einem Treffer. Auf der Karte nicht entschieden.
- Größer als dieser Schnitt (anderer Bereich): 16 der 43 Pipelines decken im ersten Bild < 0,1 % der Pixel, Σ 17,2 s Übersetzung
  (`1113-bild-wartet.md:10–11`).

## Rang
Wirkung 2 (Takt: ein Drittel des größten Kern-Bausteins aus 20 Programmen, im Bild gleich) · Aufwand M · Risiko: das Zeichnen in eine
Schicht eines Tiefen-Arrays ist in r184 nicht gelesen, und der gewürfelte Saum kann schatten.K2 (Reprojektion) kippen.
