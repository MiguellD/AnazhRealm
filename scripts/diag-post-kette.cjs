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
//       (K/kelvin[0])⁴ × BRAND.bild.flamme.ziel ÷ Belichtung, wie die Tafel in `_brandFlammenZeichnen`) für KERN (kelvin[0]) und
//       MANTEL (2350 K, die Mitte der Tafel); gemessen die Bild-Mitte nach der ganzen Kette bei fester Belichtung 1,5.
//       (j1) NACHT = TAG je Ton (nightFactor 1 gegen 0, je Kanal ≤ FLAMME_TOL); MUTANTE-J im selben Lauf: derselbe Ton OHNE die
//       Umkehr reißt bei nightFactor 1 (die Nacht entsättigt — sonst ist die Probe blind).
//       (j2) der Ton liest sich als Feuer: KERN gelb-orange, MANTEL orange-rot (Farbton und Sättigung HSV in ihren Bändern).
//       (j3) EINE QUELLE: die Schwellen `NACHT_AUGE` liest im ganzen Stamm nur `_nachtAuge` (`stammLib.fehlt` außer dem Glied),
//       seine Uniform ist die der Kette; die Post-Kette ruft es, die Flamme ruft seine Umkehr (`__fehlt` am lebenden Code).
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
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): die Shader-Kosten-Linse an gebauten WGSL-Stücken und das
// Urteil über einen grünen Lauf und je einen injizierten Täter — jeder fällt rot und wird genannt.
//   node scripts/diag-post-kette.cjs [--selftest]   (npm run gate:post-kette)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, starteBrowser, postKetteBereit, laufUhr, taeterFaelle, selbsttestEnde, fs, SELBSTTEST, fehlerText, seiteZu, rotListe, jsonKlon } = require("./lib/welt-boot.cjs");
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
// (j) Die Flamme: beide Töne bei Belichtung FLAMME_PROBE.k (eine Nacht-Belichtung — Tag und Nacht unterscheidet NUR das Auge der
// Nacht), der MANTEL bei FLAMME_PROBE.mantelK. FLAMME_TOL: so weit darf die Bild-Mitte je Kanal (8 Bit) zwischen nightFactor 0 und 1
// auseinanderliegen — und um mehr muss die Mutante ohne Umkehr reißen. FLAMME_BAND: Farbton (Grad) und Sättigung (HSV) je Ton.
const FLAMME_PROBE = { k: 1.5, mantelK: 2350 };
// Gemessen (swiftshader, dfa9edee): KERN Tag [249,184,122] ↔ Nacht [249,184,124], Δ 2 (ohne Umkehr Δ 29); der MANTEL reißt — Tag
// [200,118,18] ↔ Nacht [199,115,85], Δ 67 (ohne Umkehr Δ 73): sein Blau liegt unter Leuchtdichte × Stäbchen-Anteil, die Umkehr
// klemmt bei 0 (Farbton 15,8°, Sättigung 0,573; ohne Umkehr 0,474). DIE GRENZE DER UMKEHR, benannt: unter einem Auge, das je
// Pixel nach der Leuchtdichte entsättigt, gibt es einen dunklen gesättigten Ton nicht — jeder Kanal trägt mindestens Leuchtdichte ×
// Stäbchen-Anteil. Der KERN (hell) kommt ganz zurück, der MANTEL nur zum Teil: er wird an seiner SÄTTIGUNG der Nacht geurteilt
// (`nachtSatt`, zwischen mit und ohne Umkehr), nicht an Tag = Nacht. Die Bänder (j2) liegen um das Gemessene am Tag.
const FLAMME_TOL = 6;
const FLAMME_BAND = { kern: { ton: [22, 40], satt: 0.42, name: "gelb-orange" }, mantel: { ton: [22, 42], satt: 0.75, name: "orange", nachtSatt: 0.53 } };
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
// zeitliche Glättung der Kette schwingt ein).
const RAUCH_PROBE = { uhr: 0, abstandM: 4.5, wandM: 6, radiusM: 1, deck: 0.45, licht: [0, -2, 3], flammeM: 2, versatz: 0.5, streck: 1, rand: 0.8, wand: 0.3, frames: 6 };
// GEMESSEN (swiftshader, c5713056, Leinwand 321×241, der Lauf zweimal Zahl für Zahl gleich) — der Kopf und, im selben Lauf, jede
// Mutante; der Selbsttest urteilt an genau diesen Zahlen (grün am Kopf, rot an jeder Mutanten-Zahl an seiner Stelle). Auf der
// Karte (GTX 1050, ein Lauf): unten ÷ oben 5,97 / flach 3,28 · Korrelation 0,749 / −0,318 · Höhe zu Breite 2 / 0,926 / 0,926.
const RAUCH_GEMESSEN = {
    kopf: {
        gpuFehler: [],
        uhr: 0,
        nf: 1,
        k: 1.505,
        leinwand: [321, 241],
        radiusPx: 34.9,
        licht: [{ quelle: "brand", staerke: 17.177, blende: 1, reichweite: 23.68 }],
        unten: { unten: 41.4, oben: 6.96, grund: 0, px: 4496 },
        dunkel: { unten: 0.24, oben: 1, grund: 0, px: 4496 },
        mutUnten: { unten: 47.5, oben: 14.5, grund: 0, px: 4496 },
        koerper: { gleich: 0.749, px: 1491, hub: 0.0964, wand: 139.1, boden: 1 },
        mutKoerper: { gleich: -0.316, px: 1491, hub: 0.0783, wand: 139.1 },
        zug: { tempo: 1.667, quer: { form: 2, hoch: 96, breit: 48, masse: 0.122 }, laengs: { form: 0.926, hoch: 50, breit: 54, masse: 0.094 } },
        mutZug: { quer: { form: 0.926, hoch: 50, breit: 54, masse: 0.094 } },
        leser: {
            brand: { teilchen: 1, satz: true, bauer: true, steigMs: 2.5, soll: 2.5, zug: true },
            kamin: { teilchen: 1, satz: true, bauer: true, steigMs: 1.2, soll: 1.2, zug: true },
            bruch: "_rauchStoff: der Rauch ohne Steigen (m/s) trägt kein Muster",
            bauten: 4,
            zwilling: null,
        },
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
const RAUCH_BAND = { unten: [4.8, 7.2], lichtMin: 20, gleich: 0.5, boden: 0.95, hubMin: 0.03, pxMin: 25, kPxMin: 1000, masseMin: 0.05, quer: [1.7, 2.3], laengs: [0.8, 1.15] };
const rauchVerh = (u) => (u ? +((u.unten - u.grund) / Math.max(0.5, u.oben - u.grund)).toFixed(2) : NaN);
const RAUCH_ORT = "stamm/siedlung-bewohner.js `_rauchStoff`";
// (k) DAS URTEIL ÜBER DEN RAUCH: je Zeile der Täter (Datei, Glied, Zahl); eine Mutante, die ihr Band nicht reißt, ist „blind".
function rauchUrteil(ra) {
    if (!ra) return ["RAUCH: die Probe lief nicht"];
    if (ra.abbruch) return [`RAUCH: ABBRUCH — ${ra.abbruch}`];
    const [v, B, P] = [[], RAUCH_BAND, RAUCH_PROBE];
    const im = (x, [a, b]) => x >= a && x <= b;
    if (ra.gpuFehler?.length) v.push(`RAUCH: ${ra.gpuFehler.length} GPU-Validierungs-Fehler: ${ra.gpuFehler[0]}`);
    if (!(ra.uhr === P.uhr && ra.nf === 1)) v.push(`RAUCH: die Bühne stand bei Uhr ${ra.uhr} / nightFactor ${ra.nf} statt ${P.uhr} / 1 — Sonne und Himmel reden mit (die Probe ist blind)`);
    if (!(ra.radiusPx >= B.pxMin)) v.push(`RAUCH: der Ballen misst ${ra.radiusPx} Pixel Radius im Bild (Soll ≥ ${B.pxMin}) — die Probe ist blind`);
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
        for (const [name, glied, x] of [["die Fahne des Brands", "stamm/feld-leben.js `_brandRauch`", le.brand], ["der Kamin", "stamm/siedlung-bewohner.js `_updateDorfRauch`", le.kamin]]) {
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
    return v;
}
// (k) die Mess-Zeilen des Rauchs (der Lauf schreibt sie, grün wie rot)
function rauchZeilen(ra) {
    if (!ra || ra.abbruch) return [`Rauch: ${ra ? "ABBRUCH " + ra.abbruch : "lief nicht"}`];
    const B = RAUCH_BAND;
    const j = JSON.stringify;
    return [
        `Rauch (Uhr ${ra.uhr}, nightFactor ${ra.nf}, Belichtung ${ra.k}, Leinwand ${ra.leinwand.join("×")}, Radius ${ra.radiusPx} Pixel) · Licht-Pool ${j(ra.licht)}`,
        `Rauch (k1) UNTERSEITE: unten ${ra.unten.unten} / oben ${ra.unten.oben} (Wand ${ra.unten.grund}) = ${rauchVerh(ra.unten)} (Soll ${B.unten[0]}–${B.unten[1]}) · ohne Quelle unten ${ra.dunkel.unten} / oben ${ra.dunkel.oben} · MUTANTE-K1 woelbung 0: unten ${ra.mutUnten.unten} / oben ${ra.mutUnten.oben} = ${rauchVerh(ra.mutUnten)}`,
        `Rauch (k2) EIN KÖRPER: Korrelation ${ra.koerper.gleich} (Soll ≥ ${B.gleich}; ${ra.koerper.px} Pixel, Hub ${ra.koerper.hub}, Wand ${ra.koerper.wand}, derselbe zweimal ${ra.koerper.boden}) · MUTANTE-K2 am Ballen: ${ra.mutKoerper.gleich} (${ra.mutKoerper.px} Pixel, Hub ${ra.mutKoerper.hub})`,
        `Rauch (k3) ZUG ${ra.zug.tempo} m/s: quer ${j(ra.zug.quer)} (Soll ${B.quer[0]}–${B.quer[1]}) · längs ${j(ra.zug.laengs)} (Soll ${B.laengs[0]}–${B.laengs[1]}) · MUTANTE-K3 ohne Streckung: quer ${j(ra.mutZug.quer)}`,
        `Rauch (k4) BEIDE LESER: ${j(ra.leser)}`,
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
            if (!band.nachtSatt && !(dM > FLAMME_TOL))
                v.push(
                    `FLAMME: ${N} — MUTANTE-J (der Ton OHNE die Umkehr, nightFactor 1) zeigt ${JSON.stringify(tn.ohne)} gegen den Tag ${JSON.stringify(tn.tag)} (Δ ${dM} ≤ ${FLAMME_TOL}) — das Auge der Nacht entsättigt die Flamme nicht (die Probe ist blind)`
                );
            if (!(f.ton >= band.ton[0] && f.ton <= band.ton[1] && f.satt >= band.satt))
                v.push(
                    `FLAMME: ${N} (${tn.kelvin} K) liest sich nicht als Feuer — ${JSON.stringify(tn.tag)}: Farbton ${f.ton}° (Soll ${band.ton[0]}–${band.ton[1]}°, ${band.name}), Sättigung ${f.satt} (Soll ≥ ${band.satt})`
                );
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
    }
    // (k) DER RAUCH
    for (const x of rauchUrteil(z.rauch)) v.push(x);
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
                kern: { kelvin: 3000, k: 1.5, nfTag: 0, nfNacht: 1, nfOhne: 1, tag: [250, 190, 110], nacht: [250, 190, 110], ohne: [240, 200, 150] },
                mantel: { kelvin: 2350, k: 1.5, nfTag: 0, nfNacht: 1, nfOhne: 1, tag: [200, 118, 18], nacht: [199, 115, 85], ohne: [173, 124, 91] },
            },
            quelle: { uniform: true, augeLiest: true, zwilling: null, kette: true, umkehr: true },
        },
        zugang: {
            himmel: ["himmel"],
            anTraegt: true,
            tritanopie: { himmel: 0, himmelPx: 4700, kiste: 90, kistePx: 100 },
        },
        rauch: jsonKlon(RAUCH_GEMESSEN.kopf),
    };
    const RM = RAUCH_GEMESSEN;
    const faelle = [
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
        ["Flamme nicht vor dem Auge der Nacht (MUTANTE-J: ohne Umkehr)", (z) => (z.flamme.toene.kern.nacht = z.flamme.toene.kern.ohne), /FLAMME: KERN \(3000 K\) — .*steht nicht vor dem Auge der Nacht/],
        ["Mantel entsättigt in der Nacht", (z) => (z.flamme.toene.mantel.nacht = z.flamme.toene.mantel.ohne), /FLAMME: MANTEL \(2350 K\) — .*ohne dass seine Umkehr/],
        ["Flammen-Mutante reißt nicht (blind)", (z) => (z.flamme.toene.kern.ohne = z.flamme.toene.kern.tag), /FLAMME: KERN — MUTANTE-J .*die Probe ist blind/],
        ["Flammen-Probe ohne Nacht (blind)", ["flamme.toene.mantel.nfNacht=", 0], /FLAMME: MANTEL — .*nightFactor bei 0 \/ 0 \/ 1/],
        ["Flammen-Probe bei fremder Belichtung (blind)", ["flamme.toene.kern.k=", 1], /FLAMME: KERN — die Belichtung stand bei 1 statt 1\.5/],
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
        ["die Fahne zeichnet einen Zwillings-Stoff", ["rauch.leser.brand.bauer=", false], /RAUCH: BEIDE LESER — der Stoff, den die Fahne des Brands \(stamm\/feld-leben\.js `_brandRauch`\) zeichnet, stammt nicht aus `_rauchStoff`/],
        ["der Kamin zeichnet einen Zwillings-Stoff", ["rauch.leser.kamin.bauer=", false], /RAUCH: BEIDE LESER — der Stoff, den der Kamin \(stamm\/siedlung-bewohner\.js `_updateDorfRauch`\) zeichnet, stammt nicht aus `_rauchStoff`/],
        ["der Kamin reicht ein fremdes Steigen", ["rauch.leser.kamin.steigMs=", 2.5], /RAUCH: BEIDE LESER — der Kamin .* das Steigen 2\.5 m\/s statt 1\.2/],
        ["die Fahne ohne Zug an den Teilchen", ["rauch.leser.brand.zug=", false], /RAUCH: BEIDE LESER — die Teilchen von die Fahne des Brands .*tragen keinen Zug/],
        ["der Kamin legt keinen Satz an (blind)", ["rauch.leser.kamin", { teilchen: 0, satz: false }], /RAUCH: BEIDE LESER — der Kamin .* legte keinen Satz an/],
        ["der Bauer ohne Steigen bricht still", ["rauch.leser.bruch=", null], /RAUCH: BEIDE LESER — `_rauchStoff` ohne `steigMs` bricht nicht laut/],
        ["ein Zwilling liest die Attribute des Rauchs", ["rauch.leser.zwilling=", "stamm/feld-leben.js:3190 `\"aRauch\"`"], /RAUCH: BEIDE LESER — .*außerhalb von `_rauchZeichnen` \/ `_rauchStoff`: stamm\/feld-leben\.js:3190/],
        ["Rauch-Zwilling ungemessen", ["rauch.leser.zwilling"], /RAUCH: BEIDE LESER — .*außerhalb .*: undefined/],
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
function buehne(nFrames, nachtLicht, flammeProbe) {
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
            st.timeOfDay = 0.3;
            if (st.world) st.world.timeOfDay = 0.3;
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
            const kVor = rend.toneMappingExposure;
            const nachtU = st.postProcessingUniforms && st.postProcessingUniforms.nightFactor;
            const nachtVor = nachtU ? nachtU.value : null;
            const dunkel = async (k, c, nacht) => {
                flach.material.color.setRGB(c, c, c);
                rend.toneMappingExposure = k;
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
                // in `_brandFlammenZeichnen` ihn rechnet (lichtFarbe(K) × (K/kelvin[0])⁴ in 8 Bit, × ziel ÷ Belichtung) —, mit der Umkehr
                // des Auges (`_nachtAuge(c, true)`) und ohne sie (MUTANTE-J); je Ton die Bild-Mitte bei nightFactor 0 und 1.
                const FL = (aus.flamme = { toene: {} });
                const stoffVor = flach.material;
                const stoffe = [];
                try {
                    if (!nachtU) throw new Error("die Post-Kette trägt keine Uniform nightFactor");
                    const [BF, FW, L] = [r.constructor.BRAND.bild.flamme, globalThis.__fachwerkCore, T.TSL];
                    const flammenStoff = (K, umkehr) => {
                        const [c, w] = [FW.lichtFarbe(K), Math.pow(K / BF.kelvin[0], 4)];
                        const ton = L.vec3(...[0, 1, 2].map((i) => Math.round(255 * c[i] * w) / 255)).mul(L.float(BF.ziel).div(L.toneMappingExposure));
                        const m = new T.MeshBasicNodeMaterial();
                        m.fog = false;
                        m.colorNode = L.vec4(umkehr ? r._nachtAuge(ton, true) : ton, 1);
                        stoffe.push(m);
                        return m;
                    };
                    const mitte = async (m, nacht) => {
                        flach.material = m;
                        rend.toneMappingExposure = flammeProbe.k;
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
                    for (const [name, K] of [["kern", BF.kelvin[0]], ["mantel", flammeProbe.mantelK]]) {
                        const [mit, ohneUmkehr] = [flammenStoff(K, true), flammenStoff(K, false)];
                        const [tag, nacht, ohne] = [await mitte(mit, 0), await mitte(mit, 1), await mitte(ohneUmkehr, 1)];
                        const k = [tag, nacht, ohne].every((x) => x.k === flammeProbe.k) ? flammeProbe.k : [tag.k, nacht.k, ohne.k].join("/");
                        FL.toene[name] = { kelvin: K, k, nfTag: tag.nf, nfNacht: nacht.nf, nfOhne: ohne.nf, tag: tag.rgb, nacht: nacht.rgb, ohne: ohne.rgb };
                    }
                    // (j3) EINE QUELLE am lebenden Code (ohne Kommentare, `__fehlt`): die Uniform des Glieds IST die der Kette, das Glied
                    // liest die Stäbchen-Schwelle, die Kette ruft das Glied mit ihrer Farbe, die Flamme ruft seine Umkehr
                    FL.quelle = {
                        uniform: r._nachtAuge(null) === nachtU,
                        augeLiest: !window.__fehlt(r._nachtAuge, /\.staebchenCd\b/),
                        kette: !window.__fehlt(r._ensurePostProcessing, /_nachtAuge\(\s*(?!null\b)[A-Za-z_]/),
                        umkehr: !window.__fehlt(r._brandFlammenZeichnen, /_nachtAuge\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*,\s*true\s*\)/),
                    };
                } catch (e) {
                    FL.abbruch = fehlerStapel(e).split("\n").slice(0, 4).join(" ← ");
                } finally {
                    flach.material = stoffVor;
                    for (const m of stoffe) m.dispose();
                }
            } finally {
                cam.layers.mask = maskeVor;
                if (nachtU) nachtU.value = nachtVor;
                rend.toneMappingExposure = kVor;
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
        const vor = { brandRauch: st.brandRauch, flammen: r._brandFlammen, dorfRauch: st.dorfRauch, gemeldet: r._dorfRauchLogged };
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
            const zelle = [{ b: { glut: 1 }, von: 0, bis: 1 }];
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
            for (let i = 0; i < 200 && !st.dorfRauch.teilchen.length; i++) r._updateDorfRauch(0.1);
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
            const ecken = (l, n = 12) => {
                let s = 0;
                for (const [ex, ey] of [[0, 0], [W - n, 0], [0, H - n], [W - n, H - n]])
                    for (let y = ey; y < ey + n; y++) for (let x = ex; x < ex + n; x++) s += l[y * W + x];
                return s / (4 * n * n);
            };
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
            const zeichne = (liste) => r._rauchZeichnen(R, liste, "brandRauchSatz", R.maxTeilchen, R.steigMs);
            // DIE QUELLE DES LICHT-POOLS: eine Flammen-Fläche (`_flammenLicht`) unter dem Ballen — durch den EINEN Schreiber, bis
            // zum Fixpunkt ihrer Blende (wie die Bühne mit Uhr)
            const F = r._flammenLicht(P.flammeM);
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
                return r._leuchtPool.plaetze.map((p) => ({ quelle: p.quelle, staerke: +p.staerke.toFixed(3), blende: p.blende, reichweite: p.reichweite }));
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
                return { unten: +(s.unten / s.nu).toFixed(2), oben: +(s.oben / s.no).toFixed(2), grund: +ecken(l).toFixed(2), px: s.nu + s.no };
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
                    const c = deckung(await schuss());
                    return { m: muster(c, pix(m)), wand: c.wand };
                };
                const [A, B] = [await bild(mitten[0]), await bild(mitten[1])];
                const k = korr(A.m, B.m);
                const aus2 = { gleich: k.r, px: k.px, hub: k.hub, wand: +A.wand.toFixed(1) };
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
            aus.leser.bauten = bauten.length;
        } catch (e) {
            aus.abbruch = fehlerStapel(e).split("\n").slice(0, 4).join(" ← ");
        } finally {
            for (const k of GLIEDER) delete r[k];
            AR.RAUCH_BILD = tafelVor;
            [st.brandRauch, r._brandFlammen, st.dorfRauch, r._dorfRauchLogged] = [vor.brandRauch, vor.flammen, vor.dorfRauch, vor.gemeldet];
            if (fr) [fr.rauchQuellen, fr.rauchStamp] = frVor;
            for (const satz of ["brandRauchSatz", "dorfRauchSatz"]) {
                try {
                    abschied(satz);
                } catch (e) {
                    aus.abbruch = aus.abbruch || "Abschied " + satz + ": " + fehlerText(e);
                }
            }
            st.scene.remove(wand);
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
        out = await page.evaluate(buehne, N_FRAMES, DUNKEL_NACHT_LICHT, FLAMME_PROBE);
        // (j3) der GANZE Stamm (Lehre 12: über scripts/lib/stamm.cjs, ohne Kommentare): außerhalb von `_nachtAuge` liest niemand
        // die Schwellen des Auges (`fehlt.wo` nennt den Zwilling mit Datei und Zeile)
        if (out.flamme && out.flamme.quelle)
            out.flamme.quelle.zwilling = STAMM.fehlt({ ausser: "_nachtAuge" }, /\.(?:staebchenCd|zapfenCd|luxJeEinheit)\b/) ? null : STAMM.fehlt.wo;
        for (const [name, tn] of Object.entries((out.flamme && out.flamme.toene) || {})) {
            const [fT, fN] = [hsv(tn.tag), hsv(tn.nacht)];
            log(
                `Flamme ${name.toUpperCase()} (${tn.kelvin} K, Belichtung ${tn.k}): Tag ${JSON.stringify(tn.tag)} (Farbton ${fT.ton}°, Sättigung ${fT.satt}) ↔ Nacht ${JSON.stringify(tn.nacht)} (Farbton ${fN.ton}°, Sättigung ${fN.satt}) · Δ ${kanalAbstand(tn.tag, tn.nacht)} je Kanal (${FLAMME_BAND[name].nachtSatt ? `Grenze der Umkehr: Soll Sättigung der Nacht ≥ ${FLAMME_BAND[name].nachtSatt}` : `Soll ≤ ${FLAMME_TOL}`}) · ` +
                    `MUTANTE-J ohne Umkehr ${JSON.stringify(tn.ohne)} (Sättigung ${hsv(tn.ohne).satt}) · Δ ${kanalAbstand(tn.tag, tn.ohne)}`
            );
        }
        if (out.flamme) log(`Flamme, EINE QUELLE: ${JSON.stringify(out.flamme.quelle)}${out.flamme.abbruch ? " · ABBRUCH " + out.flamme.abbruch : ""}`);
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
        out.rauch = await page.evaluate(rauchProbe, b, RAUCH_PROBE);
        // (k4) der GANZE Stamm (Lehre 12): die Attribute des Rauchs liest nur das EINE Bild (`fehlt.wo` nennt den Zwilling)
        if (out.rauch.leser)
            out.rauch.leser.zwilling = STAMM.fehlt({ ausser: ["_rauchZeichnen", "_rauchStoff"] }, /["'`]a(?:Rauch|Zug)["'`]/) ? null : STAMM.fehlt.wo;
        for (const z of rauchZeilen(out.rauch)) log(z);
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
                .join(" · ")}; Soll ≤ ${FLAMME_TOL}), die Schwellen des Auges liest nur \`_nachtAuge\`; der Zugang aus ohne Farbsicht-Knoten, der Himmel bleibt; ` +
            `der Rauch ist EIN Bild (Unterseite ${rauchVerh(out.rauch.unten)}× die Oberseite, flach ${rauchVerh(out.rauch.mutUnten)}×; zwei Ballen ein Muster ${out.rauch.koerper.gleich}, am Ballen ${out.rauch.mutKoerper.gleich}; ` +
            `der Zug streckt ${out.rauch.zug.quer.form}, längs des Blicks ${out.rauch.zug.laengs.form}, ohne Streckung ${out.rauch.mutZug.quer.form}; Fahne und Kamin aus \`_rauchStoff\`).`
    );
})();
