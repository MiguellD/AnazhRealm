# 36 Der GPU-Frame: Befehle, Dreiecke, Überzeichnung, Schatten-Pässe — das Budget je Klasse

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
BILD = C:/Users/micha/AppData/Local/Temp/claude/fa3ae9100e9cef81/d8d2df10-ebf6-4cbd-9974-a3e064fbe5d4/scratchpad/
- `wiese-mitte/heute-wiese.png` (Mess-Wiese, Augenhöhe): die obere Hälfte ist fast ganz Baumkrone, mit kleinen Himmelsflecken.
  Die untere Hälfte ist ganz Gras. Fester Boden ist kaum zu sehen. Nach Augenmaß decken Laub und Halme gut 90 % des Bildes, und
  beide werden mit alphaTest gezeichnet. Bei 20–60 m liegen links flache, dreieckige Zacken-Reihen (die Schale).
- `wiese-mitte/kand3-wiese.png` (gleiche Kamera, w28-wiese-fern): die Zacken sind weg. Bei 20–40 m stehen feine Halme, ab ~40 m wird
  es eine glatte, hellere Fläche.
- `wiese-mitte/kand3-wiese.maske.png` (Klassen-Maske): orange (Nähe) liegt unten im Bild ab y ≈ 800, grün (L1/L2) bei y ≈ 650–850,
  graublau (Übergang) bei y ≈ 600–700. Gelb (Ferne Lf) ist ein Band bei y ≈ 490–640. Die Gras-Stufen überlagern sich an ihren
  Rändern. Die Maske zeigt nur die vorderste Schicht. Wie viele Schichten jedes Pixel bezahlt, zeigt kein Bild.
- Was es kostet: auf der Radeon 890M braucht die Ego-Sicht an der Wiese **37,5 ms GPU** (gpu-bank, `git show origin/w28-wiese-fern`
  Rumpf 476a3ed9). Die Meisterkarte verlangt ≤ 12 ms GPU p95 (PM src/g6.js:148). Der Spieler spürt das als halbe Bildrate.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
SPIEL = .claude/worktrees/leib-kanon-urteil (main ec281422)
1. **Der Haushalt je Klasse kennt nur Befehle und Dreiecke.** `spec/profiband/haushalt.json:416-698`: 14 Klassen, je `befehle` +
   `dreiecke`. GPU-ms gibt es nur als Gesamt-Band `band.gpuMs` 16,7 (haushalt.json:5-11). Der Richter prüft je Klasse × Pass nur
   `["befehle","dreiecke"]` (scripts/lib/band-urteil.cjs:876-880, die Ratschen-Summe :786-802). Die GPU-Zeit wird nur als Gesamt
   gegen das Band geprüft (:826-831). Die Ratsche hält Klasse × Pass × {befehle, dreiecke} (`spec/profiband/ratsche-wiese-radeon-ego.json:41-237`).
   Sie ist vom 14.10. (V18.545.0, :5-6), und `nahWieseFern` steht dort auf null (:112-125).
2. **Was eine Klasse wirklich kostet, misst schon die Zerlegung, aber sie urteilt nicht.** `werkbank zerlegen`
   (scripts/werkbank.cjs:2649-2763, scripts/lib/zerlege-linse.cjs:1-56) schaltet jede Haushalt-Klasse am echten Weg ab und misst ABBA
   in ms. GTX 1060, Mess-Wiese, 21.10. (KO bericht/2110-profiband-k3/zerlegen.txt): gesamt 11,71 ms ·
   **baum 3,53 ms (30,2 %, 50 Befehle)** · **karten 1,14 ms (9,7 %) mit 1 Befehl** und ~1 168 Dreiecken (Ratsche :56-60) · boden
   0,77 ms bei 7 Befehlen und 77k Dreiecken · nahWiese 0,67 ms · alle Schatten zusammen 0,21 ms, k0 0,17 und k1 0,04 (:6-9). Die
   Streuung liegt bei σ 0,04–0,25 ms. Eine Kartenklasse mit 1 Befehl kostet also 1,5-mal so viel wie der ganze Boden. Gemessen an
   Dreiecken liegen die Klassen um Faktor ~70 auseinander. Die Kosten liegen in den Fragmenten.
3. **Auf der Radeon rauscht dieselbe Zerlegung zu stark zum Urteilen.** Ego, 8 Runden: nahWiese 5,63 ± 4,80 · nahWieseFern 3,02 ± 3,55 ·
   Schale 0,57 ± 2,00 bei 39,81 ms gesamt (Rumpf 476a3ed9). Die Paare heute ↔ Kandidat lagen bei +7,0 · +2,3 · +12,6 ms. Daraus folgt nicht,
   ob Licht oder Decke kostet. Der Arbeiter brauchte dafür eine eigene Gegenprobe, und sie steht aus (UEBERGABE §4 Z. 43).
4. **Dreiecke sanken, die GPU-Zeit stieg.** Am Kandidaten fielen die Dreiecke 365 797 → 351 275 und die Befehle 94 → 93. Die Ego-GPU
   stieg dabei 37,5 → 45,3 ms (Rumpf 476a3ed9). Der Haushalt wäre GRÜN gewesen. Der Halm-Stoff trägt alphaTest (stoff-material.js:1744,
   :1756; der Halm der Ferne ist ein Klon desselben Stoffs, :62-132). Fragmente mit alphaTest haben keinen frühen Tiefen-Schreib.
5. **Fragmente kosten auf der Radeon viel; das zeigt schon die Zeichen-Reihe.** Nur die Reihenfolge vorn → hinten
   (`_zeichenFolge`/`_zeichenRang`, bild-kosten.js:1299-1323) brachte Genesis Ego 28,25 → 23,38 ms und Dorf Ego 27,27 → 22,05 ms (:1305-1306).
   Die Radeon ist durch Füllung begrenzt.
6. **Das Spiel selbst schätzt seine GPU-Last aus Draw-Calls.** `_nexusPerfActuate` setzt `renderLoadMs = sense.renderCalls ×
   PERF_RENDER_CALL_MS` (stamm/dirigent-regler.js:288-293). Die Konstante ist 0,011 ms, „1092 Draw-Calls ≈ 12 ms" (:2021-2024). Heute
   hat das Bild 78–94 Befehle (Ratsche :37, Rumpf), also rechnet der Regler mit ~1 ms GPU-Last, während die Radeon 37,5 ms misst. Dabei
   liegt die echte Zeit schon im selben Objekt: `_perfGpuSample` → `sense.phase.gpuMs` (echt per timestamp-query, sonst frameMs − ΣCPU,
   :131-140). Gelesen wird sie nur von der Laub-Ruhe-Wand (:349-354). Das sind zwei Quellen für dieselbe Größe, also ein Zwilling (G4).
   Die Folge: ist das Bild füllungsbegrenzt, sieht der Regler als teuerste Domäne Streaming oder Wasser. Dichte, Godrays und
   Schatten-Takt (`effArch`, :385-391, :408, :427) geben dann zuletzt nach, obwohl gerade sie die GPU entlasten würden.
7. Schatten sind an der Wiese nicht der Hebel. Sie kosten 0,21 ms (Punkt 2). Die Kaskaden-Box passt sich der Scheibe an
   (bild-schatten.js:560-617), und der Wurf des Feuers ruht am Tag (:551-558).

## Die EINE begrenzende Entscheidung
**Was eine Bild-Klasse kostet, wird in GPU-Millisekunden am Schirm gemessen, nie in Dreiecken oder Befehlen.** Das Spiel liest seine
GPU-Last nur noch aus der gemessenen GPU-Zeit. Der Richter hält dieselbe Größe je Klasse × Pass als Ratsche („Kosten nicht über
heute", sie darf nur fallen). Gemessen wird mit der bestehenden Zerlegung auf der GTX, weil ihre Streuung dort ≤ 0,25 ms ist.
Befehle und Dreiecke bleiben als Zeilen im Bericht stehen, urteilen aber nicht mehr allein über die Kosten.
Kein Soll wird bewegt: Band 16,7 ms und K3-Soll 12 ms bleiben. Die Klassen-ms sind eine Ratsche aus einer Messung, keine Schwelle.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Die Klasse sind „GPU-Kosten ohne Namen der Fragmente". Alle drei Stufen fallen in einer Welle:
- **Stufe Spiel (der Regler):** `renderLoadMs` = `sense.phase.gpuMs` (Gesamt-GPU ohne den CPU-Teil `p.render`). Die Zeile
  dirigent-regler.js:292 und die Konstante `PERF_RENDER_CALL_MS` (:2021-2024) fallen. `renderCalls`/`renderTris` bleiben als Anzeige.
  Leser-Liste:
  - Aktuator dirigent-regler.js:288-310
  - EWMA :117-120 (bleibt für HUD)
  - HUD :614, :662, :828 und stamm/werkstatt-hud.js:1336 (nur Anzeige)
  - Flugschreiber :1266, :1540-1541
  - Proben scripts/playtest/dirigent.cjs:222-227 (akt mit `renderCalls`), :1334 und :1398 (`sense(ls, calls, frameMs)`; ihr
    `calls` 2000/0 wird `phase.gpuMs` 60/2)
  - scripts/diag-render-tap.cjs:114 (liest die Konstante; die Prüfung „renderCalls beschränkt" :141 bleibt, die Konstante fällt)
  - feld-leben.js:668 liest `renderCalls` als Zahl, nicht als Kosten (nicht weiter gelesen)
- **Stufe Richter (die Ratsche):** band-urteil.cjs:876-880 bekommt `"gpuMs"` neben befehle/dreiecke, ebenso der Ratschen-Block
  :786-802. Die Quelle je Klasse ist die Zeile `deltaMs` der Zerlegung (zerlege-linse.cjs:2015, Klassen über `band-urteil.zuordnen`
  :25-27). Leser-Liste:
  - die 12 Dateien `spec/profiband/ratsche-*.json` (neues Feld je Klasse × Pass, null = ungemessen wie heute)
  - Schema gate:profiband (`scripts/diag-profiband.cjs`, nicht gelesen)
  - werkbank `ratsche` (setzt aus der Serie; die Stelle ist nicht gelesen)
  - `/zerlegen` werkbank.cjs:2671-2675 (liest den Haushalt schon)
  - `toleranzAbs` je Datei (:28-32) um `gpuMs` = 2σ der Serie
- **Stufe Abgabe:** jede sichtbare Klassen-Abgabe nennt `zerlegen --nur <ihre Klassen>` vorher ↔ nachher an der GTX, Ego, an
  ihrem Messort. Die erste ist w28-wiese-fern: `--nur nahWiese,nahWieseFern,karten,baum`. Damit beantwortet die Zerlegung die
  offene Frage Licht oder Decke ohne eigenen Umbau. Danach trägt dieselbe Zeile das Dorf, wo der Spieler ankommt (`--ort dorf`).
Kosten-Zeile:
- Spiel: −1 Multiplikation je Takt, keine GPU-Arbeit.
- Richter: eine Zerlegung kostet 74,6 s auf der GTX (zerlegen.txt:54) je Ort × Sicht. Sie läuft im Mess-Takt, nie im Zug.
- Programm-Zahl und Ankunft: unverändert, kein Stoff wird angefasst.
Kriterien der Meisterkarte (PM stand.json `je`, src/g6.js:174-182):
- **profiband.K3** „GPU-Haushalt am Spieler-Bild", 0 Punkte. Ist: GTX Wiese 12,99 ms (23.10.), Radeon Ego Wiese 37,5 ms (13.11.).
  Soll: GPU p95 ≤ 12 ms, Befehle ≤ 208, Dreiecke ≤ 680k, VRAM ≤ 118 MB. Station `werkbank band --ort` + Ratsche; Radeon und GTX
  stehen auf UNGEMESSEN (Absturz 3221226505, Fremd-Last). Der Schnitt bringt K3 keinen Punkt. Er bringt den Namen des Täters an jeder Abgabe.
- **profiband.K1** „Flüssig in Bewegung", 0 Punkte. Soll p95 ≤ 33 ms in jeder Zelle. Der Regler drosselt danach am GPU-Täter.
- Pflicht **E** (Profi-Band) und die Kosten-Bedingung des Kurses §2.1 an jeder Abgabe.
Abgabe-Bedingung:
- Das Bildpaar an der Wiese und am Dorf ist byte-gleich, denn die Ratsche ändert kein Bild.
- Im Regler-Schnitt ändert sich das Bild nur unter Last. Gegen heute misst `werkbank lauf --regler voll` an der Radeon: Frame p95 und
  `_foliageDensityScale` am Ende.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Zerlegung, Klassen-Zuordnung und Selbsttest stehen auf main (zerlege-linse.cjs, werkbank.cjs:2649-2763). Ein Lauf vom 21.10. auf
  der GTX liegt vor (KO bericht/2110-profiband-k3/zerlegen.txt). Seit S6, bausatz-absage und der Schale ist er veraltet.
- Die echte GPU-Zeit im Spiel steht auf main (`_perfGpuSample`, dirigent-regler.js:135-140, Frische `PERF_GPU_TS_STALE_MS` :2019).
- Kein Zweig trägt diesen Schnitt.
- Es fehlt:
  - Regler-Zeile + Proben (S)
  - `gpuMs` in band-urteil + Schema (M)
  - eine Serie `zerlegen` × 4 an der GTX, Wiese und Dorf, Ego und Third, zum Setzen der Ratsche (OMEN/GTX 1050, nur unter `gpu-lauf.sh`)
- w28-wiese-fern 476a3ed9 wartet genau auf diese Zahl (siehe 11-wiese.md, Entscheidung „Büschel nie verformen").

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gelesen: `scripts/diag-profiband.cjs` (Schema), der Setzer `werkbank ratsche`, `_perfGpuSample` im Ganzen, und ob
  timestamp-query auf der Radeon im Spiel „echt" liefert. Fällt es auf den Proxy frameMs − ΣCPU, enthält der Wert VSync.
- Nicht gemessen: eine Zerlegung am Kopf ec281422 auf irgendeinem Gerät. Ebenso wenig die Schichten je Pixel (Überzeichnung) einer
  Klasse; kein Werkzeug im Repo zählt sie (Grep „overdraw|Überzeichnung" in scripts/: 0 Treffer). Die ms der Zerlegung decken
  Überzeichnung und Licht-Modell zusammen ab und trennen sie nicht.
- Radeon-Rauschen: σ 4,8 ms bei 5,6 ms Wert. Die Klassen-Ratsche urteilt darum nur auf der GTX. Was die Radeon füllungsbegrenzt
  zusätzlich zahlt, sieht sie nicht. Die Radeon bleibt Richter der Gesamtzeit.
- Widerspruch in der Zerlegung: `post` −4,23 ms (zerlegen.txt:10). Ohne Post-Kette zeichnet der Direktpfad mit Szenen-Skala 1
  statt 0,75 (bild-kosten.js:3704). Das ist ein Hinweis, nicht geprüft.
- Pfadfinder-Fund: `foliageOpaqueCore: false` „true = A/B" (dirigent-kern.js:833-836, vegetation-baum.js:539-551) ist ein geparkter
  Zwilling gegen die Laub-Überzeichnung, also die 3,53 ms der Klasse baum. Er ist weder gemessen noch gestrichen.
- `haupt (Neustart) 2,0×` je Bild (zerlegen.txt:41): der Hauptpass bricht zweimal für das Tiefen-Abbild und lädt 11,1 MB neu. Was
  das auf der Radeon kostet, ist nicht gemessen.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Wirkung 4 im Takt: jede künftige Bild-Abgabe nennt den Täter in ms, statt +7 ms ohne Namen zu tragen. Der Regler drosselt unter
  Füll-Last, was die GPU entlastet. Im Bild selbst ändert sich nichts (1).
- Aufwand M: Regler S, Ratsche + Schema M, eine GTX-Serie.
- Risiko: der Regler sieht plötzlich 37 statt 1 ms GPU-Last. `effArch` fällt dann an der Radeon tief, und Laub-Dichte und Godrays
  sinken sichtbar. Ob das im Bild schlechter liest als die verlorene Bildrate, zeigt erst das Bildpaar unter `--regler voll`.
