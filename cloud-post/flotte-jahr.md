# flotte-jahr — ZWISCHENSTAND (WIP, Übergabe)

Zweig `flotte-jahr` ab main 1feab29c6. GPU-Proben: KEINE gelaufen (keine Run-ID); CI: keine (WIP `[skip ci]`).

**Geschnitten**
- vehicle-core `flotte(n, same, jahr)` → je Wagen {gattung, epoche} aus `bestandImJahr` (Fisher–Pry je Stufe `wandel`: Rad −3300/600, Pferd 1400/400, Motor 1915/20, heute 1955/20, Zukunft 2120/40); ohne Jahr byte-gleich (Lehre 11). `zug.art` rind/pferd.
- Wirt (stamm/siedlung-verkehr.js): `VK.jahr = plan.jahr + spanne`, Bau mit `studioOv.epoche`, Deckel `W.vmax` aus exportDrive (vGang), Zugtier-Wagen ohne Tier → `VK.stehen` (kein Fahrer, fährt nie leer); wer fährt, wählt den Wende-Platz zuerst.
- `_dorfWort` („dorf S N jahr J“) in Werkbank, band-urteil, stadt-/kreatur-/fahr-proben; `_ortPose` trasse fällt auf den stehenden Wagen.
- Linse VK-E in diag-fahr-leben (Gesetz-Probe der Flotte + Zeit je Wagen beim Namen), Selbsttest GRÜN mit Tätern (`bus`, `sprung`, Epoche≠Jahr, leer fahrend).
- diag-takt T11: das Prüf-Netz trägt `stehen: []` (sonst würfe `_verkehrFort`).

**Gemessen** (Seite, swiftshader)
- stadt-voll „dorf 7 300“ (1290+): vorher 21 heutige Wagen (SUV, Supersport) fahren → jetzt 0 fahren, 21 stehen (Ochsenkarren/Kutsche, ohne Gespann).
- „dorf 7 300 jahr 1910“ (Jahr 1922): 17 Motorwagen fahren, 3 Kutschen stehen, 1 ohne Platz; Bahn von stadt-voll 0 m abseits, bahn[0] in der Spur.
- „dorf 7 280 jahr 1910“: soll 19 (< 20), 16 fahren, 3 stehen.
- Checks lokal: diag-atlas --check · stamm:lint · lint · format (stamm) GRÜN; diag-fahr-leben --selftest/--kern GRÜN.
- Sprossen: mensch.fahrzeug.gestalt#1 und erleben.kopplung.epoche-ganz#3 NICHT gebucht (Bild fehlt). Karte 2 gebucht 58 von 1 718.

**Offen mit Adresse**
- VK-Messort: im Gründerzeit-Plan am Anker von stadt-voll fällt die Wende kp3 (971/97), Strecke s3 kreuzt die Stufe 955,4/137,9 (stamm/siedlung-verkehr.js:102–107) → VK-Zeile „Wenden 3 an 4 Enden“ ROT. `VERKEHR.ort = "stadt-1910"` steht in diag-fahr-leben, der Messort fehlt noch in spec/profiband/haushalt.json.
- Zugtier: tetrapoda-core.js:62 `GATTUNGEN` ohne rind/pferd; Ofen koerper-leib.js:1040 `_ofenKreaturDials`.
- Lieferung stehender Wagen (keine); Bewohner lesen das Gründungsjahr (siedlung-bewohner.js:314); Vorrat wärmt keine Epochen-Leiber vor (studio-gestalt.js:657).
- Karte-2-Stationen an stadt-voll mit fahrender Flotte: pflicht C#1 g5.js:6421, C#2 g6.js:4029, lenker S1 / gestalt S1 k2-mensch-fahrzeug.js:786/:715, handel S1 k2-mensch-wirtschaft.js:654 (Zweig punkte-maschine).

**Nächster Handgriff**: einen Anker suchen, an dem das Gründerzeit-Netz von „dorf 7 300 jahr 1910“ ganz ist (Sonde seriell, nie parallel: andere Samen als 7 rissen den Container, Exit 137), Messort stadt-1910 in haushalt.json, `node scripts/diag-fahr-leben.cjs --verkehr`, dann Push mit `[gpu-probe: bild:stadt@0.5, bild:stadt-voll@0.5, bild:stadt-1910@0.5] [ci voll]` und die Bilder vorher (koordination probe-post/fahrzeug-gattungen/bc5bbebd-stadt-voll-0.5.png, w28-verkehr-bild/71bb1587-stadt.png) gegen nachher.
