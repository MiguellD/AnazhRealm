**Urteil: ROT nach der Regel des Auftrags, in zwei Termen.**
1. **Zugang aus:** Das Bild ist im Mittel gleich zu main (Luma 52,31 ↔ 52,31 Third, 57,78 ↔ 57,78 Ego). Über dem Rausch-Boden liegt nur eine 1-LSB-Rundungsspur: Ego 6,2 % der Pixel gegen 1,2 % zwischen zwei main-Welten, Third 1,5 % gegen 0,7 %. Pixel ab 2 LSB liegen auf dem Rausch-Boden. Mit dem Auge ist der Unterschied nicht zu sehen.
2. **Tritanopie verändert den Himmel:** Ego RGB 71,6/93,1/104,5 → 59,1/85,2/105,2, Third 51,3/75,3/84,0 → 42,4/69,7/84,7.

Alles andere ist GRÜN:
- Deuteranopie und Protanopie: sichtbar daltonisiert, der Himmel unverändert, keine schwarzen oder weißen Flächen.
- Kein `[ERROR] STOFF` in der Konsole.
- Sichtfeld 60/100: Maßstab 0,750 / 1,555 (Soll 0,752 / 1,553); nach Speichern und Neuladen steht der Regler auf 100°.
- Gehen ohne Kopfwackeln: keine Drehung, fov konstant 75°, Auge − Leib 7,8 mm wie main.
- GPU-Kosten keine.

# vp-0611g: GTX-Bild-Vorprüfung w15-farbsicht 1c39aada gegen main 8efb6318 (OMEN, GTX 1060, 06.11. 16:41–16:45)

Verglichen wurden main 8efb6318 und w15-farbsicht 1c39aada; der Zweig steht auf main 8efb6318.

Je Seite lief eine warme Welt (`werkbank start --echt --ort wiese`) in der Reihenfolge main → Zweig → main2. Die zweite main-Welt ist der Rausch-Boden zwischen zwei Welten.

Die Posen sind die des Spiels, gleich auf beiden Seiten:
- Third: `umstellen --ort wiese --sicht third`, 30 `_loopCamera`, Blickziel auf dem gezeichneten Boden 14,8 m.
- Ego stehend: Blickziel in 61,5 m.

Alle Bilder: `bild --uhr 0.5 --wahl 0`, 1920 × 1080, Sommer, sonnig. Jede Wahl lief über das Menü wie beim Spieler:
- `#farbsicht-wahl` per change-Ereignis;
- `#slider-sichtfeld` per input-Ereignis;
- `#kopfwackeln-toggle` per change-Ereignis.

Treiber: `p3/n0611/vp-farb.cjs`. Auswertung: `vpf-ausw.cjs`, `vpf-hist.cjs`, `vpf-lsb.cjs`. Die Zahlen stehen in `diff.txt`.

## 1. Zugang aus (Default): Zweig gegen main

Der Zweig startet mit `state.zugang = {farbsicht: "aus", fov: null, wackeln: true, unschaerfe: true}`. Dazu passen:
- Uniform `farbsicht` = 0;
- TRAA `_laufPx` = 128 = `maxVelocityLength`, wie die Konstante an main;
- cam.fov = 75.

| Paar | Luma-Mittel | mittl. \|ΔY\| | Pixel Δ = 1 LSB | Δ = 2 | Δ 3–4 | Δ 5–8 | Δ > 8 |
|---|---|---|---|---|---|---|---|
| Ego main ↔ main2 (Rausch-Boden) | 57,78 ↔ 57,78 | 0,006 | 1,245 % | 0,017 % | 0,011 % | 0,006 % | 0,006 % |
| Ego main ↔ Zweig | 57,78 ↔ 57,78 | 0,026 | **6,198 %** | 0,014 % | 0,007 % | 0,005 % | 0,006 % |
| Ego main2 ↔ Zweig | 57,78 ↔ 57,78 | 0,027 | **6,471 %** | 0,013 % | 0,008 % | 0,004 % | 0,007 % |
| Third main ↔ main2 (Rausch-Boden) | 52,31 ↔ 52,31 | 0,006 | 0,668 % | 0,031 % | 0,023 % | 0,013 % | 0,015 % |
| Third main ↔ Zweig | 52,31 ↔ 52,31 | 0,009 | **1,523 %** | 0,024 % | 0,016 % | 0,011 % | 0,009 % |
| Third main2 ↔ Zweig | 52,31 ↔ 52,31 | 0,009 | **1,673 %** | 0,022 % | 0,016 % | 0,011 % | 0,010 % |

**Lage der Abweichung:** Über dem Rausch-Boden liegt nur die Klasse „1 LSB“.
- Sie ist über das ganze Bild verteilt und hat keinen Fleck. Die 8 × 6-Zellen mit dem größten \|ΔY\| tragen 0,05.
- Ego +1/−1 je Kanal R 28380/23134, G 33796/19557, B 12794/17092, also beide Vorzeichen in allen Kanälen.
- Am dichtesten ist sie in den dunklen Tönen: 6–7 % bei max-Kanal < 96, 0,3 % bei > 224.
- Die Pixel ab 2 LSB verteilen sich über die Bild-Neuntel wie der Rausch-Boden.

**Der Einzel-Pixel mit Δ 79** (Ego, Pixel 1142/595) ist kein Zweig-Term. Derselbe Pixel weicht innerhalb der Zweig-Welt zwischen dem ersten Ego-Bild und dem Ego-Bild nach „zurück auf aus“ ebenso ab.

**Zurück auf aus:** Nach Deuteranopie → Protanopie → Tritanopie → aus ist das Ego-Bild in derselben Welt gleich, mittl. \|ΔY\| 0,001. Auch Sichtfeld 75 per Regler ist gleich zum Default, 0,001.

**Lesart:** Das sieht nach Rundung des neu übersetzten Post-Shaders aus. Der Zweig fügt in `graded` den Farbsicht-Ast ein, und TRAA teilt durch eine Uniform statt durch die Konstante. Im Mittel ist das Bild gleich und mit dem Auge nicht zu unterscheiden. Nach der Regel „jede Abweichung > Rausch-Boden ist ROT“ ist es trotzdem ein Term; er ist hier mit Lage genannt.

## 2. Farbsicht über das Menü (Zweig)

Nach jeder Wahl stehen die Uniforms aus dem Stand: `farbsicht` 1 und dazu je Art:

| Art | Fehler e | Schub v |
|---|---|---|
| deuteranopie | [0,707, −0,707, 0] | [−1,5, −2,25, 2,25] |
| protanopie | [0,888, −0,888, 0] | wie deuteranopie |
| tritanopie | [0, −0,859, 0,859] | [−0,75, −0,75, 0] |

| Pose | geändert (max-Kanal > 8) | Himmel RGB aus → Art | rötlich (Stämme, Halm-Spitzen) RGB aus → Art | schwarz / weiß (aus → Art) | Luma |
|---|---|---|---|---|---|
| Ego deuteranopie | 9,5 % | 71,6/93,1/104,5 → **gleich** | 122,5/104,3/36,1 → 102,4/56,3/89,7 | 0,002 → 0,004 % / 0 → 0 | 57,8 → 55,3 |
| Ego protanopie | 9,9 % | **gleich** | → 98,8/43,6/100,5 | 0,002 → 0,002 % / 0 → 0 | 57,8 → 54,6 |
| Ego tritanopie | 1,5 % | → **59,1/85,2/105,2** | gleich | 0,002 → 0,002 % / 0 → 0 | 57,8 → 57,6 |
| Third deuteranopie | 12,0 % | 51,3/75,3/84,0 → **gleich** | 110,6/93,1/31,8 → 92,1/47,4/82,8 | 0,006 → 0,007 % / 0 → 0 | 52,3 → 49,3 |
| Third protanopie | 12,6 % | **gleich** | → 89,2/36,2/93,3 | 0,006 → 0,008 % / 0 → 0 | 52,3 → 48,6 |
| Third tritanopie | 1,3 % | → **42,4/69,7/84,7** | gleich | 0,006 → 0,006 % / 0 → 0 | 52,3 → 52,1 |

- **Deuteranopie und Protanopie:** sichtbar daltonisiert.
  - Braune Stämme werden kräftig violett (`2-third-deuteranopie-stamm.jpg`), gelbliche Halm-Spitzen magenta gesprenkelt.
  - Grün, Grau und der Himmel bleiben gleich.
  - Das entspricht dem Entwurf („Rötliches wird dunkler und blauer“).
  - Für das Auge eines Normalsichtigen ist das Violett grell. Das ist kein Kriterium des Auftrags, ich nenne es nur.
- **Tritanopie:** Die einzige sichtbare Änderung ist der Himmel. Blaue Pixel verlieren Rot und Grün (Ego R −12,5, G −7,9), der Himmel wird satter blau (`2-ego-tritanopie-himmel.jpg`, oben aus, unten Tritanopie). Der Wirkstrich e · Bild = 0,859 (B − G) > 0 trifft gerade das Himmelsblau, deshalb verändert sich der Himmel. Das Kriterium „Himmel bleibt“ hält hier nicht.
- **Keine schwarzen oder weißen Flächen:** Schwarz < 3 und Weiß > 252 liegen bei allen sechs Bildern auf dem aus-Wert. Die Abnahme ist jedes Mal GRÜN mit „schwarz 0,0 % weiß 0,0 %“.
- **Konsole:** Am Zweig hörte ein Mitschreiber über alle `console.*` mit; er trug keine Zeile mit ERROR, STOFF oder WARN ein. Die Werkbank-Liste trägt nur die zwei INFO-Zeilen des Renderers und die bekannte Warnung zum Timestamp-Pool aus `gpu-bank`.
- **GPU (gpu-bank, 12 × 3, Ego):**
  - main 19,29 und main2 19,85 ms;
  - Zweig aus 19,66 ms, Zweig Deuteranopie 19,72 ms;
  - die Farbsicht kostet also innerhalb der Streuung nichts.

## 3. Sichtfeld über den Regler (Zweig)

| Regler | cam.fov nach 40 `_loopCamera` | Anzeige | Maßstab gegen das 75°-Bild (Soll tan(f/2)/tan 37,5°) |
|---|---|---|---|
| 60 | 60 | „60°“ | gemessen 0,750 (Soll 0,7524) |
| 100 | 100 | „100°“ | gemessen 1,555 (Soll 1,5531) |
| 75 | 75 | „75°“ | Bild gleich zum Default (mittl. \|ΔY\| 0,001) |

Gemessen wurde der Maßstab, der das 75°-Bild um die Mitte am besten auf das andere legt (Restfehler 11,2 bzw. 7,3 gegen 27–28 bei Maßstab 1). Das Bild ändert sich also genau wie erwartet (`3-fov60-fov100.jpg`, `3-fov75-fov100.jpg`).

**Speichern und Neuladen:**
1. Regler auf 100, `saveState()` → ok, danach 4 s warten.
2. `/reload` derselben Welt (2164b074).
3. Danach zeigt das Menü Regler „100“, Anzeige „100°“, Farbsicht „aus“, Kopfwackeln an. `state.zugang.fov` ist 100.

## 4. Gehen 10 s

In Ego, `verbTafel.gehalten.vor`, Spiel-Loop an; gemessen wurde je Bild über 9 s nach der ersten Sekunde.

| | Bilder | Weg | Auge − Leib | größter Sprung je Bild | fov | Neigung / Rollen / Gieren |
|---|---|---|---|---|---|---|
| Zweig, Kopfwackeln **aus** | 1077 | 11,5 m | 1,5922–1,6000 m (7,8 mm) | 6,8 mm | 75–75 | 0 / 0 / 0 Spanne |
| Zweig, Kopfwackeln an | 960 | 11,5 m | 1,5927–1,6000 m (7,3 mm) | 6,8 mm | 75–75 | 0 / 0 / 0 |
| main (an, ohne Schalter) | 1003 | 11,5 m | 7,3 mm | 4,7 mm | 75–75 | 0 / 0 / 0 |
| main2 | 1015 | 11,5 m | 7,7 mm | 6,7 mm | 75–75 | 0 / 0 / 0 |

Ohne Kopfwackeln bewegt sich die Kamera nur mit dem Gehen: keine Drehung, kein Atmen des Sichtfelds. Der Leib steigt am Hang 0,13 m, das Auge folgt ihm mit 7–8 mm Glättung wie an main.

## Ehrlich offen

- **Der Gang zeigt den Schalter nicht:** Im Schritt-Tempo atmet das Sichtfeld auch MIT Kopfwackeln nicht (fov 75 konstant), und eine Landung gab es nicht. Was der Schalter abschaltet (Landungs-Dip, Tempo-Sichtfeld), zeigen erst Sprint und Sprung; das ist nicht gemessen.
- **Bewegungsunschärfe aus** (`_laufPx` 4) ist nicht im Bild geprüft: Für ein Standbild ist sie wirkungslos, und der Auftrag nennt sie nicht.
- **Rausch-Boden:** Er stammt aus einem Paar zweier main-Welten. Die 1-LSB-Spur steht aber in beiden Zweig-Paaren gleich (6,2 / 6,5 % Ego, 1,5 / 1,7 % Third).

## Bilder

| Datei | Inhalt |
|---|---|
| `1-third-aus.jpg`, `1-ego-aus.jpg` | links main, rechts Zweig, Zugang aus |
| `2-{third,ego}-{deuteranopie,protanopie,tritanopie}.jpg` | links Zweig aus, rechts die Art |
| `2-ego-tritanopie-himmel.jpg` | Ausschnitt 1:1, oben aus, unten Tritanopie |
| `2-third-deuteranopie-stamm.jpg` | Ausschnitt 1:1, oben aus, unten Deuteranopie |
| `3-fov60-fov100.jpg`, `3-fov75-fov100.jpg` | das Sichtfeld |

Die Roh-PNGs, `erg.json` (mit der Reihe des Gangs) und die Logs liegen auf der OMEN unter `p3/n0611/vpf/{main,kand,main2}/`.
