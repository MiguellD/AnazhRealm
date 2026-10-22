# Bericht 2210 latenz-verben: Kopf **382d1f84** [ci voll] (Zweig latenz-verben ab integ-probe f3865c80)

**Geschnitten** (`scripts/werkbank.cjs`, `scripts/lib/haenger-linse.cjs`, `package.json`):
1. **springen und einsteigen sind Verben der Linse** (Space; KeyE wie `FAHR_TASTEN.einsteigen`).
   - einsteigen stellt seinen GT quer neben den Start (0,85 × `MOUNT_RANGE_M`) und wartet bei laufendem Loop, bis er GEZEICHNET ist (`_archIsRendered`). Sonst bricht die Probe laut „der GT ist nicht gezeichnet“.
   - Vor jeder Probe Absitzen und zurück an den Start; am Ende fällt der Wagen.
2. **latenzUrteil urteilt über Pflicht-Größen** (eingabe · imHoerer · regung · takte): Fehlt eine in einer gemessenen Probe, ist die Reihe ROT beim Namen („ohne imHoerer“).
   - Der Hörer `nach` misst imHoerer jetzt an keydown UND mousedown (im Verzug an der Kopie).
   - Bis dahin trug KEINE Tasten-Probe imHoerer, und das Urteil brach an `.toFixed` auf undefined, also auch gehen und wechsel am Kopf f3865c80.
3. **Der Sammel-Lauf-Hänger, Ort beim Namen** (CDP an die hängende Seite: `Runtime.evaluate` + `Debugger.pause`, `stapel.cjs`):
   - Die Seite lebte: 63 689 rAF, aber nur 689 präsentierte Bilder, das Verb gehen nach hieb.
   - Im Bild-Haken (`getCurrentTexture`) warf `weg(lage(), L.vor)` in JEDEM Bild: Nach hieb ist die Lage die Hand (1 Punkt), danach Kamera + Leib (2 Punkte), und `b[1]` war undefined. r184 präsentierte kein Bild mehr, die Fristen in Bildern (`L.bilder.length > bis`) wurden nie wahr, der Aufruf wartete ewig.
   - Dazu setzte `bereit` das Verb nur ohne Rücksprung (`zurueck || (L.verb = verb)`), sodass gehen nach hieb die Hand maß.
   - **Schnitt:** `weg` vergleicht nur Lagen gleicher Form, ein Verb-Wechsel setzt `L.vor` zurück, das Verb gilt ab `bereit`. Der Haken misst in try/catch, ein Mess-Fehler hält nie das Bild an. Eine Wache bricht jede Frist nach 120 rAF ohne Bild oder bei einem Mess-Fehler laut.
4. **`latenz --selbsttest` ist ohne Welt und in check:statik** (neben lauf/takt).
   - Gesunde Reihen GRÜN. ROT beim Namen: ohne imHoerer, langsamer p95 mit Täter, Hieb ohne Hit-Stop, Reihe ohne Bewegung.
   - Gegen das alte Urteil bricht er mit genau „Cannot read properties of undefined (reading 'toFixed')“.
   - Die Welt-Probe heißt jetzt `latenz --verzugprobe` und nennt einen fehler-Lauf, statt an `reading 'ego/gehen'` zu brechen.
5. `latenzAn` (die Seite) zieht zu ihrem Urteil in `scripts/lib/haenger-linse.cjs`.

**Die Decke (Freigabe Koordinator):** scripts/ **−264 Atome** gegen integ, werkbank.cjs 3889 Zeilen (< 4000), gate:betriebsgesetz GRÜN. Bezahlt durch:
- 9 tote Deklarationen (eslint no-unused-vars)
- 57 Existenz-Proben `typeof r._x === "function"` um Stamm-Methoden (fehlt eine, bricht der Aufruf laut; Warte-Prädikate und Melde-Felder blieben)
- Chronik-Kommentare der Werkbank und der Linse (Datum, Messwerte von damals, vorher/nachher)
- meine Zusätze verdichtet

Die Welt-Verzug-Probe bleibt: Der neue Selbsttest prüft das Urteil, nicht die Seiten-Mechanik.

**Gemessen** (GTX, Endstand 10c879c0 = Code des Kopfs, Wiese, EIN Boot, je Aufruf unter `timeout 600`):
| Verb | Ego p50 / p95 / max | Third p50 / p95 / max |
|---|---|---|
| springen | 19,4 / **27,8** / 28,2 | 20,0 / **39,7** / 59,1 |
| einsteigen (GT gezeichnet, `gt-third.png`) | 26,5 / **38,3** / 224 | 15,7 / **22,9** / 23,6 |
| hieb (w4, einzeln) | 11,0 / **20,3** / 30,8 · Hit-Stop 14 | 18,4 / **31,1** / 33,3 · Hit-Stop 10 |
- Alle LATENZ GRÜN (≤ 50).
- Der einzelne Höchstwert bei einsteigen (224 bzw. 133 ms) ist die erste Probe nach dem Bau des GT: Eingabe 16–60 ms, der Haupt-Faden ist belegt.
- In einem früheren Boot (w3) lag einsteigen Ego p95 bei 88,5 (drei solche Proben); n = 50 je Lauf.
- **Sammel-Lauf** gehen,wechsel,hieb × Ego,Third: vorher 25 min ohne Ausgabe (w1, w2: Deckel 600 s), jetzt **16 s** (5 Proben) bzw. 31 s (10 Proben).
  - Sein Urteil ist ein echtes Mess-Urteil: einmal hieb p95 50,3 bei n = 5, einmal wechsel 59,4 bei n = 10, je ein Ausreißer.
- **Verzug-Probe:** GRÜN 41,1 ms Hub (Soll 2 Bilder); in einem Lauf (w2) ROT mit 27,9 < 32,2. Mit 12 Proben schwankt sie.

**Wände:** check EXIT=0 (1220 Zeilen, Latenz-Selbsttest und betriebsgesetz grün), playtest:fast 21/0. ci-lokal nicht gefahren; die 31 angefassten diag-Skripte richtet die Zweig-CI.

Roh: OMEN `p3/n2210/lv/` (w1–w5, waende/); hier `bericht/2210-latenz-verben/`.

Status ZWISCHENSTAND + Übergabe: Kopf 382d1f84 [ci voll] gepusht, Zweig-CI ungelesen.
