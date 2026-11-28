# Stand-Blatt bau-funktion — Sprosse `karte2.mensch.bau.bedarf#1` (ZWISCHENSTAND)

## Täter-Zahl (27.11., am main eef726c7, headless an `buildInstance` L0)

- Je Rolle aus vier Dorf-Plänen (`exportSettlement`) das Haus mit seinem Vektor gegen denselben Vektor mit `rolle: 'wohnhaus'`:
  **0 von 15 Rollen** ändern das Haus-Mesh (sha1 der Lagen byte-gleich) — die Rolle zeichnet am Körper nichts; die Gestalt folgt nur
  den Maßen, die `bauProgramm` (`fachwerk-core.js:2973`) aus dem Raumprogramm rechnet (W, D, Geschosse, Grundriss).
- Das Raumprogramm kennt den Bedarf (`BAU_NUTZUNG`, `fachwerk-core.js:2860–2890`: schmiede `esse_werkraum` + `beschlagstand` an der
  Straße, gasthaus `gaststube` an der Straße, zunfthaus `trinkstube` im OG zur Straße, patrizierhaus `sala` + `kontor` zur Straße,
  rathaus `halle` + `uhrturm`, kirche `chor`, scheune `tenne`, werkstatt `werkraum` zur Straße) — kein Leser im Haus-Bau `HAUS`.
- Die Rolle zeichnet heute nur in der Parzelle (`hofFuer`, `fachwerk-core.js:4555` drei Kisten · `:4559` ein Trog), die kein Leser
  der Welt baut.

## Vorher (Sonde: je Rolle ein Haus des Plans, voller Vektor samt Rolle, Bühne der Welt, Mittag, vorn-schräg 30°)

![vorher](bau-funktion/vorher.jpg)

Gasthaus · Patrizierhaus · Werkstatt · Wohnhaus · Schmiede: dasselbe braune Blockhaus.

## Nachher (dieselbe Sonde, dieselbe Pose; der Kern `BEDARF_GESTALT` zeichnet aus `BAU_NUTZUNG.raeume` die Front)

![nachher](bau-funktion/nachher.jpg)

Aus 12–36 m (Augenhöhe 2,2 m, das Maß des Auftrags „aus 20–30 m“):

![nachher 25 m](bau-funktion/nachher-25m.jpg)

Je Rolle das EINE Merkmal (der Raum des Programms → die Gestalt):

| Rolle | Raum | das Merkmal | Maß |
|---|---|---|---|
| Schmiede | `beschlagstand` + `esse_werkraum` | offener Beschlagstand unter dem Pultdach mit glühender Esse, Stein-Schlot am Giebel | Vordach 2,5 m tief, Esse 2,1 × 0,75 × ≤ 1,75 m, Schlot 1,2 × 1,0 m, 1,0 m über First |
| Kirche | `schiff` + `chor` | eingezogener Chor (ein Körper des Baus, auch fern) mit Kreuz, Hallenfenster, das Schiff EIN Raum ohne Treppe | Chor 0,62 der Tiefe, Kreuz 1,8 × 0,9 m |
| Patrizierhaus | `kontor` + `sala` | Steinbau (Putz) mit Erker über der Tür | Erker 2,4 × 0,9 m |
| Rathaus | `uhrturm` | die Uhr am Turm | Zifferblatt 1,2–1,7 m |
| Scheune | `tenne` | das Tenntor, dahinter EIN Raum ohne Herd | 3,2–4,8 × 3,4–4,4 m |
| Werkstatt | `werkraum` | gerahmtes Tor, Klappläden (Ladenbrett + Klappe) an jedem Erdgeschoss-Fenster der Straße | Tor 2,2 × 2,3 m, Brett 0,6 m, Klappe 0,7 m / 20° |
| Zunfthaus | `trinkstube` | hohes Saal-Geschoss mit hohen Fenstern | Saal 4,0 m, Fenster 1,9–2,4 m |
| Gasthaus | `gaststube` | Ausleger mit Schild, Tische und Bänke vor der Tür, das Licht der Gaststube | Ausleger 0,97 m, Schild 0,9 × 0,7 m |
| Wohnhaus | `wohnen` | ohne Zeichen (byte-gleich mit seinem Zwilling) | — |

Ehrlich schwach im eigenen Auge: Gasthaus und Werkstatt (Schild und Klappläden < 1 m, aus 25 m wenige Pixel); das Urteil fällt der
Blind-Prüfer (`karte2.mensch.bau.bedarf#1`, Station nicht gefahren: GPU).

Linse: `gate:settlement` Teil B (B1 8 von 8 Rollen bauen nah und fern ein anderes Haus als ihr Wohnhaus-Zwilling, B2 das Wohnhaus
byte-gleich mit demselben Vektor ohne Rolle, dem Bau, den cv:6 einfriert; Selbsttest „die Rolle zeichnet die Gestalt nicht“ → ROT in
B1, „jede Rolle zeichnet die Gaststube“ → ROT in B1, „das Wohnhaus zeichnet die Gaststube“ → ROT in B2).

Die Anbauten tragen die Masse (`masse`, der Mass-Bau des Dorf-Layouts): die Lose rücken für echte Körper, die Goldens
`siedlung.json` / `siedlung-lose.json` sind neu gemintet (Vertrags-Akt). Der Snap-Selbsttest des Würfels beißt an der Stadt 7/30
nicht mehr; Fixture dazu das Dorf 35/24 (Gesetz 0, Snap 1: Los 5 kaufhaus −5 cm → 894045 1,13 m; Suche 1..40 × nH 24).

## Tris / Draws je Haus (L0 · L1 · L2, vorher → nachher; die neun Häuser der Sonde aus den Dorf-Plänen)

| Rolle | L0 | L1 | L2 |
|---|---|---|---|
| Gasthaus | 118 878/17 → 120 330/18 | 39 322/12 → 41 142/12 | 4 618/7 → 4 988/7 |
| Kirche | 100 412/18 → 87 088/18 | 18 652/10 → 12 412/10 | 1 668/6 → 1 170/6 |
| Patrizierhaus | 118 866/17 → 106 890/17 | 30 510/11 → 20 778/9 | 6 076/7 → 1 792/7 |
| Rathaus | 57 096/16 → 57 384/16 | 23 976/8 → 24 264/8 | 3 604/4 → 3 844/5 |
| Scheune | 26 308/16 → 28 708/15 | 5 104/11 → 4 864/11 | 572/7 → 610/7 |
| Schmiede | 60 004/18 → 60 160/18 | 9 808/12 → 9 964/12 | 1 046/7 → 1 178/7 |
| Werkstatt | 110 936/19 → 111 008/19 | 28 008/12 → 30 076/12 | 3 410/7 → 3 824/7 |
| Wohnhaus | 128 024/18 → 128 024/18 | 32 484/12 → 32 484/12 | 3 516/7 → 3 516/7 (byte-gleich) |
| Zunfthaus | 110 852/18 → 111 260/18 | 22 988/10 → 22 988/10 | 2 850/7 → 2 838/7 |

## C-K5 (27.11.): die Ort-Wahl länger als der Deckel des Stillstands

- Befund: kein Hänger. Die Ort-Wahl im Faden an der Zelle −6,−6 (Saat 1862753406, nH 13, neben der Stadt: 145 Kandidaten, 71 im
  stehenden Bau) rechnete 17,9–20,9 s. Der Deckel der Linse (`welt-boot.cjs` `deckel`, 3 600 Takte unveränderte Welt) fiel vorher.
  main bed6256c hält die Marge knapp (4 von 5 Läufen grün), mein Diff (Anbauten als Masse: mehr Kandidaten fallen erst im Bau) kippte sie.
- Schnitt an der Wurzel (`voxel-worker.js` `ortWahl`): das Wasser am Punkt ist eine Funktion des Gesetzes (`ortNass`). Je Kandidat
  fragen `ortImWasser`, der Boden vor dem Bau (`hochAm` → `ortPlan` nurBoden) und der Plan dieselben Punkte. Das Gedächtnis `nass`
  (je Kandidat geleert) trägt die Wiederholung, exakt. Gemessen an −6,−6: **230 586 → 119 951 Urteile, die Wahl 20,9 → 13,5 s**, C-K5 ✅.
- Linse: `gate:settlement` C-K5 „DAS WASSER EINMAL JE PUNKT“. Jede Wahl im Faden nennt `wasser {fragen, urteile}`, Urteile < Fragen.
  Am main ROT (das Feld fehlt). Selbsttest: „jede Frage ein Urteil“ und „eine Wahl ohne Zahl“ → ROT.
- Ein Versuch am Kern (`erdbauY` auf feinem Raster) war bit-gleich, aber am echten Erdbau langsamer. Er ist zurückgenommen.

## W10 (27.11.): das Tor öffnet EINEN Raum

- `gate:haus-welt` W10 Spielgang ROT durch meinen Diff (main bed6256c in der CI grün): drei Scheunen des Drehbuch-Dorfs
  (italienisch@141°, italienisch@−39°, provenzalisch@−39°), `tür 2,02 m neben`. Sonde: die Flurwand bei ±fw (x 1,0–1,12) stand
  0,1 m hinter dem 3,2-m-Tenntor, der Gang an der Zarge (x 1,26) prallte. Dahinter stand der Herd (1,05 × 1,0 × 1,5 m) im Weg.
- Schnitt im Gesetz: `TENNE` (BEDARF_GESTALT.tor) — das Erdgeschoss mit Tor ist EIN Raum, ohne Kammer und ohne Flurwand
  (`rooms`, `innenwaende`); die Tenne trägt `ohneFeuer` (Feuerordnungen: kein Herd in der Scheune), `herd`/`herdKaesten` lesen es.
  Headless an 5 Kulturen × 5 Saaten: im Gang nur die Zarge, die der Gang streift (wie am Wohnhaus). Nur Scheune und Werkstatt
  ändern sich, sieben Rollen byte-gleich.

## B3 (27.11.): die Halle erschließt keinen Dachraum

- `gate:studio-begehen` B3 Steigen ROT durch meinen Diff: 22 von 23 Treppen (OG→OG 12/13). Sonde: `#0 635014 provenzalisch/kirche`,
  ein Lauf 26 × 0,188 m = 4,9 m frei durch das Schiff zum Estrich, der Körper fiel (steig −2,06 m).
- Schnitt an der EINEN Aussage „nutzbarer Dachraum“ `hasAttic` (Gaube, Treppen-Spur, Loch und `dachRaum` lesen sie): über der Halle
  (BEDARF_GESTALT.halle) liegt kein erschlossener Dachraum — kein Lauf, kein Loch, keine Gaube (Dachstuhl der Kirche: erschlossen über
  Turm oder Mauertreppe, nie aus dem Schiff). Die Zeile `dachRaum`, die der Selbsttest „dachlos“ mutiert, bleibt byte-gleich. Nur die
  Kirche ändert sich (L0 89 620 → 87 088).

## Geerbt (nicht geheilt)

- `gate:pruefbuehne-licht` S0 Himmel (Dämmerung, Umgebung 1,16e-7 gegen Himmel 1,07e-7) und S0 BILD Nacht: geerbt, mein Diff berührt
  das Licht nicht.
- `zug.sh probe-tag`: nicht im Baum (artifacts/profiband/werkzeug, 404 an main und koordination). Von Hand nach `spec/ci/ci-zeiten.json`:
  pruefbuehne-licht 43 s · weltbild-frost:echt 135 s · studio-begehen 185 s, jedes ≤ 480 s.
- `gate:weltbild-frost:echt` lokal ohne Urteil (Station nicht gefahren: GPU): swiftshader unter xvfb auf 4 Kernen baut je Programm
  4–7 min (Stall-Akte: 41 Pipelines, nach 1 800 s `URTEIL AWAIT` an `createRenderPipelineAsync #41`, der Haupt-Thread lebt). Das Urteil
  fällt die GPU-Probe des Kopfs: **88bc3c51 auf omen-gtx1060 GRÜN in 1 353 s** — pruefbuehne-licht 58 s · weltbild-frost:echt 167 s ·
  studio-begehen 263 s · bild:dorf@0.5 94 s · webgl-probe 54 s (Akte 88bc3c51 im Zweig `probe-post`).
- `gate:settlement` C-K5b „NACH DEM ZUG STEHT DIE WELT“: in EINEM von vier Läufen ROT (nachZug 2 — dieselben 6 Exporte wie grün,
  2 davon nach dem Ruhe-Fenster 20 × 20 ms der Linse); allein wiederholt und am Merge-Kopf mit main b3740dd5 GRÜN (nachZug 0).

## Am Merge-Kopf (main b3740dd5)

format:check · lint · check:statik (voll, 637 s) · gate:fachwerk-contract · gate:asset-contract · gate:welt-boot · gate:settlement
GRÜN; davor am Kopf mit dem Schnitt der Halle: gate:studio-begehen · gate:haus-fern · gate:haus-welt · gate:nervensystem-fachwerk GRÜN.

## Post 22:38 (Koordinator) — Antwort

- **Station bedarf#1:** braucht KEINE Änderung der Station. Die Rolle zeichnet im Kern (`HAUS` liest `BEDARF_GESTALT` über die
  bestehende Naht P.rolle → slot.ov → buildInstance); jedes Dorf-Haus am Kopf trägt sie, die Station legt nur die Bilder, der Prüfer
  (der Prüfer im Zweig `punkte-maschine`, Art klasse, 9 Optionen) liest sie unverändert.
- **Die unterste rote Sprosse von mensch.bau ohne Blindurteil:** `karte2.mensch.bau.bauen#1` · 1 Spieler-Haus aus der Werkstatt ·
  gleiche Tiefe wie im Labor · Richter: Bildpaar Labor ↔ Welt gleiche Kamera: kein Unterschied. (bedarf#1, huelle#1 und innen#3
  tragen den R11-Prüfer, die Richter-Tafel im Zweig `punkte-maschine`.)
  - **Täter-Zahl:** 98,0 % Differenz gegen Soll ≤ 2,1 % (Richter-Akte bauen.1 am Kopf 31ea3847 im Zweig `punkte-maschine`, GTX 1060, 21.11.,
    am Kopf 31ea3847 vom 20.11.; ebenso f68dbf09 am 19.11.: 98,0 %). Die Silhouetten decken sich zu 99,4 %, der Rest ist Luma
    (`cloud-post/haus-gestalt.md` OFFEN K4).
  - **Die Zahl ist älter als der Schnitt:** `fachwerk-buehne` (483b3c2e, 24.11.) zeichnet das Labor seither auf der EINEN Bühne der
    Welt (`AnazhHuelle.studio` → `buehne`, ihr Licht an ihrer Uhr, das Werk aus dem Ofen der Welt). Seitdem lief die Station nicht. Vor
    jedem Bau misst sie die Station an diesem Kopf (lokal swiftshader: je Programm 4–7 min, kein Urteil). Die Bahn `haus-gestalt` trug
    dieselbe Sprosse (Vorprüfung 5e497a9f); ich baue sie erst auf die Zahl des Kopfs hin.

## Post 23:45 (alle) — Kopf 1 abgebrochen, Konflikt mit sprache

- merge-tree 88bc3c51 gegen die Köpfe des Zugs: `w28-frist-puls-1` fe05c3bb · `w28-kunst-am-leib-4` 027e5d44 · `w28-wurf-mit-luft-3`
  68b58086 glatt; `w28-sprache-dialekt-2b` bc38efc7 CONFLICT in `scripts/diag-settlement.cjs` (mein Teil B und ihr R13 an derselben
  Stelle, beide additiv — beide Blöcke bleiben) und `spec/asset-contract/v6/golden/siedlung.json` (beide minten den Export neu — der
  Golden wird über BEIDE Gesetze neu gemintet, Vertrags-Akt mit Byte-Beweis).
- Kopf 2 baue ich auf dem main nach der Landung von z812 (sprache im main), nie vorab mit fremden Commits; ich fasse weder
  `check.yml` noch `spec/ci/ci-zeiten.json` an.

## Post 23:45 (bau-funktion) — die Gasse vor dem Haus

- **Wurzel:** der Blick aus 20–30 m liest die Stufe 1 (L1NUR/LOD1F setzen `moebel:false`); `LEER=FERN||N.moebel===false` nahm dort
  Tisch und Bank des Gasthauses mit. Schnitt im Kern: `GASSE=!FERN&&!P.__nurMass` — was die Gasse vor dem Haus trägt, steht nah UND
  in Stufe 1, nie in der Masse des Baus (der Mass-Bau, `__nurMass`), nie fern. Ohne Solid (wie die Bank): Layout Labor = Export.
- **Gasthaus:** Ausleger L 2,02 m, Schild 0,64 × 0,75 m (Wirtshaus-Ausleger 19. Jh., Schmiedeeisen; Bayerisches Nationalmuseum,
  ovales Eisenschild) + Tisch und zwei Bänke je Seite der Tür, jetzt auch in Stufe 1.
- **Werkstatt:** gerahmtes Tor 2,2 × 2,3 m, Klappläden; neu im Freien je Seite des Tors die Werkbank L 2,00 · B 0,61 · H 0,84 m
  (Tischlerbank, museum-digital rlp 33575) und der Bretterstapel auf Unterlegern 2,4 × 0,9 × 0,9 m (Maß Hypothese, offen an
  `karte2.mensch.bau.bedarf#2`).
- **Wohnhaus:** ohne Zeichen, byte-gleich.
- **Tris (L0 · L1):** Gasthaus 120330 · 41142→41358 · Werkstatt 111008→111380 · 30076→30448; die übrigen sieben byte-gleich.
- **Offen:** die drei Bilder in der WELT am Messort `dorf` aus Augenhöhe (lokal swiftshader: je Pipeline 4–7 min, kein Bild der
  Welt) — sie liefert `bild:dorf@0.5` der GPU-Probe am Kopf 2; der Vorlauf bedarf#1 auf OMEN am Kopf 2. Kein Anspruch im Stempel
  vor blind ≥ 80 %; bedarf#2 erst nach dem Vor-Urteil.

## Post 00:57 · 01:09 · 02:00 (Koordinator) — Antwort

- **Kopf 2 sitzt auf main 93e4b83b.** Der Kopf auf 27d2f60e stand mit merge-tree CONFLICT gegen 93e4b83b (nacht-licht-klasse-3 schrieb
  `fachwerk-core.js`, `scripts/diag-settlement.cjs` und das Golden): gemergt, das Golden `siedlung.json` über beide Gesetze neu
  gemintet (nicht gemischt), die Batterie am Merge-Kopf ganz. Labor = Welt: der Mass-Bau des Labors trägt `__nurMass` wie der
  Kern-massBau (studio-begehen „das Labor-Layout weicht vom Export ab“ → GRÜN, 264 s).
- **bedarf#1:** Fach steht (5 von 44 = 11,4 % gegen ≥ 80 %); das Gesetz am Kopf 2 ist die Antwort, das Vor-Urteil fährt OMEN.
- **innen#3 — Täter-Zahl am Kopf:** 0 von 7 Werk-Bauten zeigen hinter der Tür ihren Raum der Arbeit (die Tür öffnet in den Mittelflur,
  EG Küche · Stube · Vorrat wie das Wohnhaus). Das Gesetz baue ich über Kopf 2 als WIP: `BEDARF_GESTALT.innen` je Raum (Schank
  H 1,05 · Amboss 0,97 × 0,37 × 0,36 auf Block 0,40 · Bankreihe Sitz 0,54, Tiefe 0,94, Mittelgang 1,70 · Mensa 1,8 × 1,0 × 1,0 ·
  Stehpult 1,16 · Hobelbänke), der Raum der Arbeit EIN Raum vom Tor zur Rückwand. Linse gate:settlement B3 „DER RAUM DER ARBEIT“:
  6 von 6 Bauten mit Raum der Arbeit im EG stellen ihn hinter die Tür (≥ 3 Stücke; am Kopf 2: 0); Selbsttest „der Raum der
  Arbeit steht leer“ → ROT in B3. Offen an innen#3: das Zunfthaus (die Trinkstube steht im Programm im OG, der Blick der Station
  endet im Flur), die Treppe im Raum der Arbeit (Gang frei, Bild offen), die Bilder aus der Tür.
- **huelle#1:** offen, nach innen#3.
- **Mehrspieler-Rot (f):** an meinen Köpfen nicht gesehen; erscheint es, steht die Job-Nummer hier.
- **C-K5b „NACH DEM ZUG STEHT DIE WELT“** am Merge-Kopf 93e4b83b im Mint-Lauf ROT (nachZug 3, Exporte 7) — derselbe Wettlauf wie
  am Kopf 1 (1 von 4 Läufen); der zweite Lauf steht in der Batterie.

Karte 2 gebucht 158 von 1 718 (Stand im Zweig `punkte-maschine`) · Status ZWISCHENSTAND
