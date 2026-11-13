# 15 Himmel, Atmosphäre, Wolken und die Belichtung am Mittag

## Was der Spieler sieht
- `scratchpad/dorf-main-0.5.png` und `scratchpad/genom-spiel/gruppe.png` (Dorf der Ankunft, Uhr 0,5): der Boden ist hell und braun, die Hauswand fast weiß,
  die Schatten sind kurz (die Sonne steht hoch hinter der Kamera rechts, der Schatten der Laterne fällt nach links weg). Der Himmel über dem Grat ist
  über die ganze Breite **dunkles Marineblau**, auch dicht über dem Horizont, wo er heller werden müsste. Die Wolken darin sind fast weiß und hell.
  Ein Wolkenloch sieht aus wie ein Nachthimmel bei Tageslicht.
- `scratchpad/wiese-mitte/heute-wiese.png` (Mess-Wiese, Mittag): zwischen den Kronen derselbe schiefergraue bis dunkelblaue Himmel, auch am Horizont.
- `scratchpad/studio-welt/werk-viktorianisch-L0-mittag.png` (Bühne der Studios, „Mittag"): über dem Grund ist der Himmel **schwarz**, in allen vier Blicken.
- Die Pixel habe ich nicht gemessen. Was ich sehe: Farbton blau, Helligkeit falsch. Zum Boden steht der Himmel geschätzt 1,5 bis 2 Blenden zu dunkel.

## Was die Quelle sagt
**Eine Kette, ein Licht.** Kuppel, Umgebung und Belichtung lesen dieselbe Größe E0 und dieselben Tafeln:
- Die Kuppel ist `createGalaxySkybox` (`stamm/bild-himmel.js:234-268`). Ihr Stoff ist `MeshBasicNodeMaterial`, `colorNode = _himmelSicht(dir)` (:249),
  sie steht auf Tiefe 1 (`_himmelImUnendlichen` :46) und folgt der Kamera (`stamm/dirigent-takt.js:2195`). Den Nebel der Luft trägt sie weiter, weil `fog`
  nicht abgeschaltet ist (`scene.fogNode` :2338-2343; bei 500 m sind das nur wenige Prozent).
- Die Farbe des Himmels: `himmelFarbe = Texel der Himmels-Sicht × U.licht × U.toenung` (`welt-licht.js:565`). Den Texel malt `passHimmel`
  (:538-556) aus `marsch` (:467-537, Hillaire 2020, 32 Schritte). Die Wolke mischt sich darüber (`himmelSicht` :971-1006). Ihre Helligkeit kommt aus
  Sonne/π + Zenit (:996-1001), darum sind die Wolken hell.
- `U.licht = E0 = KEY_BASE·π·lightMul` (`stamm/bild-himmel.js:1601-1602`, `welt-licht.js:690`, KEY_BASE 2,6 :49).
  `U.toenung` = Himmels-Tint ÷ Basis 0x6a9ed0, geklemmt auf 0…4 (`bild-himmel.js:1727-1733`). Bei klarem Wetter ohne Aura und DSL-Tönung ist sie 1
  (:1190, `daten.js:18`).
- Das Medium kommt aus dem Kern `ATMO_GESETZ` (`foundry-core.js:283-307`): Rayleigh-Tiefe 0,044/0,1/0,23 (Bucholtz), Aerosol aus 20 km Sicht
  (β_Mie 0,184/km bei 550 nm, H 1 km), g 0,7, Ozon. Die Rechnung steht in `ATMO_RECHNUNG` (:315-387).
- **Die Belichtung** schreibt `_dayNightApplyBelichtung` (`bild-himmel.js:1911-1916`) auf `renderer.toneMappingExposure`, nach dem Gesetz
  `welt-licht.js:667-676`. Die 18-%-Karte der Waagrechten liegt auf `zielKarte` 0,22 (:78-88, Tonkurve Khronos PBR Neutral, sRGB 118).
  Gemessen wird E aus Sonne · Horizont-Sicht + Bestrahlungs-Tafel + Hemi + Ambient (`_waagrechtIrradianz` :2083-2120). Mittags ist die Kompensation
  (1−0,75)·log2(E/EA) ≈ 0.
- Die Post-Kette ändert am Tag nichts (`stamm/bild-kosten.js:2272-2331`): keine Sättigung und kein Kontrast, das Nacht-Auge ist nur nachts an.
  Das Panorama und der Feld-Pass verwerfen jedes Himmels-Pixel (`stamm/bild-sicht.js:2118`). Was man im Himmel sieht, ist also die Kuppel.

**Was das Gesetzbuch KANN gegen das, was die Welt KONSUMIERT:**
- Gemessen ist nur die **Bestrahlung**, die der Himmel an Stoffe abgibt. In der Soll-Tafel misst die Klasse `himmel-licht`
  (`spec/abnahme/soll-tafel.json:322-400`) `lichtVerhaeltnis` und `umgebungAzimut` an der waagrechten bzw. senkrechten Karte, also nur E.
  Die Messung dort: E_alle 7,99, E_umgebung 1,54 (Diffus-Anteil 0,19, im Band 0,08–0,20), zur Sonne 1,17, von ihr weg 0,92 (:418-421).
  licht.K1 trägt die Karte mit Luma 126 (stand.json, GTX). Die Stoffe bekommen also das richtige Himmels-Licht.
- **Die Leuchtdichte der Kuppel im Bild hat kein Soll.** `luft-referenz.json:14` legt nur den Farbton fest (222°). Keine Linse vergleicht
  die Helligkeit des Himmels-Pixels mit der Karte. Darum ist die Klasse grün, während der Himmel marineblau ist.
- Meine Überschlagsrechnung (nicht gemessen; die Werte aus dem Gesetz, Einfachstreuung + MS + Mie 90°): Himmel 90° von der Sonne bei 30° Höhe
  ≈ 0,023·E0, Karte 0,18/π·0,87·E0 ≈ 0,050·E0, also **Himmel ÷ Karte ≈ 0,46**. Nach CIE-Klarhimmel (Kittler, Sonne 74°, Lz ≈ 8,5 kcd/m²,
  E ≈ 105 klx) ist es ≈ 0,44. Richtig belichtet wäre das ein mittleres Blau mit Luma ≈ 90–110, kein Marineblau.
  Weil das Bild deutlich dunkler aussieht, rechnet die Kette zwischen Tafel und Pixel mit einem Faktor, den ich nicht gelesen habe.

## Die EINE begrenzende Entscheidung
**Der sichtbare Himmel ist EINE Klasse mit EINER Quelle, `himmelSicht`/`himmelFarbe` in `welt-licht.js`. Seine Leuchtdichte wird gegen die Karte
geurteilt, nach dem CIE-Klarhimmel, nie nach dem Renderer: Mittag, 90° von der Sonne, 30° Höhe, Himmel ÷ Karte 0,35–0,6.** Die Bestrahlung
(`himmel-licht`) ist schon grün. Sie darf sich nicht bewegen, das ist die Leitplanke: eine Korrektur, die die Bestrahlung verschiebt,
ist am falschen Ort.

## Der Schnitt
**Stufen (die Klasse ganz, in einer Welle):**
1. Die Kuppel der Welt, Mittag am Dorf: Auge, Hügel, Dach.
2. Die Himmels-Tafel `himmelTafel` (`welt-licht.js:952-970`), die Glas, Lack und Wasser spiegeln: derselbe Knoten, sie folgt von selbst.
3. Der Grund der Studio-Bühne (`buehne`, `welt-licht.js:1053ff`): er ist heute **schwarz**. Er muss denselben Himmel zeigen wie die Welt,
   sonst lügt jedes Labor-Bildpaar.
4. Die Uhr 0,27 und 0,05 werden nur angesehen, nicht verschoben: die Dämmerung trägt licht.K1.

**Wurzel finden, bevor geschnitten wird** (Spike mit drei Fällen in EINER warmen Welt am Dorf, Uhr 0,5, über die bestehende `werkbank licht`,
kein neues Werkzeug). Gesucht ist der Faktor zwischen Tafel und Pixel. Zum Vergleich wird der Texel aus `rtSV` gelesen, × `U.licht` × `toenung` ×
Belichtung k, gegen das ausgegebene Pixel (vor der Tonkurve) in derselben Richtung:
- (a) Pixel ≈ Texel·E0·k und das Verhältnis ≈ 0,15 → die Tafel `passHimmel`/`marsch` ist zu dunkel.
  Geschnitten wird dann am Marsch (`welt-licht.js:467-537`: Phase, Einheiten km gegen 1/km, Ψ_ms), nie an E0.
- (b) Pixel < Texel·E0·k → auf dem Weg der Kuppel liegt ein Faktor: `toenung` am Dorf (Aura `bild-himmel.js:1203-1227`), `fogNode` an der Kuppel
  (:2338) oder das Ausgabe-Format. Er fällt am Weg der Kuppel.
- (c) Verhältnis ≈ 0,45, das Bild aber dunkel → es ist die Tonkurve bzw. das Auge. Dann gilt die Entscheidung oben unverändert: die Karte
  bleibt, nichts wird geschoben, und der Befund geht an den Schöpfer.

**Leser-Liste (wer liest, was sich ändert), vor dem Schnitt:** die Kuppel `bild-himmel.js:249`; die Luft `fogNode` `bild-himmel.js:2307/2340`
(In-Streuung = himmelFarbe, also verschiebt sich auch der Dunst der Ferne: `gate:luft-tiefe:echt`); die Umgebung/PMREM `welt-licht.js:571`, 832-837
(Stoffe!); die Bestrahlungs-Tafel `welt-licht.js:579-603` → Belichtung `:667`; Wasser `stamm/wasser-hydro.js:820`; die Himmels-Summe der Ankunft
`stamm/dirigent-ankunft.js:1630`; die Bühne `welt-licht.js:1053ff`. **Wird im Fall (a) die Tafel geändert, ändern sich Umgebung, Bestrahlung und
Belichtung mit.** Die Stoffe dürfen dabei nicht heller werden, sonst ist das Band von licht.K2 verletzt.

**Kosten-Zeile:** kein neuer Pass. Eine Korrektur in `marsch` oder an einem Faktor der Kuppel ist 0 ms je Bild (die Tafel zeichnet sich nur neu,
wenn sich Sonne, Medium oder Höhe ändern, `bild-himmel.js:1610-1635`). Ankunft (B) unverändert, wenn keine Tafel dazukommt.

**Kriterien der Meisterkarte:**
- licht.K2 (1 P): Verhältnis 5,27/5,46 im Band 5–12,5, Schatten-Anteil 0,19 → soll so **bleiben** (Station licht.K2#1/#2).
- licht.K1 (0 P): Karte Luma 126 → bleibt; offen ist dort die Tag-Achse, nicht mein Schnitt.
- Pflicht A, Klasse `himmel-licht` der Soll-Tafel: hält nur die Bestrahlung. Die Leuchtdichte der Kuppel trägt kein Kriterium, darum ist der Beweis
  das **Bildpaar am Dorf** (Kurs 13.11.). Ein neues Soll setzt die Welle nicht (Regel 5).

## Was schon liegt
- Kein Zweig arbeitet daran (`UEBERGABE-2026-11-13.md:35`, :61 „gesehen, noch ohne gelandeten Schnitt").
- `w27-ferne-ton-5` 80bcd308: Farbton der Luft, `gate:luft-tiefe:echt` ROT („K1-2 HIMMEL nicht blau", `UEBERGABE-2026-11-10-nacht.md:130-131`).
  Er berührt dieselben Leser (fogNode). Nicht gelesen, ob er die Helligkeit ändert.
- `w28-studio-welt` 6039dc13 / `w28-studio-seiten` ad504fbe (WIP): EINE Bühne. Ihr schwarzer Himmel ist Stufe 3 dieser Klasse.
  Nicht gelesen, ob einer der beiden den Grund schon malt.
- Bis zur Landung fehlen: der Spike mit den drei Fällen, das Bildpaar am Dorf vorher↔nachher an fester Kamera, licht.K2 GRÜN an Radeon und GTX.

## Ehrlich offen
- **Die Wurzel ist nicht benannt.** Den Faktor zwischen Tafel und Pixel habe ich nicht gemessen (die Regel verbietet GPU und Pixel-Lesen).
  Die Rechnung oben ist ein Überschlag aus dem Gesetz, kein Trace.
- Nicht gelesen: `_atmoMedium`/`_atmoMediumJetzt`, `passDurchlass`/`passMehrfach` ganz, `_luftSpektrum`, `_ausgabeFormat`, die Bühne `buehne`
  ab `welt-licht.js:1053`, `scripts/diag-atmo-hillaire.cjs`.
- Widerspruch: grüne Bestrahlung (Diffus 0,19) gegen dunkle Kuppel. Entweder sammelt sich die Strahlung des Himmels im Mie-Hof nahe der
  Zenit-Sonne (g 0,7), oder der Weg der Kuppel trägt einen Faktor, den der Weg der Umgebung nicht trägt. Das klärt erst der Spike.
- `himmel-probe.cjs` im scratchpad fragte nach dem schwarzen Himmel der Bühne vor dem Vorbau. Sein Ergebnis habe ich nicht gesehen.

## Rang
Wirkung 5 (der Himmel ist in jedem Bild der Ankunft; ein Drittel der Fläche) · Aufwand M (Spike S, Schnitt S–M, die Bühne mit) ·
Risiko: im Fall (a) verschiebt der Schnitt an der Tafel die Bestrahlung jedes Stoffs und die Belichtung. Das wird abgefangen, indem licht.K2 als Leitplanke
grün bleiben muss.
