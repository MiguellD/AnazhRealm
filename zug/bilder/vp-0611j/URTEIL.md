**Urteil: GRÜN in allen drei Punkten, mit einem benannten Rest in (2).**
1. **Zugang aus ist byte-gleich zu main, gemessen am Rausch-Boden.**
   - Der 1-LSB-Anteil main↔Zweig liegt bei 18,783 % (Ego) und 17,120 % (Third), der Rausch-Boden main↔main2 bei 18,782 % und 17,136 %. Der Anteil liegt also auf dem Boden.
   - Zweig↔main2 sind sogar 99,976 % (Ego) bzw. 99,902 % (Third) der Pixel gleich.
   - Die erste main-Welt liegt als Ganzes 1 LSB unter den beiden anderen; das ist Zustand der Sitzung.
2. **Tritanopie lässt den offenen Himmel unverändert.**
   - Ego: RGB 80,83/104,33/120,45 → 80,75/104,26/120,45. Third: 80,82/106,17/119,49 → 80,49/105,95/119,49.
   - Vor der Abgabe verschob sich der Himmel um R −14,8 bei 99 % der Pixel.
   - Rest: Himmel in Kronen-Lücken (Ego 144 px, Third 296 px, 1,0 bzw. 2,5 % des offenen Himmels) trägt noch die alte Verschiebung R −15…−21.
3. **Deuteranopie, Protanopie, Sichtfeld und Kopfwackeln bleiben GRÜN.**

# vp-0611j: GTX-Bild-Vorprüfung w15-farbsicht ff5e6ac2 gegen main 323cc9f3 (OMEN, GTX 1060, 06.11. 23:18–23:25)

Die Wiederholung von vp-0611g mit demselben Treiber (`p3/n0611/vp-farb.cjs`), denselben Posen (Mess-Wiese, Uhr 0,5, Ego und Third) und derselben Folge main → Zweig → main2. main2 ist die zweite main-Welt und liefert den Rausch-Boden. Die Zahlen stehen in `diff.txt`.

## 1. Zugang aus

| Paar | Ego: Δ0 / 1-LSB / ≥2 | Third: Δ0 / 1-LSB / ≥2 | Luma Ego |
|---|---|---|---|
| main ↔ Zweig | 81,066 / 18,783 / 0,151 % | 82,682 / 17,120 / 0,198 % | 58,49 ↔ 58,57 |
| main ↔ main2 (Rausch-Boden) | 81,067 / 18,782 / 0,151 % | 82,635 / 17,136 / 0,229 % | 58,49 ↔ 58,57 |
| main2 ↔ Zweig | 99,976 / 0,009 / 0,015 % | 99,902 / 0,044 / 0,053 % | 58,57 ↔ 58,57 |

- Die 1-LSB-Pixel main→Zweig und main→main2 sind dieselben (+1 je R/G/B 148 168/172 516/102 924 gegen 148 159/172 520/102 914): Die erste Welt liegt als Ganzes 1 LSB tiefer.
- Vor der Abgabe (vp-0611g) stand Ego bei 6,2 % gegen einen Boden von 1,2 %. Jetzt liegt der Zweig auf dem Boden, gegen main2 sogar fast byte-gleich.
- Zurück auf „aus“ nach den Farbsichten: das Ego-Bild ↔ das erste ist gleich, mittleres |ΔY| 0,001.

## 2. Tritanopie und Himmel

- **Offener Himmel** (blau, hell, alle Nachbarn im Abstand 3 px ebenso): Ego 13 835 px, Δ ≥ 1 bei 1,04 %. Third 11 699 px, Δ ≥ 1 bei 2,53 %. Unter Deuteranopie und Protanopie sind es 0,43/0,04 % (Ego) und 0,00 % (Third).
- **Die Pixel, die sich noch ändern,** liegen in den Lücken der Kronen (Third x 593–1567, y 3–244). Dort trägt der Himmel noch die alte Verschiebung, z. B. 76/100/114 → 60/89/114.
- **Himmel am Laub-Rand** (Mischpixel mit Blatt): Unter Tritanopie ändern sich 21 % um ≥ 1, unter Deuteranopie/Protanopie 0,1 %.
- **Das ganze Bild** ändert sich unter Tritanopie bei 0,2–0,3 % der Pixel um mehr als 8. Das sind die rosa Blüten im Gras (`2-third-tritanopie-diff.jpg`). Vorher waren es 1,3–1,5 %, fast alles Himmel.

## 3. Deuteranopie, Protanopie, Sichtfeld, Kopfwackeln — GRÜN

- **Deuteranopie / Protanopie:** 9,6–12,5 % der Pixel ändern sich. Der Himmel bleibt im Mittel unverändert, keine schwarzen oder weißen Flächen.
  - Rötliche Pixel werden violett: Ego 121,8/103,6/34,2 → 101,7/55,3/88,7 (Deuteranopie) und → 98,1/42,5/99,6 (Protanopie).
- **Sichtfeld:** Maßstab 0,750 bei 60° (Soll 0,7524) und 1,555 bei 100° (Soll 1,5531). Nach Speichern und Neuladen steht der Regler auf 100 (Anzeige „100°“).
- **Gehen mit Kopfwackeln aus:** keine Drehung (Neigen, Rollen, Gieren je Spanne 0), fov konstant 75°, Auge − Leib 7,9 mm. Mit Wackeln an: 7,7 mm, ebenso ohne Drehung. Das ist wie main.
- **Konsole:** kein `[ERROR] STOFF`.
- **Werkbank-Probe:** Die alte Uniform-Probe des Treibers liest am Zweig nichts mehr (`reading 'value'`), weil der Graph keine Zugangs-Uniform mehr trägt. Die Bilder tragen das Urteil.
- **GPU** (gpu-bank Ego, aus): main 19,32 / main2 19,82 / Zweig 20,08 ms, also gleich im Rauschen.

## Bilder

`1-ego-aus.jpg`, `1-third-aus.jpg` (main | Zweig) · `2-*-deuteranopie/protanopie/tritanopie.jpg` (Zweig aus | Farbsicht) · `2-third-tritanopie-diff.jpg` (Differenz ×16: nur Blüten und Kronen-Lücken) · `3-fov60-fov100.jpg`, `3-fov75-fov100.jpg`.
