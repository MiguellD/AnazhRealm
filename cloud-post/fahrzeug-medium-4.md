# fahrzeug-medium-4 — Stand-Blatt (ZWISCHENSTAND)

Sprosse: `karte2.mensch.fahrzeug.medium#2` (Heimholer der Cloud-Welle 27.11.). Zweig `fahrzeug-medium-4` auf `origin/main` eef726c7 (begonnen an 4a188bf2; main 45bad33f, c072c864, 38194f83, 2a2e8a54, 1336dcb8 und eef726c7 gemergt, Konflikt nur in der erzeugten
`spec/stamm/modul-karte.json`). Kopf 1 5c6c3726, Kopf 2 0eac7276 nach der Post des Koordinators vom 26.11. 22:43 und der GPU-Probe 23:02;
Kopf 3 trägt allein dieses Blatt und den Datensatz der begonnenen Sprosse medium#7 (Code byte-gleich mit Kopf 2).
Brief: `cloud-post/fahrzeug-medium-4.md` im Zweig `koordination` (START-BRIEF 26.11. 19:48). Der Briefkasten ließ sich per `git fetch`
nicht holen (der Zweig `koordination` trägt > 17 GiB Geschichte, auch `--depth=1` riss nach 250 s); gelesen über die GitHub-API am
Kopf e9be33b5 des Briefkastens, das Regel-Blatt und die Post an alle ebenso (beide im Zweig `koordination`). Die Station (Zweig `punkte-maschine` a9a4b3d) holt ein
blob-loser, flacher Abruf.

## Täter (vorher, gemessen am main 4a188bf2 mit der Station von heute, Zweig `punkte-maschine` a9a4b3d)

- Die Leiter `mensch.fahrzeug.medium` in der Null-Welt (headless, Messort genesis statt stadt-voll — headless hängt das
  `/umstellen` der Werkbank, swiftshader verliert das Gerät), Code der Station unverändert, nur H nachgebildet:
  „S2 ROT: Umfang nicht erzeugbar: Bremsweg 100→0 0–45.39 m (im Band 75 %), 50→0 im Band 63 %, ≥ 130 km/h 120/160 · die Saat
  ändert die Physik nicht (1 Fahrt je Rezept über 20 Saaten: vehicle-core.js:3474 exportDrive liest keine Saat) · keine
  Spurrinne (kein Spur-Gesetz) · Fächer 160/160 Adressen (20 Saaten × 8 Orte) in 791 ms“ — Zahl für Zahl die Zeile der Runde 39.
- Wurzel: die Station von heute bremst jede Saat auf `() => 0` (eben, ohne Boden) — der Grund des Orts erreicht die Fahrt nicht;
  `vehicle-core.js:4077` `exportDrive(Pin, rezeptId)` trägt Rezept und Parameter, keine Saat. Die Saat erreicht die Physik nur
  über den Grund des Orts (Reibwert, Nässe, Stoff) durch die Leser des Spiels (`_fahrGrund` → `_kontaktStoffAt`, `_fahrHaft`),
  nie über einen Saat-Parameter in exportDrive — kein zweiter Physik-Pfad.

- Kopf 1 (Post 22:43): `gate:fahr-leben` VK 10 Uhr ROT, Warte-Kreis „8>9“ vor der Wende 746/573. Gemessen im Löser (Spur je 4 Bilder,
  Kopf ↔ main): der Kreis-Löser liest KEINE Größe der Vertikale — die Folge (`_verkehrFolge`) liest Lage, Gier, Linie und `rund`. Die
  Vertikale lässt Wagen 9 an seiner Haltelinie 1 cm anders stehen; seine Bug-Ecke (quer 1,827 m neben der Linie von 8) rückt damit vom
  Stück 46 der Linie auf Stück 47, das `rund` an ihrem Fuß springt 0,881 → 0,761 m, die Schwelle 1,941 → 1,821 m: 8 sieht 9 erst
  2,93 statt 8,9 m vor sich, hält 0,8 m tiefer im Bogen, und dort reicht sein Leib samt Ausscheren selbst an die Ecke von 9 (quer 1,84 m
  < 1,88 m). Der Rang des Kreises (`_verkehrKreisDurch`) gab `durch` dem Kleineren — 8 —, der damit nur den Rand verlor, nie den
  Leib: 8 stand mit dem Vortritt, 9 kam vorbei und wartete (ab Bild 1 776 bis zum Ende).
- GPU-Probe 5c6c3726 (radeon-890m, 23:02): `gate:vehicle-drive` ROT an B-k SPUR — 90 Tritte je Zelle, gemalt 0 von 24, Erde 0 von 24
  (swiftshader: 24 von 24). Wurzel: `stamm/siedlung-wege.js` `_tritt` malte den Pfad nur in eine zentrierte Stufe der Wege-Karte; vor
  ihrem ersten Takt (`_tickWegeKarte`) fiel er still — der Stand trug ihn, die Karte nicht. Lokal Zahl für Zahl nachgestellt (die Stufen
  unzentriert vor B-k: `{"gemalt10":0,"erde10":0,"tritte10":90,"tief1":0.17,"tief10":0.28}` — die Zeile der Radeon).

## Abgabe Kopf 4 (auf main eef726c7, nach der Post des Koordinators 27.11. 04:40)

Die Batterie von Kopf 3 d74a5566 (45925730765) war an drei Urteilen ROT; Kopf 4 heilt (1) und (2) an der Wurzel, (3) ist Last:
- (1) Stall-Akte „eigene Ränge neben rang: Träger diag-vehicle-drive.cjs“: der Median der Tritte in B-k ging über
  `[zellen.length >> 1]` — jetzt über den EINEN Rang der Lib (`rang(…sort(aufsteigend))`). `gate:welt-boot` GRÜN, Träger keiner.
- (2) Kollision = Bild „wagen 81,67 m/s → _t_kontakt_mauer — 999 m“: Wurzel war die Hülle des liegenden Wagens (Kopf 1): `pl` · `pq`
  hielten 2 · m0 Ecken, in Ruhe die zweite Hälfte null; die Linse liest die Reihe ganz, null-lange Kanten teilten durch 0, NaN wurde
  „Spalt 999 m“. Jetzt sind `pl` · `pq` je Stand genau m Ecken lang (die Sicht auf den einen Puffer `plPuffer` · `pqPuffer`, gewählt in
  `_fahrHuelleStellen`, keine Allokation je Schritt) — der Vertrag gilt für jeden Leser. `gate:kollision-bild` GRÜN, die Wagen-Zeile
  Zeichen für Zeichen die des main: Eindringen 0,000 m, Spalt max 0,035 m, im Bild Spalt 0,000 m. Die Zeile „phyto:lod.budget … unlesbar“
  trat in keinem lokalen Lauf auf (Kopf 0, main 0).
- (3) Klang-Linse „Ü tier“: lokal allein am Kopf zweimal GRÜN (duckAnteil 0,152 · 0,204); unter Parallel-Last mit zwei fahr-leben ROT an
  einem anderen Befund (Mk Duck 3,57 dB, duckAnteil 0,079) — Last, kein Code dieses Kopfs berührt den Klang.
- Der Geräte-Täter (GTX 1060 Runde 41 an 031f4700, Radeon an eef726c7 27.11. 10:31: „die Saat ändert die Physik nicht (vehicle-core.js:3474
  exportDrive liest keine Saat)“): der Kopf schneidet ihn über den Boden des Orts, gelesen von den Lesern des Spiels (S2 GRÜN headless
  am Kandidaten); die Station an der GPU fährt bis zum Setzen des Kandidaten (`cloud-post/fahrzeug-medium-4-station/`) den alten Code und
  zeigt die Zeile weiter.

## Geschnitten (heimgeholt)

- Der WIP-Kopf 95258865 (`claude/practical-edison-4tvc2m`, sechs Commits auf fahrzeug-stapel 445b4549) als Code-Diff auf main:
  `vehicle-core.js` fahrStand federt (das Rad folgt seinem Boden um Federweg + Reifen, wo die Ebene trägt) · fahrKipp/fahrKippForm
  (SSF, NHTSA 49 CFR 575.105) · `stamm/siedlung-wege.js` `TRITT.rad` 4,5 (Weaver & Dale 1978) und `_trittDurchfahrten` ·
  `stamm/koerper-fahrt.js` `_fahrRad`, `_wagenKippLage` · `stamm/koerper-bewegung.js` die Hülle des liegenden Wagens ·
  `stamm/siedlung-instanz.js` das Rad im weichen Boden · Linsen A10, A11, B-k (`gate:vehicle-drive`), H4b (`gate:fahr-leben`).
  Konflikt nur in `spec/stamm/modul-karte.json` → neu erzeugt (`stamm-umzug --nach-karte`: neu `_trittDurchfahrten`,
  `_wagenKippLage`, Abweichungen 0).
- Das Band im Kern in EINER Zeile (vehicle-core.js fahrKraefte): ADAC 2016, über 500 Bremstests, Mittel 36,4 m, Spanne
  31,3–47,8 m aus 100 km/h trocken (autohaus.de 10.10.2016; ADAC 2021: Porsche 911 30,9 m).
- Der Stations-Kandidat `cloud-post/fahrzeug-medium-4-station/` = die Kandidaten von fahrzeug-medium und fahrzeug-medium-2 als
  EINER, gegen das heutige `origin/punkte-maschine` a9a4b3d (die Datei ist dort byte-gleich mit ihrer Basis 0ba33033); neu nur die
  Zeilen-Anker von S2 auf den heutigen Kopf (exportDrive :4077, fahrGesetz :4273, fahrKraefte :4627, radImBoden :4360, fahrStand
  :4532, `_wagenSchritt` :1599, `_fahrGrund` :1855).

- Die Linse L1 Hangfuß (`gate:fahr-leben`) liest die Ebene des Kerns um das Einsinken (`fahrEbene(…, zf.einsinken)`, dieselbe,
  auf die fahrStand den Wagen legt): am Kopf maß sie 0,060 m „unter dem Gesetz“ (45 Schritte > 0,05 m) — genau das Einsinken im
  weichen Boden des Dorfs (die Spur bleibt jetzt im Gedächtnis: das Rad tritt `TRITT.rad` 4,5, ein Tritt fiel am main unter
  `vergessen`); gegen die Ebene des Kerns 0,000 m, 0 Schritte. main 4a188bf2 maß 0,038 m.

- Kopf 2 — die Bahn: DAS AUSSCHEREN AM FUSS IST STETIG (`stamm/siedlung-verkehr.js` `AnazhRealm._verkehrRundAm`, EINE Funktion für
  jeden Fuß-Leser: Folge — Wagen, Leib, Platz —, Querung, Umfahren): linear zwischen den Punkten des Stücks, an jedem Punkt das größte
  `rund` um ihn — nie kleiner als das `rund` am Anfang des Stücks, das bis hier galt, ohne Sprung an der Grenze zweier Stücke. Die
  Ecke von 9 bei 1,827 m liegt damit an beiden Stücken in der Bahn von 8 (Schwelle 1,941 m): 8 sieht den Stehenden 8,9 m vor sich,
  gleich wo die Vertikale ihn 1 cm hinstellt. Gegenprobe Kopf 2 vor diesem Schnitt: 10 Uhr GRÜN, 23 Uhr ROT „2>8“ an derselben
  Haltelinie (748,6/547,2) — der Rang allein heilte das Beispiel, nicht die Klasse.
- Kopf 2 — der Kreis: VOR DEM RANG FÄHRT, WER VORBEIKOMMT (`stamm/siedlung-verkehr.js` `_verkehrKreisDurch`): reicht der Leib
  samt Ausscheren eines Wagens im Kreis selbst an den, vor dem er hält (`eng`: eine Ecke binnen halber Breite + `rund` an ihrem Fuß,
  ohne jeden Rand, gelesen in `_verkehrFolge`), fährt der Erste derer, die vorbeikommen; kommt keiner vorbei, gilt der Rang allein. EINE
  Regel im Graphen, kein zweiter Stand, kein Flag; der Täter `--mutante-kreis` stellt sie still wie vorher.
- Kopf 2 — der Pfad: DER ERSTE PFAD ZENTRIERT DIE KARTE SOFORT (`_tritt` → `_wegeKarteEnsure`, `_tickWegeKarte`), wie die erste Krone
  und die erste Siedlung es schon taten; der Umzug malt jede Zelle des Stands samt dieser. Die Linse B-k (`gate:vehicle-drive`) fährt
  ihre Spur jetzt an jedem Gerät vor dem ersten Takt der Karte (die Stufen unzentriert) — ohne den Schnitt ROT am Täter (0 von 24), mit
  ihm GRÜN (24 von 24); der Täter-Text nennt den Pfad `_tritt` → `_wegeKarteEnsure`.

## Gemessen (Kopf 2 auf main 38194f83, headless, swiftshader; Kopf 1 auf 45bad33f darunter)

- Kopf 4 auf main eef726c7: `check:statik` GRÜN · `format:check` GRÜN · `lint` 0 Fehler · `gate:welt-boot` GRÜN · `gate:kollision-bild`
  GRÜN · `gate:klang-zensus` GRÜN (allein) · `gate:vehicle-drive` GRÜN · `gate:vehicle-contract` GRÜN · `gate:nervensystem-vehicle` GRÜN ·
  `gate:betriebsgesetz` GRÜN · `stamm-umzug --nach-karte` 5 330 Glieder, Abweichungen 0 · `gate:fahr-leben` main ↔ Kopf beide GRÜN:
  Ankünfte in 600 s 10 Uhr 165 ↔ 168, 23 Uhr 166 ↔ 167, Stöße 0 ↔ 0, Warte-Kreise 0 ↔ 0.

- Kopf 3 auf main 1336dcb8 (der Code von Kopf 2 mit main gemergt, ohne Konflikt): `gate:fahr-leben` die Zeile am main ↔ die Zeile am
  Kopf, beide GRÜN — Ankünfte in 600 s 10 Uhr 166 ↔ 168, 23 Uhr 166 ↔ 167, Stöße 0 ↔ 0, Warte-Kreise 0 ↔ 0 · `check:statik` GRÜN ·
  `format:check` GRÜN · `lint` 0 Fehler · `gate:vehicle-drive` GRÜN (probeUrteil GRÜN) · `gate:vehicle-contract` GRÜN ·
  `gate:nervensystem-vehicle` GRÜN · `gate:betriebsgesetz` GRÜN · `stamm-umzug --nach-karte` 5 323 Glieder, Abweichungen 0.

- Kopf 2 `gate:fahr-leben` (über 480 s, nicht im Probe-Ruf), Zeile am main ↔ Zeile am Kopf, beide GRÜN: SELBSTTEST GRÜN · GRÜN (der
  Ritt fährt den EINEN Fahr-Schritt) · VK-V GRÜN · VK 10 Uhr GRÜN · VK 23 Uhr GRÜN — Ankünfte in 600 s 10 Uhr 165 ↔ 164, 23 Uhr
  166 ↔ 167, Stöße 0 ↔ 0, Warte-Kreise 0 ↔ 0. Kopf 1: VK 10 Uhr ROT „8>9“; Kopf 2 nur mit dem Rang: VK 23 Uhr ROT „2>8“.
- Kopf 2 `gate:vehicle-drive` GRÜN — B-k vor dem ersten Takt der Karte gemalt 0 → 24 von 24, Erde 0 → 24 von 24 (die Zeile der Radeon
  lokal nachgestellt, dann geheilt); `check:statik` GRÜN · `format:check` GRÜN · `lint` 0 Fehler · `gate:vehicle-contract` GRÜN ·
  `gate:nervensystem-vehicle` GRÜN · `stamm-umzug --nach-karte` 5 323 Glieder, Abweichungen 0 (neu `_verkehrRundAm`).
- Die Leiter `mensch.fahrzeug.medium` am Kopf 2 (dorf, Null-Welt, der Kandidat): S2 GRÜN, dieselbe Zeile wie am Kopf 1.
- GPU-Probe Kopf 2 0eac7276 an der radeon-890m (27.11. 00:38, 1 471 s): GRÜN — `gate:vehicle-drive` GRÜN 94 s (B-k: gemalt 0 → 24 von
  24, Erde 0 → 24 von 24 an der Radeon) · `gate:pruefbuehne-licht` GRÜN 56 s · `gate:weltbild-frost:echt` GRÜN 129 s ·
  `gate:studio-begehen` GRÜN 160 s · `gate:webgl-probe` GRÜN 58 s (die Probe-Post zu 0eac7276 im Zweig `koordination`).
- GPU-Probe Kopf 1 an der radeon-890m: `gate:pruefbuehne-licht` · `gate:weltbild-frost:echt` · `gate:studio-begehen` ·
  `gate:webgl-probe` GRÜN, `gate:vehicle-drive` ROT an B-k (oben, geheilt im Kopf 2).

### Kopf 1 (auf main 45bad33f)

- Leiter `mensch.fahrzeug.medium` S2 (Null-Welt, genesis · dorf · wiese): Fahrten je Rezept über 20 Saaten 1 → 20; Prüfstand
  100 → 0 im Band 75 % → 100 % (38,14–45,26 m); 50 → 0 63 % → 100 %; Kurvengrenze 0,992–0,999 μ·g; Spurrinne nach 10 Durchfahrten
  0,006 · 0,143 · 0,006 m; Urteil mit Karte ROT → GRÜN an allen drei Orten; die Leiter 10,7–11,6 s je Ort, Fächer 120/120 in 2,2–2,4 s.
- Wände der Station: `liste` 1976 Stationen · Fehler 2 (genau `gelaende.K2#1/#2`, wie an der Basis) · Selbsttest 544 Stationen,
  5 408 Mutanten, 0 falsch.
- Tore: `check:statik` GRÜN (380 s) · `format:check` GRÜN · `lint` 0 Fehler · `gate:vehicle-contract` GRÜN · `gate:nervensystem-vehicle`
  GRÜN · `gate:vehicle-drive` GRÜN (75 s) · `gate:studio-begehen` GRÜN (203 s) · `gate:fahr-leben` ROT allein an VK 10 Uhr (unten) ·
  `gate:pruefbuehne-licht` ROT an S0 Himmel (Dämmerung 1,16e-7 ↔ 1,07e-7) — am main 45bad33f dieselbe Zeile Zahl für Zahl ·
  `gate:weltbild-frost:echt` nicht fahrbar (swiftshader: der GPU-Prozess stürzt, Device Lost, 580 s).

## Begonnen (Wartezimmer): `karte2.mensch.fahrzeug.medium#7` — die Schwere und die Luft der Welt im Fahr-Satz

Datensatz `cloud-post/fahrzeug-medium-4-s7/` (vier Commits auf Kopf 2 0eac7276 als `s7.mbox`, `git am` legt sie glatt; nicht im Code
dieses Zweigs, nicht im Probe-Ruf). Geschnitten am EINEN Chokepoint `_fahrSatz` (stamm/koerper-fahrt.js) → `fahrGesetz` (vehicle-core.js):
- DIE SCHWERE: der Fahr-Satz liest g der Welt ÷ g der Erde aus dem Gesetz der Welt (`state.gravity`, `_weltGesetz`) — Reibkreis μ·g,
  Rollwiderstand, Last je Rad; Erde byte-gleich. Linse SW (`gate:fahr-leben`, W-Kette): Bremsweg 50 → 0 unter der Schwere der Ferne
  1,000 → 2,631 × trocken (23,65 → 62,22 m), Gesetz 2,644; der Fahr-Satz g × 0,3782 = 3,71 ÷ 9,81.
- DIE LUFT: das Gesetz der Welt trägt ρ (`WELT_GESETZ_ERDE.luft` liest die EINE Zahl des Kerns `vehicle:FAHR.luft.rho` 1,2 kg/m³; die
  Ferne 0,020 kg/m³, NASA Mars Fact Sheet), durch die Wand `_weltGesetz` (Band (0, 100] kg/m³), die Abweichung reist im Speicher, im
  Netz (`netz-p2p` erde) und mit der Reise (`netz-portal`). Der Fahr-Satz trägt die Luft ½ ρ cw A / m (`luftK`) und die Flanke im Wind
  × ρ der Welt ÷ ρ der Erde — nie den Deckel des Tempos darüber (fahrzeug.K1: kein Teil der Luft); Erde byte-gleich (der Abzug ist 0). Linse
  LR: Luft × 0,0167 und Flanke × 0,0167 (= 0,020 ÷ 1,2); Ausrollen 2 s ab 50 km/h dv 2,035 → 1,938 m/s; der Bremsweg liest ρ nicht
  (62,22 ↔ 62,17 m: der Fahrwiderstand zieht über den Reibkreis). Selbsttest: je Hälfte allein ROT beim Namen, „ρ am Deckel“ ROT.
- Tore am S7-Stand: `gate:fahr-leben` (ohne `--verkehr`) GRÜN · Selbsttest GRÜN · `gate:vehicle-contract` GRÜN ·
  `gate:nervensystem-vehicle` GRÜN · `gate:weltgrenze` GRÜN.

## Offen (ehrlich, mit Messname)

- medium#7 `skalierung` (Soll ≥ 0,95 über 100 Saaten fremder Welten, g · ρ · Meer): die Saaten fremder Welten stehen im Planet-Kern
  (`planet-core.js` `planetPlan`: g und `wasserKm` je Saat), aber kein Leser im Stamm holt sie ins Gesetz der Welt (0 Treffer
  `__planetCore` in stamm/), der Planet-Körper trägt keine Luftdichte und das Gesetz der Welt kein Meer; die Station fragt an S7 noch
  `FAHR.G === 9.8` (Kandidat `k2-mensch-fahrzeug.js:877`) — sie misst ab dem Datensatz oben den Satz des Wagens, nicht die Konstante.

- `imWelt` an Dorf und stadt-voll (Welt-Bremsweg 100 → 0 am Ort 58–192 m: Gefälle und Boden des Orts, kein Prüfstand) — ein GELESENER
  Wert im Beleg der Zeile, nie Teil des Urteils (die Maße der Sprosse: imBand, imBand50, imKreis, flattert, rinne, sicht; die Zeile, die
  der Adapter an der GPU erwartet, steht in `cloud-post/fahrzeug-medium-4-station/BEGRUENDUNG.txt`); stadt-voll headless nicht gemessen
  (das `/umstellen` der Werkbank hängt unter swiftshader).
- Station nicht gefahren: GPU (der Richter setzt den Kandidaten an der Radeon nach der Landung).

`karte2.mensch.fahrzeug.medium#2` · ROT bis zum Richter an der GPU · Karte 2 gebucht 149 von 1 718 · ZWISCHENSTAND
