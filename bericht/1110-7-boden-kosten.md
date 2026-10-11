# Bericht 1110-7 — der Aufschlag von koerper-bild: benannt, und mein Urteil aus 1110-6 korrigiert

**Urteil:**
- **1110-6 war falsch:** Der Aufschlag von +0,19–0,27 ms, den ich koerper-bild zugeschrieben habe, ist der GPU-Takt. Die
  GTX 1060 des OMEN läuft unter Last am Leistungs-Deckel (Drossel-Grund 0x4, ~70 W) mit 1680–1710 MHz, in Ruhe mit 1771 MHz.
  Der „hohe Modus“ ist dieser Takt, nicht ein Merge.
  - Belege: dieselbe Seite S3 (vor koerper-bild) erreichte um 17:13 ebenfalls den hohen Modus (6,42 · 6,46 · 6,45 ms), in
    1110-6 lag sie bei 6,22–6,28.
  - Die Zuordnung in 1110-6 kam aus den Zeitfenstern der Serie, nicht aus dem Code.
  - **Das Urteil „V18.540 ist langsamer“ (entscheidung §6.9) steht damit auf keiner Messung mehr.**
- **Was koerper-bild wirklich kostet:** der Boden-Stoff mit Himmels-Sicht, gemessen als Toggle in EINER Sitzung mit
  gemessenem Takt, **0,085 ms je Frame** an der Bühne. Das liegt knapp über dem 2σ-Band (0,064).
- **Kein Schnitt in diesem Auftrag** (Begründung unten): der Term trägt das Bild der Höhle, r184 rechnet seinen teuren Teil
  ohnehin, und ein Schnitt „nur unter Fels“ ginge nur über einen zweiten Boden-Stoff, also einen Zwilling.

Auftrag: `auftrag/1110-7-omen-boden-stoff-kosten.md` (koordination 0c80a496). Kein Code-Zweig: der Schnitt entfällt (s. u.),
`welle-m-boden-kosten` ist nicht angelegt. Rohdaten: `1110-7/`. GTX 1060, Bühne, Pose ost, Licht des Auges aus (Mess-Patch).

## Benannt: der Boden-Stoff Term für Term (EINE Sitzung, `werkbank methode _buildPbrNodeMaterial --terrain --quelle`)

- Fünf Fassungen der Methode: wie V18.540 · ohne `aoNode` · alte Normale (`_hS = null`) · ohne beide · die ganze Methode aus
  S3 1c47714d (`varianten.cjs`).
- Der Tausch baut den Boden-Stoff neu und hängt ihn an `bodenSatz`. Je Fassung Aufwärmen 120 × 2, drei Bänke 120 × 6.
- **Erste Sitzung, einmal je Fassung** (`toggle-einzeln.log`):

  | Fassung | Bänke (ms) |
  |---|---|
  | wie | 6,45 · 6,44 · 6,46 |
  | ohne aoNode | 6,31 · 6,31 · 6,33 |
  | wie | 6,41 · 6,42 · 6,42 |
  | alte Normale | 6,42 · 6,44 · 6,43 |
  | wie | 6,45 · 6,46 · 6,47 |
  | ohne beide | 6,39 · 6,40 · 6,40 |
  | wie | 6,48 · 6,49 · 6,49 |
  | ganze S3-Methode | 6,49 · 6,49 · 6,49 |
  | wie | 6,48 · 6,48 · 6,48 |

  Die Sitzung driftet um 0,07 ms; einmal je Fassung reicht nicht.
- **Zweite Sitzung, ABAB dreifach, Takt je Bank gemessen** (`toggle-abab.log`, 1678–1704 MHz, 75–85 °C):

  | Toggle | Paare wie → ohne (ms) | Mittel |
  |---|---|---|
  | ohne aoNode | 6,48 → 6,35 · 6,45 → 6,47 · 6,55 → 6,42 | −0,075, ein Paar +0,02: nicht eindeutig |
  | ganze S3-Methode | 6,49 → 6,40 · 6,49 → 6,40 · 6,47 → 6,40 | **−0,085, alle drei Paare gleich** |

- Programme (`zaehlen`): je Tausch kommt ein Programm-Satz dazu (20 → 23 vertex). Der alte bleibt im Cache, die Szene zeichnet
  nur den neuen; kein Mehr an Pipelines in der Szene.
- **Der Täter:** der Boden-Stoff von koerper-bild mit 0,085 ms. Er besteht aus dem Attribut `aHimmel` als `aoNode` (die Verdeckung
  des indirekten Lichts) und der Himmels-Sicht in der Normale. Die alte Normale allein ändert nichts Messbares, das aoNode trägt
  den größeren Teil, aber nicht eindeutig.

## Der GPU-Takt (`takt.log`, `warm-smi.csv`, `kalt-smi.csv`)

- Dieselbe Seite S3, zwei Sitzungen, die zweite nach 180 s Ruhe, je drei Bänke mit `nvidia-smi` alle 0,5 s:

  | Sitzung | Bänke (ms) | Takt | Temperatur | Leistung | Drossel |
  |---|---|---|---|---|---|
  | warm | 6,42 · 6,44 · 6,44 | 1701 MHz | 78 °C | 70,1 W | 0x1 (Leerlauf) · 0x4 (SW-Leistungs-Deckel) |
  | nach Ruhe | 6,38 · 6,41 · 6,44 | 1710 MHz | 74 °C | 72,1 W | 0x1 · 0x4 |

- In Ruhe stand der Takt bei 1771 MHz (35 W). Unter Last hält der Deckel ihn bei ~1700. Der Abstand der Moden (≈ 4 %) ist
  ein Takt-Schritt.
- Wann der Deckel tiefer oder höher greift, hängt an Temperatur und Leckstrom. 180 s Ruhe kühlen den Laptop-Chip nur um 4 °C.

## Warum kein Schnitt

- **Was r184 rechnet** (vendor/three.webgpu.min.js, PhysicalLightingModel): `indirect()` ruft `ambientOcclusion()` IMMER auf.
  Die Spiegel-Verdeckung (`dot(N,V)`, `exp2(−16·Rauheit)`, `pow`) läuft auch ohne `aoNode`, mit dem Wert 1.
  - Der Term von koerper-bild fügt nur das Attribut-Lesen und eine Multiplikation hinzu.
  - Ein `TSL.If(aHimmel < 1)` spart davon nichts: das K15-Muster, dort gemessen.
- **„Kostet unter freiem Himmel 0“** hieße: unter dem Himmel ein Stoff ohne den Term, in der Höhle einer mit. Im Satz ist das
  ein zweiter Boden-Stoff und ein zweiter Zug je Pass, also ein Zwilling, den der Auftrag ausschließt.
- **Den Term in die Albedo falten** (aHimmel × Farbe) spart das Lesen nicht und verdunkelt im Mund der Höhle auch das direkte
  Licht. Das Bild der Höhle (Auge 11) wird ein anderes.
- **0,085 ms** (1,3 % des Bühnen-Frames) für das Bild der Höhle ist ein Preis mit Bild, nach der Merge-Regel kein Täter
  „ohne Bild“.

## Offen (mit Zahl)

1. **Das Instrument muss den Takt tragen.** Die Bühne wiederholt sich in 0,075 ms nur, solange der Takt gleich bleibt. Zwischen
   Sitzungen sprang er um ~4 % (0,2–0,3 ms).
   - Schnitt für welle-m-messort-buehne: je Bank der mittlere Takt und die Drossel aus `nvidia-smi` ins JSON.
   - `--streuung` vergleicht nur Sitzungen mit gleichem Takt (±0,5 %); ein Merge-Urteil über Sitzungen ist sonst blind.
   - Das ist ein Auftrag von einer Stunde, die Bühne bleibt sonst wie sie ist.
2. **Die Merge-Stände aus 1110-6 sind nachzumessen** mit Takt, vor allem S3 gegen S6. Bis dahin gilt für V18.540 an der Bühne nur
   die Sitzungs-interne Zahl: Boden-Stoff +0,085 ms, Licht des Auges +0,03–0,11 ms.
3. Das Bild der Höhle (Auge 11, 762 / −138) ist nicht neu aufgenommen, weil nichts geschnitten wurde.

## Status: ZWISCHENSTAND · Übergabe

- Kein Code geändert; `takt-bisekt` steht wieder auf 66005ca6 ohne Patch.
- Pflicht-OFFEN Rest: A · B · C · E stehen.
- Als Nächstes: Offen 1 (Takt ins Instrument), wenn der Koordinator es so ordnet; sonst 0910-8 laut Warteschlange.
