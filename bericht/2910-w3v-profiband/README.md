# w3v-profiband-koord — Stationen profiband K1 · K2 · K3 · K5 (29.10.)

Vorher: keines der vier Kriterien trug eine Station (0 von 8 Punkten, `punkte.cjs liste` 193 Stationen). Nachher: 8 Stationen
(201), Fehler 0; `punkte.cjs selbsttest` GRÜN 77/77 mit 98 Proben. Kein Code-Zweig: jede Zelle misst ein Verb, das steht.

## Die zwei Befehle (meisterkarte-quelle/punkte/stationen/g6.js)
- `PB_LAUF` — K1#1 K1#2 K2#1 K2#2 K3#1 K3#2 sind Zwillinge (EIN Lauf je Gerät, ~80 min): 4 frische Sitzungen, je Zelle
  `werkbank lauf 30 --regler voll --tiere frei` plus die Probe in der Seite (Halte-Griff, Sicht, Geh-/Sprint-Tempo, Skala);
  stehend Wiese/Genesis × Ego/Third, bewegt Wiese Ego gehend · Sprint (Shift+W) · GT-Fahrt (V: Third ↔ Ego) · Genesis Third
  gehend · Stadt gehend (Hauptgasse) · Sturm mit 50 Tieren; Sitzung 1 dazu `werkbank band` je wiese/genesis/dorf × ego/third.
  Je Zelle der obere Median der 4 Sitzungen, jede Sitzung gültig (`pbFehl`).
- `PB_AUSDAUER` — K5#1 K5#2 (~25 min): erste 5 min Wiese Ego gehend → Puffer → 2,5 min GT-Fahrt → Bau und Tor →
  `puffer --gang 3` → letzte 5 min → Puffer. p95 letzte ≤ erste × 1,05, Gang GRÜN, Puffer ruhend/verwaist 0, Weg ≥ 5 km.

## Soll (src/g6.js) → Urteil
| Staffel | Zellen | Soll | Gerät |
|---|---|---|---|
| K1#1 | 6 bewegt | Frame p95 ≤ 33 ms | beide (`beide: true`) |
| K1#2 | 4 stehend + 6 bewegt | Frame p95 ≤ 16,7 ms | beide |
| K2#1 | 4 stehend | Belegung p95 ≤ 5,8 ms (CDP-Spur, `belegungAuswerten`) | eines |
| K2#2 | stehend / bewegt | ≤ 5,8 / ≤ 8 ms | beide |
| K3#1 | 6 Bänder im Stand | Exit des Bands (Haushalt, Ratsche, 208 / 680k / 118 MB) + gpu-bank ≤ 12 ms | beide (`beide: true`) |
| K3#2 | Bänder + 10 Zellen | Befehle p95 ≤ 208, Dreiecke p95 ≤ 680k, VRAM ≤ 118 MB, GPU p95 ≤ 12 ms | beide |
| K5#1/#2 | Ausdauer-Gang | wie oben | eines / beide |

Die Punkte-Maschine buchte eine Staffel 1 bisher an EINEM Gerät; K1#1 und K3#1 nennen beide Geräte. `beide: true` (punkte.cjs
`stufen`, `messPlan`, `gtxNutzen`) bucht die 1 erst, wenn jedes grün ist; eine Staffel 1, deren Text beide Geräte nennt, ist
ohne `beide` ein Format-Fehler.

## Trocken (Cloud, ohne GPU — Kartenkopf N7)
`trocken/`: der Befehl der Station wörtlich gegen eine Stub-Werkbank, deren Ausgaben die echten Linsen des Spiel-Baums ableiten
(`belegungAuswerten` an einer Spur, `bandUrteil` gegen Haushalt und Ratsche, `gangUrteil`).
`SPIEL=<Spiel-Baum> node trocken/fahre.cjs profiband.K1#1 [gruen|linse|skala|halten]`

| Lauf | Urteil |
|---|---|
| K1#1 K2#1 K2#2 K3#1 K3#2 K5#1 K5#2 · gruen | GRÜN (Belegung 5,38 stehend / 7,46 bewegt aus der Linse) |
| K1#2 · gruen | ROT: wiese-fahrt 16,8 > 16,7 (der Stub-Wert der Fahrt) |
| K3#1 · linse (Band am leeren Zensus) | ROT: VRAM über der Ratsche, Ratsche zu weit (die Befunde der Linse) |
| K1#1 · skala (Szenen-Skala 0,5) | ROT: 24 Befunde „Skala 0.5 < 0,75" |
| K2#1 · halten (Halte-Griff in Sitzung 2) | ROT: 4 Befunde „s2: Tiere angehalten" |

GPU: an der Station. Das Urteil fällt beim Koordinator an Radeon und GTX.
