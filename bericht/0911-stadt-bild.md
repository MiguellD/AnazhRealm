# 0911 — bild:stadt* über dem Proben-Deckel (w27-stadt-bild, GTX 1050, Stand da0e790f)

Zeiten auf der GTX 1050 sind Vergleich, nie Urteil.

## Geschnitten (Zweig `w27-stadt-bild`, Commit 436bdf73 auf da0e790f, Probe und Spec)

- **Täter 1 beim Namen: `scripts/werkbank.cjs:1090`** (`umstellen`, die Gründung). Nach „dorf 7 120“ schlief die Probe je 250 ms unter
  `__deckel`, bis die Zelle am Anker der Spec stand (±1 mm). Der Takt ruht in dieser Schleife (`weltTakt` blieb 3), `leib` und
  `horizont` bleiben offen, der Deckel zählt keinen Gang und wirft erst nach 3600 stillen Gängen (~900 s). Die Stadt stand 5,3 mm
  (stadt) bzw. 1,8 mm (stadt-voll) neben dem Anker. Die Bereit-Bedingung kam nie, jeder Läufer hing bis zum Proben-Deckel.
- Schnitt: die Probe wartet auf die EINE Flagge des Akts (`_dorfImFlug`) und urteilt danach laut mit den Zellen. Die Anker von stadt und
  stadt-voll stehen auf der Welt von da0e790f. `gate:betriebsgesetz` GRÜN (scripts −26 Atome).

| Phase (bild:stadt@0.5, GTX 1050) | vorher | Linse (alter Anker) | nachher |
|---|---|---|---|
| Werkbank bereit | 20 s | 10 s | 16 s |
| umstellen (Gründung + Ring + Welt steht) | > 177 s ohne Urteil (abgebrochen; CI 552–616 s am Deckel) | ROT nach 54 s: „5,3 mm daneben“ | Exit 0 nach 285 s (2971 Takte, 90 Chunks); Abgabe-Stand 436bdf73: 283 s |
| Kamera des Spiels | nie | — | erreicht (t+302 s) |
| bild | — | — | ABNAHME ROT nach 3 s (siehe unten) |

stadt-voll: Linse ROT nach 72 s („1,8 mm daneben“), nachher umstellen Exit 0 nach 353 s (3968 Takte), Kamera des Spiels erreicht.

## Ehrlich offen (die nächsten Täter, jetzt sichtbar, weil die Probe bis zur Kamera kommt)

1. **stadt-voll, Spiel-Code: doppelte Uniform `karteNadel` im WGSL.** `bild` bricht nach 120 s: „ERST-ZEICHNUNG OFFEN … PIPELINE-ABSAGE
   renderPipeline_MeshStandardNodeMaterial_171“. Die GPU-Wache nennt: `redeclaration of 'karteNadelStruct'`: `array<vec4<f32>, 32>` und
   `array<vec4<f32>, 64>` in EINEM Programm (zweimal reproduziert). Wurzel: `stamm/stoff-karte.js:1679–1694` (`_karteNadel`). Wächst der
   Karten-Atlas über 32 Schichten, legt er eine NEUE `uniformArray` mit demselben Namen an und setzt `at.mat.needsUpdate`. Die Albedo
   der Karte hält den alten Knoten fest (`stamm/stoff-material.js:1260/1263`, eager beim Stoff-Bau), das Laub-Licht holt bei jedem
   Programm-Bau den neuen (`stamm/stoff-instanz.js` `_laubLichtStoff`, `setupLightingModel` → `nadel()`). Folge: Die Karte der vollen
   Stadt zeichnet nie, und die Schichten ab 32 lesen Nadel und Jahr aus der alten Reihe. Der Schnitt gehört in den Stamm (die Reihe
   wächst an DEMSELBEN Knoten, oder beide Leser lesen sie faul), mit Stamm-Lint, `?v=` und Bild, also nicht in diese Abgabe.
2. **stadt, Bild-Urteil: Vordergrund 26,4 % unter 8 m (bauSatz).** Das ist an der Pose der Spec (spieler 609,1/419, Ego) in zwei Läufen
   gleich. Der Spieler steht in der Hauptgasse an einer Fachwerkwand. In einem Lauf verdeckte zusätzlich ein Wagen des Verkehrs
   (`fahrzeug_kompakt_fwd`, 19 m) das Blickziel. Ob die Pose oder die Vordergrund-Regel der Abnahme für eine Gasse weicht, ist ein
   Entscheid. Gemessen ist er nicht.
3. **bild:dorf reißt den Deckel nicht:** In allen Proben-Posts steht es GRÜN (57–244 s, GTX 1050 und OMEN). Der Auftrag nannte es mit.
4. Welcher Commit die Ort-Wahl um 5,3 mm verschob (seit e83c8a42, 05.11.), ist nicht gesucht.

Bilder (Schirm des Spiels nach 1 s Loop, `werkbank schirm`, OHNE Abnahme): `schirm-stadt.png` (Gasse an der Wand),
`schirm-stadt-voll.png` (Markt, Gedränge, ein Wagen auf der Gasse). Vorher gibt es kein Bild: Die Probe kam nie bis zur Kamera.

## Nachtrag Koordinator (09.11. 21:25)

`w26-stadt-takt-4b` (z351) heilt denselben Täter an der Wurzel: Die Gründung geschieht am Ort des Ankers (`spawnSettlement` mit
`position`), denn die 5,3 mm kamen vom Bildwinkel des Windows-Fensters (`_siedlungsAnker`, fov × Seitenverhältnis). Dazu zählt der
Deckel jeden Gang (120 × 250 ms). `w27-stadt-bild` verschiebt dagegen die Anker-Zahlen auf die Welt von da0e790f (fensterabhängig).
Der Befund bestätigt den Täter unabhängig, der Zweig fährt nicht (zug/abgeloest.txt). Die PNGs folgen, sobald die GTX 1050 angemeldet ist.
