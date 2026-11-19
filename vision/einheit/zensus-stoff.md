# Zensus STOFF UND LICHT (Baum b7ed8419, 19.11.) — Leser-Blatt; Zählung per git grep, *.js ohne tests/vendor/scripts/worlds/*/lib.

## 1 Die Quellen (je Zeile: Name · Ort · Größen · Leser · Zwilling von)

| # | Quelle | Datei:Zeile | trägt | Leser | Zwilling von |
|---|---|---|---|---|---|
| Q1 | STOFF_GESETZ (REIN 26 + MISCH 4 Zeilen) | schmiede-core.js:2860, Spalten :2911 | physikalisch: ρ kg/m³, E Pa, n, Abbe, c, T_schmelz, η; **rauheit** (Tuning, MERL-gestützt, bau-vorlagen.js:1655–1662); metall aus Bindung (:3026–3033); F0 aus n (`fresnel0`) | Werk-Stoff über `_stoffOptik` (bau-buch.js:1594 → stoff-material.js:833); Wasser-F0 (wasser-hydro.js:859–860) | — (Soll-Quelle) |
| Q2 | Stoff-Tafel der Welt `_defaultMaterials` (21 Zeilen) | bau-vorlagen.js:1566, Zeilen :1756–1942 | Ansicht auf Q1 (Getter :1720–1733) + **Farbe als sRGB-Hex** (`make("holz", …, 0x5e3a1c`) + 10 Tags 0..1 (bau-vorlagen.js:2106) | Bau-Teile, Siedlungs-Bauplan (siedlung-bauten.js:957), Physik | Albedo-Zwilling zu Q3–Q6 |
| Q3 | Schmiede-Stoffe `M` (steel, iron, bronze, leather, wood …) | schmiede-core.js:79–140, `STOFF`-Band :205 | Tuning: color-Hex, roughness, metalness | Brücke → Studio-Stoff (foundry-bruecke.js:670–673) | Q1 im SELBEN Kern |
| Q4 | Fahrzeug-Stoffe `materials()` + LACK_ART + EPOCHE_STOFF_ART + LACK_GESETZ | vehicle-core.js:140–186, :307, :331, :3333 | Tuning: Hex, roughness, metalness, clearcoat 1/0,03, Lasur | Brücke → Studio-Stoff | Q1, Q3 |
| Q5 | Fachwerk-Stoffe (27 + MM.tuch/ware) | fachwerk-core.js:2065–2091, :6535 | Tuning: Hex, roughness, opacity, DataTexture-Karten im Labor (:2063) | Brücke → Studio-Stoff | Q1, Q3, Q4 |
| Q6 | VERBAND_GESETZ (Mauerwerk, Deckung, Putz, Naturstein, Fachwerk) | fachwerk-core.js:1847 | Maße in m (Stein 0,24 × 0,071, Fuge 0,011), Ton als Tuning | Welt `_verbandStoff` (studio-stoff.js:141, Ruf :740) | Q7 |
| Q7 | STEIN_GESETZ (Quader, Kopfstein) + `steinZiehung` | porta-core.js:301–319 | Fase/Fuge m, Ton Tuning, Korn 0/1 | Welt `_steinStoff` (stoff-material.js:2707; siedlung-wege.js:1599) | Q6 |
| Q8 | MATERIAL_KLASSEN · HAUT_LOOK · HAAR_LOOK | koerper-core.js:739, :774 | Tuning: r, Hex, SSS-Saum pow/amt, Klarlack 0,12 | studio-stoff.js:479–487, :596 | Q9 (Seh-Klasse „auge") |
| Q9 | TIER_MATERIAL_KLASSEN · FELL_LOOK · FELL_SCHALE | tetrapoda-core.js:3688, :3711, :3765 | Tuning: r, Glut des Auges, Rim/Sheen | studio-stoff.js:486–487, :598–608 | Q8 |
| Q10 | `budgetRegler` (Defaults ohne mp: Rinde 0,93 · Laub 0,62 · Halm) + HALM_GESETZ | phyto-core.js:5965–5995, :6846 | Tuning-Defaults; DER Schlüssel jedes Studio-Stoffs (`budgetStoff` :5998) | `_foundryTreeMaterial` (studio-stoff.js:256) | Q1 |
| Q11 | FELS (Bankung, Moos, Flechte) | gelaende-core.js:3349 | Geometrie m + Ton | Boden-Stoff; Alter des Steins (bau-vorlagen.js:1680) | — |
| Q12 | Substanz-Antwort (Tags → Glimmen, Mikro) + AERIAL | stoff-material.js:740–770, :3820 | Tuning: glimmen = 0,55·magie + 0,6·wärme·brennbar; micro 0,14, ao 0,38 | Werk-Stoff, Siedlung (siedlung-bauten.js:973) | Q1 (Tag „dichte" neben ρ) |
| Q13 | NÄSSE + PFÜTZE | stoff-material.js:3788–3818, Gesetz :2203 | Zeit s (benetzen 150, verdunsten 480), Poren je **kind** (7 Einträge :3798) | `_naesseImStoff` an `_leuchtStoff` (:2092) — EIN Engpass | — |
| Q14 | ALTER je Stoff + WERK_ALTER | bau-vorlagen.js:1684–1693; siedlung-satz.js:1971 | Ziel-Albedo linear, Tage (Holz 200/40, Eisen –/10, Stein 3 Schichten) | `_werkAlterFaerbe`, `_satzAlter` (siedlung-satz.js:1129) | — |
| Q15 | BAND je Stoff (lineare Albedo-Spanne, 11 Bänder) | scripts/diag-gegenstand-stoff.cjs:74–85 | physikalisch (Frostbite 2014) | nur die Linse | Albedo-Soll lebt im RICHTER, nicht im Gesetz |
| L1 | welt-licht.js (Atmosphäre, Umgebung 128×64 PMREM, `durchsicht`, GLANZ_RAUHEIT) | welt-licht.js:1–60, :688–694 | Licht in Welt-Einheiten KEY_BASE·π (`LEGACY_LICHT` :53), keine lx-Einheit | bild-himmel.js:715–727 (environmentNode jedes Stoffs) | Zweig licht-eine-skala (s. 4) |
| L2 | Spiegel-Pass + Glanz-MRT | bild-sicht.js:664, :750, SPIEGEL :3942 | Schirm-Strahl ¼ Auflösung (`teil: 4`), Rauheit-Schwelle | Szenen-Pass (bild-kosten.js:2261) | — |

**Zahl: 15 Stoff-Quellen + 2 Licht-Nähte.** Drei Vokabulare für „was ist der Stoff": Q1/Q2 Namen (30 bzw. 21), das Band-Vokabular
`__stoff` (11 Bänder, Q15), die Seh-Klasse `__seh` (7: stoff·haut·haar·auge·glas·metall·glut, phyto-core.js:5941).
Material-Konstruktoren im Spiel-Code: 99 MeshStandard, 4 Physical, 38 Basic, 21 Lambert, 15 BasicNode, 6 StandardNode;
`roughness`-Literale 120, `metalness`-Literale 123 (vehicle-core 37, fachwerk-core 29, schmiede-core 13 …).

## 2 Die Zwillinge beim Namen (dieselbe Frage, verschiedene Antworten)

**Z1 — die größte Klasse: Rauheit/Albedo je Stoff, Werk-Pfad gegen Studio-Pfad.** Der Werk-Stoff liest Q1 (stoff-material.js:833);
der Studio-Stoff (jedes Fahrzeug, Haus, Klinge, Tor) liest die Kern-Literale, die die Brücke als `mp.roughness` reicht
(foundry-bruecke.js:671; phyto-core.js:5971–5978) — Q1 wird dort nie gefragt. Antworten auf „Rauheit von Holz":
0,84 (schmiede-core.js:2893) · 0,66 (schmiede-core.js:134 `wood`) · 0,88 (fachwerk-core.js:2065) · 0,82 (vehicle-core.js:332) ·
0,93 (phyto-core.js:5974 Rinde) · 0,90 / 0,86 / 0,95 (fachwerk :2066, :2074, :2086) = **8 Zahlen für EINEN Stoff**.
Eisen: 0,54 (Q1 :2922) · 0,46/Metall 0,9 (schmiede-core.js:102 `iron`, SELBER Kern) · 0,62/0,8 (vehicle-core.js:337) · 0,5/0,55 (fachwerk :2075).
Bronze 0,25 (:2923) · 0,40 (schmiede :114) · 0,38 (vehicle :335). Leder 0,40 (:2894) · 0,82 (schmiede :120) · 0,58 (vehicle :334).
Glas 0,05 (:2924) · 0,02 (vehicle-core.js:92) · 0,15 opacity 0,42 (fachwerk :2071) · 0,22 **metalness 0,45** (fachwerk :2091 `glasfern`).
Albedo: Q2 trägt Hex (bau-vorlagen.js:1756ff), Q3–Q5 tragen eigene Hex, das Soll-Band steht nur in Q15.
SCHNITT: Q1 bekommt die Spalten `albedo` (linear, aus dem Band Q15) und `f0`; jede Kern-Tafel Q3–Q5/Q8/Q9 nennt je Stoff NUR den
Q1-Namen (+ Abweichung als benannte Schicht: Lack, Beize, Politur); `budgetRegler` (phyto-core.js:5965) liest Rauheit/Metall/Albedo
aus Q1 über `mp.stoff` — die 120 roughness-Literale fallen auf die Zeilen von Q1.

**Z2 — Seh-Klasse als Stoff-Name.** `WERK_ALTER.seh = { stoff: "stein", metall: "eisen" }` (siedlung-satz.js:1980), gelesen in
`_satzAlter` (:1135): jeder Studio-Stoff der Klasse „stoff" im Bau-Satz — Putz, Holz-Balken, Ziegel, Stroh — altert als STEIN
(Moos Nord, Flechte oben). SCHNITT: Satz liest den Q1-Namen aus `__stoff` statt der Seh-Klasse (fällt mit Z1).

**Z3 — Auge.** Mensch Sklera/Iris/Pupille r 0,25 (koerper-core.js:740–748), Tier Hornhaut r 0, Auge 0,06 + Glut 0,29 × ei 0,3
(tetrapoda-core.js:3690–3693); die Welt faltet Seh-Klasse „auge" zu EINEM Stoff (koerper-core.js:741–745). FUND 19.11. 05:57: das
Tierauge leuchtet emissiv statt Rückstrahl. SCHNITT: eine Zeile `hornhaut` (Tränenfilm n 1,336) in Q1, beide Kerne lesen sie.

**Z4 — Licht im Stoff gegen die EINE Licht-Kette.** stoff-material.js:736–738 und :774–783 erklären Rim/Glow als gefallen (F6);
studio-stoff.js:470–471, :591–608 webt HAUT_LOOK-SSS, FELL_LOOK-Rim/Sheen und den microFur-Funken als **emissive Additive** —
leuchtet im Schatten wie in der Sonne. SCHNITT: die Terme wandern in das Licht-Modell (wie `_haarLichtModell`, studio-stoff.js:39),
× Bestrahlung der Quelle; ohne Licht 0.

**Z5 — zwei Mauerwerk-Gesetze.** VERBAND_GESETZ (fachwerk-core.js:1847) → `_verbandStoff` (studio-stoff.js:141) und STEIN_GESETZ
(porta-core.js:301) → `_steinStoff` (stoff-material.js:2707): je eigene Fuge, Ton, Korn, Ziehung (Verband: Zufall der Karte;
Stein: `steinZiehung`). SCHNITT: VERBAND_GESETZ wird Zeile von STEIN_GESETZ (Quader/Kopfstein/Läufer/Biber/Putz in EINER Tafel,
EINE Ziehung), `_verbandStoff` ruft `_steinStoff`.

**Z6 — sRGB→linear sechsfach abgeschrieben:** schmiede-core.js:239, vehicle-core.js:277, fachwerk-core.js:2333, koerper-core.js:1770,
foundry-core.js:5644/8230/9312, phyto-core.js:1067/4563, bau-vorlagen.js:1678, daten.js:552. Fällt mit Z1 (Q1 trägt linear).

**Z7 — Sinus-Hash im Shader** trotz `steinZiehung`-Urteil (porta-core.js:312–315: „je Gerät verschieden"): studio-stoff.js:607
(microFur), foundry-core.js:911 (GLSL Instanz-Ton). SCHNITT: beide auf `_rauschAtlas` (stoff-material.js:2398).

**Z8 — Ton der Ferne je Studio.** fachwerk `tonUebertrag` (fachwerk-core.js:2712) skaliert die L2-Ecken mit EINEM Luma-Faktor je
Klasse, Klemme 0,25–4 (:2709); FUND 19.11. 11:48: 5–14 lin×255 Abstand zu L0. Das ist das LOD-je-Studio-Muster des Schöpfers im
Stoff: die Ferne korrigiert die Farbe statt sie aus demselben Stoff zu rechnen. SCHNITT: fällt mit Z1 — Ferne und Nähe lesen
dieselbe Q1-Albedo, der Faktor stirbt.

## 3 Wer baut sein Material am Gemeinsamen vorbei

- Jeder Zweit-Kern (vehicle, fachwerk, schmiede, porta, koerper, tetrapoda): Q3–Q9 statt Q1 (Z1). Nur `_defaultMaterials` und die
  Schmiede-Mechanik (schmiede-core.js:3089) lesen Q1.
- Die Studio-Seiten bauen zusätzlich eigene Labor-Stoffe: garage.js 14, fachwerk.js 22, schmiede.js 12, phytogenesis.js 10,
  koerperstudio.js 4, tetrapoda.js 2 Konstruktoren.
- Wand-Tiefe: der Studio-Bau-Stoff bekommt Mikro-Relief nur bei `flat && kind === "unknown"` (studio-stoff.js:368); Schmutz und
  Kavität (`_substanceCharacter`, stoff-material.js:2831, :2932) nur der Werk-/Boden-Pfad. Befund 13.11. (koordination
  bericht/1113-schwarm/22-stoff-system.md) nennt dieselbe Lücke; am Baum unverändert.

## 4 Die Naht zum Licht

- main: Licht in Welt-Einheiten (welt-licht.js:53, :688–694); Glimmen `min(1,5; glimmen·0,6)` (stoff-material.js, im Zweig ersetzt),
  Studio-Leucht = Laborzahl (studio-stoff.js, im Zweig ersetzt). Zweig origin/licht-eine-skala: 5 eigene WIP-Commits (1713e567 …
  b0db5749), **nicht gelandet**; setzt `EINHEIT_LX`, `GLIMMEN_CD_M2 = 1` („HYPOTHESE") und Flamme in cd/m². Offene Fund-Zeilen
  dort: Fahrzeug-Licht ohne ECE-Datum (vehicle-core.js:162–186), Fenster leuchtet ohne Licht zu werfen (fachwerk-core.js:6540).
- Umgebung = nur der Himmel, 128×64 PMREM (bild-himmel.js:715–727) — kein Orts-Spiegel; lokale Spiegelung nur Schirm-Strahl in ¼
  Auflösung (bild-sicht.js:3942–3950 `teil: 4`).
- **Schlieren bei Fahrt (Hypothese, belegt bis zur Ursache):** TRAA reprojiziert NUR die Kamera-Bewegung (bild-kosten.js:2499–2509:
  „was sich selbst bewegt … fängt die Varianz-Klemme"); das Feld der eigenen Bewegung trägt nur `playerMesh` + Gerät in der Hand
  (bild-kosten.js:2647–2663). Ein fahrender Wagen mit Klarlack-Spiegel ist kein Träger → seine Geschichte kommt vom Grund daneben.
  Ob der gefahrene Wagen unter `playerMesh` hängt: unbelegt. SCHNITT: `_traegerTeile` nimmt jeden bewegten Studio-Körper im Blick
  (Box je Wagen, TRAEGER.teile bild-kosten.js:3011), nicht nur den Leib.

## 5 Was zwischen heute und „fotorealistisch aus EINEM Stoff-Gesetz" fehlt (je Lücke der Ort, an dem es fehlt)

1. **Albedo im Gesetz** — fehlt in `SPALTEN` (schmiede-core.js:2911); heute Hex in bau-vorlagen.js:1756ff und Q3–Q5.
2. **F0/IOR im Stoff** — `fresnel0` hat 1 Leser (Wasser, wasser-hydro.js:860); Glas, Lack, Edelstein fahren r184-Default.
   Fehlt in `_foundryTreeMaterial` beim Bau (studio-stoff.js:324–333) und `_buildPbrNodeMaterial` (stoff-material.js:845–848).
3. **Glas als Durchgang** — Glas ist Alpha-Deckkraft (`__weltLicht.durchsicht(mat, R.op)`, studio-stoff.js:342), kein
   Fresnel-gewogener Durchlass; `glasfern` ist ein Metall (fachwerk-core.js:2091).
4. **Schichten** — Klarlack nur über `cc` (phyto-core.js:5987); keine Schicht „Lack über Holz" (lackholz nur r 0,3,
   vehicle-core.js:334), keine Schicht Wasserfilm über Klarlack. Fehlt als Schicht-Liste je Q1-Zeile (schmiede-core.js:2920 MISCH).
5. **Mikro-Detail jeder matten Fläche** — studio-stoff.js:368 (`mikro` nur Facetten-Stein).
6. **Schmutz** — nur `_substanceCharacter` (stoff-material.js:2932); Studio-Stoff hat keinen Ast (studio-stoff.js:740 ff).
7. **Alter** — 3 von 21 Stoffen (bau-vorlagen.js:1684–1693); Fahrzeug: 0 Treffer für Rost/Patina/Verwitterung in vehicle-core.js;
   Lack verblasst nicht, Gummi härtet nicht. Fehlt an `lackStoff` (vehicle-core.js:314) bzw. im Alter-Kern (siedlung-satz.js:889).
8. **Nässe je Stoff** — Poren je kind, 7 Einträge (stoff-material.js:3798); Holz, Putz, Stein, Lack nässen gleich (poren 1).
   Fehlt als Spalte Porosität in Q1.
9. **Beläge** — Asphalt und Beton: 0 Stoff-Zeilen, 0 Gestalt (nur Reibungs-Prosa bau-vorlagen.js:1590, :1604); Marmor 3 Erwähnungen,
   keine Zeile. Fehlt in Q1 (schmiede-core.js:2885 REIN) und BELAG_GESETZ (fachwerk-core.js:10060, trägt nur Jahr und Ordnung).
10. **Licht-Einheit** — fehlt in main (welt-licht.js:53); der Zweig licht-eine-skala trägt sie ungelandet.

## Unbelegt
Ob der gefahrene Wagen als `playerMesh` im Träger-Feld steht; ob die Studio-Seiten ihre Labor-Stoffe in der Bühne der Welt noch
zeigen (14/22/12 Konstruktoren gezählt, Leser nicht verfolgt); Bild-Wirkung aller Zwillinge (kein Bild gesehen, kein GPU-Lauf).
