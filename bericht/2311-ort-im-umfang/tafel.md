# pm-ort-im-umfang — der Messort im Umfang der Sprosse (OMEN, 23.11.)

Auftrag des Koordinators (23.11., Befund 04:50): 11 Sprossen der Klasse Ort mit Richter GRÜN und Preis nicht GRÜN, gehaltener Heap
(`preis.posten.heap_mb`) über 400 MB. R3: der Preis ist die Stufe für IHREN Umfang, an der dichtesten Pose IHRES Richters, in DERSELBEN Fahrt.

**Wie gelesen:**
- **Messort:** aus dem Befehl der Station mit den Mustern von `punkte.cjs probeOrt` (`ORT_MUSTER`) und aus der rohen Ausgabe des jüngsten Laufs.
- **Bauten und Leiber:**
  - stadt-voll: rohe Ausgaben am c1236fa8/ddaf883d, 328–329 Häuser, 1 211–1 365 Bewohner.
  - dorf: `spec/profiband/haushalt.json`, 13 Häuser; rohe Ausgaben, 50 Bewohner.
  - stadt: 91 Häuser im Plan (haushalt.json); am Messort 127 Bauten (fachwerk-core.js:5928). Ihre Leiber sind UNGEZÄHLT; die erste Fahrt von koennen#1 nennt sie („Können: n Bewohner“).
- **Heap:** die jüngste GTX-Akte je Sprosse.

Klasse Ort heißt hier: ≤ 10² Bauten und ≤ 10³ Leiber.

| Sprosse | Station | Messort heute | Bauten · Leiber dort | Umfang der Sprosse | trägt eine Szene der Klasse Ort den Richter? | Entscheid | Heap gehalten |
|---|---|---|---|---|---|---|---|
| mensch.sport.koennen#1 | k2-mensch-sport.js:390 | stadt-voll | 329 · 1 365 | 10² Bewohner mit Können-Profil | dorf NEIN (50 Bewohner < 10²) · stadt JA (91 Häuser im Plan) | **→ stadt** | 538,0 |
| mensch.wirtschaft.markt#1 | k2-mensch-wirtschaft.js:584 | stadt-voll | 329 · 1 365 (1 Markt, 5 Stände, 5 Händler) | Tausch Spieler ↔ Bewohner | stadt JA: der Markt der Stadt trägt die Reihen der Stände (fachwerk-core.js:5926), je Stand EIN Händler (siedlung-bewohner.js:1008) · dorf ungewiss (2–3 Stände nur an einem Platz vom Typ `weg`, fachwerk-core.js:5929) | **→ stadt** | 538,3 |
| mensch.geist.absicht#1 | k2-mensch-geist.js:568 | stadt-voll | 329 · 1 365 | 10² (20 Personen nach 1 Spieltag) | dorf NEIN (50) · stadt JA | **→ stadt** | 564,7 |
| mensch.wirtschaft.technik#1 | k2-mensch-wirtschaft.js:736 | stadt-voll | 329 · 1 365 | 10 Techniken mit Voraussetzung (20 Saaten) | Die 20 Saaten hängen an keiner Szene. „Im Bild“ braucht Bauten, die Techniken zeigen: stadt JA (an der vollen Stadt heute 8 Techniken im Bild, an der Stadt ungezählt) · dorf (13 Fachwerk-Häuser) zeigt kaum eine | **→ stadt** | 600,3 |
| mensch.nahrung.flur#1 | k2-mensch-nahrung.js:497 | dorf | 13 · 50 | 1–2 Äcker je Feldweg-Ende | schon im Umfang | bleibt — der Heap wuchs am Dorf selbst: 345–375 MB an den Akten vom 19.11., 402–540 MB am 22./23.11. Die Wurzel ist der Kopf, nicht die Szene. | 409,1 |
| mensch.menge.kollektiv#1 | g2.js:5330 (ZEUGEN_GANG) | genesis (Dorfplatz) | Genesis-Ort | Umstehende einer Szene | schon im Umfang | bleibt | 425,7 |
| planet.kosmos.sternhimmel#1 | g3.js:4362 | wiese · genesis | keine Stadt | ~2 800 Punkte der Saat | schon im Umfang | bleibt | 446,0 |
| leben.kopplung.stadt-im-netz#1 | k2-zusammenspiel.js:2399 (`dorf: true`) | Start-Dorf | Start-Dorf | Siedlungsrand: die Natur-Wand | schon im Umfang | bleibt (Akte vom 19.11.) | 472,2 |
| mensch.netz.verkehr#1 | g5.js:6312 (WEGENETZ_PROBE, Zwilling fahrzeug.K2#1) | 2-km-Route Wiese → Wald → Dorf | Weg und Feldweg | 1 Wagen des Spielers | der Richter IST die 2-km-Fahrt | bleibt | 473,4 |
| planet.zeit.archiv#1 | k2-planet.js:5635 (Zwilling klimageschichte) | Tafelland-Saaten | keine Stadt | Schicht als Form im Tafelland | schon im Umfang | bleibt | 479,5 |
| mensch.bau.innen#1 | g5.js:4294 (START_DORF_PROBE, Zwilling siedlung.K1#2) | Start-Dorf, JEDES Haus | Start-Dorf | 1 Haus, Tür → Keller → Dachboden | Die Szene ist im Umfang, aber der Lauf geht jedes Haus — der Umfang des Zwillings K1#2. | bleibt am Ort — OFFEN: der Preis gehört dem Lauf aller Häuser; ein eigener Lauf an EINEM Haus ist ein Schnitt am Zwilling | 509,9 |

**Geschnitten:** vier Stationen. Je Station EINE Stelle, das Literal `K.messort("stadt-voll")` → `K.messort("stadt")`. Richter und Preis-Lauf fahren in DERSELBEN Fahrt an diesem Ort, weil die Sitzung die Probe vor dem Deckel an den Ort aus ihrem Befehl stellt (`probeOrt`). Geprüft mit `ORT_MUSTER` von punkte.cjs: alle Staffeln der vier Leitern lesen jetzt „stadt“, handel bleibt an stadt-voll, flur am dorf.

**Gemessen:** die vier Stationen noch nicht. Die vier Stationen messen als Ansprüche vorn in der nächsten Runde. Die Meldung nennt je Sprosse Urteil UND Preis aus der Akte; dazu die Leiber der Stadt aus der Zeile von koennen#1.

**Ehrlich offen:**
1. **Der Preis kann ROT bleiben.** Die stadt hielt am 20.11. 396,8 MB (sport.medium). Das Dorf wuchs seit dem 19.11. um rund 60 MB. Der Umzug erfüllt R3, unter 400 MB kommt der Preis aber erst mit den Heap-Schnitten am Kopf (heap-huelle-gepackt, heap-dorf-spiegel).
2. **Die Klasse ist größer als die vier.** 124 Sprossen der Klasse Ort liegen in Leitern mit Messort stadt-voll, 40 davon an der Front. Ihr Richter ist heute nicht GRÜN, ihr Preis zählt erst danach. Die Linse, die das beim Namen nennt („Preis am Umfang vorbei“), braucht in der Akte den Zensus der Preis-Szene (Bauten, Leiber); buche-2 urteilt dann Klasse gegen Szene. Ungebaut.
3. **bau.innen#1:** Der Lauf geht alle Häuser des Start-Dorfs (siehe Zeile).

**Dazu gemessen (Runde 9, ddaf883d):** mensch.menge.bevoelkerung#1 (DORF_ZAEHLUNG am Start-Dorf, g2.js:5122, Klasse Ort, im Umfang): Richter GRÜN, Preis ROT allein am Heap, 451,6 MB gehalten. Auch das Start-Dorf hält heute über 400 MB.
