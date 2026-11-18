# FAKT für Runde 2 — zwei lebende Zweige im Kapitel BAU (Übergabe des Koordinators, 18.11. 22:35)

Beide Zweige liegen auf origin; gelesen ist hier nur ihr Umfang (git diff --stat), nicht ihr Code und kein Bild.

## `vorrat12b-bau-rezept` 658269ca3 (Radeon, ungestempelt, trägt main e4e3f3633c per Merge)

- **Trägt (Bericht des Arbeiters; Bildpaare nur von ihm gesehen):** Häuser, die Wand in Wand ineinander standen, stehen frei auf ihrem
  Land; der Torplatz an der Wende ist frei; gate:haus-welt 1/2 + 2/2 grün (zweites Dorf 0/27 im Bau statt 3/28), gate:settlement 116/116.
  Kopf-Commit ff2b8341a „Abgabe w28-bau-rezept: das Raumprogramm am EINEN Schreiber-Ende — jede der 27 Zeilen von BAU_NUTZUNG trägt
  Räume …; hofImLos fällt“.
- **Hält ihn:** gate:kreatur-takt 3/3 deterministisch ROT an `zielplan` — „Rollen ohne Ziel-Ort: bergfried (1, gebunden 4) · torhaus
  (1, gebunden 1)“. Täter laut Arbeiter: der Neu-Wurf des Stadtplans durch das Land-Maß. Zwei Spikes (Werk zuerst; Rand der Gasse
  suchen) verschoben das Rote nur (dann kippt rathaus).
- **Am Bild:** eine dunkle Sockelplatte ragt am Hang unter Häusern über die Kante (beide Seiten des Paars, also auch main).
- **Umfang gegen e4e3f3633c (15 Dateien, +766 −226):** fachwerk-core.js 260 · scripts/diag-haus-welt.cjs 58 · diag-kreatur-leben.cjs 34 ·
  diag-settlement.cjs 130 · lib/kreatur-mensch.cjs 7 · lib/los-proben.cjs 108 · lib/ort-proben.cjs 97 · spec/asset-contract/v6/golden/
  haeuser.json 158 · siedlung.json 4 · spec/haus-welt/defekte.json 18 · stamm/gelaende-boden.js 7 · gelaende-kollision.js 27 ·
  siedlung-bewohner.js 12 · siedlung-ort.js 70.
- **Lesart des Koordinators:** der Befund „Haus → Leute statt Leute → Haus“ am lebenden Beispiel — die Rollen suchen Orte in einem
  Plan, den das Land-Maß neu wirft.

## `vorrat14-oeffnungen` 47fbd085f (ruht, fünf WIP-Commits auf dem Kopf von bau-rezept, nur fachwerk-core.js +93 −38)

1. 5a5b53f37 Fenster-Seitenregel an der Wurzel: fensterAt kennt die Außenseite seiner Wand, kein Flügel und keine Bank schlägt in den
   eigenen Körper (Export-Sweep 13 610 Flügel in 72 Klassen → 0)
2. 78de2458d Flügel als Funktion: EIN Würfel je Fenster aus Samen und Lage, 16 % stehen offen statt 100 %, der Rest sitzt in der
   Laibung; nah, mittel und fern lesen fluegelOffen, FLUEGEL_LAGE fällt
3. 5ddcb3688 Stirn des Flügels trägt Fenster: neben der Tür je ein Fenster aus dem Wand-Gesetz des Flügels
4. e1b3d4f44 Fern-Tür und Fern-Tor: die Eingänge des Hauses als EINE Liste, das Fern-Fenster baut je Eingang Gewände und dunkle Öffnung
5. 47fbd085f Fern-Liste trägt, was die L0 baut: das Giebelfenster nur am Sattel-Giebel ohne Flügel davor, die Balkontür als Fern-Tür

Das überdeckt einen Teil der Bahn ÖFFNUNGEN von v2 (Flügel nicht mehr 0,62 rad für alle, Laibung). NICHT darin laut Betreff: Uhr und
Wetter als Ursache des Flügels (`fensterSchlaeft`), das Glas, das den dunklen Raum zeigt.

## DIE FRAGEN AN DEN RICHTER VON v2

1. `vorrat12b-bau-rezept`: (a) landet er als erste Bahn „Land“, sobald `zielplan` aus derselben Quelle liest wie der Plan (EINE Quelle:
   der Plan gibt die Orte, die Rollen lesen ihn), oder (b) geht er in den Bahnen von v2 auf?
2. `vorrat14-oeffnungen`: ist er der Anfang der Bahn Öffnungen (der Macher baut auf ihm weiter — dann hängt die Bahn an der Landung
   von bau-rezept) oder wird er auf main neu geschnitten?
3. Die Sockelplatte am Hang: Bahn oder Tafel-Zeile (Fund)?
