# 22 Das Stoff-System — die Wand des Hauses trägt keinen Stoff, das Himmels-Bild des Reliefs hebt die Albedo

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/genom-spiel/frontal.png` (Dorf, Mittag): Das zweistöckige Haus hat eine reinweiße Wand ohne Korn, ohne Kellenzug und ohne Sockelstein. Vom Erdgeschoss bis zur Traufe ist der Ton gleich, nur die Kanten heben sich ab. Das Dach ist eine braune Fläche mit Saum. Der Boden davor ist ein körniger brauner Teppich mit starkem Rauschen.
- `scratchpad/dorf-main-0.5.png`: Dasselbe Bild beim Langhaus rechts (graue glatte Wand, flache Fensterkästen). Das Haus links ist ein brauner Kasten. Auf dem Platz liegen violette Weg-Streifen ohne Kante.
- `scratchpad/studio-welt/werk-viktorianisch-L0-mittag.png` und `kandidat-fachwerk-bild.png` (Werk-Bühne, Engine der Welt): Bei L0 tragen Dach und Backstein ein feines Raster aus Geometrie. Je weiter weg das Haus steht, desto flacher wird es.
- Die Schüsse der Albedo-Tafel (`material.K3_*.json.d/albw/welt-*.png`) habe ich nicht angesehen.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; KANN gegen KONSUMIERT)
**Das Gesetzbuch KANN:**
- Das Labor malt vier Relief-Karten:
  - Putz-Kellenwurf `texPutz` (fachwerk-core.js:1823)
  - Biberschwanz `texDach` (:1811)
  - Läuferverband `texZiegelwand` (:1799)
  - Quaderverband `texStein` (:1832)
  - Sie hängen an `putz`/`ziegel`/`backstein`/`stein` (:1912–1930).
- Die Welt kennt EIN Mikro-Relief: `_mikroRelief` (stoff-material.js:2664) und `_mikroStoff` (:2739). Dazu kommt EIN Substanz-Kern mit Korn, Kavität, Verwitterung und Moos: `_substanceCharacter` (:2847).

**Die Welt KONSUMIERT:**
- Die Brücke reicht nur Regler über die Naht: Rauheit, Metall, flach, Umgebung, Glut, Deckkraft, Seh-Klasse (phyto-core.js:5508–5540, 5542–5568). Eine Karte reist nicht mit.
- Der Studio-Stoff einer Bau-Fläche (`kind` „unknown", glatt, deckend, ohne `stein`/`webe`) endet im letzten Zweig. Dort steht nur `colorNode = Vertex-Farbe` (studio-stoff.js:594–598): kein Korn, kein Relief.
- Das Mikro-Relief bekommt nur der facettierte Stein: `mikro = flat && kind === "unknown"` (studio-stoff.js:275, Ruf :626–629).
- Das betrifft Hausstufe L0 (studio-gestalt.js:310/315) und den Bau-Satz L1 (siedlung-satz.js:70–79, Rauheit je Ecke in `aRegler.x`, studio-stoff.js:602–615).
- Zwilling der Tiefe: Ein Bauplan-Haus der Werkstatt (`_archLeafMaterial` → Werk-Stoff, siedlung-bauten.js:915–947) läuft durch `_substanceCharacter` (stoff-material.js:1797–1817). Das Fachwerk-Haus der Welt bekommt nichts davon. Dieselbe Klasse wird also in zwei Tiefen gezeichnet.

**Albedo (material.K1 = 0 Punkte):**
- GTX und Radeon an ec281422 messen W/L: fels 1,1056 und boden 1,2969 bzw. 1,2957. Die anderen 11 von 13 Zeilen liegen in 0,9–1,1.
  - Quelle: pm `roh/ec281422-radeon/material.K1_1.json` und stand.json:2166.
- Der Verlauf des Bodens an der festen Stelle −48,23/−19,44 (spec/farbe/albedo-tafel.json:546–573):

  | Stand | Kopf | W/L boden |
  |---|---|---|
  | Tafel | – | 0,989 |
  | bis 10.11. | – | ≈ 1,04 |
  | ab w27-boden-nah-2 (dcc33615) | – | 1,12–1,13 |
  | 11.11. | c4010773 | 1,1286 |
  | ab 12.11. | f46b9e81 | 1,29 |

- Beim Sprung von b1531071 auf f46b9e81 kippt die Welt-Farbe am Messpunkt von rgb 0,131/0,088/0,051 (braun) auf 0,112/0,113/0,039 (oliv). Grund: w28-stadt-grund (b065ed91a) malt den Gürtel des Genesis-Orts als Rasen (stamm/siedlung-wege.js:1478–1486). Die Zeile misst dort nicht mehr den Waldboden des Labors.
- Fels:
  - Der Kommentar in `_mikroStoff` nennt das Himmels-Bild (aoNode) im Mittel 1,13 (stoff-material.js:2734).
  - Das FUND-REGISTER.md:119 nennt das als Ursache: „Welt ~6 % heller als Labor (fels 1,107)".
  - Die Albedo-Tafel misst unter weißem Umgebungslicht (scripts/lib/albedo-tafel.cjs:7). Jede Fläche mit diesem aoNode liest dort also zu hell.
  - Ein Relief, das Himmelslicht verstärkt (> 1), ist physikalisch keine Verdeckung.

**Glanz und Nässe:**
- material.K5 = 1 Punkt: 3/4 Klassen im Band. Eisen liegt bei θ50 10,26° neben dem Band (stand.json:2306/2316).
- material.K4 = 1 Punkt: Lack spiegelTreue 0,4468 < 0,5, Glas 0,7656.
- Nässe fließt in jeden beleuchteten Stoff über `_leuchtStoff` → `_naesseImStoff` (stoff-material.js:2046, 2078–2106; Gesetz Lagarde :2157). Sie wird also konsumiert.

**Mikro (material.K2 = 1 Punkt):** Gemessen sind nur Boden und Fels (stand.json:2214/2224). Für Staffel 2 (Putz, Holz) gibt es keine Station: „material.K2#2 kein Werkzeug" (meisterkarte.json:2124).

## Die EINE begrenzende Entscheidung
Das Mikro-Relief wird EIN Gesetz für JEDE matte, deckende Fläche der Welt: Boden, Fels und Bau-Wand gleichermaßen. Es muss in Albedo UND Himmelslicht mittelfrei sein. Vorher darf es keine weitere Fläche bekommen, denn sonst hebt es Haus-Albedo und Stufen-Ton um bis zu 10 % (material.K1/K3 haus).

## Der Schnitt (die Klasse ganz)
**Stufen** (alle in einer Welle, Haus von Auge, Hügel und Dach ansehen):
1. Das Himmels-Bild von `_mikroStoff` wird durch sein Mittel bei Ausblende k geteilt. Ort: stoff-material.js:2744–2745. Danach gilt E[ao] = 1 wie beim Korn (K53, :2736). Das trifft Boden, Fels, Stein und Gestalt auf einmal.
2. `mikro` gilt für jeden deckenden Bau-Stoff `unknown`: `!(R.op<1) && !R.ub && !mp.stein && !mp.webe && !wiegen && !klasseLook` (studio-stoff.js:275).
   - Gewogen wird mit der Rauheit wie heute (:626–629, `smoothstep(0.3, 0.6, rauh)`). Putz 0,94, Holz 0,88 und Ziegel 0,82 bekommen damit das volle Relief, Metall und Glas keins.
   - `_mikroGestalt(…, flach = flat)`: glatte Flächen nehmen die Geometrie-Normale (:2763).
3. Die Signatur trägt `mikro:f` gegen `mikro` (studio-stoff.js:732). Ohne diese Trennung teilen sich facettierter Fels und glatte Wand EINEN Graphen (`_graphTeilen`, :110–122). Das wäre die Klasse von w13-fels-korn, nur aus der anderen Richtung.
4. Fuge vor Korn: Im Zweig w28-stoff-fuge steht der Fugen-Stoff unter `!mikro`. Die Bedingung wird `!flat`, und `_fugeStoff` setzt colorNode, bevor `_mikroGestalt` das Korn darauf legt.

**Leser-Liste:**
- `_mikroStoff`: Boden stoff-material.js:1935, Fels :900, `_mikroGestalt` :2768, `_steinStoff` :2828 (Tore).
- `mikro`/Signatur:
  - L0 Haus studio-gestalt.js:310/315
  - Bau-Satz L1 siedlung-satz.js:79
  - Nah-Streu vegetation-wiese.js:1906 (wiegen → ausgenommen)
  - Nässe :747 → stoff-material.js:2084 (liest den neuen colorNode)
- Linsen, die das Ergebnis lesen: Albedo-Tafel (haus, fels, boden), material.K3 (haus L1/L0), material.K2 Arm-Linse (`armUrteil`, scripts/lib/abnahme-urteil.cjs:517).

**Kosten-Zeile:**
- Je Wand-Fragment 9 Rausch-Ebenen (3 Ebenen × 3 Oktaven, stoff-material.js:2699–2720). Das läuft ohne Zweig auch jenseits von `lodFar` 95 m (daten.js:747–750).
- Kein neues Programm: Die Signaturen „unknown|…|satz" werden ersetzt, nicht vermehrt. Der Fragment-Text der Bau-Programme wächst.
- Pflicht vor der Abgabe:
  - gpu-bank Dorf Ego, vorher↔nachher (GTX 1050 Bild ≤ heute)
  - „Bild − Renderer kalt" (B als Kosten-Zeile)

**Kriterien:**

| Kriterium | Ist | Soll | Station |
|---|---|---|---|
| material.K1 | 0 | 1 (alle Zeilen W/L 0,9–1,1) | #1/#2 gtx+radeon. Schnitt 1 bringt fels unter 1,1. boden bleibt offen (s. u.) |
| material.K2 | 1 | 2 (Putz, Holz am Pixel, beide Geräte) | #2 fehlt. Die Arm-Linse wird an der Haus-Wand gelesen, 0,5/1/2 m (kein neuer Apparat, derselbe `armUrteil`) |
| material.K3 | 2 | darf nicht fallen | haus L1/L0 1,008/1,013 (stand.json:2257/2266) |

Bildpaar: Dorf der Ankunft, feste Kamera wie `genom-spiel/frontal.png`. Dazu die Haus-Wand auf 1 m und vom Hügel.

## Was schon liegt
- `w28-stoff-fuge` 212b6de9 (WIP, OMEN, auf stadt-grammatik):
  - `_fugeStoff` im schlichten Zweig, Raster `aFuge` in den vierten Komponenten (0 Byte)
  - Stufe 0 baut den Verband Stein für Stein, Goldens neu, 113/258 Fälle
  - Es fehlt: der Kopf zur Abgabe, CI, ein Bildpaar und die Umstellung `!mikro` → `!flat`.
- `w28-fassade` b038852b (WIP, Öffnung, Gliederung, Ton). Wartet auf das Erbe von stadt-grammatik.
- `w28-stoff-gesetz` ist gelandet (Licht, Bruch und Klang lesen EINE Zeile des Schmiede-Kerns).
- `w28-stoff-stufe-null` 0343f9e8: nur ein Spike für B (kalt 16,8 → 13,7 s, erstes Bild weiß). Nichts zum Landen.
- Die Reihenfolge der OMEN-Kette ist mp-boden → stadt-grammatik → fassade → stoff-fuge (UEBERGABE §4). Schnitt 2–4 gehört in die Welle von stoff-fuge. Schnitt 1 kann allein auf main.

## Ehrlich offen
- **boden 1,297:** Die Messstelle liegt seit w28-stadt-grund im Rasen des Orts-Gürtels. Die Zeile misst einen anderen Stoff als das Labor (Waldboden). Das ist keine Drift des Stoff-Gesetzes. Eine Lösung braucht die Entscheidung des Koordinators über das Exemplar. Ohne sie bleibt K1 auf 0, auch nach Schnitt 1.
- Das Mittel 1,13 des Himmels-Bilds habe ich nicht selbst gemessen; die Zahl stammt aus Kommentar und FUND-REGISTER. Wie viel von fels 1,1056 nach Schnitt 1 übrig bleibt, ist ungemessen.
- Nicht gelesen: die Mikro-Rechnung des Labors (worlds/terrain), `_rauschAtlas` und die Kosten je `ebeneNeigung`, `_terrainGeologyAlbedo` ab :3022, das Leucht-Gesetz der Glut, die Stoff-Tafel `state.materials` (stoffe.K1–K5 sind headless grün, aber ihre Stationen sind veraltet), `_buildToonNodeMaterial`.
- Widerspruch zum Kurs: Pflicht A „haus" ist GRÜN (die Soll-Tafel misst nur das Albedo-Verhältnis, spec/abnahme/soll-tafel.json:1290–1313), obwohl das Bild glatte Kästen zeigt.
- Die Relief-Karten des Labors (Kellenwurf, Biberschwanz) haben auch nach dem Schnitt keinen Leser in der Welt. Das Korn ersetzt den Kellenwurf. Das Muster des Biberschwanzes trägt erst das Raster einer Dach-Fuge, und die gibt es noch nicht.

## Rang
- **Schnitt 2–4** (Wand mit Korn und Fuge, Klasse Bau): Wirkung im Bild 4. Aufwand M. Risiko: Fragment-Kosten an der Dorf-Fassade auf der GTX 1050 und Signatur-Kollision Fels/Wand, wenn `flat` nicht in der Signatur steht.
- **Schnitt 1** (Himmels-Bild mittelfrei): Wirkung im Bild 2 (Fels/Boden im Schatten ~10 % dunkler), Takt 0. Aufwand S. Risiko: material.K2 nyquist/glatt am Boden verschiebt sich und muss nachgemessen werden.
