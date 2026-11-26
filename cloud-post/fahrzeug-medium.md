# fahrzeug-medium — Stand-Blatt (ZWISCHENSTAND)

Sprosse: `karte2.mensch.fahrzeug.medium#2` (Karte: „Land, jede Saat bis 130 km/h · Bremsweg, Kurvengrenze; Spur bleibt im Schlamm ·
20 Saaten: Bremsweg 100 → 0 in 30–50 m ∝ v²/μ; Spurrinne nach 10 Durchfahrten sichtbar“).

## Täter-Zahl (vorher, node, main 4c9e6aab)

- Die Station (`punkte-maschine:…/stationen/k2-mensch-fahrzeug.js` BREMS_AN über den Fächer, 20 Saaten × 8 Rezepte) unter node
  nachgefahren: **1 Fahrt je Rezept über 20 Saaten** (Soll 20) — byte-gleich die Zahl beider Geräte.
- Täter: `vehicle-core.js:4004` `exportDrive` (der Fahr-Satz trägt kein Rad im Boden) und `vehicle-core.js:4525–4529` `fahrKraefte`:
  der Boden reist nur als `e.haft` (μ); Rollwiderstand (`G.reibung`, `vehicle-core.js:3924`) und Einsinken kennen keinen Boden, die
  Spur schreibt nichts zurück. Die Station fährt `eben` ohne Boden — jede Saat dieselbe Fahrt.
- Nebenbefund an der Station: Supersport 50 → 0 „1 230,92 m“ — die Schleife der Station bremst mit der S-Taste, unter `bremsV`
  wird sie zum Rückwärtsgang und springt über das Fenster `speed ≤ 0,05`.

## Geschnitten (EIN Gesetz: das Rad liest den Boden unter ihm und schreibt die Spur zurück)

- **Der Kern** `vehicle-core.js:4306` `radImBoden(rad, boden, nass, k)`: Einsinken und Roll-Widerstand des Bodens nach Bekker — das
  starre Rad z₁ = [3W / ((3−n)(kc + b·kφ)√D)]^(2/(2n+1)), die Kufe als Platte p = (kc/b + kφ)·zⁿ, die Verdichtungs-Arbeit
  Rc = (kc + b·kφ)(z_nach^(n+1) − z_vor^(n+1))/(n+1), f_r = Rc/W; die Rinne nach k Durchfahrten z_k = z₁(1 + 0,283·ln k)
  (`FAHR.boden.rinne`). Die Feuchte gleitet den Satz trocken → nass (n linear, kc und kφ geometrisch). `exportDrive` trägt die
  Rad-Breite (`huelle.radB`, `kufeL`), `fahrGesetz(...).rad` das Rad (W je Rad aus der Masse), `fahrKraefte` liest `e.boden`
  (Roll-Widerstand des Bodens zur Reibung des Rads, die Tiefe am Stand `fahrStand`). Ohne Boden-Satz (fester Grund) fährt der Kern
  byte-alt.
- **Der Boden** `stamm/bau-vorlagen.js:1840` `radBoden` je Stoff-Zeile: Erde, Gras, Laub = Lean Clay (Wong 2001, in
  NASA/TM-20250006958 Tafel 1: 22 % Wasser n 0,2 · kc 16,43 · kφ 1 724,69; 32 % n 0,15 · kc 1,52 · kφ 119,61); Fels, Pflaster,
  Bohle, Metall, Glut, Eis tragen keinen (das Rad sinkt nicht). Eis greift mit μ 0,1, im Film 0,07 (SAE 960959; Wong 1993) — bis
  hier stand unter dem Rad nie Eis.
- **Der EINE Boden-Leser** `stamm/koerper-fahrt.js:1837` `_fahrGrund` liest den Stoff durch den Leser des Leibs
  (`stamm/gelaende-kollision.js:1113` `_kontaktStoffAt`, mit `ohne`: der Wagen steht nie auf seinen eigenen Boxen) und die Feuchte
  der Saat (`_feuchteAt`). Der zweite Boden-Leser des Wagens (Feld + Grün als Gras + Pfad als Erde, `_fahrHaft` bis hier) fiel;
  dafür sieht der Leser des Leibs jetzt den Pfad als Erde (Schritt-Klang, Reibung des freien Körpers und Brand-Bett lesen
  denselben Weg). Die Ratsche verliert ihre Ausnahme `mu("gras"` (spec/profiband/ratsche-grundgroessen.json).
- **Das Rad schreibt zurück** `stamm/koerper-fahrt.js:1872` `_fahrRad`: je Rad (die vier Aufstandspunkte des Satzes) liest es die
  Tritte der Zelle vor ihm (`stamm/siedlung-wege.js` `_trittZahl`, dieselbe Erholung n·e^(−Δt/erholTage) wie `_tritt`) und tritt sie
  (`_tritt`: das EINE Feld, in das Fuß, Huf und Rad schreiben) — der nächste Wagen sinkt tiefer, ab der Stufe des Pfads malt die
  Wege-Karte die Spur als Erde. Leser: der Wagen der Welt (`_wagenSchritt` :1589) und der Ritt des Spielers
  (`stamm/koerper-bewegung.js:1587`).
- **Die Linse** `gate:fahr-leben` K11 (Fahrzeug-Familie, `scripts/diag-fahr-leben.cjs:394`): der GT bremst 50 → 1 km/h auf Fels,
  trockenem und nassem Lehm drei verschiedene Wege, f_r je Boden im Band der Quelle (trocken 0,04–0,08, nass 0,10–0,35), Einsinken im
  Stand = Gesetz, die Rinne wächst mit den Durchfahrten, Fels 0. Selbsttest am echten Kern: das alte `exportDrive` (Hülle ohne Rad)
  → ROT „fahrt: 9.601 · 9.601 · 9.601 m (jeder Boden dieselbe Fahrt)“; der Schritt liest e.boden nicht → ROT; der Stand sinkt
  nicht → ROT; die Rinne zählt nicht → ROT. Konsum-Leser: `fahrKraefte`/`fahrStand` des Kerns.
- **Die alten Linsen ziehen mit** (`scripts/lib/fahr-proben.cjs`): P4 steigt mit dem Satz des echten Kerns ab (der stehende Wagen
  federt seit dem Einsinken, der Abstieg zieht `_archRadMatrix`); L8 Lockstep fährt beide Läufe an derselben Welt-Uhr
  (`_weltUhrNeu`), weil die Rinne mit dem Tag erholt (vorher 6e-6 m > 1e-6 nach 200 Schritten, jetzt 0).
- **VK-V „die Stunde ohne Vorgeschichte“ (`gate:fahr-leben --verkehr`) war MEIN Rot** — seit das Rad die Tritte liest, trennten
  sich Zwilling und Lauf derselben Stunde. Drei Täter, je beim Namen, je an der Wurzel:
  1. Bild 0 (Wagen 0, 1 mm): `_trittZahl` las die Zeile roh, der Kehraus des Tags (`_trittErholen`) vergisst unter einem halben
     Tritt — im Zwilling fegte der Sprung der Uhr die Reste, der Lauf las 6,1e-6 Tritte. Schnitt: EINE Schwelle `TRITT.vergessen`
     (`stamm/siedlung-wege.js:3355`) für beide (`:1707`, `:1790`): die Zahl ist eine Funktion der Uhr. → Bild 105.
  2. Bild 105 (Wagen 20, Vorderrad k 0,99993 nur im Zwilling): der Sprung stellt den Bewohner neu, `_tritt` hielt den Sprung
     unter `sprungM` (1,5 m) für einen Schritt. Schnitt: wer neu steht, ist nicht gegangen (`stamm/siedlung-bewohner.js:2018`,
     der Sprung vergisst seine letzte Zelle). → Bild 131.
  3. Bild 131 (Wagen 20, Hinterrad in Zelle 1966/738 k 0,99992 ↔ 0): die Sim-Schritte des Sprung-Bilds laufen VOR dem Sprung
     (`_loopFixedStep` vor `_tickBewohner`) — Wagen 12 fuhr im Zwilling dort noch an seiner Lage aus der stehenden Stadt und trat
     die Zelle, im Lauf an der aus dem Ende des Zwillings. Der Boden trägt die Vorgeschichte (das Gesetz: ein gegangener Weg
     bleibt über den Sprung der Uhr), die Lage nicht. Schnitt in der Linse (`scripts/lib/fahr-proben.cjs:912`): jeder Lauf
     beginnt auf dem Feld der Tritte des ersten, gelegt NACH den Bildern des Sprungs. → **erst −1, 1 200 von 1 200 Bildern
     bitgleich.**
- **Der Vertrags-Akt** `MINT_NUR_DATEN=1 node scripts/mint-asset-goldens.cjs`: recipes.json trägt 16 neue Felder (radB, kufeL je
  Rezept), world-params und render-config byte-gleich, keine Geometrie-Golden berührt.
- **Der Stations-Kandidat** `cloud-post/fahrzeug-medium-station/` (Diff gegen origin/punkte-maschine 2e4ccc1b + BEGRUENDUNG.txt):
  BREMS_AN fährt das Rad im Boden der Saat zweimal — die WELT (Gelände der Saat) und den PRÜFSTAND auf demselben Boden, eben nach
  49 CFR 571.135 S6.2.2 („no more than a 1% gradient in the direction of testing“); das Band ∝ v²/μ gilt dem Prüfstand, normiert
  mit μ + f_r; gebremst mit `brake: 1` bis `bremsV` (kein Rückwärtsgang).

## Gemessen (vorher → nachher, gleiche Bedingungen)

| Zahl | vorher (main 4c9e6aab, alte Station) | nachher (Kopf, Kandidat) |
|---|---|---|
| Fahrten je Rezept über 20 Saaten (genesis · dorf · wiese, headless) | 1 | **20 · 20 · 20** |
| Bremsweg 100 → 0 × (μ + f_r) im Band 30–50 m | 75 % | **100 %** (38,14–45,26 m) an allen drei Orten |
| Bremsweg 50 → 0 × (μ + f_r) im Band 7,5–12,5 m | 63 % | **100 %** an allen drei Orten |
| Spurrinne (Kern, GT, nasser Lehm) nach 1 → 10 Durchfahrten | 0 → 0 cm (kein Gesetz) | **5,44 → 8,99 cm**; Fels 0 |
| Spurrinne der Station am Ort (10. Durchfahrt, größte) | — | genesis 0,6 cm · wiese 0,6 cm (trocken) · dorf **14,3 cm** (Ufer, feucht); fester Grund 0 |
| GT 50 → 1 km/h auf Fels · trockenem · nassem Lehm (K11) | 9,601 · 9,601 · 9,601 m | **9,601 · 9,207 · 8,758 m**, f_r 0,013 · 0,056 · 0,272 |
| Bremsweg 100 → 0 am Ort (alt: eben ohne Boden; neu: das Gelände der Saat) | 0–45,39 m | genesis 57,8–164,2 · dorf 65,3–193,8 · wiese 63,2–108,0 m |
| Kosten je Auffrischung des Bodens (alt Feld+Grün+Pfad → neu `_kontaktStoffAt`+Feuchte, µs, 4 000 Orte) | dorf 34,9 · wiese 60,1 | dorf 33,8 · wiese 16,8 |
| Kosten `_fahrRad` je Schritt (4 Räder, neue Zellen → gemerkt, µs) | — | 19,5–32,9 → 0,1–2,1 |
| Station S2 je Ort (Fächer 120 Adressen) | 1,0 s | 2,8–3,0 s |

Wände am Kopf (auf main 3bbd1e8f): gate:fahr-leben Selbsttest GRÜN (154 ✅) · Welt-Teil GRÜN (52 ✅, L8 Abweichung 0) ·
`--verkehr` GRÜN (VK-V erst −1, VK 10 Uhr ✅, VK 23 Uhr ✅) · check:statik 0 ·
gate:vehicle-drive GRÜN · gate:vehicle-contract GRÜN · gate:nervensystem-vehicle GRÜN (probeUrteil über jedes Log: GRÜN) ·
format:check 0 · lint 0 · stamm-umzug --nach-karte 0 · Station: k2-mensch --selbsttest GRÜN (544 Stationen, 5 398 Mutanten,
0 falsch) · die Liste der Punkte-Maschine (Zweig `punkte-maschine`, Verb `liste`): Basis genau zwei ROT gelaende.K2#1/#2 „Wand HAKEN“ (1 976 Stationen, 22,7 s).

## Offen (Grund, Messname)

- **Spurrinne sichtbar** (Karte: „nach 10 Durchfahrten sichtbar“): halb. Die Tiefe steht im Gesetz und in der Station, das BILD
  nicht — 10 Durchfahrten geben einer Zelle ≈ 20 Tritte (zwei Räder je Spur), die Wege-Karte malt erst ab der Stufe des Pfads
  (27,7 Tritte), und das Gelände-Netz senkt sich nicht um z. Messname: `rinne_sichtbar` (Bild der Rinne nach 10 Durchfahrten).
- **stadt-voll** headless nicht gemessen (die Station braucht dort die Werkbank `/umstellen`). Messname: S2 an stadt-voll.
- **Die Welt-Fahrt fliegt**: am Genesis-Ort heben 78 von 120 Welt-Fahrten bei 100 km/h ab, auch OHNE Boden (Verhalten des Kerns
  vor dieser Bahn, `fahrStand` über Wellen); die Station urteilt darum den Prüfstand. Messname: `flug` im Beleg von S2.
- **Kurvengrenze** der Karte ungemessen. Messname: Kurvengrenze je Saat.
- Der freie Körper rollt nach seinem eigenen Gesetz (`_rollWiderstand`), der Luftreifen (Reifen-Modus nach Wong) ist nicht
  modelliert, Regen tränkt den Boden nicht (die Feuchte ist die der Saat), ein Stoff je Wagen (die Mitte). Messname: `f_r` je Rad.
- Die Teile-Werk-Fahrzeuge ohne Hülle haben kein Rad; Karren (5,8 km/h) und Boot (kein Rad) stehen im Beleg unter „ohne“.
- Reifen und Scheibe im Bild: die Probe-Bilder von 5f14914a (omen-gtx1060, GRÜN) sind angesehen — stadt-voll@0.55 zeigt den
  Markt mit Ständen und Bewohnern, dorf@0.42 den Weg zwischen Gras und Fachwerk, keine der beiden Posen trägt einen Wagen. Das
  Rad im Bild urteilt die Pose der Station `fahrzeug-gestalt` (12 m vor dem nächsten Wagen). Messname: Reifen im Bild.

## Kopf 3 — das Gas der Gamepad-Probe am vollen Lauf (Post 08:54)

- Das Rot: `voll 1/18` am Kopf 15630bf4 — Gamepad-Verben (leib.K5) „ROT: gas“, Gas 0,568 / 1,193 / 1,474 m/s, Haftung 0,450.
- An der Quelle gelesen (der Fahr-Takt am Ort der Probe, `_fahrGrund`): im vollen Lauf stand der Wagen der Probe auf **Laub**
  (μ 0,45 trocken, `radBoden` Lehm — weicher Grund), solo auf **Stein** (μ 0,80, fest). Der Reifen-Kreis des Kerns (`cap` =
  maxGrip · grip · μ) deckelte das volle Gas bei μ·g: 1,474 m/s in 20 Takten = 4,42 m/s² = 0,45 · 9,81; das halbe Gas zog frei
  (1,193 gegen 1,201 auf Stein). Das Verhältnis 0,81 maß den Boden, nicht den Draht. **Das Medium hält den Wagen zu Recht** —
  ein Reifen auf Laub zieht keine 10,2 m/s².
- Der Schnitt in der Probe (scripts/playtest/koerper.cjs `checkBandGamepadVerben`): die Bühne liest ihren Grund aus der Welt.
  Im vollen Lauf ist im Ring um den Spieler genau EINE Bühne eben und trocken (0, −98,1), unter ihrem Wagen 22 von 49 Punkten
  Laub, 27 Stein — darum sucht die Probe in jeder ebenen Bühne (± 6 m, Schritt 1,5 m, von der Mitte aus) den Ort, an dem der
  Wagen im Kreis von 3 m auf festem Stoff steht (der EINE Leser `_kontaktStoffAt` → `_stoff`, ohne `radBoden`), und nennt,
  was sie fand. Die Teilprüfung `buehne` liest nach den Gas-Stufen den Grund am Wagen (`_fahrGrund`, μ aus `_fahrHaft`) und den
  Reifen-Kreis gegen den Motor (maxGrip · grip · μ · g ÷ aEngine, Soll ≥ ½: der Kreis trägt das halbe Gas frei), ROT am
  weichen oder rutschigen Grund. Die Schwelle des Gases (0,3 … √½) bleibt.
- Gemessen (voller Playtest lokal, `node scripts/playtest.cjs`, main 12029279 + dieser Baum): vorher ❌ Gamepad-Verben „ROT:
  gas“ (Laub μ 0,45: Gas 0,568 / 1,193 / 1,474 m/s, Verhältnis 0,81) → nachher 3 710 ✅, 0 ❌ in 2 min 53 s — „Bühne stein
  μ 0,800 (Reifen-Kreis ÷ Motor 0,768), Gas 0,570 / 1,203 / 2,058 m/s“ (Verhältnis 0,585), Auslauf 0,324 / 0,711 m/s.
  Die strenge erste Fassung (± 4,5 m ganz fest um den Mittelpunkt) fand im vollen Lauf keine Bühne: das ist das Rot, das die
  Probe jetzt beim Namen nennt, wenn die Welt keinen festen Grund trägt.

## Kopf

- Kopf 1: 5f14914a (auf main 3bbd1e8f), Probe GRÜN (omen-gtx1060, 1 491 s), gefahren als `fahrzeug-medium-ruf` 15630bf4;
  dort ROT am vollen Playtest (`voll 1/18`, Gamepad-Verben gas).
- Kopf 3: f85ad928, EIN Commit auf main 12029279 (der Baum von Kopf 1 darauf, dazu die Bühne der Gamepad-Probe). Nach dem Entscheid
  10:15 landet er im Stapel: Vorprüfung fahrzeug-stapel 1 (Zweig `fahrzeug-stapel`, Blatt `cloud-post/fahrzeug-stapel.md`).
  Ruf `[gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, bild:stadt-voll@0.55]` (der Baum fasst
  `stamm/siedlung-bewohner.js` an: die drei Tore zuerst, Post 05:58). Vor dem Schub lokal: voller Playtest GRÜN,
  `npm run check:statik` 0; probeUrteil: gate:studio-begehen GRÜN, gate:pruefbuehne-licht ROT unter swiftshader (S0 Himmel,
  byte-gleich am reinen main a954d698), gate:weltbild-frost:echt nur mit Bildschirm (urteilt der Messplatz).
- Probe-Ruf `[gpu-probe: gate:vehicle-drive, bild:stadt-voll@0.55, bild:dorf@0.42]`: das Werkzeug probe-tag liegt in keinem Zweig
  dieses Baums — der Ruf ist darum gegen den Einlass selbst geprüft (`.github/workflows/gpu-probe.yml`, EINLASS_JS: das Muster
  der Bilder, jedes Gate ≤ 480 s, ≤ 4 Proben): angenommen. probeUrteil über das lokale Log von gate:vehicle-drive: GRÜN.
- Beanspruchte Sprosse: `karte2.mensch.fahrzeug.medium#2`.
- Karte 2 gebucht 126 von 1 718 · Status ZWISCHENSTAND.
