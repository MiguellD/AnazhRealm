# 01 Der Leib des Menschen in allen Stufen

Batterie 01 (F1 mensch-und-bau), gelesen am Code von main ec281422 (origin/main steht inzwischen auf 7f778d44, z427 karte-stamm,
die Mensch-Dateien hat sie nicht angefasst, nur am Log gesehen), Zweig w28-leib-nah ace30e73, Bilder vom 13.11.

## Was der Spieler sieht
- `scratchpad/genom-spiel/gruppe.png` (Dorf der Ankunft, Mittag, 1080p): der Nächste (rot, ~5 m) hat einen Oberkörper wie
  eine Kugel, die Schultern stehen als Wülste ab; die Frau links (sand) hat den Stoff an Achsel und Seite zerfetzt. Die Leute am
  Stand (~12–15 m, Satz der Menge) lesen in dieser Größe glatt und ohne Riss, Gesichter sieht man dort nicht.
- `scratchpad/genom-spiel/eng-rot.png`: zwei Bewohner von hinten. Rot und Weiß sind Ballons mit Lappen an Ärmel und Seite, die
  Haut darunter ist ganz. Beide tragen dieselbe Haarkappe und fast dasselbe Gesicht: sie lesen als Geschwister.
- `scratchpad/genom-spiel/frontal.png`: der Sandfarbene auf ~3 m. Kugel-Schultern, ein Lappen hängt an der rechten Hüfte,
  die Arme stehen steif ab. Das Skelett aus dem Genom (Beine, Schulter) sehe ich an keinem Leib.
- `koord-hebel/probe-post/w28-leib-nah/7-paar-nah-heute-kandidat.jpg`: rechts (Kandidat) kein Riss, kein Ballon, Saum als
  Linie, Hals frei; die Schulter-Kappe trägt aber weiter Masse.
- `…/8-paar-10m-heute-kandidat.jpg` (Satz der Menge, 10 m, Tele): ein Kopf ohne Gesicht, kein Hals, Fäuste als Stummel, in
  beiden Hälften des Paars. Das liegt am Satz, nicht am Kleid.
- `…/13-grobstufe-poncho-hemd.jpg`: die Grobstufe (L1) hat Augen, Mund, Haar und Finger, in der Nähe kaum schlechter als L0.
- `…/10-poncho-vorn-hinten.jpg` rechts: ein Gehender des Satzes auf ~12 m steht sichtbar über dem Weg. Er schwebt.

## Was die Quelle sagt
Vier Stufen gibt es, gewählt von drei verschiedenen Gesetzen:
| Stufe | Zeile | Wer sie wählt | Wann der Spieler sie sieht |
|---|---|---|---|
| L0 40k Dr., 8 Draws | koerper-core.js:48 | stamm/siedlung-bewohner.js:1492 `nahM` 8 m (+1), :1504 `nahLeiber` 4 (:3482–3484) | die 4 Bedeutendsten innerhalb 8 m |
| L1 14k Dr., 6 Draws | koerper-core.js:49 `ab: 40` | stamm/koerper-leib.js:406 `_gelenkStufe`, gerufen an siedlung-bewohner.js:1550 | **nie**: die Nah-Wahl endet bei 9 m, L1 beginnt bei 40 m × Größe |
| Satz L2 1 700 Dr., 1 Draw | koerper-core.js:55 | siedlung-bewohner.js:1197–1206 (jeder im Kreis ohne `nah`) | 5. und weitere im 8-m-Kreis, alle von 8 m bis zur Feld-Grenze |
| Feld (Kapseln) | koerper-core.js:68 `fernform` | stamm/vegetation-streu.js:1870–1881, `LOD_SCHIRM.leib` :2884 (64 px) | ab 19,8 m bei 1080 Zeilen (f = 703,8 px, FOV 75° koerper-fahrt.js:3146) |
| Wurf L3 360 Dr. | koerper-core.js:60 | siedlung-bewohner.js:894–899 (`castShadow` aus, der Satz wirft) | Schatten jedes Bewohners im Kreis |

- **Gebaut und nie gezeigt:** jede Gestalt bestellt L0 und L1 (siedlung-bewohner.js:271, :802–806), ~2,45 MB Geometrie je
  Gestalt für beide Stufen (:3433), 8 Gestalten je Siedlung (:3474). L1 liegt an jedem Bewohner (`gl.fern`) und wechselt nie
  ins Bild. Auch der Befund `bericht/1113-leib-nah-befund.md` Z.30 und Kurs-E Z.35 sagen das.
- **Der Satz an der Grenze:** an der 8-m-Grenze ist ein Leib 1,8 × 703,8 / 8 ≈ 158 px hoch. Der Satz trägt also Leiber von
  158 bis 64 px, und auf 3–5 m (250–420 px) jeden fünften und weiteren (Befund Z.28–29).
- **Das Kleid in L0/L1:** `koerper-core.js:254` `dicke: top === "poncho" ? 0 : 0.032`. Der Poncho geht nicht durch
  `__stoffAusHaut` (foundry-core.js:9319–9336), sondern durch `backeHuelle` (foundry-core.js:9181, Aufruf :9355, Abstand 0,12 E):
  eine Voxel-Hülle über den Teil-Kugeln, die das Relief nicht erreicht (:9470–9480). Die Tracht der Ankunft ist `antike`
  (fachwerk-core.js:3287: poncho, shorts, ohne Schuh). Das passt zu Rot, Weiß, Sand, Burgund und barfuß im Bild.
- **Der Bau aus dem Genom:** `BAU_GESETZ` (koerper-core.js:1457–1466) gibt Bein 2,6 % H je σ, Arm 2,7 %, Schulter 4,8 % am
  Gelenk und Hals 0,5 %. Über 200 Bewohner streut das Hüft-Gelenk mit VK 0,86 → 2,41 % (Commit 45805bda). Das ist die Streuung
  einer echten Bevölkerung, ±2,2 cm Hüfte je σ. Unter einem 3,5-cm-Ballon und auf einem Kopf derselben Gestalt sieht das Auge das
  nicht. Wer den Bau liest: L0 und L1 an den Knochen (siedlung-bewohner.js:877–878, dieselben Knochen für beide Stufen,
  koerper-leib.js:404), der Satz als Punkt im Leib-Raum (koerper-core.js:1543–1547). Das Feld liest nur die Lagen des
  Erstgeborenen jeder Gestalt (siedlung-bewohner.js:1122, :1137).
- **Kosten heute** (GTX 1050, Dorf, werkbank `lauf 15`, erwachen/gtx1050-2026-11-13.md Z.17–18): Frame p50 16,69 ms,
  GPU p50 1,08 ms, Befehle im Mittel 95 (p95 104), im Mittel 492 889 Dreiecke. Davon tragen die 4 L0 bis zu 160k Dreiecke und
  32 Draws.

## Die EINE begrenzende Entscheidung
Welche Stufe ein Bewohner zeigt, entscheidet der SCHIRM, nicht Meter und Kopfzahl. Die Grobstufe L1, die jeder Bewohner schon
trägt (mit Gesicht, Haar und Fingern), wird die Stufe zwischen dem nahen Leib und dem Satz. `nahM` 8 und die 40-m-Grenze für
Bewohner fallen. Der Haushalt der lebenden Leiber bleibt der Dreiecks-Haushalt von heute.

## Der Schnitt
**Stufen (die Klasse ganz):** Der Kreis der Nah-Wahl reicht bis zur Feld-Grenze (`_feldGrenzen(true).ein`, 19,8 m bei 1080 p)
statt bis `nahM`. Die Bedeutung (Größe am Schirm × Gang, vegetation-streu.js:1902) ordnet ihn. Rang 1–2 zeigen L0, Rang 3–7 L1
(`_gelenkStufe(g, Infinity)`, Rang 1–2 `_gelenkStufe(g, 0)`), alle übrigen bleiben im Satz.
- Dreiecke: 2 × 40k + 5 × 14k = 150k ≤ 160k heute.
- Draws: 16 + 30 = 46, also +14 gegen heute.
- CPU: +3 lebende Leiber (Gang, Atem, Matrix).

Der Gang darf an L1 nicht ruhen. Heute animiert nur, wer `!_gelenkStufe(...)` ist (siedlung-bewohner.js:1550). Die Pose läuft
künftig für jeden der Nah-Wahl, und `haltungFest` (:862) verhindert schon `_gelenkRuhe` (koerper-leib.js:427). Das Kleid in allen
Stufen trägt w28-leib-nah (siehe unten); dieser Schnitt baut darauf.

**Leser-Liste (vor dem Schnitt):**
1. stamm/siedlung-bewohner.js:1492: `rN` aus `nahM`/`nahHystM`, der Kreis.
2. siedlung-bewohner.js:1503–1504: Sortierung und Deckel `nahLeiber`.
3. siedlung-bewohner.js:1514–1531: `istNah`, `leibBauArme` (ein Leib je Takt), `g.visible`.
4. siedlung-bewohner.js:1550–1569: Stufen-Schalter und Animations-Tor.
5. siedlung-bewohner.js:1578: `innen` (Ruhe-Radius) aus `nahM`.
6. siedlung-bewohner.js:1202: Platz im Satz (−1 für nah).
7. siedlung-bewohner.js:3442–3484: Doku und `BEWOHNER`.
8. stamm/koerper-leib.js:406–430: `_gelenkStufe` (Zahl = erzwungener Abstand²).
9. koerper-core.js:49: `ab: 40`. Bleibt für Spieler, Peer und Fahrer (siedlung-verkehr.js:803, netz-p2p.js:2380).
10. scripts/diag-mensch-anatomie.cjs:298, :320: Pixel an der Grenze der Nah-Wahl aus `BEWOHNER.nahM`, das Urteil `menge.gleich`.
11. scripts/lib/kreatur-proben.cjs:2469, :2644, :2979: `nahR`, `pxM` und `nahLeiber` der Probe bewohner.
12. Das Tuch: `TUCH_GESETZ.leiber` 2 bis 14 m (Befund Z.32). Die Stelle habe ich nicht gelesen.

**Kosten-Zeile:** GTX 1050, Dorf, `lauf 15`, heute ↔ Kandidat: Frame p50 16,69 ms, GPU p50 1,08 ms, Befehle 95/104,
Dreiecke 492 889. Die Dreiecke fallen oder bleiben, Befehle +14, GPU hat Luft. Abgabe nur, wenn der CPU-Takt p95 am Dorf
Third nicht über heute liegt. Reißt er, fällt die Zahl der L1-Plätze, nie der Grund „Schirm statt Meter". Kosten hängen am
Schirm: höchstens 7 Leiber, gleich wie groß das Dorf ist.

**Kriterien der Meisterkarte (stand.json):**
- mensch.K4: 2 Punkte. #1 Gesicht auf 6,11 m, radeon gehalten an a41ce72d, gtx ungemessen. #2 headless 50 Bewohner,
  132 200 Dreiecke. Die Station muss L0 an Rang 1 halten.
- mensch.K1: 1 Punkt. #2 ohne Werkzeug; weg.json:421 nennt „die Stufe 1 steht als Station M40".
- lod.K1 (Klasse der Tafel). Das Soll je Kriterium habe ich nicht gelesen. Kein Soll und keine Schwelle wird bewegt.

**Bildpaar:** Dorf, Mittag, die Kamera von `gruppe.png` (Pose in `frontal.abnahme.json`: −702,73 39,32 −882,1), dazu eine
Kamera auf 10–15 m in die Menge am Stand. Heute ↔ Kandidat.

## Was schon liegt
- `w28-leib-nah` **ace30e73** (GTX 1050; main ec281422 eingemischt). Der Poncho wird Stoff aus der Haut mit Weite, Saum und
  Bund werden Linien, „nah, grob und im Satz". 6 Dateien, +389/−191. Kosten ±0 (Frame 16,69 ↔ 16,68 ms). Tore vor dem Merge
  GRÜN. Am Merge-Kopf ist die Tor-Liste nicht gelesen, ein Abgabe-Kopf fehlt (erwachen Z.20–30). Das ist der Schnitt für das
  Bild am Dorf auf 3–5 m und muss vor diesem Blatt landen.
- „Teil B" (die grobe Stufe zwischen feinem Leib und Satz, Nah-Wahl nach Schirm) steht beim GTX-Arbeiter als offen
  (erwachen Z.46). Dafür liegt kein Zweig und kein Commit.
- `w28-leib-genom` ist gelandet (z426, 45805bda). Der Bau fließt in L0, L1 und den Satz. Sichtbar wird er erst, wenn das Kleid
  die Gestalt trägt.

## Ehrlich offen
- **Nicht gemessen:** der CPU-Preis eines lebenden Leibs (Gang + `_animateHuman` + `_leibMatrix`). Ohne diese Zahl ist die
  Platz-Zahl 7 eine Rechnung über den Dreiecks-Haushalt, keine Messung.
- **Schweben:** der Gehende des Satzes über dem Weg (Bild 10). Die Wurzel der Stehenden liegt einheitlich 46–52 cm über dem
  Boden (erwachen Z.41–43); für den Schritt gibt es keine Zahl. Verdacht an siedlung-bewohner.js:1158–1167 (Sohle des Satzes
  `FOOT_OFFSET × (raumSkala − scale)` gegen `_ofenSohleY` der Vorlage, :1009), nicht bewiesen.
- **Geschwister-Gesicht:** gleiche Haarkappe und gleiches Gesicht an zwei Bewohnern (eng-rot.png). Gestalt-Wahl
  siedlung-bewohner.js:331–353, 8 Gestalten. Die Hautpalette der Antike habe ich nicht gelesen.
- Den Satz ohne Gesicht und mit Stummel-Händen (Bild 8) behebt dieser Schnitt nicht. Er nimmt dem Satz nur die Leiber über
  ~158 px, wo es auffällt.
- Den Code des Tuchs, `_bedeutung` und `__mengenLeib` (foundry-core.js:7031) habe ich nicht ganz gelesen.
- `kreatur-proben.cjs` und `diag-mensch-anatomie.cjs` lesen `nahM` als Grenze. Sie müssen mit dem Schnitt die neue Grenze lesen,
  sonst urteilen sie über eine Grenze, die es nicht mehr gibt.

## Rang
- Wirkung im Bild **3**: jeder der 7 Größten am Schirm bis 20 m hat ein Gesicht und Finger. Der größte Bruch heute (der
  Ballon) gehört aber w28-leib-nah (Wirkung 5, liegt).
- Aufwand **S**: ein Takt-Block und eine Zeile `BEWOHNER`, dazu zwei Linsen, die die neue Grenze lesen.
- Risiko: die Station mensch.K4#1 und der CPU-Takt p95 an Genesis Third, der laut Pflicht E schon reißt. Jeder zusätzliche
  lebende Leib zahlt dort.
