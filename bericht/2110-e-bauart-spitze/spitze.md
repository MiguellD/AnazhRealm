# E-Bauart-Spitze — kostet das Register in den schweren Takten? (OMEN 21.10., Schneider) · Bericht

Zweig `e-bauart-spitze` ab integ-probe 1011d41d, Kopf **8164169a** `[ci voll]` (Code db3c1a9b). A = 1011d41d (n2010-b2b), B = Kopf
(n2110-spitze); EIN Instrument werkbank aus n2010-b2b; Genesis Third steht, Regler voll, Tiere frei. Roh: p3/n2110/spitze/lauf/.
## Zuerst gemessen: was wächst in den Spitzen-Takten? (spitze-zaehler.js, 609 Takte an A, Mitte p40–60 gegen ab p95)
- Prüfungen je Takt 91,3 → 86,2 · Tor ruhig 83,2 → 77,3 · Tor-Fälle 8,1 → 8,8 · Gänge 63,7 → 60,8 · voll 0,02 → 0,58 · Regungen 3,0 → 10,7.
- **Die Vermutung fällt:** die schweren Takte tragen NICHT mehr Prüfungen, Meldungen oder Gänge — eine Schwelle hätte nichts zu
  schalten. Der Takt dort ist 9,4 statt 4,5 ms, und alles darin läuft ~1,4-fach langsamer (`_renderScene` 4,71/3,21, die Diät 0,57/0,40).
- Die Kosten des Tors sind Speicher-Zugriffe: warm 0,31 µs je Ruf (tor-bank.js), im Spiel ~2,3 µs (Profil D, selbst 0,21 ms/Frame bei
  91 Rufen) — jeder Puffer, den das Tor liest, ist ein Zugriff im kalten Cache zwischen zwei Draws.
- Nebenfund: 4 bauSatz-Render-Objekte warten im Hauptbild auf eine abgesagte Pipeline und prüfen jeden Takt voll (benannt, nicht geheilt).
## Geschnitten (stamm/bild-diaet.js, EIN Pfad)
- **Die Sammel-Stelle:** die Puffer melden ihrem Halter — Attribute und Index der Geometrie, Instanz-Puffer der Senke (`_regtHalter`,
  angemeldet in `_diaetStand`, wenn ein Puffer neu am Render-Objekt hängt); das Tor liest EINEN Stempel je Halter statt jedes Puffers.
- Die Lage liegt am Render-Objekt (16 Zahlen, kein Umweg über die r184-Daten), die Verweise als Wahrheit am Stand, die Felder in EINER
  Reihenfolge (auch die Vendor-Bahn). Tor warm **0,307 → 0,138 µs** je Ruf.

## Beweis — GTX, 2+2 verschränkt (abab.sh, ausw.cjs)
| Lauf | CPU-Takt p95 (E-Form) | takt CPU p95 | Diät-Spitze Σ (direkt + Bündel) / Mitte | Spitze direkt |
|---|---|---|---|---|
| A1 · A2 | 5,4 · 5,5 | 5,9 · 6,2 | 1,02/0,82 · 1,24/1,01 | 0,43 · 0,64 |
| B1 · B2 | 5,6 · 5,6 | 5,8 · 6,0 | 1,19/0,94 · 1,18/0,99 | 0,64 · 0,62 |
Weitere Boots an 1011d41d: A0 Σ 1,08, Koordinator 1,32; d3a626ee 1,05 (n = 1) — **die Boot-Streuung an EINEM Stand ist 0,30 ms.**

## Ehrlich offen
- Ziel nicht belegt: die Diät-Spitze ≤ 0,53 und „needsRefresh ohne Mehr“ liegen an A wie an B im Boot-Rauschen (A 0,43–0,64, B 0,62–0,64
  direkt). CPU-Takt p95 B 5,6/5,6 = d3a626ee 5,6, aber +0,15 über A dieser Serie (n = 2, im Rauschen). Der Schnitt ist im Spiel nicht sichtbar.
- Der Zuwachs B gegen d3a626ee (0,53 → 0,72) ist EIN Boot je Seite; an 1011d41d streut dieselbe Zahl 0,43–0,72. Nächster Posten wäre der
  langsame Takt selbst (Speicher-Druck, GC, `updateCreatures`), nicht das Register.
- Wände: check · lint · format · playtest:fast 21/21 · kamera-treue · vendor-anker EXIT=0; Linse diaet grün (0 ohne Meldung); Atome −8.
