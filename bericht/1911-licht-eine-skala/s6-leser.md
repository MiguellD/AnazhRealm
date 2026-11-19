# S6 „kein Leser ohne k_vor“: gegengelesene Tafel

Stand: Arbeitsbaum `licht-eine-skala` (f9d373017 mit den uncommitteten Änderungen), nur gelesen. Ich habe alle ROT-Zeilen und 14 grüne Zeilen am Code geprüft. Danach habe ich nach Lesern von `scenePass` / `getTextureNode` / `renderTarget` / Spiegel-Ziel gesucht, die in der Tafel fehlen.

**Bezug (bestätigt).** P0 schreibt `output × k`, gedeckelt bei 32 768: `stamm/bild-kosten.js:2315-2317`. Zurückgenommen wird mit `÷ VB.k`: `stamm/bild-kosten.js:2525`. `kBild` wird direkt nach `pp.render()` gesetzt: `stamm/dirigent-takt.js:2584-2586`. Danach laufen der Spiegel-Pass (`:2603`) und der Rückstrahl (`:2607`).

## (1) Korrigierte Tafel

| Leser | Datei:Zeile | a/b/c | Beleg (gekürzt) |
|---|---|---|---|
| TRAA Eingang (Jetzt, Varianz-Klemme) | stamm/bild-kosten.js:1877, 1957-1960 | b | `c = ein.load(t).rgb.max(0)`. Das Mittel ± sigma skaliert linear mit k, es gibt keine absolute Schwelle |
| TRAA Geschichte (P1) | stamm/bild-kosten.js:1818-1820, 1904-1905 | a | `hist = vec4(histRoh.rgb.mul(this._kWechsel), …)`, `_kWechsel = kJetzt / _kDavor` aus `r.toneMappingExposure`. Das ist derselbe Wert wie `VB.k`, wird aber nicht über `_vorBelichtung()` geholt |
| TRAA Flimmer-Dämpfung (P4) | stamm/bild-kosten.js:1961-1965 | b | `alpha.div(luminance(jetzt.div(max(…).add(1))).add(1))`. Am Ort steht nur „r184 flickerReduction“ (:1961). Als belichtet benannt ist sie nur zentral (:2264-2265) |
| Nach-Schärfe (K50) | stamm/bild-kosten.js:2436-2448 | b | `scharf.clamp(mn, mx).sub(roh)`, linear und skaleninvariant |
| Bloom / Streulicht (P4, P5) | stamm/bild-kosten.js:2369, 2449-2457 | b | `smoothstep(u.bloomThreshold, …, l)`, `c.mul(m).div(l.add(1))`. Am Ort benannt (:2453-2455). Der Uniform-Kommentar :2366-2368 trägt noch die alte Bedeutung |
| Godray-Marsch (P4) | stamm/bild-kosten.js:1573-1577; Schwelle :2388 | b | `smoothstep(u.godrayThreshold, …, luminance(cI))`. Benannt ist er nur zentral (:2264). Der Kommentar am Ort (:2383-2384) ist alt. Die Summe geht vor `÷ VB.k` in `bloomed` (:2503) |
| **Lokaler Kontrast (P4)** | stamm/bild-kosten.js:2507-2516 | **c** | `detail = selfLum.sub(localAvg)`; `bloomed.mul(detail.mul(u.localContrast))`. Der Term ist ∝ k², nicht geteilt und nicht benannt. Die Liste :2264-2265 lässt ihn aus. Er wirkt über den Spieler-Regler `kantenSchaerfe` (stamm/dirigent-kern.js:342 Default 0, stamm/stoff-material.js:3695, stamm/werkstatt-hud.js:2125) |
| Nacht-Auge (P6) | stamm/bild-kosten.js:2194, 2198, 2205; Ruf :2523 | a | `lin = (l) => (vor ? l : l.div(this._vorBelichtung().k))`. `bildZapfen` ist benannt (:2203, :3032) |
| Ausgabe der Kette | stamm/bild-kosten.js:2525, 2543 | a | `graded = gesehen.max(vec3(0)).div(VB.k)` |
| **Farbsicht-Ausgabe (spielgang.K4)** | stamm/bild-kosten.js:2538-2539; eingehängt :2169-2171 | **c** | `farbsicht: gesehen.add(farbsichtDelta).max(vec3(0,0,0))` hat kein `÷ VB.k`. `_zugangTakt` setzt `pp.outputNode = ppu.ausgabe.farbsicht`, sobald eine Art gewählt ist. Dann steht das Bild k-fach falsch vor der Tonkurve |
| Spiegel-Pass, Bild-Abgriff (P3) | stamm/bild-sicht.js:999-1005 | a | `texture(farbe, …).level(0).rgb.div(kBild)` |
| **Spiegel-Pass, „Himmel des Bilds“** | stamm/bild-sicht.js:1161 (`farbe` = Szenen-Ziel :781) | **c** | `mix(texture(farbe, uvI).level(float(0)).rgb, aus.rgb, aus.a)`. Kein `÷ kBild`, so kommt `L × k` in den L-Puffer des Spiegels |
| Rückstrahl (P3, P7) | stamm/bild-schatten.js:115, 185-186, 191 | a | `farbe.load(px).rgb.div(this._vorBelichtung().kBild)`. Die Grenze `weissBoden` steht in L (:293-299) |
| Wasser (P3) | stamm/wasser-hydro.js:814, 833 | a über den Spiegel, erbt c | `sp = texture(S.rt.texture, suv)`; `himmel = sp.rgb.mul(deckt).add(…)`. Liest das Spiegel-Ziel (L) und erbt den ROT von bild-sicht.js:1161 |
| **Spiegel-Umgebung jedes Stoffs (material.K4)** | stamm/bild-sicht.js:730-731; eingehängt stamm/bild-himmel.js:723 | a über den Spiegel, erbt c | `sp = T.texture(L.rt.texture, uv)`; `sp.rgb.mul(k).add(himmel…)`. Sie ist `scene.environmentNode`, also lesen jeder Standard- und Physical-Stoff (Glas, Lack, Metall, Nässe) dasselbe Spiegel-Ziel und erben den ROT von bild-sicht.js:1161 |
| **Zerlege-Linse, Schalter `nachbild`** | scripts/lib/zerlege-linse.cjs:22, 1484 | **c (formal)** | `pp.outputNode = st.traaNode ? st.traaNode.getTextureNode() : st.scenePass.getTextureNode()`. `L × k` geht ohne `÷ k` und ohne Benennung in die Tonkurve. Die Linse misst nur Zeit (Kopf :1-5), deshalb ändert das ihre Zahl nicht. Das Bild in diesem Zustand ist aber k-fach falsch |
| Mess-Kette (P2) `_augeKetteZeichnen` | — | ungelesen | Kein Treffer für `augeKette` im ganzen Repo außer vendor/worlds. Im Arbeitsbaum ist sie nicht vorhanden |
| Lichtmesser / Belichtung | stamm/bild-himmel.js:1945 | kein Leser | `_waagrechtIrradianz` liest die Bestrahlungs-Tafel, nie das Szenen-Ziel |
| Albedo-Eichung (Bauplan `albedo-tafel.cjs:234`) | scripts/lib/albedo-tafel.cjs:426 (Ziel), 428 (Rücklese), 694-698 | kein Leser | Eigenes HalfFloat-Ziel, `R.render(sc, cam)` ohne MRT-`× k`, also L. Die Bauplan-Zeile :234 ist heute `tafelUrteil` (veraltet) |
| Licht-Bilanz (Bauplan `licht-linsen.cjs:692`) | scripts/lib/licht-linsen.cjs:695-726 | kein Leser | `linsenZiel`: eigenes HalfFloat-Ziel über `rend.render`, ohne `× k`, also L |
| post-kette `DUNKEL_NACHT_LICHT` (P4) | scripts/diag-post-kette.cjs:112-115, 496 | b | `0.02` „bei Belichtung 1“ (k = 1: beide Räume gleich), so benannt |

Gegengeprüft und ohne Wert-Leser:
- `stamm/bild-himmel.js:1785`, `stamm/dirigent-takt.js:2563`, `stamm/bild-schatten.js:1624`, `scripts/playtest/bild.cjs:1752` lesen nur Maß und Skala.
- `scripts/lib/ziel-zensus.cjs:320, 744` urteilt nur über das Format.
- `stamm/bild-kosten.js:2051-2064` (`_ausgabeDither`) ist Schreiber, nicht Leser, und skaleninvariant (ulp relativ).
- `transmission` / `viewport*Texture` haben im Stamm keinen Treffer.

## (2) Korrigiert

1. **Neu, erbt ROT:** Die Spiegel-Umgebung `stamm/bild-sicht.js:730-731` fehlte. Sie ist `scene.environmentNode` (`stamm/bild-himmel.js:723`) und damit der zweite Erbe von :1161, mit mehr Reichweite als das Wasser.
2. **Neu, ROT formal:** Die Zerlege-Linse `nachbild` (`scripts/lib/zerlege-linse.cjs:1484`) fehlte. Sie liest das Szenen-Ziel ohne `÷ k` und ohne Benennung. Ihre Zeit-Zahl ist davon nicht berührt.
3. **Nebenbefund zurückgenommen:** In einem L-Ziel ohne `× k` (`linsenZiel`, Albedo-Eichung) liefert ein Stoff der Klasse Erscheinung `bildwert ÷ k`. Das ist genau seine L-Lage (`stamm/bild-kosten.js:2245-2247`) und darum konsistent, nicht „um 1/k daneben“. Falsch wäre es nur, wenn eine Linse dort den Bildwert selbst erwartet. Ob eine das tut, habe ich nicht gelesen.
4. **Nur Belege präzisiert, Urteile unverändert:**
   - Albedo-Eichung: Das Ziel steht auf `:426`, die Rücklese auf `:428`.
   - TRAA Eingang: die Klemme steht auf `:1957-1960`.
   - Rückstrahl: `farbe` ist das Szenen-Ziel (`:115`).
   - Lokaler Kontrast: die Regler-Pfade ergänzt.
5. **Bestätigt:** Alle drei ROT-Zeilen des Arbeiters (`stamm/bild-kosten.js:2514-2516`, `:2539`, `stamm/bild-sicht.js:1161`) stimmen im Code. Die 14 grünen Stichproben stimmen ebenfalls.

## (3) Endsummen

- 21 Zeilen. 16 Leser rechnen am Szenen-Ziel, davon 2 nur mittelbar über das Spiegel-Ziel (Wasser, Spiegel-Umgebung). Dazu kommen 4 Bauplan-Einträge ohne Leser oder ohne Code (Mess-Kette, Lichtmesser, Albedo-Eichung, Licht-Bilanz) und die Sonde `DUNKEL_NACHT_LICHT`.
- a: 7 (davon 2 über den Spiegel). b: 6 (davon die Sonde). c: 4.
- **ROT: 4**, dazu 2 geerbt:
  1. `stamm/bild-kosten.js:2514-2516` (lokaler Kontrast, k²)
  2. `stamm/bild-kosten.js:2539` (Farbsicht ohne `÷ VB.k`)
  3. `stamm/bild-sicht.js:1161` (Himmel des Bilds ohne `÷ kBild`)
  4. `scripts/lib/zerlege-linse.cjs:1484` (`nachbild`, formal ROT, ohne Wirkung auf die gemessene Zeit)
  - Geerbt über (3): `stamm/wasser-hydro.js:833` und `stamm/bild-sicht.js:730-731`

Geschnitten: nichts (der Auftrag war nur lesend).
Gemessen: 16 Leser des Szenen-Ziels, 4 ROT plus 2 geerbt. Der Arbeiter hatte 14 Leser und 3 ROT plus 1 geerbt.
Pflicht-OFFEN Rest: A, B, C, E, F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND