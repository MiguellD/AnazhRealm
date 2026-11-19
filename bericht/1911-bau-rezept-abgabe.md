# Abgabe bau-rezept-tuer (Heiler w28-bau-rezept ff2b8341)

Kopf: 13d71638aa509fd6152406c2036d0649b8bedd69 (origin/bau-rezept-tuer, per ls-remote belegt), Merge main 986eff04 ohne Konflikt.

## Wurzeln
- Steckenbleiber werkstatt #28191 und Soll-Orte: der Geh-Planer las die rohe Haustür (sl.tuer) des Hof-Hauses, ihr Vorpunkt lag im geschlossenen Hof, und der Brunnen stand auf der Achse der Tür.
  Schnitt: `stamm/siedlung-bewohner.js` ~Z. 769-776, 813, 841-849 (`_bewohnerListe`: Eingang über `FC.eingangVon`, `orte.ein` vor dem Tor, Stände vor dem Tor mit der Haustür als `anker`), `_bewohnerWeg` (Gang Tor -> Hof -> Tür), `fachwerk-core.js` `hof()` (Brunnen neben dem Eingangs-Korridor).
- Stadt-Durchdringung 40 Takte: dieselbe Wurzel (Hof-Häuser der Stadt), NICHT gate:haus-welt W7 (W7-Zeile „zweites Dorf" ist der erwartete Ausschlag des Selbsttests bauwand).

## bewohner headless (diag-kreatur-takt --proben bewohner,begegnung,zielplan, gleicher Baum)
| Zeile | vorher (Zweig) | nachher | main 986eff04 |
|---|---|---|---|
| Steckenbleiber Dorf | 4 (werkstatt #28191) | 0 | 0 |
| Soll-Orte min | 0,637 | 0,983 | 0,983 |
| Stadt Durchdringung | 40 Takte | 0 | 0 |
| Stadt Steckenbleiber | 13 | 0 | 0 |
| Wiederkehr über 2 m | 22 | 0 | 0 |
| Dorfplatz 10 Uhr im Blick | 9 Ego / 10 Third | 9 / 10 (ROT, Soll >= 10) | 31 / 34 |

Teil 2 nachgerechnet: ja.
- begegnung: ROT vorher und nachher (Zeuge rathaus #952 weicht nicht, fort 0; main 19,3).
- zielplan: vorher ROT (23 Uhr 11 % ohne Ziel, Brüche); nachher nur noch „Rollen ohne Ziel-Ort: gasthaus (1, gebunden 1)" ROT (main gasthaus [1,1,16]); werkstatt [2,3,6].

## Goldens
spec/asset-contract/v6/golden/haeuser.json neu gemintet: 8 Fälle (marokkanisch s7/s12345 x L0-L3), 14 Werte, je -48 Ecken (Brunnen fällt im engen Hof).

## gate:haus-welt
GRÜN beide Teile (18 min 50 s), Lauf an früher Fassung der Bewohner-Änderung vor dem Brunnen-Schnitt — am Kopf 13d71638 nicht wiederholt.

## Bild
Werkbank headless (Radeon, WebGPU, gpu-lauf.sh, Kopf 13d71638), werkstatt #28191 des Start-Dorfs um 7,8 Uhr:
- `C:\Users\micha\AppData\Local\Temp\claude\b95c25d6c0e867eb\f6f6f5fc-61d9-4857-94d5-77df7097c28a\scratchpad\bau-rezept\hof-oben.png` — Hof mit Torriegel (offenes Tor), Haustür hinten auf der Achse, Brunnen neben dem Korridor links, Bewohner draußen am Weg.
- `...\bau-rezept\hof-gang.png` — Draufsicht in den Hof (die Namen der beiden Kameras sind vertauscht).
Der gefundene Bewohner (werkstatt/werkstatt, t = 0,965 auf der Achse Tür -> Tor, also im Tor) steht hinter dem Torriegel und ist in keinem der beiden Bilder sichtbar: „Bewohner an seiner Tür im Bild" ist UNBELEGT.

## Unbelegt
- imBlick 9/10, begegnung fort 0, zielplan gasthaus gebunden 1: zweig-eigen (vorher schon ROT), Wurzel vermutet im Raumprogramm des Zweigs (sollSumme 77 -> 64, andere Häuser am Platz), nicht belegt, nicht geheilt.
- begegnung-Befund (Werkbank, weichen-zweig.json): die Zeugen rathaus #952 finden um 10 Uhr 9–39 freie Stände jenseits R = 25 m mit Weg, der nie näher an die Tat führt (Tat 5 m neben dem Stand nachgestellt) — die Wurzel von fort 0 liegt also nicht in fehlenden Ständen; unbelegt.
- diag-fachwerk-contract ohne MINT_FORCE am Kopf: GRÜN (cv:6).
- gate:haus-welt am Kopf nicht wiederholt; check:statik am Kopf 13d71638: exit 0 (statik2.log; die eine ❌-Zeile ist ein Selbsttest-Ausschlag).
