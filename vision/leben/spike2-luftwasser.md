# Spike 2 — Baupläne Luft und Wasser (Vogel, Fisch) als Vorlage am echten Ofen

Lücke: leben.tiere.arten#2 „10² Arten aus dem Samen, ein Bauplan je Medium“ (welle-2-3.md §4: „Baupläne Luft und Wasser … nicht gemessen“).
Skript: `scratchpad/leben/spike2/luftwasser.cjs`. Lauf 11,5 s, node, ein Faden, kein GPU, Repo nur gelesen (main 18058dba).
Ausgabe: `scratchpad/leben/spike2/luftwasser-ausgabe.txt`.
Grundlage ist eine Kern-KOPIE im Scratch (tetrapoda-core.js, foundry-core.js). Jede Ersetzung ist benannt, und das Skript bricht ab,
wenn ihr Anker nicht genau einmal vorkommt:
- E1 `bauTier` verzweigt bei `dials.bauplan` in `bauLuftWasser`.
- E2 `fellStreu` gibt [] zurück, wenn ein Bauplan gesetzt ist; Feder und Schuppe fehlen als Gesetz.
- E3 `fellFarbe` liest `luftWasserFarbe`, die Gegenschattierung.
- E4 Export.
- E5 `bakeTierInstance`: kein Fell-Schalen-Guss.
- E6 `__tierHaut` :8431, `nimmHaut`: ein Primitiv mit `userData.__flaeche` gießt nie in die Haut.
- E7 `__tierPrims` :8561: ein Primitiv mit `userData.__haut` fällt nie unter minVox heraus.

Die Vorlage nutzt nur den vorhandenen Wortschatz: Ellipsoide an den festen Gelenk-Namen des Ofens (foundry :8297–8322).
- Flügel: Vordergliedmaße legF → fU/fL/fP, 12 Stationen je Seite.
- Fisch-Rumpf: Rute aus 10 tailSegs mit NACA-00xx-Querschnitt.
- Flossen: Säume aus Primitiven, Rückensaum 13, Aftersaum 10, Schwanzflosse 4 Strahlen am tailSeg 9.
Jeder Lauf wird in zwei Fassungen gebaut:
- **Haut**: die Flügel/Flossen-Station als Haut-Primitiv, also der heutige Wortschatz.
- **Fläche**: dasselbe Primitiv, aber mit E6/E7, also ein starres dünnes Primitiv am Gelenk.

## 1. BEFUND (Zahlen)

**(1) Der Kern baut die Vorlage, das Budget hält** (tetrapoda-core.js:45–46: L0 62 000, Band 20 000; L1 7 000, Band 3 000).

| Art | Fassung | L0 Tris | L1 Tris | Haut L0 Rand/Komp | Flügel-/Flossen-Stationen in der Haut L0 · L1 |
|---|---|---|---|---|---|
| Spatz | Haut / Fläche | 17 164 / 21 836 (Band +9 %) | 2 920 / 2 864 | 0 / 1 | 16 · 6 von 27 / 0 · 0 |
| Adler | Haut / Fläche | 20 300 / 20 616 | **4 112 (Band +37 %)** / 2 892 | 0 / 1 | 20 · 14 / 0 · 0 |
| Albatros | Haut / Fläche | 17 388 / 19 432 | 2 834 / 2 758 | 0 / 1 | **12 · 0** / 0 · 0 |
| Hering | Haut / Fläche | 12 392 / 12 236 | 1 904 / 1 908 | 0 / 1 | 0 · 0 von 33 |
| Thun | Haut / Fläche | 16 548 / 16 548 | 2 360 / 2 346 | 0 / 1 | 0 · 0 |
| Aal | Haut / Fläche | 9 856 / 9 856 | 1 682 / 1 662 | 0 / 1 | 0 · 0 |

- Die L0-Haut ist überall geschlossen (Rand 0, eine Komponente). Flügel und Flossen der Fassung Fläche sind geschlossene Ellipsoide im
  Fell-Eimer (27–36 Komponenten, Rand 0). Je Ofen-Ruf vergehen 46–917 ms.
- **Der Bruch:** In der Fassung Haut hängt es von der ART ab, wie viele Flügel-Stationen in der Haut landen. Das Raster wächst mit der
  Höhe: Spatz L1 6 mm, Albatros 46 mm. minVox (foundry :8561) wirft jede Station mit Halbdicke unter 2,1 bzw. 16,1 mm hinaus; beim
  Albatros auf L1 also 27 von 27. Die Flosse fällt bei jeder Art heraus.
- Damit ist der Primitiv-Satz keine Konstante des Bauplans. Genau die Voraussetzung von `__tierRaumTafel` (welle-2-3 §2: „minVox
  nimmt nichts heraus oder hinzu“) bricht an Luft und Wasser.
- **Bau-Treue des Flügels** (Stufe 1, Wurzel-Raum, gegen die Eingabe):
  - Spannweite +3,4–4,0 %.
  - Fläche Spatz −3,6 %, Adler −20,7 %, Albatros −10,7 %. Die Ellipsen-Sehne √(1−η²) ist gewählt; beim breiten Adlerflügel ist sie zu
    schmal, darum Streckung 8,2 statt 6,0.
  - Am Umriss deckt das Kugel-Vieleck auf L0 0,98, auf L1 nur 0,89–0,90.
  - Dicke/Sehne der Hand bei η 0,75: Fassung Fläche 0,024–0,027 (Eingabe 0,020), Fassung Haut 0,072–0,082, also durch minDicke
    aufgedickt. Der Arm des Adlers wird in der Haut zum Klumpen: 0,609 statt 0,089.
  - Die bedeckte Sehne fällt nahe der Wurzel (η ≤ 0,07) auf ×0,38–0,62. Ob das ein Loch an der Schulter ist oder ein Effekt des
    Maßes, ist nicht geklärt.
- **Fisch, nicht tautologisch:** die Masse aus dem Volumen der Haut (ρ 1 050, gewählt) gegen die Literatur. Hering ×0,89, Thun ×0,87,
  **Aal ×2,08**: der NACA-Querschnitt mit wd 0,85 ist für den Aal zu voll.
  - Schlankheit am Guss: 7,0 / 4,3 / 15,9 bei Eingabe 7 / 4,2 / 17.
  - Seitenverhältnis der Schwanzflosse: Thun 7,1 (7,5), Hering 3,3 (3), Aal 2,1 (1). Die Aal-Flosse ist zu hoch, weil ihre Höhe
    gewählt ist.

**(2) Physik — die Masse allein setzt die Form NICHT.** Literaturwerte sind unsicher (Gedächtnis).
- Rayner 1988 (b = 1,17·M^0,39, S = 0,16·M^0,72): Spannweite −10 bis +30 %, Fläche −33 bis +41 %.
- Isometrie ab dem Spatz: Adler b −40 %, S −63 %, Flächenlast +172 %.
- Streckung: Spatz 5,8 und Adler 6,0, aber Albatros 15. Die Streckung folgt der Lebensweise (Segeln), nicht der Masse.
- Fische: nur der Thun liegt am Widerstands-Optimum FR ≈ 4,5 (Hoerner, unsicher). Hering liegt bei 7, Aal bei 17. Die Schwimmweise ist
  eine eigene Achse.
- **Folge:** Jeder Bauplan braucht ≥ 2 stetige Achsen: Luft (ln M, Streckung), Wasser (ln M, Schlankheit).

**(3) Mischung — lineare Formziele gegen den echten Refit**, bei t = ½, mit dem Stufe-1-Raster und dem Rahmen mit Radius wie R1.

| Paar | Haut: Haut-Refit p95 / max | Haut: dünne Primitive | Fläche: Haut-Refit p95 / max | Fläche: dünne Primitive p95 / max |
|---|---|---|---|---|
| Spatz ↔ Adler | 4,4 / 7,5 mm | Zahl springt 21/17/15 | **0,1 / 0,1 mm** | **0,0 / 0,0 mm** (27) |
| Adler ↔ Albatros | 42,3 / **316,4 mm** (Partner fehlt 6/14) | Zahl springt 15/19/29 | **0,5 / 8,3 mm** | **0,0 / 0,0 mm** (27) |
| Hering ↔ Thun | 3,3 / 10,3 mm | Zahl springt 38/36/35 | 3,7 / 5,0 mm | 21,1 / 38,1 mm (33) |
| Thun ↔ Aal | 9,3 / 11,6 mm | 126,7 / 149,5 mm | 6,8 / 9,8 mm | 39,4 / 59,0 mm (33) |

- Mit E6/E7 ist der Satz fest: Partner fehlt 0/0, neu 0/0. Die Vogel-Tafel mischt dann exakt linear.
- Die Flossen-Primitive sind NICHT affin in den Achsen. Ihr Ort hängt am NACA-Umriss und an der Peak-Verschiebung. Die Tafel braucht für
  sie Knoten wie die Haut (≤ 1,2 Dekaden auf ln M und 3 Knoten auf der Schlankheit) oder die Formziele der Flossen als Funktion des
  Umrisses.

**(4) Bewegung — es fehlt ein Schlag-Gesetz, der Leser ist halb da.**
- Pennycuick f = M^⅜ g^½ b^−23/24 S^−⅓ ρ^−⅜ (unsicher): Spatz 15,2 Hz, Adler 2,9, Albatros 2,7.
  - Isometrisch heißt das ∝ M^−⅙. Die Hill-Regel M^−⅓ des Auftrags gilt für den Gang, nicht für den Flug: Spatz → Adler ×0,43 statt
    ×0,19.
  - Der Kern hat `VOGEL_GESETZ.leib.schlagHz` 12 für JEDEN Vogel (tetrapoda-core.js:2392). Die Amsel nach Pennycuick: 13,6 Hz.
- Strouhal f = St·U/A (St 0,3, A = 0,2 L, gewählt):
  - Hering 1,5 Hz, Thun 1,5 Hz, Aal 0,75 Hz.
  - Die Bachforelle des Kerns: 3,5 Hz gegen `FISCH_GESETZ.schlagHz` 2,5 (:2832).
- Leser (live gegrept):
  - tetrapoda-core.js:3682 trägt die Körperwelle schon: Rute als laufende Welle, 0,5 rad Phase je Glied. Die Amplitude ist aber
    KONSTANT, also keine Hüllkurve und kein Aal ↔ Thun.
  - :3220 erzwingt mit den Bein-Ketten den Boden; einen Zweig für Flug oder Tauchen gibt es nicht.
  - Flügelschlag gibt es nur am Oktaeder (stamm/kreatur-fauna.js:435 ← tetrapoda-core.js:2513).
  - Der Fisch schlägt als starre Gier (:2871).
  - Die Satz-Bänder hängen an Froude (stamm/kreatur-leben.js:3746–3747) und passen damit nicht zu Luft und Wasser.

**(5) Preis** — siehe §4.

## 2. DAS GESETZ (Signaturen)

**EINE Quelle `leben-core.js` (`__lebenCore`)** für Erbe, Stammbaum und Raum. Bauplan ist das Wort an der Wurzel (welle-2-3 §2):
- `bauplanAn(knoten) → 'hund'|'baer'|'hirsch'|'luft'|'wasser'`. Ein Medium-Wechsel ist ein benanntes Ereignis an einem Spaltknoten
  von `stammSpalt`, nie eine Schwelle auf einer Achse.
- `achsen` += `streckung` (nur Bauplan luft; ln AR, σ aus dem Erbe; Anker Spatz 5,8 / Albatros 15, unsicher) und `schlank` (nur
  wasser; ln FR; Anker 4,2 / 17).
- `wuchs(M∞, alterS)` bleibt wie in Welle 2; es gibt keine zweite Kurve.

**Die Gattungs-Kerne lesen nur:**
- `tetrapoda-core.js`:
  - `TIER_BAUPLAN.luft = {fluegelStationen: 12, hals: 3, rute: 2, faecher: 3}`.
  - `TIER_BAUPLAN.wasser = {rute: 10, ruecken: 13, after: 10, caudal: 4, brust: 2, bauch: 1}`. Die Zahlen sind fest und hängen nie an
    der Art.
  - `luftPunkt(lnM, streckung, wuchs) → dials` mit b, S und Rumpf aus M; ρ 800 ist gewählt und unsicher.
  - `wasserPunkt(lnM, schlank, wuchs) → dials` mit NACA-Peak, wd und caudal-AR. Der Aal-Querschnitt muss dabei magerer werden (×2,08).
  - `schlagHz(bauplan, punkt, U)`: Pennycuick für luft, Strouhal für wasser.
  - `tierPose` :3682: Amplitude als Hüllkurve A(s) = A_kopf + (A_schwanz − A_kopf)·s^k, k aus der Schwimmweise; dazu Flügel-Gelenke
    fU/fL/fP mit Schlag-Phase.
- `foundry-core.js`: **DAS EINE fehlende Primitiv heißt „die Fläche“.**
  - `userData.__flaeche` gießt nie in die Haut und hängt starr an seinem Gelenk wie Ohr und Lid (E6).
  - `userData.__haut` fällt nie unter minVox heraus (E7).
  - `__tierRaumTafel` (R1) liest den Satz dann ohne Ausnahme.
  - Die schönere Gestalt wäre ein Linsen-Primitiv mit Umriss-Polygon statt Ellipsoid-Kette: Es gewinnt die 10 % Umriss auf L1 zurück
    und die Dicke der Hand (0,024 statt 0,020). Nicht gebaut.
- **Kein Zwilling:** Die Oktaeder-Leiber `VOGEL_GESETZ.leib` (:2392) und `FISCH_GESETZ` (:2837) samt ihren Pools in
  kreatur-fauna.js :390/:735 fallen, sobald die Vorlage gezeichnet wird. `schlagHz` 12 und 2,5 als Zahl fallen mit (Absenz-Grep 0).

## 3. DREI FÄLLE und die Falsifikation

1. **Fall Haut (der heutige Wortschatz):** Er baut, das Budget hält, die Haut ist geschlossen. ABER der Flügel fällt je Art aus der
   Haut (Albatros L1 27/27 heraus, Adler 13/27). Der Satz springt, und die Mischung bricht: Adler ↔ Albatros max 316 mm, Partner
   fehlt 6/14. Adler L1 reißt das Band (4 112 > 3 000). **Trägt nicht.**
2. **Fall Fläche (E6 + E7, zwei Zeilen im Ofen):** Satz fest. Vogel-Mischung p95 0,1–0,5 mm, max 8,3 mm. L0 ≤ 21 836, L1 ≤ 2 892.
   Hand-Dicke nahe am Soll. **Trägt für die Luft.**
3. **Fall Wasser mit Fläche:** Haut-Mischung p95 3,7–6,8 mm. Die Flossen-Primitive mischen aber nicht affin: p95 21–39 mm, max 59 mm.
   Sie brauchen Knoten der Tafel wie die Haut. Die Masse trifft ×0,87–0,89; beim Aal ×2,08. **Trägt mit Knoten-Auflage**, der Aal mit
   einer Korrektur des Querschnitts.

**Falsifikation.** Behauptet war: „der Wortschatz kann Flügel/Flosse nicht als geschlossene Fläche bauen, oder das Tris-Budget reißt“.
- Das Budget reißt NICHT. Maximum L0 21 836 von 62 000, L1 4 112 von 7 000; nur die Bänder werden gestreift.
- Als TEIL der geschlossenen Haut kann der Wortschatz den Flügel NICHT bauen: minVox wirft ihn artabhängig hinaus.
- Als geschlossenes starres Primitiv am Gelenk KANN er es.
- **Ausgang:** zur Hälfte falsifiziert. Das EINE fehlende Primitiv ist **die Fläche** (`__flaeche`/`__haut`, E6/E7 in `__tierHaut` und
  `__tierPrims`).
- Ohne die Fläche trägt die Tafel Luft nicht. Mit ihr trägt sie, gemessen an Kern-Kopie und echtem Ofen.

## 4. PREIS

- **Tafel:** Pose-Tafel je Gestalt nach der Formel aus stoff-gang.js 3·J·(B·N+1)·16, mit B = 2 Bändern (gewählt: Schlag/Gleiten,
  Reise/Flucht). Luft J 15 → 46 KiB, Wasser J 17 → 52 KiB.
- **Je Individuum:** instanceMatrix 16 + aGang 4 (stoff-gang.js:199–200) + Raum-Punkt 8 = 28 Floats = 112 B.
  - 10³ Vögel 109 KiB, 10⁴ Fische 1,07 MiB.
  - Bewegt sich jedes je Bild: 64 MiB/s Upload. Darum gehört die Bewegung auf die GPU als Funktion (Phase aus Zeit + Saat); dann
    reisen nur 0 B je Bild.
- **Tris im Schirm.** Stufen-Modell in Pixeln, gewählt: L0 ≥ 150 px, L1 25–150, L2 6–25 mit 16 Tris je Primitiv, darunter ein Punkt
  mit 8 Tris. Kegel und Dichte sind gewählt.
  - 10³ Spatzen, 10–150 m: 0,01 M Tris (997 sind Punkte).
  - 10³ Adler: 0,47 M Tris (L2 = 656 Tris aus 41 Primitiven, 680 Adler auf L2). Mit Fern-Leib (4 Primitive, 64 Tris): 0,07 M.
  - **10⁴ Heringe, 2–40 m: 8,40 M Tris** (9 780 auf L2 zu je 816 Tris aus 51 Primitiven). Mit Fern-Leib 1,05 M. Alle auf L1:
    19,1 M.
  - **Ohne eine Mengen-Stufe REISST der Schwarm** (8,4 M gegen das Profi-Band). Der Fern-Leib mit 4 Primitiven ist Pflicht, nicht
    Kür. Er ist dieselbe Technik wie welle-2-3 §4 Zeile 10⁴ („Mengen-Stufen fürs Tier“).
- **Takt:** `fischSchritt` (tetrapoda-core.js:2853) braucht für 10⁴ Fische **33,25 ms je Takt** (node, ein Faden, ohne
  `_waterFlowAt`). Das reißt den Takt-Deckel 7,36 ms um ×4,5. Der Schwarm braucht einen Schritt in Scheiben (budget) oder die GPU.
  Nicht gebaut.

## 5. BAHN — ausschließlicher Besitz gegen welle-2-3.md §3

Reihenfolge: nach R1 und T1 (Welle 2). Die Bahn läuft vor T5, weil T5 tetrapoda-core.js hält; sie landet im Zug der Welle 3 VOR T5,
nie parallel in derselben Datei.
- **LW1 die-flaeche** — `foundry-core.js`, nur die Hunks :8175–8565 (bakeTierInstance, `__tierHaut` :8431, `__tierPrims` :8561).
  - Das liegt außerhalb von R1 (:7385–7560) und laub-kante (:4729–4760). Die Bahn läuft nach R1 und vor P2, das foundry-core.js in
    Welle 3 hält.
  - Schnitt: E5, E6, E7 wörtlich.
  - Byte: Die Güsse der 4 Land-Gattungen sind byte-gleich, denn kein Land-Primitiv trägt `__flaeche`/`__haut`. Beweis mit `werkbank
    abdruck --gegen <R1-Kopf>`.
- **LW2 luft-wasser** — `tetrapoda-core.js` (nach T1, vor T5).
  - Schnitt: `TIER_BAUPLAN.luft/wasser`, `bauLuftWasser`, `luftPunkt`/`wasserPunkt`, `schlagHz`, die Hüllkurve in `tierPose` :3682
    und die Flügel-Gelenke.
  - Die Zahl `schlagHz: 12` :2392 und `2.5` :2832 fallen (Absenz-Grep 0).
- **LW3 schwarm-leib** — `stamm/kreatur-fauna.js` (frei nach der Landung der Welle 1; keine Welle-2/3-Bahn hält es).
  - Schnitt: Die Oktaeder-Pools :390/:735 und der Flügelschlag :435 fallen. Gezeichnet wird die Vorlage über den Ofen-Schlüssel
    `bauplan|lod` (T3), dazu der Fern-Leib (4 Primitive) als Mengen-Stufe und `fischSchritt` in Scheiben.
- Linse in der Familie gate:tier-anatomie, Selbsttest:
  - Mutante „E7 aus“ → ROT am Namen `__tierPrims` (Adler ↔ Albatros max 316 mm > 10 mm).
  - Mutante „schlagHz konstant“ → ROT am Namen `schlagHz` (Spatz/Adler-Verhältnis 1,0 statt 0,43 ± 20 %).
- **Bildpaar main ↔ Kopf** (Werkbank `--echt`):
  - (a) Vögel über der Spawn-Wiese, Third 20 m, Blick 30° aufwärts, Mittag, gleiche Saat. main zeigt Oktaeder mit gleichem Takt.
    Am Kopf muss man SEHEN: Spatzen-Gestalt mit schnellem Schlag neben einem Greif mit langsamem Schlag und breitem Flügel; der
    Albatros-Punkt schmal und gestreckt; kein Flügel-Klumpen am Arm.
    Zahl: Schlag-Verhältnis klein/groß ≥ 3.
  - (b) Das nächste Gewässer mit FISCH_GESETZ-Lesern am Spawn, Third 6 m schräg über der Oberfläche, Mittag. Ob die Kamera unter
    Wasser sehen kann, ist NICHT geprüft. main zeigt einen Oktaeder mit Gier. Am Kopf muss man SEHEN: Rücken dunkel, Bauch hell, Rücken-
    und Schwanzflosse, eine Körperwelle mit wachsender Amplitude zum Schwanz.
    Zahl: Schwanz/Kopf-Amplitude ≥ 3.
  - Tris, dc und VRAM am selben Ort unter E.
- **Sprossen:**
  - **leben.tiere.arten#2** fällt NICHT allein: „Fell, Schuppe … aus 10 m glaubhaft“ verlangt Feder- und Schuppen-Klassen (E2 gibt
    heute leer zurück). Dazu kommt das Blind-Panel.
  - **leben.tiere.bewegung#3** wird baubar („Schlagfrequenz ±20 % zur Allometrie“). Die 5 Schwimmweisen aus der Körperform sind nicht
    gemessen.
  - **leben.tiere.arten#3** Richter „Schlankheit ↔ Reisetempo“: die Achse `schlank` liefert die Quelle.
- **Stopp:**
  - Satz fest: Partner fehlt 0/0 über alle Paare.
  - Vogel-Mischung max ≤ 10 mm; Flossen mit Knoten p95 ≤ 10 mm.
  - L0 ≤ 20 000 und L1 ≤ 3 000 (Bänder) an allen 6 Punkten.
  - Masse Guss/Literatur 0,8–1,25 an allen 3 Fischen.
  - 10⁴ Fische ≤ 1,5 M Tris im Schirm, Takt p95 ≤ 7,36 ms.
  - Land-Güsse byte-gleich.
  - Bildpaar (a) und (b) mit Zahl.

## 6. OFFEN

- GPU ist nicht gelaufen: kein Bild, keine Draws, kein VRAM. 10⁴ Fische im Schirm ist nur gerechnet.
- Die Literaturzahlen der 6 Punkte, Rayner, Hoerner und Pennycuick stehen aus dem Gedächtnis (unsicher). Gewählt sind ρ 800/1 050,
  St 0,3, A 0,2 L, die Ellipsen-Sehne, das Stufen-Modell und B = 2.
- Die Sehne an der Flügelwurzel fällt auf ×0,38–0,62: Loch oder Effekt des Maßes, nicht geklärt.
- Die Flügelfläche des Adlers liegt bei −20,7 %: Die Form des Umrisses fehlt als Achse (elliptisch gegen breit gefingert).
- Der Aal-Querschnitt ist ×2,08 zu schwer; die Höhe der Schwanzflosse (AR 2,1 statt 1) ist gewählt, nicht abgeleitet.
- Die Flossen mischen nicht affin. Die Knoten-Zahl auf `schlank` ist nicht gelaufen.
- Feder und Schuppe als Klassen-Haut sind nicht gebaut (E2 leer). Damit fehlt die Tiefe von arten#2.
- Der Fern-Leib (4 Primitive) ist nur gezählt, nicht gegossen. `fischSchritt` in Scheiben oder auf der GPU ist nicht gebaut.
- Das Linsen-Primitiv mit Umriss-Polygon als schönere Fläche ist nicht gebaut.
