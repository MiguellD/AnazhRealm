# w28-strahler — ZIELBILD vor dem ersten Schnitt (GTX 1050, 18.11., gemessen an main c50e6b61, V18.546.329)

Dieses Blatt steht für sich: ein neuer Koordinator liest hier Auftrag, Stand und nächsten Schritt ohne die Sitzung, die es schrieb.

## Auftrag (Koordinator, 17.11. 23:05; ersetzt die Idee `w28-auge-quelle`)

EIN Strahler-Gesetz statt zwölf Wege: Licht und Wärme aus derselben Temperatur × Fläche. Befund-Blatt: `bericht/1711-glut-karte.md`
(13 Strahler, zehn Brüche B1–B10; gelesen an 08a8397b, nichts gemessen). Der Schnitt in fünf Punkten:

1. `strahler(T, A, n)` in fachwerk-core neben `lichtFarbe`/`lichtAbfall`: Farbe `lichtFarbe(T)`, Leuchtdichte aus EINEM Anker über
   `glutAus(T)`, Stärke = Leuchtdichte × A, Kern = √(A/π), mit Normale ein Lambert-Strahler, E(d) = L·A·cos / (d² + k²).
   Chokepoint `_flammenLicht` (dirigent-kern).
2. ALLE Leser ziehen um: jeder Zweig von `_leuchtQuellen`, `_lavaGlutNode`, die Zunge, Bett und Herd, Esse und Stahl, Funken; Fenster
   und Laterne treten ins Verzeichnis „licht“. Tor und Fahrzeug bleiben nicht-thermisch, tragen aber Leuchtdichte × Fläche.
3. Es fällt (Absenz-Grep): `LICHT_GESETZ.feuer.zeit`/`.staerke`, `LEUCHT_FEUER`, `FLAMME.ton`, `BRAND.bild.flamme.schein` und `ziel`
   samt Nachtauge-Umkehr, `BRAND.licht`, `FUNKEN.leucht`, die Glut-Palette der Vertex-Farben, das übersprungene `aGlut`.
4. Das Auge liest dieselbe Quelle: `_waagrechtIrradianz` nimmt Σ E am Auge aus dem Becken dazu.
5. Wärme, EIN Leser: die Lava zündet über E(d) gegen `tZuend`; ihre 8-Nachbarn-Regel fällt. Leib, Nässe, Schnee bleiben benannt offen.

Dazu aus der Annahme von `w28-lava-nachlauf` (18.11. 00:20), in diesem Kopf:
- ERSTER Commit: `worldMeta.tag` fällt (einziger Leser ist der Playtest `sprungNimmtTag`, er zieht auf die Prozess-Uhr).
- Im ersten WIP EINE Zahl: das teuerste Bild, wenn eine Brand-Front in gemischten Grund läuft (Bett-Masken in EINEM Takt × ihr
  Preis). Über 4 ms in einem Takt laufen die Masken über das Budget des Brands (die Zelle brennt grob an fünf Punkten, bis ihre
  Maske dran ist) und das Soll BRAND-ZELLEN geht zurück auf 64 je Zelle; sonst bleibt es.

Beweis am Ende: Bildpaar je (a)–(e) main ↔ Kopf, Nacht und Mittag; Absenz-Grep = 0; Wege, die Stärke zu setzen 12 → 1; kaskade und
ereignis nicht schlechter als am Kopf von lava-nachlauf; Preis-Zeile an der Lava-Pose; Tore format:check, check:statik, playtest,
gate:pruefbuehne-licht, gate:hoehlen-sicht. WIP `[skip ci]` pusht der Arbeiter, die Abgabe erst nach dem Blick des Koordinators
auf die Bildpaare. EIN Bericht am Ende mit Prozent je Punkt 1–5.

## Stand (18.11. 00:17)

Zweig `w28-strahler` lokal auf main c50e6b61, KEIN Commit, nichts gebaut. Gemessen sind nur die Zielbilder unten.
`w28-lava-nachlauf` (1d835734) ist angenommen und wartet auf den Zug; der Strahler-Schnitt fasst Brand-Code an, der dort in
`stamm/feld-brand.js` liegt (auf main noch in feld-leben.js) — gebaut wird erst auf einem main, das lava-nachlauf trägt.

## Die Zielbilder an main (960 × 540, Sommer, sonnig, `--uhr 0.5` Mittag ↔ `--uhr 0.0` Mitternacht; Dateien `main-<name>-{tag,nacht}.png`)

Luma = Mittel der 8-Bit-Werte des Ausschnitts (Rec. 709 auf dem Bild, wie es der Spieler sieht), gelesen mit dem PNG-Leser der
Abnahme (`scripts/lib/abnahme-urteil.cjs` `pngLesen`).

| | Ort · Pose (Kamera → Blick) | an main gemessen | Ziel am Kopf |
| --- | --- | --- | --- |
| (a) Herd am Brunnen | Wiese, Glutbrunnen −270/27,4/−1056 · nah `-266.5 28.6 -1052.5 → -270 27.6 -1056` · fern `-252 33 -1042 → …` | Nacht: Scheibe am Bett Luma 178, RGB 227/169/132 (fast weiß), Gras dahinter 114, Gras vorn 44. Mittag: Scheibe 101 — nachts 1,8× heller als mittags | Flamme mit Form, Bett orange-rot (r/g ≥ 1,6 statt 1,34, kein Kanal am Anschlag), der Boden fällt in wenigen Metern ab: von 1 m auf 4 m um den Faktor 13,9, den E(d) für ein Bett von 0,5 m² nennt (k = 0,40 m) |
| (b) Lava | Wiese, Guss −248/−1064 · nah `-243.5 28.6 -1056 → -248 27.6 -1064` · fern `-226 36 -1040 → -248 28 -1064` · „allein“ = die Zündung in der Probe gesperrt | Nacht, allein: Decke 68 (RGB 110/58/42, Risse rosa-weiß), Saum-Gras 42,5 (warm), Baumreihe 22,2 (RGB 22/23/17, neutral) | Kruste dunkel, Risse orange/rot statt rosa-weiß, Saum-Gras warm, Baumreihe ohne Schein (siehe „Die Zahl“) |
| (c) Rauchfahne | Wiese, der Brand am Guss · `-228 30 -1068 → -248 36 -1064` | Nacht: Fahne unten 45,0 ↔ oben 48,8; zweite Fahne 31,0 ↔ 32,2 — oben so hell wie unten | von unten beleuchtet, nach oben dunkler (oben ≤ ½ unten) |
| (d) Tor | Genesis · nah `-13.5 92.6 -1.9 → -21.8 93.3 -3.1` · fern `-2 94 2 → …` | Stein des Tors: Nacht 91,6 / 83,3 ↔ Mittag 82,1 / 88,9 — nachts so hell wie am Tag, flächig; Nachbarbau Nacht 74. Hauswand ohne Quelle im Dorf bei Nacht: 38,5 → der Tor-Stein steht 2,3× darüber | Relief: Verlauf von den goldenen Bändern weg, der Stein fern der Bänder nahe der Wand ohne Quelle |
| (e) Dorfgasse | Dorf · nah `-697.5 45 -882 → -707 42.5 -872` · fern `-688 48 -892 → -707 44 -872` | Nacht: Fenster 130, Boden unter dem Fenster 4,2 (dunkler als der Boden fern jeder Quelle, 22), Boden an der Laterne 50 | die Fenster werfen Licht auf den Weg: Boden unter dem Fenster über dem fernen Boden |
| Mittag, alle | dieselben Posen | Herd-Scheibe 101 gegen Gras 105–112 | kein Strahler überstrahlt die Sonne |

**Befund an (b), gegen den Auftrag gelesen:** der ocker-gelbe Waldsaum und der weiß ausgebrannte Kern stehen an main c50e6b61 an
dieser Pose NICHT mehr im Bild. Sie stammen aus `glut-s-lava-nacht.png` (ein Kopf von w28-glut-nacht vor dessen Abgabe: Saum-Gras 61,
Baumreihe 44 ocker RGB 56/43/20, Decke 114); an main misst die Baumreihe 22 und neutral. Dazu zündet die Lava an main das Gras
(23 Zellen nach 240 Takten), das Bild der Lava bei Nacht ist im Spiel also das Bild MIT Brand (`main-b-lava-nah-nacht.png`); „allein“
gibt es nur, wo nichts brennt. Im Fern-Bild stehen zwei helle Scheiben mit weißem Kern im Gras vor der Lava — nach Lage und
Gestalt Glutbrunnen (Bruch a), an der Quelle nicht geprüft. Was an (b) bleibt: die Risse rosa-weiß statt orange, und das Licht der Lava als Punkt in 2000 K.

## Die Zahl aus dem Gesetz für (b) — und eine Lücke der Formel im Nahfeld

Decke einer Zelle: A = 256 m², k = √(A/π) = 9,03 m, waagrechter Lambert-Strahler. Empfänger: eine senkrechte Fläche zur Quelle
gedreht, in Höhe h über der Decke, im Abstand d von der Zell-Mitte. Faktor Saum (d 10 m, h 0,3 m) ÷ Stamm (h 2 m):

| Stamm bei | E(d) = L·A·cos/(d²+k²) | exaktes Flächen-Integral über 16 × 16 m | heute (isotroper Punkt, k 8 m, Saum bei 32 m) |
| --- | --- | --- | --- |
| 40 m | 5,6× dunkler | 22,6× | 10,2×, jenseits 32 m trägt der Pool 0 |
| 60 m | 18,3× | 78× | 0 |
| 80 m | 42,9× | 187× | 0 |

Fern stimmen Formel und Integral auf 5 % (60 m: 2,31 ↔ 2,42 · 10⁻³ L). Am Saum liegt die Formel um den Faktor 4,5 UNTER dem Integral
(10 m: 0,042 ↔ 0,189 L; 9 m: 0,052 ↔ 0,406 L): der Kosinus EINES Punkts in der Zell-Mitte sieht das Gras am Rand streifend, die
Fläche direkt vor dem Gras sieht es steil. Mit der Formel allein bliebe das Saum-Gras kalt — das Gegenteil des Zielbilds.
Entscheidung des Arbeiters für den Bau: Richter ist das Integral an drei Punkten (Saum 10 m, 40 m, 60 m; Abweichung ≤ 15 %); die
EINE Funktion `strahler` trägt den Nahfeld-Term der Fläche, kein zweiter Weg. Im Bild gemessen wird am Kopf Saum-Gras ÷ Baumreihe
(an main 42,5 ÷ 22,2 = 1,9 bei neutraler Baumreihe, also ohne Lava-Anteil dort).

## Nicht gedeckt

- (c) nah und zwei Dorf-Posen urteilte die Abnahme ROT (Blickziel nicht im Bild, Gelände verdeckt 5,2 %); sie sind nicht abgelegt.
- Die Zahlen des Befund-Blatts (3,1–3,6× Belichtung Nacht ÷ Tag, 385 gegen 24 am Bett, 0 Quellen „fenster“) sind noch nicht an der
  Quelle geprüft; das ist der erste Schritt vor dem Schnitt.
- Kein Bild an der Esse, am Stahl, an Funken und am Fahrzeug-Licht.

## Nächster Schritt

1. Blick des Koordinators auf dieses Blatt (das Zielbild ist der einzige Zwischenbericht).
2. Sobald main lava-nachlauf trägt: erster Commit `worldMeta.tag` fällt; dann die Masken-Zahl; dann die Zahlen des Befund-Blatts
   an der Quelle prüfen und `strahler(T, A, n)` am Chokepoint bauen.

Werkzeug (lokal, GTX 1050): Befehls-Dateien `gtx1050-werkzeug/tmp/sz-main-{wiese,tor,dorf,dorf2,lava3}.bef` über
`werkbank-ort.sh` (ORT=wiese · genesis · dorf); für den Kopf dieselben Posen mit anderem Vorsatz der Datei-Namen.
