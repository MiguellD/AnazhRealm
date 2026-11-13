# 27 Studios koerperstudio und tetrapoda — die letzten Leib-Labore auf r128 mit eigenem Stoff, Licht und Composer

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Im Spiel, Dorf, Mittag: `scratchpad/genom-spiel/eng-rot.png` — zwei Bewohner von hinten und von der Seite. Das rote und das weiße
  Hemd stehen wie Ballons über Schulter und Rücken, an Achsel und Flanke zerfetzt (weiße Zacken, durch die man die Haut sieht). Die Haut
  ist matt-braun, das Haar ein kurzer brauner Kamm. Licht flach, kein Saum an der Haut, kein Glanz im Haar. Der Boden ist ein brauner Teppich.
- Am grauen Platz (Bühne/Guss, nicht Dorf): `scratchpad/genom/a-heute/zwoelf-kleid.png` — zwölf Menschen vorn und seitlich: Hemd und
  Hose liegen eng am Leib, Schuhe als glatte Klötze, Haar teils lockig-weiß, teils glatt. Dieselbe Prägung trägt im Dorf den Ballon —
  der Ballon kommt aus der Welt-Kette des Kleids, nicht aus dem Guss (Abgrenzung zu `w28-leib-nah`, GTX 1050).
- Das Labor selbst (koerperstudio/tetrapoda im Fenster): kein Bild gesehen. Aus der Quelle: schwarzer Grund `0x080808`
  (koerperstudio.js:81), Vier-Licht-Rig mit blauem Rim `0x33aaff` 2,0 (:253), Bloom + FXAA + Cine-Pass mit Kanten-Schärfung und Vignette
  (:254–255). Das Labor zeigt den Leib im Studio-Licht; der Spieler sieht ihn im Dorf nie so.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Geometrie ist schon EINE Quelle (Labor = Welt):
- koerperstudio gießt über `BAKERS_BY_KIND.koerper(KC,'mensch',0,lod,ov)` (koerperstudio.js:165), tetrapoda über
  `BAKERS_BY_KIND.kreatur(...)` (tetrapoda.js:119) — derselbe Bäcker wie der Ofen der Welt. Gefallen sind 332 645 △ Labor-Mensch und
  1,3 M Strähnen-Tier (Kommentare koerperstudio.js:89–97, tetrapoda.js:51–58).
- tetrapoda geht mit der Pose der Welt: `K.tierPose(wirt,leib,tierBaum,...)` (tetrapoda.js:38), dieselbe Funktion wie stamm
  `_animateTierBaum` (stamm/koerper-leib.js:2315).

Drei Zwillinge stehen noch (alles, was das BILD macht):
1. **Stoff-Zwilling:** `laborStoff` (koerperstudio.js:110–153, tetrapoda.js:68–109) webt Haut-SSS, Klarlack, Kajiya-Kay-Haar, Fell-Rim,
   Sheen, microFur, Schalen-Locke und Atem als r128-GLSL über `onBeforeCompile`. Die Welt webt DIESELBEN Zahlen als TSL in
   stamm/studio-stoff.js:361–560 (FELL_SCHALE-Locke :404–471, Haar `_haarLichtModell` :504–524, Atem :552–556). Zwei Programme je Look,
   die Gleichheit hängt an Kommentaren („dieselbe Mathe", tetrapoda.js:82–83). Schon heute weicht die Mathe ab: Labor `snoise`
   (tetrapoda.js:64) gegen Welt `mx_noise` (studio-stoff.js:552).
2. **Licht/Engine-Zwilling:** `new THREE.WebGLRenderer` r128, ACES 1,0 bzw. 1,25 (koerperstudio.js:83, tetrapoda.js:186), eigene
   Hemisphäre + Key + Rim + Fill + Gold (tetrapoda.js:188), `EffectComposer` mit UnrealBloom 0,3/0,35, FXAA, Cine-Pass (Kanten ×0,55 bzw.
   ×2,0, Vignette, Korn) (koerperstudio.js:254–255, tetrapoda.js:191–192). Die Welt trägt keinen dieser Pässe.
3. **Pose-Zwilling (nur koerperstudio, außerhalb des Spiel-Modus):** eigenes PD-Rig mit 34 Federn (koerperstudio.js:3–6), Emotions-
   Verhalten aus `Math.random` (`emo.update`/`getBeh` :39–80, 41 Verhaltens-Zweige), Blick-Sakkaden (:290–300), Lid/Iris (:350–356),
   `_poseGuard` (:373 ff.) — im Takt `animate` (:305–358). Die Welt posiert den Menschen mit `leibRigPose` + Emotion als Daten-Delta
   (stamm/koerper-leib.js:921–924, „dieselbe Funktion setzt das Körper-Studio" — gilt nur im Spiel-Modus `playPose` :645–653).
   tetrapoda hat diesen Zwilling bereits gefällt (Kommentar tetrapoda.js:14–16).

Was schon bereitliegt: die EINE Bühne der Hülle (Zweig `w28-studio-welt` 6039dc13) zeichnet einen Leib über den Ofen der Welt —
`B.werk(w)` → `wirt._workshopOvenPreview(rec, preset, ov, lod)` (origin/w28-studio-seiten:worlds/huelle/huelle.js ~2520–2524), Engine
r184, Licht `welt-licht.js buehne` an der Uhr, Stoff der Welt. Der Kommentar dort nennt offen beim Namen: „kein Studio ruft `werk`
(… koerperstudio · tetrapoda zeichnen r128)" (huelle.js ~2121). Gemessen dort: fachwerk 97,9 → 8,3 %, portale 94,7 → 43,9 %.

Kosten heute: Neubau koerperstudio 4 253–6 468 ms gegen ≤ 1 000 ms (bericht/1113-kurs-B-meisterkarte.md:130, studios.K2). Ein Treiber
in der Quelle: jeder Neubau gießt zusätzlich je Fern-Stufe eine Wegwerf-Gestalt nur für die Kosten-Leiste (koerperstudio.js:245).

## Die EINE begrenzende Entscheidung
Die beiden Leib-Studios zeichnen auf der EINEN Bühne der Hülle (`AnazhHuelle.buehne` + `B.werk`); `laborStoff`, Composer, eigenes
Licht und r128 fallen in beiden in derselben Welle, und das PD-Rig des koerperstudio fällt mit — die Ruhe-Pose ist `leibRigPose` mit
der Emotion als Daten-Delta, wie die Welt. Kein Labor-Look bleibt, den die Welt nicht trägt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen (beide Studios, eine Welle):
1. Engine + Licht: `WebGLRenderer`/ACES/Lichter/Boden-Canvas/Kontakt-Scheibe raus → `AnazhHuelle.buehne({...})` wie garage und schmiede
   auf `w28-studio-welt` (koerperstudio.js:81–85, 249–256; tetrapoda.js:185–192).
2. Stoff: `laborStoff`, `GLSL_RAUSCHEN`, `gf/gv`, `WEBE`-Lesung im Labor löschen (koerperstudio.js:102–153; tetrapoda.js:59–109). Der
   Leib kommt aus `B.werk({preset, seed:0, ov})` im Stoff der Welt (TSL).
3. Guss: `stufeAnlegen`/`gelenkBaum`/`stufeSchalten` beider Seiten durch die Gestalt des Ofens ersetzen (`_buildHumanGroup` /
   `_buildCreatureGroup` tragen beide Stufen und den Wurf-Zwilling, huelle.js ~2515). Fern-Wegwerf-Guss (koerperstudio.js:245) fällt.
4. Pose: koerperstudio PD-Rig, `emo.update/getBeh`, Gaze, `_poseGuard` (:3–80, :284–434) fallen; Ruhe = `KC.leibRigPose(r, t, 0, false,
   gait0, KC.MOTION[emo], KC.MOTION.idle, ...)` — die Emotions-Knöpfe wählen das MOTION-Profil, die Welt-Funktion pos iert.
   Spiel-Modus `playTakt` (:688) und Park bleiben (sie fahren schon Welt-Gesetz). tetrapoda: `gangTakt` (:30) bleibt, nur der Leib wechselt.
5. Tuch: `tuchAnlegen/tuchTakt` (:188–200) auf den Ofen-Leib zeigen — derselbe Löser wie die Welt `_tuchTakt`.
Leser-Liste (wer liest, was sich ändert):
- scripts/diag-studio-huelle.cjs:67 `OFEN_STUDIOS`, :77 `ENGINE_RATSCHE` koerperstudio/tetrapoda „r128" → r184 (Ratsche zieht nur an, das
  Soll bleibt), :338–345 (H4/H8 lesen die Kosten-Leiste).
- scripts/lib/albedo-tafel.cjs:68–79 (`ausgabe: "composer"` beider Studios — der Composer fällt, die Ausgabe wird die der Bühne).
- scripts/diag-tier-gang.cjs:647–648 (Globale `enterPlay`, `playTakt`, `parkTeile`, `wolf`, `emo` müssen weiter stehen).
- spec/studios/k4.json auf `w28-studio-seiten` („ungemessen: das Werk ist eine Prägung / ein Wesen") — die Station misst sie danach.
- Brücke `werk()` beider Seiten (koerperstudio.js:962, tetrapoda.js:253) bleibt Übergabe-Kanal; Matrix-Tafel (tetrapoda.js:200) liest `tierBaum`.
Kosten-Zeile: Neubau koerperstudio 4 253–6 468 ms (Ist) darf nicht steigen; erwartet sinkt er (Fern-Wegwerf-Guss fällt, Ofen-Memo der Welt).
  Bild der Ankunft unberührt (keine Welt-Datei ändert sich außer ggf. einem Export aus stamm/werkstatt-vorschau.js:943).
Kriterien der Meisterkarte:
- `studios.K4` „Studio = Welt im Bild": Ist 0 P, koerperstudio/tetrapoda ungemessen ↔ Soll 0,021 (spec/studios/k4.json), Station
  `stationen/k4-bild.cjs` (koordination), alle vier Zeilen heute UNGEMESSEN (stand.json:3994–4038).
- `studios.K2` Griff → Bild ohne Warten: #2 ungemessen; Neubau koerperstudio ↔ ≤ 1 000 ms (kurs-B:130).
Bildpaar an fester Kamera: koerperstudio START_PARAMS frontal + seitlich, tetrapoda wolf seitlich, Uhr Mittag, vorher Labor ↔ nachher
Bühne, daneben derselbe Leib im Dorf (Rezept `bildpaar-im-spiel-rezept.md`).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-studio-welt` 6039dc13 (abgegeben, Code-Check ROT: Stall-Akte `scripts/diag-blick.cjs` + Mehrspieler-Wand) — die Bühne, garage und
  schmiede darauf.
- `w28-studio-seiten` ad504fbe (WIP, Notbremse, ungeprüft): `werk` zeichnet den Leib über den Ofen; portale umgezogen; der Commit
  d3cfd4d1 nennt „ALS NÄCHSTES: … tetrapoda umziehen" — koerperstudio steht dort nicht; keine der beiden Seiten ist berührt
  (diff --stat: worlds/koerperstudio und worlds/tetrapoda fehlen).
- Fehlt: Stufen 1–5 oben in beiden Seiten, die Leser-Liste nachziehen, K4 an den beiden Seiten messen, Bildpaar.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gelesen: worlds/koerperstudio/index.html, worlds/tetrapoda/index.html, koerperstudio.js :370–470 und :700–923 (Park, Instrument,
  Kamera), `_workshopOvenPreview` (stamm/werkstatt-vorschau.js:943) im Ganzen, die Bilder `probe-post/w28-leib-nah/7–13`.
- Nicht gemessen: K4 beider Leib-Studios (es gibt keine Zahl); ob der Ofen-Leib auf der Bühne Lider/Iris als Gelenke trägt, die die
  Welt-Pose bewegt (koerperstudio bewegt sie heute selbst, :355–356) — fehlen sie, verliert das Labor das Blinzeln, das die Welt auch nicht hat.
- Widerspruch: stamm/koerper-leib.js:921–922 sagt „dieselbe Funktion setzt das Körper-Studio" — wahr nur im Spiel-Modus; die Ruhe-Pose
  des Labors ist ein anderer Mensch (PD + Math.random).
- Der Ballon im Dorf (eng-rot.png) ist NICHT dieser Schnitt; er liegt bei `w28-leib-nah`. Dieser Schnitt macht das Labor ehrlich, damit
  das Kleid dort so stumpf oder so gut aussieht wie im Dorf.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 3 (das Labor zeigt den Spieler-Leib, K4 wird erstmals messbar, ~400 Zeilen Zwilling fallen; das Dorf selbst ändert sich nicht)
· Aufwand M (Vorlage garage/schmiede liegt, Bühne kann den Leib schon) · Risiko: das Labor wird sichtbar stumpfer (wie fachwerk 97,9 →
8,3 %), und das muss als Befund stehen bleiben — die Welt steigt zum Labor hinauf, nie umgekehrt.
