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
