# UEBERGABE mess-wiese (K55-2, Welle 95)

Zweig `mess-wiese`, Kopf 38365177 (auf integ-probe 51cc19af gemergt, c6dac6fa), Worktree
`C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\mess-wiese`, Ports 8890–8899, Scratch
`C:\Users\micha\AppData\Local\Temp\claude\mess-wiese\` (Logs `vor-*.log` = vorher, `nach*-*.log` = nachher, CI-Logs `ci/`).
CI am Kopf: Run 38556427061 ([ci voll]) — beim Schreiben in der Schlange. Vorher am alten Kopf 54c78ff3: Run 38546830515 8/13.

## Gebaut (Zahlen vorher -> nachher, lokal, Null-Renderer)
- welt-orte (`scripts/lib/welt-orte.cjs`): `__weltOrte(art, opts)` + `__weltOrt`; die Mitte jeder Suche ist `WELT_MITTE`
  (der Ursprung, `__weltMitte`), nie ein Messort. Gesetze `hoehle`, `kante`, `querhang`, `hang` (`basis`, `bergab`).
- Fall-Wächter: ROT (O3 5x LEER „keine Höhle") -> GRÜN (vor-fall.log -> nach3-fall.log). Engine-Befund am neuen Ort:
  ein gestoßener Wolf glitt unter einen Überhang (Keil, Luft 1,1/0,8/0,4 m) und lag 7,65 m „im Fels". Schnitt im
  Chokepoint `_koerperSchritt` (stamm/11a.js): Luft über dem Grund bis Leib-Höhe (`_kreaturLeib().hoehe`) +
  `KOERPER_SICHT_SPANNE` 0,2 (stamm/26c.js); die Leser `_creatureGroundY` und `_kreaturStossSchritt` reichen die Höhe.
- Stand-Takt: ROT (Saum beim Gehen 4992 Einheiten) -> GRÜN, Saum 0 (nach-stand.log). Ursache: die Wiese lag 1,2 m vor
  der Zellgrenze z = -1036,8; der Gang trat über, Chunks wechselten die Stufe (K51). Der Gang geht jetzt zur Mitte seiner
  Zelle; stand-linse: Saum-Regel nur bei gleicher Zelle, neue LEER-Regel „der Gang verließ seine Zelle" (+ Selbsttest).
- Körper-Stand (CI-Form --selftest): ROT (K7 Aufbau 866 Büschel / 70 Pflanzen) -> GRÜN, K7-Umkreis wächst 120 -> 140 m.
- Fahr-Leben: 7 -> 3 Verletzungen (T2 Hang, S2 Kliff, S3 Querhang, L1 Hangfuß grün; nach3-fahr.log).
- Höhlen-Sicht: Blick hoehle 0 -> 13 963 Strahlen auf Höhle (Raum nur in Chunks der Stufe 0); Mündungen um die Mitte der
  Welt 8 in 4 km² mit Paar.
- `npm run check` EXIT 0 (check.log).

## Offen (für den nächsten Agenten)
1. Fahr-Leben S4 „Absteigen im Flug": am Kliff (Kante 5,94 m auf 3 m, -143/-109 ff.) fliegt der Wagen 0 Takte — prüfen,
   ob er die Kante erreicht (Anlauf, Bahn), S2 an derselben Kante ist grün.
2. Fahr-Leben L6 (Spieler steckt 1,68 m im Wagen, 87 Stöße ohne Fahrt-Verlust) und L8 (Lockstep 0,0018 m, Bär x ab
   Schritt 175) an der Gasse/Start um die Mess-Wiese — trotz `ankommen()`; waren schon in CI 38546830515 rot.
3. Höhlen-Sicht Blick hinaus: LOCH 16 Zellen (15,1#1, Punkt 690/46/50) + Schatten 0 Empfänger. Verdacht: die
   Höhlen-Sicht öffnet Mündungen in Chunks der Stufe 1 nicht (K51 Nah-Zone 3x3); die alte Probe ließe dieselben 16 weg.
4. Klang-Zensus (voll 10): an der neuen Wiese steht ein Dorf mit Glutbrunnen 9,9 m daneben (`S wiese: Glut trägt nicht`),
   der See ist 5 km fort (`S seeufer`). Klasse: `W.orte(wx, wz)` sucht seeufer/wald/dorf um die Wiese -> welt-orte.
5. Danach CI 13/13, dann merge-bereit.
