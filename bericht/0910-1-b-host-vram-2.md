# Bericht 0910-1 B: Host-VRAM Runde 2 — die Wiese unter 118 MB

Auftrag: `auftrag/0910-1-omen-linse-genesis-und-host-vram-2.md`, Teil B.
Kopf: **welle-m-host-vram-2 33c47206** (per `git ls-remote`), Basis main 76c9624d.

| Commit | Inhalt |
|---|---|
| 04e72fa0 | das Ausgabe-Ziel in rg11b10ufloat |
| f9f03290 | Kaskaden-Raster |
| f4731281 | Raster zurück |
| 3c308247 | Wasser-Satz |
| 33c47206 | eslint |

CI: Lauf 37988023701 am Kopf 33c47206 — 5 von 5 grün (check, erst-zeichnung, playtest 1/3, 2/3, 3/3). Der WIP-Stand f9f03290 war in der CI rot, im ESLint-Schritt (`GPUTextureUsage` nicht deklariert, 37975609351). Das ist mit
33c47206 behoben.

## In drei Sätzen

**Geschnitten:**
- Das Szenen-Ziel `output` liegt in rg11b10ufloat statt rgba16float (−7,9 MB).
- Die Rundung gegen null, die GTX, swiftshader und die Radeon beim Schreiben in 11/11/10 zeigen, gleicht eine Sonde beim Start aus.
- Der Wasser-Satz beginnt bei seinem Inhalt statt bei 2^16 Vertices (−2,3 MB im Band nach der Ankunft).
- Das Kaskaden-Raster (−1,9 MB) habe ich gebaut, gemessen und zurückgenommen, weil es die Schatten-Abtastung sichtbar ändert.

**Gemessen** (OMEN, GTX 1060, Mess-Wiese, 1080p, `werkbank band` nach der Ankunft, die Prozedur der Radeon-Zahl):
- VRAM main 126,2–127,0 → Kopf 116,3 / 116,3 MB, Band 118.
- Bild gegen main in 20 Blicken (Tag, Wasser, Wald, Himmel, Nacht, Abend, fern) im Rausch-Boden.
- 0 GPU-Fehler, auch über sechs Fenstergrößen.
- Die Zeit-ABAB (8 von 8 grün) ist nicht langsamer: gpu-bank −0,9 / −0,7 ms; im verdichteten Band der Messfolge VRAM
  122,2 → 114,5 MB.

**Ehrlich offen:**
- Die Radeon-Zahl (erwartet 126 − 7,9 − 2,3 ≈ 116 MB) liefert der Koordinator.
- Kandidat 3 (k1 1024, −6 MB) ist benannt, nicht gebaut.

## Die Linse: vorher ROT mit Täter, nachher grün

Ziel-Zensus (`werkbank ziele`, 12 Frames, Mess-Wiese). Neue Klassen in `scripts/lib/ziel-zensus.cjs`, je mit Selbsttest-Fall:
- **AUSGABE-FORMAT** (rot): `output` trägt 64 bit, obwohl das Gerät rg11b10ufloat rendert.
- **ADAPTER** (Hinweis, laut): Das Feature fehlt, also bleibt `output` rgba16float, mit der Zahl.
- **UMLEITUNG** (Hinweis): die 1×1-Attrappe des Tiefen-Abbilds, deren Kopie der Stamm in einen Pass umleitet.
  - Auf main fiel sie als „TIEFE OHNE LESER“ rot, das war ein Fehlalarm der Linse.
  - Der Stamm markiert die Attrappe jetzt (`__umleitung`).

| | main 76c9624d | Kopf 33c47206 |
|---|---|---|
| Zensus | 27 Texturen, 92,9 MB, **ROT (2)** | 27 Texturen, 84,9 MB, **GRÜN** |
| Täter | `AUSGABE-FORMAT: output (rgba16float 1920×1080, 15.82 MB) — das Gerät rendert rg11b10ufloat … (−7.91 MB)` · `TIEFE OHNE LESER: szene:tiefenabbild:bruch` | — (Hinweis UMLEITUNG) |
| `output` | rgba16float 15,82 MB | rg11b10ufloat 7,91 MB |
| Band VRAM | 126,2–127,0 MB (1,07×, ROT) | 116,3 MB (0,99×) |

Das Band bleibt auf beiden Seiten ROT, weil die Dreiecke 1,11–1,16× über der Ratsche liegen. Das ist nicht Gegenstand von Teil B.

## Zahlen je Stand (dieselbe Prozedur: Boot, Fenster 1920×1080, `umstellen --ort wiese`, Bühne, `band`, Zensus)

| Stand | Boots (Band-VRAM MB) | Zensus MB | Bild gegen main |
|---|---|---|---|
| A main 76c9624d | 126,5 · 126,8 · 126,2 · 127,0 | 92,9 | — |
| C Ausgabe rg11b10 + Ausgleich (04e72fa0) | 118,6 · 118,6 | 84,9 | GRÜN, 20 Blicke |
| B C + Kaskaden-Raster (f9f03290, zurückgenommen) | 116,6 · 116,6 | 83,0 | Tagesblicke mit Sonnen-Schatten unter dem Rausch-Boden |
| D C + k1 1024 ab Geburt (Versuch, nie committet) | 113,0 · 112,6 | 78,9 | siehe Kandidat 3 |
| **E Kopf: C + Wasser-Satz (3c308247)** | **116,3 · 116,3** | 84,9 | **GRÜN, 20 Blicke** |

**Das Bild-Instrument** (`p3/hv2/boot.sh`, `vergleich.cjs`, in `bericht/0910-1-b/`):
- Je Boot 22 Aufnahmen aus dem Ausgabe-Pfad:
  - Tag nord/ost/west/nah/naht.
  - Wasser: Ufer, See.
  - Wald, Himmel (nach oben).
  - Fern: 25 m über der Wiese, nach Nord und Ost.
  - Nacht (Tageszeit 0): nord, Wald, Himmel, Ufer.
  - Abend (0,76): west, Horizont, ost, fern.
- Bedingungen: Uhren fest (Wind, Knoten, Himmel 1000), Tiere aus.
- Die TRAA-Phase steht je Aufnahme auf 0. Ohne das streuten zwei Boots desselben Stands an jeder Kante und in den Wolken
  (Rausch-Boden MSSIM 0,92–0,99); mit fester Phase liegt er bei 0,985–1,0.
- Das Urteil: Jedes Quer-Paar liegt im Boden UND im ganzen Bild nicht tiefer als das schlechtere Rauschen-Paar − 0,01.
  Die Farbton-Blöcke dürfen höchstens doppelt so viele sein wie im Rauschen + 0,5 Punkte. Die mittlere Helligkeit darf höchstens
  2 × Rauschen + 0,5 Stufen abweichen.

## Kandidat 1: `output` → rg11b10ufloat (gebaut)

- **Der Pass trägt den Typ nicht von selbst.** r184 `PassNode.setup` schreibt bei jedem Bau `texture.type = renderer.getOutputBufferType()`.
  - Der erste Versuch (Typ vor dem ersten Render gesetzt) lief in ein RGB+HalfFloat-Ziel, also kein gültiges Format und tausende
    Validierungsfehler.
  - `_ausgabeFormat` stellt den Typ jetzt nach dem Bau des Passes (Instanz-Haken auf `setup`).
  - Der Renderer-Typ bleibt unberührt, denn er legt auch das Rahmen-Ziel des Direktpfads an.
- **Der Neustart der Geschichte:** Bei jedem Größenwechsel kopiert TRAANode `beauty → history` (`vendor/TRAANode.js:398`). WebGPU
  verbietet die Kopie zwischen rg11b10ufloat und rgba16float. `_traaNeustartZug` zeichnet darum statt zu kopieren: roher Pass,
  `textureLoad`, Alpha 1.
- **Die Rundung des Geräts:** Eine Sonde schreibt 1 + ¾ ulp (1,01171875) in ein 1×1-Ziel und liest zurück.
  - GTX 1060 und swiftshader liefern beide 1,0 (Rohwert `781e03c0`), runden also gegen null. W7 sah es auf der Radeon (Sonde 1,0117 → 1,0).
  - Unausgeglichen war jedes Bild um 0,23–0,66 Luma-Stufen dunkler und blauärmer (B−G −0,2…−0,5; 16 Blicke, Serie 1). Das liegt
    weit über dem Rauschen von 0,01–0,09.
  - Der Ausgleich hebt jede Abtastung des Szenen-Bilds in der Post-Kette um das Mittel des fehlenden halben ulp:
    2⁻⁷ · E[1/m] = 0,56 %, Blau 1,13 %. Rundet ein Gerät zum nächsten Wert, bleibt der Faktor 1.
  - Danach liegt der Unterschied zu main bei +0,03…+0,10 Luma, im Rauschen.
- **Banding:** Das Szenen-Bild EINES Frames trägt 6/6/5 Bit Mantisse. Auflösung und Geschichte bleiben rgba16float (W7: alle drei in
  11/11/10 posterisierten die Wolken). Himmel, Nacht-Himmel, Abend-Horizont und Wald liegen im Rausch-Boden (Bilder `himmel-*`,
  `n-wald-*`, `a-horizont-*`).
- **Ruhe** (zwei Aufnahmen desselben Blicks bei TRAA-Phase 0 und 16, mittlere |ΔLuma|): Himmel 0,480 → 0,492, Nahfeld 0,888 → 0,899.
  Gleich.
- **Adapter:** GTX 1060 und swiftshader (die CI) tragen `rg11b10ufloat-renderable`. Für die Radeon 890M nennt es der Zensus.
  Fehlt das Feature, schreibt der Stamm eine WARN mit Zahl, und der Zensus nennt ADAPTER.
- **Größenwechsel** (Leben-Schau 2: das Tiefen-Abbild überlebte ihn nicht): Bei 1920×1080 → 1280×720 → 1920×1080 → 1600×900 →
  1366×768 → 1920×1080, je 40 echte Frames, gab es 0 GPU-Fehler.
  - `output` folgt jeder Leinwand in rg11b10ufloat, das Neustart-Ziel ebenso. Die Klasse erbt `output` nicht.
  - Das Tiefen-Abbild fiel in diesem Lauf an der Wiese auch nicht; der Schnitt ist anderswo vergeben.
- **Vendor-Anker** +5: Feature-Name, RGBFormat × UnsignedInt101111Type → rg11b10ufloat, PassNode.setup, die Neustart-Kopie und
  Kanal a in clipAABB.

**Bilder** (`bericht/0910-1-b/*.jpg`, halbe Größe, selbst angesehen):
- `wald|himmel|n-wald|see|a-horizont-{main,kopf}`: main gegen Kopf mit fester Phase.
  - Kein Höhenlinien-Banding im Himmel, im Abendhimmel und im Nachthimmel über dem Wald.
  - Das Wasser bricht wie vorher (die Szene wird im Pass-Bruch in die Refraktion kopiert, rg11b10 → rg11b10).
- `wald-{nur-ausgabe,raster}`: das Raster gegen den Stand nur mit Ausgabe, die Kronen-Flecken am Boden.
- `fern-{k1-2048,k1-1024}` und `fern-{k1-an,k1-aus}`: Kandidat 3.
- Die Vollbilder (1920×1080) aller Boots liegen in `p3/hv2/bilder` auf dem OMEN.

## Kandidat 2: TRAA history/resolve (benannt, nicht gebaut)

- W7 (04.10., Radeon) hatte alle drei Ziele in rg11b10. Die Wolken posterisierten zu Höhenlinien, über die Geschichte ging das
  Mittel −2…−3 % Luma (Rundung gegen null in der Rückkopplung), und die Ruhe verdoppelte sich (0,29 → 0,58).
- Die Auflösung wird je Frame in die Geschichte kopiert (`copyTextureToTexture`), beide brauchen also EIN Format.
- Mit 5 % Mindestgewicht trägt die Geschichte ~20 Frames Rundung. 16 bit bleiben.

## Kandidat 3: Kaskade 1 (benannt, nicht gebaut)

- **k1 1024² ab Geburt** (−6,0 MB, gemessen 113,0 / 112,6 MB): Bildpaar fern, Mittag und Abend, in frischen Sitzungen.
  - Jeweils k1 an und aus (`shadow.intensity` 0), damit die Probe nicht vakuös ist.
  - k1 trägt in den Fernblicken 0,12–0,60 Luma-Stufen bei (an↔aus).
  - Zwischen zwei frischen Sitzungen schwankt die Welt um 0,11–2,84 (Kontrolle: k1 aus in C gegen k1 aus in D).
  - In 7 von 8 Blicken liegt 2048 ↔ 1024 auf der Kontrolle.
  - Im Blick „fern“ (25 m über der Wiese, 200 m nach Norden, Mittag) liegt 1024 mit 0,735 gegen 0,510 um +0,23 über dem Rausch-Boden,
    das sind 37 % des ganzen k1-Beitrags.
  - Das ist eine kleine, aber messbare Änderung, und sie ist nicht nötig, weil der Wasser-Satz die MB bildneutral trägt.
  - Die Zahlen je Blick (mittlere |ΔLuma| über das ganze Bild, in Klammern der Anteil der Pixel > 8 Stufen;
    `daten/k1-an-aus-1024.txt`, `daten/k1-leer.sh`, `daten/dluma2.cjs`):

| Blick | Signal: k1 an ↔ aus (C) | Wirkung: k1 2048 ↔ 1024 (C an ↔ D an) | Kontrolle: C aus ↔ D aus | Wirkung − Kontrolle |
|---|---|---|---|---|
| fern (25 m hoch, Nord, Mittag) | 0,602 (1,47 %) | 0,735 (2,32 %) | 0,510 (1,73 %) | **+0,225** |
| fern-ost (25 m hoch, Ost, Mittag) | 0,340 (1,01 %) | 0,563 (1,75 %) | 0,563 (1,74 %) | 0,000 |
| fern-flach (Auge, Nord, Mittag) | 0,315 (0,75 %) | 0,931 (2,78 %) | 0,923 (2,80 %) | +0,008 |
| flach-ost (Auge, Ost, Mittag) | 0,400 (0,69 %) | 1,914 (6,97 %) | 1,895 (6,97 %) | +0,019 |
| flach-west (Auge, West, Mittag) | 0,268 (0,28 %) | 2,838 (8,38 %) | 2,841 (8,38 %) | −0,003 |
| a-fern (25 m hoch, Nord, Abend) | 0,120 (0,13 %) | 0,110 (0,12 %) | 0,111 (0,12 %) | −0,001 |
| a-flach-west (Auge, West, Abend) | 0,210 (0,32 %) | 1,282 (2,87 %) | 1,282 (2,87 %) | 0,000 |
| a-flach-ost (Auge, Ost, Abend) | 0,305 (0,30 %) | 0,285 (0,29 %) | 0,284 (0,28 %) | +0,001 |

  - Im Bild-Instrument der Boots (feste Phase, gleicher Weltzustand in c2 und d1) lag 2048 ↔ 1024 in den Fernblicken bei
    0,000–0,005 (fern 0,000, fern-ost 0,005, a-fern 0,000).
  - Die +0,225 im Blick „fern“ stammen aus EINER Sitzung je Seite. Ob sie die Auflösung sind oder der Weltzustand dieser einen
    Sitzung, entscheidet erst ein zweites Sitzungs-Paar. Der Texel der Kaskade 1 wüchse von 0,47 auf 0,84 m (W7, 04.10.).
- **Das Raster** (f9f03290): Die Kartengröße auf den Bedarf statt auf die nächste Zweierpotenz gerundet (k0 1984, k1 1856; −1,9 MB).
  - Die Texel-Dichte fällt auf `texelM` zurück (die Dichte bis V18.529); main lag 3 % bzw. 10 % feiner.
  - Gegen C liegen die Tagesblicke mit Sonnen-Schatten unter dem Rausch-Boden: MSSIM bis 0,968 im Wald (Rauschen 0,989), 3,4 %
    Farbton-Blöcke; die Kronen-Flecken am Boden tasten anders ab (`wald-nur-ausgabe` / `wald-raster`).
  - Nacht und Abend liegen im Rausch-Boden.
  - Zurückgenommen in f4731281.
- **Befund am Rand:** Ändert sich `mapSize` einer Kaskade zur Laufzeit, folgen „Destroyed texture kaskade1:tiefe used in a submit“
  (415 in einer Sitzung). Im Spiel setzt `_kaskadenKarten` die Größe einmal bei der Geburt, also kein Spielfehler. Es ist aber
  dieselbe Klasse wie beim Tiefen-Abbild: Ein Ziel, das ein Leser gebunden hält, überlebt keinen Neubau.

## Kandidat 4: buf:szene (benannt, und ein Schnitt daraus)

- Der Unterschied ist die Prozedur, nicht das Gerät.
  - Das Band nach der Ankunft (`werkbank umstellen` + `band`) misst bei Satz-Takt ~575. Das liegt vor der Ruhe-Frist des Verdichtens
    (`_chunkSatzVerdichten`, 600 Takte).
  - Die Messfolge misst später, nach `lauf`, also verdichtet.
- OMEN, main:

| | buf:szene | bodenSatz | wasserSatz |
|---|---|---|---|
| werkbank band (nach der Ankunft) | 33,6 MB | 16,38 MB | 3,00 MB |
| Messfolge band (0910-2, verdichtet) | 29,4 MB | 14,39 MB | 0,52 MB |

- Die Radeon-Zahl (32,9–34,1) entspricht der Ankunft. Auf dem OMEN misst dieselbe Prozedur 33,6.
- **Der Schnitt** (3c308247):
  - Der Wasser-Satz hielt nach der Ankunft 3,0 MiB für 9 849 Vertices und ein Index-Hochwasser von 30 720 (0,4 MiB).
  - Er beginnt jetzt bei 16 384 / 65 536 statt 65 536 / 262 144 (1,7× / 2,1× Luft an der Wiese) und wächst wie jeder Satz ×1,5.
  - −2,3 MB, bildneutral; an der Wiese ohne Wachsen.
- **Benannt, nicht geschnitten:** Der Boden-Index hält nach der Ankunft 1 310 720 bei einem Hochwasser von 795 648 (−2 MB möglich).
  Die Start-Kapazität ist aber für die Gate-Welt (~1,57 M) und den Abend (bis ~2,2 M) gewählt, darunter wüchse er dort.

## Zeit (ABAB, `omen-messfolge`, A main 76c9624d gegen B Kopf 33c47206, 4 Boots je Seite)

8 von 8 Boots im ersten Versuch grün, Instrument die Messfolge aus abab-b537 (7dd944e6), Seiten-Hash-Wache vor jedem Boot (A
ed9547d9…, B 64276871…), 22:36–23:06. Rohdaten `bericht/0910-1-b/zeit/`.

| Größe | A main 76c9624d | B Kopf 33c47206 | B − A |
|---|---|---|---|
| fps voll / frei | 57,5 / 62,5 | 60,6 / 67,5 | +3,2 / +5,1 |
| Frame p50 voll / frei | 16,7 / 16,7 | 16,7 / 16,6 | 0 |
| Frame p95 voll | 21,1 (17,0–25,2) | 16,9 (16,9–17,0) | −4,2 |
| Frame p95 frei | 20,9 (16,9–25,1) | 16,8 (16,8–17,0) | −4,1 |
| Frame max frei | 258 (25–259) | 33 (25–50) | −225 |
| CPU-Takt p50 / p95 voll | 4,4 / 6,5 | 4,1 / 6,2 | −0,3 / −0,3 |
| CPU-Takt p50 / p95 frei | 4,0 / 6,3 | 3,8 / 5,7 | −0,2 / −0,6 |
| render-EWMA voll / frei | 2,57 / 3,09 | 2,49 / 2,07 | −0,08 / −1,02 |
| **gpu-bank Gier 0 (GPU ms/Frame)** | 15,55 (14,80–18,28) | **14,65 (12,18–14,83)** | **−0,90** |
| **gpu-bank Gier −0,88** | 14,18 (13,43–16,80) | **13,51 (12,18–13,73)** | **−0,67** |
| gpu-bank Gier 0 (CPU ms/Frame) | 1,71 | 1,75 | +0,05 |
| Band GPU ms/Frame | 16,50 (15,68–19,28) | 15,56 (14,92–15,71) | −0,95 |
| Band Befehle · Dreiecke | 91 · 764k | 90 · 776k | −1 · +12k |
| **Band VRAM (Messfolge, verdichtet)** | 122,2 (118,5–122,9) | **114,5 (114,4–114,5)** | **−7,7** |
| Tiere gesamt / im Kegel | 11 / 1 | 11 / 1 | 0 |

- **Urteil: B ist nicht langsamer.** Die GPU-Zeit je Frame sinkt im Median um 0,7–0,9 ms; das passt zur halben Bandbreite
  des Szenen-Ziels, ist bei der Streuung von A aber keine saubere Zuordnung. Die CPU ist gleich.
- **A streut, B nicht:** Zwei der vier A-Boots tragen Frame p95 25 ms und gpu-bank 16,8–18,3 ms, wie schon in 0910-2 (dort A mit
  derselben Basis). Den p95-Unterschied schreibe ich darum nicht allein dem Format zu; die Mediane der gpu-bank tragen das Urteil.
- **Band der Messfolge (verdichtet):** −7,7 MB, das ist das Ausgabe-Ziel; der Wasser-Satz wirkt nur im Band nach der Ankunft.
  Auf dem OMEN liegt die Wiese damit in BEIDEN Prozeduren unter 118 (Messfolge 114,5, Ankunft 116,3).

## Wände (Exit UND Urteils-Zeile, Kopf 3c308247 + 33c47206)

| Wand | Urteil |
|---|---|
| check | `GRÜN arch-fachwerk-fit` |
| lint | 0 Fehler, 3 Warnungen wie auf main (der Wand-Lauf fand 2 Fehler `GPUTextureUsage`, behoben in 33c47206) |
| format:check | „All matched files use Prettier code style!“ |
| gate:vendor-anker | steht, 168 Anker |
| gate:ziel-zensus | Selbsttest +4 Fälle grün; echter Frame (swiftshader) GRÜN, 0 rot, 5 eingeschmuggelte Täter beim Namen |
| gate:post-kette | GRÜN, vier Wege durch die Weiche |
| gate:schatten-werfer | GRÜN |
| gate:schatten-takt | GRÜN |
| gate:kamera-treue | GRÜN |
| playtest:fast | „Kern-Gesundheit OK“ |
| playtest (voll, 158 s) | „Alle Invarianten OK“ |

Probe-Merge (`git merge-tree`) gegen main 7dd944e6 (V18.537) und gegen welle-m-schatten 261b1b18: keine Konfliktmarke.

## Offen (mit Grund)

- **Die Radeon-Zahl:** Ich kann die Radeon nicht messen. Erwartet aus 125,9–127,0 − 7,9 − 2,3 sind ≈ 115,7–116,8 MB.
  - Rundet die 890M gegen null (W7), greift der Ausgleich; meldet sie das Feature nicht, nennt es der Zensus.
- **Kandidat 3** (k1 1024², −6,0 MB; Band nach der Ankunft 116,3 → ~110,3 MB): nicht gebaut.
  - Im Fernblick „fern“ liegt die Änderung 0,225 Luma-Stufen über der Kontrolle (37 % des k1-Beitrags von 0,602).
  - In den übrigen 7 Blicken liegt sie auf der Kontrolle (−0,003…+0,019), im Boot-Instrument bei 0,000–0,005.
  - n = 1 Sitzung je Seite; offen, bis ein zweites Sitzungs-Paar die +0,225 bestätigt oder verwirft.
- **Der Boden-Index nach der Ankunft** (−2 MB möglich): nicht geschnitten, weil der Index dann in der Gate-Welt und am Abend wächst.
- **Kaskaden-Ziele beim Neubau zur Laufzeit:** dieselbe Klasse wie das Tiefen-Abbild der Leben-Schau 2, im Spiel nicht ausgelöst.
