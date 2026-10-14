# Bericht 1310-16 — die Ankunft (Pflicht-OFFEN B): drei Hebel gemessen

**Status: ZWISCHENSTAND.**

**Urteil:** Keiner der drei benannten Hebel trägt die Ankunft auf der GTX (gemessen bis zum ersten Bild: kalt 28,9–29,5 s,
zweit 18,2 s). Der große Term liegt woanders und hat jetzt seinen Namen.
- **Hebel 1** ist geschnitten (welle-m-e-ankunft 8f7f2bc7): ETag + `no-cache`, die Nachfrage bekommt 304. Der Zweit-Boot
  überträgt 0,02 statt 8,85 MB, aber die Kontrolle bleibt gleich. Auf localhost kostet die Übertragung nichts.
- **Hebel 2** trägt auf der GTX nicht. Eine „Ruhe ohne Auftrag“ gibt es hier nicht: Das Werk ist bis 1 s vor dem Bild belegt.
- **Hebel 3**: Das Buch steht bei 8,4 s. Eine Rundreise (0,42 s) ließe sich sparen, der Rest ist Worker-Boot, Buch-Bau und
  blockierter Haupt-Faden.
- **Der größte Term** ist der **Erst-Bau der Zeichnung auf dem Haupt-Faden**: kalt 7,1 s, zweit 6,4 s. Dazu kommt kalt der
  Bau von über 100 Bäumen und Bauten im Foundry-Werk (12 im Werk, bis ~27 s).
- Zweig welle-m-e-ankunft 22884ebf `[ci voll]` ab main 9fb869a5.

## Hebel 1 — der Cache-Kopf (geschnitten)

- Bis hier sandte der save-server weder Validator noch Regel. Jetzt gilt an EINER Stelle (`sendStaticFile` →
  `statischerKopf`):
  - jede statische Antwort trägt einen starken ETag (SHA-1 des ausgelieferten Inhalts) und `Cache-Control: no-cache`;
  - `If-None-Match` bekommt 304 ohne Körper.
- **Kein `immutable` auf `?v=`:** Der Stempel ist die Version, nicht der Inhalt. main ändert Code auch ohne Versions-Sprung
  (z. B. 9fb869a5 bei 18.545.0), ein immutabler Eintrag hielte dann alten Code bis zum nächsten Sprung. Gemessen habe ich ihn
  nicht, denn auch null Rundreisen verkürzen den Weltbau nicht (siehe unten).
- **Linse** `gate:persistence` (C), am echten Server in der Sandbox:
  - ETag + no-cache, die Nachfrage 304 mit 0 B;
  - neuer Inhalt bei gleichem Stempel ergibt einen neuen ETag;
  - der Selbsttest mit dem alten Kopf ohne Validator wird rot. 14/14.

**Boot-Probe** (GTX, echter save-server, je Aufruf kalt + zweit, A B A B; `v1/`):

| | A main | B Hebel 1 |
|---|---|---|
| Zweit: übertragen | 8,85 · 8,85 MB | **0,02 · 0,02 MB** |
| Zweit: Kontrolle | 17,96 · 18,27 s | 18,70 · 17,45 s |
| Zweit: DOMContentLoaded | 1,45 · 1,13 s | 1,26 · 1,25 s |
| Kalt: Kontrolle | 27,39 · 29,41 s | 29,07 · 29,28 s |

## Wo die Ankunft steht (die Kalt-Linse, Zweit-Zeile neu)

`diag-boot-stage --kalt --echt` nennt je Sekunde, worauf das erste Bild wartet. Neu ist `--profil <ordner>`: Der zweite Lauf im
selben Ordner ist der Zweit-Boot mit Platte (`z1-*.txt`, `kalt1.txt`).

| Lauf | erstes Bild | Haupt-Faden blockiert | davon Erst-Bau der Zeichnung |
|---|---|---|---|
| kalt (leeres Profil) | 28,9 · 29,5 s | 16,9 · 18,8 s | **7,1 · 7,2 s** |
| zweit (Platte voll) | 18,2 s | 12,8 s | **6,4 s** |

- **Kalt:**
  - Bis 8 s öffnet sich das Buch.
  - Ab 8 s warten 35–48 Aufträge, 12 sind im Werk, „107 Bäume und Bauten wachsen“.
  - Von 19 bis 25 s blockiert der Erst-Bau den Haupt-Faden mit jedem gelieferten Asset fast voll.
  - Bei 26–28 s ist die Schlange leer, das Werk liefert die letzten 4 → 1, danach steht das Bild.
- **Zweit:**
  - Die Assets kommen von der Platte (die Schlange ist bei 11 s leer).
  - Von 4 bis 16 s blockiert der Erst-Bau 250–750 ms je Sekunde.
  - Von 12 bis 17 s warten 4 → 2 Wald-Stücke auf ihre Gestalt.

## Hebel 2 — „Ruhe ohne Auftrag“ (trägt auf der GTX nicht)

- In beiden Kalt-Läufen ist das Werk bis zuletzt belegt: 12 im Werk bis 26 s, dann 9 · 4 · 1. Das Bild folgt dem letzten Asset
  in unter 1 s.
- Die 60–62 s mit 0 Aufträgen und 70 wachsenden Gestalten (Integrator-Lauf) zeigen sich hier nicht.
- Ich vermute, das ist der langsamere Faden einer anderen Maschine. Messen kann ich das hier nicht.

## Hebel 3 — das Buch (die Kette gemessen, `buch-kalt.json`, Worker umhüllt)

| Schritt | Zeitpunkt | Dauer |
|---|---|---|
| Worker-Start | 2,89 s | |
| „ready“ gesendet (importScripts aller Kerne, init, Stempel) | 5,44 s | 2,55 s |
| „ready“ auf dem Haupt-Faden behandelt, `get-book` gesendet | 5,86 s | 0,42 s (der Haupt-Faden war blockiert) |
| Buch gebaut und gesendet | 7,01 s | 1,15 s |
| Buch auf dem Haupt-Faden behandelt | **8,43 s** | 1,42 s (der Haupt-Faden war blockiert) |

- Der erste Frame liest vom Buch die Rezepte jeder nahen Gestalt. Ohne Buch baut das Werk nichts (0 Aufträge bis 8 s).
- Schickt der Worker das Buch unaufgefordert mit „ready“, spart das die Rundreise, also höchstens 0,42 s. Nicht geschnitten,
  zu klein gegen 29 s.
- Den Rest trägt der Haupt-Faden: Er ist im Fenster des Buchs zu 90–100 % mit dem Erst-Bau belegt.

## Pflicht-OFFEN Rest

B bleibt offen. Kalt 29 s, zweit 18 s gegen ein Soll von ≤ 5 s. Die Terme nach Größe:
1. **Erst-Bau der Zeichnung auf dem Haupt-Faden**, 6,4–7,2 s: Knoten- und Pipeline-Bau jedes neuen Stoffs beim ersten
   Zeichnen. Er blockiert auch die Antworten des Werks.
2. **Kalt der Foundry-Bau** von über 100 Gestalten, ~20 s im Werk.
3. **Zweit die Wald-Stücke**, die auf ihre Gestalt warten (bis 17 s).

Alles benannt, nicht geschnitten.

## Status ZWISCHENSTAND + Übergabe

- Branch **welle-m-e-ankunft**, Kopf **22884ebf** (Hebel 1: 8f7f2bc7), gepusht `[ci voll]`. CI 38508150159 läuft.
- Werkzeug:
  - `p3/k16/serie.sh` (Boot-Serie A/B mit Fingerabdruck)
  - `p3/k16/buch-probe.cjs` (die Kette des Buchs, der Worker umhüllt)
  - `diag-boot-stage --profil` (die Zweit-Zeile)
