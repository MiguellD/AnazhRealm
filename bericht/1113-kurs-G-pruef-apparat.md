# G — Der Prüf-Apparat: was er prüft, was schützt, was fallen kann (nur gelesen, 13.11. ~17:40)

Quellen: Z = `/tmp/claude/w4/zug-nie-leer.log` (Zeile), F = `/tmp/claude/fahre-z<N>.log`, CY = `.github/workflows/check.yml` @1e00bfdb,
CZ = `spec/ci/ci-zeiten.json` (p90 je Schritt, 7 Läufe, erzeugt 13.11.), FR = koordination `FUND-REGISTER.md` (Zeile), CP = koordination `cloud-post/<zweig>.md`.

## 1 Die Kette, z413–z424 (Minuten; Abgabe = Commit-Zeit des Zweig-Kopfs, git log)
| Zug | Zweig@Kopf | Abgabe→Abfahrt | Vorlauf (fährt→bau) | bau (Merge + lokale Prüfung) | CI+echt bis Urteil | landen | Fahrt Σ | Urteil | Abgabe→main |
|---|---|---|---|---|---|---|---|---|---|
| z413 | strauch-gestalt@bdd8411b | 53 | 9,0 | 4,3 | 19,0 | 1,2 | 33,6 | GELANDET | 87 |
| z414 | halm-trieb + krone-vor-kachel | 41 / 54 | 8,0 | 3,1 | 18,9 | 2,2 | 32,1 | GELANDET | 73 / 86 |
| z415 | strauch-schub@45ad33c1 (Werkzeug) | 40 | 9,5 | 4,9 | 18,9 | 0,6 | 34,1 | GELANDET | 74 |
| z416 | stamm-krone@31f4607c | 146 | 8,0 | 5,0 | 29,8 | – | 42,9 | ROT echt radeon Kamera-Leib K4 (Z:231) | nicht gelandet (> 20 h) |
| z417 | faden-quelle@def0b704 | 26 | 9,5 | 5,0 | 19,0 | 1,4 | 34,9 | GELANDET | 61 |
| z418 | tiere-nach-bild@6d5449a3 | 24 | 7,8 | 6,9 | 30,1 | 3,0 | 47,9 | GELANDET | 72 |
| z419 | mess-server-kopf@3d9efa3b | 27 | 7,0 | 7,4 | 42,9 | – | 57,6 | ROT echt radeon Portal-Konformanz ABSTURZ (Z:244) | 273 (erst z421) |
| z420 | leib-kanon@e80d8529 | 31 | 7,0 | 4,0 | 27,7 | – | 38,8 | ROT echt gtx1050 Tier-Gang (Z:248) | ≈ 12 h ab erster Probe 01:33 (erst z423) |
| z421 | mess-server-kopf@41ec3942 | 43 | 7,0 | 3,9 | 16,9 | 1,7 | 29,7 | GELANDET | 72 |
| z422 | seiten-tod@c8dad5db (Werkzeug) | 26 | 6,5 | 5,9 | 25,6 | 1,2 | 39,4 | GELANDET | 65 |
| z423 | guss-bruch + leib-kanon | 57 | 11,5 | 8,8 | 17,6 | 3,3 | 41,4 | GELANDET | 98 |
| z424 | wesen-offen@fd14dbea | 36 | 12,0 | 12,9 | 25,6 | 1,0 | 51,8 | GELANDET | 88 |
| **Median / schlechtester** | | **38 / 146** | **8,0 / 12,0** | **5,0 / 12,9** | **19,0 grün / 42,9** | 1,4 / 3,3 | **39,1 / 57,6** | 9 von 12 | **73 / 98** (gelandete) |

- Im Warten steckt der EIGENE Check des Zweigs: GPU-Probe (65 Proben 12./13.11.: Median 455 s, max 2 526 s, 14 ROT, 8 NACHGEGEBEN; CP) und die volle
  Batterie `[ci voll]` am Zweig (Z:209 „der Puls ist grün, die volle Batterie fehlt → angestoßen"). Probe grün → Abfahrt: z421 34, z423 41, z424 25 min.
- bau = Merge + lokal `diag-atlas --check`, `stamm:lint`, `betriebsgesetz`, `welt-boot --selbsttest` (`zug/dienst/werkzeug/zug.cjs:911-918`) — alle vier stehen auch in puls 1 Statik / voll.
- Nach der Landung: Buchung (buche.sh) 3–11 min später (Meisterkarte-Commits 350e6b11 18:21, dc9eacb0 06:09, fd5df4bf 10:28, 1e00bfdb 13:46), Zahl blieb 219.
  Die „Nachwache ABAB" steht in JEDEM F-Log, aber `zug/abab.txt` trägt seit 11.11. 19:01 keine Zeile, `warteschlange.txt` (origin) seit 03.11. keine —
  `FAHRT_ABAB` ist aus (fahre.sh:162). Die Nachwache ist Text, kein Lauf.
- Weiter: Z seit z360 (10.11.): 61 Abfahrten, 32 GELANDET. Jede rote Fahrt fuhr den roten Job zweimal („Versuch 2", Z:232/245/249); Actions-API 7 Tage:
  129 Läufe mit Versuch ≥ 2, 38 davon am Ende grün (HEBEL-KARTE-2026-11-11.md:8).

## 2 Die Gruppen (p90 aus CZ, je Schritt in CY nach `matrix.gruppe`/Bein; Klasse = meine Lesart nach dem Schritt-Namen)
| Job | Dauer (Schritte p90 Σ) | was (die größten) | Klasse |
|---|---|---|---|
| puls 1/2 | 4,2 min + 17 s Vorb. | Statik (253 s: Atlas, Verfassung, Studio-Vertrag, koerper-kern, ~40 Selbsttests, Betriebsgesetz, CI-Deckung) | BRUCH |
| puls 2/2 | 1,4 min | Prettier 15 s, ESLint 8, Syntax 3, Klingen-/Daten-Vertrag, playtest:fast 13, Streu-Wahrheit 38 | BRUCH (Streu: AUSSEHEN) |
| voll 1 | 11,7 | Asset-Vertrag v1 225 · V1-Pfad 157 · Playtest 119 · Kamera-Laub 107 · Slot 41 · Erstarren 28 · Takt-Wand 15 · Fahrzeug-Vertrag+Plattform 10 | gemischt (B 369 s / A+Z 333 s) |
| voll 2 / 3 | 16,6 / 14,4 | Persistenz-Härtung Teil 1 (999) / Teil 2 (867) | BRUCH |
| voll 4 / 7 | 14,2 / 12,6 | Haus der Welt Teil 2 (850) / Haus begehbar (758) | AUSSEHEN/Band |
| voll 5 | 13,7 | Fahr-Linse des Lebens (823; darin `Sim-Takt ≤ 1 ms` an der Wanduhr, FR:168) | ZEIT + Band |
| voll 6 / 8 / 10 | 13,6 / 11,7 / 11,7 | Kreatur-Linse Teil 2 / 1 / 3 (817 / 578 / 543 = 32,3 min) · Kampf 84 · Fernwald 69 | Band (Verhalten), Absturz-Fang |
| voll 9 | 11,7 | Körper steht (555) · Haus-Vertrag v6 82 · Stoff-Linse 32 | Band / BRUCH |
| voll 11 | 11,7 | Wasser-Wand 536 · Boot-Rettung 92 · Stall-Akte 33 (darin welt-boot) · Blocker-Netz 21 | AUSSEHEN / BRUCH |
| voll 12 | 11,7 | Ofen-Vertrag 349 · Fluss-Wand 153 · Tier-Anatomie 97 · Gelände 55 | BRUCH / ZEIT / Band |
| voll 13 | 11,7 | Fall-Wächter 339 · Regler Teil 2 163 (Budget) · Ankunft 91 · Sippen-Wirt 57 | BRUCH / ZEIT |
| voll 14 | 11,7 | Mehrspieler 306 · Prüfbühne 164 · Stand-Takt 129 · Tor-Wurf 49 | BRUCH / ZEIT |
| voll 15 | 11,7 | Mensch-Anatomie 287 · Haus-Fernkörper 177 · Weltgrenze 138 · Gelände-Studio 43 | Band / BRUCH |
| voll 16 | 11,7 | Dichte-Spiegel 255 · Werkstatt-Weg 222 · Kollision = Bild 115 · Höhlen 64 | BRUCH |
| voll 17 | 11,7 | Settlement 244 · Regler Teil 1 222 · Prägung 135 · Scatter-LOD 44 | BRUCH / ZEIT |
| voll 18 | 11,7 | Werk im Wasser 237 · Klang 222 · Regler Teil 3 151 · Dither 41 | AUSSEHEN / ZEIT |
| echt omen / radeon / gtx1050 | 12,8 / 8,8 / 7,9 + 75–97 s Vorb. | 18 / 8 / 7 Wände: Albedo, Lichtweg, Nässe, Tag-Achse, Schatten, Kamera-Leib, Studio-Dorf, Tier-Gang · Portal-Konformanz, WebGL2, GPU-Fehler, Frost, Erst-Zeichnung | 18 AUSSEHEN (19,5 min) · 8 ZEIT (5,0) · 7 BRUCH (5,0) |
| **Σ je Zug** | voll 226 CPU-min, puls 5,6, echt 29,4 (z296 gemessen: 262 min, CY:290) | Wanduhr: längste Gruppe 16,6 + Vorb. | voll nach Namen: 44 BRUCH (82,9 min) · 46 AUSSEHEN/ZEIT/Band (142,9 min) |
GPU-Probe (gpu-probe.yml:1-30): ≤ 3 Proben je Kopf, `gate:` (zählt/vergleicht), `zeit:` (nur Band-Gerät), `bild:<ort>` (Abnahme am Messort) — AUSSEHEN/ZEIT, je Probe ≤ 8 min.

## 3 Die letzten 30 ROTEN (13 Züge z388–z420 aus Z, 17 Zweig-Checks 11.–13.11. aus CP)
| Klasse | Zahl | Fälle |
|---|---|---|
| echter Täter im Zweig (Spiel) | 10 | z400 Rausch-Gesetz 2 Fn-Rümpfe · z403 Takt-Wand ABSTURZ · z405 Rig `sad=undefined` · leib-kanon cd256be6 (Masse 83,7→48,8 kg, menge.gleich; FR:199/205) · leib-kanon 49175b32 (Guss endlos, FR:211) · seiten-tod 30584671 · stadt-grammatik 8bd897de (VK, D9) · stadt-grammatik 22872718 (Mehrspieler, berichtigt: Zweig, FR:236) · stamm-krone ee3fa5f5 (2 von 3, CP) · putz-wand a576a954 (Statik) |
| echter Täter, nur Format (Prettier) | 5 | verkehr-bild 28fe4dcf · mensch-menge 680ef639 / 03809300 / d27d7c3c · halm-trieb ad773c23 |
| Täter im Zweig, aber Linsen-/Werkzeug-Code | 2 | z396 welt-boot-Selbsttest startet keinen Browser unter Linux (UEBERGABE-12.11.:33) · z419 Mess-Server-Zweig bricht Portal-Konformanz |
| Wackler ohne Täter | 3 | z388 Fahr-Linse (Wanduhr; je Versuch andere Probe, Z:107/110) · seiten-tod c55af244 Mehrspieler (FR:234) · pruefbuehne-last 6fdc610a Mehrspieler (Verdacht, landete z412) |
| Fehler des Werkzeugs/Läufers | 2 | z398 „kopf: (ohne Schritt)" · z409 Rot-Text „kein roter Job unter 0" (zug-rot-z409.txt) |
| ungeklärt (kein Beleg gefunden) | 8 | z397 · z399 · z407 · z416 · z420 · strauch-gestalt d11815b8 · krone-vor-kachel 8e11abe9 · wesen-offen 5826b6d5 |
Daneben, nicht in den 30: GPU-Probe-ROT als Werkzeug-Täter — `urteil-zeile.cjs` las Selbsttest-❌ von `diag-tier-gang` als Urteil (FR:218; a071dc5e, 5826b6d5);
radeon-dienst löschte laufenden CI-Jobs 40× das GPU-Schloss (UEBERGABE-12.11. §5); OMEN Exit 139 sieben Mal beim WEICHEN (FR:186-189/214/230); guss-bruch nie gesehen (Betreff mit Backtick, FR:222). Rote Zug-Fahrten z388–z420: Σ 623 min (30·37·47·20·54·45·62·43·67·78·43·58·39). Im Fenster z413–z424 fielen 3 von 3 roten Zügen an echt.

**Die fünf teuersten Fehlalarme:** (1) z388 Wackler: 30 min Fahrt + Wackler-Urteil 3 h 11 (HEBEL-KARTE:50) ≈ 221 · (2) Tier-Gang-Etikett als ROT: leib-kanon
wartete 10:23 → Schnitt 11:59 = 96 min (+ wesen-offen Probe ROT 10:54) · (3) z409: 78 min Fahrt, ROT ohne lesbaren Grund · (4) z396: 37 min Fahrt + Nacht-Lesung
(drei Leser „gingen fehl", UEBERGABE-12.11.:33) · (5) OMEN Exit 139: 7 × 2–5 min = 14–35 min + drei falsche Ursachen-Spuren (FR:185-189).

## 4 Die Größe (@1e00bfdb)
| Maß | Zahl |
|---|---|
| npm-Skripte / davon `gate:` / `gate:*:echt` | 163 / 137 / 5 (package.json) |
| scripts/diag-*.cjs | 130 Dateien, 103 629 Zeilen; scripts/lib 35 Dateien, 41 259 Zeilen |
| scripts/ gesamt (cjs/js/mjs) | 209 Dateien, **205 400 Zeilen** |
| Spiel: stamm/ · *-core.js (10) · übrige Wurzel-Laufzeit | 159 373 · 63 077 · 8 978 = **231 428 Zeilen** |
| Commits letzte 14 Tage: scripts/ gegen stamm/+Kerne | 1 417 gegen 1 627 |
CI-Schritte: puls 12 · voll 92 · echt 33 · kopf 1. Nie rot an einem echten Täter in 14 Tagen: **nicht belegbar** (Z beginnt 10.11. z359; cloud-post trägt nur die jüngsten Köpfe). Belegbar nur: in Z (z359–z424)
und CP (11.–13.11.) erscheinen ~25 verschiedene Schritte rot — rund 110 der 138 CI-Schritte waren in diesem Fenster nie rot.

## 5 Die „volle Tor-Liste" der Briefe gegen die CI (alle fahren schon — im Zweig-voll UND im Zug-voll; der Brief macht sie zum dritten Lauf)
| Tor im Brief | wo in der CI | p90 CI | lokal (Bericht) |
|---|---|---|---|
| ofen-contract | voll 12 Ofen-Vertrag | 349 s | 158 s (bericht/0710-1-p2/waende-rest.log:35, alt) |
| Plattform-Probe / asset-contract | voll 1 Fahrzeug-Vertrag v3 / Asset-Vertrag v1 | 10 / 225 s | weiß ich nicht |
| koerper-kern · kollision-bild-Selbsttest | puls 1 Statik (check:statik) · dazu voll 16 Kollision = Bild | 253 · 115 s | weiß ich nicht |
| welt-boot | voll 11 Stall-Akte (CY:1094) UND zug.cjs bau (:917) | 33 s | ~25 s (zug.cjs:916) |
| settlement · mensch-anatomie | voll 17 · voll 15 | 244 · 287 s | settlement 15–39 s (waende-rest.log, alt) |
| kreatur-takt 1–3 | voll 8 / 6 / 10 | 578 + 817 + 543 s | weiß ich nicht |
| check · format:check · playtest:fast | puls 1 + voll 15 Haus-Fern · puls 2 · puls 2 | 253+177 · 15 · 13 s | check 28 s (alt) |
| 33 echt-GPU-Wände | echt, drei Beine | 29,4 min Σ (Bein ≤ 12,8) | weiß ich nicht |
Σ der Liste ohne echt: 3 659 s ≈ 61 min CPU (p90), dazu echt 29,4 min — doppelt zur CI, mit dem Zug dreifach.

## 6 Die Liste: fallen · zusammenlegen · ans Ende der Klasse
| # | Eingriff | Ersparnis je Landung | Risiko (ein Satz) |
|---|---|---|---|
| 1 | FALLEN: die lokale Tor-Liste in Arbeiter-Briefen (nur puls lokal) | Arbeiter ~61 CPU-min + 29 echt-min je Kern-Schnitt | Keins für Bruch — dieselben Schritte fahren in der CI; der Arbeiter sieht ROT ~17 min später. |
| 2 | ZUSAMMENLEGEN: volle Batterie am Zweig ODER im Zug — der Zug übernimmt das Zweig-voll, wenn der Kandidat bis auf die Versions-Stufe baum-gleich ist (10 von 12 Zügen fuhren EINEN Zweig) | ~17–19 min Wanduhr (Probe grün → Abfahrt 25–41 min) + 226 CPU-min | Bei veraltetem Basis-Kopf gilt die Gleichheit nicht und voll muss fahren — die Regel darf nur bei Baum-Gleichheit greifen. |
| 3 | FALLEN: die vier lokalen Prüfungen im bau (zug.cjs:911-918) + der zweite Einlass-Blick | bau Median 5,0 (bis 12,9) + Vorlauf Median 8,0 → ~5–10 min | puls 1 Statik fährt dieselben Prüfungen; ROT kommt 2–4 min später statt im bau. |
| 4 | FALLEN als Urteil: Prettier — formatieren statt rot werden (Format am Abgabe-Commit erzwingen) | 5 von 30 ROT; ein Zyklus ≈ 27 min (halm-trieb ROT 19:37 → Abgabe 20:04) | Keins: Format trägt keine Semantik. |
| 5 | ANS ENDE: ZEIT-Schwellen (Wanduhr/ms auf geteilten CI-Rechnern: Fahr-Linse Sim-Takt, Stand-Takt, Fluss-Wand, Regler-Budgets, 8 echt-ZEIT) aus dem Lande-Tor in die Profi-Band-Messung am Mess-Kopf | 34 voll-CPU-min + 5 echt-min; Fehlalarm-Typ z388 ≈ 221 min | Eine echte Zeit-Regression landet und fällt erst bei der Buchung (3–11 min nach der Landung) — dann Revert statt Sperre. |
| 6 | ANS ENDE: die 18 AUSSEHEN-Wände von echt (Albedo, Lichtweg, Nässe, Schatten, Kamera-Leib, Tier-Gang …) an die GPU-Probe der Klasse + Bild; echt behält die 7 BRUCH-Wände (Portal-Konformanz, WebGL2, GPU-Fehler, Frost, Erst-Zeichnung) | echt-Bein omen 12,8 → ~4 min; im Fenster 3 von 3 roten Zügen = 140 min Fahrt | Ein Bild-Rückschritt landet und wird vorwärts geheilt — genau das, was der TÜV-Vergleich verlangt; Bruch bleibt gesperrt. |
| 7 | FALLEN: der Text „Nachwache ABAB" im Lande-Log (seit 11.11. kein Lauf) | 0 min, Wahrheit im Log | Keins: es läuft schon nichts. |
| — | NICHT fallen: Neulauf „Versuch 2" | — | Er rettet 38 von 129 Läufen (29 %); ohne ihn fallen diese Landungen. |

**Der kürzeste Weg (meine Lesart, nicht belegt):**
Am Zwischenschritt sperrt nur BRUCH: puls + die BRUCH-Schritte von voll + 7 echt-BRUCH-Wände, einmal je Abgabe, nicht dreimal (Brief · Zweig · Zug).
AUSSEHEN- und ZEIT-Schwellen urteilen am ENDE einer Klasse (GPU-Probe mit Bild, Profi-Band-Buchung) und lösen Revert/Heilung aus, keine Sperre.
Damit fiele die Kette Abgabe→main von Median 73 auf geschätzt ~35–45 min, und 13 von 30 ROTs (Format, Wackler, Werkzeug) entstünden nicht als Sperre.
