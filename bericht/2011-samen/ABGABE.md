# Abgabe Welle `samen-ein-baum` — EIN Samen-Baum, der Würfel je Los, je DSL-Op ihr Strom (OMEN GTX 1060, 20.11.)

**Kopf:** `samen-ein-baum` **60fb7c67d** (Vorprüfung, leer über dem Merge-Kopf e07bb72db), Probe-Tag `[gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:settlement] [ci voll]`. Davor kam die Heilung 9f70eaca1 (leer über a69426b28), siehe die nächsten beiden Abschnitte. Der erste Abgabe-Kopf war b0b898696 über dem Baum 1c574fb1b:
- die Welle 3e68a828a;
- Merge main 3da9d9ae9 (Kosmos) und Merge `ein-schreiber-wand` c16c528cc mit dem Register-Anker (151204179);
- die Prüfstand-Seite (fc148849f);
- drei Schnitte am Ort: Stand (6713f6d8f), Platz-Saum und C-K5 (24759f111);
- Merge main 31ea3847e (Wand, stein-ein-gesetz) und Merge main 3e362397e (z635: los-huelle-2, Zeit-Kalender, Vorab-Statik; V18.546.349).

Zweig ab main 92b7afd07. Ich stempele nicht. Roh liegt auf dem OMEN unter `p3/n1911/samen/`.

## Der Merge am Kopf 60fb7c67d (Wort des Koordinators 16:35)
- **e07bb72db** = a69426b28 + Merge main e0d37353c (z643: Sicht-Heilung der Frost-Wand, Streu-Gestalt, Abdruck am Takt, Takt T8; V18.546.352) 47b2439e3 + Merge `w28-laub-kante-5` 0d3f21c54. Der Inhalt ist der Heilung 9f70eaca1 gleich.
- **Der Konflikt** lag nur in `scripts/diag-ankunft.cjs`. Beide Seiten heilten dieselbe Wurzel D9 (der Mitspieler wählte auf dem Erdbau des Sprechers neu; die Laub-Kante maß 29,83 m, ich 2,03 m).
  - Der Kopf behält meinen strengeren Schnitt: Er räumt Erdbau, Ortwahl (`_ortPlaene`) und Zellen, und ein Erdbau, der nicht fällt, bricht beim Namen.
  - Dazu kommt ihr `st.worldMeta || {}`, und ihr Befund steht im Kommentar.
- **Am e07bb72db:** gate:ankunft mit Selbsttest grün (D9 ✅, `heil4/ankunft.log`), `check:vorab` grün. Die drei Probe-Tore fährt die CI-Probe am OMEN-Läufer.
- **Das Bildpaar** am Vorplatz von #508675, Tag 0,5. Das Haus ist ein Zunfthaus (haus_schwarzwald mit Portikus) im Start-Dorf am Genesis-Ort; Gerät GTX 1060 WebGPU.
  - **Die beiden Stände:**
    - vorher = e07bb72db ohne `ORT_GESETZ.schwelleM` (Schmierbaum n1911-kopf);
    - nachher = der Kopf;
    - dieselbe Pose (`p3/n1911/samen/vorplatz-bild.cjs`, die Posen des vorher-Laufs wörtlich).
  - **Die PNG:** `vorplatz-508675-{nah,weit}-{vorher,nachher}.png`, alle vier Abnahmen GRÜN.
  - **Die Zahl am Türpunkt:** Der Boden unter der Tür steigt von 91,114 auf 91,389 m (+0,275 m) — der Vorplatz trägt die Schwelle. 0,1 und 0,3 m davor sowie am Vorplatz liegt er an beiden Ständen auf 91,389 m.
  - **Das Bild ist pixelgleich:** Der größte Kanal-Abstand ist 1 bzw. 2 von 255, kein Pixel liegt über 8 (`png-diff.cjs`).
    - Der Schnitt liegt im Streifen von 0,075 m unter dem Türblatt. Nachher zeichnet er 133 (nah) bzw. 85 (weit) Dreiecke mehr, aber Türblatt und Zarge verdecken sie.
    - Sichtbar wird er daher im Stand des Bewohners (Zeile bewohner), nicht im Bild der Fassade.
  - **Die weite Pose** steht 1 m schräg neben der Türachse: Auf der Achse verdeckt die Säule des Portikus das Ziel (ROT „verdeckt von bauSatz in 1.08 m“, roh `heil4/bild/*-4-saeule`).
  - **Was ein Art Director noch als Laien-Arbeit sieht:** Die offenen Fensterflügel zeigen schwarze Leere statt eines Raums.

## Die Heilung am neuen Kopf 9f70eaca1 (Code-Check Lauf 44710772496 am b0b898696: ROT an 3 von 22 Gruppen, Probe grün)
Baum = 1c574fb1b + Heilung 304f06b0d + Merge main a71e06c72 (z640: saison-am-laub, stamm-decke-vorab; V18.546.351) 26930ad06 + der Verkehr im Schritt der begegnung (3175754f4, a69426b28). Der Entscheid je Zeile:

| Zeile | Entscheid | Schnitt | am b0b89869 → am Kopf |
|---|---|---|---|
| voll 1/18 Ankunft ❌ D9 | **Linse** | `diag-ankunft`: jeder Lauf auf demselben Grund. Nach jedem Lauf fällt, was er der Welt gab: Erdbau seiner Orte (`_erdbauOrtFaellt`), ihre Wahl (`_ortPlaene`), ihre Zellen. Der Mitspieler baute auf dem Erdbau des Sprechers und wählte dort neu (siedlung-k3-heil). | Dorf 0,19 m, ein Haus 2,03 m daneben → vier Akte am selben Grund byte-gleich 0,00 m; D9 ✅ 26 Häuser |
| voll 10/18 Kreatur 1 ❌ bewohner | **Welt** | fachwerk `ORT_GESETZ.schwelleM` 0,15: Die Platte des Vorplatzes reicht unter die Schwelle. Der Türpunkt lag genau auf ihrer inneren Kante, und dort gewann der Grund des Hauses. | #508675 (Schwarzwald, Schwelle 0,55 m) stand auf 91,114 statt 91,389, die Diele 0,64 m über der Sohle > Stufe 0,6, 18 Takte in der Wand → bewohner ✅ 77/77 Leiber, quote 1 |
| voll 8/18 Kreatur 3 ❌ zielplan | **Linse an das Gesetz** | `diag-kreatur-leben`: Die Probe fragt den Kern selbst (`tagesBindung`, 200 Samen je Mensch), wie oft das Gesetz eine Rolle ohne Fremden lässt (`gesetzLeer`). Eine leere Rolle ist nur dann der Täter, wenn das Gesetz die Leere unter 1 % macht. | Die EINE Scheune der Stadt liegt 95 m vom Herd ihrer Leute: nach dem Gesetz leer zu 0,117 (Schmiede 0,071, sonst ≤ 0,003) → zielplan ✅, 128 von 128 Menschen gefragt |
| voll 8/18 Kreatur 3 ❌ begegnung | **Linse** | `kreatur-mensch` begegnung: Ihr Schritt taktet den Verkehr wie `_gameLoopTick` (`_verkehrSchritt` davor, `_tickVerkehr` danach). Ohne ihn stand ein Wagen im Zustand „fährt“ still und hielt seine Querung für immer. Die Probe wartet, bis der Zeuge am Ort seines Weichens steht (`b.weichen.ort`), und geht den vierten Gang durch diesen Stand. | Der Zeuge #724672 wartete 3 600 Takte am Fahrbahnrand vor einem Wagen 25,5 m fort (vlong 1,915 m/s); der vierte Gang lief durch seinen alten Stand: 0,45 m, 31 Takte Berührung. Am main ging feld #617311 aus dem Weg (d 8,534 m): Die Zeile bestand, ohne zu messen. → fort 22,2 m, d 1,37 → 2,05 m, Berührung 0 |

### Tore am Baum a69426b28
- **npm run check** (`check:statik` mit 51 Gliedern `&& gate:haus-fern`): alle Glieder grün. Die Logs liegen in `tore-26930ad0/` (statik00–04) und `tore-3175754f/` (statik05–50 ohne 49, haus-fern 260 s, porta-, schmiede-contract, studio-vertrag, format-check). Glied 49 (`diag-taille`) lief am Gerät (`heil3/taille.log`, grün, 10 s mit dem Schloss).
  - Was sich danach noch änderte, liest kein statik-Glied (`kreatur-proben`, `kreatur-mensch`).
  - Die Glieder beim Namen: check:vorab (33 × `node --check`, samen-core zuerst) · diag-atlas⟲ · bump-version⟲ · diag-phyto-tree · diag-studio-uebergabe · diag-studio-huelle⟲ · diag-altlasten⟲ + Lauf · diag-koerper-kern⟲ · diag-profiband⟲ · diag-wasser-leben⟲ · diag-chunk-satz⟲ · diag-hoehlen-sicht⟲ · diag-kamera-treue⟲ · werkbank diaet/lauf/takt/latenz/eval/licht ×3/bild/wirt/abdruck · diag-ego-schatten⟲ · diag-takt-atem⟲ · diag-sicht-arbeit⟲ · diag-wetter-wache⟲ · diag-weltakt-wache⟲ · diag-blocker-netz⟲ · diag-kollision-bild⟲ · diag-fall-waechter⟲ · diag-brennglas-takt⟲ · diag-raum-tags⟲ · omen-messfolge · diag-stand-takt⟲ · diag-post-kette⟲ · diag-ziel-zensus⟲ · diag-kamera-laub⟲ · diag-verdeckungs-abfrage⟲ · diag-start-rezept⟲ · diag-apparat⟲ + Lauf · diag-vendor-anker⟲ · diag-betriebsgesetz · diag-sprache⟲ · diag-ci-deckung⟲ + Lauf · diag-taille · diag-kreuz-mass⟲ (⟲ = `--selftest`).
- **Die Linsen der roten Zeilen:**
  - gate:kreatur-takt: Teil 3 (begegnung, zielplan und 13 weitere) mit Selbsttest grün am a69426b28 (`heil3/kt-self-3.log`, `heil3/kt-3.log`).
  - Teil 2 mit Selbsttest (45 Täter) grün am a69426b28 (`heil2/r2/kt-self-2.log`, `heil3/kt-2.log`).
  - Teil 1 (bewohner) mit Selbsttest grün am 26930ad06 (`heil2/kt-self-1.log`, `heil2/kt-1.log`); die Zeilen seiner Proben sind am Kopf dieselben.
  - gate:ankunft mit Selbsttest grün (`heil2/ankunft*.log`).
  - fachwerk-contract grün (198 s), settlement `--selftest` (101 s) und `--nur-a` (196 s) grün; das Golden `siedlung.json` bleibt byte-treu (e564ab23 / b7a6e6ee).
- **Am Gerät** (je Lauf über `p3/gpu-lauf.sh`, `heil3/kette.txt`; auch die CPU-Linse fuhr unter dem Schloss, ein CI-Job hatte Vorfahrt):
  - gate:kreatur-leben 3 s
  - gate:haus-welt 1/2 540 s und 2/2 532 s; der Vorplatz liegt je Haus unverändert −0,36/−0,37 m unter der Diele
  - gate:settlement voll 270 s; GT auf dem Dorfweg 97,85 / 82,97 m wie vorher, Vorplätze 20/20 und 16/16, Sockel max 0
  - gate:welt-boot `--selbsttest`: Lauf 2 grün (`heil3/welt-boot-2.log`). Lauf 1 rot an EINEM Fall (offen 9)
  - diag-taille grün, 10 s mit dem Schloss

## Die Zahlen
| | main | Kopf |
|---|---|---|
| mulberry32-Leiber im Code (Wurzel · stamm · worlds · scripts) | 16 in 13 Dateien | **1** (samen-core.js) |
| Ein-Schreiber-Wand, Größe Samen (`gate:constitution`) | 141 Stellen in 24 Dateien (c16c528c) | **123 in 20** (gesamt am Kopf 280 in 89) |
| (a) Front eines Loses ±5 cm → ein ANDERES Haus anders (153 Lose, 306 Proben) | 267/306 ohne, Σ 466 Häuser | **299/306, Σ 68** |
| (b) Wiederholung byte-gleich | 5/5 | **5/5** |
| (c) ±1 cm → 0 andere Häuser | 283/306, Σ 285 | **304/306, Σ 6** |
| DSL: Orte nach einer Op, die mehr zieht, verschoben | 42/42 | **0/42** |
| Math.random im Sim-Pfad | 2 | **0** (beide Rückfälle brechen beim Namen) |
| Stufe 1 (nur der Generator zieht um): Züge mit Abweichung | — | **0 von 4,63 Mio.**; v1 128/128 Bau-Abdrücke byte-gleich |
| Auto-Dorf −4,−4: GT auf dem Dorfweg (gate:settlement O) | 71,03 m in 6,3 s | **82,97 m in 6,7 s** (vor dem Stand-Schnitt 1,83 m) |
| Auto-Dorf −4,−4: Sockel max | 0 | **0** (vor dem Platz-Saum 0,868 m, Slot 9) |

Roh: `messung-26baeab7/` (`loswurf-final.log`, `dsl-op-2.log`, `paritaet.log`, `v1-vm.log`, `stufe1-siedlung.log`). Die Wand: `constitution-vorher-c16c528c.log` ↔ `constitution-2.log`. Settlement: `gpu-15120417/settlement-voll-*.log`.

## Der Schnitt
- **samen-core.js** (`__samenCore`, §9-Gesetz-Kern): `mulberry32`, der EINE Leib; `mulberrySchritt`; `samenHash`, der EINE FNV-1a; `salzStrom`; `samenBaum(wurzel)` → `samen(pfad)`.
  - Er lädt vor jedem Kern in jedem Kontext.
  - Alle 15 Kopien rufen ihn mit unveränderter Saat-Formel.
  - Die Seite `__aw.html` des Asset-Prüfstands lud ihn nicht. gate:asset-contract riss dort beim Namen („der Samen-Kern fehlt“); fc148849f lädt ihn jetzt.
- **los-wurf** (fachwerk `dorfLayout`): je Los `samen('los:'+i)`, je Baum-Versuch `baum:<n>`. Der Brunnen weicht dem Zulauf der Wende.
- **DSL**: Der Same des Programms ist die Wurzel; jede Op zieht aus `dsl:op:<n>`.
- **FLUEGEL_WINKEL = 0,62**: der EINE Schreiber beider Flügel-Zeilen.
- **Der erste Leser im Spiel**: Das Auto-Dorf −4,−4 legte sich neu. Daran fielen zwei schlafende Gesetze des Orts; beide sind an der Wurzel geschnitten.
  - *Der Stand steht nie auf dem Weg* (fachwerk `standFrei`): Im Dorf fragte er keinen Weg. Ein Hauptweg lief über den Platz, und der GT steckte nach 1,8 m vor `marktstand_dorf`.
  - *Der Saum des Platzes liegt vor den Grundrissen wie jeder Weg*: Bisher lag die ganze Platte samt Saum hinter den Häusern. Auf der Fläche gewinnt der letzte Splat, also schnitt der Saum (y 42,05) den Rand von Slot 9 (42,92). Für den Torplatz gilt dasselbe.
  - Der Genesis-Ort bleibt byte-gleich, Slots und Wege bleiben gleich, je Platz kommt eine Kern-Platte hinzu (`platz/vergleich.log`).
- **Die Linse des Orts nennt den Täter beim Namen** (Gebot 10): den Bau vor dem steckenden GT; je Sockel Slot, Weg-Rand, Nachbar und den Splat, der den tiefsten Punkt deckt; beim Hänger von C-K5 den Zustand des Dorf-Zugs.
  - C-K5 misst den Ring jetzt am Ort des Vorrats, wie die Welt (`ort = w || i3`).
  - Die Ort-Wahl rückte den Vorrat 48 + 16 m; die Probe stand am Wunsch, und die Zelle erwachte nie (3 637 Takte).
- **Die Merges:**
  - Kosmos fällte den Würfel-Himmel.
  - `check:vorab` trägt jetzt `node --check samen-core.js`.
  - In los-proben und settlement stehen beide Proben nebeneinander: der Würfel je Los und die Brandwand B1.

## Goldens neu geprägt (beim Namen)
`spec/asset-contract/v6/golden/siedlung.json` (2 SHA) und `siedlung-lose.json`, am Kern beider Wellen:
- Die Lagen folgen dem Würfel je Los.
- An 2/120 rücken 8 Häuser um 0,066–0,178 m; das ist das Los-Gesetz von los-huelle-2.
- Stand und Platz-Saum bewegen kein Golden; 7/12 und 12345/6 waren vor dem Merge byte-gleich.
- Unberührt: v1 (132), v4, v5, v6 haeuser + ausstattung.

## Bildpaar (gleiche Posen, main 3e362397e ↔ Kopf 1c574fb1b) — `bericht/2011-samen/`
Die Bilanz: main 8/8, Kopf 8/8, fuge-offen 3/3, `fehler` [] (`gpu-1c574fb1/bild-*.log`). Die JPG haben q82, `<name>-main.jpg` ↔ `<name>-kopf.jpg`.

- **`b15-dachlandschaft-60m`** (Stadt 7/4750, Mitte): Straßen und Blöcke sind gleich. Die Lose der Mitte sind neu gewürfelt: Kuppelbau, Turm und Hofhaus tauschen ihr Los. Das ist der Würfel je Los als erster Leser.
- **`b02-reihe-gleicher-haeuser`** (Auto-Dorf −4,−4, Pose von main):
  - Das Dorf liegt am Kopf am Ort seines Vorrats, der Spieler steht bei −720/−922 statt −704/−880.
  - Die Häuser stehen beidseits des Wegs, der Stand neben dem Weg und nicht darauf.
  - Es sind 16 Häuser mit denselben Rollen.
- **`b10-kein-hof`** (feste Pose −688,9/−848,0): main sieht die Wand des alten Dorfs, der Kopf einen leeren Hang. Das Dorf ist gerückt, nicht verloren.
- **`b07-ferne-stadt-260m`**: Die ferne Stadt steht.
- **j1–j4** (Gelenk 712412↔400335): Der Bau rückt mit dem Los 0,37 m (804,81 → 804,44).
- **fuge-offen j1–j3** (665720↔961288): Das Paar trägt am Kopf die offene Fuge (Ehrlich offen 1).

## Tore am Kopf 1c574fb1b
- **Code-Check, Node: 59/59 grün, 1003 s** (`tore-1c574fb1/ZUSAMMEN.txt`). Darin:
  - `check:vorab` und check:statik 00–50, ohne diag-taille; die läuft am Gerät;
  - fachwerk-, porta- und schmiede-contract;
  - settlement `--selftest` und `--nur-a`;
  - haus-fern (273 s), studio-vertrag und format-teile.
- **Probe am Gerät: 10/10 EXIT 0** (je Lauf über `p3/gpu-lauf.sh`, eine Kette, `gpu-1c574fb1/kette.txt`). Die Laufzeiten:
  - gate:welt-boot 87 s
  - gate:asset-contract 1656 s
  - gate:settlement voll 504 s
  - gate:haus-welt 1/2 758 s und 2/2 725 s
  - gate:kreatur-leben 138 s
  - gate:pflanzen-nah 18 s (31 Fälle)
  - gate:taille 7 s
  - gate:wasser-leben 405 s
  - gate:werk-im-wasser 352 s (Selbsttest und Lauf)
- **Gegen main 0e93ca0c7** (V18.546.350, register-gang-frisch und welt-boot-profil-taeter): Der Probe-Merge geht sauber durch, ohne Konflikt. Danach tragen alle 83 `?v=` in `index.html` 18.546.350, auch `samen-core.js`. Ich habe ihn wieder abgebrochen; der Kopf trägt ihn nicht.

## Ehrlich offen
1. **Die 0,70-m-Fuge fällt NICHT mit dem Würfel.** An Stadt 7/4750 (3 × 3 Kacheln) zählen Fugen von 1 cm bis 1,0 m main 325, Kopf 323 (`fuge-final.log`).
   - Die Wurzel beim Namen (`fuge-diag.log`): Der Reihen-Snap entscheidet an `dims.W`, nicht am Körper. 230 Paare sieht er nie; 80 öffnet die Kette wieder.
   - Ein Prototyp bringt 325 → 19–30, bricht aber 4 Gesetze von gate:settlement Teil A. Er liegt außerhalb dieser Abgabe (`fc-fuge-prototyp.js`).
   - Die Bilder fuge-offen j1–j3 (665720↔961288) zeigen ein Paar, das die Fuge am Kopf trägt.
2. **Rest-Proben des Wurfs:** Die 7 + 2 kippen am Setz-Gesetz, nicht am Würfel (7/60 Los 10 −5 cm: 41 Häuser; die Kirche als Anker).
3. **Die übrigen Generatoren bleiben**, benannt in der Ratsche der Wand: `_samenStrom` (LCG des Stamms), die LCG und xorshift von fachwerk, foundry `__streuGeo`, die Ströme von phyto, die FNV-Kopien, klang-core.
4. **Ein Felsbogen wackelt.** An 1 von 5 Settlement-Läufen am Zweig stand ein `felsbogen` (Wahrzeichen der Chunk-Vegetation, Spawn-Schlange) auf dem Grund des Auto-Dorfs; main 0 von 1.
   - Die Räumung (`_naturRaeumen`) räumt nur Grundriss und Weg, die Probe zählt den ganzen Grund (`!_ortFrei`).
   - Nicht geschnitten.
5. **haus-fern** am 980bf4887: Der 1. Lauf starb nach 28 s ohne Meldung neben einem GPU-Lauf, der 2. Lauf war grün (285,6 s).
6. **`npm run check`** am Kopf: kein Glied steht offen, aber ich habe es nicht als EINEN Aufruf gefahren. `diag-taille` ist ein GPU-Lauf und fuhr über `gpu-lauf.sh`, die übrigen Glieder liefen einzeln (oben unter „Tore am Baum a69426b28“).
7. **Der Takt der Leute geht in den übrigen Proben ohne Verkehr** (`kreatur-proben` `leute`: bewohner, zielplan, kreatur-leben). Ich habe ihn dort probeweise mitgetaktet; dann fiel bewohner rot an Befunden des Verkehrs, die nicht diese Heilung sind:
   - 72 978 Takte „in einer Wand“: die Fahrer am Steuer im Leib ihres Wagens, Limousine #828625280 und #302931469;
   - Soll-Orte der Fahrer #952 und #617311 zu 48–53 % (Soll ≥ 90 %);
   - 4 Berührungen (#731592 um 8,34 Uhr, #619833 um 8,47 Uhr);
   - 2 Gänge nicht über die Tür (#952 an haus_schwarzwald #809070).
   Die Linse der Leute kennt den fahrenden Wagen noch nicht. Die Klasse ist benannt offen, im Code an `leute` (`heil2/r2/kt-1.log`).
8. **Wer am Fahrbahnrand wartet, macht dem Spieler keinen Platz.** `_verkehrVorrang` setzt das Tempo auf 0 und überschreibt dabei das Ausweichen vor dem Spieler. Am b0b89869 stand der Zeuge so im vierten Gang: 0,45 m, 31 Takte Berührung. Im Spiel fährt der Wagen in Sekunden vorbei. Nicht geschnitten.
9. **welt-boot `--selbsttest`, der Fall „Tod der Seite (Absturz)“, flackert.** Lauf 1 am a69426b28 kam nach 20 min Warten hinter einem CI-echt-Job. Er sah statt des ABSTURZ nur STILLE nach 40 s (`heil3/welt-boot.log`). Lauf 2 nannte den Absturz nach 2,0 s beim Namen (0xc0000005, Abbild in `anazh-absturz`). Der Fall liegt nicht am Schnitt dieser Welle; die Ursache ist nicht gesucht.
