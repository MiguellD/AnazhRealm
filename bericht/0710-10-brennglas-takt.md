# Bericht 0710-10 — der Brennglas-Takt und seine Klasse über die Nachbarschaft (OMEN)

**Kopf: `welle-m-brennglas` 3da7e286** (Basis main 76c9624d, V18.536), gepusht, CI grün (5 von 5 Jobs, der neue Schritt in Gruppe 2).

**Geschnitten:** Der Brennglas-Takt fasst nur noch die Plätze um seine Gläser und die warmen Einträge an. Die Klasse liest ein Verzeichnis je Name oder die Plätze um den Spieler. Die Klasse sind Strahlen, Balancieren, Heben, Portal, Dorf-Rauch, Boost-Resonanz und Lofi-Pad. Keiner dieser Takte läuft mehr über `state.architectures`.

**Gemessen:** An der Wiese fällt der Brennglas-Takt von 1 578 Einträgen je Takt auf 1. In einer Welt (ABBA) fällt `tickAffordances` von 0,72/0,75 auf 0,04/0,04 ms. Über Boots (ABABABAB gegen V18.536) fällt der CPU-Takt p50 voll von 4,6 auf 3,9 ms (−15 %) und frei von 4,3 auf 3,5 ms (−18 %); die Spannen überlappen nicht. GPU, Band, Tiere und Hänger sind gleich.

**Ehrlich offen:** `tickPlayerBoosts` bleibt gleich teuer. Seine Kosten sind nicht die Schleife, sondern `computeSpatialTags` ohne Gedächtnis: 8,3 ms einmal je Sekunde an der Wiese, benannt und nicht geschnitten (unten).

| | |
|---|---|
| A | main `76c9624d` (V18.536), Worktree `abab-b536` |
| B | `welle-m-brennglas` `3da7e286`, Worktree `abab-glas` (LF) |
| Instrument | EINS: `omen-messfolge.cjs` + `werkbank.cjs` + `scripts/lib` aus B |
| Seiten-Wache | save-server :4312, Hash vor jedem Boot: A `ed9547d9…`, B `21f27fbd…` |
| Serie | 15:15–16:03, GTX 1060, 1920×1080, Ruhe hergestellt (keine eigenen Prozesse) |
| Rohdaten | `bericht/0710-10/`: je Boot Folge-JSON und Log, Hänger-JSON, Zerlegung, Band genesis, `auswertung.md`, `serie.sh`, `auswertung.cjs`. Dazu `abba/` (eine Welt, Takte getauscht) und `werkbank/` (Klassen-Messung auf main, Raum-Tags, Wand vorher/nachher). Die rohen Hänger-Profile liegen am OMEN in `Desktop\AnazhRealm-OMEN\abab0710-10`. |

## Befund (Werkbank an der Mess-Wiese, main 76c9624d, Sonne, 600 Takte)

Der Brennglas-Takt durchlief je Takt 1 578 Einträge, für EIN Brennglas mit EINEM Brennpunkt. Er rechnete dabei 0 Tags und machte 0 Brennpunkt-Proben. Die ganze Zeit (0,34 ms je Takt) war die Schleife.

Dieselbe Klasse (Schleifen über `state.architectures` im Frame-Takt) trug etwa 1,0 ms von 1,6 ms Takt-p50:

| Takt | Mittel / max ms je Takt (main) | Was er über den Bestand tat |
|---|---|---|
| `tickAffordances` (Summe) | 0,65 / 1,8 | die fünf Affordanz-Takte |
| `_tickFocusingAffordances` | 0,34 / 1,2 | jeder Eintrag gegen jedes Glas |
| `_tickRadiatingAffordances` | 0,08 / 0,4 | zwei Filter je Frame (Strahler, Masten) |
| `_tickBalancingAffordances` | 0,08 / 0,3 | ein Filter je Frame |
| `_tickLiftingAffordances` | 0,08 / 0,8 | ein Filter je Frame |
| `_tickPortalAffordance` → `_findNearestAffordanceEntry` | 0,07 / 0,2 | jeder Eintrag je Frame |
| `_updateDorfRauch` | 0,19 / 2,5 | jeder Eintrag je Frame auf einen Kamin |
| `tickPlayerBoosts` (Resonanz) | 0,16 / 9,2 | jeder Eintrag je Sekunde gegen den Spieler |
| `_lofiNearResonantArchitecture` | – (nur mit Klang) | jeder Eintrag je Akkord gegen den Spieler |

Benannt und nicht geschnitten:

- `tickArchitectures`: 0,04 ms. Er hängt am Mesh-Bestand, nicht an einer Schleife je Eintrag.
- `tickArchitectureCulling`: steht unter der Stand-Wache.
- Die übrigen Bestand-Schleifen: unter 0,04 ms je Takt (Messung `werkbank/klasse-main-takt.json`).

## Schnitt

- **Das Verzeichnis.** Die Nachbarschaft `_blockerNetz` trägt je Name die Einträge, die ihn tragen. Namen sind jeder wahre Affordanz-Schlüssel und „rauch“ (`userData.rauchQuelle` oder `chimney`). Gestempelt wird mit Platz und Zellen (`_blockerNetzSetzen`), gelöst beim Austritt. `_blockerMit(name)` gibt die Liste in der Ordnung des Bestands und ist gecacht, bis sich der Name regt. `setBlueprintAsPortal` stempelt, nachdem es die Affordanzen nachgezogen hat.
- **Der Brennglas-Takt.** Er nimmt die Plätze um jedes Glas (`_blockerUmPlatz`, Reichweite + 1e-6) und die warmen Einträge (`warm`), sortiert nach Bestand, ohne Doppel. Der Rumpf ist unverändert. Die warme Menge reist über jeden Neubau, und jeder Stempel trägt einen warmen Eintrag ein (Wiedereintritt). Hitze schreibt nur dieser Takt (Quell-Wand).
- **Die Klasse.** Strahlen, Balancieren, Heben, `_findNearestAffordanceEntry` und Dorf-Rauch lesen das Verzeichnis. Die Boost-Resonanz und das Lofi-Pad lesen die Plätze um den Spieler, in der Ordnung des Bestands; der erste resonante Eintrag gewinnt wie vorher.

## Linse: `gate:brennglas-takt`

Die Wand steht in CI Gruppe 2, ihr `--selftest` in `npm run check`; sie läuft 16 s. Null-Renderer, eine echte Welt mit 3 Dörfern, 4 Gläsern und Brennbarem in ihren Brennpunkten.

| Wand | vorher (main-Code) | nachher (3da7e286) |
|---|---|---|
| (T) Tag, Orakel = alter Takt im Wortlaut, 110 Schritte (Morgen, Mittag, Regen und Sturm, Mittag, Nachmittag, Abend, Nacht; Abriss eines warmen Eintrags, neues Array, neue Ziele mitten im Tag) | 0 Abweichungen | **0 Abweichungen** (Hitze je Eintrag `Object.is`, Sätze, Journal, Feuer) bei 303 Erwärmungen, 17 Glimmen, 11 Zündungen, 70 Abkühlungen |
| (A) Arbeit je Brennglas-Takt | **ROT**: angefasst 98,8 bei 17,2 Betroffenen, in 110 von 110 Takten | angefasst 12,4 bei 17,2 Betroffenen (Bestand 98,8); Wolken 1,0, Nacht 1,4 |
| (V) Verzeichnis = Filter über den Bestand (nach Tag, Dorf, Abriss, Tor gesetzt, Tor nachgezogen focusing → isPortal, neuem Array) | **ROT**: kein Verzeichnis | 0 Fehler, 9 Namen |
| (R) Plätze um den Spieler (300 Proben, 18 m und 24 m) | gleich | 0 Abweichungen |
| (D) Dorf-Rauch: 38 Quellen gleich der Schleife | gleich | gleich |
| (Q) Quell-Wand (AST): keine Bestand-Schleife in der Klasse; Schreiber von Affordanzen und Kaminen stempeln; Hitze nur im Brennglas-Takt | **ROT**: nennt 9 Stellen beim Namen | grün; der Selbsttest lässt 5 eingeschleuste Brüche rot fallen |

## Zahl 1: EINE Welt an der Wiese (ABBA, Takte live getauscht)

Bestand 1 578, Sonne. A = die 7 Takte aus main `76c9624d`, B = der Schnitt. Je Segment `takt 600` und `lauf 20` (voll).

| Größe | 1A | 2B | 3B | 4A |
|---|---|---|---|---|
| Einträge je Brennglas-Takt (Zähler) | 1 578 | 1 | 1 | 1 578 |
| Takt p50 / p95 ms | 1,7 / 3,0 | 0,9 / 2,8 | 0,9 / 3,4 | 1,8 / 3,6 |
| `tickAffordances` ms | 0,72 | 0,04 | 0,04 | 0,75 |
| `_tickFocusingAffordances` ms | 0,35 | 0,02 | 0,02 | 0,35 |
| `_updateDorfRauch` ms | 0,19 | < 0,01 | < 0,01 | 0,19 |
| Strahlen · Balancieren · Heben · Portal · Nächster ms | 0,10 · 0,10 · 0,10 · 0,07 · 0,06 | je < 0,01 | je < 0,01 | 0,11 · 0,10 · 0,11 · 0,07 · 0,07 |
| `tickPlayerBoosts` Mittel / max ms | 0,18 / 10,3 | 0,20 / 12,7 | 0,19 / 13,2 | 0,19 / 11,2 |
| CPU-Takt p50 / p95 ms (lauf voll) | 4,5 / 5,9 | 3,7 / 5,1 | 3,7 / 5,1 | 4,5 / 6,0 |
| Frame p95 ms | 17,0 | 17,3 | 24,9 | 16,9 |

## Zahl 2: Zeit-ABAB gegen V18.536 (ABABABAB, je 4 Boots, Median und Spanne)

**8 von 8 Boots waren im ersten Versuch grün, keiner wurde verworfen.** Beide Seiten halten dieselben Züge: Wetter `rule:nexus→rainy` 17 und `nexus→rainy` 2, dazu 14 Welt-Akte des Nexus je Boot.

| Größe | A (V18.536) | B (3da7e286) | B − A |
|---|---|---|---|
| CPU-Takt p50 voll | 4,6 (4,4–4,7) | 3,9 (3,9–4,1) | −0,7 (−15 %) |
| CPU-Takt p95 voll | 6,8 (6,5–6,9) | 5,9 (5,8–6,3) | −0,8 (−13 %) |
| CPU-Takt p50 frei | 4,3 (4,2–4,3) | 3,5 (3,5–3,7) | −0,8 (−18 %) |
| CPU-Takt p95 frei | 6,5 (6,4–6,8) | 5,7 (5,6–5,9) | −0,8 (−13 %) |
| fps voll / frei | 58,9 / 63,9 | 59,8 / 66,9 | +0,9 / +3,0 |
| Frame p50 voll | 16,7 | 16,7 | 0 |
| Frame p95 voll | 24,9 (16,9–25,0) | 20,9 (16,9–25,0) | −4,0 (120-Hz-Raster: A 3 von 4 Boots auf 25, B 2 von 4) |
| Frame p95 frei | 16,9 | 16,8 | −0,1 |
| gpu-bank Gier 0 / −0,88 (GPU ms) | 15,39 / 13,93 | 14,41 / 13,14 | −6 % / −6 % |
| Band genesis: Befehle · Dreiecke · VRAM · GPU | 90 · 781k · 140,9 MB · 16,19 | 91 · 787k · 141,9 MB · 15,56 | gleich (beide BAND ROT wie in 0710-9, Punkt E) |
| Band Wiese: Befehle · Dreiecke · VRAM | 90 · 764k · 122,3 MB | 90 · 762k · 122,3 MB | gleich |
| Tiere gesamt / im Sichtkegel | 11 / 1 | 11 / 1 | gleich |
| Hänger > 100 ms je 30 s | 0 | 0 | gleich (max 33–42 ms) |
| render-EWMA voll / frei | 2,67 / 3,59 | 3,08 / 4,18 | +0,41 / +0,58 (Deutung unten) |

**Profil** (Selbstzeit, Median über 4 Boots):

- `(idle)` steigt von 36,2 auf 46,0 %.
- `_tickFocusingAffordances` (2,7 %), `_updateDorfRauch` (2,3 %) und `tickAffordances` (2,3 %) fallen aus der Top-10.
- In der Gesamtzeit fällt `tickAffordances` von 9,4 auf 0,0 %, `_updateDorfRauch` von 2,3 auf 0,0 %.
- `tickPlayerBoosts` bleibt bei 1,1 %.

**render-EWMA steigt auf B, wie schon in 0710-9** (+0,31 voll bei −26 % CPU). Die GPU-Arbeit ist gleich oder kleiner (gpu-bank −6 %, Frame p50 gleich, Band gleich). **Deutung (nicht belegt):** Endet der Takt früher, wartet die Render-Phase länger auf die Bildkette. Wenn das als Kosten gezählt werden soll, braucht es eine eigene Linse.

## Wände

Alle grün, seriell auf den Ports 7905–7909:

- check, lint (3 alte Warnungen), format:check
- brennglas-takt (vorher ROT, nachher GRÜN), blocker-netz, settlement, haus-welt
- portal-gestalt, portal-membran, portal-boot, portal-konformanz
- takt, werkstatt-weg, v1-pfad, klang-zensus
- playtest:fast, voller playtest („Alle Invarianten OK“, zweimal: vor und nach dem Lofi-Schnitt)

CI auf `3da7e286`: check, erst-zeichnung und playtest 1/3, 2/3, 3/3 sind grün.

## Offen

1. **`computeSpatialTags` hat kein Gedächtnis** (Lehre 25: teure Rechnung, die nicht an einer Änderung hängt).
   - **Messung an der Wiese:** Je Boost-Takt (1×/s) laufen 10 Rufe für 10 nahe Einträge, aber nur 5 Baupläne: Haselbusch mit 112 Teilen kostet 1,1 ms je Ruf, die Bäume mit 80 Teilen 0,6 ms. Zusammen sind das 8,3 ms je Boost-Takt, Spitze 10,3 ms, also eine CPU-Spitze jede Sekunde (`werkbank/raum-tags-wiese.json`).
   - **Weitere Rufer:** das Lofi-Pad (je Akkord), die DSL-Bedingung `compound_has_spatial_tag` und die Welt-Effekte.
   - **Warum nicht in dieser Welle:** Der Schnitt braucht einen Inhalts-Schlüssel. Er muss die Teile auch bei direkter Änderung in der Werkstatt abdecken und `state.materials`, weil `defineMaterial` zur Laufzeit wirkt. `_bpEditTick` taugt nicht, denn `updatePartInBlueprint` zählt ihn nicht. Dazu braucht es eine eigene Orakel-Wand über alle Bearbeitungswege.
   - **Vorschlag:** ein Gedächtnis je Bauplan, Schlüssel = Inhalt der Teile + Tags der benutzten Stoffe, Orakel = die Rechnung ohne Gedächtnis.
2. **render-EWMA steigt auf B** (siehe oben), ohne höhere GPU-Arbeit. Die Deutung ist nicht belegt.
3. **Band genesis ist auf beiden Seiten ROT** (Dreiecke 1,16×, VRAM 1,2×), unverändert seit 0710-9. Das ist Punkt E, nicht diese Welle.
