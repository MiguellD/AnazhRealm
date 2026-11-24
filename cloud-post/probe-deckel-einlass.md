# Vorprüfung probe-deckel-einlass — EIN Deckel je Probe, der Einlass kennt die Zeit je Tor, ein gescheiterter Vorfahrt-Blick gibt nicht nach

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 82 von 1 718 (diese Karte bucht keine Sprosse: ein Prozess-Schnitt am
Einlass der GPU-Probe, Auftrag kreatur-takt des Koordinators vom 24.11.).

**Geschnitten:** der Deckel je Probe ist EINE Zahl (`PROBE_DECKEL_S` 480 im env von `.github/workflows/gpu-probe.yml`; das Bein liest
sie, die GTX 1050 das Doppelte — vorher stand 480/960 als Zahl im Bein und der Einlass kannte sie nicht), `scripts/ci-zeiten.cjs`
schreibt je npm-Skript `gate:*`, dessen JEDER Befehl ein gemessener Schritt der Batterie ist, die Summe seiner Cloud-Sekunden
(`spec/ci/ci-zeiten.json` `skripte`, 117 Tore; der Schreiber vorher am Bestand byte-gleich bewiesen), und der Einlass weist jedes
Tor ab, das schon in der Cloud länger misst als der Deckel — beim Namen, mit beiden Zahlen, auch als `zeit:`; fehlt Deckel oder
Tafel, endet der Einlass ROT (kein stiller Durchlass).

**Gemessen:** die Probe 380dc644 (Zweig `auge-der-art`, GTX 1050) brach gate:kreatur-takt nach 1 134 s am Deckel 960 s ohne eine
Zeile — weder Boot (31 s, gemessen: Wand 177 s − Σ Proben 146 s) noch Schloss (17 s): das Tor ist eine Null-Welt ohne GPU mit
2 275 s Cloud-Arbeit in drei Teilen (742 · 937 · 596 s), auf der GTX 1050 das 2,1-Fache (herde 96 s gegen 44 s, querhang 27 s gegen
13 s), also ~80 min. Nach dem Schnitt weist der Einlass zehn Tore ab (haus-welt 2 311 · kreatur-takt 2 275 · mensch-anatomie 1 041 ·
persistence 891 · fall-waechter 885 · fahr-leben 828 · koerper-stand 793 · regler-wirkt 639 · settlement 507 · wasser-leben 481 s),
die Pflicht-Wände fahren weiter (stand-takt 267 · nacht-licht:echt 201 · studio-begehen 178 · weltbild-frost:echt 132 ·
tag-achse:echt 117 · webgl-probe 79 · pruefbuehne-licht 42 s). Die Linse: gate:apparat Klinge 7 fährt den echten Einlass mit
`[gpu-probe: gate:kreatur-takt]` und `zeit:gate:kreatur-takt`; die Mutanten „Einlass ohne Deckel“ und „Deckel als Zahl im Bein“
fallen beim Namen. `npm run check:statik` am Baum des Schnitts GRÜN (1 012 s, GTX 1050).

**Nachtrag Vorfahrt-Blick (Koordinator 10:58, am selben Chokepoint — der EINE Lauf mit Deckel und Vorfahrt):** ein 502 der API
war bis hier ein Vorfahrt-Fall (spiegel-eis 2adc05ed, Lauf 45368225622: gate:tag-achse:echt NACHGEGEBEN nach 81 s, ROT ohne
Verhalten). Geschnitten: der Blick liest 5xx und Netzfehler dreimal mit Abstand neu (2 · 4 · 6 s), 4xx nie; ein gescheiterter Blick
schreibt seine Zeile auf stderr (→ `$BLICK`), stdout trägt NUR den GELESENEN Vorfahrt-Fall — nur er gibt nach; die Probe misst
zu Ende, Kopf und Post nennen „Vorfahrt-Blick gescheitert: <status> (n-mal …)“ an der Probe; der Deckel misst die Wanduhr (ein
Blick, der neu liest, dehnte sonst den gezählten Deckel um seine Dauer). Die Linse (gate:apparat, Klinge 7) fährt den echten
Text des Beins: den Blick gegen eine gestellte API (502 → 4 Rufe, stdout leer, die Zeile auf stderr · 502 dann frei → 3 Rufe,
still · Netzfehler → 4 Rufe · 404 → 1 Ruf · echt-Job wartet → der Karten-Job beim Namen) und den EINEN Lauf in bash („Blick wirft
502“ → das Kind misst seine 8 s zu Ende, RC 0, die Zeile liegt in `$BLICK`; „echt-Job wartet“ → NACHGEGEBEN, ein Kind von 20 s
fällt am ersten Blick); vier Mutanten fallen beim Namen (Blick gibt bei 502 nach · Blick ohne Geduld · Lauf überhört die
Vorfahrt · Kopf verschweigt den Blick). gate:apparat GRÜN 59 s, gate:ci-deckung GRÜN (GTX 1050, nach dem Nachtrag; die ganze
Statik-Kette fuhr vor ihm).

**Offen:** kein Teil von gate:kreatur-takt fährt mehr als Probe — sein Richter sind die drei Teile der Cloud-Batterie; wer die
Kreatur am Gerät sehen will, fährt die Linse an der Werkbank (`--werkbank <port>`). Die Tafel `skripte` altert mit der Batterie:
ihr Schreiber ist derselbe Lauf, der `schritte` schreibt.
