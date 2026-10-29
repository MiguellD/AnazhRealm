# Übergabe 29.10. (Konto 3, Woche 3 — Notbremse bei 98 %)

**Karte gebucht: 138/330** am Mess-Kopf b3f9ae95 (05:00). Seither keine Buchung. main = **98ef98bb** (z71, 11:18).
Meisterkarte: https://claude.ai/artifact/Un9gX5VgRzYy77kzKUGeM2

## Was heute gelernt und geschnitten wurde (Schöpfer-Gesetze)
- **Prüftheater-Ende:** eine komplette Mess-Fahrt durch ALLE Systeme je Gerät ≤ 30 min, Dauerlast inbegriffen; jede GPU-Station
  ist eine Kurz-Probe (Ziel ≤ 15 s, Deckel 45 s) in EINER warmen Welt, Reset nur nach mutierender Probe. Kein 80-min-Profiband mehr.
- **Arbeiter-Takt:** Code-/Heil-Arbeit in Cloud-Karten; GPU-Beweise gesammelt in EINER Session auf der Radeon, Ergebnis per resume.
  Lokal nur GPU. Waisen-Prozesse nach Muster fegen (nie pauschal bash ohne Eltern — tötete Fahrer z72 und Wache).
- **Das Auge urteilt:** grüne Linsen ≠ AAAA; jede Session liefert Bilder, rot im Bild = rot.

## Was steht (Zweige, gepusht)
| Zweig | Was | Zustand |
|---|---|---|
| mess-session@f0fe40d3 | Session-Läufer, 41 Proben; Gegenlauf 29/30 gleich Takt 19 (affekt.K1#2 neu GRÜN), 128 statt 392 min | verifiziert; 35a66558 schon in koordination/punkte-maschine (über w3w-glanz-koord) |
| w3v-lod@3e446fde | lod-Gesetz + **Heilung (T) ECHT** (echt-Gewicht = Minimum der Läufe, Luft-Schritt → Station ferne.K1/K2) | CI: Neulauf voll 5 (praegung-Wackler) |
| heil-l8-lockstep@8ae43245 | L8 = Hungertod des einzigen Bären (Welt-Uhr) → Bestand ruht in der Fahr-Linse, 6/38 → 0/32 | grün |
| heil-schwarm-k3@427bcd05 | 2/13 Welten sendeten vor Handshake, 10/10 → 0/20 | grün |
| spike-ci-konsum@9f80e892 | Lade-Klick-Wackler (klickInRuhe) 3/6 → 0/10 + CI-Konsum | CI rot (L8 + kreatur sattel/huepfer) |
| stadt-takt-bewohner@11ccc35a | _tickBewohner 6,57 → 1,87 ms | grün? (ABAB unentschieden unter Last) |
| gpu-wahl-bau@f33c71c2 | Bewohner-Dreiecke −55 %, Bild −27 % | Kaskaden-Sonde offen |
| w3w-jahrhunderte@d030f81f, w3w-studios@5814c139 (studios.K1 94,9 %), w3w-glanz@7e5e7c63, w3w-wald@90a7bf4f, w3w-verkehr | Cloud-Welle w3w (Koord-Stationen gemergt: 217 St./125 Kr.) | glanz/wald CI rot, Rest grün/läuft |

## Die Falle des Tages: (T) ECHT
Jeder Zug frischt bei (T) ALT die Zeit-Tafel auf (artifacts/profiband/werkzeug/zug.cjs:573ff → scripts/ci-zeiten.cjs, Median von 7
Läufen). Die echt-Schritte warteten an der Radeon am GPU-Schloss hinter Mess-Sitzungen → Plan 30,6 min > Deckel 20 → z72, z73, z74,
z75 rot/abgebrochen. **Jeder Zug OHNE w3v-lod@3e446fde ist sicher rot** (Kandidat zeigt „CI-Zeiten neu“ → abbrechen).
Folge-Schnitt offen: der Session-Läufer hält das GPU-Schloss bis 55 min — Runner.Worker (CI echt) braucht Vorrang zwischen Proben.

## Läuft (ohne Tokens weiter)
- kette35 (z77, PFLICHT lod: fährt erst, wenn w3v-lod@3e446fde grün ist; z75/z76 ohne lod abgebrochen): zug-sammler2 mit Paar-Probe — w3v-lod zuerst, stadt-takt-bewohner, gpu-wahl-bau, **w3v-lod**, heil-schwarm-k3, heil-l8-lockstep,
  w3w-jahrhunderte, w3w-studios, w3v-brand-bild, w3w-glanz, w3w-wald, spike-ci-konsum, w3v-licht (Frist 60). Logs: %TEMP%\claude\zug-sammler-z76.log, fahre-z76.log.
- OMEN: takt21b-gtx am 98ef98bb (alter Läufer, ~33/50) — wird mit der nächsten Landung alt.
- Workflow dreissig-minuten (6 Umbauer + Vereiner): alle GPU-Stationen ≤ 30 min je Gerät, Linse in liste — bei der Notbremse gestoppt,
  die Bäume liegen unter %TEMP%\claude\proben-* (Wiederaufnahme: Workflow resume wf_201420bd-f96 bzw. neue Arbeiter „arbeite im Baum weiter“).

## Nächste Schritte (in dieser Reihenfolge)
1. z76 landen (nur MIT w3v-lod). 2. dreissig-minuten vereinen → mess-session pushen → in koordination/punkte-maschine mergen.
3. Session-Takt am neuen Kopf auf Radeon + GTX (OMEN: punkte-Zeile, alle Proben in EINER Zeile) + Farm headless → **buchen** (BUCHE_KOPF=<sha> bash artifacts/profiband/werkzeug/buche.sh) → Meisterkarte nachziehen.
4. Session-Läufer: Runner.Worker-Vorrang zwischen Proben. 5. Bilder der Session ansehen und dem Schöpfer schicken (Auge).

## Nachtrag 18:40
**z77 GELANDET 18:35 → main 715754fc**: w3v-lod (mit der Heilung von (T) ECHT — die Falle ist für alle weiteren Züge zu), stadt-takt-bewohner,
heil-schwarm-k3, heil-l8-lockstep, w3w-jahrhunderte. Noch nicht gemessen/gebucht. kette36 = z78 (gpu-wahl-bau, w3w-studios, w3v-brand-bild,
w3w-glanz, w3w-wald, w3w-verkehr, spike-ci-konsum, w3v-licht; Paar-Probe; studios kollidiert in scripts/diag-ofen-contract.cjs und brand-bild in
spec/stamm/modul-karte.json → je eine Heim-Karte nötig). Mess-Kopf für die nächste Buchung: 715754fc oder z78.
**18:37 z78 leer:** gegen main 715754fc kollidieren ALLE Reste (gpu-wahl-bau, w3w-studios, w3v-brand-bild grün; w3w-glanz, w3w-wald,
spike-ci-konsum rot + Konflikt; w3v-licht rot, frei) → erster Schritt nach dem Reset: je Zweig `git merge origin/main` (Heim), dann EIN Zug.
