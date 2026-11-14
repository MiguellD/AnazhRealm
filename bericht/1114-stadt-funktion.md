# Stadt als Funktion über Vierteln — Spike (14.11., node, CPU, main cec92db1, nichts gelandet)

Gemessen auf dem Laptop in node v24, warm, ohne GPU. Andere Sitzungen liefen mit, deshalb streuen die Zeiten um ±40 %. Die Wand wurde nur im Kratz gehoben und wieder zurückgenommen; der Baum ist sauber.

## Der Pfad von „dorf 7 N“
`spawn_village` / Chat → `_dorfAkt` (stamm/siedlung-ort.js:1050) → `_foundryRequestSettlement` → Worker `exportSettlement` (fachwerk-core.js:8277: `DORF` 3640 → je Haus `massBauExport` 8215 → `teil`: `dorfLayout` 4510 · `reihenSnap` 8344 · `brandwand` · `brunnenWeicht` · `wandLaternen` 8353 → `hausSlot`). Danach folgt `_ortMitTrasse` (siedlung-ort.js:1814) mit bis zu `ORT_WAHL.trasseRunden` = 6 Runden. Jede Runde macht einen neuen Export mit Höhen-Raster und eine `_ortWahl`, also `ortPlan` 8672 mit `verkehrsNetz` 4088 im Ort-Faden. Dann kommen `_ortPlanSetzen` und `_spawnSettlementFromExport` (ein Schritt je Bild, `_bauFrei` je Slot).

## Teil A — Profil der Gründung (Samen 7; die Phasen im eigenen Zeitnehmer, gleiche Schritte wie `exportSettlement`)

| N verlangt | platziert | DORF | massBau (alle N) | dorfLayout | reihenSnap | brandwand | brunnenWeicht | **wandLaternen** | Export ganz (Profil) | ortPlan (eigener Scope) |
|---|---|---|---|---|---|---|---|---|---|---|
| 100 | 105 | 3 ms | 1 332 ms (87 %) | 94 | 3 | 6 | 62 | 39 (3 %) | 1,2–1,6 s | 1,4–1,6 s |
| 300 | 307 | 9 | 3 746 (73 %) | 389 | 18 | 30 | 484 | 474 (9 %) | 4,3–5,1 s | 8,6 s |
| 1000 | 392 | 13 | 14 244 (74 %) | 247 | 44 | 39 | 317 | **4 406 (23 %)** | 16,2–19,3 s | 1,4 s |
| 3000 | 392 | 18 | 30 622 (36 %) | 478 | 262 | 544 | 410 | **52 031 (62 %)** | 84–112 s | 2,6 s |

Wachstum über die verlangte Zahl N (Exponent je Stufe):
- `wandLaternen`: n^2,27 / n^1,85 / n^2,25, also **n²**. Das Gesetz dahinter ist Marken × N × N; die Marken sättigen bei ≈ 4 650, sobald das Netz voll ist.
- `massBau`: n^0,94 / n^1,11 / n^0,70, also **n¹ in N**. Gebaut wird für jedes verlangte Haus, auch für die 2 608 von 3 000, die keinen Platz bekommen.
- `reihenSnap` und `brandwand`: ab 1 000 n^1,6 bzw. n^2,4. Beide laufen auch über die geparkten Häuser.
- `dorfLayout`, `brunnenWeicht`, `ortPlan`: flach. Sie hängen am Netz, nicht an N.

Die fünf teuersten Funktionen (inklusiv) bei N = 1000 / 3000:
1. `massBauExport` 8215: 52,7 % / 24,3 %.
2. `wandLaternen` 7886 mit `fremd` 7900: 33,3 % / 67,2 %.
3. Darin `dachdeckung` 793: 12,4 % / –. Die Einzelziegel werden nur gebaut, damit die Box gemessen werden kann.
4. `fensterAt` 1068: 12,2 % / –.
5. `brunnenWeicht` 7971 und `dorfLayout` 4510: 1,7 % / 1,3 % bzw. ≤ 0,5 %.

`ortPlan` → `verkehrsNetz` → die Wende-Suche (4269, `nahe` 4283, `geht` 4288) liegt außerhalb des Exports. Sie macht 99 % von `ortPlan` aus.

**Der Täter für 171 s bei 281 Häusern:** `wandLaternen` → `fremd` (fachwerk-core.js:7900). Für jede dunkle Marke und für jedes der N Häuser als Kandidaten (Zeile 7951) prüft `fremd` alle `pl.length` = N Grundrisse. Die mit z = 9999 geparkten Häuser sind dabei mitgezählt, obwohl sie nie gewinnen können. Das ergibt Marken × N², bei 3000: 52–74 s für 287 Wandlaternen.
Mitschuldig ist `MASS_GEDAECHTNIS = 1024` (8213). Ab N > 1024 leert sich das Gedächtnis ständig, und jede der bis zu 6 Trassen-Runden zahlt den `massBau` aller N Häuser neu (30–45 s je Lauf). Unter 1024 kostet der zweite Lauf desselben Worts nur 252–290 ms (gemessen).
Entschärft im Kratz: ein 32-m-Raster in `fremd` plus eine untere Schranke je Kandidat. Der Export blieb **byte-gleich** (sha 2af1a8b4… / 703e77eb… / 26d293e8… bei 150 / 300 / 1000). `wandLaternen` fiel von 474 auf 57 ms (300), von 4 406 auf 96 ms (1000) und von 52 031 auf 258 ms (3000). Der Export bei 3000 sank von 84 s auf 46,5 s; der Rest ist `massBau` der unplatzierten Häuser.

## Teil B — der Spike (`stadt-funktion-spike.cjs`)

| Fall | Messung | Zahl |
|---|---|---|
| 1 Makro-Gesetz | `viertelImRadius`, R = 500 m, Kern: 10⁴ / 10⁵ / 10⁶ Häuser | 12 / 12 / 12 Viertel · 8,1 / 5,0 / 3,6 µs · 3,6 KB je Abfrage |
| 1 | R = 1500 m, Kern: 10⁴ / 10⁵ / 10⁶ | 44 / 44 / 44 Viertel · 22,9 / 15,0 / 15,0 µs · 13,5 KB |
| 1 | Rand, R = 1500 m: 10⁴ / 10⁵ / 10⁶ | 22 / 34 / 44 Viertel (Stadtrand schneidet) · 10,5 / 16,3 / 19,4 µs |
| 1 | Heap nach 10⁴ Abfragen · zustandslos · Tore einig · Σn gegen verlangt | 0 KB · ja · 1000/1000 · 9 465 / 100 142 / 999 166 zu 10⁴ / 10⁵ / 10⁶ |
| 2 Gründung eines Viertels heute | ≈150 Häuser (3 Samen), Export | 1,5–2,7 s (153–156 platziert); Ausreißer `dorf 631383 159`: 12,6–14,0 s, davon 58 % Dachdeckung im `massBau` (44 ms je Haus) |
| 2 | ≈300 Häuser (3 Samen), Export | 2,9–5,9 s (307–310 platziert) |
| 2 | `ortPlan` je 150er-Viertel (eigener Scope, LAGE_GRUND am Ursprung) | 3,8–5,5 s, 99 % in `verkehrsNetz` |
| 2 | nach der Entschärfung des Täters | auf Viertelgröße nicht messbar anders: Der Täter kostet bei 150–300 nur 0,04–0,47 s, das liegt im Rauschen |
| 2 Naht | 3 Nachbarpaare: Hauptstraßen am Tor-Punkt (≤ 15 m) | **0 von 3 Toren** getroffen, von keiner Seite |
| 2 | blinde Weg-Enden binnen 40 m der Kante | 4+4 · 3+5 · 2+4 (alle Enden an der Naht blind) |
| 2 | Häuser jenseits der eigenen Kante · Überlapp-Paare über die Naht | 0 / 19 / 6 · **0 / 0 / 0** |
| 3 Fern-Deskriptor | Blöcke · Bytes · Zeit je Viertel (aus `DORF`, keine Geometrie) | 23–24 Blöcke · 196–204 B · 0,5–1,9 ms |
| 3 | Häuserzahl gegen das gegründete Viertel (3 Samen) | 0,0 % · 0,0 % · 0,0 % |
| 3 | überbaute Fläche (W·D gegen obb der Hülle) | −44,0 % · −32,1 % · −29,3 % |
| 3 | mittlere Höhe (Geschosse gegen Geschosse · gegen First `ext.y1`) | 0,0 % · −43 / −22,5 / −28,3 % |

Gegenprobe zum Hauskosten-Hebel: Mit der Plan-Maske des Kerns (PLANNUR, `planBau`, ohne Dach, Fenster und Giebel) kostet ein Haus 3,1–4,6 ms statt 6,7–44,4 ms. Die Hülle `ext` weicht dann aber im Median um 0,26–0,32 m und höchstens um 1,47 m ab (Dachüberstand).

## Entscheidung
Der Schnitt sitzt an **`exportSettlement` (fachwerk-core.js:8277)**. Es gründet künftig genau EIN Viertel-Wort, und die Stadt ist die zustandslose Funktion `viertel(samen, ix, iz)` darüber.

- **Es bleibt:** `DORF`, `dorfLayout` und `ortPlan` als Gesetz EINES Viertels.
- **Es fällt:** `GROESSE_WAND` als Stadtgröße (sie wird zur Viertel-Kapazität ≈ 160), das Parken mit z = 9999 samt seinen n²-Läufen (`wandLaternen` und `fremd` über alle `pl`, `reihenSnap`, `brandwand`) und das `MASS_GEDAECHTNIS`-Gewitter. Ein Viertel verlangt nie mehr Häuser, als sein Netz trägt.
- **Neuer Eingang:** Die Tor-Punkte der Nachbarkanten werden Eingang von `dorfLayout`. Gemessen trifft heute 0 von 3 Hauptstraßen ihr Tor.

Erreichbar ist eine Gründung je Viertel, die von der Stadtgröße unabhängig ist:
- **heute:** Export 1,5–2,7 s plus `ortPlan` 3,8–5,5 s, also 5–8 s je 150er-Viertel;
- **mit Plan-Maske statt Mass-Bau:** Export ≈ 0,7–1,0 s, also 0,25–0,29 s Rest (gemessen am zweiten, gecachten Lauf) plus Häuser × 3,1–4,6 ms. Dann ist die Wende-Suche in `verkehrsNetz` mit 3,8–5,5 s der nächste Täter.

Die Fernstadt liest je Viertel 200 Byte in 1 ms. Ihre Fläche liegt aber 29–44 % zu klein, solange der Deskriptor W·D statt der Hülle liest.

## Ungemessen
- Die Zeiten im Spiel: Worker-Transfer des Plans, Zahl der Trassen-Runden je Wort, `_ortWahl` im echten Ort-Faden am echten Grund (meine `ortPlan`-Zahl stammt von LAGE_GRUND am Ursprung, im vm-Scope 3–5× langsamer), `_ortPlanSetzen` im Haupt-Faden, der Zug `_dorfZugSchritt` mit den Stempeln und die 47 Absagen von `_bauFrei`/Wasser bei 300.
- Ob eine analytische Hülle aus der Plan-Maske das Layout byte-gleich lässt.
- Die Naht mit Toren als Eingang von `dorfLayout` (nicht gebaut).
- Die Wende-Suche in `verkehrsNetz` als Komplexitäts-Gesetz (ihre Zeit hängt an den Sackgassen, nicht an N: 1,4 / 8,6 / 1,4 / 2,6 s).
- `massBau` mit Byte-Beweis bei 3000 (vorher kein sha).

Geschnitten: nichts gelandet; im Kratz `wandLaternen`/`fremd` (fachwerk-core.js:7900) mit Raster + Schranke entschärft, byte-gleich, Baum mit `git checkout -- .` zurück und sauber.
Gemessen: `wandLaternen` 52 031 → 258 ms bei N = 3000 (Export 84 → 46,5 s); Viertel-Abfrage 3,6–23 µs bei 10⁴–10⁶ Häusern gleich; ein 150er-Viertel 5–8 s heute, 0/3 Tore getroffen, 0 Überlapp-Paare, Fern-Deskriptor 200 B.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
