# Bericht 1610 Wald-Kette — der kritische Pfad der Ankunft kalt auf der GTX (985a923b)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16.10. (B): die Wald-Kette der Ankunft je Stück mit Zeitlinie, den Haupt-Faden im
Fenster 11 s bis Weltbild, und welcher EINE Schnitt die meisten Sekunden holt.

## Urteil

**Den Schluss der Ankunft tragen zwei Ketten, beide an der Foundry-Werkstatt (Worker) gebunden:**
- die **Streu** (Wald-Stücke der Spieler-Region), in 9 von 12 Basis-Boots der letzte Term;
- die **Bauten** (die Häuser des Start-Dorfs).
- Im Mittel liegen sie nur 0,24 s auseinander: Streu zuletzt offen 19,56 s, Bauten 19,32 s, Weltbild 20,01 s (12 Boots).

**Die Streu wartet ohne Rang.** Ihre Bestellungen tragen keinen Ort (d² = ∞, Vorrats-Rang) und warten 3–5 s in der Host-Schlange
hinter jedem Haus und Fels der Mesh-Zone. Darauf folgt seriell: Körper (Werk) → Karte (Bäcker) → Nachstreuen.

**Der EINE Schnitt, gemessen, ist S1b „der Rang der Streu“.** Die Streu reicht den Ort ihrer Zelle als `wo` (Rang), nie als
`position` (die Gestalt bleibt). Er liegt als Zweig `streu-rang` (ab 985a923b, [ci voll]) bereit.
- **Streu-Term:** 20,32 → 18,89 s (−1,43 s; 4+4 verschränkt).
- **Weltbild:** 20,76 → 20,01 s (−0,75 s, bei 4+4 und 2σ 1,36 nicht belegt). Danach tragen die Dorfhäuser in 4 von 4 Boots den
  Schwanz (19,84 s).
- **Folgerung:** Der zweite Schnitt muss die Bauten-Kette treffen. Erst dann zahlt S1b seine 1,4 s ganz.

| Boots (GTX kalt, 985a923b) | Weltbild s | Streu zuletzt offen | Bauten zuletzt offen | Schwanz |
|---|---|---|---|---|
| Basis W1–W12 | 20,01 | 19,56 | 19,32 | Streu 9×, Bauten 3× |
| Basis W5–W8 (zu S1) | 19,10 | 18,30 | 18,69 | |
| S1: Rang an 4 Streu-Stellen (ohne Höhen-Stufe) | 19,93 | 19,53 | 19,10 | wirkt nicht, siehe unten |
| Basis W9–W12 (zu S1b) | 20,76 | 20,32 | 19,97 | Streu 3×, Bauten 1× |
| **S1b: + die Höhen-Stufe der Streu** | **20,01** | **18,89** | 19,84 | **Bauten 4×** |

**S1 allein wirkte nicht.** Das erste Glied der Streu ist die Höhen-Stufe des Baums: `_scatterSichtHoehe` bestellt sie über
`_foundrySichtHoehe(preset, { seed }, …)` (stamm/15b.js:1279). Ohne Höhe wählt die Zelle keine Stufe. Erst S1b reicht auch dort den Ort.

## Die Kette je Stück (Boot W1, Zeit ab Navigation)

- **6,5–8,2 s Bestellung:** Die vier Streu-Regionen um den Spieler (−1,−1 · 0,−1 · −1,0 · 0,0) streuen und bestellen Höhen-Stufen und
  Körper. Das sind blume L0, geroell L0, buche L1, eiche|3 L1, gras L1/L2, tanne/birke L1, alle mit `d = null`.
- **Wartezeit in der Host-Schlange (`_foundryAuftrag`, nah zuerst):** 4,9–5,7 s. Gesendet erst 12,3–13,4 s.
  - Vor ihnen: kristalle/zacken (25–95 m) und ab 10,6 s die Dorfhäuser (65–145 m).
- **Werk und Annahme:** Die Antworten kommen bei 16,1–17,6 s. Nach der Ingest-Freigabe (am Ende Median 21–457 ms) und dem
  Gruppen-Bau (zusammen < 0,3 s im Fenster) liegt der Körper im Cache.
- **Karte und Weltbild:** Die Karten der Streu (`fimp:buche|1/2`) gehen erst nach dem Körper in den Bäcker, 17,69 → 18,19/18,39 s.
  Nachstreuen 18,42 s, Weltbild 18,49 s.
- **Bauten:**
  - Das Dorf ist geplant bei ~11,0 s (G2).
  - Die Häuser bestellen L2 (Körper) und L3 (Nur-Wurf) je mit Prägung, 41 Aufträge.
  - Die letzte Antwort kommt bei 18,2–19,7 s, im Gleichschritt mit dem Weltbild.

**Die Werkstatt** (echte Bauzeit: FIFO je Bahn, Antwort − max(Senden, Antwort des Vorgängers), W5–W8):
- **Auslastung bis zum Weltbild:** die 3 Werk-Bahnen je 10,6–12,5 s belegt, die 3 Bäcker-Bahnen je 8,7–10,7 s.
- **Teuer sind:**
  - die Karten: 19 Bakes zu je 1,4–1,6 s, zusammen 26–31 s Bäcker-Zeit;
  - der Spieler-Leib `mensch` L0: 3,8–4,4 s am Stück;
  - die Dorfhäuser: schwarzwald L2 je 0,5–0,7 s, L3 je 0,2–0,4 s, zusammen ~9–12 s Werk-Zeit;
  - die Baum-L1: je 0,3–1,1 s.
- **Billig sind** kristalle/zacken L0: je 0,06–0,28 s. Ihre langen Werk-Zeiten in der Rohsicht sind Warten im Worker hinter anderen.

**Der Haupt-Faden** (CPU-Profil 0,5 ms, Fenster 11 s → Weltbild, W1):
- **Auslastung:** zu 98 % beschäftigt (idle 2,2 %).
- `loop` 78 %. Davon:
  - der Streaming-Takt `_runFrameScheduler` 38 %;
  - das Rendern 26 %, darin der Knoten-Bau (`getNodeBuilderState` → `build`) 17,6 % = 1,32 s;
  - `tickArchitectureCulling` 10 %.
- **Selbstzeit-Spitzen:**
  - `_ortGestaltSame` 20c.js:783 (0,32 s), `_waldPlanKasten` 20a.js:470 (0,20 s);
  - die Wald-Darts `_forestDartSteht` · `_forestCellDarts` · `_forestStehtFrei` (zusammen 0,24 s);
  - `_foundryEnabled` 20a.js:696 (0,13 s Selbstzeit für eine Abfrage).

## (a) `_foundryRewarmColdTrees`: was Takt-Pflicht ist, was nur über Betroffene laufen könnte (Lehre 25)

Im Fenster 11 s → Weltbild kostet er **549–796 ms Haupt-Faden** (7–9 %; W5–W8, `rewarm-split.txt`).

| Aufrufer | ms (W5 · W6 · W7 · W8) | |
|---|---|---|
| der `nach`-Rückruf jeder Asset-Ankunft (`_foundryFlattenFor`, 20c.js:1040; ebenso 20b.js:978) | 424 · 646 · 502 · 397 | **75–80 %**: je Ankunft ein voller Scan aller Einträge |
| der Culling-Takt `tickArchitectureCulling` (20d.js:2930) | 125 · 150 · 169 · 212 | die Takt-Pflicht |

- **Innen:** Zwei Drittel sind der **Dock-Peek je Kandidat** `_foundryEntryReady` → `_foundryLodForEntry` → `_foundrySichtHoehe` →
  `_ortGestaltSame` (364–509 ms). Das Platzieren selbst (`_rebuildArchitectureMesh`) kostet 100–166 ms.
- **Warum:** Der Peek läuft für jeden Kandidaten, auch wenn das Platz-Budget schon leer ist. Die Schleife bricht erst, wenn BEIDE
  Budgets leer sind.
- **Takt-Pflicht** ist der eine Scan je Takt mit Budget (nah zuerst).
- **Nur über Betroffene** ginge die Ankunft:
  - Sie weckt nur die Einträge, die auf DIESEN Körper-Schlüssel warten. Das Platzieren übernimmt der nächste Takt.
  - Und der Peek endet, sobald das Platz-Budget leer ist.
- **Spannweite:** ~0,4–0,65 s Haupt-Faden im Fenster. Der Haupt-Faden ist voll, das Geld kommt also Ingest, Nachstreuen und Knoten-Bau
  zugute.

## (b) kristalle/zacken L0 in 25–95 m: liest ihr Auftrag `_lodAuge`, oder fordert jemand L0 fest?

**Keiner fordert L0 fest.** Der Auftrag liest die Distanz-Stufe (`_foundryLodForEntry`). `_foundryServierStufe` (20c.js:991) klemmt sie
aber auf die deklarierten Stufen der Art.
- Kristalle und Zacken sind Fels, und das Studio deklariert `kindStages.rock: [0]` (foundry-core.js:383): Fels hat nur L0.
- Ein Hebel läge also im Studio (eine grobe Fels-Stufe + Budget-Zeile), nie im Host.
- **Aber:** Gemessen sind sie billig, 0,06–0,28 s je Bau. Auf dem kritischen Pfad liegen sie nur als Rang-Vorgänger der unrangierten
  Streu, und den nimmt S1b weg.

## Die nächsten Schnitte nach S1b (beziffert, nicht gebaut)

1. **Die Bauten-Kette (jetzt der Schwanz, 19,8 s):**
   - Die Dorfhäuser bestellen je L2 + L3 (Nur-Wurf) mit Prägung, ~9–12 s Werk-Zeit ab ~10,6 s auf 3 Bahnen.
   - Kandidaten:
     - die L3-Wurf-Stufe erst nach dem Weltbild (10 × 0,2–0,4 s);
     - der Spieler-Leib L0 (4 s am Stück auf einer Werk-Bahn) auf seine Bahn außerhalb der Dorf-Zeit.
2. **Die Karten der Streu sofort mit dem Körper bestellen,** nicht erst nach der Ankunft (20b.js:972–979). Das spart den seriellen
   Schwanz Körper → Karte, 0,5–1,0 s.
3. **Rewarm über Betroffene** (oben, 0,4–0,65 s Haupt-Faden).

## Methode

- **Stationslinse** (nicht im Repo; `wald-probe.js`, eingespritzt ab dem ersten Skript; Linse `diag-boot-stage.wald.cjs`):
  - Zeitstempel je Foundry-Auftrag: in der Schlange (`_foundryAuftrag`), gesendet (`Worker.postMessage`, mit `reqId` = Bahn),
    beantwortet.
  - Je Körper-Zug: angefragt → im Cache.
  - Je Ingest: Warten. Je Gruppen-Bau: Dauer und Art. Je `_scatterRegion`: Dauer und Zustand danach.
  - Karten gesendet/fertig.
  - Proben alle 100 ms: Streu-Gründe je Region, ungezeichnete Bauten je Art, Schlangen-Stände.
  - CPU-Profil 0,5 ms bis zum Weltbild, mit einer benannten Takt-Marke (1 ms Spin je Sekunde) zum Uhren-Abgleich.
- **Boots:** 985a923b (abab-bbb), `--kalt --echt`, leeres Profil, GPU-Schloss mit 180 s CI-Ruhe.
  - Basis W1–W12.
  - S1 (abab-wk1, Folge S W W S S W W S).
  - S1b (Folge T W W T T W W T).
- Die Linse kostet selbst etwas (Profiler, Haken). Alle Seiten tragen sie gleich.
- **Kein Weltbild halb**, in keinem Boot (`ohne` leer).

## Status ZWISCHENSTAND + Übergabe

- **Geschnitten:** Zweig `streu-rang` cd20288c ab 985a923b ([ci voll]), 3 Dateien (15b/20b/20c), nur der Rang (`wo`).
  - Lokal grün: Format, Lint (keine neue Warnung), Stamm-Lint, Atlas, `npm run check` (EXIT 0), `playtest:fast` (EXIT 0).
  - Ein erster `check`-Lauf meldete `gate:betriebsgesetz` „scripts +55 Z.“. Direkt und im zweiten Lauf ist das Gate grün
    (scripts 0 Z.). Nicht nachgestellt; die Zweig-CI urteilt.
- **Rohdaten:** `bericht/1610-wald-kette/`.
  - je Boot `.json` und `-analyse.txt`, `termtafel.txt`, `rewarm-split.txt`.
  - Die Werkzeuge `wald-probe.js`, `wald-analyse.cjs`, `rewarm-split.cjs`, `diag-boot-stage.wald.cjs`, `s1b.patch`.
  - Die CPU-Profile (je 6–7 MB) auf dem OMEN unter `p3/k1610wk/`.
- **Offen:** der Bauten-Schnitt. Erst mit ihm trägt S1b seine 1,4 s ganz ins Weltbild.
