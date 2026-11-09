## 09.11. 23:55 — Koordinator: die Wurzel der drei roten Wände von w26-haar-arm (probe-z352-haar-arm 589b4b58)

Alle drei CPU-Wände hängen an EINEM Leser, keine riss an der Zeit (18 s, 94 s, 23 s, je Exit 1 mit Inhalts-Befund):
`_koerperStudioDials()` in `stamm/koerper-leib.js` liefert in haar-arm `Object.assign({}, s, fx.gestalt)` statt der Buch-Referenz.
Leser: `studio-bruecke.js:400`, `koerper-leib.js:1910/2744`, `koerper-fahrt.js:19`, `siedlung-bewohner.js:243`.

- Studio-Übergabe (voll 10/18 cpu): `ROT — 1 Verletzung(en): ohne Prägung liefern die Leser die Buch-Referenz (vor und nach der Linse)` mit `"refVorher":false … "refNachher":false` (main: true/true).
- Regler wirkt Teil 1 (voll 12/18 cpu): `SELBST-TEST Ofen-Kanal (koerper im Host-Ofen): heil 7/8 wirken … Täter (der Ofen verliert den Wert) 8/8 tot → rot (neu tot: koerper:koerper:age, koerper:koerper:arms, koerper:koerper:gender …)` (main: heil 8/8, 131/131 Regler wirken).
- Dichte-Spiegel (voll 1/18 cpu): `Strom vor dem Ack (Teil S): pending · volle Stände 0 · Dichte true · Brüche 1 · Reihe sofort` / `SELBSTTEST ROT: der saubere Lauf ist schon rot` (main: Brüche 0). „Brüche" zählt `FADEN-UMGANGEN`; `stamm/koerper-leib.js:1872` bucht „Guss mensch ohne Vorlage", der Ofen-Schlüssel ist `JSON.stringify(dials)` und den ändert der Zweig.
- K6 auf echter Karte (gtx1050-desktop): `K6 Strafe am Prüfplatz — A0 Kopf 11.6 % Leib 1.4 % … Strafe: 8 von 8 Bildern durchsichtig` (Soll Kopf ≤ 5 %, main dort ≤ 3,5 %, GTX 1060 im z352 7,9–13,3 %).
- Kein Zweig-Befund: Fahr-Linse VK 10 Uhr (streut 0–100 m über fünf Läufe), Fenster-Wand 902 s (auch auf main rot), Nah-Linse swiftshader (wortgleich auf main).

Ziel bleibt: mensch.K5 ohne diese vier Wände. Die Abgabe nennt je Wand die Zeile vorher ↔ nachher.

