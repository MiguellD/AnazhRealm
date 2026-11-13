# E — Die Mensch-Kette: wer liest wen (Stand 1e00bfdb, gelesen 13.11.)

Dateikürzel: KC = koerper-core.js · FC = foundry-core.js · SB = stamm/siedlung-bewohner.js · VS = stamm/vegetation-streu.js · KL = stamm/koerper-leib.js

## 1. Die Leser-Karte

| Pfeil | Leser (Datei:Zeile) | liest den Kern ODER eigene Zahl/Kopie |
|---|---|---|
| Proportion → Skelett | KC:2029 `bauMensch` ← `labProportionen()` KC:1810 | Kern. Aber: FEST, ohne Eingang — alle Menschen gleich proportioniert (FUND 13.11., Abgabe 49175b32) |
| Proportion → Studio | worlds/koerperstudio/koerperstudio.js:10, :88 | Kern (`labProportionen`) |
| Kopfmaß → Kopf | KC:1422 `KOPF_MASS`, KC:1428 `kopfMass` (wächst um das Kinn, e80d8529) | Kern |
| Skelett → Haut | FC:7335 `__leibHaut` (Naht-Zahlen KC:1202 `leibHaut.naht`) | Kern |
| Gestalt → Haut/Stoff-aus-Haut/Menge | FC:9467–9487 `kern.leibRelief` (KC:2984 `LEIB_RELIEF`, KC:3394) | Kern — aber nur für Haut, `ausHaut`, Mengen-Leib (FC:9480) |
| Gestalt → PONCHO, Schuh | FC:9338–9365 `backeHuelle(pts, …, z.abstand)` über die alten Primitive | EIGENE Form: FC:9470–9471 „Eine fallende Hülle (der Poncho) und der Schuh sind kein Glied" — das Relief erreicht sie nie |
| Haut → Stoff (tshirt/pullover, Hose) | FC:9319–9336 `__stoffAusHaut` (FC:6403), Dicke KC:254 (0,032) / KC:271 (0,024) | Kern (Haut + Dicke) |
| Haut unter Stoff fällt | FC:9372–9390 Auswahl in der Spreiz-Pose (Poncho per Feld FC:9379–9388), Schnitt FC:9489 NACH dem Relief | Auswahl VOR dem Relief, Schnitt danach |
| Zeile → Hüllen | FC:9887–9945 `__huelleKollaps` je Hülle, ohne `zone` (FC:9938) | Kern-Zeile KC:48 (40 000) |
| Arm → Rumpf-Hülle | FC:9949–9956 → KC:4146 `armAnlage` (jede `__huelle` mit Gewichten, auch der Poncho) | Kern |
| Hände | FC:9889–9894 Deckel `MENSCH_GESTALT.haushalt` (KC:1173); Finger keine Gelenke (FUND 13.11. Z.216) | Kern-Haushalt |
| Kleid → Menge (Stufe 2/3) | FC:7031 `__mengenLeib`, Zonen FC:7082–7094 (Poncho `fall` 0,3 FC:7023), EINE Hülle, Farb-Schnitt FC:7129 | Kern (eigene Rastergrößen `MENSCH_MENGE` FC:7019) |
| Menge → Satz | SB:290–307 `_bewohnerRaum` (`leibRaumVorlage` KC:1486), SB:907–943 `_bewohnerSatz` | Kern |
| Satz → Feld | VS:1864–1883 `_feldGrenzen`, `LOD_SCHIRM.leib` VS:2884 | eigene Zahlen im Stamm (mengePx 64, mengeKoerperM 1,8) |
| Leib → Masse/Kollision | FC:7485 `volumen: __feldInnen(F)` (Feld des Gusses), FC:10015 `leibV` | liest das Feld VOR dem Relief (FC:9483) — nicht die gezeichnete Gestalt nach dem Relief |
| Bein → Tempo/Gang | KL:489 `_gaitBeinMass` → SB:870–871 `b.beinL`, `b.tempo` | Welt-Skala der Hüfte (Leck Kopf→Tempo, FUND Z.212); WIP w28-leib-genom 5da33ca6 schneidet hier |
| Kopf-Einheit → Spieler | KL:3430 `PLAYER_KH = LEIB.kopfM` | Kern; `kh` misst nach e80d8529 nicht mehr die ganze Größe (±2,5 cm, FUND Z.212) |
| Sitz | stamm/koerper-fahrt.js:454 `_sitzLage` | weiß ich nicht, ob es die Gestalt liest |
| Griff | WIP w28-griff-ellbogen dce88a79 (`_gliedHalb`, `brustM`) geparkt: der Ellbogen kennt den Rumpf nicht (FUND Z.216) | — |
| Kamera-Leib | scripts/diag-kamera-laub.cjs `--teile leib,gang` (package.json:119–120) | Linse, kein Spiel-Leser gelesen |

## 2. Welche Gestalt je Abstand (Schirm 1080 Zeilen, FOV 75° koerper-fahrt.js:3146 → Brennweite 703,7 px)

| Stufe | Schwelle (Zeile) | Was |
|---|---|---|
| Nah-Leib Stufe 0 (40k Dr., Kleid-Hüllen, Finger) | ≤ `nahM` 8 m (+1 Hysterese) UND unter den `nahLeiber` 4 Bedeutendsten (SB:3446–3448, SB:1470–1482, Bedeutung SB:1473) | `_buildHumanGroup` SB:833 |
| Stufe 1 (14k) | ab 40 m × Größe (KC:49, KL:393–417) | am Bewohner nie im Bild: sichtbar ist er nur in der Nah-Wahl ≤ 9 m (SB:1494) |
| Satz der Menge Stufe 2 (1 700 Dr., EINE Hülle) | jeder Nah-Kreis-Leib außerhalb der 4 (SB:1480) bis zur Feld-Grenze | SB:907–943 |
| Feld (Glieder-Kapseln) | jenseits N = min(64, 1,8·703,7/64) = **19,8 m**, zurück unter 23,8 m (VS:1870–1881); bei 720 Zeilen 13,2 m | `_kzLeib`, SB:1461 |
| Wurf | immer Stufe 3 (360 Dr.) aus dem Satz (KC:60, SB:872–876) | |

Bei 3–5 m sieht der Spieler: die 4 Bedeutendsten als Stufe 0, jeden fünften und weiteren auf 3–5 m als Satz Stufe 2.

## 3. Warum reißt das Hemd? (Fakten)

| # | Fakt | Beleg |
|---|---|---|
| a | Das Bild zeigt NICHT den Satz: der Satz ist EINE geschlossene Hülle mit Farb-Schnitt — Hemd über Haut mit Lappen und Fingern gibt es nur in Stufe 0 | FC:7007–7018, FC:7129–7131; Bild nach-eng-0 (Finger, Haut unter Lappen) |
| b | Die Farben im Dorfbild (rot/weiß oben, sand/burgund unten, barfuß) sind die Tracht `antike`: top **poncho**, shorts, shoes none | fachwerk-core.js:3287 (Lesart am Bild, Plan der Siedlung nicht gelesen) |
| c | Das „ganze Kleid" (zwoelf-kleid.png) ist pullover + shorts (Tracht `alpin`, fachwerk-core.js:3292) = Stoff-aus-Haut. Zwei verschiedene Kleid-Gesetze; der Beweis „Kleid ganz" galt dem anderen | KC:250–254: Poncho `dicke 0` → FC:9355 `backeHuelle`; sonst FC:9323 `__stoffAusHaut` |
| d | Der Poncho deckt Rumpf, Gürtel, Deltoid und Oberarm 0..3 als Feld-Hülle mit Abstand 0,12 E (~3,5 cm) | KC:222–238, KC:247; FC:9355 |
| e | Seit w28-leib-kanon tritt die Haut auf `LEIB_RELIEF`, der Poncho nicht | FC:9470–9480 |
| f | Welche Haut unter dem Poncho fällt, wird im Feld des Ponchos in der Spreiz-Pose gewählt — vor dem Relief; das Relief verschiebt danach die verbleibende Haut | FC:9379–9388, FC:9424, FC:9483, FC:9489 |
| g | `armAnlage` schiebt jede Rumpf-Ecke jeder Hülle (Poncho eingeschlossen) zur Leibmitte, die Arm-Ecken nicht | KC:4131–4166, FC:9953 |
| h | Der Riss war VOR leib-kanon schon da: vor-eng-0 = d7eb5c93 (FUND Z.224) zeigt Lappen an Arm und Seite; Augen-Karte 11.11. Z.70: „Haut sticht durch Hemd" (Stadt = tshirt) | Bilder; AUGEN-KARTE-2026-11-11.md:70 |

Aus der Quelle NICHT entscheidbar: welche von e/f/g die Lappen formt. Ansehen müsste man: denselben Bewohner in Stufe 0 im Studio mit `top:'poncho'`, je einmal ohne Relief, ohne armAnlage, ohne Kollaps (FC:9938) — drei Bilder, Streiflicht. Die Kugel-Schultern lese ich als Poncho-Feld über deltoid + Oberarm (d) — unbewiesen.

## 4. Die Linsen am Menschen

| Linse | Datei | misst | Poncho/Hand/Dorf? |
|---|---|---|---|
| gate:mensch-anatomie | scripts/diag-mensch-anatomie.cjs (package.json:102) | MENSCH_SOLL (Hand-Maße, Kopf, Auge, Fuß), KOPF_SOLL am Ofen L0, `leibUrteil` (Naht, Säume der Stoffe AUS DER HAUT), Kanon, Gestalt, Menge `menge.gleich` (:318), Arm-Ruhe | START_PARAMS = tshirt; „poncho" steht in keiner Linse (grep scripts/: nur diag-settlement.cjs:1725) |
| gate:koerper-kern | scripts/diag-koerper-kern.cjs (package.json:155) | Verträge des Kerns | kein Bild |
| gate:kamera-leib(:echt) | scripts/diag-kamera-laub.cjs (package.json:119–120) | Kamera im/vor dem Leib, Gang | kein Kleid |
| mensch.K4#1 (Gesicht, GPU) | meisterkarte-quelle/punkte/stationen/g2.js (Zweig punkte-maschine, nicht in main-CI) | Gesicht auf 6,1 m: augeFrei, lippe, hoehleA | kippt seit 10.11. am Band-Rand (hoehleA 5,59–7,08, Band [-2,6]; FUND Z.179) |
| mensch.K4#2 | g2.js, headless | Gesichter der Typen der Menge | — |
| bild:dorf@0.5 | Probe-Marke | Bild am Dorf | NICHT in den gpu-probe-Marken der leib-kanon-Abgaben (nur bild:genesis@0.36, gate:kamera-leib:echt, gate:tier-gang) |

Vorhersage: keine Linse des Zweigs sah einen Bewohner im Dorf auf 3–5 m; die Gesichts-Station lief nicht in der Probe. Es fehlen: eine Linse „Haut durch Stoff / offener Rand des Kleids" je Tracht (poncho, tshirt, pullover) an Stufe 0 in Ruhe-Pose; eine Hand-Linse jenseits der Maße (Finger keine Gelenke).

## 5. Geschichte (Merges „… in integ-probe" in origin/main seit 01.11., Filter leib|mensch|koerper|kleid|gesicht|haar|hand; vor 05.11. kein Treffer)

| Datum | Merge | hob | Nebenwirkung später genannt |
|---|---|---|---|
| 05.11. | 24cb4fe1 w12-leib-sicht, 329f931b w12-gesicht, a6017840 w11-leib | 28 Kopf-Klassen, Ofen neu | Gesicht-Messfehler (Täter ab1b1ee6, zug/vorpruefung.txt:53) |
| 05.11. | f66158d8 w12-tuch-grob | Tuch grob | weiß ich nicht |
| 06.11. | ff82c751 w14-gesicht-fern | Gesicht misst Gezeichnetes, 6 m | — |
| 07.11. | 514232c6 w18-mensch-deckel, b35a6781 w20-leib-takt | Probe/Takt | — |
| 08.11. | 55f80882 w21-leib-bau | Haut EIN Guss, Sitz häutet | — |
| 08.–10.11. | ce924ff1 w20-haar-arm, 393994fe w25-haar-albedo, 502f3ae3 w27-haar-arm-2 | Haar | — |
| 10.11. | cebe5c64 w26-leib-raum | EINE Mengen-Vorlage, Punkt je Bewohner | menge.gleich-Paare (FUND Z.205) |
| 10.11. | e0aa7638 w27-mensch-k4 | Auge urteilt erst aufgelöst | mensch.K4#1 kippt weiter (zug/erledigt.txt:440) |
| 11.11. | 47dbe52f w27-verkehr-leib | Leib-Halt im Verkehr | Bewohner auf Motorhaube (FUND Z.208, Zweig) |
| 12.11. | 12cf4539 w28-mensch-samen, 1bee95a9 w28-mensch-menge | Emotion im Leib | — |
| 13.11. | 10bb6742 w28-leib-kanon (+ w28-guss-bruch) | Rumpf/Beine keine Ballons, Relief, Kopf ums Kinn, Masse 80,5 kg | Schulter-Kugeln, Hemd reißt, Gesicht, Hände (FUND Z.224); Tempo hing an Kopfgröße, Wiederkehr 2/1296 > 2 m (Z.212, d81dc59f); Masse fiel erst auf 48,8 kg (Z.211) |

## Der kürzeste Weg zu einem Menschen, der auf 3–5 m hält (MEINE LESART)
1. Den Poncho an das Relief hängen oder ihn als Stoff aus der Haut gießen (FC:9480 schließt ihn aus) — eine Quelle der Gestalt für jedes Kleid.
2. Die Wahl „Haut unter Stoff" nach dem Relief treffen statt davor (FC:9379 vs FC:9483).
3. Eine Linse an Stufe 0 je Tracht (poncho/tshirt/pullover): Haut-Pixel innerhalb des Kleid-Umrisses = 0, offene Kleid-Ränder außerhalb des Saums = 0.
4. Jede Körper-Abgabe probt `bild:dorf@0.5` und mensch.K4#1 mit.
5. Masse/Kollision aus der Gestalt nach dem Relief lesen (FC:7485 vs FC:9483).
