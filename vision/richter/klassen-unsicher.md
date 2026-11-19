# Klassen der Karte 2: was keine Regel des Gesetzes fasst

Erzeugt von `node vision/buche-2.cjs --klassen` (jeder Lauf schreibt das Blatt neu, nie von Hand ändern). Entscheid: `klasse` in
`vision/meisterkarte-2.json` setzen und `klasseGrund` auf `hand` — der nächste Lauf lässt sie stehen und zieht die Sprossen darüber nach.

Im Zweifel die höhere Zeile (Regel 6): Welt-Wechsel → Planet und Welten · Träger unklar zählt Leiber · Region ohne Größe → Stadt ·
zwei Zeilen → die höhere · Horizont → Megastadt und Kontinent · Planet-Maß → Planet und Welten. Himmel vom Boden und der
Erd-Schlüssel (Spalte Bytes) heben nicht — außer der Umfang nennt selbst das Ganze (die Erde, den Planeten über seine Geschichte).
Stehen zwei Regeln gegeneinander, gilt die höhere Zeile. Schweigt der Umfang zur Größe, spricht die Preis-Pose (Regel 7, `pose:<Wort>`).
Eine gehobene Sprosse trägt `klasseGrund` `zweifel:<Grund>` und steht hier nicht.

Stand: 75 Sprossen tragen die höhere Zeile (Welt-Wechsel 30 · Region ohne Größe 8 · Planet-Maß 4 · Horizont 7 · Träger unklar 20 · zwei Zeilen 6).

## A · Erste Sprossen aus klasse-offen.json, die das Gesetz löst (14)

| Leiter | Umfang | Klasse | Grund |
| --- | --- | --- | --- |
| planet.geologie.platten | Region 10⁴ km² | Megastadt und Kontinent | zahl:10⁴ km² |
| planet.wasser.eis | Schnee einer Region | Stadt | zweifel:Region ohne Größe „Region“ |
| planet.wetter.wolken | EINE Wolkenschicht 800 m, Karte ≈ 8 km | Stadt | zahl:8 km |
| planet.erde.gestalt | EINE Region der Erde, 10⁴ km² (ein Golf mit Vulkan) | Megastadt und Kontinent | zahl:10⁴ km² |
| planet.kosmos.eigengesetz | EINE Welt, EINE Konstante anders (Schwere-Exponent, Stoff-Dichte, Zähigkeit) | Planet und Welten | zweifel:Welt-Wechsel „Konstante anders“ |
| planet.kosmos.kunstwelten | EIN Drehzylinder, 10 km | Stadt | zahl:10 km |
| planet.kosmos.galaxien | EINE Nachbargalaxie als Ziel | Planet und Welten | zweifel:Welt-Wechsel „Nachbargalaxie“ |
| leben.evolution.fremde-physik | g 0,3–3 | Planet und Welten | zweifel:Welt-Wechsel „g 0,3–3“ |
| mensch.stadt.breite | 1 Familie, 6 Regionen | Stadt | zweifel:Region ohne Größe „Regionen“ |
| mensch.netz.gestalt | 1 Ort, ~10 km, 4 Klassen | Stadt | zweifel:zwei Zeilen „1 Ort“ gegen „10 km“ |
| mensch.zeit.erde | EIN Ort, EINE Zeit (eine römische Stadt um 100) | Stadt | wort:Stadt |
| erleben.spieler.wegfindung | Landmarke aus 1–3 km sichtbar | Stadt | zahl:3 km |
| same.kopplung.erdsaat | 1 Ort, 1 Ereignis-Typ | Ort | wort:1 Ort |
| same.kopplung.terraform | EIN Eingriff, EINE Region: Wetter lenken über einer Stadt | Stadt | wort:Stadt |

## B · Erste Sprossen, die leer bleiben (0) — keine Regel fasst sie; darüber gilt bis zum Entscheid ihr Boden

| Leiter | Umfang | Boden | erben ihn | Grund |
| --- | --- | --- | --- | --- |

## C · Sprossen darüber, die keine Regel fasst (0) — gesetzt ist die Lesart ohne den Zweifel, die andere steht daneben

| Leiter | S | Umfang | gesetzt | andere Lesart | Grund |
| --- | --- | --- | --- | --- | --- |

## D · Das Gesetz gegen die Hand (7 anders, 0 unsicher, 240 gleich) — die Hand bleibt stehen

| Leiter | S | Umfang | Hand | Gesetz | Grund |
| --- | --- | --- | --- | --- | --- |
| planet.geologie.lagerstaette | 1 | Gestein je Ort aus seiner Genese | Ort | Stadt | zweifel:Region ohne Größe „je Ort“ |
| planet.relief.grossform | 1 | 1 Saat, Flussnetz bis zum Horizont | Ort | Megastadt und Kontinent | zweifel:Horizont |
| planet.wasser.stroemung | 1 | Flüsse einer Region | Ort | Stadt | zweifel:Region ohne Größe „Region“ |
| planet.wasser.kreislauf | 1 | Region 2 km | Ort | Stadt | zahl:2 km |
| planet.kosmos.welten | 1 | Heimat + 1 Fremdwelt | Ort | Planet und Welten | zweifel:Welt-Wechsel „Fremdwelt“ |
| same.entfaltung.schirm | 1 | Wiese und Genesis, Sicht 8 km | Ort | Stadt | zahl:8 km |
| same.entfaltung.abwesenheit | 1 | 118 Bewohner einer Test-Stadt, ein Tag | Ort | Stadt | wort:Test-Stadt |
