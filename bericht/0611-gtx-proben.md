# 0611 GTX-Proben (OMEN, GTX 1060)

**Am main bca0d3d7 (GTX, ruhig, allein nach dem echt-Job):** material.K1#2, material.K3#2, licht.K1#1 und tiere.K3#2 sind alle UNGEMESSEN an ihrer Frist. Es gibt kein Urteil; eine ruhige GTX reicht nicht. Der Lauf ging von 01:57 bis 02:03 (Schloss 5,8 min). Messdatei: `meisterkarte-quelle/punkte/messung/bca0d3d7-gtx.json`, Roh-Ausgaben in `roh/bca0d3d7-gtx/*.out`. Am main 3f1d4a5b (01:29) war das Bild dasselbe.

## Zeit-Teile je Probe (GTX, gemessen an bca0d3d7 und 3f1d4a5b) — für den Champion

- **material.K1#2 / K3#2** (Frist 84 s): Die Welt-Seite `/albedo` hat bis 84 s keine Messung geliefert, und das Labor daneben stand ebenfalls noch offen (`Target closed` beim Abbau).
  - Die Werkbank fährt 21 Gänge `__albedoSicht`: 10 Stufen-Zeilen × 2 Uhren (je Uhr ein eigener Gang mit eigenem Warten auf die Stufe) plus den einen Gang der übrigen 9 Zeilen.
  - `messeLabor` misst die 7 Studios nacheinander (terrain allein 6 Zeilen).
- **licht.K1#1** (Deckel 45 s): Genesis braucht für 100 Uhren 13,9 s und für 88 Fein-Uhren 11,9 s, zusammen 28,0 s.
  - Das sind 134–139 ms je Uhr, darin die 4 vollen Aufnahmen des Wegs und die Karte.
  - Danach riss der Deckel im kalten Wechsel zur Mess-Wiese; den Wechsel allein hat bbca6407 mit 17,0 s gemessen.
  - Rechnung: 28 + 17 + 26 ≈ 71 s. Damit 45 s halten, dürfte eine Uhr nur etwa 55 ms kosten.
- **tiere.K3#2** (Deckel 45 s): In der Probe stand tier-gang an der Frist bei „Labor = Welt im Takt“. Der Querhang war grün.
  - Die beiden Linsen allein (3f1d4a5b, zugleich wie in der Probe, ohne Bühne): tier-gang 54,9 s, Querhang 41,9 s (davon die Probe 17 s).
  - Aufteilung von tier-gang: Null-Welt 13,6 s, Welt-Läufe bis 18,6 s. Danach läuft das Labor erst NACH der Welt, insgesamt 36 s:
    - Körper-Studio laden plus Takt bis 38,5 s,
    - Bewegung 6,8 s,
    - Tetrapoda laden plus 4 Gänge 9,6 s.

## Lokaler Entwurf (vor der Korrektur 01:55; nicht gepusht, auf der GTX ungemessen)

Zweig `omen-w13-entwurf` af7ac356 im Klon der OMEN, `scripts/` atom-neutral (gate:betriebsgesetz grün):

1. `albedoSicht` misst alle Uhren einer Stufen-Zeile in EINEM Gang (21 → 11 Gänge), und der Vor-Pass jedes Schusses liest keine Pixel mehr.
2. `messeLabor` misst die 7 Studios zugleich.
3. diag-tier-gang lädt Körper-Studio und Tetrapoda beim Start und misst den Tier-Gang neben der Null-Welt. Nur der Takt des Körper-Studios wartet auf die Spur der Welt.

Auf Zuruf gebe ich ihn als Zweig unter anderem Namen oder als Patch heraus.

Status ZWISCHENSTAND. Offen: alle vier GTX-Hälften, bis der Kopf des Champions kommt. Den messe ich dann hier mit `run --nur` derselben vier Stationen.

## Champion-Kopf 5a7cff0d (Stationen w13-gtx-proben-pm 90dced1d), GTX 02:52–02:58, Schloss 5,9 min

- **material.K3#2: gemessen nach 48,6 s, in der Sache ROT.** Die Welt-Seite war nach 48,5 s fertig (29 Zeilen, Karte 0,1799). ROT macht der Stoff: fichte@0.5 Karte 1,173 und birke Karte 0,944, Soll 0,95–1,05.
- **material.K1#2: UNGEMESSEN an der Frist 84 s.** Die Welt-Seite war nach 64,7 s fertig, das Labor stand bei 84 s noch offen (`Target closed` beim Abbau).
- **tiere.K3#2: UNGEMESSEN am Deckel 45 s.** Das Bild war nach ~25 s fertig, tier-gang GRÜN nach ~42,8 s. Der Querhang schrieb bis 45 s keine Zeile (seine Datei ist leer): Sein eigener Null-Welt-Boot mit der Prüfbühne läuft jetzt neben dem schnelleren tier-gang und ist der lange Teil.

Messdatei `meisterkarte-quelle/punkte/messung/5a7cff0d-gtx.json`, Roh-Ausgaben in `roh/5a7cff0d-gtx/*.out`.

## material.K2#1 am main 25374f6f (z251, mikro-schirm), GTX 06:09–06:14, Schloss 5,0 min

- **material.K2#1 GRÜN nach 66,3 s** (Deckel 90 s). Boden 0,5/1/2 m: nyquist 0,160/0,176/0,173, glatt 0,065/0,037/0,027. Fels 0,5/1/2 m: nyquist 0,166/0,156/0,164, glatt 0/0,071/0. Alle Arme stimmen (0,498/0,998/1,996 und 0,494/0,99/1,984), Adapter nvidia/pascal.
- Den knappsten Wert hat der Fels auf 1 m: nyquist 0,156 gegen das Soll 0,15.
- In den Bildern ist der Boden zwischen den Halmen körnig und hell, der Fels trägt Korn (`roh/25374f6f-gtx/material.K2_1.json.d/boden-0.5.png`, `fels-1.png` auf der OMEN).
- Teile: Wiese 2,5 s, Einschwingen 1,3 s, drei Boden-Schüsse 0,5 s. Genesis kalt 12,9 s, der Gang an den Fels 6,5 s, Einschwingen 2,8 s, drei Fels-Stände je 1,2–1,6 s plus Schuss 0,4 s. Der Rest der 66 s sind die Aufrufe der Werkbank.
- Die Sitzung meldet: Die Probe ließ die Welt verändert zurück, ohne `mutiert` zu tragen (`wege +1 [-119.1,-274.9,279.2,201/272]` an Genesis). Die Grundstellung folgte.
- Zum Abgleich: `zug/fortschritt-radeon.txt` meldet am selben main um 06:11 `material.K2#1 ROT 1.1`. Die Messdatei der Radeon liegt noch nicht in koordination; den Grund habe ich nicht gelesen.

Messdatei `meisterkarte-quelle/punkte/messung/25374f6f-gtx.json`, Roh-Ausgabe `roh/25374f6f-gtx/material.K2_1.out`.

## Dauerauftrag 10:15: GTX-Stationen je Kopf von main

Je Kopf eine Zeile. Gemessen wird mit `punkte.cjs run --sha <Kopf> --geraet gtx --nur <Scheibe>` aus einem frischen Checkout von punkte-maschine, in Scheiben nach der Liste des Koordinators (je Scheibe eine Sitzung, Zwillinge zusammen), jede erst, wenn die GPU frei ist. Die Messdatei je Kopf liegt in `meisterkarte-quelle/punkte/messung/<sha8>-gtx.json` (punkte-maschine und koordination), die Roh-Ausgaben in `roh/<sha8>-gtx/`.

- **a4dc2a45** (10:18–10:43, 3/5 Scheiben, Schloss Σ ≈ 21,9 min, punkte-maschine 772f325a): grün 1 (material.K2#1) · ROT 3: tiere.K1#2 … Bild-Serie „Herde am Hang“ ROT am Hang 21.8° -522.1/-848.3, Flucht bei 15.6 m: 43 m 5/5 fliehen, 3 sichtbar, 1 Fleck(en) (88 px) · 47.6 m 5/5 fliehen, 5 sichtbar, 1 Fleck(en) (265 px) · 52.1 m 5/5 fliehen, 5 sichtbar, 1…; leib.K1#2 schlechtester von 1 Läufen p95 ms ego/gehen 107.4 · third/gehen 77.3 · ego/springen 34.8 · third/springen 31.7 · ego/einsteigen 71.2 · third/einsteigen 29.2 · ego/hieb 58.2 · third/hieb 45.9 · Bild 16.85 ms; siedlung.K4#2 W1 ✅ 1/- 12→37 37/37 1993 · 2/- 12→36 36/36 2011 · 3/- 12→37 37/37 1981 · 5 · W2 ✅ · Ort dorf 1412 12/12, Haus gesetzt, Kern ja · 1500 s: 1412 → 1744, Häuser 12 → 20/21, die alten 0.917 · Ring 9 neu, Median 22 m vom Hau… · ungemessen 7: material.K1#2 (Frist der Probe 84 s gerissen); material.K3#2 (Frist der Probe 84 s gerissen); tiere.K3#2 (Deckel 45 s gerissen); leib.K4#2 (Frist der Probe 39 s gerissen); vegetation.K4#2 (Deckel 45 s gerissen); siedlung.K1#2 (Frist der Probe 39 s gerissen); physik.K2#2 (Deckel 45 s gerissen) · nicht gefahren 6 (abgelöst von 341ad089): studios.K2#2, studios.K3#2, studios.K4#1, ferne.K1#2, gelaende.K2#2, bauen.K1#2
- **Befund 10:46 (punkte.cjs, Sitzung):** Nimmt `gpu-lauf.sh` einer laufenden Sitzung das Schloss (VERDRÄNGUNG für einen wartenden echt-Job), merkt die Sitzung das nicht. Sie fährt die nächste Probe an der fallenden Welt weiter und bucht deren Abriss als ROT. Beispiel: 341ad089 Scheibe C, z258 echt c4785981 wartete 10:46:07, Verdrängung nach 169 s. Gebucht wurde `studios.K4#2` ROT (schmiede „Navigating frame was detached“), `leib.K3#2` als OFFEN („die Welt der Sitzung trägt nicht mehr“). Nach dem Gesetz von punkte.cjs (ein Lauf ohne Schloss ist ungemessen, nie ROT) habe ich das ROT in `341ad089-gtx.json` nach `ungemessen` umgetragen (punkte-maschine 0a0a99ea), das alte Urteil steht unter `vorher`. Der Wächter fährt eine verdrängte Scheibe jetzt einmal ganz neu. Der Messplatz-Dienst und andere Sitzungs-Läufe tragen dieselbe Lücke.
- **341ad089** (10:43–11:27, 3/3 Scheiben, Schloss Σ ≈ 27,6 min, punkte-maschine 9139225d): grün 1 (wetter.K3#2) · ROT 1: leib.K3#2 … ROT: ego 1.5 m: Abfall 0 /m außerhalb der REF [0.17; 0.57], ego 2.5 m: Abfall 0 /m außerhalb der REF [0.17; 0.57], third 1.5 m: Abfall 0 /m außerhalb der REF [0.17; 0.57], third 2.5 m: Abfall 0 /m außerhalb der REF [0.1… · ungemessen 10: leib.K4#2 (Frist der Probe 39 s gerissen); studios.K4#2 (Frist der Probe 84 s gerissen); fahrzeug.K2#1 (Deckel 45 s gerissen); material.K3#2 (Frist der Probe 84 s gerissen); siedlung.K1#2 (Frist der Probe 39 s gerissen); vegetation.K4#2 (Deckel 45 s gerissen); bauen.K1#2 (Frist der Probe 84 s gerissen); studios.K2#2 (Frist der Probe 84 s gerissen); studios.K3#2 (Frist der Probe 84 s gerissen); licht.K3#2 (Deckel 45 s gerissen) · vom echt-Job verdrängt und neu gefahren: C 10:46 (Versuch 1; z258 echt c4785981: studios.K4#2 ROT „Navigating frame was detached“, leib.K3#2 OFFEN)
