# LESEN — zwei Zweige im Kapitel BAU, für den Richter von v2 (18.11., nur gelesen)

Gelesen im Baum n1011-hg (HEAD main b7ed8419), nur `git show/diff/log/merge-tree`, kein Lauf, kein Tor, kein GPU.
Abkürzungen: **FC** = `fachwerk-core.js` an der Wurzel (das lädt das Spiel: index.html:10005 `<script src="fachwerk-core.js?v=…">`,
stamm/gelaende-chunks.js:3450 `spaet.fachwerk`, cores.manifest.json:30). **A** = 658269ca3 (`vorrat12b-bau-rezept`), **B** = 47fbd085f
(`vorrat14-oeffnungen`), **M** = main b7ed8419. Zeilen gelten am genannten SHA.

## WAS DER RICHTER WISSEN MUSS

1. **zielplan ist KEIN Zwei-Quellen-Bruch der Orte.** Richter und Wirt lesen die Tür jeder Rolle aus DEMSELBEN `S.plan.slots` mit
   DERSELBEN Regel `eingangVon` (A diag-kreatur-leben.cjs:961-965 ↔ A stamm/siedlung-bewohner.js:760-772). Was NICHT im Plan steht, ist
   der STAND des Fremden: Würfel des Wirts (`ringStand` 717-741, Genom `Samen:Stelle:k` 844) gegen die lebende Welt (`frei` 551-578),
   vergeben in der Reihe der Lose (833-866). Das Land-Maß verschiebt die Lose → neue Würfel → am Hof kein Stand mehr für Bergfried/Torhaus.
2. **Das Land-Maß ist EIN Ausdruck:** `Math.min(capK, fuss(eg,s))` statt `Math.min(165, …)` (A FC:2347, Commit 2fbf1169e); es wirft
   W/D jedes Hauses neu (A FC:2349) am Schreiber-Ende (A FC:4570-4573) und damit den Plan der Stadt.
3. **B ist kein Zweig über A, sondern über A's Stempel ff2b8341 (= Baum c77d7aef).** B auf A-Kopf: 0 Konflikte. B per Cherry-Pick
   auf M: GENAU ein Konflikt-Hunk — die Ring-Wand `wand=` des Hof-Hauses, die es auf M nicht gibt (merge-tree ff2b8341a M B).
   `fachwerk-core.js` ist zwischen e4e3f3633c und M unverändert (`git log e4e3f3633c..b7ed8419 -- fachwerk-core.js` leer).
4. **B macht den Flügel zu einem Würfel ohne Ursache:** `fluegelOffen` = Hash aus Samen+Lage, 16 % offen, Kommentar wörtlich „darum
   trägt ihn der Samen, nicht die Uhr“ (B FC:2858-2874). `fensterSchlaeft` bleibt Würfel ohne Uhr/Wetter; `glasdunkel` 0,92 und `glas`
   0,42 unverändert (B FC:2154, 2136); fern liegt die Scheibe weiter 0,11 m VOR der Wand (B FC:2924-2925). Keine Laibungs-Geometrie neu.
5. **Die Sockelplatte am Hang ist die Fundament-Box des Hauses** (M FC:429-442, 0,55 m `foundH`, 25 cm vor der Wand) und steht in
   vor UND nach über einem schwarzen Spalt; der Erdbau hält den Grund unter obb + 0,6 m auf der Haus-Höhe (M FC:11113-11123,
   gelaende-core.js:2085-2094). Die Sockel-Linse misst die HÖHEN-FUNKTION, nicht das gezeichnete Netz (M scripts/lib/ort-proben.cjs:97-111).
   Sache von Land/Erdbau ↔ Tragwerk, nicht Öffnungen.

## NICHT BELEGT

- Dass „EINE Quelle“ (Stände aus dem Plan) das Rote von zielplan heilt — ungeprüft; die Absagen am Hof (Gasse 157 · belegt 138 · im
  Grundriss 79, Abgabe-Entwurf) sprechen für ein Kapazitäts-Problem im engen Hof, das auch Plan-Stände hätten.
- Die Zahlen bergfried [1,1,5]→[0,1,4], die Abend-Gäste 19–22 Uhr, die Spikes „Werk zuerst“/„Rand der Gasse“: nur aus dem
  Abgabe-Entwurf (bild/land/abgabe-entwurf-w28-bau-rezept-2.txt), nicht am Lauf nachgeprüft.
- Ob B auf M die Goldens (`spec/asset-contract/v6/golden/haeuser.json`) bricht: B ändert die L0-Geometrie jedes Fensters und
  trägt keinen Golden-Commit — nicht gefahren.
- Ursache des schwarzen Spalts unter der Sockelplatte: Netz-Auflösung/LOD des Geländes gegen 0,6 m Saum, oder der Grund-Term (S4)
  — keine Probe der gezeichneten Höhe an den Ecken der Platte vorhanden.
- Warum stadt-wende-nach die Fassaden rosa statt beige zeigt — am Code nicht gesucht.
- Schnittgröße „Plan gibt die Stände“: Schätzung aus Funktionslängen, nicht gebaut.

---

## 1. ZWEIG A `vorrat12b-bau-rezept` 658269ca3 — was er schneidet

Diff-Basis `git diff e4e3f3633c...658269ca3` (merge-base = e4e3f3633c), 15 Dateien +766 −226.

**fachwerk-core.js (260)**
- Kellertreppe tritt vorn aus: `zFoot:wz1, dir:-1` (A FC:415).
- Hof-Haus-Ring wird gebautes Haus: Sockel des Rings als Platte + Masse `sockel` (A FC:1510-1516), Fenster-Reihe je Wand an der
  Luft `reihe`/`wand` (A FC:1517-1551), Tor mit Gewände/Bogen/Flügeln `torRahmen` (A FC:1529-1541), Giebel des Rings geschlossen
  (A FC:1562-1565); Ring-Wand trägt den Stoff des Hauses (A FC:1503).
- Raumprogramm: jede der 27 Zeilen `BAU_NUTZUNG` trägt `zeile/geschosse/grundriss/raeume/personen` (A FC:2221-2252), Wohn-Los
  `BAU_WOHNEN`/`wohnNutzung` (A FC:2255-2263), `haushaltVon` (A FC:2267), Deckel des Loses `z.deckel` (A FC:2299).
- **Land-Maß** `BAU_LAND` (A FC:2322) in `bauProgramm` (A FC:2324 ff., `capK` 2335, Hof-Bedingung ohne `/nutz` 2340, Körper endet an
  `capK` 2347, schreibt `hp.W/hp.D/storeys/grundriss` 2349).
- **Schreiber-Ende**: DORF setzt nur noch das Los, `bauRezept` schreibt jeden Bau EINMAL zuletzt (`schreibe`, A FC:4565-4573); Turm,
  Halle, Kirche, Palas, Scheune verlieren ihre Literale (Diff-Hunks A FC:4531-4560).
- Torplatz: `zulaufM:17` (A FC:4436), `torRaum` (A FC:4626) liest Laterne (`laterneNeben` A FC:5770) und Brunnen (A FC:9501);
  Wende sucht bis `bahnN` 8 Bahnen (A FC:4960, 5269-5272); Scheune nicht mehr quer gewürfelt (A FC:5667).
- `LEUTE_GESETZ.rolle` fällt, `leuteVon` liest `BAU_NUTZUNG.personen` (A FC:9631-9640).
- Exporte `torRaum` (A FC:12510), `BAU_LAND` (A FC:12588).

**stamm/siedlung-ort.js (70)** — `_slotEingang(sl)` = Tür-Zeile mit dem z von `eingangVon` (beim Hof-Haus das Tor) (A :471-476); Leser
`_spawnSettlementSlot` (A :519). `_bauFrei` prüft das Los (`fundament`, `_grundrissVon`) VOR den Boxen (A :351-361 `imGrund`, :376-377).
Zug des Erwachens hebt die Reihe des Vorrats (A :2037, :2068-2070, :2251, `_dorfZug(…, vorrat)` :2439-2449).

**stamm/siedlung-bewohner.js (12)** — Tür der Bewohner = `_slotEingang`, Richtung aus dem Haus = Front `(-sin φ, -cos φ)` statt Tür
minus Los-Mitte (A :768, :771).

**stamm/gelaende-kollision.js (27)** — Vor-Filter `_ortBauten`: das Los eines Hauses (`fundament`) sperrt wie seine Wände (A :383-391).

**stamm/gelaende-boden.js (7)** — Raster/Bau-Wand des Ort-Fadens lesen `_slotEingang` (A :1247, :1274).

**Proben/Tore (Familie, Zeilen an A)**
- scripts/lib/los-proben.cjs:51-155 — „jeder Körper steht auf dem, was seine Parzelle trägt“ (Täter: ohne `BAU_LAND`), Tor-Probe
  `torRaum`, „fällt die erste Bahn, trägt die nächste“.
- scripts/lib/ort-proben.cjs:59-73, 121-161, 210-225 — Sockel misst den Fuß des GEBAUTEN Körpers (`sl.huelle`, `slotHuelle`), Tür = `eingang`.
- scripts/diag-settlement.cjs:769-836 (Selbst-Tests 11c/d/e Hof-Tor, L-Haus, schwebender Ring), :2386-2395 + :3718-3731 (C-K5 `ausVorrat`, Täter `eigen300`).
- scripts/diag-haus-welt.cjs:86-91, :1114-1148, :2024-2030 — W7 Akt der späten Hülle, Los-Probe, Täter `loswand` (spec/haus-welt/defekte.json:466 ff.).
- scripts/diag-kreatur-leben.cjs:958-990, :1295, :1524 — zielplan liest `eingangVon`, Kriterium „Tür des Wirts = Eingang des Plans“.
- scripts/lib/kreatur-mensch.cjs:33-40 — Ebene des Eintritts = `eingangVon`.

**Goldens** — haeuser.json: nur `sha256` je Klasse/Stufe neu (Commit c77d7aefc, Hof-Ring); siedlung.json: zwei `sha256`
(Commits 6cee70ff3 und d8ca28d69, das Land-Maß). spec/stamm/modul-karte.json: `_slotEingang` in Siedlung/ort.

**Wo das Land-Maß den Plan neu wirft.** `bauProgramm` → `hp.W/hp.D` (A FC:2349) ← `schreibe` je Bau in `alle` (A FC:4573) → danach
`STADT_FORM` (A FC:4575 ff.) und `dorfLayout` (A FC:5457) legen die Lose nach diesen Maßen. Jeder Fuß, der vorher über 165 m² bzw.
über `capK` stand, wird kleiner → Lose, Gassen, Reihenfolge der Slots bewegen sich.

## 2. DAS ROTE TOR — `gate:kreatur-takt` zielplan „Rollen ohne Ziel-Ort: bergfried (1, gebunden 4) · torhaus (1, gebunden 1)“

**Das Kriterium** (A scripts/diag-kreatur-leben.cjs:1297-1303): je Rolle `[erreicht, Orte, gebunden]`; ROT, wenn `erreicht` 0.
`erreicht` zählt Fremde, die zu einer der Stunden **6 · 10 · 13 · 18 · 23** (A :1085) 5 s nach dem Uhr-Sprung an einem Haus der
Rolle `dort` sind und `passt` (A :1114-1115, :1119). `gebunden` = Fremde mit einem Stand, dessen `anker` diese Tür ist (A :1122-1126).
„bergfried (1, gebunden 4)“ heißt also: 1 Haus steht, 4 Fremde haben dort einen Stand, keiner war zu den 5 Stunden am Ziel.

**Die zwei Stellen nebeneinander (an A):**

| | Richter (zielplan) | Wirt (Bewohner) |
|---|---|---|
| Plan | `S.plan` (diag-kreatur-leben.cjs:956) | `S.plan` (siedlung-bewohner.js:461) |
| Tür je Slot | `plan.slots` + `eingangVon(sl).z` (:961-965) | `plan.slots` + `_slotEingang(sl)` → `eingangVon` (:760-772; siedlung-ort.js:471-476) |
| Rolle | `sl.rolle` (:957) | `sl.rolle` (:837) |
| Orte | Türen, `plan.platz`, `plan.felder` (:997-998) | `KC.tagesOrte(plan, steht)` = Slot-Mitte, Platz, Äcker (:780; koerper-core.js:5240-5265) |
| Stand des Fremden | liest `b.orte.*.anker` (:1052, :1124) | ERZEUGT: `ringStand` Würfel `g.axis(wort+"vor"+v)` (:717-741) gegen `frei` (:551-578) |

**Ergebnis: EINE Quelle für die Orte** (der Plan), **keine für die Stände.** `frei` liest die lebende Welt: das Raster der schon
vergebenen Stände `belegt` (:543-556), Gasse `amWeg` (:557), `FC.imPlatzStueck` aus dem Plan (:585), `_imGrundriss` über
`state.architectures` (:561; vegetation-baum.js:1880-1905), `_landAt`, `_bewohnerWand` gegen das Blocker-Netz (:563; :3232-3236).
Vergeben wird in der Reihe der Lose: `for (const T of tueren)` → je Person `binden(P, ["werk","mahl","abend"])` (:833-866); das Genom
jedes Menschen hängt an `${plan.seed}:${si}:${k}` (:844), die Bindung an `same` daraus (:845; `tagesBindung` koerper-core.js:5269-5318).
Bergfried und Torhaus haben keine Angebots-Zeile → `sonst {arbeit:3, treff:1}` (koerper-core.js:5176-5187).

**Ursache am Code, soweit belegbar:** Rückt ein Los im Plan (Land-Maß), ändert sich `si` → jedes Genom und jede Bindung würfelt neu;
die Stände am engen Hof werden in anderer Reihe vergeben. Dass genau das die 0 macht, steht nur im Abgabe-Entwurf (Sonden
k3/heil/zp-*.log), nicht am Code nachgeprüft. Die Lesart „die Rollen suchen Orte in einem Plan, den das Land-Maß neu wirft“ trifft
nur halb: die Orte (Türen) von Burg/Bergfried/Torhaus liest der Wirt richtig aus dem Plan; nicht im Plan stehen die Stände.

**Was „EINE Quelle: der Plan gibt die Orte, die Rollen lesen ihn“ am Code hieße:** der Plan (fachwerk `ortPlan`, wie schon
`plan.staende` für den Markt, koerper-core.js:5255) schreibt je Slot mit Rolle seine Werk-/Gast-Stände (Rand der Gasse vor der Tür,
frei von Grundrissen und Platzstücken — beides kennt der Plan); der Wirt nimmt für `i !== heimI` den nächsten freien Plan-Stand statt
`ringStand` zu würfeln (siedlung-bewohner.js:805-811, :717-741); `frei` behielte nur die Prüfung gegen die lebende Welt; der Richter
zählt dieselben Plan-Stände. Fällt: der Würfel-Teil von `ringStand` für Fremde. Größe (SCHÄTZUNG): FC +80–150 Z. (Stand-Geber in
`ortPlan`/Export), siedlung-bewohner.js ~−40/+30, koerper-core.js `tagesOrte` +5, diag-kreatur-leben.cjs ~±20, siedlung.json neu
gemintet (Plan-Form ändert sich), plus Linse — 5–6 Dateien. Ob es das Rote heilt: NICHT BELEGT (Kapazität des Hofs, s. oben).

## 3. ZWEIG B `vorrat14-oeffnungen` 47fbd085f — je Commit

Basis: ff2b8341a (leerer Stempel-Commit, Baum = c77d7aefc), nur FC, +93 −38.

| Commit | geschnitten (B FC) | an M an derselben Stelle |
|---|---|---|
| 5a5b53f37 Seitenregel | `fensterAt(…,capY,aus)`: `s=aus‖Vorzeichen der Lage`, Flügel `-s*a` / `s*a`, Bogen `versatz s*0,14` (B FC:1086-1100); `aus` an Flügel-Traufwand, Flügel-Giebel, Anbau-Pult, Hof-Ring, Terrasse, Turm | Vorzeichen allein aus der Lage `cz<0?0.62:-0.62` / `cx<0?-0.62:0.62` (M FC:1084, 1089) |
| 78de2458d Flügel als Funktion | `fensterWuerfel`, `fensterSchlaeft` liest dessen untere 16 Bit, `FLUEGEL={offen:0.16,winkel:0.62}`, `fluegelOffen` (B FC:2848-2874); `a = fluegelOffen?0,62:0`, geschlossener Flügel um `tief` nach innen nur bei Terrasse/Turm (B FC:1091, 1095, 1100); Fern: Flügel nur wenn `offen` (B FC:2928), `FLUEGEL_LAGE` fällt | Flügel 0,62 rad offen in jedem Fenster (M FC:1084/1089); Fern-Zwilling `FLUEGEL_LAGE` (M FC:2788, 2815) |
| 5ddcb3688 Stirn trägt Fenster | `panel` `opt.neben` (B FC:1344-1362), `nebenAb` je Lauf ≥ 1,4 m (B FC:1388) | Flügel-Stirn neben der Tür blind |
| e1b3d4f44 Fern-Tür/-Tor | `EINGANG`/`eingangAuf` (B FC:501-506), `eingaenge` im Export (B FC:1860-1867), Fern-Tür in `fensterFern` (B FC:2935-2943), `fensterVon` trägt `tueren` | Fern-Stufe ohne Eingang |
| 47fbd085f Fern-Liste = L0 | Giebelfenster fern nur am Sattel ohne Flügel (B FC:1850), Balkontür als Fern-Tür (B FC:1865-1867) | Giebelfenster fern an jedem Dach (M FC:1793) |

**Gegen das Ziel der Bahn ÖFFNUNGEN:**

| Teilziel | in B schon da (wo) | fehlt | widerspricht |
|---|---|---|---|
| Fenster IN der Wand mit Laibung | geschlossener Flügel auf der Wand-Achse statt davor, nur Terrasse/Turm (`tief`, B FC:1091/1095/1100) | Laibungs-Flächen (kein neuer Bau-Aufruf); Rahmen bleibt 2 cm vor der Turm-/Terrassen-Außenfläche; Fachwerk-Wand ohne Laibung | — |
| Flügel folgt `fensterSchlaeft` (Same je Fenster, Uhr, Wetter) | Same je Fenster: ja (`fensterWuerfel`) | Uhr, Wetter: kein Leser von Zeit/Wetter in B (Grep der `+`-Zeilen) | Kommentar „trägt ihn der Samen, nicht die Uhr“ (B FC:2867-2868); gebackene Stufe als Grund |
| statt 0,62 rad für alle | 16 % offen, 84 % zu (B FC:2870-2874) | — | Winkel bleibt eine Zahl 0,62 für alle offenen |
| Glas zeigt dunklen Raum statt grauer Tafel | — | `glasdunkel` 0x2b4457/0,92 (B FC:2154) und `glas` 0x33576a/0,42 (B FC:2136) unverändert; Scheibe im Flügel → geschlossen steht die Tafel jetzt IN der Öffnung (B FC:1094/1099); fern Scheibe d1+0,01 vor der Wand (B FC:2924-2925) | — |

**Ist `fluegelOffen` ein Würfel ohne Ursache?** Ja: Hash aus `seed, perp, wand, u, cy`, Schwelle 0,16/(1−0,45) auf den oberen
16 Bit, nur wache Fenster (B FC:2871-2874) — kein Leser von Raum, Uhr, Wetter, Nutzung. Gegen „Reichtum aus Ursachen, nicht aus
Würfeln“ steht er wie `fensterSchlaeft` (M FC:2752-2759).

## 4. ABHÄNGIGKEIT

- **Pfad:** `fachwerk-core.js` an der Wurzel ist die Datei, die das Spiel lädt (index.html:10005; stamm/gelaende-chunks.js:3450).
- **M seit e4e3f3633c:** FC unverändert (`git diff --stat e4e3f3633c b7ed8419 -- fachwerk-core.js` leer, 23 Commits ohne FC).
  A und M berühren gemeinsam nur stamm/siedlung-bewohner.js und spec/stamm/modul-karte.json (`git merge-tree e4e3 M A`: „changed in
  both“, 0 Konfliktmarken).
- **Ahnen:** B stammt von ff2b8341a (Stempel, Elter c77d7aefc), NICHT von A-Kopf 658269ca3; merge-base(A, B) = c77d7aefc,
  merge-base(M, B) = 1f300260. B als Zweig nach M gemergt brächte A bis c77d7aef mit (Kopf 2, Raumprogramm, Hof-Ring), ohne A's
  11 Heil-Commits.
- **B auf A-Kopf:** `git merge-tree c77d7aefc 658269ca3 47fbd085f` → 0 Konflikte. A's Heil-Commits nach c77 (FC-Hunks ab A:2314) und
  B's Hunks (FC 500–2969 der Basis) überlappen nicht.
- **Nur die fünf Commits auf M (Cherry-Pick-Lage):** `git merge-tree ff2b8341a b7ed8419 47fbd085f` → **1 Konflikt-Hunk**: der
  Block `wand=(horiz,fix,…)` des Hof-Rings (Basis FC:1545-1550; in B 5a5b53f37 `fensterAt(…,fix<mitte?-1:1)`, 78de2458d `offen:` im
  FERNFENSTER, e1b3d4f44 `eingangAuf` am Tor). Auf M existiert dieser Block nicht — M hat das alte `xWall`/HOF-FENSTER-GESETZ
  (M FC:1513-1522). Diese Zeilen hat A eingeführt (A-Diff-Hunk FC:1500-1569). Alle übrigen Hunks von B fallen sauber auf M.
- **Folge auf M ohne A:** die Ring-Fenster von M (M FC:1522 `fensterAt(g,x0,…,false)`, `fensterAt(g,x1,…,false)`) bekämen kein `aus`;
  die Seitenregel fiele auf das Lage-Vorzeichen zurück (B FC:1091) — die Hof-Seiten der Arme sind genau der Fall, den 5a5b53f37 heilt.
  Die Konflikt-Auflösung müsste die M-Ring-Aufrufe neu schneiden. Golden-Folgen: NICHT BELEGT (oben).

## 5. SOCKELPLATTE AM HANG

**Wo sie entsteht (M):** Fundamentplatte `beam(g,0,baseY-foundH/2,0,W+0.5,foundH,Dp+0.5,'stein')` + Solid + Masse `sockel` (M FC:437-439;
mit Keller als vier Streifen M FC:429-430), je Flügel dieselbe Platte (M FC:440-442); `foundH:0.55` (M FC:178), `baseY=foundH` (M FC:211).
**Wo der Grund gesetzt wird:** Boden des Hauses `y` = Höhe seiner Gasse, sonst Median des Grundrisses (M FC:11107-11109); Erdbau-Platte
`obb + saumM 0,6` auf `y` (M FC:11113-11123, `saumM` M FC:10002); außen Böschung tan 0,6 bis 16 m (gelaende-core.js:2085-2094,
`erdbauY` 2209-2238). Die Hang-Klasse `plattform·hanghaus·stelzen` wird je Slot geschrieben (M FC:11112, 11177) — **kein Leser** gefunden
(`git grep` über *.js/*.cjs: nur die Schreibstelle).
**Die Linse:** Sockel = `sl.y − min(hoehe)` an 9×9 Punkten IN der obb (M scripts/lib/ort-proben.cjs:97-111), Soll 0 (:253) — sie liest
die Höhen-Funktion, nicht das gezeichnete Netz.
**Warum sie über die Kante ragt:** am Code nicht belegt (siehe NICHT BELEGT). Die Bilder zeigen unter der Platte einen schwarzen Spalt
(gezeichneter Grund tiefer als die Platte), obwohl Platte (25 cm) innerhalb der Erdbau-Platte (obb + 60 cm) liegt.
**Sache:** die Platte ist Tragwerk (Fundament); dass der Grund unter ihr nicht trägt, ist Land/Erdbau (Plan-Höhe, Saum, Böschung,
ungelesene Hang-Klasse). Nicht Öffnungen.

## BILDER (koordination/vision/bau/bild/land, vor = bbaa0c11, nach = 658269ca3; selbst angesehen, Ausschnitte 3× vergrößert)

| Paar | was man sieht |
|---|---|
| dorf-fern | vor: östlich der Gasse ein Haufen Hof-Häuser, Ringe stoßen aneinander; nach: weniger, getrennte Körper, ein Hof-Haus mit offenem Hof südöstlich des Platzes; Platz, Stände, Leute gleich. |
| dorf-nah | vor: Kamera steckt in einer Baumkrone, kein Haus im Bild; nach: Böschung, Bach, Steg, kein Haus im Bild — das Paar zeigt kein Haus. |
| stadt-fern | vor: im Westviertel große Körper ineinander; nach: dort Zeilen mit Lücken, Mauer/Straßen gleich; am Westrand ein Haus mit dunklem Fleck unter dem Sockel. |
| stadt-wende | vor: Torplatz leer, zwei Wagen auf der Straße; nach: ein Wagen auf dem Torplatz, Körper länger; Fassaden nach rosa statt beige (Ursache nicht gesucht). |
| stadt-suedwest | vor: links eine Zeile verschmolzener Blöcke, zwei Wagen auf dem Torplatz; nach: links Hof-Häuser mit Hof, getrennte Körper, ein Wagen; unten rechts zwei große Häuser Wand an Wand in beiden. |
| gasse-nah | vor: weiße Körper als eine Masse am Hangrücken, die linken zwei auf brauner Platte mit SCHWARZEM SPALT darunter; nach: drei Häuser mit Luft, das linke mit Efeu — links und mitte steht das Haus auf der Steinplatte, die über die Böschung ragt, darunter schwarz. |
| gasse-halb | vor: Masse, Schuppen zwischen zwei Häusern; nach: getrennte Körper, das mittlere (blaues Dach) auf einer dunklen Platte, die vor der Hangkante steht. |

Die Sockelplatte mit Spalt ist auf BEIDEN Seiten (vor und nach) — sie kommt nicht aus A.
