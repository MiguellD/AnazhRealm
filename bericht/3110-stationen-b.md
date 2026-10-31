# Bericht 3110 stationen-b — 18 Kriterien ohne Station: der Spike je Kriterium, zwei neue Stationen

**Status: ZWISCHENSTAND.** Zweig `w4-stationen-b-koord` (von koordination d5216fb0), Spiel-Zweig `w4-stationen-b` a2f3ec2c (von main
94c079cb). Gemessen in der Cloud (headless, Null-Renderer bzw. OfflineAudioContext); GPU-Zeiten kann die Cloud nicht messen — ihre Zahlen
stammen aus PFLICHT-OFFEN und den Belegen der Karte und stehen dort beim Namen.

## Die Spike-Tafel (18 Zeilen)

| Kriterium | Urteil | Zahl · was fehlt |
|---|---|---|
| feld.K5 | ROT | 0 sichtbare Leser am Ort: Wiese, Streu und Baum lesen nur das gefrorene `worldFieldAt` (`stamm/vegetation-baum.js:1330`, `vegetation-streu.js:20`), sichtbar liest `auraAt` nur der globale Tint an der Spieler-Position (`stamm/bild-himmel.js:1096` — das Schlupfloch); die Äsung der Tiere (`_kreaturNahrung`) ist Kapazität der Region, kein Bild am Ort binnen 60 s. Fehlt: ein Leser von `auraAt.lebendig` in Wiese oder Streu (Spiel-Bau). |
| affekt.K5 | ROT am main → GRÜN am Spiel-Zweig | **Station gebaut.** Main 94c079cb: Valenz +2,2 ↔ −1,6 als Feld-Abdruck am Spieler → Chroma-Abstand am Abgriff **0**, dieselbe Valenz global 0,486 — die Musik las `state.player.emotions` am Feld vorbei. Spiel-Zweig `w4-stationen-b` a2f3ec2c: Feld **0,486**, global 0,486. |
| pipeline.K2 | ROT | Zwei Bäcker: das Studio backt mit r128 (`bakeImpostorAtlas`, `foundry-bruecke.js:246`, WebGLRenderTarget), die Welt ihren eigenen Array-Atlas mit r184 (`stamm/stoff-karte.js`, `_impostorBakeQueue`, drei Schichten bzw. DXT1/RGTC2) — Byte-Gleichheit ist zwischen zwei Renderern ausgeschlossen. Fehlt: EIN Bäcker (Spiel-Bau). |
| pipeline.K5 | ROT | Der Foundry-Worker lädt `worlds/terrain/lib/three-r128.min.js` (603 445 B) per importScripts (`stamm/studio-bruecke.js:587`, `lib` aus `cores.manifest.json:7`) und liest das Manifest per **synchronem** XHR (`:566–568`). Fehlt: die Brücke ohne r128 und ein asynchrones Manifest (Spiel-Bau). |
| ki.K5 | unmessbar ohne Anbieter | Verlangt einen Anbieter-Host im Netz-Log; die Cloud trägt keinen Schlüssel, ein Mitschnitt ist der Stub des Schlupflochs. Letzte Messung (Karte, 57a9f2ab, Radeon, qwen3:4b lokal): p95 11,68 s > 6 s ROT. |
| tore.K1 | ungemessen (GPU) | Keine Probe misst Kreuzen der Apertur → erste angenommene Eingabe mit Wirkung im Ausgabe-Bild; tore.K5#1 (126 ms) ist die Teilen-Geste, kein Durchgang. Welt-Tor lädt die Seite neu (`_weltWechselNeuLaden`, GTX Zweit-Boot 12,0 s) → die Welt-Zeile ROT; das Studio-Tor bootet kalt im iframe und ist nur auf der Karte messbar — der Fahrt-Rest ist Radeon 25 s, GTX 30 s. |
| tore.K2 | ungemessen (GPU) | Zwei Ausgabe-Bilder auf der Karte (Membran 3 m vor der Apertur, Ankunft nach ≥ 1° gedrehter Kamera); kein Werkzeug für das Ankunfts-Bild; die Klassen tor-fern/-bunt/-ziel ohne Ist, 6 von 10 Panoramen veraltet (Karte, diag-studio-huelle) — „Stempel frisch“ fällt dort. |
| tore.K4 | unmessbar ohne zweites Gerät | Staffel 1 verlangt zwei physische Geräte im LAN und den Peer im Ausgabe-Bild von B; zwei Seiten einer Maschine sind das Schlupfloch (B54). |
| leib.K3 | GRÜN | **Station gebaut.** Ego und Third je 282/282 Bilder schwimmend (geerdet 0), Tauchgang 2,21 m unter die Schwimm-Linie (Augen unter 189 Bilder), Ruck Leib/Kamera max 0,013/0,009 m (Ego), 0,012/0,012 m (Third) ≤ 0,03 m; die Mutante (0,3 m Schnappen) 0,202 m erkannt. Headless 20,7 s. |
| spielgang.K1 | ROT | Kein Lauf misst die Schritte in EINER Sitzung aus aufgenommenen Eingaben (jede Probe nimmt die Konsole — das Schlupfloch); Schritt 1 (Ankunft K1, GTX kalt 16,6 s) hält sein Soll nie. Fehlt: der Replay-Gang (Richter-Arbeit, B62). |
| spielgang.K2 | unmessbar ohne Blind-Spieler | Verlangt einen frischen Agenten mit Bild und Eingabe im echten Fenster ohne Doku; kein Werkzeug, kein Modell mit Sicht in der Kette. |
| spielgang.K5 | ROT | Keine Text-Quelle DE/EN: 0 i18n-Leser im Stamm, 107 harte `textContent = "…"`-Zuweisungen in `stamm/*.js` (Zählung). Spiel-Bau. |
| ultiversum.K1 | ROT | Die Schwerkraft reist nicht: `state.gravity` fehlt in der Stand-Tafel (`stamm/speicher-welten.js`), der Welt-Wechsel lädt neu → −9,81 in jeder Welt (`stamm/dirigent-kern.js:226`); `terrainSteepness` reist, aber kein Gelände-Bau liest es (nur eine DSL-Regel, `stamm/feld-leben.js:537`). Spiel-Bau. |
| ankunft.K1 | ROT | GTX kalt 16,6 s (16,1–17,0), Radeon ~11 s gegen ≤ 5 s an einem und ≤ 10 s am anderen (PFLICHT-OFFEN B); `diag-boot-stage` endet zudem an der Eigenmeldung `_weltbildDa` (Schlupfloch). |
| ankunft.K4 | ROT | Am Spawn misst die Soll-Tafel 3 von 12 Klassen (tor-fern, tor-bunt, tor-ziel), Soll ≥ 6 frisch GRÜN (PFLICHT-OFFEN A). |
| ankunft.K5 | ROT | Radeon bis zum Weltbild blockiert 4,60–5,01 s (Median 4,79 > 4 s), längste Aufgabe 585–688 ms (> 250 ms) (Karte, 57a9f2ab); GTX 13,07–13,74 s blockiert (97 % des Fadens, PFLICHT-OFFEN B). |
| streaming.K1 | ungemessen (kein Werkzeug) | Keine Linse zählt Lücken-Bilder in Fahrt; Boden-Voraus fest 1–2 Chunks à 43,2 m, ein Chunk je Takt, GT vmax 16 m/s. Braucht eine 60-s-Fahrt mit Bild-Diff auf der Karte — größer als der Fahrt-Rest (25/30 s). |
| streaming.K2 | ungemessen (kein Werkzeug) | Keine Ereignis-Zählung „fertig in der Stufe“ ↔ „tritt in den Sichtkegel“; die Karten bäckt nur die echte GPU (am Null-Renderer nie). |

## Die neuen Stationen

- **leib.K3#1** (`stationen/g5.js`, `leibK3Lauf`, headless, 4 min Deckel): am See nächst der Mess-Wiese (1816/−6168 aus `__wasserOrte`) je
  Sicht der Gang im echten Takt (`_gameLoopTick`, Bilder 8,3–33,3 ms): Stand → W bis der Leib schwimmt → W bis 2,5 m Wasser → Shift + W
  (Tauch-Geste) → Auftrieb; je Bild Leib und Kamera, der Ruck (Lage gegen die Linie der Nachbarn) gegen die Wand 0,03 m; die Mutante
  (0,3 m Schnappen) im selben Lauf. 7 Proben im Selbsttest (Kamera schnappt, kein Tauchgang, am Grund, Third fehlt, kein See, blind).
- **affekt.K5#1** (`stationen/g2.js`, `affektK5Lauf`, headless, 2 min Deckel): der Lofi-Akkord der Stufe 0 am OfflineAudioContext über den
  echten Leser `_lofiPlayChord`, Chroma über fünf Oktaven; die Valenz von `auraAt.emotion` am Spieler (+2,2 ↔ −1,6) global und als
  Feld-Abdruck, je Weg die Kontrolle (die Mutation erreicht auraAt) und das Rauschen. 6 Proben (main-Befund, blind, Rauschen, nur Feld).
- **Spiel-Schnitt** `w4-stationen-b` a2f3ec2c (`stamm/klang.js`, +13 Atome Spiel, scripts 0): Akkord, Stufe, Melodie, Groove und Tempo
  lesen die emotion-Achse aus dem EINEN Feld-Leser der Musik (`_lofiWorldField`, auraAt am Spieler). Playtest „Alle Invarianten OK“,
  `check:statik` grün.

## Gemessen

`punkte.cjs liste --kopf 94c079cb`: 223 Stationen · 131 Kriterien · Fehler 0 (vorher 221 · 129). `selbsttest --ohne 3c`: 118/118 GRÜN
(215 Proben). Die Fahrt der Karten unberührt (beide Stationen headless): Radeon 1 775 s, GTX 1 770 s.

## Ehrlich offen

16 der 18 Kriterien bleiben ohne Station: 9 ROT am Spiel (feld.K5, pipeline.K2, pipeline.K5, spielgang.K1, spielgang.K5, ultiversum.K1,
ankunft.K1, ankunft.K4, ankunft.K5), 4 ungemessen ohne Werkzeug oder GPU-Fahrt (tore.K1, tore.K2, streaming.K1, streaming.K2), 3 unmessbar
ohne Anbieter, zweites Gerät oder Blind-Spieler (ki.K5, tore.K4, spielgang.K2). affekt.K5#1 bucht erst nach dem Merge von
`w4-stationen-b` und der Farm-Messung am neuen main.
