# Bericht 1110-9 Tor-Wurf — die Tore werfen aus ihrer NUR-WURF-Stufe, geworfen wird von der billigeren Stufe

1. **Geschnitten:**
   - porta-core sammelt im SELBEN Lauf, der das Tor baut, die EINE Hüllen-Liste (N5). Stufe 3 (NUR-WURF) ist diese Liste als
     Gitter, die Fernform liest ihre `sicht`-Teile (≤ 24).
   - Im Wirt gilt EINE Kosten-Regel, generisch je Art mit NUR-WURF-Stufe (`_wurfVonBilligerer`). Der Zwilling wirft nur, wo er
     weniger Dreiecke trägt als die werfenden Teile der gezeigten Stufe.
2. **Gemessen:**
   - Genesis-ABAB 3+3 gegen main bb554abf (GTX 1060, mit Takt): Befehle 201 → 169, Dreiecke 946k → 720k (die Bau-Klasse
     484k → 255k, k0 50 → 26 Befehle). gpu-bank 17,74 → 17,64 ms (in der Spanne), CPU-Takt p95 7,3 → 6,8 ms.
   - Die Hülle: W min 0,864, Median 0,984. Stufe 0 und Fernform sind über 770 Bauten byte-gleich.
   - 19 Wände und der volle Playtest auf dem Stand main bb554abf + torwurf sind grün.
3. **Ehrlich offen:**
   - Der Schatten in EINER Welt hält 0,98 nicht: 11 m 0,93 (der Flügel-Wurf, Nebenwirkung a), 30 m 0,73–0,80 (Selbst-Wurf
     der Hülle).
   - Das Band misst an der Genesis +1,24 ms GPU je Frame und −2,3 fps unter Regler voll, die Bank nicht.
   - Das Fernform-Paar jenseits des Cull-Radius steht ohne gültigen Vergleich.

Auftrag: Karte C1 (Tor-Wurf) nach 1110-9 Teil 2, Entscheidung A des Koordinators (12.10.). Branch **welle-m-e-torwurf**
**52ac16d8** (per ls-remote), main bb554abf (V18.543) gemergt.

## Die Kosten-Regel (Entscheidung A)

- `AnazhRealm._wurfVonBilligerer(eigen, zwilling)` → `"zwilling"` nur bei `zwilling < eigen`, sonst `"selbst"`.
  - Das Wurf-Recht je Teil `_teilWirft` (Fell-Schale, Glut, Deckkraft < 1 werfen nie) war vorher inline in
    `_foundryBuildMesh`. Jetzt ist es EINE statische Methode, die der Wirt und die Linse lesen.
- `_foundryFlattenFor`: Ist die Wurf-Stufe eine NUR-WURF-Stufe, zählt der Flat die Dreiecke der werfenden Teile der Stufe
  und die des Zwillings. Wirft die Stufe selbst, fällt der Zwilling. Der Flat trägt `wurfKosten {eigen, zwilling, von}`.
- Generisch: Das Haus (L0/L1/L2 → Stufe 3) und die Ausstattung (L1 → Stufe 3) laufen durch dieselbe Regel.
  - Das Haus: Der Zwilling trägt ≤ 0,2 % der Stufe (96 gegen ≥ 30 000), also wirft immer der Zwilling.
  - gate:haus-fern ist byte-gleich der Basis: Jede Zahlen-Zeile stimmt, fachwerk-core und Worker sind unberührt.
- docs/studio-vertrag.md (B2c `nurWurf`): ein Satz zur Kosten-Regel. Die Zeile der Stufe 3 ist das Rezept-Maß, am
  Regler-Rand richtet die Regel.

## gate:regler-wirkt WURF

- Die Linse liest `_teilWirft` und `_wurfVonBilligerer` aus der Quelle des Stamms.
- Sie baut je Rezept die erste Stufe und die NUR-WURF-Stufe über die echte Brücke, ohne ov und an jedem Regler-Rand.
- Rot ist: die Regel wirft von der teureren Stufe, oder eine Stufe baut 0 Teile.
- Proportional:
  - Das Tor fährt die volle Regler-Hülle (385 Paare).
  - Eine Art, deren Zwilling am Grund-Bau jedes Rezepts und an jedem Rand ihres ersten Rezepts ≤ 1/10 der Stufe trägt, gilt
    als mit Abstand entschieden. Das trifft das Haus mit 0,2 %. Die volle Haus-Hülle wären 2 752 Bauten, lokal 149 s.
- Selbsttest: Der Täter „der Zwilling wirft immer" (der Stand vor der Regel, in der Quelle gesetzt) ist an kathedrale rot
  beim Namen.
- Zeit lokal: 98 → 126 s. Die CI-Gruppe 10 trägt ≈ 10,0 → 10,5 min (Deckel 11).
- Am Regler-Rand orders=9 (Seed 1):
  - Stufe 0 wirft selbst bei kathedrale (16 900 Dreiecke; der Zwilling trüge 22 024) und bei geisttor (4 256 gegen 5 120).
  - Der Zwilling wirft bei maurentor (20 784 gegen 38 910), verkalkt (30 080 gegen 44 898), drachentor, maschine und ruine.
- Die Stufe wirft selbst an 89 von 459 Paaren. Am Rezept selbst trifft es geisttor (2 132 gegen 2 136) und kathedrale
  (7 380 gegen 7 488); über die Regler-Hülle sind es 41 bzw. 44 von 55 Lagen.
- In der Welt: `wurfKosten` am Flat, z. B. maurentor eigen 28 266 / Zwilling 5 768 → Zwilling, ruine 4 528 / 2 944 →
  Zwilling. Die Umschalt-Probe zählt nach der Regel 4 werfende Stufe-0-Leaves und 5 Zwillinge (vor der Regel 0 und 7).

## Die Hülle (W geheilt)

- Die Röhren-Kette folgt dem Polygonzug der gezeichneten Röhre (`hRoehrenKette`, Douglas-Peucker, Sehne ≤ ¾ r).
  - Vorher teilte sie nach eigener Sehne (≤ r) und lief neben der Röhre, die selbst nach dem Detail-Gesetz geteilt ist.
  - geisttor: Monolith r 1,7 cm, Wurf-IoU 0,767 → 0,887.
  - Mit r/4 kostete die kathedrale +216 Dreiecke ohne Gewinn. Mit r riss geisttor (0,837).
- Die Enden des Geflechts in vier Stücken mit dem Radius ihrer Spreizung, statt der Spitze ×1,7 über 12 %: drachentor
  0,841 → 0,864.
- Rasterfest: Douglas-Peucker misst auf 2^-20 m, bei Gleichstand gewinnt der erste. Der symmetrische Bogen von maschine
  kippte unter pow/hypot ±1 ULP, die Plattform-Probe v4 war rot. Unter neun Transzendenten ±1 ULP kippt keine Liste mehr.
- gate:tor-fern:
  - K: Fernbild ≤ 11 Teile. Stufe 3 am Rezept ≤ 7 632 (Zeile 12 000), am Regler-Rand ≤ 30 080, dort richtet die Regel.
  - W: min 0,864, Median 0,984.
  - I: p95 ≤ 8,5 cm.
- Stufe 0 und Fernform sind byte-gleich über 770 Bauten (7 Rezepte × Samen 1/7 × 55 Regler-Lagen).
- v4-Goldens: 16 alte Fälle byte-gleich, 7 Stufe-3-Fälle neu geprägt.
- asset-contract: gate[3] 7 632/12 000, die halbierte Zeile reißt.

## Das Bild in EINER Welt (Genesis-Ring, GTX 1060)

- Der Aufbau:
  - Stand: torwurf mit main a0a05614 gemergt (9a85e2a6).
  - Vorher = gate[0].schatten 0 (die Stufe 0 wirft sich selbst), nachher = die Zeile des Gesetzbuchs (Stufe 3 und die
    Kosten-Regel). Beides in EINER Welt, die Tor-Flats werden je Zustand neu gebaut.
  - Je Blick vier Schüsse in der Folge nachher · vorher · nachher2 · vorher2. Das Kontrollpaar desselben Zustands ist die
    Rausch-Grenze.
  - Masken: |wurf − leer| (die Tore nur in den Kaskaden) und |koerper − leer|.
  - Rohdaten: `1110-9/torwurf/bild/`.

| Blick | Schatten-IoU vorher ↔ nachher (streng · ±2 px) | Kontrolle nachher ↔ nachher2 · vorher ↔ vorher2 | was fehlt / was zuviel |
|---|---|---|---|
| 11 m (Ring-Mitte, maschine und verkalkt) | 0,928 · 0,970 und 0,926 · 0,970 | 0,991 · 0,991 | nur vorher 677 px: der Wurf eines Torflügels am Fuß des linken Tors (Nebenwirkung a); nachher zusätzlich 71 px |
| 30 m (30° von oben) | 0,733 · 0,780 und 0,797 · 0,847 | 0,913 · 0,960 | nachher zusätzlich 2 877–4 127 px: der Zwilling wirft auf die eigenen Flächen eines Tors (Seitenwand, Stufen); nur vorher ~100 px |
| 2,6 m (vor der maschine) | — | 0,37 · 0,21 | das erste Paar stand in einer nicht eingeschwungenen Welt (Wurf 66 403 / 5 714 px), das zweite 25 426 / 26 617 px |

- **11 m hält 0,98 nicht.** Der Rest ist der Flügel-Wurf (a). Die Hülle trägt nur, was das Gesetzbuch werfen lässt; im
  Wirt warfen die Flügel-Hölzer. XOR-Karte: `bilder/x-d11.png`.
- **30 m hält 0,98 nicht.** Vor den Schnitten dieses Akts lag 30 m bei 0,652 / 0,684 mit 6 400–7 400 px Überwurf; jetzt
  sind es 2 900–4 100 px.
  - Der Rest ist Selbst-Wurf: Die Hülle steht p95 bis 8,5 cm aus dem Gezeichneten (gate:tor-fern I, `einzugM` 0).
  - Die nahe Kaskade trägt am Genesis-Ring 6,4 × 17 cm je Texel. Der Tiefen-Bias deckt den Überstand dort nicht, wo die Hülle
    vor einer eigenen Fläche liegt. XOR-Karte: `bilder/x-d30.png`.
- **2,6 m ist ehrlich nicht gemessen:** Die eigene Kontrolle hält nur 0,37 / 0,21.
- **Hauptbild** (die Gestalt selbst): 0,93–0,97 je Paar, gleich den Kontrollen (0,95–0,96). Die Stufe 0 bleibt byte-gleich.

## Genesis-ABAB (3+3, GTX 1060, mit Takt; `1110-9/torwurf/abab/`)

- A = main **bb554abf** (abab-b543), B = welle-m-e-torwurf (main gemergt).
- Instrument abab-i543 (wie 1110-12), Seiten-Wache per porta-core-Hash (A 8b201e1a, B ed28b324).
- 6 von 6 Boots im ersten Versuch GRÜN.

| Größe (Median) | A main bb554abf | B torwurf | B − A | Soll E |
|---|---|---|---|---|
| Befehle (Lauf voll) | 201 | 169 | −32 | 208 |
| Dreiecke (Lauf voll) | 946k | 720k | −226k | 680k |
| bau-Klasse (Band): Befehle haupt/k0/k1 | 149 (86/50/13) | 109 (82/26/1) | −40 | 40 |
| bau-Klasse (Band): Dreiecke | 484k | 255k | −229k | 60k |
| gpu-bank an der Gier des Orts (ms, MHz) | 17,74 (17,15 · 17,74 · 17,81; 1716–1725) | 17,64 (17,21 · 17,64 · 18,47; 1708–1717) | −0,10 | — |
| Band: GPU ms je Frame | 18,83 (18,71 · 18,83 · 20,02) | 20,07 (19,24 · 20,07 · 20,40) | +1,24 | 16,7 |
| Frame p95 · fps unter Regler voll | 25,1 · 50,4 | 25,2 · 48,1 | 0 · −2,3 | 33 |
| CPU-Takt p95 voll / frei | 7,3 / 5,7 | 6,8 / 5,6 | −0,5 / −0,1 | 5,8 |
| VRAM MB | 121,6 | 122,4 | +0,8 | 118 |

- **Rest zu E an der Genesis:**
  - Befehle 169 erfüllt.
  - Dreiecke 720k: noch +40k über dem Soll (vorher +266k).
  - VRAM +4,4 MB über dem Soll (vorher +3,6).
  - CPU-Takt p95 +1,0 ms über dem Soll (vorher +1,5).
  - Frame p95 25,2 erfüllt.
- **Die zwei GPU-Maße widersprechen sich.** Die Bank (12 Frames × 3 Runden an der Gier des Orts) sieht −0,10 ms. Das
  Band und der Lauf unter Regler voll sehen +1,24 ms GPU je Frame und −2,3 fps. Mit 3 Boots je Seite ist das nicht
  zerlegt. Zwei Kandidaten, beide nicht getoggelt:
  - (b) Jenseits des Cull-Radius marcht die Fernform ≤ 24 Hüllen-Teile je Pixel statt des Box-Fits.
  - Der Zwilling trägt den EINEN Schatten-Stoff der Bäume, mit der Blenden-Maske in colorNode.a und seit K19 dem Wind. Auf
    den geschlossenen Hüllen-Flächen in k0 kostet das je Fragment.
  - Der VRAM +0,8 MB ist die Stufe 3 im Speicher.

## Das Fernform-Paar

- **80 m** (`bilder/fern-80m.png`, je 59 Befehle):
  - Beide Seiten zeichnen die Tore gleich, als Mesh der Stufe 0. Der Cull-Radius der Bauten ist geregelt auf 100–150 m;
    bei 80 m greift die Fernform der Tore noch nicht.
  - Gemessen ist damit: bei 80 m keine Änderung.
- **170 m** (`bilder/fern-170m-ungleich.png`): ungleich.
  - In A stand beim Schuss der Ring nicht: 25 gegen 30 Befehle, 80k gegen 213k Dreiecke.
  - Ein gültiges Paar der Fernform selbst steht offen. Die Fernform-Wand gate:tor-fern K (≤ 24 sicht-Teile, kein wurf-Teil)
    ist grün.

## Wände (Stand main bb554abf + torwurf, je EXIT=0, `p3/tor/wurf/waende-F/summe.txt` auf dem OMEN)

- format:check · lint · check (gate:ci-deckung nach dem Umzug von gate:tor-fern in Gruppe 9) · worker-dichte
- tor-fern · haus-fern (byte-gleich zu main bb554abf) · porta-contract · asset-contract · regler-wirkt
- nervensystem-porta · -schmiede · -fachwerk · portal-gestalt · portal-membran · blocker-netz · kollision-bild ·
  studio-vertrag
- playtest:fast · der volle Playtest („Alle Invarianten OK“)
- Der Merge von main bb554abf hatte EINEN Konflikt in anazhRealm.js: Beide Seiten fügten neue Methoden an derselben Stelle
  ein (die Kosten-Regel und K19 Laub-Licht). Beide bleiben.
- Die CI-Waage: Nach dem Merge trug Gruppe 4 11,6 min. gate:tor-fern läuft jetzt in Gruppe 9 (8,9 → 10,8 min).

## Nebenwirkungen (stehen im Commit)

- (a) Die Torflügel werfen nicht mehr. Im Wirt warfen ihre Hölzer, die Hülle trägt sie nicht. Wo die Stufe 0 nach der Regel selbst wirft (kathedrale, geisttor), werfen sie weiter. Die Leucht-Teile warfen nie.
- (b) Jenseits von 64 m zeichnet der Welt-March die Fernform aus der Liste (`sicht`, ≤ 24 Teile).
- (c) In Karten-Distanz wirft nichts.

## Geschnitten · Gemessen · Pflicht-OFFEN Rest

- **Geschnitten:**
  - Die NUR-WURF-Stufe 3 der Tore aus der EINEN Hüllen-Liste (N5).
  - Die Kosten-Regel des Wirts (`_wurfVonBilligerer`, generisch, das Haus eingeschlossen). gate:regler-wirkt WURF.
  - Röhren-Ketten auf dem Polygonzug ihrer Röhre, Geflecht-Enden nach der Spreizung, Douglas-Peucker rasterfest.
- **Gemessen:**
  - Genesis: Befehle 201 → 169, Dreiecke 946k → 720k, gpu-bank −0,10 ms, Band +1,24 ms.
  - W min 0,864. Stufe 0 byte-gleich. haus-fern byte-gleich zu main. 19 Wände und der volle Playtest grün.
- **Pflicht-OFFEN Rest:**
  - A · C · E stehen.
  - E an der Genesis: Dreiecke +40k, VRAM +4,4 MB, CPU p95 +1,0 ms über dem Soll.

## Status: ZWISCHENSTAND · Übergabe

- welle-m-e-torwurf **52ac16d8** `[ci voll]` (per ls-remote), auf main bb554abf gemergt. Die CI lief zur Abgabe; ci-lokal wurde
  wegen der Woche nicht gefahren.
- **Offen mit Zahl:**
  - der Schatten bei 11 m (Flügel) und 30 m (Selbst-Wurf, `einzugM` 0, I p95 8,5 cm);
  - Band +1,24 ms gegen Bank −0,10 ms an der Genesis;
  - das Fernform-Paar jenseits des Cull-Radius;
  - kathedrale und geisttor werfen nach der Dreiecks-Regel meist aus Stufe 0. Die Draws trägt Karte (2): 13 Stoff-Züge je
    Tor.
- **Danach:** Karte (2) 13 Stoff-Züge je Tor, dann (3) Dorf-VRAM, wenn keine NOTBREMSE kommt.
