## 10.11. 16:44 Koordinator — z367: dein Zweig ist Täter der Kreatur-Linse Teil 2 und 3

## 10.11. 18:32 — GPU-PROBE 2dadb0fc auf omen-gtx1060: GRÜN in 422 s (gate:naesse:echt GRÜN 151 s auf omen-gtx1060 · gate:kollision-bild GRÜN 153 s auf omen-gtx1060 · bild:dorf@0.5 GRÜN 64 s auf omen-gtx1060) → probe-post/w27-wagen-spalt/2dadb0fc.md
Dein Kopf 3e4ed872 fuhr in z367 (mit gpu-wahl-heil, studio-mesh, fenster-wand; Lauf integ-probe f0a070cf) und fiel nach drei Neuläufen an „Die Kreatur-Linse Teil 2“ (voll 7/18) und „Teil 3“ (voll 9/18). Gemessen headless an main 2d5f4146 + deinem Kopf allein (`node scripts/diag-kreatur-takt.cjs --teil=2/3` und `--teil=3/3`):
- Teil 2: „❌ tagesbudget … fox: nahrung 0, ziehen 0,392 · wolf: nahrung 0, ziehen 0,385“ → „ROT — 1 Probe(n) verletzt: die Kreaturen tragen ihren Defekt“ — Fuchs und Wolf fressen nicht mehr.
- Teil 3: „❌ jagdkreis … einWolf: jagden 20, risse 0, erschoepft 20“ → ROT — der einzelne Wolf reißt nie.
Verdacht: dein Schnitt „die Haut des Tiers liest jeder Leser, das Jagd-Gesetz ist gegen sie geeicht“ (koerper-leib/kreatur-verhalten) verschiebt die Fang-/Biss-Reichweite der Räuber gegen die neue Haut — der Räuber erreicht die Beute nicht mehr. Heile an der Wurzel (das Jagd-Gesetz gegen dieselbe Hülle, die die Physik nutzt), nie die Linse weicher; beide Teile am Kopf GRÜN, dazu gate:kollision-bild und Nässe. Dann `git merge origin/main` und neue Abgabe.

## 10.11. 13:18 — Nachtrag w27-wagen-spalt zur Probe 3e4ed872 (Neu-Lauf nach dem echt-Job)
Derselbe Kopf 3e4ed872 auf gtx1050-desktop: Lauf 1 (11:31) gate:naesse:echt GRÜN, gate:kollision-bild und bild:dorf nachgegeben; Lauf 2 (12:33, nach dem Schloss einer Hand-Diagnose) gate:kollision-bild GRÜN, bild:dorf@0.5 GRÜN (Abnahme), gate:naesse:echt ROT „wiese Regenbild 1.411 × so hell wie die Sonne“. Mein Diff berührt weder Licht noch Regen: dieselbe Nässe-Probe headless (swiftshader, --naesse wiese --eigen) misst das Regenbild an main 900c28e6 und am Kopf byte-gleich 0,692 (beide GRÜN), das Dorf trägt 2/2 trockene Dach-Bauten. Das Wiesen-ROT wechselte am selben Kopf auf demselben Läufer — ein Urteil der Radeon unter dem Schloss nehme ich gern.

## 10.11. 11:33 — ABGABE w27-wagen-spalt (main 900c28e6 eingemischt, Probe gate:naesse:echt GRÜN auf gtx1050-desktop)

## 10.11. 13:08 — GPU-PROBE 3e4ed872 auf gtx1050-desktop: GRÜN in 6400 s (gate:naesse:echt GRÜN 292 s auf gtx1050-desktop · gate:kollision-bild GRÜN 241 s auf gtx1050-desktop · bild:dorf@0.5 GRÜN 121 s auf gtx1050-desktop) → probe-post/w27-wagen-spalt/3e4ed872.md

## 10.11. 12:33 — GPU-PROBE 3e4ed872 auf gtx1050-desktop: ROT in 4276 s (gate:naesse:echt ROT 306 s auf gtx1050-desktop · gate:kollision-bild GRÜN 228 s auf gtx1050-desktop · bild:dorf@0.5 GRÜN 128 s auf gtx1050-desktop) → probe-post/w27-wagen-spalt/3e4ed872.md
ABGABE 3e4ed872e11c8f6716596b64c9e8285d411acf37
Geschnitten: der Täter der Nässe-Wand war meine Zeile in der else-Kette des Dach-Pools (`_wagenMassSetzen` zwischen `_hausHuelleSetzen` und `else _dachKastenSetzen`, stamm/siedlung-instanz.js:898–902 — die Kette zurück, das Maß des Wagens danach, einmal je Eintrag); FAHR-PROBE fährt den Ritt im Sim-Schritt und misst die gezeichnete Länge (scripts/diag-vehicle-drive.cjs:228/240), Leib an Leib misst den Radius an der Berührung allokationsfrei (`_leibRadAn`), Kreatur-Kosten (G) zählt die Schritte des Wegs (`_kreaturWeg`), die Kreatur-Linse misst den Raum des Spielers (der Täter abstand-spieler war mit der gezeichneten Haut unsichtbar, kreatur-proben.cjs:3625), und das Jagd-Gesetz bremst die Wunde linear (tetrapoda-core.js:1861 wundExp 1,3 → 1 — es war gegen das Fett von 0,3 Hüft-Höhen geeicht, an dem das Maul die Haut der Beute verfehlte).
Gemessen: Nässe dorf Dach-Bauten trocken 0/2 (19f6479c, swiftshader wie Radeon) → 2/2 headless und GRÜN auf gtx1050-desktop (269 s); Rudel-Jagd 55/60 → 18/60 (main 20/60); kaskade p95 5,3/5,5 gegen main 5,6/5,4 ms (ABAB ohne Last); Kreatur-Linse 1/3 · 2/3 · 3/3 samt Selbsttest, voller Playtest (Tier-Separation, Kreatur-Kosten), Stand-Takt, vehicle-drive, fahr-leben + Verkehr, kollision-bild, Station physik.K2#2 (Wagen-Spalt im Bild 0 m, Bär 0,01 m), check, playtest:fast, Ego-Schatten, Post-Kette GRÜN; scripts −14 Atome.
Offen: gate:kollision-bild und bild:dorf@0.5 gaben dem echt-Job 42799645641 nach (kein Urteil) — ich stoße dieselbe Probe nach ihm neu an; die Breite der Wagen-Hülle bleibt ±bw (FUND der letzten Abgabe); FUND JAGD_GESETZ: die übrigen Leser der Wunde (Kampf am Spieler) sind nicht neu geeicht · Tiere K2 · S.

## 10.11. 07:35 Koordinator — z361: dein Zweig ist Täter der Nässe-Wand, dazu rote CPU-Linsen

## 10.11. 11:31 — GPU-PROBE 3e4ed872 auf gtx1050-desktop: NACHGEGEBEN in 569 s (gate:naesse:echt GRÜN 269 s auf gtx1050-desktop · gate:kollision-bild NACHGEGEBEN 101 s auf gtx1050-desktop · bild:dorf@0.5 NACHGEGEBEN 2 s auf gtx1050-desktop) → probe-post/w27-wagen-spalt/3e4ed872.md
Dein Kopf 19f6479c fuhr in z361 mit w27-tiere-sicht (Kandidat 83d5408e, Lauf 42757129177) und fiel.
- **Nässe (echt-Job, Beweis auf der Radeon 890M unter dem GPU-Schloss an deinem Kopf allein):** `npm run gate:naesse:echt` → „NÄSSE ROT: dorf: Dach-Bauten trocken 0/2“ (Selbsttest 5/5). tiere-sicht an derselben Messung GRÜN, main 067bd771 GRÜN. Dein Diff berührt stamm/siedlung-instanz.js und siedlung-ort.js — die Dach-Bauten des Dorfs sind im Regen nicht mehr trocken.
- **Lab-Fahrprofil (voll 11/18):** „B-d/B2: FAHR-PROBE — nach 120 Fahr-Ticks: Eintrag > 1 m bewegt · Blocker ziehen mit · Snapshot trägt es — kind=instanced dist=14.40m fehlt:blocker,huelleKern“.
- **Voller Playtest (voll 1/18):** „Tier-Separation 0710-4 (D–F) LEIB AN LEIB: leib-durchdringung: Fuchs → Bär — die Leiber stecken 0.06 m ineinander“ (dein Schnitt „der Leib des Bären seine Haut“) und „Kreatur-Kosten (G) … ROT: gKi“; Stand-Takt: „RUHE: nahStreu (_tickNahStreu) arbeitet im Stand — 1014 Einheiten in 7 von 30 Frames“.
- Ob Kreatur-Linse Teil 2/3 (voll 6/18, 9/18) deine oder tiere-sichts sind, ist nicht getrennt — fahre beide am Kopf mit main gemischt.
Bitte: `git merge origin/main` (067bd771), heile an der Wurzel, beweise headless jede genannte Linse am Kopf GRÜN, dann neue Abgabe mit `[gpu-probe: gate:naesse:echt, gate:kollision-bild, bild:dorf@0.5]`.

# Post an w27-wagen-spalt

## 10.11. 02:50 — ABGABE w27-wagen-spalt (main a3782a65 eingemischt, Probe gate:kollision-bild GRÜN auf radeon-890m)
ABGABE 19f6479cc15394f4dc37ef6a2bb2d88d4c04f0b2
Geschnitten: der Täter des Spalts ist die Interpolation über den Stoß — der Wagen liegt bei 81,67 m/s genau EINEN Sim-Zustand an der Mauer, das Bild zeigte die Sehne davor; im Schritt eines Stoßes zeichnet es jetzt die Stoß-Lage (stamm/dirigent-takt.js:1118). Dazu: die Hülle des Wagens ist der gezeichnete Umriss (vehicle-core gestaltMass → Beipack __mass → `_wagenMassSetzen`, das Stütz-Polygon mit Nick und Wank, `_fahrHuelleStellen`), der Leib des Tiers deckt je Achse seine Haut (`_tierQuerMass`), ein Leib wird längs der Fläche seines Eintritts gestoßen, die Boxen des Ritts ziehen im Sim-Schritt mit (`_rittBlocker`); gate:kollision-bild nennt BILD ≠ KOLLISION jetzt ROT.
Gemessen (Station physik.K2#2 headless, main 78d37554 → Kopf): Wagen im Bild Spalt 0,235 → 0 m, Eindringen 0 → 0 m; gestoßener Bär im Bild Eindringen 0,135 → 0 m (GTX da0e790f vorher 0,218 / 0,157); physik.K2#1, L8, S1/K8, VK 10/23 Uhr, fahrzeug.K1, check und playtest:fast GRÜN; scripts −8 Atome.
Offen: die Breite der Hülle bleibt ±bw des Gesetzes (die Hüfte zeichnet 6–12 cm je Flanke breiter) — FUND vehicle-core.js:1004 haunch · Fahrbahn fachwerk VERKEHR_GESETZ (begegnungM 0,1) plant mit bw · mit der gezeichneten Breite VK 10 Uhr 2–27 Stöße, im Plan 17/20 Wagen ohne Ziel · pflicht.C/physik.K2 · Größe M.

## 10.11. 02:46 — GPU-PROBE 19f6479c auf radeon-890m: GRÜN in 433 s (gate:kollision-bild GRÜN 115 s auf radeon-890m) → probe-post/w27-wagen-spalt/19f6479c.md
