# ZENSUS der ZEIT in der Bestands-Rechnung — Code-Seite (19.11.)

Baum `C:/Users/micha/AnazhRealm-leben` (leben-erbe, 9c36ec126a, nur gelesen, `git status` leer). Kürzel: **T** = tetrapoda-core.js ·
**LC** = leben-core.js · **KL** = stamm/kreatur-leben.js · **KE** = stamm/kreatur-erbe.js · **FL** = stamm/feld-leben.js ·
**ZJ** = scratchpad/leben/zensus-jaeger.md · **JK** = scratchpad/leben/kern/jagd-kern.cjs · **LS** = kern/lauf-sterbe.txt.
Gerechnet (nicht gemessen, kein Boot) mit `scratchpad/leben/zeit-code/rechnen.cjs` aus den Kernen; Massen Reh 94,24 · Wolf 64,01 kg (JK:56).

## 1. DER TAKT

| Was | Wert | Datei:Zeile |
|---|---|---|
| Länge | taktS = 10 s der Welt-Uhr `spielZeit` | T:2191 |
| Geber | `spielZeit += delta` je Bild (Deckel 0,1 s) → `tickFaunaLifecycle` → `_feldTakt` → `_bestandSchritt` (R.t += taktS, auf dem Raster der Welt-Uhr) → `_bestandTakt` | stamm/dirigent-takt.js:48, 161, 2699 · KL:2766–2773, 2802–2828, 2432–2443 |
| Hängt er an der Tages-Uhr? | NEIN. Die Tages-Uhr liest dieselbe `spielZeit` und teilt sie durch die Tag-Länge des Spielers (Regler 1–60 min); der Takt liest nur Sekunden. Kein Tag, keine Nacht, keine Jahreszeit in `_bestandTakt` | stamm/bild-himmel.js:2639–2641 · stamm/daten.js:146–161 · KL:2444–2466 |
| Spiel-Tag | Vorgabe 60 min = 3 600 s = **360 Takte**; der „Tag des Gesetzes“ (Pegel) fest 3 600 s; am Regler-Minimum 1 min = 6 Takte | stamm/daten.js:159–167 |
| Nachholen | ferne Region beginnt LEER 3 600 s (360 Takte = 1,71 Wolfs-Leben) vor dem Lesen, holt 20 Takte je Takt nach | KL:3785–3786, 2325–2337 |
| Die EINE Raffung | refS 2 100 s = Leben des 64-kg-Wolfs („unsicher“); welche echte Spanne das ist, sagt der Code nicht | LC:73–74 |

| Art | Leben s · Takte · Spiel-Tage | Reife s · Takte · Spiel-Tage | Reife ÷ Leben | Quelle |
|---|---|---|---|---|
| Wolf 64,0 kg | 2 100 · 210 · 0,583 (14,0 Spielstunden) | 420 · 42,0 · 0,117 | 0,200 | LC:152–154, 166–168, 72, 90–91 |
| Reh 94,2 kg | 2 269 · 226,9 · 0,630 (15,1 Spielstunden) | 463 · 46,3 · 0,129 | 0,204 | wie oben; Leser KE:29–30, KL:2464, KE:85–87 |

Wachstum (LC:160–164): Reh geboren 5,65 kg, nach 10 Takten 27,4 kg, nach 15 Takten 40,0 kg; Wolf 3,84 → 20,3 → 29,6 kg (jagt „wild“ ab 21,5 kg, T:211).

## 2. DIE RATEN-TAFEL

Anker: **S** = je Sekunde der Welt-Uhr · **L** = je Leben (hängt an refS) · **T** = je Takt, freie Zahl (skaliert NICHT mit taktS). Die drei
T-Raten sind Chancen je GATTUNG je REVIER, nie je Kopf: je Takt höchstens EIN Wurf-Ereignis, EIN Hungertod, EIN Riss (KL:1982, 2455–2460).

| Rate | Wert, Einheit | Anker | je Leben der Art | Faktor zwischen den Ankern | Datei:Zeile |
|---|---|---|---|---|---|
| Geburt Reh | 0,1 × (1 − n/K) Ereignisse je Takt je Revier; Zeit-Skala 10 Takte | T | Decke 22,7 Ereignisse × 5 = 113 Köpfe je Revier je Reh-Leben; am Stand „grund“ (n 3,93, K 12,9): 0,348 Köpfe je Takt = **20,1 Junge je stehendem Kopf je Leben**; ohne Wolf (7,75 / 8,2): 0,8 | Geburt-Skala 10 Takte ↔ Reife 46,3 Takte: **4,6**; ↔ Leben: 22,7 | T:2196, 2219 · KL:1982 · Stand ZJ:32–35, JK:65–66 |
| Geburt Wolf | dieselbe Funktion, dieselben 0,1 je Takt; K = 25 × Wald × ha × min(1, Reh-Köpfe ÷ 30) | T | Decke 21 Würfe × 4,5 = 94,5 Welpen je Revier je Wolfs-Leben; Spike Gang 1 gemessen 2,3 Würfe je Leben, Gang 2 „erhaltung“ Decke 10,5 | 10 Takte ↔ Reife 42 Takte: **4,2**; ↔ Leben: 21 | T:2196 · KL:2165–2181 · kern/lauf-jagd.txt:13 · JK:533, 540 |
| Wurf-Größe | Wolf 3–6, Reh 3–7, Fuchs 1, Bär 1 Köpfe je Ereignis; jedes Kind zieht seine EIGENE Mutter | T (je Ereignis) | — die Quelle im Kommentar ist die VERBANDS-Größe (Rudel, Kahlwild-Rudel), nicht der Wurf einer Mutter | Einheit Verband ↔ Mutter | T:282 · KL:2005–2016 |
| Hunger-Tod | 0,2 × min(1, n/K − 1) je Takt je Revier, EIN Kopf; K = 0: 0,2; Skala 5 Takte | T | Decke 42 (Wolf) · 45,4 (Reh) Tote je Revier je Leben | 5 Takte ↔ Leben 210–227: 42–45 | T:2197, 2218–2221 · KL:2455–2458 · KE:108–111 |
| Alters-Tod | sicher bei alterS > 2 100 s × (M∞ ÷ 64)^0,20; Alter + 10 s je Takt | L (Zuwachs S) | 1 je Kopf je Leben = 0,0048 (Wolf) · 0,0044 (Reh) je Kopf je Takt | — (der Anker selbst) | LC:63, 152–154 · KL:2448, 2464 |
| Riss-Rate | p = min(1, 0,6 × Σ diet der wilden Jäger × D² ÷ (0,1² + D²)), D = gejagte Köpfe ÷ 30; halbe Sättigung bei 3 Köpfen; Skala 1,67 Takte je Wolf | T | Plateau 126 Risse je Wolf je Leben, Deckel 210 je REVIER je Wolfs-Leben (1 je Takt, gleich wie viele Wölfe); gemessen 0,267 je Revier-Takt = **29,7–32,9 Risse je Wolf je Leben** (1 778 kg = 28–33 eigene Massen) | gegen den Bedarf (nächste Zeile): gemessen **7–27** zu wenig, Deckel 1 je Takt gegen 5,2–17,4 Risse je Rudel-Takt: **5–17** | T:2199–2200, 2207–2211 · KL:2182, 2459–2460 · ZJ:19, 37 |
| Reh unter dem Riss | 0,068 je Reh-Kopf je Takt (0,267 ÷ 3,93) → ein Kopf steht 14,7 Takte (aus der Geburt gerechnet 11,3) | T | ein Reh-Bestand wird je Reh-Leben 15–20-mal ersetzt; bis zur Reife überleben bei gleichem Risiko e^−3,1 = 4 % | Verweil 11–15 Takte ↔ Reife 46,3 Takte: **3,1–4,1** | gerechnet aus ZJ:19, 32 |
| Bedarf / Stoffwechsel | HEUTE: keiner — das Futter des Wolfs ist „30 Reh-Köpfe = satt“, zeitlos, ohne kg. SPIKE: 0,199 kg je Tag je kg^¾ × Tage je Takt | heute — · Spike L (refS als echte Jahre) | Freiland 8 a: 13,9 Tage je Takt, 62,8 kg je Wolf je Takt (0,98 eigene Massen), 13 180 kg = **206 eigene Massen je Leben**, 244 Risse zu 54 kg; t_max 26,6 a: 46,4 Tage, 209 kg je Takt (3,3 Massen), 43 900 kg = 686 Massen, 813 Risse | der EINZIGE Wert, der die Raffung in echte Tage übersetzt: 1 s Welt-Uhr = 120 000 (8 a) bis 400 000 (26,6 a) echte s | KL:2165–2167 · T:2195, 2212–2215 · JK:92–105 · ZJ:43–46 |
| Bedarf des Rudels | 4,5 Köpfe: 282 kg je Takt (8 a) · 941 kg (26,6 a); 6 Köpfe: 377 · 1 254 kg | Spike L | 6 Köpfe, 8 a: 7,7 Risse je Takt zu 48,6 kg (gemessen im Spike: 8 a 2,3–7,0 · 26,6 a 6,0–8,6 je Rudel-Takt) | — | JK:90, 424 · LS:6–48 |
| Äsungs-Nachwuchs | Overlay zerfällt mit 0,008 je s zum Substrat; Halbwert 86,6 s = 8,66 Takte; je Takt × 0,923 | S | 26 Halbwerte je Reh-Leben, 5,3 je Reh-Reife; in der Raffung des Spikes 121 (8 a) bis 402 (26,6 a) echte Tage | Feld 8,7 Takte ↔ Geburt 10 ↔ Reife 46 ↔ Leben 227 | FL:3121, 2039 · JK:63, 396 |
| Fraß | 0,016 × (1 − diet) Feld-Einheiten je KOPF je Takt, gleich für Kalb und Hirsch (keine Masse, kein Alter) | T | 3,63 Feld-Einheiten je Reh-Leben; stehende Senke 0,208 Einheiten je Kopf; **kg Fraß je kg Leib: nicht bildbar** (das Feld trägt kein kg) | Einheit Kopf ↔ kg | T:2198, 2202–2205 · KL:2232–2237 |
| Reife | reifeAnteil 0,2 × refS über τ ∝ M^0,25; nur Reife werden Mutter oder Vater | L | Wolf 168, Reh 180,6 fruchtbare Takte je Leben | siehe Geburt (4,2–4,6) | LC:72, 90–91, 166–168 · KE:85–87 · KL:2007 |
| Wanderung | HEUTE: keine — kein Tier wechselt das Verzeichnis, sein Anker steht ab Geburt. Ersatz: ohne reifes Tier tritt eine Gruppe (3–7 Köpfe) ERWACHSEN aus dem Nichts ein, mit der Geburts-Chance. SPIKE Gang 2: einmal je Leben beim Reif-Werden, ein Nachbar-Revier weit | heute T (Gründer) · Spike L | Spike: ≤ 1 Schritt je Leben; Gründer-Gruppen im Spike „Pyramide“ 22,9 % der Reh-Geburten | Gründer-Eintritt 10 Takte ↔ Reife, die er überspringt: 4,6 | KL:2028–2037, 2476 · ZJ:23–24, 78 · JK:22–25, 563–621 |

## 3. DIE RAUM-TAFEL

| Was | Wert | Datei:Zeile |
|---|---|---|
| Revier | revierM 113 × √π = Seite 200,3 m = 4,01 ha; 4 × 4 Zellen zu 50,07 m = 0,2507 ha | T:2192 · KL:2262–2264, 3783–3784, 2380 |
| Rehe je Revier · je ha | mit Wolf 3,93 · 0,98; ohne Wolf 7,75 · 1,93; K 12,9 / 8,2, unverbissen 17,6 (4,4 je ha); Deckel des Gesetzes 25 × 4,01 = 100 | ZJ:32, 35 · JK:65–66 · T:2194 · KL:2174, 2181 |
| kg Reh je Revier | 252 kg mit Wolf (64,2 kg je Kopf) · 707 kg ohne | ZJ:32, 35 |
| Rudel-Revier heute | 1 Revier = 4,01 ha: Jäger und Beute im selben Verzeichnis | KL:2153–2159 · ZJ:24 |
| Rudel-Revier Spike | „energie“ 8 a: 11,8 Reviere = 47 ha (19–21 Rudel auf 256); 26,6 a: 39,7 = 159 ha (5–6 Rudel); „pyramide“: 64,1 = 257 ha (3–4 Rudel); Spike „Pyramide“ (Mittelfeld): N 45 | kern/ergebnis-jagd.json `revier.*.form.*.rudelAnfangN` · ZJ:68–71 |
| kg Beute je Rudel | N × 707 kg (Stand ohne Wolf): 8 300 · 28 100 · 45 300 kg; N × 252 kg: 3 000 · 10 000 · 16 200 kg — gegen das Rudel 4,5 × 64 = 288 kg | gerechnet |
| Bedarf je Takt ÷ Bestand EINES Reviers | 8 a: 282–377 kg gegen 252–707 kg = 0,4–1,5; 26,6 a: 941–1 254 kg = 1,3–5,0 Reviere LEER je Takt; Nachschub höchstens 0,25–0,5 Reh-Köpfe (neugeboren 5,65 kg) je Revier je Takt | gerechnet · T:2196 · LC:70 |
| Tempo | Einheit 0,34 × √(g × Hüfte); Schlendern × 0,45; Sprint (Hetze, Flucht) 3,0 × √(g × Hüfte). Wolf (Hüfte 0,63 m): 0,38 · 0,85 · 7,46 m/s; Reh (0,92 m): 0,46 · 1,02 · 9,01 m/s | T:1611–1628, 229, 1325 |
| Weg in EINEM Takt | Wolf 3,8 m (Schlendern) · 8,5 m · **74,6 m (Sprint)** = 0,02 · 0,04 · 0,37 Revier-Seiten; Reh 4,6 · 10,2 · 90,1 m | gerechnet |
| Reviere in der Reichweite eines Takts | **1** (das eigene; der Sprint-Weg 75–90 m ist kleiner als die halbe Seite 100 m). Eine Seite kostet 2,7 Takte im Sprint, 23,7 im Schritt, 52,7 schlendernd | gerechnet |
| Weg in EINEM Leben | Wolf 0,8 km schlendernd = 4 Seiten; 15,7 km im Dauer-Sprint = 78 Seiten; Reh 1,0 km = 5 Seiten · 20,4 km = 102 | gerechnet |
| Leine des Leibs | 18 m ± 10 m um den Anker (× Größe) = 0,09 Seiten; der Anker des Bestand-Tiers wandert nie | T:225–226 · KL:2028, 2032 |
| Sprung des Spike-Rudels | steht je Takt im beute-reichsten Revier SEINES Rudel-Reviers, ohne Weg-Grenze: bei kompakter Form (√N Seiten) bis 690–1 600 m je Takt = 9–21 × Sprint; zu Fuß im Sprint 9–22 Takte | JK:21, 429–447 · √N meine Annahme |

## 4. BEFUND

1. Der Verdacht trägt und ist schärfer als gestellt: es sind DREI Anker und dazu zwei Einheiten — je Sekunde laufen Leib-Tempo, Alter-Zuwachs
   und Feld-Zerfall (S), am Leben über refS 2 100 s hängen Lebensdauer, Reife und Wachstum (L), und Geburt 0,1 · Hunger 0,2 · Riss 0,6 ·
   Fraß 0,016 sind freie Zahlen je Takt (T), gesetzt vor leben-core, gezählt je Gattung-und-Revier statt je Kopf oder kg — die T-Raten laufen
   4- bis 23-mal schneller als das Leben (ein Reh steht unter Wölfen 11–15 Takte, reif wird es nach 46), und der heutige Bestand überbrückt
   genau diese Lücke mit erwachsenen Gründer-Gruppen aus dem Nichts, die der zweite Spike-Gang verbietet.
2. Am weitesten liegt der BEDARF ab (heute nicht im Code, im Spike der einzige Wert in echten Tagen): 0,98–3,3 eigene Massen je Wolf je Takt
   und 206–686 je Leben gegen gemessene 28–33 — 7- bis 27-mal über dem heutigen Riss, 5- bis 17-mal über dessen Deckel von einem Riss je Takt,
   und je Takt so groß wie der ganze Bestand des EINEN Reviers, das ein Leib in einem Takt erreicht (Sprint 75 m gegen 200 m Seite); über das
   ganze Blatt ist der größte Faktor der zwischen Leib-Tempo (echte Sekunden) und Leben (Raffung 120 000–400 000).
3. NICHT belegt: die Hüft-Höhen der Güsse (Kommentar-Werte T:1612–1615, der Guss misst sie erst im Boot, KL:2408–2414) und damit jede
   Tempo-Zahl auf ± einige Prozent; der Reif-Anteil am Kopf und damit „Junge je MUTTER“ (nur je stehendem Kopf); die wirksame Geburts-Chance
   (sie braucht zusätzlich einen von 6 Kandidaten-Orten der Gattung, KL:1958–1982); welche echte Spanne refS meint (8 a oder 26,6 a stehen nur
   im Spike, JK:98–99); Fraß in kg; und kein Wert hier ist im laufenden Spiel gemessen — die Stände „grund“ und „ohneWolf“ stammen aus ZJ.
