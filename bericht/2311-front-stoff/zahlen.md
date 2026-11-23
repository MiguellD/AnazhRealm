# front-stoff — Zahlen der vier Sprossen (GTX 1050, Vorprüf-Kopf 39b529326 auf main a8a9ab164 · Stations-Kopf pm-front-stoff 5f62727a0)

ZWISCHENSTAND · Karte 2 gebucht 76 von 1 718 (Koordinator 24.11. 00:0x).

| Sprosse | vorher (Radeon, Kopf 9ba0d950) | nachher (GTX 1050, front-stoff) | Urteil |
|---|---|---|---|
| same.physik.reaktion#1 | rauch_prop_abw 5,377 % | masse_abw 0,676 % · rauch_prop_abw 4,978 % (Soll ≤ 10) | GRÜN (Urteil der Station wörtlich) |
| planet.wasser.tiefsee#1 | sichtM 8,323 | sichtM 8,323 (Soll 8 ± 30 % ✓) — der S1-Teil der Leiter WÖRTLICH als ein eval (MEER + Mess-Block); rotProzent5m ungemessen: `_himmelsIrradianz()` ist nach dem Boot der GTX null (Welt-Tag 0,00003), die Farbe unter Wasser 0 | Station wörtlich auf der GTX OHNE Urteil: 5 von 6 Wasser-Leitern reißen am Deckel (tiefsee 30,0 s nach seegang 60 · gezeiten 30 · eis 40 · kreislauf 30) — Preis des Geräts; der Schnitt fasst Luft und Himmels-Licht nicht an (bild-himmel nur in den Nässe-Zweigen) |
| mensch.macht.wehrbau#2 | Jahrhundert erkannt 0,75 | Jahrhundert erkannt 0,75 (Soll ≥ 0,7) · Umfang 4 von 4 Stichjahren | GRÜN (Urteil der Station wörtlich) |
| same.gedaechtnis.alter#1 | seiten_delta 0,0021–0,0027 · albedo 0,0281 · Umfang 2 von 3 | albedo 0,0368 (Soll ≥ 0,02 ✓) · seiten_delta 0,0045 (Nord Δ 0,0368, Wetter Δ 0,0323) · Umfang 3 von 3 (putz, eisen, stein an stadt-voll) — Kopf 246aec4c7, Putz in der Zeit seiner Quelle | OFFEN: ROT an den Seiten (22 % des Solls 0,02) |

Zwischenkopf 88c870cd5 (Putz-Tage am Bild gestellt: Tau 400, Regen 50/40): albedo 0,1217 · seiten 0,0132 — das Bildpaar zeigte,
dass diese Tage falsch waren (die Wetterseite des Dorfs nach einem Jahr einheitlich oliv). Die Tage stehen jetzt aus der Quelle
(Fraunhofer IBP: der Aufwuchs zeigt sich in den ersten Jahren → P = 0,25 nach zwei Jahren, halb Tau, halb Regen).

## alter#1 — warum die Seiten offen stehen (gemessen, nicht gestellt)

- Die Welt dieser Saat trägt das Wetter aus N37W (`_alterWind` = Zug der Fronten (0,607, 0,795)). Das Fach „Nord" (n.z < −0,5) und
  das Fach „Wetter" (−n·g > 0,5) der Station decken sich auf 83 von 120°.
- Beide Seiten dunkeln mit DEMSELBEN Moos (Schatten: `nord`; Schlagregen-Ablauf: `lauf`, × Schlag) — Nord Δ 0,0368, Wetter Δ 0,0323.
- Nach 30 Tagen trägt der Putz (Quelle: Jahre) kaum Belag; die Differenz trägt der Stein. Ein Hebel, der die Seiten trennt, ist ein
  Vorgang mit anderem Vorzeichen (der Regen wäscht die Wetterseite, der Schatten verschmutzt) — er braucht eine gemessene Zahl je
  Stoff, die hier keine Quelle trägt; oder die Station misst getrennte Fächer. Messname: same.gedaechtnis.alter S1 seiten_delta.

## Der Regen des Sprungs (Messung, nicht Vermutung)

- `_regenSprung` ist in der Zeit deterministisch: am Dorf zweimal 9,040 Regen-Tage je 30 d, +120 s und +1 200 s Welt-Uhr gleich
  (`regen-probe.json`).
- Er hängt am Ort des Spielers (die Front-Linie biegt quer über 600 m): 500 m Ost 10,373, 500 m Süd 12,459, am Ursprung 8,995.
  An stadt-voll trugen zwei Läufe 11,10 (v3) und 6,15 (v7) — derselbe Sprung, ein anderer Ort des Spielers im Augenblick des Takts.

## Das Bildpaar (Dorf, römisches Haus: Stein, Putz, Eisen — kein Haus des Dorfs trägt Holz, Putz und Stein zugleich)

- `wetterseite-abend.png`: die Wand zur Wetterseite (n = (−0,365, −0,931)) im Streiflicht des Abends (Uhr 0,7) nach 365 Tagen
  (Nässe 109,1 Regen-Tage); Ziel = der Treffer des Strahls an der Wand (4,91 m hinter der Hülle der Teile), Kamera 3,5 m davor
  (frei 3,35 m), Blickfeld 80°. Abnahme grün, eine Pose.
- `lee-mittag.png`: die Lee-Wand mittags (Uhr 0,5), 19,25 m Abstand, Blickfeld 38°. Abnahme grün, eine Pose.
- Gesehen: der Putz der Wetterseite steht grau-beige, der Lee-Putz warm; der Sockel-Stein grau. Die Alterung liegt GLEICHMÄSSIG
  über der Wand — das Gesetz färbt je Ecke, eine Low-Poly-Wand trägt keine Flecken. Offen benannt (ein Muster in der
  Fragment-Stufe wäre ein eigener Schnitt).

## Geschnitten

- A `_regenSprung` (stamm/wasser-hydro.js): ein Sprung der Welt-Uhr trägt den Regen der Front — 30 Tage: Nässe 0 → 6,2–11,1 Tage.
- B/C `AnazhRealm._alterGesetz()` (stamm/bau-vorlagen.js): EINE Tafel je Art — Holz silbert, wo Regen trifft (USDA Wood Handbook
  2021 Kap. 16; Feist 1983), Putz eigenes Biofilm in der Zeit seiner Quelle (Fraunhofer IBP; UBA 17/2016 für die Lage), Stein
  Moos/Flechte, Eisen Rost; `_satzAlterStoff` liest die Art des Gefüges.
- D `uWetterVon` (stamm/stoff-material.js, dirigent-takt.js): EINE Wetter-Richtung aus dem Wind des Orts; das feste WSW in
  fachwerk-core fiel.

## Offen (benannt)

- alter#1 Seiten 0,0045 von 0,02 (s. oben).
- Der zeitlose `grau`-Ton und das ± `wetter` des Gefüges (studio-stoff `_gefuegeStoff`) sind ein zweiter, zeitloser Schreiber neben dem
  Alter-Gesetz.
- Die Alterung je Ecke trägt auf Low-Poly-Wänden keine Flecken.
- Preis: an stadt-voll kostet auf der GTX jede /lauf-Sekunde ≈ 11,5 s Wand; umstellen kalt 267–273 s.

## Wände vor der Abgabe (GTX 1050)

- check:statik GRÜN (53 Schritte; gate:betriebsgesetz Karte 2 77 von 1 718) · Anker-Probe: 53 genommene Zeilen, kein gebrochener Text-Anker · Probe-Tag-Wache des Zugs OK.
- Playtest (Null-Renderer): Zweig 3 rot → 0 rot, main 2 rot — die Familie `_depositLife` wackelt auf diesem Gerät (Register-Zeile).
