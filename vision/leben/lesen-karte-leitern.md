# Leser Karte 2 — die Leitern des Lebens (main 18058dba, koordination 99ebe041 vom 18.11. 18:58)

Gelesen: `git show origin/koordination:vision/meisterkarte-2.json` — alle 36 Leitern `leben.*` + `planet.kopplung.gegenwart`
(37 Leitern, 250 Sprossen: Kapitel Leben 33 Leitern/223 Sprossen, Kopplungen 4/27), jede Sprosse mit U · T · P · R; `vision/REGELN.md`
ganz (120 Zeilen); `LAGE.md` (Buchungen); Code nur zur Prüfung der Belege (Zeilen unten, Stand main).
Auffällig an der Karte selbst: `klasse` (Zeile der Preis-Treppe, R8) trägt NUR Sprosse 1 („Ort“); Sprossen 2–8 aller 37 Leitern
haben `klasse: undefined`, die Spalte Preis sagt nur „P · Pose“ — der Preis höherer Sprossen ist auf der Karte nicht aufgelöst.

## (1) URSACHEN-GRUPPEN — Sprossen 1–3 nach der fehlenden Ursache im Kern (111 Sprossen 1–3)

**U1 ERBE — kein vererbtes Individual-Genom (Eltern → Kind, Mutation, Alter → Wuchs).** Heute: die Geburt in den Bestand
schreibt `{ id, soul, g, bs, alterS: 0, x, z, v }` ohne Eltern (`stamm/kreatur-leben.js:1991–1996`), `bs` ist der Band-Wurf
`_creatureBodySize("b"+key+"."+rng)` (`:1993` → `stamm/koerper-leib.js:2545–2557`, Bänder `tetrapoda-core.js:253–260`); der Leib ist
der Gattungs-Guss uniform skaliert (`kreatur-leben.js:147–153`, `GESTALTEN_JE_REZEPT = 1` `tetrapoda-core.js:39`); Gemüt je Gattung ×
Masse (`tetrapoda-core.js:201–221`), nie vererbt.
- leben.evolution.erbe#1 · #2 · #3
- leben.evolution.muster#1 (Selektion: Räuberdruck → Größe sinkt)
- leben.evolution.zivilisation#1 (Scheu erblich) · #2 (Sozialität evolviert)
- leben.kopplung.evolution-planet#2 (Fell ↔ Boden, Bergmann über 10² Generationen)
- leben.tiere.lebenszyklus#2 (Jungtier wächst allometrisch — Alter als Achse des Leibs; `alterS` existiert, liest kein Leib)
= **8 Sprossen**

**U2 ART — keine Art als Punkt eines Merkmalsraums aus der Saat; Arten sind Hand-Tabellen.** Heute: `GATTUNGEN` 4 × 5 Dials
(`tetrapoda-core.js:62`), `ART_GESTALT` Hand-Profil je Art (`tetrapoda-core.js:3973ff`, Mischung per Gauß-Gewicht über die Dials,
Kommentar `:3969–3971`), Kopfzahl je Gattung (`:289`), 12 Baum-Gestalten (`stamm/vegetation-baum.js:3205ff` SPECIES_TREE_PARAMS),
Seele gleichverteilt aus `CREATURE_SOUL_NAMES` (`kreatur-leben.js:568–582`).
- leben.pflanzen.arten#2 · #3
- leben.tiere.arten#2 · #3
- leben.evolution.bauplan#1 · #2 · #3
- leben.tiere.verhalten#3 (10² Stichproben-Arten, Lebensweise ohne Zuweisung)
- leben.tiere.bewegung#3 (Schwimm-/Flugweise folgt dem Leib an 100 Arten)
- leben.oeko.netz#3 (10² Arten je Biom aus der Saat)
- leben.oeko.vielfalt#3 (10² Arten je ha) — teilt U6 (Menge)
- leben.wasser.bild#2 (Fischleib als Art lesbar; heute Oktaeder) — teilt U7
= **12 Sprossen**

**U3 BAUM — keine Abstammung: keine Artbildung in der Zeit, kein Ahn.** Beleg der Karte: „Würfe sind Hash(Saat, Zelle)“
(`stamm/kreatur-fauna.js:125` `VG.wurf(sk.saat, ix, iz, j)`), `STAMMBAUM` ist nur der Studio-Name (`tetrapoda-core.js:5339`).
- leben.evolution.stammbaum#1 · #2 · #3
- leben.evolution.muster#2 (Drift, Isolation → Art) · #3 (10/30 Muster)
- leben.evolution.zeitreise#1 · #2 · #3 (verwandt mit heute; Ahnen und Schwestern)
- leben.evolution.fossil#1 · #2 · #3 (Funde sind Arten des Baums; Superposition)
- leben.kopplung.evolution-planet#3 (Vikarianz: Baum-Distanz ↔ Trennungsalter)
= **12 Sprossen** (zeitreise und fossil brauchen zusätzlich U4 und die Tiefe Zeit, s. U9)

**U4 ZEIT — Bestand und Lebenslauf sind kein Raffer-fähiger Zustand(t).** Heute: Bestand als Zahl je Revier im Takt
(`BESTAND_GESETZ` `tetrapoda-core.js:2197`, taktS 10), reverse-J statisch (Beleg phyto-core.js:2899), Verjüngung nur im Labor.
- leben.pflanzen.lebenslauf#1 · #2 · #3
- leben.oeko.dynamik#2 · #3 (Räuber-Beute-Periode 8–11 Jahre in ≤ 60 s)
- leben.oeko.sukzession#2 · #3
- leben.oeko.zerfall#2 · #3
- leben.tiere.lebenszyklus#3 (Brunft zur Jahreszeit)
- leben.wasser.rhythmen#2 · #3
- leben.oeko.stoffe#3 (C-Bilanz eines Bioms)
= **13 Sprossen**; dazu verlangen erbe#3 und muster#1–#2 „10³–10⁵ Generationen ≤ 60 s Wanduhr“ — dieselbe Ursache.

**U5 NISCHE — kein Klimafeld Temperatur × Niederschlag, das Art-Merkmale liest.** Beleg: die Palme folgt dem Rauschen
`lebendig` (stamm/feld-leben.js), ROT an biome#1; Standort je Art = Hangneigung + Höhenfenster (`vegetation-baum.js:3205–3253`).
- leben.pflanzen.biome#1 · #2 · #3
- leben.pflanzen.jahreslauf#2 (Phänologie je Art gestaffelt)
- leben.wasser.lebensraeume#2 · #3
- leben.tiere.arten#1 (Art passt zum Lebensraum)
- leben.kopplung.evolution-planet#1 (Gattung × Boden-Klasse, headless 431/431)
= **8 Sprossen**

**U6 MENGE — Leiber im Bild gedeckelt (Preis/Technik, s. (5)).** `maxCreatures: 20` (`stamm/dirigent-kern.js:280`), Hirsch-Wurf
[3,7] (`tetrapoda-core.js:289`), Leib L0 62 000 tris/8 draws (`:45`).
- leben.tiere.masse#1 (ROT: 5/5/5 Glieder < 10, Akte 7de938ab) · #2 · #3 · leben.oeko.vielfalt#2 (150 Tiere im 500-m-Ring)
- leben.pflanzen.dichte#1 · #2 · #3 (Wald 24 Stämme/ha gegen 370–900)
= **7 Sprossen**

**U7 WASSER-LEBEN — kein Licht × Nährstoff-Feld, das Meer ist Höhe und Wasserkörper.**
- leben.wasser.netz#2 · #3 · leben.wasser.bild#3 · leben.wasser.lebensraeume#3 (Kelp/Seegras aus Physik, auch U5)
= **3–4 Sprossen**

**U8 FAHRT FEHLT — Mechanik steht im Kern, der Richter im Fenster wurde nie oder ROT gefahren (kein Art-Gesetz nötig).**
- leben.oeko.netz#1 · leben.oeko.dynamik#1 · leben.oeko.sukzession#1 · leben.oeko.stoffe#1 · leben.tiere.lebenszyklus#1 ·
  leben.tiere.bewegung#1 · leben.wasser.netz#1 · leben.wasser.bild#1 · leben.pflanzen.biome#1 (ROT, U5)
- ROT am Spiel/Station: leben.oeko.vielfalt#1 (GTX e4e3f363: 1 Sichtung in 601 s) · leben.oeko.partner#1 (r −0,37 < 0,5) ·
  leben.tiere.wanderung#1 (Anker am Rand des Lebensraums, 0,27–0,77 < 0,9) · leben.oeko.zerfall#1 (nur der Spieler-Tod düngt,
  Beleg kreatur-leben.js:918)
- leben.tiere.verhalten#1 (GTX GRÜN Welle 2a laut LAGE, Radeon-Paar offen) · leben.pflanzen.lebenslauf#1 · leben.pflanzen.dichte#1
= **≈ 15 Sprossen**

**U9 ÜBRIGE — eigene Ursache, kein Art-/Erbe-Gesetz:** Sinne/Verhalten (tiere.verhalten#2, tiere.mensch#2–#3,
tiere.wanderung#2–#3), Leib-Physik (tiere.bewegung#2: Fisch starr 2,5 Hz; pflanzen.kraft#2–#3), Leben formt Gelände
(leben-formt-planet#2–#3), Partner zweiseitig (oeko.partner#2–#3), N/P getrennt (oeko.stoffe#2), Stadt (stadt-im-netz#2–#3),
Tiefe Zeit des Planeten (planet.kopplung.gegenwart#1–#3: Findlinge ohne Eis, Beleg vegetation-baum.js:3246), Mikroben
(evolution.mikroben#1–#3), fremde Physik (fremde-physik#1–#3: g fest, eine Sonne), jahreslauf#3, wasser.bild#2-Licht.

**Summe U1 + U2 + U3 = 32 der 111 Sprossen 1–3** an EINER fehlenden Ursache; mit den Sprossen ≥ 4, die ausdrücklich „aus dem Genom“
oder „Klade“ sagen (lebenszyklus#6, stammbaum#4–#7, erbe#4–#6, tiere.arten#5–#8, bauplan#4–#6, muster#4–#6, evolution-planet#4–#6,
zeitreise#4–#8, fossil#4–#6, pflanzen.arten#4–#7), hängen **≈ 70 der 250 Sprossen** an diesem einen Gesetz.

**Das EINE Kern-Gesetz:** ein Genom je Individuum in physikalischen Einheiten (Masse kg, Länge m, Kost, Lebensraum-Nische,
Lebensdauer s, Wurfgröße, Fellhelligkeit, Scheu), geboren aus zwei (oder einem) Eltern-Genomen + Mutation aus der Saat des Orts und
der Zeit; die Art = die Linie im Genom-Raum (Klade-Pfad aus der Saat); der Phänotyp = f(Genom, Alter, Umwelt). Reihenfolge in (3).

## (2) RICHTER-MESSUNGEN je Gruppe — und wer ein Bild vom Gerät braucht

R2 erlaubt genau EINE Abkürzung: „Saat-Statistik einer Gestalt über ≥ 30 Saaten aus dem Gesetz, wenn eine Bild-Stichprobe im Fenster
(≥ 5 Saaten) dieselbe Größe auf ±10 % bestätigt“. Spalte K = so rechenbar (Kern + 5 Bilder); B = nur aus dem Bild/Panel; P = Prüfer-Satz
R11 (Panel ≥ 12 Menschen 2AFC oder eingefrorenes Modell auf 200 Ankern) — Korpora „liegen noch nicht im Repo“ (REGELN.md, Referenz-Korpus).

| Gruppe | Sprosse | Richter (wörtlich verkürzt) | Art |
|---|---|---|---|
| U1 | erbe#1 | Morphometrie aus Third-Bildern: Eltern-Kind-Regression 0,2–0,8; Mutante „Erbe aus“ → ≈ 0 | K |
| U1 | erbe#2 | 1 Individuum nach 1 Spieltag aus 100 wiedererkannt ≥ 90 % | B (P) |
| U1 | erbe#3 | R = h²·S ±20 %, Merkmalsmittel vorher ↔ nachher im Bild der Herde, Zeitraffer ≤ 60 s | K |
| U1 | erbe#4 | Variationskoeffizient der Körpermaße aus dem Bild, 10⁴ im Schirm | K-Größe, B-Menge |
| U1 | muster#1 | Größe sinkt unter Räuberdruck, Gegenlauf ohne Räuber; 10³ Generationen ≤ 60 s | K |
| U1 | zivilisation#1/#2 | Fluchtdistanz Eltern ↔ Kind korreliert + Gegenlauf; Gruppengröße ↔ Räuberdichte über 100 Saaten | K (Verhalten, nicht Gestalt — R2-Ausnahme deckt es wörtlich nicht) |
| U1 | evolution-planet#2 | Korrelation Fell ↔ Boden ≥ 0,5, ohne Selektion ≈ 0; Bildvergleich Nord ↔ Süd | K + B |
| U1 | lebenszyklus#2 | Bildpaar Kitz/Hirsch Panel ≥ 0,7; Jungtiere ≥ 10 % der Herde im Frühsommer | P + B |
| U2 | pflanzen.arten#2 | 100 Saaten Wuchsform-Blindtest ≥ 90 %; Silhouetten-Paare ≥ 95 % | P |
| U2 | pflanzen.arten#3 | Histogramm-Distanz (Höhe, Blattgröße, Holzdichte) ≤ 0,2 gegen TRY aus Bild-Morphometrie; ≥ 50 Arten im Bild | K + B |
| U2 | tiere.arten#2 | 1 000 Saaten Panel „echt möglich“ ≥ 0,7; Herde: kein Paar im Bild-Embedding näher als 2 Fotos desselben Tiers | P + B |
| U2 | tiere.arten#3 | Panel je Klasse ≥ 0,7; Schlankheit ↔ Reisetempo Rang ≥ 0,6 aus Silhouetten | P + K |
| U2 | bauplan#1 | 1 000 Zufalls-Genome: Bewegungs-Anteil ≥ 95 % (ohne Schlupf, ohne Durchdringung) | K |
| U2 | bauplan#2/#3 | Morphoraum-Deskriptoren gegen Natur-Bildsatz, Abdeckung ≥ 50 % | B + Korpus |
| U2 | oeko.netz#3 | Transekt an 32 Saaten: Ebenen, Omnivorie, Massenverhältnis im 90-%-Band von ≥ 20 realen Netzen; 50 Paare trennbar ≥ 90 % | B (Fraß-Ereignisse im Spielgang) |
| U3 | stammbaum#1 | Gestalt-Baum aus Third-Bildern gegen den Baum des Samens: Robinson-Foulds ≤ 0,3; Mutante „Erbe aus“ → Zufall | B |
| U3 | stammbaum#2 | Colless-Unbalance aus 100 Saaten gegen reale Kladen; Baum-Blick öffnet ≤ 1 s | K (Baumgestalt ist keine „Gestalt“ — offen, s. (6)) + B-Preis |
| U3 | stammbaum#3 | 100 Zufallsblätter als laufender Körper im vorhergesagten Lebensraum ≥ 90 %; Blatt → Körper ≤ 2 s | B |
| U3 | stammbaum#4 | Mantel-Korrelation Bild-Deskriptoren ↔ Baum-Distanz r ≥ 0,5 | B |
| U3 | muster#2 | Varianz ∝ 1/N (Insel 20 vs. 2 000); getrennte Bestände im Embedding trennbar ≥ 0,9; Paarung < 5 % | K + B |
| U3 | zeitreise#1–#3 | Panel Gegenwart/Epoche ≥ 0,8, Hin-/Rücksprung byte-gleich; Körpermassen-Median Eiszeit > heute; Ahn/Schwester = 100 % | P + B, Sprung ≤ 5–10 s |
| U3 | fossil#1–#3 | Funde im Baum = 100 %; Superposition ≥ 99 %; Fährte ±10 % zum Gang | B |
| U3 | evolution-planet#3 | Baum-Distanz wächst mit Trennungsalter der Kontinente | K (braucht Platten-Geschichte) |
| U4 | lebenslauf#1/#3 | Höhenhistogramm aus dem Bild gegen Ertragstafel; Stämme/ha + Basalfläche ±20 % | B |
| U4 | dynamik#3 | Periode 8–11 Jahre, Räuber hinkt 1–2 Jahre (Hudson-Bay) | K (Bestandsreihe) + Bild-Stichprobe |
| U5 | biome#1–#3 | Gipfel baumfrei, Uferarten ≥ 90 %, Wärme-Arten außerhalb 0; 50 Hänge Stufenfolge ≥ 90 %; Kappa ≥ 0,6 Whittaker | B |
| U6 | masse#1–#3 | Herde als EIN Pulk (≥ 10 Glieder); Φ, Kohäsion aus gezeichneten Leibern; Nachbarzahl 6–7 (Ballerini) | B |

Ohne Prüfer-Satz (P) und ohne Korpus nicht richtbar: pflanzen.arten#2, tiere.arten#2–#3, lebenszyklus#2, zeitreise#1, erbe#2 (wenn
Panel), bauplan#2–#3. Nur Kern + 5 Bilder: erbe#1, erbe#3, muster#1, bauplan#1, (zivilisation#1–#2, dynamik#3 — s. (6)).

## (3) BILLIGSTE REIHENFOLGE

1. **Individual-Genom + Erbe an den vier Gattungen** (ersetzt die Bänder `tetrapoda-core.js:253` ganz): Geburt in
   `_creatureNaturalBirth` (`kreatur-leben.js:1991–1996`) zieht Eltern aus `R.tiere` derselben Gattung und Region, Kind =
   Mittel + Mutation aus Saat × Region × Zeit; `bs` = f(Genom, `alterS`). Fällt: erbe#1 (K), muster#1 (K, Gegenlauf = Räuber aus),
   lebenszyklus#2 (Alter → Wuchs; Panel offen), evolution-planet#2 (Fell-Gen × Boden-Helligkeit), zivilisation#1 (Scheu-Gen).
   Zwingt: „10³ Generationen ≤ 60 s“ — das Erbe muss am ZAHL-Bestand laufen (Tier-Datensatz), nie am gezeichneten Leib.
   Richter billig: R2-Saat-Statistik ≥ 30 Saaten + 5 Third-Bilder (kein Panel).
2. **Wiedererkennbarkeit** (erbe#2): `netId = "c" + Sitzungs-Zähler` (`kreatur-leben.js:140–141`) trägt heute die Größe des
   Nicht-Bestands-Leibs (`:149`) — Identität hängt an der Spawn-Reihenfolge, nicht an der Welt. Genom im Tier-Datensatz löst das mit.
3. **Art-Raum aus der Saat**: `GATTUNGEN` (`tetrapoda-core.js:62`) und `ART_GESTALT` werden Anker der Erd-Saat; Arten = Punkte
   im Dial-Raum, die Mischung `artGestalt` (Gauß-Gewicht, `:3969–3971`) trägt Zwischen-Arten schon. Fällt: bauplan#1 (K),
   tiere.arten#2 (P), verhalten#3, oeko.netz#3 (Netz aus `beuteMasse 2.0` `tetrapoda-core.js:166` + Masse — Kennzahlen aus Masse
   folgen). Preis: ein Guss je Art (s. (5)).
4. **Artbildung als Baum** (Linie spaltet bei Isolation/Abstand): stammbaum#1–#2, muster#2, dann Mantel (stammbaum#4).
5. **Pflanzen auf dasselbe Gesetz**: der Roller leitet `.seq` schon an `__phytoCore.genomStrom` (`stamm/bau-teile.js:1504–1507`);
   SPECIES_TREE_PARAMS (`vegetation-baum.js:3205`) wird Anker. Fällt: pflanzen.arten#2–#3 (P/K). Braucht U5 (Nische) für #3 und biome.
6. Zuletzt zeitreise/fossil (brauchen Zeitsprung ≤ 5 s = Pflicht B, und die Tiefe Zeit des Planeten).

## (4) HEUTE GEBUCHT (Karte 2 am 18058dba, buche.sh 18.11. 18:58) — und woran

| Leiter#Sprosse | Stand | Woran |
|---|---|---|
| leben.pflanzen.jahreslauf#1 | Punkt | Kronendeckung Winter 0,037 × Sommer (Radeon), 0,113 (GTX); 19 Akten |
| leben.pflanzen.kraft#1 | Punkt | Böe nah 0–15 m als Luma-Varianz mit Laufzeit; 25 Akten |
| leben.tiere.mensch#1 | Punkt | Fluchtdistanz Hirsch 113,9 · Wolf 100,6 · Bär 52,2 · Fuchs 37,9 m (Radeon ee9c1965/7de938ab) |
| leben.wasser.lebensraeume#1 | Punkt | Bach-Kolk mit eigener Fauna; 10 Akten |
| leben.wasser.rhythmen#1 | Punkt | Fisch-Heimkehr ≥ 60 % im Fenster; 8 Akten |
| leben.kopplung.leben-formt-planet#1 | Punkt | Trittstreifen-Gras, Radeon p95 33,46 ms (7de938ab) |
| leben.kopplung.stadt-im-netz#1 | Kern | Richter GRÜN an beiden, Preis ROT: Heap 1 362,1/1 364,1 MB @bcc2cadc |
| leben.oeko.vielfalt#1 | 0 (war Punkt) | gebucht 7de938ab, gefallen am GTX-ROT e4e3f363 (1 Sichtung in 601 s) |
| leben.oeko.partner#1 | 0 | GTX ROT r −0,37 |
| leben.tiere.masse#1 | 0 | ROT: Glieder 5/5/5 < 10 (Wurf deckelt 7, `tetrapoda-core.js:289`) |

Summe: Kapitel Leben 5 / 223, Kern 0; Kopplungen 1 Punkt + 1 Kern. **Evolution: 0 von 59 Sprossen, keine einzige Akte**
(`vision/richter/leben.evolution.*` existiert nicht). Kein Gebuchtes berührt Erbe, Art oder Baum.

## (5) SPROSSEN, DIE OHNE NEUE TECHNIK NICHT FALLEN (Menge im Bild, Preis)

- **Ein Guss je Gattung, nicht je Individuum:** `GESTALTEN_JE_REZEPT = 1` (`tetrapoda-core.js:36–39`: „der Guss ist seed-invariant …
  eine Seed-Achse ist ein Re-Mint-Akt“); Individuen unterscheiden sich nur durch uniforme Skala (`kreatur-leben.js:153`). Jede
  Gestalt-Variation je Individuum (erbe#2 Muster/Narbe, erbe#4 CV der Körpermaße außer Größe, tiere.arten#2 „jedes Individuum eigen“)
  braucht Variation ohne neuen Guss (Instanz-Parameter im Shader) — sonst Bake je Individuum.
- **Ein Guss je Art:** Leib L0 62 000 tris / 8 draws, L1 7 000 / 5 draws ab 35 m × Größe (`tetrapoda-core.js:45–46`). Arten im Bild
  ⇒ Draws ∝ Arten: pflanzen.arten#3 (≥ 50 Arten im Bild), tiere.arten#3 (Riff ≥ 30 Arten), oeko.vielfalt#3–#4, tiere.arten#5–#8 —
  Bake-ms je Art: in der Quelle nicht gefunden (OFFEN).
- **Kappe 20 Leiber** (`stamm/dirigent-kern.js:280`): tiere.masse#1–#8, oeko.vielfalt#2 (150 im Ring), erbe#4 (10⁴ im Schirm),
  erbe#5 (10⁶, Bildzeit 10⁶ vs. 10³ ≤ 10 %), stammbaum#5. Takt heute schon knapp: Lebenszyklus p95 7,36 ms je Takt gegen Soll 5,8
  (gate:kreatur-takt, LAGE 12:58).
- **Zeitsprung ≤ 5 s ohne Ladebild:** zeitreise#1–#8, fossil#6, evolution-planet#3–#5, stammbaum#6 — Ankunft heute 11–17 s (Pflicht B).
- **UI:** stammbaum#2 „Baum-Blick öffnet ≤ 1 s“, #3 „Blatt → Körper ≤ 2 s“ — kein Baum-Blick im Spiel.
- **Prüfer-Satz R11 + Korpus fehlen:** jede Panel-/Blindtest-/Embedding-Sprosse (Liste in (2)); ohne sie richtet kein Art-Gesetz
  pflanzen.arten#2, tiere.arten#2–#3, zeitreise#1.
- **Chao1 im Spielgang (R4):** tiere.arten#5–#8, pflanzen.arten#5–#7 verlangen Zufallsgänge über den Planeten — es gibt einen Ort.
- **Fremde Physik:** fremde-physik#1–#7, *#6–#8 aller Arten-Leitern: g fest, eine Sonne, ein Planet.

## (6) OFFEN

- Bake-ms, MB und Takt-ms je Art/Individuum: nicht in Kommentar oder Akte gefunden; nur tris/draws je Leib (`tetrapoda-core.js:45`).
- Ob die R2-Ausnahme („Saat-Statistik einer GESTALT“) Colless (Baumform), Verhaltens-Erblichkeit (zivilisation#1) und
  Bestandsreihen (dynamik#3) deckt — der Wortlaut nennt nur Gestalt; ungeklärt, wer das entscheidet.
- `klasse` der Sprossen ≥ 2 fehlt auf der ganzen Karte: welche Preis-Zeile (Ort/Stadt/Planet) eine Sprosse wie erbe#3 trägt, ist
  nicht aufgelöst; R3 nennt eine fehlende Preis-Zahl ROT.
- `_creatureBodySize` hat vier Rufer (`kreatur-leben.js:149` · `:1993` · `kreatur-gehege.js:64` · `netz-p2p.js:1527`); ob der Peer
  (`netz-p2p.js:1527`) nach einem Genom-Schnitt noch dieselbe Größe sieht, habe ich nicht gelesen.
- phyto-core.js:2899 (reverse-J), stamm/feld-leben.js (Palme/`lebendig`, Nährstoff :3736), kreatur-leben.js:918 und
  tetrapoda-core.js:2685 (Fisch-Pendel) nur aus dem Beleg der Karte übernommen, nicht selbst gelesen.
- Ob `_pickFaunaSoulAtPlayer` (`kreatur-leben.js:1964`) eine Gattungs-Tabelle oder ein Nischen-Gesetz ist: nicht gelesen.
