# Vorprüfung ort-ausstattung (c18ad5eb): der Ort weist sich aus

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 58 von 1 718.

**Geschnitten:** EIN Gesetz im fachwerk-Kern (`ortAusstattung`, fachwerk-core.js:11731) leitet die Ausstattung eines Orts aus
Rolle, Epoche und Netz ab: das Schild an der Tür-Wand jedes Sonderbaus (`SCHILD_GESETZ` :9161, Band USSC 1 Zoll je 10 Fuß), das
Hauszeichen je Rolle aus 19 Motiven (`HAUSZEICHEN_GESETZ` :9415, Band Rijksmuseum Gevelsteen 57,5 × 60 cm), das Marktkreuz auf
dem Platz ab 958 in seiner Epoche (`MARKTKREUZ_GESETZ` :9491, Band Trierer Marktkreuz 5,22 m), den Grenzstein am Weg, wo die
Nähe zum Reich des einen in die des anderen wechselt (`grenzeAmWeg` :5613, Band OWL GR026 70 × 40 × 25 cm), und die Wache am Tor
ab 587 Köpfen (`wacheLose` :2751, Band Eurostat crim_plce 341 je 100 000). Die Welt liest jede Zeile über den EINEN Export und
`AnazhRealm.ORT_AUSSTATTUNG` (stamm/siedlung-ort.js:3796): `_hausStueckSetzen` :609, `_grenzSteinSetzen` :3558.
**Gemessen:** schrift#1 Anteil 0 → 1,00 (69/69 Sonderbauten in stadt-voll), bildkunst#1 Werke 0 → 17 (Motiv 16/16, gleiche
Paare 0), grenze#1 Steine 0 → 3 an 3 Kanten, megastadt#1 Wachen 0 → 1; je Stück 1 Draw, L3 ≤ 48 Dreiecke; die GPU-Proben
80329815 (bild:stadt-voll) und c18ad5eb (pruefbuehne-licht, weltbild-frost:echt, studio-begehen, webgl-probe) GRÜN; der Heap
der vollen Stadt vorher ↔ nachher misst die Sonde gerade (Zeile folgt).
**Ehrlich offen:** `mensch.netz.stoffwechsel#1` fällt nicht, am Band der Quelle entschieden: Gas-Straßenlicht gibt es ab 1807
(Pall Mall), jedes Plan-Jahr liegt zwischen −105 und 1549 (Saaten 1–40), eine Leitung unter der Straße von 1238 bräche das
Epochen-Gesetz — die Laterne trägt heute `gas:true` im Jahr 1238 ohne Leser (fachwerk-core.js:6621), und die Station wirft bei
Leitungen > 0 „Messung nicht gebaut“ (k2-mensch-netz.js:474, Zweig punkte-maschine); das Bild von stadt-voll zeigt keines der
Stücke (unten); die Streife der Wache fehlt (stamm/siedlung-verkehr.js:431).

## Je Sprosse (vorher → nachher, gleiche Bedingungen)

| Sprosse | Messung | vorher | nachher | Commit |
|---|---|---|---|---|
| `mensch.kultur.schrift#1` | Sonderbauten mit lesbarem Schild ihrer Rolle (stadt-voll 7/300) | 0 / 69 | 69 / 69 (Anteil 1,00 ≥ 0,9) | 684ccda |
| `mensch.kultur.bildkunst#1` | Werke am Ort · Motiv gefunden · gleiche Paare | 0 · – · – | 17 (16 Hauszeichen + Marktkreuz) · 16/16 = 1,00 · 0 | 80329815 |
| `mensch.macht.grenze#1` | Grenzsteine an den Kanten des Wegenetzes | 0 | 3 an 3 Kanten, 2,2–3,0 m vom Weg | 6fd6303 |
| `mensch.macht.megastadt#1` (Bau) | Wachen in stadt-voll | 0 | 1, 22,6 m vom Torplatz | dadd52d |
| `mensch.netz.stoffwechsel#1` | Leitungen | 0 | 0, offen (unten) | — |

Kosten je Stück: 1 Draw, Dreiecke L0 / L1 / L3 — Schild 284–1 264 / 52–224 / 12–48, Grenzstein 104–148 / 60–72 / 12–24,
Hauszeichen 260–392 / 26–48 / 12, Marktkreuz 280–328 / 88–124 / 46 (Budget 3 400 / 620 / 48); Wurf-IoU zur L0 0,92–1,00 (Soll
0,85), Pop am Wechsel 0 Täter. Vertrag: die 37 alten Fälle byte-treu, +204 neue (Ratsche 37 → 241); der Plan außer den neuen Stücken
byte-gleich auf 7/300, 7/12, 21/150, 11/400.

## Bilder

- `origin/koordination:probe-post/ort-ausstattung/80329815-stadt-voll.png` (+ `.maske.png`), Läufer radeon-890m, ABNAHME GRÜN.
  Das eigene Auge: der Rahmen des Messorts (Kamera 842,49 / 451,79 → Blick nach Osten auf das Haus am Platz) zeigt KEINES der
  Stücke — das Marktkreuz steht 4,7 m rechts hinter dem Auge (109°, Plan 841,79 / 456,44), das nächste Schild 23,9 m links hinter
  ihm (Kapelle, 149°), das Hauszeichen in der Blicklinie 45 m hinter dem Haus. Der Beweis im Bild steht damit noch aus; die Lagen
  im Spiel misst die Werk-Sonde (Null-Renderer, Dorf 7/18: Hauszeichen 10/11, Marktkreuz 1/1, Schild 9/10 am Plan; das fehlende
  Paar hängt am Haus der Kapelle, das neben dem Genesis-Ort nicht steht).
