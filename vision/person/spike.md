# Spike Person — das Gesetz gegen sein Soll

**Status: ZWISCHENSTAND.** Prototyp `spike/person.cjs` = `gesetz.md` §1–§6, reines Node, liest die sha-geprüfte Kern-Kopie
`spike/kern/leben-core.js` (koordination, Welle 1) und `vision/bau/spike/gesetz-proto.cjs` über `spike/lade.cjs`. Das Soll steht in
`gesetz.md` §7 und ist seit Commit 90b6950d unverändert, also vor jeder Messung gesetzt. Same `anazh`, Ergebnisse in `spike/ergebnis/*.json`.

Lauf (jede Probe für sich, vom Repo-Wurzelverzeichnis):

```bash
node vision/person/spike/a-kosten.cjs
```

Ebenso `b-volk.cjs`, `c-tag.cjs`, `d-bewegung.cjs`, `d-gitter.cjs` und `e-determinismus.cjs`. `--same=…` setzt einen anderen Samen.
Laufzeit auf dem Cloud-Rechner: a zählt die 5,1·10⁶ Personen in 22 s, b 1,3 s, c 2,6 s, d 4,8 s, e 36 s.

**Am Prototyp nach Commit 812c6fd3 geändert, vor der jeweiligen Probe, keine Konstante berührt:**

1. Hochzeit, Auszug, Rolle und Dienstjahr gelten am Tagesbeginn, Geburt und Tod zur Uhrzeit. Ohne das wechselt ein Kind, das um
   13 Uhr 15 wird, mitten im Tag auf den Arbeiter-Plan und springt. Eingebaut, bevor c lief.
2. Die Abkürzung „angekommen ab 1,0 m/s“ gilt erst ab 6 J. Der erste Treue-Lauf brach fail-closed ab: ein Säugling geht mit
   0,9997 m/s vom Bett zum Herd. Kleinkinder rechnen ihr Tempo jetzt immer exakt.

## Probe · Soll · gemessen · Urteil

| Probe | Soll (vorher) | gemessen | Urteil |
|---|---|---|---|
| a Kosten | p50(5·10⁶) ÷ p50(5·10³) ≤ 1,5 | 5 286 → 6,22 ms · 499 339 → 9,83 ms · 5 131 026 → 10,06 ms; Quotient **1,62**; Sack-Scan 28 ms → 2 561 ms | **TRÄGT BEDINGT** — ab 5·10⁵ Personen ×1,02 bei ×10,3 Personen; die 3×3-Viertel-Stadt beschneidet das Kandidaten-Fenster ±2 Viertel (221 statt 313 Kandidaten) |
| a Treue | 0 Abweichung in 100 Abfragen | **0** von 100, 192–790 Treffer je Abfrage, alle Stunden, Sonntage und Werktage | **TRÄGT** |
| b Pyramide | 60+ 6–10 % · 0–14 ≥ 35 % · e₀ 35–40 J | 6,82 % · **22,79 %** · **32,27 J** (204 267 Geburten) | **FÄLLT** — siehe Wurzel b Pyramide |
| b Größe | 12 Zellen im Band WHO-Median ± 1 SD | **5 von 12**; z: 1 J −3,96 / −3,48 · 2 J −2,15 / −2,31 · 5 J m +1,42 · 10 J m +2,15 · 15 J w −1,19 | **FÄLLT** — H = H̄·(M∞/M̄)^⅓·w^β ist EINE Potenz der WBE-Massenkurve; der Mensch wächst in zwei Schüben (Säugling, Pubertät), die die eine Sigmoide nicht hat |
| b Streuung | SD 18–19 J 0,75–1,25 × WHO | **1,42** (m, n 1 857) · **1,49** (w, n 1 600) | **FÄLLT** — Welle 1 hat nur die Achse lnM (sdP 0,2); die Größe erbt über (M∞)^⅓ die ganze Massen-Streuung (§8 vorher benannt) |
| b Reife Frau | 14,43 ± 0,5 J | **15,49 J** (Median, n 48 075; Mittel-Frau 15,48) | **FÄLLT** — EIN Zeit-Anker K am Mann; τ ∝ M^¼ macht die leichtere Frau nur um (57,04/69,16)^¼ = 0,953 früher reif, WHO um 14,43/16,24 = 0,889 |
| b Haushalt | Mittel 4,25–5,25 · ≥ 6 > 0,5 · Gesinde 10,4–16,4 % | 4,62 · **46,3 %** · **28,3 %** (21 656 Haushalte) | **FÄLLT** — die Gesinde-Plätze aus `haushalt()` des Bau-Gesetzes, 1,31 je Haus, sind gut das Doppelte von Kussmauls 13,4 %; ohne sie trägt der Hauslauf 3,31 Köpfe je Haus |
| b Erbe | 100 % gleiche Adresse · Steigung 0,46 ± 0,05 | **47 272 / 47 272** · **0,455** | **TRÄGT** |
| c Tag | Schlaf am Bett im Los · Schritt ≤ v·60 s · Ids eindeutig | 1 Person (Tagelöhner-Vater, Werk-Los 83, 1,4–1,9 km je Tag) + 1 000 Personen × 10 080 min: **0** Schlaf-Minuten außerhalb (3 569 364 geprüft) · **0** Sprünge, größtes Schritt-Verhältnis 1,000 · 5 286 Ids, alle eindeutig | **TRÄGT** |
| d Gang | Erwachsene 1,27–1,46 · Kind 6 J 0,62–1,04 · Greisin 85 J 0,80–1,08 m/s · Schritt 85 J 43,6–59,0 cm | Frau 30 J 1,454 ✓ · Mann 30 J **1,512** · Junge / Mädchen 6 J **1,283 / 1,255** · Greisin **1,456** · Schritt 85 J **71,0 / 65,6** | **FÄLLT** — Froude 0,25 hängt nur an der Beinlänge; Reife und Alter fließen nicht in den Gang (§8 vorher benannt) |
| d Stand-Sprung | J 9 87–131 · J 17,9 132–198 · M 9 77–115 · M 17,9 96–144 cm · 75 J < 30 J | 120,5 · 135,2 · 105,4 · 116,8 · 111,0 < 138,4 | **TRÄGT BEDINGT** — Bedingung: Knie-Start φ_s ≥ 30°. Diese Gitter-Grenze steht in keiner Quelle, und das Optimum liegt in allen Leibern an ihr. Ab 20° liegen 2/4 Zellen im Band, ab 40° 3/4, ab 5° 1/4 (`d-gitter`). Der Stoß hat keine Kraft-Länge-Kurve des Knies, darum lohnt jede tiefere Hocke |
| d Sprint | v_top 6,2–11,1 · 100 m 9,58–17,6 s · Bester ≥ 9,58 s · CV 10–20 % | **3,06 m/s** · **33,6 s** · 27,0 s · **5,9 %** | **FÄLLT** — der einbeinige Stoß aus der Ruhe liefert F/W 1,065; die Weyand-Formel braucht für 6,2 m/s F/W 1,646. Der Stoß hat keine Feder (Sehne, Dehnungs-Verkürzung) |
| d Weitsprung | Bester ≤ 8,95 m · Mittel-Mann > eigener Stand-Sprung | 0,96 m · **0,62 < 1,38 m** | **FÄLLT** — der Anlauf ist der Sprint und fällt mit ihm |
| d Wurf | 18,6–27,8 / 15,4–23,0 m/s | **kein Wert** | **FÄLLT** — kein Primitiv der Arm-Kette (§4, vorher benannt) |
| e Determinismus | gleicher Same gleich · anderer verschieden | zwei Prozesse: sha256 gleich in a, b, c, d · `anazh-2`: alle vier verschieden | **TRÄGT** |

**Wurzel b Pyramide.** Drei Ursachen:

1. Der Hauslauf setzt Geburten nur im Abstand 924 d zwischen der Hochzeit (24,5 J) und 35,68 J. Das ergibt höchstens 4 je Ehe:
   (35,68 − 24,5) / 2,53 = 4,4.
2. Das Gesinde (28,3 %) bläht die Erwachsenen auf.
3. Die !Kung-Siler-Kurve allein trägt e₀ 32,61 J (`e0Siler`). Das Epochen-Datum ist nicht England 1550–1650.

**Zählung: 15 Proben · TRÄGT 4 · TRÄGT BEDINGT 2 · FÄLLT 9.**

## Was das Urteil über das Gesetz sagt

Das Gesetz **trägt als Funktion**. Eine Person ist ein Wert ihrer Adresse (e). Ort(t) springt nie und schläft im eigenen Los (c). Die
Abfrage kostet ab 5·10⁵ Personen gleich viel und verliert niemanden (a). Die Kinder erben von den Eltern desselben Hauses mit h² 0,455 (b Erbe).

Das Gesetz **fällt** an drei Stellen:

- **Leib (§3):** Wachstum, Streuung und Reife der Frau.
- **Demographie des Hauslaufs (§2):** Kinderanteil, e₀ und Gesinde.
- **„EIN Regler vom Leib“ (§4):** Der Stoß trägt nur den Stand-Sprung, und auch den nur an einer Gitter-Grenze ohne Quelle. Gang
  (außer der Frau), Sprint, Weitsprung und Wurf erreicht er nicht.

Hier steht kein zweites Gesetz. Was fällt, fällt mit der genannten Wurzel. Die Zensus-Urteile, die daran hängen, stehen unten.

## Zensus-Urteile am gefallenen Teil (`urteil.json`)

| hängt an | ids | Folge |
|---|---|---|
| b Größe · Streuung · Reife (FÄLLT) | g3, g17 | FOLGT/FÄLLT nicht getragen: H(J) ersetzt `leibGroesse` noch nicht |
| b Haushalt · Pyramide (FÄLLT) | h3, h5, z1, g6 | Köpfe je Haus und die Alters-Verteilung aus dem Hauslauf: nicht getragen |
| d Gang · Sprint (FÄLLT) | b1, b2, b3, b4, b11, b12, t11 | das Tempo aus dem Regler: nicht getragen; die gesetzten Größen bleiben |
| d Stand-Sprung (TRÄGT BEDINGT) | b14 | getragen nur mit φ_s ≥ 30° als Datum |
| a · c · e (TRÄGT) | h2, h6, h7, h14, t9, t12, t15, t17, t18, t20–t24, b5, z3, z6, z8–z10, z13, z17–z21 | getragen |
