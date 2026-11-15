# w28-iris-frei — mensch.K4#1 am Kopf GRÜN (GTX 1050 von Hand, 15.11. 14:21)

Abgabe a9861b51 (steht auf w28-wange 5fe1dace, die um 13:33 landete). Die Station ist die der Punkte-Maschine (`stationen/g2.js`:
Mess-Wiese, Third, die Gier um π, 30 Bilder des echten Takts, die Kamera aus `_loopCamera`, Klasse `^spieler:kopf/`, `--ist mensch-kopf`,
das Urteil `sollTafelUrteil`), von Hand je Baum ein Werkbank-Boot auf der Karte (nvidia/pascal), Welt ab Boot in 1920 × 1080.

| Baum | Urteil | augeFrei | lippeL | lippeA | hoehleL | hoehleA | haarDeckung |
|---|---|---|---|---|---|---|---|
| main 4ee205bd | ROT strich 0,5 | 0,737 | −6,85 | 7,18 | 0,72 | 9,55 | 1 |
| Kopf 1bf11f1b | GRÜN strich 1 | 1 | −9,64 | 5,98 | −4,74 | 3,28 | 1 |
| Band | | [0,9; 1] | [−14; −4] | [4; 14] | [−12; 0] | [−2; 6] | [0,9; 1] |

Streuung von Boot zu Boot am Kandidaten (drei Boote vor dem Commit): lippeA 5,93 · 5,98 · 7,43 — hoehleA 2,01 · 3,28 — hoehleL −5,35 · −4,74.
An main von Boot zu Boot: augeFrei 0,724 · 0,737 (Radeon 0,491), hoehleA 7,87 · 9,55.

## Drei Wurzeln, alle im Merge w28-gesicht (a3d71fc8, die eigene Kette)

1. **augeFrei war ein Fehler der Messung.** Seit die Lider Schalen sind, deckt das Lid die Iris wie am Menschen (12–14 % ihrer Fläche vor
   der Kamera). Die Linse zählte Iris-ECKEN — an den Polen der Iris-Kugel oben und unten dicht, also unter dem Lid — und das Lid als Haut:
   ohne GPU am Guss von vorn Ecken 0,714 bei Fläche 0,882, aus der Kamera des Spiels Ecken 0,45–0,48 bei Fläche 0,877, ohne Lider 1,0.
   Jetzt wiegt jede Probe ihre Fläche vor der Kamera, das Lid in seiner Lage ist die Lidspalte (seine Proben zählen nicht, `lidDecke`
   nennt ihren Anteil: 0,06–0,14), ein ganz gedecktes Auge zählt weiter als zu, Haut · Braue · Haar verdecken wie bisher. Der Selbsttest
   des Kerns (`gesichtSelbsttest`, Leser gate:kamera-leib K5) behält jede alte Mutante und trägt zwei neue.
   Widerlegt auf dem Weg: das Oberlid höher setzen (0,042 → 0,049 hebt die Fläche auf 0,915, bricht aber den Lidschluss: lidZu 0,51–0,78).
2. **Die Zone der Höhle stand nicht mehr vorn.** Der Saum im Raum trug den Ton nur noch an 13 Ecken je Seite am äußeren Augenwinkel und an
   7 von 374 vorderen Lid-Ecken; die Station las dort zwei Flecken im Streiflicht der Sonne von hinten. Jetzt ist die Höhle vor der Mitte
   ihrer Kugel ihre Öffnung (foundry `inOrbita`): Unterlid und die Haut darunter. Linse `hoehleVorn` (KOPF_SOLL [0,3; 1]): 0,000 am Kopf von
   w28-wange, 0,727 am Kopf; Mutante OH1; die Mutante GG3 war durch den Schnitt vakuös und ist geheilt.
3. **Die Töne.** Lippe Δa* 9 → 13 (w28-gesicht nahm 13 → 9; an der Wange las die Station 2,2–3,5), Höhle −4/+3 → −6/+1 (mit −4/+3 las sie
   Δa* 4,9 · 5,9 — ein Boot von der Kante 6).

Widerlegt als Hebel: der licht-unabhängige SSS-Saum der Haut (live ohne ihn lippeA 2,21 → 3,19 · hoehleA 10,22 → 8,34) und der Brauen-Bogen.

## Bildpaar main ↔ Kopf, dieselbe Pose

| | main 4ee205bd | Kopf 1bf11f1b |
|---|---|---|
| Kamera des Spiels, Bildwinkel des Spiels, Ausschnitt 64 × 72 Bildpunkte achtfach | `spiel-main.png` | `spiel-kopf.png` |
| dieselbe Kamera auf den Kopf gerichtet, Tele 26°, Ausschnitt dreifach | `tele26-main.png` | `tele26-kopf.png` |
| Tele 4° | `tele4-main.png` | `tele4-kopf.png` |

**Was das Auge sieht:** im Tele liest das Auge an beiden klar (blaue Iris, Weiß in den Winkeln). Am Kopf steht die Wange voll (w28-wange),
die Mundwinkel sind rot, unter dem Auge liegt ein weicher Schatten. Im Bildwinkel des Spiels trägt der Kopf 22 Bildpunkte, im eigenen
Schatten vor der hellen Wiese: zwei helle Brauen-Balken über zwei dunklen Augen-Punkten, der Unterschied main ↔ Kopf ist dort kaum zu sehen —
geheilt ist die Zahl des Richters und die Zone, nicht ein Sprung im Bild.

**Ehrlich offen:** die Braue des weißhaarigen Spielers ist ein heller Balken (kein belegtes Soll); das Untergesicht trägt das Grün der Wiese
(die Mitte der Lippe liest oliv, rot sind die Winkel); der Satz der Menge trägt am Guss keine Ecke Lippe, Höhle oder Braue (946 Ecken:
174 Haut · 54 Haar · 718 Kleid) — der nächste Schnitt. Ein Lidschlag im Schuss (0,09 s je 2 s) ist nicht gehalten.

Werkzeug: `.git/gtx1050-werkzeug/tmp/k4-beide.sh <zweig …>` (Station von Hand), `iris-blick.cjs`, `ton-zonen.cjs`, `hoehle-vorn.cjs`, `lupe.cjs`.
