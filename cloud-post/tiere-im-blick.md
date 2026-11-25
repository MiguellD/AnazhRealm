# tiere-im-blick, Vorprüfung 1 (auf main 486a6685), ZWISCHENSTAND

## Das fehlende Gesetz (fünf Sätze)
1. Der wilde Bestand hielt jedes Tier an seinem Ort (`_bestandRegionen`), sein Leib aber erschien nach der Boot-Regel V18.315 nur ≥ `CREATURE_SPAWN_FAR_MIN` 130 m vom Spieler, verschoben auf einer Spirale weg von seinem Tier.
2. Die Herde, deren Tier 31 m vor der Mess-Wiese steht, stand darum als Leib 135–174 m fern (Median 93 m Versatz zum eigenen Tier), und in der Ich-Sicht lag nie ein Tier in Bildreichweite (200 px Maske: Hirsch ≤ 31 m, Bär ≤ 38 m bei 1280×720).
3. Das Gesetz, das fehlte, steht im Gehege längst (`_gehegeLeiber`): der Leib steht, wo sein Tier steht, bei der Ankunft erscheint jeder Leib, sonst nie im Blick.
4. Es gilt jetzt auch im wilden Bestand an EINEM Chokepoint, `_bestandErscheint` (stamm/kreatur-leben.js), gelesen von `_bestandLeibOrt` und `_kreaturWurf`; die Ankunft (`_bestandAnkunftTakt`, 60 Takte nach Ankunft oder Sprung) lässt den Leib auch im Blick erscheinen.
5. Die Wanderung hielt ihr Ziel nur eine feste Zahl Schritte (`slot < Z.bis`) und kehrte vor der Ankunft um; jetzt hält das Ziel bis 1,5 × Weg + Blick (`_kreaturWanderZiel`), der Revier-Anteil liest 13 statt 7 Punkte (`_kreaturRevier`).

## Das Band (Quelle mit Zahl)
- Dichte Rothirsch im schottischen Bergland: 84 % der Fläche > 5 je km², 65 % > 8 je km², Jagdreviere um 15 je km² (Scottish Environment Link, Deer Task Force; walkhighlands).
- Streifgebiet Hindin: 2,75–7,1 km², Mittel 4,3 km² (Exmoor-Telemetrie, wildlifeonline).
- Sicht im Spiel der Spitzenklasse: theHunter zeichnet Wild bis 384/416 m; bei uns trägt ein Leib 200 px erst ab Hirsch 31 m / Bär 38 m, also muss der Leib dort stehen, wo sein Tier steht.

## Je Sprosse, vorher ↔ nachher
| Sprosse | vorher (main 486a6685) | nachher (Kopf) | Station am Kopf |
|---|---|---|---|
| karte2.leben.tiere.arten#1 | Arten im Bild 0 / 0 (Werkbank, Zensus der Station wörtlich, gleiche Seite, altes Gesetz) | 2 / 3 (Hirsch 43/35, Bär 3/3, Fuchs 0/3) | ROT: 4 Arten (Akte 5b36f69a: 2) gegen ≥ 5, spielStunden 0,013 gegen ≥ 1, minPx und biome ✓ |
| tiere.K5#1 (leben.oeko.vielfalt#1) | ego Kreis 0 im Blick | ego Kreis 0 im Blick (Leib 31 m, außerhalb des Kegels erschienen) | ROT: ego 0 (Akte c445936d: 0), third 0 (Akte: 2 Bären), Bestand bis 18 |
| karte2.leben.tiere.wanderung#1 | min 0,47 (Bär), Hirsch 0,51–0,60 | min 0,60, Hirsch 0,61–0,71, Bär 0,60–0,75, 12 von 12 | GRÜN: Hirsch 0,56–0,71, Bär 0,59–0,75, Fuchs 0,85–1,06, im Lebensraum ≥ 0,97; keine Akte (Preis-Lauf 0 Bilder) |

Abdruck (`werkbank abdruck --gegen 486a668592`): wiese tiere 0 → 16, dorf 5 → 14.

## Kosten an der Wiese (Radeon, `werkbank lauf 30 --tiere frei`, gleiche Seite, je ein Lauf)
| | altes Gesetz | neues Gesetz |
|---|---|---|
| Bild-Zeit p95 | 49,88 ms | 50,68 ms |
| GPU p95 | 14,02 ms | 14,40 ms |
| CPU-Takt p95 | 27,47 ms | 37,72 ms |
| Zeichen-Rufe p95 | 120 | 126 |
| Dreiecke p95 | 380 693 | 409 338 |
| Leiber als Leib (≤ 100 m / gesamt) | 0 / 19 | 8 / 20 |

## Die Linse (gate:kreatur-takt, Probe lebensraum)
Neues Soll „Versatz Leib ↔ Tier im Median ≤ 1 m“ (am Kopf 111 von 128 Würfen am Ort, Median 0 m); Täter `geburt-fern` (das alte Gesetz wörtlich) ROT beim Namen: „0 von 71 Würfen am Ort ihres Tiers, Versatz im Median 82,9 m“. Selbsttest lebensraum: Täter 5 von 5 rot beim Namen, der Grund ROT allein am alten Soll unten (Geburt 4,6 m gegen ≥ 130 m). Leser: `_bestandErscheint`, `_bestandLeibOrt`.

## Soll zum Entscheid (nicht geändert)
`scripts/diag-kreatur-leben.cjs` lebensraum: `soll(z.minM >= 0.99 * z.fernMin, …)` mit `fernMin = CREATURE_SPAWN_FAR_MIN` (130 m) schreibt die alte Regel fest und steht am Kopf ROT. Vorschlag: `fernMin` → `A.CREATURE_SPAWN_CLEAR_M` (der Leib nie im Schritt des Spielers), Quelle: das Gehege-Gesetz und die 200-px-Reichweite oben.

## Stations-Diff-Vorschlag arten#1
`spielStunden ≥ 1` bei festen 40 Takten je Ort ist am Gerät nicht erzeugbar (gemessen 0,013 h). Vorschlag: die Station rafft die Zeit (Takt-Deckel × 5, 100 Takte je Ort) und misst `spielStunden` aus dem Delta von `state.spielZeit`.

## Bilder
960 × 540 in `cloud-post/tiere-im-blick-bild/`; Originale (1920 × 1080) unter
`C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/tiere-bild/`.
Wiese −280,4/−1045,6, Ich-Sicht 12:00: vorher und nachher nach vorn gleich (kein Tier im Kegel); im Rundblick nachher Hirschrücken und Fuchsohren im hohen Gras (rund2, rund3).

## Offen (mit Grund und Messnamen)
- tiere.K5#1: der Leib erscheint außer Blick, der Gang nach vorn trifft kein Tier im Kegel (ego 0); Leser: Sprosse leben.oeko.vielfalt#1.
- arten#1: 4 von 5 Arten; Luft (Singvogel nur singend 5–14 m) und Wasser (Forelle) tragen keine Maske ≥ 200 px; spielStunden braucht den Stations-Diff oben; Leser: karte2.leben.tiere.arten#1.
- wanderung#1 GRÜN ohne Akte: der Preis-Lauf zählte 0 Bilder; Leser: pm-Preis-Lauf (punkte.cjs karte2PreisLauf).
- 13 % der Würfe stehen 25–178 m neben ihrem Tier, wo dessen Ort keinen Grund trägt; Leser: gate:kreatur-takt lebensraum (versatz).
- CPU-Takt p95 27,5 → 37,7 ms an der Wiese, ein Lauf je Seite; Leser: werkbank lauf (cpuTaktMs).
