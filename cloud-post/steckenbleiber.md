# Steckenbleiber der Stadt — lokale Nachstellung, Wurzel, Schnitte (OMEN, 26.11.)

## Der Ruf, der den Knäuel lokal nachstellt

Die Kreatur-Linse Probe `bewohner` zeigt den Steckenbleiber der Stadt lokal NUR am Software-Adapter (wie die CI); am
Hardware-Adapter der GTX 1060 ist derselbe Kopf GRÜN (main 54b89949: steckenN 0, Roh `p3/n2411/wechsel/steck-vor.txt`).

Im Baum des Kopfs (Git Bash):

    LINSE_GPU=software node scripts/diag-kreatur-takt.cjs --proben bewohner

(`LINSE_GPU=software|hardware|karte`, `scripts/lib/software-gpu.cjs` `linsenGpu`; ohne Wort: CI=true → software, win32 lokal → hardware.)
Dauer an der GTX 258 s (bewohner 239 s). An OMEN als Grenz-Slot, nie neben einer Station:

    GRENZE_BAUM=<baum> bash p3/n2411/wechsel/grenze.sh <name> 1200 "<win-pfad>\p3\n2611\nah\eins.cjs" linse [selbst]

Ausgabe `p3/n2411/wechsel/<name>.txt` (Zeile `↳ Stadt: … Steckenbleiber …`, die Akte `steckAkte` im JSON der Probe), Fehler-Kanal
`<name>.txt.err`. `eins.cjs statik` fährt `npm run check:statik` (541 s).

Warum der Adapter den Lauf ändert, ist UNBELEGT: die Probe schreitet mit festem DT und ruft `_bewohnerWerkTakt(Infinity)`
(kreatur-proben.cjs:3908) — die Wanduhr des Werks ist im Lauf nicht im Spiel. Offen beim Namen.

## Die Fälle (alle am Denkmal der Stadt, Stände in der Reihe 660,3 · 661,5 · 662,7 · 663,9 · 665,1 / 428,2)

| Kopf | Adapter | Wortlaut |
|---|---|---|
| main 54b89949 | CI swiftshader (Job 139880992548) | 1 Steckenbleiber (kaufhaus #936614 um 18.44 Uhr bei 661.0/427.9 → 661.2/426.3 (1.6 m) · 3 Leiber um ihn, Wahl 0.37/0.60, Weg 1/2) |
| main 54b89949 | GTX hardware | GRÜN, steckenN 0 |
| 2789a879 (Schnitt 1) | GTX software | 1 Steckenbleiber (wohnhaus #91693 um 19.81 Uhr bei 662.2/428.4 → 663.9/428.2 (1.7 m) · 3 Leiber um ihn, Wahl 0.00/0.00, Weg 0/1) |
| 4bf92564 (Schnitt 1 + 2) | GTX software | GRÜN — bewohner · begegnung: Stadt steckenN 0, Wiederkehr 0 von 1424 (max 1,695 m), 260 s (`p3/n2411/wechsel/steck-zwei.txt`) |
| Kopf 6 d10695ec (Bündel + Schnitt 1) | CI swiftshader (Job 139967665921) | Steckenbleiber 0; NEU „Wiederkehr nach 1 h Abwesenheit: 5 von 1424 über ±2 m (max 11.513 m)“, alle an jaeger #773347 — am 2789a879 allein lokal 0 von 1424: im Bündel geboren, offen |

## Die Wurzel (aus den Akten gelesen)

Die Klasse: ein Leib WÄHLT einen Punkt nur gegen LEIBER, nie gegen die ZIELE der anderen — der Punkt ist frei, bis sein Besitzer kommt.

- Fall 1 (18,44 Uhr): kaufhaus #936614 trat beiseite (`_bewohnerPlatz`) auf 660,9/427,86 — 0,69 m neben dem Stand von rathaus
  #619833 (K = zwei Kapseln 0,71 m). Der kam, ruhte; der Punkt lag in seiner Kapsel, frei von jeder Wand und unerreichbar.
- Fall 2 (19,81 Uhr): wohnhaus #91693 trat beiseite auf 662,7/428,2 — das IST der Stand von werkstatt #946741. Beide gingen auf
  denselben Punkt, keiner ruhte, keiner kam an.

## Die Schnitte (Zweig `steckenbleiber` auf 54b89949, stamm/siedlung-bewohner.js)

1. 2789a879 `_bewohnerAusweichen` „DAS BESETZTE ENDE“: die Regel DER BESETZTE PUNKT auch am LETZTEN Punkt des Wegs — steht ein
   Ruhender in dessen Kapsel und ist er neben ihm, endet sein Weg, wo er steht (nie an seiner Tür). Heilt Fall 1.
2. 4bf92564 `_bewohnerPlatz` „BEISEITE HEISST: NIE IN DEN STAND EINES ANDEREN“: kein Punkt des Schritts beiseite in der Kapsel
   eines Ziels (`ziel`) oder Weg-Endes eines anderen der Siedlung — dieselbe Wand wie „nie in die Fahrbahn“. Heilt Fall 2 an der Wahl.

## Die Wähler der Klasse — gelesen und offen

| Wähler | gegen Leiber | gegen Ziele | Stand |
|---|---|---|---|
| `_bewohnerPlatz` (beiseite; auch für Spieler :2175 und Wagen verkehr:2072) | ja | ja (Schnitt 2) | geschnitten |
| `_bewohnerUm` (Punkt neben dem Stehenden) | ja (`nb`) | nein | Zwischenpunkt: DER BESETZTE PUNKT gilt ihm (übernächster Punkt) |
| `_bewohnerStandPruefen` / Wurf der Stände (`raumM` 1,5 m) | — | Stand gegen Stand und Tür-Punkt | hält |
| Tür-Warten (`_tickBewohner`: `orte.tuer`, `orte.vor` frei ≥ `tuerFreiM`) | ja | Stände ≥ `raumM` von `vor` | hält |
| `_bewohnerWeichOrt` (der Zeuge: nächster freier Stand, `belegt`) | — | Stand gegen `belegt` | hält; die gerade Flucht über Land OFFEN (weder Leib noch Ziel) |
| `_bewohnerAnkunft` Ring (wer neben einem ankommt, wird 0,6–1,8 m gestellt) | ja | NEIN | OFFEN: Zwilling des Rings von `_bewohnerPlatz`; er ruht dort — den Besitzer des Stands fängt Schnitt 1 |
| `_bewohnerNahen` (die Wache naht, Punkt `nahM` vor der Tat) | nein | nein | OFFEN |
| `_verkehrVorrang` räumt die Bahn (Punkt am Rand, siedlung-verkehr.js:771) | ja | nein | OFFEN: er wartet dort |

## Die Linse (Gebot 10) — offen beim Namen

Patch `p3/n2611/nah/steck-linse-patch.cjs` (Syntax und Format an einer Kopie geprüft) legt in scripts/lib/kreatur-mensch.cjs:
- „das besetzte Ende“: B tritt 1,8 m beiseite, A steht 0,36 m hinter dem Punkt; Soll Ankunft ≤ 5 Spielminuten und zurück an
  seinen Stand; Täter `bewohner-ende` = die alte Regel (der Stehende gilt nicht als ruhend).
- „der Schritt beiseite“: B wird zweimal um Platz gebeten, beim zweiten Mal liegt auf seinem ersten Punkt das Ziel von A; Soll
  ≥ 0,71 m von diesem Ziel; Täter `bewohner-beiseite` = die Wahl blind für die Ziele.
