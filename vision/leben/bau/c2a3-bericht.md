# C2a3, Bericht (19.11.) — Kopf `leben-erbe` 8d6e5a9f1250a7bd496822387892c98d05785f94 (zwei Commits auf bcdcc4f1: c4e44f3b37 Stufe 2, 8d6e5a9f12 Zusatz Lese-Naht)

Stufe 3 EPOCHE und Stufe 4 STAND sind NICHT begonnen. Der Spieler sieht von dieser Stufe nichts.

## Befund: die Prämisse von D2 trägt nicht — zum dritten Mal

Das Kosten-Wachstum liegt weder am Zustand des Gaus („etwas sammelt sich“, gefallen bei C2a2) noch am Code-Zustand (Ausfälle aus dem
optimierten Code, diese Stufe). Windows verlegt den Prozess nach etwa 3 s Laufzeit von einem Zen-5-Kern auf einen Zen-5c-Kern.
- Ungebunden springt der Schritt von ~45 auf ~110–180 ms im selben Moment, in dem eine reine Rechen-Schleife ohne Speicher von 24 auf
  37–41 ms springt; am Sprung kein Ausfall, kein großer GC.
- 4 s Leerlauf nach Jahr 20 → schon Jahr 21 ist langsam (132–155 statt 43–47 ms).
- An einen Zen-5-Kern gebunden bleibt der Schritt bis Jahr 60 bei 40–60 ms; an einen Zen-5c-Kern gebunden ab Jahr 4 bei 90–190 ms.
- Der Schritt ist Speicher-gebunden: der Zen-5c-Kern ist in der Rechen-Schleife 1,5-mal langsamer, im Schritt 2,3- bis 3-mal.

## Stufe 2 KOSTEN — Soll ↔ Ist (Zen-5-Kern gebunden, drei Läufe, Median je Jahres-Schritt)

| Soll | Ist | Urteil |
|---|---|---|
| K1 Jahr 100 und 1 000 innerhalb ± 15 % von Jahr 5 | Jahr 5 52,4–65,8 ms · Jahr 100 70,1–78,4 (+19 … +35 %) · Jahr 1 000 71,6–83,6 (+23 … +57 %); Köpfe +17 % · +26 % | ROT, gefallen mit Grund |
| K1b neuer Gau im alten Prozess ± 15 % | 40,5–52,2 gegen 52,4–65,8 ms (−2 · −25 · −23 %): kein Aufschlag | ROT wörtlich (das Jahr 5 des frischen Prozesses übersetzt noch) |
| K2 G1 zahlengleich, Stand `eab4d269`, Abdruck 0 | Wolf 27 42 43 39 53 59 67 52 56 58 · Σ K 33 989 · `eab4d269` · 0 Dinge anders | GRÜN |
| K3 `nachbarn` ≤ 2 Ausfälle | 27 → 1 (`leben-core.js:499`) | GRÜN |
| K3 `schritt`-Phasen zusammen ≤ 2 | 17 → 13 | ROT (selten begangene Wege, die nach der Übersetzung zum ersten Mal laufen; die Zahl schwankt mit dem Zeitpunkt) |

Der Phasen-Schnitt senkt die Kosten nicht messbar. Die Kosten folgen den Köpfen; der Rest über dem Kopf-Zuwachs liegt in der Streuung
(ein zweiter Arbeiter rechnete auf demselben Gerät).

Geschnitten: `schritt` in acht Phasen-Funktionen mit EINER Kopf-Form, getyptem Rudel-Ring (`fRiss`/`fErh` Float64Array), flacher
Nachbar-Karte; der gepackte Stand bleibt v 1 byte-gleich.

## Zusatz Lese-Naht (additiv, § 5 in `naht-c2b.md`)

- `reviere[].K = { beute: Zahl, jaeger: null }` — `leben-core.js:1368` `tragAm`, `voxel-worker.js:618`.
- `tode = [{ id, g, revier, takt, ursache, jaeger }]` — `leben-core.js:1387` `todeSeit`, `:1379` `todeMerken`, `voxel-worker.js:628`;
  Ursachen jagd · hunger · alter · welpe · deckung; `z.ereignis.tod[].von` — `leben-core.js:793`.
- Gemessen: 3 691 Tode in 20 Takten, Köpfe + Geburten − Tode geht auf (14 500), 708 von 708 Rissen nennen ihr Rudel, K nach dem Laden
  2 304 von 2 304 gleich. Die Liste reist nicht im Stand.
- Setzungen: `jaeger` beim Riss = Verband des Rudels („r“ + Kennung) · `tode` hält höchstens das letzte Jahr und nur gelesene Reviere ·
  `K` = Tragfähigkeit am Stand ohne Zerfall (weicht vom K des nächsten Schritts um ≤ 1,16 Köpfe ab).

## Funde

1. Die Probe `gau` steht nicht in `scripts/lib/kreatur-proben.cjs` (`PROBEN` :2747), G1–G5 urteilen in
   `scripts/diag-kreatur-leben.cjs --gau` (:2438). Keine Linsen-Zeile dieser Stufe gebaut.
2. Die Wurzel der Kosten ist der Kopf als Objekt-Graph (~10 MB heiße Daten je Durchlauf, drei Durchläufe je Takt). Der Schnitt dort
   sind getypte Spalten je Kopf. Dagegen steht: `diag-kreatur-leben.cjs` liest `z.beute[i][k]` als schlichte Objekte, spleißt direkt
   und rechnet über `K.klon` weiter (:2550–2650).
3. Ep2 hängt an der Kern-Klasse: im Faden 57–66 ms je Jahr (80 Jahre ≈ 4,6–5,3 s), auf einem Zen-5c-Kern 95–122 ms (≈ 8–10 s).
   Aufholen 100 Jahre 5,72 s (Vorgänger 10,99 s), 1 000 Jahre 59,6 s (154,6 s) — andere Geräte-Lage, nicht dem Schnitt zuzuschreiben.

Ungemessen: Ep1–Ep4, St1–St4 · K1 im Chrome-Faden (der Browser bindet nicht) · volles `gate:kreatur-leben`, `gate:kreatur-takt`,
`stamm:lint`. Gelaufen: `--gau` Exit 0, `playtest:fast` 21 ✅ · 0 ❌, `check:statik` grün.

## Entscheid D5 des Koordinators (19.11., nach diesem Bericht)

- K1, K1b, K3-Phasen stehen gefallen mit Grund; kein Soll wird bewegt. Der Phasen-Schnitt bleibt (byte-gleich, `nachbarn` 27 → 1).
- **Mess-Gesetz der Leben-Kosten:** an EINEN Kern gebunden, BEIDE Kern-Klassen als Zahl, geurteilt wird an der LANGSAMEN Klasse —
  dorthin legt Windows den Faden, und ein Standardgerät hat womöglich nur sie.
- **Reihenfolge:** erst EPOCHE und STAND (Stufe 3 und 4, Soll unverändert aus dem Entscheid D3/D4), dann der Spike „getypte Spalten je
  Kopf“ an EINER Phase. Soll des Spikes, vor der Rechnung: Kosten je Takt an der langsamen Kern-Klasse ≥ 2-mal kleiner, Stand
  byte-gleich `eab4d269`; reißt es, fällt der Kandidat und die Wurzel wird neu gelesen. Meine Vorhersage: 1,6- bis 2,4-mal.
- Ep2 (Aufholen ≤ 4 s) urteilt an der langsamen Klasse; heute stünde es dort bei 8–10 s. Das ist benannt, bevor Stufe 3 gebaut ist.
- **Datei-Besitz der Linse:** der Block `--gau` in `scripts/diag-kreatur-leben.cjs` (ab :2438 bis zum Ende seiner Funktion) gehört
  dem Kern-Schneider; alles andere in der Datei dem Leser-Schneider.
