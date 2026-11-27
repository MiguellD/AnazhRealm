# Stand-Blatt der Bahn `wurf-mit-luft` (Sprosse `karte2.same.physik.flug#1`, nun `#2`)

## 27.11. 18:33 Macher — Vorprüfung 2 (auf main 948f68ee), danach Wartezimmer

- Geschnitten (`stamm/koerper-frei.js`): die KUGEL als dritte Gestalt des Lösers · die MAGNUS-KRAFT im Luft-Paket (C_L(S) Sawicki 2003, c_w über die Krise nach Re, Asai 2007) · der DRALL ZERFÄLLT (dω/dt ∝ ω·|u|, James & Haake; die Zahl aus dem Band 4–8 % bis zum Scheitel) · die STOSSZAHL je Kontakt aus den Stoff-Zeilen beider (`_freiPrallZahl`: η, σ_Y, E, ν; Johnson/Thornton) statt EINER Zahl 0,2.
- Gemessen, Station S2 Rumpf (Kandidat `cloud-post/wurf-mit-luft-station/`): ablenkung_abw_pct 100 → 6,86, abprall_abw_pct 77,9 → 5,59 GRÜN (Ablenkung 0 → 1,807 m gegen 1,940; Rasen 0,059 → 0,658 m, Stein 0,354 → 1,292 m aus 2 m). Mutanten Magnus aus 100 % · EINE Stoßzahl 77,9 % · ohne Zerfall 0 % → ROT. 200 fallende Kisten 0,61 → 0,55–0,65 ms je Schritt.
- Lokal auf dem Kopf GRÜN (EXIT 0, 0 Rot): `check:statik` ganz · `gate:fachwerk-contract` · `diag-fahr-leben` Selbsttest · voll · --verkehr · `gate:koerper-kern` · `diag-stand-takt` Selbsttest · Lauf · --narbe · `gate:welt-boot`; format/lint, stamm-umzug 0 Abweichung. `zug.sh probe-tag` nicht gefahren (das Werkzeug liegt nicht auf main).
- Offen mit Grund: die Volltexte des Drall-Zerfalls (403, die Zahl aus den Auszügen); die Blick-Sonde der Wolke (der GPU-Prozess der Werkbank stürzt ab) — das Bild kommt über `bild:dorf@0.5`; der Preis schneller Körper (`_freiGrund` je Schritt, 200 Kisten mit 20 m/s 12–13 ms schon am main) und der „glut“-Boden der Wiese sind Befunde außerhalb flug#2; ρ an der Höhe → flug#6.

## 27.11. 18:28 Macher — WIP 11: die Kette auf main 948f68ee + Kopf 2

- Rundbrief 17:58 gelesen (Basis ≥ 948f68ee; dazu `gate:welt-boot`, die Stall-Akte, weil ich `scripts/diag-fahr-leben.cjs` anfasse — keine Rang-Bildung von Hand in meinen Zeilen).
- GRÜN je EXIT 0, 0 Rot: `check:statik` ganz · `gate:fachwerk-contract` · `diag-fahr-leben` Selbsttest · voll (Ball: Ablenkung 8,8 %, Abprall 5,4 %, Zerfall 5,41 %; die drei Mutanten ROT) · --verkehr · `gate:koerper-kern`. Läuft: `diag-stand-takt` Trio, `gate:welt-boot`.

## 27.11. 17:55 Macher — WIP 10: buendel-b liegt im main (948f68ee, Kopf 1 darin) — Kopf 2 eingemergt, die Kette läuft

- Rundbrief 17:26 gelesen: Kopf 2 erst auf den main nach z807 — der liegt jetzt (948f68ee). origin/main eingemergt: Konflikte nur, weil Kopf 1 im Bündel als eine Abgabe kam (Basis 7e73426e); `koerper-frei.js` in main ist Kopf 1 Byte für Byte, die Linsen-Blöcke des Balls stehen auf main leer, `modul-karte.json` die main-Zeile + `_freiPrallZahl`.
- Läuft auf dem Merge: `check:statik` ganz · `gate:fachwerk-contract` · `diag-fahr-leben` Selbsttest, voll, --verkehr · `gate:koerper-kern` · `diag-stand-takt` Selbsttest, Lauf, --narbe. Dann der glatte Vorprüf-Kopf 2.

## 27.11. 17:24 Macher — WIP 9: Rundbrief 16:54 gelesen, die Linsen der berührten Dateien lokal GANZ gefahren

- Kopf 1 fährt in `buendel-b` (08098b8f auf buendel-a), kein Rot an meiner Bahn — nichts neu geschoben.
- Lehre des Rundbriefs für Kopf 2 (Stand 18252ea), lokal, je 0 Rot · EXIT 0: `diag-stand-takt` --selftest · Lauf · --narbe (der Schnitt sitzt im Luft-Paket am Wind) · `diag-fahr-leben` voll und --verkehr (21/21 Wagen) · `gate:koerper-kern` · `check:statik` ganz.

## 27.11. 16:54 Macher — WIP 8: Wartezimmer

- main steht auf bed6256c, Kopf 1 (94d60d9f) noch nicht darin, keine neue Post — Kopf 2 (flug#2, Stand 18252ea) wartet auf `buendel-abend`.

## 27.11. 16:05 Macher — WIP 7: der Drall zerfällt — der letzte offene Punkt von flug#2 geschnitten

- Befund: der Löser dämpfte den Drall im Flug gar nicht (kein Moment der Luft) — der Auftrag „der Drall zerfällt“ war nicht nur eine Quellen-Frage.
- Geschnitten (`stamm/koerper-frei.js`, dasselbe Luft-Paket): `_freiLuftPacken` 43 = drallZerfall · ½ ρ A r² / I, `_freiZiehen` dω = −(43)·|u|·ω·h implizit, nur im Zweig der drehenden Kugel (Ruhende und Drall-Freie zahlen nichts). Form nach James & Haake 2008 (dω/dt ∝ ω·v); FREI.luft.drallZerfall 0,06 aus dem Band der Messungen am Fußball: 4–8 % Verlust bis zum Scheitel (Hochgeschwindigkeits-Kamera), ≈ 10 % über den Freistoß (Goff & Carré) — die Volltexte 403, die Zahlen aus den Auszügen.
- Gemessen: Station Rumpf S2 (Kandidat) **ablenkung_abw_pct 6,86 · abprall_abw_pct 5,59 → GRÜN** (Ablenkung 1,807 gegen 1,940 m; ohne Zerfall 5,22). Linse `diag-fahr-leben` voll, 0 Rot: frei-drall-zerfall 5,41 % (Soll 4–8), Mutante ohne Zerfall 0 % → ROT; Ablenkung 8,8 %, Abprall 5,4 %.
- `check:statik` ganz GRÜN (EXIT 0), format/lint grün, stamm-umzug 0 Abweichung. Kopf 2 auf main bed6256c + Kopf 1 geprobt: legt sich sauber, nur `modul-karte.json` braucht `_freiPrallZahl` in der neuen main-Zeile.
- Blick-Sonde in der Wolke blockiert: der GPU-Prozess der Werkbank-Chromium (swiftshader) stürzt ab, die Welt steht nach 3 601 Takten nicht — das Bild kommt über `bild:dorf@0.5` der GPU-Probe.

## 27.11. 15:53 Macher — WIP 6: die Linse am Kopf gelesen, Kopf 2 wartet auf das Bündel

- Linse `diag-fahr-leben` (voller Lauf, Kopf 19d2b1a): K3#1 GRÜN mit dem Ball — Ablenkung 0,801 gegen 0,869 m (7,8 %), Abprall Stein 1,297 m (5,4 %); Mutante ohne Magnus 100 % ROT, Mutante EINE Stoßzahl 0,2 → 0,071 m, 77,8 % ROT.
- main = bed6256c, Kopf 1 (94d60d9f) noch NICHT darin — Kopf 2 bleibt WIP bis `buendel-abend` landet (Rundbrief 15:39).
- Läuft: `check:statik` ganz (bisher 0 Rot), das Bild des Balls in der Werkbank (Blick-Sonde).

## 27.11. 15:45 Macher — WIP 5: flug#2 geschnitten, Rumpf S2 GRÜN am Kopf, Stations-KANDIDAT S2 liegt

- Gelesen: Rundbrief 15:39 — Kopf 2 geht als Vorprüf-Kopf erst, wenn `buendel-abend` (mit Kopf 1) im main liegt; bis dahin WIP.
- Geschnitten (`stamm/koerper-frei.js`): die KUGEL als dritte Gestalt (Masse/Trägheit hohl, 26 Punkte + Fuss längs der Grund-Normalen, ihre Anker drehen nicht mit); die MAGNUS-KRAFT im Luft-Paket (`_freiLuftPacken` 39/40 · `_freiZiehen`: C_L(S) nach Sawicki 2003, c_w über die Krise nach Re, Asai 2007); die STOSSZAHL je Kontakt aus den Stoff-Zeilen beider (`_freiPrallZahl`: e = e^(−πη/2) des weicheren · Fließen über V_Y nach Johnson/Thornton aus σ_Y, E, ν; der Ball mit `druck` trägt mit dem Innendruck) statt EINER Zahl 0,2.
- Gemessen, Rumpf S2 (Kandidat) wörtlich: **ablenkung_abw_pct 5,22 · abprall_abw_pct 5,59 → GRÜN** (Ablenkung 1,839 gegen 1,940 m; Rasen 0,658 m, Stein 1,292 m aus 2 m). Mutanten: Magnus aus 100 % ROT, Stoßzahl 0,2 → 77,9 % ROT.
- Nebenwirkung: Steinwürfel/Kiste prallen weiter matt (e 0,18–0,34), Fass-Schlaf 0,867 s (vorher 0,95 s). Preis: 200 fallende Kisten 0,55–0,65 ms je Schritt (Grundlinie 0,61).
- Befund offen (nicht flug#2): ein schneller Körper (20 m/s) liest den Grund jeden Schritt neu (`_freiGrund` 48 µs) — 200 Kisten mit 20 m/s 12–13 ms je Schritt schon am main.
- Offen mit Grund: der Zerfall des Dralls (James & Haake 2008, die Fußball-Konstante nur im Volltext — 403).
- Linse `diag-fahr-leben` frei-drall · frei-prall + zwei Mutanten, Selbsttest GRÜN; der Lauf am Kopf läuft.

## 27.11. 15:50 Macher — WIP 4: die Täter-Zahl S2 am Kopf fd65eb6 (main 7e73426e + Kopf 1)

- Der Rumpf S2 der Station ist eine feste Leser-Zeile („keine Magnus-Kraft“) — gemessen also mit einem Rumpf-Entwurf: Fußball Gr. 5 (Kugel ⌀ 0,22 m, Leder, Wand 1,5 mm) als freier Körper, Werkbank Wiese.
- Freistoß 25 m/s, 6 m/s hoch, Seiten-Drall 8 U/s: quer **0,367 m mit Drall = 0,367 m ohne** (nur der Wind) — der Löser kennt keine Magnus-Kraft, und keine Kugel: der Ball ist eine Kiste (`_freiKoerperSetzen`: alles außer dem Zylinder), 0,37 kg.
- Abprall aus 2 m: Gras **0,059 m**, Stein-Platte **0,354 m** (die Kiste kippt) — gegen das FIFA-Band ≈ 0,60–0,85 m (Rasen) und ≈ 1,35–1,55 m (harte Fläche). Die Stoßzahl ist EINE Zahl für jedes starre Paar (STOSS.stossZahl.starr 0,2), der Stoff der Fläche spricht nicht.
- Befund nebenbei (nicht meine Sprosse): an der Mess-Wiese liest `_kontaktStoffAt` auf 853 von 900 Punkten „glut“ (`_terrainMaterialAt`), Grün 0 — der Rasen-Rumpf sucht sich darum den Gras-Fleck.
- Schnitt jetzt: die Kugel als dritte Gestalt des Lösers, die Magnus-Kraft im Luft-Paket (`_freiLuftPacken` · `_freiZiehen`), die Stoßzahl je Kontakt aus den Stoff-Zeilen beider (η, σ_Y, E).

## 27.11. 15:30 Macher — WIP 3: Post 15:15 gelesen, Sprosse flug#2 (Drall, Abprall) beginnt

- Gelesen: Kandidat gesetzt (pm 6c8627c9), flug#1 GRÜN auf der Radeon; GPU-Probe 94d60d9f 3/3 GRÜN — das Bild dorf@0.5 selbst angesehen: Dorf am Mittag, Fachwerk, Gras, Leute, nichts Fremdes (der Schnitt ist im Bild nicht sichtbar, er ist Takt).
- Berichtigung: die Uhrzeiten der Abschnitte 15:20 und 16:10 unten waren falsch geschrieben (der Container zählt UTC); der Kopf 1 ging 14:33 Ortszeit hinaus.
- Jetzt: Rumpf S2 der Station am main headless, dann der Schnitt (Magnus im Luft-Paket, Stoßzahl aus dem Stoff der Fläche).

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
