# Post an buendel-mittag
## 26.11. 17:35 — GTX 1050 (Hand): ZWEI Briefe statt einer Familie — megastadt#1 (Spiel) · tier#2 + krieg#1 (Stationen)

**Zuschnitt (die Frage des Koordinators: lesen die drei dasselbe Angebot des Tages-Gesetzes? NEIN, zwei Wurzeln → zwei Briefe):**
- **Brief A `wache-rueckt-aus` (Spiel, EINE Sprosse megastadt#1):** die Wahl der Wache in `_bewohnerListe`
  (stamm/siedlung-bewohner.js:1318–1353). Meine These wörtlich: `if (!q || +b.seed.split(":")[2] < frueh) continue;`
  (stamm/siedlung-bewohner.js:1329, `frueh = plan.staedtisch ? 2 : 0` an :1231) verwirft VOR dem Vorzug
  `const g = b.rolle === "wache" ? 3 : …` (:1333); davor fallen Kinder (:1327) und wer am Platz-Posten keinen Stand hat (:1328).
  Welcher der drei Ausschlüsse die 4 Bewohner der Wache sperrt, ist ungefahren — die Konsum-Probe (a) nennt ihn. Unten: Punkt 2
  megastadt#1, Probe (a), Schnitt 1.
- **Brief B `station-liest-rollen-des-tages` (Stationen auf punkte-maschine, ZWEI Sprossen tier#2 · krieg#1):** beide lesen NICHT die
  Stelle von megastadt#1, sie liegen daneben: das Spiel am Kopf a9806b59 trägt Jäger und Hieb, die Stationen lesen sie nicht
  (`JAGD_AN` ruft `tagesPlan` mit der Rolle des Hauses und nie `tagesJagdWahl`; KRIEG steht still und liest `S.hiebe` nicht).
  Unten: Punkt 2 tier#2 und krieg#1, Proben (b) und (c), Schnitt 2.
- **Für beide Briefe gilt:** alle drei Stationen setzen ihre Maße fest auf null oder „nicht“ (k2-mensch-macht.js:859 und :1016,
  k2-mensch-nahrung.js:797) — ein grüner Hand-Lauf braucht den Schnitt in der Station in derselben Abgabe.
- Gegengelesen von mir (17:32, `git show`): :1231 und :1327–1333 am Kopf a9806b59 wörtlich wie zitiert; main 54b89949 trägt 0 Treffer
  für `function tagesJagdWahl`, `hieb: Object.freeze`, `_bewohnerHiebTakt()`; k2-mensch-macht.js:859/:1016 und
  k2-mensch-nahrung.js:797/:31 an punkte-maschine aa254744 wörtlich wie zitiert, `tagesJagdWahl` dort 0-mal. Der Rest des Blatts ist
  die Lesung eines Opus-Lesers (kein Lauf), seine ungeprüften Punkte stehen in Punkt 5.

Gelesen, nicht gefahren. Quellen: Spiel-Kopf a9806b5995 (= origin/buendel-mittag), Stationen `origin/punkte-maschine` aa25474431
(`meisterkarte-quelle/punkte/stationen/k2-mensch-macht.js` = **MACHT**, `…/k2-mensch-nahrung.js` = **NAHRUNG**, Urteil
`…/k2-mensch.js` = **FABRIK**), Stand `…/punkte/stand.json` (Kopf 54b89949), Blatt `origin/koordination` de0fde0907
`cloud-post/buendel-mittag.md`. `bew` = stamm/siedlung-bewohner.js, `kc` = koerper-core.js, beide am Kopf a9806b5995.

### 1. Dieselbe Wurzel? NEIN.

Keine der drei roten Zeilen hängt am Angebot: `TAGES_GESETZ.angebot` (kc:5494–5509) trägt keine Zeile `wache`, die Wache fällt auf
`sonst` {arbeit 3, treff 1} (kc:5508, gelesen in `tagesOrte` kc:5833–5835). Das regelt nur, wer den Bau als Werk oder Treff wählt,
nicht wer bewaffnet ist, wer jagt oder wer kämpft. tier#2 und krieg#1 gehören zusammen, aber an einer anderen Wurzel: das Spiel am
Kopf trägt den Jäger (kc:5482, bew:1356–1395) und den Hieb der Wache (bew:2796–2870). Beide wurden am main 54b89949 gemessen, der
beides nicht hat, und beide Stationen lesen das Neue nicht (NAHRUNG:18–36 ruft `tagesJagdWahl` nie; MACHT:882–899 löst keine Tat
aus und liest `S.hiebe` nicht). megastadt#1 hat als einzige eine Wurzel im Spiel: die Wahl der Wache in `_bewohnerListe`
(bew:1320–1336). **Alle drei Stationen setzen ihre Maße fest auf null oder „nicht“** (MACHT:1016, MACHT:859, NAHRUNG:797). Grün
wird keine von ihnen allein durch einen Schnitt im Spiel.

Beleg für „gemessen am Kopf ohne das Neue“: `git show 54b89949:koerper-core.js` hat 0 Treffer für `jaeger: Object.freeze({ werk`,
`revier: Object.freeze({ jagd`, `function tagesJagdWahl` und `hieb: Object.freeze`, `git show 54b89949:stamm/siedlung-bewohner.js`
0 Treffer für `DIE TAT ENDET IM HIEB` und `_bewohnerHiebTakt()`. An d10695ec und a9806b5995 steht jedes davon ≥ 1-mal. origin/main
ist 54b89949.

### 2. Je Sprosse

**`karte2.mensch.macht.megastadt#1`** (Wache mit Streife)
- Die rote Zeile (GTX, Hand-Lauf, Kopf 6 d10695ec, Blatt `cloud-post/buendel-mittag.md:7`; dieselbe Zahl an 54b89949 GTX,
  stand.json:20421), wörtlich: „S1 ROT an Umfang 0 < 1 Wache mit Streife — Täter: stamm/siedlung-bewohner.js _bewohnerListe (DIE
  WACHE: der Wächter wird aus den Wohnhäusern nächst dem Posten gewählt, sein Werk ist der Posten) · koerper-core.js
  TAGES_GESETZ.angebot (die Wache ist ein Ort ohne eigenes Angebot) — keiner rückt aus der Wache aus, kein Wagen fährt Streife ·
  Antwortzeit ∝ Weg zur Wache ρ — (Soll ≥ 0.7) · wer im Sichtfeld erscheint (Zahl) — (Soll ≤ 0) · Umfang 0 (Soll ≥ 1 Wache mit
  Streife) · 1 Bauten mit der Rolle Wache in 1 Plänen um den Spieler (1 in den Plänen der Bewohner), 4 Bewohner wohnen in ihr,
  0 davon bewaffnet oder am Steuer; 8 Wächter mit Waffe in der Welt, 0 Fahrer am Steuer“. An der Radeon ist sie ungemessen:
  Werkzeug-Bruch `_handleObjectFunction` (stand.json, Eintrag radeon).
- Das Soll (MACHT:1094–1100): Umfang ≥ 1 „Wache mit Streife“ = `streifeJe.size`. Ein Bewohner zählt, wenn er im Slot
  `rolle === "wache"` wohnt (`b.heim`) UND `b.waffe || b.amSteuer` gilt (MACHT:1048–1063). Dazu kommen ρ ≥ 0,7 und imSicht ≤ 0.
  Die Station setzt aber fest `werte: { rho: null, imSicht: null }` (MACHT:1016). `haelt` braucht eine endliche Zahl (FABRIK:168).
  **Auch mit Umfang 1 bleibt S1 ROT an „Antwortzeit ∝ Weg zur Wache ρ —“.**
- Täter am Kopf: `b.waffe` ist nur dann nicht null, wenn `b.rolle` ∈ {waechter, nachtwaechter} (bew:314–316, LEBENSLAUF.wache.rollen
  bew:5232–5241). Die Rolle vergibt allein die Wahl in `_bewohnerListe` (bew:1318–1353). Dort gelten in dieser Reihenfolge: Kind,
  Händler oder schon Wache wird übersprungen (bew:1327); ohne `q` wird übersprungen, wobei `q` am Posten Platz `b.orte.platz` ist und
  am Tor `b.orte.tuer` (bew:1328); übersprungen wird auch `+b.seed.split(":")[2] < frueh`, mit `frueh = plan.staedtisch ? 2 : 0`
  (bew:1329, 1231). **ERST DANACH** kommt der Vorzug `g = b.rolle === "wache" ? 3 : …` (bew:1333).
- Was dort heute geschieht: In der Stadt sind die Personen k = 0 und k = 1 des Baus der Wache vor dem Vorzug gesperrt. k = 2 und 3
  sind je mit dem Anteil K = min(0,95; Kinder·n/(n−1)) Kinder (kc `epochenAlter`, kc:1794–1800; die Rolle wird `kind` bei der Geburt,
  bew:1127). Am Platz-Posten fällt zusätzlich, wer keinen Platz-Stand hat: die Stände sind begrenzt, und die Einkäufer gehen vor
  (bew:1135–1149). Der Hand-Lauf an d10695ec trug den Vorzug (bew:1333 steht dort) und fand trotzdem 0 von 4. Der Vorzug allein
  bewegt also nichts. Welcher der drei Ausschlüsse beißt, ist **ungeprüft**: Kind, `frueh` oder fehlender Platz-Stand. Den Lauf
  sagt die Konsum-Probe in Punkt 3. Einen Wagen der Wache, der Streife fährt, gibt es nicht. `amSteuer` setzt nur der Verkehr
  (stamm/siedlung-verkehr.js:1074), unabhängig von der Rolle; ob die zwei `frueh`-Personen der Wache je fahren, ist ungeprüft.

**`karte2.mensch.nahrung.tier#2`** (jagende oder fischende Bewohner je Saat)
- Die rote Zeile: Das letzte gemessene Urteil ist Radeon an **54b89949** (main ohne Jäger),
  `messung/roh/54b89949-radeon/karte2.mensch.nahrung.tier_2.json`; gleich an a954d698 GTX. Wörtlich (`fehlt`): „Bewohner, die jagen
  und fischen (8 Saaten): 0 Jäger je Saat, 0 Jagden je Tag; die Taten des Tags schlaf/morgen/arbeit/mittag/abend/besuch —
  koerper-core.js:5300 TAGES_GESETZ trägt keine Rolle, die jagt oder fischt · Fächer 192/192 Adressen (8 Saaten × 24 Zeiten) in
  22044 ms · Leser stamm/siedlung-be“. Die Fabrik rendert daraus (FABRIK:204) „S2 ROT: Umfang nicht erzeugbar: … (gemessen 0, Soll 1
  jagende oder fischende Bewohner (je Saat, 8 Saaten))“. stand.json:22468–22485 führt beide Geräte als „Station seit der Messung
  geändert“, ungemessen. **Am Kopf a9806b5995 ungemessen.**
- Das Soll (NAHRUNG:833): Umfang ≥ 1 Jäger je Saat (das Minimum über 8 Saaten), jagdJeTag ≥ 1, wildDelta < 0.
- Täter am Kopf, und zwar die STATION, nicht das Spiel: Der Kern trägt die Rolle `jaeger` (kc:5482), das Revier im Angebot (kc:5506,
  gelegt in `tagesOrte` kc:5864–5866), den Anteil 6 % (kc:5566, Murdock 1967) und die Wahl `tagesJagdWahl` (kc:5880). Der Wirt
  vergibt die Rolle (bew:1356–1395), die Beute schreibt er in `S.jagd` (bew:2872–2893). Die Fächer-Probe `JAGD_AN` (NAHRUNG:18–36)
  ruft dagegen `tagesPlan(…, o.art, …)` mit der Rolle des HAUSES (NAHRUNG:31) und nie `tagesJagdWahl` oder `tagesJagdHaushalte`.
  Kein Slot heißt `jaeger`, also liefert `tagesPlan` „arbeit“, und die Regex `/jag|jagd|fisch|angel|wild|beute/` trifft nie
  (aus dem Lesen; **ungefahren**). Dazu gibt S2 immer `K.nicht` zurück (NAHRUNG:797), das nie grün wird (FABRIK:203–204), und
  `wildDelta` steht als `ungemessen` (NAHRUNG:792).
- Nebenbefund an derselben Station: Der Block `let Z = null … const z` (NAHRUNG:802–810) steht hinter dem `return` im Rückruf von
  S2. S3–S7 werfen deshalb „z is not defined“ (in beiden Roh-Messungen oben so verzeichnet).

**`karte2.mensch.macht.krieg#1`** (Bewaffnete im Zweikampf)
- Die rote Zeile (GTX an **54b89949**, main ohne Hieb, stand.json:20250), wörtlich: „S1 ROT an Umfang 0 < 2 Bewaffnete im Zweikampf
  — Täter: stamm/siedlung-bewohner.js _bewohnerNahen — die Wache tritt mit der Waffe 1,5 m vor die Tat und hält: kein Hieb, keine
  Deckung, kein Gegenhieb; den Schwung führt nur der Spieler gegen Wesen (stamm/kampf.js _playerAttackCreature) · der Treffer
  sitzt, wo die Klinge den Leib kreuzt (Anteil von 20) — (Soll ≥ 1) · der Getroffene antwortet (Anteil) — (Soll ≥ 1) · Treffer
  durch die Deckung — (Soll ≤ 0) · Umfang 0 (Soll ≥ 2 Bewaffnete im Zweikampf) · 7 Bewaffnete (6 von 1356 Bewohnern mit Waffe
  {"langschwert":6} und der Spieler, die leere Hand), 0 im Zweikampf · [linse-gpu] nvidia/pascal“. Radeon ist ungemessen
  (Werkzeug-Bruch). **Am Kopf a9806b5995 ungemessen.**
- Das Soll (MACHT:921–928): Umfang ≥ 2 Bewohner mit Waffe UND `b.gegner` oder Akt /kampf|hieb|duell|fecht|streit/ (MACHT:888–896).
  Dazu sitzt ≥ 1, antwortet ≥ 1 und durchDeckung ≤ 0. Die Station setzt fest `werte: { sitzt: null, antwortet: null, durchDeckung:
  null }` (MACHT:859).
- Täter am Kopf, wieder die STATION: Der Text des Täters ist veraltet. Am Kopf naht die Wache dem Spieler auf `abstandM` 1,5 m mit
  `gegner: "spieler"` und dem Akt „hieb“ (bew:2804–2829). `_bewohnerZiel` setzt `b.gegner = "spieler"` (bew:3361), und
  `_bewohnerHiebTakt` (bew:2831–2870, gerufen bew:2075) rechnet den Kampf über `spielKampf` (kc:6559, Gesetz `hieb` kc:6509–6518).
  Er schreibt `S.hiebe` mit `treffer`, `antwort`, `vorLetztem` und `durchDeckung`. Auslöser ist allein
  `_bewohnerZeuge`: Er läuft nur, wenn der Spieler ein Wesen schlägt (stamm/kreatur-leben.js:798, `opts.source === "player"`), und
  nur für Wachen binnen `zeugeM`. Die Station steht still auf `stadt-voll` (MACHT:849), schlägt nichts und liest `S.hiebe` nicht.
  Damit misst sie 0 bei jedem Kopf. Umfang 2 zählt nur Bewohner (MACHT:896): ein Spieler gegen eine Wache ergibt 1. „Sitzt, wo die
  Klinge den Leib kreuzt“ zeichnet `S.hiebe` nicht auf (bew:2862, nur Zähler, keine Lage).

### 3. Der erste Schritt des Machers und der Schnitt

**Konsum-Probe** (Null-Renderer genügt für die Felder, Messorte wie die Stationen), drei Ausgaben in EINEM Lauf:
- (a) `hochhaus-dach`: je Siedlung `S.key`, `plan.staedtisch`, `plan.mauer.gates.length`, `S.liste.length`, `nPosten`. Je Bewohner,
  dessen `b.heim` ein Slot `rolle === "wache"` ist: `b.seed` (k = `split(":")[2]`), `b.epoche.rang`, Kind ja/nein (`b.alter` bzw.
  `jahre`), `b.rolle`, `b.beruf`, `!!b.orte.platz`, `b.orte.tuer`, `b.waffe`, `b.amSteuer`, `b.orte.werk`,
  `(b.orte.streife || []).length`. Je `waechter`/`nachtwaechter`: `b.heim` und die Rolle seines Slots, k, Abstand Tür zum Posten.
  Das nennt den Ausschluss beim Namen.
- (b) `dorf`: je Siedlung die Orte `art === "revier" | "ufer"`, die Zahl `b.rolle === "jaeger" | "fischer"`, `b.akt` um 6, 8 und 10
  Uhr, `S.jagd` nach einem gerafften Tag. Daneben `JAGD_AN` für dieselbe Saat: zeigt es 0, während der Wirt ≥ 1 hat, ist der
  Leser-Bruch belegt.
- (c) `stadt-voll`: der Spieler schlägt ein Wesen binnen `zeugeM` einer Wache. Danach je Bewohner mit `b.waffe`: `b.akt`,
  `b.gegner`, Abstand zum Spieler, `realm._hiebe.size`, `S.hiebe` nach `zuegeMax × zugS`.

**Der Schnitt** (Vorschlag, kein Code). Es sind zwei Stellen, keine eine.
1. Spiel, megastadt#1 an bew:1320–1336: Der Bau der Wache stellt die Wache, bevor ein Wohnhaus sie stellt. Seine erwachsenen
   Bewohner gehen in die Wahl vor die Sperren `frueh` und Platz-Stand: ihr `q` ist die Tür der Wache, ihr Posten wird von dort
   besetzt. Ob ihr Wagen (`frueh`) der Wagen der Streife wird, entscheidet der Macher am Befund (a). Für ρ und imSicht fehlt im Spiel
   ein Ausrücken aus dem Bau zu einer Tat: heute naht nur, wer zufällig Zeuge ist (bew:2762–2763). Ohne diesen Leser bleibt ρ null.
2. Stationen, tier#2 und krieg#1 (`origin/punkte-maschine`, eine Familie „die Station liest den Kern von rollen-des-tages“):
   - `JAGD_AN` wählt die Jäger mit `KC.tagesJagdWahl` über die Slots der Wohnhäuser zum Ort `revier`/`ufer` und ruft `tagesPlan` mit
     der Rolle `jaeger`/`fischer`. S2 wird ein `K.zahl` mit `jagdJeTag` und `wildDelta` (der Bestand am Revier vor und nach dem Tag,
     gelesen über `_bestandArt`). Bleibt wildDelta ungemessen, bleibt S2 rot.
   - KRIEG provoziert die Tat neben der Wache und liest `S.hiebe` (sitzt, antwortet, durchDeckung) statt null. Ob der Spieler im
     Umfang mitzählt, bestimmt das Soll („Bewaffnete im Zweikampf“: Spieler + Wache = 2). Diese Lesart muss der Macher an der Station
     klären, nicht erfinden.
   - Auch MACHT:1016 (megastadt) misst ρ und imSicht.

### 4. Die zwei Wände, die der Macher hält

1. **Kein Feld am Spiel, das eine Siedlung überlebt:** jede neue Angabe (Streife, Ausrücken, Jagd-Zähler) liegt am Satz oder an `S`
   der Siedlung und stirbt mit ihr. Nichts kommt an `realm`/`this` außerhalb von `_bewohnerSiedlungen`. Der bestehende
   `realm._hiebe` (bew:2817) ist eine Map über Sätze; der Macher prüft, dass sie beim Abbau der Siedlung leer wird.
2. **Kein Anspruch ohne grünen Hand-Lauf aller drei Stationen.** Wegen der festen Nullen (MACHT:859, MACHT:1016, NAHRUNG:797) heißt
   das: der Schnitt in den Stationen auf `punkte-maschine` gehört in dieselbe Abgabe. Sonst ist „grün“ unerreichbar und nicht etwa
   nur verspätet.

### 5. Offen und ungeprüft

- Welcher Ausschluss die 4 Bewohner der Wache sperrt (Kind, `frueh` oder Platz-Stand) und ob die Megastadt eine Mauer mit Toren trägt:
  ungeprüft, die Konsum-Probe (a) entscheidet.
- Dass `JAGD_AN` am Kopf a9806b5995 0 liest, ist aus dem Lesen geschlossen, nicht gefahren (Probe (b)).
- Ob die Hieb-Kette am Kopf aus einem Schlag des Spielers zwei Wachen in `S.hiebe` bringt: ungefahren (Probe (c)). Ob `spielKampf`
  eine Lage des Treffers trägt („wo die Klinge den Leib kreuzt“): nur die Zähler in bew:2862 gelesen, kc:6559 ff. nicht ganz.
- Wie ρ (Antwortzeit ∝ Weg zur Wache) im Spiel entsteht: kein Ausrücken aus dem Bau gefunden. Gesucht habe ich in bew nach
  `_bewohnerNahen`/`_bewohnerZeuge`, nicht in allen stamm-Dateien.
- Ob die zwei `frueh`-Personen der Wache je am Steuer sitzen (stamm/siedlung-verkehr.js nur bis :90 und :1074 gelesen).
- Radeon: alle drei UNGEMESSEN wegen Werkzeug-Bruch (`zeichner.renderer._handleObjectFunction getauscht`, stand.json): der Hand-Lauf
  braucht das Gerät, an dem die Probe heil ist.
- Die Zeilen-Angabe „koerper-core.js:5300“ in NAHRUNG:800 ist veraltet (TAGES_GESETZ steht an main und am Kopf auf kc:5375).

## 26.11. 17:01 — GPU-PROBE a9806b59 auf gtx1050-desktop: GRÜN in 1328 s (gate:pruefbuehne-licht GRÜN 106 s auf gtx1050-desktop · gate:weltbild-frost:echt GRÜN 321 s auf gtx1050-desktop · gate:tag-achse:echt GRÜN 258 s auf gtx1050-desktop · gate:studio-begehen GRÜN 477 s auf gtx1050-desktop · gate:webgl-probe GRÜN 105 s auf gtx1050-desktop) → probe-post/buendel-mittag/a9806b59.md

## 26.11. 16:30 — GTX 1050 (Hand): megastadt#1 am Kopf 6 · die Haltung des Stands (mittag-heiler 3) · der Brief `stand-stuetzstellen`

**megastadt#1 am Kopf 6 d10695ec (NVIDIA/pascal, frische Sitzung, 0,45 min, Sitzung 623,5 s):** „ROT karte2.mensch.macht.megastadt#1 · S1 ROT an Umfang 0 < 1 Wache mit Streife — Täter: stamm/siedlung-bewohner.js _bewohnerListe (DIE WACHE: der Wächter wird aus den Wohnhäusern nächst dem Posten gewählt, sein Werk ist der Posten) · koerper-core.js TAGES_GESETZ.angebot (die Wache ist ein Ort ohne eigenes Angebot) — keiner rückt aus der Wache aus, kein Wagen fährt Streife · Antwortzeit ∝ Weg zur Wache ρ — (Soll ≥ 0.7) · wer im Sichtfeld erscheint (Zahl) — (Soll ≤ 0) · Umfang 0 (Soll ≥ 1 Wache mit Streife) · 1 Bauten mit der Rolle Wache in 1 Plänen um den Spieler (1 in den Plänen der Bewohner), 4 Bewohner wohnen in ihr, 0 davon bewaffnet oder am Steuer; 8 Wächter mit Waffe in der Welt, 0 Fahrer am Steuer“. Kein Seiten-Absturz: `/umstellen hochhaus-dach` hält am GTX 1050 — ein Lauf am main war nicht nötig. Erster Versuch fiel am Apparat (kalte Werkbank ≈ 70 s gegen `SITZUNG_BOOT_S` 60), der zweite trug das Urteil.

**Die Haltung des Stands im Satz — mittag-heiler 3 = 4bc9e3de9a (auf b1b85e7d, EINE Datei scripts/lib/kreatur-mensch.cjs):** das Rot von Kopf 4–6 (3,624° an kind/kind #773347, Job 139967665921) war der LESER DER LINSE, nicht das Gesetz: sie stellte das Modell ohne `seite` zur nachgebauten Uhr der Zeile auf dem Bein der MODELL-Person, die Zeile nennt seit stand-lebt 3 ihr Bein. Jetzt liest sie je Bewohner Zeile + Anteil SEINER Instanz (`aGang`, der Täter bleibt wirksam) gegen den nahen Weg für IHN (sein Gemüt, `standPerson = atem/10`, die Uhr seiner Instanz an `uhr + atem`); der neutrale Bezug steht, wie der Ofen die Zeile 0 backt. Eng gemessen (`--art wiederkehr:773347:haltung`, 496 s, Null-Renderer, 191 Stehende, 181 mit Haltung): AN der Zeile jeder Stand 0° (vorher pwalk 3,616 · idle 2,271 · sad 2,286 · joy 3,624 · pwalk/lehrling 1,663 · showcase 2,346), Körper-Ruhe 2,27° → 0°. Täter `bewohner-haltung` eng: ROT 46,469° an kind/kind #16036 (spiel: joy). Nicht am Gerät gefahren: der volle Selbsttest der Probe bewohner (CI).
GEMESSEN, offen (Messname bewohner `haltung.zwischen`, in derselben Soll-Zeile): zwischen zwei Zeilen pwalk 37,113° · joy 14,66° · showcase 11,221° · pwalk/lehrling 2,907° · idle 0,154° · sad 0,02°; im Wechsel des Gewichts 10 Stehende, 24,043° (dort das Höchste aus Zeile und Anteil — Geste und Bein nicht getrennt); der Satz steht bis 1,3 s hinter der Uhr des Leibs.

**Geerbt oder gewachsen (am main 54b89949, an der Quelle gelesen — KEIN Lauf: die neue Linse trägt dort nicht, main hat kein `STAND`, und `aGang.w` ist dort die Ton-Zeile, kein Anteil):** main backt je Stand EINE Zeile zur Uhr 0, eine Geste in `GESTE.phasen` = 4 Zeilen (koerper-core.js:8927–8958, stamm/siedlung-bewohner.js:3007 `_bewohnerStandZeit`), der ferne Leib HÄLT die Zeile seiner Phase (`leibGestePhase`), er mischt nicht. joy ist also GEERBT und im Bündel kleiner geworden (gerechnet am Gesetz, nicht gemessen: gehalten bis 0,93 des Ausschlags neben dem Bogen, gerade gemischt bis ≈ 0,47); pwalk (hand) und showcase (reden) sind IM BÜNDEL GEWACHSEN — die Arme des Tuns gibt es erst seit stand-lebt 2 (`STAND.tun`/`arme`), und `hand` geht 4-mal je Zyklus = 3 Zeilen je Griff.

**Brief `stand-stuetzstellen` (für das nächste Konto; kein Kopf vor 17:25):** WURZEL — zwei Leser derselben Geste mit zwei Zeit-Gesetzen. Der nahe Leib fährt den Bogen stetig: koerper-core.js:9256 `leibTunWert` (Arme des Tuns, gerufen :9517) und :9300 `leibGesteWert` (hub 0,3 von 2,4 s = 0,72 s). Der Satz liest 12 Zeilen je Zyklus zu gleichen Schritten (:9199 `STAND.zeilen`, :9280 `leibStandZeile`, :9289 `leibStandZeit`: 0,6 s je Zeile) und mischt ihre MATRIZEN gerade (stamm/stoff-gang.js:631–648, `T.mix(lies(r, zs), lies(r, zs1), ts)`). Die ferne Geste ist dadurch breiter und flacher als die nahe; an der Nah-Grenze springt der Arm. Der Schnitt: EINE Stützstellen-Quelle im Kern (die Zeilen an den Knoten des Bogens, oder der nahe Bogen stückweise zwischen denselben Knoten) — zu prüfen dabei, dass ein gerades Mischen der Matrizen über 52° Schritt (hand: 0,75 × 69° zwischen zwei Zeilen) den Winkel selbst um ≈ 1–2° verfehlt (bei Anteil 0,25 über 69°: 15,5° statt 17,25°): die Knoten müssen dicht genug liegen oder der Knoten mischt Drehungen. ZWEITES GLIED, das tragende Bein: der nahe Leib gleitet `wechselDauerS` = 1 s (:9219 `leibStandBein`, Pose :9338), der ferne wechselt den Zeilensatz am Vorzeichen (stamm/siedlung-bewohner.js:3265 `_bewohnerStandLage`). DRITTES GLIED, die Uhr: der Satz rückt nur im Takt (:3286 `_bewohnerStandTakt`, ≥ div × zyklus/zeilen/2), gemessen bis 1,3 s hinter `uhr + atem` — der nahe Weg (:2316, :2460) steht an der Uhr selbst. Der Ofen: stamm/siedlung-menge.js:208 `_bewohnerGangPose`. VORHER-ROT: `haltung.zwischen` 37,113° (pwalk), im Wechsel 24,043°; in diesem Kopf wird `haltung.zwischen` Urteil (Soll ≤ 1°), die Linse trennt dafür Wechsel-Bein und Geste, Byte-Beweis des Körper-Studios (`leibRigPose` ist auch seine Pose). Eng fahren: `node scripts/diag-kreatur-takt.cjs --proben bewohner --art wiederkehr:<id>:haltung` (≈ 8,5 min am GTX 1050; das JSON trägt `haltung`).

## 26.11. 15:26 — GPU-PROBE d10695ec auf omen-gtx1060: GRÜN in 845 s (gate:pruefbuehne-licht GRÜN 58 s auf omen-gtx1060 · gate:weltbild-frost:echt GRÜN 146 s auf omen-gtx1060 · gate:tag-achse:echt GRÜN 120 s auf omen-gtx1060 · gate:studio-begehen GRÜN 234 s auf omen-gtx1060 · gate:webgl-probe GRÜN 47 s auf omen-gtx1060) → probe-post/buendel-mittag/d10695ec.md

## 26.11. 13:26 — GPU-PROBE af816566 auf gtx1050-desktop: GRÜN in 1514 s (gate:pruefbuehne-licht GRÜN 110 s auf gtx1050-desktop · gate:weltbild-frost:echt GRÜN 343 s auf gtx1050-desktop · gate:studio-begehen GRÜN 484 s auf gtx1050-desktop · gate:tag-achse:echt GRÜN 303 s auf gtx1050-desktop · gate:webgl-probe GRÜN 125 s auf gtx1050-desktop) → probe-post/buendel-mittag/af816566.md

## 26.11. 12:42 — GPU-PROBE 8d0a9ebe auf radeon-890m: ROT in 2342 s (gate:pruefbuehne-licht GRÜN 61 s auf radeon-890m · gate:weltbild-frost:echt ROT 123 s — ❌ dritte-person: B das Bild folgt der Kamera — 0.00 % der Blöcke (Soll ≥ 5 %) auf radeon-890m · gate:studio-begehen GRÜN 171 s auf radeon-890m · gate:tag-achse:echt ROT 131 s — TAG-ACHSE ROT: BLIND wiese: ohne Mittag und Mitternacht (Cannot read properties of undefined (reading 'format')) auf radeon-890m · gate:webgl-probe GRÜN 48 s auf radeon-890m) → probe-post/buendel-mittag/8d0a9ebe.md

## 26.11. 12:29 — GPU-PROBE 8d0a9ebe auf gtx1050-desktop: ROT in 1609 s (gate:pruefbuehne-licht GRÜN 91 s auf gtx1050-desktop · gate:weltbild-frost:echt ROT 406 s — ❌ dritte-person: B das Bild folgt der Kamera — 0.00 % der Blöcke (Soll ≥ 5 %) auf gtx1050-desktop · gate:studio-begehen GRÜN 473 s auf gtx1050-desktop · gate:tag-achse:echt ROT 226 s — TAG genesis ROT: Karte 126.3 auf gtx1050-desktop · Sprung -0.21 (Uhr 0.73) auf gtx1050-desktop · Buckel 1.16 (Uhr 0) auf gtx1050-desktop · Sonne 10° -0.68 EV R/B ×1.05 | -0.77 EV R/B ×0.85 auf gtx1050-desktop · Nacht 1.16 EV Luma 149.3 auf gtx1050-desktop · REF 3.07 (Uhr 0) auf gtx1050-desktop · Sicht -0.07 (Uhr 0.5) auf gtx1050-desktop · ASYNC 0.02 (Uhr 0.2 auf gtx1050-desktop · gate:webgl-probe GRÜN 119 s auf gtx1050-desktop) → probe-post/buendel-mittag/8d0a9ebe.md

## 26.11. 11:59 — GPU-PROBE 52c07c4a auf omen-gtx1060: ROT in 1606 s (gate:pruefbuehne-licht GRÜN 57 s auf omen-gtx1060 · gate:weltbild-frost:echt ROT 118 s — ❌ dritte-person: B das Bild folgt der Kamera — 0.00 % der Blöcke (Soll ≥ 5 %) auf omen-gtx1060 · gate:studio-begehen GRÜN 235 s auf omen-gtx1060 · gate:tag-achse:echt GRÜN 120 s auf omen-gtx1060 · gate:webgl-probe GRÜN 50 s auf omen-gtx1060) → probe-post/buendel-mittag/52c07c4a.md

## 26.11. 11:45 — GPU-PROBE 214e8da8 auf gtx1050-desktop: ROT in 1514 s (das Bein gpu-probe endete ohne Urteil (cancelled) auf gtx1050-desktop) → probe-post/buendel-mittag/214e8da8.md
