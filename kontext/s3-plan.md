# S3-PLAN — Studio-Welle S3 „Kosten ins Asset“

Stand: Lese-Worktree `.claude/worktrees/vigorous-nash-s3-lesen` = **78d66a63 (V18.534)**. Quellen: fünf Späher (pflanzen ·
haus · kreatur · tor-fahrzeug-klinge · wiese-gestalten-vram), ihre node-Läufe am Kern (Skripte
`C:\Users\micha\AppData\Local\Temp\claude\s3-plan\`), die Band-Läufe der Kette V18.533/534 (`integ2/kette-v18533*`), die
S1-Ratsche Genesis (`spec/profiband/ratsche-genesis.json`, b3f09a5f), `studios/synthese.md` §3–§5. Bau-Skript:
`artifacts/profiband/workflows/studio-s3-kosten.js` (Start nach V18.535 mit `args.basis` = voller SHA).

Legende: **[M]** gemessen (Radeon/OMEN, zitiert) · **[K]** am Kern gezählt (node, Späher) · **[V]** gerechnet/geschätzt.

Lehre 19 ist das Gesetz dieser Welle: ein LOD, das nicht reduziert, heilt am Studio, nie über Host-Umwege. Die Welle
trägt Pflicht-OFFEN **E** (das Profi-Band auf jedem Standardgerät).

---

## 0 Kurzbild — Ist → Soll

**Chokepoint und was stirbt.** Der Studio-AUSGANG: die B2c-Budget-Zeile ist der Bau-Regler jeder Art, und der Host liest
sie über je EINEN Leser. Es sterben: Laub-Lagen ohne Bild (40,8 Quad-Lagen je Kronen-Pixel), die L1 als ausgedünnte L0,
der Nadel-Ast als Röhre, der drawRange-Wurf-Vorsatz, der Selbstwurf der Haus-/Ausstattungs-Stufen, der aufgeblähte,
quer gedeckte Haus-Fernkörper, die Wirts-Fits `_archFachwerkFit` (503 Z.), `_archBoxFit`, `_gestaltKapselFit`/`_streuGesetzFit`
(Fels, Blume) und `_gliedKapselFit` (Glieder-Kapseln), die Fernform `"gesetz"` an allen neun Trägern, KIND_POLICY.impostor,
„L1/L2 gradet der Wirt“, das Kreatur-Standbild an der Wurzel samt zwei castShadow-Literalen und drei Distanz-Konstanten,
die feste Tor-/Klingen-Abtastung, die gleich feine Rispe, die Gestalten-Lüge 16 und die leserlose Seh-Klasse `laub`.

Die Ist-Zahlen sind V18.534 (`integ2/kette-v18533/s6-kopf/band-yaw0.txt`). Richter jeder Familie ist ihr EIGENER
Vorher-Lauf auf ihrer Basis (V18.535 trägt Welle L: wasser änderte Bach und Boden, auge-v1 `_genesisPortalRing` /
`_ensureGenesisPlatform`) — gleiche Folge, gleicher Ort, eingefrorene Welt.

| Posten (V18.534, Mess-Wiese yaw 0 gestellt, Radeon) | Ist [M] | Soll S3 | Messweg (Linse · Ort) | Linse vorher ROT (Täter) | Familie |
|---|---|---|---|---|---|
| baum Befehle / Dreiecke | 52 (haupt/k0/k1 30/18/4) / 416 988 (Haupt L0 131 218 · L1 141 664 · k0 125 490 · k1 18 616) | ≤ 40 / ≤ 150 000 (Projektion 147 500) | `werkbank band --ort wiese` (Klasse baum je Pass) · `gate:profiband` Block P (Projektion, GPU-frei, `zensus-wiese.json`) · Kronen-Linse (L/Q/D0) in `gate:asset-contract` | Band: baum 52/40 · 417k/150k über Haushalt, Täter `fscatter:fichte:L1 12 · f:tanne:L1 8 · f:fichte:L1 8 · f:eiche:L1 8`; P ≈ 417k; (L) Eiche-L0 40,8 > 16 Lagen; (Q) Karst 0,60–0,71 > 0,35 | pflanzen |
| Baum GPU | 3,5–6,4 ms (OMEN, Zerlegung B) | ≤ 2,0 ms, Frame nicht langsamer | OMEN `scripts/omen-messfolge.cjs`, ABABABAB, 4 Boots je Seite, `zerlegen --nur baum`, Ort wiese | Zerlegung B baum 3,5–6,4 ms; Ursache (L): 65 % der Laub-Fragmente verworfen | pflanzen (Zeit: OMEN) |
| nahWiese haupt | 80 094–84 336 / 4 (Ratsche 57 066) | ≤ 57 066 (Erwartung ≈ 49k), jeder der 8 Blicke ≤ 80 000 | `band --ort wiese` (Ratsche) + 8 Blicke · Kosten-Wand `gate:asset-contract` | Ratsche „nahWiese haupt 84 336 > 57 066 (Täter: nahWiese)“ → nach Linse 1 je Stufe; „gras-s2-L1 1560 > 1000“ | wiese-gestalten |
| bau k0 / k1 | 12 760–15 400 / 10 120–11 000 (Ratsche 4 224 / 4 080) — 100 % Feuerstelle L1, jeder Wert ein Vielfaches von 440 | ≤ 1 700 / ≤ 1 700 | `band --ort wiese` (Ratsche, Satz-Inhalt 1b) · Messort `dorf` (`ratsche-dorf.json`, Haus-Wurf ≤ 96 je Haus) | Ratsche „bau k0 14 960 > 4 224 · k1 11 000 > 4 080 (Täter: bauSatz)“ → nach 1b „bauSatz k0: f:feuerstelle:L1 29 Zellen = 12 760“ | haus |
| Häuser 26–64 m ohne Sprung (W3) | Umriss L1↔L2 Median 0,829 (min 0,566), First quer 30/62, Aufblähung Median +1,8 m, Wurf-IoU 0,785 | Umriss ≥ 0,92 je Achse, First quer 0/62, Aufblähung ≤ 0,05 m, Wurf-IoU ≥ 0,92 (Median ≥ 0,95); Bild 25 ↔ 27 m gleich | `gate:haus-fern` (node, Kern) · Bild-Paare Ausgabe-Pfad am Messort `dorf` | `gate:haus-fern` mit Kultur-Namen (pueblo 0,566 · holzhuette 0,629 …) | haus |
| tier Werfer je Gestalt und Kaskade | Tier 27 880–31 760 / 7 · Mensch 162 412 / 8; 35–64 m: 0 | Tier ≤ 6 200 / 1 · Mensch ≤ 38 000 / 5; 35–64 m wirft | `gate:kreatur-kosten` Block (W) (headless, Produktions-Boot) · `werkbank zaehlen` tier je Pass, Ort wiese, Wolf gesetzt | (W) „tier:wolf nah wirft 28 710/7, mittel 0 trotz schatten 1“ | kreatur |
| Tor-Hülle je Tor (Genesis) | 58 976–181 024, 1 von 7 im Soll 60 000 | 7 von 7 ≤ 52 000 | `band --ort genesis` (≥ 4 Läufe, Exemplare je Leaf-Gestalt gezählt, §3.4 Schnitt 9) · Kosten-Wand `gate:asset-contract` gate[0] | 6 von 7 Tore beim Namen (maurentor 181 024 …); Wand mit gesenkter Zeile „maurentor-L0 181 024 > 52 000“ | tor-fahrzeug-klinge |
| Klinge L0 · Fahrzeug L1 | 16 048–21 640 · fehlt (kindStages [0]) | ≤ 8 000 · ≤ 7 000 / ≤ 12 | Kosten-Wand `gate:asset-contract` je Rezept · v5/v3-Contract · Karten-Linse `gate:studio-vertrag` | Wand mit gesenkter Zeile „weapon-L0 bis 21 640 > 8 000“; Karten-Linse (gate, vehicle); Konsum-Wand „vehicle L1 nicht gebaut“ | tor-fahrzeug-klinge |
| Fernform im Wirt gerechnet | 9 Träger `"gesetz"` (haus, ausstattung, gate, vehicle, weapon, flower, rock, kreatur, koerper) · 4 Fits | 0 · 0 (jede Art `"huelle"` aus ihrem Kern) | Absenz `gate:altlasten` · Validator `gate:studio-vertrag` | Absenz-Liste an der Basis: 9 Träger + `_archFachwerkFit`, `_archBoxFit`, `_gestaltKapselFit`, `_gliedKapselFit` | haus (2) · tor-fahrzeug-klinge (7) |
| Gestalten-Lügen | 38 Rezepte | 0 | Gestalten-Wand in `gate:asset-contract` (Same 1 ≠ 2) | 38 Täter „Gestalten-Lüge: <kern>-Rezept <id>“ | wiese-gestalten |
| busch · karten · formationen (W3-Soll, gehalten) | 6 / 18 360 · 1 / 1 108 · 3 / 10 240 | ≤ 8 / ≤ 40 000 · ≤ 2 Befehle · ≤ 20 Befehle — keine Klasse steigt | `band --ort wiese`, Gegenprobe jeder Familie | grün; karten-Dreiecke 1 108 über dem Haushalt 1 000 (§8) | alle (Gegenprobe) |
| Dreiecke gesamt | 897k | ≈ 550–570k [V] ≤ 680k | `band --ort wiese` SUMME | Band 897k/680k (1,32×) | alle — Bilanz |
| VRAM | 145,7 MB | ≈ 141 MB [V] — Band 118 MB mit S3 NICHT erreichbar (Host 125,0 MB) | `band --ort wiese` VRAM je Erzeuger (nach GC) | Band 145,7/118 (1,23×) | Asset-Anteil pflanzen · wiese · kreatur; Host benannt §8 |

---

## 1 Bilanz gegen das Band (208 DRW · 680k TRI · 118 MB)

### 1.1 Dreiecke je Klasse, Mess-Wiese yaw 0

| Klasse | Ist [M] | Haushalt | nach S3 | Träger |
|---|---|---|---|---|
| boden | 199k | 200k | 199k | Host, kein S3 |
| streu | 29k | 40k | 29k | grün |
| karten | 1 108 (1 Befehl) | 1 000 | 1 108 | Befehle grün; Dreiecke +108 über dem Haushalt = 554 Karten-Bäume im Bild, Weltzustand, kein Asset-Posten (§8). Die Karte bäckt aus der L1 — Bild ändert sich, Zahl nicht |
| baum | 417k | 150k | ≤ 147,5k (8 × 7 000 + 25 × 2 300 + 30 × 1 000 + 4 × 1 000) | pflanzen |
| busch | 18k | 40k | 18k | grün |
| nahWiese | 84k | 80k (Ratsche 57k) | ≈ 49k (≤ 57,1k) | wiese-gestalten |
| tier (frei) | 81k | 60k | ≈ 60k [V] (Werfer je Tier −80 %; Weltzustand) | kreatur |
| bau | 46k | 60k | ≈ 24k (Haupt 18,4k + k0/k1 je ≤ 1,7k) | haus |
| formationen | 10k | 30k | 10k | grün |
| einzelstuecke | 12k | 15k | 12k | grün |
| **Summe** | **897k** | **680k** | **≈ 550k** (mit tier 81k: ≈ 570k) | |

Anteil am Schnitt (−327 bis −347k): pflanzen −269,5k (≈ 78 %) · wiese-gestalten −35k (≈ 10 %) · haus −22k (≈ 6 %) ·
kreatur −21k [V] (≈ 6 %, Weltzustand) · tor-fahrzeug-klinge 0 an der Wiese (Genesis siehe 1.3).

### 1.2 Befehle und VRAM, Mess-Wiese

- **Befehle:** 105 gegen 208 — schon grün. S3: baum 52 → ≤ 40, tier je Werfer 7 → 1, bau k0/k1 bleiben 1/1 (Täter
  `bauWurf`) → ≈ 90 [V].
- **VRAM 145,7 MB** = Host 125,0 (Post 71,1 · Kaskaden 24,0 · Boden-/Wasser-Satz, Fern-Ring, Himmel, DSL-Insel 20,8 ·
  Host-Karten 9,1) + Asset 20,7 (Atlas 4,7 · Baum-L0 4,50 · Baum-L1 2,37 · bauSatz 3,12 · streuSatz 2,45 · tier 2,22 ·
  Strauch 0,42 · Formationen 0,41 · nahWiese 0,31 · fimp 0,18) [M].
  S3 trägt: Baum-Puffer ≈ 9 → ≤ 5 MB (pflanzen), nahWiese 0,31 → ≈ 0,2 (wiese), tier +0,3 (L1-Gewichte, kreatur) →
  ≈ 141 MB [V]. Die Ratschen-Zeilen `tex:karte-albedo/normal` 14,7/14,7 MB sind veraltet (gemessen 2,7/1,3) — der
  Integrator senkt sie mit der S3-Serie.

### 1.3 Genesis-Ring (S1-Ratsche, 5 Läufe)

240 Befehle / 2 444 339 Dreiecke / 179,8 MB [M]; bau haupt/k0/k1 86/57/17 Befehle, 1 095 115 / 566 532 / 41 480.
S3: Tor-L0 Σ 7 Tore 933 448 → ≈ 202 000 [K], Vertices 588 034 → ≈ 174 000; Tor-L0 wirft nicht mehr selbst (k0 566k →
≤ ≈ 150k [V]); Gestalten: f:drachentor:L0 43 → ≈ 24 Befehle, Puffer 8,67 → ≈ 4,3 MB. Erwartung gesamt ≈ 1,2 M [V] —
der Genesis-Ring bleibt über dem Band; seine Zerlegung nach S3 misst die Bilanz-Stufe (`band --ort genesis`).

### 1.4 GPU (Zeit misst NUR der OMEN)

Baum 3,5–6,4 ms bei 52 Befehlen (Laub-Lagen: 65 % der Karten-Fragmente verworfen, Atlas-Kern-Füllung 0,347) → ≤ 2,0 ms;
Frame nicht langsamer. Folge: `scripts/omen-messfolge.cjs` (Welle K), ABABABAB, 4 Boots je Seite, `zerlegen --nur
baum,schatten,tier,bau`, gpu-bank yaw 0/−0,88, `profil 12 --regler voll`.

---

## 2 Gemeinsame Entscheide (wo Späher auseinanderliefen)

- **E1 EIN Wurf-Gesetz.** B2c `schatten` zeigt auf die werfende Stufe; `wurf` an DIESER Stufe wählt den Teil — Baum:
  eigenes Mesh `teil: "schatten"` (Gerüst als 3-Kant + Karten auf Lagen ≤ 6, Attribut `aDeckt`), Kreatur: `wurf.seh`
  (Seh-Klassen der gelenkigen L1), Haus/Ausstattung: die ganze nurWurf-Stufe 3. Der Host zeichnet jeden Wurf-Teil auf
  SHADOW_TWIN_LAYER. Die STATISCHEN Wurf-Teile (Baum-Teil, Haus-/Ausstattungs-Stufe 3) zeichnen mit EINEM Schatten-Stoff
  (colorNode.a = max(aDeckt, Atlas-Alpha), Lehre 26; Haus-Stufe 3 trägt aDeckt 1); der Zwilling der Gelenk-Gestalt IST
  die gelenkige L1 und wirft mit ihren Stoffen (das Skinning lebt im Programm) — kein zweites Gesetz, kein neues
  Schatten-Programm über die L1-Programme hinaus (`werkbank zaehlen`, Programme der Klasse tier vorher ≥ nachher). Der
  drawRange-Vorsatz (`__wurf`, `lf.wurf`, Index-Vorsatz in `_foundrySchattenGeom`) fällt ganz. pflanzen legt das
  Gesetz (S4), haus liest es, kreatur liest es über `wurf.seh` (parallel; Validator-Merge beim Integrator).
- **E2 EINE Hüllen-Form, `fernform: "huelle"`, `"gesetz"` fällt ganz.** Form (B2/N5, normativ, haus legt sie):
  `{stufe, teile: [{art: "box"|"keil"|"kapsel", c, h | a, b, r, first: "x"|"z" (keil), farbe (linear), rolle:
  "fest"|"sicht"|"beide"}]}`, asset-lokal, gerastert 2^-12. EINE Quelle je Gesetzbuch: die reine Kern-Funktion
  `huelle(rezeptId, seed, ov)` (fachwerk: der grundriss-treue `lod2Koerper`; porta: deriveGate/deriveFrame; vehicle:
  exportDrive; schmiede: Blatt-Kette + Gehilz; foundry-core: Fels, Blume). EIN Transport für die Fernform: Beipack
  `__fern` über die EINE Beipack-Karte in `_foundryBuildGroup` (Worker, Lehre 14/24). EIN Host-Leser `_huelleVon` →
  `_archFoundryZiegel` (fail-closed, KERN-PFLICHT, kein Box-Fit-Rückfall). Die Kollision liest `rolle fest` derselben
  Liste: Haus über den Welle-L-Beipack `__huelle` (migriert in die EINE Form, kein zweiter Parser), Tor und Fahrzeug
  über den synchronen Kern-Ruf (billig, nie auf den Worker wartend). haus legt Form/Leser/Transport, tor-fahrzeug-klinge
  führt die Klasse zu Ende. Die Klasse hat an 78d66a63 NEUN Träger mit `fernform: "gesetz"` (fachwerk haus + ausstattung ·
  porta gate · vehicle · schmiede weapon · foundry-core flower + rock · tetrapoda-core kreatur :46 · koerper-core koerper
  :44) und VIER Wirts-Fits: `_archFachwerkFit` (haus), `_archBoxFit`, `_gestaltKapselFit` über `_streuGesetzFit`
  (Fels/Blume im Streu-Gesetz-Block) und `_gliedKapselFit` (die Glieder-Kapseln; seit Welle L kampf-maus EINE Passung
  `_gliedKapselMemo` für Fern-Bild UND Treffer-Volumen). haus räumt 2 Träger + `_archFachwerkFit`, tor-fahrzeug-klinge
  die übrigen 7 + drei Fits (Schnitt F: der Ofen exportiert `huelle()` der Gelenk-Gestalt, je Anker eine Kapsel mit
  dem additiven N5-Feld `glied`). Alle fallen in dieser Welle physisch; der Wert `"gesetz"` fällt aus dem Validator erst,
  wenn kein Träger ihn mehr trägt (tor-Kopf).
- **E3 Gras gehört wiese-gestalten.** Zwei Späher planten denselben Schnitt; gewählt ist der mit STROM-ERHALT (Individuum
  und Halme byte-gleich, nur die Rispe fällt) an den echten Nah-Wiesen-Vorlagen Same 1/2 (nicht Same 7): grass[1]
  1 700 → 1 000, grass[2] 320 → 130, Halm bleibt 5 Segmente. pflanzen fasst emitGrass nicht an.
- **E4 Gestalten ehrlich in EINEM Commit** über alle fünf seed-invarianten Kerne (wiese-gestalten), mit der
  Gestalten-Wand im selben Commit; fachwerk bleibt 16 (echte Achse, 35/35 verschieden).
- **E5 Goldens:** je Golden-Satz EIN Akt je Familie, nur über die Mint-Skripte (`MINT_FORCE=1 node
  scripts/mint-asset-goldens.cjs`, Chromium-Worker), `git diff` zeigt nur die deklarierten Fälle. Die einzeiligen
  `spec/asset-contract/v1/golden/render-config.json` und `manifest.json` prägt jede Familie auf ihrem Zweig (CI grün)
  und der Integrator nach dem letzten S3-Merge EINMAL auf dem integrierten Kopf; nie von Hand mergen.
- **E6 Ratsche:** `spec/profiband/ratsche.json` (bestehende Orte) senkt der Integrator aus EINER Serie (≥ 4 Läufe, Erst-
  und Zweit-Boot, Ort gestellt, LINSE sauber) auf dem integrierten Kopf; heben nie; der Haushalt bleibt. Neue Messorte
  (haus: `dorf`) legt die Familie an — Messort und Soll-Zeilen in `haushalt.json` (die rote Linse), `ratsche-dorf.json`
  mit `null`-Feldern („noch nicht gemessen“) + Schema in `gate:profiband` —, die Werte setzt dieselbe EINE Serie: eine
  Serie wartet das Einschwingen ab (Zeitfrist, Lehre 19) und darf nie neben dem parallelen kreatur-Fenster laufen
  (Risiko 10). Die Familie zählt am neuen Ort vorher/nachher (je ≥ 2 Läufe, Erst- und Zweit-Boot). Die Serie nennt je Lauf
  `buf:szene:spieler` (0 oder 6,0 MB — ungeklärt seit der Kette V18.533, `integ2/kette-v18533.md` s4) und die
  karten-Dreiecke gegen den Haushalt 1 000; eine VRAM-Zeile sinkt nur aus Läufen mit gleichem Spieler-Zustand.
- **E7 Karten-Frage aus EINER Quelle:** `_foundryFernForm(preset) === "karte"` (tor-fahrzeug-klinge Schnitt A);
  KIND_POLICY.impostor fällt. Die Haus-Karte des Synthese-Plans ist FINAL GESTRICHEN (haus): das Befehle-Ziel (karten
  37 → ≤ 2) trägt seit W6 der Bau-Satz (heute 1 Befehl), eine Karte zeigt bei 26–64 m Parallaxe.
- **E8 Spike = die ersten Schnitt-Commits im Familien-Worktree** (kein Wegwerf-Zwilling); ein Golden fällt erst nach dem
  Spike-Urteil (Lehre 18). Hält ein Soll im Spike nicht, steigt die Zeile offen mit Wert und Grund; der Haushalt fällt nie.

---

## 3 Die Familien

### 3.1 wiese-gestalten (W3 (f) + nahWiese) — Ports 7800–7809, Kette Glied 1

- **Wurzel:** (1) die Gras-Stufe ist an ihrer Gestalt abgelesen, nicht vom Band abgeleitet — die Rispe ist in jeder Stufe
  gleich fein (`Naw` L1 7, `AK` 3: 42 Dreiecke je Rispe, 49/54 % der L1 [K]), die Zeile 1 700/320 ist eine gemessene
  Hülle. (2) Gestalten-Lüge: `GESTALTEN_JE_REZEPT = 16` in porta/schmiede/vehicle/koerper/tetrapoda, der Bau ist
  seed-invariant (Same 1 ≡ 2 byte-gleich [K]) → byte-gleiche Körper als Zwillings-Leaves (Genesis: zwei Drachentore = zwei
  Leaves, 43 Befehle, 8,67 MB).
- **Engstelle:** `lod.budget.grass` + `emitGrass`; `lod.budget.gestalten` je Zweit-Kern; Host-Leser `_foundryGestalten`,
  `_foundryLibrarySpec` (critical.seeds [1, 7] → 1..V).
- **Schnitte:** Linse (Senke `nahWiese:L<stufe>:…`, Regel `^nahWiese(:L[12])?$`) · Gras (Budget 1 000/130, Rispe gestuft
  Naw L1 7 → 3 / L2 4 → 1, AK L1 3 → 2 / L2 3 → 1, Strom-Erhalt) · Gestalten 16 → 1 + Wand · Vorrat-Leser · Vertrag B2c.
- **Soll-Bild:** Sommerwiese (Glatthafer/Knaulgras): Armlänge Halme + ~30 % Rispen als 3–7 Ährchen-Striche, 3–5 m
  Federbusch, 5–14 m Saum. Budget L1 ≤ 1 000 (Kern 768/960, Hülle 744–960), L2 ≤ 130 (96/118). Halm-Kontrast ≥ 10 (Wiesen-Linse, Armlänge, Ausgabe-Pfad; Bezug 10,99 V18.508), Ährchen-Anteil
  im 3-m-Ausschnitt ±15 %, kein Sprung im Ausschnitt 4,5–5,5 m.
- **Linse:** `band --ort wiese` ROT (Täter nur „nahWiese“ → je Stufe); Gestalten-Wand ROT mit 38 Tätern; Kosten-Wand
  „gras-s2-L1 1560 > 1000“.
- **Byte-Akte:** v1 additiv gras-s1/s2-L1/L2-summer + manifest; render-config (Zweig); v3–v7 + ofen byte-gleich OHNE
  Re-Mint = Beweis.
- **Konflikte:** foundry-core Budget-Block neben den Baum-Zeilen (pflanzen folgt in der Kette); Gestalten-Zeilen neben
  den Budget-Zeilen von tor (porta :63, vehicle :46, schmiede :63) und kreatur (tetrapoda :48–55, koerper :41–45) —
  nicht benachbart, Text-Merge trägt; `_foundryLibrarySpec` (tor ändert `critical.lods` danach); `_nahWieseSenken` neben
  `_tickNahWiese` (Welle K streaming).

### 3.2 pflanzen (W3 (a) Pflanzen + Fels) — Ports 7810–7819, Kette Glied 2

- **Wurzel:** die Budget-Zeile ist nur gegen sättigende BINÄRE Bild-Deckung geeicht → jede Stufe trägt Geometrie ohne
  Bild: Laub-Lagen (Eiche-L0 1 280 Karten, Kante 0,22 H → 40,8 Quad-Lagen; Buche 35,0, Karst 42,1, Birke 24,2;
  L1 15,6–28,0) · Stufe dünnt Blätter statt Zweige (jedes Reisig bleibt: 2,6–5,9k) · L1 = ausgedünnte L0 (73–83 % Rinde,
  Quote L1/L0 0,46–0,71) · Nadel-Ast als Röhre (Koniferen-L0 78–80 % Rinde) · Wurf in zwei Sippen (+ Birken-Wurzel als
  dritte) [K].
- **Engstelle:** `PORTAL_RENDER_CONFIG.lod.budget.tree[stufe]` und ihr EINER Leser `emitTreeRezept` (Kronen-Wahl,
  Träger, Strang-Schleife, Wurf-Teil); phyto-core `buildTubeGesetz`/`birkenGitter`; Host nur `_foundrySchattenGeom` /
  `_foundryFlattenFor`.
- **Schnitte:** S1 Zweig-Wahl Laubbäume (Lauf-Stride statt Blatt-Stride, `zweige`, `lagen`) · S2 Nadel-Ast als Wedel
  (Atlas-Zelle 3 → Wedel-Zelle, `pushStraehne`) · S3 L1 = Gerüst (Röhre ab 0,25·trunkR) + Karten, Birken-Gitter aus dem
  Pixel · S4 Schatten-Teil als EIN Mesh (E1) · S5 tree[0] 18 000 → 9 000 · S7 FINAL STREICHEN mit Zahl: Fels-L1
  (formationen 3/20 Befehle, 10 240/30 000; Fels-L0 320–1 280 — eine L1 spart < 3k), `budgetErzwingen` für Pflanzen (die
  Zeile IST der Bau-Regler), Seh-Klasse `laub` (synthese §2.3/§3.1: ihr einziger Leser wäre das Ausgangs-Falten, das für
  Pflanzen fällt — Konsum 0; Absenz in `gate:studio-vertrag`). (S6 Gras → wiese-gestalten, E3.)
- **Soll-Bild:** die heutige Krone in Silhouette und Masse (aaa8, W6 `paar4-*`); Koniferen als Wedel-Etagen statt
  Radial-Stern. [R] SpeedTree: LOD0 6–10k, LOD1 1,5–3k, Karte.
  | Stufe | Dreiecke | Lagen | Weiteres |
  |---|---|---|---|
  | L0 (dp < 12) | Laub ≤ 7 500 · Nadel ≤ 6 500 · Birke ≤ 8 500 (Zeile 9 000) | ≤ 16 | 2 Sippen |
  | L1 (12–26) | ≤ 2 400 | ≤ 12 | Quote ≤ 0,35 |
  | Schatten-Teil | ≤ 1 200 (Mittel ≤ 1 000) | ≤ 6 | 1 Sippe |
  | Karte | 2 | — | unverändert, kein VRAM-Zuwachs |
  Spike-Kern: Eiche Zweig-Anteil 0,15 → 7 098 / Lagen 17,3 / Deckung 1,05; Karst 0,11 → 8 008 / 14,6 / 0,95; Buche 0,2 →
  5 452 / 20,7 / 0,94; Gerüst-L1 1 506–4 416 [K].
- **Linse (neu in der EINEN Kronen-Linse und ihren Gates):** (L) `bildLagen` gegen `lagen` (ROT: Eiche-L0 40,8 > 16) ·
  (Q) Quote ≤ 0,35 (ROT: Karst 0,60–0,71) · (D0) L0-Deckung nachher/vorher ∈ [0,92; 1,08] gegen
  `spec/asset-contract/v1/deckung-l0.json` (aus dem Ist gebaut) · (P) Projektion Σ Zensus × Golden-Dreiecke ≤ haushalt in
  `gate:profiband` (GPU-frei, `spec/profiband/zensus-wiese.json`; ROT ≈ 417k).
- **Byte-Akte:** EIN Re-Mint v1: 9 Arten × L0/L1 × 2 Samen × 2 Saisons = 72 Goldens + render-config + manifest; L2 (36),
  Strauch, Waldboden, Blume, Fels, Gras byte-gleich; Atlas-Steckbrief Wedel-Zelle (`fuellung`) gegen den Maler;
  CONTRACT.md `teil`/`aDeckt` statt `wurf` (stale :31, :52-70). Plattform: der node-vm traf 8/9 Golden-Meshes (Birke-L0-
  Rinde weicht ab) → die Linux-CI ist der Richter.
- **Konflikte:** Welle L `budgetSippe(n)`/`_budgetMal` (Rad-Sippe) und `__extractAssetMesh`/`__replyBuildAsset` (Naben-Rad)
  gegen S4 (`teil`/`aDeckt`); `_foundryFlattenFor` (3 Welle-L-Hunks) — alles auf der Basis V18.535 gelöst; neues Programm
  (Schatten-Stoff) unter der K-Diät (gate:kamera-treue).

### 3.3 haus (W3 (b) Fernform + L0-Schatten; Haus-Karte FINAL GESTRICHEN) — Ports 7820–7829, Kette Glied 3

- **Wurzel:** der fachwerk-Bau wirft mit der Stufe, die er zeichnet; seine Fernform lebt als Wirts-Zwilling. (a) B2c nennt
  keine Grobstufe als Werfer (L0 `schatten: 0`, L1 `1`, B2 lehnt Stufe > 2 ab) · (b) `_bauSatzArt` kann keinen Zwilling
  im Satz zeichnen · (c) `lod2Koerper` liest die Massen-Hülle `B.ext` statt des Grundrisses und legt den First auf die
  lange Achse (32/32 Ein-Quader-Modus, Aufblähung Median +1,8 m / max +10,0 m, First quer 30/62) · (d) `_archFachwerkFit`
  (503 Z.) rechnet die Fernform im Wirt.
- **Befund an der Wiese:** die rote bau-Ratsche ist die FEUERSTELLE (Dorf-Zug aus): Haupt 18 445 = 31 × 595, k0 12 760 =
  29 × 440, k1 10 560 = 24 × 440; 7/7 k0/k1-Werte der Kette sind Vielfache von 440, ebenso V18.534 k0 14 960 = 34 × 440,
  k1 11 000 = 25 × 440 [M+K].
- **Engstelle:** `lod2Koerper` wird die deklarierte Stufe 3 (`nurWurf`) jeder fachwerk-Art; `schatten` aller Stufen zeigt
  auf sie; ihre Liste = `huelle()` (E2) reist als `__fern`; Host-Leser `_bauSatzArt` (Wurf-Satz `bauWurf`),
  `_foundryFlattenFor`, `_archFoundryZiegel` (über `_huelleVon`).
- **Schnitte:** Linse Kern `gate:haus-fern` (neu) · Satz-Inhalt in draw-zaehler/band-urteil · Messort `dorf` · Host-Leser
  (untätig, byte-gleich) · Kern-Akt fachwerk (grundriss-treuer Fernkörper, Stufe 3 Haus ≤ 96 / Ausstattung ≤ 48,
  Feuerstelle ≤ 32; `_archFachwerkFit` + Gate fallen) · Vertrag B2/B2c + Hüllen-Form · Haus-Karte FINAL GESTRICHEN.
- **Soll-Bild:** Traufschatten-Band 0,5–1 m auf der Sonnenfassade, Schlagschatten mit Überstand und Kamin; [R] UE
  Hidden-Shadow-Proxy / Unity „Shadows Only“ + HLOD-Fernkörper; 25 ↔ 27 m ohne Umriss-/Dachachsen-Sprung; 80 m First
  auf x. Budget: L0 132 000 / L1 44 000 / L2 7 000 byte-gleich (wirft nicht mehr selbst), Stufe 3 ≤ 96 / 1 Draw;
  Wurf-IoU zu L0 ≥ 0,92 (Median ≥ 0,95; heute 0,785), Umriss L1↔L2 ≥ 0,92 (heute 0,829, min 0,566), Aufblähung ≤ 0,05 m.
- **Linse:** `band --ort wiese` ROT (bau k0/k1 > Ratsche, Täter nur „bauSatz“ → neu „bauSatz k0: f:feuerstelle:L1 29
  Zellen = 12 760“); `gate:haus-fern` ROT mit Kultur-Namen; Messort `dorf` ROT (L0 wirft ~70k, L1 ~15k je Haus).
- **Byte-Akte:** v6 haeuser.json 64 L2-Fälle neu, 128 L0/L1 byte-gleich (Beweis), +64 Stufe 3; ausstattung.json +6,
  L0/L1 byte-gleich; siedlung.json byte-gleich; plattform-ratsche v6/v6a; render-config (Zweig).
- **Konflikte:** Welle L koerper-haus (`buildStufe`, `buildInstance`-Marker `var huelle = …` byte-gleich halten, Beipack
  `__huelle` → EINE Form); `_foundryFlattenFor`/`_foundrySchattenGeom` nach pflanzen-S4 (E1); K streaming
  (`_standMeldet` in `_tickArchitectureLOD`/`tickArchitectureCulling`: Häuser, die auf Stufe 3 warten, melden `offen`).

### 3.4 tor-fahrzeug-klinge (W3 (d) + (e) + Fernform-Klasse) — Ports 7830–7839, Kette Glied 4

- **Wurzel:** die Kosten wohnen außerhalb des Assets — drei Zweit-Kerne liefern genau EINE Stufe mit festen Literalen
  (Geflecht 240×6, Maßwerk-Tori 8×20, Blatt 72 Ringe für jede Länge, Wicklung je Windung ein Torus) und erklären L1/L2
  zur Sache des Wirts; der Wirt füllt die Lücke mit der Baum-Bahn (KIND_POLICY.impostor → Dither-Maske: Kathedrale auf
  9 m „milchig“, gt auf 19,3 m 0 von 6 236 Pixeln) und dem Fit `_archBoxFit`.
- **Engstelle:** die Stufen-Wahrheit B2c (kindStages + budget + fernform); Kern `buildInstance` reicht die Stufe an die
  Abtast-Helfer (`tubeMesh`/`torusMesh`, `loftBlade`/`buildGrip`, `ctx.tess`); Host `_foundryPresetIsTree`,
  `_archFoundryZiegel`.
- **Schnitte:** A Karten-Frage aus der fernform (E7) · B Tor-Abtast-Gesetz (Sehne 10 mm L0, 3,5 cm L1) · C Klinge
  (Profil-Gesetz Douglas-Peucker auf `sectionAt`, Ringe nach Länge, Helix-Wicklung als Klasse) · D Fahrzeug Tess-Tafel
  (L1 ÷5, Innereien `verdeckt`; L0 an das Band 20 000, Spike-entschieden) · E Hülle (E2) für gate/vehicle/weapon ·
  F die Fernform-Klasse zu Ende: flower/rock `huelle()` (`_streuGesetzFit` + `_gestaltKapselFit` fallen, der
  Streu-Gesetz-Block liest `_huelleVon`), kreatur/koerper `huelle()` aus dem Ofen (je Anker eine Kapsel, Feld `glied`;
  `_gliedKapselMemo` liest sie, `_gliedKapselFit` fällt; nur die fernform-Zeile der beiden Kerne), `"gesetz"` und
  `_archBoxFit` fallen ganz · Linsen-Fehler: die Tor-Hüllen-Zeile zählt „1 im Bild“ bei zwei Drachentoren.
- **Soll:** Tor L0 ≤ 52 000 (7/7; Σ 933 448 → ≈ 202 000), L1 ≤ 16 000, Deckung L1/L0 ∈ [0,9; 1,1]; Klinge L0 ≤ 8 000
  (Blatt 13 724 → 360–3 528 nach Länge), L1 ≤ 1 000, `measure()` aller 21 Gattungen byte-gleich; Fahrzeug L1 ≤ 7 000 /
  ≤ 12, Räder rollen (Naben-Baum; raeder-Probe von `gate:fahr-leben` am Wagen in 20 m auf Stufe 1, an der Basis ROT
  „raeder starr“); Hülle ≤ 24 Primitive je Tor, 6 je Wagen; Kollisions-AABBs vorher = nachher
  (max |Δ| = 0).
- **Linse:** `band --ort genesis` ROT (6/7 Tore mit Namen; Vorher auf der eigenen Basis, auge-v1 änderte den Ring);
  Karten-Linse in gate:studio-vertrag ROT (gate, vehicle); WAND ZUERST je Kern-Schnitt: die gesenkte Zeile macht
  gate:asset-contract ROT mit Täter je Rezept (gate[0] 52 000: maurentor-L0 181 024 …; weapon[0] 8 000: bis 21 640;
  vehicle[1]: „L1 nicht gebaut“) — die Zahlen stehen in der Message des Schnitt-Commits; gate:asset-contract L1-Zeilen +
  Deckung; v3/v4/v5-Gates mit L1, Messung, Hülle, Plattform-Probe (acos/atan2 an den Ceil-Grenzen); Hüllen-Pflicht +
  Absenz (`impostor:`, `_archBoxFit`, `_gestaltKapselFit`, `_streuGesetzFit`, `_gliedKapselFit`, `"gesetz"`,
  Blocker-Literale) — an der Basis ROT mit 9 Trägern + 3 Fits; Glieder-Kapseln je Wolf/Mensch vorher = nachher
  (gate:tier-fern, gate:kampf-gefuehl grün).
- **Byte-Akte:** v4 Re-Mint 16 L0 + 16 L1; v5 Re-Mint der Nicht-Bogen-Fälle (8 Bögen byte-gleich) + 42 L1 + „Messung“;
  v3 L0 nur bei Spike-Ja neu (sonst 12/12 byte-gleich) + L1 additiv; Hüllen-Fingerabdruck je Kern additiv; v1-Daten
  (render-config, Zweig).
- **Konflikte:** Welle L fahren (`hub.userData.rad`, `radDreht`, `exportDrive.huelle`, `_fahrzeugBlockerParts`), wasser
  (`huelleDichte`, `_torBlockerAABBs`, `_vehicleProfile`), kampf-maus (`trefferUrteil` liest `sectionAt` — bleibt
  byte-gleich; `_gliedKapselMemo`/`_kreaturTrefferGlieder` lesen die Glieder-Kapseln), auge-v1 (Stempel 3,
  `_genesisPortalRing`, diag-foundry-crossfade Teil 7 wandert mit) — alles auf der Basis; haus (Hüllen-Form,
  `_archFoundryZiegel`) davor in der Kette; kreatur PARALLEL: die fernform-Zeile in tetrapoda-core/koerper-core steht
  neben deren Budget-Zeilen (0.schatten, 1.ab, hyst, 1.wurf), der Ofen-Export `huelle()` liegt additiv neben
  `__tierHaut`/`__bakeGelenkBaum` — Integrator Schritt (2).

### 3.5 kreatur (W3 (c) Tier UND Mensch) — Ports 7840–7849, parallel zur Kette

- **Wurzel:** die Grobstufe der Gelenk-Gestalten ist ein Standbild (`fein = lod >= 1`: `__tierHaut` bindet nur `!fein`,
  `__bakeGelenkBaum` backt jedes Teil an die Wurzel), darum wirft die feine Stufe selbst (Tier 27 880–31 760 / 7, Mensch
  162 412 / 8 je Kaskade); der Wirt übergeht den Vertrag (`kreatur[1].schatten: 1`) mit `castShadow = false` (Tier
  :18059, Mensch :16725) → Tiere 35–64 m werfen gar nicht; die Distanzen sind Wirts-Literale, der Stufen-Schalter ist
  viermal geschrieben, zwei fail-soft-Zweige.
- **Engstelle:** der Gelenk-Guss des Ofens (`__tierHaut`, `__bakeGelenkBaum`) + B2c (`schatten`, neu `ab`, `hyst`,
  `wurf.seh`) + EIN Wirts-Leser (`_ofenBudget` → `_buildCreatureGroup`/`_buildHumanoidRig`) + EIN Stufen-Schalter
  `_gelenkStufe`.
- **Schnitte:** Linse (W) in gate:kreatur-kosten · Ofen: Grobstufe gelenkig, starre Haar-Teile verschmolzen (sonst 6 >
  5 Draws) · Kern-Zeilen + Vertrag · Wirt-Werfer + EIN Schalter · Distanzen in den Kern (3 Konstanten fallen) · CI-Wände
  (kreatur-kosten, tier-fern: heute in KEINER CI).
- **Soll:** Werfer Tier ≤ 6 200 / 1 (Kern 5 194–6 172), Mensch ≤ 38 000 / 5 (37 964); L1-Dreiecke unverändert; skinJoints
  0 → 27/29/23/24 (gate:ofen-contract, node-Guss); Spike Wolf (Ausgabe-Pfad, Ort wiese, Wolf gesetzt, Welt
  eingefroren): IoU der Schatten-Maske ≥ 0,9 (Differenz Tier an/aus), Luminanz-Δ Sonnenflanke ≤ 2 %, Wolf 45 m wirft;
  Hochrechnung W5 tier k0 255 488 / 50 → ≈ 52 000 / ≤ 10; Schatten-Programme der Klasse tier nachher ≤ vorher (E1).
- **Linse:** `gate:kreatur-kosten` Block (W) ROT an der Basis „tier:wolf nah wirft 28 710/7, mittel 0 trotz schatten 1“
  (Mensch 162 412/8); Absenz über `window.__codeOf`: castShadow-Literale 2, Leser der drei Distanz-Konstanten 8;
  Selbsttest S5 (Zwilling gestubbt → rot an genau dieser Zeile); heute in KEINER CI → 2 CI-Schritte (kreatur-kosten,
  tier-fern). Messweg der Werfer-Zahl: (W) headless + `werkbank zaehlen` tier je Pass am Ort wiese mit gesetztem Wolf.
- **Nicht hier:** die fernform-Zeile (`"gesetz"`) und die Glieder-Kapseln schneidet tor-fahrzeug-klinge (Schnitt F, E2);
  Dither-Blende und L0-Bänder §8.
- **Byte-Akte:** ofen bake.json nur `*-L1|*` (L0 297/297 byte-gleich, Lauf ohne Mint zuerst); render-config zusatzBudget
  tetrapoda/koerper (Zweig); v7 unberührt.
- **Konflikte:** auf der Basis V18.535 liegt Welle L kreatur (updateCreatures 20 Hunks, `_p2pTickRemoteCreatures` mit
  NEUEM Leser `TIER_FERN_DIST_SQ` — fällt im Distanz-Schnitt mit), L wasser (`_buildHumanoidRig` 2, updateCreatures 10,
  `_p2pUpdatePeer`), L koerper-haus (updateCreatures 9, Gang), L kampf-maus (`_kreaturGliederBacken` 3,
  `_kreaturGliederGruppen`, tetrapoda-core); K haenger (`_buildHumanGroup`, `_kaskadenZiele`, `_passSicht`,
  diag-schatten-werfer.cjs), K diaet-bundles (Schatten-Programme — Zwillings-Zahlen erst nach K); parallel zur Kette:
  Gestalten-Zeilen (wiese, nicht anfassen), fernform-Zeile + Ofen-Export `huelle()` (tor Schnitt F, nicht anfassen),
  B2c-Validator `wurf` (pflanzen `teil`, E1), docs/studio-vertrag.md B2c, render-config, diag-altlasten FORBIDDEN —
  Integrator.

---

## 4 Reihenfolge und Parallelität

**Vor S3 (UEBERGABE §3):** V18.534 → main · integ-l + wasser → integ-probe · Welle K → **V18.535** → main. Erst dann
`Workflow({scriptPath: ".../studio-s3-kosten.js", args: {basis: "<voller SHA von main nach V18.535>"}})`.

**Im Lauf (EIN Skript):**

| Gruppe | Familien | Lauf | Grund |
|---|---|---|---|
| Kette (seriell, jede auf dem geprüften Kopf der vorigen) | wiese-gestalten → pflanzen → haus → tor-fahrzeug-klinge | Champion → Gegenprüfung (a)–(g) → bei ROT eine Nachbesserung + zweite Prüfung | teilen Stamm-Methoden (`_foundryFlattenFor`, `_foundrySchattenGeom`, `_foundryBuildGroup`, `_foundryFernForm`, `_archFoundryZiegel`, `_foundryLibrarySpec`) und den foundry-core-Budget-Block |
| kreatur (parallel) | kreatur | dasselbe | eigene Stamm-Methoden (`_buildCreatureGroup`, `_buildHumanoidRig`, `_ofen*`, updateCreatures), eigener Ofen-Bereich |
| Bilanz | eine Stufe nach beiden | nur lesend | Integrations-Reihenfolge, Bilanz gegen §1, EIN OMEN-Auftrag |

Kettenregel: ist ein Glied nach der Nachbesserung nicht merge-reif, baut das nächste auf dem letzten merge-reifen Kopf
weiter (sein Zweig steht benannt für die Integration); stirbt ein Champion, gilt dasselbe. Stamm-Commits bleiben in
jeder Familie seriell (cut-method, `node --check`, eslint); Kerne außerhalb von format:check, nie `prettier --write`.

**Ports (10 je Familie, 7800–7859, Trocken-Lauf `C:\Users\micha\AppData\Local\Temp\claude\s3-plan\trocken-lauf.cjs`
grün):** save-server = Basis (`PORT=`), Seite = Basis + 1 (die headless werkbank lauscht auf `--port` − 1), werkbank =
Basis + 2 (echt mit `--seite http://localhost:<save>`, jeder Client-Befehl mit `--port`), Gates = Basis + 3 … + 9 —
wiese-gestalten 7800 · pflanzen 7810 · haus 7820 · tor-fahrzeug-klinge 7830 · kreatur 7840 · Bilanz 7850–7859. (Vorher
lagen save und werk benachbart: die Seite der werkbank traf in 5 von 5 Familien den eigenen save-server, und ohne
`--seite` zielte die echte werkbank auf 4312.)

**Nach dem Lauf (Integrator, seriell in integ-probe, je Kontrolleur):** (1) der Ketten-Kopf (linear: wiese → pflanzen →
haus → tor) · (2) kreatur (Validator `wurf`, B2c-Text, render-config; tetrapoda-core/koerper-core: fernform-Zeile von
tor neben den kreatur-Budget-Zeilen und der Gestalten-Zeile von wiese; Ofen: tor-Export `huelle()` neben kreatur
`__tierHaut`/`__bakeGelenkBaum`; diag-altlasten FORBIDDEN als Vereinigung) · (3) EIN Re-Mint render-config/manifest auf dem
integrierten Kopf (E5) · (4) EINE Ratschen-Serie wiese · genesis · dorf (E6) · (5) volle lokale CI (`ci-gen.cjs` +
`pruef-voll.sh`) + voller Playtest · (6) OMEN ABABABAB gegen main · (7) Version nach V18.535, CLAUDE.md-Stand (dabei
Lehre 19 nachziehen: „Konifere L0 ~170k Vertices“ ist stale — der Kern zeigt Tanne-L0 14 174–17 720 Dreiecke) · main.

---

## 5 Konflikt-Matrix

| Datei / Methode | Welle K (auf der Basis) | Welle L (auf der Basis) | S3-Familien | Regel |
|---|---|---|---|---|
| `_foundryFlattenFor` | streaming (Nachbar) | fahren (3 Hunks) | pflanzen (Wurf), haus (Klammer > 2, `fern`) | Kette |
| `_foundrySchattenGeom`, SHADOW_TWIN_LAYER, `_kaskadenZiele`, `_passSicht` | diaet-bundles (Programme), haenger (`_kaskadenZiele`, `_passSicht`) | — | pflanzen (fällt als Vorsatz), haus (`bauWurf`), kreatur (Layer) | E1; kreatur misst nach K |
| `_foundryBuildGroup` (Beipack-Karte) | haenger (2 Hunks, Erst-Zeichnung) | koerper-haus (`__huelle`), auge-v1 (Stempel 3) | haus (`__fern`, EINE Karte), tor (liest) | Kette |
| `_foundryFernForm`, `_streuFernBahn`, `_archFoundryZiegel`, `_archZiegelFern`, `_archBoxFit`, `_archFachwerkFit` | streaming (`_standMeldet` in `_tickArchitectureLOD`/`tickArchitectureCulling`, `spawnArchitecture`, `_evictArchitecture`), haenger (`_archInstanceGroupFor` 3) | — | haus, tor-fahrzeug-klinge | Kette, haus zuerst |
| `_streuGesetzFit`, `_gestaltKapselFit`, `_streuGesetzSpawn` | streaming (`_tickScatterLod` Nachbar) | kampf-maus (`_gestaltKapselFit`) | tor (Schnitt F: fallen, `_huelleVon` liest) | Kette |
| `_gliedKapselFit`, `_gliedKapselMemo`, `_kreaturGliederBacken`, `_kreaturTrefferGlieder` | — | kampf-maus (EINE Passung für Fern-Bild und Treffer) | tor (Schnitt F: Kapseln aus `huelle()`), kreatur (überspringt die L1 wie heute) | tor schneidet, kreatur liest; Integrator Schritt (2) |
| `_foundryPresetIsTree`, KIND_POLICY, `_tickImpostorBake` | — | auge-v1 (Teil 7 im crossfade-Gate) | tor (Schnitt A) | Kette |
| `_foundryLibrarySpec`, `_foundryIngestRenderConfig` | streaming (Nachbar `_foundryRewarmColdTrees`; `_foundryIngestRenderConfig`) | — | wiese (seeds, Gestalten über render-config), tor (lods) | Kette |
| `_nahWieseSenken` | streaming (`_tickNahWiese` 4 Hunks, `_nahWieseNeuIn`) | — | wiese | — |
| `_bauSatzArt`, `_chunkSatz*`, `_satzBlock` | haenger (`_chunkSatz`, `_satzBlock`) | wasser (`_chunkSatzArt`) | haus | auf der Basis gelöst |
| `_buildCreatureGroup`, `_buildHumanoidRig`, `_ofen*`, updateCreatures, `_p2pTickRemoteCreatures`, `_p2pUpdatePeer` | haenger (`_buildHumanGroup`) | kreatur (updateCreatures 20 Hunks gegen 78d66a63, neuer Distanz-Leser), wasser (`_buildHumanoidRig` 2, updateCreatures 10, `_p2pUpdatePeer`), koerper-haus (updateCreatures 9) | kreatur | auf der Basis gelöst |
| `_torBlockerAABBs`, `_fahrzeugBlockerParts`, `_vehicleProfile` | — | fahren, wasser (`_torBlockerAABBs`, `_vehicleProfile` 4) | tor | Kette |
| `_refreshHeldMesh`, gehaltene Klinge | haenger (`_refreshHeldMesh`) | kampf-maus (`_heldBogenRecipe`, `_schmiedeKampfMasze`) | tor (Klinge, Zählung Klasse spieler) | auf der Basis gelöst; `measure()` byte-gleich |
| `_genesisPortalRing`, `_ensureGenesisPlatform` (Messort genesis) | — | auge-v1 (4 + 1 Hunks) | tor (Vorher auf der eigenen Basis, nie die S1-Zahlen) | — |
| foundry-core.js Budget-Block, emitTree, emitGrass, emitRock | — | wasser (REGEN_GESETZ, Versatz) | wiese (grass), pflanzen (tree), tor (rock/flower fernform) | Kette |
| foundry-core.js Ofen (:4700–5620) | — | — | kreatur (`__tierHaut`, `__bakeGelenkBaum`), tor (additiver Export `huelle()` der Gelenk-Gestalt) | parallel; Integrator Schritt (2) |
| phyto-core `budgetSippe`, `birkenGitter`, Atlas | — | fahren (Rad-Sippe) | pflanzen | — |
| phytogenesis `__extractAssetMesh`, `__replyBuildAsset`, Beipack | — | fahren (Naben), koerper-haus | pflanzen (`teil`), haus (`__fern`) | Kette |
| fachwerk-core.js | — | koerper-haus (`buildStufe`, Marker) | haus | Marker byte-gleich |
| porta/vehicle/schmiede-core | — | fahren, wasser, kampf-maus | wiese (Gestalten-Zeile), tor | Kette |
| tetrapoda/koerper-core | — | kreatur (VERHALTEN), kampf-maus (tetrapoda-core) | wiese (Gestalten-Zeile), kreatur (Budget-Zeilen), tor (fernform-Zeile, benachbart) | Integrator Schritt (2) |
| docs/studio-vertrag.md B2/B2c, diag-studio-vertrag.cjs | — | koerper-haus (Sprung-Gesetz, §B6+) | alle | Kette seriell; kreatur → Integrator |
| v1 render-config.json / manifest.json | — | integ-l, wasser | alle | E5 |
| spec/profiband/ratsche.json, haushalt.json | — | — | alle | E6 |
| scripts/werkbank.cjs, draw-zaehler, band-urteil, ausgabe-aufnahme, sicht-linse, omen-messfolge | haenger, mess-wahrheit | — | haus (Satz-Inhalt, Messort dorf; nach K) — sonst nur lesend | — |
| .github/workflows/check.yml, package.json | mess-wahrheit, streaming | alle | haus (haus-fern), kreatur (2 Schritte), tor | Kette; kreatur → Integrator; YAML mit js-yaml laden |
| scripts/diag-altlasten.cjs (FORBIDDEN) | haenger | kreatur, koerper-haus, fahren, kampf-maus, wasser | pflanzen, haus, tor, kreatur | Vereinigung je Merge; Integrator |
| scripts/diag-schatten-werfer.cjs | haenger (54 Zeilen) | — | pflanzen (Wurf-Teil), haus (`bauWurf`), kreatur (W6/A1) | Kette; kreatur → Integrator |

---

## 6 Vertrags-Akte, gebündelt (EIN Akt je Kern und Familie, im Commit benannt)

| Kern / Satz | Familie | Akt | Beweis |
|---|---|---|---|
| foundry-core (Pflanzen) · v1 | pflanzen | B2c tree[0] 18 000 → 9 000, tree[1] 10 000 → 2 400, neu `lagen` · `quote` · `zweige` · `geruest` · `wedel` · `schatten: "teil"`; Fels einstufig + `budgetErzwingen` + Seh-Klasse `laub` gestrichen (je ein Satz mit Zahl); Re-Mint 72 Baum-Goldens | L2/Strauch/Waldboden/Blume/Fels/Gras byte-gleich; Linux-CI |
| foundry-core (Gras) · v1 | wiese-gestalten | grass[1] 1 700 → 1 000, grass[2] 320 → 130; +4 Gras-Goldens additiv | Baum-Goldens unberührt |
| fünf Zweit-Kerne · v1-Daten | wiese-gestalten | `gestalten` 16 → 1 (seed-invariant ⇒ 1, Wand) | v3–v7 + ofen OHNE Re-Mint grün |
| fachwerk-core · v6 | haus | B2 Stufen 0..3 (Stufe 3 nur `nurWurf`), B2c `schatten` → 3, `fernform: "huelle"`, Hüllen-Form (N5), Haus-Karte FINAL GESTRICHEN; 64 L2 neu, +64 Stufe 3, +6 Ausstattung | 128 L0/L1 + Ausstattung L0/L1 + siedlung byte-gleich |
| porta-core · v4 | tor-fahrzeug-klinge | Abtast-Gesetz, kindStages [0,1], 16 L0 neu + 16 L1, Hülle | Plattform-Probe acos/atan2 |
| schmiede-core · v5 | tor-fahrzeug-klinge | Profil-Gesetz + Helix, [0,1], Nicht-Bogen neu + 42 L1 + „Messung“ | 8 Bögen byte-gleich, `measure()` byte-gleich |
| vehicle-core · v3 | tor-fahrzeug-klinge | Tess-Tafel, [0,1], L1 additiv; L0 nur bei Spike-Ja | sonst 12/12 L0 byte-gleich |
| foundry-core (Fels, Blume) | tor-fahrzeug-klinge | `fernform: "huelle"`, `huelle()`; `"gesetz"` fällt aus dem Validator | Hüllen-Fingerabdruck additiv |
| tetrapoda-core, koerper-core (fernform-Zeile) · foundry-core Ofen (Export) | tor-fahrzeug-klinge | `fernform: "huelle"`; Ofen-Export `huelle()` der Gelenk-Gestalt (je Anker eine Kapsel, N5-Feld `glied`, additiv) | Glieder-Kapseln vorher = nachher (Anzahl, Achsen ±1 cm); ofen-Goldens unberührt |
| tetrapoda-core, koerper-core · ofen | kreatur | `0.schatten 0 → 1`, `1.ab`, `hyst`, `1.wurf.seh`; ofen `*-L1|*` neu; §8.4 (der Satz „kahl DARF fail-soft“ folgt dem werfenden Code) | L0 297/297 byte-gleich; v7 unberührt |
| render-config.json / manifest.json | Integrator | EIN Re-Mint nach dem letzten S3-Merge | diff = Summe der deklarierten Zeilen |
| spec/asset-contract/v1/CONTRACT.md | pflanzen | `teil`/`aDeckt` statt `wurf`, stale :31, :52-70 | — |

Jede neue B2c-Regel lernt `gate:studio-vertrag` mit roten Selbsttest-Fällen; Monotonie bleibt (tris fällt je Stufe
streng, draws steigt nie).

---

## 7 Risiken

1. **Look:** Zweig-Wahl macht Kronen klumpiger (Deckung im Modell 0,94–1,05, Birke 0,87 → Birke behält notfalls den
   Blatt-Stride unter der Lagen-Decke); Wedel ist ein Paradigmen-Wechsel (W5-Befund „Papier-Streifen“ → gekreuzte Wedel,
   Schwebe-Linse, Spike Pflicht); die Karte bäckt aus der L1 → das Fernbild 26–384 m ändert sich mit (gate:fernwald,
   Karten-Bilder Mittag/Abend); Schatten werden lichter (Lagen ≤ 6).
2. **Haus-Nahschatten:** der glatte Fernkörper nimmt Laibungs-/Balken-Mikroschatten; Akne/Peter-Panning, wenn er nicht
   innen liegt (Wand −1,5 cm, Dach −3 cm) — `gate:haus-fern` „innen“ + Bild-Paar 8 m.
3. **Kreatur:** Eigenschatten der gröberen Hülle (±3,2 cm < k0-Texel, Beweis Δ ≤ 2 %); Kalt-Guss +50–480 ms je Art im
   Haupt-Thread (Lehre 14, `werkbank takt`); EIN Skelett für zwei Klone (Ruhe-Pose, gleicher Wrap).
4. **Harter Stufenwechsel ohne Dither** bei Tor/Wagen (12 / 15,4 m) — Bild-Paar am Umschaltpunkt Pflicht.
5. **Plattform:** Pflanzen, Gras, Tor sind ungerastert; Segment-Zahlen VOR dem Aufrunden rastern; die Linux-CI ist der
   Richter jedes Re-Mints.
6. **Kalter Boot:** jeder Kern-Stempel-Wechsel baut die Platte neu (~30 MB) — einmalig, die K-Hänger-Linse sieht ihn;
   benennen, nicht als Rückschritt werten.
7. **Projektion knapp:** baum 147 500 gegen 150 000 — hält eine Zeile nicht, steigt sie offen begründet (E8).
8. **Einzeilige Goldens** von Hand gemerged = falscher Golden (E5).
9. **Messung:** Band-Zahlen sind blickabhängig (nahWiese 42–121k), tier ist Weltzustand — nur `--ort` + Wetter-Wache +
   eingefrorene Welt; Zeit misst NUR der OMEN.
10. **Zwei Fenster:** Kette und kreatur laufen parallel auf der Radeon — Zähl-Zahlen tragen, Zeitfristen-Läufe (Serien)
    macht erst der Integrator (E6).

---

## 8 Was S3 nicht trägt — benannt, mit Zahl und Grund

- **VRAM-Band 118 MB:** der Host allein trägt 125,0 MB (Post 71,1 — W7 maß rg11b10 und geteilte Kaskaden-Farbe als
  verworfen, die Post-Kette ist das Minimum für TRAA unter r184 · Kaskaden 24,0 · Boden/Wasser 20,8 · Host-Karten 9,1).
  S3 senkt nur die Asset-Last (≈ −4 MB Wiese, ≈ −4,3 MB + Tor-Puffer Genesis). Offen unter E, kein S3-Posten.
- **L0-Bänder:** Haus-L0 132k gegen Band 40k (Innenleben, Dachhaut — synthese §3.5 W7), Tier-L0 2,7–3,0× und Mensch-L0
  4× Band (synthese §3.6/§3.7). Nicht W3; der Schatten-Teil dieser Stufen fällt in S3.
- **Genesis-Ring:** nach S3 ≈ 1,2 M Dreiecke [V] > 680k; die Zerlegung des Rests misst die Bilanz-Stufe.
- **Gras-Dichte-Zwilling** (Host-Literal neben phytogenesis `groundCover`): kostet nichts, gehört W2(d).
- **Helligkeitssprung am Kreatur-Stufenwechsel** (Fell-Schalen, P50 88 → 98): Bild-Klasse, nicht Kosten (W5/W7).
- **Dither-Blende der Gelenk-Stufen** (synthese §2.3 Stufen-Kette, §3.7 Posten 1): W3 (c) trägt Werfer und Distanzen;
  der Wechsel bleibt ein harter Schalter bei `ab` × Größe (Tier 35 m, Mensch 40 m, Hysterese 0,1). Eine Blende zeichnet
  im Übergang beide Stufen — sie kostet, statt zu senken; Bild-Klasse wie der Helligkeitssprung, kein E-Posten.
- **karten-Dreiecke 1 108 > Haushalt 1 000** (+108 = 0,016 % des Bands; Befehle 1 ≤ 1): zwei Dreiecke je Karte ×
  554 Karten-Bäume im Bild bis 384 m (`gate:fernwald`) — Weltzustand, kein Asset-Posten; die Ratsche hält 1 088 +
  Toleranz, die Serie (E6) nennt die Zahl je Lauf. Offen unter E.
- **`buf:szene:spieler` 6,0 MB** in den V18.532-Boots, 0 im Kopf-Boot (Kette V18.533, ungeklärt): kein S3-Posten; die
  Ratschen-Serie (E6) nennt ihn je Lauf, damit keine VRAM-Zeile aus ungleichem Spieler-Zustand sinkt.

---

Geschnitten: nichts (Vorbereitung, rein lesend) — zwei Dateien geschrieben: dieser Plan und das Bau-Skript
`workflows/studio-s3-kosten.js` (Kette wiese-gestalten → pflanzen → haus → tor-fahrzeug-klinge, kreatur parallel).
Gemessen: Projektion Mess-Wiese 897k → ≈ 550k Dreiecke (baum 417k → ≤ 147,5k trägt ≈ 78 %); bau k0 12 760 = 29 × 440
(Feuerstelle); Gestalten-Lügen 38; VRAM 145,7 → ≈ 141 MB, Host allein 125,0 MB > 118 MB.
Pflicht-OFFEN Rest: 4 Einträge (A · B · C · E, `docs/PFLICHT-OFFEN.md`); sachlich offen: das Profi-Band auf jedem
Standardgerät (E).
Status: ZWISCHENSTAND
