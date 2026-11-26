# kosmos-hadley — Stand-Blatt

Zweig `kosmos-hadley`. Die Basis war `origin/kosmos-bahn-2` 3bb9abb7, seit dem VORRANG vom 26.11. 04:06 ist es `kosmos-bahn-3` 806a367d
(auf main eae94514). Seit der Landung von `w28-kosmos-bahn` steht der Kopf auf main (Kopf 1 auf c0634d86, Kopf 2 auf c814741e). Sprossen:
`karte2.planet.kopplung.bahn-klima#2` und `karte2.leben.evolution.fremde-physik#1`.

## Kandidat 2 für systeme#1 (Koordinator 10:30: die Station wirft am Gerät)

- Täter gelesen: die Akte der Geräte-Zeile (OMEN a954d698, `messung/roh/a954d698-{gtx,radeon}/karte2.planet.kosmos.systeme_1.out`) sagt
  „Fächer 0/1460 Adressen (1460 Zeiten) in 142 ms · … · 1460 warfen (MOND_EPHEMERIDE is not defined)“. Das Budget war es nicht: der
  Fächer schickt HIMMEL_AN als TEXT in die Seite, und MOND_EPHEMERIDE stand auf oberster Ebene des Moduls. Danach `null.toFixed` an
  `meisterkarte-quelle/punkte/stationen/k2-kosmos.js:504` im Zweig `punkte-maschine`. Mein Prüfstand von Kandidat 1 zog die Ephemeride aus dem Modul in Node — die Maske; er fällt.
- Geschnitten (`cloud-post/kosmos-bahn-station/k2-kosmos-systeme-s1-kand2.patch` gegen punkte-maschine 3bc807a55): MOND_EPHEMERIDE
  steht IN HIMMEL_AN; der leere Fächer ist `L.leser(1, „der Fächer maß 0 von N Adressen · <Akte>“, 0)` wie ereignisse#1 · galaxien#1.
- Gemessen (`pruefstand-systeme-s1-kand2.cjs`: der BEFEHL der Station als Text, eine Null-Welt des Spiels, der Rumpf der Werkbank;
  10,8 s, GRÜN 3 von 3): EICHUNG die alte Station wirft wie am OMEN · LEER ein Leser beim Namen, kein Wurf · VOLL 1460/1460 Adressen,
  ephemeride_abw_grad 0,1319° (Soll ≤ 0,5°).
- Die Linse der Klasse (`punkte-wand-abschluss.patch`, Wand ABSCHLUSS in `liste` neben Wand ANKER, mit Selbsttest): ein freier Name
  des Befehls, den das eigene Modul der Station deklariert → ROT beim Namen. liste Basis 0 ROT (30,8 s) · Linse × alte Station 7 ROT,
  systeme#1…#7 „der Befehl reist ohne MOND_EPHEMERIDE“ (34,5 s) · Linse × Kandidat 0 ROT (37,6 s). Über 1 976 Stationen hat die Klasse
  genau dieses EINE Mitglied. Der Selbsttest der Maschine am Kandidaten: 291 von 295 GRÜN (die Zeile ABSCHLUSS GRÜN); die 4 ROT (BEFEHL
  TRÄGT · WACHE ×2 · LEBENSZEICHEN DES ZEUGEN) stehen gleich an punkte-maschine 3bc807a55 ohne den Kandidaten (290 von 294, 6 min 36 s).

## Das geerbte Rot an main c0634d86: `ort.frage.bytes` (die Gipfel-Suche)

- Gemessen an main c0634d86 ohne diesen Kopf: `diag-planet --anker` Exit 1. Die Zeile `ort.frage.bytes` ist ROT:
  SHA 8aa55db63e294c15 gegen die eingefrorene 22ec9a313b0ea9bf.
- Der Täter ist der Zusammenstoß zweier Landungen:
  - `w28-buendel-jagd` brachte die Linse; ihre SHA ist eingefroren am Kern von main 2da17e2e7.
  - `w28-kosmos-bahn` brachte das Gesetz „die Jahreszeit folgt der Neigung“ und wurde auf eae94514 gemessen, ohne die Linse.
- Der Nachbau (wörtlich `frageGang`/`frageAntwort`) gibt am Kern von main e71f27212 bit-genau 22ec9a31/b7ff79ae.
- Am Kern nach der Landung von kosmos-bahn gibt er 8aa55db6/3d14907b.
- Bewegt sind NUR:
  - Sommer und Winter an 138 000 von 138 000 Antworten (bis 17,67 K),
  - die Sommer-Phase an 11 498 Antworten (0,5: der Süden im halben Jahr).
- Bit-gleich stehen Höhe, Kontinent, Meer, Wetter, Wuchs, Eis und Wildnis. Das Relief der Gipfel-Suche bleibt also gleich:
  2 804 Gipfel > 2 km, 99,0 % an konvergenter Grenze.
- Die Hadley-Zelle dieses Kopfs bewegt 0 von 138 000.
- Die Linse sagt selbst: „ein Gesetz, das eine Antwort bewegt, friert die SHA neu ein, vorher ↔ nachher am selben Gang“. Die SHA steht
  darum neu eingefroren mit dem Gesetz w28-kosmos-bahn; der Grund steht im Kommentar über `FRAGE_SHA`.
- Danach: `--anker` 5 von 5 GRÜN (Exit 0, 26 s) und `--anker --selftest` 9 von 9 GRÜN (Exit 0, 8 s). Der gepflanzte Täter
  `ort.frage.bytes feuert` (Relief um 10⁻⁶ m) fällt weiter ROT.

## VORRANG kosmos-bahn-3 (Abgabe 26.11.)

- Der Push von `kosmos-bahn-3` ist über den Briefkasten-Workflow freigegeben (Koordinator 04:06).
- Kopf `806a367d` ist EIN glatter Commit auf origin/main eae94514, draft PR https://github.com/MiguellD/AnazhRealm/pull/100.
- 05:12: Der Koordinator hat ihn ANGENOMMEN. Er fährt im Bündel `buendel-kosmos` 3c4d81de (kosmos-bahn-3 + jagd-quote-2, Stempel
  `w28-kosmos-bahn`). Die drei Einzel-Läufe hat der Koordinator abgebrochen, weil main das Jagd-Rot trug.
- Der Kopf kosmos-hadley geht als 3-Wege-Diff (3bb9abb7 → kosmos-hadley) sauber auf das Bündel: 7 Dateien, die zwei Heilungen fallen
  deckungsgleich zusammen.
- Anker-Wand: vorher Wurf (Exit 1), nachher 4 von 4 GRÜN.
  - planet-core.js `planetOrt`: Ein Anker ohne Jahres-Gang ist eine gültige Welt, die halbe Spanne des Orts reist dort absolut gegen 0.
  - Bei Spanne > 0 rechnet der Code wie 3bb9abb7, die Erde bleibt byte-gleich.
  - `diag-planet` 13 GRÜN, 0 ROT.
- Licht-Invariante 6.G3.a: vorher ROT (um Mitternacht y −31,2, der Mond unter dem Horizont). Nachher kommt das Soll aus der Bahn
  (`kosmosZeit`): Vollmond Tag 17 mit Licht oben 2,96e-7, Neumond Tag 3 mit Licht 0. Voller Playtest 3 710 ✅, 0 ❌.
- Lokal geprüft:
  - `check:statik` mit Exit 0, probe-tag OK, die Siegel-Wand leer.
  - Die Stations-Patches `cloud-post/kosmos-bahn-station/` sind byte-gleich zu 3bb9abb7. Sie gehen auch gegen punkte-maschine c23e7c1d mit
    `patch --dry-run` sauber durch.
- Die Tore des Probe-Rufs, lokal auf swiftshader (`probeUrteil`):
  - gate:webgl-probe GRÜN.
  - gate:pruefbuehne-licht, gate:weltbild-frost:echt (unter xvfb fällt der GPU-Prozess: „A valid external Instance reference no longer
    exists“) und gate:tag-achse:echt („DIE WELT STEHT NICHT nach 3601 Takten“) sind auf swiftshader nicht urteilbar. Der Probe-Ruf weckt
    die Radeon: Dort urteilte sie denselben Licht-Code (kosmos-bahn-2 3bb9abb7, Lauf 45731231617) in allen vier Toren GRÜN.
- Der Betreff trägt die vier Tore von 3bb9abb7, nicht nur `gate:webgl-probe`: probe-tag verlangt für stamm/dirigent-ankunft.js,
  stamm/bild-himmel.js und welt-licht.js die drei Pflicht-Tore.

## Täter-Zahl (vor dem Schnitt)

**bahn-klima#2.**
- Der Täter sitzt in planet-core.js `planetKlimaGlobal` (an 3bb9abb7 :2140–2160).
  - Die Zelle las ΔH aus der Krümmung des JAHRESMITTELS der Einstrahlung, s2 = −0,625·P2(cos β).
  - Bei 54° Neigung wird P2(cos β) = 0: ΔH fällt auf 0, die Kante auf 0, und die Zahl der Zellen läuft hoch.
- Kante und Zellen je Neigung, Erd-Körper, Samen `anazh-realm-seed`:

  | Neigung | Zellen | Kante |
  |---|---|---|
  | 0° | 3 | 34,40° |
  | 23,44° | 3 | 29,64° |
  | 45° | 5 | 19,55° |
  | 54° | 7 | 13,35° |
  | 60° | 12 | 7,25° |
  | 70° | 18 | 4,99° |

  45°/23,44° = ×0,6593. Die Quelle sagt das Gegenteil, die Zelle wird breiter (Guendelman & Kaspi 2019, ApJ 881: 67).
- An der Station S2 (21 Saaten × 15/45/75° × Körper Erde · ε 0 · ε 45°):
  - amp45Faktor 1,944, amp0Prozent 0 %, schneelinieVersatzM 152,2 m.
  - 3 Meer-Adressen an 45° liegen UNTER der Erde: Heimat 0,887×, s10 0,996×, s19 0,738×.
  - Die Faktoren an 45° streuen von 0,74 bis 4,80.

**fremde-physik#1 (die Leser der Schwere im Leben).**
- `state.gravity` lesen:
  - der Gang (stamm/koerper-leib.js:505 `_gangZeile`),
  - der Hüpfer (stamm/kreatur-leben.js:1537),
  - der Sprung des Leibs (stamm/koerper-bewegung.js:61/75/157),
  - die Reibung der Beute (stamm/kreatur-verhalten.js:1171).
- Der GUSS des Leibs liest sie NICHT.
  - Die Kette `_buildCreatureGroup` (:2584) → `_ofenKreaturTemplate` → `_ofenKreaturDials` (:1048) reicht die Dials an tetrapoda
    `deriveTierParams` (:833) weiter. In dieser Kette liest 0 von 3 Gliedern die Schwere.
  - Die Bein-Muskeln skalieren nur mit `size` (legMuscle = 0,42·(size/2,4)^0,67, tetrapoda-core.js:845).
  - Gemessen an GTX f63a69ef: steigung 0 (Soll 0,75–1).
- Die Station misst dazu den RUMPF: FP_AN liest `_tierBaum.quer`, das ist `_tierQuerMass`, je Hüft-Höhe, memoisiert an der Vorlage. Den
  Bein-Querschnitt misst sie nicht.
- Jede Saat außer der geladenen weist FP_AN ab („keine Saat trägt ihr g“, voxel-worker.js:1475 `planetPlanVon` baut jeden Planeten mit
  PLANET_ERDE). Gemessen: saatenJeG 1 (Soll ≥ 50).

## Geschnitten

**bahn-klima#2 — die Zelle der Jahreszeit (planet-core.js).** Die Zirkulation des Jahrs ist das Mittel der Zirkulationen der Jahreszeiten,
nicht die Zirkulation der gemittelten Heizung (Lindzen & Hou 1988, J. Atmos. Sci. 45: 2416; Hill, Bordoni & Mitchell 2019).
- `klimaStrahlung`: ΔH aus der Einstrahlung der Tagundnacht (s2h = −0,625, bei jeder Neigung dieselbe) auf der Albedo des Jahrs.
- `hadleyLH`: die Kleinwinkel-Zelle der Sonnwende in Einheiten von φH.
  - E = −(y−y0)², M = c − 5/6·(y²−y1²)², M = E an beiden Kanten, gleiche Fläche je Zelle.
  - Die Fläche steht als Mittel über die Zelle, in geteilten Differenzen. So fällt die entartete Lösung y+ = y1 heraus.
  - DIE GABEL, analytisch: die Sommer-Zelle vergeht genau bei y0 = 2·√(6/5) = 2,1909.
    - Dort gilt c = 0, y1 = y0 und y− = −3·√(6/5).
    - Das zugehörige Polynom ist z⁵−10z³−20z²−15z−4 = (z+1)⁴(z−4).
    - Jenseits der Gabel trägt EINE Zelle über den Äquator.
- `hadleyJahr`: der Aufstieg folgt der Deklination, φ0 = schubMeer·β·sin t. schubMeer 0,3 ist derselbe Schub wie der der Gürtel in
  `planetKlimaR`, als EINE Zahl in KLIMA.
- Die Kante des Jahrs ist das Mittel der Kanten über 16 Stützstellen. Der Newton läuft in Schritten ≤ 0,05.
- Die Eichung an der Erde: zellBreite = hadleyErdeRad·(h/h_Erde). Am Erd-Körper gilt x/x = 1 genau (Lehre 11).
- Die Kanten der Jahreszeit selbst liest kein Gesetz. Als Leser verlegte die Winter-Kante 2 von 3 Ankern der Probe und 99 003 von 345 000
  Klima-Feldern der Erde.

**Linse `klima.hadley`** in der Familie `diag-planet --anker`, also im `gate:worker-dichte`.
- Kante je Neigung 0…90°. 45°/23,44° muss im Band ×1,0956 … ×1,2095 liegen:
  - die untere Grenze ist die Winter-Kante des GCM, γ^0,14 (GK2019),
  - die obere ist die Winter-Kante der achsensymmetrischen Sonnwend-Zelle, am Kern gerechnet.
- Weitere Bedingungen: nie schmaler, nie mehr Zellen, die Erde bit-gleich gegen die EIGENE Zahl der Linse (0,51737143219558779 rad, 3 Zellen).
- Am Kern 3bb9abb7 ist die Linse ROT (×0,6593, schmaler an jeder Neigung, mehr Zellen an 45/54/60/70°).
- Der Selbsttest pflanzt 3 Täter, jeder → ROT beim Namen:
  - s2h = s2 → ×0,8583,
  - y0 = 0 → ×0,9839,
  - die Eichung 0,52 → „NICHT ihre Kante“.
- Laufzeit 4,4 s (Selbsttest) + 2,1 s. Die Leser sind der Kern selbst (`planetKlimaR`: Wind, Gürtel, Westwind-Zone, Küsten-Zuschläge am
  Takt `w`) und die Station bahn-klima#2 über `planetOrtAuftrag`.

**Die Wand der Familie geheilt, an der Quelle.**
- `diag-planet --anker --selftest` brach an 3bb9abb7 mit Exit 1 ohne Zeile ab. Ursache: `ort.neigung feuert`, der eigene Anker ohne
  Neigung, und planetOrt warf „der Anker der Heimat trägt keinen Jahres-Gang“.
- Die Heilung steht im Kern (kosmos-bahn-3, `planetOrt`). Die Linse trägt kein `try/catch` mehr um die Probe und keinen Ersatzwert:
  `neigungZeile` ist die messende Funktion selbst.
- `--anker --selftest`: 7 GRÜN, Exit 0, 6,8 s. Der gepflanzte Täter „Δ gegen den eigenen Anker“ ist jetzt ein gemessenes ROT (116,3 %).
- `--anker` GRÜN: anker.jede-saat, ort.neigung (0,0 %; 45° 1,676×), klima.hadley.

## Gemessen (vorher 3bb9abb7 → nachher, gleiche Last)

- **Kante je Neigung:**

  | Neigung | vorher | nachher |
  |---|---|---|
  | 0° | 34,40°/3 | 25,58°/4 |
  | 10° | 33,72°/3 | 27,15°/3 |
  | 23,44° | 29,64°/3 | 29,64°/3 |
  | 30° | 26,67°/3 | 30,80°/3 |
  | 45° | 19,55°/5 | 33,89°/3 |
  | 54° | 13,35°/7 | 35,52°/3 |
  | 60° | 7,25°/12 | 36,53°/2 |
  | 70° | 4,99°/18 | 38,10°/2 |
  | 90° | 4,99°/18 | 40,91°/2 |

  45°/23,44°: ×0,6593 → ×1,1434.
- **Station S2 (Nachbau aus voxel-worker-Faden + Kern, 63 Adressen):**
  - amp0Prozent 0 % → 0 %.
  - amp45Faktor 1,944 → 1,946.
  - schneelinieVersatzM 152,2 → 153,2 m (min 96,4, max 378,1).
  - Meer-Adressen an 45° unter der Erde 3 → 0.
  - Streuung der Faktoren an 45°: 0,74–4,80 → 1,48–2,51.
    - Heimat 0,887 → 1,676, s10 0,996 → 1,476, s19 0,738 → 1,696.
    - s11 (Land) 4,797 → 2,508, s14 4,095 → 1,958.
- **Standard-Welt:** Erd-Körper an 3 Saaten × 2 500 Punkten × 2 Jahreszeiten.
  - 345 000 Klima-Felder, davon 0 verschieden (max |Δ| 0).
  - Die Anker von erde-01, anazh-realm-seed und w-549d… sind bit-gleich; die Erd-Kante ist bit-gleich (0,5173714321955878 rad, 3 Zellen).
  - Die VERSION bleibt planet-h2-14: kein Erd-Körper bewegt ein Byte, und die Relief-Karte liest das Klima nicht.
- **Robustheit:**
  - 3 000 Zufalls-Körper aus `planetPlan`: 0 Würfe; 15 ms je Körper samt EBM; Zellen 1…19.
  - 4 312 Läufe des Lösers über y0 0…40 plus 2 000 dicht an der Gabel: monoton, ≤ 15 Newton-Schritte, 0,2 ms je Lauf.
  - Ein Körper mit 2 h Tag und Neigung 0…180° wirft nicht.

## Offen (Grund, Messname)

- **bahn-klima#2 amp45Faktor 1,946 < 2 (97,3 % des Solls, gepoolt).**
  - Grund: die erste Harmonische der Einstrahlung ist an JEDER Breite genau linear in sin β.
    Q(φ,δ) − Q(φ,−δ) = S0·sin φ·sin δ, also ×1,778 für 45°/23,44°.
  - Über dem Meer antwortet der Kern linear. Halbe Spanne (5 + 28·cL)·sin β/0,39782, und cL über dem Meer hängt nicht an der Zone
    (planet-core.js `planetKlimaR`, `amp`). Gepoolt ergibt das Meer 1,741.
  - Das Land überschreitet 2 (2,211), weil sein Schnee-Term an der Zonen-Temperatur hängt.
  - Das Hadley-Gesetz trägt die Streuung, nicht die Steigung.
  - Der ungerade Teil der Tages-Einstrahlung ist über das GANZE Jahr exakt S0·sin φ·sin β·sin λ, auch in Polartag und Polarnacht. Ein
    linear antwortendes Meer gibt deshalb genau ×1,7775, jede Mischschicht-Tiefe eingeschlossen.
  - Gemessen je Zone (S2-Nachbau, 63 Adressen, ampE → amp45):

    | Zone | Adressen | Faktor |
    |---|---|---|
    | Meer 15° | 14 | 1,733 |
    | Meer 45° | 18 | 1,734 |
    | Meer 75° | 16 | 1,750 |
    | Land 15° | 7 | 1,691 |
    | Land 45° | 3 | 1,829 |
    | Land 75° | 5 | 2,799 |

    Gepoolt 1 459,5 / 750,1 = 1,946. Für 2 fehlen +40,7 K in der Summe.
  - WIDERLEGT ist die Hoffnung des 26.11. früh, das jahreszeitliche Meereis trage den Rest.
    - Bei 45° Neigung wärmt das Jahres-Mittel an 75° um ≈ +10 K. Die Winter der Meer-Adressen an 75° steigen von −10,8 … −21,1 °C (Erde,
      vereist unter MEEREIS_WINTER_C −12) auf −0,7 … −13,5 °C.
    - Das Eis WEICHT also gerade dort, wo die Summe steht. Ein Eis-Term über dem Meer (gegen die Erde geeicht oder absolut) senkt den Faktor
      an 75°, statt ihn zu heben. An 45° Breite vereist nur 1 von 18 Meer-Adressen neu (Heimat −6,4 → −12,1 °C).
  - Es bleibt eine Frage an den Richter, mit Zahl: Das Soll „45°: ≥ 2× gepoolt“ nennt keine Quelle. Die Einstrahlung gibt exakt 1,7775×,
    die Physik dieses Klima-Gesetzes 1,946× (97,3 %). Ohne Quelle für die Nichtlinearität über dem Meer baue ich keine Zahl auf das Soll hin.
  - Profi-Band (Ferreira et al. 2014, Icarus 243:236–248, S. 239): Das gekoppelte Wassermeer-Modell (Ozean, Atmosphäre, Meereis) trägt
    bei 90° Neigung an den Polen 30 K Jahres-Spanne. Ein Energie-Bilanz-Modell ohne Transport und Wärme-Speicher (Armstrong et al. 2014)
    trägt 170 K. Meer-Speicher und Transport DÄMPFEN die Antwort; das Band zeigt über dem Meer kein überlineares Wachsen. Es stützt die
    lineare Antwort dieses Gesetzes (×1,7775), nicht das gepoolte Soll ≥ 2× über einem Fächer, der zu 76 % aus Meer besteht (48 von 63 Adressen).
  - Messname: amp45Faktor.
- **bahn-klima#2 „Schneelinie und Laub im Bild“:** die Zahl steht (153,2 m), das Bildpaar fehlt. Messname: auge.

## fremde-physik#1

**Geschnitten: die Schwere der Welt im Guss des Leibs, am EINEN Leser.**
- `stamm/koerper-leib.js` `_ofenKreaturDials`: reicht g_Welt/g_Erde als Dial `schwere` an das Buch weiter. Das geschieht nur abseits der
  Erde, der Memo-Schlüssel trägt ihn.
- tetrapoda-core.js `deriveTierParams`: `beinQuer` = schwere^0,40, also eine Glied-Fläche A ∝ g^0,80. Quelle: die Muskel-Fläche ∝ W^0,80
  (Alexander et al. 1979, bei Biewener 2005, J. Exp. Biol. 208: 1665). Das liegt im Band der Statik, 0,75 (McMahon 1975) bis 1 (Galilei 1638).
- `bauTier` trägt `beinQuer` durch die Glied-Radien Dp/Dd. Die Länge bleibt.

**Gemessen (vorher main eae94514 → nachher kosmos-hadley, gleiche Last):**
- In der Welt (Wolf, `_buildCreatureGroup` unter state.gravity, der Schnitt der Haut je Glied): steigung **0 → 0,769**. A bei 0,3 / 1 / 3 g:
  0,01707 ×3 → 0,00679 / 0,01707 / 0,03991 m².
- Am Kern-Guss in node (die Haut geschnitten in der Mitte der Glieder): Wolf 0 → 0,77, Fuchs 0 → 0,95, Hirsch 0 → 0,98, Bär 0 → 1,06.
- Die Erde ist byte-gleich:
  - 8 von 8 Abdrücken der Gestalt (4 Arten × L0/L1).
  - In der Welt bei g 1: A 0,0170670077351569 und das Quer-Maß des Rumpfs 0,007257938329038861, an main und kosmos-hadley gleich.

**Die Station muss sich bewegen.** Kandidat `cloud-post/kosmos-hadley-station/` (BEGRUENDUNG.txt, Patch, Prüfstand):
- FP_AN maß den RUMPF (`_tierBaum.quer`). Die Sprosse und ihr Soll nennen das BEIN.
- Der Kandidat schneidet die Haut der vier Unterarme und Unterschenkel. Ergebnisse:
  - alte Station × main: steigung 0 (= die Akte GTX f63a69ef),
  - alte Station × kosmos-hadley: 0,260,
  - neue Station × main: 0,
  - neue Station × kosmos-hadley: **0,769**.
- Die Wände:
  - `liste` 0 ROT an Basis und Kandidat. Die zwei `gelaende.K2` „Wand HAKEN“ feuern an eae94514 nicht mehr.
  - Der Fächer misst in 1,6 s.
  - Es gibt keinen Kern-Fächer, jede Adresse geht durch den Guss des Spiels.

**Offen (Grund, Messname):**
- **saatenJeG 1 (Soll ≥ 50), fremde-physik#1 gilt zu 3 von 4 Sollen** (steigung, gMin, gMax stehen).
  - Grund: Der Faden baut jeden Planeten mit dem Körper PLANET_ERDE (voxel-worker.js `planetPlanVon`; R5: ein Jahr, das des Ort-Gesetzes).
  - Das g der Saat (planet-core.js `planetPlan` `g` = 9,81·R/6371·(0,8…1,2)) liest keine Welt, und FP_AN weist jede andere Saat ab.
  - Der Schnitt liegt am Ort-Gesetz, nicht am Leser des Lebens (vision/leben/entscheid.md (6) im Zweig `punkte-maschine`).
  - Messname: saatenJeG.
- **Ein Wechsel der Schwere zur Laufzeit gießt kalt.** Der Memo-Schlüssel trägt `schwere`, also wird die Vorlage neu gegossen und keine Platte
  gelesen. Das kostet nur abseits der Erde.
  - Messname: der Guss je DSL-Wort `gravity`.

## Letzter Stand

- Geschnitten:
  - die Hadley-Zelle der Jahreszeit (planet-core.js `klimaStrahlung` · `hadleyLH` · `hadleyJahr` · `hadleyMass`) und die Linse `klima.hadley`,
  - die Schwere der Welt im Guss des Leibs (`_ofenKreaturDials` → `deriveTierParams` `beinQuer` → `bauTier`),
  - der Stations-Kandidat fremde-physik#1 (das Bein statt des Rumpfs),
  - kosmos-bahn-3 (die Anker-Wand und die Licht-Invariante an der Quelle; die Linse ohne `try/catch`),
  - das geerbte Rot `ort.frage.bytes` an main c0634d86 (die SHA neu eingefroren mit dem Gesetz w28-kosmos-bahn),
  - systeme#1 Kandidat 2 (die Ephemeride reist im Text, der leere Fächer beim Namen) und die Wand ABSCHLUSS.
- Gemessen:
  - 45°/23,44° ×0,6593 → ×1,1434,
  - amp45Faktor 1,944 → 1,946, amp0Prozent 0 → 0 %, schneelinieVersatzM 152,2 → 153,2 m,
  - Erde 0 von 345 000 Feldern verschieden,
  - fremde-physik#1 steigung 0 → 0,769 (in der Welt) und saatenJeG 1 → 1,
  - systeme#1 am Text des Geräts: 0 von 1460 Adressen (Wurf) → 1460 von 1460, ephemeride_abw_grad 0,1319°; Wand ABSCHLUSS 7 ROT → 0.
- Offen:
  - amp45Faktor 1,946 < 2 (97,3 %; das Meer antwortet linear ×1,7775, und das Meereis weicht bei 45° Neigung an 75° statt zu wachsen),
  - fremde-physik#1 saatenJeG 1 < 50 (3 von 4 Sollen; der Körper der Saat erreicht die Welt nicht, PLANET_ERDE im Faden),
  - die Bilder (auge).
- Kopf: Vorprüfung kosmos-hadley 2, EIN Commit auf main c814741e (V18.546.436), voller Ruf `gate:pruefbuehne-licht,
  gate:weltbild-frost:echt, gate:tag-achse:echt, gate:webgl-probe`. Batterie lokal (swiftshader): check:statik Exit 0 · diag-planet
  und `--anker` Exit 0 · gate:webgl-probe GRÜN · probe-tag OK. gate:pruefbuehne-licht ROT nur an „S0 Himmel“ und „S0 BILD“, byte-gleich
  am nackten main c814741e — das geerbte Rot nach der Regel vom 10:27, nicht angefasst. Die zwei `:echt`-Tore tragen nur am Gerät
  (lokal „WebGPU Device Lost“). Kopf 1 (f05c2cdb auf c0634d86) war GPU-Probe GRÜN. Der Verlauf der
  WIP-Commits (bis 4beebcd9) liegt in PR #97; nach der Regel vom 10:27 kein neuer PR.
- Probe-Kopf vor der Landung (lokal, ungeschoben): der Diff 3bb9abb7 → kosmos-hadley auf `buendel-kosmos` 3c4d81de, 3-Wege, sauber,
  9 Dateien. Batterie dort (swiftshader): check:statik Exit 0 (448 s) · diag-planet GRÜN · gate:worker-dichte GRÜN (284 s) ·
  gate:webgl-probe GRÜN (75 s) · voller Playtest GRÜN (3 710 ✅, 0 ❌) · probe-tag OK gegen 3c4d81de.
- Beanspruchte Sprossen: `karte2.planet.kopplung.bahn-klima#2`, `karte2.leben.evolution.fremde-physik#1`
- Karte 2 gebucht 126 von 1 718
- Status: ZWISCHENSTAND
