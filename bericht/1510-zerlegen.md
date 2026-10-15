# Bericht 1510 Zerlegung — die GPU-Zerlegung am main-Kopf a19ca615 (durchbruch-1510 Schritt 0)

**Status: ZWISCHENSTAND.**

OMEN GTX 1060, `werkbank zerlegen --runden 6`: gpu-bank je Schalter, ABBA 6 Runden × 12 Frames, Median ± σ (1,4826 × MAD).

- **Baum und Instrument:** `abab-pe8a` = e8a370ad, code-gleich mit a19ca615.
- **Vorlauf je Sitzung:** einschwingen `lauf 10 --ein 30 --ruhe 300`, freie Tiere, Fenster 1920×1080.
- **Ablauf:** 15.10. 11:55–12:17. Je Sitzung `zerlegen --selbsttest`, alle grün.

**Ergebnis in drei Sätzen:**

1. Das Hauptbild trägt 78–85 % der GPU-Zeit je Frame. Darin wiegen schwer:
   - **Boden** 1,4–2,1 ms;
   - **Baum** 1,25–1,6 ms;
   - an Genesis die **Einzelstücke** 1,2–1,8 ms.

   Die Nachbild-Kette (TRAA 0,9–1,1 · nachbild 0,7 · bloom 0,4) kostet zusammen 2,0–2,2 ms.
2. **Die Pass-Stempel der GTX sehen nur 17 % einer Vollbild-Last** (Stempel-Probe aller fünf Sitzungen). Jede GPU-Zahl aus
   `gpuJePassMs` unterschätzt die Fragment-Arbeit, Richter ist die Bank.
3. **Genesis Ego, der Bündel-Befund:** B (a19ca615) und A (0bbee8fc) kosten in der Bank gleich viel, 11,66 gegen 11,90 ms,
   alle Posten gleich. Auch der Loop ist gleich gebaut, 5,17 Submits je Frame mit denselben Zielen. Der Mehrdurchsatz von B
   im echten Loop (+0,9 ms) ist also keine Zeichenarbeit. Benannter Kandidat: K60s Werk-Fäden (3 auf dem i7-8750H) neben
   Chromes GPU-Prozess.

## Die Zerlegung je Ort × Sicht (Δ ms je Frame, wenn der Schalter AUS ist; • = Klassen- und Stufen-Posten, Σ)

| Schalter | Wiese Ego | Wiese Third | Genesis Ego (B) | Genesis Ego (A 0bbee8fc) | Genesis Third |
|---|---|---|---|---|---|
| **Gesamt (alles an)** | **8,52** | **8,61** | **11,66** | **11,90** | **12,38** |
| CPU-Haupt-Thread | 2,16 | 2,58 | 2,52 | 2,47 | 3,65 |
| haupt (Renders 72→0) | 6,65 | 6,81 | 9,89 | 10,10 | 10,54 |
| schatten · k0 · k1 | 0,17 · 0,10 · 0,02 | 0,20 · 0,10 · 0,06 | 0,21 · 0,17 · −0,03 | 0,20 · 0,24 · 0,02 | 0,10 · 0,17 · 0,02 |
| post ¹ | −2,24 | −2,14 | −4,17 | −4,38 | −4,52 |
| • traa | 0,98 | 1,07 | 0,93 | 0,90 | 1,06 |
| nachbild | 0,67 | 0,67 | 0,75 | 0,67 | 0,68 |
| • bloom · godrays · kontrast | 0,45 · 0,14 · 0,25 | 0,45 · 0,14 · 0,15 | 0,42 · 0,13 · 0,19 | 0,41 · 0,05 · 0,21 | 0,41 · 0,17 · 0,28 |
| • tiefenkopie | 0,11 | 0,05 | 0,08 | 0,12 | 0,10 |
| • **boden** (7 Befehle) | **1,39** | **1,55** | **2,13** | **2,05** | **1,53** |
| • **baum** | **1,63** (34) | **1,63** (35) | **1,45** (26) | **1,63** (25) | **1,25** (24) |
| • **einzelstuecke** | 0,03 | 0,06 | **1,16** (16) | **1,15** (16) | **1,77** (28) |
| • bau | −0,11 | 0,09 | −2,51 ² | −2,48 ² | 0,15 (61) |
| • himmel | 0,20 | −0,02 | 0,56 | 0,59 | 0,71 |
| • karten | −0,08 | −0,21 | 0,35 | 0,30 | 0,28 |
| • nahWiese · streu · busch | 0,48 · 0,14 · 0,14 | 0,14 · 0,06 · 0,00 | – · −0,05 · – | – · 0,04 · – | −0,02 · 0,03 · – |
| • feldPass · wasser · formationen | 0,33 · 0,07 · 0,00 | 0,40 · 0,07 · 0,05 | 0,15 · 0,01 · 0,05 | 0,14 · −0,04 · −0,07 | 0,11 · −0,09 · −0,01 |
| leer (Hauptbild-Befehle → 0, post → 0) | 7,35 | 7,44 | 10,62 | 10,93 | 11,20 |
| leerer Frame | 1,17 | 1,17 | 1,04 | 0,97 | 1,18 |
| Σ der •-Posten | 6,15 (72 %) | 5,68 (66 %) | 5,05 (43 %) | 5,00 (42 %) | 7,73 (62 %) |
| Wechselwirkung / geteilt | 1,20 | 1,76 | 5,57 | 5,93 | 3,47 |

- **¹ post AUS ist an jedem Ort TEURER** (−2,1 … −4,5 ms). Die Linse nennt den Schalter, die Ursache prüfe ich hier nicht.
  Vermutlich zeichnet die Szene ohne die Ausgabe-Stufe nicht mehr in der EINEN Skala 0,75.
- **² bau AUS an Genesis Ego +2,5 ms:** Die Start-Plattform und die Bauten verdecken im Ego-Blick den Boden und die
  Bäume dahinter. Fallen sie, zeichnet der Rest mehr Pixel. Daher kommt auch der große geteilte Rest dort (5,6–5,9 ms).
- **Frame-Anatomie Genesis Third je Frame:**
  - Render-Pässe 5,7× mit 49,1 MB Zielen (TRAA 15,8 · haupt 8,9 + 11,1 · post 7,9 · k0 4,0 · k1 1,3 MB);
  - setPipeline 63, setBindGroup 136, direkte Draws haupt 61 · k0 21, executeBundles 1 (4 Bundles), Submits 4,8.

## Für K71: die CPU-Seite an Genesis Third (Profil 20 s, freie Tiere, 1 451 Frames; µs je Frame)

| Posten | inklusiv | selbst |
|---|---|---|
| `loop` (25a.js) | 8 293 | 229 |
| `_loopRender` (25c.js) | 5 460 | 34 |
| `updateBefore` (25c.js:171, umschließt den Render-Weg) | 5 032 | – |
| `renderer.renderObject` (07.js) | 5 136 | 49 |
| **`o.needsRefresh` (10.js:69)** | **1 738** | 30 |
| **`AnazhRealm._diaetRefresh` (26c.js:1693)** | **1 707** | 203 |
| `AnazhRealm._diaetGeteiltSchreiben` (26c.js:1656) | 1 278 | 61 |
| `AnazhRealm._diaetVorTextur` (26c.js:1637) | 58 | 57 |
| `o.needsRefresh` (07.js:941) | 95 | 12 |
| `renderer._renderBundles` | 1 399 | – |

- **`updateBeforeNode`** steht in diesem Kopf nicht als eigener Posten im Profil (top 150). Am main bd38fb16 (1510-k62
  A-Seite) trug er 1 980 µs. Hier sitzt die Arbeit unter `updateBefore` und `needsRefresh`.
- Das K71-Vorher: Die Diät zahlt 1,7 ms je Frame (`_diaetRefresh`), davon 1,3 ms `_diaetGeteiltSchreiben`. Der
  Refresh-Test der Knoten kostet 1,7 ms (`needsRefresh`). Der Lauf (20 s) dazu: fps 74,2, Frame p95 16,8, CPU-Takt
  p50/p95 5,4/7,2 ms.

## Genesis Ego: der Bündel-Befund (A 0bbee8fc gegen B a19ca615)

| | A 0bbee8fc | B a19ca615 |
|---|---|---|
| Bank (Zerlegung, alles an) | 11,90 ms | 11,66 ms |
| Lauf 30 s (Loop-Probe, eigene Sitzung): fps · GPU-Durchsatz p50/p95 · Verzug p50 · Leine aus | 78,4 · 12,8/15,4 · 16,6 · 34,5 % | 74,0 · 13,7/16,6 · 18,0 · 38,1 % |
| Zählprobe im Loop (lauf 10): gerenderte Frames · Submits · je Frame | 861 · 4 450 · 5,17 | 816 · 4 215 · 5,17 |
| Renders je Frame: Leinwand · TRAA · output · Kaskade 0 · Kaskade 1 | 1 · 1 · 1 · 0,50 · 0,17 | 1 · 1 · 1 · 0,50 · 0,17 |
| Compute | 0 | 0 |
| Phasen-EWMA: render CPU · gpuMs (Stempel) | 2,89 · 3,16 | 2,40 · 2,53 |

- **Der Befund steht in eigener Sitzung:** fps 78,4 → 74,0, Durchsatz +0,9 ms.
- **Ausgeschlossen:**
  - zusätzliche Zeichenarbeit je Frame (Bank gleich);
  - zusätzliche Render-Ziele, Pässe oder Submits (Zählprobe gleich);
  - der Regler (Stellgrößen gleich: Skala 0,75, Ring 4, Laub 216 m, Schatten jedes Frame).
- **Kandidat: K60s Werk-Fäden.** `_foundryHelfer` startet je 4 Kerne einen Faden, auf dem i7-8750H (12 logische) drei.
  - Sie laufen im Loop, in der Bank ruht die Welt.
  - Arbeiten sie im Loop, nehmen sie Chromes GPU-Prozess den Kern, und die GPU-Fertig-Zeitpunkte rücken auseinander:
    GPU-Verzug 16,6 → 18,0 ms bei gleicher GPU-Arbeit.
- **Die Probe, die ihn nennt** (Probe 3, nach K68, ca. 10 min):
  - B in EINER Welt mit `FOUNDRY_WERK_FAEDEN` 4 gegen 1, lauf 30 je Stand, ABBA;
  - dazu die CPU-Zeit je Chrome-Prozess über den Lauf.

## Rohdaten

- **Pfad:** `bericht/1510-zerlegen/`.
- **Inhalt:**
  - je Sitzung `<ort>-<sicht>-zerlegen.txt|json`, `-selbsttest.txt`, `-ein.txt`;
  - `genesis-third-profil.txt` und `-lauf.txt`;
  - `loop/` (Probe 1, zählte im ruhenden Loop 0, verworfen) und `loop2/` (Zählprobe je Seite);
  - die Skripte `zerlegen.sh`, `loop-probe2.sh`, `kette.sh`.

## Pflicht-OFFEN Rest

- **E (GPU an Genesis):**
  - Gesamt 11,7–12,4 ms je Frame in der Bank, das Hauptbild 9,9–10,5 ms.
  - Die Haupt-Posten sind Boden (1,5–2,1), Einzelstücke (1,2–1,8), Baum (1,25–1,45) und Himmel (0,6–0,7).
  - Der geteilte Rest ist groß (3,5–5,9 ms): Verdeckung und Pass-Anfänge.
- **E (CPU, K71):** Diät und Refresh-Test zusammen ≈ 3,4 ms je Frame an Genesis Third.
- **Genesis Ego:** Der Posten des Mehrdurchsatzes ist offen bis Probe 3.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit.
- **Werkzeug:** `p3/k1510z`.
- **Die OMEN fährt jetzt:**
  1. 1510-k68-abab (`p3/k1510k68`, seit 12:34): 65854e26 gegen main a19ca615, stehend Wiese/Genesis × Ego/Third, gehend Wiese;
  2. danach Probe 3, die GTX-Ratschen am main-Kopf und K65.
