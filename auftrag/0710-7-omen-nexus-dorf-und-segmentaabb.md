# Auftrag 0710-7 an den OMEN — Werkplatz: deine drei Befunde aus 0710-6

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Danke für 0710-6: **main steht jetzt auf V18.535
c966b9c3** (Fast-Forward nach deinem Urteil „nicht langsamer": CPU p95 voll 24,1 → 9,7 ms, Hänger 4 → 0, VRAM 148,8 → 122,8 MB).

**Basis:** main c966b9c31a1ca4326741074c5f52dd87f76d1163 (V18.535). Branch `welle-m-nexus`, Ports 7900–7909. Rangfolge wie
bisher (ein Messauftrag hat Vorrang). EIN Arbeiter.

1. **SPIEL — ein autonomes Dorf reißt dem Spieler den Blick herum** (dein Boot 4B): der Nexus setzt `spawn_village` autonom,
   `spawnSettlement` ruft IMMER `_nachDorfOrientieren` → die Gier sprang mitten im Lauf auf −2,745. Wurzel: die Blick-Ausrichtung
   gehört nur zu einem Dorf, das der SPIELER verlangt hat („dorf 7 18", „baue dorf hier"), nie zu einem Welt-/Nexus-Akt. Eine
   Absicht-Angabe an EINER Stelle (wer verlangt das Dorf), kein Flag-Zwilling. Linse zuerst: ein autonomes Nexus-Dorf während
   der Spieler steht → Gier unverändert (vorher ROT mit −2,745), ein Spieler-Dorf orientiert weiter.
2. **MESSUNG — die Bühne hält das Wetter, aber keine Nexus-Spawns**: dieselbe Klasse wie der Wetter-Halt (mess-wahrheit:
   „Halt heißt Halt" an `_setWeather`): unter der Mess-Bühne verweigert die EINE Engstelle der Nexus-Welt-Akte (Dorf, Spawn,
   Tier-Spawn at_player, Größen-/Tempo-Würfel, falls noch vorhanden) jeden Zug und nennt ihn beim Namen; das Spiel selbst bleibt
   unverändert. Wand wie gate:wetter-wache (vorher ROT mit dem echten Täter). Die Mess-Folge (`omen-messfolge.cjs`) prüft das als
   Wache.
3. **CPU — `_segmentAABB` 8,4 % in allen 4 B-Boots**: der nächste CPU-Hebel. Miss zuerst (Aufrufer, Aufrufe je Frame, je Segment
   wie viele Boxen), dann schneide an der Wurzel (Gebot 7: Kosten an Schirm und Änderung — z. B. ein Raster/Nachbarschafts-Index
   statt aller Boxen, nur Bewegte prüfen), Ergebnis byte-gleich (dieselben Treffer). Zahl vorher → nachher in EINER Welt (ABBA)
   UND als Zeit — du bist der Zeit-Richter: ABAB gegen V18.535 am Ende.
**Wände/Handwerk:** wie bisher (node --check, eslint 0, prettier --check, NIE git stash, Regex nur per Edit-Werkzeug, Commits
deutsch ohne Siegel-Wörter mit Co-Authored-By, npm run check, playtest:fast, voller playtest einmal, Push, CI — Reruns bei
apt-/Deckel-Abbrüchen über mich). Die CI hat jetzt drei playtest-Gruppen: jeder neue Gate-Schritt braucht seine `matrix.gruppe`
(gate:ci-deckung).
**Bericht:** `bericht/0710-7-nexus-dorf-segmentaabb.md` + Kopf.
