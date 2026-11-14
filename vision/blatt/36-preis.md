# Ankunft, Geräte und Zugang

## Die Vision hier

Ein Mensch irgendwo auf der Erde tippt einen Link an, auf dem Handy, das er wirklich besitzt, im Zug mit schwachem Netz, und steht nach weniger als einer Sekunde in einer Stadt, gegen die Tokio ein Dorf ist: zehn Millionen Bewohner in Sichtweite ihres Wirkens, Hunderttausende im Blick vom Turm. Er hat nichts geladen außer dem Gesetz. Die Welt läuft mit 60 Bildern je Sekunde auf diesem Handy, auf dem alten Laptop, auf dem Turm und in der VR-Brille, und sie zeigt auf jedem Gerät dieselbe Wahrheit — dieselbe Person an derselben Stelle, nur feiner oder gröber aufgelöst, nie eine andere Welt. Jeder Ortswechsel ist eine Ankunft und hält dasselbe Maß: der Abstieg vom Orbit bis auf den Pflasterstein, der Sprung auf einen fremden Planeten oder in die Kreidezeit kostet keine Ladezeit, sondern eine Sekunde, und kein Bild unterwegs ist leer. Ein neuer Planet, eine neue Epoche, eine neue Art kostet null Bytes über das Netz — nur einen Samen. Und jeder Mensch kommt an, mit Tastatur, Gamepad, Finger, Hand im Raum, Stimme oder einem einzigen Schalter, und mit jedem fehlenden Sinn: wer nicht sieht, hört die Welt, die sich aus ihrem Gesetz selbst beschreibt — auch das Ding, das vor einer Minute aus einem Satz entstand. Heute braucht das beste Spiel der Gegenwart Gigabytes und eine Minute Shader-Bau; jenseits der Gegenwart heißt: der Preis der unendlichen Welt ist kleiner als der einer Webseite, und er wächst nicht mit ihr.

## Das Beste der Gegenwart

- **Insomniac, Spider-Man 2 (PS5)**: Schnellreise 1,33 s auf einer 5,5-GB/s-SSD (IGN, zitiert in MEISTERKARTE.md:989) — Grenze: ein festes Gerät, Gigabytes auf der Platte.
- **Luminous, Forspoken (GDC 2022, DirectStorage)**: Szene von NVMe in 1,9 s, von der Festplatte in 21,5 s (MEISTERKARTE.md:990) — Grenze: das Medium entscheidet, nicht der Code; ohne Download kein Spiel.
- **Microsoft Flight Simulator 2024**: ein ganzer Planet, gestreamt aus Rechenzentren, Abstieg vom Reiseflug bis auf die Piste ohne Ladeschirm — Grenze: Petabytes auf Servern, Bandbreite als Preis, nahe am Boden Matsch und Lücken; der Planet ist Daten, kein Gesetz.
- **Riot, Valorant / Epic, Fortnite**: Valorant 30 fps ab Intel HD 3000, Fortnite auf GTX 1060 ≈ 54 fps Ultra und auf Handys spielbar (MEISTERKARTE.md:1040-1041) — Grenze: bewusst schlichte oder stark heruntergestufte Welt; zweistellige Gigabyte-Installation.
- **Cloud-Spiel (GeForce Now)**: jedes Gerät, aber Klick bis Bild ≈ 56 ms laut Hersteller, unabhängig gemessen ≈ 69–98 ms — Grenze: Netz-Latenz als Physik-Boden, Rechenzentrum statt Gerät, ohne Netz nichts.
- **Naughty Dog, The Last of Us Part II**: über 60 Zugänglichkeits-Optionen, Blinde spielen per Audio-Hinweisen und Sprachausgabe (MEISTERKARTE.md:931); Forza Motorsport mit Audio-Fahrhilfe für Blinde — Grenze: von Hand gebaut je Inhalt; jeder neue Ort braucht neue Hand-Arbeit.
- **Microsoft, Xbox Adaptive Controller**: frei belegbare externe Schalter für motorisch eingeschränkte Spieler — Grenze: Hardware-Seite; das Spiel muss jedes Verb über wenige Knöpfe erreichbar machen.
- **Web-Wirklichkeit**: WebGPU auf ≈ 84 % der weltweiten Seitenaufrufe (Sekundärquelle); Core Web Vitals LCP ≤ 2,5 s, INP ≤ 200 ms; Poki: bei 10 MB Erst-Download spielen ≈ 80 % los (MEISTERKARTE.md:991) — Grenze: ein Sechstel der Geräte ohne WebGPU, Web-Spiele erkaufen die kurze Ankunft mit kleinen Welten.
- **VR (Standalone-Brillen)**: 72–90 Hz Pflicht, 11–14 ms je Bild für zwei Augen auf einem Handy-Chip — Grenze: dort laufen nur kleine Welten.

## Der Same

**Die Welt ist eine Funktion von (Same, Gesetz-Stand, Ort, Zeit, Gerät), und der Preis hängt am Schirm, nie an der Welt.** Was das Gerät anzeigt, rechnet es aus dem Gesetz für genau die Pixel, die es hat — so fallen Download (nur das Gesetz reist), Ankunft (gebaut wird nur, was das erste Bild verlangt), Reise (jeder Ort ist eine Ankunft) und Gerätespanne (das schwache Gerät rechnet dieselbe Funktion mit gröberem Raster und kommt zu denselben Dingen an denselben Stellen) in EIN Prinzip. Zugang folgt aus derselben Wurzel: weil jedes Ding seinen Namen und sein Gesetz kennt, kann die Welt sich in jeden Sinn übersetzen (Bild, Klang, Sprache, Tastsignal) und jedes Verb in jede Eingabe — die Beschreibung ist eine weitere Ausgabe der Funktion, kein Zusatz. Darum misst dieses Blatt nie Listen (Zahl der Modalitäten, Zahl untertitelter Klänge), sondern die Kraft: ein Verb, ein Ding, ein Planet, den es gestern nicht gab, kommt heute auf jedem Gerät, über jede Eingabe, in jedem Sinn an — ohne eine Zeile Hand-Arbeit.

Fremde Branchen haben es gelöst: die **Demoszene** (kkrieger 2004: ein 3D-Shooter in 96 KB, alles prozedural zur Laufzeit), die **Video-Kodierung** (skalierbare Codecs: ein Strom, jede Empfangs-Klasse dekodiert ihre Schicht), das **Web selbst** (Responsive Design: ein Dokument, jede Schirmgröße) und die **Screenreader-Welt** (das DOM ist zugleich Bild und Sprache, weil es semantisch ist).

## Die Leitern

Die Gerätespanne für alle Leitern (Klassen nach Verbreitung gewichtet): **G0** Browser ohne WebGPU (≈ 16 %) · **G1** Turm (RTX-3060-Klasse) · **G2** Laptop diskret (GTX 1060 + i7-8750H) · **G3** Laptop iGPU (Radeon 890M) · **G4** Handy Mittelklasse (6 GB) · **G5** Handy Einstieg (4 GB) · **G6** Tablet · **G7** VR-Standalone. Der Welt-Umfang am Ankunftsort folgt den Leitern „Siedlung und Stadt" und „Millionen": Dorf (10² Häuser) · Stadt (10⁴ Häuser) · Weltstadt (10⁷ Bewohner wirkend, Tokio-Klasse) · Übermetropole (10⁸ Bewohner, jenseits jeder Stadt der Gegenwart) · Planet (10⁹–10¹⁰ Leben wirkend). **Die Tiefe jeder Sprosse ist die A-Soll-Tafel des Orts in derselben Sitzung** — ohne sie gewinnt jede Preis-Zahl, indem sie weniger zeigt.

### L1 Ankunft: vom Klick bis zur Kontrolle im ganzen Bild

Misst die Sekunden vom Klick (leere Platte, Netz der Sprosse) bis zur ersten angenommenen Eingabe in einem Bild, das ganz ist (≤ 2 % Lücke gegen dieselbe Pose nach 60 s Ruhe) und dessen Klassen im Soll stehen — auf den Geräteklassen der Sprosse, bei dem Welt-Umfang der Sprosse.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | eine Wiese am Spawn | Bild erscheint, Welt teilweise | ≤ 60 s kalt, 1 Gerät, lokales Netz | t(Kontrolle) von außen, 4 Kalt-Boots | gehalten |
| 1 | Dorf (10² Häuser) | Bild ganz, ≤ 2 % Lücke | ≤ 20 s kalt an G2 und G3, lokales Netz | t(Kontrolle) von außen + Bild-Diff gegen 60 s Ruhe, ≥ 4 Boots je Gerät | HEUTE (Messung 18.10., am Kopf ungeprüft) |
| 2 | Dorf | ganz auch nach 180°-Drehung, Soll-Tafel am Spawn ≥ 80 % GRÜN | ≤ 10 s kalt an G2+G3, warm ≤ 3 s | wie 1, plus Drehung 2 s nach der Kontrolle | |
| 3 | Stadt (10³ Häuser, 10³ Bewohner) | ganz in jeder Blickrichtung, Soll-Tafel am Spawn ≥ 95 % GRÜN | ≤ 5 s kalt an G2+G3, warm ≤ 1,5 s (PFLICHT B) | wie 2, plus Soll-Tafel | |
| 4 | Stadt (10⁴ Häuser) | wie 3 | ≤ 5 s kalt an G1–G6 über 4G (9 Mbit/s) | wie 3, je Klasse ein reales Gerät, Netz gedrosselt | |
| 5 | Weltstadt (10⁷ Bewohner wirkend), Horizont 10 km ganz | wie 3, Bild gegen dieselbe Pose nach 5 min Ruhe ≤ 2 % Abweichung | ≤ 2 s kalt an G1–G7 über 4G, warm ≤ 0,5 s | wie 4 | |
| 6 | Übermetropole (10⁸) oder Planet: Ankunft an einem zufälligen Ort | wie 5 | ≤ 1 s kalt an G1–G7 über 3G (1,6 Mbit/s) | 20 zufällige (Same, Ort)-Paare: Median und p95 t(ganzes Bild im Soll) | |
| 7 | viele Planeten, jede Epoche | wie 5, für jede (Planet, Epoche) | ≤ 1 s kalt vom Klick auf G0–G7 (auch ohne WebGPU) über 3G | 20 zufällige (Same, Planet, Epoche): Median und p95, Lücke ≤ 2 %, Soll-Tafel | |

### L2 Bild-Takt und Reichweite über die Gerätespanne

Misst den nach Verbreitung gewichteten Anteil aller Geräte, die Menschen besitzen (G0 eingeschlossen), auf denen die Welt überhaupt läuft UND Frame p95 ≤ 33 ms (oberhalb ≤ 16,7 ms, VR ≤ 11,1 ms je Auge) in Bewegung hält — bei dem Welt-Umfang und der A-Tiefe der Sprosse in derselben Sitzung.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | Wiese, stehend | irgendein Bild | p95 ≤ 33 ms an 1 Gerät stehend | werkbank lauf, 4 Boots | gehalten (GTX 16,8 ms stehend) |
| 1 | Wiese + Genesis, Ego + Third, stehend | Soll-Tafel A in derselben Sitzung | p95 ≤ 33 ms stehend an G2 und G3 | ABAB an beiden Geräten | HEUTE halb (GTX ja, Radeon-ABAB fehlt) |
| 2 | Gehen, Sprint, Fahrt, Sturm, Dorfgasse | A-Klassen GRÜN in derselben Sitzung | p95 ≤ 33 ms in jeder Bewegungszelle an G2+G3, 0 Frames > 100 ms (PFLICHT E) | Spielgang-Bahnen, 4 Sitzungen je Gerät | Radeon: 66 % der Bilder > 33 ms gehend |
| 3 | Stadt mit 10³ Bewohnern | A-Klassen GRÜN | p95 ≤ 16,7 ms an G2+G3, ≤ 33 ms an G4; gewichtete Reichweite ≥ 50 % | dieselbe Bahn durch die Stadt, Handy per Fern-Debug | |
| 4 | Stadt 10⁴ Häuser | A-Klassen GRÜN | ≤ 33 ms an G0–G6 (≥ 85 % gewichtete Reichweite, G0 eingeschlossen) | Spielgang je Klasse, Anteil der Klassen im Preis | |
| 5 | Weltstadt 10⁷ wirkend, 10⁵ im Blick vom Turm | A-Klassen GRÜN | ≤ 16,7 ms an ≥ 90 % gewichteter Reichweite, VR ≤ 11,1 ms je Auge | wie 4, plus VR-Sitzung mit Kopfbewegung | |
| 6 | Planet von Orbit bis Gras, Übermetropole, jede Epoche | Bildvergleich gegen Foto-Referenz je Biom bestanden | ≤ 16,7 ms an ≥ 95 % der Geräte, die Menschen besitzen; Akku ≤ 20 %/h am Handy | 20 zufällige (Same, Ort, Epoche)-Posen je Klasse, Anteil gehalten | |

### L3 Null Download: Bytes und Speicher je erlebter Welt

Misst die Bytes über das Netz und den Speicher (Heap, VRAM) — gegen den Welt-Umfang, der dafür erlebt wird, bei gehaltener Soll-Tafel: der Preis hängt am Schirm, nie an der Welt. (Die Ankunftszeit unter gedrosseltem Netz richtet L1, nicht diese Leiter.)

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | eine Welt | Gesetz statt Assets, irgendein Bild | ≤ 50 MB roh über das Netz, kein Installer | Netz-Mitschnitt des Kalt-Boots: Summe übertragener Bytes | gehalten |
| 1 | Dorf + Studios | Soll-Tafel am Spawn gemessen | ≤ 20 MB roh, Heap und VRAM ungebunden | Netz-Mitschnitt + Heap/VRAM nach 60 s | HEUTE (≈ 12,9 MB roh Stamm + Kerne, 2,3 MB vendor; Heap 290 → 486 MB in 1 min) |
| 2 | Dorf | Soll-Tafel ≥ 80 % GRÜN | ≤ 5 MB komprimiert bis zur Kontrolle, VRAM ≤ 118 MB, Heap ≤ 400 MB, Drift ≤ 5 MB/min | wie 1, plus Heap-Kurve | |
| 3 | Stadt, offline nach Erstbesuch | Soll-Tafel ≥ 95 % GRÜN, offline gleiches Bild (Bild-Diff ≤ 1 %) | ≤ 5 MB komprimiert, zweiter Besuch 0 Bytes | zweiter Besuch im Flugmodus: Netz-Bytes, Bild-Diff gegen Erstbesuch | |
| 4 | Weltstadt | wie 3 | ≤ 3 MB bis zur Kontrolle, Heap ≤ 1 GB auf G5 (4 GB RAM) ohne Tab-Tod in 60 min | G5-Gerät, 60 min Spielgang, Tab überlebt | |
| 5 | Planet, alle Epochen, alle Arten | wie 3, an 20 zufälligen Orten | Gesamtcode für den ganzen Planeten ≤ 50 MB komprimiert, Bytes bis zur Kontrolle ≤ 1 MB | Netz-Mitschnitt, Bytes bis zur Kontrolle an 20 Zufalls-Orten | |
| 6 | viele Planeten, Lebens-Evolutionen, jede Epoche | wie 3 | ein neuer Planet, eine neue Epoche, eine neue Art kostet 0 Bytes über das Netz; Speicher wächst nicht mit der Zahl besuchter Welten | Sprung auf 20 zufällige neue Planeten: Netz-Bytes je Sprung = 0, Heap nach jedem Sprung ≤ Ausgangswert + 2 % | |

### L4 Strom in Bewegung: die Reise ist eine Ankunft ohne Halt

Misst, ob die Welt dem Spieler in Bewegung vorauswächst: Anteil der Bilder einer Fahrt, eines Flugs, eines Abstiegs, deren Lücke gegen dieselbe Pose in Ruhe ≤ 2 % bleibt, bei gehaltener Kadenz. (Neu gegenüber der ersten Fassung: die alte Karte 30 Streaming K3 und die Vision „Orbit bis Gras" hatten nur einen Teleport-Richter.)

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | Gehen durch die Wiese | sichtbares Nachwachsen erlaubt | p95 ≤ 33 ms an 1 Gerät | Gang-Video, Anteil Bilder mit Lücke > 2 % | gehalten (unbelegt in Prozent) |
| 1 | Fahrt 30 km/h durchs Dorf | ≥ 90 % der Bilder ganz | p95 ≤ 33 ms an G2+G3 | Fahrt-Bahn, Bild-Diff je Bild gegen Ruhe-Referenz | HEUTE nein: Radeon fahrend 94 % der Bilder > 33 ms |
| 2 | Fahrt 120 km/h durch die Stadt | ≥ 98 % ganz, kein Aufploppen in 50 m (Bild-Diff im Nahfeld) | p95 ≤ 33 ms, 0 Frames > 100 ms an G2+G3 | wie 1 | |
| 3 | Flug 1 000 km/h über Weltstadt und Land | ≥ 98 % ganz bis 10 km | p95 ≤ 16,7 ms an G1–G4 | Flug-Bahn, Bild-Diff je Bild | |
| 4 | Abstieg vom Orbit bis auf den Pflasterstein in 60 s | jedes Bild ganz (≤ 2 %), kein Maßstab-Sprung sichtbar | p95 ≤ 16,7 ms an G1–G6 | Abstieg über 20 zufällige Ziel-Saaten, Anteil ganzer Bilder | |
| 5 | Sprung zwischen Planeten und Epochen mitten in der Bewegung | Ziel ganz ≤ 1 s, kein schwarzes Bild | ≤ 16,7 ms auch im Sprung, an G0–G7 | 20 zufällige (Planet, Epoche)-Sprünge im Flug: t(ganzes Bild), Kadenz | |

### L5 Dieselbe Welt auf jedem Gerät

Misst, ob dasselbe (Same, Ort, Zeit) auf zwei Geräten dieselbe Welt zeigt: dieselben Dinge, dieselben Personen an denselben Stellen, nur feiner oder gröber — der Same ist nur dann EIN Same, wenn kein Gerät eine andere Welt aus ihm macht.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | Gelände am Spawn | Höhenform gleich | jedes Gerät im eigenen Holz-Profil | Bild G2 gegen G3 gleiche Pose: Horizont-Linie ≤ 2 px Abweichung | ungemessen |
| 1 | Dorf: Häuser, Bäume | Klassen-Masken-Abdeckung ≥ 95 % zwischen G2 und G3 | beide im Preis von L2 | Klassen-Masken-Vergleich gleiche Pose | ungemessen |
| 2 | Stadt mit Bewohnern in Bewegung | ≥ 95 % Abdeckung, Personen ≤ 0,5 m Abweichung nach 10 min | G1–G4 im Preis | zwei Geräte in EINER Sitzung, gleiche Pose, Masken + Positionen | |
| 3 | Weltstadt, Wetter, Verkehr | wie 2, Wetter und Wagen gleich | G0–G6 im Preis | wie 2, über G0–G6 | |
| 4 | Planet, jede Epoche | wie 2 an 20 zufälligen (Same, Ort, Epoche) | G0–G7 | Stichprobe, Anteil gleicher Welten ≥ 95 % | |
| 5 | Planet, verändert durch Spieler und Zeit (Vulkan, Bau, Spur) | wie 4, nach Tagen Weltzeit und Edits | G0–G7 | zwei Geräte nach 100 Sprüngen und Edits: Masken + Positionen | |

### L6 Eingabe: jedes Verb über jede Eingabe

Misst den Anteil der Verben der Welt, der über jede Eingabe-Art (Tastatur/Maus, Gamepad, Finger, Stimme, Hände im Raum) erreichbar ist, mit der Latenz von der Eingabe bis zum Pixel — und ab Sprosse 4, ob ein NEUES Verb (aus einem Studio, aus einem Satz an die KI) ohne Hand-Arbeit sofort über jede Eingabe erreichbar ist. (Ein-Schalter und Blicksteuerung richtet L7.)

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | Tastatur + Maus | v1-Verben erreichbar | Eingabe bis Pixel ≤ 100 ms | v1-Pfad aus aufgenommenen Eingaben, INP | gehalten |
| 1 | + Gamepad, Belegung frei | v1-Verben über beide | INP ≤ 200 ms an G2+G3 | v1-Pfad je Eingabe, Anteil erreichter Verben | HEUTE |
| 2 | + Finger | 100 % der v1-Verben, Treffer-Quote der Finger-Ziele ≥ 98 % | INP ≤ 100 ms an G4 | v1-Pfad am Handy nur per Finger, Fehltipp-Quote | |
| 3 | + Stimme (Verb und Satz gesprochen) | 100 % der v1-Verben | Wort bis Wirkung ≤ 1 s | v1-Pfad nur per Stimme | |
| 4 | + Hände im Raum (VR) | 100 % der Verben, Hände greifen Dinge | Bewegung bis Photon ≤ 20 ms, ≤ 11,1 ms je Bild | VR-Sitzung: v1-Pfad mit Händen, Übelkeits-Fragebogen (SSQ) unter Schwelle | |
| 5 | jedes Verb der vollen Welt (Sport, Fahrzeug, Erschaffen, Zeitreise) | Stichprobe 20 zufälliger Verben aus den Studios × 5 Eingaben ≥ 95 % | wie 2–4 | Stichprobe, Anteil erreicht | |
| 6 | ein Verb, das es gestern nicht gab | ein per Satz erschaffenes Verb ist sofort über alle 5 Eingaben erreichbar | 0 Zeilen Hand-Arbeit je Verb, wie 2–4 | 20 per Satz erzeugte Verben × 5 Eingaben, Anteil erreicht ≥ 95 % | |

### L7 Zugang mit fehlendem Sinn

Misst, welcher Anteil der Aufgaben ein Spieler mit je einem fehlenden oder geschwächten Sinn (Sehen, Hören, Farbsicht, Motorik bis zum Ein-Schalter, kognitive Last) ohne fremde Hilfe schafft — gerichtet durch Läufe, die nur den verbleibenden Kanal erhalten; ab Sprosse 5 an Dingen und Orten, die aus zufälligen Saaten entstanden und die niemand von Hand beschrieben hat.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | Text der Oberfläche | Sprache DE/EN aus einer Tafel | 0 zusätzliche Kosten | harte UI-Zeilen = 0 | gehalten |
| 1 | taub und farbschwach | jedes Klang-Ereignis hat seine Zeile, Klassen-Grenzen ΔE ≥ 10 unter Deuteranopie, Bewegungs-Komfort | ≤ 0,1 ms je Bild | Klang-Ereignisse mit Zeile; ΔE min unter Machado-Simulation am Ausgabe-Bild | HEUTE (39/39, Deut min 31,8) |
| 2 | + motorisch: Ein-Hand, Assist (Tempo, Zielhilfe) | v1-Pfad mit einer Hand | 0 Bild-Kosten | v1-Pfad mit halbierter Tastenmenge, Anteil Schritte | |
| 3 | + sehschwach: 20/200 | v1-Pfad bei Unschärfe-Simulation am Ausgabe-Bild | ≤ 1 ms je Bild | Lauf mit unscharfem Bild: Anteil Schritte in ≤ 5 min | |
| 4 | + blind: die Welt beschreibt sich aus dem Gesetz in Sprache und Raumklang; + Ein-Schalter | v1-Pfad nur per Ton und Ansage; v1-Pfad mit einem Schalter | Beschreibung ≤ 1 s nach Frage; Abtastung ≤ 3 s je Verb | Läufe mit NUR Audio- und Text-Kanal bzw. NUR einem Schalter: Anteil Schritte, Zeit | |
| 5 | Stadt und zufällige Saaten: blind zur Adresse, taub durch den Verkehr, Ein-Schalter zum Fahrzeug | Beschreibung eines nie gesehenen Dings stimmt (Name, Lage, Gefahr) | wie 4 | 20 zufällige Stadt-Aufgaben je Sinn-Profil, Anteil geschafft ≥ 90 % | |
| 6 | Planet und Epochen: jede Reise, jeder Sport, jedes Erschaffen — auch was per Satz eben entstand | Stichprobe 20 Aufgaben × 5 Sinn-Profile an zufälligen (Same, Planet, Epoche) | wie 4 | Anteil geschafft ≥ 95 % je Sinn-Profil, mit echten Spielern bestätigt (offene Frage) | |

### L8 Ausdauer am Gerät: die Sitzung hält

Misst die Spieldauer am Stück auf der Geräteklasse der Sprosse ohne Drift (p95 der letzten 5 min ≤ erste × 1,05), ohne Speicherwachstum, ohne thermische Drosselung und mit begrenztem Akku-Verbrauch.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | 1 min Spielgang | kein Absturz, Soll-Tafel am Ende gemessen | Heap ungebunden, an G3 | Spielgang am Stück | HEUTE (1,06 min, Heap +185 MB/min ROT) |
| 1 | 5 min, Weg ≥ 1 km | Heap-Drift ≤ 5 MB/min, Soll-Tafel am Ende = am Anfang | p95 ohne Drift an G3 | 5-min-Spielgang | |
| 2 | 20 min, Weg ≥ 5 km, Tor, Nacht | VRAM-Drift ≤ 2 MB | an G2+G3 (Profiband K5) | 20-min-Spielgang, beide Geräte | |
| 3 | 60 min | wie 2 | am Handy G4 ohne Drosselung > 20 %, Akku ≤ 25 %/h | 60-min-Spielgang am realen Handy, Akku-Anzeige | |
| 4 | 4 h über Weltstadt, Fahrt, Sprünge | wie 2 | an G1–G7, Akku ≤ 20 %/h, VR ohne Hitze-Abbruch | 4-h-Spielgang je Klasse | |
| 5 | Tage, viele Planeten und Epochen in einer Sitzung | Speicher kehrt nach jedem Sprung zum Ausgangswert zurück (≤ 2 %), Soll-Tafel am Tag 3 = Tag 1 | wie 4 | Spielgang mit 100 Sprüngen: Heap/VRAM und Soll-Tafel nach jedem Sprung | |

## Stand heute

- **Ankunft:** GTX kalt 16,6 s (16,1–17,0), Zweit-Boot 12,0 s, Haupt-Faden bis zum Bild 97 % belegt; Radeon ≈ 11 s (CLAUDE.md PFLICHT-OFFEN B); einmal t(Kontrolle) kalt 8,78 s von außen an der Radeon (MEISTERKARTE.md:996). Alles am lokalen Server, nie über ein gedrosseltes Netz. Alte Karte Ankunft 1/10.
- **WebGPU ist Pflicht:** ohne `navigator.gpu` bricht der Boot mit Meldung ab (stamm/dirigent-ankunft.js:121-130, nachgeprüft) — G0 kommt nicht an. Die Holz-Wahl fragt den Adapter zuerst im WebGPU-Kompatibilitäts-Modus (`featureLevel: "compatibility"`, stamm/dirigent-regler.js:456-459) — ein Ansatz für ältere Grafik, aber nur hinter dem WebGPU-Tor. Ein Geräte-Profil (schwach/mittel/stark) liest Kerne, deviceMemory und den Adapter-Namen, Mali/Adreno/PowerVR per Muster (stamm/dirigent-regler.js:1041-1077, Muster Z. 1064, nachgeprüft); Software-GPU → Holz „kienspan". Ein Handy wurde nie gemessen.
- **Bild-Takt:** GTX stehend p95 16,8 ms; Radeon in Bewegung 66 % der Bilder > 33 ms gehend, 94 % fahrend (MEISTERKARTE.md:1049); Profiband 1/10.
- **Bytes:** Stamm 64 Dateien 9,1 MB + 10 Kerne 3,75 MB = 12,9 MB roh (nachgemessen am Baum zp-main-bild), vendor 2,3 MB; früher 2,7 MB gzip der Index-Skripte (MEISTERKARTE.md:986). Heap 290 → 486 MB in 1,06 min, VRAM nach GC 135,6 → 159,4 MB (MEISTERKARTE.md:1050). Speicher-Persistenz 10/10.
- **Eingabe:** Tastatur/Maus und Gamepad mit Totzone und freier Belegung (stamm/koerper-bewegung.js:2413-2434). Touch: kein `touchstart`, nur ein `pointerdown`-Stempel für die Eingabe-Zeit (stamm/dirigent-ankunft.js:499) — keine Finger-Steuerung. WebXR und Spracherkennung: 0 Treffer. Sprach-AUSGABE nur für den KI-Begleiter, eigener und der eines Mitspielers (stamm/werkstatt-hud.js:71-89, stamm/netz-p2p.js:2553-2574).
- **Zugang:** Untertitel aus dem Klang-Gesetz 39/39, Farbsicht-Modus (Deuteranopie/Protanopie/Tritanopie, stamm/bild-kosten.js:3931, Deuteranopie min ΔE 6,4 → 31,8 laut Kommentar Z. 3928), Komfort-Regler; DE/EN aus EINER Tafel. Kein Screenreader-Kanal, keine Beschreibung der Welt in Sprache.
- **Strom in Bewegung, dieselbe Welt:** nie als Anteil ganzer Bilder bzw. als Geräte-Vergleich gemessen.

## Abhängigkeiten

- **Der Same: Architektur der Entfaltung** und **Maßstab-Kontinuum**: L1 ab Sprosse 5, L3 ab Sprosse 5 und L4 ab Sprosse 3 verlangen, dass das Bild nach Schirm statt nach Welt entsteht; ohne diese Entfaltung fallen Ankunft, Reise und Gerätespanne gemeinsam.
- **Licht, Bild und Horizont**: die Tiefe jeder Sprosse ist deren Soll-Tafel derselben Sitzung.
- **Millionen** und **Siedlung und Stadt**: liefern den Welt-Umfang (Weltstadt, Übermetropole), gegen den L1–L5 messen; L5 Sprosse 2 verlangt deren Bewohner deterministisch aus dem Samen.
- **Der Spieler: Perspektive, Rolle und Reise**: Sprung und Abstieg (L1 6–7, L4 4–5) sind dort die Reise, hier ihr Preis.
- **Klang, Stimme und Musik**, **Kultur, Sprache** und **Erschaffen mit der KI**: L7 4–6 und L6 3, 6 lesen dasselbe Benennungs-Gesetz und dieselbe KI.
- **Sport**: L6 5 und L7 6 zählen dessen Verben.
- **Spur, Verfall und Gedächtnis**: L5 Sprosse 5 und L8 Sprosse 5 koppeln an den Speicher der Edits.
- Abgrenzung: dieses Blatt richtet PREIS, REICHWEITE und ZUGANG; was gezeigt wird und wie wahr es ist, richten die anderen Blätter — hier zählt, dass deren Tiefe auf jedem Gerät, für jeden Menschen, in Sekunden und ohne Bytes ankommt.

## Was die alte Karte hier misst

- **29 Ankunft (1/10)**: K1 kalt ≤ 5 s an beiden Geräten → L1 3; K2 Bild ganz, auch nach Drehung → L1 1–3; K3 Wiederkehr warm ≤ 1,5 s → L1 3; K4 erster Blick AAAA → Tiefe L1 3; K5 Lade-Bild lebt, Haupt-Faden ≤ 100 ms → Preis L1 3.
- **30 Streaming (5/10)**: K3 Sprung hält die Kadenz → L4 1–2 und L1 6; K5 Bytes reisen, nie Kopien → L3.
- **31 Profi-Band (1/10)**: K1 flüssig in Bewegung → L2 2; K2 CPU-Takt, K3 GPU-Haushalt (VRAM ≤ 118 MB) → L2 2 und L3 2; K4 keine Hänger → L2 2; K5 20 min ohne Drift → L8 2.
- **33 Speicher (10/10)**: Tab-Tod ≤ 10 s → Voraussetzung L8.
- **27 Spielgang (5/10)**: K3 INP ≤ 200 ms, Belegung frei → L6 1; K4 Untertitel, Farb-Modus, Komfort → L7 1; K5 Sprache DE/EN → L7 0.
- **25 Leib (7/10)**: Gamepad → L6 1.
- Die alte Karte kennt nur zwei Geräte; Handy, Tablet, Turm, VR, Browser ohne WebGPU, Touch, Stimme, Blindheit, Netz-Drossel, Geräte-Gleichheit und Strom in Bewegung fehlen ganz.

## Zweifel

- **Kein Handy, keine VR-Brille im Gerätepark**: jede Sprosse ab G4 verlangt ein reales Gerät mit Fern-Debug; ohne es bleibt der Richter ungefahren.
- **G0 (ohne WebGPU)** ist mit dem heutigen Boden (NodeMaterials nur auf WebGPU) unerreichbar; die Leiter fordert ihn trotzdem ab L1 7 und L2 4, weil die Vision „jeder Mensch" sagt. Ob der Kompatibilitäts-Modus oder ein anderer Weg ihn trägt, ist eine offene Frage, kein Punkt.
- **Ankunft ≤ 1 s für einen Planeten über 3G** ist Vision, nicht Rechnung; die alte Karte schätzt die Untergrenze ohne Strukturwechsel auf ≈ 8 s (MEISTERKARTE.md:1005).
- **Agenten-Läufe als Richter für Zugang** (L7) ersetzen echte Spieler mit fehlendem Sinn nur vorläufig; die oberste Sprosse braucht echte Spieler (offene Frage).
- **Gewichtung nach Verbreitung** (L2) braucht eine Quelle der Geräte-Verteilung inklusive Handys; keine gefunden.
- **Akku-Grenzen** (≤ 20–25 %/h) sind gesetzt, nicht recherchiert.
- **L5 Gleichheit über Geräte**: Gleitkomma-Unterschiede zwischen GPUs können Simulationen auseinanderlaufen lassen; ob 0,5 m nach 10 min hält, ist ungeprüft.

## Gegenlese — was sich änderte und was strittig bleibt

- **Gehoben:** Weltstadt 10⁷ und Übermetropole 10⁸ ersetzen die „Megastadt 10⁶" — 10⁶ ist kleiner als Tokio (≈ 3,7·10⁷) und damit nicht die Vision; L1-Spitze verlangt ≤ 1 s auch auf Geräten ohne WebGPU über 3G.
- **Neu (Lücken):** L4 Strom in Bewegung (Fahrt, Flug, Abstieg Orbit → Stein — bisher nur Teleport gerichtet) und L5 Dieselbe Welt auf jedem Gerät (der Same ist nur EIN Same, wenn jedes Gerät dieselbe Welt macht); G0 und Reichweite in L2.
- **Zusammengelegt (dieselbe Leiter):** Ein-Schalter stand in L4 und L5 zugleich — jetzt nur im Zugang (L7); die Netz-Ankunft stand in L1 und L3 zugleich — jetzt nur in L1, L3 richtet Bytes und Speicher.
- **Fleiß → Fähigkeit:** „N Modalitäten" und „39/39 Klänge" waren Listen; die Spitzen von L6 und L7 messen jetzt, ob ein per Satz erschaffenes Verb oder ein nie beschriebenes Ding aus einer Zufalls-Saat ohne Hand-Arbeit über jede Eingabe und in jedem Sinn ankommt.
- **Richter ohne Bauweise:** „Erst-Bild-Kern ≤ 1 MB" und „HUD ≥ 9 mm" schrieben eine Bauweise vor — ersetzt durch Bytes bis zur Kontrolle und Fehltipp-Quote.
- **Drei Achsen:** L3 trug „Tiefe: wie 0", L8 Sprosse 0 keinen Preis — jetzt hängt die Soll-Tafel an jeder Sprosse, sonst gewinnt jede Byte- oder ms-Zahl, indem sie weniger zeigt.
- **Stand geprüft:** WebGPU-Tor, Mali/Adreno-Muster und 13 MB stimmen; berichtigt: Sprachausgabe auch für den Begleiter des Mitspielers, ein `pointerdown`-Stempel existiert (keine Steuerung), Kompatibilitäts-Adapter-Abfrage ergänzt; L2 Sprosse 1 als „halb" statt HEUTE.
- **Strittig:** ob G0 in die Leiter gehört oder als offene Frage stehen sollte; ob L5 (Gleichheit) nicht in das Blatt „Der Same" gehört; ob Agenten-Läufe für Zugang je eine Sprosse tragen dürfen.
