# w28-strahler — Entwurf der Abgabe (GTX 1050, 18.11., Kopf e5edfc239)

Zwischenstand, kein Stempel von mir. Bildpaare main ↔ Kopf 8cf2de228: `bericht/1811-strahler/ende/` (`ende-*.png` = Kopf, `main-*.png` = main). Die älteren `kopf-*.png` eine Ebene höher sind Stände VOR dem Auge — kein Beleg mehr.

## Deine drei Zahlen (Koordinator 10:25)

**(a) Herd — der Kreis am Gras.** Ein Glutbrunnen trägt 248,6 cd (Planck 2000 K × `emissiv.flamme` × Bett). Gezeigte Zahl aus dem Gesetz (`augeZeig`, Mitternacht A 0,2 lx, Umgebung S 0,551; frontale Fläche, linear vor der Tonkurve):

| Abstand | E | gezeigt | gegen fern (linear) | am Bild (Ausgabe-Luma über „ohne“) |
|---|---|---|---|---|
| 1 m | 249 lx | 2,27 | ×5,1 | nicht gemessen |
| 2 m | 62 lx | 1,68 | ×4,0 | ×2,61 |
| 3 m | 28 lx | 1,36 | ×3,5 | nicht gemessen |
| 7 m | 5,1 lx | 0,49 | ×1,9 | ×1,32 |
| 20 m | 0,6 lx | 0,08 | ×1,14 | ×1,20 (vier Brunnen) |

„Knapp“ ist also: am Bild steht der Kreis in 2 m beim 2,6-Fachen, in 7 m beim 1,3-Fachen des Grases fern jeder Quelle. Die Bild-Zahlen in 1 m und 3 m fehlen (kein Feld gesetzt) — 2 von 5 Zeilen offen.

**(h) Lava — Stein und Saum.** Am Bildpaar `ende/…-h-lava-nah-nacht.png` gemessen (Ausgabe-Luma, main → Kopf): Stein vor dem Saum 43,9 → 73,1 · Saum-Gras vorn 47,5 → 104,2 · Saum links 35,1 → 54,6 · nahes Gras 37,4 → 104,7 · Baumlinie 13,3 → 25,4 · Riss 75,7 → 109,2 (RGB 120/65/47 → 165/96/76). Der Stein steht am Kopf also NICHT kalt, das Saum-Gras ist warm — deine Beschreibung passt auf das ältere `kopf-h-lava-nah-nacht.png` (vor dem Auge) oder auf meinen Schuss a9 mitten im Platz-Wechsel des Pools. Der wahre Befund am Kopf ist das Gegenteil und reißt das Zielbild (b): die ganze Wiese steht orange, die Baumreihe trägt Schein (×1,9 über main), die Risse gehen ins Rosa-Weiße. Ursache: die Decke trägt 817 325 cd (Mittel 6 261 cd/m² × Fläche), Reichweite am Deckel des Pools 48 m; das q-Gesetz staucht, begrenzt aber nicht. Die Keule ist nicht der Täter (Lamberts Scheibe steht, eine nach oben schauende Fläche über der Decke bekommt F·N ≤ 0, das Gras liest den waagrechten Anteil als Volumen). Deine Entscheidung: bleibt das Datum der Lava, bleibt die orange Wiese.

**(e) Gasse — Boden unter dem Fenster.** main 6,8 ↔ fern 17,9 · Kopf 8,4 ↔ fern 18,8. Das Fenster wirft kein Becken: die Kette reißt am Anfang — `_leuchtQuellen` sammelt Blocker mit „licht“ (Feuer, Laternen), Brand, Lava und das Licht des Auges; das Fenster trägt nur sein Datum der Glut (`lichtGlut.fenster`, gemalt), kein Eintrag als Quelle. Punkt 2 steht OFFEN bei 0 %. Dazu: die Wand 61,6 → 76,3, der Boden unter der Laterne 49,4 → 29,2 (ihr Kreis ist am Kopf dunkler als auf main), Laterne ÷ ferner Boden 1,55.

**Probe-Boot:** die S-Form trägt das Becken nicht (a8: Wiese 20 m ×1,38, Vordergrund ×1,94, kein Kreis) — q bleibt fürs Becken, die S-Form ist sein Deckel und das Gesetz der leuchtenden Flächen.

## Geschnitten

- **EIN Strahler-Gesetz:** jede Quelle trägt Candela (Leuchtdichte × Fläche), kein `staerke`-Datum, kein `reichweiteM`, kein Zeitplan. Vertrags-Akt: `recipes.json` + `manifest.json` neu geprägt.
- **DAS AUGE** (welt-licht.js `AUGE`, p 0,2 · q 0,42 · Knie 2,76 lx aus `MESOPISCH`): `augeZeig` = min(q-Gesetz, S-Form); leuchtende Flächen lesen `augeGlut`. Der Lichtmesser liest das Becken nicht.
- **Die Blende der Quelle (neu, nach 8cf2de228):** ohne Zeitplan brennt jede Quelle auch in der Dämmerung, und dort öffnet die Kamera weit über die Nacht (Sonne 0°: k 27,7 gegen 1,55). Für eine Quelle öffnet sie darum nie weiter als am vollen Nacht-Knoten (dasselbe Gesetz `belichtung`); EIN Faktor am EINEN Schreiber `_leuchtTakt` für Becken und Glut. Mittag und Nacht rechnen gleich.
- **Der Pool im Stoff:** drei Reihen → EINE `lichtForm`; die Normale vor der Schleife; die Reichweite der frühe Zweig.
- **Linsen aufs Gesetz:** pruefbuehne S0, stand-takt N7/L5, settlement, haus-fern, fahr-proben, portal-membran, hoehlen-sicht, post-kette (Rauch-Tafel am Auge neu gemessen). Mutanten: Feuer aus, Keule aus, zehnfache Candela.

## Gemessen

- **Tag-Achse** (gate:tag-achse:echt): main GRÜN · Kopf 8cf2de228 ROT — die Karte stand an der Wiese bei Sonne 0° 1,20 EV ÜBER dem Mittag, R/B ×3,08, Sprung 0,16 EV je 0,002 Uhr (vier Glutbrunnen in 13–22 m durch k 27,7). Mit der Blende: Buckel 0,00 · Sprung 0,04 EV · GRÜN. Rest: bei Sonne 10° färbt das Feuer die Karte noch (R/B ×2,40, main ×1,07; −0,39 EV gegen main −1,04).
- **Rauch unter dem Feuer** (post-kette k1): unten ÷ oben 5,95 → 3,32, die flache Scheibe 3,28 → 2,60 — das Auge staucht; Band neu 2,95–3,7, der Abstand zur Mutante ist dünner (1,28× statt 1,81×).
- **Preis** (gpu-bank 120 × 3, GPU ms, zwei Läufe je Stand, vor der Blende): Herd Nacht main 8,71/8,48 → 9,23/9,05; Herd Mittag 7,85/7,81 → 7,72/7,92; Lava Nacht 8,97/8,04 → 7,85/8,30. Becken an ↔ aus am Herd nachts ≈ +1,25 ms.
- **Boden-Programm:** 99 979 Zeichen WGSL vor der Blende (Ratsche 100 062).
- **Ohne Strahler gegen 3147ee406:** Mitternacht mittlerer Abstand 0,00, Mittag 0,03. Byte-Gleichheit gibt die Werkbank nicht her (zwei Boots desselben Kopfs sind nicht byte-gleich).

**Gatter:** am Stand e5edfc239 grün gefahren — pruefbuehne (Selbsttest), pruefbuehne-licht (Boden-Programm 99 992 Zeichen WGSL, Ratsche 100 062), stand-takt, tag-achse:echt; am Stand davor mit der Blende im Baum — post-kette, asset-contract, altlasten, haus-fern, hoehlen-sicht, portal-membran, settlement, check:statik; vor der Blende (8cf2de228) — fachwerk-contract, fahr-leben, betriebsgesetz. Kein EINER Lauf des ganzen Satzes am letzten Kopf. Am Kopf 8cf2de228 standen vier Gatter rot, die ich bis dahin nie gefahren hatte: pruefbuehne (mein `eval` riss an der CSP), post-kette (Rauch-Tafel), altlasten (zwei Warte-Schleifen der neuen Linse), tag-achse (der Buckel oben).

## Ehrlich offen

- **Fenster als Strahler: 0 %** (Punkt 2). Ebenso Stahl, Tor, Fahrzeug, Funken auf alten Wegen.
- **Lava reißt Zielbild (b):** orange Wiese, Schein an der Baumreihe, rosa-weiße Risse.
- **Rand 7 m ×1,32** unter dem Soll 1,5.
- **Der Laternen-Kreis** ist am Kopf dunkler als auf main (49,4 → 29,2).
- **Dämmerung bei Sonne 10°:** das Feuer färbt die Karte noch warm; die Bildpaare `ende-*` sind VOR der Blende geschossen (Nacht und Mittag unberührt, Dämmerung nie geschossen).
- **Zwei Leuchtdichten für das Herdfeuer** (Becken 548 cd/m², gemalte Glut 10 000) und **zwei Formeln** (Karte 0,80 ↔ Fenster 0,53).
- **stand-takt und settlement im Null-Renderer** (Mittag gestellt); **Preis** ohne Richter, nach der Blende nicht neu gemessen.
- Das Fachwerk-Labor ist im Browser angesehen (bootet ohne Fehler, Fenster glühen nachts) — ein Blick, keine Linse.
