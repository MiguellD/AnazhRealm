// diag-portal-gestalt.cjs — W-A3 DER PORTAL-GESTALT-WECHSEL (Katalysator-Bogen §6, das Baum-Muster).
// Die funktionalen Portal-Blueprints (welt_portal/strom/terrain/garage/portale + seit W-A4c
// welt_schmiede) behalten IDENTITAET + FUNKTION (Name · role portal · portalMeta · Tags ·
// blockerAABBs · E-Trigger), aber ihre RENDER-GESTALT kommt vom porta-Kern (studioGestalt-
// DATEN-Zeile, gelesen im EINEN Entry-Resolver `_foundryPresetForEntry`). W-A4c: die
// LISTE zieht die Linse DYNAMISCH aus dem lebenden Zustand (jeder Portal-Bauplan mit studioGestalt) —
// ein neues Gestalt-Portal waechst von selbst hinein; die ANKER bleiben hart (Drift laut).
// Die Linse prueft mit ehrlichen Zahlen:
//   S0 (Browser): >= 6 Gestalt-Portale, jede Gestalt UNVERWECHSELBAR über den Resolver, welt_schmiede -> maurentor.
//   A (Browser, foundry-ON warm, Null-Renderer): jede Gestalt steht im LIVE-Buch (f.recipes), jeder Träger trägt
//     sein Ziel (portalMeta.world).
//   B: der Resolver loest welt_terrain -> verkalkt; Blueprints OHNE studioGestalt loesen
//     unveraendert (baum_eiche -> eiche · esse -> null · fahrzeug_wagen -> null = Regression 0).
//   C: ein gespawntes welt_-Portal materialisiert END-TO-END als Studio-Asset
//     (entry.instFoundry · instSlots auf der Budget-Zeile gate[0].draws, Flügel-Slots ≤ 8 (W8) · alle Slots im f:-Namensraum ·
//     KEIN sichtbares Part-Doppel-Bild: keine lebende welt_terrain-Gruppe ohne f:).
//   D: FUNKTION intakt — portalMeta byte-unveraendert · affordances.isPortal · blockerAABBs
//     vorhanden (Substanz-Wahrheit lebt). Das Betreten selbst misst gate:portal-konformanz K8 am Verhalten: der Spieler
//     geht durch jedes Tor des Genesis-Rings (W durch die Apertur, am Teile-Tor E) — der Steh-Punkt-Ersatz und die nur
//     geloggte Durchgangs-Zone fielen 25.10. mit ihm.
//   E: Groessen-Sanity — je Portal die Alt-BBox (Part-Bau) vs die porta-Asset-BBox in
//     Welt-Skala (`_foundryWorldScaleMatrix`); Hoehen-Verhaeltnis in [0.5, 3], geloggt.
//   F: Gate-Hook-Welt (__anazhGateNoFoundry, gesichert + wiederhergestellt): der Resolver
//     gibt null -> der Part-Pfad lebt byte-alt (welt_-Blueprints sind classic-intent, der
//     Spawn baut den klassischen Part-Group-Mesh: entry.mesh non-null, instFoundry false;
//     blockerAABBs relativ IDENTISCH zum Studio-Spawn = die Substanz ist regime-frei).
//   node scripts/diag-portal-gestalt.cjs
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.PORTAL_GESTALT_PORT || 4437);
const server = statikServer();

const { errs, check } = pruefer();

hauptLauf(async () => {
    console.log("\n=== TEIL A-F: der lebende Draht (Browser, foundry-ON, Null-Renderer) ===");
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 });
    await server.zeige(page, 30000);

    // ===== EVAL 1: Boot + Buch warm + (A) Daten-Zeilen + (B) Resolver =====
    const outAB = await page.evaluate(async () => {
        const res = { a: {}, b: {} };
        const r = await window.__weltDa();
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.geisttor && f.recipes.kathedrale);
        // DIE DYNAMISCHE WAHRHEIT aus dem lebenden Zustand: jeder handgeschriebene Portal-Bauplan mit studioGestalt (die
        // Auto-Klone des Register-Chokepoints tragen sie auch — ihre Wahrheit prüft gate:rezept-katalog).
        res.liveSet = Object.keys(r.state.blueprints || {})
            .filter((n) => {
                const bp = r.state.blueprints[n] || {};
                return typeof bp.studioGestalt === "string" && !bp._foundryAutoSpecies && bp.role === "portal";
            })
            .sort();
        res.gestalt = Object.fromEntries(res.liveSet.map((n) => [n, r.state.blueprints[n].studioGestalt]));
        // (A) jede Gestalt steht im LIVE-Buch; jeder Träger trägt sein Ziel (portalMeta.world).
        for (const [name, gestalt] of Object.entries(res.gestalt)) {
            const bp = r.state.blueprints[name];
            res.a[name] = {
                inBook: !!(f && f.recipes && Object.prototype.hasOwnProperty.call(f.recipes, gestalt)),
                kind: f && f.recipes && f.recipes[gestalt] ? f.recipes[gestalt].kind : null,
                ziel: !!(bp.portalMeta && bp.portalMeta.world),
            };
        }
        // (B) Resolver: Gestalt-Aufloesung + Regression-0-Proben; das LIVE-Buch führt (ohne Rezept keine Gestalt).
        res.b.terrain = r._foundryPresetForEntry({ type: "welt_terrain" });
        res.b.schmiede = r._foundryPresetForEntry({ type: "welt_schmiede" });
        res.b.aufgeloest = res.liveSet.map((n) => r._foundryPresetForEntry({ type: n }));
        const altV = f.recipes.verkalkt;
        delete f.recipes.verkalkt;
        res.b.ohneRezept = r._foundryPresetForEntry({ type: "welt_terrain" });
        f.recipes.verkalkt = altV;
        res.b.ohneWeltLiteral = window.__fehlt(r._foundryPresetForEntry, /welt_/); // Absenz: der Resolver ist generisch
        res.b.eiche = r._foundryPresetForEntry({ type: "baum_eiche" });
        res.b.esse = r._foundryPresetForEntry({ type: "esse" });
        res.b.wagen = r._foundryPresetForEntry({ type: "fahrzeug_wagen" });
        return res;
    });
    const GESTALT = outAB.gestalt || {};
    console.log(`  ℹ️ Gestalt-Traeger (${Object.keys(GESTALT).length}): ${Object.entries(GESTALT).map(([k, v]) => `${k}->${v}`).join(" · ")}`);

    const g = outAB.b.aufgeloest || [];
    check(
        "S0: >= 6 Gestalt-Portale, jede Gestalt UNVERWECHSELBAR (keine zwei Portale teilen ein Preset), welt_schmiede -> maurentor",
        g.length >= 6 && g.every(Boolean) && new Set(g).size === g.length && outAB.b.schmiede === "maurentor",
        g.join(",")
    );
    for (const [name, gestalt] of Object.entries(GESTALT)) {
        const a = outAB.a[name] || {};
        check(
            `A: ${name} -> "${gestalt}" steht im LIVE-Buch (kind ${a.kind}) und trägt sein Ziel`,
            a.inBook === true && a.kind === "gate" && a.ziel === true,
            `inBook=${a.inBook} ziel=${a.ziel}`
        );
    }
    check(
        'B: der Resolver loest welt_terrain -> "verkalkt" (die Daten-Zeile traegt), ohne das Rezept im LIVE-Buch null; kein welt_-Literal',
        outAB.b.terrain === "verkalkt" && outAB.b.ohneRezept === null && outAB.b.ohneWeltLiteral === true,
        `${outAB.b.terrain} / ohne Rezept ${outAB.b.ohneRezept}`
    );
    check(
        "B: Regression 0 — baum_eiche loest unveraendert auf eiche",
        outAB.b.eiche === "eiche",
        String(outAB.b.eiche)
    );
    check("B: Regression 0 — esse (ohne studioGestalt) loest auf null", outAB.b.esse === null, String(outAB.b.esse));
    check("B: Regression 0 — fahrzeug_wagen (Donor) loest auf null", outAB.b.wagen === null, String(outAB.b.wagen));

    // ===== EVAL 2: (C) End-to-End-Spawn + (D) Funktion =====
    const outCD = await page.evaluate(async () => {
        const res = { c: {}, d: {} };
        const r = window.anazhRealm;
        const bp = r.state.blueprints.welt_terrain;
        res.d.metaBefore = JSON.stringify(bp.portalMeta);
        const pm = r.state.playerMesh.position;
        const sx = pm.x + 6; // im Nah-Band des Tors (porta lod.budget.gate: Stufe 0 bis 9,5 m) — nur sie trägt die Flügel
        const sz = pm.z;
        const sy = r.getTerrainHeightAt(sx, sz) + 0.5;
        const entry = r.spawnArchitecture("welt_terrain", { x: sx, y: sy, z: sz }, { silent: true, seed: 12345 });
        if (!entry) {
            res.c.err = "spawn null";
            return res;
        }
        // KALT-VERHALTEN GEMESSEN (Auftrag Punkt 6): Buch warm + Asset kalt -> der Eintrag
        // bleibt KALT (kein Mesh, kein Grammatik-/Part-Interim — die stehende Baum-Kalt-Regel);
        // die FUNKTION (E-Trigger liest affordances + position) lebt schon im Kalt-Fenster.
        res.c.coldAfterSpawn = !entry.instanced && !entry.mesh;
        // Materialisieren: der erste Rebuild stiess die Studio-Anfrage an (kalt); pollen,
        // bis das Asset andockt (der Rewarm-Weg, hier deterministisch von Hand gefahren).
        res.c.materializeTakte = await window.__gebautNach(entry, { fertig: () => entry.instanced === true });
        res.c.instanced = entry.instanced === true;
        res.c.instFoundry = entry.instFoundry === true;
        // die gezeigten Slots: der Wurf-Zwilling der NUR-WURF-Stufe 3 (1110-9, Gruppe `…#S` auf der Schatten-Ebene) zeichnet
        // nur in die Kaskaden und zählt nicht gegen die Draws der Stufe 0 (das Muster diag-sippen-wirt: ohne shadowTwin)
        res.c.zwillingSlots = (entry.instSlots || []).filter((s) => /#S$/.test(String(s.key))).length;
        res.c.slotCount = Array.isArray(entry.instSlots) ? entry.instSlots.length - res.c.zwillingSlots : 0;
        // die Züge: je Gruppe einer — der Hinterflügel zeichnet als Instanz in der Gruppe des Vorderflügels (1310-4)
        res.c.zuege = new Set((entry.instSlots || []).filter((s) => !/#S$/.test(String(s.key))).map((s) => s.key)).size;
        // W8 — die Budget-Zeile des Tors (LIVE-Buch nach dem Zweit-Kern-Merge) und die Flügel-Slots, die
        // `_tickTorFluegel` dreht (Slots, deren Instanz-Gruppe ein Scharnier trägt).
        const _rc = r.constructor._studioRenderConfig;
        const _gz = _rc && _rc.lod && _rc.lod.budget && _rc.lod.budget.gate ? _rc.lod.budget.gate[0] : null;
        res.c.drawBudget = _gz ? _gz.draws : null;
        res.c.fluegelSlots = (entry.instSlots || []).filter((s) => {
            const g = r.state.archInstanceGroups && r.state.archInstanceGroups.get(s.key);
            return !!(g && g.tuer);
        }).length;
        res.c.allSlotsFoundry =
            Array.isArray(entry.instSlots) && entry.instSlots.every((s) => /(^|#)f:verkalkt\|/.test(String(s.key)));
        res.c.meshNull = entry.mesh === null || entry.mesh === undefined;
        // KEIN Doppel-Bild: keine LEBENDE welt_terrain-Gruppe ausserhalb des f:-Namensraums.
        res.c.partGroupsAlive = 0;
        if (r.state.archInstanceGroups) {
            for (const [key, g] of r.state.archInstanceGroups) {
                if (String(key).indexOf("welt_terrain#") === 0 && String(key).indexOf("#f:") < 0) {
                    if ((g.liveCount || 0) > 0 || (g.mesh && g.mesh.count > 0)) res.c.partGroupsAlive++;
                }
            }
        }
        // (D) FUNKTION intakt.
        res.d.metaAfter = JSON.stringify(r.state.blueprints.welt_terrain.portalMeta);
        res.d.role = r.state.blueprints.welt_terrain.role;
        res.d.affPortal = !!(entry.affordances && entry.affordances.isPortal === true);
        res.d.blockerCount = Array.isArray(entry.blockerAABBs) ? entry.blockerAABBs.length : 0;
        // Blocker relativ zur Entry-Position (fuer die Regime-Paritaet in EVAL 4).
        res.d.blockersRel = (entry.blockerAABBs || []).map((b) => [
            +(b.minX - entry.position.x).toFixed(6),
            +(b.maxX - entry.position.x).toFixed(6),
            +(b.minZ - entry.position.z).toFixed(6),
            +(b.maxZ - entry.position.z).toFixed(6),
            +(b.botY - entry.position.y).toFixed(6),
            +(b.topY - entry.position.y).toFixed(6),
        ]);
        window.__wa3Entry = entry;
        return res;
    });

    check(
        "C: das gespawnte welt_terrain materialisiert als Studio-Asset (instanced + instFoundry)",
        outCD.c.instanced === true && outCD.c.instFoundry === true,
        outCD.c.err || `instanced=${outCD.c.instanced} foundry=${outCD.c.instFoundry}`
    );
    // W8 — DAS BUDGET IST IM BILD: das Tor kommt auf seiner Budget-Zeile an (gate[0].draws aus dem LIVE-Buch, der
    // Merge der Zweit-Kerne) — vorher 124–315 Leaves je Tor, jedes Flügel-Teil eines; jetzt je Flügel × Stoff ein
    // Leaf, der Flügel-Takt (`_tickTorFluegel`) setzt höchstens 8 Matrizen statt bis zu 244.
    check(
        `C: Tor-Geometrie angekommen auf der Budget-Zeile (${outCD.c.zuege} Züge aus ${outCD.c.slotCount} Slots, 1..${outCD.c.drawBudget} = gate[0].draws)`,
        outCD.c.zuege >= 1 && Number.isInteger(outCD.c.drawBudget) && outCD.c.zuege <= outCD.c.drawBudget,
        `zuege=${outCD.c.zuege} slots=${outCD.c.slotCount} (+ Wurf-Zwilling ${outCD.c.zwillingSlots}) budget=${outCD.c.drawBudget}`
    );
    check(
        `C: der Flügel-Takt dreht je Flügel × Stoff (${outCD.c.fluegelSlots} Flügel-Slots, 1..8)`,
        outCD.c.fluegelSlots >= 1 && outCD.c.fluegelSlots <= 8,
        String(outCD.c.fluegelSlots)
    );
    check("C: alle Slots leben im f:verkalkt-Namensraum", outCD.c.allSlotsFoundry === true);
    console.log(
        `  ℹ️ Kalt-Verhalten: nach dem Spawn (Buch warm, Asset kalt) ${outCD.c.coldAfterSpawn ? "KALT ohne Interim (Baum-Kalt-Regel; E-Trigger lebt schon)" : "sofort materialisiert/Interim"} · Materialisierung nach ${outCD.c.materializeTakte} Takten (headless swiftshader-Worker)`
    );
    check(
        "C: KEIN Doppel-Bild (kein entry.mesh, keine lebende Part-Gruppe)",
        outCD.c.meshNull === true && outCD.c.partGroupsAlive === 0,
        `partGroupsAlive=${outCD.c.partGroupsAlive}`
    );
    check(
        "D: portalMeta byte-unveraendert am Blueprint (role portal)",
        outCD.d.metaBefore === outCD.d.metaAfter && outCD.d.role === "portal"
    );
    check("D: der Entry traegt affordances.isPortal", outCD.d.affPortal === true);
    check(`D: blockerAABBs vorhanden (${outCD.d.blockerCount} — die Substanz-Wahrheit lebt)`, outCD.d.blockerCount > 0);

    // ===== EVAL 3: (E) Groessen-Sanity — Alt-BBox (Parts) vs porta-Asset in Welt-Skala =====
    const outE = await page.evaluate(async (GESTALT) => {
        const r = window.anazhRealm;
        const out = {};
        for (const [name, gestalt] of Object.entries(GESTALT)) {
            const bp = r.state.blueprints[name];
            // Alt-BBox aus den Parts (position +- size/2 — die Part-Bau-Huelle, scale 1).
            let mnx = 1e9,
                mxx = -1e9,
                mny = 1e9,
                mxy = -1e9,
                mnz = 1e9,
                mxz = -1e9;
            for (const p of bp.parts || []) {
                if (!p || !p.position || !p.size) continue;
                mnx = Math.min(mnx, p.position.x - p.size.x / 2);
                mxx = Math.max(mxx, p.position.x + p.size.x / 2);
                mny = Math.min(mny, p.position.y - p.size.y / 2);
                mxy = Math.max(mxy, p.position.y + p.size.y / 2);
                mnz = Math.min(mnz, p.position.z - p.size.z / 2);
                mxz = Math.max(mxz, p.position.z + p.size.z / 2);
            }
            const alt = { w: +(mxx - mnx).toFixed(2), h: +(mxy - mny).toFixed(2), d: +(mxz - mnz).toFixed(2) };
            const meshes = await Promise.race([
                r._foundryRequest(gestalt, 3, 0),
                new Promise((res3) => setTimeout(() => res3(null), 45000)),
            ]);
            if (!Array.isArray(meshes) || !meshes.length) {
                out[name] = { alt, err: "asset null" };
                continue;
            }
            const g = r._foundryBuildGroup(meshes, { lod: 0, preset: gestalt });
            g.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(g);
            const k = r._foundryWorldScaleMatrix(gestalt).elements[0] || 1;
            const neu = {
                w: +((box.max.x - box.min.x) * k).toFixed(2),
                h: +((box.max.y - box.min.y) * k).toFixed(2),
                d: +((box.max.z - box.min.z) * k).toFixed(2),
                meshes: meshes.length,
                scaleK: k,
            };
            g.traverse((o) => {
                if (o.isMesh && o.geometry) o.geometry.dispose();
            });
            out[name] = { alt, neu, ratioH: +(neu.h / Math.max(0.01, alt.h)).toFixed(2) };
        }
        return out;
    }, GESTALT);

    for (const [name, gestalt] of Object.entries(GESTALT)) {
        const e = outE[name] || {};
        if (!e.neu) {
            check(`E: ${name} -> ${gestalt} Asset messbar`, false, e.err || "kein Ergebnis");
            continue;
        }
        console.log(
            `  ℹ️ ${name} -> ${gestalt}: ALT ${e.alt.w}×${e.alt.h}×${e.alt.d} m · NEU ${e.neu.w}×${e.neu.h}×${e.neu.d} m (Welt-Skala ×${e.neu.scaleK}, ${e.neu.meshes} Meshes) · Hoehen-Ratio ${e.ratioH}`
        );
        check(
            `E: ${name} Hoehen-Ratio ${e.ratioH} in [0.5, 3]`,
            Number.isFinite(e.ratioH) && e.ratioH >= 0.5 && e.ratioH <= 3
        );
    }

    // ===== EVAL 4: (F) Gate-Hook-Welt — Resolver null, Part-Pfad lebt, Substanz regime-frei =====
    const outF = await page.evaluate(async (blockersRelStudio) => {
        const res = {};
        const r = window.anazhRealm;
        const prev = window.__anazhGateNoFoundry;
        window.__anazhGateNoFoundry = true;
        try {
            res.resolver = r._foundryPresetForEntry({ type: "welt_terrain" });
            const pm = r.state.playerMesh.position;
            const sx = pm.x + 24;
            const sz = pm.z + 6;
            const sy = r.getTerrainHeightAt(sx, sz) + 0.5;
            const entry2 = r.spawnArchitecture("welt_terrain", { x: sx, y: sy, z: sz }, { silent: true, seed: 12345 });
            if (!entry2) {
                res.err = "spawn null";
                return res;
            }
            // welt_-Blueprints tragen KEIN `instanced: true` (classic-intent) -> der Part-
            // Pfad baut den klassischen Group-Mesh (entry.mesh), wie vor W-A3 (byte-alt).
            res.mesh = !!entry2.mesh;
            res.meshChildren = entry2.mesh && entry2.mesh.children ? entry2.mesh.children.length : 0;
            res.instFoundry = entry2.instFoundry === true;
            const rel = (entry2.blockerAABBs || []).map((b) => [
                +(b.minX - entry2.position.x).toFixed(6),
                +(b.maxX - entry2.position.x).toFixed(6),
                +(b.minZ - entry2.position.z).toFixed(6),
                +(b.maxZ - entry2.position.z).toFixed(6),
                +(b.botY - entry2.position.y).toFixed(6),
                +(b.topY - entry2.position.y).toFixed(6),
            ]);
            res.blockerParity = JSON.stringify(rel) === JSON.stringify(blockersRelStudio);
            r.removeArchitecture(entry2);
        } finally {
            // den Hook SICHERN + WIEDERHERSTELLEN, NIE nackt loeschen.
            if (prev) window.__anazhGateNoFoundry = prev;
            else delete window.__anazhGateNoFoundry;
        }
        return res;
    }, outCD.d.blockersRel);

    check(
        "F: unter dem Gate-Hook faellt der Resolver auf null (gate-treu)",
        outF.resolver === null,
        String(outF.resolver)
    );
    check(
        "F: der Part-Pfad lebt byte-alt (klassischer Part-Group-Mesh, kein Foundry-Merker)",
        outF.mesh === true && outF.instFoundry !== true && outF.meshChildren > 0,
        outF.err || `mesh=${outF.mesh} foundry=${outF.instFoundry} kinder=${outF.meshChildren}`
    );
    check(
        "F: die Substanz ist regime-frei (blockerAABBs relativ IDENTISCH Studio- vs Part-Spawn)",
        outF.blockerParity === true
    );

    await browser.close();
    server.close();


    wandEnde(errs, `W-A3 STEHT: die ${Object.keys(GESTALT).length} welt_-Portale (dynamisch aus dem lebenden Zustand) tragen ihre porta-Gestalt als DATEN-Zeile, der EINE Entry-Resolver serviert sie generisch (fail-soft, foundry-gegated), das Studio-Asset materialisiert end-to-end ohne Doppel-Bild, die Substanz-Wahrheit (portalMeta · Tags · blockerAABBs · E-Trigger) lebt byte-alt in BEIDEN Regimen.`);
});
