# Auftrag 0710-2 an den OMEN — Werkplatz: Familie FAHREN-2 (die Leben-Schau vom 07.10.)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Rangfolge wie 0710-1: ein Messauftrag hat Vorrang
(WIP sichern, Ruhe, messen), dazwischen dieses Paket. EIN Arbeiter, kein Fan-out. Danke für P2 — sauberer Schnitt.

**Warum:** Der Schöpfer fragt „fahren in der Welt, jumpen über Hügel — kommst du voran?". Die Leben-Schau fuhr den
Welle-L-Stand (integ-l 828d5ace) sichtbar: 6 von 10 Fahr-Defekten vom 06.10. sind geheilt, aber drei NEUE schwere Fallen
sind aufgetaucht. Befund: `kontext/leben-schau/befund-fahren-gelaende.md` (Bilder `kontext/leben-schau/fahren-gelaende/`),
der alte Befund `…-0610.md`, der Spiel-Plan `karte-fahren-gelaende.md`. Lies alle drei GANZ.

**Basis:** integ-l **388c1cc0** (Welle L mit kreatur · koerper-haus · fahren · kampf-maus · auge-v1). `git fetch origin integ-l`,
`git worktree add -b welle-m-fahren <pfad>\welle-m-fahren 388c1cc0`, `npm ci`. Ports 7900–7909.

**Auftrag — je Klasse: Linse zuerst (vorher ROT mit Täter), Schnitt an der EINEN Engstelle, Bild-Beweis, Zahl:**
1. **Hangfuß-Falle (schwer):** an (−852/−861,2), Gier 92,3, deterministisch: der Kontakt-Löser schiebt den GT bei 9,3 m/s in
   EINEM Frame 0,97 m quer (Glutbrunnen −848,9/−861,8), Stufe nur 0,18 m → der Wand-Zweig `vehicle-core.js:2720` (`z.vy = 0`)
   friert die Höhe für immer ein; der Wagen sinkt 1,16 m unter die Rad-Ebene, ein Rad 1,02 m im Boden; die Gelände-Wand der
   Hülle rechnet ihre Ebene aus dem eingefrorenen `fz.y` (`anazhRealm.js:89353–89378`) und sperrt jede Richtung.
   Klasse: „eine Kollisions-Antwort ohne Erdung" — nach JEDER Kontakt-Antwort steht der Wagen wieder auf dem Gesetz (Lehre 22:
   Körper stehen auf dem Gesetz), ein Schub je Frame ist begrenzt (kein 0,97-m-Sprung).
2. **Unsichtbare Wand an der Spaltkante:** (−904/−975) Tempo in EINEM Frame 11,44 → 0,19 m/s, Gas danach 0,00 m, der Bug ragt
   über die 23-m-Kante. Täter vermutet `_fahrHuelleKontakt` (:89364ff) — isolieren. Soll: der Wagen fährt über die Kante und FÄLLT.
3. **Jeder Stoß ist ein Stopp ohne Folge:** Baum 10,41 → 0,16, geparkter GT 11,28 → 0,00, Bär 9,27 → 0,17 m/s, je in EINEM Frame,
   kein Rückprall, der Gegner bewegt sich nicht, keine Kamera-/Klang-Rückmeldung. Soll: Impuls-Austausch nach Masse (Masse aus dem
   Leib/Kern, K-D9 „Rückstoß, Masse aus dem Leib"), Rückprall nach Stoß-Zahl, Gegner-Wagen/Tier bekommen ihren Impuls (der Bär
   taumelt), ein Stoß-Ereignis für Kamera-Ruck und Klang (Klang-Gesetz: die Quelle trägt ein Gesetz, `gate:klang-zensus`).
4. **Klein:** `phyto:lod.budget (gras)`-Fehler beim Boot (`_foundryBudgetZeile` liest vor dem Buch, `anazhRealm.js:70445`) —
   Lese-Reihenfolge an der Wurzel; Maß-Beschriftungen (RADSTAND, ÜH-H …) liegen in der Labor-Probefahrt über dem Wagen (garage).
5. **Prüfen, nicht doppelt schneiden:** der Wagen-Geist ab ~8 m in der Verfolger-Sicht (Q14) — besteht er auf 388c1cc0 (auge-v1
   gemergt)? Wenn ja: Ursache benennen (eigenes Fahrzeug darf nie dithern), schneiden. Das Ufer-Kriechen (D5, „drei
   Wasser-Wahrheiten") schneidet der wasser-Merge (`_koerperWasser`) — NICHT hier; nur benennen, falls 388c1cc0 es noch zeigt.

**Beweis:** sichtbare Fahrt am echten Renderer (GTX 1060) an genau den Orten der Leben-Schau, Bild-Paare vorher/nachher aus dem
Ausgabe-Pfad; Zahlen je Fall (Höhe über Gesetz, Tempo je Frame, Impuls vor/nach). Wände: `gate:fahr-leben`, `gate:vehicle-drive`
um die drei Täter erweitert (headless, wo es trägt), `gate:kampf-gefuehl` nicht schlechter, `npm run check`, playtest:fast, voller
playtest. Kerne (vehicle-core.js) nur unter Byte-Beweis (v3-Golden: ein Re-Mint ist ein begründeter Vertrags-Akt im Commit).
**Handwerk:** wie 0710-1 (node --check, eslint 0, prettier --check, NIE git stash, Regex nur per Edit-Werkzeug, Commits deutsch
ohne Siegel-Wörter mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, Push `welle-m-fahren`, CI lesen, keine Chips).
**Bericht:** `bericht/0710-2-fahren-2.md` — je Klasse Geschnitten · Gemessen · offen; Kopf; Konflikte mit integ-l-Folgearbeit
(wasser-Stufe ändert `_waterRunSurfaceAt`-Leser des Fahrens → `_koerperWasser`).
