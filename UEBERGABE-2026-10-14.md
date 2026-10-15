# ÜBERGABE 14.10.2026 — Wochenlimit 95 % (Koordinator-Sitzung bd24003f)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Dann diese Datei. Dann `memory/uebergabe-stand.md` (lädt automatisch über MEMORY.md).

## Köpfe

| Ref | Kopf | Zustand |
|---|---|---|
| main | 062ec357 (V18.546.1) | Bündel + Bremsen-Löser (BOOT_REST 17 → 1, S0 113 → 75 s, Linsen auf der Radeon) + + Tor-Stufen + Wiese-Teppich + Mensch Labor=Welt + Laub + Mensch-Kopf + Welt-Boot + Archiv-Wand + Schatten-Takt (1410-3: in Ruhe höchstens EINE Kaskade je Frame, in Bewegung das alte Gesetz) |
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
| main-naechst → main 0377737d | Laub K58, Mensch-Kopf K57, Welt-Boot, Archiv-Wand, V18.546.1 — gemergt (OMEN 1410-laub-abab: Frame nicht langsamer, Nadelwald +0,23 ms GPU Überzeichnung, benannt) | — |
| boden-stufen 672ad0b2 | K51-3 + K51-4; CI 13/13. OMEN 1410-boden2-abab: eingeschwungen hält es (Frame p95 24,9 → 25,0), beim EINSTRÖMEN nicht (Frame p95 29,3 → 41,6 ms, CPU p95 27 → 35) — der Morph war nur ein Teil | Rest-Täter aus dem Einström-Profil (Nachtrag zu 1410-boden2-abab.md) schneiden, dann Gehend-ABAB erneut; bis dahin NICHT nach main |
| mess-wiese | K55: Wiese -278/-1038 aus der Welt, Orts-Literale 30 → 0, Gelände-Proben aus `welt-orte.cjs`; trägt gtx-ratschen-1410 (6 GTX-Ratschen am neuen Ort) | Rote laut letztem Commit-Rumpf / Übergabe: Fahr-Leben S4/L6/L8, Höhlen-Sicht „hinaus“ (`_hoehlenAusgang`), streu-fern Bahnwechsel, werk-im-wasser; dann mergen (Ratschen gehören zum neuen Ort) |
| mensch-kopf | K57: Kopf-Soll (Anthropometrie) als Kern-Daten + Maß, dann Proportion/Augen/Mund im koerperstudio | Übergabe im letzten Commit-Rumpf; Bild Armlänge Labor = Welt |
| laub-aaaa | K58: Laub-Soll + Maß, größter Hebel (Nadel-Wedel / Blatt-Karten / Dither) | Übergabe im letzten Commit-Rumpf |
| flackern | B1: S0-Frist (drei swiftshader-Szenen) und Gelände-Kosten-Zeitverhältnis an der Wurzel | Übergabe im letzten Commit-Rumpf / C:\Users\micha\AppData\Local\Temp\claude\flackern\UEBERGABE.md |
| welt-boot-rest | B2: die 17 übrigen Eigen-Starts in welt-boot.cjs, pruef-vakuum (Z2a) hineinführen | dito, Temp\claude\welt-boot-rest |
| boden-stufen (K51-5) | Stufenwechsel ohne Form-Änderung setzt Wald/Sichthöhen nicht neu (OMEN-Profil: +4,3 ms beim Einströmen) | dito, Temp\claude\boden-folge; danach OMEN-ABAB gehend |
| linsen-radeon | K39-2: Linsen ohne Zeit-Urteil lokal auf der Radeon (Wand-Zeit-Hebel 1) | dito, Temp\claude\linsen-radeon |
| takt-wurzel (OMEN) | gemergt (main 7d7e2022). CPU-Rest stehend gegen 5,8: Wiese Ego hält, Wiese Third +0,6, Genesis Ego +0,5, Genesis Third +1,7 — Render-Objekt-Pfad ≈ 30 µs je Befehl, Kreaturen außerhalb des Bilds 0,75 ms, updateMatrixWorld 0,44 ms | OMEN bericht/1410-uebergabe.md |
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

## Vergessene Fäden (Reflexion 14.10. abends — jeder mit Ort)

- **Versions-Stufe:** seit 3e13e7bc trugen sechs geänderte Kerne noch `?v=18.546.0` (Cache-Mischung möglich, Lehre 10) — main-naechst 0377737d hebt auf 18.546.1. Die Minor-Stufe 18.547.0 braucht zuerst den Ratschen-Re-Mint (H2b: Radeon UND GTX auf demselben Kopf, Wiese am K55-Ort).
- **Frozen C** (Ort auf dem Gelände): K10 ort-gelaende 92972ef6 seit 13.10. unberührt — gegen den K16-Grund neu aufsetzen (Damm, Auto-Dorf-Slots, Nachtlicht ≥ 4 Quellen).
- **Frozen B** (Ankunft ≤ 5 s): seit K30/Instanz-Schicht unberührt; Weltbild zweit ~20 s, Engpass Haupt-Faden (K42 zeigte: der Worker ist nicht kritisch).
- **K38-N1** haus-fenster a5341ed3 (gate:fenster-wechsel rot) · **Augen-Befunde** 6 Haus fern, 8 Boden fern, 12 Gasse ohne Weg-Stoff, 16 Sinus-Mäander + harte Schnee-Kappe (koordination auftrag/auge-befunde-1310.md) · Tore aus 30 m als weiße Tafeln (auge-befunde-1410.md).
- **Grok-Karten** K29 (Fuß, ein Boden), K31, K33, K34 (Zwillinge Studio ↔ Welt), K35 (Altbauten, UFO fällt) — artifacts/profiband/grok-1310/sichtung.md.
- **Wald-Dichte**: Kronen-Deckung sättigt bei 0,18 (Matérn-II `pack` 1,16) — „Solitär-Lichtungen“, auf main gleich.
- **Drehbuch-Schritt 18**: der echte LLM-Lauf mit Schlüssel (docs/abnahme-drehbuch.md).

## Die Lehren dieses Tages für den Arbeitsfluss

- **Was trug:** Fertigsteller je Karte, der Koordinator merged selbst, Bündel → EINE ABAB → EIN FF; gut 20 Karten an einem Tag nach main.
- **integ-probe nur für Gemessenes:** K51-3 kam vor seiner ABAB hinein und sperrte dann Welt-Boot und Archiv-Wand (Umweg main-naechst per cherry-pick). Riskantes (Streaming, Takt, Pixel) bleibt auf seinem Zweig, bis die ABAB spricht.
- **ABAB auch GEHEND:** stehend „nicht langsamer“, gehend Frame p95 28,7 → 41,6 ms (K51-3). Jede Karte, die Streaming, Chunks, Stufen oder Takt berührt, misst gehend.
- **Soll als Kern-Daten + Linse** (K57 `KOPF_SOLL`, gate:mensch-anatomie) ist die Vorlage für jede AAAA-Klasse (Schritt 0 Soll-Tafel).
- **Feature-Zweige fahren nur den Puls:** für die volle Batterie `[ci voll]` in die Kopf-Message.
- **Fehler-Sammler findet Verstecktes:** der Welt-Boot machte stumme Seitenfehler sichtbar (verdeckungs-abfrage) — die 17 Rest-Boots können weitere tragen.

## Wand-Zeit: wo die Stunden hingehen (gemessen 14.10. abends)

Die Arbeiter verbringen die meiste Zeit mit Warten, nicht mit Rechnen (Tokens fließen kaum): volle CI ~25 min (+ Wiederlauf bei
Flackern), lokale Linsen auf swiftshader (Pipeline-Bau 42–292 s, gate:haus-welt 12,5 min), OMEN-ABAB 25–75 min. Hebel nach Wirkung:
1. **Linsen auf den Hardware-Adapter** (Zweig linsen-gpu, K39, WIP lokal): Linsen ohne Zeit-Urteil lokal auf der Radeon statt swiftshader — Pipeline-Bau Minuten → Sekunden. Die CI bleibt swiftshader.
2. **Flacker-Linsen** (Zweig flackern, B1): S0-Frist und Gelände-Kosten — kein Wiederlauf je Runde.
3. **Teure Gates schneiden:** gate:haus-welt 12,5 min lokal (seit K52), die S0-Bühne (drei swiftshader-Szenen).
4. **Mehr Karten parallel:** Warten kostet keine Tokens — die Zahl gleichzeitiger Fertigsteller ist durch das Wochenbudget begrenzt, nicht durch die Wand-Zeit.

## ERSTER AUFTRAG der nächsten Woche: der eigene CI-Runner auf dem OMEN (Schöpfer 14.10.: „ja champ … auf dem OMEN am besten“)

- **Zweck:** die GPU-gebundenen Linsen-Gruppen (Echt-Renderer, auf swiftshader 42–292 s je Programm) laufen auf der GTX 1060; CPU-Gruppen bleiben in der Cloud (11 parallele Runner — ein einzelner eigener Runner seriell wäre langsamer). Vorher die Gruppen per CI-Diät (Zweig ci-diaet) nach CPU/GPU trennen und messen.
- **Messplatz-Schutz:** der Runner nimmt keine Jobs an, solange das GPU-Schloss gehalten wird (ABAB, Ratschen) — sonst fälscht er die Zeiten.
- **Sicherheit (das Repo MiguellD/AnazhRealm ist ÖFFENTLICH):** der Runner bekommt ein eigenes Label (z. B. `omen-gpu`), Jobs darauf NUR aus `push` auf eigene Zweige, nie aus `pull_request`; Repo-Einstellung „Require approval for all outside collaborators“ ist GESETZT (14.10., auf Weisung des Schöpfers per API, approval_policy all_external_contributors). Den Runner aus der offiziellen Quelle (github.com/actions/runner Releases) laden, Datei/Quelle/Größe vor dem Download nennen.
- **Einrichtung:** die OMEN-Sitzung (Remote Control, koordination auftrag/) — Registrierungs-Token per API mit Admin-Recht (vorhanden).

## NOTBREMSE 14.10. ~19:15 (Woche 98 %) — der Stand beim Anhalten

| Zweig | Kopf | Zustand | nächster Schritt |
|---|---|---|---|
| main | 062ec357 (V18.546.1) | alles Gemessene des Tages | — |
| boden-stufen | 9e2f9c7c | K51-3..6 auf main gemergt, Linsen grün (K51-6 CI 13/13 an c682ae9d), CI an 9e2f9c7c lief | **ERSTER Messauftrag:** OMEN-Gehend-ABAB gegen main 062ec357 (bericht/1410-uebergabe.md) → hält das Einströmen ≤ 33 ms, FF |
| mess-wiese | d75c7ce9 | K55 + GTX-Ratschen, main gemergt; Rote: werk-im-wasser H/S, fahr-leben S4/L6/L8, hoehlen-sicht „hinaus“, koerper-stand K7 | Übergabe Temp\claude\mess-wiese\UEBERGABE.md; Täter nach Wirkung |
| ci-diaet | 85463744 (WIP Notbremse) | CI-Diät angehalten mitten im Schnitt | Übergabe Temp\claude\ci-diaet\UEBERGABE.md (falls angelegt) und Commit-Rumpf lesen; Ziel volle Batterie ≤ 8 min; danach der OMEN-Runner (oben) |
| takt-kreatur | (nur lokal, ohne Änderung) | K59 hatte noch nicht geschnitten | neu starten: Kreaturen außerhalb des Bilds 0,75 ms, updateMatrixWorld 0,44 ms (OMEN bericht/1410-3-takt.md) |

Fork-PR-Freigabe steht auf `all_external_contributors` (Voraussetzung des OMEN-Runners). Notbremse-Lehre: erst bei 98 % bremsen, vorher keine Drosselung.

## Aufräumen (Lehre 14.10. nachts)
Vergessene Prozesse zogen stundenlang Radeon-Leistung und verrauschten die lokalen Messungen (Spiel-Tab 7880 ~11 h, Werkbank-Echt-Fenster ~2 h, Puppeteer-Browser, 7 save-server, 13 journal-wache, 4 Studio-Tabs). Ab jetzt: nach jeder Welle und Augen-Runde `powershell -File artifacts/profiband/werkzeug/aufraeumen.ps1` (lokal, schützt :4312) und die Chat-Browser-Tabs schließen (preview_stop schließt keinen Tab). Arbeiter beenden, was sie starten. Benannt für den Code: die Werkbank beendet sich nach N Minuten ohne Befehl (Leerlauf-Frist), damit ein abgebrochener Arbeiter kein Fenster stehen lässt.

## Sauberkeit beim Anhalten (14.10. nachts)
- Lokal: 11 Worktrees statt 151 am Morgen — Haupt-Checkout (main), AnazhRealm-integ (integ-probe), AnazhRealm-diag, koordination, schau-v18537 (Auge, detached) und die offenen Zweige boden-stufen, mess-wiese, ci-diaet, ort-gelaende (K10), haus-fenster (K38-N1), pruef-vakuum (Z2a). Jeder sauber und gepusht. Roh-Daten entfernter Worktrees: artifacts/profiband/wt-archiv/.
- Keine Prozesse, keine Chat-Tabs, GPU-Schloss frei. OMEN: keine Prozesse, Fenster zu, GPU P8, alle Zweige gepusht.
- **integ-probe (9f61ab23) ist überholt:** sie trägt die alte K51-3 vor K51-4..6. Für die nächste Integration integ-probe auf main 062ec357 neu setzen (`git push -f origin 062ec357:integ-probe` nach Sichtung) und boden-stufen von dort aus mergen.

## NEUSTART 14.10. ~21:30 (Woche frisch, 0 %) — Koordinator-Sitzung 6fa51df3 „Gigant weitergehts"

- integ-probe auf main 062ec357 gesetzt; der alte Stand liegt als `integ-probe-alt-1410` (9f61ab23, K51-3 alt — überholt von boden-stufen).
- **Welle 1** (je Karte ein Workflow aus `artifacts/profiband/workflows/karte.js`):

| Karte | Zweig | Frozen | Risiko | Ports |
|---|---|---|---|---|
| K60 Ankunft kalt ≤ 5 s | ankunft-kalt (neu ab 062ec357) | B | R3 | 8200–8219 |
| K62 Render-Objekt-Pfad (≈ 30 µs je Befehl) | render-objekt (neu ab 062ec357) | E CPU-Takt | R3 | 8220–8239 |
| K10-6 Ort auf dem Gelände (main einmergen per stamm-rehome) | ort-gelaende | C | R3 tief | 8240–8259 |
| K55-5 Mess-Wiese + gtx-ratschen-1410 merge-reif | mess-wiese | E (Vorbedingung Ratschen) | R2 | 8950–8969 |
| K61 CI-Diät ≤ 8 min, Gruppen CPU/GPU markiert | ci-diaet | Takt der Arbeit | R2 | 8270–8289 |

- **OMEN:** Gehend-ABAB boden-stufen 9e2f9c7c gegen main 062ec357 läuft (bericht/1410-boden3-abab.md); danach Werkpaket K59 `takt-kreatur` (Kreaturen außerhalb des Bilds, updateMatrixWorld statisch; bericht/1410-k59-takt.md).
- **CI-Runner auf dem OMEN:** nach K61; das Ja zum Download holt der Koordinator frisch beim Schöpfer.
- **22:40:** OMEN 1410-boden3-abab: boden-stufen gehend nicht langsamer (Einströmen besser, eingeschwungen Frame gleich, CPU p95 +1,0 ms benannt) → V18.546.2 auf integ-probe d2e06032 (voller Playtest „Alle Invarianten OK“ 108 s, Augen-Runde Ankunft/Wiese/Wald ohne Naht), volle CI läuft; danach FF main.
- **OMEN-Runner online** (Id 21 `omen-gtx1060`, Labels self-hosted,Windows,X64,omen-gpu; bericht/1410-runner.md): Job-Start-Wand (nur Repo, push, Actor MiguellD) + GPU-Schloss „ci-runner …“ als Hook. Jobs bekommt er erst, wenn eine Karte nach K61 die GPU-Gruppen auf `runs-on: [self-hosted, omen-gpu]` stellt. OMEN jetzt an K59 takt-kreatur.
- **23:30 — main d2e06032 (V18.546.2, boden-stufen FF, CI 13/13).** K59 takt-kreatur (OMEN) in Abnahme: zwei Prüfer hier (wf K59), OMEN-ABAB 1410-k59-abab gegen main.
- **Welle 2 (AAAA + v1-Pfad), gestartet 23:30:** K63 `soll-tafel` (Schritt 0: Soll + Budget + Maß je Klasse, R2, 8400–8419) · K64 `tore-fern` (weiße Tafeln aus 30 m, Klasse 160k → ≤ 120k, R3, 8420–8439) · K38-N2 `haus-fenster` (Werkstatt-Vorschau ohne Warten, gate:fenster-wechsel, R2, 8440–8459).
- **Nicht in Bau (benannt):** Augen-Befunde Haus fern / Boden fern / Gasse ohne Weg-Stoff / Sinus-Mäander + Schnee-Kappe; Grok-Karten K29 K31 K33 K34 K35; Wald-Dichte (Matérn 0,18); pruef-vakuum Z2a; playtest.cjs zerlegen; Studio-Einheit W2b/c W4e W5 W6; Drehbuch-Schritt 18 (LLM mit Schlüssel); CPU p95 gehend eingeschwungen +1,0 ms (boden-stufen).
- **15.10. nachts — main 636db38a:** K61 CI-Diät (Prüfer ja, CI 38653603465 22/22): 18 Gruppen, Wand-Zeit 14,9–24,6 → 7,78 min ohne Konkurrenz; zwei gleichzeitige Batterien füllen die 20 Konto-Plätze. K59 in OMEN-ABAB am Kopf c6558274 (Prüfer ja, CI 13/13). Nächste Karte nach K59-ABAB: Echt-GPU-Gruppe auf dem OMEN-Runner nur für integ-probe/main (zusätzlich, nicht statt Cloud — ein serieller Runner würde die Batterie verlangsamen und die ABABs blockieren).
- **15.10. ~02:30 — main 3406f8bd:** K59 Kreaturen-Takt (CI 38659020007 22/22, voller Playtest OK). OMEN 1410-k59-abab: CPU-Takt p95 Wiese Ego 6,5→6,2, Wiese Third 7,2→6,3, Genesis Ego 6,2→5,7 (hält), Genesis Third 7,0→6,7; Rest gegen 5,8: +0,4/+0,5/+0,9. OMEN jetzt an K65 echt-gruppe. K63 Soll-Tafel: nach 3 Prüfrunden ROT (tor-fern still umbenannt, Haus/Fels/Wasser ohne heutiges Ist, gate:albedo-tafel liest Werte vom 07.10. = stale) → Nachbesserung läuft (karte.js kann jetzt start: nachbessern).
- **15.10. ~05:00 — integ-probe bd38fb16 = main + K55-5** (mess-wiese-k55 d8d9f2fa, Prüfer ja, Zweig-CI 21/21, voller Playtest OK): Mess-Wiese aus der Welt im Haushalt, GTX-Ratschen drin. OMEN 1510-k55-abab (Vorrang vor K65), danach FF und GTX-Ratschen-Re-Mint am neuen main (gtx-ratschen-1510). Radeon-Ratschen brauchen ein ruhiges Fenster ohne Arbeiter-Linsen.
- **15.10. früh — main bd38fb16:** K55-5 (OMEN 1510-k55-abab: nicht langsamer; Rest Genesis Third CPU p95 +0,4 an 2σ, Profil gleich bis _fieldRaycast +17 µs). OMEN prägt die GTX-Ratschen auf gtx-ratschen-1510, dann K65 (Auswahl ≤ 15 min je push integ/main + Nachtlauf aller 89 GPU-Schritte 04:30). K38-N2 in Nachbesserung (W2-Linse übersah zusammengesetzte Render-Argumente).
- **15.10. ~06:00 — integ-probe 0bbee8fc = main + K10-6** (Frozen C, ort-gelaende 277fe58f, Prüfer ja nach 4 Runden, CI 21/21, voller Playtest OK): gate:settlement Teil O am Auto-Dorf Sockel 0 m, Türen 16/16, GT 69,2 m in 5,8 s, Plan-Hash gleich, 5 Quellen nachts; PFLICHT-OFFEN trägt am Kopf nur B und E. Augen-Runde des Koordinators: Haus mit Tür, Terrassen, Nacht ≥ 4 Quellen — und neue Bild-Befunde (Bögen über der Traufe, lose Keilsteine, Terrassen-Wand mit Gras-Stoff, Laterne gesättigt orange, Gras über der Türtreppe) → K66 dorf-bild (R2, 8460–8479). OMEN: Ratschen an bd38fb16 als Zwischenstand, dann 1510-k10-abab (~2 h 15); FF erst danach.
- **ENTSCHEID 15.10. ~06:30 — K38-N2 Prüfkarussell beendet:** Runde 4 fand an der statischen Linse W2/W7 (gate:v1-pfad) weitere Syntax-Varianten (Spread-Argumente, Schlaf in Variablen, rAF-Promise, bind-Poll). Die Linse wurde je Runde stärker (Mutationen 1/16 → 5/16 rot am Namen), das Spiel (EIN Foundry-Zug, kein Poll) stand seit Runde 2. Eine Text-Linse holt Syntax nie ganz ein (Lehre 6: Zugehörigkeit an Laufzeit-Marke). Darum: K38-N2 geht mit benanntem Rest in die nächste Integration (nach Zweig-CI + OMEN-ABAB), die Klasse „wartet ein Foundry-Leser auf Zeit“ wird eine LAUFZEIT-Linse (Zeitgeber im Foundry-Pfad je Vorschau zählen, am Stapel benannt) — Karte nach K66.
- **CI-Stall-Klasse** (gate:webgl-probe / Kamera-Leib auf swiftshader-Linux, 4 Läufe in 24 h): K67 `webgl-stall` (R2, 8480–8499) — Linse in welt-boot (Chrome-Stderr, letzte Phase), 10–20 Läufe in der CI, Schnitt an der Wurzel, kein Retry.
- **K62 render-objekt** (fedecfaa) nach 3 Nachbesserungen nicht merge-reif (3,3 M Tokens): gate:verdeckungs-abfrage hängt mit der Diät-Weiche stamm/07.js:883-884 (CI 30-min-Deckel), Gewinn lokal nur gegen den eigenen alten Kopf (Genesis Third _loopRender 4,83 → 4,60 ms). ENTSCHEID: erst messen (OMEN 1510-k62-abab gegen main), dann weiterbauen oder fallen lassen — kein weiterer Fix-Arbeiter vor der Zahl.
- **K63 Soll-Tafel** merge-reif an 1c23bfe7 (alle 8 Klassen mit heutigem Ist, 7 ROT; Reihenfolge laub 0,775 · boden-nah 0,458 · himmel-licht 0,166 · wasser 0,074 · tor-fern 0,046 · haus 0,038 · kopf 0,003). ENTSCHEID vor dem Merge: die Stand-Wand von gate:albedo-tafel darf keinen fremden Merge sperren, den die CI nicht selbst heilt (Kommentar-Zeile machte sie ROT) → Nachbesserung: Prüfsumme über Code ohne Kommentare, Neumessung in der CI oder im OMEN-Nachtlauf, veraltet = ROT in der Tafel, nie grün. **K68 laub-volumen** (AAAA, größte Wirkung, R3, 8500–8519) gestartet.
- **K60 ankunft-kalt** (63d8d5b8, 3,3 M Tokens): Radeon kalt Median ~22 → 18,5 s bei vollem Bild (Arbeit ohne Leser hinter das Bild, Freistand gemerkt, Feld-Pass-Höhen im Voxel-Faden, Foundry 4 Werk-Fäden, EIN Lade-Takt, Weltbild zählt die Pflanz-Schlange). Letzter Rot: gate:mp-sync (d) urteilt falsch (Gesetz hält) → Nachbesserung läuft. Danach OMEN-ABAB stehend + gehend + GTX-Kalt-Zeile. Nächste Terme bis 5 s (für K60-2): Takt-Scheduler unter dem Ladeschirm 6,4 s, Zeichnen unter dem Ladeschirm 3,5 s, Seiten-Boot 2 s, Spieler-Guss 1,3–1,9 s, Ring-Farben 1,7 s, Zell-Planung 1,5 s, Bäume kalt 10 s im Werk-Faden, Bäcker-Schwanz 2,3–4,9 s.
- **15.10. ~08:00 — integ-probe 84ef38a9** = 0bbee8fc (K10-6) + K64 Tore fern (Tor-Stufe 2 ab 12 m, Genesis Third Tor-Klasse 166k → 113k, CI-Linse portal-membran 233 → 29 s; Golden-Konflikt mit K10-6 per MINT_NUR_DATEN gelöst) + K38-N2 Werkstatt-Vorschau (Konflikt diag-tor-fern: Methode am Namen). Voller Playtest OK je Merge. FF-Plan: main → 0bbee8fc nach OMEN k10-abab; dann OMEN k62-abab; dann OMEN Bündel-ABAB (integ-Kopf gegen 0bbee8fc); dann Ratschen. In Bau: K60-Nachbesserung, K63-Nachbesserung, K66 dorf-bild, K67 webgl-stall, K68 laub-volumen.
- **15.10. ~10:00 — integ-probe e8a370ad** = 545f75a7 (K10-6 + K64 + K38-N2 + K63) + K60 Ankunft (Prüfer ja, CI 22/22, voller Playtest OK). OMEN 1510-k10-abab: Wiese/Genesis nicht langsamer, Dorf stehend im Band, aber Dorfweg GEHEND beim Einströmen Frame p95 41,6 > 33 (CPU p95 27 → 35) — Gegenprobe A auf seiner eigenen Dorf-Achse läuft (VOR K62), sie entscheidet den FF von 0bbee8fc. Bündel-ABAB danach mit GTX-Kalt-Zeile (Frozen B).
- **15.10. ~10:30 — main 0bbee8fc: FROZEN C GEFALLEN** (K10-6). OMEN-Gegenprobe: der Einström-Riss 41,6 ms gehend ins Dorf ist der Preis jedes Dorfwegs, auch auf main (A in sein eigenes Dorf 41,6/41,6/41,6/33,4) — kein K10-Täter; Kandidat Häuser-Streaming (VRAM beim Einströmen +8,6 / +23 MB). → **K69 dorf-einstroemen** (R3, 8540–8559). PFLICHT-OFFEN: B, E.
- **ENTSCHEID 15.10. ~11:00 — Prüftiefe enger (karte.js):** Messung über 18 Karten-Workflows: Prüfer + Nachbesserer tragen ~70 % der Arbeiter, R3-Karten 11–12 Arbeiter und ~3–4 M Tokens. Echte Spiel-Funde gab es bei K59 (Tier ruhte im Bild), K60 (Mitspieler fiel zurück), K62 (Verdeckungs-Abfrage hängt), K63 (veraltete Werte) — Linsen-Härtung gegen Syntax-Varianten bei K38-N2 war Leerlauf. Neu: ROT sperrt nur Spiel-Bruch/Regression, falsche Zahl, vakuöse Karten-Linse, rote CI, Konflikt, Verstoß gegen die GOLDENE DEFINITION; Linsen-Härtung darüber hinaus, Altlasten und Stil sind GELB (benannt, Folgekarte). Nachbesserungen R2 2 → 1, R3 3 → 2; danach entscheidet der Koordinator.
- **K70 boden-nah** (AAAA #2: geschlossene Grasnarbe laiWirk 0,647 + W5 Farb-Gesetz im Terrain-Labor, Boden L/W 4,07; R2, 8560–8579) gestartet.
- **15.10. ~12:00 — Durchbruch-Plan** (auftrag/durchbruch-1510.md, wf_389eb460-ad6, 1,6 M Tokens): die Wand des Bands ist die CPU (Render-Pfad je Befehl, gehende Folge-Kette), die Radeon reißt an Genesis womöglich allein an der GPU (17,8 ms → VSync 33,3). Karten D1–D9 mit Gegenprüfung; korrigierte Reihenfolge: messen (OMEN zerlegen) → E-CPU (K62, D6a, D2 in k0) → E-Radeon-GPU (D8a, D1, D5) → Bild (D3, D4, D9, D8b, D7). **PFLICHT-OFFEN A gesetzt** (AAAA je Klasse, Wort des Schöpfers 15.10.), integ-probe a19ca615. **Spikes laufen** (wf durchbruch-spikes): D3 Licht offline, D8a Membran, D1 Speicher, D5 Boden — je eine Zahl entscheidet Bau oder Fallen; D2 wartet auf das K62-Urteil des OMEN.
- **K62 FÄLLT** (OMEN 1510-k62-abab, 89119a2c): CPU-Takt p95 Δ in 2σ an allen vier Orten, das Profil an Genesis Third sieht B teurer (loop 6,49 → 7,07 ms; die Wache _befehlHaelt 2,2 ms + Diät je Stoff kosten mehr, als das Bündel spart), Ankunft schwerer. Zweig render-objekt bleibt als Archiv, kein Merge. Der echte Hebel aus dem Profil: _diaetRefresh 1,4–2,1 ms je Frame (+ updateBeforeNode 1,98, needsRefresh 1,40 auf main) → **K71 diaet-aenderung** (R3, 8640–8659). OMEN: Bündel-ABAB (seit 09:37) → zerlegen an a19ca615 → Ratschen → K65.
- **15.10. ~13:00 — integ-probe 0709a85c** = a19ca615 + K67 webgl-stall (Ursache: das Glimmen des Ladeschirms belegte die swiftshader-Raster-Fäden; Stall 17/252 → 0/96; Software-GL fährt jetzt kienspan wie Software-WebGPU). Benannter Spiel-Befund: der WebGL-Rückfall mit holz=voll zeigt auf swiftshader schwarze Flächen (älter als K67). Worktrees der in integ-probe gemergten Karten entfernt (Roh-Daten in wt-archiv).
- **15.10. ~14:30 — integ-probe b8ee199f** = 0709a85c + K68 Laub (Entscheid: Kern steht, Rest benannt; 2,5 M Tokens, Nachbesserer bauten zuletzt eine neue Linse statt zu schneiden). zweiton 0,0349 → 0,0001 (laub-Wirkung 0,775 → 0,016), Kronen-Normale EIN Gesetz in phyto-core, Kosten gleich. Augen-Runde: Kanten weich, Kronen mit Volumen, Raster weg — offen: Blätter zu groß (laub-kante 0,305 > 0,22), ferne Büsche flach-hell, Tanne als besonnte Schale (→ D4 Verdeckung im Kronen-Inneren).
- **15.10. ~16:00 — SPIKES (1,1 M Tokens für vier Urteile):** **D8a BAU** (Membran 1,50 → 0,38 ms, Apertur mit Nebel 3,80 → 0,38 ms am Tor nah, milchweiss 0,245 → 0,018; spike-d8a-membran bfb79739) · **D3 BAU** (Hillaire mit dem Welt-Gesetz 5,144 im Soll [5; 12,5], heute 4,226; Rand schmal: Aerosol aus LUFT, Boden aus der Albedo-Tafel; spike-d3-licht 110c3f99) · **D1b FÄLLT** (Vertex nur 17,5 % des VRAM, max 2,58 MB; die Texturen tragen 80,5 MB, davon TRAA-Geschichte + Resolve 2 × 15,8 MB rgba16float bei voller Ausgabe — der VRAM-Hebel liegt dort) · **D5 FÄLLT** (cachebarer Boden-Anteil ≤ 0,94 ms < 1,5, Clipmap +3,9–7,9 MB). Zweiter Befund D3: C*ab der Vegetation trägt das Grading (Sättigung 1,18, −25 %) und die Kurve (ACES → AgX −16 %), nicht die Atmosphäre → eigene kleine Karte nach D3.
- **Gestartet:** D8 `tor-membran` (R3, 8660–8679) und D3 `eine-atmosphaere` (R3, 8680–8699) in EINEM Workflow.
- **15.10. ~16:30 — main a19ca615** (OMEN 1510-buendel-abab: nicht langsamer; K60 trägt die Ankunft am Ort: CPU p95 nach dem Umstellen Wiese 24,8 → 5,6, Dorf 31,9 → 7,7; K64 Genesis Third −65k Dreiecke; benannt: Genesis Ego fps 78,5 → 73,6 (Verbraucher außerhalb der Pass-Stempel, Zerlegung läuft), VRAM +0,8/+1,6 MB). OMEN-Schlange: Zerlegung Genesis Ego → Kalt-Zeile → Zerlegung für K71 → k68-abab (65854e26) → Ratschen → K65.
- **Kalt-Zeile GTX (OMEN c44c383f): a19ca615 kalt 29,2–30,3 s gegen 0bbee8fc 25,4–26,1 s (+3,9 s).** Das Weltbild wartet jetzt ehrlich auf die Pflanz-Schlange und den Horizont (K60: kein halbes Bild mehr — A zählte ein Bild ohne gepflanzten Wald), und die Streu läuft vor dem ersten Bild auf dem Haupt-Faden 2,6 → 6,1 s (Haupt-Faden bis zum Bild 18,8 → 26,0 s blockiert). Radeon schneller (22 → 18,5), GTX langsamer — kein Rückbau (das ehrliche Bild ist Pflicht, L2a), aber **Pflicht für K60-2**: die Streu des ersten Bilds aus dem Haupt-Faden (Lehre 14: im Worker vorgebacken) bzw. nur die Streu im ersten Blick vor dem Bild. Zerlegung Genesis Ego: Bank je Frame gleich, der Mehr-Durchsatz liegt außerhalb des Frames (Zählprobe läuft).
- **K60-2** (1,3 M, viermal Kontext-Deckel ohne Abschluss): geschnitten makeBarkNormal nur an ganzen Indizes (1251 → 55 ms, 2,36 M gebrochene Zugriffe, Byte-Beweis gleich) und get-book direkt nach new Worker; Radeon kalt 13,3–18,7 s (verrauscht). → **K60-3** (eng: K60-2 abschließen + Streu des ersten Bilds aus dem Haupt-Faden, der GTX-Täter +3,5 s). OMEN-Zerlegung a19ca615 (213bdaac): Bank Wiese 8,5–8,6 / Genesis 11,7–12,4 ms; Boden 1,4–2,1, Baum 1,25–1,6, Nachbild-Kette 2,0–2,2 ms; K71-Vorher _diaetRefresh 1 707 µs (davon _diaetGeteiltSchreiben 1 278), needsRefresh 1 738 µs je Frame an Genesis Third; Genesis-Ego-fps-Verlust vermutlich K60s Werk-Fäden auf 6 Kernen (Probe nach K68).
- **K69** (1,4 M, viermal Kontext-Deckel): `_satzBlock` flüchtig (461 KB frisch je Frame → 0); die lokale Geh-Serie zerfiel (EADDRINUSE, Schloss-Wartezeiten). → **K69-2** eng: der synchrone Chunk-Neubau beim Erdbau des Dorfs (168 ms, Flut-Saat nur im Haupt-Thread) in den Voxel-Worker. **ENTSCHEID: keine lokalen Boot-/Geh-Serien mehr** (karte.js KOPF): die Maschine teilt EINE Radeon mit bis zu acht Arbeitern; lokal nur Profil + A/B in EINER Welt, Serien bestellt der Koordinator beim OMEN.
- **15.10. ~18:00 — integ-probe 90e09eca** = 65854e26 + K70 Boden nah (Prüfer ja, CI 22/22, voller Playtest OK): geschlossene Grasnarbe bis 14 m, laiWirk 0,647 → 1,855 (Soll ≥ 1,7 GRÜN), nahWiese 76,3k Dreiecke / 4 Befehle an der Wiese; _fieldSurfaceBelow tastet auf dem Welt-Raster (GT steht ruhig, L8 Lockstep 0). Benannt: harte Kante am 14-m-Ring, zwei Bodenlicht-Gesetze (_bodenLichtFeld vs _canopyLightAt), Albedo-Tafel nach dem Merge veraltet (misst der Job echt neu), VRAM ungemessen. OMEN: k68-abab (65854e26) → k70-abab (90e09eca gegen 65854e26) → FF → Ratschen.
- **15.10. ~19:00 — main 65854e26** (K67 + K68; OMEN k68-abab nicht langsamer, Laub-Shader kosten an der Wiese keine GPU; Genesis-Ego-fps-Schwankung als Sitzungszustand benannt, Probe 3: Werk-Fäden ohne Wirkung). **integ-probe 2031b3e4** = 90e09eca + K71 (Diät nur bei Änderung, Refreshs ohne Änderung 6,76 → 0,03 je Frame; Befund: 1,6–1,7 ms des _diaetRefresh sind der verschachtelte Schatten-Render) + **K5-Fix** (ein veraltetes Maß ist kein Geheilt-Widerspruch — sonst sperrte jede Welle check:statik; CI 22/22). Spike Schatten-Takt läuft (warum rendert in Ruhe eine Kaskade je Frame?).
- **Spike Schatten-Takt FÄLLT** (0,3 M): 'Kaskade nur bei Änderung' spart −0,03 ms (der Spieler steht in Third immer in k0; die Sonne verbraucht den k0-Texel 4,3×/s; Wind < 0,3 Texel). Befund: 42–66 % jedes Kaskaden-Renders sind Fixkosten — Host-Haken _passSicht (_instanzWahlPass, _chunkSatzPass, _werferWahlPass) 22–54 %, r184-Projektion 12–14 %. → **K72 schatten-wahl** (R3, 8700–8719): die Wahl je Schatten-Pass einmal je Box-/Inhalts-Wechsel. OMEN-Laub-Zerlegung: K68 kostet an der Wiese ≤ 0,2 ms GPU; Genesis-Ego Haupt-Thread-CPU in der Bank +0,75 ms benannt.
- **Spike D10 Gesetz-Strahl** (Idee des Schöpfers nach RAGE/GTA 6: Raytracing in niedriger Auflösung + Glättung): Strahlen in 1/4 Auflösung gegen die Höhen-FUNKTION des Geländes (wir brauchen keine Dreiecks-BVH — die Welt ist eine Funktion) für die Wasser-Spiegelung (Soll-Tafel wasser: Spiegel-Treue 0,114 → ≥ 0,6) und die Himmels-Sicht in Mulden, geglättet von der TAAU. Bau bei ≤ 0,8 ms Radeon.
- **15.10. ~20:30 — main 2031b3e4** (OMEN k70-abab: nicht langsamer; **K71 hält Wiese Third CPU-Takt p95 6,5 → 5,5 ≤ 5,8** — zum ersten Mal; Wiese Ego −0,4; gehend −0,3 bis −0,5; Genesis Third bleibt 6,8 = die letzte E-Zelle über 5,8 (GTX) → K72; benannt: K70 Wiese-Ego-GPU +0,56 ms (+5,3k Dreiecke Grasnarbe), VRAM Wiese −3,2/−1,2 MB). OMEN prägt die GTX-Ratschen an 2031b3e4, dann K65.
- **K72 schatten-wahl** (1,0 M Tokens, 3 Arbeiter — die enge Karte + neue Prüfregeln tragen): castShadow ist die Wurf-Ebene (Liste je k0-Render Genesis 137 → 42, Wiese 93 → 24; je Render Genesis k0 1463 → 1299 µs, Wiese 1120 → 1011 µs lokal), Werfer-Wahl je Pass nur bei Änderung (Ruhe 30 → 0). integ-probe 02fe5b6d (+ Lehre-26-Zeile). OMEN 1510-k72-abab bestellt: entscheidet die letzte GTX-E-Zelle Genesis Third (6,8 → ≤ 5,8?). Benannt: Rest je Kaskaden-Render im Lauf ~3× die Bank (Kosten je Befehl ~26 µs + ~300 µs fester r184-Aufwand je Render).
- **Spike D10 BAU** (0,34 M Tokens): Strahlen in 1/4 Auflösung gegen eine 512²-Höhentextur des Gesetzes: 0,06 ms je Pass (nur Wasser-Pixel), Ufer/Hügel/Wald im Spiegel am richtigen Ort (artifacts/profiband/spike-gesetz-strahl/see-voll-fein.png); die Funktion direkt im Shader fällt (3,4 ms, Zwilling). → **D10 wasser-gesetz-strahl** (R3, 8720–8739): Spiegel-Feld im voxel-worker (gebauter Boden + Kronen aus treeParams), Pass 480×270, Linse spiegelTreue in K5 (Soll ≥ 0,6).
- **K66 dorf-bild** (3,3 M, alte Prüfregeln): gebaut Bögen im Verband unter der Traufe (821 rot → 0/916), Terrassen als Schutt (Wiesen-Stoff → 0), Türstufen auf dem Weg (16/16), Laternen aus der Fahrbahn (123/292 → 0/312), Giebelwand ohne Sättigung. Rot (Spiel-Regression): die dichte Gasse nachts 83 % schwarz (Basis 18,6 %) — laterneNah setzt Laternen an fremde Stände; DORF-LICHT zählt statt zu messen. → **K66-2** eng: WANDLATERNE mit Licht, Licht je Marke ≤ 15 m.
- **K69-2 dorf-einstroemen** (2,1 M): ein Chunk-Neubau im Takt baut nie mehr synchron (nur forceSync), die Flut-Saat hat EINE Quelle `_flutSaat` und reist bit-identisch mit jedem Worker-Auftrag, je Frame höchstens ein Einbau nah zuerst; gemessen: synchrone Chunk-Bauten beim Erdbau unter dem Spieler 1 × 408,8 ms → 0, längster Dirty-Takt 261,9 → 36,2 ms; sechs Linsen an der Wald-Schlange nachgezogen. Letzter Rot (playtest-fast las Rezepte vor der Buch-Ankunft) vom Koordinator geschnitten (5540ebeb, wartet auf das Ereignis), Zweig-CI läuft; danach integ + OMEN-Geh-ABAB auf dem Dorfweg. Benannt: blasser durchscheinender Laubbaum in der Dorf-Mitte (LOD-Blende?) → Bild-Urteil.

## STAND 15.10. ~21:30 (Woche 72 %, Kontext des Koordinators 79 %) — für den Nachfolger

- **main = 2031b3e4.** Darauf seit 14.10.: boden-stufen, K61 CI-Diät, K59 Kreaturen-Takt, K55-5 Mess-Wiese, K10-6 Ort (**Frozen C gefallen**), K60 Ankunft, K64 Tore, K38-N2 Werkstatt, K63 Soll-Tafel, **Pflicht-Offen A gesetzt** (AAAA je Klasse, Wort des Schöpfers), K67 webgl-stall, K68 Laub, K70 Boden nah, K71 Diät.
- **integ-probe = 49824a19** = main + K72 Schatten-Wahl (02fe5b6d) + GTX-Ratschen Wiese/Dorf. Wartet auf OMEN 1510-k72-abab (läuft seit 17:48) → FF; danach prägt der OMEN Genesis Ego/Third + Wiese Third neu.
- **E (GTX, stehend):** Wiese Ego/Third und Genesis Ego halten 5,8; **Genesis Third 6,8** ist die letzte Zelle (K72 zielt darauf). Radeon-ABAB + Radeon-Ratschen stehen aus (ruhiges Fenster ohne Arbeiter nötig).
- **B:** GTX kalt 29–30 s (ehrliches Weltbild mit Wald), Radeon ~18 s. K60-4 läuft (Start-Dorf im Weltbild, dann K60-2/3 merge-reif: makeBarkNormal 1251 → 55 ms, get-book früh, PID misst nicht unter dem Ladeschirm). Nächster Schritt B: eine Durchbruch-Analyse des kritischen Pfads am OMEN-Profil (alle Generierung parallel in einen Worker-Pool, der Haupt-Faden lädt nur hoch) statt weiterer Einzelkarten.
- **In Bau:** D8 tor-membran + D3 eine-atmosphaere (ein Workflow), D10 wasser-gesetz-strahl, K66-2 dorf-bild (Wandlaterne mit Licht), K69-2 dorf-einstroemen (Zweig-CI 5540ebeb läuft; dann integ + OMEN-Geh-ABAB Dorfweg), K60-4.
- **Verfahren (bewährt heute):** Spike vor Bau (D1b, D5, Schatten-Takt fielen billig; D8a, D3, D10 trugen); enge Karten mit einem Schnitt (K72: 1,0 M, 3 Arbeiter); ROT nur am Spiel; keine lokalen Serien — Zeit misst der OMEN; Zweig-CI am exakten Kopf vor jedem Merge.
- **Offen benannt:** Grading-Sättigung 1,18 + Tonkurve (C*ab der Vegetation), TRAA-Geschichte 2 × 15,8 MB VRAM, Nachbild-Kette 2,0–2,2 ms GPU, blasser Baum in der Dorf-Mitte (LOD-Blende), harte 14-m-Kante der Grasnarbe, zwei Bodenlicht-Gesetze, WebGL-Rückfall schwarze Flächen (swiftshader, holz=voll), K65 echt-gruppe (OMEN).
- **15.10. ~22:30 — integ-probe ed2f5c1d** = 49824a19 + K69-2 (synchroner Chunk-Bau 408,8 ms → 0; Schnell-Playtest wartet aufs Buch) + **D8 Tor als Fenster** (Membran 1,50 → 0,38 ms, Apertur 3,80 → 0,38 ms am Tor nah, milchweiss 0,245–0,426 → 0,023–0,039, zielTreue 0,69–0,87; je Studio ein gebackenes Panorama worlds/<welt>/panorama.f16, 10 × 1 MB im Baum; Merge-Fix: veraltetes Panorama H5 sperrt nicht, wie K5). OMEN-Schlange: k72-abab → FF → Bündel k69d8 (gehend Dorfweg/Wiese, Genesis, Tor nah) → Genesis-Ratschen. **D3** (6,4 M zusammen mit D8!) nicht reif: Nacht dunkler (Luma 38 → 5) + voller Playtest liest .intensity → **D3-2** eng.
- **15.10. ~23:30 — Selbstkritik auf die Frage des Schöpfers (Woche 73 %):** seit 062ec357 wuchs scripts/+spec/ um +20 039 / −3 690 Zeilen, der Spiel-Code um +5 285 / −2 026 (284 Commits) — der Prüf-Apparat 5× so schnell wie die Welt; jede echte Änderung brach 2–6 Text-Linsen. → **V1 pruef-diaet** (Fang-Rate jeder Linse aus 300 CI-Läufen, Linsen ohne echten Fang fallen, scripts/ −20 %, Ratsche als Wand), karte.js KOPF 5b (Apparat-Diät je Karte). Keine neuen Feature-Karten mehr diese Woche; die laufenden (D3-2, D10, K66-2, K60-4) enden mit einer Nachbesserung.
- **K66-2** auf integ-probe 015a3f74 (CI 22/22, voller Playtest OK): Wandlaternen dort, wo im Umkreis 10 m kein Licht brennt (Gasse-Meter > 10 m vom Licht 768/4278 → 0), nacht-wand schwarz 69,4 → 24,4 %; benannt: Licht-Pool wählt nach Rang statt Beitrag (Gasse +4,9 Punkte dunkler, unter Soll), Auto-Dorf 12 → 17 Laternen (Kosten misst der OMEN). Grok: eigene Sitzung (local_3d7c4bf9) steuert die Grok-Desktop-App per Computer use, Paket 1510.
- **15.10. ~23:59 — main 49824a19** (K72 + Ratschen Wiese/Dorf). OMEN k72-abab: nicht langsamer, aber KEIN CPU-Gewinn an der GTX (Genesis Third 6,4 → 6,4; Wiese Ego 4,7 → 5,0, Wiese Third 5,7 → 5,5, Genesis Ego 5,5) — E hält in 3 von 4 Zellen, Genesis Third bleibt 6,4. Befund am Instrument: manche Genesis-Boots mit schwebendem Dorf-Plan zählen trotz „NICHT eingeschwungen“ → OMEN baut messfolge-ruhe (Neulauf, Dorf-Auftrag vor dem Boot gesperrt). Genesis Ego 78 → 72–74 fps seit e8a370ad = Code-Term, Profil in k69d8. OMEN: messfolge-ruhe → k69d8 (A 49824a19, B 015a3f74).
