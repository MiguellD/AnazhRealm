# 26 Studios fachwerk und portale: das Labor ist das Soll, der Tor-Quader liest in der Welt als Fels

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Tor, Labor r128 (PM `…/900c28e6-radeon/studios.K4_1-k4/portale-buehne.png`): heller, glatter Quader. Jede Lagerfuge ist als feine Linie
  zu sehen, das Stufen-Podest hat eine klare Kante, das Gitter ist golden und geschlossen.
- Dasselbe Tor in der Welt, 32 m, Mittag (`…/portale-welt.png`): Der Stein ist ein graubraunes Salz-und-Pfeffer-Korn über die ganze
  Fläche, die Fugen gehen darin unter, Bögen und Pfeiler lesen sich wie gegossener Beton. Die Flügel stehen offen und
  ragen als dünne gelbe Striche aus dem Rahmen. In der Öffnung ist keine Membran (an dieser Pose hat das Tor kein Ziel).
- Tor auf der neuen Bühne (BILD `studio-welt/werk-kathedrale-L0-frueh.png`, `…-L2-mittag.png`, Welt-Stoff): grobe, fleckige
  Tarn-Muster in Beige und Braun bzw. Grau und Schwarz, größer als ein Stein. Die Fuge ist auf keinem der acht Blicke zu lesen.
  Im Frühlicht ist der Himmel schwarz.
- Fachwerk, Labor gegen Welt (`fachwerk-buehne.png` ↔ `fachwerk-welt.png`): im Labor Läuferverband, Pfannen und Steinschornstein,
  in der Welt eine dunkelrote Fläche. Auf der Bühne (`studio-welt/werk-viktorianisch-L0-mittag.png`) ist es ebenso dunkel und flach,
  nur auf dem Dach liegt ein Punktraster. Diesen Teil trägt Blatt 05.
- Wo der Spieler ankommt, stehen um die Mitte des Genesis-Orts die Tore der Studios (stamm/siedlung-ort.js:1369–1371, :1413–1415).
  Der Quader ist also das Erste, was er aus Stein sieht. Ein Bild vom Genesis-Ort habe ich nicht gesehen.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Pfade unter SPIEL (main ec281422).
- **Das Gesetzbuch der Tore** ist porta-core.js:292–296.
  - `STEIN_GESETZ.quader` = { fase 0,015 · fuge 0,008 · fugeTon 0,45 · ton 0,12 · platteM 0,9 }.
  - Das ist ausdrücklich der Quaderverband des Fachwerk-Labors (texStein 46 × 28 cm, Fuge 1,6 cm, :281).
  - Ein Rahmen aus Stein trägt `__stein="quader"` (:1320).
  - Seine Rauheit ist lerp(0,88, 0,16, metal) (:1309). Für einen Steinrahmen sind das 0,88.
- **Das Labor (main)** zeichnet genau diese drei Dinge: Fuge, Bruchton und Fase (worlds/portale/porta.js:41–64 `steinLabor`). Ein Mikro-Relief hat es nicht.
- **Die Welt** zeichnet Fuge, Ton und Fase genauso (stamm/stoff-material.js:2779–2820, Kommentar :2777 „Dieselbe Rechnung zeigt das Labor").
  Dazu legt sie das MIKRO-RELIEF DES FELSENS darüber: `_mikroRelief` (Terrain-Rauschen in 3 Oktaven am Pixel, :2664–2725) und `_mikroStoff`
  (Korn auf der Albedo, Himmels-Bild im ao, :2739–2751), gewogen mit `k = nah · staerke` (:2821–2828).
- **Der Chokepoint:** `staerke = smoothstep(0,3, 0,6, rauh)` (stamm/studio-stoff.js:592), und `rauh` ist die Rauheit des Stoffs (:269–272).
  Bei 0,88 ergibt das 1,0. Jeder Tor-Quader trägt damit das volle Fels-Korn. Das Gesetzbuch sagt nirgends, dass ein behauener
  Quader Fels-Korn trägt. Es ist eine Weiche des Wirts, keine Zahl des Gesetzbuchs.
- **Konsum:** Von den 3 Stein-Termen des Gesetzbuchs (Fuge, Ton, Fase) liest die Welt 3 von 3. Der 4. Term (Fels-Korn) kommt aus keinem
  Studio und deckt die 3 im Bild zu. Das Labor zeigt 3, die Welt 3 + 1.
- **K4-Zahlen** (PM `…/900c28e6-radeon/studios.K4_1.out:3,5,10`; spec/studios/k4.json im Zweig w28-studio-seiten):
  - portale Differenz 0,9466. Die Welt zeichnet an der Pose L2, die Bühne L0.
  - fachwerk 0,9788. Die Welt zeichnet an der Pose L0.
  - Soll ≤ 0,021 bei 0 von 7.
  - Kopf von huelle.js (w28-studio-seiten, Zeilen ~2116–2120): Tor r128 94,7 % → Welt-Engine + Welt-Licht + Kern-Stoff 73,9 % → mit
    Welt-Stoff 63,2 % → an L2 52,7 %. Auf der Radeon fiel das Tor auf 43,9 %, das Haus 97,9 → 8,3 %, weil die Bühne so stumpf wurde wie die Welt.
- **fachwerk.js (1142 Zeilen, r128)** trägt noch eigene Zwillinge, die fail-soft sind:
  - Tageszeit `_zeitPart` mit Ersatz-Literalen (:644, :649–657). Der Kopf sagt selbst „ZEIT_GESETZ fail-soft".
  - `EXPL_FALLBACK` (:672–675).
  - Ein eigener Renderer mit Sonne, Hemisphäre und Nebel (:633–642).
  - Ein eigenes Dorf mit Bordstein, Gully, Zebra und Mauer (:213–365). Den Bordstein trägt Blatt 08.
- **porta.js (main)** trägt dieselbe Art Zwillinge:
  - `DOOR_OPEN` mit Ersatz 1,95 (:20).
  - GLUT mit Ersatz-Literalen (:177–178, :212–213).
  - Die Membran als r128-GLSL neben dem TSL der Welt (:81–157, Welt: stamm/siedlung-tor.js:43–326).
  - Die Welt liest dieselben Zahlen fail-closed (siedlung-ort.js:3258–3260, siedlung-tor.js:755–772).

## Die EINE begrenzende Entscheidung
Das Labor-Bild ist das Soll beider Studios. Die Welt steigt dorthin, die Bühne steigt nie hinunter. Für den Stein heißt das: Ein Quader
trägt nur, was sein Gesetzbuch nennt. Das Fels-Korn gehört dem Fels. Seine Stärke am Quader ist eine Zahl in `STEIN_GESETZ.quader`
(neu `korn`, Vorgabe 0 = die Rechnung des Labors). Die Rauheit des Stoffs entscheidet das nie mehr.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Die Klasse** ist jeder Stoff mit `mp.stein`: alle Tor-Rahmen aus Stein auf den Stufen L0, L1 und L2 (an der K4-Pose zeichnet die Welt L2).
Dieselbe Rechnung gilt auf der EINEN Bühne der Hülle (sie zeichnet mit dem Welt-Stoff). Das Kopfstein des Platzes ist nicht in der Klasse:
Es ist ein eigener Term im Boden-Stoff (siedlung-wege.js:923–937) und liest nur `STEIN_GESETZ.kopfstein`.
1. **porta-core.js:293:** `quader` bekommt `korn: 0` mit einer Kommentar-Zeile in :280–284. Das Korn eines rohen Bruchsteins ist dann eine
   eigene Zeile, falls ein Werk sie je nennt. Heute nennt keines eine (`__stein` wird nur an :1320 gesetzt).
2. **stamm/studio-stoff.js:592:** `this._steinStoff(TSL, mat, vcol, G, G.korn)`. Das Gewicht ist eine Zahl je Stein-Art, und die
   Programm-Signatur trennt die Stein-Arten schon (`"stein:"+mp.stein`, :726). Das gibt 0 neue Programme.
3. **stamm/stoff-material.js:2821–2828:** Ist das Gewicht 0, entfallen `_mikroRelief` und `_mikroStoff` ganz (der Graph wird nicht gebaut),
   übrig bleiben Fuge, Ton und Fase. Die Kante :2826 bleibt.
4. **Kein neuer Leser im Labor:** Das Labor von main hat schon kein Korn (porta.js:41–64), und der Zweig w28-studio-seiten zeichnet mit dem Welt-Stoff.
**Leser-Liste (vor dem Schnitt):**
- porta-core.js:292–297 und :1320.
- foundry-bruecke.js:696–698 und stamm/koerper-leib.js:1433 (die Brücke trägt `stein`).
- phyto-core.js:5564 (Cache-Schlüssel `|st:`).
- stamm/studio-stoff.js:182–185, :585–593 und :726.
- stamm/stoff-material.js:2779–2829.
- stamm/siedlung-satz.js:59 und :1663–1670 (uv im Satz, unverändert).
- Labor worlds/portale/porta.js:41–64 (main) bzw. der Zweig.
- Linsen, nicht gelesen: scripts/diag-portal-membran.cjs, gate:asset-inventory, gate:studio-huelle.
**Kosten-Zeile:**
- Weniger ALU je Tor-Pixel: 3 Ebenen × 3 Oktaven Rauschen entfallen, dazu der ao-Zweig.
- 0 Puffer und 0 Programme mehr. Am Schirm gebunden, nicht an die Zahl der Tore.
- Frame p95 am Genesis-Ort vorher und nachher, GTX und Radeon, Ego und Third. Die Grenze ist der Stand von heute.
**Kriterien:**
- `studios.K4#1` (Station PM `stationen/g4.js:2155`, Probe `stationen/k4-bild.cjs`, Soll 3 von 7 mit Differenz ≤ 0,021 und Albedo im Rand 0,10).
  Ist: portale 0,9466, fachwerk 0,9788 (Radeon 900c28e6). Heute radeon und gtx UNGEMESSEN (stand.json:3999–4016).
- Wache: `tore.K3#1` und `tore.K3#2` dürfen nicht reißen. Ist GRÜN 30 von 30 bzw. 10 von 10 (stand.json:4246–4276).
- Bewegt wird kein Soll.
**Bildpaar:** dieselbe Pose wie `portale-welt.png` (Kamera 36,5 / 104,2 / 29,6, Mittag), dazu 6 m vor dem Tor am Genesis-Ort und
das Podest von oben. Abnahme: Auf jeder Fläche ist die Fuge zu lesen, kein Fleck ist größer als ein Stein, und das Tor liest auf keiner
Stufe schlechter als im Labor.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- **`w28-studio-seiten` ad504fbe (WIP, Notbremse 21:02, darunter d3cfd4d1):**
  - porta.js zieht ganz auf `AnazhHuelle.studio`. Dabei fallen der r128-Renderer, `steinLabor`, die Membran-GLSL, Bloom, FXAA und der
    Kino-Pass, und `DOOR_OPEN` liest den Kern ohne Ersatz.
  - Diff: 20 Dateien, +1610 −408.
  - Es fehlt: Übersicht prüfen, das Streiflicht (eigene Zeile: „15° ist zu rot"), gate:studio-huelle H6, die Bildpaare auf der Radeon.
  - Ihr eigener FUND sagt: Fachwerk zeigt auf der Bühne keine Balken und kaum Ziegel, darum bleibt es r128.
  - Ohne meinen Schnitt zeigt die Tor-Seite nach dem Umzug das Tarn-Muster statt des Labor-Steins (BILD `werk-kathedrale-*`). Das ist ein Rückschritt im Bild bei fallender Zahl.
- **`w28-studio-welt` 6039dc13** liegt abgegeben darunter. Der Code-Check ist ROT (UEBERGABE §4).
- **fachwerk:** Kein Zweig zieht die Seite um. Das ist richtig so, bis der Verband aus Blatt 05 (`w28-stoff-fuge` 212b6de9 nach `w28-fassade`) gelandet ist.
- **Reihenfolge:** Der Korn-Schnitt (3 Dateien, ~10 Zeilen) landet zuerst allein von main, danach studio-seiten mit der Tor-Seite. So
  zeigt die Bühne beim Umzug den Labor-Stein.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht bewiesen: dass das Korn in `portale-welt.png` ganz vom `_mikroStoff` kommt. Möglich ist auch ein Rauschen der Ecken-Farbe
  aus dem Foundry-Bau (NOISEAMP, siehe Blatt 05 zu fachwerk-core :2072). Am Tor nicht gelesen. Die Probe dazu ist der Schnitt selbst:
  dasselbe Bild mit Gewicht 0.
- Die großen Flecken der Bühnen-Bilder sind auf swiftshader bei 640 × 360 geschossen. Ob die Oktaven dort durch `schirmJeSzene`
  zu grob liegen, ist nicht gemessen.
- Nicht gelesen: diag-portal-membran.cjs, gate:studio-huelle, `TERRAIN_BUMP`-Zahlen, die L2-Gestalt des Tors (ein dünnes Gitter,
  offene Flügel als Striche) und warum die Flügel an der K4-Pose offen stehen.
- Kein Bild vom Genesis-Ort mit Toren gesehen. Dass der Spieler die Tore an der Ankunft sieht, ist aus dem Code gelesen, nicht aus dem Bild.
- Die fail-soft-Zwillinge in fachwerk.js:644–675 und porta.js:20/:178/:213 (main) sterben mit dem Umzug ihrer Seite und nicht vorher.
  Für fachwerk heißt das: erst nach Blatt 05.
- Widerspruch: Das Labor-Bild `fachwerk-buehne.png` zeigt Balken, aber das Gesetz für klinker ist GLATT (Blatt 05, fachwerk-core :197).
  Das Bild ist vom Stand 18.546.244.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
**Wirkung 3:** Jedes Tor am Ort der Ankunft liest wieder als behauener Stein. Damit kann die Tor-Seite ohne Bildverlust auf die EINE Bühne.
**Aufwand S:** 3 Dateien, ~10 Zeilen, ein Bildpaar.
**Risiko:** Ohne Korn kann der Quader unter dem Welt-Licht zu glatt und hell lesen (Albedo-Rand K4 0,10). Das Bildpaar entscheidet,
und kein Soll wird bewegt.
