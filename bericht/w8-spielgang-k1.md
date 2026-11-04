# w8-spielgang-k1 — der Spielgang aus der Spur (spielgang.K1#1, headless, 03.11.)

Spiel-Zweig `w8-spielgang-k1` (von main 8e6262cc), pm-Zweig `w8-spielgang-k1-pm` (von punkte-maschine ed2d02b), Station
`meisterkarte-quelle/punkte/stationen/g5.js` (`spielgangLauf`, `spielgangSchritte`, die Aufnahme `spurAufnahme`).

**Geschnitten:** `stamm/dirigent-takt.js:1146` DIE SPUR — die Aufnahme am Rand des Geräts (`_spurNimm`: Capture-Hörer auf window für
Taste, Zeiger, Rad, Feld, Fokus, Zeiger-Fang, nur isTrusted; `_spurPadNimm`: das Gamepad, wie `_eingabeTakt` es liest), gestempelt mit
dem Sim-Schritt seit der Kontrolle, und der Abspieler (`_spurTakt`, `_spurWirf`), der jede Zeile an ihr Ziel in DIESELBEN Hörer wirft
und für Zeiger-Fang und Gamepad als Gerät einsteht — am Kopf jedes Takts vor `_eingabeTakt` (`:30`) und jedes Sim-Schritts vor dem
Sammler (`:915`); `stamm/dirigent-ankunft.js:479` legt sie vor jedem Hörer der Seite an. Kein zweiter Eingabe-Pfad, kein Flag im
Spiel: `?spur=aufnahme` nimmt auf, `?spur=<pfad>` spielt ab. Die Spur `spec/spielgang/k1-spur.json`: 93 Eingaben über 705 Schritte
(Tasten, Maus, Rad, Gamepad-Stick, Feld), Marken ankommen · laufen · bauen · ki · benutzen.

**Gemessen** (headless, Null-Renderer, cloud; die Station wörtlich, 17 s je Lauf):

| Schritt | main 8e6262cc | w8-spielgang-k1 4b3fe46a |
|---|---|---|
| Lauf | ROT: kein Abspieler im Spiel (`?spur=` liest niemand) | GRÜN 5/5, 1× geladen, 93 Eingaben, 0 ohne Ziel |
| ankommen | — | Kontrolle 941–1 014 ms, der erste Klick fängt den Zeiger |
| laufen und sehen | — | 12,81 m, Blick 141° (Maus 300 px + rechter Stick), Sicht first→third→first |
| bauen | — | bank_sitzbank steht über die Werkstatt (Schöpfer über die Karte der Einstellungen), 8 Eingaben |
| mit der KI erschaffen | — | „bau ein haus" → 1 Studio-Werk haus_alemannisch (spawn_studio, Grundstufe ohne Schlüssel) |
| benutzen | — | der Leib sitzt auf der gebauten Bank (E) |

Zwei Läufe am Zweig: 12,81 m und 141° gleich (die Taste trifft denselben Sim-Schritt). Mutanten: 15 Proben, je Klausel ROT beim
Namen (Kontrolle, Zeiger, Weg, Blick, Sicht, Werk, Satz, Sitzen, ungemessener Schritt, Neuladen, Eingabe ohne Ziel, Spur ohne
Ende, zwei Schritte, kein Baum). `punkte.cjs selbsttest --ohne 3c` GRÜN 131/131; `liste --kopf w8-spielgang-k1` Fehler 2, beide
fremd (unten); am main zusätzlich `spec/spielgang/k1-spur.json` (trägt erst der Spiel-Zweig). Spiel-Zweig: `npm run check` EXIT 0
(betriebsgesetz: Prüf +1 208 / Spiel +2 863 Atome, scripts/ 0), `npm run playtest:fast` 21 ✅ 0 ❌, `diag-takt` GRÜN, `diag-weltgrenze`
12/12 Wege 0 Felder. Die Station braucht `spec/spielgang/k1-spur.json`, die nur der Spiel-Zweig trägt: den pm-Zweig erst nach der Landung mergen.

**Ehrlich offen:** die Ankunft-Zahl ist headless die Kontrolle am Null-Renderer, nie das Kalt-Band der Karte (Ankunft K1 misst die
GPU); teilen (Tore K5) trägt die Spur nicht; der Pad-Blick integriert je Bild mit der Bild-Zeit (`_eingabeTakt`), darum trifft der
Stick die Gier nur auf ~1° gleich, jede Taste und jeder Maus-Weg trifft den Schritt; die Uhr gibt die Station dem Null-Renderer von Hand
(`__handTakt`, er tickt nicht selbst) — sie stellt nichts an der Welt.

## FUND

- `meisterkarte-quelle/punkte/stationen/proben-welt.cjs:790` · gelaende.K2#1/#2 rufen `window.__zielen`, das am Kopf niemand setzt
  (Wand HAKEN, schon am pm-Grund ed2d02b) · `liste` Fehler 2 · klein (der Haken lebt auf einem ungelandeten Spiel-Zweig).
- `stamm/dirigent-takt.js:1073` · `replayRun`/`startReplayRecording` (Chat „replay record") nehmen die gesammelte Verb-Tafel auf, nie
  die Eingabe — der Beweis der Schritt-Funktion (playtest dirigent, diag-tier-gang), kein Spieler-Gang; sein Chat-Weg ist Konsole ·
  spielgang.K1 · klein.
