# Zensus des Lichtmessers — Wald-Kopf `laub-kante-heil` 70539e9e58 (Inhalt = 15f8d5a4), nur gelesen

Pfade relativ zu `C:\Users\micha\AnazhRealm-probe`. Mess-Dateien: `…\scratchpad\z622\heil\` (Radeon, Mess-Wiese, Ego).

## 1. Kette: vom Licht zur Belichtungs-Zahl (alle CPU, Haupt-Faden, im Takt der Uhr)

| # | Glied (Datei:Zeile) | Eingabe → Ausgabe | Einheit | Takt |
|---|---|---|---|---|
| 0 | `_tickTime` → `_applyDayNightToScene` (stamm/bild-himmel.js:2651, 1139) | Uhr → Richtlicht, Tafeln, dann Belichtung (:1175) | — | „JEDEN Frame, kein Throttle“ (:2649) |
| 1 | `_dayNightApplyBelichtung` (bild-himmel.js:1933) | `_belichtungAusLicht(e)` → `renderer.toneMappingExposure = k` (:1937) | k dimensionslos (Multiplikator vor Neutral-Tonkurve) | je Frame |
| 2 | `_belichtungAusLicht` (bild-himmel.js:1943) | `_waagrechtIrradianz` + Anker `_belichtungAnker` (:2031) → `__weltLicht.belichtung` | E in Welt-Einheiten (E0 = KEY_BASE 2,6 · LEGACY_LICHT π, welt-licht.js:49,53,693) | je Frame |
| 3 | `_waagrechtIrradianz` (bild-himmel.js:2171) | Richtlicht × `_horizontSichtImBild(dir)` (:2188) + Himmel `_himmelsBestrahlung` (:2193) + Hemi + Ambient (:2208f) → rgb E | Welt-E (lx erst im Licht-Zweig, s. u.) | je Frame |
| 4 | `_horizontSichtImBild` (stamm/dirigent-ankunft.js:1779) | Gedächtnis über ~60 Eingänge (Kamera-Matrizen, L, Karte, Werfer-Objekt :1798–1807) → Wert oder neue Messung | Anteil 0–1 × N·L (gewichtete Sonnen-Sicht, ≤ L.y-Größenordnung) | misst neu, sobald Kamera ODER Licht sich ändern — bei laufender Uhr jeder Frame |
| 5 | `_horizontSichtMessen` (dirigent-ankunft.js:1812) | 32 Bodenpunkte → Σ(Grat-Sicht × Karten-Sicht × N·L)/n (:1853f) | wie 4 | bei Änderung |
| 5a | `_horizontSichtAm` (dirigent-ankunft.js:1706) | Punkt, L → smoothstep über Grat-Höhe (:1761f) | 0–1 | je Strahl; Marsch je Texel gemerkt je Licht (:1738ff) |
| 5b | `_kartenWurfSicht` (stamm/stoff-karte.js:647) | Punkt, L → Π(1 − Deckung·Dichte) über Werfer im Fach (:657–673) | 0–1 | je Strahl |
| 5c | `_kartenWurfWerfer` (stoff-karte.js:689) | Instanzen `#S` → Liste [x,y,z,hw,hh,Deckung] (:730), Fächer 8 m quer zum Licht (:751) | m | neu bei Bestand/Auge-1-m/Präsenz (:701); Fächer neu bei Licht > `lichtRad` 0,05° ODER `W.ex !== e.x` (exakter Float, :747) |
| 6 | `__weltLicht.belichtung` (welt-licht.js:674) | E-Luma, Anker EA, e → k = zielKarte·2^Stufen /(0,18/π·E) (:678), Boden Nacht-Knoten (:677) | k | je Frame |
| 6a | `belichtungStufen` (welt-licht.js:648) | h ≥ 12°: 0,25·log2(E/EA) (Steigung 0,75, :82f, :660) → **k ∝ E^−0,75** am Tag | Stufen (EV) | je Frame |
| 7 | `_raumBlendeTakt` (bild-himmel.js:1968) | `_belichtungE`/`_belichtungSonne` → `_raumStufen` (nur unter Decke, :1958f) | EV | je Frame |
| — | `_vorBelichtung` | **im Wald-Kopf nicht vorhanden** (grep 0); nur `origin/licht-eine-skala:stamm/bild-kosten.js:2249` | — | — |

Zweiter Schreiber von `toneMappingExposure`: die Studio-Bühne `welt-licht.js:1273` (eigene E aus Tafel + Sonne·sin h, ohne Messer).

**Was der Licht-Zweig `licht-eine-skala` (b0db574958) an der Kette ändert:** `_horizontSichtImBild`/`_horizontSichtMessen`/`_kartenWurfSicht`/`_kartenWurfWerfer` UNBERÜHRT (kein Diff in stoff-karte.js; dirigent-ankunft.js nur Mond/Ambient/Hemi). Geändert: Hemi + Ambient fallen aus `_waagrechtIrradianz` (Diff bild-himmel.js @@2205); `EINHEIT_LX = 16090` lx je Welt-Einheit (welt-licht.js:64 im Zweig); `_vorBelichtung` schreibt das Szenen-Ziel als L × k, gedeckelt 32768 (bild-kosten.js:2249–2300 im Zweig), Rückleser teilen durch `kBild` (bild-schatten.js:185f, bild-sicht.js:999f, dirigent-takt.js:2586 im Zweig).

## 2. Anker: wo der Messer misst

| Frage | Befund (Datei:Zeile / Messung) |
|---|---|
| Punkte | `messer: {spalten 4, zeilen 8, weitM 3000}` = 32 Strahlen (dirigent-ankunft.js:1954), NDC x = (i+½)/4·2−1, y = −(j+½)/8 (:1822): nur untere Bildhälfte, gleich im Schirm verteilt, je Strahl Gewicht 1 |
| Treffpunkt | Schnitt mit der WAAGRECHTEN Ebene in Geländehöhe unter der Kamera (`ebene`, :1817, :1826), dann y = Gelände an (x,z) (:1829) — kein Strahl-Gelände-Schnitt, keine Verdeckung längs des Blicks |
| Höhe über Grund | 0 (Makro-Fläche `_terrainMacroSurfaceY`, ohne Gras/Streu) |
| Abstände (Wiese) | d je Strahl 4 … 63 m: Zeile j0 46–63 m, j1 16–21 m, j2 9–13 m, j3–7 4–9 m (messer-kopf.json); oberhalb NDC −1/16 kein Strahl |
| Bezug | Kamera (`cam.position`, Projektion), nicht Spieler |
| Strahl zur Sonne | Grat: Marsch 50 × 60 m im Gitter 768² × 32 m (:1749–1753, Konstanten :1957–1959); Karten: Ebene durch Anker quer zum Licht (stoff-karte.js:660–664), nur bis `min(cam.far, csm.maxFar)` = 306 m (:750; messer-kopf.json `weit` 306) |
| Werfer, die er kennt | Gelände (Höhen-Gitter), Karten-Instanzen der Gruppe `IMPOSTOR_ATLAS_GRUPPE#S` im Fenster `_blendeBehaelt` (stoff-karte.js:691, 727): Wiese 4 006 Werfer (messer-kopf.json) |
| Körper des Bilds, die er NICHT kennt | nahe Mesh-Bäume/Gestalt-Stufe (nicht in `#S`-Fenster), Stämme, Häuser/Werke, Fels unter 32 m Gitter, Gras/Streu, Wolken-Wurf (nur als Mittel in `dl.intensity`, bild-himmel.js:2186), Fern-Wald jenseits 306 m, Wasser, alle senkrechten Flächen und Kronen-Seiten im Bild, die Ferne über NDC −1/16 |
| Himmel | `_himmelsBestrahlung` am Ort, waagrecht, OHNE jede Verdeckung durch Wald/Grat (bild-himmel.js:2192–2207) — die Sicht wirkt nur auf die Sonne |

## 3. Zwillinge (eigene Gestalt statt der gezeichneten)

| Zwilling | Stelle | Maß der Abweichung |
|---|---|---|
| Krone = Ellipse im Karten-Rahmen, Halbbreite `aKarte.y·s`, Höhe `aKarte.z·s` | stoff-karte.js:664, :730 | Rahmen: Konifere hw/hh = 0,50 (Kopf-Profil-Zellen, messer-profil1.json); Querschnitt der Profil-Gestalt / Ellipse: Fichte 0,39–0,56, Tanne 0,38–0,58, Mammut 0,53, Birke 0,64–0,72, Eiche 0,69–1,04, Buche 0,61–1,03, Weide 0,94, Strauch 0,85 (gerechnet, Dichte-Profil wie :672) |
| Dichte = radial linear ab q > ¼, „im Mittel ⅝“ | stoff-karte.js:672 | fest, ohne Bezug auf die Maske der Karte |
| Deckung je Art: Nadel 1, Laub `kroneImJahr` | stoff-karte.js:718, 729 | eine Zahl je Art, nicht je Band |
| Boden = Ebene unter dem Auge statt Gelände im Blick | dirigent-ankunft.js:1826 | Wiese Hang 1,81 (um-kopf.txt) — ungemessen |
| Grat = 32-m-Gitter bilinear | dirigent-ankunft.js:1724–1734 | Grat-Fehler 0,77° bei 32 m (Kommentar :1942) |
| Himmel unverdeckt | bild-himmel.js:2193 | ungemessen |

**Der Zwilling gegen das Bild (Wiese, Radeon):** Sicht-Mittel der 32 Strahlen `kw` gegen Bild-Sonnen-Pixel (`an > 1,3·aus`, messer.js)

| Uhr | L.y | kw Ellipse (messer-kopf) | kw Profil a249 (messer-profil2) | Bild ganze untere Hälfte | Bild an den 32 Strahl-Pixeln |
|---|---|---|---|---|---|
| 0,264 | 0,088 | 0,000 | 0,003 | 0,022 | 0,023 |
| 0,268 | 0,113 | 0,001 | 0,012 | 0,112 | 0,144 |
| 0,270 | 0,125 | 0,008 | 0,064 | 0,185 | 0,204 |
| 0,272 | 0,138 | 0,028 | 0,172 | 0,262 | 0,261 |
| 0,276 | 0,163 | 0,082 | 0,362 | 0,419 | 0,403 |
| 0,280 | 0,187 | 0,173 | 0,587 | 0,549 | 0,520 |

Je Zeile (Profil): bei 0,268 Bild j0/j1 = 0,56/0,51, Messer 0,00/0,08; bei 0,28 nahe Zeilen j4 Messer 0,79 gegen Bild 0,42. Die Ellipse nimmt bei 0,27 je Strahl 1–21 Kronen („nehmer“, Mittel 8,7), die ersten in t = 83–125 m Richtung Sonne (messer-kopf.json). Die Strahl-Pixel tragen das Bild der Hälfte auf ≤ 0,03 (außer 0,268: +0,03) — die Lücke liegt im Schatten-Modell, nicht in der Stichprobe.

## 4. Leser

| Leser | liest | Datei:Zeile |
|---|---|---|
| Tonkurve des Renderers (Neutral) | `toneMappingExposure` | bild-himmel.js:1937, welt-licht.js:79 |
| Nacht-Auge der Post-Kette | `l · toneMappingExposure` (Zapfen-Schwelle) | bild-kosten.js:2193 |
| Flamme des Brands | `ziel ÷ toneMappingExposure` | feld-brand.js:846 |
| Tor-Ziel-Atlas | `1/toneMappingExposure` | siedlung-tor.js:658, worlds/huelle/huelle.js:2652 |
| Licht des Auges (Höhle) | k | bild-himmel.js:2056 |
| Feuer-Wurf-Wahl | `_belichtungE` | bild-schatten.js:481 |
| Raum-Blende | `_belichtungE`, `_belichtungSonne` | bild-himmel.js:1978, 1996f |
| Linse Tag-Achse | k (Spion `sofort`/`frisch`) + Ausgabe-Bild Y/X/R/B | scripts/lib/licht-linsen.cjs:1080–1126 |
| Playtest | k gegen `_belichtungAusLicht` | scripts/playtest/bild.cjs:458 |
| Regen-Schliere `uLicht` | `uLicht`: 0 Treffer im Wald-Kopf; die Schliere (bild-himmel.js:978–1094) liest weder k noch Sicht — gelesen bis :1094, Stoff-Licht ungelesen |
| EIGENE Helligkeit statt Messer | Studio-Bühne (welt-licht.js:1268–1273, sin h ohne Sicht); Rückstrahl liest das gezeichnete Boden-Bild (bild-schatten.js:238–257); Himmel/Nebel/Luft lesen `_horizontSicht` der GPU-Karte, nie die Zahl des Messers (bild-himmel.js:2383) |

## 5. Zeit

| Größe | Wert (Datei:Zeile) |
|---|---|
| Glättung der Tag-Belichtung | KEINE: k wird je Frame direkt gesetzt (bild-himmel.js:1937); kein Hell/Dunkel-τ |
| Raum-Blende | Tiefpass 1. Ordnung τ 0,8 s dunkel / 0,3 s hell, dt ≤ 0,25 s, Sprung > 3 m sofort (stoff-dach.js:300; bild-himmel.js:2013) |
| Rückstrahl-Boden | folgt je Messung mit 0,5 (bild-schatten.js:1684, :257) |
| Tag-Achse Messung | je Uhr `setTimeOfDay` → `__weltStehtWarten` → Aufnahme 480×270, untere Hälfte (licht-linsen.cjs:1099–1126) |
| SPRUNG | |ΔEV(Y)| zwischen Zeilen mit ΔUhr < 0,0105 > **0,10** (licht-linsen.cjs:1162, 1197, 1201) — an `--kurz` UND an `:bahn` dieselbe Schwelle; Feinschritt 0,002 um den Horizont (−18…15°, :1165–1170) auch an `--kurz` (werkbank.cjs:3527) |
| BUCKEL | EV(Y) gegen Mittag > **0,15** (:1162, 1202) — urteilt NUR an der ganzen Bahn (`TAG_WAND` :1163, :1186); an `--kurz` steht er nur in der Zeile (Genesis 0,23 „GRUEN“, tag-a249c85d20-kopf.txt) |
| REF | Szenen-Stufen X (Tonkurve zurück, :1093) neben spec/farbe/tag-ref.json > 0,3 (:1203), nur Bahn |
| Karte (ANKER) | 18-%-Karte mittags 2,5 m vor dem Auge, Luma 110–130 (:1129–1141, :1195), auch `--kurz` |
| ASYNC | erster Frame gegen stehendes k > 0,05 EV (:1204) |

## Drei Antworten

**A. Rücklese der gezeichneten Leuchtdichte?** Für die Belichtung: NEIN (k aus `_waagrechtIrradianz`, nie aus Pixeln). Am nächsten: der **Rückstrahl-Pass** (bild-schatten.js:108–260): liest das Szenen-Ziel (linear, vor der Tonkurve) in 32 × 18 Kacheln × 8² Proben, nur Boden (unter Auge −0,5 m, ≤ 16 m, |n.y| > 0,7, Fläche statt Kante, offener Himmel; Konstanten :1677–1685), async `readRenderTargetPixelsAsync` 33 × 18 Halb-Float (:238), misst nur bei Bewegung > `SPIEGEL.ruheM`/Drehung/neuem Licht-Stand (:337–348); Leser: der Halbraum jedes Stoffs (:102ff). Kosten in ms: ungemessen; Geräte: jeder Renderer mit `readRenderTargetPixelsAsync` (sonst Bruch, :225). Weitere Rücklesen nur Tafeln (bild-himmel.js:759, 1692) und Karten-Bake (stoff-karte.js:1500). Linsen lesen das Ausgabe-Bild (`__ausgabeAufnahme`, licht-linsen.cjs:1109) — Prüfgerät, nicht Spiel. Keine Mip-Kette, kein Histogramm im Spiel (grep).

**B. Warum hob das Profil den Genesis-Buckel?** Gemessen (mess-*.json, Genesis): Mittag unverändert k 0,5214; Uhr 0,33 k 1,1065 → 1,2493 (+0,175 EV), Y 0,1598 → 0,1841 (+0,20 EV) — das Bild folgt nur der Belichtung; mit k ∝ E^−0,75 (welt-licht.js:660) heißt das: der Messer las an Genesis 0,33 **15 % weniger E**, das Profil nahm dort MEHR Sonne als die Ellipse. Gerechnet (messer-profil1.json, 19 Zellen): der Querschnitt des Profils ist je Gestalt 0,38–1,04 der Ellipse — in der Summe nimmt es fast nie mehr; die fehlende Dichte je Band (`_karteProfil` = Radius der 90 % Ecken, a249c85d20 stoff-karte.js +700ff, Dichte nur quer `q = u²/hw²`) senkt den Querschnitt nicht unter die Ellipse, erklärt also allein kein Plus. **Hypothese (wahrscheinlichste):** das Profil verlegt die Masse in Höhen, die die Strahlen bei 28,6° Sonne kreuzen — das Fuß-Band: Band 0 trägt bei jeder Konifere und Mammut 0,53–0,78 der Halbbreite, Band 1–3 nur 0,03–0,16 (der Schaft) — eine breite Scheibe AM ANKER, wo die Ellipse (Mitte bei hh, q ≥ 1 am Fuß) nichts nahm; Laub (Eiche/Buche) trägt dazu oben 0,5–0,63, wo die Ellipse spitz zuläuft. **Probe, die sie fällt oder trägt:** messer.js an Genesis Uhr 0,33 an 15f8d5a4 und a249c85d20, je Strahl `kw`, je Nehmer Art + Band-Index p + q, dazu das Bild am Strahl-Pixel: tragen die gekippten Strahlen p < 1 → Fuß-Band (Täter: die Ecken unter dem Schaft in Band 0, ungelesen woher); oberes Band an Laub → Höhen-Verteilung; zeigt das Bild an den gekippten Strahlen Schatten, misst das Profil richtig und der Buckel ist echt. Genesis-Arten und -Strahlen: ungemessen.

**C. Kosten heute.** 32 Strahlen × (2 Gelände-Höhen + Grat bilinear über 4 Texel-Märsche à 50 Schritte, je Licht gemerkt + Werfer der Fächer ±(hwMax + 0,53 m)/8 m) je Messung; Messung bei jeder Änderung von Kamera oder Licht = bei laufender Uhr jeder Frame (bild-himmel.js:2649; dirigent-ankunft.js:1808). Gemessen in der Quelle: 0,1 ms je Ruf, 0,2 ms je neuem Licht (Radeon, dirigent-ankunft.js:1951); mit Karten-Wurf 0,106 ms je Messung, 0,166 ms mit neuem Licht je Bild bei 2 213 Werfern/82 Fächern (stoff-karte.js:684f); früher 0,28 ms je Ruf (swiftshader Genesis, dirigent-ankunft.js:1777). Heute an der Wiese 4 006 Werfer (messer-kopf.json) — Kosten dort ungemessen; Fächer-Neubau O(Werfer) bei jedem Kamera-Schritt (`W.ex !== e.x`, stoff-karte.js:747); Gitter-Höhen 2,25 MB Float32 im Main (dirigent-ankunft.js:1952).

## Fach-Anker (aus Wissen, nicht gelesen)

Kamera-Automatik misst REFLEKTIERT: die Leuchtdichte (cd/m²) im Bildfeld, mittenbetont, Matrix oder Spot, oft als log-Mittel/Histogramm (Spiele: Mip-Kette oder Luminanz-Histogramm des HDR-Ziels mit Zeitkonstante, hell schneller als dunkel; Auge: Anpassungs-Leuchtdichte im ~2–10°-Feld, Zapfen Sekunden, Stäbchen Minuten). Der Handbelichtungsmesser misst EINFALLEND: Beleuchtungsstärke (lx) am Ort des Motivs durch die Kalotte, unabhängig von Albedo und Bildinhalt. Der heutige Messer bildet die **Incident-Messung** nach — Beleuchtungsstärke (Sonne × N·L × Sicht + unverdeckter Himmel), an 32 Bodenpunkten gemittelt statt am Ort, ohne Albedo, ohne senkrechte Flächen, ohne Leuchtdichte des Gezeichneten — ein Kosinus-Empfänger, verteilt auf den Boden im Blick; die reflektierte Seite liest im Spiel nur der Rückstrahl (Boden ≤ 16 m) und keine Belichtung.
