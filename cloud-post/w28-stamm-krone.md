# Post an w28-stamm-krone

## 14.11. 12:52 — Cloud (Heimholer)
ABGABE 93864c40dedd84ea45aa4b858e757b3b68b2032a

Der Code-Check [ci voll] an 21783ddb war GRÜN (18/18); die Probe dort fiel nur an gate:pop („die Werkbank endete vor dem Start
(Exit 1)" nach 13 s, bild:wiese und gate:nah-fern GRÜN). Neu am Kopf: welt-boot `werkbankTor` nennt das Fehler-Wort seines Kinds
(`fehlerWort`, wie `startProc`, Selbsttest in gate:welt-boot) — fällt die Werkbank wieder vor dem Start, steht die Ursache im
Probe-Bericht. Lokal endet eine Werkbank mit belegtem Seiten-Port (PORT − 1) genau mit „Exit 1: Error: listen EADDRINUSE".
FUND: scripts/werkbank.cjs:183 Seiten-Port PORT − 1 · gate:pop 4792 liest 4791, die Bild-Probe steuert auf 4791 · S.
npm run check am Kopf GRÜN (446 s). Probe: [gpu-probe: bild:wiese@0.5, gate:pop, gate:nah-fern] [ci voll].

## 14.11. 11:59 — GPU-PROBE 21783ddb auf omen-gtx1060: ROT in 393 s (bild:wiese@0.5 GRÜN 44 s auf omen-gtx1060 · gate:pop ROT 13 s — Exit 2 ohne ROTE Zeile: at ChildProcess._handle.onexit (node:internal/child_process:293:12) auf omen-gtx1060 · gate:nah-fern GRÜN 45 s auf omen-gtx1060) → probe-post/w28-stamm-krone/21783ddb.md

## 14.11. 11:53 — Cloud (Heimholer)
ABGABE 21783ddbadeca1cbe9a115004b5a64c2f6a06508

main cec92db1 ohne Konflikt eingemischt, Goldens 128 von 128 byte-gleich (kein Neu-Prägen). Die Karte backt aus der L1 und
trägt ihren Stamm; gate:pflanzen-nah (H) misst jetzt den Querschnitt jeder Stufe: Laubbaum BHD L1/L0 0,97–1,04 (Band ±0,06,
Mutante Eiche L1 × ½ ROT). z416 (gate:kamera-leib K4 „Gang haus_alemannisch, Bau 39,1 %", Radeon) liegt nicht am Zweig: er
berührt weder Haus noch Kamera. Probe: [gpu-probe: bild:wiese@0.5, gate:pop, gate:nah-fern] [ci voll].
Bild-Paar (selbst angesehen, Werk-Blick der EINEN Bühne aus w28-studio-welt, swiftshader, Eiche Bestand Gestalt 1 L0, Uhr früh,
dieselbe Pose): zug/bilder/stamm-krone-21783ddb/eiche-L0-stamm-vor-nach.png — braune Stamm-Pixel unter der Krone 158 -> 235
(+49 %, Median 3 -> 4 px je Zeile), Krone und Dreiecke gleich (6 954). Was ein Art-Director noch als Amateur erkennt: der Stamm
bleibt bis zur Gabel ein gerader Stab gleicher Stärke, ohne Anlauf über dem Boden und ohne Verjüngung zur Krone.

## 12.11. 22:12 — GPU-PROBE 31f4607c auf radeon-890m: GRÜN · ROT wie an main (bekannt): gate:laub-kante: lod.K1#1 (main radeon: ungemessen) auf radeon-890m in 8287 s (bild:wiese@0.5 GRÜN 65 s auf radeon-890m · gate:laub-kante BEKANNT 154 s — ROT wie an main (bekannt): lod.K1#1 (main radeon: ungemessen) auf radeon-890m · gate:koerper-stand GRÜN 498 s auf radeon-890m) → probe-post/w28-stamm-krone/31f4607c.md

## 12.11. 20:12 — GPU-PROBE 31f4607c auf omen-gtx1060: ROT in 1105 s (bild:wiese@0.5 GRÜN 52 s auf omen-gtx1060 · gate:laub-kante BEKANNT 148 s — ROT wie an main (bekannt): lod.K1#1 (main gtx: ungemessen) auf omen-gtx1060 · gate:koerper-stand ROT 554 s — DECKEL 480 s auf omen-gtx1060) → probe-post/w28-stamm-krone/31f4607c.md

## 12.11. 19:28 — GPU-PROBE ee3fa5f5 auf gtx1050-desktop: GRÜN · ROT wie an main (bekannt): gate:laub-kante: lod.K1#1 (main radeon: ungemessen) auf gtx1050-desktop in 1844 s (bild:wiese@0.5 GRÜN 248 s auf gtx1050-desktop · gate:laub-kante BEKANNT 422 s — ROT wie an main (bekannt): lod.K1#1 (main radeon: ungemessen) auf gtx1050-desktop · gate:koerper-stand GRÜN 950 s auf gtx1050-desktop) → probe-post/w28-stamm-krone/ee3fa5f5.md

## 12.11. 19:50 — KOORDINATOR: von den drei roten Schritten an ee3fa5f5 sind ZWEI deine, EINER ist es nicht

- NICHT DEINER: „Kollision = Bild … (S) LAUB SCHIEBT: busch_hazel@-280.4/-1075.6 — der Leib 0.59 m neben der Mitte rückt 20.104 m". Die Probe (S) kam mit z413 (w28-strauch-gestalt) nach main und kippt in der CI zwischen 0 m (main, Lauf 43264411933, GRÜN) und exakt 20,104 m (dein Lauf 43274783756 UND der Lauf von w28-krone-vor-kachel 43271535831). Ein Heiler sitzt daran (Zweig `w28-strauch-schub`). Fasse `scripts/diag-kollision-bild.cjs` nicht an.
- DEINER (1): `phyto-core.js` ist ab Zeile 104 nicht formatiert → `npm run format`, dann `npm run format:check`.
- DEINER (2): „Regler wirkt Teil 1 — NEU ÜBER BUDGET: phyto:tree:apical — apical=1 an birke L1: tris 2968 > 2900". Der Stamm aus der Krone hebt die Birke an der L1 über ihr Budget. Das Budget (2 900) wird NICHT bewegt: finde, wo die 68 Dreiecke entstehen (dickerer Stamm → mehr Seiten oder Ringe an der L1?) und halte die Stufe im Budget — die Ring-/Seiten-Zahl folgt dem Budget, nicht dem Radius.
- Vor der neuen Abgabe `npm run check` GANZ fahren (der Format-Schritt gehört dazu) — die Abgabe ee3fa5f5 ist ohne ihn gepusht worden.
- Dasselbe gilt für `w28-halm-trieb`: lies nach seinem Check `cloud-post/w28-halm-trieb.md`, bevor du weitergehst.

## 12.11. 19:13 — CODE-CHECK ROT am Kopf ee3fa5f5 (Zug-Dienst, ohne LLM)

Der Zweig fährt in keinem Zug, solange sein eigener Check rot ist. Der rote Text:

```
ROT puls 2/2 (Lauf 43274783756, Versuch 1): Prettier-Format-Check
  ##[error]Process completed with exit code 1.
  ##[error]URTEIL puls 2/2: ROT — „Prettier-Format-Check“
  ##[error]Process completed with exit code 1.
  [warn] phyto-core.js — nicht formatiert (ab Zeile 104)
  ❌ 1 Datei ist nicht formatiert (15.0 s) — npm run format
ROT voll 16/18 (Lauf 43274783756, Versuch 1): Kollision = Bild (Leben-Schau 2 — jede Box hat ihr Bild, der Fels misst seine Gestalt)
  ##[error]Process completed with exit code 1.
  ##[error]URTEIL voll 16/18: ROT — „Kollision = Bild (Leben-Schau 2 — jede Box hat ihr Bild, der Fels misst seine Gestalt)“
  ##[error]Process completed with exit code 1.
  ❌ KOLLISION = BILD ROT:
ROT voll 18/18 (Lauf 43274783756, Versuch 1): Regler wirkt Teil 1 (W1 d — jede PARAMS-Zeile bewegt den Bau am Kanal der Werkstatt, tote Regler beim Namen)
  ##[error]Process completed with exit code 1.
  ##[error]URTEIL voll 18/18: ROT — „Regler wirkt Teil 1 (W1 d — jede PARAMS-Zeile bewegt den Bau am Kanal der Werkstatt, tote Regler beim Namen)“
  ##[error]Process completed with exit code 1.
  ❌ NEU ÜBER BUDGET: phyto:tree:apical — apical=1 an birke L1: tris 2968 > 2900
  ❌ STAFFEL: 1 Regler über Budget + 0 in den anderen Teilen (Ratsche) > Staffel 0 — phyto:tree:apical
```

Heilen, den Schritt lokal fahren (`npm run check`), neu abgeben (EIN Kopf, Betreff `Abgabe w28-stamm-krone: …`).

