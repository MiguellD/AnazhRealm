# kreatur-takt auf der GTX 1050 — die Zeit je Schritt (24.11., ZWISCHENSTAND)

Karte 2 gebucht 82 von 1 718. Diese Karte bucht keine Sprosse: sie ist ein Prozess-Schnitt am Einlass der GPU-Probe.

**Geschnitten:** der Deckel je Probe ist EINE Zahl (`PROBE_DECKEL_S` 480 im env von `.github/workflows/gpu-probe.yml`; das Bein liest
sie, die GTX 1050 das Doppelte), und der Einlass weist jedes Tor ab, das schon in der Cloud länger misst — in Sekunden, bevor ein
Läufer erwacht (Zweig `probe-deckel-einlass`, Kopf f4158c03e); im selben Zweig gibt ein gescheiterter Vorfahrt-Blick nicht mehr nach (Nachtrag unten). **Gemessen:** die 1 134 s sind weder Boot (31 s) noch Schloss (17 s):
gate:kreatur-takt ist eine Null-Welt ohne GPU mit 2 275 s Cloud-Arbeit in drei Teilen, die als EINE Probe unter EINEM Deckel fuhr —
auf der GTX 1050 kostet dieselbe Probe das 2,1-Fache (herde 96 s gegen 44 s, querhang 27 s gegen 13 s), das ganze Tor also ~80 min.
**Offen:** kein Teil der Linse fährt mehr als Probe (er braucht keine GPU; sein Richter sind die drei Teile der Cloud, check.yml
Gruppen 4 · 5 · 12) — wer die Kreatur am Gerät sehen will, fährt `diag-kreatur-takt.cjs --werkbank <port>`.

## Die Probe 380dc644 (Zweig `auge-der-art`, Lauf 45340636585/2, GTX 1050) je Phase

| Phase | s | Urteil · Quelle |
| --- | --- | --- |
| Warten am Schloss | 17 | Hook 08:04:12 → 08:04:29 (eine Hand-Sitzung gab frei) |
| Baum | 0 | node_modules bleiben (package-lock 12b68ea2) |
| gate:kreatur-leben | 167 | GRÜN |
| gate:kreatur-takt | 1 134 | ROT am Deckel 960 s, ohne eine Zeile: die Linse druckt ihr Urteil erst nach allen Läufen |
| bild:wiese@0.5 | 139 | GRÜN |
| gate:webgl-probe | 146 | GRÜN |

## gate:kreatur-takt je Schritt

| Schritt | Cloud (s, spec/ci/ci-zeiten.json) | GTX 1050 (s) |
| --- | --- | --- |
| Boot der Null-Welt (statikServer, Chrome, Welt wach) | — | 31 gemessen (Wand 177 − Σ Proben 146) |
| Proben herde · querhang · mahl, `--selftest` (14 Täter) | 44 · 13 · 89 (DAUER_S; mahl im Maß von jagdkreis) | 96 · 27 · 23 gemessen (10:20, Kopf d0171d26) |
| Teil 1/3 (bewohner 660 s …) | 742 | ~1 560 (× 2,1) — über dem Deckel 960 |
| Teil 2/3 | 937 | ~1 970 |
| Teil 3/3 | 596 | ~1 250 |
| das Tor ganz (ein Prozess nach dem anderen) | 2 275 | ~4 800 — der Deckel brach es bei 1 134 · 1 127 · 1 115 s |

## Der Schnitt (Zweig `probe-deckel-einlass`)

| Stück | Datei | Leser |
| --- | --- | --- |
| EIN Deckel: `env: PROBE_DECKEL_S: 480`; das Bein `DECKEL=$PROBE_DECKEL_S`, GTX `$((2 * PROBE_DECKEL_S))` | .github/workflows/gpu-probe.yml | Einlass und Bein |
| die Zeit je Tor: je npm-Skript gate:*, dessen JEDER Befehl ein gemessener Schritt der Batterie ist, die Summe (117 Tore) | scripts/ci-zeiten.cjs `skriptZeiten` → spec/ci/ci-zeiten.json `skripte` | der Einlass (`EINLASS_JS`) |
| der Einlass weist ab: „misst in der Cloud N s, der Deckel je Probe ist 480 s“ (auch als `zeit:`); fehlt Deckel oder Tafel, endet er ROT | .github/workflows/gpu-probe.yml | — |
| die Linse: Klinge 7 fährt den echten Einlass mit `[gpu-probe: gate:kreatur-takt]` und `zeit:gate:kreatur-takt`; Mutanten „Einlass ohne Deckel“ und „Deckel als Zahl im Bein“ fallen beim Namen | scripts/diag-apparat.cjs | gate:apparat (check:statik) |

Abgewiesen wird heute (Cloud-Zeit > 480 s): haus-welt 2 311 · kreatur-takt 2 275 · mensch-anatomie 1 041 · persistence 891 ·
fall-waechter 885 · fahr-leben 828 · koerper-stand 793 · regler-wirkt 639 · settlement 507 · wasser-leben 481. Die Pflicht-Wände
der Wurzel-Schnitte fahren weiter: studio-begehen 178 · weltbild-frost:echt 132 · pruefbuehne-licht 42 · nacht-licht:echt 201 ·
tag-achse:echt 117 · stand-takt 267.

## Die Wände (am Kopf des Zweigs)

| Wand | Urteil | s |
| --- | --- | --- |
| npm run check:statik (am Baum des Deckel-Schnitts, vor dem Nachtrag) | GRÜN | 1 012 |
| gate:apparat (Klinge 7 mit Deckel und Vorfahrt-Blick, 6 neue Mutanten fallen beim Namen) | GRÜN | 59 |
| gate:ci-deckung | GRÜN | — |
| gate:betriebsgesetz am Kopf | GRÜN | — |
| Probe-Tag-Wache (Beitrag 5 Dateien, keine Siedlung) | OK | — |

Die Cloud-Batterie (`[ci voll]`) und die Probe `[gpu-probe: gate:webgl-probe]` fahren am Kopf f4158c03e — das Bein liest dort
zum ersten Mal `DECKEL=$PROBE_DECKEL_S`.

## Nachtrag Vorfahrt-Blick (Auftrag 10:58, derselbe Zweig, derselbe Chokepoint)

**Befund:** spiegel-eis 2adc05ed (Lauf 45368225622, GTX 1050): gate:tag-achse:echt „NACHGEGEBEN nach 81 s (Vorfahrt-Blick gescheitert:
502 …)“ → ROT ohne Verhalten. Die Wurzel: der Blick schrieb sein Scheitern auf stdout, und jede Zeile auf stdout war ein
Vorfahrt-Fall.

| Stück | vorher | nachher |
| --- | --- | --- |
| 5xx · Netzfehler im Blick | ein Ruf, dann nachgegeben | dreimal neu mit Abstand 2 · 4 · 6 s (4 Rufe), 4xx nie |
| ein gescheiterter Blick | stdout → NACHGEGEBEN, das Bein ROT | stderr → `$BLICK`; die Probe misst zu Ende |
| NACHGEGEBEN | nach JEDER Zeile des Blicks | nur nach dem GELESENEN Fall (hook.log oder Karten-Job in der Schlange) |
| Kopf und Post | — | „Vorfahrt-Blick gescheitert: <status> (n-mal, ein gescheiterter Blick gibt nicht nach)“ an der Probe |
| der Deckel | zählte Schlaf-Schritte (ein langer Blick dehnte ihn) | misst die Wanduhr (`$SECONDS`), der Blick fällt je `BLICK_TAKT` 30 s |

Selbsttest (gate:apparat, am echten Text des Beins): der Blick gegen eine gestellte API — 502 → 4 Rufe, stdout leer, die Zeile auf
stderr · 502 dann frei → 3 Rufe, still · Netzfehler → 4 Rufe · 404 → 1 Ruf · echt-Job wartet → „Karten-Job „echt gtx1050“ (Lauf 7)
wartet auf diesen Läufer (gtx1050-gpu)“; der EINE Lauf in bash — „Blick wirft 502“ → das Kind misst seine 8 s zu Ende (RC 0, die
Zeile liegt in `$BLICK`), „echt-Job wartet“ → NACHGEGEBEN, ein Kind von 20 s fällt am ersten Blick. Mutanten, jede fällt beim
Namen: Blick gibt bei 502 nach · Blick ohne Geduld · Lauf überhört die Vorfahrt · Kopf verschweigt den Blick.
