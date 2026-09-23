# Abnahme Analog A

> Pflicht A: CODE ZU / BILD OFFEN. Zeile faellt erst mit Armlaengen-Bild-Paar.

## Code
1. Gestalt = tierBaum-Kapseln (_kreaturGliederBacken, _gliedKapselFit, _weltKapselSpawn).
2. Dedup Gattung x Glied: kapsel:gattung:glied (Spawn-Stempel TETRAPODA_SOUL_MAP).
3. EIN March d<-0.5: Sphere-Tracing; Normale = SDF-Gradient.
4. Mesh-Parallelpfad tot (_tickKreaturZiegel; KREATUR_ZIEGEL_DIST=0).

## Abnahme (Michael)
1. Wolf Armlaenge: Silhouette SCHARF, keine Voxel-Treppe.
2. 5 Woelfe: weltMarch Dedup sichtbar.
3. Gang: Knochen-Matrix animiert Feld; kein Doppel-Koerper.
4. Absenz: kein Kreatur-Glieder-Brick; Mesh nur Bake-Rampe.

Bild-Paar vorher/nachher gleiche Sonde - erst dann A streichen.
Gates: node --check anazhRealm.js
Also run gate fern-ring and playtest fast if available.

## Sonde 08.09. 20:58
- Datei: `AnazhRealm-denken/analog-a-wolf-armlaenge.png`
- Ergebnis: **FAIL** (Nacht, lila Silhouette, Glieder nicht lesbar; Wolf-Spawn Cap 20)
- A bleibt offen bis scharfes Bild-Paar.

## Sonde Box-Browser (08.09. abend)
- Frischer Leuchtturm-Neustart: Welt zeichnet manchmal (Tag 13:10, Charakter sichtbar), Status trotzdem **FPS 0**.
- Scharfes Armlaenge-Bild in der Box-Automation **nicht** geliefert (Sonde bricht bei FPS 0 ab).
- Abnahme A: lokal bei Michael (Slider Mittag, Cap frei, Wolf nah) — Code-Pfad bereit.
## Sonde scharf-Versuch (Tag)
- Datei: analog-a-wolf-armlaenge-scharf.png — Tag/sunny, aber nur Mensch im Baum (FAIL Gestalt).
- Naechster Pfad: Konsole `werde wolf` + 3RD auf Koerper.
## Chat-Fix 18.491.53
- processChatCommand normalisiert ZWSP; Suggest==Tipp fuehrt aus.
- Sonde: `werde wolf` → Seele gewechselt: wolf (OK).
- Bild noch offen: Ego-Sicht (SICHT IST) — naechster Schuss 3RD auf Koerper.

## Sonde OK-Teil (08.09. 3RD)
- Datei: `AnazhRealm-denken/analog-a-wolf-3rd-silhouette.png`
- `werde wolf` → Seele gewechselt: wolf · SICHT 3RD · vierbeinige Silhouette mit Beinen sichtbar.
- Noch nicht Abnahme-scharf: Nacht/Silhouette, Kapsel-SDF-Metrologie am Armlänge-Paar fehlt.

## Sonde Tag-nah (09.09.) — FAIL Gestalt
- Datei: `AnazhRealm-denken/analog-a-wolf-armlaenge-tag-nah.png`
- Mittag/sunny/3RD ja, aber **Mensch** (nicht Wolf) — Seele verloren. Zählt nicht für A.
- Gültig bleibt: `analog-a-wolf-3rd-silhouette.png` (Wolf-Silhouette+Beine).

## Sonde HOF-Vorschau (09.09.)
- Datei: `AnazhRealm-denken/analog-a-wolf-hof-vorschau.png`
- JORO Hirsch — vier Beine klar in Orchester-Vorschau. Kein Wölfe-Tab in dem Lauf.
- Paar mit `analog-a-wolf-3rd-silhouette.png` (Wolf in Welt, Silhouette).

## Sonde HOF Wolf (09.09.)
- Datei: `AnazhRealm-denken/analog-a-wolf-hof-vorschau.png` — Wolf im Orchester (WÖLFE), Glieder in Vorschau.
- Paar mit Welt: `analog-a-wolf-3rd-silhouette.png`.
