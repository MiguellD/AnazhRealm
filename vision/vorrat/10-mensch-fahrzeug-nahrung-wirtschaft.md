# Vorrat 10 — mensch: Fahrzeug, Nahrung, Wirtschaft (18 Leitern, Kopf e4eeee08)

**Zählung: A 1 · T 1 · F 3 · R 1 · B 12** — gelesen: alle 18 Leitern gegen den Code, davon 11 mit Fundstelle im Stamm und Station
gelesen, 7 (wirtschaft.*, nahrung.jenseits/strom) nur per Grep auf Absenz — ehrlich etwa 70 % gelesen, 0 % gemessen.

## Die fünf billigsten Sprossen

1. **mensch.wirtschaft.beruf 1 (T)** — „Schmiede 10 Uhr besetzt / 2 Uhr leer“ ist wortgleich der Richter von mensch.geist.tag 1, den
   mensch.K2#2 schon trägt (richter-tafel.json:20); die Station ist an Radeon UND GTX am Kopf e4eeee08 grün (gelesen). Es fehlt nur die
   Tafel-Zeile und eine Sitzung je Gerät für die Akte; Preis-Risiko Heap am Start-Dorf.
2. **mensch.nahrung.erdbau 1 (A)** — die Tafel-Zeile gelaende.K2#1 steht; Radeon (b3f9ae95) und GTX (715754fc) sind an verschiedenen
   Köpfen grün. Eine Paar-Fahrt am selben Kopf, ~2 min je Gerät.
3. **mensch.nahrung.flur 1 (R)** — jedes Dorf malt Äcker in Kanal G der Wege-Karte (stamm/siedlung-wege.js:1623-1651), sichtbar im
   Dorfbild. Neuer Richter nach dem Muster STADT_KAMERA (stationen/g5.js:1315): Kamera auf einen Acker aus v2.felder, Acker-Pixel gegen
   Wiese zählen, Mutante Kanal G aus.
4. **mensch.fahrzeug.medium 1 (F)** — fahrzeug.K1#2 misst Gras/Weg 1,63× und nass 1,72/1,48× nur headless. Die Kette
   (scripts/lib/fahr-proben.cjs:409) als Probe fahrKette nach dem Muster fahrRueck in die Sitzung heben und das Bild-p95 der Bremsfahrt
   urteilen — Preis-Risiko: die GTX riss am 14.11. bei 36 km/h mit 35,4 ms.
5. **mensch.nahrung.hand 1 (F)** — feld.K4#2 (headless) urteilt genau „gepflückt → nach 1 h 0 zurück → nach 36 h ≥ 90 % zurück“. Als
   Seiten-Probe in die Sitzung beider Geräte heben, die Rückkehr gezeichnet zählen; die Nah-Wiese trägt kein bekanntes Preis-Risiko.

Danach: mensch.nahrung.tier 1 (B, S: das Füttern als Tat fehlt, die Folge-Probe p95 4,91 m steht headless) und mensch.fahrzeug.form 1
(B, S: die Trägheit des Teile-Werks folgt dem Volumen, nicht den kg).

## Funde, die über das Paket hinaus gelten

- **mensch.K2#2 trägt drei Leitern**: menge.rhythmus 1, geist.tag 1 (beide in der Tafel) und wirtschaft.beruf 1 (fehlt). Eine Zeile,
  kein Bau.
- **Beleg lenker überholt**: „kein Bewohner fährt mit Können“ — seit PFLICHT C fahren ≥ 20 Bewohner mit Folge-Deckel und Halt-Grund
  (stamm/siedlung-verkehr.js:1568, W.grund). Es fehlen 1 h, Zeitlücke, Reisetempo und die Sitzung (F, nicht B).
- **Beleg form verrutscht**: stamm/koerper-fahrt.js:550 ist heute die Sitz-Pose; das Teile-Werk fährt über :1013-1078. Seine Masse ist
  `_compoundSizeFactor` (Volumen, :893), die kg der Teile (_fahrMasse :3014) lesen nur Wasser-Term und Stoß — ein Eisen- und ein
  Holz-Wagen gleicher Gestalt fahren gleich.
- **Beleg gestalt ungenau**: die „5 Gattungen“ sind 5 Kultur-Linien EINES Presets gt (vehicle-core.js:4504/4520); in der Welt fahren 3
  Typen (stamm/siedlung-verkehr.js:2241). Der Blind-Erkenner fehlt wie bei spielgang.K2 (kein Bild-Modell-Läufer).
- **Beleg tier**: die Bindung entsteht aus der Geste „folge mir“ und gemeinsamer Nähe (stamm/kreatur-verhalten.js:35-44,
  stamm/feld-sprache.js:1078), nie aus Füttern.
- **Medium hat mehr als der Beleg sagt**: Furt (_fahrTiefe, stamm/koerper-fahrt.js:1777) und Seitenwind (:1844) wirken im
  Fahr-Schritt, nicht nur als Widerstand in vehicle-core.
- **Eine Kette trägt vier Leitern**: stoffstrom 1, energie 1, markt 1 und handel 1 hängen am selben Bau (Erz-Halde → Esse mit
  Holzstapel → Stand mit Bestand → Wagen mit Ladung). Einzeln sind alle vier L; in einer Welle gebaut wäre jede Sprosse ein Richter.
- **Eine Fahr-Probe mit Bild-p95** (fahrKette) wäre auch der Preis-Richter für form 1 und medium 2.
