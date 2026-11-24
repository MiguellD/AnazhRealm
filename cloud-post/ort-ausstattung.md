# Vorprüfung ort-ausstattung: der Ort weist sich aus

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 78 von 1 718.

**Geschnitten:** EIN Gesetz im fachwerk-Kern (`ortAusstattung`, fachwerk-core.js:11733) leitet die Ausstattung eines Orts aus
Rolle, Epoche und Netz ab — das Schild an der Außenfläche der Tür-Wand jedes Sonderbaus (`SCHILD_GESETZ` :9161, Band USSC
1 Zoll je 10 Fuß; der Tester `amTuerWand` :11771 misst an `ring` der Hauptmasse, nie an der Mitte der Pfosten), das Hauszeichen
je Rolle aus 19 Motiven (`HAUSZEICHEN_GESETZ` :9417, Band Rijksmuseum Gevelsteen 57,5 × 60 cm), das Marktkreuz auf dem Platz ab
958 (`MARKTKREUZ_GESETZ` :9493, Band Trierer Marktkreuz 5,22 m), der Markstein, wo die Nähe zum Reich des einen in die des
anderen wechselt (`grenzeAmWeg` :5613, Band OWL GR026 70 × 40 × 25 cm), die Wache am Tor ab 587 Köpfen (`wacheLose` :2751, Band
Eurostat crim_plce 341 je 100 000) — und die Welt liest jede Zeile über den EINEN Export `AnazhRealm.ORT_AUSSTATTUNG`
(stamm/siedlung-ort.js:3835; `_hausStueckSetzen` :609, `_markSteinSetzen` :3597). Den Verkehr, den der neue Plan anders
verteilt, heilte die Wurzel: der Bogen aus dem Platz der Wende im Wendekreis SEINER Gattung, dann tangential auf den Ring
(`_verkehrPlatzBogen`, stamm/siedlung-verkehr.js), das Rechteck des Leibs aus seiner Lage am Anfang jeder Linie (`_verkehrLinie`)
und frische Boxen an jedem Wagen, den eine nahe Hülle erreicht (`_verkehrSchritt`).
**Gemessen:** schrift#1 0 → 68/69 Sonderbauten (Anteil 0,986 ≥ 0,9) · bildkunst#1 0 → 17 Werke, Motiv 16/16, gleiche Paare 0 ·
grenze#1 0 → 3 Marksteine an 3 Kanten · megastadt#1 0 → 1 Wache; je Stück 1 Draw, L3 ≤ 48 Dreiecke, Heap +74 KB je Stück; die
GPU-Probe c9e66f03 (bild:ort-zeichen, radeon-890m) GRÜN mit f:schild 0,1 % und f:relief 0,3 % im Bild; der Verkehr der
Stadt (gate:fahr-leben --verkehr, 600 s je Stunde), den der neue Plan anders verteilt, wieder grün: knapp 0,13 → 0,30 m,
Ausscheren 0,423 → 0,050 / 0,038 m, Stoß Wagen an Wagen 1 / 3 → 0 / 0 (10 / 23 Uhr), kein Warte-Kreis, 1,297 → 1,274 ms je
Schritt (10 Uhr, dieselbe Maschine).
**Ehrlich offen:** `mensch.netz.stoffwechsel#1` (Gas-Straßenlicht erst ab 1807, jedes Plan-Jahr ≤ 1549; die Laterne trägt
`gas:true` ohne Leser, fachwerk-core.js:6621) · die Inschrift der steilen Kapelle (ihre Traufe schneidet das Brett an der
Wand um 9 cm, `amTuerWand` fachwerk-core.js:11771) · der Heap je Stück am Chokepoint `spawnArchitecture`
(stamm/siedlung-satz.js:1257) · die Streife der Wache (ihr Tag, koerper-core.js:5459 `tagesOrte`, nicht meine Datei) · der
Bogen des Abbiegers in der Kreuzung (`kurveR` 5,5 m, fachwerk-core.js:5791) liegt unter dem Wendekreis von fünf der sechs Gattungen.

## Je Sprosse (vorher → nachher, gleiche Bedingungen)

| Sprosse | Messung | vorher | nachher | Commit |
|---|---|---|---|---|
| `mensch.kultur.schrift#1` | Sonderbauten mit lesbarem Schild ihrer Rolle (stadt-voll 7/300) | 0 / 69 | 68 / 69 = 0,986 | 684ccda · c9e66f0 |
| `mensch.kultur.bildkunst#1` | Werke am Ort · Motiv gefunden · gleiche Paare | 0 · – · – | 17 (16 Hauszeichen + Marktkreuz) · 16/16 · 0 | 8032981 |
| `mensch.macht.grenze#1` | Marksteine an den Kanten des Wegenetzes | 0 | 3 an 3 Kanten, 2,2–3,0 m vom Weg | 6fd6303 · 2ad614f |
| `mensch.macht.megastadt#1` (Bau) | Wachen in stadt-voll | 0 | 1, 22,6 m vom Torplatz | dadd52d · b0e0fd4 |
| `mensch.netz.stoffwechsel#1` | Leitungen | 0 | 0, offen (oben) | — |

- **Die Außenfläche der Wand** (c9e66f0): Schild und Hauszeichen hingen an der Mitte der Pfosten, 6 cm in der Wand — im Bild
  der GPU-Probe 8574142e f:relief 0,0 %; seit dem Schnitt an `ring` 0,3 %, der Strahl trifft das Relief zuerst. Die Kapelle
  verliert dabei ihr Brett (69 → 68): an der wahren Wand schneidet ihre Traufe (60°, 3,10 m) es um 9 cm.
- **Der Strom vor der Wache** (b0e0fd4): die Wache ist ein Wohn-Los und würfelt ihren Hof wie es — am Dorf 21/150 standen
  147 → 152 der 153 Slots an ihrem Ort von vor der Wache (der eine, der wandert, ist sie selbst). Auf dem Kachel-Plan
  stadt-voll 7/300 stehen nur 7 der 308 Slots, wo sie standen — kein Byte-Beweis, der Plan der Stadt ist ein anderer; der
  Vertrag (spec/asset-contract/v6/golden/siedlung.json) trägt das neu gemünzte 7/12 (6 Gegenstände ≤ 0,060 m).
- **Der Verkehr** (3116f28): der andere Plan schickt die Wagen über Plätze, die vorher keiner so fuhr, und die Linse
  fand drei Wurzeln. Der Bogen aus dem Platz der Wende lag mit `kurveR` 5,5 m und dem geglätteten Knick zum Ring bei R ≈ 4,3 m
  unter dem Wendekreis jeder Gattung (aus exportDrive maxSteer, sfK und Radstand bei Kriech-Tempo: Transporter 6,83 m, Kompakt
  5,38 m; Band Ford Transit L2 · VW Crafter 12,3–13,6 m Wendekreis) — der Transporter 8 schwang aus, knapp 0,13 m am SUV 17;
  jetzt fährt jeder den Kreis SEINES Wendekreises und tangential auf den Ring (`_verkehrPlatzBogen`, die Fläche des Bodens
  trägt den Bogen des größten). Das Rechteck des Leibs stand am Anfang jeder Linie in ihrer Richtung statt in seiner Lage:
  Ausscheren 0,423 m am Transporter 6 bei 824/442; jetzt folgt seine Hinterachse der Schleppkurve (`_verkehrLinie`). Die Hülle
  des nahen Wagens traf fremde Boxen, die bis `boxFernM` 2 m hinter ihrem Wagen standen: der Supersport 0 stieß bei 841/432 an
  die Boxen des Transporters 6, 2,02 m hinter ihm; jetzt ziehen die Boxen jedes Wagens, den eine nahe Hülle erreicht, je
  Schritt nach (`_verkehrSchritt`).

Kosten je Stück: 1 Draw, Dreiecke L0 / L1 / L3 — Schild 284–1 264 / 52–224 / 12–48, Markstein 104–148 / 60–72 / 12–24,
Hauszeichen 260–392 / 26–48 / 12, Marktkreuz 280–328 / 88–124 / 46 (Budget 3 400 / 620 / 48). Heap der vollen Stadt im selben
Lauf (Null-Renderer, „dorf 7 300“, gc über CDP): mit den 61 Stücken 79,32 MB V8, ohne sie 74,81 MB — +4,51 MB, 74 KB je Stück.

## Bilder

- `origin/koordination:probe-post/ort-ausstattung/c9e66f03-ort-zeichen.png` (+ `.maske.png`), Läufer radeon-890m, ABNAHME
  GRÜN · Inhalt f:schild 0,1 % (Luma 48), f:relief 0,3 % (Luma 60). Das eigene Auge: über der Tür des Kontors steht
  „KAUFHAUS“ lesbar in Gold auf dunklem Brett, rechts daneben die Waage golden auf Blau im Steinrahmen, beide auf der Wand,
  nicht in ihr; die Maske färbt beide als eigene Klasse.
- `origin/koordination:probe-post/ort-ausstattung/80329815-stadt-voll.png` — der Messort stadt-voll, die Stücke liegen
  hinter seinem Auge (deshalb der Messort `ort-zeichen`, spec/profiband/haushalt.json).
