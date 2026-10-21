# Bericht 2110/2210 profiband-k3 (OMEN) — gestoppt nach Punkt 1 per Spike-Regel: zerlegen nennt an Wiese Ego keinen Täter über 12 ms

Zweig `profiband-k3` ab integ-probe 2160be58, Kopf **b40dad6e** (WIP [skip ci]).

## 1 — bewohner-satz hat seine Haushalt-Klasse (geschnitten)
- `spec/profiband/haushalt.json`: neue Klasse **bewohner** neben tier, Regel `^bewohner-satz$`.
  - 16 Befehle aus der Reserve (19 → 3), 80k Dreiecke.
  - Haushalt-Summe 208/208 Befehle und 680k/680k Dreiecke = Band. Mehr Dreiecke trägt das Band nicht.
- Die 12 Ratschen tragen die Zeile `bewohner` ungemessen (null, wie tier); die Neuprägung füllt sie.
- `diag-profiband` GRÜN: 13 Klassen, H2 je Ort × Gerät × Sicht.
- **Ehrlich:** Gemessen zeichnet bewohner-satz am Dorf 242k Dreiecke (haupt 86k · k0 78k · k1 78k, dMax 64 m), also 3× über seiner Klasse.
  - Die Tafel markiert das mit „!“, die Linse nennt es nicht rot (Klassen-Überzug ist kein Ratschen-Rot).
  - Die Dreiecke hängen an der Kopfzahl (koerper L2 4000 × Gestalten × Pässe). Das ist der nächste Bewohner-Hebel (Lehre 19: Kosten ins Asset), nicht hier geschnitten.

## 2 — GPU je Bild an Wiese Ego: STOPP (Feststeck-Zeile)
`werkbank zerlegen --runden 6` an Wiese Ego, Kopf 2160be58, frischer Boot `--echt`, 1920×1080, eingeschwungen mit `lauf 30 --ein 20 --ruhe 300`.
- **Gesamt 11,71 ms/Frame**, gpu-bank vor/nach **11,88 / 11,81**: in diesem Boot unter 12.
- **Posten (Δ ms ± σ):**
  - baum 3,53 ± 0,07 (30 %, 50 Befehle)
  - karten 1,14 ± 0,11 (EIN Befehl, fimp:atlas:L2)
  - traa 0,88
  - boden 0,77
  - nahWiese 0,67
  - feldPass 0,32
  - nachbild 0,25 · bloom 0,25 · busch 0,21 · streu 0,11
  - leerer Frame 1,02, geteilt 2,58
- Das sind die stetigen Verbraucher, kein Täter des Überzugs.
- **Die 13,13 aus M13 ist ein zweiter Modus der Bank an der Wiese bei gleicher Szene:**
  - Wiese-Ego-gpu-bank heute über 6 Boots: 11,83 · 11,79 · **13,51** · 11,58 (abab7) · **13,13** (M13-Band) · 11,88 (hier).
  - Das sind 2 von 6 Boots oben. Befehle, Dreiecke und VRAM sind je Boot gleich (abab7: 38/49 Befehle, 263,5k, 108,6 MB).
- **Feststeck-Zeile:** Über 12 geht es nur im oberen Modus, und dessen Ursache (Sitzungs-Zustand wie k0 oben/unten, Takt, Bundle-Reihenfolge) nennt die Zerlegung nicht.
  - Ein Täter erst über ≥ 2 Boots je Modus (Regel 5).
  - Nächster Hebel wäre eine Zerlegung IM oberen Modus (Boots wiederholen, bis die Bank > 12,5 zeigt, dann `zerlegen`).
- Der Exit 1 von zerlegen kommt vom Schalter `traaKopien` (0 Kopien je Frame, nichts zu unterdrücken), sonst schalteten alle Schalter und der Zustand kam zurück. STEMPEL-POOL grün.

## 3, 4 — nicht begonnen (Spike-Regel)
- VRAM Genesis Third 118,9 > 118 (Halter `werkbank puffer`) und die Neuprägung der 6 GTX-Ratschen stehen offen.

Roh: OMEN `p3/n2210/pk3/z1/`; hier `bericht/2110-profiband-k3/` (zerlegen.txt/.json, bank-0/1, lauf.txt, zerlegen.sh).

Status ZWISCHENSTAND + Übergabe: Zweig profiband-k3 b40dad6e (Punkt 1), gestoppt nach Spike-Regel; Entscheid beim Koordinator: Zerlegung im oberen Modus oder Punkt 3 (VRAM) + Ratschen.
