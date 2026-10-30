# Bericht 3010 w4-sitzung-eichen — die Mess-Sitzung der GTX an 6b3da705 (takt25c): wohin die Zeit ging, die Eich-Fahrt

**Status: ZWISCHENSTAND.** Geschnitten, gemessen, offen — die GTX-Zahlen bringt erst die Eich-Fahrt auf der OMEN.

- **Geschnitten** (`meisterkarte-quelle/punkte/punkte.cjs`, `zug/eich-gtx.sh`):
  - DER WARME START: nach jedem Riss ging die Grundstellung durch die Tür, die Werkbank hält die neue Seite still (`loopAus`), die
    nächste Probe zahlte den Ring — am Ort 15,1–25 s statt ~3 s warm, ohne Ort im eigenen Deckel. Jetzt misst auch eine Probe ohne Ort
    in der stehenden Welt: nach Boot, Grundstellung und jeder neuen Seite schwingt die Sitzung sie EINMAL ein (`__weltStehtNach`),
    vor dem Deckel, im Kopf `orte` (ort null); eine Probe, die die Seite neu lädt, lässt ihren Ort neu stellen.
  - DIE EICH-FAHRT `run --eich`: die Sitzung mit 90 s je Probe über die Proben ohne frische Messung und ohne Zahl am SHA; je Probe
    `s` (Start bis Prozess-Ende) und `eich` {s, sek, gesetzS}; ein Urteil zählt nur im Gesetz (≤ 45 s, mit ausnahme ≤ 90 s), darüber
    UNGEMESSEN beim Namen samt Urteil; die Fahrt bleibt ≤ 1 800 s, der Rest geht in die nächste Eich-Fahrt. Die OMEN fährt sie als
    Station `zug/eich-gtx.sh` (aus koord-punkte, Mess-Datei und Roh nach punkte-maschine, nach `bericht/<id>/` Log, Zahlen, Rest).
  - Der Leser der Zahlen `eichtafel --sha --geraet`: je Lauf Deckel heute, Zahl, Deckel aus ihr (⌈1,5 × s⌉ ≥ 10 s, die Regel des
    Boots), „schneller machen“ über dem Gesetz, Σ heute ↔ aus den Zahlen gegen das Budget 1 740 s.
  - Nebenbei am Weg: `baumSperre` legt `.claude/worktrees/` an (ein frischer Klon stürzte mit ENOENT); `selbsttest --ohne 3c`.
- **Gemessen:** Selbsttest ohne (3c) 113/113 GRÜN in 182 s (vorher 106/106; neu: WARMER START, SEKUNDEN, NEUE SEITE, EICH-Urteil,
  EICH-FAHRT, EICH-Auswahl, EICH-TAFEL). Mutante „Warm-Start aus“ → 8 Fälle ROT beim Namen, Mutante „Seiten-Wache aus“ → NEUE SEITE ROT
  (111/112). `liste` Exit 0, byte-gleich samt Abdrücken (keine Station berührt). Deckel vorher = nachher: Σ gtx 1 740 + Boot 60 =
  1 800 s, Σ radeon 1 800 s. `run --eich --trocken` an 6b3da705: 99 Stationen in 68 Läufen. OMEN-Attrappe (falscher Ursprung,
  Schloss-Attrappe Exit 75): Station Exit 0, Commit „Punkte-Eich-Fahrt 6b3da705 gtx: …“ nach punkte-maschine, Rest 99.
- **Ehrlich offen:** keine GTX-Zahl über dem Deckel — 22 der 36 gerissenen Proben tragen keine Zahl über ihm (20 gar keine, lod.K2#1
  nur zensiert ≥ 46 s, oekologie.K4#2 Radeon 31 s am Deckel 31); 6 brauchen auf der Radeon
  mehr als ihren Deckel (19–44 s), 6 mehr als 45 s (50–82 s: ausnahme oder schneller), 2 ≥ 100 s (schneller). Die Deckel heben geht
  nicht ohne Senkung: Σ steht auf dem Budget. Was davon die GTX trägt, nennt erst die Eich-Fahrt, danach die `eichtafel`.
- **Wohin die Zeit IN den Proben ging** (die Rohlogs `messung/roh/6b3da705-gtx/`, Zweig punkte-maschine fd3adae7):
  - je `/bild` 13,3–14,5 s auf der GTX (vegetation.K5#1, zwei Schüsse vor dem Deckel 65 s); tiere.K1#2 stand nach 11 s „✅ GRÜN —
    herde“ und riss dann in seinen drei `/bild`-Schüssen (Deckel 33 s). Die Wurzel liegt im Spiel-Baum (Werkbank `/bild`, bei fernem
    Auge ein `umstellen` an die Pose) — dort ungemessen je Schritt, kein Schnitt dieser Maschine.
  - licht.K1#1: vier Rufe 8,2 + 6,3 + 11,9 + 9,5 s = 36,4 s am Deckel 40 s, darin das eigene `/umstellen wiese` (11,9 s): ein zweiter
    Ort in der Probe, den die Sitzung nicht vorstellt (sie stellt den ersten, genesis).
  - licht.K3#1: Schritt 18 der Beruhigung bei 59,3 s (je Schritt 0,7–1 s) am Deckel 60 s.
  - ohne eine Zeile im Deckel (physik.K2#2, mensch.K1#1/K5#1, bauen.K1#2/K5#2, ankunft.K2#1, klang.K4#1, fahrzeug.K2#1, studios.K4#1):
    jede lief nach der Tür in der kalten, stillen Seite — der Ring, den DER WARME START jetzt vor ihren Deckel legt.

**Die Zeile für `zug/warteschlange.txt`** (nach dem Merge von `w4-sitzung-eichen` in koordination UND punkte-maschine — ohne die
Eich-Fahrt in punkte-maschine bricht die Station ab, ohne zu fahren), je Eich-Fahrt eine neue id, bis `eich-rest.txt` „nichts zu
eichen“ nennt (68 Läufe ≈ 2–4 Fahrten à ≤ 30 min):

    eich1-gtx 2 station sha=6b3da705074d6eacd348a192aecbaeb8d2592495 lauf=eich-gtx.sh

## Die 38 Proben von takt25c (14:25–14:51, die Reihe der Sitzung)

Deckel = `probe.sek`; Ort = das Umstellen der Sitzung davor (alle nach der Tür, außer der ersten); zuletzt = die letzte Zeile am Deckel;
Radeon warm = die Eichläufe eich1–6 (a53152c2 … 1f17e7d1, `gegenlauf/`), gemessen min–max, (≥ zensiert); GTX früher = die Sitzungen
24a0f3ef/73bdf938 mit Neuladen vor jeder Probe (darin der Ring-Neubau). Klasse: a Probe zu langsam · b Deckel zu knapp · offen: die
GTX-Zahl fehlt. Die Kosten der Sitzung (c) zahlten 35 von 36: jede nach der Tür.

| Probe | Deckel s | Ort | davor | zuletzt | Radeon warm | GTX früher s | Klasse |
|---|---|---|---|---|---|---|---|
| mensch.K4#1 | 15 | wiese 20.3 s | Boot | KAMERA {"leib":0,"vorn":true,"abstand":6.1,"d" | 22–30 s (≥ 46) | 57, 65 | b — Deckel zu knapp (Radeon 30 s) |
| haar.K2#1 | 15 | wiese 15.4 s | Tür | ARM {"urteil":"ROT","ist":null,"band":[0.3554, | 16–23 s (≥ 46) | 56 | b — Deckel zu knapp (Radeon 23 s) |
| vegetation.K1#1 | 15 | wiese 15.1 s | Tür | SCHRITT /eval 0.0 s | 14–26 s (≥ 30) | 90, 47 | b — Deckel zu knapp (Radeon 26 s) |
| vegetation.K5#1 | 65 | wiese 15.1 s | Tür | SCHRITT /eval 0.0 s | 20–70 s | 70 | a/b — Radeon 70 s > 45: ausnahme oder schneller |
| licht.K2#2 | 33 | wiese 15.1 s | Tür | setz-5 · Exit 0 | 33–44 s | 91, 80 | b — Deckel zu knapp (Radeon 44 s) |
| material.K2#1 | 33 | wiese 15.6 s | Tür | boden-2 · Exit 0 | 54–74 s (≥ 100) | — | a/b — Radeon 74 s > 45: ausnahme oder schneller |
| lod.K1#1 | 30 | wiese 15.9 s | Tür | wiese · Exit 0 | — | 110 | offen — GTX-Zahl fehlt |
| lod.K5#1 | 33 | wiese 17 s | Tür | umstellen · Exit 0 | ≥ 100 s | 434 | a — Radeon ≥ 100 s |
| lod.K2#1 | 15 | wiese 15.8 s | Tür | umstellen · Exit 0 | ≥ 46 s | 93 | offen — GTX-Zahl fehlt (Radeon ≥ 46 s) |
| spielgang.K3#1 | 13 | wiese 16.6 s | Tür | @@PUNKTE@@ BEDIENUNG | 20–30 s | 64 | b — Deckel zu knapp (Radeon 30 s) |
| ferne.K1#2 | 33 | genesis 18.8 s | Tür | — | ≥ 100 s | 165, 38 | a — Radeon ≥ 100 s |
| licht.K1#1 | 40 | genesis 16.5 s | Tür | RUF /eval return await __tagKurve({"uhren":[0, | — | — | offen — GTX-Zahl fehlt |
| licht.K3#1 | 60 | dorf 25 s | Tür | BERUHIGUNG 18 statt /lauf {"sek":5,"ein":8,"ru | — | — | offen — GTX-Zahl fehlt |
| licht.K5#1 | 33 | — | Tür | ✅ SELBSTTEST GRÜN — grauer β, Kante 21 %, Lini | 71–80 s (≥ 100) | 103 | a/b — Radeon 80 s > 45: ausnahme oder schneller |
| material.K1#1 | 33 | — | Tür | — | 73–73 s (≥ 100) | — | a/b — Radeon 73 s > 45: ausnahme oder schneller |
| material.K4#1 | — | — | Tür | — | 3–14 s | 9 | gemessen (7 s, ROT) |
| material.K5#1 | 11 | — | Tür | fenster · Exit 0 | 10–19 s | — | b — Deckel zu knapp (Radeon 19 s) |
| lod.K3#1 | — | — | Tür | — | — | — | gemessen (1 s, ROT) |
| siedlung.K1#2 | 33 | — | Tür | — | 49–50 s (≥ 32) | — | a/b — Radeon 50 s > 45: ausnahme oder schneller |
| siedlung.K4#2 | 33 | — | Tür | } | 51–82 s (≥ 100) | 113 | a/b — Radeon 82 s > 45: ausnahme oder schneller |
| oekologie.K4#2 | 31 | wiese 16.1 s | Tür | [linse-gpu] nvidia/pascal | 23–31 s (≥ 29) | — | offen — GTX-Zahl fehlt (Radeon 31 s trägt) |
| physik.K2#2 | 10 | — | Tür | [linse-gpu] nvidia/pascal | — | — | offen — GTX-Zahl fehlt |
| tiere.K1#2 | 33 | — | Tür | ✅ GRÜN — herde | — | — | offen — GTX-Zahl fehlt |
| mensch.K1#1 | 33 | — | Tür | — | — | — | offen — GTX-Zahl fehlt |
| mensch.K5#1 | 10 | — | Tür | — | — | 55, 54 | offen — GTX-Zahl fehlt |
| studios.K2#2 | 25 | — | Tür | portale         16 Anfragen · fremd /worlds/te | — | — | offen — GTX-Zahl fehlt |
| studios.K3#2 (Zwilling) | 25 | — | Tür | portale         16 Anfragen · fremd /worlds/te | — | — | offen — GTX-Zahl fehlt |
| bauen.K1#2 | 10 | — | Tür | — | — | — | offen — GTX-Zahl fehlt |
| bauen.K5#2 | 10 | — | Tür | — | — | — | offen — GTX-Zahl fehlt |
| studios.K4#1 | 33 | — | Tür | — | — | 442 | offen — GTX-Zahl fehlt |
| fahrzeug.K3#1 | 33 | — | Tür | @@PUNKTE@@ WELT | — | 82 | offen — GTX-Zahl fehlt |
| fahrzeug.K5#1 | 15 | — | Tür | [linse-gpu] nvidia/pascal | — | — | offen — GTX-Zahl fehlt |
| fahrzeug.K2#1 | 10 | — | Tür | [linse-gpu] nvidia/pascal | — | — | offen — GTX-Zahl fehlt |
| fahrzeug.K2#2 | 55 | — | Tür | [linse-gpu] nvidia/pascal | — | — | offen — GTX-Zahl fehlt |
| ankunft.K2#1 | 10 | — | Tür | — | — | — | offen — GTX-Zahl fehlt |
| ankunft.K3#1 (Zwilling) | 10 | — | Tür | — | — | — | offen — GTX-Zahl fehlt |
| klang.K4#1 | 10 | — | Tür | [linse-gpu] nvidia/pascal | — | — | offen — GTX-Zahl fehlt |
| speicher.K4#2 | 15 | — | Tür | [linse-gpu] nvidia/pascal | — | — | offen — GTX-Zahl fehlt |
