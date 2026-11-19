# Die Klassen-Lücke der Tafel (19.11., Richter-Falte, zweiter Gang)

Befund, kein Entscheid. Gezählt per node am Kopf von `richter-falte` (Tafel 1 140 Zeilen, `buche-2.cjs tafelOhneKlasse`).

## Die Zahl

963 von 1 140 Tafel-Zeilen zeigen auf eine Sprosse ohne `klasse` (865 davon „gleich“, schreiben also Akten); vor diesem Gang 860 von 1 017.

| Kapitel | ohne Klasse |
|---|---|
| mensch | 490 |
| erleben | 236 |
| planet | 97 |
| same | 87 |
| leben | 53 |

Je Sprosse: S1 16 · S2 161 · S3 163 · S4 164 · S5 164 · S6 163 · S7 100 · S8 26 · S9 6, über 164 Leitern (an der Spitze je 8 Zeilen:
erleben.spieler.zeit, erleben.schoepfen.hebel/satz, erleben.bild.ferne, mensch.menge.bevoelkerung, mensch.stadt.vertikal, mensch.macht.grenze/krieg).
Die 16 an S1 sind genau die ersten Sprossen, die `vision/vorrat/klasse-offen.json` als „offen“ mit Grund führt (16 von 22).

## Woher `klasse` kommt

- Feld: `gruppen[].kriterien[].sprossen[].klasse` in `vision/meisterkarte-2.json`, ein Wort der Preis-Treppe (`preisTreppe[].klasse`: Ort, Stadt, …).
- Quelle: R8 (jede Inhalts-Sprosse trägt als P die Stufe IHRER Umfangs-Klasse) und R5 (Sprosse 1 ist EIN Ort, EIN Ding).
- Wer schreibt es: niemand maschinell. Die Karte hat keinen Erzeuger für das Feld; es wurde von Hand gesetzt — zuletzt in der Welle
  `vorrat3-klasse` (ef115b87, 16.11.: „Preis-Klasse an 191 ersten Sprossen“) nach der Prosa-Regel in `vision/vorrat/klasse-offen.json`
  (Feld `regel`, „aus den 37 gesetzten Klassen abgeleitet, nicht wörtlich Gesetz“). Stand der Karte: Sprosse 1 trägt sie an 231 von 253,
  jede höhere Sprosse an 3 von 1 465 (Ort 230, Stadt 4).

## Die eine Stelle im Code

`vision/buche-2.cjs:219` — `preisUrteil`: `if (!klasse) return "OHNE-KLASSE";` (die Treppe-Zeile fehlt, kein Preis prüfbar), und
`vision/buche-2.cjs:266`: `if (preise.includes("OHNE-KLASSE")) return { u: "KERN", … "KLASSE FEHLT in der Karte für diese Sprosse — der
Preis ist nicht prüfbar, höchstens Kern" }`. Die Meldung je Lauf: `tafelOhneKlasse` (buche-2.cjs, „TAFEL OHNE KLASSE“, kein Abbruch).

## Was eine Akte ohne Klasse verliert

Richter GRÜN an beiden Geräten mit vollem, grünem Preis hebt die Sprosse trotzdem nur auf KERN, nie auf PUNKT. Weil HEUTE einer Leiter
lückenlos PUNKT ab Sprosse 1 zählt (buche-2.cjs:550), endet jede Leiter heute an ihrer ersten Sprosse ohne Klasse: an 145 der 164
Leitern ist das Sprosse 2 (16 an Sprosse 1, 3 an Sprosse 3) — die Karte 2 kann aus der gefalteten Tafel höchstens ihre ersten Sprossen buchen, alles darüber bleibt Kern.

## Drei Beispiele im Wortlaut (`node vision/buche-2.cjs --trocken`)

- `TAFEL OHNE KLASSE: karte2.erleben.spieler.wegfindung#1 → erleben.spieler.wegfindung S 1 (Richter gleich): KLASSE FEHLT in der Karte — die Akte hebt höchstens Kern`
- `TAFEL OHNE KLASSE: karte2.mensch.leib.verschieden#2 → mensch.leib.verschieden S 2 (Richter gleich): KLASSE FEHLT in der Karte — die Akte hebt höchstens Kern`
  (Umfang der Karte: „10² Personen nah, je eigener Leib“, Preis „P · Test-Stadt (118)“)
- `TAFEL OHNE KLASSE: karte2.erleben.spieler.praesenz#4 → erleben.spieler.praesenz S 4 (Richter gleich): KLASSE FEHLT in der Karte — die Akte hebt höchstens Kern`
  (Umfang: „jeder Leib, den die Welt hat: Reittier, Wagen, Boot, Flieger“, Preis „P · 50 ms bis zur ersten Bewegung“)

## Was fehlt, damit die Klasse aus der Karte folgt

1. EIN Gesetz Umfang → Treppe-Zeile: heute Prosa (`klasse-offen.json` regel) und nur an ersten Sprossen angewandt. Es fehlt eine Funktion,
   die aus `sprosse.umfang` (und den Worten der `umfangsKlassen`: Weiler/Dorf, Stadt, Metropole, … Kosmos) die Zeile der `preisTreppe`
   bestimmt — an EINER Stelle (die buchende, buche-2, oder der Erzeuger der Karte), statt ein Feld von Hand je Sprosse.
2. Die Worte der Umfänge, die keine Größe tragen: viele höhere Sprossen nennen Zeit („Monate“), Vielfalt („jeder Leib, den die Welt
   hat“) oder Prüfhärte (R5: „eine Stufe Prüfhärte, wo der Umfang nicht wächst“) statt einer Fläche/Zahl. Für sie fehlt die Regel, ob die
   Klasse der Sprosse darunter gilt (R5 liest sich so: der Umfang wächst nicht → dieselbe Klasse) — das entscheidet der Schöpfer.
3. Die 22 offenen ersten Sprossen aus `klasse-offen.json` (Regionen ohne Größe oder über 10² km², Spannen 1–20 km ohne „Stadt“,
   Welt-Wechsel, zwei Zeilen zugleich): ihr Grund steht dort je Zeile; die Treppe trägt für sie keine Zeile.
