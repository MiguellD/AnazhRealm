# Kern-Sprossen — Einzug des Schneide-Schwarms (Zweig vorrat13-kern-sprossen, Fuß origin/main 21f279f5)

Zwei Pakete tragen (Schneider UND Widerleger), fünf fielen. Beide Sprossen sind nur headless belegt:
nach R2 (vision/REGELN.md) hebt headless keine Sprosse — sie stehen als KERN-Tiefe bereit, die
Buchung braucht das Bild im Spiel an beiden Geräten.

## 1 · mensch-zuege — Mensch · Geist

- Sprosse (Wortlaut Karte 2): mensch.geist.absicht S1 — „Charakterzüge ändern den Tag — 20 Personen
  nach 1 Spieltag ihrem Zug zugeordnet ≥ 0,6"; Preis „P · Dorf".
- Schnitt: koerper-core.js TAGES_GESETZ.zuege (fleißig · gesellig · häuslich · ausgeglichen) aus dem
  Samen verschiebt Werk-Wende und Abend am Treff; streuH bleibt das Rauschen der Wende.
- Zahl vorher → nachher (blinder Zuordner, Dorf 20 Häuser / 100 Bewohner, Plan alle 15 min über 24 h):
  erste 20: 0,25 → 0,80 · alle 100: 0,19 → 0,72 (Zufall 0,25) · fleißig 0/23 → 23/23 (Werk +2,91 h) ·
  gesellig 14/24 → 19/24 · häuslich 3/37 → 28/37 (Treff 0,54 h) · ausgeglichen 2/16 → 2/16 · bit-gleich.
  Täter „tagesZug → immer ausgeglichen" ROT (0,25 / 0,19).
- Beweis: `node scripts/diag-mensch-zuege.cjs --selftest && node scripts/diag-mensch-zuege.cjs`
  (npm run gate:mensch-zuege, im Puls 2/2, lokal 29 s).
- Leser im Spiel: stamm/siedlung-bewohner.js:818 (binden → KC.tagesBindung, liest koerper-core.js:5299
  tagesZug) · stamm/siedlung-bewohner.js:2218 (_bewohnerSoll → KC.tagesPlan, koerper-core.js:5366/5373).
- Station für die Punkte-Maschine: headless `npm run -s gate:mensch-zuege`, Soll „erste 20 ≥ 0,6",
  Zeile `Treffer erste 20: <x>`; zur Buchung dazu das Bildpaar (Fleißiger vor 8 / nach 17 Uhr am Werk,
  Geselliger abends am Gasthaus) und der Takt-Preis am Dorf (ms vorher ↔ nachher).
- Offen: häuslich treffMal 0,1 statt Plan 0,3 (9/37 gehen noch zum Treff); ausgeglichen ohne Signatur;
  Posten (Händler, Fahrer, Wache) behalten ihre Schicht; die Schwellen des Zuordners setzt derselbe
  Autor; Bewohner-Zählwachen (kreatur-takt bewohner/zielplan, fahr-leben --verkehr) nicht gefahren.

## 2 · knick-euler — Same · Physik

- Sprosse (Wortlaut Karte 2): same.physik.tragen S1 — „Säule realer Schlankheit unter wachsender Last:
  Versagens-Last gegen Euler ±20 %; halbes E knickt früher".
- Schnitt: stamm/bau-buch.js — PHYSIS.knickSicherheit (Eichfaktor 500) fällt; _failsUnderLoad urteilt
  min(π²EI/(βL)², A·σ_y/10), Lagerung β aus dem Riegel auf zwei Gliedköpfen.
- Zahl vorher → nachher (Säule 0,2 × 0,2 m, Last in 1-%-Schritten, ×Gesetz): Stein λ10 0,064 → 1,010 ·
  λ20 0,016 → 1,002 · λ40 ≤ 0,016 → 1,002 · Holz λ10 0,036 → 1,010 · λ20 0,009 → 1,001 · λ40 ≤ 0,020
  → 1,008 · Riegel λ80 0,028 → 1,005; 7/7 in 0,8–1,2. Euler maßgeblich: Stein λ40 257,6 / 257,0 kN,
  Holz λ40 57,0 / 56,5 kN, Riegel 58,0 / 57,7 kN. E/2: 0,502× und 0,499×. Mutanten: Eichfaktor
  fällt in 15 Prüfungen, Lagerung β=2 in 1.
- Beweis: `node scripts/diag-knick-euler.cjs` (npm run gate:knick-euler, im Puls 2/2, lokal 13 s).
- Leser im Spiel: stamm/werkstatt-vorschau.js:695 (_workshopPhysicsVerdict → _failsUnderLoad, Warnung
  werk.physik.knickt) · stamm/bau-teile.js:2497/2505 (v.buckles → Bruch → _werkBricht :2620) ·
  stamm/werkstatt-bauen.js:1717.
- Im selben Commit: playtest bau „über-schlank knickt" trägt jetzt eine Last-Platte 5 × 0,5 × 5 m Stein
  (die Säule allein trägt sich nach Euler bis ~30 m; der alte Test schrieb den Faktor 500 fest).
- Station: headless `npm run -s gate:knick-euler`, Soll „7/7 in 0,8–1,2 × Gesetz, E/2 ≤ 0,6×", Zeile
  `KNICK {"faelle":7,"fehl":[]…}`; zur Buchung das Bildpaar in der Werkstatt (Holz-Stütze unter Dach
  steht, überladene Plattform knickt mit Warnung).
- Offen: gedrungene Glieder (λ10/λ20) regiert das Zerdrücken (0,13–0,88× Euler), gezählt sind gegen
  Euler nur die schlanken; die Lagerungs-Erkennung ist nur am Riegel geprüft, nicht an gesäten Tempeln
  und Häusern; alle Glieder tragen 125- bis 500-mal mehr, alte Knick-Warnungen an Spieler-Werken entfallen.

## Geteilt (eigene Commits)

- package.json gate:mensch-zuege, gate:knick-euler; check.yml beide im Puls 2/2 (Waage 1,0 → 1,7 min);
  spec/ci/ci-zeiten.json lokal 29 s / 13 s (n 1, der Zug misst neu).
- spec/profiband/ratsche-quelltext.json: beide Linsen lesen ihren Kern als vm-Mutanten-Quelle, mit
  Zweck in der Liste (gate:source-probes vorher ROT 2, nachher GRÜN).
- Tore am Kopf 0f50567a: format:check GRÜN, check:statik 0 „✗", Taille dicht, playtest „Alle Invarianten
  OK", gate:betriebsgesetz GRÜN, diag-gegenstand-stoff GRÜN, beide Beweis-Befehle Exit 0.

## Was fiel (Schnitt als Patch und neue Linse gesichert im Koordinator-Scratch gefallen/<key>/)

- kadaver-gabe (leben.oeko.zerfall S1, mensch.nahrung.tier S1): Mechanik trägt (Nährstoff 1,00 → 1,20,
  Bär 6× Fuchs, Gabe 0 → 0,72 → follow_player), aber kein Bild „Kadaver mit Fressern", Folge-Abstand
  p95 ≤ 5 m ungemessen, ein Leib ohne leibV und ein Opfer ohne Jäger düngen nicht.
- tier-sinne (erleben.sinne.geruch S1, genom S1): windauf 1,0 → 3,93× headless; der Gegenlauf IM BILD
  fehlt, mit den echten Feldwerten ändert die Sicht die Flucht im Spiel nur +2 %, deer.witterM ohne Leser;
  braucht dazu diag-kreatur-leben :195 und zwei neue Goldens.
- klang-ohr (erleben.klang.raum S1): 14/168 → 168/168 nur am Mitschreib-Kontext ohne Ton; kein Abgriff
  im OfflineAudioContext, gate:klang-zensus (Knotenkette hinter dem Gain) nicht gefahren.
- fahrt-masse (mensch.fahrzeug.form S1): Antritt +343 %, Bremsweg +74 %, aber 500 m nur +0,3 %; Kern-
  Grenzen in vehicle-core über additiv hinaus, Fahrgefühl aller Teile-Werke ungesehen, Schneider meldet
  selbst keine Sprosse.
- luft-wurf (same.physik.flug S1): Feder 5,66× langsamer headless, aber im Spiel weder Stein noch Feder
  (kein Bauplan), gate:kampf-gefuehl Q12 ROT ohne zwei fremde Zeilen, der Klick wirft statt abzubauen.
