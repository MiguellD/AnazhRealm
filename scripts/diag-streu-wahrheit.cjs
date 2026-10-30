#!/usr/bin/env node
// ============================================================================
// DIE STREU-WAHRHEIT — gate:streu-wahrheit (Bild-Wahrheit (b); Integration Waldboden 05.10.)
//
// Die Nah-Streu liest ihr Licht (keine schwarzen Brocken auf der Wiese): die Linse liest die STUDIO-ARTEN der Nah-Streu
// (foundry-core `placement.boden`, ring "nah") und hält die Klasse dort:
//   (1) DIE ARTEN: jede Boden-Zeile mit ring "nah" ist ein Preset des Kerns, dessen kind einen Studio-Emitter hat
//       (buildInstance: emitFlower · emitRock · WALDBODEN_EMIT) — die Arten, die die Welt zeichnet;
//   (2) DAS FARB-GESETZ je Art: ein Emitter mit weichem Gewebe (foliageMat · stemMat — Laub, Halm, Stiel, Blüte, die
//       Stoffe, die auch in der Welt wiegen) backt jede Palette über vegFarbe (sRGB-Absicht → linear): kein
//       `new THREE.Color(` und kein Hex-Literal außerhalb von vegFarbe(…); Rinde und Fels liegen nach dem Studio-
//       Gesetz roh im Band (foundry-core vegFarbe) und sind ausgenommen;
//   (4) DIE LAMBERT-WAND: der kommentar-freie Stamm baut keinen Lambert-Stoff (das Fundament fiel mit dem Podest, K10);
//   (5) DIE KARTEN-FARBE: die Studio-Karte reist linear (Render-Target), die Welt-Schicht ist sRGB markiert — der
//       Karten-Codec (phyto-core impostorMips) kodiert jede Mip-Stufe linear → sRGB, gemessen am echten Codec gegen
//       die Referenz-Formel (alle 256 Stufen, Stufe 0 und die linear gemittelte Stufe 1) (die CPU-Mips der Normale fielen mit
//       `karteKodiere`: die GPU-Ablage mittelt sie, KARTE_RECHNER_WGSL normalK);
//   (6) DER SAUM DER KARTE (w4-laub-saum, lod.K1; phyto-core `karteSaum`): je Baum- und Strauch-Art des Kerns der Saum
//       ihres Gesetzes (treeParams der Nah-Stufe, Same 1, Rahmen-Höhe 1,02 × Wuchshöhe) über einer Krone aus 900
//       4 × 4-Flecken je Ansicht (8 Ansichten 128 × 256 wie der Atlas, Lage aus dem Gesetz-Zufall mulberry32), die Stufen
//       des Codecs mit und ohne Saum: (a) jede Stufe deckt den Anteil der Stufe 0 (± ½ Texel je Ansicht, gezählt in ihren
//       Bytes — kein Ausdünnen in der Ferne); (b) der Saum rückt Rand-Texel (≥ 1 ‰ der Stufe 0 — der Umriss folgt der
//       Art, nicht der Hülle); (c) die Konifere (artPhaenotyp) trägt den Nadel-Saum, die Nadel ist feiner als das
//       kleinste Blatt.
// (D3c: der Stoff der Senke, sein Wind und die sRGB-Marke des Atlas standen am Stamm-TEXT und fielen ohne Welt im Skript.)
// Die Außen-Normalen des Fels-Oktaeders fielen mit dem Host-Bauer (gate:altlasten hält _scatterSpeciesGeometry);
// die Studio-Gestalt ist byte-genau eingefroren (gate:asset-contract).
// --selftest: ein Farn mit roher Palette, ein Schilf mit rohem Hex, eine Boden-Zeile ohne Preset, Lambert-Wege und die
// Karten-Brüche (Hüllen um den Codec: ungekodiert, roh gemittelt, der Saum stumm, Ausdünnen in der Ferne, die Nadel als
// Laub) → alle MÜSSEN beim Namen feuern.
// Exit: 0 grün · 1 rot.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { linSrgb } = require("./lib/abnahme-urteil.cjs");

const root = path.resolve(__dirname, "..");
const PHYTO = fs.readFileSync(path.join(root, "phyto-core.js"), "utf8");
const KERN = fs.readFileSync(path.join(root, "foundry-core.js"), "utf8");
const vm = require("vm");

// Der Karten-Codec aus einer phyto-core-Quelle (echt oder injiziert), in einer eigenen Sandbox geladen.
function codecAus(phytoSrc) {
    const sandbox = {};
    new Function("self", phytoSrc)(sandbox);
    return sandbox.__phytoCore || null;
}
// linear → sRGB nach IEC 61966-2-1: die Referenz der Linse (abnahme-urteil linSrgb), unabhängig vom Codec.
const srgbSoll = (v) => Math.round(linSrgb(v) * 255);
function kartenFarbe(core) {
    const fehler = [];
    if (!core || typeof core.impostorMips !== "function") return ["der Karten-Codec (phyto-core impostorMips) fehlt"];
    // Stufe 0: 256 opake Texel (16 × 16, V = 1), Texel i trägt den linearen Wert i in r, g, b.
    const w = 16,
        h = 16;
    const lin = new Uint8Array(w * h * 4);
    for (let i = 0; i < 256; i++) {
        lin[i * 4] = lin[i * 4 + 1] = lin[i * 4 + 2] = i;
        lin[i * 4 + 3] = 255;
    }
    const mips = core.impostorMips(lin, w, h, 1, null, 2);
    const d0 = mips && mips.stufen && mips.stufen[0] ? mips.stufen[0].data : null;
    let ab0 = 0;
    for (let i = 0; i < 256; i++) if (!d0 || d0[i * 4] !== srgbSoll(i / 255) || d0[i * 4 + 3] !== 255) ab0++;
    if (ab0) fehler.push(`die Karten-Kodierung weicht in ${ab0} von 256 Stufen von linear → sRGB ab (Stufe 0)`);
    // Stufe 1: das LINEARE Mittel der vier Kinder, dann kodiert (nie das Mittel der sRGB-Bytes).
    const d1 = mips && mips.stufen && mips.stufen[1] ? mips.stufen[1].data : null;
    let ab1 = 0;
    for (let y = 0; y < h / 2; y++)
        for (let x = 0; x < w / 2; x++) {
            let m = 0;
            for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) m += (y * 2 + dy) * w + x * 2 + dx;
            const o = y * (w / 2) + x;
            if (!d1 || Math.abs(d1[o * 4] - srgbSoll(m / 4 / 255)) > 1) ab1++;
        }
    if (ab1)
        fehler.push(
            `die gemittelte Mip-Stufe ist nicht linear gemittelt und sRGB-kodiert (${ab1} von ${(w * h) / 4} Texeln)`
        );
    return fehler;
}

// (6) DER SAUM DER KARTE — je Baum- und Strauch-Art eine Krone (je Ansicht 900 Blatt-Quadrate von 4 px im Feld der Krone), ihre
// Stufen mit und ohne den Saum der Art; Rückgabe { fehler, mess }
function kartenSaum(core, presets) {
    const [V, fehler, mess, e] = [8, [], [], { true: [], false: [] }];
    for (const [art, pre] of Object.entries(presets)) {
        if (!pre.s || !/^(tree|shrub)$/.test(pre.kind)) continue;
        const P = core.treeParams(pre.s, 1, 0, pre, 0);
        const [sa, rnd, rgba] = [
            core.karteSaum(P, 0.51 * P.height, 256),
            core.mulberry32(1),
            new Uint8Array(32768 * V * 4),
        ];
        for (let n = 0; n < 900 * V; n++)
            for (let [u, t, i] = [(16 + rnd() * 96) | 0, (32 + rnd() * 160) | 0, 0]; i < 16; i++)
                rgba[((n % V) * 32768 + (t + (i >> 2)) * 128 + u + (i & 3)) * 4 + 3] = 255;
        const [mit, ohne] = [{ saum: Object.assign({ fuss: 256 }, sa) }, {}].map((o) =>
            core
                .impostorMips(rgba, 128, 256 * V, V, null, 6, o)
                .stufen.map((st) => st.data.filter((x, i) => i % 4 === 3))
        );
        let bewegt = 0;
        mit.forEach((m, k) => {
            bewegt += m.filter((x, i) => x !== ohne[k][i]).length;
            const [d, d0] = [m.filter((x) => x).length / m.length, mit[0].filter((x) => x).length / mit[0].length];
            if (Math.abs(d - d0) > 0.5 / (32768 >> (2 * k)))
                fehler.push(
                    `Saum ${art}: Stufe ${k} deckt ${d.toFixed(5)} statt ${d0.toFixed(5)} — die Karte dünnt aus`
                );
        });
        if (bewegt < mit[0].length / 1000) fehler.push(`Saum ${art}: der Saum rückt keinen Rand-Texel`);
        if (sa.nadel !== !!core.artPhaenotyp(pre.s, pre).conifer)
            fehler.push(`Saum ${art}: ${sa.nadel ? "Nadel" : "Laub"}-Saum an einer ${sa.nadel ? "Laub" : "Nadel"}-Art`);
        e[sa.nadel].push(sa.e);
        mess.push(`${art} ${sa.nadel ? "Nadel" : "Laub"} ${sa.e.toFixed(1)} px, ${bewegt} Texel gerückt`);
    }
    if (!(Math.max(...e.true) < Math.min(...e.false)))
        fehler.push("Saum: die Nadel ist nicht feiner als das kleinste Blatt");
    return { fehler, mess };
}

// Ein absorbierender Proxy: frisst jeden THREE-Aufruf der Top-Level-Ausführung des Kerns — nur die Daten zählen
// (dieselbe Lade-Art wie gate:studio-vertrag).
function absorber() {
    const a = new Proxy(function () {}, { get: () => a, apply: () => a, construct: () => a });
    return a;
}
// Die Daten des Pflanzen-Kerns (phyto-core + foundry-core, wie cores.manifest.json sie lädt): PRESETS und
// PORTAL_RENDER_CONFIG. null, wenn der Kern nicht lädt.
function kernDaten(phytoSrc, kernSrc) {
    const ctx = vm.createContext({
        THREE: absorber(),
        console: { log() {}, warn() {}, error() {} },
        performance: { now: () => 0 },
    });
    ctx.self = ctx;
    ctx.globalThis = ctx;
    try {
        vm.runInContext(
            phytoSrc +
                "\n;" +
                kernSrc +
                "\n;__daten = { presets: typeof PRESETS !== 'undefined' ? PRESETS : null, cfg: typeof PORTAL_RENDER_CONFIG !== 'undefined' ? PORTAL_RENDER_CONFIG : null };",
            ctx,
            { timeout: 30000, filename: "foundry-core.js" }
        );
        return ctx.__daten;
    } catch {
        return null;
    }
}
// Der Rumpf einer Kern-Funktion `function name(` (kommentar-frei), null wenn sie fehlt.
function kernFn(kernNC, name) {
    return /^[A-Za-z_]\w*$/.test(name) ? stammLib.rumpf(kernNC, new RegExp("\\nfunction " + name + "\\(")) : null;
}
// Der Emitter eines kind: buildInstance dispatcht flower → emitFlower, grass → emitGrass, die Boden-Arten über
// WALDBODEN_EMIT, rock über emitRock (die Gestein-Bahn), sonst emitTree.
function emitterVon(kernNC, kind) {
    const wb = /const WALDBODEN_EMIT = \{([^}]*)\}/.exec(kernNC);
    if (wb)
        for (const paar of wb[1].split(",")) {
            const [k, fn] = paar.split(":").map((x) => (x || "").trim());
            if (k === kind && fn) return fn;
        }
    if (kind === "flower") return "emitFlower";
    if (kind === "grass") return "emitGrass";
    if (kind === "rock") return "emitRock";
    return null;
}

// o: { src (Wandlung des Stamms), kern (foundry-core), daten (Hülle um die geladenen Daten), core (der Karten-Codec) } — der Selbsttest
// bricht je eines (D3c: Daten und Codec als Hülle am Lauf, nie am Quelltext)
function pruefe(o = {}) {
    const fehler = [];
    const kernSrc = o.kern || KERN;
    const kernNC = stammLib.ohneKommentare(kernSrc); // Kommentare gestrippt, Strings bewahrt (der EINE Stripper)
    // (1) DIE STUDIO-ARTEN der Nah-Streu
    const d = kernDaten(PHYTO, kernSrc);
    if (d && o.daten) o.daten(d);
    const boden = d && d.cfg && d.cfg.placement ? d.cfg.placement.boden : null;
    if (!d || !d.presets) return { fehler: ["der Pflanzen-Kern (PRESETS) lädt nicht"], arten: 0, weich: 0 };
    if (!boden) fehler.push("placement.boden fehlt — die Nah-Streu hat keine Studio-Arten");
    let arten = 0;
    let weich = 0;
    for (const id of Object.keys(boden || {})) {
        const z = boden[id];
        if (!z || z.ring !== "nah") continue;
        const pre = d.presets[id];
        if (!pre) {
            fehler.push(`placement.boden.${id}: kein Preset im Kern — die Welt zeichnet eine Art ohne Studio-Gestalt`);
            continue;
        }
        const name = emitterVon(kernNC, pre.kind);
        const koerper = name ? kernFn(kernNC, name) : null;
        if (!koerper) continue;
        arten++;
        // (2) DAS FARB-GESETZ: weiches Gewebe (foliageMat · stemMat) backt jede Palette über vegFarbe.
        if (!/\b(foliageMat|stemMat)\b/.test(koerper)) continue; // Rinde/Fels: roh im Band (Studio-Gesetz)
        weich++;
        // die Absenzen über den EINEN Helfer, im Rumpf des Emitters (die Kern-Quelle des Laufs, gewandelt im Selbsttest)
        const kopf = new RegExp("\\nfunction " + name + "\\(");
        const kq = { datei: "foundry-core.js", wandel: o.kern };
        if (!stammLib.fehlt(kopf, /new THREE\.Color\(/, kq))
            fehler.push(
                `${id} (${name}): new THREE.Color( — eine Palette liegt roh als Albedo (Farb-Gesetz: vegFarbe) · ${stammLib.fehlt.wo}`
            );
        if (!stammLib.fehlt(kopf, /(?<!vegFarbe\()0x[0-9a-fA-F]{6}\b/, kq))
            fehler.push(
                `${id} (${name}): Hex-Palette außerhalb von vegFarbe(…) — sRGB-Absicht roh gelesen · ${stammLib.fehlt.wo}`
            );
    }
    if (!arten) fehler.push("keine Studio-Art der Nah-Streu geprüft — die Linse sähe nichts");
    // (4) DIE LAMBERT-WAND: kein Stoff der Welt ist Lambert (der ganze kommentar-freie Stamm, über den EINEN Helfer).
    if (!stammLib.fehlt(null, /MeshLambert\w*/, o.src))
        fehler.push(
            `Lambert-Stoff im Stamm (${stammLib.fehlt.wo}) — r184-Lambert liest den EINEN Himmel (scene.environment) nie diffus`
        );
    // das Fundament (`_archFundMat`, der Stoff des Podests) fiel mit dem Podest (K10: der Erdbau des Plans trägt das Haus) —
    // jeder übrige Stoff steht unter der Lambert-Wand oben
    // (5) DIE KARTEN-FARBE — am echten Codec (phyto-core); die Welt-Schicht ist sRGB markiert
    for (const f of kartenFarbe(o.core || codecAus(PHYTO))) fehler.push(f);
    // (6) DER SAUM DER KARTE — am echten Codec, je Art des Kerns
    const saum = kartenSaum(o.core || codecAus(PHYTO), d.presets);
    fehler.push(...saum.fehler);
    return { fehler, arten, weich, saum: saum.mess };
}

function main() {
    if (process.argv.includes("--selftest")) {
        const echt = pruefe();
        // der Codec gebrochen als Hülle: Stufe 0 ungekodiert (linear), Stufe 1 aus den sRGB-Bytes gemittelt
        // `arg` wandelt die Argumente des Codecs (der Saum stumm: ohne das sechste, opt)
        const codec = (bruch, arg = (a) => a) => {
            const c = Object.assign({}, codecAus(PHYTO));
            const m0 = c.impostorMips;
            c.impostorMips = (lin, ...a) => bruch(m0(lin, ...arg(a)), lin);
            return c;
        };
        // [Name, Muster, Bruch]
        const brueche = [
            [
                "Farn mit roher Palette",
                /farn \(emitFern\): new THREE\.Color/,
                { kern: KERN.replace("c1 = vegFarbe(P.farbe),", "c1 = new THREE.Color(P.farbe),") },
            ],
            [
                "Schilf mit rohem Hex",
                /schilf \(emitSchilf\): Hex-Palette/,
                { kern: KERN.replace("vegFarbe(0x46602a)", "(0x46602a)") },
            ],
            [
                "Boden-Zeile ohne Preset",
                /placement\.boden\.geist: kein Preset/,
                { daten: (d) => (d.cfg.placement.boden.geist = { ring: "nah", dichte: 1, skala: [1, 1] }) },
            ],
            [
                "Lambert-Wege",
                /Lambert-Stoff/,
                {
                    src: (t) =>
                        stammLib.ersetze(
                            t,
                            "_kistenPool",
                            "new THREE.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 1, metalness: 0 })",
                            "new THREE.MeshLambertMaterial({ color: 0xffffff })"
                        ),
                },
            ],
            [
                "Karte ohne Kodierung",
                /Karten-Kodierung weicht/,
                { core: codec((m, lin) => (m.stufen[0].data.set(lin), m)) },
            ],
            [
                "Saum stumm",
                /der Saum rückt keinen Rand-Texel/,
                {
                    core: codec(
                        (m) => m,
                        (a) => a.slice(0, 5)
                    ),
                },
            ],
            [
                "Ausdünnen in der Ferne",
                /die Karte dünnt aus/,
                {
                    core: codec((m) => {
                        for (const st of m.stufen.slice(2)) for (let i = 3; i < st.data.length; i += 32) st.data[i] = 0;
                        return m;
                    }),
                },
            ],
            [
                "Nadel als Laub",
                /Laub-Saum an einer Nadel-Art/,
                {
                    core: Object.assign(codecAus(PHYTO), {
                        karteSaum: (P, h, c) => Object.assign(codecAus(PHYTO).karteSaum(P, h, c), { nadel: false }),
                    }),
                },
            ],
            [
                "Mip-Stufe roh gemittelt",
                /linear gemittelt/,
                {
                    core: codec((m) => {
                        const [a, b] = m.stufen;
                        for (let o = 0; o < b.data.length / 4; o++) {
                            const x = o % b.width,
                                y = (o / b.width) | 0,
                                w = a.width;
                            b.data[o * 4] = Math.round(
                                (a.data[(2 * y * w + 2 * x) * 4] +
                                    a.data[(2 * y * w + 2 * x + 1) * 4] +
                                    a.data[((2 * y + 1) * w + 2 * x) * 4] +
                                    a.data[((2 * y + 1) * w + 2 * x + 1) * 4]) /
                                    4
                            );
                        }
                        return m;
                    }),
                },
            ],
        ];
        let ok = Array.isArray(echt.fehler) && echt.fehler.length === 0;
        console.log(
            `${ok ? "✅" : "❌"} SELBST-TEST: die echte Quelle ist grün${ok ? "" : " — " + echt.fehler.join(" · ")}`
        );
        for (const [name, muster, bruch] of brueche) {
            const r = pruefe(bruch);
            const feuert = r.fehler.some((f) => muster.test(f));
            console.log(
                `${feuert ? "✅" : "❌"} SELBST-TEST: „${name}" → die Linse nennt ihn${r.fehler.length ? " — " + r.fehler[0] : ""}`
            );
            ok = ok && feuert;
        }
        process.exit(ok ? 0 : 1);
    }
    const r = pruefe();
    if (r.fehler.length) {
        console.error("⛔ DIE STREU-WAHRHEIT:");
        for (const f of r.fehler) console.error("   ❌ " + f);
        process.exit(1);
    }
    console.log(
        `✅ DIE STREU-WAHRHEIT steht — ${r.arten} Studio-Arten der Nah-Streu (placement.boden ring "nah"), ${r.weich} mit weichem Gewebe backen jede Palette über vegFarbe, kein Lambert-Stoff im Stamm (Fundament, Wege, Fern-Ring, Rauch, Gras lesen den EINEN Himmel), der Karten-Codec kodiert die Studio-Karte sRGB, ` +
            `der Saum der Karte deckungstreu je Stufe: ${r.saum.join(" · ")}.`
    );
}
main();
