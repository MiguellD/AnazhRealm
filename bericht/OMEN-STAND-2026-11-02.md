# OMEN-Stand 02.11. — der GTX-Messplatz verdichtet (Berichte seit 20.10.)

Gerät: NVIDIA GeForce GTX 1060 (nvidia-smi), WebGPU nvidia/pascal, `--echt` 1920×1080, Regler voll. Gesetz: `zug/messplatz.md`.
Berichte (alle bleiben als Geschichte; diese Datei ersetzt sie als Einstieg):
- aktuell: [voll-5fba-gtx](voll-5fba-gtx/) (Referenz der vollen Sitzung) · [general-1e90-gtx](general-1e90-gtx/) (+ general-6d6a/-6a57/-1077) · [takt-z165a-gtx](takt-z165a-gtx/) (Reihe takt-z111a…z165a)
- aktuell: [z165-abab](z165-abab.md) (Reihe z106, z110…z165, z140-takt, stadt4-, wiese-takt-, knoten-wurzel-) · Täter beim Namen: [z7-abab](z7-abab.md) + [z7-abab-taeter](z7-abab-taeter/), [z13-abab](z13-abab.md) + [omen-z13-takt](omen-z13-takt/)
- aktuell: [eich16-gtx](eich16-gtx/) (Reihe eich1…eich16) · [3010-w4-sitzung-eichen](3010-w4-sitzung-eichen.md) (Wurzel der Eich-Fahrt) · [b-himmel-kalt](b-himmel-kalt/), [knoten-wurzel-kalt](knoten-wurzel-kalt/) (Reihe b-kalt-*) · [a-spawn-gtx4](a-spawn-gtx4/)
- aktuell als Falle: [2210-runner-hook](2210-runner-hook.md), [2310-omen-runner](2310-omen-runner/) (Hook-Härtung S1–S16) · [schloss-blick-1](schloss-blick-1/), [omen-gpu-lauf-1](omen-gpu-lauf-1/), [dienst-urteil-1](dienst-urteil-1/) · Spike [2110-zehe-spike](2110-zehe-spike.md)
- überholt durch den Dienst (ab z7): Hand-ABABs 2110-buendel3-abab, 2110-abab-*, 2210-abab-*, [2310-abab-zug2…zug6](2310-abab-zug6.md); 2210-abab-faden durch 2210-vorrat-pingpong
- überholt durch die Punkte-Maschine: Messschuld [2110-gtx-messschuld](2110-gtx-messschuld.md), -messschuld2, -gtx-messschuld-3, 2210-messschuld-gtx-6cfce, 2310-messschuld-gtx-452972; GTX-Hälften 2110-profiband-k3, -gtx-glaette, 2210-profiband-k1-gtx, -sturm-stammbuehne-gtx, -leib-k1-staffel2, -tier-gang-gtx
- überholt durch die Sitzung (ab 30.10.): Station-für-Station [z6-punkte](z6-punkte/), z10b-, z13-punkte, takt1b…takt23-gtx, [takt24…takt32b-gtx](takt24-gtx/), offen10-gtx
- überholt durch diese Datei + messplatz.md: [UEBERGABE-OMEN-2410](UEBERGABE-OMEN-2410.md) (Regeln gelten weiter, nur „Station für Station“ nicht) · 2010-b-blick, 2110-ring-kalt durch b-kalt-*
- Geschichte: z9/z9c/z10b-abab ([z9](z9-abab.md) berichtigt zu UNENTSCHIEDEN), z14c…z56, nw2628, nw3031 (3 Zellen), z67/z78-bisekt, z77…z103, z83-bisekt1…6 (2 Zellen); Schnitte 2110-e-bauart(-spitze), -bausatz-absage, 2210-naesse-kosten, -vorrat-pingpong, -latenz-verben
- gibt nichts her: spike-pixel-gtx (Exit 1, „QUOTIENT keine Zahl“)

## Was die GTX misst und wie
- Dienst `p3/messplatz.sh` (eine Instanz, geplante Aufgabe „OMEN messplatz“) → Schleife `p3/messplatz/messplatz.sh`, ohne LLM; liest `zug/warteschlange.txt` + `erledigt.txt` von origin/koordination, Bäume `p3/mp-baum/<sha8>`.
- **abab:** je Zelle 2+2, verlängert auf 4+4 nur zwischen 1σ und 2σ oder bei Kern-Anschlag; Urteil je Größe Δ ≤ max(2σ, Auflösung); Größen fps, Frame-p95, CPU-Takt-p95, gpu-bank (w-ego), Belegung-p95, steht+geht. Zellen heute stadt + w-ego. Seit 23.10. Nachwache über main: LANGSAMER = Revert durch den Koordinator. Instrument = Baum A (der Kopftext „Instrument aus B“ der Berichte ist veraltet).
- **punkte (seit 30.10. Sitzung):** EIN Welt-Boot (Welt steht nach Median 6,3 s), je Probe Grundstellung ohne Neuladen (Median 7,1 s) + Ort umstellen (Median 17 s); Deckel je Probe aus der Eich-Zahl (⌈1,1×s⌉+6 s, mindestens 10 s), Frist = Deckel − 6 s; Fahrt ≤ 1800 s. Ergebnis GRÜN/ROT/OFFEN → `messung/<sha8>-gtx.json` auf punkte-maschine.
- **station:** Skript aus `zug/` (ankunft-kalt, a-spawn, eich-gtx, schloss-blick …) am Baum.

## Zeiten (Median-Minuten aus fortschritt.txt 25.10.–02.11.)
| Was | Median | Notiz |
|---|---|---|
| Zelle w-ego 2+2 / 4+4 | 13,1 / 12,3 | 47 von 63 verlängert |
| Zelle stadt 2+2 / 4+4 | 16,2 / 16,4 | 36 von 60 verlängert |
| ABAB 2 Zellen ohne / 1× / 2× Verlängerung | 27 / 41 / 57 | seit 01.11. meist 57 |
| Sitzung 21–27 Stationen (takt-z*a) | 20,1 | Fahrt 887–999 s |
| Sitzung 101–107 Stationen (general/voll) | 35,1 | Fahrt 1808–1835 s, am Deckel |
| Ankunft kalt (3 Läufe) / Eich-Fahrt | 5,0 / 31,8 | |

## Warum voll-5fba-gtx nur 21 von 107 urteilte (11 GRÜN, 10 ROT, 86 OFFEN)
- **48 nie gefahren:** der Fahrt-Deckel 1800 s riss in tiere.K1#2 (Fahrt 1834,6 s, 45 von 71 Proben, 29× Grundstellung). Grundstellung + Ort fraßen 803 s; profiband.K5#1/#2 allein 13–15 min (Dauerlast über 5 Seiten). Danach offen: tiere.K1#2/K2#2/K3#2, luftwasser.K5, studios.K2#2/K3#2/K4, pipeline.K4, ankunft.K1/K2#1/K3#1, bauen.K1#2/K5#2, siedlung.K2/K4#2/K5, leib.K2/K4, halten.K1#2/K5, fahrzeug.K2/K5#1, tore.K3, streaming.K4#2, profiband.K1–K3, klang.K4/K5#2, speicher.K1/K2/K4#2.
- **28 Deckel gerissen:** 10 s (= keine GTX-Eichzahl): ferne.K1#1/#2, K2#1/#2, gelaende.K2#1/#2, K5#2, licht.K3#2, lod.K5#1, mensch.K5#1, physik.K2#2, vegetation.K5#2 · 29–45 s: profiband.K4#1/#2, lod.K1#1, ferne.K5#1, oekologie.K4#2, halten.K2#1, leib.K1#2, licht.K1#1/K2#2/K3#1, material.K2#1, mensch.K1#1/K2#2, streaming.K3#1, vegetation.K4#1/#2.
- **8 Frist der Probe gerissen:** material.K1#1/#2, K3#1/#2 (4 s), fahrzeug.K3#2, K4#1/#2 (33 s), siedlung.K1#2 (27 s); **1 Urteils-Zeile fehlt:** lod.K3#1.
- Welt-Brüche in derselben Sitzung: Ort im Deckel > 250 m bei gelaende.K3#1 + ferne.K5#1 (6469 m), streaming.K3#1 (2000 m), material.K2#1 + licht.K1#1 (1083 m).
- **Gegenprobe [hebend-5fba-s1-gtx](hebend-5fba-s1-gtx/) (8 Stationen, 10,1 min, 22:07):** 8/8 OFFEN durch Deckel/Frist (licht.K2#2 33 s, licht.K3#1 45 s, leib.K1#2 33 s, fahrzeug.K2#1 10 s, speicher.K4#2 15 s; Frist studios.K2#2/K3#2 19 s, leib.K4#2 27 s). Scheiben heilen also die 48 Fahrt-Opfer, aber nicht die 37 Deckel- und Frist-Risse. Die erledigt-Zeile meldet trotzdem „11 grün / 10 rot“, dieselbe Zahl wie voll-5fba: sie zählt offenbar die Mess-Datei des SHA, nicht den Lauf.
- Schnitt für die nächste Woche: Pakete ≤ 27 Stationen je Zeile, profiband.K5 als eigene Zeile, Eich-Fahrt für die 10-s-Stationen, Proben mit Welt-Bruch tragen `mutiert`.

## Wo die Sitzung sonst bricht (52 Sitzungsläufe)
- Deckel gerissen am häufigsten: lod.K1#1 30×, profiband.K4#1 29×, material.K2#1 29×, lod.K5#1 28×, tiere.K1#2/K3#2 + mensch.K1#1 je 25×.
- Frist gerissen: studios.K2#2/K3#2 + siedlung.K1#2 je 28×, ankunft.K2#1/K3#1 27×, bauen.K1#2 25×.
- Welt-Bruch ohne `mutiert`: lod.K5#1 28×, material.K1#1 20×, material.K2#1 8×, material.K3#1 + licht.K3#2 je 6× · Werkzeug-Bruch (Zeichenkette): profiband.K4#1 18×, ankunft.K2#1 14×, lod.K1#1 9× · Urteils-Zeile fehlt: studios.K4#1 13×, lod.K3#1 5×.
- Hänger: 29.10. stadt-A1 `lauf --wandern bahn` 03:36–06:54 mit Schloss (zwei echt-Jobs ROT); 30.10. gpu-lauf.sh 600 s stumm (takt24c/25b/25p/25h 0/0).

## Fallen
- **Zeitumstellung 25.10.:** ci_ruhe schlief 62 min MIT Schloss (mehrdeutige hook.log-Zeit) → CI-Ruhe vor dem Schloss, hook.log-mtime, job-start.ps1 in UTC.
- **Schloss/Vorfahrt CI:** 11× „VORFAHRT … verloren“ (bis 79,7 min, takt24c); Runner.Worker hat Vorfahrt, Verdrängung seit 24.10.; nie `tail -F hook.log` (Waisen sperrten den Hook).
- **Rückzug-Schleife:** `nur=` mit Station ohne gtx (z140-punkte-gtx, 10 Rückzüge 17:48–19:20, erst Storno 81eef0f67 löste) · Plan-Gate-Schleife takt-z110a 31.10. (FAHRT_MAX_S lehnte jeden Lauf ab, Storno 7be5c6537).
- **Storno + Rebase in koord-punkte (28.10.):** liegengebliebene Mess-Datei → jeder Rebase scheitert; erste Prüfung bei drehendem Dienst: `git status` in koord-punkte.
- **Log-Rotation** ab 2 MB, nur eine Generation (31.10. zweimal rotiert) — Älteres nur in fortschritt.txt/Archiv.
- **erledigt-Zeile „gemessen … 0 grün / 0 rot“** steht auch bei ungemessenen Läufen (takt25b/p/h, takt-z145a, takt-z156a/b, takt-z165a).
- **Archiv:** Einträge > 7 Tage in `zug/archiv/2026-w44/`; eine archivierte id nie neu vergeben (ihre erledigt-Zeile liegt im Archiv).

## Offen (benannt, ungelöst)
- Gelandete LANGSAMER-Nachwachen ohne Täter: z158, z159, z165 (stadt; z165 geht VRAM +23,7 MB).
- Wiese gpu-bank A driftete 12,5–13,2 ms (23.–29.10.) → 16,0–16,5 (z128–z165), Täter unbenannt; die paarweise Nachwache lässt die Summe durch.
- Ankunft kalt 13,9–31,5 s gegen Soll ≤ 5 s (14 Stationen; `three.webgpu` build 14–33× ≥ 50 ms vor dem ersten Bild).
- a-spawn boden-nah laiWirk 0 in 0 von 12 Zellen grün (a-spawn-gtx4) · Eich-Rest an b4bcf19c: 11 über dem Gesetz, 16 ≥ 90 s.

## Station sauber (02.11. ~22:30)
Prozesse: ein Wächter + eine Schleife, keine node-/Browser-Waisen, GPU-Schloss frei. Worktrees: 116 gelandete, saubere, > 24 h alte entfernt (Junctions zuerst gelöst). Rest 72 mit Grund: 43 mit lokalen Instrument-Änderungen (abab-*, albedo-*, rf-*, zz-*, tw-*, ego-*, linse-/frost-probe, hv2-d, s5-a, n1710-b4a/b, n1810-ego-a/b), 17 nicht gelandet (n1710-sg1, n1810-f6b/f6c/s6/s6b/s6d, n1910-s6a, n2210-as/vp, 8× p3/mp-baum), 11 jünger als 24 h (Dienst-Bäume), n2010-b2a (Junction-Ziel von n2210-as/vp).
