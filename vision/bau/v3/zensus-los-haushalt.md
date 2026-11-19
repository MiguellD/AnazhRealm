# ZENSUS LOS ↔ HAUSHALT · HANG · ECKE — Runde 3, Zahl A (Lese-Baum n1011-hg main b7ed8419, nur gelesen)

Kern FC = `fachwerk-core.js`, SHA-256 028cc2d0…bea06, byte-gleich mit der Kopie `p3/n1811/bau-spike3/kern/` (das Skript druckt und
vergleicht beide). Skript `v3/zaehl-los.cjs` (SHA-256 ae3990a5…b17f4), Ausgabe `v3/zaehl-los.log`, Zeile je Los
`p3/n1811/bau-spike3/los-zeilen.json`. Menge: dieselben 2 595 Haushalts-Lose der 30 Pläne G (Saat 1–30, nH 90; pool.cjs:94–100),
alle 30 „grossstadt“, ummauert, Stadt der Grammatik. Laufzeit 64 s, node, kein GPU, kein git. Gleichheit mit dem Gebauten:
`slot.ov.W/D/storeys = hp` an 2 595/2 595 (Log Z. 8). Markierung: **belegt** · **gewählt** · **unsicher**.

## WAS NICHT HÄLT (zuerst)

1. **„Der Bruch liegt in der Paarung Haushalt ↔ Los“ beschreibt den Entwurf der Runde 2, nicht HEUTE.** Heute gibt es keine Paarung.
   Das Haus entsteht zuerst, ohne Haushalt (`bauRezept({bauweise}, null, …)` FC:4436). Das Los ist danach die Stelle, an der seine
   Hülle passt (`tryPlace` FC:5487–5533). Die Bewohner zählt am Ende `leuteVon` aus W·D·st·wohl (FC:9527–9538). **belegt**
2. **Schmale Lose gibt es heute fast nicht.**
   - Los-Breite < 6,5 m: **14 / 2 595 (0,5 %)**, Haus-Front W < 6,5 m: 177 (6,8 %), < 5 m: 0.
   - Der Grund: W ist zweimal auf 5–15 m geklemmt (FC:2208, 4439). Unter 6,5 m drücken nur Rollen-Zeilen: Wohnturm 6, Schmiede 5,5,
     Backhaus 6 (FC:2185, 2196, 2199).
   - Die 431 Lose < 6,5 m der Runde 2 (268 + 163, spike-v2.md:57) hat erst der Los-Setzer von V2 gemacht.

   **belegt**
3. **Wohlstand macht heute KEIN breiteres Los.**
   - ρ(wohl, Los-Breite) = +0,10 (Median je Plan +0,17); ρ(wohl, Los-Fläche) = **−0,18**; ρ(Rang t, Los-Breite) = −0,05.
   - Der Faktor 0,84 + 0,30·wohl (FC:4439) ist da. Er verschwindet aber unter dem Kultur-Würfel (Zahl B: 56 % der Wohnhaus-Breiten-Varianz).
   - Die Reichen stehen nahe am Markt: ρ(wohl, Abstand Markt) −0,48. Dort ist der Grund knapp, darum ist ihr Los kürzer:
     Los-Tiefe Q50 reich 14,0 m, arm 31,0 m.

   **belegt**
4. **Hang hat heute keinen Leser, und in node gibt es keinen Hang.**
   - `exportSettlement` rechnet ohne `dp.hoehe` auf ebenem Grund (FC:9795–9797).
   - Die Hang-Klasse schreibt erst `ortPlan` im Faden der Welt (FC:11110–11112, 11177).
   - Kein Spiel-Code liest `slot.hang`. Grep `\.hang\b` in stamm/, voxel-worker.js und den Kernen: nur gelaende-core `aus.hang`, und das ist
     eine andere Größe.
   - Das Haus wird mit `terrain:0` gebaut (FC:4436, 1488). Gezählt ist darum NICHTS, siehe (c).

   **belegt**
5. **„Ecke ist byte-gleich ihrem Zwilling“ hält am heutigen Kern im strengen Sinn.**
   - Kein Feld markiert eine Ecke. Das Haus entsteht vor seiner Lage.
   - Die Eck-Lose unterscheiden sich trotzdem im Mittel: wohl 1,00 gegen 0,91, Geschosse 2,46 gegen 2,20. Das ist **Auslese**: Patrizier
     und Kaufhäuser stehen an den gegliederten Straßen nahe am Markt. Es ist keine Wirkung der Ecke.
   - Anbau, Keller und L-Grundriss sind gleich (KS-D ≤ 0,013).

   **belegt**
6. **Das Los ist in den Plänen G keine geschlossene Reihe.**
   - Fuge zum nächsten parallelen Nachbarn in der Flucht: Q50 **5,65 m**. ≤ 0,3 m sind es 30,8 %, > 2 m 54,9 %.
   - „Haus füllt die Los-Breite“ (Brandwand beidseits oder beide Fugen ≤ 0,3 m) gilt für **87 / 2 595 = 3,4 %**. Brandwand
     beidseits: 0 (eine Seite: 482).
   - Die belegte Burgage-Reihe ist geschlossen (Stell & Tait 2016: die Reihe schließt sich Wand an Wand). Heute steht die Stadt zu mehr
     als der Hälfte frei.

   **belegt** (Zahl) / Wirklichkeit **belegt** nur für die schottischen Burghs

## DIE TAFEL

| Größe | heute: Ursache / Folge / Würfel (datei:zeile) | Zahl (zaehl-los.log) | Beleg der Wirklichkeit | Eingang im Spiel |
|---|---|---|---|---|
| Los-Index t (Gründungs-Folge) | **Ursache** aller Rang-Größen: Schleife `for i` FC:4428, t = i/(n−1) | ρ(t, wohl) −0,77 · ρ(t, Abstand Markt) +0,64 · ρ(t, r/Rw) +0,66 | Kern alt, Rand jung (Conzen; Richtung) — **unsicher** als Zahl | vorhanden FC:4428–4429 |
| Wohlstand wohl | **Rang + Würfel**: (1,22 − 0,5t)·(0,78 + 0,44·rnd) FC:4438 | Q50 0,99; Stufen arm 270 · mittel 732 · gehoben 928 · reich 665 | Vermögen am Hauptstraßen-Markt (Cirencester 1522: 34 Männer der Dyer Street £ 1 260 Güter, BHO) — **belegt** (Richtung), Zahl je Breite fehlt | vorhanden, aber ohne Haushalt (`haushalt` null FC:4436) |
| Haus-Breite W | **Würfel** (Kultur im Pool FC:4435, Jitter FC:2208) × **Folge** wohl FC:4439 → **Tafel** der Rolle FC:2184–2200 | Q10/50/90 7/10/14; 21 Stufen | — | vorhanden |
| Los-Breite (Front + halbe Fugen) | **Folge** der Hülle (FC:9776–9794) + **Würfel** der Fuge (FC:5530, 1,1-m-Schritte FC:5532) | Q10/50/90 9,0/12,7/16,9; < 6,5 m 0,5 % | Burgage ¾–2½ Einheiten, ⅔ am Viertel-Raster (Edinburgh 49 Lose) → Zahl B | **fehlt** als Feld (`pl.lose` null) |
| Los-Tiefe | **Folge** der Nachbarn: freier Grund bis zum nächsten Hindernis | Q10/50/90 9,2/16,0/89,5 m; Ende: Haus 1 080 · Weg 597 · Mauer 562 · Kappe 80 m 356 | Thame: Lose bis 660 ft, Halb-Burgage 72 × 33 ft (Spavold & Gilman 2002) | **fehlt** |
| Wohl ↔ Los-Breite | **keine** Kopplung messbar | ρ +0,10 (Wohnhaus +0,13) · Fläche −0,18 | Cockermouth 1270: Zins 4 d je „completed plot“, die Breite bestimmt den Zins (Stell & Tait 2016) — **belegt** | **fehlt** |
| Rolle / Gewerbe | **Tafel nach Index + Lage**: Viertel nach Index FC:4383–4386, Grund-Satz FC:4323, 4468; Patrizier/Wohnturm nach wohl ≥ 1,1 ∧ f < 0,45 FC:4340 | Cramérs V(Rolle, Lage) 0,28 · η²(Abstand Markt | Rolle) 0,17 | London 1332: Gewerbe je Straße (Pfeffer-Händler, Candlewick), BHO — **belegt** (Richtung); Straßenname allein ist kein Beleg (Leiden) | vorhanden |
| Rolle ↔ Gasse | **Folge** des Ankers: Handwerk zieht an die Gasse der Seite `zugHandwerk` FC:4489, 5547–5548 | Werkstatt 158/204 (77 %), Gerberei 36/49, Backhaus 18/25 an Gassen der Dichte; Kaufhaus 77/102 am Markt + Hauptstraße | Gewerbe-Cluster folgen der Standort-Ökonomie (Colson 2015, nur Zusammenfassung) — **unsicher** | vorhanden |
| Bewohner | **Folge**: `leuteVon(ov)` FC:9527–9538 aus W·D·st·wohl; je Kopf `_rollGenome` (siedlung-bewohner.js:839, 848) | Köpfe Q10/50/90 1/3/5 · ρ(Köpfe, Los-Breite) +0,54 | Haushalt 4,75 (Laslett, Runde 2) | vorhanden (als Folge) |
| Hang (Neigung unter dem Los) | **Folge** des Ortes in der Welt: `ortPlan` `spanne` FC:11110–11111 → Klasse FC:11112; das Gelände wird an das Haus geglättet (Platte FC:11114–11123, Erdbau gelaende-core.js:2085–2094) | **nicht zählbar in node** (0/2 595 tragen `hang`) | Undercroft mit Tür an der Talseite (Guildford, spätes 13. Jh.); Chester Rows: hinten fast ein Geschoss höher als die Straße (VCH Cheshire, BHO) — **belegt** (Fälle), Anteil **fehlt** | Klasse vorhanden, **kein Leser**; Sockel fest 0,55 m (FC:178, 437) |
| Ecke (zwei Fronten) | **Folge** der Lage, ohne Feld; nur Stufe 1 hält 9 m Ecke frei (`eckeM` FC:4072, 4091–4092) | 1 454 / 2 595 = 56,0 % (≤ 3,5 m), streng ≤ 1,5 m 880 = 33,9 %; Haus ohne Unterschied außer Auslese | Ecke als eigener Begriff („up ort“, Paderborn 1349); Freiburg Eckhaus 1517; Mehrwert der Ecke vormodern **nicht gefunden**; neuzeitlich ~13 % London (Makler-Zahl) — **unsicher** | **fehlt** |

## (a) WER ZIEHT AUF WELCHES LOS — die Reihenfolge am Kern (alles **belegt**)

| # | Schritt | datei:zeile | Ursache / Folge / Würfel |
|---|---|---|---|
| 1 | Los-Index i, t = i/(n−1); Kern = alt | FC:4428–4429 | **Ursache** (die Gründungs-Folge selbst ist gesetzt, nicht abgeleitet) |
| 2 | Baujahr = jahr + spanne·t·(0,55 + 0,45·rnd) | FC:4433 | Rang + Würfel |
| 3 | Kultur = pool[rnd·len], Pool = Region × Ära des Baujahrs | FC:4424, 4435 | Ort/Zeit + **Würfel** |
| 4 | W, D, Geschosse, Neigung = KULTUR + Jitter auf ½ m, W 5–15, D 4–11 | FC:2204–2210 (über `bauRezept` FC:2221–2232, Haushalt `null`) | Tafel + **Würfel** |
| 5 | wohl = (1,22 − 0,5t)·(0,78 + 0,44·rnd) | FC:4438 | Rang + **Würfel** |
| 6 | W × (0,84 + 0,30·wohl), auf ½ m, 5–15 | FC:4439 | **Folge** von 3–5 |
| 7 | +1 Geschoss, wenn städtisch ∧ wohl > 0,9 | FC:4444 | Folge |
| 8 | Keller, Anbau, Balkon, L-Grundriss; arm = n ≥ 16 ∧ wohl < 0,72 | FC:4446–4449 | **Würfel** (arm: Folge) |
| 9 | Grund-Satz: Los 1 Gasthaus, Los ⌊0,62n⌋ Schmiede; Los 0 Kirche | FC:4323, 4468, 4463–4465 | Index |
| 10 | Scheune je Hof (W, D ≥ 6,5 ∧ rnd < schQ) | FC:4478–4484 | Würfel |
| 11 | Viertel nach Index (kirchhof, markt, handwerk, wohnen); Rolle der Zeile; Wohnturm/Patrizier nach wohl ≥ 1,1 ∧ f < 0,45; Kontor in fremder Kultur neu gewürfelt; Maß-Zeile | FC:4383–4395, 4340, 4379–4382, 2227–2228 | Tafel nach Index + wohl |
| 12 | Hülle der Masse (Haus + Anbau + Flügel) | FC:9776–9794 (`massBauExport` FC:9659) | Folge |
| 13 | Netz: Straßenbaum, Quergassen, Gassen der Dichte alle 28 m | FC:5365, 5377–5404, 5460–5481 | Würfel des Plans + Tafel |
| 14 | **Das Los**: Folge = Index (Burg zuerst); Zeiger = min(edepth·34 + cur, Anker des Viertels) + rnd·2; die erste Stelle, an der die Hülle passt; Fuge gap + rnd·0,15, sonst +1,1 m | FC:5560–5562, 5590–5600, 5487–5533 | **Folge** des Hauses + Würfel |
| 15 | Snap der Reihe (Fuge ≤ 1,8 m), Brandwand, Entzerren | FC:8989–9011, 9503–9518, 9051 | Folge |
| 16 | Viertel nach Lage umbenannt (vor der Mauer = Vorstadt, am Wasser = Hafen) | FC:5607–5608 | Folge |
| 17 | Bewohner: Zahl aus dem Haus, Körper aus der Adresse | FC:9527–9538; siedlung-bewohner.js:839, 848 | **Folge** |
| 18 | In der Welt: Boden y, Spanne, Hang-Klasse, Platte, Erdbau | FC:11109–11123; gelaende-core.js:2085–2094 | Folge des Ortes; das Haus bleibt |

**Kausal heißt das:** Index → Wohlstand und Rolle → Haus → Los → Bewohner. Kein Schritt liest das Los zurück in das Haus. Ein Haushalt
(Köpfe, Gewerbe) existiert vor dem Haus nicht, `bauProgramm` (FC:2229) läuft in DORF nicht. Die Breite ist nicht Ursache
der Lage. Lage und Wohlstand sind Geschwister über den Index.

## (b) DIE ZAHLEN AN DEN 2 595 LOSEN (zaehl-los.log Z. 11–92, Definitionen zaehl-los.cjs:13–27, **gewählt**)

- **Breite:**
  - Haus-Front W Q10/25/50/75/90: 7 / 8 / 10 / 12 / 14 m.
  - Hülle-Front: 8,2 / 9,7 / 12,0 / 14,2 / 15,9.
  - **Los-Breite** (Hülle + halbe Fuge je Seite, Fuge gekappt bei 2 m): 9,0 / 10,7 / 12,7 / 14,9 / 16,9.
- **Tiefe:** Haus-Tiefe D 5,5 / 6 / 7,5 / 8,5 / 10. **Los-Tiefe** (Hülle + freier Grund bis zum Hindernis, ein Haus zählt halb):
  9,2 / 11,1 / 16,0 / 33,4 / 89,5. Los-Fläche Q50 206 m².
- **Haus füllt das Los:** 3,4 % (Definition oben). W / Los-Breite Q50 0,80. Hülle / Los-Breite Q50 0,93.
- **Je Rolle** (n · W Q50 · Los-Breite Q25/50/75):

  | Rolle | n | W Q50 | Los-Breite Q25/50/75 |
  |---|---|---|---|
  | Wohnhaus | 1 691 | 10 | 10,5 / 12,7 / 15,0 |
  | Patrizier | 355 | 10 | 12,0 / 13,3 / 15,8 |
  | Werkstatt | 204 | 8 | 12,3 / 12,8 / 13,4 |
  | Kaufhaus | 102 | 8,5 | 10,0 / 10,7 / 11,3 |
  | Wohnturm | 57 | 6 | 7,5 / 8,2 / 9,2 |
  | Gerberei | 49 | 9,5 | 15,2 (Q50) |
  | Gasthaus | 30 | 12 | 17,1 (Q50) |
  | Schmiede | 30 | 5,5 | 7,2 (Q50) |
  | Pfarrhaus | 26 | 10 | 12,0 (Q50) |
  | Kontor | 26 | 10 | 16,4 (Q50) |
  | Backhaus | 25 | 6 | 8,2 (Q50) |

- **Je Wohl-Stufe** (W Q50 · Los-Breite Q50 · Los-Tiefe Q50):

  | Stufe | n | W Q50 | Los-Breite Q50 | Los-Tiefe Q50 |
  |---|---|---|---|---|
  | arm (< 0,72) | 270 | 9,5 | 12,3 | **31,0** |
  | mittel | 732 | 9 | 12,7 | 18,6 |
  | gehoben | 928 | 9 | 12,7 | 15,0 |
  | reich (≥ 1,1) | 665 | 10 | 12,9 | **14,0** |

  Die Breite ist flach über die Stufen. Die Tiefe fällt mit dem Wohlstand, weil die Reichen im engen Kern stehen.
- **Rangkorrelationen** (alle · Median je Plan · nur Wohnhaus):
  - wohl ↔ W: +0,10 · +0,22 · +0,09
  - wohl ↔ Los-Breite: +0,10 · +0,17 · +0,13
  - wohl ↔ Los-Fläche: −0,18 · −0,21 · −0,13
  - wohl ↔ Abstand Markt: −0,48 · −0,54 · −0,38
- **Rolle ↔ Lage:** Cramérs V 0,28. Tafel Log Z. 55–66:
  - Kaufhaus: 19 am Markt, 58 an der Hauptstraße.
  - Werkstatt: 158 von 204 an der Gasse der Dichte. Gerberei: 36 von 49.
  - Wohnhaus: 430 vor der Mauer.
- **Lose < 6,5 m:**
  - Los-Breite 14: Schmiede 10, Wohnhaus 4.
  - Hülle 48: Schmiede 30, Wohnhaus 18.
  - W 177: Wohnturm 57, Wohnhaus 57, Schmiede 30, Backhaus 25. wohl Q50 0,98: auf der schmalen Front sitzen nicht die Armen, sondern
    die Tafel-Rollen und der reiche Turm.

## (c) HANG — woher das Spiel die Neigung kennt, und was ein Zähler in der Welt lesen muss

- **Die Quelle:** `ortPlan(plan, origin, ctx)` (FC:10348), gerufen im Faden der Welt (voxel-worker.js:993, 1030, 1040, `ortWahl`).
  `ctx.hoehe` ist die Höhe der Welt H(x, z).
  - Je Slot nimmt `grunde[si] = rechteck(obb)`: 5 × 5 Proben von H über dem Grundriss (FC:10379–10387, 11041).
  - Der Boden y ist die Gasse vor der Tür, sonst der Median (FC:11109).
  - **`spanne` = max |grund − y|** (FC:11110–11111) ist eine lokale Variable, sie wird NICHT exportiert.
  - Exportiert wird nur die Klasse `hang` = plattform (≤ 1,5 m) · hanghaus (≤ 4 m) · stelzen (ORT_GESETZ FC:10005–10006, FC:11112) in
    `slots[k].hang` (FC:11177).
- **Was das Haus davon liest:** nichts.
  - `p.terrain = 0` (FC:4436), `gelaende()` kehrt dann leer zurück (FC:1488).
  - Der Sockel ist fest `foundH` 0,55 m, eine flache Platte 25 cm vor der Wand (FC:178, 437–439).
  - Stattdessen passt sich das Gelände dem Haus an: Platte mit Saum 0,6 m auf der Höhe y (FC:11114–11123), Böschung 0,6 bis 16 m
    (ERDBAU gelaende-core.js:2094).
  - Ein Hanghaus mit Sockelgeschoss oder einem Geschoss mehr zur Talseite gibt es nicht. **belegt**
- **Der Zähler in der Welt** (nicht gebaut, **gewählt**) liest je Ort das Ergebnis von `ortWahl` → `v2.slots[k]`. Er braucht:
  1. `hang` (vorhanden, FC:11177);
  2. die Spanne, neu gerechnet aus `ctx.hoehe` über `rechteck(slot.obb)`, wie FC:11110–11111;
  3. die **Richtung**: H(Frontmitte) − H(Rückmitte) mit der Frontmitte bei lz = −ez (die Front zeigt zur Straße, FC:5495–5497).

  Liefern soll er:
  - die Anteile plattform / hanghaus / stelzen;
  - die Spanne Q10/50/90;
  - den Anteil „Tal vorn“ gegen „Tal hinten“;
  - dieselben drei Größen je Rolle;
  - und **Δ Haus = 0** als Kontrolle, solange kein Leser existiert: W, D, st und foundH gleich zwischen den Klassen.
- **Beleg (unsicher in der Zahl):**
  - Guildford: Undercroft des späten 13. Jh., Tür an der Talseite für die volle Kopfhöhe (Wikipedia „The Undercroft, Guildford“).
  - Chester: hinter den Rows liegt der Grund fast ein Geschoss höher als die Straße (BHO, VCH Cheshire „The Rows“).
  - Salzburg: das aufgestockte Bürgerhaus als typische spätmittelalterliche Hangverbauung (Welterbe-Booklet 6, nur die Zeile gelesen).
  - Einen ANTEIL der Hanghäuser mit talseitigem Mehrgeschoss habe ich nicht gefunden.

## (d) ECKE

- **Woran der Plan eine Ecke erkennt:** an nichts.
  - `tryPlace` setzt jedes Haus an EINE Straße und eine Seite (FC:5494–5497).
  - Die Flanke hält nur Abstand: Gehweg der Fahrstraße bzw. 0,25 m (FC:5515–5518).
  - Allein Stufe 1 (Kacheln großer Städte) lässt am Kanten-Anfang 9 m frei, „die Ecke gehört dem letzten Haus der Kante davor“
    (`eckeM`, FC:4072, 4091–4092). Ein Feld entsteht dort nicht.

  **belegt**
- **Gezählt** (gewählt: Flanke ohne Brandwand, anderer Weg quer zur Flanke, Fahrbahnrand ≤ 3,5 m; Selbsttest GRÜN):
  - **1 454 / 2 595 = 56,0 %** Eck-Lose, beide Flanken 311.
  - Streng (≤ 1,5 m): 880 = 33,9 %.
  - Der Seiten-Weg ist meist die Gasse der Dichte (879): sie zweigt je 28 m quer ab (FC:5478–5480).
  - Abstand der Flanke zum Seiten-Weg Q50: 1,26 m.
  - Eck-Lose stehen in kürzeren Blockfronten: Q50 1 Los gegen 2.
- **Unterschied des Hauses:**

  | Größe | Ecke | sonst | KS-D |
  |---|---|---|---|
  | W | 9,69 | 10,25 | 0,12 |
  | D | 7,28 | 7,65 | 0,12 |
  | Geschosse | 2,46 | 2,20 | 0,19 |
  | wohl | 1,00 | 0,91 | 0,21 |
  | Anbau / Keller / L | gleich | gleich | ≤ 0,013 |

  Keine dieser Größen liest die Ecke: das Haus entsteht in DORF vor `dorfLayout`. Der Unterschied ist **Auslese** über den Ort, an den
  das Viertel zieht: Kaufhaus 85 %, Pfarrhaus 88 %, Patrizier 77 % am Eck, Wohnhaus 48 %.
- **Beleg:**
  - Das Eckhaus ist ein eigener Begriff der Urkunden („up ort“, Paderborn 1349; digital.ub.uni-paderborn.de, nur die Zeile der Suche).
  - Freiburg: Eckhaus A an Schusterstraße/Kaufhausgässle, 1517 (Löbbecke, Kaufhaus).
  - Zwei Schau-Seiten: Fälle ohne Wertangabe. Den höheren Wert einer vormodernen Ecke habe ich **nicht belegt** gefunden.
  - Gloucester: Mieten folgen Lage und Nutzung (Casson & Casson 2015, EHR 69(2), nur die Zusammenfassung; Ecke dort nicht genannt).
  - Modern: ~13 % Aufschlag London (Makler-Analyse) und „etwa 50 %“ als Regel eines älteren Immobilien-Lehrbuchs. Beides ist nicht
    vormodern.

## (e) WAS DIE WIRKLICHKEIT BELEGT (Quelle · Zahl · Status)

| Satz | Quelle · Zahl | Status |
|---|---|---|
| Breite bestimmt den Zins | Cockermouth 1270: 4 d je vollem Los = Einheits-Los; „plot width appears to have been a critical determinant“ (Stell & Tait 2016, Urban History 43(1), PDF-Text gelesen) | **belegt** |
| Reiche bauen in die Tiefe statt in die Breite | Edinburgh: wohlhabende Bürger-Familien bauten, „constrained by plot widths“, in das Hinterland (Gladstone's Land, Riddle's Court 14,2 m = 2,58 Einheiten; Acheson House 19,3 m = 2,51), Stell & Tait 2016 | **belegt** (Fälle) |
| Vermögen an der Hauptstraße | Cirencester 1522: die Reichsten an der Dyer Street (High Street), 34 Männer mit £ 1 260 in Gütern (BHO, Cirencester); London 1332 Lay Subsidy (BHO) | **belegt** (Richtung); Breite je Steuerstufe **nicht gefunden** |
| Handwerk ↔ Gasse | London 1332: Gewerbe je Straße (BHO); Colson 2015 EHR: Cluster folgen der Standort-Ökonomie (Zusammenfassung); Leiden: Straßenname ohne die Walker (Leiden Medievalists Blog) | Richtung **belegt**, Anteil **fehlt** |
| Eckhaus | Begriff und Fälle (Paderborn 1349, Freiburg 1517) | Begriff **belegt**, Wert **unsicher** |
| Hanghaus | Guildford-Undercroft, Chester Rows (oben) | Fälle **belegt**, Anteil **fehlt** |

## WAS EIN KÜNFTIGES GESETZ LIEFERN MUSS, DAMIT DASSELBE SKRIPT ES OHNE UMBAU ZÄHLT

- Das Los als Zahl im Bau-Vektor:
  - `hp.losBreite`, `hp.losTiefe`, `hp.ecke` (bool). Sie reisen mit `ov = JSON(hp)` in den Slot (FC:5923).
  - Das Skript liest `slot.ov[LOS_FELD]` bzw. `hp[LOS_FELD]` und zählt sie statt der abgeleiteten Größen (zaehl-los.cjs:6–8, Log Z. 9:
    heute 0 von 2 595).
  - Namen über `LOS_FELD`, `LOS_TIEFE_FELD`, `ECKE_FELD`.
- Hang: `slot.hang` (heute erst in `ortPlan`); `HANG_FELD` wird gelesen, wenn der Slot ihn trägt.
- Der Haushalt vor dem Haus: wird `bauRezept(…, haushalt, …)` mit Haushalt gerufen, schreibt `bauProgramm` `hp.leute`, und
  `leuteVon` liest es (FC:9531). Die Zeile ρ(Köpfe, Los-Breite) zählt dann die Paarung.

## WAS UNSICHER BLEIBT

- Los-Breite, Los-Tiefe und Ecke sind **meine** Lesart eines Plans, der kein Los trägt (gewählt: Kappe der Fuge 2 m, Tiefe 80 m,
  Ecke 3,5 m). Die Zahlen hängen daran. Ecke 56 % ↔ 34 % zeigt die Spanne.
- Gezählt ist der Export (`exportSettlement`) auf ebenem Grund. In der Welt verschiebt die Ort-Wahl den Plan nur als Ganzes
  (voxel-worker.js:1010), die Lage im Plan bleibt. Ob ein Slot dort ins Wasser fällt, ist nicht gezählt.
- Nur Pläne G (Gründung ≤ 1549, nH 90). Stufe 1 (`kachelMassen` FC:4074–4114, `breit = frei/n` je Blockkante) trägt eine eigene,
  stetige Los-Breite. Sie ist hier nicht gezählt, weil die Pläne G keine Kachel sind.
- Alle Web-Belege außer Stell & Tait 2016 und Spavold & Gilman 2002 (beide PDF-Text gelesen) sind Zusammenfassungen von Such- oder
  Abrufseiten.
