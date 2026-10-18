# SYSTEMKARTE des Ultiversums — Stand integ-probe 419efefc (18.10.)

Gelesen in `C:/Users/micha/AnazhRealm-integ` (integ-probe 419efefc, main f45ee994 liegt dahinter), aus neun Domänen-Karten, Belege
stichprobenweise nachgelesen. `Datei:Zeile` gilt für 419efefc. Prozente = Code-Schätzung der Karten; Zahlen mit Ort und Gerät = gemessen.
Scope bleibt `docs/PFLICHT-OFFEN.md`: **A** AAAA je Klasse · **B** Ankunft ≤ 5 s · **E** Profi-Band.
Chokepoint: zehn Wurzeln (W0–W9) tragen die benannten Brüche — wer an ihnen schneidet, lässt die Symptom-Zweige fallen.

---

## 1 Das Ganze in einem Bild

```
SCHÖPFER  (Satz · Regler · Spiel)
   │
   ▼
┌─ STUDIOS worlds/ (14 Verzeichnisse; CLAUDE.md sagt 8) ─────────────────────────────────────────────────┐
│ Hülle worlds/huelle/huelle.js = NUR UI (regler·sitzung·kosten·bruecke), 12/12 trusted Studios         │
│ Bild: 9 eigene `new THREE.WebGLRenderer` (r128 ×7, r130, r183), ACES, eigenes Licht + Boden     [W3] │
│ Ausnahme = Vorbild: gelaende ist MODUS der Welt-Engine (index.html?studio=gelaende)       1/12        │
└───────┬───────────────────────────────────────┬─────────────────────────────────────────────────────────┘
        │ Regler P · Plan · Übergabe (postMessage) │ Tor-Panorama 512×256, im Studio-Renderer gebacken
        ▼                                          ▼
┌─ KERNE cores.manifest.json (9 Kerne / 10 Dateien) = die Gesetzbücher ──────────────────────────────────┐
│ gelaende-core  hoehe 2D :1577 · flussLaeufe · benannteSeen · ERDBAU (platte/trasse/frei) · stufeZiel   │
│                FEHLT: Höhle · Kanal · Edit · Wasser · Haus-Grund · Keller                  [W1][W2]   │
│ fachwerk-core  HAUS · DORF weiler→metropole :2846 · dorfLayout · ortPlan · exportSettlement           │
│                Export streicht mauer+graph :5460-5467 · Grundriss = 1 obb                   [W4][W2]   │
│ phyto-core     treeParams · planForestCell · KARTEN_GESETZ                                             │
│ foundry-core   Rezepte · impostor {views: 8} :719 (keine Hebung) · FARB-GESETZ              [W8]       │
│ tetrapoda-core GATTUNGEN · VERHALTEN (nur Zahlen) · GANG_GESETZ · herdeZug                  [W4]       │
│ koerper-core   Leib · MOTION · Kampf — kein Kapitel VERHALTEN                               [W4]       │
│ vehicle-core   fahrSchritt (EIN Gesetz, Labor = Welt) · FAHR.kamera nur Daten               [W4]       │
│ porta-core · schmiede-core · klang-core                                                                │
└───────┬───────────────────────────────────────┬─────────────────────────────────────────────────────────┘
        │ importScripts(three-r128 + Kerne)      │ import gelaende-core (nutzt 12 Glieder)
        ▼                                        ▼
┌─ FOUNDRY-WORKER ───────────────────────┐  ┌─ VOXEL-WORKER voxel-worker.js (3 753 Z.) ──────────────────┐
│ foundry-bruecke.js auf r128      [W3]  │  │ ~40 Abschriften der Stamm-Dichte · Edits · Wasser ·        │
│ get-book · build-asset · export-settl. │  │ Mesh-Werk · ortFrei; 117 Spiegel-Marken            [W1]    │
│ IDB-Platte NUR build-asset       [W6]  │  └────────────────┬───────────────────────────────────────────┘
└───────┬────────────────────────────────┘                   │ Chunk-Mesh · surfMap · Wasser-Zellen
        │ Float32 (Transfer)                                 │
        ▼                                                    ▼
┌─ STAMM stamm/ (48 Dateien, EINE Klasse) ───────────────────────────────────────────────────────────────┐
│ Schlangen  Foundry d² + FIFO-Freigabe · Boden Chebyshev · Veg-FIFO 4/Frame · Streu · Nah-Wiese  [W5]  │
│ Haupt-Faden  Hydrosphäre sync · Erst-Bau/Diät · Karten 1 je Lade-Bild · Ring mit Spiel-Gates    [W6]  │
│ Boden  7 Höhen-Formen · Wasser 8 Schreiber                                                       [W1]  │
│ Ort  Grundriss ×3 · Erdbau · Wege-Karte; Schicht (Halm, Nah-Wiese) ohne Wand                    [W2]  │
│ Leben  updateCreatures: Rudel = „gleiches Ziel" je Takt · Spieler-Boden eigene Probe          [W4][W2] │
│ Kamera  _loopCamera: 4 Zweige, 4 lose Gedächtnisse, kein Rig                                    [W4]  │
│ Licht  5 Tag-Achsen · 4 Lichtwege · Rim/Füll nach dem Licht                                     [W7]  │
│ Stufen  Band-Partner bewegt niemand · Albedo je Stufe eigener Weg                               [W8]  │
└───────┬─────────────────────────────────────────────────────────────────────────────────────────────────┘
        ▼
┌─ BILD · GESETZ · SPIELER ──────────────────────────────────────────────────────────────────────────────┐
│ EIN WebGPURenderer r184 (dirigent-ankunft.js:192) · Neutral · TAAU 0,75 · LEGACY_LICHT = π       [W3] │
│ Körper lesen das FELD · Halm/Wiese das BILD · Ferne und Hydro das GESETZ                         [W1] │
│ Richter: Soll-Tafel 12 Klassen an Mittag-Posen · 72 von 143 Linsen auf dem Null-Renderer         [W9] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
 Darüber liegt [W0]: 73 Heilungs-Commits auf 8 Zweigen außerhalb integ-probe, Karte ≠ Code an ≥ 10 Stellen.
```

---

## 2 Die neun Domänen

### D1 Gelände · Boden · Wasser
| | |
|---|---|
| EINE Quelle | 2D: `gelaende-core.js:1577 hoehe` (Erdbau-Term `:1384`), Flussnetz `:1177`, Stufen `:2858 stufeZiel`. 3D + Wasser: KEINE — Stamm `stamm/gelaende-boden.js:914/:955/:1122` + Abschrift `voxel-worker.js:462-795` |
| Studio | `worlds/gelaende` = Modus der Welt-Engine; Export EIN Plan (`gelaende-core.js:3337 planNormal`) → `stamm/speicher-laden.js:1320`. Kein Wasser-Studio; Erdbau kommt aus fachwerk `ortPlan` |
| Datenpfad | Plan → `_gelaende()` `gelaende-boden.js:544` → `hoehe` → Stamm-Dichte (Höhle `:961-976`, Kanal `_gewaesserForm :985`, Edit `:1122`) ∥ Worker `computeDensityGrid :519` → Mesh → surfMap → `_bodenSichtAt :17`. Wasser: `_computeHydrosphere wasser-hydro.js:54` synchron → Zellen `wasser-zellen.js:150` → Automat `:2141` → Sheet `:959` |
| Zwillinge | ~40 Funktionen Stamm ⇄ Worker (117 Spiegel-Marken); Seen ×2 (`gelaende-core.js:1146` ⇄ `wasser-hydro.js:760`); Hydro-Zahlen ×2 (`stamm/daten.js:166` ⇄ `voxel-worker.js:72-78`); 7 Höhen-Formen; 8 Wasser-Schreiber; Edit-Kugel ⇄ Erdbau-Kegel |
| Stand | 2D ~100 % EINE Quelle (Studio = Welt byte-gleich) · Gesetz-Anteil am Boden 30–40 % · 3D und Wasser im Kern 0 % |

### D2 Vegetation · Natur-Wand
| | |
|---|---|
| EINE Quelle | Gestalt `phyto-core.js:2043 treeParams`, Wald `:2652 planForestCell`, Skelett `foundry-core.js:5113`; Wand `stamm/vegetation-baum.js:1610 _naturSetzen` → `:1628 _naturWand` |
| Studio | `worlds/terrain` (phytogenesis.js, r128) über `Gesetz("terrain:…")` + Foundry-Rezepte |
| Datenpfad | Instanz: `_enqueueVegetationSpawn :1584` → FIFO 4/Frame `:2040` → `_naturSetzen` → `_instanzZeichner`; Stufe `_lodAuge stoff-material.js:2078` + `_chooseLODForDistance vegetation-streu.js:1790`. Schicht OHNE Wand: Vertex-Grün → `_wegeBodenFarbe` → `_green stoff-material.js:1882` → Halm `:1981`; Nah-Wiese `vegetation-wiese.js:33-93` |
| Zwillinge | Ort ×3 (Grundriss `:1828` · Erdbau `_ortFrei gelaende-boden.js:855` + Kopie `voxel-worker.js:348` · Wege-Karte); Räumer ×2 (`:1937` ⇄ `siedlung-satz.js:1815`); Grün-Wachen ×2; Wasser-Urteile ×3; Wuchs Rich ⇄ Legacy (`vegetation-streu.js:1959`); Stamm-Baumgeometrie `vegetation-baum.js:753` |
| Stand | Instanz-Wand ~90 % · Schicht-Wand gegen Häuser 0 % · Wand-Einheit ~50 % · Baum EINE Ableitung für gen ≥ 5 |

### D3 Siedlung · Dorf → Stadt · Bauen
| | |
|---|---|
| EINE Quelle | `fachwerk-core.js` (6 155 Z.): HAUS `:130`, DORF `:2846` (Größe aus n `:2857`: weiler · dorf · markt · stadt · grossstadt · metropole), `dorfLayout :3043` (Mauer, Tore, Vorstadt), `massBau :3430`, `buildInstance :3694`, `exportSettlement :5377`, `ortPlan :5551` |
| Studio | `worlds/fachwerk/fachwerk.js` (1 029 Z., r128) — zeigt Dorf UND ummauerte Stadt (`:335-342`) |
| Datenpfad | Kern → Worker `export-settlement` → `spawnSettlement siedlung-ort.js:1779` / Auto-Zelle `:2270` → `_ortWahl gelaende-boden.js:711` (Erdbau `:759`) → `_spawnSettlementSlot :1404` → `spawnArchitecture('haus_'+kultur)` → Bau-Satz. Spieler: `confirmBuild werkstatt-bauen.js:364` ohne ortPlan, ohne Erdbau |
| Zwillinge | Dorf-Rechnung ×2 im Studio + Paritäts-throw (`fachwerk.js:184-186`); Bild Studio ⇄ Welt; Größen-Klemmen ×4 (4..500 · 4..320 · 4..120 · 8..17); `EPOCHEN.groesse` tot (`:2806-2814`); Grundriss-Leser ×3; Haus-Quellen ×2 (`bau-teile.js:7`); Mauer nur im Studio |
| Stand | HAUS ~90 % · Dorf-Gesetz Weiler→Metropole ~85 % · Dorf in der Welt ~70 % · Stadt in der Welt 15–20 % · Bauen ~55 % · Studio = Welt im Bild ~40 % |

### D4 Tiere · Rudel
| | |
|---|---|
| EINE Quelle | Zahlen `tetrapoda-core.js:140-272` (jagd · furcht · separation · herde · wurf), Gang `:1313-1421`, Steuer `:1535`, `herdeZug :1591`. Entscheidungen: Stamm `stamm/kreatur-verhalten.js:2848 updateCreatures` |
| Studio | `worlds/tetrapoda` formt nur die Gestalt (5 Dials, 4 Gattungen); Verhalten dort 0 Treffer; `worlds/schwarm` = fremde 2D-Boids |
| Datenpfad | Kern → Ofen `koerper-leib.js:817-847` → `_leibHuelle :137`; Geburt `_kreaturWurf kreatur-leben.js:1572` (Anker `:1602`); Takt: Jagd `:288-391` · Flucht · Neugier+herdeZug `:2941-2989` · Wandern → Separation `:397` → `_leibKontakte :783` |
| Zwillinge | Labor-Gang PD-Sinus `tetrapoda.js:239-272` ⇄ `gangSchritt`; Gestalt Kern ⇄ `CREATURE_SOULS kreatur-leben.js:1781-1860`; Schwarm-Modelle ×3; Rudel ohne Träger (Jagd-Ziel ⇄ Wurf-Anker); `tiereHalten`-Patch der Linse statt Ruhe-Wort |
| Stand | Leib ~75 % · Gang Welt ~80 % / Labor 0 % · Leib-Löser ~85 % · Jagd ~60 % · Zusammenhalt ~30 % · Flucht ~40 % · Führung 0 % · Lebensraum 0 % · Verhaltens-Studio 0 % |

### D5 Mensch · NPC · Spieler
| | |
|---|---|
| EINE Quelle | `koerper-core.js:449-456` Gesetzbuch mensch (Leib, MOTION, Bewegung, Kampf) — kein Kapitel VERHALTEN; Gang aus tetrapoda |
| Studio | `worlds/koerperstudio` (r128) → Übergabe `:625-636` → `netz-portal.js:1274` → `state.studioUebergabe.koerper` |
| Datenpfad | `_koerperStudioDials koerper-leib.js:2568` → `_buildHumanGroup koerper-fahrt.js:6` → `bauMensch` (Ofen `koerper-leib.js:1308`); Bewegung `_stepCharacter koerper-bewegung.js:638`; Werte `_statsFromTags` → `recomputePlayerStats koerper-seele.js:1536`; Seele `applyPlayerSoul koerper-fahrt.js:1863`; Peers `netz-p2p.js:2200` |
| Zwillinge | Akt-Katalog nur im Studio-Skript (`koerperstudio.js:28-30`, Math.random); Spieler-Boden eigene Probe (`koerper-bewegung.js:857-887`) ⇄ `_koerperBodenUnter kreatur-leben.js:1357`; Genom-Roller ohne Aufrufer (`koerper-leib.js:5`); Stimmungs-Schwellen ×2; Modul-Lage ⇄ `spec/stamm/modul-karte.json:31/33` |
| Stand | Spieler-Leib ~75 % · Tiere als NPC ~55 % · Menschen-NPC 0 % · Siedlung → Mensch 0 % |

### D6 Fahrzeug · Ritt · Kamera
| | |
|---|---|
| EINE Quelle | Physik `vehicle-core.js:3000 fahrSchritt` (Labor und Welt); Kamera `FAHR.kamera :2290-2297` nur Daten |
| Studio | `worlds/garage/garage.js` (447 Z., r128; eigene Chase `:353-366`, Boden `bodenY :263`) |
| Datenpfad | `exportDrive :2470` → `_vehicleProfile koerper-fahrt.js:587` → `mountArchitecture :741` → `_rittSchritt :1088` → `_tickMountedMovement :1323` → `_archInstanceUpdate siedlung-satz.js:2247` (nur `instSlots`) → `_loopCamera koerper-bewegung.js:1579` |
| Zwillinge | Chase ×2; Wagen-Pose ×3; Slot-Listen ×2 (`instSlots`/`instSlotsBand`); Lage-Quellen ×2 in EINER Kamera (`:1635` ⇄ `:1678`); Kamera-Gedächtnis ×4; Boden ×2; Vorschau-Tafel ×2; Namens-Lüge `_foundryPresetIsTree studio-bruecke.js:1389` |
| Stand | Fahr-Physik ~90 % · EINE Kamera-Funktion ~40 % · Labor = Welt ~50 % · F1 in integ 0 % (Schnitte auf spielgang) · Fahrzeug-Klasse in der Soll-Tafel: keine |

### D7 Licht · Stoff · Ferne
| | |
|---|---|
| EINE Quelle | Leuchtquellen `fachwerk-core.js:3786 LICHT_GESETZ` → `_leuchtTakt dirigent-kern.js:1535` (EIN Pool); Tag/Nacht `_applyDayNightToScene bild-himmel.js:996`; Karte `foundry-core.js:719` + `phyto-core.js:3302`; Stufen-Auge `_lodAuge stoff-material.js:2078` |
| Studio | keins für Atmosphäre und Belichtung (Konstanten `bild-himmel.js:2862-2879`); Studios ACES fest (garage 1,04 · fachwerk 1,12 · schmiede 1,06 · phyto 1,0) |
| Datenpfad | Uhr → Sonnenwinkel `:1170` → Richtlicht/Ambient/Hemi/PMREM (≥ 6 s) → Rücklesung async `:659-677` → `_himmelsIrradianz` → Belichtung `:2038`; Stoff → `_applySubstanceResponse stoff-material.js:618` → Luft → Neutral × Belichtung |
| Zwillinge | Tag-Achsen ×5 (`:1308/:1813/:1895/:1994/:2017`); Belichtungs-Schreiber ×3 (`:2056`, `dirigent-ankunft.js:210`, `bild-kosten.js:699`); Lichtwege ×4 (Mesh · Feld/Panorama `bild-sicht.js:1843/:1896` · Wasser `:1077` · Karten-Sonne `stoff-instanz.js:673`); Stufen-Abstand ×3 |
| Stand | EIN Leuchtquellen-Gesetz steht · die EINE Eichung trägt 1 von 4 Lichtwegen · Tafel himmel-licht nur „Mittag klar", 6 Uhr/18 Uhr/Nacht 0 Proben · Karten 8 Peilungen, 0 Hebungen |

### D8 Studios · Hülle · Foundry
| | |
|---|---|
| EINE Quelle | `cores.manifest.json`; EINE Foundry-Brücke `foundry-bruecke.js`; Hülle `worlds/huelle/huelle.js` (929 Z., nur UI, `panorama()` setzt WebGL voraus `:643-700`) |
| Studio | 14 Verzeichnisse: fachwerk · garage · klang · koerperstudio · portale · schmiede · tetrapoda · terrain · gelaende · skeleton · fluid · translated · begegnung · schwarm (+ huelle) |
| Datenpfad | Labor = iframe (eigener Renderer, Licht, Boden, ACES) ∥ Welt: Worker `importScripts(r128 + Kerne + Brücke)` `studio-bruecke.js:449-469` → Float32 → r184-NodeMaterial → WebGPU Neutral; Tor-Ziel = Panorama aus dem Studio-Renderer (`worlds/tor-ziele.json`) |
| Zwillinge | 9 `new THREE.WebGLRenderer` in `worlds/*/*.js`; 5 three-Revisionen (r128 · r130 · r160 Node · r183 · r184); Impostor-Bäcker ×2; Membran ×2; 4 Stamm-Bühnen mit eigenem Renderer; `LEGACY_LICHT = π`; §4b normativ; Ü2 ⇄ FARB-GESETZ |
| Stand | Hüllen-UI 12/12 · EINE Engine 1/12 (gelaende) · Foundry auf r128 mit synchronem Manifest-XHR |

### D9 Ankunft · Takt · Kosten · Prüfen
| | |
|---|---|
| EINE Quelle | Tor `_weltbildSteht dirigent-ankunft.js:843` + `WELTBILD_TERME dirigent-kern.js:1796`; Schlange `_foundryAuftrag studio-bruecke.js:952`; Takt `_gameLoopTick dirigent-takt.js:46` |
| Studio | keins — reiner Stamm |
| Datenpfad | init im Haupt-Faden `dirigent-ankunft.js:3-800` → Lade-Takt 100 ms / Bild 500 ms → Besteller → `warte[]` → Pumpe d² `:977` → Worker FIFO → Freigabe FIFO `:826` (180/s, ≤ 8/Frame) → Erst-Bau/Diät → Karten 1 je Lade-Bild → `_weltbildLuecken :973` leer → Bild |
| Zwillinge | Pumpe ⇄ Freigabe (B4 vereinte, Revert ab97f0a8 trennt wieder); Rang-Schlüssel ×3; „steht" ×3; `_ladeTakt()` direkt an ~11 Stellen neben `_kappeOffen`; ~14 Budget-Uhren; Null-Renderer-Zwilling des Ankunftspfads |
| Stand | B GTX kalt 16,6 s (16,1–17,0), zweit 12,0 s, Leib 10,5–10,9 s (a626dd20) = ~30 % des Solls; Haupt-Faden bis zum Bild 97 % belegt; Radeon am Kopf ungemessen · Apparat: 143 diag-*, 72 auf dem Null-Renderer, 25 urteilen Pixel, 7 messen Frame-Zeit |

---

## 3 Die gemeinsamen Wurzeln

### W0 — Heilungen auf Zweigen, die Karte ≠ der Code (das Nebel-Muster)
Wurzel: fast Gebautes liegt neben integ, die Doku nennt Zustände, die der Code nicht hat. Wer am Kopf feilt, feilt an Symptomen, deren Schnitt
schon existiert — oder schreibt eine dritte Abschrift. Gegen Lehre 4 („fast Gebautes wird zu Ende gebaut und gemergt, bevor Neues beginnt").

| Zweig (Kopf) | Commits außerhalb integ | trägt | Lesart |
|---|---|---|---|
| spielgang 757d1b0f | 28 | F1a 7348d7db · chaseKamera 8432627c · Rig/PORTAL_VORSCHAU 757d1b0f | einfädeln (kein Zwilling) |
| b5-lieferung 5c2a0247 | 11 | B5: Leib kalt 10,92 → 6,12 s, Streu-Warten 7,91 → 0 | mit ankunft-takt als EIN Paket |
| ankunft-takt ae9687d1 | gemergt, Revert ab97f0a8 | B4: EINE Wahl, Diät Object.keys | mit B5 |
| wiese-im-haus 69498f91 | 9 | F4: 24/25 → 0 Häuser innen grün, Anbau offen | Vorlage für S4, kein Merge (Stamm statt Kern, Haupt-Faden) |
| nacht-fernfarbe e2485995 | 7 | F6: Rim + Nacht-Füll fallen, Fichte-Karte nachts 4,75 → 0,99 | einfädeln (OMEN-ABAB bestellt) |
| mess-wiese 696f016d | 7 | K55 Messort −278/−1038 (das ABAB maß per Patch) | einfädeln |
| fahrt-vorausschau 1bb06b4e | 5 | F5 `_ankunftD2` | Leser des EINEN Rangs (S3) |
| hoch-bauen 9d987a93 | 5 | F2a `_editForm`, beidseitig | Vorlage für S5, kein Merge (dritte Abschrift) |
| fern-von-oben ab86edc0 | 1 | F2b Spike Hebungs-Ringe 0/40/80° | Vorlage für S8 |

Karte ≠ Code:
- CLAUDE.md „WASSER EINE Wahrheit (`_werkBoden`)": `stamm/wasser-hydro.js:1594` ist der Boden unter dem Fahrzeug.
- B-Zahl 27,9–29,8 s (CLAUDE.md, PFLICHT-OFFEN B) gegen gemessen 16,6 s; Prämisse „Versions-Update = kalt" widerlegt (Platte trifft 107–110 von 108–111, a626dd20).
- PFLICHT-OFFEN A nennt „7 von 8 Klassen ROT" (15.10.); die Tafel trägt 12 Klassen, an ihren Posen am 17.10. ROT nur laub-kante.
- „acht Studios" (CLAUDE.md:5) gegen 14 Verzeichnisse.
- Kreatur-Glieder im Wasser-Modul (`wasser-hydro.js:10-547`); Verhaltens-Tick in Koerper/leib (`koerper-leib.js:2422/:2455`), Bühne `_buehneSteht` im Kreatur-Modul (`kreatur-verhalten.js:2195`), Seele/Stats in Koerper/fahrt gegen `modul-karte.json:31/33`.
- falsche Kommentare: `studio-bruecke.js:3051-3053` (geritten = L0), `worlds/fluid/fluid.js:3` (r134), `worlds/translated/translated.js:7`, `tetrapoda-core.js:136-139` (Fallback, den es nicht gibt).
- zwei selbstgesetzte Tore, die vorhandenes Gesetz „neu" nennen: `fachwerk-core.js:5463-5464` (Stadt mit Mauer „NEUES Verhalten hinter dem Feature-Stopp") und `tetrapoda-core.js:1585` (Verband „nach v1.0").

Regel aus W0: ein Zweig, der eine Abschrift schreibt (hoch-bauen beidseitig, wiese-im-haus im Stamm, F3 `_schnittSpiegel` ×2), ist Vorlage für den Wurzel-Schnitt, nie Merge.

### W1 — Die dritte Dimension hat kein Gesetz
Wurzel: der Kern kennt nur die 2D-Höhe. Höhle, Kanal, See-Becken, Edit und das ganze Wasser leben im Stamm und als Hand-Abschrift im Worker;
jede Leser-Gruppe greift eine andere Form. Chokepoint: `gelaende-core.js` — `spalte`/`dichte`/`editForm`/Wasser-Spiegel als reine Kern-Funktionen.
- F2a hoch bauen: Edit = Dichte-Kegel × 48 (`gelaende-boden.js:1138-1143`, Worker `:591-595/:695`), über 48 m trägt kein Fill; Fix nur beidseitig auf hoch-bauen.
- F3 Graben am Fluss: gemergt über einen weiteren Spiegel (`wasser-zellen.js:136` ⇄ `voxel-worker.js:1120`).
- Welt-Unruhe (Wasser): eigener Automat `_tickWorldWaterCA wasser-zellen.js:2268`, Ruhe nur Fixpunkt (`:2163-2174`); Linse G4 zählt Sheet-Bauten statt Takte (86d9a7c0).
- Schwebend/eingesunken je Leser: 3 Boden-Höhen ohne Rolle — Dichte-Scan 63 Leser, `_bodenSichtAt` 6, `_terrainMacroSurfaceY` 13.
- Seen ×2 (`gelaende-core.js:1146` ⇄ `wasser-hydro.js:760/:855`); Hydro-Zahlen ×2 (`daten.js:166` ⇄ `voxel-worker.js:72-78/:1205-1208`); Saat-Rückfall ×2 (`gelaende-chunks.js:167/:588` ⇄ `gelaende-core.js:1533`).
- Fern-Ring und Hydro-Raster sehen keine Edits (`gelaende-fern.js:880`, `voxel-worker.js:3616`).
- Wasser-Urteile ×3 in der Natur (`vegetation-baum.js:1633` Gesetz · `vegetation-wiese.js:75` gezeichnet · Nah-Streu selbst); Tiere gehen durch die zweite Fläche trocken (`kreatur-verhalten.js:3033-3041`).
- B: Hydrosphäre synchron im Haupt-Faden nach dem ersten Boden (`gelaende-boden.js:278-305`), stateGen-Bump baut gestreamte Chunks neu (`wasser-hydro.js:1402-1406`).
- Linse blind: `gate:worker-dichte` vergleicht Abschrift mit Abschrift.
- `_ortFrei` Worker-Kopie (`voxel-worker.js:348` ⇄ `gelaende-boden.js:855`).

### W2 — Der Ort hat kein Grund-Datum
Wurzel: das Gesetzbuch kennt den Körper-Satz des Hauses (FOOTPRINT `fachwerk-core.js:443`, Anbau `:455/:1138`, Flügel `:1192`, Keller `:172-173/:314`),
exportiert aber EINE Box (obb) + `tuer.W/D`; der Stamm baut daraus drei Grundrisse, der Erdbau kennt Rechteck-Platten, die Schicht gar keinen.
Chokepoint: EIN Grund-Datum je Bauwerk (Box-Liste + Keller) aus fachwerk-core, gelesen als Erdbau-Art in gelaende-core.
- F4 Wiese im Haus: Halm `stoff-material.js:1981` und Nah-Wiese `vegetation-wiese.js:73-85` lesen keinen Grundriss; `_naturRaeumen vegetation-baum.js:1983` räumt die Nah-Wiese nicht.
- F4 Wiese im Anbau: 119 Büschel nach R3 (`grundZeile` ohne Anbau-Körper).
- F4 Gelände durch das Haus / Erde über der Diele: `ERDBAU_ZAHL gelaende-core.js:1319`, `erdbauWand :1462` („innen im Kegel der Böschung bleibt Natur").
- Keller nicht begehbar: Erdbau ohne Hohlraum (`gelaende-core.js:1338`), Stamm 0 Keller-Leser; der Spieler-Anti-Clip hebt heraus (`koerper-bewegung.js:862-877`).
- Gesetztes Haus ohne Erdbau und Vorplatz (`werkstatt-bauen.js:364`).
- Tier-Geburt im Anbau (`kreatur-leben.js:1558-1559` → `_imGrundriss`).
- Grundriss-Leser ×3 (`vegetation-baum.js:1828`, `siedlung-ort.js:1384`, `feld-leben.js:2101`); Ort-Abbilder ×3; Räumer ×2; Grün-Wachen ×2 (`stoff-material.js:1882` ⇄ `gelaende-boden.js:1571-1582`).
- Spieler-Boden ⇄ Körper-Boden (`koerper-bewegung.js:857-887` ⇄ `kreatur-leben.js:1357`).
- F1d Vorschau-Haus, -Esse, -Tor ohne Platz-Gesetz (`siedlung-ort.js:2130`).

### W3 — Das Studio ist eine fremde Engine
Wurzel: die Hülle eint nur UI; jedes Studio rendert mit eigener three-Version, eigenem Licht, Boden und ACES. „Labor = Welt" hält nur für
Dreiecke (`scripts/diag-studio-huelle.cjs` H4). Das Studio kann die Brüche der Welt nicht zeigen, darum werden sie in der Welt gefeilt.
Chokepoint: `index.html?studio=<x>` nach `worlds/gelaende/studio.js:1-23` + Wand H6.
- Klasse haus: das Labor zeigt die Bau-Stoffe anders als die Welt (Soll-Tafel).
- F4 im Studio unsichtbar: das Fachwerk-Labor zeichnet einen eigenen Dorf-Boden.
- F6/Dämmerung im Studio nicht eichbar: ACES fest (`fachwerk.js:563` u. a.) gegen Neutral (`bild-himmel.js:2877`), Brücke `LEGACY_LICHT = π` (`:2869`).
- F1c Chase ×2 (`garage.js:358` ⇄ `koerper-bewegung.js:1621`).
- Tier-Labor-Gang (`tetrapoda.js:239-272`) beweist den Welt-Gang nicht; Verhalten im Labor unsichtbar.
- Membran ×2 (`worlds/portale/porta.js` ⇄ `siedlung-ort.js:131`); Impostor-Bäcker ×2 (`foundry-bruecke.js:246` ⇄ `stoff-instanz.js:576`).
- Dorf ×2 + Paritäts-throw (`fachwerk.js:184-186`); Stadtmauer nur im Studio (`:335-342`).
- 4 Stamm-Bühnen mit eigenem Renderer (`werkstatt-vorschau.js:203`, `werkstatt-hof.js:656/:1304`, `werkstatt-sozial.js:1253`).
- B: der Foundry-Worker parst three-r128 (603 KB) + Manifest per synchronem XHR (`studio-bruecke.js:453`).
- Vertrag §4b schreibt die Zwei-Engine-Welt normativ (`docs/studio-vertrag.md:631-655`); Ü2 widerspricht dem FARB-GESETZ (`foundry-core.js:79`).
- F1d: die Welt braucht Stellvertreter — `_ensurePortalPreview` stellt lebende Werke in die Fahrbahn (`siedlung-ort.js:2056-2161`).

### W4 — Der Kern trägt Zahlen, der Wirt die Entscheidung
Wurzel: wo das Gesetzbuch nur Daten liefert, schreibt der Stamm (oder die Shell) die Funktion selbst; wo der Kern die Funktion hat, sperrt ein
Kommentar den Export. Gegen CLAUDE.md:7 („AnazhRealm erzeugt nichts, was ein Studio kann"). Chokepoint: reine Funktion im Kern, Labor UND Welt rufen sie.
- Rudel nur als Jagd-Augenblick: Rudel = Jäger gleichen `_jagdZiel`, je Takt neu (`kreatur-verhalten.js:301-319`); Wurf ohne ID (`kreatur-leben.js:1602`); Fremd-Rudel verschmelzen.
- Herde zerfällt: `herdeZug` nur im Neugier-Zweig (`kreatur-verhalten.js:2951-2984`), Flucht einzeln, keine Ausrichtung, Führung 0 (grep leader/rudelId: 0).
- Lebensraum 0: Seelen tag-identisch, das Rauschen 0,15 wählt die Art (`dirigent-kern.js:1485-1494`).
- Menschen-NPC 0: `koerper-core.js` ohne VERHALTEN, Akt-Katalog nur `koerperstudio.js:28-30`; `CREATURE_SOULS kreatur-leben.js:1834` ohne Menschen; `_rollHumanoidGenome koerper-leib.js:5` ohne Aufrufer.
- Siedlung ohne Leute: `rolle`/`leute`/`wohl` (`fachwerk-core.js:2794/:5310`) erreichen keinen Körper (`siedlung-ort.js:1504`; `.rolle` in siedlung-*.js: 0).
- Stadt in der Welt 15–20 %: Export-Tor `fachwerk-core.js:5460-5467`, Klemmen ×4, `EPOCHEN.groesse` tot, Auto-Zelle 8..17 (`siedlung-ort.js:1935`).
- F1b Kamera ohne Rig: Gedächtnis nur im Third-Ritt-Zweig (`koerper-bewegung.js:1624-1632`), `setCameraMode dirigent-kern.js:1185` setzt nichts zurück; Kern `vehicle-core.js:2290` nur Zahlen.
- Rudel-Ring-Geometrie im Stamm (`kreatur-verhalten.js:320-346`); Hydro-Zahlen im Stamm (`daten.js:166`, mit W1).

### W5 — Der Rang ist der Abstand, nicht der Bild-Bedarf
Wurzel: jede Schlange ordnet für sich — d², Chebyshev oder FIFO —, keine nach dem, was das nächste Bild braucht oder wann der Spieler ankommt.
Chokepoint: EIN Rang je Auftrag (`_foundryRang`/`_foundryWahl`, b5-lieferung), gelesen von Pumpe, Freigabe und jeder Schlange.
- B4/B5: Rang d² + 1e12 (`studio-bruecke.js:959`), ortlos ∞ (7 Aufträge warten 8,5 s), Freigabe FIFO (`:826`); vor dem Bild 10,8 s Worker-Detail, das das Bild nicht zeigt (Leib-L0 4,4 s, Wurf-L3 3,7 s, Karten-L1 außer Blick 2,7 s).
- F5 schnell fahren: Boden Chebyshev (`gelaende-chunks.js:2839-2840`), Voraus 1–2 Chunks (`:2534-2558`), `_voxelChunkLodFor` (`gelaende-boden.js:2587`) ohne Tempo.
- Veg-FIFO 4/Frame (`vegetation-baum.js:1594/:2040`), `_tickPendingGrass(1)` (`vegetation-wiese.js:967`), Streu (`vegetation-streu.js:1447`) — ohne Bild-Rang.
- Kreatur-Gestalten im selben FIFO, obwohl ≥ 130 m fern und außer Blick geboren (`kreatur-leben.js:1928`).
- Siedlungs-Export mit vollem Mass-Bau je Haus (0,30–0,39 s GTX) ohne Rang (`fachwerk-core.js:5388-5392`).
- GT-Vorschau im 1-s-Takt + 8-s-Await-Book (`siedlung-ort.js:2084-2096/:2137/:2320`).
- Rang-Schlüssel ×3 (`studio-bruecke.js:959`, `dirigent-ankunft.js:954`, `:936/:944`); `_foundryNaeher :1044` hebt nur Wartende.

### W6 — Der Haupt-Faden trägt das erste Bild seriell
Wurzel: t(Weltbild) = Summe des Haupt-Fadens (97 % belegt; kalt 16,6 ↔ 16,4 s, zweit 12,0 ↔ 12,0 s; a626dd20); Spiel-Drosseln gelten unter dem Ladeschirm.
Chokepoint: EINE Lade-Kappe (`_kappeOffen dirigent-takt.js:1092`), und was nicht auf den Haupt-Faden gehört, verlässt ihn.
- Erst-Bau 50 Programme 3,31 s, darin `_diaetGang` 1,50 s (`bild-kosten.js:3575` for…in; B4 maß 1 482 → 9 ms).
- Karten 1 je Lade-Bild, 1,39 s (`stoff-instanz.js:413`), seit S2b im Welt-Renderer auf dem Haupt-Faden.
- Ring-Rampe mit Spiel-Gates unter dem Ladeschirm (`dirigent-regler.js:415-480`; Ring 1→2 erst bei 10,6–13,5 s).
- `_ladeTakt()` direkt an ~11 Stellen (`gelaende-chunks.js:2565`, `vegetation-wiese.js:1618`, `bild-kosten.js:537`, `siedlung-bauten.js:956`, `dirigent-takt.js:1041/:1055/:1147/:1278`, `dirigent-regler.js:240/:291/:360`).
- Hydrosphäre synchron (W1) · Start-Dorf +2,6 s · Ortwahl mit Hydro-Kachel ~200 ms je Kandidat (`gelaende-boden.js:737-739`).
- Leib-Tor wartet auf L0 UND L1 (`koerper-leib.js:1392`), Bau-Tor auf den Wurf (`studio-gestalt.js:851`).
- Platte nur für build-asset: Blatt-Atlas, Dorf-Export, Karten laufen jedes Boot live (`studio-bruecke.js:488`).

### W7 — Die Licht-Kette hat fünf Achsen und vier Wege
Wurzel: Tag/Nacht ist nicht EINE Funktion der Sonnenhöhe, die Belichtung liest den Himmel asynchron, Feld, Panorama, Wasser und Karten-Bake
rechnen Licht von Hand nach. Chokepoint: EINE Tag-Achse in `bild-himmel.js` + EIN Licht-Baustein.
- Bild um 6 Uhr schwarz (nachgerechnet, nicht im Bild gemessen): t = 0,25 → Sonne und Mond auf 0 (`:1170-1180`), `_celestialHorizonFade(0)` = 0 für beide (`:1813`), `_nachtAnteil` = 1, Belichtung aus `_skyEnvData` = null (`:659-677/:2052`); dieselbe Lücke um 18 Uhr erwartet.
- F6 Nacht-Bleiche: Rim 0,16 + Füll 0,06 nach dem Licht (`stoff-material.js:651-669`), im Spielstand (`speicher-welten.js:942-944`) — geschnitten auf nacht-fernfarbe e2485995, nicht in integ.
- Belichtungs-Schreiber ×3; Belichtung je Takt neu (`siedlung-ort.js:440`), PMREM-Drift ≥ 6 s → Welt-Unruhe.
- Naht nah ⇄ Feld ⇄ Wasser: WGSL-Lambert-Kopie (`bild-sicht.js:1843-1851/:1896-1899`), Wasser über `uIrr` (`:1077-1083`).
- Tor-Ziel-Atlas teilt durch die Heimat-Belichtung (`siedlung-ort.js:351/:439-440/:667-669`).
- Studio-Belichtungen ×N (W3).

### W8 — Die Stufe ist nicht invariant
Wurzel: jede Stufe (L0 · L1 · L2 · Karte · NUR-WURF) und jede Lage (stehend · geritten) ist ein eigener Weg statt EINER Ableitung der Gestalt — sie bricht
unter Blick-Hebung, Albedo und Bewegung. Chokepoint: das Rezept trägt Hebung und Albedo je Art; jede Slot-Liste eines Eintrags hat EINEN Setzer.
- F2b Fernwelt von oben: `impostor: {views: 8}` nur Azimut (`foundry-core.js:719`), Bake-Kamera waagrecht (`stoff-instanz.js:633-634`).
- laub-kante 0,2635 > 0,22 (Karte fimp:atlas:L2 an der steilen Tafel-Pose, 5deb7cb1).
- Haus L2/L0 0,788 (L2-Ton aus dem Stufe-1-Mittel, `fachwerk-core.js:1999/:2612`) · Birke 16–21 % dunkler als L1 · Karte 7–36 % gegen L1 (a5669277); `_substanceCharacter` nur am L0-Zweig (`stoff-material.js:1199-1215`).
- F1a Wagen in Third an alter Stelle: Band-Partner in `instSlotsBand` (`siedlung-satz.js:2219`) bewegt niemand (`:2264`); der Wagen zählt als „Baum" (`studio-bruecke.js:1389/:3060`).
- Wagen fern als 8-Winkel-Billboard (`studio-bruecke.js:3050`).
- Wuchs Rich ⇄ Legacy; Skelett = Bild nur mit Gestalt g (`vegetation-streu.js:1959-1962`, `werkstatt-bauen.js:2635`); der Stamm baut eigene Baum-Geometrie (`vegetation-baum.js:753`).

### W9 — Der Richter wohnt im Gerichteten
Wurzel: Linsen lesen die Quelle, die sie prüfen, an Posen, die das Spiel nicht hat (Mittag, Ruhe, Boden, Null-Renderer) — darum fand das Auge des
Schöpfers F1–F6. Chokepoint: Soll-Tafel-Posen × Uhr × Sicht aus dem Ausgabe-Pfad; EIN Stand der Welt mit Ruhe-Wort.
- `scripts/diag-boot-stage.cjs:297/:300` Zeit aus `_weltbildDa`, „halb" aus der WARN-Zeile des Stamms (`:200`); `gate:ankunft` L2a gegen dieselben `WELTBILD_TERME` (`diag-ankunft.cjs:399/:410`).
- `gate:worker-dichte` Kopie gegen Kopie (W1); `werkbank licht` liest `_waagrechtIrradianz`, aus der die Belichtung kommt; H4 zählt Dreiecke, H5 backt im Studio-Renderer.
- Tafel himmel-licht nur „Mittag klar" (`spec/abnahme/soll-tafel.json:181-200`); am Genesis-Platz misst sie nur tor-fern/-bunt/-ziel (`:672/:902/:959`); keine Klasse fahrzeug, tier, dorf-stadt.
- Band herde nur am neugierigen Bären (`scripts/lib/kreatur-proben.cjs:1017-1021`); `diag-kreatur-leben.cjs:101-120` prüft Existenz.
- F4-Linse liest `grundZeile` (dieselbe Quelle, Übergabe 13:30); die Fahrt-Linse meidet den Tor-Kreis (757d1b0f).
- „steht" ×3 (`dirigent-ankunft.js:973` · `dirigent-takt.js:373` · `vegetation-baum.js:2057`); `tiereHalten`-Patch (`scripts/lib/ausgabe-aufnahme.cjs:432-451`) statt Ruhe-Wort; ein Fege-Takt mit Arbeit bricht `_weltSteht`.
- 72 von 143 Linsen auf dem Null-Renderer, dessen Ankunft sofort steht (`dirigent-ankunft.js:339`) und dessen Freigabe ungedrosselt ist (`studio-bruecke.js:803`).

---

## 4 Die Wurzel-Schnitte nach Hebel

Hebel = Brüche, die fallen × Pflicht-Buchstaben ÷ Aufwand, plus was andere Schnitte trägt.

| # | Schnitt | Wurzel | Brüche fallen | Pflicht | Aufwand |
|---|---|---|---|---|---|
| S1 | EINE Engine unter jeder isolierten Studio-Seite | W3 | 13 | A B E | groß: 1–3 d je Studio, ~9 000 Z. Shell |
| S2 | Der Richter steht außerhalb | W9 | 11 | A B | klein–mittel: 1–2 d |
| S3 | EIN Rang, freier Haupt-Faden | W5 W6 | 13 | B E | mittel: Code auf b5-lieferung/ankunft-takt/fahrt-vorausschau |
| S4 | EIN Grund-Datum aus dem Körper-Satz | W2 | 12 | A | mittel: 2–3 d |
| S5 | Das 3D-Gesetz von Boden und Wasser im Kern | W1 | 10 | A B | groß: 4–7 d |
| S6 | Die Funktion ins Gesetzbuch: Rudel · Mensch · Kamera · Stadt | W4 | 12 | A | mittel je Funktion: ½–1 d |
| S7 | EINE Tag-Achse, EIN Licht-Baustein | W7 | 6 | A | mittel: 1–2 d |
| S8 | Die Stufe folgt der Gestalt | W8 | 7 | A E | groß (Hebung); F1a klein |

Vor jedem Schnitt (W0): die Zweige ohne Abschrift einfädeln — nacht-fernfarbe (F6), B4 + B5 als EIN Paket, spielgang (F1), mess-wiese;
hoch-bauen und wiese-im-haus sind Vorlagen für S5 und S4. S2 liefert das erste ROT für S4, S6, S7, S8; S5 macht S4 im Kern billiger.

### S1 EINE Engine unter jeder isolierten Studio-Seite (W3)
- GESETZ des Schöpfers (18.10., zweimal): ein Studio wird NIE gelöscht und NIE in die offene Welt verlegt. Jede Studio-Seite
  `worlds/<x>/index.html` bleibt die ISOLIERTE Bühne (eigene Szene, Panorama, Bodenplatte, Orbit, Regler, Lehren). Einheit heißt NUR:
  unter derselben Seite läuft die Welt-Engine (r184/WebGPU, Welt-Stoffe, Foundry-Stufenkette, Licht-Gesetz) statt r128 — Profi-Muster
  UE Asset-Editor / Unity Prefab Mode; „in der Welt ansehen" ist ein Knopf über die Portal-Brücke. Ausnahme benannt: das Gelände-Studio
  (`index.html?studio=gelaende`), denn sein Werk IST der Weltboden. Der erste Versuch (S1 8a00562e, Garage als Modus in der offenen Welt)
  löschte die Seite und fiel per Revert 876feb6f. Am Ende fallen `worlds/terrain/lib/three-r128.min.js`, `cores.manifest.json:7 lib`,
  `bakeImpostorAtlas foundry-bruecke.js:246`, §4b und `LEGACY_LICHT`; der Foundry-Worker läuft als Modul auf `vendor/three.core.min.js`.
- Reihenfolge: garage (447 Z., F1) → fachwerk (1 029 Z., F4, Stadt) → portale (Membran, Vorschau) → schmiede → tetrapoda + koerperstudio (Bühne für Rudel und Verhalten, S6) → terrain (4 530 Z.) → Foundry-Worker.
- Fallen: Klasse haus Labor ≠ Welt · F4 im Studio unsichtbar · Licht im Studio nicht eichbar · F1c Chase ×2 · Tier-Labor-Gang · Membran ×2 · Impostor-Bäcker ×2 · Dorf ×2 + Paritäts-throw · Mauer nur im Studio · 4 Stamm-Bühnen · r128-Parse + sync-XHR im Worker · §4b/Ü2-Widerspruch · 5 three-Revisionen → r184 (+ fremde fluid-Sandbox benannt).
- Erster Schritt: `scripts/diag-studio-huelle.cjs` H6 „EINE Engine" (keine trusted Shell lädt `worlds/*/lib/three*` oder baut `new THREE.WebGLRenderer`) ROT bei 1/12; dann garage auf den Welt-Renderer, Chase aus dem Kern (8432627c).
- Beweis: H6 1/12 → 2/12 → …; derselbe GT unter derselben Pose im Studio und in der Welt über `scripts/lib/ausgabe-aufnahme.cjs`, Bild-Differenz ≤ 2,1 % (Rezept `bild-diff.cjs`, a626dd20); 0 Anfragen auf three-r128 im Netz-Log der Garage.

### S2 Der Richter steht außerhalb (W9)
- Inhalt: (a) die Soll-Tafel bekommt die Posen-Matrix des Spawns — jede Klasse × {Ego, Third, 30 m oben} × Uhr {0,25 · 0,5 · 0,75 · 0,0} am Genesis-Platz — und die Klassen fahrzeug (GT nah/fern, stehend/in Fahrt), tier (Herde wandernd/fliehend), dorf-stadt; (b) `diag-boot-stage` nimmt t aus der ersten angenommenen Eingabe + dem ersten Ausgabe-Bild, „halb" per bild-diff gegen das Rundum-Bild; (c) EIN Stand der Welt aus EINER Bedarfs-Tafel (Term × Offenes) für `_weltbildLuecken` und `_weltOffen`, ein Ruhe-Wort für Kreatur-Takt und Wasser-Automat — `tiereHalten` fällt.
- Dateien: `spec/abnahme/soll-tafel.json`, `scripts/lib/abnahme-urteil.cjs`, `scripts/diag-boot-stage.cjs:200/:277/:297`, `stamm/dirigent-ankunft.js:973`, `stamm/dirigent-takt.js:326-400`, `scripts/lib/welt-boot.cjs:41`, `stamm/kreatur-verhalten.js:3522`, `scripts/lib/ausgabe-aufnahme.cjs:432-451`.
- Fallen: Tafel nur Mittag · Genesis nur 3/12 Klassen · keine Klasse fahrzeug/tier/dorf-stadt · boot-stage liest `_weltbildDa` + WARN-Zeile · L2a gegen eigene Terme · `werkbank licht` liest die eigene Quelle · H4 nur Dreiecke · Band herde am neugierigen Bären · „steht" ×3 · `tiereHalten`-Patch · Fahrt-Linse meidet den Tor-Kreis.
- Erster Schritt: die Posen-Matrix des Genesis-Platzes in die Tafel, K5 am Kopf 419efefc auf der Radeon (`--echt`) — die Zahl GRÜN/gesamt ist die Ausgangszahl von A am Spawn.
- Beweis: K5-Zellen GRÜN/gesamt am Kopf (heute 3 Klassen am Spawn gemessen, an 1 Uhrzeit); Selbsttest: ein gefälschtes `_weltbildDa` ändert t(Kontrolle) nicht; die Zelle Uhr 0,25 steht ROT beim Namen (W7).

### S3 EIN Rang, freier Haupt-Faden (W5 + W6)
- Inhalt: EIN Rang-Datensatz je Auftrag (`_foundryRang`/`_foundryWahl`), gelesen von Pumpe UND Freigabe; Köpfe (Leib-L1, Dorf-Export) in eine leere Bahn; ortlose erben den Ort ihres Lesers; Detail wartet auf `_weltbildKommt`; nach dem Bild = Zeit bis zum Bedarf (Abstand entlang Fahrt ÷ Tempo) — derselbe Rang für Boden, Wuchs, Streu, Kreatur-Bake, Vorschau. Haupt-Faden: `Object.keys` statt for…in (`bild-kosten.js:3575`), Karten bis zur Frist über `_kappeOffen` (`stoff-instanz.js:413`), Ring unter dem Ladeschirm sofort am Existenz-Boden (`dirigent-regler.js:415-480`), die ~11 `_ladeTakt()`-Zweige über die EINE Kappe, Hydrosphäre im Worker vor dem ersten Chunk (`gelaende-boden.js:278-305`), Leib-Tor und Bau-Tor auf die Grobstufe (`koerper-leib.js:1392`, `studio-gestalt.js:851`).
- Fallen: B4/B5-Wartezeit · F5 · Pumpe ⇄ Freigabe · Rang ∞ · Rang-Schlüssel ×3 · Veg-FIFO · Boden-Chebyshev · Kreatur-Bake FIFO · Siedlungs-Export ohne Rang · Vorschau im 1-s-Takt · `_ladeTakt`-Stückelung · Leib-Tor L0+L1 · Hydrosphäre-Doppelbau.
- Erster Schritt: ankunft-takt ae9687d1 + b5-lieferung 5c2a0247 auf 419efefc rebasen, die drei echt-Rotpunkte von 4d5f1c0c (gate:ego-schatten, gate:foundry-impostor, Nah-Linse Selbsttest S) am exakten Kopf auf der GTX nachstellen, an der Wurzel schneiden, EIN Merge; dann fahrt-vorausschau als Leser desselben Rangs.
- Beweis: `diag-boot-stage --kalt --echt`, ≥ 4 Boots je Seite, GTX und Radeon: Weltbild kalt 16,6 s → Zahl, Leib 10,9 → 6,1 s (55fad226), Streu-Warten 7,91 → 0 s; F5: Lücken je Bild bei Höchsttempo im v1-Pfad. 5 s braucht zusätzlich die Platte für Blatt-Atlas, Dorf-Export und Karten (`studio-bruecke.js:488`); kein Teil allein erreicht 5 s.

### S4 EIN Grund-Datum aus dem Körper-Satz (W2)
- Inhalt: `fachwerk-core` exportiert je Haus `masse[]` als Box-Liste (Haupthaus, Anbau, Flügel, Hof, Turm) + Keller-Raum, im Slot UND in `userData.__huelle`; `gelaende-core` ERDBAU lernt `grund` (Platte aus allen Boxen) und `keller` (Hohlraum bis kellerY −2,40 m), Stamm-Dichte und Worker lesen ihn aus dem Kern; die Wege-Karte malt einen Kanal Bau aus denselben Boxen, Halm und Nah-Wiese × (1 − bau); EIN Grundriss-Leser, EIN Räumer; `confirmBuild` wird ein Ein-Slot-Ort (derselbe `ortPlan`); der Spieler-Boden liest `_koerperBodenUnter`.
- Dateien: `fachwerk-core.js:443/:455/:1192/:3430/:5377`, `gelaende-core.js:1318-1350/:1462`, `stamm/vegetation-baum.js:1719/:1828/:1937`, `stamm/siedlung-ort.js:1384`, `stamm/feld-leben.js:2101`, `stamm/gelaende-boden.js:855` + `voxel-worker.js:348`, `stamm/siedlung-satz.js` (`_wegeKarteMale`, `:1815`), `stamm/stoff-material.js:1981`, `stamm/werkstatt-bauen.js:364`, `stamm/koerper-bewegung.js:857-887`.
- Vorlage: wiese-im-haus 69498f91 (`_grundSchnitt`, 24/25 → 0 Häuser innen grün), gehoben in Kern und Worker statt `gelaende-chunks` im Haupt-Faden (Lehre 14).
- Fallen: Wiese im Haus · Wiese im Anbau · Gelände durch das Haus · Erde über der Diele · Keller · gesetztes Haus ohne Erdbau · Tier-Geburt im Anbau · Grundriss-Leser ×3 · `_ortFrei`-Kopie · Räumer ×2 · Grün-Wachen ×2 · Spieler-Boden-Zwilling.
- Erster Schritt: Linse aus dem Ausgabe-Bild (nicht aus `grundZeile`): Halm- und Büschel-Pixel innerhalb jeder Box des Körper-Satzes im Dorf — vorher ROT mit 119 Büscheln im Anbau.
- Beweis: Büschel im Grundriss 119 → 0 über alle Häuser inkl. Anbau; der Leib erreicht über die Treppe kellerY −2,40 m; Dichte > 0 über der Diele innerhalb der Platte → 0 Zellen; gate:settlement Plan-Hash neu geeicht (Vertrags-Akt, Lehre 11).

### S5 Das 3D-Gesetz von Boden und Wasser im Kern (W1)
- Inhalt: Kern-Funktionen `spalte(L,x,z,hydro)`, `dichte(L,x,y,z,spalte)` (Höhlen, `gewaesserForm`), `editKarte`/`editForm` (der hoch-bauen-Fix EINMAL im Kern); Wasser: HYDROSPHERE-Zahlen, `carveAt`/`lakeAt`, `waterLevelAt`, `schnittSpiegel`, Zell-Regel — EIN Spiegel je Spalte, Zellen/Automat/Sheet nur Leser, Seen aus `benannteSeen`; Stamm und Worker rufen den Kern, die Abschrift fällt im selben Commit; die Boden-Höhen tragen Rollen (Sichtbares → `_bodenSichtAt`, Leib → Feld, Ferne/Hydro → Gesetz) unter einer Ratsche.
- Dateien: `gelaende-core.js`, `stamm/gelaende-boden.js:914/:955/:985/:1029/:1122/:1153/:278-305`, `stamm/wasser-hydro.js:54/:196/:234/:760`, `stamm/wasser-zellen.js:136/:150/:2141`, `stamm/daten.js:166`, `voxel-worker.js:462-795/:1120/:2640/:3455`.
- Reihenfolge: Dichte → Edits (F2a) → Wasser (F3-Wurzel) → Hydrosphäre im Worker (mit S3).
- Fallen: F2a an EINER Stelle · F3 an der Wurzel · Wasser-Unruhe · Seen ×2 · Hydro-Zahlen ×2 · ~40 Spiegel-Funktionen · Fern-Ring/Hydro ohne Edits · Wasser-Urteile ×3 · worker-dichte blind · Hydrosphäre im Haupt-Faden.
- Erster Schritt: `spalte`/`dichte` in den Kern; `gate:worker-dichte` prüft Stamm = Kern und Worker = Kern; `_terrainColumnContextIn`/`terrainColumnContext` und `_terrainBaseDensityAtCol`/`terrainBaseDensityCol` fallen im selben Commit.
- Beweis: Spiegel-Marken in `voxel-worker.js` 117 → Zahl im Commit, −600 bis −1 000 Z.; `diag-worker-watersheet` maxDiff 0; ein Fill 60 m über dem Gelände trägt (heute toter Kegel ab 48 m); Automat-Takte in 60 s Ruhe → 0.

### S6 Die Funktion ins Gesetzbuch — Rudel · Mensch · Kamera · Stadt (W4)
- tetrapoda-core: `verbandZug` (Kohäsion + Ausrichtung + Leittier) neben `herdeZug :1591`, `rudelPlatz` aus `kreatur-verhalten.js:320-346`, `VERHALTEN.lebensraum` (Gattung × Boden-Klasse; Tags bleiben neutral, Lehre 8); der Wurf stempelt `verband` + Revier (`kreatur-leben.js:1572-1602`), der Zug läuft in Wander-, Flucht- und Neugier-Zweig, Flucht-Alarm über den Verband.
- koerper-core: Kapitel VERHALTEN in der Form von `tetrapoda-core.js:100-121`, der Katalog zieht aus `koerperstudio.js:28-30` um (Hash statt Math.random); `_tetrapodaVerhalten koerper-leib.js:2422` liest je Rezept-Kind. Darauf: Bewohner = Kreatur mit Menschen-Leib (`CREATURE_SOULS` + mensch, `_rollHumanoidGenome` getragen), die Siedlung exportiert `rolle`/`leute`/`tuer`, Wege über die vorhandene Wege-Karte.
- vehicle-core: `chaseKamera` (8432627c) + EIN `_kamRig` (`koerper-bewegung.js:1579`, `dirigent-kern.js:1185`, `koerper-fahrt.js:756/:808/:878`), Chase-Lage und Blickziel aus EINER Lage.
- fachwerk-core: `mauer` + `graph` reisen (`:5460-5467`), Mauer als Trasse im `ortPlan :5551`, `EPOCHEN.groesse` als nZiel (`:2857`), EINE Klemme statt vier (`siedlung-ort.js:1786`), SIEDLUNG mit Größen-Verteilung (`:2844`).
- Fallen: Rudel nur Jagd-Augenblick · Herde zerfällt · Flucht einzeln · Führung 0 · Fremd-Rudel verschmelzen · Lebensraum 0 · Mensch-Verhalten nur im Studio · Genom-Waise · Siedlung ohne Leute · F1b · Stadt-Export-Tor · Klemmen ×4 + tote `groesse`.
- Erster Schritt: der Wurf stempelt `verband` (`kreatur-leben.js:1602`), `herdeZug` läuft in Wander- und Flucht-Zweig; das Band herde misst an scheuen Hirschen beim Wandern und Fliehen (heute nur am neugierigen Bären) — vorher ROT.
- Beweis: Band herde Wander + Flucht: Anteil der Glieder binnen `fensterRaum` × Paar-Raum vom Verband-Mittel nach 60 s, vorher ↔ nachher; das Jagd-Band (drei Wölfe beißen den Hirsch in 60 s) hält; Stadt: eine Auto-Zelle mit Epoche moderne ergibt `groesse` stadt mit Mauer-Trasse, E-ABAB an dieser Stadt; Kamera: Azimut nach Ego→Third ≤ 10° binnen 10 Bildern (SG1-Linse).

### S7 EINE Tag-Achse, EIN Licht-Baustein (W7)
- Inhalt: eine Funktion der Sonnenhöhe, die Richtlicht-Fade, Ambient, Hemi, Nacht-Auge, Sterne und Belichtung lesen; Belichtung synchron aus `_atmoRechnung` (`bild-himmel.js:1272-1276`) statt `_skyEnvData`; am Übergang trägt der Himmel; EIN Belichtungs-Schreiber; Lambert/Umgebung/Pool EINMAL für Mesh, Feld, Panorama, Wasser. Rim + Nacht-Füll fallen mit e2485995.
- Dateien: `stamm/bild-himmel.js:1308/:1813/:1895/:1994/:2017/:2038-2057`, `stamm/bild-sicht.js:1077-1083/:1843-1851/:1896-1899`, `stamm/dirigent-ankunft.js:210`, `stamm/bild-kosten.js:699`, `stamm/siedlung-ort.js:351/:439/:667`.
- Fallen: schwarz um 6 und 18 Uhr · Tag-Achsen ×5 · Belichtungs-Schreiber ×3 · Lichtwege ×4 · Belichtungs-Unruhe · Tor-Ziel teilt durch fremde Belichtung.
- Erster Schritt: e2485995 einfädeln (OMEN-ABAB `auftrag/1810-omen-f6-abab.md`); die Zellen Uhr 0,25 und 0,75 am Spawn (S2) ROT.
- Beweis: Luma des Ausgabe-Bilds über die Uhr in 0,01-Schritten ohne Senke unter den Nacht-Wert zwischen 0,20 und 0,30; Absenz der vier Neben-Achsen als eigene Funktionen; Fichte-Karte nachts/Mittag 0,99 (e2485995) hält.

### S8 Die Stufe folgt der Gestalt (W8)
- Inhalt: Rezept `impostor {views, hebungen}` oder Hemi-Oktaeder 8×4 (Spike fern-von-oben ab86edc0: Ringe 0/40/80°), Bake vom Haupt-Faden weg; der Karten-Shader wählt nach der Hebung von `_lodAuge`; Albedo und Antwort je Art EINE Funktion für jede Stufe (L2-Ton aus derselben Bake-Rechnung); jede Slot-Liste eines Eintrags EIN Setzer, das gerittene Werk ohne Band (7348d7db); `_foundryPresetIsTree` heißt nach dem, was es prüft.
- Dateien: `foundry-core.js:715-719`, `stamm/stoff-instanz.js:576/:627-700`, `phyto-core.js:3381`, `stamm/stoff-material.js:1199-1220`, `fachwerk-core.js:1969-1999/:2612`, `stamm/siedlung-satz.js:2219/:2247`, `stamm/siedlung-bauten.js:384`, `stamm/studio-bruecke.js:1389/:3051`.
- Fallen: F2b · laub-kante · Haus L2/L0 · Birke/Karte dunkler als L1 · F1a · Wagen fern ohne Hebung · Namens-Lüge.
- Erster Schritt: 7348d7db (F1a) mit spielgang einfädeln; Albedo-Linse je Stufe (werkbank albedo L0/L1/L2/Karte) ROT am Haus L2.
- Beweis: laub-kante ≤ 0,22 an der Tafel-Pose (heute 0,2635); Haus L2/L0 0,788 → ≥ 0,9; VRAM ≤ 118 MB im ABAB (E); jede Stufe des Wagens ≤ 2 m an der Physik-Lage in Third.

---

## 5 Der ehrliche Stand

**Die Feature-Stopp-Frage ist beantwortet (Schöpfer 18.10.):** Stadt, Rudel und NPC sind kein neues Verhalten. Der Code bestätigt es: das Gesetz von
Weiler bis Metropole steht seit W-A5b im Kern (`fachwerk-core.js:2846-2857`, `:2982`, `:3043`), Rudel-Zahlen und Herden-Form stehen in
`tetrapoda-core.js:140-272/:1591`. Offen ist Konsum-Tiefe. Die zwei Kommentare, die das „neu" nennen (`fachwerk-core.js:5463-5464`,
`tetrapoda-core.js:1585`), fallen mit S6; die Übergabe-Zeile 13:30 „Feature-Stopp (Städte, NPCs, Rudel) liegt beim Schöpfer" ist erledigt.

### Stadt (Fachwerk, Dorf → Stadt)
| Teil | Stand | Beleg |
|---|---|---|
| Gesetz Weiler → Metropole im Kern | ~85 % | Straßengraph, Blöcke, Mauer + Tore, Vorstadt, Burg, Jahresringe, Downtown, Gewerbe, 6 Regionen × 9 Epochen (`fachwerk-core.js:2796-3272`) |
| Dorf in der Welt | ~70 % | PFLICHT C gefallen mit K10: Sockel 0 m, Türen 16/16, Plan-Hash Studio = Welt |
| Stadt in der Welt | 15–20 % | nur per nH 27..120 (DSL/Chat); ohne mauer/graph; Auto-Zelle 8..17; Metropole (≥ 141) unerreichbar (Klemme 120, `siedlung-ort.js:1786`); Epoche moderne ergibt ein Dorf |
| Stadt im Studio | sichtbar, mit Mauer | `fachwerk.js:335-342` — das Studio zeigt, was die Welt nie zeigt |
| Bauen (Spieler) | ~55 % | kein Erdbau, kein Vorplatz, Keller nie begehbar (S4) |
| Studio = Welt im Bild | ~40 % | Plan gleich, Bild-Pfad ×2, Klasse haus (S1) |
| E an einer Stadt | ungemessen | 120 Häuser = Befehle/Dreiecke; tragbar nur mit Bau-Satz + Stufe 3 |

### Rudel
| Teil | Stand | Beleg |
|---|---|---|
| Zahlen im Kern | steht | `VERHALTEN.jagd/furcht/herde/wurf` (`tetrapoda-core.js:140-272`) |
| Jagd im Rudel | ~60 % | Pirsch, Ring-Platz, „umstellt", Hetze; Band: drei Wölfe beißen den Hirsch in 60 s; es fehlen Rollen, Beute teilen, Fressen |
| Zusammenhalt | ~30 % | Wurf-Gruppen (Wolf 3–6, Hirsch 3–7) mit Anker; `herdeZug` nur im Neugier-Zweig |
| Flucht | ~40 % | jedes Tier für sich, kein Alarm, keine gemeinsame Richtung |
| Führung · Rudel-ID · Revier · Lebensraum | 0 % | grep leader/rudelId: 0; Art wählt das Rauschen |
| Studio für Verhalten | 0 % | `worlds/tetrapoda` formt nur Gestalt; Labor-Gang ist ein Zwilling |
| Kern der Klage | Takt-Emergenz statt Datum | die Entscheidungen stehen im Stamm (`kreatur-verhalten.js`), nicht im Gesetz — Wurzel W4, Schnitt S6 |

### NPC
| Teil | Stand | Beleg |
|---|---|---|
| Spieler-Leib | ~75 % | Gestalt aus dem Studio, EIN Gang-Gesetz, Seelenwechsel, Lebenswerte aus Tags; Spieler-Boden eigene Probe |
| Tiere als NPC | ~55 % | 4 Gattungen, Würfe, Jagd, Scheu, Biss, Tod; Aufträge nur auf Befehl; Gespräch nur mit LLM (`feld-nexus.js:1404-1418`); keine Wegsuche |
| Menschen-NPC | 0 % | koerper-core ohne VERHALTEN, `CREATURE_SOULS` ohne Menschen, Genom-Roller verwaist, kein Tagesablauf |
| Siedlung → Mensch | 0 % | Rollen, Größe, leute/wohl formen nur Häuser; Dörfer ohne Bewohner, Tiere halten Abstand (`kreatur-leben.js:1555-1561`) |
| Teile, die schon stehen | Verdrahtung, kein neues Lab | Kreatur-Takt, Menschen-Leib im Ofen, Gang-Gesetz, Rollen und Türen im Fachwerk, Wege-Karte — der Bewohner verbindet sie (S6) |

### Studio-Einheit (jedes Studio auf der EINEN Engine)
| Studio | three | Renderer | Kern | Modus |
|---|---|---|---|---|
| gelaende | r184 | Welt | gelaende-core | Modus der Welt-Engine — Vorbild |
| fachwerk | r128 | eigener WebGL, ACES 1,12 | fachwerk + gelaende | iframe |
| garage | r128 | eigener WebGL, ACES 1,04 | vehicle | iframe, eigene Chase |
| koerperstudio | r128 + Bloom | eigener WebGL | koerper, tetrapoda, foundry | iframe |
| portale | r128 + Bloom | eigener WebGL | porta | iframe, GLSL-Membran |
| schmiede | r128 + Bloom | eigener WebGL, ACES 1,06 | schmiede | iframe |
| tetrapoda | r128 + Bloom | eigener WebGL | tetrapoda, koerper, foundry | iframe |
| terrain | r128 + PointerLock | eigener WebGL, ACES | phyto, foundry | iframe, 4 530 Z. |
| klang | — | 2D-Canvas + AudioContext | klang | iframe |
| fluid · translated · skeleton | r183 · r130 · — | eigene | — | iframe |
| begegnung · schwarm | — | 2D, ohne Hülle | — | benannte Ausnahme |

EINE Engine: 1 von 12 trusted Studios (~8 %); Hüllen-UI 12/12; Foundry-Worker auf r128. Am Kopf erzwingt keine Wand die Einheit (H6 fehlt, S1).

### Genesis-Platz AAAA
| Teil | Stand | Beleg |
|---|---|---|
| Ort | steht | `GENESIS_PLATZ {ringR 11, rand 4}` `siedlung-ort.js:2557`, Mitte `_genesisMitte :1947`, Lichtung = Grundriss der Natur-Wand (`vegetation-baum.js:1871`) |
| Am Spawn sichtbar | Tor-Ring, 4 Vorschauen, Wiese, Wald, Fern-Ring | Vorschauen 8 m radial: Haus 49177 · GT 49178 · Esse 49179 · Portal 49180 (`siedlung-ort.js:2101-2110`) |
| A am Spawn gemessen | 3 von 12 Klassen | nur tor-fern, tor-bunt, tor-ziel (`soll-tafel.json:672/:902/:959`); boden-nah und laub an der Mess-Wiese, wasser am See 1816/−6168, haus am Dorf |
| A an den Tafel-Posen | 11/12 GRÜN (17.10.) | ROT laub-kante 0,2635 (seit S2b) — alles an Mittag-Posen, nie am Spawn × Uhr × Sicht |
| ROT erwartet, ungemessen | 4 Fälle | Dämmerung (W7), Karten von oben (W8), Haus L2/L0 0,788 (W8), Wagen in Third (W8) |
| Am Spawn ohne Tafel-Zeile | 4 Klassen | fahrzeug (GT), schmiede (Esse), tier, die Haus-Vorschau am Ring |
| Brüche am Spawn | F1d in integ offen | Tor/Wagen in der Fahrbahn (`siedlung-ort.js:2130/:2155`); Vorschauen außer dem Wagen ohne Platz-Gesetz |
| E am Spawn (GTX) | GPU-Seite hält, CPU-Takt an der Kante | Frame p95 16,7–16,8 ms, ≤ 191 Befehle, ≤ 587k Dreiecke, ≤ 104 MB (14.10.); CPU-Takt p95 Genesis Third 5,9 → 5,8 ms (Mittel 5,83, bericht/1710-e2.md) gegen Soll 5,8; Radeon-ABAB am Kopf aus |
| Ehrlich | 9 von 12 Klassen am Spawn ungemessen | „AAAA aus jeder Perspektive" hat am Spawn keinen Richter; S2 ist der erste Schritt |

---

## 6 Was die Karte NICHT weiß

- Domänen ohne eigene Karte: Klang (klang-core, Klang-Gesetz) · Schmiede (schmiede-core, Verb wield) · Portale/Tor als Domäne (porta-core, Membran, tor-ziele — nur über D7/D8 berührt) · KI-Pfad (`spawn_studio`, feld-dsl, LLM-Lauf = v1-Schritt 4) · Netz/P2P/Signaling · Speicher · Werkstatt-HUD · Uhr/Wetter als Spieler-Wort · Fell/Haar · Schatten-Kaskaden, Bündel und Diät im Spiel-Takt (der CPU-Takt von E ist hier nur über die Ankunft berührt) · Physik (`initPhysics`).
- Zweige nur aus Commit-Messages und Übergaben gelesen, nicht Zeile für Zeile: spielgang, b5-lieferung, fahrt-vorausschau, hoch-bauen, wiese-im-haus, fern-von-oben, mess-wiese; von nacht-fernfarbe nur der Rim/Füll-Diff in `stoff-material.js`.
- Ungemessen, nur nachgerechnet oder geschätzt: alle Prozente; das schwarze Bild um 6 Uhr (Konstanten, kein Bild); die Ursache Haus L2 21 % dunkler; der Siedlungs-Anteil an B (3–7 s Worker-Zeit); B auf der Radeon am Kopf; E-CPU-Takt am Kopf 419efefc.
- Unverifiziert: ob `massBau`-ext Anbau und Flügel umfasst; ob Feld- und Panorama-WGSL den Schatten liest; ob die Stimmungs-Schwellen in `MOTION_EMOTION_PROFILES` und `VERHALTEN.stimmung` gleich sind; ob der E2-Projektions-Stempel auch das Gefährt trägt; ob der Himmel um 6 Uhr selbst schwarz zeichnet.
- Gelesen wurde integ-probe 419efefc, nicht main f45ee994; Zeilenangaben verschieben sich mit jedem Merge.
- Der Prüf-Apparat (143 diag-*) ist gezählt, nicht einzeln gelesen; die Zahlen 72 Null-Renderer / 25 Pixel / 7 Frame-Zeit stammen aus einem Grep-Zensus.
- Kosten der Schnitte gegen E (VRAM je Hebung, Befehle einer Stadt, Ofen-Budget der Bewohner) sind benannt, nicht gemessen.
