# vp-0611e — GTX-Bild-Vorprüfung w13-brand-wind vor z256 (OMEN, GTX 1060, 06.11. 07:36–07:41)

Verglichen wurden main a4dc2a45 (links) und w13-brand-wind a1637dbc (rechts; der Zweig hat main a4dc2a45 gemergt). Je Seite lief eine warme Welt (`werkbank start --echt --ort wiese`) mit genau derselben Folge:

0. **Gegenprobe:** Wiese 10 Uhr ohne Brand, freier Schuss mit der Kamera von vp-0611b.
1. **Feldbrand:**
   - Das Wetter ist das Wort des Spielers „bewölkt“ (`_setWeather("cloudy", "human")`, Wind-Stärke 0,29–0,35). Das Feld ist trocken wie bei der Station (`_naesseTakt` → 0).
   - Gezündet wird mit `_brandEntfachen(−256, −1082)`. Der Spieler steht 20 m quer zum Wind auf der Seite der Wiese.
   - Danach laufen 20 s echter Loop. Die Bild-Uhr ist dabei frei, also die Uhr der Seite, nicht die 12,5 s der Bühne.
2. **Speichern mitten im Brand und Laden:**
   - `saveState` ×2 bei 14 brennenden Zellen, danach `werkbank reload`. Der Zweit-Boot lädt den Stand: Welt-Uhr 44,5 s, Bild-Uhr 1,8 s.
   - Die Zellen des Brands reisen nicht (GRUND_TAFEL „nicht persistiert“). Nach dem Laden lagen 0 Zellen und 1 Asche.
   - Darum nahm die Welt den Stand einer Spielstunde später (`_weltUhrNimm(+3600)`, die Uhr-Regel des Ladens), und der Spieler zündete am selben Herd neu. Danach wieder 20 s echter Loop.

Je 5 s lief eine Probe: Ich habe gemessen, wohin dieselben Rauch-Ballen in 0,5 s ziehen, und das gegen die Neigung der Flammen (`f.wx/f.wz`) gestellt. Danach kamen die Bilder: Ego, Third, die Fahne über den Kronen und die Fahne von oben. Jedes Paar habe ich selbst angesehen. Die Pixel-Abstände stehen in `diff.txt`.

## Urteil: w13-brand-wind a1637dbc GRÜN

Versatz Rauch ↔ Flammen (Kurs in Grad, je Probe nach 5/10/15/20 s):

| Szene | Uhr-Lücke Welt − Bild | main a4dc2a45 | w13-brand-wind |
|---|---|---|---|
| 1 frisch | −16 s | −2,5 · −2,6 · −2,6 · −2,5 | 0 · 0 · 0 · 0 |
| 2 nach dem Laden | +3633 s | **−39,3 · −40,7 · −42,0 · −43,1** | 0 · 0 · 0 · 0 |

- **Nach dem Laden lag main falsch:**
  - Die Flammen neigen sich mit dem Wind der Welt-Uhr (57,8° → 59,2°), der Rauch zieht mit dem Wind der Bild-Uhr (18,5° → 16,1°).
  - Im Bild von oben läuft die Fahne an main etwa 40° neben der des Zweigs und ist dünner (`2-geladen-fahne-oben.jpg`).
  - Über den Kronen steht der Rauch an main als diffuser Klumpen über dem Herd. Am Zweig steigt er als Fahne quer zum Blick, wie die Flammen sich neigen (`2-geladen-fahne-seite.jpg`).
  - In Ego steht an main eine dunkle Wolke über dem Brand, die nicht mit den Flammen zieht (`2-geladen-ego.jpg`).
- **Am Zweig:** Rauch und Flammen haben in beiden Szenen 0,0° Versatz (Kurs 57,5 → 59,2°). Der Kurs der Fahne gleitet in 15 s stetig mit dem Mäander des Winds, es gibt keinen Sprung.
- **Frisch, ohne Laden** (`1-frisch-*.jpg`): Beide Seiten zeigen dieselbe Fahne. Die Uhr-Lücke von 16 s gibt an main nur 2,5°.
- **Gegenprobe Wiese 10 Uhr ohne Brand:** Luma 82,13 ↔ 82,13, mAbs 0,001, 0 % der Pixel über 8 (`wiese-10uhr.jpg`).

## Ehrlich offen

- **Speichern → Laden ist nicht 1:1 nachgestellt.** „Mitten im Brand laden“ geht nicht wörtlich, weil der Brand den Stand nicht überlebt. Ohne den Sprung wäre die Lücke nach dem Reload nur ~43 s gewesen (Welt 44,5 s gegen Bild 1,8 s), weil die Welt der Probe frisch war. Ein Stand nach einer Spielstunde trägt genau die Lücke, die ich mit `_weltUhrNimm(+3600)` gestellt habe.
- **Trockenhaltung:** Im ersten Lauf ohne Trockenhaltung erlosch der neue Brand nach dem Sprung binnen 5 s, weil eine Stunde Nässe unter „bewölkt“ das Feld nass gemacht hatte. Danach habe ich das Feld wie die Station trocken gehalten, auf beiden Seiten gleich.
- **Third ist schwach:** Third steht in Szene 2 tief im Gras und zeigt wenig; Ego zeigt die Flammen aus 20 m nur als Saum. Das Urteil tragen die Proben und die Blicke über den Kronen und von oben.
- **Fahne in Klumpen (Szene 1, von oben):** Die Fahne zerfällt dort in Klumpen mit Lücken, auf beiden Seiten in anderer Phase. Ursache ist die Böe: Der Wind in m/s an den Proben lag zwischen 2,1 und 9,2. Das ist kein Bruch durch den Zweig.
- **Flackern** ist an Standbildern nicht prüfbar. Der Kurs der Fahne, über vier Proben in 15 s gemessen, springt nicht.

Rohdaten und Treiber auf der OMEN: `p3/n0611/vpb/{main,kand}/{erg.json,vp.log,bilder/}` und `p3/n0611/vp-brand.cjs`. Die beiden Vorläufe des Kandidaten mit anderen Blick-Orten liegen in `vpb/kand-v1`, `vpb/kand-v2`.
