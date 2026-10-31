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
//   (6) DER SAUM DER KARTE (w4-laub-saum, lod.K1; phyto-core `karteSaum`): EINE Krone aus 900 4 × 4-Flecken je Ansicht
//       (8 Ansichten 128 × 256 wie der Atlas, Lage aus dem Gesetz-Zufall mulberry32), je Baum- und Strauch-Art des Kerns ihre
//       Stufen mit dem Saum ihres Gesetzes (treeParams der Nah-Stufe, Same 1, Rahmen-Höhe 1,02 × Wuchshöhe): (a) jede Stufe
//       deckt den Anteil der Stufe 0 (± ½ Texel je Ansicht, gezählt in ihren Bytes — kein Ausdünnen in der Ferne); (b) der
//       Umriss folgt der Art: je Saum-Gesetz (Zelle, Laub oder Nadel) ein eigener Umriss der Stufe 2 (ein stummer Saum, ein
//       Saum der Stärke 0 gibt allen Arten denselben); (c) die Konifere (artPhaenotyp) trägt den Nadel-Saum, die Nadel ist
//       feiner als das kleinste Blatt.
// (D3c: der Stoff der Senke, sein Wind und die sRGB-Marke des Atlas standen am Stamm-TEXT und fielen ohne Welt im Skript.)
// Die Außen-Normalen des Fels-Oktaeders fielen mit dem Host-Bauer (gate:altlasten hält _scatterSpeciesGeometry);
// die Studio-Gestalt ist byte-genau eingefroren (gate:asset-contract).
// --selftest: ein Farn mit roher Palette, ein Schilf mit rohem Hex, eine Boden-Zeile ohne Preset, Lambert-Wege und die
// Karten-Brüche (Hüllen um den Codec: ungekodiert, roh gemittelt, der Saum stumm, Ausdünnen in der Ferne, die Nadel als
// Laub) → alle MÜSSEN beim Namen feuern.
// Exit: 0 grün · 1 rot.
// ============================================================================
"use strict";
const { ausDatei, SELBSTTEST, path, stammLib, vm } = require("./lib/welt-boot.cjs");

const root = path.resolve(__dirname, "..");
const PHYTO = ausDatei(path.join(root, "phyto-core.js"));
const KERN = ausDatei(path.join(root, "foundry-core.js"));

// Der Karten-Codec aus einer phyto-core-Quelle (echt oder injiziert), in einer eigenen Sandbox geladen.
function codecAus(phytoSrc) {
    const sandbox = {};
    new Function("self", phytoSrc)(sandbox);
    return sandbox.__phytoCore || null;
}
// linear → sRGB nach IEC 61966-2-1: die Referenz der Linse (abnahme-urteil linSrgb), unabhängig vom Codec.
const { linSrgb } = require("./lib/abnahme-urteil.cjs");
const { absorber } = require("./lib/asset-worker-harness.cjs");
const srgbSoll = (v) => Math.round(linSrgb(v) * 255);
function kartenFarbe(core) {
    const fehler = [];
    if (!core || typeof core.impostorMips !== "function") return ["der Karten-Codec (phyto-core impostorMips) fehlt"];
    // Stufe 0: 256 opake Texel (16 × 16, V = 1), Texel i trägt den linearen Wert i in r, g, b.
    const w = 16,
        h = 16;
    const lin = Uint8Array.from({ length: w * h * 4 }, (_, j) => (j % 4 === 3 ? 255 : j >> 2));
    const [d0, d1] = ((core.impostorMips(lin, w, h, 1, null, 2) || {}).stufen || []).map((s) => s.data);
    let ab0 = 0;
    for (let i = 0; i < 256; i++) if (!d0 || d0[i * 4] !== srgbSoll(i / 255) || d0[i * 4 + 3] !== 255) ab0++;
    if (ab0) fehler.push(`die Karten-Kodierung weicht in ${ab0} von 256 Stufen von linear → sRGB ab (Stufe 0)`);
    // Stufe 1: das LINEARE Mittel der vier Kinder, dann kodiert (nie das Mittel der sRGB-Bytes).
    let ab1 = 0;
    // das Mittel der vier Kinder (2y + dy)·w + 2x + dx ist (2y + ½)·w + 2x + ½
    for (let y = 0; y < h / 2; y++)
        for (let x = 0; x < w / 2; x++)
            if (!d1 || Math.abs(d1[(y * (w / 2) + x) * 4] - srgbSoll(((2 * y + 0.5) * w + 2 * x + 0.5) / 255)) > 1) ab1++;
    if (ab1) fehler.push(`die gemittelte Mip-Stufe ist nicht linear gemittelt und sRGB-kodiert (${ab1} von ${(w * h) / 4} Texeln)`);
    return fehler;
}

// (6) DER SAUM DER KARTE — ein Rausch-Feld (30 % deckend, 8 Ansichten 128 × 256 wie der Atlas), je Baum- und Strauch-Art des
// Kerns seine Stufen mit dem Saum ihres Gesetzes; Rückgabe { fehler, n: die Saum-Gesetze }. Dazu JE HEBUNGS-RING des Rezepts
// (w4-laub-saum, 31.10.; phyto-core `karteSaumRinge`, eine Krone vom Boden an im Einheits-Rahmen): jeder Ring trägt eine Zelle und
// seinen Kronen-Fuß in seiner Ansicht — bis dahin wählten die gehobenen Ringe die geglättete Hülle.
function kartenSaum(core, presets, ic) {
    const [rnd, rgba, fehler, umriss] = [core.mulberry32(1), new Uint8Array(1 << 20), [], new Map()];
    const ringe = core.karteRinge(ic.views, ic.cellW, ic.cellH, ic.hebungen, ic.ringTeiler).ringe;
    rgba.forEach((x, i) => i % 4 === 3 && rnd() < 0.3 && (rgba[i] = 255));
    for (const [art, pre] of Object.entries(presets)) {
        if (!pre.s || !/^(tree|shrub)$/.test(pre.kind)) continue;
        const P = core.treeParams(pre.s, 1, 0, pre, 0), sa = core.karteSaum(P, 0.51 * P.height, 256);
        core.karteSaumRinge(P, 1, 1, { minY: 0, R: 0 }, ringe, 256).ringe.forEach((r, i) => r.e * r.fuss > 0 || fehler.push(`Saum ${art}: Ring ${ringe[i].hebung}° ohne Saum`));
        const st = core.impostorMips(rgba, 128, 2048, 8, null, 6, { saum: Object.assign({ fuss: 256 }, sa) }).stufen.map((s) => s.data.filter((x, i) => i % 4 === 3));
        const d = st.map((m) => m.filter((x) => x).length / m.length);
        d.forEach((x, k) => Math.abs(x - d[0]) > 0.5 / (32768 >> (2 * k)) && fehler.push(`Saum ${art}: Stufe ${k} deckt ${x} statt ${d[0]} — die Karte dünnt aus`));
        if (sa.nadel !== !!core.artPhaenotyp(pre.s, pre).conifer) fehler.push(`Saum ${art}: Laub und Nadel vertauscht`);
        umriss.set(sa.e + " " + sa.nadel, String(st[2]));
    }
    if (new Set(umriss.values()).size < umriss.size) fehler.push(`Saum: ${umriss.size} Saum-Gesetze, ${new Set(umriss.values()).size} Umrisse — der Umriss folgt nicht der Art`);
    return { fehler, n: umriss.size };
}

// Ein absorbierender Proxy: frisst jeden THREE-Aufruf der Top-Level-Ausführung des Kerns — nur die Daten zählen
// (dieselbe Lade-Art wie gate:studio-vertrag).
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
    const kernNC = stammLib.ohneKommentare(kernSrc);
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
            fehler.push(`${id} (${name}): new THREE.Color( — eine Palette liegt roh als Albedo (Farb-Gesetz: vegFarbe) · ${stammLib.fehlt.wo}`);
        if (!stammLib.fehlt(kopf, /(?<!vegFarbe\()0x[0-9a-fA-F]{6}\b/, kq))
            fehler.push(`${id} (${name}): Hex-Palette außerhalb von vegFarbe(…) — sRGB-Absicht roh gelesen · ${stammLib.fehlt.wo}`);
    }
    if (!arten) fehler.push("keine Studio-Art der Nah-Streu geprüft — die Linse sähe nichts");
    // (4) DIE LAMBERT-WAND: kein Stoff der Welt ist Lambert (der ganze kommentar-freie Stamm, über den EINEN Helfer).
    if (!stammLib.fehlt(null, /MeshLambert\w*/, o.src))
        fehler.push(`Lambert-Stoff im Stamm (${stammLib.fehlt.wo}) — r184-Lambert liest den EINEN Himmel (scene.environment) nie diffus`);
    // das Fundament (`_archFundMat`, der Stoff des Podests) fiel mit dem Podest (K10: der Erdbau des Plans trägt das Haus) —
    // jeder übrige Stoff steht unter der Lambert-Wand oben
    // (5) DIE KARTEN-FARBE — am echten Codec (phyto-core); die Welt-Schicht ist sRGB markiert
    for (const f of kartenFarbe(o.core || codecAus(PHYTO))) fehler.push(f);
    // (6) DER SAUM DER KARTE — am echten Codec, je Art des Kerns
    const saum = kartenSaum(o.core || codecAus(PHYTO), d.presets, d.cfg.impostor);
    fehler.push(...saum.fehler);
    return { fehler, arten, weich, saum: saum.n };
}

function main() {
    if (SELBSTTEST) {
        const echt = pruefe();
        // der Codec gebrochen als Hülle: Stufe 0 ungekodiert (linear), Stufe 1 aus den sRGB-Bytes gemittelt
        const codec = (bruch) => { const c = Object.assign({}, codecAus(PHYTO)); const m0 = c.impostorMips; c.impostorMips = (lin, ...a) => bruch(m0(lin, ...a), lin); return c; };
        // [Name, Muster, Bruch]
        const brueche = [
            ["Farn mit roher Palette", /farn \(emitFern\): new THREE\.Color/, { kern: KERN.replace("c1 = vegFarbe(P.farbe),", "c1 = new THREE.Color(P.farbe),") }],
            ["Schilf mit rohem Hex", /schilf \(emitSchilf\): Hex-Palette/, { kern: KERN.replace("vegFarbe(0x46602a)", "(0x46602a)") }],
            ["Boden-Zeile ohne Preset", /placement\.boden\.geist: kein Preset/, { daten: (d) => (d.cfg.placement.boden.geist = { ring: "nah", dichte: 1, skala: [1, 1] }) }],
            [
                "Lambert-Wege",
                /Lambert-Stoff/,
                { src: (t) => stammLib.ersetze(t, "_kistenPool", "new THREE.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 1, metalness: 0 })", "new THREE.MeshLambertMaterial({ color: 0xffffff })") },
            ],
            ["Karte ohne Kodierung", /Karten-Kodierung weicht/, { core: codec((m, lin) => (m.stufen[0].data.set(lin), m)) }],
            ["Saum stumm", /der Umriss folgt nicht der Art/, { core: ((c) => ((c.KARTEN_GESETZ.saum = 0), c))(codecAus(PHYTO)) }],
            ["Ausdünnen in der Ferne", /die Karte dünnt aus/, { core: codec((m) => (m.stufen.slice(3).forEach((s) => s.data.fill(0)), m)) }],
            ["Nadel als Laub", /Laub und Nadel vertauscht/, { core: ((c, f = c.karteSaum) => Object.assign(c, { karteSaum: (...a) => ({ ...f(...a), nadel: false }) }))(codecAus(PHYTO)) }],
            ["Ring −20° ohne Saum", /Ring -20° ohne Saum/, { core: ((c, f = c.karteSaumRinge) => Object.assign(c, { karteSaumRinge: (...a) => ((a = f(...a)), (a.ringe[0].e = 0), a) }))(codecAus(PHYTO)) }],
            ["Mip-Stufe roh gemittelt", /linear gemittelt/, { core: codec((m) => { const [a, b] = m.stufen; for (let o = 0; o < b.data.length / 4; o++) { const x = o % b.width, y = (o / b.width) | 0, w = a.width; b.data[o * 4] = Math.round((a.data[(2 * y * w + 2 * x) * 4] + a.data[(2 * y * w + 2 * x + 1) * 4] + a.data[((2 * y + 1) * w + 2 * x) * 4] + a.data[((2 * y + 1) * w + 2 * x + 1) * 4]) / 4); } return m; }) }],
        ];
        let ok = Array.isArray(echt.fehler) && echt.fehler.length === 0;
        console.log(`${ok ? "✅" : "❌"} SELBST-TEST: die echte Quelle ist grün${ok ? "" : " — " + echt.fehler.join(" · ")}`);
        for (const [name, muster, bruch] of brueche) {
            const r = pruefe(bruch);
            const feuert = r.fehler.some((f) => muster.test(f));
            console.log(`${feuert ? "✅" : "❌"} SELBST-TEST: „${name}" → die Linse nennt ihn${r.fehler.length ? " — " + r.fehler[0] : ""}`);
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
        `✅ DIE STREU-WAHRHEIT steht — ${r.arten} Studio-Arten der Nah-Streu (placement.boden ring "nah"), ${r.weich} mit weichem Gewebe backen jede Palette über vegFarbe, kein Lambert-Stoff im Stamm (Fundament, Wege, Fern-Ring, Rauch, Gras lesen den EINEN Himmel), der Karten-Codec kodiert die Studio-Karte sRGB, der Saum der Karte deckungstreu je Stufe, ${r.saum} Saum-Gesetze mit eigenem Umriss.`
    );
}
main();
