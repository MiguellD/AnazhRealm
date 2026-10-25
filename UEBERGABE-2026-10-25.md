# Übergabe 25.10.2026 (Stand 12:20 MEZ, Woche 91 %; Neustart des Limits 29.10. 18:00)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Danach diese Datei, dann `memory/woche-2410.md` (Nachträge 25.10.).

## Stand
- **main 8f1802b1** (V18.546.91; Züge 29c und 30 gelandet; z31 heim-z31 91972988 fährt per Kette, danach Mess-Takt 3 am Kopf). Meisterkarte **92/330** gebucht am Kopf 4a5f5e2c (Artifact VHRbqeZ6yA9CzqtHYWxmVp, Version 7).
- Mess-Takt 2 an 4a5f5e2c: headless 63/2, Radeon (in Ruhe nachgemessen) 28 grün, GTX 28/8.
- `buche.sh` baut die Ansicht jetzt immer und bricht ab, wenn `meisterkarte.html` die gebuchte Summe nicht trägt (bis 25.10. stand die Seite auf 76).

## Züge in Fahrt (fahre.sh, ohne Punkte-Stufe; Logs in $TEMP/claude/fahre-*.log)
| Zug | Kandidat / Zweig | Inhalt | nächster Schritt |
|---|---|---|---|
| z29c | 36c4275a = main + heim-z29b 8ada986f + gpu-wand ebda89d3 | Stoff-Tafel (stoffe.K1), Speicher-Weg (speicher.K3), Tier-Gang (tiere.K3#2 Kern), Halten K5, Kaskade (oekologie.K1#2), Siedlung-Heilung (siedlung.K3), Nässe-Fix (Regen unter Dach), GPU-Wand (3 Linsen echt) | landet bei grüner CI + echt |
| z30 | heim-z30 3d49606b (auf 36c4275a) | leib-k1-hieb, kaskade-riss-koerper, profiband-k4-haenger | fährt automatisch nach z29c (Kette `fahre-z30.log`) |

## Nach der Landung (Reihenfolge)
1. Stations-Zweige nach koordination mergen (je `node meisterkarte-quelle/punkte/punkte.cjs selbsttest`), dann `git push origin HEAD:koordination` UND `HEAD:refs/heads/punkte-maschine`:
   station-stoffe-k1 7fbf2b37 · station-tiere-k3 b4b9ef28 · station-halten-k5 94eefa83 · station-oekologie-k1 8fdafb4e · station-oekologie-k2-kaskade 5a2c453e (MUSS mit z29) · station-speicher-k3 bdd8184f · station-gpu-wand c54d022d · nach z30: Stationen der Zweige leib/kaskade/haenger prüfen (`git ls-remote origin 'refs/heads/station-*'`).
2. Mess-Takt 3 am neuen Kopf: Zeile `takt3-gtx 1 punkte sha=<kopf> geraet=gtx` in `zug/warteschlange.txt`; lokal `ZUG_PUNKTE=<koordination> bash artifacts/profiband/werkzeug/zug.sh punkte <kopf> --geraet headless` und `--geraet radeon` (ohne Agenten-Last daneben!), Messungen committen + pushen, dann `bash artifacts/profiband/werkzeug/buche.sh --warte takt3-gtx`, Artifact neu veröffentlichen (Pfad koordination/meisterkarte.html).
3. Nachwache gebündelt: `nw2628-abab` (206b395a gegen 4a5f5e2c) läuft auf der OMEN; danach eine Zeile 4a5f5e2c gegen den Kopf nach z30.

## Fertige Cloud-Zweige ohne Zug
- **klang-k1-zensus 44a50f31** (jeder Ruf hat einen Leib, VOGEL_GESETZ in tetrapoda): Konflikte in `tetrapoda-core.js`, `stamm/kreatur-leben.js`, Modul-Karte gegen z29c → Integration mit Byte-Beweis; Station station-klang-k1 e26e1836.
- **bauen-k5-verben 64f26bb2** (L-VERBEN, gesetztes Haus öffnet die Tür): Konflikt in `scripts/diag-werkstatt-weg.cjs` (main hat die Selbsttests auf `familie()` umgebaut, der Zweig ergänzt „bei Regen brennt es“) → beide Absichten ganz; Station station-bauen-k5 5529343c.
- **mensch-k3-wege**: Cloud-Karte läuft (wartete auf z29).

## Offene Befunde (benannt, mit Zahl)
- **L2a Ankunft wackelt seit main 4a5f5e2c** in CI-Gruppe 1 (7 von 13 Läufen rot, „Rundblick 6 Löcher, zuerst Takt 69 (207°): 1 Bäume werden gepflanzt“), lokal nicht nachstellbar. Verdacht: diag-ankunft Rezept „linse“ → „null“ (werkstatt-weg-ereignis 3464f4b6) oder Ankunfts-Zeit auf langsamem Läufer.
- leib.K1#2: 2 Hiebe ohne Treffer-Ereignis (Karte leib-k1-hieb in z30).
- Gelände-Ring bleibt auf der Radeon bei 2 von 4 (gelaende.K5#2 Streu 89–95 < 100), Fuß am Hang auf der Karte p95 17,5 cm (Leib K2).
- tiere.K1#2: im Ego aus 40 m 4/4/3 von 5 Hirschen sichtbar. leib.K4#1: 5 Bau-Pixel im Orbit am Haus.
- Hebel-Tafel in `meisterkarte-quelle/src/g*.js` verspricht bei ~30 Kriterien Σ Δ über der Staffel (`gen.cjs build` ROT, Ansicht baut trotzdem).
- profiband.K4#1 / speicher.K2#1 auf der Radeon rot (schon an 206b395a).

## Werkzeug
fahre.sh · zug.sh/zug.cjs (urteil gibt EINEN Neulauf) · buche.sh (Wand: Seite trägt Summe) · ci-lesen.sh · `$TEMP/claude/karte3.cjs` (Modul-Karte 3-Wege) · `node scripts/ci-zeiten.cjs` verteilt die CI-Waage (auch `--help` führt es aus!) · decke-pruef-Worktree für Paartests.
OMEN: Messplatz-Dienst mit CI-Vorfahrt je Boot, Storno je Boot/Zelle, Zeit in UTC (Befund Zeitumstellung 25.10.). Aufträge nur als Zeile in `zug/warteschlange.txt`.

## Cloud ab 12:20 (6)
ankunft-l2a-rundblick · ferne-blau-heim · gelaende-ring-wachstum · leib-k2-fuss · tiere-k1-herde-bild · leib-k4-kamera-bau (+ mensch-k3-wege ohne Zweig). Heimholen wie oben: Einlass bei grüner eigener CI, Paartest Decke, heim-zNN + fahre.sh.
