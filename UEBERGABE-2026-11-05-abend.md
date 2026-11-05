# Übergabe 05.11. abends (Konto-Woche bei 93 % um 19:40; wird bis 98 % fortgeschrieben)

**Gebucht 205/330** am Kopf 9c545df2 (Artifact https://claude.ai/artifact/Un9gX5VgRzYy77kzKUGeM2 v39), main = 9c545df2 (z232) bzw. neuer — `git ls-remote origin main`.
Heute: 198 → 205 (zuletzt schatten.K1 durch die GTX allein). Offen zum Buchen: stoffe.K2#2/K5#2 headless (Farm farm-9c54).
Werkzeuge:
- Buchung: `BUCHE_KOPF=<sha40> bash artifacts/profiband/werkzeug/buche.sh`
- Züge: `cd /tmp/claude/w3 && bash zug-schlange6.sh <vor> "<id>:<zweige>"` (EINE Instanz je Zug; Prozesse prüfen mit `Get-CimInstance Win32_Process` schlange|sammler|fahre.sh)
- Radeon: `bash /tmp/claude/w3/radeon-punkte.sh <sha40> --nur "<id,id>"`
- Farm: `bash /tmp/claude/w3/farm-lauf.sh <sha40>`
- OMEN per RC „Koordinator Meldung“
Log: /tmp/claude/w3/offen-w6.txt Einträge 119–157.

## Züge
- **z233 ROT** (voll 9/18 Werk im Wasser: „Kreaturen an der Obergrenze (3 frei) setzte 10 von 10 — der Fehl-Grund griff nicht“).
  - Die OMEN jagt seit 19:16 mit `gate:werk-im-wasser` je Kopf: dorf-probe 4adff50e → pegel-lauf 43584419 → proben-tempo-spiel e47e2714 → riesenhalm c1667e94.
  - Ihre Zeilen stehen in koordination `zug/fortschritt.txt`.
  - Täter → seine Zeile in seinen Briefkasten `cloud-post/<zweig>.md`. Die Unschuldigen fahren im nächsten Zug.
- **z234 fährt** (seit 19:28): w12-tuch-grob bc1013ec + w12-albedo-tafel b9666905.
  - w12-unterwasser b5aa8779 fiel an der STATIK-Kette, ohne eigenen Fehler. Allein ist er GRÜN (Prüf +92 / Spiel +493 Atome, `diag-betriebsgesetz --grund <abzweig>`).
  - Grund: Tuch-grob streicht Spiel-Code. Die Wachstums-Wand misst den Push als Summe, damit kamen alle drei zusammen auf Prüf +42 / Spiel +53 (erlaubt 26).
  - Unterwasser fährt deshalb im nächsten Zug ohne Tuch.
- **z235 (nächster)**: w12-unterwasser b5aa8779, w12-kronen-albedo 7a5fb4c1, w12-takt-band f5547a39 (Abgabe 19:30, K06), dazu die Unschuldigen aus z233.
  - w12-kronen-albedo trägt den Merge von w12-albedo-tafel. Fällt z234 an der Albedo-Tafel, fällt kronen mit.
  - Die Bilder der Kronen habe ich selbst gesehen: Die Birke ist eine Spur weniger grell, ihre Krone bleibt hellgrün (`/tmp/claude/w3/kronen-bilder/{vorher,nachher}`).
- Nach den Landungen messen:
  - Radeon: material.K1/K3 (K1#1 an der Radeon 13/13 am Zweig) und leib.K3#2
  - GTX: leib.K3#2
  - headless: haar.K4#2, wetter.K3#2
  - Danach buchen.

## Stationen in koordination (heute gemergt)
- g2-proben, kontakt, pegel, dorf-probe (stoffe.K4#1 verlangt Häuser > 0 und braucht den Spiel-Teil w12-dorf-probe), albedo-station, unterwasser (Leib-Kontrast 0,05 nach Duntley), kronen-station (Fichte gegen das Nadel-Band 0,08–0,15, Betts & Ball 1997).
- **proben-tempo zurückgenommen** (456ec1fd): Die Fahrt ohne Bild riss in der gemeinsamen Welt streaming.K1/K2.
  - Die Neufassung läuft lokal als Champion auf dem Zweig **w12-proben-tempo2**, mit WIP stündlich.
  - Sie gilt nur für tiere.K5/fahrzeug.K2 und benennt den Mechanismus des Lecks.
  - Ist sie unfertig: vom gepushten Stand übernehmen, die headless-Zahlen vorher ↔ nachher stehen in den Commits.

## Cloud (Start 05.11. ~19:00, WIP stündlich gepusht — vom gepushten Stand integrieren)
Stand 19:40: klang-lage und w11-fahrzeug pushen noch, takt-band hat abgegeben, menue/verkehr/ankunft-faden/studio-buehne stehen auf WIP.

| Sitzung | Zweig | Auftrag (Briefkasten cloud-post/…) |
|---|---|---|
| w12-klang-lage | w12-klang-lage | klang.K5#2 `_umweltLage` (w12-klang-takt.md) |
| w12-takt-k06 | w12-takt-band | K06 Schmuggel-Arm (w12-takt-band.md) — Abgabe f5547a39 |
| w12-menue-layout | w12-menue | 16 px ohne Abschneiden + Linse (w12-menue.md) |
| w12-verkehr-richter | w12-verkehr | Richter zählt 20 Wagen/Abstand/Sitz, GRÜN aus PFLICHT-OFFEN raus (w12-verkehr.md) |
| w12-ankunft-b | w12-ankunft-faden | Summe UND t(Kontrolle) fallen (w12-ankunft-faden.md) |
| w12-fahrzeug-heil | w11-fahrzeug | 7 rote Linsen aus z225 (w12-fahrzeug-decke.md) |
| w12-buehne-lack | w12-studio-buehne | Lack spiegelt den Himmel (w12-studio-buehne.md) |

Jede sichtbare Abgabe braucht vor dem Zug ein Radeon-Bild (Vorprüfung). Heute fielen dabei auf: Das Menü schnitt Text ab, der Verkehr-Richter war zu weich, der Ankunft-Faden war langsamer.

## Lokal (Radeon)
- w12-laub-kante (lod.K1#1 = PFLICHT A laub-kante) läuft noch.
- w12-proben-tempo2 (siehe oben).

## Offen / Funde (FUND-REGISTER.md)
- LLM-Stationen: Die Farm misst ki.K1#2/ki.K4#1 mit dem CPU-Modell (p95 59 s) rot. Lokal mit Ollama (GPU) nachmessen, dann kommen ki.K1 2 und ki.K4 1 zurück.
- Werkzeug:
  - Sitzungs-Wechsel buehne→buehne nach schatten.K1#1 (K1#2 nur allein messen)
  - gate:fenster-wechsel: der ES-Selbsttest wackelt
  - Streckung der Fern-Wiese nur nach Abstand (vegetation.K1#1)
  - tanne@0,05: Karte unter Feuer (licht.K3#1)
  - OMEN: HP-Dienst apphelpercap (Entscheidung des Schöpfers)
- Neu aus kronen:
  - `foundry-core.js:2544`: Die Nadeln der L2 lesen eine feste Fichten-Farbe (Zwilling für Mammut und Tanne).
  - material.K3#2: Die Fichte wackelt bei Uhr 0,27 trotz byte-gleicher Läufe.
- Die STATIK-Kette des Sammlers misst wie der CI-Push die Summe. Ein Zweig, der Spiel-Code streicht, gehört nie in einen Zug mit spec-schweren Zweigen.
