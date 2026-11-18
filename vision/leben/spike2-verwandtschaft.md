# SPIKE 2 „Sichtbare Verwandtschaft“ (main 18058dba, nur gelesen)

Skript: `spike2/verwandtschaft.cjs`, Ausgabe in `spike2/lauf.txt`. Das volle Wort-Raster mit 16 Zeilen läuft mit `VOLL=1`, sein
Ausdruck liegt in `spike2/lauf1.txt` (aus Version `verwandtschaft-v1.cjs`, für gleiche Einstellungen byte-gleich).
Laufzeit: Lauf 1 brauchte ruhig 41 s. Der jetzige Lauf brauchte 74 s, weil die CPU durch fremde Sitzungen zu 100 % belegt war; ruhig
nicht nachgemessen.

Der Baum ist DASSELBE Gesetz wie in der ersten Runde:
- Das Skript liest den Text von `spike/stammbaum.cjs` (welt, GESETZ). Daran ist eine einzige benannte Ersetzung gemacht, **E0**:
  welt gibt zusätzlich hk/u/nz/spaltH/alterH zurück.
- Prüfung: 200/200 Blätter haben gleiche Merkmale.
- Die Kandidaten-Gesetze sind Funktionen derselben Adresse: Knoten-Hash und Zweck-Nummern ≥ 200, die das Gesetz bisher nicht benutzt.
- Gelesen: spike/stammbaum.cjs, spike/richter/rf.cjs · rf-sprung.cjs · rf-ziel.cjs (ganz), spike-stammbaum.md, entscheid.md,
  welle-2-3.md, Karte 2 wörtlich (`git show origin/koordination:vision/meisterkarte-2.json`, leben.evolution.stammbaum),
  tetrapoda-core.js :62, :487–:800, :3965–:4190, :4415, :5035–:5046.

## BEFUND

1. **Anker hält.** Die Richter-Probe rf.cjs ist wörtlich nachgefahren: 5 / 8 / 12 Achsen ergeben RF p50 0,71 / 0,57 / 0,43
   (≤ 0,3: 6 / 16 / 33 %). Das ist byte-gleich zur Tafel in welle-2-3 §1.
2. **Erste Ursache: die Stichprobe.** rf.cjs zog 10 Blätter gleichmäßig aus Kladen von 10 bis 60 Arten. Dieser induzierte Baum hat
   kurze Innen-Äste: innen/Blatt p50 0,616. Die Sprosse sagt aber „10 Arten mit gemeinsamem Ahn“, also eine Kronen-Klade von genau
   10 Arten (innen/Blatt 0,920).
   - Dort erreicht schon Brown mit 12 sichtbaren Achsen (ln M + 11) 46–51 % der Kladen mit RF ≤ 0,3. Das gilt in 4 Stichproben-Sätzen
     zu je 300; p50 liegt bei 0,29–0,43, also genau an der Schwelle.
   - RF ist bei 10 Arten in Schritten von 1/7 gequantelt. RF ≤ 0,3 heißt höchstens 2 von 7 Kladen falsch. „p50 ≤ 0,3“ heißt deshalb:
     der Anteil der Kladen mit RF ≤ 0,3 ist ≥ 50 %. Der Anteil ist die tragende Zahl.
3. **Zweite Ursache: der Baum, nicht das Merkmal.** Zehn Arten aus Kladen von 10³ bzw. 10⁶ bilden fast einen Stern: innen/Blatt
   0,108 bzw. 0,128, der kürzeste Innen-Ast ist 2,2–2,4 % eines Blatt-Asts.
   - Dort scheitert JEDES Merkmals-Gesetz: Brown 20 RF 0,86; Brown 39 + 6 Wörter 0,86 bzw. 0,71.
   - Am besten schneiden Wörter mit unendlich vielen Zuständen bei 10⁶ ab: 0,43, aber nur 43 % ≤ 0,3.
   - Keine Uhr der Merkmale holt zurück, was der Baum nicht trägt: Innen-Äste von 2 % ihrer Blatt-Äste lösen auch reale Kladen nicht
     auf (harte Polytomie).
4. **Das Alters-Gesetz kostet etwa 10 Punkte, ist aber nicht die Ursache.** Vergleich mit einem Geburt-Tod-Bezugsbaum (Coalescent-
   Point-Process mit gleichem λ 0,329, μ 0,296 und gleichem Kronen-Alter, also derselben Funktion, aus der welt N und alter() ableitet):
   - Brown 12 Achsen: 61 % statt 50 %; Brown 8: 51 % statt 32 %; innen/Blatt 0,984 statt 0,920.
   - DAS-Gesetz (unten): 59 % statt 56 %.
5. **Kandidat (c), Raten-Heterogenität:**
   - Je Achse und ohne Grenze ändert sie nichts, byte-gleich 50 % → 50 %. Brown wird je Achse standardisiert, damit kürzt sich die
     Rate heraus. Das ist gemessen.
   - Je Klade erblich: 45 %.
   - Mit Grenze (OU, Halbwertszeit 1–1000 Ma) schadet sie: 14 %, Mantel 0,18. Die schnellen Achsen sättigen und werden zu Rauschen.
   - Folge für den Bau: sichtbare Achsen dürfen im Bereich der Stammbaum-Streuung NICHT sättigen.
6. **Kandidat (b), Punktualismus und früher Ausbruch:**
   - Schritt je Artbildung: 28 %, also schlechter als Brown. Grund: bei ε = 0,9 fallen auf einen rekonstruierten Ast versteckte
     Artbildungen mit der Rate λ·p0(τ), geschlossen integriert Λ = μΔτ + ln((λ−μe^{−rτ1})/(λ−μe^{−rτ2})), μ = 0,296/Ma. Damit ist
     Punktualismus eine Uhr plus Poisson-Rauschen.
   - Nur an den beobachteten Knoten (κ = 0): 6 %. Diese Variante widerspricht außerdem ε = 0,9.
   - Früher Ausbruch (Halbwertszeit 50 Ma): 53 % bei Klade 10 (Rauschen), 6 % bei 10⁶.
7. **Kandidat (a), diskrete Synapomorphien:**
   - Wörter mit 3 Zuständen allein: ≤ 17 %, weil Homoplasie die Information verwischt. Uhr je Spaltung K = 3: 1–15 %.
   - Wörter mit unendlich vielen Zuständen, μ = 0,1/Ma: 55 %.
   - Als Zusatz zu Brown 11 tragen sie: das vor dem Lauf benannte **DAS** (Brown 11 + 6 Wörter, K = 3, Zeit-Uhr, μ je Wort log-gleich
     von 1/350 bis 0,1/Ma) erreicht 56 % und in drei frischen Sätzen 55 / 57 / 59 %, p50 0,29 in 4 von 4 Sätzen. Brown 11 allein im
     selben Satz: 49 / 46 / 51 %.
   - Mit NJ statt UPGMA: 51 %.
   - Gegenproben: Merkmale gemischt → RF p50 1,00 (0 %); reines Rauschen → 1,00 (0 %).
   - Bei rf.cjs-Stichprobe: DAS 31 %, Brown 30 %.
8. **Kandidat (d), viele billige Achsen, ist der stärkste Hebel, liegt aber über dem Budget:**
   - Brown 39 + 6 Wörter: 93 %. Brown 11 + 24 Wörter: 75 %.
   - Innerhalb des Budgets: 7 Achsen (= Welle 2) + 6 Wörter: 38 %.
9. **Mantel (stammbaum#4) fällt NICHT:**
   - Saat erde: DAS 0,489, Brown 11 + ln M 0,496, nur langsame Wörter (μ 0,003) 0,524, nur schnelle 0,474.
   - Drei weitere Saaten: DAS 0,424 / 0,445 / 0,329, Brown 0,429 / 0,450 / 0,336.
   - Gemischt: −0,004. Wörter allein: 0,078.
   - Die erste Runde brauchte 20 Achsen für 0,55.
10. **Baumgestalt und Größe bleiben unberührt.** Die Kandidaten lesen nur, sie schreiben keine Spaltung und kein ln M:
    - Colless n = 100 an 30 Saaten 0,135 (Band 0,072–0,266), log10-M-Schiefe 0,88 an einer Stichprobe von 4 000, Median 1,43 g-Dekaden.
    - Das Gesetz selbst ist byte-gleich (200/200).

## Die Merkmale des Tier-Kerns heute (tetrapoda-core.js, gelesen)
- **Wörter, die gelesen werden:**
  - `bein.pfote` zehe/sohle/huf (:3979, :4011, :4026; Leser :4415).
  - `kopf.ohrForm` spitz/rund/blatt (:3981, :4013, :4028; Leser :5035, :5046).
  - Beide sind Bauplan-Wörter und stehen in der Vorlage (welle-2-3: 3 Vorlagen). Als Art-Wort taugen sie nicht, solange sie die
    Vorlage wechseln.
- **Hörner und Kamm** gibt es nur in `buildSkeleton` (:782 `g.horns`, :799 `g.crest`, Rufer kreatur-leben.js:615, der DSL-Pfad). Im
  Tier-Ofen (ART_GESTALT-Pfad) fehlen sie.
- **Zeichnung als Regionen:**
  - `ART_GESTALT.*.muster` (:3987) trägt 8 RGB-Regionen: basis, ruecken, bauch, beine, maske, spitze, ohr, spiegel.
  - `fellFarbe` (:4135–:4190) malt sie schon heute nach Lage am Leib.
  - Damit sind 6 Zeichnungs-Wörter ohne neue Geometrie lesbar: Sattel = ruecken, Strümpfe = beine, Rutenspitze = spitze, Maske,
    Spiegel, Ohr-Rücken = ohr. Jedes hat 3 Zustände: wie Grund / dunkel / hell.
  - Heute ist das eine absolute Farbe je Gattung, gemischt über die Gauß-Gewichte `artGewichte` (:4062); Wörter nimmt „die stärkste
    Art“ (:4095).
- **Stetige Zahlen, die einen Leser haben:**
  - GATTUNGEN size/neck/leg/diet/build (:62).
  - kopf.gross, ohrH, schnauzeL/B/H, schaedelB/H, schwanz.segL/hang/fell, fell.lang, bein.dicke/distal (:3975–:4031).
  - Grundton = muster.basis (3 Kanäle).
  - Freie Achsen sind sie nicht: sie hängen an 4 Presets.
- **Es fehlen:**
  - ein Muster-TYP (Streifen, Flecken; in tetrapoda-core.js keine Fundstelle außer dem Keulen-Fleck `spiegel`);
  - Hörner und Geweih im Tier-Ofen;
  - eine Regionsfarbe als Funktion von Grundton + Wort;
  - die Art als Punkt statt als Preset-Mischung (T5).
  - Für DAS-Gesetz ist keine dieser Lücken ein Hindernis außer der letzten.

## DAS GESETZ — Signaturen in leben-core.js (EINE Quelle; die Gattungs-Kerne lesen nur)
```
LEBEN_GESETZ.sicht = Object.freeze({        // tritt in S1 (Welle 3) zu LEBEN_GESETZ.stamm; Reihenfolge = Byte-Vertrag
  achsen: ["lnM","hals","bein","statur","tonH","tonS","tonV","ohrH","schnauzeL","rute","fellLang","kopfGross"], // 12 sichtbar
  sigma2: 0.004,               // eine Brown-Rate für alle Form-Achsen (= stamm.sigma2Logit; unsicher). Je-Achse-Raten fallen:
                               // gemessen wirkungslos (Standardisierung) — kein Stellwert ohne Wirkung
  woerter: ["sattel","struempfe","rutenspitze","maske","spiegel","ohrRuecken"], K: 3,  // 0 wie Grund · 1 dunkel · 2 hell
  wortRate: [1/350, 0.1] })    // μ_w log-gleich je Wort zwischen 1/wurzelMa und 0,1/Ma (gewählt ≈ λ/3): EIN Wort je Zeitskala
artMerkmale(same, adr, achsen) → Float64Array(12)   // schon in S1 geplant; Brown auf dem Stamm-Pfad, ln M nach stamm (Cope, Wände)
artWoerter(same, adr)          → Uint8Array(6)       // O(Tiefe), 0 Byte: je Ast Poisson(μ_w·Δt) Wechsel aus dem Knoten-Hash,
                                                     // jeder Wechsel zu einem der K−1 anderen Zustände; die Klade erbt
```
- Die Zweck-Nummern beider Funktionen sind neu. Spaltung, Alter, ln M und Areal bleiben byte-gleich: Colless und β̂ unverändert.
- **Leser:**
  - tetrapoda-core.js `artGestalt(P)` liest in T5 den Art-Punkt statt der Gauß-Mischung :4062. Daraus wird
    `muster.region = ton(basis, wort)`: Grund → basis; dunkel → basis·0,45; hell → Mischung zu Creme 0,75 (gewählt).
  - `fellFarbe` :4135 bleibt Leser ohne Änderung der Regionen.
  - Die 11 stetigen Achsen gehen auf die ART_GESTALT-Zahlen der Wurzel-Stützstelle (Logit-Abstand).
- **Nebenbedingung:** keine sichtbare Achse darf im Bereich der Stammbaum-Streuung sättigen. Bei Logit-Achsen gilt √(σ²·350) = 1,18.
  Gemessen wurde: Sättigung (OU) kostet 50 → 14 %.
- **Was fällt** (in T5, beim Namen): `artGewichte` als Art-Urteil für Bestand-Tiere (:4062), „Wörter von der stärksten Art“ (:4095)
  für Zeichnungs-Wörter, und die absolute Region-Farbe je Gattung als Art-Tafel (:3987 wird Wurzel-Stützstelle). Absenz-Grep der
  Mischung im Art-Pfad = 0.
- **Widerlegt als Hebel, also NICHT ins Gesetz:**
  - Punktualismus (28 %, κ = 0 6 %);
  - Raten je Achse (Null) und je Klade (45 %);
  - OU / Grenzen (14 %);
  - früher Ausbruch (Rauschen bei 10, 6 % bei 10⁶);
  - Wörter mit Spaltungs-Uhr und K = 3 (≤ 15 %).

## DREI FÄLLE (gerechnet) und die FALSIFIKATION
- **F1 — Kronen-Klade von 10 (Umfang stammbaum#1): HÄLT, knapp.**
  - DAS: p50 0,29 in 4 von 4 Sätzen, 55–59 % ≤ 0,3; NJ 51 %; Bezugsbaum 59 %.
  - Gegenprobe gemischt: 1,00 (0 %).
  - Brown allein liegt auf der Schwelle (46–51 %). Die Wörter geben +5 bis +10 Punkte.
- **F2 — 10 Arten aus Kladen von 10³ / 10⁶ (der Zoo aus einer artenAm-Liste): FÄLLT für JEDES Gesetz.**
  - Werte 0,71–1,00. Auch über dem Budget (39 + 6) nur 3–6 %.
  - Ursache gemessen: Fast-Stern, innen/Blatt 0,11–0,13.
  - Folge: der Zoo zeigt eine Kronen-Klade von genau 10 Arten, nie 10 Arten einer Liste.
- **F3 — Mantel an 10⁴ (stammbaum#4): FÄLLT NICHT.**
  - 0,33–0,49 über 4 Saaten bei ≤ 12 Achsen + 6 Wörtern; nur langsame Wörter erreichen an erde 0,524.
  - Hebel bleibt die Achsen-Zahl (20 Achsen: 0,55 in der ersten Runde).

**Falsifikation** („kein evolutionär begründeter Mechanismus bringt RF p50 ≤ 0,3 bei ≤ 12 Achsen + ≤ 6 Wörtern“):
- Bei der Klade von 10: **NICHT getroffen**. DAS hat p50 0,29 in 4/4 Sätzen.
  - Die Marge ist dünn (Anteil 55–59 %).
  - Der Gewinn gegenüber Brown ist klein; was trägt, ist die Achsen-Zahl 12 zusammen mit der richtigen Stichprobe.
- Bei 10³ / 10⁶: **GETROFFEN**. Der beste Wert ist 0,43 (Wörter mit K = ∞ bei 10⁶, 43 %); DAS 0,86.
  - Die Grenze liegt im Baum, nicht im Merkmal.

## PREIS
- Je Blatt bei N = 10⁶ im Spike-JS (Objekt je Ast, unter 100 % Fremdlast; ruhig 41 s-Lauf):
  - Pfad 40–43 µs, + Brown 11 = 118–141 µs, + 6 Wörter = 198–299 µs.
  - Kern-Maß der ersten Runde: +5 Merkmale = 34 µs. Erwartet wird deshalb, dass ein flacher Kern-Weg ~2× billiger ist; nicht gemessen.
- 0 Byte gehalten: die Wörter sind eine Funktion der Adresse. Die Region-Liste (~50 Arten) trägt 6 Byte je Art mehr.
- GPU nicht gelaufen:
  - Region-Farbe je Art braucht 8 RGB als Instanz-Parameter des Leib-Raums (24 Floats je Tier) statt der Guss-Farbe.
  - Kosten je Instanz und je Draw sind ungemessen. Sie gehören zu E (Profi-Band, ≤ 208 Draws, ≤ 118 MB).

## BAHN für die Bau-Welle
- **Keine eigene Bahn.** Jede Datei, die das Gesetz braucht, ist nach welle-2-3 §3 ausschließlich vergeben:
  - leben-core.js an B1 → L1 → S1;
  - tetrapoda-core.js an B3 → T1 → T5;
  - scripts/diag-kreatur-leben.cjs an B4 → S2 → R3.
- Eine parallele Bahn wäre ein Zwilling. Deshalb fädelt sich das Gesetz in **Welle 3** ein, nach Welle 2: der Leib-Raum mit hals,
  bein und statur muss stehen, sonst gibt es 7 statt 12 Achsen, und das sind nur 38 %.
- **S1 leben-art** (`leben-core.js`; zusätzlich planet-core.js und voxel-worker.js wie geplant):
  - `LEBEN_GESETZ.sicht`, `artMerkmale` mit 12 Achsen, `artWoerter`.
  - Selbsttest: 300 Kronen-Kladen von 10 am ECHTEN Kern, Anteil RF ≤ 0,3 ≥ 50 %.
  - Mutante `artWoerter` + `artMerkmale` je Blatt unabhängig → RF p50 ≥ 0,85.
  - Colless und β̂ byte-gleich.
- **T5 tier-art** (`tetrapoda-core.js`):
  - `artGestalt` liest den Art-Punkt; `muster`-Regionen = ton(Grundton, Wort); 11 Achsen auf die ART_GESTALT-Zahlen der Wurzel.
  - Absenz der Preset-Mischung im Art-Pfad.
- **R3 leben-richter-3** (`scripts/diag-kreatur-leben.cjs`, `spec/stamm/modul-karte.json`):
  - Akte stammbaum#1 an Kronen-Kladen von genau 10 Arten aus den gemalten Third-Bildern, nicht aus den Merkmalen: Bild-Deskriptor →
    UPGMA → RF.
  - Selbsttest: Mutante → ROT am Namen `artWoerter`.
- **Reihenfolge:** S1 (Signaturen eingefroren) → T5 ∥ R3. Gelandet wird mit Welle 3, einmal, im selben Zug.
- **Bildpaar** main ↔ Kopf:
  - Aufbau: Werkbank am Spawn-Platz (der Zoo des Prüfplatzes F, sobald er in main steht), Mittag, gleiche Saat, Third-Kamera 12 m
    seitlich, 1,7 m Augenhöhe.
  - Die 10 Arten EINER Kronen-Klade von 10 stehen in einer Reihe in ZUFALLS-Ordnung. In Baum-Ordnung würde die Aufstellung den Baum
    verraten (Zirkel).
  - main: vier Gattungen, keine Klade.
  - Kopf: Schwestern teilen sichtbar Zeichnung (dieselben dunklen Strümpfe, dieselbe helle Rutenspitze) und Proportion. Fernere
    Verwandte unterscheiden sich in Grundton und Wort.
  - Zweites Bild: dieselbe Kamera mit der Mutante. Dort sind die Ähnlichkeiten zufällig verteilt.
  - Zahl aus dem Bild: RF des Bild-Gestalt-Baums gegen den Samen-Baum an 30 Kladen. Anteil ≤ 0,3: main nicht messbar (keine Klade),
    Kopf ≥ 50 %, Mutante ≤ 5 %.
- **Sprossen:** leben.evolution.stammbaum#1, in der Lesart „Kronen-Klade von 10“. stammbaum#4 fällt NICHT (F3).
- **Stopp:**
  - Anteil ≤ 0,3 am Bild-Deskriptor ≥ 50 % an 30 Kladen, Mutante ≤ 5 %.
  - Colless 0,13 ± 0,04 und β̂ ∈ [−1,2; −0,8] unverändert.
  - Blatt-Nachschlag im Kern +6 Wörter ≤ +40 µs (gewählt).
  - Bestand-Takt p95 ≤ 7,36 ms; Draws und VRAM am Zoo unter E.
  - Fällt der Anteil am Bild unter 50 %, fällt #1 nicht. Dann ist das der Befund über die Wahrnehmung, keine Stellschraube an μ_w.

## OFFEN
- **Wahrnehmung nicht gelaufen.** Das Spike misst mit vollkommener Wahrnehmung (Merkmal = Distanz). Am Bild-Deskriptor liegt der Wert
  darunter (erste Runde: r am Bild < r am Merkmal). Die Marge von 55–59 % kann dort reißen.
- **Lesart der Sprosse:** #1 trägt nur als „Kronen-Klade von 10“. Bei der Stichprobe der ersten Runde (10 aus 10–60) sind es 31 %.
  Die Karte setzt der Schöpfer; hier steht nur die Messung beider Lesarten.
- **Mantel #4:** 0,33–0,49 bei ≤ 12 + 6. Ein Mechanismus innerhalb des Budgets ist nicht gefunden. Das Gesetz trägt #4 erst mit mehr
  Achsen (erste Runde: 20 Achsen 0,55) oder mit einem anderen Baum-Alter. Nicht gelaufen.
- **Alters-Gesetz:**
  - Der Fast-Stern bei 10³/10⁶ kommt aus β = −1 und dem Alter aus der erwarteten Kladen-Größe bei ε = 0,9.
  - Der Bezugsbaum (CPP) ist nur bei Klade 10 verglichen (+3 bis +19 Punkte); bei 10³ nicht gelaufen.
  - Ob reale Bäume dort mehr Innen-Länge tragen (γ-Statistik), ist unsicher und nicht gemessen.
- **Konstanten:**
  - Gewählt: wortRate [1/350; 0,1], K = 3, der Ton „dunkel 0,45 / hell 0,75“, die Distanz „Wort = 2“ (vor dem Lauf gesetzt).
  - Unsicher: σ² 0,004, ε 0,9.
- **Muster-Typ** (Streifen, Flecken, Reaktions-Diffusion) und Hörner im Tier-Ofen fehlen; das Gesetz braucht sie nicht. Pfote und
  Ohr bleiben Bauplan-Wörter.
- **GPU** nicht gelaufen: Region-Farbe als Instanz-Parameter, Draws und VRAM.
- **Laufzeit:** 41 s ruhig (Lauf 1), 74 s unter Fremdlast. Die 60-s-Grenze ist ruhig gehalten, unter Last nicht.
- Pflicht-OFFEN unverändert: A · B · C · E · F (docs/PFLICHT-OFFEN.md). Status ZWISCHENSTAND.
