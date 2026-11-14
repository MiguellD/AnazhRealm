# BERICHT 2 — die zweite Planeten-Welle (Abschnitte der Macher, angehängt)

## G1 — Gestalt des Landes (Macher G1, 14.11.2026 23:02–23:50, Zweig `w28-planet-kern`, Kopf 370a0253) · ZWISCHENSTAND

**Drei Sätze.** Geschnitten sind G1.1–G1.4 im Kern (`VERSION` planet-g1-2); G1.5 ist gebaut, gemessen und zurückgenommen.
Gemessen (12 Saaten, t = 0, Richter `gesicht` neu): `land.ellipse` 0,899 → 0,841, `land.stuecke4` 23 → 40, `meer.binnen` 0,6 → 1,6 %
(drei Pflicht-Zeilen GRÜN), `land.fern1000` 11,3 → 7,2 % (ROT), die Kosten je Punkt ×1,27 (ROT gegen ≤ 1,10).
Ehrlich offen: `land.fern1000`, `kont.naht`, `kont.kueste`, `grenze.bogen`, die Kosten und fünf ROTE Bestands-Zeilen, die sich
vom Band entfernen (unten beim Namen).

### Geschnitten (Datei:Zeile an 370a0253, `planet-core.js`)

| # | Stelle | Schnitt |
|---|---|---|
| G1.1 | 279 (Konstanten), 335–336 (Gewicht), 353–365 (`gruppenGroessen`), 545–566 (`neuSchnitt`) | Schollen-Gewicht gestutzt Pareto α 4/3 (Deckel 6). EINE Funktion `gruppenGroessen(zyklus)` für Anfang UND Neuschnitt (Anlagern, p 0,25, ≤ 19 − nO Gruppen, größte ≤ 0,4 der Schollen); der Neuschnitt füllt die Ziel-Größen längs der Kontakt-Kanten, alte Gruppen-Kanten zuerst. Die Union-Find-Verschmelzung mit Deckel 6 ist gelöscht. |
| G1.2 | 281, 1006–1028 (`schollenFeld`) | Zwei Bänder: grob λ min(6 000, 2·rs) … 0,45·λ0 auf dem ganzen Feld ab f > −1,3, Amplitude `LAPPEN_GROB` 1,5; fein 0,45·λ0 … lamCut nur im Küsten-Gürtel, Fenster liest das grobe f, Amplitude 0,45 (= 0,6 × Anteil der Oktaven unter 0,45·λ0). |
| G1.3 | 1032 (`SF`, `KF.sFg`, `KF.gV`), `krusteFeld`, 1314 | `KF.gF` (Platten-Wertung, Schablonen, Nachbar-Liste) und das Rand-Gedächtnis lesen GROB; Rückgabe, `W_.fGrp` (K1-Vorrang), Profil und Q lesen VOLL. |
| G1.4 | 286, 1284–1297, 1376–1405, 1410 | Becken-Feld B im Schollen-Rahmen auf der ganzen Kruste (`… + S2·fb + S1·B`), über die Schollen stetig gemischt (Gewicht 1 − (f_best − f_s)/0,15); Schwellen linear, Becken quadratisch (−2·n²), c 3, Gewinn 0,62. Die Tafel ist gelöscht. `kont` = Feld der Gruppe × gemischter Radius (stetig über die Naht), gedeckelt durch den Abstand zur Null-Linie des Grunds (linear aus dem Gefälle von B), wo der Grund < 0,9 km über dem Meer liegt. |
| G1.5 | Commit 0a3ea0aa (gebaut), e2644e53 (zurück) | Stätten-Ketten (3 Stätten, EIN ρ 0,57): `grenze.bogen` 38,8 → 36,4° (Fenster ±2 000 km), ganze Grenze 56,9 → 53,7°; dazu `gebirge.vorn` 76 → 69 %, `meer.volumen` 0,96 → 1,12 % (kippt ROT). Die Annahme fällt nicht: die Krümmung im Maß trägt der Platten-Verzug (Versatz ~390 km auf 4 000 km Sehne entspricht einem Kleinkreis von ~40°), nicht ρ. Zurückgenommen, ρ je Platte steht wie vorher. |

Bewusst NICHT umgesetzt aus dem Entscheid: Becken symmetrisch mit c 5 — gemessen leerte es das Innere (`land.fern1000` 5,0 %);
die Quadratik ist Gesetz („ein Becken unter dem Meer ist selten und kompakt“), mit den Zahlen im Kopf der Konstante.

### Richter

`scripts/diag-planet.cjs`: `--richter gesicht` (Gitter 720×360, fuss 40 km) mit `land.ellipse`, `land.stuecke4`, `land.formzahl`,
`land.fern1000`, `meer.binnen`, `kont.naht`, `kont.kueste`, `gebirge.kruemel`, `grenze.bogen` und den Richt-Zahlen; im
`--selbsttest` 11 gepflanzte Täter (Ellipsen-Kontinent, ein Stück, kein Binnenmeer, See im Ei, Streifen, kont-Sprung an der
Naht, kont an der Küste, Krümel, Kappen-Grenze 40°, Meridian 90°) — Selbsttest 24/24 GRÜN. `--bildpaar <alt-kern>` (oben alt,
unten neu), `--kosten g1 <alt-kern>` (ABAB im selben Prozess), Umgebung `PLANET_KERN` für vorher ↔ nachher unter gleicher Last.
`--bytes` GRÜN (Prozesse, jitless, Reihenfolge, Biom). `bogen.inseln` ist nicht gebaut (ungemessen).

### Gemessen (12 Saaten erde-01…12, t = 0; vorher = Kern d660f478 aus dem Scratch, nachher = 370a0253, gleicher Richter)

| Messname | vorher | nachher | Band | Urteil |
|---|---|---|---|---|
| `land.ellipse` | 0,899 (0,875–0,932) | **0,841** (0,783–0,895) | ≤ 0,85 | GRÜN |
| `land.stuecke4` | 23 (18–36) | **40** (21–56) | 40–100 | GRÜN (an der Kante) |
| `land.formzahl` | 0,800 | 0,754 | 0,70–0,88 | GRÜN |
| `land.fern1000` | 11,3 % | **7,2 %** | 8–22 % | ROT — G1.1 allein senkt auf 7,3 %, Becken symmetrisch c 5 auf 5,0 % |
| `meer.binnen` | 0,6 %, 9 | **1,6 %, 16,5** | 1,5–6 %, ≤ 30 | GRÜN |
| `kont.naht` | 124 (63–331) | 35,5 (8–64) | 0 | ROT |
| `kont.kueste` | 4,5 % (1,9–11,4) | 5,8 % (2,0–18,8) | ≤ 3 % | ROT — 60–80 % der Täter liegen < 400 km vor einem Platten-Rand (Schablonen-Küsten: Graben, Vorland), die `kont` nicht sieht (Probe 6 Saaten) |
| `gebirge.kruemel` | 2,9 % | 3,1 % | ≤ vorher | ROT (+0,2 Punkte) |
| `grenze.bogen` (Fenster ±2 000 km) | 40,0° | 38,8° | ≥ 70° | ROT — rauschbegrenzt durch den Verzug, s. G1.5 |
| `land.groesster` | 0,387 | **0,445** | 0,40–0,65 | im Band |
| `land.korcak` | 0,22 | 0,32 | 0,45–0,75 | zum Band hin, draußen |
| `land.stuecke5` | 8,5 | **12,5** | 12–30 | im Band |
| `land.schmal300` | 11,8 % | 16,2 % | 8–18 % | im Band |
| `kueste.entwicklung` | 2,10 | 2,07 | 1,5–3,5 | im Band |
| Platten | 13 (9–16) | 14 (10–19), größte max 34,9 % | 8–20, ≤ 35 % | GRÜN, an der Kante |

Bestands-Richter am selben Lauf (12 Saaten; Bände unverändert):
- bau1 GRÜN bleibt GRÜN außer **`vulkan.zahl` kippt** (eine Saat bei 248 < 300; Median 669,5 → 670,5). `land.anteil` 30,3 → 30,4 %,
  `schelf.anteil` 5,4 → 4,6 %, `hoch.anteil` 2,75 → 3,35 %, `ozean.alter` 81,6 → 63,6 Ma, `kueste.dimension` 1,167 → 1,173,
  `meer.volumen` 0,90 → 0,96 %, `hyps.bimodal` 11 → 12/12.
- ROT entfernt sich vom Band (Kipp-Regel verletzt, beim Namen): **`gebirge.vorn`** 79 → 76 % (Gedächtnis 69 → 55 %; G1.1
  allein 70 %: die neuen Gruppen fahren anders); **`gebirge.guertel`** auf Kontinent 72 → 68 %; **`ozean.facette`** 99,32 → 99,25 %;
  **`klima.koeppen`** E 20,3 → 23,5 %; **`zeit.stetig`** 35 → 47 Höhen-Sprünge (Küste ohne Partner 352 → 235, besser).
- bau2: `klima.wueste` 11 → 12/12, `klima.regenschatten` 42 → 48 %, `klima.gegenlauf` 66 → 67 %, `klima.eis` 8,8 → 8,6 %.
- bau3: `zeit.statistik`, `zeit.rueckkehr`, `meer.zeit`, `ort.anker` (11 → 10/12), `ort.bereich` GRÜN; `superkontinent` 3 → 4/12;
  `gebirge.vorn.zeit` 83/78 → 79/81 %. `ort.kosten` (0,91 → 4,87 ms) und `zeit.sprung` liefen nachher unter der Last der
  parallelen Karten — kein Urteil, neu zu messen.

Kosten (`--kosten g1`, ABAB im selben Prozess, 7 × 3 Saaten × 8 000, Laptop unter fremder Last): `planetPunkt` 22,40 → 28,50 µs
(**×1,272**, Deckel 1,10, ROT) · Hülle 17,90 → 21,00 µs (**×1,173**, Deckel 1,05, ROT) · `planetPlan` 41,0 → 52,0 ms (Deckel 25 ms
schon vorher gerissen) · Scheibe kalt 743 → 855 ms. Der Aufschlag sitzt im groben Lappen-Band (jetzt auf dem ganzen Feld) und im
Becken-Feld (bis 7 Oktaven); ein Becken-Schnitt bei 250 km kostete `land.stuecke4` (40 → 39) und blieb draußen. G3.7 schneidet hier.

### Bilder (`artifacts/profiband/auge/planet-kern/welle2/`)

`g1-vorher/erde-{09,15,21}-t0-{relief,biom}.png` · `g1-nachher/` dieselben · `g1-nachher/paar-erde-{09,15,21}-t0-relief.png` und
`paar-erde-09-t0-biom.png` (oben vorher, unten nachher, 1 600 px) · `g1-nachher/streifen-erde-09-zeit-relief.png` (−200 · −100 ·
−50 · 0 · +50 Ma, oben vorher, unten nachher) · Roh-Ausgaben `g1-{vorher,nachher}/richter-*.txt`.

Mein Urteil, selbst angesehen: **Es liest mehr als Planet als vorher.** erde-09: statt der zwei „Eier“, der „Bohne“ und des
„Herzens“ steht ein großer zusammengesetzter Kontinent mit Golf, Schelfmeeren und Halbinseln, daneben mittlere und kleine
Stücke verschiedener Größe. erde-21: die gepackten Ellipsen oben sind fort, die Umrisse tragen Buchten und Zipfel. Die
Zeit-Reihe bleibt zusammenhängend; jedes Bild hat Rangordnung.
Was stört: (1) flache hellblaue Schelf-Lachen im Inneren und im Süd-Kontinent von erde-09 eine Lagune im Gebirgsring —
Becken lesen als überflutetes Flachland, nicht als tiefes Binnenmeer; (2) in erde-15 nachher ein dunkles Ozean-Rechteck mit
geraden Kanten (x 1130–1300, y 1210–1500 im Paar) — Täter ungeklärt; (3) breite weiße Kollisions-Plateaus (erde-15 Süd, erde-09
Süd-West) und weniger lange Gürtel (`gebirge.guertel` 72 → 68 %); (4) das Innere bleibt eine Farbe, die Biom-Fächer stehen
unverändert (beides G2); (5) erde-15 steht vorher wie nachher fast ganz im Braun.

### Ehrlich offen (mit Messnamen)

- `land.fern1000` 7,2 % (≥ 8 %): die Rangordnung zerlegt das Land; kein Becken- oder Lappen-Hebel hob über 7,9 %.
- `kont.naht` 35,5 und `kont.kueste` 5,8 %: `kont` trägt das Rauschen des Feldes (es ist kein Abstand) und sieht Schablonen-Küsten nicht; die EINE Küste für alle Leser steht nicht.
- `grenze.bogen`: G1.5 zurückgenommen; die Linse misst am verzogenen Rand und ist rauschbegrenzt. `bogen.inseln`: ungebaut.
- Kipp: `vulkan.zahl` GRÜN → ROT; `gebirge.vorn`, `gebirge.guertel`, `ozean.facette`, `klima.koeppen`, `zeit.stetig` entfernen sich vom Band.
- Kosten ×1,27 / ×1,17 über dem Deckel; `ort.kosten` und `zeit.sprung` nachher unter Last gemessen, ohne Urteil.
- Nur 12 Saaten (Auftrag); die 30 Saaten des Richters sind nachher nicht gelaufen. Erd-Spalte weiter `erde.maske`.
- Konsum im Spiel 0 % (`ort.leser`).
