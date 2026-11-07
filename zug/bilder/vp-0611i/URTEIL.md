**Urteil: ROT in 2 von 16 gefahrenen Schritten — `gate:pruefbuehne-licht` (S0 Himmel blind: keine Lesung `_himmelFrisch`) und `gate:wasser-leben:bild` (❌ B4 REGEN litAnteil 0, ❌ B LEER); die übrigen 14 GRÜN, `gate:gpu-fehler` nicht gefahren (Auftrag abgesagt, z272 fährt in der CI).**

# vp-0611i: echt-Vorprüfung mess-z272 755e74eb (OMEN, GTX 1060, 06.11. 22:25–23:18)

- Schritte des Jobs „echt (GPU-Wände auf der Karte)“ aus `.github/workflows/check.yml` am Kopf, der Reihe nach, jede mit ihrer Frist.
- Umgebung wie im Job: frischer Baum mit `npm ci`, Node 22.23.3 des Läufers, `CI_KLASSE=gpu LINSE_GPU=karte CI=true`, weiter nach Rot.
- Zweimal verdrängte der echt-CI-Job die Reihe (licht-weg, naesse). Danach fuhr sie ab dem offenen Schritt fort.
- Ob die beiden Rot schon an main 323cc9f3 rot sind, ist nicht geprüft.

| Gate | Urteil | Dauer | ❌-Zeile |
|---|---|---|---|
| fern-ring | GRÜN | 72 s | |
| schatten-bias | GRÜN | 5 s | |
| ziel-zensus | GRÜN | 29 s | |
| analog-nah | GRÜN | 31 s | |
| foundry-impostor | GRÜN | 34 s | |
| pruefbuehne-licht | **ROT** | 18 s | ⛔ S0 Himmel: keine Lesung der Umgebung (`_himmelFrisch`) — die Probe ist blind; Selbsttest S0 HIMMEL „BLIND“. Daneben: Boden-Programm 99 436 Zeichen WGSL gegen die Decke 100 000. |
| wasser-leben:bild | **ROT** | 27 s | ❌ B4 REGEN: {"litAnteil":0,"schlieren":0,"neigung":0} · ❌ B LEER: null |
| post-kette | GRÜN | 16 s | |
| portal-membran | GRÜN | 77 s | |
| ego-schatten | GRÜN | 28 s | |
| kamera-leib:echt | GRÜN | 58 s | |
| verdeckungs-abfrage | GRÜN | 29 s | |
| weltbild-frost:echt | GRÜN | 147 s | |
| tag-achse:echt | GRÜN | 84 s | |
| licht-weg:echt | GRÜN | 57 s | |
| naesse:echt | GRÜN | 111 s | |
| gpu-fehler | nicht gefahren | | abgesagt |

Ausgaben: `pruefbuehne-licht.log`, `wasser-leben-bild.log`, `lauf.log`.
