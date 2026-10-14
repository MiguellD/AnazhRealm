# Übergabe K43-2 tor-stufen (Kontext-Deckel erreicht)

Stand: Zweig tor-stufen, Basis integ-probe 45f1eeae hineingemergt.

Gebaut: der EINE Satz-Stoff (Regler je Ecke, gate:chunk-satz (n)), die Fern-Pose der Tor-Flügel (TUER_GESETZ.fern 0,5,
v4 +7 L1 neu gemintet), die Fahrzeug-Stufe 1 (vehicle-core FAHRZEUG_DETAIL_1, v3 +5 L1, Plattform-Ratsche 12 -> 17,
render-config +L1), Genesis-Anker 0/0 im Haushalt. Genesis Radeon: bau 65 -> 45 Befehle, 192 791 -> 160 215 Dreiecke.

CI 38536354482 (Kopf bec44ab5) 5/13: Quell-Proben lasen die Signatur `_foundryTreeMaterial(kind, mp, wiegen, baum)` (die
Satz-Marke reist jetzt als `mp.satzRegler`), die Nervensystem-Wände froren kindStages gate [0,3] / vehicle [0] ein (jetzt
[0,1,3] / [0,1]), der Schatten-Probe-Test verbot opacityNode (die Deckkraft lebt jetzt in colorNode.a). Lokal danach grün:
check:statik, streu-wahrheit, season-meadow, gegenstand-stoff, nervensystem-vehicle/-porta/-schmiede/-fachwerk, chunk-satz,
playtest:fast.

OFFEN (rot): gate:foundry-crossfade (7) KETTE OHNE PARTNER — die Linse erwartet Wagen und Tor nur mit L0. GT [0,1]: kein Loch
über den Sweep (die Probe hält), nur die Vorbedingung „nur L0" fällt. Drachentor: 0 Proben im Sweep — seit K43 (Runde 1)
zeichnet das Tor im Bau-Satz, die Probe liest nur Instanz-Gruppen. Nächster Schnitt: (7) wird zur Kette des Gesetzbuchs
(je gezeigte Stufe ihr Partner) und probt die Satz-Zellen (aLodLevel/aH0 je Ecke).
OFFEN (Ziel verfehlt): Dreiecke der Klasse bau 160k gegen 120k — die Tore der Stufe 1 tragen 87k im Hauptbild (Sehne 2,5 cm,
2 px am Ring), der Wurf-Satz 22,5k, das Haus der Vorschau 19k (fachwerk, nicht meine Zone); die Wirts-Bauten esse und welt_*
(21 Befehle, 1,5k Dreiecke) zeichnen je Mesh ohne Satz.
