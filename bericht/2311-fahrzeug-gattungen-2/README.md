# Vorprüfung fahrzeug-gattungen 2 — Wagen an Wagen (GTX 1050)

Auftrag (Koordinator 12:58): Code-Check rot an EINER Stelle, VK 23 Uhr „Wagen an Wagen [0.17,"4|8",33048,844,435]“, Stoß 1.

## Die Namen
- **4 = kompakt_fwd**, steht (Tempo 0, Grund „wagen“: er wartet auf einen Wagen) — **8 = transporter**, fährt 3,1 m/s, Grund keiner.
- **844/435** = die Hauptgasse am Markt, 8,5 m östlich des Stands des Richters (bahn[0] 836,2/438,5): der Transporter fährt im
  Umfahren um den stehenden Spieler (`_verkehrUmfahren`, 7× in der Stunde) an der Nase des wartenden Kompakts vorbei.

## Die Wurzel (Sonde `sonde-23-uhr-vorher.txt`, bit-gleich zur Cloud: Probe 33356)
Der Transporter stand im Bogen des Umfahrens **14,5° schräg** zur Tangente seiner Linie. Die Folge (`_verkehrFolge`) prüft die
fünf Punkte des anderen gegen die Linie, mit halber Breite + Ausscheren (`F.rund`) + Raum: alle fünf „frei“ (der knappste 0,075 m
über der Schwelle) — und doch stand die vordere Ecke des Transporters 0,066 m vor der Nase des Kompakts. `F.rund` = l²·κ/2 rechnet
den Leib als Tangente am Schwerpunkt; der Wagen rollt aber um seine Hinterachse (das Einspur-Modell des Fahr-Satzes,
vehicle-core `exportDrive.zweispur.c`): der Leib dreht um asin(c·κ) — Transporter c 1,65 m im Wendekreis 5,5 m: 14,3°.

## Der Schnitt (EINE Stelle: das Ausscheren der Linie)
- `_verkehrAusscheren(W, k)`: außen die Ecke an Bug oder Heck √((c + x)² + (Rr + hw)²) − R − hw, innen die Flanke an der Hinterachse
  R − Rr, Rr = √(R² − c²). Leser: `F.rund` (die Linie), das Fenster der Folge, das Spur-Raster der Stadt (`kurveAus` 0,66 → 0,92 m,
  die weiteste Gattung des Kerns). Transporter 0,62 → 0,92 m, Kompakt 0,37 → 0,67 m.
- `_verkehrMass(W)`: das Maß der Gattung aus vehicle-core (`exportDrive.huelle` × Größe, hl = max(Bug, −Heck) — vorher fror das
  Stellen das Mittel ein: Kompakt 1,92 statt 2,02 m) und die Hinterachse `zweispur.c`. Kein Sonder-Abstand, `VERKEHR.raumM` unberührt.
- Verworfen (gemessen): der Verkehr mit dem GEZEICHNETEN Maß — VK grün, aber VK-V rot um 10 und 23 Uhr (das Maß trifft mit dem Bau ein).

## Die Linsen (gate:fahr-leben VK, Selbsttest grün)
- „Maß-Zwilling“: jeder Wagen trägt das Maß seiner Gattung. „Ausscheren über dem Band“: keine Ecke eines fahrenden Wagens ragt
  weiter über hw + rund seiner Linie als `begegnungM` (aus dem Gesetz der Seite); Ecken ohne Fuß auf der Linie zählen nicht
  (`sonde-linse-fuss.txt`: die neue Linie beginnt am Wagen, sein Heck liegt hinter ihrem ersten Punkt).
  Im Ort, den er allein hält, zählt sie ihn nicht — dieselbe Regel (EIN Prädikat `haeltAllein`) wie „neben der Spur“: dort
  begegnet ihm keiner (`sonde-ausparken.txt`: der Transporter parkt 0,5–0,8 m neben seiner Linie aus, allein in der Wende).
- ROT am Täter: Mutante (Ausscheren als Tangente l²·κ/2, das Mittel als Maß; `git show e95ad4bca -- stamm/siedlung-verkehr.js | git apply -R`) am Kopf mit .384, 23 Uhr: ROT an beiden — „Maß-Zwilling“ (Kompakt hl 1,92 gegen 2,02 m der Gattung, Supersport 2,00 gegen 2,05, Limousine 2,465 gegen 2,525) und „Ausscheren über dem Band 0,16 m“ (SUV 12,6° schräg zu seiner Linie bei 848/435, rund 0,14). Der Schnitt am selben Baum: grün (`tore.txt`).

## Gemessen (GTX 1050, je 600 s)
Staffel an main .382 (`staffel-382.txt`): Wagen an Wagen 23 Uhr 0,17 (Stoß 1) → Maß der Gattung allein 0,07 → mit dem Ausscheren
0,30 m (Stoß 0); 10 Uhr 0,20 (Cloud) → 0,27 → 0,32 m; VK-V grün an jeder Stufe außer dem verworfenen gezeichneten Maß.
Am Kopf bc5bbebdd (main .385 im Baum): 23 Uhr Wagen an Wagen 0,30 m (8|11 Transporter ↔ SUV bei 842/431), Ausscheren 0,041 m, Stoß 0 · 10 Uhr 0,32 m (1|8 Kompakt ↔ Transporter bei 840/429), Ausscheren 0,040 m, Stoß 0 · VK-V grün an beiden Stunden · Playtest „Alle Invarianten OK“ · check:statik grün (diag-taille im Vordergrund, `tore.txt`).

## Offen (ehrlich)
- Die Kreuzung des fachwerk-Kerns rechnet den Wagen weiter als Tangente (FUND-REGISTER) — Glied der Klasse, Kern-Änderung mit
  Byte-Beweis und neuem Plan, nicht in diesem Schnitt.
- Der Transporter lenkt den Bogen der Stadt nicht: Wendekreis am Schwerpunkt 6,0 m (Anschlag 0,52 rad für jede Gattung, Radstand
  3,3 m) gegen kurveR 5,5 m (Limousine 5,54) — er parkt in der Wende 0,5–0,8 m neben seiner Linie aus (FUND-REGISTER).
- Die Haut über den Stationen (Bug 0,12–0,14 m, Heck 0,13–0,15 m) ist kein Gesetz: Stoß liest die gezeichnete Gestalt, der Verkehr
  die Stationen (FUND-REGISTER). Der Verkehr selbst hält begegnungM 0,1 m, der Richter verlangt raumM 0,2 m.
