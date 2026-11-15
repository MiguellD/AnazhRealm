# Bericht Baum Schnitt 5 — der Laub-Rand ist Existenz (15.11.2026, ZWISCHENSTAND)

Auftrag: Z5 in `vision/fernfeld/ENTSCHEID-BAUM.md` (dazu Z6). Zweig `w28-baum-schirm`, main-Kopf a6555b12 eingemischt (61bb6fa3).
Gerät: Radeon 890M, jede Welt ab dem Boot in 1920 × 1080 (`WERKBANK_FENSTER=1920x1080`), `r._schirm()` = 1920 × 1080 in jedem
Lauf; Ablauf des Tors `/fenster` → `umstellen --ort wiese --sicht ego` → Gang. Rohdaten:
`artifacts/profiband/auge/w28-baum-schirm/schnitt5/` (spike-12.log, spike-3.log, spike-fall*.out, sitzung-*-gang.log,
`main-gang*` / `kandidat-gang*` .png und .json, zaehlen-*, puffer-*, stufen-*-1.log; `zaehlt-nicht-spike-3-blockiert.log` zählt nicht).

## Der Spike (drei Fälle, eine Zahl) — NEIN

| Fall | Stand | Laub-Rand vor dem Gang | Pop-Pixel/s | je Schritt (Pop · `+n@d`) |
|---|---|---|---|---|
| 1 | main, frische Welt | 129,6 m | **1,5225 %** (31 570 px) | 47+28@116 / 486+83@107 / 60+92@120 / 1 016+16@130 / 9 871+77@125 / 10 728+76@143 / 7 771+69@151 / 1 591+52@154 |
| 2 | main, dieselbe Welt, zweiter Gang | 216,0 m | 0,0517 % (1 073 px) | 38+4@189 / 55+2@187 / 469+1@207 / 116+2@185 / 217+1@198 / 42+2@192 / 58+4@190 / 78+3@189 |
| 3 | main, frische Welt, `_laubRand` vor `/fenster` live getauscht | 216,0 m | **0,0789 %** (1 636 px) | 61+4@189 / 102+3@187 / 467+5@154 / 455+3@185 / 237+2@198 / 113+5@155 / 103+4@190 / 98+3@189 |

Soll Fall 3 ≤ 0,0565 % bei 216,0 m: verfehlt (0,0789). Der gebaute Kandidat in der Bild-Sitzung (eigener Lauf, Stand 1a6f6679)
bestätigt: **0,0627 %** (1 300 px), Laub-Rand 216 m vor dem Gang, 0 neu gepflanzt in allen acht Schritten. **Der Schnitt fällt OFFEN**
(Regel Z5: „Spike nein = offen und benannt“); gebaut in 7cf6e989, auf dem Zweig zurückgenommen in 34a1bc7f.

## Was der Schnitt tat, was übrig bleibt (gesehen, nicht nur gezählt)

- Die Wurzel des Befunds hält: `_laubRand()` als Funktion des Rings stellt den Wald unter dem gehaltenen Regler auf 216 m
  (Fall 3: Laub 216 vor dem Gang, Akte main 129,6). Die Saat der Ringe 3–4 im Gang verschwindet: main „neu gepflanzt“
  18 · 12 · 71 · 73 · 73 · 26 · 64 · 6 je Schritt (107–206 m) → Kandidat 0 in jedem Schritt.
- Bildfolge (acht B-Schüsse je Seite, identische Kamera, Start −280,4 / −1 045,6): `main-gang-b1…b8` ↔ `kandidat-gang-b1…b8`,
  Differenzbilder je Schritt `*-diffN.png` (B in 35 % Grau, Pop rot = dunkler, cyan = heller). Die schwersten Schritte dieser
  main-Sitzung waren 5 und 6 (8 680 · 18 835 px; im Befund 3 und 4 mit 5 765 · 16 390 — dieselbe Saat, eine Zahl Takte später).
  Mit eigenem Blick: main diff6 zeigt die Wald-Silhouetten, die in der Himmels-Lücke über dem Wiesen-Horizont als Fläche
  eintreten (die zwei großen roten Flecken links und mitte); Kandidat diff6 zeigt dort nichts als vereinzelte Punkte. Kandidat diff3
  (sein schwerster Schritt, 429 px): eine Kette kleiner roter und cyaner Tupfen genau auf der Linie des Wiesen-Horizonts —
  kein Baum tritt ein.
- **Der Rest über 0,0565 % (Messname „Eintritt am Wiesen-Horizont 154–155 m, frische Welt“):** in Fall 3 und im Kandidaten treten
  in Schritt 3 und 6 je 5 Dinge in 154–155 m ein, die es vor dem Schritt schon gab (0 neu) — diesseits des Saums 184–216 m, also
  nicht der Wald-Eintritt des Laub-Rands (`max(R 150, Laub-Rand − Saum)`); in Fall 2 (dieselbe main-Welt nach einem Gang) fehlen
  sie. Wer sie sind, ist UNGELESEN (Kandidaten an der Quelle: die Kappe `R` = 150 m in `_archKartenHorizont`,
  stamm/studio-bruecke.js:3427, und der Bau-Rand `ARCH_QUALITY_RADIUS_MAX` 150); die Sonde mit Namen (`pop-roh/pop-namen.js`)
  nennt sie in einem Lauf.

## Gemessen am Rand (Lesewerte, je eine Sitzung, nach dem Gang)

| | main (Laub 129,6 → 216) | Kandidat (216 → 216) |
|---|---|---|
| Einträge `state.architectures` | 2 350 (gezeichnet 1 761) | 3 711 (gezeichnet 2 342) |
| Befehle / Dreiecke (`zaehlen`) | 181 / 397 829 | 182 / 404 901 |
| VRAM nach zwei GC (`puffer`) | 125,9 MB | 123,9 MB |
| Heap nach zwei GC | 344,0 MB | 358,2 MB |

Der Zensus ist nicht ≡: main hatte nach dem Gang noch nicht alles gesät (2 350 gegen 3 711 Einträge). Heap +14,2 MB über main —
gegen die Regel „kein Schnitt hebt Heap über main“; er landet nicht. CPU-Takt p95, `zerlegen`, t(Weltbild) kalt: UNGEMESSEN (Spike nein).

## Die Linse

- `gate:pop` (werkbank `popGang`) nennt jetzt den Laub-Rand am START gegen die Kante des stehenden Rings und trennt „neu
  gepflanzt“ von „eingetreten“ (`+n@d(k neu)`); das bleibt als Messwerkzeug auf dem Zweig. Das ROT-Urteil „Laub-Rand am Start
  unter der Ring-Kante“ und die gefallenen Namen in gate:altlasten (main ROT, 15 Täter beim Namen, Kandidat GRÜN, Selbsttest GRÜN)
  gingen mit dem Schnitt zurück.
- `gate:schirm-stufen` nennt den Laub-Rand beider Welten des Tors (Z6, `scripts/lib/schirm-proben.cjs`). Je EIN Lauf am Dorf:
  main a6555b12 „Laub-Rand 216 ↔ 216 m“, GRÜN (0 Abweichungen); Kandidat (Zweig mit Schnitt 3 und 5) „216 ↔ 216 m“, ROT:
  `vorbau:tor_drachentor 13→0` — 13 Dinge. **Der Verdacht von Z6 (zwei Laub-Ränder) hält an main nicht:** beide Welten tragen
  216 m; ob der Wackler `fimp:atlas:L2 232↔233` dort wohnt, sagt ein Lauf nicht. Das ROT des Zweigs am Drachentor ist ungelesen
  (Schnitt 3 lebt auf dem Zweig, der Laub-Rand stand in beiden Welten gleich) — an den Koordinator, vor der Abgabe von Schnitt 3.

## Gates am gebauten Stand (vor der Rücknahme)

npm run check GRÜN (EXIT 0) · voller Playtest „Alle Invarianten OK“ (153 s; neu: der Laub-Rand am Ring, Ring 0 → eine Spanne,
der Ring wächst → der ferne Chunk) · stamm:lint · diag-atlas --check · Format · eslint der vier Stamm-Dateien GRÜN.
gate:stand-takt, gate:fernwald, gate:ankunft: nicht gefahren (Spike nein, GPU-Schloss überbucht: bis 7 Wartende).

## Ehrlich offen

- **Schnitt 5 fällt offen** unter „Laub-Rand vor dem Gang“ (die Wurzel steht, der Schnitt trägt sie) und „Eintritt am
  Wiesen-Horizont 154–155 m, frische Welt“ (Fall 3 0,0789 %, Kandidat 0,0627 % gegen 0,0565). Ein neuer Entscheid muss sagen, ob
  der Laub-Rand-Schnitt mit diesem Rest landet (die Schwelle 0,0565 hat die GTX geeicht, die Radeon trägt am gesäten Wald selbst
  0,0517) oder erst nach dem Namen der 154-m-Dinge.
- Gesetz (1) an der ersten Stufe (Saum-Eintritt 184–216 m, ~2–4 Dinge je Schritt) und die Ring-Rampe nach der Ankunft: wie in Z5,
  eigene Welle (stamm/gelaende-fern.js).
- Z6: der Wackler `fimp:atlas:L2 232↔233` ist nicht fünfmal je Seite gefahren (der Kandidat landet nicht).
- GTX 1060 ungemessen.

Geschnitten: nichts in main — der Laub-Rand als Funktion des Rings gebaut, gemessen, auf dem Zweig zurückgenommen (Spike nein).
Gemessen: Pop-Pixel/s main 1,5225 % (Laub 129,6 m) → Fall 3 0,0789 % · Kandidat 0,0627 % (Laub 216 m, 0 neu gepflanzt) gegen Soll ≤ 0,0565 %.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
