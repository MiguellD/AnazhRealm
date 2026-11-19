# Bauplan „EINE Skala" — die Licht-Werte der Welt in EINEM physikalischen Maßstab, vor-belichtet (GTX 1050, 19.11.)

Grundlage: Zensus `quellen/zensus-strahler.md` (e49829453), Spike 6 `quellen/spike6-vorbelichtung.md` (6b1f75282), Tafel C
`quellen/tafel-c.md` (9f5903806), die Urteile des Koordinators vom 19.11. Zwei Wellen, in dieser Reihenfolge: **1 die Skala**,
**2 das Auge** — nie in einer. Der Spike-Zweig `w28-licht-spike` (c7892db23) ist Messgerät und Vorlage, kein Bau.

## Die Soll-Tafel der Welle 1 (steht VOR dem Bau; jede Zeile mit Zahl, vorher ↔ nachher im selben Boot)

| # | Zeile | Messung | FÄLLT, wenn |
|---|---|---|---|
| S1 | Mittag bildgleich | Mess-Wiese, Boden-Ausschnitt, main ↔ Welle | ΔLuma > 1 oder k ≠ k von main ± 0,5 % |
| S2 | Mittag mit Himmel: der neue Stand | oberes Bild-Drittel | ≠ 138,7 ± 1 (der benannte Stand nach den Schwellen im belichteten Raum; main 142,0) |
| S3 | Nacht darstellbar | freie Mond-Wiese 0,26 lx, verschiedene Puffer-Werte am Boden je Kanal | < 100 (Spike: 132 / 153; vorher 2–3) |
| S4 | k-Sprung | k × 2 bei stehender Kamera, erste Lesung der Kette | außerhalb ± 2 % (Spike ohne Umrechnung: −22 %) |
| S5 | Kette nachts | Z der Mess-Kette an der Mond-Wiese gegen die Rechnung am Prozessor (Zentrum/Kegel aus dem Szenen-Ziel) | Z = 0 oder Abweichung > 5 % |
| S6 | kein Leser ohne k_vor | Absenz-Probe: jeder Leser des Szenen-Ziels (Liste unten) teilt durch k_vor oder steht benannt im belichteten Raum | ein Leser des Ziels ohne beides |
| S7 | Streulicht am Deckel | Quelle am Format-Deckel (Flamme bei Nacht): Ring um die Quelle | Punkt-Blöcke (ein Abgriff-Muster) sichtbar; gemessen: Zahl verschiedener Maxima im Ring > 1 |
| S8 | Rückstrahl ohne Selbstleuchter | Herd nah: Rückstrahl-Boden (`rueckstrahlLeser.boden`) mit und ohne brennende Flamme im Bild | Verhältnis > 1,1 |
| S9 | tote Zahlen | Absenz-Grep über `__codeOf`: `luxJeEinheit`, `0.224`, `einheitCdM2` als Schalter, `PHYS` | ein Treffer |
| S10 | jede Quelle physikalisch | die Tafel der Quellen unten: Wert im Code = Tafel-Wert ÷ 16 090 | eine Quelle der 44 ohne Zeile oder mit eigenem Faktor |
| S11 | Preis | GPU-Zeit des Bilds, selbes Boot AN ↔ AUS, ≥ 4 Boote, Mess-Wiese | Mittel > 0,05 ms (Spike: −0,014) |
| S12 | Herd nah ist ein Bild | Herd 3,5 lx in 2 m, Mond 0,26 lx, Flamme 13 800–16 000 cd/m², Glimmen 0,1–1 cd/m²: Gras in 4 m, Ring, Wald | Wald oder Halme über dem Ring; ob das Gras in 4 m lesbar bleibt, ist BEFUND für Welle 2 (m, Ort-Term), kein Fall |

Bildpaare (main ↔ Welle, 1 920 × 1 080, das Auge gehalten): Mittag Mess-Wiese · Mittag mit Himmel · Mond-Wiese frei · Herd nah ·
**Innenraum** `-664 (Boden 39,4) +1,6 -850` im Start-Dorf (Raum-Licht der Decke 0,0081, Feld 0,0122; heller Raum zum Vergleich
`-698 +1,6 -864`: 0,0675) · **Kronendach** `-330 +1,7 -1085` (Blick nach oben: 0,142 Einheiten gegen 0,704 frei; Boden 0,0432
gegen 0,277 frei = 15,6 %, −2,7 EV). Beide Orte sind vermessen (Raster-Lesung am Szenen-Ziel bzw. `_raumAmAuge`), die
Blickrichtung fürs Bild wird am ersten Bild gewählt.

## Welle 1 — die Pflicht-Teile (die Klasse fällt ganz, keiner bleibt als Rest)

| Teil | Stelle (Datei:Zeile am Spike-Kopf) | Schnitt |
|---|---|---|
| P0 Vor-Belichtung | `stamm/bild-kosten.js` MRT `output` des Szenen-Passes (≈ :2533) | `output × k_vor`, gedeckelt am Format (EINE Stelle, auch die Scheiben-Ausnahme); Ausgabe `k ÷ k_vor` im Faktor vor `_schirmKurve` |
| P1 Geschichte | `stamm/bild-kosten.js:1896` (`hist = geschichte.sample(gUV)`) | `hist.rgb × k_jetzt ÷ k_davor`, direkt nach der Lesung (gilt für Klemme und Mischung; `hist.a` ist Tiefe und bleibt); ein Uniform k_davor fehlt heute |
| P2 Mess-Kette | `_augeKetteZeichnen` Stufe 0 | trägt belichtete Werte, der Deckel steht im belichteten Raum (= Schulter), geteilt wird am Prozessor nach der Rücklese |
| P3 Rückleser | Spiegel-Pass `stamm/bild-sicht.js:999` · Rückstrahl `stamm/bild-schatten.js:184` · Wasser `stamm/wasser-hydro.js:833` (liest den Spiegel) · Albedo-Eichung `scripts/lib/albedo-tafel.cjs:234` · Licht-Bilanz `scripts/lib/licht-linsen.cjs:692` | jeder ÷ k_vor des Bilds, das er liest |
| P4 Schwellen im belichteten Raum | Bloom `:2575/2658` (0,86) · Godrays `:1574/2594` (0,8) · TRAA-Flimmer `:1953` (1 ÷ (L + 1)) · lokaler Kontrast `:2710` · post-kette `DUNKEL_NACHT_LICHT` | die Zahl bleibt, die Bedeutung wird benannt (belichtet); Mittag-Stand 138,7 |
| P5 Streulicht am Deckel | `bright` `stamm/bild-kosten.js:2666–2671` | `c · m ÷ (1 + Luma)` — wirkt auf alle neun Abgriffe |
| P6 Nacht-Auge | `_nachtAuge` `:2446–2455`, `AnazhRealm.NACHT_AUGE` | liest P ÷ k_vor × 16 090 cd/m²; `luxJeEinheit` und die 0,224 fallen |
| P7 Rückstrahl ohne Selbstleuchter | `stamm/bild-schatten.js:176–186` | Vorschlag nach Preis: MASKE — das Glanz-Ziel (r8, MRT) trägt schon je Pixel eine Stoff-Eigenschaft; ein Bit „leuchtet selbst" im selben Ziel (kein neues Ziel, kein neuer Pass), der Rückstrahl überspringt diese Texel. Gegenprobe vor dem Bau: Preis des Bits im MRT gegen ein eigenes Ziel |
| P8 die Quellen | 44 Schreiber (Zensus) | je Quelle EIN physikalischer Wert in cd/m² oder lx, geteilt durch 16 090 an EINER Stelle je Familie (Tafel unten) |
| P9 Belichtungs-Gesetz | `welt-licht.js` `belichtung`, `nachtKnotenE`, Boden 1e-6 | der Knoten im EINEN Maßstab (Mond-E physikalisch), der Boden 1e-6 fällt unter die Nacht (Spike: 1e-12) |

Stellen der Vor-Belichtung selbst: 1 (P0). Leser: 11 brechende + 3 Rückleser. Quellen: 44 in 9 Familien.

## Die Tafel der Quellen (P8) — Wert im EINEN Maßstab

| Familie | heute | physikalisch (Quelle) | Stelle |
|---|---|---|---|
| Sonne, Tag-Himmel, Wolken, Luft, Umgebung | im Maßstab (2 Familien) | 96 700 lx bei 74° (tag-ref.json); Himmel klar 8 000 cd/m² (Frostbite) | bleibt |
| Mond-Richtlicht und Mond im Himmel | 0,51 lx im Nacht-Maßstab | 0,26 lx Vollmond im Zenit (fachwerk-Kommentar; Kyba 2017: typisch 0,05–0,2, höchstens 0,3); Phase und Höhe aus dem Himmel | `welt-licht.js` `MOONLIGHT` — EINE Zahl, Welt und Bühne lesen sie (heute zwei Leser: `stamm/bild-himmel.js:1623` und `welt-licht.js:1134`) |
| Ambient, Hemisphäre der Nacht | 0,046 / 0,011 lx, ohne Quelle | Füllung des Mondes: fällt oder wird Teil der Umgebung (Entscheid offen, am Bild S3) | `stamm/bild-himmel.js:2291, 2510` |
| Sternen-Leuchten, Dämmerlicht | 0,0005 lx, 3 lx bei −6° (USNO, REF) | bleibt, in lx ÷ 16 090 | `welt-licht.js:123–146` |
| Stern-Sprites, Sonnenscheibe, Mondscheibe | 0,9 · 3,58 · 0,60 Einheiten, ohne Quelle | Scheibe der Sonne 1,6·10⁹ cd/m² (am Puffer gedeckelt, P0), Mond 2 500 cd/m², Sterne nach Größenklasse (Quelle offen) | `stamm/bild-himmel.js:404, 2655, 2666` |
| Pool-Lichter (Herd, Glut, Laterne, Wandlaterne, Stahl, Brand, Lava, Tor) | Nacht-Maßstab, Herd 22 lx in 2 m | Herd 2–5 lx in 2 m, Laterne 2 lx am Boden (fachwerk-Kommentar); Brand und Lava aus ihrer Fläche × Leuchtdichte | `fachwerk-core.js` `LICHT_GESETZ` (EINE Tafel), `BRAND.schein`, `siedlung-tor.js:753` |
| Flamme, Glut, Lava-Kruste | × 2,5, bei Tag und Nacht gleich | Flamme 13 800–16 000 cd/m² (Hollan); Glut und Lava als FUNKTION der Temperatur (Planck: 900 K ≈ 0,2 · 1 100 K ≈ 22 · 1 400 K ≈ 2 400 cd/m²) | `fachwerk-core.js:2099`, `studio-stoff.js:395`, `stamm/siedlung-wege.js:552` — EINE Funktion Temperatur → Leuchtdichte im Stoff-Gesetz |
| Fenster, Laternenglas, Funken, Fahrzeug-Lichter, Tor-Flächen | 0,2–1,5 Einheiten, ohne Quelle | je eine Leuchtdichte mit Quelle (offen: Öl-Laterne, Fensterglas — als Hypothese „Flamme hinter Glas") | je Kern eine Zeile |
| Glimmen nach Stoff-Tag, Tierauge, Aura, Platzhalter | ≈ 130 cd/m² im einen Maßstab | 0,1–1 cd/m² (Hypothese des Koordinators) | `stamm/stoff-material.js:868` (EINE Stelle), `tetrapoda-core.js:3692`, `stamm/kreatur-verhalten.js:2184` |
| an k gebunden: Brand-Flamme, Tor-Membran, Augen-Licht | ÷ k | Brand-Flamme wie Flamme (physikalisch, nicht mehr ÷ k); Tor-Membran und Augen-Licht bleiben an k (Bild-Größen) | `stamm/feld-brand.js:846`, `stamm/siedlung-tor.js:646`, `stamm/bild-himmel.js:2118` |

## Dateien und Besitz

Die Welle schreibt: `stamm/bild-kosten.js` · `stamm/bild-himmel.js` · `stamm/bild-sicht.js` · `stamm/bild-schatten.js` ·
`stamm/wasser-hydro.js` · `stamm/stoff-material.js` · `stamm/feld-brand.js` · `stamm/siedlung-tor.js` · `stamm/siedlung-wege.js` ·
`stamm/dirigent-kern.js` · `stamm/feld-leben.js` · `stamm/kampf.js` · `stamm/kreatur-verhalten.js` · `welt-licht.js` · Kerne
`fachwerk-core.js`, `studio-stoff.js`, `vehicle-core.js`, `porta-core.js`, `tetrapoda-core.js` (Byte-Beweis, Golden-Re-Mint als
Vertrags-Akt) · Linsen `scripts/lib/licht-linsen.cjs`, `scripts/lib/albedo-tafel.cjs`, `scripts/diag-post-kette.cjs`,
`scripts/diag-pruefbuehne.cjs` · `spec/farbe/tag-kurve.json` (gespeicherte k im alten Maßstab).
**Besitz (Abfrage 19.11., `git diff --name-only origin/main...<Zweig>` über alle fernen Zweige; OBERGRENZE — ein per Squash
gelandeter Zweig zählt weiter mit, z. B. `w28-ankunft-faden`, `w28-feld-fuss`, `w28-licht-kern`):**

| Datei | Zweige | vom 18./19.11. (lebend) | älter |
|---|---|---|---|
| `stamm/bild-kosten.js` | 14 | licht-spike · vorrat8-ankunft · strahler ×3 (w28-strahler, -messer, strahler-leuchte) | licht-kern · feld-fuss · ankunft-faden · baum-schirm · programm-vor-bild · fruehbild · wiese-fern · stoff-stufe-null · w27-ferne-ton-5 |
| `fachwerk-core.js` | 14 | bau-oeffnungen · strahler ×3 · w28-bau-rezept · vorrat14-oeffnungen · vorrat12/12b-bau-rezept | vorrat3-buendel · vorrat2-kulturfeld · stoff-fuge · baum-ganz · weg-koerper · fassade |
| `scripts/lib/licht-linsen.cjs` | 9 | studio-seiten-2 · berg-studio-seiten · integ-probe · bau-oeffnungen · strahler ×3 | vorrat5-boden-albedo · w27-ferne-ton-5 |
| `stamm/dirigent-kern.js` | 9 | integ-probe · strahler ×3 | vorrat3-buendel · werkbank-teilt · baum-schirm · zug-a · zug-b |
| `stamm/stoff-material.js` | 8 | vorrat8-ankunft · strahler ×3 | baum-schirm · stoff-fuge · wiese-fern · w27-ferne-ton-5 |
| `stamm/siedlung-tor.js` | 8 | studio-seiten-2 · berg-studio-seiten · integ-probe · bau-oeffnungen · strahler ×3 | w28-studio-seiten |
| `stamm/bild-himmel.js` | 7 | licht-spike · vorrat8-ankunft · strahler ×3 | stern-punkt · fruehbild |
| `stamm/bild-schatten.js` | 6 | licht-spike · vorrat8-ankunft · strahler ×3 | vorrat3-buendel |
| `stamm/feld-leben.js` | 6 | leben-erbe · kreatur-groesse · strahler ×3 | vorrat2-zerfall |
| `stamm/bild-sicht.js` | 5 | licht-spike | licht-kern · feld-fuss · w26-lack-glas · claude/determined-bell |
| `stamm/siedlung-wege.js` | 5 | strahler ×3 | weg-koerper · w27-ferne-ton-5 |
| `scripts/lib/albedo-tafel.cjs` | 5 | studio-seiten-2 · berg-studio-seiten · integ-probe · bau-oeffnungen | w28-studio-seiten |
| `welt-licht.js` · `porta-core.js` | je 4 | licht-spike bzw. — · strahler ×3 | stoff-fuge (porta) |
| `stamm/feld-brand.js` · `scripts/diag-post-kette.cjs` · `scripts/diag-pruefbuehne.cjs` | 3–4 | strahler ×3 | w27-ferne-ton-5 (pruefbuehne) |
| `vehicle-core.js` | 1 | — | vorrat2-motorrad-kern |
| `stamm/wasser-hydro.js` · `stamm/kampf.js` · `stamm/kreatur-verhalten.js` · `studio-stoff.js` · `tetrapoda-core.js` · `spec/farbe/tag-kurve.json` | 0 | ohne Treffer | — |

Abweichung zum Auftrag: `stamm/stoff-material.js` halten nach der Abfrage **acht** Zweige, der Spike-Zweig ist NICHT darunter
(er schreibt `bild-himmel` · `bild-kosten` · `bild-schatten` · `bild-sicht` · `welt-licht`). Die drei Strahler-Zweige kreuzen
15 Dateien der Welle; ihr Landen oder Fallen (Entscheid des Koordinators, Runde 3 gegen „nur Leuchte") steht VOR Teil (a). Der
härteste lebende Kreuzer der Bild-Dateien ist `vorrat8-ankunft` (kosten · himmel · schatten · stoff-material). BESITZ_ZEILE
Vorschlag der Staffel, damit kein Zweig zwei Besitzer kreuzt: (a) P0–P6 + P9 in den vier Bild-Dateien und `welt-licht.js` zuerst
(kein Kern, kein `stoff-material.js`); (b) P7 und das Glimmen in `stoff-material.js`, sobald der Besitz frei ist; (c) die Kerne
(P8) je Kern ein Schnitt mit Byte-Beweis.

## Die Linse (Gebot 10) — in bestehenden Familien, vorher ROT am Täter

- `diag-post-kette`: neuer Fall „Skala" — injiziert einen Puffer-Wert, liest ihn an jedem der Leser der Liste zurück: ROT, wenn
  ein Leser das k_vor des schreibenden Bilds nicht teilt (Täter: Spiegel-Pass, Rückstrahl ohne ÷ k_vor — im Spike gesehen:
  Mond-Wiese Luma 254). Selbsttest: der Leser ohne Division.
- `licht-linsen` (Tag-Achse): die Quellen-Tafel als Daten — je Quelle Code-Wert × 16 090 gegen die Tafel; ROT bei Abweichung
  > 1 % oder einer Quelle ohne Zeile (Täter: `luxJeEinheit`).
- `gate:pruefbuehne` S0 Nacht: Rückstrahl-Boden mit ↔ ohne Flamme (S8).

## Welle 2 — das Auge (nach Welle 1, eigenes Soll)

1. **Anker:** Z = E_Kugel ÷ (5π) — die UNGERICHTETE Beleuchtungsstärke am Auge, jede Quelle mit ihrem E am Auge (Tafel C: 5 von 6,
   mit physikalischem Herd 6 von 6; die waagrechte Scheibe ist blind für Feuer, Lava, Laterne). Pool-Formel am Code bestätigt
   (`fachwerk-core.js:6481–6486`): E(d) = (1 − (d ÷ R)⁴)² · ((1 + k²) ÷ (d² + k²))^(n/2) — der Saum der Tafel C war richtig.
2. **Kompensation:** k ∝ Z^(−m). m aus F_L^¼ (CAM16) nachgerechnet: L_A 0,0159 (0,25 lx) → F_L^¼ 0,348; L_A 7 003 (110 klx) →
   1,345; 3,86-fach über 18,75 EV → **m = 0,896 bestätigt**. ABER: das ist die Sehne. Die Kurve selbst biegt — unten (k⁴ → 1)
   gilt F_L ≈ L_A, Steigung ¼ je Dekade der Helligkeit, also m_lokal = 0,75; oben (5 L_A)^(1/3)·¼ → m_lokal = 0,917. EIN m ist
   eine Näherung über den ganzen Bereich; die Nacht verlangt nach dem Modell das kleinere. Gültigkeit unter photopisch ist am Text
   nicht belegt. Entscheid offen: EIN m (0,9) oder F_L^¼ selbst als Gesetz (keine Zahl, eine Funktion).
3. **Durchlass über dem Betrachter (Pflicht-Teil), Zensus:** die EINE Stelle ist der Punkt-Faktor in `_horizontSichtMessen`
   (`stamm/dirigent-ankunft.js:1854`: `_horizontSichtAm × _kartenWurfSicht`) — die einzige CPU-Punktabfrage, die
   `_waagrechtIrradianz` heute schon speist (`stamm/bild-himmel.js:2263`) und Gelände und Karten-Kronen kennt. Ihr fehlen: (a) das
   Dach — der Test des Dach-Pools steht auf der CPU nur fürs Auge (`stamm/stoff-dach.js:86–106`, `_raumAmAuge`); (b) die nahen
   Kronen — `_kartenWurfSicht` kennt nur Karten, das Kronen-Register der Wege-Karte (`_kronenStreuAt`,
   `stamm/siedlung-wege.js:421`) kennt alle stehenden, aber nur 2D; (c) der Himmels-Term — nur die Sonne wird gedämpft, Himmel,
   Hemi und Ambient gehen ungedeckt ein; (d) der Messort — gemessen wird der Boden im Bild, nicht der Ort des Betrachters. Kein
   neuer Messer daneben: der Punkt-Faktor wächst um Dach und nahe Krone und wird am Auge gefragt.
   Soll vorab: Innenraum und Kronendach ordnen sich an den vermessenen Posen wie die Bilder (Kronendach −2,7 EV unter der freien
   Wiese am Boden gemessen; der dunkle Raum 0,0081 der Decke).
4. **Der Blick fällt aus dem globalen k** (Zentrum 6° an fünf von neun Orten am Anschlag); die Fixation gehört in einen lokalen
   Zustand je Bildort — eigene, spätere Welle, offen benannt. Die Graukarte am Mittag (−0,15 EV, Grenzfall, nicht das Modell
   Vangorp Gl. 10) stützt den Anker.

## Offen (mit Grund)

Welche der gezählten Zweige schon per Squash in main stehen (die Abfrage trennt das nicht) · Quellen für Öl-Laterne, Fensterglas, Sterne nach Größenklasse · der Entscheid Ambient/Hemi der Nacht · P7 Maske
gegen eigenes Ziel (Preis ungemessen) · Bildpaare Innenraum und Kronendach (Orte vermessen, Bilder nicht gefahren).
