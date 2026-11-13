# F4 studios-und-pfad

Gelesen: Blätter 25–32 ganz, UEBERGABE-2026-11-13 §2–§6 + STAND BEIM SICHERN. Stichproben an SPIEL (main ec281422) und an den Zweigen
(je Blatt ≥ 2, Ergebnis in Klammern). Selbst angesehen: PM `messung/roh/900c28e6-radeon/studios.K4_1-k4/portale-welt.png`, `portale-buehne.png`,
BILD `studio-welt/werk-kathedrale-L0-frueh.png`. Reihung: zuerst, was der Spieler an der Ankunft sieht oder fühlt und S kostet, dann M, dann L.

## Die Schnitte, gereiht (höchstens 10)

**1 · Stein-Korn am Quader (Blatt 26) · S**
- Mangel im Bild: In `portale-welt.png` liegt das Tor unter feinem grau-braunem Salz-und-Pfeffer-Korn. Die Lagerfugen sind nur noch als schwache
  Linien zu ahnen, Bögen und Pfeiler lesen wie gegossen. Im Labor (`portale-buehne.png`) ist jede Fuge eine klare helle Linie und jede Fase eine Kante.
  Auf der Bühne (`werk-kathedrale-L0-frueh.png`) liegen in Blick 2 und 3 Tarnflecken, die größer sind als ein Stein. Eine Fuge ist dort nicht zu sehen.
- Wurzel: `stamm/studio-stoff.js:592` `_steinStoff(…, TSL.smoothstep(0.3, 0.6, rauh))`, geprüft. Rauheit 0,88 ergibt dort 1, also das volle
  `_mikroRelief`/`_mikroStoff` (`stamm/stoff-material.js:2824–2828`, geprüft). `STEIN_GESETZ.quader` hat kein Korn-Feld (`porta-core.js:293`, geprüft).
- Entscheidung: Ein Quader trägt nur, was sein Gesetzbuch nennt. `quader.korn = 0` wird die Zahl, die Rauheit entscheidet das nie mehr.
- Schnitt: `porta-core.js:293` +`korn:0` (additiv) · `studio-stoff.js:592` liest `G.korn` · `stoff-material.js:2821–2828` baut bei 0 keinen Mikro-Graph.
- Leser: porta-core.js:292–297, :1320 · foundry-bruecke.js:696–698 · koerper-leib.js:1433 · phyto-core.js:5564 · studio-stoff.js:182–185, :585–593, :726 ·
  stoff-material.js:2779–2829 · siedlung-satz.js:59, :1663–1670 · Linsen diag-portal-membran, gate:studio-huelle (nicht gelesen).
- Kosten: 0 Programme mehr (die Signatur `"stein:"+mp.stein` gibt es schon), weniger ALU je Tor-Pixel, am Schirm gebunden.
- Karte: studios.K4#1 Ist portale 0,9466 (900c28e6-radeon) ↔ Soll ≤ 0,021, beide Geräte ungemessen. Wache: tore.K3#1/#2 GRÜN 30/30 und 10/10.
- Liegt: nirgends. Ein Commit von main, Bildpaar an der Pose von `portale-welt.png` und 6 m vor dem Tor am Genesis-Ring.

**2 · Tor-Durchgang: ein Wechsel, kein Schwarzbild (Blatt 32) · S**
- Mangel im Takt: In Third wechselt jede Fahrt dreimal die Welt (A→B→A→B), auf beiden Geräten. Dazu kommen 2,9–9,7 s Tafel mit Luma 0,002–0,043
  (`1e00bfdb-gtx`/`1cd1c408-radeon tore.K1_1.out`, aus dem Blatt, nicht nachgelesen).
- Wurzel 1: `stamm/siedlung-tor.js:610` `armed: true` beim Anlegen, das Feuern an `:721–731` mit `rec.armed !== false` (geprüft). Ein Spieler, den der
  Wechsel in die Apertur setzt, ist sofort bewaffnet.
- Wurzel 2: `stamm/speicher-laden.js:1240–1245` zeigt die Tafel statt des letzten Bilds (geprüft).
- Entscheidung: Das Tor jagt keine Zeit (die gehört B). Es schneidet nur, was allein das Tor bricht.
- Schnitt: `:610` `armed:null` → erster Takt `armed = !inApertur`, **und `:722` auf `=== true`** (sonst feuert null). Der Schirm hält eine Kopie der
  Leinwand. Stufen sind alle Rufer von `_weltWechsel`: speicher-laden.js:1184, :2215 · speicher-welten.js:567, :596 · netz-portal.js:617.
- Leser: `rec.armed` siedlung-tor.js:610/682/706/722/730, netz-portal.js:771 · Schirm dirigent-ankunft.js:510, :1356–1371 · dirigent-takt.js:1350/1403/1481/1767 ·
  koerper-bewegung.js:2419 · index.html:281, :8288.
- Kosten: ein Vergleich je wachem Tor. Eine Leinwand-Kopie je Wechsel, die nur unter dem Schirm lebt.
- Karte: tore.K1#1 Ist Third 3 Wechsel, Luma 0,002–0,043 ↔ Soll 1 Wechsel, Luma 0,05–0,95. t ≤ 2 s und Frame ≤ 100 ms bleiben ROT, also **0 Punkte**: das Gewinn ist Erlebnis.
- Liegt: `w16-tor-durchgang` d4aef5b5, 1600 Commits hinter main. Rumpf b40aa15c (Rückwurf, Radeon: „bis drei" → „ein Wechsel") und a6f8535f
  (`_ladeschirmHalt`). Aus dem Rumpf neu schneiden, nicht mergen. Fern-Gedächtnis und „Abschied in Raten" werden nicht genommen.

**3 · Arena-Hof in die Welt (Blatt 29) · S**
- Mangel im Bild: Die Arena-Zone von F ist eine leere Fläche (r 260, k 9). Ein Bild davon hat niemand gesehen.
- Wurzel: `ARENA_HOF` `schmiede-core.js:4691`, exportiert `:5207`. Leser sind nur das Labor (`worlds/schmiede/schmiede.js:944`), in `stamm/` und
  `fachwerk-core.js` 0 (Grep, geprüft). Die Sätze „Arena bleibt Fläche" stehen in `fachwerk-core.js:9653` und `siedlung-ort.js:2188–2189` (geprüft).
- Entscheidung: F wächst nur aus Gesetzbüchern, die schon tragen. Die Arena fällt ganz, Strecke, Kind und Silhouette gehören nicht in diese Welle.
- Schnitt: `arenaHofTeile(yaw)` in schmiede-core (additiv, Waffen-Goldens byte-gleich) → Labor `schmiede.js:530/944` liest sie → Wirt `siedlung-ort.js:2193`
  setzt nach dem Muster des Spielplatzes `:2191` alle Hof-Bauten, Geräte, Glieder und Stufen. Beide Sätze sterben, der Absenz-Grep „bleibt Fläche" ergibt 0.
- Leser: siedlung-ort.js:2139–2144, :2202–2205, :2214–2238 · kampf.js:2051/2059/2097/2265 · dirigent-takt.js:1081 · fachwerk-core.js:10006–10010/10058/10487/10519.
- Kosten: Ankunft Δ 0. Der Rand liegt bei ≈ 228 m und damit über `residentM` 210 (`fachwerk-core.js:9707`, geprüft). Kosten an der Arena nicht gemessen
  (Brief ≤ 45k Dreiecke).
- Karte: Pflicht F hat `stationen: []`. Abgabe ist das Bildpaar am Ende von Weg k 9, die Werk-Zahl (≈ 84, von Hand gezählt) und kampf-proben 3114 an gesetzten Werken.
- Liegt: kein Zweig.

**4 · Das Werk des Willens hat Vortritt (Blatt 31) · M**
- Mangel im Takt: Das Werk steht, ist aber 1–5 s nicht im Bild. Die Phase `bild` summiert sich auf 9 831 ms über 8 Fälle (ec281422-gtx, aus dem Blatt).
- Wurzel: `_bauFrist` `stamm/dirigent-takt.js:1847–1876` (geprüft). Vortritt gibt es nur für den Hungrigsten (`:1860–1862`), nie für den Akt.
  Der Satz legt neue Gruppen mit Budget 0 in Raten (`siedlung-satz.js:133`, `:137`, geprüft). `_vorbauBedienung` `siedlung-bauten.js:1365` baut nur den Geist (`:1386`, geprüft).
- Entscheidung: Das Werk des Willens ist nie Strom. Die Frist bleibt 6 ms + 3, nur die Reihenfolge ändert sich.
- Schnitt: eine Marke `st.wille` aus `confirmBuild` und `_dslSpawnStudioItems` (menschliche Quelle) → Vortritt in `_bauFrist` → volle Frist für Satz
  (`siedlung-satz.js:133/137/352`) und Knoten (`bild-kosten.js:745/876`) → der Vorbau baut die Stoffe des Werks als Gast ohne Raum.
- Leser: alle Rufer von `_bauFrist` (gelaende-chunks.js:2780 · dirigent-takt.js:1723 · vegetation-baum.js:2405/2924 · vegetation-streu.js:1165 · stoff-karte.js:891/1207 ·
  studio-gestalt.js:106 · siedlung-bauten.js:195 · gelaende-fern.js:25/1979 · siedlung-satz.js:1090) · dirigent-takt.js:632 · siedlung-bauten.js:1458/1466 ·
  diag-werkstatt-weg.cjs:1020–1038 · gate:takt T9.
- Kosten: je Takt unverändert. Der Vorbau läuft erst nach `_weltbildDa`.
- Karte: bauen.K1#2 Ist GTX ROT (kalt 3881/4631, warm 1826 ms) ↔ Soll ≤ 1000 ms, 8/8 L0. Radeon ungemessen, weil die Werkbank abstürzt (Exit 3221226505).
- Liegt: kein Zweig. Vorher muss `w28-richter-hand3-pm` 8afcd41a in der PM stehen.

**5 · Der Fuß-Rig der Third-Kamera gleitet (Blatt 30) · M**
- Mangel im Gefühl: Beim Sprint durch die Haustür zittert die Kamera, Ruck p95 0,035 > 0,02 m (`ec281422-radeon/leib.K4_2.out:123`, aus dem Blatt).
- Wurzel: `stamm/koerper-bewegung.js:2057` `if (!(arm >= 0) || t <= arm) arm = t` (geprüft) und `gleit()` `:1988–1991` nur hinaus (geprüft).
  Dazu Säule und Höhe ohne Glättung (`:1973`, `:1926/1970/1997`, nicht nachgelesen). Der Kern trägt nur `armRadiusM`/`armRuhe` (`koerper-core.js:711`, geprüft).
- Entscheidung: Jeder der fünf Freiheitsgrade gleitet in beide Richtungen nach EINEM Gesetz `fx.bewegung.kamera`. Sicherheit kommt aus dem Wurf
  gegen den vorausgesagten Leib.
- Schnitt: `vorlaufS`/`hineinMs` in koerper-core (additiv) → Arm `:2056–2063` → `gleit` symmetrisch → Säule über `gleit` → ein Höhen-Glätter für beide Sichten.
  **Die neue Rate hinein gilt nur zu Fuß**: Der Arm-Code `:2056–2062` ist mit dem Ritt geteilt (posEase `:2059–2060`), ohne Weiche fährt der Ritt nicht byte-alt.
- Leser: koerper-bewegung.js:1704, :1781–1783, :1867–1868, :1950–1951 · stoff-material.js:3426 · diag-ankunft.cjs:1856/1911 · diag-kamera-laub.cjs:421/456/486/643/759/961 ·
  diag-fachwerk-contract.cjs:490 · speicher-welten.js:3469 · gate:fahr-leben T4.
- Kosten: gleich viele Feld-Proben je 3rd-Bild (Soll ≤ 35,4 Mittel, `diag-kamera-laub.cjs:126`).
- Karte: leib.K4 Ist 1 ↔ 2. #2 radeon ROT 0,035, gtx ungemessen. Es halten müssen K4#1 (Kugel 0/1090), leib.K2 und fahrzeug.K4.
- Liegt: kein Zweig. Bildpaar am weißen Haus des Dorfs, Sprint die Stufen hinauf.

**6 · Die EINE Studio-Seite: Liste, Bühne, Himmel, Ansicht (Blätter 25 + 28 + 27, eine Klasse) · L**
- Mangel im Bild: Auf der Bühne liegt ein schwarzes Band statt Himmel (`werk-kathedrale-L0-frueh.png`, gesehen). Sieben Seiten bauen sieben
  Renderer: r128 `WebGLRenderer` in tetrapoda.js:186, koerperstudio.js:83, porta.js:172, fachwerk.js:633, phytogenesis.js:531, WebGPU in
  garage.js:23 und schmiede.js:16 (Grep, geprüft).
- Wurzel: `studios(B)` am Zweig (`huelle.js` 2700–2735 auf origin/w28-studio-seiten, geprüft) rät die Zuordnung Seite → Kern aus dem HTML-Text in einer
  Runden-Schleife. `cores.manifest.json` hat 9 Kerne ohne `seite` (geprüft). `diag-studio-huelle.cjs:61` trägt eine Hand-Liste, `:77` ENGINE_RATSCHE (geprüft).
- Entscheidung: Die EINE Liste ist `cores.manifest.json` mit `seite` je Kern. Der EINE Zeichner ist `AnazhHuelle.studio()`, und die Ansicht der garage
  zieht als `S.ansicht` hinein (`garage.js:384–408`, `:670–686`, geprüft; am Zweig fehlt sie in huelle.js). Die Bühne trägt den Himmel der Welt.
- Stufen in EINER Welle auf `w28-studio-seiten`: (a) 6039dc13 darunter landbar machen · (b) `seite` + `studios()` ohne HTML-Abruf, mit dem Gelände
  als Kachel · (c) Himmel der Bühne · (d) Ansicht in `studio()`, garage ruft `studio()` · (e) portale (liegt), terrain, koerperstudio und tetrapoda
  umziehen. In beiden Leib-Studios fallen `laborStoff`, Composer und PD-Rig mit `Math.random` (24 Treffer in beiden Dateien, geprüft); die Ruhe kommt
  aus `leibRigPose` (`koerper-leib.js:921`, geprüft) · (f) fachwerk zuletzt (Kopplung) · (g) `worlds/terrain/lib` fällt, `spec/studios/k4.json` fällt als Abschrift.
- Leser: stamm/studio-bruecke.js:325/803 · foundry-bruecke.js:305 · abnahme-urteil.cjs:1750 · pack-kanon.cjs:36/42 · kern-stufen.cjs:10 · asset-worker-harness.cjs:22 ·
  diag-studio-vertrag.cjs:35/907 · diag-studio-huelle.cjs:61/67/77/338–345 · albedo-tafel.cjs:68–79 · diag-albedo-tafel.cjs:401 · diag-tier-gang.cjs:647–648 ·
  huelle.js werkMass/bruecke · welt-licht.js buehne · netz-portal.js:1379.
- Kosten: Die Ankunft lädt keine Hülle (aus den Seiten gefolgert, nicht gemessen). Neubau koerperstudio 4253–6468 ms darf nicht steigen.
- Karte: studios.K4#1/#2 0 P ↔ ≤ 0,021. studios.K2#2 und K3#2 ungemessen. K1 und K5 halten. Abnahme ist das Bildpaar je Seite Labor ↔ Bühne: keine Seite liest schlechter.
- Liegt: `w28-studio-welt` 6039dc13 (Abgabe, Code-Check ROT) · `w28-studio-seiten` ad504fbe (WIP, +1610/−408 in 20 Dateien, geprüft).

**7 · Verkehr liest Prägung und Epoche (Blatt 25) · S, nur Stadt**
- Wurzel: `epocheAusJahr` `vehicle-core.js:4823` hat 0 Aufrufer, der Export steht an `:4979` (Grep, geprüft). `siedlung-verkehr.js:605–615` setzt ohne `studioOv`
  (nicht nachgelesen). Schnitt erst nach `w28-stadt-grammatik`, als Teil von Pflicht C. An der Ankunft wirkt er 0.

## Kopplungen (die Reihenfolge ohne Kreis)
- 1 vor 6: Ohne Korn-Schnitt zeigt die umgezogene Tor-Seite Tarnflecken (gesehen) bei fallender K4-Zahl, also ein Rückschritt im Bild.
- 6 hängt an der Mehrspieler-Wand: 6039dc13 ist ROT, der Kipper an main-Zweigen ist UNBENANNT (Übergabe Nachtrag 21:06). `w28-mp-boden` f97fe692 heilt ihn nicht nachweislich.
- 6(f) fachwerk hängt an `w28-stoff-fuge` 212b6de9 und `w28-fassade` der OMEN-Kette, die wiederum an mp-boden und stadt-grammatik hängt. Damit
  die Klasse ganz fällt, landet die Welle 6 erst mit fachwerk. Bis dahin bleibt sie Zweig, sie landet nicht ohne fachwerk.
- 2 und 6 berühren beide `stamm/siedlung-tor.js`, an getrennten Stellen (Zweig: `_fluegelSchwenk` um :831; Schnitt 2: :610/:722, geprüft). Kein Konflikt.
- 4 und B: Die Werk-Marke darf den Bodenstrom nicht aushungern, gate:takt T9 im selben Lauf.
- 5 und fahrzeug.K4: Die Ritt-Weiche ist Pflicht (siehe Schnitt 5).
- 3 unabhängig. 7 nach der Stadt. Reihenfolge: 1 → 2 → 3 → 4 → 5 (parallel möglich, getrennte Dateien) → 6 nach Wand-Täter und Stoff-Fuge → 7 nach stadt-grammatik.

## Widersprüche zwischen den Blättern und was die Quelle sagt
- K4 garage: Blatt 25 nennt 0,8472 (12f2f146-radeon), Blatt 28 nennt 27,2 % (k4.json am Zweig, Stand 900c28e6). Das sind zwei Stände und zwei
  Bühnen. Gültig ist nur die nächste Messung der Station.
- Blatt 27 nennt `buehne + B.werk`, Blatt 28 `AnazhHuelle.studio`. Am Zweig ist `studio()` (`:2822`) der Zeichner über `buehne()` (`:2263`), also gilt `studio()` für alle.
- Blatt 25 lässt fachwerk zuletzt umziehen, Blatt 28 zieht es in derselben Welle mit, Blatt 26 erst nach Blatt 05. Die Entscheidung steht in Schnitt 6(f) und unter Kopplungen.
- Blatt 32: „:722 feuert nur bei armed === true". Die Quelle sagt `rec.armed !== false` (`siedlung-tor.js:722`), also muss `:722` mit geschnitten werden.
- Blatt 32 nennt aus b40aa15c nur den Rückwurf. Der Rumpf schnitt auch den Fall des Heimtors am `_genesisUmzug` (damals `siedlung-ort.js:2875`).
  Ob main ihn trägt, ist nicht gelesen.
- Blatt 29 nennt es „Sage a, tue b". `fachwerk-core.js:9653–9654` erklärt, die Zeile habe früher ARENA_HOF und „acht Geräte, die kein Gesetzbuch kennt"
  genannt und der Wirt habe sie als offene Haken gezählt. Der Satz wurde also bewusst zurückgenommen. Heute trägt der Kern 31 Hof-Zeilen (`schmiede-core.js:4691`),
  der Grund der Rücknahme gilt nicht mehr.
- Blatt 26 sagt, die Fugen gehen unter. Gesehen in `portale-welt.png`: Sie sind schwach als Linien zu ahnen, das Korn dominiert.
  Der Kommentar `studio-stoff.js:586` zählt das Mikro-Relief zum Stein-Gesetz, `porta-core.js:279` sagt dagegen, die Welt rechne dasselbe wie das Labor.

## Gestrichen
- Blatt 25: „Rad-Ecken geheilt (d3cfd4d1)" als Beweis. Kein Bild danach, `werk-gt-L0-spaet.png` zeigt laut beiden Blättern schwebende Räder.
- Blatt 27: „~400 Zeilen Zwilling fallen". Ohne Zählung mit Datei:Zeile.
- Blatt 31: „Haus warm → ~0,2 s". Eine Erwartung aus Rechnung, keine Zahl. Messname vorher: `_bauHunger` je Takt.
- Blatt 28: „18 Lichter, 6 Composer" ist ein Regex-Zählwert ohne Zeilen und nicht nachgezählt. Zitierbar ist nur der Renderer-Grep (7 Bauten).
- Blatt 32: „das Gesetz steht NUR in der Probe" ist zu weit. Das Re-Arm beim Verlassen steht im Spiel (`siedlung-tor.js:703–706`), es fehlt nur der Anfangszustand.

## Ehrlich offen
- Der Täter des Mehrspieler-Kippers an `w28-studio-welt` ist unbenannt. Er blockiert Schnitt 6.
- Pflicht F hat keinen Richter (`pflicht.json:47–55` `stationen: []`). Ob Bildpaar plus Werk-Zahl als Richter gilt, entscheidet der Schöpfer.
- Die Werkbank der Radeon stirbt mit Exit 3221226505, Ursache unbenannt. bauen.K1#2, tore.K1 und K4 sind dort ungemessen.
- Haut des Fahrzeugs aus Schnitten (`w28-samen-fahrzeug` 5406f47d, 95 % Boxen): Byte-Bruch aller Fahrzeug-Goldens, braucht das Wort des Schöpfers.
- Strecke (Rahmen ≈ 235 × 130 m zu klein), Kind am Spielplatz (keine Rolle „kind"), Stadt-Silhouette: nicht in dieser Familie geschnitten.
- affekt.K4 liegt um eins daneben (`feld-sprache.js:1305–1327`). Ob Spiel oder Linse falsch zählt, ist nicht entschieden.
- Q12: Der Pfeil trifft den Boden an der GTX 1050, nicht gegraben.
- Welcher Freiheitsgrad die 0,035 m trägt, ist nicht zerlegt. Ob Lider und Iris den Ofen-Leib überleben, ist nicht gelesen.
- K4 belohnt Angleichung nach unten (fachwerk 97,9 → 8,3 %). „Keine Seite schlechter als ihr Labor" hat nur das Bildpaar als Maß.
- Nicht angesehen: Bild vom Genesis-Ring mit Toren, Arena, Tor-Durchgang, Third am Haus, Bildpaare `probe-post/w28-leib-nah/7–13`.
