# sonnenbahn 3 — die Wurzel der Nacht: der Fuß der Kurve am Schlüssel (GTX 1050, 25.11.)

Der Schnitt (WIP 2b46b5452d, da70d7f5c4 auf main 486a6685): belichte auf den Schlüssel → FUSS (Khronos Neutral 6,25·x² unter 0,08 am
Schlüssel) → × 2^n (die Stufen der Tag-Achse, `belichtungNachFuss`) → SCHULTER. EIN Schreiber je Seite: die Welt
(`_dayNightApplyBelichtung` → `tonStufenSetzen`), die Bühne (`buehne`); die Treue der Bühne nennt die Stufen. Die REF bleibt:
n = −2,17 bei −20°, −1,656 bei −8,14° (Abend-Stadt), 0 über 12°.

„ohne Schnitt“ = derselbe Kopf mit n = 0 an den Uniforms der Kurve (dieselbe Welt, dieselbe Kamera, dasselbe k) — die Kurve vor dem
Schnitt Zahl für Zahl (Abend-Stadt B ohne Schnitt 68,2 = Kopf 2 68,4). „main“ = main 486a6685 (enthält Kopf 1/2 nicht: Mond, Messer).

## (1) Tag byte-gleich
Zwei Mittags-Blicke an der Wiese 640×360 im Ausgabe-Pfad: 0 von 230 400 Pixeln verschieden (je Blick), k 0,50740518836 gleich, n = 0.
gate:tag-achse:echt GRÜN (REF genesis 1,64 · wiese 0,41).

## (2) Der Nacht-Boden (S0, ohne Feuer, Mitternacht, Mond 22,08°)
| | ohne Schnitt | Kopf 3 |
|---|---|---|
| Boden 1–3 m Luma | 23,3 | 44,3 |
| am Gesetz Luma (Soll ≥ 22,4) | 23,67 | 48,56 |
| abgesoffen im Licht der Nacht (Soll ≤ 5,0 %) | 5,6 % | 0,0 % |
| q02 · q05 · q10 | 2,67 · 4,06 · 6,44 | 12,21 · 17,2 · 23,59 |

## (3) Die Lichter der Nacht
S0 mit Feuer (k 26 069 beide; Messer 2,53 Stufen beide):
| | ohne Schnitt | Kopf 3 | main |
|---|---|---|---|
| Feuerkreis aus 2 m (Soll ≥ 0,15) | 0,293 | 0,333 | 0,424 |
| Feuer-Boden 1–3 m Luma | 46,9 | 57,6 | 79,5 |
| Feuer-Boden abgesoffen | 0,093 | 0,009 | 0 |
| Farbton netto (Soll 28–45°) | 33,3° | **28,1°** | 31,7° |
| Sättigung brutto (Soll ≤ 0,75) | 0,727 | 0,509 | 0,566 |

Start-Dorf nachts (Genesis, Kamera 14 m vor dem ersten Haus, Uhr 0, Sommer), dieselbe Welt:
| | main | ohne Schnitt | Kopf 3 |
|---|---|---|---|
| Luma · σ | 25,2 · 22,0 | 91,7 · 52,7 | 102,7 · 47,2 |
| schwarz | 7,13 % | 0,83 % | 0,30 % |
| hellster Kanal · Rang 99,9 % | 255 · 255 | 255 · 255 | 255 · 255 |
| Kanal ≥ 250 (Fenster, Laternen) | 0,70 % | 5,72 % | 5,25 % (Kopf Lauf zu Lauf 5,13–5,87) |

## (4) Dämmerung
Abend-Stadt Auge B, Uhr 0,85 (Sonne −8,14°, n −1,656), dieselbe Welt: k 24 310 beide · Luma 68,2 → 80,6 · σ 32,1 → 29,4 ·
Kanal ≥ 250 1,144 → 1,142 %. Start-Dorf Uhr 0,85: Luma 103,5 → 113,6 (main 54,0).

## (5) Die Tore am Kopf (GTX 1050) — BLOCK
GRÜN: tag-achse:echt · studio-huelle · studio-begehen · weltbild-frost:echt · check:statik (H9 der Hülle: die neue Treue-Zeile
„Stufen hinter dem Fuß“ steht als letzte, der Selbsttest unverändert).

ROT durch den Schnitt (auf dem alten Fuß geeicht — kein Soll-Tausch durch mich):
1. pruefbuehne-licht: SELBSTTEST S0 BILD „der Pool leer“ BLIND — der Feuerkreis aus 2 m ohne das Feuer (die Nacht allein, k 150 415)
   0,076 → **0,1508** (die Mutante muss unter 0,15). S0 BILD selbst GRÜN; 17 von 18 Selbsttests treffen.
2. post-kette RAUCH (k0) WAND: die helle Wand (Uhr 0 Winter, n −2,17) 143,4 → **150,77** (Soll 134–144), alle vier Ecken — der Fuß
   zieht über ihm 0,04 · 2^n = 0,009 statt 0,04 ab.
3. post-kette GODRAY-LAGE: die gefundene Scheibe 0,501/0,419 → **0,464/0,546** (screenUV) — „zu nah an der Bildmitte (blind)“; die
   Probe steht unter tiefer Sonne (n ≠ 0), ihr Finder der Scheibe liest den alten Fuß.

ROT schon an main (nicht der Schnitt): post-kette RAUCH UNTERSEITE main 2,84 · vor dem Schnitt 4,07 · Kopf 3 3,09 (Soll 4,8–7,2) und
RAUCH ZUG main 1,604 · vor dem Schnitt 1,553 · Kopf 3 1,553 (Soll 1,7–2,3) — gate:post-kette am GTX ist an main 486a6685 rot.

Knapp: der Farbton netto des Feuers 28,1° (Soll ≥ 28°) — netto = Ring mit Feuer minus Ring der Nacht, die 2,53 Stufen heller belichtet
ist; die hellere Nacht klemmt Blau auf 0 und zieht Grün (60/28/0 statt 63/35/0).

## Die Bilder (links ↔ rechts)
- `feuer-main-kopf.png` — Feuerplatz (Genesis) mit Feuer (oben) und ohne (unten): main ↔ Kopf 3
- `feuer-ohne-schnitt-kopf.png` — dasselbe: ohne Schnitt ↔ Kopf 3
- `dorf-main-kopf.png` — Start-Dorf Uhr 0 (oben) und 0,85 (unten): main ↔ Kopf 3
- `dorf-ohne-schnitt-kopf.png` — dasselbe: ohne Schnitt ↔ Kopf 3
- `abend-B-ohne-schnitt-kopf.png` — Abend-Stadt Auge B Uhr 0,85: ohne Schnitt ↔ Kopf 3
