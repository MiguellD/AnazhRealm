**Gegenprüfung Runde 1, welle-lf-rudel (Kopf 1c6da65d, Basis 79f25cbd)**

Für sich allein ist der Zweig sauber, aber gegen das aktuelle main V18.536 noch nicht mergebar: Beim Mergen entstehen zwei Zwillinge, einer davon unbenannt.

**Selbst nachgeprüft**
- `gate:kreatur-takt` für die 8 neuen Proben, headless auf Port 7942: Selbsttest grün, alle 14 Täter machen ihre Probe rot und werden beim Namen genannt, Exit 0. Das Gate ist grün, Exit 0.
- Diese Zahlen stimmen mit dem Bericht:
  - Körper-Würfe 0 von 4000
  - Durchdringung 0, nächster Nachbar p50 1,038 Körper-Kugeln
  - Hirsch Wariness +0,478
  - Bein-Lot 7,4° / 7,5°, Stand-Schlupf 0,19 / 0,153
  - Sockel 0 Takte im Stein
  - Fern-Gleiten 0 von 1440 und 0 von 1240 laufenden Takten
- CI-Lauf 37776313977 auf 1c6da65d ist grün: check 21 Schritte, playtest 89 Schritte, der Schritt mit der Kreatur-Linse ist erfolgreich. Damit stehen die Linsen mit ihren Tätern in der CI.
- Die Bild-Paare hang2, podest und herde2 zeigen dieselbe Bühne, und die Änderung ist echt zu sehen: Die Beine stehen im Lot, der Hirsch steht auf dem Podest, die Bären stehen getrennt.
- Je Domäne gibt es einen Chokepoint: `_kreaturJagdZug` für Spieler und Beute, `_kreaturGroesseSetzen`, `_koerperHauch` an der Op-Stelle. Nexus-Programme bleiben lokal, daraus entsteht kein Mehrspieler-Bruch.
- Keine Siegel-Wörter in den 11 Commit-Messages.

**Rot (Vereinigung mit main 76c9624d)**
1. **Der Leib-Löser wird beim Merge zum stillen Zwilling.** Der Zweig hat `_kreaturLeibKontakte` (`anazhRealm.js:20755`, Aufruf `:22571`), main hat `_leibKontakte` (main `anazhRealm.js:20672`, Aufruf `:92650`). Im Probe-Merge (`git merge-tree`) landen beide Aufrufe ohne Konfliktmarker im Ergebnis (Zeilen 23143 und 93366). Der Beweis für Posten 1 (Durchdringung 753 → 0) hängt am Löser, der beim Vereinigen fällt. Die Linse `abstand` muss nach dem Mergen gegen den einen verbleibenden Löser im festen Sim-Schritt neu grün werden, mit Mehrfach-Gängen statt eines Durchgangs.
2. **Zwei Massen, im Bericht nicht benannt.**
   - Der Zweig rechnet Masse als Dial size × bodySize: `_kreaturMasse` in `anazhRealm.js:20440`, dazu `tetrapoda-core.js:150` (`jagd.beuteMasse`), `:180` (`temperament.gattung.jagdMasse`…) und `:1435` (`temperamentDerGattung`).
   - main rechnet Masse als Volumen × Dichte: `_leibMasse` (main `anazhRealm.js:20548`) und `MASSSTAB.dichteKgM3` (main `tetrapoda-core.js:1468`).
   - Beide geben verschiedene Antworten auf die Frage, ob der Hirsch Beute des Wolfs ist. Mit Dials ist er Beute: 2,8 ≤ 1,25 × 2,4. Mit kg nach mains eigenen Zahlen nicht: 94 kg > 1,25 × 64 kg. Nach dem Merge muss es eine Masse geben, und Temperament und Beute müssen neu belegt werden.

Die übrigen drei Konflikt-Dateien sind mechanisch: `check.yml` übernimmt mains Dreier-Teilung statt der 60 min. Die v1-Goldens (manifest, recipes) sind auf beiden Seiten gemintet und brauchen nach dem Mergen einen neuen Mint gegen den gemergten Kern, mit Byte-Beweis. Gegen welle-m-fahren und integ-l gibt es keinen eigenen Konflikt (beide stecken schon in main), gegen welle-lf-v1-ankunft nur `check.yml`.

**Gelb**
- **Veraltete Zahlen im Bericht:** Die Rudel-Lücke p50 heißt dort 129°, nachgerechnet sind es 154°; de00e96e nennt selbst 154. Wolf am Kitz heißt 29, nachgerechnet 5. Rudel am Hirsch heißt 7, nachgerechnet 8.
- **Bilder:**
  - rudel3 und fernB55 zeigen vorher und nachher an verschiedenen Orten (Lichtung (-789, -1331) gegen (-763, -1368)).
  - Alle Nachher-Bilder (10:54–11:06) stammen vom Stand 63f2e70c. Sie zeigen also weder 22d52f96 noch e8081fd8 (ferner Läufer nur im Blick, auf Stufe 1/8).
- **Posten 7:** Die Klassen-Zahl des Befunds (Dorf-Gang, 7,6 % der Takte in einer Hüllen-Box, p50 73 cm) wurde nicht erneut gemessen. Gemessen sind nur der Sockel der Linse und ein Podest.
- **Code und Gesetzbuch:**
  - `anazhRealm.js:19133–19135`: Der Kommentar über `_creatureTemperament` beschreibt noch Signaturen und Floor, also das Gegenteil des Codes.
  - `anazhRealm.js:94744`: `v.herde.fensterRaum` wird vor der Prüfung `v.herde &&` gelesen. Bei einem kalten Kern gibt das einen TypeError statt des Kern-Pflicht-Bruchs.
  - `tetrapoda-core.js:1309/1337`: `hubForm` ändert die Ausgabe von `gangFuss`. Die Commit-Message nennt das „rein additiv“, das stimmt nicht. Der einzige Leser ist der Stamm, ein Golden gibt es dafür nicht.
- **Kosten und Spielbild** (alles im Offen-Teil benannt):
  - Der Kreatur-Takt wird mit 39 Tieren um 37–60 % teurer (0,41 → 0,56–0,66 ms). Vor main braucht es die OMEN-ABAB-Messung.
  - Fliehende und hetzende Tiere traben mit 5,5–6,6 Hz.
  - Auf der echten GPU stehen die Hinterbeine am Hang 10–13° aus dem Lot, Soll ist ≤ 10°.

Geschnitten: nichts, ich habe nur gelesen und geprüft.
Gemessen: Selbsttest mit 14 Tätern grün, die 8 Proben grün, CI-Lauf 37776313977 grün, Probe-Merge gegen main mit 5 Konflikt-Dateien und 2 Zwillingen.
Pflicht-OFFEN Rest: E (docs/PFLICHT-OFFEN.md).
Status: ZWISCHENSTAND

merge-reif: nein — (1) Leib-Löser-Zwilling: `anazhRealm.js:20755`/`:22571` `_kreaturLeibKontakte` gegen main `_leibKontakte` (main `anazhRealm.js:20672`/`:92650`); der Merge übernimmt beide Aufrufe ohne Konflikt, und der Beweis für Posten 1 hängt am fallenden Löser. (2) Masse-Zwilling: `anazhRealm.js:20440` `_kreaturMasse` sowie `tetrapoda-core.js:150/180/1435` (Dial × Größe) gegen main `_leibMasse` (main `anazhRealm.js:20548`) und `MASSSTAB.dichteKgM3` (main `tetrapoda-core.js:1468`); beide urteilen verschieden darüber, ob der Hirsch Beute des Wolfs ist.