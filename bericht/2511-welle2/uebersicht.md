# Welle 2 — acht Bahnen (Stand 25.11. 17:30, Tafel anspruch-offen.md; rote Zeilen aus vision/richter am punkte-maschine eb6ef3d8, main 804ca10c)

| Zweig | Sprosse(n) | Täter Datei:Zeile | Dateien | warum nah an der Buchung |
|---|---|---|---|---|
| `w2-nebel-delta` | planet.kopplung.land-meer-luft#3, planet.kopplung.land-meer-luft#4 | Station k2-zusammenspiel.js:365 (Δ ohne nebelQuote) → phyto-core.js:4812 wirft beim Namen | punkte-maschine stationen/k2-zusammenspiel.js (nur als Kandidat unter cloud-post/w2-nebel-delta-station/), cloud-post/w2-nebel-delta*.md | das Spiel trägt den Nebel schon (klima-kontinent 4,46× an 77,1 %), nur die Station wirft — ein Schlüssel, zwei Sprossen |
| `w2-findling-ort` | planet.kopplung.gegenwart#1 | stamm/vegetation-baum.js:1433 `_rockGeologyClass` (liest ort.eis, nicht die Geschichte des Orts) | stamm/vegetation-baum.js | eine Funktion, ein Leser; 44,1 % → 100 % ist eine Zuordnung, kein neues Gesetz |
| `w2-gipfel-saaten` | planet.kopplung.gegenwart#2 | planet-core.js:1876 `planetPunktR` (die Kosten je Saat: 12 von 100 Saaten im Deckel 40 s) | planet-core.js | das Gesetz ist schon GRÜN (98,6 % ≥ 95 %), nur der Zeuge reicht nicht über 12 Saaten — Kosten, kein Gesetz |
| `w2-ufer-waerme` | leben.pflanzen.biome#1 | stamm/vegetation-streu.js:206 `_scatterSpeciesForCell` (die Palme folgt `lebendig`, nicht der Wärme) | stamm/vegetation-streu.js | zwei Zahlen, ein Streuer; die Wärme liest die Station schon |
| `w2-dach-regen` | mensch.kopplung.kultur#2 | fachwerk-core.js:2852 `bauRezept` (die Dach-Neigung aus dem Samen; kein Niederschlag) | fachwerk-core.js | eine Funktion im Kern, zwei Zahlen ohne Pixel, Glieder-Leiter (bucht ohne Vorgänger) |
| `w2-bahn-koerper` | planet.kopplung.bahn-klima#2 | voxel-worker.js:1481 und :1507 rufen `planetPlanVon(msg.samen)` OHNE Körper (nur :1502 reicht `msg.koerper`) — der Plan nimmt PLANET_ERDE, die Neigung der Saat fällt still | voxel-worker.js | der Faden KANN den Körper schon lesen (`planetPlanVon(samen, koerper)`), nur der Weg reicht ihn nicht |
| `w2-tat-umkreis` | same.kopplung.aufwaerts#1 | stamm/feld-leben.js `_tatSchreiben` (die Tat verschiebt keinen Elternknoten: Pegel, Wild um das Haus) | stamm/feld-leben.js | sichtHoeheM ist grün, es fehlt nur die Zahl der geänderten Orte — eine Funktion |
| `w2-pfuetze-schatten` | planet.kopplung.stadtklima#1 | rote Zeile: stamm/stoff-material.js `_windAt`; der rote ZEUGE (Pfütze) zeigt auf stamm/stoff-dach.js `_hausSchatten`/`_naesseAm` (:93/:113) — die Täter-Messung entscheidet | stamm/stoff-dach.js | der Wind ist grün, nur ein Zeuge fehlt — aber der Täter der Zeile ist unsicher (die schwächste der acht) |

Paarweise verschiedene Spiel-Dateien: phyto-core.js wird von KEINER Bahn berührt (w2-nebel-delta ist ein Stations-Kandidat; mischwald bleibt frei),
stoff-material.js (Wind, kraft#2) ebenso nicht. Drei Bahnen tragen am Ende einen Stations-Kandidaten in k2-zusammenspiel.js nur, falls dort `leser`/`nicht`
steht — die Kandidaten liegen je Zweig getrennt unter cloud-post/<zweig>-station/. Acht Bahnen tragen NEUN Sprossen (land-meer-luft #3 und #4 an einem Fehler),
darum stehen unten 28 statt 29.

## Nicht gewählt (28) — ein Wort Grund

- leben.tiere.masse#1 — Pixel (Herde verdeckt im Bild)
- same.kopplung.ereignis#2 — läuft (feld-brand, siedlung-bewohner; p95 am Gerät)
- same.kopplung.gewalt#1 — läuft (feld-brand)
- same.kopplung.kohaerenz#1 — zwei Täter (gelaende-core hydroRegion + gelaende-boden), 100 Saaten
- mensch.menge.bevoelkerung#1 — läuft (siedlung-bewohner)
- mensch.nahrung.frucht#1 — Pixel (Blindpaar)
- erleben.kopplung.wahrnehmung#2 — läuft (witterung windab)
- same.kopplung.terraform#1 — Pixel (Bildpaar) + bild-himmel
- erleben.bild.nacht#1 — Pixel (Schatten-Kontrast)
- same.preis.ausdauer#1 — kein Täter (Heap-Steigung ohne Datei)
- mensch.fahrzeug.medium#2 — zwei Gesetze (Saat-Physik + Spurrinne im Bild)
- mensch.nahrung.tier#2 — läuft (TAGES_GESETZ)
- planet.kosmos.systeme#1 — läuft (welt-licht Nacht-Himmel)
- erleben.spieler.wegfindung#1 — Pixel (Landmarke im Bild) + Datei der Findling-Bahn
- same.massstab.spanne#1 — zwei Täter (koerper-bewegung _loopCamera + gelaende-boden), neues Verb
- leben.evolution.fremde-physik#1 — Pixel (Regression aus Bildern) + Datei der Bahn-Bahn
- leben.oeko.netz#2 — groß (zehn Arten in vier Ebenen, neues Gesetz)
- mensch.kopplung.leib#1 — läuft (siedlung-bewohner)
- erleben.klang.stimme#1 — groß (Formant-Gesetz neu)
- planet.kosmos.himmelsmechanik#1 — Pixel (EV-Sprung, Sterne) + Nacht-Himmel
- mensch.kultur.sprache#1 — läuft (siedlung-bewohner) + Datei der Dach-Bahn (fachwerk ORTSNAME)
- mensch.geist.gespraech#2 — Schlüssel (LLM-Lauf, Drehbuch 18)
- mensch.sport.koennen#2 — läuft (siedlung-bewohner)
- mensch.sport.kunst#1 — Pixel (Blindtest) + koerper-core
- mensch.menge.seuche#1 — läuft (TAGES_GESETZ.haltung)
- mensch.macht.recht#1 — läuft (siedlung-bewohner)
- mensch.macht.krieg#1 — läuft (siedlung-bewohner)
- mensch.macht.megastadt#1 — läuft (siedlung-bewohner, TAGES_GESETZ.angebot)
