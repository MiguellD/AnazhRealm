# UEBERGABE mess-wiese (K55-3, Welle 95)

Zweig `mess-wiese`, Worktree `C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\mess-wiese`, Ports 8950–8959.
Gemergt: integ-probe c5e2fc8f (838d16b7) und gtx-ratschen-1410 704fc303 (708cbaf6, die sechs GTX-Ratschen am neuen
Wiesen-Ort, Genesis 0/0, Dorf; Mint-Fix 7d720cf7) — `npm run gate:profiband` lokal EXIT 0 (12 Ratschen frisch an V18.546.0).
Vorher CI 38556427061 an 38365177: 9/13, rot voll 2 · 4 · 7 · 10. CI am neuen Kopf: siehe Commit-Rumpf / unten.

## Gebaut K55-3
- voll 2 (Prüfbühne S0, Selbsttest K11b BLIND): geerbter Basis-Rot, geheilt durch den Merge von integ-probe (c8196cd1 ff.).
- voll 10 Klang-Zensus ROT 3 -> lokal GRÜN (EXIT 0, Port 8951), `scripts/diag-klang-zensus.cjs` `W.orte`:
  - Seeufer nach dem Leser, dem Hör-Ring des Ohrs (UMWELT.ohr radien × richtungen): der Punkt hinter dem ersten trockenen,
    dessen ERSTER Ring Wasser trifft (die meisten nassen Ring-Punkte). ufer −32,1 -> −25,8 dB (Wind −33,0 / −44,4).
  - Wiese jenseits der Glut-Hörweite (klang-core `glut.hoerweiteM` 26 m + 4) jedes Glut-Baus, trocken und eben im Hör-Ring,
    offen wie der Messort (Kronen-Streu und 15-m-Bestand nie über dem Messort); das Dorf wächst vorher aus (Bau-Schlange
    leer, ≤ 30 s). Der Glutbrunnen stand 9,9 m neben dem Messort (glut −35,1 > wind −36,4); jetzt Wiese 54 m vom Messort.
- voll 7 Fahr-Leben S4: die Meldung nennt jetzt Weg längs der Bahn, die Kante und was die Bahn-Wache räumte.

## Offen (Messnamen, Befund)
1. voll 7 S4 „Absteigen im Flug": lokal (Port 8953) fährt der GT 65,0 m längs der Bahn in 420 Frames über die Kante bei
   24,0 m (5,94 m auf 3 m, -143/-109 ff. bzw. S2 „Fall 7,4 m bei 589,7/147,9") und hebt NIE ab (Flug 0 Takte). S2 an
   derselben Kante zählt Luft 20/532 im Sim-Schritt, größter Sprung 0,12 m je Schritt: der Wagen klebt die Wand hinab statt
   ballistisch zu fliegen. Nächster Schritt: Höhe/Luft je Sim-Schritt an der Kante loggen (Hook `_stepFixedSim` wie S2) und
   im Fahr-Kern die Boden-Folge (Rad-Stufe / Ritt-Ebene `_rittEbene`) lesen, die den Wagen an einer 63°-Kante hält.
2. voll 7 L6 (Spieler steckt 1,68 m im GT, 87 Stöße ohne Fahrt-Verlust, GT -> Spieler 0,77 m) und L8 (Lockstep Wagen
   0,001769 m, Bär x ab Schritt 175) an der Gasse/dem Start um den Messort (`mo = expected.messort`) — lokal reproduziert,
   auf integ-probe (alter Ort) grün. Die Klasse der Orte: Gasse und Start suchen noch um den Messort (wie bis K55-2 hoehle/
   kante/querhang/hang) — die Ursache im Stoß-Gesetz ist nicht benannt.
3. voll 4 Höhlen-Sicht „Blick hinaus" LOCH 16 Zellen + Schatten 0 Empfänger. Lokal vermessen (Debug, nicht committet):
   der Verdacht „Stufe-1-Chunks" ist WIDERLEGT — es fehlen auch Stufe-0-Zellen (15,0#86 step 1,8; 15,-1#59; 16,-1#63 ganz
   ohne Kante/Tor/Rand). Das Auge (712,2/105,3/-38,8) liegt in 16,-1 in 8 Luft-Boxen (16,-1#0 die versiegelte Sammel-Zelle,
   #7 #8(1 Tor) #10 #13, 16,-2#38 #40 #44); 293 Zellen besucht, `hinter` 94, `offen` 5. Die fehlenden liegen hinter dem
   Mund (x < 699), nur über Portale von Nicht-Start-Zellen erreichbar: der Weg hinaus (`_hoehlenAusgang`, Sperre ≤ weit +
   2·HOEHLEN_AUGE_M) öffnet die Höhle gegenüber nicht. Nächster Schritt: für 15,-1#59 -> 16,-1#61 die Kette bis zu ihrer
   Start-Zelle und deren Tor-Sperre gegen `bis` drucken.
4. Danach CI 13/13, dann merge-bereit.

## CI am Kopf 73548d6c: Run 38577143460 — 8/13
- grün neu: voll 2 (Prüfbühne, durch den Merge) und gate:klang-zensus (voll 10 läuft jetzt bis werk-im-wasser durch).
- rot: voll 4 (Höhlen-Sicht, Offen 3) · voll 7 (Fahr-Leben S4/L6/L8, Offen 1–2) ·
  voll 1 gate:gelaende-realismus „kosten: die Spalte kostet 27,5 noise2D (Ebene 27,7) gegen das Budget 52,9 (Ebene 26,4)" —
  das bekannte Zeitverhältnis-Flackern (K43-3: im Wiederlauf grün) · voll 5 gate:streu-fern „G BAHNWECHSEL … zurück um das
  Ziel: Gesetz 6 · Mesh 0 · B danach 1" (am alten Kopf grün) · voll 10 gate:werk-im-wasser „H LEER: der Satz setzte 3 von 6
  Eichen" und „haus_alemannisch #1619 (-55,75/-829,62) 12,50 m vom Wasser (Soll ≤ 12)" — lief am alten Kopf nie (klang brach
  den Job vorher ab); `mess` = `messort("wiese")` (Zeile 2570): dieselbe Klasse „Probe sucht um den Messort".
- Wiederlauf der roten Jobs einmal angestoßen (rerun-failed-jobs), um voll 1/5 als Flackern zu benennen oder nicht.

## Wiederlauf Run 38577143460 (Versuch 2): 9/13 rot: voll 5/11 failure, voll 10/11 failure, voll 4/11 failure, voll 7/11 failure
- voll 5 streu-fern G BAHNWECHSEL im Wiederlauf erneut rot: KEIN Flackern, ein echter Befund am neuen Kopf (am Kopf 38365177 gruen; neu sind der Merge integ-probe c5e2fc8f mit wiese-nah K56 und gtx-ratschen).
