# UEBERGABE mess-wiese (K55-2, Welle 95)

Zweig `mess-wiese`, Worktree `C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\mess-wiese`, Ports 8890–8899,
Scratch `C:\Users\micha\AppData\Local\Temp\claude\mess-wiese\`.

## Auftrag
Fünf Proben suchten ihr Gelände VON der Mess-Wiese aus (-278/-1038, flache Aue) und finden nichts. Schnitt: jede Probe findet
ihren Gelände-Ort aus der Welt über `scripts/lib/welt-orte.cjs` mit je einem Gesetz (Höhle, Hang, Kliff, Quergefälle, Saum),
kein Literal, kein Bezug auf die Wiese. Dann CI 13/13.

## Stand
- [x] integ-probe 51cc19af hineingemergt (c6dac6fa), Konflikt nur ein Kommentar in diag-koerper-stand.cjs
- [ ] Fall-Wächter O3 (keine Höhle um die Wiese)
- [ ] Höhlen-Sicht (Blick hoehle zeigt keine Höhlen-Fläche, Blick hinaus stumpf)
- [ ] Fahr-Leben T2/S2/S3/S4/L1/L6/L8 (kein Hang, Klippe, Querhang)
- [ ] Stand-Takt GEHEN (der Saum geht ohne neuen Anker)
- [ ] Körper-Stand (Wolf und Fuchs im Gang)
- [ ] Klang-Linse voll 10 (S wiese Glut, S seeufer) — prüfen, ob geerbt

CI am Kopf 54c78ff3: Run 38546830515, 8/13 (rot voll 1, 4, 7, 9, 10). Logs im Scratch `ci/`.
