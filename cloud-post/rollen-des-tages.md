# rollen-des-tages — eine Rolle IST ihr Tages-Angebot (Stand-Blatt)

Zweig `rollen-des-tages`, Basis `origin/main` (Vorprüfung 2 auf `leib-liest-satz-kopf2` f768ab96, main 64fcf12e V18.546.430 — f768ab96 landet vor mir,
Briefkasten 06:08/06:33/07:42). Stempel-Satz: `cloud-post/rollen-des-tages-satz.txt`. Beanspruchte Sprossen:
`karte2.mensch.macht.megastadt#1` · `karte2.mensch.nahrung.tier#2` · `karte2.mensch.macht.krieg#1`.

## TÄTER-ZAHL (vorher, gemessen VOR dem Schnitt — node, Kern von main 4c9e6aab)

Messung: der Weg der Station `mensch.nahrung.tier` S2 (`JAGD_AN`: fachwerk `exportSettlement` nH 60 → koerper `tagesOrte` → je
Slot `tagesPlan`), 8 Saaten × 24 Zeiten (h + 0,5), dazu der Tag der Wache über 1 000 Samen je 0,05 h.

| Sprosse | Täter (Datei:Zeile, main 4c9e6aab) | vorher |
|---|---|---|
| nahrung.tier#2 | `koerper-core.js:5375 TAGES_GESETZ.rollen` (keine Rolle jagt oder fischt), `:5464 angebot` (kein Revier, kein Ufer) | **0 Jäger je Saat, 0 Jagden je Tag** (Soll ≥ 1) |
| megastadt#1 | `koerper-core.js:5987 tagesPlan` (die Wache kennt im Werk nur `arbeit` am Ort `werk`) · `stamm/siedlung-bewohner.js:1228 _bewohnerListe` (der Wächter aus dem Wohnhaus nächst dem Posten, nie aus dem Bau der Wache) | **Streife 0** (Taten der Wache: schlaf 139 957 · morgen 14 685 · arbeit 280 061 · besuch 15 000 · abend 30 297); 0 Wachen mit Streife (Soll 1) |
| krieg#1 | `stamm/siedlung-bewohner.js:2612 _bewohnerNahen` (die Wache tritt 1,5 m vor die Tat und hält: kein Gegner, kein Hieb) | **0 Bewaffnete im Zweikampf** (Soll 2) |

## DER SCHNITT — EIN Gesetz: die Rolle trägt ihr Tages-Angebot

- **Kern** (`koerper-core.js`, additiv): `TAGES_GESETZ.rollen[r].tat` + `werkAm` — die Wache `streife` (die Runde `tagesStreife`
  über Punkte am Netz der Wege, dazwischen am Posten), der Jäger `jagd` am Revier, der Fischer `fischfang` am Ufer; `angebot`
  revier · ufer, `tagesOrte` stellt sie (das Revier hinter dem Saum der Äcker), `tagesBindung` bindet die Tat-Rolle an den
  nächsten Ort ihrer Tat; `tagesJagdHaushalte` · `tagesJagdWahl` (die Wohnhäuser nächst dem Revier stellen den Jäger);
  `tagesBeute`; `SPIEL_GESETZ.arten.hieb` (der EINE Zweikampf des Kerns mit der Waffe: Bradley–Terry, die Deckung hält, `bis` 2);
  `BESTAND_GESETZ.herstellung.jaeger`.
- **Wirt** (`stamm/siedlung-bewohner.js`, stellt nur den Stand): `_bewohnerListe` — die Wache aus dem Bau der Wache mit ihrer Runde
  `orte.streife`, Jäger und Fischer aus `tagesJagdWahl`; `_bewohnerNahen` endet im Akt `hieb` gegen den Spieler;
  `_bewohnerHiebTakt` rechnet den Gang über `spielKampf` (Folge: `damagePlayer` · `_creatureRemember`, Akte `S.hiebe`);
  `_bewohnerBeute` (`_bestandArt` → `_bestandAus`, der EINE Ausgang des Gaus — das Jagd-Gesetz der Tiere unberührt).
- **Drei Brüche, die der Schnitt aufdeckte** (gate:kreatur-takt bewohner · zielplan): (1) die Ankunft brach nach 12 Wenden ab und
  stellte die Wache an den Punkt einer früheren Stunde (waechter #746991 99,5 m) → die Ankunft trägt die Wenden der Runde (0
  daneben). (2) Der Stand am Revier lag 39 452 mm unter dem Boden der Säule (Überhang, jaeger #773347) → **der Gang erreicht den
  Boden der Ankunft** (`postenStand`, siehe DIE LINSE), die Sohle wieder im Soll (8 mm). (3) **Die Runde frisst den Abend**: der
  Tag der Welt dauert 60 min, die Stunde 150 s — eine Runde von 186 m braucht im Schritt 0,92 h ihrer Stunde, und `tagesKette`
  schob jede verspätete Runde in die nächste (im Kern 62 von 76 Abschnitten eng; beim doppelten Weg brach der Feierabend erst um
  7,78 Uhr auf); die Stadt-Wache #91693 ging 2 Wege statt 4 (Wenden 22,76 · 5,99 Uhr; am main 19,05 · 20,40 · 21,96 · 6,34).
  Geschnitten im Kern: **die Runde beginnt am Posten** — wer zu ihrem Aufbruch nicht am Posten steht, lässt sie aus (`K.aus`) und
  steht ab ihrer Stunde am Posten; die Verspätung trägt höchstens eine Runde weit, nie in den Abend. Gemessen (gate:kreatur-takt
  `--proben bewohner`, 318 s): Stadt Wege min 2 → **4** (4–10, Soll 4–10), Dorf 4–9, Wiederkehr 0 über, Sohle 8 mm — GRÜN.

## GEMESSEN — vorher → nachher je Sprosse

| Sprosse | Maß der Station | vorher | nachher | wo gemessen |
|---|---|---|---|---|
| nahrung.tier#2 | Umfang: Jäger je Saat (Min. über 8) | 0 | **4** (jede Saat 4) | node, der Weg des Kandidaten (Fächer `JAGD_AN`), ≈ 22 s |
| | jagdJeTag (Soll ≥ 1) | 0 | **25,9** Jagd-Stunden je Tag (207 Proben; vor dem Merge mit main 64fcf12e 26, 208) | ebenda |
| | wildDelta (Soll < 0) | null | Welt: **Δ −2** am Takt der Beute (der Jäger des Start-Dorfs, 13 Tage, 2 Beuten an den Takten 695 und 4 655, beide wirken: je Beute der Gau −1 und das Revier −1; der Leser des Spiels liest am Revier, was der Gau mit den Akten trägt) — die Station: null (OFFEN, unten) | gate:kreatur-takt `wild` (Null-Renderer, Start-Dorf) |
| megastadt#1 | Umfang: Wache mit Streife | 0 | Kern: **29 536 Runden**, 295 360 Proben in der Runde (49,6 % des Werks; vor dem Merge 27 994 — main gab der fleißigen Wache Stunden über die Schicht), 0 Runden ohne Punkt; Welt (Null-Renderer): die Wachen von Villaalto und Dorf gehen ihre Runde — die Stadt-Wache #91693 steht zur Snapshot-Stunde auf ihrer Runde und ihr Posten am Tor in der Schranke (zielplan Grund grün, Täter `zielplan-torfern` nennt sie: „20,3 m vom Posten an tor#0“), 4 Wege je Tag; **Gerät** (Radeon, Station S1 in der Seite): GERÄT-OFFEN | gate:koerper-kern ROLLEN; gate:kreatur-takt bewohner · zielplan; Radeon |
| | rho ≥ 0,7 · imSicht ≤ 0 | null | Welt: **ρ 0,943** (Rang, 6 Taten 30–150 m, Weg 45–187 m ↔ Antwort 32–144 s) · **imSicht 0**; Kern W1: 260 von 260 Taten binnen 400 m beantwortet, ρ 0,878 — die Station: null (OFFEN, unten) | gate:kreatur-takt `ruf` (Null-Renderer, Start-Dorf) · gate:koerper-kern ROLLEN W |
| krieg#1 | Umfang: Bewaffnete im Zweikampf (Soll 2) | 0 | Kern: **2 000 Zweikämpfe**, 11 501 Züge; **Gerät** (Radeon, Station S1: der Spieler tritt 8 m vor die Wache, sein Schlag ruft sie, der Hieb des Kerns): GERÄT-OFFEN — die Werkbank (swiftshader) kam an stadt-voll nicht zum ersten Weltbild (33 Karten `pnull` nach dem Absturz des GPU-Prozesses) | gate:koerper-kern ROLLEN; Radeon |
| | antwortet ≥ 1 · durchDeckung ≤ 0 | null | Kern: 3 205 von 3 205 Treffern beantwortet (1,0), 0 durch die Deckung | gate:koerper-kern ROLLEN |
| | sitzt ≥ 1 | null | null — OFFEN | — |

Ehrlich halb: von den 10 Gliedern der drei Sprossen (3 Umfänge, 7 Maße) stehen in den Linsen 9 im Soll (die drei Umfänge,
jagdJeTag, wildDelta, antwortet, durchDeckung, rho, imSicht) = 90 %, in den Stationen 6 = 60 % (rho, imSicht und wildDelta misst
die Station erst mit ihrem Sitzungs-Adapter); 1 Maß OFFEN in Linse und Station (sitzt) — gebucht ist keine der drei Sprossen.

## DIE LINSE — gate:koerper-kern ROLLEN (Tages-Familie)

`scripts/diag-koerper-kern.cjs` `rollenUrteil`: R1–R6 (die Streife: Runde, Posten, Punkte am Netz, Kette, Revier, und R6 „die Runde
frisst den Abend nicht“: je Schritt der Runde 0,3 h — die Runde 1,5 h, länger als ihre Stunde —, kein Abschnitt außerhalb des Werks
fällt, keiner bricht mehr als eine Runde später auf), J1–J7 (die Jagd:
Revier, Wahl der Jäger nächst dem Revier, Plan am Revier, Ufer, Beute, keine fremde Bindung, die Bindung trägt das Werk an Revier
oder Ufer), H0–H4 (der Hieb: Gänge, Antwort, Deckung, der Stärkere siegt). Selbsttest 69 Mutanten (mit leib-liest-satz), darunter elf Täter der Rolle
und ihres Tages-Angebots, jeder ROT beim Namen. **Am alten Kern (main 4c9e6aab) ROT**: R1, J1, J2, J3, J5, H0 (ALT = 1). **R6 am
Täter `rundeSchiebt`** (derselbe Kern, die Auslassung der Runde ausgeschaltet — die Kette vor dem Schnitt) ist ROT: „der späteste
bricht 7,70 h später auf (Soll ≤ 1,50 h, eine Runde)“; am Schnitt 0,70 h, 2 742 von 5 600 Runden ausgelassen (400 Tage × 14; die Runde
von 1,5 h geht jede zweite Stunde), 0 Tage mit gefallenen Abschnitten.
Konsum-Leser: der Wirt `_bewohnerListe` · `_bewohnerSoll` · `_bewohnerNahen` · `_bewohnerHiebTakt`.
gate:kreatur-takt: der Tag der Wache zählt die Runde als Weg im Werk (HETUS 2008 „travel during main job“,
`scripts/lib/kreatur-mensch.cjs`). Teil 1/3: Grund 9 von 9 grün, Täter 48 von 48 ROT beim Namen (706 s; bewohner 627 s, vor dem
Stand unter freiem Himmel 612 s). Teil 2/3: Grund 15 von 15 grün, Täter 55 von 56 — **`herde-revier` steht am main eae94514
byte-gleich** (`--proben herde --selftest`: blickDiffM 45.9246 an beiden Köpfen, „rot, aber nicht aus seinem Grund“, je 31 s): das
Gesetz der Herde, nicht dieser Zweig; nicht angefasst. Teil 3/3 (502 s): Grund 12 von 12, Täter 45 von 46 — `zielplan-torfern`
stürzte („reading 'anker'“): **der Bruch dieses Zweigs**. Die erste Wand des Stands (Fels je Meter bis 64 m unter ihm) verwarf jede
Höhle im Grund und mit ihr den Posten am Tor der Stadt („der Posten 0 in Villaalto — kein freier Stand“, am main eae94514 fehlt
die Zeile, zielplan dort 7 von 7). Geschnitten an der Wurzel: **der Gang erreicht den Boden der Ankunft** — der Stand gilt, wenn
der Gang vom Knoten seines Anschlusses (`_bewohnerTuerAm`) in Schritten zu 0,5 m auf dem Boden, den jeder Schritt liest
(`_koerperBodenUnter` ab der Sohle des letzten), auf der Oberkante der Säule endet (± `PLAYER_STEP_UP`); `ring.hohlM` fällt. Der
Zwischenschritt „nur der Boden des Ankers“ ließ den Überhang wieder durch (bewohner: jaeger #773347 39,452 m — das Revier liegt oben,
der Jäger kam von unten). Dazu kennt zielplan den Ort der Tat (Revier, Ufer, die Runde der Wache; Täter `zielplan-tatfern`, ROT beim
Namen „jaeger #140952: 20,3 m vom Ort der Tat revier“) und hält den Posten der Wache auf ihrer Runde in der Schranke (sonst blieb
`zielplan-torfern` unsichtbar, sobald sie zur Stunde auf der Runde ging): bis hier zählte der Jäger am Revier um 6 und 10 Uhr „ohne
Ziel“ (2 und 1 von 145, „jaeger → kein Ort“).

**gate:mensch-zuege nach dem Merge mit main 64fcf12e ROT** („kind fleissig 2/25 < 0,6“, Untergrenze [4, 24]) — nicht der Kern:
über 20 000 Samen hilft das fleißige Kind am Zweig zu 0,174, an main zu 0,168. Die Untergrenze war eine eingefrorene Ziehung; Jäger
und Fischer verschieben den Samen der Kind-Probe (Index 11 → 13) und ihre Häuser (29 → 31). Geschnitten in der Linse: die
Untergrenze nennt das Gesetz in der Probe („helfer“: je fleißiges Kind ab kindHilftAbJ in einem Haus mit Werk, gezählt an Haus und
Alter) — am Zweig 2/25 von 2 Helfern, an main 4/24 von 4; Selbsttest 10 + 8 Täter ROT.

**Kopf 2 (Briefkasten 07:42): EIN Commit mit Elter `leib-liest-satz-kopf2` f768ab96, sein Baum trägt main 64fcf12e ganz.** Gegen
f768ab96 glatt; die Zähl-Zeilen der Linse tragen die Summe (Selbsttest 69 = 52 + 11 der Rolle + 6 des Satzes, die Täter-Liste
`...rollenTaeter, ...satzTaeter`). Gegen main 64fcf12e trägt er 7 Stücke in 3 Dateien (koerper-core.js `haltung`/`zeitArt`/`tagesPlan`
das Werk · scripts/diag-mensch-zuege.cjs die Helfer · stamm/siedlung-bewohner.js `orte`): absicht-zug-4 führte `hilft` ein, dieser
Baum trägt dieselbe Zeile mit der Tat der Rolle weiter — auf einem Elter vor absicht-zug-4 unvermeidbar. Die Auflösung ist je Stück
die Seite dieses Kopfs, byte-belegt: `git merge-tree --write-tree -X theirs 64fcf12e <kopf>` = der Baum des Kopfs. Kein PR (der
Entwurf dieses Zweigs ist geschlossen: der PR-Lauf fuhr die Batterie doppelt).

**Auf `leib-liest-satz` (Briefkasten 06:08): die Tat der Rolle ist eine Zeile desselben Satzes.** Sie fließt durch denselben Leser
(`_bewohnerGemuet` → `tagesHaltung(b.akt, b.rolle, b)`), kein zweiter neben LEIB_SATZ. Geschnitten: `LEIB_SATZ.kunst` trägt die Tat
(jagd, fischfang → „haupt“, die Kunst des Werks); die Linse zieht in die Familie SATZ — **L6 die Tat der Rolle liest den Satz**: je
Rolle mit Tat zur ersten Stunde ihrer Tat Meister ↔ Lehrling ↔ Kranker getrennt in Namen und Profil (jaeger jagd 5,5 Uhr: pwalk ↔
pwalk/lehrling · pwalk/krank; fischer fischfang 5 Uhr ebenso — 2 von 2), Täter `tatOhneKunst` (LEIB_SATZ.kunst vor diesem Zweig) ROT an
L6; Selbsttest 69 von 69. Die Familie ROLLEN (R/J/H: die Runde, die Jagd, der Hieb als Tages-Angebot) bleibt in der Tages-Familie,
wie der Brief sie nennt. Dabei fiel ein Widerspruch dieses Zweigs: die Tafel `haltung` nannte „streife“ und „hieb“, doch die Wache
trägt `haltung: false` — keine Rolle las die beiden Zeilen; sie fallen (die Wache steht neutral, auch auf der Runde und im Hieb).

## DER RUF AN DIE WACHE (Kopf 3 — megastadt#1 rho · imSicht)

Geschnitten: der Kern trägt den Ruf (`koerper-core.js` `TAGES_GESETZ.ruf.reichM` 400 m, ANGENOMMEN; `tagesRuf(wachen, weg)`: es
antwortet die Wache mit dem kürzesten WEG über das Netz — hue and cry, Statute of Winchester 1285 c. 4; das Band der Profis:
Blanes i Vidal & Kirchmaier 2018, Rev. Econ. Stud. 85(2), +10 % Weg zur Wache → +1,40 % Antwortzeit, dort mit Wagen und Leitstelle).
Der Wirt: sah ein Bewohner die Tat und naht keine Wache unter den Zeugen, ruft er (`_bewohnerRuf` — EIN neues Glied neben den drei
des Briefs, sein einziger Ausgang ist `_bewohnerNahen(…, ruf)`: die gerufene Wache geht den Weg über das Netz, nie die gerade Linie;
Weg und Antwortzeit je Ruf in `S.rufe`). Bis hier nahte nur die Wache, die selbst sah (`zeugeM` 25 m): ρ war nicht zu messen.
Linse Kern: ROLLEN W1 (Täter `rufStumm`, `rufLuft` → ROT an W1), Selbsttest 71 von 71. Linse Welt: gate:kreatur-takt `ruf`
(sechs Taten neben Zeugen 30–150 m von der nächsten Waffe, der Spieler blickt der gerufenen Wache entgegen), Täter `ruf-stumm` ·
`ruf-wende` (der Hieb hält nur bis zur Wende ihres Plans) · `ruf-sprung` (sie springt an die Tat) — 3 von 3 ROT beim Namen, der
Grund grün. Zwei Brüche der Probe selbst fielen dabei: (1) ihr Schritt rückte die Spielzeit, nicht den Tag — die Stunde stand über
alle sechs Taten auf 10,0033, die Runde wendete nie, `ruf-wende` ging unerkannt; der Schritt liest jetzt den Tag wie das Spiel
(`tickDayNight`). (2) Sie zählte den Leib am Steuer eines Wagens, den keine 3D-Stufe trägt (fahrer #952: 1,0 m je achtem Schritt
in 207 m, 270 „Sprünge“ — ungezeichnet, das Bild seines Wagens glitt, `_verkehrGleit`); er gilt jetzt als drinnen.

## DER WILDBESTAND UNTER DER JAGD (Kopf 3 — tier#2 wildDelta)

Kein Gesetz geschnitten, eine Linse gebaut: der Jäger nahm schon seit Kopf 1 je Beute-Tag einen Kopf aus dem Bestand am Revier
(`_bewohnerBeute` → `_bestandArt` → `_bestandAus`, der Akt „aus“ des Gaus), nur sah niemand, ob die Welt ihn liest. Linse Welt:
gate:kreatur-takt `wild` — die Jäger des Start-Dorfs jagen über die Uhr der Welt, je zehn Spielminuten fragt jeder seinen Plan
(`_bewohnerSoll` → `_bewohnerZiel`, die Kette des Wirts, die Leute gehen nicht), bis zum ersten Beute-Tag des Kerns (`tagesBeute`,
höchstens 40 Tage, bis zwei Beute-Tage des Kerns und eine Beute, die am Takt wirkt). Am Takt jeder Beute fragt die Probe den Gau
dreimal (`_gauAuftrag`, Saat · Akte · Takt): am Takt davor und am Takt ohne ihren Akt, am Takt mit allen — **Δ −2** (13 Tage, Beuten
am Takt 695 und 4 655, je Gau −1 und Revier −1, beide „wirkt“), der Leser des Spiels (`gauLies` → `_bestandArt`) liest am Revier,
was der Gau mit den Akten trägt. Täter `wild-ohne-beute` (das Gesetz vor rollen-des-tages: der Heimweg trägt keine Beute) · `wild-aus-nichts` (der Halter
füllt sich, kein Kopf verlässt den Bestand) — 2 von 2 ROT beim Namen, der Grund grün, 66 s samt Tätern (77 s mit Selbsttest). Das Gesetz der Tiere ist
unberührt (`stamm/kreatur-*` liest die Probe nur).

**Befund (das Gesetz der Tiere, nicht mein Brief):** gemessen wird am Takt der Beute, nie am Horizont. Mit 12 Tagen und der einen
Beute am Takt 695 trug der Gau am Takt 4 322 mit ihr **14 661** Hirsche, ohne sie **13 814** — ein Kopf weniger dekorreliert den
Lauf aus EINEM Strom je Gau, +847 ist Rauschen des Laufs, keine Wirkung der Jagd. Eine Wirkung der Jagd über Tage (die Wildbiologie
misst sie als Entnahme-Rate gegen den Zuwachs) braucht dort gemeinsame Zufallszahlen je Kopf oder ein Ensemble; das ist Sache des
Gesetzbuchs der Tiere.

**Befund (die Naht Akt ↔ Schritt, das Gesetz der Tiere):** ein Akt landet einen Takt nach dem Bild (`_gauAktTakt`), und leben-core
`gauBis` rechnet je Takt zuerst den Schritt des Gesetzes (Riss, Hunger, Alter), dann die Akte. Fällt das Gesetz den Kopf an diesem
Takt selbst, ist der Akt leer: der Jäger trägt Fleisch, und der Gau legt denselben Kopf als Aas (`_gauAas`). Gesehen an 1406:4660:0
(gefällt am Takt 699) und 705:45040:0 (gefällt am Takt 4 656); das Revier am Rand des Felds ist eine Senke (Hunger ∝ Last ÷ K). Die
Linse nennt es im Feld `wie` = „gefällt“ und verlangt eine Beute, die „wirkt“. Das gehört dem Gesetzbuch der Tiere, nicht meinem Brief.

## STATIONS-KANDIDAT

`cloud-post/rollen-des-tages-station/` — `k2-mensch-nahrung.diff` · `k2-mensch-macht.diff` gegen origin/punkte-maschine 2e4ccc1b,
`BEGRUENDUNG.txt`. Wände (Zweig `punkte-maschine`): `node meisterkarte-quelle/punkte/punkte.cjs liste` 1976 Stationen · Fehler 0 (Basis und Kandidat); krieg `sek` 30 → 60,
`mutiert: true`; S2 fächert in der Seite (kein node-Fächer).

## OFFEN (mit Grund und Messnamen)

- `karte2.mensch.nahrung.tier#2` **wildDelta** in der Station — die Linse misst es (Δ −2 am Takt der Beute, gate:kreatur-takt
  `wild`); die Station `mensch.nahrung.tier` S2 fächert nur den Tag im Kern und liest die Welt-Uhr über Jagdtage erst über
  denselben Sitzungs-Adapter wie `ruf` (Zweig `punkte-maschine`). Ohne Adapter bleibt sie null.
- `karte2.mensch.macht.megastadt#1` **rho · imSicht** in der Station — die Linse misst beide (ρ 0,943, imSicht 0); die Station
  `mensch.macht.megastadt` S1 liest sie erst über einen Sitzungs-Adapter der Probe `ruf` (die Proben der Welt in der Sitzung, Zweig `punkte-maschine`: die Seiten-
  Funktion der Linse aus dem Spiel-Baum, per Anker gekürzt, im Zeitraffer der warmen Welt — die sechs Taten tragen ≈ 600 s Spielzeit,
  zu Fuß über 30 Hz zu lang für 60 s je Leiter). Kein zweiter Messweg neben der Linse: ohne Adapter bleibt die Station null.
- `karte2.mensch.macht.krieg#1` **sitzt** (der Treffer sitzt, wo die Klinge den Leib kreuzt) — die Klinge der Wache hat keine
  Bahn; heute schwingt nur der Spieler (`stamm/kampf.js`).
- Gerät: GPU-PROBE an Kopf 1 e359a2ec auf der Radeon 890M GRÜN (2 311 s: pruefbuehne-licht 61 s · weltbild-frost:echt 131 s ·
  studio-begehen 156 s · bild:stadt-voll＠0.55 162 s, ABNAHME GRÜN · webgl-probe 44 s; das Urteil im Zweig `koordination`, probe-post zu e359a2ec).
  **Mein Blick auf das Bild (stadt-voll 13:12 Uhr):** der Markt mit ≈ 45 Bewohnern, ≈ 14 davon als Leib (grün in der Maske), die
  meisten im Stand, einer rechts im Schritt — KEINER trägt eine Klinge (die Wache hält ihre Waffe am nahen Leib, `_stoffstromHand`):
  in diesem Bild steht keine Wache, also weder gehend noch stehend zu urteilen. Der zweite Blick ist `bild:dorf＠0.42`.
- Gerät: GPU-PROBE an Kopf 2 6d23bb90 auf der GTX 1050 — ROT „ohne Urteil (cancelled)“, kein Befund am Code: pruefbuehne-licht
  122 s · weltbild-frost:echt 429 s · studio-begehen 507 s GRÜN, dann fiel der Lauf 45771446651 um 07:49:41 UTC mitten in
  `bild:stadt-voll＠0.55` als Ganzes („The operation was canceled“) — weder der Deckel (Schritt 55 min, Job 70 min) noch die
  Vorfahrt (sie gäbe NACHGEGEBEN); `bild:stadt-voll` und `webgl-probe` sind dort ohne Urteil, an der Radeon (Kopf 1) GRÜN.
- Briefkasten 08:54: Kopf 2 fährt im Bündel `buendel-volk` cef21945, auf `rollen-des-tages` geht nichts mehr. Dieser Stand (Ruf an
  die Wache, Wildbestand unter der Jagd — die Abschnitte oben) parkt darum als EIN Commit über dem Bündel auf dem Sitzungs-Zweig
  `claude/modest-gates-4uhcl7`; ob er mitfährt, entscheidet der Koordinator. Meine nächste Sprosse fährt auf `werk-am-ort`.
- Gerät: die Bilder (geht eine Wache im Bild statt zu stehen) — BILD-URTEIL. `bild:stadt-voll＠0.55` fährt in der Vorprüfung 1
  neben den drei Pflicht-Wänden der Siedlung (`probe-tag`: pruefbuehne-licht · weltbild-frost:echt · studio-begehen);
  `bild:dorf＠0.42` fährt im nächsten Push — der Einlass trägt höchstens 4 Proben je Push (`PROBE_EINLASS_MAX`). Lokal (urteil-zeile):
  pruefbuehne-licht und studio-begehen GRÜN, 0 rote Zeilen; **weltbild-frost:echt kommt hier nicht zum ersten Weltbild** —
  swiftshader auf 4 Kernen übersetzt je Render-Pipeline ≈ 4 min (die Stall-Akte: #43 05:59, #44 06:03, #46 06:06), nach 1 801 s
  der CDP-Timeout (Exit 2, „Exit 2 ohne ROTE Zeile“). Der Zweig ändert keinen Shader; das Urteil des Tors fällt an der Radeon.

Status: ZWISCHENSTAND — Karte 2 gebucht 120 von 1 718.
