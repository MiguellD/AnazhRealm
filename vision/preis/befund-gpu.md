# Befund: wohin die 22 ms GPU der Radeon gehen (Preis des Orts, Schnitt 3)

ZWISCHENSTAND 14.11. 22:50. Gerät Radeon 890M, Stand origin/main ffb005db, eigener abgelöster Baum `.claude/worktrees/zerlege-22ms`,
Fenster 1920×1080, Skala 0,75, jeder Block unter dem GPU-Schloss (zeit, ganz) mit Referenzfahrt davor und danach. Werkzeug:
`werkbank zerlegen` (zerlege-linse, je Schalter AUS/AN im Wechsel mit der gpu-bank) und ABBA-Viererreihen der gpu-bank an Skala,
Fenster und Zeitstempel. Rohdaten: `artifacts/profiband/auge/w28-preis-ort/befund-gpu/<block>/` im Mess-Baum (zerlegen*.json,
zerlegen*.txt, abba.txt, block.log, zeuge.txt, schirm.png).

**Die Mess-Art.** Dieselbe Pose kostet je gpu-bank 12,8–38,5 ms (Genesis, 50 Bänke in 13,5 min) und 24,9–52,6 ms (Wiese), ohne
fremde Karten-Last (GPU-Zeuge je Prozess: claude 1–6 %, dwm 1–3 %) und bei CPU-Referenz f ≤ 1,16: der Takt-Zustand der iGPU
zwischen den kurzen Bänken (nach einem leichten AUS ist das nächste AN langsam). Die ms der Zerlegung tragen diesen Zustand; der
ANTEIL je Durchgang, (an − aus)/an, trägt ihn nicht. Darum steht jeder Posten als Anteil (Median der Durchgänge, ± Standardfehler
1,253·sd/√n) und als ms = Anteil × die gpu-bank des guten Zustands aus `befund-bild.md` (Wiese 26,3 ms, Spawn 22,1 ms [g]).
Wiese: Blöcke 1 + 2 (14 Durchgänge, f ≤ 1,15); Spawn: Block G (6 Durchgänge × 90 Bilder, f ≤ 1,16). Die Pass-Stempel sehen auf diesem
Gerät 0,06–0,30 ms von 18–50 ms (≤ 1 %): kein Posten unten stammt aus einem Stempel.

## Die Tafel

| Posten | ms Wiese (Anteil) | ms Spawn (Anteil) | wächst mit | Mess-Art | Erzeuger |
|---|---|---|---|---|---|
| Laub der Bäume L0/L1 + ihr Wurf (`baum`, 89 Befehle, 59 Objekte) | **7,8 ± 1,0** (29,6 %) | 1,4 ± 1,4 (6,5 %) | Pixel: bei ¼ der Pixel 29–58 % des Δ | ABBA-Klasse, 14 Durchgänge | Laub-Stoff stamm/stoff-instanz.js:58 `_laubLichtStoff`, Stoff siedlung-bauten.js:1812 |
| Karten L2 + ihr Wurf (`fimp:atlas:L2`, 848 Instanzen, 6 784 Dreiecke, 1 Befehl; `#S` in k0–k2) | **5,4 ± 0,5** (20,5 %) | **6,7 ± 1,1** (30,5 %) | kaum Pixel: bei ¼ der Pixel 51–87 % des Δ — überwiegend fest je Bild | ABBA-Klasse | stamm/stoff-karte.js:598 `_impostorLeaf`, Wurf :623; Stoff stoff-material.js:1438 (alphaTest), Ecken-Tiefe :1514 |
| Gras-Ferne (`nahWiese:Lf`, 1 013 Instanzen, 64 k Dreiecke, bis 186 m) | **2,7 ± 0,9** (10,2 %) | 0,7 ± 1,2 (3,0 %) | unscharf (¼ der Pixel 0,3–0,9 ms; voll 0,6–4,8 ms) | ABBA-Klasse | stamm/vegetation-wiese.js:918 |
| Bild-Kette in voller Ausgabe (TRAA-Resolve 1920×1080 rgba16f, Post, Kontakt 720×405, Spiegel) | 1,9 (7,1 %) | 4,0 (18,2 %) | Ausgabe-Pixel | **Rest**: 100 − haupt − leer (haupt ± 0,4 / ± 0,2) | TRAA bild-kosten.js:1552, Post :2065, Kontakt bild-schatten.js:1419 |
| Boden (`bodenSatz` · `fern-ring`: das Pflaster am Spawn) | 0,0 ± 1,0 | **4,8 ± 0,6** (21,8 %) | Pixel (bis 118 Abtastungen, 4 515 Ops je Fragment, Shader-Linse) | ABBA-Klasse | siedlung-bauten.js:1936, gelaende-fern.js:407 |
| Feld-Pass (Welt-March + Panorama) | 0,8 ± 1,0 (2,9 %) | 3,6 ± 1,3 (16,1 %) | Pixel (¼: 0,44 des Δ, Lesung) | ABBA-Klasse | bild-sicht.js:2185 |
| Wasser (`wasserSatz` · `farWater`) | −0,5 ± 1,2 | 3,4 ± 1,8 (15,6 %, 1,9σ) | — | ABBA-Klasse | siedlung-bauten.js:1947 |
| Formationen (`formationenSatz`) | 1,6 ± 0,5 (6,2 %) | −0,4 ± 2,5 | — | ABBA-Klasse | siedlung-satz.js:1636 |
| Himmel (Kuppel, Sonne) | 1,6 ± 0,7 (6,2 %) | 1,1 ± 0,8 (4,9 %) | — | ABBA-Klasse | bild-himmel.js:261 |
| Nah-Wiese L1/L2 | 1,4 ± 0,9 (5,3 %) | −1,0 ± 1,5 | — | ABBA-Klasse | vegetation-wiese.js:956 |
| Kamm-Krone · Streu · Vorbau-Eiche | 1,1 · 0,8 · 0,6 (je < 2σ) | −0,9 · — · 0,1 | — | ABBA-Klasse | gelaende-fern.js:747 · Streu-Satz · Vorbau |
| Leerer Frame (Clear + Ausgabe, Direktpfad, nichts sichtbar) | 0,5 ± 0,04 (2,0 %) | 0,8 ± 0,1 (3,6 %) | fest + Ausgabe-Pixel | ABBA (`leer`) | dirigent-takt.js:2366 `_loopRender` |
| *darin enthalten:* die Kaskaden k0–k2 (jeder Klassen-Posten trägt seinen Wurf) | 0,4 ± 0,7 (1,6 %) | 0,8 ± 0,2 (3,4 %) | fest (eigene Auflösung; bei ¼ der Pixel 2,1–3,6 ms im langsamen Zustand) | ABBA-Pass | bild-schatten.js:1281, Takt :1639 |
| *Verdecker mit negativem Vorzeichen* (bau · busch · tier · einzelstuecke · wasser) | −3,3 (−12,5 %) | −4,1 (bau −18,6 %) | — | ABBA-Klasse | ohne sie zeichnet, was hinter ihnen liegt |
| Zeitstempel (Abfragen + Auflösen) | 0 (A 46,1 / B 46,3 ms) | — | — | ABBA `trackTimestamp` | r184-Backend |

**Die Summe gegen 26,3 ms (Wiese).** Auf Pass-Ebene steht alles beim Namen: Szenen-Pass 90,9 ± 0,4 % (23,9 ms) + Bild-Kette
7,1 % (1,9 ms, Rest) + leerer Frame 2,0 % (0,5 ms) = 100 %. Im Szenen-Pass tragen die Klassen mit ≥ 2σ 72,7 % (baum · karten ·
Gras-Ferne · formationen · himmel = 19,1 ms) und fünf kleinere 17,8 % unter 2σ (4,7 ms); Σ der Klassen mit positivem Vorzeichen
90,5 % gegen den Szenen-Pass 90,9 %. Benannt mit ≥ 2σ: 72,7 + 7,1 + 2,0 = **81,8 %**; mit den Klassen unter 2σ **99,6 %**. Die
Verdecker (−12,5 %) zeigen, dass die Posten nicht streng addieren: wer verdeckt, spart dem Dahinter die Pixel.
**Spawn (22,1 ms):** Szenen-Pass 78,2 ± 0,2 % + Kette 18,2 % + leer 3,6 %; darin mit ≥ 2σ karten 30,5 · boden 21,8 · feldPass 16,1 ·
schatten 3,4 = 71,8 %; benannt mit Kette und leer **93,6 %** (ohne Wasser, 1,9σ).

**Pixel gegen fest (ABBA der gpu-bank, Viererreihen, langsamer Zustand).** Fenster 960×540 (¼ der Pixel) kostet × 0,41 an der
Wiese (6 Viererreihen, 0,35–0,43), × 0,42 am Spawn (3, 0,37–0,49): T(¼) = F + P/4, T = F + P → **P = 79 % (Wiese), 77 % (Spawn)
wachsen mit den Pixeln, 21 / 23 % fest je Bild.** Die Szenen-Skala allein (die Ausgabe bleibt): 1,0 × 1,37 / × 1,46, 0,5 × 0,57 /
× 0,65 — die Szene in ihrer Skala trägt 48–77 % (Wiese) und 59–63 % (Spawn); die Kurve ist nicht linear (zwei Lesarten an der Wiese).

## Die Antwort

1. **Füllrate:** von der GPU-Zeit eines Bilds wachsen 79 % (Wiese) und 77 % (Spawn) mit der Zahl der Pixel — bei 1920×1080
   20,7 von 26,3 ms und 17,0 von 22,1 ms, von den 22 ms ohne Stempel also ~17 ms [Fenster-ABBA × gpu-bank aus befund-bild]; davon
   ist die Bild-Kette selbst (TRAA, Post, Kontakt in voller Ausgabe, leerer Frame) nur 2,4 ms an der Wiese und 4,8 ms am Spawn —
   der Rest der Füllrate ist der Inhalt der Welt (Laub, Gras, Boden, Feld-Pass); fest je Bild sind ~5,5 ms Wiese / 5,1 ms Spawn,
   darin der Wurf der Kaskaden und der größte Teil der Karten.
2. **Die drei größten Posten der Welt** (Wiese, der Ort des Preises): das Laub der Bäume L0/L1 7,8 ms, Pixel-gebunden — Wurzel
   (Verdacht, ungemessen): das maskierte Laub schattiert jedes Fragment auch unter fremdem Laub, der Laub-Licht-Term läuft vor dem
   Tiefen-Urteil (`_laubLichtStoff` stoff-instanz.js:58); der Schnitt ist die Tiefe vor dem Licht im EINEN Laub-Stoff (das Licht
   zahlt nur das vorderste Fragment), Messname: die Überdeckung des Laubs je Schirm-Pixel. Die Karten L2 5,4 ms (Spawn 6,7 ms, dort
   der größte Posten) — ihr Preis folgt den Pixeln kaum (bei ¼ der Pixel 51–87 %): er hängt an dem, was je Karte und je Bild läuft
   (848 Instanzen, die Ecken-Tiefe aus der Textur im Vertex stoff-material.js:1514, der Wurf-Zwilling in k0–k2 stoff-karte.js:623),
   nicht an ihrer Fläche; der Schnitt liegt im EINEN Karten-Leaf `_impostorLeaf` (stoff-karte.js:598) — welcher der drei Teile die
   ms trägt, ist ungetrennt. Die Gras-Ferne 2,7 ms — 1 013 Büschel-Instanzen (64 k Dreiecke) bis 186 m, ob Pixel oder Ecken ist
   unscharf; der Schnitt ist ihre Stufe in der Ferne (vegetation-wiese.js:884–918). Am Spawn tritt der Boden (das Pflaster,
   4,8 ms) an die Stelle des Laubs.
3. **Erreichbares p95 an der Radeon:** die drei Posten tragen 15,9 ms von 26,3 [Tafel]; an der 120-Hz-Anzeige hält p95 ≤ 25,0 ms
   (3 Vsyncs) erst bei ≤ 23 ms GPU [ENTSCHEID Schnitt 3, 2 ms Luft] — die drei Schnitte müssen zusammen ≥ 3,3 ms nehmen (21 % ihrer
   15,9 ms), dann ist **p95 25,0 ms** im guten Zustand erreichbar; **p95 16,7 ms** (2 Vsyncs, ≤ 14,7 ms GPU) verlangt ≥ 11,6 ms
   (73 % der drei Posten). Im gedrosselten Zustand der iGPU (× 1,7 [befund-bild Zwilling 2: 26,2 → 44,7 ms]; hier bis × 1,9) werden
   dieselben 23,0 ms zu 39–44 ms GPU — **p95 41,7–50,0 ms** (5–6 Vsyncs), was immer die Welt schneidet: der Zustand der Karte ist
   an der Radeon der größte Einzel-Posten, und kein Schnitt in der Welt fängt ihn.

## Ehrlich offen

- Die Zahl je Klassen-Posten streut je Durchgang ± 10–20 % (Takt-Zustand); fünf Klassen der Wiese mit positivem Vorzeichen liegen
  unter 2σ, die Wiese ist mit ≥ 2σ zu 81,8 % benannt, nicht zu 90 %.
- Block 3 (f vor 1,25–1,48) und Block 4 (f nach 1,25–1,43) sind ungemessen; ihre Pixel-Verhältnisse je Posten (karten 0,51–0,87,
  baum 0,29–0,58) stehen als Lesung in der Tafel, nicht als Zahl.
- Was im Karten-Posten die fest-je-Bild-Zeit trägt (Hauptbild, Ecken-Tiefe, Wurf), ist ungetrennt; die Shader-Linse nennt die
  Programme der Karten und des Laubs nicht beim Namen (`--nur fimp` traf kein Programm).
- Die Wurzel des Laubs (Überdeckung vor dem Licht) ist ein Verdacht ohne Messung.
- Der Takt-Zustand der iGPU ist benannt, nicht gemessen (kein Takt-Zähler); ob er im Spiel-Loop (stetige Last) gleich fällt, ist offen.

## Block 1 — Wiese (−280,4, −1045,6), 20:44–20:57, Referenzfahrt f vor 1,08–1,15, nach 1,02–1,10

`werkbank zerlegen` (6 Durchgänge, n 12; n aufgefüllt auf 30, den Schatten-Takt): Gesamt 40,9 ms, Pass-Stempel 0,24 ms (1 %) —
die Stempel dieses Geräts sehen fast nichts (Stempel-Bruch am Hauptbild, Neustart überschreibt den Anfangs-Stempel).
Die iGPU wechselte im Block den Zustand: gpu-bank 41,7 → 49,6 ms (20:45–20:55), dann 31,5 → 24,9 ms (20:56–20:57) bei
derselben Pose und CPU 2,4–3,3 ms; die Referenzfahrt (CPU) sah davon nichts. Darum unten der ANTEIL je Durchgang, (an − aus)/an.

| Schalter | Anteil (Median 6 Durchgänge) | ± halbe Spannweite | robust |
|---|---|---|---|
| leer (Direktpfad, nichts sichtbar) | 98,3 % fällt → der leere Frame trägt 1,7 % | 0,1 | ja |
| haupt (Szenen-Pass samt Schatten-Auslösung) | 91,0 % | 1,2 | ja |
| baum | 29,8 % | 17,6 | nein |
| karten | 19,5 % | 9,8 | knapp |
| kontakt:verdeckung | 14,3 % | 18,6 | nein |
| k1 · k2 · k0 | 10,7 · 5,0 · 1,9 % | 11,0 · 10,5 · 6,5 | nein |
| nahWieseFern · nahWiese · feldPass | 10,8 · 8,6 · 9,1 % | 11,9 · 11,1 · 12,4 | nein |

ABBA der gpu-bank (je 3 Viererreihen A B B A, n 12, 3 Durchgänge), alle im langsamen Zustand (A ≈ 49 ms):

| Reihe | A | B | B ÷ A |
|---|---|---|---|
| Skala 0,75 ↔ 1,0 | 48,9 · 50,7 · 49,0 · 49,7 · 48,0 · 48,8 | 68,5 · 72,0 · 71,0 · 65,2 · 68,2 · 62,7 | 1,40 |
| Skala 0,75 ↔ 0,5 | 49,0 · 49,2 · 40,5 · 45,6 · 48,5 · 47,6 | 26,7 · 23,7 · 26,5 · 26,3 · 26,6 · 20,9 | 0,54 |
| Fenster 1920×1080 ↔ 960×540 | 40,3 · 49,2 · 49,1 · 50,5 · 47,7 · 48,7 | 13,0 · 18,3 · 20,8 · 20,7 · 20,9 · 20,7 | 0,41 |
| Zeitstempel an ↔ aus | 49,5 · 49,4 · 48,9 · 36,0 · 31,5 · 31,7 | 43,0 · 45,2 · 46,8 · 35,3 · 33,9 · 39,1 | Zustand wechselte mitten in der Reihe — ungemessen |

Gelesen: ein Viertel der Pixel kostet 41 % → ~79 % der GPU-Zeit wachsen mit den Pixeln, ~21 % fest je Bild.

## Block 2 — Wiese, dieselbe Pose, 21:01–21:18, Einlauf bis die gpu-bank steht (138 s: 35,5 · 35,4 · 34,6 ms), Zerlegung 8 Durchgänge

Gesamt 36,3 ms, Pass-Stempel 0,21 ms (1 %). Wiederholt Block 1: haupt 90,3 % ± 1,9 · leer fällt 97,9 % ± 0,6 · baum 29,6 % ·
karten 20,6 % ± 5,3 · nahWieseFern 10,1 % · k2 9,5 % · k1 8,6 % · himmel 7,1 % ± 6,7 · formationen 7,5 %. Der Schalter `post`
(Direktpfad) ist KEIN Posten der Kette: ohne Kette rendert die Szene in voller Ausgabe statt Skala 0,75 (+78 % Pixel) und wird
teurer (−30 … −47 %), dasselbe Vorzeichen wie Skala 1,0. ABBA im langsamen Zustand (A ≈ 47 ms): Skala 1,0 × 1,35 · Skala 0,5
× 0,58 · Fenster 960×540 × 0,41 · Zeitstempel aus × 1,00 (A 46,1 / B 46,3 — das Zeitmaß kostet nichts Messbares).
Der GPU-Zeuge (Leistungszähler je Prozess, `zeuge.txt`): während der Messung nur die eigene Welt (chrome ~90 %), claude 1–6 %,
dwm 1–3 % — keine fremde Karten-Last. Der Zustandswechsel kommt aus der Messung selbst: zwischen den kurzen Bänken ruht die
iGPU und taktet herunter; das „an“ nach einem leichten „aus“ (haupt, leer) liegt im Mittel 45 ms, nach einem schweren 30–35 ms.

## Block G — Genesis (0, 0, Blick −x), 21:36–22:07, f vor 1,11–1,16, nach 1,00–1,03, Zerlegung 6 Durchgänge × 90 Bilder

Der Einlauf stand NIE: 50 gpu-bänke derselben Pose in 13,5 min liegen zwischen 12,8 und 38,5 ms (Median 19,5), ohne fremde
Karten-Last (Zeuge: claude 1–2 %, dwm 1–3 %) — der Zustand der iGPU allein streut × 3. Zerlegung: Gesamt 26,1 ms, Stempel 0,08 ms.

| Schalter | Anteil (6 Durchgänge) | ± Standardfehler |
|---|---|---|
| leer fällt | 96,4 % (leerer Frame 3,6 %) | 0,3 |
| haupt | 78,2 % (Kette + Kontakt in voller Ausgabe: 21,8 %) | 0,2 |
| karten (fimp:atlas:L2 + Wurf) | 30,5 % | 4,8 |
| boden (bodenSatz · fern-ring: das Pflaster) | 21,8 % | 2,9 |
| feldPass | 16,1 % | 5,7 |
| wasser | 15,6 % | 8,3 |
| schatten (alle Kaskaden) | 3,4 % | 0,7 |
| bau | −18,6 % (Verdecker: ohne ihn zeichnet, was dahinter liegt) | 6,6 |

ABBA (Viererreihen): Skala 1,0 × 1,46 · Skala 0,5 × 0,65 · Fenster 960×540 × 0,42 (A 27,4 / B 11,6).

## Block 3 — Wiese, dieselben Schalter in 960×540 und 1920×1080 (n 60, 6 Durchgänge), 22:15–22:26 — UNGEMESSEN (f vor 1,25–1,48 > 1,2)

Gelesen, nicht gezählt: karten Δ 6,98 ± 0,72 ms bei ¼ der Pixel gegen 8,03 ± 1,53 ms voll (Verhältnis 0,87 — der Posten wächst
kaum mit den Pixeln), baum 3,39 gegen 5,81 ms (0,58), schatten 2,13 ± 0,72 ms bei ¼ der Pixel (die Kaskaden haben ihre eigene
Auflösung). Die Karte zeichnet 848 Instanzen mit 6 784 Dreiecken in EINEM Befehl (Zensus `fimp:atlas:L2`). Wiederholung: Block 4.

## Block 4 — Wiese, Wiederholung von Block 3 (n 60, 8 Durchgänge), 22:29–22:41 — UNGEMESSEN (f vor 1,00–1,04, nach 1,25–1,43)

Gelesen: bei 960×540 (Gesamt 18,8 ms) karten 5,34 ± 1,32 · baum 3,29 ± 1,66 · schatten 3,61 · nahWiese 2,89 · feldPass 1,15 ms;
bei 1920×1080 (Gesamt 49,7 ms) karten 10,38 ± 5,61 · baum 11,40 ± 1,70 · schatten 3,51 ± 1,28 · feldPass 2,59 ms; Anteil haupt
90,2 %, leer 99,0 %. Shader-Linse (`shader.txt`): `bodenSatz` bis 118 Abtastungen und 4 515 Ops je Fragment, `feld-pass` 24 und 10.
