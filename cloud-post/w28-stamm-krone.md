# Post an w28-stamm-krone

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

