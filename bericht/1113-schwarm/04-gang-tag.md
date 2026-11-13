# 04 Gang, Fuß-Kontakt und der Tag der Bewohner: wer liest den Boden

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/genom-spiel/frontal.png` links (x 30–160, y 470–740): ein Gehender im weißen Hemd steht an der Kante zwischen
  Weg und Grasböschung. Beide Füße hängen mit der Spitze nach unten, die Sohlen berühren nichts, der Schatten liegt
  daneben auf dem Boden. Er sieht aus wie eine Puppe kurz über dem Hang. `mensch-paar/nach-nah-frontal.png` zeigt
  denselben Gehenden in derselben Pose an derselben Stelle (feste Uhr, also dasselbe Bild).
- `scratchpad/genom-spiel/gruppe.png`: die Stehenden auf dem ebenen Platz (x 450, 950, 1080, 1310) stehen mit flachen
  Sohlen auf dem Boden, die Schatten sitzen an den Füßen. Auf ebenem Grund ist also kein Fehler zu sehen, der Fehler
  zeigt sich am Gehenden am Hang oder an einer Kante.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
SPIEL = main ec281422 (origin/main steht jetzt auf 7f778d44, z427 karte-stamm; ob sich an diesen Dateien etwas
geändert hat: nicht geprüft).
- **Die Höhe des Bewohners schreiben genau zwei Stellen:** `stamm/siedlung-bewohner.js:913–918` `_bewohnerStellen`
  (Geburt, Ankunft, Tür; Aufrufer :860, :1393, :1888, :1925, `siedlung-verkehr.js:968`) und
  `siedlung-bewohner.js:2239–2250` `_bewohnerSchritt` (jeder Schritt). Beide lesen den Boden des GESETZES
  (`_koerperBodenUnter`, `kreatur-leben.js:1557`: Abtastung des Felds `_fieldSurfaceBelow`) und setzen darauf
  `_bewohnerTritt` (:2707, die Oberkante einer Box) + `PLAYER_FOOT_OFFSET × groesse`.
- **Der Schritt merkt sich den Grund 0,5 m lang:** :2246 `(x−grundX)²+(z−grundZ)² < 0.25` → `b.grundH` bleibt stehen
  (außer an Boxen). Am Hang bewegt sich der Ursprung darum in Stufen von bis zu 0,5 m × Steigung (bei 20° bis 18 cm,
  gerechnet, nicht gemessen). Die Tiere haben dieselbe Merkstelle (`wasser-hydro.js:421–425`), dort setzen aber die
  Pfoten den Fehler wieder auf den Boden (siehe unten).
- **Gezeichnet wird ein anderer Boden.** Das Gesetzbuch hat einen eigenen Leser für den sichtbaren Boden:
  `koerper-leib.js:588–600` `_standSicht` („die Sim steht auf dem Gesetz, die Sicht auf dem, was das Auge sieht"),
  über `_bodenSichtAt` (`gelaende-boden.js:19`, die Boden-Karte des gezeichneten Meshs, bilinear) mit dem Band
  `STAND_SICHT_BAND` 2,0 m (`koerper-leib.js:3440`). Zur Größe des Abstands zwischen Gesetz und Bild: bei Wolf und Reh
  standen die Pfoten auf dem Gesetz 0,30–0,46 m im Fels (`koerper-leib.js:580–582`), am 30°-Hang stand der Fuß
  12–22 cm in der Luft (`gelaende-boden.js:11–12`). Diesen Leser nutzen der Fuß des Spielers (`_gaitBodenY` :606 →
  `_fussBoden` :615) und die Pfote des Tiers (`_kreaturFussBoden` :2353, mit `userData._traegerY`). **Der Bewohner
  nutzt ihn an keiner Stelle** (in `siedlung-bewohner.js` gibt es keinen Aufruf von `_standSicht`, `_fussBoden` oder
  `_bodenSichtAt`).
- **Der Gang hat keinen Bodenkontakt:** `_gaitTick(mesh, halter, speed, dt, opts)` (`koerper-leib.js:540`) baut die
  Fuß-IK nur mit `opts.ik` auf. Laut :538–539 bekommt sie „NUR der lokale Avatar (Budget)". Der Bewohner ruft den Tick
  immer mit `null` auf (`siedlung-bewohner.js:976, 1557, 1708–1709`). Dadurch stellt `leibRigPose`
  (`koerper-core.js:6549–6666`) die Beine für ebenen Boden unter dem Ursprung: Ziel `gangFuss`, Becken-Senke
  `hips.y = _baseHipY − _gangSenke·w` (:6662–6664). Ein Hang hebt den Fuß hangab an und drückt ihn hangauf in den
  Boden.
- Was das Gesetzbuch KANN, aber nicht ankommt: die Sohle auf sechs Stellen (`_gaitProbe` :632), das Aufsetzen dort, wo
  die Sohle trägt (`_gaitSetzen` :659), das Senken des Beckens auf das tiefere Bein (`_gaitApplyFussIK` :752–793) und
  den Kipp der Sohle am Hang (`_gaitSohlenKipp` :880). Für den Spieler ist das gemessen (leib.K2: Hang p95 1,2–1,4 cm),
  der Bewohner bekommt davon nichts.
- Menge: nur `nahLeiber` 4 innerhalb von `nahM` 8 m leben als Leib (`siedlung-bewohner.js:3482–3484`). Alle anderen
  zeichnet der Satz mit der Matrix `lage` (:1158–1167: Ursprung y + FOOT·(raumSkala − scale.y), die Sohle bleibt) und
  dem gebackenen Gang (16 Phasen, :3485). Der Satz übernimmt die Höhe aus den beiden Schreib-Stellen oben, eigene
  Messungen macht er nicht.
- Bau und Gang passen zusammen: `leibBauAuf` (`koerper-core.js:2333–2359`) hebt die Wurzel um `hebt` (Länge der
  Beine), der Gang liest das Bein danach neu (`delete rig._beinMass`, `siedlung-bewohner.js:875`). Als Ursache für das
  Schweben ist das **nicht** zu sehen (gelesen, nicht gemessen).
- Tag/Ziel-Plan: ändert keine Höhe. `w28-ziel-plan` 0146c309 bzw. `-wip` 3005322c ändern `siedlung-bewohner.js` mit
  +291/−… Zeilen, aber an keiner Stelle `grundH`, `FOOT_OFFSET`, `_bewohnerTritt` oder `position.y` (git diff gelesen).

## Die EINE begrenzende Entscheidung
Der Bewohner steht auf dem **gezeichneten** Boden, und zwar über denselben Leser wie Spieler-Fuß und Tier-Pfote
(`_standSicht` / `_fussBoden`). Den Boden des Gesetzes behält er nur als Träger, so wie es das Tier schon macht
(`_traegerY`). Einen eigenen Boden-Leser für den Bewohner gibt es nicht. Die Höhe aus dem gemerkten Gesetz-Grund wird
nicht mehr als Stand verwendet.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Die Klasse heißt „Wo steht die Sohle eines Bewohners". Alle drei Stufen gehören in eine Welle:
1. **Ursprung (Satz, Feld, Leib):** In `_bewohnerSchritt` :2250 und `_bewohnerStellen` :916 wird
   `t = _bewohnerTritt(...)` zu `b.traegerY = t` und `g.userData._traegerY/_traegerStruktur` (Struktur = t kam aus
   einer Box). Die Höhe wird dann `this._standSicht(x, z, t, struktur) + fuss`. `sohle` (:2240) liest künftig
   `b.traegerY` statt `position.y − fuss`, damit die Simulation nie vom Bild abhängt. Die 0,5-m-Merkstelle (:2246)
   bleibt für das teure Abtasten des Felds. Die Karte liest jeden Schritt neu (`_bodenSichtAt` ist eine Karten-Lesung,
   `koerper-leib.js:622–623`).
2. **Fuß der Nah-Wahl (4 Leiber):** `_gaitBodenY(x, z)` (:606) bekommt einen Leib als Parameter. Mit Leib liest sie
   `_kreaturFussBoden(leib, x, z)` (:2353), ohne Leib den Spieler wie bisher. `ik.leib` wird in `_gaitIKPrep` (:682)
   gesetzt. `siedlung-bewohner.js:1557` ruft `_gaitTick(g, b, v, dtA, { ik: true, soleY: b.traegerY-Sohle, yaw: g.rotation.y })`
   auf. Damit senkt sich das Becken auf das tiefere Bein, und der stehende Fuß bleibt am Boden.
3. **Satz und Feld (Menge):** keine IK pro Instanz. Sie erben den Ursprung aus Stufe 1, der Restfehler am Hang ist
   ±(Fußabstand × Steigung)/2. Das wird mit Zahl offen benannt.

**Leser-Liste (vor dem Schnitt, gelesen):** `position.y` des Bewohners lesen `siedlung-bewohner.js:1162` (Matrix des
Satzes), :1093 (Feld-Lage), :2240 (Sohle → `_koerperBodenUnter`, `_bewohnerTritt`); `siedlung-verkehr.js:795/810`
(Leib am Steuer, setzt selbst); `scripts/lib/kreatur-proben.cjs:2792–2831` (`satzGang`, Fuß-Schlupf über x/z, liest
keine Höhe); mensch.K2 Wiederkehr ±2 m (x/z). Das `_gaitBodenY` lesen `_gaitProbe` :636, `_gaitSetzen` :665 und
`_gaitSohlenKipp` :884; für den Spieler bleiben sie unverändert, weil ohne Leib.
**Kosten:** Stufe 1 kostet eine `_standSicht` pro Schritt und gehendem Leib (4 Chunk-Lookups + bilinear, kein Abtasten
des Felds). Stufe 2 kostet für höchstens 4 Leiber pro Anim-Takt bis zu 2×6 Sohlen-Proben + Setzen. Die Kosten hängen am
Schirm (Nah-Wahl), nicht an der Kopfzahl. Messen: `band --ort dorf` CPU-Takt p95 vorher↔nachher (GTX heute 4,7–6,3 ms,
Pflicht E) sowie Messort stadt mittags `_bewohnerGangSchritt` (Bezug 25,6 ms/s Radeon, :1070).
**Kriterien:** Kein Kriterium der Meisterkarte zählt die Sohle des Bewohners. `leib.K2` (2 P., Fuß Hang/Treppe
p95 1,2–1,4 cm) misst nur den Spieler, `mensch.K1#1` (1 P., radeon, „18 Menschen im Bild, 0 gehend") misst die Menge,
`mensch.K3#1` (2 P., Durchdringung 0, Tür 266/266) muss halten. Abgabe = Bildpaar Dorf Mittag, frontal + Hang-Kamera,
main ↔ Zweig, mit derselben Kamera wie `genom-spiel/frontal.png`. Dazu kommt eine **berichtete** Zahl ohne Soll: die
Sohle über `_bodenSichtAt` beim gehenden Satz-Bewohner, an den Fuß-Ecken, die `satzGang` schon findet
(`kreatur-proben.cjs:2794–2813`), p95 vorher↔nachher.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Für den Boden-Schnitt gibt es keinen Zweig. Die Teile liegen auf main: `_standSicht`, `_fussBoden`,
  `_kreaturFussBoden`, die ganze Fuß-IK.
- `w28-ziel-plan` 0146c309 (Abgabe) / `w28-ziel-plan-wip` 3005322c (WIP, Kopf = main ec281422 eingemischt): der Tag
  bindet Orte nach Angebot. Am Markt stehen 9 statt 7 (Rumpf 0146c309). Was zur Landung fehlt: vier Bilder Dorf Mittag
  main ↔ Zweig + `band --ort dorf`, danach ein Abgabe-Kopf (Rumpf 3005322c). Kollision mit diesem Schnitt: keine
  gefunden, nur die Datei ist dieselbe.
- `w28-weg-koerper` b1ffbea3 (WIP) macht den Gehsteig zum Erdbau. Damit ändern sich Gesetz UND Bild unter den
  Gehenden. Dieser Schnitt muss nach ihm gemessen werden, oder beide werden am selben Bildpaar gemessen.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- **Nicht gemessen**, welche Ursache das Bild links trägt: der gemerkte Grund (0,5 m), Gesetz gegen Mesh an der
  Böschungskante, oder die Pose für ebenen Boden ohne IK. Der Schnitt trifft alle drei. Wie groß ihr Anteil jeweils
  ist, ist unbekannt.
- Nicht gelesen: `_fieldSurfaceBelow`, `_bodenKarteBilinear`, `_bodenStufeMisch`, `tetrapoda gangFuss/gangBecken`,
  der Satz-Shader (`_gangSatzInstanz`), `_buildHumanGroup` (ob er `_animateHuman` vor `leibBauAuf` ruft: dann
  hielte `_baseHipY`, `koerper-core.js:6663`, die Hüfte VOR dem Bau, und `hebt` ginge verloren; nicht geprüft).
- Skalierung der Senke: `hips.position.y −= _gangSenke·w` in Einheiten des Beins, unabhängig von `t.mensch.scale.y`
  (:6664). Ist diese Skala ≠ 1, sitzt der Fuß um Senke·(s−1) daneben (wenige cm, gerechnet, nicht gemessen).
- Widerspruch zum Gesetz: `_gaitTick` sagt „NUR der lokale Avatar (Budget)". Stufe 2 hebt das für 4 Leiber auf, und
  die Kostenzahl dazu fehlt noch.
- Mehrspieler: Die Bild-Höhe hängt davon ab, wie das Auge die Chunk-Stufen sieht. Darum führt Stufe 1 die Sohle der
  Simulation (`b.traegerY`) getrennt. Ob ein Peer `position.y` eines Bewohners synchronisiert: nicht gelesen.
- `gate:kreatur-takt` passt nicht in die Probe-Marke (länger als der Deckel 960 s, ÜBERGABE §4).

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 4 (jeder Gehende am Hang und an Kanten im Dorf der Ankunft) · Aufwand M (zwei Schreib-Stellen + ein Parameter
an `_gaitBodenY`) · Risiko: Die Bild-Höhe könnte in die Wand-Prüfung (`_bewohnerTritt`-Band) oder in die Wiederkehr
durchsickern, wenn `sohle` nicht sauber auf `b.traegerY` umgestellt wird.
