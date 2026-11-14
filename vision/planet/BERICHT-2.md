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
| G1.4 | 286, 1284–1297, 1376–1405, 1410 | Becken-Feld B im Schollen-Rahmen auf der ganzen Kruste (`… + S2·fb + S1·B`), über die Schollen stetig gemischt (Gewicht 1 − (f_best − f_s)/0,15); Schwellen linear, Becken quadratisch (−2·n²), c 3, Gewinn 0,62. Die Tafel ist gelöscht. `kont` = Feld der Gruppe × gemischter Radius (stetig über die Naht), gedeckelt durch den Abstand zur Null-Linie des Bodens (linear aus dem Gefälle von B), wo der Boden < 0,9 km über dem Meer liegt. |
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

## G2 — Inneres und Klima-Bild (Macher G2, 14.11.2026 23:49 – 15.11. 00:45, Zweig `w28-planet-kern`, Kopf 2a49a023) · ZWISCHENSTAND

**Drei Sätze.** Geschnitten sind G2.1–G2.5 im Kern (`VERSION` planet-g2-3): die Grenz-Normale, das Paar an der Grenze (Graben
beidseitig, Ränder als EINE Funktion für beide Seiten, Naht ±100 km auf das Mittel, Abstand auf Kruste nie diesseits der
Krusten-Kante), die Wurzel, der Schild und die Feuchte als Integral. Gemessen (12 Saaten, Richter `gesicht` um acht G2-Maße
erweitert): `grenze.stufe` konvergent 98,2 → 17,5 %, divergent 42,1 → 10,5 %, `klima.kante.flach` 3,34 → 1,40 %,
`innen.altguertel` 0,7 → 6,0 % (GRÜN), `relief.messer` 1 739 → 1 154 je Mio. Ehrlich offen: sieben der acht G2-Pflicht-Zeilen
stehen ROT (näher am Band, nicht drin), vier Bestands-Zeilen kippen (beim Namen unten), die Klima-Kosten +20 µs über dem Deckel.

### Geschnitten (Datei:Zeile an 2a49a023, `planet-core.js`)

| # | Stelle | Schnitt |
|---|---|---|
| G2.4 | 1092 `paarRelativC` | Wo der Betrag der Normale unter 0,8 liegt, trägt `paarC`: `c = c·g + paarC·(1 − g)`, g = glatt(0,3; 0,8; Betrag). Jeder Leser von c am Punkt (Versatz-Treppe, Rand-Art, Schablonen) liest es; `paarC` misst weiter das rohe c. |
| G2.5a Graben | 1135 `graben(ξ, s)`, Schablonen in `raender` | EIN Profil in ξ: die obere Platte (wb, wd oben) trägt `graben(−x)`, die abtauchende den Ausläufer von Anden bzw. Bogen bei ξ = −x. |
| G2.5b Ränder | 1191 `raender()`, 1288 `NAHT_KM`, 1348 | Die Rand-Schleife des Punkts ist EINE Funktion für die eigene Seite und die Partner-Seite (ξ = −x, nur Alter + Schablonen). In ±100 km um den Haupt-Rand gehen Schablonen und Sockel-Alter stetig auf das Mittel beider Platten. Der getrennte Sockel-Zweig des ersten Versuchs ist darin aufgegangen. |
| G2.5c Krusten-Kante | 1312, 1314 | Auf Kruste liegt der Haupt-Rand nie diesseits der eigenen Krusten-Kante (`max(mHaupt, (fK − Q + 0,05)·r·R)`); im Vorrang-Gebiet ist er die Kante; jenseits misst die Partner-Seite den Abstand zur Kante. Ohne das stand ein Graben quer durch einen Kontinent (verworfene Variante, unten). |
| G2.5d Alter | 1112 `randAlter`, 1129 `alterAusSumme` | EINE Alter-Funktion für beide Seiten; ein Rand, der nicht öffnet, erzeugt keinen Boden (+1 000 Ma, stetig über die Rate) — vorher stand an jeder Subduktion auf dem ersten Kilometer Boden von 0,05 Ma (gemessen an erde-03: ein 0,5-km-Grat). |
| G2.5e Grat | 1227 | Der Grat-Faktor 0,62…1 schaltete bei x = 700 km und Gewicht 0,05 hart auf 1; jetzt stetig ein- und ausgeblendet (gemessen: 1-km-Stufen tief im Kontinent). |
| G2.1 | 1143 `gedaechtnisHoehe` | `H0·(e^(−a/120) + 0,15·e^(−a/1 500))`, an Naht-Tafel und erloschenem Rand. |
| G2.2 | 291 `schildFaktor` | Amplitude von B fällt mit dem Schollen-Alter linear 1,9 → 0,1 (Mittel 1,0); Profil und `kont`-Gefälle lesen denselben Faktor. Mit 1,5 → 0,5 stand `innen.schild` bei −0,14, mit 1,9 → 0,1 bei −0,22. |
| G2.3 | 1811–1822 `kontGrob`, 1843 ff. | 14 Knoten im festen Takt 150 km; Meeres-Anzeige aus dem Krusten-Abstand der EINEN Küste (Feld der Gruppe, Radius gemischt wie `kont`); `om = Wind/1,044`; Kamm-Schranke aus den vier nahen Hüllen; `schritte[4]`, `[5]` und `skal` fallen. |

Gebaut, gemessen und verworfen (kein Commit im Kern): (1) die volle Abstands-Verallgemeinerung über alle Partner (`randX`) — Bild:
Gebirgs-Kranz um ganze Kontinente, Süd-Kontinent geflutet; (2) Naht-Mittel ohne die Krusten-Kante — Bild: Graben quer durch den
Nord-Kontinent von erde-09 (Land verloren 10 348 Pixel bei 720×360). Die Binnenmeere sieht das Feuchte-Integral NICHT (es liest den
Krusten-Abstand, nicht das Profil mit B): der Profil-Leser kostete je Knoten ein fBm mehr, schon so steht das Klima über dem Deckel.

### Richter

`scripts/diag-planet.cjs --richter gesicht` trägt jetzt `klima.kante.flach` (480×240), `klima.sprung20` (30 Großkreise je Saat,
Schritt 20 km), `relief.messer` und `grenze.stufe` (1024×512, fuss 16, t = 0 und −50 Ma), `innen.streuung`, `innen.altguertel`,
`land.median`, `innen.schild` mit Gegenlauf (Alter gespiegelt, Etikett ungespiegelt). Selbsttest 33/33 GRÜN, zehn neue gepflanzte
Täter (Fächer-Streifen, 100-mm-Sprung, 1,5-km-Stufe in der Platte, 2-km-Grenz-Stufe, stetige Flanke = 0, flaches Inneres, Inneres
ohne Gürtel, Land auf 2 km, alte rauer als junge Schollen). `--kosten g2 <alt>` (ABAB Punkt + Klima Land). `--bytes` GRÜN.
Laufzeit des Teils: 119–161 s für 12 Saaten; für 30 Saaten zwei Durchgänge der Fäden, über 3 min (die Gitter 1024 tragen es) — offen.

### Gemessen (12 Saaten erde-01…12, vorher = Kern planet-g1-2 als Kopie über `PLANET_KERN`, nachher = 2a49a023, gleicher Richter)

| Messname | vorher | nachher | Band | Urteil |
|---|---|---|---|---|
| `grenze.stufe` konvergent | 98,2 % | **17,5 %** | ≤ 10 % | ROT |
| `grenze.stufe` divergent | 42,1 % | **10,5 %** | ≤ 5 % | ROT |
| `grenze.stufe` Transform | 78,6 % | 10,4 % | ohne Band | INFO |
| `relief.messer` | 1 739 je Mio | 1 154 | ≤ 200 | ROT |
| `klima.kante.flach` | 3,34 % (2,62–6,73) | **1,40 %** (0,94–3,80) | Median ≤ 1,0 %, jede ≤ 4 % | ROT (jede Saat im Band) |
| `klima.sprung20` | p99 260 mm, max 4 072 mm | p99 180 mm, max 2 621 mm | p99 ≤ 40, max ≤ 80 mm | ROT |
| `innen.streuung` | 0,312 km | 0,382 km | 0,40–0,65 | ROT |
| `innen.altguertel` | 0,7 % | **6,0 %** | 5–25 % | GRÜN |
| `innen.schild` | Rang 0,03 / Gegenlauf −0,03 | **−0,22 / +0,22** | ≤ −0,5 / ≥ +0,5 | ROT — die Folge kippt mit der Ursache, zu schwach: Mantel-Feld (DYN_KM 2,0) und Lappen tragen den größeren Teil der Kern-Streuung |
| `land.median` | 0,646 km | 0,714 km | 0,2–0,6 | ROT, entfernt sich (die Wurzel hebt altes Land) |
| `land.fern1000` (G1) | 7,2 % | **8,8 %** | 8–22 % | ROT → GRÜN |
| `land.stuecke4` (G1) | 40 | **34** | 40–100 | **GRÜN → ROT** (gemessen: G2.4+G2.5 allein 34,5; der Schild ändert es nicht) |
| `kont.kueste` / `kont.naht` (G1) | 5,8 % / 35,5 | 4,1 % / 42 | ≤ 3 % / 0 | ROT; naht entfernt sich |

Bestands-Richter am selben Lauf (Bände unverändert):
- bau1: **`schelf.anteil` 4,6 → 3,3 % kippt** (gemessen: G2.4+G2.5 allein 4,3 %, mit der Wurzel 3,4 % — das Rand-Gedächtnis, dessen
  Ring mit dem Alter breiter wird, hebt alten Schelf über das Meer); **`meer.volumen` 0,96 → 1,27 % kippt** (erde-12, schon mit
  G2.5 allein 1,22 %); `gebirge.guertel` lang 12 → 9 %, `gebirge.vorn` 76 → 72 % und `ozean.facette` 99,25 → 99,07 % entfernen
  sich; `hoch.anteil` 3,35 → 3,82 %, `land.anteil` 30,4 → 31,1 %, `ozean.alter` 63,6 → 63,4 Ma, `kueste.dimension` 1,173 → 1,160 GRÜN.
- bau2: `klima.wueste` GRÜN (BWh 11,9 → 9,4 %), `klima.widerspruch` 0; entfernen sich: `klima.koeppen` E 23,5 → 24,7 %,
  `klima.regenschatten` 48 → 40 %, `klima.gegenlauf` 67 → 64 % (die Kamm-Schranke liest zwei Schritte weniger, wie im Entscheid gewarnt).
- bau3: **`zeit.statistik` kippt** (−100 Ma 11 → 10/12, −200 Ma 12 → 11/12: Hypsometrie von erde-03 und erde-06 nicht mehr
  zweigipflig); `gebirge.vorn.zeit` ROT → **GRÜN** (85 % / 84 %), `superkontinent` 4 → 6/12, `ort.anker` 10 → 12/12;
  `zeit.stetig` 47 → 52 Höhen-Sprünge (entfernt sich; max 9,38 → 8,33 km). `zeit.sprung`, `ort.kosten` unter Last, ohne Urteil.

Kosten (`--kosten g2`, ABAB im selben Prozess, 7 × 3 Saaten): gegen planet-g1-2 `planetPunkt` 11,80 → 12,70 µs (**+0,90 µs**, GRÜN
gegen +1) · `planetKlima` Land 80,5 → 100,9 µs (**+20,4 µs**, ROT gegen +12; die 14 Krusten-Felder der Knoten). Gegen d660f478:
Punkt +3,4 µs, Klima +39,5 µs (G1 + G2 zusammen). G3.7 schneidet hier.

### Bilder (`artifacts/profiband/auge/planet-kern/welle2/`)

`g2-vorher/erde-{09,15,21}-t0-{relief,biom}.png`, `erde-09-t-50-{relief,biom}.png` · `g2-nachher/` dieselben · Bildpaare (oben
vorher, unten nachher, 1 600 px) `g2-nachher/paar-erde-{09,15,21}-t0-{relief,biom}.png`, `paar-erde-09-t-50-relief.png` · Zeit-Reihe
für G3 `g2-nachher/streifen-erde-09-zeit-{relief,biom}.png` (−200 · −100 · −50 · 0 · +50 Ma) · Roh-Ausgaben `g2-*/richter-*.txt`,
`g2-nachher/kosten-g2.txt`.

Mein Urteil, selbst angesehen: **Es liest mehr als Planet als vorher.** erde-15: die weißen Kollisions-Plateaus im Süden sind zu
Gebirgszügen geworden, die rote Schraffur mit der grünen Ellipse unten Mitte ist fort, im Inneren stehen Seen. Biom erde-09 und
erde-15: die Keile aus einem Punkt und die geraden Polygon-Kanten sind fort, das Grün fällt vom Luv-Ufer stetig landein. Ozean:
die Gräben sind Rinnen statt Stufen. Die Zeit-Reihe bleibt zusammenhängend. Was stört: (1) um den Nord-Kontinent von erde-09 (bei 0
und −50 Ma) läuft ein Gebirgs-Kranz dicht an der Küste über den halben Umfang — die Krusten-Kante ist dort Grenze zu EINER Platte,
und G2.4 setzt `paarC` (konvergent) auf die ganze Kante; (2) das dunkle Ozean-Rechteck in erde-15 mit geraden Kanten steht noch
(Täter ungeklärt); (3) feine Streifen längs des Winds hinter rauen Küsten; (4) erde-15 steht weiter fast ganz im Braun; (5) der
Süd-Kontinent von erde-09 trägt eine geflutete Schelf-Lagune; (6) Binnenmeere bekommen kein grünes Ufer (das Integral sieht sie nicht).

### Ehrlich offen (mit Messnamen)

- Pflicht ROT: `grenze.stufe` (17,5 / 10,5 %), `relief.messer` (1 154; Rest: Wechsel des Haupt-Partners unter der Versatz-Treppe,
  die nur das Haupt-Paar versetzt), `klima.kante.flach` (1,40 %), `klima.sprung20` (p99 180 mm — Täter ungemessen), `innen.streuung`,
  `innen.schild` (−0,22), `land.median` (0,714). `klima.widerspruch.binnen`: ungebaut.
- Kipp: `land.stuecke4` 40 → 34, `schelf.anteil` 4,6 → 3,3 %, `meer.volumen` 0,96 → 1,27 %, `zeit.statistik` (−100/−200 Ma); entfernen
  sich: `land.median`, `kont.naht`, `gebirge.guertel`, `gebirge.vorn`, `ozean.facette`, `klima.koeppen` E, `klima.regenschatten`,
  `klima.gegenlauf`, `zeit.stetig`.
- Kosten: Klima +20,4 µs über dem Deckel; der Richter-Teil `gesicht` überschreitet bei 30 Saaten 3 min.
- Gebirgs-Kranz an Krusten-Kanten im Vorrang-Gebiet (`bild.kranz`); Binnenmeere im Feuchte-Integral (`klima.binnen`).
- Nur 12 Saaten; Erd-Spalte weiter `erde.maske`; Konsum im Spiel 0 % (`ort.leser`).
