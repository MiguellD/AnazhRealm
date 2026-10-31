Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 13, 14, 23, 25 und Gebot 7 („die Welt ist eine FUNKTION, kein Sack“). Der Plan steht in
koordination `bericht/pruefplatz/plan.md` (§2 C-Bühne und Fahrweg, §5 S4, §6 Nr. 16).

# STADT — die C-Bühne steht durch den Plan, der Fahrweg verbindet Platz und Stadt, die Silhouette kommt aus denselben Plänen, und der Stadt-Ring wächst auf über 2 000 Häuser (Phase 1b / 2)

**Pflicht-OFFEN:**
- C: die Bühne, also die Stadt nH 300 voll belebt.
- E: Die Stadt kostet an den Genesis-Stationen nichts, solange sie nicht fällig ist; dazu die Silhouette.
- B: Die Stadt steht nie vor dem ersten Bild.

**Chokepoint:**
- Der Ort der Stadt im Ort-Gesetz: fachwerk-Siedlung, Rang-Gesetz (fachwerk-core.js:3191-3244), `GROESSE_WAND` 500.
- Die Ferne (`stamm/gelaende-fern.js`, `stamm/bild-sicht.js`). Fern-Ring und Feld-Pass kennen heute keine Siedlung (0 Treffer), also gibt es
  keine Skyline.

**Was stirbt:**
- Die Stadt, die nur durch das Wort am Anlauf entsteht (Messorte stadt, stadt-voll: `anlauf` 400/400, haushalt.json:268-333).
- Die Ferne ohne Stadt.

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `stadt-wagen.png` und `stadt-platz.png`: kastige Häuser, Gassen aus Erde, Fahrer und Fußgänger auf der Fahrbahn.
- Messwerte am 31.10. (z103, GTX, Stadt 91 Häuser): CPU-Takt gehend p95 49,4 ms, 1,29 M Dreiecke, VRAM 188–220 MB. Der Engpass ist der
  Haupt-Faden (`_loopVoxelStreaming`, `_renderScene`, `_tickBauSatz`, `_tickBewohner`).

**Ziel-Bild:**
- Von der Terrasse (S6) und von der Tribüne der Strecke sieht man über die Lichtung der Strecke auf die Skyline, wie vom Central Park auf
  Midtown.
- In der Stadt fährt der Verkehr von C.

**Vorbild:**
- Matrix Awakens: 7 000 Häuser auf 16 km², aus Modulen.
- GTA V: ~4 155 Befehle je Bild, LOD-Ringe, Nebel.
- HLOD bzw. World Partition; Interior Mapping für Fenster ohne Geometrie.
- Horizon: die Setzung als deterministische Funktion.
- Cities Skylines 2 als Warnung: 36 M Dreiecke und 72 % Schatten.

## Bauen

1. **Sektor 1 = die C-Bühne steht durch den Plan.**
   - Zeile in `GENESIS_ORT.stadt` (fachwerk-core.js; der Abschnitt gehört ort-plan, die Zeilen setzt du danach): `dorf 7 300` genau am Ort
     von stadt-voll (Markt 836,2/438,5).
   - Sie entsteht, wenn sie fällig ist (Dorf-Zug, ≤ 260 m + Vorlauf). Vom Platz aus (944 m) ist sie nicht fällig und wird nicht gebaut.
   - Im Rang-Gesetz ist der Sektor ein fester Eintrag: wilde Orte in seiner Reichweite weichen ihm.
   - Messorte stadt und stadt-voll ohne Wort. Die Basis der ABAB-Zelle `stadt` beginnt in DERSELBEN Welle neu (alte Zahl am Wort, neue am
     stehenden Ort, OMEN).
2. **Fahrweg:** Wegenetz vom Knoten `genesis` (ort-plan) über die Strecke (360/330) und den Anlauf 400/400 zur C-Bühne, mit Asphalt (grund).
3. **Silhouette:**
   - Ein Term der Ferne (Welt-March bzw. Fern-Ring), gerechnet aus den Slot-Grundrissen DERSELBEN Pläne, erst wenn ein Plan gerechnet ist.
   - EINE Quelle, kein vereinfachter Zwilling einer Stadt.
   - Fenster als Interior Mapping im Shader. Schatten werfen nur Häuser im Nah-Ring.
   - Im Ankunftskegel (N ±69°) entweder schon im ersten Bild (Horizont-Term) oder ein Anteil ≤ 0,5 % am K2-Bild.
4. **Sektoren 2–n** (Phase 2, nur wenn E am Platz mit Sektor 1 hält):
   - Pläne mit nH ≤ 500 bei 1,1–1,5 km in freien Richtungen: O, SO, W, NW.
   - Nie in der Sicht der Mess-Wiese (−280/−1046, Blick WSW) und nie am Dorf-Messort (−841/−861).
   - Ziel ~2 300 Häuser. Live ist nur der Sektor in Zug-Nähe; die anderen stehen nur als Silhouette.

## Budget

- **An S1, S2, S5 und S6:** Silhouette ≤ 2 Befehle / 20k Dreiecke, ≤ 0,5 MB, ≤ 0,2 ms GPU, 0 ms Haupt-Faden.
- **Die Stadt selbst an S12 (Messort stadt-voll):** E ist dort offen. Den Haupt-Faden besitzen e-takt und Verkehr-C; du verschlechterst ihn
  nicht. Die Silhouette ist ab Phase 1b dein Teil.
- **Kalt-Zeile (B):** unverändert, denn keine Stadt liegt im ersten Bild.

## Dateien (Besitz)

- fachwerk-core.js §GENESIS_ORT, nur die Zeilen `stadt`, nach ort-plan.
- stamm/gelaende-fern.js und stamm/bild-sicht.js (Silhouette).
- stamm/siedlung-ort.js (feste Sektoren im Rang-Gesetz und im Wegenetz), erst nach ort-plan.
- spec/profiband/haushalt.json, nur die Messorte stadt und stadt-voll.
- **NICHT anfassen:** siedlung-verkehr.js und siedlung-bewohner.js (Verkehr-C, familien); gelaende-core.js (grund).

## Wartet auf

- w4-ort-plan im main.
- e-takt (stamm/bild-sicht.js) und w4-ankunft-5 (gelaende-fern.js, bild-sicht.js) gelandet.
- w4-verkehr-c.
- Lokal: auf den nächsten freien GPU-Platz (höchstens 3 lokal). Werkbank 4680–4689, punkte 8080.

## Beweis

**Headless:**
- Plan-Hash Sektor 1 = der Plan von stadt-voll am Wort (gate:settlement, Studio = Welt).
- Der Fahrweg: das Wegenetz trägt die Kante `genesis` ↔ Sektor 1.
- Silhouette: Byte-Beweis der Ferne ohne Stadt.

**Radeon** (≤ 2 min je Lauf):
- Bilder mit Silhouette, zu 0,5 und 0: von der Terrasse über die Lichtung der Strecke (0/110 → 836/438) und von der Tribüne der Strecke.
  Vom Kern und von der Wiese aus verdeckt der Gürtel die Ferne; miss, was dort zu sehen ist, und behaupte nichts.
- gpu-bank S1 vorher↔nachher.

**OMEN:**
- Messort stadt-voll alt (Wort) und neu (steht): je 4 Boots, Befehle, Dreiecke, VRAM, CPU-Takt.
- Kalt-Zeile 3× unverändert.

**Tor:**
- Die Silhouette hält ihr Budget.
- Kalt-Zeile Median nicht schlechter.
- Die neue Basis von stadt ist im selben Commit dokumentiert.

## Abgabe

- Zweig: w4-stadt-ring. Commit-Betreff: „Abgabe w4-stadt-ring: …“.
- Bericht in drei Sätzen mit Bild-Pfaden.

## Lehren der letzten Abgaben

- **z94** galt als LANGSAMER, war aber der Wechsel der Messung auf die bewohnte Stadt, also eine neue Basis und kein Revert. Schreibe den
  Wechsel der Basis in denselben Commit.
- **stadt-heil:** Die Pause der Stall-Akte schnitt scripts um −227. Der Haupt-Faden der Stadt ist die Bremse, nicht die GPU (2,4–2,5 ms je
  Bild am 22.10.).
- **b-panorama:** Der swiftshader-Gewinn trug auf der GTX nicht. Darum: die Ferne nur am echten Gerät beurteilen.

## REGELN (Baustein des Koordinators)

- Eigener Worktree unter %TEMP%/claude/w3/<name>/ (nie im Haupt-Klon, nie in fremden Worktrees); node_modules per Junction auf den Haupt-Klon.
- Fetch-Falle: `git fetch origin "+refs/heads/X:refs/remotes/origin/X"`.
- GPU nur über `artifacts/profiband/werkzeug/gpu-lauf.sh`, je Aufruf ≤ 2 min; NIE eine Serie, ein ABAB oder eine ganze Sitzung lokal —
  die GTX der OMEN misst groß. Der echt-Job jedes Zuges teilt das Schloss: wer es lange hält, hält den Zug auf. headless braucht kein Schloss.
- Werkbank-Ports: 4690–4699 gehören dem echt-Job des Radeon-Läufers (sein Hook beendet dort jeden fremden Hörer beim Job-Start); nimm den Port, den der Brief nennt.
- Werkbank: die Welt steht zwischen Befehlen (`window.__loop(true)` nur fürs Warten, danach `__loop(false)`); Pfade an node als Windows-Pfad.
- Beende nur Prozesse, deren PID du selbst gestartet hast — nie nach Name, Muster oder „Elternprozess fehlt“.
- Sichtbares beweist ein Bild vorher/nachher (Pfad im Bericht).
- Commit-Autor: `git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit`; Betreff „Abgabe <zweig>: …“.
- Verbotene Wörter in Commit-Nachrichten: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU. Nie `git stash`.
- Auf Zweigen läuft nur der Puls der CI — warte nie auf die volle Batterie.
- Bericht in drei Sätzen: geschnitten (Datei:Zeile), gemessen (Zahl vorher → nachher), ehrlich offen.
- CLOUD: eine Cloud-Sitzung hat keine GPU — swiftshader baut jede Pipeline synchron (42–292 s je Programm, ein Kopf-Bild 16 min). Sie liefert
  Code + headless Beweis (Zähler, Byte-Diff, Faden-ms, Selbsttest der Linse) und schießt KEINE Welt-Bilder zum Beweis; die Bilder macht der
  Koordinator auf der Radeon (warme Welt, ~3 min) und der GTX (OMEN-Station).
