# Übergabe 27.10.2026, 20:55 — Notbremse bei 98 % (Konto 2)

**Stand:** main = integ-probe **19606f2e** (V18.546.112, Zug z54: tk1-herde, lk2-hang, pbk4-fahrt, mp-leitung). Gebucht **119/330** am
9fa32207 (Artifact `Y6nuChFfb1dJTf7Btch4J5` v12). Pflicht-Offen A · B · C · E stehen unverändert. Chronik: `zug/plan.txt`, `zug/agenten.txt`.

## 1. Takt 13 läuft maschinell weiter (kein LLM) — ZUERST buchen

- Kopf **19606f2ee8492be703fb6aff52d4e48c9279919f**. Farm (headless) 80/81 grün in 37 min (rot nur feld.K2#2, war schon rot) — committet.
- Radeon `takt13-radeon` (33 Stationen, Laptop): bei 20:45 13/33, rot nur profiband.K4#2. Datei `meisterkarte-quelle/punkte/messung/19606f2e-radeon.json`.
- GTX `takt13-gtx` (27, OMEN, prio 1): bei 20:40 11/27 alle grün; die Datei kommt erst am ENDE des Auftrags in `punkte-maschine`.
- Die Buchungs-Schleife (Scratch `buche-schleife.sh 19606f2e…`) bucht selbst, sobald Σ > 119. Läuft sie nicht mehr (Sitzung zu):
  `BUCHE_KOPF=19606f2ee8492be703fb6aff52d4e48c9279919f bash artifacts/profiband/werkzeug/buche.sh` (die Wand bucht nie eine fallende
  Summe; `buche-verlust.cjs` nennt Verlierer), danach das Artifact neu veröffentlichen und eine `zug/budget.txt`-Zeile.
- Erwartet: siedlung.K5 +1 (Radeon #1/#2 grün, GTX #2 offen), tiere.K1 +1 (GTX #2 grün), leib.K2 +1 (GTX #1 grün nach lk2-hang),
  profiband.K4 +1 (Radeon #1 4/4 grün; GTX #1 ROT 14,6; #2 ROT: s1 geh 125,8 ms, fahrt 116,8 ms beim Sicht-Wechsel und Einsteigen).
- `aufraeumen.ps1` ist NICHT gelaufen (es räumt die Mess-Prozesse ab) — erst nach dem Ende von Takt 13, Port 4312 nie.

## 2. Cloud-Welle w2g (19:40, je Zweig X + X-koord)

| Karte | Code-Zweig | Station (-koord) | Stand | Nächster Schritt |
| --- | --- | --- | --- | --- |
| klang-k4-zwei | 230f84db (CI 21/21 an f0878d2c) | 87664f98 klang.K4#2 | headless: Motor r 1,0000, Landung 0,51 dB je m/s r 0,996, Doppler 6 Punkte Ist = Soll | Zug |
| tore-k5-welt | 6dbfb925 (CI 40570800487) | 55bd3538 tore.K5#2 | SPIEL-BRUCH geheilt: signaling-server.js:478 warf Fragmente > 128 KB; Kontrolle 10 s Timeout → 1 610 ms | Zug; GTX-Kontrolle ≤ 5 s kann am Tür-Neuladen reißen (speicher-laden.js:948) |
| halten-masse | ced1aac0 (CI lief) | 783b982a halten.K1#2 + K5#2 | Mutationen MAT.rho ×1,25 / Eisen-sigY ×1,5; Werk + Nahrung → Lebenswerte | Zug |
| schwarm | 29155b45 (`[skip ci]`! CI an 5bcd8dc0) | f7819ee0 luftwasser.K5#1 + #2 | 100 Vögel EIN Agent, 0,135 ms je Takt, 2 Befehle (headless) | `[ci voll]` am Kopf, dann Zug |
| affekt-wert | ca78ef74 | — | Hand-Taten + Umstellen im EINEN Situations-Term | Notbremse gesendet; Zweig lesen, Station bauen |
| mensch-begegnung | cfc7b534 | — | Zuwendung 0,267 s, Abstand 1,457 → 1,855 m nach Gewalt | Station mensch.K5#1 fehlt |
| speicher-zwei | f36c9e54 | — | Stand fragt nur seinen Augenblick, Versand im nächsten Fenster | Notbremse gesendet; Zahl fehlt |
| bauen-k5-verben | 64f26bb2 | — | gesetztes Haus öffnet die Tür wie das Dorf-Haus, L-VERBEN je Werk | Notbremse gesendet; Station fehlt |

Die Cloud meldet kein Ende: Zweige per `git ls-remote`, die Übergabe steht im letzten Commit-Rumpf. Zug:
`FAHRT_OHNE_PUNKTE=1 bash artifacts/profiband/werkzeug/fahre.sh z55 klang-k4-zwei@<sha> tore-k5-welt@<sha> halten-masse@<sha> schwarm@<sha>`
(Einlass: eigener Code-Check am SHA ohne roten Job). Danach die -koord-Zweige in `koordination` mergen (`punkte.cjs selbsttest`),
Takt 14 am neuen Kopf: genannte Stationen klang.K4#2, tore.K5#2, halten.K1#2, halten.K5#2, luftwasser.K5#1/#2 + was R6 alt macht.

## 3. Lehren dieses Abends

- Die OMEN schreibt ihre Datei erst am Auftrags-Ende: einen großen GTX-Auftrag in zwei teilen, sonst wartet die Buchung ~3 h.
- Nach jedem Zug macht R6 fast alle Stationen alt (Σ trocken 86 statt 119): der Hebel bleibt R6d + Domänen entfilzen
  (Zweig `r6-domaene-koord`, Bericht `bericht/2710-r6-domaene.md`, Gedächtnis wochen-reflexion-2710).
- Cloud-Karten mit GPU-Station sind halb, bis Radeon und GTX urteilen.

## 4. Offen mit Grund

physik.K2#2 Bild ≠ Kollision (Wagen 6,1 cm, Bär 17,1 cm in der Mauer) · fk1-ton bricht die Luft-Wand auf der echten GPU ·
material.K2#1 rot auf beiden GPUs · profiband.K4#2 (Frames > 100 ms beim Sicht-Wechsel und Einsteigen) · feld.K2#2 (Peers: Teil-Simulationen,
Reload im Sturm) · leib.K4#2 (Kamera im Haus) · Stand-Takt-Rest 2/9 · K8 fein hang · Prägung-Welt · Kreatur-Linse Teil 1.
