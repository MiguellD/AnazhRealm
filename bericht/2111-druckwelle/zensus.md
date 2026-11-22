# Zensus same.physik.reaktion#2 — die Druckwelle

GTX 1050 · 2026-11-22 00:17 · Baum front-brand-wip 7ecef4e14 · kein Schnitt im Stamm · Karte 2 gebucht 44 von 1 718

**Der Satz der Karte (führt):** Umfang „Explosion" · Tiefe „Druckwelle nach Ladung, Fenster splittern bis zum gerechneten
Abstand" · Richter „Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen" · Beleg der Karte „Außer Verbrennen nach Rothermel
nichts". Die Station sagt heute `L.leser(2, …)`: kein Gesetz der Druckwelle, keine Ladung.

## Befund in drei Sätzen

Die Welt trägt für die Druckwelle die Leser von Stoß und Einsturz und KEINEN Schreiber: das EINE Impuls-Gesetz (vier
Kanäle), `_werkBricht` und der freie Körper laufen im Spiel, die Bruchfestigkeit σ_B steht in der Stoff-Zeile (gelesen von
0 Lesern) — eine Energie je kg, eine Ladung, eine Zeile der Luft und ein Fenster mit Zustand stehen nirgends. Die Hypothese
des Auftrags hält an zwei Stellen nicht: `_stoffBruch` → `_bruchMelden` ist der Fehler-Melder der Maschine (100 Rufe, keiner
bricht Materie), und die Stoff-Zeile trägt keine Energie (0 von 10 Spalten). Hopkinson–Cranz trägt als EIN Gesetz, der Spike
misst 1,525 % (Soll ≤ 25) — aber bei jedem reinen Z-Gesetz ist R ∝ W^(1/3) eine Identität: die Sprosse fällt nicht an der
Formel, sondern an Ladung, Fenster und Schreiber.

## 1 · Die Größen, die die Welt schon trägt

| Größe | Quelle (Datei:Zeile) | Wert | für die Welle |
|---|---|---|---|
| Stoff-Zeile ρ · E · σ_y · σ_B · c · T_schmelz · η, Schall √(E/ρ) | schmiede-core.js:2860–3077 `STOFF_GESETZ` | glas (Misch-Zeile, 2924): σ_B 5·10⁷ Pa, ρ 2 459, E 70,6 GPa · quarz: σ_B 5·10⁷, ρ 2 650 | die Bruch-Schwelle FOLGT aus σ_B — die Spalte steht, gelesen wird sie von **0 Lesern** (Wort `sigB` über Stamm, Kerne, Studios, Skripte: 3 Treffer, alle im Gesetz selbst — Kommentar, Spalten-Liste, Misch-Regel); die Welle wäre ihr erster |
| Heizwert `brenn.heiz` | bau-vorlagen.js:1647–1650 (Tafel BRENN des Wirts) | 18,608 MJ/kg, an 2 von 21 Zeilen (gras, laub) | Verbrennung MIT Luft (Leser Rothermel, feld-brand.js:406 und 535) — kein Sprengstoff |
| Zündung `tZuend` | bau-vorlagen.js:1620–1643 (Tafel SI) | Holz 573 K, Gras 533 K, Laub 523 K | der Zünder einer Ladung könnte sie lesen |
| Phasen-Wärme | bau-vorlagen.js:1645 | Eis L 334 kJ/kg, Wasser L_v 2,257 MJ/kg | — |
| Energie eines Stoffs, der OHNE Luft reagiert (J/kg), Umsatz | — | **0 Treffer** | fehlt: die Quelle der Welle |
| Luft: Dichte | vehicle-core.js:3279–3281 `FAHR.luft.rho` | 1,2 kg/m³ | steht — im Fahr-Kern |
| Luft: Schall | klang-core.js:1754 `FAHRT_OHR.c` | 343 m/s | steht — im Klang-Kern |
| Luft: Druck p0, γ | — | **0 Treffer** | fehlt; p0 = ρ·c²/γ = 1,2 · 343² / 1,4 = 100 842 Pa folgt aus den zwei Zahlen, die stehen (0,5 % unter 101 325) |
| Luft: Optik | foundry-core.js:304 `ATMO_GESETZ.luft` | Sicht, Rayleigh, Skalenhöhe | — |

Wortfeld Explosion · Druckwelle · Spreng · Überdruck · Detonation · Pulver über Stamm und Kerne: ein Treffer in der Sache,
ein Kommentar der Schar-Klemme (kreatur-verhalten.js:525).

## 2 · Korrektur an der Hypothese (mit Quelle)

- **`_stoffBruch` → `_bruchMelden` ist keine Bruch-Kette des Stoffs.** `_bruchMelden` (dienst.js:578) ist „DER EINE MELDER:
  jeder Bruch meldet ERROR" — der Vertragsbruch eines Glieds der Maschine; `_stoffBruch` (stoff-material.js:3392) wickelt
  einen Fehler des Render-Stoffs ein (Uniform, Knoten, Karte). 100 Rufe von `_bruchMelden` in 39 Stamm-Dateien, 89 von `_stoffBruch` in 28 — keiner
  bricht Materie.
- **Die Kette, die Materie bricht, heißt:** `_werkGesetzSetzen` (bau-teile.js:2488) → Urteil `_workshopPhysicsVerdict` mit
  `_loadPath` (bau-buch.js:2000) und `_failsUnderLoad` (bau-buch.js:1871) → `g.bruch` → `_tickWerkGesetz` (2563) →
  **`_werkBricht(e, plan, teile)`** (2620; EIN Rufer, bau-teile.js:2570) → je Teil ein Trümmer als freier Körper (`_freiKoerperSetzen`, koerper-frei.js:16)
  im EINEN Löser `_freiSchritt` (421).
- **`_failsUnderLoad` trägt keine Last von außen:** es urteilt beim Setzen das Eigengewicht über σ_y und E
  (`tragSpannung`), σ_B liest es nicht, einen Druck kennt es nicht.
- **Die Stoff-Zeile trägt keine Energie:** zehn Spalten (schmiede-core.js:2911), keine in J/kg.

## 3 · Schreiber und Leser

**Schreiber heute: 0.** Die Leser stehen alle am Stamm und laufen im Spiel:

| Leser | Glied | Eingang |
|---|---|---|
| Stoß an Leib, Tier, freiem Körper, Wagen (am freien Körper heute nur am Hüllen-Punkt, § 5) | das EINE Impuls-Gesetz `_stossKoerper` · `_stossAuf` (kreatur-verhalten.js:838, 869) → `_spielerStoss` (1064) · `_kreaturStoss` (1247, Schritt 1116 mit μ der Zeile) · `_freiStoss` (koerper-frei.js:1260) · `_fahrWagenStoss` | dv in m/s längs (nx, nz) — die Welle gibt dv = Impuls je Fläche × Stirnfläche ÷ Masse |
| Bruch | `_werkBricht` (bau-teile.js:2620) | die Liste der Teile, die fallen |
| Klang · Kamera · Funken | `_stossEreignis` (koerper-bewegung.js:823) → `_trefferPaar`; der Ton der Zeile klang `trefferTon` (klang-core.js:1408) | Stärke 0…1, Ort |
| Brand | `_brandEntfachen(x, z)` (feld-brand.js:437), Rauch `_brandRauch` | der Feuerball zündet das Bett |
| Sturz-Schaden | `LEIB.sturz` (Aufprall-Tempo des Leib-Lösers) | das Tempo, das der Stoß gibt |

**Der Leser, der fehlt, ist das Fenster.** Fachwerk gießt die Scheibe als Fläche der Rolle `glas` in den Guss des Hauses
(fachwerk-core.js:1050 `windowSash`, 1124 `fensterTeile`, 1139 `fensterAt`); die Öffnungen stehen als Liste `LICHT` (352,
`lichtAuf` 353: Ort, Breite, Höhe, Achse, Glas — der Leser ist das Raum-Licht `raumVon`, 6364). Je Fenster kein Zustand,
keine Dicke des Glases (gezeichnet ±12,5 mm), und der Wirt trägt keine Zeile `glas` (Tafel SI: 21 Zeilen, durchsichtig ist
nur quarz); ein Leser der Kern-Zeile glas beim Namen: 0 Treffer.

## 4 · EIN Gesetz (Vorschlag, mit Einheit und Anker)

1. **Die Quelle ist Energie:** E = m · q [J], q die Explosionswärme der Stoff-Zeile [J/kg] — die NEUE Spalte (heute 0).
   W = E ÷ 4,184 MJ [kg TNT, Definition].
2. **Das Feld (Hopkinson–Cranz):** Z = R ÷ W^(1/3) [m/kg^(1/3)], der Spitzen-Überdruck
   Δp/p0 = 808 · [1 + (Z/4,5)²] ÷ ( √(1+(Z/0,048)²) · √(1+(Z/0,32)²) · √(1+(Z/1,35)²) ) — Kinney & Graham 1985.
   Anker geprüft: 20 kPa bei Z 6,23 (veröffentlichtes Rechen-Beispiel) → die Formel gibt 19 986 Pa.
   In der Sachs-Form R · (p0/E)^(1/3) trägt dieselbe Kurve die Höhe der Welt (Reichweite ∝ p0^(−1/3)).
3. **Der Impuls je Fläche** i(Z) · W^(1/3) [Pa·s] — die Formel der Probe (0,067 · √(1+(Z/0,23)⁴) ÷ (Z² · ∛(1+(Z/1,55)³))
   bar·ms) steht aus dem Gedächtnis und ist an der Quelle NICHT geprüft; vor einem Schnitt lesen.
4. **Die Ankunft:** t = R ÷ c der Luft (nah läuft die Front schneller, U = c · √(1 + 6Δp/7p0)).
5. **Die Schwellen FOLGEN aus der Zeile, keine Schadens-Tafel:** die Scheibe ist eine Platte, vier Kanten gelenkig,
   σ = β · Δp · (b/t)² mit β 0,2874 (quadratisch; Roark, Tafel der Platten) — sie bricht bei σ ≥ σ_B. Scheibe 0,5 m, 4 mm:
   11,1 kPa, Z* 9,22. Dieselbe Formel gibt für 0,9 m und 3 mm 1,9 kPa — im Band des belegten Fensterbruchs (1–7 kPa).
   Der Leib bekommt dv über `_stossAuf`; ein Werk bekäme Druck × Stirnfläche als Querlast in sein Urteil (das Urteil kennt
   heute nur Eigenlast — das ist ein zweiter Schnitt).
6. **EIN Schreiber:** das Ereignis `_druckWelle(ort, energieJ)` an der Wurzel Brand (stamm/feld-brand.js — Reaktion ist
   Brand und Explosion), das Gesetz selbst rein im Kern neben `tragSpannung` (`STOFF_GESETZ.druckwelle`,
   `plattenSpannung`). Kosten an Ereignis und Betroffene: `_blockerUmPlatz` im Kreis Z_max · W^(1/3) und die Leiber darin,
   einmal je Ladung, in Ereignis-Zeit um R ÷ c versetzt.

## 5 · Der Spike: drei Ladungen an der Mess-Wiese (Werkbank `--echt`, GTX 1050)

**Aufbau** (Baum 7ecef4e14, die gebootete Welt: Bühne steht, 3 866 Werke, der Boden aus dem gezeichneten Mesh an 80 von 80
Punkten): am Herd −277,4 / 27,54 / −1045,6 drei Strahlen (0° · 120° · 240°) mit je 26 Probe-Fenstern im Abstand 4 m · 1,09^k
(4,0 … 34,5 m) — ein Holz-Bock, darauf eine Scheibe 0,5 × 0,5 m, 4 mm, aus der Zeile quarz (der Wirt trägt keine Zeile glas);
dazu zwei Kisten der Welt (42,1 kg, freie Körper) in 6 und 12 m. Jedes Werk geht durch die echte Wurzel `spawnArchitecture`.
Drei Ladungen 1 · 8 · 27 kg TNT (4,18 · 33,5 · 113 MJ) 0,5 m über dem Herd, aufsteigend. Das Gesetz (§ 4) steht als Prototyp
IN DER PROBE, kein Glied des Stamms; die Schwelle liest die Probe aus der Zeile (`_stoff("quarz").sigB` 5 · 10⁷ Pa →
Δp 11 134 Pa → Z* 9,219 m/kg^(1/3)).

| Ladung W | gerechnet R | fernste gebrochene Scheibe (drei Strahlen) | nächste heile | R gemessen (geometrische Mitte) | R ÷ W^(1/3) | neu gebrochen |
|---|---|---|---|---|---|---|
| 1 kg | 9,219 m | 8,70 · 8,70 · 8,71 m | 9,48 · 9,48 · 9,49 m | 9,086 m | 9,086 | 30 |
| 8 kg | 18,439 m | 17,32 · 17,32 · 17,33 m | 18,87 · 18,88 · 18,89 m | 18,083 m | 9,042 | 24 |
| 27 kg | 27,658 m | 26,64 · 26,64 · 26,65 m | 29,04 · 29,04 · 29,05 m | 27,818 m | 9,273 | 15 |

**Die Zahl des Richters: `radius_abw_pct` 1,525 % (Soll ≤ 25)** — die größte Abweichung von R ÷ W^(1/3) gegen das Mittel der
drei Ladungen; gegen den gerechneten Radius höchstens 1,931 %, der Exponent der drei Punkte 0,339 (Soll 0,333). Die
Auflösung der Messung ist die Staffel: zwischen zwei Scheiben liegen 9 %, feiner als ± 4,4 % misst der Aufbau nicht.

**Was die Leser der Welt dabei trugen (Konsum):**

- Bruch: 69 von 78 Scheiben fielen durch `_werkBricht(e, plan, [1])` — je Bruch ein Rest-Werk (der Bock) und die Scheibe als
  freier Körper; 0 Fehler, 149 eigene Werke am Ende (80 − 69 + 138), alle durch die EINE Tür `removeArchitecture` abgebaut.
- Wurf: die Scheibe (2,65 kg) bekam dv 2,1 … 8,8 m/s durch `_freiStoss` und flog 0,36 · 0,68 · 0,81 m (Median je Ladung), höchstens
  1,06 m. Das ist unter der Wurfparabel (8,8 m/s aus 0,37 m Höhe: 2,4 m): `_freiStoss` gibt dv dem PUNKT der Hülle,
  der der Quelle zugewandt ist (koerper-frei.js:1260–1287 — das Gesetz des Wagen-Kontakts), ein Teil des Impulses dreht die
  Scheibe. Eine Druckwelle greift an der FLÄCHE an: sie braucht den Impuls durch den Schwerpunkt — ein Eingang, der fehlt.
- Kisten: in 6 m dv 0,28 · 1,07 · 2,20 m/s → Weg 0,008 · 0,062 · 0,235 m; in 12 m dv 0,14 · 0,56 · 1,23 m/s → Weg 0,007 · 0,017 · 0,083 m; nach 6 s (360 Schritte des
  EINEN Lösers `_freiSchritt`) schläft jeder Körper.
- Am Ohr in 30 m: 2,85 · 6,07 · 9,99 kPa Spitze (163 · 170 · 174 dB), Ankunft 0,087 s nach dem Blitz.
- Die Natur-Wand antwortete auf die Probe-Werke wie auf jeden Bau: die Wiese öffnete eine Gasse (Bild), zwei Würfe des
  Felds wichen (`_grundrissRaeumen`: ein felsturm, eine baum_tanne — 3 866 → 3 864 Werke nach dem Abbau, in jedem Lauf
  dieselben zwei). Die Probe schrieb nichts in den Stand (Speicher-Wunsch und Journal ruhten, `git status` leer).

**Läufe:** vier, 22.11. 00:03–00:17, GTX 1050 unter dem Schloss (je < 2 min). Lauf 1 setzte in eine Welt im Boot
(verworfen), Lauf 2 stellte jede Probe 0,5 m in den Boden (`position.y` eines Werks ist sein Fuß + 0,5 m,
koerper-frei.js:82 — als Bild verworfen), Lauf 3 und 4 stehen. Die Radius-Zahl ist in allen vier dieselbe
(1,527 · 1,525 · 1,525 · 1,525 %): sie ist Geometrie der Staffel, kein Rauschen. Abgelegt ist Lauf 4 (`spike/`), das
Bildpaar aus EINER Pose: `spike/bild-vor.png` · `spike/bild-nach.png`.
Vor dem Bruch stehen die Scheiben eines Strahls in zwei versetzten Reihen in der Gasse der Wiese; danach stehen nur die drei fernsten
(29,0 · 31,7 · 34,5 m), die Scherben der nahen liegen hell neben ihren Böcken, die der fernen im Gras.

## 6 · Was die Welle anfassen würde

| Teil | Wo | Größe |
|---|---|---|
| Spalte q, Zeile des Sprengstoffs (Schwarzpulver: KNO₃ · C · S — dem Periodensystem des Kerns fehlen K, N, S), Zeile luft (ρ, c, γ → p0), `druckwelle`, `plattenSpannung` | schmiede-core.js `STOFF_GESETZ` | Kern, additiv, Byte-Beweis (Lehre 11) |
| Zeile des Sprengstoffs und Zeile glas im Wirt | bau-vorlagen.js `_defaultMaterials` | klein |
| der Schreiber `_druckWelle`, der Zünder (Fackel kampf.js:2442, Brennglas, die Front des Brands erreicht die Ladung) | stamm/feld-brand.js | mittel — meine Wurzel |
| Stoß | koerper-frei.js `_freiStoss` | Leib, Tier und Wagen trägt `_stossAuf`; der freie Körper braucht den Eingang durch den Schwerpunkt (klein) |
| Bruch | bau-teile.js | `_werkBricht` trägt; die Querlast im Urteil ist neu |
| **das Fenster mit Zustand** je Öffnung (`LICHT`), Glas-Dicke, die gebrochene Scheibe in jeder Stufe (L0 · Fern-Fenster · Raum-Licht) | fachwerk-core.js + siedlung-* | **der große Teil** — Studio-Guss, Instanz, Goldens |
| Knall (Pegel aus Δp am Ohr, Ankunft R ÷ c) | klang | klein |
| Linse | Familie gate:gegenstand-stoff `--gesetz` (σ_B verstellt → der Radius folgt) | klein |
| Station | k2-same.js Sprosse 2: Soll `radius_abw_pct` ≤ 25, Probe = dieser Spike über die echte Welle | klein |
| EINE Luft | vehicle `FAHR.luft.rho`, klang `FAHRT_OHR.c` läsen die Zeile luft | Folge-Schnitt |

## 7 · Ehrlich offen

- **Die Spike-Zahl beweist das Gesetz nicht.** Jedes reine Z-Gesetz gibt R ∝ W^(1/3) als Identität — 1,525 % messen die
  Staffel der Scheiben und dass Bruch, Stoß und Löser der Welt die Welle tragen. Der Richter der Karte wird erst hart, wenn
  die Ladung ein Stoff mit Masse ist (W aus m · q) und das Fenster ein Leser am Haus.
- **Die Impuls-Formel ist an der Quelle nicht geprüft** (Kinney & Graham 1985 nicht gelesen; Überdruck-Formel und
  Platten-β sind gegen veröffentlichte Werte geprüft). Wurf-Weiten und Kisten-Wege der Probe hängen an ihr.
- **Freies Feld:** keine Abschattung hinter Haus oder Hang, keine Boden-Reflexion (eine Ladung am Boden wirkt wie die
  1,8-fache), kein Reflexions-Faktor an der getroffenen Fläche (2 … 8) — Lehrbuch-Werte, nicht nachgelesen. Welche davon die Welle trägt, entscheidet der Schnitt.
- **quarz steht für Glas:** σ_B ist in beiden Zeilen 5 · 10⁷ Pa — für Kalk-Natron-Glas im Fenster eher die obere Kante
  (Biegefestigkeit 30 … 50 MPa, mit Kratzern darunter — Lehrbuch-Wert, nicht nachgelesen); bei doppelter σ_B fiele Z* von 9,22 auf 5,84.
- **Der Stoß an freien Körpern** braucht den Eingang durch den Schwerpunkt (siehe § 5, Wurf) — § 6 nennt ihn.
- **Kein Bruch durch Querlast:** die Probe ruft `_werkBricht` selbst; ein Werk, das unter dem Druck der Welle sein Urteil neu
  fällt, gibt es nicht.
- **Luft:** p0 folgt aus ρ und c zweier Kerne mit γ 1,4 aus dem Lehrbuch (100 842 Pa); die Probe rechnete mit 101 325 Pa
  (Unterschied im Radius 0,2 %).
- **Nicht gezählt:** die Studios (ein Sprengstoff als Bauplan der Schmiede oder des Fachwerks), der Mitspieler (das Ereignis
  müsste als Akt reisen), die Kosten eines Ereignisses mit 100 Betroffenen (ungemessen).
