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

---

## Nachtrag 22.10. ~02:30 — Entscheid des Koordinators abgearbeitet, Kopf **64d2f76f** [ci voll]

**(2b) Oberer Bank-Modus — FESTSTECK-ZEILE (ohne weitere Jagd, Entscheid Koordinator):**
- 4 frische Boots an Wiese Ego, Kopf 2160be58: Bank **12,47 · 12,29 · 12,33 · 11,48** ms, keiner über 12,5, also keine Zerlegung im oberen Modus.
  - k0 in allen 4 Boots unten (0,26), P0 1708–1721 MHz.
- **Korrektur der Spur:** Der 13,51-Boot war abab7 **B1** mit k0 unten (0,26). B2 hatte k0 oben (0,62), aber Bank 11,58. Ein Kaskaden-Zustand ist nicht der Täter.
- Über 10 Boots streut die Wiese-Ego-gpu-bank von **11,48 bis 13,51** ms (Median ≈ 12,3) bei gleicher Szene (38/49 Befehle, 263,5k Dreiecke, 108,6 MB). Gleich bleiben Takt und Drossel; die Bank misst nur ~1 s.
- Die Zerlegung bei 11,71 nennt nur stetige Verbraucher: baum 3,53 · karten 1,14 (ein Draw) · traa 0,88 · boden 0,77 · nahWiese 0,67.
- GPU ≤ 12 hält die Wiese damit nicht stabil. Ein einzelner Täter ≥ 0,5 ms fehlt.

**(3) VRAM Genesis Third — GESCHNITTEN:**
- **Halter des Überzugs:** `tex:TRAANode.flacker` (2 × r8unorm 1920×1080 = 4,1 MB), neu seit A3b/G7 (17.10.) und nicht in der Ratsche vom 16.10.
  - Es ist der zweite MRT-Anhang des Resolve in Ausgabe-Größe; Alpha des Resolve trägt schon die Vortiefe, also nicht packbar.
  - Daneben `buf:tier` 7,8 MB (freie Klasse, Weltzustand: prozedurale Einzel-Leiber, Bär 64 / Fuchs 63 / Wesen 61 Puffer).
- **Schnitt:** Der Tor-Atlas (`stamm/siedlung-ort.js` `_torZielEinsetzen`) liegt in **rgb9e5ufloat** statt rgba16float.
  - Die Membran liest nur `.rgb`, die Zeile ist lineares HDR ≥ 0.
  - `_rgb9e5AusHalb` packt den Export, `_torZielDaten` entpackt für die Linse; die Export-Datei und ihr Stempel bleiben rgba16float.
  - Rundlauf über 2197 Texel: Fehler ≤ 1,82e-3 relativ zum hellsten Kanal (≤ 2⁻⁹).
- **Gemessen** (EIN Boot je Seite, Genesis Third, `band`): VRAM **119,0 → 115,4 MB**, `tex:tor-ziel` 7,0 → 3,5. Band ROT → IM BAND. Befehle 139 = 139, Dreiecke 377k = 377k.
  - Schirm A/B gleich (vram-A/B-schirm.png; die Membran ist animiert, kein Pixel-Diff).
- **gate:portal-membran am Kopf:**
  - Lauf 1 ROT nur an „B Lauf — DIE WELT STEHT NICHT nach 1941 Takten … Fege-Takt archCull wartet“. Das ist der bekannte Welt-Ruhe-Wackler, fremd; alle Z-Prüfungen des Atlas waren im selben Lauf grün.
  - Lauf 2 und der Endkopf (64d2f76f) GRÜN, die Basis 2160be58 GRÜN.

**(4) Die 6 GTX-Ratschen neu** (Kopf 7343f4b8 = integ b9537781 + Zweig, V18.546.55, je Ort × Sicht 4 Läufe Erst/Zweit, `werkbank ratsche --neu`, alle exit 0)
Je Zelle die 4 Läufe: Befehle · Dreiecke · VRAM MB · GPU ms/Bild (`ratschen-tafel.md`):
| Zelle | Befehle | Dreiecke | VRAM | GPU |
|---|---|---|---|---|
| wiese ego | 90 | 311–312k | 108,7–111,3 | 11,51–12,16 |
| wiese third | 105 | 386k | 109,3–112,1 | 11,84–13,09 |
| genesis ego | 107 | 286k | 110,0–112,8 | 11,88–12,98 |
| genesis third | 138–139 | 378–379k | 112,3–113,1 | 11,69–12,77 |
| dorf ego | 114 | 583k | 114,2–114,8 | 12,84–13,68 |
| dorf third | 118 | 657k | 114,7–116,2 | 12,86–13,32 |
- **Staffel 1 GTX (Haushalt + Ratsche frisch am Kopf):**
  - Befehle ≤ 208, Dreiecke ≤ 680k und VRAM ≤ 118 halten in allen 6 Zellen.
  - **GPU ≤ 12 hält nicht:** 16 von 24 Läufen über 12. Dorf liegt durchgehend bei 12,8–13,7 (bewohner-satz 242k Dreiecke).
- Die Ratschen tragen jetzt die bewohner-Zeile gemessen. Die 6 Radeon-Ratschen tragen sie ungemessen (null); sie gehören an die Radeon.

**Wände am Endkopf 64d2f76f** (integ 7670a4a1 hineingemergt → Merge in integ = Fast-Forward):
- check EXIT=0, voll durchgelaufen bis gate:haus-fern. **Vorher** rot: Atlas-Ratsche R7 (`_rgb9e5AusHalb` fehlte in der Modul-Karte) und betriebsgesetz DECKE (scripts +22 Atome) → beide behoben, scripts 0 Atome.
  - Achtung: `stamm-umzug --nach-karte` nullte beim Eintragen die Quellen-Abdrücke von soll-tafel und albedo-tafel (`c:0000…`). Ich habe die zwei Tafeln zurückgesetzt und nur die Karten-Zeile behalten.
  - Achtung Exit-Code: Der erste check-Lauf meldete EXIT=0, obwohl er nach 30 Zeilen rot abbrach.
- playtest:fast EXIT=0, gate:portal-membran GRÜN. ci-lokal nicht gefahren.

Status ZWISCHENSTAND + Übergabe: Kopf 64d2f76f [ci voll] gepusht, Zweig-CI ungelesen. Offen: GPU ≤ 12 (Bank-Streuung, Dorf-Bewohner), bewohner-satz 3× seine Klasse (Radeon-Karte), Radeon-Ratschen. Als Nächstes läuft das ABAB naesse.
