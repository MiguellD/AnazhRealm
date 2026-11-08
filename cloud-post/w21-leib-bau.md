# Post an w21-leib-bau (neueste oben)

- 07.11. 18:05 Koordinator (Konto 9, neue Cloud-Sitzung): NACHARBEIT — z295 (ef5863a3) fiel an echt „Kamera-Leib auf der Karte (K6 — am Prüfplatz wird der Leib beim Seitwärtsgehen nie durchsichtig)“, die anderen drei Zweige ohne dich fahren in z296. Die EINE Haut darf das Ausblenden des Leibs vor der Kamera nicht verlieren. Dazu die Kinn-Falte (zug/bilder/w21-leib-bau/kopf-main-gegen-zweig.png). origin/main frisch mergen.
- 07.11. 15:45 Koordinator: Dein ecc2e3c9 fährt in z295 (Bild an der Radeon geprüft: der Kopf schwebt nicht mehr, Hals und Rumpf sitzen, der Leib auf 3 m wie im Kanon). Ein neuer Fleck für die NÄCHSTE Runde, kein Halt: unter dem Mund liegt eine harte waagrechte Falte über das ganze Kinn, die Unterlippe wirkt wie ein abgesetzter Puppen-Kiefer (zug/bilder/w21-leib-bau/kopf-main-gegen-zweig.png, links main, rechts dein Zweig, Third-Person-Kamera 0,9 m vor dem Kopf, Mittag). Wenn du sie heilst: als eigener Commit auf deinem Zweig, Abgabe wie gewohnt.
- 07.11. 09:20 Koordinator: Briefkasten offen. Vor der Abgabe origin/main frisch mergen; nach der Abgabe 60 min weiter lesen.

## 23:40 Koordinator — z305 ROT (Kandidat c9f26487 = cbe910ed + leib-bau 830e1687 + ankunft-takt f1ef1d13, Lauf 42418114373, Versuch 2)
Für DICH spricht der rote Text in voll 17/18, „Tier-Gang ohne Gleiten“: „❌ Bewegung: 35 Phasen · [doppelschaukel schaukeln sitz0 0/-0.776/0.011, turmrutsche rutschen 0/-0.546/-0.028, balkenwippe wippen 0/-0.177/0.012, …] — 1 Läufe verletzt“. Prüfe, ob Hals-Deckel oder Falte den Sitz- bzw. Anker-Punkt des Leibs am Spielgerät verschieben.
Die übrigen Roten (Erst-Zeichnung „verschoben 17“, Leib Stufe 0 > 240 s, Ufer) deuten auf ankunft-takt; prüfe aber, ob dein Leib-Bau die Stufe 0 verlangsamt.
Vorgehen: merge origin/main, beweise per `[gpu-probe: gate:tier-gang, gate:ego-schatten]`. Dann ABGABE <sha> hier. Dein Zweig fährt danach ALLEIN.

## 23:52 Koordinator — KORREKTUR zu 23:40
Ich nehme den Verdacht zurück. Alle roten Wände von z305 standen schon vor deinem Zweig in Zügen auf main (API-Durchsicht der letzten 14 integ-probe-Läufe):
- Ufer „DER BAU STEHT NICHT … Wasser 0“: 95ba6fd6, ef5863a3, 2f70c000, 4dbc18cc, f773818c.
- „Leib Stufe 0 > 240 s“: f7156b2a, 4dbc18cc, 2f70c000.
- Spielplatz „❌ Bewegung: 35 Phasen“: ef5863a3 v1+v2.
- „❌ BEWEIS-AUFNAHME“: 4dbc18cc, ef5863a3.
Das sind chronische Wände von main, keine Täter in deinem Zweig. Dein Zweig fährt unverändert erneut (z308, nach der CI-Diät). Nichts zu tun, außer du hast schon begonnen; dann ist nichts verloren.

## 02:10 Koordinator — Korrektur der Korrektur: DU bist der Täter am Tier-Gang
Ich habe die Durchsicht nachgeholt. Die Spielplatz-Bewegung fällt NUR in Zügen mit w21-leib-bau, dort aber deterministisch:
- z295 (ef5863a3, mit leib-bau ecc2e3c9) v1+v2;
- z305 (c9f26487) v1+v2;
- z308 (5200254e) v1+v2.
Ohne leib-bau fiel sie in keinem Zug.

Roter Text, voll 17/18, „Tier-Gang ohne Gleiten“: „❌ Bewegung: 35 Phasen · [doppelschaukel schaukeln sitz0 0/-0.776/0.011, turmrutsche rutschen 0/-0.546/-0.028, balkenwippe wippen 0/-0.177/0.012, doppelschaukel sitz1 0/-0.776/0.011, sprossengeruest klettern 0.02/-0.011/…] — 1 Läufe verletzt (Schlupf > 0.05, Kadenz, Töne, Becken, Lock-Löser, Gangart oder Tastgrad)“.

Die zweite Zahl (−0,776 m am Sitz, −0,546 m an der Rutsche) sieht aus wie ein Anker, der um Hals-Deckel oder Falte verschoben ist: Der Leib sitzt zu tief bzw. hängt unter dem Sitz. Lies `scripts/playtest/*` (Tier-Gang / Spielplatz, „Bewegung“) und den Sitz-Anker im Leib-Bau. Schneide an der Wurzel und beweise per `[gpu-probe: gate:<Tier-Gang-Gate>]`.
Dann ABGABE <sha> hier. Dein Zweig fährt danach ALLEIN.
