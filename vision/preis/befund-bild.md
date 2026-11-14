# Befund: die Bilder ueber 100 ms und das p95 der Radeon (Preis des Orts, Mess-Wiese)

ZWISCHENSTAND. Gelesen: der Roh-Strom der Radeon 337846dc. Gemessen: Radeon 890M, main 41ec3a96, 14.11. 19:20–19:25 unter dem
GPU-Schloss „befund-bild“ (zeit, ganz), Werkbank `start --echt`, `fenster 1920 1080`, `umstellen --ort wiese` (-280,4, -1045,6),
Skala 0,75. Rohdaten und Bild: `artifacts/profiband/auge/w28-preis-ort/befund-bild/wiese/` (haenger-einlauf, haenger-steht,
lauf, lauf2, gpu-bank, wiese-schirm.png); die erste Fahrt (18:38, irrtuemlich am Spawn 0,0) daneben in `befund-bild/`.

## Die Zahlen

| Fahrt (Wiese, 41ec3a96) | Bilder | p50 | p95 | max | takt p50 | Leine haelt | GPU |
|---|---|---|---|---|---|---|---|
| Preis-Lauf-Zwilling 1 (`lauf 20 --ein 30`, Regler frei) | 737 | 25,2 | 33,8 | 58,6 | 6,9 ms | 69 % der Takte | Durchsatz p50 26,2 ms |
| Preis-Lauf-Zwilling 2 (dieselbe Pose, 2,5 min spaeter) | 464 | 41,9 | **58,6** | 67,1 | 8,4 ms | 81 % | Durchsatz p50 44,7 ms |
| Haenger stehend (60 s nach 10 s, Regler voll) | 1657 | 33,5 | 50,4 | 108,7 | — | — | 226 von 229 Bildern > 50 ms: GPU-Leine |
| Haenger Einlauf (20 s ab dem Umstellen) | 406 | 50,2 | 66,9 | 175,6 | — | — | 182 GPU · 65 TAKT |
| gpu-bank (12 Bilder ohne rAF) | — | — | — | — | CPU 2,15 ms | — | **26,3 ms je Bild, gpuGebunden** |
| gpu-bank am Spawn (53 Befehle, 211 k Dreiecke) | — | — | — | — | CPU 1,72 ms | — | 22,1 ms je Bild |

Strom 337846dc (Radeon, `meisterkarte-quelle/punkte/messung/roh/337846dc-radeon/sitzung/strom.ndjson`, Spalten punkte.cjs:2781):
das Fenster der Akte zaehlt das Einschwingen mit — `/lauf` faehrt `{ sek: 20, ein: 30 }` (punkte.cjs:2894, werkbank.cjs:3014), der
Haken des Stroms nimmt jedes Bild der 50 s (richter-akte.cjs:47). jahreslauf (p95 58,5 · max 184): 15 von 15 Bildern > 100 ms in den
ersten 2,6 s (takt 11–21 ms, Heap 453 → 503 MB), danach max 75 ms, p50 33,5 = 4 Vsyncs der 120-Hz-Anzeige (stehend 3× 357, 4× 561,
5× 200, 6× 141, 7× 46 von 1327). kraft (p95 83 · max 268, die erste Probe 1 min nach dem Boot): die grossen Bilder bei t+8,8 s
(takt 113 ms) und t+20,3 s (takt 189 ms) — CPU.

## Die drei Ursachen

### 1. Der Vorbau der Bedienung baut in der stehenden Welt Stuecke von 50–200 ms in EINEM Takt (alle CPU-Bilder ueber 100 ms)

`_vorbauBedienung` (stamm/siedlung-bauten.js:1365) laeuft je Takt auf der Laeuft-immer-Seite NACH dem Bild (stamm/dirigent-takt.js:408),
ausserhalb der EINEN Frist (`_fristStellen` dirigent-takt.js:1875) — sein Tor ist nur „die Welt steht und die Eingabe ruht“, genau
der Zustand jedes Preis-Laufs und jedes stehenden Spielers. Seine Schritte sind atomar und gross, gemessen je Bild (Haenger-Linse):

| Schritt | Datei:Zeile | ein Bild |
|---|---|---|
| `_uiVorbau` › `renderInventoryUI` › `renderRecipeBook` | werkstatt-hud.js:2767, werkstatt-hof.js:224 | 175,6 ms (Spawn 200,8, davon GC 38) |
| `_uiVorbau` › `_renderWorkshopDOM` › `_workshopRenderTail` | werkstatt-vorschau.js:248 | 159,1 ms (Spawn 175,8) |
| `_tuchVorbau` › `_tuchGitter` › `_tuchGitterStufe` | koerper-fahrt.js:327, koerper-core.js:8474 | 159,0 ms |
| Gaeste `vorwaermen:human`, `vorbau:fahrzeug_gt`, `vorbau:haus_alemannisch`, `vorbau:baum_eiche`, `vorbau:tor_drachentor` › `_knotenRate › build` | bild-kosten.js:861 | 50–134 ms je Bild, Σ 1973 ms in 20 s (Spawn 3710 ms in 60 s, 47 von 85 Haengern) |

Der Knoten-Bau in Raten fragt die Frist je Fluss-Knoten (bild-kosten.js `ueber()`), aber EIN Fluss-Knoten baut seinen ganzen Teilgraphen
im Vendor am Stueck (`F[R.k].build(b)` bild-kosten.js:922, Pfad build › build › build … 60–73 %): ein Schritt `bauN 1 · bauMs 64,4`. Beide Fahrten
zeigen sie 10–14 s nach dem Start des Loops, die Akte kraft bei t+8,8 und t+20,3 s.

**Schnitt an der Wurzel:** der Vorbau wird ein Bauer der EINEN Frist — `_vorbauBedienung` geht durch `_bauStueck("vorbau", …)` wie
jeder Bauer des Planers und nur, wenn der Takt Frist uebrig hat; jedes Stueck, das die Frist nicht teilen kann, verlaesst den Takt:
das Tuch-Gitter (reiner koerper-core) in den Faden, die DOM-Vorzeichnung (Rezeptbuch, Werkstatt, Schubladen) in `requestIdleCallback`
mit Frist statt im rAF, der Gast-Bau mit der Granularitaet unter der Frist (ein Fluss-Knoten zu gross: der Gast baut nur, solange kein
Bild faellig ist — Leine gespannt, der Zwischen-Takt).

### 2. Das p95 der Radeon ist die GPU, gerundet auf die 120-Hz-Anzeige — der Takt ist es nicht

An der Wiese braucht die Radeon **26,3 ms GPU je Bild bei 2,15 ms CPU** (gpu-bank); die Leine haelt 69–81 % der Takte, 226 von 229
stehenden Bildern ueber 50 ms sind „GPU-Leine ohne Auftrag“ (takt 11–20 ms je Haenger). 26 ms werden an der 120-Hz-Anzeige 33,5 ms
(4 Vsyncs, p50) und die Streuung 50–58 ms (6–7 Vsyncs, p95). Die r184-Pass-Stempel erklaeren davon nur 5–10 ms (haupt 1,2 · TRAA
1,0 · post 0,6 · kontakt 0,45 · k1 5,8 je 16. Bild): **rund 16–20 ms GPU je Bild stehen in keinem Stempel** — Compute-Paesse, die
Kopie auf die Leinwand, der Compositor; der Stempel-Pool lief im Strom 337846dc ueber (`stempel` 2430 verweigerte Abfragen,
Stempel-Wache zerlege-linse.cjs:400), die gpu-Spalte der Akte unterschaetzt die GPU.

**Was Geraet ist, was Welt:** der Spawn (53 Befehle, 211 k Dreiecke) kostet schon 22,1 ms, die Wiese (113 Befehle, 395 k Dreiecke,
volle Wiese im Bild) nur +4,2 ms — 84 % der GPU-Zeit haengen nicht am Inhalt der Welt, sondern am Bild selbst (1920 × 1080:
TRAA-Resolve und Flackern in voller Aufloesung, 1440 × 810 innen, Post, die ungestempelten Paesse) = die Fuellrate der iGPU an
der Bildkette. Und dieselbe Pose, dieselben Befehle, 2,5 min spaeter: Durchsatz 26,2 → 44,7 ms, p95 33,8 → 58,6 ms — das ist der
Zustand des Geraets (Takt/Waerme der iGPU), nicht die Welt; die Akte jahreslauf (58,5) traf genau diesen Zustand.

**Schnitt an der Wurzel:** die Bildkette als EINE Kostenzeile je Schirm-Pixel (Gebot 7): TRAA und Post rechnen in der inneren
Aufloesung und skalieren erst im letzten Pass hoch (heute 31,6 MB Resolve + 4,0 MB Flackern in 1920 × 1080), und die Zerlegung je
Verbraucher (`werkbank zerlegen`, zerlege-linse ABBA) nennt die 16–20 ms ohne Stempel beim Namen, bevor an ihnen geschnitten wird.

### 3. Der Einlauf: was der ruhende Loop aufschob, landet in den ersten Bildern auf der GPU

Nach dem Wechsel der Probe (der Loop ruhte, Lehre 17) zeigt die Wiese 20 s lang 248 von 406 Bildern ueber 50 ms: 136 GPU-Leine,
41 Shader-Module (29 asynchrone Pipelines, 48 Module im GPU-Prozess), Uploads 5–7 MB je Bild, dazu der Gast-Bau aus (1). In der Akte
jahreslauf sind es die 15 Bilder ueber 100 ms der ersten 2,6 s bei takt ≤ 21 ms — die Wartezeit liegt auf der GPU. Die Leine zaehlt
Bilder im Flug (`GPU_FRAMES_IM_FLUG = 2`, welt-licht.js:148; `_gpuLeineFrei` dirigent-takt.js:799), nie GPU-Millisekunden: was ein
Takt an neuen Pipelines und Uploads abschickt, ist ungedeckelt.

**Schnitt an der Wurzel:** eine GPU-Frist je Bild neben der CPU-Frist — Pipeline-Erzeugung und Uploads gehen durch denselben Bauer
(`_bauStueck`), hoechstens ein Paket je Bild, und neu gebaut wird nur bei Aenderung. Verdacht, ungemessen: die Buehne jedes Laufs setzt Saison, Wetter und Himmel
auch dann, wenn sie schon gelten (`buehne` ausgabe-aufnahme.cjs:351 ruft `setSeason`, `_himmelSprung`, `_tickSeason` bedingungslos).

## Nicht die Ursache

GC: in allen Haengern zusammen 48–104 ms, Belegung gc p95 1,2 ms je Bild — das Wachstum des Heaps (385 → 628 MB ueber die Sitzung)
ist eine Frage des Speichers, nicht der Bildzeit.

## Ehrlich offen

- Die 16–20 ms GPU ohne Stempel sind nicht beim Namen (`werkbank zerlegen` an der Wiese ungefahren).
- Der GTX-Strom (191,65 ms) liegt nicht unter roh/337846dc-gtx — die GTX-Seite ist ungelesen; die Lage (kraft, erste Probe nach dem
  Boot) spricht fuer Ursache 1.
- Der Sprung 26 → 45 ms Durchsatz an derselben Pose ist als Geraet benannt, nicht gemessen (kein Takt-/Waerme-Zaehler der iGPU).
