# GEGNER des Entwurfs „Stufe · Stoff · Zeit“ (Opus-Leser, 19.11.; gelesen am Baum b7ed8419, nicht am bestellten dabd69bb)

Urteil vorab: Kein Teil fällt ganz. Das Stufen-Gesetz bekommt eine Größe dazu (Wurf und Funktion je Stufe) und eine neue Reihenfolge.
Das Stoff-Gesetz bekommt drei Größen dazu. Bei der Zeit ist die Quelle falsch (Stadt-Jahr statt Objekt-Jahr), und es fehlt ein
Leser (das Zugtier). Das Soll des Spikes hat zwei Zeilen, die nie rot werden können.

## 1 Stufen-Gesetz: `d_k = e · f / px · g`, ohne `max(…, Haushalt)`
R1 Der Wurf hängt an der Stufe. Der Riss ist schwer und bringt eine Größe dazu. `schatten` ist „die werfende Stufe (L2 wirft
   nicht)“ (fachwerk-core.js:81, Zeilen :115–140, :7658–7662), dazu `_archGroupCastsShadow` (siedlung-bauten.js:1849–1852: `_lod2` wirft nie).
   Nachgerechnet an LOD_SCHIRM.fehler.haus (vegetation-streu.js:2914–2947) mit f = 703,7: Bei **15 von 32** Häusern rückt L2
   unter 12 m (heute ab 26 m). Barock L2 steht schon bei 2,0 m (e 0,0029). Diese Häuser verlören ihren Schatten im Nahfeld.
   `e` ist ein Kanten-Versatz im Farbbild (vegetation-streu.js:2881–2885) und sieht den Verlust des Wurfs nicht.
   Schnitt: Jede Zeile `fehler` bekommt eine zweite Zahl, den Wurf-Versatz (Schatten-Kanten in px). Die Grenze ist das Maximum aus
   beiden. Sonst gilt: erst den Wurf von der Stufe trennen (`schatten` als eigene Distanz), dann den Haushalt streichen.
R2 Der Haushalt hält eine Funktion und ist nicht nur Kosten. Das ändert die Reihenfolge. Das Gesetz sagt es wörtlich: „die Nähe, die
   die feinere Stufe hält — die Tür des Tors lebt in seiner L0“ (vegetation-streu.js:2965–2966). Die Behauptung des Entwurfs, der
   Meter-Haushalt sei „keine Stufen-Größe, sondern Kosten“ (§1), ist damit widerlegt. Gemessen wird außerdem in der Fern-Pose mit
   geschlossenen Türen (:2883). Am Gerittenen hält eine eigene Wand Stufe 0 (koerper-fahrt.js:1213, „die Geritten-Wand“).
   Die Vorhersage des Entwurfs (1-px-Abstand 0,24 m) hieße: Diese Wand verschwendet 21 400 Dreiecke, oder `e` misst das Falsche.
   Wahr ist das Zweite, denn Innenraum und Lack-Normalen zeigen sich in keiner Fern-Silhouette.
   Schnitt: Jede Art nennt ihre Funktions-Stufe (Tür, Sitz, Ritt) als Zeile `haelt`. Erst danach fällt der Rückfall 12/26.
R3 Die Grundannahme „Versatz skaliert mit 1/d“ widerspricht der eigenen Quelle. Das ändert die Reihenfolge: erst messen. Dort steht
   „fern skaliert er nicht mehr mit 1 / d“ (vegetation-streu.js:2886). Gemessen ist nur der Versatz am Haushalt, was eine Untergrenze ist (:2885).
   Die Vorhersage für den Wagen (0,24 m, −67 % Dreiecke) ist also unbelegt und keine Rechnung.
R4 Der Wirt kann Dreiecke nicht senken. Der Schnitt „Neubau-Schleife im Wagen-Kern fällt, Kosten erzwingt der Wirt“ ist damit
   widerlegt. `budgetErzwingen` faltet nur Draws (foundry-bruecke.js:950–953). Liegen die Dreiecke über der Zeile, entsteht
   `bruch` (phyto-core.js:6572), und die Wand schlägt (gate:asset-contract). Die Schleife (vehicle-core.js:4903–4925) senkt das
   Detail-Gesetz `teil` je Kern. Das kann nur der Kern. Schnitt: Die Schleife bleibt. Auf der Liste der Klasse wird sie gestrichen.
R5 Feste Stufen-Schlüssel in Verträgen. Das fällt nichts und bestätigt nur „Stufen bleiben ganzzahlig, nur die Grenze ist stetig“.
   Die Goldens sind eingefroren je `rezeptId × seed × lod` (scripts/diag-vehicle-contract.cjs:7, :18, :36–38; cv:3). Die Identität im
   Mehrspieler trägt `{cx, cz, lod}` des Bodens (stamm/netz-identitaet.js:1676–1688). Die Kollision misst einmal je Eintrag, weil
   L0 und L1 auf 0,5 mm gleich messen (gelaende-kollision.js:1332–1333). Wer je eine stetige Gestalt baut, bricht alle drei.
R6 Ein Zwilling, den der Entwurf auslässt: Bewegung als Stufen-Größe. `bewegungMS` 1,4 und `_bedeutung` (vegetation-streu.js:2893–2894,
   :2903) verdoppeln die Bedeutung eines Leibs nach seinem Tempo. In `d_k` fehlt diese Größe. Sie kommt dazu (ein Faktor auf g)
   oder fällt offen. Bei fahrenden Wagen ist das wichtig, das ist der Fall der Schlieren.

## 2 Stoff-Gesetz: `{albedo, rauheit, metall, f0}` aus der Q1-Zeile
S1 `f0` aus `n` gibt es für Metall und Holz nicht. Das bringt eine Größe dazu. Kupfer, Eisen und Holz tragen `n = null`
   (schmiede-core.js, die Zeilen kupfer/holz in REIN). Das F0 von Metall ist farbig (komplexes n, k). Schnitt: Spalte `f0rgb`
   für jede Zeile mit `kind` „metall“, `f0` aus `n` nur für Dielektrika.
S2 Glas lässt sich aus den Größen nicht bauen. Das bringt eine Größe dazu. `transmission`, `thickness` und `attenuation` haben in den
   Kernen **0** Treffer. Glas ist heute Metall oder undurchsichtig (fachwerk-core.js:2091). Schnitt: die Spalte `absorb`
   (1/m, je Kanal) dazu. Ohne sie bleibt jedes Fenster und jede Scheibe der Fotorealismus-Lücke offen.
S3 Fell und Haut. Das bringt Größen dazu. `sheen` hat 3 Treffer in tetrapoda-core.js. Für Streuung unter der Haut gibt es keine
   Spalte. Schnitt: `sheen` und `streu` (mittlere freie Weglänge, m) als Spalten. Die Liste „Q8/Q9 fällt“ wartet auf sie.
S4 Ein Zwilling, den der Entwurf nicht nennt: `envMapIntensity` mit **32** Treffern (foundry, phyto, schmiede, vehicle). Das ist eine
   zweite Antwort auf „wie stark spiegelt die Umgebung“ neben `f0`. Gehört zur Klasse §2 und fällt in derselben Welle, sonst
   stellt der Lack weiter seinen eigenen Glanz.
S5 Das Soll „Holz-Rauheiten 8 → 1“ ist falsch gestellt und ändert das Maß. REIN trägt genau eine Zeile `holz` (Rauheit 0,84).
   Eiche geölt, rohe Fichte und Lackholz sind physikalisch verschieden. Soll: 8 Literale → 0, die Rauheit folgt aus
   Zeile × Schicht × Alter. Die Zahl der verschiedenen Werte ist kein Ziel.
Stichprobe Literale: gezählt mit `roughness:`/`metalness:` in *.js ohne vendor/scripts/spec: **116 / 119** (Blatt: 120 / 123).
   vehicle 37/37, fachwerk 29/28, schmiede 13/13. Die drei zusammen tragen 79 / 78. Die Abweichung kommt vermutlich von `=`-Zuweisungen.

## 3 Zeit: `jahr` = `erbe.jahr` der Stadt, EINE Quelle
Z1 Die Zeit ist schon eine Größe je Haus. Die Behauptung „HAUS liest baujahr 0-mal“ hält nur im Fenster fc:168–1800.
   `baujahr` steht **21-mal** in fachwerk-core.js (:3538, 3543, 3557, 4393–4511, 5922, 9621, 9785). Efeu < 1800, Holzstapel < 1890,
   das Band des Palas (:4393–4396). Eine Stadt mischt Baujahre. Schnitt: zwei Größen. `jahr` ist die Gegenwart des Orts (Leser:
   Wagen, Tracht). `baujahr` gilt je Objekt mit baujahr ≤ jahr (Leser: Stoff `seit`, Tragwerk, Alter). Wer das Stadt-Jahr nimmt,
   würde diesen Leser töten. Ob die Gegenwart `jahr` oder `jahr + spanne` ist (fc:3627 hanse 1560/140): unbelegt.
Z2 Ein dritter Zwilling Jahr → Epoche, den der Entwurf auslässt: `epocheImJahr` (fachwerk-core.js:4181, Leser
   siedlung-ort.js:1206) gegen `epocheAusJahr` (vehicle-core.js:4869) gegen `STADT_GRAMMATIK.zeit` (fc:4377 `bandVon`).
   Drei Achsen beantworten dieselbe Frage. Schnitt: EINE Achse im Ort-Gesetz, alle drei werden ihre Leser.
Z3 Das Zugtier hat keinen Leser. Das ändert die Reihenfolge. `epocheAusJahr(1560)` ergibt 1,97. Die Stufe ist `kutsche` mit
   `antrieb: "zugtier"` (vehicle-core.js:4772–4800). Der Kern baut die Deichsel (vehicle-core.js:2349–2361, 5000), aber kein Tier.
   `zugtier`/`gespann` steht in stamm/ **0-mal**. Mit dem Schnitt aus §3 rollt in der Hanse ein Karren ohne Pferd durch die Gassen.
   Schnitt: Vor der Zeit-Welle steht das Gespann als Komposit (tetrapoda-Leib an der Deichsel, wie der Fahrer `_kompositErbt`,
   siedlung-bauten.js:1836). Dazu kommt das Tempo des Gesetzes (vGang 2,3 m/s) in die Trassen-Planung.
Z4 Unbedenklich: Die Goldens (`buildInstance` ohne `epoche`) bleiben byte-gleich (vehicle-core.js:4846–4847, „heute“ formt nichts).

## 4 Der Spike: Prüfung des Solls
- „Wechsel mit Quelle d0/d1 69 → 0“: vorher messbar, kann rot werden. Es misst aber die Form des Codes, nicht die Welt (der Schnitt macht es grün).
- „Versatz ≤ 1,0 px, 69 von 69“: Für die 5 Wagen-Zeilen gibt es keine Linse. gate:haus-fern P misst nur Haus, Ausstattung und Tor
  (vegetation-streu.js:2887). Für 5 von 69 Zeilen ist das Soll nicht messbar.
- „Dreiecke nachher ≤ vorher“: **kann nie rot werden**. 58 von 64 Haus-Grenzen rücken nur näher (nachgerechnet: 1 L1 und 5 L2 liegen
  über dem Haushalt, alle anderen darunter). Weniger Dreiecke sind die Folge der Definition. Ersatz: die vorhergesagte Zahl mit Band
  (L0-Wagen im Blick, Wurf-Pixel je Haus), dazu als neue Zeile „Schatten-Pixel im Nahfeld nachher = vorher“. Die würde an R1 rot.
- „Frame p95 ≤ vorher + 0,3 ms“: Das Rauschen des GTX-p95 unter gleicher Bedingung ist nicht belegt. Ohne Referenzfahrt
  (Gedächtnis „Messung relativ“) ist 0,3 ms kein Richter.
- „Garage = Welt, 0,0 m“: kann rot werden, und zwar zu Recht. `_brennweite` liest die Höhe des echten Zeichenpuffers
  (vegetation-streu.js:2997–3001), und die Garage hat ihre eigene `cam.fov` mit `fovPlus` (worlds/garage/garage.js:608–612). Gleich
  ist sie nur bei `zeilen = 0`. Soll: Vergleich am Schirm des Solls, so nennen.

## 5 Stichproben der Blätter
- Brennweite 703,7 und „58 von 64 an 12/26 m“: **bestätigt** (Nachrechnung über die 32 Zeilen; niedersaechsisch L1 13,8 m;
  L2 hochhaus, pueblo, marokkanisch, japanisch, chinesisch).
- Wagen-Zeile L0 32 000 Dreiecke / 12 Draws, L1 10 600 / 10 (vehicle-core.js:49–50): **bestätigt**. 680 000 / 32 000 = 21,25.
- Literale 120/123: **Abweichung**, gezählt 116/119 (s. §2). `epocheAusJahr` mit 0 Lesern: **bestätigt** (git grep HEAD: nur
  Definition :4869, Kommentar :4760, Export :5025). „baujahr 0-mal“: **irreführend** (21 Treffer in fc, s. Z1).

## Unbelegt
Ob die Bauplan-Namen der Häuser `_lod2` tragen (der Wurf läuft über das Budget-Feld `schatten`). Das Rauschen des p95 an der GTX.
Ob die Gegenwart einer Stadt `jahr` oder `jahr + spanne` ist. Das wahre Gesetz des Versatzes über d. Kein GPU-Lauf, kein Bild.
