# PRÜFUNG QUELLE v2 — entscheid-v2.md an der Quelle (Lese-Baum n1011-hg main b7ed84194, nur gelesen)

Geprüft: jede datei:zeile von entscheid-v2.md, die §4 trägt, ganz; §1/§2/§3 als Stichprobe; zaehl/zaehl.md durch Fahren aller sieben Skripte.
FC = fachwerk-core.js im Wurzelverzeichnis des Lese-Baums (nicht worlds/fachwerk/), SHA-256 028cc2d0…bea06, byte-gleich mit
p3/n1811/bau-spike2/kern/fachwerk-core.js (sha256sum). LAB = worlds/fachwerk/fachwerk.js, SW = stamm/siedlung-wege.js.
Neues Prüf-Skript: `node koordination/vision/bau/zaehl/pruef-quelle-v2.cjs` (sha256 ff49b207…). Es liest die Tafeln aus dem Text
von bahnen-besitz.cjs (nicht abgeschrieben), fragt nach dem Besitzer jeder Stelle, die Bahn 1 braucht oder bricht, und grept die
Fenster-Namen im ganzen Baum, auch spec/ und .json. Es wirft, wenn eine Stelle ihr Stichwort nicht trägt. Kein git außer einem
`rev-parse` am Anfang, kein GPU, kein npm.

**Zählung: geprüft 136 · stimmt 119 · falsch 13 (8 mit Folge, 5 ohne) · unsicher 4.**
**Urteil: besteht NICHT. Bahn 1 ist in der geschriebenen Form NICHT von einem Macher baubar.** Der Besitz der 17 Fall-Namen
stimmt. Es fehlen aber die Stellen, über die der lebende Flügel in die Welt kommt. Der neue userData-Schlüssel bricht vier Leser
außerhalb von B1. Und „die Scheibe immer `glas`“ widerspricht „die Glut bleibt byte-gleich“. Die Korrekturen K1–K6 unten sind
so formuliert, dass man sie einarbeiten kann. Mit ihnen geht Bahn 1 durch EINE Hand. Fremde Dateien braucht sie dann nur noch als
Tor-Leser (B6), und die hält sie bis zur Landung, wie §4 es schon erlaubt.

## WAS NICHT HÄLT (zuerst)

1. **Der lebende Flügel hat keinen Weg in die Welt (Bedingung 2 von §4.3 ist jetzt gelesen, Antwort: NEIN).**
   - Der Extraktor macht ein Mesh nur dann zum Flügel, wenn ein Ahn `userData.side` als Zahl trägt (foundry-bruecke.js:652–653,
     dann `out.tuer` :654).
   - Der Fenster-Flügel trägt `{window:true, openA}` und kein `side` (FC:1084, 1089).
   - Die Stufe 0 der Welt (`buildStufe`, FC:6178 ff.) trennt nur `userData.door && side` ab (FC:6188–6219). Alles andere bakt sie
     mit `alles=true` ein (FC:6230). Der Fenster-Flügel ist in der Welt also heute eingebacken, offen auf 0,62 rad.
   - Der Schnitt liegt darum in **FC:6170–6232**. Das sagt §4.3 nicht, denn dort steht „foundry-bruecke.js:645–665“. Die Zeilen
     FC:6170–6365 haben in bahnen-besitz.cjs KEINEN Besitzer: pruef-quelle-v2 (2) meldet 196/196 Zeilen HERRENLOS.
   - Läuft der Flügel als neues Feld `out.fenster`, wie in §4.3 Punkt 6 geschrieben, dann ignoriert ihn die ganze Kette, die heute
     am Feld `tuer` hängt. Alle diese Stellen sind herrenlos:
     - stamm/studio-gestalt.js:347 (`__tuer`) und :1477–1496 (Schwenk-Träger);
     - stamm/siedlung-instanz.js:518 (Flügel bleiben aus den Bündeln, `!leaf.tuer`) und :547, :859;
     - stamm/gelaende-kollision.js:867 (`_fluegelLeib` sammelt `s.tuer || g.tuer`);
     - phyto-core.js:6074, 6127, 6382, 6545 (das Budget faltet `m.tuer` nie).

     Ohne diese Stellen wird der Fenster-Flügel in ein Bündel verschmolzen. Er kann sich dann nie drehen.
2. **Der neue userData-Schlüssel bricht vier Leser außerhalb von B1.** §4.3 Punkt 1 schreibt `userData` als
   `{fenster:true, hx, zf, seite, samen}`. Den Schlüssel `window` lesen heute:
   - FC:2412 (`bakeHaus`: der Flügel bleibt live) und FC:2445 (`bakeLOD`, wenn !alles). Beide sind HERRENLOS (s. Punkt 4).
   - LAB:97 und LAB:727 (das Labor legt Fenster in `doorList`); LAB:1039 dreht jeden Eintrag um `openA`. Alle drei gehören B2.

   Fällt `window`, dann bakt das Labor den Flügel ein und die Linse des Studios sieht kein bewegliches Fenster mehr.
3. **„Die Scheibe immer `glas`“ (§4.3 Punkt 2) und „`glasdunkel` fällt“ (Punkt 5) brechen die Glut, die Punkt 5 byte-gleich halten will.**
   Nachts glüht nur `glas`: `M.glas.userData.__licht='fenster'` (FC:2098, B4). `glasdunkel` ist das Schlaf-Glas und trägt kein
   `__licht` (FC:2089, Kommentar „Fenster, die nachts dunkel bleiben“). `fensterAt` wählt zwischen beiden nach `fensterSchlaeft`
   (FC:1080). Wird jede Scheibe `glas`, glühen die schlafenden Fenster (FENSTER_SCHLAF 0,45, FC:2751) in L0 und L1 nachts mit. Damit
   verliert der Schlaf-Würfel nah seinen Leser. gate:haus-fern G vergleicht die Glut je Stufe gegen L0 (scripts/diag-haus-fern.cjs:194,
   462–485) und sieht das.
4. **Eine Besitz-Behauptung ist falsch.** Laut §4 liegen `bakeHaus`/`bakeLOD` (FC:2411, 2444) „im Bereich von B4“. Die B4-Bereiche der
   Tafel sind aber [2277, 2410] und [2480, 2744] (bahnen-besitz.cjs:24). FC:2411–2479 hat darum KEINEN Besitzer (69/69 Zeilen
   HERRENLOS, pruef-quelle-v2 (2)). Der Text weicht vom Skript ab. Doppelter Besitz liegt nirgends: das Skript wirft bei Überlappung
   (bahnen-besitz.cjs:45–48), und es lief ohne Wurf.
5. **Das Tor für die Goldens ist falsch benannt.** `spec/asset-contract/v6/golden/haeuser.json` liest gate:**fachwerk-contract**
   (scripts/diag-fachwerk-contract.cjs:34, 45; check.yml:870–880 „Haus-Asset-Vertrag v6 … 194 frozen sha256-Goldens“).
   gate:asset-contract liest sie nicht, anders als §4.3 „Tore“ schreibt. Dieselbe Datei komponiert die Stufe 0 als Shell nach
   (diag-fachwerk-contract.cjs:120–176, `__tuerFluegel` :147) und vergleicht byte-genau. Ein Schnitt in FC:6188–6219 bricht sie,
   wenn sie nicht mitgeht.
6. **Ein Tor fehlt: gate:kamera-leib** (package.json:120, check.yml:1356). scripts/diag-kamera-laub.cjs:732 und :1177 nennen genau
   den offenen Fenster-Flügel des haus_alemannisch (9 von 1 089 Bildern in der Kugel). Sein Leib kommt heute aus `strahlFluegel`
   (FC:339, Kommentar FC:334–338). Schließt Bahn 1 den Flügel, ändert sich dieser Leib.
7. **`?? Heimat` ist im Text fort, im Weg aber nicht.** §4.1.5 setzt `bauOrt: HEIMAT` in jedes PRESET. `buildInstance` legt das ov
   über das Preset (`hausParams(pre, ov)`, FC:6328), und der Wirt reicht ein Slot-ov nur, wenn es eins gibt („Alt-Exporte ohne ov:
   must-ignore“, stamm/siedlung-ort.js:535–536). Ein Welt-Haus, dessen ov kein `bauOrt` trägt, baut darum still in der Heimat. Das
   ist derselbe Fallback, nur in die Daten verlegt. Er betrifft Bahn 2, nicht Bahn 1.

## (1) §4 BESITZ — Absenz-Greps selbst gefahren

`node koordination/vision/bau/zaehl/bahnen-besitz.cjs`: Skript sha256 ed5712f1… (stimmt), Ausgabe GRÜN, Exit 0. Die Zahlen stimmen
Treffer für Treffer mit §4: glasdunkel 5 · FLUEGEL_LAGE 2 → B1 · PROXYHAUS 7 · proxyGroup 2 · STADT_MASSEN 6 · _bauweiseWurf 2 → B2 ·
shaftCX/shaftRange/bxFront/layJoists/isAxis je 2 · STIL_GRENZNEIGUNG 10 → B3 · DEFCOL 15 · laternenglas 7 · AUS_SILBER/ROST/MOOS_NORD
je 3 → B4. Alle 11 Bleibe-Definitionen stehen an der genannten Zeile; das Skript wirft sonst (:74).

**Wo die Tafel blind ist:**
- Sie grept ohne spec/ und nur *.js/cjs/mjs/html. pruef-quelle-v2 (3) grept den ganzen Baum, 570 Dateien inkl. .json/.md und spec/.
  Der Absenz-Grep von §4.3 trifft **9 Zeilen, alle in FC und alle B1**: 1080, 1084, 1089, 2057, 2089, 2781, 2788, 2794, 2815. In spec/
  liegt kein Treffer. `fensterSchlaeft` trifft außerdem spec/asset-contract/v6/CONTRACT.md:200 (Doku, herrenlos).
- Die Tafel fragt nur Namen, nicht Verhalten. Die Leser des Schlüssels `userData.window` (FC:2412, 2445 herrenlos; LAB:97, 727 B2)
  und der Feld-Kette `tuer` stehen in keiner Liste. Sie sind die Stellen von NICHT HÄLT 1 und 2.

**Herrenlos, und Bahn 1 braucht sie** (pruef-quelle-v2 (1), je Besitzer: B1 5 · HERRENLOS 15 · B2 4 · B4 2 · B3 1 · B6 2):

| Stelle | Besitzer heute | warum Bahn 1 sie braucht oder bricht |
|---|---|---|
| FC:6188–6219, 6230 (`buildStufe` Stufe 0: Flügel-Trennung, `alles=true`) | HERRENLOS | einziger Ort, an dem ein Fenster-Flügel als Flügel aus dem Bake kommt |
| FC:6314, 6352 (`__tuerFluegel` Zusammenbau) | HERRENLOS | nur wenn Fenster eine eigene Liste bekommen |
| FC:2412, 2445 (`bakeHaus`/`bakeLOD` live-Set) | HERRENLOS | lesen `userData.window` |
| LAB:97, 727, 1039 | B2 | lesen `userData.window` + `openA` |
| FC:2098 (`glas` glüht) | B4 | Glut der Nacht |
| FC:334–338 (Kommentar 0,62 rad), FC:2283–2300 (Kommentar Fern-Flügel) | B3 / B4 | werden falsch, ändern nichts |
| studio-gestalt.js:347, 1477; siedlung-instanz.js:518, 859; gelaende-kollision.js:867; phyto-core.js:6074, 6545 | HERRENLOS | nur bei neuem Feld `out.fenster` |
| stamm/siedlung-ort.js:114 (`_tickHausTueren` dreht ALLE Flügel des Eintrags) | B2 | läuft das Fenster als `tuer`, schwingt es mit der Tür-Nähe |
| scripts/diag-kamera-laub.cjs:732 | HERRENLOS | gate:kamera-leib |
| scripts/diag-fachwerk-contract.cjs:120–176, diag-haus-fern.cjs:194 | B6 | Byte-Parität, Glut je Stufe |

**Kleine Fehler ohne Folge:**
- FC:494–495 → `win` steht an FC:495–496.
- `_bauweiseWurf` FC:2203 → Definition FC:2204 (2203 ist `// prettier-ignore`; der Bereich deckt es).
- Die Tafel „Herrenlose der Runde 1“ nennt PRESETS FC:5775, die Definition steht an FC:5771.
- „SW ohne 2739–2749“ heißt in Wahrheit nur ohne die Zeilen 2739, 2748 und 2749 (bahnen-besitz.cjs:18); SW:2740–2747 gehört B2.
- §4.1.3 lässt einen Durchgang aus: stamm/siedlung-satz.js:819, 1002 (B4). Dort wird das Slot-ov mit `verwitterung`/`nord`
  zusammengelegt, bevor es an studio-bruecke.js:1526–1570 geht. Ein Edit ist dort nicht nötig, `bauOrt` reist mit.

## (2) §4.1 — der Weg des `bauOrt`

| Glied | an der Quelle | Urteil |
|---|---|---|
| Wirt rechnet `bauOrt`, legt `dp.bauOrt` neben `dp.ort` | siedlung-ort.js:259 (`dp.ort` {x, z}, Kommentar), Versand `{type:"export-settlement", dp}` :308 | stimmt (B2) |
| Kanal: dp wird Schlüssel `frage` | studio-bruecke.js:1477 `JSON.stringify(m.dp…)`, :1478–1483 Rest `stl|sha` | stimmt |
| Worker: `exportSettlement(msg.dp)` | foundry-bruecke.js:249–250 (Zweit-Kern-Schleife), :1038 | stimmt; §4.1 nennt die Zeile nicht |
| `exportSettlement` → DORF | FC:9722, DORF-Ruf FC:9733 | stimmt |
| Haus: Slot-ov → Faden | siedlung-ort.js:536 → siedlung-satz.js:819/1002 → studio-bruecke.js:1526/1551/1570 → foundry-bruecke.js:888–891 `buildInstance(…, msg.ov)` | stimmt, ein Glied fehlt im Text (s. o.) |
| Ferne `kachelMassen` | FC:4074 (heute 5 Eingänge), SW:2061, 2075; `s` aus `_staedte()` siedlung-ort.js:1455 (B2) | stimmt. **Aber:** `kachelMassen` läuft im HAUPT-Faden über `AnazhRealm.Gesetz("fachwerk:kachelMassen")` (stamm/dienst.js:2258), nicht über einen Worker-Kanal. Die Hülle §3 kostet dort den Haupt-Faden (heute 2–4 ms je Kachel, FC:4071) |
| B6-Leser `kachelMassen` mit 5 Argumenten | scripts/diag-settlement.cjs:1062, scripts/lib/ort-proben.cjs:466 | würden werfen; beide sind B6, stimmt |
| Quellen des Orts | gelaende-core.js:1467 `schneePegel`, :5835 `kahlGrund`, :5843 `ortGesetz`; phyto-core.js:3047 `forestNische` | stimmt („pc“ = phyto-core) |
| ohne `?? Heimat` | im Text nur noch als „fällt“ (entscheid-v2.md:152, 236) | **falsch im Weg**: siehe NICHT HÄLT 7 |

## (3) BAHN 1 — die genannten Stellen

Wörtlich an der genannten Zeile gefunden (Code, kein Kommentar):
- **Flügel 0,62 rad:** `L.rotation.y=(cz<0?0.62:-0.62)` an FC:1084 und `(cx<0?-0.62:0.62)` an FC:1089.
- **Scheibe in windowSash:** FC:1010–1021, die Flächen-Stufe `P.flaechig` an FC:1011–1015 (36 Dreiecke).
- **glasdunkel:** opacity 0.92 an FC:2089, SEH-Zeile FC:2057, Leser an FC:1080 und FC:2794.
- **fensterSchlaeft:** FC:2752–2759.
- **FENSTER_SCHLAF:** 0.45 an FC:2751.
- **INNEN_DAEMMER:** 0.92 an FC:2767, `_innenFaktor` an FC:2768.
- **FLUEGEL_LAGE:** FC:2788 und FC:2815.
- **fensterFern:** FC:2790–2823, die Scheibe `d1+0.01` an FC:2810 und FC:2819.
- **Seitenregel fern:** FC:2814.
- **Rufer:** alle 13 Rufer-Zeilen tragen einen Fenster-Namen; geprüft je Zeile mit grep.
- **Das Tür-Muster:** FC:982 (`side`, `offen`).
- **Wanddicke:** `post:0.16` an FC:179.
- **Weitere Zeilen:** `lochWand` FC:1534, `glas` FC:2071, `hausDreiecke` FC:6311, `LICHT_GESETZ` FC:6431, `innenTon` FC:2347.
- **Wirt:** `_tickTorFluegel` siedlung-tor.js:808–860; `_tickHausTueren` dirigent-takt.js:268; der 40-m-Ring siedlung-ort.js:86–95.
- **Uhr und Wetter:** `state.timeOfDay` siedlung-bewohner.js:2157; `_wetterAmOrt` bild-himmel.js:2843 liest
  `this._gelaende().ort.wetter` (:2851).

**Sind das ALLE Stellen?** Nein. Es fehlen:
- **LOD:** Die Stufe 1 bakt Fenster mit `alles=true` ein (FC:3574), die Stufe 0 der Welt ebenso (FC:6230).
  - Ein geschlossener Flügel braucht dort nichts.
  - Ein lebender Flügel braucht FC:6188–6219 (NICHT HÄLT 1).
  - Turm-L1 und L2 laufen über `fensterFern` (FC:3569, 3586) und sind gedeckt.
  - Stufe 3 (`wurfVon`) baut keine Fenster.
- **Satz-/Instanz-Pfad:** siedlung-instanz.js:510–547 und :858–859, gelaende-kollision.js:858–870, phyto-core.js:6074–6545.
  Sie gehen nur am Feld `tuer` mit (NICHT HÄLT 1).
- **Studio/Labor:** studio-gestalt.js:344–347 und :1469–1496 (Feld `tuer`); LAB:97, 727, 1039 (Schlüssel `window`).
- **Linsen/Tore in scripts/:**
  - diag-kamera-laub.cjs:732, 1177 (gate:kamera-leib, fehlt in der Tor-Liste);
  - diag-haus-fern.cjs:194, 378–485 (G Glas/Glut, gate:haus-fern, steht in der Liste);
  - diag-fachwerk-contract.cjs:34, 45, 120–176 (Goldens v6 + Shell-Parität; das Tor heißt fachwerk-contract, nicht asset-contract).
  - **Unsicher, ob sie brechen**, wenn Fenster als `tuer`-Blätter reisen: gate:freie-slots (diag-freie-slots.cjs:144, 254),
    gate:chunk-satz (diag-chunk-satz.cjs:800), gate:portal-gestalt (diag-portal-gestalt.cjs:143). Alle drei zählen `g.tuer`.

**Tore, die brechen würden** (nach Quelle, nicht gefahren):
- gate:fachwerk-contract: Goldens v6 neu, Shell-Parität.
- gate:haus-fern: Glas/Glut G, Fern-Flügel.
- gate:kamera-leib: der Flügel-Leib.
- gate:brennglas-takt: Tür-Takt.
  - Er bricht nur, wenn `_tickHausTueren`/`_tickTorFluegel` die Fenster mitzählt.
  - Er zählt Häuser mit `e.tuer` (diag-brennglas-takt.cjs:987–1015).
- unsicher: freie-slots, chunk-satz, portal-gestalt.

## (4) KORREKTUREN — zum Einarbeiten in entscheid-v2 §4 / §4.3

- **K1 (userData).** Der Flügel behält `userData.window = true` und `openA`. `openA` ist jetzt der Winkel des Zustands, 0 bei
  geschlossen. Die Daten für Scharnier und Samen kommen als zusätzliche Felder dazu. Damit bleiben FC:2412, FC:2445 und LAB:97/727/1039
  unberührt. Der Satz „userData trägt {fenster:true, …}“ in §4.3 Punkt 1 wird ersetzt.
- **K2 (lebender Flügel).** In bahnen-besitz.cjs bekommt B1 den Bereich **FC:6170–6232** (`buildStufe` Stufe 0). Dort wird der
  Fenster-Flügel abgetrennt wie das Türblatt (FC:6188–6219): eigener Bake, Gitter um das Scharnier zurück, `wg.userData = {side,
  offen:0, fenster:{samen}}`. So nimmt der Extraktor ihn als `out.tuer` mit (foundry-bruecke.js:653–660); der Macher fügt dort nur
  `out.tuer.fenster` an (B1). Die herrenlose Kette (studio-gestalt, siedlung-instanz, gelaende-kollision, phyto-core) trägt ihn dann
  ohne Edit. `_tickTorFluegel` (siedlung-tor.js:808–860, B1) überspringt Blätter mit `t.fenster`. Sonst dreht `_tickHausTueren`
  (siedlung-ort.js:114, B2) die Fenster mit der Tür-Nähe. `_tickHausFenster` dreht nur diese Blätter. Das neue Feld `out.fenster`
  aus §4.3 Punkt 6 fällt. „Bedingung 2“ ist damit beantwortet und wird gestrichen.
- **K3 (Schlaf-Glas).** `glasdunkel` (FC:2089) wird ERSETZT, nicht gestrichen. An seine Stelle kommt das Schlaf-Glas `glasschlaf`:
  dieselbe Durchsicht wie `glas` (0.42), aber ohne `__licht`. Die SEH-Zeile FC:2057 nennt dann `glasschlaf: "glas"`. `fensterAt` wählt
  weiter nach `fensterSchlaeft`. Fern bekommt ein schlafendes Fenster `innen` ohne Glas-Glut, statt `schlafF`. So hält der Absenz-Grep,
  und die Glut der wachen Fenster bleibt byte-gleich. Bei Tag ändert sich das Bild der schlafenden Fenster, und das ist gewollt.
  Präzisiere Punkt 5: „byte-gleich“ gilt für die Glut der WACHEN Fenster und die Wahl des Schlafs, nicht für das Tagbild.
- **K4 (Tore).** Ersetze „gate:asset-contract (:61; die Goldens haeuser.json …)“ durch gate:fachwerk-contract (:108). Zu den Toren
  kommt gate:kamera-leib (:120). diag-fachwerk-contract.cjs:120–176 (Shell der Stufe 0) gehört zu dem, was B1 bis zur Landung hält.
- **K5 (Besitz-Tafel).** Zwei Zeilenbereiche haben in bahnen-besitz.cjs keinen Besitzer:
  - FC:2411–2479 bekommt einen Besitzer (B4, wie der Text sagt) oder die Zeile „eingefroren, kein Besitzer“.
  - FC:6233–6365 bekommt ebenso einen Besitzer.

  Ein Satz im Skript-Kopf soll sagen, dass Verhaltens-Schlüssel (`userData.window`, Feld `tuer`) nicht gegrept werden.
- **K6 (Bahn 2, nicht Bahn 1).** PRESETS tragen KEIN `bauOrt`. Die Goldens und das Labor reichen ihn als benanntes ov.
  `buildInstance` wirft, wenn weder ov noch Aufruf ihn tragen. siedlung-ort.js:535–536 wirft, wenn `slot.ov` ihm fehlt. Erst dann ist
  `?? Heimat` auch im Weg fort.

## (5) zaehl/zaehl.md — Skripte selbst gefahren

| Skript | Ausgabe | gegen zaehl.md |
|---|---|---|
| zaehl-tafel.cjs | Exit 0; Deckung a–g „nie genannt 0“; e 420/402, f 153/128, g 152/69 | stimmt |
| zaehl-welle.cjs | Σ 769/196/14/559, „Abweichungen: keine“, 196/769 = 25,5 %, ohne D5 122/384 = 31,8 % | stimmt (Entscheid sagt „25 %“, gerundet) |
| stichprobe.cjs | Exit 0, 30 Proben gedruckt (#29 STADT_MASSEN FC:4072 steht) | stimmt |
| vielfalt-zweit.cjs | „GLEICH: heute 440/21/4.7/0.058 · V2 746/63/5.74/0.063“ | stimmt |
| richter-kopplung.cjs | 440/21/4,70/5,8 % · 746/63/5,74/6,3 % · 377/44/2,67/14,3 % · 602/63/3,07/10,2 % | stimmt mit §WAS NICHT HÄLT 1, Zeilen 1–4 |
| spike-v2-zweit.cjs | „ZWEITZÄHLUNG GRÜN“ | stimmt (gehört zu spike-v2.md) |
| bahnen-besitz.cjs | GRÜN 17/17 | stimmt; zu den Lücken siehe (1) |

Die Logs stützen die übrigen Kopplungs-Zahlen von §WAS NICHT HÄLT:
- richter-zahlen.log:15 und :20: Zeilen 5–6 der Tafel (620/63/3,07/8,0 % · 642/63/3,47/6,9 %).
- kopplung-richter.log:1–6: 226/2 595 = 8,7 %; <5 m 141/268, 5–6,5 m 166/261; ab 6,5 m 77+342+735+223+685 = 2 062 von
  77+346+735+223+685 = 2 066; 80,15 ms je Haus.
- kopplung-richter-varianten.log: 0,55 · 0,54 · 0,84 ms je Haus, mit Miete 15,5 % und <5 m 33/268; Grund „Tiefe“ 209.

## UNSICHER (4)

- Die Cache-Schlüssel 1 189 / 1 994 (§3) habe ich nicht nachgezählt. Ihr Rechenweg ist im Text beschrieben, ein Skript dazu fehlt.
- Cherry-Pick 5a5b53f37 und der Hunk FC:1513–1522 sind nicht an der Quelle geprüft (kein git erlaubt); belegt nur über lesen-zweige.md.
- „+2 Draw-Calls im 40-m-Ring“ ist zweifelhaft. Jeder Fenster-Flügel bleibt als eigenes Blatt aus den Bündeln
  (siedlung-instanz.js:518). Je Haus-Gestalt und Fenster-Größe kann das mehr als zwei Gruppen ergeben; gewählt, ungemessen.
- Ob freie-slots, chunk-satz und portal-gestalt brechen, wenn Fenster als `tuer`-Blätter reisen (s. (3)).
