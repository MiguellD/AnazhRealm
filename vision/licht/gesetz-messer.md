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
