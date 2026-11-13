# 28 Die Hülle, die EINE Bühne, terrain, schmiede und die EINE Übersicht aller Studios

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `BILD/studio-welt/werk-kathedrale-L0-frueh.png`: das Kathedralen-Tor auf der EINEN Bühne (Zweig w28-studio-welt), vier Blicke.
  Der Boden ist eine flache Oliv-Fläche bis zum Horizont, darüber ein SCHWARZES Band statt Himmel. Der Stein ist großfleckig
  braun-beige, Fugen und Steinreihen sind nicht zu sehen. Das Gitter ist hell, der Schatten fällt hart und lang zur Seite.
- `BILD/studio-welt/werk-viktorianisch-L0-mittag.png`: das viktorianische Haus am Mittag, wieder schwarzer Himmel über olivem
  Boden. Das Dach zeigt eine feine Ziegel-Körnung, die Wände sind einheitlich rotbraun, Balken sind keine zu sehen. Die
  Veranda-Pfosten stehen, die Fenster sind kleine helle Flecken.
- `BILD/studio-welt/werk-gt-L0-spaet.png`: der GT am Abend, blau. Auf drei der vier Blicke sind keine Räder zu sehen, der Wagen
  scheint über dem Boden zu schweben, nur im vierten Blick steht ein dunkles Rad unter dem Heck. Der Himmel ist hier ein Verlauf.
- `BILD/studio-welt/heute-fachwerk-diff.png`: fast die ganze Fläche rot (Differenz Labor gegen Welt), nur Kanten-Splitter frei.
- Die Übersicht (`worlds/huelle/index.html` am Zweig w28-studio-seiten) habe ich nicht im Bild gesehen; der Autor nennt sie
  im Commit d3cfd4d1 „ungetestet“.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- main ec281422: `worlds/huelle/huelle.js` (2096 Zeilen) trägt Regler, Sitzung, Kosten-Leiste, Brücke, Panorama, Matrix, Kugel
  (Export 2071–2095), aber KEINE Bühne und KEINE Übersicht (Grep „uebersicht|Übersicht“: 0 Treffer).
- Engine je Studio-Seite an main: r128 aus `worlds/terrain/lib/three-r128.min.js` laden terrain (index.html:86), fachwerk (:91),
  koerperstudio (:46), tetrapoda (:35), portale (:41); garage und schmiede laden `vendor/three-bootstrap.js` (r184). Die Linse
  hält das als Ratsche: `scripts/diag-studio-huelle.cjs:77` `ENGINE_RATSCHE` = 5 Studios r128 + fluid r183 + translated r130.
- Eigene Lichter und Nachbearbeitung je Seite an main (Zählung per Regex): phytogenesis.js 4630 Z., 6 Lichter, Composer/Bloom 2;
  koerperstudio.js 3 Lichter, Composer 2; tetrapoda.js 5 Lichter, Composer 2; porta.js 4 Lichter, Composer 2; fachwerk.js
  4 Lichter. Jede Seite hat einen eigenen Renderer (je 1 Treffer). Das Gesetzbuch (Licht der Welt `welt-licht.js`, Stoff der
  Welt) reicht keine dieser fünf Seiten — sie zeichnen ihr eigenes Labor-Licht.
- DREI Listen nennen „die Studios“, keine kennt die andere:
  1. `stamm/speicher-welten.js:3666–4000` `WORLD_REGISTRY` (11 Portal-Welten, „die EINE Quelle, welche Sub-Welten es gibt“),
     ohne Kern-Feld.
  2. `cores.manifest.json:1–59` (9 Kerne: phyto, vehicle, porta, schmiede, fachwerk, klang, koerper, tetrapoda, gelaende), ohne
     Seiten-Feld.
  3. `scripts/diag-studio-huelle.cjs:61–62` Hand-Liste `STUDIOS` (8) + `NEBENWELTEN` (3).
  Dazu `worlds/tor-ziele.json` (10 Welten + 3 `ohne`), der Export der Panoramen, nicht eine Liste der Studios.
- Am Zweig w28-studio-seiten ad504fbe baut `studios(B)` (huelle.js ~2700–2740 am Zweig) eine VIERTE Liste: tor-ziele.json +
  Manifest + Stammbaum der Foundry, und verbindet Seite und Kern, indem es den HTML-Text jeder Seite nach Kern-Skripten durchsucht
  (Runden-Schleife „zuerst die eindeutigen“). Das ist Raten am Text: lädt eine Seite foundry-core.js mit (garage, koerperstudio),
  hängt die Zuordnung an der Reihenfolge. Das Gelände-Studio (`worlds/gelaende/studio.js:3`, `index.html?studio=gelaende`) steht
  in keiner der Listen und fehlt in der Übersicht ganz.
- `kopf()` am Zweig (~2770): die EINE Kopfzeile mit „◂ Studios“, Studio-Wahl, Früh·Mittag·Spät·Nackt, △ gegen Budget, Neubau ms.
  `studio(o)` (~2822): der EINE Zeichner (Werk über den Foundry-Faden der Welt, ihr Stoff, ihr Licht). Nutzer am Zweig: portale
  (`porta.js:84` `AnazhHuelle.studio`), garage und schmiede (`buehne` direkt, `garage.js:26`, `schmiede.js:18`). terrain,
  fachwerk, koerperstudio, tetrapoda bleiben r128 (`index.html` je Seite, Zweig-Grep).
- `uebersicht.js` am Zweig: EIN Renderer, je Kachel Viewport+Schere, malt nur bei Änderung (Kopf-Kommentar), Werke nacheinander
  auf EINEM Faden; je Kachel △ / Budget, Neubau ms und K4 aus `spec/studios/k4.json`.
- `spec/studios/k4.json` am Zweig ist eine Abschrift der Messung (Radeon, Stand 900c28e6, 13.11.): garage 27,2 %, portale 94,7 %,
  schmiede 52,8 %, fachwerk 97,9 %, terrain 99,8 % gegen Soll 2,1 %; koerperstudio und tetrapoda ungemessen.
- Meisterkarte (PM `stand.json:3899–4064`): studios.K1 2 P (152/152 Zeilen wirken, headless) · K2 1 P (Undo 8/8, K2#2 radeon/gtx
  ungemessen, Absturz Exit 3221226505) · K3 1 P (△ ±5 % in 7/7, K3#2 ungemessen) · K4 **0 P** (alle vier Stationen ungemessen) ·
  K5 2 P. Summe 6.

## Die EINE begrenzende Entscheidung
Ein Studio ist ein Gesetzbuch, also ist die EINE Liste der Studios `cores.manifest.json`: jeder Kern bekommt das Feld `seite`
(phyto → `worlds/terrain/index.html`, vehicle → garage, porta → portale, schmiede, fachwerk, klang, koerper → koerperstudio,
tetrapoda, gelaende → `index.html?studio=gelaende`). Die Übersicht, die Kopfzeile und die Linse lesen NUR diese Zeile; die
Text-Suche in `studios()` und die Hand-Liste `STUDIOS` sterben. `WORLD_REGISTRY` bleibt die Liste der Tore (Nebenwelten fluid,
skeleton, translated, schwarm, begegnung sind Welten, keine Studios, und stehen nicht in der Übersicht der Studios).

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Klasse: „eine Studio-Seite trägt ihre eigene Engine, ihr eigenes Licht und ihre eigene Liste“. Stufen in EINER Welle, auf
w28-studio-seiten ad504fbe:
1. Liste: `seite` je Kern in `cores.manifest.json`; `studios()` liest Manifest + Stammbaum (Name, Arten), ohne HTML-Abruf und ohne
   tor-ziele.json; Gelände wird Kachel. `diag-studio-huelle.cjs:61–62` liest `STUDIOS` aus dem Manifest.
2. Bühne: terrain, fachwerk, koerperstudio, tetrapoda auf `AnazhHuelle.studio` wie portale (porta.js:84); eigene Renderer,
   Lichter, Composer fallen (Zählung oben: 18 Lichter, 6 Composer-Treffer). `ENGINE_RATSCHE` (`diag-studio-huelle.cjs:77`) verliert
   die fünf r128-Einträge; `worlds/terrain/lib/` (11 Dateien, r128 + Addons) fällt mit, sobald `diag-albedo-tafel.cjs:401` auf die
   Engine der Welt zeigt (der letzte Leser außerhalb der Seiten; Kern-Kommentare `fachwerk-core.js:60`, `porta-core.js:36`,
   `schmiede-core.js:39` nur Text).
3. Himmel der Bühne: das schwarze Band über dem Horizont (Bilder oben) ist Teil derselben Klasse — die Bühne zeichnet den Himmel
   der Welt, sonst liest jede Seite schlechter als ihr Labor.
4. `spec/studios/k4.json` fällt als Abschrift; die Kachel nennt die K4-Zahl aus der Messung der Punkte-Maschine oder „ungemessen“.
Leser-Liste des Manifests (wer liest, was sich ändert): `stamm/studio-bruecke.js:325, 803` · `foundry-bruecke.js:305` ·
`scripts/lib/abnahme-urteil.cjs:1750` (Stand-Hash: Stationen werden „Konsum geändert“) · `scripts/lib/pack-kanon.cjs:36, 42` ·
`scripts/lib/kern-stufen.cjs:10` · `scripts/lib/asset-worker-harness.cjs:22` · `scripts/diag-studio-vertrag.cjs:35, 907` (prüft
id+scripts+vertrag, ein Zusatzfeld nicht gelesen) · `diag-fluss.cjs:46, 787` · `diag-atlas.cjs:287` · `diag-boot-stage.cjs:77` ·
`diag-regler-wirkt.cjs:82` · `diag-nervensystem.cjs:32`. Leser von `studios()`: `uebersicht.js` und `kopf()` am Zweig.
Kosten-Zeile: kein Weg der Ankunft lädt die Hülle oder die Übersicht; die Welt-Boot-Zeit bleibt unberührt. Die Übersicht kostet im
Stand 0 Bilder (malt nur bei Änderung); je Studio-Seite EIN r184-Renderer statt r128 + Composer.
Kriterien: studios.K4#1/#2 (radeon, gtx) Ist 0 P, an Stand 900c28e6 27,2–99,8 % ↔ Soll ≤ 2,1 % · studios.K2#2 und K3#2 (radeon,
gtx) ungemessen ↔ GRÜN · K1, K5 gehalten (dürfen nicht fallen). Station: Punkte-Maschine `stationen/k4-bild.cjs` (Zweig koordination).
Bildpaar: je Studio Labor ↔ Bühne an fester Pose, früh und mittag, dazu die Übersicht ganz.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-studio-welt` 6039dc13: Abgabe, GPU-Probe `gate:garage-labor` GRÜN (probe-post/w28-studio-welt/6039dc13.md, 82 s);
  Code-Check ROT (Stall-Akte in `scripts/diag-blick.cjs`, Mehrspieler-Wand — Ursache an main-Zweigen laut Übergabe offen).
- `w28-studio-seiten` ad504fbe (WIP, Notbremse, ungeprüft): +1610/−408 in 20 Dateien gegen main; Bühne, `studio()`, `kopf()`,
  `studios()`, `uebersicht.js`, portale umgezogen. Fehlt: Stufen 1–4 oben, H6 der Linse neu, Bildpaare auf der Radeon,
  tetrapoda/koerperstudio/fachwerk/terrain umziehen, Vorgabe-Licht („Streiflicht 15° zu rot“, Commit d3cfd4d1).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht gelesen: `worlds/terrain/phytogenesis.js`, `worlds/schmiede/schmiede.js` ganz (nur Kopf-Zählungen), `huelle.css`, die
  Bühne `buehne()` am Zweig jenseits der Zeilen ~2140–2300, die Station `k4-bild.cjs`, Bildpaare `sw/paar/` des Arbeiters.
- Ob `pack-kanon.cjs` den Manifest-Text in einen Golden-Stempel nimmt (dann zieht `seite` ein Re-Mint nach): nicht geprüft.
- `spec/asset-contract/v4/CONTRACT.md:66` nennt Node-Goldens auf r128 aus terrain/lib; in `scripts/` fand ich keinen solchen
  `require` — Widerspruch zwischen Text und Code, nicht aufgelöst.
- Übergabe §3: K4 am Fachwerk fiel 97,9 → 8,3 %, weil die Bühne so stumpf wurde wie die Welt — K4 allein belohnt Angleichung nach
  unten; die Bilder oben (schwarzer Himmel, Stein ohne Fuge) zeigen genau das. Die Seite „keine Seite schlechter als ihr Labor“
  hat kein Maß.
- Gelände als Kachel: ob `B.werk` ein Gelände-Werk bauen kann (der Kern ist `funktion: true`), nicht gelesen.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 3 (Werkzeug des Schöpfers; Ankunft unberührt, K4 0 → bis 2 P) · Aufwand L (vier Seiten umziehen, terrain 4630 Zeilen) ·
Risiko: die Manifest-Zeile macht über `abnahme-urteil.cjs:1750` viele Stationen „Konsum geändert“ — eine Messfahrt mehr, und das
Umziehen kann K1 (152/152 Zeilen am Bild) an terrain brechen, wenn ein Phyto-Dial keine Vertrags-Zeile ist.
