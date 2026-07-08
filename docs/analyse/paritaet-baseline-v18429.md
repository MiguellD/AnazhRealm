# Paritäts-Baseline V18.429 (W2 — die Vorher-Zahlen, 08.07.2026)

**Zweck:** der nüchterne Anker gegen die Beschönigungs-Falle (Wand 1). Diese Zahlen sind der
Stand VOR den bild-ändernden Wellen W5 (Dither-Blende) + W6 (Silhouetten) — die W6-Kalibrierung
der Verdikt-Schwellen misst sich an der BEWEGUNG gegenüber dieser Baseline, nie an ihr selbst
(V18.346-Kontaminations-Disziplin). Werkzeuge: `npm run diag:parity` (Skelett selbst-getestet:
identisch → ~0 · Störung → sichtbares Delta) + `npm run gate:boot-stage` (6/6 inkl. Selbst-Test).

## 1 · diag-parity (swiftshader-Container, 960×600, beide Bilder ok)

| Zone                    | STUDIO                | ANAZH                 | Δ (prov. Schwelle)        |
| ----------------------- | --------------------- | --------------------- | ------------------------- |
| Himmel-RGB              | [61,77,51]            | [127,143,110]         | **110.4** (≤25) ⚠         |
| Mitte-RGB               | [130,140,107]         | [153,155,136]         | **39.9** (≤25) ⚠          |
| Boden-RGB               | [151,145,119]         | [148,141,117]         | **5.4** (≤25) ✓           |
| Grün-% Mitte            | 48.5 %                | 15.8 %                | **32.7 pp** (≤12) ⚠       |
| Luma-Hist-L1            | —                     | —                     | **0.75** (≤0.35) ⚠        |
| Kanten [sky/mid/ground] | [0.121, 0.324, 0.060] | [0.341, 0.137, 0.036] | mid-Δ **0.187** (≤0.06) ⚠ |

Frame: Studio 3 ms · Anazh 64 ms (swiftshader) · Anazh-Szene 10.85 M Tris / 12 908 Instanzen.
Stamm-Sonde: bark-Instanzen colMean [0.212, 0.174, 0.126] (warmes Braun — kein schwarzer Stamm mehr).

**Lesart (die Zahlen benennen die bekannten Fäden, jetzt messbar):**

- **Boden-Parität steht** (Δ5.4 — die V18.421/423-Licht-/Nebel-Arbeit trägt).
- **Himmel-Δ110 + Kanten-sky invertiert** = das benannte **Kamera-in-Krone-Framing**: die
  Studio-Kamera steht unterm Kronendach (obere Zone = Laub [61,77,51], kantenreich unten),
  AnazhRealm sieht offenen Himmel (hell, kantenreich OBEN durch Baum-Silhouetten). Halb
  Framing (Kamera-Wahl in `diag-parity`), halb Kronen-Dichte — W6 trennt die beiden.
- **Grün-Mitte 48.5→15.8 %** + Kanten-mid 0.32→0.14 = die Sicht-Mitte trägt zu wenig dichtes
  Laub (Kronen-Deckung/Dichte im Blick), der zweite Teil desselben Fadens.
- **Luma-Hist 0.75**: folgt aus den beiden obigen (helleres Bild insgesamt).

## 2 · Befund: RTT-Impostor-Bake 0/115 im Parity-Lauf

`ANAZH Impostor-RTT gebacken: {"baked":0,"queueVorher":115,"records":115,"err":null}` — der
Ensure-Pass enqueued 115 Records, der 45-s-Bake-Pump backte **0**. Kein Fehler gemeldet
(err null). Benannter Befund für **W4.3** (Bake aus der scatterDeco-Serialisierung entkoppeln)
— dort die Wurzel messen (Budget-Gate? Leaves nicht vorgelegt? tick-interner Gate?), nicht raten.
Bis dahin tragen die fernen Bäume im Parity-Bild den Silhouetten-Fallback.

## 3 · gate:boot-stage (headless-Mechanik, Null-Renderer)

- t(Kontrolle) nav→Loop ~6.9 s (Container; enthält den 4,7-MB-Parse)
- t(Bibliothek)/t(Ring)/t(Impostoren): Tick 1 (headless-Kurzschlüsse, gate-treu — die
  Mechanik-ORDNUNG ist die Aussage, nicht die Zeit)
- **t(BÜHNE): Tick 416** · 81 Chunks · **115 Impostor-Records** (die alte „96" wäre schon
  stale — die Zahl kommt jetzt aus dem lebenden Zustand) · **fog.far settled 194,3 m** =
  exakt die Wald-Kante (das Studio-Modell S1 lebt).
- Selbst-Test: injizierte deferierte Region → Prädikat rot → heilt. 6/6.

Die Wall-Clock-Wahrheit für Kriterium 2 (≤3 s) liefert die Schöpfer-GPU in W8; der Container
misst die Mechanik-Ordnung + Tick-Zählung (hardware-unabhängig vergleichbar über Wellen).
