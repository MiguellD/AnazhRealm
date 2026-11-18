# Übergabe Netz-Stadt (18.11. 02:35) — ZWISCHENSTAND

Zweig `vorrat11-stadt-netz`, Kopf 718d1389 (= w28-stadt-netz f23138ba + main c50e6b61 [daf57354] + main 21f279f5, beide Merges [skip ci]).

## Was steht (Radeon 890M, 1920 × 1080, 12 Uhr, je EIN Lauf)
- Merge 1 (daf57354): 3 Konflikte nach Absicht gelöst — scripts/diag-takt.cjs (T8/T10 am eigenen this + Selbsttest n15–n18 von main, T9 an
  _bauFrist vom Zweig), spec/uhr/geraetezeit.json (siedlung-ort vom Zweig, siedlung-satz mit Ruhe von main), stamm/dirigent-takt.js
  (TAKT_BAUER: dorf + todLage + vorbau). Merge 2 (718d1389): konfliktfrei (Feld/brand, _weltTag in siedlung-wege).
- Byte: 34 Exporte bis zur Wand Kopf = main = Zweig; 12 Kachel-Exporte über der Wand Kopf = Zweig.
- Tore an daf57354 alle Exit 0: format:check, check:statik (0 ✗, Taille dicht), playtest (Invarianten OK), gate:settlement + Selbsttest,
  gate:fachwerk-contract, gate:betriebsgesetz, gate:haus-welt 1/2 + 2/2. An 718d1389: format:check 0; statik/betriebsgesetz/settlement/playtest laufen.
- K1 Anteil Häuser mit Bild: 5 × 5 („dorf 7 4750“, 69 Kacheln) 4 787 von 5 167 = 0,926 (der Lose 0,985); 15 × 15 („dorf 7 42750“,
  681 Kacheln) 45 656 von 47 173 = 0,968 (der Lose 0,983). Soll ≥ 0,9: hält.
- K1 p95 gegen main an stadt-voll (dieselbe Pose): main 21f279f5 42,3 ms ↔ Kopf daf57354 33,5 ms, Δ −8,7 (Soll ≤ +1: hält; ein Lauf je Seite,
  CPU-Takt p50 25,6 ↔ 21,1 zeigt Last-Streuung). Bild gleich (der Ort liegt unter der Wand).
- 5 × 5: Stadt-Häuser mit Satz 531 (Satz in der ganzen Welt 1 381), CPU-Takt p50/p95 12,3/21,3 ms, Bild p95 41,7, 58 Befehle, VRAM 173 MB,
  Kapsel 4 132/8 192. 15 × 15: p95 41,9, CPU 12,5/21,5, 56 Befehle, 1,80 Mio. Dreiecke, VRAM 184 MB, Kapsel 3 895/8 192.
- Station breite.siedlung#1 läuft am Kopf (Seite wörtlich gefahren): Wand 5,5:1 · R² 0,96 · Traufe 6,1 — GRÜN nach ihrem Urteil.

## Bis zur Abgabe fehlt
- Die Tore an 718d1389 zu Ende (check:statik, betriebsgesetz, settlement, playtest; haus-welt und fachwerk-contract nur an daf57354).
- Der Blick des Koordinators, dann Stempel + Push der Abgabe (Entwurf: koord/abgabe-stadt-netz.txt).
- Nächster Schritt: Tore-Log `welle3/netz2-tore.txt` lesen; grün → Abgabe stempeln und landen.

## Fallen
- „5 × 5 / 7 × 7 / 15 × 15“ stimmt nicht mehr: seit f23138ba (Stadt-Form) ist der Umriss rund — 4 750 = 69 Kacheln (9 × 9), 42 750 = 681 (29 × 29).
- Das Wort trägt mehr Häuser als seine Zahl (DORF legt Kirche, Rathaus …: 4 750 → 5 167).
- `werkbank start --ort stadt-voll` gründet nichts; erst `/umstellen {ort: stadt-voll}` gründet „dorf 7 300“ (mein erster Kopf-Lauf maß ohne Stadt).
- Die Netz-Stadt gründet man aus `--ort wiese` mit spawnSettlement am Anker von stadt-voll (am Ort stadt-voll stünden zwei Städte).
- Der Baum teilt die Refs: origin/main zog während der Messung von c50e6b61 auf 21f279f5.

## Bäume, Prozesse, Bilder
- Baum `welle3/abwesenheit` (sauber, auf dem Zweig); eigene Prozesse: nur der Tore-Lauf (niedrige Priorität), keine Werkbank offen.
- Werkzeug netz-probe/netz-bild.cjs (Modi netz · voll · form), Rohes je Lauf in netz-probe/<lauf>/. Bilder koord/netz/: main-voll-* ↔
  kopf-voll-* (über 260 m, über 1 km, Boden), kopf-4750-*, kopf-42750-ueber-1km.

## Lehre
1. Zeit kostete das Warten auf das GPU-Schloss (echt-Job, Punkte-Sitzung, zwei fremde Arbeiter: ~35 min) und die 40 min CPU-Tore.
2. Getragen haben gpu-lauf.sh und die Seiten-Funktion der Station wörtlich in der eigenen Werkbank; nutzlos waren die Warte-Schleifen in bash.exe (nach 170 s weggeschoben).
3. Übersehen: dass `--ort stadt-voll` nicht gründet — ein GPU-Lauf ging verloren.
4. In den Auftrag gehören die Größen als Wort (nicht als Kachel-Raster) und die Kameras als Zahlen; nie ein Werkzeug-Befehl, der nicht zum Ort passt.
5. Großer Hebel, unbeauftragt: die Metropole der Standard-Saat über die Wand öffnen (_staedte liest die Rang-Sieger) — erst dann sieht ein Spieler die Netz-Stadt.
