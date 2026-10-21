# Bericht 2110 GTX-Messschuld (OMEN): je Kriterium EINE Messung am integ-Kopf aff61247, kein A/B

**Status: ZWISCHENSTAND.** Gemessen von einem frischen Messer; sein Entwurf wörtlich unten. Rohdaten auf der OMEN in `p3/n2110/messschuld/`; Zweig `albedo-frische` Kopf 188a9c7a [ci voll] (Zweig-CI ungelesen).

---


Kopf der Messungen 1–3: integ-probe aff61247 (V18.546.45), n2010-b2b sauber; GTX 1060, je Kriterium EINE Messung, kein A/B. Roh: `p3/n2110/messschuld/`.

## 3 Ferne K1/K2 Staffel 1 — `gate:luft-tiefe:echt` (Port 4496), EXIT=0
- LUFT GRUEN · K1-1 GRUEN · K1-2 ROT (Farbton) · K2-1 GRUEN — Zeilen byte-gleich zum CI-Urteil an 749ddc27.
- Koschmieder T/T_soll Uhr 0,5 (45 Werte, alle Kanäle/Azimute/Bänder): 0,858–1,076 (Band ±15 %).
- Δβ blau−rot × Referenz (Band 0,5–1,5): Uhr 0,5 Az 0/90/180/270: 0,87 · 1,04 · 1,19 · 1,03; Uhr 0,27: 0,98 · 0,98 · 0,78 · 0,97.
- Rand-Restkontrast Uhr 0,5 (Soll ≤ 0,02): 0,0127 @ 19,4 km · 0,0108 @ 21,8 · 0,0102 @ 21,0 · 0,0108 @ 17,4.
- Farbton 8 km (Soll ≤ 10°): Uhr 0,5: 21,2 · 26,4 · 28,6 · 25,2°; Uhr 0,27: 0,3 · 2,2 · 13,3 · 3,5° → ROT (5/8). Roh: `luft-tiefe-aff61247.json/.zahlen.json/.log`.

## 1 M27 Fahrzeug K3 — Tempo-Rig in der Welt, `start --echt` 1920×1080, EXIT=0
- `tempo3.js` = tempo2.js + Tempo-Spion (fahr-proben) + Drift; Treiber `echt-eval.cjs`. Alle Maße im Soll, gleich zur Radeon (+9,4°/+18,2 %).
- Ruhe FOV 75,00° · Arm 9,89 m; vmax 15,10 von 16,00 m/s (Gesetz): FOV 84,42 (+9,42°, Soll ≥ 8) · Arm 11,70 (+18,3 %, Soll ≥ 15 %).
- FOV bei 10 m/s +4,79° (Soll ≥ 3,2) · camera.fov = Ruhe + Tempo (zeigt 0,005°) · Quelle = Gesetz des Wagens.
- Rückkehr: Maus-Orbit 69°, zurück in 1,10 s (Soll 1–1,25).
- Drift (Gas + D bei vmax, 120 Bilder): Schlupf bis 23,6°, Kamera ≤ 10,9° neben dem Fahrtvektor (Soll ≤ 15), im Schlupf-Gipfel 3–5°.
- Bilder angesehen: `tempo-welt-gtx-aff61247-1-stand.jpg` (Stamm neben dem Wagen), `-2-vmax.jpg` (FOV weiter, Laub verschmiert), `-3-drift.jpg`
  (Steinhaufen schneidet die rechte Flanke). Roh: `tempo-welt-gtx-aff61247.json/.log`.
- Ehrlich offen: `bahnNachStand false` (ein Baum steht nach dem Welt-Stand in der Bahn, wie Radeon); Stein-Durchdringung im Drift ungeprüft.

## 2 M26 Gelände K5 — `diag-koerper-stand.cjs --k8` (Null-Renderer, Port 4499), Ego/Third je EXIT=0 (Sicht per `k8-sicht.cjs`, p95 cm, Soll fein ≤ 5, sonst ≤ 3)
- Ego  wiese: fein 1,1 · streu 0,5 · **fuss 3,4** · huf 1,4 · rad 0,2 | hang 24,4°: fein 4,3 · streu 1,4 · fuss 3,0 · huf 2,2 · rad 2,3
- Third wiese: fein 1,1 · streu 0,5 · **fuss 3,5** · huf 1,5 · rad 0,2 | hang: fein 4,3 · streu 1,5 · **fuss 3,1** · huf 2,2 · rad 2,3
- Urteil: Ego 9/10, Third 8/10 Zellen im Soll; Täter = Fuß des Spielers; die Ratsche hält (gate grün). Roh: `k8-first-aff61247.log`, `k8-third-aff61247.log`.

## 4 Albedo-Frische — Zweig `albedo-frische`, Kopf 188a9c7a [ci voll] (auf integ-probe 1883d350)
- Vorher: alte Wand an aff61247 10/10 Zeilen veraltet bei EXIT=0 (`albedo-wand-alt-aff61247.log`); neue Wand gegen die Tafel von
  integ-probe EXIT=1, 20 Einträge beim Namen (`albedo-wand-neu-vorher-aff61247.log`, `…-1883d350.log`).
- Geschnitten: veraltet bricht (Exit 1, Entscheid „Sperren": ROT mit Exit 0 ist still grün, Lehre 6), jeder fremde Abdruck mit Datei, alt → heute;
  Selbsttest: zwei gefälschte Abdrücke beide gesehen (14/14). Wurzel dazu: die Versions-Stufe (`AnazhRealm.VERSION`) zählt nicht mehr
  im Code-Abdruck — sie allein machte bei jeder Versions-Stufe alle 10 Zeilen veraltet (gemessen an 1883d350).
- Re-Mint (deklariert, `spec/farbe/albedo-tafel.json`) auf der GTX am Zweig-Kopf a37a2c99: Welt `werkbank albedo --tafel` (--echt), Labor
  `--labor --echt`; 9/10 Zeilen im Soll, haut 0,86 außerhalb; Ratsche lack 0,095→0,017, fell →0,0905, Karte garage →0,583, laub von Hand
  0,008→0,057 (GTX zweimal 1,058; Radeon-Ist 0,99). Roh: `albedo/` (aff61247), `albedo-kopf/` (a37a2c99).
- Lokal: check EXIT=0 · playtest:fast EXIT=0 (21/0) · gate:albedo-tafel EXIT=0 (`waende/`); Linse `betriebsgesetz` GRÜN, scripts −45 Atome.
- Offen: jede Code-Änderung einer Zeilen-Quelle sperrt Gruppe 11 bis zum Re-Mint (`--neu` + `--nachziehen`); integ-probe 1011d41d (ruhe-karten)
  änderte schon stamm/dirigent-takt.js → Zeile fels nach dem Merge veraltet, ein Re-Mint am Merge-Kopf (~3 min GTX). 0/7 Studio-Karten im Soll.

Status ZWISCHENSTAND + Übergabe: Messungen 1–3 gebucht mit Rohdatei; 4 gepusht, Zweig-CI offen; nichts gemergt.
