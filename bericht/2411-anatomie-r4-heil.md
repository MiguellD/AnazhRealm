# Bericht anatomie-r4-heil — R4 fällt wieder, und der Kern einer Linse weckt ihren Selbsttest (GTX 1050, 24.11.)

ZWISCHENSTAND · Karte 2 gebucht 83 von 1 718 (diese Heilung bucht keine Sprosse: eine Linse und der Ruhe-Schlüssel der Batterie).

**Geschnitten** — EIN Commit `3bbb5b233` auf `anatomie-r4-heil` über main 499f8b57 (vier Skript-Dateien, kein Kern, kein Golden,
das Soll `ARM_RUHE.durch [0,0]` unberührt): die Mutante R4 nullt die Lage an ihrer EINEN Quelle (`userData.__lage` jeder
Tuch-Hülle, die `armAnlage` UND `__hautUnterStoff` lesen) auf der Bühne Trägerhemd bei Masse 2,5 (dort steht Rumpf-Haut neben Tuch
in der Mulde), ihr Muster verlangt zwei Stellen, und eine eigene Selbsttest-Zeile hält die Bühne ohne Täter darunter. Der
Ruhe-Schlüssel (`scripts/lib/ci-klasse.cjs` `r6Kerne`) liest jetzt die Kerne, durch die eine Linse im Faden baut — aus der EINEN
Liste, die `fadenScope` selbst lädt (`welt-boot.cjs` `fadenQuellen`) —, und `gate:ci-deckung` (Z) nennt den Selbsttest, den sein
Kern nicht weckt, und die Linse, deren Liste der Schlüssel nicht lesen kann (zwei Mutanten).

**Gemessen** (Ofen L0, fünf Körper von `ARM_RUHE.koerper`, frische Prozesse):

| Fall | durch je Körper | fällt |
|---|---|---|
| alte Bühne (T-Shirt), alter Täter (Kopie der Anlage = 0) | 0 · 0 · 0 · 0 · 0 | 0 von 7 Läufen; echter Selbsttest ROT „1 Linse(n) vakuös“ |
| Bühne Trägerhemd, Masse 2,5, ohne Täter | 0 · 2 · 2 · 0 · 0 | bleibt unter dem Muster (eigene Zeile) |
| Bühne + alter Täter (nur die Kopie) | 1 · 7 · 0 · 0 · 1 | nein |
| **Bühne + Täter an der Quelle (gewählt)** | **10 · 43 · 57 · 41 · 29** | **12 von 12 Läufen, bit-gleich** (größte Überstände 17–54 mE gegen die Schwelle 4 mE) |

Wurzel, gemessen: seit w28-mensch-nah 85aec8c18 senkt `foundry-core.js` `__hautUnterStoff` jede verdeckte Haut-Ecke NACH
`armAnlage` auf genau `lage` unter ihr Tuch (Abstand −24,000 mE) — der alte Täter traf nur die Kopie, die `armAnlage` liest, und
unter dem T-Shirt steht in der Mulde keine Rumpf-Haut neben Tuch. Kein Zufall im Bake (Node 20 und 24 bit-gleich).

Ruhe-Schlüssel: 26 Linsen bauen über Kerne, 53 neue Paare Linse × Kern im Schlüssel, blind: keine. Zeuge mensch-nah,
nachgestellt (`r6Urteil` mit einem Diff nur an `foundry-core.js`): `node scripts/diag-mensch-anatomie.cjs --selftest` ruht mit
dem Schlüssel vor dem Schnitt („15 Dateien, 0 Kerne, 19 Glieder, 124 Zeilen“ — dieselbe Zeile wie Job 138467454301) und läuft
nach dem Schnitt (Grund „foundry-core.js“). `gate:ci-deckung` Selbsttest GRÜN in 26 s (beide neuen Mutanten
fallen beim Namen), das Tor GRÜN in 9 s.

**Offen, ehrlich:**
- Das zweite Rot „Der Körper steht, wo das Auge ihn sieht“ (`gate:koerper-stand`, main a8dd22b5, Job 138446232280): die Zeile ist
  von diesem Rechner nicht lesbar (kein `gh`), ein Lauf des Tors (820 s in der Cloud, bootet Welten) liegt über dem Hand-Deckel der
  GTX — ungelesen, nicht als Wackler benannt.
- Trägerhemd am Achsel-Ausschnitt und die zwei Halter der Lagen-Folge unter dem Arm: je eine Zeile im FUND-REGISTER.
