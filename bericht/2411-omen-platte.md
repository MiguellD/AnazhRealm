# Bericht OMEN 24.11. — die Platte (Auftrag auftrag/2411-omen-platte.md)

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 83 von 1 718.

**Befund:** Die Landung hielt heute fünfmal am Platten-Wächter (10:54 · 11:16 · 11:27 · 11:48 · 12:00): C: fiel auf 5,8 GB frei,
weil die systemverwaltete Auslagerungsdatei (24 GB, Commit 35 von 39,5 GB bei 15,9 GB RAM) unter CPU-Linsen neben Liste und CI wuchs.

**Frei:** C: 17,0 → 24,7 GB (+7,7). Ziel 25 GB: es fehlen 0,3 GB.

Was fiel (alles wiederherstellbar; der Lauf hielt das GPU-Schloss 12:43:38–12:53:24, nie neben Station oder CI):

- der Arbeitsbaum `koordination` (Zweig `dienst-runde-in-der-schlange`, Kopf 006c024b = `git ls-remote`, sauber, kein Dienst
  liest ihn) per `git worktree remove` — der Zweig bleibt: +6,1 GB;
- die losen Objekte des Klons `AnazhRealm-mess` in EIN Pack (`git repack -d`, verlustfrei, nichts Unerreichbares fiel): 56 602
  lose (5,06 GB) → 667, Packs 17,5 → 21,6 GB, netto +1,1 GB;
- `npm cache verify`: 0,47 GB Müll fiel, der Index bleibt.

Die Proben-Profile toter Läufe in Temp waren schon fort.

| Ordner | GB | wiederherstellbar |
|---|---:|---|
| AnazhRealm-mess/.git/objects (85 Packs + 56 602 lose) | 22,2 → 21,6 | ja, verlustfrei — gepackt |
| p3 (messplatz/koord 6,7 lebt · messplatz/lauf 1,8 Akten bis 01.11. · n0611 3,5, davon roh-bilder 2,5 · koord-punkte-rest-1511 1,3 gesichert · Serien n0311–n1711 ~2,2) | 21,9 | nein — Mess-Akten, ein lebender Baum |
| n0611-pm (punkte-maschine der Landung) | 14,0 | nein — Dienst |
| koordination (Arbeitsbaum) | 6,3 | ja — fiel |
| AnazhRealm-mess, Arbeitsbaum ohne .git | 5,2 | nein — Klon der Dienste |
| C:\actions-runner (_work/AnazhRealm 0,8) | 2,1 | gehört der CI |
| ~/.claude | 1,7 | nein |
| Temp (Sitzungen 0,9 · Profile 0,2) | 1,8 | die Profile toter Läufe |
| npm-cache | 1,2 → 0,7 | ja |
| p2 | 0,9 | nicht geprüft |
| ~/.cache/puppeteer | 0,7 | ja, aber jede Probe liest ihn |
| 15 Arbeitsbäume n1011-hg … n2411-pv | Σ ~0,8 | ihre node_modules sind Junctions |

**Ehrlich offen:** Der nächste Hebel des Apparats wäre ein volles `git repack -a -d -k` (geschätzt 2–4 GB, braucht ~18 GB Raum,
~18 min unter dem Schloss) — über der 20-min-Frist, heute nicht (Koordinator 13:00). Die Einstellung der Auslagerungsdatei ist
Systemsache des Schöpfers; mit ihr läge C: dauerhaft über dem Halt des Wächters (10 GB).

**Der Wechsel (Schnitt 2, OMEN-Skript):** Er wartet nie blind auf GEHALTEN. Gehalten ist auch: die Schleife lebt nicht
(`landung.mpid`), oder der Runden-Kopf wechselte (`refs/runde/koord`), je sofort mit lauter Zeile; trägt die Schleife 60 s keine
Station, gilt es nach 60 s mit lauter Zeile. Wartet die Station 60 s in `cpu_ruhe` auf einen leeren Besitzer, fällt die Flagge laut, kein
Handlauf. `landung.halt` trägt „gesetzt … · verwaist ab …“; älter als 20 min ohne lebende Schleife fällt die Flagge laut. Selbsttest 18
Fälle grün; die Mutante (das alte blinde Warten) hängt sichtbar.

**Die Dienst-Zeilen** (nicht angefasst; ein eigener Zweig `dienst-frist` nach sport-regeln 3):

- `platte-dienst.sh:27` — `start.sh --stopp landung` beendet die Schleife, der Puls bleibt auf „misst …“;
- `start.sh:92` — bei liegender Flagge „nicht gestartet“, ohne Puls GEHALTEN und ohne Verwaist-Regel (der Ort: `start.sh:42/92`,
  `landung-dienst.sh:58` `halt()`);
- `gpu-schloss.sh:20` — `ci_wartet` liest nur die letzte Zeile des Hook-Logs: ein hängender Job (45382729367) ließ „wartet auf
  Schloss“ stehen;
- `gpu-schloss.sh:64–66` — `cpu_ruhe` wartet ohne Frist (die Liste 20 stand dahinter ab 12:24:50).
