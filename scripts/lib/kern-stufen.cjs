// kern-stufen.cjs — DIE STUFEN-WAHRHEIT DER KERNE als EINE Erwartung der Nervensystem-Linsen. Der
// Merge ist treu, wenn jede Art des Live-Buchs die Liste trägt, die ihr Kern deklariert: die Erwartung liest die Kerne in
// der Seite (dieselben Dateien, die der Foundry-Worker lädt; die Namensräume aus cores.manifest.json), nie eine Abschrift.
"use strict";
const { ausDatei, path } = require("./welt-boot.cjs");

const ROOT = path.resolve(__dirname, "..", "..");

// Die Namensräume der Kerne in der Seite — der Baum-Kern (phyto, ohne eigenen Raum) trägt seine Karte an `__terrainCore`
// (foundry-core `__terrainCore.PORTAL_RENDER_CONFIG`).
function kernRaeume(root = ROOT) {
    const m = ausDatei(path.join(root, "cores.manifest.json"), true);
    return m.map((z) => z.ns || "__terrainCore");
}

// In der Seite: `await page.evaluate(seitenStufen, kernRaeume())` — je Art die deklarierte Liste ihres Kerns (JSON).
function seitenStufen(raeume) {
    const aus = {};
    for (const ns of raeume) {
        const k = globalThis[ns];
        const ks = k && k.PORTAL_RENDER_CONFIG && k.PORTAL_RENDER_CONFIG.lod && k.PORTAL_RENDER_CONFIG.lod.kindStages;
        if (ks) for (const art of Object.keys(ks)) aus[art] = JSON.stringify(ks[art]);
    }
    return aus;
}

// Der Vergleich: jede deklarierte Art trägt im Live-Buch (`live` = `_studioRenderConfig.lod.kindStages`) ihre Liste —
// jede Abweichung beim Namen der Art.
function stufenAbweichung(live, kern) {
    if (!kern || !Object.keys(kern).length) return ["keine Kern-Deklaration gelesen"];
    const ab = [];
    for (const art of Object.keys(kern)) {
        const ist = live && live[art] !== undefined ? JSON.stringify(live[art]) : "fehlt";
        if (ist !== kern[art]) ab.push(`${art}: Buch ${ist} ≠ Kern ${kern[art]}`);
    }
    return ab;
}

// Die Stufe, die der Wirt für eine Distanz-Wahl `wahl` serviert: die größte deklarierte ≤ wahl (sonst die erste).
function geklemmteStufe(listeJson, wahl) {
    const S = JSON.parse(listeJson);
    let st = S[0];
    for (const s of S) if (s <= wahl) st = s;
    return st;
}

// DER ε-DRAHT EINER DOMÄNE (Nervensystem §ε — porta, schmiede, fachwerk, vehicle: dieselbe Probe, nie vier Abschriften).
// In der Seite: `await page.evaluate(epsilonSeite, w)` mit w = { bp (der Auto-Klon), donor (die Substanz), preset, entry (der
// Entry-Typ, sonst bp), praefix, stufen ([0]), wahl (die Distanz-Wahl der Klemme, null = keine) } — B das Buch nach dem
// ready-Handshake, D der Auto-Blueprint am EINEN Chokepoint, P die Place-Auflösung, E das Asset je Stufe, F der Schlüssel der Wahl.
async function epsilonSeite(w) {
    await window.__weltDa();
    const A = r.constructor;
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => f && f.ready && f.recipes && f.recipes[w.preset] && A._studioRenderConfig && A._studioRenderConfig.lod && A._studioRenderConfig.lod.kindStages);
    const fehler = (x) => x?.message || String(x);
    const rez = f.recipes[w.preset];
    const out = { b: { kind: rez.kind, s: rez.s, anzahl: Object.values(f.recipes).filter((x) => x && x.kind === rez.kind).length, ks: JSON.parse(JSON.stringify(A._studioRenderConfig.lod.kindStages)) }, d: {}, p: {}, e: { meshCount: {} }, f: {} };
    const { d, p, e } = out;
    try {
        const B = r.state.blueprints || {};
        const bp = B[w.bp];
        const sub = A.KIND_SUBSTANCE?.[w.donor];
        const gleich = (k) => !!bp && !!sub && JSON.stringify(bp[k] || null) === JSON.stringify(sub[k] || null);
        Object.assign(d, {
            blueprint: !!bp,
            autoSpecies: bp ? bp._foundryAutoSpecies : null,
            grownSpecies: bp ? bp._grownSpecies || null : "kein-bp",
            label: bp ? bp.label : null,
            parts: bp && Array.isArray(bp.parts) ? bp.parts.length : 0,
            builtIn: bp ? !!bp.builtIn : null,
            donorAbsent: !B[w.donor],
            substanzParts: sub && Array.isArray(sub.parts) ? sub.parts.length : 0,
            clonePartsMatch: gleich("parts"),
            cloneConnMatch: gleich("connections"),
            presetResolves: r._foundryPresetFor(w.bp),
            entryResolves: r._foundryPresetForEntry({ type: w.entry || w.bp }),
        });
    } catch (x) {
        d.err = fehler(x);
    }
    try {
        const pol = r._placePolicyFor(rez);
        Object.assign(p, { mode: pol.mode, siteTag: pol.siteTag, dispatch: r._placeDispatch(pol, { id: w.preset }) });
        r._forestExtraCache = null;
        p.inExtras = r._forestExtraSpecies().some((x) => String(x.species).indexOf(w.praefix) === 0);
        r._forestExtraCache = null;
    } catch (x) {
        p.err = fehler(x);
    }
    try {
        for (const L of w.stufen || [0]) {
            const meshes = await Promise.race([r._foundryRequest(w.preset, 7, L), new Promise((ja) => setTimeout(() => ja(null), 45000))]);
            const n = (e.meshCount[L] = Array.isArray(meshes) ? meshes.length : -1);
            e.fern = e.fern || (n > 0 && meshes.some((m) => m && m.kind === "__fern" && m.huelle && Array.isArray(m.huelle.teile)));
            if (L !== (w.stufen || [0])[0] || !(n > 0)) continue;
            e.hasMatColor = meshes.some((m) => m?.mat && Array.isArray(m.mat.color) && m.mat.color.length === 3);
            const g = r._foundryBuildGroup(meshes);
            e.groupChildren = g?.children ? g.children.length : 0;
            e.allHaveColor = !!g && g.children.every((ch) => !!ch.geometry?.attributes?.color);
            if (g) g.traverse((o) => o.isMesh && o.geometry && o.geometry.dispose()); // kein Leck in der Probe
        }
    } catch (x) {
        e.err = fehler(x);
    }
    if (w.wahl != null)
        try {
            if (!f.requested) f.requested = new Set();
            const vor = new Set(f.requested);
            r._foundryFlattenFor({ seed: 7 }, w.preset, w.wahl);
            out.f.key = [...f.requested].find((k) => !vor.has(k) && k.startsWith(w.preset + "|")) || null;
        } catch (x) {
            out.f.err = fehler(x);
        }
    return out;
}

// Der Spruch des ε-Drahts — dieselben Wände je Domäne: w wie oben, dazu name (das Werk im Satz), art, anzahl (Rezepte der Art im
// Buch), teile (Parts der Substanz), label (oder null), place { mode, siteTag, dispatch } (oder null); `kern` = seitenStufen.
function epsilonUrteil(check, { b, d, p, e }, w, kern) {
    const stufen = w.stufen || [0];
    check(`B: das LIVE-Buch traegt ${w.preset} als kind:${w.art} (Worker-Draht lebt)`, b.kind === w.art, String(b.kind));
    check(`B: alle ${w.anzahl} Rezepte der Art ${w.art} im Buch`, b.anzahl === w.anzahl, String(b.anzahl));
    const ab = stufenAbweichung(b.ks, kern);
    check("B: der Ingest-Merge traegt die Stufen-Liste JEDES Kerns (kein Kern ueberschreibt einen anderen)", ab.length === 0, ab.join(" · ") || `${Object.keys(kern).length} Arten`);
    check(`D: Auto-Blueprint ${w.bp} registriert (Donor-Klon)`, d.blueprint === true && d.parts >= w.teile, d.err || `parts=${d.parts}`);
    check(`D: die Herkunfts-Marke sitzt (_foundryAutoSpecies == ${w.preset})`, d.autoSpecies === w.preset);
    check(`D: KEIN _grownSpecies (${w.name} ist keine gewachsene Art)`, d.grownSpecies === null, String(d.grownSpecies));
    if (w.label) check(`D: das Label reist aus dem Rezept (lab == ${w.label})`, d.label === w.label, String(d.label));
    check(`D: der Alt-Donor ${w.donor} ist ABWESEND (state.blueprints) — die Substanz lebt in KIND_SUBSTANCE (${w.teile} Parts)`, d.donorAbsent === true && d.substanzParts === w.teile, `substanzParts=${d.substanzParts}`);
    check(`D: der Auto-Klon traegt die Substanz byte-gleich (${w.bp} parts+connections == KIND_SUBSTANCE.${w.donor})`, d.clonePartsMatch && d.cloneConnMatch);
    check(`D: die generische ${w.praefix}-Regel loest auf (${w.bp} -> ${w.preset})`, d.presetResolves === w.preset, String(d.presetResolves));
    const entry = (w.entry || w.bp).slice(w.praefix.length);
    check(`D: der Entry-Pfad loest auf (_foundryPresetForEntry, ${w.entry || w.bp} -> ${entry})`, d.entryResolves === entry, String(d.entryResolves));
    if (w.place) {
        const { mode, siteTag, dispatch } = w.place;
        check(`P: die Place-Aufloesung liest die Rezept-DATEN (mode "${mode}", siteTag ${siteTag})`, p.mode === mode && p.siteTag === siteTag, p.err || `${p.mode}/${p.siteTag}`);
        check(`P: Dispatch ${dispatch} (N5.6 — die Welt streut ${w.name} nie)`, p.dispatch === dispatch, String(p.dispatch));
        check(`P: keine ${w.praefix}-Nische in der Wald-Liste`, p.inExtras === false);
    }
    check(`E: der Worker liefert ${w.name} auf den Stufen ${stufen} (Meshes > 0 je Stufe)`, stufen.every((L) => e.meshCount[L] > 0), e.err || JSON.stringify(e.meshCount));
    check("E: die Material-Farbe reist mit (mat.color)", e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", e.groupChildren > 0, String(e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", e.allHaveColor === true);
}

// Selbsttest: ein Buch mit einer abgeschriebenen Liste muss beim Namen fallen, ein treues Buch nicht.
function selbsttest() {
    const kern = { gate: "[0,1,2,3]", tree: "[0,1,2]" };
    const falsch = stufenAbweichung({ gate: [0, 1, 3], tree: [0, 1, 2] }, kern);
    const treu = stufenAbweichung({ gate: [0, 1, 2, 3], tree: [0, 1, 2] }, kern);
    return (
        falsch.length === 1 &&
        /^gate: Buch \[0,1,3\]/.test(falsch[0]) &&
        treu.length === 0 &&
        stufenAbweichung({}, {}).length === 1 &&
        geklemmteStufe("[0,1,2,3]", 2) === 2 &&
        geklemmteStufe("[0,1,3]", 2) === 1
    );
}

// DER LEBENDE DRAHT einer ε-Linse (fachwerk · porta · schmiede · vehicle): die Null-Seite am Server (`port`), die Seite der
// Domäne `W` (`epsilonSeite`), die eigene Probe der Linse (`probe`, in derselben Seite), die Stufen der Kerne dort (dieselben
// Dateien wie der Worker, nie eine Abschrift) und ihr Urteil → [eps, out, kern]. Bis zur Decke w3s-sukzession trug jede
// ε-Linse diesen Gang selbst.
async function epsilonDraht(server, port, W, check, probe) {
    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await server.lausche(port);
    const { browser, page } = await require("./welt-boot.cjs").nullSeite({ frist: 180000 });
    await server.zeige(page, 30000);
    const eps = await page.evaluate(epsilonSeite, W);
    const out = probe && (await page.evaluate(probe));
    const kern = await page.evaluate(seitenStufen, kernRaeume());
    await browser.close();
    server.close();
    epsilonUrteil(check, eps, W, kern);
    return [eps, out, kern];
}

module.exports = { epsilonDraht, kernRaeume, seitenStufen, stufenAbweichung, geklemmteStufe, epsilonSeite, epsilonUrteil, selbsttest };
