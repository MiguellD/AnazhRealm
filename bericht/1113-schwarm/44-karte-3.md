# 44 Meisterkarte Scheibe 4 — fahrzeug · leib · pipeline · studios (Index mod 8 = 3)

Domänen der Karte alphabetisch (33, aus PM/meisterkarte-quelle/punkte/stand.json `je`): Index 3 fahrzeug, 11 leib, 19 pipeline, 27 studios.
In der Scheibe stehen 9 Kriterien unter 2 Punkten, offen sind **11 Punkte**. Regel: punkte.cjs:4063 (laut Blatt kurs-B Z. 6–9).
Wurzeln: SPIEL = worktrees/leib-kanon-urteil · PM = Temp/claude/w3/pm/meisterkarte-quelle/punkte · ST = PM/stationen · MS = PM/messung.

## Was es den Spieler kostet (Bild: ja, Studio ↔ Welt und die Höhle)
- **Studio ↔ Welt** (studios.K4): `BILD/studio-welt/kandidat-fachwerk-bild.png` zeigt das Fachwerkhaus auf der neuen Bühne dunkelrot und flach auf
  ebener grüner Fläche unter grauem Himmel; Pfannen sind als Punktraster gerade noch zu sehen, Balken und Ziegel nicht. `heute-fachwerk-diff.png`:
  das ganze Bild ist rot (verschieden), nur einzelne Kanten des Hauses decken sich. `heute-garage-diff.png`: der Wagen-Körper deckt sich (dunkel), Boden
  rot, Himmel rosa, und Spiegelungen auf Scheibe und Haube gehen auseinander. Gedächtnis `studio-welt-welche-seite-steigt.md`: die Zahl fiel
  97,9 → 8,3 %, weil die Bühne so stumpf wurde wie die Welt.
- **Höhle** (leib.K3#2): `MS/roh/ec281422-radeon/leib.K3_2-hoehle.png` ist fast reines Schwarz, nur ein Umriss des Leibs ahnt sich;
  `…/leib.K3_2-hinaus.png` zeigt hellen Hang, Bäume, Wolken. Dasselbe Schwarz in `MS/roh/2d5f4146-radeon/leib.K3_2-hoehle.png`.
- Ohne Bild: Taste → Leib 58–92 ms statt ≤ 50 ms (leib.K1), Ruck der Kamera beim Sprinten im Haus (leib.K4#2), Körperstudio 3,9–6,5 s bis zum Bild
  nach einem Griff (studios.K2#2). 3 Punkte sperrt heute keine Spielarbeit, sondern Stationen, die fehlen oder gar nicht GRÜN werden können.

## Was die Quelle sagt (je Kriterium: was fehlt · Wurzel · billigster ehrlicher Weg)
| Id (stand.json Z.) | geb. | was fehlt (Zahl, Quelle) | Wurzel mit Datei:Zeile |
|---|---|---|---|
| fahrzeug.K2 (436) | 1/2 | #2 **wird nie GRÜN**: `ohne = ["25°-Hang","Furt","Ego und Third"]` ist fest eingeschrieben, `gruen: c && ohne.length === 0` (ST/g5.js:5637–5639). C selbst ROT: 0 Ankünfte, „Fenster 12 s < Frist 30“ an 10 und 23 Uhr (MS/ec281422-radeon.json:1723, dc9eacb0-gtx.json:121) | Die Probe läuft 12 s (`PW.torBefehl(PW.fahrVerkehr,"12")`, g5.js:5624), urteilt aber gegen eine Frist von 30 s → die Probe-Länge widerspricht dem eigenen Soll. Spiel: `_verkehrSchritt` im Sim-Schritt (SPIEL/stamm/dirigent-takt.js:1087) |
| fahrzeug.K5 (565) | 1/2 | #2 **keine Station**. Soll 6/6 Kanäle (meisterkarte.json:3156); es fehlen Reifenspur, Staub/Spritzwasser je Boden, Kamera-Rauheit je Boden | In stamm/ kein Leser: Grep `Reifenspur|Spritzwasser` findet nur Katalog-Text SPIEL/stamm/daten.js:2310 |
| leib.K1 (1562) | 0/2 | #1 ROT Radeon ego/gehen 76,1 · third/gehen 92,5 bei einem Bild von 49,4 ms (MS/ec281422-radeon.json:293); GTX roh 58,3/63,2/65 bei 25,8 ms, „unscharf unter Last“ (MS/1e00bfdb-gtx.json:746). #2 GTX ego/gehen 169 (a41ce72d-gtx.json:9) | Zerlegung (MS/roh/ec281422-radeon/leib.K1_1.json.lauf1.json:10–41): ego/gehen Kette 31,6 ms, 5 Takte; third/gehen Kette 29,9 + **Kurve 43,6 ms** (1 mm → 1 cm). Kurve = Beschleunigungs-Kurve exp(−k·dt) (SPIEL/stamm/koerper-bewegung.js:1507–1513) plus Darstellung der Third-Sicht (nicht gelesen). Grenze: bei 49 ms je Bild sind ≤ 50 ms p95 nicht erreichbar → Bildzeit (Pflicht E) |
| leib.K3 (1652) | 1/2 | #2 Radeon ROT „Höhle: Abfall 0 außerhalb [0,06; 0,25]“, Höhle 0,0000429 ÷ hinaus 0,278 (MS/ec281422-radeon.json:2131). GTX GRÜN 0,07 (350e6b11). Radeon-Reihe: 0,0005 (2d5f4146, 95ba6fd6, dcc33615, e475c6b4) · 0,0028 (1cd1c408) · 0,020 nur an 900c28e6 und eb3cc7f3 | **Die Station schießt ohne Takt**: `blick()` setzt die Kamera und schießt sofort (ST/g5.js:2343–2347), die Schleife ist aus (`setAnimationLoop(null)`, g5.js:2227). Das Licht des Auges ist ein Platz des Licht-Pools (SPIEL/stamm/bild-himmel.js:1953–1990), neu gewählt je 0,25 s, Einblenden 0,5 s (SPIEL/stamm/stoff-material.js:3754) — ohne Takt bleibt es aus, das Ergebnis hängt davon ab, was vorher lief (0,0005 ↔ 0,020) |
| leib.K4 (1686) | 1/2 | #2 Radeon ROT „Gang innen-sprint: Ruck p95 0,035 m (Soll ≤ 0,02)“ in haus_alemannisch; innen 0,011, steil 0,0034 (MS/ec281422-radeon.json:1621). GTX: GPU-Schloss nie bekommen (a41ce72d-gtx.json:482) | Kamera im Innenraum beim Sprint; Leser der Kamera-Kollision nicht gelesen |
| pipeline.K5 (2852) | 1/2 | #2 **kein Werkzeug**: „kalt bereit ≤ 300 ms an beiden Geräten“ (ST/g4.js:2277) | Die Bereitschaft des Foundry-Fadens am Kalt-Boot nennt keine Probe; eigener Lauf hat in der Fahrt keinen Platz (g4.js:2277) |
| studios.K2 (3925) | 1/2 | #2 ROT: 6/8 (GTX) bzw. 7/8 (Radeon), Neubau koerperstudio 3908–6468 ms gegen ≤ 1000 ms (MS/1cd1c408-gtx.json:781, dc9eacb0-radeon.json:5255, 1e00bfdb-gtx.json:79) | Neubau des Leibs je Griff im Körperstudio; Pfad nicht gelesen. Kandidat (nicht gemessen): Poncho als Voxel-Hülle `dicke: 0` (SPIEL/koerper-core.js:254) über foundry `backeHuelle` |
| studios.K3 (3960) | 1/2 | #2 ungemessen: „0/7 Mesh-Studios (0 Stufen)“, erster Täter je Stufe garage L0 GPU 0,28 ms ↔ Bank 12,9 ms, schmiede 0,024 ↔ 1,05 (MS/dc9eacb0-radeon.json:6414; GTX 0,024 ↔ 10,6, 1cd1c408-gtx.json:1605) | Die Gegenzahlen messen Verschiedenes: `ms` = Zeitstempel des Zähl-Abschnitts (SPIEL/worlds/huelle/huelle.js:1016–1038, Median :1089), `bank` = Wanduhr (t1−t0)/n samt Warten auf die Schlange (huelle.js:905–933). Faktor 10–46 an jedem Studio → kein Studio kann ±5 % treffen |
| studios.K4 (3994) | 0/2 | #1 ROT 0/7: garage 46,1 %, schmiede 26,7 % gegen ≤ 2,1 %; portale „Vordergrund 29,3 % näher als 8 m“, fachwerk „Sicht verdeckt 80,6 %“, terrain „Blickziel verdeckt von Laub baum_kiefer“ (MS/1cd1c408-radeon.json:8795). Am Kopf ec281422: „Fahrt riss 1800 s“ (ec281422-radeon.json:3095) | #2 **wird nie GRÜN**: koerperstudio und tetrapoda stehen „ungemessen: Prägung / Wesen, kein gesetzter Bau“ (1cd1c408-radeon.json:8795), `k4Zahl` verlangt 7/7 mit `gruen === true` (ST/g4.js:450, 460, 2185). Für #1 sind 3 von 5 messbaren nötig (g4.js:2167) |

## Die EINE begrenzende Entscheidung
**Studio = Welt fällt nur, wenn die WELT zum Labor steigt.** Die Bühne von w28-studio-welt wird nicht weiter an die Welt angeglichen; eine kleinere
K4-Differenz ohne mehr Stoff im Welt-Bild zählt nicht. Der Schnitt dieser Scheibe ist darum der Stoff des Werks in der Welt am Dorf der Ankunft.
Alles andere in der Scheibe ist Kosten-Zeile (leib.K1 = Bildzeit) oder Stations-Wahrheit (K2#2 fahrzeug, K3#2 studios, K3#2 leib, K4#2 studios).

## Der Schnitt (die Klasse „Werk im Welt-Bild“ ganz)
- **Stufen:** L0 (Nähe, Vorschau-Kamera Gier 0,6 · Neigung 0,32 · fov 45, ST/g4.js:440) · L1 · L2 des Hauses und des Wagens; aus Auge, Hügel und Dach.
  Erst Fachwerk (Ziegel, Balken, Pfannen), dann garage (Spiegelung Scheibe/Haube aus EINER Quelle) und schmiede, im selben Leser.
- **Leser-Liste VOR dem Schnitt** (aus den liegenden Zweigen, Inhalt nicht Zeile für Zeile gelesen): stamm/studio-stoff.js, stamm/studio-bruecke.js,
  stamm/studio-gestalt.js, stamm/siedlung-satz.js, voxel-worker.js, worlds/fachwerk/fachwerk.js (w28-stoff-fuge 212b6de9, 36 Dateien +3728/−1149);
  stamm/siedlung-bauten.js, stamm/siedlung-ort.js, stamm/gelaende-boden.js (w28-fassade b038852b, 31 Dateien). Bühne: worlds/huelle/huelle.js
  (w28-studio-welt 6039dc13). Die Station liest K4_PFAD (ST/g4.js:484–511) — jede dieser Dateien löst R6 aus, also nach der Landung neu messen.
- **Kosten-Zeile:** Ego-Bildzeit der Wiese am Dorf vorher↔nachher (heute Radeon Bild 49,4 ms in leib.K1, MS/ec281422-radeon.json:293); Kosten nicht über heute.
- **Kriterien:** studios.K4#1 0/7 ↔ ≥ 3/7 ≤ 2,1 % (eine Karte) · studios.K4#2 0/7 ↔ 7/7 (beide Karten; unerreichbar, siehe oben) ·
  nebenbei studios.K2#2 (Neubau ≤ 1 s) und leib.K4#2 (Ruck innen ≤ 0,02 m), siehe Rang.
- **Die Stations-Wahrheit daneben (je ein Satz im pm-Zweig, kein Soll bewegt):** leib.K3#2 — `blick()` vor dem Schuss ≥ 0,5 s Spielzeit über
  `__werkTakt()` laufen lassen wie der Wasser-Teil (g5.js:2279–2286); fahrzeug.K2#2 — Probe-Länge an die eigene Frist 30 s binden und die drei
  `ohne`-Teile als Probe bauen oder die Staffel als „Station fehlt“ führen statt als ROT; studios.K3#2 — GPU-ms gegen eine Bank derselben Art
  (Zeitstempel über n Bilder) stellen; studios.K4#2 — koerperstudio/tetrapoda bekommen ein messbares Werk oder die 2 steht als „Station fehlt“.

## Was schon liegt
| Zweig · Kopf | was | fehlt bis zur Landung |
|---|---|---|
| w28-studio-welt 6039dc13 | EINE Bühne der Hülle (Abgabe) | Code-Check ROT (Stall-Akte diag-blick, Mehrspieler-Wand); macht die Bühne stumpf — nach der Entscheidung oben nur mit steigender Welt |
| w28-studio-seiten ad504fbe | WIP, alle Seiten über `werk()` auf die Bühne | Notbremse-Commit ungeprüft (huelle.js, uebersicht.js), UEBERGABE Z. 69 |
| w28-stoff-fuge 212b6de9 · w28-fassade b038852b | Stoff und Fassade der Welt-Häuser (OMEN) | erben w28-stadt-grammatik (156cc903, WIP) und w28-mp-boden (f97fe692, WIP), UEBERGABE Z. 39, 87 |
| w28-stadt-grammatik 156cc903 | Verkehr hält an 10 und 23 Uhr (kurs-B Z. 82) | WIP; C bleibt in fahrzeug.K2#2 ROT, solange die Station fest „ohne Probe“ sagt |
| w28-leib-nah ace30e73 (GTX 1050) | Poncho als Stoff aus der Haut | kein Abgabe-Kopf; ob studios.K2#2 davon schneller wird, ungemessen |

## Ehrlich offen
- Nicht gelesen: der Neubau-Pfad des Körperstudios (studios.K2#2), die Kamera-Kollision im Innenraum (leib.K4#2), die Darstellung der Third-Sicht,
  die 43,6 ms Kurve trägt (leib.K1), `_leuchtTakt` selbst (nur seine Konstanten, stoff-material.js:3750–3754).
- Die Höhlen-Wurzel ist abgeleitet, nicht gemessen: dieselbe Szene gab 0,020461 an Radeon 900c28e6 und GTX 350e6b11 und 0,0005 an fünf anderen Köpfen —
  passt zu „Pool ohne Takt“, ein Lauf mit Takt vor dem Schuss steht aus.
- studios.K3#2: ob die Bank-Wanduhr oder der Zeitstempel die Wahrheit trägt, sagt keine gelesene Zahl; sicher ist nur der Faktor 10–46.
- Das Welt-Bild des Fachwerkhauses (`fachwerk-welt.png`) habe ich nicht gesehen, nur Kandidat und Differenz.
- Widerspruch: leib.K1#1 GTX wurde „unscharf unter Last“ ungemessen (Faktor 1,35), Radeon ROT bei Bild 49,4 ms — am selben Gang 25–27 ms vorher (dc9eacb0).

## Rang
| Schnitt | Wirkung 1–5 | Aufwand | Risiko |
|---|---|---|---|
| Welt steigt zum Labor (Stoff am Werk, studios.K4#1) | 5 Bild | L | Die Stoff-Kette hängt an zwei WIP-Zweigen der OMEN; jede Datei in K4_PFAD macht K4 bis zur nächsten Fahrt ungemessen. |
| leib.K3#2 Takt vor dem Höhlen-Schuss | 2 Takt (+1) | S | Ist die Höhle auch im Spiel schwarz, verdeckt der Takt nichts — dann ist der Fund ein Licht-Fund, kein Stations-Fund. |
| fahrzeug.K2#2 + studios.K4#2 + studios.K3#2 ehrlich (unerreichbar → „Station fehlt“ bzw. gleiche Bank) | 2 Takt | S | Ändert keinen Punkt sofort; ohne ihn misst die Fahrt drei Stationen, die nie GRÜN sagen können. |

**Fünf Punkte dieser Scheibe, die ein Bild-Schnitt nebenbei kippt:**
1. studios.K4#1 (+1) — Stoff am Welt-Werk; dazu eine Welt-Pose ohne Laub/Vordergrund vor dem Werk (fachwerk 80,6 % verdeckt, terrain Laub).
2. leib.K3#2 (+1) — jeder Licht-Schnitt am Licht des Auges/Rückstrahlung (heute auch schatten.K4#1 radeon ROT „Gewinn 0,0 %“, UEBERGABE Z. 81).
3. studios.K2#2 (+1) — der Leib-Schnitt w28-leib-nah, falls er den Neubau des Körperstudios unter 1 s bringt (Vermutung).
4. leib.K4#2 (+1) — der Haus-Innen-Schnitt (w28-dorf-innen-leicht-pm 6c090fc8) am haus_alemannisch, falls er den Sprint-Ruck senkt (Vermutung).
5. leib.K1#1 (+1) — nur über die Bildzeit: jeder Bild-Schnitt, der die Radeon-Bildzeit von 49,4 ms Richtung 25 ms senkt (Kette 31,6 ms je Probe).
