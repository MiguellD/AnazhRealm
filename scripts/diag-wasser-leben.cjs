#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-wasser-leben.cjs — DIE WASSER-WAND der Leben-Prüfung (Klassen Q6 + Q7 — jede Zahl zuerst ROT am Vorher, die
// Täter mit ihren Zahlen stehen im Selbsttest, die Chronik in git):
//   F (Q7-Gestalt)  der Fluss-Spiegel steigt stromab nie und liegt quer waagrecht; ein Wasserfall steht EINMAL je Ort.
//   K (Q6-Körper)   wer in den See geht, geht nie am Grund; in Ruhe treibt er an der Brustkorb-Linie; Kraulen hält das
//                   Gesetz; das Eintauchen klingt; die Kamera taucht nur unter dem Spiegel; ein Tier liegt an seiner
//                   Wasserlinie, auch ohne Gestalt-Baum; ein Mitspieler lehnt sich ins Wasser.
//   B (Q7-Bild)     das Wasser-Material zerfällt mit der Wasser-Uhr nicht (kein weißes Zebra), der ruhige Fluss schäumt
//                   nicht, der Sturm-Regen zeichnet Schlieren; das Rauschen rechnet ohne sin (B6); unter Wasser kennt das
//                   Licht Tag und Nacht, der Tauchgang färbt den Himmel nicht.
//   U (Q7-Gestalt)  die Ufer-Farbe quer zum Fluss springt nie, Worker und Main färben gleich; der Schilf-Bezug springt nie (U3).
//   K10 · K11 · W2  die Decke über trockenen Höhlen (Spieler, Kamera, Tier, Wagen lesen dort kein Wasser); der Wagen watet,
//                   das Boot treibt ohne Nicken mit dem Grund, auch im Rand-Streifen des Sees.
//   F5 · F8 · F10   jede Quelle ein Rinnsal aus der Hülle des Gesetzes; Körper und Bild je Punkt gleich nass (Quelle, Bach,
//                   See-Fenster) — Breite gegen Breite, nie je Querschnitt. F9: keine Pflanze im gezeichneten Wasser.
//   F7 · K12        die Bank nie steiler als der Fels; Klang und Küsten-Sheet lesen die EINE Wahrheit, und an 50 Zufalls-Punkten
//                   folgt ihrer Mutation jeder Leser (K12 M: Leib, Tier, Wagen, Scheu, Trink-Ziel, Klang, Natur), am See der
//                   Mess-Wiese und überall (K4). K8: keine Ufer-Flut nach dem Wecken des Automaten.
//   K4 LÄUFE        jeder Lauf endet in See oder Meer, jede Senke ist nass, Sohle und Spiegel steigen nie; K4 STRÖMUNG: an 4
//                   Fluss-Orten treiben Schwimmer, Boot und Tier > 0,5 m in 90 Takten, ohne Strömung nicht.
//   E (stoffe.K3)   im Winter trägt das Eis den Gang und die Tiere am Spiegel (±5 cm); das Feld +10 °C bricht ihn ein.
//   S · L · P · H   (stoffe.K3-2) der Schnee schmilzt über 0 °C, die Lava erstarrt am Wasser schneller; die Schmelze hebt See
//                   und Fluss (der Körper liest das gezeichnete Wasser gehoben); der Stahl der Esse glüht und erkaltet am Feld.
//   G (F3)          der Graben am Fluss (1 m und 3 m jenseits der Krone, der Weg des Grabe-Hiebs): EINE Wasser-Fläche, nie über
//                   dem Spiegel, in Ruhe auf ihm; der Automat ruht binnen Takten; die Wiese daneben fällt nie.
//   G6 · G7 · G8    der Damm aus dem Verb (gelaende.K2 (b), (d)): stromauf steht der Stausee auf der Überlaufhöhe (±0,1 m),
//                   stromab fließt der Fluss auf seinem Spiegel; der Fern-Ring trägt den Edit aus dem Faden und am neuen Anker (--bild).
// Die Proben rufen die Chokepoints selbst (scripts/lib/wasser-linse.cjs): den Spiegel (`_atlasWaterLevelAt`), den
// Sim-Schritt `_stepFixedSim`, den Schritt-Klang `_schrittKlangTick`, das ECHTE Wasser-Material.
//
//   node scripts/diag-wasser-leben.cjs              F + K (Null-Renderer, Mess-Wiese)      npm run gate:wasser-leben
//   node scripts/diag-wasser-leben.cjs --bild       B (WebGPU: swiftshader; --echt die Hardware-GPU)
//   node scripts/diag-wasser-leben.cjs --selftest   das Urteil gegen jeden Täter, ohne Browser (in `npm run check`)
// Port: WASSER_LEBEN_PORT (Standard 4623).
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, starteBrowser, nullRenderer, taeterFaelle, selbsttestEnde, pngDatei } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");
const { quellTeileVereinen, QUELL_KACHELN, WASSER_INSTALL } = require("./lib/wasser-linse.cjs");

const SCHWELLE = {
    steigend: 0, // Anteil der 2-m-Schritte, deren Lauf-Fläche > 5 cm steigt
    buckelP90: 0.05, // m — Wölbung des Querschnitts: Mitte gegen das Mittel der Ränder (p90 der Fluss-Punkte)
    lageToleranz: 0.15, // m — Füße unter dem Spiegel in Ruhe gegen die Brustkorb-Linie des Gesetzes
    kraulAnteil: 0.9, // Kraul-Tempo gegen speed × schwimmen.speedMul
    tierLinie: 0.1, // m — Sohle unter dem Spiegel gegen die Wasserlinie der Gestalt (Schultergelenk)
    kantenVerhaeltnis: 1.3, // Kanten-Dichte der Stromschnelle bei Wasser-Uhr 3600 s gegen 60 s
    kantenRuhig: 5, // Kanten-Dichte des ruhigen Flusses bei 3600 s (mittlere Luma-Stufe je Pixel)
    hellRuhig: 0.05, // Schaum-Deckung des ruhigen Flusses (kein Ufer, kein Steil-Lauf: das Gesetz schäumt dort nicht)
    schaumSchnelle: 0.5, // Schaum-Deckung der Stromschnelle im selben Mass (das Wildwasser schäumt: sonst ist B1 blind)
    sturm: 1.3, // Kanten-Dichte des ruhigen Flusses im Sturm gegen die bei Sonne (das Gesetz: Amplitude × (w0 + w1·Wind))
    schlieren: 50, // senkrechte Läufe ≥ 4 lit Pixel des Sturm-Regens allein auf Schwarz (640 × 360)
    neigung: 0.2, // (rechts − links) / (rechts + links) der diagonalen Lauf-Nachbarn quer zum Wind
    bankFels: 0.1, // Anteil der Bank-Profile (6 m ab der Wasserlinie), die steiler als der Fels des Boden-Gesetzes sind
    grabenBauten: 300, // Sheet-Bauten bis zur Ruhe (F3; Bau-Ereignisse, nie Takte — die warten auf den Worker; Basis 2353–2609)
};

// B6 HASH: das Rauschen des Wasser-Stoffs (`_ensureHydroSurfaceMaterial`) rechnet ohne sin — WGSL lässt sin außerhalb
// ±π beliebig ungenau (swiftshader rechnet sin genau und sieht nichts). Die Absenz über den EINEN Helfer (stammLib.fehlt: das Glied
// am Namen, Kommentare fallen, ein fehlender Stoff wirft) nennt die Zeile; `quelle` ein Text statt des Stamms (Selbsttest).
const hashSin = (quelle) => (stammLib.fehlt("_ensureHydroSurfaceMaterial", /\bsin\s*\(/, quelle) ? null : stammLib.fehlt.wo);

// Der Täter des Selbsttests: der Hash vor K40, im Gewand des Stoffs.
const HASH_ALT =
    "class A {\n    _ensureHydroSurfaceMaterial(\n        opts = f(1)\n    ) {\n        const hash2 = Fn(([p]) => {\n" +
    "            return fract(sin(dot(p, vec2(41.3, 289.1))).mul(43758.5453));\n        });\n    }\n" +
    "    _naechster() {}\n}\n";

// Das Urteil über einen Befund: Liste der Verstöße (leer = grün). Rein — im Selbsttest wie im Lauf. Jeder Verstoß nennt den
// Täter beim Namen (Klasse und Wort) und trägt die Zahlen seines Befunds (`rot`: der Name und das Stück des Befunds, das ihn trägt).
function urteil(b) {
    const v = [];
    const S = SCHWELLE;
    const rot = (name, o) => v.push(`${name}: ${JSON.stringify(o)}`);
    if (b.hashSin) v.push(`B6 HASH: das Wasser-Rauschen rechnet mit sin (${b.hashSin}) — auf echter GPU ungenau`);
    // F9 — die Pflanzen im gezeichneten Wasser (Nah-Streu ohne Ufer-Band, Nah-Wiese): je Gebiet ihre Zahl und das Wasser
    // über dem Fuß; LEER, wenn das Gebiet weniger Pflanzen trägt, als dort stehen (die Probe prüfte nichts)
    const florUrteil = (wo, fl, minStreu, minWiese) => {
        if (!fl || fl.fehler) return v.push(`F9: ${wo} ${fl ? fl.fehler : "die Pflanzen-Probe lief nicht"}`);
        const [st, wi] = [fl.streu || {}, fl.wiese || {}];
        if (!(st.pflanzen >= minStreu && wi.bueschel >= minWiese)) rot(`F9 LEER: ${wo}`, fl);
        if (st.imWasser > 0) rot(`F9 STREU: ${wo}`, st);
        if (wi.imWasser > 0) rot(`F9 WIESE: ${wo}`, wi);
    };
    // UNSICHTBAR · PHANTOM (F5 die Quell-Läufe, F8 der Bach): Körper-Wasser, das die Welt nicht zeichnet (`unsichtbarBreite`),
    // und gezeichnetes Wasser, in dem der Körper trocken steht (`phantomBreite`) — als Breite (Summe je Punkt)
    const quer = (F, wo, k) => {
        if (!(k.unsichtbarBreite <= 0)) rot(`${F} UNSICHTBAR: ${wo}`, k);
        if (!(k.phantomBreite <= 0)) rot(`${F} PHANTOM: ${wo}`, k);
    };
    if (b.fluss) {
        const f = b.fluss;
        if (f.fehler) v.push(`F: ${f.fehler}`);
        else {
            if (!(f.schritte > 1000)) rot("F LEER", f);
            if (!(f.anteilSteigend <= S.steigend)) rot("F1 BERGAUF", f);
            if (!(f.buckelP90M <= S.buckelP90)) rot("F2 BUCKEL", f);
            if (f.wasserfaelle !== f.wasserfallOrte) rot("F4 DOPPEL", f);
        }
    }
    if (b.quelle) {
        const q = b.quelle;
        // F5 KACHELN: die Probe misst genau ihre Kacheln (`QUELL_KACHELN`) — eine fehlende ist ein Schrumpfen, nie grün
        const gemessen = Array.isArray(q.kacheln) ? q.kacheln : [];
        const fehlen = QUELL_KACHELN.filter((k) => gemessen.indexOf(k) < 0);
        const fremd = gemessen.filter((k) => QUELL_KACHELN.indexOf(k) < 0);
        if (q.fehler) v.push(`F5: ${q.fehler}`);
        else if (fehlen.length || fremd.length || gemessen.length !== QUELL_KACHELN.length) rot("F5 KACHELN", { fehlen, fremd });
        else if (!(q.quellen >= 30)) rot("F5 LEER", q.quellen);
        else {
            // SPRUNG: breiter oder tiefer als die Hülle des Gesetzes (`huelle0` am Ursprung); BUCKEL: ein Zufluss im Kanal eines
            // breiteren Flusses hebt dessen Spiegel (er nahm den Spiegel seiner ungefrästen Ufer)
            if (q.spruenge > 0) rot("F5 SPRUNG", q);
            if (q.trocken > 0) v.push(`F5 TROCKEN: ${q.trocken} von ${q.quellen} Quellen tragen auf ihren ersten 16 m kein Wasser`);
            if (!(q.buckel <= 0)) rot("F5 BUCKEL", q);
            quer("F5", "auf den Quell-Läufen", q);
        }
    }
    // F8 = der Bach der Mess-Wiese: das gezeichnete Wasser gegen den Körper
    if (b.bach) {
        const k = b.bach;
        if (k.fehler) v.push(`F8: ${k.fehler}`);
        else if (!(k.querschnitte >= 80 && k.koerperNass >= 80)) rot("F8 LEER", k);
        else quer("F8", "der Bach der Mess-Wiese", k);
        florUrteil("am Bach", k.flora, 100, 30);
    }
    if (b.see) {
        const k = b.see;
        if (k.fehler) v.push(`F10: ${k.fehler}`);
        else if (!(k.koerperM2 >= 1000)) rot("F10 LEER", k.koerperM2);
        else {
            // PHANTOM: die Welt zeichnet Wasser, in dem der Körper trocken steht; UNSICHTBAR: umgekehrt (je ein Beispiel)
            if (!(k.phantomM2 <= 0)) rot("F10 PHANTOM", k);
            if (!(k.unsichtbarM2 <= 0)) rot("F10 UNSICHTBAR", k);
        }
        florUrteil("im See-Fenster", k.flora, 300, 500);
    }
    if (b.bank) {
        const k = b.bank;
        if (k.fehler) v.push(`F7: ${k.fehler}`);
        else if (!(k.profile >= 20)) rot("F7 LEER", k.profile);
        else if (!(k.felsAnteil <= SCHWELLE.bankFels)) rot("F7 STEILWAND", k); // steiler als der Fels des Boden-Gesetzes
    }
    if (b.uferFarbe) {
        const u = b.uferFarbe;
        if (u.fehler) v.push(`U: ${u.fehler}`);
        else {
            if (!(u.schritte > 5000)) rot("U LEER", u.schritte);
            if (u.spruenge > 0) rot("U1 UFER-SPRUNG", u); // die Boden-Farbe springt quer zum Fluss (Luma-Stufe je 2 cm)
            const sf = u.schilf;
            if (!sf || sf.fehler) v.push(`U3: ${sf ? sf.fehler : "die Schilf-Probe lief nicht"}`);
            else if (!(sf.schritte > 5000)) rot("U3 LEER", sf.schritte);
            else if (sf.spruenge > 0) rot("U3 SCHILF-SPRUNG", sf); // das Ufer-Band der Nah-Streu springt (Gewicht-Stufe je 2 cm)
            const p = u.paritaet;
            if (!p || !(p.vertices > 1000)) v.push("U2 LEER: die Farb-Parität verglich keinen Ufer-Chunk");
            else if (p.abweichend > 0) rot("U2 ZWEI FARBEN", p); // der Worker färbt Ufer-Vertices anders als der Main
        }
    }
    if (b.regen) {
        const g = b.regen;
        if (g.fehler) v.push(`B4: ${g.fehler}`);
        else if (!(g.schlieren >= S.schlieren)) rot("B4 REGEN", g);
        else if (!(Math.abs(g.neigung) >= S.neigung)) rot("B5 SENKRECHT", g); // quer zum Sturm fallen die Schlieren senkrecht
    }
    if (b.hoehle) {
        const hh = b.hoehle;
        if (hh.fehler) v.push(`K10: ${hh.fehler}`);
        else {
            // trockene Höhlen unter und neben dem See: keine Probe trägt Körper-Wasser, Spieler, Kamera, Tier und Wagen trocken
            if (!(hh.proben >= 20)) rot("K10 LEER", hh.proben);
            else if (hh.nass > 0) rot("K10 HÖHLE", hh);
            const [sp, ka, ti] = [hh.spieler || {}, hh.kamera || {}, hh.tier || {}];
            if (!(sp.proben > 0 && ka.proben > 0 && ti.proben > 0)) rot("K10 LEER", hh);
            if (sp.schwimmFrames > 0) rot("K10 SPIELER", sp);
            if (ka.unterWasser > 0) rot("K10 KAMERA", ka);
            if (ti.schwimmt > 0) rot("K10 TIER", ti);
            // der Wagen (wasser-wahrheit): die Tiefe des Fahr-Schritts am Höhlen-Boden (`_fahrTiefe`)
            const wa = hh.wagen;
            if (!wa) v.push("K10 WAGEN LEER: keine Tiefe am Wagen (`_fahrTiefe`) im Stand");
            else if (wa.nass > 0) rot("K10 WAGEN", wa);
        }
    }
    if (b.wagen) {
        const w = b.wagen;
        if (w.fehler) v.push(`K11: ${w.fehler}`);
        else {
            const [g, bo, rd, ba] = [w.wagen || {}, w.boot || {}, w.rand || {}, w.bugAb];
            if (g.fehler) v.push(`K11: ${g.fehler}`);
            else if (g.afloat) rot("K11 STRASSENWAGEN SCHWIMMT", g); // der GT treibt im See
            if (bo.fehler) v.push(`K11: ${bo.fehler}`);
            else if (!bo.afloat) rot("K11 BOOT SINKT", bo); // das Holz-Boot steht im See am Grund
            // im Rand-Streifen des Sees (1–7 m Wasser über Atlas-Land) treibt das Boot an jeder Probe
            if (!(rd.proben >= 5)) rot("W2 LEER", rd);
            else if (rd.treibt < rd.proben) rot("W2 RAND-STREIFEN", rd);
            if (!ba || ba.fehler) rot("K11 LEER", ba || null);
            else if (ba.afloat && !(Math.abs(ba.nickZielGrad) <= 1 && Math.abs(ba.wankZielGrad) <= 1)) rot("K11 BUG-AB", ba);
        }
    }
    if (b.leser) {
        const l = b.leser;
        if (l.fehler) v.push(`K12: ${l.fehler}`);
        else {
            // der Klang (`_nassAt`) hört Wasser, wie der Körper es trägt; das Sheet des Küsten-Aquifers trägt den Körper
            if (!(l.spalten >= 5000 && l.nass >= 500)) rot("K12 LEER", l);
            if (l.klang > 0) rot("K12 KLANG", l);
            const k = l.kueste || {};
            if (!(k.sichtbar >= 20)) rot("K12 LEER", k);
            else if (k.trocken > 0) rot("K12 KÜSTE", k);
        }
    }
    // K12 M — die Mutation der EINEN Wahrheit (Gelände K4): jeder Leser liest vorher trocken und folgt im Takt danach (am See
    // der Mess-Wiese, K4 ÜBERALL an Zufalls-Orten der Karte); die Kontrolle folgt nie (sonst trifft die Mutation den Kern nicht)
    const mutation = (m, wo) => {
        if (m.fehler) return v.push(`${wo}: ${m.fehler}`);
        if (!(m.punkte >= 50)) rot(`${wo} LEER`, m.punkte);
        for (const [k, l] of Object.entries(m.leser)) {
            const was = `${k.toUpperCase()}: ${l.wer}`;
            if (!(l.n >= m.punkte)) rot(`${wo} LEER: ${was}`, l);
            else if (k === "kontrolle") {
                if (l.nach > 0) rot(`${wo} BLIND: ${was}`, l);
            } else if (l.vor > 0 || l.nach < l.n) rot(`${wo} ${was} liest eine eigene Fläche`, l);
        }
        const [fv, fn] = [m.flora.vor || {}, m.flora.nach || {}];
        if (!(fv.wiese >= 20 && fv.streu >= 10)) rot(`${wo} LEER`, m.flora);
        for (const art of ["wiese", "streu"]) if (fn[art] > 0) rot(`${wo} ${art.toUpperCase()}`, m.flora);
    };
    if (b.mutation) mutation(b.mutation, "K12 M");
    const wo = (t) => `${t.ort.map(Math.round)}`;
    if (b.ueberall) {
        if (!(b.ueberall.length >= 5)) rot("K4 ÜBERALL LEER", b.ueberall.length);
        for (const m of b.ueberall) mutation(m, `K4 ÜBERALL ${wo(m)}`);
    }
    if (b.laeufe) {
        // jeder Lauf endet in See oder Meer, jede Senke ist nass, Sohle und Spiegel steigen stromab nie
        const l = b.laeufe;
        if (!(l.laeufe >= 100 && l.schritte > 10000)) rot("K4 LÄUFE LEER", l);
        if ((l.ende.see || 0) + (l.ende.meer || 0) !== l.laeufe) rot("K4 LÄUFE", l);
        if (l.nass !== l.senken) rot("K4 SENKE TROCKEN", l);
        if (l.steigt > 0) rot("K4 BERGAUF", l);
    }
    if (b.treibt) {
        if (!(b.treibt.length >= 4)) rot("K4 STRÖMUNG LEER", b.treibt.length);
        for (const t of b.treibt) {
            if (t.fehler) v.push(`K4 STRÖMUNG ${wo(t)}: ${t.fehler}`);
            // > 0,5 m in 90 Takten mit Strömung, ohne sie keine (sonst eine zweite Quelle)
            for (const k of t.fehler ? [] : ["schwimmer", "boot", "tier"]) {
                const d = t[k] || {};
                if (!(d.mit > 0.5)) v.push(`K4 STRÖMUNG ${wo(t)}: ${k} treibt ${d.mit}`);
                if (!(Math.abs(d.ohne) < 0.05)) v.push(`K4 STRÖMUNG ${wo(t)}: ${k} treibt ohne ${d.ohne}`);
            }
        }
    }
    if (b.ufer) {
        const u = b.ufer;
        if (u.fehler) v.push(`K8: ${u.fehler}`);
        else if (!(u.trocken > 20)) rot("K8 LEER", u.trocken);
        else if (u.geflutet > 0) rot("K8 UFER-FLUT", u); // trockene Ufer-Proben tragen Körper-Wasser
    }
    if (b.koerper) {
        const k = b.koerper;
        if (k.fehler) v.push(`K: ${k.fehler}`);
        else {
            // K1 nie geerdet unter der Brustkorb-Linie · K2 in Ruhe an ihr · K3 Kraulen hält das Gesetz · K4 das Eintauchen klingt ·
            // K6 jedes Tier an seiner Wasserlinie (auch ohne Gestalt-Baum) · K7 der Mitspieler lehnt sich · K5 die Kamera taucht
            const [h, l, c, e] = [k.hinein || {}, k.lage || {}, k.kraulen || {}, k.eintauchen || {}];
            if (!(h.schwimmFrames > 0)) v.push("K LEER: der Gang erreichte kein Wasser (die Probe prüfte nichts)");
            if (h.tiefGeerdet > 0 || h.augenUnterGeerdet > 0) rot("K1 AM GRUND", h);
            if (!(Math.abs(l.fussUnterSpiegelP50 - l.sollFussUnterSpiegel) <= S.lageToleranz)) rot("K2 ZELL-DACH", l);
            if (l.augenUnter > 0) rot("K2 UNTERGEHEN", l);
            if (!(c.anteil >= S.kraulAnteil)) rot("K3 KRIECHEN", c);
            if (!e.landung || e.landung.material !== "wasser") rot("K4 STUMM", e);
            const tiere = Array.isArray(k.tier) ? k.tier : [];
            if (tiere.length < 8) rot("K6 LEER", tiere.length);
            for (const t of tiere)
                if (t.amGrund) rot("K6 AM GRUND", t);
                else if (!(Math.abs(t.sohleUnterSpiegel - t.wasserlinie) <= S.tierLinie)) rot("K6 LAGE", t);
            const bl = k.baumlos;
            if (!bl || !Number.isFinite(bl.sohleUnterSpiegel)) v.push("K6 LEER: die Probe des Wesens ohne Gestalt-Baum lief nicht");
            else if (!(Math.abs(bl.sohleUnterSpiegel - bl.soll) <= S.tierLinie)) rot("K6 BAUMLOS", bl);
            const { winter: w = {}, mutation: mu = {}, tier: et = [], uebergang: ue = {}, meer: me = {} } = k.eis || {};
            if (!(w.seeFrames >= 120 && et.length === 3)) v.push(`E LEER: ${w.seeFrames} Schritte über dem See, ${et.length} Tiere`);
            else if (!(w.temperatur < 0) || w.schwimmFrames || w.luft || !(w.maxM <= 0.05))
                v.push(`E1 EINBRUCH: bei ${w.temperatur} °C ${w.schwimmFrames} Schritte schwimmend, ${w.luft} in der Luft, Füße bis ${w.maxM} m vom Spiegel`);
            for (const t of et) if (t.schwimmt || !(Math.abs(t.sohleUnterSpiegel) <= 0.05)) v.push(`E3 TIER: ${t.seele} ${t.sohleUnterSpiegel} m im Eis`);
            if (!(mu.temperatur >= 0 && mu.schwimmFrames > 0)) v.push(`E2 BLIND: +10 °C (${mu.temperatur} °C), ${mu.schwimmFrames} Schritte schwimmend`);
            if (!(ue.erster >= 0) || !(ue.traegt - ue.erster >= 2) || ue.wechsel !== 2 || Math.max(...ue.tagesgang))
                v.push(`E4 KANTE: ${JSON.stringify(ue)}`);
            if (!(me.kalt > 0) || me.traegt || !(me.tiefst > me.gefrier)) v.push(`E5 MEER: ${JSON.stringify(me)}`);
            // stoffe.K3-2: der Schnee schmilzt über 0 °C und die Grenze liest ihn; die Lava erstarrt, am Wasser schneller
            const sm = k.schmelze || {};
            if (!(sm.pegel > 0.01 && sm.schmilzt > 0) || sm.gegen || !(sm.halt <= 0.001)) v.push(`S1 EINGEFROREN: ${JSON.stringify(sm)}`);
            if (!(sm.versatz >= 20 && sm.weiss >= 0.3 && sm.neuBau > 0)) v.push(`S2 GRENZE: ${JSON.stringify(sm)}`);
            const [la, ls] = (k.erstarrung || []).map((o) => [o.ab, o.frei, o.reihe[0], o.reihe[o.reihe.length - 1]]);
            if (!la || !(la[2].glut >= 0.95 && la[2].stoff === "glut" && la[2].licht && !la[2].dampf && la[0] > 0) || la[3].stoff !== "stein" || la[3].licht || la[3].glut > la[1] + 0.01)
                v.push(`L1 ERSTARRT NIE: ${JSON.stringify(la)}`);
            else if (!(ls[2].dampf && ls[0] >= 0 && ls[0] < la[0])) v.push(`L2 WASSER: ${JSON.stringify(ls)}`);
            // P die Schmelze speist See und Fluss, der Körper liest das gezeichnete Wasser · H der Stahl glüht in der Esse
            const { pegel: p = {}, gluehen: g = {} } = k;
            if (!(p.hub >= 0.1 && p.wochen > 0 && p.fluss > 0) || p.gegen > 1) rot("P1 STARR", p);
            else if (!(p.flut[0] >= p.hub - 0.03 && p.flut[2] === p.flut[0] && p.ruhe[0] <= 0.03 && p.flut[1] > p.ruhe[1])) rot("P2 BLIND", p);
            if (!(p.post > 0 && p.neuBau > 0) || p.halt > 0.001) rot("P3 TAKT", p);
            const [f, kt] = [g.feuer || {}, g.kalt || {}];
            if (!(f.wechsel > 0 && f.glut >= 0.5 && f.kelvin > 798 && f.esse)) rot("H1 KALT", g);
            else if (kt.glut || kt.kelvin || !(kt.wechsel > 0 && kt.T - kt.luft < 50) || !(g.feld >= 5)) rot("H2 GLUT", g);
            if (!k.peer || !(Math.abs(k.peer.lehne) > 0.05)) rot("K7 MITSPIELER", k.peer || null);
            const m = k.medium; // die Kamera 3 m unter dem Spiegel sieht Unterwasser, 10 m darüber die Luft
            if (!m || m.kameraUnten !== true || m.kameraOben !== false) rot("K5 MEDIUM", m || null);
        }
    }
    // K9 DAS LICHT AM WASSER: mit dem echten Renderer (der Himmel der EINEN Atmosphäre lebt auf der GPU, D3) — im Bild-Lauf:
    // unter Wasser ist die Mitternacht dunkler als die Luft darüber, der Mittag heller als die Nacht, der Tauchgang färbt die
    // Himmels-Umgebung nicht (linear, D3: die Equirekt-Tafel der EINEN Atmosphäre folgt der Augen-Höhe in 10-m-Stufen; 1 % des
    // hellsten Kanals)
    if (b.bild) {
        const li = b.licht;
        if (!li || !li.himmelVor || !li.himmelGetaucht)
            v.push(`K9 LEER: die Licht-Probe lief nicht (${(li && li.fehler) || "Luft oder Himmels-Umgebung fehlt"})`);
        else {
            if (!(li.nachtUnten < li.nachtOben)) rot("K9 NACHT", li);
            if (!(li.mittagUnten > li.nachtUnten * 2)) rot("K9 LITERAL", li);
            const dh = Math.max(...li.himmelVor.map((x, i) => Math.abs(x - li.himmelGetaucht[i])));
            if (dh > 0.01 * Math.max(...li.himmelVor)) rot("K9 HIMMEL", li);
        }
    }
    // B DAS WASSER-MATERIAL: kein Zebra mit der Wasser-Uhr (Stromschnelle 3600 s gegen 60 s, der ruhige Fluss), der Sturm bewegt
    // es, der ruhige Fluss schäumt nicht ohne Gesetz-Grund; B1 LEER: das Bild ohne Schaum nimmt der Stromschnelle ihren Schaum
    // (das Wildwasser schäumt nach dem Gesetz) — sonst sähe B1 keinen
    if (b.bild) {
        const g = b.bild;
        if (g.fehler) v.push(`B: ${g.fehler}`);
        else {
            const [a, z] = [g.uhr60 || {}, g.uhr3600 || {}];
            if (!(a.ruhig && a.ruhig.pixel > 1000 && a.schnelle && a.schnelle.pixel > 1000))
                v.push("B LEER: der Fluss-Bogen deckt keine Pixel (die Probe prüfte nichts)");
            else {
                if (!(g.kantenVerhaeltnis <= S.kantenVerhaeltnis) || !(z.ruhig.kantenDichte <= S.kantenRuhig)) rot("B2 ZEBRA", g);
                if (!(g.sturmVerhaeltnis >= S.sturm)) rot("B3 STURM", g);
                if (!(a.ruhig.hellAnteil <= S.hellRuhig)) rot("B1 SCHAUM", a.ruhig);
                if (!(a.schnelle.hellAnteil >= S.schaumSchnelle)) rot("B1 LEER", a.schnelle);
            }
        }
    }
    // G — DER GRABEN AM FLUSS (F3): EINE Fläche (G1), nie > 10 cm über dem Spiegel (G2), in Ruhe auf ihm (G3), die Ruhe binnen
    // Sheet-Bauten (G4), die Wiese daneben fällt nie (G5)
    for (const g of b.graben ? b.graben.graeben || [b.graben] : []) {
        const wo = `der Graben ${g.abstand} m jenseits der Krone (${g.ort})`;
        if (g.fehler || !(g.nass > g.vor) || !(g.bueschel[1] > 0))
            v.push(g.fehler ? `G: ${g.fehler}` : `G LEER: ${wo} zeichnet kein neues Wasser oder trägt keine Wiese daneben`);
        if (!g.fehler) {
            if (g.doppelt > 0) v.push(`G1 ZWEI FLÄCHEN: ${wo}: an ${g.doppelt} Punkten zwei Wasser-Flächen übereinander`);
            if (g.ueber > 0) v.push(`G2 ÜBER DEM SPIEGEL: ${wo}: ${g.ueber} Punkte Wasser > 10 cm über dem Spiegel (bis ${g.ueberM} m)`);
            if (g.abseits > 0) rot(`G3 ZWEITE FLÄCHE: ${wo}`, g);
            if (!(g.ruhe >= 0 && g.sheets <= SCHWELLE.grabenBauten)) rot(`G4 UNRUHE: ${wo}`, g);
            if (g.wieseFaelle > 0 || g.bueschel[0] !== g.bueschel[1]) rot(`G5 FLACKERN: ${wo}`, g);
        }
    }
    // G6 · G7 · G8 — DER DAMM (gelaende.K2 (b), (d)): der Stausee steht auf der Überlaufhöhe (±0,1 m) über dem Fluss von
    // vorher, stromab fließt der Fluss auf seinem Spiegel; am Fern-Ring trägt jeder Punkt unter den Säulen den Edit nach der
    // Antwort des Fern-Fadens und am neuen Anker die Krone
    const d = b.damm;
    if (d && (d.fehler || !(d.saeulen >= 3))) v.push(`G6: ${d.fehler || d.saeulen + " Säulen"}`);
    for (const u of d && !d.fehler ? d.stromauf : [])
        if (!(Math.abs(u.wasser - u.ueberlauf) <= 0.1 && u.ueberlauf > u.fluss + 0.1)) rot("G6 KEIN STAU", u);
    for (const u of d && !d.fehler ? d.stromab : []) if (!(Math.abs(u.wasser - u.fluss) <= 0.1)) rot("G7 KEIN ABFLUSS", u);
    // ein Feld der Ferne, das der Befund nicht trägt, heißt beim Namen (z43 an der Radeon: „Ring undefined/undefined“)
    const f = b.ferne && b.ferne.ring;
    const fehlt = f ? ["punkte", "anders", "hubM", "faden"].filter((k) => !Number.isFinite(f[k])) : [];
    if (b.ferne && !f) v.push(`G8 FERNE: ${b.ferne.fehler || "der Befund trägt keinen Ring"}`);
    else if (fehlt.length) v.push(`G8 FERNE: das Feld ${fehlt.map((k) => "ferne.ring." + k).join(", ")} fehlt`);
    else if (b.ferne && !(f.punkte >= 3 && f.anders === f.punkte && f.hubM >= 1 && f.faden === f.punkte))
        v.push(`G8 FERNE: Ring ${f.anders}/${f.punkte}, Hub ${f.hubM} m, Faden ${f.faden}/${f.punkte}`);
    return v;
}

// ── SELBSTTEST: ein grüner Befund bleibt grün, jeder Täter fällt beim Namen rot ──
function selbsttest() {
    const gut = {
        fluss: {
            schritte: 3800,
            steigend: 0,
            anteilSteigend: 0,
            anstiegM: 0,
            maxAnstiegM: 0,
            querP90M: 0.01,
            querMaxM: 0.04,
            buckelP90M: 0.01,
            buckelMaxM: 0.03,
            wasserfaelle: 9,
            wasserfallOrte: 9,
        },
        quelle: {
            quellen: 64,
            gespeist: 19,
            imKanal: 5,
            buckel: 0,
            buckelMax: 0,
            huelle0: [2.83, 0.35],
            spruenge: 0,
            trocken: 0,
            querschnitte: 1322,
            unsichtbar: 0,
            phantom: 0,
            unsichtbarBreite: 0,
            phantomBreite: 0,
            breiteP50: 2,
            breiteMax: 2.75,
            tiefeP50: 0.31,
            tiefeMax: 0.33,
            kacheln: QUELL_KACHELN.slice(),
        },
        bach: {
            querschnitte: 104,
            koerperNass: 104,
            gezeichnet: 104,
            breiteKoerper: 506,
            breiteBild: 506,
            phantomBreite: 0,
            unsichtbarBreite: 0,
            mitPhantom: 0,
            mitUnsichtbar: 0,
            flora: {
                streu: { pflanzen: 150, ufer: 50, imWasser: 0, maxM: 0, jeArt: {} },
                wiese: { bueschel: 60, imWasser: 0, maxM: 0 },
            },
        },
        see: {
            punkte: 25700,
            koerperM2: 3330,
            bildM2: 3330,
            phantomM2: 0,
            unsichtbarM2: 0,
            bspP: [],
            bspU: [],
            flora: {
                streu: { pflanzen: 2400, ufer: 300, imWasser: 0, maxM: 0, jeArt: {} },
                wiese: { bueschel: 1500, imWasser: 0, maxM: 0 },
            },
        },
        bank: { profile: 60, felsGrad: 54.5, winkelP50: 30, winkelP90: 45, winkelMax: 60, fels: 2, felsAnteil: 0.033 },
        hoehle: {
            proben: 3500,
            unter: 760,
            neben: 2740,
            nass: 0,
            nassUnter: 0,
            nassNeben: 0,
            maxM: 0,
            spieler: { proben: 6, schritte: 120, schwimmFrames: 0 },
            kamera: { proben: 6, unterWasser: 0 },
            tier: { proben: 6, schwimmt: 0 },
            wagen: { proben: 3500, nass: 0, maxM: 0 },
        },
        wagen: {
            wagen: { afloat: false, tiefe: 8.2, unterkanteUeberGrund: 0, unterkanteUnterSpiegel: 8.2 },
            boot: { afloat: true, tiefe: 8.2 },
            rand: { proben: 13, treibt: 13 },
            bugAb: { afloat: true, nickZielGrad: 0, wankZielGrad: 0, grundGrad: 29.3 },
        },
        ufer: { trocken: 180, geflutet: 0, maxFlutM: 0 },
        leser: {
            spalten: 26000,
            nass: 6000,
            klang: 0,
            kueste: { sichtbar: 110, trocken: 0 },
            beispiele: { klang: [], kueste: [] },
        },
        mutation: {
            punkte: 50,
            versuche: 546,
            leser: Object.fromEntries(
                ["leib", "kamera", "tier", "wagen", "scheu", "trinken", "klang", "schritt", "wand", "land", "kontrolle"].map(
                    (k) => [k, { wer: k, n: 50, vor: 0, nach: k === "kontrolle" ? 0 : 50, bsp: null }]
                )
            ),
            flora: { vor: { wiese: 603, streu: 137 }, nach: { wiese: 0, streu: 0 } },
        },
        laeufe: { laeufe: 293, ende: { see: 291, meer: 2 }, senken: 9, nass: 9, trocken: [], schritte: 59638, steigt: 0 },
        treibt: [1, 2, 3, 4].map((i) => ({
            ort: [i * 900, -i * 700],
            ...Object.fromEntries(["schwimmer", "boot", "tier"].map((k) => [k, { mit: 1.2, ohne: 0 }])),
        })),
        uferFarbe: {
            proben: 24,
            schritte: 48000,
            spruenge: 0,
            maxSprung: 0.01,
            beispiele: [],
            paritaet: { vertices: 6500, abweichend: 0, maxDiff: 0 },
            schilf: { art: "schilf", schritte: 48000, spruenge: 0, maxSprung: 0.04, beispiele: [] },
        },
        regen: { litAnteil: 0.13, schlieren: 800, neigung: 0.56 },
        graben: {
            graeben: [1, 3].map((abstand) => ({ abstand, ort: [-256, -1130], vor: 378, nass: 524, bueschel: [9, 9], ruhe: 4, sheets: 110 })),
        },
        damm: {
            saeulen: 21,
            stromauf: [6, 12].map((d) => ({ d, wasser: 25.25, ueberlauf: 25.24, fluss: 24.88 })),
            stromab: [6, 12].map((d) => ({ d, wasser: 24.63, fluss: 24.63 })),
        },
        ferne: { saeulen: 21, ring: { punkte: 5, anders: 5, hubM: 2.84, faden: 5 } },
        koerper: {
            hinein: { tiefGeerdet: 0, augenUnterGeerdet: 0, maxTiefeGeerdetM: 0, schwimmFrames: 400 },
            lage: { fussUnterSpiegelP50: 1.2, sollFussUnterSpiegel: 1.224, augenUnter: 0 },
            kraulen: { mps: 0.97, soll: 0.977, anteil: 0.99 },
            eintauchen: { landung: { material: "wasser" }, eintauchVy: -10.6 },
            medium: { kameraUnten: true, kameraOben: false },
            tier: ["wesen", "wolf", "fuchs", "baer"].flatMap((seele) =>
                [8, 120].map((abstand) => ({
                    seele,
                    abstand,
                    sohleUnterSpiegel: 0.6,
                    wasserlinie: 0.6,
                    amGrund: false,
                }))
            ),
            baumlos: { sohleUnterSpiegel: 0.5, soll: 0.5 },
            peer: { lehne: 0.4, meshKind: "soul" },
            eis: {
                winter: { temperatur: -4.7, seeFrames: 1152, schwimmFrames: 0, luft: 0, maxM: 0 },
                tier: ["wolf", "fuchs", "baer"].map((seele) => ({ seele, sohleUnterSpiegel: 0 })),
                mutation: { temperatur: 5.3, schwimmFrames: 900 },
                uebergang: { erster: 19, traegt: 26, wechsel: 2, tagesgang: [0, 0] },
                meer: { tiefst: 1.3, gefrier: -1.89, traegt: 0, kalt: 46 },
            },
            schmelze: { pegel: 0.16, schmilzt: 3, gegen: 0, versatz: 178, weiss: 0.5, neuBau: 81, halt: 0 },
            erstarrung: [
                { ab: 2, frei: 0.4, reihe: [{ glut: 1, stoff: "glut", licht: true }, { glut: 0.4, stoff: "stein" }] },
                { ab: 1, reihe: [{ dampf: true }] },
            ],
            pegel: { hub: 0.2, wochen: 3, gegen: 0, post: 31, neuBau: 9, fluss: 0.2, flut: [0.2, 185, 0.2], ruhe: [0, 182, 0], halt: 0 },
            gluehen: { feuer: { wechsel: 17, glut: 0.55, kelvin: 1373, esse: "esse" }, kalt: { wechsel: 119, T: 25, luft: -1, glut: 0 }, feld: 9.8 },
        },
        licht: {
            nachtOben: 0.03,
            nachtUnten: 0.004,
            mittagOben: 0.9,
            mittagUnten: 0.5,
            himmelVor: [191, 218, 237],
            himmelGetaucht: [191, 218, 237],
        },
        bild: {
            uhr60: {
                ruhig: { kantenDichte: 1, hellAnteil: 0, pixel: 20000 },
                schnelle: { kantenDichte: 20, hellAnteil: 0.98, pixel: 20000 },
            },
            uhr3600: { ruhig: { kantenDichte: 1 }, schnelle: { kantenDichte: 21 } },
            kantenVerhaeltnis: 1.05,
            sturmVerhaeltnis: 1.8,
        },
    };
    gut.ueberall = [1, 2, 3, 4, 5].map((i) => ({ ort: [i * 900, i * 700], ...gut.mutation }));
    const kopie = () => JSON.parse(JSON.stringify(gut));
    const taeter = [
        ["F1 BERGAUF", (b) => Object.assign(b.fluss, { steigend: 551, anteilSteigend: 0.142, anstiegM: 133.2 })],
        ["F2 BUCKEL", (b) => Object.assign(b.fluss, { buckelP90M: 1.2, querP90M: 9.65 })],
        ["F4 DOPPEL", (b) => (b.fluss.wasserfaelle = 19)],
        ["F LEER", (b) => (b.fluss.schritte = 0)],
        ["F5 SPRUNG", (b) => Object.assign(b.quelle, { spruenge: 43, breiteMax: 12.75, tiefeMax: 1.73 })],
        ["F5 TROCKEN", (b) => (b.quelle.trocken = 1)],
        // K16: 4 von 5 Quellen im Kanal eines breiteren Flusses hoben dessen Spiegel (−312/1688 um 1,0 m, 664/9032 um 1,36 m)
        ["F5 BUCKEL", (b) => Object.assign(b.quelle, { buckel: 4, buckelMax: 1.36 })],
        ["F5 UNSICHTBAR", (b) => Object.assign(b.quelle, { unsichtbar: 487, unsichtbarBreite: 1200.5 })],
        ["F5 PHANTOM", (b) => Object.assign(b.quelle, { phantom: 2, phantomBreite: 0.5 })],
        ["F5 LEER", (b) => (b.quelle.quellen = 16)],
        // K61, zweite Prüfung: die Teil-Welten trugen 9 der 12 Kacheln (38646124674) — 66 Quellen still ungeprüft, grün
        [
            "F5 KACHELN",
            (b) => (b.quelle.kacheln = ["0,0", "-1,-1", "-1,0", "0,-1", "1,-3", "1,4", "1,5", "2,4", "2,5"]),
        ],
        ["F8 UNSICHTBAR", (b) => Object.assign(b.bach, { gezeichnet: 54, unsichtbarBreite: 177.5, mitUnsichtbar: 39 })],
        // d9f39b4f: 257 Punkte in 41 Querschnitten — das alte Urteil je Querschnitt (mit Nachbar-Toleranz) meldete 0
        ["F8 PHANTOM", (b) => Object.assign(b.bach, { phantomBreite: 64.25, mitPhantom: 41, breiteBild: 576.25 })],
        ["F8 PHANTOM: der Bach", (b) => Object.assign(b.bach, { phantomBreite: 0.25, mitPhantom: 1 })],
        ["F8 LEER", (b) => (b.bach.querschnitte = 0)],
        ["F9 STREU", (b) => Object.assign(b.bach.flora.streu, { imWasser: 11, maxM: 0.99, jeArt: { farn: 8 } })],
        ["F9 WIESE", (b) => Object.assign(b.bach.flora.wiese, { imWasser: 21, maxM: 1.32 })],
        ["F9 LEER", (b) => (b.see.flora.wiese.bueschel = 0)],
        ["F9: am Bach", (b) => (b.bach.flora = { fehler: "die Nah-Streu hat keine Arten (das Buch fehlt)" })],
        ["F10 PHANTOM", (b) => Object.assign(b.see, { phantomM2: 80.25, bspP: [[-876.5, -690, 0.4]] })],
        ["F10 UNSICHTBAR", (b) => Object.assign(b.see, { unsichtbarM2: 7.25, bspU: [[-874.5, -624, 0.47]] })],
        ["F10 LEER", (b) => (b.see.koerperM2 = 0)],
        ["F7 STEILWAND", (b) => Object.assign(b.bank, { fels: 18, felsAnteil: 0.429, winkelP90: 68.9 })],
        ["F7 LEER", (b) => (b.bank.profile = 0)],
        ["K10 HÖHLE", (b) => Object.assign(b.hoehle, { nass: 3511, nassUnter: 766, nassNeben: 2745, maxM: 54.3 })],
        ["K10 SPIELER", (b) => (b.hoehle.spieler.schwimmFrames = 120)],
        ["K10 KAMERA", (b) => (b.hoehle.kamera.unterWasser = 6)],
        ["K10 TIER", (b) => (b.hoehle.tier.schwimmt = 6)],
        ["K10 WAGEN", (b) => Object.assign(b.hoehle.wagen, { nass: 766, maxM: 8.2 })],
        ["K10 WAGEN LEER", (b) => (b.hoehle.wagen = null)],
        ["K10 LEER", (b) => (b.hoehle.proben = 0)],
        [
            "K11 STRASSENWAGEN SCHWIMMT",
            (b) =>
                Object.assign(b.wagen.wagen, { afloat: true, unterkanteUeberGrund: 7.3, unterkanteUnterSpiegel: 0.9 }),
        ],
        ["K11 BOOT SINKT", (b) => (b.wagen.boot.afloat = false)],
        ["K11 BUG-AB", (b) => Object.assign(b.wagen.bugAb, { nickZielGrad: 7.3, wankZielGrad: 29.5 })],
        ["K11 LEER", (b) => (b.wagen.bugAb = null)],
        ["W2 RAND-STREIFEN", (b) => (b.wagen.rand.treibt = 0)],
        ["W2 LEER", (b) => (b.wagen.rand.proben = 0)],
        ["K1 AM GRUND", (b) => Object.assign(b.koerper.hinein, { tiefGeerdet: 966, maxTiefeGeerdetM: 4.68 })],
        ["K2 ZELL-DACH", (b) => (b.koerper.lage.fussUnterSpiegelP50 = 0.352)],
        ["K3 KRIECHEN", (b) => Object.assign(b.koerper.kraulen, { mps: 0.141, anteil: 0.144 })],
        ["K4 STUMM", (b) => (b.koerper.eintauchen.landung = null)],
        ["K LEER", (b) => (b.koerper.hinein.schwimmFrames = 0)],
        ["K5 MEDIUM", (b) => (b.koerper.medium = { kameraUnten: false, kameraOben: true })],
        ["K6 AM GRUND", (b) => Object.assign(b.koerper.tier[1], { amGrund: true, sohleUnterSpiegel: 8 })],
        ["K6 LAGE", (b) => Object.assign(b.koerper.tier[0], { sohleUnterSpiegel: 0.3, wasserlinie: 0.87 })],
        ["K6 LEER", (b) => (b.koerper.tier = [])],
        ["K7 MITSPIELER", (b) => (b.koerper.peer.lehne = 0)],
        // stoffe.K3 an der Basis 6f8a2c66: kein Eis
        ["E1 EINBRUCH", (b) => Object.assign(b.koerper.eis.winter, { schwimmFrames: 60, maxM: 1.227 })],
        ["E2 BLIND", (b) => (b.koerper.eis.mutation.schwimmFrames = 0)],
        ["E3 TIER", (b) => Object.assign(b.koerper.eis.tier[0], { sohleUnterSpiegel: 0.599, schwimmt: true })],
        ["E LEER", (b) => (b.koerper.eis = null)],
        // die Kante an main 206b395a (die Null-Linie als Stufe, jedes Wasser mit τ = 2 d): der See trug vom ersten Eis an (Tag
        // 11), der Tagesgang kippte das Tragen, das Meer fror in 15 von 52 Wochen (sein Wasser bis −4,25 °C)
        ["E4 KANTE", (b) => Object.assign(b.koerper.eis.uebergang, { erster: 11, traegt: 11, wechsel: 1, tagesgang: [0, 1] })],
        ["E5 MEER", (b) => Object.assign(b.koerper.eis.meer, { tiefst: -4.25, traegt: 15 })],
        ["E5 MEER", (b) => (b.koerper.eis.meer.kalt = 0)],
        // stoffe.K3-2 an der Basis b2c6c627: die Schneegrenze war Höhe allein (der Pegel stand), die glut-Achse eingefroren
        ["S1 EINGEFROREN", (b) => Object.assign(b.koerper.schmelze, { pegel: 0, schmilzt: 0 })],
        ["S1 EINGEFROREN", (b) => (b.koerper.schmelze.halt = 0.16)],
        ["S2 GRENZE", (b) => Object.assign(b.koerper.schmelze, { versatz: 0, neuBau: 0 })],
        ["L1 ERSTARRT NIE", (b) => (b.koerper.erstarrung[0].ab = -1)],
        ["L2 WASSER", (b) => (b.koerper.erstarrung[1].ab = 3)],
        // stoffe.K3-2 an der Basis e7a28b06: der Spiegel eine Funktion ohne Zeit, die Esse las keine Temperatur
        ["P1 STARR", (b) => Object.assign(b.koerper.pegel, { hub: 0, wochen: 0, fluss: 0 })],
        ["P2 BLIND", (b) => (b.koerper.pegel.flut = [0, 182, 0.2])],
        ["P3 TAKT", (b) => (b.koerper.pegel.halt = 0.2)],
        ["H1 KALT", (b) => Object.assign(b.koerper.gluehen.feuer, { wechsel: 0, glut: 0, kelvin: null })],
        ["H2 GLUT", (b) => (b.koerper.gluehen.feld = 0)],
        ["K9 NACHT", (b) => Object.assign(b.licht, { nachtUnten: 0.17 })],
        ["K9 LITERAL", (b) => Object.assign(b.licht, { nachtUnten: 0.17, mittagUnten: 0.17, nachtOben: 0.5 })],
        ["K9 HIMMEL", (b) => (b.licht.himmelGetaucht = [81, 132, 170])],
        ["K9 LEER", (b) => delete b.licht],
        ["K8 UFER-FLUT", (b) => Object.assign(b.ufer, { geflutet: 37, maxFlutM: 3.15 })],
        ["K12 KLANG", (b) => (b.leser.klang = 163)],
        ["K12 KÜSTE", (b) => (b.leser.kueste.trocken = 110)],
        ["K12 LEER", (b) => (b.leser.kueste.sichtbar = 0)],
        ["K6 BAUMLOS", (b) => (b.koerper.baumlos.sohleUnterSpiegel = 0)],
        // K12 M an der Basis e3dd2b67: die Spalten-Probe las ihre Obergrenze selbst — Klang, Trink-Ziel, Natur-Wand und Land
        // blieben im See der Wahrheit an 50 von 50 Punkten trocken
        ["K12 M KLANG", (b) => (b.mutation.leser.klang.nach = 0)],
        ["K12 M TRINKEN", (b) => (b.mutation.leser.trinken.nach = 0)],
        ["K12 M WAND", (b) => Object.assign(b.mutation.leser.wand, { vor: 3 })],
        ["K12 M BLIND", (b) => (b.mutation.leser.kontrolle.nach = 50)],
        ["K12 M WIESE", (b) => (b.mutation.flora.nach.wiese = 12)],
        ["K12 M LEER", (b) => (b.mutation.punkte = 31)],
        ["K12 M LEER: TIER", (b) => (b.mutation.leser.tier.n = 0)],
        ["K4 ÜBERALL 1800,1400 KLANG", (b) => (b.ueberall[1].leser.klang.nach = 0)],
        ["K4 ÜBERALL LEER", (b) => b.ueberall.pop()],
        ["K4 LÄUFE:", (b) => Object.assign(b.laeufe, { ende: { see: 233, meer: 2, verloren: 58 } })],
        ["K4 SENKE TROCKEN", (b) => (b.laeufe.nass = 8)],
        ["K4 BERGAUF", (b) => (b.laeufe.steigt = 551)],
        ["K4 STRÖMUNG 2700,-2100: tier treibt 0.31", (b) => (b.treibt[2].tier.mit = 0.31)],
        ["K4 STRÖMUNG 900,-700: schwimmer treibt ohne", (b) => (b.treibt[0].schwimmer.ohne = 0.4)],
        ["U3 SCHILF-SPRUNG", (b) => Object.assign(b.uferFarbe.schilf, { spruenge: 12, maxSprung: 0.61 })],
        ["U3 LEER", (b) => (b.uferFarbe.schilf.schritte = 0)],
        ["K8 LEER", (b) => (b.ufer.trocken = 0)],
        [
            "U1 UFER-SPRUNG",
            (b) => Object.assign(b.uferFarbe, { spruenge: 34, maxSprung: 0.223, beispiele: [[607.8, -840, 8.24]] }),
        ],
        ["U LEER", (b) => (b.uferFarbe.schritte = 0)],
        ["U2 ZWEI FARBEN", (b) => Object.assign(b.uferFarbe.paritaet, { abweichend: 2137, maxDiff: 0.056 })],
        ["U2 LEER", (b) => (b.uferFarbe.paritaet = null)],
        ["B4 REGEN", (b) => Object.assign(b.regen, { schlieren: 0, litAnteil: 0.002 })],
        ["B5 SENKRECHT", (b) => (b.regen.neigung = 0.02)],
        ["B2 ZEBRA", (b) => Object.assign(b.bild, { kantenVerhaeltnis: 5.8 })],
        ["B1 SCHAUM", (b) => (b.bild.uhr60.ruhig.hellAnteil = 0.6)],
        ["B1 LEER", (b) => (b.bild.uhr60.schnelle.hellAnteil = 0.02)],
        ["B3 STURM", (b) => (b.bild.sturmVerhaeltnis = 1)],
        ["B2 ZEBRA:", (b) => (b.bild.uhr3600.ruhig.kantenDichte = 63.4)],
        ["B LEER", (b) => (b.bild.uhr60.schnelle.pixel = 0)],
        // F3 an der Basis 25f53923: 720 Punkte über dem Spiegel bis 0,76 m, in Ruhe 397 daneben, Ruhe nach 620 Takten
        ["G2 ÜBER DEM SPIEGEL", (b) => Object.assign(b.graben.graeben[0], { ueber: 720, ueberM: 0.76 })],
        ["G3 ZWEITE FLÄCHE", (b) => Object.assign(b.graben.graeben[1], { abseits: 397, abseitsM: 0.79 })],
        ["G4 UNRUHE", (b) => Object.assign(b.graben.graeben[0], { ruhe: 594, sheets: 2609 })],
        ["G5 FLACKERN", (b) => Object.assign(b.graben.graeben[1], { wieseFaelle: 3, bueschel: [640, 900] })],
        ["G1 ZWEI FLÄCHEN", (b) => (b.graben.graeben[0].doppelt = 2)],
        ["G LEER", (b) => (b.graben.graeben[1].nass = 378)],
        ["G: kein Fluss", (b) => (b.graben = { fehler: "kein Fluss am Ort" })],
        // der Damm an der Basis b2c6c627: stromauf blieb der Fluss auf 24,88/24,98 m (Überlauf 25,24/25,23 m), der Ring las nur 2D
        ["G6 KEIN STAU", (b) => Object.assign(b.damm.stromauf[0], { wasser: 24.88 })],
        ["G7 KEIN ABFLUSS", (b) => (b.damm.stromab[1].wasser = null)],
        ["G8 FERNE", (b) => Object.assign(b.ferne.ring, { anders: 0, hubM: 0, faden: 0 })],
        // z43/z44: der Ferne-Teil lieferte Felder, die es nicht gab — die Wand nennt das fehlende beim Namen
        ["G8 FERNE: das Feld ferne.ring.faden fehlt", (b) => delete b.ferne.ring.faden],
        ["B6 HASH", (b) => (b.hashSin = hashSin(HASH_ALT))],
        // DIE TEILE: die Quell-Probe in Seiten nebeneinander — ein Teil mit anderen Kacheln bricht beim Namen, ein
        // trockener Ursprung in nur EINEM Teil bleibt rot im Ganzen
        [
            "F5: die Teile der Quell-Probe sehen verschiedene Kacheln",
            (b) =>
                (b.quelle = quellTeileVereinen([
                    Object.assign({}, b.quelle, { teil: { k: 0, n: 2 } }),
                    Object.assign({}, b.quelle, { teil: { k: 1, n: 2 }, kacheln: b.quelle.kacheln.slice(0, 9) }),
                ])),
        ],
        [
            "F5 TROCKEN",
            (b) =>
                (b.quelle = quellTeileVereinen([
                    Object.assign({}, b.quelle, { teil: { k: 0, n: 2 }, breiten0: [2, 2.75], tiefen0: [0.31, 0.33] }),
                    {
                        teil: { k: 1, n: 2 },
                        kacheln: b.quelle.kacheln,
                        quellen: 1,
                        trocken: 1,
                        querschnitte: 20,
                        breiten0: [2.1],
                        tiefen0: [0.32],
                    },
                ])),
        ],
        // ein Teil von dreien fehlt (seine Quellen fielen still aus der Summe, die übrigen Zahlen blieben grün)
        [
            "F5: die Teile der Quell-Probe decken nicht alle Quellen",
            (b) =>
                (b.quelle = quellTeileVereinen([
                    Object.assign({}, b.quelle, { teil: { k: 0, n: 3 } }),
                    Object.assign({}, b.quelle, { teil: { k: 2, n: 3 } }),
                ])),
        ],
    ];
    const fehler = [];
    // B6 an der lebenden Quelle (die Wand der CI, ohne Browser): der Wasser-Stoff rechnet sein Rauschen ohne sin.
    const quelleSin = hashSin();
    console.log(
        `  ${quelleSin ? "❌" : "✅"} B6 HASH an der Quelle: ${quelleSin || "das Wasser-Rauschen rechnet ohne sin"}`
    );
    if (quelleSin) fehler.push("B6 HASH an der Quelle: " + quelleSin);
    // die Teile zusammen urteilen wie das Ganze: der grüne Befund in zwei Teilen bleibt grün, jede Zahl wie vorher
    {
        const q = gut.quelle;
        const halb = (k) => (k === "huelle0" || k === "regionen" || k === "kacheln" ? q[k] : null);
        const a = {},
            z = {};
        for (const k of Object.keys(q)) {
            if (typeof q[k] === "number") {
                a[k] = Math.ceil(q[k] / 2);
                z[k] = q[k] - a[k];
            } else a[k] = z[k] = halb(k);
        }
        Object.assign(a, { teil: { k: 0, n: 2 }, breiten0: [2, 2.75], tiefen0: [0.31, 0.33], buckelMax: 0 });
        Object.assign(z, { teil: { k: 1, n: 2 }, breiten0: [1.9], tiefen0: [0.3], buckelMax: 0 });
        const m = quellTeileVereinen([a, z]);
        const fehlt = [
            "quellen",
            "gespeist",
            "imKanal",
            "spruenge",
            "trocken",
            "querschnitte",
            "unsichtbar",
            "phantom",
        ].filter((k) => m[k] !== q[k]);
        const v = urteil(Object.assign(kopie(), { quelle: m }));
        const ok = !fehlt.length && !v.length && m.breiteP50 === 2 && m.breiteMax === 2.75 && m.tiefeMax === 0.33;
        console.log(
            `  ${ok ? "✅" : "❌"} die Teile zusammen urteilen wie das Ganze (${m.quellen} Quellen aus 2 Teilen, Breite p50 ${m.breiteP50} m, max ${m.breiteMax} m)${fehlt.length ? " — weichen ab: " + fehlt.join(", ") : ""}${v.length ? " — rot: " + v[0] : ""}`
        );
        if (!ok) fehler.push("die Teile urteilen anders als das Ganze");
    }
    taeterFaelle([{ name: "der grüne Befund", z: gut }, ...taeter.map(([n, m]) => [n, m, { test: (x) => x.startsWith(n) }])], urteil, { fehler, klon: kopie });
    selbsttestEnde(fehler);
}

if (process.argv.includes("--selftest")) selbsttest();
else lauf();

// DIE TEILE DER QUELL-PROBE: so viele Seiten nebeneinander (WASSER_QUELL_TEILE, Vorgabe 3 — am Läufer vier Kerne, die
// Seite der Wand rechnet daneben ihre übrigen Proben); 1 = alles in einer Seite. Jeder Teil k ≥ 1 in einem EIGENEN Kontext:
// die Welt laden, der Strom ans Ufer der Orte der Wand (EINE Quelle der Orte für jede Seite), dann die Quellen seines Teils in
// den Kacheln der Probe (`QUELL_KACHELN`, jede Seite stellt sie selbst her).
const QUELL_TEILE = Math.max(1, Number(process.env.WASSER_QUELL_TEILE) || 3);
async function quellTeil(browser, server, k, orte) {
    const kontext = await browser.createBrowserContext();
    try {
        const pg = await kontext.newPage();
        await nullRenderer(pg);
        await server.zeige(pg, 120000);
        await wasserDa(pg, false);
        await pg.evaluate((u) => window.__wasserStrom(u, 0.6), orte.see.ufer);
        return await quellProbe(pg, orte, { k, n: QUELL_TEILE });
    } finally {
        await kontext.close();
    }
}
// die Welt steht mit ihrer Hydrosphäre (und mit `bild` ihrem Renderer: auf dem Hardware-Adapter steht die Hydrosphäre vor dem
// Backend, und `__wasserBild` riss „render() called before the backend is initialized"), die Proben sind installiert
async function wasserDa(pg, bild) {
    await pg.waitForFunction(
        (bild) =>
            window.anazhRealm &&
            typeof window.anazhRealm._gameLoopTick === "function" &&
            window.anazhRealm.state.hydrosphere &&
            window.anazhRealm.state.hydrosphere.ready &&
            (!bild || window.anazhRealm.state.rendererReady),
        { timeout: 600000, polling: 250 },
        bild
    );
    await pg.evaluate(WASSER_INSTALL);
}
// die Quellen eines Teils `teil` ({ k, n }, null: alle) in den Kacheln der Probe
const quellProbe = (pg, orte, teil) =>
    pg.evaluate(
        (o, t, kacheln) => window.__wasserQuelle({ alle: true, bach: o.bach, teil: t, kacheln }),
        orte,
        teil,
        QUELL_KACHELN
    );

async function lauf() {
    const fs = require("fs");
    const path = require("path");
    const BILD = process.argv.includes("--bild");
    const ECHT = process.argv.includes("--echt");
    const annotation = (x) => process.env.GITHUB_ACTIONS && console.log(`::error title=wasser-leben${BILD ? ":bild" : ""}::${x}`);
    const PORT = Number(process.env.WASSER_LEBEN_PORT || 4623);
    const server = statikServer();
    await server.lausche(PORT);
    const browser = await starteBrowser({
        art: BILD ? (ECHT ? "echt" : "linse") : "null",
        headless: !ECHT,
        frist: 900000,
    });
    const page = await browser.newPage();
    if (BILD) await page.setViewport({ width: 640, height: 360 });
    if (!BILD)
        await nullRenderer(page);
    let befund = { hashSin: hashSin() };
    let exit = 1;
    try {
        await server.zeige(page, 120000, `index.html${BILD && !ECHT ? "?holz=kienspan" : ""}`);
        // Das Bild wartet auch auf den Renderer (`rendererReady`, renderer.init() durch)
        await wasserDa(page, BILD);
        if (BILD) {
            const ordner = (() => {
                const i = process.argv.indexOf("--bilder");
                return i >= 0 ? process.argv[i + 1] : null;
            })();
            befund.bild = await page.evaluate((png) => window.__wasserBild({ png }), !!ordner);
            befund.regen = await page.evaluate(() => window.__wasserRegen({}));
            befund.licht = await page.evaluate(() => window.__wasserLicht({}));
            befund.ferne = await page.evaluate(
                async () => window.__wasserDamm({ fluss: (await window.__wasserOrte({})).fluss, ferne: true })
            );
            for (const k of ["png60", "png3600"]) {
                if (ordner && befund.bild[k]) {
                    fs.mkdirSync(ordner, { recursive: true });
                    pngDatei(path.join(ordner, `wasser-bild-${k.slice(3)}.png`), befund.bild[k]);
                }
                delete befund.bild[k];
            }
        } else {
            // DIE ORTE AUS DER WELT (K16, `__wasserOrte`): See, Ostufer, Fluss, Bach und Küste nächst der Mess-Wiese —
            // die Literale der alten Welt (der See −944/−640, der Bach −856/−1160) lagen nach der Landform im Trockenen.
            const ORTE = await page.evaluate(() => window.__wasserOrte({}));
            befund.orte = ORTE;
            console.log("  Orte aus der Welt: " + JSON.stringify(ORTE));
            if (!ORTE.see || !ORTE.fluss || !ORTE.bach || !ORTE.kueste)
                throw new Error("die Welt trägt keinen See, Fluss, Bach oder keine Küste nächst der Mess-Wiese");
            // Die Welt an das Ostufer des Sees streamen (`__wasserStrom`, Sync-Bau, Worker ausgehängt — wie der Playtest):
            // die Wasser-Zellen der Chunks sind ein Leser der Körper-Wahrheit von gestern.
            await page.evaluate((u) => window.__wasserStrom(u, 0.6), ORTE.see.ufer);
            // DIE QUELL-PROBE IN TEILEN (K61 CI-Diät): sie trägt 87 % der Wand (328 Quellen in den 12 Kacheln der Probe, je
            // Quelle der Ring ihrer Chunks synchron gebaut, CI-Median 299 s der ganzen Wand) auf EINEM Faden. Die Teile 1..n-1
            // fahren in eigenen Kontexten nebeneinander (je eine Welt, dieselben Orte, derselbe Strom ans Ufer), Teil 0 in
            // dieser Seite an seinem Platz; jede Seite misst genau `QUELL_KACHELN`, das Ganze urteilt über dieselben Quellen
            // wie EIN Lauf, jeder Teil genau einmal.
            // `--nur a,b`: nur diese Proben (Werkbank-Fragen; das Gate fährt alle)
            const nurI = process.argv.indexOf("--nur");
            const NUR = nurI >= 0 ? new Set(process.argv[nurI + 1].split(",")) : null;
            const soll = (n) => !NUR || NUR.has(n);
            const teilen = soll("quelle") && QUELL_TEILE > 1;
            const helfer = teilen
                ? Array.from({ length: QUELL_TEILE - 1 }, (_, i) =>
                      quellTeil(browser, server, i + 1, ORTE).catch((e) => ({
                          fehler: `Teil ${i + 1}/${QUELL_TEILE} der Quell-Probe: ${String((e && e.message) || e).split("\n")[0]}`,
                      }))
                  )
                : [];
            if (soll("fluss")) befund.fluss = await page.evaluate(() => window.__wasserFluss());
            if (soll("koerper"))
                befund.koerper = await page.evaluate(
                    (o) => window.__wasserKoerper({ see: o.see.mitte, start: o.see.ufer, ziel: o.see.mitte, meer: o.meer, fluss: o.fluss }),
                    ORTE
                );
            // am See der Mess-Wiese: die Höhlen darunter und daneben, das Gefährt (D10, W-W2)
            if (soll("hoehle")) befund.hoehle = await page.evaluate(() => window.__wasserHoehle({}));
            if (soll("wagen"))
                befund.wagen = await page.evaluate(
                    (o) => window.__wasserWagen({ see: o.see.mitte, mitte: o.see.mitte, ufer: o.see.ufer }),
                    ORTE
                );
            if (soll("ufer"))
                befund.ufer = await page.evaluate((o) => window.__wasserUfer({ ort: [o.fluss.x, o.fluss.z] }), ORTE);
            if (soll("uferFarbe")) befund.uferFarbe = await page.evaluate(() => window.__wasserUferFarbe({}));
            // die Bank am Fluss der Mess-Wiese (die Stichprobe ist das Gesetz dort, nie der Streaming-Stand)
            if (soll("bank"))
                befund.bank = await page.evaluate((o) => window.__wasserBank({ ort: [o.fluss.x, o.fluss.z] }), ORTE);
            // (sie stellt die Welt an den See und an die Küste): die Leser der EINEN Wahrheit
            if (soll("leser"))
                befund.leser = await page.evaluate((o) => window.__wasserLeser({ orte: [o.see.ufer, o.kueste] }), ORTE);
            if (soll("mutation"))
                befund.mutation = await page.evaluate((o) => window.__wasserMutation({ ort: o.see.ufer }), ORTE);
            // K4 Staffel 2 über die Karte: die Läufe, die Mutation an Zufalls-Orten, die Strömung an Fluss-Orten
            if (soll("laeufe")) befund.laeufe = await page.evaluate(() => window.__wasserLaeufe());
            for (const [art, fluss, n] of [["ueberall", false, 5], ["treibt", true, 4]])
                if (soll(art)) befund[art] = await page.evaluate((fluss, n) => window.__wasserKarte({ fluss, n }), fluss, n);
            // zuletzt (sie bauen die Chunks an jeder Quelle und am Bach selbst): das gezeichnete Wasser gegen den Körper
            if (soll("quelle")) {
                const teil0 = await quellProbe(page, ORTE, teilen ? { k: 0, n: QUELL_TEILE } : null);
                befund.quelle = teilen ? quellTeileVereinen([teil0, ...(await Promise.all(helfer))]) : teil0;
            }
            if (soll("bach"))
                befund.bach = await page.evaluate((o) => window.__wasserBach({ x: o.bach.x, z: o.bach.z }), ORTE);
            if (soll("see"))
                befund.see = await page.evaluate((o) => window.__wasserSee({ fenster: o.see.fenster }), ORTE);
            // ganz zuletzt (sie schneiden und schütten die Welt): der Graben am Fluss (F3), 60 m stromab der Damm (gelaende.K2)
            if (soll("graben")) {
                await page.evaluate((f) => window.__wasserStrom([f.x, f.z], 0.6), ORTE.fluss);
                befund.graben = await page.evaluate((f) => window.__wasserGraben({ fluss: f }), ORTE.fluss);
            }
            if (soll("damm")) befund.damm = await page.evaluate((f) => window.__wasserDamm({ fluss: f }), ORTE.fluss);
        }
        const v = urteil(befund);
        console.log(JSON.stringify(befund, null, 1));
        // in der CI auch als Annotation (die Check-Run-API trägt sie ohne Log-Rechte): K16 — das Bild war dort rot
        // und lokal grün, der Täter stand nur im Log
        if (v.length) {
            console.log(`\nWASSER-LEBEN ROT (${v.length}):`);
            for (const x of v) console.log("  ❌ " + x);
            v.forEach(annotation);
        } else console.log("\nWASSER-LEBEN GRÜN");
        exit = v.length ? 1 : 0;
    } catch (e) {
        // der Stapel nennt die Zeile, die las (aus der Seite: die Probe `__wasser*` oder der Stamm), nie nur die Meldung
        console.log("WASSER-LEBEN ABBRUCH:", (e && (e.stack || e.message)) || e);
        annotation(`ABBRUCH ${String((e && e.message) || e).split("\n")[0]}`);
        exit = 1;
    } finally {
        await browser.close().catch(() => {});
        server.close();
    }
    process.exit(exit);
}
