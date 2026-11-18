# EIN GESETZ — der Planet als Funktion

> **P(Same, u, t)**: Der Same `s` (ein Wort), der Ort `u` auf der Kugel (Einheitsvektor, Achse y = Nord) und die Zeit `t` in Ma
> geben jede Größe der untersten Ebene, also Relief, Gestein, Meer, Klima, Wasser und Biom. Jede Stufe liest nur die Stufen
> unter ihr, zur selben Zeit `t`. Jede Stufe ist an EINER Adresse auswertbar. Was nicht lokal ist (der Meeres-Spiegel, der Lauf des
> Wassers), wird je (s, t) auf einer FESTEN Zahl von Proben gelöst, die nicht mit dem Radius wächst. Die Welt ist eine Funktion,
> kein Sack.

Das Gesetz erfindet nichts neben dem Kern: Die Stufen S0–S4 und S7 SIND `planet-core.js` (main, `planet-h2-4`, die Regeln K1–K10
in seinem Kopf, `planet-core.js:15–27`). Neu sind die Stufe S5 Wasser, deren Prototyp in `spike/lib.cjs` steht, die Naht §5 als
EIN Satz und die Tafel §6, in der jede heute gesetzte Größe ihr Urteil bekommt. Ob das Gesetz trägt, entscheidet allein der
Spike (`spike.md`).

## §1 Die Stufen

| Stufe | Liest | Gibt | Wie (Quelle) | Kosten je Adresse |
|---|---|---|---|---|
| **S0 Körper** | den Samen | die Physik-Daten §2 | `planetPlan` zieht sie aus `planetZufall(k, 1, i)`, sofern der Körper sie nicht setzt (`planet-core.js:311–325`) | einmal je Same |
| **S1 Platten** | S0, t | Schollen (Kontinent-Kerne) mit Lage, Alter und Lappen; Platten als Potenz-Diagramm; Euler-Pol je Abschnitt; Schlüsselbilder des Wilson-Zyklus (verstreut · versammelt · gelöst) | E1, E2, K1–K3 (`planetPlan`, `planetScheibe`); Plan ≤ 96 KB | Wertung über ≤ 64 Platten (`MAX_P`, `:275`), fest |
| **S2 Relief** | S1 an u | Höhe in m. Kruste zuerst (K1); der Ozean-Boden aus dem Alter nach GDH1 (K6, `:1152`); Gebirge an Kollisionen und im Anden-Bogen, Gräben, Rifte und Rücken als Schablonen an der Grenze des PAARS (G2.5, `:1242–1338`); Schelf und Hang im Krusten-Profil (`:1413–1430`); Vulkane an Bögen, Rücken, Hotspots und Trapps mit Art, Alter und aktiv (`VULKAN_ART`, `:267`) — Magma ist der Stoff, den diese Art trägt; dazu das Gedächtnis der Nähte im Rahmen der Scholle (K4) und das Mantel-Feld | `planetPunktR` (`:1657`); das Band ≥ 32 km (K8). Unter 32 km formt das Gelände der Heimat (§5) | fest; gemessen in `spike.md` §a |
| **S3 Meer** | S2, wasserKm | den Spiegel, also wo Meer ist | Σ max(0, σ − h) / n = Wasser auf **4 096** festen Hüllen-Proben (`meerLoesen`, `PROBEN_SPIEGEL`, `:1561–1574`); das Eis nimmt Wasser (K7) | einmal je (s, t), fest |
| **S4 Klima** | S2, S3 an u, die Saison | Temperatur (Jahr, Sommer, Winter), Niederschlag, Wind (Ost/Nord, Luv/Lee), Schnee-Grenze, Abfluss | Energie-Bilanz nach North & Coakley (q0, A, B, D, `:1857–1859`) aus Stern-Fluss und Neigung; die Zell-Breite nach Held-Hou aus R, Ω und g; −6,5 K/km; die Feuchte als Integral über 14 Knoten zu je 150 km luvwärts (G2.3); Regenschatten e^(−Δh/1,5 km); der Abfluss nach Turc-Pike | `planetKlimaR` (`:1950`); die globale Bilanz einmal je (s, t) auf N = 256 Breiten (`:1894`) |
| **S5 Wasser** | S2 (der Weg), S4 (die Menge) | den Abfluss Q in m³/s, das Einzugsgebiet, Seen (Spiegel, Überlauf oder End-See), die Mündung ins Meer | **N_W = 40 000** feste Fibonacci-Zellen je (s, t); Priority-Flood vom Meer aus (Barnes et al. 2014); Summe des Turc-Pike-Abflusses stromab; ein See läuft über, wenn Q_in ≥ (PET − P)·A, sonst ist er ein End-See; an der Adresse liest Wendland über 2·d | Prototyp `spike/lib.cjs:70–155`; je Adresse nur das Lesen |
| **S6 Gestein, Boden** | S1, S2, S4 | die Gesteins-Art (Basalt an Rücken, Hotspots und Trapps · Andesit am Bogen · Granit und Gneis im Orogen-Kern · Sediment im Becken · Kalk auf dem Schelf), den Boden aus Gestein × Klima × Hang | benannt, **nicht gespiked**: keine Bahn (`bahnen.md`) | — |
| **S7 Biom** | S4, S2 | die Köppen-Klasse (Peel et al. 2007), die Whittaker-Klasse, die Pflanzen-Deckung aus P/PET mit PET = 400 + 45·T | `planetBiom`, `pflanzenDeckung` | fest |
| **Tag und Jahr** | S0, u | den Stand der Sonne an der Adresse: Deklination δ = ε·sin(2π·d/Jahr) aus `neigungRad` und `jahrTage`; Tag und Nacht aus cos H₀ = −tan φ·tan δ und `tagStunden`; die Saison, die S4 liest | eine Formel je Adresse, ohne Vor-Lauf | O(1) |

**Zeit ist ein Argument.** `planetScheibe(plan, t)` gilt für jedes t in [−4 000, +1 000] Ma (`T_START`, `T_ENDE`, `:271`). Die
Platten fahren zwischen den Schlüsselbildern mit einem Euler-Pol je Abschnitt; der Nachklang mischt den Wechsel über 10 Ma
(`:1209–1236`, K5). Der Material-Ort einer Adresse zu einer anderen Zeit ist `planetOrtDerZeit`.

**Keine Größe wächst mit der Welt.** Je Adresse rechnet eine Stufe nur über feste Mengen: ≤ 64 Platten, 14 Feuchte-Knoten, die
Wendland-Nachbarn einer Zelle. Je (s, t) rechnet sie nur über feste Proben: 4 096 für den Spiegel, 256 Breiten für die Bilanz,
N_W = 40 000 für das Wasser. Der Radius ändert die Weite einer Zelle, nicht ihre Zahl. Das Wasser-Gitter löst deshalb bei
R = 6 371 km auf rund 113 km auf. Kleinere Täler entstehen im Gelände unter 32 km (§5), nicht auf dem Planeten.

## §2 Die Physik-Daten, die bleiben — der Same wählt sie

| Datum | Erde (`PLANET_ERDE`, `:263`) | Der Same zieht (`:311–325`) | Wer liest es |
|---|---|---|---|
| Radius `radiusKm` | 6 371 km | 2 500 … 12 000 km | S1–S5 (jede km→rad-Umrechnung), Held-Hou |
| Schwere `g` | 9,81 m/s² | 9,81·R/6 371·(0,8 … 1,2): die mittlere Dichte 0,8–1,2 × Erde | Relief-Maß `gS` (Gebirgshöhe ∝ 1/g), Held-Hou |
| Wasser `wasserKm` | 2,62 km (Ozean-Volumen ÷ Kugel-Fläche) | 1,9 … 3,1 km | S3 |
| Kruste `krustenAnteil` | 0,41 | 0,33 … 0,48 | S1 (Fläche der Schollen) |
| Achsneigung `neigungRad` | 0,4091 rad (23,44°) | 0 … 0,7 rad | S4, Tag und Jahr |
| Stern-Fluss `sternFluss` | 1 (× Erde) | 0,8 … 1,2 | S4 (q0 · Fluss) |
| Tag `tagStunden` | 24 h | 10 … 50 h | S4 (Ω: Coriolis, Zell-Breite), Tag und Jahr |
| Jahr `jahrTage` | 365 d | 100 … 800 d | S4 (Saison), Tag und Jahr |
| Drehsinn `drehsinn` | +1 | ±1 | S4 (Passat- und Wirbel-Richtung) |
| Alter `alterMa` | 4 570 Ma | 3 000 … 6 000 Ma | S1 (Schild-Alter der Schollen) |

Das sind zehn Daten. Fünf davon nennt der Auftrag: Radius, Schwere, Neigung, Stern-Leistung und Wasser-Anteil. Dazu kommen Tag,
Jahr und Drehsinn, die die Uhr und die Richtung der Zirkulation tragen, das Alter als Zeit-Achse und der Kruste-Anteil, der
sagt, wie viel Kontinent es gibt. Alles andere — Schollen-Zahl, Ozean-Platten, Euler-Pole, Lappen, Becken — zieht `planetPlan`
aus demselben Samen (`planetZufall(k, i, …)`). Das ist Gestalt, kein Physik-Datum. Drei Krusten-Zahlen zieht der Same heute
ebenfalls, obwohl ihr Platz im Gesetz ein anderer ist (§6): `freibordKm`, `shelfKm` und `bodenAlterMaxMa`.

## §3 Was jede Stufe liest — die Kette ohne Rückweg

Kein Rückweg: Das Klima ändert das Relief nicht, und S4 ändert S1 nicht. Der Gegenlauf `spike.md` §d2 misst genau das. Wer ein
Klima-Datum tauscht, lässt Platte, Scholle, Kruste, Rand und Orogen an 2 000 Adressen byte-gleich. Nur das Eis rückt über das
Wasser-Volumen an den Spiegel (S4 → S3, über K7). Das ist der eine benannte Rückweg, und er geht über eine Zahl je (s, t), nicht
über eine Adresse.

## §4 Stetigkeit

Jede Stufe ist eine stetige Funktion von u und t. Wo zwei Seiten zusammenstoßen — Platte an Platte, Kruste an Ozean, Land an
Meer —, entscheidet das PAAR, nie die Seite (G2, ENTSCHEID-2). Beide Seiten rechnen am selben Ort dieselbe Funktion: dieselbe
Grenze, denselben Abstand und dasselbe Gewicht. Eine Klasse, also Biom, Köppen oder Platten-Nummer, darf an einer Grenze
wechseln. Eine Größe darf es nicht. Das prüft `spike.md` §b.

## §5 Die Naht zur Heimat

Die Heimat von heute ist die Kachel-Welt des Gelände-Kerns mit dem Ort-Gesetz `ortGesetz()` (`gelaende-core.js`): Sommer
18 °C, Winter −4 °C, Spende 328,5 mm/a, das Meer 3 m unter der Basis, Kühlung 0,1108 K/m. Diese Heimat wird **EINE Adresse**:

> **anker(s) = `planetAnker(plan, 0, ortGesetz())`** — der Ort des Planeten zur Zeit 0, an dem das Klima des Planeten das der
> Heimat trifft. Jede Heimat-Größe Q gilt an der Adresse u als **Q_Heimat + Δ(u − anker)**: eine Summe x + 0 bzw. ein Produkt
> x · 1 (ENTSCHEID-REISE §1). Am Anker ist jedes Δ `Object.is(…, 0)`.

- **Tag eins ändert sich nicht:** Am Anker ist die Heimat byte-gleich. `spike.md` §f misst Δ = 0 an 5 von 5 Saaten; der Richter
  im Spiel ist `ort.delta.null` (`scripts/diag-planet.cjs`).
- **Der benannte Unterschied** wächst stetig mit dem Abstand vom Anker. Die Zahlen stehen in `spike.md` §f, von 10 m bis 512 km.
- **Zwei Maße bleiben benannt verschieden:**
  1. Die Höhen-Stauchung s_v = 0,0065 / 0,1108 = 0,0587 (E6): Die Höhe der Heimat ist eine gestauchte Höhe des Planeten, gelesen
     aus der EINEN Tafel, nie kopiert.
  2. Das Band: Der Planet trägt nur Wellen ≥ 32 km (K8), das Gelände der Heimat formt alles darunter.
- Die Heimat hört auf, eine eigene Welt neben dem Planeten zu sein, wo ihr Gelände außerhalb des Ankers Größen setzt, die der
  Planet trägt. Welche das sind, sagt die Tafel §6: Jede Heimat-Größe mit dem Urteil FOLGT liest dort ihr Δ, jede mit FÄLLT
  verschwindet. Das ist die Naht als Satz. Gebaut wird sie nur in einer Bahn mit Richter (`bahnen.md`).

## §6 Jede heute gesetzte Größe — FOLGT · FÄLLT · bleibt Same-Datum

`urteil.cjs` gibt jeder der 584 Größen aus `zensus.json` genau EIN Urteil. Grundlage ist die Klasse (`groesse`) mit Stufe und
Heimat-Urteil; jede Ausnahme ist eine Zeile mit Grund. Eine Klasse ohne Urteil bricht beim Namen. Die Kern-Seite urteilt nach einer
Regel:

1. `PLANET_ERDE` ist SAME (Physik-Datum).
2. Eine Zahl mit Literatur-Anker ist GESETZ.
3. Eine vom Samen gezogene Zahl (`·Z`, gleichverteilt) ist SAME.
4. Jede andere Zahl BLEIBT.

Jede Zeile mit Grund steht in `urteil-tafel.md`, die Zahlen in `urteil.out.txt`.

| Urteil | heißt |
|---|---|
| **FOLGT** (Stufe) | Der Wert folgt aus einer Stufe; in der Heimat gilt Q_Heimat + Δ(u − anker), am Anker byte-gleich (§5). |
| **FÄLLT** (Grund) | Der Setzer verschwindet; seine Leser lesen die Quelle, die der Grund nennt. |
| **SAME** | Ein Datum des Samens: die Physik-Daten §2 oder die Gestalt, die `planetPlan` zieht. |
| **GESETZ** | Eine Konstante des Gesetzes mit Quelle (Literatur oder ein bindender Entscheid). |
| **BLEIBT** | Bleibt von Hand gesetzt: der ehrliche Rest, den das Gesetz nicht ableitet. |
| **BAND** | Unter dem Band: Die Heimat formt alles unter 32 km und unter der Saison, gespeist vom Planeten. |
| **TECHNIK** | Zeitraffer, Spiel-Start, Darstellung, Mechanik, Gitter. |

**Die heute gesetzten Größen** sind die mit dem Zensus-Urteil „gesetzt“ oder „gesetzt, Anker“, ohne Technik:

| | heute gesetzt | FOLGT | FÄLLT | SAME | GESETZ | BLEIBT | BAND | TECHNIK |
|---|---|---|---|---|---|---|---|---|
| **alle** | **396** | **59** (15 %) | **16** | **38** | 39 | **110** (28 %) | 119 (30 %) | 15 |
| Kern `planet-core.js` | 162 | 1 | 4 | 36 | 15 | **105** (65 %) | 0 | 1 |
| Heimat | 234 | 58 | 12 | 2 | 24 | 5 | 119 | 14 |

Über alle 584 Größen (mit dem, was heute schon folgt) lauten die Zahlen: FOLGT 158 · FÄLLT 16 · SAME 38 · GESETZ 39 · BLEIBT 110 ·
BAND 119 · TECHNIK 104.

**FOLGT — 59 heute gesetzte Größen bekommen eine Stufe:**

| Stufe | Größen | Zahl |
|---|---|---|
| S0 Körper | jahrTage (c8), das Jahr in Uhr-Sekunden (c13), die Achsneigung der Sonne (d65), die Tropopause ∝ T/g (e157) | 4 |
| S2 Relief | Land-Anteil (a23), Relief-Maß (a25), Großform C → m (a27), Gebirge E → m (a28), Küsten-Rampe (a29), Tafel (a34), Trog (a35), ks (a40), Schelf und Meeresboden (a43, a67, a68, b8, b20) | 13 |
| S3 Meer | der Meeresspiegel der Heimat (a7): am Anker −3 m, byte-gleich | 1 |
| S4 Klima | Sommer und Winter am Meer (c1, c2), Tagesgang (c5), Sommer-Phase (c7), Abflussspende (b70, d10), Verdunstung (b79), Regen- und Sturm-Quote (c27, c28), Schneegrenze (c64), Waldgrenze (c83), das „Klima“ des Walds (d26), Trockenheit (d28), Phänologie von Laub, Blüte und Halm (d84, d85, d86) | 16 |
| S5 Wasser | der Grundwasser-Tisch (b66) | 1 |
| S6 Gestein, Boden | Schicht-Dicke und Hart-Anteil (a59, a60), Basalt (a90), Strata (a92), Erz-Adern (a93), Bankung (a97), Grundton (a98), Boden (a108, a109, a110) | 10 |
| S7 Biom | Trocken-Bogen (c82), Nadelholz-Grenze (d16) | 2 |
| Tag und Jahr | die EINE Tag-Achse (d68), Tageszeit-Etikett (d54), Tagesplan der Bewohner (d55), Sternfeld (d56), Sonnenwinkel und Bahn (d59, d60), Deklination (d64) | 7 |
| §5 Naht | Ursprung (a2), Basis-Höhe (a6), Landung (a87), Breite und Länge der Heimat (d63, d66) | 5 |

**FÄLLT — 16 Setzer verschwinden:**

| id | Setzer | Grund |
|---|---|---|
| b4, b5 | Meer-Vorgabe +4 (`gelaende-core.js:520`) und 0 (`stamm/wasser-zellen.js:206`) | Zwillinge des Spiegels; er folgt S3 |
| b11, b12 | `atlasSpiegel` −∞ und `wasserSpiegel` −3 jenseits der Kachel (`gelaende-core.js:7756`, `:7697`) | Das Meer ohne Ort; der Spiegel an der Adresse folgt S3 und S5 |
| a36 | Höhen-Deckel ≤ 267 m (`gelaende-core.js:1883`) | Klemme; die Höhe folgt S2 × s_v |
| a88 | `terrainSteepness` (`stamm/dirigent-kern.js:282`) | Zwilling der Relief-Skala a25; das Maß des Gebirges folgt S2 (gS ∝ 1/g) |
| d4 | Samen der Welt als Vorgabe (`stamm/feld-leben.js:1794`) | Zwilling der Saat a4 |
| d72–d76 | eigene Sonnen-Schwellen von Tieren, Morgenchor, Schwarm, Bestäubern und Grille (`tetrapoda-core.js:131`, `:2381`, `:2458`, `:2916`, `klang-core.js:492`) | Zwillinge der EINEN Tag-Achse (`welt-licht.js:728`) |
| e135 | `BEZUG_MA` (`planet-core.js:273`) | toter Name, nie gelesen |
| e217, e222, e223 | `wildnis.kontinentLambda`, `schichtDicke`, `hartAnteil` (`planet-core.js:2323`, `:2328`, `:2329`) | Δ ≡ 0 per Bau; die Wellenlänge ist Band, Schicht und Härte folgen S6 |

**SAME — 38 Daten des Samens:**

- **Die zehn Physik-Daten §2:** `PLANET_ERDE` e1–e4 und e6–e11.
- **Drei Krusten-Zahlen** (e5 `freibordKm`, e12 `bodenAlterMaxMa`, e13 `shelfKm`). Der Same zieht sie, ihr Platz im Gesetz wäre ein
  anderer: der Freibord aus der Isostasie, das Boden-Alter aus S1, der Schelf aus dem Eis-Spiegel S3. Das ist nicht gespiked und hat
  keine Bahn; sie bleiben Same-Datum.
- **23 Gestalt-Zahlen**, die `planetPlan` zieht: Schollen- und Platten-Zahl, Alter, Lappen, Raten, Naht-Höhe, Schürze, Hotspots,
  Trapps und Kegel. Den Bereich jedes Zugs eicht die Erde (Richter: `spike.md` §c, Linse bau3).
- **Der Same selbst** (a4) und sein Rausch-Strom (a5).

**GESETZ — 39 Konstanten mit Quelle:**

- **Im Kern 15:**
  - North & Coakley 1979 (q0, olrA/olrB) und North 1975 (Albedo, Eis);
  - Gough 1981; Stein & Stein 1992 (GDH1); Peel et al. 2007 (Köppen); Turc 1954 / Pike 1964;
  - die Standard-Atmosphäre (−6,5 K/km); Clausius-Clapeyron (der Kern fährt 5 %/K gegen ≈ 7 %/K nach Held & Soden 2006);
  - das Band K8 (e70, e71) und die Achsen-Konvention (a3).
- **In der Heimat 24, die Physik am Ort:**
  - Hock 2003 (Grad-Tag); Manning; Nash 1957; Dunne & Leopold 1978; Snyder 1938 und Hack 1957;
  - Gold (die tragende Eisdecke); Koschmieder (die Sichtweite); Ellenberg et al. 2001 (Zeigerwerte);
  - die bürgerliche Dämmerung bei −6° und weitere, je mit Quelle in `urteil-tafel.md`.

**BLEIBT — 110 von Hand gestimmte Zahlen, der ehrliche Rest:**

- **Im Kern 105**, das sind 65 % seiner heute gesetzten Größen und 55 % seiner 192 Welt-Maße. Nach Klassen: Gebirge 14,
  Niederschlags-Gürtel 12, Platte 7, Küste 7, Vulkan 6, Landform 5, Relief-Höhe 5, Jahres-Amplitude 5, Drift 4 und weitere.
  - Das Gesetz leitet die STRUKTUR ab (Gebirge an Kollisionen, Wüsten am Hadley-Rand, Lee hinter dem Grat), nicht diese Zahlen.
  - Ihr Richter ist die Erde: `spike.md` §c und die Linse `diag-planet.cjs --richter bau3`.
- **In der Heimat 5:**
  - die Gezeiten (b82) und „Mond = −Sonne“ (d94) — einen Mond gibt es im Gesetz nicht (§2);
  - die wärmste Stunde 0,625 (c6);
  - zwei Kanäle der Licht-Achse (d70, d71).

**BAND — 119 Größen bleiben das Gesetz der Heimat unter dem Band**, gespeist vom Planeten mit Q, T, P und dem Hang:

- **Relief und Wasser:** Höhlen 8, Tal-Netz 6, Relief-Wellen 5, Schicht-Treppe 4, Aue, Mäander, Ufer, Damm, Wasserfall.
- **Wetter:** Böe und Wetter 6, Wolken, Nebel, Fronten.
- **Wuchs:** Arten-Nische 5, Bestands-Muster 4, Rausch-Stimmen 4, Unterwuchs 3.
- **Bühnen:** Insel, Rampe, Bahn und Klemme des Prüfplatzes.

**TECHNIK — 15:** Zeitraffer (Tag der Uhr, das Jahr läuft), Spiel-Start, Darstellung (Mondlicht, Tönung, Wiegen), Erdbau und das
Gitter der Brücke (leit 9×9).

**Was dieses Urteil NICHT beweist:**

1. **Zwei Stufen sind ohne Spike.** 10 FOLGT-Größen stehen auf S6, das nicht gespiked ist, und 7 auf „Tag und Jahr“, einer
   Lehrbuch-Formel ohne Spike. Beide haben deshalb keine Bahn (`bahnen.md`).
2. **Grundwasser fehlt.** Der Grundwasser-Tisch (b66) folgt S5, aber der Prototyp von S5 rechnet kein Grundwasser.
3. **Das Urteil ist ein Satz über die Quelle, nicht über das Spiel.** Konsum erst, wenn eine Bahn eine FOLGT-Größe im Spiel liest
   und ihr Richter es misst.
