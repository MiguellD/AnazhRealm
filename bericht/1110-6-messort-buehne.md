# Bericht 1110-6 — die Prüfbühne als GPU-Messort im EINEN Instrument

**Urteil:**
- **Der Ort ist gebaut und richtet:** `omen-messfolge --ort buehne` misst vier frische Boots derselben Seite je Pose mit einer
  Spanne von 0,015–0,075 ms (2σ höchstens 0,064 ms; Soll ≤ 0,1). Die Mess-Wiese lag mit demselben Urteil bei 0,40 / 1,63 ms.
- **Prüfbühne, Ego-Schatten, Haus:** keine messbaren GPU-Kosten (je ≤ 0,05 ms).
- **Ab koerper-bild:** in den meisten Sitzungen ein gleichmäßiger Aufschlag von +0,19 bis +0,27 ms auf allen Posen, ohne Bild an
  der Bühne. Das ist der Täter, der aus den +0,4–0,6 ms von 1110-4 bleibt. Seine Mechanik ist noch nicht benannt: kein Licht,
  kein Inhalt, keine Chunk-Zahl.

Auftrag: `auftrag/1110-6-omen-messort-buehne.md` (koordination 6e9df237).
- Zweig **welle-m-messort-buehne af5ed685** (per `git ls-remote`), ab **integ-probe 27e369d8**, nicht ab main.
  - main (V18.539, be1d6e57) kennt die Prüfbühne nicht. Sie kam mit V18.540; ein Instrument, das die Bühne fährt, braucht sie
    im Baum. Entscheidung hier, benannt.
- Rohdaten: `1110-6/` (wiederholbarkeit, staende, eich, diagnose). GTX 1060, 1920×1080, Seite :4312, Werkbank :4490.

## Geschnitten (das Instrument)

- **`spec/profiband/haushalt.json`:** Messort `buehne` als **Toggle-Ort**.
  - `welt`: `pruefbuehne/welt.json`.
  - `posen`: ost · west · s4-hindernisse · s5-bucht.
  - `stell`: Laub-Radius 240, Bau-Radius 150, Dichte 1, Ziel-Zeit 1000 ms, Lade-Ring 4.
  - `bank`: 120 × 6, zwei Bänke je Pose, Soll 0,1 ms.
  - Keine Ratsche: das Profi-Band richten Wiese, Genesis und Dorf.
- **`scripts/lib/band-urteil.cjs`:** das Schema kennt den Toggle-Ort (Welt-Datei, Posen, Stellgrößen, Bank, `bank.n` ≤ 200).
  `ratscheVon` bricht laut, wenn ein Band an einem Ort ohne Ratsche richten soll, in der Werkbank VOR dem Messen.
- **`scripts/werkbank.cjs`, `umstellen --ort buehne [--pose p]`:**
  - Die Seite betritt die Welt des Orts durch das Welt-Tor (`importWorldBeside` + aktiv + Neuladen) und prüft den slug danach.
  - Die Stellgrößen hält `__ortStell` je Takt fest.
  - Ein Toggle-Ort ruht erst, wenn der gebaute Ring sein Ziel erreicht und kein Chunk im Bau ist; sonst bricht er laut.
- **`scripts/omen-messfolge.cjs`:**
  - Folge `buehne` (boot … umstellen · buehne · gpu-bank).
  - Die lange Bank je Pose: Aufwärmen 120 × 2, dann zwei Bänke 120 × 6.
  - `streuungUrteil` (rein) und `--streuung <läufe…> [--soll]`.
  - Selbsttest +5 Fälle (im Soll · eine Sitzung 0,3 ms daneben · zwei Sitzungen · Pose ohne Wert · Spanne der Wiese), EXIT=0.
- `scripts/diag-profiband.cjs` prüft die Ratsche nur an Band-Orten. `gate:profiband` EXIT=0, `npm run check` EXIT=0.

## Gemessen

**Linse vorher ROT** (`--streuung`, dieselbe Seite 4× an der Wiese, Läufe aus 1110-3; `wiederholbarkeit/streuung-wiese-*.txt`):

| Stand | Gier 0 | Gier −0,88 | Urteil |
|---|---|---|---|
| A (be1d6e57) | 11,75 · 11,67 · 11,82 · 11,42 → Spanne 0,40 ms, 2σ 0,35 | Spanne 0,28 ms | ROT |
| B (27e369d8) | Spanne 1,63 ms, 2σ 1,72 | Spanne 1,78 ms | ROT |

**Bühne GRÜN** (vier frische Boots `--ort buehne` auf 27e369d8; `wiederholbarkeit/streuung.txt`):

| Pose | vier Sitzungen (ms) | Spanne | 2σ |
|---|---|---|---|
| ost | 6,49 · 6,54 · 6,57 · 6,55 | 0,075 | 0,064 |
| west | 6,53 · 6,58 · 6,55 · 6,58 | 0,05 | 0,048 |
| s4-hindernisse | 6,74 · 6,73 · 6,76 · 6,75 | 0,03 | 0,024 |
| s5-bucht | 7,75 · 7,75 · 7,76 · 7,76 | 0,015 | 0,012 |

**Was die Bühne zuerst blind machte** (Diagnose, `diagnose/`):

| Störung | Wirkung | Schnitt |
|---|---|---|
| Stempel-Pool | Eine Bank-Runde rendert n Frames in EINER Aufgabe, der Zeitstempel-Pool (2048) leert sich erst danach. 240 Frames verweigerten 288 Abfragen (Stempel-Wache ROT, `diagnose/v1-bank240.log`). | `bank.n` ≤ 200 |
| Der Lade-Ring | Er wächst nur bei Kopfraum und vollem Ring. Dieselbe Pose stand je Sitzung bei 25 oder 81–93 Chunks: 6,51 gegen 7,31 ms (`diagnose/ring-test.txt`). | `stell.ring` setzt Ziel und aktiven Ring, das Aufstellen wartet auf den gebauten Ring |
| Der Genesis-Ring | Er steht am Ursprung JEDER Welt, auch der Bühne. An der ersten Pose s0 (0 \| 0) trugen seine Tore L0 (71 im Bild, 1,24 M Dreiecke) 7,1 oder 13,0 ms, je nachdem, ob sie beim Messen standen (`diagnose/moden.log`, `m1-zaehlen.txt`). | Posen ≥ 140 m vom Ursprung mit Blick weg; ohne Pose nahe am Ursprung |

**Eich-Probe Licht des Auges** (EINE Sitzung, Pose ost, je Zustand drei Bänke nach Aufwärmen 120 × 2; `eich/eich2.log`):

| Zustand | Bänke (ms) | Mittel |
|---|---|---|
| an | 6,55 · 6,51 · 6,55 | 6,537 |
| aus | 6,46 · 6,40 · 6,42 | 6,427 |
| an | 6,53 · 6,51 · 6,53 | 6,523 |
| aus | 6,51 · 6,51 · 6,47 | 6,497 |

- Derselbe Zustand wiederholt sich in 0,014 (an) bzw. 0,07 ms (aus).
- Das Licht kostet an der Bühne 0,03–0,11 ms, im Rauschen ≤ 0,1. An der Wiese waren es 0,48 ms: das Licht zahlt je
  beleuchtetem Fragment, die Wiese trägt Vegetation mit Überzeichnung, die Insel kaum.
- Die Eich-Probe misst so die Auflösung des Orts, nicht die Größe des Lichts.

## Die Merge-Stände an der Bühne (Abnahme)

Stände der ersten Eltern-Linie, Licht des Auges in S4–S6 aus (Mess-Patch, nie committet). Je Stand zwei frische Boots, vor
S1→S6 und rück S6→S1 (`staende/`). S0 = main kennt die Bühne nicht.

| Stand | vor: ost · west · s4 · s5 | rück: ost · west · s4 · s5 |
|---|---|---|
| S1 pruefbuehne 953186f4 | 6,225 · 6,245 · 6,47 · 7,465 | 6,215 · 6,255 · 6,49 · 7,455 |
| S2 ego-schatten 9ecb874c | 6,25 · 6,275 · 6,475 · 7,47 | 6,275 · 6,29 · 6,50 · 7,46 |
| S3 haus 1c47714d | 6,225 · 6,265 · 6,475 · 7,455 | 6,25 · 6,285 · 6,495 · 7,46 |
| S4 koerper-bild 269ecfa8 | **6,32** · 6,34 · 6,53 · 7,49 | **6,51** · 6,545 · 6,68 · 7,69 |
| S5 wasser b0bcb073 | **6,315** · 6,35 · 6,54 · 7,58 | **6,505** · 6,54 · 6,69 · 7,705 |
| S6 werkstatt 03997b3f | 6,505 · 6,54 · 6,685 · 7,695 | 6,515 · 6,535 · 6,69 · 7,70 |

Je Merge:
- **pruefbuehne:** an der Bühne nicht messbar (ohne sie keine Bühne). Ihr Diff in `anazhRealm.js` trägt keine Zeile an Stoff,
  TSL, Uniform oder Wurf (1110-4). Keine Kosten ohne Bild.
- **ego-schatten (S1 → S2):** +0,03 / +0,06 ms an ost, **im Rauschen ≤ 0,1 ms**. Der Leib in k0 kostet hier nichts Messbares.
- **studio-s3-haus (S2 → S3):** −0,03 / −0,02 ms, **im Rauschen**. Die Bühne trägt kein Fachwerk-Haus.
  - Toggle `bauWurf` in EINER Sitzung auf S6 mit einem gesetzten Haus (`haus_griechisch`) im Blick von ost
    (`staende/haus-*`): mit 6,35 · 6,35 · 6,37, ohne Wurf 6,56 · 6,39 · 6,38, mit 6,60 · 6,42 · 6,44.
  - Die Sitzung driftet um 0,07 ms; der Wurf hat keine eigene Zeit über 0,05 ms.
- **schau2-koerper-bild (S3 → S4):** **der Täter.**
  - S4 trägt in einer von zwei Sitzungen +0,26 ms an ost (6,51 gegen 6,25), in der anderen +0,10.
  - Der Aufschlag liegt gleichmäßig auf ALLEN Posen (S4 rück gegen S3 rück: +0,26 · +0,26 · +0,19 · +0,23 ms), also Kosten je
    Frame, kein Inhalt an einer Stelle.
- **schau2-wasser-wahrheit (S4 → S5):** dasselbe Zwei-Moden-Bild wie S4 (6,315 / 6,505), kein eigener Schritt.
- **werkstatt-rahmen (S5 → S6):** S6 trägt den hohen Modus in 9 von 10 Sitzungen. Gezählt: vor/rück je 1, Diagnose 3, und die
  vier Wiederholungs-Boots auf 27e369d8 (= S6 + Versions-Zeile, Licht des Auges an, 6,49–6,57). Der niedrige war die
  Haus-Sitzung mit dem längsten Ticken vor der Bank (6,35 mit Haus).

**Was der hohe Modus NICHT ist** (`diagnose/schalter.log`, drei S6-Sitzungen, alle hoch 6,50–6,57):
- Kein Licht: Ambient 0, die Sonne mit Wurf, Hemisphere 0, das Licht des Auges nicht im Graphen.
- Keine Chunk-Zahl: 81 / 81 / 89 / 93 in jeder Sitzung.
- Kein Inhalt: dieselben Klassen.
- Er kommt mit koerper-bild (aHimmel, die Höhle zeigt Fels, das Licht des Auges, das Bild des Körpers) und hängt an einem
  Zustand der Sitzung.
- Kandidat: der Boden-Stoff mit aHimmel und dem Fels-Zweig unter dem Himmel. Ihn trennt ein Toggle des Stoff-Zweigs in EINER
  Sitzung, den dieser Auftrag nicht mehr trägt.

## Merge-Regel an der Bühne

- Das Rauschband des Orts ist 2σ ≤ 0,064 ms (Wiederholung) bzw. 0,07 ms (derselbe Zustand in der Eich-Probe).
- V18.540 (S6) gegen S3 trägt im Mittel beider Sitzungen +0,27 ms an ost und +0,26 ms an west: über dem Band, mit einem benannten Merge (koerper-bild) und ohne
  Bild an der Bühne.
- Nach der Regel des Koordinators ist das „langsamer“, bis der Zweig in koerper-bild benannt und geschnitten ist.

## Pflicht-OFFEN Rest

1. **Die Mechanik des Aufschlags von koerper-bild:** +0,19–0,27 ms je Frame, gleichmäßig, sitzungs-abhängig. Ein Toggle des
   Boden-Stoffs (aHimmel / Fels-Zweig) in EINER Sitzung an der Bühne trennt ihn.
2. **Der Zwei-Moden-Schalter:** wann eine Sitzung den niedrigen Modus trägt, ist nicht benannt. Die Haus-Sitzung mit dem
   längsten Ticken lag niedrig.
3. **Die Wiederholbarkeit nach dem längeren Aufwärmen** (120 × 2 statt 60 × 1) ist mit 4 Boots noch nicht neu gemessen. Die
   Stände (vor/rück) zeigen für S1–S3 je Stand ≤ 0,03 ms Abstand.
4. A · B · C · E stehen (`docs/PFLICHT-OFFEN.md`). E (das Profi-Band) richten weiter Wiese, Genesis und Dorf.

## Status: ZWISCHENSTAND · Übergabe

- Zweig welle-m-messort-buehne af5ed685 (WIP edd47e66 → 9d3ad9b9 → af5ed685), ab integ-probe 27e369d8. Der letzte Push dieses
  Berichts-Stands trägt die Doku-Zeile der Werkbank ohne `[skip ci]`.
- Werkzeuge: `1110-6/wiederholbarkeit/wiederholbarkeit.sh`, `staende/staende.sh`, `eich/eich2.sh`, `diagnose/*.sh`;
  `takt-bisekt` steht wieder auf 66005ca6 ohne Patch.
- Als Nächstes laut Warteschlange: 0910-8 (welle-m-weisse-masse 524c0b3a), dann 1110-2, dann 1110-5. Die Mechanik von
  koerper-bild (Offen 1) wäre an der Bühne ein Auftrag von einer Stunde.
