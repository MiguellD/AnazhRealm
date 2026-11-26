# Post an fahrzeug-gestalt

## Koordinator 10:15 — Kopf ee58a881 ROT am vollen Playtest (Versuch 4), kein Stempel — der Fahrzeug-Stapel wird EIN Kopf

Die Probe ist GRÜN (3/3). Die Batterie trägt zwei echte rote Zeilen in `voll 1/18`:

1. `❌ Gamepad-Verben (leib.K5): Fahren: Lenkwinkel -0.122/-0.275/-0.519, Gas 0.568/1.193/1.474 m/s, Auslauf 0.325/0.502 m/s ohne/mit Handbremse, Rumble 1.000, Haftung 0.450 — ROT: gas`. Dieselbe Zeile mit denselben Zahlen steht am Kopf fahrzeug-medium 15630bf4. Dein Diff gegen main trägt den ganzen Medium-Schnitt mit (`stamm/koerper-fahrt.js`, `vehicle-core.js`, `stamm/gelaende-kollision.js`, `stamm/koerper-bewegung.js`): das Rot kommt aus dem Medium-Gesetz, nicht aus der Gestalt.
2. `❌ B-j: REIFEN — der Reifen des gestellten Wagens rollt nicht, liegt als Sehne auf und steht um W / kz frei (W die Last des Bodens) — Cannot read properties of undefined (reading '0')` (Schritt „Das Lab-Fahrprofil (N6/H7)“, `scripts/diag-vehicle-drive.cjs`). Das ist ein Lesefehler, kein Mess-Urteil: die Linse greift in ein Feld, das es am gestellten Wagen nicht gibt. Das ist deins.

`voll 18/18` Stand-Takt (DRUCK-SCHLAF 6,8 s gegen ≤ 3 s) ist das Flackern der Linse unter Läufer-Last, heute an drei Köpfen — nicht deins, der Schnitt dagegen ist bestellt.

Entscheid: Medium und Gestalt landen als EIN Kopf. Wer von euch beiden (fahrzeug-medium, fahrzeug-gestalt) zuerst den geheilten Medium-Teil hat, baut ihn — EIN Commit auf main 12029279, beide Schnitte darin, Betreff „Vorprüfung fahrzeug-stapel 1 (auf main 12029279): …“, Zweig `fahrzeug-stapel`. Der andere meldet im Briefkasten „übernommen von …“ und nimmt die nächste Front-Sprosse seiner Leiter. Seit 07:50 fasst `w28-kosmos-bahn` auf main ebenfalls `welt-licht.js` an (Mond aus eigener Ephemeride) — der Konflikt dort gehört in diesen Kopf.

Vor dem Schub: die Invariante Gamepad-Verben und das Lab-Fahrprofil lokal grün, `npm run check:statik`, Probe-Ruf wie bisher (höchstens vier Tore ≤ 480 s). Ansprüche: `karte2.mensch.fahrzeug.medium#2`, `karte2.mensch.fahrzeug.gestalt#1`. Kein Aufweichen einer Schwelle.

Karte 2 gebucht 126 von 1 718.

## 26.11. 07:38 — GPU-PROBE db966969 auf radeon-890m: ROT in 2367 s (das Bein gpu-probe endete ohne Urteil (cancelled) auf radeon-890m) → probe-post/fahrzeug-gestalt/db966969.md
