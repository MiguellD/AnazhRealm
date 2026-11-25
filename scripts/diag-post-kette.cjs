#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-post-kette.cjs — DIE POST-KETTE UND IHR DIREKTPFAD (gate:post-kette): der Direktpfad ohne Post-Kette (der
// Rückfall, wenn die Kette scheitert, und die Weiche der Zerleg-Linse) zeichnet mit Tiefe, die Godrays tasten nur mit Stärke.
//
// Die Wand fährt den ECHTEN Renderer des Spiels (WebGPU auf swiftshader, Holz `kienspan`) mit seinem echten Frame
// (`_loopRender`) an einer eigenen Bühne in der Welt-Szene: eine nahe rote Kiste vor einer fernen grünen, eine Wasser-
// Fläche mit dem echten Wasser-Stoff (er liest die EINE Szenen-Tiefe `_szeneTiefe`). Sie nennt jeden Täter:
//   (a) WEICHE — Post-Kette → Direktpfad (die Weiche, wie die Zerleg-Linse sie stellt) → Post-Kette → ein Render-Fehler
//       der Kette (der Rückfall des Spiels): je Schritt N Frames in die Leinwand und eine Aufnahme aus dem Ausgabe-Pfad,
//       kein Fehler (Seite, Frame, GPU-Validierung), der Tiefen-Leser kopiert (sonst ist die Wand blind).
//   (b) TIEFE — der Direktpfad zeichnet mit Tiefe (`renderer.depth`, und die nahe Kiste deckt die ferne: die Bild-Mitte
//       ist rot), die Post-Kette ohne (die Leinwand trägt keine Tiefe, auch keine GPU-Textur nach einem Ausflug).
//   (c) SHADER — das erzeugte Fragment der Ausgabe (scripts/lib/shader-kosten.cjs): höchstens 9 unbedingte Abtastungen
//       (Bloom samt Mitte), mindestens 5 in Zweigen (der Godray-Schacht 1 + lokaler Kontrast 4 hinter ihrer Stärke).
//   (d) GODRAYS — mit der Sonne im Bild trägt der Zweig: das Bild mit Godrays weicht von dem ohne ab (über dem Rausch-Boden
//       zweier gleicher Aufnahmen). DER SCHACHT (`_godrayStufe`, w28-lichtschacht): der Marsch ist ein eigener Pass — er
//       zeichnet mit der Sonne im Bild, ohne Stärke nie, und sein Fragment tastet je Schritt die Farbe UND lädt die Tiefe (die
//       Himmels-Maske).
//   (f) SAUM — auf UNGERADER Leinwand (321×241) liest jedes Pixel den Block des Abbilds, der es enthält: ein schräger
//       schwarzer Pfahl steht im Wasser, je Zeile das Wasser-Pixel links an seiner Kante mit Abbild und mit r184s Tiefe.
//   (e) WASSER — das Wasser über einem hellen Grund (0,3 m) liest das Tiefen-Abbild wie r184s Viewport-Tiefe: bei festen
//       Uhren dieselbe Farbe mit dem Abbild und mit dem vollen Klon, und ohne Grund eine andere (die Probe hängt an der
//       Tiefe). Die Bühnen-Ebene trägt die Wicklung des Iso-Wassers (Vorderseite unten, der Stoff zeichnet BackSide).
//   (g) RAHMEN-ZIEL — der Direktpfad zeichnet in r184s Rahmen-Ziel (`_getFrameBufferTarget`, rgba16float +
//       depth24plus, `isPostProcessingRenderTarget` → im Band `tex:r184-ausgabe`); die Post-Kette legt es nie an. Vor dem
//       ersten Ausflug, nach der Rückkehr und am Ende lebt keines, im Direktpfad steht es, und die Regel der Band
//       (`rahmenZielBefunde`) nennt es.
//       DIE DRIFT: fehlt r184s Abschied am Leinwand-Ziel, fällt das Ziel trotzdem, und `_rahmenZielAbschied`
//       meldet ERROR — eine ERROR-Zeile von ihm außerhalb der Probe und jede andere ERROR-Zeile der Seite sind rot.
//   (h) DUNKEL (D3-N2, der Abend) — eine flache Fläche füllt das Bild mit dunklem Szenen-Licht, belichtet gleich hell
//       (0,05 bei Belichtung 1, 0,0125 bei 4 — ein Schatten 1,6 EV unter dem belichteten Mittelgrau): das Bild ist nicht schwarz
//       und bei beiden Belichtungen gleich: der Kontrast dreht über Belichtung 1 um 0,5 nach der Belichtung (25c).
//       DIE NACHT (D3-2): 0,02 bei Belichtung 1 und nightFactor 1 (der Boden im Mondlicht, unter dem Schnitt der Tag-Kurve) ist
//       nicht schwarz — der Kontrast fadet zur Nacht aus wie die Entgrauung (25c).
//   (i) ZUGANG (spielgang.K4, vp-0611g) — aus ist die Ausgabe der Kette die ohne Zugang: kein Knoten der Farbsicht im Graphen
//       (Suche nach ihren Uniformen), der Rückweg auf aus byte-gleich im Fragment, die Lauf-Grenze des Resolve eine Konstante.
//       Steil in den Himmel mit einer blauen Kiste: Tritanopie und Deuteranopie ändern kein Himmels-Pixel (die EINE
//       Himmels-Maske), die Tritanopie ändert die Kiste (sonst blind).
//   (j) FLAMME (K66, w28-brand-kern) — der Ton der Brand-Flamme steht VOR dem Auge der Nacht: eine flache Fläche füllt das Bild
//       (wie (h)), ihr Stoff trägt `_nachtAuge(c, true)` mit c = der Ton der Flamme vor der Tonkurve (fachwerk lichtFarbe(K) ×
//       (K/kelvin[0])⁴ × fachwerk FEUER_LEUCHTDICHTE ÷ EINHEIT_LX, wie die Tafel in `_brandFlammenZeichnen`) für KERN (kelvin[0]) und
//       MANTEL (2350 K, die Mitte der Tafel), dazu das GLIMMEN (der Ton des Mantels in der Mitte des mesopischen Bands,
//       √(staebchenCd · zapfenCd)); gemessen die Bild-Mitte nach der ganzen Kette bei fester Nacht-Belichtung 20 000 (licht-eine-skala).
//       (j1) NACHT = TAG je Ton (nightFactor 1 gegen 0, je Kanal ≤ FLAMME_TOL); MUTANTE-J im selben Lauf: derselbe Ton OHNE die
//       Umkehr reißt bei nightFactor 1 am GLIMMEN (die Nacht entsättigt — sonst ist die Probe blind); KERN und MANTEL stehen in der
//       Leuchtdichte des Gesetzes photopisch und halten OHNE Umkehr — reißen sie, fiel die Flamme aus ihrer Leuchtdichte.
//       (j2) KONSUM: KERN und MANTEL am Schirm = die EINE Tonkurve (welt-licht `tonKurve`) am Planck-Ton der Quelle × Leuchtdichte ×
//       k (in Node gerechnet, `flammenSoll`), ± 2/255 je Kanal; dazu „Feuer, nicht weiß" (Farbton 22–40°, Sättigung ≥ 0,42).
//       MUTANTE-M1 (die Kurve je Kanal) und MUTANTE-M2 (eine fremde Quellen-Temperatur) reißen im Selbsttest.
//       (A3) STETIG AM KNIE: ein Verlauf 0,5–4 × Weiß (grau und im Planck-Ton) durch den echten Renderer, keine Stufe > 1/255
//       zwischen Nachbar-Spalten; MUTANTE (eine Kurve mit Sprung am Knie) reißt im Selbsttest.
//       (j3) EINE QUELLE: die Schwellen `NACHT_AUGE` liest im ganzen Stamm nur `_nachtAuge` (`stammLib.fehlt` außer dem Glied),
//       seine Uniform ist die der Kette; die Post-Kette ruft es, die Flamme ruft seine Umkehr (`__fehlt` am lebenden Code).
//       DAS TOR (w28-tor-nacht) — das Zielbild der Tor-Membran ist dieselbe Klasse (ein Ton am BILD, ÷ Belichtung) und steht
//       über dieselbe Umkehr vor dem Auge: gemessen am echten Ziel-Knoten des Membran-Graphen (`_membranGraph` → `ohneFilm`, das
//       Zielbild ohne den Film) am echten Stoff der Membran, aus einem eigenen Atlas der Ziele (`_torZiele`, `_torZielEinsetzen`)
//       mit je einer Zeile GOLD und DUNKELROT. GOLD steht Nacht = Tag (≤ FLAMME_TOL); DUNKELROT seit w28-glut-nacht auch (vorher die Grenze der
//       Umkehr, an Sättigung und Helle geurteilt). MUTANTE-TOR im selben Lauf: derselbe
//       Graph, neu gebaut, während die Umkehr den Ton durchreicht → GOLD grauweiß, DUNKELROT dunkel. EINE QUELLE zur Laufzeit:
//       ein Mithörer an `_nachtAuge` zählt die Rufe der Umkehr beim Bau des Graphen (≥ 1).
//   (k) RAUCH (w28-rauch-bild) — das EINE Rauch-Bild der Welt (`_rauchZeichnen` / `_rauchStoff`, Tafel `RAUCH_BILD`) am Bild
//       der Ausgabe, nachts (Sonne und Himmel reden nicht mit), der Ballen 6 m vor dem Auge vor einer eigenen Wand; gezeichnet wird
//       der Satz der Brand-Fahne (`brandRauchSatz`), den der echte Leser `_brandRauch` gebaut hat. Jede MUTANTE baut den Stoff
//       neu (die Tafel `AnazhRealm.RAUCH_BILD` als Kopie ersetzt bzw. die Naht der Seite überschrieben) und misst ihn im selben Lauf.
//       (k1) UNTERSEITE: ein Platz des Licht-Pools (das Licht einer Flammen-Fläche, `_flammenLicht`, über den EINEN Schreiber
//       `_leuchtTakt`) 2 m unter und 3 m vor dem Ballen, schwarze Wand — die untere Hälfte gegen die obere (Luma). MUTANTE-K1: `woelbung` 0
//       (die Normale zeigt zum Auge) → das Verhältnis fällt unter das Band. Ohne die Quelle ist der Ballen dunkel (sonst blind).
//       (k2) EIN KÖRPER: zwei gleiche Ballen, die Mitten einen halben Radius auseinander, einzeln vor heller Wand gezeichnet; die
//       Deckung je Pixel (1 − Luma/Wand) minus ihr Mittel je Ring um die eigene Mitte = das Muster; an den Pixeln, die beide
//       decken, die Korrelation beider Muster. MUTANTE-K2: das Muster hängt am Ballen statt an der Welt (der Anker der Naht 0,
//       wie vorher um den Samen) → die Korrelation fällt. Der Boden: derselbe Ballen zweimal.
//       (k3) ZUG: ein Ballen mit Zug nach oben (quer zum Blick) ist längs des Zugs gestreckt (Höhe zu Breite: die Zeilen gegen
//       die Spalten des Bilds, in denen er deckt), derselbe mit Zug längs des Blicks bleibt rund. MUTANTE-K3: `zug` [0, …] → auch quer rund.
//       (k4) BEIDE LESER zur Laufzeit: die Stoffe der Sätze, die `_brandRauch` und `_updateDorfRauch` anlegen, stammen aus dem
//       EINEN Bauer `_rauchStoff` (ein Mithörer am Glied), jeder mit dem Steigen seiner Quelle; `_rauchStoff` ohne `steigMs`
//       bricht laut; außerhalb von `_rauchZeichnen` / `_rauchStoff` liest niemand im Stamm die Attribute des Rauchs (`STAMM.fehlt`).
//       Der DRITTE Leser (druckwelle-bild): der Staub der Druckwelle (`_druckBild`, Satz `druckStaubSatz`) am selben Soll.
//       (k5) EIN PROGRAMM (druckwelle-bild): die Sätze der drei Leser zeichnen je einen Ballen vor dem Auge — r184 schlüsselt
//       Programm und Pipeline am Shader-Text (`Pipelines.getForRender`), gelesen an den Render-Objekten ihrer Zeichner: alle drei
//       zeichnen mit DEMSELBEN Programm-Paar. DIE KLASSE: eine Zahl des Satzes im Shader-Text — jeder Satz baut dann sein
//       eigenes Fragment-Programm (der Täter: Steigen und Skala je Satz als Zahl; GTX 1050, 89358da50: f114 · f115 · f116 bei
//       EINEM Vertex-Programm). MUTANTE-K5: der Stoff des Staubs trägt sein Steigen als Zahl im Text → ein zweites Programm
//       (sonst blind). Die Linse misst die Programme, nicht den Ruck des ersten Bilds (der ist der Knoten-Bau der Senke).
//   (l) ZUNGE (front-brand) — EINE echte Zunge durch `_brandFlammenZeichnen` am Mittag, in der Schicht der Probe: (l1) kein
//       Strahler verdunkelt seinen Grund (vor der Karte), (l2) ihr Leib trägt die Lichtstärke des Gesetzes (fachwerk
//       `FEUER_LEUCHTDICHTE` × Fläche, vor Schwarz im geraden Teil der Kurve); MUTANTE-L über das Glied `_flammeOptik` (Kommentar
//       an `ZUNGE_PROBE`).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): die Shader-Kosten-Linse an gebauten WGSL-Stücken und das
// Urteil über einen grünen Lauf und je einen injizierten Täter — jeder fällt rot und wird genannt.
//   node scripts/diag-post-kette.cjs [--selftest]   (npm run gate:post-kette)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, starteBrowser, postKetteBereit, laufUhr, taeterFaelle, selbsttestEnde, fs, SELBSTTEST, fehlerText, seiteZu, rotListe, jsonKlon, fadenScope } = require("./lib/welt-boot.cjs");
// der Bruch, den die Wand selbst in die Kette wirft (Schritt „Render-Fehler") — der EINE Fehler-Sammler (welt-boot) nennt jeden
// anderen Bruch der Post-Kette ROT beim Namen, diesen erwartet die Linse und zählt ihn selbst (GENAU einmal, `urteil`)
const ERZWUNGEN = /\[ERROR\] STOFF: die Post-Kette .*gate:post-kette — erzwungener Render-Fehler der Kette/;
const SK = require("./lib/shader-kosten.cjs");
const BAND = require("./lib/band-urteil.cjs");
const STAMM = require("./lib/stamm.cjs");

const N_FRAMES = 4;
const BUDGET_AUSGABE = { unbedingtMax: 9, zweigMin: 5 };
// Die Godrays ändern mit der Sonne im Bild mindestens so viele Pixel (% des Bildes, je Pixel ≥ 4/255 in einem Kanal) —
// sie sitzen um die Sonne.
const GODRAY_MIN_PCT = 2;
// Die Lage: der Marsch zielt höchstens 0,12 (screenUV) neben die Scheibe — gemessen (swiftshader, w28-lichtschacht) 0,058 mit
// `_schirmUV`, 0,32 gespiegelt (main 9c9c9bd3: Ziel 0,5/0,632 ↔ Scheibe 0,487/0,311); die Sonne steht dafür mehr als 0,08 neben
// der Bildmitte (der Blick 0,2 rad unter ihr) — an der Mitte fiele die gespiegelte Lage mit der wahren zusammen.
const GODRAY_LAGE_MAX = 0.12;
const GODRAY_LAGE_MITTE = 0.08;
// Das Wasser über dem Grund (unten im Bild, Mittel je Kanal in 8 bit): mit dem Tiefen-Abbild höchstens WASSER_TOL von
// r184s Viewport-Tiefe entfernt; zweimal das Abbild höchstens WASSER_RAUSCHEN; ohne Grund mindestens WASSER_TIEFE_MIN
// anders. Mit dem Wasser der Welle L las das 2×2-Maximum 6,0 daneben; das waagrechte Paar (die Zeile ganz) 0.
const WASSER_TOL = 4;
const WASSER_RAUSCHEN = 1;
const WASSER_TIEFE_MIN = 15;
// (f) Der Saum auf ungerader Leinwand: so viele Kanten-Pixel links am Pfahl dürfen zwischen Abbild und r184s Tiefe
// höchstens um mehr als 8 Luma abweichen (Rauschen), und so viele Kanten-Pixel braucht die Probe mindestens (sonst blind).
const SAUM_MAX = 2;
const SAUM_KANTEN_MIN = 10;
// (h) Das Dunkel: die dunkle Fläche zeigt im Mittel mindestens DUNKEL_LUMA_MIN Luma, und die zwei Belichtungen desselben
// belichteten Lichts weichen höchstens DUNKEL_TOL Luma voneinander ab. Die lineare Kurve schneidet 2,5 EV unter dem belichteten
// Mittelgrau ab (0,028 belichtet), die Tonkurve der Ausgabe (BELICHTUNG.kurve, Neutral: Fuß 6,25·x²) gar nicht; 0,05 liegt über beiden.
const DUNKEL_LUMA_MIN = 3;
const DUNKEL_TOL = 1.5;
// (h) Die Nacht (D3-2): das Licht des Bodens im Mondlicht (0,02 Szenen-Einheiten bei Belichtung 1, unter dem Schnitt der
// Tag-Kurve bei 0,028) bei nightFactor 1 zeigt mindestens DUNKEL_LUMA_MIN Luma — der Kontrast fadet zur Nacht aus wie die
// Entgrauung.
const DUNKEL_NACHT_LICHT = 0.02;
// (j) Die Flamme: jeder Ton bei Belichtung FLAMME_PROBE.k (eine Nacht-Belichtung — Tag und Nacht unterscheidet NUR das Auge der
// Nacht), der MANTEL bei FLAMME_PROBE.mantelK. FLAMME_TOL: so weit darf die Bild-Mitte je Kanal (8 Bit) zwischen nightFactor 0 und 1
// auseinanderliegen — und um mehr muss die Mutante ohne Umkehr reißen. FLAMME_BAND: Farbton (Grad) und Sättigung (HSV) je Ton.
// DIE NACHT-BELICHTUNG IN DER EINEN SKALA (licht-eine-skala): bis zur Welle stand k bei 1,5 — in der alten Skala eine Nacht, in
// der EINEN Skala (das Auge urteilt in cd/m², `_nachtAuge`: Bildwert ÷ k × EINHEIT_LX) liegt bei 1,5 jeder Ton der Probe photopisch
// (das Gold des Tors 7 000 cd/m²): das Auge der Nacht nimmt nichts, MUTANTE-J und MUTANTE-TOR rissen mit Δ 0 (GTX 1050, a3663ef5f).
// 20 000 ist die Nacht unter der Kamera des Spiels (die Rauch-Probe misst k an der Uhr 0; im Spiel ≈ 47 000) und trägt das Gold bei
// 0,52 cd/m² — GERECHNET (Auge + Neutral-Kurve + sRGB, ohne Bloom und Grading) liegt MUTANTE-TOR dort bei Δ 10 (Gold) / 46
// (Dunkelrot), genau der Lage der Probe vor der Welle (gemessen Δ 10 / 47). Die Tonkurve sieht dasselbe Bild (L × k ist der Bildwert).
// DIE FLAMME LEUCHTET PHYSIKALISCH (P8, S10): KERN und MANTEL tragen die Leuchtdichte des Gesetzes (fachwerk `FEUER_LEUCHTDICHTE`
// 15 000 cd/m² an der Wurzel; der Mantel 2350 K 4 600 cd/m²) — weit über `NACHT_AUGE.zapfenCd`: das Auge der Nacht nimmt ihnen bei
// JEDER Belichtung nichts, die Umkehr ist dort die Identität. Die Prämisse „ohne Umkehr entsättigt der Mantel" fiel mit der Physik;
// beide stehen als `blende` (ohne Umkehr = Tag). DAS GLIMMEN trägt die Wand gegen die Mutante: der Ton des Mantels in der
// Leuchtdichte `glimmen` = √(staebchenCd · zapfenCd) (die Mitte des mesopischen Bands in Dekaden, zur Laufzeit aus `NACHT_AUGE`,
// 0,158 cd/m²) — dort entsättigt das Auge, die Umkehr gibt die Sättigung zurück, soweit ihre Grenze reicht (die Zeile `nachtSatt`).
const FLAMME_PROBE = { k: 20000, mantelK: 2350, glimmen: true };
// Gemessen (swiftshader, dfa9edee): KERN Tag [249,184,122] ↔ Nacht [249,184,124], Δ 2 (ohne Umkehr Δ 29); der MANTEL reißt — Tag
// [200,118,18] ↔ Nacht [199,115,85], Δ 67 (ohne Umkehr Δ 73): sein Blau liegt unter Leuchtdichte × Stäbchen-Anteil, die Umkehr
// klemmt bei 0 (Farbton 15,8°, Sättigung 0,573; ohne Umkehr 0,474). DIE GRENZE DER UMKEHR, benannt: unter einem Auge, das je
// Pixel nach der Leuchtdichte entsättigt, gibt es einen dunklen gesättigten Ton nicht — jeder Kanal trägt mindestens Leuchtdichte ×
// Stäbchen-Anteil. Der KERN (hell) kommt ganz zurück, der MANTEL nur zum Teil: er wird an seiner SÄTTIGUNG der Nacht geurteilt
// (`nachtSatt`, zwischen mit und ohne Umkehr), nicht an Tag = Nacht. Die Bänder (j2) liegen um das Gemessene am Tag.
// SEIT w28-glut-nacht (das Auge blendet am Bild aus, sein Grau ist skotopisch, die Umkehr folgt dem Urbild — gemessen GTX 1050,
// echte Karte, Stärke 1,22): KERN Tag [249,184,122] ↔ Nacht [249,184,121], Δ 1 — und OHNE Umkehr [249,184,122], Δ 0: der Kern steht über
// Bild-Weiß, das Auge sieht ihn mit den Zapfen (`NACHT_AUGE.bildZapfen`). Das ist sein Soll (`blende`): reißt der Kern ohne
// Umkehr, steht der Feuerschein wieder rosa — der Täter von main (Δ 29) ist Selbsttest-Fall. MANTEL Tag [200,118,18] ↔ Nacht
// [199,116,41] (Sättigung 0,794; das Blau klemmt bei 0) — ohne Umkehr [163,106,59] (0,638): die Ratsche `nachtSatt` 0,53 → 0,75.
const FLAMME_TOL = 6;
// SEIT licht-eine-skala (gerechnet wie oben, k 20 000): KERN und MANTEL Tag = Nacht = ohne Umkehr; GLIMMEN Tag [171,100,10] ↔
// Nacht [169,97,35] (Sättigung 0,79) — ohne Umkehr [131,84,45] (0,66): dieselbe Lage wie der Mantel vor der Welle (0,794 / 0,638),
// die Ratsche `nachtSatt` 0,75 bleibt; das Glimmen trägt sein eigenes Band (es steht unter Bild-Weiß, im Fuß der Kurve).
// (j2) KERN UND MANTEL AM KONSUM, NICHT AN EINER SCHWELLE (licht-eine-skala): der Pixel am Schirm ist die EINE Kurve am Quellen-Ton
// — `flammenSoll` rechnet ihn in Node aus dem Datum (fachwerk `lichtFarbe(K)` × (K/kelvin[0])⁴ in 8 Bit wie die Tafel in
// `_brandFlammenZeichnen`, × die QUELLE der Zunge (seit front-brand der schwarze Körper des Kerns, `_flammeOptik().quelle` =
// fachwerk `glutLeuchtdichte(LICHT_GESETZ.feuer.kelvin)`; bis dahin `FEUER_LEUCHTDICHTE` — bei k 20 000 steht beides am Deckel,
// die Töne am Schirm blieben) ÷ `EINHEIT_LX` ÷ Luma(lichtFarbe(kelvin[0])), × k, der Deckel des Szenen-Ziels am
// größten Kanal, `tonKurveJs`, sRGB), je Kanal ± FLAMME_KONSUM_TOL (8 Bit). Das Band bleibt nur als „Feuer, nicht weiß": Farbton
// 22–40°, Sättigung ≥ 0,42 für BEIDE. DIE GEFALLENE SCHWELLE 0,75 des Mantels war ein Artefakt des Fußes der alten Kurve: main
// MANTEL [200,118,18] trug Sättigung 0,91, weil der Bild-Ton unter Weiß stand und der Fuß 6,25·x² das Blau fraß (linear 0,03 →
// 0,006); der Planck-Ton 2 350 K trägt über Weiß 0,749 — die Schwelle stand über dem Wahren (GTX 1050: MANTEL [255,159,64],
// 29,8° / 0,749; KERN [255,183,109], 30,4° / 0,573).
const FLAMME_BAND = {
    kern: { ton: [22, 40], satt: 0.42, name: "gelb-orange", blende: true, konsum: true },
    mantel: { ton: [22, 40], satt: 0.42, name: "orange", blende: true, konsum: true },
    glimmen: { ton: [22, 42], satt: 0.75, name: "orange", nachtSatt: 0.75 },
};
const FLAMME_KONSUM_TOL = 2;
// (A3) STETIG AM KNIE: ein Verlauf von `von` bis `bis` × Weiß (Eingang der Kurve, nach × k) längs der Bild-Breite, logarithmisch,
// durch den echten Renderer (dieselbe flache Fläche wie (j), Belichtung FLAMME_PROBE.k, nightFactor 0) — grau und im Planck-Ton
// des Mantels; `n` Stützstellen (eine je Spalte der Leinwand 320, die Zeilen gemittelt). Die Kurve fällt dort von 0,5 × Weiß um
// höchstens 0,68 / 255 je Spalte (gerechnet, `tonKurveJs`): zwischen Nachbarn steht nie eine Stufe > KNIE_STUFE (8 Bit).
const KNIE_PROBE = { n: 320, von: 0.5, bis: 4 };
const KNIE_STUFE = 1;
// DIE QUELLEN in Node (die EINE Datei je Datum, je Prozess einmal): fachwerk `lichtFarbe` / `FEUER_LEUCHTDICHTE`, welt-licht
// `EINHEIT_LX` / `BELICHTUNG` — die Linse trägt keine Kopie ihrer Zahlen
const quelle = () => (quelle.q ||= ((sb) => ({ FW: sb.__fachwerkCore, W: sb.__weltLicht }))(fadenScope(["foundry-core.js", "fachwerk-core.js", "welt-licht.js"])));
// DIE EINE TONKURVE als Rechen-Form (welt-licht.js `tonKurve`, der Platz `BELICHTUNG.kurve`): Khronos PBR Neutral — Fuß
// x − 6,25·x² unter 0,08 (sonst − 0,04) am kleinsten Kanal, über der Schulter `schulter` der GRÖSSTE Kanal gestaucht
// (neu = 1 − (1 − S)² ÷ (Spitze + 1 − 2S), c × neu ÷ Spitze), kein Zug zu Weiß. Die Zahl `schulter` reicht der Rufer aus
// `BELICHTUNG` der Seite (`fl.kurve`) bzw. aus welt-licht.js. MUTANTEN: `kanalweise` (M1, jeder Kanal für sich gestaucht),
// `sprung` (A3, die Kurve springt über der Schulter um so viel).
function tonKurveJs(farbe, schulter, mut = {}) {
    const [S, d] = [schulter, 1 - schulter];
    const x = Math.min(...farbe);
    const c = farbe.map((v) => v - (x < 0.08 ? x - 6.25 * x * x : 0.04));
    const stauch = (sp) => (sp >= S ? (1 - (d * d) / (sp + d - S) + (mut.sprung || 0)) / sp : 1);
    if (mut.kanalweise) return c.map((v) => v * stauch(v));
    const sp = Math.max(...c);
    const aus = c.map((v) => v * stauch(sp));
    // der Weg zu Weiß (nacht-lichter, welt-licht `BELICHTUNG.weiss`): über Weiß begrenzt zum größten Kanal, genau 0 bis Weiß
    const WS = quelle().W.BELICHTUNG.weiss;
    const s = Math.log2(Math.max(sp, 1)) / WS.stufen;
    const w = mut.ohneWeiss ? 0 : WS.kappe * (1 - Math.pow(2, -s * s));
    const hell = Math.max(...aus);
    return aus.map((v) => v + (hell - v) * w);
}
// die sRGB-Kodierung der Ausgabe (IEC 61966-2-1) in 8 Bit
const srgb8 = (v) => {
    const l = Math.min(1, Math.max(0, v));
    return 255 * (l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055);
};
// DAS SOLL DER FLAMME am Schirm (j2): Temperatur K, Wurzel K0 (`BRAND.bild.flamme.kelvin[0]` der Seite), Belichtung k, die Kurve
// der Seite `kz` ({ schulter, deckel })
function flammenSoll(K, K0, k, kz, mut) {
    const { FW, W } = quelle();
    const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const w = Math.pow(K / K0, 4);
    const t8 = FW.lichtFarbe(K).map((v) => Math.round(255 * v * w) / 255);
    // die QUELLE der Zunge (front-brand, `_flammeOptik`): der schwarze Körper des Kerns bei der Temperatur seines Feuers
    const f = (FW.glutLeuchtdichte(FW.LICHT_GESETZ.feuer.kelvin) / luma(FW.lichtFarbe(K0)) / W.EINHEIT_LX) * k;
    const bild = t8.map((v) => v * f);
    const spitze = Math.max(...bild);
    const gedeckelt = bild.map((v) => (v * kz.deckel) / Math.max(spitze, kz.deckel));
    return tonKurveJs(gedeckelt, kz.schulter, mut).map((v) => +srgb8(v).toFixed(2));
}
// (A3) die Reihe der Kurve am Verlauf `KNIE_PROBE` für den Ton `ton` (größter Kanal 1), je Stützstelle die Mitte ihrer Spalte
const knieReihe = (ton, n, schulter, mut) =>
    Array.from({ length: n }, (_, i) => tonKurveJs(ton.map((v) => v * KNIE_PROBE.von * Math.pow(KNIE_PROBE.bis / KNIE_PROBE.von, (i + 0.5) / n)), schulter, mut).map(srgb8));
// (j) Das Tor: je Ton der Wert des Zielbilds (lineares Licht der Ziel-Welt, wie der Atlas der Ziele es trägt), bei derselben
// Belichtung FLAMME_PROBE.k und derselben Toleranz FLAMME_TOL wie die Flamme. Gemessen (swiftshader, d06ad11e, Gestalt drachentor,
// zwei Läufe Zahl für Zahl gleich): GOLD Tag [235,198,125] ↔ Nacht [235,198,125], Δ 0 — MUTANTE-TOR (die Umkehr reicht den Ton
// durch, das Zielbild wie vor w28-tor-nacht) [228,202,159], Δ 34, Sättigung 0,468 → 0,303 (grauweiß). DUNKELROT Tag [93,9,2]
// (Sättigung 0,978) ↔ Nacht [111,35,35] (0,685) — MUTANTE-TOR [50,17,16] (0,68). DIE GRENZE DER UMKEHR, benannt wie am Mantel der
// Flamme: Grün und Blau des dunklen Tons liegen unter Leuchtdichte × Stäbchen-Anteil, die Umkehr klemmt bei 0, die Sättigung
// kommt nachts NICHT zurück (mit und ohne Umkehr gleich: 0,685 / 0,68) — `nachtSatt` ist darum eine Ratsche am Gemessenen, keine
// Wand gegen die Mutante; was die Umkehr dem dunklen Ton gibt, ist seine HELLE (der größte Kanal 111 statt 50, am Tag 93):
// `nachtHell` liegt zwischen beiden, die Mutante muss darunter fallen. Die Bänder `ton` / `satt` liegen um das Gemessene am Tag
// (GOLD 39,8° / 0,468; DUNKELROT 4,6° / 0,978 — der Farbton läuft über 0°, das Band auch). Auf der Karte (GTX 1050, ein Lauf):
// GOLD [235,197,125] ↔ [235,197,125], Δ 0, MUTANTE-TOR [228,202,158,5], Δ 33,5; DUNKELROT Zahl für Zahl wie swiftshader.
// SEIT w28-glut-nacht (echte Karte): DUNKELROT Tag [93,9,2] ↔ Nacht [93,8,2], Δ 1 — MUTANTE-TOR [46,4,3], Δ 47; der dunkle
// gesättigte Ton kommt unter dem skotopischen Grau GANZ zurück (das Rot erregt die Stäbchen nicht), er steht wie GOLD an Tag =
// Nacht, Ratsche und Wand der Helle sind gefallen. GOLD [235,197,125] ↔ [235,197,125], MUTANTE-TOR [231,5,198,135], Δ 10.
const TOR_PROBE = { toene: { gold: [0.9, 0.62, 0.25], dunkelrot: [0.12, 0.012, 0.01] } };
const TOR_BAND = { gold: { ton: [32, 48], satt: 0.4, name: "gold" }, dunkelrot: { ton: [350, 15], satt: 0.9, name: "dunkelrot" } };
const TOR_ORT = "stamm/siedlung-tor.js `_membranGraph`, das Zielbild (`ziel`)";
// (A3) DAS MASS AM KNIE je Ton: die größte Stufe zwischen Nachbar-Spalten (8 Bit, je Kanal), wo sie steht (Spalte, Eingang × Weiß),
// und — zur Auskunft, kein Urteil — die größte Abweichung der Reihe von der Rechen-Form (`knieReihe`, Schulter der Seite)
function knieMass(tn, n, schulter) {
    let [stufe, wo] = [0, 0];
    for (let i = 1; i < tn.reihe.length; i++)
        for (let c = 0; c < 3; c++) {
            const s = Math.abs(tn.reihe[i][c] - tn.reihe[i - 1][c]);
            if (s > stufe) [stufe, wo] = [s, i];
        }
    const eingang = +(KNIE_PROBE.von * Math.pow(KNIE_PROBE.bis / KNIE_PROBE.von, (wo + 0.5) / n)).toFixed(3);
    const js = schulter > 0 ? knieReihe(tn.ton, n, schulter) : null;
    const abw = js ? +Math.max(...tn.reihe.map((p, i) => Math.max(...[0, 1, 2].map((c) => Math.abs(p[c] - js[i][c]))))).toFixed(2) : null;
    return { stufe: +stufe.toFixed(2), wo, eingang, abw };
}
function knieUrteil(kn) {
    if (!kn) return ["KNIE: die Probe lief nicht"];
    if (kn.abbruch) return [`KNIE: ABBRUCH — ${kn.abbruch}`];
    if (!(kn.n >= 64 && kn.leinwand >= kn.n && kn.k === FLAMME_PROBE.k && kn.nf === 0))
        return [`KNIE: ${kn.n} Stützstellen auf einer Leinwand von ${kn.leinwand} Spalten, Belichtung ${kn.k}, nightFactor ${kn.nf} (Soll ≥ 64 Stützstellen, je eine Spalte, Belichtung ${FLAMME_PROBE.k}, nightFactor 0) — die Probe ist blind`];
    const v = [];
    for (const name of ["grau", "satt"]) {
        const tn = (kn.toene || {})[name];
        if (!tn || !Array.isArray(tn.reihe)) {
            v.push(`KNIE: ${name.toUpperCase()} — nicht gemessen`);
            continue;
        }
        if (!(tn.reihe.length === kn.n && tn.reihe.at(-1)[0] - tn.reihe[0][0] >= 40)) {
            v.push(`KNIE: ${name.toUpperCase()} — die Reihe trägt ${tn.reihe.length} von ${kn.n} Stützstellen, von ${JSON.stringify(tn.reihe[0])} bis ${JSON.stringify(tn.reihe.at(-1))} (Soll ein Anstieg ≥ 40 im größten Kanal) — der Verlauf steht nicht im Bild, die Probe ist blind`);
            continue;
        }
        const m = knieMass(tn, kn.n, null);
        if (!(m.stufe <= KNIE_STUFE))
            v.push(
                `KNIE: ${name.toUpperCase()} — zwischen Spalte ${m.wo - 1} und ${m.wo} (Eingang ${m.eingang} × Weiß) springt das Bild um ${m.stufe} / 255 (Soll ≤ ${KNIE_STUFE}): ${JSON.stringify(tn.reihe[m.wo - 1])} → ${JSON.stringify(tn.reihe[m.wo])} — die EINE Tonkurve (welt-licht \`tonKurve\`) ist am Knie nicht stetig`
            );
    }
    return v;
}
// (j) DAS URTEIL ÜBER DAS TOR: je Zeile der Täter; eine Mutante, die ihr Band nicht reißt, ist „blind".
function torUrteil(to) {
    if (!to) return ["TOR: die Probe lief nicht"];
    if (to.abbruch) return [`TOR: ABBRUCH — ${to.abbruch}`];
    const v = [];
    const belicht = +(1 / FLAMME_PROBE.k).toPrecision(4);
    if (!(to.zeilen === Object.keys(TOR_BAND).length && to.belicht === belicht))
        v.push(`TOR: der Atlas der Probe trägt ${to.zeilen} Zeilen (Soll ${Object.keys(TOR_BAND).length}) und teilt durch die Belichtung mit ${to.belicht} (Soll ${belicht}) — die Probe ist blind`);
    for (const [name, band] of Object.entries(TOR_BAND)) {
        const [tn, N] = [(to.toene || {})[name], name.toUpperCase()];
        if (!tn) {
            v.push(`TOR: ${N} — nicht gemessen`);
            continue;
        }
        if (!(tn.k === FLAMME_PROBE.k && tn.nfTag === 0 && tn.nfNacht === 1 && tn.nfOhne === 1)) {
            v.push(`TOR: ${N} — die Belichtung stand bei ${tn.k} statt ${FLAMME_PROBE.k} oder nightFactor bei ${tn.nfTag} / ${tn.nfNacht} / ${tn.nfOhne} statt 0 / 1 / 1 (die Probe ist blind)`);
            continue;
        }
        const [d, dM, f] = [kanalAbstand(tn.tag, tn.nacht), kanalAbstand(tn.tag, tn.ohne), hsv(tn.tag)];
        const imTon = band.ton[0] <= band.ton[1] ? f.ton >= band.ton[0] && f.ton <= band.ton[1] : f.ton >= band.ton[0] || f.ton <= band.ton[1];
        if (!(imTon && f.satt >= band.satt))
            v.push(
                `TOR: ${N} — der Ton der Probe liest sich am Tag nicht als ${band.name}: ${JSON.stringify(tn.tag)}, Farbton ${f.ton}° (Soll ${band.ton[0]}–${band.ton[1]}°), Sättigung ${f.satt} (Soll ≥ ${band.satt}) — der Atlas der Ziele oder der Weg des Zielbilds trägt die Zeile nicht (die Probe ist blind)`
            );
        if (!(d <= FLAMME_TOL))
            v.push(
                `TOR: ${N} — am Tag ${JSON.stringify(tn.tag)}, in der Nacht ${JSON.stringify(tn.nacht)} (Δ ${d} > ${FLAMME_TOL} je Kanal) — das Zielbild des Tors steht nicht vor dem Auge der Nacht: ${TOR_ORT} ruft die Umkehr \`_nachtAuge(…, true)\` nicht, oder jemand änderte \`_nachtAuge\`, ohne dass seine Umkehr folgt`
            );
        if (!(dM > FLAMME_TOL))
            v.push(`TOR: ${N} — MUTANTE-TOR (das Zielbild OHNE die Umkehr, nightFactor 1) zeigt ${JSON.stringify(tn.ohne)} gegen den Tag ${JSON.stringify(tn.tag)} (Δ ${dM} ≤ ${FLAMME_TOL}) — das Auge der Nacht entsättigt das Zielbild nicht (die Probe ist blind)`);
    }
    if (!(to.rufe >= 1))
        v.push(`TOR: EINE QUELLE — beim Bau des Membran-Graphen rief ${TOR_ORT} die Umkehr \`_nachtAuge(…, true)\` ${to.rufe}× (Soll ≥ 1) — das Zielbild steht nicht vor dem Auge der Nacht oder rechnet es selbst`);
    return v;
}
const hsv = ([r, g, b]) => {
    const [mx, mn] = [Math.max(r, g, b), Math.min(r, g, b)];
    const d = mx - mn;
    const h = d === 0 ? 0 : mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { ton: +(60 * h).toFixed(1), satt: mx ? +(d / mx).toFixed(3) : 0 };
};
const kanalAbstand = (a, b) => (a && b ? +Math.max(...[0, 1, 2].map((c) => Math.abs(a[c] - b[c]))).toFixed(1) : NaN);
// (k) Der Rauch — die Probe: Mitternacht (`uhr` 0), der Ballen `abstandM` vor dem Auge (Radius `radiusM`, Deckung `deck` im Kern),
// die Wand `wandM` dahinter (hell: `wand` vor der Tonkurve); die Quelle des Licht-Pools `licht` [rechts, hoch, zum Auge] m neben
// der Mitte des Ballens, eine Flammen-Fläche vom Halbmesser `flammeM`; (k2) die Mitten `versatz` Radien auseinander, gewertet
// innerhalb `rand` Radien; (k3) der Zug so schnell, dass die Tafel um `streck` Radien streckt; je Schuss `frames` Bilder (die
// zeitliche Glättung der Kette schwingt ein). Die Probe zeichnet in ihrer EIGENEN Schicht (Wand, Ballen, die Lichter der Szene):
// die Welt des Orts steht nicht im Bild. Vorher las sie die Wand in den Ecken des GANZEN Weltbilds — am Zug z598 (GTX 1060) stand
// dort Welt im Schein der Quelle (Ecken-Mittel 9,69 vor Schwarz), fünf Zeilen rissen. `stoerer` ist der Ton eines Streifens Welt
// im unteren Viertel, der die ganze Probe über steht (die alte Probe misst mit ihm 49,78 / Hub 0,0147 / Form 0,234 und 0,224 —
// dieselben fünf Zeilen); (k0) prüft jede Ecke gegen die Wand, MUTANTE-K0 stellt den Störer in die Schicht.
// DIE QUELLE IM BILD (licht-eine-skala): die Flammen-Fläche trägt seit P8 die Leuchtdichte des Gesetzes (15 000 cd/m², 2 m:
// 37 700 cd) — unter der Kamera der Nacht (k an Uhr 0, ≈ 47 000) stand die Unterseite des Ballens an der Klemme des Bild-Weiß
// (unten 252,84 / oben 110,4, Verhältnis 2,29, GTX 1050 vor cd2cd289c): die Probe maß die Klemme, nicht die Wölbung. Das
// Verhältnis ist ein Maß der GEOMETRIE (die Normale sieht ins Feuer) — die Probe stellt darum die Quelle über denselben Schreiber
// (`_flammenLicht(r, cdM2)`, `_leuchtTakt`) bei der Leuchtdichte, deren Stärke × Belichtung `quelleBild` trägt: die Lage der Probe
// vor der Welle (Stärke 17,177 × k 1,505 = 25,85 Welt-Einheiten in 1 m, c5713056), an der die Bänder (k1) gemessen sind. Das
// Bild des Kopfs bei der Leuchtdichte des Gesetzes misst die Probe daneben als Auskunft (`gesetz`, kein Urteil).
// DER EIGENE ORT (rauch-buehne): das Auge `ueberBodenM` über dem Boden der Bühne, in freier Luft — der Ort, an dem die Bänder
// geeicht sind (die Bühne vor w28-spiegel-eis: y0 = eisNull − 7 = 94,74 m über dem Boden 90,31 m). Bis hier stand die Probe auf der
// Bühne und folgte ihrer Eis-Linie: mit EIS.uebergang 13 sank sie 12,9 m in die Erde, das Muster des Rauchs steht in der Welt
// (`_rauchStoff`), der Ballen las ein anderes Stück Rauschen (UNTERSEITE 6,07 → 2,84, ZUG 2,042 → 1,604, GTX 1050 und 1060).
// Die Probe zeichnet nur ihre Schicht: die Eis-Linie hat hier keinen Leser.
const RAUCH_PROBE = { uhr: 0, ueberBodenM: 4.43, abstandM: 4.5, wandM: 6, radiusM: 1, deck: 0.45, licht: [0, -2, 3], flammeM: 2, quelleBild: 25.85, versatz: 0.5, streck: 1, rand: 0.8, wand: 0.3, stoerer: 0.05, frames: 6, staubSink: 0.19 };
// GEMESSEN (swiftshader, c5713056, Leinwand 321×241, der Lauf zweimal Zahl für Zahl gleich) — der Kopf und, im selben Lauf, jede
// Mutante; der Selbsttest urteilt an genau diesen Zahlen (grün am Kopf, rot an jeder Mutanten-Zahl an seiner Stelle). Auf der
// Karte (GTX 1050, ein Lauf): unten ÷ oben 5,97 / flach 3,28 · Korrelation 0,749 / −0,318 · Höhe zu Breite 2 / 0,926 / 0,926.
// SEIT licht-eine-skala (GTX 1050, cd2cd289c, k 47 140, die Quelle 3,511 cd/m² über `quelleBild`): unten 54,18 / oben 8,92 = 6,07 ·
// flach 61,51 / 19,35 = 3,18 · ohne Quelle 0,01 / 1,2 · Korrelation 0,75 / −0,311 · Höhe zu Breite 2,042 / 0,909 / 0,909 · Wand hell
// 143,4 — jede Zeile im Band der Welle davor; bei der Leuchtdichte des Gesetzes (15 000 cd/m²) unten 254,15 / oben 114,12 (die Klemme).
const RAUCH_GEMESSEN = {
    kopf: {
        gpuFehler: [],
        uhr: 0,
        nf: 1,
        k: 1.505,
        leinwand: [321, 241],
        radiusPx: 34.9,
        licht: [{ quelle: "brand", staerke: 17.177, blende: 1, reichweite: 23.68 }],
        unten: { unten: 41.4, oben: 6.96, grund: 0, ecken: [0, 0, 0, 0], px: 4496 },
        mutWand: [0, 0, 33.02, 33.01],
        dunkel: { unten: 0.24, oben: 1, grund: 0, ecken: [0, 0, 0, 0], px: 4496 },
        mutUnten: { unten: 47.5, oben: 14.5, grund: 0, ecken: [0, 0, 0, 0], px: 4496 },
        koerper: { gleich: 0.749, px: 1491, hub: 0.0964, wand: 139.1, ecken: [139.04, 139.04, 139.03, 139.04], boden: 1 },
        mutKoerper: { gleich: -0.316, px: 1491, hub: 0.0783, wand: 139.1 },
        zug: { tempo: 1.667, quer: { form: 2, hoch: 96, breit: 48, masse: 0.122 }, laengs: { form: 0.926, hoch: 50, breit: 54, masse: 0.094 } },
        mutZug: { quer: { form: 0.926, hoch: 50, breit: 54, masse: 0.094 } },
        leser: {
            brand: { teilchen: 1, satz: true, bauer: true, steigMs: 2.5, soll: 2.5, zug: true },
            kamin: { teilchen: 1, satz: true, bauer: true, steigMs: 1.2, soll: 1.2, zug: true },
            staub: { teilchen: 1, satz: true, bauer: true, steigMs: 0.19, soll: 0.19, zug: true },
            bruch: "_rauchStoff: der Rauch ohne Steigen (m/s) trägt kein Muster",
            bauten: 8,
            zwilling: null,
        },
        programm: { brand: ["v41/f77"], kamin: ["v41/f77"], staub: ["v41/f77"], mutante: ["v41/f93"] },
    },
};
// Die Bänder um das Gemessene. (k1) `unten`: Luma unten ÷ oben, Kopf 5,95 (41,4 / 6,96), MUTANTE-K1 3,28 (47,5 / 14,5) — DIE GRENZE
// DES MASSES, benannt: auch die flache Scheibe ist unten heller (die Quelle steht näher an der Unterseite, und der Fuß der Tonkurve
// spreizt dunkle Töne), das Band liegt darum ±20 % um den Kopf und über der Mutante, nicht bei „oben dunkel"; `lichtMin`: so viel
// Luma hebt die Quelle die Unterseite mindestens (gemessen 0,24 → 41,4). (k2) `gleich`: die Korrelation der Muster, Kopf 0,749,
// MUTANTE-K2 −0,316; `boden` derselbe Ballen zweimal (1), `hubMin` die Streuung des Musters (0,096), `kPxMin` gemeinsame Pixel
// (1491), `pxMin` der Radius im Bild (34,9). (k3) Höhe zu Breite: `quer` Kopf 2,00 (96 Zeilen / 48 Spalten; die Tafel streckt um
// 1 Radius: 1 + 1), `laengs` 0,926 (50 / 54 — der runde Ballen misst nicht 1: das Muster der Welt franst seinen Rand), MUTANTE-K3
// 0,926; `masseMin` die Deckung über seiner Scheibe (0,094).
const RAUCH_BAND = { unten: [4.8, 7.2], lichtMin: 20, gleich: 0.5, boden: 0.95, hubMin: 0.03, pxMin: 25, kPxMin: 1000, masseMin: 0.05, quer: [1.7, 2.3], laengs: [0.8, 1.15], eckeSchwarz: 1, eckeHell: [134, 144] };
const rauchVerh = (u) => (u ? +((u.unten - u.grund) / Math.max(0.5, u.oben - u.grund)).toFixed(2) : NaN);
const RAUCH_ORT = "stamm/siedlung-bewohner.js `_rauchStoff`";
// (k) DAS URTEIL ÜBER DEN RAUCH: je Zeile der Täter (Datei, Glied, Zahl); eine Mutante, die ihr Band nicht reißt, ist „blind".
// (l) DIE ZUNGE VOR DEM HELLEN GRUND (front-brand): EINE echte Zunge durch `_brandFlammenZeichnen` in der eigenen Schicht der Probe
// (wie der Rauch in (k)), am Mittag der Bühne. DIE KLASSE: ein Strahler, der seinen Grund verdunkelt. Der Täter (main 9502aa0e7,
// die Station same.kopplung.kaskade zählte am Tag +9 Flammen-Pixel statt ≥ 200): seit licht-eine-skala P8 trug nur die WURZEL der
// Zunge die Leuchtdichte des Gesetzes (fachwerk `FEUER_LEUCHTDICHTE`), ihr Leib im Mittel 17 % davon (Temperatur-Fall (T/T0)⁴ längs
// und quer) — und sie deckte wie ein schwarzer Körper (1 − e^(−6·Dicke)): über der Wiese im Mittagslicht stand ein dunkleres Band.
// (l1) KEIN STRAHLER VERDUNKELT SEINEN GRUND: vor der Wand im Ton der Karte am Mittag (`BELICHTUNG.zielKarte`) ist kein Pixel der
//      Zunge dunkler als die Wand ohne sie (Anteil ≤ `dunkel`), und sie hellt ihn auf (Anteil ≥ `hell`).
// (l2) DER LEIB TRÄGT DIE LICHTSTÄRKE DES GESETZES: vor der schwarzen Wand, bei der Blende `kLin` (der schwarze Körper des Kerns
//      × 0,3 an der Schulter — das Bild steht im geraden Teil der Kurve, die Probe rechnet sRGB und den Fuß zurück), ist
//      Σ Leuchtdichte × Pixel-Fläche = `FEUER_LEUCHTDICHTE` × Fläche des Leibs (2 × halbe Breite × Länge × mittlerer Radius der
//      Tafel fachwerk `FLAMME.zunge`) — dieselbe Zahl, die `_flammenLicht` als Schein wirft (Gebot 4), im Band `staerke`.
// MUTANTE-L im selben Lauf: `_flammeOptik` liefert das Gesetz von vorher (Quelle = `FEUER_LEUCHTDICHTE` an der Wurzel, Deckung 6)
// — beide Zeilen müssen an ihr reißen (`mutDunkel`, `mutStaerke`), sonst liest der Stoff das Glied nicht.
const ZUNGE_PROBE = { uhr: 0.5, abstandM: 3, wandM: 2, langM: 1.6, zeiten: [0, 0.37, 0.74], tol: 3, frames: 6, mutDeckung: 6 };
const ZUNGE_BAND = { pxMin: 60, karte: [95, 140], dunkel: 0.005, hell: 0.15, staerke: [0.8, 1.25], mutDunkel: 0.05, mutStaerke: 0.5 };
const ZUNGE_ORT = "stamm/feld-brand.js `_brandFlammenZeichnen` (die Optik der Zunge: `_flammeOptik`)";
// GEMESSEN (GTX 1050, Leinwand 321×241): `kopf` nach dem Schnitt front-brand (0 Pixel dunkler, Lichtstärke × 1,057; MUTANTE-L
// 20,4 % dunkler, × 0,255), `taeter` der Kopf von main 9502aa0e7 im selben Maß (Abstand 4 m: 20,0 % dunkler, × 0,241)
const ZUNGE_GEMESSEN = {
    kopf: {
        gpuFehler: [],
        uhr: 0.5,
        nf: 0,
        k: 0.5113,
        leinwand: [321, 241],
        zungePx: [79, 85],
        optik: { quelle: 456732, deckung: 0.1963 },
        z1: { dunkel: 0, hell: 4926, px: 20145, tiefst: -0.1, grund: 117.6 },
        z2: { k: 0.0455, cd: 11005, sollCd: 10412, flaecheM2: 0.6941, spitze: 0.463, schulter: 0.76 },
        mut: { z1: { dunkel: 4119, hell: 927, px: 20145, tiefst: -68.8, grund: 117.6 }, z2: { k: 0.0455, cd: 2651, sollCd: 10412, flaecheM2: 0.6941, spitze: 0.074, schulter: 0.76 } },
    },
    taeter: { z1: { dunkel: 2304, hell: 504, px: 11529, tiefst: -54.2, grund: 117.6 }, z2: { k: 0.0455, cd: 2513, sollCd: 10412, flaecheM2: 0.6941, spitze: 0.076, schulter: 0.76 } },
};
// die Blende von (l2) und der Ton der Wand von (l1) aus den Quellen (keine Kopie ihrer Zahlen)
const zungeMass = () => {
    const { FW, W } = quelle();
    const l0 = ((c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2])(FW.lichtFarbe(3000));
    return { karte: W.BELICHTUNG.zielKarte, schulter: W.BELICHTUNG.schulter, kLin: +((0.9 * W.BELICHTUNG.schulter) / ((FW.glutLeuchtdichte(FW.LICHT_GESETZ.feuer.kelvin) / W.EINHEIT_LX / l0) * 0.3)).toPrecision(3) };
};
function zungeUrteil(zu) {
    if (!zu) return ["ZUNGE: die Probe lief nicht"];
    if (zu.abbruch) return [`ZUNGE: ABBRUCH — ${zu.abbruch}`];
    const [v, B, P] = [[], ZUNGE_BAND, ZUNGE_PROBE];
    const im = (x, [a, b]) => x >= a && x <= b;
    if (zu.gpuFehler?.length) v.push(`ZUNGE: ${zu.gpuFehler.length} GPU-Validierungs-Fehler: ${zu.gpuFehler[0]}`);
    if (!(zu.uhr === P.uhr && zu.nf === 0)) v.push(`ZUNGE: die Bühne stand bei Uhr ${zu.uhr} / nightFactor ${zu.nf} statt ${P.uhr} / 0 (die Probe ist blind)`);
    if (!(zu.zungePx && zu.zungePx[1] >= B.pxMin)) v.push(`ZUNGE: die Zunge misst ${JSON.stringify(zu.zungePx)} Pixel im Bild (Soll ≥ ${B.pxMin} hoch) — die Probe ist blind`);
    const [a, b, m] = [zu.z1 || {}, zu.z2 || {}, zu.mut || {}];
    if (!(a.px > 0 && im(a.grund, B.karte))) v.push(`ZUNGE: (l1) die Wand steht bei Luma ${a.grund} (Soll ${B.karte[0]}–${B.karte[1]}: die Karte am Mittag) über ${a.px} Pixel — die Probe ist blind`);
    else {
        if (!(a.dunkel / a.px <= B.dunkel))
            v.push(
                `ZUNGE: (l1) KEIN STRAHLER VERDUNKELT SEINEN GRUND — ${a.dunkel} von ${a.px} Pixeln der Zunge (${((100 * a.dunkel) / a.px).toFixed(1)} %, Soll ≤ ${100 * B.dunkel} %) sind vor der Karte am Mittag (Luma ${a.grund}) DUNKLER als die Wand ohne sie (tiefster ${a.tiefst}) — ${ZUNGE_ORT}: die Zunge deckt mehr, als sie strahlt (Kirchhoff: Deckung = Strahlung ÷ Quelle)`
            );
        if (!(a.hell / a.px >= B.hell))
            v.push(`ZUNGE: (l1) nur ${a.hell} von ${a.px} Pixeln (${((100 * a.hell) / a.px).toFixed(1)} %, Soll ≥ ${100 * B.hell} %) sind heller als die Wand — am Mittag steht keine Flamme im Bild: ${ZUNGE_ORT}`);
    }
    if (!(b.sollCd > 0 && b.cd >= 0 && b.spitze < b.schulter)) v.push(`ZUNGE: (l2) ungemessen oder im Knie der Kurve (${JSON.stringify(b)}; Soll Spitze < Schulter) — die Probe ist blind`);
    else if (!im(b.cd / b.sollCd, B.staerke))
        v.push(
            `ZUNGE: (l2) DER LEIB TRÄGT DIE LICHTSTÄRKE DES GESETZES — das Bild der Zunge strahlt ${b.cd} cd, ihr Gesetz ${b.sollCd} cd (fachwerk \`FEUER_LEUCHTDICHTE\` × ${b.flaecheM2} m² Leib; Verhältnis ${(b.cd / b.sollCd).toFixed(3)}, Soll ${B.staerke[0]}–${B.staerke[1]}) — ${ZUNGE_ORT}: das Bild trägt nicht die Leuchtdichte, die \`_flammenLicht\` als Schein wirft`
        );
    const [ma, mb] = [m.z1 || {}, m.z2 || {}];
    if (!(ma.px > 0 && ma.dunkel / ma.px >= B.mutDunkel && mb.sollCd > 0 && mb.cd / mb.sollCd <= B.mutStaerke))
        v.push(
            `ZUNGE: MUTANTE-L (\`_flammeOptik\` mit dem Gesetz von vorher: Quelle \`FEUER_LEUCHTDICHTE\`, Deckung ${P.mutDeckung}) reißt nicht — dunkler ${ma.dunkel} von ${ma.px} (Soll ≥ ${100 * B.mutDunkel} %), Lichtstärke × ${mb.sollCd > 0 ? (mb.cd / mb.sollCd).toFixed(3) : "?"} (Soll ≤ ${B.mutStaerke}): der Stoff der Zunge liest \`_flammeOptik\` nicht, oder die Linse ist blind`
        );
    return v;
}
function zungeZeilen(zu) {
    if (!zu || zu.abbruch) return [`Zunge: ${zu ? "ABBRUCH " + zu.abbruch : "lief nicht"}`];
    const j = JSON.stringify;
    const verh = (x) => (x && x.sollCd > 0 ? (x.cd / x.sollCd).toFixed(3) : "?");
    return [
        `Zunge (Uhr ${zu.uhr}, nightFactor ${zu.nf}, Belichtung ${zu.k}, Leinwand ${j(zu.leinwand)}, Zunge ${j(zu.zungePx)} Pixel) · Optik ${j(zu.optik)}`,
        `Zunge (l1) GRUND: ${j(zu.z1)} · MUTANTE-L ${j(zu.mut && zu.mut.z1)}`,
        `Zunge (l2) LICHTSTÄRKE: ${j(zu.z2)} = × ${verh(zu.z2)} · MUTANTE-L ${j(zu.mut && zu.mut.z2)} = × ${verh(zu.mut && zu.mut.z2)}`,
    ];
}
function rauchUrteil(ra) {
    if (!ra) return ["RAUCH: die Probe lief nicht"];
    if (ra.abbruch) return [`RAUCH: ABBRUCH — ${ra.abbruch}`];
    const [v, B, P] = [[], RAUCH_BAND, RAUCH_PROBE];
    const im = (x, [a, b]) => x >= a && x <= b;
    if (ra.gpuFehler?.length) v.push(`RAUCH: ${ra.gpuFehler.length} GPU-Validierungs-Fehler: ${ra.gpuFehler[0]}`);
    if (!(ra.uhr === P.uhr && ra.nf === 1)) v.push(`RAUCH: die Bühne stand bei Uhr ${ra.uhr} / nightFactor ${ra.nf} statt ${P.uhr} / 1 — Sonne und Himmel reden mit (die Probe ist blind)`);
    if (!(ra.radiusPx >= B.pxMin)) v.push(`RAUCH: der Ballen misst ${ra.radiusPx} Pixel Radius im Bild (Soll ≥ ${B.pxMin}) — die Probe ist blind`);
    // (k0) DIE WAND: jede Ecke des Bilds zeigt die Wand der Probe und nichts sonst — schwarz bleibt schwarz (auch im Schein der
    // Quelle), hell steht in ihrem Ton. Reißt eine Ecke, steht etwas im Bild, das nicht zur Probe gehört, oder die Post-Kette hebt
    // das Schwarz: die Zeilen (k1)–(k3) lesen dann eine falsche Wand
    const [ws, wh] = [ra.unten && ra.unten.ecken, ra.koerper && ra.koerper.ecken];
    if (![ws, wh].every((e) => Array.isArray(e) && e.length === 4 && e.every(Number.isFinite))) v.push("RAUCH: WAND — die Ecken des Bilds sind nicht gemessen");
    else
        ["oben links", "oben rechts", "unten links", "unten rechts"].forEach((ecke, i) => {
            if (!(ws[i] <= B.eckeSchwarz))
                v.push(`RAUCH: WAND — die Ecke ${ecke} zeigt vor der SCHWARZEN Wand Luma ${ws[i]} (Soll ≤ ${B.eckeSchwarz}; alle vier ${JSON.stringify(ws)}) — dort steht etwas im Bild, das nicht zur Probe gehört (scripts/diag-post-kette.cjs \`rauchProbe\`: die Schicht der Probe hält die Welt nicht fern), oder die Post-Kette / die Umkehr von \`_nachtAuge\` (stamm/bild-kosten.js) hebt das Schwarz`);
            if (!im(wh[i], B.eckeHell))
                v.push(`RAUCH: WAND — die Ecke ${ecke} zeigt vor der HELLEN Wand Luma ${wh[i]} außerhalb ${B.eckeHell[0]}–${B.eckeHell[1]} (alle vier ${JSON.stringify(wh)}) — dort steht etwas vor der Wand, oder ihr Ton (\`RAUCH_PROBE.wand\` ÷ Belichtung) kommt nicht durch die Tonkurve wie gemessen; die Deckung von (k2) und (k3) teilt durch diese Zahl`);
        });
    const wm = ra.mutWand;
    if (!(Array.isArray(wm) && wm.length === 4 && wm.every(Number.isFinite))) v.push("RAUCH: WAND — MUTANTE-K0 (der Störer in der Schicht der Probe) ist nicht gemessen");
    else if (!(Math.max(wm[2], wm[3]) > B.eckeSchwarz))
        v.push(`RAUCH: WAND — MUTANTE-K0 (der helle Streifen im unteren Viertel, in der Schicht der Probe) zeigt in den unteren Ecken Luma ${wm[2]} / ${wm[3]} ≤ ${B.eckeSchwarz} — die Ecken-Zeile sieht nicht, was vor der Wand steht (blind)`);
    // (k1) UNTERSEITE
    const [li, u, d, mu] = [ra.licht || [], ra.unten, ra.dunkel, ra.mutUnten];
    if (!(li.length === 1 && li[0].quelle === "brand" && li[0].staerke > 0 && li[0].blende === 1))
        v.push(`RAUCH: UNTERSEITE — der Licht-Pool trägt nicht GENAU die Flammen-Fläche der Probe (${JSON.stringify(li)}; \`_leuchtTakt\` über \`_leuchtQuellen\`) — die Probe ist blind`);
    if (!u || !d || !mu) v.push("RAUCH: UNTERSEITE — nicht gemessen");
    else {
        const [vk, vm] = [rauchVerh(u), rauchVerh(mu)];
        if (!(u.unten - d.unten >= B.lichtMin))
            v.push(`RAUCH: UNTERSEITE — die Quelle des Licht-Pools hebt die Unterseite nur von Luma ${d.unten} auf ${u.unten} (Soll ≥ +${B.lichtMin}) — der Rauch liest den Pool nicht (\`_rauchZeichnen\`: \`_leuchtStoff\`), oder die Probe ist blind`);
        else if (!im(vk, B.unten))
            v.push(`RAUCH: UNTERSEITE — über dem Feuer zeigt der Ballen unten Luma ${u.unten}, oben ${u.oben} (Wand ${u.grund}): Verhältnis ${vk} außerhalb ${B.unten[0]}–${B.unten[1]} — ${RAUCH_ORT}: die Normale (q · RAUCH_BILD.woelbung, 1 − ρ²) sieht unten nicht hinab ins Feuer (eine flache Scheibe zum Auge misst ${vm})`);
        if (!(vm < B.unten[0]))
            v.push(`RAUCH: UNTERSEITE — MUTANTE-K1 (\`RAUCH_BILD.woelbung\` 0, die Normale zum Auge) misst unten ${mu.unten}, oben ${mu.oben}: Verhältnis ${vm} ≥ ${B.unten[0]} — die Probe unterscheidet den Ballen nicht von der Scheibe (blind)`);
    }
    // (k2) EIN KÖRPER
    const [k, mk] = [ra.koerper, ra.mutKoerper];
    if (!k || !mk) v.push("RAUCH: EIN KÖRPER — nicht gemessen");
    else {
        if (!(k.px >= B.kPxMin && k.hub >= B.hubMin && k.boden >= B.boden))
            v.push(`RAUCH: EIN KÖRPER — ${k.px} gemeinsame Pixel, Hub des Musters ${k.hub}, derselbe Ballen zweimal ${k.boden} (Soll ≥ ${B.kPxMin} Pixel, Hub ≥ ${B.hubMin}, Boden ≥ ${B.boden}) — das Muster trägt keinen Vergleich (die Probe ist blind)`);
        else if (!(k.gleich >= B.gleich))
            v.push(`RAUCH: EIN KÖRPER — zwei Ballen, die sich decken, tragen an derselben Welt-Stelle ein Muster der Korrelation ${k.gleich} < ${B.gleich} — ${RAUCH_ORT}: das Rausch-Muster steht nicht in der Welt (\`lage\` = Naht-Anker + Versatz × Skala, \`ra.raum\`), jeder Ballen trägt wieder sein eigenes (am Ballen gemessen: ${mk.gleich})`);
        if (!(mk.gleich < B.gleich))
            v.push(`RAUCH: EIN KÖRPER — MUTANTE-K2 (das Muster am Ballen, der Anker der Naht 0) misst die Korrelation ${mk.gleich} ≥ ${B.gleich} — die Probe unterscheidet Welt und Ballen nicht (blind)`);
    }
    // (k3) ZUG
    const [zg, mz] = [ra.zug, ra.mutZug];
    if (!zg || !mz) v.push("RAUCH: ZUG — nicht gemessen");
    else {
        if (!(zg.quer.masse >= B.masseMin && zg.laengs.masse >= B.masseMin))
            v.push(`RAUCH: ZUG — der Ballen deckt ${zg.quer.masse} / ${zg.laengs.masse} seiner Scheibe (Soll ≥ ${B.masseMin}) — kein Umriss (die Probe ist blind)`);
        else {
            if (!im(zg.quer.form, B.quer))
                v.push(`RAUCH: ZUG — mit ${zg.tempo} m/s quer zum Blick misst der Umriss Höhe zu Breite ${zg.quer.form} außerhalb ${B.quer[0]}–${B.quer[1]} — stamm/siedlung-bewohner.js \`_rauchZeichnen\` (Attribut \`aZug\` = Richtung × Streckung, \`RAUCH_BILD.zug\`) oder \`_rauchStoff\` (positionNode längs \`aZug\`): der Ballen ist nicht längs seines Zugs gestreckt`);
            if (!im(zg.laengs.form, B.laengs))
                v.push(`RAUCH: ZUG — mit ${zg.tempo} m/s längs des Blicks misst der Umriss Höhe zu Breite ${zg.laengs.form} außerhalb ${B.laengs[0]}–${B.laengs[1]} — ${RAUCH_ORT}: die Streckung liegt nicht im Blick auf der Fläche (\`cameraViewMatrix\` × \`aZug\`), der Ballen bleibt nicht rund`);
        }
        if (!(mz.quer.form < B.quer[0]))
            v.push(`RAUCH: ZUG — MUTANTE-K3 (\`RAUCH_BILD.zug\` [0, …], ohne Streckung) misst ${mz.quer.form} ≥ ${B.quer[0]} — die Probe unterscheidet den gestreckten Ballen nicht vom runden (blind)`);
    }
    // (k4) BEIDE LESER
    const le = ra.leser;
    if (!le) v.push("RAUCH: BEIDE LESER — nicht gemessen");
    else {
        for (const [name, glied, x] of [["die Fahne des Brands", "stamm/feld-brand.js `_brandRauch`", le.brand], ["der Kamin", "stamm/siedlung-bewohner.js `_updateDorfRauch`", le.kamin], ["der Staub der Druckwelle", "stamm/feld-brand.js `_druckBild`", le.staub]]) {
            if (!x || !(x.teilchen > 0 && x.satz)) v.push(`RAUCH: BEIDE LESER — ${name} (${glied}) legte keinen Satz an (${JSON.stringify(x)}) — die Probe ist blind`);
            else {
                if (!x.bauer) v.push(`RAUCH: BEIDE LESER — der Stoff, den ${name} (${glied}) zeichnet, stammt nicht aus \`_rauchStoff\` — ein Zwilling baut den Rauch neben dem EINEN Bild`);
                else if (!(x.steigMs > 0 && Math.abs(x.steigMs - x.soll) < 1e-3))
                    v.push(`RAUCH: BEIDE LESER — ${name} (${glied}) reicht \`_rauchStoff\` das Steigen ${x.steigMs} m/s statt ${x.soll} — das Muster steigt nicht mit seiner Quelle`);
                if (!x.zug) v.push(`RAUCH: BEIDE LESER — die Teilchen von ${name} (${glied}) tragen keinen Zug \`zx, zy, zz\` in m/s — \`_rauchZeichnen\` streckt sie nicht`);
            }
        }
        if (!/ohne Steigen/.test(String(le.bruch)))
            v.push(`RAUCH: BEIDE LESER — \`_rauchStoff\` ohne \`steigMs\` bricht nicht laut (${le.bruch}) — ein Leser ohne Steigen zeichnete still ein stehendes Muster`);
        if (le.zwilling !== null)
            v.push(`RAUCH: BEIDE LESER — die Attribute des Rauchs liest der Stamm außerhalb von \`_rauchZeichnen\` / \`_rauchStoff\`: ${le.zwilling} — ein Zwilling zeichnet Rauch neben dem EINEN Bild`);
    }
    // (k5) EIN PROGRAMM: je Satz die Programm-Paare (Vertex/Fragment) der Render-Objekte seines Zeichners
    const pg = ra.programm;
    if (!pg) v.push("RAUCH: EIN PROGRAMM — nicht gemessen");
    else {
        const saetze = [["die Fahne des Brands", pg.brand], ["der Kamin", pg.kamin], ["der Staub der Druckwelle", pg.staub]];
        const leer = saetze.filter(([, x]) => !Array.isArray(x) || !x.length);
        if (leer.length) v.push(`RAUCH: EIN PROGRAMM — ${leer.map(([n]) => n).join(", ")}: kein Render-Objekt mit Pipeline (${JSON.stringify(pg)}) — die Probe ist blind`);
        else {
            const soll = pg.brand.join(" ");
            const fremd = saetze.filter(([, x]) => x.join(" ") !== soll);
            if (fremd.length)
                v.push(`RAUCH: EIN PROGRAMM — ${fremd.map(([n, x]) => `${n} zeichnet mit dem Programm ${x.join(" ")}`).join(", ")} statt mit dem der Fahne (${soll}) — eine Zahl des Satzes steht im Shader-Text (${RAUCH_ORT}: Steigen und Skala sind Uniformen des Satzes), jeder Satz baut beim ersten Ballen sein eigenes Programm`);
            if (!Array.isArray(pg.mutante) || !pg.mutante.length || pg.mutante.join(" ") === soll)
                v.push(`RAUCH: EIN PROGRAMM — MUTANTE-K5 (der Stoff des Staubs trägt sein Steigen als Zahl im Shader-Text) zeichnet mit ${JSON.stringify(pg.mutante)} wie die Fahne (${soll}) — die Probe unterscheidet die Programme nicht (blind)`);
        }
    }
    return v;
}
// (k) die Mess-Zeilen des Rauchs (der Lauf schreibt sie, grün wie rot)
function rauchZeilen(ra) {
    if (!ra || ra.abbruch) return [`Rauch: ${ra ? "ABBRUCH " + ra.abbruch : "lief nicht"}`];
    const B = RAUCH_BAND;
    const j = JSON.stringify;
    return [
        `Rauch (Uhr ${ra.uhr}, nightFactor ${ra.nf}, Belichtung ${ra.k}, Leinwand ${ra.leinwand.join("×")}, Radius ${ra.radiusPx} Pixel) · Licht-Pool ${j(ra.licht)}`,
        `Rauch (k0) WAND: die Ecken (oben links, oben rechts, unten links, unten rechts) schwarz ${j(ra.unten.ecken)} (Soll ≤ ${B.eckeSchwarz}) · hell ${j(ra.koerper.ecken)} (Soll ${B.eckeHell[0]}–${B.eckeHell[1]}) · MUTANTE-K0 der Störer in der Schicht der Probe: ${j(ra.mutWand)}`,
        `Rauch (k1) UNTERSEITE: unten ${ra.unten.unten} / oben ${ra.unten.oben} (Wand ${ra.unten.grund}) = ${rauchVerh(ra.unten)} (Soll ${B.unten[0]}–${B.unten[1]}) · ohne Quelle unten ${ra.dunkel.unten} / oben ${ra.dunkel.oben} · MUTANTE-K1 woelbung 0: unten ${ra.mutUnten.unten} / oben ${ra.mutUnten.oben} = ${rauchVerh(ra.mutUnten)} · Quelle ${ra.quelleCd} cd/m² bei k ${ra.k} · AUSKUNFT bei der Leuchtdichte des Gesetzes (Stärke ${ra.gesetz ? ra.gesetz.staerke : "—"}): unten ${ra.gesetz ? ra.gesetz.unten : "—"} / oben ${ra.gesetz ? ra.gesetz.oben : "—"}`,
        `Rauch (k2) EIN KÖRPER: Korrelation ${ra.koerper.gleich} (Soll ≥ ${B.gleich}; ${ra.koerper.px} Pixel, Hub ${ra.koerper.hub}, Wand ${ra.koerper.wand}, derselbe zweimal ${ra.koerper.boden}) · MUTANTE-K2 am Ballen: ${ra.mutKoerper.gleich} (${ra.mutKoerper.px} Pixel, Hub ${ra.mutKoerper.hub})`,
        `Rauch (k3) ZUG ${ra.zug.tempo} m/s: quer ${j(ra.zug.quer)} (Soll ${B.quer[0]}–${B.quer[1]}) · längs ${j(ra.zug.laengs)} (Soll ${B.laengs[0]}–${B.laengs[1]}) · MUTANTE-K3 ohne Streckung: quer ${j(ra.mutZug.quer)}`,
        `Rauch (k4) BEIDE LESER: ${j(ra.leser)}`,
        `Rauch (k5) EIN PROGRAMM (Vertex/Fragment je Satz): ${j(ra.programm)}`,
    ];
}

function urteil(z) {
    const v = [];
    const schritte = z.schritte || [];
    if (z.abbruch) v.push(`ABBRUCH: die Bühne brach ab — ${z.abbruch}`);
    if (schritte.length < 4) v.push(`WEICHE: nur ${schritte.length} von 4 Schritten liefen`);
    for (const s of schritte) {
        for (const f of s.fehler || []) v.push(`WEICHE: ${s.name} — ${f}`);
        if (!(s.tiefenKopien > 0))
            v.push(`WEICHE: ${s.name} — der Tiefen-Leser kopierte nie (die Wand ist blind für die Szenen-Tiefe)`);
        if (s.direkt) {
            if (s.tiefe !== true)
                v.push(`TIEFE: ${s.name} — der Direktpfad zeichnet ohne Tiefe (renderer.depth ${s.tiefe})`);
        } else {
            if (s.tiefe !== false)
                v.push(`TIEFE: ${s.name} — die Post-Kette trägt eine Leinwand-Tiefe (renderer.depth ${s.tiefe})`);
            if (s.leinwandTiefeGpu)
                v.push(`TIEFE: ${s.name} — die GPU-Textur der Leinwand-Tiefe lebt in der Post-Kette weiter`);
        }
        const ab = s.abbild || { fehlt: true };
        if (ab.fehlt) v.push(`ABBILD: ${s.name} — kein Tiefen-Abbild (die Leser der Szenen-Tiefe lesen nichts)`);
        else {
            // halbe Breite, ganze Höhe: je Texel das waagrechte Pixel-Paar (die Zeile bleibt ganz — das Wasser liest den Grund
            // seiner Zeile, gemessen am 2×2-Maximum (e) 6 Stufen und (f) 7 Kanten-Pixel bis 14 Luma daneben)
            const halb = [Math.ceil((ab.leinwand || [0, 0])[0] / 2), (ab.leinwand || [0, 0])[1]];
            if (ab.format !== "r32float" || !ab.groesse || ab.groesse[0] !== halb[0] || ab.groesse[1] !== halb[1])
                v.push(
                    `ABBILD: ${s.name} — ${ab.format} ${(ab.groesse || []).join("×")} statt r32float ${halb.join("×")} (halbe Breite, ganze Höhe)`
                );
            if (!(Math.abs(ab.mitte - ab.soll) < 1e-4))
                v.push(
                    `ABBILD: ${s.name} — an der Bild-Mitte ${ab.mitte} statt der Kisten-Tiefe ${ab.soll} (das Abbild trägt die Szene nicht)`
                );
        }
        const m = s.mitte;
        if (!m || !(m[0] > 1.5 * m[1] && m[0] > 40))
            v.push(
                `TIEFE: ${s.name} — die Bild-Mitte ist ${JSON.stringify(m)}, nicht die nahe rote Kiste (Tiefentest fehlt)`
            );
    }
    const b = z.buehne || {};
    if (!(b.wasserY < b.eisNull))
        v.push(`BÜHNE: ihr Wasser (${b.wasserY} m) liegt über der Eis-Linie (${b.eisNull} m) — Saum und Wasser messen Eis`);
    // DIE BÜHNE IN DER LUFT (rauch-buehne): ihr Wasser (y0 − 3) steht über dem Boden des Orts. Die Formel in `buehne`
    // (y0 = min(boden + 160, eisNull − 7)) legte sie seit w28-spiegel-eis (EIS.uebergang 20 → 13: eisNull über Genesis 101,74 →
    // 88,86 m) 8,45 m in die Erde (Wasser 78,86 m, Boden 90,31 m) — jede Probe auf ihr maß unter dem Grund, und keine Zeile sagte es
    if (!(b.wasserY > b.boden))
        v.push(
            `BÜHNE: im Boden — ihr Wasser (${b.wasserY} m) liegt unter dem Boden des Orts (${b.boden} m; die Eis-Linie ${b.eisNull} m, ` +
                "y0 = min(boden + 160, eisNull − 7) in `buehne`) — Saum, Wasser, Zunge, Flamme, Tor und Knie messen in der Erde"
        );
    const w = z.wasser;
    const abst = (a, b) => (a && b ? Math.max(...[0, 1, 2].map((c) => Math.abs(a[c] - b[c]))) : NaN);
    if (!w) v.push("WASSER: die Probe Abbild gegen r184s Viewport-Tiefe lief nicht");
    else {
        if (!((w.umgehaengt || [])[0] > 0 && w.umgehaengt[1] > 0))
            v.push(
                `WASSER: das Bühnen-Wasser wurde nicht umgehängt (${JSON.stringify(w.umgehaengt)}) — die Probe vergleicht nichts`
            );
        if (!(abst(w.abbild, w.zurueck) <= WASSER_RAUSCHEN))
            v.push(
                `WASSER: zweimal das Abbild bei festen Uhren ${JSON.stringify(w.abbild)} / ${JSON.stringify(w.zurueck)} — der Rausch-Boden trägt keinen Vergleich`
            );
        if (!(abst(w.abbild, w.ohneGrund) >= WASSER_TIEFE_MIN))
            v.push(
                `WASSER: mit und ohne Grund ${JSON.stringify(w.abbild)} / ${JSON.stringify(w.ohneGrund)} — die Farbe hängt nicht an der Tiefe (die Probe ist blind)`
            );
        if (!(abst(w.abbild, w.r184) <= WASSER_TOL))
            v.push(
                `WASSER: mit dem Abbild ${JSON.stringify(w.abbild)}, mit r184s Viewport-Tiefe ${JSON.stringify(w.r184)} (Soll ≤ ${WASSER_TOL} je Kanal) — das Wasser liest eine andere Tiefe`
            );
    }
    const sm = z.saum;
    if (!sm) v.push("SAUM: die Probe auf ungerader Leinwand lief nicht");
    else if (sm.abbruch) v.push(`SAUM: ABBRUCH — ${sm.abbruch}`);
    else {
        const lw = sm.leinwand || [0, 0];
        if (!(lw[0] % 2 === 1 && lw[1] % 2 === 1))
            v.push(`SAUM: die Leinwand ${lw.join("×")} ist nicht ungerade (die Probe ist blind)`);
        if (!(sm.kanten >= SAUM_KANTEN_MIN && sm.paritaeten === 2))
            v.push(
                `SAUM: ${sm.kanten} Kanten-Pixel in ${sm.paritaeten} Paritäten — kein Gegenstand vor dem Wasser (die Probe ist blind)`
            );
        else if (!(sm.abweichend <= SAUM_MAX))
            v.push(
                `SAUM: ${sm.abweichend} von ${sm.kanten} Kanten-Pixeln links am Gegenstand weichen bis ${sm.dMax} Luma ab — das Abbild liest auf ungerader Leinwand den Nachbar-Block (ein heller Saum)`
            );
        if (sm.gpuFehler?.length)
            v.push(`SAUM: ${sm.gpuFehler.length} GPU-Validierungs-Fehler: ${sm.gpuFehler[0]}`);
    }
    // (g) DAS RAHMEN-ZIEL: der Direktpfad legt es an (sonst ist die Probe blind), und die Regel der Band nennt es; in der
    // Post-Kette — vor dem ersten Ausflug, nach der Rückkehr und am Ende — lebt keines
    const rahmenRot = (wo, rz) => {
        if (!rz) return v.push(`RAHMEN-ZIEL: ${wo} — nicht gemessen (die Wand ist blind)`);
        if (rz.ziele > 0 || rz.n > 0)
            v.push(
                `RAHMEN-ZIEL: ${wo} — ${rz.ziele} r184-Rahmen-Ziel(e) leben in der Post-Kette weiter: ` +
                    (BAND.rahmenZielBefunde(null, { erzeuger: [{ erzeuger: "r184-ausgabe", mb: rz.mb, n: rz.n }] })
                        .map((b) => b.text)
                        .join("") || `${rz.ziele} Ziel(e) ohne Textur`)
            );
    };
    for (const s of schritte) {
        if (s.name === "Render-Fehler") continue; // der Rückfall des Spiels bleibt im Direktpfad, sein Ziel ist in Gebrauch
        if (!s.direkt) rahmenRot(s.name, s.rahmenZiel);
        else if (
            !(s.rahmenZiel && s.rahmenZiel.ziele >= 1 && s.rahmenZiel.n >= 1) ||
            BAND.rahmenZielBefunde(null, {
                erzeuger: [{ erzeuger: "r184-ausgabe", mb: s.rahmenZiel.mb, n: s.rahmenZiel.n }],
            }).length !== 1
        )
            v.push(
                `RAHMEN-ZIEL: ${s.name} — r184 legte kein Rahmen-Ziel an, oder die Band nennt es nicht ` +
                    `(${JSON.stringify(s.rahmenZiel)}) — die Probe ist blind`
            );
    }
    if (schritte.length >= 4) rahmenRot("am Ende (nach Wasser und Godrays)", z.rahmenEnde);
    // (g) die Drift: ohne r184s Hörer fällt das Ziel trotzdem (die Schritt-Prüfung oben: „Post-Kette nach Drift" trägt 0), und
    // der Abschied meldet es LAUT — eine ERROR-Zeile von `_rahmenZielAbschied` außerhalb der Drift ist rot
    const DRIFT = /RAHMEN-ZIEL: r184s Abschied am Leinwand-Ziel fehlt/;
    const d = z.drift;
    if (!d) v.push("RAHMEN-ZIEL: die Drift-Probe lief nicht (der zweite Abschied steht ohne Wand)");
    else if (!(d.hoererWeg >= 1))
        v.push("RAHMEN-ZIEL: am Leinwand-Ziel hängt kein r184-Abschied (`_frameBufferTargets.delete(`) — Vendor-Drift, die Probe ist blind");
    else if (!(d.fehler || []).some((f) => DRIFT.test(f)))
        v.push(`RAHMEN-ZIEL: ohne r184s Hörer fiel der Abschied STILL (${JSON.stringify(d.fehler)}) — die Drift bräche nur im Log`);
    const rahmenErrors = (z.konsolenFehler || []).filter((t) => /RAHMEN-ZIEL/.test(t));
    const erwartet = d ? (d.fehler || []).filter((f) => DRIFT.test(f)).length : 0;
    if (rahmenErrors.length > erwartet)
        v.push(
            `RAHMEN-ZIEL: ${rahmenErrors.length - erwartet} ERROR-Zeile(n) von \`_rahmenZielAbschied\` außerhalb der Drift-Probe: ${rahmenErrors[0]}`
        );
    // (a) DER ERZWUNGENE BRUCH: der Render-Fehler, den die Wand selbst in die Kette wirft, bricht LAUT beim Namen
    // (`_loopRender` → `_stoffBruch`, ERROR „STOFF: die Post-Kette …" mit der Ursache) — GENAU EINMAL; still (0) ist rot,
    // ein zweiter ist rot. Bis zur Nachbesserung 2 zählte die Konsolen-Wand ihn als fremd (die CI voll 6/11 rot).
    const fang = schritte.find((s) => s.name === "Render-Fehler");
    const erzwungen = (z.konsolenFehler || []).filter((x) => ERZWUNGEN.test(x));
    if (fang && erzwungen.length !== 1)
        v.push(
            `WEICHE: der erzwungene Render-Fehler der Kette meldet ${erzwungen.length}× „STOFF: die Post-Kette …" (Soll genau 1 — ${erzwungen.length ? "doppelt" : "er bricht STILL"})`
        );
    for (const t of (z.konsolenFehler || []).filter((x) => !/RAHMEN-ZIEL/.test(x) && !ERZWUNGEN.test(x)))
        v.push(`KONSOLE: ${t}`);
    if (fang && !fang.direkt) v.push("WEICHE: nach dem Render-Fehler der Kette fährt der Loop nicht den Direktpfad");
    if (z.gpuFehler?.length) v.push(`GPU: ${z.gpuFehler.length} Validierungs-Fehler: ${z.gpuFehler[0]}`);
    if (!z.ausgabe) v.push("SHADER: kein Fragment der Ausgabe gefunden (die Linse ist blind)");
    else for (const x of SK.kostenUrteil(z.ausgabe, BUDGET_AUSGABE, "SHADER: Ausgabe der Post-Kette")) v.push(x);
    const dk = z.dunkel;
    if (!dk) v.push("DUNKEL: die Probe lief nicht");
    else if (!(dk.k1 === 1 && dk.k4 === 4))
        v.push(`DUNKEL: die Belichtung stand bei ${dk.k1} / ${dk.k4} statt 1 / 4 (die Probe ist blind)`);
    else if (!(Math.min(dk.luma1, dk.luma4) >= DUNKEL_LUMA_MIN))
        v.push(
            `DUNKEL: dunkles Szenen-Licht (0,05 bei Belichtung 1, 0,0125 bei 4) zeigt Luma ${dk.luma1} / ${dk.luma4} (Soll ≥ ${DUNKEL_LUMA_MIN}) — die Kette schneidet dunkles Licht ab (der Kontrast des Gradings vor der Belichtung)`
        );
    else if (!(Math.abs(dk.luma1 - dk.luma4) <= DUNKEL_TOL))
        v.push(
            `DUNKEL: dasselbe belichtete Licht zeigt bei Belichtung 1 Luma ${dk.luma1}, bei 4 Luma ${dk.luma4} (Soll ≤ ${DUNKEL_TOL} Abstand) — das Grading hängt an der Belichtung`
        );
    if (dk && dk.nachtFaktor !== 1)
        v.push(`DUNKEL: die Nacht stand bei nightFactor ${dk.nachtFaktor} statt 1 (die Probe ist blind)`);
    else if (dk && !(dk.lumaNacht >= DUNKEL_LUMA_MIN))
        v.push(
            `DUNKEL: das Licht der Nacht (${DUNKEL_NACHT_LICHT} bei Belichtung 1, nightFactor 1) zeigt Luma ${dk.lumaNacht} (Soll ≥ ${DUNKEL_LUMA_MIN}) — der Kontrast des Gradings schwärzt die Nacht (Post-Kette 25c: er fadet nicht über nightFactor)`
        );
    // (j) DIE FLAMME VOR DEM AUGE DER NACHT
    const fl = z.flamme;
    if (!fl) v.push("FLAMME: die Probe lief nicht");
    else if (fl.abbruch) v.push(`FLAMME: ABBRUCH — ${fl.abbruch}`);
    else {
        // (j2) die Kurve der Seite: ihre Schulter aus `BELICHTUNG`, ihr Platz am Renderer, der Deckel des Szenen-Ziels, die Wurzel der Flamme
        const kz = fl.kurve || {};
        const kurveDa = kz.platz === true && kz.schulter > 0 && kz.deckel > 0 && fl.kelvin0 > 0;
        if (!kurveDa)
            v.push(
                `FLAMME: KONSUM — die Kurve der Seite ist nicht gemessen (${JSON.stringify({ kurve: fl.kurve, kelvin0: fl.kelvin0 })}: Soll der Platz \`BELICHTUNG.kurve\` am Renderer, \`BELICHTUNG.schulter\`, \`_vorBelichtung().deckel\`, \`BRAND.bild.flamme.kelvin[0]\`) — die Probe ist blind`
            );
        for (const [name, band] of Object.entries(FLAMME_BAND)) {
            const tn = (fl.toene || {})[name];
            const N = name.toUpperCase();
            if (!tn) {
                v.push(`FLAMME: ${N} — nicht gemessen`);
                continue;
            }
            if (!(tn.k === FLAMME_PROBE.k && tn.nfTag === 0 && tn.nfNacht === 1 && tn.nfOhne === 1)) {
                v.push(
                    `FLAMME: ${N} — die Belichtung stand bei ${tn.k} statt ${FLAMME_PROBE.k} oder nightFactor bei ${tn.nfTag} / ${tn.nfNacht} / ${tn.nfOhne} statt 0 / 1 / 1 (die Probe ist blind)`
                );
                continue;
            }
            const [d, dM, f] = [kanalAbstand(tn.tag, tn.nacht), kanalAbstand(tn.tag, tn.ohne), hsv(tn.tag)];
            if (band.nachtSatt) {
                const [sN, sO] = [hsv(tn.nacht).satt, hsv(tn.ohne).satt];
                if (!(sN >= band.nachtSatt))
                    v.push(
                        `FLAMME: ${N} (${tn.kelvin} K) — in der Nacht ${JSON.stringify(tn.nacht)} mit Sättigung ${sN} < ${band.nachtSatt} (am Tag ${JSON.stringify(tn.tag)}) — die Flamme steht nicht vor dem Auge der Nacht: jemand änderte \`_nachtAuge\`, ohne dass seine Umkehr (\`_nachtAuge(farbe, true)\`) folgt`
                    );
                if (!(sO < band.nachtSatt))
                    v.push(
                        `FLAMME: ${N} — MUTANTE-J (der Ton OHNE die Umkehr, nightFactor 1) zeigt ${JSON.stringify(tn.ohne)} mit Sättigung ${sO} ≥ ${band.nachtSatt} — das Auge der Nacht entsättigt die Flamme nicht (die Probe ist blind)`
                    );
            } else if (!(d <= FLAMME_TOL))
                v.push(
                    `FLAMME: ${N} (${tn.kelvin} K) — am Tag ${JSON.stringify(tn.tag)}, in der Nacht ${JSON.stringify(tn.nacht)} (Δ ${d} > ${FLAMME_TOL} je Kanal) — die Flamme steht nicht vor dem Auge der Nacht: jemand änderte \`_nachtAuge\`, ohne dass seine Umkehr (\`_nachtAuge(farbe, true)\`) folgt, oder die Umkehr klemmt (ein Kanal unter Leuchtdichte × Stäbchen-Anteil: diesen Ton zeigt das Auge der Nacht nicht)`
                );
            if (band.blende && !(dM <= FLAMME_TOL))
                v.push(
                    `FLAMME: ${N} — OHNE die Umkehr (nightFactor 1) zeigt ${JSON.stringify(tn.ohne)} gegen den Tag ${JSON.stringify(tn.tag)} (Δ ${dM} > ${FLAMME_TOL}) — das Auge der Nacht nimmt der Flamme (${tn.cd} cd/m², photopisch) die Farbe: sie steht nicht bei der Leuchtdichte ihres Gesetzes (fachwerk \`FEUER_LEUCHTDICHTE\` ÷ \`EINHEIT_LX\`, die Tafel in stamm/feld-brand.js \`_brandFlammenZeichnen\`), das Auge urteilt nicht in cd/m² (\`NACHT_AUGE.zapfenCd\`), oder die Blende am Bild (\`NACHT_AUGE.bildZapfen\` in \`_nachtAuge\`, stamm/bild-kosten.js) fehlt — der Feuerschein steht rosa`
                );
            if (!band.nachtSatt && !band.blende && !(dM > FLAMME_TOL))
                v.push(
                    `FLAMME: ${N} — MUTANTE-J (der Ton OHNE die Umkehr, nightFactor 1) zeigt ${JSON.stringify(tn.ohne)} gegen den Tag ${JSON.stringify(tn.tag)} (Δ ${dM} ≤ ${FLAMME_TOL}) — das Auge der Nacht entsättigt die Flamme nicht (die Probe ist blind)`
                );
            if (!(f.ton >= band.ton[0] && f.ton <= band.ton[1] && f.satt >= band.satt))
                v.push(
                    `FLAMME: ${N} (${tn.kelvin} K) liest sich nicht als Feuer — ${JSON.stringify(tn.tag)}: Farbton ${f.ton}° (Soll ${band.ton[0]}–${band.ton[1]}°, ${band.name}), Sättigung ${f.satt} (Soll ≥ ${band.satt})`
                );
            if (band.konsum && kurveDa) {
                const soll = flammenSoll(tn.kelvin, fl.kelvin0, tn.k, kz);
                const dK = [0, 1, 2].map((c) => +Math.abs(tn.tag[c] - soll[c]).toFixed(2));
                if (!(Math.max(...dK) <= FLAMME_KONSUM_TOL))
                    v.push(
                        `FLAMME: ${N} (${tn.kelvin} K) KONSUM — am Schirm ${JSON.stringify(tn.tag)}, Soll ${JSON.stringify(soll)} (Δ ${dK.join(" / ")} > ${FLAMME_KONSUM_TOL} je Kanal) = welt-licht \`tonKurve\` (Schulter ${kz.schulter}, am größten Kanal) an lichtFarbe(${tn.kelvin} K) × (K/${fl.kelvin0})⁴ × \`FEUER_LEUCHTDICHTE\` ÷ \`EINHEIT_LX\` ÷ Luma × k ${tn.k} (Deckel ${kz.deckel} am größten Kanal, \`_vorBelichtung().deckeln\`), sRGB — die Ausgabe ist nicht die EINE Kurve am Quellen-Ton, oder die Flamme steht nicht bei ihrem Datum`
                    );
            }
        }
        const q = fl.quelle || {};
        if (q.zwilling !== null)
            v.push(
                `FLAMME: EINE QUELLE — die Schwellen des Auges (\`NACHT_AUGE\`) liest der Stamm außerhalb von \`_nachtAuge\`: ${q.zwilling} — ein Zwilling rechnet das Auge der Nacht neben dem EINEN Glied`
            );
        if (q.augeLiest !== true) v.push("FLAMME: EINE QUELLE — `_nachtAuge` liest `NACHT_AUGE.staebchenCd` nicht (die Absenz des Zwillings misst nichts — die Probe ist blind)");
        if (q.uniform !== true) v.push("FLAMME: EINE QUELLE — die Uniform von `_nachtAuge()` ist nicht `postProcessingUniforms.nightFactor` (zwei Nächte: die Umkehr folgt einer anderen als die Kette)");
        if (q.kette !== true)
            v.push("FLAMME: EINE QUELLE — `_ensurePostProcessing` ruft `_nachtAuge(farbe)` nicht (die Post-Kette rechnet das Auge der Nacht selbst)");
        if (q.umkehr !== true)
            v.push("FLAMME: EINE QUELLE — `_brandFlammenZeichnen` ruft die Umkehr `_nachtAuge(…, true)` nicht (die Flamme steht nicht vor dem Auge der Nacht)");
        // (A3) STETIG AM KNIE
        for (const x of knieUrteil(fl.knie)) v.push(x);
        // (j) DAS TOR: das Zielbild der Membran vor dem Auge der Nacht
        for (const x of torUrteil(fl.tor)) v.push(x);
    }
    // (k) DER RAUCH
    for (const x of rauchUrteil(z.rauch)) v.push(x);
    // (l) DIE ZUNGE
    for (const x of zungeUrteil(z.zunge)) v.push(x);
    const zg = z.zugang || { abbruch: "lief nicht" };
    const t = zg.tritanopie || {};
    if (zg.abbruch || zg.ausTraegt) v.push(`ZUGANG: ${zg.abbruch || "aus trägt den Knoten der Farbsicht (vp-0611g)"}`);
    else if (!(zg.anTraegt && zg.himmel.includes("himmel") && t.himmelPx > 2000 && t.kiste > t.kistePx / 5))
        v.push(`ZUGANG: blind ${JSON.stringify(zg)}`);
    for (const art of ["tritanopie", "deuteranopie"]) if (zg[art]?.himmel) v.push(`ZUGANG: ${art} färbt den Himmel ${JSON.stringify(zg[art])}`);
    const g = z.godray || {};
    if (!(g.staerke > 0)) v.push(`GODRAYS: die Sonne im Bild gibt Stärke ${g.staerke} (die Probe ist blind)`);
    else if (!(g.aenderungPct >= GODRAY_MIN_PCT))
        v.push(
            `GODRAYS: mit der Sonne im Bild ändern die Godrays ${g.aenderungPct} % der Pixel (Soll ≥ ${GODRAY_MIN_PCT}) — der Zweig trägt nicht`
        );
    else if (!(g.rauschenPct < g.aenderungPct / 2))
        v.push(
            `GODRAYS: der Rausch-Boden ${g.rauschenPct} % liegt zu nah an der Änderung ${g.aenderungPct} % (die Probe ist blind)`
        );
    // DIE LAGE (w28-lichtschacht): der Marsch zielt dorthin, wo die Sonne im Bild steht — bis dahin y gespiegelt (Dachfuge)
    const lg = g.lage || {};
    if (!lg.ziel || !lg.sonne) v.push(`GODRAY-LAGE: nicht gemessen ${JSON.stringify(lg)}`);
    else if (!(Math.abs(lg.sonne[1] - 0.5) > GODRAY_LAGE_MITTE))
        v.push(`GODRAY-LAGE: die Sonne steht bei ${lg.sonne} zu nah an der Bildmitte (die Probe ist blind)`);
    else if (!(Math.hypot(lg.ziel[0] - lg.sonne[0], lg.ziel[1] - lg.sonne[1]) <= GODRAY_LAGE_MAX))
        v.push(
            `GODRAY-LAGE: der Marsch zielt auf ${lg.ziel}, die Sonne steht im Bild bei ${lg.sonne} (screenUV) — die Lage im Schirm ist nicht die des Passes (\`_schirmUV\`)`
        );
    // DER SCHACHT (w28-lichtschacht, `_godrayStufe`): mit der Sonne im Bild zeichnet der Pass, ohne Stärke nie; sein Fragment tastet
    // je Schritt die Farbe und lädt die Tiefe
    const sc = g.schacht || {};
    if (!(sc.laeufeMit > 0))
        v.push(`GODRAY-SCHACHT: mit der Sonne im Bild lief der Pass ${sc.laeufeMit}× — die Ausgabe liest ein stehendes Ziel`);
    if (sc.laeufeOhne !== 0) v.push(`GODRAY-SCHACHT: ohne Stärke lief der Pass ${sc.laeufeOhne}× — er tastet, ohne zu zeigen`);
    const sk = z.schacht;
    if (!sk) v.push("GODRAY-SCHACHT: kein Fragment des Passes gefunden (die Linse ist blind)");
    else if (!(sc.schritte > 0 && sk.proben >= sc.schritte && sk.ladungen >= sc.schritte))
        v.push(
            `GODRAY-SCHACHT: ${sk.proben} Farb-Abtastungen und ${sk.ladungen} Tiefen-Ladungen je Texel bei ${sc.schritte} Schritten — je Schritt fehlt die Farbe oder die Himmels-Maske`
        );
    return v;
}

// der grüne Lauf der Flamme: das Soll der EINEN Kurve am Quellen-Ton, auf 8 Bit gerundet
const FLAMME_GRUEN = (K) => flammenSoll(K, 3000, 20000, { schulter: quelle().W.BELICHTUNG.schulter, deckel: quelle().W.BELICHTUNG.deckel }).map(Math.round);
function selbsttest() {
    const fehler = SK.selbsttest().map((s) => "Shader-Kosten-Linse: " + s);
    const ausgabe = {
        einstieg: "main",
        abtastungen: { gesamt: 14, unbedingt: 9, zweig: 5, schleife: 0 },
        schleifen: 0,
        rauschen: 0,
    };
    const schritt = (name, direkt) => ({
        name,
        direkt,
        fehler: [],
        tiefenKopien: 4,
        tiefe: direkt,
        leinwandTiefeGpu: false,
        rahmenZiel: direkt ? { ziele: 1, n: 2, mb: 0.01 } : { ziele: 0, n: 0, mb: 0 },
        mitte: [190, 40, 40],
        abbild: { format: "r32float", groesse: [16, 24], leinwand: [32, 24], mitte: 0.98, soll: 0.98 },
    });
    const gruen = {
        schritte: [
            schritt("Post-Kette", false),
            schritt("Direktpfad", true),
            schritt("Post-Kette zurück", false),
            schritt("Render-Fehler", true),
            schritt("Post-Kette nach Drift", false),
        ],
        drift: {
            hoererWeg: 1,
            fehler: ["RAHMEN-ZIEL: r184s Abschied am Leinwand-Ziel fehlt (Vendor-Drift) — das Ziel fällt ohne ihn, der Hörer bleibt"],
        },
        konsolenFehler: [
            "[AnazhRealm V18.543] [ERROR] STOFF: die Post-Kette (Render-Lauf: TRAA · Bloom · Grading) — der Schirm zeichnet direkt — gate:post-kette — erzwungener Render-Fehler der Kette",
            "[AnazhRealm V18.536] [ERROR] RAHMEN-ZIEL: r184s Abschied am Leinwand-Ziel fehlt (Vendor-Drift) — das Ziel fällt ohne ihn, der Hörer bleibt",
        ],
        gpuFehler: [],
        ausgabe,
        godray: {
            staerke: 0.6,
            aenderungPct: 14,
            rauschenPct: 0,
            lage: { ziel: [0.52, 0.31], sonne: [0.51, 0.33] },
            schacht: { schritte: 20, laeufeMit: 6, laeufeOhne: 0 },
        },
        schacht: { einstieg: "main", proben: 20, ladungen: 20 },
        buehne: { boden: 90.3, wasserY: 147.1, eisNull: 157.1 },
        wasser: {
            umgehaengt: [1, 1],
            abbild: [60, 90, 80],
            r184: [60, 91, 80],
            zurueck: [60, 90, 80],
            ohneGrund: [20, 40, 50],
        },
        saum: { leinwand: [321, 241], kanten: 30, abweichend: 0, dMax: 3, paritaeten: 2, gpuFehler: [] },
        rahmenEnde: { ziele: 0, n: 0, mb: 0 },
        dunkel: { k1: 1, k4: 4, luma1: 8, luma4: 8, nachtFaktor: 1, lumaNacht: 6 },
        flamme: {
            toene: {
                // KERN und MANTEL: der Ton des Feuers in der EINEN Kurve (gemessen GTX 1050, licht-eine-skala, k 20 000: [255,183,109] /
                // [255,159,64]) — photopisch, Tag = Nacht = ohne Umkehr; seit nacht-lichter mit dem Weg zu Weiß gerechnet (`flammenSoll`,
                // [255,196,142] / [255,176,119]); GLIMMEN: gerechnet bei k 20 000 (der Mantel in 0,158 cd/m²)
                kern: { kelvin: 3000, cd: 15000, k: 20000, nfTag: 0, nfNacht: 1, nfOhne: 1, tag: FLAMME_GRUEN(3000), nacht: FLAMME_GRUEN(3000), ohne: FLAMME_GRUEN(3000) },
                mantel: { kelvin: 2350, cd: 15000, k: 20000, nfTag: 0, nfNacht: 1, nfOhne: 1, tag: FLAMME_GRUEN(2350), nacht: FLAMME_GRUEN(2350), ohne: FLAMME_GRUEN(2350) },
                glimmen: { kelvin: 2350, cd: 0.1581, k: 20000, nfTag: 0, nfNacht: 1, nfOhne: 1, tag: [171, 100, 10], nacht: [169, 97, 35], ohne: [131, 84, 45] },
            },
            quelle: { uniform: true, augeLiest: true, zwilling: null, kette: true, umkehr: true },
            // (j2) die Kurve der Seite: die Schulter aus welt-licht.js (dieselbe Datei wie die Seite), der Deckel und die Wurzel wie gemessen
            kurve: { platz: true, schulter: quelle().W.BELICHTUNG.schulter, deckel: quelle().W.BELICHTUNG.deckel },
            kelvin0: 3000,
            // (A3) der Verlauf am Knie, mit der Rechen-Form gerechnet und auf 8 Bit gerundet
            knie: {
                n: KNIE_PROBE.n,
                leinwand: 320,
                k: 20000,
                nf: 0,
                toene: Object.fromEntries(
                    [["grau", [1, 1, 1]], ["satt", quelle().FW.lichtFarbe(FLAMME_PROBE.mantelK)]].map(([n, ton]) => [n, { ton, reihe: knieReihe(ton, KNIE_PROBE.n, quelle().W.BELICHTUNG.schulter).map((p) => p.map(Math.round)) }])
                ),
            },
            // (j) Flamme und Tor: die Zahlen des gemessenen Laufs (GTX 1050, echte Karte, w28-glut-nacht), `ohne` = MUTANTE-TOR im selben Lauf
            tor: {
                gestalt: "drachentor",
                rufe: 1,
                zeilen: 2,
                belicht: 0.00005,
                toene: {
                    gold: { wert: [0.9, 0.62, 0.25], k: 20000, nfTag: 0, nfNacht: 1, nfOhne: 1, tag: [235, 197, 125], nacht: [235, 197, 125], ohne: [231.5, 198, 135] },
                    dunkelrot: { wert: [0.12, 0.012, 0.01], k: 20000, nfTag: 0, nfNacht: 1, nfOhne: 1, tag: [93, 9, 2], nacht: [93, 8, 2], ohne: [46, 4, 3] },
                },
            },
        },
        zugang: {
            himmel: ["himmel"],
            anTraegt: true,
            tritanopie: { himmel: 0, himmelPx: 4700, kiste: 90, kistePx: 100 },
        },
        rauch: jsonKlon(RAUCH_GEMESSEN.kopf),
        zunge: jsonKlon(ZUNGE_GEMESSEN.kopf),
    };
    const RM = RAUCH_GEMESSEN;
    const ZG = ZUNGE_GEMESSEN;
    const faelle = [
        // (l) die Zunge: der Täter von main zuerst (seine Zahlen), dann die blinden Proben
        ["die Zunge von main deckt wie ein schwarzer Körper (die Zahl des Täters)", (z) => (z.zunge.z1 = jsonKlon(ZG.taeter.z1)), /ZUNGE: \(l1\) KEIN STRAHLER VERDUNKELT SEINEN GRUND — 2304 von 11529 Pixeln/],
        ["die Zunge von main trägt ein Viertel ihrer Lichtstärke (die Zahl des Täters)", (z) => (z.zunge.z2 = jsonKlon(ZG.taeter.z2)), /ZUNGE: \(l2\) DER LEIB TRÄGT DIE LICHTSTÄRKE DES GESETZES — das Bild der Zunge strahlt 2513 cd, ihr Gesetz 10412 cd/],
        ["am Mittag steht keine Flamme im Bild", (z) => (z.zunge.z1.hell = 504), /ZUNGE: \(l1\) nur 504 von 20145 Pixeln/],
        ["MUTANTE-L reißt nicht (der Stoff liest `_flammeOptik` nicht)", (z) => (z.zunge.mut = jsonKlon({ z1: ZG.kopf.z1, z2: ZG.kopf.z2 })), /ZUNGE: MUTANTE-L .* reißt nicht — dunkler 0 von 20145/],
        ["die Zunge lief nicht", ["zunge"], /ZUNGE: die Probe lief nicht/],
        ["die Zunge am Abend (blind)", (z) => (z.zunge.uhr = 0.8), /ZUNGE: die Bühne stand bei Uhr 0\.8 \/ nightFactor 0 statt 0\.5 \/ 0/],
        ["die Wand ist nicht die Karte (blind)", (z) => (z.zunge.z1.grund = 40), /ZUNGE: \(l1\) die Wand steht bei Luma 40 /],
        ["die Lichtstärke im Knie der Kurve gemessen (blind)", (z) => (z.zunge.z2.spitze = 0.9), /ZUNGE: \(l2\) ungemessen oder im Knie der Kurve/],
        ["die Zunge zu klein im Bild (blind)", (z) => (z.zunge.zungePx = [30, 40]), /ZUNGE: die Zunge misst \[30,40\] Pixel im Bild/],
        ["Direktpfad stürzt", (z) => (z.schritte[1].fehler = ["TypeError: Invalid value used as weak map key"]), /Direktpfad — TypeError/],
        ["Direktpfad ohne Tiefe", ["schritte.1.tiefe=", false], /Direktpfad zeichnet ohne Tiefe/],
        ["Leinwand-Tiefe in der Kette", ["schritte.2.tiefe=", true], /trägt eine Leinwand-Tiefe/],
        ["GPU-Textur bleibt", ["schritte.2.leinwandTiefeGpu=", true], /GPU-Textur der Leinwand-Tiefe lebt/],
        ["Rahmen-Ziel bleibt nach dem Ausflug (0710-9: band nach zerlegen, +23,7 MB)", (z) => (z.schritte[2].rahmenZiel = { ziele: 1, n: 2, mb: 23.73 }), /RAHMEN-ZIEL: Post-Kette zurück — 1 r184-Rahmen-Ziel\(e\) leben .*23\.7 MB in 2 Texturen — Rahmen-Ziel des Direktpfads/],
        ["Rahmen-Ziel am Ende", (z) => (z.rahmenEnde = { ziele: 1, n: 0, mb: 0 }), /RAHMEN-ZIEL: am Ende .* 1 Ziel\(e\) ohne Textur/],
        ["Direktpfad ohne Rahmen-Ziel (blind)", (z) => (z.schritte[1].rahmenZiel = { ziele: 0, n: 0, mb: 0 }), /RAHMEN-ZIEL: Direktpfad — r184 legte kein Rahmen-Ziel an/],
        ["Rahmen-Ziel ungemessen", ["schritte.0.rahmenZiel"], /nicht gemessen/],
        ["Drift: das Ziel bleibt ohne r184s Hörer", (z) => (z.schritte[4].rahmenZiel = { ziele: 1, n: 2, mb: 0.88 }), /RAHMEN-ZIEL: Post-Kette nach Drift — 1 r184-Rahmen-Ziel/],
        ["Drift: der Abschied fällt still", (z) => (z.drift.fehler = []), /ohne r184s Hörer fiel der Abschied STILL/],
        ["Drift: kein r184-Hörer zu finden (Vendor-Drift)", ["drift.hoererWeg=", 0], /kein r184-Abschied .* die Probe ist blind/],
        ["Drift-Probe fehlt", ["drift"], /die Drift-Probe lief nicht/],
        ["ERROR von _rahmenZielAbschied außerhalb der Drift", (z) => z.konsolenFehler.push("[AnazhRealm V18.536] [ERROR] RAHMEN-ZIEL: r184s Abschied … (Vendor-Drift)"), /1 ERROR-Zeile\(n\) von `_rahmenZielAbschied` außerhalb der Drift-Probe/],
        ["der erzwungene Render-Fehler bricht still", (z) => (z.konsolenFehler = z.konsolenFehler.filter((x) => !/STOFF:/.test(x))), /WEICHE: der erzwungene Render-Fehler der Kette meldet 0× .*er bricht STILL/],
        ["der erzwungene Render-Fehler bricht doppelt", (z) => z.konsolenFehler.push(z.konsolenFehler[0]), /WEICHE: der erzwungene Render-Fehler der Kette meldet 2× .*doppelt/],
        ["ein fremder Stoff-Bruch der Seite", (z) => z.konsolenFehler.push("[AnazhRealm V18.543] [ERROR] STOFF: die Post-Kette (Render-Lauf) — Knoten fehlt"), /KONSOLE: .*STOFF: die Post-Kette \(Render-Lauf\) — Knoten fehlt/],
        ["eine fremde ERROR-Zeile der Seite", (z) => z.konsolenFehler.push("[AnazhRealm V18.536] [ERROR] Post-Processing fehlt"), /KONSOLE: .*Post-Processing fehlt/],
        ["Abbild fehlt", (z) => (z.schritte[0].abbild = { fehlt: true }), /kein Tiefen-Abbild/],
        ["Abbild in voller Auflösung", (z) => (z.schritte[1].abbild.groesse = [32, 24]), /statt r32float 16×24/],
        ["Abbild als 2×2-Block (die Zeile halbiert)", (z) => (z.schritte[1].abbild.groesse = [16, 12]), /statt r32float 16×24/],
        ["Abbild leer", ["schritte.2.abbild.mitte=", 1], /trägt die Szene nicht/],
        ["Wasser liest eine andere Tiefe (vec4-Weg)", (z) => (z.wasser.r184 = [75, 118, 105]), /das Wasser liest eine andere Tiefe/],
        ["Wasser-Probe blind", (z) => (z.wasser.ohneGrund = z.wasser.abbild), /Probe ist blind/],
        // stoffe-k3-phasen a3b87db1: die Bühne 160 m über Genesis (247,3 m) über der Eis-Linie 157,1 m
        ["Bühne im Eis", ["buehne.wasserY=", 247.3], /über der Eis-Linie/],
        // rauch-buehne, die Mutante „uebergang 13 mit der alten Formel“: w28-spiegel-eis (fe8045224b) über Genesis — eisNull 88,86 m
        // unter dem Boden 90,31 m, y0 = eisNull − 7 = 81,86 m, das Wasser 78,86 m
        ["Bühne im Boden (uebergang 13, die alte Formel)", (z) => Object.assign(z.buehne, { wasserY: 78.86, eisNull: 88.86 }), /BÜHNE: im Boden — ihr Wasser \(78\.86 m\) liegt unter dem Boden des Orts \(90\.3 m/],
        ["Wasser nicht umgehängt", (z) => (z.wasser.umgehaengt = [0, 1]), /nicht umgehängt/],
        ["Wasser-Probe fehlt", ["wasser"], /lief nicht/],
        ["Saum auf ungerader Leinwand (Gegenprüfung 0710-3: 37 von 561 Kanten-Pixeln bis +25 Luma)", ["saum", { abweichend: 14, dMax: 25 }], /Nachbar-Block/],
        ["Saum-Probe auf gerader Leinwand (blind)", (z) => (z.saum.leinwand = [320, 240]), /nicht ungerade/],
        ["kein Gegenstand vor dem Wasser (blind)", ["saum", { kanten: 0, paritaeten: 0 }], /kein Gegenstand vor dem Wasser/],
        ["ferne Kiste vorn", (z) => (z.schritte[1].mitte = [40, 190, 40]), /Tiefentest fehlt/],
        ["Tiefen-Leser blind", ["schritte.0.tiefenKopien=", 0], /kopierte nie/],
        ["Fang ohne Direktpfad", ["schritte.3.direkt=", false], /nicht den Direktpfad/],
        ["GPU-Validierung", (z) => (z.gpuFehler = ["Attachment state mismatch"]), /Validierungs-Fehler/],
        ["Godrays unbedingt", ["ausgabe.abtastungen", { unbedingt: 29, zweig: 4 }], /29 unbedingte Abtastungen/],
        ["Shader blind", ["ausgabe=", null], /kein Fragment der Ausgabe/],
        ["Bühne bricht ab", ["abbruch=", "TypeError: x"], /ABBRUCH/],
        ["Godray-Zweig trägt nicht", ["godray.aenderungPct=", 0], /der Zweig trägt nicht/],
        ["Godray-Probe blind", ["godray.staerke=", 0], /die Probe ist blind/],
        // Dachfuge 16.11. (GTX 6f3c713d): die Sonnen-Lage y nach oben — der Marsch zielte auf die an der Mitte gespiegelte Sonne
        ["Godray-Lage gespiegelt (Dachfuge)", ["godray.lage", { ziel: [0.52, 0.69], sonne: [0.51, 0.33] }], /GODRAY-LAGE: der Marsch zielt auf 0\.52,0\.69/],
        ["Godray-Lage an der Mitte (blind)", ["godray.lage", { ziel: [0.5, 0.5], sonne: [0.5, 0.52] }], /GODRAY-LAGE: .*zu nah an der Bildmitte/],
        ["Godray-Lage ungemessen", ["godray.lage"], /GODRAY-LAGE: nicht gemessen/],
        // w28-lichtschacht: der Marsch als eigener Pass — er läuft nur mit Stärke und liest je Schritt Farbe und Tiefe
        ["Godray-Schacht tastet ohne Stärke", ["godray.schacht.laeufeOhne=", 2], /GODRAY-SCHACHT: ohne Stärke lief der Pass 2×/],
        ["Godray-Schacht steht", ["godray.schacht.laeufeMit=", 0], /GODRAY-SCHACHT: mit der Sonne im Bild lief der Pass 0×/],
        ["Godray-Schacht ohne Himmels-Maske", ["schacht.ladungen=", 0], /GODRAY-SCHACHT: 20 Farb-Abtastungen und 0 Tiefen-Ladungen/],
        ["Godray-Schacht ungemessen", ["schacht"], /GODRAY-SCHACHT: kein Fragment des Passes/],
        ["Grading schneidet dunkles Licht ab", ["dunkel", { luma1: 0, luma4: 0 }], /DUNKEL: .*schneidet dunkles Licht ab/],
        ["Grading hängt an der Belichtung", ["dunkel", { luma1: 12, luma4: 7 }], /DUNKEL: .*hängt an der Belichtung/],
        ["Dunkel-Probe fehlt", ["dunkel"], /DUNKEL: die Probe lief nicht/],
        ["Kontrast schwärzt die Nacht", ["dunkel.lumaNacht=", 0], /DUNKEL: das Licht der Nacht .*Post-Kette 25c/],
        ["Nacht-Probe blind", ["dunkel.nachtFaktor=", 0], /DUNKEL: die Nacht stand bei nightFactor 0/],
        // (j) w28-brand-kern: das Auge der Nacht las den Bild-Ton der Flamme als 0,7 cd/m² und nahm ihr 30 % Farbe (cremeweiß)
        ["Kern nicht vor dem Auge der Nacht (der Stand von main: ohne Blende, ohne Umkehr)", (z) => (z.flamme.toene.kern.nacht = [240, 200, 150]), /FLAMME: KERN \(3000 K\) — .*steht nicht vor dem Auge der Nacht/],
        ["der Täter von main: das Auge wäscht den Kern über Bild-Weiß (ohne Umkehr Δ 29)", (z) => Object.assign(z.flamme.toene.kern, { tag: [249, 184, 122], nacht: [249, 184, 122], ohne: [240, 200, 151] }), /FLAMME: KERN — OHNE die Umkehr .*Δ 29 > 6.*`NACHT_AUGE\.bildZapfen`.*rosa/],
        ["Kern ohne Umkehr ungemessen", (z) => delete z.flamme.toene.kern.ohne, /FLAMME: KERN — OHNE die Umkehr .*> 6/],
        // licht-eine-skala: der Mantel steht bei der Leuchtdichte des Gesetzes photopisch — fällt er ins mesopische Band (ein Ton
        // ÷ Belichtung wie vor P8, die Luma zweimal geteilt), nimmt ihm das Auge ohne Umkehr die Farbe (die Zahl vor der Welle)
        ["der Mantel fällt ins mesopische Band (ohne Umkehr entsättigt)", (z) => (z.flamme.toene.mantel.ohne = [163, 106, 59]), /FLAMME: MANTEL — OHNE die Umkehr .*Δ 92 > 6.*`FEUER_LEUCHTDICHTE`/],
        // (j2) KONSUM — MUTANTE-M1: die Kurve staucht je Kanal statt am größten (der Kern läuft nach Weiß); MUTANTE-M2: das Soll bei
        // einer fremden Temperatur (der Mantel bei 2 600 K gerechnet, bei 2 350 K gemessen); der Stand von main (der Fuß fraß das Blau)
        ["MUTANTE-M1: die Kurve je Kanal (der Kern weiß)", (z) => (z.flamme.toene.kern.tag = flammenSoll(3000, 3000, 20000, z.flamme.kurve, { kanalweise: true }).map(Math.round)), /FLAMME: KERN \(3000 K\) KONSUM — am Schirm \[255,255,25\d\], Soll \[255,195\.\d+,142\.\d+\]/],
        ["MUTANTE-M1: ein gelb-weißes Bild", (z) => (z.flamme.toene.mantel.tag = [255, 230, 160]), /FLAMME: MANTEL \(2350 K\) KONSUM — am Schirm \[255,230,160\].*Δ 0 \/ 53\.\d+ \/ 40\.\d+ > 2/],
        ["MUTANTE-M2: der Mantel bei 2 600 K gerechnet", ["flamme.toene.mantel.kelvin=", 2600], /FLAMME: MANTEL \(2600 K\) KONSUM — am Schirm \[255,176,119\], Soll /],
        ["der Mantel am Stand von main (der Fuß fraß das Blau)", (z) => (z.flamme.toene.mantel.tag = [200, 118, 18]), /FLAMME: MANTEL \(2350 K\) KONSUM — am Schirm \[200,118,18\]/],
        ["Kurve der Seite ungemessen (blind)", ["flamme.kurve"], /FLAMME: KONSUM — die Kurve der Seite ist nicht gemessen .*blind/],
        ["die Kurve steht nicht auf ihrem Platz (blind)", ["flamme.kurve.platz=", false], /FLAMME: KONSUM — die Kurve der Seite ist nicht gemessen/],
        ["Wurzel der Flamme ungemessen (blind)", ["flamme.kelvin0"], /FLAMME: KONSUM — die Kurve der Seite ist nicht gemessen/],
        // (A3) STETIG AM KNIE — MUTANTE: die Kurve springt über der Schulter um 0,02
        ["MUTANTE-A3: die Kurve springt am Knie (grau)", (z) => (z.flamme.knie.toene.grau.reihe = knieReihe([1, 1, 1], KNIE_PROBE.n, z.flamme.kurve.schulter, { sprung: 0.02 }).map((p) => p.map(Math.round))), /KNIE: GRAU — zwischen Spalte \d+ und \d+ \(Eingang 0\.8\d* × Weiß\) springt das Bild um [2-9]/],
        ["MUTANTE-A3: die Kurve springt am Knie (Planck-Ton)", (z) => (z.flamme.knie.toene.satt.reihe = knieReihe(z.flamme.knie.toene.satt.ton, KNIE_PROBE.n, z.flamme.kurve.schulter, { sprung: 0.02 }).map((p) => p.map(Math.round))), /KNIE: SATT — zwischen Spalte \d+ und \d+ .*springt das Bild um [2-9]/],
        ["der Verlauf steht nicht im Bild (blind)", (z) => (z.flamme.knie.toene.grau.reihe = z.flamme.knie.toene.grau.reihe.map(() => [180, 180, 180])), /KNIE: GRAU — die Reihe trägt 320 von 320 .*blind/],
        ["zu wenig Stützstellen (blind)", ["flamme.knie.n=", 32], /KNIE: 32 Stützstellen .*blind/],
        ["Knie bei Nacht gemessen (blind)", ["flamme.knie.nf=", 1], /KNIE: .*nightFactor 1 .*blind/],
        ["Knie ungemessen", ["flamme.knie.toene.satt"], /KNIE: SATT — nicht gemessen/],
        ["Knie-Probe bricht ab", ["flamme.knie.abbruch=", "TypeError: x"], /KNIE: ABBRUCH — TypeError/],
        ["Knie-Probe fehlt", ["flamme.knie"], /KNIE: die Probe lief nicht/],
        ["die Flamme brennt nachts weiß (die Klemme am Bild-Weiß)", (z) => (z.flamme.toene.kern.tag = z.flamme.toene.kern.nacht = z.flamme.toene.kern.ohne = [255, 255, 255]), /FLAMME: KERN \(3000 K\) liest sich nicht als Feuer — \[255,255,255\].*Sättigung 0 /],
        ["Glimmen entsättigt in der Nacht", (z) => (z.flamme.toene.glimmen.nacht = z.flamme.toene.glimmen.ohne), /FLAMME: GLIMMEN \(2350 K\) — .*ohne dass seine Umkehr/],
        ["Flammen-Mutante reißt nicht (blind)", (z) => (z.flamme.toene.glimmen.ohne = z.flamme.toene.glimmen.nacht), /FLAMME: GLIMMEN — MUTANTE-J .*Sättigung 0\.79\d ≥ 0\.75.*die Probe ist blind/],
        ["das Glimmen am Stand von main (Sättigung 0,573)", (z) => (z.flamme.toene.glimmen.nacht = [199, 115, 85]), /FLAMME: GLIMMEN \(2350 K\) — .*Sättigung 0\.573 < 0\.75/],
        ["Glimmen ungemessen", ["flamme.toene.glimmen"], /FLAMME: GLIMMEN — nicht gemessen/],
        ["Flammen-Probe ohne Nacht (blind)", ["flamme.toene.mantel.nfNacht=", 0], /FLAMME: MANTEL — .*nightFactor bei 0 \/ 0 \/ 1/],
        ["Flammen-Probe bei fremder Belichtung (blind)", ["flamme.toene.kern.k=", 1], /FLAMME: KERN — die Belichtung stand bei 1 statt 20000/],
        ["Kern cremeweiß", (z) => (z.flamme.toene.kern.tag = z.flamme.toene.kern.nacht = [250, 235, 200]), /FLAMME: KERN \(3000 K\) liest sich nicht als Feuer .*Sättigung 0\.2/],
        ["Mantel gelb statt orange-rot", (z) => (z.flamme.toene.mantel.tag = z.flamme.toene.mantel.nacht = [220, 190, 40]), /FLAMME: MANTEL \(2350 K\) liest sich nicht als Feuer — .*Farbton 50°/],
        // 46f69d7b: die Rechnung stand inline in der Post-Kette — neben dem Glied wäre sie der Zwilling
        ["ein Zwilling liest die Stäbchen-Schwelle", ["flamme.quelle.zwilling=", "stamm/bild-kosten.js:2431 `.staebchenCd`"], /EINE QUELLE — .*außerhalb von `_nachtAuge`: stamm\/bild-kosten\.js:2431/],
        ["Zwilling ungemessen", ["flamme.quelle.zwilling"], /EINE QUELLE — .*außerhalb von `_nachtAuge`: undefined/],
        ["das Glied liest die Schwelle nicht (blind)", ["flamme.quelle.augeLiest=", false], /`_nachtAuge` liest `NACHT_AUGE\.staebchenCd` nicht .*blind/],
        ["zwei Uniformen der Nacht", ["flamme.quelle.uniform=", false], /die Uniform von `_nachtAuge\(\)` ist nicht `postProcessingUniforms\.nightFactor`/],
        ["die Post-Kette rechnet das Auge selbst", ["flamme.quelle.kette=", false], /`_ensurePostProcessing` ruft `_nachtAuge\(farbe\)` nicht/],
        ["die Flamme ohne Umkehr im Stamm", ["flamme.quelle.umkehr=", false], /`_brandFlammenZeichnen` ruft die Umkehr/],
        ["Flammen-Ton ungemessen", ["flamme.toene.mantel"], /FLAMME: MANTEL — nicht gemessen/],
        ["Flammen-Probe bricht ab", ["flamme.abbruch=", "TypeError: r._nachtAuge is not a function"], /FLAMME: ABBRUCH — TypeError/],
        ["Flammen-Probe fehlt", ["flamme"], /FLAMME: die Probe lief nicht/],
        // (j) w28-tor-nacht: das Auge der Nacht nahm dem Zielbild des Tors nachts die Farbe (grauweiß statt gold) — jede Zahl von
        // MUTANTE-TOR an der Stelle des Kopfs ist rot beim Täter
        ["Tor-Zielbild nicht vor dem Auge der Nacht (die Zahl von MUTANTE-TOR)", (z) => (z.flamme.tor.toene.gold.nacht = z.flamme.tor.toene.gold.ohne), /TOR: GOLD — .*Δ 10 > 6 je Kanal.*stamm\/siedlung-tor\.js `_membranGraph`, das Zielbild \(`ziel`\) ruft die Umkehr/],
        ["Tor-Zielbild dunkelt nachts (die Zahl von MUTANTE-TOR)", (z) => (z.flamme.tor.toene.dunkelrot.nacht = z.flamme.tor.toene.dunkelrot.ohne), /TOR: DUNKELROT — .*Δ 47 > 6 je Kanal.*stamm\/siedlung-tor\.js `_membranGraph`/],
        ["Dunkelrot am Stand von main (die Umkehr klemmt, grau-rot)", (z) => (z.flamme.tor.toene.dunkelrot.nacht = [111, 35, 35]), /TOR: DUNKELROT — .*Δ 33 > 6 je Kanal/],
        ["die Umkehr schießt über (der Stäbchen-Anteil am gesehenen Ton gelesen)", (z) => (z.flamme.tor.toene.dunkelrot.nacht = [119, 12, 2]), /TOR: DUNKELROT — .*Δ 26 > 6 je Kanal/],
        ["MUTANTE-TOR reißt am Gold nicht (blind)", (z) => (z.flamme.tor.toene.gold.ohne = z.flamme.tor.toene.gold.tag), /TOR: GOLD — MUTANTE-TOR .*die Probe ist blind/],
        ["MUTANTE-TOR reißt am Dunkelrot nicht (blind)", (z) => (z.flamme.tor.toene.dunkelrot.ohne = z.flamme.tor.toene.dunkelrot.nacht), /TOR: DUNKELROT — MUTANTE-TOR .*Δ 1 ≤ 6.*blind/],
        ["das Tor ruft die Umkehr nicht", ["flamme.tor.rufe=", 0], /TOR: EINE QUELLE — .*stamm\/siedlung-tor\.js `_membranGraph`, das Zielbild \(`ziel`\) die Umkehr `_nachtAuge\(…, true\)` 0×/],
        ["Tor-Rufe ungemessen", ["flamme.tor.rufe"], /TOR: EINE QUELLE — .*undefined×/],
        ["Tor-Probe ohne Nacht (blind)", ["flamme.tor.toene.gold.nfNacht=", 0], /TOR: GOLD — .*nightFactor bei 0 \/ 0 \/ 1/],
        ["Tor-Probe bei fremder Belichtung (blind)", ["flamme.tor.toene.dunkelrot.k=", 1], /TOR: DUNKELROT — die Belichtung stand bei 1 statt 20000/],
        ["der Atlas der Probe trägt die Zeile nicht (blind)", (z) => (z.flamme.tor.toene.gold.tag = z.flamme.tor.toene.gold.nacht = [0, 0, 0]), /TOR: GOLD — der Ton der Probe liest sich am Tag nicht als gold/],
        ["das Tor liest die Zeile des Nachbarn (blind)", (z) => (z.flamme.tor.toene.dunkelrot.tag = [235, 198, 125]), /TOR: DUNKELROT — der Ton der Probe liest sich am Tag nicht als dunkelrot: .*Farbton 39\.8°/],
        ["der Atlas der Probe ohne Belichtung (blind)", ["flamme.tor.belicht=", 1], /TOR: der Atlas der Probe trägt 2 Zeilen .*mit 1 \(Soll 0\.00005\)/],
        ["Tor-Ton ungemessen", ["flamme.tor.toene.dunkelrot"], /TOR: DUNKELROT — nicht gemessen/],
        ["Tor-Probe bricht ab", ["flamme.tor.abbruch=", "TypeError: r._torZielEinsetzen is not a function"], /TOR: ABBRUCH — TypeError/],
        ["Tor-Probe fehlt", ["flamme.tor"], /TOR: die Probe lief nicht/],
        // (k0) w28-rauch-probe: die Wand in den Ecken — die Zahlen der alten Probe mit einem Streifen Welt im unteren Viertel
        // (GTX 1050, b7b0f8fe: Ecken-Mittel 16,51 vor Schwarz, 86 vor Hell; der Zug z598 maß 9,69 an der GTX 1060)
        ["Welt im Bild vor der schwarzen Wand (z598)", ["rauch.unten.ecken=", [0, 0, 33.02, 33.01]], /RAUCH: WAND — die Ecke unten links zeigt vor der SCHWARZEN Wand Luma 33.02 .*das nicht zur Probe gehört/],
        ["die Post-Kette hebt das Schwarz der Wand", ["rauch.unten.ecken=", [9.69, 9.69, 9.69, 9.69]], /RAUCH: WAND — die Ecke oben rechts zeigt vor der SCHWARZEN Wand Luma 9.69/],
        ["Welt im Bild vor der hellen Wand", ["rauch.koerper.ecken=", [139.04, 139.04, 33.02, 33.01]], /RAUCH: WAND — die Ecke unten rechts zeigt vor der HELLEN Wand Luma 33.01 außerhalb 134–144/],
        ["MUTANTE-K0 reißt nicht (blind)", ["rauch.mutWand=", [0, 0, 0, 0]], /RAUCH: WAND — MUTANTE-K0 .*blind/],
        ["Ecken der Wand ungemessen", ["rauch.unten.ecken"], /RAUCH: WAND — die Ecken des Bilds sind nicht gemessen/],
        ["MUTANTE-K0 ungemessen", ["rauch.mutWand"], /RAUCH: WAND — MUTANTE-K0 .*nicht gemessen/],
        // (k) w28-rauch-bild: jede Mutanten-Zahl des Laufs an der Stelle des Kopfs ist rot beim Täter
        ["Rauch als flache Scheibe zum Auge (die Zahl von MUTANTE-K1)", (z) => (z.rauch.unten = jsonKlon(RM.kopf.mutUnten)), /RAUCH: UNTERSEITE — über dem Feuer .*stamm\/siedlung-bewohner\.js `_rauchStoff`: die Normale/],
        ["Rauch-Muster je Ballen (die Zahl von MUTANTE-K2)", (z) => (z.rauch.koerper.gleich = RM.kopf.mutKoerper.gleich), /RAUCH: EIN KÖRPER — zwei Ballen, die sich decken, .*das Rausch-Muster steht nicht in der Welt/],
        ["Rauch ohne Streckung (die Zahl von MUTANTE-K3)", (z) => (z.rauch.zug.quer = jsonKlon(RM.kopf.mutZug.quer)), /RAUCH: ZUG — mit .* quer zum Blick .*nicht längs seines Zugs gestreckt/],
        ["Rauch längs des Blicks gestreckt", (z) => (z.rauch.zug.laengs.form = RM.kopf.zug.quer.form), /RAUCH: ZUG — mit .* längs des Blicks .*bleibt nicht rund/],
        ["MUTANTE-K1 reißt nicht (blind)", (z) => (z.rauch.mutUnten = jsonKlon(RM.kopf.unten)), /RAUCH: UNTERSEITE — MUTANTE-K1 .*blind/],
        ["MUTANTE-K2 reißt nicht (blind)", (z) => (z.rauch.mutKoerper.gleich = RM.kopf.koerper.gleich), /RAUCH: EIN KÖRPER — MUTANTE-K2 .*blind/],
        ["MUTANTE-K3 reißt nicht (blind)", (z) => (z.rauch.mutZug.quer = jsonKlon(RM.kopf.zug.quer)), /RAUCH: ZUG — MUTANTE-K3 .*blind/],
        ["der Rauch liest den Licht-Pool nicht", (z) => (z.rauch.unten = Object.assign(jsonKlon(RM.kopf.dunkel), { grund: 0 })), /RAUCH: UNTERSEITE — die Quelle des Licht-Pools hebt die Unterseite nur/],
        ["der Licht-Pool ohne die Quelle der Probe (blind)", ["rauch.licht=", []], /RAUCH: UNTERSEITE — der Licht-Pool trägt nicht GENAU die Flammen-Fläche/],
        ["Rauch-Probe am Tag (blind)", ["rauch.nf=", 0], /RAUCH: die Bühne stand bei Uhr 0 \/ nightFactor 0/],
        ["Rauch-Muster ohne Hub (blind)", ["rauch.koerper.hub=", 0.001], /RAUCH: EIN KÖRPER — .*das Muster trägt keinen Vergleich/],
        ["Rauch-Bild rauscht (derselbe Ballen zweimal)", ["rauch.koerper.boden=", 0.6], /RAUCH: EIN KÖRPER — .*derselbe Ballen zweimal 0\.6/],
        ["Rauch ohne Umriss (blind)", ["rauch.zug.quer.masse=", 0], /RAUCH: ZUG — der Ballen deckt 0 /],
        ["Ballen zu klein im Bild (blind)", ["rauch.radiusPx=", 6], /RAUCH: der Ballen misst 6 Pixel/],
        ["die Fahne zeichnet einen Zwillings-Stoff", ["rauch.leser.brand.bauer=", false], /RAUCH: BEIDE LESER — der Stoff, den die Fahne des Brands \(stamm\/feld-brand\.js `_brandRauch`\) zeichnet, stammt nicht aus `_rauchStoff`/],
        ["der Kamin zeichnet einen Zwillings-Stoff", ["rauch.leser.kamin.bauer=", false], /RAUCH: BEIDE LESER — der Stoff, den der Kamin \(stamm\/siedlung-bewohner\.js `_updateDorfRauch`\) zeichnet, stammt nicht aus `_rauchStoff`/],
        ["der Kamin reicht ein fremdes Steigen", ["rauch.leser.kamin.steigMs=", 2.5], /RAUCH: BEIDE LESER — der Kamin .* das Steigen 2\.5 m\/s statt 1\.2/],
        ["die Fahne ohne Zug an den Teilchen", ["rauch.leser.brand.zug=", false], /RAUCH: BEIDE LESER — die Teilchen von die Fahne des Brands .*tragen keinen Zug/],
        ["der Kamin legt keinen Satz an (blind)", ["rauch.leser.kamin", { teilchen: 0, satz: false }], /RAUCH: BEIDE LESER — der Kamin .* legte keinen Satz an/],
        ["der Bauer ohne Steigen bricht still", ["rauch.leser.bruch=", null], /RAUCH: BEIDE LESER — `_rauchStoff` ohne `steigMs` bricht nicht laut/],
        ["ein Zwilling liest die Attribute des Rauchs", ["rauch.leser.zwilling=", "stamm/feld-leben.js:3190 `\"aRauch\"`"], /RAUCH: BEIDE LESER — .*außerhalb von `_rauchZeichnen` \/ `_rauchStoff`: stamm\/feld-leben\.js:3190/],
        ["Rauch-Zwilling ungemessen", ["rauch.leser.zwilling"], /RAUCH: BEIDE LESER — .*außerhalb .*: undefined/],
        // der DRITTE Leser und (k5) EIN PROGRAMM (druckwelle-bild)
        ["der Staub zeichnet einen Zwillings-Stoff", ["rauch.leser.staub.bauer=", false], /RAUCH: BEIDE LESER — der Stoff, den der Staub der Druckwelle \(stamm\/feld-brand\.js `_druckBild`\) zeichnet, stammt nicht aus `_rauchStoff`/],
        ["der Staub reicht ein fremdes Steigen", ["rauch.leser.staub.steigMs=", 2.5], /RAUCH: BEIDE LESER — der Staub der Druckwelle .* das Steigen 2\.5 m\/s statt 0\.19/],
        ["der Staub legt keinen Satz an (blind)", (z) => (z.rauch.leser.staub = { teilchen: 0, satz: false }), /RAUCH: BEIDE LESER — der Staub der Druckwelle .* legte keinen Satz an/],
        ["der Staub baut sein eigenes Programm", (z) => (z.rauch.programm.staub = ["v41/f88"]), /RAUCH: EIN PROGRAMM — der Staub der Druckwelle zeichnet mit dem Programm v41\/f88 statt mit dem der Fahne \(v41\/f77\) — eine Zahl des Satzes steht im Shader-Text \(stamm\/siedlung-bewohner\.js `_rauchStoff`/],
        ["jeder Satz baut sein eigenes Programm", (z) => Object.assign(z.rauch.programm, { kamin: ["v52/f81"], staub: ["v60/f88"] }), /RAUCH: EIN PROGRAMM — der Kamin zeichnet mit dem Programm v52\/f81, der Staub der Druckwelle zeichnet mit dem Programm v60\/f88 statt mit dem der Fahne/],
        ["ein Satz zeichnet kein Render-Objekt (blind)", (z) => (z.rauch.programm.kamin = []), /RAUCH: EIN PROGRAMM — der Kamin: kein Render-Objekt mit Pipeline .* die Probe ist blind/],
        ["die Programme ungemessen", (z) => delete z.rauch.programm, /RAUCH: EIN PROGRAMM — nicht gemessen/],
        ["MUTANTE-K5 ungesehen (blind)", (z) => (z.rauch.programm.mutante = ["v41/f77"]), /RAUCH: EIN PROGRAMM — MUTANTE-K5 .* wie die Fahne \(v41\/f77\) — die Probe unterscheidet die Programme nicht \(blind\)/],
        ["GPU-Validierung im Rauch", (z) => (z.rauch.gpuFehler = ["Binding size mismatch"]), /RAUCH: 1 GPU-Validierungs-Fehler/],
        ["Rauch-Probe bricht ab", ["rauch.abbruch=", "TypeError: r._rauchZeichnen is not a function"], /RAUCH: ABBRUCH — TypeError/],
        ["Rauch-Probe fehlt", ["rauch"], /RAUCH: die Probe lief nicht/],
        // vp-0611g (OMEN, w15-farbsicht 1c39aada): der Zweig der Farbsicht stand aus im Graphen, die Tritanopie färbte den Himmel
        ["aus trägt die Farbsicht", ["zugang.ausTraegt=", true], /Knoten der Farbsicht/],
        ["Tritanopie färbt den Himmel", ["zugang.tritanopie", { himmel: 9 }], /tritanopie färbt/],
        ["Zugang blind", ["zugang.tritanopie", { kiste: 0 }], /ZUGANG: blind/],
        ["Zugang fehlt", ["zugang"], /ZUGANG: lief nicht/],
    ];
    taeterFaelle(faelle, urteil, { fehler, gruen });
    // der Selbsttest: die Shader-Kosten-Linse zählt richtig, jeder injizierte Täter fällt rot und wird beim Namen genannt.
    selbsttestEnde(fehler);
}

if (SELBSTTEST) {
    console.log("=== POST-KETTE — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");

const server = statikServer();

// (f) DER SAUM AUF UNGERADER LEINWAND (Seiten-Kontext, nach `buehne`; die Seite steht auf einer ungeraden Größe): das Wasser
// über dem hellen Grund, darin ein schwarzer, schräg stehender Pfahl in der rechten Bildhälfte (seine Kante wechselt von
// Zeile zu Zeile die Spalte, also beide Paritäten). Je Wasser-Zeile das Pixel links an der Kante des Pfahls, mit dem
// Tiefen-Abbild und mit r184s Viewport-Tiefe bei festen Uhren, in voller Auflösung: liest das Wasser den Block, der sein
// Pixel enthält, ist es dasselbe Wasser; liest es den Nachbar-Block (der Pfahl, nah), ist es durchsichtig — ein heller Saum.
function saumProbe(ort) {
    return (async () => {
        const T = window.THREE;
        const rend = st.renderer;
        rend.setAnimationLoop(null);
        window.__buehne();
        const dev = rend.backend.device;
        const gpuFehler = [];
        const gpuHoer = (e) => gpuFehler.push(String(e.error?.message || e.message || e).slice(0, 240));
        dev.addEventListener("uncapturederror", gpuHoer);
        const cam = st.camera;
        const { x: x0, y: y0, z: z0 } = ort; // die Bühne der Wand (`buehne`): ihr Wasser ist flüssig
        const setzeKamera = () => {
            cam.position.set(x0, y0, z0);
            cam.up.set(0, 1, 0);
            cam.lookAt(x0, y0, z0 - 10);
            cam.updateMatrixWorld(true);
        };
        const gruppe = new T.Group();
        gruppe.name = "post-kette:SAUM";
        const [wasser, grund] = window.__postWasser; // das Wasser und der Grund der Bühne (`buehne`), an ihrem Ort
        const pfahl = new T.Mesh(new T.BoxGeometry(0.5, 4, 0.5), new T.MeshBasicNodeMaterial({ color: 0x000000 }));
        pfahl.position.set(x0 + 2.5, y0 - 3, z0 - 9);
        pfahl.rotation.z = 0.35;
        for (const m of [wasser, grund, pfahl]) {
            m.frustumCulled = false;
            gruppe.add(m);
        }
        st.scene.add(gruppe);
        const db = rend.getDrawingBufferSize(new T.Vector2());
        const W = Math.round(db.x),
            H = Math.round(db.y);
        const aufnahme = async () => {
            for (let i = 0; i < 3; i++) {
                setzeKamera();
                window.__loopBild();
            }
            setzeKamera();
            const { u8 } = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
            return u8;
        };
        const aus = { leinwand: [W, H], gpuFehler };
        try {
            const a = await aufnahme();
            const knoten = r._szeneTiefeKnoten,
                wert = r._szeneTiefeWert;
            r._szeneTiefeKnoten = T.TSL.viewportDepthTexture();
            r._szeneTiefeWert = r._szeneTiefeKnoten;
            let b;
            try {
                r._tiefenKnotenTausch();
                b = await aufnahme();
            } finally {
                r._szeneTiefeKnoten = knoten;
                r._szeneTiefeWert = wert;
                r._tiefenKnotenTausch();
            }
            const L = (u, x, y) => luma709(u, (y * W + x) * 4);
            // je Zeile der rechten Hälfte die linke Kante des Pfahls (das erste schwarze Pixel nach Wasser), das Wasser-Pixel
            // links davon: beide Aufnahmen
            let kanten = 0,
                abweichend = 0,
                dMax = 0;
            const paritaet = new Set();
            for (let y = 0; y < H; y++) {
                for (let x = Math.ceil(W / 2); x < W - 1; x++) {
                    if (L(b, x + 1, y) < 12 && L(b, x, y) > 60 && L(a, x + 1, y) < 12) {
                        kanten++;
                        paritaet.add(x & 1);
                        const d = L(a, x, y) - L(b, x, y);
                        dMax = Math.max(dMax, Math.abs(d));
                        if (Math.abs(d) > 8) abweichend++;
                        break;
                    }
                }
            }
            Object.assign(aus, { kanten, abweichend, dMax: +dMax.toFixed(1), paritaeten: paritaet.size });
        } catch (e) {
            aus.abbruch = fehlerStapel(e)
                .split("\n")
                .slice(0, 4)
                .join(" ← ");
        } finally {
            dev.removeEventListener("uncapturederror", gpuHoer);
            st.scene.remove(gruppe);
        }
        return aus;
    })();
}

// DIE BÜHNE (Seiten-Kontext): die echte Welt-Szene, der echte Frame, eigene Gegenstände vor der Kamera.
function buehne(nFrames, nachtLicht, flammeProbe, torProbe, knieProbe) {
    return (async () => {
        const T = window.THREE;
        const rend = st.renderer;
        rend.setAnimationLoop(null);
        window.__buehne();
        const gpuFehler = [];
        const dev = rend.backend.device;
        const gpuHoer = (e) => gpuFehler.push(String(e.error?.message || e.message || e).slice(0, 240));
        dev.addEventListener("uncapturederror", gpuHoer);
        // Die Kamera hoch über dem Boden (nichts von der Welt zwischen ihr und der Bühne), Blick waagrecht nach −z — und das
        // Wasser der Bühne flüssig (stoffe.K3): 10 m unter der tiefsten Höhe, über der Eis beginnt (`_eisLinien`, die Linie
        // der flachsten Säule, die auch der Stoff liest; im Sommer der Bühne über Genesis 11,4 m über dem Boden).
        const cam = st.camera;
        const x0 = cam.position.x,
            z0 = cam.position.z;
        const boden = r._voxelSurfaceY(x0, z0),
            eisNull = r._eisLinien().null[0];
        const y0 = Math.min(boden + 160, eisNull - 7);
        const setzeKamera = () => {
            cam.position.set(x0, y0, z0);
            cam.up.set(0, 1, 0);
            cam.lookAt(x0, y0, z0 - 10);
            cam.updateMatrixWorld(true);
        };
        setzeKamera();
        const gruppe = new T.Group();
        gruppe.name = "post-kette:BUEHNE";
        const stoff = (hex) => new T.MeshBasicNodeMaterial({ color: hex });
        const nah = new T.Mesh(new T.BoxGeometry(1.6, 1.6, 1.6), stoff(0xff2020));
        nah.position.set(x0, y0, z0 - 6);
        const fern = new T.Mesh(new T.BoxGeometry(12, 12, 1), stoff(0x20ff20));
        fern.position.set(x0, y0, z0 - 16);
        // Das Wasser: der echte Stoff (er liest die EINE Szenen-Tiefe), mit den Attributen, die er trägt.
        // Die Wicklung wie das Iso-Wasser: die Vorderseite nach UNTEN — der Stoff zeichnet BackSide (die Oberseite von oben).
        const wg = new T.PlaneGeometry(24, 24, 4, 4);
        wg.rotateX(Math.PI / 2);
        const nV = wg.attributes.position.count;
        wg.setAttribute("aFlow", new T.BufferAttribute(new Float32Array(nV * 2), 2));
        wg.setAttribute("aShore", new T.BufferAttribute(new Float32Array(nV).fill(1), 1));
        wg.setAttribute("aWave", new T.BufferAttribute(new Float32Array(nV), 1));
        const wasser = new T.Mesh(wg, r._ensureHydroSurfaceMaterial());
        wasser.position.set(x0, y0 - 3, z0 - 14);
        // Der Grund 0,3 m unter dem Spiegel, weiß: der optische Weg ist endlich und kurz, der Grund scheint durch, die Farbe
        // des Wassers hängt an der Szenen-Tiefe (ohne Grund läge dahinter die Welt über Genesis 57 m tiefer — der Durchlass 0, jede
        // Tiefe gäbe dieselbe Farbe).
        const grund = new T.Mesh(new T.PlaneGeometry(24, 24), stoff(0xffffff));
        grund.rotation.x = -Math.PI / 2;
        grund.position.set(x0, y0 - 3.3, z0 - 14);
        window.__postWasser = [wasser, grund]; // der Saum (`saumProbe`) misst an DEMSELBEN Wasser über demselben Grund
        for (const m of [nah, fern, wasser, grund]) {
            m.frustumCulled = false;
            gruppe.add(m);
        }
        st.scene.add(gruppe);
        // Die Pass-Brüche für die Szenen-Tiefe zählen (der Tiefen-Leser muss je Schritt seine Tiefe holen, sonst ist die
        // Wand blind): am Backend, dem EINEN Bruch-Weg — r184s Viewport-Tiefe (Rückfall) und das Tiefen-Abbild nehmen ihn.
        let kopien = 0;
        const kopieRoh = rend.backend.copyFramebufferToTexture;
        rend.backend.copyFramebufferToTexture = function (...a) {
            kopien++;
            return kopieRoh.apply(this, a);
        };
        const frame = () => window.__loopBild();
        const canvasTiefe = () => {
            const t = rend.getCanvasTarget().depthTexture;
            return !!(t && rend.backend.has(t) && rend.backend.get(t).texture);
        };
        // (g) DAS RAHMEN-ZIEL DES DIREKTPFADS: r184s Rahmen-Ziele (`_frameBufferTargets`, je Leinwand- bzw.
        // Ausgabe-Ziel) und die Textur-Objekte, die der Zensus der Band dem Erzeuger `r184-ausgabe` gibt
        // (`isPostProcessingRenderTarget`) — in MB nach r184s eigener Schätzung
        const rahmenZiel = () => {
            let n = 0,
                b = 0;
            for (const [t, v] of rend.info.memoryMap)
                if (t?.isTexture && t.renderTarget?.isPostProcessingRenderTarget) {
                    n++;
                    b += typeof v === "number" ? v : 0;
                }
            return {
                ziele: rend._frameBufferTargets ? rend._frameBufferTargets.size : null,
                n,
                mb: +(b / 1048576).toFixed(2),
            };
        };
        const schritte = [];
        const schritt = async (name) => {
            const s = { name, fehler: [] };
            kopien = 0;
            for (let i = 0; i < nFrames; i++) {
                setzeKamera();
                try {
                    frame();
                } catch (e) {
                    s.fehler.push(
                        fehlerStapel(e)
                            .split("\n")
                            .slice(0, 3)
                            .join(" ← ")
                    );
                    break;
                }
            }
            await dev.queue.onSubmittedWorkDone();
            s.direkt = !st.postProcessing || st.postProcessingFailed === true;
            s.tiefe = rend.depth;
            s.leinwandTiefeGpu = canvasTiefe();
            s.rahmenZiel = rahmenZiel();
            // Die Bild-Mitte aus dem Ausgabe-Pfad (was der Spieler sieht): 32×24, das Mittel der vier Mitten-Zellen.
            try {
                setzeKamera();
                const { u8 } = await window.__ausgabeAufnahme(32, 24, 1, { satz: "messung" });
                const px = (x, y) => [0, 1, 2].map((c) => u8[(y * 32 + x) * 4 + c]);
                const m = [px(15, 11), px(16, 11), px(15, 12), px(16, 12)];
                s.mitte = [0, 1, 2].map((c) => Math.round(m.reduce((a, p) => a + p[c], 0) / 4));
            } catch (e) {
                s.fehler.push("Aufnahme: " + String(e?.message || e).slice(0, 200));
            }
            await dev.queue.onSubmittedWorkDone();
            s.tiefenKopien = kopien;
            // DAS TIEFEN-ABBILD (WebGPU): halbe Auflösung, je Texel die fernste Tiefe seiner 2×2 Pixel — an der Bild-Mitte
            // die Vorderseite der nahen Kiste, 5,2 m vor der Kamera (perspektivische Tiefe aus near/far der Kamera)
            const ab = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
            if (ab && ab.isDataTexture === true && rend.backend.has(ab) && rend.backend.get(ab).texture) {
                const g = rend.backend.get(ab).texture;
                const db = rend.getDrawingBufferSize(new T.Vector2());
                const bpr = Math.ceil((g.width * 4) / 256) * 256;
                const buf = dev.createBuffer({
                    size: bpr * g.height,
                    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
                });
                const enc = dev.createCommandEncoder();
                enc.copyTextureToBuffer({ texture: g }, { buffer: buf, bytesPerRow: bpr }, [g.width, g.height]);
                dev.queue.submit([enc.finish()]);
                await buf.mapAsync(GPUMapMode.READ);
                const f32 = new Float32Array(buf.getMappedRange().slice(0));
                buf.unmap();
                buf.destroy();
                const mitte = f32[Math.floor(g.height / 2) * (bpr / 4) + Math.floor(g.width / 2)];
                const z = 5.2;
                const soll = (cam.far * (z - cam.near)) / (z * (cam.far - cam.near));
                s.abbild = {
                    format: g.format,
                    groesse: [g.width, g.height],
                    leinwand: [Math.round(db.x), Math.round(db.y)],
                    mitte: +mitte.toFixed(6),
                    soll: +soll.toFixed(6),
                };
            } else s.abbild = { fehlt: true };
            schritte.push(s);
        };
        const aus = { schritte, gpuFehler, buehne: { x: x0, y: y0, z: z0, boden, eisNull, wasserY: y0 - 3 } };
        try {
            // (a) Post-Kette — der Normalfall.
            await schritt("Post-Kette");
            // (c) das Fragment der Ausgabe, so wie die Kette es zeichnet.
            const prog = await window.__shaderKosten({ frames: 1 });
            const ausg = prog.find((p) => p.programm === "post:ausgabe");
            aus.ausgabeWgsl = ausg ? ausg.fragment : null;
            // (a) die Weiche: Direktpfad (wie die Zerleg-Linse sie stellt), zurück, dann ein Render-Fehler der Kette.
            st.postProcessingFailed = true;
            await schritt("Direktpfad");
            st.postProcessingFailed = false;
            await schritt("Post-Kette zurück");
            const pp = st.postProcessing;
            const renderRoh = pp.render;
            pp.render = function () {
                pp.render = renderRoh;
                throw new Error("gate:post-kette — erzwungener Render-Fehler der Kette");
            };
            await schritt("Render-Fehler");
            // (g) DIE DRIFT: fehlt r184s Abschied am Leinwand-Ziel (der dispose-Hörer, den
            // `_getFrameBufferTarget` anhängt), fällt das Rahmen-Ziel des Rückfalls trotzdem — LAUT: `_rahmenZielAbschied` meldet
            // ERROR. Die Wand nimmt den Hörer fort, kehrt zur Kette zurück und verlangt beides; ihre ERROR-Zeile ist die einzige,
            // die das Urteil duldet.
            const leinwand = rend.getCanvasTarget();
            const hoerer = leinwand._listeners?.dispose || [];
            const fort = hoerer.filter((h) => /_frameBufferTargets\.delete\(/.test(Function.prototype.toString.call(h)));
            for (const h of fort) leinwand.removeEventListener("dispose", h);
            const driftFehler = [];
            const logRoh = r.log;
            r.log = function (m, lvl) {
                if (lvl === "ERROR") driftFehler.push(String(m).slice(0, 200));
                return logRoh.apply(this, arguments);
            };
            st.postProcessingFailed = false;
            try {
                await schritt("Post-Kette nach Drift");
            } finally {
                delete r.log;
            }
            aus.drift = { hoererWeg: fort.length, fehler: driftFehler };
            st.postProcessingFailed = false;
            // (e) DAS WASSER LIEST DAS ABBILD WIE r184s TIEFE: die unteren sieben Zeilen des Bildes (32×24) sind Wasser über
            // dem Grund. Bei festen Uhren (die Bühne hält jede je Frame der Aufnahme) einmal mit dem Abbild, einmal mit r184s
            // Viewport-Tiefe (der volle Klon im Pass-Bruch), wieder mit dem Abbild (der Rausch-Boden) und ohne Grund (die
            // Probe ist nicht blind: die Farbe hängt an der Tiefe). Die Leser hängt `_tiefenKnotenTausch` um, der Weg
            // des Resize.
            const wasserFarbe = async () => {
                for (let i = 0; i < 3; i++) {
                    setzeKamera();
                    frame();
                }
                setzeKamera();
                const { u8 } = await window.__ausgabeAufnahme(32, 24, 1, { satz: "messung" });
                const s = [0, 0, 0];
                let n = 0;
                for (let y = 17; y < 24; y++)
                    for (let x = 0; x < 32; x++, n++) for (let c = 0; c < 3; c++) s[c] += u8[(y * 32 + x) * 4 + c];
                return s.map((v) => +(v / n).toFixed(1));
            };
            const w = { umgehaengt: [] };
            w.abbild = await wasserFarbe();
            const knoten = r._szeneTiefeKnoten,
                wert = r._szeneTiefeWert;
            r._szeneTiefeKnoten = T.TSL.viewportDepthTexture();
            r._szeneTiefeWert = r._szeneTiefeKnoten;
            try {
                w.umgehaengt.push(r._tiefenKnotenTausch());
                w.r184 = await wasserFarbe();
            } finally {
                r._szeneTiefeKnoten = knoten;
                r._szeneTiefeWert = wert;
                w.umgehaengt.push(r._tiefenKnotenTausch());
            }
            w.zurueck = await wasserFarbe();
            grund.visible = false;
            w.ohneGrund = await wasserFarbe();
            grund.visible = true;
            aus.wasser = w;
            // (d) die Godrays mit der Sonne im Bild: tiefe Sonne, Blick in die Sonne; mit und ohne Godrays (der Regler).
            gruppe.visible = false;
            r._uhrSetzen(0.3, "regler");
            r._applyDayNightToScene();
            // der Blick 0,2 rad UNTER die Sonne: sie steht in der oberen Bildhälfte — an der Mitte fiele eine gespiegelte Lage
            // mit der wahren zusammen (die Probe der LAGE wäre blind)
            const blickSonne = () => {
                cam.position.set(x0, y0, z0);
                frame();
                cam.lookAt(st.sunMesh.position);
                cam.rotateX(-0.2);
                cam.updateMatrixWorld(true);
            };
            const bild = async (skala) => {
                st._godrayScale = skala;
                blickSonne();
                blickSonne();
                const { u8 } = await window.__ausgabeAufnahme(64, 48, 1, { satz: "messung" });
                return u8;
            };
            // DIE LAGE DER SONNE IM BILD (w28-lichtschacht): der Schwerpunkt der hellsten Pixel (die Scheibe) gegen die Lage, auf
            // die der Marsch zielt (`sunScreenPos`, `_schirmUV`) — beide in `screenUV` (oben links)
            const hellste = (a) => {
                const l = (i) => 0.2126 * a[i] + 0.7152 * a[i + 1] + 0.0722 * a[i + 2];
                let m = 0;
                for (let i = 0; i < a.length; i += 4) m = Math.max(m, l(i));
                let sx = 0,
                    sy = 0,
                    n = 0;
                for (let i = 0; i < a.length; i += 4)
                    if (l(i) >= m - 2) {
                        const p = i / 4;
                        sx += (p % 64) + 0.5;
                        sy += Math.floor(p / 64) + 0.5;
                        n++;
                    }
                return [+(sx / n / 64).toFixed(3), +(sy / n / 48).toFixed(3)];
            };
            // der Anteil der Pixel, die sich in einem Kanal um mindestens 4/255 ändern
            const diff = (a, b) => {
                let n = 0;
                for (let i = 0; i < a.length; i += 4)
                    if (
                        Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) >=
                        4
                    )
                        n++;
                return +((100 * n) / (a.length / 4)).toFixed(2);
            };
            // DER SCHACHT (`_godrayStufe`): seine Läufe mit und ohne Stärke, sein Fragment mit der Sonne im Bild
            const stufe = st.godrayUniforms && st.godrayUniforms.stufe;
            const laeufe = () => (stufe ? stufe.laeufe : NaN);
            const l0 = laeufe();
            const mit1 = await bild(1);
            const staerke = st.godrayUniforms ? st.godrayUniforms.strength.value : null;
            const mit2 = await bild(1);
            const progG = await window.__shaderKosten({ frames: 1 });
            const schachtProg = progG.find((p) => p.programm === "post:godray");
            const l1 = laeufe();
            const ohne = await bild(0);
            const l2 = laeufe();
            const ziel = st.godrayUniforms ? st.godrayUniforms.sunScreenPos.value : null;
            aus.godray = {
                staerke: staerke == null ? null : +staerke.toFixed(3),
                aenderungPct: diff(mit1, ohne),
                rauschenPct: diff(mit1, mit2),
                lage: { ziel: ziel ? [+ziel.x.toFixed(3), +ziel.y.toFixed(3)] : null, sonne: hellste(ohne) },
                schacht: {
                    schritte: r.constructor.GODRAY ? r.constructor.GODRAY.schritte : null,
                    laeufeMit: l1 - l0,
                    laeufeOhne: l2 - l1,
                    wgsl: schachtProg ? schachtProg.fragment : null,
                },
            };
            // (h) DAS DUNKEL: eine flache, unbeleuchtete Fläche ohne Luft füllt das Bild (die Bühne verborgen, Godrays aus),
            // zweimal mit demselben belichteten Licht — Belichtung 1 mit 0,05, Belichtung 4 mit 0,0125 —, gemessen im Ausgabe-Pfad.
            // DIE KAMERA SIEHT NUR DIE FLÄCHE (ihre Proben-Schicht, wie diag-hitch-telemetrie): die Probe misst die Kette an EINEM
            // Licht — jedes Welt-Pixel im Bild ist beleuchtet und wächst mit der Belichtung. Die Kamera der Bühne steht genau über der
            // Achse der Genesis-Scheibe (der Spawn) und blickt genau waagrecht: die Mitte ihres Deckels liegt in der Ebene der Kamera
            // (w = 0), und swiftshader (die CI) rastert den Fächer mit falscher Tiefe (1,4–2 m statt 4,9–6,5 m) VOR die Fläche, unten
            // ein Keil der Scheibe (1 cm Versatz längs des Blicks, 0,06° Neigung oder die Radeon: kein Keil). Am main zeichnete ihn der
            // Rausch-Bump schwarz (ohne den Bump auch dort beleuchtet) — Luma 32,4 / 32,4 —, seit material.K5 beleuchtet: 33,4 / 35,0;
            // die Fläche allein 33,0 / 33,0.
            const SCHICHT = 31;
            const flach = new T.Mesh(new T.PlaneGeometry(60, 40), new T.MeshBasicNodeMaterial({ color: 0xffffff }));
            flach.material.fog = false;
            flach.frustumCulled = false;
            flach.layers.set(SCHICHT);
            flach.position.set(x0, y0, z0 - 2);
            st.scene.add(flach);
            const maskeVor = cam.layers.mask;
            const nachtU = st.postProcessingUniforms && st.postProcessingUniforms.nightFactor;
            const nachtVor = nachtU ? nachtU.value : null;
            const dunkel = async (k, c, nacht) => {
                flach.material.color.setRGB(c, c, c);
                r._blendeBestellen({ k }); // die Blende bestellt bei der Welt, nie am Renderer
                if (nacht && nachtU) nachtU.value = 1;
                for (let i = 0; i < nFrames; i++) {
                    setzeKamera();
                    frame();
                }
                setzeKamera();
                const { u8 } = await window.__ausgabeAufnahme(32, 24, 1, { satz: "messung" });
                let s = 0;
                for (let i = 0; i < u8.length; i += 4) s += luma709(u8, i);
                return { luma: +(s / (u8.length / 4)).toFixed(1), k: rend.toneMappingExposure, nacht: nachtU ? nachtU.value : null };
            };
            try {
                cam.layers.set(SCHICHT);
                const a = await dunkel(1, 0.05);
                const b = await dunkel(4, 0.0125);
                // die Nacht (D3-2): das Licht des Bodens im Mondlicht unter dem Schnitt der Tag-Kurve, nightFactor 1
                const n = await dunkel(1, nachtLicht, true);
                aus.dunkel = { k1: a.k, luma1: a.luma, k4: b.k, luma4: b.luma, nachtFaktor: n.nacht, lumaNacht: n.luma };
                // (j) DIE FLAMME VOR DEM AUGE DER NACHT: dieselbe Fläche, ihr Stoff der Ton der Flamme vor der Tonkurve — wie die Tafel
                // in `_brandFlammenZeichnen` ihn rechnet (lichtFarbe(K) × (K/kelvin[0])⁴ in 8 Bit, × die Leuchtdichte der Flamme
                // `FEUER_LEUCHTDICHTE` ÷ `EINHEIT_LX`, licht-eine-skala — kein Bild-Ton ÷ Belichtung mehr) —, mit der Umkehr
                // des Auges (`_nachtAuge(c, true)`) und ohne sie (MUTANTE-J); je Ton die Bild-Mitte bei nightFactor 0 und 1.
                const FL = (aus.flamme = { toene: {} });
                const stoffVor = flach.material;
                const stoffe = [];
                try {
                    if (!nachtU) throw new Error("die Post-Kette trägt keine Uniform nightFactor");
                    const [BF, FW, L] = [r.constructor.BRAND.bild.flamme, globalThis.__fachwerkCore, T.TSL];
                    // der Ton wie die Tafel (8 Bit) × die Leuchtdichte ÷ die Luma der heißesten Zeile (S10, `_brandFlammenZeichnen`);
                    // `cd` ohne Wort die der Flamme, sonst steht der Ton in GENAU dieser Leuchtdichte (das Glimmen)
                    const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
                    const flammenStoff = (K, umkehr, cd) => {
                        const [c, w] = [FW.lichtFarbe(K), Math.pow(K / BF.kelvin[0], 4)];
                        const t8 = [0, 1, 2].map((i) => Math.round(255 * c[i] * w) / 255);
                        const faktor = cd > 0 ? cd / luma(t8) : r._flammeOptik().quelle / luma(FW.lichtFarbe(BF.kelvin[0]));
                        const ton = L.vec3(...t8).mul(L.float(faktor / __weltLicht.EINHEIT_LX));
                        const m = new T.MeshBasicNodeMaterial();
                        m.fog = false;
                        m.colorNode = L.vec4(umkehr ? r._nachtAuge(ton, true) : ton, 1);
                        stoffe.push(m);
                        return m;
                    };
                    const mitte = async (m, nacht) => {
                        flach.material = m;
                        r._blendeBestellen({ k: flammeProbe.k });
                        for (let i = 0; i < nFrames; i++) {
                            nachtU.value = nacht;
                            setzeKamera();
                            frame();
                        }
                        setzeKamera();
                        const { u8 } = await window.__ausgabeAufnahme(32, 24, 1, { satz: "messung" });
                        const zellen = [15, 16].flatMap((x) => [11, 12].map((y) => (y * 32 + x) * 4));
                        return {
                            rgb: [0, 1, 2].map((c) => +(zellen.reduce((s, i) => s + u8[i + c], 0) / 4).toFixed(1)),
                            k: rend.toneMappingExposure,
                            nf: nachtU.value,
                        };
                    };
                    const NA = r.constructor.NACHT_AUGE;
                    const glimmCd = +Math.sqrt(NA.staebchenCd * NA.zapfenCd).toPrecision(4);
                    for (const [name, K, cd] of [["kern", BF.kelvin[0]], ["mantel", flammeProbe.mantelK], ["glimmen", flammeProbe.mantelK, glimmCd]]) {
                        const [mit, ohneUmkehr] = [flammenStoff(K, true, cd), flammenStoff(K, false, cd)];
                        const [tag, nacht, ohne] = [await mitte(mit, 0), await mitte(mit, 1), await mitte(ohneUmkehr, 1)];
                        const k = [tag, nacht, ohne].every((x) => x.k === flammeProbe.k) ? flammeProbe.k : [tag.k, nacht.k, ohne.k].join("/");
                        FL.toene[name] = { kelvin: K, cd: cd || Math.round(r._flammeOptik().quelle), k, nfTag: tag.nf, nfNacht: nacht.nf, nfOhne: ohne.nf, tag: tag.rgb, nacht: nacht.rgb, ohne: ohne.rgb };
                    }
                    // (j2) die Kurve, an der Node das Soll rechnet: die Zahl `BELICHTUNG.schulter` der Seite, die Kurve auf ihrem Platz am
                    // Renderer, der Deckel des Szenen-Ziels, die Wurzel der Flamme
                    const WB = __weltLicht.BELICHTUNG;
                    // r184 baut `float(32768)` als int-Konstante unter einem Umwandlungs-Knoten: die Zahl steht am innersten Knoten
                    let deckel = r._vorBelichtung().deckel;
                    while (deckel && deckel.value === undefined && deckel.node) deckel = deckel.node;
                    FL.kurve = { platz: rend.toneMapping === T[WB.kurve], schulter: WB.schulter, deckel: deckel && deckel.value };
                    FL.kelvin0 = BF.kelvin[0];
                    // (A3) STETIG AM KNIE: die flache Fläche trägt einen Verlauf längs der Bild-Breite — Eingang der Kurve von × `von` bis
                    // × `bis` Weiß (logarithmisch, der Ton ÷ k: das Szenen-Ziel hält ihn × k), je Spalte eine Stützstelle, die Zeilen gemittelt
                    const KN = (FL.knie = { toene: {} });
                    try {
                        KN.leinwand = Math.round(rend.getDrawingBufferSize(new T.Vector2()).x);
                        KN.n = knieProbe.n;
                        for (const [name, ton] of [["grau", [1, 1, 1]], ["satt", FW.lichtFarbe(flammeProbe.mantelK)]]) {
                            const m = new T.MeshBasicNodeMaterial();
                            m.fog = false;
                            const t = L.float(knieProbe.von).mul(L.pow(L.float(knieProbe.bis / knieProbe.von), L.screenUV.x));
                            m.colorNode = L.vec4(L.vec3(...ton).mul(t).div(L.toneMappingExposure), 1);
                            stoffe.push(m);
                            flach.material = m;
                            r._blendeBestellen({ k: flammeProbe.k });
                            for (let i = 0; i < nFrames; i++) {
                                nachtU.value = 0;
                                setzeKamera();
                                frame();
                            }
                            setzeKamera();
                            const { u8 } = await window.__ausgabeAufnahme(knieProbe.n, 1, 1, { satz: "messung" });
                            KN.toene[name] = { ton, reihe: Array.from({ length: knieProbe.n }, (_, i) => [u8[4 * i], u8[4 * i + 1], u8[4 * i + 2]]) };
                            [KN.k, KN.nf] = [rend.toneMappingExposure, nachtU.value];
                        }
                    } catch (e) {
                        KN.abbruch = fehlerStapel(e).split("\n").slice(0, 4).join(" ← ");
                    }
                    // (j3) EINE QUELLE am lebenden Code (ohne Kommentare, `__fehlt`): die Uniform des Glieds IST die der Kette, das Glied
                    // liest die Stäbchen-Schwelle, die Kette ruft das Glied mit ihrer Farbe, die Flamme ruft seine Umkehr
                    FL.quelle = {
                        uniform: r._nachtAuge(null) === nachtU,
                        augeLiest: !window.__fehlt(r._nachtAuge, /\.staebchenCd\b/),
                        kette: !window.__fehlt(r._ensurePostProcessing, /_nachtAuge\(\s*(?!null\b)[A-Za-z_]/),
                        // vier Klammer-Tiefen: seit S10 teilt der Ruf durch die Luma der heißesten Zeile, `((c) => …)(lichtFarbe(K0))`
                        umkehr: !window.__fehlt(r._brandFlammenZeichnen, /_nachtAuge\((?:[^()]|\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))*,\s*true\s*\)/),
                    };
                    // (j) DAS TOR: das Zielbild der Membran am ECHTEN Knoten des Stamms. Ein eigener Atlas der Ziele (der echte
                    // Bauer `_torZiele`, der echte Schreiber `_torZielEinsetzen`: je Ton EINE Zeile, die ganze Zeile dieser Ton),
                    // der echte Stoff der Membran (`_membranMaterialFor` an einem Gesetz des Kerns porta) und als Farbe der
                    // Ziel-Knoten seines Graphen (`ohneFilm` — das Zielbild allein, wie die Linse milchweiss es liest; der Film
                    // färbt nicht mit) auf der flachen Fläche. Der Graph entsteht frisch (eine Kopie des Gesetzes als Schlüssel),
                    // ein Mithörer an `_nachtAuge` zählt seine Rufe der Umkehr (j3, zur Laufzeit). MUTANTE-TOR: derselbe Bau, die
                    // Umkehr reicht den Ton unverändert durch (`_nachtAuge` der Seite überschrieben) — das Zielbild wie vor
                    // w28-tor-nacht.
                    const TOR = (FL.tor = { toene: {} });
                    const [atlasEigen, atlasVor, augeEigen] = [Object.hasOwn(r, "_torZielAtlas"), r._torZielAtlas, Object.hasOwn(r, "_nachtAuge")];
                    let atlas = null;
                    try {
                        if (augeEigen) throw new Error("`_nachtAuge` ist an der Instanz schon überschrieben");
                        const [AR, PC] = [r.constructor, globalThis.__portaCore];
                        const gestalt = Object.keys(PC.PRESETS).filter((k) => PC.PRESETS[k].kind === "gate").sort()[0];
                        const tor = r._torGesetzFor({ type: AR.KIND_POLICY.gate.prefix + gestalt });
                        if (!tor) throw new Error("kein Tor-Gesetz für die Gestalt " + gestalt);
                        r._torZielAtlas = null;
                        atlas = r._torZiele();
                        const [GZ, namen] = [AR.TOR_ZIEL, Object.keys(torProbe.toene)];
                        r._torZielEinsetzen(
                            namen.map((name) => {
                                const daten = new Uint16Array(GZ.w * GZ.h * 4);
                                const h = [...torProbe.toene[name], 1].map((x) => T.DataUtils.toHalfFloat(x));
                                for (let i = 0; i < daten.length; i++) daten[i] = h[i & 3];
                                return [{ world: "gate:post-kette " + name }, daten];
                            })
                        );
                        const augeAlt = r._nachtAuge;
                        const torStoff = (auge) => {
                            r._nachtAuge = auge;
                            try {
                                const gesetz = Object.assign({}, tor.gesetz);
                                const { mat } = r._membranMaterialFor(Object.assign({}, tor, { gesetz }), 0, 0);
                                stoffe.push(mat);
                                const G = r._membranGraph(gesetz);
                                if (!G.ohneFilm) throw new Error("der Graph der Membran trägt keinen Ziel-Knoten `ohneFilm`");
                                [mat.colorNode, mat.positionNode, mat.opacityNode, mat.alphaTest, mat.fog] = [G.ohneFilm, null, null, 0, false];
                                return mat;
                            } finally {
                                delete r._nachtAuge;
                            }
                        };
                        let rufe = 0;
                        const kopf = torStoff(function (f, vor) {
                            if (f && vor === true) rufe++;
                            return augeAlt.call(this, f, vor);
                        });
                        const mutante = torStoff(function (f, vor) {
                            return f && vor === true ? f : augeAlt.call(this, f, vor);
                        });
                        for (const [zeile, name] of namen.entries()) {
                            kopf.userData.tor.ziel = mutante.userData.tor.ziel = zeile;
                            // die Belichtung der Heimat teilt das Zielbild (die EINE Belichtung des Bilds, `_vorBelichtung`)
                            const schuss = (m, nacht) => mitte(m, nacht);
                            const [tag, nacht, ohne] = [await schuss(kopf, 0), await schuss(kopf, 1), await schuss(mutante, 1)];
                            const k = [tag, nacht, ohne].every((x) => x.k === flammeProbe.k) ? flammeProbe.k : [tag.k, nacht.k, ohne.k].join("/");
                            TOR.toene[name] = { wert: torProbe.toene[name], k, nfTag: tag.nf, nfNacht: nacht.nf, nfOhne: ohne.nf, tag: tag.rgb, nacht: nacht.rgb, ohne: ohne.rgb };
                        }
                        Object.assign(TOR, { gestalt, rufe, zeilen: atlas.uZeilen.value, belicht: +(1 / flammeProbe.k).toPrecision(4) });
                    } catch (e) {
                        TOR.abbruch = fehlerStapel(e).split("\n").slice(0, 4).join(" ← ");
                    } finally {
                        if (!augeEigen) delete r._nachtAuge;
                        if (atlas && atlas !== atlasVor && atlas.tex) atlas.tex.dispose();
                        if (atlasEigen) r._torZielAtlas = atlasVor;
                        else delete r._torZielAtlas;
                    }
                } catch (e) {
                    FL.abbruch = fehlerStapel(e).split("\n").slice(0, 4).join(" ← ");
                } finally {
                    flach.material = stoffVor;
                    for (const m of stoffe) m.dispose();
                }
            } finally {
                cam.layers.mask = maskeVor;
                if (nachtU) nachtU.value = nachtVor;
                r._blendeBestellen(null);
                st.scene.remove(flach);
                flach.geometry.dispose();
                flach.material.dispose();
            }
            // (g) am Ende: nach Wasser, Godrays und Dunkel (Post-Kette) steht kein Rahmen-Ziel mehr
            await dev.queue.onSubmittedWorkDone();
            aus.rahmenEnde = rahmenZiel();
        } catch (e) {
            aus.abbruch = fehlerStapel(e)
                .split("\n")
                .slice(0, 4)
                .join(" ← ");
        } finally {
            rend.backend.copyFramebufferToTexture = kopieRoh;
            dev.removeEventListener("uncapturederror", gpuHoer);
            st.scene.remove(gruppe);
        }
        return aus;
    })();
}

// (i) DER ZUGANG (spielgang.K4, Seiten-Kontext, nach `buehne`): aus trägt der Graph der Ausgabe keinen Knoten der Farbsicht
// (die Suche nach ihren Uniformen). Die Kamera sieht nur den Himmel (die Gegenstände im Unendlichen, `_himmelImUnendlichen`) und
// eine blaue Kiste, steil nach oben: unter Tritanopie und Deuteranopie bleibt jedes Himmels-Pixel wie aus, die Kiste wechselt
// unter Tritanopie (sonst blind). Kiste = die Pixel, die sie zeichnet (aus mit ↔ ohne Kiste).
function zugangProbe() {
    return (async () => {
        const T = window.THREE;
        st.renderer.setAnimationLoop(null);
        window.__buehne();
        const [Z, pp, ppu, cam, S] = [st.zugang, st.postProcessing, st.postProcessingUniforms, st.camera, 30];
        const [vor, p0, maske] = [{ ...Z }, cam.position.clone(), cam.layers.mask];
        const kiste = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicNodeMaterial({ color: 0x2050ff }));
        kiste.position.set(p0.x, p0.y + 7.5, p0.z - 2.7);
        const himmel = [kiste];
        st.scene.traverse((o) => o.material?.vertexNode === r.constructor._unendlichKnoten && himmel.push(o));
        for (const o of himmel) o.layers.enable(S);
        st.scene.add(kiste);
        cam.layers.set(S);
        const bild = async () => {
            for (let i = 0; i < 5; i++) {
                cam.position.copy(p0);
                cam.lookAt(p0.x, p0.y + 10, p0.z - 3.6);
                cam.updateMatrixWorld(true);
                window.__loopBild();
            }
            return (await window.__ausgabeAufnahme(80, 60, 1, { satz: "messung" })).u8;
        };
        const traegt = (n, such = [ppu.farbFehler, ppu.farbSchub], weg = new Set()) =>
            !!n && typeof n === "object" && !weg.has(n) && (weg.add(n), such.includes(n) || Object.values(n).flat().some((k) => k?.isNode && traegt(k, such, weg)));
        const aus = { himmel: himmel.map((o) => o.name), ausTraegt: traegt(pp.outputNode) };
        try {
            const a = await bild();
            kiste.visible = false;
            const ohne = await bild();
            kiste.visible = true;
            const d = (b, i) => Math.max(...[0, 1, 2].map((c) => Math.abs(b[i + c] - a[i + c])));
            for (const art of ["tritanopie", "deuteranopie"]) {
                Z.farbsicht = art;
                const b = await bild();
                const e = (aus[art] = { himmel: 0, kiste: 0, kistePx: 0, himmelPx: 0 });
                aus.anTraegt ||= traegt(pp.outputNode);
                for (let i = 0; i < b.length; i += 4)
                    if (d(ohne, i) > 0) (e.kistePx++, (e.kiste += d(b, i) >= 4));
                    else (e.himmelPx++, (e.himmel += d(b, i) > 0));
            }
        } catch (e) {
            aus.abbruch = fehlerStapel(e);
        } finally {
            Object.assign(Z, vor);
            cam.layers.mask = maske;
            for (const o of himmel) o.layers.disable(S);
            st.scene.remove(kiste);
        }
        return aus;
    })();
}

// (k) DER RAUCH (w28-rauch-bild, Seiten-Kontext, nach `buehne`): das EINE Rauch-Bild am Bild der Ausgabe. Die Sätze legen die
// echten Leser an (`_brandRauch` mit einer gestellten Flamme, `_updateDorfRauch` mit einem gestellten Kamin) — ein Mithörer an
// `_rauchStoff` nennt den Bauer ihrer Stoffe; gemessen wird der Satz der Brand-Fahne mit gestellten Ballen über `_rauchZeichnen`.
// Die Quelle des Licht-Pools geht durch den EINEN Schreiber (`_leuchtTakt` liest `_leuchtQuellen` der Seite: nur sie oder keine).
// Jede Mutante baut den Stoff neu (der Satz nimmt Abschied wie im Stamm) und stellt Tafel und Naht danach zurück.
// (l) DIE ZUNGE: die Probe im Bild (Kommentar an `ZUNGE_PROBE`)
function zungeProbe(ort, P) {
    return (async () => {
        const T = window.THREE;
        const [L, AR, rend, cam, FW] = [T.TSL, r.constructor, st.renderer, st.camera, globalThis.__fachwerkCore];
        rend.setAnimationLoop(null);
        const aus = { gpuFehler: [] };
        const dev = rend.backend.device;
        const gpuHoer = (e) => aus.gpuFehler.push(String(e.error?.message || e.message || e).slice(0, 240));
        dev.addEventListener("uncapturederror", gpuHoer);
        const B = AR.BRAND.bild;
        const { x: x0, y: y0, z: z0 } = ort;
        const setzeKamera = () => {
            cam.position.set(x0, y0, z0);
            cam.up.set(0, 1, 0);
            cam.lookAt(x0, y0, z0 - 10);
            cam.updateMatrixWorld(true);
        };
        const wandU = L.uniform(0);
        const wandStoff = new T.MeshBasicNodeMaterial();
        wandStoff.fog = false;
        wandStoff.colorNode = L.vec4(L.vec3(wandU).div(L.toneMappingExposure), 1);
        const wand = new T.Mesh(new T.PlaneGeometry(80, 60), wandStoff);
        wand.name = "post-kette:ZUNGE";
        wand.frustumCulled = false;
        wand.position.set(x0, y0, z0 - P.abstandM - P.wandM);
        const SCHICHT = 31;
        wand.layers.set(SCHICHT);
        const [maskeVor, zeitVor] = [cam.layers.mask, r._bildZeit];
        // der Abschied des Satzes der Flammen (die Welt legt ihn am nächsten Brand neu an)
        const abschied = () => {
            const S = st.brandFlammenSatz;
            if (!S) return;
            if (S.mesh.parent) S.mesh.parent.remove(S.mesh);
            r._instanzAbschied(S.mesh);
            S.mesh.geometry.dispose();
            S.mesh.material.dispose();
            S.tafel.dispose();
            st.brandFlammenSatz = null;
        };
        try {
            if (Object.prototype.hasOwnProperty.call(r, "_flammeOptik")) throw new Error("die Welt trägt schon eine Hülle um _flammeOptik — eine Probe stellte sie nicht zurück");
            window.__buehne({ uhr: P.uhr });
            await r._himmelFrisch();
            r._applyDayNightToScene();
            setzeKamera();
            st.scene.add(wand);
            cam.layers.set(SCHICHT);
            abschied();
            const db = rend.getDrawingBufferSize(new T.Vector2());
            const [W, H] = [Math.round(db.x), Math.round(db.y)];
            const f = { x: x0, y: y0 - P.langM / 2, z: z0 - P.abstandM, wx: 1, wz: 0, kipp: 0, lang: P.langM, dreh: 0 };
            const zeichne = (an, zeit = 0) => {
                r._bildZeit = zeit;
                r._brandFlammenZeichnen(an ? [f] : []);
                if (st.brandFlammenSatz) st.brandFlammenSatz.mesh.layers.set(SCHICHT);
            };
            const schuss = async () => {
                for (let i = 0; i < P.frames; i++) {
                    setzeKamera();
                    window.__loopBild();
                }
                setzeKamera();
                return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
            };
            const pix = (x, y, z) => {
                const p = new T.Vector3(x, y, z).project(cam);
                return [(0.5 + p.x / 2) * W, (0.5 - p.y / 2) * H];
            };
            // der Kasten der Zunge im Bild: Fuß bis Spitze, quer die Fläche des Satzes (halbe Breite × die Weite des Rauschens)
            const Z = FW.FLAMME.zunge;
            const rMax = Math.max(...Z.map((p) => p[0]));
            const halb = B.breite * P.langM * rMax;
            const [fuss, kopf] = [pix(f.x, f.y, f.z), pix(f.x, f.y + f.lang, f.z)];
            const ppm = Math.abs(fuss[1] - kopf[1]) / f.lang;
            const weit = 1 + 1.25 * B.flamme.rausch[2];
            const kasten = [Math.max(0, Math.floor(fuss[0] - halb * weit * ppm)), Math.max(0, Math.floor(kopf[1])), Math.min(W, Math.ceil(fuss[0] + halb * weit * ppm)), Math.min(H, Math.ceil(fuss[1]))];
            const imKasten = (fn) => {
                for (let y = kasten[1]; y < kasten[3]; y++) for (let x = kasten[0]; x < kasten[2]; x++) fn(y * W + x);
            };
            Object.assign(aus, {
                uhr: st.timeOfDay,
                nf: st.postProcessingUniforms ? st.postProcessingUniforms.nightFactor.value : null,
                k: +rend.toneMappingExposure.toPrecision(4),
                leinwand: [W, H],
                zungePx: [kasten[2] - kasten[0], kasten[3] - kasten[1]],
            });
            // (l1) vor der Wand im Ton der Karte: je Pixel des Kastens MIT gegen OHNE die Zunge, über die Phasen des Rauschens
            const z1 = async () => {
                r._blendeBestellen(null);
                wandU.value = P.karte;
                zeichne(false);
                const ohne = await schuss();
                const s = { dunkel: 0, hell: 0, px: 0, tiefst: 0, grund: 0 };
                let nG = 0;
                imKasten((p) => ((s.grund += luma709(ohne, p * 4)), nG++));
                s.grund = +(s.grund / Math.max(1, nG)).toFixed(1);
                for (const zeit of P.zeiten) {
                    zeichne(true, zeit);
                    const mit = await schuss();
                    imKasten((p) => {
                        const d = luma709(mit, p * 4) - luma709(ohne, p * 4);
                        s.px++;
                        if (d < -P.tol) s.dunkel++;
                        else if (d > P.tol) s.hell++;
                        if (d < s.tiefst) s.tiefst = d;
                    });
                }
                s.tiefst = +s.tiefst.toFixed(1);
                return s;
            };
            // (l2) vor der schwarzen Wand bei der Blende `kLin`: die Leuchtdichte je Pixel aus dem Bild unter der Schulter — sRGB
            // zurück (IEC 61966-2-1), der Fuß der Kurve zurück (welt-licht `tonKurve`: am kleinsten Kanal x − 6,25·x² unter 0,08,
            // sonst 0,04, von jedem Kanal abgezogen), ÷ Blende × `EINHEIT_LX`
            const lin = (u) => {
                const v = u / 255;
                return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            };
            const bildwert = (u8, i) => {
                const c = [lin(u8[i]), lin(u8[i + 1]), lin(u8[i + 2])];
                const m = Math.min(...c);
                const o = m < 0.04 ? Math.sqrt(m / 6.25) - m : 0.04;
                return c.map((x) => x + o);
            };
            const z2 = async () => {
                wandU.value = 0;
                r._blendeBestellen({ k: P.kLin });
                zeichne(false);
                const ohne = await schuss();
                const k = rend.toneMappingExposure;
                const pxM2 = 1 / (ppm * ppm);
                let [summe, spitze] = [0, 0];
                for (const zeit of P.zeiten) {
                    zeichne(true, zeit);
                    const mit = await schuss();
                    imKasten((p) => {
                        const [a, b] = [bildwert(mit, p * 4), bildwert(ohne, p * 4)];
                        spitze = Math.max(spitze, ...a);
                        summe += 0.2126 * (a[0] - b[0]) + 0.7152 * (a[1] - b[1]) + 0.0722 * (a[2] - b[2]);
                    });
                }
                // die Fläche des Leibs: 2 × halbe Breite × Länge × der mittlere Radius der Tafel (Trapez über ihre Stützstellen)
                let mittel = 0;
                for (let i = 1; i < Z.length; i++) mittel += ((Z[i][0] + Z[i - 1][0]) / 2 / rMax) * (Z[i][1] - Z[i - 1][1]);
                const flaeche = 2 * halb * P.langM * mittel;
                return {
                    k: +k.toPrecision(4),
                    cd: Math.round((summe / P.zeiten.length / k) * __weltLicht.EINHEIT_LX * pxM2),
                    sollCd: Math.round(FW.FEUER_LEUCHTDICHTE * flaeche),
                    flaecheM2: +flaeche.toFixed(4),
                    spitze: +spitze.toFixed(3),
                    schulter: P.schulter,
                };
            };
            // DER KOPF: der Stoff, den die Welt baut
            aus.optik = typeof r._flammeOptik === "function" ? r._flammeOptik() : null;
            aus.z1 = await z1();
            aus.z2 = await z2();
            // MUTANTE-L: das Gesetz von vorher über das Glied der Optik — der Stoff neu gebaut
            r._flammeOptik = () => ({ quelle: FW.FEUER_LEUCHTDICHTE, deckung: P.mutDeckung });
            abschied();
            try {
                aus.mut = { z1: await z1(), z2: await z2() };
            } finally {
                delete r._flammeOptik;
            }
        } catch (e) {
            aus.abbruch = fehlerStapel(e).split("\n").slice(0, 4).join(" ← ");
        } finally {
            delete r._flammeOptik;
            try {
                abschied();
            } catch (e) {
                aus.abbruch = aus.abbruch || "Abschied brandFlammenSatz: " + fehlerText(e);
            }
            r._blendeBestellen(null);
            r._bildZeit = zeitVor;
            cam.layers.mask = maskeVor;
            st.scene.remove(wand);
            wand.geometry.dispose();
            wandStoff.dispose();
            dev.removeEventListener("uncapturederror", gpuHoer);
            window.__buehne();
        }
        return aus;
    })();
}
function rauchProbe(ort, P) {
    return (async () => {
        const T = window.THREE;
        const [L, AR, rend, cam] = [T.TSL, r.constructor, st.renderer, st.camera];
        rend.setAnimationLoop(null);
        const aus = { gpuFehler: [] };
        const dev = rend.backend.device;
        const gpuHoer = (e) => aus.gpuFehler.push(String(e.error?.message || e.message || e).slice(0, 240));
        dev.addEventListener("uncapturederror", gpuHoer);
        const [R, tafelVor] = [AR.BRAND.bild.rauch, AR.RAUCH_BILD];
        const { x: x0, y: y0, z: z0 } = ort;
        const setzeKamera = () => {
            cam.position.set(x0, y0, z0);
            cam.up.set(0, 1, 0);
            cam.lookAt(x0, y0, z0 - 10);
            cam.updateMatrixWorld(true);
        };
        const M = new T.Vector3(x0, y0, z0 - P.abstandM);
        // die Wand hinter dem Ballen: ihr Ton vor der Tonkurve (÷ Belichtung, wie die Flamme in (j)) — 0 schwarz, `P.wand` hell
        const wandU = L.uniform(0);
        const wandStoff = new T.MeshBasicNodeMaterial();
        wandStoff.fog = false;
        wandStoff.colorNode = L.vec4(L.vec3(wandU).div(L.toneMappingExposure), 1);
        const wand = new T.Mesh(new T.PlaneGeometry(80, 60), wandStoff);
        wand.name = "post-kette:RAUCH";
        wand.frustumCulled = false;
        wand.position.set(x0, y0, M.z - P.wandM);
        // DIE EIGENE SCHICHT (wie die Flamme in (j)): das Auge zeichnet nur Wand und Ballen. Die Welt des Orts steht nicht im Bild —
        // ihr Strom-Stand (welcher Boden, welcher Halm zwischen Auge und Wand im Schein der Quelle liegt) hängt an Karte und Laufzeit
        const SCHICHT = 31;
        wand.layers.set(SCHICHT);
        const maskeVor = cam.layers.mask;
        // DER STÖRER: ein heller Streifen der WELT (Schicht 0) im unteren Viertel des Bilds, 3 m vor dem Auge — er steht die ganze
        // Probe über da, wie Boden im Schein der Quelle (z598 an der GTX 1060: ein Streifen von 0,19 der Bildbreite Höhe). Der
        // Kopf misst an ihm vorbei; MUTANTE-K0 stellt ihn in die Schicht der Probe, die Ecken reißen
        const stoerStoff = new T.MeshBasicNodeMaterial();
        stoerStoff.fog = false;
        stoerStoff.colorNode = L.vec4(L.vec3(P.stoerer).div(L.toneMappingExposure), 1);
        const stoerer = new T.Mesh(new T.PlaneGeometry(40, 10), stoerStoff);
        stoerer.name = "post-kette:RAUCH-STOERER";
        stoerer.frustumCulled = false;
        stoerer.position.set(x0, y0 - 5 - 1.5 * Math.tan((cam.fov * Math.PI) / 360), z0 - 3);
        // … das LICHT der Nacht bleibt (r184 liest ein Licht nur in einer Schicht des Auges): jedes Licht der Szene tritt für die
        // Dauer der Probe in ihre Schicht
        const lichter = [];
        st.scene.traverse((o) => o.isLight && !o.layers.isEnabled(SCHICHT) && lichter.push(o));
        // der Abschied eines Satzes, wie `_rauchZeichnen` ihn vor einem Neubau nimmt
        const abschied = (satz) => {
            const S = st[satz];
            if (!S) return;
            if (S.mesh.parent) S.mesh.parent.remove(S.mesh);
            r._instanzAbschied(S.mesh);
            S.geo.dispose();
            S.mat.dispose();
            st[satz] = null;
        };
        const GLIEDER = ["_rauchStoff", "_leuchtQuellen", "_blockerMit", "_weltNaht"];
        const vor = { brandRauch: st.brandRauch, flammen: r._brandFlammen, dorfRauch: st.dorfRauch, gemeldet: r._dorfRauchLogged, druckStaub: st.druckStaub };
        const fr = st.flightRecorder && typeof st.flightRecorder === "object" ? st.flightRecorder : null;
        const frVor = fr ? [fr.rauchQuellen, fr.rauchStamp] : null;
        try {
            const eigen = GLIEDER.filter((k) => Object.prototype.hasOwnProperty.call(r, k));
            if (eigen.length) throw new Error(`die Welt trägt schon eine Hülle um ${eigen.join(", ")} — die Probe stellte sie nicht zurück`);
            window.__buehne({ uhr: P.uhr });
            await r._himmelFrisch();
            r._applyDayNightToScene();
            setzeKamera();
            st.scene.add(wand);
            st.scene.add(stoerer);
            for (const o of lichter) o.layers.enable(SCHICHT);
            cam.layers.set(SCHICHT);
            abschied("brandRauchSatz");
            abschied("dorfRauchSatz");
            // (k4) DER MITHÖRER AM BAUER: jeder Stoff, den `_rauchStoff` liefert, mit Gesetz und Steigen
            const bauten = [];
            const stoffAlt = r._rauchStoff;
            r._rauchStoff = function (G, uZeit, steigMs) {
                const m = stoffAlt.apply(this, arguments);
                bauten.push({ m, G, steigMs });
                return m;
            };
            const leser = (satz, teilchen, soll) => {
                const S = st[satz];
                const b = S ? bauten.find((x) => x.m === S.mat) : null;
                const t = teilchen[0];
                return {
                    teilchen: teilchen.length,
                    satz: !!S,
                    bauer: !!b,
                    steigMs: b && Number.isFinite(b.steigMs) ? +b.steigMs.toFixed(4) : null,
                    soll: +soll.toFixed(4),
                    zug: !!t && [t.zx, t.zy, t.zz].every(Number.isFinite) && Math.hypot(t.zx, t.zy, t.zz) > 0,
                };
            };
            // die Fahne des Brands: EINE glühende Zelle mit EINER Flamme unter dem Ballen, der echte Leser legt den Satz an
            st.brandRauch = { teilchen: [], n: 0 };
            r._brandFlammen = [{ x: M.x, y: M.y - 3, z: M.z, lang: 1, I: 500 }];
            const zelle = [{ b: { glut: 1 }, von: 0, bis: 1, holz: 0.02 }]; // ihre Front verzehrt 0,02 kg Holz je Bild (0,2 kg/s): der Ballen trägt Masse (`_brandRauch`)
            for (let i = 0; i < 20 && !st.brandRauch.teilchen.length; i++) r._brandRauch(0.1, zelle, () => ({ x: 1, z: 0, ms: 1 }));
            const brand = leser("brandRauchSatz", st.brandRauch.teilchen, R.steigMs);
            [st.brandRauch, r._brandFlammen] = [vor.brandRauch, vor.flammen];
            // der Kamin: EIN Eintrag des Verzeichnisses „rauch" am Auge, der echte Leser legt den Satz an
            const KG = AR.Gesetz("fachwerk:RAUCH_GESETZ", null);
            const kaminHaus = { id: "post-kette:RAUCH", position: { x: x0, y: y0 - 4, z: z0 - 8 }, rotationY: 0, chimney: { x: 0, y: 1, z: 0 } };
            const blockerAlt = r._blockerMit;
            r._blockerMit = function (name) {
                return name === "rauch" ? [kaminHaus] : blockerAlt.apply(this, arguments);
            };
            st.dorfRauch = { quellen: [], teilchen: [] };
            // die Uhr läuft mit, wie im Spiel: der Wurf des Kamins ist an `spielZeit` gesät — mit stehender Uhr zog jeder Ruf
            // dieselbe Zahl, die Probe bestand nur mit p = 1 − 0,7⁶ = 0,88 (am Leser gezählt: 35 von 40 Starts; laufend 40 von 40;
            // OMEN z624 ROT „legte keinen Satz an“)
            // (über den EINEN Weg der Welt-Uhr von außen; sie geht nie zurück — die Probe nimmt ihre Sekunden nicht wieder)
            for (let i = 0; i < 200 && !st.dorfRauch.teilchen.length; i++) {
                r._updateDorfRauch(0.1);
                r._weltUhrNimm(st.spielZeit + 0.1);
            }
            const kamin = leser("dorfRauchSatz", st.dorfRauch.teilchen, (KG.vyBase + KG.vyRange / 2) * tafelVor.labHz);
            delete r._blockerMit;
            st.dorfRauch = vor.dorfRauch;
            abschied("dorfRauchSatz"); // der Kamin-Satz zeichnet nie: gemessen wird der Satz der Fahne
            // … und der Bauer ohne Steigen bricht laut
            let bruch = null;
            try {
                stoffAlt.call(r, R, L.uniform(0)).dispose();
            } catch (e) {
                bruch = fehlerText(e);
            }
            aus.leser = { brand, kamin, bruch, bauten: bauten.length };

            // DAS BILD: die Leinwand ganz, Luma je Pixel aus dem Ausgabe-Pfad
            const db = rend.getDrawingBufferSize(new T.Vector2());
            const [W, H] = [Math.round(db.x), Math.round(db.y)];
            const schuss = async () => {
                for (let i = 0; i < P.frames; i++) {
                    setzeKamera();
                    window.__loopBild();
                }
                setzeKamera();
                const { u8 } = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
                const l = new Float32Array(W * H);
                for (let p = 0; p < W * H; p++) l[p] = luma709(u8, p * 4);
                return l;
            };
            const pix = (v) => {
                const p = v.clone().project(cam);
                return [(0.5 + p.x / 2) * W, (0.5 - p.y / 2) * H];
            };
            setzeKamera();
            const rp = Math.abs(pix(M.clone().add(new T.Vector3(0, P.radiusM, 0)))[1] - pix(M)[1]); // der Radius im Bild (Pixel)
            // der Ton der Wand: das Mittel der vier Ecken des Bilds (fern vom Ballen)
            const ecken4 = (l, n = 12) =>
                [[0, 0], [W - n, 0], [0, H - n], [W - n, H - n]].map(([ex, ey]) => {
                    let s = 0;
                    for (let y = ey; y < ey + n; y++) for (let x = ex; x < ex + n; x++) s += l[y * W + x];
                    return s / (n * n);
                });
            const ecken = (l) => ecken4(l).reduce((s, x) => s + x, 0) / 4;
            const runde4 = (l) => ecken4(l).map((x) => +x.toFixed(2));
            // je Pixel im Ballen (ρ < `rand`): `f(p, dx, dy, ρ)`, dx / dy in Radien von der Mitte (dy > 0 = unten im Bild)
            const imBallen = ([cx, cy], f, grenze = P.rand) => {
                for (let y = Math.max(0, Math.floor(cy - rp)); y < Math.min(H, Math.ceil(cy + rp)); y++)
                    for (let x = Math.max(0, Math.floor(cx - rp)); x < Math.min(W, Math.ceil(cx + rp)); x++) {
                        const [dx, dy] = [(x + 0.5 - cx) / rp, (y + 0.5 - cy) / rp];
                        const rho = Math.hypot(dx, dy);
                        if (rho < grenze) f(y * W + x, dx, dy, rho);
                    }
            };
            const ballen = (m, zug = [0, 0, 0]) => ({ x: m.x, y: m.y, z: m.z, s: P.radiusM / R.size, a: P.deck, zx: zug[0], zy: zug[1], zz: zug[2] });
            const zeichne = (liste) => {
                r._rauchZeichnen(R, liste, "brandRauchSatz", R.maxTeilchen, R.steigMs);
                st.brandRauchSatz.mesh.layers.set(SCHICHT);
            };
            // DIE QUELLE DES LICHT-POOLS: eine Flammen-Fläche (`_flammenLicht`) unter dem Ballen — durch den EINEN Schreiber, bis
            // zum Fixpunkt ihrer Blende (wie die Bühne mit Uhr)
            // die Leuchtdichte der Quelle: Stärke (cd ÷ EINHEIT_LX) × k = `quelleBild` (die Lage vor der Welle), über `_flammenLicht`
            const FG = r._flammenLicht(P.flammeM);
            const kNacht = rend.toneMappingExposure;
            const quelleCd = (globalThis.__fachwerkCore.FEUER_LEUCHTDICHTE * (P.quelleBild * __weltLicht.EINHEIT_LX)) / (kNacht * FG.L.cd * FG.masse);
            const F = r._flammenLicht(P.flammeM, quelleCd);
            aus.quelleCd = +quelleCd.toPrecision(4);
            const quelle = { quelle: "brand", x: M.x + P.licht[0], y: M.y + P.licht[1], z: M.z + P.licht[2], L: F.L, masse: F.masse, phase: 0, rang: 0 };
            quelle.id = quelle;
            let brennt = false;
            r._leuchtQuellen = () => (brennt ? [quelle] : []);
            const licht = (an) => {
                brennt = an;
                setzeKamera();
                for (let i = 0; i < 4; i++) {
                    if (r._leuchtPool) r._leuchtPool.t = -Infinity;
                    r._leuchtTakt();
                    const Q = r._leuchtPool;
                    Q.halter.forEach((h, j) => (Q.blende[j] = h && Q.wahl.some((w) => w.id === h.id) ? 1 : 0));
                }
                r._leuchtTakt();
                // die Stärke in vier Stellen: in der EINEN Skala trägt die Quelle der Probe 5,5·10⁻⁴ (toFixed(3) las 0 — „blind")
                return r._leuchtPool.plaetze.map((p) => ({ quelle: p.quelle, staerke: +p.staerke.toPrecision(4), blende: p.blende, reichweite: p.reichweite }));
            };
            // (k1) UNTERSEITE: die untere Hälfte gegen die obere (je ab 0,15 Radien von der Mitte), dazu der Ton der Wand
            const haelften = async () => {
                zeichne([ballen(M)]);
                const l = await schuss();
                const s = { unten: 0, nu: 0, oben: 0, no: 0 };
                imBallen(pix(M), (p, dx, dy) => {
                    if (dy > 0.15) ((s.unten += l[p]), s.nu++);
                    else if (dy < -0.15) ((s.oben += l[p]), s.no++);
                });
                return { unten: +(s.unten / s.nu).toFixed(2), oben: +(s.oben / s.no).toFixed(2), grund: +ecken(l).toFixed(2), ecken: runde4(l), px: s.nu + s.no };
            };
            // die Deckung je Pixel vor der hellen Wand: 1 − Luma / Wand
            const deckung = (l) => {
                const w = ecken(l);
                const c = new Float32Array(l.length);
                for (let p = 0; p < l.length; p++) c[p] = Math.min(1, Math.max(0, 1 - l[p] / w));
                return Object.assign(c, { wand: w });
            };
            // (k2) das MUSTER eines Ballens: seine Deckung minus ihr Mittel je Ring um seine Mitte (das glatte Profil)
            const muster = (c, mitte) => {
                const nR = Math.max(4, Math.round(rp / 1.5));
                const [sum, n] = [new Float64Array(nR), new Float64Array(nR)];
                const ring = (rho) => Math.min(nR - 1, Math.floor(rho * nR));
                imBallen(mitte, (p, dx, dy, rho) => ((sum[ring(rho)] += c[p]), n[ring(rho)]++), 1);
                const m = new Float32Array(c.length).fill(NaN);
                imBallen(mitte, (p, dx, dy, rho) => (m[p] = c[p] - sum[ring(rho)] / n[ring(rho)]));
                return m;
            };
            // die Korrelation zweier Muster über die Pixel, die beide tragen
            const korr = (a, b) => {
                let [n, sa, sb, saa, sbb, sab] = [0, 0, 0, 0, 0, 0];
                for (let p = 0; p < a.length; p++) {
                    if (Number.isNaN(a[p]) || Number.isNaN(b[p])) continue;
                    n++;
                    sa += a[p];
                    sb += b[p];
                    saa += a[p] * a[p];
                    sbb += b[p] * b[p];
                    sab += a[p] * b[p];
                }
                const [va, vb] = [saa - (sa * sa) / n, sbb - (sb * sb) / n];
                return { r: n && va > 0 && vb > 0 ? +((sab - (sa * sb) / n) / Math.sqrt(va * vb)).toFixed(3) : NaN, px: n, hub: n ? +Math.sqrt(va / n).toFixed(4) : 0 };
            };
            const mitten = [-1, 1].map((s) => new T.Vector3(M.x + (s * P.versatz * P.radiusM) / 2, M.y, M.z));
            const koerper = async (mitBoden) => {
                const bild = async (m) => {
                    zeichne([ballen(m)]);
                    const l = await schuss();
                    const c = deckung(l);
                    return { m: muster(c, pix(m)), wand: c.wand, ecken: runde4(l) };
                };
                const [A, B] = [await bild(mitten[0]), await bild(mitten[1])];
                const k = korr(A.m, B.m);
                const aus2 = { gleich: k.r, px: k.px, hub: k.hub, wand: +A.wand.toFixed(1), ecken: A.ecken };
                if (mitBoden) aus2.boden = korr(A.m, (await bild(mitten[0])).m).r;
                return aus2;
            };
            // (k3) der UMRISS: Höhe zu Breite — die Zeilen gegen die Spalten des Bilds, in denen der Ballen deckt (Deckung > 0,04 in
            // mindestens 3 Pixeln: ein einzelnes Pixel zählt nicht). Die zweiten Momenten der Deckung taugen hier nicht: das Muster
            // der Welt verschiebt ihr Gewicht (der runde Ballen maß 0,767 statt 1)
            const umriss = async (zug) => {
                zeichne([ballen(M, zug)]);
                const c = deckung(await schuss());
                const [zeilen, spalten] = [new Uint16Array(H), new Uint16Array(W)];
                let s = 0;
                for (let p = 0; p < c.length; p++)
                    if (c[p] > 0.04) ((s += c[p]), zeilen[Math.floor(p / W)]++, spalten[p % W]++);
                const [hoch, breit] = [zeilen, spalten].map((a) => a.reduce((n, x) => n + (x >= 3), 0));
                return { form: +(hoch / breit).toFixed(3), hoch, breit, masse: +(s / (Math.PI * rp * rp)).toFixed(3) };
            };
            const mitTafel = async (aenderung, lauf) => {
                AR.RAUCH_BILD = Object.freeze({ ...tafelVor, ...aenderung });
                try {
                    return await lauf();
                } finally {
                    AR.RAUCH_BILD = tafelVor;
                }
            };
            Object.assign(aus, { uhr: st.timeOfDay, nf: st.postProcessingUniforms ? st.postProcessingUniforms.nightFactor.value : null, leinwand: [W, H], radiusPx: +rp.toFixed(1) });
            // DER KOPF: der Stoff, den der Leser gebaut hat
            wandU.value = 0;
            aus.licht = licht(true);
            aus.k = +rend.toneMappingExposure.toFixed(3);
            aus.unten = await haelften();
            // AUSKUNFT: derselbe Kopf bei der Leuchtdichte des Gesetzes (`FEUER_LEUCHTDICHTE`) — was das Auge der Nacht am Rauch über
            // einem Feuer von 2 m sieht (kein Urteil: das Verhältnis steht dort an der Klemme)
            quelle.masse = FG.masse;
            const lichtGesetz = licht(true);
            aus.gesetz = Object.assign(await haelften(), { staerke: lichtGesetz[0] ? lichtGesetz[0].staerke : null });
            quelle.masse = F.masse;
            licht(true);
            // MUTANTE-K0: der Störer tritt in die Schicht der Probe — dasselbe Bild wie der Kopf, die unteren Ecken zeigen ihn
            stoerer.layers.set(SCHICHT);
            aus.mutWand = (await haelften()).ecken;
            stoerer.layers.set(0);
            licht(false);
            aus.dunkel = await haelften();
            wandU.value = P.wand;
            aus.koerper = await koerper(true);
            const tempo = (P.streck * P.radiusM) / tafelVor.zug[0]; // m/s: die Tafel streckt um `streck` Radien
            aus.zug = { tempo: +tempo.toFixed(3), quer: await umriss([0, tempo, 0]), laengs: await umriss([0, 0, -tempo]) };
            // MUTANTE-K3: die Tafel ohne Streckung (der Satz liest `zug` je Bild — derselbe Stoff, derselbe Ballen)
            aus.mutZug = await mitTafel({ zug: Object.freeze([0, tafelVor.zug[1]]) }, async () => ({ quer: await umriss([0, tempo, 0]) }));
            // MUTANTE-K1: die Normale zeigt zum Auge (`woelbung` 0) — der Stoff neu gebaut
            wandU.value = 0;
            licht(true);
            aus.mutUnten = await mitTafel({ woelbung: 0 }, async () => {
                abschied("brandRauchSatz");
                return await haelften();
            });
            licht(false);
            // MUTANTE-K2: das Muster hängt am Ballen (der Anker der Naht 0: die Lage zählt ab seiner Mitte, wie vorher um den Samen)
            wandU.value = P.wand;
            abschied("brandRauchSatz");
            const nahtAlt = r._weltNaht;
            r._weltNaht = function (Tn) {
                return Object.assign(Object.create(nahtAlt.call(this, Tn)), { anker: Tn.vec3(0, 0, 0) });
            };
            try {
                aus.mutKoerper = await koerper(false);
            } finally {
                delete r._weltNaht;
            }
            // (k4) DER DRITTE LESER + (k5) EIN PROGRAMM: Fahne, Kamin und Staub je mit EINEM Ballen vor dem Auge, jeder Satz von
            // seinem echten Leser angelegt (die Fahne wie oben, der Kamin über sein Verzeichnis, der Staub aus EINER fälligen Saat)
            const staubSaat = () => {
                abschied("druckStaubSatz");
                st.druckStaub = { saat: [{ t: st.spielZeit, x: M.x + 2.5, z: M.z, boden: M.y - 1, b: 1, r: 1, m: 0.01, tr2: 0.5, sink: P.staubSink }], teilchen: [], uhr: null, sink: 0 };
                r._druckBild();
                if (st.druckStaubSatz) Object.assign(st.druckStaubSatz.mesh, { frustumCulled: false }).layers.set(SCHICHT);
            };
            // je Satz die Programm-Paare seiner Render-Objekte (r184: `pipeline.vertexProgram` / `.fragmentProgram`)
            const programme = (satz) => {
                const S = st[satz];
                const z = S && (S.mesh.__arena || S.mesh.__zeichner); // die Senke zeichnet aus der Arena ihres Stoffs, sonst über ihren Zeichner
                const ros = (z && z.__renderObjekte) || [];
                return Array.from(new Set(ros.filter((ro) => ro.pipeline).map((ro) => `v${ro.pipeline.vertexProgram.id}/f${ro.pipeline.fragmentProgram.id}`))).sort();
            };
            const zweiBilder = () => {
                for (let i = 0; i < 2; i++) {
                    setzeKamera();
                    window.__loopBild();
                }
            };
            abschied("brandRauchSatz");
            zeichne([ballen(M)]);
            r._blockerMit = function (name) {
                return name === "rauch" ? [kaminHaus] : blockerAlt.apply(this, arguments);
            };
            st.dorfRauch = { quellen: [], teilchen: [] };
            for (let i = 0; i < 200 && !st.dorfRauch.teilchen.length; i++) {
                r._updateDorfRauch(0.1);
                r._weltUhrNimm(st.spielZeit + 0.1);
            }
            delete r._blockerMit;
            if (st.dorfRauchSatz) Object.assign(st.dorfRauchSatz.mesh, { frustumCulled: false }).layers.set(SCHICHT);
            staubSaat();
            aus.leser.staub = leser("druckStaubSatz", st.druckStaub.teilchen, P.staubSink);
            zweiBilder();
            aus.programm = { brand: programme("brandRauchSatz"), kamin: programme("dorfRauchSatz"), staub: programme("druckStaubSatz") };
            // MUTANTE-K5: der Stoff des Staubs trägt sein Steigen als Zahl im Shader-Text (die Klasse des Täters)
            const stoffK5 = r._rauchStoff;
            r._rauchStoff = function (G, uZeit, steigMs) {
                const m = stoffK5.apply(this, arguments);
                m.opacityNode = m.opacityNode.mul(1 - 1e-3 * steigMs);
                return m;
            };
            try {
                staubSaat();
                zweiBilder();
                aus.programm.mutante = programme("druckStaubSatz");
            } finally {
                r._rauchStoff = stoffK5;
            }
            aus.leser.bauten = bauten.length;
        } catch (e) {
            aus.abbruch = fehlerStapel(e).split("\n").slice(0, 4).join(" ← ");
        } finally {
            for (const k of GLIEDER) delete r[k];
            AR.RAUCH_BILD = tafelVor;
            [st.brandRauch, r._brandFlammen, st.dorfRauch, r._dorfRauchLogged, st.druckStaub] = [vor.brandRauch, vor.flammen, vor.dorfRauch, vor.gemeldet, vor.druckStaub];
            if (fr) [fr.rauchQuellen, fr.rauchStamp] = frVor;
            for (const satz of ["brandRauchSatz", "dorfRauchSatz", "druckStaubSatz"]) {
                try {
                    abschied(satz);
                } catch (e) {
                    aus.abbruch = aus.abbruch || "Abschied " + satz + ": " + fehlerText(e);
                }
            }
            cam.layers.mask = maskeVor;
            for (const o of lichter) o.layers.disable(SCHICHT);
            st.scene.remove(wand);
            st.scene.remove(stoerer);
            stoerer.geometry.dispose();
            stoerStoff.dispose();
            wand.geometry.dispose();
            wandStoff.dispose();
            if (r._leuchtPool) r._leuchtPool.t = -Infinity;
            dev.removeEventListener("uncapturederror", gpuHoer);
            window.__buehne();
        }
        return aus;
    })();
}

(async () => {
    console.log(
        "=== POST-KETTE — echter Renderer (WebGPU, swiftshader-Adapter, kienspan): Weiche · Tiefe · Shader · Godrays · Zugang · Rauch ==="
    );
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 900000, erwartet: ERZWUNGEN });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    // die ERROR-Zeilen der Seite (das Spiel meldet über `log(…, "ERROR")` → console.log „[ERROR]")
    const konsolenFehler = [];
    page.on("console", (m) => {
        const t = m.text();
        if (m.type() === "error" || /\[ERROR\]/.test(t)) konsolenFehler.push(t.slice(0, 240));
    });
    let out = null;
    const log = laufUhr();
    try {
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        // Die Kette steht erst nach dem ersten Frame mit bereitem Renderer (`_ensurePostProcessing` im Loop).
        await postKetteBereit(page, log, "die Leinwand-Tiefe lebt nur dort, die Wand wäre blind");
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(SK.SHADER_INSTALL);
        out = await page.evaluate(buehne, N_FRAMES, DUNKEL_NACHT_LICHT, FLAMME_PROBE, TOR_PROBE, KNIE_PROBE);
        // (j3) der GANZE Stamm (Lehre 12: über scripts/lib/stamm.cjs, ohne Kommentare): außerhalb von `_nachtAuge` liest niemand
        // die Schwellen des Auges (`fehlt.wo` nennt den Zwilling mit Datei und Zeile)
        if (out.flamme && out.flamme.quelle)
            out.flamme.quelle.zwilling = STAMM.fehlt({ ausser: "_nachtAuge" }, /\.(?:staebchenCd|zapfenCd)\b/) ? null : STAMM.fehlt.wo;
        for (const [name, tn] of Object.entries((out.flamme && out.flamme.toene) || {})) {
            const [fT, fN] = [hsv(tn.tag), hsv(tn.nacht)];
            log(
                `Flamme ${name.toUpperCase()} (${tn.kelvin} K, Belichtung ${tn.k}): Tag ${JSON.stringify(tn.tag)} (Farbton ${fT.ton}°, Sättigung ${fT.satt}) ↔ Nacht ${JSON.stringify(tn.nacht)} (Farbton ${fN.ton}°, Sättigung ${fN.satt}) · Δ ${kanalAbstand(tn.tag, tn.nacht)} je Kanal (${FLAMME_BAND[name].nachtSatt ? `Grenze der Umkehr: Soll Sättigung der Nacht ≥ ${FLAMME_BAND[name].nachtSatt}` : `Soll ≤ ${FLAMME_TOL}`}) · ` +
                    `MUTANTE-J ohne Umkehr ${JSON.stringify(tn.ohne)} (Sättigung ${hsv(tn.ohne).satt}) · Δ ${kanalAbstand(tn.tag, tn.ohne)}`
            );
            const fl = out.flamme;
            if (FLAMME_BAND[name].konsum && fl.kurve && fl.kurve.schulter > 0 && fl.kelvin0 > 0) {
                const soll = flammenSoll(tn.kelvin, fl.kelvin0, tn.k, fl.kurve);
                log(`Flamme ${name.toUpperCase()} KONSUM: am Schirm ${JSON.stringify(tn.tag)} ↔ Soll ${JSON.stringify(soll)} · Δ ${[0, 1, 2].map((c) => (tn.tag[c] - soll[c]).toFixed(2)).join(" / ")} je Kanal (Soll ± ${FLAMME_KONSUM_TOL}) · Kurve ${JSON.stringify(fl.kurve)}, Wurzel ${fl.kelvin0} K`);
            }
        }
        const kn = out.flamme && out.flamme.knie;
        if (kn)
            for (const [name, tn] of Object.entries(kn.toene || {})) {
                const m = knieMass(tn, kn.n, out.flamme.kurve && out.flamme.kurve.schulter);
                log(`Knie ${name.toUpperCase()} (${kn.n} Stützstellen, Leinwand ${kn.leinwand}, ${KNIE_PROBE.von}–${KNIE_PROBE.bis} × Weiß): ${JSON.stringify(tn.reihe[0])} … ${JSON.stringify(tn.reihe.at(-1))} · größte Stufe ${m.stufe} / 255 bei Spalte ${m.wo} (Eingang ${m.eingang} × Weiß; Soll ≤ ${KNIE_STUFE}) · größte Abweichung von der Rechen-Form ${m.abw}`);
            }
        if (kn && kn.abbruch) log(`Knie: ABBRUCH ${kn.abbruch}`);
        const torAus = (out.flamme && out.flamme.tor) || {};
        for (const [name, tn] of Object.entries(torAus.toene || {})) {
            const [fT, fN] = [hsv(tn.tag), hsv(tn.nacht)];
            log(
                `Tor-Zielbild ${name.toUpperCase()} (Wert ${JSON.stringify(tn.wert)}, Belichtung ${tn.k}): Tag ${JSON.stringify(tn.tag)} (Farbton ${fT.ton}°, Sättigung ${fT.satt}) ↔ Nacht ${JSON.stringify(tn.nacht)} (Farbton ${fN.ton}°, Sättigung ${fN.satt}) · Δ ${kanalAbstand(tn.tag, tn.nacht)} je Kanal · ` +
                    `MUTANTE-TOR ohne Umkehr ${JSON.stringify(tn.ohne)} (Sättigung ${hsv(tn.ohne).satt}) · Δ ${kanalAbstand(tn.tag, tn.ohne)}`
            );
        }
        if (out.flamme) log(`Tor: ${JSON.stringify({ gestalt: torAus.gestalt, rufe: torAus.rufe, zeilen: torAus.zeilen, belicht: torAus.belicht })}${torAus.abbruch ? " · ABBRUCH " + torAus.abbruch : ""}`);
        if (out.flamme) log(`Flamme, EINE QUELLE:${JSON.stringify(out.flamme.quelle)}${out.flamme.abbruch ? " · ABBRUCH " + out.flamme.abbruch : ""}`);
        if (out.abbruch) log(`ABBRUCH: ${out.abbruch}`);
        // (f) die ungerade Leinwand: die Seite wächst um ein Pixel je Achse, die Welt zieht nach (Resize, Leser neu gebunden)
        await page.setViewport({ width: 321, height: 241 });
        await page.evaluate(async () => {
            for (let i = 0; i < 6; i++) {
                window.__loopBild();
                await sleep(50);
            }
        });
        const b = out.buehne;
        log(`Bühne: Boden ${b.boden.toFixed(1)} m · Wasser ${b.wasserY.toFixed(1)} m · Eis-Linie ${b.eisNull.toFixed(1)} m`);
        out.saum = await page.evaluate(saumProbe, b);
        out.zugang = await page.evaluate(zugangProbe);
        log(`Zugang: ${JSON.stringify(out.zugang)}`);
        // (k) der Rauch zuletzt: er stellt die Nacht und baut drei Stoffe (Kopf und zwei Mutanten)
        out.rauch = await page.evaluate(rauchProbe, { x: b.x, y: b.boden + RAUCH_PROBE.ueberBodenM, z: b.z }, RAUCH_PROBE);
        // (k4) der GANZE Stamm (Lehre 12): die Attribute des Rauchs liest nur das EINE Bild (`fehlt.wo` nennt den Zwilling)
        if (out.rauch.leser)
            out.rauch.leser.zwilling = STAMM.fehlt({ ausser: ["_rauchZeichnen", "_rauchStoff"] }, /["'`]a(?:Rauch|Zug)["'`]/) ? null : STAMM.fehlt.wo;
        for (const z of rauchZeilen(out.rauch)) log(z);
        // (l) die Zunge nach dem Rauch: sie stellt den Mittag
        out.zunge = await page.evaluate(zungeProbe, b, { ...ZUNGE_PROBE, ...zungeMass() });
        for (const z of zungeZeilen(out.zunge)) log(z);
        if (out.saum)
            log(
                `Saum (ungerade Leinwand ${out.saum.leinwand.join("×")}): ${out.saum.abweichend} von ${out.saum.kanten} Kanten-Pixeln links am Pfahl weichen > 8 Luma ab (größte ${out.saum.dMax}, Paritäten ${out.saum.paritaeten})${out.saum.abbruch ? " · ABBRUCH " + out.saum.abbruch : ""}`
            );
        for (const s of out.schritte)
            log(
                `${s.name}: ${s.direkt ? "Direktpfad" : "Post-Kette"} · Tiefe ${s.tiefe} · Leinwand-Tiefe auf der GPU ${s.leinwandTiefeGpu} · ` +
                    `Rahmen-Ziele ${s.rahmenZiel ? `${s.rahmenZiel.ziele} (${s.rahmenZiel.n} Texturen, ${s.rahmenZiel.mb} MB)` : "?"} · ` +
                    `Tiefen-Kopien ${s.tiefenKopien} · Mitte ${JSON.stringify(s.mitte)} · Abbild ${s.abbild && !s.abbild.fehlt ? `${s.abbild.format} ${s.abbild.groesse.join("×")} Mitte ${s.abbild.mitte}/${s.abbild.soll}` : "fehlt"}${s.fehler.length ? " · FEHLER " + s.fehler[0] : ""}`
            );
        if (out.rahmenEnde)
            log(`Rahmen-Ziele am Ende: ${out.rahmenEnde.ziele} (${out.rahmenEnde.n} Texturen, ${out.rahmenEnde.mb} MB)`);
        if (out.drift)
            log(
                `Drift (r184s Abschied entfernt): ${out.drift.hoererWeg} Hörer fort · ERROR-Meldungen ${JSON.stringify(out.drift.fehler)}`
            );
        out.ausgabe = out.ausgabeWgsl ? SK.wgslKosten(out.ausgabeWgsl) : null;
        if (out.ausgabe)
            log(
                `Ausgabe-Fragment: ${out.ausgabe.abtastungen.gesamt} Abtastungen (unbedingt ${out.ausgabe.abtastungen.unbedingt} · ` +
                    `Zweig ${out.ausgabe.abtastungen.zweig} · Schleife ${out.ausgabe.abtastungen.schleife}) · ${out.ausgabe.schleifen} Schleifen · ` +
                    `${out.ausgabe.rauschen} Rausch-Aufrufe`
            );
        if (process.env.POST_KETTE_WGSL && out.ausgabeWgsl)
            fs.writeFileSync(process.env.POST_KETTE_WGSL, out.ausgabeWgsl);
        if (out.wasser)
            log(
                `Wasser über dem Grund: Abbild ${JSON.stringify(out.wasser.abbild)} · r184-Tiefe ${JSON.stringify(out.wasser.r184)} · ` +
                    `Abbild wieder ${JSON.stringify(out.wasser.zurueck)} · ohne Grund ${JSON.stringify(out.wasser.ohneGrund)} · umgehängt ${JSON.stringify(out.wasser.umgehaengt)}`
            );
        const sw = out.godray && out.godray.schacht ? out.godray.schacht.wgsl : null;
        out.schacht = sw ? SK.wgslKosten(sw) : null;
        if (out.godray && out.godray.schacht) delete out.godray.schacht.wgsl;
        if (out.godray)
            log(
                `Godrays mit der Sonne im Bild: Stärke ${out.godray.staerke} · ${out.godray.aenderungPct} % der Pixel geändert (Rausch-Boden ${out.godray.rauschenPct} %) · Lage: Marsch-Ziel ${out.godray.lage && out.godray.lage.ziel} ↔ Scheibe ${out.godray.lage && out.godray.lage.sonne} (screenUV) · ` +
                    `Schacht: ${JSON.stringify(out.godray.schacht)}, Fragment ${out.schacht ? `${out.schacht.proben} Proben · ${out.schacht.ladungen} Ladungen` : "fehlt"}`
            );
    } catch (e) {
        out = { error: fehlerText(e) };
    }
    await seiteZu(browser, server, out);
    out.konsolenFehler = konsolenFehler;
    const v = urteil(out);
    rotListe(v);
    const a = out.ausgabe.abtastungen;
    console.log(
        `\n✅ GRÜN — fünf Wege durch die Weiche ohne Fehler (mit der Drift ohne r184s Abschied), der Direktpfad zeichnet mit Tiefe, die Post-Kette ohne Leinwand-Tiefe und ohne Rahmen-Ziel; ` +
            `die Ausgabe tastet unbedingt ${a.unbedingt}×, ${a.zweig}× nur hinter ihrer Stärke; die Godrays tragen mit der Sonne im Bild ` +
            `(${out.godray.aenderungPct} % der Pixel gegen ${out.godray.rauschenPct} % Rauschen), ihr Schacht lief ${out.godray.schacht.laeufeMit}× mit und 0× ohne Stärke; das Wasser liest das Tiefen-Abbild wie r184s Tiefe ` +
            `(${JSON.stringify(out.wasser.abbild)} gegen ${JSON.stringify(out.wasser.r184)}, ohne Grund ${JSON.stringify(out.wasser.ohneGrund)}); ` +
            `das Dunkel trägt (Luma ${out.dunkel.luma1} bei Belichtung 1, ${out.dunkel.luma4} bei 4, die Nacht ${out.dunkel.lumaNacht}); ` +
            `die Flamme steht vor dem Auge der Nacht (${Object.entries(out.flamme.toene)
                .map(([n, tn]) => `${n.toUpperCase()} Tag ${JSON.stringify(tn.tag)} ↔ Nacht ${JSON.stringify(tn.nacht)} Δ ${kanalAbstand(tn.tag, tn.nacht)}, ohne Umkehr Δ ${kanalAbstand(tn.tag, tn.ohne)}`)
                .join(" · ")}; Soll ≤ ${FLAMME_TOL}), das Zielbild des Tors auch (${Object.entries(out.flamme.tor.toene)
                .map(([n, tn]) => `${n.toUpperCase()} Tag ${JSON.stringify(tn.tag)} ↔ Nacht ${JSON.stringify(tn.nacht)}, ohne Umkehr ${JSON.stringify(tn.ohne)}`)
                .join(" · ")}), die Schwellen des Auges liest nur \`_nachtAuge\`; der Zugang aus ohne Farbsicht-Knoten, der Himmel bleibt; ` +
            `der Rauch ist EIN Bild (Unterseite ${rauchVerh(out.rauch.unten)}× die Oberseite, flach ${rauchVerh(out.rauch.mutUnten)}×; zwei Ballen ein Muster ${out.rauch.koerper.gleich}, am Ballen ${out.rauch.mutKoerper.gleich}; ` +
            `der Zug streckt ${out.rauch.zug.quer.form}, längs des Blicks ${out.rauch.zug.laengs.form}, ohne Streckung ${out.rauch.mutZug.quer.form}; Fahne und Kamin aus \`_rauchStoff\`); ` +
            `die Zunge verdunkelt ihren Grund nicht (${out.zunge.z1.dunkel} von ${out.zunge.z1.px} Pixeln vor der Karte am Mittag, MUTANTE-L ${out.zunge.mut.z1.dunkel}) und trägt die Lichtstärke ihres Gesetzes ` +
            `(${out.zunge.z2.cd} cd gegen ${out.zunge.z2.sollCd} cd, MUTANTE-L ${out.zunge.mut.z2.cd} cd).`
    );
})();
