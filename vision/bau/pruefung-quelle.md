# PRÜFUNG AN DER QUELLE — tafel.md und entscheid.md gegen den Lese-Baum (main 18058dba, n1011-hg, nur gelesen)

Skeptiker der Quelle. Gelesen: tafel.md ganz, entscheid.md ganz, CLAUDE.md „Die goldene Definition“. Die acht Lese-Blätter a–h habe ich
NICHT ganz gelesen, nur gezielt durchsucht (Grep nach den Stellen unten); wo ein Befund schon in einem Blatt oder im Spike steht, ist das
vermerkt. Geprüft mit Read/Grep am Code und einer kurzen node-Zählung (KULTUR.col). Kürzel wie in der Tafel: FC fachwerk-core.js · SB
stamm/siedlung-bewohner.js · SW stamm/siedlung-wege.js · ORT stamm/siedlung-ort.js · KC koerper-core.js · sc schmiede-core.js · LAB
worlds/fachwerk/fachwerk.js.

## ZAHL

**54 Behauptungen geprüft.** 41 stimmen an der Quelle. **13 sind falsch oder ungenau**: 3 tragen den Entscheid (F1, F2, F3), 6 betreffen
die Bahnen (F4–F9), 4 sind kleinere Abweichungen (F10–F13). Die Bahnen-Prüfung zeigt dazu, dass Code-Bereiche keiner Bahn gehören, obwohl
das Gesetz sie ändern muss.

## WAS STIMMT (41, je mit Fundstelle)

- Tote: `jetty` FC:171 und `sparH` FC:180 haben repo-weit 0 Leser (Grep: nur die Default-Zeile). `hp.parzelle` hat keinen Erzeuger (nur
  FC:2236 Kommentar, FC:2255 Lesung). `PROXYHAUS` hat nur den Labor-Leser, `proxyGroup` ist zweimal definiert (LAB:52, 59) und wird nie
  gerufen. `hofFuer` hat 0 Leser in stamm/ (nur LAB:88, 773, 776, 904). `kulturFromSeed` hat nur den Labor-Leser. `STOFF_GESETZ` hat
  0 Leser in FC.
- „Die Welt ruft nie“: Jeder Welt-Ruf von `bauRezept` trägt `null` (FC:4381, 4382, 4398, 4436, 4450, 4462, 4468, 4473, 5775). Der einzige
  Haushalt steht in LAB:629. `dachTyp` hat in der Welt nur die Schreiber 'flach'/'sattel' (FC:2214, 2735, 4457, 4482). Keine KULTUR-Zeile
  setzt `stroh`, `pilotis` oder `dachTyp` (FC:2122–2153).
- Z1 bis Z4, die Sprünge an 300 m: Traufe nah 0,55+2,55+2,35 = 5,45 m (FC:178, 214), fern 2·2,7+0,5 = 5,90 m (FC:4072, 4120). Daraus
  ergeben sich die Sprünge +0,45/+1,15/+2,55 m für 2/4/8 Geschosse. `ueberM` 0,5 gilt für beide Seiten zusammen (SW:2245, 2983), also
  0,42−0,25 = −0,17 m. `sockelM` 2,5 (SW:2242). `nahM` 300 (SW:2985). PROXYHAUS rechnet 2,75 m je Geschoss, Überstand 0,45 und Kamin bei
  W·0,24 (FC:4542, 4559, 4565).
- B1, die graue Fenster-Tafel: Der Flügel ist 0,62 rad geöffnet (FC:1084, 1089) und schlägt NACH AUSSEN. Nachgerechnet: rotation.y +0,62
  an der Vorderwand cz<0 legt das freie Ende auf z−w·sin 0,62; dasselbe sagt der Kommentar FC:2814. Die Öffnung selbst bleibt leer.
  `FENSTER_SCHLAF` 0,45 als Hash-Würfel (FC:2751–2758). glasdunkel hat Deckkraft 0,92 (FC:2089), glas 0,42 (FC:2071), laternenglas ist
  eine Byte-Kopie von glas (FC:2090). Die Fern-Scheibe liegt 0,11 m vor der Wand (FC:2806–2810). raumVon rechnet mit 1−0,42 (FC:6023).
  Brüstung und Sturz 0,655/1,605 bzw. 0,50/1,42 m (FC:476, 491–492).
- Mensch: `leuteVon` liest `hp.leute` vor der Flächenformel (FC:9531), der Wirt liest `FC.leuteVon(sl.ov)` (SB:779, 839). Das Kaufhaus
  ist auf W ≤ 8,5 gekappt (FC:2187). LEUTE_GESETZ und Fläche je Person 20+20·wohl sind ein Zwilling (FC:2183 ↔ FC:9526).
  TAGES_GESETZ.angebot hat 10 Zeilen + sonst (KC:5176–5188).
- Werte des Würfels: Los-Würfel 0,35/0,25/<0,72/>0,95∧0,5/0,85|0,68 (FC:4446–4449). Stadtkörper und +1 Geschoss (FC:4440–4444).
  Scheunen-Quote, -Maß und -Neigung (FC:4476–4481). Downtown und Halle (FC:4453–4460). Kirchen-Marke (FC:4461). Burg (FC:4473–4474).
  Region-Würfel (FC:4410).
- Statik-Eingänge: Die Balkenlage liegt auf jeder Achse von `bx` und spannt Dp−0,04 (FC:422, 466–470). Das Dach hat nur Fuß- und
  Firstpfette (FC:776–777), dazu Kehlbalken ≥ eaveY+1,98 und Firststuhl-Stiele (FC:783–794). sc:2893 holz E 1,1e10, ρ über RHO_VON
  (sc:2910). eisen r 0,54 (sc:2922), glas r 0,05 (sc:2924).
- Stoffe: Der Rollen-Block hat 27 Stoffe (FC:2065–2091), DEFCOL 15 Hex (FC:2119). KULTUR.col hat 99 Hex, davon 12 holz und 7 stamm
  (node-Zählung über FC:2122–2153; das Entscheid-Detail „holz 11 + Falunrot“ geht auf). `WERK_ALTER.seh.stoff` = "stein"
  (stamm/siedlung-satz.js:1980), und `SEH_DER_ROLLE.holz` = "stoff" (FC:2033). Fachwerkholz altert also als Stein (B4), gelesen in
  `_satzAlter` siedlung-satz.js:1135. ALTER.holz 0x6b665e (stamm/bau-vorlagen.js:1685).
- Rauch: SB:95–107 erzeugt Teilchen nur nach Nähe zum Auge und Würfel, ohne Uhrzeit, ohne Bewohner, ohne Herd-Zustand. RAUCH_BILD
  kamine 8 / kamineM 160 (SB:3871–3872). Kaminkopf ridgeY+0,9 (FC:928), STACK_W 0,84 (FC:219).
- Weitere stimmende Werte: Kniestock 1,15 (FC:887). Innenwand 0,12, Tür 1,0×2,0 (FC:897). Diele 0,06×0,28 (FC:860). Traufrinne
  'dunkel' (FC:837). Giebelfenster (FC:713). LICHT_GESETZ.fenster 2800 K · 0,42 · 0,85 (FC:6433). Regler W[6;14] D[5;10] (FC:5731–5732),
  also liegt gotisch D 11 außerhalb. Rw = min(195, 26+8,4√n) (FC:5364) mit Literal-Zwilling `wasserReich` (FC:4626); Stadt 36 → 76,4 m.
  `kraftJeS` 1/1800 (FC:4254).

## WAS FALSCH ODER UNGENAU IST (13)

**F1 — „Verdopplungszeit halbiert sich“ (entscheid.md:233–234; Quelle entwurf-mensch-nutzung.md:165) ist FALSCH.**
`wachstum` rechnet die Rate als Σ leute·wohl (FC:4262, 4295). Die Kosten des nächsten Loses sind Σ leute dieses Loses (FC:4288). Hebt
Welle 1 die Köpfe gleichmäßig um +53 %, steigen Rate und Kosten um denselben Faktor; die Verdopplungszeit bleibt gleich. Sie hängt nur am
Wohlstand und an `kraftJeS`. Selbst wenn die Köpfe sich verdoppeln, halbiert sich nichts.
Folge: ERSTER PUNKT 13 (entscheid.md:367, „bevor Welle 1 die Köpfe um ~50 % hebt“) verliert seinen Grund. `kraftJeS` braucht einen Anker
als Stellwert ohne Anker, aber Welle 1 macht ihn nicht dringlicher. Der Preis-Absatz §3 „Speicher und Takt“ ist an dieser Stelle zu
streichen.

**F2 — „main: Balken frei über 9 m“ (entscheid.md:271) und „main 0 %“ für spann ≤ L_max (entscheid.md:273) sind UNGENAU.**
Die Querwände des Raum-Schnitts stehen quer unter den Balken der Seitenstreifen: `wallX` an jedem Schnitt `cuts` (FC:910, 916). Ihre
Wandhöhe L.h−0,05 (FC:911) reicht über die Balken-Unterkante L.top−0,21 hinaus. Der Wirtschaftsstreifen im EG trägt immer 1–2 Schnitte
(FC:602), die Wohnseite in 40 % (FC:603). „Frei über die volle Tiefe“ gilt nur für den Flur-Streifen und für Streifen ohne Schnitt.
Der Spike selbst zählt 23 von 94 Häusern, deren Querwand-Folge ≤ L_max trägt (spike-100-haeuser.md:101, „71/94 ohne Folge“). Die
Vorher-Zahl von B3 ist also eher ~24 % als 0 %; das ist eine Vermutung, die Zählung gehört an die 1 691 Lose. Die Schwelle „100 %“ bleibt
davon unberührt, der Satz „A: jede Tiefe ≥ 5 m bricht“ aber nicht: Er setzt voraus, dass die Querwand nicht trägt, und genau das ist
nicht gezeigt.

**F3 — „Kamin: Existenz 1 je Haus“ (tafel.md:149) ist UNGENAU.**
`herd()` setzt `chimney=null` für ROUND, kuppel und modern/glas (FC:919). Bestätigt wird das am Export: „null wenn massBau kein chimney
(ROUND/modern/kuppel)“ (FC:5927). Downtown-Türme (glas, FC:4456) und alle Häuser im Stil modern haben keinen Kamin und keinen Rauch.
Folge: Die Vorher-Seite von B7/F6 („mittags raucht jeder Kamin“) stimmt nur für die Häuser, die einen Kamin tragen; der Anteil gehört
gegen die Kamin-Häuser gemessen, nicht gegen alle Häuser.

**F4 — „fachwerk-core.js … ausschließlicher Datei-Besitz“ (entscheid.md:241) ist für die Löschungen NICHT erfüllbar.**
Der Absenz-Grep (entscheid.md:214–215) verlangt Treffer an Zeilen anderer Bahnen oder an Zeilen, die keiner Bahn gehören:
- `DEFCOL`: Leser auch in SW:2748–2749 (Stadtmauer-Farbe, B5), in LAB:24, 25, 33, 35, 217, 712 (B2), im Rückfall `_colFor` FC:2325
  (keine Bahn) und im Export FC:12474 (B1).
- `fensterSchlaeft`: Rufer FC:1080, 1520, 1700, 1791 (B4), FC:3575 (keine Bahn) und Export FC:12503 (B1). B5 soll ihn löschen.
- `glasdunkel`: FC:1080 (B4), FC:2794 (B5), FC:2057/2089 (B6).
- `STADT_MASSEN`: FC:4492, 4494 (B2) neben FC:4072/4119 (B5) und Export FC:12423 (B1).
- `PROXYHAUS`: B5 löscht ihn, LAB:45, 52, 59 gehört B2.
Das Blatt nennt nur den Abgang des PROXYHAUS-Exports in B1 (entscheid.md:249). B1 landet aber eingefroren ZUERST und kann die Exporte von
DEFCOL, STADT_MASSEN und fensterSchlaeft nicht vorab entfernen, solange deren Leser noch stehen.

**F5 — Ein Teil des Codes, den das Gesetz ändern muss, gehört keiner Bahn.**
Die Bereiche der Bahnen lassen in FC Lücken: 1811–1839, 2277–2739, 3111–4059, 4518–4539, 4567–4586, 4663–5261, 5701–6839,
6871–9518 und ab 9539. In diesen Lücken liegen Stellen, die das Gesetz anfassen muss:
- `DORF_NORM` FC:3649: D6 lässt gap und budget fallen (entscheid.md:208).
- `STADT_FORM` FC:3892: D6 lässt schlank, stab, breitMax und tiefMax fallen (entscheid.md:208).
- `kachelNetz` FC:3844: Laut entscheid.md:291 setzt B5 `losVon` gemeinsam für Kachel und Plan.
- `viertelWort` mit seinem DORF-Ruf FC:4006/4013 und `exportSettlement` mit dem DORF-Ruf der Welt FC:9722/9733: „DORF verlangt DP.ort
  und wirft ohne ihn“ (entscheid.md:151). Beide Rufer reichen heute kein `ort`. Blatt f (lesen-f-stadtplan.md:11) nennt genau diese
  Rufer.
- `_colFor` FC:2325 und der fensterSchlaeft-Rufer FC:3575.
- PRESETS FC:5775: `bauRezept` ohne Haushalt, siehe F6.

**F6 — „bauRezept ohne Haushalt für eine Haushalts-Rolle wirft“ (entscheid.md:153–154) bricht Rufer außerhalb der Bahnen.**
Der Default der Nutzung ist 'wohnhaus' (FC:2222). Ohne Haushalt rufen heute: LAB:35, 628, 841 (B2), FC:5775 (PRESETS-Aufbau, keine
Bahn), scripts/diag-fachwerk-contract.cjs:98 (nicht in der Dateiliste von B8) sowie innerhalb von DORF auch Kirche (FC:4462) und Burg
(FC:4473), deren Zeile keine `nutzung` trägt. Jede dieser Stellen würfe; keine Bahn benennt sie außer der eigenen DORF-Zeile von B2.

**F7 — Der Weg des `ort` vom Wirt zu DORF fehlt.**
Laut entscheid.md:258 setzt B2 „DP.ort an jedem DORF-Ruf“ in stamm/siedlung-ort.js. Die Welt ruft DORF aber nicht selbst. Sie fragt
`exportSettlement` über den Worker-Kanal (ORT:256; stamm/studio-bruecke.js:196, 1476–1482). `kachelMassen`, das zweite Mal DORF, ruft
SW:2061/2075 aus B5 auf. Die Datei stamm/studio-bruecke.js steht in keiner Bahn, und SW (B5) müsste den Ort von siedlung-ort (B2)
beziehen. Das ist eine ungenannte Kopplung zweier Bahnen.

**F8 — Der Herd liegt in zwei Bahnen.**
B3 soll den „Herd in der Küche des Programms“ setzen (entscheid.md:269), und D4 lässt „Herd-Lage FC:586–592“ fallen (entscheid.md:199).
Die Herd-Lage FC:586–597 und die Raumteilung FC:601–630 liegen aber im Bereich von B4 (:476–639). `herd()` FC:919–932 gehört B3. Eine
Sache, zwei Bahnen.

**F9 — `tragwerk(P, P.ort ?? Heimat)` (entscheid.md:268) ist der stille Ersatz, den das Blatt zwei Absätze vorher verbietet.**
entscheid.md:151 sagt: „kein stiller Ersatz“. Jedes Haus, dessen ov kein `ort` trägt, baut ohne Meldung mit dem Holz der Heimat. Das
betrifft das gesetzte Haus als Ein-Slot-Plan (FC:5934 ff.), Werke des Spielers und den HAUS-Faden (foundry-bruecke.js:892). Nach der
goldenen Definition ist das fail-soft und damit der Bruch.

**F10 — Z16 „Lehm 0,09 ↔ 0,06, Vermutung Zwilling“ (tafel.md:260) ist KEIN Zwilling.**
FC:640 ist das Lehmfeld OHNE Backstein (`brick===false`, 0,09). FC:644 ist die Hinterfüllung HINTER dem Backstein (0,06). Es sind zwei
Größen an zwei Zweigen. Die Tafel-Zeile D3 „Wand-Ausfachung … Lehm 0,06“ (tafel.md:119) nennt nur die Hinterfüllung. ERSTER PUNKT 4 der
Tafel fällt damit mit Grund.

**F11 — Die Los-Ziehungen sind falsch gezählt (entscheid.md:115–116, 229).**
Die Behauptung lautet: „bis zu acht, eine davon heute bedingt FC:4448“. Bedingt ziehen aber vier Stellen:
- FC:4449 (nur i>0),
- FC:4442 (Stadt >1880 ohne Ring),
- FC:4443 (Ring, äußerer Rand),
- FC:4431 (nur Ring).
Gezählt ergeben sich ohne Ring bis zu 9 Ziehungen (4433, 4435×2, 4438, 4442, 4446×2, 4448, 4449), mit Ring bis zu 10. Dazu ist „vier
Ziehungen … unbedingt — u_ersatz (nur Ring)“ in sich widersprüchlich. Der Byte-Satz („rückt in JEDER Welt“) bleibt richtig.

**F12 — Leser zu eng gefasst.**
- DEFCOL: Die Tafel nennt als Leser „_colFor, tintM“ (tafel.md:162, übernommen aus lesen-e-stoffe.md:70). Es fehlen SW:2748–2749 (die
  Stadtmauer der Welt liest DEFCOL.stein/.ziegel) und das Labor.
- Z31: `_landAt(…, 0.2)` steht nicht nur an ORT:1689, sondern auch an ORT:553, 680 und 711, also an vier Stellen statt an einer.

**F13 — Kleinere Abweichungen.**
- Der „Vorstand von Glas 0,41–0,61 m“ (entscheid.md:284) beginnt bei 0,37 m: Ein Fenster gibt es ab f.wdt > 0,98 (FC:485), dann ist
  w > 0,64 und 0,64·sin 0,62 = 0,37.
- „132 000 Dreiecke L0 (FC:100)“ (entscheid.md:235) ist der Budget-Deckel, keine gezählte Dreieckszahl.
- Z2 „auch der Grundriss des NAHEN Hauses wächst nach geschossM (FC:4492, 4494)“ gilt nur mit `DP.erbe.hoch>0` (FC:4491), also nur in
  Vierteln der Kachel-Stadt.
- Spike-Kriterium 3 „Breite Q90/Q10 < 2,0 (heute 2,00)“ (entscheid.md:339): Die Schwelle liegt genau auf dem heutigen Wert, also widerlegt
  dieses Teilkriterium den heutigen Zustand nicht. Das ist kein Quell-Fehler, aber eine leere Probe.

## WAS DIE FEHLER AM ENTSCHEID ÄNDERN

- **Das Gesetz selbst steht.** Keiner der 13 Befunde trifft die Richtung: Adresse → Haushalt → Programm → Los; Stoff des Orts →
  Tragwerk; Betrieb → Zustände. Alle tragenden Belege für „die Welt ruft nie“, „0 Schreiber“ und „kein Leser“ halten an der Quelle.
- **Der Preis (§3) verliert einen Satz.** F1 streicht die Wachstums-Folge; ERSTER PUNKT 13 wird ein gewöhnlicher Stellwert ohne Anker
  ohne Dringlichkeit.
- **Die Statik-Begründung (A, B3, Spike 1) ist schwächer als behauptet (F2).** Ob die Querwand des Programms trägt, ist die eigentliche
  Frage von Spike 1. Dort steht sie auch schon (spike-100-haeuser.md:284). „main 0 %“ und „Balken frei über 9 m“ sind als Vorher-Zahl zu
  ersetzen.
- **Die Bahnen müssen neu geschnitten werden, bevor B2–B7 starten (F4–F9).** Nötig sind:
  - eigene Exportzeilen je Bahn statt eines eingefrorenen Export-Blocks in B1;
  - Besitz für FC:3110–4059 (DORF_NORM, STADT_FORM, kachelNetz, viertelWort), für exportSettlement FC:9722 ff., für PRESETS FC:5775 und
    für stamm/studio-bruecke.js;
  - der Herd in genau einer Bahn;
  - scripts/diag-fachwerk-contract.cjs in B8.
  Dazu muss die Fehlerregel geändert werden: `P.ort ?? Heimat` wird zu „wirft ohne ort“, und der Labor-Weg erhält ein eigenes `ort` als
  Eingang.
- **Kleinkram.** F3 und F10–F13 korrigieren Vorher-Zahlen und Zählungen, nicht die Gesamtzählung 769/196/14/559; diese habe ich nicht
  nachgezählt.

## ERSTE PUNKTE DER NÄCHSTEN RUNDE

1. **Bahnen neu schneiden.** Jede Stelle aus F4–F8 bekommt genau einen Besitzer. Die Abnahme dafür ist eine Grep-Liste je Name des
   Absenz-Greps samt Zeile und Bahn, Rest = 0.
2. **Querwand-Frage zählen (F2).** Gezählt wird der Anteil der 1 691 Wohnhäuser, deren Balken jedes Seitenstreifens zwischen Querwänden
   ≤ L_max spannt, als echte Vorher-Zahl von B3 statt „0 %“.
3. **Den Ort-Weg festlegen (F7, F9).** Zu klären ist, wie `ort` durch den Worker-Kanal (studio-bruecke.js:1476 ff.) und in `kachelMassen`
   (SW:2061) reist, und wie das gesetzte Haus (FC:5934 ff.) seinen Ort bekommt, ohne `?? Heimat`.
4. **Rauch-Vorher an Kamin-Häusern zählen (F3).** Gemessen wird der Anteil der Häuser mit `chimney ≠ null` je Plan, als Nenner von F6.
5. **Gesamtzählung nachprüfen.** 769 ohne Anker und 196 fallend habe ich nicht nachgezählt. Das ist offen, weil die Tafel ihre Zählung
   aus den Blättern zieht (Skripte tafel-rows.cjs/tafel-gen.cjs im Scratchpad, nicht im Repo). Diese Skripte ins Repo, dann eine
   Zweitzählung.
6. **Die acht Lese-Blätter ganz gegen diese Prüfung lesen.** Ich habe sie nur durchsucht. Ein Blatt kann F1–F13 schon kennen oder
   widerlegen; das gilt für Blatt f bei F5 belegt.

Nicht geprüft (gilt als nicht belegt): Spearman 0,09, Köpfe 3,11 und alle µs-/ms-Zahlen aus preis2.cjs/heute.cjs (Skripte nicht im
Repo); cores.manifest.json:28–33; siedlung-bauten.js:3437 (8 192 Zeichen); vegetation-streu.js:2926–2958; Bild-Befunde B1–B16 (kein Bild
geöffnet).
