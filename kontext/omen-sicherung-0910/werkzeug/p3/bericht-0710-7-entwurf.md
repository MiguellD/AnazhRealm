# Bericht 0710-7 — Nexus-Dorf, Welt-Halt, die Nachbarschaft der Blocker (OMEN, welle-m-nexus)

**Zwischenstand.** Geschnitten: (1) ein Nexus-Dorf dreht den Blick nicht mehr, ein verlangtes Dorf schaut auf SEIN Dorf;
(2) die Mess-Bühne hält jeden DSL-Welt-Akt an der EINEN Engstelle `dslEval` und nennt ihn, die Mess-Folge prüft es als Wache
WELTAKT; (3) der Struktur-Strahl und der Struktur-Löser (Kapsel, Wagen-Hülle) fragen die Nachbarschaft der Blocker statt des
Umkreises, byte-gleich. Gemessen: ZAHL_KOPF. Offen: OFFEN_KOPF.

- **Branch `welle-m-nexus`** auf main `c966b9c3` (V18.535), Kopf **KOPF**. Commits: `2f385609` (1), `e0983fa6` (2),
  `7c1bd6f2` (3 Strahl), KAPSEL_SHA (3 Kapsel und Hülle).
- **CI:** e0983fa6 grün (37731438978); 2f385609 vom nächsten Push abgelöst; 7c1bd6f2 CI_7C1B; KAPSEL_SHA CI_KAPSEL.
- **Wände je Commit** (lokal, Ports 7905–7909): siehe je Abschnitt; der volle Playtest einmal auf dem Kopf: PLAYTEST.

## (1) SPIEL — das Dorf, das niemand verlangt hat, dreht den Blick nicht

**Befund** (0710-6, Boot 4B): der Nexus setzt `spawn_village` autonom, `spawnSettlement` rief danach immer
`_nachDorfOrientieren` — die Gier sprang mitten im Lauf auf −2,745. Dazu: auch das verlangte Dorf zielte falsch — die
Ausrichtung ging auf den Schwerpunkt ALLER Häuser der Welt.

**Schnitt** (`2f385609`): die Absicht reist als Quelle — `verlangt` (die DSL-Quelle; der Chat-Befehl „dorf" ist `human`), EINE
Prüfung `_spielerVerlangt` (`human` und `llm:*`, der Begleiter, der den Satz des Spielers ausführt; Nexus, Welt-Regeln,
Resonanz und Mitspieler handeln für die Welt). `_spawnSettlementFromExport` meldet die Mitte der gesetzten Häuser,
`_nachDorfOrientieren` richtet den Blick nur für den Spieler und auf diese Mitte. Kein Flag-Zwilling: `autonomous` bleibt die
Nexus-Kappe, die Absicht ist die Quelle.

**Linse** gate:settlement C7 — an drei Orten: Nexus-Programm, Chat-Programm des Spielers, Befehl „dorf 4714 8"; gemessen die
Gier gegen den Schwerpunkt der eben gesetzten Häuser. Auf c966b9c3 ROT: Nexus 11 Häuser, Gier um 1,81 rad gedreht;
Chat-Programm 0,53 rad und „dorf" 1,50 rad neben dem eigenen Dorf. Nach dem Schnitt: Gier unverändert; 0,000 / 0,000 rad.

## (2) MESSUNG — die Bühne hält die Welt

**Befund** (0710-6, verworfene Boots): die Bühne hielt nur das Wetter. Jeder andere Zug lief durch: Nexus-Dorf, Tiere at_player,
Würfel auf Größe und Tempo aller Tiere, Tageszeit, Himmel, Lauf- und Sprungkraft — aus Nexus, Emotion, Welt-Regel, Mensch,
Mitspieler, verzögertem Programm. Alle durch EINE Engstelle: `dslEval`.

**Schnitt** (`e0983fa6`): `AnazhRealm.DSL_WELTAKTE` (50 Ops) und EIN Halt `_messHalt` (dieselbe eingefrorene Uhr wie der
Wetter-Halt; `_setWeather` liest ihn jetzt auch). `dslEval` verweigert unter dem Halt jeden Welt-Akt und bucht ihn
(`_weltaktGehalten`, Op + Quelle). Im Spiel zählt die Uhr von 0 aufwärts und wird nie gespeichert — das Spiel bleibt, wie es
ist. Mess-Seite: der Welt-Akt-Spion (`__weltaktSpion`, die Bühne setzt ihn) hört an `_weltaktGehalten` mit und hüllt jeden
Welt-Akt der Effekt-Tafel — „durch" unter dem Halt ist der Täter mit Quelle und Stapel; `weltaktUrteil` (rein, Selbsttest);
Werkbank `/wache` liefert das Buch (`seitWelt`), die Mess-Folge prüft es ab der Bühne als **Wache WELTAKT** (Selbsttest:
Nexus-Dorf rot beim Namen, Verweigerung grün, blinder und fehlender Spion rot).

**Linse** gate:weltakt-wache (neu, CI-Gruppe 2): (H) sechs Wege unter der Bühne, die Welt steht, 17 Züge verweigert beim Namen;
(S) ein Akt an `dslEval` vorbei fällt rot; (F) ohne Halt wirkt das Spiel; (Q) jeder der 72 Ops hat ein Urteil (Welt-Akt oder
benannt frei), der Nexus komponiert nur beurteilte Ops (23). Auf 2f385609 ROT mit den Tätern: `spawn_village`, `spawn_creature`,
`creatures_size_mul`, `creatures_speed_mul`, `time_of_day`, `player_speed`, `skybox_color` durch `nexus`
(`dslEval ← … ← dslRun ← _loopNexusUpdate`), `creatures_speed_mul` durch `emotion:chaos`, `spawn_creature` durch `rule:human`,
`spawn_tree` durch `llm:grok` (`dslTick`). Bei der Klassifikation fiel `set_visible` (blendet Gelände oder Tiere aus) als
Welt-Akt auf.

## (3) CPU — `_segmentAABB` an der Wurzel

**Gemessen zuerst** (Werkbank, V18.535, Mess-Wiese, Ego-Kamera, 2 705 Frames): Rufer — EIN Strahl je Frame, die Decken-Probe
`_loopCamera → _ceilingHeadroom` (4,5 m senkrecht); im Profil 0710-6 trug sie inklusive 20 % der CPU. Je Strahl 1 402 Bauten
durchlaufen, 419 im 80-m-Cull, **22 758 Slabs** (15 570 Haselbüsche, 7 072 Bäume), **0 Boxen berühren das Segment**, 0 Treffer.
Die Welt: 1 584 Bauten, 86 902 Boxen. Dieselbe Klasse im Körper-Löser: 12 034 Box-Lösungen je Schritt (60-m-Umkreis), 0,52
Schritte je Frame.

**Schnitt** (`7c1bd6f2`, KAPSEL_SHA): DIE NACHBARSCHAFT DER BLOCKER (`_blockerNetz`) — 8-m-Zellen über die Hülle jedes Eintrags
im Bestand, gestempelt am Bestand (Eintritt, jedes Schreiben der Boxen, Abriss, Kappe; ein neues Array baut neu), Riesen-Zelle
für Übergroße. Der Strahl fragt die Zellen seines Segments, je Box ihre Hülle vor dem Slab, Gleichstand nach der Ordnung des
Bestands. Der Löser fragt die Zellen um den Körper (`_blockerNahe`), in Bestands-Ordnung, und nach jedem Schub die
Nachbarschaft der neuen Stelle hinter dem schiebenden Eintrag — jede Box sieht die Position, die sie in der Schleife sah.
Keine Zwillings-Schleife, kein Fallback: das alte Bucket-Grid (V9.65) trug die Hydrosphäre und fiel mit ihr (V9.75).

**Linse** gate:blocker-netz (neu, CI-Gruppe 1): (T) 6 000 Strahlen in fünf Runden (Abriss, Kappe, gedrehte neu gestempelte
Hülle, neues Array, neue Bäume) byte-gleich wie die Schleife über den Bestand — Orakel ist die alte Schleife; (L) 4 000 Körper
(Kapsel und gedrehte Wagen-Hüllen, ~1 380 geschoben, ~1 440 getragen) byte-gleich; (A) Slabs = berührte Boxen, kein Eintrag
außer Reichweite gelöst; (K) Netz = Bestand; (Q) jeder Schreiber des Bestands stempelt — die Linse fand dabei den vierten
Schreiber, den Alias-`splice` der Nexus-Kappe `_evictArchitecture`. Vorher ROT mit dem Täter: Strahl 1 460–2 010 Slabs bei
5,7–8,3 berührten, Decke 2 571 bei 0; Löser 30 811–37 855 Rufe je Runde außer Reichweite.

**Die Zahl in EINER Welt** (Werkbank, GTX 1060, Wiese, Regler voll, Methode live getauscht, A B B A):

| Größe | A | B |
|---|---|---|
| Slabs je Strahl (Decke) | 22 758 | 0 |
| `_loopCamera` je Takt | 1,46 / 1,66 ms | 0,09 / 0,08 ms |
| Takt p50/p95 (Strahl getauscht) | 4,0/6,5 · 4,5/8,5 | 2,6/4,5 · 2,5/4,7 |
| CPU-Takt p50/p95, lauf (Strahl) | 6,1/8,8 · 6,3/9,0 | 4,9/7,3 · 4,9/7,4 |
| Frames > 17 ms (Strahl) | 6,0 / 7,2 % | 4,4 / 4,7 % (Frame p95 25 → 17 ms) |
| Box-Lösungen je Schritt | 12 041 | 26 |
| `_loopFixedStep` je Takt | 1,37 / 1,26 ms | 0,11 / 0,11 ms |
| Takt p50/p95 (Löser getauscht, Strahl neu) | 2,8/5,0 · 2,7/5,2 | 1,7/3,9 · 1,7/3,5 |
| CPU-Takt p50/p95, lauf (Löser) | 4,9/6,7 · 4,8/6,5 | 4,3/5,9 · 4,3/6,0 |

**Die Zeit gegen V18.535** (ABABABAB, ein Instrument aus B): ABAB_TABELLE

## Offen

- Der Tier-Leib (`_kreaturHuellenKontakt`) baut seine Nähe-Liste je Tier (nach 4 m oder 1 s) weiter aus dem ganzen Bestand.
- Der Halt hält die DSL-Welt-Akte und das Wetter. Was keine DSL ist, hält die Bühne selbst (Auto-Dorf, Saison); die Tiere des
  Ökologie-Spawners zählt die Wache TIERE als Weltzustand.
- A-Boots der ABAB (V18.535) kennen `DSL_WELTAKTE` nicht: dort meldet die Wache WELTAKT „blind"; Störer auf A nennen weiter
  WETTER und ORT (wie in 0710-6).
OFFEN_REST
