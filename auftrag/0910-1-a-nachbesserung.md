# Auftrag 0910-1 A, Nachbesserung: die Gegenprüfung von welle-m-genesis-linse 2983c6a7 ist ROT

Die unabhängige Gegenprüfung lief am 09.10. Sie hat nur gelesen und am Kopf 2983c6a7 gefahren, mit eigenem Worktree auf den Ports
7700–7709. Die Mechanik trägt:
- Die Weiche zählt 0 / 1 / 0 / 1, und es gibt keinen Weg zur Leinwand ohne Deckung.
- Die Rohdaten rechnen sich nach: +23,7 → 0 MB, Genesis 156,9 MB · 266 · 2 489 772 · GESTELLT.
- `git merge-tree` gegen integ-probe 43ac7ed0 und gegen welle-lf-rudel 3c021731 ist sauber.

Das Urteil ist trotzdem **merge-reif: nein**.

## ROT (Pflicht)

`scripts/diag-post-kette.cjs:848` hat beim Einbau von (g) eine Zeile verloren. Vorher stand dort:
```js
out.ausgabe = out.ausgabeWgsl ? SK.wgslKosten(out.ausgabeWgsl) : null;
if (out.ausgabe) …
```
Ersetzt wurde das durch `if (out.rahmenEnde)`. Damit wird `out.ausgabe` nie gesetzt, und `gate:post-kette` am echten Renderer stürzt
mit „Cannot read properties of undefined (reading 'abtastungen')“ ab.
- Lokal: EXIT 1.
- CI 37950704605: playtest 1/3, Schritt 95 „Post-Kette“ rot (15:32:21Z).
- Ohne den Absturz fiele das Gate an :175 und :881.

Hinzu kommt: `bericht/0910-1-a-genesis-linse.md:73` und die Commit-Message nennen gate:post-kette „grün“. Deine Datei
`post-kette-nachher.txt` stammt aus einer anderen Fassung des Gates, denn sie trägt die Zeile „Rahmen-Ziele am Ende“, die der Commit
nicht hat. Stell beides richtig: Lauf am Kopf, Datei vom Kopf, Satz im Bericht.

## GELB (bitte gleich mit)

Der ERROR-Zweig in `_rahmenZielAbschied` (anazhRealm.js:94910–94915) ist ein zweiter Abschied, den keine Wand sieht:
- gate:post-kette fängt nur `pageerror` (diag-post-kette.cjs:792), ein console-ERROR färbt es nicht.
- gate:vendor-anker pinnt den Hörer-Text (diag-vendor-anker.cjs:315), aber nicht `this._listeners` aus three.core.min.js, das
  `_rahmenZielAbschied` liest (:94902).

Schnitt: gate:vendor-anker pinnt auch `_listeners`, und gate:post-kette wird rot bei einem console-ERROR aus `_rahmenZielAbschied`.
Dann bricht eine Vendor-Drift an der Wand statt still im Log. Ob der Zweig bleibt (laut) oder fällt, entscheidest du mit Grund.

## Danach
Push, CI 5 von 5 grün lesen und `bericht/0910-1-a-nachbesserung.md` schreiben (Kopf, Gate-Exit am Kopf, CI-Lauf). Die zweite
Prüfung fahre ich hier, nur am geänderten Punkt. Erst danach geht der Zweig in den Kandidaten V18.537.
