# ZENSUS ABSTECKUNG DES LOSES — Runde 3, Zahl B (Lese-Baum n1011-hg main b7ed8419, nur gelesen)

Kern FC = `fachwerk-core.js`, SHA-256 028cc2d0…bea06, byte-gleich mit der Kopie `p3/n1811/bau-spike3/kern/` (gedruckt und verglichen).
Skript `v3/zaehl-los.cjs` (SHA-256 ae3990a5…b17f4, Teil „ZAHL B“), Ausgabe `v3/zaehl-los.log` Z. 93–129. Dieselben 2 595 Haushalts-Lose
der 30 Pläne G. Die Definitionen von Haus-Front W, Hülle, Los-Breite und Blockfront stehen in zensus-los-haushalt.md §b und
zaehl-los.cjs:13–27 (**gewählt**). Markierung: **belegt** · **gewählt** · **unsicher**.

## WAS NICHT HÄLT (zuerst)

1. **„58 % der Breiten-Varianz sind reiner Würfel“ hält nicht als EINE Zahl.** Sie hängt an der Menge und an der Rechnung (Log Z. 114–122).

   | Menge · Rechnung | Würfel-Anteil |
   |---|---|
   | Wohnhaus-Lose (1 691, Kette 2 595/2 595 nachgebaut), Var(W) in derselben Stadt ohne Jitter und Kultur-Würfel: **3,511 → 1,195 m²** | **66,0 %** |
   | dasselbe mit Wohl-Würfel | 68,6 % |
   | exakte Zerlegung Cov/Var: Kultur-Würfel 56,4 + Jitter 13,3 + Wohl-Würfel 10,3 | 79,9 % |
   | alle 2 595 Haushalts-Lose: die Rollen-Zeilen setzen W fest (Rolle 41,0 %) | 37,2 % (kontrafaktisch) bzw. 47,3 % (Zerlegung) |

   Runde 2 hatte 3,13 → 1,30 an 1 644 Losen; meine Mittel sind n-gewichtet. Die Aussage „in derselben Stadt ist die Breite
   überwiegend Würfel“ hält und ist schärfer als 58 %. Über alle Städte trägt der Würfel nichts: 6,79 → 6,83 m². **belegt**
2. **Heute liegt die Los-Breite NICHT am Raster, und kein belegtes Raster erklärt sie.**
   - Die Haus-Front W liegt zu 100 % auf dem ½-m-Raster: das ist Rundung, keine Absteckung (FC:2208, 4439).
   - Die Los-Breite (Hülle + halbe Fugen) trifft das ½-m-Raster nur zu 24 / 2 595.
   - Gegen jede Einheit von 0,5 bis 6 m liegt sie höchstens κ = 0,08 über dem Zufall (u 1,30 m, ± 0,5 m).
   - Am Edinburgh-Viertel-Raster (1,83 m): R = 52,8 %, κ = −0,04.

   **belegt**
3. **Auch der Beleg „⅔ am Raster“ liegt nahe am Zufall.**
   - Bei ± 0,5 m um ein Viertel-Raster von 1,83 m fällt schon die gleichverteilte Breite zu p0 = 54,7 % hinein.
   - ⅔ von 49 Losen (33/49 angenommen, Wilson 95 % 0,534–0,788) ist darum κ = **0,27 (−0,03 … 0,53)**.
   - Das belegte Signal ist schwach. Ein Gesetz, das es misst, braucht den Zufalls-Abzug, sonst trifft auch Rauschen die Schwelle.

   **belegt** (Rechnung) / die Lesart der Toleranz ist **unsicher** (Stell & Tait: „within ± 0.5 metres of the precise quarter width“)
4. **Teilungs-Stufen (ganze, halbe, Drittel-Hofstätte) gibt es heute nicht.**
   - Kein Kern-Feld kennt eine Einheit oder einen Bruch.
   - Die gezählten Brüche gegen Edinburgh oder Elgin sind darum kein Befund über das Spiel. Bei 15 Brüchen und ± 0,5 m fängt das Netz
     fast jede Breite: 68 % bzw. 66 % „treffen“.
   - Gegen die Freiburger Hofstätte (16,2 m) treffen 39 %.

   **belegt**
5. **Eine Verteilung der Wirklichkeit mit Quantilen habe ich nicht gefunden.**
   - Es gibt keine Rohliste der Breiten einer Stadt (Edinburgh, Thame, Alnwick, Lübeck, Freiburg, Bern).
   - Ein KS- oder Quantil-Abstand gegen die Wirklichkeit ist darum heute NICHT rechenbar.
   - Das benannte Maß unten (κ_R) braucht nur Anteil und n. **belegt** (Suche) / **unsicher** (ob es solche Listen gibt)

## (a) WIE DIE LOS-BREITE HEUTE ENTSTEHT (belegt)

**Stufe 2 — die Pläne G, das Haus im Nah-Ring** (`exportSettlement` → `dorfLayout`). Ein Los als Größe gibt es nicht (`pl.lose` null,
FC:4501–4504: `lose[a]` nur bei Chronik). Die Breite, die der Straße abgemessen wird, ist die Hülle des Hauses:

| Stufe | Rechnung | datei:zeile | Natur |
|---|---|---|---|
| Tafel | KULTUR[k].W | FC:2121–2153 | Tafel je Kultur |
| Kultur-Wahl | `pool[(rnd()·pool.length)|0]`, Pool = REGION_HIST-Ära des Baujahrs | FC:4435, 4424, 3609–3616 | Ort/Zeit + **Würfel** |
| Jitter | W = clamp(round((K.W + (rnd − 0,5)·2,2)·2)/2, 5, 15) | FC:2208 | **Würfel**, ½-m-Raster |
| Wohlstand | W = clamp(round(W·(0,84 + 0,30·w)·2)/2, 5, 15); w = (1,22 − 0,5t)(0,78 + 0,44·rnd) | FC:4438–4439 | Rang + **Würfel**, ½-m-Raster |
| Rolle | Maß-Zeile (Kaufhaus ≤ 8,5, Schmiede 5,5, Patrizier ≥ 10 …); Kontor/Herr/Kapelle in fremder Kultur neu gewürfelt | FC:2184–2200, 2227–2228, 4379–4382 | Tafel |
| Hülle | Haus + Anbau + Flügel als Rechteck | FC:9776–9794 (`massBauExport` FC:9659) | Folge; Anbau **Würfel** FC:4446, L FC:4449 |
| Absteckung | `tryPlace`: Mitte = Zeiger + halbe Hülle; nächster Zeiger = Ende + gap·(0,22 + 0,78·dN9) + rnd·0,15 (Stadt); gap 0,06 bei „grossstadt“ | FC:5493, 5530, 4516, 3649 | Folge + **Würfel** |
| Scheitern | passt die Hülle nicht, rückt der Zeiger um 1,1 m | FC:5532 | Schritt |
| Snap | Fugen 0,08–1,8 m schließen sich je halb | FC:8989–9011 | Folge |

Eine Teilung der Blockfront gibt es in Stufe 2 nicht. Die Zahl der Lose ist das Wort n von DORF (FC:4420), nicht die Länge der
Front.

**Stufe 1 — die Kacheln großer Städte** (`kachelMassen`, nur nH > STADT_FUNKTION.voll; in den Plänen G nicht aktiv):
- `frei = L − 2·einzugM (4,2) − eckeM (9) − 1`, n = ⌊frei / platzM (11)⌋, `breit = frei / n` je Blockkante (FC:4072, 4092–4094).
  Das ist eine **stetige Teilung der Blockfront** mit Soll 11 m und ohne Würfel. Die Front L folgt den Toren der Kanten
  (STADT_NETZ.spiel 0,4, FC:3831) und der Kreuzung (FC:3849).
- Das Haus darauf: W = p.W ≥ breit ? breit : min(p.W, breit − 0,8) (FC:4110).
- `STADT_FORM.breitMax 7,5` wirkt nur mit `DP.erbe` (FC:3892, 4491–4493).
- Die zwei Stufen teilen kein Los (FC:4067 sagt es selbst: „Stufe 2 legt ihre Lose auf demselben Netz anders“).

## (b) DIE ZAHLEN (zaehl-los.log Z. 93–123)

- **Histogramm Los-Breite** (0,5 m, Untergrenze:n): 6:14 · 6,5:21 · 7:36 · 7,5:51 · 8:65 · 8,5:66 · 9:102 · 9,5:103 · 10:137 · 10,5:128 · 11:149
  · 11,5:190 · 12:188 · 12,5:167 · 13:182 · 13,5:130 · 14:124 · 14,5:114 · 15:122 · 15,5:93 · 16:98 · 16,5:82 · 17:61 · 17,5:45 · 18:21 · 18,5:27
  · 19:22 · 19,5:16 · 20:11 · 20,5:15 · 21:11 · darüber 4.
  - Q10/50/90 9,0 / 12,7 / 16,9 m; 157 Stufen zu 0,1 m.
  - Haus-Front W: 21 Stufen von 5 bis 15. Spitzen bei 8 (314), 10 (325), 15 (126, die Klemme).
- **Raster** (Anteil ± tol · Zufall p0 = 2·tol/u · κ = (Anteil − p0)/(1 − p0)):

  | Breite | tol | beste Einheit 0,5–6 m | Edinburgh ¼ U (1,83) | Elgin (2,03) | 1 Rute (5,03) | Freiburg ¼ Hofstätte (4,05) |
  |---|---|---|---|---|---|---|
  | Los-Breite | 0,5 | u 1,30 · 78,7 % · κ **0,078** | 52,8 % · κ −0,041 | 49,2 % · κ −0,003 | 19,5 % · κ −0,004 | 27,7 % · κ 0,040 |
  | Los-Breite | 0,1 | u 0,5 · 45,0 % · κ 0,084 | 11,6 % · κ 0,008 | 10,3 % · κ 0,004 | 3,7 % · κ −0,002 | 5,8 % · κ 0,009 |
  | W | 0,1 | u 0,5 · 100 % · κ 1 (Rundung); u 1 · κ 0,47 | 6,3 % · κ −0,05 | 16,5 % · κ 0,07 | 17,5 % · κ 0,14 | 12,1 % · κ 0,08 |

  Die Einheit, die am meisten erklärt, ist die Rundung des Codes (½ m, 1 m). Keine Ruten- oder Burgage-Einheit erklärt die
  Los-Breite über den Zufall hinaus.
- **Teilungs-Stufen** gegen eine belegte Einheit (nächster Bruch, ± 0,5 m; Log Z. 105–110):
  - Edinburgh U 7,32: 1 → 74 · 1¼ → 146 · 1⅓ → 182 · 1½ → 273 · 1⅔ → 340 · 1¾ → 282 · 2 → 229 · 2¼ → 176 · 2½ → 60 · 3 → 5. Keinem Bruch:
    31,9 %.
  - Freiburg U 16,2: ½ → 114 · ⅔ → 277 · ¾ → 388 · 1 → 183. Keinem Bruch: 61,3 %.
  - Siehe „was nicht hält“ 4: das ist ein Netz-Effekt, kein Befund.
- **Streuung in der Blockfront gegen zwischen den Blockfronten** (Blockfront = Kette über Fugen ≤ 2 m; Log Z. 111–112):
  - Nur 175 Fronten mit ≥ 3 Losen (577 Lose; Q50 3 Lose je Front): die Stadt steht meist frei (Fuge Q50 5,65 m, Zahl A Punkt 6).
  - Los-Breite: Var 8,38 m², **innerhalb der Front 55,4 %**, zwischen 44,6 %. W: innerhalb 40,6 %.
  - Innerhalb des Plans liegen 77,5 % der Gesamt-Varianz der Los-Breite (65,9 % von W).
- **Würfel an der Los-Breite** (Zerlegung in derselben Stadt, Log Z. 123):
  - Haus-Front W 59,5 % (davon in der Wohnhaus-Kette ~80 % Würfel, oben).
  - Hülle − W (Anbau/Flügel, Würfel FC:4446, 4449) 34,7 %.
  - Fugen (FC:5530, 5532) 5,8 %.

## (c) DIE BELEGTE VERTEILUNG (Quelle · Einheit · n · was gelesen ist)

| Ort | Zahl | Einheit · n | Quelle | gelesen? |
|---|---|---|---|---|
| Edinburgh (+ 7 Burghs) | Viertel-Schema ¾ … 2½ Einheiten; **≈ ⅔ von 49 Losen ± 0,5 m am Viertel** | Einheit je Ort (Edinburgh 24 ft = 7,32 m) · n 49 | Stell & Tait 2016, Urban History 43(1), doi 10.1017/S0963926814000789 | **PDF-Text gelesen** |
| Edinburgh, breite Lose | Riddle's Court 14,2 m = 2,58 Einh. (lokal 5,5 m) · Acheson House 19,3 m = 2,51 (7,7 m) · Linlithgow Hospitaller 11,6 m = 1,97 (5,9 m); „unit widths are average numbers … not at the ideal quarter sizes“ | Tafel 2, n 3 | dto. | gelesen |
| Edinburgh OS 1849–53 | Gruppen Ø 7,7 m (Haupt), 5,8 m (≈ ¾), 9,7 m (≈ 1¼) | n nicht gesehen | BOEC NS 7 (2008), „Burgage Plots and the Foundation of the Burgh of Edinburgh“ | **nur Such-Zusammenfassung**, Abruf 404 — **unsicher** |
| Elgin | Einheit 8,1 m, Gruppen in Viertel-Abständen, Histogramm in 0,5-m-Klassen | — | Tait, PSAS (2010) | **nur Zusammenfassung**, Abruf 403 |
| Thame | Gründungs-Breite ≈ 4 Ruten (20,1 m); **„nearly 40 %“ der Fronten auf einem Vielfachen der Rute** (Bond 1984–5); Halb-Burgage 2 Ruten = 33 ft; Urkunden 19 ft, 30 ft, 40 ft | Rute 16½ ft · n nicht genannt | Spavold & Gilman 2002, Oxoniensia | **PDF-Text gelesen** |
| Alnwick | „still roughly 28 feet wide“ oder einfache Brüche/Vielfache von 28 ft (Conzen) | ft · n — | Alnwick Civic Society 2020 | gelesen (Seite) |
| Burford · Cricklade | 1½, dann 3 Ruten · 2 × 12 Ruten (10,1 × 60,4 m) | Rute | VCH-Tafel (ihr-archive) | **nur Zusammenfassung** (PDF ohne Textschicht) |
| Freiburg i. Br. | Hofstätte **50 × 100 Fuß**, Fuß ≈ 32,4 cm → 16,2 × 32,4 m (Marktrecht 1152/1120) | Fuß | Löbbecke, Parzellenstruktur Freiburg (BLB) | **nur Zusammenfassung**; PDF ohne lesbaren Text |
| Bern | „100 × 60 Fuß“ **nicht gefunden**; Löbbecke nennt Bern als Abweichung vom Zähringer-Schema | — | — | **unsicher** |
| Lübeck | keine Standard-Breite gefunden; Einzelbefunde: Pfostenbau Königstraße 57 ≈ 6,50 m breit; 44 Grundstücke im Gründungsviertel (Maße nicht gelesen) | — | Mitt. DGAMN (Heidelberg) | **nur Zusammenfassung** |

Quantile einer echten Stadt: **keine gefunden**. Belegt sind zwei Anteile:
- Edinburgh ⅔ ± 0,5 m am Viertel, n 49;
- Thame ≈ 40 % auf Ruten-Vielfachen, Toleranz nicht genannt.

Unter der Annahme ± 0,5 m ist Thame p0 = 1/5,03 = 0,199 → κ ≈ 0,25 (**unsicher**). Beide Belege landen also bei κ ≈ 0,25.

## (d) DAS MASS UND DIE SCHWELLE

**Maß κ_R (gewählt):** der Raster-Anteil über dem Zufall am Viertel-Raster U/4 einer belegten Einheit, Toleranz ± 0,5 m:
κ_R = (R − p0) / (1 − p0), mit R = Anteil der Los-Breiten im Fenster und p0 = 1/(U/4).

| Satz | R am Edinburgh-Raster | κ_R | Urteil |
|---|---|---|---|
| belegt Edinburgh (≈ 33/49) | 0,667 (0,534–0,788) | **0,27 (−0,03 … 0,53)** | Maßstab |
| heute Los-Breite | 0,528 | −0,04 | **unter dem Band** (kein Raster) |
| heute W | 0,450 | −0,21 | unter dem Band |
| V2 der Runde 2 | 1,00 (spike-v2.md:38) | 1,00 | über dem Band (Konstruktion) |

**Schwelle für ein künftiges Los-Gesetz:**
- κ_R am Raster SEINER Einheit (U/4, ± 0,5 m) im Band **0,0 … 0,53**, Ziel 0,27.
- Zugleich R in **0,534 … 0,788**.
- Zweite Probe gegen Thame: κ am Ruten-Raster (± 0,5 m) um **0,25**.

Das Skript zählt ein künftiges Feld ohne Umbau: trägt `hp.losBreite` bzw. `slot.ov.losBreite` eine Zahl (`LOS_FELD`), gehen
Histogramm, Raster-κ, Teilung, Streuung und Maß über dieses Feld (zaehl-los.cjs:6–8; Log Z. 9: heute 0 von 2 595). Die Einheit des
Gesetzes muss es dafür in `EINHEITEN` (zaehl-los.cjs, eine Zeile) nennen, oder es nimmt die beste belegte. **gewählt**

## (e) URSACHEN DER ABWEICHUNG VOM RASTER — Beleg und Eingang im Spiel

| Ursache | Beleg | Eingang im Spiel |
|---|---|---|
| **Teilung** (Erbe, Verkauf) | Stell & Tait 2016: breite Lose „carefully divided into two narrower plots which also conformed to the quarter plot scheme“; Thame: Halb-Burgage 2 Ruten, Bond: Teilung aus den Ruten-Vielfachen geschlossen; Alnwick: Teilung mit dem Wachstum | **fehlt**: n ist das Wort von DORF (FC:4420); `fr[]` ist ein Ersatzbau auf DEMSELBEN Los (FC:4431, 4450, 4395), nur mit Jahresringen |
| **Zusammenlegung** | Stirling: Einheiten um 1580 zusammengelegt → Argyll's Lodging 1670er; Edinburgh: Gladstone's Land um 1755 über den Nachbarn, Dean-of-Guild-Erlaubnis ab den 1670ern (Stell & Tait 2016); Alnwick: mit dem Besitzwechsel | **fehlt** |
| **Messfehler / Maß der Rute** | Alnwick: Stange vermutlich „about 14 foot“ statt 16½ ft; Act 1824: die wahren Standards „not verily known“; Stell & Tait: Einheiten sind Mittelwerte, darum nicht die idealen Viertel | **fehlt**; der Jitter FC:2208 ist Würfel ohne Maß und ohne Ort |
| **Gelände / Vorbestand** | Thame: Südseite folgt den alten Ackerstreifen „even down to the slight curve needed to turn the plough“ (Spavold & Gilman 2002) | teils: die Trasse lenkt am Hang (`trasseLenk` FC:5422–5423), die Gasse endet am Steilen (FC:5471). Die Breite liest das Gelände nicht |
| **Kontrolle der Grenzen** | Leges Burgorum c. 1270: vier „lineatores“ messen Vorder- und Hinterland nach der ursprünglichen Teilung (Stell & Tait 2016) | **fehlt** (es gibt kein Los, das jemand hüten könnte) |

## WAS UNSICHER BLEIBT

- **Die Los-Breite ist meine Lesart** (Hülle + halbe Fuge, Fuge gekappt bei 2 m). Mit der Kappe wandert der Anteil der Fuge: sie
  trägt 5,8 % der Varianz. W und Hülle sind Kern-Größen, die Los-Breite nicht.
- **33/49** ist „approximately two-thirds“. Bei 31–34 wandert κ zwischen 0,19 und 0,32.
- Die Toleranz „± 0,5 m“ lese ich als Fenster von 1,0 m. Bedeutet sie ± 0,25 m, sinkt p0 auf 0,27 und κ_E steigt auf 0,54.
- Nur Pläne G. Die stetige Blockteilung der Stufe 1 (FC:4092–4094) ist nicht gezählt.
- Bern, Lübeck, Elgin, Burford, Edinburgh-OS: nur Zusammenfassungen. Echte Quantile fehlen ganz.
