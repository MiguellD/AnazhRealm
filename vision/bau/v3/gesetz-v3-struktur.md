# GESETZ v3 — DIE STRUKTUR DES BAUENS (Runde 3, nach dem Zensus; Lese-Baum n1011-hg main b7ed8419, nur gelesen)

## (K) ENTSCHEIDE DES KOPFES ZU §0 (19.11. 01:26; Punkt 2 berichtigt 01:30 nach dem Entscheid des Koordinators) — gelten über dem Text darunter

Dieses Blatt ist STRUKTUR: kein Code, kein Spike, keine gewählte Zahl. Vom Kopf gelesen ist der Rohbericht und §0, nicht jede der
31 fallenden Stellen am Code.

1. **Zähler vor dem Spike.** S2, S8, S9 und S10 haben keinen Zähler am HAUS des Kerns, S3 und S5 zählen über einen Nachbau der heutigen
   Kette. Das Gesetz liefert darum je Haus ein Feld `hp.schritte` (jeder Schritt der Kette mit Eingang und Ausgang); die Zähler lesen
   dieses Feld. Der Umbau der Zähler ist Teil der Grundlinie, nicht des Gesetzes.
2. **S4 neu (Entscheid Koordinator 01:26):** Maßzahl der Absteckung = Anteil der Lose, deren Breite ± 0,5 m an einem VIERTEL der
   Block-Einheit liegt, Soll ≥ ⅔ (Stell & Tait). κ wird daneben weiter gezählt, ist aber kein Soll mehr (0,27 hing an der
   Einheitsbreite: 0,33 bei 8 m, 0,13 bei 6,54 m). Die Einheit je Block ist eine Gründungsgröße des Plans; jede Abweichung vom
   Viertel ist ein benannter Schritt in `hp.schritte`.
3. **Die Ecke hat EINE Definition:** ein Los mit zwei Fronten an zwei Kanten des Straßen-Netzes. Der Flankenabstand (56,0 % / 33,9 %)
   war eine Lesart des Zählers und fällt; die Regel der Stufe 1 (FC:4091) liest danach dieselbe Größe.
4. **S6 wird eine Zahl:** der Stand reist als Feld, der Zähler rechnet ihn aus der Lage nach — Abweichung 0.
5. **S8 gegen London 1667:** die Traufe-Spanne ≥ 4,70 m bleibt Soll. Trägt keine belegte Ursache das eingeschossige Haus in der Stadt,
   wird nicht gewürfelt, sondern es steht als Befund: „diese Varianz der heutigen Stadt hat keine Ursache“ (Wort des Koordinators, Runde 2).
6. **Zwei Traufe-Regeln (nah 7,80 m, fern 8,60 m bei drei Geschossen, FC:211–215 gegen 4072/4120)** sind ein Zwilling: EINE Regel,
   die ferne liest die nahe. Fund-Zeile für die Tafel.
7. **Wohnturm und Patrizierhaus** sind Wohnhäuser eines Standes, kein Sonderbau: ihre Höhen-Zeilen fallen unter S5.
8. **ENTSCHIEDEN (Koordinator, zweiter Gang, Entscheid E6 unten):** die Lose FOLGEN aus dem Plan (Front ÷ Absteckung in Vierteln der
   Block-Einheit); `nH` ist Ergebnis und Lese-Zahl. Das Wort setzt Samen und Größe der STADT (Markt, Straßen-Klassen, Druck), nie die
   Zahl der Lose. S8 misst an derselben Stadt (Samen, Wort); die Grundlinie nennt die Zahl der Lose heute und am Gesetz nebeneinander.
   (Bis 01:30 stand hier die Frage; der Vorschlag des Kopfes ist damit entschieden.)
9. **Naht Person:** 7 von 11 Gesinde-Zeilen in `spike/gesetz-proto.cjs:50–56` sind „Annahme“ — das Person-Gesetz liest sie als Datum.
   Gemeldet; Name und Form von `haushalt` bleiben unberührt.

## (E) ENTSCHEIDE DES KOORDINATORS IM ZWEITEN GANG (19.11., bindend; eingearbeitet in §0–§6)

| E | Entscheid | eingearbeitet |
|---|---|---|
| E1 | Maßzahl der Absteckung = Anteil der Lose ± 0,5 m am Viertel der Block-Einheit, Soll ≥ ⅔ (ST15 S. 5); κ daneben gezählt, kein Soll | **ersetzt durch E11** (roher Anteil fällt); Zähler `v3/zaehl-los.cjs` Zusatz E1 bleibt |
| E2 | Die Einheit je Block ist Gründungsgröße des Plans (Freiburg 50 × 100 Fuß, perch 5,03 m, Schottland 5,8–12,8 m); Lose ¾–2½ Einheiten; Tiefe ÷ Breite 2 bis 25 ist die zweite Gründungsgröße | §1 Glied 1/2; §3 L1, L2, L4 |
| E3 | Haushalt → Los über den belegten Zins je Viertel; die Verteilung Stand über Frontbreite ist HYPOTHESE | ersetzt durch E7 (die erste Lesart baute einen Kreis, §0 Abschnitt „erledigt“) |
| E4 | Geschosse nach Straßen-Klasse 2 · 3 · 4 (London 1667), Höhe bis Gesims nach Straßenbreite 36 · 45 · 54 Fuß (Paris 1784), die Ecke erbt die breitere Straße; „+1 Geschoss bei Wohlstand > 0,9“ (FC:4444) fällt | **Klasse als Eingang ersetzt durch E12** (absolute Breite, min(Decke, Bedarf)); FC:4444 fällt weiter; §1 Glied 7; §2 F6; §3 L14, L17, L26; Zähler Zusatz E4 |
| E5 | L_max aus dem Querschnitt des Holz-Profils (Durchbiegung), Forchheim ~5 m als Gegenprobe, Balkenabstand 40–60 cm; der Hang aus dem Grund (Sockel folgt dem Gefälle in Stufen) ohne historische Zahl; Zeit-Achse: erst teilt sich die Front, dann füllt sich der Hof | §1 Glied 9, 10, 12; §2 F21; §3 L6, L20, L24, L33 |
| E6 | `nH`: die Lose folgen aus dem Plan; das Wort setzt Stadt, nicht Lose; S8 an derselben Stadt | (K) 8; §4 S8; §6 G6 |
| E7 | Zins-Kante ohne Kreis: das Los trägt Viertel und Lage, Zins = Funktion beider, der Stand FOLGT aus dem Zins, der Haushalt aus Stand und Adresse. Kette: Plan → Los → Zins → Stand/Gewerbe → Haushalt → Haus. „Der Haushalt trägt so viele Viertel, wie sein Stand zahlt“ fällt. Zins ist ein eigenes Glied (12 Glieder) | §1 Glied 3; §5 Person |
| E8 | Eingeschossiges Haus: Befund mit Messnamen, kein Würfel. EINE belegbare Ursache am Quellen-Blatt prüfen (Klasse unter Londons unterster: Dorfweg; Hinterhof-Bau nach der Front-Teilung); trägt sie die ≥ 10 % nicht am Text, steht die Lücke offen | §0 Punkt 3; §3 L36 |
| E9 | `hp.schritte` je Haus ist PFLICHT-Ausgang. Der Umbau der Zähler S2, S3, S5, S8, S9, S10 auf das HAUS des Kerns ist Grundlinie und läuft VOR dem Spike. Ein Zähler über einen Nachbau der heutigen Kette ist kein Richter | §4 (Spalte Richter); §6 G1–G3 |
| E10 | Die zwei Traufe-Regeln fallen in der Bau-Welle auf EINE Quelle (Höhe aus Straßen-Klasse und Geschosshöhe) — Fund-Zeile jetzt, kein Einzelschnitt vorab. Die sieben „Annahme“-Zeilen des Gesindes gehen als benannte HYPOTHESEN ans Person-Gesetz | §2 F28; §5 Person |

**Dritter Gang (Entscheid des Koordinators 19.11. 01:40, bindend; ersetzt E1 und E4, wo sie widersprechen):**

| E | Entscheid | eingearbeitet |
|---|---|---|
| E11 | ABSTECKUNG: „≥ ⅔ als roher Anteil“ fällt. S4 = κ = (Anteil − Zufall) ÷ (1 − Zufall) gegen die Einheit aus dem Feld des Plans, Soll-Band 0,13 … 0,33, der Zufall steht daneben. Lehre: echte Städte sind kaum regelmäßiger als der Zufall; κ nahe 1 ist so falsch wie −0,04. Das Teil-Raster (Viertel schottisch, ganze und halbe perches englisch) ist ein Feld des Plans (Kultur), kein Weltwert | §0 Punkt 2 (Nachrechnung des Bands); §1 Glied 1/2; §4 S4 |
| E12 | GESCHOSSE: `gen` 0/1/2 → 4/3/2 fällt als Kategorien-Fehler. Eingang ist die ABSOLUTE Straßenbreite (Paris 1784: < 24 · 24–29 · ≥ 30 Fuß). Paris setzt eine DECKE, London schreibt einer Stadt unter höchstem Druck die Zahl vor (Endfall). Gebaut wird min(Decke aus der Straßenbreite, Bedarf aus dem Druck = Zins am Los). Das Glied Druck → Geschosse ist HYPOTHESE; geprüft an einer Zahl (`v3/zaehl-druck.cjs`) | §0 Punkte 3–4; §1 Glied 7; §3 L15, L38; §4 S5 |
| E13 | BALKENABSTAND bis 1,7 m (FC:181, 420) gegen belegte 40–60 cm fällt im Glied Tragwerk zusammen mit L_max aus dem Holz-Profil — eine Zeile der Soll-Tafel | §1 Glied 9; §2 F21; §4 S1 |
| E14 | (19.11. 01:50) Das Glied DECKE bleibt (am Text belegt) und steht ehrlich als „heute wirkungslos: alle 2 595 Fronten unter 24 Pariser Fuß, trifft nur die 57 Wohntürme“. Die Straßenbreite ist ein Feld des PLANS und folgt aus dem Verkehr (Gasse = ein Wagen, Straße = zwei Wagen im Begegnen, Marktstraße = zwei Wagen plus Stände) — Hypothese L39 an der Naht zum Verkehr-Gesetz (Zweig `zensus-verkehr`), NICHT Kapitel Bau: dieses Gesetz setzt KEINE Breiten, es nennt nur den Eingang „Breite der Straße in m aus dem Plan“. κ-Band gilt als 0,14 … 0,31 (gemessene Einheiten 6,54 m und 7,62–7,74 m; die Enden 0,13 / 0,33 kamen aus gerundeten). L36 und L38 bleiben offen bis `v3/quellen-strasse-zins.md` (Leser des Koordinators), S8 Befund | §1 Glied 1, 7; §3 L39; §4 S4, S5 |

---

Kein Code, kein Prototyp, kein Spike, keine gewählte Zahl. Dieses Blatt sagt: was folgt woraus, welche Stellwerte fallen (datei:zeile),
wo ein Datum mit Quelle stehen muss (benannte Lücke L1 … L39). Kern FC = `fachwerk-core.js` an der Wurzel des Lese-Baums, SHA-256
028cc2d0…bea06 (gedruckt in `v3/zaehl-faellt.log` Z. 1). Jede datei:zeile ist an der Quelle selbst nachgelesen; wo eine Zeile nur aus
einem Blatt übernommen ist, steht „(nach Blatt X, nicht nachgelesen)". Leser-Zahlen: `node v3/zaehl-faellt.cjs` → `v3/zaehl-faellt.log`.
Quellen-Kürzel (ST15, T08, L07, LON, PAR84, E-F, …) wie in `v3/quellen-los-haus.md`; Status T (Volltext) · S (sekundär) · NG dort.

Gelesen: v3/ ganz (vier Zensus-Blätter, `quellen-los-haus.md`, die Skripte und Logs), v2/entscheid-v2.md §0 und §4,
v2/pruefung-spike-v2.md, v2/pruefung-quelle-v2.md, entscheid.md §0, tafel.md (Gliederung, D2/D6), spike/gesetz-proto.cjs:40–114, das
Person-Gesetz `git show 90b6950d:vision/person/gesetz.md`. Nicht gelesen: der Zweig `bau-oeffnungen` (kein git).

**Die Kette (Entscheid des Koordinators mit E7, bindend):** Plan (absolute Straßenbreite, Markt, Block-Einheit und Teil-Raster) → LOS (Viertel,
Tiefe, Lage, Ecke, Hang) → ZINS (aus Viertel und Lage) → Stand und Gewerbe (aus dem Zins und der Lage) → HAUSHALT (Person-Gesetz, aus
Stand und Adresse) → HAUS (Breite aus dem Los; Geschosse = min(Decke aus der absoluten Straßenbreite, Bedarf aus dem Druck = Zins am
Los) — E12, das Druck-Glied ist HYPOTHESE; Tiefe und Tragwerk aus Bedarf und Spannweite, Sockel aus dem Gefälle). Kein Schritt läuft
rückwärts. Das Tragwerk fügt sich dem Grundriss. Die Zeit teilt erst die Front, dann füllt sie den Hof.

**Zählung der Lücken (§3, 39 Zeilen, dritter Gang + E14): gefüllt 16 · HYPOTHESE 6 · entfallen 3 · offen 14.** Von den 16 gefüllten tragen 7
einen offenen Rest (L2, L4, L6, L12, L20, L26, L27). Gegen den zweiten Gang: L15 entfällt (E12), L38 (Druck → Geschosse) ist neu HYPOTHESE.

---

## §0 WAS NICHT STEHT (offen, nach Gewicht)

1. **Die Zähler am HAUS fehlen (E9, Grundlinie vor dem Spike).** Am Haus des Kerns zählen heute nur S1 (`zaehl-balken.cjs`), S4
   (`zaehl-los.cjs` Zusatz E1, sobald das Feld der Block-Einheit da ist) und S7-Ecke. S2, S8, S9 und S10 haben keinen Zähler am Haus; die
   Skripte der Runde 2 lesen den Prototyp. S3 und S5 zählen über einen Nachbau der heutigen Kette (zaehl-los.cjs:307–344,
   zaehl-hoehe.cjs:88–110), der am Gesetz nicht mehr trifft. Keiner dieser sechs ist heute Richter.
2. **S4 ist κ im Band 0,14 … 0,31 (E11, E14) — das Band ist nachgerechnet.** κ = (A − p0)/(1 − p0), p0 = 2 · 0,5 m ÷ Viertel, A = ⅔
   (Stell & Tait, ST15 S. 5, n 49):

   | Einheit U (Quelle) | Viertel | Zufall p0 | κ bei A = ⅔ | κ bei A = 33/49 |
   |---|---|---|---|---|
   | 6,50 m (Quellen-Blatt §1 „Einheit 6,5 m“, gerundet aus T08 Tab. 1) | 1,625 m | 0,615 | **0,133** | 0,151 |
   | 6,54 m (Edinburgh Sektor 5, T08 Tab. 1) | 1,635 m | 0,612 | **0,142** | 0,159 |
   | 7,32 m (24 ft, Strobing-Vorschrift ST15 S. 4) | 1,83 m | 0,546 | 0,265 | 0,280 |
   | 7,62–7,74 m (Edinburgh Sektoren 2–4, T08 Tab. 1) | 1,905–1,935 m | 0,525–0,517 | 0,298–0,310 | 0,313–0,324 |
   | 8,00 m (Beispiel-Einheit T08 Illus 2) | 2,00 m | 0,500 | **0,333** | 0,347 |

   - **0,13** stimmt nur mit der gerundeten Einheit 6,5 m. Mit dem gelesenen Wert 6,54 m ist es **0,142** (meine Zahl). Der Zufall
     ist dort 61,2 %, die ⅔ liegen 5,5 Punkte darüber.
   - **0,33** kommt aus der runden Beispiel-Einheit 8 m, nicht aus einem gemessenen Edinburgher Sektor. Die gemessenen Sektoren 2–4
     geben 0,30–0,31.
   - Das Band hängt also an der Lesart der Einheit (6,5 oder 6,54 m unten, 8 m oben) und gilt für das schottische Viertel-Raster. Für
     die englische perch-Schule ist es nicht nachgewiesen (L37).
   - **Heute** trägt kein Los ein Feld der Einheit (zaehl-los.log Zusatz E1: 0 von 2 595). Gegen die festen Einheiten:
     - perch-Viertel 1,26 m: Anteil 78,4 % bei p0 0,795, κ −0,056;
     - Freiburg-Viertel 4,05 m: 27,7 % bei p0 0,247, κ 0,040;
     - beste Einheit im Band 5,8–12,8 m (U 5,91 m): 70,1 % bei p0 0,677, κ 0,074;
     - Edinburgh 24 ft: κ −0,041 (zensus-absteckung.md).

     Alle liegen unter dem Band. Der rohe Anteil hätte das Soll ⅔ an perch und an U 5,91 m „erfüllt“. Genau deshalb fällt er (E11).
3. **Das eingeschossige Haus der Stadt hat keine belegte Ursache, auch nicht im Druck (E8, E12).** Heute eingeschossig: **354 von 2 595
   (13,6 %)**: Wohnhaus 268, Werkstatt 31, Schmiede 30, Backhaus 25. Am Quellen-Blatt geprüft:
   - London 1667: unter by-lanes gibt es keine Klasse; auch dort 2 Geschosse + Keller + Dach (LON s. VII).
   - Bow Lane: „two and four storeys“ (SAT90).
   - Die Hof-Füllung (ST15 S. 5) und das Oxford-„cottage“ (P37) nennen keine Geschosszahl.
   - Dorfwege gibt es in den Plänen G nicht.

   **Druck-Prüfung am Kern** (`v3/zaehl-druck.cjs` → `zaehl-druck.log`, dieselben 2 595 Lose):
   - **Abstand zum Markt:** Q10/25/50/75/90 Eingeschosser 52 / 64 / 86 / 133 / 162 m, alle 39 / 55 / 73 / 94 / 132 m.
     ρ(eingeschossig, Abstand) +0,179 (Wohnhäuser +0,191). Anteil eingeschossiger Wohnhäuser je Quintil nah → fern: 10,6 · 11,5 · 10,4 ·
     14,5 · **32,2 %**. Ebenso r/Rw: ρ +0,182; Q50 0,78 gegen 0,68.
   - **Absolute Straßenbreite an der Front:** der Plan kennt fünf Breiten:
     - gen 0: 5,0 m = 15,4 Fuß (DORF_NORM.strasseW FC:3649, FC:5297);
     - gen 1: 3,9 m = 12,0 Fuß (FC:5322);
     - gen 2: 2,6 / 2,8 / 3,0 / 3,2 m = 8,0 / 8,6 / 9,2 / 9,9 Fuß (FC:5393, 5467, 5425, 5433).

     **Alle 2 595 Fronten liegen unter 24 Fuß**, also in Paris' unterster Klasse mit Decke 36 Fuß = 11,69 m. Sie bindet heute nur die
     57 Wohntürme (Traufe 14,85 m). ρ(eingeschossig, Breite) −0,077, unter Wohnhäusern −0,018: die Breite trägt nichts.
   - **Größe der Siedlung:** 86–89 Lose je Plan, ρ −0,027 — sie streut in den Plänen G nicht und ist nicht prüfbar.
   - **Der Störer erklärt die Lage ganz:**
     - Die 86 eingeschossigen Nicht-Wohnhäuser setzt die Rollen-Zeile (Schmiede FC:2185, Backhaus FC:2196; Werkstatt ≤ 2 FC:2195).
     - Alle 268 eingeschossigen Wohnhäuser haben Kultur-Tafel st = 1 UND wohl ≤ 0,9 (268 von 268). Von 584 Wohnhäusern mit Kultur-st 1
       hob die Wohl-Stufe FC:4444 die übrigen 316. Kein Wohnhaus mit Kultur-st ≥ 2 ist eingeschossig.
     - Unter den Kultur-st-1-Wohnhäusern ist ρ(eingeschossig, wohl) −0,863. wohl folgt dem Los-Index t (ρ −0,768), und die Lage folgt
       demselben Index (ρ(t, Abstand Markt) +0,643).
     - Innerhalb der t-Dezile bleibt ρ(eingeschossig, Abstand Markt) Median +0,108 (Spanne −0,13 … +0,20).

     Die ferne Lage der Eingeschosser spiegelt also das Index-Schema (Wohl-Würfel über dem Rang, Viertel-Zeile), keinen Zins.

   **Urteil:** Die Richtung passt zur Hypothese (fern vom Markt mehr Eingeschosser). Der Kern kann sie aber nicht tragen, denn die
   Ursache ist heute der Rang-Würfel, und am Text steht keine Zahl. **L36 bleibt offen, S8 steht mit Befund.** L38 bleibt HYPOTHESE und
   ist nur an einer Quelle mit Geschossen und Zins (oder Lage) je Haus prüfbar.
4. **`gen` ist keine Klasse (E12, L15 entfällt), und welche Ordnung wo gilt, ist offen (L37).** Die Lesart gen 0/1/2 → 4/3/2 Geschosse
   fällt als Kategorien-Fehler; `gen` ist der Rang im Baum der Straßen (Fronten heute: gen 0 26,0 % · gen 1 13,5 % · gen 2 60,5 %,
   zaehl-los.log Zusatz E4). Eingang ist die absolute Breite, und die liegt heute überall unter Paris' 24 Fuß (Punkt 3). Damit setzt
   die Decke in keiner heutigen Stadt eine Stufe. Ob die Breiten des Plans je Ordnung zu belegen sind (ein Datum der Straßenbreite je
   Rang, Paris 1783 Art. 1: neue Straßen ≥ 30 Fuß), ist Teil von L37.
5. **Hang ist in node nicht zählbar.** `exportSettlement` rechnet ohne `dp.hoehe` eben (FC:9795–9797). Die Hang-Klasse entsteht erst in
   `ortPlan` (FC:11110–11112, Slot FC:11177), ohne Leser im Haus. Mit `dp.ort` trägt der Export das Höhen-Raster schon heute
   (stamm/siedlung-ort.js:259–287), die Trasse liest es (FC:5269). Der Hang kann also im Glied LOS gelesen werden. Offen bleibt, ob der
   Export, den der Wirt nach der Ort-Wahl neu rechnet (FC:9650), derselbe ist, dessen ov das HAUS baut (nicht nachgelesen). Der
   Zähler in der Welt ist nicht gebaut (§6 G4).
6. **Zins → Stand ist nicht belegt.** Belegt ist der Zins je Einheits-Los (Cockermouth 4 d, ST15 S. 5; Freiburg 12 Pf. je Hofstätte,
   L07 S. 7). Dass der Zins auch an der Lage hängt, und wie aus dem Zins ein Stand folgt, steht in keiner Quelle am Text
   (Hearth-Tax nach Straße NG). E7 setzt die Kette; die Funktionen darin sind HYPOTHESE (L7, L35).
7. **Der Stoff des Orts fehlt auf main.** `bauOrt` hat 0 Treffer als Feld. E5 verlangt L_max aus dem Querschnitt des Holz-Profils; das
   Profil des Orts (Holzart, Durchmesser) hat keinen Welt-Eingang (L20).
8. **Grenzen des Tragwerks-Zählers:** Balken längs x sieht `zaehl-balken.cjs` nicht; Ständer bis zum Grund unter dem Unterzug prüft er nicht.
9. **Bahn 1 ist nur aus dem Entscheid bekannt** (Zweig nicht gelesen; Naht aus entscheid-v2.md §4.2/4.3, pruefung-quelle-v2.md K1–K6).
10. **Moderne, Ringe, Erbe, Chronik sind nicht gezählt.** Alle Zahlen sind Pläne G (Gründung ≤ 1549, nH 90). Die Würfel FC:4431, 4437,
    4440–4443, 4453–4460 und die Erbe-Höhe FC:4491–4495 wirken dort nicht.

**Erledigt und aus §0 genommen (je eine Zeile):**
- Ecke: eine Definition (K3).
- S6: eine Zahl (K4).
- Zahl der Lose: E6.
- Wohnturm/Patrizier: kein Sonderbau (K7).
- Traufe-Zwilling: Fund-Zeile (K6, E10).
- Rechnung des Würfel-Anteils: `hp.schritte` (K1, E9).
- Der rohe Anteil ≥ ⅔ fällt; S4 ist κ im Band (E11).
- Die Lesart gen → Geschosse fällt (E12).
- **E3 baute in seiner ersten Lesart einen Kreis.** „Der Haushalt trägt so viele Viertel, wie sein Stand zahlt“ heißt: der Haushalt
  wählt die Breite des Loses. Die Kette rechnet aber den Stand aus der Lage des Loses. Los → Stand → Haushalt → Los wäre ein Kreis,
  die Kante Haushalt → Los läuft rückwärts. E7 setzt die Lesart ohne Kreis: das Los trägt Viertel und Lage, der Stand folgt aus dem
  Zins.

---

## §1 DIE KETTE (zwölf Glieder)

Heutige Reihenfolge im Export (nachgelesen):
1. `exportSettlement` FC:9722.
2. **DORF** FC:9733: alle Häuser, Wohlstand, Rolle (FC:4403–4517).
3. **Hülle** je Haus: `massBauExport` FC:9776–9794.
4. **dorfLayout** FC:9825: Plan, Straßen, Lage jedes Hauses (FC:5357 ff.).
5. `reihenSnap`, `brandwand` FC:9826–9828.
6. Im Faden **ortPlan**: Boden, Spanne, Hang-Klasse (FC:11109–11112), Platte (FC:11114–11123).
7. HAUS je Slot aus dem ov.

Rückwärts heißt: ein Glied liest eine Größe, die erst nach ihm entsteht, oder eine frühere Größe wird nach einer späteren umgebaut.

Welt-Eingänge: Gelände H (`dp.hoehe`, FC:9797), Wasser (`nassAm`, FC:5503), Stoff des Orts (fehlt), Epoche, Region und Jahr
(FC:4405–4414), Same der Siedlung, Größe der STADT (das Wort nH; nicht die Zahl der Lose, E6).

| # | Glied | Eingänge | Ausgänge (Feldnamen) | HEUTE (Funktion · rückwärts?) | Eingang im Spiel |
|---|---|---|---|---|---|
| 1 | **Plan** | Wort (Same, Größe der Stadt), Region, Jahr, Epoche, Gelände, Wasser | `kante.w` (ABSOLUTE Straßenbreite, Eingang der Decke, E12), `platz`, `mauer.Rw`, je Block `block.einheit`, `block.raster` (Teil-Raster der Kultur: Viertel schottisch, ganze/halbe perches englisch, E11) und `block.tiefeZuBreite` (Gründungsgrößen E2, L1/L4) | `strassengraph` FC:5262 ff., gerufen in `dorfLayout` FC:5365 NACH DORF. Rw aus nG FC:5364, Kanten-Zahl aus nGestalt FC:5281: der Plan liest die Haus-ZAHL. Unter E6 kehrt sich das: die Zahl der Lose folgt aus dem Plan | `w` vorhanden: fünf Breiten 2,6–5,0 m = 8,0–15,4 Fuß, alle < 24 Fuß (zaehl-druck.log); `gen` ist Rang im Baum, keine Klasse (E12); Block-Einheit und Teil-Raster **fehlen**; Stufe 1 hat Blöcke `netz.bloecke` (FC:4086) |
| 2 | **Los** (Absteckung) | Plan (Block-Einheit, Tiefe ÷ Breite, Kante, Knoten), Gelände unter dem Rechteck | `los.adresse`, `hp.losViertel` (¾–2½ Einheiten = 3–10 Viertel, E2), `hp.losBreite`, `hp.losTiefe`, `hp.blockEinheit`, `hp.lage` {kante, klasse, abstandMarkt}, `hp.ecke` (zwei Fronten, K3), `hp.hang` {spanne, richtung} | **gibt es nicht.** `tryPlace` FC:5487–5533 setzt die Hülle an die erste Stelle, an der sie passt; Folge = Index FC:5560–5562; Fuge gewürfelt FC:5530. **Rückwärts:** das Los folgt dem Haus. Stufe 1: `breit = frei/n` FC:4092–4094 | Breite, Tiefe, Ecke, Viertel **fehlen** (zaehl-los.log: 0 von 2 595); Hang-Klasse erst FC:11112 |
| 3 | **Zins** (E7) | Los: `hp.losViertel`, `hp.lage` | `hp.zins` | **gibt es nicht** | Zins je Einheit belegt (4 d, 12 Pf.); Lage-Anteil HYPOTHESE (L7) |
| 4 | **Stand und Gewerbe** | Zins, Lage (Anker der Viertel: Markt, Kirche, Wasser, Tor) | `hp.stand` (≡ Person `klasse`), `hp.gewerbe`, `hp.sonderbau` | `wohl` aus Index + Würfel FC:4429, 4438; arm FC:4447; Rolle nach Index FC:4383–4386, 4323, 4468, Patrizier FC:4340 — alles VOR der Lage; nur der Viertel-Name folgt der Lage (FC:5607–5608) | Stand, Gewerbe **fehlen** als Feld |
| 5 | **Haushalt** | Stand, Gewerbe, Adresse (Person-Gesetz) | `haushalt(gewerbe, stand).gesinde` (Bau), Paar/Kinder je t (Person §2), `hp.leute` (Bemessung, L11) | keiner vor dem Haus: `bauRezept(…, null, …)` FC:4436 u. a.; `bauProgramm` FC:2229 läuft in DORF nie; Köpfe folgen dem Haus `leuteVon` FC:9527–9538 | nur im Prototyp gesetz-proto.cjs:45–57, 99–102 |
| 6 | **Haus-Hülle** | Los (Breite, Tiefe), Haushalt (Bedarf), Bauweise der Region/Ära (L29) | `hp.W`, `hp.D`, `hp.schritte` (PFLICHT, E9) | `_bauweiseWurf` FC:2204–2210, Kultur-Würfel FC:4435, FC:4437, 4439, Maß-Zeilen FC:2227–2228; mit Chronik PASSUNG FC:9780–9791. **Rückwärts:** Hülle vor dem Los | Los **fehlt**; Bedarf **fehlt** |
| 7 | **Höhe** (Teil der Hülle) | **Decke** aus der absoluten Straßenbreite `kante.w` (Paris 1784: < 24 · 24–29 · ≥ 30 Fuß → 36 · 45 · 54 Fuß bis Gesims, PAR84 Art. 1); Ecke → Decke der breiteren Straße (PAR84 Art. 2); **Bedarf** aus dem Druck = Zins am Los (HYPOTHESE L38; London 1667 2/3/4 ist der Endfall unter höchstem Druck, LON s. VII–IX); Geschosshöhe der Ordnung (LON 8½–10½ ft) | `hp.storeys` = min(Decke, Bedarf) (E12), `hp.traufe` (EINE Quelle für nah und fern, E10) | +1 Geschoss FC:4444 (fällt, E4); Tafel KULTUR.st; Traufe nah FC:211–215, fern FC:4072/4120 (Zwilling) | Breite `w` vorhanden (heute überall < 24 Fuß → eine Decke 11,69 m); Zins **fehlt** |
| 8 | **Grundriss** | Hülle, Haushalt (Programm), Gewerbe (Laden vorn: York 5–8 ft, RJ87), Los-Breite (schmal → Seitengang + Hinterhaus, breit ≥ 1½ Einheiten → quer/Hof: ST15 S. 23, P37), Ecke | Räume, Treppe, Türen, Herd; `HAUS.dims.zonen` | `layout` FC:606–617 mit Würfel `rndI` FC:598–605, Schnitte auf `bz` FC:609; Flur W·0,15 FC:261; Treppe aus Samen FC:370. **Rückwärts:** der Raum folgt dem Raster | Haushalt **fehlt** |
| 9 | **Tragwerk** | Grundriss (Raumwände, Loch, Türen), Hülle, Holz-Profil des Orts → Querschnitt → L_max durch Durchbiegung (E5); Gegenprobe Forchheim ~5 m (E-F S. 115) | Balkenlagen, Unterzüge, Innenständer, Wechsel als Meshes in `subsystems.geruest`; Balkenabstand (40–60 cm belegt, E-F S. 115) — Abstand und L_max fallen ZUSAMMEN aus dem Holz-Profil (E13) | `geruest` FC:458–474: Ständer nur außen FC:451–454; Balken auf jeder Ständerachse `bx` FC:422, **Abstand ≤ `bayMax` 1,7 m** (FC:181, 420); Balken über volle Tiefe FC:466–470; Loch ohne Wechsel FC:357–359 | Holz des Orts **fehlt**; Querschnitt 0,15 × 0,21 fest FC:179 |
| 10 | **Sockel** | Gelände unter dem Rechteck (`hp.hang`): der Sockel folgt dem Gefälle in Stufen (E5, Geometrie, keine historische Zahl; „up a few steps“ ST15 S. 8 als Fall) | `hp.sockel` {stufen, talseite}, `hp.untergeschoss`, Boden y der Straßenseite | `foundH` 0,55 FC:178; Platte FC:426–449; Keller 2,40 m FC:212–213, Würfel 35 % FC:4446; `terrain:0` FC:4436 → FC:1488. Gelände folgt dem Haus FC:11114–11123 | Gelände vorhanden; Hang-Klasse ohne Leser; Richtung **fehlt** |
| 11 | **Öffnungen** | Grundriss, Tragwerk-Felder, Ecke, Brandwand | `WALLS[].win`, `WALLS[].type`, Schau-Seiten | `wallSpec` FC:477–497 (Tür nur vorn FC:488); Brandwand FC:502–504 liest `hp.brandwand` — der einzige heutige Lage-Leser im Haus | Brandwand vorhanden; Ecke **fehlt** |
| 12 | **Dach** | Hülle, Deckung des Orts → Neigung (Stroh 50°, Ziegel 45° vor 1700 / 35° danach, Steinplatte 30–35°, Schiefer 25–30°: SPEL, BAB), Dachkörper über dem Gesims (Paris 10/15 Fuß nach Haustiefe, PAR84), Tragwerk | Neigung, Dachform, Sparren | KULTUR-Neigung ± Würfel FC:2207, `grenzNeigung` FC:208, 2230; Sparren 10 × 10 `P.spar` FC:180; `sparH` 0 Leser | Deckung je Stil vorhanden (STIL_GRENZNEIGUNG, nach tafel.md) |
| 13 | **Zeit / Geschichte** | Gründung, Epoche, Adresse (Samen), Los | `hp.baujahr`, Ereignisse in `hp.schritte`: erst Teilung der Front (Freiburg 17 m → 2 Häuser 1252–55, L07 S. 18; York 3 → ≥ 12, RJ87), dann Füllung des Hofs (Edinburgh 1400 nur vorn, 1490 ⅓, ein Jh. später voll, ST15 S. 5), Ersatzbau, Aufstockung (L19) | Baujahr aus Index + Würfel FC:4433; Ersatzbau-Würfel FC:4431, `fr[]` FC:4450; keine Teilung, keine Hof-Füllung, keine Aufstockung | Baujahr vorhanden; Ereignisse **fehlen** |

Zählung: zwölf Glieder der Kette (Plan, Los, Zins, Stand/Gewerbe, Haushalt, Hülle, Grundriss, Tragwerk, Sockel, Öffnungen, Dach, Zeit). Die
Höhe (Zeile 7) ist der Teil der Hülle, den E4 eigens setzt, kein eigenes Glied.

**Tragwerk und Grundriss (Wortlaut des Entscheids, als Struktur):** tragende Linien liegen auf Raumwänden. Wo die Spannweite L_max
übersteigt, tritt Unterzug, Innenständer oder Wechsel ein, als liegendes Holz in `subsystems.geruest`. Ein Ständer steht nie in Tür,
Lauf oder Podest als Zwang. Glied 9 liest Glied 8, nie umgekehrt; Glied 11 liest beide.

---

## §2 WAS FÄLLT (Leser aus `v3/zaehl-faellt.log`)

| # | fällt | datei:zeile | Leser | an seine Stelle tritt |
|---|---|---|---|---|
| F1 | `tryPlace` als „erste Stelle, an der die Hülle passt“ | FC:5487–5533 | 3 (Rufe FC:5602, 5604; Kommentar 5549) | Glied 2; die Prüfungen Mauer, Wasser, Weg, Friedhof (FC:5502–5518) werden Bedingungen des Loses |
| F2 | Folge der Lose = Index, Metrik edepth·34 + cur + rnd·2 | FC:5560–5562, 5590, 5594, 5600 | 3 im Setzer (von `edepth` 14) | Glied 2 (Lage), Glied 13 (Gründungsfolge als Ereignis) |
| F3 | Fuge gewürfelt, Schritt 1,1 m | FC:5530, 5532 | 0 | Rest der Teilung in Vierteln (Glied 2) |
| F4 | Setzer-Jitter `jitAmp` | FC:5361, 5494 | 3 | ersatzlos in der Stadt; außerhalb Bauflucht (L30) |
| F5 | Wohlstand-Würfel | FC:4438 | Feld `.wohl` 9 | Glied 3 → 4: Stand aus dem Zins |
| F6 | +1 Geschoss bei wohl > 0,9 | FC:4444 | 0 | **fällt (E4)**; Glied 7 |
| F7 | Kultur-Würfel im Pool | FC:4435 (`poolAt` FC:4424 bleibt) | 0 | Bauweise aus Region × Ära ohne Würfel (L29) |
| F8 | Maß-Jitter in `_bauweiseWurf` | FC:2204–2210 | 1 (FC:2225; `bauRezept` 18 Leser inkl. PRESETS FC:5775, diag-fachwerk-contract.cjs:98) | W aus dem Los; D aus Bedarf; Neigung Glied 12; Abweichung vom Viertel nur als benannter Schritt (L5) |
| F9 | Doppel-Klemme der Breite 5–15 | FC:2208, 4439 | 0 | ersatzlos (Verteilung = Absteckung) |
| F10 | Ring-Breite | FC:4437 | 0 | Glied 2 |
| F11 | Maß-Zeilen der Haushalts-Rollen in BAU_NUTZUNG (FC:2184, 2185, 2187, 2188, 2190, 2195, 2196, 2198, 2199, 2200) | FC:2184–2200, angewandt 2227–2228 | `BAU_NUTZUNG` 7 | Glieder 6–8; Form-Ops L31; Sonderbau-Zeilen bleiben (2186, 2189, 2191–2194, 2197) |
| F12 | Rolle nach Index | FC:4383–4386, 4323, 4468, 4340 | `stadtViertel` 1 | Glied 4 aus Zins und Lage |
| F13 | Keller-, Anbau-, Balkon-, Grundriss-Würfel, arm | FC:4446–4449 | 0 | Keller: London — jedes Haus der drei Sorten mit Keller 6½ ft (LON s. VII–IX, L28); Anbau, Grundriss: Glied 8 |
| F14 | Ersatzbau-Würfel 12 % | FC:4431, 4450 | 0 | Glied 13 (Ereignis mit Samen) |
| F15 | Stadtkörper-, Downtown-, Gewerbe-Würfel | FC:4440–4443, 4453–4460 | 3 | Glied 13 (nicht gezählt) |
| F16 | Höhe aus Tiefe mit `DP.erbe` | FC:4491–4495 | `STADT_FORM` 20 (Ton-/Kern-Zeilen bleiben) | Glied 7 (Paris nach Straßenbreite) |
| F17 | `terrain:0` als Gelände-Blindheit | FC:4436, 4399, 4473, 4483, 5815; Leser 1488 | 9 | Glied 10 liest `hp.hang`; die Vertrags-Grenze FC:50 bleibt |
| F18 | fester Sockel 0,55 m | FC:178, 211, 426–449 | `foundH` 8 | Glied 10: Stufen nach dem Gefälle |
| F19 | durchlaufender Deckenbalken | FC:466–470 | 1 | Glied 9 |
| F20 | Loch ohne Wechsel | FC:357–359 | 1 | Glied 9 |
| F21 | Balken auf jeder Ständerachse, Abstand ≤ 1,7 m | FC:418–422, 181 | `bayMax` 2 | Glied 9: Abstand 40–60 cm (E-F S. 115), Lage aus dem Grundriss |
| F22 | Raum-Schnitte auf Achsen; Raum-Gewichte gewürfelt | FC:609–613; 598–605 | 2 (Schnitte 1, `rndI` im Programm 1; 19 weitere `rndI` in Teilbauten/Möbeln bleiben) | Glied 8 |
| F23 | Flur W·0,15, Treppe aus Samen | FC:261, 369–371 | `shaftCX` 1 | Glied 8 |
| F24 | `sparH` ohne Leser | FC:180 | 0 | Glied 12 (L23) oder ersatzlos |
| F25 | Flächenformel der Bewohner | FC:9532–9537 | `leuteVon` 10 | Glied 5 (`hp.leute`; FC:9531 liest es schon) |
| F26 | `hp.parzelle` ohne Erzeuger | FC:2255 | 1 | Glied 2 |
| F27 | Packer `bauProgramm` | FC:2245–2276 | 2 | Glieder 6/8 |
| F28 | zweite Traufe-Regel der Ferne — **Fund-Zeile (E10): fällt in der Bau-Welle mit der nahen auf EINE Quelle, kein Einzelschnitt vorab** | FC:4072, 4119–4120 gegen FC:211–215 | `STADT_MASSEN` 5, `hausMasse` 2 | Glied 7 `hp.traufe` |
| F29 | Lose der Stufe 1 | FC:4090–4106 | `kachelMassen` 13 | Glied 2 auf der Blockkante |
| F30 | PASSUNG | FC:9780–9791 | 7 | jeder Bau des Loses liest dasselbe Los |
| F31 | Los = Hülle | FC:9778–9779 | `massBauExport` 4 | Glied 2 |

**Leser-Summe: 118** (Namen, die nur teilweise fallen, mitgezählt: STADT_FORM 20, kachelMassen 13, leuteVon 10, BAU_NUTZUNG 7,
massBauExport 4; Würfel als Ausdruck zählen 0). Nicht in dieser Kette: Fenster-Takt und OG-Material FC:479–480 (Bahn 1/Stoff), Herd-Strom
FC:586.

---

## §3 DIE BENANNTEN LÜCKEN — eingearbeitet aus `v3/quellen-los-haus.md`

Status: **gefüllt** (Zahl mit Quelle, T am Volltext, Stelle) · **HYPOTHESE** (nur sekundär, oder eine Funktion ohne Beleg) · **entfällt** (Entscheid
macht es zur Geometrie, kein Datum) · **offen**. Thema A–G wie zuvor.

| L | Größe | Status | Zahl · Einheit · Quelle (Stelle im Quellen-Blatt) | heute im Code | Th. |
|---|---|---|---|---|---|
| L1 | Modul / Block-Einheit | **gefüllt** | perch 16½ ft = 5,03 m (VCHX; W89 S. 182); 18-ft-Rute Northumberland (W89 S. 107); Freiburg 50 Fuß à 32,4 cm = 16,2 m (L07 S. 7–8); Schottland Block-Einheit 5,8–12,8 m (T08 S. 233) — §1 Tafel, §B „Absteck-Modul“ | Rundung ½ m FC:2208, 4439 | A |
| L2 | Lose in Einheiten, Teilungs-Brüche | **gefüllt**, Rest offen | ¾–2½ Einheiten, ⅔ ± 0,5 m am Viertel (ST15 S. 5; T08 S. 232–233); Teilung halbiert die FRONT (ST15 S. 5, L07 S. 18). Rest: Anteil je Bruch NG | keine | A |
| L3 | Verteilung der Los-Breite (Quantile) | **offen** | NG (nur Spannen: York 35–60 ft, Modus ~50 ft, RJ87; 21 Gruppen-Mittel 6,02–12,80 m, T08) | Folge der Hülle | B |
| L4 | Los-Tiefe; Tiefe ÷ Breite | **gefüllt**, Rest offen | T ÷ B 2,0–2,6 Freiburg (L07 S. 17), 3,4 Stratford (S), 4,7–6,3 Burford spät, 10–25 Oxford/Burford früh (VCHX, P37); Tiefen Freiburg 32–40 m. Rest: Tiefe je Lage NG | freier Grund bis Hindernis | B |
| L5 | Abweichung vom Modul (Messfehler) | **HYPOTHESE** | Freiburg Breiten 14–18 m um 16,2 m (L07 S. 17) — Messfehler und Teilung nicht getrennt; Taits ± 0,15/0,3 m ist die heutige Mess-Güte (T08 S. 227), nicht die der Rute | Jitter FC:2208 | A |
| L6 | Teilung, Hof-Füllung über die Zeit | **gefüllt** (Ordnung), Rest offen | erst Front geteilt (Freiburg 1 → 2, 1252–55, L07 S. 18; York 3 → ≥ 12, RJ87 S. 9), dann Hof: Edinburgh 1400 0 → 1490 ⅓ → ein Jh. später voll (ST15 S. 5). Rest: Rate je Jahrhundert NG | Ersatzbau-Würfel FC:4431 | B |
| L7 | Zins aus Lage; Stand aus Zins | **HYPOTHESE** | keine Quelle am Text (Hearth-Tax nach Straße NG); Covent Garden 9,2 Herdstellen (S) | wohl FC:4438 | C |
| L8 | Zins je Einheit | **gefüllt** | Cockermouth 1270: 4 d je Einheits-Los (ST15 S. 5); Freiburg 12 Pf. je Hofstätte (L07 S. 7) | keiner | C |
| L9 | Gewerbe je Lage | **offen** | belegt nur die Schichtung im Los (Läden vorn, Haupthaus hinten: RJ87 S. 139/156, SAT90 S. 163); Verteilung nach Straße NG | Index FC:4383 | C |
| L10 | Gesinde je Gewerbe | **HYPOTHESE** | nicht im Quellen-Blatt; 7 von 11 Zeilen „Annahme“ (gesetz-proto.cjs:50–56) → ans Person-Gesetz als benannte Hypothesen (E10) | keiner | C |
| L11 | Bemessungs-Haushalt | **offen** | NG | FC:9532–9537 | D |
| L12 | Haus auf dem Los (Stellung, Füllgrad) | **gefüllt** (Regel), Rest offen | schmal → Haus an der Front mit Seitengang und Hinterhaus (P37); breit ≥ 1½ Einheiten → quer oder um Hof (ST15 S. 23); Oxford Füllgrad ~½ an einem Haus (P37 S. ~185). Rest: Statistik des Füllgrads NG | 3,4 % füllen | D |
| L13 | Haus-Tiefe ↔ Los-Tiefe | **offen** | ein Fall: Freiburg Vorderhaus innen 6 × ~9 m, Vorderhaus + Flügel + Hinterhaus (L07 S. 12–13); Regel NG | D 4–11 FC:2209 | D |
| L14 | Geschosse je Straßen-Klasse (Endfall unter höchstem Druck, E12) | **gefüllt** | by-lanes 2 · streets of note 3 · high streets 4, je + Keller + Dach (LON s. VII–IX) | FC:4444 | E |
| L15 | Zuordnung `gen` der Kante ↔ Klasse der Ordnung | **entfällt** (E12) | Kategorien-Fehler: Eingang ist die absolute Breite `kante.w`, nicht der Rang im Baum (heute gen 0/1/2 = 26,0/13,5/60,5 % der Fronten, zaehl-los.log Zusatz E4) | keine | E |
| L16 | Geschosse je Stand | **offen** | NG | FC:4444 | E |
| L17 | Höhe bis Gesims nach Straßenbreite | **gefüllt** | < 24 / 24–29 / ≥ 30 Fuß → 36 / 45 / 54 Fuß bis Gesims, Dach + 10/15 Fuß (PAR84 Art. 1, S. 456; OCR-Vorbehalt dort) | FC:4494 (nur Erbe) | E |
| L18 | Geschosshöhen | **gefüllt** | 8½–10½ ft lichte Höhe, Keller 6½ ft (LON s. VII–IX); DE/CH NG | 2,55/2,35 FC:178 | E |
| L19 | Aufstockung | **offen** | NG (Edinburgh 1636 „five, six storeys“ ist ein Stand, keine Rate, ST15 S. 17) | keine | E |
| L20 | Holz-Profil → L_max | **gefüllt** (Gegenprobe), Rest offen | Forchheim: freie Deckenbalken-Spannweite mit Unterzug ~5 m (E-F S. 115); Freiburg 6 m Innenmaß (L07 S. 13). Rest: Durchmesser/Holzart des Orts und Querschnitte NG | 0,15 × 0,21 FC:179 | F |
| L21 | Lasten | **offen** | NG | im Zähler gewählt | F |
| L22 | Lage des Unterzugs | **offen** | ein Befund (Forchheim: Unterzug auf Säulen; Dachbalken 13 m brauchen Unterzug, E-F); Regel NG | keiner | F |
| L23 | Sparren-Querschnitt | **offen** | NG | 10 × 10 FC:180 | F |
| L24 | Sockel aus dem Gefälle | **entfällt** (E5) | Geometrie des Grunds; Fall „up a few steps“ (ST15 S. 8) | foundH FC:178 | G |
| L25 | Anteil Hanghäuser | **entfällt** (E5) | ist ein gezähltes Ergebnis des Grunds (§6 G4), kein Eingang | keiner | G |
| L26 | Ecke | **gefüllt**, Rest offen | Eckhaus nimmt an der schmaleren Straße die Höhe der breiteren, über die Tiefe des Vorderbaus (PAR84 Art. 2, S. 456); York: Eck-Tenement in ≥ 6 Läden an der Seitengasse (RJ87 S. 156). Rest: zweite Schau-Seite, Wert NG | keins | D |
| L27 | Stellung Traufe/Giebel | **gefüllt** (Freiburg), Rest S | Freiburg 13. Jh. traufständig (L07 S. 13); Lübeck giebelständig 26/74 % und Scheutz-Typen nur S | Tür vorn FC:488 | D |
| L28 | Keller | **gefüllt** (London) | jedes Haus der drei Sorten mit Keller, 6½ ft (LON s. VII–IX); Freiburg hofseitige Gewölbekeller (L07 S. 13) | Würfel 35 % FC:4446 | D |
| L29 | Bauweise im Pool | **offen** | nicht im Quellen-Blatt | Würfel FC:4435 | — |
| L30 | Bauflucht außerhalb der Stadt | **offen** | NG | `jitAmp` FC:5361 | A |
| L31 | Gewerbe → Bauteil | **gefüllt** | Laden 5–10 ft vorn mit Solar darüber (RJ87 S. 11, 139); Auskragung 52–60 cm je Geschoss, England 15. Jh. (ST15 S. 12); Paris 1783 verbietet Auskragung (PAR83 Art. 6) | Ops FC:2184–2200 | D |
| L32 | Gründungsfolge der Lose | **offen** | NG | Index FC:4429 | — |
| L33 | Balkenabstand | **gefüllt** | 40–60 cm (E-F S. 115) | ≤ 1,7 m `bayMax` FC:181, 420 | F |
| L34 | Dachneigung nach Deckung | **gefüllt** | Stroh 50°, Ziegel 45° (vor 1700) / 35°, Steinplatte 30–35°, Schiefer 25–30° (SPEL, BAB) | KULTUR ± Würfel FC:2207 | — |
| L35 | Stand über Frontbreite (eigene Zeile, E3) | **HYPOTHESE** | am Text NICHT belegt (Quellen-Blatt §C „ungeprüft“) | keiner | C |
| L36 | Ursache des eingeschossigen Stadthauses | **offen** | am Text keine; am Kern spiegelt die Lage der 354 Eingeschosser das Index-Schema (§0 Punkt 3, zaehl-druck.log) | heute 13,6 % | E |
| L37 | Welche Ordnung je Region/Epoche (Teil-Raster perch oder Viertel; London oder Paris; Straßenbreite je Rang) | **offen** | NG; die Quellen sind England, Schottland, Freiburg, Paris; das κ-Band 0,13 … 0,33 ist schottisch | keine | A/E |
| L38 | Druck → Geschosse: Bedarf aus dem Zins am Los (eigene Zeile, E12) | **HYPOTHESE** | nicht am Text; am Kern nicht prüfbar, weil die heutige Lage der Eingeschosser dem Rang-Würfel folgt (§0 Punkt 3) | Wohl-Stufe FC:4444, KULTUR.st | E |
| L39 | Verkehr → Straßenbreite: Breite je Klasse aus der Funktion (ein Wagen · zwei Wagen im Begegnen · zwei Wagen plus Stände) (E14) | **HYPOTHESE** | bis zur Quelle nicht am Text; `v3/quellen-strasse-zins.md` angefragt. Naht zum Verkehr-Gesetz (`zensus-verkehr`) — dort gesetzt, hier nur gelesen | heute fünf Breiten 2,6–5,0 m = 8,0–15,4 Pariser Fuß (`zaehl-druck.log`), alle unter 24 Fuß |

**Zählung (dritter Gang): gefüllt 16** (L1, L2, L4, L6, L8, L12, L14, L17, L18, L20, L26, L27, L28, L31, L33, L34) · **HYPOTHESE 6** (L5, L7,
L10, L35, L38, L39) · **entfallen 3** (L15, L24, L25) · **offen 14** (L3, L9, L11, L13, L16, L19, L21, L22, L23, L29, L30, L32, L36, L37).

---

## §4 §SOLL — DIE SOLL-TAFEL (vor dem Spike)

„Richter“ = das Skript, das am HAUS des Kerns bzw. am Export die Zahl zählt, und das Feld, das es liest. Ein Nachbau der heutigen Kette
oder eine Linse am Prototyp ist KEIN Richter (E9).

| S | Maß | heute | Soll | Richter (Skript · liest Feld) | Feld des Gesetzes | Quelle / Entscheid |
|---|---|---|---|---|---|---|
| S1 | Häuser mit Decken-Balkenlinie, deren lichte Spannweite zwischen Auflagern L_max übersteigt | 2 522 / 2 595 (die 100: 99) | 0, durch Unterzug / Innenständer / Wechsel als liegendes Holz, nicht durch größeres L_max; auch Balken längs x | `v3/zaehl-balken.cjs` · `subsystems.geruest` (Mesh-Hüllen), `HAUS.P`, `HAUS.dims` — Richter heute; Lücke: Lage längs x (ein Filter), Ständer bis zum Grund | Meshes in `geruest`; `P.balkenB/H` | L_max aus Querschnitt (E5), Gegenprobe Forchheim ~5 m (E-F S. 115) |
| S1b | Balkenabstand in der Decke | ≤ 1,7 m (`bayMax` FC:181, Teilung FC:420; Balken auf jeder Ständerachse FC:422) | aus dem Holz-Profil zusammen mit L_max; belegt 40–60 cm | `v3/zaehl-balken.cjs` · Mesh-Lagen x in `geruest` (e = halber Abstand zu den Nachbarn, zaehl-balken.cjs:20) — Richter heute | Meshes in `geruest` | E13; E-F S. 115 |
| S2 | Ständer in Tür, Lauf oder Podest (Podest 0,9 m ab Wandachse) | am Haus nie gezählt (Prototyp R2: 12,5 %) | ≤ 10 % nach Wortlaut | neu (§6 G1) · `HAUS.dims.zonen` + Ständer in `geruest`; heute: Prototyp-Linse, zählt nicht | `HAUS.dims.zonen` (heute intern `circR` FC:325) | Kopf BAU; pruefung-spike-v2 Punkt 1 |
| S3 | Würfel-Anteil an Var(Los-Breite), Wohnhäuser derselben Stadt | 66,0 % (volle Zerlegung 79,9 %) | 0 % ohne benannte Ursache; Messfehler, Teilung, Zusammenlegung als benannte Schritte mit Samen, je einzeln gezählt | neu (§6 G2) · `hp.schritte.losBreite`; heute: Nachbau zaehl-los.cjs:307–344, zählt nicht | `hp.schritte` (PFLICHT) | E9; L5, L6 |
| S4 | κ = (Anteil − p0)/(1 − p0), Anteil = Lose ± 0,5 m am Teil-Raster der Block-Einheit aus dem Feld des Plans; p0 daneben | Feld fehlt (0 / 2 595); feste Einheiten: perch κ −0,056 (p0 0,795) · Freiburg κ 0,040 (p0 0,247) · beste U 5,91 m κ 0,074 (p0 0,677) · Edinburgh 24 ft κ −0,041 | κ im Band **0,13 … 0,33** (0,133 aus U 6,5 m · 0,142 aus U 6,54 m · 0,333 aus U 8 m; §0 Punkt 2); κ nahe 1 ist so falsch wie −0,04 | `v3/zaehl-los.cjs` Zusatz E1 · `hp.blockEinheit`, `hp.losBreite` (κ-Zeile am Feld wird dort ergänzt, sobald das Feld reist) — Richter, sobald das Feld da ist | `hp.blockEinheit`, `block.raster`, `hp.losBreite`, `hp.losViertel` | E11, E2; ST15 S. 5; T08 Tab. 1, Illus 2 |
| S5 | Würfel-Anteil an Var(Geschosse); Tafel-Anteil der Rolle | Würfel 22,3 %, Rolle 47,7 % | Würfel 0 %; Rollen-Zeile nur beim Sonderbau; Geschosse = min(Decke aus `kante.w`, Bedarf aus dem Druck); +1 bei wohl > 0,9 fällt | neu (§6 G2) · `hp.schritte.storeys` (Schritte „decke“, „bedarf“), `hp.sonderbau`; heute: Nachbau zaehl-hoehe.cjs:88–110, zählt nicht | `hp.schritte`, `kante.w`, `hp.zins` | E12; PAR84 Art. 1; LON s. VII–IX (Endfall); L38 HYPOTHESE; K7 |
| S6 | Abweichung Stand ↔ Nachrechnung aus Zins(Viertel, Lage) | kein Stand-Feld; ρ(wohl, Abstand Markt) −0,48 ohne Pfad | 0 (byte-gleich) | neu (§6 G3) · `hp.stand`, `hp.zins`, `hp.losViertel`, `hp.lage` | dieselben | K4, E7 |
| S7 | Leser von Ecke und Hang im Haus | 0 / 0 | je ≥ 1: Ecke → Höhe der breiteren Straße + zweite Schau-Seite; Hang → Sockel in Stufen | Ecke: `v3/zaehl-los.cjs` ECKE_FELD + Haus-Vergleich (:261–262); Hang: Zähler in der Welt (§6 G4), in node nicht zählbar | `hp.ecke`, `hp.hang`, `hp.sockel`, `WALLS[].type` der Flanke | K3, E4, E5; PAR84 Art. 2 |
| S8 | Formen W×D×st · Breiten-Stufen · Traufe Q90−Q10 · häufigste Form; Messname „eingeschossig ohne Ursache“ | 440 / 21 / 4,70 m / 5,8 % an 2 595 Losen (Pläne G) | ≥ heute an derselben Stadt (Samen, Wort); Zahl der Lose heute und am Gesetz nebeneinander; eingeschossig ohne Ursache als Befund, nicht gewürfelt | neu (§6 G2) · Export `hp.W/D/storeys/traufe`; heute: v2 richter-kopplung über Prototyp, zählt nicht | `hp.W`, `hp.D`, `hp.storeys`, `hp.traufe` | K5, E6, E8; Befund zaehl-druck.log (354 Eingeschosser folgen dem Index-Schema) |
| S9 | Häuser ohne gültigen Grundriss | am Haus nie gezählt (Prototyp R2: 32,1 %) | ≤ 5 % | neu (§6 G2) · `hp.grundriss` {ok, grund}; heute: spike-v2 am Prototyp, zählt nicht | `hp.grundriss` | Kopf BAU |
| S10 | Preis je Haus, kalt | bauRezept 0,6–4,2 µs (Runde 1) | ≤ 50 µs kalt (Bedingung) | neu (§6 G2) · Ruf je Los kalt/warm in einem Prozess | — | Kopf BAU |

---

## §5 DIE NÄHTE

**Person-Gesetz** (90b6950d):
- Person liest vom Bau die Adresse = das Los (Gewerbe, Klasse, Baujahr) und `haushalt(gewerbe, klasse).gesinde`. `kinder[klasse]` ist
  gefallen. Sonderbau trägt keinen Haushalt.
- Mit E7 liest Person den Stand, der aus dem Zins des Loses folgt; `klasse` (Person) ≡ `stand` (Bau), ein Feld.
- **Die sieben „Annahme“-Zeilen des Gesindes** (gesetz-proto.cjs:50–56: schmied, wirt, gerber, weber, brauer, kraemer, geistlich) gehen
  ans Person-Gesetz als benannte HYPOTHESEN, nicht als Datum (E10, L10). Die vier übrigen (tageloehner, ackerbuerger, baecker,
  kaufmann) stammen aus Entwurf B und sind ebenfalls nicht am Quellen-Blatt belegt.
- Richtung: Los → Zins → Stand → Haushalt-Tafel (Bau) → Hauslauf (Person) → Haus (Programm) → Tag (Person: Bett-Punkt, Herd, Werk-Los).
  Der Hauslauf liest keine Geometrie des Hauses. Damit gibt es keinen Kreis Haushalt ↔ Haus und keinen Kreis Haushalt ↔ Los (E7).
- `leuteVon(ov)` bleibt der Name, den der Wirt ruft (stamm/siedlung-bewohner.js:839); die Flächenformel fällt (F25).
  stamm/siedlung-bewohner.js:717–741 bleibt unberührt (Person-Welle).

**Bahn 1 Öffnungen** (aus entscheid-v2.md §4.2/4.3, pruefung-quelle-v2.md K1–K6):
- Bahn 1 liest `WALLS[].win` (FC:494–495) und schreibt es nie; das Gesetz schreibt WALLS aus Glied 8/9.
- Für S7-Ecke nimmt die Seitenregel `fensterAt(…, aus)` (5a5b53f37) die Flanke als Außenseite, wenn `hp.ecke` sie nennt. Das ist das
  Muster von `hp.brandwand` (FC:502–504) mit umgekehrtem Urteil.
- Paris 1783 verbietet Auskragung (PAR83 Art. 6), England kennt sie (ST15 S. 12): Auskragung gehört je Ordnung zur Fassade (L31, L37).

**Erdbau / Gelände.**
- Richtung: Gelände → `hp.hang` (Glied 2) → Sockel in Stufen (Glied 10) → Platte/Erdbau. Heute läuft es umgekehrt (FC:11114–11123;
  Erdbau gelaende-core.js:2085–2094 nach Zensus).
- Der Erdbau muss `hp.sockel` lesen und die Stufen nicht einebnen.

**Ferne / LOD:**
- Stufe 1 ruft Glied 2 auf ihrer Blockkante (heute eigene Lose FC:4092–4106).
- Die Traufe hat EINE Quelle (Glied 7, E10); `hausMasse` liest `hp.traufe`.

**Worker-Kanal:**
- Die Welt-Eingänge reisen in `dp`: `dp.hoehe` (da), `dp.epoche` (da), Same (da), Stoff des Orts `bauOrt` (fehlt; ohne ihn wirft der Bau, kein
  `?? Heimat`, kein HEIMAT-Preset als Daten-Fallback — pruefung-quelle-v2.md Punkt 7).
- Das Wort `nH` setzt die Stadt, die Zahl der Lose ist Ergebnis (E6).
- Die Goldens von gate:fachwerk-contract brechen, sobald F8 fällt — benannt, erwartet.

---

## §6 VOR DEM SPIKE: ZÄHLER, MENGE, BILDER — UND DIE REIHENFOLGE DER GLIEDER

**Grundlinie (in dieser Reihenfolge, alles vor dem Spike):**
- **G1 Zähler S2 am Haus:** `HAUS.dims.zonen` (Tür, Lauf, Podest 0,9 m ab Wandachse) gegen die Ständer in `geruest`. Er druckt den
  Wert HEUTE (am Haus nie gezählt; `postsRing` spart nur die Haustür aus, FC:452).
- **G2 Zähler S3, S5, S8, S9, S10 über `hp.schritte` und den Export:**
  - S3/S5 lesen `hp.schritte`; die HEUTE-Zahl bleibt die des Nachbaus (66,0 % / 22,3 %), als Vorher-Zahl, nicht als Richter.
  - S8 liest den Export derselben Stadt.
  - S9 liest `hp.grundriss`.
  - S10 ruft je Los kalt und warm in einem Prozess (Vorher: bauRezept 0,6–4,2 µs, DORF nH 90 0,71–5,2 ms).
- **G3 Zähler S6:** Nachrechnung Stand aus Zins(Viertel, Lage).
- **G3b Druck-Prüfung** (`v3/zaehl-druck.cjs`, gefahren 19.11.): sie bleibt die Vorher-Zahl für L36/L38. Am Gesetz wiederholt sie
  dieselben Eingänge mit `hp.zins` statt des Abstands zum Markt.
- **G4 Hang-Zähler in der Welt:**
  - Gelesen wird je Ort `ortWahl` (voxel-worker.js:926 ff.) → `v2.slots[k]`.
  - Je Slot: `hang` (FC:11177), Spanne neu aus `ctx.hoehe` über `rechteck(slot.obb)` (FC:11041, wie 11110–11111), Richtung
    H(Front) − H(Rück).
  - Ausgabe: Anteile plattform/hanghaus/stelzen, Spanne Q10/50/90, Tal vorn/hinten, je Rolle; Kontrolle Δ Haus = 0.
  - Ohne Welt: Export mit dem Raster, das das Labor holt (worlds/fachwerk/fachwerk.js:234).
- **G5 Feld der Block-Einheit:** sobald `hp.blockEinheit` reist, zählt `zaehl-los.cjs` Zusatz E1 ohne Umbau. Vorher-Zahlen stehen in §4 S4.
- **G6 Die Menge:** dieselbe Stadt (Saat 1–30, Wort nH 90, pool.cjs:94–100); die Zahl der Lose heute (2 595 Haushalts-Lose) und am
  Gesetz nebeneinander (E6).
- **G7 Die 16 Vorher-Bilder** am main-Kopf (Treiber p3/n1811/bau-bild, ungefahren).

**Reihenfolge der Glieder** (jede Stufe ersetzt; keine läuft neben der alten; jede am Bild prüfbar):
1. **Plan:** absolute Breite je Kante, Block-Einheit, Teil-Raster und Tiefe ÷ Breite je Block. Häuser byte-gleich. Bild: Straßen nach Klasse.
2. **Los:** die Absteckung in Vierteln; `tryPlace` fällt (F1–F4, F29–F31). Das heutige Haus steht in seinem Los. Gezählt: S4, Anteil
   „Hülle überragt das Los“, Zahl der Lose gegen nH. Bild: Los-Grenzen.
3. **Zins, Stand und Gewerbe** (F5, F12). Gezählt: S6. Bild: die Viertel nach Gewerbe.
4. **Hülle und Höhe** aus Los, Klasse, Breite (F6–F11, F16, F26, F27, F28). Gezählt: S3, S5, S8. Bild: die Gasse wie G7.
5. **Haushalt und Grundriss** (F22, F23, F25). Gezählt: S9. Bild: Innenraum, Laden vorn.
6. **Tragwerk aus dem Grundriss** (F19–F21). Gezählt: S1, S2. Bild: EG-Decke von unten.
7. **Sockel aus dem Gefälle, Ecke** (F17, F18). Gezählt: S7. Bild: Hanghaus von der Talseite, Eckhaus.
8. **Dach** aus Deckung und Spannweite (F24). Bild: Dachwerk.
9. **Zeit:** erst Teilung der Front, dann Füllung des Hofs, Ersatzbau (F14, F15). Gezählt: S3 je Schritt. Bild: dieselbe Gasse in zwei
   Jahren.
10. **Ferne** liest dieselbe Kette (F28, F29). Gezählt: Traufe nah = fern je Haus. Bild: die Stadt vom Hügel.

S10 ist auf jeder Stufe Bedingung.
