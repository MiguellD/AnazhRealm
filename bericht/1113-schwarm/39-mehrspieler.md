# 39 Mehrspieler: der Feld-Akt am Eingang überholt die Folge des Felds

## Was es den Spieler kostet (kein Bild gesehen; Bereich ohne Bild)
- Im Spiel: zwei Spieler (oder einer nach dem Reload) tragen ein anderes Leben-Feld. Die Wiese blüht oder ist abgeäst je nach Seite (die Nah-Streu liest die Leben-Stufe, feld-leben.js:2354–2359). Der Bestand der Tiere läuft danach auseinander, weil der Fraß die Äsung liest (kreatur-leben.js:2075–2080, 2135).
- Im Takt: die Mehrspieler-Wand kippte am 13.11. an vier Zweigen ROT, die alle main-Code tragen: w28-tiere-nach-bild (CI 43345731180), w28-seiten-tod c55af244 (43391589287), w28-stadt-grammatik 22872718 und w28-studio-welt 6039dc13 (FUND-REGISTER.md:231, UEBERGABE-2026-11-13.md:42/89). Jeder Fall kostet eine rote Abgabe und einen neuen Lauf (FUND-REGISTER.md:231).
- w28-studio-welt fasst `stamm/` nicht an. `git diff --stat origin/main...origin/w28-studio-welt` zeigt nur worlds/garage, huelle, schmiede, welt-licht.js (+5 Zeilen `B.abschied`) und diag-blick. Das ROT dort ist also ein Kipper im Code von main.
- Das Bild der Rotfälle ist immer gleich: „(f) leben VERSCHIEDEN“ (Peers 255/332 Zellen, Reload 218/292), dabei wetter, pegel und brand gleich (FUND-REGISTER.md:231).

## Was die Quelle sagt
**Das Gesetz (feld.K2#2):** Leben ist eine Funktion von Saat, Welt-Uhr und Akten. Takte und Akte laufen in EINER Folge nach Welt-Zeit (kreatur-leben.js:2664–2674, `_feldTakt` 2675–2700).
- Ein Akt wird in dieser Folge vor dem Takt zur Zeit T eingereiht, wenn w ≤ T gilt: `A[0].w <= wahl[1].t + taktS` (2691). taktS = 10 s (tetrapoda-core.js:2001).

**Was die Welt davon konsumiert: einen zweiten Schreiber am Eingang.**
- `_feldAkt` (feld-leben.js:2122–2144) lässt einen Akt SOFORT wirken, wenn `akt.w <= _feldHorizont()` gilt und keine frühere Akte wartet (2138).
- Er prüft dabei NIE, ob die Takte der Seite schon bis w gerechnet sind.
- Der Horizont ist die früheste Uhr der Mitspieler minus 2 s (`FELD_VORLAUF_S = 2`, feld-leben.js:2299–2306, 3694). Allein ist er die eigene Uhr.
- Er folgt `pos.w` sofort beim Empfang (netz-p2p.js:1836–1843, `_weltUhrNimm` dirigent-takt.js:1657). Den Takt rechnet die Seite aber erst im nächsten Frame, und auch nur, wenn `_kreaturenBereit()` gilt (kreatur-leben.js:2645, kreatur-verhalten.js:2445).

**Drei Wege, auf denen ein Akt vor einem Takt mit früherer Zeit wirkt:**
1. **Beitritt und Reload.** Bei `peer-join` schickt A seine Akte der letzten 120 s noch einmal (`_akteNachholen` feld-leben.js:2288, netz-p2p.js:1721, `AKT_NACHHOL_S = 120` 3697).
   - Die `pos.w` von A läuft über denselben Raum und kann vorher ankommen. Dann ist der Horizont von B schon an der Uhr von A, aber B rechnet noch keinen Takt (Ladeschirm, `_kreaturenBereit` false). Nach einem Reload steht B bis zu 79 s hinter A (diag-mp-sync.cjs:1049–1050).
   - Folge: jeder nachgeholte Akt wirkt sofort, VOR allen Takten zwischen dem Stand von B und w. Bei A lagen diese Takte davor.
2. **Zwei Wege am Draht.** `p2pSend` wechselt vom WS-Relay auf den DataChannel, sobald das Mesh steht (netz-p2p.js:381–405). Ein Akt auf dem alten Weg kann nach einem `pos` auf dem neuen ankommen. Dann liegt der Horizont schon hinter w, und der Akt wirkt sofort.
3. **Allein.** Kreuzt die Uhr im Frame eine Takt-Grenze T ≤ w, wirkt der eigene Akt vor T (Horizont = Uhr, 2302–2303). Eine Seite, die denselben Akt aus der Reihe nimmt, wirkt ihn nach T.

**Warum die Reihenfolge das Leben ändert:** `_depositLife` ist nicht kommutativ (feld-leben.js:2073–2109).
- Jede Schrift zerfällt erst den alten Betrag bis `now` und kappt dann auf [kahl, max] (2093).
- Danach setzt sie den Stempel der Zelle auf `now` (2094). Ein Akt mit früherem w, der nach einem späteren Takt schreibt, setzt den Stempel ZURÜCK.
- Verglichen werden genau Betrag und Stempel je Zelle (`_lebenImStand` 2210, `abdruck` diag-mp-sync.cjs:172).
- Unter Last fallen alle drei Wege häufiger: die Frames sind lang, der Reload dauert bis 79 s, das Mesh wechselt nach der Stille (g). Das passt zum Bild „ROT nur in der CI, an main lokal GRÜN“.

**Die gemerkte Klasse je Zelle** (`_bestandFeld` kreatur-leben.js:2266–2284) friert jeden Eingang von `_bodenKlasseAt` (1681–1687) beim ersten Fragen ein. Dieselbe Klasse liest die Geburt live (`_pickFaunaSoulAtPlayer` 1671–1677, 1942) und der Wurf (1867). Neben dem Erdbau, den w28-mp-boden schneidet, hängt sie an zwei weiteren Eingängen:
- **Fluss-Rand:** `_hydroDistAt` → gelaende-core `flussRand` → `hydroRegion` (gelaende-core.js:6649–6660, 7091–7093). Steht die ferne Kachel noch nicht, fällt sie auf die Heimat zurück, der Rand ist ein anderer. Kein Takt wartet auf `_hydroSteht` (gelaende-boden.js:652).
- **Wald:** `_forestStandDensity` (vegetation-wiese.js:3074) ist eine reine Saat-Funktion, ohne Befund.

**Der Ort je Seite:** `_feldTakt` rechnet nur die nahen Regionen der EIGENEN Seite (kreatur-leben.js:2682), der Stand reist ebenso (`_bestandReist` 2227–2234).
- Die Wand vergleicht mit den nahen Regionen von A auf beiden Seiten (diag-mp-sync.cjs:836).
- B steht am Spawn, A geht 3 × ≥ 1,5 m. Die Wand ist darum für zwei Spieler an verschiedenen Orten blind. Im Spiel trägt eine Leben-Zelle an einer Regionsgrenze (S = 113·√π ≈ 200,3 m, Zelle 16 m: die Raster fluchten nicht) die Reihenfolge der Nachbar-Regionen.

## Die EINE begrenzende Entscheidung
**Das Feld hat EINEN Schreiber, die Folge (`_feldTakt`). Ein Akt wirkt nie vor einem Takt mit früherer Zeit.**
- Am Eingang (`_feldAkt`) wirkt ein Akt nur sofort, wenn die Seite bereit ist und kein Takt der nahen Regionen bei T ≤ w aussteht. Sonst geht er in die Reihe `feldAkte`.
- Ein Akt, der hinter `feldLetzt` ankommt, ist ein Bruch beim Namen (`_bruchMelden`), kein stilles Wirken.

## Der Schnitt
**Stufen, in einer Welle:**
1. **Eingang.** `_feldAkt` feld-leben.js:2138: sofort nur bei `_kreaturenBereit()`, wenn `akt.w < min(R.t + taktS)` über `_bestandNah()` gilt und `akt.w >= st.faunaLifecycle.feldLetzt`. Sonst Reihe.
2. **Später Akt.** w < feldLetzt → `_bruchMelden("FELD-AKT zu spät …")` und Reihe, nie ein stilles Wirken.
3. **Boden-Klasse.** `_bestandFeld` (kreatur-leben.js:2279–2280) merkt eine Klasse nur, wenn die Hydro-Wahrheit am Ort steht (`hydroRegion` liefert die Kachel des Orts, nicht die Heimat-Rückfall). Vorher rechnet die Region keinen Takt, wie der Chunk-Bau auf `_hydroSteht` wartet. Dazu w28-mp-boden landen (Erdbau).
4. **Linse in der bestehenden Familie** (diag-mp-sync.cjs (f), nach `teilSim("Peers")` 924). Selbsttest: die alte Bedingung „sofort ohne Takt-Frage“ einsetzen, B mit gestauter Seite (`_kreaturenBereit` false für 5 s), dann A's nachgeholte Akte → „leben VERSCHIEDEN“ beim Namen `_feldAkt`.

**Leser-Liste (vor dem Schnitt lesen):**
- Eingang und Folge:
  - `_feldAkt` feld-leben.js:2122 · `_feldAktFremd` 2148 (`sofort`) · `_lebenAusStand` 2274 (`sofort=false`) · `_lebenGabe` 2347–2352
  - `_feldAktWirkt` 2312 · `_feldTakt` kreatur-leben.js:2675 · `tickFaunaLifecycle` 2641–2645
- Annahme und Fall: `_bestandAdoptieren` kreatur-leben.js:2441 · `_bestandAus` 2485
- Netz: `_p2pMsgDsl` netz-p2p.js:1896 · `_p2pMsgPeerJoin` 1711–1722
- Brand:
  - `_brandEntfachen` feld-leben.js:2570. Der Rückgabewert „Zelle oder null allein“ hat Leser: koerper-fahrt.js:2256, diag-kreatur-leben.cjs:142, diag-stand-takt.cjs:954/988/1093/1115/2159.
  - Diese Leser bleiben grün, wenn allein und bereit kein Takt aussteht. Prüfen: stand-takt 1115 entfacht 6561 Zellen in einer Schleife.
- Die Wand: `moment` diag-mp-sync.cjs:834–842 liest `feldLetzt`.

**Kosten-Zeile:** pro Akt ein Minimum über ≤ 4 nahe Regionen. Es hängt an der Zahl der Akte, nie an der Weltgröße, und es kommt kein Zeichen-Aufwand hinzu.

**Kriterium der Meisterkarte:**
- Id: feld.K2#2 headless. Ist: gebucht GRÜN „Leben 1189/1189, Reload 1223/1223“ am 95ba6fd6, gehalten, R6 „naehe“ (PM stand.json:631–638).
- Soll: GRÜN in jedem Lauf. Station gate:mp-sync (f) Peers und Reload.
- Ist in der CI am 13.11.: vier Kipper an vier Zweigen.
- feld.K2#1 und ultiversum.K4#1 hängen an derselben Wand (stand.json:621, 4375).

## Was schon liegt
- `origin/w28-mp-boden` f97fe692 (WIP, nicht abgegeben): `_terrainSaatY` (gelaende-boden.js +15) und `_bodenKlasseAt` liest ihn (kreatur-leben.js:1677–1693 am Zweig). Dazu die Linse in diag-mp-sync.cjs (+75), Eintrag in modul-karte.json.
  - Gemessen OMEN: an main kippt die alte Lesart an 0 von 64 nahen Zell-Mitten (erwachen/omen-2026-11-13.md:30–31). Der Schnitt erklärt also NUR den Stadt-Zweig.
  - `check` an aa8e540f einmal ROT an diag-taille (Ursache offen, ebd. 32–33). Es fehlen die Zahl von Kette zm2 (mp-2), check und die Abgabe.
- `origin/w28-stadt-grammatik` 156cc903: derselbe Schnitt, GRÜN 4/4 an der OMEN.
- Für die Eingangs-Folge liegt nichts.

## Ehrlich offen
- **Nicht gemessen:** dass der Eingang die Kipper an main erklärt. Ich habe nur die Quelle gelesen, keinen Lauf gefahren. Beweis wäre an der OMEN: 3 Läufe gate:mp-sync parallel auf 2 Kernen (Rezept in diag-mp-sync.cjs:40–42), main ↔ Schnitt.
- **Nicht gelesen:**
  - die CI-Logs der vier Kipper: ob B dort vor dem ersten Takt Akte trug
  - der Ort des Genesis-Platzes gegen die Heimat-Hydrosphäre (`worldMeta.genesisOrt`, `GRUND.kachel`): ob nahe Regionen in eine ferne Kachel reichen
  - `_narbeAt` und seine Schreiber (feld-leben.js:3269): auraAt liest die Narbe im Fraß
  - der Weg der `pos`- gegen die `dsl`-Nachricht beim Mesh-Wechsel (`_p2pWireChannel`)
- **Widerspruch:** der Kommentar zu `_feldHorizont` sagt „so überholt keine Seite einen Akt, der noch reist“. Das gilt nur, wenn die Akte VOR dem späteren `pos` ankommen. `_akteNachholen` sendet sie erst NACH dem Beitritt.
- **Ort je Seite:** dass die Regionsgrenze (200,3 m gegen das 16-m-Raster) zwei Spieler an verschiedenen Orten trennt, folgt aus der Quelle. Die Wand misst es nicht (B steht neben A). Das ist eine eigene Klasse, nicht Teil dieses Schnitts.

## Rang
Wirkung im Takt 4: die Wand kippt an jedem Zweig, und jede Abgabe der Stadt-Kette hängt an ihr. Wirkung im Bild 2: Leben je Seite.
Aufwand S (Eingang + Linse) bis M (mit Hydro-Wartepflicht).
Risiko: die Brand-Leser erwarten die sofortige Antwort. diag-stand-takt 1115 könnte allein bei einer offenen Takt-Grenze null bekommen und muss vorher gelesen werden.
