# 38 Speicher, VRAM, Lecks und Persistenz

## Was es den Spieler kostet (kein Bild gesehen: der Bereich hat keine sichtbare Fläche; in BILD liegt kein Bild zu Speicher oder Reload)
- **Lange Sitzung:** der Heap wächst mit dem Weg. Radeon-Dauerprobe profiband.K5#1 (PM `messung/roh/<sha>-radeon/profiband.K5_1.out`, Heap am Start nach GC):
  ec281422 291,9 → 392,9 MB (+6,8 MB/min, 0,2 km) · dc9eacb0 285,0 → 677,1 MB (+27,8 MB/min, 3,1 km) · c4010773 296,3 → 731,2 MB (+49,7 MB/min, 4,2 km).
  Soll ≤ 5 MB/min (`scripts/lib/draw-zaehler.cjs:559`). Das Ankerbild driftet mit: Bild-p95 58,66 → 83,68 ms (ec281422, Soll ×1,05).
- **VRAM zurück am Start** +15,7 MB (ec281422; Soll ≤ 2): `buf:?` +13,1 · `tex:karte-albedo:atlas` 128×3584×20 +5,8 · `tex:karte-normal:atlas` +2,9; dazu `buf:verwaist` 0,16 MB (Soll 0).
- **Tab-Tod hart (Prozess getötet):** höchstens 6,9 s verloren (speicher.K1#1 radeon 2d5f4146, 4 Tode; gtx 715754fc 3,3 s, 20 Tode; Soll ≤ 10 s).
- **Tab sanft geschlossen / Handy schiebt die Seite weg:** derselbe Verlust bis ~6 s, obwohl die Seite es WEISS — `pagehide`/`hidden` sichert nur
  den Flugschreiber (`stamm/dirigent-regler.js:1033–1037`), nie den Stand der Welt (Grep `visibilityState|pagehide` über stamm/: 3 Treffer, keiner speichert).

## Was die Quelle sagt
**Persistenz (gesund, gemessen):**
- EIN Schreiber: `speicher-faden.js` (Worker) schreibt atomar in IndexedDB, voriger Stand als `<id>.bak` in derselben Transaktion (`speicher-faden.js:54–70`);
  die Seite reicht nur die Änderung (`stamm/speicher-welten.js:2336–2374`, `_standAenderung` :1693).
- Takt: `saveInterval` 5 s (`stamm/dirigent-kern.js:273`), Leerlauf-Frist 2 s (`stamm/dirigent-takt.js:2167–2173`), Stand-Frist 1 s
  (`STAND_TAKT.fristMs`, `stamm/speicher-welten.js:3590`); Edit-Burst 1,2 s (`stamm/dienst.js:1540–1547`).
- Kosten je Speicher-Bild p95 0,03 ms Radeon / 0,05 ms GTX (speicher.K2#2, Soll ≤ 0,1) — der Haupt-Faden zahlt fürs Sichern praktisch nichts.
- Meisterkarte speicher.K1–K5 = 10/10 Punkte, aber K2–K5 nur „gehalten" an alten SHAs (d3708675, 2d5f4146, e475c6b4), alle in der `naehe`-Liste
  (`punkte/stand.json:4947–4954`); K2–K5 Radeon zuletzt „SITZUNG ABSTURZ Exit 3221226505" an 36f9d45a (ungemessen, nie ROT).
- Zwilling im Schreiber: `stamm/dienst.js:1514–1516` — ohne worldId schreibt saveState den GANZEN Stand synchron in localStorage
  (`anazhRealmState`); der eigene Kommentar nennt den Fall „unmöglich". Fail-soft-Zweig neben dem EINEN Faden (G4).

**Lecks (rot, Täter zum größten Teil UNBENANNT):**
- Die Gang-Linse nennt Halter nur nach **ArrayBuffer-Bytes** (`scripts/lib/draw-zaehler.cjs:543–551`): Maps, Sets, Arrays, Strings wiegen 0.
  Benannt an ec281422: `r._foundry.cache[].children[].geometry.attributes` +15,7 · `renderer.info.memoryMap[k].array` +12,0 ·
  `creatures[].userData._tierBaum.straehnen[]` +2,7 = **30,4 von 101 MB** (30 %); an c4010773 ~23 von 435 MB (5 %). Der Rest hat keinen Namen.
- Foundry-Cache: Deckel nach Zahl 512 und Gewicht 512 MB (`stamm/studio-gestalt.js:1459,1465`, begründet mit dem „Ring-Working-Set ~351 MB",
  also mit der WELT), dazu der Ruhe-Deckel 64 MB für Körper ohne Senke (`:1467`, `_foundryRuheDeckel` :1024–1035). 64 MB Untätige sind ein
  fester Sack, kein Schirm: was am Start-Vergleich als +15,7 MB steht, ist genau dieser Sack beim Füllen.
- Karten-Atlas wächst nur (`stamm/stoff-karte.js:281–307`: `at.cap >= soll` sonst wachsen; kein Pfad gibt eine Schicht frei) → +8,7 MB VRAM in 15 min.
- `_trittSchwach` (`stamm/siedlung-wege.js:1024,1036,1119`): Map mit String-Schlüssel je getretener 0,x-m-Zelle von Spieler UND Bewohnern/Tieren,
  vergisst erst nach n·e^(−Δt/20 d) < 0,5 (`:1128–1130`) ≈ 14 Spieltage; FUND-REGISTER Z. 50: 8 762 Zellen je km. Wächst mit dem Weg.
- Rückfall belegt: `heap-leck` 65987faa (22.10.) stand bei +2,9 MB/min (6 min Radeon); heute +6,8 … +49,7.

## Die EINE begrenzende Entscheidung
**Speicher wächst mit dem Schirm, nie mit dem Weg:** was keine Senke am Schirm zeichnet und der Stand nicht trägt, lebt höchstens so lange wie das
Fenster seiner Stufe — ein fester Byte-Sack (64 MB Ruhe, 512 MB Cache) ist kein Deckel. Und: kein Schnitt ohne Namen — die Gang-Linse wiegt Einträge,
nicht nur Puffer, damit die 70–95 % ohne Namen einen Täter bekommen (Gebot 10, bestehende Familie `gangUrteil`).

## Der Schnitt (die Klasse ganz: „Sammlung ohne Schirm-Deckel")
Stufen in EINER Welle (jede am selben Gang-Urteil gemessen, keine macht die Nachbar-Stufe schlechter):
1. **Name:** `heapHalter` (`draw-zaehler.cjs:~520–556`) zählt je Pfad zusätzlich die Einträge von Map/Set/Array (Schätzgewicht je Eintrag),
   `gangSelbsttest` (:606) bekommt die Mutante „Map mit String-Schlüssel, die mit dem Weg wächst" (Muster `_trittSchwach`) → ROT am Namen.
   Kein neues Tor, kein Soll bewegt (5 MB/min, 2 MB bleiben).
2. **Foundry-Ruhe an den Schirm:** `_foundryRuheDeckel` räumt Körper ohne Senke, deren Wo außerhalb des Ring-Fensters der Stufe liegt
   (statt „älteste bis 64 MB"); `FOUNDRY_RUHE_BYTES` fällt als Konstante. Räumung nur über die EINE Naht `_foundryCacheEvict` (:1051).
3. **Karten-Schicht frei:** eine Karte ohne lebende Senke gibt ihre Schicht in eine Frei-Liste; `_impostorAtlasTexturen` (`stoff-karte.js:287`)
   vergibt zuerst Freie, wächst erst danach. Der Atlas wächst mit der Vielfalt am Schirm, nicht mit der bereisten Vielfalt.
4. **`_trittSchwach` an das Fenster der Nah-Stufe:** Zellen außerhalb `wegeKarte.stufen[0]` fallen beim Umzug (sie sind Stufe 0 = unsichtbar
   und nicht im Stand); `siedlung-wege.js:1024/1119/1128`.
5. **Persistenz-Nachbar (gleiche Welle, S):** `visibilitychange→hidden` und `pagehide` rufen `saveState()` (ohne `takt` → sofort an den Faden,
   `speicher-welten.js:2310–2311`); `dienst.js:1514–1516` wirft laut statt still in localStorage zu schreiben.

**Leser-Liste (vor dem Schnitt):** `_foundryCacheGet/Set` (studio-gestalt.js:961/990) · `_foundryLoslassen` (:1039) · `_foundryFlattenFor`-Rufer
(siedlung-instanz.js:938/1108/1130, siedlung-bauten.js:608/752/1255, vegetation-streu.js:936/945/998/1413/2018, studio-bruecke.js:3445,
vegetation-baum.js:3021, siedlung-ort.js:1951, werkstatt-vorschau.js:778, dienst.js:998) · Höhen-/Kronen-Buch (studio-gestalt.js:1006–1009, NIE
geräumt — bleibt) · `_tritt`/`_trittMalen`/`_trittErholen` (siedlung-wege.js:1007/1079/1108) · Karten-Leser `_impostorAtlasTexturen`
(stoff-karte.js:287) · Flugschreiber-Zensus `foundryCacheN` (dirigent-regler.js:1746) · `gangUrteil` (draw-zaehler.cjs:560) · Leser des Legacy-Keys
(speicher-laden.js:222, speicher-welten.js:384/400 — Migration, bleiben).

**Kosten-Zeile:** Ziel am Gang Radeon: Heap ≤ 5 MB/min (heute 6,8–49,7), VRAM ≤ 2 MB zurück am Start (heute 15,7), verwaist 0 (heute 0,16).
Risiko-Seite: Neu-Anfragen nach Räumung kosten Bake im Faden — Ankunft (B) und Speicher-Bild p95 (0,03 ms) dürfen nicht steigen.

**Kriterien:** profiband.K5#1/#2 (radeon, gtx) Ist 0/2 ↔ Soll 2 — Station `punkte/stationen/g6.js:3343–3372`, Richter `k5Richter` :1706;
speicher.K1#1/#2 (Tab-Tod, Alter ≤ 10 s) Ist 2/2 gehalten — die Stufe 5 darf es nicht senken; speicher.K2#2 (Speicher-Bild ≤ 0,1 ms) Ist 2/2.

## Was schon liegt
- main ec281422: der ganze Speicher-Faden (`speicher-faden`, `speicher-takt`, `speicher-k2-anhang`, `speicher-k5-korpus` sind in main).
- `origin/heap-leck` 65987faa (0 vor main, gelandet 22.10.): voriger Leck-Schnitt, damals +2,9 MB/min — Beleg für den Rückfall seither.
- `origin/heap-ausdauer` d6d0a555 (2 vor main, 26.10.): nur Merge-Commit, nicht gelesen, was er trägt.
- FUND-REGISTER Z. 33: `nodeBuilderCache` „in Arbeit (funde-6a57 heil:leck)" — an dc9eacb0 steht er noch mit +3,9 MB; Zweig nicht gefunden.
- Kein Zweig trägt die Stufen 1–5. Fehlt bis zur Landung: alles, plus die Dauer-Probe am Stück (siehe offen).

## Ehrlich offen
- **K5 fällt nicht allein am Speicher:** ec281422 ROT 5 — auch „3 Seiten zwischen Anfang und Ende (neu geladen)", 14,78 < 20 min, Weg 0,2 < 5 km.
  Warum die Seite neu lädt (Probe oder Absturz der Seite), nicht gelesen. Der Absturz der Werkbank Exit 3221226505 (0xC0000409) ist unbenannt;
  ein Bezug zum Heap von 731 MB ist NICHT gemessen.
- Ob der Heap-Vergleich über drei Seiten hinweg überhaupt dieselbe Seite misst: nicht geprüft (`pbZus`/`dauer` in g6.js nicht ganz gelesen).
- `renderer.info.memoryMap[k].array` +12 MB: ob das tote Attribute vor dem Kehraus (`bild-kosten.js:1446–1460`) oder lebende sind, die die
  Breitensuche nur zuerst über den Renderer erreicht — nicht unterscheidbar aus der Zeile. Ob r184-WebGPU `onUpload` ruft (CPU-Kopie freigeben): nicht gelesen.
- `buf:?` +13,1 MB VRAM ohne Erzeuger-Namen — `__vramBericht` nicht gelesen.
- GTX-K5 zuletzt 05.11. (kurs-B Z. 30); Radeon-only Zahlen oben.
- Stufe 5 (pagehide) bewegt keinen Punkt: speicher.K1 misst nur den harten Tod. Sie ist Spieler-Wert, nicht Punkte-Wert.

## Rang
- Stufen 1–4 (Leck-Klasse): Wirkung im Takt **4** (Drift 58,7 → 83,7 ms am Anker, Pflicht E, Domäne profiband 0 Punkte) · Aufwand **M** ·
  Risiko: eine zu früh geräumte Gestalt wird neu gebacken und flackert am Rand — darum Räumung nur außerhalb des Fensters, nie bei `_liveRefs` > 0.
- Stufe 5 (Persistenz): Wirkung **2** (sanftes Schließen verliert nichts mehr) · Aufwand **S** · Risiko: `pagehide` lässt dem Worker evtl. keine
  Zeit — `hidden` kommt vorher und trägt den Wert; der harte Tod bleibt bei ≤ 6,9 s.
