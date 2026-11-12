# HEBEL-KARTE 2026-11-11 — Befund eines Opus-Schwarms (kein Plan, kein Scope: der Scope bleibt docs/PFLICHT-OFFEN.md)
17 Linsen, 24 Hebel, nur gelesen, kein Lauf. Der Kritiker hat die Stellen von 1–5 nachgelesen (origin/koordination ed864a3e, origin/main); seine Korrekturen sind mit [K] markiert.

## 1 Die stärksten Hebel (nach Wirkung × Sicherheit ÷ Aufwand)
1. [Prozess · S · 0,6] Buchen am Mess-Kopf der Scheibe, danach am jüngsten Kopf — zug/dienst/buche-dienst.sh:23 `BUCHE_KOPF=$K` (Auslöser je Scheibe steht seit 85776d3a)
   erwartet: Meisterkarte 218 → 219 (lod.K2#1 GRÜN an bc0a4aed, Radeon). [K] profiband.K4#1 ist strittig: der Richter misst es 21:10 an der Radeon ROT (97 % > 33 ms, zug/richter.txt)
   Probe: Wegwerf-Klon, `punkte.cjs buchen --kopf bc0a4aed`, dann `--kopf e38e7acf`; steht an bc0a4aed nicht ≥ 219 oder fällt die Summe am jüngsten Kopf → tot · Beleg: messung/bc0a4aed-radeon.json
2. [GEFALLEN 12.11. an der eigenen Probe — NICHT schneiden: Actions-API, integ-probe 7 Tage: 129 Läufe mit Versuch ≥ 2, davon 38 am Ende grün; am 11.11. kamen sechs Landungen erst im Zweit-Versuch (b1531071, c4010773, bc0a4aed, b0112f7b, e6f0cf7e, 2cb2865b). Der Hebel dahinter sind die Schritte, die im Erst-Versuch wackeln.]
   [Prozess · S · 0,6] Blinder Neulauf bei ROT außerhalb von WACKEL_RE fällt — zug/dienst/werkzeug/zug.cjs:226-228 [K] (`rerun-failed-jobs` in urteilVon); Neulauf nur noch bei cancelled (:184-186)
   erwartet: Push bis FAHRT ROT ~36 → ~26 min, ~60 min Zug-Zeit/Tag (6 Neuläufe am 11.11., 0 GRÜN) · Probe: Actions-API, run_attempt=2 der letzten 7 Tage; ≥ 2 gerettete Landungen → tot
3. [Prozess · S · 0,65] Headless-Hälften einmal mit Konsum-Zeugen nachmessen — `zug.cjs punkte <K> --geraet headless` als eigene Hintergrund-Schleife, nicht in buche-dienst
   erwartet: r6 konsum in stand.json 85 → 210–234 [K: 85 konsum / 249 naehe nachgezählt] · Probe: `--nur` 10 Hälften von d3708675; ohne konsum oder > 20 min → tot
4. [B · S · 0,45] WGSL-Bytes über Boots gleich, damit der Browser-Pipeline-Cache trifft — erst MESSEN, dann schneiden
   [K] Chokepoint offen: `_knotenRate` (bild-kosten.js:603/652) ist der Raten-Takt, die Namen nodeUniformN/nodeVarN vergibt der Node-Bau von three (vendor, nicht editierbar)
   erwartet: Pipeline im Zweit-Boot 1,2–3,1 s → < 0,1 s, GTX 1050 Zweit-Boot 12,5–13,5 → ~9–10 s · Probe: diag-boot-stage --echt --profil zweimal, SHA-256 je Modul an diag-weltbild-frost.cjs:63-67
   + Größe <profil>/Default/DawnWebGPUCache; Cache leer bei Standard-Schaltern oder gleiche Bytes und weiter > 1 s → tot, dann gilt Nr. 5 (Konkurrent um dieselbe 3,5-s-Lücke)
5. [B · M · 0,5] Programme der Erstbild-Arenen vor dem Körper — bild-kosten.js:743 `_vorbauWahl` (lade → nur „merken“) über das gelandete Gast-Muster
   siedlung-bauten.js:1440 `_vorbauGast(...,'ankunft')` (Vorbild gelaende-fern.js:875 Kamm-Krone, 7c2a77ca); EIN Bestell-Pfad, kein zweiter
   erwartet: GTX 1050 Zweit-Boot 11,4–13,1 → ≤ 10,5 s, kalt −1…−2 s (Lücke „Arena ohne Programm“ 3,5 / 2,1 s) · Probe: 3↔3 Zweit-Boots, nur der Strauch-/Laub-Gast; < 1 s früher → tot
6. [B · L · 0,5] Ausgelieferte Platte: CI sät die IDB je Kern-SHA + Wirt-Stempel als EINE Datei — studio-bruecke.js:856 `_foundrySchale`, beim ersten Miss einmal laden
   erwartet: GTX 1050 kalt 22,2 → ~16–17,5 s (volle Platte allein 6,3 s), GTX 1060 ~13–14 s geschätzt · Probe: frisches Profil + nur der IDB-Ordner kopiert, 3↔3; < 3 s → tot
   fehlt die Datei → laut „platte-fiel“, kein stiller Rückfall; spec/pack/v0/CONTRACT.md:180 §v1.5 beschreibt den Pfad, gebaut ist nur der Hook
7. [v1 · S · 0,65] Ollama-Standard = gemessenes qwen3:4b-instruct — dirigent-kern.js:523 `model:"llama3.2"`, feld-nexus.js:830 Liste ohne qwen3:4b-instruct
   erwartet: Spieler-Standard trägt 41/41 gültig, 100 % Absicht, p95 2,41 s (ki.K1#2, ki.K5#1) · Probe: KI_MODELL=llama3.2 diag-v1-pfad --korpus --echt; ≥ 39/41 → nur Kosmetik
8. [v1 · S · 0,6] Genesis-Welt wird in schöpfer geboren — speicher-welten.js:481 `gameMode:"frieden"` (nur Genesis; „frieden zahlt“ bleibt für spätere Welten)
   erwartet: spielgang.K1 ohne Spur-Frames 372–392: 0/1 → 1/1 bank_sitzbank, Eingaben 8 → 4 · Probe: Spur headless ohne die Frames; Bank steht auch in frieden → tot
   Scope-Frage an den Schöpfer (Genesis in schöpfer?) — vorher nicht landen
9. [A · S · 0,95] Die A-Zeile nennt die tote Klasse fimp:atlas:L2 (0 Treffer in bc0a4aed-radeon.json) — docs/PFLICHT-OFFEN.md:16 + soll-tafel.json:735-818
   erwartet: echtes ROT Strauch 0,279 Radeon / 0,256 GTX, GTX zweiton Fichte/Tanne, Buche 0,229 · Probe: werkbank bild --ist laub-kante; geht mit dem nächsten laub-kante-Schnitt, kein Docs-Commit
10. [A · M · 0,3] Karte nimmt je Pixel EINE Ansicht statt Alpha-Mischung — stoff-material.js:1352-1361 `_samp=mix(A,B,_fb)`; bei _fb≈0,5 besteht ein Pixel mit einer Ansicht (alphaTest 0,45)
   erwartet: lod.K5#1 Weide @26 m 5,1 → 1,4–3 px (Familie bleibt ROT: Totholz 3,43) · Probe: koordination bericht/1111-baum-wechsel/baum-fehler.cjs; > 4 px → tot
11. [E · M · 0,35] Karten-Fragment 3,88 → 8,40 ms seit cd2dfafa — stoff-material.js:1186-1253 `_relief` (KARTE_RELIEF gaenge 3, stoff-karte.js:2031) 1,7 ms + 2,8 ms ohne Täter
   erwartet: karten ≤ 5 ms, gpu-bank Wiese Ego GTX 27,4 → ≤ 24 ms · Probe: werkbank zerlegen an cd2dfafa/b5012e8b/main + gaenge 0; < 1 ms Abstand → Geometrie, nicht Stoff
12. [C · M · 0,4] Warte-Graph bricht die Stau-Kreise der Ort-Schlüssel als EINE Regel — siedlung-verkehr.js:1641 `_verkehrZonen` (ersetzt weicht + Pflaster c7c2274b/5192ad31/e35b2c72)
   erwartet: Platz-Stand 23 h: Ankünfte 9 → in die Nähe von 157, Wagen ohne Ziel 11 → 0 (diag-fahr-leben --verkehr; gemessen nur am Zweig) · Probe: Graph an main nur ausgeben; kein Kreis → tot
13. [F · L · 0,6] Wache und Kind bekommen ihre Rollen im Wirt — siedlung-ort.js:2043 `_genesisOrt` meldet nie `_bewohnerMelden`; plan.wache ohne Leser in stamm/
   erwartet: Wache-Leiber ≤ 25 m um 0 h/12 h: 0 → ≥ 1; Schaukel-Amplitude ≥ 0,3 rad über koerper-core leibPlan/leibVerbTakt · Probe: headless Genesis, Uhr 0/12 h zählen
14. [F · L · 0,5] Prüfstrecke ins Welt-Erbgut am k8-Strahl — fachwerk-core.js:9606 `{k:8}` leer; strecke.json lesen nur garage.js:495 + diag-garage-labor:112
   erwartet: pruefFahrt Standard-Welt Runde 55–65 s, Flug 18–22 m, Kontakt ≥ 0,95 (heute kein Wert) · Probe: headless erbgutNormal mit bahn auf k8; Böschung > 20 m oder Überlappung k7/k9 → tot

## 2 Je Eintrag der EINE nächste Schnitt
- A: Nr. 9 macht das ROT wahr, danach Nr. 10 an lod.K5 Weide. Uhr × Sicht: Kronen-Wurf aus dem CSM-Bild statt CPU-Ellipse (dirigent-ankunft.js:1773, stoff-karte.js:645), Sprung 0,55 → < 0,15 EV, 0,35.
- B: Nr. 4 messen (S), je nach Ausgang Nr. 5. Nr. 6 trägt den größten Kalt-Gewinn (−6,3 s), auch dann bleibt B > 5 s.
- C: Nr. 12. Bewohner-Takt am Bild-Delta (dirigent-takt.js:1597) erst, wenn VK-V bei 33,3 gegen 16,7 ms trennt.
- E: Nr. 11. Für den CPU-Riss Genesis Third 6,3 > 5,8 ms hat der Schwarm keinen Hebel.
- F: Nr. 13, danach Nr. 14 (beide L, beide headless messbar).

## 3 Prozess: Zug · Messung · Buchung · Agenten
- Buchung: Nr. 1 sofort, danach Nr. 3 als eigene Hintergrund-Schleife (ein Farm-Lauf von ~60 min blockiert sonst die Buchung).
- Zug: Nr. 2. Wackler-Urteil per Gegenlauf desselben Jobs an main (zug-weiter3.sh:41) kostet 3,6–17 min statt 3 h 11 (z388); 1 Fall in 22 Zügen, 0,4.
- Speicher messen: measureUserAgentSpecificMemory in diag-boot-stage (COOP/COEP stehen, save-server.js:900) zerlegt die 2,5 GB je Faden; 0 Leser heute, 0,6.
- Speicher-Schnitte erst nach der Zerlegung: Voxel bodenHalten (voxel-worker.js:521, 6 Felder voll, gelesen nur seiteV&15, −40 % Spiegel-Bytes)
  und sollTon/wandTon einmal je Gestalt (fachwerk-core.js:2336, Werk L2 66→~45 ms, L3 40→~24 ms, Byte-Beweis per sha).
- Agenten: Kontext-Deckel als PreToolUse-Hook nur für Subagenten (agent_id). Erst token-deckel.cjs auf die letzte Welle: < 20 % Ersparnis → tot.

## 4 Aus fremden Feldern übertragbar
- Dawn/Chrome-Pipeline-Blob-Cache über Neustarts: trifft nur deterministische Bytes → Nr. 4; koordination auftrag/riesen-schultern-1610.md:47,121.
- Ausgelieferte Caches wie Konsolen-PSO-Caches und vorgebackene Packs → Nr. 6 (IDB-Saat je Inhalts-Stempel, Kern-SHA-Hülle steht).
- PSO-Vorwärmen an Stellvertretern (Unreal PSO precaching) → Nr. 5 (_vorbauGast mit echtem Layout).
- Warte-Graph/Deadlock-Erkennung (Betriebssysteme, Datenbank-Locks: kleinster Halter gibt ab) → Nr. 12.
- Stochastische Ansichtswahl statt Mischung (Oktaeder-Impostor, stochastische Transparenz) → Nr. 10; die Resolve-Deckung A3b glättet.
- Merge-Queue-Praxis: ROT sofort, Neulauf nur bei Infrastruktur-Abbruch → Nr. 2; Wackler am Basis-Kopf gegenmessen → §3.
- Browser-Speicher-API measureUserAgentSpecificMemory (cross-origin-isolated) → §3, ersetzt die Schätzung am Gipfel-Blick.

## 5 Geprüft und gefallen (nicht neu suchen)
- B: Aerial-LUT · Haupt-Faden-Takt (7 Eingriffe, kalt bleibt 22,0–22,4 s) · 4 Foundry-Fäden (schlechter) · DXC statt FXC · featureLevel compatibility · ?v= macht nicht kalt.
- B packen: IDB-Kompression/OPFS/Pack-File/Merkle (IO kein Engpass: 107/109 Lieferungen von der Platte, trotzdem 12 s) · geteilter Dawn-Cache im CI (verfälscht B).
- Speicher: bakeLOD vorgezählt · BODEN_OHNE_RING 12 · Foundry-Transfer (schon zero-copy) · Host-Cache (hat Deckel) · weniger Werk-Fäden · SAB · onUpload (r184 0×) · WASM/OPFS.
- E: Tiefen-Vorpass (Pflaster) · Bau-Frist (alte Belege) · Schatten-Bündel je Kaskade · Stadt-Dreiecke (CPU trägt) · Luftschatten (geschnitten f20a5241) · VRAM hält.
- A: Relief aus (Strauch wurde besser) · Strauch-Sohle (S7 löscht schon) · Saum-Schlüssel · Hebungs-Ring/ringTeiler (Tafel 0,2632 älter als die Ringe) · Nanite-Fernstufe · Oktaeder-Atlas (VRAM ×5).
- C: IDM/ORCA/Lockstep (kein gemessener Bruch) · Verkehr als E-Täter (1,24 von ~17 ms) · Fahrzeug-Zwilling (nein, ein _wagenSchritt).
- Punkte: Radeon --offen umordnen · Staffel-2-Wand haar.K5#2 · licht.K2#2 (inhaltlich ROT) · klang.K5#2 (echtes ROT) · AppHelperCap (schon in FREMD_GERAET).
- Zug: Spekulative Vorstufe/Merge-Queue parallel (GPU-Beine belegt) · Echt-Beine umverteilen · Coverage-Auswahl · Voll-Batterie je Zweig (20 Plätze voll).
- Agenten: Orientierungs-Spritze im SessionStart · MEMORY.md kürzen (~1 %) · BEREIT nur mit Punkt-Beweis · R6-Knoten zerlegen (unter 20 %) · Cloud-Breiten-Hook.
- Spieler: KI automatisch an · Teilen-Pfad nicht gebrochen · CORS (kein Deploy) · spawn_studio-Hänger (ungemessen).

## 6 Blinde Flecken dieses Schwarms
- Nichts lief: kein GPU, kein node, keine Actions-API. Zahlen aus Registern, Logs, stand.json; Ankunft von der GTX 1050, für die 1060 hochgerechnet.
- Ungeklärt: warum eine Pipeline 1,2–3,1 s braucht, ob Puppeteer-Chrome den Dawn-Disk-Cache nutzt, ob die WGSL-Bytes zwischen Boots wechseln, wo die Namen entstehen (Nr. 4).
- Die 2,5 GB sind nicht zerlegt (JS-Halde gegen externe Puffer, GPU-Prozess 0,7–1,0 GB); E-Gang/CPU-Zahlen vom 03.11., Stadt-Zahlen vom 06.11.
- Kein Bild gesehen: laub-kante, Spawn und Uhr × Sicht ungelesen; die Radeon-Ankunft ungelesen.
- Ob Hooks in Workflow-Subagenten und Cloud-Sitzungen feuern, ist ungeprüft (Voraussetzung für den Kontext-Deckel).

## 7 Die ersten 60 Minuten des nächsten Kontos
- Wegwerf-Klon von koordination: `punkte.cjs buchen --kopf bc0a4aed`, dann `--kopf e38e7acf` → ≥ 219; trägt es, buche-dienst.sh:23 erst mit dem Kopf aus messung/<k8>-*.json, dann $K.
- zug.cjs:226-228 streichen (ROT außerhalb WACKEL_RE gilt sofort); den Neulauf nur bei cancelled behalten (:184-186).
- `zug.cjs punkte <main-Kopf> --geraet headless --nur <10 Hälften von d3708675>` im Hintergrund; danach `grep -c '"r6": "konsum"'` in stand.json (heute 85).
- GTX 1050: `diag-boot-stage --echt --profil <p>` zweimal, SHA-256 je createShaderModule (diag-weltbild-frost.cjs:63-67) + <p>/Default/DawnWebGPUCache → entscheidet Nr. 4 oder Nr. 5.
- dirigent-kern.js:523 + feld-nexus.js:830 auf qwen3:4b-instruct (Nr. 7), vorher die llama3.2-Probe; eine Zeile an den Schöpfer: Genesis in schöpfer (Nr. 8)?
- Radeon-Karte für A: `werkbank bild --ist laub-kante` an main; die Zahl je Art geht mit dem nächsten laub-kante-Schnitt in Soll-Tafel und A-Zeile (Nr. 9).
