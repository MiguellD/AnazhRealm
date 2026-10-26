# Bericht 2610 gpu-bahnen — die Prüfung darf nie länger dauern als das Erstellen

**Spur:** FEUER / Werkzeug. **Status: ZWISCHENSTAND.** Zweig `gpu-bahnen-koord` ab origin/koordination, kein Spiel-Code.

## Geschnitten

- **Ein Merkmal je Station:** `zeit: true|false` steht an allen 132 Stationen in `stationen/g1.js…g6.js`.
  - `pruefeStationen` verlangt es als bool. Ohne es ist der Selbsttest ROT: `FORMAT echte Stationen … zeit nicht boolesch`.
  - `zeit: true` heißt: das Urteil fällt an der Wanduhr (ms, Latenz, Frame-Zeit, Sekunden bis sichtbar). Die Station fährt allein.
  - `plan` liest das Merkmal. Die Text-Heuristik (`p95 … ms` in der Zahl) fällt, es gibt EINE Quelle.
  - Das Merkmal steht nicht im Abdruck. Keine Messung wird dadurch alt.
- **Das Platz-Schloss:** `meisterkarte-quelle/punkte/werkzeug/gpu-schloss.sh` und `gpu-lauf.sh`. Laptop und OMEN tragen dieselbe Datei.
  - Ein Bild-Lauf (`GPU_LAUF_ART=bild`) nimmt EINEN von N Plätzen (`GPU_LAUF_PLAETZE`).
  - Ein Zeit-Lauf (`zeit`, die Vorgabe) nimmt das ganze Schloss, nach der CI-Ruhe. Ein wartender Zeit-Lauf hat Vorrang: kein neuer Bild-Lauf tritt bei, bis er gefahren ist.
  - N = 1 ist das Ein-Platz-Schloss von vorher.
  - **Vorfahrt des echt-Jobs:** Solange Runner.Worker lebt, eine CI wartet (hook.log) oder Nachtruhe ist, nimmt niemand einen Platz, auch keinen freien. Die Plätze leeren sich, dann nimmt der Hook alle.
  - Die Hooks bleiben unverändert. Sie sehen den Ordner `gpu-schloss` mit `besitzer.txt` (Zeile 1 Name, Zeile 2 `pid=`).
  - **Der Vertreter:** `besitzer.txt` nennt immer einen lebenden Platz-Halter. Wer geht, übergibt. Der Herzschlag (10 s) übernimmt nach einem harten Tod und frischt die Datei; der Radeon-Hook löst nach 60 min Schweigen.
  - Die OMEN-API bleibt: `schloss_nehmen`, `schloss_loesen`, `schloss_erster`, `schloss_verwaist`, `ci_wartet`, `ci_ruhe`, `cpu_ruhe`.
  - Die inneren Helfer heißen `gs_*`, weil `serie.sh` nach dem Einbinden eigene `worker` und `vorfahrt` definiert.
- **Der Bahn-Plan in `run` (`fahrePlan`):** `--bahnen N` gilt für jedes Gerät (Vorgabe 3, höchstens 5).
  - Die Zeit-Gruppen fahren zuerst, einzeln, auf Bahn 0. Danach fahren die Bild-Gruppen auf N Bahnen zugleich, die längsten zuerst.
  - Jede Messung trägt `bahn` (`allein` oder `2/3`).
- **Ports je Bahn (`portBand`):** Jede Bahn hat 10 Ports und deren +10000/+20000/+30000-Spiegel. `{PORT}` ist Band-Anfang + 4.
  - headless liegt bei 7700–7749, radeon|gtx bei 7750–7799.
  - Alle Ableitungen der Stationen bleiben im Band: −1 (Seite der Werkbank), +1, +2, +3, +10000, +20000, +20001, +30000.
  - `WERKBANK_PORT` ist je Bahn {PORT}+20000. Ein Ruf ohne `--port` trifft nie die 4490 einer Nachbar-Bahn.
  - `portRaeumen` räumt das ganze Band.
  - Vorher bekam jede Station einen Port aus ihrer Stelle in der Liste. Zwei Nachbarn kollidierten parallel: wetter.K2#1 an 7710 sucht seine Seite auf 7709. Ab Stelle 100 lief die Liste aus dem Block 7700–7799 (132 Stationen, bis 7832).

## Gemessen

**Erwartete Zeit je Radeon-Takt.** Grundlage sind die gemessenen Minuten aus `messung/b2c6c627-radeon.json`: 45 Stationen in 38 Läufen (Zwillinge einmal), 150,1 min. Vorher fuhr jede Station einzeln: 151 min.

| Bahnen N | Formel Zeit + Bild / N | Bahnen nach Plan (längste zuerst) |
|---|---|---|
| 1 (das alte Schloss) | 150,1 min | 150,1 min |
| 2 | 118,8 min | 118,8 min |
| **3 (Vorgabe)** | **108,3 min** | **108,5 min** |
| 4 | 103,1 min | 103,3 min |
| 5 | 100,0 min | 100,1 min |

- **Zeit** sind 10 Läufe mit 87,4 min, allein:
  - gelaende.K2#1 2,05
  - siedlung.K5#1+#2 5,06
  - leib.K1#1 5,7
  - leib.K1#2 14,71
  - halten.K2#1 5,42
  - profiband.K4#1 12,3
  - profiband.K4#2 17,45
  - klang.K5#2 13,18
  - speicher.K1#1+#2 9,45
  - speicher.K2#1 2,09
- **Bild** sind 28 Läufe mit 62,7 min. Der längste ist ferne.K2#2 mit 6,92 min.
- **Selbsttest GRÜN 55/55** in 15 s (Cloud, Stubs, das echte `werkzeug/gpu-lauf.sh` in eigenen tmp-Schlössern).
  - **BAHNEN der Plan:** Die zwei Bild-Läufe überlappen, der Zeit-Lauf fährt allein.
  - **BAHNEN Zeit gegen fremde Läufe:** Der Zeit-Lauf wartet auf alle Plätze und überlappt nie. Ein späterer Bild-Lauf tritt nicht vor ihm bei.
  - **BAHNEN N = 1:** Es überlappt nie etwas.
  - **BAHNEN VORFAHRT:** Ein wartender CI-Job hält auch einen freien Platz an und bekommt das Schloss. Der neue Bild-Lauf fährt erst nach ihm.
  - **BAHNEN DER VERTRETER:** Geht der Erste, nennt `besitzer.txt` den Bleibenden mit pid.
- **Gegenprobe, je Täter in einer Kopie, jedes Mal genau der benannte Fall ROT (54/55):**
  - Läufer ohne Plätze (`GPU_LAUF_PLAETZE` fest 1) → der Plan.
  - Kein Vorrang → Zeit gegen fremde Läufe.
  - Keine Vorfahrt am Platz → VORFAHRT.
  - Keine Übergabe → DER VERTRETER.
  - Eine GPU-Station ohne `zeit` → FORMAT.
- **`run` am echten Spiel-Baum** (Cloud, headless, origin/main f85ddf35, `--bahnen 2`): alle drei Stationen GRÜN. Die Messdatei ist nicht committet, die Cloud ist kein Messgerät.
  - Erst fuhr tore.K5#1 (Zeit) allein, 2,22 min, `bahn: allein`, Port 7704.
  - Danach fuhren fahrzeug.K1#1 und #2 zugleich in den Bäumen `punkte-headless` und `punkte-headless-2`, `bahn: 1/2` und `2/2`, Ports 7704 und 7714.
- **`liste`:** 132 Stationen, 79 Kriterien, fehlt 19, **Fehler 0**, 16 Zeit-Stationen.

## Die Zeit-Stationen (16) und die Grenzfälle

- **Zeit, GPU (13):**
  - gelaende.K2#1/#2: gefüllt ≤ 2000 ms
  - siedlung.K5#1/#2: erstes Haus ≤ 500 ms
  - leib.K1#1/#2: Latenz p95 ≤ 50 ms
  - halten.K2#1: erstes Schwung-Bild ≤ 50 ms
  - profiband.K4#1/#2: Frames > 100 ms
  - klang.K5#2: Klang-Takt p95 ≤ 0,2 ms
  - speicher.K2#1: ≤ 0,3 ms je Bild
  - speicher.K1#1/#2: Alter des Stands ≤ 10 s an der Wanduhr
- **Zeit, headless (3):**
  - tore.K5#1: Klick bis gezeichnet ≤ 10 s
  - streaming.K5#1/#2: MB je Wanduhr-Minute über ≥ 55 s Fahrt
- **Bild trotz Zeit-Wörtern, an der Quelle gelesen:**
  - leib.K4 (Ruck p95 je Bild): synthetische Zeit, `_gameLoopTick(tMs)` mit eigenem Takt-Muster.
  - fahrzeug.K3#2 (Rückkehr 1–1,5 s): Zeit des Rigs (tempo3.js).
  - tiere.K1#2 und tiere.K2#2 (Sekunden der Herde und des Risses): Sim-Zeit. Fressen 110,7 s in 2,45 min Lauf.
  - halten.K5, physik.K2 (60/15 Hz): synthetische Frames.

## Einbau (Koordinator)

- `punkte.cjs run` und `punkte.cjs selbsttest` fahren DIESELBE Datei: `meisterkarte-quelle/punkte/werkzeug/gpu-lauf.sh` neben der Maschine (Heilung 26.10.). Eine andere nur ausdrücklich per `PUNKTE_GPU_LAUF`, dann prüft der Selbsttest sie, und eine Fassung ohne Plätze fällt dort ROT. Für die Punkte-Maschine braucht es keine Kopie mehr.
- Für Macher-Läufe und die OMEN-Serien gehören `gpu-lauf.sh` und `gpu-schloss.sh` zusammen in denselben Ordner. `gpu-lauf.sh` bindet die Datei daneben ein, auch über einen Windows-Pfad.
  - Laptop: nach `artifacts/profiband/werkzeug/`. Die alte Fassung dort nimmt denselben Schloss-Ordner und bleibt verträglich.
  - OMEN: nach `p3/`. Dort binden `messplatz.sh` und `serie.sh` `p3/gpu-schloss.sh` weiter ein.
- Ein blockiertes Schloss ist keine Messung. Ein Exit 75 oder ein gpu-lauf.sh, das beim Warten 600 s schweigt, landet als `ungemessen` mit Grund in der Mess-Datei, nie als ROT in `je`, und `run --offen` misst die Station neu. Die Warte-Frist zählt die Nachtruhe nicht mit.
- Der Läufer `zug.cjs` braucht keine Änderung. Start- und Stationszeilen haben wieder sein Format, die Bahn steht vor „· Exit“, und ein ungemessener Lauf heißt `OFFEN`.
- Der erste Radeon-Takt mit Bahnen ist `punkte.cjs run --sha <kopf> --geraet radeon --offen`. Die Vorgabe ist 3 Bahnen, `--bahnen 1` ist der alte Weg. Seine Wanduhr ist der Richter dieser Tabelle.

## Ehrlich offen

- **Die Takt-Zeit am Gerät:** Die Tabelle ist gerechnet, nicht gefahren. Die Cloud hat keine GPU. Der Richter ist der erste Radeon-Takt mit `--bahnen 3`. Er zeigt auch, ob drei sichtbare `--echt`-Fenster zugleich zeichnen. Puppeteer setzt `--disable-backgrounding-occluded-windows`; gemessen ist das unter Windows nicht.
- **87,4 der 108 min sind Zeit-Stationen.** Sie fahren mit Recht allein, und die Bahnen kürzen sie nicht. Dieser Schnitt bringt einen 45-Stationen-Takt von 151 min auf 108 min. Das sind −28 %, nicht mehr.
- **Fremde Datei:** `zug/punkte-gtx.md` gehört dem Koordinator und bleibt unberührt. Zwei Stellen sind dort veraltet:
  - Z. 14–16 nennt als Skript „das des Radeon-Hosts“ unter `artifacts/profiband/werkzeug/`. Die Quelle ist jetzt `meisterkarte-quelle/punkte/werkzeug/`, mit `gpu-schloss.sh` daneben.
  - Z. 18 nennt die Ports 7700–7759 und je +20000. Jetzt sind es 7700–7799 und je +10000/+20000/+30000, also 7750–7799 für die GTX.
