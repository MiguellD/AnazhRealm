# Bericht 0710-11 — die Sekunden-Spitze der Boosts, die render-EWMA, die Haus-Tür (OMEN)

**Kopf: `welle-m-boosts` cce9da43** (auf `welle-m-brennglas` 3da7e286, Basis main 76c9624d), gepusht. CI: 34ccaeba grün, cce9da43 grün (5 von 5 Jobs).

**Geschnitten:**
- **Raum-Tags:** `computeSpatialTags` hat ein Gedächtnis je Bauplan. Sein Schlüssel ist ein Schnappschuss jedes Eingangs der Rechnung; so sieht er jeden Schreiber, ohne ihn zu kennen.
- **Ladeschirm:** Er fällt nach der Ankunft aus dem Layout.
- **Haus-Tür:** Der Tür-Takt scannt jede Sekunde über die Plätze statt alle 1 000 s über den Bestand.
- **Gegenprüfung 0710-10:** Die vier blinden Stellen der Brennglas-Linse sind scharf.

**Gemessen:**
- An der Wiese fällt die Boost-Spitze von 11,1/15,1 auf 0,4 ms; je Boost-Takt 8,41/8,85 → 0,17 ms.
- Die render-EWMA trägt zwei Ursachen: den unsichtbaren Ladeschirm (echt, −0,15 bis −0,25 ms, geschnitten) und den Takt-Zustand der CPU (Buchhaltung). Dieselbe feste Rechnung läuft 12–15 % langsamer, wenn der Takt davor leichter ist.
- Zeit-ABAB gegen V18.536 (8 von 8 Boots grün): CPU-Takt p50 voll 4,8 → 4,0 ms, p95 voll 7,3 → 6,0 ms (je −17 %), frei p95 7,2 → 5,6 ms (−22 %); die Spannen überlappen nicht. GPU, Band, Tiere und Hänger sind gleich.

**Ehrlich offen:**
- Die render-Phase trägt weiter den CPU-Zustand mit. Die Messfolge benennt das jetzt; ein Normieren je Frame braucht eine Kern-Frequenz, die die Seite nicht sieht.
- `_tickPortalMembranes` und `_hasMagnifyingInSight` bleiben benannt (0,08 / 0,10 ms).

| | |
|---|---|
| Commits | 63b62cf5 Raum-Tags · 80bde1e3 Ladeschirm + render-Wanduhr · 34ccaeba Brennglas-Linse + gate:takt · cce9da43 Haus-Tür |
| Zeit-ABAB | A main `76c9624d` (V18.536, `abab-b536`), B `cce9da43` (`abab-boosts`, LF); Instrument EINS aus B; Seiten-Wache :4312 A `ed9547d9…`, B `99f5a0e6…` |
| Rohdaten | `bericht/0710-11/`: Zeit-ABAB (je Boot Folge-JSON/Log, Hänger, Zerlegung, Band genesis, `auswertung.md`); `raum/` (ABBA der Raum-Tags, Wand vorher/nachher); `render/` (V1–V5 der render-EWMA); `gelb/`; die Skripte |

## 1. Die Sekunden-Spitze der Boosts: `computeSpatialTags` mit Gedächtnis (63b62cf5)

**Befund (0710-10):** `tickPlayerBoosts` rechnete je Sekunde die Raum-Tags jedes nahen Eintrags neu: 10 Rufe für 5 Baupläne, O(Teile²) Kontakt- und Hohlraum-Paare, Haselbusch 112 Teile 1,1 ms. Zusammen 8,3 ms je Boost-Takt, Spitze 10,3 ms. Dieselbe Rechnung fragen das Lofi-Pad (je Akkord), die DSL-Bedingung `compound_has_spatial_tag` und die Welt-Effekte.

**Schnitt:** Die unveränderte Rechnung heißt `_raumTagsRechnen`. `computeSpatialTags` ist das Gedächtnis davor: je Bauplan-Objekt (WeakMap) die Tags und der SCHLÜSSEL. `_raumTagSchluessel` erfasst je Teil Form, Stoff, Position und Größe, je benutztem Stoff seine Tags. Der Schlüssel wird bei jedem Ruf gebaut und Wert für Wert verglichen (`Object.is`). Je Ruf bekommt der Leser ein eigenes Objekt.

**Warum ein Inhalts-Schlüssel statt einer Schreiber-Liste:** Eine AST-Wand kann nicht beweisen, dass sie jeden Schreiber eines Bauplans findet. `part.position.x = …` sieht aus wie jede Mesh-Position. Das Laden eines Spielstands schreibt Stoff-Tags im Bestand (`entry.tags[k] = v`). `_bpEditTick` zählt `updatePartInBlueprint` nicht. Die AST-Wand beweist stattdessen das Gegenteil: Die Rechnung hat keinen Eingang außer denen, die der Schlüssel liest.

**Linse `gate:raum-tags`** (CI Gruppe 1, Selbsttest in `check`, 15 s):

| Wand | Ergebnis |
|---|---|
| (Q) AST | Aufrufbaum der Rechnung 10 Methoden: kein Zustand außer `state.materials`, kein Instanz-Feld; ihre 10 statischen Tabellen schreibt niemand außer der Definition; kein Leser ruft die Rechnung vorbei am Gedächtnis. Eingeschleuste Brüche fallen rot. |
| (L) Proxy-Linse über 64 Baupläne | Die Rechnung liest 25 Pfade, der Schlüssel dieselben 25, fehlend 0. |
| (O) Werkstatt-Sitzung, 18 Schritte am Klon von `baum_birke` | Verschieben, Stoff, Form, Farbe, Hinzufügen, Löschen, Undo, Undo, Redo; Position, Größe und Stoff-Tag direkt ohne API; `defineMaterial`; geladener Spielstand; neues Teile-Array; neues Bauplan-Objekt. Ergebnis: 0 Abweichungen. Nach jeder Änderung genau 1 Rechnung, bei der Farbe und jeder zweiten Frage 0. Dazu 65 Baupläne der Welt gleich. |
| (S) Zähne | Ein Schlüssel ohne Stoffe fällt beim direkt geänderten Stoff rot. |
| vorher | ROT: Der main-Code kennt kein Gedächtnis. |

**Zahl** (EINE Welt an der Wiese, `computeSpatialTags` live getauscht, A = Rechnung von main, B = Gedächtnis, ABBA, je 22 Boost-Takte):

| | 1A | 2B | 3B | 4A |
|---|---|---|---|---|
| ms je Boost-Takt | 8,41 | 0,17 | 0,17 | 8,85 |
| Spitze ms | 11,1 | 0,4 | 0,4 | 15,1 |
| `computeSpatialTags` Σ 22 Takte | 183,8 | 2,9 | 2,9 | 192,8 |
| Takt p95 ms | 2,2 | 1,6 | 1,6 | 1,8 |

In B fällt `tickPlayerBoosts` aus der Top-15 des Takts. **Die nächste Spitze an der Wiese ist `_loopAutoSave`** (max 11,9 ms, periodisches Speichern); benannt, nicht geschnitten.

## 2. Die render-EWMA (80bde1e3)

**Was sie misst:** die Wanduhr von `_loopShadowUpdate` + `_loopRender` je gerendertem Frame (anazhRealm.js:92395–92398; `_perfSenseLap("render")`, gefaltet in `_perfSenseFoldFrame` nur bei gerenderten Frames; der Regler und das HUD lesen sie).

**Was sich zwischen V18.535 und V18.536 im Render-Pfad änderte** (AST-Vergleich des Aufrufbaums ab `_loopShadowUpdate`/`_loopRender` und aller Methoden mit Renderer-Hüllen):

- `_loopRender` hat +2 Zeilen: `_ankunftsBild` bis zum ersten Weltbild, danach nur eine Feld-Prüfung.
- `_ensureLodUniforms` hat +2 Uniforms (`uKamZiel`, `uKamAuge`).
- Neu ist die Ankunfts-Kette.
- `_renderObjektRegister` hat 1 Zeile mehr.
- Neu ist `_renderObjekteLoesen` (Frost).
- In `index.html` kam der Ladeschirm dazu (+131 Zeilen).
- Keine Index-, GPU- oder Diät-Wache kam in den Takt dazu.

**Versuche in EINER Welt** (Werkbank an der Wiese, je Segment `lauf 20 s` voll, Render-Zähler in der Phase):

| Versuch | Segmente | render-Phase ms | Befund |
|---|---|---|---|
| V1 die Takte aus 0710-10 getauscht (A main, B Schnitt; Render-Pfad identisch) | 1A · 2B · 3B · 4A | 2,62 · 2,99 · 2,94 · 2,79 | B +0,26 ms ohne Render-Änderung; `getCurrentTexture` 0,04, `submit` 0,08 ms konstant |
| V2 Dosis: ms Rechnung im Takt vor dem Render | 0 · 0,8 · 1,6 · 0,8 · 0 | 2,87 · 2,77 · 2,70 · 2,79 · 2,94 | Mehr Last davor, kürzere Phase |
| V3 Ladeschirm wie er steht (A) gegen `display: none` (B) | A · B · B · A | 3,00 · 2,85 · 2,85 · 3,10 | Echte Kosten des unsichtbaren Overlays |
| V4 jede WebGPU-Methode in der Phase gehüllt (542 Rufe je Frame) | | API 0,63–0,72 · Rest 2,5–2,8 | Die Streuung liegt im JS-Rest, nicht in der API |
| V5 Tacho: feste Referenz-Rechnung am Anfang der Phase, Dosis 0 · 1,6 · 1,6 · 0 | | Referenz 0,129 · 0,110 · 0,114 · 0,128; Phase 2,86 · 2,71 · 2,75 · 2,79 | Dieselbe Arbeit läuft unter Last 12–15 % schneller: der Takt-Zustand der CPU |

Der Windows-Zähler `% Prozessorleistung` (mittelt über alle Kerne und je Sekunde) zeigt das nicht (152–158 % in allen Segmenten). Er sieht nicht den einen Hauptthread-Kern im Millisekunden-Fenster vor dem Render.

**Urteil:**

- **(a) Echt, geschnitten:** Der Ladeschirm blieb seit V18.536 nach dem Weichen im Layout. `#ladeschirm` setzt `display: flex`; das schlägt das `[hidden]` des Browsers, und anders als jedes andere Overlay fehlte die `[hidden]`-Regel. Ergebnis: Opacity 0, bildschirmfüllend, mit endloser Glut-Animation über der Leinwand. Schnitt: `#ladeschirm[hidden] { display: none; }`. Linse `gate:ankunft` L2a (9): vorher ROT „hidden true, display flex, 1 laufende Animationen“, nachher GRÜN.
- **(b) Buchhaltung, ehrlich benannt:** Der Rest ist der Takt-Zustand der CPU. Ein leichterer Takt lässt den Kern tiefer schlafen, und der Render-Burst danach läuft langsamer. `omen-messfolge` nennt die Zahl jetzt „render-Wanduhr (EWMA, mit CPU-Zustand)“ und verweist das Kosten-Urteil an gpu-bank, Band, Frame-Zeit und CPU-Takt (die Summe aller Phasen; die sank in 0710-9 und 0710-10).

## 3. Die Haus-Tür (cce9da43)

**Befund:** `_tickHausTueren` (anazhRealm.js:52018 vorher) bekommt `currentTime` in Sekunden und verglich mit `> 1000`. Die 40-m-Liste der Türen baute sich also nur alle 1 000 s neu. Ein Haus, das danach in die Nähe kam oder beim Scan noch kein Mesh trug, öffnete seine Tür bis zu ~17 min nicht. Der Koordinator nannte es einen Spiel-Bruch derselben Takt-Klasse und verlangte den Schnitt in dieser Welle.

**Schnitt:** ein Scan je Sekunde über die Plätze um den Spieler (`_blockerUmPlatz`, 40 m, in der Ordnung des Bestands).

**Linse `gate:brennglas-takt` (H):** wie ein Spieler zum Haus gehen, bis die Mesh-Zone es zeichnet; weit weg gehen (der Scan findet nichts); zurück vor die Tür, 2 s Frames. Das Haus steht in der Nähe-Liste und trägt sein Tür-Gedächtnis, die Liste ist der Filter über den Bestand.

- Vorher ROT: 0 von 1 Haus, und die Quell-Wand nennt die Bestand-Schleife; `_tickHausTueren` steht jetzt in ihren Takten.
- Nachher GRÜN: 1/1.

Ein eigener Fehler auf dem Weg: Die Probe merkte sich `st.playerMesh` am Anfang. Das Mesh wird aber während der Probe ersetzt, und die Probe bewegte eine Leiche. `stelle` liest es jetzt je Ruf frisch.

## 4. Die Gegenprüfung 0710-10 (34ccaeba)

| Punkt | Schnitt | Beweis |
|---|---|---|
| (1) halber Radius blieb grün | DAS FERNZIEL: ein fünftes Glas 5,9 m hinter einer Zellgrenze, ein gestreckter Baum (×1,5) 3,9 m daneben in der Nachbar-Zelle, Blocker nur am Stamm wie ein Studio-Baum im Spiel (über `_blockerStampReach`). Kopflos trägt jede Probe Blocker über den ganzen Körper (gemessen 3–16 m). | Mutation M1 (halber Radius) → 52 von 110 Tag-Schritten ROT plus FERNZIEL |
| (2) ohne Beweger grün | DER BEWEGER: fern gestempelt, in einen Brennpunkt getragen (`_blockerBewegt`) | Mutation M2 → 20 von 110 ROT plus BEWEGER |
| (3) Quell-Wand ließ Alias, forEach-Alias, verschachtelte und `userData`-Schreiber durch | Bindungs-Wand wie die Box-Wand: Bestand-Namen (Alias, `this.state`-Name, Destrukturierung, `\|\| []`, Kopie, Spread, Netz-Liste) und Ziel-Namen (`affordances`/`chimney`/`rauchQuelle`, auch verschachtelt; `userData`-Ersatz, der einen Kamin tragen kann; `Object.assign`/`defineProperty`/`delete`/`++`/Mutatoren); eine benannte Ausnahme (`_chunkSatzMesh`), die als tot rot fällt | Selbsttest: 22 Brüche rot, 3 harmlose grün. Am Code von main nennt sie 11 Stellen, auch den Alias `archs.filter` des alten Brennglas-Takts, den die alte Wand übersah. |
| (4) gate:takt T1/T2 vakuös | Das Brennglas ist ein Bauplan, der bündelt (am Mittag ≥ 1 Brennpunkt, sonst bricht die Linse ab); alle Spawns `silent`; T2 verlangt 10–30 Rufe | Alte Wand: T2 mit 0 Rufen grün. Neu: 30 Rufe (`start_plattform`, 1 Brennpunkt); der Selbsttest macht T1 mit 3 020 Rufen rot. |

**Gelb** (an der Wiese, Bestand 1 584, je 50 Rufe):

- `_tickPortalMembranes`: 0,08 ms je Sekunde (max 0,3).
- `_hasMagnifyingInSight`: 0,10 ms je Z-Taste (max 0,5).
- `_tickHausTueren`: Scan 0,04 ms, jetzt geschnitten (Abschnitt 3).

## 5. Zeit-ABAB gegen V18.536

**8 von 8 Boots waren im ersten Versuch grün, keiner wurde verworfen.** Beide Seiten halten dieselben Züge: Wetter `rule:nexus→rainy` 17 und `nexus→rainy` 2, dazu 14 Welt-Akte des Nexus je Boot. Serie 17:43–18:32, A `ed9547d9…`, B `99f5a0e6…`.

| Größe | A (V18.536) | B (cce9da43) | B − A |
|---|---|---|---|
| CPU-Takt p50 voll | 4,8 (4,6–4,8) | 4,0 (3,9–4,1) | −0,8 (−17 %) |
| CPU-Takt p95 voll | 7,3 (7,2–7,3) | 6,0 (5,8–6,1) | −1,3 (−17 %) |
| CPU-Takt p50 frei | 4,3 (4,1–4,4) | 3,6 (3,5–3,7) | −0,7 (−17 %) |
| CPU-Takt p95 frei | 7,2 (6,8–8,5) | 5,6 (5,4–5,8) | −1,6 (−22 %) |
| fps voll / frei | 58,5 / 63,5 | 58,5 / 64,0 | 0 / +0,5 |
| Frame p50 / p95 voll | 16,7 / 25,0 | 16,7 / 25,0 | gleich (alle 8 Boots am 120-Hz-Raster) |
| Frame max voll | 38 (33–42) | 33 (25–33) | −4 |
| Frame p95 frei | 16,9 | 16,8 | −0,1 |
| creatures-EWMA voll | 0,81 | 0,73 | −0,08 |
| render-EWMA voll / frei (Wanduhr mit CPU-Zustand) | 2,76 / 3,19 | 3,13 / 3,53 | +0,36 / +0,33 |
| gpu-bank Gier 0 / −0,88 (GPU ms) | 15,59 / 14,07 | 15,60 / 14,04 | gleich |
| Band Wiese: Befehle · Dreiecke · VRAM | 90 · 764k · 122,3 MB | 90 · 763k · 122,3 MB | gleich |
| Band genesis (beide ROT, Punkt E) | 90 · 787k · 141,4 MB · 16,24 ms | 90 · 787k · 141,0 MB · 16,51 ms | gleich |
| Tiere gesamt / im Sichtkegel | 11 / 1 | 11 / 1 | gleich |
| Hänger > 100 ms je 30 s | 0 | 0 | gleich |
| Hänger-Sitzung Frame max | 38 (33–42) | 29 (25–50) | −8 |

**Profil** (Median über 4 Boots):

- `(idle)` steigt von 34,8 auf 46,8 % der Selbstzeit.
- `_tickFocusingAffordances` (2,7 %), `_updateDorfRauch` (2,3 %) und `tickAffordances` (2,5 %) fallen aus der Top-10.
- In der Gesamtzeit fallen `tickAffordances` 9,9 → 0,0 % und `tickPlayerBoosts` 1,1 → 0,0 %.
- `_loopRender` steht bei 17,8 → 18,9 %; das ist die CPU-Zustands-Buchhaltung aus Abschnitt 2.

**Die render-EWMA steigt auch hier** (+0,36 ms), obwohl B den Ladeschirm-Schnitt trägt und A den unsichtbaren Ladeschirm (−0,15 bis −0,25 ms in V3). Der um 0,8 ms leichtere Takt wiegt schwerer; das ist dasselbe Muster wie in V1 und V2.

## Wände

Je Commit seriell auf den Ports 7905–7909, der volle Playtest je Commit „Alle Invarianten OK“:

- **63b62cf5:** raum-tags (vorher ROT), brennglas-takt, takt, werkstatt-weg, klang-zensus, nervensystem-labs, nervensystem-schmiede, playtest:fast, playtest voll, check/lint/format.
- **80bde1e3 + 34ccaeba:** brennglas-takt, raum-tags, takt, ankunft, kreatur-takt, blocker-netz, v1-pfad, playtest:fast, playtest voll, check/lint/format.
- **cce9da43:** brennglas-takt (Quell-Wand und (H) vorher ROT), haus-welt, settlement, portal-gestalt, playtest:fast, playtest voll, check/lint/format.

**CI:**

- 63b62cf5: Gruppe 2 `gate:kreatur-takt` rot, an der Probe „gier“ (Stand-Schlupf 0,217 gegen ≤ 0,2). Lokal 3/3 grün; laut Koordinator ein Grenzwackler des CI-Läufers; Neustart angestoßen, dann von 34ccaeba überholt.
- 34ccaeba: grün.
- cce9da43: grün (5 von 5 Jobs).

## Offen

1. **Die render-Phase trägt den CPU-Zustand mit** (Buchhaltung, benannt).
2. **`_loopAutoSave` ist die nächste Takt-Spitze an der Wiese** (max 11,9 ms, periodisch).
3. **`_tickPortalMembranes` und `_hasMagnifyingInSight`** bleiben benannt.
4. **0710-12 (Schatten-Bias)** ist gesehen und folgt.
