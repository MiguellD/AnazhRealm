# mensch-zahlen — Vorprüfung 1 (GTX 1050, 22.11.)

Vorprüf-Kopf `22ee5f1ab` auf `mensch-zahlen` (über main `30e01e758`, V18.546.372). Alle Zahlen am eigenen Kopf an der GTX 1050,
Werkbank `--echt`, je Sprosse die Seiten-Funktion ihrer Station (punkte-maschine). ZWISCHENSTAND — Karte 2 gebucht 50 von 1 718.

## Die fünf Sprossen #1

| Sprosse | Ort | vorher | am Kopf | Soll | Urteil |
| --- | --- | --- | --- | --- | --- |
| `mensch.sport.koennen#1` CV der 100-m-Zeit | stadt-voll | 1,54 % · 0 von 100 mit Können | 14,46 % · 1 367 von 1 367 | 10–20 | hält |
| `mensch.geist.absicht#1` dem Zug zugeordnet | stadt-voll | erste 20 0,60 · alle 0,54 | erste 20 0,70 · alle 0,74 | ≥ 0,6 | hält |
| `mensch.fahrzeug.form#1` Tempo schwer ÷ leicht | wiese | 1,00088 | 0,8403 (Masse × 1,8963) | < 1 | hält |
| `mensch.nahrung.tier#1` Abstand p95 über den Hang | dorf | 5,33 m | 4,04 m (Hang 29,5°) | ≤ 5 | hält |
| `mensch.menge.bevoelkerung#1` Σ Soll | genesis | 6 Orte + 6 Fahrer = 12 (16:50, .370) | 12 Orte + 6 Fahrer = 18 | ≥ 20 | OFFEN |

Die Vorher-Zahlen der vier ersten Zeilen stammen vom Zensus an main e88a0b535 (.370); Tier und Form sind am gemergten Kopf
nachgemessen (4,04 m · 0,8403). Die Zählung an main .372 ist am selben Tag nicht gemessen — die Zeile ist kein Anspruch.

## Die Schnitte (je EIN Gesetz an der Wurzel)

- **Können** — koerper-core `leibKoennen(dials)`: Kraft der Beine über dem Gewicht (legM² × Höhe ÷ leibGroesse, 1 am Kanon), Lauf = √Kraft.
  Der Wirt liest es (`b.koennen`, `b.tempo = b.tempoBand × lauf`), das ferne Gang-Band bleibt am Kanon. Kein Würfel: das Profil kommt
  aus Genom und Alter. Folge im Spiel: die 100 m im Mittel 78,6 → 91,1 s, das Geh-Tempo am Abend im Median 1,27 → 1,07 m/s
  (Spanne 0,59–1,45) — die Stadt geht langsamer und ungleich.
- **Absicht** — `TAGES_GESETZ.zuege.ausgeglichen` trug kein Gesetz; jetzt teilt er seinen Abend (`abendTreffH 1,5`: erst am Treff,
  dann vor seiner Tür), der Häusliche hat kein Los am Abend (`treffMal 0`), und daheim trägt nur das Werk einen Stand (der Griff
  `binden` reichte den Werk-Stand vor dem eigenen Haus auch als Abend und als Tisch durch).
- **Form** — vehicle-core `carPhys(P, Pm)` / `exportDrive(Pin, rezeptId)`: der Motor ist ein Teil des Rezepts, der Stempel baut die
  Form, nie den Motor (vorher wuchs die Leistung mit der Masse: × 1,8963 bei Masse × 1,8963).
- **Tier** — `_tickKreaturVerhalten`: wer für seinen Auftrag unterwegs ist, trägt keine Aktion des Gemüts (der Folger blieb am Hang stehen).

## Der Abend der Stadt in Zahlen (stadt-voll, 1 367 Bewohner, wo jeder steht)

| Zug | 18:30 main | 18:30 Kopf | 20:00 main | 20:00 Kopf |
| --- | --- | --- | --- | --- |
| häuslich | Abend-Stand 101 · Tür 180 | Abend-Stand 0 · Tür 281 | Abend-Stand 129 · Tür 208 | Abend-Stand 0 · Tür 338 |
| ausgeglichen | Abend-Stand 144 · Tür 135 | Abend-Stand 162 · Tür 94 | Abend-Stand 194 · Tür 156 | Abend-Stand 5 · Tür 320 |
| gesellig | Abend-Stand 156 · Tür 85 | Abend-Stand 129 · Tür 100 | Abend-Stand 211 · Tür 93 | Abend-Stand 185 · Tür 119 |
| fleissig | Werk 109 · Abend-Stand 36 | Werk 138 · Abend-Stand 6 | Abend-Stand 149 · Tür 146 | Abend-Stand 84 · Tür 191 |

Lesehilfe: auf main zählt als „Abend-Stand“ auch der Werk-Stand vor dem eigenen Haus (der durchgereichte Griff) — am Kopf steht
dort keiner mehr, er steht vor seiner Tür.

## Bilder (960 × 540, stadt-voll, dieselbe Pose 856,5 / 57,2 / 437,0 → 844,5 / 56,6 / 437,0)

- `abend-main.png` ↔ `abend-kopf.png` — 20:00 Uhr. Auf main steht noch jemand am Markt, am Kopf ist die Gasse leer: wer nicht
  gesellig ist, steht um diese Stunde vor seiner Tür.
- `morgen-kopf.png` — 7:12 Uhr am Kopf: der Weg ins Werk, Gruppen an den Ständen, keine gestapelten Leiber. Ein Standbild trägt das
  Tempo nicht; das Können steht in der Zahl (CV) und in der Linse (ρ 0,874).

## Linsen (rot am alten Stand, Täter beim Namen)

- gate:kreatur-takt `--proben bewohner` am Kopf GRÜN: Können 89 von 89, ρ Können ↔ gegangenes Tempo 0,874, stärkere Hälfte × 1,234,
  Schlupf 0,038; „daheim am Werk“ 0 von 42. Täter `bewohner-koennen`, `bewohner-abendstand`.
- gate:mensch-zuege GRÜN: 0,90 der ersten 20, 0,85 aller 100, jeder Zug ≥ 0,6 (am alten Kern: ausgeglichen 2/16, 4 Häusliche mit
  dem Abend außer Haus); drei Täter.
- gate:koerper-kern GRÜN (K1–K4 Können, vier Täter) · gate:garage-labor GRÜN (G12, Tempo × 0,663–0,908 über 30 Stufe × Gattung) ·
  gate:vehicle-drive GRÜN (B-g: Leistung × 1,000000 bei Masse × 1,8963).
- Statik-Kette (check:statik, format, lint, atlas) GRÜN · Anker-Probe ohne gebrochenen Anker · Playtest: Lauf 2 „Alle Invarianten
  OK“ (Lauf 1 fiel an den drei Feld-Zeilen der Register-Klasse von 08:00 / 15:30).

## Offen, mit Grund

- **bevoelkerung#1** bleibt ROT: Σ Soll 18 < 20. Zwei Hüllen-Wahrheiten eines Hauses rücken Stände während der Zählung (1 von 5
  Orten verliert sein Soll), und die Station zählt den Fahrer im Kreis als Ist, nie als Soll (3 Uhr, Ort 1: Ist 2 / Soll 0). Beides
  steht im FUND-REGISTER; die EINE Hülle ist eine Gesetzbuch-Entscheidung.
- **absicht**: häuslich 15 von 29 erkannt (14 mit dem Mittag außer Haus — der Zug regiert den Tisch nicht), fleissig 20 von 29
  (Gasthaus ×4, Posten ×5).
- **Können**: die Seele des Spielers und das koerperstudio lesen `leibKoennen` nicht; das mittlere Geh-Tempo sank (siehe oben).
- **Fund von main**: an der Pose 804,9 / 62,8 / 402,8 der Stadt ruht die Welt nie („Fege-Takt archCull wartet“, 1 970 Takte) —
  `werkbank bild` fällt dort an main 30e01e758 wie am Kopf.
