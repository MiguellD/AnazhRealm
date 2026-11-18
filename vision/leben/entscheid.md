# ENTSCHEID — die EINE Samen-Entscheidung des Lebens (Richter, main 18058dba, nur gelesen)

Gelesen: alle zwölf Leser-Blätter und alle drei Entwürfe ganz. An der Quelle selbst nachgeprüft: kreatur-leben.js:138–160,
1940–2000, 2160–2190, 2280–2300, 2340–2440, 2536–2550, 2690–2702; koerper-leib.js:1018–1045, 2540–2560; tetrapoda-core.js:58–70,
160–170, 248–262, 836–870, 2205–2236; kreatur-verhalten.js:584–612, 3740–3750; netz-p2p.js:1484–1490, 1522–1530;
kreatur-gehege.js:60–68; feld-leben.js:2150–2160, 2183–2198, 2248–2256, 2310–2335; cores.manifest.json; Karte 2
(origin/koordination:vision/meisterkarte-2.json) wörtlich für erbe, muster, zivilisation, lebenszyklus, fremde-physik,
stammbaum, tiere.arten. Grep über die ganze Klasse `_creatureBodySize|groessen|FAUNA_MAX_AGE_MS` (stamm, scripts, spec).

## DIE ENTSCHEIDUNG

Ein Lebewesen ist eine ADRESSE (Art · Individuum · Ahn als reine Funktion von Same, Region, Welt-Uhr und Mutter), es trägt ein
ERBE (Zuchtwert-Vektor `a` nach dem Infinitesimal-Modell aus Mutter und Vater), und sein Leib ist PHYSIK seines Erbes über das
Alter (Masse M∞ = M̄_Art·e^(a+e), Wachstum nach West–Brown–Enquist, Lebensdauer ∝ M^0,20). Die AUSLESE kommt aus den Kräften, die
heute schon töten und gebären — nur wählen sie ihr Opfer und ihre Mutter jetzt nach dem Leib statt „das Älteste“: der Hunger
nimmt, wem die Reserve zuerst ausgeht (Fasten-Ausdauer ∝ M^¼), der Riss nimmt nach dem Ertrag für den Jäger (∝ M), das Alter
nimmt jeden an seiner eigenen Lebensdauer, Mutter wird nur ein reifes Tier. Das alles ist EIN Gesetz in EINER Quelle:
`leben-core.js` (`__lebenCore`). Gepfropft: die ADRESSE aus dem Entwurf baum (die Art-ID ist ein Pfad, in Welle 1 leer = die
Wurzel), der INHALT aus dem Entwurf genom, LEBENSLAUF und AUSLESE aus dem Entwurf physik. Welle 1 tötet die Größen-Bänder, den
netId-Wurf, den einen Alterstod für alle Arten und die Opferwahl nach dem Alter GANZ, und die Herde im Bild trägt Kälber, die an
ihren Müttern wachsen, und keine Riesen mehr.

## (1) DAS GESETZ — `LEBEN_GESETZ` in leben-core.js

### 1.1 Konstanten (jede mit Anker; „unsicher“ = Wert gewählt im Band der Literatur)
```
LEBEN_GESETZ = Object.freeze({
  achsen: [ { name:"lnM", h2:0.46, sdP:0.20 } ],  // Reihenfolge = Byte-Vertrag; eine Achse tritt NUR mit Leser UND Auslese ein
      // h2: Mousseau & Roff 1987 (Heredity 59:181), Morphologie ~0,46
      // sdP: Massen-CV 10–30 % in einer Population (Yablokov 1974) — unsicher
  vmJeVE:      1e-3,   // Mutations-Varianz je Generation V_M/V_E (Houle, Morikawa & Lynch 1996; Lynch & Walsh 1998) — unsicher
  lebenExp:    0.20,   // t_max ∝ M^0,20 (Sacher 1959; Calder 1984)
  wachsExp:    0.25,   // ontogenetisches Wachstum (m/M)^¼ = 1 − (1 − q^¼)·e^(−t/τ), τ ∝ M^¼ (West, Brown & Enquist 2001, Nature 413:628)
  fastenExp:   0.25,   // Fasten-Ausdauer ∝ M^0,25 (Lindstedt & Boyce 1985)
  geburtAnteil:0.06,   // q = m0/M∞ (Blueweiss et al. 1978, Huftier-Ordnung) — unsicher, für Nesthocker (Wolf, Bär) zu groß
  reifeMasse:  0.90,   // reif ⇔ m ≥ 0,9·M∞ (Definition der Reife auf der WBE-Kurve)
  reifeAnteil: 0.20,   // Eichung: der Anker-Wolf ist reif bei 0,2·t_max (Charnov 1993, α/t_max 0,1–0,25) — unsicher
  refKg: 64, refS: 2100 // DER Zeit-Anker der Welt: der Wolf (KAMPF.refKg, tetrapoda-core.js:3959) lebt die heutige Spiel-Spanne
                        // (bis heute daten.js:176). Die eine Raffung der Welt, benannt — kein Grenzwert mehr.
})
abgeleitet (kein eigener Stellwert): VA = h2·sdP² = 0,0184 · VE = (1−h2)·sdP² = 0,0216 ·
  τ_ref = reifeAnteil·refS / ln((1−q^¼)/(1−reifeMasse^¼)) = 420 s / 2,967 = 141,6 s
```
Folgen (gerechnet, Masse der Anker-Güsse): Lebensdauer Fuchs (15 kg) 26,2 min · Wolf (64) 35,0 · Hirsch (94) 37,8 · Bär (335) 48,7 —
statt 35 min für alle. Reife Fuchs 4,9 min · Wolf 7,0 · Hirsch 7,7 · Bär 10,6. Neugeborenes bs = q^⅓ = 0,39. Erwachsene bs-CV =
sdP/3 = 6,7 %, das größte erwachsene Tier bei +4σ bs 1,31 (Masse ×2,23; Wolf ≤ 142 kg statt bis 1 260 kg).

### 1.2 Funktionen (rein, ohne Zustand, ohne Wanduhr, ohne eigenen Zufall)
Der Zufall bleibt in den Strömen, die es schon gibt: der Takt-Strom `_faunaRng("bestand:"+key+"@"+R.t)` (kreatur-leben.js:2406) für
Segregation und Mutation, `_rollGenome(id, "erbe")` (bau-teile.js:1479 → genomStrom phyto-core.js:473) für die Umwelt-Streuung e.
Der Kern bekommt Gleichverteilte und rechnet nur.
```
gesetz()                               → LEBEN_GESETZ
normal(u1, u2)                         → N(0,1)            Box-Muller
gruender(n)                            → a  = √VA·n        (Einwanderer, unbekannter Vater)
kind(aM, aV, nSeg, nMut, nVater)       → a  = (aM + aV')/2 + √(VA/2)·nSeg + √(vmJeVE·VE)·nMut,  aV' = aV ?? gruender(nVater)
umwelt(n)                              → e  = √VE·n        (je Individuum fest, nie vererbt)
masseAdult(Mbar, a, e)                 → kg  Mbar·e^(a+e)
lebensdauerS(M∞)                       → s   refS·(M∞/refKg)^0,20
tau(M∞)                                → s   τ_ref·(M∞/refKg)^0,25
masseZurZeit(M∞, alterS)               → kg  M∞·[1 − (1 − q^¼)·e^(−alterS/tau(M∞))]⁴
reifeS(M∞)                             → s   tau(M∞)·ln((1−q^¼)/(1−reifeMasse^¼))
fastenRang(m)                          → m^0,25            (relativ; der Kleinste zuerst)
rissGewicht(m)                         → m                 (Energie-Ertrag des Jägers ∝ Masse, Stephens & Krebs 1986)
spanne()                               → [q^⅓·e^(−4·sdP/3), e^(4·sdP/3)]   die Größen-Grenzen DES GESETZES (statt der Bänder)
artId(wurzel, pfad = "")               → wurzel + (pfad ? "/" + pfad : "")  Welle 1: pfad leer, die Wurzel ist die Gattung
indId(key, tS, j)                      → key + ":" + tS + ":" + j
selbsttest()                           → { steigung, steigungAus, masseMonoton, reifeTreffer, lebenWolf }
```
bs eines Tiers (die Skala des Gusses): `bs = (masseZurZeit(M∞, alterS) / M_guss)^⅓`, M_guss = `_gattungLeib(g).v·ρ` (die Masse des
gegossenen Anker-Leibs, kreatur-leben.js:2358) = M̄_Art in Welle 1. Das mittlere erwachsene Tier IST der Guss (bs = 1).

### 1.3 Adress-Schema (Art · Individuum · Ahn)
- **Art**: `artId(g, pfad)`. Welle 1: pfad leer → die vier Wurzeln wolf/fox/bear/deer, M̄ = Masse ihres Gusses. Welle 3: pfad =
  Knoten im Stammbaum des Samens (Adress-Form aus dem Entwurf baum: Blatt-Intervall (lo, n), Aldous-β-Spaltung), μ_Art wandert den
  Pfad hinab. Die Form der Adresse steht ab Welle 1, kein Feld zieht später um.
- **Individuum**: `indId(key, R.t, j)` — Region, Welt-Takt der Geburt, j = Lauf-Nummer der Geburt IN diesem Takt dieser Region
  (beginnt je Takt bei 0). Ersetzt `key+"."+(++R.seq)` (kreatur-leben.js:1992); `R.seq` fällt. Die netId (kreatur-leben.js:140)
  bleibt reiner Sync-Schlüssel und liest KEIN Gesetz mehr.
- **Ahn**: `m` = id der Mutter im Datensatz (null = Gründer). Vater = das reife Tier derselben Art in der Region mit dem kleinsten
  Abstand zur Mutter (≠ Mutter; Gleichstand: frühere Stelle im Verzeichnis); ohne Vater zieht `kind` einen Gründer-Zug für ihn.
- **Datensatz** `{ id, soul, g, a:[lnM], m, alterS, x, z, v }` — `bs` und `kg` fallen als gespeicherte Felder, beide sind Ableitung.

### 1.4 Die Auslese — dieselben Kräfte, neues Opfer (kreatur-leben.js:2401–2424)
| Kraft | heute (gelesen) | Gesetz |
|---|---|---|
| Hunger (n > K) | Opfer `_bestandAeltester` :2412–2413 | Opfer = kleinster `fastenRang(m(t))`: wem die Reserve zuerst ausgeht (Junge, Kleine) |
| Riss | Opfer = Ältestes unter `beute` :2415 | Opfer gezogen aus `beute` mit Gewicht `rissGewicht(m(t))` über den Takt-Strom |
| Alter | EIN Ältester > 35 min, nur bei > 2 Freien :2420–2422 | jedes Tier mit alterS > lebensdauerS(M∞) |
| Geburt | Gruppe Erwachsener am Kandidaten-Ort, Größe gewürfelt :1984–1996 | je Kind eine Mutter, gezogen aus den Reifen der Art in R; Kind am Anker der Mutter, Verband v der Mutter, alterS 0, wächst. Ohne reife Mutter: Gründer-Gruppe am Kandidaten-Ort wie heute, alterS = reifeS(M∞) |

Die Bilanz (wann, wie viele: `bestandBilanz`, herde.wurf) bleibt unberührt — nur WER stirbt und WER gebiert, liest jetzt das Erbe.
Folge, ohne dass ein Term eine Richtung nennt: unter Räubern trifft der Ertrag die großen Erwachsenen (Größe sinkt), ohne Räuber
trifft der Hunger die kleinen Jungen (Größe steigt), die Reife kostet die Großen Zeit (Charnov). Das ist muster#1 wörtlich
(„Räuberdruck auf große Hirsche → Größe sinkt; Gegenlauf ohne Räuber“) — als Ergebnis gemessen, nicht eingestellt.

## (2) DIE EINE QUELLE und jeder Leser

**leben-core.js** (neu, ns `__lebenCore`, `funktion: true`, kein THREE). Grund für den eigenen Kern: das Gesetz gehört keiner
Gattung — Tier (tetrapoda) und Pflanze (phyto, Welle 3) und der Stammbaum (Welle 3) lesen DASSELBE Erbe; in tetrapoda-core wäre
die Pflanze ein Fremd-Leser des Tier-Buchs. Der Lade-Pfad ist gelesen: cores.manifest.json (Kern-Satz, gate:studio-vertrag :35),
index.html:10007 (Script-Zeile neben tetrapoda-core.js), package.json `check:statik` (node --check). planet-core scheidet aus
(lädt nur im Faden, voxel-worker.js:1155).

Leser in Welle 1 (jede Stelle gelesen):
- kreatur-leben.js:1984–1996 `_creatureNaturalBirth` → `kind`/`gruender`/`umwelt`/`indId`, Mutter/Vater aus R.tiere.
- kreatur-leben.js:2344–2346 `_bestandKg` → `masseZurZeit(masseAdult(M_guss, a, e), alterS)`; der Cache `t.kg` fällt, `t.wild`
  (:2347) wird je Takt neu geurteilt (der Welpe < 21,5 kg ist „scheu“, tetrapoda-core.js:1960, ab dem Wachstum „wild“).
- kreatur-leben.js:2412–2422 `_bestandTakt` → `fastenRang`, `rissGewicht`, `lebensdauerS`; `_bestandAeltester` :2372 fällt ganz.
- kreatur-leben.js:2692–2697 `_bestandLeib` → `{bodySize: bs(t)}`; ein Leib aus Stand (snap) bekommt nach der Wiederkehr bs(t);
  jeder gezeichnete Leib eines Bestand-Tiers wächst je Takt über `_kreaturGroesseSetzen`, wenn Δbs > 2 %.
- kreatur-leben.js:149 → ein Leib ohne Bestand (Boot, DSL, Hof) ist das ART-MITTEL (a = 0, e = 0, erwachsen, bs = 1); die
  Annahme `_bestandAdoptieren` :2482 schreibt ihn mit a = 0 ein — kein Wurf, kein Sprung.
- kreatur-leben.js:1902 Blick-Kugel → `spanne()[1]` statt `groessen.at(-1).max`.
- kreatur-verhalten.js:590 `_kreaturGroesseSetzen` → klemmt auf `spanne()`; die Wand :3745–3746 verlangt groessen nicht mehr.
- kreatur-gehege.js:64 → Gründer über `_rollGenome("g"+p.id, "erbe")`, erwachsen (dieselben Tiere in jedem Boot).
- netz-p2p.js:1487 → der Sender schickt `b` = bodySize (3 Stellen); :1527 der Empfänger setzt sie, würfelt nie.
- feld-leben.js:2157–2159 (`annahme` fremd) und :2185–2196 / :2252 (Stand) → `a`, `m` reisen, `bs` nicht; ein Tier des alten Stands
  ohne `a` wird als Gründer seiner id gelesen (benannte Wandlung, deterministisch, kein stiller Ersatz).
- Temperament, Beute (`_bestandJagd` :2165), Biss, Magen, Kadaver, hp lesen schon heute die EINE Masse → kein neuer Leser.

## (3) WAS FÄLLT — beim Namen, ganz, in derselben Landung
- tetrapoda-core.js:253–259 `VERHALTEN.groessen` (vier Bänder, Länge ×4,5, Masse ×91).
- stamm/koerper-leib.js:2542–2557 `_creatureBodySize` samt Kommentar :3493 und ALLEN vier Rufern: kreatur-leben.js:149 (netId),
  :1993 (Geburtswurf ohne Eltern), kreatur-gehege.js:64, netz-p2p.js:1527.
- kreatur-leben.js:1902 `groessen.at(-1).max`; kreatur-verhalten.js:590–596 Band-Klemme; :3745–3746 Band-Wand.
- stamm/daten.js:174–177 `FAUNA_MAX_AGE_MS` (35 min für jede Art) und sein Leser kreatur-leben.js:2420–2422 (samt Kommentar :241).
- kreatur-leben.js:2372 `_bestandAeltester` und seine drei Rufe :2413, :2415, :2421 (das Opfer nach dem Alter).
- kreatur-leben.js:1992 `R.seq` als Kennung; der Datensatz-Teil `bs` (Bestand, Stand, p2p-Annahme feld-leben.js:2158–2159).
- Die Band-Leser im Prüf-Apparat (die ganze Klasse, gegrept): scripts/diag-koerper-stand.cjs:947, diag-kollision-bild.cjs:709,
  diag-kreatur-leben.cjs:1568, diag-studio-uebergabe.cjs:307, diag-studio-vertrag.cjs:857–858 und :1048, playtest/gelaende-boden.cjs:1791,
  lib/kampf-proben.cjs:853, lib/kreatur-proben.cjs:1461 und :2974–2976, lib/abdruck.cjs:587 (`n: u.netId` im Tier-Hasher, der
  „A gegen A“-Täter an tier:*), spec/stamm/modul-karte.json (Einträge der gefallenen Funktionen).
- Absenz-Grep am Kopf: `_creatureBodySize|\.groessen\b|FAUNA_MAX_AGE_MS|_bestandAeltester` in stamm/, tetrapoda-core.js, scripts/ = 0.
- Kein Schalter „Erbe aus“ im Spiel. Die Mutante für den Richter ist ein Probe-Eingriff in `__lebenCore.kind` (→ `gruender`) nur in
  der Probe.

## (4) WELLE 1 — ein Tag, vier Bahnen, ausschließlicher Datei-Besitz

Reihenfolge: **B1 zuerst** (die Signaturen §1.2 eingefroren, Kern-Selbsttest grün, ≤ 2 h); dann **B2, B3, B4 parallel** gegen den
eingefrorenen Kern; B4 regeneriert die Modul-Karte als letzter Schritt nach B2 und B3. **Gelandet wird EINMAL, alle vier im selben
Zug** (ein Kern ohne Leser landet nie; B3 löscht, was B2 nicht mehr liest). Abgabe je Bahn mit
`node scripts/werkbank.cjs abdruck --gegen 18058dba` (außerhalb der eigenen Dateien byte-gleich).

### B1 leben-kern
- Dateien: `leben-core.js` (neu), `cores.manifest.json`, `index.html` (eine Script-Zeile), `package.json` (check:statik).
- Schnitt: LEBEN_GESETZ §1.1 und die Funktionen §1.2 als reine Funktionen; `selbsttest()` im Kern.
- Bildpaar: keins allein — Beweis im laufenden Spiel ist `window.__lebenCore.gesetz()` in der Konsole der Blick-Sonde.
- Sprossen: trägt erbe#1 und muster#1 (die Rechnung); fällt keine allein.
- Stopp: Selbsttest grün mit Zahlen im Commit — 10⁴ Eltern-Kind-Paare Steigung Kind auf Eltern-Mittel 0,46 ± 0,02, mit
  `gruender` statt `kind` 0 ± 0,02; `masseZurZeit(M,0) = q·M`, `masseZurZeit(M, reifeS(M)) = 0,9·M` ± 1e−9, monoton;
  `lebensdauerS(64) = 2100`; Boot-Δ der neuen Script-Zeile gemessen (Ziel ≤ 5 ms).

### B2 leben-bestand
- Datei: `stamm/kreatur-leben.js` (allein).
- Schnitt: Geburt aus Mutter und Vater §1.4 mit `indId` (R.seq fällt), `_bestandKg` als Funktion des Alters (Cache fällt, `t.wild`
  je Takt), Opfer nach `fastenRang`/`rissGewicht`, Alterstod je Tier, `_bestandAeltester` gelöscht, :149 Art-Mittel, :1902
  `spanne()`, Wachstum des gezeichneten Leibs je Takt, Wiederkehr aus snap mit bs(t), Kommentare :241 :1884 :1981.
- Bildpaar F1 (main ↔ Kopf): Messort tiere.mensch#1 (die Hirsch-Herde der Wiese am Spawn), Werkbank am Messort, Third-Kamera
  20 m seitlich, Mittag, gleiche Saat, gleiche Spielzeit 20 min nach der Ankunft. main: Erwachsene in Bändern (18 % „klein“
  0,6–0,82 ohne Mutter, selten ein Riese bis bs 2,7), kein Jungtier. Kopf: Erwachsene gleich groß (±7 % Länge), Kälber 0,4–0,9
  der Mutterlänge IN der Herde, kein Riese. Zahl aus dem Bild: CV der Widerrist-Höhe der Erwachsenen main ≈ 0,31 (gerechnet aus
  den Bändern) → Kopf ≤ 0,08; Jungtier-Anteil main 0 → Kopf ≥ 10 %.
- Sprossen: leben.evolution.erbe#1 · leben.evolution.muster#1 (Richter-Akten in B4).
- Stopp: F1-Zahlen am Kopf; `gate:kreatur-takt` p95 nicht schlechter als main (heute 7,36 ms); Bestand je Revier über 3 Spielstunden
  im Band wie main (der Richter von lebenszyklus#1 als Nicht-Rückfall); Absenz-Grep in der Datei = 0.

### B3 leben-huelle
- Dateien: `tetrapoda-core.js`, `stamm/koerper-leib.js`, `stamm/kreatur-verhalten.js`, `stamm/kreatur-gehege.js`,
  `stamm/netz-p2p.js`, `stamm/feld-leben.js`, `stamm/daten.js`.
- Schnitt: `VERHALTEN.groessen` und `_creatureBodySize` (samt :3493) gelöscht; Klemme auf `spanne()`, Wand ohne groessen;
  Gehege-Gründer; Peer übernimmt `b` des Senders; Stand und Annahme tragen `a`, `m` (Wandlung alter Stand → Gründer seiner id);
  `FAUNA_MAX_AGE_MS` gelöscht.
- Byte-Beweis: der Ofen liest groessen nie (bakeTierInstance/deriveTierParams unverändert) → Guss-Bytes aller vier Gattungen gleich,
  die IDB-Platte bleibt (`istDefault` koerper-leib.js:1030 unberührt); der Abdruck nennt nur den VERHALTEN-Fingerabdruck und die Tiere.
- Bildpaar F2 (main ↔ Kopf): Wald am Spawn, Wolfsrudel, Third 15 m, dazu zwei Fenster (Mitspieler) auf dasselbe Tier.
  main: ein Rudel kann einen Riesen tragen; beim Mitspieler steht dasselbe Tier bis ×4,5 anders groß. Kopf: kein Wolf über bs 1,31;
  Welpen bleiben bei der Hetze zurück (Temperament „scheu“); beim Mitspieler dieselbe Skala auf 3 Stellen.
  Zahl: Max-Masse der Wölfe im Zahl-Bestand über 30 Saaten main ≈ 1 260 kg → Kopf ≤ 142 kg; Peer-Skala gleich n/n.
- Sprossen: keine eigene (die Hülle macht erbe#1 erst wahr: ohne sie würfelt der Peer weiter).
- Stopp: Absenz-Grep in stamm/ und tetrapoda-core.js = 0; Guss-Bytes gleich; Peer n/n gleich; Stand-Runde (speichern → laden)
  n/n gleiche Größe.

### B4 leben-richter
- Dateien: `scripts/diag-kreatur-leben.cjs`, `scripts/diag-koerper-stand.cjs`, `scripts/diag-kollision-bild.cjs`,
  `scripts/diag-studio-uebergabe.cjs`, `scripts/diag-studio-vertrag.cjs`, `scripts/playtest/gelaende-boden.cjs`,
  `scripts/lib/kampf-proben.cjs`, `scripts/lib/kreatur-proben.cjs`, `scripts/lib/abdruck.cjs`, `spec/stamm/modul-karte.json`.
- Schnitt: die Band-Leser ziehen auf `spanne()`/`indId` um; der Tier-Hasher des Abdrucks hasht `_bestand.id` + `a` statt netId;
  in der bestehenden Familie gate:kreatur-leben die Erbe-Probe am ECHTEN `_bestandTakt` (kein Zweit-Modell im Skript):
  (a) erbe#1 — Eltern-Kind-Regression ln M∞ über ≥ 10 Generationen an 30 Saaten, Mutante `kind → gruender`;
  (b) muster#1 — EINE Region mit Hirsch und Wolf, Zeitraffer 10³ Hirsch-Generationen (≈ 46 000 Takte, gerechnet ~12 s bei
  0,25 ms je Takt), Gegenlauf mit allen Wölfen per Akt `aus` entfernt; Selbsttest: Opferwahl auf `_bestandAeltester`
  zurückgesetzt → ROT am Namen `rissGewicht`. Die Modul-Karte als letzter Schritt neu.
- Bildpaar: die 5 Third-Bilder der R2-Ausnahme (≥ 5 Saaten, Morphometrie ±10 % gegen die Saat-Statistik), geschossen am Ort
  von F1: Mutter und Kind derselben Linie nebeneinander, dann das Kind erwachsen nach Welt-Uhr-Sprung.
- Sprossen: leben.evolution.erbe#1 · leben.evolution.muster#1 (die Akten unter vision/richter/leben.evolution.*).
- Stopp: im Commit drei Zahlen — Steigung (Band 0,2–0,8, erwartet 0,46), Steigung der Mutante (|·| < 0,05), Δ ln M̄ Hirsch
  (Wölfe an − aus) mit Vorzeichen in ≥ 90 % der 30 Saaten und Wanduhr je Lauf ≤ 60 s; `abdruck --a-gegen-a` an tier:* ohne
  netId-Täter; Gate-Teil ≤ 3 min CI (30 Saaten nur in der Akte). Fällt das Vorzeichen positiv aus, fällt muster#1 NICHT — das
  ist dann der Befund über die Kräfte, keine Stellschraube.

**Was der Spieler nach Welle 1 sieht:** Herden mit Kälbern, die bei ihren Müttern laufen und über Spielminuten wachsen; Erwachsene,
die sich ähneln statt zu würfeln; kein Riesenwolf, kein Zwerg-Hirsch ohne Mutter; ein Fuchs stirbt nach ~26, ein Bär nach ~49
Spielminuten; was der Spieler oder ein Rudel am Leib erlegt, verlässt den Bestand (`_bestandAus`, kreatur-leben.js:1012) und
fehlt der nächsten Generation — die Jagd des Spielers ist ab Welle 1 eine Kraft der Auslese.

## (5) WELLE 2 — die Gestalt des Individuums und die Flucht als Physik
- Leib-Raum der Tiere je Bauplan (das LEIB_RAUM-Muster des Menschen, koerper-core.js:1659, stoff-gang.js:608): eine Vorlage + Formziel-
  Tafel, Achsen auf der GPU — neue Erbachsen bein, hals, statur, hell, und die Jung-Allometrie (großer Kopf, lange Beine) stetig über
  das Alter, nie ein Guss je Stufe → lebenszyklus#2.
- Der Tier-Satz liest Individuen aus dem BESTAND (Kappe maxCreatures 20, dirigent-kern.js:280, fällt als Zahl).
- Der Riss wird Verfolgung: Fang aus Sprint-Verhältnis √(g·L) und Flucht-Vorsprung (der Sprint aus STEUER tetrapoda-core.js:1618, kein
  Zwilling); Erbachse `scheu` mit ihrem Leser kreatur-furcht.js:164–182 → zivilisation#1; muster#1 wird dann neu gemessen.
- Wurfgröße und Bilanz aus der Masse (r_max ∝ M^−0,25 Fenchel 1974, Dichte ∝ M^−0,75 Damuth 1981) statt herde.wurf und kopfJeHa.
- Inzucht-Term (1 − F̄) in der Segregation; die Region beginnt bei Welt-Uhr 0 statt aufholS vor dem Lesen (kreatur-leben.js:2289).

## (6) WELLE 3 — die Art aus dem Samen
- `artId(g, pfad)` bekommt den Pfad: Stammbaum des Samens (Aldous β = −1, Knoten-Alter aus Geburt–Tod), μ_Art wandert Brown/OU zum
  θ der Umwelt am Ort (planetOrt am Anker: g, T, NPP Miami; Wände M_max ∝ g^−3 und 2 g). GATTUNGEN (tetrapoda-core.js:62) und
  ART_GESTALT (:3973) werden die Wurzel-Stützstellen; die Verhaltens-Tafeln (:289, :1998, :2077, :2125) Funktionen von (M, Kost, Statur).
- Pflanzen lesen dasselbe Erbe: Díaz-Achsen in `artPhaenotyp` (phyto-core.js:2431); der IR-Wurf (:2481–2491), V = 2
  (studio-gestalt.js:935) und forestNicheWeights (:2823) fallen.
- Fremde Physik aus dem Samen: voxel-worker.js:1159 nimmt den Körper des Plans; g geht in deriveTierParams als Last M·g → fremde-physik#1.

## (7) WIDERLEGT
**genom**
- Der Riss nach `sprint(beinL, bs, g)` tötet stets das Langsamste = das Jüngste und Kleinste; zusammen mit dem Hunger drückt er die
  Größe NACH OBEN — muster#1 verlangt am eigenen Richter „Räuberdruck auf große Hirsche → Größe sinkt“: verfehlt durch Konstruktion.
- `sprint(...)` im Erbe-Kern ist ein Zwilling von STEUER.sprint (tetrapoda-core.js:1618–1623).
- zivilisation#1 beansprucht, doch kein Tod liest `scheu` (der Riss des Bestands kennt keine Flucht) — „Räuberdruck macht scheuer“
  fällt an seinem Richter nicht; sdP(scheu) 0,25 ohne Quelle.
- erbe#3 beansprucht, Umfang „der Spieler züchtet über 10 Generationen“ — es gibt keinen Weg, auf dem der Spieler züchtet; R = h²S des
  Risses ist nicht der Spieler. lebenszyklus#2 beansprucht, Tiefe „großer Kopf, lange Beine“ — das isometrische Kalb verfehlt sie.
- Blick-Kugel `exp(4·sdP)` verwechselt Masse und Länge (richtig: bs-Grenze e^(4·sdP/3)).
**physik**
- „Guss bei Erde/adult byte-gleich“ ist falsch: beinLast(g_E, size) = (size/2,4)^0,08 ≠ (size/2,4)^0,67 (tetrapoda-core.js:851) für
  Fuchs 1,5, Hirsch 2,8, Bär 3,2 (GATTUNGEN :62) — drei von vier Güssen ändern sich, der Bär wird dünnbeinig (eigene F3c), die Platte
  kalt → Ankunft (Pflicht B) zahlt.
- Welle 1 ohne Auslese (der Riss nimmt weiter das Älteste): erbe#3 und muster#1 unerreichbar, nur erbe#1 bleibt.
- fremde-physik#1 nur über das DSL-Wort `gravity`: der Spielpfad nimmt für jeden Samen PLANET_ERDE (voxel-worker.js:1159) — eine
  Laborfrage, nicht die Welt aus dem Samen; die 50 Saaten je g gibt es im Spiel nicht.
- Die Jung-Guss-Stufe: +2 Vorlagen je Art (~0,9 s Faden, ~4,8 MB je Vorlage), ein eigener Satz je Stufe, ein Sprung bei reife 0,6 —
  Speicher und Befehle wachsen, das Bild springt.
- Das Erbe im Tier-Buch tetrapoda-core macht die Pflanze (Welle 2/3) zum Fremd-Leser.
**baum**
- Die Arten der Welle 1 teilen höchstens G = 4 Güsse je Region und unterscheiden sich nur in Skala (eigener §4) — F2 „anderer Hals,
  anderes Bein“ ist so nicht zu sehen; die Art ist ein Etikett ohne sichtbare Folge (Existenz statt Konsum).
- Guss-Dials aus `artMerkmale(gussKnoten)` ≠ GATTUNGEN-Zeile → `istDefault` falsch für jeden Guss (koerper-leib.js:1030): die Platte
  wird nie gelesen, jede Ankunft gießt kalt (Pflicht B), und jede neue Region kann neue Guss-Knoten bestellen.
- Verhaltens-Tafeln über „die nächste Stützstelle“ (Flucht, Wurf, Ethogramm, Lebensraum) = die 4-Zeilen-Tafel als verborgener
  Schalter neben der Art-ID: ein Zwilling.
- „N ≈ 3·10⁴ folgt, kein Stellwert“ ist zirkulär: rJeMa 0,023 ist so gewählt, dass N die Erde trifft; wurzelMa 350 und sOrt 60 sind
  Erd-Anker.
- Das Individuum bleibt an `R.seq` — schwächer als genom und physik, die es zur Funktion machen.

## (8) OFFEN — ehrlich
- Die ARTEN bleiben in Welle 1 die vier Wurzeln (μ_Art = Masse des Gusses); Arten als sichtbare Folge eines Gesetzes erst mit Welle 2
  (Leib-Raum) und Welle 3 (Stammbaum). Vom Ziel „Millionen Arten“ trägt Welle 1 das Erbe und die Adresse, nicht die Vielfalt.
- Das Kalb ist isometrisch (bs 0,39 bei der Geburt): lebenszyklus#2 fällt in Welle 1 nicht.
- Das Vorzeichen von muster#1 ist Ergebnis: mit dem Ertrags-Gewicht ∝ M erwartet negativ; reale Wölfe nehmen bevorzugt Kälber
  (Verfolgungskosten) — tritt die Verfolgung in Welle 2 ein, kann es kippen; dann wird neu gemessen, nicht gedreht.
- Unsichere Konstanten: sdP 0,20, vmJeVE 1e−3, q 0,06 (für Wolf und Bär als Nesthocker ~10× zu groß), reifeAnteil 0,20, die Raffung
  refS 2100 s am Wolf.
- Ohne Geschlecht; Vater = das nächste reife Tier; Kopfzahl der Geburt weiter aus herde.wurf (Tafel); kein Inzucht-Term bei Regionen
  von 10–30 Tieren — V_A bleibt künstlich konstant.
- Das Individuum ist Funktion von (Same, Region, Welt-Takt) erst ab dem ersten Lesen der Region (aufholS 3600 s vor dem Lesen,
  kreatur-leben.js:2289).
- Zeitraffer 10³ Generationen: ~12 s gerechnet, nicht gemessen; ob die Herde im Spiel 10³ Generationen ≤ 60 s zeigt (Welt-Uhr-Sprung
  mit Aufholen 20 Takte je Spieltakt), ist ungemessen.
- erbe#3 (der Spieler züchtet) und zivilisation#1 (Scheu erblich) fallen nicht in Welle 1.
- Der alte Stand wird gewandelt (Tier ohne `a` = Gründer seiner id) — die Wandlung bleibt als benannte Zeile im Leser.
