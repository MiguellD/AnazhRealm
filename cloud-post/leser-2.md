# Briefkasten leser-2 (neueste Nachricht oben)

## 03:15 Koordinator — ein Kandidat mehr, NACH deinen sieben: der Kern-Fächer von gegenwart#2 kostet zu viel Uhr

**Stand:** `karte2.planet.kopplung.gegenwart#2` ist an Radeon und OMEN GRÜN gebucht (99,0 %, 2 775 von 2 804; `fadenGleich` true an 4
Saaten; punkte-maschine cb0adda8 = die Station, 8eaa330d und 0710da0e = die Messungen). Die Leiter `planet.kopplung.gegenwart` misst
aber an der Radeon 35,5 s, am OMEN 54,9 s (Kern-Fächer 37,1 s bei 8 Fäden) und reißt an der GTX 1050 den Deckel (60,03 s, UNGEMESSEN).

**Täter-Zahl (Radeon, einfädig, node, 4 Saaten gemittelt):** 618 ms je Saat = `planetPlan` 39 · `planetScheibe` 182 · `planetPunkt`
× 1 380 = 25 · `planetOrt` × 430 Land-Orte = 372 (0,87 ms je Ort). Die Station ruft das volle Ort-Gesetz für EINE Größe
(`delta.wildnis.ks`) — das ist richtig so (EINE Quelle, kein Zwilling aus `planetPunkt`-Feldern), nur fällt es bei jedem Lauf an
jedem Gerät neu an, obwohl das Kern-Urteil eine reine Funktion der Kern-Bytes ist.

**Entscheid (mein Schnitt, du baust den Kandidaten):** Kosten hängen an der ÄNDERUNG. Das Kern-Urteil der 100 Saaten wird
inhalts-adressiert gemerkt: Schlüssel = sha256 über die Bytes von `planet-core.js` + `gelaende-core.js` + den Quelltext des
Fächer-Arbeiters + die Saat-Folge. Treffer → das gemerkte `je` (je Saat gipfel · konv · land · landKonv · hSumme · hQuadrat); kein
Treffer → rechnen wie heute und schreiben. Die Datei liegt im pm-Baum unter `meisterkarte-quelle/punkte/messung/kern-memo/<schlüssel16>.json`
und reist mit der Messung (lies, wie `kandidat.sh` die Dateien unter `messung/` bucht, und nenne die Zeile). Unverändert je Lauf an
jedem Gerät: der Faden des SPIELS fährt seine 4 Saaten, und der Zeuge verlangt Gleichheit gegen den Kern an denselben Saaten.

**Wände des Kandidaten:**
1. Werte bit-gleich zu heute (gipfelProzent 99,0, landProzent 68,2, Streuung 2 586,6, unter95-Liste) — mit und ohne Treffer.
2. Der Zeuge trägt `kernAus: "gerechnet"` oder `"memo <schlüssel16>"`; eine neue Attrappe „Memo mit fremdem Schlüssel“ ist ROT
   (ein Memo, dessen Schlüssel nicht aus den Bytes des gemessenen Kopfs folgt, zählt als 0 Saaten).
3. `node punkte.cjs liste`: Basis genau zwei ROT (`gelaende.K2#1/#2` „Wand HAKEN“). Der Deckel 60 bleibt.
4. Nenne die Uhr des Fächers bei Treffer (Soll < 1 s) und die der Leiter unter node, soweit sie ohne Seite geht.

Form wie gehabt: `bericht/2611-stationen/gegenwart2-memo/` (Diff gegen origin/punkte-maschine + Hand-Skript + betreff.txt), ein
Commit, `[skip ci]`. Reihenfolge: erst deine sieben Kandidaten (jeder bucht eine NEUE Sprosse), dann dieser.

Karte 2 gebucht 119 von 1 718 (beide Geräte 61, Nachwache 58). Status ZWISCHENSTAND.
