# w8-ein-baecker — pipeline.K2#1 und K2#2: EIN Bäcker der Karte

**Stationen** (`meisterkarte-quelle/punkte/stationen/g4.js`, EINE Fahrt `karteBaecker`, Zwillinge, headless auf swiftshader):
das Labor der Bäume (`worlds/terrain`, three r128) öffnet als Tor über der Welt, sein Wald pflanzt die Gestalten der Welt und
fragt jede Karte über das Tor (`karte-bitte` → `_karteAbzug`); gelesen werden die Bytes, die seine Fernstufe zeichnet (je Zelle
Albedo und Normale der Schicht). Danach backt der Bäcker der Welt (`_karteWeltBacken`, r184) jede Art mit Karte des Buchs (KIND_POLICY
impostor und eine Karten-Stufe im Budget) je Gestalt 1..T selbst, die Probe liest die Schicht nach dem letzten Ring (Albedo und
Normale im selben Zug). Staffel 1 urteilt die erste Zelle des Labors, Staffel 2 jede Art: sha1 und Länge je Zelle, der Art-Hash
über die Zell-Hashes der Welt.

| | main 2d2a5f1 (zwei Bäcker) | w8-ein-baecker f0be107 |
|---|---|---|
| K2#1 eiche, erste Zelle | `bakeImpostorAtlas` r128 128×256 ≠ `_karteWeltBacken` r184 | a9218749cd = a9218749cd, 3 670 016 B |
| K2#2 Arten mit Karte byte-gleich | ROT (die Welt kennt `karte-bitte` nicht; das Labor backt selbst, sechs Arten, Zufalls-Samen) | **10 / 10** |
| Zellen (Art × Gestalt) | — | 20 / 20, je 3,5 MB (128×3584 Albedo + Normale) |
| Bake derselben Zelle zweimal | 128 581 Albedo-Bytes auseinander (Saison-Drift) | 0 |
| Nässe 1 + Winter-Tönung | 320 085 Albedo-Bytes bewegt | 0 |

Je Art (Welt = Labor): eiche ×3 8026d999 · fichte ×3 9ffd36e9 · birke ×3 9498101b · tanne ×3 dfbe9457 · buche ×3 cb995d5f · weide
24a7d4a4 · mammut e9deb4b9 · strauch 3c505c65 · karst 6dfc1f2d · totholz 68570b57.

Mutanten: ein zweiter Bäcker mit anderer Auflösung (r128, 128×256 je Ansicht), eine Art, die anders backt (die Fichte, beim Namen),
eine Karten-Art der Welt, die im Labor-Wald fehlt (beim Namen), die Welt backt nie; für Staffel 1 zwei Bäcker mit gleichen Maßen
und anderen Bytes — jede ROT. `punkte.cjs selbsttest --ohne 3c` 131/131; `liste` 261 Stationen, fehlt 26, Fehler 2 (gelaende.K2#1/#2,
`window.__zielen` am Kopf ungesetzt — fremd, vor diesem Zweig schon). Die Station braucht den Spiel-Zweig: `_karteAbzug`,
`_labHeimat`, `_karteLabor` leben nur in `w8-ein-baecker`; an main ist sie ROT (die Welt kennt `karte-bitte` nicht).

**Der Schnitt im Spiel** (Zweig `w8-ein-baecker`): der Studio-Bäcker `bakeImpostorAtlas` (foundry-bruecke.js, r128) fällt ganz.
Gesetz ist der Welt-Bäcker: vier Hebungs-Ringe, Albedo vor dem Licht, oktaedrische Normale mit Tiefe je Texel, die Sonnen-Sicht der
Krone — der r128-Bäcker trug einen Ring aus Halbkugel-Licht. Die Welt beantwortet `karte-bitte` (netz-portal.js) mit `_karteAbzug`
(stoff-karte.js), das Labor legt die Schichten Byte für Byte in ein Array und liest den Ring 0° mit oktaedrischer Normale; ohne Tor
sagt es laut, dass es keine Fernstufe trägt. `_loopRuht` kennt das Tor (der Foundry-Wächter hielt bei offenem Tor jede Antwort), die
Karte backt Golden-Sommer und trocken (`uSeasonMul`, `naesse` still). Linse: gate:constitution G3 (Brücke und Labor), ROT am Täter.
