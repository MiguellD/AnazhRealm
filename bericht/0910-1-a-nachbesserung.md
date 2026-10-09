# Bericht 0910-1 A, Nachbesserung: gate:post-kette trägt seine Ausgabe-Zeile wieder und fährt den zweiten Abschied

Auftrag: `auftrag/0910-1-a-nachbesserung.md`. Kopf: **welle-m-genesis-linse 57ccc4fb** (per `git ls-remote`, Eltern 2983c6a7).
CI: Lauf 37954511176 am Kopf 57ccc4fb — 5 von 5 grün (check, erst-zeichnung, playtest 1/3, 2/3, 3/3).

## In drei Sätzen

Die Gegenprüfung hatte recht: `diag-post-kette.cjs` hatte die Zeile `out.ausgabe = …` verloren. gate:post-kette stürzte am Kopf
2983c6a7 ab, und mein Bericht nannte es grün. Jetzt steht die Zeile wieder, und die Wand fährt den zweiten Abschied: Ohne r184s
Hörer fällt das Rahmen-Ziel trotzdem, `_rahmenZielAbschied` meldet ERROR, und jede andere ERROR-Zeile der Seite ist rot.
gate:vendor-anker pinnt `_listeners`. Am Kopf 57ccc4fb ist gate:post-kette GRÜN (Exit 0, Urteils-Zeile gelesen), und alle
übrigen Wände ebenso.

## Wie der Fehler entstand, und warum ihn meine Wand nicht sah

1. **Der Verlust:** Ein Formatier-Helfer am OMEN (`p3/fmt-eigen.cjs`, übernimmt prettier nur für eigene Hunks) hat meine
   eingefügte Log-Zeile mit der Nachbarzeile verschmolzen. Dabei fielen `out.ausgabe = …` und die neue Zeile „Rahmen-Ziele am
   Ende“ weg, und `if (out.ausgabe)` wurde zu `if (out.rahmenEnde)`. Die Datei `post-kette-nachher.txt` stammte aus dem Lauf
   VOR dem Formatieren. Das hat die Gegenprüfung richtig gesehen.
2. **Die blinde Wand:** Meine Wand-Hülle schrieb `echo "$(date +%T) … EXIT=$?"`. Das `$(date)` läuft zuerst, `$?` war darum
   immer 0. Die Ausgabe der Wand trug „FEHLER: Cannot read properties of undefined (reading 'abtastungen')“, die Hülle meldete
   EXIT=0, und ich habe den Exit gelesen statt der Urteils-Zeile.
3. **Was jetzt gilt:**
   - Die Hülle hält `ec=$?` direkt nach dem Befehl.
   - Sie hängt jedem Schritt die Urteils-Zeile des Gates an.
   - Nach jedem Formatieren läuft das Gate auf den endgültigen Bytes, und die entfernten Zeilen gegen main sind gelesen.
   - Beide Lehren stehen im Gedächtnis des OMEN.

## Schnitt

- `diag-post-kette.cjs`:
  - `out.ausgabe = out.ausgabeWgsl ? SK.wgslKosten(out.ausgabeWgsl) : null;` steht wieder, dazu die Log-Zeilen „Rahmen-Ziele am
    Ende“ und „Drift“.
  - Gegen main entfernt ist jetzt nur die alte Grün-Zeile.
- **(g) DRIFT** (der GELB-Punkt):
  - Nach dem Render-Fehler (der Rückfall trägt ein Rahmen-Ziel) nimmt die Wand r184s dispose-Hörer vom Leinwand-Ziel und kehrt
    zur Kette zurück.
  - Verlangt sind zwei Dinge. Erstens trägt der Schritt „Post-Kette nach Drift“ 0 Rahmen-Ziele. Zweitens meldet
    `_rahmenZielAbschied` ERROR („r184s Abschied am Leinwand-Ziel fehlt (Vendor-Drift)“).
  - Die Wand fängt jetzt auch Konsolen-Zeilen, nicht nur `pageerror`. Eine ERROR-Zeile von `_rahmenZielAbschied` außerhalb der
    Probe ist ROT, und jede andere ERROR-Zeile der Seite auch („KONSOLE: …“).
  - Selbsttest, jeder Fall fällt rot und wird genannt: das Ziel bleibt, der Abschied fällt still, kein Hörer zu finden (blind),
    die Probe fehlt, ein ERROR außerhalb, eine fremde ERROR-Zeile.
- **gate:vendor-anker** (170 Anker) pinnt:
  - `addEventListener`/`removeEventListener` des EventDispatchers von three.core, also `this._listeners[art]`;
  - das Leinwand-Ziel als EventDispatcher (`class GS extends u`, `EventDispatcher as u`), neben dem schon gepinnten Hörer-Text.
- **Der ERROR-Zweig bleibt.** Fällt r184s Hörer weg (Vendor-Drift), verlässt das Ziel die GPU trotzdem, und das laut. Die Wand
  sieht jetzt beides. Ein stilles Weiterspielen mit 23,7 MB wäre der Bruch.

## Gemessen am Kopf 57ccc4fb

gate:post-kette (swiftshader, Exit 0, Urteil GRÜN):

| Schritt | Rahmen-Ziele |
|---|---|
| Post-Kette | 0 |
| Direktpfad | 1 (2 Texturen, 0,88 MB) |
| Post-Kette zurück | 0 |
| Render-Fehler (Rückfall) | 1 |
| Post-Kette nach Drift | 0 |
| am Ende | 0 |

Drift: 1 Hörer fort, 1 ERROR-Zeile (die erwartete), keine andere ERROR-Zeile in der Seite.

Wände (Exit UND Urteils-Zeile gelesen), alle grün:

| Wand | Urteil |
|---|---|
| check | `GRÜN arch-fachwerk-fit` (letztes Glied der Kette) |
| lint | 0 Fehler, 3 Warnungen wie auf main |
| format:check | „All matched files use Prettier code style!“ |
| gate:vendor-anker | „DIE VENDOR-ANKER-WAND steht — … 170 Anker“ |
| gate:profiband | „DIE BAND-WAND steht“ |
| gate:post-kette | „GRÜN — fünf Wege durch die Weiche …“ |
| gate:ziel-zensus | GRÜN |
| gate:kamera-treue | GRÜN |
| playtest:fast | „Kern-Gesundheit OK“ |
| playtest (voll, 158 s) | „Alle Invarianten OK“ |

Die Ausgabe von gate:post-kette am Kopf liegt als `bericht/0910-1-a/post-kette-kopf-57ccc4fb.txt`. Die alte
`post-kette-nachher.txt` stammt aus dem Lauf vor dem Formatieren und ist jetzt so benannt (`…-vor-formatierung.txt`).

## Richtiggestellt im Bericht 0910-1 A

- Die Zeile „Wände … alle grün, lokal am Kopf 2983c6a7“ war falsch für gate:post-kette (Absturz). Der Satz ist korrigiert und
  zeigt hierher.
- CI 37950704605 am Kopf 2983c6a7: rot, playtest 1/3, Schritt 95 „Post-Kette“, eben dieser Absturz.
