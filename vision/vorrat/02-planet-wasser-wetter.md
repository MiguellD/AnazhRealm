# Vorrat 02-planet-wasser-wetter — Fehl-Zettel je Leiter (gelesen am Kopf e4eeee08, nichts gemessen)

**Zählung:** A 1 · T 0 · F 3 · R 3 · B 5 (12 Leitern) — **gelesen: 12 von 12 Leitern; je Ziel-Sprosse Kern-/Stamm-Stelle und
Stations-Fundstelle gelesen (Ausschnitte), ca. 80 %** — ungelesen blieben die Seiten-Skripte der Proben (`WASSER_ZIEL`, `unterwasserSeite`,
`k3Ganglinie`-Körper) und die Tiefe des Mess-Sees.

## Die fünf billigsten Sprossen

1. **planet.wasser.stroemung 1 (A)** — die Tafel-Zeile gelaende.K4#2 steht, Radeon und GTX grün an 71839b1e. Es fehlt nur die frische
   Fahrt am Kopf; Preis-Risiko p95 am Fluss (41,9 > 34 ms Radeon).
2. **planet.wasser.tiefsee 1 (R, S, ~2 min)** — leib.K3#2 läuft schon in der Sitzung beider Geräte, misst aber nur die Luma bis 2,5 m.
   Die Reihe `tiefen` um 5 m und das RGB-Mittel erweitern (g5.js:2528); nach dem Gesetz fällt Rot bei 5 m auf ~11 %, Secchi 1,7/0,22 ≈ 7,7 m
   (gegen 8 m) — gerechnet, nicht gemessen.
3. **planet.wetter.fremde-atmosphaeren 1 (R, S, ~3 min)** — die Luft-Linse in FERNE_SITZUNG misst den Himmels-Ton zu Uhr 0,5 UND 0,27,
   urteilt aber nur den Mittag und das gegen das eigene Hillaire-Modell (222° ±15). Foto-Soll unter spec/farbe + Abend-Urteil
   (licht-linsen.cjs:2631) trägt die Sprosse.
4. **planet.wetter.klimazonen 1 (F, S, ~5 min)** — 18/−4 °C am Meer stehen wörtlich im Kern (gelaende-core.js:1313-1320), die
   Schneegrenze wandert mit dem Pegel (stoffe.K3#2 headless: 178 m übers Jahr). Eine Probe in der Sitzung: `_temperaturAt(waterLevel)` zu
   Sommer-/Winter-Mitte + `bild --saison` an einer Hang-Pose zu vier Jahreszeiten.
5. **planet.wasser.seegang 1 (F, S, ~6 min)** — gelaende.K3#1 misst spiegelTreue 0,73 an EINER Pose (GTX), die Radeon hat kein Urteil.
   Dieselbe Probe als Schleife über 12 Schüsse (`bild --uhr --wetter`, Ego/Third) — Risiko: Pearson auf der Nacht-Pose.

Danach: **planet.wasser.kreislauf 1 (F, S)** — die headless-Ganglinie (Lag, Bilanz) als `W eval` in die GPU-Probe am Bach hängen,
Bilanz ±10 % statt ±30 %, Lag im Snyder/Hack-Band statt „> 1“ (headless heute 1,006/0,98 — nach dem Text im Band).

## B — was das Spiel nicht kann (kleinster Bau)

- **gezeiten 1 (M):** Meer konstant Basis − 3 (gelaende-core.js:2736), der Pegel „nie das Meer“ (1558); Bau `gezeitHub(t)` neben `pegelLauf`.
- **eis 1 (M):** es schneit nie — der Niederschlag ist immer die Regen-Schliere (stamm/bild-himmel.js:977); Preis „im Schneefall“ ohne Szene.
- **extreme 1 (M):** der Pegel klemmt an der Krone ~0,2 m, „die Aue nicht gerechnet“ (gelaende-core.js:1569, 1630).
- **vorhersage 1 (M):** die Deckung ist EIN Uniform für den ganzen Himmel (welt-licht.js:1157), nie windauf zuerst.
- **lagen 2 (L):** kein Druck, keine Winddrehung an der Front, eine einzige Wolkenschicht; `wetterAt` gibt nur {zeile, front, feuchte}.

## Funde über das Paket hinaus

- **EIN Schneegrenzen-Richter trägt zwei Leitern:** die Probe „Schneegrenze im Bild je Saison + `_temperaturAt`“ deckt klimazonen 1 ganz und
  den Grenzen-Teil von eis 1 (dort fehlt dann nur der Schneefall-Bau).
- **Kein 2AFC-/Blindtest-Werkzeug existiert** (0 Treffer in scripts/ und stationen/), keine Referenz-Filme/-Fotos für Wolken oder Himmel
  unter spec/. Ein gemeinsamer Wahl-Paar-Richter (Bildmodell, Foto-Ordner) trüge wolken 1–2, seegang 3, tiefsee 2, lagen 3, vorhersage 2
  und den Foto-Teil von fremde-atmosphaeren 1 — Muster: spec/abnahme/llyn-padarn.png als Foto-Soll der spiegelTreue.
- **Die Front-Skala ist Minuten, die Karte spricht Stunden:** die Bänder (2,5–6,6 km bei 11 m/s, phyto-core.js:4316-4317) gehen in 4–10 min
  durch; vorhersage 1 („60 min davor“) und lagen 2 verlangen Stunden — eine Umstellung der Wellenlängen bewegt wetter.K1#2 (Lag 240 s).
- **Höhen-Stauchung entschärft Richter:** die Welt staucht 3 km auf 160 m (gelaende-core.js:1304); „±150 m“ (eis 1) ist auf einer Landform
  bis ~200 m fast keine Schranke, „Erd-Höhe ±20 %“ (klimazonen 2) ist ohne neue Landform unerfüllbar.
- **Beleg-Abweichungen (der Code gilt):** gezeiten zitiert gelaende-core.js:2687 — die Konstante steht heute in 2736-2745; lagen zitiert
  phyto-core.js:4067-4091 — `wetterAt` steht heute in 4419-4450. Inhaltlich stimmen beide Belege.
- **gelaende.K3#1 hat an der Radeon kein Urteil** (zahl null) — die Sprosse seegang 1 braucht die erste Radeon-Fahrt überhaupt.
