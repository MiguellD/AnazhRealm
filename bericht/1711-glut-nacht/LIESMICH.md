# w28-glut-nacht — Leser-Liste (Entwurf, gelesen am Baum main b7b0f8fe + Tor-Schnitt, 17.11. 15:15; Zielbilder stehen aus)

Die EINE Stelle: `stamm/bild-kosten.js:2431` — `gesehen = combined + nurBeiStaerke(_nachtAuge(combined), nightFactor)`, das Auge
`_nachtAuge` `stamm/bild-kosten.js:2179`; die Belichtung schreibt `stamm/bild-himmel.js:1937` (`toneMappingExposure = k`).

| Leser | wo sein Leuchten in die Tonkurve geht | Sonderweg heute |
| --- | --- | --- |
| Lava-Risse / Scholle | `stamm/siedlung-wege.js:552` `_lavaGlutNode` (Planck je Kanal) → `:1255` `glut` → `stamm/stoff-material.js:962` `emissiveNode + _weg.glut` | keiner (Umkehr am Bild widerlegt: `lava-z6-nah-nacht-widerlegt`) |
| Glutbrunnen (und jedes Studio-Emissiv im Satz) | `stamm/studio-stoff.js:612` `emissiveNode = attribute("aGlut")` (Emissiv × Glut-Stärke, `stamm/siedlung-satz.js:1557`) | keiner |
| Studio-Stoff einzeln (Fenster, Laterne: `leucht`) | `stamm/studio-stoff.js:289` `emissiveNode = vcol × stoffWerte.leucht`; `:542` | keiner — am Bild zu prüfen, ob betroffen |
| Flamme, Kern und Mantel | `stamm/feld-leben.js:3180` `_nachtAuge(ton × ziel ÷ toneMappingExposure, true)` | ziel ÷ Belichtung + Umkehr |
| Zielbild des Tors | `stamm/siedlung-tor.js:278` `_nachtAuge(zielTex × uBelicht, true)`; `uBelicht` = 1 ÷ Belichtung `:646` | ÷ Belichtung + Umkehr (im Tor-Kopf, noch nicht in main) |
| Fern-Wasser-Blick (Emissiv des Bodens) | `stamm/stoff-material.js:958` | keiner — kein Glut-Leser, nur derselbe Kanal |

Offen an der Liste: `stamm/stoff-material.js:2106` (`emissiveNode = knoten[licht]`) ist nicht zugeordnet.

## Zielbilder von main (GTX 1050, je Leser EIN Paar Tag ↔ Nacht an gleicher Kamera)

| Leser | Paar | Stand | was das Bild zeigt |
| --- | --- | --- | --- |
| Glutbrunnen | `glut-ziel-brunnen-{tag,nacht}` | main 16f45362 | am Tag eine orange Flamme im Steinkreis; nachts ist die Flamme weg, der Kreis und der Boden darum stehen weiß-rosa ausgebleicht |
| Flamme mit Mantel | `glut-ziel-flamme-{tag,nacht}` | main 16f45362, 60 s nach dem Zünden | am Tag orange Zähne, nachts dieselben Zähne blasser orange; der Rauch trägt nachts Lachs-Orange (Abnahme ROT: Rauch im Vordergrund) |
| Lava-Risse | `../1711-lava-zuendet/lava-main-nah-{tag,nacht}` | main 7de938ab (die Glut der Lava ist seither unberührt) | am Tag satt orange Risse, nachts weiß-rosa Fleck und blasse Risse |
| Tor-Zielbild | `../1711-tor-nacht/tor-{tag,nacht}-nach` | der Tor-Kopf, jetzt main | Gold steht nachts wie am Tag; Dunkelrot und Grün fallen nachts ins Schwarz bis Grau-Rot |
| Fenster / Feuerschein im Dorf | `glut-ziel-dorf-{tag,nacht}` | main 16f45362 | KEIN Fenster im Bild: die Pose am Dorf-Messort zeigt kein Haus; der Licht-Pool trägt im Umkreis von 90 m nur Glutbrunnen (14 Quellen, keine Quelle „fenster"/„herd"). Dieser Leser ist NICHT belegt |

Nebenbefund am Dorf-Paar, ungeprüft: der Bewohner steht im Nacht-Bild eine Handbreit über dem Boden (im Tag-Bild geht er
weiter hinten am Hang) — ein einzelnes Bild, kein zweiter Schuss.
