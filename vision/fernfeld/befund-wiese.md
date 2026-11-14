# Befund Wiese — der bewiesene Fall und was davon Gesetz ist

Stand 14.11.2026 (date: 22:20), gelesen im Lese-Baum `lese-main` = main 68d24688 (V18.546.289). Keine GPU, kein Spiel, nur Quelle + ein Bild
(`artifacts/profiband/auge/w28-auge/b6d828a0-dorf-0.5.png`, selbst angesehen). Pfade relativ zu `lese-main`, wo nicht anders genannt.

## 1. Die Formel des Falls

Quelle: `stamm/vegetation-wiese.js:577-587` (`_wieseFern`), `stamm/vegetation-wiese.js:609-615` (`_wieseFuss`), Zahlen
`stamm/daten.js:496-522` (`NAH_WIESE`: radius R = 10 m, fern.fuss f = 13,8 m, skalaMax = 2,5, bis 200, saum 20, auge 1,5).
`WIND_ZAHLEN` (`phyto-core.js:6410-6419`) ist nur die Zahlen-Algebra (k, add, mul, min, max, pow, sin, sqrt): dieselbe Formel läuft
als Zahl (Takt, Tafel, Linse), als TSL (Stoff `_halmFerne`, `stamm/stoff-material.js:63-115`) und als WGSL (Wahl der GPU,
`stamm/vegetation-wiese.js:592-602`) — EINE Quelle, drei Algebren.

Eingang: Q = dist · (h/S)^(1/3) — der Fußabdruck-Abstand (flach Q = dist; am zugewandten Hang kleiner, `vegetation-wiese.js:604-608`).

```
Lücke   l(Q) = min(1, R/Q)                 Beer-Lambert längs des Strahls: n · d konstant -> Grund-Durchlass wie an der Übergabe
Kappe   k(Q) = (f/Q)^3                     Büschel je Pixel ∝ a · Q^3 <= f^3   (Lehre 25: Kosten am Schirm)
Anteil  a(Q) = min(l, k) · Saum(d)         die ZAHL
Größe   s(Q) = min(skalaMax, sqrt(max(1, l/k)))   gleichförmig um den Fuß, Gestalt des Studios unverformt
```

Schnittpunkte (gerechnet mit node aus den Zahlen oben):
- l = k bei **Q_k = sqrt(f^3/R) = 16,21 m** (Kappe beginnt; `scripts/diag-profiband.cjs:302` rechnet dieselbe Zahl).
- s = skalaMax bei **Q_s = 2,5 · Q_k = 40,53 m**.

**Die Erhaltungs-Größe.** Zwischen Q_k und Q_s gelten gleichzeitig drei Invarianten:
1. **Deckung im Blick** D = a · s^2 / l = 1 (die Fläche n · w · h des Strahls bleibt die der Übergabe) — `diag-profiband.cjs:319`.
2. **Büschel je Pixel** a · (Q/f)^3 = 1 (die Kappe ist exakt bindend) — `diag-profiband.cjs:307`.
3. **Sichtwinkel des Büschels** s/Q = sqrt(R/f^3) = 0,0617 /m = konstant: s = Q / Q_k. Das Büschel steht im Bild GLEICH GROSS,
   egal wie fern. Die Ferne ist in diesem Band **schirm-invariant**: gleiche Zahl je Pixel, gleiche Pixelgröße je Büschel, gleiche Deckung.

Was fällt: die Zahl a ∝ Q^-3 (16,2 m: 0,617 · 30 m: 0,097 · 40,5 m: 0,040 · 100 m: 0,0026).
Was steigt: die Größe s ∝ Q (16,2 m: 1,0 · 20 m: 1,23 · 30 m: 1,85 · 40,5 m: 2,50).
Die Kappe sitzt bei Q_k, weil dort die Lücke (Zahl ∝ Q^-1) die Pixel-Schranke (Zahl ∝ Q^-3) schneidet; f = 13,8 statt 14 hält je
Pixel 4 % weniger Büschel als vor w28-wiese-schale (`vegetation-wiese.js:558-561`, Spike in 8709ac07c7: 67 035 → 66 273 Dreiecke).

**Was der Fall NICHT erhält — der benannte Rest „50–100 m lockerer".** Jenseits Q_s ist s gekappt, a fällt weiter mit Q^-3,
die Lücke nur mit Q^-1. Die Deckung im Blick ist dort exakt

```
D(Q) = (Q_s / Q)^2      für Q > 40,53 m
```

50 m: 0,66 · 75 m: 0,29 · 100 m: 0,16 · 150 m: 0,07 · 180 m: 0,05. **Das ist der Rest, als Zahl, und seine Wurzel ist `skalaMax` 2,5,
eine Meter-Konstante.** Die Wand sieht ihn nicht: `ferneWand` prüft D >= 0,99 nur, solange s < skalaMax
(`diag-profiband.cjs:319` `else if (g.skala < F.skalaMax - 1e-6)`), der Mutant „Größe ohne Höchstwert" (`diag-profiband.cjs:1169`)
verbietet gerade das, was die Deckung jenseits 40 m retten würde (s = Q/Q_k: bei 100 m 6,2-fach, bei 180 m 11-fach).

Hängt die Deckung an Metern statt am Sichtwinkel? **Ja, an zwei Stellen:**
- Q hat keine Brennweite: f = 13,8 m und Q_s = 40,5 m sind am Standard-Schirm in Metern geeicht. Unter dem Tele (kleineres fov,
  größeres `pxJeM`, `stamm/bild-kosten.js:3571`) sinken die Büschel je Pixel um (fov_t/fov)^2 — die Kappe gäbe dort mehr Zahl
  her, das Gesetz nimmt sie nicht; und weil je Pixel weniger Büschel mitteln, wird das Defizit D = (40,5/Q)^2 als einzelne
  Büschel mit Grund dazwischen SICHTBAR statt als dunklerer Ton.
- Nur ein Glied liest den Schirm: die Halm-Breite hält mindestens einen Pixel (`stoff-material.js:96-100`, `_halmFernePixel`
  aus `_schirm().pxJeM`, `vegetation-wiese.js:1196-1199`). Unter dem Tele wird der Pixel kleiner, der Halm dünner, die Fläche je
  Büschel sinkt — dieselbe Richtung, also verstärkt der Tele den Rest.
Nicht gemessen (keine GPU in dieser Welle): welcher der zwei Anteile im Tele-Bild überwiegt. Die Rechnung oben sagt: am Standard-
Schirm fehlen bei 75 m schon 71 % der Deckung — der Rest besteht auch ohne Tele, der Tele macht ihn lesbar.

**Warum skalaMax?** Die Quelle nennt nur „Gestalt bleibt die des Studios" (`vegetation-wiese.js:569-571`, `daten.js:476`); eine
Begründung in Zahl (welche Größe sieht falsch aus) steht dort nicht. Ein 11-fach großes Gras-Büschel bei 180 m ist ~0,9 m · 11 hoch
— als Silhouette am Kamm sichtbar. Der Ausweg, der das Gesetz hält: jenseits Q_s trägt nicht mehr die Größe, sondern der **Boden-Ton
unter dem Pixel** die fehlende Deckung (Mittel aus Halm-Ton und Grund nach D) — genau die Lehre porta:steinTonMittel (§2).

## 2. Verallgemeinerung je Klasse — was die grobe Stufe erben muss

Gesetz aus dem Fall: **die grobe Stufe erbt eine Größe, die über den Pixel gemittelt ist (Deckung, Ton, Normale), nicht die
Geometrie; die Schalter-Distanz folgt dem Pixel-Fehler (Brennweite × Zeilen), nie Metern oder Kopfzahl.**

| Klasse | was die grobe Stufe erben muss | erbt sie es heute (Datei:Zeile) | Lücke |
|---|---|---|---|
| **Wiese** | Deckung D = a · s^2 / l, Ton | ja bis 40,5 m (`vegetation-wiese.js:577-587`); Halm >= 1 px schirm-gebunden (`stoff-material.js:96-100`) | D = (40,5/Q)^2 jenseits 40,5 m; Q ohne fov (Meter-Eichung f = 13,8 m) |
| **Krone** | Silhouette, Blattfläche/Deckung, Ton, Durchsicht | Karte backt aus der servierten L1 der wahren Gestalt (`stamm/stoff-karte.js:425-431`); Relief-Impostor tiefen-korrigiert (`stamm/stoff-material.js:1168-1186`, Brucks 2018); Deckung im Jahr linear zur Präsenz gemessen (L1 Eiche 0,72 → 0,737, `phyto-core.js:6423-6427`); Stamm der Karte = BHD der L0 (93864c40de); Kamm-Krone aus demselben Bestand (`stamm/gelaende-fern.js:533-539`) | Bake aus L1 statt L0: Kanten-Versatz mit der L1 als Quelle Eiche 4,67 · Birke 5,08 · Weide 12,06 · Fichte 3,23 px (mit L0 3,54 · 3,74 · 9,97 · 2,82, `stoff-karte.js:428-430`) — Soll <= 1 px (`vegetation-streu.js:2874`); laub-kante ROT 0,2635 > 0,22 (PFLICHT-OFFEN A); Bild: Kronen im Hintergrund verschmiert (Ton erbt, Durchsicht-Struktur nicht gemessen) |
| **Leib** | Silhouette mit Gliedern, Haut-/Kleid-Ton, Gang | Ton: das Feld (Stufe 3, Glieder-Kapseln) mittelt die Ton-Tafel seiner Kapsel (`stamm/koerper-leib.js:1896-1910`); Mengen-Stufe 2 ist ein SDF-Guss des ganzen Leibs aus dem Studio (`koerper-core.js:50-55`, 1 700 Dreiecke, Farben im Stoff); Gang im Satz aus dem EINEN Gang-Gesetz (`stamm/siedlung-bewohner.js:1052-1055`) | **der Schalter ist ein Zwilling**: Mengen-Stufe ab `nahM` 8 m und höchstens `nahLeiber` 4 (`siedlung-bewohner.js:1619`, `kreatur-leben.js:3428`, BEWOHNER `nahM: 8`) — Meter + Kopfzahl, kein Pixel-Fehler. Bild: Figur bei ~8–15 m ~100–160 px hoch als drei Klumpen. Sprung 40 000 → 1 700 Dreiecke (`koerper-core.js:48,55`). Das Feld dagegen liest den Schirm (`vegetation-streu.js:1864-1883`, mengePx 64) — zwei Gesetze für dieselbe Frage |
| **Haus** | Silhouette samt Dach, Fassaden-Relief als Ton/Normale, Fenster-Takt | Silhouette: Wechsel am gemessenen Pixel-Fehler je Vorlage (`vegetation-streu.js:2866-2909`, LOD_SCHIRM.fehler, Soll 1 px, gate:haus-fern) | Relief der Fassade fehlt schon in L0: die Putz-Wand ist EIN Ton, Platten statt Gerüst (`fachwerk-core.js:196`) — keine Stufe hat etwas zu erben; Fenster-Takt der fernen Stufe nicht gelesen |
| **Boden/Dach/Mauer** | MITTEL-Ton und Mittel-Normale der Steine unter dem Pixel | Dach/Stein: `porta:steinTonMittel` — je Achse die Spanne des Pixels in Steinen, unter einem Stein sein Ton, über die Fuge gemischt nach Deckung, n Steine: Streuung × 1/sqrt(n) (`porta-core.js:316-347` im Zweig `origin/w28-stoff-fuge`, Leser `stamm/stoff-material.js:2885-2899` dort) — **nicht in main** (merge-base geprüft); Boden: Mikro-Relief mit drei schirm-gebundenen Oktaven, fract-Blende, Summe bleibt (`stoff-material.js:2663-2676`) | Boden trägt dazu „feste Oktaven (Klumpen, Kiesel)" in Welt-Frequenz (`stoff-material.js:2670-2671`) — nicht pixel-gemittelt; Bild Dorf: hartes Salz-Pfeffer-Korn bis in die Mitte (Kandidat für das Boden-Rauschen, nicht gemessen); Mittel-NORMALE der Steine: in steinTonMittel nur Ton (z, amp), die Normale der Kuppe nur als E[k^2] (`stoff-material.js` stoff-fuge, nach 2900) |
| **Gelände** | Kamm-Linie, Hang-Ton | Ring auf dem VOLLEN Gesetz, dieselbe Höhe (`stamm/gelaende-fern.js:1402`), Nässe aus EINEM Gesetz (`:1433`), Weg-Farbe im Mittel des Gesetzes (`:1751`), Kamm trägt die Kronen desselben Bestands (`:533-539`) | Kosten und Auflösung des Rings: nicht gelesen (der Schwarm „Preis des Orts" schneidet dort) |

Wo heute ein Zwilling steht (die grobe Stufe als eigenes, von Hand gesetztes Ding):
- Leib: der Schalter `nahM` 8 m / `nahLeiber` 4 neben dem Pixel-Gesetz des Felds.
- Wiese: `skalaMax` 2,5 als Meter-Konstante; `fuss` 13,8 m statt Brennweite.
- Krone: Bake aus L1 statt L0 (Kosten-Grund benannt, `stoff-karte.js:430-431`).
- Haus: kein Zwilling, sondern eine leere Quelle (L0 ohne Relief).

## 3. Kosten des Falls

- Commit 7ccf62000c (Abgabe w28-wiese-schale): **Ferne 64 312 Dreiecke statt 66 080 (main)**, Boden-Pixel 20–40 m 15,8 % → 1,7 %.
- Das alte Gesetz mit 1,67 × Kappe: Lf 80 731 + Schale 28 041 = 91 450 Dreiecke, GPU +1,1 bis +4,9 ms je Bild in drei Paaren
  (Radeon, Mess-Wiese Ego; `vegetation-wiese.js:562-563`).
- **Hängt am Schirm, nicht an der Welt** (gerechnet): Büschel im Ring dQ ∝ ρ · 2πQ · a(Q). Mit a = R/Q bis Q_k und (f/Q)^3 dahinter
  ist N_fern ∝ 2πρ [R (Q_k − R) + f^3 (1/Q_k − 1/bis)] = 2πρ [62 + 149] — das Integral konvergiert, der Rest jenseits 200 m wäre
  2πρ · 13: **die Weite der Welt kostet fast nichts mehr**, `bis` könnte wachsen. Der Schirm wird geprüft: Büschel je Pixel <= 2 ×
  (`diag-profiband.cjs:307,341`), heute exakt 1,00.
- Was die Dreiecks-Zahl NICHT zählt: die Füllrate. s^2 wächst bis 6,25 — jedes ferne Büschel deckt bis 6,25 × die Pixel bei
  gleicher Zahl; Überzeichnung je Pixel bleibt durch D = 1 begrenzt, gemessen ist sie nicht (keine ms-Zahl der Ferne allein in Commit
  oder Wand).

## 4. Zufall der Klasse und Gesetz — fünf Sätze

Zufall der Wiese ist, dass ihr Element (das Büschel) gleichförmig wachsen darf, ohne dass das Auge die Größe als Lüge liest — beim
Leib, beim Haus, bei der Krone ist Größe Identität, dort darf nur Zahl oder Detail fallen, nie das Maß. Gesetz ist die Invariante
des Bands 16–40 m: gleiche Deckung, gleiche Zahl je Pixel, gleicher Sichtwinkel des Elements — wer das hält, ist schirm-invariant und
kostet Q-unabhängig, also Weltgrößen-unabhängig. Gesetz ist auch, dass die Rechnung EINE Funktion über einer Algebra ist (Zahl, TSL,
WGSL) mit einer Wand, die jedes Glied per Mutant schützt — jede Klasse braucht ihre `_xFern(A, Q)` und ihre `ferneWand`. Gesetz ist,
dass die Erhaltung am Ende des Größen-Spielraums in den TON unter dem Pixel übergehen muss (Wiese jenseits 40,5 m, Steine des Dachs,
Kiesel des Bodens, Fassaden-Relief): die feinste ehrliche Stufe jeder Klasse ist ein gemittelter Ton samt Normale, wie
`porta:steinTonMittel` ihn für Steine baut. Zufall ist schließlich, dass die Wiese in Metern (f = 13,8 m) geeicht werden durfte, weil
die Kamera fast immer dasselbe fov trägt — das Gesetz liest Brennweite × Zeilen (wie `_feldGrenzen` und LOD_SCHIRM.fehler), sonst
bricht es unter dem Tele, wie der benannte Rest zeigt.

## Ehrlich offen

- Nicht gemessen: Tele-Bild, ms der fernen Wiese allein, Füllrate, ob die Salz-Pfeffer-Körnung die festen Oktaven sind.
- Nicht gelesen: Fenster-Takt der Haus-L2, Ring-Auflösung des Geländes, `__mengenLeib` im foundry-core (warum drei Klumpen bei 1 700
  Dreiecken), w28-gesicht-grob (läuft auf GTX 1050).
