# Vorrat 16.11. — der Brief der Lese-Batterie

**Zweck (vor jeder Zahl):** Die Meisterkarte 2 (`vision/meisterkarte-2.json`, 1 718 Sprossen) steht bei 15 gebuchten. Das Tagesziel ist 25
Sprossen. Der Engpass ist nicht das Bauen, sondern zu wissen, WELCHE Sprosse dem Buchen am nächsten ist und was ihr genau fehlt. Du liest
EIN Paket der Karte gegen das echte Spiel und schreibst für jede Leiter den Fehl-Zettel ihrer nächsten offenen Sprosse. Aus allen Zetteln
entsteht die Rangliste, nach der der nächste Koordinator baut und misst. Du baust nichts und misst nichts — du liest und belegst.

## Die Regeln der Karte, die dein Urteil tragen

- **R2:** Eine Sprosse hebt nur ein Richter im ECHTEN Fenster auf echter GPU, mit der Kamera des Spiels, über das, was der Spieler sieht,
  hört oder tun kann. Headless, Studio, Code-Zitat und Grep zeigen Mechanik und heben nie eine Sprosse.
- **R3:** Umfang, Tiefe und Preis halten in DERSELBEN Fahrt an der dichtesten Pose des Richters. Preis „P“ = die Stufe der Preis-Treppe
  für den Umfang der Sprosse (im Paket: `preisTreppe`; Klasse Ort: Bild p95 ≤ 34 ms, kein Bild über 101 ms, Heap ≤ 400 MB gehalten,
  VRAM ≤ 256 MB).
- **Gebucht** wird ein Paar: Radeon 890M UND GTX 1060 am SELBEN Kopf grün.
- Die Brücke von Station zu Sprosse ist `vision/richter-tafel.json` (Zeile `{station, leiter, sprosse, richter: "gleich"}`); die Sitzung
  der Punkte-Maschine (`meisterkarte-quelle/punkte/punkte.cjs`) schreibt je Zeile eine Akte mit Messwert, Soll und Preis.

## Dein Paket

`vision/vorrat/eingang/<paket>.json` ist vorgekaut: je Leiter `misst`, `beleg` (der Stand vom 14.11. in Worten), `heute`/`kern`, die
Sprossen ab 1 (mindestens bis zur nächsten offenen + 1), ihre Tafel-Zeilen und unter `alt` jede Station der alten Karte, die auf dieser
Leiter misst: Text, Staffel, Gerät, letztes Urteil mit Zahl und Kopf, und die Fundstelle `stationen/gN.js:Zeile` (relativ zu
`meisterkarte-quelle/punkte/`).

## Was du je Leiter tust

Die **Ziel-Sprosse** ist die nächste offene: `heute + 1` (meist Sprosse 1). Trägt die Leiter für diese Sprosse schon eine Tafel-Zeile,
ist sie Klasse **A** (Richter steht — eine Zeile, weiter). Sonst:

1. Lies Umfang, Tiefe, Preis und Richter der Ziel-Sprosse wörtlich. Was müsste ein Spieler im Fenster sehen, hören oder tun können?
2. Suche im Spiel-Baum (Kopf `e4eeee08`), ob das Spiel das HEUTE zeigt: Grep nach den tragenden Wörtern in `stamm/`, den Kernen
   (`*-core.js` im Wurzel-Ordner, `cores.manifest.json`), `worlds/`, `index.html`. Belege mit `Datei:Zeile`. Lies gezielt Ausschnitte,
   nie eine ganze Stamm- oder Kern-Datei (viele haben 3 000–8 000 Zeilen).
3. Lies die alten Stationen der Leiter an ihrer Fundstelle (±40 Zeilen um `kriterium:`): WAS misst die Station, an welchem Gerät, als
   `probe` in der warmen Sitzung oder als `befehl` mit eigenem Boot/headless? Deckt ihr Urteil den GANZEN Richter der Ziel-Sprosse?
   Lies nie eine ganze `gN.js` (bis 470 kB).
4. Ordne ein:
   - **T** — eine bestehende GPU-Station (Radeon UND GTX, `probe` in der Sitzung) urteilt schon den ganzen Richter der Sprosse: es fehlt
     nur die Tafel-Zeile (und ggf. die frische Fahrt am Kopf).
   - **F** — das Spiel zeigt es, und eine Station misst das Richtige, aber headless, mit eigenem Boot oder an nur einem Gerät: sie muss
     als Probe in die Sitzung beider Geräte gehoben werden.
   - **R** — das Spiel zeigt es (der Spieler kann es heute sehen/hören/tun), aber keine Station urteilt den Richter der Sprosse: ein
     neuer Richter auf bestehendem Können. Nenne die Mess-Größe und WIE die Seite sie liest (welcher Zustand, welche Funktion, welches
     Bild-Maß — mit `Datei:Zeile` im Spiel) und die nächste bestehende Station als Muster (`stationen/gN.js:Zeile`).
   - **B** — das Spiel kann es nicht (oder nur ein Teil des Umfangs): nenne den KLEINSTEN Bau, der die Sprosse trüge — in welchem
     bestehenden Kern/Studio/Stamm-Modul (`Datei:Zeile` der Stelle, an der er ansetzt), nie ein neues Studio, nie ein Zwilling —
     und seine Größe S (≤ 1 Tag eines Arbeiters) · M (2–3) · L (mehr).
5. Schätze die Kosten bis zum Paar: `gpuMin` (Minuten Probe je Gerät), `bau` S/M/L für den Stations- oder Spiel-Bau, und nenne das
   **Preis-Risiko**: Bekannt rot sind heute Heap am Haus/Dorf nach dem Gang (417–549 MB > 400), Bild p95 am Fluss (41,9 > 34 ms an der
   Radeon). Liegt die dichteste Pose des Richters dort, sag es.
6. `sicher`: 0–1, wie sicher deine Einordnung ist. Du hast GELESEN, nicht gemessen — schreibe nie „grün“ oder „trägt“ ohne den Zusatz
   „gelesen“. Findest du einen Widerspruch zwischen `beleg` und dem Code am Kopf (der Beleg ist vom 14.11., seither sind ~40 Schnitte
   gelandet), gilt der Code; nenne den Widerspruch.

## Was du schreibst (genau zwei Dateien, nichts sonst)

`vision/vorrat/<paket>.json` — eine Liste, je Leiter EIN Eintrag:

```json
{
  "leiter": "same.preis.zugang", "sprosse": 2, "klasse": "F",
  "richter": "der Richter-Text der Sprosse, wörtlich",
  "hat": "was das Spiel heute zeigt — ein Satz mit Datei:Zeile (gelesen)",
  "station": "spielgang.K4#1 (headless, grün an d3708675)",
  "fehlt": "was bis zum Paar fehlt — ein Satz",
  "rezept": "die Schritte, höchstens drei Sätze: welches Muster (stationen/gN.js:Zeile), welche Mess-Größe, welche Pose",
  "messgroesse": "wie die Seite die Zahl liest (Datei:Zeile im Spiel) — bei B: wo der Bau ansetzt",
  "preisRisiko": "keines erkennbar | Heap am Dorf | p95 am Fluss | …",
  "gpuMin": 2, "bau": "S", "sicher": 0.7
}
```

`vision/vorrat/<paket>.md` — das Blatt für den Menschen, höchstens 60 Zeilen: oben eine Zeile mit der Zählung (A · T · F · R · B) und
dem Anteil, den du wirklich gelesen hast (ehrlich, in Prozent); dann die fünf billigsten Sprossen deines Pakets mit je zwei Sätzen;
dann Funde, die über dein Paket hinaus gelten (ein Richter, der mehrere Leitern auf einmal trüge; ein Beleg, der nicht mehr stimmt).

Schreibe die JSON-Datei FRÜH und schreibe sie nach je drei Leitern neu (gültiges JSON zu jedem Zeitpunkt) — die Sitzung kann jederzeit
enden, und nur was auf der Platte liegt, zählt.

## Grenzen

- Kein Fenster, keine Werkbank, kein Browser, kein Server, keine GPU, keine Messung. Kein Prozess, der länger als 30 s läuft.
- Du änderst keine Datei außer deinen zwei. Kein Spiel-Code, keine Station, keine Tafel.
- Deckel: 45 Minuten oder 200 000 Token — was zuerst reißt. Reißt er, schreibe den ehrlichen Stand ins Blatt („gelesen: 9 von 14“).
- Dein Schluss-Bericht: höchstens 8 Zeilen — die Zählung, die drei billigsten Sprossen, der gelesene Anteil.
