# vp-0611b — GTX-Bild-Vorprüfung vor z246 (OMEN, GTX 1060, 06.11. 02:37–02:50)

Verglichen wurde main bca0d3d7 mit dem Kandidaten 32303b3b. Der Kandidat ist main plus `merge --no-edit` von w13-haus-alter a539cd5f, w13-bach-klar 2d04d714 und w13-jung-gestalt 2fea76d4 (Octopus-Merge, konfliktfrei). Je Seite lief eine warme Welt (`werkbank start --echt`); den Wasser-Teil habe ich danach mit der Kamera vor der Bühne neu gefahren, je Seite wieder in einer warmen Welt. In jedem Bild-Paar steht links main, rechts der Kandidat. Ich habe jedes Paar selbst angesehen. Die Pixel-Abstände stehen in `diff.txt`: mAbs ist die mittlere |ΔLuma| des ganzen Bilds, mΔ das Vorzeichen-Mittel.

## Urteile

- **w13-haus-alter a539cd5f GRÜN.** Die Alterung ist oben sichtbar, aber schwach.
  - Nach dem 30-Tage-Sprung (wie bei stoffe.K4#1) trägt das nahe Dach im Kandidaten einen grauen, feinkörnigen Belag, main ist dort blau und sauber (`haus-alt-neu-30tage.jpg`).
  - Am Dach von oben: Kandidat mΔ +0,19 gegen main −0,01 (`haus-oben-30tage.jpg`, `kand-haus-oben-alterung.jpg`).
  - An der Nordseite ist keine Alterung messbar: Kandidat mΔ +0,02 gegen main −0,08, also Rauschen. Der Sprung ist trocken (sonnig), darum wächst kein Moos.
  - Nichts ist fleckig, nichts flimmert: Dorf Ego und Third sind bis auf Bewohner und Rauch gleich.
  - CPU-Takt am Dorf (lauf 20 s, n = 1 je Seite): p95 15,2 ms am Kandidaten gegen 15,7 ms am main, p50 8,95 gegen 9,63; Frame-p95 25,1 gegen 25,2. Nicht langsamer.
  - Offen: Ob frische Bauten ohne Alter bleiben, ist im Bild ungeprüft. Das nach dem Sprung gesetzte Haus meldete `_archIsRendered` false.
- **w13-bach-klar 2d04d714 GRÜN.** Der Bach ist klar (`bach-unter-stromab.jpg`, `bach-unter-stromauf.jpg`).
  - Unter Wasser am Bach −309,8/−822,5 (0,35 m unter dem Spiegel 26,34): β 3,5 → 0,2 /m, also Sicht ~1,1 → ~19,5 m.
  - Das Bild am main ist grüner Nebel, am Kandidaten sind Sohle, Ufer und Schilf zu sehen; mittlere Luma 65,9 → 94,5.
  - Der See 1816/−6168 bleibt gleich. Unter Wasser: β 0,25 auf beiden Seiten, mAbs 0,000, 0,03 % der Pixel ungleich (`see-unter.jpg`). Von oben: mAbs 0,005 (`see-oben.jpg`).
  - Der Bach von oben ist pixelgleich (`bach-oben.jpg`).
  - Der Fluss ist nicht klarer: `WASSER_GESETZ.koerper.fluss` ist in beiden Bäumen byte-gleich. Ein Bild davon fehlt, weil die Suche binnen 7 km der Mess-Wiese keinen Lauf der Art fluss fand.
  - Offen: In meinen zwei Blicken stand kein Fisch im Bild. Die Zahl 9 von 16 bleibt die der headless-Station.
- **w13-jung-gestalt 2fea76d4 GRÜN.** Ich sehe keinen Bruch.
  - Der Waldrand der Mess-Wiese −256/−1082 ist bildgleich (mAbs 0,51 gegen das Rauschen der Gegenprobe 0,60). Ausgewachsene Bäume sind unverändert, kein 40-m-Riesenhalm (`jung-waldrand.jpg`).
  - Offen: Brand und Sukzession habe ich in der Bühne nicht gefahren. Den Jungwuchs selbst in seiner Kohorte zeigt kein Bild; ihn trägt die Station stoffe.K5#2.
- **Gegenprobe Welt, gleich:** Luma Wiese 10 Uhr 82,06 ↔ 82,04 (mAbs 0,60), Genesis 10 Uhr 103,56 ↔ 103,54 (mAbs 0,22) (`wiese-10uhr.jpg`, `genesis-10uhr.jpg`).

Rohdaten und Treiber auf der OMEN: `p3/n0611/vp/{main,kand,main-w,kand-w}` und `p3/n0611/vp-bild.cjs`.
