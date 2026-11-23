# wetter-am-ort — Abgabe (ZWISCHENSTAND)

Zweig `wetter-am-ort`, vom Kopf von origin/main (a615ab5). Kopf der Arbeit: `241642f0890567ff2755abfe59aadd6880278ffc`.
Karte 2 gebucht 58 von 1 718 (diese Abgabe bucht keine Sprosse: gebucht wird erst, wenn der Richter am Zweig `punkte-maschine` sie grün misst).

## Der Schnitt

EIN Wetter-Feld je Ort als Kern-Gesetz (phyto-core `wetterFeldAm`, `WETTER_ORT`): die Front der Saat (`wetterAt`) stetig über
die Zeilen klar → nebel → bewölkt → regen → sturm gemischt, der Steigungsregen aus dem Relief gegen den Grundwind (Luv nasser,
Lee trockener), das Wort des Spielers ein EINGANG des Felds (`hier`: am Spieler gilt sein Wort samt Übergang, nach 3,3–6,6 km
die Front) mit Ausgleich im Lee (13,2 km windab: was das Wort an Regen zieht, fehlt dort). Dazu `windWeg` (der Weg der Luft als
geschlossenes Integral der drehenden Front) und `windProfil` (Hellmann, α = 1/7). Der Planet-Faden liest die Neigung des
Körpers (planet-core `planetOrt`, voxel-worker `planetPlanVon`).

Leser im Stamm (`_wetterFeldAm`, Bild/himmel): `_windAt` (Gras, Laub, Rauch — die Stärke am Ort), `_wolkenWind` (der Zug der
Wolken folgt dem Weg der Front statt dem festen Grundwind), `_rauchWindAt` (Brand, Druck-Staub, Kamin: Wind in der Höhe des
Teilchens über seinem Grund), `_bewohnerSoll` (der Tagesplan liest den Regen an der Tür), `_tickWerkGesetz` (das Gefäß
füllt sich mit dem Regen an seinem Ort).

## Gemessen (vorher → nachher, gleiche Bedingungen)

| Messung | vorher | nachher |
|---|---|---|
| `_windAt` 20 km fern unter Sturm-Wort (Welt, headless, Basis per stash) | Stärke 1,042 · 26,54 m/s (das Wort gilt überall) | 0,104 · 2,65 m/s (die Front am Ort, wortunabhängig) |
| `_windAt` 100 m nah: Sonne → Sturm | 0,063 → 1,042 | 0,063 → 1,042 (unverändert: nah = Wort) |
| Feld-Kanal Wind 20 km fern, 24 Richtungen, unter Sonne · Sturm · Regen | das Wort | 0,06–0,35 in allen drei |
| Kosten `_windAt` je Ruf (Welt) | 9,70 µs | 9,99 µs (+3 %); `_wetterFeldAm` 0,44 µs (das Wort 0,19 µs) |
| Regen 20 km fern unter Regen-Wort | 0,6 überall | 0–0,6 (die Front) |
| Bilanz Ziel + Lee, mit ÷ ohne Eingriff (Welt, 3 034 Punkte) | — | 0,994 |
| Bilanz Kern, 6 Saaten × 4 Zeiten | — | Median ≈ 1,0, 88 % in ±10 % (0,984 / 1,048 / 1,113) |
| Regensumme Luv · Ebene · Lee (5 % Hang, 30 Zeiten) | gleich | 10,53 · 8,80 · 6,16 |
| Wolken-Zug gegen die Front am Ort, jetzt / +6 h | 14,7° / 30,7° | 0° / 0° |
| Rauch-Wind 2 · 10 · 50 · 200 m über Grund | ×1 | ×0,795 · 1,0 · 1,259 · 1,534 |
| Weg der Luft: d/dt windWeg − windRichtung | — | 2,7·10⁻⁷ |
| Planet: Amplitude bei Neigung 0 (anazh-realm-seed, 45°) | 21,027 K | 1,106 K (5,3 %) |
| Planet: Amplitude 45° Neigung ÷ Erde | 1,0× | 1,153× |

Die Linse: `gate:wetter-wache` (O) ORT am Kern — Weg, Saat, Stetigkeit, Eingriff, Bilanz, Relief; der Selbsttest misst den
echten Kern und lässt 7 Attrappen je genau EINMAL rot fallen (die abgeschaltete Lee-Bilanz: Median 1,318, 0 % im Band).
`diag-planet --anker` trägt die Zeilen `ort.neigung`.

## Die fünf Sprossen

| Sprosse | Stand | Zahl | Leser / Adresse des Offenen |
|---|---|---|---|
| `karte2.planet.kopplung.wetter-welt#2` | Welt-Fähigkeit steht, Richter erwartet grün (nicht am Gerät gefahren) | Zeuge `wolke` 0 → 2 echte Leser (`_wolkenWind`, `_rauchWindAt`); Wolke 0° zur Front | der Richter (Zweig `punkte-maschine`, meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js:780 und :902) zählt die Leser beim Namen |
| `karte2.same.kopplung.terraform#1` | Welt-Fähigkeit steht (der Eingriff lenkt den Regen einer Region samt Lee), Richter ROT | Bilanz 0,994; Ziel + Lee | der Richter misst `_weatherFieldFor(w, true)` ohne Ort und trägt `nicht` fest (Zweig `punkte-maschine`, meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js:8466 liest `_weatherFieldFor(w, true).rain`, :8522 das `nicht`) — er muss das Feld am Ort lesen (`_wetterFeldAm(x, z)`) |
| `karte2.planet.kopplung.bahn-klima#2` | Faden liest die Neigung, Richter ROT | Amp(0°) 21,027 → 1,106 K; Amp(45°) 1,153× < Soll 2× | phyto-core/planet-core: die Neigung skaliert die Jahreszeit heute linear (sinβ/sinβE) — die 45°-Welt braucht den Gang der Einstrahlung über dem Polarkreis (`planetOrt`); Schneelinie unvermessen (Zweig `punkte-maschine`, meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js:675 `schneelinieVersatzM`) |
| `karte2.mensch.kopplung.kultur#2` | OFFEN | 0 von 32 Plänen ändern sich; Dach streut aus dem Samen | fachwerk-core.js `bauRezept` (rahmen ohne Niederschlag) liest kein Klima; der Richter fragt `_foundryRequestSettlement({seed, nH})` ohne Ort und trägt `niederschlagStreuung: 0`, `rDach: null` fest (Zweig `punkte-maschine`, meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js:3380, :3403 und :3416) |
| `karte2.mensch.kopplung.leib#1` | OFFEN | Lagen 1 → 1, Kapuze 0 | stamm/siedlung-bewohner.js `_bewohnerGestalten`/`_bewohnerTracht` (die Tracht = die der Epoche, `S.plan.kleidung`); das Umkleiden braucht je Siedlung die Tracht als Funktion des Felds an ihrem Ort mit eigenen Vorlagen (Stufen 0–3, `_bewohnerVorlagen`), Maß und Leib-Raum je Tracht; koerper-core kennt keine Kapuze |

## Ehrlich offen (mit Leser)

- Die Jahreszeit im Feld: `wetterFeldAm` liest die Neigung noch nicht (der Planet-Faden schon) — Leser: `karte2.planet.kopplung.bahn-klima#2`.
- Das Bild (Wolken-Zug, Rauch in der Höhe, fernes Dorf im Regen) ist headless nur als Mechanik gemessen; die Bilder schießt der Koordinator — Leser: das Auge der Sprosse `karte2.planet.kopplung.wetter-welt#2` (`wetter-welt-s2`, ein Sturmbild an der Wiese: Gras, Bäume, Wolken, Rauch).
- Kosten am Gerät: gemessen ist der Ruf (headless, µs), nicht das Bild-Budget — Leser: `gate:stand-takt` / das Profi-Band am Dorf (`spec/profiband/haushalt.json`).
- Die Bewohner-Leser (Tagesplan, Kamin) sind im Boot ohne Dorf nicht gelaufen (0 Siedlungen headless) — Leser: `karte2.mensch.kopplung.leib#1`-Messprogramm (gründet das Dorf der Probe).
