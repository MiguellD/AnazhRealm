# haus-stufe-stoff — Abgabe (ZWISCHENSTAND)

Zweig `haus-stufe-stoff`, Basis origin/main c540c783 (V18.546.412), Schnitt-Commit 6b1ae2fb. Die Sprossen sind
`karte2.mensch.bau.bauen#1` (K4 Labor ↔ Welt) und `karte2.mensch.bau.huelle#2` (Stufenwechsel unsichtbar). Diese Abgabe bucht keine
Sprosse: gebucht wird erst, wenn der Richter sie grün misst. Karte 2 gebucht 103 von 1 718
(`vision/karte-2-stand.json` im Zweig `punkte-maschine`). Gegen origin/main 486a6685 (V18.546.413) mischt der Zweig ohne Konflikt
(`git merge-tree --write-tree` EXIT 0).

## Geschnitten

Der Chokepoint ist `fachwerk-core.js` `tonUebertrag` (gerufen aus `fragFuer` hinter `lod2Koerper`), dazu die Hülle `koerperTeile`.

- **Vorher.** Jede Ecke der fernen Stufe trug EINEN grauen Faktor je Klasse (Leuchtdichte Soll/Ist) über der Farbe ihrer Rolle und
  EINEM Wand-Ton. Der Backstein stand jenseits von 26 m olivbraun, der Schornstein als grauer Stein.
  Wo die Körper-Liste den Stoff eines Teils nur vermutete, stand eine falsche Rolle: das Dach des Anbaus als roter Ziegel an
  einem Haus mit Reet.
- **Nachher.** Die Körper-Liste ist die Karte (`koerperKarte`): je Teil und Klasse (Wand, flach) misst `sichtTon` das Soll an
  der Stufe 0 und das Ist an der Stufe. `tonFaktoren` gibt je Teil und Klasse einen Faktor in drei Kanälen, `tonUebertrag`
  multipliziert ihn auf die Ecken des Körpers. Das Ganze hält EINE graue Zahl über alle tragenden Ecken der Stufe. Ein Teil,
  dessen Listen-Rolle weder Wand noch Dach des Hauses ist, nimmt die Rolle, die das Soll dort mehrheitlich zeigt. Die Hülle
  (Stufe 3) trägt je Teil die Farbe ihres Solls.
- **Was fällt.** Der Wand-Ton: `_wandFaktor` und `B.wandTon` fielen aus dem Kern. Es gibt keinen zweiten Pfad, keinen Schalter, keine Tabelle je Art.
- **Was steht.** `fensterFern` ist Byte für Byte der Stand von main: Fenster bleiben Glas in jeder Stufe. Die Grenzen 12 / 26 m,
  der Wurf-Satz und die Geometrie jeder Stufe sind unberührt.

## Das Band und seine Quelle

Albedo je Bauteil, Stufe n gegen Stufe 0: **ΔE\*ab ≤ 2,3** (CIE76, D65). Quelle: Mahy, Van Eycken & Oosterlinck 1994, Color
Research & Application 19, S. 105: 2,3 ist der eben merkliche Unterschied. Die Praxis der Profis: der Farb-Übertrag je Ecke beim
Erzeugen ferner Stufen (Simplygon, vertex colour caster). Übernommen ist die Zahl, kein Asset. Die Quelle steht in EINER Zeile im
Kopf-Kommentar „DER STUFEN-STOFF“ in `fachwerk-core.js`.

## Gemessen: vorher ↔ nachher

Gemessen in Node am Kern selbst, ohne GPU: 32 Arten × 3 Samen (7, 12345, 3) = 96 Fälle, 13 Blicke (die 9 des Sicht-Tons und 4
frontale), 160² Pixel je Blick, derselbe Rahmen für alle Stufen. Je Bauteil das Mittel der Stufe 0 gegen das Mittel der Stufe n an
den Pixeln, an denen beide Stufen dieselbe Klasse zeigen. Angabe: Median · p95 · Maximum (Täter), dahinter die Zahl der Fälle
über 2,3. „vorher“ ist der Kern von main c540c783, „nachher“ der Kern des Schnitts. Die Mess-Skripte dieser Abgabe (`mess`, `vgl`,
`bildfarbe`, `huelle`, je als .cjs) liegen nicht im Zweig, sondern im Scratch:
`C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/hss/`.

**30 Arten ohne Glasfassade (90 Fälle, 84 mit Schornstein):**

| Stufe, Bauteil | vorher                                    | nachher                           |
| -------------- | ----------------------------------------- | --------------------------------- |
| L2 Wand        | 1,2 · 8,4 · 10,2 (alemannisch/3), 29/90   | 0,3 · 0,9 · 1,1 (fraenkisch/7), 0 |
| L2 Dach        | 0,7 · 3,6 · 5,7 (chinesisch/12345), 13/90 | 0,3 · 0,6 · 0,7 (chinesisch/7), 0 |
| L2 Schornstein | 3,1 · 14,1 · 15,9 (hanseatisch/3), 52/84  | 0,7 · 1,3 · 2,1 (roemisch/7), 0   |
| L1 Wand        | 0,1 · 0,9 · 1,1, 0/90                     | gleich                            |
| L1 Dach        | 0,1 · 0,4 · 0,4, 0/90                     | gleich                            |
| L1 Schornstein | 0,0 · 0,3 · 0,4, 0/84                     | gleich                            |

**Die zwei Türme aus Glas, hochhaus und volle_moderne (6 Fälle) — offen, siehe unten:**

| Stufe, Bauteil | vorher          | nachher                     |
| -------------- | --------------- | --------------------------- |
| L2 Wand        | 8,1 · 8,7, 6/6  | 5,9 · 6,0, 5/6              |
| L2 Dach        | 3,8 · 4,8, 3/6  | 2,9 · 3,4, 6/6              |
| L1 Wand        | 7,0 · 7,3, 3/6  | 5,1 · 5,2, 3/6              |
| L1 Dach        | 1,4 · 2,0, 0/6  | 4,2 · 4,7, 3/6 (schlechter) |

Alle 96 Fälle zusammen: L2 Wand 35/96 → 5/96 über 2,3, L2 Dach 16/96 → 6/96, L1 Wand 3/96 → 3/96, L1 Dach 0/96 → 3/96. Jeder
verbliebene Täter ist hochhaus oder volle_moderne.

Dasselbe Maß an JEDEM Pixel des Bauteils der Stufe 0, auch dort, wo die Stufe ein anderes Teil zeigt (Silhouette): L2 Wand
1,5 · 8,3 · 9,9 (37/96) → 0,3 · 3,0 · 3,3 (6/96); L2 Dach 1,3 · 5,3 · 6,3 (24/96) → 0,7 · 3,4 · 6,2 (10/96); L2 Schornstein
4,1 · 14,6 · 15,9 (65/84) → 0,7 · 2,8 · 5,8 (pueblo/12345; 7/84). Der Rest hier ist die Geometrie der Stufe, nicht ihr Stoff.

**Je Art (Maximum über die drei Samen, vorher → nachher):**

| Art              | L2 Wand    | L2 Dach   | L2 Schornstein | L1 Wand   | L1 Dach   |
| ---------------- | ---------- | --------- | -------------- | --------- | --------- |
| alemannisch      | 10.2 → 0.8 | 0.4 → 0.7 | 1.0 → 0.9      | 0.8 → 0.8 | 0.1 → 0.1 |
| fraenkisch       | 3.4 → 1.1  | 0.6 → 0.6 | 2.4 → 0.9      | 1.0 → 1.0 | 0.1 → 0.1 |
| niedersaechsisch | 2.7 → 0.8  | 0.6 → 0.4 | 4.0 → 1.6      | 1.1 → 1.1 | 0.1 → 0.1 |
| mittelalterlich  | 4.8 → 0.7  | 0.7 → 0.5 | 1.9 → 0.9      | 0.8 → 0.8 | 0.0 → 0.0 |
| holzhuette       | 1.2 → 0.3  | 0.1 → 0.4 | 4.4 → 0.9      | 0.1 → 0.1 | 0.4 → 0.4 |
| franzoesisch     | 0.1 → 0.1  | 0.9 → 0.4 | 4.1 → 0.7      | 0.1 → 0.1 | 0.4 → 0.4 |
| italienisch      | 0.6 → 0.5  | 0.8 → 0.2 | 4.7 → 0.8      | 0.1 → 0.1 | 0.2 → 0.2 |
| modern           | 0.4 → 0.3  | 2.4 → 0.5 | —              | 0.1 → 0.1 | 0.1 → 0.1 |
| volle_moderne    | 7.8 → 3.3  | 4.8 → 2.9 | —              | 0.2 → 0.2 | 0.1 → 0.1 |
| hochhaus         | 8.7 → 6.0  | 2.0 → 3.4 | —              | 7.3 → 5.2 | 2.0 → 4.7 |
| roemisch         | 0.4 → 0.6  | 1.0 → 0.3 | 6.9 → 2.1      | 0.1 → 0.1 | 0.1 → 0.1 |
| tudor            | 8.4 → 0.8  | 0.4 → 0.4 | 2.3 → 1.1      | 0.6 → 0.6 | 0.0 → 0.0 |
| alpenchalet      | 1.6 → 0.6  | 0.1 → 0.2 | 3.4 → 1.2      | 0.2 → 0.2 | 0.2 → 0.2 |
| hollaendisch     | 8.7 → 0.6  | 1.2 → 0.4 | 15.8 → 0.5     | 0.1 → 0.1 | 0.3 → 0.3 |
| hanseatisch      | 8.2 → 0.7  | 1.8 → 0.4 | 15.9 → 0.9     | 0.2 → 0.2 | 0.3 → 0.3 |
| georgian         | 5.1 → 1.0  | 0.3 → 0.0 | 11.0 → 0.8     | 0.3 → 0.3 | 0.3 → 0.3 |
| viktorianisch    | 6.1 → 0.3  | 0.2 → 0.1 | 11.1 → 0.3     | 0.1 → 0.1 | 0.1 → 0.1 |
| griechisch       | 0.1 → 0.3  | 1.2 → 0.2 | 4.2 → 1.1      | 0.1 → 0.1 | 0.2 → 0.2 |
| spanisch         | 0.4 → 0.3  | 1.0 → 0.1 | 4.5 → 1.1      | 0.1 → 0.1 | 0.1 → 0.1 |
| andalusisch      | 0.5 → 0.2  | 3.1 → 0.4 | 5.2 → 1.1      | 0.1 → 0.1 | 0.2 → 0.2 |
| provenzalisch    | 0.4 → 0.2  | 0.8 → 0.3 | 2.7 → 0.7      | 0.1 → 0.1 | 0.2 → 0.2 |
| pueblo           | 0.5 → 0.2  | 1.4 → 0.1 | 4.2 → 2.0      | 0.0 → 0.0 | 0.1 → 0.1 |
| marokkanisch     | 1.0 → 0.5  | 1.3 → 0.3 | 5.1 → 0.4      | 0.1 → 0.1 | 0.1 → 0.1 |
| skandinavisch    | 4.1 → 0.2  | 0.2 → 0.2 | 4.9 → 0.3      | 0.1 → 0.1 | 0.1 → 0.1 |
| norwegisch       | 2.0 → 0.4  | 0.4 → 0.4 | 2.3 → 0.8      | 0.1 → 0.1 | 0.3 → 0.3 |
| russisch         | 1.6 → 0.3  | 0.1 → 0.2 | 4.0 → 0.7      | 0.1 → 0.1 | 0.1 → 0.1 |
| schwarzwald      | 2.0 → 0.2  | 0.6 → 0.2 | 2.0 → 1.0      | 0.2 → 0.2 | 0.1 → 0.1 |
| japanisch        | 1.2 → 0.2  | 0.6 → 0.5 | 2.9 → 0.7      | 0.1 → 0.1 | 0.4 → 0.4 |
| gotisch          | 0.8 → 0.2  | 3.6 → 0.2 | 2.9 → 1.4      | 0.0 → 0.0 | 0.2 → 0.2 |
| barock           | 0.3 → 0.5  | 0.9 → 0.1 | —              | 0.1 → 0.1 | 0.0 → 0.0 |
| renaissance      | 0.5 → 0.3  | 2.6 → 0.1 | 3.1 → 1.0      | 0.1 → 0.1 | 0.1 → 0.1 |
| chinesisch       | 2.5 → 0.7  | 5.7 → 0.7 | 10.5 → 0.5     | 0.3 → 0.3 | 0.3 → 0.3 |

## Kosten je Stufe

Die 96 gemessenen Fälle: L1 3 090 478 Ecken / 1 430 008 Dreiecke, L2 306 968 / 146 284 — vorher gleich nachher. Der Vertrag
(`spec/asset-contract/v6/golden/haeuser.json`, Summe je Stufe): L0 9 656 922 · L1 1 957 784 · L2 205 896 · L3 8 344 Ecken, vorher
gleich nachher. Die Rollen-Gruppen der L2 sinken von 431 auf 423: hollaendisch, hanseatisch, georgian und viktorianisch tragen je
Samen eine Gruppe weniger, weil der Schornstein die Rolle seines Solls nimmt.

## Byte-Beweis der Stufe 0 und die neu geprägten Fälle

- L0: 65 von 65 Fällen tragen dieselbe sha256 wie auf main. L1: 62 von 64 gleich.
- Neu geprägt sind 131 von 258 Fällen in `haeuser.json`: alle 65 L2, alle 64 L3 (die Hülle trägt die Farbe ihres Solls),
  dazu `hochhaus-s7-L1` und `hochhaus-s12345-L1` (die Stufe 1 des Turms ist ein Fernkörper).
- `ausstattung.json` und `siedlung.json` sind unverändert.
- Außerhalb der Farbe ist alles gleich: je Art × Samen sind die Hülle ohne `farbe` und die Menge der Dreiecks-Lagen aller vier
  Stufen zwischen dem Kern von main und dem Schnitt identisch (55 Vorlagen × 2 Samen).

## Die Linse

Familie `gate:haus-fern`, Teil S8 (dort lebt der Stufen-Ton), Datei `scripts/diag-haus-fern.cjs`. Die neue Zeile urteilt je
Bauteil (Wand, Dach, Schornstein) in den Flächen der Körper-Liste: „Stufen-Stoff L<s> <Bauteil> ΔE … > 2.3“. Sie liest die Farben
der Ecken, die die Welt jenseits von 26 m zeichnet, keinen Quelltext.

- **ROT am Täter.** Der Mutant `nurHell` ist der Übertrag von main (nur die Helligkeit, der Farbton der Rolle). Am
  viktorianisch/s7 nennt die Linse: „Stufen-Stoff L2 Wand ΔE 6.9 > 2.3 | Stufen-Stoff L2 Schornstein ΔE 9.2 > 2.3“. Der
  Stufen-Ton davor bleibt dabei grün: die alte Zeile sah den Täter nicht.
- **GRÜN am Schnitt.** „Stoff je Bauteil (S8, Soll ΔE\*ab zur L0 ≤ 2.3): L1 Median 0.2 · max 1.9 (hochhaus/s7 Dach) · L2 Median
  0.2 · max 2.3 (volle_moderne/s1 Dach)“. Der knappste Fall liegt bei 2,273, danach 2,021 und 2,014 — alle drei an den Türmen aus
  Glas.
- **Zeit.** Lokal 250 s (main) → 309 s (Schnitt), plus 24 %. In der Cloud misst das Tor auf main 194 s
  (`spec/ci/ci-zeiten.json`), erwartet also etwa 240 s. Der Anteil der neuen Zeile liegt unter 3 min, das ganze Tor lag schon auf
  main darüber.

## Das Bild

Radeon 890M, Werkbank `--echt`, 1920 × 1080, WebGPU. Die Originale liegen im Scratch, die verkleinerten Kopien (960 × 540) im Zweig
unter `cloud-post/haus-stufe-stoff-bild/`.

**Dasselbe Haus (`haus_viktorianisch`) in 27,9 m, dieselbe Pose:**

| Bild                    | im Zweig                                         | Original                                                                                                                                      |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| vorher, Stufe 2 (main)  | `haus-stufe-stoff-bild/haus-27_9m-vorher-stufe2.jpg`  | `C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/hss/bild/vorher/fachwerk-welt.png`  |
| nachher, Stufe 2        | `haus-stufe-stoff-bild/haus-27_9m-nachher-stufe2.jpg` | `C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/hss/bild/nachher/fachwerk-welt.png` |
| Stufe 0 (früherer Lauf) | `haus-stufe-stoff-bild/haus-27_9m-stufe0.jpg`         | `C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/fachwerk-buehne/dbg/k4-l0satz/fachwerk-welt.png` |

Was man sieht: vorher ist die Giebelwand olivbraun und der Schornstein ein grauer Kasten, nachher ist die Wand ziegelrot und der
Schornstein aus Backstein, wie in der Stufe 0. Im Bild gemessen (Rechtecke, ΔE\*ab gegen das Bild der Stufe 0):

| Rechteck        | vorher | nachher |
| --------------- | ------ | ------- |
| Giebelwand      | 7,6    | 2,9     |
| Giebelwand oben | 9,9    | 4,1     |
| Schornstein     | 14,0   | 0,3     |
| Dach            | 1,5    | 1,4     |

Das Bild der Stufe 0 stammt aus dem Lauf der früheren Abgabe `w28-fachwerk-buehne` (dasselbe Skript, dieselbe Pose); die Stufe 0
ist Byte für Byte gleich geblieben.

**Das Dorf aus 40 m (Messort dorf, Kamera −735 / 43,3 / −912, Blick nach Süden):**

| Bild    | im Zweig                                     | Original                                                                                                                              |
| ------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| vorher  | `haus-stufe-stoff-bild/dorf-40m-vorher.jpg`  | `C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/hss/bild/dorf-vorher.png`  |
| nachher | `haus-stufe-stoff-bild/dorf-40m-nachher.jpg` | `C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/hss/bild/dorf-nachher.png` |

Beide Bilder tragen „ABNAHME GRÜN“. Die Stufe folgt im Bild der Bild-Kamera: nach dem Bild lesen alle 13 Häuser `_lodLevel` 2
(30,9 bis 69,6 m vor der Kamera). Das Bild zeigt also nur die Stufe 2, kein Nebeneinander von Stufe 1 und 2. Der sichtbare
Unterschied ist das Dach des Anbaus am hohen Haus in der Mitte (`haus_russisch`, Samen 384200, Deckung Reet): vorher roter Ziegel,
nachher Reet wie das Hauptdach. In Node an genau diesem Haus gemessen: die Stufe 0 trägt keinen Ziegel (`stroh` 868 m²), die L2
von main trug `ziegel2` 49,9 m², die L2 des Schnitts trägt dort `stroh`. L2 Dach ΔE 2,2 → 0,1, Wand 1,4 → 0,1, Schornstein
4,2 → 1,2.

Die Zeichen-Last der zwei Dorf-Bilder unterscheidet sich (vorher 65 Befehle / 340 541 Dreiecke, nachher 74 / 364 854). Es sind zwei
getrennte Sitzungen. Dem Schnitt ist das nicht zugeordnet: der Vertrag hält die Ecken je Stufe gleich, die Rollen-Gruppen sinken.

## K4 Labor ↔ Welt

Gemessen mit dem Paar-Skript der früheren Abgabe (`k4-paar` im Scratch, Uhr der Station, 27,9 m):

- vorher (Kern von main über eine eigene Seite, derselbe Baum): **18,02 %** (dunkler 0,1606 · heller 0,0147)
- nachher: **18,02 %** (dunkler 0,1612 · heller 0,0141)

K4 bewegt sich nicht. Die Erwartung des Briefs („Stufe 2 statt 0“ = 2,2 Punkte) ist nicht erfüllt. Der Grund: K4 zählt Pixel mit
einem Sprung der Helligkeit über 18, der Schnitt ändert den Farbton bei gehaltener Helligkeit (der Stufen-Ton hielt sie schon auf
± 5 %). Die 2,2 Punkte liegen in der Struktur der Helligkeit: Verband, Fugen, Schatten in den Leibungen, Lattung.

## Tore lokal, EXIT beim Namen

Auf c540c783 mit dem Arbeitsbaum des Schnitts: `gate:fachwerk-contract` 0 · `gate:settlement` 0 · `gate:nervensystem-fachwerk` 0
· `gate:studio-vertrag` 0 · `gate:asset-contract` 0 · `gate:schmiede-contract` 0 · `gate:vehicle-contract` 0 ·
`gate:porta-contract` 0. Auf 6b1ae2fb: `check:statik` 0 · `format:check` 0 · `lint` 0 · `gate:fachwerk-contract` 0 ·
`gate:haus-fern` 0 · `diag-regler-wirkt --teil=2` 0 · `--teil=3` 0 · `gate:asset-inventory` 0 · `gate:scatter-lod` 0.

Lokal nicht gefahren: `gate:haus-welt` (beide Teile; 2 506 s in der Cloud, zeichnet mit der GPU). Sein Richter ist `[ci voll]`.
Die Plattform-Ratsche v6 (cos 15 · sin 7 · tan 12) hält unverändert.

## Abdruck

`node scripts/werkbank.cjs abdruck --gegen c540c783d2`: ANDERS 8 in D1, D3, D7, D8, D9.

- Vom Schnitt: D3 (`archInstanceGroups` Farbe und `aLage` der `f:russisch|…|2`, der `bauSatz` der Stufe 2), D7 (`impostor#fimp:atlas`),
  D8 (`_foundry.cache` der Stufe 3: `_fern.f` und Farben), D9 (`_hausHuelle.f`).
- Nicht vom Schnitt: D1 (`voxelChunks` 2 von 2 070, `zellenFest`) und die Folge der Blocker-Liste in D9. Der Abdruck desselben
  Kopfs gegen sich selbst (`--a-gegen-a --orte dorf`) ist am Ort dorf selbst ROT mit 7 anders, darunter `zellenFest` eines anderen
  Chunks, die Blocker-Liste 145 von 145, der Impostor-Atlas, Geröll und die Feuerstelle.

## Abweichungen vom Brief

- Die Hülle (Stufe 3) folgt demselben Gesetz, sonst führe neben dem Soll ein zweiter Farb-Weg. Darum sind alle 64 L3 neu geprägt.
- Die Linse sitzt in `gate:haus-fern` (S8) statt in `gate:asset-contract` oder `gate:fachwerk-contract`.
- Der Probe-Ruf nennt `gate:haus-welt` nicht (2 506 s über dem Deckel von 480 s).
- Die Commits tragen als Mit-Autor Claude Fable 5.2 (Vorgabe der Sitzung), nicht Opus 5.5.
- Das Dorf-Bild zeigt nur die Stufe 2 (siehe oben).

## Offen, mit Grund, Messnamen und Adresse

1. **Türme aus Glas (hochhaus, volle_moderne): Wand ΔE bis 6,0, Dach bis 4,7 über dem Band; hochhaus L1 Dach stieg von 2,0
   auf 4,7.** Grund: die ferne Fassade `glasfern` trägt keinen Ton, der Richter S8 „Stufen-Ton“ (`|L_s/L0 − 1| ≤ 0,05` über alle
   tragenden Pixel) verlangt trotzdem die Helligkeit der Stufe 0 samt ihrer hellen Rahmen. Der Kern hebt darum Wand und Dach
   des Turms gemeinsam mit der grauen Zahl: am hochhaus Wand × 1,22–1,24 und Dach × 1,25–1,35 gegen die Stufe 0, an der
   volle_moderne L2 × 1,15 und × 1,22. Auf main trug die Wand die ganze Last (× 1,31–1,38) und das Dach dunkelte (× 0,75–0,91).
   Messname: `mess` (Scratch) `WAND=` / `FLACH=`; die Zeile „Stoff je Bauteil“ urteilt relativ und steht bei 2,273 von 2,3. Adresse:
   `karte2.mensch.bau.huelle#2`. Vorschlag an den Koordinator (ich habe kein Soll und keinen Richter-Text geändert): S8 misst
   Stufe und Stufe 0 über verschiedene Flächen; entweder trägt `glasfern` den Ton der Rahmen oder S8 misst in den Flächen der
   Körper-Liste.
2. **K4 steht bei 18,02 %.** Grund und Messname oben (`k4-paar`). Adresse: `karte2.mensch.bau.bauen#1`.
3. **Rest im Bild an der Giebelwand: ΔE 2,9 und 4,1.** Grund: Licht und Schatten der Stufe (kein Verband, keine Leibung), nicht die
   Albedo (in Node 0,3). Messname: `bildfarbe` (Scratch). Adresse: `karte2.mensch.bau.huelle#2`.
4. **Silhouette: L2 Schornstein 7/84 und L2 Dach 10/96 über 2,3 an jedem Pixel.** Grund: die Stufe zeigt dort ein anderes Teil
   (pueblo 5,8; geschwungene Dächer; der Keil deckt eine Seite: chinesisch 18 statt 36 Ecken). Messname: `mess` (Scratch)
   `Schornstein` / `FLACH`. Adresse: `karte2.mensch.bau.huelle#2`.
5. **Der Abdruck ist am Ort dorf gegen sich selbst ROT (7 anders).** Messname: `abdruck --a-gegen-a --orte dorf`. Adresse:
   FUND-REGISTER (Zweig `koordination`).
6. **`gate:haus-fern` wächst um 24 %.** Messname: `spec/ci/ci-zeiten.json` `gate:haus-fern`. Adresse: `gate:ci-deckung` (Waage der
   Gruppe 16).
7. **Der Vertrag meldet: „RATSCHE v6 kann fallen: tan 12 → 10“.** Nicht angefasst (kein Soll geändert). Adresse:
   `gate:fachwerk-contract`.

## Was der Spieler sieht

Ein Haus aus Backstein bleibt jenseits von 26 m aus Backstein, sein Schornstein auch, und der Anbau trägt das Dach seines Hauses.
