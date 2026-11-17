# w28-brand-saum — ZWISCHENSTAND (GTX 1050, 17.11.)

Anlass: `karte2.same.kopplung.kaskade#1` ROT an Radeon und GTX 1060 am 884c6a25 („Flammen im Bild +0 Pixel bei 22 gezeichneten Flammen").

## Geschnitten

- **Die Zungen der Front stehen dicht** (`stamm/feld-leben.js` `BRAND.bild.abstandMinM` 0,5 → 0,2 m): die Zunge ist ~0,2 m breit,
  bei 0,5 m Abstand stand die Front als Kranz einzelner Punkte, jetzt als geschlossener Flammen-Saum. Form, Länge (Byram) und
  Tempo (Rothermel) sind unberührt.
- **Widerlegt und zurückgenommen:** jede Zunge so breit wie ihr Anteil der Front (0 Instanzen mehr) — aus 8 m werden die Flammen
  flache blasse Hügel (`saum-nach-nah`), keine Zungen.
- Linse: Fall N5 an `diag-stand-takt.cjs --narbe` (der Abstand der Flammen gegen die Breite der Zunge, Laufzeit-Mutante 0,5 m).

## Gemessen (Mess-Wiese, Herd −248/−1064, Pose der Station −238,1/38,6/−1046,6 → Herd, 960 × 540, `brennen(60)` wie die Station)

| | vor | nach |
|---|---|---|
| Flammen nach 60 s (1 Zelle, Ring ~5 m) | 27 | 47 |
| Flammen-Pixel im Differenz-Bild mit − ohne Flammen-Satz, Farb-Regel der Station | 341 | 545 |
| warme Pixel mit − ohne (das Maß der Station) | +297 · +274 | +306 |
| warme Pixel OHNE Flammen von Lauf zu Lauf | 539 · 694 | 731 |

Bilder: `saum-vor-*` ↔ `saum-dicht-*` je `station` (Pose der Station), `auge` (Augenhöhe 14 m), `nah` (8 m).

**Preis ABAB** (Dorf-Wiese, `lauf 15`, Brand 60 s: 2 Zellen, 38 → 55 Flammen; nach · vor · nach · vor):

| | Frame p50/p95 ms | CPU-Takt p50/p95 ms |
|---|---|---|
| mit Brand, vor | 16,70/33,37 · 16,68/33,35 | 16,03/33,37 · 16,35/29,92 |
| mit Brand, nach | 16,69/33,35 · 16,70/33,39 | 15,22/30,12 · 16,47/33,69 |
| ohne Brand, vor | 16,68/33,42 · 16,68/33,37 | 17,95/26,20 · 16,43/25,94 |
| ohne Brand, nach | 16,70/33,46 · 16,69/33,42 | 18,82/26,66 · 17,49/27,38 |

Frame p95 unverändert, der CPU-Takt mit Brand an der Streuung der Paare.

## Ehrlich offen

- **Die Sprosse wird am Schnitt allein nicht sicher grün.** Das Maß der Station (Summe warmer Pixel mit − ohne Flammen-Satz,
  bei 0 gekappt) liegt im Rauschen: das gelbe Gras im Wind erfüllt die Farb-Regel, die Summe ohne Flammen schwankt 539 ↔ 731,
  das Signal ist ~300. Vorschlag: je Pixel zählen (warm MIT und nicht warm OHNE).
- **Der Brand ist nach 60 s gesetzestreu klein:** Gras = Rothermel-Modell 1 bei fast Windstille, R 0,079 m/s, ein Ring von ~5 m,
  Flammen 0,31–0,75 m (Byram). Aus 24 m ist der Ring 78 px breit, jede Zunge 4–11 px hoch. Größer hieße das Gesetz biegen.
- Nacht-Bild des dichten Saums: nicht geschossen. Die offenen Punkte von w28-brand-bild stehen unverändert
  (Rauch-Scheiben nachts, Asche im Regen, `--brand` rot im Aufbau, Blitz gibt es nicht).
