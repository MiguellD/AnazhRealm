# UEBERGABE mess-wiese (K55-2, Welle 95)

Zweig `mess-wiese`, Worktree `C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\mess-wiese`, Ports 8890–8899,
Scratch `C:\Users\micha\AppData\Local\Temp\claude\mess-wiese\` (Logs `vor-*.log`, `nach*-*.log`, CI-Logs in `ci/`).

## Auftrag
Fünf Proben suchten ihr Gelände VON der Mess-Wiese aus (-278/-1038, flache Aue) und fanden nichts. Schnitt: jede Probe findet
ihren Gelände-Ort aus der Welt über `scripts/lib/welt-orte.cjs` mit je einem Gesetz, kein Literal, kein Bezug auf die Wiese.
Dann CI 13/13.

## Gebaut
- integ-probe 51cc19af hineingemergt (c6dac6fa), Konflikt nur ein Kommentar in diag-koerper-stand.cjs.
- welt-orte: `__weltOrte(art, opts)` (Liste) + `__weltOrt` (erste), die Mitte jeder Suche ist `WELT_MITTE` = der Ursprung
  (`__weltMitte`), nie ein Messort. Neue Gesetze: `hoehle` (Spalte: Fels über Luft über Grund, Leib passt, Wand), `kante`
  (Kliff), `querhang`, `hang` mit `basis`/`bergab`. Erkundung: alle in < 1,2 s gefunden (Scratch `erkunde1.json`).
- fall-waechter: O1/O2/O3 + Zensus aus `hoehle`; wandUm/leibPasst/spaltenUm fielen (das Gesetz lebt in welt-orte).
  ENGINE-BEFUND: `_koerperSchritt` (stamm/11a.js) liess einen Wolf unter einen Überhang gleiten, der niedriger als sein Leib
  ist (Höhle 2,6/72,0, der Keil). Neu: über dem Grund Luft bis Leib-Höhe (`_kreaturLeib().hoehe`, sonst Stufe) +
  `KOERPER_SICHT_SPANNE` 0,2 (stamm/26c.js). Fall-Wächter: 5x LEER + Wolf 7,65 m im Fels -> GRÜN (nach3-fall.log).
- fahr-leben: T2/S2/S3 aus `hang`/`kante` (kanteMin 3)/`querhang`; `ankommen()` vor L1 (Dorf), L6 (Gasse), L8 (Start).
  7 Verletzungen -> 4 (nach-fahr.log, vor ankommen/kanteMin), Lauf mit ankommen: nach2-fahr.log.
- hoehlen-sicht: Mündungs-Quadrat um die Mitte der Welt, der Höhlen-Raum nur in Chunks der Stufe 0.
  Blick hoehle 0 -> 13 963 Strahlen auf Höhle. OFFEN: Blick hinaus LOCH 16 Zellen (15,1#1, Punkt 690/46/50, eine
  Höhlen-Zelle in einem Chunk der Stufe 1 — Verdacht: `_hoehlenSicht`/`_hoehlenHinaus` öffnen Mündungen in Stufe-1-Chunks
  nicht, seit K51 die Nah-Zone 3x3 ist) + Schatten 0 Empfänger (nach-hoehle.log).
- stand-takt: der Gang geht zur Mitte seiner Zelle (st.yaw), die Saum-Regel verlangt zelleGleich, neue LEER-Regel
  „der Gang verließ seine Zelle" + Selbsttest. Befund: an -278/-1038 lag die Zellgrenze 1,2 m voraus (z = -1036,8).
- koerper-stand K7: der Umkreis wächst 120 -> 240 m in 20-m-Schritten bis 1000 Büschel / 100 Pflanzen (K7_UMFANG).

## Offen (Stand dieser Datei)
- klang-zensus (voll 10): `S wiese: Glut trägt nicht` — an der neuen Wiese steht ein Dorf mit Glutbrunnen 9,9 m daneben
  (Orte.dorf -283/-1036); `S seeufer` — der See ist 5 km weit (2381/-5191, ufer 10 m/0,21). Klasse: die Orte der
  Klang-Tour (seeufer, wald, dorf) suchen um die Wiese (`W.orte(wx, wz)`) -> auf welt-orte umstellen.
- hoehlen-sicht Blick hinaus (s.o.).
- CI noch nicht gelaufen mit diesem Stand.
