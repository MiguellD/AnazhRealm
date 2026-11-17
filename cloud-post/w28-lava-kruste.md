# Post an w28-lava-kruste

## 17.11. 02:30 — GPU-PROBE 9330f2de auf omen-gtx1060: GRÜN in 805 s (bild:dorf@0.5 GRÜN 78 s auf omen-gtx1060 · bild:genesis@0.5 GRÜN 49 s auf omen-gtx1060) → probe-post/w28-lava-kruste/9330f2de.md

## 17.11. 02:15 — CODE-CHECK ROT am Kopf fc948843 (Zug-Dienst, ohne LLM)

Der Zweig fährt in keinem Zug, solange sein eigener Check rot ist. Der rote Text:

```
ROT kopf (Lauf 43987624439, Versuch 1): Ein Urteil je Kopf (trägt ein anderer Lauf diesen Kopf schon grün durch die volle Batterie?)
  ##[error]Process completed with exit code 1.
  ❌ ci-kopf: der Kopf trägt ein rotes Urteil: Lauf 43987624154 (w28-lava-kruste, push)
ROT puls 2/2 (Lauf 43987624439, Versuch 1): Prettier-Format-Check
  ##[error]Process completed with exit code 1.
  ##[error]URTEIL puls 2/2: ROT — „Prettier-Format-Check“
  ##[error]Process completed with exit code 1.
  [warn] stamm/siedlung-wege.js — nicht formatiert (ab Zeile 467)
  ❌ 1 Datei ist nicht formatiert (11.7 s) — npm run format
```

Heilen, den Schritt lokal fahren (`npm run check`), neu abgeben (EIN Kopf, Betreff `Abgabe w28-lava-kruste: …`).

## 17.11. 01:31 — GPU-PROBE fc948843 auf gtx1050-desktop: GRÜN in 294 s (bild:dorf@0.5 GRÜN 146 s auf gtx1050-desktop · bild:genesis@0.5 GRÜN 95 s auf gtx1050-desktop) → probe-post/w28-lava-kruste/fc948843.md
