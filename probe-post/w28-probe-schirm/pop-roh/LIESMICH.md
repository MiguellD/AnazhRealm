# Pop-Rohausgaben (GTX 1050, 15.11. 00:25–00:36, `npm run gate:pop` = `werkbank pop --eigen`, Mess-Wiese, Ego, 1920 × 1080)

| Datei | Stand | Welt | Pop-Pixel/s |
|---|---|---|---|
| main-360-fenster.txt | main 68d24688 (Baum-Kopie) | lebt in 640 × 360, `/fenster 1920x1080`, `umstellen` | 0,0565 % |
| schnitt-360-fenster.txt | w28-probe-schirm 387fb875 | lebt in 640 × 360, `/fenster` (lebt bis zum Stand), `umstellen` | 1,6318 % |
| schnitt-ab-boot-1080.txt | w28-probe-schirm 387fb875, `WERKBANK_FENSTER=1920x1080` | lebt ab dem Boot in 1920 × 1080 | 1,6852 % |
| main-gesetz-ab-boot-1080.txt | wie oben, aber stamm/dirigent-takt.js von main | lebt ab dem Boot in 1920 × 1080 | 1,7163 % |

Je Schritt nennt die Linse (`popGang`, scripts/werkbank.cjs): `pop` (Pop-Pixel), `wechsel` (Stufen-Wechsel), `ein` (je erstmals
gezeichnetem Karten-Ding sein Abstand in m). Namen oder Klassen der Dinge nennt sie nicht — nur Zahl und Abstand.
