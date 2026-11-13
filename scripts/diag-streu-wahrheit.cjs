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
//   (6) DER SAUM DER KARTE (w4-laub-saum, w23-karte-l2, lod.K1#1; phyto-core `karteSaumRinge` · `karteSaumSchluessel`): eine
//       glatte Krone (die Scheibe in einer Ansicht 128 × 256 wie der Atlas), je Saum-Gesetz des Kerns (Laub, Nadel — aus dem
//       Phänotyp jeder Baum- und Strauch-Art) ihre Stufen: (a) jede Stufe deckt den Anteil der Stufe 0 (± ½ Texel, gezählt in
//       ihren Bytes — kein Ausdünnen in der Ferne); (b) der Umriss folgt der Art (Laub und Nadel je eine eigene Kante, ein
//       Saum der Stärke 0 gibt beiden dieselbe); (c) die Konifere (artPhaenotyp) trägt den Nadel-Saum; (d) jeder Ring trägt
//       Seitenmaß und Kronen-Fuß; (e) Stufe 0 und 1 FRANSEN IM MASS DES SCHIRMS: kante auf dem Raster der Stufe (die Welt liest
//       jede verkleinerte Stufe mit einem Texel je Pixel) unter dem Soll der Laub-Silhouette (soll-tafel laub-kante, 0,22; die
//       Scheibe ohne Saum 0,944, der Saum im Maß EINES Texels wie w23-karte-l2: Laub 0,328, Nadel 0,547 — ROT beim Namen;
//       Weite 3 / Zelle 2,5 / Stärke 8,4: Laub 0,125 / 0,087, Nadel 0,104 / 0,070, die Deckung je Stufe 0,220); (f) KEIN TEXEL
//       SCHWEBT OHNE KRONE (w28-laub-deckung): der Anteil der Stufe in freien Inseln (klassenMasse frei) im Band der Tafel
//       (laub-kante frei, 0,007) — das Muster am eigenen Ort mit Stärke 8,4 (bis w28) streute Laub 8 / 4, Nadel 48 / 16 Inseln
//       mit 0,024 / 0,052 und 0,105 / 0,124 und las dabei die beste Kante: ROT beim Namen; an der Deckung 1 / 0 und 2 / 0.
// (D3c: der Stoff der Senke, sein Wind und die sRGB-Marke des Atlas standen am Stamm-TEXT und fielen ohne Welt im Skript.)
// Die Außen-Normalen des Fels-Oktaeders fielen mit dem Host-Bauer (gate:altlasten hält _scatterSpeciesGeometry);
// die Studio-Gestalt ist byte-genau eingefroren (gate:asset-contract).
// --selftest: ein Farn mit roher Palette, ein Schilf mit rohem Hex, eine Boden-Zeile ohne Preset, Lambert-Wege und die
// Karten-Brüche (Hüllen um den Codec: ungekodiert, roh gemittelt, der Saum stumm, Ausdünnen in der Ferne, die Nadel als
// Laub, ein Ring ohne Saum, der Saum im Maß eines Texels wie w23) → alle MÜSSEN beim Namen feuern.
// Exit: 0 grün · 1 rot.
// ============================================================================
"use strict";
const { ausDatei, SELBSTTEST, stammLib, vm, jsonLesen, taeterFaelle, selbsttestEnde } = require("./lib/welt-boot.cjs");

const PHYTO = ausDatei("phyto-core.js");
const KERN = ausDatei("foundry-core.js");

// Der Karten-Codec, je Ruf frisch aus der Quelle (der EINE Lader `kernAusText`; bis w23-karte-l2 lud ihn die Linse selbst)
const codecAus = () => kernAusText(PHYTO, "__phytoCore");
// linear → sRGB nach IEC 61966-2-1: die Referenz der Linse (abnahme-urteil linSrgb), unabhängig vom Codec.
const { linSrgb, klassenMasse } = require("./lib/abnahme-urteil.cjs");
const { kernKontext, kernAusText } = require("./lib/asset-worker-harness.cjs");
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

// (6) DER SAUM DER KARTE — eine glatte Krone (die Scheibe in einer Ansicht 128 × 256 wie der Atlas), je Saum-Gesetz des Kerns ihre
// Stufen: jede deckt wie Stufe 0, Laub und Nadel tragen je ihren Umriss; Rückgabe { fehler, n: die Saum-Gesetze }. Dazu JE HEBUNGS-RING des Rezepts
// (w4-laub-saum, 31.10.; phyto-core `karteSaumRinge`, eine Krone vom Boden an im Einheits-Rahmen): jeder Ring trägt sein
// Seitenmaß und seinen Kronen-Fuß in seiner Ansicht — bis dahin wählten die gehobenen Ringe die geglättete Hülle.
// DIE KANTE DES SAUMS (w23-karte-l2, w24-strauch-saum, lod.K1#1): eine glatte Krone (die Scheibe, Kohärenz ≈ 1) trägt auf Stufe 0
// UND Stufe 1 einen zerfransten Umriss — `kante` der Soll-Tafel (abnahme-urteil `klassenMasse`, σ 2 px auf dem Raster der Stufe)
// unter ihrem Soll, je Laub und Nadel. Bis w24 hieß die Grenze 0,57: der Saum im Maß eines Texels (Zelle 6, Band σ 2) hielt sie
// und stand am Schirm als 6-px-Welle — der Strauch der Tafel (17–25 px hoch, verkleinert gelesen) las gerade (Radeon c61e3a9b 0,3515).
// Bis w23 wählte Stufe 0 nie, die Zelle maß die Blattgröße (Strauch 55 Stufe-0-Texel), das Muster verschob den Umriss um ein Texel:
// an der Tafel-Pose standen Laibe (Radeon, main 03300ec8: strauch 0,4023, birke 0,3293).
const [KANTE_SOLL, FREI_SOLL] = ["kante", "frei"].map((g) => jsonLesen("spec/abnahme/soll-tafel.json").klassen.find((k) => k.id === "laub-kante").soll.eigenschaften.find((e) => e.groesse === g).band[1]); // prettier-ignore
// DIE DECKUNG AM SCHIRM (w24-strauch-saum): die Welt liest die Stufen 1–3 bilinear, mischt je zwei (trilinear, der Anteil t der
// gröberen, t in Achteln ohne ½) und verwirft an der Schwelle der Karte (a ≤ s) — der Anteil, der besteht, je 4 × 4 Proben eines
// Texels (der Rand der Scheibe ist leer: ein Abgriff außerhalb liest 0). Bei 0,34 dehnte der Filter jeden Rand des Saums und
// vereinte die Muster zweier Stufen: die Scheibe deckte 1,20 ihrer Stufe 0, die Wiese stand dunkler (Koordinator 08.11.,
// bild:wiese@0.5 Kronen-Mitte 48,7 → 45,5)
function schirmDeckung(st, s, n = 0, m = 0) {
    for (let k = 1; k <= 3; k++)
        for (let y = 0.125; y < st[k].h; y += 0.25)
            for (let x = 0.125; x < st[k].w; x += 0.25) {
                const [b0, b1] = [1, 0.5].map((f, j, _, q = st[k + j], u = x * f - 0.5, v = y * f - 0.5, i = Math.floor(u), h = Math.floor(v)) =>
                    [0, 1, 2, 3].reduce((z, e) => z + (q.data[((h + (e >> 1)) * q.w + i + (e & 1)) * 4 + 3] / 255 || 0) * Math.abs(1 - (e & 1) - u + i) * Math.abs(1 - (e >> 1) - v + h), 0));
                for (let t = 0; t < 1; t += 0.125) if (t !== 0.5) (n++, (m += b0 + t * (b1 - b0) > s));
            }
    return m / n;
}
function kartenSaum(core, presets, ic) {
    const [fehler, umriss] = [[], new Map()]; // je Saum-Gesetz die Kante seiner Stufe 0
    const ringe = core.karteRinge(ic.views, ic.cellW, ic.cellH, ic.hebungen, ic.ringTeiler).ringe;
    const scheibe = Uint8Array.from({ length: 1 << 17 }, (_, i) => (i % 4 === 3 && Math.hypot(((i >> 2) % 128) - 64, (i >> 9) - 128) < 48 ? 255 : 0));
    const masse = (s) => klassenMasse(s.data, s.data.filter((x, i) => i % 4 === 3).map(Boolean), s.w, s.h);
    for (const [art, pre] of Object.entries(presets)) {
        if (!pre.s || !/^(tree|shrub)$/.test(pre.kind)) continue;
        const sa = core.karteSaumRinge(core.treeParams(pre.s, 1, 0, pre, 0), 1, 0.5, { minY: 0, R: 0 }, ringe, 128, 256);
        sa.ringe.forEach((r, i) => r.seite * r.fuss > 0 || fehler.push(`Saum ${art}: Ring ${ringe[i].hebung}° ohne Saum`));
        if (sa.nadel !== !!core.artPhaenotyp(pre.s, pre).conifer) fehler.push(`Saum ${art}: Laub und Nadel vertauscht`);
        // je Saum-Gesetz (Laub, Nadel — im selben Rahmen ist es die Art) EINMAL die Stufen und ihre Kante
        if (umriss.has(sa.nadel)) continue;
        const st = core.impostorMips(scheibe, 128, 256, 1, null, 6, { saum: { ...sa.ringe[1], nadel: sa.nadel } }).stufen;
        const d = st.map((s) => s.data.filter((x, i) => i % 4 === 3 && x).length / (s.w * s.h));
        d.forEach((x, k) => Math.abs(x - d[0]) > 0.5 / (32768 >> (2 * k)) && fehler.push(`Saum ${art}: Stufe ${k} deckt ${x} statt ${d[0]} — die Karte dünnt aus`));
        const schirm = schirmDeckung(st, core.KARTEN_GESETZ.schwelle) / d[0];
        if (Math.abs(schirm - 1) > 0.08) fehler.push(`Saum ${art}: die Karte deckt am Schirm ${schirm.toFixed(3)} ihrer Stufe 0 — der Test der Welt dehnt oder dünnt den Saum`);
        const ms = st.slice(0, 2).map(masse),
            k = ms.map((m) => m.kante);
        umriss.set(sa.nadel, k[0]);
        ms.forEach((m, j) => m.frei <= FREI_SOLL || fehler.push(`Saum ${art}: Stufe ${j} streut ${m.inseln} freie Inseln (Anteil ${m.frei} über ${FREI_SOLL}) — Texel schweben ohne Krone`));
        if (!(Math.max(...k) <= KANTE_SOLL)) fehler.push(`Saum ${art}: der Umriss franst nicht im Maß des Schirms (kante ${k} über ${KANTE_SOLL})`);
    }
    if (new Set(umriss.values()).size < umriss.size) fehler.push("Saum: Laub und Nadel tragen denselben Umriss — der Umriss folgt nicht der Art");
    return { fehler, n: umriss.size };
}

// Ein absorbierender Proxy: frisst jeden THREE-Aufruf der Top-Level-Ausführung des Kerns — nur die Daten zählen
// (dieselbe Lade-Art wie gate:studio-vertrag).
// Die Daten des Pflanzen-Kerns (phyto-core + foundry-core, wie cores.manifest.json sie lädt): PRESETS und
// PORTAL_RENDER_CONFIG. null, wenn der Kern nicht lädt.
function kernDaten(phytoSrc, kernSrc) {
    const ctx = kernKontext();
    try {
        vm.runInContext(
            phytoSrc +
                "\n;" +
                kernSrc +
                "\n;__daten = { presets: PRESETS, cfg: PORTAL_RENDER_CONFIG };",
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
    return { flower: "emitFlower", grass: "emitGrass", rock: "emitRock" }[kind] || null;
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
    const boden = d?.cfg?.placement ? d.cfg.placement.boden : null;
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
    for (const f of kartenFarbe(o.core || codecAus())) fehler.push(f);
    // (6) DER SAUM DER KARTE — am echten Codec, je Art des Kerns
    const saum = kartenSaum(o.core || codecAus(), d.presets, d.cfg.impostor);
    fehler.push(...saum.fehler);
    return { fehler, arten, weich, saum: saum.n };
}

function main() {
    if (SELBSTTEST) {
        // der Codec gebrochen als Hülle: Stufe 0 ungekodiert (linear), Stufe 1 aus den sRGB-Bytes gemittelt
        const codec = (bruch) => { const c = Object.assign({}, codecAus()); const m0 = c.impostorMips; c.impostorMips = (lin, ...a) => bruch(m0(lin, ...a), lin); return c; };
        const gesetz = (o, c = codecAus()) => (Object.assign(c.KARTEN_GESETZ, o), c);
        // [Name, Muster, Bruch] — zuerst die echte Quelle (grün)
        const brueche = [
            ["die echte Quelle", null, {}],
            ["Farn mit roher Palette", /farn \(emitFern\): new THREE\.Color/, { kern: KERN.replace("c1 = vegFarbe(P.farbe),", "c1 = new THREE.Color(P.farbe),") }],
            ["Schilf mit rohem Hex", /schilf \(emitSchilf\): Hex-Palette/, { kern: KERN.replace("vegFarbe(0x46602a)", "(0x46602a)") }],
            ["Boden-Zeile ohne Preset", /placement\.boden\.geist: kein Preset/, { daten: (d) => (d.cfg.placement.boden.geist = { ring: "nah", dichte: 1, skala: [1, 1] }) }],
            [
                "Lambert-Wege",
                /Lambert-Stoff/,
                { src: (t) => stammLib.ersetze(t, "_kistenPool", "new THREE.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 1, metalness: 0 })", "new THREE.MeshLambertMaterial({ color: 0xffffff })") },
            ],
            ["Karte ohne Kodierung", /Karten-Kodierung weicht/, { core: codec((m, lin) => (m.stufen[0].data.set(lin), m)) }],
            ["Saum stumm", /der Umriss folgt nicht der Art/, { core: gesetz({ saum: 0 }) }],
            ["Ausdünnen in der Ferne", /die Karte dünnt aus/, { core: codec((m) => (m.stufen.slice(3).forEach((s) => s.data.fill(0)), m)) }],
            ["Nadel als Laub", /Laub und Nadel vertauscht/, { core: ((c, f = c.karteSaumRinge) => Object.assign(c, { karteSaumRinge: (...a) => ({ ...f(...a), nadel: false }) }))(codecAus()) }],
            ["Ring −20° ohne Saum", /Ring -20° ohne Saum/, { core: ((c, f = c.karteSaumRinge) => Object.assign(c, { karteSaumRinge: (...a) => ((a = f(...a)), (a.ringe[0].seite = 0), a) }))(codecAus()) }],
            ["Saum im Maß eines Texels (w23)", /franst nicht im Maß des Schirms/, { core: gesetz({ saumWeite: 1, saumZelle: 6 }) }],
            ["Muster am eigenen Ort, Stärke 8,4 (bis w28)", /Saum eiche: Stufe 0 streut \d+ freie Inseln \(Anteil 0\.\d+ über [\d.]+\) — Texel schweben ohne Krone/, { core: gesetz({ saum: 8.4 }, kernAusText(PHYTO.replace("zug = (-sigma", "zug = 0 * (-sigma").replace("hub = G.saum * 4 * gg * (1 - gg)", "hub = G.saum"), "__phytoCore")) }],
            ["Schwelle 0,34 (bis w24)", /deckt am Schirm 1\.\d+ ihrer Stufe 0/, { core: gesetz({ schwelle: 0.34 }) }],
            ["Mip-Stufe roh gemittelt", /linear gemittelt/, { core: codec((m) => { const [a, b] = m.stufen; for (let o = 0; o < b.data.length / 4; o++) { const x = o % b.width, y = (o / b.width) | 0, w = a.width; b.data[o * 4] = Math.round((a.data[(2 * y * w + 2 * x) * 4] + a.data[(2 * y * w + 2 * x + 1) * 4] + a.data[((2 * y + 1) * w + 2 * x) * 4] + a.data[((2 * y + 1) * w + 2 * x + 1) * 4]) / 4); } return m; }) }],
        ];
        return selbsttestEnde(taeterFaelle(brueche.map(([name, muss, z]) => ({ name, z, muss })), (o) => pruefe(o).fehler));
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
