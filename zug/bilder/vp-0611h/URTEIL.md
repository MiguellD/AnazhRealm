**Urteil: GRÜN im Bild (Fragen 1–3) — Dorf: 0 Stämme in Haus/Bau/Weg/Platz, 0 binnen 2 m einer Hauswand, das Dorf von oben frei; Mess-Wiese im Blick 0 ↔ 0; Mischwald innen klar besser als main (Lichtfleck-Inseln am Boden 1 → 161, Bäume binnen 25 m 8 → 81). Zwei Befunde dazu: Kosten (Frage 4) Wiese +2,1 ms GPU (+11 %), Dorf-Spawn +6,7 ms (+40 %, Befehle 71 → 129); gipfel-blick ist auf dem Zweig zugewachsen (168 Bäume binnen 60 m, 46 binnen 25 m).**

# vp-0611h: GTX-Bild-Vorprüfung w16-wald-innen 68256659 gegen main 8efb6318 (OMEN, GTX 1060, 06.11. 17:55–21:35)

Je Seite warme Welten (`werkbank start --echt --ort wiese`), Mittag (Uhr 0,5), 1920 × 1080, Ego und Third mit der Kamera des Spiels.

- Das Vergleichsbild ist auf beiden Seiten der freie Schuss an derselben Pose (`__ausgabeAufnahme`, Satz „messung“). Die Bild-Abnahme verwirft verdeckte Ziele (Ego im Wald und im Dorf), deshalb liegt das Abnahme-Bild nur daneben.
- Zwei Welten je Seite (main1/main2, kand1/kand) halten die GPU-Zahl auf ±0,5 ms.
- Treiber: `p3/n0611/vp-wald.cjs`. Die Zahlen stehen in `diff.txt`. Links ist main, rechts der Zweig.
- Der Mischwald-Punkt (−160, −745) ist der dichteste flache Punkt nach dem Gesetz des Zweigs: Krone 0,839, 143 Bäume, Hang 0,36°.

## 1. Dorf — GRÜN

- **Lage:** Die 10 Häuser und Marktstände (haus_griechisch 6, haus_roemisch 2, marktstand 2) stehen 104–145 m vom Dorf-Spawn entfernt. Der Spawn liegt am Hang, deshalb zeigen `dorf-ego`/`dorf-third` auf beiden Seiten kein Haus.
- **Grundriss-Prüfung der Welt:** Über alle Bäume binnen 150 m (`_imGrundriss`/`_aufWeg`, Rand 0) zählt sie Haus/Bau/Weg = 0/0/0 auf main und 0/0/0 auf dem Zweig, bei 486 bzw. 1117 Bäumen.
- **Je Haus** (`_grundrissVon`): 0 Stämme im Grundriss und 0 Stämme binnen 2 m einer Wand, auf beiden Seiten.
- **`dorf-blick.jpg`** (Kamera 28 m über und 45 m vor den Häusern): Auf beiden Seiten liegen alle Häuser frei, kein Wald liegt über dem Dorf. Auf dem Zweig fehlt der Baum, der auf main vor dem Haus unten links steht.
- **Sichtlinien vom Spawn zu den 10 Häusern:** Stamm binnen 1,2 m der Linie bei 8 Häusern auf main und 6 auf dem Zweig. Über 100–145 m Hang ist das auf beiden Seiten Wald, kein Befund des Zweigs.
- **Spawn selbst:** Der Wald wird dichter. Bäume binnen 25 m 16 → 80, im Blick 6 → 55, das Bild wird dunkel: Luma Ego 76,7 → 37,5, Dunkel-Anteil 8,6 → 60,9 %.

## 2. Mess-Wiese — GRÜN

- **Messung in der Welt** (`wieseMessen` an −280,4 / −1045,6): im Blick 0 ↔ 0, Krone 0,108 → 0,116, Kranz 0,204 → 0,272, Bäume im Ring 8 → 11. Hang, Rauheit, Horizont und Gras sind gleich.
- **Bild:** Der Zweig hat die Bäume am Rand umgestellt. Der große Baum vorn rechts auf main fehlt, deshalb liegt die Fläche ohne seinen Schatten: Luma Ego 57,8 → 81,1, Dunkel-Anteil 14,6 → 1,8 %. Der Mittelgrund ist gleich frei.

## 3. Mischwald von innen — GRÜN, besser als main

- **Bild:** Auf main ist (−160, −745) eine offene Wiese mit Büschen (33 Bäume binnen 60 m, 8 binnen 25 m). Der Zweig zeigt dort einen Wald: 289 Bäume binnen 60 m, 81 binnen 25 m, 12 im Blick. Das Alter verteilt sich auf 1,0 = 86, 0,7 = 28, 0,4 = 175, die jungen Bäume bilden die Unterholz-Schicht.
- **`mischwald-third`:** Stämme in der Tiefe, Farn und Jungbäume, ein Erdpfad und Lichtflecken auf dem Boden.
  - Lichtflecken (unteres Drittel, Pixel heller als 1,8 × Median): 0,4 → 18,7 %, Inseln ≥ 40 px 1 → 161.
  - Ego 0,02 → 20,1 %, Inseln 0 → 188.
  - Himmel-Anteil Third 13,3 → 3,3 %.
- **Schwäche:** Im Ego-Bild steht ein Stamm vorn, der Rest ist Busch; der Himmel ist zu 11,5 % offen (main 20,1 %). Dunkle Laub-Fetzen schweben vor dem Himmel. Die gibt es auch auf main (`dorf-blick`), mit mehr Bäumen sieht man sie öfter.

## 4. GPU-Kosten (Mittag, gpu-bank 12 × 3; main2 → Zweig, in Klammern die erste Welt)

| Pose | GPU ms | Befehle | Dreiecke | Baum-Befehle / -Dreiecke |
|---|---|---|---|---|
| wiese ego | 19,58 → 21,70 (19,12 → 21,83) | 66 → 66 | 336 793 → 360 310 | 39 / 120 k → 39 / 142 k |
| wiese third | 18,60 → 20,85 (18,17 → 20,72) | 74 → 78 | 408 517 → 410 310 | 40 / 141 k → 44 / 141 k |
| genesis ego | 12,09 → 12,70 (12,06 → 13,08) | 65 → 66 | 344 162 → 365 638 | 19 / 60 k → 19 / 77 k |
| genesis third | 12,05 → 12,26 (11,90 → 12,25) | 61 → 60 | 239 951 → 251 026 | 23 / 65 k → 21 / 71 k |
| dorf ego | 16,62 → 23,33 (16,10 → 24,62) | 71 → 129 | 336 978 → 629 303 | 34 / 129 k → 92 / 406 k |
| dorf third | 17,98 → 22,90 (17,48 → 23,58) | 74 → 140 | 394 359 → 650 733 | 30 / 127 k → 94 / 398 k |

- **Dorf:** Den Zuwachs tragen `f:tanne:L0` (27 Befehle, 145 k Dreiecke; auf main nicht unter den sechs größten Baum-Klassen), `f:tanne:L1` 12 und `f:fichte:L0/L1` 7 + 12.
- **Wiese:** +2,1 ms bei gleichen Befehlen. Die Dreiecke der Bäume steigen 120 k → 142 k, die Klasse `fimp:atlas:L2` steigt 5 776 → 9 544. An der Mess-Wiese dürfte das die GPU-Ratschen der Wiese treffen.
- **CPU:** sonst gleich, Wiese Third 3,3 → 4,2 ms.

## Weitere Orte

- **genesis:** Das Bild ist gleich (Luma 102,7/102,3), Bäume binnen 60 m 44 → 82, binnen 25 m 0 → 0.
- **buehne:** gleich, 0 Bäume.
- **gipfel-blick:** Auf der GTX kommt main nicht an. Die Seite antwortet nicht mehr: 19:04 nach der Stadt, 20:44 frisch nach über 410 s, 21:24 frisch nach über 600 s. Der Zweig kam frisch nach 352,5 s an, nach dem Dorf aber nach über 420 s nicht. `gipfel-blick-zweig.jpg` zeigt deshalb nur den Zweig.
  - Er steht im Wald: 168 Bäume binnen 60 m, 46 binnen 25 m, 16 im Blick, Lichtflecken auf dem Kies.
  - Den Blick vom Gipfel verstellt der Wald. Die Krone des Gesetzes (Ring 25 m) steigt 0,078 → 0,285.
- **stadt:** In der frischen Sitzung auf beiden Seiten „Messort stadt: die Bahn verlässt die Gasse bei 609,1 / 419,0“. In der langen Sitzung kam die Stadt auf main an, das Bild verwarf die Abnahme (Vordergrund `bauSatz`). Kein Bild, kein Befund des Zweigs.

## Bilder

`wiese-*.jpg`, `mischwald-*.jpg`, `genesis-*.jpg`, `dorf-*.jpg` (Spawn), `dorf-blick.jpg` (die Häuser von oben), `buehne-*.jpg`, `gipfel-blick-zweig.jpg` (nur der Zweig).
