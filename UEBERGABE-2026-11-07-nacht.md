# ÜBERGABE 07.11. 23:15 — Konto 9 (Woche 14 %, Reset 12.11. 18:00)

## Stand
- **main cbe910ed** (z303). Heute gelandet: z296 185e99bb (abnahme-sicht-3, innen-regen, laub-unten), z300 e84fd1fb (schmiede-heil, lack-spiegel, fahrt-ziel-2), z303 cbe910ed (t4-heil, fern-hang, leib-takt, blick, gpu-probe).
- **Gebucht 218/330 am e84fd1fb** (21:29), ehrlich 217 (Rückfall lod.K2#1 — Rest = Wald-Karten-Geburt am 216-m-Rand, Fund-Register). Meisterkarte-Artifact **BJk5eWsqBiLnS6o3Cns6QK** v2 (Konto 9; Republish über einen Hilfs-Agenten, der die Seite liest).
- **Messung am cbe910ed bestellt:** Radeon (nach der Ernte e84fd1fb --offen) ferne.K4#1, leib.K1#1, leib.K4#2, lod.K2#1, spielgang.K3#1, ankunft.K2#1; OMEN GTX leib.K1#1/#2, leib.K4#2, ferne.K4#1. Danach buchen (`BUCHE_KOPF=<sha40> bash artifacts/profiband/werkzeug/buche.sh`) + `woche=`-Zeile in zug/budget.txt + Artifact neu.

## Schlange (Werkzeuge in %TEMP%/claude/w3, Start immer `nohup bash … & disown` — setsid fehlt)
- z304 CI-Diät + Dorf-Reload: am Einlass abgewiesen (alter roter Volllauf). w22-ci-diaet bekommt main gemergt (lokal 22bd0184) + Decke-Nachzahlung (+262 → ≤ 0) vom CI-Champion, dann NEU als Zug: `w22-ci-diaet w22-dorf-reload`.
- z305 leib-bau + ankunft-takt (wartet auf z304w), z306 zeitraffer (wartet auf z305w). zug-weiter je Zug läuft (Wackler-Liste inkl. Ego-Schatten).
- Abgewiesen mit Post im Briefkasten: laub-jahr-fern (Boden-WGSL 100 211 > 100 000), gang-hitch (welt-boot `_weltOffenAkte` fehlt), wald-kosten (Dorf-Bild weicht ab), haar-arm (haar.K1 arm 0,41).

## Arbeiter
- Lokal: Wiesen-Champion (w22-wiese-nachzug d20c396a: Ferne als „Schale“, +2,7 % Dreiecke, Welt steht; wartet auf Radeon-Messung vegetation.K1/K2 + See-Bild; danach Paket wiese-nachzug + pop-heil b9f48350 → GTX-Probe), CI-Champion (Decke).
- Cloud (dieses Konto): zug-auswahl (+ Schulden-Netz statt „nachts“), regel-inventur (bericht/regel-inventur-0711.md: welche Schwellen schützen, welche bremsen — Schöpfer entscheidet), laub-jahr-fern, gang-hitch, fern-hang/leib-bau/ankunft (abgegeben).

## Gelernt heute (Schöpfer)
- Züge schneller: gemessen 278 min/Zug (194 CPU, 69 swiftshader, 15 echt); CI-Diät 263,6 → 181 min (−31 %) + Zwillinge −28 min; Zeitraffer nur 1,11× (Linsen rechnen wirklich); Hebel = Zug-Auswahl nach Diff + weniger Boots.
- Alle Bild-Arbeit auf echte GPUs: Label `gpu-probe` auf OMEN (21) und Radeon (22); `[gpu-probe: gate:x, bild:ort]` im Commit → probe-post/ + cloud-post/. Brief-Baustein: `zug/brief-gemein.md`.
- Radeon nie leer (22:20 lief sie 1 h leer): Bulk-Ernte auf die Radeon, OMEN nur GTX-Pflicht; Abgabe-Wache nach jedem Ende neu.
- Effizienz-Tafel im Blick (`node %TEMP%\claude\w3\w22-blick\artifacts\profiband\werkzeug\messplatz-blick.cjs`): Pflicht zuerst, ehrliche Punkte, Punkte/Wochen-%, Fluss (Rot-Quote 67–71 %, Abgabe→Landung ~4 h).
- Lokal messen nur ohne lokale CPU-Champions (falsche Rote: spielgang.K3#1, ankunft.K2#1, fahrzeug.K2#1-Deckel).

## Nachtrag 08.11. 02:45
- **main ec87c828** (z309: wiese-nachzug Schale + pop-heil). Davor z306 a7a9d7bf (CI-Diät + Dorf-Reload). Gebucht 218 am cbe910ed. Die Radeon-Ernte --offen am a7a9d7bf läuft seit 00:21; danach misst sie gezielt am ec87c828 (vegetation.K1/K2, lod.K1/K2). Dann buchen.
- **Schlange:** z310 = ankunft-kalt (GTX 22,8 → 19,4 s, Radeon 15,0 → 13,0 s) + geh-bild (Gehen-Bild Radeon 67 → 42–50 ms). z311 = wasser-fix (Pegel faltet Front-Vergangenheit, Ufer steht) + s0-ms (S0 in ms, Zeichen-Decke weg) + laub-jahr-fern + wald-geburt (Pop GTX 0,062 → 0,030 %). Startbefehl immer `nohup bash … & disown`; zug-weiter2.sh trägt die Wackler-Liste ohne Tier-Gang.
- **Täter:** leib-bau fällt am Tier-Gang-Spielplatz, 6/6 nur in Zügen mit ihm. Post ging raus, er fährt nach der Heilung allein. zeitraffer reißt Takt-Wand T9 (Boden-Strom 53 statt Kappe 3); die Post ging an die Zeitraffer-Cloud.
- **Cloud aktiv:** geh-bild, wald-geburt, ankunft-kalt (alle abgegeben, können nachlegen). regel-inventur baut w22-wanduhr (Wanduhr → Bau-Ereignis, DECKE weg). zug-auswahl baut Vorlauf/Nachlauf (die Auswahl allein wählt im Median 95,6 %, landet so nicht). zeitraffer heilt T9, dann w22-pruef-welt (Feld in Welt-Zeit, Regler fest in Linsen, keine 320er-Fenster für Bild-Urteile). fern-hang macht w22-fern-hang-2 (ferne.K4#1 0,64).
- **Gelernt:** Vor „chronisch auf main“ die Zweig-Listen der roten Kandidaten schneiden. Der Nexus ist am See nicht der Täter (gemessen). Der S0-Befund für B: Boden-Pipeline kalt 1,1 s GTX / 0,7 s Radeon.
- Abgabe-Wache: `abgabe-wache9.sh` (neue Zweige drin), nach jedem Ende neu starten.
