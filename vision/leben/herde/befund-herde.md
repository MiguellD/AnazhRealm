EBENE HERDE: Befund im Baum C:\Users\micha\AnazhRealm-probe2 (Zweig leben-leser). Gelesen wurde nur der Code, gefahren nichts.

**(1) Wie viele Leiber höchstens, und welche Zahl schneidet**
- Die Kappe ist `maxCreatures: 20` (stamm/dirigent-kern.js:280). Sie schneidet in `_bestandVerkoerpern` (stamm/kreatur-leben.js:2666–2668): `platz = maxCreatures − bleibt.size`.
- Die Gruppen werden nach dem Abstand ihres Ankers zum Spieler sortiert (:2644, :2660). Gezeichnet wird je Tier, bis der Platz leer ist (:2668). Die letzte Gruppe wird also mitten im Verband abgeschnitten. Das widerspricht dem Satz „der Deckel schneidet nie die Gruppe“ (:1885–1886), der nur für den Wurf ohne Bestand gilt.
- Bei 31 Köpfen fehlen 11 Leiber. Die Gruppen der fernsten Anker fehlen ganz, eine Gruppe fehlt zum Teil.
- Die nahen Reviere: Kachel S = revierM 113 × √π ≈ 200 m (tetrapoda-core.js:2200; kreatur-leben.js:2274, :3879). `_bestandNah` nimmt jede Kachel, deren Rechteck näher als S/2 ≈ 100 m am Spieler liegt, also höchstens 2×2 = 4 (:2292–2304).
- Das Tempo des Aufbaus: höchstens `leiberJeTakt: 3` neue Leiber je Takt (:3883, :2762–2765) und 3 Orts-Suchen je Takt (:2678). Der Takt ist `taktS: 10` s Spielzeit (tetrapoda-core.js:2199; kreatur-leben.js:2840).
  - Ein Kahlwild-Rudel aus 7 braucht damit 3 Takte, also 20–30 s.
  - 20 Leiber brauchen mindestens 7 Takte, also etwa 70 s.
- Zweite Schranke im Nah-Kreis: nur `KREATUR_SATZ.nahLeiber: 4` Tiere leben als voller Leib (:3891, :2983). Jedes weitere steht im Satz.
  - Der Satz backt nur die drei Gang-Bänder Schritt, Trab und Galopp (:3893, :3175–3189).
  - Grasen (Kopf gesenkt, headX 0,95) und Ruhen sieht man im Satz nicht. Ein grasendes Glied jenseits der vier Bedeutendsten geht mit erhobenem Kopf im Schritt-Band.

**(2) Wie die Glieder eines Verbands zueinander stehen und gehen**
- Ein Herden-Gesetz gibt es: `verbandZug` (tetrapoda-core.js:1864–1903), aufgerufen je wildem Zweig in `_kreaturVerbandZug` (stamm/kreatur-verhalten.js:144–176).
  - Angleichen: der Wunsch neigt sich um `ausrichtung 0,5` zum Mittel der Glieder-Wünsche. Das Leittier wiegt `leitGewicht 3` (:1855).
  - Zusammenhalt: jenseits des Paar-Raums wächst der Zug bis `fensterRaum 2,5` × Paar-Raum auf `gewicht 0,5` × Tempo (:279–280, :1896–1900).
  - Gezählt werden höchstens `maxNachbarn 6` Glieder (:281).
  - Abstand: die Separation ist der persönliche Raum = Körper-Kugel × `raumKugel 1,3`, Stoß `strength 1,5` (:260–261).
- Der Wurf-Abstand der Leiber: `abstandRaum 1,3` × 2 × Raum, auf einer Spirale um den ersten Leib (kreatur-leben.js:1907–1929). Jeder spätere Leib muss ≥ 130 m vom Spieler, außer Blick und im Fenster zu einem schon gesetzten stehen (:1913–1917).
- Ein gemeinsames Ziel gibt es nicht. Jedes Glied wählt sein Wanderziel aus der eigenen netId × Slot (kreatur-verhalten.js:1429–1435). Gemeinsam sind nur der Anker und der Zug.
- Die Leine ist je Tier verschieden: (18 + 10 × (2·Mut − 1)) × bodySize, also 8–28 m × bodySize (kreatur-verhalten.js:554; tetrapoda-core.js:225–226).
  - `_kreaturRevier` legt den Anker je Tier neu, bis 1,5 Leinen weit (kreatur-leben.js:3375–3401), abhängig von dessen Leine.
  - Glieder desselben Verbands können damit verschiedene Anker tragen.
- Folgen (followHaltM) gibt es nur für Aufgaben am Spieler, nicht zwischen Tieren (tetrapoda-core.js:264).

**(3) Mutter und Kalb**
- Die Mutter `m` steht im Datensatz des Gaus (kreatur-erbe.js:533) und reist im Speicherstand (feld-leben.js:2125–2159).
- Einen Verhaltens-Leser von `t.m` gibt es in stamm/ nicht (Grep ohne Treffer außer Serialisierung und Bild). Das Kalb folgt seiner Mutter nicht, es steht nicht an ihr, es säugt nicht.
- Gelesen wird von der Mutter nur der Wuchs: der Leib trägt die Größe aus Erbe × Alter, nachgezogen ab 2 % Abweichung (kreatur-leben.js:2689–2699; kreatur-erbe.js:622). Bei der Geburt steht das Kalb am Anker der Mutter (:1996).

**(4) Ab welcher Entfernung ein Leib erscheint und wie**
- Erscheinen: nur ≥ `CREATURE_SPAWN_FAR_MIN 130` m vom Spieler und außer Blick (kreatur-leben.js:3861, :2779–2780). Die Spirale um den Anker geht in Schritten von 25·√k m mit k = 0..63 (:2775–2777).
  - Ein Fern-Satz blendet über `WELT_SCHWUND_MS 500` ms ein (dienst.js:1024–1059, :2332). Ein Pop vor dem Auge ist damit geschlossen, denn außer Blick plus 130 m gilt immer.
- Verschwinden: ein Leib, der nicht mehr gezeichnet werden soll, geht nur außer Blick (kreatur-leben.js:2671–2676, :2725–2730), ohne Blende. Jenseits seines Pixel-Horizonts wird er geparkt und unsichtbar (dienst.js:839–846).
- Die Stufen nach Entfernung:
  - Bis `ANALOG_NAH_M 64` m (Hysterese +10 m, vegetation-streu.js:2911) ist der Leib das Studio-Tier (kreatur-leben.js:3864–3869).
  - Dahinter ein Fern-Satz: je Glied eine Kapsel, ab dem Horizont eine einzige Hülle (studio-glieder.js:245–256).
  - Die Horizont-Zahlen (`_satzHorizont`, `_leibSatzStufe` :530–543) sind ungelesen. Ob die Kapseln dort gehen, ist ungelesen.

**(5) Was die Herde tut, und was davon im Bild lesbar ist**
- Die Tätigkeit kommt aus dem Ethogramm: ruhen, nahrung oder ziehen (tetrapoda-core.js:2121–2125). Im Verband gilt die des Leittiers (kreatur-leben.js:2107–2108).
  - Der Hirsch ist aktiv nur in der Dämmerung, ruhen 0,4 und nahrung 0,5 (:2127).
- Gezeigt wird das nur als Aktions-Profil am vollen Leib:
  - grasen: headX 0,95, Tempo 0,15 (:111).
  - ruhen: bodyX 0,05 und headX 0,2, also stehend mit leicht gesenktem Rumpf (:114). Eine liegende Pose gibt es nicht.
- „Sichern“ gibt es nicht als Tätigkeit, nur die Aktion `scan` (1,8 s, Kopf-Schwenk 0,5) in den Stimmungen alert, idle und tag (:107, :119–121).
- Flucht vor dem Menschen: `fluchtDistanzM` Hirsch 120 m, Wolf 106 m, sobald der Spieler mit ≥ 0,5 m/s auf das Tier zugeht (:1991–1992).
  - Der Fluchtweg reicht bis r + 2,2·r, beim Hirsch also 384 m vom Spieler (:2022–2030).
  - Der Verband flieht gemeinsam: das Glied übernimmt den Fluchtort des nächsten Fliehenden (kreatur-furcht.js:7–25).
- Flucht vor dem Wolf über die Witterung des Jägers (kreatur-furcht.js:49–51).
- Lesbar: unter 64 m höchstens 4 Leiber mit Grasen oder Scan. Der Rest der Herde steht im Satz ohne Tätigkeit (siehe 1).

**(6) Warum die Herde im Test 98 m vom Spieler stand**
- Der Anker kommt aus dem Bild des Gaus: je Revier die Mitte der 50-m-Zelle mit dem größten Wert Lebensraum × Substrat (kreatur-erbe.js:503–509). Alle Hirsche des Reviers teilen diesen Anker (:532–534).
- Der Ort hängt am Boden der Kachel, nie am Spieler. Er kann 0 bis etwa 380 m entfernt liegen, je nachdem welche der bis zu 4 nahen Kacheln ihn trägt.
- Der Ablauf:
  1. Die Leiber werden ≥ 130 m fern und außer Blick gesetzt (s. 4).
  2. Sie ziehen in ihrer Leine (beim scheuen Hirsch etwa 8 m × bodySize) zurück zum Anker; jenseits der Leine zieht sie `anchorPull 1,2` heim (kreatur-verhalten.js:1438–1442).
- Die 98 m sind also der Abstand Anker–Spieler, nicht ein Gesetz der Begegnung.
- Ein Nachgehen mit ≥ 0,5 m/s löst die Flucht schon bei 120 m aus (s. 5). Wer geht, kommt an Rotwild also kaum unter 120 m heran.

**(7) Wolfsrudel in Kurzform**
- Anzahl: die Gruppe hat 3–6 Köpfe im Wurf (tetrapoda-core.js:282). Es gilt dieselbe Kappe von 20 (Anker-Reihenfolge, Teilschnitt) und derselbe Satz-Schnitt bei 4 vollen Leibern.
- Lage zueinander: dasselbe `verbandZug`. Auf der Jagd verteilt `rudelPlatz` das Rudel gleich um das Ziel (:1909ff). Jagen wird es „nur im pfad“ (kreatur-leben.js:583).
- Junge: die Welpen sind bis jagdKg „scheu“ (:2215). Ein Folgen an der Mutter gibt es nicht.
- Erscheinen: wie beim Hirsch, also 130 m, außer Blick, Blende 500 ms.
- Tätigkeit: aktiv nachts und in der Dämmerung, ruhen 0,6, nahrung 0 (tetrapoda-core.js:2129). Bei Tag zeigt das Rudel vor allem Ruhen.
- Flucht vor dem Spieler ab 106 m.
- Anker: je Kachel die Zelle mit dem größten Lebensraum des Wolfs (kreatur-erbe.js:513–522), unabhängig vom Spieler und vom Anker des Rotwilds.

**worlds/begegnung und worlds/schwarm**
- Beide sind fremde 2D-Canvas-Welten fürs Portal, ohne AnazhRealm-Code (worlds/begegnung/index.html:6–17, worlds/schwarm/index.html:6–12). Kein Herden-Leser liest sie, sie sind kein Gesetzbuch der Herde.

**Ehrlich offen (ungelesen):** die Horizont-Zahlen und die Bewegung des Fern-Satzes jenseits 64 m · `_kreaturVerbandGlieder` (ob ungezeichnete Glieder zählen; vermutlich nur Leiber) · `_kreaturLeibImBlick` im Einzelnen · die tatsächliche Kopfzahl je Revier im Gau-Faden.