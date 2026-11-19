# Zensus der Strahlungs-Quellen und der Leser des Maßstabs (GTX 1050, 19.11., `w28-licht-spike` 659540f69 — nur gelesen und gerechnet)

**Zwischenstand in drei Sätzen.** Geschnitten: nichts — erhoben sind alle Schreiber von Strahlung (Himmel und Richtlichter, örtliche
Lichter, Leuchtflächen) und alle Leser, die einen Maßstab annehmen, je mit Datei:Zeile. Gemessen (am Code gezählt): **44 Schreiber**,
davon tragen **7** eine physikalische Zahl mit Quelle am Text, **2 Familien** (Sonne samt Himmels-Tafel) stehen heute schon im EINEN
Maßstab 16 090 cd/m² je Einheit; **57 Leser**, davon **11 brechen**, 25 skalieren mit, 21 unberührt. Offen: nichts im Spiel
nachgemessen ([g] gerechnet, [e] erschlossen); die Herkunft der „Nacht-Bestrahlung 0,224" und acht Leuchtflächen ohne jede Quelle.

## Die zwei Maßstäbe und der Faktor

- **M** (Mittag): 1 Einheit = 16 090 cd/m² bzw. 16 090 lx (`stamm/bild-himmel.js:3402`; Quelle: `spec/farbe/tag-ref.json`,
  117 970 lx bei 75°). Geeicht ist die Sonne (`KEY_BASE` 2,6·π, `welt-licht.js:693`).
- **N** (Nacht): 1 Einheit = 0,26 ÷ 0,224 = 1,1607 lx (`stamm/bild-kosten.js:3247`; Quelle am Text: „Vollmond 0,26 lx ≙ der
  Nacht-Bestrahlung der Welt 0,224", `fachwerk-core.js:6416`).
- **M ÷ N = 13 862.** Der Faktor einer N-Quelle in den EINEN Maßstab M ist 7,21·10⁻⁵ × (physikalischer Wert ÷ heutiger Wert in N).
- Offen am Text: woher 0,224 stammt — das Mond-Richtlicht trägt heute E 0,440, die Nacht-Summe 0,571 (der Code nennt für das Dorf
  0,54, `welt-licht.js:66`). Im Maßstab N ist der Mond damit 0,51 lx, das Doppelte der genannten 0,26 lx.

## Teil 1 — Himmel und große Lichter (Uhr 0,5: Sonne 74,2°; Uhr 0,0: Vollmond 74,2°; klar; Karte = 0,18 ÷ π · E)

| Schreiber | Datei:Zeile | heute (Einheiten) Mittag · Mitternacht | gedacht in | physikalisch · Quelle | Faktor in M |
|---|---|---|---|---|---|
| Sonnen-Richtlicht | stamm/bild-himmel.js:1884–1887; welt-licht.js:49, 53 | I 6,90 · E 6,01 · Karte 0,344 [g] — nachts 0 | M | 96 700 lx · tag-ref.json (REF 117 970 lx bei 75°) | 1 |
| Mond-Richtlicht | stamm/bild-himmel.js:1895, 1797–1806; welt-licht.js:74, 108–113 | 0 — I 0,6435 · E 0,440 · Karte 0,0252 [g] | N | 0,26 lx Vollmond · fachwerk-core.js:6416 (Auftrag: 0,1 lx) | 3,67·10⁻⁵ (0,26 lx) · 1,41·10⁻⁵ (0,1 lx) |
| Ambient | stamm/bild-himmel.js:2291–2295 | 0 — E 0,040 | N | ohne Quelle (Nacht-Eichung, Kommentar 2287–2290) | 7,21·10⁻⁵ × offen |
| Hemisphäre | stamm/bild-himmel.js:2510–2535 | 0 — E 0,0095 | N | ohne Quelle | 7,21·10⁻⁵ × offen |
| Himmels-Tafel (Zenit · Horizont · Sonnen-/Mondhof) | welt-licht.js:540–557, 836–840, 961 | Zenit 0,881 · Horizont 0,40–0,52 · Hof 1° 1,67 — Zenit 0,050 · Horizont 0,023–0,030 · Hof 0,095 [g¹] | Tag M · Nacht N | folgt dem Richtlicht (dasselbe E0, EINE Atmosphäre): Zenit 14 200 cd/m² | Tag 1 · Nacht wie der Mond |
| Sternen-Leuchten im Himmel | welt-licht.js:115, 123–134, 142–145 | 0 — 1,3·10⁻⁴ (Zenit) [g] | N | 0,0005 lx · „USNO" (welt-licht.js:115) | 7,21·10⁻⁵ |
| Dämmerlicht | welt-licht.js:131, 144 | 0 — 0 | N | 3 lx bei −6° · „REF" (welt-licht.js) | 7,21·10⁻⁵ |
| Wolken, Diffus-Anteil | welt-licht.js:1013–1035, 1042 | 0,62–0,95 — 0,035–0,054 [g] | folgt dem Himmel [e] | ohne Quelle | wie der Himmel |
| Wolken-Saum zur Sonne | welt-licht.js:1036–1040 | bis 1,93 — 0 [g] | M [e] | ohne Quelle | 1 |
| Stern-Sprites | stamm/bild-himmel.js:404–418, 1781–1791 | nicht gezeichnet — mag ≤ 4: 0,85–0,93 · mag 6: 0,26 [g] | unklar („Pixel knapp über dem hellsten Stern", :3388) | ohne Quelle | offen |
| Sonnenscheibe | stamm/bild-himmel.js:2652–2656, 3427; stamm/dirigent-ankunft.js:328–334 | ≈ 3,58 [g] — unsichtbar | unklar („hellster Punkt", „≈ 2,6 linear") | echt 1,6·10⁹ cd/m² (allgemein bekannt, am Text ohne Quelle) | 2,8·10⁴ |
| Mondscheibe | stamm/dirigent-ankunft.js:341–349; stamm/bild-himmel.js:2666–2668 | unsichtbar — ≈ 0,60 [g] | unklar | 2 500 cd/m² · Kommentar stamm/bild-himmel.js:3389 | 0,26 |
| Luft / Einstreuung | stamm/bild-himmel.js:2383–2396, 2452–2460, 2491–2496 | = Horizont | folgt dem Himmel | — | wie der Himmel |
| Godrays | stamm/bild-kosten.js:1565–1580, 2699 | Zuschlag ≤ 0,56 × Quell-Pixel über 0,8 — 0 | liest den Puffer | — | Schwelle skaliert, siehe Leser |
| Umgebung (IBL / PMREM) | welt-licht.js:849–851; stamm/bild-sicht.js:688, 715–718 | oben E 1,41 (im Code gemessen 1,33) · Boden 0,29 — 0,082 · 0,0205 [g] | M / N | folgt dem Himmel | wie der Himmel |
| Rückstrahl | stamm/bild-schatten.js:94, 101–105, 193 | liest den Szenen-Puffer | Puffer | — | siehe Leser |
| Wasser-Sonnenterm | stamm/bild-himmel.js:2609 | max(0,22; I) = 6,90 — 0,6435 | folgt dem Richtlicht; die 0,22 ohne Quelle | — | wie das Richtlicht |

Summe auf der 18-%-Karte [g]: Mittag (6,01 + 1,41) · 0,0573 = 0,425 Einheiten (gemessen im Spiel 0,417); Mitternacht E 0,571 →
0,0327 Einheiten = 0,038 cd/m² bzw. 0,66 lx in N.

Keine Schreiber (gelesen, ausgeschieden): Mondphase (immer Vollmond, `welt-licht.js:718–722`) · Saatwerte Ambient 0,6 / Hemi 0,55
(`stamm/dirigent-ankunft.js:357, 456`, je Takt überschrieben) · Innenraum (`stamm/stoff-dach.js:51–133`: multipliziert die Umgebung
mit 0…1). Das Wetter multipliziert nur (`stamm/daten.js:22–29`: lightMul · direkt · skyMul · himmel), es trägt keinen eigenen Wert.
Gesucht, nicht gefunden: Blitz, Milchstraße, Schatten-Aufhellung, eigene Nebelfarbe, ein Schreiber von `environmentIntensity` ≠ 1.

1. [g¹] CPU-Nachbau des Atmosphären-Marschs (`welt-licht.js:327–557`), ±5–10 % gegen die GPU-Tafeln; Kontrollen: Himmels-E 1,41
   gegen 1,33 im Code, Richtlicht 6,90 gegen 6,92 im Spiel. Der Horizont dunkler als der Zenit ist gerechnet, nicht im Bild gesehen.

## Teil 2 — örtliche Lichter und Leuchtflächen (am Code gelesen, nichts im Spiel gemessen; [g] gerechnet, [e] erschlossen)

27 Schreiber: 9 Lichter im Licht-Pool, 15 Leuchtflächen mit fester Leuchtdichte, 3 an die Belichtung k gebunden. Als k die im Code
genannten Werte: Mittag 0,511 (`welt-licht.js:6`), Mitternacht im Dorf 1,59 (`welt-licht.js:66`).

**Wie ein Pool-Licht in den Puffer kommt** (`dirigent-kern.js:1663–1684, 1737–1741, 1875–1877`; `stoff-material.js:2335–2384`):
E(d) = π · Stärke · (1 + Flackern) · Masse · Zeitplan · (1+k²)^(a/2) ÷ (d²+k²)^(a/2) · Saum; für die 18-%-Karte bei senkrechtem
Einfall L(d) = 0,18 · Stärke · Masse · Zeitplan · (1+k²) ÷ (d²+k²) · Y(Farbe) — k ist hier der Kern der Quelle, nicht die
Belichtung. Die Farbe ist auf ihren hellsten Kanal normiert, Y(Farbe) [g]: 1 667 K 0,338 · 1 900 K 0,378 · 2 000 K 0,396 ·
2 800 K 0,535 · 3 000 K 0,566 · 4 750 K 0,798 · Tor 0xffd9a0 0,734.

| Schreiber (Träger) | Datei:Zeile | Formel bis in den Puffer | Mittag (Einheiten) | Mitternacht (Einheiten) | gedachter Maßstab | cd/m² [g] |
|---|---|---|---|---|---|---|
| **Lichter (Karte in 1 m / 2 m)** | | | | | | |
| Herdfeuer (Feuerstelle, Masse = Skala²) | fachwerk-core.js:6432; dirigent-kern.js:1789 | 0,18·1·Zeitplan(1,6 / 45)·Y 0,396; Kern 0,76 m | 0,114 / 0,039 | 3,21 / 1,10 | Nacht¹ | Mittag-Maßstab 1 834 / 631 · Nacht-Maßstab 3,73 / 1,28 |
| Glut ohne Gestalt (Glutbrunnen, Esse) | dirigent-kern.js:1785, 1796 | wie Herdfeuer × Fläche ÷ 0,454 m² | × Masse | × Masse | Nacht | — |
| Laterne (laterne_dorf) | fachwerk-core.js:6434 | 0,18·19·Zeitplan(0 / 1)·0,378; Kern 0,1 m | 0 | 1,294 / 0,325 | Nacht² | 1,50 / 0,377 |
| Wandlaterne | fachwerk-core.js:6442–6459 | abgeleitet: Stärke 2,667, Kern 2,742 m [g] | 0 | 0,182 / 0,134 | Nacht | 0,211 / 0,156 |
| Stahl der Esse (Gerät in der Hand) | feld-leben.js:2555–2583, 3120 | 0,18·0,132·g·Feuer-Zeitplan·Y(1 667 K); Kern 0,25 m³ | 0,013 / 0,0034 | 0,363 / 0,095 | Nacht | Mittag 207 / 54 · Nacht 0,42 / 0,11 |
| Brand, kleinste Flammen-Fläche (Kern 0,76 m) | dirigent-kern.js:1725–1733, 1804–1810; feld-brand.js:946 | 0,18·7,5·k²÷(d²+k²)·0,396·Glut; kein Zeitplan | 0,196 / 0,068 | gleich | Nacht⁴ | 0,228 / 0,078 (im Mittag-Maßstab 3 154 / 1 086) |
| Lava (Kern 8 m) bzw. größter Brand | dirigent-kern.js:1815–1822 | wie Brand, k = 8, × Glut | 0,527 / 0,504 | gleich | Nacht | 0,612 / 0,585 (im Mittag-Maßstab 8 480 / 8 110) |
| Tor (das nächste wache Portal) | siedlung-tor.js:753–776; porta-core.js:1721–1736 | 0,18·(0,3 + 3,4·act)·(0,8 + 0,28·Puls)·0,734; Kern = halbe Torbreite [e] | 1 m: 0,39–0,53 | gleich | unklar (Zahl des Labor-PointLight) | Nacht 0,61 / Mittag 8 495 |
| Augen-Licht (nur ohne Himmel: Höhle) | bild-himmel.js:2112–2159, 3335 | Stärke ÷ k so geeicht, dass k·L = 0,22·(2ⁿ − h)·Y 0,798 | k·L 0,040 | gleich | an k gebunden | — |
| **Leuchtflächen (Y der Fläche)** | | | | | | |
| Flamme und Glut, fachwerk-Rolle `feuer` (auch Kerze, fachwerk-core.js:1111) | fachwerk-core.js:2099–2105; studio-stoff.js:395 | Vertex-Farbe × 2,5 | Wurzel 0,84 · Mitte 0,86 · Rand 0,27 | gleich | unklar | 13 600 (Mittag-Maßstab) / 0,98 (Nacht-Maßstab) |
| Lava-Kruste (die Risse) | siedlung-wege.js:552–564; stoff-material.js:967 | Farbe(1 667 K)·2,5·Wien-Abfall | 0,846 beim Ausbruch | gleich | unklar | 13 610 / 0,98 |
| Fensterglas | stoff-material.js:2104–2108; fachwerk-core.js:2098, 6433 | Farbe(2 800 K)·Zeitplan(0 / 0,85); Deckkraft 0,42 | 0 | 0,454 (wirksam 0,191) | unklar | Nacht 0,53 (0,22) |
| Laternenglas | fachwerk-core.js:2097 | Farbe(1 900 K)·Zeitplan(0 / 1); Deckkraft 0,42 | 0 | 0,378 (0,159) | unklar | 0,44 (0,18) |
| Funken des Stoff-Paars | kampf.js:930, 2677–2687 | Farbe(1 900 K)·4 (MeshBasic) | 1,513 | gleich | unklar | 24 350 / 1,76 |
| Fahrzeug: Tagfahrlicht · Linse weiß · rot · gelb | vehicle-core.js:162–189 | lineare Farbe × Intensität | 0,603 · 0,848 · 0,193 · 0,270 | gleich | unklar | Mittag 9 700 · 13 640 · 3 100 · 4 340 |
| Fahrzeug, Epochen: Laterne · Lichtkante | vehicle-core.js:340–341 | dto. | 0,546 · 1,157 | gleich | unklar | 8 790 · 18 610 |
| Tor: Filigran · Bogen-Saum · Licht-Scheibe | porta-core.js:1335, 1336, 1449; foundry-bruecke.js:729–733 | Farbe nach HSL × Glow | 0,57–1,13 · 0,60–1,33 · 0,04–0,46 | gleich | unklar | — |
| Tor-Rahmen · Beschläge gold · blau · Messing | porta-core.js:1331–1334 | Farbe × lerp(Glow) | 0,02–0,31 · 0,19–0,46 · 0,09–0,20 · ≤ 0,012 | gleich | unklar⁵ | — |
| Glimmen nach Stoff-Tags: Glutbett der Esse · Meister-Esse | stoff-material.js:868–876; bau-teile.js:1771–1774; bau-vorlagen.js:1861 | Farbe·min(1,5; (emissiv − 0,5)·0,6·Boost) | 0,313 · 0,354 | gleich | unklar | — |
| Glimmen: Kristall-Spitzen · Kristall-Bett | bau-teile.js:1641–1663 | dto. | 0,12–0,29 · 0,05–0,13 | gleich | unklar | — |
| Glimmen: Holz, Laub, Leder | siedlung-bauten.js:987 | dto. | Holz ≈ 0,008 [e] | gleich | unklar | — |
| Tierauge | tetrapoda-core.js:3692, 4117–4124; foundry-core.js:8211–8240 | lin(Iris × 0,29)·0,3 | ≤ 0,018 [e] | gleich | unklar | — |
| Kreatur-Aura und Traglast (additive Sprites) | kreatur-verhalten.js:2184–2226, 2264 | HSL(h; 0,6; 0,65)·0,55 | 0,25–0,42 [g] | gleich | unklar | — |
| Platzhalter eines Mitspielers (MeshBasic) | netz-p2p.js:2171–2175 | HSL(h; 0,7; 0,55) | ≈ 0,3–0,7 [e] | gleich | unklar | — |
| **An die Belichtung k gebunden** | | | | | | |
| Flamme des Brands | feld-brand.js:799–846, 943–944 | Ton·1,6 ÷ k, danach die Umkehr des Nacht-Auges | Wurzel 1,77 | 0,57 (k·L 0,906) | an k gebunden | 28 510 / 0,66 |
| Tor-Membran (das Zielbild) | siedlung-tor.js:278, 646 | Bildwert des Ziels ÷ k | B ÷ 0,511 | B ÷ 1,59 | an k gebunden | offen [e] |

1. `fachwerk-core.js:6414–6419` nennt die Physik: Holzfeuer 1 800–2 000 K, „2–5 lx", Mondlicht 0,1–0,3 lx, „Vollmond 0,26 lx ≙ … 0,224", ein echtes Lagerfeuer trage in 2 m „das Hundertfache", mit `nacht 45` „≈ 80-Fache". Nachgerechnet: E(2 m) = 19,3 Einheiten = 86 × 0,224 ≈ 22 lx [g]. Für den Mittag nennt der Code keine physikalische Zahl.
2. `fachwerk-core.js:6421–6423`: 1 900 K, „das Band 2–5 lx"; am Boden unter dem Mast E = 1,76 Einheiten ≈ 2,0 lx [g].
3. `Object.assign({}, L, …)` behält `zeit`: der Stahl läuft auf dem Zeitplan des Feuers [e]; `feld-leben.js:3115` „gelbe Glut 1 300 °C".
4. `feld-brand.js:924`: „bei Tag und Nacht dieselbe; der Mond trägt 0,224". Der Pool multipliziert noch π: E an der Flamme 7,5 π ≈ 23,6 [g].
5. `phyto-core.js:5924` zitiert „Tor-Rahmen 0,09–0,48 · Fenster 1,1" als Leuchtdichte des Emissivs.

**Gesucht, nicht gefunden:** PointLight/SpotLight in der Welt (keines; `bild-schatten.js:404` baut nur die Schatten-Karte nach) ·
Fahrzeug-Scheinwerfer als Licht (nur leuchtende Flächen) · Fackel in der Hand (kein Platz im Pool) · glühendes Werkstück (die Klinge
trägt Licht, ihre Fläche glüht nicht) · `lichtGlut.feuer`/`.wandlaterne` werden je Bild geschrieben, kein Stoff liest sie [e] ·
Glut-Narbe und Asche (nur Albedo, `stoff-material.js:916`) · Rauch (beleuchtet, strahlt nicht, `:2072`) · Brennpunkte (nur Wärme,
`koerper-fahrt.js:2279`) · Glühwürmchen, Blitz, Mündungs-/Treffer-Blitze · Werkstatt-Marker und Namensschild: Zeichnen in der
Welt-Szene nicht geprüft [e].

**Physikalischer Wert der örtlichen Quellen (Quelle am Text):** Herdfeuer „2–5 lx" in 2 m (`fachwerk-core.js:6414–6419`), heute
22 lx [g] — der Code nennt die Überhöhung selbst („≈ 80-Fache" des Mondes); Faktor in M: 7,21·10⁻⁵ × (2…5 ÷ 22) = 0,66…1,6·10⁻⁵.
Laterne „2–5 lx" (`:6421–6423`), heute 2,0 lx [g]: Faktor 7,21·10⁻⁵. Stahl der Esse: nur die Temperatur (1 300 °C,
`stamm/feld-leben.js:3115`). Flamme, Glut, Lava-Kruste (× 2,5), Fenster, Laternenglas, Funken, Fahrzeug-Lichter, Tor, Glimmen,
Tierauge, Aura, Platzhalter: **ohne Quelle** — eine Flamme liegt real bei einigen 10³ cd/m², das wäre im Maßstab M 0,2–0,6 Einheiten
und träfe die heutigen 0,27–0,86 zufällig; am Text steht dafür nichts.

## Teil 3 — die Leser des Maßstabs

Spalte „liest": P = Puffer linear vor der Belichtung · E = Lichtstärke in Welt-Einheiten · k = Belichtung · A = Ausgabe-Code.
Urteil unter Vor-Belichtung mit EINEM Maßstab: **u** unberührt · **s** skaliert mit · **b** bricht.

| Leser | Datei:Zeile | liest | feste Zahl | Urteil |
|---|---|---|---|---|
| `belichtung` | welt-licht.js:674–678 | E | zielKarte 0,22 · min 0,05 | s |
| `nachtKnotenE` | welt-licht.js:77, 85, 677 | E | MOND_E | s |
| `belichtungStufen` | welt-licht.js:648–661 | E-Verhältnis | Stufen, EV | u |
| `belichtungAnker` | welt-licht.js:684–689; stamm/bild-himmel.js:2093 | E | KEY_BASE 2,6·π | s |
| `_waagrechtIrradianz` | stamm/bild-himmel.js:2233–2273 | E | — | s |
| `_raumBlendeTakt` | stamm/bild-himmel.js:2030–2078 | E-Anteile | 0…2 | u |
| `_augenLichtStaerke` | stamm/bild-himmel.js:2118, 2148–2159 | k | zielKarte·π ÷ 0,18 ÷ k | s |
| `_augeKetteZeichnen` | stamm/bild-kosten.js:2224–2294 | P | Deckel = Schulter ÷ k | **b** — Z läse k·L, k(Z) hinge an sich selbst [e] |
| `AnazhRealm.AUGE` | stamm/bild-himmel.js:3392–3410 | P | kE 0,527 · zE 0,2046 · 16 090 | **b** — am Mittags-Maßstab geeicht |
| `_dayNightApplyBelichtung` (τ) | stamm/bild-himmel.js:1966–1977 | P → cd/m² | 5 / 0,005 cd/m² | **b** |
| `_augeKette().faktor` (F) | stamm/bild-kosten.js:2207–2210 | P | kE, zE, m | **b** (fällt mit F) |
| `_nachtAuge` sVon | stamm/bild-kosten.js:2446–2451, 3246–3253 | P | luxJeEinheit 1,1607 · Band 0,005–5 cd/m² | **b** |
| `_nachtAuge` bildZapfen | stamm/bild-kosten.js:2455 | P·k | 0,18…1 | s (sonst k²) [e] |
| `nightFactor` | stamm/bild-kosten.js:2579; welt-licht.js:756 | Sonnenhöhe | −32° | u |
| Bloom-Schwelle | stamm/bild-kosten.js:2575, 2658 | P | 0,86 + 0,25 | **b** — heute belichtet 0,44 mittags, 1,08 nachts |
| Bloom Stärke, Radius | stamm/bild-kosten.js:2576–2577, 2661 | — | 0,38 · 2,2 | u |
| Godray-Schwelle | stamm/bild-kosten.js:1574, 2594 | P | 0,8 + 0,2 | **b** |
| Godray-Dichte, Abklang | stamm/bild-kosten.js:1572, 1577 | — | 0,55 · 0,96^i | u |
| Nach-Schärfe | stamm/bild-kosten.js:2644–2654 | P | Nachbar-Klemme | u |
| lokaler Kontrast | stamm/bild-kosten.js:2710–2719 | P | absolute Differenz | **b** — quadratisch (Wahl steht auf 0) |
| Farbsicht | stamm/bild-kosten.js:2740 | P | linear | u |
| `_schirmKurve` | stamm/bild-kosten.js:2394–2430 | P·Faktor | Kurven-Knoten in k·L | s — der Faktor wird k ÷ k_vor |
| `_ausgabeDither` | stamm/bild-kosten.js:2042–2055 | P | relativ, Boden 2⁻¹⁴ | u |
| TRAA Flimmer-Dämpfung | stamm/bild-kosten.js:1953–1956 | P | 1 ÷ (L + 1) | **b** — die „1" gehört zum alten Maßstab |
| TRAA Varianz-Klemme | stamm/bild-kosten.js:1651–1658, 1947–1951 | P | 1e-7, 1e-5 | u |
| Formate rg11b10 / rgba16f | stamm/bild-kosten.js:2018–2024, 1684 | P | 65 504 · Mantisse 6/6/5 | u [e] |
| MRT Glanz, Vortiefe | stamm/bild-kosten.js:2523, 1962 | — | — | u |
| Spiegel-Pass | stamm/bild-sicht.js:781, 731 | P als Strahldichte | — | s — sonst doppelt belichtet |
| Wasser | stamm/wasser-hydro.js:833 | P + E | — | s |
| Rückstrahl | stamm/bild-schatten.js:94, 184, 257 | P − Atmosphären-Boden (E) | — | s |
| Karten-Bake | stamm/stoff-karte.js:851 | Albedo | — | u |
| `_weltLicht` (Feld, Panorama, Fern-Ring) | stamm/bild-sicht.js:2738–2753 | Kopie der Lichter | — | s |
| Luft / Nebel | stamm/bild-himmel.js:2358 ff. | Himmel × E0 | — | s |
| Brand-Flamme | stamm/feld-brand.js:846, 944 | k | Ziel 1,6 ÷ k | s; ihre Umkehr über `_nachtAuge` **b** |
| `BRAND.schein` | stamm/feld-brand.js:946; stamm/dirigent-kern.js:1733 | E | 7,5 | s |
| Tor-Ziel | stamm/siedlung-tor.js:646, 278, 572 | k | 1 ÷ k | s |
| Sonnenscheibe | stamm/bild-himmel.js:2655, 3427 | P absolut | 4 | s |
| Sterne | stamm/bild-himmel.js:386–409 | P absolut | Deckkraft 0,5 | s [e] |
| Licht-Rig, Pool, Lava | welt-licht.js:49, 74; stamm/bild-himmel.js:2294; stamm/dirigent-kern.js:1740, 1876; stamm/siedlung-wege.js:562 | E | 2,6 · 0,65 · 0,04 · π · 2,5 | s |
| Licht-Wurf-Wahl | stamm/bild-schatten.js:494–499 | E-Verhältnis | — | u |
| Zeitplan, Pool-Wahl | stamm/dirigent-kern.js:1882–1890, 1772 | Sonnenhöhe, Abstand | — | u |
| Tiere, Bewohner | stamm/kreatur-leben.js:2065; stamm/siedlung-bewohner.js:1564 | Sonnen-Sinus, Uhr | — | u |
| abnahme-urteil | scripts/lib/abnahme-urteil.cjs:32–36 | A | 6…245 | u |
| klarerTag / mondNacht | scripts/lib/abnahme-urteil.cjs:1135–1163; spec/abnahme/soll-tafel.json:348–407 | E-Verhältnis | — | u |
| Tag-Achse (tag-ref, tag-kurve) | scripts/lib/licht-linsen.cjs:1167–1261 | A, lux-Verhältnis | Karte 110–130 | u (die gespeicherten k stehen im alten Maßstab, gelesen werden Verhältnisse) |
| Licht-Bilanz (`werkbank licht`) | scripts/lib/licht-linsen.cjs:692–853; scripts/werkbank.cjs:3147 | P (eigenes Ziel) | E = π·Y ÷ 0,18 | s |
| albedoSicht | scripts/lib/licht-linsen.cjs:352–377 | P unter Ambient π | — | s |
| Albedo-Eichung | scripts/lib/albedo-tafel.cjs:234–238 | P | Karte liest 0,180 | **b** [e] |
| Wolke von unten | scripts/lib/licht-linsen.cjs:978–995 | k·L | 0,76 | s [e] |
| kontaktSicht | scripts/lib/licht-linsen.cjs:3067 | A ÷ k | — | s |
| post-kette (h) DUNKEL | scripts/diag-post-kette.cjs:110–115 | P-Injektion | 0,05 bei k 1 | s |
| post-kette DUNKEL_NACHT_LICHT | scripts/diag-post-kette.cjs:115 | P | 0,02 | **b** |
| post-kette (j) Flamme, Wand | scripts/diag-post-kette.cjs:119, 1283, 1504, 1519 | k | k 1,5 | s |
| pruefbuehne S0 | scripts/diag-pruefbuehne.cjs:183, 340, 1055 | E-Verhältnis, A | ≥ 10× · Luma ≥ 22 | u |
| hoehlen-sicht | scripts/diag-hoehlen-sicht.cjs:1311 | k | — | s |
| playtest Bild | scripts/playtest/bild.cjs:458–466, 1704–1713 | k = Gesetz | — | u |
| spec/profiband | — | ms, Dreiecke, VRAM | — | u |

Gesucht, nicht gefunden: Grading und Vignette (gefallen, `stamm/bild-kosten.js:2701–2704`) · Glüh-Wächter / Firefly-Klemme ·
Weiß-Klemme im Stoff · Helligkeits-Schwelle in der Sicht von Tier oder Bewohner · Belichtungs-Leser in `stamm/werkstatt-vorschau.js`.
Nicht gelesen: `_schattenBias` (wirkt auf Tiefe [e]).

## Die Zahl

- **Schreiber gesamt: 44** (17 Himmel und große Lichter, 27 örtlich).
- **Mit physikalischer Zahl und Quelle am Text: 7** — Sonne (tag-ref), Himmels-Tafel (dieselbe Eichung), Sternen-Leuchten (USNO),
  Dämmerlicht (REF), Mond (0,26 lx), Herdfeuer und Laterne (2–5 lx). In ihrem eigenen Maßstab treffen 5 ihre Zahl; der Mond steht
  beim Doppelten, das Herdfeuer beim 4- bis 11-Fachen (im Code so benannt).
- **Heute schon im EINEN Maßstab M: 2 Familien** — die Sonne und die Himmels-Tafel des Tags (mit ihren Folgern Wolken, Luft,
  Umgebung). Alles Nächtliche und jedes örtliche Licht steht in N (Faktor 7,21·10⁻⁵); 15 Leuchtflächen tragen einen Wert, der bei
  Tag und Nacht derselbe ist und in keinem der zwei Maßstäbe begründet steht.
- **Leser gesamt: 57** — bricht 11 · skaliert mit 25 · unberührt 21.

## Was der Zensus dem Vor-Belichtungs-Spike mitgibt (Zusatz-Zeilen zum Soll f49bba453)

Über F1–F9 hinaus benennt der Zensus vier Leser, die das Soll nicht trug: die TRAA-Flimmer-Dämpfung (1 ÷ (L + 1)), die
Albedo-Eichung der Werkbank (liest 0,180 im Puffer), post-kette DUNKEL_NACHT_LICHT (0,02 Szenen-Einheiten) und den Spiegel-Pass /
Rückstrahl / das Wasser (lesen den Puffer als Strahldichte zurück in den Stoff: unter Vor-Belichtung doppelt belichtet, wenn sie
nicht durch k_vor teilen).
