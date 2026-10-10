# Auftrag 0910-3 A, Nachbesserung: die Gegenprüfung von welle-m-render-fehler 1457bfa9 ist ROT

Die unabhängige Gegenprüfung lief am 10.10. Sie hat nur gelesen und auf der Radeon im echten Loop gemessen. Bestätigt:
- Die drei Hüllen stimmen, kein Berg-Cull geht verloren, die Bilder sind unverändert (post-kette, kamera-treue grün).
- Der Diät-Wächter ist EINE Stelle für jeden Vorher-Knoten.
- Beide Linsen sind gegen main rot und am Kopf grün; Stufe E läuft nicht vakuös.
- CI 5/5. merge-tree sauber gegen main, integ-probe und host-vram-2; gegen waende-ci ein Text-Konflikt in `package.json`
  `check`, der lösbar ist.

Das Urteil ist trotzdem **merge-reif: nein**.

## ROT 1: der vierte Weg derselben Klasse
r184s `beginRender` setzt `lastOcclusionObject` und `occlusionQuerySet` nur bei Zähler > 0 zurück (gepinnt in
`diag-vendor-anker.cjs:169`). Ist in einem Probe-Frame ein Stellvertreter der letzte Draw, schließt der nächste Frame mit
Zähler 0 (queryTakt 10) eine Abfrage in einem Pass ohne Abfrage. Die Hülle `anazhRealm.js:24149` setzt nichts zurück.
- **Wann:** Ein Stellvertreter wird zum letzten Draw, wenn seine Sichttiefe unter der Sonne liegt (380 m), also bei einem
  Bündel seitlich oder hinter der Kamera, dessen Kasten ins Frustum ragt.
- **Aufbau der Probe:** Mess-Wiese −900/−850, Blick nach Süden, Region −6,−3 über `_archRegionBundleFor`, echter
  Animations-Loop, 45 s.
- **Messung:**
  - Kopf: 176× „No occlusion queries are active.“ und 176× ungültiger Command-Buffer.
  - main: 382.
  - Kopf mit `d.lastOcclusionObject = null` nach `finishRender`: 0 bei 33 Übergängen.
  - Gegenprobe mit dem Bündel 700 m geradeaus: 0.
- **Die Linse ist blind:** In Phase A zeichnet das Wasser nach dem Stellvertreter, B und G stellen ihn an den Anfang
  (`diag-verdeckungs-abfrage.cjs:428`, renderOrder −1e6). Sie braucht einen Fall „Stellvertreter ist der letzte Draw“.
- **Dazu falsch:** `KL.BERG_CULL.queryTakt = 1` (`:339`) wirkt auf dem eingefrorenen Objekt (`anazhRealm.js:102498`) still
  gar nicht. Geprobt wird jeden 10. Frame, „Probe jeden Frame“ in `:18`, `:328` und `check.yml:1130` stimmt nicht.

## ROT 2: ein Zwilling des Wächters
Der Wasser-Neubau `_tiefenLeserNeuBinden` (`anazhRealm.js:35984`, gerufen in `:92770`) steht neben dem Diät-Wächter. Als no-op
gestubbt bleiben E1–E5 bei 0 Meldungen (3 Aufrufe). Die F-Wand und ihr Selbsttest S1 erzwingen den alten Weg weiter
(`diag-fenster-wechsel.cjs:10-14`, `:357`). Abschied ganz (Def, Leser, Test, Doku, gate:altlasten) oder ein belegter eigener
Grund (Feld-Pass-Abbau?).

## PFLICHT: die Kosten der Linsen
Die CI-Gruppe 2 steigt von 15,4 auf 32,9 min, Gruppe 3 von 17,3 auf 32,4. Die Verdeckungs-Abfrage kostet 14,4 min, die
Fenster-Wand 12,7 min. Die Familie waende-ci hat die längste Gruppe gerade auf 21,8 min gesenkt.
- **Soll:** jede der beiden Linsen ≤ 3 min in der CI, bei gleicher Schärfe. Beispiele: eine Szene statt mehrerer Boots, die
  Phasen in EINEM Boot, Takt-Zähler statt Wanduhr-Wartezeiten.
- Die Laufzeit vorher/nachher steht in der Commit-Message.

## Gelb (bitte mit)
- `currentOcclusionQueryObjects`, das die Hülle bei `:24158` liest, ist in gate:vendor-anker nicht wörtlich gepinnt.
- Ist die Pipeline des geteilten Stellvertreter-Stoffs (`anazhRealm.js:68529`) einmal vergiftet, gibt es danach still keine
  Verdikte mehr. Mach das laut, oder benenne es.
- `--ohne-echt` (`diag-fenster-wechsel.cjs:31`, `:378`) ist ein ungenutzter Notausgang.
- Die Commit-Message von 3ff2c5da nennt keine Zahl vorher/nachher.

Danach Push, CI 5/5 mit Laufzeiten je Gruppe, `bericht/0910-3-a-nachbesserung.md`. Die zweite Prüfung fahre ich hier, nur am
geänderten Punkt. Der Zweig geht in V18.539.
