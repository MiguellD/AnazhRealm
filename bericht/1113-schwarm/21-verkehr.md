# 21 Verkehr (Pflicht C): die Mechanik fährt, der Richter fehlt

## Was der Spieler sieht
- Dorf der Ankunft (`BILD/dorf-main-0.5.png`): ein brauner Erdplatz, Laterne, Marktstand, sieben Bewohner, ein weißes Haus. **Kein Wagen.** Das kommt vom Gesetz: „ein Dorf fährt nicht“ (fachwerk-core.js:4037, :4065 `N = staedtisch ? ceil(Häuser/15) : 0`; Aufruf nur bei `S.plan.staedtisch`, stamm/siedlung-bewohner.js:1635).
- Markt, Messort stadt, main (`KO/probe-post/w28-verkehr-bild/71bb1587-stadt.png`): eine Pflastergasse zwischen beigen Kästen, rechts unten ein gelber Kombi angeschnitten. Die Kabine ist dunkel, einen Fahrer erkenne ich nicht. Die Haut wirkt wie aus Platten gebaut.
- Metropole stadt-voll, main (`…/71bb1587-stadt-voll.png`): ein Kopfsteinplatz, etwa 30 Bewohner als Klötze im Gras, Laternen. **Im Bild ist kein einziger Wagen**, obwohl die Stadt laut Gesetz 20 fährt.
- Zweig w28-stadt-grammatik (`…/w28-stadt-grammatik/2ba36747-stadt-0.5.png`): eine blaue Limousine fährt in der Gasse dem Auge entgegen. Sie hat einen Schatten und hält ihre Spur, die Scheiben sind dunkel, ein Fahrer ist nicht zu sehen.
- Auf demselben Zweig (`…/55c820a6-stadt-mauer-links35.png`): **ein Bewohner liegt quer über der Motorhaube** einer schwarzen Limousine. Sie steht auf braunem Erdboden neben der Trasse (FUND-REGISTER.md:208).

## Was die Quelle sagt
**Gesetzbuch (kann):** Der Kern hat `VERKEHR_GESETZ` (fachwerk-core.js:4062–4063: 15 Häuser je Wagen, zwei Spuren, Wende 7 m, Plätze 5,4 × 2,3 m), dazu `verkehrVon` (:4064) und `verkehrsNetz` (:4080; Export :10617).
**Welt (konsumiert):** stamm/siedlung-verkehr.js (2388 Z.) liest alles davon:
- Netz, Stufe und stark zusammenhängender Teil (:27–158)
- Wende und Platz als Boden (:159–220) und das Spur-Raster (:227–258)
- je Wagen ein Fahrer mit Tag- und Nachtschicht, Folge, Zonen, Warte-Graph (:1401–2023)
- Gleiten im Bild (:703), Sitz (:787), Klang (stamm/klang.js:1106)
Leser außerhalb: koerper-fahrt.js:1373 (Boden), siedlung-bewohner.js (:1313, :1337, :2057, :2093, :2171, :2348, :2577, :2629, :2662, :3212), siedlung-ort.js:761/:801 (Pose „trasse“).
**Linse VK** (scripts/diag-fahr-leben.cjs:836–964, `VERKEHR` :854):
- prüft 10 und 23 Uhr, je 600 s, mindestens 20 Wagen, Frist 300 s, Weg ≥ 30 m je Minute, Abstand 0,2 m, Leib-Halt ≤ 20 s, Warte-Kreis, Bild-Ruck ≤ 0,15 m, Ohr, Arbeit ≤ 0,25 × Soll
- läuft in jedem `ci voll` (check.yml:790–796, `npm run gate:fahr-leben`, package.json:140)
- `gate:verkehr-takt` fährt nur 10 Uhr mit 300 s (package.json:141). Auf der GTX war das am 12.11. GRÜN (`probe-post/w28-verkehr-bild/71bb1587.md:56–57`).

**Die Meisterkarte (PM/stand.json):**
- `pflicht.C` hat 0 von 2 Punkten, Status „ohne Richter“ (:4771–4785, :5103–5125).
- **pflicht.C#1 (headless) ist seit 07.11. ungemessen.** GRÜN war es zuletzt an 782ce8a3: „20 am Steuer, Trasse 180000/180000, Minute ≥ 103/176 m, 142/145 Ankünfte, 0 Berührung“ (PM/messung/782ce8a3-headless.json:7–13). Danach gibt es keine einzige `*-headless.json` mehr (89 Dateien, die jüngste vom 07.11. 18:39). Headless misst nur über die Farm (punkte.cjs:3916 `farmRufen`, `.github/workflows/punkte-farm.yml`).
- **fahrzeug.K2#2 kann ohne Änderung nie GRÜN werden:**
  - Die Station fährt 12 s je Stunde (stationen/g5.js:5624 `PW.torBefehl(PW.fahrVerkehr, "12")`, proben-welt.cjs:1018).
  - Die Linse verlangt seit w28-verkehr-graph ein Fenster ≥ `fristS` 300 s (diag-fahr-leben.cjs:920).
  - Ergebnis an ec281422 auf der Radeon: „Fenster 12 s < Frist 300 … 0 Ankünfte“, 2,92 min GPU je Fahrt (PM/messung/ec281422-radeon.json).
  - Zusätzlich ist `ohne = ["25°-Hang","Furt","Ego und Third"]` fest verdrahtet, und dann gilt `gruen: c && ohne.length === 0` (g5.js:5637–5639). Die Station ist also ein Zwilling von C#1 ohne Möglichkeit, grün zu werden.
- **Das Band in der Stadt:** pbRichter läuft nur durch den Markt, Ego, gehend (g6.js:1222 `stadt-ego-geht`, :1483–1486). Band-Zellen gibt es nur für wiese, genesis und dorf (g6.js:1223). stadt-voll mit 20 Wagen und 300 Häusern hat **keine Zelle**, weder Ego noch Third, weder Radeon noch GTX. Das steht als Teil „ohne Richter“ in PM/pflicht.json:32–36.
**main ist nur knapp grün:** Die Wagen 14 und 15 haben 496 bzw. 423 m Fußweg zum eigenen Wagen und kommen nur durch, weil sie früh aufstehen (FUND-REGISTER.md:184). Geheilt ist das in w28-stadt-grammatik 22872718: die Wagen gehören Häusern im Ring, die Wende hat keine Begegnung. Dort gemessen auf der GTX in voller Länge: 10 Uhr 0,34 m und 72 m/min, 23 Uhr 0,35 m und 149 m/min, 145 bzw. 154 Ziele (Commit-Rumpf 22872718).

## Die EINE begrenzende Entscheidung
**C entscheidet sich an seinem Richter, nicht am Verkehrs-Code.** Die Mechanik des Kriteriums läuft in jedem `ci voll`. Was den Eintrag sperrt, sind zwei Lücken: Den einen Teil (Band in der belebten Stadt) misst keine Station. Der andere (C#1) wurde seit sechs Tagen nicht gemessen, und der GPU-Zwilling ist so gebaut, dass er ROT bleibt. Darum gilt: **kein neuer Verkehrs-Schritt, bis C ganz gemessen wird**, und zwar mit dem Richter, der schon existiert, an dem Ort, den das Kriterium nennt (stadt-voll). Kein Soll, keine Schwelle und kein Band-Wert werden bewegt.

## Der Schnitt
**Stufen (die Klasse „Richter von C“ in einer Welle):**
1. **Zwilling tot:** In fahrzeug.K2 Staffel 2 fällt der C-Teil (g5.js:5621–5654). Das Urteil von K2#2 nennt dann nur noch Hang, Furt und Sichten (das ist seine Staffel). C wird allein von pflicht.C#1 gemessen. Das deckt sich mit pflicht.json:36 („trägt den Eintrag nicht mehr“). Die Proben in g5.js:5643–5651 gehen mit.
2. **Band-Zellen in stadt-voll:** In pbRichter kommt ein Schritt „stadt-voll“ dazu, nach dem Muster des Schritts dorf (g6.js:1477–1482: `U`/`B` in Ego und Third). Neue Zellen sind `band:stadt-voll-ego` und `band:stadt-voll-third`, gemessen um 10 Uhr bei fahrendem Verkehr. Die Werte kommen unverändert aus spec/profiband/haushalt.json `band` (208 dc, 680k Tris, 118 MB, p95 ≤ 33 ms, CPU-Takt ≤ 5,8 ms). Diese Zellen urteilen **nur** eine neue Station `pflicht.C#2` (radeon und gtx), nie profiband.K1–K3. So wird keine Schwelle strenger und kein gebuchter Punkt gerät in Gefahr. pflicht.json C bekommt `["pflicht.C#1","pflicht.C#2"]`, `ohneRichter` wird leer. Mutante nach g6.js:1811: „die Stadt trug keinen Wagen“ muss ROT ergeben.
3. **C#1 frisch messen:** einmal headless am Kopf (`run --geraet headless`, die Farm). Warum seit dem 07.11. nicht gefahren wurde: nicht gelesen.

**Leser-Liste (vor dem Schnitt, steht im Commit):**
- g5.js:5629–5641: Urteil K2#2, liest `VERKEHR {` und die VK-Zeilen
- g5.js:5693–5716: `pflichtCUrteil`
- proben-welt.cjs:1001–1028: `fahrVerkehr`, einziger Rufer ist K2#2. Danach hat sie keinen Leser mehr und fällt mit.
- g6.js:1221–1223 und :1477–1486 (Band-Liste und Schritte), :1811 (Mutanten)
- pflicht.json:30–37
- PM/punkte.cjs (Buchung `pflicht`: liest pflicht.json je Eintrag)
- spec/profiband/haushalt.json (Messort-Liste: stadt-voll muss als Ort mit Spielerplatz stehen; nicht geprüft, ob er dort steht)
- Spiel-Code: keiner

**Kosten-Zeile:** In der Welt ändert sich kein Byte, also Schirm-Kosten 0 und Kalt-Zeile B ±0.
- Messplatz: −2,9 min GPU je Fahrt (K2#2 auf der Radeon, ec281422)
- Messplatz: etwa +40 s je Gerät (Gründung der Metropole ~20 s, geschätzt in g5.js:5620, plus zwei Band-Fenster wie bei dorf, 20 s Budget nach g6.js:1477)

**Kriterien der Meisterkarte:**
| Id | Ist | Soll | Station |
|---|---|---|---|
| pflicht.C | 0/2 P., „ohne Richter“ | jeder Teil gemessen, alle Paare GRÜN | pflicht.C#1 headless + neu C#2 radeon/gtx |
| pflicht.C#1 | ungemessen seit 07.11. (zuletzt GRÜN 782ce8a3) | GRÜN 10 und 23 Uhr × 600 s | headless (Farm) |
| fahrzeug.K2#2 | ROT konstruiert (12 s < 300 s; `ohne` fest) | ROT nur noch beim Namen Hang/Furt/Sichten | radeon, gtx |
| pflicht.E | ungemessen (Absturz 36f9d45a) | E hält | g6 pbRichter |

**Bildpaar:** feste Kamera stadt-voll, Pose „trasse“ (siedlung-ort.js:801), 10 Uhr, Ego und Third. Die Abgabe zeigt die Band-Zahl neben dem Bild, nicht das Bild allein.

## Was schon liegt
- Alle `w27-verkehr-*` und `w28-verkehr-*` sind gelandet (0 Commits vor main: verkehr-leib 314ff351, verkehr-takt dc26ea3f, verkehr-graph 4b0d8ec7, verkehr-bild 71bb1587). w27-verkehr-station-pm ist ein alter PM-Zweig, 8378 vor und 9681 hinter main.
- **w28-stadt-grammatik 156cc903 (OMEN):** trägt die Verkehrs-Heilung (Ring-Wagen, Wende ohne Begegnung, Kranz samt Ausscheren, freier Fahrer-Stand; Proben 15d–15g in `scripts/lib/verkehrsnetz-proben.cjs`). Es hängt an `w28-mp-boden` f97fe692 (WIP), die Mehrspieler-Wand ist am Zweig ROT (UEBERGABE-2026-11-13.md:39, :87–89). Bis zur Landung fehlen: zuerst mp-boden landen, dann grammatik mischen und abgeben.
- **w28-samen-fahrzeug 5406f47d (WIP):** Befund zur Haut. 223 von 235 Haut-Meshes sind BoxGeometry. Variante (c) hat 20 578 statt 28 716 Dreiecken und 17,9 m Fugen. Es gibt nur ein Rezept, keinen Welt-Pfad (Commit-Rumpf). Das ist eine Nachbarklasse (Fahrzeug-Bild), nicht C.
- Für die Stufen 1–3 oben liegt kein Zweig.

## Ehrlich offen
- **Der Spieler sieht C nirgends, wo er ankommt.** Das Dorf hat keine Wagen, auf der stadt-voll-Pose ist kein Wagen im Bild. Das Kriterium C verlangt die Ankunft nicht. F verlangt die Stadt um den Platz und vier Wagen auf der Runde (PFLICHT-OFFEN.md F), und das steht in der Stadt- und F-Kette (Blatt kurs-C §4 Punkte 5 und 7).
- **Widerspruch zum Bild:** VK zählt 0 Berührungen mit Leibern, aber im Bild liegt ein Bewohner auf einer Haube (Zweig, einmal gesehen, nicht wiederholt). Die Linse zählt `beruehrt.leib` offenbar am fahrenden Wagen. Ob ein stehender Wagen mit Fahrer in falscher Lage gezählt wird: nicht gelesen (`_verkehrSitz` :787, `_verkehrEinsteigen` :824 nicht gelesen).
- Ob ein Fahrer am Steuer **im Bild** zu erkennen ist: VK meldet ihn als gezeichnet (`stufe.ohneFahrer`), mein Auge findet ihn hinter den dunklen Scheiben nicht (zwei Bilder).
- Band in stadt-voll: **nie gemessen.** Ob 20 Wagen und 300 Häuser das Band halten (dc ≤ 208, CPU-Takt ≤ 5,8 ms), weiß ich nicht. Schon die Wiese reißt Genesis Third mit 6,3 ms (PFLICHT-OFFEN E).
- Warum die headless-Farm seit dem 07.11. nichts liefert: nicht gelesen. Die CI-Zeile `gate:fahr-leben` am Kopf ec281422: nicht gelesen (dass main grün landet, ist nur abgeleitet).
- Ob stadt-voll in spec/profiband/haushalt.json einen Spielerplatz hat: nicht gelesen (dort nur `wiese` :55 gefunden).
- Die Statuszeile C in docs/PFLICHT-OFFEN.md:18 („heute misst keine Station …“) ist veraltet. Sie darf nur der Schöpfer setzen.

## Rang
Wirkung **2** im Bild (der Spieler sieht nichts Neues), **5** im Takt: Der Eintrag C kann erst fallen, wenn ihn ein Richter ganz misst, und ein Zwilling mit 2,9 min GPU je Fahrt fällt weg. Aufwand **S** (nur PM: g5/g6/pflicht.json, kein Spiel-Byte). Risiko: Die erste Band-Zahl in stadt-voll kann ROT sein. Dann ist ein echter Kostenpunkt benannt, der die nächste Verkehrs-Arbeit an den Schirm bindet, und kein Punkt geht verloren, weil C#2 nicht zu K1–K3 zählt.
