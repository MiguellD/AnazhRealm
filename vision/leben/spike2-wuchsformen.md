# SPIKE 2 — die fehlenden Wuchsformen (leben.pflanzen.arten#2)

Stand: main 18058dba, nur gelesen. Skript `spike2/wuchsformen.cjs` (node, 32 s: 208 Bauten in 10 worker_threads, je Arbeiter zwei
vm-Welten Original und Kopie; Laden 9,8 s je Arbeiter, Bau-Summe max 16,9 s). Ausgabe `spike2/lauf3.txt`. Frühere Läufe:
`lauf1-vor-nachtrag.txt` und `lauf2.txt`. Die Kern-Kopie liegt in `spike2/kern-kopie/phyto-core.js` (+59/−13 Zeilen, 18 benannte
Ersetzungen E0–E17, jede trifft genau einmal).

Richter der Sprosse, wörtlich aus `origin/koordination:vision/meisterkarte-2.json`, leben.pflanzen.arten#2:
- umfang „10² Arten, gezogen aus EINEM Merkmalsraum (Saat → Art), keine Tabelle“
- tiefe „≥ 90 % als echte Wuchsform erkannt (Baum, Strauch, Gras, Kletterer, Sukkulente, Farn, Moos)“
- richter „100 Saaten → Wuchsform-Blindtest; Silhouetten-Paare unterscheidbar ≥ 95 %“

## BEFUND

**Der Netz-Richter.** Er urteilt am GEBAUTEN Netz, nie am Soll. Gelesen werden die Attribute `aType`, `aCenter` und `position` aus
buildInstance. Die Merkmale:
- H
- Ø als Ebenen-Schnitt der Achs-Dreiecke bei 1,3 m bzw. 8 % H
- Zahl der Stämme
- S = H/H_krit(Ø)
- Blatt-Anteil der Fläche
- Dicke = r_p10/r_p99 der Achs-Ecken
- B/H
- |ny| des Grüns
- Blüte

Die Schwellen wurden vor Lauf 1 aus den Definitionen GEWÄHLT und danach nie verändert: holzig ab Ø 1 cm, Baum ab 3 m,
tragend bis S 1, Speicher bei Blatt < 0,15 und Dicke ≥ 0,25, Moos unter 15 cm bei B/H ≥ 3, Gras bei |ny| < 0,65.

| Prüfung | Ergebnis |
|---|---|
| PRESETS (15 Arten × Saat 1/2) | 28/30 |
| die vier Formen der Aufgabe (Baum 18, Strauch 4, Gras 4, Farn 2) | 28/28 = 100 % |
| daneben | nur die Blume (2×) → strauch |
| Byte-Beweis Kopie ↔ Original ohne `gesetz` | 6/6 sha1-gleich (eiche, fichte, birke, strauch, farn, gras) |

Die Blume liegt daneben, weil ihr Netz 344/344 Ecken mit aType 0 trägt und keine Blüte 3. Leser von typ.bluete gibt es
(stoff-instanz.js:303, foundry-core.js:902).

**100 Arten, je Wurzel BEDINGT gezogen** (μ_Wurzel/σ, Korrelation R aus Runde 1, Strom 20162, gebaut im echten Kern):
**82/100** werden als ihre Form gebaut, **81/90** ohne die Wurzel Kraut (Kraut steht nicht in der Liste der Sprosse). Fehler 0,
Tris über der Zeile 3.

| Wurzel | Ergebnis | daneben |
|---|---|---|
| laub | 22/22 | — |
| nadel | 13/13 | — |
| strauch | 16/20 | 4 Zwergsträucher (0,56–0,83 m, Ø 0,7–1,0 cm) liegen unter holzD → gras |
| gras | 16/20 | 4 Rasen von 7–15 cm mit B/H ≥ 3 → moos |
| farn | 14/15 | 1 → moos |
| kraut | 1/10 | 9 → strauch (dasselbe Gewebe wie die Blume) |

Selbst-Tragen der Holz-Arten: S p5/p50/p95 = 0,25/0,36/0,73, höchstens 0,75. Kein heutiger Baum steht über der Greenhill-Grenze;
der Richter wird also nie von einem Baum zum Kletterer getäuscht.

**Greenhill geprüft.** C = (7,8373/4)^⅓/2^⅔ = **0,7883**, die Aufgabe nennt ≈ 0,79. E/ρg = 22 GPa·SSD·0,65/(1 800 kg/m³·SSD·g) =
8,1·10⁵ m; SSD kürzt sich heraus, der Wert ist UNSICHER. Daraus H_krit: 3,4 m bei Ø 1 cm, 15,8 m bei Ø 10 cm, 39,9 m bei Ø 40 cm.

**Die drei Gesetze an der Kern-Kopie** (Pfad: buildInstance → treeParams → growSkeleton → Röhre/Laub, Welt-Skala 1):

| Gesetz | erkannt | tris p50/max | Bau p50 | Zeile | Fehler |
|---|---|---|---|---|---|
| Kletterer (Stütz) | **7/8** | 6 278/7 724 | 2,4 s | Baum 12 000 | 0 |
| Sukkulente (Speicher) | **4/12** | 792/3 960 | 82 ms | Baum 12 000 | 0 |
| Moos (Kapillar) | **10/10** | 4 608/4 752 | 0,6 s | **über** Farn 3 800 | 0 |

- **Kletterer:** Ø nach Gesetz p50 3,0 cm, gemessen bei 1,3 m 2,3 cm, H 10,5 m, S p50 **1,79**. Der eine daneben hat Ø 0,8 cm <
  holzD und wird zu gras. Ohne Wirt: 7/8 kletterer bei H 9,0 m (H_krit 7,1 m), B/H 0,7.
- **Sukkulente:** V/A p50 17,1 mm, Säule 4/11, Rosette 0/1.
- **Moos:** H_kap 3,1–7,6 cm, gemessen 3,7 cm (Gesetz 4,1 cm), B/H 12,4, Polster 9/10.

**Die sieben Formen zusammen** (90 Arten + 30 Gesetz-Arten): **102/120 = 85 %**. Die Tiefe der Sprosse fordert ≥ 90 %.

**Übergänge (3).**
- **Baum ↔ Kletterer**, q = ln(D/D_krit(L)), L 15 m: S steigt monoton über q 1,2 → −1,2: 0,54 · 0,70 · 0,91 · 1,04 · 1,19 · 1,30
  · 1,38 · 1,72 · 2,23. Die Achse ist **stetig**. Der Kipp-Punkt liegt bei q ≈ 0,3 statt 0, weil die Verjüngung den gemessenen
  Ø um ~18 % unter den Soll-Ø drückt (11,3 → 9,3 cm).
- **Strauch ↔ Sukkulente**, t_dry 0 → 300 d am Horst-Strauch 1,6 m:

| t_dry (d) | 0 | 20 | 40 | 80 | 120 | 200 | 300 |
|---|---|---|---|---|---|---|---|
| Blatt | 0,98 | 0,98 | 0,99 | 0,94 | 0,79 | 0,00 | 0,00 |
| Dicke | 0,09 | 0,09 | 0,17 | 0,30 | 0,45 | 0,59 | 0,40 |
| Stämme | 30 | 49 | 45 | 9 | 7 | 4 | 4 |
| tris | 6 422 | 6 368 | 8 212 | 4 098 | 3 382 | 3 904 | 3 904 |
| Form | strauch | strauch | strauch | strauch | strauch | sukkulente | sukkulente |

  Der Wechsel liegt zwischen 120 und 200 d. Dicke, Blatt und Stämme laufen stetig, die Form springt an der Blatt-Schwelle.

**Nachträge (benannt; keine Schwelle des Richters wurde verändert).**
- **Lauf 1 WIDERLEGT:** 4 Formen 21/28 = 75 %, Sukkulente 0/12.
  - N1 Messfehler: Ø war 0 bei Fichte, Tanne, Buche, weil im Band keine Ring-Ecken lagen. Jetzt Ebenen-Schnitt.
  - N2: api 0,75/0,9 kippte die Säule über treePhenotype phyto-core.js:2303 in die Konifere. Jetzt api 0,68/0,5.
  - N3: Greenhill liest jetzt den Fuß-Radius an der letzten Stütze.
  - N4: Der Rezept-1-Strauch verliert die Speicher-Achse (5 900 → 280 Dreiecke). Deshalb fährt der Übergang im Baum-Pfad mit Horst.
- **N5 Prüfstand:** Zwei Realms ließen geoVerschmelzen phyto-core.js:2650 werfen („aWind ungleich gebaut“, `constructor !==`).
  addMerged foundry-core.js:1234–1241 SCHLUCKT diesen Wurf still: der Leib verschwand mit 0 Dreiecken ohne Warnung. Jetzt laufen
  die Typed-Arrays des Haupt-Realms im vm, wie im Browser.
- **N6 (Lauf 3a → 3):** Ein aufgeblähter Seitenzweig lief bis countCap: 163 978 Dreiecke und 65 s je Bau bei t_dry 200. Jetzt
  entsteht ein Seitenzweig unter dem Speicher-Radius nicht (Rohr-Modell). Danach 3 904 Dreiecke; Laufzeit 98 → 32 s. Der Preis:
  Sukkulente 7/12 → 4/12.

## DAS GESETZ — Signaturen

EINE Quelle für Erbe, Stammbaum und Raum: `leben-core.js` (`__lebenCore`, Welle 1). Die Wuchs-Gesetze gehören dem Gattungs-Kern
`phyto-core.js`; er liest die Art und schreibt kein Erbe.

```
// leben-core.js — der Merkmalsraum (nur Daten, kein THREE)
__lebenCore.pflanzenWurzel(m)        -> "laub"|"nadel"|"strauch"|"gras"|"farn"|"moos"|"kletter"|"sukkulent" (Bauplan, aus m, keine Tabelle)
__lebenCore.pflanzenMerkmal(artId)   -> { H, SM, SSD, LA, LMA, N, q, tDry, rk } (bedingt je Wurzel: μ_W + σ_W·L·z)
// phyto-core.js — die drei Gesetze im Wuchs (E1-Helfer der Kopie, als Kern-API)
hKrit(D, eRhoG)                      -> m      Greenhill: 0,7883·(E/ρg)^⅓·D^⅔
stuetz(P, wirt|null)                 -> { richtung(p,d,r), lage(p2,r,len) }   trägt bis H_krit über der letzten Stütze, dann Wirt/kriechen
speicher(tDry, H, LA)                -> { va, rS, rK, form: "saeule"|"kugel"|"rosette", rippen, fBlatt }
moos(H, rk, R, trocken)              -> { H: min(H, 2γ/(ρ g rk)), polster, n }  Vogel-Spirale der Sprosse
artPhaenotyp(s, art)                 -> ph.gesetz = { trunkR, stammAnteil, stuetz?, speicher?, moos? }   (E0: reist über treeParams in P)
// der Richter (R3, diag-phyto-tree.cjs): wuchsform(netzMerkmale(mesh)) — nie aus m, nie aus dem Bauplan
```

Der Wirt ist ein Eingang aus der Welt (Zylinder x, z, r, h vom Nachbarbaum in `stamm/vegetation-*`). Der Kern sucht ihn nicht selbst.

## DREI FÄLLE und FALSIFIKATION

- **Fall 1 — Liane am Wirt** (L 11,6 m p50, q −0,9): sie windet sich mit 1,0 rad Steigung hoch und hängt über die Krone. Netz:
  Ø 2,3 cm, S 1,79 → kletterer. Erwartet und eingetreten.
- **Fall 2 — dieselbe Liane ohne Wirt:** über H_krit 7,1 m knickt sie und kriecht. Netz 7/8 kletterer (S > 1); einer → gras
  (Ø 0,8 cm < holzD). Eingetreten mit 1 Ausfall am holzD-Rand.
- **Fall 3 — Säule bei t_dry 60–300 d:** sie soll blattlos und dick (Dicke ≥ 0,25) zur Sukkulente werden. Eingetreten nur 4/11.
  Zwei Täter:
  - (a) Bei r_S 12–20 mm hält f = e^(−r/1 cm) (GEWÄHLT) noch 69–86 % Blatt-Fläche. 3 Säulen → strauch/baum.
  - (b) 4 blattlose Säulen und die Rosette messen Dicke 0,18–0,20. 11–31 % ihrer Achs-Ecken liegen unter 0,3·r_p99 und sitzen bei
    0,13–0,46·H. NICHT die Rippen: ohne Rippen gegengeprüft, gleich 0,18–0,30. NICHT die Spitze. Täter nicht gefunden.

**Falsifikation (gesetzt vor Lauf 1):** Netz-Richter < 90 % an den 4 heutigen Formen ODER ein Gesetz mit dem Apparat nicht baubar.
- Ausgang: 4 Formen **100 %**; alle drei Gesetze bauen mit 0 Fehlern über growSkeleton und buildTubeGesetz → **NICHT widerlegt**.
- Damit ist kein fehlendes Wachstums-Gesetz zu nennen.
- Die Sprossen-Tiefe ist dennoch NICHT erreicht: 85 % < 90 %, weil Sukkulente 33 % und Moos über der Zeile liegt.
- Der EINE Engpass an der Lücke: der Speicher-Leib im Achs-Maß, Täter (b). Er ist kein fehlendes Gesetz, sondern ein unbenannter Ort
  im Bau oder im Richter.

**Je Gesetz:**

| Gesetz | Kern-Funktion (Ersetzung) | was fehlt | Tris im Budget | Richter |
|---|---|---|---|---|
| Kletterer | growSkeleton Segment-Schleife (E4/E5 Richtung+Lage, E6–E8, E13), Greenhill im Wuchs | Wirt aus der Welt; kein nachträgliches Knicken (der Apparat ist inkrementell) | ja: 7 724 ≤ 12 000 | 7/8 |
| Sukkulente | E10 Rohr-Modell mit Speicher-Radius, E11 Blatt, E14/E15 Kugel, E16/E17 Rippen in barkProfile/buildTubeGesetz | Rezept-1-Strauch-Pfad (N4) verliert die Achse; foundry-Zeile | ja: 3 960 ≤ 12 000 | 4/12 |
| Moos | E12 Horst als Vogel-Spirale der Sprosse, maxDepth 0 | eine eigene Zeile; kein Blatt-Gewebe (|ny| NaN) | **nein**: 4 608 > Farn 3 800 bei 18 Sprossen | 10/10 |

## PREIS

- Kopie: +59/−13 Zeilen in phyto-core.js. Byte-gleich für jede Art ohne `ph.gesetz` (6/6 sha1).
- Bau p50 je Art: Kletterer 2,4 s (Baum-Klasse), Sukkulente 82 ms, Moos 0,6 s. Gemessen im Pool unter Last von 10 Fäden, nicht am
  Gerät.
- Dreiecke: im Budget außer Moos. Moos braucht eine Zeile oder ≤ ~14 Sprosse (gerechnet aus 256 Dreiecken je Spross, nicht gebaut).
- GPU, dc und VRAM: nicht gelaufen.

## BAHN (gegen welle-2-3.md §3)

Die Bahn ist **P1b pflanzen-art**, Datei `phyto-core.js` allein, nach P1 zweig-mass (dieselbe Datei; Corner ersetzt rMin/lMin
:136–137, worauf N6 aufsetzt). Sie läuft nach der Landung von laub-kante, die phyto-core.js heute hält.

Reihenfolge innerhalb P1b:
1. Die Ersetzungen E0–E17 als Kern-API (Signaturen oben).
2. Der Fund (b) Achs-Dicke der Säule, mit Täter beim Namen.
3. Die Blatt-Kopplung des Speichers: f aus dem Wasser-Haushalt statt gewählt.
4. Die Moos-Zeile.

Weitere Bahnen:
- **P2 pflanzen-bau** (`foundry-core.js`, nach R1): die Strauch-Kette Rezept 1 trägt den Speicher-Radius (N4); Zeilen für Moos,
  Kletterer und Sukkulente; addMerged :1234 meldet einen Wurf statt ihn zu schlucken (Befund N5, fail-soft).
- **P3 pflanzen-welt** (`stamm/vegetation-wiese.js`, `stamm/vegetation-streu.js`): der Wirt-Zylinder des Nachbarbaums reist in den
  ctx; t_dry und r_k kommen aus dem Klima.
- **R3** (`scripts/diag-phyto-tree.cjs`): der Netz-Richter aus `wuchsformen.cjs` mit den Mutanten „Greenhill aus“ → Kletterer ROT
  und „Speicher aus“ → Sukkulente ROT.

**Bildpaar main ↔ Kopf:**
- Kletterer: Waldrand der Mess-Wiese, Third 12 m, Mittag, gleiche Saat. SEHEN: eine dünne Achse windet sich am Stamm eines
  Nachbarbaums hoch und hängt über seine Krone; am selben Ort ohne Wirt kriecht sie am Boden. main zeigt dort nur freistehende
  Bäume.
- Sukkulente: ein Ort mit t_dry ≥ 200 d, Third 8 m. SEHEN: blattlose, gerippte grüne Säulen und Kugeln neben belaubten Sträuchern,
  dazwischen der Übergang (Blatt fällt, Zweig verdickt).
- Moos: Waldboden der Mess-Wiese, Ego 1,7 m, Blick 2 m vor die Füße. SEHEN: flache Teppiche (feucht) und Kuppel-Polster
  (trocken), 3–8 cm hoch.
- Zahl: Wuchsform am Mesh über die 7 Formen, main 4/7 Formen → Kopf 7/7, ≥ 90/100. Tris, dc und VRAM unter E.

**Sprossen:** leben.pflanzen.arten#2 fällt nur mit 7/7 Formen ≥ 90 % am Netz (heute im Spike 85 %). leben.pflanzen.arten#3 profitiert,
fällt aber nicht hier.

**Stopp:**
- Netz-Richter ≥ 90/100 über 7 Formen, Sukkulente ≥ 9/12.
- Byte-Abdruck der PRESETS gleich ohne `gesetz`.
- Dreiecke ≤ Zeile 100 % je Form.
- gate:phyto-core grün.
- Laufzeit des Richters ≤ 60 s.

## OFFEN

- Sukkulente 4/12. Täter (b): Achs-Ecken unter 0,3·r_p99 mitten in blattlosen Säulen (Dicke 0,18–0,20) sind nicht gefunden. Täter
  (a): die Blatt-Kopplung f = e^(−r/1 cm) ist gewählt.
- Moos über der Zeile (4 608 > 3 800); Moos-Sprosse ohne Blatt-Gewebe (|ny| NaN).
- Kurzrasen und Moos trennt der Richter nicht (4 Gras → moos): beide fallen über H < 15 cm und B/H ≥ 3.
- Zwergsträucher unter holzD 1 cm → gras (4/20). Die Schwelle ist gewählt.
- Blume und Kraut: Netz ohne Blüten-Gewebe (aType 3 fehlt, 344/344 aType 0). Die Form Kraut ist nicht erkennbar.
- Kein Knicken im Apparat: der Kletterer ohne Wirt kriecht nur, weil die Richtung beim Wachsen wechselt. Der Kipp-Punkt liegt bei
  q ≈ 0,3, weil die Verjüngung den Ø um ~18 % senkt.
- Rezept-1-Strauch verliert die Speicher-Achse (N4). addMerged foundry-core.js:1234 schluckt Würfe still (fail-soft).
- UNSICHER: E/ρg 8,1·10⁵ m; μ_Wurzel/σ und R (aus dem Gedächtnis); e_min 0,05 mm/d, u 0,5, λ 3 cm, r_k 0,15–0,5 mm, Steigung
  1,0 rad, n 18 Sprosse (alle gewählt).
- NICHT GELAUFEN: GPU, Bild, Silhouetten-Blindtest ≥ 95 %, Wirt aus der Welt, die Arten aus leben-core (μ_Wurzel ist hier ein
  Spike-Satz).
