# SPIKE stammbaum — Arten ohne Speicher (main 18058dba, nur gelesen)

Skript: `spike/stammbaum.cjs` (node, liest `planet-core.js` planetHash/planetZufall/planetPlan/PLANET_ERDE und `tetrapoda-core.js`
GATTUNGEN/KAMPF.refKg per require). Referenz-Ausgabe: `spike/stammbaum-lauf.txt` (32,3 s ruhig; unter fremder Last 50–92 s, CPU 93 %
durch andere Sitzungen). Zwei Läufe: alle Zahlen ohne Zeiten byte-gleich, Lauf-Prüfsumme `3e3ea153` beide Male.
Zeiten schwanken mit der Last um ×2–3; stabil sind die KNOTEN-Zahlen. Ruhig gemessen: 340–470 ns je Knoten.

## BEFUND (Zahlen aus dem Lauf)

1. **ADRESSE trägt.** N = 10⁶: Blatt-Nachschlag Topologie+Alter 12–33 µs, +5 Merkmale 32–79 µs, +Areal 54–118 µs (Lastspanne).
   Mittlere Tiefe 78 (p99 130, max 166; die Formel ln²N/(2ζ(2)) sagt 58). Heap-Δ nach 2·10⁴ Nachschlägen −1,5 … +1,1 MB = GC-Rauschen,
   nichts gehalten. Determinismus: zwei Fabriken, 3 000 Blätter, Merkmale+Areal auf 12 Stellen gleich. Baum-Distanz zweier Blätter
   (MRCA, gemeinsamer Abstieg) 4,6–11 µs, ohne Aufzählen.
2. **BAUMGESTALT im Band.** n = 100, 100 Saaten: Colless normiert 0,132 ± 0,033 zwischen Yule 0,072 und PDA 0,266; Sackin/n 10,8 (Yule
   8,4 · PDA 16,8). ML-β̂ aus 9 900 Spaltungen −1,00, je Saat p10 −1,20 · p50 −0,95 · p90 −0,70. Band: reale Bäume liegen zwischen Yule und
   PDA, β̂-Modus ≈ −1 (Blum & François 2006, Syst. Biol. 55:685; Streuung je realem Baum aus dem Gedächtnis, **unsicher**).
   Vier Planeten-Saaten: Colless 0,119 · 0,140 · 0,128 · 0,133 — alle im Band.
3. **MERKMAL ↔ BAUM verfehlt r ≥ 0,5 bei 5 Achsen.** Mantel (Pearson, euklidisch auf standardisierten Achsen ↔ patristisch):
   N = 10⁴ alle Blätter r(1/2/5/10/20 Achsen) = 0,18 / 0,22 / 0,21 / 0,35 / 0,55; N = 10⁶ (10⁴ Stichprobe) 0,06 / 0,20 / 0,33 / 0,42 / 0,58;
   EINE Klade mit 17 980 Arten: r(20) = 0,28. Mutante „Erbe aus“ r = −0,004 (Richter scharf). Grund gemessen: die patristische Distanz
   zufälliger Paare streut nur mit CV 0,19–0,21 (Mittel 432 Ma von 700), die Brown-Streuung je Paar ist größer. Vier Planeten r(20):
   0,55 · 0,57 · 0,53 · 0,42.
4. **GRÖSSE log-schief nur mit Größe-steuert-Seite.** Mit q = 0,65 (größere Klade trägt den kleineren ln-M-Zuwachs) und σ² = 0,05/Ma:
   log10 M[g] Median 1,43 (27 g), p95 3,45, max 6,27 (1,9 t); Schiefe global 0,94, je Klade (30 Kladen 531–4 960 Arten) Mittel 0,57,
   93 % > 0. Gegenprobe q = 0,5: Schiefe 0,29, Median 2,80. Mit dem Entwurfswert σ² = 0,018 gab es keine Einstellung, die Schiefe > 0
   je Klade UND Tiere über 10 kg trägt (Probe: q 0,65 → max 12 kg; q 0,55 → Schiefe je Klade −0,06).
   Je Dekade (10⁴ Blätter): 31 % · 39 % · 20 % · 7,3 % · 1,7 % · 0,23 % · 0,01 % (10⁰ … 10⁶ g) — zu wenig Große gegen Säuger-Korpora
   (Vergleich ≤ Faktor 2 nicht gelaufen, kein Korpus im Repo).
5. **ORT → ARTEN ohne Aufzählen: Median knapp, p95 verfehlt.** Region 200 m (BESTAND_REGION, kreatur-leben.js:3731), 1 000 Orte, frischer
   Heap: Knoten p50 2 019 · p95 4 412; Zeit ruhig p50 0,69–0,94 ms, p95 1,5–2,1 ms (53–74 % der Regionen < 1 ms); unter Last p50 bis 2,2 ms.
   Arten je Region p50 48–52 (p5 0 · p95 171). Mit Merkmalen ×1,9. Kosten = Arten × Tiefe: jedes gefundene Blatt zieht ~40 Ahnen.
6. **Arten-Areal:** S(0,04 km²) 81 → S(10⁴) 182 → S(10⁶) 3 645 → S(10⁷) 27 316. z: 0,04–10² km² 0,002–0,018 · 10²–10⁴ **0,157** (im Band) ·
   10⁴–10⁶ 0,651 · 10⁶–10⁷ 0,875 (Band 0,15–0,35; Festland 0,12–0,17, Inseln ~0,25, Rosenzweig 1995). Areal je Art p10 1 257 · p50 9 268 ·
   p90 74 556 km². **Zielkonflikt gemessen:** sOrt 600 → z(10⁴–10⁵) 0,234, aber Region 5,8 ms / 9 152 Knoten; sOrt 2 000 → z(10⁵–10⁶) 0,353,
   13,3 ms / 23 159 Knoten. Mittleres Areal = sOrt·A_Planet/N: das Band bei großen Flächen kostet linear Arten je Ort.
7. **Nachbarschaft trägt.** Regionen je 10⁴ km²: Jaccard bei 100 km 0,47 · 300 km 0,09 · 1 000 km 0,002; Distanz zum nächsten
   Verwandten in der Nachbar-Region 100 km 100 Ma · 300 km 110 · 1 000 km 229 · 3 000 km 352 · 10 000 km 444; Zufallsblätter global 352 Ma.
8. **ZEIT: dieselbe Funktion, billiger in der Tiefe.** Region 200 m: t = 0 Ma 1 979 Knoten · 66 Ma 1 478 · 150 Ma 340 · 300 Ma 6; Zeit
   ruhig 0,9–1,8 ms (≤ 66 Ma), 0,16 ms (150 Ma). Linien je Ort bei 66 Ma 52 = heute: der rekonstruierte Baum kennt keine toten Seitenäste
   (pull of the present). Je gelebt (Aufzählung 2·10⁶ Kanten, Σ 14,9·10⁶ Linien-Ma, 349 ms, nur Statistik): Chronospezies 1 Ma →
   3,0·10⁷ (96,6 % ausgestorben), 0,1 Ma → 3,0·10⁸ (99,66 %). stammbaum#6 (10⁹, > 99 %) bei N = 10⁶ lebend nicht erreicht.
9. **FREMDER PLANET:** planetPlan(fremd-1/2/3) g 17,4 / 9,3 / 17,0, R 11 173 / 5 722 / 11 886 km (planetPlan 44–108 ms). Jede Saat ein
   anderer Baum (Wurzel-Spaltung k 76 · 999 973 · 9 726 · 999 993), jeder einzeln im Colless-Band. M_max ∝ g^−3 greift: bei g 17 erreicht
   das größte Blatt 10^7,24 g an der Wand 10^7,28. Im Spiel liest der Faden für JEDE Saat PLANET_ERDE (voxel-worker.js:1159) — fremde g
   ist hier Labor, nicht Spielpfad.
10. **Widerlegt am Entwurf baum:** (a) `k = ceil((n−1)^u₁)` gibt k = 1 die Masse 0 (nur u = 0) — β = −1 braucht dort das größte Gewicht;
    exakt: Seite ziehen, dann kleinstes K mit H_K ≥ u·H_{n−1} (O(1) über die Harmonik-Näherung). (b) „artenAm ≈ 3 000 FNV ≈ 0,3 ms“: gemessen
    2 019 Knoten à 340–960 ns = 0,7–1,9 ms. (c) Eine Kind-Areal-Klemme a ≤ a_Elter ohne Teilung verlor die Masse (erster Lauf: Arten je Ort
    p50 0); erst die TEILUNG (f, 1 − f) hält Σ Blatt-Areal = Wurzel-Areal.

## DIE ENTSCHEIDUNG

Der Ort ist Teil des Pfads: **jede Spaltung teilt das Areal des Elters** (Kugel-Kappe, Anteile f und 1 − f, Geschwister rücken
gegenläufig auseinander = Vikarianz, jedes Kind bleibt IN der Kappe des Elters). Damit ist ORT → ARTEN ein Abstieg nur durch Kappen über
dem Ort, ZEIT dieselbe Abfrage mit Abbruch an der Epoche, und die Größe steuert, welche Seite die größere Klade wird. Nichts wird
gespeichert außer der Arten-Liste einer betretenen Region (≈ 50 Zahlen), die heute schon als Bestand-Region lebt.

## DAS GESETZ — Signaturen in `leben-core.js` (§6 des Entscheids; kein zweiter Kern, kein Zwilling zu §1)

```
LEBEN_GESETZ.stamm = Object.freeze({        // neben achsen/vmJeVE/… aus §1.1; Reihenfolge = Byte-Vertrag
  epsilon: 0.9, wurzelMa: 350, alterStreu: 0.15,       // Umsatz, Krone (Erd-Anker), ln-Streuung Knoten-Alter — unsicher
  sigma2LnM: 0.05, copeJeSpaltung: 0.04,               // Brown ln M [1/Ma] (Spike: 0,018 trägt die Schiefe nicht), Cope — unsicher
  wurzelKg: 0.04, wandKg: 0.002, maxKgErde: 1e5,       // Ahnin 40 g, Wand 2 g (Clauset & Erwin 2008), M_max·(9,81/g)³ — unsicher
  sigma2Logit: 0.004, sOrt: 60, arealStreu: 0.7,       // Form-Achsen, Arten je Ort, Logit-Streuung der Areal-Teilung — unsicher
  groesseSteuert: 0.65 })                              // P(größere Klade bekommt den kleineren ln-M-Zuwachs) — unsicher
zufall(k, a, b, c)                 → [0,1)   der Zähler-Zufall (heute planet-core.js:145–160), EINE Quelle, s. Bahn S1
stammN(planet)                     → N       Welle 3: aus dem Planeten; bis dahin Eingabe (Erd-Anker)
stammRaten(N)                      → {r, λ}  r = ln(1 + (N−1)(1−ε)) / wurzelMa, λ = r/(1−ε)
stammSpalt(same, lo, n)            → k       β = −1 exakt: Seite u₁, kleinstes K mit H_K ≥ u₂·H_{n−1}
stammAlterMa(same, lo, n, elterMa) → Ma      ln(1+(n−1)r/λ)/r · e^{0,15 z}, ≤ 0,98·elterMa; Blatt 0, Wurzel wurzelMa
stammKinder(same, lo, n, elter)    → [L, R]  je Kind {lo, n, alterMa, areal {c[3], a sr}, x Float64Array}  — der EINE Schritt
artId(wurzel, pfad)                → wurzel + "/" + pfad,  pfad = "b"+i (Blatt i) · "k"+lo+"."+n (Ahn, ausgestorben) · …"@"+Segment
artMerkmale(same, adr, achsen)     → Float64Array [lnM, Form-Achsen…]  O(Tiefe), 0 Byte
artAreal(same, adr)                → {c, a}                             O(Tiefe), 0 Byte
mrca(same, i, j)                   → {lo, n, alterMa}                   gemeinsamer Abstieg
artenAm(same, punkt, rhoRad, zeitMa, aus, budget) → {gefunden, besucht, weiter}
                                   // Abstieg durch Kappen ⊕ rho; t > 0 gibt die Linie aus, die zu t lebt; `budget` Knoten je Aufruf,
                                   // `weiter` setzt den Stapel fort (Scheibe über Frames statt Spitze) — dieselbe Funktion, kein Zwilling
selbsttestStamm()                  → {colless, betaDach, mantel20, determinismus, knotenP95}
```
Die Merkmals-Achsen sind die Erbachsen `achsen` aus §1.1 (lnM zuerst); eine Form-Achse tritt nur mit Leser ein (Leib-Raum, Welle 2).
μ_Art von §6 = `artMerkmale(...)[0]`; `masseAdult(Mbar, a, e)` aus §1.2 liest `Mbar = e^{μ_Art}` — Art und Individuum bleiben EIN Gesetz.

## DREI FÄLLE (gerechnet) und die FALSIFIKATION

**F1 Adresse und Gestalt (gelaufen):** 10⁶ Arten, 0 Byte, 12–33 µs je Blatt, Colless im Band an 100 + 4×30 Saaten, β̂ −1,00. Hält.
**F2 Nachbar-Regionen (gelaufen):** 100 km auseinander teilen 47 % der Arten, die fehlenden haben ihren nächsten Verwandten 100 Ma nah;
10 000 km: 0 % geteilt, 444 Ma. Hält — benachbarte Regionen tragen verwandte Faunen, ohne dass eine Tafel es sagt.
**F3 Epoche (gelaufen):** dieselbe Abfrage bei 66 Ma kostet 1 478 statt 1 979 Knoten. Hält in den Kosten; im Inhalt fehlen die toten Äste.

**Falsifikation (Auftrag) und Ausgang:**
- „ORT → ARTEN nicht unter ~1 ms je Region ohne Speicher“ — **GETROFFEN am p95**: Median 0,69–0,94 ms ruhig, p95 1,5–2,1 ms, unter Last
  ×2; Knoten p95 4 412. Nicht getroffen im Median.
- „Colless außerhalb des Bands“ — **NICHT getroffen**: 0,132 in (0,072; 0,266), β̂ −1,00.
- „r < 0,5“ — **GETROFFEN bei 5 Achsen** (0,21 / 0,33), bei 20 Achsen 0,55 / 0,58 und an 3 von 4 Planeten ≥ 0,5; eine Einzelklade 0,28.
Urteil: der Gedanke trägt Adresse, Gestalt, Nachbarschaft und Zeit; er trägt NICHT, wie gefordert, Mantel ≥ 0,5 mit den heutigen fünf
Achsen und nicht die 1-ms-Region am p95. Beides ist eine Zahl mit Hebel, kein Bruch des Gedankens: Mantel braucht ≥ 20 sichtbare
Erbachsen (Welle 2 Leib-Raum), die Region braucht die Scheibe (`budget`) oder ~2,5× weniger ns je Knoten.

## PREIS

- Die 10⁶. Art: 0 Byte; 12–33 µs beim Nachschlag; 1 Region-Abfrage ≈ 2 000 Knoten (p95 4 400) ≈ 0,7–2 ms einmal je betretener Region;
  die Liste (~50 Zahlen) lebt in der Bestand-Region, die ohnehin entsteht (kreatur-leben.js:2224 `_bestandKey`). Kein Takt-Preis: der
  Bestand-Takt liest die gemerkte Liste.
- Karte/Baum-Blick über 10⁶ km²: 11 195 Knoten, 5–6 ms; 10⁷ km²: 61 237 Knoten, 22–24 ms — nur als Scheibe tragbar.
- Mehr Arten je Ort (das z-Band bei großen Flächen) kostet linear: sOrt 600 → 9 152 Knoten (5,8 ms), 2 000 → 23 159 (13,3 ms).
- Nicht im Preis: ein Guss je neuer Gestalt — ohne Leib-Raum (Welle 2) bleibt jedes Blatt unsichtbar oder kostet einen Guss (Richter §7).

## BAHNEN (Bau-Welle 3; Abgabe je Bahn `node scripts/werkbank.cjs abdruck --gegen <Basis>`)

Reihenfolge: **S1 jetzt** (reiner Kern, unabhängig von Welle 2) → **S2** (Richter) parallel zu S1 gegen eingefrorene Signaturen →
**S3** erst nach Welle 2 Leib-Raum in main (ohne ihn ist eine Art ein Etikett ohne sichtbare Folge — Richter §7 baum).

**S1 stamm-kern** — Dateien: `leben-core.js` (allein), `planet-core.js` (nur `planetZufall` → liest `__lebenCore.zufall`), `voxel-worker.js`
(eine importScripts-Zeile vor planet-core). Schnitt: Signaturen oben + `selbsttestStamm`; der Zähler-Zufall wandert nach leben-core
(EINE Quelle für Haupt-Faden und Planet-Faden). Byte-Beweis: planetPlan an 12 Saaten byte-gleich (Plan-Hash vorher ↔ nachher).
Stopp: im Commit Colless 0,13 ± 0,04 in (Yule; PDA) an 100 Saaten, β̂ ∈ [−1,2; −0,8], Determinismus-Prüfsumme, artenAm Knoten p95 ≤ 5 000
bei N = 10⁶, Mantel r(20) ≥ 0,5 an N = 10⁴; Boot-Δ des Kerns gemessen.

**S2 stamm-richter** — Datei: `scripts/diag-kreatur-leben.cjs` (allein; Familie gate:kreatur-leben). Schnitt: stammbaum#2 als Zahl am
ECHTEN Kern (kein Zweit-Modell im Skript), Selbsttest: `stammSpalt` auf Yule (β = 0) gesetzt → ROT am Namen `stammSpalt`; Mantel-Akte mit
Mutante `artMerkmale` → je Knoten unabhängig → r ≈ 0 ROT am Namen. ≤ 3 min CI (100 Saaten n = 100: ~1 s).

**S3 stamm-bestand** (nach Welle 2) — Dateien: `stamm/kreatur-leben.js` (allein). Schnitt: die Region ruft beim Entstehen `artenAm`
(Scheibe mit `budget` 1 000 Knoten je Takt), merkt die Liste in R; Geburt wählt die Art aus R.arten statt `L.gattung`; `Mbar` aus
`artMerkmale`. Bildpaar main ↔ Kopf: Spawn-Wiese und eine Region 300 km entfernt (Werkbank am Messort, Third 20 m seitlich, Mittag,
gleiche Saat, 20 min nach Ankunft). main: an beiden Orten dieselben vier Gattungen. Kopf: an jedem Ort eigene Arten, 300 km weiter
Jaccard ~0,09, die Gestalten verwandt (nächster Verwandter ~110 Ma). Zahl aus dem Bild: Gestalten-Paare mit gleicher Silhouette über
die zwei Orte main 4/4 → Kopf ≤ 1/4. Stopp: Bestand-Takt p95 nicht schlechter als main (gate:kreatur-takt, heute 7,36 ms); Region-
Entstehen ohne Frame über 33 ms (Profi-Band E) an der Radeon.

Sprossen: leben.evolution.stammbaum#2 (S1+S2; der Preis „Baum-Blick ≤ 1 s“ bleibt offen), leben.tiere.arten#5 nur die Tiefe
„log-schief je Klade“ (Richter-Hälfte Chao1/Korpus fehlt), stammbaum#4 erst mit ≥ 20 sichtbaren Achsen (Welle 2), stammbaum#6 nicht.

## OFFEN

- Mantel r ≥ 0,5 verlangt ≥ 20 erbliche, im BILD sichtbare Achsen; mit den heutigen fünf 0,21–0,33; eine Einzelklade 0,28 auch bei 20.
- Region p95 1,5–2,1 ms ruhig: die Scheibe (`budget`) ist entworfen, nicht gemessen; ns je Knoten (340–960) nicht optimiert.
- 5 % der Orte tragen 0 Arten (p5 0, p95 171): die geschachtelte Zufalls-Lage klumpt; nicht mit Klima/Nische verbunden.
- θ(Ort): die Merkmale wandern Brown, nicht OU zum Klima — planetKlima kostet 0,37 ms je Ruf und lebt im Faden; nicht gelaufen.
- Tote Seitenäste (Nee et al. 1994) nicht gebaut: Linien je Ort bei 66 Ma = heute; 10⁹ je gelebt nicht erreicht (3·10⁸ bei 0,1 Ma).
- Konstanten unsicher und gewählt: σ² 0,05 (statt Smith 0,018), q 0,65, Wurzel 40 g, sOrt 60, arealStreu 0,7, wurzelMa 350 (Erd-Anker).
- Massen-Dekaden gegen einen realen Korpus (tiere.arten#5 „≤ Faktor 2“): nicht gelaufen; der Lauf zeigt zu wenig Tiere > 10 kg (1,9 %).
- Blatt → Körper (Guss je Art) nicht Teil des Spikes; ohne Welle 2 bleibt jede Art ein Etikett.
- Fremde g ist Labor: voxel-worker.js:1159 gibt jeder Saat PLANET_ERDE.
- Der Zähler-Zufall im Haupt-Faden: Umzug nach leben-core mit Byte-Beweis an planet-core ist entschieden, nicht gebaut.
