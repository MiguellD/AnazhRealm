# Bericht 0710-7 — Nexus-Dorf, Welt-Halt, die Nachbarschaft der Blocker (OMEN, welle-m-nexus)

**Zwischenstand.**
- **Geschnitten:**
  - (1) Ein Nexus-Dorf dreht den Blick nicht mehr, ein verlangtes Dorf schaut auf SEIN Dorf.
  - (2) Die Mess-Bühne hält jeden DSL-Welt-Akt an der EINEN Engstelle `dslEval` und nennt ihn. Die Mess-Folge prüft das als Wache WELTAKT.
  - (3) Der Struktur-Strahl und der Struktur-Löser (Kapsel, Wagen-Hülle) fragen die Nachbarschaft der Blocker statt des Umkreises, byte-gleich.
- **Gemessen** (Zeit gegen V18.535, ABABABAB, 8/8 grün im ersten Versuch):
  - CPU-Takt p50/p95 voll 6,4/9,3 → 4,5/6,7 ms
  - Frame p95 voll 25,0 → 16,9 ms
  - fps voll 55,8 → 64,0
  - im Profil `_loopCamera` 20,0 → 1,6 % und `_segmentAABB` 8,8 → 0,0 %
- **Offen:**
  - CI 91c44f0f, Gruppe 3, Schritt 40 `gate:fernwald` rot. Lokal 3 von 3 grün, die übrigen Gruppe-3-Schritte lokal siehe unten. Das Log braucht Admin-Rechte, Rerun und Log bitte über dich.
  - Der Tier-Leib baut seine Nähe-Liste weiter aus dem ganzen Bestand.

| | |
|---|---|
| Branch | `welle-m-nexus` auf main `c966b9c3` (V18.535) |
| Kopf | **`91c44f0f`** |
| Commits | `2f385609` (1), `e0983fa6` (2), `7c1bd6f2` (3, Strahl), `91c44f0f` (3, Kapsel und Hülle) |
| Voller Playtest auf 91c44f0f | „Alle Invarianten OK" (150 s) |
| CI e0983fa6 (37731438978) | grün; trägt (1) und (2) |
| CI 2f385609, 7c1bd6f2 | vom nächsten Push abgelöst |
| CI 91c44f0f (37735846276) | check, erst-zeichnung, playtest 1/3 und 2/3 grün; 3/3 rot an Schritt 40 `gate:fernwald` nach 28 s |

Zum roten Schritt:
- Auf e0983fa6 lief derselbe Schritt grün (33 s).
- Lokal auf 91c44f0f lief er dreimal grün (A–D2, T, P). Die Bäume der Karten-Zone, 526 von 526, tragen ihre Gestalt; D: Slots gleich, 0 Takte ohne Gestalt.
- Die 21 danach übersprungenen Schritte der Gruppe 3 liefen lokal auf 91c44f0f, Ports 7900–7909, alle 22 grün (`p3/waende-g3rest.sh`): fernwald (4. Lauf), luft-sicht, asset-inventory, place-policy, vehicle-drive, garage-labor, kampf-gefuehl, gegenstand-stoff, nervensystem-fachwerk, fachwerk-contract, studio-begehen, tier-gang, daten-contract, foundry-crossfade, v1-pfad, wasser-leben, gpu-lens, analog-nah, kamera-treue, wasser-leben:bild, look-lens, look-golden.

## (1) SPIEL — das Dorf, das niemand verlangt hat, dreht den Blick nicht

**Befund** (0710-6, Boot 4B):
- Der Nexus setzt `spawn_village` autonom. `spawnSettlement` rief danach immer `_nachDorfOrientieren`, und die Gier sprang mitten im Lauf auf −2,745.
- Auch das verlangte Dorf zielte falsch: Die Ausrichtung ging auf den Schwerpunkt ALLER Häuser der Welt.

**Schnitt** (`2f385609`):
- Die Absicht reist als Quelle: `verlangt` ist die DSL-Quelle, der Chat-Befehl „dorf" ist `human`.
- EINE Prüfung `_spielerVerlangt` erkennt den Spieler: `human` und `llm:*`, den Begleiter, der den Satz des Spielers ausführt. Nexus, Welt-Regeln, Resonanz und Mitspieler handeln für die Welt.
- `_spawnSettlementFromExport` meldet die Mitte der gesetzten Häuser. `_nachDorfOrientieren` richtet den Blick nur für den Spieler und auf diese Mitte.
- Kein Flag-Zwilling: `autonomous` bleibt die Nexus-Kappe.

**Linse** gate:settlement C7: an drei Orten ein Nexus-Programm, das Chat-Programm des Spielers und der Befehl „dorf 4714 8". Gemessen wird die Gier gegen den Schwerpunkt der eben gesetzten Häuser.

| Fall | c966b9c3 (ROT) | nach dem Schnitt |
|---|---|---|
| Nexus-Dorf (11 Häuser) | Gier um 1,81 rad gedreht | Gier unverändert |
| Chat-Programm | 0,53 rad neben dem eigenen Dorf | 0,000 rad |
| „dorf" | 1,50 rad neben dem eigenen Dorf | 0,000 rad |

## (2) MESSUNG — die Bühne hält die Welt

**Befund** (0710-6, verworfene Boots): Die Bühne hielt nur das Wetter. Jeder andere Zug lief durch:
- Nexus-Dorf, Tiere at_player, Würfel auf Größe und Tempo aller Tiere
- Tageszeit, Himmel, Lauf- und Sprungkraft

Die Quellen waren Nexus, Emotion, Welt-Regel, Mensch, Mitspieler und verzögerte Programme. Alle laufen durch EINE Engstelle: `dslEval`.

**Schnitt** (`e0983fa6`):
- `AnazhRealm.DSL_WELTAKTE` (50 Ops) und EIN Halt `_messHalt` – dieselbe eingefrorene Uhr wie der Wetter-Halt; `_setWeather` liest ihn jetzt auch.
- `dslEval` verweigert unter dem Halt jeden Welt-Akt und bucht ihn (`_weltaktGehalten`, Op und Quelle).
- Im Spiel zählt die Uhr von 0 aufwärts und wird nie gespeichert. Das Spiel bleibt, wie es ist.

**Mess-Seite:**
- Der Welt-Akt-Spion `__weltaktSpion` (die Bühne setzt ihn) hört an `_weltaktGehalten` mit und hüllt jeden Welt-Akt der Effekt-Tafel. Läuft einer unter dem Halt trotzdem durch („durch"), ist er der Täter, mit Quelle und Stapel.
- `weltaktUrteil` ist rein und hat einen Selbsttest.
- Die Werkbank `/wache` liefert das Buch (`seitWelt`).
- Die Mess-Folge prüft es ab der Bühne als **Wache WELTAKT**. Selbsttest: Nexus-Dorf rot beim Namen, Verweigerung grün, blinder und fehlender Spion rot.

**Linse** gate:weltakt-wache (neu, CI-Gruppe 2):
- (H) Sechs Wege unter der Bühne: Die Welt steht, 17 Züge werden beim Namen verweigert.
- (S) Ein Akt an `dslEval` vorbei fällt rot.
- (F) Ohne Halt wirkt das Spiel wie immer.
- (Q) Jeder der 72 Ops hat ein Urteil (Welt-Akt oder benannt frei). Der Nexus komponiert nur beurteilte Ops (23, gesampelt aus Atom, Programm und Regel). Bei dieser Klassifikation fiel `set_visible` als Welt-Akt auf; es blendet Gelände oder Tiere aus.

Auf 2f385609 ROT mit den Tätern:

| Ops | Quelle | Stapel |
|---|---|---|
| `spawn_village`, `spawn_creature`, `creatures_size_mul`, `creatures_speed_mul`, `time_of_day`, `player_speed`, `skybox_color` | `nexus` | `dslEval ← … ← dslRun ← _loopNexusUpdate` |
| `creatures_speed_mul` | `emotion:chaos` | |
| `spawn_creature` | `rule:human` | |
| `spawn_tree` | `llm:grok` | `dslTick` |

**In der Zeit-Serie** hielt die Wache auf jedem B-Boot echte Nexus-Züge mitten in der Messung:

| Boot | Verweigerte Züge |
|---|---|
| 2B | Sprung- und Lauf-Kraft, Tempo-Würfel, ein Fraktal |
| 4B | `spawn_creature`; 23 × `rule:nexus → spawn_creature`; Tageszeit; Himmel |
| 6B | Tempo-Würfel, Farbe |
| 8B | 33 × `rule:nexus → deposit_life`; Stimmung, Himmel, Farbe |

Ohne den Halt hätten diese B-Boots Tiere am Spieler, einen anderen Mittag und einen anderen Himmel gemessen.

## (3) CPU — `_segmentAABB` an der Wurzel

**Zuerst gemessen** (Werkbank, V18.535, Mess-Wiese, Ego-Kamera, 2 705 Frames):
- Rufer: EIN Strahl je Frame, die Decken-Probe `_loopCamera → _ceilingHeadroom` (4,5 m senkrecht). Im Profil 0710-6 trug sie inklusive 20 % der CPU.
- Je Strahl: 1 402 Bauten durchlaufen, 419 im 80-m-Cull, **22 758 Slabs**, davon 15 570 Haselbüsche und 7 072 Bäume.
- **0 Boxen berühren das Segment**, 0 Treffer.
- Die Welt: 1 584 Bauten, 86 902 Boxen.
- Dieselbe Klasse im Körper-Löser: 12 034 Box-Lösungen je Schritt (60-m-Umkreis), 0,52 Schritte je Frame.

**Schnitt** (`7c1bd6f2`, `91c44f0f`): DIE NACHBARSCHAFT DER BLOCKER (`_blockerNetz`).
- 8-m-Zellen über die Hülle jedes Eintrags im Bestand. Übergroße Einträge stehen in einer Riesen-Zelle.
- Gestempelt wird am Bestand: Eintritt, jedes Schreiben der Boxen, Abriss, Kappe. Ein neues Array baut das Netz neu.
- **Der Strahl** fragt die Zellen seines Segments. Je Box prüft er ihre Hülle vor dem Slab. Den Gleichstand entscheidet die Ordnung des Bestands, dann die Box.
- **Der Löser** (`_blockerNahe`) fragt die Zellen um den Körper, in Bestands-Ordnung. Nach jedem Schub fragt er die Nachbarschaft der neuen Stelle hinter dem schiebenden Eintrag nach. So sieht jede Box die Position, die sie in der Schleife sah.
- „Nur Bewegte prüfen": Blocker-Boxen ändern sich nur beim Schreiben (Spawn, Hülle, Absteigen), und jedes Schreiben stempelt. Eine eigene Beweger-Liste gibt es darum nicht.
- Kein Zwilling, kein Fallback. Das alte Bucket-Grid (V9.65) trug die Hydrosphäre und fiel mit ihr (V9.75); Strahl und Kapsel lasen es nie.

**Linse** gate:blocker-netz (neu, CI-Gruppe 1). Orakel ist die alte Schleife über den Bestand.

| Teil | Prüfung |
|---|---|
| (T) Treue Strahl | 6 000 Strahlen in fünf Runden (Abriss, Kappe, gedrehte und neu gestempelte Hülle, neues Array, neue Bäume) treffen byte-gleich |
| (L) Treue Löser | 4 000 Körper (Kapsel und gedrehte Wagen-Hüllen, ~1 380 geschoben, ~1 440 getragen) lösen byte-gleich |
| (A) Arbeit | Slabs = berührte Boxen; kein Eintrag außer Reichweite wird gelöst |
| (K) Konsistenz | Netz = Bestand |
| (Q) Quelle | jeder Schreiber des Bestands stempelt |

Die Quell-Prüfung fand den vierten Schreiber: den Alias-`splice` der Nexus-Kappe `_evictArchitecture`.

Vorher ROT mit dem Täter:

| Rufer | vorher |
|---|---|
| Strahl | 1 460–2 010 Slabs bei 5,7–8,3 berührten Boxen |
| Decken-Probe | 2 571 Slabs bei 0 berührten |
| Löser | 30 811–37 855 Rufe je Runde außer Reichweite |

**Die Zahl in EINER Welt** (Werkbank, GTX 1060, Wiese, Regler voll, Methode live getauscht, A B B A):

| Größe | A | B |
|---|---|---|
| Slabs je Strahl (Decke) | 22 758 | 0 |
| `_loopCamera` je Takt | 1,46 / 1,66 ms | 0,09 / 0,08 ms |
| Takt p50/p95 (Strahl getauscht) | 4,0/6,5 · 4,5/8,5 | 2,6/4,5 · 2,5/4,7 |
| CPU-Takt p50/p95, lauf (Strahl) | 6,1/8,8 · 6,3/9,0 | 4,9/7,3 · 4,9/7,4 |
| Frames > 17 ms (Strahl) | 6,0 / 7,2 % | 4,4 / 4,7 % |
| Box-Lösungen je Schritt | 12 041 | 26 |
| `_loopFixedStep` je Takt | 1,37 / 1,26 ms | 0,11 / 0,11 ms |
| Takt p50/p95 (Löser getauscht, Strahl neu) | 2,8/5,0 · 2,7/5,2 | 1,7/3,9 · 1,7/3,5 |
| CPU-Takt p50/p95, lauf (Löser) | 4,9/6,7 · 4,8/6,5 | 4,3/5,9 · 4,3/6,0 |

## Die Zeit gegen V18.535 — ABABABAB

**Aufbau:**
- A = main `c966b9c3` (V18.535), B = `welle-m-nexus` `91c44f0f`.
- EIN Instrument: `omen-messfolge.cjs`, `werkbank.cjs` und `scripts/lib` aus B; Selbsttest grün.
- Die Seite liefert nur die Welt (save-server :4312, Seiten-Wache: A `2f53ef3b…`, B `5d891c71…`).
- Folge je Boot: dorf-aus, fenster 1920×1080, umstellen --ort wiese, Bühne, lauf voll, lauf frei, gpu-bank (Gier 0 / −0,88), band, profil.
- Alle Wachen laufen nach jedem Schritt.
- Serie 08:09–08:40, GTX 1060, 1920×1080, Ruhe hergestellt.
- **8/8 Boots grün im ersten Versuch, keiner verworfen.** Die A-Boots tragen je 5 × „WELTAKT … blind"; V18.535 kennt `DSL_WELTAKTE` nicht. Die Serie nimmt bei A nur diesen Befund hin; Störer auf A nennen weiter WETTER und ORT (5A und 7A: Nexus-Regen am Wetter-Halt verweigert).
- Rohdaten: `bericht/0710-7/` (je Boot das Folge-JSON und Log, `auswertung.md`, `serie.sh`, `fortschritt.log`).

| Größe | A (V18.535 c966b9c3) | B (welle-m-nexus 91c44f0f) | B − A |
|---|---|---|---|
| fps voll | 55.8 (49.4–63.9) | 64.0 (60.6–64.2) | +8.3 (15 %) |
| Frame p50 voll | 16.7 | 16.7 | 0 |
| Frame p95 voll | 25.0 (24.9–25.1) | 16.9 (16.8–17.0) | −8.1 (−33 %) |
| CPU-Takt p50 / p95 voll | 6.4 / 9.3 | 4.5 / 6.7 | −1.9 (−30 %) / −2.7 (−28 %) |
| fps frei | 56.9 (51.9–71.1) | 71.8 (65.5–72.1) | +14.9 (26 %) |
| Frame p95 frei | 25.1 (16.9–25.1) | 16.8 (16.8–17.0) | −8.3 (−33 %) |
| CPU-Takt p50 / p95 frei | 6.3 / 9.1 | 4.2 / 7.0 | −2.0 (−33 %) / −2.1 (−23 %) |
| render-EWMA voll | 2.61 | 2.73 | +0.13 |
| creatures-EWMA voll | 0.83 | 0.70 | −0.14 |
| gpu-bank Gier 0 / −0,88 (GPU ms) | 16.61 / 15.33 (12.0–18.3) | 12.84 / 12.30 (11.9–14.9) | siehe unten |
| band Befehle · Dreiecke | 91 · 764k | 90 · 768k | gleich |
| band VRAM MB | 120.8 (118.6–130.2) | 122.8 (122.1–122.9) | +2.1 |
| Tiere gesamt / im Sichtkegel (voll) | 11 / 2 | 11 / 1 | |

**Profil, Gesamtzeit-Anteil (Median je Seite):**

| Funktion | A % | B % |
|---|---|---|
| `_loopCamera` | 20,0 | 1,6 |
| `_ceilingHeadroom` | 19,8 | 1,4 |
| `_fieldRaycast` | 16,4 | 1,3 |
| `_segmentAABB` | 8,8 | 0,0 |
| `_loopFixedStep` | 7,4 | 0,6 |
| `_stepCharacterStructures` | 4,6 | 0,0 |
| `_resolveCapsuleVsAABB` | 1,9 | 0,0 |

Die Leerlaufzeit des Haupt-Threads steigt von 13,6 % auf 41,6 % (Selbstzeit, Median).

**Die GPU-Zahl ist kein Gewinn dieses Schnitts.** Der Schnitt ändert keine GPU-Arbeit: Befehle und Dreiecke sind gleich. Die Streuung liegt bei A:
- Die A-Boots 1A und 3A standen in einer anderen Welt: VRAM 118,6 statt 122,8 MB, band-GPU 19,3 und 19,6 ms.
- 7A trug Tiere im Band (187 Befehle, 1 340k Dreiecke).
- Der saubere A-Boot 5A gleicht B in Befehlen, VRAM und GPU (gpu-bank 12,57 / 12,04 ms, band 15,08 ms) und zeigt trotzdem den CPU-Abstand: CPU-Takt voll 6,2/8,9 gegen B 4,5–4,7 / 6,5–7,0 ms, Frame p95 24,9 gegen 16,8–17,0 ms.

Der Zeit-Gewinn ist die CPU: der Takt je Frame und daraus Frame p95 25 → 17 ms (am 120-Hz-Raster die Stufe 25,0 → 16,7).

## Offen

- **CI 91c44f0f, Gruppe 3, Schritt 40 `gate:fernwald` rot.** Lokal ist er 3 von 3 grün und war auf e0983fa6 in der CI grün. Die übersprungenen Gruppe-3-Schritte liefen lokal: alle 21 grün, fernwald ein viertes Mal grün. Das Job-Log braucht Admin-Rechte. Bitte lies es und starte den Rerun.
- **Der Tier-Leib** (`_kreaturHuellenKontakt`) baut seine Nähe-Liste je Tier (nach 4 m oder 1 s) weiter aus dem ganzen Bestand.
- **Der Halt hält die DSL-Welt-Akte und das Wetter.** Was keine DSL ist, hält die Bühne selbst (Auto-Dorf, Saison). Die Tiere des Ökologie-Spawners zählt die Wache TIERE als Weltzustand.
