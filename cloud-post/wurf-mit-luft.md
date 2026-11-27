# Stand-Blatt der Bahn `wurf-mit-luft` (Sprosse `karte2.same.physik.flug#1`)

## 27.11. 16:10 Macher — Vorprüfung 1 (auf main 7e73426e), danach Wartezimmer

- Geschnitten: `_freiLuftPacken` merkt den Wind je Körper (FREI.luft.windM 1 m, windS 0,1 s); Linse `diag-fahr-leben` frei-luft-preis + Mutante; Stations-KANDIDAT (Rechnung mit v − Wind am Ort) unter `cloud-post/wurf-mit-luft-station/`.
- Gemessen: 200 fallende Kisten 1,84 → 0,61 ms je Schritt (ohne Luft 0,46) · Station alt am Kopf 3,05 / 109,94 ROT, Kandidat 2,91 / 1,08 GRÜN · Fallzeit 2 m Stein 0,65 s ↔ Feder 1,50 s · Fass-Schlaf 0,95 s = 0,95 s.
- Statik grün, format/lint grün, gate:webgl-probe und gate:stand-takt lokal GRÜN (probeUrteil). `zug.sh probe-tag` NICHT gefahren: das Werkzeug liegt weder auf main noch roh in koordination (404).
- Offen: die Station liest den Schnitt nur mit dem Kandidaten (Zweig punkte-maschine, sein Dienst); ρ der Luft an der Höhe → `same.physik.flug#6`.

## 27.11. 15:20 Macher — WIP 2: der Preis des Winds geschnitten, Stations-KANDIDAT liegt

- Preis-Täter: der Luft-Term fragte je wachem Körper je Schritt den vollen `_windAt` (5,6 µs: Wetter-Feld 3,8, Böe 2,5). 200 fallende Kisten (Werkbank, ABAB, getrimmtes Mittel, Uhr läuft): main 1,58–2,06 ms je Schritt, ohne Luft 0,45–0,51.
- Schnitt (`stamm/koerper-frei.js` `_freiLuftPacken`): der Körper merkt seinen Wind (`K.wind`) und fragt neu nach FREI.luft.windM 1 m quer oder windS 0,1 s Uhr (Böe λ 164 m, im Sturm ≤ 5 % in 0,1 s). Nachher 0,57–0,76 ms.
- Station am Kopf: alt 3,05 / 109,94 (der Wind); KANDIDAT (Rechnung mit v − Wind am Ort) 2,91 / 1,08, Mutante Luft aus → 1033 % ROT. Unter `cloud-post/wurf-mit-luft-station/`.
- Fallzeit aus 2 m: Stein 0,65 s · Feder 1,50 s (Vakuum 0,64; ohne Luft beide 0,633).
- Schlaf: Fass aufrecht aus 1 m schläft nach 0,95 s in main · Kopf · ohne Luft, je Wind 0 / 1,05 / 5 m/s.
- Linse: `diag-fahr-leben` L5 frei-luft-preis (20 Körper, 30 Schritte: 100 Fragen, Soll ≤ 120; Mutante ohne Merken 600 → ROT), Selbsttest grün, die Linse am Kopf grün (3 min 37 s).

## 27.11. 14:05 Macher — WIP 1: die Täter-Zahl am main 7e73426e

- Gefahren: der Rumpf der Station S1 (`wurf`, Leiter „same.physik.flug“ im Zweig punkte-maschine, wörtlich) in der Werkbank (`node scripts/werkbank.cjs start --holz kienspan --ort wiese`, swiftshader), am main 7e73426e.
- Ergebnis wörtlich: `stein_abw_pct 3.03 · feder_abw_pct 108.48` — Feder 1,056 m gegen Rechnung 0,507 m, Stein 11,606 m gegen 11,265 m. ROT an der Feder, aber NICHT mehr 2 260 %.
- Der Löser KENNT die Luft schon: `stamm/koerper-frei.js:1164 _freiLuftPacken` (½ ρ c_w A / m, ρ = vehicle:FAHR.luft.rho 1,2, c_w Hoerner 1,17/1,05) und `:1318` der implizite Widerstand in `_freiZiehen` gegen v − Wind (`_windAt` am Ort) — gelandet mit druck-schlaf-uhr (63d4d6a), samt Linse `diag-fahr-leben` frei-luft / frei-luft-wind / frei-mutante. Die Zeile der Station („der Löser kennt keine Luft, :421“) ist veraltet.
- Gegenprobe, derselbe Rumpf, nur der Wind am Ort auf 0 (`_windAt` → ms 0): `stein_abw_pct 2.83 · feder_abw_pct 0.44` (Feder 0,504 gegen 0,507 m).
- Täter also: die RECHNUNG der Station rechnet in stiller Luft, die Welt weht an der Wiese mit 1,05 m/s (`_windAt`, Richtung 0,37/0,93) — die Feder treibt im Wind 0,55 m weiter, wie sie soll.
- Nächster Schritt: Stations-KANDIDAT (die Rechnung mit v_rel = v − Wind am Ort, derselbe EINE Wind-Leser) unter `cloud-post/wurf-mit-luft-station/`, Fallzeit 2 m Stein ↔ Feder, Preis 200 fallende Körper.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.
