# GESETZ v3 — DIE STRUKTUR DES BAUENS (Runde 3, nach dem Zensus; Lese-Baum n1011-hg main b7ed8419, nur gelesen)

## (K) ENTSCHEIDE DES KOPFES ZU §0 (19.11. 01:40) — gelten über dem Text darunter

Dieses Blatt ist STRUKTUR: kein Code, kein Spike, keine gewählte Zahl. Vom Kopf gelesen ist der Rohbericht und §0, nicht jede der
31 fallenden Stellen am Code.

1. **Zähler vor dem Spike.** S2, S8, S9 und S10 haben keinen Zähler am HAUS des Kerns, S3 und S5 zählen über einen Nachbau der heutigen
   Kette. Das Gesetz liefert darum je Haus ein Feld `hp.schritte` (jeder Schritt der Kette mit Eingang und Ausgang); die Zähler lesen
   dieses Feld. Der Umbau der Zähler ist Teil der Grundlinie, nicht des Gesetzes.
2. **S4 allein entscheidet nichts** (κ = 0 ist der Zufall, das belegte Band schließt ihn ein). S4 gilt nur zusammen mit: das Los nennt
   sein Absteck-Modul als Größe mit Quelle (Lücke), und jede Abweichung vom Modul ist ein benannter Schritt in `hp.schritte`.
3. **Die Ecke hat EINE Definition:** ein Los mit zwei Fronten an zwei Kanten des Straßen-Netzes. Der Flankenabstand (56,0 % / 33,9 %)
   war eine Lesart des Zählers und fällt; die Regel der Stufe 1 (FC:4091) liest danach dieselbe Größe.
4. **S6 wird eine Zahl:** der Stand reist als Feld, der Zähler rechnet ihn aus der Lage nach — Abweichung 0.
5. **S8 gegen London 1667:** die Traufe-Spanne ≥ 4,70 m bleibt Soll. Trägt keine belegte Ursache das eingeschossige Haus in der Stadt,
   wird nicht gewürfelt, sondern es steht als Befund: „diese Varianz der heutigen Stadt hat keine Ursache“ (Wort des Koordinators, Runde 2).
6. **Zwei Traufe-Regeln (nah 7,80 m, fern 8,60 m bei drei Geschossen, FC:211–215 gegen 4072/4120)** sind ein Zwilling: EINE Regel,
   die ferne liest die nahe. Fund-Zeile für die Tafel.
7. **Wohnturm und Patrizierhaus** sind Wohnhäuser eines Standes, kein Sonderbau: ihre Höhen-Zeilen fallen unter S5.
8. **FRAGE AN DEN KOORDINATOR (nicht entschieden):** setzt das Wort `nH` die Zahl der Lose, oder folgt sie aus Front ÷ Absteckung?
   Folgt sie aus der Absteckung, sind „dieselben 2 595 Lose“ keine feste Menge mehr und S8 misst an derselben STADT (Samen, Wort),
   nicht an denselben Losen. Vorschlag des Kopfes: die Lose folgen aus dem Plan, `nH` wird Ergebnis.
9. **Naht Person:** 7 von 11 Gesinde-Zeilen in `spike/gesetz-proto.cjs:50–56` sind „Annahme“ — das Person-Gesetz liest sie als Datum.
   Gemeldet; Name und Form von `haushalt` bleiben unberührt.


Kein Code, kein Prototyp, kein Spike, keine gewählte Zahl. Dieses Blatt sagt: was folgt woraus, welche Stellwerte fallen (datei:zeile),
wo ein Datum mit Quelle stehen muss (benannte Lücke L1 … L32). Kern FC = `fachwerk-core.js` an der Wurzel des Lese-Baums, SHA-256
028cc2d0…bea06 (gedruckt in `v3/zaehl-faellt.log` Z. 1). Jede datei:zeile ist an der Quelle selbst nachgelesen; wo eine Zeile nur aus
einem Blatt übernommen ist, steht „(nach Blatt X, nicht nachgelesen)". Leser-Zahlen: `node v3/zaehl-faellt.cjs` → `v3/zaehl-faellt.log`
(333 Dateien *.js/*.cjs/*.mjs ohne node_modules, vendor, spec, p3; Kommentar-Treffer zählen mit und sind im Log sichtbar).

Gelesen: v3/ ganz (vier Zensus-Blätter, drei Skripte, drei Logs), v2/entscheid-v2.md §0 und §4, v2/pruefung-spike-v2.md,
v2/pruefung-quelle-v2.md, entscheid.md §0, tafel.md (Gliederung, D2/D6), spike/gesetz-proto.cjs:40–114, das Person-Gesetz
`git show 90b6950d:vision/person/gesetz.md` (lokal vorhanden). Nicht gelesen: der Zweig `bau-oeffnungen` (kein git), `v3/quellen-los-haus.md`
(existiert noch nicht — §3 ordnet darum nur Themen zu, gefüllt ist keine Lücke).

**Die Kette (Entscheid des Koordinators, bindend):** Plan (Straßen-Klasse, Markt) → LOS (Absteckung: Breite, Tiefe, Ecke, Hang) →
Stand und Gewerbe des Loses (aus seiner LAGE) → HAUSHALT (Person-Gesetz, Funktion der Adresse) → HAUS (Breite aus dem Los, Geschosse
aus Straßen-Klasse und Stand, Tiefe und Tragwerk aus Bedarf und Spannweite, Sockel aus dem Hang). Kein Schritt läuft rückwärts.
Das Tragwerk fügt sich dem Grundriss.

---

## §0 WAS NICHT STEHT (Lücken der Struktur und Widersprüche der Befunde)

1. **Vier der zehn SOLL-Zahlen hat kein v3-Skript.** S2 (Ständer in Tür/Treppe), S8 (Vielfalt), S9 (Grundriss gültig) und S10 (Preis)
   zählen nur Skripte der Runde 2, und die lesen den PROTOTYP, nicht das Haus des Kerns: S2 `v2/spike/linse-v2.cjs` und
   `zaehl/pruef-spike-v2.cjs` (am Grundriss A), S8 `zaehl/richter-kopplung.cjs` / `zaehl/vielfalt-zweit.cjs` (Maß wie
   `v2/spike/stadt-b.cjs:110`), S9 `v2/spike/spike-v2.cjs` (über `grundrissVon` des Prototyps), S10 kein Skript. „Ohne Umbau zählen"
   geht für diese vier nicht. §4 nennt je Zahl das Feld, das das Gesetz liefern muss, und §6 G4 den Zähler, der vorher fehlt.
2. **S3 und S5 zählen HEUTE durch einen Nachbau der heutigen Kette — am Gesetz zählen sie nicht ohne Umbau.** zaehl-los.cjs:307–344
   rechnet W0 KULTUR → W1 Jitter (FC:2208) → W2 × (0,84 + 0,30·wohl) (FC:4439) → W3 Rollen-Zeile nach und prüft W3 = hp.W
   (zaehl-los.cjs:320); zaehl-hoehe.cjs:88–110 ebenso S0 … S3 für die Geschosse. Fallen diese Zeilen (§2), trifft der Nachbau nicht mehr,
   die Zerlegung ist leer. Das Gesetz muss die Zerlegung selbst liefern: je variierender Größe die benannten Schritte mit ihrem Beitrag
   und ihrem Samen (Feld `hp.schritte`, §4 S3/S5). Der Zähler daraus ist ein Block, kein Nachbau — aber er ist ein Umbau.
3. **S4 schließt „kein Raster" nicht aus.** Das Band κ 0 … 0,53 beginnt bei 0 = so viel wie der Zufall; heute steht κ bei −0,04, also
   0,04 unter dem Band. Ein Los ohne jedes Modul, das nur leicht vom Zufall abweicht, besteht S4. Der Zensus nennt dazu Ziel 0,27 und
   zugleich R in 0,534 … 0,788 (zensus-absteckung.md §d). Außerdem hängt κ an der Einheit: zaehl-los.cjs liest `EINHEITEN` (Edinburgh
   7,32 m als Vorgabe); das Gesetz muss seine Einheit nennen (L1), sonst misst S4 gegen eine fremde.
4. **S6 ist eine Reihenfolge, keine Zahl.** Kein Skript prüft „die Lage ist VOR dem Stand gerechnet". Zählbar wird es nur, wenn der Stand
   als Feld neben seinem Eingang reist (`hp.stand`, `hp.lage.abstandMarkt`, `hp.lage.klasse`) und ein Zähler den Stand aus der Lage
   byte-gleich nachrechnet. Heute liest zaehl-los.cjs `wohl` (ρ(wohl, Abstand Markt) −0,48, zensus-los-haushalt.md §b).
5. **Hang ist in node nicht zählbar, und der Hang muss vor dem Haus stehen.** `exportSettlement` rechnet ohne `dp.hoehe` eben
   (FC:9795–9797). Die Hang-Klasse entsteht erst in `ortPlan` im Faden (FC:11110–11112, Export in den Slot FC:11177), also NACH dem Haus;
   kein Leser im Haus (zaehl-faellt.log „slot.hang": 0 Leser im Bau; die zwei Treffer in worlds/gelaende/studio.js:363, 386 sind eine
   andere Größe). Mit Ort trägt der Export das Höhen-Raster schon heute: `dp.ort` holt vor dem Export `dp.hoehe`
   (stamm/siedlung-ort.js:259–287), und der Straßen-Graph liest es (`trasseLenk`, FC:5269). Der Hang kann also im Glied LOS gelesen
   werden, an derselben Stelle wie die Trasse. Offen: ob der Export, den der Wirt nach der Ort-Wahl neu rechnet („am Ort der Ort-Wahl neu",
   FC:9650), derselbe ist, dessen ov das HAUS baut — nicht nachgelesen. Ohne Ort (Labor, Akt) ist der Grund eben; das ist dann die
   Wahrheit des Rasters, kein Fallback, solange das Feld „eben" heißt und nicht „unbekannt".
6. **Ecke: zwei Definitionen, keine im Kern.** Der Zensus zählt 56,0 % (Fahrbahnrand ≤ 3,5 m) oder 33,9 % (≤ 1,5 m) — eine Lesart
   (zaehl-los.cjs:38, 185–193). Stufe 1 hält 9 m am Kanten-Anfang frei, „die Ecke gehört dem letzten Haus der Kante davor"
   (`eckeM`, FC:4072, 4091–4092) — eine dritte. Das Gesetz muss die Ecke im Plan definieren (das Los am Knoten zweier Wege), sonst
   schwankt S7 mit der Lesart um den Faktor 1,65.
7. **Die Straßen-Klasse existiert im Plan — aber als Wachstums-Generation, nicht als Rang.** Der Zensus Höhe nennt es „nicht gelesen"
   (zensus-hoehe.md:115). Gelesen: jede Kante trägt `gen` (0 Stamm FC:5280, 1 Querverbindung FC:5322, 2 Gasse/Vorstadt FC:5393, 5425,
   5467, 5477), dazu `w`, `quer`, `gasse`, `vor`, `treppe`. Das ist die Reihenfolge des Wachsens, nicht die Klasse einer Ordnung
   (London 1667: high street / street of note / by-lane). Die Zuordnung ist eine Lücke (L15), keine Rechnung.
8. **Wort nH gegen Zahl der Lose.** Heute ist die Zahl der Lose das Wort von DORF (FC:4415, 4420), und der Plan wächst danach:
   Mauer-Radius Rw = 26 + 8,4·√nG (FC:5364), Kanten-Zahl aus nGestalt (FC:5281). Stufe 1 rechnet die Zahl aus der Front:
   n = ⌊frei / platzM⌋ je Blockkante (FC:4092). Unter der Kette (Los aus Absteckung) folgt n aus Front ÷ Los-Breite. Welche der zwei
   Regeln bleibt, ist nicht entschieden. Folge für das SOLL: „an denselben 2 595 Losen" (S1, S8) setzt n = nH voraus; ändert die
   Absteckung n, ist die Menge eine andere (§6 G6).
9. **Ein Klassen-Gefälle der Geschosse steht gegen S8.** London 1667 setzt by-lanes auf 2 Geschosse, nichts auf 1 (zensus-hoehe.md:78).
   Die Traufe-Spanne 4,70 m hält nur, solange ≥ 10 % der Häuser 1 Geschoss haben (heute 13,6 %, zensus-hoehe.md:14–17). Liest das Gesetz
   die Klasse nach London, fällt das eingeschossige Haus weg, außer der Stand (arm) bringt es zurück. Ob S8 hält, hängt dann an L16.
10. **Gesinde ist Annahme, und das Person-Gesetz liest es als Datum.** Person §2: „Plätze = `haushalt(gewerbe, klasse).gesinde`" und
    „Die Gesinde-Zahlen bleiben Datum des Bau-Gesetzes". In spike/gesetz-proto.cjs:50–56 tragen 7 der 11 Gewerbe-Zeilen das Wort
    „Annahme". Das Datum der Naht ist zu sieben Elfteln keins (L10).
11. **„Klasse" (Person) und „Stand" (Koordinator) sind zwei Namen.** Person liest `klasse`; die Kette sagt „Stand". Es darf EIN Feld sein;
    das Blatt nennt es `stand` und setzt `klasse ≡ stand` an der Naht (§5). Wer die Stufen zählt (2? 3? 4 wie die Wohl-Stufen des Zensus),
    steht nirgends (L7).
12. **Sonderbau ist nicht abgegrenzt.** S5 lässt die Tafel-Zeile der Rolle nur beim Sonderbau stehen, Person sagt: Sonderbau trägt keinen
    Haushalt. Die Liste ist eine Spike-Annahme (gesetz-proto.cjs:68: kirche, burg, scheune, halle, turm, rathaus, kapelle, bergfried,
    torhaus, zeughaus, speicher, zunfthaus). Wohnturm (6 Geschosse, FC:2199) und Patrizierhaus (≥ 3, FC:2200) stehen dort NICHT — sie
    tragen einen Haushalt (gesetz-proto.cjs:66 ordnet ihnen `kaufmann` zu), also fällt ihre Höhen-Zeile unter S5. Ob der Wohnturm ein
    Sonderbau ist (der Geschlechterturm als Wehrbau), ist eine Entscheidung, kein Datum.
13. **Der Würfel-Anteil der Breite hat drei Rechnungen; S3 nennt eine.** 66,0 % = kontrafaktisch ohne Jitter + Kultur-Würfel
    (zaehl-los.cjs:333), 68,6 % mit Wohl-Würfel, 79,9 % exakte Zerlegung (zensus-absteckung.md §1). S3 → 0 verlangt, dass ALLE drei
    Würfel fallen; gemessen werden muss darum mit der vollen Zerlegung (Feld `hp.schritte`), sonst bleibt der Wohl-Würfel unsichtbar.
14. **Die Traufe hat heute zwei Regeln.** Nah: 0,55 + 2,55 + 2,35·(st − 1) (FC:178, 211–215; bei st 3: 7,80 m). Fern: st·2,7 + 0,5
    (STADT_MASSEN FC:4072, `hausMasse` FC:4120; bei st 3: 8,60 m). Das ist ein Zwilling der Höhe zwischen den Stufen (§5 Ferne).
15. **Der Tragwerks-Zähler sieht Balken längs x nicht** (zensus-haus-tragwerk.md, Leser-Grenze) und prüft nicht, ob unter einem
    Unterzug Ständer bis zum Grund stehen. Beides braucht S1 (§4).
16. **Bahn 1 ist nur aus dem Entscheid bekannt.** Der Zweig `bau-oeffnungen` ist nicht gelesen; die Naht in §5 steht auf
    entscheid-v2.md §4.2/§4.3 und pruefung-quelle-v2.md K1–K6.
17. **Der Stoff des Orts existiert auf main nicht.** `bauOrt` hat 0 Treffer als Feld (Grep: nur `bauOrtWrap` FC:3499 und
    `_erdbauOrtFaellt` stamm/gelaende-boden.js:493 — andere Größen). Das Tragwerk braucht die Holzart (L_max), die Kette nennt sie nicht.
    Ohne sie hat Glied 7 keinen Welt-Eingang (§1).
18. **Moderne, Ringe, Erbe und Chronik sind nicht gezählt.** Alle Zensus-Zahlen sind Pläne G (Gründung ≤ 1549, nH 90, alle ummauert).
    Die Würfel FC:4431 (Ersatzbau), 4437 (Ring-Breite), 4440–4443 (Stadtkörper), 4453–4460 (Moderne, Gewerbe-Halle) und die Höhe aus dem
    Erbe FC:4491–4495 wirken dort nicht. §2 nennt sie; ihr Anteil ist unbekannt.

---

## §1 DIE KETTE (elf Glieder)

Heutige Reihenfolge im Export (nachgelesen): `exportSettlement` FC:9722 → **DORF** FC:9733 (alle Häuser, ihr Wohlstand, ihre Rolle,
FC:4403–4517) → **Hülle** je Haus `massBauExport` FC:9776–9794 → **dorfLayout** FC:9825 (Plan, Straßen, dann die Lage jedes Hauses,
FC:5357 ff.) → `reihenSnap`, `brandwand` FC:9826–9828 → im Faden **ortPlan** (Boden, Spanne, Hang-Klasse FC:11109–11112, Platte
FC:11114–11123) → HAUS je Slot aus dem ov. Rückwärts heißt: ein Glied liest eine Größe, die in dieser Reihenfolge NACH ihm entsteht,
oder eine frühere Größe wird nachträglich nach einer späteren umgebaut.

Welt-Eingänge (zulässig): Gelände H(x, z) (`dp.hoehe`, FC:9797), Wasser (`nassAm`, FC:5503), Stoff des Orts (fehlt, §0.17), Epoche,
Region und Jahr (DORF FC:4405–4414), Same der Siedlung (DP.seed), Größe der Stadt (nH).

| # | Glied | Eingänge (nur frühere Glieder oder Welt) | Ausgänge (Feldnamen) | HEUTE (Funktion · Reihenfolge · rückwärts?) | Eingang im Spiel |
|---|---|---|---|---|---|
| 1 | **Plan** | Größe nH, Region, Jahr, Epoche, Same, Gelände H, Wasser | `kante.klasse` (L15), `kante.w`, `platz` {cx, cz, ex, ez}, `mauer.Rw`, Knoten | `strassengraph` FC:5262 ff., gerufen in `dorfLayout` FC:5365 — NACH DORF. Rw aus nG FC:5364, Kanten-Zahl aus nGestalt FC:5281: der Plan liest die Haus-ZAHL (nicht ihre Form) | Kante: `gen`, `w`, `quer`, `gasse`, `vor` vorhanden (FC:5280, 5322, 5393, 5425, 5467, 5477); Klasse als Rang **fehlt** (§0.7); Markt `platz` vorhanden |
| 2 | **Los** (Absteckung) | Plan (Kante, Knoten, Klasse, Mauer), Gelände H unter dem Rechteck, Modul der Absteckung (L1) | `los.adresse` (Plan, Kante, Seite, Nr.), `hp.losBreite`, `hp.losTiefe`, `hp.ecke` (Seite x0/x1 oder null), `hp.hang` {spanne, richtung}, `los.abstandMarkt`, `los.klasse` | **gibt es nicht.** Die Stelle ist die Folge der Hülle: `tryPlace` FC:5487–5533 setzt die Hülle an die erste Stelle, an der sie passt; Folge = Index FC:5560–5562, Metrik edepth·34 + cur + Würfel FC:5590–5600; Fuge gewürfelt FC:5530; Schritt 1,1 m FC:5532. **Rückwärts:** das Los folgt dem Haus. `plan.lose` nur mit Chronik FC:4501–4504. Stufe 1 hat eigene Lose (`breit = frei/n` FC:4092–4094) | Los-Breite/-Tiefe **fehlen** als Feld (zaehl-los.log Z. 9: 0 von 2 595); Ecke **fehlt**; Hang-Klasse vorhanden, aber erst FC:11112 nach dem Haus; Spanne lokal, nicht exportiert (FC:11110–11111) |
| 3 | **Stand und Gewerbe** | Los: `abstandMarkt`, `los.klasse`, `losBreite` (Zins nach Breite, L8), Anker der Viertel im Plan (Markt, Kirche, Wasser, Tor) | `hp.stand` (≡ Person `klasse`), `hp.gewerbe`, `hp.sonderbau` (bool) | Stand: `wohl` = (1,22 − 0,5·t)(0,78 + 0,44·rnd), t = Index FC:4429, 4438; arm FC:4447. Gewerbe/Rolle: Viertel nach Index FC:4383–4386, Grund-Satz Los 1 / ⌊0,62n⌋ FC:4323, 4386, 4468, Patrizier/Wohnturm nach wohl FC:4340, alles in `stadtViertel` FC:4376–4401 VOR der Lage. **Rückwärts gegen die Kette:** die Lage entsteht danach; nur der Viertel-Name folgt der Lage (vorstadt, hafen FC:5607–5608) | Lage (`slot.x/z`, Platz) vorhanden, aber nach dem Stand; Stand **fehlt** als Feld (heute `wohl`); Gewerbe **fehlt** (heute `rolle`, Tafel) |
| 4 | **Haushalt** | Adresse = Los (Gewerbe, Stand, Baujahr), Same | `haushalt(gewerbe, stand)` → {gesinde}; aus Person §2: Paar, Kinder je Zeit t; `hp.leute` (Bemessung, L11) | **keiner vor dem Haus.** Jeder Welt-Ruf `bauRezept(…, null, …)` (FC:4436, 4381, 4398, 4450, 4462, 4468, 4473); `bauProgramm` FC:2229/2245 läuft in DORF nie. Die Köpfe folgen dem Haus: `leuteVon` FC:9527–9538 aus W·D·st·wohl; der Wirt liest sie stamm/siedlung-bewohner.js:839, Körper :848 | `haushalt`/`GEWERBE` nur im Prototyp (gesetz-proto.cjs:45–57, 99–102), nicht im Kern; **fehlt** |
| 5 | **Haus-Hülle** | Los (`losBreite`, `losTiefe`), Klasse, Stand, Haushalt (Bedarf), Stoff (Spannweite, über Glied 7), Bauweise der Region/Ära (L29) | `hp.W`, `hp.D`, `hp.storeys`, `hp.traufe`, `hp.schritte` (§0.2) | `_bauweiseWurf` FC:2204–2210 (pitch/W/D/st aus KULTUR + Würfel, Klemmen 5–15/4–11/1–12), Kultur-Würfel im Pool FC:4435, Ring-Breite FC:4437, Wohl × Breite FC:4439, +1 Geschoss FC:4444, Maß-Zeile der Rolle FC:2227–2228 über FC:4382, Erbe-Höhe FC:4491–4495; Traufe FC:211–215. **Rückwärts:** die Hülle wird gebaut, bevor es ein Los gibt; mit Chronik schrumpft der frühere Bau nachträglich ins spätere Los (PASSUNG FC:9780–9791) | Klasse **fehlt** (§0.7); Stand **fehlt**; Los **fehlt**; Bedarf **fehlt** |
| 6 | **Grundriss** | Hülle, Haushalt (Programm), Gewerbe (Räume), Ecke (Eingang an der Flanke) | Räume je Geschoss, Treppe (Lage, Lauf, Podest), Türen, Herd; `HAUS.dims.zonen` (für S2, §4) | Raumteilung `layout` FC:606–617 mit Würfel `rndI` FC:598–605; Schnitte nur auf Ständerachsen `bz` FC:609–613; Flur aus W·0,15 FC:261; Treppe im Flur, Lage aus dem Samen `shaftCX` FC:370; Herd aus Samen FC:586–592; Innenwände FC:897–917. **Rückwärts:** der Raum folgt dem Raster (FC:609), nicht das Raster dem Raum | Haushalt **fehlt**; das Programm `BAU_NUTZUNG.raeume` steht nur für `wohnhaus` (FC:2183) |
| 7 | **Tragwerk** | Grundriss (Raumwände, Treppenloch, Türen), Hülle, Holz des Orts (L_max, L20/L21) | Balkenlagen mit Richtung, Unterzüge, Innenständer, Wechsel als Meshes in `subsystems.geruest`; `HAUS.P.balkenB/H` | `geruest` FC:458–474: Ständer nur im Außenring `postsRing` FC:451–454, Balken auf jeder Achse `bx = axis(W/2,[−fw,fw])` FC:418–422 (Teilung `bayMax` 1,7 FC:181, 420), jeder Balken über die volle Tiefe `layJoists` FC:466–470, Loch ohne Wechsel `clipSpanZ` FC:357–359. Kein Unterzug, kein Innenständer. 2 522 von 2 595 Häusern über L_max (zensus-haus-tragwerk.md) | Holzart des Orts **fehlt** (§0.17); Querschnitt 0,15 × 0,21 fest FC:179 |
| 8 | **Sockel** | Los `hp.hang` (Spanne und Richtung unter dem Rechteck), Hülle, Grundriss (Keller-Bedarf) | `hp.sockel` {talseite, hoehe}, `hp.untergeschoss` (bool), Boden y der Straßenseite | fester Sockel `foundH` 0,55 FC:178, `baseY` FC:211, Platte 25 cm vor der Wand FC:426–449; Keller fest 2,40 m FC:212–213, gewürfelt 35 % FC:4446; `terrain:0` FC:4436 → `gelaende()` leer FC:1488. Das Gelände passt sich dem Haus an: Platte mit Saum FC:11114–11123, Erdbau (gelaende-core.js:2085–2094, nach zensus-los-haushalt.md, nicht nachgelesen) | Gelände vorhanden (dp.hoehe, ctx.hoehe); Hang-Klasse vorhanden (FC:11112) **ohne Leser**; Richtung **fehlt** |
| 9 | **Öffnungen** | Grundriss (Räume, Türen), Tragwerk (Felder zwischen Ständern), Ecke (Flanke an der Straße), Brandwand (Nachbar) | `WALLS[].win` {cy, ch, wd}, `WALLS[].type` (door/window/wand), Schau-Seiten | `wallSpec` FC:477–497: Felder zwischen Achsen, Fenster symmetrisch, Takt gewürfelt FC:479, Tür nur vorn FC:488, kein Fenster an ±fw FC:478; Brandwand FC:502–504 liest `hp.brandwand` — **der einzige heutige Leser der Lage im Haus** (geschrieben nach dem Layout FC:9503–9516, 9828). Flügel, Glas: Bahn 1 (FC:1080–1097) | Brandwand vorhanden; Ecke **fehlt** |
| 10 | **Dach** | Hülle (D, W), Stoff des Orts (Deckung, Schnee), Tragwerk (Spannweite der Sparren) | Neigung, Dachform, Sparren-Querschnitt, Firstpfette | Neigung KULTUR ± Würfel FC:2207, geklemmt an `grenzNeigung` FC:208, 2230; `ROOFMODE` FC:217; Sparren 10 × 10 (`P.spar` FC:180, `strut` nach zensus-haus-tragwerk.md FC:297–298); `sparH` 0,15 hat 0 Leser (zaehl-faellt.log) | Deckung je Stil vorhanden (STIL_GRENZNEIGUNG FC:160–208, nach tafel.md); Schnee am Ort **fehlt** im Haus |
| 11 | **Zeit / Geschichte** | Gründung des Plans, Epoche der Region, Adresse (Samen), Los | `hp.baujahr`, Ereignisse des Loses (Teilung, Zusammenlegung, Aufstockung, Ersatzbau), je als benannter Schritt mit Samen aus der Adresse | Baujahr = jahr + spanne·t·(0,55 + 0,45·rnd) FC:4433 (Index + Würfel); Ringe `chronikJahr` FC:4430; Ersatzbau-Würfel 12 % FC:4431, früherer Bau `fr[]` FC:4450, geklemmt ins Los des jüngeren FC:4395, 4477; Schnitt der Chronik FC:4501–4504. Aufstockung, Teilung, Zusammenlegung **gibt es nicht** | Baujahr vorhanden (aus Index); Ereignisse **fehlen** |

**Was die Kette am Grundriss-Tragwerk verlangt (Wortlaut des Entscheids, als Struktur):** tragende Linien liegen auf Raumwänden;
wo eine Spannweite L_max übersteigt, tritt ein Unterzug, ein Innenständer oder ein Wechsel ein — als liegendes Holz in
`subsystems.geruest`; ein Ständer steht nie in Tür, Lauf oder Podest als Zwang (Zwang wäre: die Tür setzt die Achse, so dass der Test
leer misst — pruefung-spike-v2.md (3)). Damit liest Glied 7 Glied 6 und nie umgekehrt; Glied 9 liest beide.

---

## §2 WAS FÄLLT (beim Namen; Leser aus `v3/zaehl-faellt.log`)

„Leser" = Trefferzeilen außer der Definition. Bei Ausdrücken ohne eigenen Namen (Würfel in einer Zeile) ist die Zahl 0; ihr Ergebnis
lesen die Felder, die in der Spalte stehen.

| # | fällt | datei:zeile | Leser | an seine Stelle tritt |
|---|---|---|---|---|
| F1 | `tryPlace` in der Rolle „die erste Stelle, an der die Hülle passt" | FC:5487–5533 | 3 (Rufe FC:5602, 5604; Kommentar FC:5549) | Glied 2: die Absteckung teilt die Kante in Lose; das Haus steht im Los. Die Prüfungen Mauer, Wasser, Weg-Freihaltung, Friedhof (FC:5502–5518) werden Bedingungen des LOSES |
| F2 | Folge der Lose = Los-Index, Zeiger-Metrik edepth·34 + cur + rnd·2 | FC:5560–5562, 5590, 5594, 5600 | `edepth` 14, davon 3 im Setzer (5590, 5594, 5600); die übrigen 11 bauen den Graph und bleiben | Glied 2: Lage aus Plan (Kante, Klasse, Abstand zum Markt); die Gründungsfolge wird Glied 11 (Ereignis), nicht Lage |
| F3 | Fuge gewürfelt und Schritt 1,1 m | FC:5530, 5532 | 0 (Ausdruck in `cu.cur`) | Glied 2: Fuge = Rest der Teilung bzw. Traufgasse/Brandwand (L12) |
| F4 | Setzer-Jitter zur Straße `jitAmp` | FC:5361, 5494 | 3 (5494, 5515, 5706) | fällt ersatzlos in der Stadt (0,05 m); außerhalb: Bauflucht des Plans (L30) |
| F5 | Wohlstand-Würfel | FC:4438 | 0 als Ausdruck; das Feld `.wohl` lesen 9 Zeilen (u. a. FC:4340, 4483, 4512, 9533, Chronik FC:4262, 4295; Labor und diag-settlement je 1) | Glied 3: `hp.stand` aus der Lage (L7) |
| F6 | Wohl-Stufe +1 Geschoss | FC:4444 | 0 | Glied 5: Geschosse aus Klasse und Stand (L14, L16) |
| F7 | Kultur-Würfel im Pool | FC:4435 (`poolAt` FC:4424 bleibt, 6 Leser: Region × Ära ist Ursache) | 0 | Glied 5: Bauweise des Loses aus Region × Ära ohne Würfel (L29) |
| F8 | Maß-Jitter W/D/st/pitch in `_bauweiseWurf` | FC:2204–2210 | 1 (FC:2225 `bauRezept`; dieser hat 18 Leser, darunter PRESETS FC:5775 und gate:fachwerk-contract scripts/diag-fachwerk-contract.cjs:98 — §5) | W Glied 5 aus dem Los; D aus Bedarf/Spannweite; pitch Glied 10; Messfehler der Rute nur als benannter Schritt (L5) |
| F9 | Doppel-Klemme der Breite 5–15 | FC:2208, 4439 (×(0,84 + 0,30·wohl)) | 0 | fällt ersatzlos: die Verteilung der Breite ist die der Absteckung (L3) |
| F10 | Ring-Breite „Parzellen-Gedächtnis" | FC:4437 | 0 | Glied 2 (Kern schmal ist eine Frage der Absteckung, L3/L4) |
| F11 | Maß-Zeilen der Rollen mit Haushalt in `BAU_NUTZUNG`: gasthaus FC:2184, schmiede 2185, kaufhaus 2187, kontor 2188, pfarrhaus 2190, werkstatt 2195, backhaus 2196, gerberei 2198, wohnturm 2199 (§0.12), patrizierhaus 2200 — die Ops auf W, D, storeys | FC:2184–2200, angewandt FC:2227–2228 | `BAU_NUTZUNG` 7 (Code FC:2222, 2223, Export 12480, scripts/diag-settlement.cjs:711) | W, D, st: Glied 5. Form-Ops (arkade, vorkragung, veranda, balcony, annexN): L31. Es bleiben die Zeilen der Sonderbauten (rathaus 2186, zunfthaus 2189, kapelle 2191, bergfried 2192, torhaus 2193, zeughaus 2194, speicher 2197) |
| F12 | Rolle nach Index: Viertel nach Los-Nummer, Grund-Satz Los 1 / ⌊0,62n⌋, Patrizier/Wohnturm nach wohl ∧ Index | FC:4383–4386, 4323, 4468, 4340 | `stadtViertel` 1 (FC:4487); `STADT_GRAMMATIK` 15 bleibt als Tafel der Anker | Glied 3: Gewerbe aus der Lage (L9) |
| F13 | Keller-, Anbau-, Balkon-, Grundriss-Würfel, arm-Schwelle | FC:4446, 4448, 4449, 4447 | 0 je | Keller: Glied 8 + Gewerbe (L28); Anbau, Grundriss I/L: Glied 6 aus Programm und Los; Balkon: Glied 6 (Programm) oder ersatzlos; arm: Glied 3 |
| F14 | Ersatzbau-Würfel 12 % | FC:4431 (+ `fr[]` FC:4450) | 0 | Glied 11: Ereignis mit Samen aus der Adresse (L6) |
| F15 | Stadtkörper-, Downtown-, Gewerbe-Würfel | FC:4440–4443, 4453–4460 | 3 | Glied 11 (Neubau der Moderne als Ereignis) — nicht gezählt (§0.18) |
| F16 | Höhe aus Tiefe und `breitMax` nur mit `DP.erbe` | FC:4491–4495 | `STADT_FORM` 20 (die Ton-, Kern- und Mauer-Zeilen FC:3895–4027 bleiben) | Glied 5: Traufe nach Straßenbreite als Datum (L17) |
| F17 | `terrain:0` als „das Haus kennt kein Gelände" | FC:4436, 4399, 4473, 4483, 5815; Leser FC:1488 | 9 | Glied 8 liest `hp.hang`. Die Vertrags-Grenze „die Welt trägt den Boden" (FC:50) bleibt: das Haus baut keine Wiese, es liest den Hang |
| F18 | fester Sockel 0,55 m | FC:178, 211, 426–449 | `foundH` 8 | Glied 8: Sockel aus der Spanne unter dem Rechteck (L24) |
| F19 | durchlaufender Deckenbalken | FC:466–470 | `layJoists` 1 (FC:473) | Glied 7: Balken zwischen tragenden Linien, Unterzug/Innenständer |
| F20 | Loch ohne Wechsel | FC:357–359, 469 | `clipSpanZ` 1 | Glied 7: Wechsel am Lochrand |
| F21 | Balken auf jeder Ständerachse ±fw, Teilung bayMax | FC:418–422, 181 | `bayMax` 2 | Glied 7 aus Glied 6 (Raumwände) |
| F22 | Raum-Schnitte nur auf Ständerachsen; Raum-Gewichte gewürfelt | FC:609–613; FC:598–605 | Schnitte 1; `rndI` 20, davon 1 im Programm (FC:601), 19 in Teilbauten und Möbeln ab FC:1100 (bleiben) | Glied 6 aus Haushalt und Gewerbe |
| F23 | Flur aus W·0,15, Treppe aus dem Samen | FC:261, 369–371 | `shaftCX` 1 | Glied 6 (Treppe aus dem Programm, Podest licht ≥ NORM.podest FC:254) |
| F24 | `sparH` ohne Leser | FC:180 | 0 | Glied 10: Sparren-Querschnitt aus der Spannweite (L23) oder ersatzlos |
| F25 | Flächenformel der Bewohner | FC:9532–9537 (`leuteVon`) | `leuteVon` 10 (Wirt stamm/siedlung-bewohner.js:460, 779, 839; scripts/lib/kreatur-mensch.cjs:390; Chronik FC:4512) | Glied 4: `hp.leute` des Haushalts (der Zweig FC:9531 liest es schon); die Rollen-Zahlen LEUTE_GESETZ.rolle FC:9526 bleiben für Sonderbau |
| F26 | `hp.parzelle` ohne Erzeuger | FC:2255 | 1 (Kommentar FC:2236) | Glied 2: `hp.losBreite`, `hp.losTiefe` |
| F27 | Packer `bauProgramm` (capK/capL/F0, W/D-Klammer) | FC:2245–2276 | 2 (FC:2229; Fingerabdruck scripts/diag-altlasten.cjs:955) | Glied 5/6: Hülle aus Los + Bedarf, Grundriss in der Hülle |
| F28 | zweite Traufe-Regel der Ferne | FC:4072 (`geschossM`, `sockelM`), FC:4119–4120 | `STADT_MASSEN` 5, `hausMasse` 2 | Glied 5 Ausgang `hp.traufe` (§5 Ferne) |
| F29 | Lose der Stufe 1 (`breit = frei/n`, erster passender Platz) | FC:4090–4106 | `kachelMassen` 13 (stamm/siedlung-wege.js:2061, 2075 u. a.) | Glied 2 auf der Blockkante der Kachel (§5 Ferne) |
| F30 | PASSUNG: früherer Bau schrumpft ins spätere Los | FC:9780–9791 | 7 | Glied 2 → 5: jeder Bau desselben Loses liest dasselbe Los |
| F31 | Los = Hülle (`massBauExport(…).ext` als `ext` des Layouts) | FC:9778–9779 | `massBauExport` 4 | die Hülle bleibt Geometrie; das Los kommt aus Glied 2 |

**Leser-Summe der fallenden Stellen: 118** (3 + 3 + 0 + 3 + 9 + 0 + 0 + 1 + 0 + 0 + 7 + 1 + 0 + 0 + 3 + 20 + 9 + 8 + 1 + 1 + 2 + 2 + 1 + 0
+ 10 + 1 + 2 + 7 + 13 + 7 + 4, mit F2 = 3 und F22 = 2). Darin stecken Namen, die nur teilweise fallen (STADT_FORM 20, BAU_NUTZUNG 7,
kachelMassen 13, leuteVon 10, massBauExport 4 — die Funktion bleibt, ihre heutige Rolle fällt). Würfel als Ausdruck zählen 0.

Nicht in dieser Kette (benannt, damit es nicht still fällt): Fenster-Takt und OG-Material gewürfelt (FC:479–480, Bahn 1/Stoff);
Herd-Strom `_chS` (FC:586, Grundriss gehört Glied 6, der Strom bleibt bis dort benannt).

---

## §3 DIE BENANNTEN LÜCKEN

Thema = Abschnitt des Quellen-Blatts `v3/quellen-los-haus.md` (A Absteck-Modul · B Los-Breite/-Tiefe mit Verteilung · C Lage ↔ Stand ·
D Haus auf dem Los · E Geschosse nach Ordnung · F Balken-Spannweiten · G Hang). Das Blatt existiert am 19.11. nicht; keine Lücke ist gefüllt.
Belege, die der Zensus schon nennt, stehen dabei (nur als Richtung, nicht als Wert für das Spiel).

| L | Größe | Einheit | Quelle, die sie tragen kann | heute im Code an ihrer Stelle | Thema |
|---|---|---|---|---|---|
| L1 | Modul der Absteckung (Einheit) je Region und Epoche | m | Gründungsurkunde, Parzellen-Aufnahme (Edinburgh 24 ft = 7,32 m, Thame 1 Rute 5,03 m, Freiburg Hofstätte 50 Fuß = 16,2 m — zensus-absteckung.md §c) | keine; Rundung ½ m FC:2208, 4439 | A |
| L2 | Teilungs-Brüche und ihr Anteil (¾ … 2½ Einheiten, halbe/drittel Hofstätte) | Anteil je Bruch | Parzellen-Aufnahme | keine | A |
| L3 | Verteilung der Los-Breite in einer Stadt (Quantile) | m | Kataster, Parzellen-Aufnahme (OS 1849–53 Edinburgh: nur Zusammenfassung) — Quantile nicht gefunden | Folge der Hülle FC:9776–9794 + Fuge FC:5530 | B |
| L4 | Los-Tiefe je Lage (Kern, Rand, Vorstadt) | m | Parzellen-Aufnahme (Thame bis 660 ft, Halb-Burgage 72 × 33 ft) | freier Grund bis zum Hindernis (Lesart zaehl-los.cjs:21) | B |
| L5 | Messfehler der Rute: Streuung des gemessenen Moduls | m oder % | Maß-Gesetze (Act 1824), Aufnahmen (Alnwick „about 14 foot") | Jitter ±1,1 m FC:2208 ohne Maß | A |
| L6 | Rate von Erbteilung und Zusammenlegung | Anteil der Lose je Jahrhundert | Steuerliste, Häuserbuch, Grundbuch (Stirling 1580, Edinburgh 1670er: Fälle) | Ersatzbau-Würfel 12 % FC:4431 (keine Teilung) | B |
| L7 | Stand je Lage: Anteile der Stände nach Abstand zum Markt und nach Straßen-Klasse; Zahl der Stufen | Anteil | Steuerliste nach Straße (Lay Subsidy 1332, Cirencester 1522: Richtung belegt) | `wohl` aus Index + Würfel FC:4438 | C |
| L8 | Breite ↔ Stand (Zins nach Front) | Zins je m Front | Zinsliste + Parzellen-Aufnahme (Cockermouth 1270: 4 d je Einheits-Los) | keine Kopplung (ρ +0,10, zensus-los-haushalt.md) | C |
| L9 | Gewerbe je Lage (Handel am Markt, Handwerk an Gasse/Wasser, Gasthof am Tor) | Anteil je Lage | Steuerliste nach Straße (London 1332), Zunftlisten | Viertel nach Index FC:4383–4386, Grund-Satz FC:4323 | C |
| L10 | Gesinde je Gewerbe und Stand | Köpfe | Zensus-Listen (Laslett, Kussmaul 1981) | 7/11 Annahme in gesetz-proto.cjs:50–56; im Kern nichts | C (Naht Person) |
| L11 | Bemessungs-Haushalt: für welche Köpfe das Haus gebaut wird (Paar + Gesinde bei Baujahr oder Höchststand des Hauslaufs) | Köpfe | Bauaufnahme + Nachlass-Inventar | Flächenformel FC:9532–9537 | D |
| L12 | Haus-Front ↔ Los-Breite: Füllgrad, Traufgasse, Torfahrt | m, Anteil | Bauaufnahme, Parzellen-Aufnahme | 3,4 % füllen das Los (zensus-los-haushalt.md Punkt 6); Torfahrt 3,5 m war in v2 gewählt | D |
| L13 | Haus-Tiefe ↔ Los-Tiefe (Vorderhaus, Hof, Hinterhaus) | m | Bauaufnahme | D aus KULTUR + Jitter, Klemme 4–11 FC:2209 | D |
| L14 | Geschosse je Straßen-Klasse | Geschosse | Bauordnung (London 1667: 2/3/4 belegt; Mitteleuropa fehlt) | +1 bei wohl > 0,9 FC:4444, Tafel KULTUR.st | E |
| L15 | Zuordnung der Kante des Spiels (`gen`, `w`, `quer`, `gasse`, `vor`) zur Klasse der Ordnung | Klasse | Bauordnung + Stadtplan derselben Stadt | keine (§0.7) | E |
| L16 | Geschosse je Stand bei gleicher Straße | Geschosse | Bauaufnahme, Steuerliste mit Hausbeschreibung | Wohl-Stufe FC:4444 | E |
| L17 | Traufhöhe ↔ Straßenbreite | m je m | Bauordnung (Paris 1783/84: Regel belegt, Zahl unsicher) | `STADT_FORM.stab` nur mit Erbe FC:4494 | E |
| L18 | Geschosshöhen je Ordnung und Epoche | m | Bauordnung (London 1667: 9/10/10½ ft), Bauaufnahme | egH 2,55 / ogH 2,35 fest FC:178; Ferne 2,7 FC:4072 | E |
| L19 | Aufstockung über die Zeit | Geschosse je Jahrhundert | Dendro-Bauaufnahme (Genf: Richtung) | keine | E |
| L20 | Holzart des Orts und Stamm-Durchmesser → Querschnitt, L_max | m | Holzbau-Norm (EN 1995) + Holz-Datum des Orts | Balken 0,15 × 0,21 FC:179; L_max im Zähler aus Eiche d 0,258 | F |
| L21 | Lasten Decke g, q, Dach | kN/m² | Lasten-Norm (EN 1991) | im Zähler gewählt 1,5 / 2,0 / 0,75 (zensus-haus-tragwerk.md „unsicher") | F |
| L22 | Lage von Unterzug und Innenständer gegen die Raumteilung | Lage | Bauaufnahme | keiner | F |
| L23 | Sparren-Querschnitt und -Abstand | cm | Bauaufnahme | 10 × 10 (`P.spar`), `sparH` ungelesen FC:180 | F |
| L24 | Spanne unter dem Rechteck → Sockelhöhe, ab wann Untergeschoss zur Talseite | m | Bauaufnahme (Guildford Undercroft, Chester Rows: Fälle) | foundH 0,55 FC:178; Klassen 1,5 / 4 m ORT_GESETZ FC:10005–10006 | G |
| L25 | Anteil der Hanghäuser mit Talgeschoss | % | Häuserbuch, Bauaufnahme — Anteil nicht gefunden | keiner | G |
| L26 | Was das Eckhaus anders trägt (zweite Schau-Seite, Laden, Erker) | Merkmal, Anteil | Bauaufnahme, Urkunde (Paderborn 1349, Freiburg 1517: Begriff belegt, Wert nicht) | keins (§0.6) | D |
| L27 | Wo die Haustür steht (Traufe/Giebel zur Straße) je Region | Seite | Bauaufnahme | Tür immer vorn FC:488 | D |
| L28 | Keller je Gewerbe, Stand und Hang | Anteil | Bauaufnahme | Würfel 35 % FC:4446 | D / G |
| L29 | Bauweise eines Loses im Pool von Region × Ära (statt Würfel) | Bauweise | Dendro-/Bauaufnahme je Region | Würfel FC:4435 | kein Thema des Quellen-Blatts (Stoff/Schule) |
| L30 | Bauflucht: Abstand Haus ↔ Straße außerhalb der Stadt | m | Bauordnung, Dorfaufnahme | `jitAmp` 0,2–0,9 FC:5361 | A |
| L31 | Gewerbe → Bauteil (Laden-Arkade, Laube, Vorkragung, Trockenboden) | Merkmal | Bauaufnahme | Ops in BAU_NUTZUNG FC:2184–2200 | D |
| L32 | Gründungsfolge / Wachstum der Stadt (welches Los wann besetzt) | Jahr | Stadtgeschichte (Conzen: Richtung), Urkunden | Index t FC:4429, Baujahr FC:4433 | kein Thema des Quellen-Blatts (Zeit) |

Keine Lücke ist hier mit einem Wert gefüllt. Die Dach-Neigung je Deckung (STIL_GRENZNEIGUNG) ist Stoff und steht nicht in dieser Liste.

---

## §4 §SOLL (wörtlich; je Zahl Zähl-Skript und Feld, das das Gesetz liefern muss)

| S | SOLL (Kopf BAU) | Zähl-Skript | Feld des Gesetzes · ohne Umbau? |
|---|---|---|---|
| S1 | Balkenlinien über L_max: heute 2 522 von 2 595 Losen (99 von 100) → 0, erreicht durch Unterzug/Innenständer/Wechsel als liegendes Holz in subsystems.geruest, NICHT durch ein größeres L_max; gezählt mit zaehl-balken.cjs, auch Balken längs x (Lücke des Skripts benennen). | `v3/zaehl-balken.cjs` | Meshes in `HAUS(…).subsystems.geruest`: Deckenbalken `P.balkenB × P.balkenH` lang in z; Unterzug/Wechsel lang quer (in x), Oberkante zwischen Balken-Unterkante − 0,25 m und Balken-Oberkante (zaehl-balken.cjs:118–129); `HAUS.P`, `HAUS.dims`. **Ohne Umbau, solange die Balken in z liegen.** Lücke des Skripts: eine Lage, die längs x spannt, sieht es nicht (ein Filter je Richtung fehlt); ob unter dem Unterzug Ständer bis zum Grund stehen, prüft es nicht |
| S2 | Ständer in Tür oder Treppe einschließlich Podest: ≤ 10 % nach Wortlaut (Runde 2: 12,5 % am Podest). | **keins in v3** (v2: linse-v2.cjs, pruef-spike-v2.cjs am Prototyp) | `HAUS.dims.zonen` [{art: tür · lauf · podest, x0, z0, x1, z1, geschoss}] — heute intern (`circR` FC:325, 355, 392, 905, nicht exportiert) — und Ständer als Meshes in `geruest`. Podest nach Wortlaut 0,9 m ab Wand-ACHSE, nicht licht (pruefung-spike-v2.md Punkt 1). **Umbau: Zähler neu** |
| S3 | Würfel-Anteil an der Los-Breite der WOHNHÄUSER derselben Stadt: heute 66,0 % → 0 % Varianz OHNE benannte Ursache; zufällige Ursachen der Wirklichkeit (Messfehler der Rute, Erbteilung, Zusammenlegung) sind erlaubt, wenn jede ein benannter Schritt mit Samen aus der Adresse ist und ihr Anteil einzeln gezählt wird. | `v3/zaehl-los.cjs` (Teil „Würfel-Anteil", :307–344) | `hp.losBreite` (LOS_FELD) und `hp.schritte.losBreite` = [{name, delta, samen}] — Zerlegung Cov(Δ, B)/Var(B) je Plan. **Umbau:** der Nachbau :307–344 trifft am Gesetz nicht (§0.2); ein Block, der `hp.schritte` liest. Rechnung = volle Zerlegung (§0.13) |
| S4 | Absteckung: κ im Band 0 … 0,53 (heute −0,04; Entwurf Runde 2: 1,0), gezählt mit zaehl-los.cjs über LOS_FELD. | `v3/zaehl-los.cjs` (ZAHL B, κ :352–360) | `hp.losBreite` bzw. `slot.ov.losBreite`; die Einheit des Gesetzes (L1) als Zeile in `EINHEITEN` oder als Feld `hp.losEinheit` (heute nicht gelesen → eine Zeile Umbau). **Sonst ohne Umbau.** Siehe §0.3 (0 = Zufall liegt im Band) |
| S5 | Geschosszahl: Varianz-Anteil reiner Würfel heute 22,3 % → 0 %; Straßen-Klasse ist ein Eingang (London 1667), Stand ist ein Eingang; die Tafel-Zeile der Rolle (heute 47,7 %) bleibt nur, wo die Rolle den Bau wirklich bestimmt (Sonderbau) — sonst fällt sie. | `v3/zaehl-hoehe.cjs` (Zerlegung :88–110) | `hp.storeys`, `hp.schritte.storeys` (klasse, stand, sonderbau, aufstockung), `hp.sonderbau`, `hp.lage.klasse`, `hp.stand`. **Umbau** wie S3 (Nachbau S0…S3 trifft nicht mehr) |
| S6 | ρ(Stand, Abstand zum Markt) hat einen Kausalpfad: die Lage ist VOR dem Stand gerechnet (heute wird die Lage nach der Höhe gerechnet). | `v3/zaehl-los.cjs` / `zaehl-hoehe.cjs` (ρ über Export-Lage ↔ `platz`) | `hp.stand`, `hp.lage.abstandMarkt`; Pfad: Nachrechnung stand = f(lage) byte-gleich (§0.4). ρ: ohne Umbau, wenn das Skript `stand` statt `wohl` liest (ein Name) |
| S7 | Ecke und Hang haben je mindestens einen Leser im Haus (heute 0): Ecke → zweite Schau-Seite; Hang → Sockel/Untergeschoss aus der Spanne unter dem Rechteck. | `v3/zaehl-los.cjs` (ECKE_FELD, HANG_FELD :37, 198–199; Vergleich Ecke/sonst :261–262) | `hp.ecke` und ein Haus-Ausgang, der es zeigt (`WALLS[].type` der Flanke ≠ heute); `hp.hang` {spanne, richtung} und `hp.sockel`/`hp.untergeschoss`. Ecke: ohne Umbau (die KS-Tafel liest Haus-Felder; ein Feld der Flanke muss dazu). Hang: **in node nicht zählbar** (§0.5) — Zähler in der Welt nötig (§6 G1) |
| S8 | Sichtbare Vielfalt an denselben 2 595 Losen ≥ heute: 440 Formen / 21 Breiten / Traufe-Spanne 4,70 m / häufigste Form ≤ 5,8 %. | **keins in v3** (v2: zaehl/richter-kopplung.cjs, Maß v2/spike/stadt-b.cjs:110) | `hp.W`, `hp.D`, `hp.storeys`, `hp.traufe` (die Traufe ist heute linear in st, zensus-hoehe.md Punkt 2; mit L18 nicht mehr). Menge §0.8. **Umbau: Zähler auf den Export** |
| S9 | Häuser ohne gültigen Grundriss ≤ 5 %. | **keins in v3** (v2: spike-v2.cjs über den Prototyp) | `hp.grundriss` {ok, grund} je Los (Signatur `grundrissVon` → {ok:false, grund}, entscheid-v2.md §1). **Umbau: Zähler neu** |
| S10 | Preis: Rezept je Haus ≤ 50 µs kalt (heute 0,6–4,2 µs warm/kalt) — Bedingung, kein eigener Punkt. | **keins** (heute gemessen in Runde 1, pruefung-spike Urteil 16) | ein Ruf je Los ohne Welt (`hausVonLos(plan, los)`), kalt und warm in einem Prozess. **Umbau: Messung neu** |

---

## §5 DIE NÄHTE

**Person-Gesetz** (90b6950d, lokal gelesen). Richtung:
- Person liest vom Bau die **Adresse = das Los** (Gewerbe, Klasse, Baujahr; Person §1) und **`haushalt(gewerbe, klasse).gesinde`**
  (Person §2). `kinder[klasse]` ist gefallen (Person §2, letzter Absatz). **Sonderbau trägt keinen Haushalt** (Person §1).
- Person liest vom HAUS (für den Tag, Person §5): Bett-Punkt im eigenen Los, Herd, Werk = das eigene Haus, beim Tagelöhner ein Werk-Los
  im Umkreis zweier Blöcke.
- Das Haus liest von Person: nur den Bemessungs-Haushalt (L11), und der folgt aus dem Hauslauf (Person §2), der seinerseits nur Adresse
  und Same liest.
- **Kein Kreis:** Los → Haushalt-Tafel (Bau) → Hauslauf (Person) → Haus (Programm) → Tag (Person). Der Hauslauf liest keine Geometrie
  des Hauses, der Tag liest sie. Würde der Hauslauf je die Kammerzahl lesen (wie viele Kinder ein Haus fasst), entstünde der Kreis
  Haushalt ↔ Haus — das Blatt schließt das aus.
- `klasse` (Person) ≡ `stand` (Kette), ein Feld (§0.11).
- `leuteVon(ov)` (FC:9527) bleibt der Name, den der Wirt ruft (stamm/siedlung-bewohner.js:839); die Flächenformel FC:9532–9537 fällt
  (F25). stamm/siedlung-bewohner.js:717–741 gehört der Person-Welle und ist hier nicht berührt.

**Bahn 1 Öffnungen** (aus entscheid-v2.md §4.2/4.3 und pruefung-quelle-v2.md K1–K6; Zweig nicht gelesen):
- Bahn 1 liest `WALLS[].win` {cy, ch, wd} (FC:494–495) und schreibt es nie (entscheid-v2.md §4.2). Das Gesetz schreibt WALLS aus
  Glied 6 und 7 (heute `wallSpec` FC:477–497).
- Das Gesetz liest von Bahn 1 nichts für die Kette. Für S7 Ecke braucht es, dass die Seitenregel `fensterAt(…, aus)` (Cherry-Pick
  5a5b53f37, entscheid-v2.md §4.3) die Flanke als Außenseite nimmt, wenn `hp.ecke` sie nennt — so wie heute `hp.brandwand` die Seite
  schließt (FC:502–504). `hp.ecke` und `hp.brandwand` sind dieselbe Art Feld (Lage → Seite), nur mit umgekehrtem Urteil.
- Öffnungen folgen dem Tragwerk (heute kein Fenster an ±fw, FC:478); im Gesetz folgen sie den Feldern von Glied 7.

**Erdbau / Gelände.**
- Richtung: Gelände H → `hp.hang` (Glied 2) → Sockel (Glied 8) → Platte/Erdbau. Heute ist die Richtung umgekehrt: die Platte legt das
  Gelände auf die Höhe des Hauses (FC:11114–11123), der Erdbau glättet (gelaende-core.js:2085–2094, nicht nachgelesen).
- Der Boden y der Straßenseite bleibt „die Gasse vor der Tür" (FC:11109). Das Untergeschoss steht zur Talseite.
- Der Erdbau darf die Spanne, auf die der Sockel antwortet, nicht wieder einebnen. Er muss `hp.sockel` lesen (die Talseite ausnehmen).
  Ohne das stünde der Sockel in der Luft oder im Grund.
- Die Sockelplatte am Hang ist eine Fund-Zeile (entscheid-v2.md §1 Punkt 9 (3)) und liegt im Erdbau, nicht in dieser Kette.

**Ferne / LOD** — dieselbe Kette in jeder Stufe, kein Zwilling:
- Stufe 1 (`kachelMassen` FC:4074–4114) hat eigene Lose: `breit = frei/n` und „erster Platz, dessen Tiefe die Traufe trägt"
  (FC:4092–4106, F29). Sie muss Glied 2 auf ihrer Blockkante rufen.
- Die Traufe der Ferne (`hausMasse` FC:4119–4120 mit `STADT_MASSEN.geschossM 2,7`, `sockelM 0,5`) ist eine zweite Regel (§0.14, F28).
  Ferne liest `hp.traufe` aus Glied 5.
- Die Fern-Masse der Stufe 2 (`planMassen` FC:4131–4137) liest W, D des ov schon heute — nur die Traufe nicht.
- Jede Stufe ruft dieselbe Funktion je Los; die Kosten tragen Schirm und Änderung (Preis S10 ≤ 50 µs je Haus).

**Worker-Kanal** (`bauOrt` ohne `?? Heimat`):
- Heute: der Wirt reicht `dp` an den Faden (`_foundryRequestSettlement` stamm/siedlung-ort.js:264), der Faden ruft `exportSettlement`
  (foundry-bruecke.js:249–250). `dp.ort` {x, z} holt vorher `dp.hoehe` (siedlung-ort.js:259–287).
- Die Welt-Eingänge der Kette reisen in `dp`: Gelände (`dp.hoehe`, da), Epoche (`dp.epoche`, da), Same (da), Stoff des Orts (`bauOrt`,
  **fehlt** auf main, §0.17).
- Ohne `bauOrt` wirft der Bau (entscheid-v2.md §4.1). Ein Preset mit `bauOrt: HEIMAT` als Datum ist derselbe Fallback in die Daten
  verlegt, sobald ein Welt-Slot ohne ov in die Heimat fällt (pruefung-quelle-v2.md Punkt 7, stamm/siedlung-ort.js:535–536). Das Gesetz
  verlangt: das ov jedes Welt-Slots trägt `bauOrt`; ein Slot ohne es wirft beim Namen.
- Die Asset-Goldens (gate:fachwerk-contract, scripts/diag-fachwerk-contract.cjs:98 ruft `bauRezept(…, null, LAB_SEED)`; PRESETS frieren
  dieselben Bytes FC:24, 5775) brechen, sobald F8 fällt. Das ist die erwartete Wirkung, kein Fehler; sie ist hier benannt.

---

## §6 WAS DER SPIKE v3 VORHER BRAUCHT, UND DIE REIHENFOLGE DER GLIEDER

**Grundlinie, bevor ein Spike fährt:**
- **G1 Hang-Zähler in der Welt.** Er liest je Ort das Ergebnis von `ortWahl` (voxel-worker.js:926 ff.) → `v2.slots[k]`. Seine Felder:
  `hang` (FC:11177), die Spanne neu aus `ctx.hoehe` über `rechteck(slot.obb)` (FC:11041, wie FC:11110–11111), die Richtung
  H(Frontmitte) − H(Rückmitte). Er druckt plattform/hanghaus/stelzen, Spanne Q10/50/90, Tal vorn/hinten, je Rolle, und die Kontrolle
  Δ Haus = 0 (W, D, st, foundH gleich zwischen den Klassen). Alternative ohne Welt: `exportSettlement` mit einem Höhen-Raster, wie das
  Labor es holt (worlds/fachwerk/fachwerk.js:234 `trasseAufWelt`) — dann gilt der Hang nur für diese Raster.
- **G2 Die Ecke.** Eine Definition im Plan (§0.6), und die heutige Zahl unter genau dieser Definition.
- **G3 Die 16 Vorher-Bilder** am main-Kopf (entscheid-v2.md §0 Punkt 6; Treiber p3/n1811/bau-bild, ungefahren).
- **G4 Die fehlenden Zähler am Haus des Kerns:** S2 (Zonen + Ständer), S8 (auf den Export), S9 (`hp.grundriss`), S10 (Ruf je Los
  kalt/warm). Jeder Zähler druckt erst den HEUTE-Wert. S2 heute am HAUS ist nie gezählt; `postsRing` spart nur die Haustür aus (FC:452).
- **G5 S3/S5 über `hp.schritte`.** Der Zähler liest die Schritte; die HEUTE-Zahl (66,0 % / 22,3 %) bleibt die des Nachbaus.
- **G6 Die Menge.** Dieselben 30 Pläne G (Saat 1–30, nH 90, pool.cjs:94–100). Ändert die Absteckung die Zahl der Lose (§0.8), gelten
  S1/S8/S9 als Anteile an der neuen Menge, und die Zahl der Lose je Plan steht neben dem Wort nH.
- **G7 Preis-Grundlinie:** `bauRezept` 0,6–0,7 µs warm / 2,7–4,2 µs kalt, DORF nH 90 0,71–5,2 ms (entscheid-v2.md §3, Runde 1) —
  im selben Prozess wie der künftige Ruf neu gemessen.

**Reihenfolge, in der die Glieder gebaut werden können** (jede Stufe ersetzt; keine läuft neben der alten; jede ist für sich am Bild
prüfbar):
1. **Plan:** `kante.klasse` aus L15 auf jeder Kante, der Markt als Ursprung des Abstands. Häuser byte-gleich. Bild: die Straßen nach
   Klasse eingefärbt (Blick-Sonde).
2. **Los:** die Absteckung teilt jede Kante. `tryPlace` fällt (F1–F4); das heutige Haus steht in seinem Los, Front an der Front des
   Loses. Gezählt: S4, der Anteil „Hülle überragt das Los", `hp.ecke`, `hp.hang` (wo ein Raster da ist). Bild: die Los-Grenzen in der
   Gasse.
3. **Stand und Gewerbe aus der Lage** (F5, F12). Gezählt: S6. Bild: die Viertel nach Gewerbe.
4. **Hülle aus Los, Klasse und Stand** (F6–F11, F16, F26, F27). Erste Stufe, die das Haus ändert. Gezählt: S3, S5, S8. Bild: die
   Gasse am selben Standpunkt wie G3.
5. **Haushalt und Grundriss in der Hülle** (Naht Person; F22, F23, F25). Gezählt: S9. Bild: Innenraum Stube/Kammer.
6. **Tragwerk aus dem Grundriss** (F19–F21). Gezählt: S1, S2. Bild: Dachboden und EG-Decke von unten.
7. **Sockel aus dem Hang, Schau-Seite aus der Ecke** (F17, F18; Naht Erdbau, Bahn 1). Gezählt: S7. Bild: ein Hanghaus von der Talseite,
   ein Eckhaus von der Seitenstraße.
8. **Dach aus Spannweite und Stoff** (F24). Bild: Dachwerk.
9. **Zeit:** Teilung, Zusammenlegung, Aufstockung, Ersatzbau als benannte Schritte mit Samen aus der Adresse (F14, F15, F30). Gezählt:
   S3 je Schritt einzeln. Bild: dieselbe Gasse in zwei Jahren.
10. **Ferne liest dieselbe Kette** (F28, F29). Gezählt: Traufe nah = fern je Haus. Bild: die Stadt vom Hügel.

S10 (Preis) ist auf jeder Stufe Bedingung.
