# Bericht 2110 GTX-Messschuld 3 (OMEN): je Kriterium EINE Messung am Kopf main 2160be58, kein A/B — 21.10. 23:23–23:45

Gemessen am Baum n2010-b2a (2160be58, sauber vor und nach jedem Lauf), GTX 1060, GPU-Schloss je echtem Lauf. Rohdaten auf der OMEN in `p3/n2110/messschuld3/`, Kopien hier in `bericht/2110-gtx-messschuld-3/`.

## M26 Gelände K5 — `diag-koerper-stand --k8` je Sicht (Sicht gesetzt wie `2110-mk-kopf/k8-sicht.diff`, per k8-patch.cjs), je EXIT=0
p95 in cm, Soll Feinform ≤ 5, sonst ≤ 3. Die Spalte sicht im Log zeigt third bzw. first.
- **Ego Wiese** −280/−1046: fein 1,1 · streu 0,5 · huf 1,1 · rad 0,2.
- **Ego Hang** −526/−853, 24,4°: fein 4,3 · streu 0,8 · huf 1,7 · rad 2,3.
- **Third Wiese:** fein 1,1 · streu 0,5 · huf 1,0 · rad 0,2.
- **Third Hang:** fein 4,3 · streu 0,8 · huf 2,4 · rad 2,3.
- **Urteil:** Alle Gelände-Rollen an beiden Orten in beiden Sichten im Soll. Mit der Radeon (57a9f2ab) ist das die **2**.
- Der Fuß des Spielers (zählt Leib K2, nicht hier): Ego 3,4/3,1, Third 3,4/3,1 — weiter über 3.
- Roh: `k8-ego.log`, `k8-third.log`.

## M13 Profiband K3 (GTX-Hälfte) — `werkbank band --ort X` je Ort × Sicht, EIN frischer Boot je Ort (--echt, 1920×1080)
| Zelle | Befehle | Dreiecke | VRAM MB | GPU ms/Bild (gpu-bank) | LINSE |
|---|---|---|---|---|---|
| Genesis Ego | 107 | 284k | 116,4 | 12,47 | ROT: baum haupt 22 > Ratsche 18 |
| Genesis Third | 139 | 378k | **118,9 > 118** | 10,58 | sauber, BAND ROT (VRAM) |
| Wiese Ego | 90 | 312k | 108,7 | **13,13** | ROT: baum haupt 32 > 26, VRAM gebunden 100,9 > 95,2 |
| Wiese Third | 105 | 386k | 109,3 | **12,49** | ROT: baum haupt 32 > 26, VRAM 101,5 > 98,5 |
| Dorf Ego | 114 | 583k | 114,5 | **12,73** | ROT: **bewohner-satz 16 Befehle ohne Haushalt-Klasse**, Summe 583k > Ratsche 363k |
| Dorf Third | 118 | 658k | 115,0 | 10,98 | ROT: bewohner-satz, nahWiese 65k > 59k, Summe 658k > 417k |
- **Gegen das Soll der Karte** (Befehle ≤ 208, Dreiecke ≤ 680k, VRAM ≤ 118 MB, GPU ≤ 12 ms):
  - Befehle und Dreiecke halten überall. Dorf Third steht bei 0,97×.
  - VRAM reißt an Genesis Third (118,9).
  - GPU je Bild liegt an 4 von 6 Zellen über 12 (12,47–13,13). Das Haushalts-Soll ist 16,7.
  - **GTX-Staffel 1 nicht erreicht.**
- **Ratschen (16.10., V18.546.2) am Kopf veraltet:** baum haupt +4…+6 (tanne/fichte L0/L1) und VRAM gebunden +3…+6 MB.
- **Dorf:** Der Inhalt der Bewohner trägt +220k…+240k Dreiecke über der Ratsche, und `bewohner-satz` hat keine Haushalt-Klasse. Das ist ein Linsen-Fund des bewohner-Merges: haushalt.json braucht eine Regel für ihn.
- Eingeschwungen nach 2–11 s, STEMPEL-POOL grün. Roh: `m13-band-*.txt`, `band-*.json` auf der OMEN in `m13/`.

## Leib K1 Staffel 2 (GTX-Hälfte) — `werkbank latenz --proben 50` an der Wiese, EIN Boot, Ego/Third, LATENZ GRÜN
Werte: p50 / p95 / max in ms.
| Verb | Ego | Third |
|---|---|---|
| gehen | 29,6 / **41,0** / 42,9 | 32,2 / **40,9** / 43,5 |
| wechsel | 8,1 / 19,2 / 19,8 | 6,9 / 23,3 / 59,6 |
| springen | 21,3 / **40,0** / 60,5 | 21,3 / **34,2** / 35,0 |
| einsteigen | 13,9 / **26,9** / 94,7 | 10,1 / **21,5** / 32,1 |
- Jedes Verb liegt im Soll (p95 ≤ 50), es fehlt keine Probe.
- **Werkzeug:** Am Kopf kennt `latenz` nur gehen und wechsel. springen (Space) und einsteigen (KeyE) kamen per Mess-Patch dazu (`latenz-patch.cjs`, nach dem Lauf zurückgesetzt, der Baum ist sauber). Gemessen wird dieselbe Uhr: CDP-Taste bis zum ersten Ausgabe-Bild mit ≥ 1 cm Bewegung.
- **Ehrlich zu einsteigen:** Der GT stand neben dem Start (`latenz-gt.js`), Aufsitzen und Absitzen liefen mechanisch (auf true). Sein Mesh war aber nach 45 s nicht gebaut (`mesh: false`), der Wagen war also nicht zu sehen. Gemessen ist die Bewegung von Leib und Kamera beim Aufsitzen.
- Schwingen ist nicht gemessen (kein Verb im Spiel-Pfad gefunden).
- Roh: `latenz-1.out/.json`, `latenz-2.out/.json`, `gt.txt`.

## M25 Tiere K3 — WERKZEUG FEHLT (Koordinator-Entscheid (b)); die Teilzahlen ohne Code
- An 2160be58 hat gate:tier-gang weder ein Tastgrad-Urteil noch einen Querhang 20°. Der Koordinator baut beides als Radeon-Karte, danach misst die OMEN die GTX-Hälfte.
- **gate:tier-gang am Kopf: GRÜN, EXIT=0** (`m25-tier-gang.log`; die ❌-Zeilen davor gehören zum Selbsttest, der feuern muss).
  - Schlupf der Tiere 0,002–0,013 (Soll ≤ 0,05).
  - Mensch gehen/laufen/Spitze 0,016/0,008/0,008.
- **Stand-Anteil in der Welt** (Tastgrad wie gemessen):
  - Wolf 0,54 · 0,55 · 0,50 bei 0,8 · 1,6 · 3,0 m/s; Fuchs 0,53 · 0,50 · 0,41; Bär 0,54 · 0,54 · 0,52; Wesen 0,54 · 0,54 · 0,53.
  - Unter Last (30 fps, Leiter) 0,24–0,43.
  - Mensch gehen 0,60, laufen 0,24.
- **Tastgrad aus `gangSchritt`** (nur Zahl, L angenommen, `m25-tastgrad.txt`):
  - Schritt und Trab 0,500.
  - Galopp fällt mit Fr: Fuchs 0,29 → 0,14, Wolf 0,25 → 0,17, Bär 0,28 → 0,20.
- **Gegen die REF:** Schritt Soll ≥ 0,6, das Gesetz hat 0,5 und gemessen sind 0,50–0,55 — würde ROT. Trab 0,4–0,5 hält. Galopp < 0,4 hält, unterschreitet aber ≈ 0,3 bei hohem Fr.
- Third-Bild aus 10 m im Gang: nicht gemacht (braucht einen eigenen Boot mit Spawn und Kamera, nicht billig).

Status ZWISCHENSTAND + Übergabe: M26 gebucht (die 2 mit der Radeon). M13 GTX gemessen, Staffel 1 ROT (VRAM Genesis Third, GPU > 12 an 4 Zellen, Linse bewohner-satz). Leib K1 St. 2 GTX gemessen, alle 4 Verben im Soll, schwingen fehlt. M25 Werkzeug fehlt. bausatz-absage 8210f3e2: Zweig-CI ungelesen.
