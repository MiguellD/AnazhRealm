# Gegner Gesetz: Baum (Zweig `w28-baum-schirm`) (ZWISCHENSTAND)

Stand 15.11.2026 07:28 (date). Nur gelesen, keine GPU. Kandidat `w28-baum-schirm` 34a1bc7f gegen origin/main 4ee205bd
(`git diff origin/main...HEAD`: 15 Dateien, +81 −203). In stamm/ trägt der Diff nur Schnitt 3. Die Schnitte 1, 2, 4 und 5 sind auf dem
Zweig zurückgenommen, im Stamm bleibt von ihnen kein Byte. Gelesen: ENTSCHEID-BAUM.md (mit Z1–Z6), die fünf Bauer-Berichte und die
Rohdaten in `artifacts/profiband/auge/w28-baum-schirm/schnitt3/`.

## Funde

| # | Schwere | Bruch | Beleg |
|---|---|---|---|
| 1 | mittel | **Die Spike-Zahl ist nicht die entschiedene Zahl.** Der Entscheid verlangt den „Anteil `baum` + `karten` ohne Gitter ≤ mit Gitter + 1 Punkt“. Gemessen wurde aber `anteil` = (ohne − mit) ÷ mit der GANZEN GPU-Zeit je Bild: 57,05 → 56,45 ms ergibt −1,06. Damit ist die Klasse nicht getrennt. Dazu reicht die Auflösung nicht: Die Durchgänge streuen von −15,23 bis +8,39, der SE ist 3,36, die Toleranz 1 Punkt. Median + 1 SE = +1,18 liegt über der Toleranz. Belegt ist „nicht teurer im Rauschen von ±3,4 % der Bildzeit“, nicht das Soll. | `schnitt3/spike-abba-p3.json` `durchgaenge[0..7]`; ENTSCHEID-BAUM.md:135 |
| 2 | mittel | **Das Gesetzbuch trägt die gefallene Verdeckung weiter.** Im Labor demotiert der Baum hinter Kronen-Masse jenseits **30 m** auf die Karte (`occOn && dr > 30`, Gitter `_occG`, Schwellen 2,8/3,6, `aOccl`). Die Welt wählt seit dem Schnitt nur nach dem Abstand. Für dieselbe Wahl gibt es jetzt zwei Wege, Studio ≠ Welt, und der Meter-Schalter, den Gesetz (1) verbietet („auch nicht hinter Kronen-Masse“), lebt im Studio. Die Leser-Liste des Entscheids nennt das Studio nicht, der Bauer nennt es offen. Es ist aber ein Bruch des Gesetzes und kein Rest außerhalb des Scopes. Die Altlasten-Linse sieht `phytogenesis.js` für diese Namen nicht (kein `auch`). | worlds/terrain/phytogenesis.js:2739, :2753–2772, :2428, :2452; scripts/diag-altlasten.cjs:821 |
| 3 | mittel | **Die Pop-Annahme ist an der Nullprobe gemessen und wird als Gewinn gebucht.** Die Mess-Wiese trägt keinen verdeckten Baum (occ 0 → 0, der Schalter wirkt dort nicht). Die Läufe des Kandidaten (0,0490 · 0,0537 · 0,0736 %) überdecken die von main (0,0651–0,0679 %), der Kandidat hat sogar den höchsten Einzelwert. Der Commit-Titel bucht trotzdem „Pop-Median 0,0672 -> 0,0537 %“. An P3, wo der Schnitt wirkt, ist der Pop ungemessen. Formal erfüllt das Z2, eine Wirkung des Schnitts belegt es aber nicht. | Commit ea8431aa (koordination); `schnitt3/spike-abba-p2.json` `zustand.mit.occ = 0`; bericht-baum-schnitt3.md „Pop an der Mess-Wiese“ |
| 4 | klein | **„Dreiecke `baum` unverändert“ widerspricht dem Zustand.** Ohne Gitter steht L1 bei 55 → 60 (5 Bäume Karte → L1), Befehle 171 → 172, Dreiecke gesamt 651k → 656k. Die Klasse `baum` zeigt in beiden Schüssen byte-gleich „74/40 · 44/15/15 · 266k“. Entweder zählen die 5 L1-Bäume außerhalb von `baum`, oder der Band-Schuss trug den Zustand nicht. Das ist ungeklärt. Dazu reißt `baum` an P3 in beiden Zuständen sein Band (266k/150k). | `schnitt3/spike.log`:34–41 |
| 5 | klein | **Eine Abschrift der Regler-Formel im Messwerkzeug.** `kante` in `popGang` kopiert das Ziel des Aktuators wörtlich, samt dem Rückfall `Math.max(1, Math.min(12, st.chunkRingRadius \|\| 4))`. Schnitt 5 fiel, die Abschrift blieb. Ändert der Regler sein Ziel, nennt der Richter eine falsche Ring-Kante. Er sollte die Kante lesen statt sie nachzubauen. | scripts/werkbank.cjs:406 ↔ stamm/dirigent-regler.js:337–343 |
| 6 | klein | **Der Zweig mischt nicht sauber mit main 4ee205bd.** `git merge-tree` meldet einen Konflikt in `scripts/lib/schirm-proben.cjs`. Täter ist der Z6-Zusatz `laub: r._laubRand()` bzw. der Kopf mit „Laub-Rand A ↔ B“, beides Werkzeug von Schnitt 5. | scripts/lib/schirm-proben.cjs:31, :65 |
| 7 | klein | **Stale Wörter und ein fremder Byte.** In `diag-foundry-crossfade.cjs:211` steht „die verdeckte Karte blendet voll“, die Karte heißt jetzt VOLL/Brücke. In `playtest/studio.cjs:414` steht „(Schicht, Halbbreite, Höhe, verdeckt)“. In `diag-altlasten.cjs:822` ist die fremde w28-takt-frist-Zeile angefasst (`"BAU_ALTER_","_makeFrameBudget"`, das Leerzeichen fehlt). | dort |

## Geprüft ohne Fund

- **Absenz:** `git grep` der neun gefallenen Namen samt `occDist`/`occlOn` am Kandidaten findet 0 Treffer im Code von stamm/ und scripts/ (nur Kommentare: siedlung-bauten.js:87, diag-altlasten.cjs:819). Auf main tragen 10 Dateien die Namen (siedlung-bauten.js 32×), das stützt „main ROT mit 20 Tätern“.
- **Signaturen:** Jeder Rufer von `_archStufeUrteil`, `_archStufeSpiel`, `_archBewegteUrteilen` und `_blendeBehaelt` ist nachgezogen (siedlung-bauten.js:98/101/140/450/500, diag-ankunft.cjs:982, diag-foundry-crossfade.cjs:197/212, stoff-karte.js:727).
- **Zustand:** Kein Flag, kein Schalter und kein stiller Rückfall im Stamm. `_lodSlotVoll` liest nur noch `_bruecke` und den Halt. Der Stand-Stempel verliert genau ein `setze` (dirigent-takt.js:2245) und ist in sich konsistent. Headless war die Verdeckung schon auf main aus.
- **Soll/Band/Ratsche:** Im Diff steht kein Soll, kein Band und keine Ratsche. Unter spec/ ist nur modul-karte.json berührt (der gefallene Name).
- **Selbsttests, headless, ohne GPU-Schloss:** `diag-altlasten --selftest` GRÜN und der Lauf GRÜN (815 Namen, 108 Dateien). `diag-stand-takt --selftest` GRÜN, der Treue-Täter ist jetzt die still gestellte Brücke und wird gefunden. `diag-foundry-crossfade --selftest` GRÜN. `diag-ankunft --selftest` GRÜN.
- **Mutant der neuen Linse:** Er ist der Rückkehrer eines der neun Namen, die generische Token-Wand der Familie, deren Selbsttest feuert.
- **Bildpaar P3** (`paar-p3-ausschnitt-400.png`) mit eigenem Blick: gleich, nur einzelne Pixel in den Kronen-Lücken.
- **Verbotene Wörter:** Keines in den Commits des Zweigs oder in den fünf Berichten nach dem Muster von `gate:betriebsgesetz` (RUND groß, ganze Wörter). Klein geschrieben steckt „rund“ nur in „Grund“, das legal ist.
- **Zeit unter Last:** Die Referenzfahrt lag bei f 1,61–1,72 / 1,22–1,32, der SE ist 3,36 < 4 (Z1). Das einseitige Urteil „nicht teurer“ ist zulässig, siehe aber Fund 1 zur Größe.
- **Überlappung mit `w28-preis-ort`:** dirigent-takt.js und siedlung-bauten.js mischen ohne Konflikt. Konflikt gibt es nur in spec/uhr/geraetezeit.json, und das ist nicht Sache dieses Zweigs.

Geschnitten: nichts, nur gelesen. Schnitt 3 hält das Gesetz im Stamm (keine Rest-Namen, kein Flag, kein Rückfall, alle Rufer nachgezogen), das Studio trägt die Verdeckung in Metern aber weiter.
Gemessen: 7 Funde (3 mittel, 4 klein). Spike-`anteil` ist die ganze GPU-Zeit (−1,06 aus 57,05 → 56,45 ms), SE 3,36 gegen 1 Punkt Toleranz. Vier Selbsttests GRÜN.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
