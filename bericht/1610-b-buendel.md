# Bericht 1610 B-Bündel — Ankunft kalt auf der GTX: A = main 3caca1cd gegen B = integ 985a923b (V18.546.7)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16.10. (Pflicht-OFFEN B), gebündelt: B2 Ankunft-Stufe, G2 Lade-Frist je Aufgabe,
SO. `diag-boot-stage --kalt --echt` 4+4. Gefragt: Weltbild = Kontrolle, die zuletzt offene Lücke, das Bild der Ankunft (kein Loch)
und 10 s danach (kein Sprung).

## Urteil

**Das Bündel holt auf der GTX 2,4 s: t(Weltbild) = t(Kontrolle) 21,48 → 19,13 s.** Alle 4 B-Boots liegen unter allen A-Boots.
- **Kein Loch:** Die Ankunft von B zeigt Boden, Bögen, Wald und Himmel ganz, in 8/8 Boots kein „steht ohne“.
- **Aber ein Sprung:** Die Ankunft von B trägt die grobe Stufe (30 statt 48 Befehle, ~180k statt ~289k Dreiecke).
  - In den 10 s danach ändern sich 22,3 % der Pixel; A ändert sich im selben Fenster um 12,8 % (Wolken, Membranen, Wind).
  - Das Plus von +9,5 Punkten sitzt in den **Baumkronen oben**: Raster-Ecken oben links +48, oben rechts +46 Punkte, die zweite
    Reihe +14/+16.
  - Sichtbar: Die Kronen wechseln von hellen, flachen Karten zur dunklen vollen Krone. Der Ring der Bögen wird feiner.
  - Die untere Bildhälfte (Boden, Bögen, Dorf) ist gleich (≤ 3 Punkte).
- **Zuletzt offen bei B:** Wald-Stücke, die auf ihre Gestalt warten, und ferne Bäume (bis 18,6 s), dann Bäume/Bauten (18,2 s). Das
  Dorf ist bei 11,0 s geplant (A 17,0 s); auf die Häuser wartet B nie (A bis 18,0 s).

| | A 3caca1cd | B 985a923b | Δ |
|---|---|---|---|
| t(Weltbild) = t(Kontrolle) s | 21,41 · 21,84 · 21,04 · 21,57 = **21,48** | 19,71 · 19,50 · 18,52 · 18,82 = **19,13** | **−2,35** |
| zuletzt offen: Bäume/Bauten wachsen | 21,3 | 18,2 | −3,1 |
| Wald-Stücke warten auf Gestalt · ferne Bäume | 18,5 · 17,3 | 18,6 · 18,6 | +0,1 · +1,3 |
| das Dorf wird geplant · Häuser des Dorfs | 17,0 · 18,0 | 11,0 · — | −6,0 · nie |
| Horizont · Boden | 14,6 · 7,1 | 15,8 · 8,3 | +1,2 · +1,2 |
| Erst-Bau Pipelines (s) · blockiert s | 70,3 (3,3) · 16,0 | 69,8 (3,4) · 16,7 | gleich · +0,7 |
| Kosten s: Streu · Bauten · Boden | 1,8 · 0,6 · 0,8 | 1,4 · 0,5 · 0,8 | −0,4 · −0,1 · 0 |
| Settlement da s | 12,6 | 10,6 | −2,0 |
| Bild der Ankunft: Befehle · Dreiecke | 48 · 288k | 30 · 180k | grobe Stufe |
| Bild 10 s danach: Befehle · Dreiecke | 53 · 330k | 54–55 · 250k | |
| Sprung in 10 s: Pixel mit \|Δ\| > 24 · mittel \|Δ\| | 12,8 % · 11,8 | 22,3 % · 21,0 | +9,5 Punkte |

- **Raster des Sprungs** (`sprung-raster.txt`, 4 × 4, B − A in Punkten): obere Reihe 48,2 · 9,3 · 7,3 · 46,0; zweite Reihe
  14,0 · 15,7 · 5,3 · 0,5; die unteren zwei Reihen ≤ 2,9.
- **Bilder:** `A2.png` (A Ankunft, volle Kronen), `B2.png` (B Ankunft, Karten-Kronen, grober Ring), `B2-10s.png` (B 10 s danach,
  volle Kronen), `A2-10s.png`.
- **Für das Ziel ≤ 5 s** ist die nächste Kette weiter der Wald. Wald-Gestalt und ferne Bäume stehen auch bei B bis kurz vor dem
  Weltbild offen (~18,6 s).

## Methode

- **Instrument:**
  - EINE Linse: die von 985a923b, mit einem Stations-Patch (`linse-patch.diff`, nicht im Repo) in beiden Bäumen (abab-bba,
    abab-bbb, md5 gleich).
  - Der Patch: Nach dem Bild der Ankunft läuft `_gameLoopTick` 10 s weiter, dann folgt dasselbe Bild der Bühne (Mittag · Sonne ·
    Sommer). Er zählt die Pixel mit max-Kanal-|Δ| > 24 und das mittlere |Δ|.
  - Die „zuletzt offen“-Zeiten zählen nur Proben bis t(Weltbild).
- **Boots:** `--kalt --echt --sek 180`, leeres Profil je Boot, 1920×1080, Folge A1 B1 … A4 B4, GPU-Schloss.
- **CI-Ruhe:** Die Serie wartete mit dem Schloss 175 s nach dem Echt-Lauf an 985a923b (Ende 23:03:39). Kein CI-Lauf im Fenster.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-b-buendel/`.
  - je Boot `.json` und `.txt`, 4 Bilder, `auswertung.md`, `sprung-raster.txt`.
  - Skripte `serie.sh`, `auswertung.cjs`, `sprung-raster.cjs`, die Linse `diag-boot-stage.omen.cjs`.
  - Alle 16 Bilder auf dem OMEN: `p3/k1610bb/`.
