# Lesen: FEUER (Zensus Kopplung, Stand b7ed841)

## 1. Kopf

Das Feuer ist EINE Map `state.brandFeld` mit dem Schlüssel „cx,cz“. Die Zelle ist die 16-m-Zelle des Lebens-Felds (`LIFE_FIELD.cell`, stamm/feld-leben.js:3078).
Die Front läuft nach Rothermel 1972/Albini 1976 (`_brandTempo`, stamm/feld-brand.js:299–339) als kürzeste Laufzeit über die 8 Nachbarn (`_brandZuenden`, :374–451). Jede brennende Zelle trägt `t0`, `ende`, `R`, `ecc`, `kopf`, `glut`; eine wartende Zelle trägt `t0 = null` und ihre Ankunft `an`.
Es tickt `_tickBrand` (:470–499), gerufen je Bild aus `_runFrameScheduler` (stamm/dirigent-takt.js:2348). Die Uhr ist die Welt-Uhr `spielZeit` (dirigent-takt.js:48), geschritten in `schrittS` = 1 s (feld-brand.js:894) auf der eigenen Uhr `_brandUhr` (:360, :495); die Arbeit geht im Budget 0,25 ms je Bild (:914).
Das Feld wird nicht gespeichert, nur die Asche reist als Tat `brand` in `worldMeta.taten` (:575, feld-leben.js:2627–2640).

### 1a. DIE KERNFRAGE: Warum bleibt es bei EINER Zelle?

**Probe** (Null-Renderer, die echten Module, Mess-Wiese −280,4/−1 045,6, mittags, Nässe auf 0 gehalten, die Uhr von Hand je 1 s über `_tickBrand`):
`node /tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/feuer/brand-probe.cjs` (Boot 5,9 s, gesamt 15,3 s).
Die Probe reproduziert die Station: unter dem Wort klar brennt nach 60 s **1 Zelle** (dazu 8 wartende).
`node …/scratchpad/feuer/brand-grenze.cjs` (gesamt 20,3 s) misst Regen: erloschen nach **7 s**.

| Wort | U₁₀ m/s (ohne Böe) | R Kopf m/s | ecc | Rückfeuer m/s | erste Nachbarin s | brennend nach 60 s | 300 s | 3 600 s brennend / Asche |
|---|---|---|---|---|---|---|---|---|
| klar (sunny) | 1,44 | 0,074 | 0,58 | 0,020 | **79,3** | **1** (+8 wartend) | 6 | 44 / 62 |
| bewölkt | 7,2 | 1,047 | 0,959 | 0,022 | 6,4 | 10 | 38 | 64 / 80 |
| Sturm (Regen auf 0) | 24 | 1,80 | 0,984 | 0,015 | 4,3 | 10 | 37 | 66 / 73 |
| Gegenprobe: klar, Sturm-Wind | 24 | 1,83 | 0,984 | — | — | 11 | — | — |

**TÄTER 1, das Tempo (die Zeit bis zur Nachbarin).** `_brandTempo` (feld-brand.js:321–338) liest den Wind `_windAt` (stoff-material.js:233–252).
Unter klar ist das `WX_GESETZ.klar.wind` 0,06 (phyto-core.js:4288) × `sturmMS` 24 (phyto-core.js:4318) = 1,44 m/s in 10 m. Auf Flammenhöhe wird daraus 0,48 m/s (WAF 0,386 aus der Tiefe 0,42 m, :327–329), und es folgt R = 0,074 m/s.
Der Herd liegt 5,6 m vor dem +z-Rand seiner Zelle (−1 045,6 in [−1 056, −1 040]). Die Ankunft `ankunft` (:388–412) setzt die Nachbarin (0, +1) auf t0 + 79,3 s (:445–448).
`_brandSchritt` (:510–511) zündet sie also erst nach 79 s. Es gibt kein frühes return, keine Kappung und keinen Bruch im Pfad: alle 8 Nachbarn tragen Gras-Bett (R 0,070–0,077), sie sind nur noch nicht fällig.
Die EINE Zelle nach 60 s ist damit Rothermel mit einem Wind von 1,44 m/s. Der Wind kommt aus der Tafel, deren Wind-Kanal eine Böen-Amplitude des Looks war (stamm/daten.js:105–108 „wind = Böen-Amplitude“).

**TÄTER 2, die Grenze des Gebiets (der Brennstoff).** Das Bett einer Zelle ist der Stoff unter ihren Punkten, `_kontaktStoffAt` (gelaende-kollision.js:1121–1134). „gras“ steht dort nur, wo der GEZEICHNETE Boden grün ≥ 0,5 ist (:1132). `_bodenSichtAt` gibt null „ohne Karte (fern, ungebaut)“ (gelaende-boden.js:12–19).
Sonst fällt der Leser auf `_terrainMaterialAt` (vegetation-wiese.js:2362–2383): erde/stein/quarz/glut. Keine dieser Zeilen trägt `brenn`, denn BRENN kennt nur gras und laub (bau-vorlagen.js:1646–1649).
Gemessen in ±24 Zellen um den Herd (2 401 Zellen): 312 tragen Bett (96 gras, 216 laub), 1 926 „kein Bett, ohne Boden-Karte“ (erde 581, stein 511, quarz 507, glut 327), 84 Wasser, 59 mager.
Bett je Ring (Zellen): 0–4: 70/81 · 5–8: 103/208 · 9–12: 15/336 · 13–24: 124/1 776. Längs ±x/−z ist ab 128 m jede Zelle „ohne Karte“ (Null-Renderer, Ring 2 Chunks à 43,2 m).
In 3 600 s halten die Zellen, die die Front erreichte, unter klar zu 13 von 22 an „ohne Karte“, unter Sturm zu 33 von 47. Die weiteste Asche liegt in beiden Läufen 146 m vom Spieler: **der Brand kann den gebauten Ring nicht verlassen.**

**TÄTER 3, das Soll gegen die Physik (Arithmetik, kein Code).** ≥ 200 Zellen nach 60 s heißt ≥ 51 200 m², also ein mittlerer Radius von ≈ 128 m in 60 s, ≈ 2 m/s in JEDE Richtung.
Das Rückfeuer der Ellipse läuft 0,015–0,022 m/s. Die Ellipse unter Sturm trocken (a = (1,83 + 0,015)·60/2 = 55 m, b = a·√(1 − ecc²) ≈ 10 m) deckt nach 60 s ≈ 1 700 m² ≈ 7 Zell-Flächen. Gemessen berührt sie 11 brennende Zellen.
Mit einem Herd und dem Gesetz von heute ist ≥ 200 in 60 s unter keinem Wort der Tafel erreichbar.

**Regen nach 7 s.** Unter dem Wort Regen steigt die globale Nässe um 0,004 je s (`_naesseTakt`, bild-himmel.js:3060–3087).
Die Bett-Feuchte ist M = 0,06 + 2,5·Nässe (feld-brand.js:282–285). Bei Nässe 0,028 (7 s) ist M = 0,129 ≥ M_x 0,12, und `_brandSchritt` (:514, :519) nimmt alle 9 Zellen im selben Schritt.

## 2. DIE GRÖSSEN

| Name | Einheit | Wert/Bereich | Anker | Schreiber | Leser | FOLGT / GESETZT |
|---|---|---|---|---|---|---|
| Zelle des Feuers | m | 16 | feld-leben.js:3078 | — | feld-brand.js:220, 352, 383, 551, 562 | GESETZT (das Raster des Lebens-Felds) |
| Takt `schrittS` | s | 1 | feld-brand.js:894 | — | feld-brand.js:487–488 | GESETZT |
| Sprung `sprungS` | s | 10 | feld-brand.js:895 | — | feld-brand.js:489 | GESETZT |
| Nachbarschaft | Stellwert ohne Einheit | 8 (Moore) | feld-brand.js:978–989 | — | feld-brand.js:441 | GESETZT |
| `minStoff` (Zünd-Schwelle der Last) | Stellwert ohne Einheit | 0,15 | feld-brand.js:900 | — | feld-brand.js:224 | GESETZT |
| `leb` (Anteil der Last) | Stellwert ohne Einheit | 0…1 (Herd 0,73 klar / 0,86) | Simplex λ 200 m, feld-leben.js:1817–1826, 2972 | `worldFieldAt` + Overlay + Narbe, feld-leben.js:1866–1873 | feld-brand.js:222, 302, 437 | GESETZT (Rauschen, keine Messung der stehenden Wiese) |
| Bett-Stoff (gras/laub) | Klasse | gras wo die Boden-Karte grün ≥ 0,5 ist, laub wo die Kronen-Streu ≥ 0,5 ist | gelaende-kollision.js:1130–1133 | Boden-Karte gebauter Chunks, gelaende-boden.js:19 | feld-brand.js:244–245 | GESETZT (Bild-Karte statt Welt-Funktion) |
| Bett-Gitter | m | 5 grob, 8² fein (2 m) | feld-brand.js:902–912 | — | feld-brand.js:240–255, 128 | GESETZT |
| Brennstoff-Last w₀ | kg/m² | gras 0,166 · laub 0,654 (× leb) | bau-vorlagen.js:1647–1648 | — | feld-brand.js:302, 437 | FOLGT (Anderson 1982: FM1 0,74 t/ac, FM9 1-h 2,92 t/ac) |
| Oberfläche je Volumen σ | 1/m | 11 483 · 8 202 | bau-vorlagen.js:1647–1648 | — | feld-brand.js:302, 338 | FOLGT (FM1 3 500 ft⁻¹, FM9 2 500 ft⁻¹) |
| Bett-Tiefe δ | m | gras 0,42 · laub 0,061 | gras = GRASS_BLADE_H stoff-material.js:3827; laub bau-vorlagen.js:1648 | — | feld-brand.js:302, 329 | GESETZT (gras: die Halm-Höhe des Bilds, FM1 0,3048 m); laub FOLGT (FM9 0,2 ft) |
| Heizwert h | J/kg | 18 608 000 | bau-vorlagen.js:1647 | — | feld-brand.js:313, 437 | FOLGT (8 000 Btu/lb) |
| Erlöschungs-Feuchte M_x | kg/kg | 0,12 · 0,25 | bau-vorlagen.js:1647–1648 | `_brandZuenden` feld-brand.js:423, 448 | feld-brand.js:310, 510, 514 | FOLGT (FM1 12 %, FM9 25 %) |
| Partikel-Dichte ρ_p | kg/m³ | gras 350 · laub 300 | schmiede-core.js:2898, 2907 | — | feld-brand.js:303 | GESETZT (Rothermel 32 lb/ft³ = 513) |
| Mineral S_T / S_e | kg/kg | 0,0555 / 0,01 | feld-brand.js:976 | — | feld-brand.js:313 | FOLGT (Rothermel 1972) |
| T_zünd | K | gras 533 · laub 523 | bau-vorlagen.js:1632, 1638 (SI) | — | feld-brand.js:316; siedlung-wege.js:637 (Lava); Brennglas `_brennWaerme` koerper-fahrt.js:2369 → :2347 | FOLGT (Zellulose) |
| c des Brennstoffs | J/(kg·K) | 1 800 | schmiede-core.js:2907 | — | feld-brand.js:316 | FOLGT |
| c_w / L_v des Wassers | J/(kg·K) / J/kg | 4 186 / 2 257 000 | schmiede-core.js:2885; bau-vorlagen.js:1644 | — | feld-brand.js:316 | FOLGT |
| Feuchte `trocken` | kg/kg | 0,06 | feld-brand.js:975 | — | feld-brand.js:284 | GESETZT (kein Luftfeuchte-Feld) |
| Feuchte `faser` (× boden) | kg/kg | 0,35 | feld-brand.js:975 | — | feld-brand.js:284 | FOLGT (Faser-Sättigung) |
| Feuchte `nass` (× Nässe) | kg/kg | 2,5 | feld-brand.js:975 | — | feld-brand.js:284 | FOLGT (Matthews 2006) |
| `boden` (Boden-Feuchte) | Stellwert ohne Einheit | 0…1 (Herd 0) | `_feuchteAt` gelaende-boden.js:1538–1561 | `_brandStoff` feld-brand.js:268, einmal je Brand gemerkt (:218–219) | feld-brand.js:284, 424, 448, 509, 563 | FOLGT (aus der Hydrosphäre: Fluss-Abstand und Höhe über dem Spiegel, nie aus Regen) |
| `naesse` (Film der Welt) | Stellwert ohne Einheit | 0…1, global; im Regen +0,004/s | NAESSE stoff-material.js:3788–3797 | `_naesseTakt` bild-himmel.js:3083 | feld-brand.js:284 | FOLGT (Wetter-Wort `rain`, `_naesseKurve`) |
| Luft-Temperatur | °C | 18,2 (klar), 13,6 (Sturm) | gelaende-core `temperaturAus` via bild-himmel.js:2874–2882 | — | feld-brand.js:315–316 | FOLGT |
| Wind U₁₀ | m/s | klar 1,44 · bewölkt 7,2 · Regen 8,4 · Sturm 24 (× `windForm`) | phyto-core.js:4288–4293 (`wind`), 4318 (`sturmMS`) | `_windAt` stoff-material.js:233–252 | feld-brand.js:321, 328, 664, 754 | GESETZT (Look-Amplitude × 24) |
| WAF (Flammenhöhe) | ohne Einheit (physikalisch) | 0,386 (δ 0,42 m) | feld-brand.js:327–329 | — | feld-brand.js:330 | FOLGT (Albini–Baughman 1979) |
| Gefälle g_x, g_z | m/m | Herd −0,031 / 0,006 | feld-brand.js:225–226 | `_brandStoff` | feld-brand.js:332, 692 | FOLGT |
| R (Kopf) | m/s | 0,074 · 1,047 · 1,80 (gemessen) | feld-brand.js:317–338 | `_brandZuenden` :430 | feld-brand.js:384, 417, 421, 669, 679; dirigent-kern.js:1806 | FOLGT (Rothermel/Albini) |
| ecc (Ellipse) | ohne Einheit (physikalisch) | 0,58 · 0,959 · 0,984; Deckel L/B ≤ 8 | feld-brand.js:336–337, 977 | `_brandZuenden` :432 | feld-brand.js:384, 679; dirigent-kern.js:1806 | FOLGT (Anderson 1983), der Deckel GESETZT |
| Rückfeuer R(1−e)/(1+e) | m/s | 0,020 · 0,022 · 0,015 | feld-brand.js:296–297 (Formel) | — | (in `ankunft` :386, :408) | FOLGT |
| Verweilzeit t_r | s | 6,58 (gras) | feld-brand.js:338 (23 040/σ) | `_brandZuenden` :433 | feld-brand.js:113, 421, 694 | FOLGT (Anderson 1969) |
| Brenndauer der Zelle `ende − t0` | s | 649 (klar) · 601 · 874 (Sturm) | feld-brand.js:416–421 | `_brandZuenden` | feld-brand.js:514 | FOLGT (bis das Rückfeuer die hinterste Ecke erreicht) |
| Ankunft `an` der Nachbarin | s | erste 79,3 · 6,4 · 4,3 | feld-brand.js:388–412, 441–449 | `_brandZuenden` :448 | feld-brand.js:491, 511, 522, 579 | FOLGT |
| `glut` | Stellwert ohne Einheit | Rampe 0→1 über `aufS` 4 s, dann 1 bis `ende` | feld-brand.js:515, 896 | `_brandSchritt` :515 | feld-leben.js:1874; dirigent-kern.js:1809; klang.js:383; feld-brand.js:731 | GESETZT |
| H·w (`iw`) | kJ/m² | 2 251 (klar) · 2 641 | feld-brand.js:437 | `_brandZuenden` | feld-brand.js:687, 700 | FOLGT |
| Byram-Intensität I / Flammenlänge L | kW/m / m | L = 0,0775·I^0,46 | feld-brand.js:687, 700 | `_brandBild` | feld-brand.js:695–696, 746 | FOLGT (Byram 1959) |
| Rauch-Rate `jeS` | Ballen/(Zelle·s) | 12 | feld-brand.js:955 | — | feld-brand.js:731 | GESETZT |
| Rauch-Steigen w | m/s | ∛(g·I/(ρ c T)), T = 300 K fest, ≤ 7 | feld-brand.js:746, 963 | `_brandRauch` | feld-brand.js:755 | FOLGT (Morton–Taylor–Turner), T GESETZT |
| Rauch-Wachstum α | ohne Einheit (physikalisch) | 0,16 | feld-brand.js:958 | — | feld-brand.js:760 | FOLGT (Entrainment) |
| Rauch `lebenS`/`max`/`a0`/`aKill` | s / Stück / Stellwert ohne Einheit | 25 / 600 / 0,5 / 0,08 | feld-brand.js:956–961 | — | feld-brand.js:729, 736, 761–762 | GESETZT |
| Licht `schein` | Stellwert ohne Einheit (Welt-Einheiten) | 7,5 | feld-brand.js:946 | — | `_flammenLicht` dirigent-kern.js:1725 | GESETZT |
| Hör-Weite `hoerM` | m | 256 | feld-brand.js:917 | — | klang.js:376 | GESETZT |
| Narbe der Asche | Stellwert ohne Einheit / h | tiefe 0,3 · 72 h · Nährstoff +0,4 | feld-leben.js:3102 | `_tatSchreiben` feld-leben.js:2627 | `_narbeAt` feld-leben.js:2684–2694; `_naehrstoffAt` vegetation-wiese.js:2097–2109; `_sukzession` :2120 | GESETZT |
| Budget | ms/Bild, Stück | 0,25 / 8 | feld-brand.js:914–915 | — | feld-brand.js:475, 559 | GESETZT |
| `BRAND.licht` | Stellwert ohne Einheit | 4 | feld-brand.js:913 | — | nur die Proben-Mutanten diag-stand-takt.cjs:1499, 1771 | GESETZT (tot) |

**Zählung:** 45 Größen, davon 25 FOLGT, 20 GESETZT, 11 Stellwerte ohne Einheit (Nachbarschaft, minStoff, leb, Bett-Klasse, boden, naesse, glut, Rauch a0/aKill, schein, Narbe, BRAND.licht).
Physikalische Entsprechung haben Last (kg/m²), σ, Tiefe, Heizwert (J/kg), M_x und die Feuchte-Stufen (kg/kg), T_zünd, c, L_v, R (m/s), t_r und I/L.
Reine Stellwerte sind die Menge (`leb` aus dem Rauschen), die Bett-Klasse (aus der Bild-Karte), Boden-Feuchte und Nässe als 0…1, die Glut-Rampe, Rauch, Licht und Narbe.

## 3. DIE FLÜSSE

**Feuer → andere Felder (Leser):**
- Feld/Nexus: `auraAt().glut` + glut der Zelle (feld-leben.js:1862–1874). Der Nexus liest `aura.glut` (feld-nexus.js:183, 284, 439).
- Bild: Flammen auf der Front-Ellipse (`_brandBild` feld-brand.js:605–714, `_brandFlammenZeichnen` :779–880), Rauch-Fahne (:720–765 → `_rauchZeichnen`, siedlung-bewohner.js:134 ff.), Licht (dirigent-kern.js:1800–1810).
- Boden/Stoff: Asche als Kanal G der Boden-Decke (`_brandMalen` feld-brand.js:146–160, `_ascheFlaeche` :173–182), Albedo (stoff-material.js:3256), versengter Halm (vegetation-wiese.js:182–186).
- Klang: die nächste glühende Zelle, Brenn-Fläche cs²·glut (klang.js:374–385).
- Tiere/Menschen: Flucht vor der Glut im noticeRadius (kreatur-furcht.js:53, 87–101); der Bewohner liest nur den Regen (siedlung-bewohner.js:2211).
- Pflanzen: die Tat `brand` (feld-brand.js:575) senkt `lebendig` um 0,3 (`_narbeAt` feld-leben.js:2684) und hebt den Nährstoff um 0,4 (vegetation-wiese.js:2097). Dazu kommen die Sukzession Asche→Gras→Busch→Wald (:2120–2137), Kräuter (`_streuNachBrand` :2188), Bäume (`_baumAlter` :2201–2210, `_tatWaldMalen` :2172–2181) und das Wiedergrün (`_wuchsAt` :2078).
- Speicher: nur die Taten reisen; `brandFeld` wird beim Laden geleert (speicher-laden.js:2692–2700).

**Andere Felder → Feuer:** Wind (`_windAt` → feld-brand.js:321–333), Regen (`state.naesse` → :284), Luft-T (`_temperaturAt` → :315), Wasser (`_nassAt` :224, `_feuchteAt` :268), Gelände (Gefälle und Höhe :225–226), Stoff-Tafel (:244, :301–316), Lebens-Feld (`lebendig` :222).
Zünder sind das Brennglas (koerper-fahrt.js:2355, Schwelle ΔT ≥ T_zünd des Werk-Stoffs :2347), die Fackel (kampf.js:2446), die Lava (siedlung-wege.js:637–653, Decke heißer als T_zünd) und der Akt des Mitspielers (feld-leben.js:2147–2149).
Die Zelle selbst trägt keine Energie-Schwelle: sie fängt, wenn sie Bett trägt, M < M_x und I_R > 0 (feld-brand.js:224, 310, 314, 379).

**FEHLT:**
- Regen ist lokal (`_wetterAmOrt` bild-himmel.js:2843), die Nässe global (bild-himmel.js:3083): Regen am Spieler löscht jeden Brand der Welt, und Regen schreibt keine Boden-Feuchte `boden` der Zelle (`_feuchteAt` liest nur Geometrie; `boden` ist je Brand gemerkt, feld-brand.js:218–219).
- Es gibt kein Luftfeuchte-Feld: `trocken` 0,06 ist fest, und die Temperatur wirkt nur auf Q_ig, nie auf die Bett-Feuchte.
- Das Feuer schreibt weder ins Temperatur-Feld noch Wind (Plume) noch Wetter.
- Der Rauch hat keinen Leser außer dem Bild: keine Sicht oder Nebel, keine Nase der Tiere, kein Licht-Schlucken.
- Das Feuer verletzt keinen Leib (Tier, Bewohner, Spieler), nur die Furcht liest es. Es nimmt keine Werke/Häuser, und es gibt kein Kronenfeuer: Bäume fallen nur über die Narbe (`_baumAlter`).
- Die Menge des Brennstoffs liest nicht die stehende Wiese oder den Wald-Bestand, sondern das Rauschen `lebendig` (feld-brand.js:222). Jenseits der gebauten Chunks gibt es keinen Brennstoff (Täter 2).

## 4. DIE BRÜCHE

1. **fail-soft am Bett (Täter 2):** `_kontaktStoffAt` fällt ohne Boden-Karte still auf `_terrainMaterialAt` (gelaende-kollision.js:1132–1133 → vegetation-wiese.js:2362). Das Feuer liest damit die Karte des BILDS statt einer Welt-Funktion (Gebot 7). Gemessen: 1 926 von 2 401 Zellen „ohne Karte“, Asche ≤ 146 m vom Spieler. Die Probe der Wand weiß es: „das Bett der Wiese liest die Boden-Karte gebauter Chunks“ (diag-stand-takt.cjs:1142–1143) und füllt fehlende Zellen mit Abzügen auf (:1146–1151).
2. **Zwilling der Vegetation:** Die Last kommt aus `lebendig` (Simplex, feld-brand.js:222, 302), die Gegenwart aus der Boden-Karte grün (gelaende-kollision.js:1132), die stehende Wiese aus einem dritten Gesetz. Drei Quellen beschreiben dasselbe Gras.
3. **Wind als Look-Zahl:** U₁₀ = `WX_GESETZ[wort].wind` × 24 (phyto-core.js:4288–4293, 4318); der Kanal hieß „Böen-Amplitude“ (daten.js:105–108). Das Tempo des Brands hängt an diesem Stellwert (Täter 1).
4. **Nässe global gegen Wetter lokal:** bild-himmel.js:3060–3087 gegen 2843–2857.
5. **Fremde Feuchte der wartenden Zelle:** Die Nachbarin erbt `boden` und `mx` ihrer Quelle (feld-brand.js:448). Ob sie erlischt, urteilt die Feuchte der Quelle (:509–510), ihr eigenes Bett erst beim Zünden (:377–378).
6. **Zwei Flächen einer Zelle:** `glut` steht über die ganze Zelle 600–870 s auf 1 (feld-brand.js:421, 515), während die Front unter klar nach 60 s ≈ 20 m² deckt. Das Ohr hört cs²·glut = 256 m² (klang.js:383), das Licht nimmt die Ellipse (dirigent-kern.js:1806), Narbe und Flammen nehmen die Front (feld-brand.js:112–119, 669–682).
7. **Zwei Luft-Temperaturen:** Q_ig liest das Temperatur-Feld (feld-brand.js:315), der Auftrieb des Rauchs T = 300 K fest (:746).
8. **Toter Schreiber:** `BRAND.licht` 4 (feld-brand.js:913) hat im Spiel keinen Leser, nur die Proben-Mutanten (diag-stand-takt.cjs:1499, 1771).
9. **Konstanten neben dem Modell:** ρ_p gras 350 statt 513 kg/m³ (schmiede-core.js:2907); δ gras = Halm-Höhe des Bilds 0,42 m statt FM1 0,3048 m (stoff-material.js:3825–3827).
10. **Stellwerte ohne Anker:** `minStoff` 0,15 (:900), `aufS` 4 s (:896), `jeS` 12 (:955), `schein` 7,5 (:946), `hoerM` 256 (:917), Narbe 0,3 / +0,4 (feld-leben.js:3102).
11. **Kein Speicher:** Ein Reload löscht den Brand (speicher-laden.js:2697–2700; Absicht nach feld-brand.js:204).
12. **Kein Glimmen:** Die Zelle fällt bei `ende` sofort zu Asche (:519–520); eine Glut nach der Front (Nachglühen) gibt es nicht.

## 5. Sprossen (meisterkarte-2)

**Nicht gelesen:** `origin/koordination` fehlt im Klon, Fetch war verboten; auch die Stations-Datei (Zweig punkte-maschine `meisterkarte-quelle/punkte/stationen`) ist nicht gelesen.
Im Code zitiert sind:
- `karte2.same.kopplung.kaskade#1` (aus dem Brief: trocken 60 s ≥ 200, Regen) — heute 1 / 7 s, siehe 1a.
- `karte2.same.kopplung.ereignis` (siedlung-wege.js:515, Lava-Glut).
- `same.physik.feuer S1` (die Fackel, kampf.js:2298, 2421–2446).
- `feld.K3#2` (Brand auf dem Feld, feld-brand.js:194).
- `stoffe.K2`/`K2#2` (Rothermel, Bett, Feuchte, Bild, feld-brand.js:194–339).
- `stoffe.K5#2` (Sukzession, vegetation-wiese.js:2111).
- `wetter.K2` (Nässe, bild-himmel.js:3054).
- `w28-brand-flucht` (kreatur-furcht.js:53).

## 6. NICHT VERIFIZIERT

- **Nicht gelesen:** die Station `kaskade#1` selbst (Ort, Wort, Zähl-Art). Dass sie unter klar zählt, schließe ich aus der Deckung: 1 Zelle nach 60 s und 7 s Regen trifft nur klar; bewölkt gäbe 10.
- **Nicht gelaufen:** der echte Loop mit GPU-Renderer und Profil voll. Der Ring war im Null-Renderer 2 Chunks, die Bett-Grenze im Spiel ist ungemessen. Ebenso nicht gelaufen: Radeon/GTX, die Mehrspieler-Seite, die Zündung über Lava und Brennglas.
- **Nicht gemessen:** das Tempo eines Laub-Betts (nur Gras am Herd).
- **Nicht gegen BehavePlus geprüft:** R 0,074 m/s bei 0,48 m/s Flammenwind (die Gleichungen gelesen, nicht nachgerechnet).
- **Nicht im Detail gelesen:** `_brennWaerme` (koerper-fahrt.js:2369 ff.) und `_naesseKurve`.
