# Bericht 2210 naesse-kosten: Kopf **d7cd7267** [ci voll] (Zweig naesse-kosten, integ-probe 9d580ff1 hineingemergt → Merge in integ = Fast-Forward)

- **Zerlegt beim Namen** (GTX, EINE Welt: Wiese Ego im Regen nach 10 min, Kopf integ 85cec9c1, Mess-Patch `dachAn` nur lokal):
  - Lagen trocken / nass ohne Dach-Pool / nass mit Dach-Pool, Folge D N1 N0 N0 N1 D ×2, je `gpu-bank 12 --runden 5`, Punkt 1 als Aufwärmen verworfen:
    - trocken 11,96 · 11,97 · 12,00 → **11,98**
    - nass ohne Pool 11,98 · 12,14 · 11,94 · 12,07 → **12,03**
    - nass mit Pool 12,58 · 12,54 · 12,58 · 12,56 → **12,57** ms
  - **Der Dach-Pool kostet +0,54 ms je Bild, das Nässe-Gesetz selbst +0,05.** Jedes nasse Fragment prüfte die 8 Decken-Kästen, auch an der Wiese, wo keine Decke im Umkreis steht.
  - Die +1,2 aus dem ABAB enthielt dazu die Boot-Streuung (k0-Lage). In einer Welt ist der ganze Preis 0,59.
- **Geschnitten** (`stamm/stoff-material.js`, EIN Schreiber `_dachTakt`):
  - Der Pool trägt seine Hülle: den achsparallelen Kasten um alle gewählten Decken (je Decke ihr gedrehter Grundriss) und ihre höchste Oberkante, in den Uniforms `dachHuelle`/`dachOben`.
  - `_naesseHimmel` prüft die 8 Plätze nur für ein Fragment darin (if/else über den Welt-Ort, wie die Trocken-Weiche); draußen steht offener Himmel. Ohne Decke ist die Hülle leer.
  - Die Hülle ist konservativ: Zufallsprobe 2000 Pools × 200 Punkte, 3594 Punkte unter einer Decke, davon 0 außerhalb der Hülle. Das Bild ist gleich.
- **Gemessen nach dem Schnitt** (EINE Welt je Ort, Lagen D N N D ×3, Punkt 1 verworfen):
  - **Wiese:** trocken 12,15 / nass 12,19 → **+0,04 ms** (vorher +0,59). Hülle leer, 0 Plätze.
  - **Dorf** (8 Decken, Hülle −863…−794 × −846…−808, Oberkante 91,8): trocken 10,98 / nass 11,14 → **+0,16** (Basis 7670a4a1 im selben Weg: 11,01 / 11,51 → +0,50).
  - **Ziel ≤ +0,3 ms an beiden Orten gehalten.**
- **Gleiches Bild:** `gate:naesse:echt` GRÜN mit denselben Zahlen wie an der Radeon: Wiese draußen 0,773 · Dorf draußen 0,753 · innen 1,000 · Dach-Bauten trocken 2/2 · Regen innen 0 / draußen 96–97 · Glanz 16.
- **Wände am Kopf:** check EXIT=0 (1218 Zeilen bis gate:haus-fern, betriebsgesetz grün, scripts 0 Atome), playtest:fast EXIT=0. ci-lokal nicht gefahren.

Roh: OMEN `p3/n2210/nk/` (e2 = Zerlegung, s1 = Schnitt, b-dorf = Basis Dorf, waende/); hier `bericht/2210-naesse-kosten/`.

Status ZWISCHENSTAND + Übergabe: Kopf d7cd7267 [ci voll] gepusht, Zweig-CI ungelesen. Als Nächstes `auftrag/2210-tier-gang-gtx.md`.
