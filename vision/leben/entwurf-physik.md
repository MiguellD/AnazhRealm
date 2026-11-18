# Entwurf PHYSIK ZUERST — die EINE Samen-Entscheidung (main 18058dba, nur gelesen)

**Entscheidung.** Gespeichert wird je Lebewesen nur sein ERBE: Zuchtwerte in σ-Einheiten, zuerst die eine Achse ln M.
Den Körper speichert niemand. Er ist die reine Funktion `leib = f(erbe, umwelt(ort, zeit), alter)`, und die Physik rechnet
ihn aus: Allometrie mit Masse M und Schwere g, Wachstum nach West–Brown–Enquist, Lebensdauer nach Sacher/Calder und
Bein-Querschnitt unter der Last M·g. Dieselbe Erbzahl ergibt so auf einem anderen Planeten einen anderen Leib, und dafür
braucht es keine weitere Code-Zeile.
Art, Individuum und Ahn sind Hash-Adressen aus (Same, Ort, Zeit, Mutter). Das Kind erbt nach dem Infinitesimal-Modell aus
dem Datensatz der Mutter. Die vier Größen-Bänder, der netId-Wurf und das eine Todesalter für alle Arten fallen.
Eine Art ist die stabile Lösung (θ) der Umwelt an ihrem Ort. Ab Welle 2 sind die vier Gattungen nur noch Erd-Anker dieses θ.

Selbst geprüfte Nähte (main 18058dba): tetrapoda-core.js:39 (GESTALTEN_JE_REZEPT 1), :62 (GATTUNGEN), :253–260
(VERHALTEN.groessen), :839–865 (deriveTierParams, legMuscle ∝ (size/2,4)^0,67 :851, skullR ∝ ^0,25 :865), :1331 (GANG_GESETZ
g 9,81), :3943 (MASSSTAB ρ 1000), :4062–4084 (artGewichte, σ² 0,01; fern: die nächste trägt allein). stamm/koerper-leib.js:1022–1032
(_ofenKreaturDials, Memo-Key :1033 recId|lod|JSON), :2545–2557 (_creatureBodySize = FNV der Kennung → Band), :489–493 (Gang
liest `state.gravity`). stamm/kreatur-leben.js:140–153 (netId-Zähler, Größe aus netId, uniform setScalar), :1984–1996 (Geburt
ohne Eltern, bs aus rng-Band), :2341–2366 (_bestandKg = leibV·bs³·ρ, _gattungLeib), :2420–2422 (Alterstod: der Älteste nach
FAUNA_MAX_AGE_MS, daten.js:176). stamm/kreatur-verhalten.js:586–610 (_kreaturGroesseSetzen, der EINE Größen-Schreiber, klemmt
auf die Bänder), :770–780 (_leibMasse rechnet mit scale.x·y·z, ist also schon für anisotrope Skala gültig). stamm/feld-dsl.js:961
(DSL-Op `gravity` setzt state.gravity). planet-core.js:263 (PLANET_ERDE), :311–327 (planetPlan-Würfe); voxel-worker.js:1159
(der Spielpfad nimmt immer PLANET_ERDE). stamm/bau-teile.js:1479 (_rollGenome FNV je Achse).

---------------------------------------------------------------------------------------------------------------------------
## (1) DAS GESETZ — Daten, Funktionen, Adressen

### 1.1 Umwelt U — Funktion von (Ort, Zeit); nichts davon wird gespeichert
| Feld | Einheit | Quelle Welle 1 | Quelle Welle 2+ |
|---|---|---|---|
| g | m/s² | \|state.gravity\| (DSL `gravity`, feld-dsl.js:961; Erde 9,81) | plan.koerper.g (planet-core.js:314), wenn voxel-worker.js:1159 den Körper des Samens nimmt |
| T | °C Jahresmittel | — (die Heimat ist konstant, gelaende-core TEMPERATUR :1313) | planetKlimaR(...).tJahrC (planet-core.js:1950) über ortGesetz (gelaende-core.js:5843) |
| P | mm/a | — | planetKlimaR(...).niederschlagMm |
| NPP | g C·m⁻²·a⁻¹ | — | Miami-Modell min(3000/(1+e^(1,315−0,119T)), 3000(1−e^(−0,000664P))) (Lieth 1975) |
| ρ_Luft | kg/m³ | — | Barometrie aus g, T und Säule (fehlt im Kern, planet-physik (3)): Welle 3 |

### 1.2 Erbe — der EINZIGE gespeicherte Teil, im Bestand-Datensatz (kreatur-leben.js:1996)
`t = { id, soul, g, a, mu, alterS, x, z, v }`; `bs` fällt als gespeichertes Feld und wird zur Ableitung.
- `a` [σ]: Zuchtwert ln M (Achse 0). Welle 1 trägt genau diese EINE Achse, weil nur sie heute einen Leser hat. Weitere
  Achsen (Bein, Hals, Statur, Fell-Helle, Scheu) kommen erst, wenn ihr Leser im selben Commit landet (Welle 3,
  Instanz-Achsen). Ein Feld ohne Leser wäre Existenz ohne Konsum.
- `mu`: Kennung der Mutter (Ahn); 0 = Gründer.
- Phänotyp-Abweichung e [σ]: wird nie gespeichert, sondern = N(0,1) aus H(id, "umwelt") (Box-Muller über zwei FNV-Achsen).

### 1.3 Konstanten (jede mit Anker; „unsicher" = Spanne der Literatur, Wert gewählt)
| Name | Wert | Anker |
|---|---|---|
| H2_MORPH | 0,46 | Mousseau & Roff 1987 (Heredity 59:181), Morphologie |
| SIGMA_LNM | 0,15 | Massen-CV 10–30 % innerhalb einer Population (Yablokov 1974) — unsicher |
| VM_ANTEIL | 1e−3 (V_M/V_E je Generation) | Houle et al. 1996; Lynch & Walsh 1998 — unsicher |
| M0_ANTEIL | 0,06 (Geburtsmasse/Adultmasse) | Blueweiss et al. 1978 (Oecologia 37:257), Huftier-Größenordnung — unsicher |
| WBE_TAU | 0,06 · t_max | West, Brown & Enquist 2001 (Nature 413:628), Form der Kurve; der Anteil ist unsicher (Reife bei ~0,22 t_max) |
| T_MAX | 11,6 · M^0,20 a | Sacher 1959; Calder 1984 — Konstante unsicher |
| SPIELJAHR_S | 2100 s / T_MAX(64 kg) = 78,9 s | einziger Spiel-Stellwert, die Zeitraffung. Er hält das heutige Mittel von 35 min (daten.js:176) beim Wolf |
| BEIN_EXP | 0,36: Bein-⌀ ∝ (M·g)^0,36 | Alexander, Jayes, Maloiy & Wathuta 1979 (J Zool 189:305) d ∝ M^0,36; dass die Last als M·g eingeht, ist abgeleitet (konstante Knochenspannung, Biewener 1989 Science 245:45) — unsicher |
| G_ERDE | 9,81 m/s² | GANG_GESETZ.g (tetrapoda-core.js:1331) |
| Welle 2: KLEIBER | B = 3,4·M^0,75 W | Kleiber 1932 |
| Welle 2: DAMUTH | D ∝ M^−0,75 | Damuth 1981 |
| Welle 2: R_MAX | r ∝ M^−0,25 | Fenchel 1974 — Konstante unsicher |
| Welle 2: M_MAX(g) | M_max ∝ g^−3 bei geometrischer Ähnlichkeit (σ ∝ g·M^⅓) | abgeleitet; Erd-Wand 5–8·10⁴ kg — unsicher |

### 1.4 Funktionen (Kern, rein, ohne Zustand und ohne Wanduhr)
```
artId(same, gattung)                       → u32  FNV(same|"art"|gattung)         (Welle 2: FNV(same|ahnId|k))
indId(same, region, tGeburtS, muId, k)     → u32  FNV(same|region|tGeburt|mu|k)   ersetzt key+"."+(++R.seq) und netId
normal(id, achse)                          → N(0,1)  Box-Muller aus _rollGenome-Achsen (bau-teile.js:1479)
erbeKind(aMutter, aVater, idKind)          → a  = (aM+aV)/2 + √(H2/2)·normal(id,"seg") + √(VM_ANTEIL·(1−H2))·normal(id,"mut")
erbeGruender(same, region, tS, k)          → a  = √H2 · normal(FNV(same|region|tS|k), "a")
masseAdult(Mart, a, id)                    → kg   Mart · exp(SIGMA_LNM·(a + √(1−H2)·normal(id,"umwelt")))
masseJetzt(M, alterS)                      → kg   M·[1 − (1 − M0^¼)·e^(−t/τ)]⁴,  t = alterS/SPIELJAHR_S, τ = WBE_TAU·T_MAX(M)
lebensdauerS(M)                            → s    T_MAX(M) · SPIELJAHR_S
reife(m, M)                                → (m/M)^⅓ ∈ (0,1]; Guss-Stufe = reife < 0,6 ? "jung" : "adult"
beinLast(g, size)                          → (size/2,4)^0,08 · (g/G_ERDE)^0,36    (0,08 = 3·(0,36−⅓): M ∝ size³)
leibAusErbe(t, U, gattLeib)                → { kg, bs, stufe, dials:{g, reife} }  bs = (kg/(gattLeib(stufe).v·ρ))^⅓
```
`deriveTierParams(d)` (tetrapoda-core.js:839) bekommt zwei neue Eingänge, `d.g` und `d.reife`:
- Beinmuskel: `0,42·beinLast(g, size) + (build−0,5)·0,3` statt `0,42·(size/2,4)^0,67 + …` (:851).
- Kopf relativ × reife^−0,75. Das folgt aus dem Kern-Gesetz Schädel ∝ size^0,25 (:865): Kopf/Leib ∝ L^−0,75.
- Bein relativ × reife^−0,5 (neugeborene Huftiere tragen 60–70 % der Adult-Beinlänge bei ~40 % der Adult-Länge — unsicher).
`artGestalt` mischt weiter auf den unveränderten Art-Dials. reife wird ERST NACH der Mischung angewandt, weil ein Jung-Wolf
mit size·0,58 sonst als Fuchs gemischt würde (selbst gerechnet: w_Fuchs ≈ 5·10⁻³ gegen w_Wolf ≈ 10⁻⁵).

### 1.5 Adress-Schema (Art · Individuum · Ahn) als reine Funktion
- **Art**: Welle 1 `artId(same, gattung)`, Welle 2 Knoten `FNV(same, ahnArt, k)`. Ihr θ (Masse, Kost, Bein) kommt aus U am Ort
  der Epoche: `θ_lnM = ln M_anker(nische) − 3κ·ln(g/G_ERDE)·[M > M_MAX(g)] + β_T·(T − T_E)`. Die vier Gattungen sind dann
  nur noch die Erd-Anker der Nischen (Kost 0 / 0,5 / 1 × Größen-Gilde).
- **Individuum**: `indId(same, region, tGeburtS, muId, k)`. Damit hängt es an der Abstammung und an der Welt-Uhr, nicht am
  Sitzungs-Zähler (kreatur-leben.js:140) und nicht an R.seq.
- **Ahn**: `mu` im Datensatz. Gründer (muId 0) entstehen nur, wenn in der Region keine Mutter derselben Art lebt
  (Einwanderung). Ihr Erbe ist `erbeGruender(same, region, t, k)`, also Funktion von (Same, Ort, Zeit).
- **Leib-Kennung = indId**: Größe, Name, Wander-Kurs und Peer-Sicht lesen sie (die Peer-Größe trägt der Sender als `kg`, die
  Gegenseite würfelt nicht mehr).

---------------------------------------------------------------------------------------------------------------------------
## (2) DIE EINE QUELLE

**tetrapoda-core.js, neuer additiver Abschnitt `LEIB_GESETZ`.** Er enthält Konstanten 1.3, Funktionen 1.4 und die zwei
Eingänge in deriveTierParams. Kein Zwilling im Stamm: Der Stamm ruft nur `_verhaltenGesetz()`/`window.__tetrapodaCore`.
Pflanzen bekommen in Welle 2 die analoge Leib-Physik in phyto-core.js (Greenhill), lesen aber `erbeKind`/`indId` aus
DIESEM Abschnitt, damit es kein zweites Erbe gibt.

Leser (jede Stelle):
- stamm/kreatur-leben.js:1984–1996 Geburt → `erbeKind`/`erbeGruender`/`indId`; Mutter = Erwachsene derselben Art aus R.tiere
  über den Region-Strom (:2406). Ein Jungtier entsteht am Anker seiner Mutter, v = Verband der Mutter.
- stamm/kreatur-leben.js:2344 `_bestandKg` → `masseJetzt(masseAdult(...), alterS)` statt leibV·bs³·ρ.
- stamm/kreatur-leben.js:2401–2424 Takt: nach `alterS += 10` folgt bei gezeichneten Leibern mit Δbs > 2 %
  `_kreaturGroesseSetzen` (Wachstum). Den Alterstod bestimmt `alterS > lebensdauerS(kg)` je Tier, nicht mehr der Älteste nach
  35 min (:2420–2422).
- stamm/kreatur-leben.js:149 spawnCreatureAt: ohne opts.kg ein Gründer-Erbe aus indId, nie aus netId.
- stamm/kreatur-leben.js:1902 Blick-Kugel: kg des Tiers statt `groessen.at(-1).max`.
- stamm/kreatur-verhalten.js:586–610 `_kreaturGroesseSetzen`: Die Klemme auf die Bänder fällt. Bleibt eine Kante, dann nur
  die Physik-Wand M_MAX(g).
- stamm/koerper-leib.js:1022 `_ofenKreaturDials(recId, ov)`: dials ⊕ `{g: |state.gravity| auf 0,01, reife: Stufe}`. Der
  istDefault-Vergleich gilt gegen basis ⊕ {g: 9,81, reife: 1}; bei g = 9,81 und adult ist der Guss byte-gleich (beinLast = 1),
  und die Platte bleibt.
- stamm/koerper-leib.js:2873 `_kreaturDiet` liest über `_ofenKreaturDials` (der Kost-Zwilling fällt im selben Schnitt).
- stamm/kreatur-gehege.js:64 Gehege: Gründer-Erbe aus `"g"+p.id` über `erbeGruender`.
- stamm/netz-p2p.js:1487/1527 Peer: Der Sender schickt `kg` und `stufe`, der Empfänger setzt sie.
- stamm/feld-leben.js:2185–2196, 2252 Stand und p2p: tragen `a`, `mu` statt `bs`.
- foundry-core.js:8178 bakeTierInstance, bauTier :4265, fellStreu, fellFarbe, tierAuge: Sie lesen deriveTierParams und
  bekommen g und reife ohne neue Leser-Zeile.

**FÄLLT beim Namen (Welle 1, ganz):**
- tetrapoda-core.js:253–260 `VERHALTEN.groessen` (vier Bänder, Länge ×4,5, Masse ×91)
- stamm/koerper-leib.js:2542–2557 `_creatureBodySize` (FNV-Wurf der Kennung) samt Kommentar :3493
- stamm/kreatur-leben.js:1993 Band-Wurf der Geburt `"b"+key+"."+rng`; :149 Größe aus dem netId-Zähler
- stamm/kreatur-gehege.js:64 und stamm/netz-p2p.js:1527 (Peer würfelt eine andere Größe als der Bestand trägt)
- stamm/daten.js:176 `FAUNA_MAX_AGE_MS` (35 min für Fuchs = Bär) und kreatur-leben.js:2421 der Älteste als Alterstod-Wahl
- stamm/kreatur-verhalten.js:590–596 die Band-Klemme; kreatur-leben.js:1902 `groessen.at(-1).max`
- tetrapoda-core.js:851 `(size/2,4)^0,67` (wird zur Statik `beinLast`)
- stamm/koerper-leib.js:2873 `_kreaturDiet` als eigener Weg
- Prüf-Leser der Bänder: scripts/diag-kreatur-leben.cjs:1568–1571, scripts/diag-studio-uebergabe.cjs:307,
  scripts/playtest/gelaende-boden.cjs:1791
Welle 2 fällt: GATTUNGEN als Art-Quelle (:62, bleibt nur als Erd-Anker), kopfJeHa 25 / geburt 0,1 / tod 0,2 (:2197–2208,
dann Damuth/Fenchel), verdauSec 600 (:176, dann ∝ M^0,25), fluchtDistanzM- und haeufigkeit-Zeilen (aus M und Kost), herde.wurf
als Kopfzahl Erwachsener, Äsung = auraAt.lebendig (kreatur-leben.js:2101, dann NPP), ORT_WUCHS-Erdkalender, die Heimat ohne
Planet.

---------------------------------------------------------------------------------------------------------------------------
## (3) DREI FÄLLE

**F1 (Bild, Herde): Die Herde ist eine Familie, nicht ein Würfelbecher.** An der Hirsch-Herde am Messort tiere.mensch#1
(Third, 20 m, Mittag) liegen die Erwachsenen innerhalb e^(±2·0,15/3) = ±10 % Länge. Heute streuen sie bis ×4,5 und können
einen Giganten enthalten. Neben der Mutter steht ein Kitz: Länge ≈ 0,4–0,6 der Mutter, Kopf relativ ×1,5–2, Beine relativ
länger. Zahl: max/min Widerrist der Adulten ≤ 1,25 an 30 Saaten. Nach einer Spielstunde (≈ 46 Spieljahre) ist das Kitz
gewachsen (masseJetzt).
**F2 (Bild, fremde Schwere): derselbe Wolf unter g = 3·9,81** (DSL `gravity 29.43`). Bein-⌀ / Bein-Länge steigt
×3^0,36 = 1,48 (±10 %), die Masse der Art bleibt gleich (M ≪ M_MAX). Gangtempo √(gL) und Gangwechsel folgen schon heute
state.gravity (koerper-leib.js:489). Bildpaar gleicher Wolf, gleiche Kamera, g 9,81 ↔ 29,43; Gegenprobe g 0,3·9,81 → ×0,65.
**F3 (Falsifikation):** Der Entwurf ist widerlegt, wenn EINE dieser Beobachtungen eintritt:
(a) Die Regression ln M Kind auf ln M Mutter über ≥ 10 Generationen an 30 Saaten liegt außerhalb [0,15; 0,32] (erwartet
H2/2 = 0,23), oder mit „Erbe aus" (H2 = 0) nicht bei ≈ 0.
(b) Unter g = 3·g_E ändert sich das Bestand-Mittel ln M einer Art mit M ≪ M_MAX. Dann trägt die Masse nicht die Physik.
(c) Die Bein-Dicke der vier Erd-Arten nach `beinLast` fällt aus ANATOMIE_SOLL (tetrapoda-core.js:4045, gate:tier-anatomie).
Dann erklärt die Statik allein den Bär-Unterschied nicht. Die Aussage „build ist eigene Erbachse" wäre dann zu beweisen,
statt den Exponenten zu drehen.

---------------------------------------------------------------------------------------------------------------------------
## (4) PREIS (aus lesen-preis-menge; Kosten an Schirm + Änderung)

**Das 10 001. Individuum:**
- Bestand: Datensatz +2 Felder (a: 8 B, mu: Kennung), etwa 120 B. 10⁴ Tiere ≈ 1,2 MB, im Stand nur die nahen Regionen.
- Takt: O(1) je Tier für masseJetzt. `_kreaturGroesseSetzen` läuft nur bei gezeichneten Leibern mit Δbs > 2 %; das sind
  ≤ 20 Leiber (dirigent-kern.js:280) und höchstens einmal je 10-s-Takt.
- Bild: Die Größe bleibt eine Skala in der Instanz-Matrix des Satzes (stoff-gang.js:282), also 0 Befehle, 0 Güsse. Die
  Erbe-Variation kostet nie Geometrie.
- Eltern-Wahl: O(n) je Geburt in der Region. Teurer bleibt das bestehende O(n²) in `_bestandJagd` (kreatur-leben.js:2171).

**Die Stufe „jung":**
- je Art +2 Vorlagen (L0, L1), jeweils ~0,9 s Faden kalt und ~2,4–4,8 MB.
- Sie werden NUR bestellt, wenn ein Jungtier am Schirm geboren wird, über `_ofenVorlageBestellen`
  (koerper-leib.js:2192); nie im Boot-Vorrat (:2169–2185), sonst würde Pflicht B schwerer.
- Bis die Vorlage da ist, wartet der Leib wie heute auf `_kreaturenBereit` (fail-closed). Das Tier lebt im Bestand weiter.

**Die 101. Art (Welle 2/3):**
- Sie kostet nichts, solange sie nicht im Schirm steht. Voraussetzung: Der Boot-Vorrat gießt nur die Arten des Orts statt
  aller Seelen (koerper-leib.js:2169–2185 fällt in Welle 2).
- Steht sie im Schirm, kostet sie 2–4 Vorlagen (≤ 3,6 s Faden kalt, ≤ 19 MB) und bis 4 Satz-Befehle.
- Die Zahl der Arten am Schirm folgt aus DAMUTH × Sichtfläche (D ∝ M^−0,75), nicht aus der Planet-Größe.
- Hochrechnung 10² Arten im Bild: ~960 MB Heap (preis-menge (5)), gegen eine Ort-Grenze von 400 MB. Das zahlt erst der
  Leib-Raum je Bauplan (Welle 3: eine Vorlage + Formziel-Tafel, Art und Individuum als Instanz-Punkt wie LEIB_RAUM des
  Menschen, stoff-gang.js:47/608). Ohne ihn ist 10² nicht bezahlbar, und das steht hier offen.

**Ein anderes g:**
- ein Guss je Art und g-Wert, gerastert auf 0,01, nur nach einer Änderung. Eine Änderung durch das Wort `gravity` gießt die
  Arten am Schirm neu: 4 Arten × 2 Stufen × 0,9 s im Faden.

---------------------------------------------------------------------------------------------------------------------------
## (5) WELLEN

### Welle 1 — ein Tag, das Bild ändert sich (4 Bahnen, ausschließlicher Datei-Besitz, Landung im selben Zug)
Die Signaturen von 1.4 sind der Vertrag zwischen den Bahnen. Die Bahnen bauen parallel und landen gemeinsam, weil B und C die
Leser sind, deren Zwillinge A in derselben Landung tötet.

**Bahn A — Kern** · Datei: `tetrapoda-core.js` (allein).
- Schnitt: LEIB_GESETZ (1.3, 1.4) additiv; deriveTierParams liest g und reife (:851 wird beinLast, Kopf/Bein × reife nach
  artGestalt); VERHALTEN.groessen :253–260 fällt; Selbstprüfung im Kern (masseJetzt monoton, erbeKind-Erwartung = Eltern-Mittel).
- Bildpaar: Labor worlds/tetrapoda (liest deriveTierParams) mit Wolf, Seite und Schulterhöhe. main: Wolf adult. Kopf: Wolf
  adult, Jung-Wolf (reife 0,5) und Wolf g×3 nebeneinander. Zu sehen: großer Kopf und lange Beine beim Jungen, dicke Beine
  bei g×3.
- Byte-Beweis: Guss bei g 9,81 / reife 1 byte-gleich zu main (Abdruck `--gegen 18058dba`, außerhalb Tier gleich).
- Sprossen: leben.evolution.fremde-physik#1 (Gesetz), leben.tiere.lebenszyklus#2 (Gestalt).
- Stopp: Guss byte-gleich bei Erde/adult, beinLast(3 g) = 1,48 ± 0,01, Kern-Selbstprüfung GRÜN.

**Bahn B — Leib** · Dateien: `stamm/koerper-leib.js`, `stamm/kreatur-verhalten.js`, `stamm/netz-p2p.js`.
- Schnitt: _creatureBodySize fällt. _ofenKreaturDials trägt g (aus state.gravity) und die reife-Stufe; istDefault gilt
  gegen Erde/adult. _kreaturDiet geht über _ofenKreaturDials. Die Klemme in _kreaturGroesseSetzen fällt. Der Peer setzt
  kg/stufe vom Sender. Die jung-Vorlage wird nach Bedarf bestellt (_ofenVorlageBestellen).
- Bildpaar: Wiese am Spawn, Third 15 m auf ein Wolfsrudel. main: g 9,81. Kopf: nach dem Wort `gravity 29.43`. Zu sehen:
  dieselben Wölfe mit Beinen ×1,48, Gang schwerer.
- Sprossen: leben.evolution.fremde-physik#1 (im Spiel).
- Stopp: Grep auf `_creatureBodySize|groessen` in stamm/ ergibt 0. Masse eines Leibs = masseJetzt ±1e−9. Beim Mitspieler
  dieselbe kg wie beim Besitzer.

**Bahn C — Bestand und Erbe** · Dateien: `stamm/kreatur-leben.js`, `stamm/kreatur-gehege.js`, `stamm/daten.js`,
`stamm/feld-leben.js`.
- Schnitt: Geburt aus Mutter und Vater der Region (erbeKind) bzw. als Gründer; Kennung indId; Datensatz {a, mu} statt bs;
  _bestandKg aus masseJetzt; Wachstum im Takt; Alterstod je Tier aus lebensdauerS; FAUNA_MAX_AGE_MS fällt; :149 und :1902;
  Gehege-Gründer; Stand und p2p tragen a und mu.
- Bildpaar: Hirsch-Herde am Messort tiere.mensch#1, Third 20 m, Mittag, gleiche Saat. main: 3–7 Erwachsene mit streuender
  Länge. Kopf: Kitze an den Müttern, Erwachsene gleich groß ±10 %; Zeitraffer 1 Spielstunde, das Kitz ist gewachsen.
- Sprossen: leben.evolution.erbe#1, leben.tiere.lebenszyklus#2 (Jungtiere ≥ 10 % der Herde).
- Stopp: Eltern-Kind-Steigung im Zahl-Bestand an 30 Saaten 0,23 ± 0,08; „Erbe aus" < 0,03; der Hirsch hat eine andere
  Lebensdauer als der Fuchs (lebensdauerS(94) / lebensdauerS(15) = 1,44).

**Bahn D — Messung und Prüf-Leser** · Dateien: `scripts/diag-kreatur-leben.cjs`, `scripts/diag-studio-uebergabe.cjs`,
`scripts/playtest/gelaende-boden.cjs`.
- Schnitt: Die Band-Prüfung (:1568) wird zur Erbe-/Wachstums-Probe in der bestehenden Familie gate:kreatur-leben.
  Selbsttest: Das Band-Gesetz zurückgesetzt muss ROT am Namen geben. Zwei Leser der Bänder ziehen auf kg/indId um.
  Die R2-Saat-Statistik (≥ 30 Saaten) plus 5 Third-Bilder aus den Bildpaaren von B und C.
- Sprossen: Belege für erbe#1 und fremde-physik#1.
- Stopp: ≤ 3 min CI. Die Zahlen von F1 (max/min ≤ 1,25), F2 (1,48 ± 10 %) und F3a stehen im Commit.

### Welle 2 — Art = stabile Lösung am Ort
1. Die Heimat liest planetOrt am Anker (Δ ≡ 0). U trägt T, P und NPP (Miami) über ortGesetz. Die Äsung wird NPP statt
   auraAt.lebendig.
2. θ_lnM je Nische aus U (Bergmann β_T, Wand M_MAX(g)). GATTUNGEN und ART_GESTALT werden Erd-Anker. Arten-ID = Baumknoten.
3. Lebenslauf aus M: verdauSec ∝ M^0,25 (Kleiber), r ∝ M^−0,25, K ∝ M^−0,75 (Damuth), Wurfgröße je Mutter.
   fluchtDistanzM, haeufigkeit und herde.wurf leiten sich aus (M, Kost) ab.
4. Der Boot-Vorrat gießt nur die Arten des Orts. Der Riss wählt das Opfer nach Fluchttempo v_max(M) (Garland 1983) statt
   des Ältesten: Die Physik selektiert.
5. Pflanzen: artPhaenotyp(erbe, U) mit Greenhill H_krit ∝ (E/(ρ_holz·g))^⅓·D^⅔. Erbe und indId aus LEIB_GESETZ.
   forestNicheWeights fällt.

### Welle 3 — Individuum ganz eigen, fremde Planeten
1. Leib-Raum der Tiere je Bauplan: eine Vorlage plus Formziel-Tafel. Erbachsen Bein/Hals/Statur/Fell und reife stetig auf
   der GPU, wie raum:true (stoff-gang.js:608). Die jung-Stufe als Guss fällt.
2. Der Satz liest Individuen aus dem Bestand. Die Kappe von 20 (dirigent-kern.js:280) wird zur Bedeutungs-Wahl, damit
   10⁴ Tiere im Schirm möglich werden.
3. voxel-worker.js:1159 nimmt den Körper des Samens (g, Tag, Stern). ρ_Luft kommt aus der Barometrie, Flug nach Pennycuick
   (v_min ∝ √(Mg/ρS)). Flieger-Anteil folgt ρ/g (fremde-physik#2).
4. Q10/Arrhenius: Das Lebenstempo folgt T (Gillooly 2001, fremde-physik#4). Fell-Länge folgt T (Allen/Bergmann).
5. Vögel, Fische und Bestäuber bekommen Individuen mit Erbe (sie sind heute Zell-Funktionen ohne Leben).

---------------------------------------------------------------------------------------------------------------------------
## (6) EHRLICH — was dieser Winkel nicht trägt

- **Stammbaum und Artbildung:** Wann eine Linie sich spaltet, die Baumgestalt (Aldous-β ≈ −1, Colless), Vikarianz und Drift.
  Physik liefert θ und Wände, nicht die Abfolge der Arten. Das gehört dem Evolutions-Winkel; mein `artId` in Welle 1 ist
  noch Gattung × Same.
- **Selektion als Kraft:** In Welle 1 liest keine Todesursache das Erbe (der Riss nimmt weiter den Ältesten). Damit fällt
  muster#1 nicht. Erst die Physik-Selektion in Welle 2 (Fluchttempo) schafft das, und ob die Richtung zu „Räuberdruck →
  kleiner" passt, ist offen.
- **Die Konstanten:** Mehrere sind als unsicher markiert (SIGMA_LNM, M0, WBE_TAU, BEIN_EXP mit g, Juvenil-Bein −0,5).
  Die Last als M·g ist abgeleitet, nicht gemessen. Falsifikation F3b/F3c ist die Wache dafür.
- **Erbachsen ohne Physik:** Scheu, Sozialität und Fell-Muster (zivilisation#1, erbe#2) haben keine Physik. Sie brauchen die
  Instanz-Achsen (Welle 3) und den Preis-Winkel (Leib-Raum für Tiere, Satz aus dem Bestand).
- **Menge:** 10² Arten oder 10⁴ Leiber im Schirm trägt dieser Entwurf nicht vor Welle 3. Der Preis-Winkel muss den Leib-Raum
  der Tiere bauen.
- **Panel-Richter:** lebenszyklus#2 (Panel ≥ 0,7) und tiere.arten#2 sind ohne Prüfer-Satz R11 und Korpus nicht richtbar.
  Welle 1 liefert dort das Bild, nicht den Punkt.
- **Wachstum mit Sprung:** Mit zwei Guss-Stufen springen die Proportionen bei reife 0,6. Stetig wird das erst mit Welle 3.
