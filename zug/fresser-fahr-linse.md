# FRESSER „Die Fahr-Linse des Lebens“ (voll 8/18) — Täter-Blatt, 19.11. (Leser, nichts gebaut)

## Die fünf Zweige (Blick-Gruppe: rote Läufe der letzten 24 h, Schritt-Name ohne Klammer; aus der Actions-API nachgezählt)
Die Liste im Auftrag stimmt nicht ganz: w28-kern-sprossen df03a17c lief an diesem Schritt GRÜN (Lauf 44310806697), w28-laub-kante 76d36e57 trägt keinen roten Lauf.
| Zweig | Kopf | Lauf | rote Zeile im Wortlaut |
|---|---|---|---|
| w28-bau-rezept | ff2b8341 | 44295889914 (18.11 11:34Z = „seit 12:34“) | `❌ VK (PFLICHT-OFFEN C) der Verkehr der Stadt um 10 Uhr — fahrend je Minute [25,16,11,7,null]` · 23 Uhr `[22,3,11,10,null]` |
| funktion-welt | 33ea5bf5 | 44414653257 | `❌ T4 Wechsel Third → Ego → Third in der Fahrt am Steilhang bergab …` `"abSprung":[9.08,0.22]` |
| w28-funktion-welt-2 | 264fb03f | 44418588128 | T4, `"abSprung":[9.16,0.31]` |
| laub-kante | 9e66e834 | 44445109983 | `❌ L8 Lockstep (0710-5) … Abweichung Wagen 0.08644 m · Bär 0.613841 m` |
| los-huelle | 36dcf968 | 44501570171 | T4, `"abSprung":[10.35,0.23]` |
Das sind DREI Proben, keine eine rote Zeile. T4 grün liegt bei abSprung[0] 0,21–0,39 m (Soll ≤ 0,5, diag-fahr-leben.cjs:94); rot bei 9–10 m, die Werte trennen sich klar in zwei Gruppen.

## Am main-Kopf dabd69bb
GRÜN: integ-probe-Lauf 44469804010 voll 18/18, T4 abSprung [0.39,0.23], L8 „Abweichung Wagen 0 m · Bär 0 m“, VK 10/23 Uhr ✅. Ebenso b339e1de (44475131994).
Aber main trägt den Auslöser: los-huelle = dabd69bb + nur fachwerk/settlement (8 Dateien) → T4 ROT. Ein grünes main heißt also nur, dass es diesmal gut ging.

## Täter (T4 + L8, 4 von 5): die Probe-Annahme, ausgelöst durch einen Commit in main
- **Annahme der Linse:** `scripts/lib/fahr-proben.cjs:263` (`setzen`, dazu :2306 und :2408) wartet nur `await __gebautNach(e)`, also auf „gezeichnet“.
  Sie geht davon aus, dass der Wagen dann seine Mesh-Stufe mit Gestalt-Maß trägt (`_wagenMassSetzen` → `_fahrUmriss`, Hülle mit 64 Richtungen).
- **Seit wann das nicht mehr trägt:** cb19ae8d „die Ruhe des Foundry-Speichers zählt an der Welt-Uhr statt an der Wanduhr“, in main seit f43e0ecf/13b7ec0f (V18.546.340).
  Die Stelle: `stamm/studio-gestalt.js:1101–1102` (`jetzt = this.state.spielZeit`, `frist = _foundryRuheMs()/1000`). Die Probe fährt viele Welt-Sekunden in wenig Wanduhr.
  Deshalb wirft `_foundryRuheDeckel` die L0 des GT jetzt mitten in der Probe aus dem Speicher. Beim nächsten `setzen` fährt der Wagen als Karte: Stufe 2, Hülle 16 statt 64 Richtungen.
- **Beleg L8:** c125086e (nur in w28-laub-kante, NICHT in main) nennt genau das: „L0 des GT nicht mehr im Foundry-Cache (`_foundryStufeBereit` false) … Hülle 16 statt 64“.
  Vorher waren 8 von 12 Läufen rot, nach dem Schnitt 4 von 4 grün. Der Kopf mit dem Schnitt, 15f8d5a4, ist an Gruppe 8 grün (L8 „Hülle 64 / 64“, T4 0,21).
- Alle vier roten T4/L8-Köpfe tragen cb19ae8d. Wie viele Körper im Speicher liegen, hängt vom Inhalt ab (mehr Häuser oder Bäume). Darum trifft es Zweige wie fachwerk oder laub-kante und main meist nicht.

## Der EINE Schnitt (nicht gebaut)
c125086e `werkGebaut` nach main bringen. Das ist die EINE Naht für `setzen`, den Stoß-Wagen und die Wagen der L6:
wählt `_foundryLodForEntry(e) < 2` eine Mesh-Stufe und fehlt `e._gestaltMass`, wartet die Probe im Takt der Welt (`__gebautNach` mit `fertig`/`bau`), bis das Maß da ist.
Dazu die L8-Zeile `lockstep hülle`, die den Täter beim Namen nennt. Schnellster Weg: w28-laub-kante landen oder c125086e einzeln nach main holen, dann die vier Zweige neu fahren.
Die Klasse ist „eine Station misst einen Wagen, der als Karte fährt“. Darum gehört dazu: die T4-Zeile druckt die Hülle mit, wie L8 es seit c125086e tut.

## unbelegt
- Dass T4 abSprung 9–10 m aus der Karten-Hülle kommt, ist nur ein Indiz: alle vier tragen cb19, T4 ist am Kopf mit c125086e grün, die Werte trennen sich in zwei Gruppen.
  Die T4-Zeile druckt keine Hülle, und kein Lauf mit Hülle in der T4-Zeile wurde gefahren. Wie die Karten-Hülle über `_aussteigOrt` (koerper-fahrt.js:1287) zu 9 m Kamera-Sprung führt, ist unbelegt.
- **VK an w28-bau-rezept** ist eine andere Klasse: der Kopf hat kein cb19ae8d, seine Basis 1f300260 ist an derselben Station grün (Lauf 44241385021).
  Täter ist entweder der eigene Diff (fachwerk-core.js, diag-settlement.cjs, ort-proben.cjs) oder ein Wackeln der Schwelle weg60M 30 m (Gemessen 25/22 m, Grund `null`, kein Halt an einem Bewohner). Unbelegt; dafür bräuchte es einen Neulauf am Kopf oder am main-Merge.
- Ob die Fahr-Linse an dabd69bb bei mehreren Läufen rot fällt: unbelegt, es gibt nur zwei Läufe, beide grün; c125086e nennt „main 0 von 5“.
