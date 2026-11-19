# Abgabe kern-sprossen-heil (Heiler w28-kern-sprossen df03a17c)

Kopf: f8fe9c72a24633888430939df947fdb91cef4244 (origin/kern-sprossen-heil, per ls-remote belegt); Merge main 986eff04 ohne Konflikt (557fdfd4).

## Wege (geheilt am Kern)
Wurzel: `koerper-core.js` TAGES_GESETZ.zuege.haeuslich `besuch: false` (und `tagesBindung` `Z.besuch === false ? -1`): der Zug strich den Besuch, den Weg des Tags (>= 100 m). Der häusliche Wirt, dessen Werk sein Haus ist, ging 3 Wege / 25 m.
Dazu `tagesPlan`: das längere Werk des Fleißigen endet besuchH vor der Ruhe (der fleißige Wirt arbeitete über 23,6 hinaus).

bewohner headless (gleicher Baum, diag-kreatur-takt --proben bewohner):
| Zeile | vorher | nachher |
|---|---|---|
| Wege Dorf | 3–8 (gasthaus #419347: 3) | 4–8 |
| Strecke min Dorf | 25 m | 131 m |
| Wege Stadt | 3–8 (patrizierhaus #22772: 3) | 4–8 |
| Strecke min Stadt | 76 m (kirche #635014) | 253 m |
| Haltung | 1,299° (Ruhe des Mess-Leibs 1,205°) | 1,299° — UNVERÄNDERT ROT |

gate:mensch-zuege: GRÜN, 0,80 / 0,71 (vorher 0,80 / 0,72), bit-gleich.

## Haltung (offen, nicht geheilt)
Diagnose (lokal, nicht committet: Mess-Leib in der Probe ausgegeben; einmal Zug an, einmal alle `ausgeglichen`, sonst gleicher Kopf):
- Zug an: Mess-Leib um 10 Uhr = pfarrhaus #16036 (Gestalt 1, Zug fleissig), Körper-Ruhe 1,205°, sad 1,299° -> ROT.
- alle ausgeglichen: Mess-Leib = patrizierhaus #946581 (Gestalt 4), Ruhe 0°, sad 0,015° -> bewohner GRÜN.
Befund: der Zug ist der Auslöser, nicht die Wurzel. Er bringt den fleißigen Pfarrer früh an sein Werk nahe dem Platz, so ist er der erste nahe Leib und wird zum Mess-Leib. Sein eigener Bau hängt die Arme 1,2° anders (`koerper-core.js` `leibBauArme` ~Z. 2530, aufgerufen in `stamm/siedlung-bewohner.js` ~Z. 1874) als die Vorlage, nach der der Satz seine Stände backt. Unter der Pose sad bleiben davon 1,3°. Diesen Unterschied zwischen nahem Leib und Satz trägt main auch, nur misst ihn die Probe dort nicht, weil ihr Mess-Leib den Bau der Vorlage hat. Ein Schnitt am Zug würde ihn nur wieder verdecken. Die Heilung gehört an die Stände des Satzes je Bau oder an die Arm-Ruhe, nicht an den Zug. Nicht gebaut.

## Unbelegt
- Haltung 1,299° (oben): nicht geheilt.
- gate:kreatur-takt Teil 2 (begegnung, zielplan) an diesem Kopf nicht gefahren; check:statik am Kopf f8fe9c72: exit 0.
