**Urteil: GRÜN — alle 17 Schritte des echt-Jobs an mess-z274 02324bb8 (main 323cc9f3 + w14-wunsch-akt, w17-karten-albedo, w15-einsturz) auf der GTX grün, ohne ❌ und ohne ⛔; Σ 13,7 min.**

# vp-0611k: echt-Vorprüfung mess-z274 02324bb8 (OMEN, GTX 1060, 06.11. 23:30–23:44)

Die Schritte des Jobs „echt (GPU-Wände auf der Karte)“ aus `.github/workflows/check.yml` am Kopf, der Reihe nach, jede mit ihrer Frist. Am Kopf sind es dieselben 17 wie in vp-0611i.

- **Umgebung wie im Job:** frischer Baum mit `npm ci`, Node 22.23.3 des Läufers, `CI_KLASSE=gpu LINSE_GPU=karte CI=true`.
- **Ohne Unterbrechung:** Kein CI-Job hat die Reihe verdrängt.
- **Gegen vp-0611i (mess-z272, mit w16-lade-atem):** Die beiden Rot von dort stehen hier grün.
  - Prüfbühne: Der Himmel wird gelesen; der Selbsttest „Maler taub“ wird getroffen.
  - Wasser-Leben: grün.
  - Das Boden-Programm hat 98 706 Zeichen WGSL gegen die Decke von 100 000 (z272: 99 436).

| Gate | Urteil | Dauer | Schlusszeile |
|---|---|---|---|
| fern-ring | GRÜN | 71 s | |
| schatten-bias | GRÜN | 4 s | |
| ziel-zensus | GRÜN | 29 s | |
| analog-nah | GRÜN | 31 s | |
| foundry-impostor | GRÜN | 28 s | |
| pruefbuehne-licht | GRÜN | 17 s | ✅ S0 BILD GRÜN: die Feuerstelle trägt den Feuerkreis aus 2 m in der Ausgabe |
| wasser-leben:bild | GRÜN | 27 s | WASSER-LEBEN GRÜN |
| post-kette | GRÜN | 17 s | |
| portal-membran | GRÜN | 82 s | |
| ego-schatten | GRÜN | 30 s | |
| kamera-leib:echt | GRÜN | 58 s | |
| verdeckungs-abfrage | GRÜN | 29 s | |
| weltbild-frost:echt | GRÜN | 145 s | ✅ GRÜN — DIE FROST-WAND steht |
| tag-achse:echt | GRÜN | 76 s | |
| licht-weg:echt | GRÜN | 56 s | |
| naesse:echt | GRÜN | 98 s | NÄSSE GRUEN |
| gpu-fehler | GRÜN | 22 s | ✅ SELBSTTEST GRÜN |

Ausgaben: `lauf.log`, `pruefbuehne-licht.log`, `wasser-leben-bild.log`.
