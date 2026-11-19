# Fresser „Kreatur-Linse Teil 1“ (voll 9/18) — Befund 19.11., Opus-Leser, gegen main 986eff04

**Es gibt keinen gemeinsamen Täter.** Drei Zweige brennen an derselben Probe `bewohner` (`scripts/lib/kreatur-mensch.cjs`,
`menschUrteil`), jeder an anderen Soll-Zeilen und jeder an der eigenen Änderung. main trägt nichts: die Kreatur-Gruppen sind an
integ-probe 986eff04, dabd69bb und b339e1de grün.

| Zweig | Rote Zeile (CI-Lauf) | Täter im Zweig | Belegt |
|---|---|---|---|
| `w28-bau-rezept` ff2b8341 (44295889914) | „4 Steckenbleiber (werkstatt #28191 … ins Haus, ohne Weg)“ · „Soll-Orte min 0,637“ · „Stadt: Durchdringung 40 Takte (haus_provenzalisch #81761: 16, haus_italienisch …)“ | die eigene Hausform: die werkstatt ist neu ein Hof-Grundriss mit Torriegel und Ring (`fachwerk-core.js`, 97aa911c06 und 36dfe5c92b), der Bewohner erreicht seine Tür nicht; die Durchdringung trifft dieselben Häuser, die `gate:haus-welt` W7 im selben Lauf meldet („zweites Dorf: haus_provenzalisch in haus_italienisch“) | aus Log und Diff geschlossen, lokal nicht nachgefahren; Teil 2 (`begegnung`, `zielplan`) nicht nachgerechnet |
| `los-huelle` 36dcf968 (44501570171) | „Stadt: Durchdringung 2 Takte (laterne_dorf #237674: 2)“ · „5 Leiber als Leib gezeichnet (Soll ≤ 4)“ | die Lage, die der Zweig verschiebt (`fachwerk-core.js` koerperHuelle und oeffnung) | lokal headless nachgestellt, gleiche Werte; 0 sichtbare Fahrer — wer der fünfte Leib ist, unbelegt; Kopf 0fa7cc45 noch ohne CI-Lauf |
| `w28-kern-sprossen` df03a17c (44310806697) | „Wege 3–8 (gasthaus #419347: 3), Strecke min 25 m“ · „Stadt: Wege 3–8 (patrizierhaus #22772: 3), kirche 76 m“ · „Haltung 1,299° (Soll ≤ 1°)“ | die eigenen Charakterzüge (`koerper-core.js`, „ändern den Tag von 82 der 100 Bewohner“); die Ruhe des Mess-Leibs liegt dort selbst bei 1,205° | aus dem Log nachgerechnet |

Der Verwandte `SpriteNodeMaterial` ist NICHT dieselbe Wurzel: in den drei Logs 0 Treffer; main trägt an
`stamm/kreatur-verhalten.js:2221` `new THREE.SpriteMaterial`, die Licht-Welle führte die Knoten-Klasse selbst ein (3d41ed1a6b) und
heilte sie selbst (411ace8a2c).

**Folge (Koordinator):** die zwei gestempelten Zweige `w28-bau-rezept` und `w28-kern-sprossen` landen so nicht — der Zug wirft sie
ab. Der Stempel trug eine rote Batterie; die Regel „angenommen erst nach der Batterie“ gilt auch rückwirkend für beide. Je Zweig
EIN Heiler mit dem benannten Rest; die Soll-Zeilen der Probe werden nicht bewegt.
