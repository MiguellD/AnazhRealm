# Bericht Baum, Schnitt 1 — der Tiefen-Vorlauf (ZWISCHENSTAND, Spike NEIN)

Stand 15.11.2026 00:50 (date). Baum `w28-baum-schirm` auf main 68d24688; Gerät Radeon 890M, EINE Welt `werkbank start --echt` gegen
den save-server des Lese-Baums (main), `r._schirm()` = 1920 × 1080 (pxJeM 703,7) in jeder Messung; der Vorlauf live in der Seite
(Lehre 20). Rohdaten: `artifacts/profiband/auge/w28-baum-schirm/schnitt1/` (spike.log, spike-abba-*.json; kurz-* = Probe neben dem
echt-Job, unter Last, zählt nicht).

## Geschnitten

Nichts in main. Gebaut und wieder zurückgenommen (Zweig `w28-baum-schirm`, 06af6f67 → Rücknahme b0be0435, Baum = main):
EIN Chokepoint `renderObject` jedes Renderers (`_tiefenVorlauf`, stamm/stoff-instanz.js nach `_laubLichtStoff`; Ruf in
`_configureRenderer` stamm/bild-kosten.js:528), je Zug eines Laub-Stoffs mit Ausschnitt erst ein Basis-Stoff nur Tiefe (Lage,
Farb-Alpha, `maskNode`, Vorhalt `polygonOffset`), dann die Farbe ohne Tiefen-Schreiben (`_farbeOhneTiefe`); Linse H8 in
gate:profiband (main ROT beim Namen, fünf Mutanten rot, Selbsttest 42/42). Der Spike sagt nein — nichts Halbes bleibt.

## Gemessen (A B B A in EINER Welt, 5 Durchgänge × 2 × 30 Bilder, Anteil (aus − an)/aus, Median ± 1,253·sd/√n)

| Ort · Posten mit Vorlauf | Anteil gespart | Vorlauf-Züge je Bild |
|---|---|---|
| P2 Mess-Wiese, alle (Laub · Blatt-Karte · Karte) | **5,3 ± 3,7 Punkte** (Soll ≥ 12,5) | 40 |
| P2 nur Laub („laub") | 4,9 ± 4,9 | 16 |
| P2 nur Blatt-Karte („atlas") | 8,5 ± 5,1 | 23 |
| P2 nur Karte L2 | **−7,2 ± 1,6** (teurer) | 1 |
| P1 Ankunft (genesis), alle | **−17,5 ± 4,4** (teurer) | 12 |
| P1 nur Laub | 1,7 ± 5,5 | 0 (kein Laub im Bild) |
| P3 Kronen-Masse | ungemessen: an der Mess-Wiese kein `_occluded`-Baum ≥ 15 m | — |

- Der Dreiecks-Haushalt der Klasse `baum` (gate:profiband P, der Vorlauf als eigener Pass): P 132 244 + maskierte Laub-Dreiecke im
  Hauptbild 41 076 (L0 18 784 · L1 22 292; Golden-Meshes mit alphaTest > 0 × Zensus der Mess-Wiese) = **173 320 > 150 000** — ROT.
  Auch L0 allein (151 028) oder L1 allein (154 536) reißt ihn; die Karte (`karten`: 1 Befehl) verdoppelte ihren Befehl.
- Referenzfahrt vor f 1,28–1,30 (über 1,2), nach f 1,01–1,04; GPU je Bild an P2 39,9–65,6 ms (geteilte iGPU) — die Anteile tragen den
  Takt-Zustand nicht, die Streuung steht oben.
- VRAM nach zwei GC 122,1 ↔ 122,1 MB (aus ↔ an), Heap 648,4 ↔ 634,8 MB.

**Urteil: Spike NEIN** an allen drei Stellen — 5,3 statt ≥ 12,5 Punkten, P1 und die Karte teurer, der Dreiecks-Haushalt reißt. Die
Wurzel „Lagen × Reihenfolge" stimmt als Lage-Zahl (Node), sie trägt auf der Radeon aber keine 3,3 ms: der frühe Tiefentest verwarf
die hinteren Lagen offenbar schon (`_buendelKinderReihe` vorn zuerst), der Vorlauf bezahlt die Ecken zweimal.

## Bilder

Keine: ohne Schnitt kein Paar (die Paar-Läufe P1–P4 standen bereit, `lauf-bilder.sh` im Scratch, und liefen nicht).

## Ehrlich offen

- Der Schnitt fällt OFFEN und benannt: Messname „Anteil `baum` an der GPU-Zeit" (29,6 % Radeon, befund-gpu); der Vorlauf gemessen
  5,3 ± 3,7 Punkte an P2, −17,5 an P1.
- P3 ungemessen (kein verdeckter Baum ≥ 15 m an der Mess-Wiese); die GTX 1060 ungemessen.
- Schnitt 3 hängt laut Entscheid an Schnitt 1 („ohne Schnitt 1 wird dieser Schnitt nicht gebaut").

Geschnitten: nichts in main — der Vorlauf gebaut, gemessen und auf dem Zweig zurückgenommen.
Gemessen: P2 5,3 ± 3,7 Anteils-Punkte (Soll ≥ 12,5), P1 −17,5, Karte −7,2, Haushalt baum 173 320 > 150 000.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md).
Status: ZWISCHENSTAND
