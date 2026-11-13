# 50 Ältere Zweige, Cloud-Ergebnisse, die fünf Samen-Befunde — welcher Befund wurde nie geschnitten

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/wiese-mitte/heute-wiese.png` (Mess-Wiese, Mittag, main heute): hinter der Wiese steht ein Wald aus Laubkronen auf
  STRICH-dünnen schwarzen Stangen; mehrere Bäume tragen eine Krone von Hausbreite auf einem Stamm, der schmaler ist als ein Pfahl.
  Das ist wörtlich das Urteil des Samen-Befunds Wiese („ein 17-m-Schirm auf 42 cm", `samen/wiese/BEFUND.md` §2).
- `scratchpad/dorf-main-0.5.png` (Dorf der Ankunft, Mittag): Laubbäume nur am Bildrand oben, kein Stamm im Bild; die Wiese am Hang
  als große flache gelbgrüne Zacken; kein Wagen, keine Laterne beleuchtet etwas (Mittag). Die Samen-Bilder in den Zweigen
  (`samen/*/…png`) habe ich NICHT angesehen (nur per git erreichbar, Schreibverbot außerhalb dieses Blatts).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Die fünf Befunde (je ganz gelesen per `git show origin/w28-samen-<x>:samen/<x>/BEFUND.md`), gegen main 7f778d44 (V18.546.276):
| Samen | Kern-Entscheidung des Befunds | Stand in main | Zweig mit Schnitt |
|---|---|---|---|
| Wiese/Halm | Stufe trägt Fläche über Halm-Breite | GESCHNITTEN: `foundry-core.js:3129–3135` (HALM_STUFEN mit `triebe`, „bis w28-halm-trieb trug die Stufe breite") | gelandet z414 (b560adaf); Rest L2-Naht vegetation.K1#1 −18,3 % (FUND-REGISTER:193) |
| Wiese/Stamm | Radius folgt der HÖHE (H/hd), kennt seine Krone nicht | NIE GESCHNITTEN: `phyto-core.js:99–103` (`trunkR = hoeheM / hd / 2 / weltSkala`, Solitär `height/(hd·FREISTAND.hd)/2`) | `w28-stamm-krone` 31f4607c ABGABE, z416 ROT, 138 Commits hinter main, liegt ohne Arbeiter |
| Karten-Stufe | Rand ist Gesetz der Karte, Gestalt nur Gleichstand 1e-6·c | NIE GESCHNITTEN: `phyto-core.js:4317` `karteSaumSchluessel` ohne Gestalt-Term | Kandidat nur CPU (+66 Z. phyto-core), KONFLIKT mit main in phyto-core.js (merge-tree), GPU-Zwilling `saumK` fehlt |
| Lichtweg | Quellen-Licht als Term in jedem Stoff | NIE GESCHNITTEN: `stamm/stoff-material.js:2064`, `:2414`, `:3754` (`plaetze: 4, umkreisM: 48`) | keiner; Befund selbst: trägt die Ankunft NICHT (−0,16 von 2,16 MB), nur das Nacht-Bild (0 → 6 von 7 Laternen am Auge) |
| Fahrzeug | Haut = Platten-Bausatz auf Quader-Ebenen, nachträglich verbogen | NIE GESCHNITTEN: `vehicle-core.js:1379` `buildSkin` (223 Box-Meshes, Radlauf-Spanne 225 mm) | keiner; Kandidat Wegwerf, „Vertrags-Akt (Lehre 11), braucht das Wort des Schöpfers" (BEFUND §5.5) |
| Live-Tausch | Fassung eines Gesetzes ist ein ORT, kein WERT | NIE GESCHNITTEN: `stamm/koerper-leib.js:1909` `_ofenMenschKey` ohne `g:<sha>` | keiner; FUND-REGISTER:197 „Scope beim Schöpfer"; Gedächtnis `reihenfolge-abschliessen-live-tausch.md`: erst Offenes fällen |

- FUND-REGISTER.md:245 führt „fünf Samen-Befunde" unter **TOT** — damit besitzt niemand ihren Schnitt; `bericht/1113-kurs-A-liegendes-werk.md:35`
  dasselbe („TOT als Code"), drei davon dort „weiß ich nicht". Der Befund lebt, nur der Wegwerf-Spike ist tot.
- Stamm, was der Kern KANN (Abgabe 31f4607c, Rumpf): `stammAusKrone` misst den Schirm über 8 Azimute, BHD = Schirm ÷ kd 21,5;
  Solitär-Eiche BHD 0,420 → 0,756 m, Krone/BHD 41,9 → 23,3; Bestand-Eiche 0,238 → 0,346 m; gate:pflanzen-nah (H) Krone/BHD am
  Kern dc872b08 ROT 5 Verletzungen (33,7/31,8 · 23,9/39,8 · 40,4/41,6) → 23,2/22,1 · 20,9/19,9 · 21,1/20,2; Dreiecke L0 gleich
  (Eiche 6 954/6 016), L1 Eiche 1 758 → 1 812; Goldens 60 von 128 neu (nur Laubbäume), Konifere byte-gleich.
- Was die Welt KONSUMIERT: heute H/hd (`foundry-core.js:4640, :4652, :4658, :4940, :4950` tragen `hd`); die Kollision liest
  denselben Stamm (`stamm/vegetation-streu.js:2282`), die Ferne die Bestand-Regel (`stamm/gelaende-fern.js:582`).
- Ältere Zweige (git branch --no-merged, 70 Stück w1x–w26, Spiel-Diff gezählt): ohne Landung unter eigenem Namen und mit Spiel-Diff
  liegen w17-gesicht (25 D), w17-bild-kollision (10 D), w26-lack-glas (2 D), w26-programm-katalog (10 D), w25-spike-gpu-vegetation
  (4 D), w16-tor-durchgang (28 D), w14-strom-tempo (8 D), w23-pruef-welt (7 D). Alle offen gefallen mit Grund:
  gesicht + bild-kollision (`cloud-post/heimholer.md:70`), lack-glas material.K4#1 Radeon UNGÜLTIG (`cloud-post/w26-lack-glas.md:21`),
  programm-katalog „Gewinn nicht belegt" (`UEBERGABE-2026-11-09-abend.md:22`), gpu-vegetation „Spike, landet nicht"
  (`cloud-post/w25-spike-gpu-vegetation.md:10`). Keiner trägt heute einen Schnitt, der dem Bild am Dorf näher ist als der Stamm.

## Die EINE begrenzende Entscheidung
**Der Stamm eines Laubbaums wird aus seiner HÖHE gerechnet, nicht aus der Krone, die er trägt** (`phyto-core.js:99–103`).
Von sechs Samen-Entscheidungen ist sie die einzige, deren Schnitt gebaut, abgegeben und im Bild der Wiese sichtbar ist — und die
seit 12.11. 23:02 an einem ungeklärten Radeon-ROT liegt, das kein Arbeiter besitzt. Fahrzeug und Live-Tausch brauchen das Wort des
Schöpfers, Lichtweg trägt laut eigenem Befund weder Ankunft noch Mittag, die Karten-Stufe hat keine GPU-Seite.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
`w28-stamm-krone` 31f4607c auf main 7f778d44 mischen (merge-tree: KEIN Konflikt gegen main; gegen `w28-wiese-fern` nur
`spec/asset-contract/v1/golden/manifest.json`), z416-ROT zuordnen, abgeben, landen. Die Klasse „Stamm des Laubbaums" ganz:
- Stufen: L0 + L1 (`phyto-core growSkeleton`, ein Leser je Stufe), die Karte (Stamm in der Karte seit z427 `w28-karte-stamm`
  in main — sie bäckt den dickeren Stamm mit, keine eigene Arbeit), die Kollision, der gefühlte Baum der Werkstatt.
- Leser-Liste (main): `phyto-core.js:93–103` (weltMass, frei, bestand, trunkR) · `foundry-core.js:4640/4652/4658/4940/4950` (`hd`
  je Preset) · `foundry-core.js:5402` (`emitTree` in `buildInstance`) · `stamm/vegetation-streu.js:2282` (Kollision) ·
  `stamm/gelaende-fern.js:582` (Bestand-Regel der Ferne) · `worlds/terrain/phytogenesis.js:2065` (Studio-Wald).
  Was stirbt: `hd` als Eingang des Laubbaums, `FREISTAND.hd` für Laubbäume, `BESTAND.hd` (ersetzt durch `bestandArt`).
- Kosten-Zeile: Dreiecke L0 gleich, L1 Eiche +54 (+3 %), Birke L1 2 766 (Zeile 2 900); NEU: `buildInstance` baut einen Baum über
  seiner Zeile bis zu 5-mal neu (Diff `foundry-core.js` +30 an :5402) — Bau-ms je Baum über der Zeile UNGEMESSEN; Frame, VRAM,
  Pop (lod.K2) am Kopf UNGEMESSEN (Abgabe-Rumpf: „misst nur die echte Karte").
- Kriterien: kein Meisterkarte-Kriterium misst Krone/BHD (stand.json vegetation.K1–K5 gelesen: Naht, Wind, Häuser-Boxen, Jahr).
  Was die Landung berührt: vegetation.K1#1 radeon+gtx UNGEMESSEN („Station seit der Messung geändert", stand.json:4419–4440) ·
  lod.K1#1 / laub-kante (Pflicht A, ROT 0,2635 > 0,22) — die Karte bäckt neu · kamera-leib K4 (z416 ROT). Linse: gate:pflanzen-nah
  (H) Krone/BHD Soll 17–26 (im Zweig, ROT am Kern, GRÜN am Kopf).
- Bildpaar: `bild:wiese@0.5` und Dorf der Ankunft, gleiche Kamera, vorher main ↔ nachher; Abgabe-Bedingung „Stamm unter Krone liest
  als Eiche, nicht als Pfahl", Leser-Liste oben in den Commit.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-stamm-krone` **31f4607c** (12.11. 18:54, Abgabe, `[ci voll]`), 5 Spiel-Dateien +190/−62 (`phyto-core.js` 201 Z.,
  `foundry-core.js` 44 Z.). Fehlt: main mischen (138 hinter), z416 „ROT echt radeon Kamera-Leib K4 ‚Gang haus_alemannisch, Bau
  39,1 %'" (`bericht/1113-kurs-G-pruef-apparat.md:12`) gegen main zuordnen — `gate:kamera-leib:echt` kippt laut UEBERGABE §6 auch
  am baum-gleichen Kopf auf der GTX 1050 (K6) — dann neu abgeben; Bildpaar im Spiel fehlt (Bilder nur Streiflicht-Bühne, a936f377).
- Daneben, ohne Arbeiter und ohne Schnitt in main: `w28-samen-karten-stufe` 5d6f899e (Kandidat, Konflikt), `w28-samen-fahrzeug`
  5406f47d, `w28-samen-lichtweg` d8887125, `w28-samen-live-tausch` 726bd3f7 — alle `[skip ci]`, Wegwerf-Code.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht gelesen: das Log von z416 (`/tmp/claude/w4/zug-nie-leer.log`), die probe-post-Bilder von stamm-krone, die Samen-PNGs,
  die 170 übrigen cloud-post-Dateien außer den zitierten.
- Ob dickere Stämme selbst den Kamera-Leib treffen: plausibel über `vegetation-streu.js:2282` (Kollision liest den Stamm), aber das
  ROT nennt ein Haus, keinen Baum — Täter unbenannt; kurs-G:63 führt z416 als „ungeklärt".
- Widerspruch: FUND-REGISTER:245 und kurs-A:35 nennen die Samen „TOT"; fünf von sechs Kern-Entscheidungen stehen ungeschnitten in main.
- kd 21,5 ist laut Abgabe-Rumpf „UNGEPRÜFT" (Hemery/Savill/Pryor 2005 nicht nachgelesen); Konifere bleibt bei H/hd (eigene Stufe).
- Der Neu-Bau-Ring bis 5 Versuche in `buildInstance` ist ein Messen-und-Wiederholen im Bau-Pfad; seine Kosten am Schirm kennt niemand.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- **stamm-krone landen: Wirkung 4 · Aufwand S** — jeder Laubbaum an Wiese und Dorfrand verliert den Pfahl; Risiko: der bis zu
  5-fache Neu-Bau über der Budget-Zeile kann die Ankunft (Pflicht B) still verteuern, darum Bau-ms je Baum vor dem Landen messen.
- Fahrzeug-Haut aus Schnitten: Wirkung 4 (Pflicht C, Stadt) · L · braucht das Wort des Schöpfers (Byte-Treue zum Labor stirbt).
- Karten-Stufe-Kandidat: Wirkung 2 · M · nur CPU, Konflikt mit main, an der Buche wirkungslos.
