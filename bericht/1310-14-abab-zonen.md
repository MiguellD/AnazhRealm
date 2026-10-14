# Bericht 1310-14 — ABAB des geschnittenen Monolithen (der Stamm in 48 Zonen) gegen main

**Status: ZWISCHENSTAND.**

**Urteil:** integ-probe 9fb869a5 (Stamm in 48 Dateien unter `stamm/`) ist **nicht langsamer** als main 6898706f.
- Frame p50/p95 unter Regler voll liegen an Genesis und Wiese gleich, in jedem Boot. Befehle und Dreiecke sind gleich.
- Der Boot bis zur Kontrolle ist gleich: kalt 29,1 → 29,4 s, zweit 17,7 → 17,4 s, die Bereiche überlappen.
- Die 47 zusätzlichen Skript-Anfragen kosten kalt +0,19 s bis DOMContentLoaded (getrennt 2 von 2); das letzte Skript ist
  +0,11 s später da. Im Zweit-Boot liegt B um −0,09 s vorn.
- Der save-server sendet weder Cache-Control noch ETag. Darum lädt auch der Zweit-Boot alle 8,84 MB Skripte neu, auf
  beiden Seiten.

## Der Harnisch, umgezogen

- **Vorher:** Die Seiten-Wache verglich die EINE Datei `anazhRealm.js` (curl | sha256sum). Auf B gibt es sie nicht mehr.
- **Jetzt** (`fingerabdruck.cjs`): Die Wache liest die ausgelieferte `index.html`, folgt jedem lokalen `<script src>` und
  vergleicht jede ausgelieferte Datei byte-genau mit dem Arbeitsbaum.
  - Der Fingerabdruck ist der SHA über index.html und alle Skripte in Lade-Reihenfolge: A `cf1368ad…` (14 Skripte, 1
    Stamm-Datei), B `2673a0ec…` (61 Skripte, 48 Zonen).
  - Die Wache prüft vor UND nach jedem Lauf.
- **Boot-Probe** (`boot.cjs`):
  - echte GPU, 1920 × 1080, über den echten save-server;
  - je Aufruf zwei Ladungen in einem Profil: kalt (leer) und zweit (Platte und HTTP-Cache bleiben);
  - gemessen: DOMContentLoaded, load, Kontrolle (`state._weltbildDa`, ab Navigation), Skript-Anfragen mit Zahl, Bytes und
    Namen.
- **Frames:** omen-messfolge aus `abab-i543`, dasselbe Instrument wie 1310-12. Ego, Auto-Dorf aus, Takt und Drossel je Bank.
- Vor jedem Boot fällt der Spielstand der Seite beiseite.
- **Konsum belegt:** Die B-Wiesen-Boots zeigen im CPU-Profil die Zonen (`loop 25a.js`, `updateCreatures 06c.js`,
  `_loopRender 25c.js`), A zeigt `anazhRealm.js`.

## Boot (Lauf 2, je Seite 2 Aufrufe; Werte je Boot)

| Ladung | Größe | A main | B Zonen | Δ B − A |
|---|---|---|---|---|
| kalt | DOMContentLoaded ms | 1 534 (1 469 · 1 598) | 1 723 (1 758 · 1 687) | **+189**, getrennt |
| kalt | Kontrolle ms | 29 130 (28 082 · 30 178) | 29 363 (29 206 · 29 519) | +233, überlappt |
| kalt | load ms | 2 138 (2 072 · 2 203) | 2 314 (2 344 · 2 284) | +176 |
| kalt | letztes Skript ms | 494 (492 · 496) | 604 (602 · 605) | +110 |
| zweit | DOMContentLoaded ms | 1 287 (1 234 · 1 340) | 1 202 (1 197 · 1 206) | −85 |
| zweit | Kontrolle ms | 17 729 (16 799 · 18 658) | 17 405 (17 328 · 17 481) | −324, überlappt |
| beide | Skript-Anfragen | 21 (14 aus index.html + 7 nachgeladen) | 68 (61 + 7) | +47 |
| beide | übertragen | 8,84 MB (Stamm 5,67) | 8,85 MB (Stamm 5,69) | +0,01 |

## Frames (je Seite 2 Boots; `auswertung-g.md`, `auswertung-w.md`)

| Größe | Genesis A | Genesis B | Wiese A | Wiese B |
|---|---|---|---|---|
| Frame p50 / p95 ms | 16,7 / 25,1 | 16,7 / 25,1 | 16,7 / 16,8 | 16,7 / 16,8 |
| fps Regler voll | 51,5 | 51,4 | 64,4 | 65,0 |
| CPU-Takt p95 voll / frei | 6,9 / 6,1 | 7,0 / 6,0 | 5,5 / 5,2 | 5,8 / 5,2 |
| gpu-bank ms | 16,73 | 16,24 | 12,95 (Gier −0,88: 10,94) | 12,90 (10,68) |
| Band GPU ms je Frame | 18,24 | 19,02 | 16,39 | 16,77 |
| Befehle / Dreiecke | 152 / 647k | 152 / 646k | 79 / 440k | 79 / 443k |
| VRAM MB | 118,9 | 119,2 | 112,0 | 112,7 |

- An der Genesis trennen gpu-bank (−0,48) und Band-GPU (+0,77) je 2 von 2, aber in entgegengesetzte Richtungen. Das ist
  das Rauschen der Sitzung, kein Code-Term: das Verhalten ist byte-gleich (Fingerabdruck 3 182 Schlüssel, 0 Abweichungen).
- An der Wiese liegt der CPU-Takt p95 voll um +0,3 ms höher (5,5–5,6 gegen 5,7–6,0). Frei ist er gleich, die Frame-Zeit auch.

## Lauf 1, verworfen (mein Fehler, beim Namen)

- Für den Vorrang habe ich die laufende 1310-13-Serie abgebrochen. TaskStop beendete aber nur ihre äußere Shell. Die
  Schleife lief bis 03:04:24 weiter (`lauf1-verworfen/k13-schleife-fortschritt.log`). Dabei:
  - tötete sie die Server und startete die V18.545-Seite (`abab-b545`, die A-Seite);
  - luden die B-Zweit-Boots von Lauf 1 deshalb das A-Muster (21 Skripte, `anazhRealm.js` 5,67 MB);
  - starben gA1/gB1 von Lauf 1 beim Umstellen (exit 127).
- Lauf 2 wiederholt die vier Boot-Proben und das erste Genesis-Paar, mit Wache vor und nach jedem Lauf und den Namen jeder
  Ressource.
- Gültig aus Lauf 1 sind nur Boots nach 03:04:24: gA2/gB2 und die Wiese. Die Wiese belegt die Zonen im Profil.
- Die 1310-13-Boots aus dieser Zeit sind ebenfalls verworfen.

## Pflicht-OFFEN Rest

- Pflicht-OFFEN B (Ankunft ≤ 5 s kalt): Auf dem OMEN steht die Kontrolle kalt bei 29 s und im Zweit-Boot bei 17,5 s, auf
  beiden Seiten. Der Schnitt ändert daran nichts.
- Ohne Cache-Control/ETag lädt jeder Boot 8,84 MB Skripte neu. Benannt, nicht geschnitten.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit.
- Messbäume `abab-b545` (A) und `abab-z545` (B, 9fb869a5) bleiben für Folgefragen.
- Werkzeug `p3/k14`: `serie.sh` (TEILE, BOOTL, FOLGEL), `boot.cjs`, `fingerabdruck.cjs`, `auswertung.cjs`.
- Weiter mit 1310-13 (GTX-Ratschen), neu gestartet.
