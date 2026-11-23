# eine-huelle — Vorprüfung 1 (GTX 1050, 23.11.)

Vorprüf-Kopf `fe0f7b1f4` auf `eine-huelle` (über main `4019a2ad0`, V18.546.375). Alle Zahlen an der GTX 1050, Werkbank `--echt`.
Die Messungen der Stadt und der Station liefen an den Köpfen 5facf8cf2 · 3df48e13f · 27d64ccf0 (main .373 und .374 im Baum);
der Tor-Satz lief am Baum des Vorprüf-Kopfs (WIP 8ce3e72d5, main .375 im Baum) neu (Abschnitt „Die Linsen“). ZWISCHENSTAND — Karte 2 gebucht 53 von 1 718. Auftrag des Koordinators 22.11. 20:35 / 20:51: EINE Hülle je
Haus (bevoelkerung#1), der Bezugs-Leib des Gangs am erwachsenen Median, der Fahrer als Soll als eigene Abgabe (`pm-fahrer-soll`).

## 1 EINE Hülle je Haus

**Wurzel.** Die NUR-WURF-Stufe 3 des Fachwerks trug keine Solids. Ein kaltes Haus jenseits der Mesh-Zone (150 m) stand deshalb
in einer zweiten Hülle des Wirts (vier Wände aus der Tür-Zeile, `_hausKernHuelle`); kam die Hülle des Gesetzbuchs, rückte die
Wache die Stände um 0,3–2,9 m.

**Schnitt.** Jede Stufe des Gesetzbuchs trägt die Solids (`fachwerk-core.js` `buildStufe`, Stufe 3: `geoms.__solids = hs3.fest`),
der Wirt kennt nur noch diese eine Hülle: `_hausKernHuelle` fiel (gate:altlasten trägt den Namen, 837 Namen grep = 0), ein
Studio-Haus ohne Hülle trägt keine Blocker (`_hausHuelleKommt`), wer wartet, holt die Lieferung des Fernkörpers
(`_hausHuelleHolen`), und die Liste der Bewohner entsteht erst, wenn JEDES Haus des Plans seine Hülle hat (`_bewohnerHuellenDa`,
8 Häuser je Takt).

| Messung (Genesis-Ort, 89 Bewohner) | vorher (7f7fb4963) | am Kopf |
| --- | --- | --- |
| Stände, die die Wache während einer Zählung rückt (`genesis:wache`) | 49 | 0 |
| Soll an den fünf Orten der Zählung | 6 | 15 |
| `mensch.menge.bevoelkerung#1` Σ Soll (Orte + Fahrer) | 12 + 6 = 18 | 15 + 6 = 21 |
| Boxen eines kalten Hauses vor der Lieferung (gate:haus-welt W6) | Kern-Hülle (vier Wände) | 0 |
| Lieferung des Fernkörpers (Teile der Hülle) | 0 | 361 / 360 |
| Annäherung an das kalte Haus: Weg hinter der Schwelle | — | 1,70 / 1,26 m (in der Hülle des Gesetzbuchs) |

**Kosten.** `hausSolids` rechnet nur das Maß (`__nurMass`): 32,2 → 12,7 ms je Haus, byte-gleich (21 von 21 und 65 von 65 Slots).
Der Bau der Stufe 3 trägt die Solids mit: +12,7 ms je Haus (+9,6 %, 132,8 ms). Der Boot der Stadt (stadt-voll, 326 Häuser):
248,5–253,5 s → 252–264 s.

## 2 Der Bezugs-Leib des Gangs

**Welcher Regler zieht den Median unter START_PARAMS** (Wurf des Wirts, N 4 000; Anteil am Zug des Medians der Kraft, ln):

| Regler | Anteil | START_PARAMS | Median der Stadt |
| --- | --- | --- | --- |
| Geschlecht | 43,6 % | 1,0 (Mann) | 0,50 |
| Alter | 35,1 % | 27 J | 35 J (21–49 J) |
| Gewicht | 11,7 % | 0,35 | 0,50 |
| Höhe | 4,8 % | Kanon | 1,011 |
| Muskel-Ton | 4,7 % | 0,50 | 0,50 (an das Gewicht gebunden) |
| Bau | 0,0 % | — | — |

Die Liste des Auftrags (Alter · Muskel-Ton · Gewicht) trug den größten Regler nicht: das Geschlecht. START_PARAMS ist ein Mann
von 27 Jahren mit Gewicht 0,35 — kein Median.

**Schnitt.** koerper-core `KOENNEN_BEZUG = { age: (30 − 18) / 62, gender: 0,5, mass: 0,5, tone: 0,5 }`: `leibKoennen` teilt durch
die Roh-Kraft dieses Leibs (die Höhe bleibt die des Kanons: sie kürzt sich gegen die Froude-Einheit). Kein Soll geschoben, die
Streuung bleibt (CV 12,4 %).

| Messung | vorher | am Kopf |
| --- | --- | --- |
| Median `lauf` der Bevölkerung mit 30 J (Wurf des Wirts) | 0,90 | 0,992 |
| Median `lauf` über das Gitter der Achsen mit 30 J (5³ · 9³ · 15³) | — | 1,0000 · 1,0000 · 0,9988 |
| Median `lauf` der Stadt (21–49 J, Median 35 J) | 0,871 | 0,967 (p5 0,78 · p95 1,17) |
| Geh-Tempo der Geher am Abend, stadt-voll (Median; Spanne) | 1,07 m/s (0,59–1,45) | 1,16 m/s (0,34–1,59) |
| `lauf` nach Alter am Bezug | — | 21 J 1,05 · 30 J 1,00 · 35 J 0,97 · 49 J 0,88 · 65 J 0,79 · 80 J 0,70 |

## 3 Die Station (eigene Abgabe `pm-fahrer-soll`, Kopf bdfc726fb auf punkte-maschine 857b684d4)

Das Urteil zählte die Fahrer schon in Σ Soll; der Fehler der Probe: ein Leib am Steuer im 10-m-Kreis eines Orts zählte dort als
Ist ohne Soll. Geschnitten in der Ist-Schleife je Ort (`amWagen`), Lesewert `fahrerImKreis`, zwei Proben des Urteils (Fall GRÜN,
MUTANTE rot beim Namen).

| Spiel-Baum | Station | Urteil |
| --- | --- | --- |
| mensch-zahlen 7f7fb4963 | Kopf | ROT — Σ Soll 18 < 20 und „3 Uhr Ort 1 Ist 2/Soll 0“ |
| eine-huelle 5facf8cf2 | Kopf | ROT — Σ Soll 21, „3 Uhr Ort 1 Ist 2/Soll 0“ (zwei Nachtfahrer am Steuer) |
| eine-huelle 5facf8cf2 | mit dem Schnitt | GRÜN — Σ Soll 21, 20 von 20 Stichproben am Soll, Ankunft 1,5 s |

Die Proben der Urteile aller 72 Stationen von g2: am Kopf 259, 0 falsch; mit dem Schnitt 261, 0 falsch.

## Die Stadt (stadt-voll)

- Die Liste entsteht mit allen Hüllen: 326 von 326 Häusern tragen die Hülle des Gesetzbuchs, Bewohner 1 367 → 1 365
  (zwei weniger; die zwei Häuser sind NICHT benannt: das Log des Spiels hält 50 Zeilen, das Bruch-Buch 64 Texte — alle 64
  „BEWOHNER: der Ort x/z erreicht keinen Weg frei“ mit 103–144 Zählungen, die Zeile der Geburts-Regel „kein freier Stand vor
  der Tür“ fällt aus beiden heraus).
- Das Bildpaar 20 Uhr an derselben Pose (856,5 / 57,2 / 437,0 → 844,5 / 56,6 / 437,0): `abend-vorher.png` (7f7fb4963) ↔
  `abend-kopf.png` (27d64ccf0) — dieselbe Stadt, andere Geher; das Bild steht in 6,0 ↔ 6,5 s (am Kopf 3df48e13f 6,2 s). `morgen-kopf.png`: der Markt um
  7:12 Uhr (5facf8cf2).
- Die Pose 804,9 / 62,8 / 402,8, an der die Welt nie ruht (FUND-REGISTER 22.11. 20:30, main wie Zweig): die Ursache ist benannt, nicht geschnitten (Wurzel w28-march-schirm, außerhalb des Auftrags). Am Tag (Boot-Stunde) ruht die
  Welt dort nach 181 Takten (11,4 s) bei 133 freien Feldern des Welt-March (4 096, Reserve 128); um 20 Uhr nie (300 und 900
  Takte): freie Felder 128 = Reserve 128, `wm.platz` wartet mit `echt: false`, in 13 Fege-Gängen 143 Rufe
  `_weltPlatzWarten(true)` von Vorbackern (gezeichnet, ohne Satz), 0 echte Warter, kein Bau, 750 Halter (Laternen 237 · Häuser
  153 + 146 · Wandlaternen 85). `_weltPlatzTakt` weckt nicht, solange frei ≤ Reserve; archCull meldet weiter „felder“ offen.
  Sonde: `seite-cull.js` (Lesewerte `platz`, `vorab`, `halterTyp`).

## Die Linsen (am Baum des Vorprüf-Kopfs = WIP 8ce3e72d5, wo nichts anderes steht)

- gate:fachwerk-contract (1b: jede Stufe samt L3 trägt die Solids; der alte Kern rot 64 von 64), gate:koerper-kern mit Selbsttest
  (K1 Bezug genau 1, K5 Gitter-Median mit 30 J, Mutante „alter Bezug“ rot), gate:altlasten, gate:betriebsgesetz: Exit 0.
  Anker-Probe gegen main: 0 gebrochene Text-Anker.
- Statik-Kette (check:statik · format:check · stamm:lint · atlas): vier Mal Exit 0.
- Der volle Playtest (unter dem Schloss, 293 s): „Alle Invarianten OK“, 3 709 Zeilen grün, 0 rot.
- gate:haus-welt W6 im echten Spiel mit Selbsttest (4 Welten, 266 s): grün — 0 Boxen vor der Lieferung, Lieferung 361 Teile; die
  Mutanten `fernstufe`, `zweithuelle`, `fernleer` (der Stand vor dem Schnitt) rot beim Namen. Die Mutante `huelle` lief rot beim
  Namen am Kopf 5facf8cf2.
- gate:kreatur-takt, Probe bewohner (headless, Null-Renderer, unter dem Schloss): der Grund-Lauf GRÜN in 577 s — 89 von 89
  Leibern, 18 Häuser mit Hülle, kein Halt über 10 mm vom Boden (höchstens 8 mm), die Wiederkehr über 1 424 Wege höchstens 1,91 m
  (Soll ± 2 m; sie geht durch den Abschied des Registers, heap-register-2), der neue Lesewert `bezug` 0,976 (89 Erwachsene mit
  30 J, Soll 1 ± 0,045). Der Täter-Lauf (alle Täter in EINEM Lauf, 486 s) lief am Kopf 27d64ccf0, nicht neu am Baum mit main
  .375: 20 von 20 rot beim Namen, der neue Täter `bewohner-bezug` (der Bezug vor dem Schnitt) mit „im Median 0,886 des Bezugs
  (Soll 1 ± 0,041)“.
- Die Pflicht-Wände der Probe, vorab von Hand unter dem Schloss: gate:studio-begehen mit Selbsttest grün (454 s; neun Defekte rot beim
  Namen; B1 Hülle 0 von 10 nach Promotion · 2 von 2 nach Demotion, B2 Tür 10 von 10), gate:weltbild-frost:echt grün (260 s).
  gate:pruefbuehne-licht lief NICHT von Hand (kein Glied des Schnitts liegt in seinem Weg) — die Probe des Kopfs fährt es.

## Offen

- **Boot der Stadt +3 bis +11 s** (stadt-voll, 248,5–253,5 → 252–264 s): die Stufe 3 trägt die Solids (+12,7 ms je Haus, 326 Häuser ≈ 4,1 s Faden-Zeit), und die Liste der Bewohner wartet auf jede Hülle. Messname: Boot `stadt-voll` an der Werkbank `--echt`.
- **Zwei Bewohner weniger** (1 367 → 1 365), die zwei Häuser unbenannt (Log 50 Zeilen, Bruch-Buch 64 Texte). Messname: `bewohner` der Stadt-Sonde; Zeile im FUND-REGISTER.
- **Das Tempo des Bezugs-Leibs ist kein eigener Lesewert:** es ist `tempoEinheit(Bein) × TAGES_GESETZ.gang (1,3) × lauf 1`. Aus dem Geher-Median 1,16 m/s ÷ lauf-Median der Stadt 0,967 ≈ 1,20 m/s, aus den zwei Zahlen des Auftrags (1,07 m/s bei lauf 0,84) ≈ 1,27 m/s — beides unter dem Band 1,3–1,4 m/s. Kein Soll geschoben (Auftrag).
- **`KOENNEN_BEZUG.age`** steht als (30 − 18) / 62; nach der Landung von generationen-band gehört dort der Regler des `ALTER_GESETZ` für 30 J hin (Nachbar-Zweig, hier nicht angefasst).
- **Die Pose 804,9 / 62,8 / 402,8** ruht um 20 Uhr nie: main-Fund, Ursache benannt (oben), nicht geschnitten.
- **Radeon und OMEN ungemessen:** jede Zahl dieses Blatts ist GTX 1050.
- **`pm-fahrer-soll`:** `punkte.cjs run` lief hier nicht; das Urteil ist nur an einem Spiel-Kopf mit eine-huelle grün.
- **Schloss:** der Grund-Lauf der Bewohner-Linse hält das Schloss 8,1–9,7 min (Hand-Regel 8 min); der amtliche Selbsttest (Grund-Lauf + Täter-Lauf, 17 min) lief deshalb in zwei Griffen.
