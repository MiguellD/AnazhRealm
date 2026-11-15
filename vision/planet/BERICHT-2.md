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

## G3 — Zeit und Kosten, Teil R (Macher G3, 15.11.2026 00:46 – 01:50, Zweig `w28-planet-kern`, Kopf e33f1413) · ZWISCHENSTAND

**Drei Sätze.** Geschnitten sind G3.1–G3.7 und R1–R6 im Kern (`VERSION` planet-g3-2), die Kosten-Schnitte G3.5/G3.6/G3.7 byte-gleich,
G3.4 und G3.1 mit neuen Bytes (Tafel `bytes.version`). Gemessen (ABAB gegen d660f478, Referenzfahrt): `planetPunkt` ×1,394 → ×0,757,
`planetKlima` Land ×1,689 → ×0,951, `zeit.sprung.ref` 286 → 112 ms, bau3 `zeit.sprung` kalt bestes 315 → 101 ms; `zeit.stetig` 52 → 49.
Ehrlich offen: `planetOrt` ×1,101 (ROT gegen ≤ 1,03), `zeit.stetig` ROT (43 der 49 Sprünge liegen auf fremder Platte), `zeit.schritt` 9/12,
`zeit.reise` hin und zurück 1159/1204; das Bild liest wie vorher — G3 hat das Gesicht weder gehoben noch verdorben.

### Geschnitten (Datei:Zeile an e33f1413)

| # | Stelle | Schnitt |
|---|---|---|
| G3.5 | `planet-core.js` 1591 | Meer-Fach A1 nur bei u ≠ 0 (byte-gleich: 16/16 Karten). |
| G3.6 | 874, 1322 | Hotspot-Ketten am ersten Leser (`punktRoh` außerhalb der Hülle) statt in jeder Scheibe (byte-gleich). |
| G3.4 | 1540–1541, `sigmaSelbst`, `meerFach` | `hueleProben(plan, t, N)` mit Memo je (Zeit, N); Bezugs-Stützen 1 024, Spiegel der Zeit 4 096. t = 0: 9 216 statt 28 672 Hüll-Punkte. Bezug erde-09 −896,5 → −913,2 m, Land 26,95 → 26,44 %. |
| G3.2 Linse | 1181 (Terme in `PK`), 2278 `terme`; `diag-planet.cjs` 411–426 | Der Punkt führt seine Terme (Boden · Profil · Mantel · Schablone · Trapp · Orogen/Gedächtnis · Kegel · Nachklang, Rest = Spiegel); `zeit.stetig` nennt je Sprung den Term mit dem größten Δ, mit `fremd·`, wenn der Punkt nicht auf der Platte seiner Scholle liegt. |
| G3.2 Schnitt | 1347 | Täter Orogen: der Rand zur fremden Kruste liest die NÄCHSTE fremde Gruppe (max über g ≠ own), nicht die beste — der Wechsel der besten Gruppe schaltete den Abstand an und aus (erde-04, 87,9 Ma: Rand 252 → 685 km in 0,04 Ma, ein 5-km-Gebirge verschwand). |
| G3.3 | `diag-planet.cjs` 427 | Küsten ohne Partner geteilt nach Stück-Größe (≥ 10⁴ km² · darunter). Band unverändert. |
| G3.1 | 925 `kegelPlatte`, 897 | Jede Kegel-Stütze fährt mit der Platte, die zur Ausbruchs-Zeit T_k über dem Hotspot lag (Tafel je Hotspot und 3,5-Ma-Takt im Plan-Memo, eine leichte Scheibe je Takt). |
| G3.7 | 171–174 `gr`, 175/185 `hzFertig`, 1159 `randTafel`, 1318 `beckenGrob` | Profil zuerst (`--cpu-prof`): 29 % der Punkt-Zeit in der Sprung-Tafel von `gr`, 32 % von `planetOrt` in Exponenten des Rand-Gedächtnisses. Gradienten als Tafel (±1·x exakt, die Null-Spalte addiert ±0 zu einer Summe, die nie −0 ist), Hash-Produkte je Achse einmal, Rand-Gedächtnis als Tafel je Scheibe, Closure je Punkt gelöscht — alles byte-gleich (SHA vorher = nachher, `--bytes` jitless GRÜN). |
| R1 | 1695–1810 | EINE Karten-Schleife für ganze Karte, Streifen (`teil = { zeile0, zeile1, zustand }`) und `planetKarteAusschnitt`. |
| R2 | 2207–2232 | `planetOrt().delta` = Ort − Anker (am Anker mit derselben Funktion gerechnet, Memo), Spende als Verhältnis, 81 Leit-Stützen Stütze für Stütze. |
| R3 | 2283 `planetOrtDerZeit` | Kruste fährt mit ihrer Scholle, Boden einer Kontinent-Platte mit deren Bezugs-Scholle, Ozean-Boden mit seiner Platte; Boden jünger als t0 − t1 → `existiert: false`. |
| R4 | `diag-planet.cjs` 849 | `bytes.version`: Tafel VERSION → SHA Relief erde-09 256 px (planet-g3-2 → 553f0a69…). |
| R5 | 2119 `pruefJahr` an `planetOrt` und `planetAnker`; Richter `jahrOrt()` 51 | Jahr des Körpers ≠ Jahr des Ort-Gesetzes bricht beim Namen; der Richter baut den Plan mit 365 (gelaende-core). |
| R6 | Kopf Zeile 5 | Kein Verdrahtungs-Stand im Kopf; den sagt allein `ort.leser`. |

Gebaut, gemessen und zurückgenommen: die Naht zweier übereinander liegender Krusten als Linie gleicher Felder (`(f_own − f_fremd)/2`) —
sie senkte die Orogen-Sprünge an 4 Saaten von 9 auf 1, aber `paar-erde-15` zeigte weiße Plateaus über halbe Kontinente (die Krusten
überdecken sich weit, ohne Verkürzung). Ein Schnitt, der die Zahl hebt und das Bild verdirbt, steht nicht.

### Gemessen (12 Saaten erde-01…12; vorher = Kern planet-g2-3, nachher = planet-g3-2, gleicher Richter)

| Messname | vorher | nachher | Band | Urteil |
|---|---|---|---|---|
| `kosten.punkt.g0` (ABAB gegen d660f478) | ×1,394 (13,2 → 18,4 µs) | **×0,757** (13,6 → 10,3 µs) | ≤ 1,03 | ROT → GRÜN |
| `kosten.klima.g0` | ×1,689 | **×0,951** | ≤ 1,03 | ROT → GRÜN |
| `ort.kosten.g0` | ×2,248 | ×1,101 | ≤ 1,03 | ROT (näher) |
| `zeit.sprung.ref` (normiert, REF0 104,59 ms) | 286 ms | **112 ms** | ≤ 250 ms | ROT → GRÜN |
| `zeit.sprung` (bau3) kalt bestes / warm | 315 ms / 4,28 ms | **101 ms / 3,52 ms** | ≤ 120 / ≤ 5 | kalt und warm im Band; die Zeile wackelt am Unter-Kriterium Punkt −3 000 Ma ±20 % (Lauf 1: 3 % / −7 % GRÜN, Lauf 2: −5 % / −27 % ROT, gleicher Kern) |
| `zeit.stetig` Höhe | 52 / 96 000 | 49 | 0 | ROT; Täter vorher fremd·Boden 23 · fremd·Orogen 13 · Orogen 5 · fremd·Schablone 4 · Schablone 3 · Boden 2 · Kegel 2; nachher dieselben bis auf fremd·Orogen **11**, Kegel **1** |
| Küsten ohne Partner | 260 (≥ 10⁴ km² 133 · darunter 127) | 286 (150 · 136) | — | die Hälfte liegt an großen Stücken: die Zeile wird NICHT neu begründet |
| `zeit.schritt` (neu) | 0,926, 9/12 | 0,927, 9/12 | ≥ 0,90 in ≥ 27/30 | ROT beide |
| `zeit.reise` (R3, neu) | — | Kruste 1204/1204; hin und zurück 1159/1204 (45 mit anderer Scholle auf dem Rückweg, übrige Sehne ≤ 1·10⁻¹⁵) | 100 % | ROT |
| `ort.delta.null` (R2, neu) | — | 12/12 | alle | GRÜN |
| `bytes.streifen` (R1, neu) | — | SHA gleich (relief, biom), Streifen max 129 ms, Fenster-Mitte = `planetPunktR` | ≤ 150 ms | GRÜN |
| `bytes.version` (R4, neu) | — | planet-g3-2 = Tafel | | GRÜN |
| `ort.kosten` (bau3) | 1,523 ms · Anker 9,3 ms | 0,888 ms · Anker 8,7 ms | ≤ 1 / ≤ 10 | ROT → GRÜN (unter Last schwankend: Zwischenlauf 2,30 ms / 24,3 ms) |

Selbsttest 40/40 (neu gepflanzt: Täter-Name, `zeit.schritt`, Insel-Teilung, `bytes.version`, Jahr R5, `ort.delta.null`, `zeit.reise`).

Bestands-Richter (Bände unverändert): bau1 ohne Kipp — `ozean.facette` 99,07 → 99,10 % (näher), `meer.volumen` 1,27 → 1,26 %,
`vulkan.zahl` Median 655 → 656 (ROT bleibt), `land.anteil` 31,1 %, `kueste.dimension` 1,160 → 1,162, `vulkan.kette` 1,000.
bau2 ohne Kipp (E 24,7 → 24,6 %; darin das Jahr 365 statt 365,25, Faktor 0,9999). bau3: `zeit.rueckkehr`, `meer.zeit`, `gebirge.vorn.zeit`,
`ort.anker`, `ort.bereich` GRÜN. gesicht — beim Namen, weil ROT sich entfernt: **`land.stuecke4` 34 → 33,5**, **`relief.messer`
1 154 → 1 231 je Mio**, **`klima.sprung20` p99 179,7 → 181,5 mm**; näher: `kont.naht` 42 → 41, `kont.kueste` 4,1 → 4,0 %,
`land.median` 0,714 → 0,704 km, `klima.kante.flach` 1,40 → 1,38 %. Ursache ungetrennt zwischen G3.4 (Bezug −17 m, der Schelf rückt),
G3.1 (Kegel umgesetzt) und dem Orogen-Schnitt an 1347; G3.5–G3.7 sind byte-gleich und scheiden aus. `land.groesster` 0,444 → 0,405 (Richt-Zahl, im Band).

### Bilder (`artifacts/profiband/auge/planet-kern/welle2/`)

`g3-vorher/erde-{09,15,21}-t0-{relief,biom}.png` · `g3-nachher/` dieselben · Bildpaare (oben vorher, unten nachher, 1 600 px)
`g3-nachher/paar-erde-{09,15,21}-t0-{relief,biom}.png` · Zeit-Reihe −200 · −100 · −50 · 0 · +50 Ma (oben vorher, unten nachher)
`g3-nachher/streifen-erde-09-zeit-{relief,biom}.png` · Roh-Ausgaben `g3-{vorher,nachher}/richter-*.txt`, `kosten-g3.txt`,
`g3-vorher/richter-bau3-linse-g3.txt` (vorher-Kern mit der neuen Linse).

Mein Urteil, selbst angesehen: **Es liest so sehr als Planet wie vorher, nicht mehr.** G3 ist Zeit und Kosten; das Gesicht ändert sich
kaum: die Schelfe sind einen Hauch schmaler (Bezug −17 m), in erde-09 Süd-West ersetzt ein kurzer Gürtel-Saum die gerade Naht-Linie im
Grün, an einigen Hotspots stehen Kegel-Ketten an anderer Stelle. Die Zeit-Reihe bleibt zusammenhängend und gleicht der vorigen. Was
stört, unverändert aus G2: das dunkle Ozean-Rechteck in erde-15, die Schelf-Lagunen, der Gebirgs-Kranz im Norden von erde-09, und bei
400 px die rote Vulkan-Schraffur, die die Gürtel überdeckt (`bild.marken`).

### Ehrlich offen (mit Messnamen)

- `ort.kosten.g0` ×1,101: Küsten-nahe Kontinent-Punkte bei fuss 16 tragen Becken (8 Oktaven je Scholle), das Gefälle von `kont` (9 Rauschen)
  und die zweite Rand-Seite der Naht; dort kostet ein Punkt ~14 µs gegen ~11 µs in d660f478. Der Anker liegt per Gesetz an der Küste.
- `zeit.stetig` ROT: 43 von 49 Sprüngen liegen auf einer Platte, die nicht die Platte ihrer Scholle ist (Punkt im Rahmen der Scholle, über
  den Kruste oder Hang einer fremden Scholle gleitet) — Materie ist das nicht, die Linse zählt sie aber; ob die Zeile auf Material
  beschränkt wird, entscheidet der Koordinator (G3.3-Regel), nie der Lauf. Material-Sprünge: Orogen 5, Schablone 3, Boden 2, Kegel 1 —
  keiner über 5, also nach der Regel des Entscheids kein weiterer Schnitt. Die Überdeckung zweier Krusten schaltet weiter hart (`bild.naht`).
- `zeit.reise` 45/1204: auf dem Rückweg findet die Überdeckung eine andere Scholle; die Signatur trägt keine Material-Kennung.
- `zeit.schritt` 9/12: die Land-IoU über 5 Ma fällt an drei Saaten unter 0,90 des Medians — ungeschnitten, Täter ungemessen.
- `zeit.sprung` wackelt am Punkt-Verhältnis −3 000 Ma unter Last; kalt und warm stehen im Band. Die Ketten-Kosten sind mit G3.6 aus der
  Scheibe in den ersten Punkt gewandert und mit G3.1 auf 6–11 ms gewachsen (leichte Scheiben je 3,5-Ma-Takt).
- Kipp beim Namen: `land.stuecke4`, `relief.messer`, `klima.sprung20` entfernen sich leicht; Ursache ungetrennt (oben).
- Streifen biom 256 px: im Einzeltest 200 ms, im Richter 129 ms — die Schwelle 150 ms steht an der Last.
- Daumenkino 0 → +50 Ma in 5-Ma-Schritten und ±10 Ma in 2-Ma-Schritten (Bild-Annahme 1, 2 des Entscheids): nicht geschossen.
- Nur 12 Saaten; REF0 an EINEM Laptop unter fremder Last; GTX, Browser, zweite Engine ungemessen. Konsum im Spiel 0 % (`ort.leser`).

## Heilung und Stand (Heiler der Gegner 2, 15.11.2026 02:26–04:15, Zweig `w28-planet-kern`, Kopf 932749bc — Bytes = c0fdd43b, VERSION planet-h2-1) · ZWISCHENSTAND

**Drei Sätze.** Geschnitten sind sechs Wurzeln im Kern: der Nachklang mischt hB, der Memo-Schlüssel des Ort-Gesetzes trägt jedes gelesene
Feld, Rand-Gedächtnis und Nähte folgen EINEM Breiten-Deckel mit glatter Lage längs des Streichens und Ausklang zur Mitte, die
Hotspot-Ausbrüche streuen in Zeit, Stärke und Breite, stehende Wellen drehen Wind und Gürtel und tragen Winter-Advektion, die
Westwind-Drift reicht 1 500 km seewärts. Gemessen (30 Saaten, Richter `gegner2` neu, vorher = e33f1413): `zeit.wechsel` 11 Sprünge bis
641 m → 0, `rand.stern` 41,5 → 20,6 km, Gedächtnis > 1 km bei +50 Ma 5,9 → 2,8 % des Landes (Orogen 11,1 %), `eis.kante` 4,75°/6,25° →
9,25°/9,25°, `ort.memo` ROT → GRÜN; die Kosten gegen d660f478 halten in drei Läufen (Punkt ×0,71–0,79, Klima ×0,92–0,95, Ort ×0,89–1,01).
Ehrlich offen: F3, F7, F8, F10 und der lebende Rahmen aus F4 sind ungeschnitten, `innen.altguertel` 5,9 → 4,6 % und `innen.streuung`
0,433 → 0,393 km kippen auf ROT (ein Teil der alten Gürtel im Inneren WAR der Stern), und das Ort-Band ≤ 1,03 × streut noch ±6 %.

### Je Fund (selbst nachgeprüft, dann geschnitten oder offen)

| Fund | Nachprüfung | Schnitt (`planet-core.js` an c0fdd43b) | Zahl vorher → nachher | Stand |
|---|---|---|---|---|
| Zahl §5 Nachklang ohne hB | Sonde an erde-01…04: 4 Sprünge, alle mit Platten-Wechsel, bis 389 m; die Terme von hA gleichen sich aus | `punktKern`: `PK.hB += w·(bAlt − bNeu)` — dieselbe Gewichtung wie hA | `zeit.wechsel` (neu; 30 Saaten × alle Wechsel −4 000…+1 000 Ma × 64 Punkte = 51 520 Paare; Sprung > 5 m UND größer als die Änderung der 0,01 Ma davor): 11 (max 641 m) → **0** | geheilt |
| Zahl §6 `ortAnkerRoh` ohne `regler` | bestätigt: 9 583 ↔ 9 586 Zeichen | `ortGesetzSchluessel(og)`: Kühlung, Meer-Basis, alle sieben Klima-Konstanten, die ganze Regler-Tafel; EIN Schlüssel für Anker- und Ort-Memo | `ort.memo` (neu): verschieden → **gleich** | geheilt |
| F1 Stern | bestätigt im Fenster erde-gegner2b-03 (49,5° N, 78,1° O, 2 400 km); die Fach-Breite 85·(1 + a/200) wuchs bis 510 km in die Mitte | `randTafel`: Breite ≤ 2 × Anfang (≤ 255 km), die Nähte nach demselben Gesetz; Ausklang `glatt(0,3; 0,8; Fach-Bogen ÷ Breite)`; Lage höchstens 0,5·r landein | `rand.stern` (neu: Knick-Summe des Gedächtnis-Terms auf einem Ring 0,25·r um jede Scholle) Median 41,5 → **20,6 km**, stärkster Ring 5,6 → 4,8 km; im Fenster ist der Stern fort | geheilt im Bild, die Zahl halbiert; schwache Rest-Keile der Naht-Fenster (Azimut-Fenster glatt 0,6…1·halb) stehen |
| F4 Würmer und Ring der Gedächtnis-Kämme | bestätigt: fester Kamm 300 km landein, jedes Fach erhalten | `randForm(plan)`: Lage 150–600 km (drei Harmonische im Azimut, glatt längs des Streichens) + 0,6 km je Ma Alter; Erhalt je Fach glatt(0,1; 0,3) einer Ziehung mal 0,75…1 (etwa ein Fünftel abgetragen) | erde-08 Scholle 9: stärkster Ring im Zwischenstand mit fachweiser Lage 17,9 km (V-Strahlen) → 4,7 km | geheilt für das Gedächtnis |
| F4 Rahmen 03 · 0 · x≈300–390 | NICHT das Gedächtnis: am Rahmen `orogen` 2,3–6,7 km, `gedaechtnis` ≤ 0,35 km, `orogenAktiv` 1 — die lebende Kollisions-Schablone folgt der fremden Krusten-Kante im festen Abstand (`raender`, `wa·5,0·s·gauss(xa − 110, 200)`) | — | Bild unverändert | offen (`bild.kranz`, derselbe Täter wie der Gebirgs-Kranz um den Nord-Kontinent von erde-09) |
| F9 totes Gebirge über dem lebenden | bestätigt | über F1/F4 (Erhalt, Breiten-Deckel) | `rand.ueber` t = 0: Gedächtnis 8,1 → **3,8 %** (Orogen 10,4 → 10,9 %); +50 Ma: 5,9 → **2,8 %** (Orogen 10,7 → 11,1 %) | geheilt |
| F2 Perlenschnur | bestätigt: 24 Kegel je Kette im festen 3,5-Ma-Takt, gleiche Stärke | `kettenBauen`: Ausbruch 0…3 Ma nach dem Takt (die Stütze fährt ab da), Stärke 0,35…1,25, jeder achte fällt aus (kein Kegel, kein Vulkan), Breite 0,7…1,25; Einblenden liest die Zeit seit dem Ausbruch, Ausblenden die seit dem Takt — stetig in t | Fenster erde-gegner2b-04 (40° N, 58° W, 4 000 km): ungleiche Abstände, Größen, Lücken; die Spur bleibt gerade (EIN Pol je Abschnitt) | geheilt (Takt, Gleichmaß), ohne Zahl-Linse |
| F5 Meereis-Kante als Breitenkreis | bestätigt | `planetKlimaR`: Becken-Rand im Abstand des Punkts gesucht (400 km + Abstand, bis 3 000 km), Westwind-Drift 1 500 km seewärts; stehende Wellen (fBm λ 6 000–2 500 km) drehen den Wind, Winter-Advektion −12 K × meridionale Abweichung | `eis.kante` (neu: p05–p95 der Kanten-Breite über 120 Längen) Nord 4,75 → **9,25°**, Süd 6,25 → **9,25°**; `klima.eis` 9,4 → 8,8 % | geheilt |
| F5 Wüsten-Kante | bestätigt | die Gürtel lesen die Breite verschoben um dasselbe Wellen-Feld (±~3°) | Bild: die Niederschlags-Bänder über dem Meer bleiben fast zonal | teilweise, ohne Zahl |
| F6 Wind-Strahlen | bestätigt (Neigung atan 0,3) | Richtung je Punkt gedreht (typisch ±20°, Spitze ±50°); EIN Großkreis je Punkt bleibt | Bild erde-09: keine Keile aus einem Punkt, im Süd-Kontinent weiter gerade diagonale Grün-Bänder; `klima.kante.flach` 1,73 → 1,72 % | teilweise; die Stromlinien-Integration ist ungebaut |
| F3 Lineal-Kanten, Kreisbögen im Ozean | aus dem Code gelesen (Kappen-Zuordnung `rho − Winkel`, Verzug ≤ 650 km) | — | `grenze.bogen` 41,3° = 41,3° | offen: die Gestalt der Ozean-Platten ist ungeschnitten |
| F7 Ellipsen-Umriss | — | — | `land.ellipse` 0,827 → 0,837 (GRÜN) | offen an den größten Stücken |
| F8 Graben-Fraß, Doppel-Graben | nicht nachgeprüft | — | — | offen, Ursache unbewiesen |
| F10 Wiederholung (Leopardenfell) | — | — | `land.korcak` 0,30 → 0,31 | offen (`SCHOLLE_DECKEL`) |
| Zahl §1 Herkunft des Bands ≤ 1,03 × | bestätigt | `kostenG3`: Reihenfolge je Durchgang gewechselt (AB, BA), Urteil = Median der 21 Paar-Verhältnisse, Ort 200 statt 40 Orte je Block; das Band bleibt | drei Läufe: Klima ×0,951 · 0,922 · 0,943 (±1,5 %, vorher ±8 %); Ort ×0,913 · 1,005 · 0,886 (±6 %, vorher ±14 %); Punkt ×0,733 · 0,790 · 0,708 | Klima urteilt jetzt über dem Rauschen; Ort streut weiter über 3 % — offen |
| Zahl §2 vier Kipp-Zeilen | an 30 Saaten entschieden | — | `hyps.bimodal` 28/30 GRÜN · `land.fern1000` 8,3 % GRÜN (Kante) · `gebirge.vorn` 75 % ROT (Welle 1 83 %) · `gebirge.vorn.zeit` 84/83 % GRÜN | `gebirge.vorn` offen (Kipp aus G1, vor der Heilung schon 75 %) |
| Zahl §3 erster Punkt ungemessen | bestätigt | `sprungRef` misst auch Scheibe + erster Punkt + 2 048 Punkte | `zeit.sprung.bild` normiert 140 · 145 · 134 ms (≤ 5 000 ms, Preis-Treppe) | gemessen |
| Zeit-Riss 0 → +50 (Blick 6) | von Gegner 2 an frischen Saaten widerlegt | — | `zeit.schritt` 22/30 → 21/30 (ROT beide) | offen als `zeit.schritt` |

### End-Tafel (30 Saaten erde-01…30; Welle 1 = d660f478, vor der Heilung = e33f1413, Welle 2 = c0fdd43b; derselbe Richter des Kopfs)

| Messname | Welle 1 | vor der Heilung | Welle 2 | Band | Urteil Welle 2 |
|---|---|---|---|---|---|
| `hyps.bimodal` | 28/30 | 27/30 | 28/30 | ≥ 27/30 | GRÜN |
| `land.anteil` | 30,8 % | 31,2 % | 29,9 % | 29 ± 4 % | GRÜN |
| `schelf.anteil` | 4,7 % | 3,2 % | 4,3 % | 4–12 % | GRÜN (vorher ROT) |
| `hoch.anteil` | 2,92 % | 4,18 % | 3,33 % | 1–5 % | GRÜN |
| `platten.zahl` | 30/30 | 26/30 | 26/30 (größte 39,4 %) | jede Saat | ROT |
| `gebirge.guertel` lang · Kontinent | 9 · 71 % | 7 · 71 % | 6 · 74 % | ≥ 70 · ≥ 60 % | ROT |
| `gebirge.vorn` | 83 % | 75 % | 75 % | ≥ 80 % | ROT |
| `ozean.alter` | 86,1 Ma | 65,4 Ma | 65,4 Ma | 40–90 | GRÜN |
| `ozean.facette` | 99,33 % | 99,11 % | 99,11 % | ≥ 99,5 % | ROT |
| `kueste.dimension` | 1,167 | 1,162 | 1,171 | 1,15–1,35 | GRÜN |
| `vulkan.zahl` Median (min) | 570,5 (256) | 613,5 (250) | 610,5 (247) | 300–3 000 je Saat | ROT |
| `meer.volumen` | 0,90 % | 1,26 % | 1,29 % | ≤ 1 % | ROT |
| `land.ellipse` | 0,899 | 0,827 | 0,837 | ≤ 0,85 | GRÜN |
| `land.stuecke4` | 23 | 31,5 | 33 | 40–100 | ROT |
| `land.fern1000` | 9,3 % | 9,1 % | 8,3 % | 8–22 % | GRÜN |
| `meer.binnen` | 0,6 % | 1,6 % | 1,5 % | 1,5–6 % | GRÜN (Kante) |
| `kont.naht` · `kont.kueste` | 153,5 · 3,1 % | 41 · 3,9 % | 35,5 · 5,9 % | 0 · ≤ 3 % | ROT |
| `grenze.bogen` | 52,8° | 41,3° | 41,3° | ≥ 70° | ROT |
| `grenze.stufe` konv · div | 98,5 · 42,6 % | 19,2 · 10,4 % | 16,6 · 8,8 % | ≤ 10 · ≤ 5 % | ROT |
| `relief.messer` je Mio | 1 143 | 1 307 | 1 346 | ≤ 200 | ROT |
| `klima.kante.flach` | 3,26 % | 1,73 % | 1,72 % | ≤ 1,0 % | ROT |
| `klima.sprung20` p99 | 199,7 mm | 168,9 mm | 162,4 mm | ≤ 40 mm | ROT |
| `innen.streuung` | 0,337 km | 0,433 km | 0,393 km | 0,40–0,65 | **ROT (Kipp durch die Heilung)** |
| `innen.altguertel` | 1,3 % | 5,9 % | 4,6 % | 5–25 % | **ROT (Kipp durch die Heilung)** |
| `innen.schild` | 0,01 | −0,26 | −0,25 | ≤ −0,5 | ROT |
| `land.median` | 0,624 km | 0,829 km | 0,767 km | 0,2–0,6 | ROT |
| `klima.koeppen` E | 21,8 % | 23,7 % | 22,4 % | 6,4–19,2 % | ROT |
| `klima.wueste` BWh | 12,6 % | 9,1 % | 9,4 % | ≥ 7 % | GRÜN |
| `klima.regenschatten` | 45 % | 37 % | 38 % | ≥ 80 % | ROT |
| `klima.gegenlauf` | 67 % | 66 % | 66 % | ≥ 80 % | ROT |
| `klima.eis` | 8,7 % | 9,4 % | 8,8 % | 3–15 % | GRÜN |
| `zeit.stetig` Sprünge | 106 (BERICHT) | 104 | 105 | 0 | ROT |
| `zeit.schritt` | — | 22/30 | 21/30 | ≥ 27/30 | ROT |
| `zeit.statistik` 0 · −50 · −100 · −200 · +50 | 30·30·28·29·30 (BERICHT) | 27·27·27·28·27 | 28·29·28·27·28 | ≥ 27/30 | GRÜN |
| `zeit.rueckkehr` | gleich | gleich | gleich (cc2f8284) | SHA gleich | GRÜN |
| `superkontinent` | 66 %, 11/30 (BERICHT) | 74 %, 18/30 | 72 %, 17/30 | ≥ 70 % | GRÜN |
| `meer.zeit` | −0,69 (BERICHT) | −0,76 | −0,75 | ≤ −0,6 | GRÜN |
| `gebirge.vorn.zeit` | 86 / 81 % (BERICHT) | 84 / 85 % | 84 / 83 % | ≥ 80 % | GRÜN |
| `ort.anker` | 29/30 (BERICHT) | 28/30 | 29/30 | ≥ 80 % | GRÜN |
| `zeit.reise` hin und zurück | — | 2 759/2 856 | 2 759/2 856 | 100 % | ROT |
| `ort.delta.null` | — | 30/30 | 30/30 | 30/30 | GRÜN |
| `zeit.wechsel` (neu) | — | 11, max 641 m | **0** | 0 | GRÜN |
| `ort.memo` (neu) | — | verschieden | **gleich** | gleich | GRÜN |
| `rand.stern` (neu) | — | 41,5 km | 20,6 km | INFO | — |
| `rand.ueber` +50 Gedächtnis · Orogen | — | 5,9 · 10,7 % | 2,8 · 11,1 % | INFO | — |
| `eis.kante` Nord · Süd | — | 4,75 · 6,25° | 9,25 · 9,25° | INFO | — |
| `bytes.*` | — | — | absenz 0 · Prozesse · jitless · Reihenfolge · Biom · version GRÜN; `bytes.streifen` 174 ms | ≤ 150 ms | ROT an der Zeit |
| Selbsttest | — | 40/40 | 42/42 (neu: Fächer-Stern, Breitenkreis-Eis) | alle | GRÜN |

Welle 1 liest `bau3` und `gegner2` nicht (Jahr R5 und `_intern.terme` fehlen in d660f478): die bau3-Werte der Welle 1 stehen aus BERICHT.md
(„Nach dem Angriff“), sonst „—“.

### Kosten

| Maß | Wert | Band | Urteil |
|---|---|---|---|
| `kosten.punkt.g0` gegen d660f478 (drei Läufe) | ×0,733 · ×0,790 · ×0,708 | ≤ 1,03 × | GRÜN |
| `kosten.klima.g0` | ×0,951 · ×0,922 · ×0,943 | ≤ 1,03 × | GRÜN |
| `ort.kosten.g0` | ×0,913 · ×1,005 · ×0,886 | ≤ 1,03 × | GRÜN, Streuung ±6 % |
| `zeit.sprung.ref` normiert (REF0 104,6 ms) | 121 · 122 · 119 ms | ≤ 250 ms | GRÜN |
| `zeit.sprung.bild` (Scheibe + erster Punkt + 2 048) | 140 · 145 · 134 ms | ≤ 5 000 ms | GRÜN |
| bau3 `zeit.sprung` kalt bestes · warm | 162 ms · 5,48 ms | ≤ 120 · ≤ 5 | ROT (unter Last: Referenzfahrt 167–304 ms gegen REF0 104,6) |
| bau3 `ort.kosten` · Anker kalt | 1,541 ms · 16,6 ms | ≤ 1 · ≤ 10 | ROT (unter Last) |
| Karte 256 px ABAB gegen e33f1413 | relief 264 → 307 ms (×1,16) · biom 974 → 1 056 ms (×1,08) | — | der Preis von Gedächtnis-Form, Kegel-Breite und Wellen-Feld |

### Bilder (`artifacts/profiband/auge/planet-kern/`)

`kontaktbogen-2.png` (erde-09, dieselbe Ordnung wie `kontaktbogen.png`) · `welle2/heilung/vergleich-welle1-welle2-erde-09-relief.png` und
`-biom.png` (oben bau4, unten Welle 2, 1 600 px) · `welle2/heilung/karten/` · Roh-Ausgaben `welle2/heilung/{welle1,vorher,welle2}/richter-*.txt`,
`welle2/heilung/welle2/kosten-g3-lauf{1,2,3}.txt`, `bytes.txt`, `selbsttest.txt`.

Mein Blick auf das Vergleichs-Bild gegen die sechs Punkte des Koordinators: (1) statt der Ellipsen-Flecken steht ein großer zusammengesetzter
Kontinent mit Golfen, Halbinseln, Schelfmeeren und Stücken jeder Größe; (2) das Innere bleibt flach — die alten Gürtel stehen als Stücke am
Rand, nicht im Kern; (3) die Keile aus einem Punkt sind fort, das Nordeis wellt sich, im Süd-Kontinent laufen noch gerade diagonale
Grün-Bänder; (4) die Messerkante ist fort, aber um den Nord-Kontinent läuft ein Gebirgs-Kranz dicht an der Küste (lebende Schablone,
F4-Rahmen); (5) die Ozean-Grenzen sind seltener Kreisbögen, dafür gerade Polygon-Stücke; (6) der Zeit-Bogen im Kontaktbogen hängt zusammen.

**Die Karte liest als Planet bis auf** den Gebirgs-Kranz der lebenden Kollisions-Schablone um ganze Kontinente, das flache Innere ohne alte
Gebirge, die geraden Feuchte-Bänder längs des Winds und die polygonalen Ozean-Platten.

### Ehrlich offen (mit Messnamen)

- `innen.altguertel` 5,9 → 4,6 %, `innen.streuung` 0,433 → 0,393 km: Kipp GRÜN → ROT durch den Breiten-Deckel; das Innere braucht ein eigenes
  Gesetz alter Gürtel (Anlagerung, Nähte), nicht die Strahlen des Rands.
- `bild.kranz` (F4-Rahmen, Gebirgs-Kranz): die Kollisions-Schablone liegt im festen Abstand zur fremden Krusten-Kante.
- F3 (`grenze.bogen` 41,3°), F7, F8, F10 ungeschnitten; F6 und die Wüsten-Kante nur teilweise.
- `ort.kosten.g0` streut ±6 % um das Band 1,03; `bytes.streifen` 174 ms > 150 ms.
- `gebirge.vorn` 75 %, `platten.zahl` 26/30, `meer.volumen` 1,29 %: Kipps aus G1–G3 gegen Welle 1, ungeschnitten.
- Konsum im Spiel 0 % (`ort.leser`).
