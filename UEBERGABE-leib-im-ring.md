# Übergabe w28-leib-im-ring (Etappe 2, 16.11.) — die Leser folgen dem Leib im Ring, GEMESSEN IST NICHTS

Etappe 1 (c3f23d23): `_bewohnerGeburt` stellt nur den STAND (Hülle `b.leib` + `bauZu`, `beinMass`, `beinL`, `tempo`); `_bewohnerLeibAn`/
`_bewohnerLeibAb` geben den Leib dem Ersten je Gestalt (backt), der Nah-Wahl (≤ `geburtenJeTakt`), dem Fahrer im gezeichneten Wagen;
Rückgabe jenseits 12 m oder über 6 je Siedlung. Vorher (main 3e4f99cd, Radeon, Dorfplatz): 454,2 MB · 952 Skelette · 4 879 Objekte · 77 Leiber.

Etappe 2 (dieser Kopf):
- Die Warte-Stelle: `mensch.K2#2` wartete in `scripts/lib/kreatur-mensch.cjs` (`bisDa("bewohner: die Leiber")`) auf Szenen-Kinder mit
  `userData.rig` ≥ Soll — nach dem Schnitt nie. Jetzt zählt sie die STÄNDE (`_feldLageVon` + `heim`, Deckel „bewohner: die Stände“);
  ob jeder verlangte Leib steht, sagt EINE Stelle: `_weltOffen().leute` (dirigent-takt) zählt neu `S.leibOffen` — wen die Nah-Wahl traf
  und der Geburten-Deckel warten lässt (`_tickBewohner`; `_bewohnerFort` setzt 0). Der Erste je Gestalt trägt ihn ab der Geburt.
- Proben: von 21 Dateien mit `.leib` lesen 14 nie den Bewohner (Spieler-Leib, Kampf, Mess-Strukturen); 6 lesen nur Lage/`visible`/
  Existenz der Hülle (fahr-proben liest `userData.rig` nur am gezeichneten Fahrer = Leib-Träger). Nachgezogen in kreatur-mensch:
  der Deckel, die Skala der Vorlage (`_tierBaum.wrap` am nächsten Leib-Träger statt am Nächsten), der Kopf der Begegnung (bricht beim Namen).
- `r._bewohnerKoepfe[]`: ein Kratz-Array der Wachen des Takts (siedlung-bewohner :1569), hält KEIN Byte selbst — `__heapHalter` nennt
  den kürzesten Pfad (r.x vor r._bewohnerSiedlungen[].liste[]); die 13,19 MB gehören den Bewohnern. Nicht geschnitten.
- Die doppelten `_bewohnerFeldLage` nach `_kzLeib` (Tick :1763, Gang-Ende :2236) fielen: `_kzLeib` schreibt selbst.

Geprüft: `node --check`, prettier (nur fremde Alt-Zeilen in kreatur-mensch, 56 vorher = 56 nachher), eslint stamm 0, `diag-atlas --check`.
NICHT gelaufen: jede Welt (Radeon belegt). Als Nächstes: `mensch.K2#2` an der GPU — Heap, Skelette, Leiber ≤ 6 + Backende, `leute` → 0.
Offen: welche Typed-Arrays die 13,19 MB tragen (`__heapHalter(r, 6)` am Kopf) · `gate:kreatur-takt bewohner` (beinMass als Gesetz) ·
Bild-Spitze je Leib-Geburt (ms) · `ringHystM` 3 / `ringLeiber` 6 ungemessen · die Übergabe-Datei fällt mit der Abgabe.
