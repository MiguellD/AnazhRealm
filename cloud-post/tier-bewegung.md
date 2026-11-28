# Stand-Blatt tier-bewegung (dritte Sitzung der Bahn Wanderung/Tiere, 27.11.)

Sprosse: `karte2.leben.tiere.bewegung#2` · Basis main 52937c92 (V18.546.451) · Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## Die rote Zeile — wörtlich, beide Akten gleich (Zweig `punkte-maschine`, `vision/richter/leben.tiere.bewegung.2.486a6685-gtx.json` und `…2.b1f0de0e-radeon.json`)

„S2 Umfang nicht erzeugbar: kein Laufvogel, der Fisch ein starrer Leib ohne Körperwelle (gezeichnet 0); Massen des Bestands über 1.354 Dekaden · fussfallAbw 0 Takt gegen Soll ≤ 0,05 Takt ✓ · strouhal ungemessen gegen Soll 0,2–0,4 ✗ · Täter: tetrapoda-core.js FISCH_GESETZ (starrer Leib) / kein Laufvogel“ — GTX 1060 am 486a6685, Radeon 890M am b1f0de0e, beide ROT.

Karte (Zweig `punkte-maschine`, `vision/MEISTERKARTE-2.md:1238`), wörtlich: Umfang „3 Dekaden 1–10³ kg: Vierbeiner, Laufvogel, Fisch mit Körperwelle“ · Tiefe „Fußfall gegen Muybridge ±0,05; Strouhal 0,2–0,4“ · Preis „P · Schwarm von 300 im Bild“ · Richter „Fußfall-Diagramm und St = f·A/U aus dem Ausgabe-Bild“.

Die rote Zeile gilt am main 52937c92 weiter: `FISCH_GESETZ` ist unverändert.

## Der Täter mit Datei:Zeile und Zahl

- `tetrapoda-core.js:2954` `FISCH_GESETZ` — `schlagHz: 2.5` und `schlagRad: 0.1` sind freie Zahlen, die nur die GIER des ganzen starren Leibs wippen lassen (`fischSchritt` :3006, „die Gier des Bilds, nie die des Gesetzes“); keine Welle läuft den Leib entlang, Frequenz und Ausschlag hängen weder am Tempo noch an der Länge.
- Täter-Zahl (aus dem Kern gerechnet, L = 0,3 m): Schwanz-Ausschlag Spitze–Spitze A = 2 · 0,1 rad · L/2 = 0,030 m; St = f·A/U = 2,5 · 0,030 / 0,7 = **0,107** beim Ziehen (`tempoMs` 0,7), **0,161** auf der Flucht (7,5 Hz, 0,060 m, 2,8 m/s) — beide unter dem Band 0,2–0,4; die Station liest gar keinen Strouhal (die Station der Leiter leben, Zweig `punkte-maschine`, Zeile 2269 `nimm(2, { fussfallAbw, massDekaden }, …)`, Stations-Sache).
- „kein Laufvogel“: der Bestand der Gang-Linse sind vier Vierbeiner (wolf · fuchs · baer · wesen, dieselbe Station Zeile 2240) — Massen 1,354 Dekaden; das Gang-Gesetz `gangSchritt`/`gangFuss` (tetrapoda-core.js:1421) trägt laut eigenem Kopf schon Zweibeiner.
- „gezeichnet 0“: `s.fischPool.mesh.count` am Messort der Station (kein Wasser in Sicht des Spielers).

## Plan (EINE Wurzel)

Der Fisch schwimmt nach dem Gesetz der Körperwelle: Frequenz aus Tempo und Länge (Bainbridge 1958: U = L/4·(3f − 4)), Schwanz-Ausschlag ≈ 0,2 L (Bainbridge 1958), die Welle läuft mit Wellenlänge ≈ L den Leib entlang (karangiform) — St = f·A/U folgt daraus und landet im Band (Taylor, Nudds & Thomas 2003: 0,2–0,4). Gelesen an der EINEN Stelle `fischSchritt`, gezeichnet vom Leib im Pool. Laufvogel und Massen-Dekaden folgen im selben Kopf, sofern die Zeit trägt — sonst ehrlich offen mit Prozent.

Messort der Station: die Gang-Linse fährt an der Pose des Spielers (Preis-Pose der Station), kein `stadt-voll`.

## ZWISCHENSTAND (27.11., Zweig `tier-bewegung`)

- **Geschnitten (Wurzel `FISCH_GESETZ`, EIN Leser `fischSchritt` → `fischLeib` → Pool `tier:fisch`):** `schlagHz`/`schlagRad` fallen; das Gesetz der Körperwelle `welle { huelle [0,02 −0,0825 0,1625], wellenL 1, schlupf 0,7 }` — Hülle nach Videler 1993 (A(0) 0,02 · A(0,2) 0,01 · A(1) 0,10 L), Schlupf U/c 0,7 (Videler 1993: 0,6–0,8), λ = L (karangiform); f = U/(schlupf·λ) folgt aus dem Tempo durch das Wasser (|v − Strömung|). Der Leib ist eine Kette von 4 Gliedern auf der Welle, jedes in ihre Tangente gedreht, Kopf bis Schwanz L.
- **Gemessen (am GEZEICHNETEN Leib, Instanz-Matrizen, Bach −162/257, 12 s):** St Median 0,107 (Gesetz-Zahl starr) → **0,325** [0,316 … 0,335], 22 von 22 steten Fischen im Band 0,2–0,4 (Taylor, Nudds & Thomas 2003, Nature 425:707); Biegung Kopf↔Schwanz 0 → 0,42 rad. Kosten `_fischTakt` an 40 Fischen: 0,046–0,062 → 0,106–0,118 ms je Takt (Median aus 5×600 Takten, Null-Renderer), Instanzen 40 → 160.
- **Linse:** `gate:tier-gang` (Familie Gang) trägt die Probe FISCH — Selbsttest ROT am starren Leib (Biegung 0 rad, „Täter: tetrapoda FISCH_GESETZ / fischLeib“), echter Lauf GRÜN, EXIT 0 in 118 s.
- **GPU-Ruf von Hand:** `zug.sh probe-tag` liegt in keinem Zweig (artifacts/profiband ist nicht verfolgt, roh 404) — die Tore folgen den Lesern der Dateien: `gate:tier-gang` (141 s, liest Fisch-Gesetz und Pool) · `gate:tier-anatomie` (171 s, `tetrapoda-core.js`) · `gate:webgl-probe` (79 s); `probeUrteil` über die lokalen Logs. Die Probe führt die Welt-Uhr über den EINEN Schreiber `_weltUhrNimm` (Ein-Schreiber-Wand).
- **Station:** Kandidat `cloud-post/tier-bewegung-station/` — die Station liest Strouhal und Biegung über dieselbe Probe (`H.quelle`).
- **Offen (ehrlich, die Sprosse bleibt ROT):** „kein Laufvogel“ — das Spiel trägt keinen Zweibeiner-Vogel (neues Tier in PRESETS, Ofen, Anatomie; nicht in diesem Kopf); „Massen des Bestands über 1,354 Dekaden“ — Soll 3 Dekaden (der Fisch trägt kein Massen-Gesetz). Umfang 2 von 3 Leibern (Vierbeiner, Fisch mit Körperwelle). Messname `karte2.leben.tiere.bewegung#2`.

## ZWISCHENSTAND Kopf 3 (27.11. abends, Zweig `tier-bewegung` → Vorprüf-Kopf `tier-bewegung-kopf3`, auf main b3740dd5)

- Täter-Zahl (vorher): Massen des Bestands 1,354 Dekaden (wesen 14,78 … baer 334,22 kg); der Fisch trug keine Masse — `_geschlossenesVolumen` (stamm/koerper-leib.js) zählte Kanten am INDEX, der Pool-Keil des Fischs (Oktaeder ohne Index) galt als offene Haut → KERN-PFLICHT „Gestalt ohne Volumen“.
- Geschnitten (EINE Wurzel): die Kante zählt an der LAGE ihrer Enden (Ecken ohne Index verschweißt, 1e-6); `_fischGesetz` trägt `leibV` = Σ Glieder × Volumen der EINEN Form `_kleintierForm` (dieselbe, die `_kleintierZeichnen` zeichnet); `_leibMasse` liest `leibV` für den Leib ohne Baum. Alle übrigen Massen byte-gleich.
- Gemessen (nachher): Massen 3,138 Dekaden (fisch 0,2435 kg … baer 334,22 kg), Band Fulton 1904 K = 0,9–1,3 (Salmoniden, OMAFA 2024) → 30 cm 0,24–0,35 kg ✓; St Median 0,325 (22 von 22 im Band 0,2–0,4); Biegung 0,42 rad; Fußfall 0 Takt. Linse gate:tier-gang mit Massen-Wand: Selbsttest ROT am Täter (1,354), echter Lauf GRÜN.
- Stations-Kandidat geheilt (`cloud-post/tier-bewegung-station/`): `feld()` = JSON.stringify je Objekt-Feld, Funktionen String; vorher „WURF nach 0,076 s: Unexpected identifier 'Object'“, nachher Urteil nach 5,8 s: s2 {fussfallAbw 0, strouhal 0,325, massDekaden 3,138}, ROT mit EINEM Rest „kein Laufvogel“.
- Ehrlich offen: der Laufvogel. Die Kette des Tier-Baums ist reiner Vierbeiner (flP/hrP/legHL/legFL an 156 Stellen in 24 Dateien; tetrapoda-core.js:3585 verlangt `folge.length === 4`; GATTUNGEN wolf/fox/bear/deer). Sprosse ≈ 83 % (5 von 6 Teilen). Karte 2 gebucht 156 von 1 718.
- Vorprüf-Kopf geschoben: `tier-bewegung-kopf3` 1f2c908 auf main b3740dd5 (Statik ganz GRÜN 557+54 s · fachwerk-contract 156 s · welt-boot 86 s · Kreatur 1/2/3 1 080/1 112/775 s · tier-gang 124 s · daten-contract 1 s · betriebsgesetz GRÜN). Wartezimmer: Urteil steht aus.

## leben.tiere.masse#1 — der Täter mit Datei:Zeile (Post 27.11. 22:38 MEZ)

- Rot war allein das Beleg-Bild der Serie „Herde am Hang“ (Zweig `punkte-maschine`, `stationen/g2.js` herdeHang: `/bild --ziel Herde --wahl 14` zwischen je 30 Takten). Die Welt ruht zwischen den Befehlen; die Stufe der Leiber (Leib · Satz · Feld) wählt nur der Takt (`_tickKreaturZiegel` → `_kzLeib`, stamm/kreatur-sicht.js). Der Schuss setzt die Kamera um, ohne dass die Leiber am neuen Auge wählen: die fliehende Herde jenseits ANALOG_NAH_M (64 m) des vorigen Auges stand im Schuss auf 42,9 m als Feld-Kapseln, `visible = false` (kreatur-sicht.js:95), und die Abnahme (`gestaltLeben`, scripts/lib/ausgabe-aufnahme.cjs:693) las nur Mesh und Satz → 5 von 5 UNGEZEICHNET.
- Belegt mit echtem Renderer (Werkbank, swiftshader): ein Leib, am Auge 90 m ins Feld gefallen, Kamera ohne Takt auf 43 m → visible false, Feld, Abnahme UNGEZEICHNET; derselbe Schuss mit `_leiberAmAuge` → nah, visible, gezeichnet.
- Schnitt (Zweig `tier-bewegung` 46d1422, als Kopf nach dem Urteil von Kopf 3): EIN Glied `_leiberAmAuge` (Ziegel · Tier-Satz · Blick des Bilds · Sicht je Leib am Auge der Kamera), gerufen von `__nahFolgt` (jeder Schuss, jede Pose der Blick-Wahl); der Zwilling `stufenAm` der Kreatur-Probe ruft es. EIN Leser `_leibGezeichnet` (Mesh · Satz · Feld-Eintrag, `_weltFeldZeichnet`) für Abnahme und Menge. Linse: `werkbank lauf --selbsttest` (`nahFolgtSelbsttest`), Mutante ohne `_leiberAmAuge` ROT beim Namen.
- Offen: das Bild der Serie selbst — die Welt der Werkbank steht unter swiftshader hier nicht (Fege-Takt nahWiese wartet); Richter ist der Vor-Richter an GTX und Radeon.

- masse#1, lokale Batterie am Kopf-Baum (swiftshader): welt-boot GRÜN (82 s) · fachwerk-contract GRÜN (123 s) ·
  gate:analog-nah Selbsttest GRÜN, Lauf ROT nur in E („eingeschwungen … ab Takt null“, Spitze 0 Sätze < 64 m, R/T/X GRÜN) —
  derselbe Lauf auf origin/main 23b593ac ist gleich ROT (55 s): die Welt steht in diesem Container nicht (wie Werkbank
  „DIE WELT STEHT NICHT“); kein Satz < 64 m in 1 500 Takten. Probe-Ruf darum `gate:analog-nah,gate:tier-gang` auf der echten GPU.
  `zug.sh probe-tag`: liegt in keinem Zweig (`artifacts/profiband/werkzeug/` ist ignoriert) — nicht fahrbar.
- 28.11. 00:27-Post: Kopf 3 fährt in z813 (`w28-tier-bewegung-3`). masse#1-Kopf `tier-bewegung-masse1` f9a12ab gebaut auf main
  b56b51f0 (nur die masse#1-Dateien; merge-tree ohne CONFLICT, atlas/stamm:lint/prettier GRÜN, nahFolgtSelbsttest GRÜN);
  die volle Batterie läuft, geschoben wird erst bei Exit 0.

## ZWISCHENSTAND 28.11. (Bahn tier-bewegung)

- **Kopf 3** gelandet mit z813 (main 27d2f60e).
- **masse#1-Kopf geschoben:** `tier-bewegung-masse1` 6e1d9d61 auf main b56b51f0 (merge-tree gegen 27d2f60e ohne CONFLICT), Ruf
  `[gpu-probe: gate:analog-nah,gate:tier-gang] [ci voll]`. Lokal Exit 0: check:statik 600 s · welt-boot 84 s · fachwerk-contract 135 s ·
  Kreatur 1/2/3 987/1 033/744 s · Atlas · stamm:lint · prettier · nahFolgtSelbsttest. gate:analog-nah: Selbsttest GRÜN, E ROT gleich am
  main 23b593ac (die Welt steht in diesem Container nicht) — die Radeon urteilt. `zug.sh probe-tag`: liegt in keinem Zweig.
- **lebenszyklus#2 (Post 00:57):** Stations-Kandidat `tier-bewegung-station/lebenszyklus2.diff` + `BEGRUENDUNG-lebenszyklus2.txt`
  (Basis pm 6cd4d721): das Fach „Jungtier oder ausgewachsen?“ (Selbsttest 16 GRÜN, Mutante ROT) und die Klasse `FAUNA_MAX_AGE_MS`
  (gefallen mit c6038905, sechs Stellen in k2-leben.js lasen NaN) geheilt über leben-core `lebensdauerS`. Gemessen: Jungtier-Anteil
  6,78 % (Soll ≥ 10 %) bei 4,8 Tieren — offen das Gesetz (keine Setzzeit, keine Jugend-Proportion) und der Umfang an der wiese.
- Karte 2 gebucht: 156 von 1 718 (Stand Koordinator 01:09).
- 28.11. 02:00-Post: masse#1-Kopf 6e1d9d61 steht gegen main 93e4b83b ohne CONFLICT (merge-tree); Probe-Post noch keine.
- GPU-Probe masse#1 6e1d9d61 GRÜN (Radeon 890M, Lauf 46088267172): gate:analog-nah GRÜN 78 s (E eingeschwungen ab Takt 116) · gate:tier-gang GRÜN 103 s · gate:webgl-probe. Wartet auf den Zug.
- 28.11. 02:25-Post: masse#1 fährt im Bündel `buendel-nacht-2`; kein neuer Vorprüf-Kopf bis zur Landung.
- **lebenszyklus#2, drei Diffs (Post 02:25):** `lebenszyklus2-quellen.diff` — quellen.json +3 Sätze (kitz 45 · hirschkuh 30 · ricke 25,
  Commons, je Klasse ≥ 40, Pose Third 15 m, Tageslicht, Sommer); `hole.cjs --trocken` 100 von 100, liegen geblieben 0; `git apply` auf
  Blob 67266b2 OK. Das Fach greift auch auf faecher.cjs bf57832 (Selbsttest 17 GRÜN · 0 ROT).
- **Die Wurzel der Setzzeit (gemessen):** zwei Jahre in der Welt — Leben 262,5 s (refS 2 100 ≙ 8 Jahre), Welt 2 400 s (jahreJeTag 1,5),
  Faktor 9,14; der Hirsch stirbt mit 0,86 Welt-Jahren. Eine Setzzeit am Welt-Jahr löscht die Art — nicht eingebaut; sie braucht EINE Uhr
  (die Raffung, leben-core :116). Begründung Punkt 4.
- 28.11. 03:05 MEZ: masse#1 6e1d9d61 noch nicht im main 9885e7c, merge-tree ohne CONFLICT; keine neue Post seit 02:25. Wartezimmer.
- 28.11. 03:03-Post abgearbeitet: der Kandidat lebenszyklus#2 nennt Ort und Bildzahl (wiese · 20 je Klasse an EINER Uhr = 40 Bilder; vorher fächerte er über 9 Uhren, bis 396) und trägt den Satz der Quellen im Muster boden#1 (stand · motiv · ablage), alle drei Diffs neu auf die Blobs faecher bf57832 · k2-leben 4f1f810 · quellen 180c397, git apply OK, Selbsttest 17 GRÜN, Mutante ohne uhren ROT.

## ZWISCHENSTAND 28.11. ~04:40 MEZ — die EINE Uhr (Post 03:58), gemessen vor dem Kopf

Werkbank an der wiese (swiftshader, main 896eb419), vier nahe Regionen, Bestands-Takt 10 s; vorher `refS` 2 100 ↔ nachher 19 200
(= jahreRef 8 · jahrK 2 400), gleiche Saat, gleiche Reihenfolge (2 Welt-Jahre, dann 20):

| | vorher | nachher |
|---|---|---|
| 2 Welt-Jahre: Tiere im Mittel · Jungtier-Anteil · Geburten | 4,37 · 4,63 % · 20 | 4,51 · 12,51 % · 18 |
| 20 Welt-Jahre: Tiere im Mittel · Jungtier-Anteil · Geburten | 4,91 · 5,91 % · 218 | 5,21 · 15,98 % · 201 |
| Jungtier-Anteil je Jahr (Spanne) | 3–13 % | 0–34 % |
| Takt der vier Regionen p50 / p95 | 0,24 / 0,385 ms | 0,235 / 0,435 ms |

Der Takt kostet gleich. Die EINE Uhr allein hebt jungProzent über 10 % (Mittel), aber das Jahr streut (Bestand ~5 Tiere).

**Die Fenster der Generations-Proben SPRENGEN — die Zahl vor dem Vorprüf-Kopf (pm 9b4b3c91):**
- lebenszyklus S7 (k2-leben.js:2912, 100 Generationen, msDeckel 9 000): vorher 26 153 Takte in 1,9 s → 100 Generationen; nachher
  Ziel 244 153 Takte, der Deckel greift bei 127 614 → **52,3 Generationen** (ganz bräuchte es 17,2 s bei 0,0705 ms je Takt).
- evolution.muster (:7426, `lauf(ort, 6 h)`): vorher 21 600 s / 2 651 s = 8,1 Hirsch-Generationen; nachher / 24 451 s = **0,88**.
- evolution.erbe (:7204, 10 Lebensdauern über das Aufholen der Region): 215 088 s Welt-Zeit in 0 ms — das Fenster hält.
- verhalten S5 (:2610, spieltage = max. Lebensdauer / 3 600 s): 0,81 → ~7,4 (Soll ≥ 7) — die längere Spanne trägt diese Zeile.
Der Kopf `tier-bewegung-uhr` wird erst Vorprüf-Kopf, wenn die zwei Fenster entschieden sind (S7: msDeckel ≥ 18 s, oder die
Generation am Gesetz statt an der Wand-Zeit; muster: dauerS × 9,14 = 54,8 h Welt-Zeit über das Aufholen, das 0 ms kostet).
