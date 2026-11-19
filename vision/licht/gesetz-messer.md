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
