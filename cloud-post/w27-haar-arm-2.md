## 09.11. 23:55 — Koordinator: die Wurzel der drei roten Wände von w26-haar-arm (probe-z352-haar-arm 589b4b58)

## 10.11. 01:55 — GPU-PROBE 508c9665 auf gtx1050-desktop + radeon-890m (Band-Gerät): GRÜN in 500 s (gate:haar-albedo-probe GRÜN 202 s auf gtx1050-desktop · gate:kamera-leib:echt GRÜN 176 s auf gtx1050-desktop · zeit:gate:pruefbuehne-licht GRÜN 46 s auf radeon-890m (Band-Gerät)) → probe-post/w27-haar-arm-2/508c9665.md

## 10.11. 01:39 — GPU-PROBE 66eb3576 auf gtx1050-desktop + radeon-890m (Band-Gerät): GRÜN in 669 s (gate:kamera-leib:echt GRÜN 174 s auf gtx1050-desktop · gate:haar-albedo-probe GRÜN 212 s auf gtx1050-desktop · zeit:gate:pruefbuehne-licht GRÜN 48 s auf radeon-890m (Band-Gerät)) → probe-post/w27-haar-arm-2/66eb3576.md

## 10.11. 01:26 — GPU-PROBE 6d41f7c1 auf radeon-890m: ROT in 527 s (gate:kamera-leib:echt GRÜN 84 s auf radeon-890m · gate:haar-kopf-a ROT 98 s auf radeon-890m · gate:haar-strich-a GRÜN 116 s auf radeon-890m) → probe-post/w27-haar-arm-2/6d41f7c1.md

## 10.11. 01:09 — GPU-PROBE 78bc6e29 auf gtx1050-desktop: GRÜN in 1243 s (gate:haar-kopf-a GRÜN 214 s auf gtx1050-desktop · gate:haar-kopf-b GRÜN 210 s auf gtx1050-desktop · gate:haar-strich-a GRÜN 240 s auf gtx1050-desktop) → probe-post/w27-haar-arm-2/78bc6e29.md

## 10.11. 00:42 — GPU-PROBE fc424db8 auf radeon-890m: GRÜN in 662 s (gate:haar-kopf-a GRÜN 110 s auf radeon-890m · gate:haar-strich-a GRÜN 118 s auf radeon-890m · gate:kamera-leib:echt GRÜN 75 s auf radeon-890m) → probe-post/w27-haar-arm-2/fc424db8.md

## 09.11. 23:52 — GPU-PROBE 9933c4a0 auf radeon-890m + radeon-890m (Band-Gerät): ROT in 787 s (gate:haar-kopf-a GRÜN 131 s auf radeon-890m · gate:haar-kopf-b GRÜN 120 s auf radeon-890m · zeit:gate:haar-kopf-a ROT 110 s auf radeon-890m (Band-Gerät)) → probe-post/w27-haar-arm-2/9933c4a0.md

Alle drei CPU-Wände hängen an EINEM Leser, keine riss an der Zeit (18 s, 94 s, 23 s, je Exit 1 mit Inhalts-Befund):
`_koerperStudioDials()` in `stamm/koerper-leib.js` liefert in haar-arm `Object.assign({}, s, fx.gestalt)` statt der Buch-Referenz.
Leser: `studio-bruecke.js:400`, `koerper-leib.js:1910/2744`, `koerper-fahrt.js:19`, `siedlung-bewohner.js:243`.

- Studio-Übergabe (voll 10/18 cpu): `ROT — 1 Verletzung(en): ohne Prägung liefern die Leser die Buch-Referenz (vor und nach der Linse)` mit `"refVorher":false … "refNachher":false` (main: true/true).
- Regler wirkt Teil 1 (voll 12/18 cpu): `SELBST-TEST Ofen-Kanal (koerper im Host-Ofen): heil 7/8 wirken … Täter (der Ofen verliert den Wert) 8/8 tot → rot (neu tot: koerper:koerper:age, koerper:koerper:arms, koerper:koerper:gender …)` (main: heil 8/8, 131/131 Regler wirken).
- Dichte-Spiegel (voll 1/18 cpu): `Strom vor dem Ack (Teil S): pending · volle Stände 0 · Dichte true · Brüche 1 · Reihe sofort` / `SELBSTTEST ROT: der saubere Lauf ist schon rot` (main: Brüche 0). „Brüche" zählt `FADEN-UMGANGEN`; `stamm/koerper-leib.js:1872` bucht „Guss mensch ohne Vorlage", der Ofen-Schlüssel ist `JSON.stringify(dials)` und den ändert der Zweig.
- K6 auf echter Karte (gtx1050-desktop): `K6 Strafe am Prüfplatz — A0 Kopf 11.6 % Leib 1.4 % … Strafe: 8 von 8 Bildern durchsichtig` (Soll Kopf ≤ 5 %, main dort ≤ 3,5 %, GTX 1060 im z352 7,9–13,3 %).
- Kein Zweig-Befund: Fahr-Linse VK 10 Uhr (streut 0–100 m über fünf Läufe), Fenster-Wand 902 s (auch auf main rot), Nah-Linse swiftshader (wortgleich auf main).

Ziel bleibt: mensch.K5 ohne diese vier Wände. Die Abgabe nennt je Wand die Zeile vorher ↔ nachher.

