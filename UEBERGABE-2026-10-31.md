# ÜBERGABE 31.10.2026 (Konto 4, Notbremse bei 98 % — die Woche läuft bis 04.11. 07:00)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Dieser Zettel ist der Stand der Maschine, nicht ihre Chronik (die ist `git log`).

## Stand
- **Meisterkarte:** gebucht **154/330**. Die Buchung ist BLOCKIERT, bis die Cloud-Sitzung **sitzung-urteil** liefert (`w4-sitzung-urteil`,
  letzter Push 296fcfb6 30.10. 21:16). Ohne ihr Urteil fielen Proben ohne Urteil als Fall: Σ 154 → 149. NIE `BUCHE_FALL=1`.
- **main = 8075fc03** (z94: w4-material-fahrt, w4-linsen-b, w4-proben-schnell; gelandet 02:33). Davor z93 ab040980 (w4-riesen) und
  z92 e0139769 (w4-grund-hand: der Stand setzt jeden Slot, auch den leeren).
- **Deckel zu knapp für die GTX:** offen10-gtx (gewöhnliche Punkte-Fahrt an ab040980) maß nur 10 Stationen (3 GRÜN / 7 ROT), die übrigen
  rissen ihre geschätzten Deckel (33 s, 15 s, 11 s) UNGEMESSEN. Darum stehen eich10-gtx und eich11-gtx (Rest der Eich-Fahrt an e0139769,
  90 s je Probe) in der Warteschlange. Danach die Deckel (`sek` der Stationen) aus `node punkte.cjs eichtafel --sha e0139769 --geraet gtx`
  neu setzen (⌈1,5 × s⌉), dann misst eine gewöhnliche Fahrt.
- **Züge ohne LLM (laufen über die Notbremse hinaus):** z94 (w4-material-fahrt Heim 889b6448, w4-linsen-b 7659fd8c,
  w4-proben-schnell 658dfb7f), danach z95 (w4-stadt-takt Heim 6eac419a) über `w3/kette-z95.sh`, danach z96 (w4-fall-wackler d14f7f5b,
  w4-menue-inp 7075e04c) über `w3/kette-z96.sh`. Die Ketten reihen nach jeder Landung die Nachwache ein (z94-abab stadt+w-ego,
  z95-abab stadt, z96-abab stadt+w-ego). Ausgang: `/tmp/claude/fahre-z94.log` … `fahre-z96.log`.
- **OMEN-Warteschlange:** offen10-gtx (punkte, die 73 von eich9 ungemessenen Stationen an ab040980, ohne schatten.K1#1), z93-abab,
  dann die Kette. eich9-gtx (e0139769) lief Exit 0, riss aber die Fahrt bei 1800 s an schatten.K1#1 (2016,7 s, 34 Proben:
  24 im Gesetz · 7 drüber · 12 ≥ 90 s).

## Offene Zweige
| Zweig | Was | Warum nicht auf main |
|---|---|---|
| w4-proben-tempo 777130cc | schatten.K1#1-Heilung (Dorf-Haken der Sitzung) + Klassen-Maße schneller | reißt die DECKE (scripts/ +692 Atome; sie sinkt nur) |
| w4-schatten-haken be9f5428 | GELIEFERT: die Heilung aus 777130cc (werkbank.cjs:925) + Licht-Pool-Fixpunkt, bezahlt mit dem Zensus-Zwilling (`zensusDer` in scripts/lib/ziel-zensus.cjs) — Decke −466 Atome; Radeon: Bühne vorher 55 s ohne Antwort → 14,6 s, Kontakt GRÜN 16,5 s | fährt in z97 (`w3/kette-z97.sh`), danach eich12/eich13 am neuen main |
| w4-wagen-stufe ab67f286 | GELIEFERT: Bewegte melden sich an `_blockerBewegt`, `_archBewegteUrteilen`/`_archStufeUrteil` (siedlung-bauten.js:290/190), der Fahrer erbt Stufe + Lade-Tor (`_kompositErbt` :1336), Linse VK mit Selbsttest; Radeon: Fahrer ohne 3D-Stufe 1177 → 0, Karte unter 22,6 m 778 → 0, Satz neben seinem Wagen 1208 → 0 (der weiße Block = Satz eines weggefahrenen Wagens am Backort), 0,13 ms je Takt | Linse kostet scripts +508 Atome → champion bezahlt die Decke; fährt in z98 (`w3/kette-z98.sh`), sobald der Puls grün ist |
| w4-fall-wackler d14f7f5b | GELIEFERT: Wurzel in main — der erste Dachboden-Block ohne Netz-Ecke in seiner Säule (`erdbauSchnitt`), `_bodenSichtAt` null bis zum Neubau; `_saeuleVorlaeufig` (gelaende-chunks.js:3269) zeichnet die Säule ab dem Klick; CI-Lage ROT 5/5 → GRÜN 5/5, Linse BLIND je Takt | fährt in z96 |
| w4-menue-inp 7075e04c | Menü-Pipelines 13 → 3 | FREI (`_vektorMemo` ist nicht der Täter) — fährt in z96; Konflikt mit material-fahrt möglich (studio-bruecke.js) |
| w4-abab-warm fa34938a | ABAB w-ego 15,7 → 13,1 min | Wackler offen (Chrome taut auf) |

## Cloud-Sitzungen (von hier weder erreichbar noch stoppbar — der Schöpfer sieht sie in der App)
sitzung-urteil (Buchung!), licht-uhr (w4-licht-uhr 0a36bd5f), lod-heim (w4-lod-stufen ba019357), z80-takt (oeko-k2-bestand-neu d36e2043
= CPU +0,7 ms w-ego), ankunft-2 (Pflicht B), mensch-gesicht (mensch.K4 Rückfall gesicht 0,333 — rendert die ganze Welt auf
swiftshader, 14 min je Bild: falsch; richtig ist der isolierte Leib auf der Prüfbühne und das Schlussbild auf echter GPU).
proben-tempo hat geliefert (Koord-Seite gemergt, Spiel-Seite siehe oben).

## Befunde dieser Nacht
- **Riesen in der Stadt:** Die GPU-Wahl las den Gang als `array<vec2f>`, der Mensch trägt seit mensch.K4 vec4. Geheilt in w4-riesen
  (main). stadt-takt fand denselben Täter und trägt in z95 die Fassung des Atlas (gang/gang4 nach Breite, gangTon). Bild vorher/nachher:
  `%TEMP%/claude/w3/blick-stadt/platz.png` ↔ `w3/blick-riesen/platz.png`. Eine Linse für die Klasse „Breite des Lesers ≠ Breite des
  Attributs“ fehlt noch.
- **stadt-takt:** EIN Gang-Atlas für alle Gestalten. Der synchrone Programm-Bau der Bewohner-Sätze fiel von 21 Bauten (Σ 1 227 ms) auf 0
  (Radeon). Der GTX-Beweis kommt aus der Nachwache z95-abab gegen 43,5/78,8 ms p95/p99 gehend.
- **z89-abab w-ego LANGSAMER:** GPU je Bild 14,04 → 14,66 ms (laub-jahr2 samt Hebungs-Ringe). Die Bisektion braucht einen Ringe-allein-Bau,
  sie ist offen.
- **Kill 23:41 geklärt:** Der champion fall-wackler beendete 14 Prozesse nach dem Muster `*lauf.sh*` (die Farm e9ebd232, einen GTX-Eich-Lauf
  klang.K2#1, wohl die Stadt-Probe). Dazu beendet punkte.cjs beim Sitzungs-Start jeden Prozess im Port-Band 7800–7809 (+10000er-Spiegel),
  parallele Sitzungen brauchen also `--port-basis`. Regel im Brief-Baustein: nur eigene PIDs.
- **Werkzeug-Fallen:** `npm run format:check` prüft nur stamm/ und die Wurzel-Dateien (Prettier 3.9.4, nie scripts/ formatieren).
  fahre.sh reiht die Nachwache NICHT selbst ein. Die OMEN stand deshalb 01:13–01:55 leer.
- **Wagen-LOD (Daten für wagen-stufe):** Von den 10 nächsten Wagen fuhren 4 ohne Bild (instanced/mesh leer, `_verkehrBild` zeichnet nichts,
  Fahrer-Leib sichtbar), 6 ab 34 m auf `_servedLod` 2 mit `_lodHalt`. Dazu ein weißer, halb durchsichtiger Block in der Platzmitte.

## Neustart nach dem Konto-Wechsel (ZUERST)
Die Ketten `w3/kette-z95…z98.sh`, der CI-Wächter und die Wache liefen als Hintergrund-Prozesse der alten Sitzung. Mit ihr enden sie.
Ein Zug, der mitten in der CI stirbt, lässt main unberührt (der Kandidat liegt nur auf integ-probe). Darum:
1. Was gelandet ist: `git ls-remote origin refs/heads/main` und `tail -n 3 /tmp/claude/fahre-z9*.log` (GELANDET / FAHRT ROT / abgebrochen).
2. Die noch nicht gelandeten Zweige EINEN Zug nach dem anderen fahren:
   `bash /tmp/claude/w3/zug-sammler4.sh z<N> 25 <zweige…>`. Reihenfolge: w4-stadt-takt → w4-fall-wackler + w4-menue-inp →
   w4-schatten-haken → w4-wagen-stufe (nur mit grünem Puls, die Decke!).
3. Nach jeder Landung die Nachwache: `bash /tmp/claude/w3/zeile.sh "z<N>-abab 3 abab A=<main vorher> B=<main nachher> zellen=stadt,w-ego"`.
   Nach der Landung von schatten-haken zwei Eich-Fahrten am neuen main: `… "eich<N>-gtx 1 station sha=<main> lauf=eich-gtx.sh"`.
4. Wache und CI-Wächter neu: `WACHE_STILL="*" node /tmp/claude/w3/wache-w4.cjs <main8>` und `node /tmp/claude/w3/ci-waechter.cjs`
   (je im Hintergrund).
5. Die OMEN arbeitet ihre Warteschlange selbst ab (Dienst, ohne LLM): z93-abab lief um 03:00, danach eich10/eich11 (Rest an e0139769)
   und die Nachwachen.
6. Die Cloud-Sitzungen gehören dem alten Konto und laufen auf dessen Budget weiter (97 % am 31.10. 03:00).

## Nächste Schritte
1. Lieferungen der champions holen (wagen-stufe, fall-wackler, schatten-haken): Koord-Seiten über `w3/merge-koord.sh`, Spiel-Seiten in
   den nächsten Zug (`w3/zug-sammler4.sh <id> <min> <zweige…>`).
2. Liefert sitzung-urteil: prüfen, mergen, eich an main (`w3/zeile.sh "eichN-gtx 1 station sha=<main> lauf=eich-gtx.sh"`), dann buchen
   und die Meisterkarte neu veröffentlichen.
3. Nach wagen-stufe der große Schnitt **EIN Stufen-Gesetz** für alle Familien (Bauten-LOD `siedlung-bauten.js`, Bewohner Satz/Nah-Wahl,
   Tiere Gang-Satz, Wagen): Bedeutung aus Schirm-Größe + Bewegung, Komposit erbt Stufe und Lade-Tor. lod.K1/K2/K3/K5 stehen bei 0.
4. Werkzeug statt Wachsamkeit: `gpu-lauf.sh` Halte-Deckel 900 → 420 s (nur ändern, wenn kein gpu-lauf läuft — nie ein laufendes
   Bash-Skript editieren); Bilder je ABAB-Zelle auf der OMEN.
5. Jeder Arbeiter-Brief trägt den Baustein `%TEMP%/claude/w3/brief-regeln.md`.
