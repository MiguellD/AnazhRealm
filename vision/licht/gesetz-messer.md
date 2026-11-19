# Das Gesetz des Lichtmessers (19.11., gesetzt aus dem Zensus `zensus-messer.md`, VOR dem Spike)

Anlass: die Wald-Welle (Konifere als Kegel, `phyto-core.js:496`) fällt an `gate:tag-achse:echt` (Wiese, Sonnenaufgang, Sprung 0,16 EV).
Der Wald ist richtig; der Messer führt einen Zwilling der gezeichneten Gestalt. Zensus: der Messer misst EINFALLEND (Sonne × N·L × Sicht
an 32 Bodenpunkten + Himmel, k ∝ E^−0,75), die 32 Strahl-Pixel tragen das Bild der unteren Hälfte auf ≤ 0,03 — die Lücke liegt im
Schatten-Modell, nicht in der Stichprobe (Uhr 0,268: Messer-Sicht 0,001, Bild 0,144).

## Die Sätze

M1. **Der Messer bleibt ein Messer des einfallenden Lichts.** Er misst die Bestrahlung am Boden im Blick; die 18-%-Karte bleibt sein
    Anker (mittags Luma 110–130). Er wird kein Leuchtdichte-Messer des Bildes: eine helle Wiese bleibt hell, eine weiße Wand zieht das
    Bild nicht dunkel. (Die Linsen-Familie der Tag-Achse urteilt an der Karte; das bleibt ihr Soll.)
M2. **Seine Sicht ist die des BILDES.** An jedem Mess-Punkt gilt derselbe Sonnen-Schatten, den das Bild dort zeichnet — dieselbe
    Schatten-Funktion, dieselbe Maske der Karte, dieselben Körper. Der Messer führt KEINE eigene Gestalt der Welt.
M3. **Die Klasse fällt ganz:** Rahmen-Ellipse (`stamm/stoff-karte.js:664`, :730), feste Dichte ⅝ (:672), Deckung je Art (:718, :729),
    Ebene unter dem Auge statt Gelände im Blick (`stamm/dirigent-ankunft.js:1826`), 32-m-Grat-Gitter als Schatten-Werfer (:1724–1734).
    Was das Bild beschattet (nahe Mesh-Bäume, Stämme, Häuser, Fels), beschattet den Messer mit; was das Bild nicht beschattet, ihn nicht.
M4. **Kosten an Schirm + Änderung:** gemessen wird, wenn sich Licht oder Blick ändern, nie je Frame an einem exakten Float-Vergleich
    (`stoff-karte.js:747`); kein Haupt-Faden-Task des Messers > 0,2 ms (heute 0,1–0,166 ms bei 2 213 Werfern, an der Wiese mit 4 006 ungemessen).
M5. **Zeit (bedingt, vor-registriert):** die Belichtung hat heute keine Glättung. Sie bekommt nur dann eine, wenn der Spike zeigt, dass
    die WAHRHEIT allein springt (P1 fällt mit Bild-Sicht). Dann: eine Zeitkonstante am Auge (hell schneller als dunkel), und die Linse
    urteilt am eingeschwungenen Bild — als eigener Satz mit eigenem Spike, nicht als Rettung nach dem Ergebnis.

Nicht in dieser Welle, benannt: die Quellen der Nacht (Laterne, Feuer, Fenster) als Licht am Mess-Punkt — derselbe Satz M2 für jedes
Licht, das das Bild zeichnet; nächster Punkt der Licht-Welle 2. Der Himmels-Anteil ist heute unverdeckt (`bild-himmel.js:2193`), die
Abweichung ist ungemessen — der Spike nennt sie als Zahl, erst dann wird entschieden.

## Der Spike — Soll VOR der Rechnung (wird nach dem Ergebnis nicht bewegt)

Rechnung aus den vorhandenen Mess-Dateien (`z622/heil/mess-*.json`, `messer-*.json`): die Sonnen-Sicht des Messers wird durch die
Sicht des Bildes an den 32 Strahl-Pixeln ersetzt, E, k und die Bild-Helligkeit neu gerechnet, der Sprung wie in der Linse
(`scripts/lib/licht-linsen.cjs:1162–1204`).

| Nr | Probe | Soll | meine Vorhersage |
|---|---|---|---|
| P1 | Wiese am Wald-Kopf, Uhr 0,264–0,280, Sicht = Bild an den 32 Strahl-Pixeln | größter Sprung ≤ 0,10 EV | 0,05–0,09 |
| P2 | wie P1, Sicht = Bild der ganzen unteren Hälfte | ≤ 0,10 EV | wie P1 ± 0,02 |
| P3 | Genesis am Wald-Kopf, Uhr 0,30–0,36 (neu gemessen mit `messer.js`) | Buckel ≤ 0,15 EV · Sprung ≤ 0,10 EV | Buckel ≤ 0,05 |
| P4 | Wiese am Inhalt von main (Basis e4e3f363) | größter Sprung ≤ 0,10 EV | 0,09 ± 0,02 |
| P5 | Mittag an Wiese und Genesis | k bewegt sich ≤ 0,05 EV | ≤ 0,02 |
| P6 | Himmels-Anteil: Abweichung „unverdeckt“ gegen die Verdeckung des Bildes an der Wiese | nur Zahl, kein Soll | — |

Benanntes Risiko: die wahre Sonnen-Sicht steigt am Aufgang in EINEM Schritt von 0,023 auf 0,144 (× 6). Trägt der Himmel dort wenig,
springt die Wahrheit selbst über 0,10 — dann fällt P1 mit Grund, und M5 öffnet.

Richter der Bau-Welle (nach dem Spike, in der Hand der GTX 1050): `gate:tag-achse:echt` GRÜN am Wald-Kopf an Wiese UND Genesis,
`gate:tag-achse:bahn` ohne neuen Buckel, Mittag-Bilder unbewegt, Linsen-Zeile „der Messer liest die Sicht des Bildes“ mit Mutant
(Rahmen-Ellipse zurück → ROT an der Wiese am Wald-Kopf).

## Spike 1 (19.11., Opus, Tafel `spike-messer.txt`) — P1 GEFALLEN: die Sicht allein trägt nicht

Die Rechnung gibt die gemessene TAG-Zeile auf 0,001 EV wieder (Wiese 0,12 / 0,16 / 0,15 / 0,16 / 0,13). Kein Soll bewegt:
P1 ROT 0,108 EV (Uhr 0,272; heute 0,16; meine Vorhersage 0,05–0,09 Fehlschuss) · P2 ROT 0,110 · P3 ROT am Sprung 0,133 EV (Genesis
Uhr 0,32 → 0,33; Buckel −0,06 im Soll) · P4 UNGEMESSEN (Bild-Sicht an der Basis fehlt) · P5 GRÜN (Mittag −0,02 / +0,01 EV) ·
P6 0,0 % (das Bild nimmt der Wiese keinen Himmel, genau wie der Messer; der Himmel trägt 100 % von E am Aufgang, 19 % am Mittag).
Grund für P1: auch mit der Sicht des Bildes rechnet der Messer die Sonne als N·L einer WAAGRECHTEN Ebene — im Bild trägt die Sonne
mehr (Uhr 0,268: 0,097 gegen 0,066), weil Halme und senkrechte Flächen ihr zugewandt stehen. Unter 8° Sonnenhöhe gilt k ∝ 1/E
(der Zensus-Satz k ∝ E^−0,75 gilt erst ab 12°): wäre E des Messers das E des Bildes, stünde das Bild dort still.
Fund daneben: an Genesis springt das Bild HEUTE um 0,34 EV zwischen Uhr 0,31 und 0,32; die Schritte der Linse an `--kurz`
(0,28 / 0,33) sehen es nicht.

## M2 geschärft (gesetzt VOR Spike 2)

M2'. **Der Messer liest die BESTRAHLUNG, die das Bild an seinen Flächen zeichnet — nicht nur dessen Schatten.** Der Sonnen-Anteil
     am Mess-Punkt ist der des Bildes (dieselbe Fläche, dieselbe Normale, derselbe Schatten), nie N·L einer gedachten waagrechten
     Ebene. Damit fällt auch der Zwilling „Boden = waagrecht“ (`stamm/bild-himmel.js:2171` `_waagrechtIrradianz`).
M5 bleibt vor-registriert, öffnet aber NICHT auf P1 hin: der Grund des Falls ist ein benannter zweiter Zwilling, keine springende
Wahrheit. Eine Glättung, die die Linse erst nach dem Einschwingen urteilen ließe, wäre die Rettung nach dem Ergebnis.

| Nr | Probe (Spike 2, aus denselben Mess-Dateien) | Soll | meine Vorhersage |
|---|---|---|---|
| Q1 | Wiese am Wald-Kopf, Uhr 0,264–0,280: Sonnen-Anteil des Messers = Sonnen-Anteil des Bildes an den 32 Strahl-Pixeln | größter Sprung ≤ 0,10 EV | ≤ 0,03 (unter 8° gleicht k ganz aus) |
| Q2 | Genesis am Wald-Kopf, Uhr 0,30–0,36, ebenso | Sprung ≤ 0,10 EV · Buckel ≤ 0,15 EV | Sprung 0,06–0,10 |
| Q3 | Mittag an Wiese und Genesis | k bewegt sich ≤ 0,05 EV — ODER die Zahl zeigt, um wie viel der Anker (Karte 110–130) neu zu setzen ist | 0,05–0,15 (der Messer liest dann mehr E als waagrecht) |
| Q4 | Rest-Fehler: wie weit weicht die Wahrheit des Bildes von „Sprung 0“ unter 8° ab, und woran | nur Zahl | — |

Reißt Q1 oder Q2, obwohl der Messer das E des Bildes liest, dann springt die Wahrheit — erst DANN öffnet M5.

## Spike 2 (19.11., Opus, Tafel `spike-messer.txt` ab „SPIKE 2“) — M2' bricht den Anker: M1 hält, „dieselbe Normale“ fällt

Kein Soll bewegt: Q1 GRÜN 0,085 EV (Uhr 0,272; meine Vorhersage ≤ 0,03 Fehlschuss) · Q2 ROT am Sprung 0,101 EV (Genesis Uhr 0,31 → 0,32,
heute 0,34; Buckel −0,154 im Soll; Vorhersage 0,06–0,10 Fehlschuss) · Q3 ROT: am Mittag bewegt sich k an der Wiese um −0,188 EV, an
Genesis um +0,055 — kein EINER Anker trägt beide Orte (zielKarte 0,251 gegen 0,212; Vorhersage 0,05–0,15 Fehlschuss) · Q4: unter 8°
bleiben 0,085 EV; schon VOR der Sonne (Uhr 0,258–0,264) stehen 0,08–0,09 EV je Schritt 0,002 aus drei Ursachen: (1) die Knoten der
Dämmerung heben die Karte gewollt um 0,031 EV je Schritt (`welt-licht.js:84`, :651–659), (2) die Szene des Bildes steigt je Schritt
~0,02 EV schneller als der Himmel des Messers (`bild-himmel.js:2193`, Herkunft ungelesen), (3) der Fuß der Tonkurve dehnt +0,05 der
Szene zu +0,07–0,08 im Bild. Am Kopf von main steht die Wiese damit selbst bei 0,09 von 0,10.
Fund Genesis: der Sprung 0,31 → 0,32 ist kein fremder Körper — der Schatten EINER Karten-Krone verlässt den nahen Boden (4–13 m) und
gibt 11 der 32 Strahlen frei; der Messer führt ihn als weiche Ellipse (Sicht 0,08–0,49), das Bild als harten Schatten.

Meine Entscheide (alle VOR Spike 3):
- **M1 hält, „dieselbe Normale“ aus M2' fällt mit Grund.** Zwei meiner Sätze widersprechen sich an der Messung (Q3); der Anker ist das
  Fundament der Soll-Tafel (Pflicht A), also weicht M2'. Der Empfänger des Messers bleibt die waagrechte Karte. Der Zwilling
  „Boden = waagrecht“ ist damit KEIN Zwilling, sondern die Definition der Karte; mein Satz dazu ist zurückgezogen.
- **M5 ist zurückgezogen, beim Namen:** die Linse urteilt eingeschwungene Bilder; eine Zeitkonstante ändert keinen Schritt zwischen zwei
  eingeschwungenen Zuständen. Der Satz war nicht zu Ende gedacht.
- **M2 gilt für JEDES Licht, das der Messer zählt — Sonne UND Himmel:** der Himmel des Messers ist der des Bildes (Ursache 2 ist
  derselbe Zwilling wie die Ellipse, nur am zweiten Licht).
- **M6 (neu) — die Stichprobe ist eine FLÄCHE, keine 32 Punkte:** liest der Messer den harten Schatten des Bildes an 32 Punkten, hängt
  k an EINER Krone (11 von 32 Strahlen). Die Sicht ist das Flächen-Mittel des Bild-Schattens über die untere Bildhälfte.
- **Das Maß der Linse, vor-registriert (keine Schwelle bewegt sich):** SPRUNG urteilt 0,10 EV je Schritt — am Horizont im Feinschritt
  0,002, sonst am Schritt 0,01, also an fünffacher Uhr-Spanne mit derselben Schwelle. Reißt nach Spike 3 ein Schritt 0,01, der im
  Feinschritt 0,002 als Steigung ohne Einzel-Schritt > 0,10 steht, dann tastet die Linse JEDEN reißenden Schritt im Feinschritt nach
  (wie heute schon am Horizont, `licht-linsen.cjs` `tagFeinUhren`) und urteilt dort. Steht im Feinschritt ein Einzel-Schritt > 0,10,
  bleibt es ROT und der Täter ist das Bild.

| Nr | Probe (Spike 3: Sicht = Flächen-Mittel des Bild-Schattens, Himmel = Himmel des Bildes, Empfänger waagrecht) | Soll | meine Vorhersage |
|---|---|---|---|
| R1 | Wiese am Wald-Kopf, Uhr 0,258–0,282, Feinschritt 0,002 | größter Sprung ≤ 0,10 EV | 0,06–0,09 |
| R2 | Genesis am Wald-Kopf, Uhr 0,30–0,36, Schritt 0,01 | Sprung ≤ 0,10 EV · Buckel ≤ 0,15 EV | Sprung 0,10–0,13 (ROT: wahres Schatten-Ereignis) |
| R3 | Mittag an Wiese und Genesis | k bewegt sich ≤ 0,05 EV | ≤ 0,05 |
| R4 | Genesis Uhr 0,310–0,320 im Feinschritt 0,002 (neu gemessen): heute und unter Spike 3 | nur Zahl: größter Einzel-Schritt | heute ein Schritt > 0,15 · Spike 3 ≤ 0,05 |
| R5 | Wiese vor der Sonne (Uhr 0,258–0,264) mit dem Himmel des Bildes | nur Zahl je Schritt | 0,04–0,05 |
| R6 | Wiese am Inhalt von main (Basis e4e3f363), dieselbe Rechnung | größter Sprung ≤ 0,10 EV | 0,05–0,07 |

## Spike 3 (19.11., Opus, Tafel `spike-messer.txt` ab „SPIKE 3“, voll in `s3-tafel.txt`) — Fläche + Himmel des Bildes tragen den Aufgang

Rück-Probe 0,0007 EV. Kein Soll bewegt: R1 GRÜN Wiese am Wald-Kopf 0,065 EV (heute 0,162; Treffer) · R2 ROT am Schritt 0,01: Genesis
0,124 EV bei Uhr 0,31 → 0,32 (heute 0,341; Buckel −0,096 im Soll; Treffer) · R3 ROT: Mittag Wiese −0,007, Genesis +0,060 EV — die
wahre Sicht der Fläche ist dort 0,870, der Messer zählt heute 0,932 (Fehlschuss) · R4 Feinschritt Genesis 0,310–0,320: heute
0,05 · 0,05 · 0,08 · 0,12 · 0,04 (EIN Schritt über 0,10 — heute bleibt es ROT auch im Feinschritt), unter Spike 3
0,02 · 0,00 · 0,01 · 0,03 · 0,06 (Steigung, größter Schritt 0,06; beide Vorhersagen Fehlschuss) · R5 vor der Sonne 0,05 · 0,04 · 0,05
je Schritt (heute 0,08–0,09; Treffer) · R6 GRÜN Wiese am Inhalt von main 0,048 (heute 0,091; Vorhersage 0,05–0,07 knapp daneben).
Sicht 32 Strahlen gegen Fläche: größte Abweichung 0,017. Gemessen am Wald-Kopf 70539e9e und am Haupt-Klon b7ed8419 (Licht-Kette ohne Diff).

Zensus Himmel: Messer und Bild lesen DENSELBEN Himmel im Niveau (Tafel `_himmelsBestrahlung` gegen Umgebung „oben“: 0,99–1,01) — kein
Zwilling der Quelle. Der Unterschied ist der EMPFÄNGER: das Bild beleuchtet je Normale (PMREM-Umgebung, `welt-licht.js:849`,
`stamm/bild-sicht.js:680–718`), der Messer eine waagrechte Fläche. Die Umgebung „senkrecht“ steigt vor der Sonne schneller
(0,34 / 0,29 / 0,26 / 0,22 je Schritt gegen 0,27 / 0,23 / 0,21 / 0,18 „oben“), das Bild der Wiese liegt dazwischen (≈ 0,29 Anteil
senkrechter Normalen, die Halme). Rückstrahl, Grat-Band, Nebel durch Abschalten ausgeschlossen (an main).

Urteil und Entscheide (VOR Spike 4):
- **M2, M3, M6 stehen:** die Sicht des Messers ist das Flächen-Mittel des Bild-Schattens. Das ist der sichere Teil des Baus.
- **Das Maß der Linse greift wie vor-registriert:** R2 reißt am Schritt 0,01 und steht im Feinschritt als Steigung (≤ 0,06) — die Linse
  tastet jeden reißenden Schritt im Feinschritt nach. Heute bleibt Genesis dabei ROT (0,12), der Täter ist der Messer, nicht das Maß.
- **Mein Satz „M2 gilt für den Himmel, der Himmel ist ein Zwilling“ ist berichtigt:** die Quelle ist dieselbe, es ist die FORM des
  Empfängers. Spike 3 hat den Himmel des Bildes je Ort am Mittag verankert (Setzung U3) — das kann kein Messer bauen. Was er bauen
  kann, ist EIN Empfänger für jedes Licht.
- **M7 (Kandidat, vor Spike 4 gesetzt) — der Empfänger ist eine KUPPEL, keine flache Karte:** die Halbkugel nach oben, wie der
  Belichtungsmesser der Fotografie für räumliche Motive (flache Scheibe für flache Vorlagen, Kuppel für Körper). Antwort auf
  gerichtetes Licht (1 + sin h) ÷ 2, der Himmel über dieselbe Kuppel integriert; EINE Form für Sonne und Himmel, an jedem Ort und zu
  jeder Uhr dieselbe, kein gemessener Normalen-Anteil, kein Knick nach Sonnenhöhe. Die flache Karte bleibt das MASS der Linse am
  Mittag (Luma 110–130); `zielKarte` wird höchstens EINMAL als Zahl neu gesetzt, für alle Orte gleich.
- **R3 bleibt ROT, benannt:** an Genesis bewegt allein die wahre Sicht den Mittag um +0,06 EV. Mein Band ≤ 0,05 war enger als der
  Richter; in Spike 4 urteilt am Mittag der Richter der Linse selbst (ANKER: Karte in 110–130), und die Bewegung steht als Zahl.

| Nr | Probe (Spike 4: Sicht = Fläche, Empfänger = Kuppel für Sonne und Himmel, aus den vorhandenen Mess-Dateien) | Soll | meine Vorhersage |
|---|---|---|---|
| V1 | Wiese am Wald-Kopf, Uhr 0,258–0,282, Feinschritt | größter Sprung ≤ 0,10 EV, kein Schritt unter −0,10 | 0,05–0,08 |
| V2 | Genesis am Wald-Kopf, Uhr 0,30–0,36: Schritt 0,01 als Zahl, Feinschritt 0,310–0,320 | Feinschritt ≤ 0,10 EV · Buckel ≤ 0,15 EV | Feinschritt ≤ 0,07 |
| V3 | Wiese am Inhalt von main | größter Sprung ≤ 0,10 EV | 0,04–0,06 |
| V4 | Mittag, beide Orte: Karte heute und unter Spike 4, mit EINEM neu gesetzten `zielKarte` (die Zahl nennen) | Karte an beiden Orten in 110–130 · Unterschied der Bewegung zwischen den Orten ≤ 0,08 EV | Bewegung Wiese ≈ 0, Genesis +0,05–0,07 |
| V5 | Überschießen: dunkelt das Bild, wenn die Sonne die Fläche trifft (negativer Schritt), Uhr 0,264–0,282 und 0,31–0,32 | nur Zahl: kleinster Schritt | ≥ −0,03 |
| V6 | dieselbe Rechnung mit FLACHEM Empfänger und Flächen-Sicht allein (ohne Himmel des Bildes) | nur Zahl: Wiese Wald · Genesis fein · Wiese main | 0,10–0,11 · ≤ 0,08 · 0,07–0,09 |
| V7 | Bahn-Stützen: Gold (Sonne 10°: −1 … −0,5 EV) und Mittag-Buckel an der Wiese unter Spike 4 | im Soll der Linse | im Soll |

Reißt V1 oder V2 mit der Kuppel, fällt M7 als Kandidat, und der Bau fährt mit M2/M3/M6 und dem flachen Empfänger — was dann am
Wald-Kopf rot bleibt, steht als Zahl in V6.

## Spike 4 (19.11., Opus, Tafel `spike-messer.txt` ab „SPIKE 4“, voll in `s4-tafel.txt`) — die Kuppel FÄLLT; der Bau fährt mit der flachen Karte und der Flächen-Sicht

Kein Soll bewegt: V1 ROT 0,123 EV (Wiese am Wald-Kopf, Uhr 0,282 — die Kuppel nimmt die tiefe Sonne mit ≈ 0,5 statt ≈ 0,1, im Knick
8–12° holt k nicht nach; Fehlschuss) · V2 GRÜN fein 0,084 · V3 GRÜN 0,068 · V4 GRÜN (Karte Wiese 125,3 → 125,3, Genesis 125,4 → 128,4
mit `zielKarte` 0,2468) · V5 kleinster Schritt −0,029 · **V6 (flach + Flächen-Sicht, Himmel = Tafel wie heute): Wiese am Wald-Kopf
0,074 · Genesis fein 0,063 · Wiese main 0,073** — alle unter 0,10; Mittag k Wiese −0,007, Genesis +0,060, main +0,027; Genesis am
Schritt 0,01 größter 0,133 (Steigung, im Feinschritt 0,063) · V7 ROT: Gold unter der Kuppel −2,10 / −1,98 EV (Soll −1 … −0,5).
Vorhersagen: vier Treffer, fünf daneben. Die Schranke der Himmels-Näherung ändert V1 nicht (0,116 … 0,155).
**M7 ist gefallen, wie vor-registriert.** Der Empfänger bleibt die flache Karte (M1). Der Himmel bleibt die Tafel des Messers.

Benannte Kosten der Wahrheit, VOR dem Bau:
- GOLD an der Wiese (Sonne 10°, Soll der Linse −1 … −0,5 EV, geurteilt nur an der ganzen Bahn): heute Wald-Kopf −0,66, main −1,03 (in
  dieser Messung schon knapp außerhalb); mit der wahren Sicht −1,16 / −1,19. Der Messer zählt dann die Sonne, die das Bild wirklich
  trägt, und zieht den Morgen dunkler. Reißt GOLD an der Bahn nach dem Bau, dreht NIEMAND die Sicht zurück; der EINE Stellwert ist
  der Knoten des Gesetzes bei 10° (`welt-licht.js:84`), einmal aus der Messung gesetzt, die REF-Zeile der Linse muss halten.
- Mittag Genesis: k +0,060 EV (die wahre Sicht ist 0,870 statt 0,932), die Karte rechnerisch ≈ 128 von 130.

## Das Gesetz, wie es gebaut wird (Fassung nach vier Spikes)

M1 flache 18-%-Karte als Empfänger und Anker · M2 die Sonnen-Sicht des Messers ist der Schatten, den das BILD zeichnet (dieselbe
Schatten-Funktion, dieselbe Maske, dieselben Körper) · M3 die Klasse der eigenen Gestalten fällt ganz · M4 Kosten an Schirm + Änderung
· M6 die Stichprobe ist die FLÄCHE der unteren Bildhälfte · die Linse tastet jeden reißenden Schritt 0,01 im Feinschritt nach.
Zurückgezogen beim Namen: M2' („dieselbe Normale“), M5 (Zeitkonstante), M7 (Kuppel), „der Himmel ist ein Zwilling“, „der Messer
liest, was im Blick LEUCHTET“.

## ASYNC — Entscheid des Koordinators VOR dem Bau (19.11., nach der Vor-Probe des Schneiders)

Befund der Vor-Probe: die Linse tastet `sofort` direkt nach `setTimeOfDay`, VOR jedem Frame (`scripts/lib/licht-linsen.cjs:1102`,
geurteilt :1204, Schwelle 0,05 EV). M2 macht das unmöglich, und zwar aus dem Bau, nicht aus der Faulheit: die Schattenkarte der neuen
Uhr gibt es erst, wenn der erste Frame an der neuen Uhr gezeichnet ist; die Lesung kommt 1–2 Frames danach. Ein Messer, der liest,
was das Bild zeichnet, kann dem Bild nicht vorausgehen. Gerechnet: Wiese Uhr 0,27, wörtlicher `sofort`-Wert 0,2–0,3 EV.

Entscheid:
- **Der Zweck von ASYNC bleibt** (Belichtung und Licht aus DERSELBEN Uhr, kein nachhinkender Schreiber). Die Schwelle 0,05 EV bleibt.
- **Der Tast-Punkt wandert**: ASYNC urteilt am ersten Frame NACH der Lesung der neuen Uhr gegen das eingeschwungene Bild.
- **Neue Schranke (B9): Frames von `setTimeOfDay` bis zur Lesung ≤ 3.** Reißt sie, ist ASYNC ROT, gleich wie klein der Wert ist.
- **Der wörtliche `sofort`-Wert bleibt als Zahl in der TAG-Zeile** (nicht geurteilt) — damit niemand den alten Richter für still
  gefallen hält.
- **Kein Zwilling:** kein synchroner Ersatz-Messer für den Sprung. Ohne Lesung gilt die letzte Lesung; ganz ohne (erster Frame der
  Welt, Null-Renderer, Kienspan) Sicht 1.
- **B10, im Spiel:** jeder Rufer eines Uhr-SPRUNGS (Ankunft, Stand laden, Schlaf/Zeitsprung, Schöpfer-Regler) steht mit Datei:Zeile
  in der Abgabe, mit dem Satz, ob ein Vorhang ihn deckt. An der Ankunft und beim Laden hebt der Vorhang erst NACH der Lesung
  (Ankunft B darf dadurch nicht messbar wachsen: ≤ 3 Frames). Der fließende Tag ist kein Sprung: 3 Frames Verzug sind dort
  < 0,001 EV.
- **Mutant der Linse:** Lesung um 8 Frames verzögert → ASYNC ROT. Zweiter Mutant: der Himmel des Messers eine Uhr hinterher → ROT.

Vorhersage (vor dem Bau): Frames bis zur Lesung 2–3 · wörtlich `sofort` an der Wiese Uhr 0,27: 0,2–0,3 EV, am Mittag < 0,05 ·
ASYNC am neuen Tast-Punkt ≤ 0,02.
