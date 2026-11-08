# ÜBERGABE 08.11. abends (vor Komprimierung) — Konto 9, Koordinator
Stand 21:00 · main 53b2fc7a (z326) · gebucht 221/330 (seit Morgen kein Punkt) · Woche ~50 % (Budget ist laut Schöpfer KEINE Grenze, mehrere Konten)

## Schöpfer-Regeln heute (bindend)
- KEINE Voll-Messung (`--offen`) mehr. Nach jeder Landung NUR die Stationen messen, die die gelandeten Zweige beanspruchen (Radeon, Minuten), sofort buchen.
- Integration ist der Engpass: jede Abgabe binnen 4 h im Zug oder mit Grund in `zug/abgeloest.txt`. Züge ohne Pause, gebündelt.
- Kein Zwilling (ein Messplatz-Blick: artifacts/profiband/werkzeug/messplatz-blick.cjs, Tab „Messplatz-Blick“).
- Referenzen der Besten je Domäne (Nanite, PSO-Caching, GPU-driven, Tsushima …) statt Versuch und Irrtum → Referenz-Atlas.
- Cloud-Karten startet der Schöpfer per Klick: nach dem Anfordern prüfen, ob gestartet.

## Züge
- gelandet heute: z322 ferne-heil · z323 karte-l2 + geh-takt · z324 ankunft-faden · z325 k6-flimmern + verkehr · z326 lod-umriss + haar-arm + gang-hitch
- z327 heim-w24-fahrt-takt ROT: gate:foundry-crossfade Selbsttest („die L1 der nahen Birke: undefined“) → w24-fahrt-takt heilt (Post gesendet), dann neu BEREIT
- z328 LÄUFT (Kandidat a6c28184): w24-rueckfall-ruhe (DIE WURZEL: _nahWieseFernKachel baute die ferne Wiese nie fertig, 11/860 → 860/860) + heim2-w20-wald-kosten + heim2-w13-verkehr-heil (Pflicht-C-Richter) + heim2-w16-studio-welt. Neulauf: Stand-Takt + Fenster-Wand rot (Stand-Takt evtl. echt am Ruhe-Fix — prüfen!)
- nach z328 automatisch: `/tmp/claude/w3/nach-z328.sh` misst gezielt (mensch.K1/K2/K5, wetter.K2, ferne.K3, lod.K5, vegetation.K3, pflicht.C, gelaende.K3) und bucht TROCKEN → `w3/buche-trocken-z328.txt`. Dann echt buchen: `BUCHE_KOPF=<sha40> bash artifacts/profiband/werkzeug/buche.sh`, budget.txt-Zeile, Meisterkarte neu veröffentlichen (Helfer-Agent a3580833ff2fc2f5f, Artifact BJk5eWsqBiLnS6o3Cns6QK).
- danach bereit/fast bereit: w24-strauch-saum (A: laub-kante alle 5 Arten ≤ 0,22 beide GPUs; merged nach z328 selbst, dann BEREIT) · heim2-w21-laub-jahr-fern + w23-pruef-welt-heim (Heimholer merged nach z328)

## Werkzeug (lokal, gesichert in zug/werkzeug-w3/)
- `w3/zug-weiter3.sh` + `zug.cjs` WACKEL_RE/--wackler-frei: Fenster-Wand und Kamera-Leib landen OHNE Neulauf
- `w3/leicht-wache.sh`: EIN ls-remote je 3 min über w24-*, w25-*, heim2-* (die alte abgabe-wache9 erzeugte Fremdlast)
- `w3/label.sh <21|22> add|del <label>`: Läufer-Labels (21 omen, 22 radeon). echt-gpu BLEIBT auf der OMEN (auf der Radeon fielen Post-Kette/Tag-Achse/Nässe falsch)
- Punkte-Maschine: pm-fremdlast (Fremdlast/Messort = UNGEMESSEN) und w24-rueckfall-kamm (ferne.K3) auf punkte-maschine gemergt

## Cloud-Sitzungen (12) — Post per cloud-post/<zweig>.md, alle mit WARTEZIMMER
w24-wiese-ferne (Bild der Ferne gegen den fertigen Bau) · w24-strauch-saum (merge nach z328) · w24-fahrt-takt (Selbsttest heilen) · heimholer (2 Merges nach z328) · w25-ankunft-block (B) · w25-stadt-takt (E) · w25-lod-pop (lod.K5 ≤ 1 px) · w25-ferne-licht (ferne.K1#2/K4) · w25-haar-albedo (haar.K2) · w25-referenz-atlas (REFERENZ-ATLAS.md) · w25-pipeline-vorwaermen (kein Shader-Bau im Bild) · w25-spike-gpu-vegetation (Spike, nicht landen)

## Lokal
- Champion (Rückfall-Reste): material.K1 + gelaende.K3 (Linsen), schatten.K5 (Bisektion e475c6b4..b492978a, Glutbrunnen wird nie gewählt)
- OMEN-RC „Koordinator Meldung [bd0b32]“: wartet; misst nur auf „Fenster offen <sha>“
- offen von mir: gpu-probe-Schalter „sichtbar“ (heftet an OMEN, werkbank --echt, Zeit nicht werten) — erst nach der z328-Messung bauen

## Ehrlich offen
Gebucht 221 seit Morgen. Zwei Voll-Messungen (≈ 4 GPU-h) brachten nichts Buchbares: Ruhe-Fehler + Sitzungs-Deckel. Erster Punkt-Zuwachs erwartet nach z328 (Ruhe → mensch/wetter/lod.K5 messbar) und z329 (Strauch → lod.K1#1).
