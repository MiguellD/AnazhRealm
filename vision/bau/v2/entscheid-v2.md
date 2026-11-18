# ENTSCHEID v2 — das Gesetz des Bauens, Runde 2 (Richter, Lese-Baum n1011-hg main b7ed8419, nur gelesen)

## (0) STAND NACH SPIKE v2 UND BEIDEN GEGENPRÜFERN (Kopf des Kapitels, 18.11. 23:45) — v2 BESTEHT NICHT; nur Bahn 1 ist baubar, und nur mit K1–K6

Dieser Abschnitt steht ÜBER dem Text des Richters und gilt, wo er ihm widerspricht. Quellen: `spike-v2.md`, `pruefung-spike-v2.md`
(besteht = nein, Bahn 1 baubar = ja), `pruefung-quelle-v2.md` (136 geprüft, 119 stimmen, 13 falsch, 8 davon mit Folge; besteht = nein,
Bahn 1 so nicht baubar, mit K1–K6 baubar). Nichts ist gebaut, kein Haus des Gesetzes ist gesehen.

**Die vier Stopps des Koordinators.**
| Stopp | Urteil | Zahl |
|---|---|---|
| 0 von 100 Balkenlinien über L_max | NICHT ENTSCHEIDBAR | Prototyp A 0 von 6 389 aus Konstruktion; die Linse des Spikes zählt 441 von 1 763 Häusern, aber nur unter „kein Loch in der obersten Decke“ (andere Lesart 0); ein HAUS des Gesetzes gibt es im Kern nicht |
| Ständer trifft Tür/Treppe ≤ 10 % | FÄLLT nach Wortlaut | Tür 0, Loch 0 (Zwang), aber 221 von 1 763 Podesten (12,5 %; unter den 100: 14 von 48); Runde 1 hatte 52 von 94 |
| sichtbare Vielfalt ≥ heute (440 Formen / 21 Breiten / 4,70 m / 5,8 %) | FÄLLT | Entwurf B allein 746 / 63 / 5,74 m / 6,3 %; gekoppelt mit dem Grundriss 490 / 38 / 3,14 m / 9,2 %, ohne die Riegel über 20 m 387 / 27 / 3,47 m / 9,4 % |
| jede Differenz auf eine Ursache rückführbar | HÄLT nach Wortlaut | 100 %, aber aus Konstruktion; 7 von 50 Paaren unterscheiden sich nur durch benannte Adress-Würfel |

**Was darüber hinaus fällt.** 32,1 % der Häuser haben keinen gültigen Grundriss (Schwelle 5 %; fast alle auf Losen unter 6,5 m — der Bruch
liegt in der Paarung Haushalt ↔ Los); die Höhe hat keine Ursache (Druck → Geschosse Spearman 0,125: mehr Druck macht Häuser ungültig,
nicht höher); die Los-Breiten liegen zu 100 % am Raster (belegt etwa ⅔); der Preis des Grundrisses 0,54–0,84 ms gierig bzw. 55–80 ms
erschöpfend je Haus gegen heute 0,6–4,2 µs je Rezept; Hang und Ecke haben in der Kette keinen Eingang; die Zeit baut 192 Häuser mit
Baujahr nach 1900.

**Was hält.** Die Zählung der Runde 1: 882 / 769 / 58 / 55 und 196 / 14 / 559, je Differenz 0, Skripte in `zaehl/` (Stichprobe 30:
0 Werte falsch, 1 Zeile verschoben, 3 Leser-Zitate ungenau). Der Befund an HEUTE: in derselben Stadt sind 58 % der Breiten-Varianz und
52 % der Tiefen-Varianz reiner Würfel (FC:4435, 2208–2209), 25 % der Form-Unterschiede; die Höhe ist heute verursacht. Der Besitz der
sechs Bahnen: 17 Namen, die fallen, je genau ein Besitzer (`zaehl/bahnen-besitz.cjs`), kein doppelter Besitz. Haushalt 4,85 Köpfe,
Gesinde 12,5 % (belegt 4,75 bzw. 11–14 %) — aber als Eichung, nicht als Prüfung.

**Die zwei Zweige (Urteil des Richters §1, von den Prüfern nicht bestritten).** `vorrat12b-bau-rezept` landet NICHT als Bahn „Land“:
sein Land-Maß ist ein Ausdruck in `bauProgramm`, das der Grundriss ersetzt, und sein Raumprogramm je Rolle wäre eine zweite Quelle neben
dem Haushalt; das rote `zielplan` liegt an den gewürfelten Ständen der Rollen, nicht am Plan (lesen-zweige.md). `vorrat14-oeffnungen`:
nur 5a5b53f37 (Seitenregel) geht in Bahn 1, `fluegelOffen` (16 %-Würfel ohne Uhr und Wetter) fällt. Die Sockelplatte am Hang ist eine
Fund-Zeile: sie steht schon auf main über dem Spalt, Ursache im Erdbau nicht belegt.

**BAHN 1 ÖFFNUNGEN — §4.3 gilt nur mit den Korrekturen K1–K6 aus pruefung-quelle-v2.md §4.** K1 der Flügel behält `userData.window`
und `openA`; K2 Bahn 1 besitzt FC:6170–6232 (Stufe 0), der Fenster-Flügel reist wie das Türblatt als `out.tuer` mit Feld `fenster`,
`out.fenster` fällt; K3 `glasdunkel` wird zum Schlaf-Glas ohne `__licht` ersetzt, nicht gestrichen (sonst glühen 45 % schlafende
Fenster nachts); K4 Tore: gate:fachwerk-contract statt asset-contract, dazu gate:kamera-leib; K5 FC:2411–2479 und 6233–6365 bekommen
einen Besitzer; K6 (Bahn 2) kein `bauOrt` in den PRESETS. Bahn 1 hängt an keinem der gefallenen Stopps.

**Urteil des Kopfes.** Die Haus-Kette wird nicht gebaut. Zwei Runden haben dasselbe gezeigt: jede Kette, die das Haus aus EINER
Ursache streng ableitet, verliert die Höhe und die Streuung, die heute der Würfel liefert — die fehlende Ursache ist benannt (Höhe;
Absteckung des Loses; Paarung Haushalt ↔ Los), aber nicht gefunden.

**ERSTE PUNKTE DER NÄCHSTEN RUNDE (sie ersetzen entscheid.md §0; dessen Punkte 3, 4, 5 sind erledigt, 1 und 2 gehen hier auf, 6 wartet
am GPU-Schloss).**
1. Die Ursache der HÖHE (Geschosse, Traufe) — belegt, nicht gewählt; Schwelle Traufe-Spanne ≥ 4,70 m an denselben Losen.
2. Die Paarung Haushalt ↔ Los (wer zieht auf welches Los) — Schwelle ≤ 5 % ohne Grundriss; Hang und Ecke als Eingang der Kette.
3. Ein HAUS des Gesetzes im Kern-Abbild, damit „0 Balkenlinien über L_max“ am Gebauten zählbar wird; das Podest ≥ 1,0 m licht.
4. Die Absteckung des Loses mit Ursache (belegt ⅔ am Raster) und die Zeit ohne Baujahr nach der Epoche.
5. Der Preis: Grundriss je Haus ≤ 50 µs kalt oder ein Vorrat je Schlüssel, gemessen.
6. Die 16 Vorher-Bilder am main-Kopf (Treiber p3/n1811/bau-bild liegt, ungefahren).


Gelesen ganz: v2/entwurf-grundriss-tragwerk.md (A), v2/entwurf-reichtum-ursachen.md (B), v2/fakt-zweige.md, v2/lesen-zweige.md,
zaehl/zaehl.md (Kopf, Zahlen-Tafel, Brücke, Stichprobe 1–7), entscheid.md (ganz, §0 ist Auftrag), pruefung-quelle.md, pruefung-spike.md,
CLAUDE.md „Die goldene Definition“. An der Quelle nachgelesen (fachwerk-core.js = FC, SHA-256 028cc2d0…, byte-gleich mit der Kopie
p3/n1811/bau-spike2/kern/fachwerk-core.js): FC:474–498, 1000–1097, 2221, 2230, 2245, 2405–2450, 2740–2823, 4403–4406, 9722–9735;
stamm/siedlung-tor.js:800–863; stamm/siedlung-ort.js:75–126, 250–260; stamm/dirigent-takt.js:266–268; stamm/bild-himmel.js:2835–2856;
stamm/studio-bruecke.js:190–200, 1470–1486; stamm/siedlung-wege.js (SW):2058–2077; foundry-bruecke.js:645–662, 885–893;
package.json:19–20, 49, 61, 76, 108, 132, 135, 146, 160, 163; .github/workflows/check.yml (Gate-Namen).

**Nachgefahren** (Scratch p3/n1811/bau-spike2/, kein git, kein GPU, kein Spiel-Code):
- B: `STADT_TAG=richter node stadt-proto.cjs` → richter-stadt.log gleich stadt-proto.log bis auf Zeiten, stadt-proto-richter.json
  byte-gleich stadt-proto.json; `node zaehl/vielfalt-zweit.cjs` → „GLEICH … V2 746/63/5.74/0.063“ (0,68 s).
- A: `STOFFE=eiche node grundriss-proto.cjs` → richter-grundriss-eiche.log: Selbsttest GRÜN 8/8, Eiche 581/792, Runde-1-Haushalte 68/94,
  alle Konflikt-Zähler 0, Zahl für Zahl wie grundriss-lauf.log; 55,5 ms je Haus (A nennt 67 ms für alle drei Stoffe).
- **NEU, die Kopplung beider Entwürfe** (keiner der Entwerfer hat sie gerechnet): `kopplung-richter.cjs` (sha256 4fd621ec…) legt A's
  `grundrissVon` auf die 2 595 Lose von B → kopplung-richter.log (erschöpfend), kopplung-richter-varianten.log (gierig, drei Haushalts-Lesarten);
  `zaehl/richter-kopplung.cjs` (2ab34070…) zählt daraus die sichtbare Vielfalt mit eigenem Code; `zaehl/bahnen-besitz.cjs` (ed5712f1…)
  zählt den Besitz der Bahnen am Lese-Baum. Alle Ausgaben gesammelt in p3/n1811/bau-spike2/richter-zahlen.log.

## WAS NICHT HÄLT (zuerst)

1. **Die beiden Entwürfe zusammen machen die Stadt wieder ärmer.** Jeder Entwurf hält seine eigene Schwelle nur allein. Grundriss (A)
   auf Losen, Haushalt und Zeit (B), an denselben 2 595 Losen (richter-zahlen.log):

   | Satz | gültig | Formen | Breiten | Traufe-Spanne | häufigste Form Q50 |
   |---|---|---|---|---|---|
   | heute | 2 595 | 440 | 21 | 4,70 m | 5,8 % |
   | V2 allein (B, eigener Packer) | 2 595 | 746 | 63 | 5,74 m | 6,3 % |
   | A auf B-Losen, R1-Haushalt, erschöpfend | 2 369 | 377 | 44 | 2,67 m | 14,3 % |
   | dasselbe + B-Zeit (Torfahrt-Breite, Aufstockungen) | 2 369 | 602 | 63 | 3,07 m | 10,2 % |
   | gierig, B-Haushalt + B-Zeit | 2 332 | 620 | 63 | 3,07 m | 8,0 % |
   | gierig, B-Haushalt + Miete (1,2) + B-Zeit | 2 193 | 642 | 63 | 3,47 m | 6,9 % |

   Formen und Breiten halten (≥ 440 / 21). Die Traufe-Spanne fällt in jeder Lesart (2,67–3,47 < 4,70 m), die häufigste Form ebenso
   (6,9–14,3 % > 5,8 %). **Die Wurzel:** B's Höhe kommt aus einem Packer, `fuss(s)/W ≤ dZiel` (stadt-proto.cjs:228–233). Das ist die
   Klammer Z14, die A ersetzt. A nimmt dagegen das kleinste st, für das ein Grundriss entsteht (grundriss-proto.cjs:105–113, **gewählt**).
   Der Höhe der gekoppelten Kette fehlt eine Ursache. Unsicher bleibt, wie viel davon an meiner Kopplung liegt: A baut die
   `dach`-Räume nicht (entwurf-grundriss-tragwerk.md:46), B zählt sie als Geschoss (stadt-proto.cjs:227); die Breite W(B) und die Tiefe D(A)
   sind auf Losen > 12 m nicht aus derselben Rechnung.
2. **Ohne gültigen Grundriss: 8,7–15,5 % der Häuser** der gekoppelten Stadt (Schwelle 5 %). Erschöpfend: 226/2 595, davon 209 „Tiefe“
   (das EG-Programm passt nicht auf das schmale Los). Je Los-Breite: < 5 m 141/268 gültig · 5–6,5 m 166/261 · ab 6,5 m 2 062/2 066
   (kopplung-richter.log). Mit der Miete von B (1,2) sind es 15,5 %; < 5 m nur noch 33/268. Das ist besser als A's Raster (29 %), weil
   B den Reichen das breite Los gibt. Es fällt aber trotzdem: B's Teilung macht 13 % der Lose schmaler als ¾ Einheit (entwurf B §(3)),
   ohne dass ein zweites Haus entsteht (entwurf B Punkt 6).
3. **Der Preis reißt um zwei Größenordnungen.** Grundriss erschöpfend 55,5–80,2 ms je Haus, gierig 0,54–0,84 ms
   (kopplung-richter-varianten.log); heute bauRezept 0,6–4,2 µs (pruefung-spike Urteil 16). Ein Platten-Cache hilft wenig: die 2 595
   Häuser tragen 1 189 Schlüssel (Gewerbe, Klasse, Los, Epoche, Stoff), mit B's Haushalt 1 994 (node-Zählung im Scratch, Rechenweg §3).
4. **„0 Konflikte“ (A) und „100 % rückführbar“ (B) sind beide Konstruktion.** Der Prüfer von A prüft die Rechtecke, die der Bau
   versprach (A Punkt 2). Die Paarprüfung von B prüft, dass der Code seiner Tafel folgt (B Punkt 4). Keine der beiden Nullen ist
   am gebauten HAUS gezählt.
5. **Kein Haus ist gesehen.** Kein Haus von A, keines von B und keines der Kopplung ist gebaut oder im Bild. Nach der Goldenen
   Definition ist das alles Mechanik.
6. **Folge:** Für die Haus-Kette (Los → Haushalt → Grundriss → Tragwerk) gibt es **keine Bau-Welle vor Spike v2** (§5). Starten darf
   allein **Bahn 1 ÖFFNUNGEN**. Sie hängt an keiner Zahl dieses Blatts (§4.3).

## ERGEBNIS IN DREI SÄTZEN

Entschieden: die Kette ist Haushalt → Programm → Grundriss → Tragwerk (A) auf einem Los, das eine Geschichte hat, und mit einem Haushalt,
der eine Lebensphase hat (B). Wo die Entwürfe sich widersprechen, gibt der Grundriss Tiefe und Grund-Geschosse; die Zeit gibt Aufstockung,
Anbau und Neubau; der Höhe wird eine benannte Ursache verlangt (Druck → Hof), weil gemessen ist, dass sie ohne diese Ursache verflacht.
Gezählt: der Besitz der Bahnen ist am Lese-Baum für 17 Fall-Namen je EIN Besitzer (bahnen-besitz.cjs GRÜN), Bahn 1 ÖFFNUNGEN ist als
Auftrag an einen Macher ausgeschrieben; offen bleiben Höhe, Ausfall, Preis und jedes Bild.

## (1) DAS EINE GESETZ v2

Ein Haus ist eine Adresse (Siedlung · Los · Baujahr) und die Antwort dreier Fragen an sie. **Wer wohnt hier?** Der Haushalt (B): Gewerbe,
Klasse, Wohlstand log-linear über den Rang, Lebensphase, Gesinde, Miet-Haushalte. **Was ist dem Los geschehen?** Die Geschichte (B): die
Gründungseinheit des Lokators; dann Erbgang für Erbgang Teilung, Kauf, Brand, Aufstockung und Anbau, jeder Zug ein benannter Strom der
Adresse (FNV-1a + fmix32 wie `rangSchluessel` FC:3693). **Womit wird hier gebaut?** Der Stoff des Orts (`bauOrt`) mit Holzart und
Stamm-Durchmesser. Aus dem Haushalt im Baujahr folgt das Programm (R1 `raumProgramm`). Programm, Los und Stoff ergeben den
**Grundriss (A)**: die Bänder n = ⌈L_s/L_max⌉, die Belegung, die Querzone mit der Treppe und die Türen als Zwangsachsen des
Ständer-Rasters. Erst danach kommt das **Tragwerk**: Balken nur auf Bandwänden oder Unterzügen, kein Ständer in Tür, Loch oder Lauf.
Die Breite ist das Los, auf Losen > 12 m abzüglich der Torfahrt (B, gewählt). Tiefe und Grund-Geschosse kommen aus dem Grundriss. Die
Höhe ist die Summe der Geschosse, jedes in der lichten Höhe SEINES Jahrs (Aufstockung = andere Schul-Generation, B). Dazu kommt **eine
neue Ursache: der Druck des Orts.** Der Bodenpreis nach dem Rang t setzt den Hof-Anteil des Loses; damit wird die EG-Tiefe kleiner und
das Haus höher (gewählt, §5 S-c misst es). Das Dach, die Vorkragung, das Raster und die Strebe nimmt das Haus aus der Schule der
Zimmerleute seiner Stadt im Baujahr. Die Schule erbt sie von der Eltern-Siedlung, mit Mutation (B). Fenster und Flügel sind
**Zustände** aus Samen je Fenster, Uhr und Wetter (Bahn 1). Es gibt KEINEN eigenen Würfel: `_bauweiseWurf` (FC:2203–2216), die
Kultur-Wahl im Pool (FC:4435) und der Maß-Jitter (FC:2208–2209) fallen ganz, auch im Labor. Das Labor bekommt eine eigene Adresse
(Heimat-Ort, ein Labor-Los, und den Haushalt aus seinen Reglern). Ohne `bauOrt` wirft der Bau.

**Signaturen** (Ort im Code: neuer Block in FC direkt nach `bauProgramm` FC:2245–2276, Export in `__fachwerkCore`; die Prototypen sind die
Vorlage, nicht der Code):
```
losGeschichte(stadt, i, gruendung, jetzt)        → {U, f, b, ereignisse[], bau, aufst[], anbau}   stadt-proto.cjs:201–222 (B)
haushaltVon(adr, gewerbe, klasse, rang, bau)     → {kern, gesinde, koepfe, wohl, phase, miete}     stadt-proto.cjs:205–210 (B), Miete 0,3 statt 1,2
schuleVon(siedlung, eltern, jahr)                → {neigung, raster, vork, fensterHW, strebe, gen} stadt-proto.cjs (B §(2e))
treppeVon(gH, st, spar)                          → {N, rise, go, run, loch, breite, spuren}        FC:361–368 umgezogen, Loch FC:389 (A)
grundrissVon(haushalt, baujahr, los{B,T,hof}, bauOrt) → {ok:true, s, W, D, st, b[], treppe, geschosse[…], herd} | {ok:false, grund}
                                                     wirft ohne haushalt, los.B, los.T, baujahr, bauOrt          grundriss-proto.cjs:105 ff. (A)
tragwerkVon(grundriss, bauOrt)                   → {Lmax, felder[], unterzuege[], staender[]}       (A §5)
hausVonAdresse(plan, i, bauOrt)                  → {los, haushalt, grundriss, tragwerk, schule, aufst, traufe}   DER EINE Leser für
                                                     DORF (FC:4435–4448), kachelMassen/hausMasse (FC:4074, 4119), leuteVon (FC:9527)
fensterZustand(samen, stunde, wetterWort)        → {offen: 0 | Winkel}                              Bahn 1, §4.3
pruefeGrundriss(R)                               → Linse (Bahn 6), nicht im Bau                     grundriss-proto.cjs:460–498 (A)
```

**Widersprüche der Entwürfe — entschieden.**
1. *Tiefe und Geschosse.* B rechnet D und s0 aus dem Packer `fuss(s)/W ≤ dZiel` (stadt-proto.cjs:228–233), A aus dem Grundriss → **A**.
   Grund: Wort (1) verlangt den Grundriss vor dem Tragwerk; der Packer ist die W/D-Klammer Z14 (tafel.md:258) in neuer Form. Folge,
   gemessen: B's Vielfalt-Zahlen gelten für die gekoppelte Kette NICHT (Tafel oben).
2. *Höhe.* A „kleinstes st“ (gewählt) gegen B „Packer + Miete + Aufstockung“. → Keiner allein. st_Grund ist das kleinste st, bei dem
   die EG-Tiefe ≤ T·(1 − hof(Druck)) bleibt; dazu kommen die Aufstockungen der Geschichte. Die Regel ist gewählt; S-c falsifiziert sie.
3. *Breite.* A: W = Los (G12); B: auf Losen > 12 m Torfahrt 3,5 m → **B**. Die Durchfahrt ist eine Ursache (der Wagen), kein Würfel.
4. *Haushalt.* A nimmt R1 `haushalt` (fest je Gewerbe und Klasse), B die Lebensphase → **B**. Die Miete steht auf **0,3** statt 1,2
   (B's eigener ERSTER PUNKT 3: ≈ 7 % der Leute, belegt sind 5–6 % lodgers, England, Laslett nur aus Zusammenfassungen).
5. *Labor-Würfel.* B behält `_bauweiseWurf` für das Labor (B §5) → **fällt**. Ein Labor, das würfelt, neben einer Welt, die Ursachen
   rechnet, ist der Zwilling, den die Goldene Definition verbietet. Die 21 Regler des Studios bleiben Eingänge des Spielers.
6. *Herd.* Der Herd geht ganz an GRUNDRISS-TRAGWERK (A §6): FC:585–630 und FC:919–932 liegen jetzt in einer Bahn (F8 geheilt; bahnen-besitz
   `herd` Def FC:919 → B3).
7. *Name des Orts.* `dp.ort` ist schon belegt: {x, z}, der Ort der Trasse (stamm/siedlung-ort.js:259). Der Stoff-Ort heißt darum
   **`bauOrt`** = {holz, d, sk, felsTon, lehmTon, region}. Er ist KEIN neues Feld in `ort`.
8. *Erblichkeit der Schule.* B übernimmt die Form `kind` aus vision/leben/entscheid.md:55–57. Im Code gibt es dafür kein Vorbild
   (siedlung-bewohner.js:848 rollt jeden Bewohner frisch) → **angenommen**, mit Namen „Entscheid, nicht Code“.
   Die Mutationsraten bleiben gewählt.
9. *Die zwei lebenden Zweige (fakt-zweige.md „Fragen an den Richter“).*
   (1) `vorrat12b-bau-rezept` 658269ca3 → **(b), er landet nicht als eigene Bahn.** Gründe:
   - gate:kreatur-takt ist 3/3 ROT (fakt-zweige.md:11);
   - sein Land-Maß ist ein Ausdruck in `bauProgramm` (lesen-zweige.md:14, A FC:2347). Genau diese Funktion ersetzt der Grundriss (FC:2245–2276);
   - sein Raumprogramm je Rolle (27 Zeilen BAU_NUTZUNG, lesen-zweige.md:51) wäre eine zweite Programm-Quelle neben dem Haushalt.

   Was er an Ursachen trägt, geht als Vorlage an Bahn 2: das Los sperrt wie seine Wände (`_bauFrei` imGrund) und der Torplatz `torRaum`.
   (2) `vorrat14-oeffnungen` 47fbd085f → **Bahn 1 wird auf main neu geschnitten.** Aus dem Zweig übernimmt sie nur 5a5b53f37
   (Seitenregel): die Wandseite ist eine Ursache, und der Zweig zählt 13 610 Flügel im eigenen Körper → 0. Der eine Konflikt-Hunk ist der
   Hof-Ring M FC:1513–1522 (lesen-zweige.md:162–167). 78de2458d **fällt**: `fluegelOffen` ist ein Würfel ohne Uhr und Wetter,
   „trägt ihn der Samen, nicht die Uhr“ (lesen-zweige.md:19–20). e1b3d4f44 und 47fbd085f (Fern-Tür und Fern-Liste) gehen an Bahn 2, nach
   dem Zug.
   (3) Sockelplatte am Hang → **Fund-Zeile der Tafel**, keine Bahn. Die Platte ist das Fundament (FC:429–442). Der Fehler liegt aber im
   Grund unter ihr (Erdbau FC:11107–11123, gelaende-core.js:2085–2094, lesen-zweige.md:22–24), und der liegt außerhalb der Bau-Bahnen.

## (2) WAS FÄLLT — beim Namen

| fällt | datei:zeile | Bahn | Grund |
|---|---|---|---|
| Kultur-Wahl im Pool | FC:4435 | 2 | Würfel ohne Ursache: 143 der 302 reinen Würfel-Paare (B §1) |
| Maß-Jitter Breite/Tiefe, Klemmen 5–15 / 4–11 | FC:2208–2209 | 2 | 58 % der Breiten- und 52 % der Tiefen-Varianz in derselben Stadt (B §1, stadt-proto.cjs (6)) |
| `_bauweiseWurf` ganz (Welt UND Labor) | FC:2203–2216 | 2 | Entscheid 5 |
| Wohlstands-Würfel → Breite, +1 Geschoss, Keller/Anbau/Balkon-Würfel | FC:4437–4439, 4444, 4446–4448 | 2 | Haushalt und Geschichte (B §5) |
| KULTUR-Mittel W/D/st | FC:2122–2153 (tafel.md:232) | 4 nach dem Zug | Leser `_bauweiseWurf` fällt; pitch und brace bleiben als Wurzel der Schule |
| Flur-Halbbreite aus W·0,15 und die Seed-Lage der Treppe | FC:257–261, 369–371, 385–389 | 3 | A §5: Wurzel der 52/94 |
| Ständer-Raster ±fw, Balken auf jedem Ständer | FC:418–424, 466–470 | 3 | A §5 |
| Raumprogramm-Würfel und Layout | FC:585–630 | 3 | A §5 |
| Packer capK/capL/F0, Wn = √(F·r) | FC:2245–2276 | 3 | W aus Los, D/st aus Grundriss |
| `STIL_GRENZNEIGUNG` | FC:160–208, 2230 | 3 | DECKUNG (entscheid.md §1.1) |
| Flügel 0,62 rad nach außen | FC:1084, 1089 | 1 | Zustand aus Samen, Uhr, Wetter |
| `glasdunkel` (Deckkraft 0,92) | FC:1080, 2057, 2089, 2781, 2794 | 1 | die graue Tafel; dahinter der dunkle Raum |
| `FLUEGEL_LAGE` | FC:2788, 2815 | 1 | fern steht der Flügel geschlossen in der Laibung |
| `PROXYHAUS`, `proxyGroup` | FC:47, 3596, 4542, 12399; LAB:45, 52, 59 | 2 | tot in der Welt (pruefung-quelle WAS STIMMT) |
| `STADT_MASSEN` | FC:4072, 4077, 4119, 4492, 4494, 12423 | 2 | `hausVonAdresse` |
| `DEFCOL`, `laternenglas`, `AUS_SILBER/ROST/MOOS_NORD` | 15 / 7 / 3 / 3 / 3 Treffer (bahnen-besitz) | 4 | stoffTon(bauOrt), ALTER |
| `P.ort ?? Heimat` (Text des R1-Entscheids) | entscheid.md:325 | — | DORF wirft ohne `DP.bauOrt`, tragwerkVon ohne `bauOrt` (F9) |

**Was das für die Zählung 769 / 196 / 14 / 559 heißt.** Die Zahlen sind zweitgezählt und bleiben als die Zahlen der Welle 1 der Runde 1
(zaehl.md Zahlen-Tafel: Differenz 0). c#43 wird so gelesen, wie pruefung-quelle F10 die Zeile gelesen hat: nur die Hinterfüllung Lehm
0,06. Damit bleibt die Zählung 769/196 (zaehl.md WAS NICHT HÄLT 3). v2 ändert Glieder in D1, D2, D6 und D8. Neu fällt KULTUR-Mittel
W/D/st (tafel.md:232, n 1, in Runde 1 „bleibt“), dazu der Maß-Jitter als Teil von Z14 (tafel.md:258). Die Flur-Halbbreite fw ist keine
Tafel-Zeile. **Die v2-Summe ist NICHT gezählt**, denn §2 hat noch nicht die Glied-Form von entscheid.md §(2), die zaehl-welle.cjs liest.
Die Quote „25 %“ gilt nur zusammen mit „ohne D5 31,8 %“ (zaehl.md:16).

## (3) DER PREIS

| Größe | Wert | gemessen wo | Status |
|---|---|---|---|
| Grundriss erschöpfend je Haus | 55,5 ms (Eiche-Raster, 886 Häuser) · 80,2 ms (B-Lose, 2 595) | richter-grundriss-eiche.log:60 · kopplung-richter.log | gemessen, node, ein Lauf, inkl. Prüfer |
| Grundriss gierig je Haus | 0,54 · 0,55 · 0,84 ms (drei Haushalts-Lesarten) | kopplung-richter-varianten.log | gemessen, inkl. Prüfer |
| gierig gegen erschöpfend | 2 354 gegen 2 369 gültig (−0,6 %), Formen 580 gegen 602, häufigste 10,3 gegen 10,2 % | richter-zahlen.log | gemessen |
| Stadt-Prototyp B | ≤ 0,26 ms je Haus (0,68 s für 2 595 Häuser × drei Sätze inkl. Laden; obere Schranke) | `time` beim Nachfahren | NICHT je Haus gemessen |
| heute bauRezept | 0,6–0,7 µs warm · 2,7–4,2 µs kalt | pruefung-spike Urteil 16 | gemessen (Runde 1) |
| heute DORF nH 90 | 0,71–0,95 ms lauwarm · 4,1–5,2 ms kalt | pruefung-spike Urteil 17 | gemessen (Runde 1); 2,26 ms nicht belegt |
| Cache-Schlüssel | 1 189 (R1-Haushalt) · 1 994 (B-Haushalt) von 2 595 | node über stadt-v2-haeuser-basis.json: Gewerbe·Klasse·los.b·Licht-Epoche·Stoff (+ Köpfe·Gesinde·Miete) | gezählt |

Gerechnet (nicht gemessen): gierig 0,55 ms × 90 = 50 ms je DORF-Plan, gegen heute 0,7–5,2 ms. Das ist eine Größenordnung über heute.
**Entschieden:** die Hülle (W, D, st) ist eine geschlossene Funktion der Bänder `huelleVon(programm, los, bauOrt)`. Sie läuft für jedes
Haus und auch fern. Der Grundriss füllt diese Hülle und läuft nur dort, wo ein Innenraum gebaut wird (Stufe 0, HAUS-Faden). Findet
er in der Hülle keinen Grundriss, wirft er; eine Linse zählt das. Dieselbe Hülle gilt nah und fern. Ob die Füllung immer gelingt,
prüft Spike v2 (S-f, S-g). Fällt das, fällt die Trennung, und die Kosten bleiben bei 0,5 ms je Haus.
Nicht gemessen: Tris, dc und ms der Haus-Kette im Spiel; Speicher der Bewohner (Köpfe 4,85 statt heute 3,14).

## (4) DIE BAHNEN — ausschließlicher Besitz

**Reihenfolge:** Bahn 1 ÖFFNUNGEN zuerst und allein, landet für sich. Danach, nach Spike v2 und nur wenn er hält, der Zug aus Bahn 2, 3
und 6, gemeinsam gelandet (ein Kern ohne Leser landet nie). Bahn 4 und 5 landen danach je für sich. Der Besitz liegt in **einer** Tafel,
`zaehl/bahnen-besitz.cjs` (`ZEILEN` vor `BEREICH` vor `DATEI`). Das Skript wirft, wenn sich zwei Bereiche überlappen.
Zeilen gelten am main b7ed8419.

| Bahn | Besitz (Kurzform; die volle Liste steht im Skript) |
|---|---|
| **1 ÖFFNUNGEN** | FC: 339 (`strahlFluegel`), 1010–1021 (`windowSash`), 1080–1097 (`fensterAt`, `fenster`), 2745–2823 (FENSTER_SCHLAF … `fensterFern`), 2057, 2089 (glasdunkel), die Rufer-Zeilen 764, 799, 1292, 1358, 1520, 1522, 1619, 1620, 1700, 1702, 1703, 1791, 3575, Export 12503 · foundry-bruecke.js:645–665 · stamm/siedlung-tor.js:800–863 (+ neue Methode dahinter) · stamm/dirigent-takt.js:266–270 · während ihrer Landung auch die Goldens spec/asset-contract/v6/golden/haeuser.json |
| **2 LOS-HAUSHALT-ORT** | FC: 2165–2244 (BAU_NUTZUNG, `_bauweiseWurf`, `bauRezept`), 3609–4594 (REGION_HIST, EPOCHEN, **DORF_NORM, STADT_FORM, kachelNetz, viertelWort**, STADT_MASSEN, `kachelMassen`, `hausMasse`, STADT_GRAMMATIK, DORF, **PROXYHAUS**, lodPlan), 5262–5813 (strassengraph, `dorfLayout`, PARAMS, **PRESETS**), 9028–9098, 9519–9552 (LEUTE_GESETZ), 9722–9996 (**exportSettlement**), dazu die Zeilen 7, 24, 47, 3596, 10057, 10075, 10095 und die Export-Zeilen 12399, 12405, 12412, 12416, 12420, 12423, 12424, 12479 · koerper-core.js:5176–5188 · stamm/siedlung-ort.js · **stamm/studio-bruecke.js** · worlds/fachwerk/fachwerk.js (ohne die DEFCOL-Zeilen) · stamm/siedlung-wege.js (ohne 2739–2749) · stamm/vegetation-streu.js |
| **3 GRUNDRISS-TRAGWERK** | FC: 155–338, 340–1009 (HAUS-Kopf, STIL_GRENZNEIGUNG, `wallSpec`, Herd-Lage, Raumteilung, Innenwände, `herd()`), 1022–1079 (BOGEN), 1098–1839 (Möbel, Teilbauten) ohne die Zeilen von Bahn 1, 2245–2276 (`bauProgramm`), Zeile 2230 |
| **4 STOFF** | FC: 1840–2164 ohne 2057/2089 (VERBAND, materials, DEFCOL, KULTUR), 2277–2410, 2480–2744, 6842–6954 (AUS_*), die Zeilen 56, 2058, 2090, 2097, 3685, 7533, 7559, 7560, 12474 · LAB:24, 25, 33, 35, 217, 712 · SW:2739, 2748, 2749 · stamm/stoff-material.js:2074 · porta-core.js · stamm/siedlung-satz.js · stamm/bau-vorlagen.js |
| **5 BETRIEB** | stamm/siedlung-bewohner.js (Rauch :7–119 liest `herdBrennt`, Beruf aus dem Gewerbe, später das Fensterlicht der Nacht) |
| **6 RICHTER** | **scripts/diag-fachwerk-contract.cjs**, diag-settlement.cjs, diag-haus-fern.cjs, diag-haus-welt.cjs, diag-studio-huelle.cjs, diag-altlasten.cjs, scripts/lib/ort-proben.cjs, los-proben.cjs, worlds/huelle/huelle.js; Bahn 1 hält davon, was ihre Landung bricht, bis zu ihrer Landung |

**Gezählt** (`node koordination/vision/bau/zaehl/bahnen-besitz.cjs`, sha256 ed5712f1…, Ausgabe in richter-zahlen.log). 17 Fall-Namen,
jeder mit genau EINEM Besitzer (GRÜN): glasdunkel 5, FLUEGEL_LAGE 2 → B1 · PROXYHAUS 7, proxyGroup 2, STADT_MASSEN 6, _bauweiseWurf 2 → B2 ·
shaftCX 2, shaftRange 2, bxFront 2, layJoists 2, isAxis 2, STIL_GRENZNEIGUNG 10 → B3 · DEFCOL 15, laternenglas 7, AUS_SILBER 3,
AUS_ROST 3, AUS_MOOS_NORD 3 → B4. Der erste Lauf zeigte 5 Lücken: PROXYHAUS FC:3596, STIL_GRENZNEIGUNG FC:2230, AUS_* FC:6916/6930/6937.
Sie sind in der Tafel geschlossen. `FENSTER_SCHLAF` (2 Treffer, B1) **bleibt** (die Glut der Nacht ist Bahn 5) und steht darum bei den
Bleibe-Namen. Die Bleibe-Namen haben ihre Definition in einer Bahn, ihre Leser liegen auch woanders:

| Bleibe-Name | Definition | Besitzer |
|---|---|---|
| DORF_NORM | FC:3649 | B2 |
| STADT_FORM | FC:3892 | B2 |
| kachelNetz | FC:3844 | B2 |
| viertelWort | FC:4006 | B2 |
| exportSettlement | FC:9722 | B2 |
| PRESETS | FC:5771 | B2 |
| bauProgramm | FC:2245 | B3 |
| wallSpec | FC:477 | B3 |
| herd | FC:919 | B3 |
| fensterAt | FC:1080 | B1 |
| fensterSchlaeft | FC:2752 | B1 |

**Die Herrenlosen der Runde 1 — je ein Besitzer:**

| Herrenloses (Runde 1) | Besitzer |
|---|---|
| FC:3110–4059: DORF_NORM, STADT_FORM, kachelNetz, viertelWort | B2 |
| exportSettlement FC:9722 ff. | B2 |
| PRESETS FC:5775 | B2 |
| stamm/studio-bruecke.js | B2 |
| scripts/diag-fachwerk-contract.cjs | B6 |
| DEFCOL (alle 15 Treffer) | B4 |
| fensterSchlaeft (alle 9) | B1 |
| glasdunkel | B1 |
| STADT_MASSEN | B2 |
| PROXYHAUS | B2 |
| Herd | B3 |

Was **nicht** im Skript steht: FC:2277–2479 enthält auch `bakeHaus` und `bakeLOD` (FC:2411, 2444). Sie liegen im Bereich von B4,
werden aber von keiner Bahn geändert. Bahn 1 ruft sie unverändert.

### 4.1 Der Weg des `bauOrt` — ohne `?? Heimat`
1. **Der Wirt** (stamm/siedlung-ort.js, B2) rechnet `bauOrt` EINMAL je Siedlung am Anker: Holzart aus `forestNische` (pc:3037/3047,
   entscheid.md:17), Schnee aus `schneePegel` (gc:1467), Fels und Lehm aus `kahlGrund` (gc:5835), `d` aus der Holz-Zeile. Er legt ihn
   in `dp.bauOrt`, neben `dp.ort` {x, z} (siedlung-ort.js:259).
2. **Der Kanal:** `export-settlement` trägt `m.dp` (studio-bruecke.js:1474–1477). `bauOrt` wird damit Teil des Cache-Schlüssels `frage`.
   Das ist gewollt: ein anderer Ort ergibt einen anderen Plan.
3. **Der Faden:** `exportSettlement(dp)` (FC:9722) reicht `muss(dp.bauOrt)` an `DORF` (FC:9733). DORF reicht ihn an jedes
   `hausVonAdresse`, und das ov jedes Loses trägt `bauOrt` und `haushalt` (entscheid.md §1.2). Der HAUS-Faden liest das ov
   (foundry-bruecke.js:890–892).
4. **Die Ferne:** `kachelMassen(samen, nH, i, k, epoche, bauOrt)` (FC:4074) bekommt `bauOrt` als 6. Eingang. SW:2061 und SW:2075 reichen
   den Ort aus dem Stadt-Satz `s`, den der Wirt füllt (SW gehört B2).
5. **Ohne Welt:** Die Asset-Goldens bauen „ov-frei“ (foundry-bruecke.js:886). Darum trägt jedes PRESET (FC:5771) seinen Ort als Daten
   (`bauOrt: HEIMAT` aus `ortGesetz(null)`, gc:5843, als benannter Eingang). Das Labor reicht ihn ebenso (LAB, B2). Ein Ruf ohne
   `bauOrt` wirft, in DORF, tragwerkVon und grundrissVon.

### 4.2 Bahn-Übergänge (wer liest, wer schreibt)
- B1 liest `WALLS[].win` {cy, ch, wd} (FC:494–495, B3) und schreibt es nie. B3 darf die Fenster versetzen; B1 baut, was dort steht.
- B2 ruft `grundrissVon` und `bauProgramm` (B3) über die eingefrorenen Signaturen in §1. B3 ruft nichts aus B2.
- B4 liefert `stoffTon(stoff, bauOrt)`. B1 nimmt für den dunklen Raum `_innenFaktor` (FC:2768, B1) und `innenTon` (FC:2347, B4) unverändert.

### 4.3 BAHN 1 — ÖFFNUNGEN (Auftrag an EINEN Macher)

**Ziel in einem Satz.** Das Fenster sitzt IN der Wand mit Laibung. Der Flügel steht geschlossen in der Laibung oder offen nach seinem
Zustand aus Samen, Uhr und Wetter. Hinter dem Glas liegt der dunkle Raum, keine graue Tafel.

**Basis.** main am Kopf (heute b7ed8419), Zweig neu. Zuerst Cherry-Pick 5a5b53f37 (Seitenregel `fensterAt(…, aus)`) mit der Auflösung
des einen Hunks an M FC:1513–1522 (Hof-Ring-Rufe bekommen `aus`). 78de2458d bis 47fbd085f NICHT.

**Dateien und Funktionen** (nur diese; der Besitz steht in bahnen-besitz.cjs B1):
1. `fensterAt` FC:1080–1090 — Rahmen (Sturz, Bank, Pfosten) als **Laibung**: vier Flächen von der Außenhaut bis zur Flügel-Ebene, Tiefe =
   Wanddicke der Stelle (Fachwerk `post` 0,16 FC:179, Loch-Wand FC:1513/1534). Der Flügel wird **geschlossen** gebaut, auf der Flügel-Ebene
   in der Laibung, Rotation 0. Die Literale `cz<0?0.62:-0.62` und `cx<0?-0.62:0.62` (FC:1084, 1089) fallen. `userData` trägt
   `{fenster:true, hx, zf, seite, samen:[perp, wand, u, cy]}`, das Scharnier als Daten wie die Tür (FC:982).
2. `windowSash` FC:1010–1021 — die Scheibe immer `glas`. Hinter ihr, um die Laibungstiefe nach innen, liegt **eine** Raum-Fläche im Ton
   `_innenFaktor` (FC:2768, INNEN_DAEMMER 0,92), derselben Zahl, die die Ferne schon liest (FC:2794–2795). Sie kommt in Stoff
   `putz` mit Vertex-Farbe, wie fern FC:2810, also ohne neues Material.
3. `fensterSchlaeft` FC:2752–2759 bleibt der Samen je Fenster (Hash aus seed, perp, wand, u, cy). NEU daneben:
   `fensterZustand(samen, stunde, wetterWort)` → Winkel. Gewählt und benannt (Konstanten mit Status im Block):
   - der Flügel ist zu bei Regen oder Sturm (das Wort aus `_wetterAmOrt`, bild-himmel.js:2843) und nachts;
   - morgens öffnet er zum Lüften in einem Fenster je Samen-Gewohnheit (Lage der Stunde aus den unteren Bits des Samens);
   - der Winkel des offenen Flügels ist eine Funktion des Samens in [0,3; 1,2] rad, nicht 0,62 für alle.
4. `fensterFern` FC:2790–2823 — `FLUEGEL_LAGE` (FC:2788) fällt; fern steht der Flügel geschlossen in der Laibung. Die Mischung `schlafF`
   (FC:2795) fällt mit `glasdunkel`: ein schlafendes Fenster ist fern der Raum ohne Glut, kein deckendes Blau. Die Scheibe sitzt in der
   Laibung statt `d1+0,01` vor der Wand (FC:2810).
5. `glasdunkel` FC:2057, 2089 und der Leser FC:1080 fallen. `FENSTER_SCHLAF` und die Glut der Nacht bleiben byte-gleich (Bahn 5,
   R1 ERSTER PUNKT 9).
6. **Der lebende Flügel:** `foundry-bruecke.js:645–665` reicht neben `out.tuer` ein `out.fenster` (Scharnier, Seite, Samen).
   `stamm/siedlung-tor.js` bekommt `_tickHausFenster(rec, entry, stunde, wort)` nach dem Muster `_tickTorFluegel` (siedlung-tor.js:808–860:
   Instanz-Matrix um das Scharnier auf den gebackenen Geschlossen-Vertices). Gerufen wird sie aus `stamm/dirigent-takt.js:268`
   neben `_tickHausTueren`, im selben 40-m-Ring (siedlung-ort.js:85–95), aber nur bei Stunden- oder Wetter-Wechsel. Sonst kostet sie 0.
7. Rufer-Zeilen in fremden Bereichen (FC:764, 799, 1292, 1358, 1520, 1522, 1619, 1620, 1700, 1702, 1703, 1791, 3575) ändern nur ihre Argumente.

**NICHT berührt:**
- `wallSpec` FC:477–497 (welche Fenster es gibt und wie breit sie sind: das gehört B3);
- `bogenRahmen` FC:1048 (nur gerufen), Tür und Tor (FC:961–999);
- `bakeHaus` und `bakeLOD` FC:2411, 2444;
- `LICHT_GESETZ` FC:6431, `FENSTER_SCHLAF`, die Glut der Nacht;
- `glas` FC:2071;
- jede Datei außerhalb der B1-Liste.

**Zielbild** (Bildpaar main ↔ Kopf, dieselbe Saat und Kamera; Messort wie R1 B2/B4):
- **Gasse nah:** „dorf 7 4750“, Marktgasse am Kern, Third 6 m frontal auf eine Traufwand mit OG-Fenstern (Ort von paar2-tag-nah.jpg),
  um 08:00 trocken, 12:00, 22:00 und 12:00 bei Regen. main: graue Tafel vor jedem Fenster (Tafel B1). Kopf: Glas in der Laibung,
  dahinter dunkel; morgens stehen einzelne Flügel offen, jeder in seinem Winkel; bei Regen keiner.
- **Hof:** ein Hof-Haus, Third 8 m im Hof auf die Innenseite eines Arms, 08:00. main: Flügel schlagen in den eigenen Körper. Kopf: kein
  Flügel im Körper (der Fall 5a5b53f37).

**Preis** (geschätzt, im Abdruck zu messen; Messart in der Abgabe):

| Größe | Wert | Grundlage |
|---|---|---|
| Dreiecke L0 je Fenster | +8 (Laibung) +2 (Raum-Fläche); Flügel unverändert 36 Flächen-Stufe | FC:1011 |
| Messung Dreiecke | `hausDreiecke` (FC:6311) je Preset vorher ↔ nachher | — |
| Draw-Calls | +0 im Bake, +2 im 40-m-Ring (eine Instanz-Gruppe Flügel-Rahmen, eine Glas, Einheits-Flügel per Skala) | — |
| ms | 0 je Bild ohne Wechsel; ≤ 0,2 ms an einem Stunden- oder Wetter-Wechsel | gewählt |

**Fällt, wenn** (jede Zahl vorher ↔ nachher in der Abgabe):
- Glas steht > 0,02 m vor der Wandfläche (main 0,37–0,61 m, pruefung-quelle F13);
- ein Flügel steht im eigenen Körper (Export-Sweep, vorrat14 zählte 13 610 → 0);
- bei Regen steht ein Flügel offen, oder zwischen 23 und 5 Uhr;
- um 08:00 trocken stehen weniger als 10 % oder mehr als 60 % der Flügel offen (gewählt);
- zwei offene Flügel ohne Samen-Unterschied stehen in verschiedenem Winkel;
- der Absenz-Grep `glasdunkel|FLUEGEL_LAGE|\?0\.62:-0\.62|\?-0\.62:0\.62` ist ≠ 0;
- ΔTris L0 > +12 je Fenster;
- Δdc > +2;
- der Tick kostet > 0,2 ms.

**Tore, die er fährt** (Namen aus package.json; CI check.yml fährt sie alle):
- `npm run check` (= check:statik + gate:haus-fern, package.json:19);
- gate:fachwerk-contract (:108);
- gate:asset-contract (:61; die Goldens haeuser.json werden neu gemintet, als benannte Wandlung);
- gate:haus-welt (:135);
- gate:brennglas-takt (:76; der Tür-Takt im selben Ring);
- gate:betriebsgesetz (:160);
- vor der Abgabe gate:welt-boot (:49).

**Unabhängig baubar? JA, mit zwei Bedingungen.**
- **Woher die Eingänge kommen:** Bahn 1 liest nichts aus der Haus-Kette. Die Fenster-Liste ist `WALLS` wie heute, der Samen ist
  `fensterSchlaeft` wie heute, die Uhr ist `state.timeOfDay` (siedlung-bewohner.js:2157 liest sie so), und das Wetter ist
  `_wetterAmOrt` (bild-himmel.js:2843). `_wetterAmOrt` liest den Planeten-Ort `this._gelaende().ort.wetter`, nicht `bauOrt`.
- **Bedingung 1:** Sie landet VOR dem Zug 2/3/6. Ihre 13 Rufer-Zeilen liegen in den Bereichen von B3 und B2, und der Zug setzt dann
  auf ihren Kopf auf.
- **Bedingung 2:** Ob ein Fenster-Flügel als Instanz-Teil durch die Extraktion kommt wie die Tür (foundry-bruecke.js:652–660 sucht
  `userData.side` an den Ahnen), ist NICHT gelesen. Die Welt bakt Fenster heute mit (`bakeLOD(…, alles=true)`, FC:2444, 6230). Trägt
  der Weg der Tür das Fenster nicht, schneidet der Macher es in foundry-bruecke.js:645–665. Das ist seine Datei.

## (5) DIE BEHAUPTUNGEN FÜR SPIKE v2

Der Spike rechnet am echten Kern (vm, Kopie SHA-geprüft) mit der GEKOPPELTEN Kette (§1), nicht mit einem Entwurf allein. Er baut die 100
Häuser als HAUS-Geometrie (Stufe 0) und zählt an der Geometrie, nicht an den Rechtecken des Prototyps. Der Satz: die 2 595 Haushalts-Lose
der 30 Pläne G (pool.cjs), dazu 100 Häuser der Saaten 1–2 für Bild und Geometrie. Der Prüfer ist von einer anderen Hand geschrieben als
der Bau.

| # | Behauptung | Schwelle | Falsifikation (fällt, wenn …) |
|---|---|---|---|
| S-a | keine Balkenlinie über L_max | 0 von 100 Häusern, gezählt an den Balken des gebauten HAUS (Lage, Spannweite zwischen tragenden Linien) | ≥ 1 Haus mit einer Linie > L_max; ODER die Linse bleibt GRÜN an der Mutante „Balken auf jedem Ständer“ (FC:466–470 heute) |
| S-b | Ständer trifft Tür oder Treppe | ≤ 10 % der Häuser; Treffer = Grundfläche des Ständers schneidet Türöffnung ∪ Loch ∪ Lauf-Lichtraum ∪ Podest 0,9 m | > 10 %. Treppenpfosten neben dem Loch werden mitgezählt, wenn sie im Podest stehen; A zählt sie heute getrennt (327/581) |
| S-c | sichtbare Vielfalt ≥ heute | Formen ≥ 440, Breiten-Stufen ≥ 21, Traufe-Spanne ≥ 4,70 m, häufigste Form Q50 ≤ 6 % — an denselben 2 595 Losen, gekoppelte Kette, Maß stadt-proto.cjs:111–118 | eine der vier verfehlt. Heute gekoppelt: 602–642 / 63 / **3,07–3,47** / **6,9–10,2 %** → fällt ohne die Druck-Ursache (§1 Entscheid 2). Gezählt mit zaehl/richter-kopplung.cjs |
| S-d | jede Differenz zweier Häuser hat eine benannte Ursache | ≥ 95 % von 1 200 Paaren derselben Stadt, UND die Paarprüfung wird ROT an einer Würfel-Mutante (± 1,1 m Jitter auf W, wie FC:2208) | < 95 %; ODER die Mutante bleibt GRÜN (dann beweist die Prüfung nur Konstruktion, B Punkt 4) |
| S-e | Los-Breiten gegen die belegte Verteilung | Anteil im Band ¾–2½ Einheiten ≥ 80 % (belegt: alle 8 Burghs, Stell & Tait 2016); am Viertel-Raster ± 0,5 m 50–80 % (belegt ~⅔, Edinburgh 49 Lose) | außerhalb. V2 heute 87 % und **100 %** → fällt am zweiten Maß. Die Absteckungs-Streuung braucht eine Ursache (B ERSTER PUNKT 1) |
| S-f | kein Haus ohne gültigen Grundriss | ≤ 5 % der 2 595 (gekoppelt, mit Hülle §3) | > 5 %. Heute 8,7 % (erschöpfend), 10,1 % (B-Haushalt), 15,5 % (mit Miete 1,2) |
| S-g | Preis | Hülle ≤ 20 µs je Haus warm und ≤ 50 µs kalt; DORF nH 90 ≤ 3,5 ms warm; kalt ≤ heute kalt + 20 %; Grundriss (nur Stufe 0) ≤ 2 ms je Haus im Faden; kalt UND warm im selben Prozess gemessen | eine Schwelle verfehlt (heute gierig 0,54–0,84 ms je Haus inkl. Prüfer) |
| S-h | die Höhe hat eine Ursache | Spearman(Traufe, Druck t) ≥ 0,4 an den 2 595 Losen; Traufe-Spanne mit Druck ≥ 4,70 m | < 0,4 oder Spanne < 4,70 → die Druck-Ursache ist falsch gewählt |
| S-i | Köpfe am Beleg | Haushalt Ø 4,75 ± 0,5 (Laslett), Gesinde 11–14 %, Miete 5–8 % der Leute | außerhalb (B heute 4,85 · 12,5 % · 21 % → Miete fällt bei 1,2) |

## (6) WAS DIESER ENTSCHEID NICHT WEISS

- **Wie die Kette aussieht.** Kein Bild von A, von B oder von der Kopplung. Die Vielfalt ist gezählt, nicht gesehen.
- **Ob die Druck-Ursache die Höhe trägt** (gewählt, S-h). Ob die Hülle immer füllbar ist (S-f mit Hülle ist nicht gerechnet).
- **Die Kopplung ist meine Rechnung**, nicht die eines Entwerfers. Drei Stellen sind unsicher:
  - Lose sind 30 m tief (gewählt);
  - die Stoffe sind zugeordnet: Stein → Eiche-Decke, Block und Ständer → Nadel (gewählt);
  - die Miete reist als OG-Räume zu 27,3 m², und B's `dach`-Geschoss fehlt in A.
- **Ob `_tickTorFluegel`** Fenster-Flügel trägt (§4.3 Bedingung 2). Ob der Fenster-Flügel durch `__extractAssetMesh` kommt.
- **Was noch keinen Anker hat:**
  - GEWERBE-Zeilen und -Anteile (S3 der Runde 1, unsicher);
  - Stamm-d der Arten (Eiche 0,258; „0,330“ pc:120 Radius oder Durchmesser, offen);
  - alle Ereignis-Raten (B Punkt 5);
  - die Erbgang-Länge 30 J.;
  - die Lebensphasen-Kurve;
  - der Stein im EG nach einem Brand ab 1550.
- **Die Laslett-Werte** (4,75; 11–14 %; 5–6 %) kenne ich nur aus Zusammenfassungen der Suche (B Quellen). Der Elgin-Wert 8,1 m hat 403
  geliefert. Kein Wert ist hier nachgeschlagen.
- **Nicht gezählt:** die v2-Summe der Welle (§2). Die Brücke Blätter → Tafel −84 / −58 bleibt unzählbar (zaehl.md:73–76). Spearman 0,09,
  3,11 Leute je Haus und 2,26 ms bleiben unbelegt (zaehl.md:26).
- **Wechselbalken, Wand auf Unterzug, Schub, Kamin durch die Balkenlage, Aussteifung:** ungerechnet (A Punkt 7).
- **FNV ohne Mischer** (B §5) trifft vielleicht `_rollGenome` (bau-teile.js:1480–1489) — nicht gemessen.

## (7) WAS RUNDE 1 OFFEN NANNTE UND HIER NICHT VORKOMMT — je eine Zeile

**entscheid.md §0, ERSTE PUNKTE**
- §0 EP 3 (GEWERBE und Gesinde mit Anker): fällt aus dieser Runde. Grund: B hat das Gesinde an Laslett geeicht, die GEWERBE-Zeilen
  bleiben Annahme; Schwelle S-i.
- §0 EP 6 (Bilder am main-Kopf): fällt als eigener Punkt. Grund: Die Fenster-Tafel ist Zielbild von Bahn 1. Das 300-m-Paar, Moos und
  Innenraum werden Vorher-Bilder des Zugs; ohne Bild landet keine Bahn.

**entscheid.md §6, ERSTE PUNKTE**
- §6 EP 2 (losVon an Dörfern ohne Kachel): offen in Bahn 2. Grund: Die Geschichte des Loses braucht ein Los auch ohne Kachel; nicht
  gelesen.
- §6 EP 3 (`stammD`, Eiche 0,330): offen (§6). Grund: Er hängt an phyto, keiner Bau-Bahn.
- §6 EP 4 (Anker nachschlagen): offen bis auf die Lose (Stell & Tait) und Laslett (Zusammenfassung). Grund: In dieser Runde war kein
  Abruf der Normtexte möglich.
- §6 EP 6 (Größe aus Tragfähigkeit): fällt aus dem Kapitel. Grund: Es ist Siedlungs-Gesetz, nicht Bau.
- §6 EP 7 (Gemeinde-Programm der Sonderbauten): offen, nach dem Zug. Grund: Kirche, Burg und Halle bauen heute ohne Haushalt
  (FC:4462, 4473). Bahn 2 muss sie zur Haushalts-Rolle oder zur Gemeinde-Rolle erklären; bis dahin werfen sie nicht, weil ihre Zeile
  keine `nutzung` trägt (F6).
- §6 EP 8 (Walm, Flügel, Turm fern): Bahn 2 nach dem Zug. Grund: Die Hülle §3 trägt den Kasten zuerst.
- §6 EP 9 (Fensterlicht nachts aus dem Betrieb): Bahn 5. Grund: Bahn 1 hält die Glut ausdrücklich byte-gleich.
- §6 EP 10 (Klima am Haus): fällt aus v2. Grund: Ohne gemessene Ursache bleibt es eine Tafel-Zeile.
- §6 EP 11 (Hof in die Welt): fällt aus v2. Grund: `hofFuer` (FC:3513) hat 0 Leser in stamm/ und hängt an der Geschichte des Loses;
  das kommt danach.
- §6 EP 12 (Ziegel- und Kalkfarbe aus dem Gestein): Bahn 4, blockiert. Grund: gc:3349 trägt einen Fels für die Welt.
- §6 EP 13 (`kraftJeS`): fällt. Grund: pruefung-quelle F1 (die Verdopplungszeit bleibt gleich).

**pruefung-quelle.md, ERSTE PUNKTE**
- EP 2 (Querwand-Frage, Vorher-Zahl): fällt als eigener Punkt. Grund: In v2 tragen Querwände nach Konstruktion nicht (A §1), S-a zählt
  an der Geometrie. Die Vorher-Zahl „~24 %“ bleibt Vermutung.
- EP 4 (Rauch-Vorher an Kamin-Häusern): geht an Bahn 5 als Nenner ihres Fällt-wenn. Grund: F3.
- EP 6 (die acht Blätter ganz lesen): zur Hälfte erledigt. Grund: zaehl.md deckt die Blätter a–d, f, g ab; e und h sind nicht
  zeilengedeckt geprüft und bleiben offen.

**pruefung-spike.md, ERSTE PUNKTE**
- EP 2 (Mauer, Behauptung 4): fällt aus v2. Grund: Die Mauer hängt an den Köpfen, und die stehen erst nach S-i.
- EP 4 (5b mit Messart): in S-g aufgenommen (kalt UND warm).

**Die Entwürfe der Runde 2, ERSTE PUNKTE**
- A EP 3 (Längsflur als dritte Form): offen. Grund: 34 % Durchgangsräume (A Punkt 3); nicht Schwelle dieses Blatts.
- A EP 4 (OG aus dem eigenen Programm, ist/soll Q90 2,03): offen. Grund: Er trägt zur Höhe bei und wird mit S-h gezählt.
- B EP 2 (Teilung macht Lose): offen in Bahn 2. Grund: S-f hängt daran (13 % schmale Lose ohne zweites Haus).
- B EP 6 (Massen-Bild Stufe 1, heute ↔ V2): wird Vorher-Bild des Spike v2. Grund: Ohne Bild gilt die Vielfalt als nicht gesehen.
- B EP 7 (Laslett-Verteilung der Größen): offen in S-i. Grund: Die Tafel ist nicht gelesen.
