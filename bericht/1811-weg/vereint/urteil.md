# DER EINE BLICK am vereinten main ee5c80d4 (ZWISCHENSTAND, OMEN GTX 1060, 18.11. 15:40)

Welt der Werkbank `--ort genesis` (dunkle-halde), Mittag, Auge 1,7 m, 1920 × 1080. Gehege x 192,3…208,3 · z −168,5…−156,5,
Graben 3 m breit außen herum. Treiber `gehege.cjs` (hier), Rohes `gehege.json`.

## Urteil in drei Sätzen

1. **Der Weg-Körper sitzt am Graben richtig und reißt nichts:** das Pflaster des Grabens endet innen wie außen in EINER hellen
   Reihe Randsteine (`graben-kante-nah`, `graben-entlang-sued`) statt in Erde oder Rasen auszulaufen; ein Bord, eine Flanke oder
   ein Schattenband steht dort NICHT — richtig, die Zone trägt keine Fahrbahn. `kante` Mittag am selben Kopf ist bildgleich zum
   Nachher-Bild des Zweigs (`kante-mittag-ee5c80d4` ↔ `../kante-mittag-nach`).
2. **Hart: die Randreihe ist ein glatter grauer Streifen ohne Stoßfuge**, innen liegt sie auf der Böschung der Insel und liest
   dort als aufgemalter Strich; das Bogenpflaster zieht sich auf den geneigten Flächen in die Länge und flimmert aus 12 m als
   Moiré (`graben-frontal-sued-weit`).
3. **Was als Fehler liest, gehört dem Gehege, nicht dem Weg: es steht kein Graben im Bild.** `_voxelSurfaceY` trägt die Sohle
   2,00 m unter der Platte mit senkrechter Wand (Profil in `gehege.json`: 51,55 → 49,55 auf 0,25 m), gezeichnet steht eine flache
   gepflasterte Mulde um einen Erd-Hügel — die Wölfe stehen einen Schritt vom Besucher, nichts trennt sie.

## Gras auf dem Belag (Zusatz des Koordinators 13:36)

| Ort am ee5c80d4 | Pflaster ≥ 0,5 | Büschel darauf | je m² | auf voller Deckung (≥ 0,98) | Erde der Insel |
|---|---|---|---|---|---|
| Graben des Geheges (±14 m) | 202,1 m² | 3 | 0,015 | 0 auf 118,9 m² | 0 auf 192,8 m² |
| Gasse der Stadt, `kante` (±18 m) | 624,4 m² | 1 | 0,002 | 0 auf 528,7 m² | — |

Gezählt mit `gras-sonde.js`: derselbe Wurf wie das Spiel (`_nahWieseKachelBueschel`), je Büschel die Deckung der Wege-Karte
(`_wegeBelagAt`). Die drei Büschel am Graben stehen im weichen Rand (Deckung 0,59 · 0,66 · 0,75, Rasen 1). **Kein Bruch:** die
Zonen-Beläge des Ort-Plans gehen in dieselbe Karte (`_genesisOrt` → `_stlWegeBuild({ zonen })`, stamm/siedlung-ort.js:2456), und
der Leser sperrt sie: `_bodenSichtAt` gruen × (1 − pflaster) (stamm/gelaende-boden.js:112–114), danach `_wieseGrund`
(stamm/vegetation-wiese.js:778–784) × (1 − Pfad × `pfadDuennt` 0,92, stamm/daten.js:510). Der Rest am Rand ist dort größer als
in der Stadt, weil unter dem Graben der Rasen des Zoos liegt (gruen 1) — Hinweis, kein Fund.

## Funde (benannt, nichts geschnitten)

- **FUND Graben ohne Tiefe im Bild** (Gehege): Höhe der Funktion ↔ gezeichneter Grund, siehe Satz 3. Ursache NICHT gemessen;
  vermutet (Leser-Hinweis, nicht an der Quelle geprüft): das Boden-Netz trägt auf 3 m keine senkrechte 2-m-Wand.
- **FUND Werkzeug**: auf der Bühne `--ort genesis` lebt der Ort-Takt nicht von selbst — nach 180 s und nach 55 s `/lauf` kein
  Ruf von `_genesisOrt` (`_genesisWerkeFertig` leer, Wege-Karte am Gehege 0 m² Pflaster, die Kacheln der Nah-Wiese offen). Das
  Bild `graben-OHNE-ort-takt-entlang` zeigt diesen Zustand: Geröll am Hang und Büschel darin, KEIN Pflaster — meine erste Lesart
  „Gras im Pflaster“ war falsch. Der Treiber ruft `_genesisOrt` 1×/s selbst; `genesisOrt.steht` blieb auch danach false
  (16 Werke gesetzt, keine Absage, 115 s Takt).
- Der Schau-Rasen um den Graben steht als hohe Wiese bis an die Randsteine.
