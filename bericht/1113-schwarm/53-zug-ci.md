# 53 Zug und CI: was ein Lauf wirklich prüft und wo die Minuten liegen

## Was es den Spieler kostet
- Kein Bild gesehen (Prozess-Bereich). Was der Spieler spürt: jeder Schnitt am Dorf der Ankunft braucht von der Abgabe bis main im Median **73 min**,
  im schlechtesten Fall 98, gemessen z413–z424 (`bericht/1113-kurs-G-pruef-apparat.md:21`); eine rote Fahrt kostet im Mittel ~48 min
  (Σ 623 min über 13 rote Züge z388–z420, Kurs-G:65).
- Heute, nach dem Dienst b0217003c (Erbe, Format-Stufe, Nachweis): drei grüne Züge, je EIN Zweig, Fahrt 44 · 55 · 39 min
  (`/tmp/claude/w4/zug-nie-leer.log`: z425 18:03→18:47, z426 19:07→20:02, z427 20:39→21:17).

## Was die Quelle sagt
**Die Fahrt eines Ein-Zweig-Zugs heute (Minuten, aus `fahre-z42N.log` und `w3/kette-z42N.out`):**
| Zug | fährt → Proben-Ende (Statik+Vorzug lokal) | bau (Merge, lint, welt-boot, Stufe) | Kandidat → Urteil (CI) | landen |
|---|---|---|---|---|
| z425 | 18:03 → 18:12 = **9** | 18:12 → 18:15:50 = 3,6 | 18:15:50 → 18:45:35 = **29,7** | 1,8 |
| z426 | 19:07 → 19:14 = **7** (Proben 19:08→19:14 = 6) | 19:14 → 19:16:34 = 2,4 | → 20:01:05 = **44,5** (Versuch 2: Wackler Frost-Wand echt omen + „Kampf und Maus“ voll 10) | 1,2 |
| z427 | 20:39 → 20:47 = **8** (Proben 20:40→20:47 = 7) | 20:47:31 → 20:52:21 = 4,8 (darin CI-Zeiten (T) ALT) | → 21:16:53 = **24,5** | 1,0 |

- **Das Erbe greift heute 0 von 3.** Keiner der drei Köpfe trug main bei der Abfahrt (git merge-base: 02c27132 ohne a41ce72d, 45805bda ohne
  36f9d45a, 9597ffb2 ohne ec281422); Urteil-Zeile z426/z427 „Baum vor der Stufe ≠ Zweig-Kopf (main zog weiter …)“. Trockenlauf des Erbes über
  z413–z424: 3 von 12 (Commit b0217003c). Im Ein-Zweig-Zug zieht main weiter, sobald zwischen Abgabe und Abfahrt ein anderer Zug landete —
  bei Abgabe→Abfahrt Median 38 min und Fahrt ~40 min ist das der Regelfall. Die volle Batterie fährt also fast immer zweimal (Zweig + Zug).
- **Die Vorprobe ist ein Zwilling des Pulses.** `zug-sammler7.sh:83-112` fährt `check:statik` und `playtest:fast` am Merge-Kandidaten lokal;
  dieselben Schritte fahren als puls 1/2 (Statik 253 s, playtest:fast 13 s; `spec/ci/ci-zeiten.json`) am Push des Kandidaten nach integ-probe.
  Sie entfällt nur bei Baum-Gleichheit (`zug-sammler7.sh:73-82`) — heute also nie. Kosten: 6–8 min je Zug, seriell vor dem Bau.
  Dazu urteilt die Wachstums-Wand dreifach: `wand-summe.sh` im Bündeln (`zug-dienst.sh:147`), die Vorprobe-Statik, puls 1 am Kandidaten.
- **Ein feststehendes ROT wartet auf den ganzen Lauf.** `zug.cjs:265-267`: ohne Erbe meldet das Urteil LAEUFT, solange `run.status !==
  "completed"` — ein roter Puls (4,2 min) wartet auf voll (längste Gruppe 16,6 min + Vorb.) und echt; dann folgt Versuch 2 für jeden Nicht-Wackler
  (`zug.cjs:298-301`), auch für deterministische Puls-Schritte (Statik, Prettier, Verträge). Erst danach ROT. fahre.sh fragt nur alle 120 s
  (`werkzeug/fahre.sh:118-124`).
- **Der Boden der CI** ist ein einzelner Schritt: Persistenz-Härtung Teil 1 = 999 s, Teil 2 = 867 s (`ci-zeiten.json`, Kurs-G:38); echt omen
  12,8 min + 75 s Vorb. (`check.yml:1247-1352`, 18 Wände). Grüne CI im Zug: Median 19,0 (Kurs-G:21), heute 24,5 und 29,7 — die Spanne über dem
  Boden ist ungemessen (siehe Ehrlich offen).
- **Läufer-Plätze:** voll 18 + puls 2 = genau die 20 Plätze des Kontos (`check.yml:275-276`); jede Abgabe mit `[ci voll]` und jeder vom Dienst
  angestoßene voll-Lauf (`zug-dienst.sh:90-100`) teilt sie mit dem Kandidaten.
- **Was die Kette KANN gegen was sie NUTZT:** sie kann am Kandidaten jede Wand einmal urteilen (puls + voll + echt am selben Push,
  `check.yml:35/267/1202`) — sie urteilt Statik und playtest:fast zweimal je Fahrt, voll zweimal je Abgabe (9 von 12), die Wachstums-Wand dreimal.

## Die EINE begrenzende Entscheidung
**Am Kandidaten urteilt jede Wand genau EINMAL — in der CI —, und ein feststehendes ROT beendet die Fahrt in dem Augenblick, in dem es steht.**
Kein Zwilling lokal davor, kein Warten auf voll nach einem roten Puls, kein Neulauf für deterministische Schritte. Kein Soll, keine Schwelle,
keine Wand fällt — jede fährt weiter, nur nicht doppelt.

## Der Schnitt
**Stufen (alle in einer Welle, Dienst-Code in `koordination` zug/dienst/, kein Spiel-Byte):**
1. `zug-sammler7.sh:70-112` — Statik- und Vorzug-Probe entfallen für JEDES Ein-Zweig-Bündel (heute 3 von 3, z413–z424 10 von 12), nicht nur bei
   Baum-Gleichheit; sie bleiben allein als Pack-Hilfe bei ≥ 2 Zweigen (dort trennen sie gierig, Zeilen 89-110). Die Log-Zeile nennt „Proben
   entfallen: ein Zweig, puls urteilt am Kandidaten“.
2. `zug.cjs urteilVon` (:264-271, :298) — ROT in einem `puls`-Job ist sofort ROT: kein LAEUFT bis zum Ende, kein Versuch 2, der Lauf wird
   abgebrochen (`POST /actions/runs/<id>/cancel`, gibt 20 Läufer frei). Für voll und echt bleibt der Neulauf (rettet 38 von 129, Kurs-G:105).
3. `zug-dienst.sh:147` — `wand-summe.sh` bleibt die EINE Vorprüfung der Wand (sie hält Bündel draußen, bevor gebaut wird); die Vorprobe-Statik
   fällt mit Stufe 1, puls 1 am Kandidaten bleibt der Richter (wie seit 13.11., `zug.cjs:1004-1008`).

**Leser-Liste (wer liest, was sich ändert):**
- `zug-dienst.sh:292` ruft den Sammler; `kette-<id>.out` liest `urteilen` (`zug-dienst.sh:165`, Text „FAHRT ROT ohne Fahrt“).
- `zug.cjs:1359-1364` `nachweis` liest „STATIK/VORZUG FÄLLT“ und „gefallen“ — bei einem Zweig entfällt die FÄLLT-Zeile, das Urteil kommt dann als
  „FAHRT ROT urteil“ aus fahre.sh (der Zweig steht im Kandidaten → GEURTEILT, `zug.cjs:1342`); Selbsttest-Fall dafür fehlt noch.
- `urteilVon` lesen: `fahre.sh:119` (über zug.sh urteil, Exit 1 = rot → `rot urteil`), `landen` (`zug.cjs:1150`), `teile` (`zug.cjs:1119/1127`,
  erwartet ROT nach Neulauf — bei Puls-ROT halbiert `teile` mit ≥ 2 Zweigen weiter, bei einem Zweig sagt es schon heute „der Zweig selbst ist
  der Täter“, `zug.cjs:1113-1116`), das Verb `urteil` (`zug.cjs:1517`).
- `zug-dienst.sh:183-189` liest WACHSTUMS-WAND aus `zug-rot-<id>.txt` (rot-text.cjs am Lauf) — bleibt gültig, der rote Puls-Job trägt den Text.
- `werkzeug-w3/sweep-radeon3.sh:10` greift „VORZUG“ in `kette-z324.out` (alt, nur z324) — kein lebender Leser.

**Kosten-Zeile:** Spiel +0 Byte, Ankunft/Frame unberührt; Dienst-Code netto weniger Zeilen. Gewinn: −6 bis −8 min je grünem Ein-Zweig-Zug
(z425 9, z426 6, z427 7 — gemessen); ein roter Puls endet ~5 min nach dem Push statt nach Lauf + Versuch 2 (~20–25 min, geschätzt aus 16,6 + 4,2).
Prognose Fahrt grün 39–55 → 32–48 min, nicht gemessen; der nächste Zug ist der Richter (zug-nie-leer.log „fährt“ → „ende“).

**Kriterien der Meisterkarte:** keines misst den Takt (die Domäne profiband steht auf 0, UEBERGABE-2026-11-13.md:54). Maß dieses Schnitts ist
die Fahrt-Dauer je Zug in `/tmp/claude/w4/zug-nie-leer.log` und Abgabe→main (Kurs-G-Tafel), vorher 73 min Median.

## Was schon liegt
- Dienst eaa749bd / Commit b0217003c (13.11. 18:29): Erbe der vollen Batterie bei Baum-Gleichheit, Format-Stufe, Lande-Nachweis, „ohne ABAB“
  im Log, zweiter Einlass-Blick gefallen, Vorprobe nur bei Baum-Gleichheit gefallen. Kurs-G-Eingriffe 2, 3 (teilweise), 4, 7 stehen damit.
- `w28-tor-bruch` c7d0aad4 (abgegeben, wartet auf Code-Check; der alte Kopf fiel im Bündeln an der Wachstums-Wand +28 645 Atome, z427-Zeile):
  TOR_KLASSE bruch in voll und echt, vier reine Bild-Wände aus echt heraus (Kamera-Leib K6, Lichtweg, Nässe, nah-fern), elf Maß-Stellen in acht
  Linsen melden statt sperren. Fehlt bis zur Klasse ganz: die Bild-Schwellen der neun gemischten Linsen (Tag-Achse, K4, Kamera-Laub,
  Wasser-Bild, Prüfbühne S0, Terminator, Albedo-Tafel, Ego-Schatten, Garage G8 — eigener Commit-Rumpf).
- Für die drei Stufen oben liegt nichts; Arbeit S, nur `koordination` zug/dienst/, mit Selbsttest-Fall (Ein-Zweig ohne Probe, roter Puls).

## Ehrlich offen
- **Ungemessen:** die CI-Spanne über dem Boden (z427 24,5 / z425 29,7 gegen ~17–19). Verdacht Läufer-Schlange (18 voll-Jobs des Kandidaten
  neben `[ci voll]`-Abgaben anderer Zweige, z. B. tor-bruch 20:38 während z427) — Beweis wäre `started_at − created_at` je Job des Kandidaten-
  Laufs; ich habe die API nicht gefragt (Lese-Auftrag).
- Wie oft ein Puls-Schritt ohne Täter wackelt (dann kostet Stufe 2 einen Zug): nicht gezählt; Kurs-G zählt Neuläufe über alle Jobs.
- Der Boden selbst: Persistenz-Härtung 999 + 867 s in zwei Schritten; ein Teilen in vier senkt voll nur auf ~14,2 min (nächster Schritt
  Haus der Welt Teil 2 850 s), echt omen hält ~14,1 — darum hier nicht als Schnitt.
- Die doppelte volle Batterie (Zweig + Zug, 226 CPU-min, 9 von 12) bleibt: der Zweig-Lauf ist das Vorfilter gegen rote Züge (z407, 67 min); sie
  sauber zu einen braucht entweder Köpfe, die main tragen, oder den Verzicht auf das Vorfilter — beides hier nicht gemessen.
- Nicht gelesen: `ci.sh`, `zug-weiter3.sh`, `gemein.sh`, `wand-summe.sh`, `scripts/ci-kopf.cjs`, `scripts/ci-zeiten.cjs`, `scripts/lib/ci-klasse.cjs`,
  die Mitte von check.yml (voll-Schritte 360–1200) Schritt für Schritt.
- Die Nachwache ABAB läuft nicht (FAHRT_ABAB aus, `fahre.sh:144`); z425 schrieb noch „Nachwache“, z426/z427 „ohne ABAB“ — Text stimmt jetzt.

## Rang
- Wirkung im Takt **3** (−6 bis −8 min an jedem grünen Zug heute, ~−15 min an jedem roten Puls-Zug; kein Bild ändert sich) · Aufwand **S** ·
  Risiko: ein Puls-Schritt, der doch wackelt, fällt ohne Neulauf — dann fährt der Zweig im nächsten Zug mit neuem Kopf statt im Versuch 2.
