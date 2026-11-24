# Auftrag OMEN 24.11. 12:30 — die Landung hält nicht mehr an der Platte und nicht mehr am Puls

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

## Befund (deine Meldungen von heute)

- Die Landung hielt fünfmal (10:54 · 11:16 · 11:27 · 11:48 · 12:00), weil C: nur 5,8 GB frei hat und die Auslagerungsdatei unter
  CPU-Linsen wächst.
- Die GTX-Liste der Runde 20 stand 21 Minuten (11:59 → 12:20): `landung.halt` lag seit 12:00:15, die Landungs-Schleife endete am
  Runden-Sprung ohne den Puls GEHALTEN, dein Wechsel-Skript wartete auf genau diesen Puls.

## Schnitt 1 — die Platte (vor allem anderen, höchstens 20 Minuten)

Die Einstellung der Auslagerungsdatei ist Systemsache des Schöpfers und bleibt unberührt. Unser Teil ist der Platz, den der Apparat
selbst belegt:

1. Zensus in EINER Tabelle (Ordner · GB · wiederherstellbar ja/nein): die Arbeitsbäume, ihre `node_modules`, die Chrome-Profile und
   Caches der Proben, der Temp-Ordner der Sitzungen, die git-Packs. Nur Ordner des Apparats — nichts vom Schöpfer, nichts vom System.
2. Frei wird nur, was sich wiederherstellen lässt: `node_modules` toter Bäume, Proben-Profile und Caches, alte Fahrt-Logs älter als
   sieben Tage. Ein Arbeitsbaum fällt nur, wenn sein Kopf auf origin steht (`git ls-remote` zeigt denselben SHA) und er sauber ist;
   der Zweig bleibt. Kein Zweig, kein Ref, keine Mess-Akte wird gelöscht.
3. Ziel: C: frei ≥ 25 GB. Reicht der Apparat-Anteil nicht, steht die Tabelle im Bericht — dann entscheidet der Schöpfer über die
   Auslagerungsdatei, mit der Zahl.
4. Bericht: frei vorher → nachher in GB, die Tabelle, was fiel.

## Schnitt 2 — der Wechsel wartet nie blind auf einen Puls

- Als „gehalten“ gilt auch: die PID der Landungs-Schleife lebt nicht mehr, ODER der Runden-Kopf hat gewechselt.
- Harte Frist 60 s mit lauter Zeile („Wechsel ohne Puls nach 60 s: <Grund>“), nie stilles Weiterwarten.
- `landung.halt` trägt die Zeit seines Setzens; älter als 20 Minuten ohne lebende Schleife ist es verwaist und fällt mit lauter Zeile.
- Sitzt die Ursache in einer installierten Dienst-Datei: nichts anfassen, Datei:Zeile melden — der Tausch läuft nur über `start.sh`
  und nie, während ein Zug fährt.

## Reihenfolge danach

`sport-regeln` 3 (der Steckenbleiber am Pfarrhaus, Spur stamm/siedlung-bewohner.js:2011) → `scherbe-liegt` → `ci-post-erbt`.
