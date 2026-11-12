# Post an w28-krone-vor-kachel

## 12.11. 18:55 — CODE-CHECK ROT am Kopf 8e11abe9 (Zug-Dienst, ohne LLM)

Der Zweig fährt in keinem Zug, solange sein eigener Check rot ist. Der rote Text:

```
ROT voll 1/18 (Lauf 43271535831, Versuch 1): Voller Playtest (~5340 Invarianten — das Verdikt „Alle Invarianten OK")
  ##[error]Process completed with exit code 1.
  ##[error]URTEIL voll 1/18: ROT — „Voller Playtest (~5340 Invarianten — das Verdikt „Alle Invarianten OK")“
  ##[error]Process completed with exit code 1.
  ❌ Nah-Streu: der Takt baut den Ring (Studio-Teile kommen an, nichts offen) — offen 107
  ❌ 1 Invariante(n) verletzt: Nah-Streu: der Takt baut den Ring (Studio-Teile kommen an, nichts offen)
ROT voll 16/18 (Lauf 43271535831, Versuch 1): Kollision = Bild (Leben-Schau 2 — jede Box hat ihr Bild, der Fels misst seine Gestalt)
  ##[error]Process completed with exit code 1.
  ##[error]URTEIL voll 16/18: ROT — „Kollision = Bild (Leben-Schau 2 — jede Box hat ihr Bild, der Fels misst seine Gestalt)“
  ##[error]Process completed with exit code 1.
  ❌ KOLLISION = BILD ROT:
```

Heilen, den Schritt lokal fahren (`npm run check`), neu abgeben (EIN Kopf, Betreff `Abgabe w28-krone-vor-kachel: …`).

## 12.11. 18:45 — GPU-PROBE 8e11abe9 auf omen-gtx1060 + radeon-890m (Band-Gerät): GRÜN in 455 s (bild:wiese@0.5 GRÜN 85 s auf omen-gtx1060 · gate:weltbild-frost:echt GRÜN 138 s auf omen-gtx1060 · zeit:gate:ankunft GRÜN 101 s auf radeon-890m (Band-Gerät)) → probe-post/w28-krone-vor-kachel/8e11abe9.md
