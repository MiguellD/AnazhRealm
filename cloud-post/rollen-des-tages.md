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
| | wildDelta (Soll < 0) | null | null — OFFEN | — |
| megastadt#1 | Umfang: Wache mit Streife | 0 | Kern: **29 536 Runden**, 295 360 Proben in der Runde (49,6 % des Werks; vor dem Merge 27 994 — main gab der fleißigen Wache Stunden über die Schicht), 0 Runden ohne Punkt; Welt (Null-Renderer): die Wachen von Villaalto und Dorf gehen ihre Runde — die Stadt-Wache #91693 steht zur Snapshot-Stunde auf ihrer Runde und ihr Posten am Tor in der Schranke (zielplan Grund grün, Täter `zielplan-torfern` nennt sie: „20,3 m vom Posten an tor#0“), 4 Wege je Tag; **Gerät** (Radeon, Station S1 in der Seite): GERÄT-OFFEN | gate:koerper-kern ROLLEN; gate:kreatur-takt bewohner · zielplan; Radeon |
| | rho ≥ 0,7 · imSicht ≤ 0 | null | null — OFFEN | — |
| krieg#1 | Umfang: Bewaffnete im Zweikampf (Soll 2) | 0 | Kern: **2 000 Zweikämpfe**, 11 501 Züge; **Gerät** (Radeon, Station S1: der Spieler tritt 8 m vor die Wache, sein Schlag ruft sie, der Hieb des Kerns): GERÄT-OFFEN — die Werkbank (swiftshader) kam an stadt-voll nicht zum ersten Weltbild (33 Karten `pnull` nach dem Absturz des GPU-Prozesses) | gate:koerper-kern ROLLEN; Radeon |
| | antwortet ≥ 1 · durchDeckung ≤ 0 | null | Kern: 3 205 von 3 205 Treffern beantwortet (1,0), 0 durch die Deckung | gate:koerper-kern ROLLEN |
| | sitzt ≥ 1 | null | null — OFFEN | — |

Ehrlich halb: von den 10 Gliedern der drei Sprossen (3 Umfänge, 7 Maße) stehen 6 im Soll (die drei Umfänge, jagdJeTag,
antwortet, durchDeckung) = 60 %; 4 Maße OFFEN (wildDelta, rho, imSicht, sitzt) — gebucht ist keine der drei Sprossen.

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

## STATIONS-KANDIDAT

`cloud-post/rollen-des-tages-station/` — `k2-mensch-nahrung.diff` · `k2-mensch-macht.diff` gegen origin/punkte-maschine 2e4ccc1b,
`BEGRUENDUNG.txt`. Wände (Zweig `punkte-maschine`): `node meisterkarte-quelle/punkte/punkte.cjs liste` 1976 Stationen · Fehler 0 (Basis und Kandidat); krieg `sek` 30 → 60,
`mutiert: true`; S2 fächert in der Seite (kein node-Fächer).

## OFFEN (mit Grund und Messnamen)

- `karte2.mensch.nahrung.tier#2` **wildDelta** — die Beute nimmt je Jagdtag mit 26,7 % einen Kopf aus dem Bestand am Revier
  (`_bewohnerBeute` → `_bestandAus`); die Änderung des Bestands zeigt erst die Uhr der Welt über Tage der Jagd — die Station
  misst heute nur den Tag im Kern.
- `karte2.mensch.macht.megastadt#1` **rho** (Antwortzeit ∝ Weg zur Wache) — es fehlt der Ruf an die Wache: sie naht heute nur
  als Zeugin binnen `zeugeM` 25 m. **imSicht** (niemand erscheint im Sichtfeld) — die Runde über ihre Zeit am Gerät.
- `karte2.mensch.macht.krieg#1` **sitzt** (der Treffer sitzt, wo die Klinge den Leib kreuzt) — die Klinge der Wache hat keine
  Bahn; heute schwingt nur der Spieler (`stamm/kampf.js`).
- Gerät: die Bilder (geht eine Wache im Bild statt zu stehen) — BILD-URTEIL. `bild:stadt-voll＠0.55` fährt in der Vorprüfung 1
  neben den drei Pflicht-Wänden der Siedlung (`probe-tag`: pruefbuehne-licht · weltbild-frost:echt · studio-begehen);
  `bild:dorf＠0.42` fährt im nächsten Push — der Einlass trägt höchstens 4 Proben je Push (`PROBE_EINLASS_MAX`). Lokal (urteil-zeile):
  pruefbuehne-licht und studio-begehen GRÜN, 0 rote Zeilen; **weltbild-frost:echt kommt hier nicht zum ersten Weltbild** —
  swiftshader auf 4 Kernen übersetzt je Render-Pipeline ≈ 4 min (die Stall-Akte: #43 05:59, #44 06:03, #46 06:06), nach 1 801 s
  der CDP-Timeout (Exit 2, „Exit 2 ohne ROTE Zeile“). Der Zweig ändert keinen Shader; das Urteil des Tors fällt an der Radeon.

Status: ZWISCHENSTAND — Karte 2 gebucht 119 von 1 718.
