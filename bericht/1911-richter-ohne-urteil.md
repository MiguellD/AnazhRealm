# Abgabe richter-ohne-urteil (19.11.)

## Kopf

- Zweig `richter-ohne-urteil` (von origin/punkte-maschine 5e46351d), Kopf e560d826bcb0cc8664a5c03e21bf6d97a4fffc2d (ls-remote origin: gleich)
- Dienst-Kopien (Teil 2): `dienst/runde.cjs`, `dienst/radeon-dienst.sh` (Basis koordination 88fab2f8 = 340d3f27 für beide Dateien), Vorlage in `vorher/`
- Mess-Grundlage: `pm2/messung/f68dbf09-gtx.json` (nur gelesen), 498 Roh-Ausgaben

## Wurzeln (Census f68dbf09, GTX: 166 Stationen ohne Urteil an Frist / Deckel / Zeile)

| Wurzel | Ort (Datei:Zeile) | Stationen | trägt nach dem Schnitt |
|---|---|---|---|
| W1 Läufer: der Abbruch übertönt eine schon geurteilte Sprosse | Frist: `stationen/seite.cjs:121` (Marke), `punkte.cjs:716` FRIST_MARKE → `keinUrteil` `punkte.cjs:729` (vorher: jede Marke = UNGEMESSEN); Deckel der Stille: `punkte.cjs:2122` (vorher: sofort `offen`, ohne die Ausgabe zu lesen) | 19 Frist + 7 Deckel | 19 + 1 (menge.bild S2); 6 (entfaltung.abwesenheit S2–S7) fallen weiter an der Wirt-Wache (`punkte.cjs:4052`, die Probe hielt ihren Kontext) |
| W2 Probe: keine Sprosse in der Frist (Mensch-Leitern 15–57 s an `/umstellen` stadt-voll/dorf/wiese; erleben nacht/nichtleib/rolle; preis.ankunft; entfaltung.schirm) | die Leiter selbst, nicht der Läufer | 101 Frist + 33 Deckel | 0 — kein Schnitt im Läufer; die bestehende Deckel-Verdopplung (deckelAus (b)) läuft weiter, weil der getragene Abbruch zensiert bleibt (`rissVon` `punkte.cjs:3566`) |
| W3 Zeile: die Sprosse warf (j.fehler) | `keinUrteil` „die Urteils-Zeile fehlt“; Täter war die fremde letzte Zeile | 6 | 4: erleben.sinne.signale S2 S4 S5 S6 warfen „Leser erschienen (fluchtDistanz)“, ein Teilwort-Treffer des Wächters (`stationen/k2-erleben.js:3167`) — geschnitten, sie urteilen „Leser fehlt“; flaeche S4 (keine Siedlung) und spieler.zeit S1 (Blickziel verdeckt) bleiben UNGEMESSEN, mit der eigenen warf-Zeile als Täter (`sprosseTaeter` `punkte.cjs:737`) |

Summe: 24 der 166 tragen nach dem Schnitt ein Urteil (19 + 1 + 4), 142 bleiben ohne Urteil mit Grund (W2 134, Wirt-Wache 6, W3-Rest 2).

## Schnitt

Teil 1 — EIN Gesetz am Chokepoint `keinUrteil`/`urteile` (punkte.cjs):
- „Die Sprosse ist die Einheit des Ergebnisses“: eine Station der Karte 2, deren eigenes Ergebnis in der Ausgabe steht (≠ Urteil am leeren Lauf), trägt es über Frist und Deckel der Stille. Der Abbruch steht daneben (`abbruch`), zählt als Riss (zensierte Sekunden, Deckel-Verdopplung) und als Abbruch der Grundstellung (`brachAb`). Ohne Ergebnis: UNGEMESSEN wie bisher.
- Die Leine liest nach dem Deckel der Stille die Ausgabe, statt sofort `offen` zu melden.
- k2-same `leiterRahmen` und k2-mensch `k2Werkzeug` schreiben den Stand nach jeder Sprosse (atomar über `.stand` + rename): ein Abbruch verliert keine geurteilte Sprosse mehr.
- Wächter von erleben.sinne.signale: Worte statt Teilworte.
- Kein Flag, kein zweiter Pfad, keine längere Frist.

Teil 2 — das Gesetz der Liste (`runde.cjs reihe`, `radeon-dienst.sh gesetz_der_liste`, eingefroren beim Eintritt):
- (1) Ist die OMEN an diesem Runden-Kopf durch, misst die Radeon nur, was die OMEN dort GRÜN urteilte.
- (2) Eine Station, die am Vor-Kopf auf irgendeinem Gerät ROT mit Grund stand, kommt nur zurück, wenn der Diff Vor-Kopf → Runden-Kopf ihre Leiter berührt.
- **Berührt heißt:** das EINE Frische-Gesetz der Buchung (R6: Konsum, Linse, Glob, Abdruck) hielte die ROT-Messung des Vor-Kopfs am Runden-Kopf nicht mehr für frisch — `punkte.cjs beruehrt --basis <Vor-Kopf> --kopf <Runden-Kopf> --json`, je Gerät beruehrt ∪ offen ∪ tot.
- Fehlt eine Quelle (Mess-Datei des ersten Geräts, Berührung): LISTE ROT beim Namen, keine Fahrt. Bleibt keine Station: die Zeile steht `durch 0/0 … liste gesetz-leer` ohne Fahrt (kein Listen-Bruch).

## Beweis (ohne GPU)

- Läufer-Selbsttest: `SELBSTTEST GRÜN (253/253, ohne (3c))`. Neu darin:
  - (e) Frist: S1 trägt ROT, S2 UNGEMESSEN mit eigener warf-Zeile; ohne karte2 UNGEMESSEN. Die Mutante `keinUrteil` ohne Station nennt S1 UNGEMESSEN.
  - LEINE: S1 trägt ROT über den Deckel der Stille, die anderen stehen UNGEMESSEN. Die Mutante ohne karte2 ist UNGEMESSEN.
- Wächter signale (scratchpad `roh/signale-mutant.cjs`, der Filter wird aus der Datei gelesen): fluchtDistanz fällt heraus, bienenTanz, SIGNAL_X, warnSignal, distanzMarker und gesangsDialekt bleiben. Die Mutante (alter Regex) nennt fluchtDistanz.
- Dienst-Sandkasten (`dienst/selbsttest.txt`), mit der echten Tafel aus koordination 340d3f27:
  - echt: 16 von 16 Fällen OK (die 13 alten plus g, g0, g1).
  - g: Von 6 Stationen misst die Radeon genau g.K2 und g.K3; die Gesetz-Zeile lautet „6 → 2 · (1) nicht GRÜN auf gtx: 2 · (2) ROT … ohne Berührung: 2“.
  - Mutante ohne-erst: ROT an g (misst g.K5 und g.K6 nach) und an g0.
  - Mutante ohne-vorher: ROT an g (g.K1 und g.K4 kehren unberührt zurück) und an g1.
  - Fälle und Mutanten liefen einzeln nacheinander (`einzel.sh` = st_lauf), nicht als paralleles `--selbsttest` mit 15 Sandkästen: die Regel war höchstens ein node zugleich.
  - Die Liste MUT im Skript trägt beide Mutanten, die Soll-Zahl steht auf 16.
- Abdruck (`werkbank.cjs abdruck`) nicht gefahren: der Arbeitsbaum ist sparse, ohne scripts/.
  - Außerhalb von X byte-gleich belegt `git diff --stat 5e46351d..e560d826`: genau 4 Dateien (punkte.cjs, k2-erleben.js, k2-mensch.js, k2-same.js).

## Unbelegt

- Die 24 von 166 sind eine Census-Zahl aus den Roh-Ausgaben des f68dbf09; erst die nächste Fahrt an der Karte (GTX und Radeon) belegt sie.
- W2 (134) ist nicht geschnitten: die Leitern liefern in ihrer Frist keine Sprosse. Ob die Deckel-Verdopplung sie heilt, zeigt erst die nächste Fahrt.
- Teil 2 lief nur im Sandkasten mit Stummel-`beruehrt`. Die Laufzeit des echten `punkte.cjs beruehrt` am Dienst-Baum ist ungemessen (Deckel 1 200 s).
- Die OMEN-Seite (Landungs-Dienst) liest das Gesetz der Liste nicht; (1) greift nur, wenn die OMEN zuerst durch ist.
