# Übergabe OMEN (Meister des Omens) — 23.11.2026 21:55

## Dienste (laufen, nicht angehalten, nichts installiert seit 21:27)
- DIENST-OMEN aus koordination 6297eef6 (start.sh 21:27); runde.cjs Blob 524ee94056c4 (enthält 212ff09e „jede Station einmal“).
- landung-dienst PID 14892: Runde 12 am 5b36f69a, gtx durch 74/247 (Puls 21:50) · platte PID 12328 (C: 26,3 GB frei) · puls PID 31600.
- CI-Runner Runner.Listener PID 17352. GPU-Schloss frei seit 21:49; keine Hand, kein Selbsttest läuft.

## Zweige (alle gepusht, kein Force)
- dienst-runde-in-der-schlange 006c024b8 (WIP, Beweise offen): gpu-schloss.sh schlange_vor (EINE Schlange punkte-gtx.wartet,
  Ankunft je Marke); gpu-lauf.sh nimmt nur vorn (GPU_LAUF_PLATZ/ANKUNFT/GENOMMEN); kandidat.sh ohne `frei`-Abfrage, Platz rückt nach
  jedem Nehmen vor, VERDRÄNGT-Zählung + Deckel ab dem Nehmen, GPU_LAUF_WARTE_S 86400; landung-dienst platz_stellen/platz_fort statt
  darf_beginnen; Selbsttests gpu-lauf g/h, landung b/g, Mutanten kein-platz/platz-steht (statt hinten-an/blind/nur-schloss).
- pm-runde-in-der-schlange a28e149a8 (WIP, Selbsttest ungefahren): punkte.cjs baumSperre nach GPU_LAUF_ANKUNFT, eigener Platz
  übersprungen, Lebenszeichen an birthtime; Zeuge erst unter dem Schloss.
- pm-innen-ein-haus ac3679f73 (1 vor punkte-maschine; Rebase + Selbsttest offen) · pm-referenz-nach-anlauf 82ea8cac7 abgegeben, in punkte-maschine.

## Offen (mit Adresse)
- pm-runde-in-der-schlange, Beweise: gpu-lauf-selbsttest am Kopf (g/h nie sauber: 17:21 lebte ein Runner.Worker, 21:36 hing der
  Wächter am `wait` der Fälle — Fix in 006c024b8); landung ST_NUR=a,b,g,l,r,t,u,y + Mutanten weicht/kein-platz/platz-steht;
  punkte selbsttest --ohne 3c; Messung p3/n2311/schlange/messen.sh. Treiber p3/n2311/schlange/{kette,hand,pruef}.sh (je Hand ≤ 10 min,
  WEICH 0, VERDRAENGT_MAX 99, nach einer Sitzung der Runde). Dann Abgabe + Tausch in zwei Schritten (landung.halt → start.sh → rm → start.sh).
- Linse am heutigen Stand: g ROT „Runde verdrängt“ (Hand vor Runde, 46 s) — p3/n2311/schlange/lauf-2131/gl-heute.log.
- Sprossen UNGEMESSEN durch meine Hand: karte2.planet.kopplung.wetter-welt#3, karte2.planet.kopplung.gegenwart#6 (Runde 12,
  „SCHLOSS BLOCKIERT von omen-omen-schlange-pruef nach 2716 s“) — brauchen die zweite Chance.
- Danach pm-innen-ein-haus, dann pm-kopplung-front (Familien-Fahrt, Tafel, Selbsttest).

## Was heute Zeit kostete (ehrlich)
- 11:20–12:33 etwa 40 min Schloss: der punkte-Selbsttest lieh unter p3/gpu-lauf.sh das eigene Schloss und hing (Fix 4ad978b5d).
- 17:16–21:03 meine Beweis-Hand, EIN Bündel mit dem vollen landung-Selbsttest (> 60 min): 3× verdrängt, jedes Mal vor der Runde
  zurückgenommen — genau der Fehler, den der Schnitt heilt —, beim 4. Mal VERDRAENGT_MAX 3 erschöpft: echt 45247582531/2 wartete
  18 min, die Runde verlor ~2 h 15 min Schloss, zwei Sprossen UNGEMESSEN.
- 21:36–21:49 die Neufahrt hing 13 min am Wächter-Fehler im Selbsttest; auf Befehl beendet.
- Kern: ich bündelte zu groß, maß die Dauer des vollen Selbsttests nicht vorher und gab keiner Hand WEICH 0 — der Schloss-Fehler traf
  zuerst meine eigene Hand. Seit 21:10: je Hand ≤ 10 min, WEICH 0, VERDRAENGT_MAX 99, nie ein zweiter Griff nach einer Verdrängung.
