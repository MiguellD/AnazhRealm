# PRÜFUNG SPIKE v2 (Gegenprüfer, Skeptiker · BAU-ZENSUS Runde 2, Kapitel GEBÄUDE/STADT · Lese-Baum n1011-hg main b7ed8419, nur gelesen)

Geprüft: v2/spike-v2.md gegen entscheid-v2.md §5 (S-a … S-i) und die Skripte in v2/spike/. Kein git, kein GPU, kein Browser, kein Spiel-Code.
Arbeitskopie: `p3/n1811/bau-spike2/pruef-v2/` (eigene Kopie von v2spike, die Spike-Ausgaben bleiben unberührt). Mein Prüfskript:
`zaehl/pruef-spike-v2.cjs` (lädt die Kette aus spike-v2.cjs bis vor den Lauf-Block, eigener Zufalls-Strom, schreibt nichts) →
`p3/n1811/bau-spike2/pruef-v2/pruef-spike-v2.log`. Nachgefahren: `node spike-v2.cjs` in pruef-v2 (13 s) → pruef-v2/spike-v2.log,
`node zaehl/spike-v2-zweit.cjs` → ZWEITZÄHLUNG GRÜN.

## WAS NICHT HÄLT (zuerst)

1. **S-b „HÄLT“ ist ein nachträglicher Umbau des Prüfers. Nach dem Wortlaut FÄLLT S-b.** Die Schwelle (entscheid-v2 §5) zählt einen
   Treffer, wenn die Grundfläche des Ständers das Podest 0,9 m schneidet. Die erste Linse fand 221 Häuser (diag-sab.log). Danach wurde
   das Podest auf den lichten Innenraum gekürzt (linse-v2.cjs:89, 98), und die Wand-Ständer stehen jetzt als eigene Zahl. Nach dem
   Wortlaut gezählt: **221/1 763 = 12,5 %** der Stadt, **14/48 = 29 %** der 100 (pruef-spike-v2.log (5); hundert: `sb.treffer ||
   sb.wandInsPodest`). Beides liegt über 10 %. Der Fehler ist echt: A legt den Lauf 0,9 m von der Wand-ACHSE (GP:275), der Ständer 0,16
   ragt 0,08 m hinein, das Podest hat 0,82 m licht. Dazu kommt: Tür 0 und Loch 0 sind Konstruktion, denn A setzt Türkanten als
   Zwangs-Achsen (grundriss-a.cjs:428). Unabhängig gemessen ist nur das Podest, und genau dort fällt S-b.
2. **S-a „FÄLLT, 441 Häuser“ steht auf einer Annahme der Linse, nicht auf der Geometrie.** Die Linse nimmt an, dass die oberste Decke
   kein Loch hat (linse-v2.cjs:42, „das Dach hat in A keinen Lauf“, nicht belegt). Gegen diese Annahme spricht A's eigene Zeichnung:
   **A zeichnet in allen 1 257 eingeschossigen Häusern eine Treppe** (pruef-spike-v2.log (4)). In einem eingeschossigen Haus kann sie nur
   in den Dachraum führen, also hat dort die oberste Decke ein Loch. **222 der 441** roten Häuser sind solche eingeschossigen Häuser.
   Liest man „Loch in jeder Decke“ (so prüft A, GP:478), dann ist S-a am Prototyp **0/1 763**. Das Urteil hängt allein an der offenen
   Frage, ob die Treppe in den Dachraum geht. In jeder der beiden Lesarten heilt der Bauplan: entweder gilt das Loch, oder der Unterzug
   wird in der obersten Decke nicht unterbrochen (GP:385 `kreuzt` nur für k < st − 1). Das ist ein Fehler im Bauplan, keine
   Widerlegung des Gesetzes. Der Spike-Satz „A's eigener Prüfer verdeckt es“ ist darum zu hart: A's Prüfer folgt A's Zeichnung.
3. **Die Stopp-Bedingung des Koordinators zu S-a ist nicht prüfbar.** Verlangt sind 0 von 100 Häusern mit Balkenlinie über L_max am
   GEBAUTEN Haus. Ein HAUS nach dem Gesetz gibt es nicht. Die 48 HAUS-Bauten des Kerns sind die heutige Balkenlage (FC:466–470). Dort
   ist „rot“ fast nur ein Vergleich von D mit L_max: alle 32 roten haben D > L_max, keines hat D ≤ L_max. Drei Häuser mit D > L_max
   bleiben aber GRÜN (node über spike-v2-hundert.json). Diese drei hat die HAUS-Linse übersehen oder als getragen gelesen; ungeklärt (unsicher).
4. **Die sichtbare Vielfalt fällt tiefer, als der Spike sagt.** Unter der Rundung (Breite und Tiefe in Klassen zu 0,3 m, Traufe zu
   0,2 m) bleiben die Zahlen gleich, denn W und D liegen schon auf dem ½-m-Raster (spike-v2.cjs:16 `halb`). Zwei andere Dinge aber
   ändern die Zahlen:
   - **Formen und Breiten halten nur durch die Band-Häuser.** Ohne W > 20 m und W/D > 5, die der Spike selbst „Form-Unsinn“ nennt,
     bleiben **387 Formen / 27 Breiten / 3,47 m / 9,4 %**. Nur im heutigen Breiten-Band 5–15 m sind es **283 / 19 / 3,47 / 10,9 %**.
     Damit fallen auch Formen und Breiten.
   - **Der Nenner ist nicht gleich.** Heute zählt 2 595 Häuser, die Kette nur 1 763 gültige. Heute an denselben 1 763 Losen ergibt
     399 / 21 / 4,70 / 6,9 %.

   Echt sichtbar gewachsen ist nur die Traufe: 30 Werte nach der Rundung auf 0,2 m, heute 5. Mit der Traufe in der Form sind es 776
   Formen, heute 440. Die Spanne bleibt aber 3,14 m (pruef-spike-v2.log (3)).
5. **Ein Sachfehler im Spike-Blatt, Punkt 8.** Ein Haus mit Baujahr nach 1900 bekommt die lichte Höhe **2,4 m, nicht 2,6 m**. Die
   Tafel steht in gesetz-proto-r1.cjs:14 `[[1500,2.0],[1800,2.2],[1900,2.6],[1e9,2.4]]`, gelesen wird sie mit `y < bis`
   (gesetz-proto-r1.cjs:71). 2,6 m gilt also für 1800–1899. Probe am Hang (Baujahr 2000): 0,30 + 2,4 + 0,2449 + 0,06 = 3,005 m, und
   der Spike druckt 3,00. Die 192 Häuser nach 1900 (bis 2181) sind richtig gezählt (node über stadt-v2-haeuser-m03.json).
6. **Druck-Klippen.** Schon ein Schritt von Druck ± 0,01, also die Rundung K8, kippt in **146/1 763 = 8,3 %** der Häuser die sichtbare
   Form oder die Gültigkeit (pruef-spike-v2.log (6)). Die Ursache ist benannt, sie wirkt aber an Schwellen und nicht stetig. Ein
   Nachbarhaus mit fast gleichem Rang kann ein anderes Haus bekommen oder gar keines.
7. **Die veröffentlichte Kopie v2/spike/ ist allein nicht lauffähig.** Es fehlen `gesetz-proto-r1.cjs`, `kern/` und
   `stadt-v2-haeuser-m03.json`; sie liegen nur im Scratch v2spike/. lade.cjs:1 nennt main 18058dba. Der SHA der Kern-Kopie ist trotzdem
   gleich dem Original am b7ed8419 (unten), das hat also keine Folge.

## TAFEL — Spike sagt · ich sage

| # | Spike sagt | ich sage | Grund (Rechenweg) |
|---|---|---|---|
| S-a | FÄLLT am Prototyp (441/1 763, 16/48, bis 1,96 × L_max); am HAUS NICHT ENTSCHEIDBAR | **NICHT ENTSCHEIDBAR** am Prototyp und am HAUS | 441 nur unter der Annahme linse-v2.cjs:42; Lesart „Loch in jeder Decke“ ergibt 0/1 763; 222/441 sind eingeschossige Häuser MIT gezeichneter Treppe (Punkt 2). Es fehlt der unabhängige Test: A muss sagen, ob die Treppe in den Dachraum geht, und der Kern muss ein HAUS nach dem Grundriss bauen. Mutante ROT 1 343: bestätigt |
| S-b | HÄLT (0,1 %) | **FÄLLT** nach Wortlaut: 12,5 % (Stadt), 29 % (die 100) | Punkt 1. Tür und Loch sind 0 durch Konstruktion (GP:428), nur das Podest ist ein freier Test |
| S-c | FÄLLT (490/38/3,14/9,2 %) | **FÄLLT**, tiefer: ohne Band-Häuser 387/27/3,47/9,4 % | Punkt 4; Rundung 0,3/0,2 m ändert nichts (½-m-Raster) |
| S-d | HÄLT nach Wortlaut; B's Prüfung blind an Mutante D | **HÄLT nach Wortlaut**, mit Einschränkung | eigene 50 Paare (eigener Strom `PRUEFER|…`, nicht ax des Spikes): 50/50 sichtbar verschieden; bei 49 ändert schon EINE getauschte Ursache das Sichtbare, bei 1 nur alle zusammen, 0 unerklärt; alle Ursachen getauscht ergibt 50/50 = B. Wirksam: b 40, gewerbe 34, koepfe 24, druck 22, kern 21, wohl 19, aufst 15, klasse 13, bau 9, inwohner 4. **7/50** Paare unterscheiden sich NUR durch Adress-Ströme (`ax("kinder"/"teil"/"auf"/…, id)`, stadt-b.cjs:205–219), also durch benannte Würfel. Die Ursache ist dann ein Name, keine Welt |
| S-e | FÄLLT (100 % am Raster) | **FÄLLT**, Konstruktion | b = f·U mit f auf Vierteln (stadt-b.cjs:199 `viertel`) |
| S-f | FÄLLT (32,1 %) | **FÄLLT** | nachgefahren 1 763/2 595 gültig, 832 = 32,1 % (pruef-v2/spike-v2.log Z.5) |
| S-g | NICHT ENTSCHEIDBAR; Hülle kalt 68,7 µs FÄLLT | **gleich**: Hülle kalt 71,9 µs in meinem Lauf (> 50) | pruef-v2/spike-v2.log Z.55; DORF kalt 3,4 ms / warm 0,48 ms (Rauschen gegen 4,96/0,67) |
| S-h | FÄLLT (0,125) | **FÄLLT** | nachgefahren 0,125; K 0,118; H 0,251 |
| S-i | HÄLT (4,85 · 12,5 % · 6,7 %) | **HÄLT als Eichung, nicht als Vorhersage** (zirkulär) | B hat Gesinde und Miete an Laslett geeicht (entscheid-v2 §1 Entscheid 4: Miete 0,3 gewählt, um 5–8 % zu treffen) |

**Stopps des Koordinators:** 0/100 Balkenlinien > L_max — NICHT erreicht, ein HAUS des Gesetzes fehlt · Ständer trifft Tür/Treppe ≤ 10 %
— NICHT erreicht (12,5 % / 29 %) · sichtbare Vielfalt ≥ heute — NICHT erreicht · Differenzen rückführbar — erreicht nach Wortlaut.
**Ergebnis: drei von vier Stopps nicht erreicht.**

## (1) Ist der Kern byte-gleich?

Ja. SHA-256 `028cc2d012a9d47c33ea546dd52003333dbdd550126cf636ffbf959ef65bea06` für `n1011-hg/fachwerk-core.js` und für die Kopie
(sha256sum; pruef-spike-v2.log (1)). Der Pfad `worlds/fachwerk/fachwerk-core.js` aus dem Auftrag existiert nicht; worlds/fachwerk/
enthält fachwerk.js, index.html, panorama.f16. Die Kopien sind treu, geprüft mit diff gegen die Originale: grundriss-a.cjs = grundriss-proto.cjs
+ 2 Zeilen (Z.85–86, Haken `hoch`); stadt-b.cjs = stadt-proto.cjs bis auf Z.17 (Pfad); gesetz-proto-r1.cjs SHA d59dc3b8… =
vision/bau/spike/gesetz-proto.cjs. v2/spike/* und v2spike/* sind byte-gleich (cmp).

## (2) Sind die Schwellen aus §5 unverändert angelegt?

| # | angelegt wie §5? |
|---|---|
| S-a | Ja. Die ODER-Klausel zur Mutante ist ROT. Die erste Klausel („am gebauten HAUS“) ist nicht anlegbar, das sagt der Spike offen |
| S-b | **Nein.** Das Podest ist auf lichte Maße gekürzt (linse-v2.cjs:89), der Wortlaut sagt „Podest 0,9 m“. Das Urteil kippt dadurch von FÄLLT auf HÄLT |
| S-c | Ja (Maß wie stadt-b.cjs:105–113). Der Nenner ist aber 1 763 statt 2 595 (Punkt 4) |
| S-d | Ja. Die Mutante D ist eine Zugabe, offen benannt |
| S-e, S-f, S-h, S-i | Ja |
| S-g | Ja, kalt und warm in einem Prozess. „DORF + 90 Hüllen“ ist gerechnet, nicht gemessen; das sagt der Spike offen |

Die Auswahl der 100 kommt aus 30 Saaten statt aus Saat 1–2 (K11). Die Abweichung ist offen benannt und für das Urteil ohne Folge.

## (3) Zirkulär?

- **S-b Tür/Loch**: A setzt Türkanten als Zwangs-Achsen des Rasters (grundriss-a.cjs:428). Der Prüfer misst also, was der Bau setzt.
  Frei gemessen ist nur das Podest, und das FÄLLT.
- **S-a Prototyp**: Die Linse liest die Unterzüge, die A setzt. Die Spannweite ist ein echter Test, das Ergebnis hängt aber an der
  Dach-Loch-Annahme. Es fehlt ein unabhängiger Test: ein HAUS des Kerns, das nach A's Grundriss gebaut ist.
- **S-a HAUS**: misst die heutige Balkenlage, also D gegen L_max. Das ist die Mutante am Kern, kein Test des Gesetzes.
- **S-d**: Der Gegenwelt-Test ist ein echter Test, er beweist „kein verborgener Eingang“. Mein Eingriffs-Test zeigt zusätzlich: eine
  einzelne Ursache wirkt (49/50). Dass die Ursache wahr ist, ist damit nicht bewiesen: 7/50 Paare tragen nur benannte Würfel.
- **S-e, S-i**: Konstruktion bzw. Eichung.
- **Hang/Ecke „GLEICH“**: tautologisch. `ursachen()` (spike-v2.cjs:51) kopiert die Felder `gefaelle` und `ecke` nicht, die Kette kann
  sie also nicht lesen. Der Befund „kein Leser“ ist trotzdem richtig (FC:4436 `terrain:0`).

## (4) Drei Häuser von Hand (Statik)

**L_max von Hand**, Eiche d = 0,258, e = 0,85 (Balken-Abstand), g 1,5 / q 2,0 kN/m² (gesetz-proto-r1.cjs:9, 72–80):
- Querschnitt: b = d/√3 = 0,1490 m, h = d·√(2/3) = 0,2107 m; I = b·h³/12 = 1,1605·10⁻⁴ m⁴; EI = 11 000·10⁶ · I = 1,277·10⁶ N·m².
- w_fin = (1,5·1,6 + 2,0·1,18)·850 = 4 046 N/m. L_fin = ∛(384·EI / (5·250·w_fin)) = ∛96,9 = **4,59 m**.
- Gegenproben: L_inst = ∛(384·EI / (5·300·2 975)) = 4,79 m; L_Biegung = √(8·18,46·10⁶·1,102·10⁻³ / 4 271) = 6,17 m.
- Die Durchbiegung fin bestimmt. Das Skript druckt 4,593 / 4,789 / 6,172 (pruef-spike-v2.log (7)).

Nadel d = 0,30: b 0,1732, h 0,2449, EI = 2,333·10⁶ → L_fin = ∛177,2 = **5,62 m** (Skript 5,616).

1. **Kaufmann G20#28** (mediterran, 1616, Eiche, gierig): Bänder 2,45 / 2,38 m.
   - Balken: η_fin = (2,45/4,593)³ = **0,15** ✓.
   - Traufe: 0,30 + 2 · (2,2 + 0,2107 + 0,06) = **5,241 m** ✓. Das zweite Geschoss ist die Aufstockung 1736, im Grundriss leer.
   - Stab: 5,24 ≤ 2·D = 10 ✓.
   - Treppe: N 14, Steigung 2,4707/14 = 0,176 m, Auftritt 0,27 m. Schrittmaß 2·0,176 + 0,27 = 0,62 ✓. Sie kreuzt die Bandlinie s 2,45
     nicht (s 3,81–4,71), der Unterzug ist durchgehend ✓.
   - **Aber:** 36 × 5 m, W/D 7,2. Statisch hält das Haus, als Form ist es ein Riegel (Spike Punkt 3 bestätigt).
2. **Hang G4#10** (alpin, 2000, Nadel): Bänder 2,53 / 3,57 m.
   - Balken: η_fin = (3,57/5,616)³ = **0,26** ✓.
   - Traufe: 0,30 + **2,4** + 0,2449 + 0,06 = **3,005 m** ✓ (Punkt 5: 2,4 m, nicht 2,6 m).
   - Treppe: N 13, Steigung 0,208 m, Auftritt 0,22 m (Spartreppe). Schrittmaß 0,64 ✓.
   - **Die Treppe steht in einem eingeschossigen Haus.** Sie führt in den Dachraum, also hat die oberste Decke dort ein Loch (Punkt 2).
3. **G19#82** (mitteleuropa, 1105, Eiche, eingeschossig, eines der 16 S-a-roten der 100): Ls 7,64 m, Bänder 3,20 / 4,44 m.
   - Balken in den Bändern: η_fin = (4,44/4,593)³ = **0,90** ✓.
   - Die Bandlinie s = 3,20 trägt: Wand u 0–5,12, Unterzug u 6,19–7,46, Wand u 7,46–10,5. Lücke u 5,12–6,19 am Treppenloch
     (u 5,2–6,1, s 1,38–5,02).
   - Der Balken an u = 0,425 + 6·0,85 = **5,525** liegt in der Lücke:
     - **ohne** Loch in der obersten Decke spannt er 0 → 7,64 m = **1,66 × L_max**, η_fin = 1,66³ ≈ 4,6 ✗;
     - **mit** Loch (die Treppe dieses eingeschossigen Hauses geht nach oben) wird er an s 1,38 und 5,02 gewechselt und spannt
       höchstens 7,64 − 5,02 = **2,62 m** ✓.
   - Das Urteil über dieses Haus hängt also allein an der Dach-Loch-Frage. Von Hand nachgerechnet, wie in Punkt 2.

## (5) Gegenbeispiele, die der Spike übersah

- **S-b nach dem Wortlaut**: 221 Häuser in der Stadt und 14 der 48. Der Spike zählt sie als „Podest 0,82 m licht“ und nicht als Treffer.
- **222 der 441 S-a-Häuser**: Treppe ins Dach, im eingeschossigen Haus gezeichnet. Die Linse widerspricht hier der Geometrie.
- **Vielfalt aus Riegeln**: 11 der 38 Breiten liegen über 20 m. Im heutigen Band 5–15 m bleiben 19 Breitenstufen (< 21).
- **Klippen**: 8,3 % der Häuser kippen bei Druck ± 0,01.
- **Drei HAUS-Bauten mit D > L_max** bleiben in der HAUS-Linse GRÜN; ungeklärt.
- **Lichte Höhe nach 1900** ist 2,4 m (Punkt 5).

## (6) Was ich NICHT weiß

- Ob die Treppe in A in den Dachraum führt. A sagt es nicht. Die Dach-Räume (Trockenboden, Lager „dach“) baut A nicht (GP:78–86 `aussen`).
- Warum drei HAUS-Bauten mit D > L_max GRÜN bleiben (die HAUS-Linse, linse-v2.cjs:66–81, ist nicht von mir nachgebaut).
- Erschöpfende Läufe: nicht nachgefahren (alle Zahlen hier gierig, KAP 1; die ASCII-Bänder des Kaufmanns sind die erschöpften, 2,36/2,48).
- Ein Mutanten-Test meines Eingriffs-Tests ist nicht gefahren. Er ist darum kein Detektor für Würfel, nur ein Nachweis der Wirkung.
- Kein Bild. Alles hier ist Mechanik.

## (7) Bahn 1 ÖFFNUNGEN

Aus Sicht des Spikes spricht nichts dagegen. Der Spike berührt Fenster, Flügel, Laibung und Uhr nicht. Keine seiner Zahlen ist ein
Eingang der Bahn 1 (entscheid-v2 §4.3 „Unabhängig baubar“: WALLS, `fensterSchlaeft`, `state.timeOfDay`, `_wetterAmOrt`). Die
Bedingungen 1 und 2 dort bleiben gelesene, nicht gemessene Bedingungen.

## ERGEBNIS IN DREI SÄTZEN

Nachgefahren: der Spike ist am byte-gleichen Kern 028cc2d0 Zahl für Zahl reproduzierbar (bis auf die Zeiten), die Zweitzählung ist GRÜN.
Gefunden: S-b fällt nach dem Wortlaut (12,5 % / 29 %, der Prüfer wurde nach dem ersten Lauf umgebaut), S-a ist nicht entscheidbar
(441 → 0 je nach Dach-Loch-Lesart, 222 der 441 widersprechen A's eigener Treppe), und die Vielfalt hält Formen und Breiten nur über
Riegel > 20 m (ohne sie 387 / 27). Ehrlich offen: die Dach-Treppe in A, ein HAUS nach dem Grundriss, drei grüne HAUS-Bauten mit
D > L_max und jedes Bild. Bahn 1 ist vom Spike unberührt und baubar.
