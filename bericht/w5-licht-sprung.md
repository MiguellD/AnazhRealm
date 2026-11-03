# w5-licht-sprung — schatten.K4 · schatten.K5 (ZWISCHENSTAND, Code im Zweig `w5-licht-sprung`)

**Geschnitten:** K4 — der gezeichnete Boden um das Auge (Szenen-Pass, Raster 12², waagrecht, unter dem Auge, ≤ 16 m) ist die
untere Hemisphäre der EINEN Umgebung (`stamm/bild-schatten.js:80` `_rueckstrahlPass`, `:152` `_rueckstrahlZeichne`, nach dem Bild
in `stamm/dirigent-takt.js:1810`; die Bestrahlung ersetzt den Boden der Atmosphäre mit + (Boden − Atmosphäre)·(1 − n.y)/2 in
`stamm/bild-sicht.js:679`); K5 — die wichtigste Quelle im Blick wirft: EIN Platz des Licht-Pools trägt r184s Würfel-Schatten
(`PointShadowNode` an einem Träger ohne Licht, `stamm/bild-schatten.js:199` `_lichtWurf`, Wahl `:273` `_lichtWurfTakt` aus
`_leuchtTakt` `stamm/dirigent-kern.js:1660`, Faktor je Platz `stamm/stoff-material.js:2035`).
**Gemessen** (Bühne mit echtem WebGPU/swiftshader, Stoffe · Pool · Umgebung · Pässe des Stamms; Null-Renderer für die Wahl):
K4 Gewinn **0,0 % → +11,2 %** (Wand 1,3857 / 1,3857 → 1,398 vor besonnter Wiese gegen 1,257 vor der Platte Albedo 0; ein
erzwungener heller Boden hebt die Wand auf 2,912), K5 Kontrast **0,85 : 1 → Schatten 0 gegen Licht 0,158** (Kontrolle ohne
Pfosten 1,03; die Mutante ohne Wurf fällt auf 0,85 zurück); Null-Renderer: Mitternacht wirft das Feuer in 6 m (Platz 0,
Lage = Quelle, Karte 256², nahe Ebene 0,38 m, Reichweite 9 m), das Feuer 40 m weiter nimmt den Wurf mit seiner Lage, mittags
aus (Feuer in 2 m 0,63 < ¼ × Welt 6,1); an der S0-Feuerstelle der Prüfbühne trägt die Nacht 0,40 gegen Glutbrunnen 19,2 in
2 m (Wurf-Schwelle ¼ × 0,40, Glutbrunnen I 141 vor Laterne 59,7); `npm run check` grün, `npm run playtest` „Alle Invarianten
OK", `gate:pruefbuehne` grün („Bauer im Stamm: Punktlicht keiner"), `playtest:fast` 21/21.
**Ehrlich offen:** das Bild der Stationen `schatten.K4#1` / `schatten.K5#1` auf der Radeon (Koordinator); die K4-Marge am echten
Bild ist ungemessen (Bühne +11,2 % bei frei gewählter Wiese; aus den Radeon-Zahlen 5fba36ea geschätzt ≥ 30 %); welche Quelle an
der Genesis neben den Laternen den Wurf gewinnt, zeigt erst das Bild.

## Kosten

- K4: +1 Befehl je Bild (EIN Dreieck in 2 × 1 Pixel, 144 Proben × 3 Tiefen + 1 Farbe) + 1 Textur-Kopie (2 × 1); je Fragment der
  Bestrahlung +2 Texel-Ladungen, −1 Spiegel-Abtastung (Fund 1). VRAM 2 × 16 B.
- K5: Schatten-Pässe nur mit wichtiger Quelle (nachts, Dämmerung): je Karte 6 Würfel-Seiten × Werfer in der Reichweite (Bühne:
  1 Werfer → 6 Befehle, 6 × 12 Dreiecke), neu bei Wahl/Lage-Wechsel und höchstens jedes 3. Bild ohne Kaskade; mittags 0 (das
  Profi-Band misst mittags). Je Fragment jedes beleuchteten Stoffs: die Würfel-Koordinate und der Fern-Vergleich, 5 PCF-Abtastungen
  nur in der Reichweite des Wurfs. VRAM: Würfel 256² × 6 (Tiefe + r184s Farb-Würfel) ≈ +3,1 MB (geschätzt, ungemessen).

## FUNDE

- (geheilt, Klasse) `_spiegelUmgebung` nahm den Zweig der Bestrahlung nie: r184 reicht ihre Stufe als `float(1)` in einer
  VarNode, der Zweig fragte `isConstNode` — jede Bestrahlung jedes Standard-Stoffs las den Spiegel-Pass mit dem Gewicht 0 (eine
  Abtastung je Fragment für nichts; am WGSL der Wand gelesen).
- Die Station `schatten.K4` setzt als Mutante eine schwarze PLATTE (Körper 16 × 16 m, Albedo 0) vor die Wand, nicht die
  Boden-Albedo 0: ein Term aus der Albedo-Zeile des Geländes am Ort hätte dort 0 % gezeigt — darum misst der Rückstrahl den
  gezeichneten Boden (Sonne × cos × Albedo, wie der Boden-Stoff ihn malt).
- r184s Seiten-THREE reicht weder `PointShadowNode` noch `PointLightShadow`/`LightShadow`: der Wurf nimmt die Klasse aus
  `TSL.pointShadow` und die Karte über die `LightShadow`-Basis der Richtlicht-Kette (die K11-Rückkehr-Wand gegen
  `new THREE.PointLight(` hält: kein Punktlicht existiert).
- Der Rückstrahl hebt jede nicht waagrechte Fläche am Tag um bis zu ½ (Boden − Atmosphäre): die Licht-Verhältnisse
  (`werkbank licht`) und die Soll-Tafel sehen ihn erst auf der Karte.
- Der Bericht lebt hier (Zweig `w5-licht-sprung-koord` von `koordination`): als `bericht/*.md` im Arbeitszweig bräche die
  Zitat-Wand (`gate:betriebsgesetz`: jede .md in der Karte `docs/README.md`).
- Die Bühnen-Probe (echtes WebGPU, die Stoffe und Pässe des Stamms an einer kleinen Szene, ~2 s je Teil auf swiftshader) ist keine
  Linse des Baums; die Richter bleiben die Stationen `schatten.K4#1` / `schatten.K5#1`.
- Der Null-Renderer trägt am Spawn keinen Eintrag im Verzeichnis „licht“ (die K5-Probe setzte zwei Feuerstellen mit dem Datum
  `LICHT_GESETZ.feuer`, ab dem Eintrag lief der echte Weg).
