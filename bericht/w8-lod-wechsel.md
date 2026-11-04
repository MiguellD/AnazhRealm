# w8-lod-wechsel — der Stufen-Wechsel (lod.K4#1, lod.K5#1)

Geschnitten: das Spiel misst den Schirm am Fenster-Wechsel (`stamm/dirigent-ankunft.js` resize-Halter, Zweig `w8-lod-wechsel`
d2b8c66c) — die Station lod.K4 fährt 1920 → 640 und schoss danach ohne Takt mit dem alten Schirm (die Zeit-Auflösung in alter
Größe: dunkel, gerastert); lod.K5#1 stellt die Tor-L0 in die Pose des Spiels (`bericht/2910-lod-k5/kanten.js` `pose`, Urteil in
`stationen/g3.js`: ein Tor-Fall ohne Winkel ist ein Bruch, vier Proben).
Gemessen (Radeon 890M): lod.K4#1 Luma-Sprung 8,11 % → 1,61 % GRÜN (punkte run am d2b8c66c), der Boden von schatten.K4 0,17 → 0,53;
lod.K5#1 Tor 14,63 → 7,52 px (Kathedrale L1 9,95 → 0,67 px, Geisttor L2 14,59 → 7,52 px), Baum 5,19 · Haus 5,20 · Wagen — unverändert.
Offen: lod.K5#1 bleibt ROT an der Gestalt der Stufen in den Kernen (Baum L1/Karte, Haus L2, Geisttor L2) und am Wagen ohne Bild.

## FUND

- phyto-core.js (Baum-L1, Weide) · die L1-Krone trägt Ruten und Wedel anders als die L0 (Ruten fehlen oben, Wedel reichen 14 px
  tiefer) · lod.K5#1 Baum 5,19 px @12 m, Karte 3,66 px @26 m · groß (Stufen-Gestalt im Kern, Byte-Beweis)
- fachwerk-core.js (Haus L2, alemannisch) · der Giebel trägt den Stoff des Dachs (rot statt Fachwerk), Luma derselben Pixel 52,3 →
  43,9 (−16 %) · lod.K5#1 Haus 5,20 px, lod.K4 · mittel (Kern, Byte-Beweis)
- porta-core.js:270 (TOR_DETAIL_2 `anteil` 0,15) · die Geisttor-L2 verliert das Gitter der Flügel (nur der Rahmen bleibt) · lod.K5#1
  Tor 7,52 px · mittel (Kern)
- bericht/2910-lod-k5/kanten.js (Wagen) · die Limousine zeichnet im Schuss weder L0 noch L1 (0 px, 19 Slots gestellt) · lod.K5#1
  Wagen — · klein bis mittel (Zeichnung der Wagen-Instanz am Ort der Probe)
- punkte run --nur lod.K1#1 / lod.K2#1 / lod.K5#1 am d2b8c66c einzeln oder zu dritt: Deckel 45/26/28 s in kalter Welt gerissen (Ort
  wiese 44–155 s unter Fremdlast), UNGEMESSEN; der zweite Lauf endete vor dem Schloss — lod.K5 steht darum aus dem Lauf der Station
  (kanten.js dieses Zweigs) in warmer Welt am Zweig-Stamm, lod.K1/K2 sind am Zweig ungemessen (vorher d880c8e8: K1 kante 0,4412,
  K2 11,48 % Pop-Pixel/s); der Schnitt im Spiel feuert nur am resize-Ereignis

## Bilder

- lod.K4 vorher (alter Schirm): `C:/Users/micha/AppData/Local/Temp/claude/w3/w8-lod-wechsel-diag/r4/k4-vor.png`, `r4/k4-maske.png`
- lod.K4 nachher: `C:/Users/micha/AppData/Local/Temp/claude/w3/w8-lod-wechsel-diag/r15/k4-vor.png`, `r15/k4-maske.png`
- lod.K5 Tor vorher (L0 zu): `C:/Users/micha/AppData/Local/Temp/claude/w3/w8-lod-wechsel-diag/r2/stufen-tor_kathedrale_L1_ueber.png`
- lod.K5 Tor nachher (L0 in der Fern-Pose): `C:/Users/micha/AppData/Local/Temp/claude/w3/w8-lod-wechsel-diag/r14/stufen2-tor_kathedrale_L1_ueber.png`
