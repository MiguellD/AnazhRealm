# Stand-Blatt wander-pfad (Sprosse karte2.leben.tiere.wanderung#3) — ZWISCHENSTAND

## 27.11. 00:30 Macher — die Woche des Hirschs: die Tränke im Revier, die Weide gleichverteilt

- **Basis:** gebaut und gemessen auf Kopf 2 c6038905 (die Leine von #2, `streifRadiusM`; ohne sie läuft der Hirsch an 8 m);
  Kopf 2 landete während der Arbeit in main (w28-wander-spieltag) — der Kopf steht jetzt auf main 1336dcb8, derselbe Diff per
  Cherry-Pick, `git merge-tree --write-tree origin/main HEAD` Exit 0.
- **Feldmaß:** die konvexe Hülle der wirklich gelaufenen Bahn eines Individuums über 7 Spieltage (MCP 100 %, Lindstedt, Miller &
  Buskirk 1986, Ecology 67: Tab. 1 — dieselbe Tafel, aus der `streifRadiusM` stammt), Band der Karte: Rothirsch 1–10 km² ± Faktor 2.

### Geschnitten (stamm/kreatur-leben.js, EINE Wurzel: das Tier läuft, wo sein Bedarf es hinführt)
- **Die Tränke im Revier** `_kreaturTraenke(N, k0)`: das Netz des Reviers (`_kreaturRevierNetz`) sammelt seine Ufer-Zellen
  (`N.ufer`: nass oder ≤ eine halbe Zellen-Diagonale vom Rand des Flusses); das durstige Tier (`LG.durst ≥ 1`, DURST_GESETZ) zieht
  zur BFS-nächsten Ufer-Zelle seines Felds und trinkt an ihrem Wasser-Punkt (`_findNearestWaterPoint`) — `_kreaturDurstig` erkennt
  die Tränke des Verbands auch an einem See, den der Rand des Flusses nicht kennt. Vorher: 0 Trünke in 7 Tagen (der Durst suchte
  40 m um den Weg, `aufgaben.trinkSuchM`).
- **Die Weide gleichverteilt:** das Ziel fällt gleichverteilt auf die erreichbaren Bleibe-Zellen des Netzes in der Leine (die alten
  6 Würfe nur noch ohne Netz); der Charnov-Rest (`_weideSatt`, `Z.da`, `satt`) fiel.
- **Der Hang sperrt:** trockenes Land außerhalb des Lebensraums ist Weg, außer dem Hang (`_bodenKlasseAt` „hang“) — vorher hing der
  Hirsch an einer Fels-Wand (65 % ziehen, 0,36 km²).
- Modul-Karte: `_kreaturTraenke` in „Kreatur/leben“; `stamm-umzug --nach-karte` 0 Abweichungen, `diag-atlas --check` OK.
- PRESETS und PARAMS unberührt (kein Kern-Diff); `npm run gate:daten-contract` GRÜN.

### Gemessen (Hirsch 93,4 kg, Leine 939,2 m, Messort wiese, 7 Spieltage, headless)
- vorher (Kopf 2, dt 0,5, Sonne): **0,488 / 0,499 km²** (faktor 2,05 / 2,00) · 0 Trünke · 7 Ziele.
- nachher, die Probe des Kandidaten wörtlich (dt 0,5): **0,838 / 0,576 km²** (faktor 1,19 / 1,74 ✓) · spieltage 7 · 50 400 Takte ·
  0,96 / 0,77 s Wanduhr. Breiter: dt 0,25 acht Läufe 0,727–0,802 km² · 13–15 Trünke je Woche · Tagesbudget ziehen/nahrung/ruhen
  9/51/40 % (Soll ETHOGRAMM 10/50/40); Sonne 0,658–0,90 · Regen 0,566 / 0,779 · dt 1 0,727 / 0,782 km².
- Bild: [spur-7-spieltage.svg](wander-pfad-bild/spur-7-spieltage.svg) — Bahn, Hülle, Tränken, Anker und Leine vorher ↔ nachher im
  selben Maßstab.

### Linsen der Familie (lokal, Wolke)
- GRÜN: gate:kreatur-leben (41 s) · gate:tier-anatomie (93 s) · gate:tier-gang (101 s) · gate:fahr-leben (1 032 s) ·
  gate:kreatur-takt Teil 1/2/3 (Selbsttest 54 · 56 · 47 Täter). Probe `tagesbudget` im Grund: Hirsch ruhen/nahrung/ziehen
  0,401/0,5/0,1 (Soll 0,4/0,5/0,1), Trünke je Tier 4,8,2,10,8,10,4,2,0,2,1,3 (vorher 4,8,2,3,9,10,4,2,0,2,1,3), 54 am Wasser.
- gate:wasser-leben: allein „K10 LEER: 8“ — dieselbe Röte stand am main 45bad33f (Blatt wander-spieltag), nicht dieses Schnitts.
  gate:wasser-leben:bild: Station nicht gefahren: GPU (der GPU-Prozess stürzt in der Wolke ab).
- gate:daten-contract · gate:betriebsgesetz GRÜN · `npm run lint` 0 Fehler · `npm run format:check` grün.

### Kandidat der Station
`cloud-post/wander-pfad-station/` — Diff gegen meisterkarte-quelle/punkte/stationen/k2-leben.js im Zweig `punkte-maschine`
(Basis byte-gleich mit 8be8b964) + BEGRUENDUNG.txt: die Woche als zweiter Lauf (tage 7, dt 0,5, msDeckel 45 s, ohne Region), S3
urteilt über die Hülle der Woche, `sek` 40 → 60; Soll und Richter-Text wörtlich aus der Karte. Die Wand `liste` (meisterkarte-quelle/punkte/punkte.cjs im
Zweig `punkte-maschine`) an 38194f83 und c6038905 mit Kandidat: genau zwei ROT gelaende.K2#1/#2 (Wand HAKEN), 1 976 Stationen, wie die
Basis.

### Offen (Grund · Messname · Adresse)
- **Glied 2, der Wildwechsel im Boden — offen, 0 %.** Grund: EIN Hirsch tritt je 0,5-m-Zelle höchstens 2-mal in 7 Tagen (sMax 2),
  das Tritt-Gesetz braucht ≈ 27,7 Tritte bis zur Pfad-Stufe, und Tritte schreibt die Welt nur im Umkreis ≈ 173 m des Spielers. Ein
  Folge-Term (der Weg der Herde folgt dem Pfad, Helbing) gemessen ohne Wirkung (sMax 1–2, Hülle 0,72 statt 0,82) und gefallen.
  Messname `pfadZellen` · `sMax` · Adresse stamm/siedlung-wege.js TRITT / `_trittReichweite`, stamm/kreatur-leben.js
  `_kreaturWanderZiel`. Das Bild „Pfad zur Tränke im Boden“ steht damit nicht — das SVG zeigt die Bahn, nicht den Boden.
- **Die Lebensdauer:** das Individuum lebt 0,63 Spieltage (`lebensdauerS` 2 265 s, leben-core.js); die 7 Tage gibt es nur im
  stillgestellten Feld der Probe. Der Kandidat hält die Sperre der alten Station benannt (`nicht` solange tageLeben < 7) — S3
  bleibt ungebucht. Messname `lebensdauerTage` · Adresse leben-core.js `lebensdauerS` / stamm/kreatur-leben.js `_bestandTakt`.
- **Der Ausreißer:** einmal 0,404 km² (47 % ziehen) direkt nach dem Methoden-Tausch der Werkbank, in 14 späteren Wochen nicht wieder.
  Messname `km2` · `gezeigtS.ziehen`.
- **Das Durst-Ziel an der Wand:** das Tränken-Ziel trägt `rest: Infinity` und endet erst am Trunk; versperrt eine Wand den letzten
  Schritt, steht das Tier. Nach dem Hang-Schnitt fing der Hänger-Fänger (ziehen ≥ 50 Prüfungen am Stück) in 8 Wochen keinen; vorher einen am Hang.
  Adresse `_kreaturWanderZiel`.

Karte 2 gebucht: 137 von 1 718 · ZWISCHENSTAND
