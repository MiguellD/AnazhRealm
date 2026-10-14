# ÜBERGABE 14.10.2026 — Wochenlimit 95 % (Koordinator-Sitzung bd24003f)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Dann diese Datei. Dann `memory/uebergabe-stand.md` (lädt automatisch über MEMORY.md).

## Köpfe

| Ref | Kopf | Zustand |
|---|---|---|
| main | c5e2fc8f | das Bündel vom 14.10. (V18.546-Nummer) + Tor-Stufen + Wiese-Teppich + Mensch Labor=Welt + Putz + Wahrheit |
| integ-probe | ec86f5e2 | main + Boden-Stufen weich + Archiv-Wand + Welt-Boot (FF nach OMEN-Boden-ABAB) |

**Das Bündel auf integ-probe** (Versions-Nummer noch 18.546.0, alles darin):
- V18.546: K16 Landform, K16b, K17-2 Fels im Worker, K20 Wald-Maß, Baum-Reihe, K28 Fell-Kopf (Frozen A fällt)
- werk-ufer (Haus am Wasser 13,5 → 3,0 m, Klamm S6)
- Studio-Welle 1: K41 EINE Studio-Hülle (worlds/huelle), K42 foundry-bruecke.js, K44 Boden-Satz gepackt
- V18.547-Zug (integ-547): welle-m-e-stoffe (EIN Programm je Signatur), welle-m-e-leib (Mensch L0 −75 %), welle-m-e-ankunft, K26 Band-Leser (12 Ratschen Ort × Gerät × Sicht); Wind-Knoten am Vendor entschieden (positionNode VOR der Instanz)
- fels-shader (Boden-Programm 149 521 → 94 416 Zeichen), K53 nah-fern (Wiesen-Grund im Gesetz, gate:nah-fern urteilt wieder)
- Studio-Welle 2: K45 Labor = Welt Tier (Wolf 1,3 M → 55k), K47 terrain in der Hülle (0 Hand-Regler), K50 TAAU (`state.szeneSkala` 0,75, VRAM Genesis third 126,7 → 113,7), K51 Boden-Stufen (Boden < 120k überall; OFFEN: Stufenwechsel springt bei 43–65 m)
- OMEN welle-m-e-instanz (Foundry-Bauten bis Weltbild 70 → 16)
- K54 Takt-Nähe (tickAffordances 0,80 → 0,13 ms), K52 Genesis-Grund (Scheibe auf dem Grund, reservierte Zonen ohne Natur)
- S0-Feuer-Linse: Ton-Kante 28° (Selbsttest war blind)

**Regel für den FF nach main** (memory/profiband-merge.md): CI 13/13 am Kopf + voller Playtest (CI voll 11) + OMEN-ABAB „nicht langsamer“ im Rauschband bzw. das Band hält (K16 ändert die Szene überall — Szenen-Wechsel ist kein Täter, solange das Band hält) + Auge-Runde. Dann `git push origin integ-probe:main` (Fast-Forward), Versions-Stufe 18.546.0 → 18.547.0 vorher oder als nächster Commit (npm run bump).

## Zweige (Stand der Notbremse; Köpfe per `git ls-remote origin <zweig>` frisch lesen)

| Zweig | Zustand | nächster Schritt |
|---|---|---|
| integ-probe | ec86f5e2 = main c5e2fc8f + K51-3 Boden-Stufen weich + Archiv-Wand + Welt-Boot | **K51-3 SPERRT den FF:** OMEN 1410-boden-abab: stehend nicht langsamer (Boden −8k), beim GEHEN Frame p95 28,7 → 41,6 ms (reißt 33), CPU p95 14,5 → 16,0. Täter: die Folge-Neubauten des Stufenwechsels (`_loopVoxelStreaming` +1,25 ms, darin `_dispatchFrameJobs` +0,63; `_tickFernRing` +0,58; `_bodenKarteAusMesh` +0,14, `_bodenSichtAt` +0,11, `_fernRingKlassen` +0,11), der Geomorph selbst +0,16. Lehre 25: Stufenwechsel ohne Neubau-Lawine (Ziel vorgebacken, Neubau nah zuerst im Budget), dann ABAB gehend erneut |
| main-naechst | main + Welt-Boot + Archiv-Wand ohne K51-3 (Seite byte-gleich zu main) | CI 13/13 → `git push origin main-naechst:main`; danach integ-probe auf main mergen |
| mess-wiese | K55: Wiese -278/-1038 aus der Welt, Orts-Literale 30 → 0, Gelände-Proben aus `welt-orte.cjs`; trägt gtx-ratschen-1410 (6 GTX-Ratschen am neuen Ort) | Rote laut letztem Commit-Rumpf / Übergabe: Fahr-Leben S4/L6/L8, Höhlen-Sicht „hinaus“ (`_hoehlenAusgang`), streu-fern Bahnwechsel, werk-im-wasser; dann mergen (Ratschen gehören zum neuen Ort) |
| mensch-kopf | K57: Kopf-Soll (Anthropometrie) als Kern-Daten + Maß, dann Proportion/Augen/Mund im koerperstudio | Übergabe im letzten Commit-Rumpf; Bild Armlänge Labor = Welt |
| laub-aaaa | K58: Laub-Soll + Maß, größter Hebel (Nadel-Wedel / Blatt-Karten / Dither) | Übergabe im letzten Commit-Rumpf |
| ort-gelaende 92972ef6 | K10, Frozen C (Dorf auf dem Gelände-Kern) | Neubau gegen den K16-Grund prüfen, Damm/Slots/Nachtlicht |
| haus-fenster a5341ed3 | K38-N1, gate:fenster-wechsel rot | Täter lesen |
| pruef-vakuum 73becf82 | Z2a Meta-Wand gegen leere Prüfungen (WIP) | mit dem Welt-Boot-Fehlersammler zusammenführen |
| linsen-gpu (lokal) | K39 Linsen auf den Hardware-Adapter (WIP, 39 Dateien) | sichten, sonst fallen lassen |

Rohdaten der Zweige liegen LOKAL unter `<worktree>/artifacts/profiband/…` bzw. `artifacts/profiband/wt-archiv/<name>/` (nie committen — Archiv-Wand).

## OMEN

Sitzung „Lokaler Ordner Sicherung“ (bridge:session_01NUxuyk3y4hiZSDytqydoBT), arbeitet im Ordner koordination. Berichte unter `bericht/`, Aufträge unter `auftrag/`. Letzte Aufträge: 1410-1 Instanz-Schicht (gemergt), 1410-2 ABAB V18.546 (Wiese war andere Szene, CPU +1,0–1,6 ms → K54 heilte), Schluss-ABAB 51cc19af gegen main (berichtet: an allen 4 Orten schneller, Band hält bis auf CPU-Takt); Wiesen-ABAB c5e2fc8f nicht langsamer; Boden-ABAB 1410-boden-abab.md. Danach: GTX-Ratschen auf den Kopf neu prägen.

## Offen (Pflicht-OFFEN: B Ankunft ≤ 5 s · C Ort auf dem Gelände · E Profi-Band)

- E: Ratschen-Re-Mint auf beiden Geräten nach dem FF (Wiese am neuen Ort -278/-1038 aus K55, Genesis 0/0, Dorf; Ego + Third). TAAU senkt VRAM unter 118 an Genesis/Dorf (Radeon); GTX ungemessen.
- B: Erst-Bau kalt 6,0 → 3,6 s (Instanz-Schicht), Weltbild zweit ~20 s; der Haupt-Faden ist der Engpass (K42: Worker nicht kritisch).
- C: K10 ort-gelaende 92972ef6 (Damm, Auto-Dorf-Slots, Nachtbild-Licht).
- Studio-Einheit weiter: Synthese W2b/c (Ofen-Kern, buildInstance rein), W4e (Pflanzen-Dials in PARAMS_BY_KIND), W5 (Labor-Bühne = Welt-Licht: 18-%-Karte 2,80× im Labor), W6 Sim-Rahmen.
- Augen-Befunde: koordination auftrag/auge-befunde-1410.md (Tore aus 30 m wie weiße Tafeln, Laub als Karten mit Dither, Gras in Büscheln).
- Gate-Kosten: gate:haus-welt lokal 12,5 min (K52), Gelände-Kosten-Linse flackert am Budget (Ebene 23–27,6 gegen 26,4).

## DER PLAN ZU AAAA (Reihenfolge, je Karte: Soll-Bild + Budget zuerst, dann Schnitt im Studio, Bild-Paar aus dem Ausgabe-Pfad)

**Schritt 0 — die Soll-Tafel (EINE Karte, vor allem anderen):** je sichtbarer Klasse ein Soll-Bild (AAA-Referenz) + Budget je
LOD-Stufe + ein Maß, das das heutige Bild ROT nennt (Lehre 18). Klassen: Mensch-Kopf, Laub (Laub- und Nadelbaum), Tore fern,
Fels, Wasser, Haus, Himmel/Licht. Ohne diese Tafel läuft jede Look-Karte gegen ein ungenanntes Ziel (Analog-Welle 07–09: zwei Monate).

**Danach, nach Wirkung im Bild (Augen-Befunde 14.10., Bilder artifacts/profiband/auge/1410 und welle-95/*):**
1. **Mensch-Kopf und Gesicht** (koerperstudio): heute die schwächste sichtbare Stelle (Augen, Mund, Haar-Fleck). Labor = Welt steht (K45-2), also wirkt jeder Schnitt im Studio sofort in der Welt.
2. **Laub** (terrain-Studio): Nadelbaum-Karten groß und kantig, Laub-Karten mit Dither-Muster — K56 nahm den Gras-Hebel, der Laub-Hebel ist offen.
3. **Tore fern** (portale): aus 30 m weiße Tafeln (Stufe 1/3); Tor-Klasse 160k > 120k (Entscheid über das Soll-Bild, K43-3 UEBERGABE).
4. **Boden-Stufen**: K51-2 (Geomorph) merge-reif machen, die Bau-Kante zum Fern-Ring (p95 1,39 m).
5. **Tier**: Fell plüschig, Haltung steif (K45: Labor = Welt steht).

**Parallel, die Einheit der Studios (Synthese W2–W6, artifacts/profiband/studios/synthese.md):** UI steht (EINE Hülle, 0 Hand-Regler),
Labor = Welt steht für Tier und Mensch, Foundry-Brücke steht. Offen: W2b/c Ofen-Kern + `buildInstance` rein · W4e Pflanzen-Dials in
PARAMS_BY_KIND · W5 Labor-Bühne = Welt-Licht (18-%-Karte im Labor 2,80×) · W6 EIN Sim-Rahmen (Fahren, Gang-IK, Treffer, Musik).

**Parallel, die Leistung (Frozen E):** CPU-Takt p95 6,0–9,6 > 5,8 (OMEN-Täter: Render-Objekt-Pfad +0,6 ms, `_projectObject`,
`_kaskadenWerferOben`, `_fassade`); Radeon-Ratschen auf dem Kopf prägen; B Ankunft (Weltbild zweit ~20 s, Haupt-Faden-Engpass).

**Parallel, die Prüf-Verdichtung:** Welt-Boot-Zweig `welt-boot` fortsetzen (153 Eigen-Boots → EINE lib, Absturz = ROT), dann
playtest.cjs (56k Zeilen) zerlegen; S0-Frist (170 s, drei swiftshader-Szenen) und Gelände-Kosten-Linse (Zeit-Verhältnis am Budget) flackern.

## Werkzeuge

- `artifacts/profiband/werkzeug/notbremse.sh` (WIP je Worktree), `ereignis-warte.sh`, `workflows/karte.js`, `workflows/integ.js`.
- Rehome aus fremdem Baum: scripts/stamm-rehome.cjs mit `ROOT = process.cwd()` (Kopie im Scratchpad).
- CI lesen: GitHub-API mit Token aus `git credential fill`; Warter als Bash run_in_background auf `head_sha`.
