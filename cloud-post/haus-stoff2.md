# haus-stoff2 — Abgabe (ZWISCHENSTAND)

Zweig `haus-stoff2` vereint drei Zweige: `haus-gestalt` 5e497a9f (die Bauweise folgt dem Klima), `haus-stoff` samt Heilungen
866f1a79 (der Sockel folgt dem Wasser) und `haus-dach-wip` 5f0f608d (die Deckung folgt dem Ort). Darauf liegt origin/main b1ce8ba8
(V18.546.404, trägt `w28-ort-ausstattung`) und danach origin/main 2d6a0447 (V18.546.405, trägt `w28-sport-regeln`). Die Sprosse ist `karte2.mensch.bau.bauen#1`. Diese Abgabe bucht keine Sprosse: gebucht
wird erst, wenn der Richter sie grün misst. Karte 2 gebucht 90 von 1 718 (`vision/karte-2-stand.json` im Zweig `punkte-maschine`).

## Die Vereinigung

- `haus-dach-wip` mischte ohne Konflikt. Er trägt zwei Stufen:
  - Stufe 1: `DECKUNG_GESETZ` und `ortDeckung`. Reet ≥ 45°, Mönch-Nonne 40°, Biber 30°, Schiefer 26,5°, Holzschindel 22°,
    Hohlziegel 16,7°. `stroh` steigt von 38° auf 45°.
  - Stufe 2: das Reet trägt den Ton des Wetters, und das Los ohne Boden fällt beim Namen in die Bilanz.
- origin/main hatte einen Konflikt, nur im Golden `spec/asset-contract/v6/golden/siedlung.json`. Das Golden ist für den vereinten Stand
  EINMAL neu geprägt: 2 von 2 Fällen (7/12 „Villaalto“ und 12345/6 „Grünbach“), Slots und Namen gleich.
- **Heilung der Linse.** `gate:settlement` Teil O „der Ort hält jede Zahl“ zählte am Auto-Dorf zwei fremde Bauten im Erdbau:
  `fahrzeug_kompakt_fwd` und `fahrzeug_suv`. Das sind die Wagen des Orts selbst (stamm/siedlung-verkehr.js `_verkehrWagenStellen`), sie
  parken an der Wende seiner Gasse. Das nordische Dorf trägt Wenden, das antike von main trug keine. Die Linse schließt `_verkehrWagen`
  aus. Gemessen: 2 → 0.
- **Heilung im Ort: das Stück am Haus folgt der Nummer seines Slots.** `gate:haus-welt` Teil 2, W9 Zug, stand bei 15 von 16 freien
  Slots: die Schmiede #10 des nordischen Start-Dorfs fehlte. Gemessen am Spawn: ihr Schild und ihr Relief standen 155 ms vor ihr,
  gehoben vom Haus auf Nummer 10, und die Schmiede fiel an der „Bau-Wand an schild_dorf #4014266161“. Der Grund: nach dem Reload
  standen 3 von 17 Häusern, der offene Zug (`stamm/siedlung-ort.js` `_dorfZugOffen`) nummerierte die Slots neu (die Schmiede auf 8),
  die Stücke am Haus (`gegenstaende[].slot`, ort-ausstattung von main) behielten die Nummer des Exports. Dieselbe Klasse im Kern:
  `fachwerk-core.js` `ortPlan` nummeriert nach dem Wasser (`neuSi`) nur die Wandlaterne um. Beide folgen jetzt ihrer Nummer.
  Gemessen: W9 Zug 15 von 16 → 16 von 16. Die Linse nennt den Täter jetzt beim Namen (jeder freie Slot ohne Bau mit Kultur, Rolle, Ort).
- **Lehre 11.** Der Labor-Plan ohne Klima ist strukturell gleich. Gemessen über 6 Exporte (7/18, 4291161376/13, 1/18, 3/10, 42/60,
  9/200) und 3 Kacheln der Stadt 501/2000: 2 012 Zahlen weichen um höchstens 6,6·10^-9 m ab, kein Feld fehlt, die Kacheln sind
  byte-gleich. Der Hash ändert sich trotzdem (main dc2a6bd78c4805fb, Kopf b02135d09a6ca965). Grund: die Drehung liegt seit
  haus-stoff Heilung 2 im Raster 2^-30 (`drehQ`).
- **Die Gegenproben in gate:settlement Teil R:**
  - R1: keine Region außerhalb des Klima-Bands.
  - R3: Heimat 49,6° gegen Mittelmeer 25,1°.
  - R5: der Sockel trocken 0,30 · Heimat 0,55 · nass 0,80 m.
  - R6: 0 Deckungen unter ihrer Regeldachneigung.
  - R7: nass Reet 17 bei 45,12°, trocken Schindel 17 bei 41,47°.

## Das Bild (Radeon 890M, WebGPU, Uhr 0,5, Werkbank --echt, Messort dorf)

Die Dorf-Kamera ist auf beiden Seiten dieselbe: −718,22 48,24 −877,12 → −720,95 46,24 −936,24.

| | main b1ce8ba8 | Kopf |
|---|---|---|
| Bild | C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/bild/main-dorf.png | …/bild/kopf-dorf.png |
| ms (Bild) | 714 | 637 |
| Dreiecke | 386 458 | 360 992 |
| Abnahme | GRÜN | GRÜN |

- main zeigt weiße Putz-Kuben mit blauem Flachdach (griechisch) und einen orangen Ziegelbau.
- Der Kopf zeigt das nordische Dorf „Skogberg“: Holzhäuser mit Ständer- und Riegelraster, steile Dächer, einen Stein-Kirchturm mit
  Spitzhelm und Rauch aus den Schornsteinen. Rechts im Bild steht ein Holzhaus auf einem Sockel aus Stein-Quadern.

**Die Pose von `mensch.bau.huelle#1`** (10 m vor der Tür des ersten Wohnhauses, Auge 1,7 m, Blick auf die Hausmitte 2,5 m):

- Kopf: …/bild/kopf-haus10.png, haus_russisch, Pose −688,04 47,07 −896,59 → −698,97 47,89 −887,83.
- main: …/bild/main-haus10.png. Dort stand die Kamera vor der Putzwand eines griechischen Hauses, 14 m.

**Was ein Profi am Kopf-Bild sofort bemängelt, gegen das Vorbild (Schwarzwaldhaus, Vogtsbauernhof).** Ich schätze etwa 25 %.

- Gestalt: es ist ein dreigeschossiger Blockbau mit flach wirkendem Satteldach. Das Vorbild hat ein tief gezogenes Walmdach über einem
  gemauerten Erdgeschoss.
- Wand: das Gefach liegt als Holz auf Holz, ohne Lehm oder Putz. Die Hölzer haben keine Maserung und keine Alterung.
- Fenster: die Sprossen-Teilung sitzt ungleich, mehrere Flügel stehen schief offen.
- Tür: ein flaches Blatt ohne Rahmen-Tiefe.
- Sockel: der Stein-Sockel und die Stufe stehen, das ist der Gewinn von haus-stoff.
- Dach: der Dachüberstand ist knapp, die Schindel trägt keine sichtbare Textur.
- Links liegt ein schräges Brett auf dem Boden, vermutlich die Kellerluke des Nachbarhauses.

## Die Stationen (Radeon, je Station ein Einzel-Lauf `--nur`)

- `karte2.mensch.bau.bauen#1` (K4 fachwerk Labor ↔ Welt, Soll ≤ 2,1 %): ROT.
  - main b1ce8ba8 97,6 %, Kopf 0c811450 97,6 %. Die Pixel an den Mess-Stellen sind gleich, die Kette bewegt die Station nicht.
  - Die Gestalten decken sich: 251 143 von 252 623 Pixeln liegen auf beiden Seiten, nur 0,6 % trägt eine Seite allein.
  - 97,0 % trägt die Luma, die um mehr als 18 springt.
- **Der Täter der 97,6 %** ist `worlds/fachwerk/fachwerk.js`, der Block „Szene (statisch)“ mit `setZeit`/`ZEIT`. Die Bühne des Labors
  zeichnet noch auf three r128 (WebGLRenderer, ACES 1,12) unter eigenem Licht: Sonne 2,1, Hemisphäre 0,62, Ambient 0,22. Die Bühne der
  Welt (`AnazhHuelle.buehne`, welt-licht.js `buehne`) trägt sie nicht. Garage und Schmiede tragen sie und liegen bei 13,3 % und 24,8 %.
  - Am Bild gemessen, Luma Bühne → Welt:
    - sonnige Dachfläche 106 → 54 (×0,51);
    - Giebel im Schatten 128 → 16 (×0,13);
    - Schornstein 168 → 45;
    - Veranda-Boden 138 → 31.
  - In der Bühne ist der Schatten-Giebel heller als das sonnige Dach. Das Band dazu: Daylight (Wikipedia, Tabelle): direkte
    Mittagssonne etwa 120 000 lx, Schatten unter klarem Himmel etwa 20 000 lx, also Schatten : Sonne ≈ 1 : 6. Die Welt liegt im
    Band, die Bühne nicht.
  - „Luma der Bühne“ des Vorgängers stimmt am Bild: Nicht das Haus weicht ab, sondern das Licht des Labors. Der Schnitt ist der Umzug
    des Labors auf `AnazhHuelle.buehne`, wie ihn garage.js trägt (w28-studio-welt).
- `siedlung.K1#2` (= `mensch.bau.innen#2`, Soll: jedes Haus innen ÷ Außen-Schatten ≥ 0,15): ROT auf beiden Seiten.
  - main b1ce8ba8: 18 von 18 Häusern begehbar (Tür → Keller → Dachboden, Hub max 0,20 m), Innen-Bild 5 von 18 lesbar, min 0,042, Median 0,172.
  - Kopf 0c811450: 17 von 17 begehbar, Innen-Bild 6 von 17 lesbar, min 0,097, Median 0,175.
  - Der Täter ist das Licht im Haus, nicht die Gestalt: dunkel bleiben u. a. haus_gotisch 0,016, haus_alemannisch 0,024,
    haus_niedersaechsisch 0,007 (Licht durch Fenster und Tür, kein Leser im Haus).
- `mensch.bau.huelle#1` und `mensch.bau.bedarf#1` sind Panel-Sprossen (R11), sie wurden nicht gefahren. Das Bild an der Pose von
  huelle#1 steht oben.

## OFFEN (je Punkt: Grund · Messname · Leser)

- **Innen-Bild 6 von 17 lesbar.** Das Haus innen trägt kein Licht über ÷ 0,15 des Außen-Schattens. Messname: siedlung.K1#2 ·
  Leser: die Leiter `mensch.bau.innen#2`.

- **K4 fachwerk 97,6 %.** Die Bühne des Labors liegt nicht im Licht der Welt (Täter oben). Messname: karte2.mensch.bau.bauen#1 ·
  Leser: die Leiter `mensch.bau.bauen#1`.
- **Gefach = f(Boden, Bestand)** (Lehm, Ziegel, Brett). Messname: gate:settlement R · Leser: `HAUS` (RM.gefach).
- **`alpin` auf Meereshöhe.** Das Klima-Band liest die Höhe nicht. Messname: gate:settlement R · Leser: `regionImKlima`.
- **schwarzwald/alemannisch L2 über 7 000 Tris im Welt-Bau** (welt-boot KOSTEN in Teil B). Messname: gate:asset-contract ·
  Leser: welt-boot KOSTEN.
