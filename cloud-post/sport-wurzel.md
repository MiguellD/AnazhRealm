# Vorprüfung sport-wurzel — das Spiel des Abends zieht die Nachbarschaft des Platzes, der Zweikampf ist EIN Akt

**Basis main 32c0cd8b (V18.546.406, trägt w28-haus-stoff2); der Kopf ist EIN Commit auf main, er fasst drei Dateien an:**
koerper-core.js, stamm/siedlung-bewohner.js, scripts/diag-koerper-kern.cjs (keine Überschneidung mit haus-stoff2).

**Die Wurzel (gemessen an stadt-voll, main 2d6a0447).** Am Platz waren 12 Gäste des Treffs. 8 von ihnen standen ohne Klasse
oder allein in ihr, also gab es keinen Gegner. Ergebnis: 40 Tage ohne Lauf und ohne Gang (regeln#1 0 < 20 Läufe, mannschaft#1
0 Gänge, arena#1 0 im Ring). Der Täter ist die Wahl der Gäste: `spielProgramm` nahm nur, wer seinen Abend auf dem Platz hat
(die Bindung `abend`).

**Geschnitten.**
- koerper-core.js `spielGaesteWahl`: EINE Wahl im Kern. Gast ist, wer den Abend am Platz hat, und dazu, wer ihn daheim
  verbringt, höchstens `SPIEL_GESETZ.programm.nachbarM` 100 m vom Platz. Der Wirt reicht nur die Orte (`_spielProgramm`).
- Der Zweikampf ist EIN Akt mit zwei Lesern. Der Kern gibt dem Auftritt „zweikampf“ seinen `gegner`. Der Wirt setzt `b.gegner`
  (`_bewohnerZiel`), und der Satz trägt `gegner` ab der Geburt (Lehre 25: EINE versteckte Klasse). Die Haltung ist `fight`
  (MOTION). Es lesen mannschaft#1 (der Gang) und krieg#1 (`b.gegner`, der Akt).
- Linse gate:koerper-kern: E8 (Täter `nurTreff`, die Wahl ohne Nachbarn) und E9 (Täter `ohneGegner`). Der Selbsttest zählt
  dreiundvierzig Täter, alle ROT beim Namen.

**Das Bild (GTX, Werkbank --echt, Messort stadt-voll, die Uhr wie die Station).** Die Kamera steht 14 m quer zur langen Achse des
Platzes, 7 m hoch, und blickt auf seine Mitte (836,09 62,47 465,84 → 836,09 55,97 451,79). Vorher heißt: dieselbe Kamera am
selben Baum, nur koerper-core.js und stamm/siedlung-bewohner.js von main 2d6a0447.

| Uhr | vorher (main 2d6a0447) | nachher (Kopf) |
|---|---|---|
| 18,55 | im Ring 1 · Programm: 4 Bretter, kein Lauf, kein Ringen | im Ring 22 · Programm: 3 Läufe, 4 Ringen, 4 Bretter |
| 19,00 | im Ring 1 · im Zweikampf 0 | im Ring 34 · im Zweikampf 2 |
| 18,66 | — | im Ring 27 · der Lauf läuft über das Feld |

Das Bildpaar liegt im Zweig, 960 × 540, JPEG: `cloud-post/sport-wurzel-bild/vor-19_00.jpg` ↔
`cloud-post/sport-wurzel-bild/nach-19_00.jpg`, dazu `cloud-post/sport-wurzel-bild/nach-18_66.jpg` (der Lauf). Die Bilder um 18,55 Uhr
in voller Größe liegen im Scratchpad der Sitzung (…/615d4441-bade-4136-a7ae-2c4db13afa4f/scratchpad/sw/bild-1855/).

**Die Stationen (GTX 1060, die echte Station der Punkte-Maschine am Gerät gtx).**

| Sprosse | main 2d6a0447 | Kandidat 7e2c5b2c | Preis am Kandidaten |
|---|---|---|---|
| regeln#1 ρ Rangfolge ↔ Leib (Soll 0,6–0,9, ≥ 20 Läufe) | 0 Läufe in 40 Tagen | ρ 0,8364 über 20 Läufe | p95 17,06 ms |
| mannschaft#1 Siegquote des Stärkeren (Soll 0,6–0,8) | 0 Gänge in 40 Tagen | 0,6625 über 160 Gänge | p95 25,01 ms |
| arena#1 Blick folgt dem Geschehen (Soll ≥ 0,8, ≥ 10 Zuschauer) | 1 im Ring (das Bild, 19 Uhr) | 1 bei 22 Zuschauern | p95 17,02 ms |

Am Kopf 4d4a74ab (derselbe Code-Baum wie dieser Kopf, dazu nur der Post und das Bildpaar) urteilte dieselbe Station am 24.11. um
22:21: regeln#1 GRÜN ρ 0,8364 über 20 Läufe · mannschaft#1 GRÜN 0,6625 über 160 Gänge · arena#1 GRÜN Blick 1 bei 22 Zuschauern;
Preis GRÜN, p95 17,09 · 17,09 · 17,04 ms (die Akten der Punkte-Maschine je Sprosse, Kopf 4d4a74ab, Gerät gtx).

**Die Tore am Kopf 9d1226b5:** gate:koerper-kern GRÜN, format:check GRÜN, lint (0 Fehler), check:statik GRÜN (505 s). Den
Selbsttest der Linse fuhr der Kandidat c5f9f47c: dreiundvierzig von dreiundvierzig Tätern ROT beim Namen. Die Browser-Familien
richtet die CI am Vorprüf-Kopf (Regel seit 20:16: keine Batterie eines Machers am Messgerät).

**Was ein Profi am Bild sofort bemängelt, gemessen am Vorbild (der Dorfplatz am Abend eines Fests, Ringer im Kreis der Zuschauer).**
Ich schätze etwa 35 %.
- Der Ring steht in einer Zeile an der langen Seite des Felds. Er schließt keinen Kreis um das Paar.
- Den Zweikampf liest man auf 14 m kaum. Zwei Leiber stehen in der Mitte, aber ohne Griff und ohne Kontakt der Arme.
- Um 19 Uhr wäscht das Licht des Abends alles orange aus. Die Leiber verlieren gegen den Boden ihren Ton.

**Ehrlich offen.**
- krieg#1 bleibt 0 < 2. Die 6 Wachen mit dem Langschwert halten ihren Posten bis 20 Uhr und ringen nicht. Der Zweikampf der
  Wache ist die Welle bewohner-tat (`_bewohnerNahen`). Die Maße sitzt · antwortet · durchDeckung liest die Station heute als null.

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 92 von 1 718 (die Sprossen bucht der Koordinator).
