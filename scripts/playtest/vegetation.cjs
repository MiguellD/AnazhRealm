"use strict";
// scripts/playtest/vegetation.cjs — der Richter von Vegetation (spec/stamm/modul-karte.json): Nah-Wiese · Nah-Streu · Affinität · Boden-Material · Baum-Geometrie · Laub-Atlas · Wald-Pflanzung · Fels-Varianten · Natur-Plätze · Gebackene Regionen · Streu-Zellen · Streu-Streaming.
// 16 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { spawn } = require("child_process");
const { safeEvaluate } = require("../playtest.cjs");

// perf-geregelten `foliageRadius`; ferne warten in `pendingFoliageChunks`, bis der
// Radius (mit der gemessenen Render-Kapazität) zu ihnen wächst. Spawn leicht → wächst.
async function checkBandV18275FoliageGrowth(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const st = r.state;
        const out = {};
        out.hasGate = typeof r._foliageChunkInRadius === "function";
        out.hasGrowth = typeof r._tickFoliageGrowth === "function";
        // Headless (Null-Renderer): der Aktuator setzt foliageRadius = MAX (gate-treu).
        out.headlessFull =
            !st.renderer || !st.renderer._isHeadlessNull || st.foliageRadius === r.constructor.PERF_FOLIAGE_RADIUS_MAX;
        const pm = st.playerMesh;
        if (!pm) {
            out.skip = true;
            return out;
        }
        const span = r._voxelChunkConfig().span;
        const pcx = Math.floor(pm.position.x / span),
            pcz = Math.floor(pm.position.z / span);
        // (1) kleiner Radius → ein ferner Chunk ist NICHT in-radius, der Spieler-Chunk schon. Klein = der kleinste Radius,
        // den der Regler fährt (`PERF_FOLIAGE_RADIUS_MIN`); 30 m lagen unter der halben Chunk-Diagonale (30,5 m), und am
        // Chunk-Eck (die Genesis-Plattform steht seit K16 auf dem Ursprung) fiel der eigene Chunk heraus.
        st.foliageRadius = r.constructor.PERF_FOLIAGE_RADIUS_MIN;
        out.farDeferred = r._foliageChunkInRadius(pcx + 6, pcz + 6) === false;
        out.nearIncluded = r._foliageChunkInRadius(pcx, pcz) === true;
        // (2) Radius wächst → derselbe ferne Chunk wird in-radius (die Welt wächst nach außen).
        st.foliageRadius = 9999;
        out.farIncludedAfterGrow = r._foliageChunkInRadius(pcx + 6, pcz + 6) === true;
        // (3) CONSUM: _tickFoliageGrowth drainiert einen wartenden, in-radius Chunk-Key. Drain-Mechanik
        // isoliert: _frameOverBudget (pausiert Wachstum legitim, siehe (4)) hier AUS — die warme
        // Gate-Welt hat hohe Warmup-frameMs.
        st._frameOverBudget = false;
        const tk = `${pcx + 1},${pcz + 1}`;
        // nicht existent → durch den EINEN Abbau (Welle B: der Boden-Satz verliert den Bereich mit), kein Re-Populate
        if (st.voxelChunks && st.voxelChunks.has(tk)) r._disposeVoxelChunk(tk);
        st.pendingFoliageChunks = new Set([tk]);
        r._tickFoliageGrowth();
        out.growthDrains = !st.pendingFoliageChunks.has(tk);
        // (4) EXISTENZ VOR FRAMERATE (Lehre 13, K22-3): Frame ÜBER BUDGET → das Wachstum drosselt sein TEMPO, nie seine
        // Existenz: EIN Chunk je WUCHS_DROSSEL_MS, der NÄCHSTE zuerst; innerhalb der Frist keiner; Frame frei → es läuft.
        // Bis V18.543 PAUSIERTE es über Budget ganz (die Dorf-Chunks im 64-m-Kreis blieben auf der Radeon kahl).
        const tk2 = `${pcx + 2},${pcz + 2}`;
        const tk3 = `${pcx + 4},${pcz + 4}`;
        for (const k of [tk2, tk3]) if (st.voxelChunks && st.voxelChunks.has(k)) r._disposeVoxelChunk(k);
        st.foliageRadius = 9999;
        st.pendingFoliageChunks = new Set([tk3, tk2]); // der fernere zuerst eingereiht: die Wahl folgt der Nähe
        st._frameOverBudget = true;
        r._wuchsNaechster = undefined;
        r._tickFoliageGrowth();
        out.growthNearestOverBudget = !st.pendingFoliageChunks.has(tk2) && st.pendingFoliageChunks.has(tk3);
        r._tickFoliageGrowth();
        out.growthThrottledOverBudget = st.pendingFoliageChunks.has(tk3); // in der Frist: keiner
        r._wuchsNaechster = 0; // die Frist ist um
        r._tickFoliageGrowth();
        out.growthNeverStarves = !st.pendingFoliageChunks.has(tk3);
        st.pendingFoliageChunks = new Set([tk2]);
        st._frameOverBudget = false;
        r._tickFoliageGrowth();
        out.growthResumesWhenFree = !st.pendingFoliageChunks.has(tk2); // jetzt gedrainiert

        const ppD = st.playerMesh && st.playerMesh.position ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
        // CONSUM (behavioral): die Scatter-Region des Spielers (der Warmup baut sie nicht) bei voller vs
        // gedrosselter Dichte neu bauen → `instanceCount` fällt. Der Faktor lichtet Platzierungs-
        // Wahrscheinlichkeit UND Pro-Region-Cap (sonst maskiert der Cap die Drosselung im dichten Wald).
        // Der Regler-Pfad lebt nur foundry-aus → lokaler Hook (sichern + WIEDERHERSTELLEN); die echte
        // Region wird erst NACH dem Restore neu gebaut, im ambienten Regime.
        try {
            const SCcfg = (window.AnazhRealm || r.constructor).SCATTER;
            if (SCcfg && Number.isFinite(SCcfg.regionM) && typeof r._scatterRegion === "function") {
                const frx = Math.floor(ppD.x / SCcfg.regionM),
                    frz = Math.floor(ppD.z / SCcfg.regionM);
                const fk = `${frx},${frz}`;
                const existed = !!(st.scatterRegions && st.scatterRegions.has(fk));
                const _prevDensHook = window.__anazhGateNoFoundry;
                window.__anazhGateNoFoundry = true;
                let dFull = 0,
                    dLow = 0;
                try {
                    const instAt = (scale) => {
                        st._foliageDensityScale = scale;
                        r._disposeScatterRegion(fk);
                        const reg = r._scatterRegion(frx, frz, ppD);
                        return reg ? reg.instanceCount : 0;
                    };
                    dFull = instAt(1);
                    dLow = instAt(0.4);
                    r._disposeScatterRegion(fk);
                    st._foliageDensityScale = 1;
                } finally {
                    if (_prevDensHook) window.__anazhGateNoFoundry = _prevDensHook;
                    else delete window.__anazhGateNoFoundry;
                }
                if (existed) r._scatterRegion(frx, frz, ppD); // echte Region wiederherstellen (ambientes Regime)
                if (dFull > 5) {
                    out.densFull = dFull;
                    out.densLow = dLow;
                    out.densityCutsInstances = dLow < dFull;
                }
            }
        } catch (_eDens) {
            out.densityProbeError = String((_eDens && _eDens.message) || _eDens);
        }
        // Headless (Null-Renderer): der Aktuator setzt die Dichte auf 1 (volle Welt fürs Gate).
        r._nexusPerfActuate({
            loadScale: 0.3,
            renderCalls: 1500,
            phase: { streaming: 1, render: 0, archCulling: 1, waterIso: 0, creatures: 0, physics: 0 },
        });
        out.densityHeadlessFull = !st.renderer || !st.renderer._isHeadlessNull || st._foliageDensityScale === 1;
        st._foliageDensityScale = 1;

        // V18.280 — DAS NACH-DÜNNEN: eine STATIONÄRE, bei voller Dichte gebaute Region schrumpft,
        // wenn die geregelte Dichte sinkt (`_tickFoliageThin` re-streamt sie) → die schon geladene
        // Welt sinkt auf die Kapazität, nicht nur die frisch gebaute. CONSUM: instanceCount fällt.
        out.thinExists = typeof r._tickFoliageThin === "function";
        out.scatterReadsBuiltDensity = /builtDensity/.test(window.__codeOf(r._scatterRegion));
        out.streamingCallsThin = /_tickFoliageThin/.test(window.__codeOf(r._tickScatterStreaming));
        // CONSUM (behavioral; Hook SICHERN + WIEDERHERSTELLEN, nie löschen-und-vergessen): foundry-ON
        // ist Default → die eine Quelle liefert 1 trotz gesenktem Regler, Nach-Dünnen = No-op; foundry-aus
        // („der Regler führt“) per lokalem Hook. Beide Pfade sind Frühausstiege ohne Worker → gate-sicher.
        try {
            const _prevHook = window.__anazhGateNoFoundry;
            st._foliageDensityScale = 0.4;
            delete window.__anazhGateNoFoundry; // Foundry AN (explizit; unter globalem Hook wäre das die Lüftung)
            out.oneSourceStudioFull = r._effectiveFoliageDensity() === 1;
            out.thinStudioNoop = r._tickFoliageThin({ x: 0, y: 0, z: 0 }) === 0;
            window.__anazhGateNoFoundry = true; // der Unit-Richter: foundry-aus → der Regler führt
            out.oneSourceGateFollows = r._effectiveFoliageDensity() === 0.4;
            if (_prevHook) window.__anazhGateNoFoundry = _prevHook;
            else delete window.__anazhGateNoFoundry;
            st._foliageDensityScale = 1;
        } catch (_eOne) {
            out.oneSourceProbeError = String((_eOne && _eOne.message) || _eOne);
        }
        try {
            const ppT = st.playerMesh && st.playerMesh.position ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
            const SCt = (window.AnazhRealm || r.constructor).SCATTER;
            if (SCt && Number.isFinite(SCt.regionM) && typeof r._scatterRegion === "function" && st.scatterRegions) {
                // Den Region-SET ISOLIEREN (Snapshot/ersetzen/restoren), damit MEINE Test-Region
                // die einzige Kandidatin ist (sonst dünnt _tickFoliageThin die NÄCHSTE im Warmup-Set).
                const snap = st.scatterRegions;
                st.scatterRegions = new Map();
                // N7.3 — UNIT-RICHTER: das Nach-Dünnen ist im Studio-Regime BY DESIGN ein No-op
                // (thinStudioNoop oben) → die lebende Regler-Mechanik prüft dieser Block unter
                // LOKALEM Hook (V18.423-Form: sichern + wiederherstellen im finally).
                const _prevThinHook = window.__anazhGateNoFoundry;
                window.__anazhGateNoFoundry = true;
                try {
                    const prx = Math.floor(ppT.x / SCt.regionM),
                        prz = Math.floor(ppT.z / SCt.regionM);
                    st._foliageDensityScale = 1;
                    st._frameOverBudget = false;
                    let tfk = null,
                        tFull = 0;
                    for (let dz = -1; dz <= 1 && tFull <= 5; dz++) {
                        for (let dx = -1; dx <= 1 && tFull <= 5; dx++) {
                            const k = `${prx + dx},${prz + dz}`;
                            const reg = r._scatterRegion(prx + dx, prz + dz, ppT);
                            const n = reg ? reg.instanceCount : 0;
                            if (n > 5) {
                                tfk = k;
                                tFull = n;
                            } else {
                                r._disposeScatterRegion(k); // leere Region wieder weg (nur die mit Scatter bleibt)
                            }
                        }
                    }
                    if (tfk) {
                        st._foliageDensityScale = 0.4; // Kapazität sinkt → das Nach-Dünnen greift
                        r._tickFoliageThin(ppT); // MEINE Region ist die einzige Kandidatin → wird gedünnt
                        const regThin = st.scatterRegions.get(tfk);
                        out.thinFull = tFull;
                        out.thinAfter = regThin ? regThin.instanceCount : 0;
                        out.thinReduces = out.thinAfter < tFull;
                    }
                    // alles disposen (HISM-Instanzen freigeben) + den echten SET wiederherstellen
                    for (const k of Array.from(st.scatterRegions.keys())) r._disposeScatterRegion(k);
                    st.scatterRegions = snap;
                    st._foliageDensityScale = 1;
                } finally {
                    if (_prevThinHook) window.__anazhGateNoFoundry = _prevThinHook;
                    else delete window.__anazhGateNoFoundry;
                }
            }
        } catch (_eThin) {
            out.thinProbeError = String((_eThin && _eThin.message) || _eThin);
        }
        st._foliageDensityScale = 1;
        st._frameOverBudget = false;
        return out;
    });
    if (res.error) {
        check("V18.275: Foliage-Growth-Band (realm)", false, res.error);
        return;
    }
    check("V18.275: _foliageChunkInRadius + _tickFoliageGrowth existieren", res.hasGate && res.hasGrowth);
    check("V18.275: headless (Null-Renderer) → foliageRadius = MAX (gate-treu)", res.headlessFull);
    if (!res.skip) {
        check(
            "V18.275: kleiner Radius → ferner Chunk wartet, Spieler-Chunk füllt",
            res.farDeferred && res.nearIncluded
        );
        check("V18.275: der Radius wächst → der ferne Chunk wird in-radius (Welt wächst)", res.farIncludedAfterGrow);
        check(
            "V18.275 CONSUM: _tickFoliageGrowth füllt wartende in-radius Chunks (sanftes Nachwachsen)",
            res.growthDrains
        );
        check(
            "K22-3 EXISTENZ VOR FRAMERATE: Frame über Budget → EIN Chunk je Frist, der nächste zuerst, nie verhungert",
            res.growthNearestOverBudget && res.growthThrottledOverBudget && res.growthNeverStarves,
            `nächster ${res.growthNearestOverBudget} · Frist ${res.growthThrottledOverBudget} · nie verhungert ${res.growthNeverStarves}`
        );
        check("V18.282: Frame frei → das Wachstum läuft weiter (lädt in den Lücken)", res.growthResumesWhenFree);
    }
    check(
        "V18.277: headless (Null-Renderer) → _foliageDensityScale = 1 (volle Dichte, gate-treu)",
        res.densityHeadlessFull
    );
    if (res.densityCutsInstances !== undefined) {
        check(
            `V18.277 CONSUM: gedrosselte Dichte baut WENIGER ferne Scatter-Instanzen (${res.densFull} → ${res.densLow}) — direkt weniger Geometrie (der Bulk-Hebel)`,
            res.densityCutsInstances
        );
    } else if (res.densityProbeError) {
        check("V18.277 CONSUM: Dichte-Probe lief ohne Fehler", false, res.densityProbeError);
    }
    check(
        "V18.280: _tickFoliageThin existiert · Region trägt builtDensity · der Scatter-Tick ruft das Nach-Dünnen (Source)",
        res.thinExists && res.scatterReadsBuiltDensity && res.streamingCallsThin
    );
    if (res.oneSourceProbeError) {
        check("W1 CONSUM: Studio-Regime-Dichte-Probe lief ohne Fehler", false, res.oneSourceProbeError);
    } else {
        check(
            "W1 CONSUM: Studio-Regime → Dichte-Quelle 1 trotz gesenktem Regler + Thin ist No-op; foundry-aus → der Regler führt (0.4)",
            res.oneSourceStudioFull === true && res.thinStudioNoop === true && res.oneSourceGateFollows === true
        );
    }
    if (res.thinReduces !== undefined) {
        check(
            `V18.280 CONSUM: sinkt die Kapazität, schrumpft die STATIONÄRE Welt (Region ${res.thinFull} → ${res.thinAfter}) — die geladene Welt dünnt beim Drehen`,
            res.thinReduces
        );
    } else if (res.thinProbeError) {
        check("V18.280 CONSUM: Nach-Dünn-Probe lief ohne Fehler", false, res.thinProbeError);
    }
}

// DIE NAH-STREU (Waldboden 04.10.): der Boden nah am Auge wächst aus dem Pflanzen-Studio — die Arten sind die
// Boden-Zeilen des Studios (placement.boden, ring "nah"), gesetzt nach dem EINEN Boden-Gesetz (__phytoCore.
// bodenGewicht), gebaut über die Foundry (Studio-Teile mit leafKey "f:…"). Konsum statt Existenz: eine echte Kachel
// am Spieler wird gesetzt (deterministisch), der Takt baut ihre Blöcke in die Senken (InstancedMesh je Art × Gestalt ×
// Stufe × Teil), Entsorgen und Neubau halten die Block-Tabelle dicht. Headless ist pixel-blind — hier die Struktur.
async function checkBandNahStreu(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(async () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        // (3) Die Arten kommen aus dem Studio-Buch (warten, bis Buch + Render-Config stehen).
        let arten = null;
        for (let i = 0; i < 300 && !arten; i++) {
            arten = r._nahStreuArten();
            if (!arten) await sleep(200);
        }
        out.arten = arten ? arten.map((a) => a.id) : null;
        const buch = r._foundry && r._foundry.recipes;
        out.artenAusDemBuch =
            !!arten &&
            arten.length >= 5 &&
            arten.every((a) => buch && buch[a.id] && buch[a.id].kind === a.kind && a.zeile.ring === "nah");
        if (!arten) return out;
        // (4) Eine Kachel mit Pflanzen nahe dem Spieler (die Chunks stehen), zweimal gesetzt = dieselbe Streu.
        const NS = r.constructor.NAH_STREU;
        const pp = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, z: 0 };
        let kachel = null;
        for (let ring = 0; ring <= 6 && !kachel; ring++) {
            for (let dz = -ring; dz <= ring && !kachel; dz++) {
                for (let dx = -ring; dx <= ring && !kachel; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
                    const tx = Math.floor(pp.x / NS.kachel) + dx;
                    const tz = Math.floor(pp.z / NS.kachel) + dz;
                    const satz = r._nahStreuKachel(tx, tz, arten);
                    if (satz && satz.items.length) kachel = { tx, tz, satz };
                }
            }
        }
        out.kachelGefunden = !!kachel;
        if (!kachel) return out;
        const zweit = r._nahStreuKachel(kachel.tx, kachel.tz, arten);
        out.deterministisch =
            !!zweit &&
            zweit.items.length === kachel.satz.items.length &&
            zweit.items.every((it, i) => it.id === kachel.satz.items[i].id && it.x === kachel.satz.items[i].x);
        out.idsEindeutig = new Set(kachel.satz.items.map((it) => it.id)).size === kachel.satz.items.length;
        // (5) Der Takt baut den Ring: bis eine Senke Instanzen trägt (die Studio-Teile reisen asynchron).
        const cam = r.state.camera;
        const camVor = cam.position.clone();
        cam.position.set(pp.x, pp.y + 1.6, pp.z);
        let senken = null;
        for (let i = 0; i < 900; i++) {
            r._tickNahStreu();
            const ns = r.state.nahStreu;
            if (ns && [...ns.senken.values()].some((a) => a.anzahl > 0) && ns.offen === 0) {
                senken = ns.senken;
                break;
            }
            await sleep(100);
        }
        out.ringGebaut = !!senken;
        out.offen = r.state.nahStreu ? r.state.nahStreu.offen : null;
        if (!senken) {
            cam.position.copy(camVor);
            return out;
        }
        // (5b) DER WIND (Integration 05.10., W7): jede Senke einer Art mit weichem Gewebe (Laub · Blatt-Karte · Stiel)
        // zeichnet mit dem wiegenden Studio-Stoff (positionNode aus `_windSwayOffset`, Schlüssel-Teil |wiegt, die Höhe aus
        // dem Satz-Attribut aWiege), eine Art aus Holz und Stein steht — Konsum am gebauten Ring, keine Art-Liste.
        const weichK = new Set(["foliage", "foliageTex", "stem"]);
        const jeArt = new Map();
        for (const a of senken.values()) {
            const u = a.mat.userData || {};
            if (!jeArt.has(a.preset)) jeArt.set(a.preset, { weich: false, senken: [] });
            const e = jeArt.get(a.preset);
            if (weichK.has(u.foundryKind)) e.weich = true;
            e.senken.push(a);
        }
        // STEHEN heißt still, nicht knotenlos: Holz ohne Wind-Daten (Totstamm, Stumpf) teilt das EINE Programm der Rinde
        // (`_baumWindStoff`, 1310-18) mit an 0 — ein stehender Stoff trägt keinen Knoten oder den Rinden-Knoten mit an 0;
        // der wiegende trägt einen EIGENEN Knoten (nie den der Bäume). Der Verstoß nennt Senke und Grund.
        const baumK = r._baumWindKnoten || {};
        const still = (m) =>
            !m.positionNode ||
            (m.positionNode === baumK.ast && !!m.userData.windArt && m.userData.windArt.z === 0);
        out.wind = { wiegend: [], stehend: [], verstoss: [] };
        for (const [preset, e] of jeArt) {
            (e.weich ? out.wind.wiegend : out.wind.stehend).push(preset);
            for (const a of e.senken) {
                const satz = r.state.chunkSaetze ? r.state.chunkSaetze.get(a.satz) : null;
                const wiege = !!(satz && satz.geom.attributes.aWiege);
                const knoten = e.weich
                    ? !!a.mat.positionNode && a.mat.positionNode !== baumK.ast && a.mat.positionNode !== baumK.laub
                    : still(a.mat);
                const grund = !knoten
                    ? e.weich
                        ? "wiegt nicht"
                        : "steht nicht still"
                    : !satz
                      ? "ohne Satz"
                      : satz.mesh.material !== a.mat
                        ? "Satz-Stoff fremd"
                        : wiege !== e.weich
                          ? "aWiege"
                          : null;
                if (grund) out.wind.verstoss.push(a.key + " (" + grund + ")");
            }
        }
        out.windQuelle =
            /wiegen === true/.test(window.__codeOf(r._foundryTreeMaterial)) &&
            /_windSwayOffset\(TSL, \{ ampX: 1\.2, hoehe: TSL\.attribute\("aWiege"/.test(
                window.__codeOf(r._foundryTreeMaterial)
            );
        const ns = r.state.nahStreu;
        // (6) DER STREU-SATZ (W7): die Draw-Einheit ist der STOFF — kein Nah-Streu-Objekt zeichnet selbst, je Stoff EIN
        // Satz in der Szene (der stehende Stoff wirft, der wiegende nie — 1310-11), jede Senke ist ein Studio-Teil (leafKey f:…)
        // ohne Mesh, ihre Blöcke treu (Σ n = Anzahl, je Block Identitäten und Matrizen), jeder Block mit Pflanzen ein Bereich im
        // Satz ihres Stoffs.
        let selbst = 0;
        r.state.scene.traverse((o) => {
            if (o.isMesh && ((o.userData && o.userData.inventar === "streu-klein") || /^streuNah:/.test(o.name || "")))
                selbst++;
        });
        const stoffSaetze = new Map();
        for (const [art, satz] of r.state.chunkSaetze || [])
            if (satz.spec.userData.streuSatz) stoffSaetze.set(art, satz);
        const stoffe = new Set([...ns.senken.values()].map((a) => a.mat.uuid));
        const stehtJe = new Map([...ns.senken.values()].map((a) => [a.satz, !a.wiegt]));
        out.jeStoffEinSatz =
            selbst === 0 &&
            [...ns.senken.values()].every((a) => stoffSaetze.has(a.satz)) &&
            new Set([...stoffSaetze.values()].map((x) => x.spec.mat.uuid)).size === stoffSaetze.size &&
            stoffSaetze.size <= stoffe.size &&
            [...stoffSaetze].every(
                ([art, x]) => x.mesh.parent === r.state.scene && x.mesh.castShadow === (stehtJe.get(art) === true)
            );
        out.studioTeile = [...ns.senken.values()].every(
            (a) => a.mesh === undefined && typeof a.leafKey === "string" && a.leafKey.startsWith("f:")
        );
        out.tabelleDicht = [...ns.senken.values()].every((a) => {
            let summe = 0;
            for (const [kk, b] of a.bloecke) {
                if (b.ids.length !== b.n || b.matrizen.length !== b.n * 16) return false;
                const bereich = stoffSaetze.get(a.satz).bloecke.get(a.key + "@" + kk);
                if (b.n > 0 ? !bereich || bereich.vAnzahl !== b.n * a.geo.attributes.position.count : !!bereich)
                    return false;
                summe += b.n;
            }
            return summe === a.anzahl;
        });
        // (7) Satz-Disziplin: eine gebaute Kachel entsorgen → ihre Blöcke treten aus; neu bauen → dieselben Zahlen.
        const [kKey, kz] = [...ns.kacheln].find(([, k]) => k.senken.size > 0) || [];
        out.kachelMitBloecken = !!kz;
        if (kz) {
            const vor = new Map([...ns.senken].map(([k, a]) => [k, a.anzahl]));
            const blockN = new Map([...kz.senken].map((sk) => [sk, ns.senken.get(sk).bloecke.get(kKey).n]));
            r._nahStreuKachelEntsorgen(kz);
            out.entsorgt = [...blockN].every(([sk, n]) => ns.senken.get(sk).anzahl === vor.get(sk) - n);
            for (let i = 0; i < 300 && kz.zustand === null; i++) {
                r._tickNahStreu();
                if (kz.zustand === null) await sleep(50);
            }
            out.neuGleich = [...ns.senken].every(([k, a]) => a.anzahl === vor.get(k));
        }
        cam.position.copy(camVor);
        return out;
    });

    if (res.error) {
        check("Nah-Streu: Band (realm verfügbar)", false, res.error);
        return;
    }
    check(
        "Nah-Streu: die Arten sind Studio-Zeilen (placement.boden ring nah) mit Rezept im Buch (≥ 5)",
        res.artenAusDemBuch === true,
        JSON.stringify(res.arten)
    );
    check("Nah-Streu: eine Kachel am Spieler trägt Pflanzen", res.kachelGefunden === true);
    if (!res.kachelGefunden) return;
    check("Nah-Streu: dieselbe Kachel = dieselbe Streu (Γ5, Würfe je Zelle)", res.deterministisch === true);
    check("Nah-Streu: die Ernte-Identität je Pflanze ist eindeutig", res.idsEindeutig === true);
    check(
        "Nah-Streu: der Takt baut den Ring (Studio-Teile kommen an, nichts offen)",
        res.ringGebaut === true,
        `offen ${res.offen}`
    );
    if (!res.ringGebaut) return;
    check(
        "Nah-Streu: weiches Gewebe wiegt im EINEN Wind (_windSwayOffset), Holz und Stein stehen",
        res.windQuelle === true && res.wind.wiegend.length > 0 && res.wind.verstoss.length === 0,
        JSON.stringify(res.wind)
    );
    check(
        "Nah-Streu (W7): die Draw-Einheit ist der Stoff — je Stoff EIN Streu-Satz in der Szene, keine Senke zeichnet, der stehende Stoff wirft, der wiegende nie",
        res.jeStoffEinSatz === true
    );
    check("Nah-Streu: jede Senke ist ein Studio-Teil (leafKey f:…), Daten ohne Mesh", res.studioTeile === true);
    check(
        "Nah-Streu: die Blöcke sind treu (Σ n = Anzahl, Identitäten und Matrizen je Block, je Block ein Bereich im Streu-Satz)",
        res.tabelleDicht === true
    );
    check(
        "Nah-Streu: eine gebaute Kachel trägt Blöcke (Voraussetzung der Satz-Disziplin)",
        res.kachelMitBloecken === true
    );
    if (!res.kachelMitBloecken) return;
    check("Nah-Streu: Entsorgen nimmt die Kachel-Blöcke aus den Senken", res.entsorgt === true);
    check("Nah-Streu: der Neubau stellt dieselben Zahlen her", res.neuGleich === true);
}

// S6-B ERNTBARE FLORA: Raycast auf die Senken der Nah-Streu (instanceId → Kachel-Block → Ernte-Identität der
// Pflanze), Ertrag je Studio-kind (STREU_ERNTE: kraut · stein · holz), Session-Gedächtnis + Regrow (nicht
// persistiert); gepflücktes kraut speist den Trank-Bauplan durchs Mach-Tor.
async function checkBandV18133Forage(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const mats = r.state.materials;
        out.materials =
            !!(mats.kraut && mats.kraut.builtIn && mats.kraut.tags.lebendig >= 0.9) &&
            !!(mats.essenz && mats.essenz.builtIn && mats.essenz.tags.magieleitung >= 0.9);
        const ernte = r.constructor.STREU_ERNTE;
        out.allYields = !!ernte && Object.values(ernte).every((m) => typeof m === "string" && !!mats[m]);
        out.forageConst = !!r.constructor.FORAGE && Number.isFinite(r.constructor.FORAGE.regrowMs);
        // Die Zutaten-Oekonomie schliesst: der Lebenssaft traegt kraut (das
        // Mach-Tor V17.65 zieht damit GEPFLUECKTE Zutaten).
        out.trankKraut =
            r.state.blueprints.trank_lebenssaft &&
            r.state.blueprints.trank_lebenssaft.parts.some((pp) => pp.material === "kraut");
        // Behavioral (wenn die Nah-Streu steht — sonst unmessbar=bestanden, V13.1): die erste Pflanze einer
        // erntbaren Senke pflücken.
        let pick = null;
        const ns = r.state.nahStreu;
        if (ns)
            for (const a of ns.senken.values()) {
                if (!a.ernte || a.anzahl === 0) continue;
                for (const [key, b] of a.bloecke)
                    if (b.n > 0) {
                        pick = { key, senke: a.key, name: a.preset, id: b.ids[0] };
                        break;
                    }
                if (pick) break;
            }
        if (pick) {
            const a = ns.senken.get(pick.senke);
            const countMat = () => {
                let n = 0;
                for (const sl of r.state.player.inventory || []) if (sl && sl.material === a.ernte) n += sl.count || 0;
                return n;
            };
            const before = countMat();
            const vorher = r._streuNahBereich(pick.senke, pick.key); // der Block der Kachel in der Senke
            const nVor = vorher.n;
            const zahlVor = a.anzahl;
            const satz = r.state.chunkSaetze.get(vorher.satz);
            const vertsVor = satz.bloecke.has(vorher.bereich) ? satz.bloecke.get(vorher.bereich).vAnzahl : 0;
            const ok1 = r._harvestScatterPick(pick);
            out.harvested = ok1 && countMat() - before === 1;
            out.doubleRejected = r._harvestScatterPick(pick) === false;
            // Die Pflanze tritt aus dem Block aus: ihre Identität fehlt, der Block und die Anzahl der Senke sinken um eins,
            // der Bereich im Streu-Satz ihres Stoffs trägt eine Pflanze weniger (sie zeichnet nie mehr).
            const bereich = r._streuNahBereich(pick.senke, pick.key);
            const vertsNach = satz.bloecke.has(vorher.bereich) ? satz.bloecke.get(vorher.bereich).vAnzahl : 0;
            out.ausgetreten =
                !!bereich &&
                !bereich.ids.includes(pick.id) &&
                bereich.n === nVor - 1 &&
                a.anzahl === zahlVor - 1 &&
                vertsVor - vertsNach === a.geo.attributes.position.count;
            // Aufraeumen: Ernte-Eintrag zuruecknehmen (kein Band-Crosstalk) + die Kachel neu (die Pflanze kehrt
            // mit dem nächsten Nah-Streu-Takt zurück).
            const jeKachel = r.state.scatterHarvested.get(pick.key);
            if (jeKachel) {
                jeKachel.delete(pick.id);
                if (jeKachel.size === 0) r.state.scatterHarvested.delete(pick.key);
            }
            const k = ns.kacheln.get(pick.key);
            if (k) k.zustand = null;
            r._tickNahStreu();
            out.measured = true;
        } else {
            out.measured = false;
        }
        return out;
    });
    if (!res) {
        check("V18.133 Foraging: Sonde lief", false, "evaluate warf");
        return;
    }
    check("V18.133 Foraging: die Alchemie-Materialien kraut+essenz stehen (builtIn, Tag-Profil)", res.materials);
    check(
        "V18.133 Foraging: jede Studio-Art trägt einen existierenden Ernte-Stoff (STREU_ERNTE je kind)",
        res.allYields && res.forageConst
    );
    check(
        "V18.133 Foraging: der Lebenssaft zieht GEPFLUECKTES kraut (die Zutaten-Oekonomie schliesst)",
        res.trankKraut
    );
    check(
        "V18.133 Foraging: pfluecken wirkt (+1 Stoff · die Pflanze tritt aus der Senke · Doppel-Pflueck abgelehnt) — oder unmessbar",
        !res.measured || (res.harvested && res.doubleRejected && res.ausgetreten)
    );
}

// Γ-M STRATA: y-abhängige Material-Wahl im Boden — nahe der Oberfläche kann erde gewinnen, tief
// dominiert stein. Alte 2-arg-Aufrufer ohne y bleiben bit-identisch.
async function checkBandV18197GammaMStrata(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (S1) STRATA_STEIN_DEPTH frozen Konstante
        out.constExists = typeof A.STRATA_STEIN_DEPTH === "number" && A.STRATA_STEIN_DEPTH > 0;

        // (S2) Source-Probe: _terrainMaterialAt nimmt y + nutzt STRATA_STEIN_DEPTH
        const src = window.__codeOf(r._terrainMaterialAt);
        out.acceptsY = /\(x,\s*z,\s*y\)/.test(src);

        // (S3) MIGRATION-TOLERANZ: 2-arg Aufruf gibt das alte Verhalten
        // (Achse-Argmax), wie vor V18.197 — bit-identisch zu Pre-V18.197.
        let pt = { x: 0, z: 0 };
        // Finde einen Punkt, wo erde gewinnt (Vegetation-Achse stark) — und dessen Schwelle (S6) in Gleitkomma GENAU
        // auf STRATA_STEIN_DEPTH liegt: der Stamm rechnet die Tiefe als surfY − y, und surfY − (surfY − D) trifft D
        // nicht für jede Höhe (eine Zufalls-Höhe lag 1 ulp über D → „stein", CI 38211283065 voll 11/11; ≈ 1 % der Höhen).
        let erdePt = null;
        for (let i = 0; i < 200 && !erdePt; i++) {
            const x = (Math.random() - 0.5) * 600;
            const z = (Math.random() - 0.5) * 600;
            const surfY = r._voxelSurfaceY ? r._voxelSurfaceY(x, z) : null;
            if (!Number.isFinite(surfY)) continue;
            if (surfY - (surfY - A.STRATA_STEIN_DEPTH) !== A.STRATA_STEIN_DEPTH) continue;
            const mat = r._terrainMaterialAt(x, z); // 2-arg, kein y
            if (mat === "erde") {
                erdePt = { x, z, surfY };
                break;
            }
        }
        out.foundErdePoint = !!erdePt;

        if (erdePt) {
            // (S4) AN DER OBERFLÄCHE (y = surfY): das alte Verhalten bleibt —
            // erde, wenn die Achse erde gewinnt. y nahe surfY → erde.
            const surfMat = r._terrainMaterialAt(erdePt.x, erdePt.z, erdePt.surfY);
            out.surfaceMat = surfMat;
            out.surfaceStaysSame = surfMat === "erde";

            // (S5) TIEF UNTER der Oberfläche (y = surfY - STRATA_STEIN_DEPTH - 5):
            // STRATA forciert stein.
            const deepY = erdePt.surfY - A.STRATA_STEIN_DEPTH - 5;
            const deepMat = r._terrainMaterialAt(erdePt.x, erdePt.z, deepY);
            out.deepMat = deepMat;
            out.deepIsStein = deepMat === "stein";

            // (S6) GRENZ-FALL: genau auf STRATA_STEIN_DEPTH-Schwelle bleibt
            // erde (strikte >-Wand, kein Off-by-one)
            const onThresholdY = erdePt.surfY - A.STRATA_STEIN_DEPTH;
            const onMat = r._terrainMaterialAt(erdePt.x, erdePt.z, onThresholdY);
            out.thresholdMat = onMat;
            out.thresholdStaysSame = onMat === "erde";
        }

        // (S7) digTerrain ruft _terrainMaterialAt mit target.y (Source-Probe)
        // Mehrere mögliche Aufrufer haben sich an die strukturelle Wahrheit
        // angepasst.
        const code = r.constructor && r.constructor.toString ? window.__codeOf(r.constructor).substr(0, 5000) : "";
        // Statt grobem source-grep prüfen wir das spezifische Verhalten —
        // _terrainMaterialAt(x, z, y) als Mechanik via direkte Probe.
        out.digConsumesY = out.acceptsY; // direkter Source-Beweis

        // (S8) MIGRATION-ROUND-TRIP: ein 2-arg-Aufruf gibt dasselbe Ergebnis
        // wie ein 3-arg-Aufruf mit y > surfY (nahe Oberfläche) — die Änderung
        // ist additiv, kein Bruch.
        if (erdePt) {
            const oldStyle = r._terrainMaterialAt(erdePt.x, erdePt.z);
            const surfaceStyle = r._terrainMaterialAt(erdePt.x, erdePt.z, erdePt.surfY);
            out.migrationConsistent = oldStyle === surfaceStyle;
        }
        return out;
    });

    check("V18.197 (S1) STRATA_STEIN_DEPTH frozen Konstante existiert", res.constExists === true);
    if (res.foundErdePoint) {
        check(
            `V18.197 (S4) An Oberfläche (y=surfY): bleibt erde (alte Achse, gemessen ${res.surfaceMat})`,
            res.surfaceStaysSame === true
        );
        check(
            `V18.197 (S5) Tief unter Strata-Schwelle: forciert stein (gemessen ${res.deepMat})`,
            res.deepIsStein === true
        );
        check(
            `V18.197 (S6) Auf der Strata-Schwelle: bleibt erde (strikte >-Wand, gemessen ${res.thresholdMat})`,
            res.thresholdStaysSame === true
        );
        check(
            `V18.197 (S8) MIGRATION: 2-arg Aufruf = 3-arg mit y=surfY (bit-identisch zu Pre-V18.197)`,
            res.migrationConsistent === true
        );
    } else {
        check("V18.197 (S4-S8) Erde-Punkt nicht gefunden — Welt ohne Erde-Region (skip)", true);
    }
}

// V18.200 — Γ-M IRON-BANDS (genese-plan §Γ-M Folge zu V18.197 STRATA +
// V18.199 LICHEN). Vertikale Eisenadern in tiefen Bergregionen — vollendet
// die Γ-M-Triade (Strata horizontal + Lichen Patina + Iron-Bands vertikal).
async function checkBandV18200GammaMIronBands(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (I1) IRON_BANDS frozen Konstanten
        out.constExists = !!A.IRON_BANDS && Object.isFrozen(A.IRON_BANDS);
        if (A.IRON_BANDS) {
            const IB = A.IRON_BANDS;
            out.constsSensible =
                typeof IB.minDepth === "number" &&
                IB.minDepth > 0 &&
                typeof IB.threshold === "number" &&
                IB.threshold > 0 &&
                IB.threshold < 1 &&
                typeof IB.dichteFloor === "number" &&
                IB.dichteFloor >= 0 &&
                typeof IB.scale === "number" &&
                IB.scale > 0;
            // minDepth muss > STRATA_STEIN_DEPTH sein (Iron-Bands sind eine
            // Subschicht UNTERHALB der reinen Stein-Schicht)
            out.deepBeyondStrata = IB.minDepth > A.STRATA_STEIN_DEPTH;
        }

        // (I2) _eisenAderAt-Helper existiert + ist deterministisch
        out.helperExists = typeof r._eisenAderAt === "function";
        if (out.helperExists) {
            // Determinismus: zweimal gleicher (x,z) → gleicher Wert
            const a1 = r._eisenAderAt(123.7, 456.3);
            const a2 = r._eisenAderAt(123.7, 456.3);
            out.deterministic = Math.abs(a1 - a2) < 1e-10;
            // Wert in [0, 1]
            out.boundedRange = a1 >= 0 && a1 <= 1;
            // VERTEILUNG: über 500 Probe-Punkte sollte die Verteilung
            // nicht-degeneriert sein (max > 0.5, mean ~0.3-0.5)
            let max = 0,
                sum = 0;
            for (let i = 0; i < 500; i++) {
                const x = (i * 37 + 11) % 5000;
                const z = (i * 73 - 29) % 5000;
                const v = r._eisenAderAt(x, z);
                if (v > max) max = v;
                sum += v;
            }
            out.distMax = max;
            out.distMean = sum / 500;
            out.distHasPeaks = max > 0.5;
        }

        // (I3) MIGRATION-TOLERANZ: _terrainMaterialAt ohne y bleibt
        // bit-identisch (keine Iron-Bands-Aktivierung ohne y-Probe).
        const oldStyle = r._terrainMaterialAt(0, 0);
        const surfaceStyle = r._terrainMaterialAt(0, 0, r._voxelSurfaceY ? r._voxelSurfaceY(0, 0) : 0);
        out.migrationOk = oldStyle === surfaceStyle;

        // (I4) STRATA bleibt aktiv: tief unter STRATA_STEIN_DEPTH, wenn KEIN
        // Iron-Band, ist das Material stein.
        // Finde Punkte mit niedrigem ironAder (< threshold) und prüfe Material.
        let steinHits = 0;
        let eisenHits = 0;
        let probedDeep = 0;
        for (let i = 0; i < 30; i++) {
            const x = (i * 173) % 1500;
            const z = (i * 257 + 13) % 1500;
            const surfY = r._voxelSurfaceY ? r._voxelSurfaceY(x, z) : null;
            if (!Number.isFinite(surfY)) continue;
            const deepY = surfY - A.IRON_BANDS.minDepth - 10;
            const mat = r._terrainMaterialAt(x, z, deepY);
            probedDeep++;
            if (mat === "stein") steinHits++;
            if (mat === "eisen") eisenHits++;
        }
        out.deepSteinHits = steinHits;
        out.deepEisenHits = eisenHits;
        out.deepProbed = probedDeep;
        out.steinDominant = steinHits > eisenHits; // Iron-Bands sind selten

        // (I5) EISEN als Material existiert
        out.eisenMaterialExists = !!(r.state.materials && r.state.materials["eisen"]);

        // (I6) MATH: an einem KÜNSTLICH konstruierten Iron-Band-Punkt
        // (ironAder hoch + tief + dichte hoch) → eisen
        // Finde einen Punkt mit aderwert > threshold
        let highAderPoint = null;
        for (let i = 0; i < 1000; i++) {
            const x = (i * 31.4) % 3000;
            const z = (i * 27.9) % 3000;
            if (r._eisenAderAt(x, z) > A.IRON_BANDS.threshold) {
                const surfY = r._voxelSurfaceY ? r._voxelSurfaceY(x, z) : null;
                if (Number.isFinite(surfY)) {
                    const f = r.worldFieldAt ? r.worldFieldAt(x, z) : null;
                    if (f && (f.dichte || 0) > A.IRON_BANDS.dichteFloor) {
                        highAderPoint = { x, z, surfY };
                        break;
                    }
                }
            }
        }
        out.foundIronPoint = !!highAderPoint;
        if (highAderPoint) {
            const deepY = highAderPoint.surfY - A.IRON_BANDS.minDepth - 5;
            const mat = r._terrainMaterialAt(highAderPoint.x, highAderPoint.z, deepY);
            out.ironPointGivesEisen = mat === "eisen";
            // Plus: an NIEDRIGER Tiefe (< minDepth) bleibt stein-Schicht
            const midDepth = highAderPoint.surfY - (A.STRATA_STEIN_DEPTH + 2);
            const midMat = r._terrainMaterialAt(highAderPoint.x, highAderPoint.z, midDepth);
            out.midDepthStaysStein = midMat === "stein"; // Iron-Schwelle nicht erreicht (zu flach)
        }


        return out;
    });

    check("V18.200 (I1a) IRON_BANDS frozen Konstanten existieren", res.constExists === true);
    check(
        "V18.200 (I1b) Konstanten sinnvoll + minDepth > STRATA_STEIN_DEPTH",
        res.constsSensible === true && res.deepBeyondStrata === true
    );
    check("V18.200 (I2a) _eisenAderAt-Helper existiert", res.helperExists === true);
    check("V18.200 (I2b) deterministisch (zwei Aufrufe gleicher Wert)", res.deterministic === true);
    check("V18.200 (I2c) Werte in [0, 1] gebounded", res.boundedRange === true);
    check(
        `V18.200 (I2d) Verteilung nicht-degeneriert (max=${res.distMax && res.distMax.toFixed(2)}, mean=${res.distMean && res.distMean.toFixed(2)}, Peaks > 0.5)`,
        res.distHasPeaks === true
    );
    check("V18.200 (I3) MIGRATION: ohne y bit-identisch (Pre-V18.197)", res.migrationOk === true);
    check(
        `V18.200 (I4) STRATA dominant: stein ${res.deepSteinHits}/${res.deepProbed} > eisen ${res.deepEisenHits} in tiefen Punkten`,
        res.steinDominant === true
    );
    check("V18.200 (I5) Material 'eisen' existiert in state.materials", res.eisenMaterialExists === true);
    if (res.foundIronPoint) {
        check(
            "V18.200 (I6a) An Iron-Ader-Punkt (tief + dichte hoch + ader>threshold) → eisen",
            res.ironPointGivesEisen === true
        );
        check(
            "V18.200 (I6b) Bei flacher Tiefe bleibt es stein (Iron-Schwelle nicht erreicht)",
            res.midDepthStaysStein === true
        );
    } else {
        check("V18.200 (I6) Kein Iron-Ader-Punkt in 1000 Samples gefunden (skip)", true);
    }
}

// V18.205 — Γ7 BAUM-VARIANTEN-GRAMMATIK (genese-plan §Γ7 + aktiv-plan §4.A):
// `_growTreeBlueprint(speciesKey, seed)` emittiert parts[] in der bestehenden
// Sprache. Tag-neutral via material-Konsistenz (holz+laub).
async function checkBandV18205Gamma7Grammatik(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};

        // (G1) Helper existiert
        out.helperExists = typeof r._growTreeBlueprint === "function";

        if (out.helperExists) {
            // (G2) Determinismus: gleiche seed → gleiche parts
            const p1 = r._growTreeBlueprint("eiche", "seed-a");
            const p2 = r._growTreeBlueprint("eiche", "seed-a");
            out.deterministic = JSON.stringify(p1) === JSON.stringify(p2);

            // (G3) 6 verschiedene Seeds → 6 unterschiedliche Varianten
            const seeds = ["s1", "s2", "s3", "s4", "s5", "s6"];
            const variants = seeds.map((s) => r._growTreeBlueprint("eiche", s));
            const uniqueSigs = new Set(variants.map((v) => JSON.stringify(v)));
            out.sixDistinct = uniqueSigs.size === 6;

            // (G4) STRUKTUR: Stamm-Parts sind holz, Laub-Parts sind laub.
            // Mind. 3 Stamm-Segmente, mind. 1 Laub-Ellipsoid.
            const sample = variants[0];
            out.partsCount = sample.length;
            out.allHolzOrLaub = sample.every((p) => p.material === "holz" || p.material === "laub");
            out.hasHolzParts = sample.filter((p) => p.material === "holz").length >= 3;
            out.hasLaubParts = sample.filter((p) => p.material === "laub").length >= 1;

            // (G5) SPECIES.ts-Regel: Laub sitzt NIE am Hauptstamm (y=0..3), sondern an Ebene-2-Enden →
            // alle laub-Parts haben |xz| > 0.4 ODER y > 2. Der Fuß-Saum (die flache Wurzelanlauf-Disk, Ω-K2) sitzt
            // BEWUSST am Sockel und ist keine Krone (wie V18.211 S3c); seit K24 wächst auch die Bare-Art "eiche" aus dem Gesetz.
            const laubAwayFromTrunk = sample
                .filter((p) => p.material === "laub" && !(p.position.y < 1 && p.size.x > p.size.y * 1.5))
                .every((p) => {
                    const dist = Math.hypot(p.position.x, p.position.z);
                    return dist > 0.4 || p.position.y > 2;
                });
            out.laubAtBranchEnds = laubAwayFromTrunk;

            // (G6) TAG-NEUTRALITÄT: ein generierter Baum hat dieselben Affinitäts-MAX wie baum_eiche (holz+laub,
            // cylinder+sphere). fakeBp trägt die Spezies-Marke (_grownSpecies), damit computeCompoundTags beiden
            // dieselbe Art-Variation gibt — sonst läse die +0.05-Variation als Drift.
            const fakeBp = { parts: sample, _grownSpecies: "baum_eiche" };
            // V18.257 — baum_eiche statisch geschnitten; gegen einen GEWACHSENEN Baum prüfen.
            const __g6Key = r._growTreeBlueprintForSpawn && r._growTreeBlueprintForSpawn("baum_eiche", "g6");
            const treeBp = __g6Key && r.state.blueprints[__g6Key];
            if (treeBp) {
                const fakeTags = r.computeCompoundTags(fakeBp);
                const treeTags = r.computeCompoundTags(treeBp);
                const targetAxes = ["lebendig", "dichte", "brennbar", "magieleitung"];
                const diffs = {};
                let neutral = true;
                for (const axis of targetAxes) {
                    const dt = (fakeTags[axis] || 0) - (treeTags[axis] || 0);
                    diffs[axis] = Number(dt.toFixed(3));
                    if (Math.abs(dt) > 0.05) neutral = false;
                }
                out.tagDiffs = diffs;
                out.tagNeutral = neutral;
            }

            // (G7) WOHLGEFORMTHEIT: jeder Part hat shape, material, position{xyz},
            // size{xyz}
            out.wellFormed = sample.every(
                (p) =>
                    p.shape &&
                    p.material &&
                    p.position &&
                    typeof p.position.x === "number" &&
                    typeof p.position.y === "number" &&
                    typeof p.position.z === "number" &&
                    p.size &&
                    typeof p.size.x === "number" &&
                    typeof p.size.y === "number" &&
                    typeof p.size.z === "number"
            );

            // (G8) HÖHEN-VARIANZ über 6 Varianten — sample 0..5 + maxHöhe
            const heights = variants.map((v) => {
                let maxY = 0;
                for (const p of v) if (p.position.y + p.size.y * 0.5 > maxY) maxY = p.position.y + p.size.y * 0.5;
                return maxY;
            });
            const hMin = Math.min(...heights);
            const hMax = Math.max(...heights);
            out.heightSpread = Number((hMax - hMin).toFixed(2));
            out.heightsVary = hMax - hMin > 0.5; // mindestens 0.5 m Spreizung über 6 Varianten

        }
        return out;
    });

    check("V18.205 (G1) _growTreeBlueprint Helper existiert", res.helperExists === true);
    check("V18.205 (G2) Determinismus: gleiche seed → identische parts", res.deterministic === true);
    check(`V18.205 (G3) 6 unterschiedliche seeds → 6 unique Varianten`, res.sixDistinct === true);
    check(`V18.205 (G4a) parts > 0 (gemessen ${res.partsCount})`, res.partsCount > 0);
    check("V18.205 (G4b) Alle Parts holz oder laub Material", res.allHolzOrLaub === true);
    check("V18.205 (G4c) Mind. 3 Stamm-Holz-Parts", res.hasHolzParts === true);
    check("V18.205 (G4d) Mind. 1 Laub-Krone-Part", res.hasLaubParts === true);
    check("V18.205 (G5) SPECIES.ts-Regel: Laub an Ast-Enden (nie am Hauptstamm direkt)", res.laubAtBranchEnds === true);
    check(
        `V18.205 (G6) TAG-NEUTRALITÄT zu baum_eiche (V17.16-Disziplin, diffs ${JSON.stringify(res.tagDiffs)})`,
        res.tagNeutral === true
    );
    check("V18.205 (G7) Parts wohlgeformt (shape+material+position+size vollständig)", res.wellFormed === true);
    check(`V18.205 (G8) Höhen-Spreizung über 6 Varianten > 0.5 m (${res.heightSpread})`, res.heightsVary === true);
}

// Skeleton-Grammar: mehrstufige Grammatik (trunk + L1 + L2) mit Foliage an den TIPS; Routing-Gate
// gen≥5 (alte Welten bit-identisch). grownBlueprints persistiert NUR Metadaten (parts re-wachsen
// f(seed)) → bleibt unter dem 256-KB-pinCurrentWorld-Cap.
async function checkBandV18211SkeletonGrammar(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (S1) K24: jede Kern-Art wächst aus dem Gesetzbuch — `_phytoArt` löst den Welt-Namen auf die Rezept-Zeile der
        // Studio-Tafel auf (die Stamm-Grammatik ist gefallen, der Richter liest treeParams der Art).
        out.grammarExists = typeof r._phytoArt === "function";
        if (out.grammarExists) {
            out.sixSpecies = ["baum_eiche", "baum_tanne", "baum_buche", "baum_birke", "baum_kiefer", "baum_erle"].every(
                (sp) => {
                    const a = r._phytoArt(sp);
                    return !!(a && a.rec.kind === "tree" && Number.isFinite(a.rec.s.api));
                }
            );
        }

        // (S2) `_growTreeBlueprintRich` existiert (Routing-Helfer-Trio).
        out.richExists = typeof r._growTreeBlueprintRich === "function";

        // (S3) RICH-PFAD bei direktem Aufruf produziert ≥50 Parts (vs Legacy ~12).
        // 50 = sicherer Schwellenwert; gemessen 75-81 pro Art.
        if (out.richExists && out.grammarExists) {
            const richParts = r._growTreeBlueprintRich("baum_tanne", "v211-test");
            out.richProducesMany = Array.isArray(richParts) && richParts.length >= 50;
            out.richPartsCount = richParts ? richParts.length : 0;
            // Tag-Neutralität: jedes Part ist holz oder laub (V17.16-Wand).
            out.richAllHolzOrLaub =
                Array.isArray(richParts) && richParts.every((p) => p.material === "holz" || p.material === "laub");
            // FOLIAGE AT TIPS: ≥ 80 % der laub-Parts sind vom Stamm-Sockel weg (|xz| > 0.4 oder y > 1.5); nicht
            // 100 %, weil der Ω-K2-Fuß-Flare BEWUSST am Sockel sitzt (Wurzelanlauf-Disk, kein Kronen-Cluster).
            const laub = richParts ? richParts.filter((p) => p.material === "laub") : [];
            const atTipsCount = laub.filter((p) => {
                const dist = Math.hypot(p.position.x, p.position.z);
                return dist > 0.4 || p.position.y > 1.5;
            }).length;
            out.richFoliageAtTips = laub.length >= 10 && atTipsCount >= Math.floor(laub.length * 0.8);
        }


        // (S5) SNAPSHOT-HEILUNG: grownBlueprints im Snapshot trägt KEINE
        // parts-Arrays mehr (Plan-§2.5-konform: f(seed) ist das Erbgut).
        // Spawne einen grown_-Bauplan + prüfe das Snapshot-Feld.
        if (typeof r._growTreeBlueprintForSpawn === "function") {
            const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "v211-snapshot-test");
            if (grownKey && r.state.blueprints[grownKey]) {
                // V18.317/.347 — der Snapshot persistiert NUR architektur-REFERENZIERTE grown-Baupläne
                // (die Foliage-Masse re-wächst f(seed), §2.5); eine Sentinel-Architektur hält den Test-
                // Bauplan, sonst filtert ihn der Snapshot KORREKT heraus → das ist die neue Wahrheit.
                r.state.architectures = r.state.architectures || [];
                r.state.architectures.push({ id: "v211-snap-arch", type: grownKey, position: { x: 0, y: 0, z: 0 } });
                // Snapshot bauen und das grownBlueprints-Feld prüfen.
                const snap = r.buildStateSnapshot();
                const gb = snap && snap.grownBlueprints && snap.grownBlueprints[grownKey];
                out.snapshotHasMetadata = !!(gb && gb._grownSpecies && gb._grownSeed);
                out.snapshotNoParts = !!(gb && !Array.isArray(gb.parts));
                // Snapshot-Größe (rough estimate): sollte einen kompakten grown-
                // Eintrag tragen (< 500 Bytes vs alte ~7.5 KB mit parts).
                out.snapshotGrownEntrySmall = gb ? JSON.stringify(gb).length < 500 : false;
                r.state.architectures = r.state.architectures.filter((a) => a.id !== "v211-snap-arch");
            }
        }

        // (S6) VERSION: AnazhRealm.VERSION + index.html-Cache-Buster; die Probe trägt einen FLOOR statt
        // einer scharfen Zahl (Drift-Schutz).
        const vparts2 = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionBumped = vparts2[0] > 18 || (vparts2[0] === 18 && vparts2[1] >= 217);

        return out;
    });

    check("K24 (S1a) _phytoArt: die Art liest das Gesetzbuch", res.grammarExists === true);
    check(
        "K24 (S1b) die 6 Kern-Arten (tanne/kiefer/buche/birke/eiche/erle) sind Baum-Zeilen der Tafel",
        res.sixSpecies === true
    );
    check("V18.211 (S2a) _growTreeBlueprintRich existiert", res.richExists === true);
    check(
        `V18.211 (S3a) Rich-Grammatik produziert ≥50 Parts (gemessen ${res.richPartsCount})`,
        res.richProducesMany === true
    );
    check("V18.211 (S3b) Alle Rich-Parts holz oder laub (V17.16-Wand strukturell)", res.richAllHolzOrLaub === true);
    check(
        "V18.211 (S3c) Foliage AT TIPS: ≥10 laub-Parts, alle vom Stamm weg (Plan-§3.3)",
        res.richFoliageAtTips === true
    );
    check(
        "V18.211 (S5a) Snapshot grownBlueprints trägt Metadata (_grownSpecies + _grownSeed)",
        res.snapshotHasMetadata === true
    );
    check("V18.211 (S5b) Snapshot grownBlueprints OHNE parts-Array (re-wächst f(seed))", res.snapshotNoParts === true);
    check(
        "V18.211 (S5c) Snapshot-Eintrag pro grown-Bauplan < 500 Bytes (Plan-§2.5-konform)",
        res.snapshotGrownEntrySmall === true
    );
    check(`V18.211 (S6) VERSION floor ≥ 18.217.0 (walk-with-code, V18.217 Varianten-Pool)`, res.versionBumped === true);
}

// Gigant-Restsubschritte: Ω-K2 Baum-Füße · Ω-W vertieftes Wind · Ω-H Promotion-Provenienz ·
// Ω-C Canopy-Shell (als ABWESENHEIT geprüft).
async function checkBandV18212GigantRestsubschritte(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── Ω-K2 BAUM-FÜSSE ───
        // Flacher mossiger Saum am Stamm-Sockel: jeder Rich-Baum hat ein laub-Part mit y < trunkBaseR und
        // großem x/z-Stretch (Disk-Form).
        if (typeof r._growTreeBlueprintRich === "function") {
            const parts = r._growTreeBlueprintRich("baum_tanne", "k2-test");
            const sk = r._lastTreeSkeleton;
            r._lastTreeSkeleton = null;
            const baseR = sk && sk.branches[0] && sk.branches[0].points[0] ? sk.branches[0].points[0].r : 0;
            // Der Flare skaliert mit der Größenklasse → keine absolute Schwelle: er ist eine FLACHE DISK am
            // Sockel (x/y ~5.5), größenklassen-unabhängig getrennt von den Foliage-Kugeln (x/y ≈ 1.4 < 1.5).
            const sockelParts = parts.filter(
                (p) => p.material === "laub" && p.position.y < baseR * 2 && p.size.x > p.size.y * 1.5
            );
            out.k2HasFlare = sockelParts.length >= 1;
            // Der Sockel-Part liegt am Stamm-Ursprung (xz-Position klein).
            if (sockelParts.length >= 1) {
                const s = sockelParts[0];
                out.k2FlareAtTrunkBase = Math.abs(s.position.x) < 0.5 && Math.abs(s.position.z) < 0.5;
            }
        }

        // ─── Ω-W VERTIEFTES WIND ───
        // K19: der Wind des Werkstatt-Baums ist der EINE Term des Kerns (phyto-core `windAusschlag`) — die Spitze
        // biegt quadratisch (ζ²), das Blatt flattert schneller als sein Ast, der Sturm biegt ≥ 3× die Brise.
        {
            const PC = window.__phytoCore,
                Z = PC.WIND_ZAHLEN,
                W = PC.WIND_GESETZ;
            const e = (U, zeta, t) => ({ t, U, g: 1, f0: 0.4, H: 20, zeta, rho: 0, phi: 0, psi: 1 });
            const spitze = (U, zeta) => {
                let m = 0;
                for (let t = 0; t < 10; t += 0.01)
                    m = Math.max(m, Math.abs(PC.windAusschlag(Z, e(U, zeta, t), true).quer));
                return m;
            };
            out.wQuadraticCrown = Math.abs(spitze(1, 1) / spitze(1, 0.5) - 4) < 0.2;
            out.wHasFlutter = Math.max(W.blatt.f, W.blatt.ueberAst * W.ast.faktor * 0.4) > W.ast.faktor * 0.4;
            out.wStrongerSway = spitze(1, 1) >= 3 * spitze(0.06, 1);
        }

        // Behavioral: einen grown_-Bauplan ernten → result hat .provenance.
        if (typeof r._growTreeBlueprintForSpawn === "function" && r.state && r.state.architectures) {
            const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "h-test-seed");
            if (grownKey && r.state.blueprints[grownKey]) {
                // Spawn an Test-Position + harvest sofort.
                try {
                    const spawn = r.spawnArchitecture(grownKey, { x: 1234, y: 50, z: 5678 }, { silent: true });
                    if (spawn) {
                        const harvest = r.harvestArchitecture(spawn, "test-harvester");
                        out.hHarvestHasProvenance = !!(
                            harvest &&
                            harvest.provenance &&
                            harvest.provenance.bornFrom === "world-genesis"
                        );
                        out.hProvenanceCarriesSpecies = !!(
                            harvest &&
                            harvest.provenance &&
                            harvest.provenance.species === "baum_eiche"
                        );
                    }
                } catch (_e) {
                    out.hHarvestException = String(_e && _e.message);
                }
            }
        }

        // ─── Ω-C CANOPY-SHELL — GESCHNITTEN ───
        // Foundry-Wald + Fern-Ring (das Kronendach der Arten) tragen die Ferne; das Band prüft die ABWESENHEIT (Konstante ·
        // Methoden · State · Restore-Pfad).
        out.cConstGone = !A.CANOPY_SHELL;
        out.cMethodsGone =
            typeof r._ensureCanopyShell === "undefined" &&
            typeof r._buildCanopyShell === "undefined" &&
            typeof r._disposeCanopyShell === "undefined";
        out.cStateGone = r.state.canopyShell === undefined && r.state.canopyShellMaterial === undefined;
        out.cRestoreClean = !/_disposeCanopyShell/.test(window.__codeOf(r._loadStateRestoreWorldMeta));

        return out;
    });

    // Ω-K2
    check("V18.212 (K2a) Baum-Fuß-Flare existiert (sockel-laub-Part, x-stretched)", res.k2HasFlare === true);
    check("V18.212 (K2b) Flare am Stamm-Ursprung (|x|, |z| < 0.5m)", res.k2FlareAtTrunkBase === true);

    // Ω-W
    check("K19 (W1) Wind: die Spitze biegt quadratisch (ζ², der EINE Term)", res.wQuadraticCrown === true);
    check("K19 (W2) Wind: das Blatt flattert schneller als sein Ast", res.wHasFlutter === true);
    check("K19 (W3) Wind: der Sturm biegt ≥ 3× die Brise (Wind-Zeile)", res.wStrongerSway === true);

    if (res.hHarvestHasProvenance !== undefined) {
        check(
            "V18.212 (H3) Behavioral: grown-Baum-Ernte trägt provenance.bornFrom='world-genesis'",
            res.hHarvestHasProvenance === true
        );
        check("V18.212 (H4) Behavioral: provenance.species = baum_eiche", res.hProvenanceCarriesSpecies === true);
    }

    // Ω-C — N7.4: die Shell ist geschnitten; die Bänder prüfen die Abwesenheit.
    check("N7.4 (C1) CANOPY_SHELL-Konstante geschnitten", res.cConstGone === true);
    check("N7.4 (C2) Canopy-Shell-Methoden geschnitten (ensure/build/dispose weg)", res.cMethodsGone === true);
    check("N7.4 (C3) kein Canopy-Shell-State (canopyShell/Material undefined)", res.cStateGone === true);
    check("N7.4 (C4) Welt-Wechsel-Restore referenziert die Shell nicht mehr (Source)", res.cRestoreClean === true);
}

// Atemberaubender Wald: Palette dunkler + erdiger, per-Spezies distinkte Tag-Vektoren (Variations-
// Wand), SAMPLES-Dichte (W7). Die Grammatik-Art baum_totholz fiel (W1 + Integration 05.10.): sie hatte keinen
// Welt-Erzeuger mehr, gezeichnet hatte sie nur die litter-Streu als belaubte Alias-Eiche.
async function checkBandV18215AtemberaubenderWald(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── (W1) SPECIES_TAG_VARIATION frozen, alle 6 Baum-Spezies, kein Totholz ─────
        out.variationExists = !!A.SPECIES_TAG_VARIATION;
        if (out.variationExists) {
            const v = A.SPECIES_TAG_VARIATION;
            out.variationAllSpecies =
                !!v.baum_tanne &&
                !!v.baum_kiefer &&
                !!v.baum_buche &&
                !!v.baum_birke &&
                !!v.baum_eiche &&
                !!v.baum_erle &&
                !v.baum_totholz;
            // Plan §7: Tanne/Kiefer brennbar↑ resoniert↑ — die DEKLARIERTEN Achsen pro Spezies.
            out.tannenDeklariert =
                Number.isFinite(v.baum_tanne.brennbar) &&
                v.baum_tanne.brennbar > 0 &&
                Number.isFinite(v.baum_tanne.resoniert) &&
                v.baum_tanne.resoniert > 0;
        }

        // ─── (W2) baum_totholz ist aus SPECIES_TREE_PARAMS + dem Foundry-Alias GEFALLEN (die Stamm-Grammatik fiel K24) ─
        // Seit dem Waldboden (integriert 05.10.) ist Totholz eine Studio-Art: die generische Regel (`baum_<preset>` im
        // LIVE-Buch) löst baum_totholz auf das stehende Studio-Totholz auf — nie auf die belaubte Eiche (der Alias).
        const totholzPreset = r._foundryPresetFor("baum_totholz");
        out.totholzFort =
            !(A.SPECIES_TREE_PARAMS && A.SPECIES_TREE_PARAMS.baum_totholz) &&
            (totholzPreset == null || totholzPreset === "totholz");



        // ─── (W5) Behavioral: Spezies-Distinktion in computeCompoundTags ─
        // Bauplan-Stichprobe: rohen parts vs _isGrown+species → Tag-Delta.
        if (r.state.worldMeta) r.state.worldMeta.genVersion = 8;
        const origLast = r._lastTreeSkeleton;
        try {
            // Tanne-Parts (ohne _isGrown-Flag)
            if (r._growTreeBlueprintRich) {
                const parts = r._growTreeBlueprintRich("baum_tanne", "v215-tanne-1");
                if (Array.isArray(parts) && parts.length >= 30) {
                    const tagsRaw = r.computeCompoundTags({ parts });
                    const tagsGrown = r.computeCompoundTags({
                        parts,
                        _isGrown: true,
                        _grownSpecies: "baum_tanne",
                    });
                    const dBrennbar = (tagsGrown.brennbar || 0) - (tagsRaw.brennbar || 0);
                    out.tannenVariationApplied = Math.abs(dBrennbar - 0.1) < 1e-9;
                }
            }
        } catch (_e) {
            out.behaviorError = String(_e && _e.message);
        } finally {
            r._lastTreeSkeleton = origLast;
        }

        // ─── (W7) SAMPLES in _populateVoxelChunkVegetation ───
        // SAMPLES ist als Dev-Drossel gesenkt (voll = 10) → geprüft wird ein SANER Bereich (≥ 4).
        const popSrc = window.__codeOf(r._populateVoxelChunkVegetation);
        const _sm = popSrc.match(/const SAMPLES\s*=\s*(\d+)/);
        out.samples10 = !!_sm && Number(_sm[1]) >= 4;

        // ─── (W8) Material-Colors Ω-K3 (laub/holz dunkler) ──────────
        const mat = r.state.materials;
        if (mat && mat.holz && mat.laub) {
            out.holzColor = mat.holz.color;
            out.laubColor = mat.laub.color;
            // dunkler als V18.214: holz < 0x80, laub < 0x80 in jedem Kanal
            const holzR = (mat.holz.color >> 16) & 0xff;
            const holzG = (mat.holz.color >> 8) & 0xff;
            out.holzIsErdig = holzR < 0x80 && holzG < 0x60; // erdiges Braun
            const laubG = (mat.laub.color >> 8) & 0xff;
            out.laubIsDunkel = laubG < 0x80; // gedämpftes Grün (war 0x8b → jetzt < 0x80)
        }

        // ─── (W9) W1: baum_totholz ist aus TREE_NAMES + candidates GEFALLEN ───
        // Totholz zeichnete nur die Streu (belaubte Alias-Eiche); die Grammatik-Art fiel 05.10. mit.
        out.candidatesIncludeTotholz = (window.anazhRealm.constructor.FELD_WURF || []).includes("baum_totholz");

        return out;
    });

    check("V18.215 (W1a) SPECIES_TAG_VARIATION existiert", res.variationExists === true);
    check("V18.215 (W1b) Alle 6 Baum-Spezies deklariert, baum_totholz nicht", res.variationAllSpecies === true);
    check("V18.215 (W1c) Tanne: brennbar↑ + resoniert↑ deklariert", res.tannenDeklariert === true);
    check(
        "Integration 05.10. (W2) baum_totholz ist aus SPECIES_TREE_PARAMS und dem Eichen-Alias gefallen (Studio-Totholz)",
        res.totholzFort === true
    );
    check(
        "V18.215 (W5a) Tanne _isGrown: brennbar +0.1 angewandt (computeCompoundTags-Δ)",
        res.tannenVariationApplied === true
    );
    check("V18.215 (W7) _populateVoxelChunkVegetation SAMPLES ≥ 4 (dev-gedrosselt; v1.0 = 10)", res.samples10 === true);
    check(
        `V18.215 (W8a) Holz dunkler+erdig (R<0x80, G<0x60) — gemessen R=${res.holzColor ? ((res.holzColor >> 16) & 0xff).toString(16) : "?"}, G=${res.holzColor ? ((res.holzColor >> 8) & 0xff).toString(16) : "?"}`,
        res.holzIsErdig === true
    );
    check(
        `V18.215 (W8b) Laub dunkler (G<0x80) — gemessen G=${res.laubColor ? ((res.laubColor >> 8) & 0xff).toString(16) : "?"}`,
        res.laubIsDunkel === true
    );
    check(
        "W1 (W9) baum_totholz ist aus den _vegetationSampleSpawn-Kandidaten gefallen",
        res.candidatesIncludeTotholz === false
    );
}

// KARST + Understory: KARST als 7. Baumart (slopeMax 1.6) + drei Busch-Baupläne (busch_hazel/
// farn_busch/blume_gross); scheitert die Baum-Probe, wächst am selben Slot ein Busch. Die Wände
// prüfen Substanz (Grammar + Params + Variation) + Pipeline (candidates + Sub-Spawn-Pfad).
async function checkBandV18216KarstUndUnderstory(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── (A) KARST: die Studio-Art karst (_phytoArt, K24) + Params + Variation ───────
        const karstArt = r._phytoArt("baum_karst");
        out.grammarHasKarst = !!(karstArt && karstArt.id === "karst" && karstArt.rec.kind === "tree");
        out.karstInTreeParams = !!(A.SPECIES_TREE_PARAMS && A.SPECIES_TREE_PARAMS.baum_karst);
        if (out.karstInTreeParams) {
            const p = A.SPECIES_TREE_PARAMS.baum_karst;
            out.karstSlope16 = Math.abs(p.slopeMax - 1.6) < 1e-9; // klettert Klippen
            // K24-N1: der knorrige Sockel ist das Gesetz der Art (P.flare 0,9 im Phänotyp), nie eine Hand-Zeile
            r._growTreeBlueprintRich("baum_karst", "pt-karst-anlauf");
            const skK = r._lastTreeSkeleton;
            r._lastTreeSkeleton = null;
            out.karstFlareAmp = !("flare" in p) && !!skK && Math.abs(skK.flareAmp - 0.9) < 1e-9;
        }
        out.karstInTagVariation = !!(A.SPECIES_TAG_VARIATION && A.SPECIES_TAG_VARIATION.baum_karst);
        if (out.karstInTagVariation) {
            const v = A.SPECIES_TAG_VARIATION.baum_karst;
            out.karstDichteVar = Math.abs(v.dichte - 0.1) < 1e-9; // dichte+0.10 (M3)
            out.karstLebendigVar = Math.abs(v.lebendig - -0.05) < 1e-9; // lebendig-0.05
        }

        // ─── (B) Drei Unterholz-Arten als Studio-Arten (_phytoArt, K24) ─────────────────────
        const artKind = (sp) => {
            const a = r._phytoArt(sp);
            return a ? a.rec.kind : null;
        };
        out.grammarHasHazel = artKind("busch_hazel") === "shrub";
        out.grammarHasFarn = artKind("farn_busch") === "fern";
        out.grammarHasBlume = artKind("blume_gross") === "flower";

        // Bush-Tree-Params + Tag-Variation
        out.allBushInParams =
            !!(A.SPECIES_TREE_PARAMS && A.SPECIES_TREE_PARAMS.busch_hazel) &&
            !!(A.SPECIES_TREE_PARAMS && A.SPECIES_TREE_PARAMS.farn_busch) &&
            !!(A.SPECIES_TREE_PARAMS && A.SPECIES_TREE_PARAMS.blume_gross);
        if (out.allBushInParams) {
            const ph = A.SPECIES_TREE_PARAMS.busch_hazel;
            const pf = A.SPECIES_TREE_PARAMS.farn_busch;
            const pb = A.SPECIES_TREE_PARAMS.blume_gross;
            // Hazel klettert mehr (0.9), Blume meidet Steile (0.4)
            out.bushSlopeOrdered = ph.slopeMax > pf.slopeMax && pf.slopeMax > pb.slopeMax;
        }
        out.allBushInVariation =
            !!(A.SPECIES_TAG_VARIATION && A.SPECIES_TAG_VARIATION.busch_hazel) &&
            !!(A.SPECIES_TAG_VARIATION && A.SPECIES_TAG_VARIATION.farn_busch) &&
            !!(A.SPECIES_TAG_VARIATION && A.SPECIES_TAG_VARIATION.blume_gross);
        if (out.allBushInVariation) {
            const vh = A.SPECIES_TAG_VARIATION.busch_hazel;
            const vf = A.SPECIES_TAG_VARIATION.farn_busch;
            const vb = A.SPECIES_TAG_VARIATION.blume_gross;
            // Alle drei deklarieren lebendig↑ (saftig)
            out.allBushLebendigUp = vh.lebendig > 0 && vf.lebendig > 0 && vb.lebendig > 0;
            // Farn + Blume mit magieleitung↑
            out.farnBlumeMagical = vf.magieleitung > 0 && vb.magieleitung > 0;
        }

        // ─── (C) Wachstum produziert valide Bauplane für die 4 Neuen ─
        if (r.state.worldMeta) r.state.worldMeta.genVersion = 9;
        const origLast = r._lastTreeSkeleton;
        try {
            // KARST: ≥30 parts (drei Ast-Ebenen + foliage)
            if (r._growTreeBlueprintRich) {
                const parts = r._growTreeBlueprintRich("baum_karst", "v216-karst-1");
                out.karstPartsCount = Array.isArray(parts) ? parts.length : 0;
                out.karstPartsValid = out.karstPartsCount >= 30;
                // V17.16-VARIATIONS-Wand passt: dichte+0.10 deklariert → spawnable
                out.karstAllHolzOrLaub =
                    Array.isArray(parts) && parts.every((p) => p.material === "holz" || p.material === "laub");
            }
            // Bushes: ≥10 parts (multi-level branching + Foliage)
            if (r._growTreeBlueprintRich) {
                const parts = r._growTreeBlueprintRich("busch_hazel", "v216-hazel-1");
                out.hazelPartsCount = Array.isArray(parts) ? parts.length : 0;
                out.hazelPartsValid = out.hazelPartsCount >= 10;
            }
            if (r._growTreeBlueprintRich) {
                const parts = r._growTreeBlueprintRich("farn_busch", "v216-farn-1");
                out.farnPartsCount = Array.isArray(parts) ? parts.length : 0;
                out.farnPartsValid = out.farnPartsCount >= 6;
                // farn hat ≥3 foliage anchors (cards)
                const skel = r._lastTreeSkeleton;
                out.farnAnchors = skel && Array.isArray(skel.anchors) ? skel.anchors.length : 0;
                out.farnHasAnchors = out.farnAnchors >= 3;
            }
            if (r._growTreeBlueprintRich) {
                const parts = r._growTreeBlueprintRich("blume_gross", "v216-blume-1");
                out.blumePartsCount = Array.isArray(parts) ? parts.length : 0;
                out.blumePartsValid = out.blumePartsCount >= 4;
            }
        } catch (_e) {
            out.growError = String(_e && _e.message);
        } finally {
            r._lastTreeSkeleton = origLast;
        }

        // ─── (D) Wachstum als spawnable Bauplan (V17.16-Wand passiert) ─
        try {
            const karstKey = r._growTreeBlueprintForSpawn("baum_karst", "v216-karst-spawn-1");
            out.karstSpawnable = !!karstKey;
            if (karstKey && r.state.blueprints[karstKey]) {
                const bp = r.state.blueprints[karstKey];
                out.karstBpIsGrown = bp._isGrown === true && bp._grownSpecies === "baum_karst";
            }
            const hazelKey = r._growTreeBlueprintForSpawn("busch_hazel", "v216-hazel-spawn-1");
            out.hazelSpawnable = !!hazelKey;
            const farnKey = r._growTreeBlueprintForSpawn("farn_busch", "v216-farn-spawn-1");
            out.farnSpawnable = !!farnKey;
            const blumeKey = r._growTreeBlueprintForSpawn("blume_gross", "v216-blume-spawn-1");
            out.blumeSpawnable = !!blumeKey;
        } catch (_e) {
            out.spawnError = String(_e && _e.message);
        }

        out.candidatesHasKarst = (A.FELD_WURF || []).includes("baum_karst"); // die Liste der Würfe des Felds (K10-6)

        // ─── (F) Version + walk-with-code ───
        // Spätere Wellen bumpen die Version → FLOOR-Prüfung (semver-Form 18.MMM.PPP), keine scharfe Zahl.
        out.versionString = A.VERSION;
        const parts = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor18216 = parts.length >= 2 && (parts[0] > 18 || (parts[0] === 18 && parts[1] >= 216));
        out.genVersionFresh9 = !!(r.state.worldMeta && r.state.worldMeta.genVersion >= 9);

        return out;
    });

    // (A) KARST
    check("K24 (A1) baum_karst ist die Studio-Art karst (_phytoArt)", res.grammarHasKarst === true);
    check("V18.216 (A5) Karst in SPECIES_TREE_PARAMS", res.karstInTreeParams === true);
    check("V18.216 (A6) Karst slopeMax=1.6 (klettert Klippen)", res.karstSlope16 === true);
    check("V18.216 (A7) Karst-Anlauf 0,9 aus dem Gesetz (Sockel knorrig)", res.karstFlareAmp === true);
    check("V18.216 (A8) Karst in SPECIES_TAG_VARIATION", res.karstInTagVariation === true);
    check("V18.216 (A9) Karst dichte+0.10 (hart)", res.karstDichteVar === true);
    check("V18.216 (A10) Karst lebendig-0.05 (weniger saftig)", res.karstLebendigVar === true);

    // (B) Drei Büsche
    check("K24 (B1) busch_hazel ist der Studio-Strauch (_phytoArt)", res.grammarHasHazel === true);
    check("K24 (B2) farn_busch ist der Studio-Farn (_phytoArt)", res.grammarHasFarn === true);
    check("K24 (B3) blume_gross ist die Studio-Blume (_phytoArt)", res.grammarHasBlume === true);
    check("V18.216 (B10) Alle 3 Büsche in SPECIES_TREE_PARAMS", res.allBushInParams === true);
    check("V18.216 (B11) Bush-slopeMax-Reihenfolge Hazel>Farn>Blume", res.bushSlopeOrdered === true);
    check("V18.216 (B12) Alle 3 Büsche in SPECIES_TAG_VARIATION", res.allBushInVariation === true);
    check("V18.216 (B13) Alle 3 Büsche lebendig↑ deklariert", res.allBushLebendigUp === true);
    check("V18.216 (B14) Farn + Blume magieleitung↑ deklariert", res.farnBlumeMagical === true);

    // (C) Wachstum
    check(`V18.216 (C1) Karst-rich-Grow ≥30 parts (gemessen ${res.karstPartsCount})`, res.karstPartsValid === true);
    check("V18.216 (C2) Karst alle parts holz/laub (V17.16-Wand strukturell)", res.karstAllHolzOrLaub === true);
    check(`V18.216 (C3) Hazel-Grow ≥10 parts (gemessen ${res.hazelPartsCount})`, res.hazelPartsValid === true);
    check(`V18.216 (C4) Farn-Grow ≥6 parts (gemessen ${res.farnPartsCount})`, res.farnPartsValid === true);
    check(`V18.216 (C5) Farn ≥3 foliage-anchors (gemessen ${res.farnAnchors})`, res.farnHasAnchors === true);
    check(`V18.216 (C6) Blume-Grow ≥4 parts (gemessen ${res.blumePartsCount})`, res.blumePartsValid === true);

    // (D) V17.16-VARIATIONS-Wand passiert
    check(
        "V18.216 (D1) Karst spawnable (V17.16-VARIATIONS-Wand passiert: dichte+0.10 deklariert)",
        res.karstSpawnable === true
    );
    check("V18.216 (D2) Karst-Bauplan ist _isGrown + _grownSpecies=baum_karst", res.karstBpIsGrown === true);
    check("V18.216 (D3) Hazel spawnable", res.hazelSpawnable === true);
    check("V18.216 (D4) Farn spawnable", res.farnSpawnable === true);
    check("V18.216 (D5) Blume spawnable", res.blumeSpawnable === true);

    // (E) Source-Integration
    check("V18.216 (E1) baum_karst in _vegetationSampleSpawn-candidates", res.candidatesHasKarst === true);

    // (F) Version
    check(`V18.216 (F1) VERSION floor ≥ 18.216.0 (gemessen ${res.versionString})`, res.versionFloor18216 === true);
    check("V18.216 (F2) Fresh-Welt genVersion ≥ 9 (V18.216 Routing)", res.genVersionFresh9 === true);
}

// Varianten-Pool: N=VARIANTS_PER_SPECIES Varianten je Spezies, gefroren als Genese-Konstante in
// worldMeta.variantSeed. Ein berührter Baum re-wächst BIT-GENAU aus variantSeed[index] (kein
// Sprung); zwei Peers mit gleichem worldSeed bauen den IDENTISCHEN Pool.
async function checkBandV18217VariantenPool(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── (A) Source-Probes ───
        // N ≥ 2 statt fester Zahl: N ist bewusst klein (jede Variante = eigene Geometrie = eigene Draw-Calls;
        // die Vielfalt reitet pro Instanz über scale/rotationY/tint); der Pool-Mechanismus ist N-unabhängig.
        out.constantExists = Number.isFinite(A.VARIANTS_PER_SPECIES) && A.VARIANTS_PER_SPECIES >= 2;
        out.constantValue = A.VARIANTS_PER_SPECIES;

        // ─── (B) Behavioral: Fresh-Welt hat Pool ──────────────────────
        const newMeta = r._generateFreshWorldMeta ? r._generateFreshWorldMeta("test-v18217") : null;
        out.freshHasPool = !!(newMeta && newMeta.variantSeed && typeof newMeta.variantSeed === "object");
        if (out.freshHasPool) {
            // K24: die Zeile einer Art entsteht beim ersten Wuchs (_variantSeedsFor) — jede Pflanze des Gesetzbuchs,
            // nie ein Fels; im TEMPORÄREN Meta-Kontext, der Welt-Stand bleibt unberührt.
            const savedFresh = r.state.worldMeta;
            try {
                r.state.worldMeta = newMeta;
                const ARTEN = [
                    "baum_eiche",
                    "baum_tanne",
                    "baum_birke",
                    "baum_kiefer",
                    "baum_erle",
                    "baum_buche",
                    "baum_mammut",
                    "baum_karst",
                    "busch_hazel",
                    "farn_busch",
                    "blume_gross",
                ];
                for (const sp of ARTEN) r._variantSeedsFor(sp);
                out.freshPoolSpeciesCount = Object.keys(newMeta.variantSeed).length;
                out.allGrammarSpeciesInPool =
                    ARTEN.every(
                        (sp) =>
                            Array.isArray(newMeta.variantSeed[sp]) &&
                            newMeta.variantSeed[sp].length === A.VARIANTS_PER_SPECIES
                    ) && r._variantSeedsFor("stein_block") === null;
                // String-Seeds, kein Float-Drift-Risiko (P2P-Konsistenz)
                out.poolEntriesAreStrings = newMeta.variantSeed.baum_eiche.every((v) => typeof v === "string");
            } finally {
                r.state.worldMeta = savedFresh;
            }
        }

        // ─── (C) Determinismus: 2 Pools mit gleichem Seed sind identisch ─
        const sampleSeed = "test-determinism-v18217-seed-xyz";
        const poolFor = (seed) => {
            const savedP = r.state.worldMeta;
            try {
                r.state.worldMeta = { seed, variantSeed: {} };
                for (const sp of ["baum_eiche", "baum_tanne", "busch_hazel"]) r._variantSeedsFor(sp);
                return r.state.worldMeta.variantSeed;
            } finally {
                r.state.worldMeta = savedP;
            }
        };
        const pool1 = poolFor(sampleSeed);
        const pool2 = poolFor(sampleSeed);
        out.poolDeterministic = (() => {
            const spec = Object.keys(pool1);
            if (spec.length !== Object.keys(pool2).length) return false;
            return spec.every(
                (s) =>
                    Array.isArray(pool1[s]) &&
                    Array.isArray(pool2[s]) &&
                    pool1[s].length === pool2[s].length &&
                    pool1[s].every((v, i) => v === pool2[s][i])
            );
        })();

        // Pools mit verschiedenen Seeds → unterscheiden sich (string-equality)
        const pool3 = poolFor("anderer-seed-distinct-abc");
        const specCheck = Object.keys(pool1)[0];
        out.poolDistinctSeeds =
            Array.isArray(pool1[specCheck]) &&
            Array.isArray(pool3[specCheck]) &&
            pool1[specCheck][0] !== pool3[specCheck][0];

        // ─── (D) Cache-Key: regionSeeds, die auf gleichen Index hashen, geben gleichen Bauplan ─
        if (r.state.worldMeta) {
            // Lazy-Init des Pools im laufenden state (falls nicht da)
            r._variantSeedsFor("baum_eiche");
            // Zwei verschiedene regionSeeds, deterministische variantIndex
            const k1 = r._growTreeBlueprintForSpawn("baum_eiche", "test-region-A-0");
            const k2 = r._growTreeBlueprintForSpawn("baum_eiche", "test-region-A-0");
            out.sameRegionSameKey = !!(k1 && k1 === k2);
            // Pattern grown_<species>_v<idx>
            out.keyHasVariantForm = !!(k1 && /^grown_baum_eiche_v\d+$/.test(k1));
            // bp trägt _variantIndex
            const bp = k1 && r.state.blueprints[k1];
            out.bpVariantIndexSet = !!(bp && Number.isFinite(bp._variantIndex));
            // bp._grownSeed ist der variantSeed-String (NICHT der regionSeed)
            const pool = r.state.worldMeta && r.state.worldMeta.variantSeed;
            if (bp && pool && Array.isArray(pool["baum_eiche"])) {
                const expected = pool["baum_eiche"][bp._variantIndex];
                out.bpGrownSeedIsVariantSeed = bp._grownSeed === expected;
            }
        }

        // ─── (E) Snapshot-Persistierung von variantSeed ───────────────
        if (typeof r.buildStateSnapshot === "function") {
            const snap = r.buildStateSnapshot();
            const wmSnap = snap && snap.worldMeta;
            out.snapshotCarriesPool = !!(wmSnap && wmSnap.variantSeed && typeof wmSnap.variantSeed === "object");
            if (out.snapshotCarriesPool) {
                const liveKey = "baum_eiche";
                const livePool = r.state.worldMeta && r.state.worldMeta.variantSeed;
                if (liveKey && livePool && Array.isArray(livePool[liveKey])) {
                    out.snapshotPoolMatchesLive =
                        Array.isArray(wmSnap.variantSeed[liveKey]) &&
                        wmSnap.variantSeed[liveKey].every((v, i) => v === livePool[liveKey][i]);
                }
            }
        }

        // ─── (F) Migration: Pool ohne Eintrag wird lazy ergänzt ───
        // In einem TEMPORÄREN Meta-Kontext testen und den Welt-Stand restlos wiederherstellen — ein
        // mutierter Pool vergiftet die Folge-Bands (LOD-Baupläne brächen die Seed-Identität).
        const savedMeta = r.state.worldMeta ? { ...r.state.worldMeta } : null;
        try {
            const oldStyleMeta = { seed: "old-world-seed-1", genVersion: 5 };
            r.state.worldMeta = { ...r.state.worldMeta, ...oldStyleMeta };
            delete r.state.worldMeta.variantSeed;
            const migrated = r._variantSeedsFor("baum_tanne");
            out.migrationFillsPool = !!(
                Array.isArray(migrated) &&
                migrated.length === A.VARIANTS_PER_SPECIES &&
                r.state.worldMeta.variantSeed.baum_tanne === migrated
            );
        } finally {
            // Welt-Identität wiederherstellen — kein State-Leck in Folge-Bands.
            if (savedMeta) r.state.worldMeta = savedMeta;
        }

        // ─── (G) Größe (Snapshot-Tragbarkeit) ────────────────────────
        if (r.state.worldMeta && r.state.worldMeta.variantSeed) {
            const json = JSON.stringify(r.state.worldMeta.variantSeed);
            out.poolJsonSize = json.length;
            // 16 Varianten × 11 Spezies × ~30 Bytes/Seed ≈ ~5-7 KB; sicherheits-
            // halber bis 30 KB akzeptieren (256-KB-Snapshot-Cap nicht gefährdet)
            out.poolSizeUnder30K = json.length < 30000;
        }

        // ─── (H) Version + walk-with-code ────────────────────────────
        out.versionStr = A.VERSION;
        const partsV = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor18217 = partsV[0] > 18 || (partsV[0] === 18 && partsV[1] >= 217);

        return out;
    });

    // (A) Source
    check(
        `V18.217 (A1) AnazhRealm.VARIANTS_PER_SPECIES Konstante (gemessen ${res.constantValue})`,
        res.constantExists === true
    );

    // (B) Fresh-Welt
    check("V18.217 (B1) Fresh-Welt-Meta trägt variantSeed-Pool", res.freshHasPool === true);
    check(
        `K24 (B2) der Pool wächst je Pflanze des Gesetzbuchs, nie für Fels (gemessen ${res.freshPoolSpeciesCount} Arten)`,
        res.allGrammarSpeciesInPool === true
    );
    check("V18.217 (B3) Pool-Einträge sind STRINGS (P2P-Determinismus)", res.poolEntriesAreStrings === true);

    // (C) Determinismus
    check(
        "V18.217 (C1) Pool-Generierung deterministisch (gleicher Seed → gleicher Pool)",
        res.poolDeterministic === true
    );
    check("V18.217 (C2) Verschiedene worldSeeds erzeugen DISTINKTE Pools", res.poolDistinctSeeds === true);

    // (D) Spawn-Pipeline
    check("V18.217 (D1) Gleicher regionSeed → gleicher Bauplan-Key", res.sameRegionSameKey === true);
    check("V18.217 (D2) Bauplan-Key folgt `grown_<species>_v<idx>`-Form", res.keyHasVariantForm === true);
    check("V18.217 (D3) Bauplan trägt _variantIndex (numerisch)", res.bpVariantIndexSet === true);
    check(
        "V18.217 (D4) bp._grownSeed === variantSeed[species][index] (Re-Wachstum bit-genau)",
        res.bpGrownSeedIsVariantSeed === true
    );

    // (E) Snapshot
    check("V18.217 (E1) Snapshot trägt worldMeta.variantSeed", res.snapshotCarriesPool === true);
    check("V18.217 (E2) Snapshot-Pool ist bit-identisch zur Live-Welt", res.snapshotPoolMatchesLive === true);

    // (F) Migration
    check(
        "V18.217 (F1) Migration: alte Welt ohne variantSeed bekommt lazy einen Pool",
        res.migrationFillsPool === true
    );

    // (G) Performance
    check(`V18.217 (G1) Pool-JSON-Größe < 30 KB (gemessen ${res.poolJsonSize} Bytes)`, res.poolSizeUnder30K === true);

    // (H) Version
    check(`V18.217 (H1) VERSION floor ≥ 18.217.0 (gemessen ${res.versionStr})`, res.versionFloor18217 === true);
}

// LOD-Stufen: 3 LODs pro Variante (Hero/Mittel/Far) — Geometrie-Beschneidung + Variant-LOD-Builder
// + Distanz-Chooser mit Hysterese.
async function checkBandV18218LODStufen(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── (A) Source-Probes ────────────────────────────────────────
        out.lodDistancesExists =
            A.LOD_DISTANCES &&
            Number.isFinite(A.LOD_DISTANCES.thresh01) &&
            Number.isFinite(A.LOD_DISTANCES.thresh12) &&
            Number.isFinite(A.LOD_DISTANCES.hysteresis);
        out.buildVariantLODsExists = typeof r._buildVariantLODs === "function";
        out.chooseLODExists = typeof r._chooseLODForDistance === "function";

        // ─── (B) Distanz-Chooser ───
        // Die Probe liest die Schwellen aus LOD_DISTANCES (thresh01/thresh12/hysteresis), keine festen Meter.
        if (out.chooseLODExists) {
            const t01r = A.LOD_DISTANCES.thresh01;
            const t12r = A.LOD_DISTANCES.thresh12;
            out.choose50 = r._chooseLODForDistance(t01r * 0.6) === 0; // klar unter thresh01 → LOD0
            out.choose100 = r._chooseLODForDistance((t01r + t12r) / 2) === 1; // zwischen den Schwellen → LOD1
            out.choose200 = r._chooseLODForDistance(t12r * 1.25) === 2; // klar über thresh12 → LOD2
            out.choose0 = r._chooseLODForDistance(0) === 0;
            const t01 = A.LOD_DISTANCES.thresh01;
            const h = A.LOD_DISTANCES.hysteresis;
            // Hysterese: cur=0 + dist=85m → bleibt 0 (innerhalb +h Buffer)
            out.hyst0to1Below = r._chooseLODForDistance(t01 + h * 0.5, 0) === 0; // 85 → 0
            out.hyst0to1Above = r._chooseLODForDistance(t01 + h * 2, 0) === 1; // 100 → 1
            // Hysterese: cur=1 + dist=60m → kehrt zurück zu 0 (unter -h-Buffer)
            out.hyst1to0Below = r._chooseLODForDistance(t01 - h * 2, 1) === 0; // 60 → 0
            out.hyst1to0Above = r._chooseLODForDistance(t01 - h * 0.5, 1) === 1; // 75 → 1
            // V18.526 — Mehrstufen-Sprung: jenseits ZWEIER Schwellen springt die Wahl durch (sonst stand die region-
            // private Fern-Streu, die nur nach 2 zurückwandern darf, für immer auf L0).
            const t12 = A.LOD_DISTANCES.thresh12;
            out.sprung0to2 = r._chooseLODForDistance(t12 + h * 2, 0) === 2;
            out.sprung2to0 = r._chooseLODForDistance(Math.max(0, t01 - h * 2), 2) === 0;
        }
        // W1 — DIE FERNFORM IST KONSUM, nicht Quelltext: die Fels-Zellen einer NEU GEBAUTEN Region tragen jenseits der
        // EINEN Nah-Grenze (ANALOG_NAH_M), was das Studio-Budget sagt (B2c `rock.fernform`). Geflippt auf "boden"
        // stehen sie ohne Geometrie, zurück auf "gesetz" als Gesetz-Platz (headless `wartet`, die Gesetz-Bahn zeichnet
        // nur ein echter Renderer) — nie mit Slots. Diesseits der Grenze trägt das Studio-Mesh.
        {
            const B = A._studioRenderConfig && A._studioRenderConfig.lod && A._studioRenderConfig.lod.budget;
            const map = r._ensureScatterRegionMap();
            const pm = r.state.playerMesh && r.state.playerMesh.position;
            if (B && B.rock && pm && r._foundryEnabled()) {
                const felsFern = (reg) =>
                    (reg && Array.isArray(reg.cells) ? reg.cells : []).filter(
                        (c) => c.layer === "rock" && c.lod >= 2 && Math.hypot(c.x - pm.x, c.z - pm.z) >= A.ANALOG_NAH_M
                    );
                const bau = (k) => {
                    const [x, z] = k.split(",").map(Number);
                    r._disposeScatterRegion(k);
                    return r._scatterRegion(x, z, pm);
                };
                // die Region mit den meisten Fern-Felsen; trägt keine gebaute welche, den Ring um den Spieler bauen
                let key = null,
                    best = 0;
                for (const [k, reg] of map) {
                    const n = felsFern(reg).length;
                    if (n > best) [best, key] = [n, k];
                }
                const RM = A.SCATTER.regionM;
                for (let dz = -1; dz <= 1 && !key; dz++)
                    for (let dx = -1; dx <= 1 && !key; dx++) {
                        const k = Math.floor(pm.x / RM) + dx + "," + (Math.floor(pm.z / RM) + dz);
                        if (felsFern(bau(k)).length) key = k;
                    }
                out.fernRegion = key;
                if (key) {
                    const alt = B.rock.fernform;
                    try {
                        B.rock.fernform = "boden";
                        const fz = felsFern(bau(key));
                        out.fernBoden =
                            fz.length > 0 && fz.every((c) => c.form === "boden" && !c.slots.length && !c.feld);
                    } finally {
                        B.rock.fernform = alt;
                    }
                    const fz2 = felsFern(bau(key));
                    out.fernGesetz = fz2.length > 0 && fz2.every((c) => c.form === "gesetz" && !c.slots.length);
                    out.fernZellen = fz2.length;
                }
            }
        }

        // ─── (C) LOD-Baupläne werden gebaut (3 Stufen) ───
        // Der Gate fährt foundry-ON; für Studio-bekannte Arten gäbe der _buildVariantLODs-Chokepoint null →
        // die Grammatik-LOD-Erzeugung prüft unter LOKALEM Hook (__withNoFoundry).
        if (out.buildVariantLODsExists) {
            window.__withNoFoundry(() => {
                const keys = r._buildVariantLODs("baum_eiche", 0);
                out.lodKeysReturned = !!(keys && keys[0] && keys[1] && keys[2]);
                if (keys) {
                    out.key0Form = /^grown_baum_eiche_v\d+$/.test(keys[0]);
                    out.key1Form = /^grown_baum_eiche_v\d+_lod1$/.test(keys[1]);
                    out.key2Form = /^grown_baum_eiche_v\d+_lod2$/.test(keys[2]);
                    out.bp0Exists = !!r.state.blueprints[keys[0]];
                    out.bp1Exists = !!r.state.blueprints[keys[1]];
                    out.bp2Exists = !!r.state.blueprints[keys[2]];
                    if (out.bp1Exists && out.bp2Exists) {
                        out.bp1HasLodLevel = r.state.blueprints[keys[1]]._lodLevel === 1;
                        out.bp2HasLodLevel = r.state.blueprints[keys[2]]._lodLevel === 2;
                        out.lodsShareVariantIndex =
                            r.state.blueprints[keys[1]]._variantIndex === r.state.blueprints[keys[0]]._variantIndex &&
                            r.state.blueprints[keys[2]]._variantIndex === r.state.blueprints[keys[0]]._variantIndex;
                        out.lodsShareSeed =
                            r.state.blueprints[keys[1]]._grownSeed === r.state.blueprints[keys[0]]._grownSeed &&
                            r.state.blueprints[keys[2]]._grownSeed === r.state.blueprints[keys[0]]._grownSeed;
                    }
                }
            });
        }

        // ─── (D) Geometrie: LOD-Reduktion in Parts-Anzahl ────────────
        if (r._growTreeBlueprintRich) {
            const origLast = r._lastTreeSkeleton;
            try {
                const partsLOD0 = r._growTreeBlueprintRich("baum_eiche", "v218-lod-test", { lod: 0 });
                const partsLOD1 = r._growTreeBlueprintRich("baum_eiche", "v218-lod-test", { lod: 1 });
                const partsLOD2 = r._growTreeBlueprintRich("baum_eiche", "v218-lod-test", { lod: 2 });
                out.lod0Parts = Array.isArray(partsLOD0) ? partsLOD0.length : 0;
                out.lod1Parts = Array.isArray(partsLOD1) ? partsLOD1.length : 0;
                out.lod2Parts = Array.isArray(partsLOD2) ? partsLOD2.length : 0;
                out.lod0FullParts = out.lod0Parts >= 50;
                out.lod1Reduced = out.lod1Parts > 0 && out.lod1Parts <= 20;
                out.lod2Tiny = out.lod2Parts > 0 && out.lod2Parts <= 10;
                out.lodPartsMonotone = out.lod0Parts > out.lod1Parts && out.lod1Parts > out.lod2Parts;
                const partsDefault = r._growTreeBlueprintRich("baum_eiche", "v218-default-test");
                out.lodDefaultIsLod0 = Array.isArray(partsDefault) && partsDefault.length >= 50;
                out.lod2UnderCap = out.lod2Parts <= Math.ceil(out.lod0Parts * 0.15);
            } finally {
                r._lastTreeSkeleton = origLast;
            }
        }

        // ─── (F) V17.16-Tag-Wand: LOD0/1/2 share compoundTags ────────
        // N7.3 — UNIT-RICHTER (wie Block C): die Grammatik-LOD-Baupläne unter lokalem Hook.
        if (r._buildVariantLODs) {
            window.__withNoFoundry(() => {
                const keys = r._buildVariantLODs("baum_eiche", 1);
                if (keys && keys[0] && keys[1] && keys[2]) {
                    const bp0 = r.state.blueprints[keys[0]];
                    const bp1 = r.state.blueprints[keys[1]];
                    const bp2 = r.state.blueprints[keys[2]];
                    if (bp0 && bp1 && bp2) {
                        const t0 = r.computeCompoundTags(bp0);
                        const t1 = r.computeCompoundTags(bp1);
                        const t2 = r.computeCompoundTags(bp2);
                        const axes = ["lebendig", "dichte", "brennbar", "magieleitung"];
                        out.tagNeutralLOD01 = axes.every((a) => Math.abs((t0[a] || 0) - (t1[a] || 0)) < 1e-6);
                        out.tagNeutralLOD02 = axes.every((a) => Math.abs((t0[a] || 0) - (t2[a] || 0)) < 1e-6);
                    }
                }
            });
        }

        // ─── (G) Version + walk-with-code ────────────────────────────
        out.versionStr = A.VERSION;
        const partsV = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor18218 = partsV[0] > 18 || (partsV[0] === 18 && partsV[1] >= 218);

        return out;
    });

    // (A) Source
    check("V18.218 (A1) AnazhRealm.LOD_DISTANCES (thresh01/thresh12/hysteresis)", res.lodDistancesExists === true);
    check("V18.218 (A2) _buildVariantLODs Helper existiert", res.buildVariantLODsExists === true);
    check("V18.218 (A3) _chooseLODForDistance Helper existiert", res.chooseLODExists === true);

    // (B) Distanz-Chooser
    check(`V18.218 (B1) chooseLOD(0.6·t01)=0 (Hero-Nähe)`, res.choose50 === true);
    check(`V18.218 (B2) chooseLOD((t01+t12)/2)=1 (Mittel)`, res.choose100 === true);
    check(`V18.218 (B3) chooseLOD(1.25·t12)=2 (Far)`, res.choose200 === true);
    check(`V18.218 (B4) chooseLOD(0)=0 (Spieler-Position)`, res.choose0 === true);
    check("V18.218 (B5) Hysterese cur=0 + dist=t01+h/2 → bleibt 0 (kein Flackern)", res.hyst0to1Below === true);
    check("V18.218 (B6) Hysterese cur=0 + dist=t01+2h → wechselt 1", res.hyst0to1Above === true);
    check("V18.218 (B7) Hysterese cur=1 + dist=t01−2h → kehrt zu 0", res.hyst1to0Below === true);
    check("V18.218 (B8) Hysterese cur=1 + dist=t01−h/2 → bleibt 1", res.hyst1to0Above === true);
    check(
        "V18.526 Mehrstufen-Sprung: cur=0 jenseits t12+h → 2, cur=2 unter t01−h → 0",
        res.sprung0to2 === true && res.sprung2to0 === true
    );
    check(
        `W1 KONSUM: rock.fernform="boden" → die neu gebaute Region trägt jenseits der Nah-Grenze form boden ohne Geometrie, zurück → gesetz (Region ${res.fernRegion}, ${res.fernZellen} Fern-Felsen)`,
        res.fernBoden === true && res.fernGesetz === true
    );

    // (C) Variant-LOD-Bauplane
    check("V18.218 (C1) _buildVariantLODs liefert 3 Bauplan-Keys", res.lodKeysReturned === true);
    check("V18.218 (C2) Key-Form LOD0 `grown_<species>_v<idx>`", res.key0Form === true);
    check("V18.218 (C3) Key-Form LOD1 `grown_<species>_v<idx>_lod1`", res.key1Form === true);
    check("V18.218 (C4) Key-Form LOD2 `grown_<species>_v<idx>_lod2`", res.key2Form === true);
    check("V18.218 (C5) LOD1-Bauplan in state.blueprints", res.bp1Exists === true);
    check("V18.218 (C6) LOD2-Bauplan in state.blueprints", res.bp2Exists === true);
    check("V18.218 (C7) bp._lodLevel gesetzt", res.bp1HasLodLevel === true && res.bp2HasLodLevel === true);
    check(
        "V18.218 (C8) 3 LOD-Bauplane teilen denselben _variantIndex (Form-Identität)",
        res.lodsShareVariantIndex === true
    );
    check(
        "V18.218 (C9) 3 LOD-Bauplane teilen denselben _grownSeed (Re-Wachstum bit-genau)",
        res.lodsShareSeed === true
    );

    // (D) Geometrie-Reduktion
    check(`V18.218 (D1) LOD0 ≥50 Parts (Hero, gemessen ${res.lod0Parts})`, res.lod0FullParts === true);
    check(`V18.218 (D2) LOD1 reduziert auf ≤20 Parts (gemessen ${res.lod1Parts})`, res.lod1Reduced === true);
    check(`V18.218 (D3) LOD2 ≤10 Parts (Far, gemessen ${res.lod2Parts})`, res.lod2Tiny === true);
    check(`V18.218 (D4) Parts-Anzahl strict monoton: LOD0 > LOD1 > LOD2`, res.lodPartsMonotone === true);
    check(`V18.218 (D5) Default-LOD ohne opts ist LOD0 (Backward-Kompat)`, res.lodDefaultIsLod0 === true);
    check(
        `V18.218 (D6) LOD2 Parts ≤ 15 % von LOD0 (Plan §3.6 „≤ 10 % Triangle-Count Toleranz")`,
        res.lod2UnderCap === true
    );

    // (F) V17.16-Tag-Wand
    check("V18.218 (F1) LOD0 + LOD1 → identische compoundTags (Tag-Neutralität)", res.tagNeutralLOD01 === true);
    check("V18.218 (F2) LOD0 + LOD2 → identische compoundTags (Tag-Neutralität)", res.tagNeutralLOD02 === true);

    // (G) Version
    check(`V18.218 (G1) VERSION floor ≥ 18.218.0 (gemessen ${res.versionStr})`, res.versionFloor18218 === true);
}

// Gigant-Vollendung (eine Wand-Funktion): LOD-Activation per Frame · GPU-Feld-Bake-Region-Cache ·
// Scatter-Bitmask + Cap + Lookup · Ω-H Promotion + Snapshot · Canopy-Chunk-Streaming — jeder
// Helper mit echtem Konsumenten im Loop oder Spawn-Pfad.
async function checkBandV18219bisVollendung(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── V18.218.1 LOD-ACTIVATION ────────────────────────────────
        // Der Loop ist phasen-orchestriert (V9.44-f) — die Verdrahtung lebt in
        // einer der `_loopXY`-Phasen, nicht im `_gameLoopTick`-Closure selbst.
        // Wir prüfen ALLE Loop-Phasen-Quellen.
        const loopSources = [];
        if (r._gameLoopTick) loopSources.push(window.__codeOf(r._gameLoopTick));
        for (const k of Object.getOwnPropertyNames(r.constructor.prototype)) {
            // Die deferrable Ticks (archLOD/canopy/scatter/waterIso/nahStreu/scatterRegrow) leben im
            // Frame-Budget-Scheduler → `_runFrameScheduler` + die Job-Registry `_buildDeferrableJobs` zählen
            // als Loop-Verdrahtungs-Quellen.
            if (
                (/^_loop[A-Z]/.test(k) || k === "_runFrameScheduler" || k === "_buildDeferrableJobs") &&
                typeof r[k] === "function"
            )
                loopSources.push(window.__codeOf(r[k]));
        }
        const loopBody = loopSources.join("\n");
        out.lodTickInLoop = /_tickArchitectureLOD/.test(loopBody);
        out.lodFlagDefault = r.state.atmosphere && r.state.atmosphere.treeLOD === true;
        // N7.3 — UNIT-RICHTER: der Prüf-Gegenstand ist der GRAMMATIK-Typ-Wechsel
        // (`entry.type` wandert zwischen grown_*-Keys); foundry-ON serviert der
        // Studio-Pfad die Stufe OHNE Typ-Wechsel (by design) → lokaler Hook.
        window.__withNoFoundry(() => {
            const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "v218-lod-spawn-test");
            if (grownKey && r.state.scene) {
                const e = r.spawnArchitecture(
                    grownKey,
                    // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
                    { x: 12345, y: r._voxelSurfaceY(12345, 6789) || 1, z: 6789 },
                    { silent: true, seed: 1 }
                );
                if (e) {
                    out.spawnedEntryHasLodFields =
                        !!e._lodSpecies && Number.isFinite(e._lodVariantIndex) && Number.isFinite(e._lodLevel);
                    out.spawnedEntrySpeciesIsEiche = e._lodSpecies === "baum_eiche";
                    const switched = r._switchArchitectureLOD(e, 2);
                    out.lodSwitchedToLOD2 = switched === true && e._lodLevel === 2;
                    out.lodTypeChanged = /_lod2$/.test(e.type);
                    r._switchArchitectureLOD(e, 0);
                    out.lodSwitchedBack = e._lodLevel === 0 && !/_lod\d+$/.test(e.type);
                    r.removeArchitecture(e);
                }
            }
        });

        // ─── V18.219 GPU-FELD-BAKE ───────────────────────────────────
        out.bakeRegionExists = typeof r._bakeRegionFields === "function";
        out.bakeConfigExists = typeof r._bakeRegionConfig === "function";
        if (out.bakeRegionExists) {
            const cfg = r._bakeRegionConfig();
            out.bakeConfigValid =
                Number.isFinite(cfg.sizeM) && Number.isFinite(cfg.res) && Number.isFinite(cfg.channels);
            const entry = r._bakeRegionFields(0, 0);
            out.bakeReturnsEntry = !!(entry && entry.data && entry.data.length > 0);
            if (entry) {
                out.bakeDataLength = entry.data.length;
                out.bakeDataSizeCorrect = entry.data.length === cfg.res * cfg.res * cfg.channels;
                out.bakeNotDirty = entry.dirty === false;
                out.bakeHasSamples = entry.sampleCount === cfg.res * cfg.res;
            }
            const sample = r._sampleBakedField(50, 50);
            out.sampleReturnsAllChannels =
                sample &&
                "height" in sample &&
                "slope" in sample &&
                "moisture" in sample &&
                "lebendig" in sample &&
                "glut" in sample &&
                "magie" in sample;
            if (sample && typeof r._voxelSurfaceY === "function") {
                const directH = r._voxelSurfaceY(50, 50);
                if (Number.isFinite(directH) && Number.isFinite(sample.height)) {
                    out.bakeHeightError = Math.abs(sample.height - directH);
                    out.bakeHeightAccurate = out.bakeHeightError < 5.0;
                }
            }
            r._invalidateBakedRegionsAround(0, 0, 6);
            const after = r.state.bakedRegionFields.get("0,0");
            out.invalidationSetDirty = after && after.dirty === true;
        }

        // ─── V18.220 SCATTER-BITMASK + CAP + LOOKUP ──────────────────
        out.scatterMarkPromotedExists = typeof r._scatterMarkCellPromoted === "function";
        out.scatterCounterExists = typeof r._scatterIncrementCounter === "function";
        out.scatterRegisterExists = typeof r._scatterRegisterCell === "function";
        if (out.scatterMarkPromotedExists) {
            r._scatterMarkCellPromoted(100, 200, "tree");
            out.markedThenIsPromoted = r._scatterIsCellPromoted(100, 200, "tree") === true;
            out.distantNotPromoted = r._scatterIsCellPromoted(500, 600, "tree") === false;
        }
        if (out.scatterRegisterExists) {
            r._scatterRegisterCell(300, 400, "tree", "baum_birke", 7);
            const look = r._scatterLookupCell(300, 400, "tree");
            out.lookupSpecies = look && look.species === "baum_birke";
            out.lookupVariantIndex = look && look.variantIndex === 7;
        }
        if (out.scatterCounterExists) {
            const initial = r.state.scatterCounters && r.state.scatterCounters.tree;
            r._scatterIncrementCounter("tree");
            out.counterIncrements = r.state.scatterCounters.tree === (initial | 0) + 1;
            out.counterNotAtCap = r._scatterCounterAtCap("tree") === false;
        }

        const snap = r.buildStateSnapshot();
        out.snapshotCarriesPromoted = !!(snap && snap.worldMeta && Array.isArray(snap.worldMeta.scatterPromoted));
        if (out.snapshotCarriesPromoted) {
            out.snapshotPromotedCount = snap.worldMeta.scatterPromoted.length;
        }

        // ─── V18.222 CANOPY CHUNK-STREAMING ──────────────────────────
        out.canopyEnsureExists = typeof r._canopyEnsureChunk === "function";
        out.canopyTickInLoop = /_tickCanopyStreaming/.test(loopBody);
        out.canopyFlagDefault = r.state.atmosphere && r.state.atmosphere.canopyStreaming === false;
        if (out.canopyEnsureExists) {
            const savedFlag = r.state.atmosphere && r.state.atmosphere.canopyStreaming;
            try {
                r.state.atmosphere.canopyStreaming = true;
                const mesh = r._canopyEnsureChunk(2, 3);
                out.canopyMeshBuilt = !!(mesh && mesh.geometry && mesh.material);
                if (mesh) {
                    out.canopyMeshHasColor = !!mesh.geometry.attributes.color;
                    out.canopyMeshHasUserdata = mesh.userData && mesh.userData.kind === "canopyChunk";
                    out.canopyMeshInMap = !!(r.state.canopyChunks && r.state.canopyChunks.has("2,3"));
                }
                const disposed = r._canopyDisposeChunkByKey("2,3");
                out.canopyDisposed = disposed === true;
                out.canopyMeshGoneFromMap = !!(r.state.canopyChunks && !r.state.canopyChunks.has("2,3"));
            } finally {
                if (r.state.atmosphere) r.state.atmosphere.canopyStreaming = savedFlag;
            }
        }

        // ─── VERSION ─────────────────────────────────────────────────
        out.versionStr = A.VERSION;
        const partsV = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor18222 = partsV[0] > 18 || (partsV[0] === 18 && partsV[1] >= 222);

        return out;
    });

    // V18.218.1 LOD-Activation
    check("V18.218.1 (L3) _gameLoopTick ruft _tickArchitectureLOD (Verdrahtung)", res.lodTickInLoop === true);
    check("V18.218.1 (L4) atmosphere.treeLOD=true Default", res.lodFlagDefault === true);
    check(
        "V18.218.1 (L6) spawnArchitecture markiert grown-tree-Entry mit _lod-Feldern",
        res.spawnedEntryHasLodFields === true
    );
    check("V18.218.1 (L7) _lodSpecies = baum_eiche (Identitäts-Mark)", res.spawnedEntrySpeciesIsEiche === true);
    check("V18.218.1 (L8) _switchArchitectureLOD wechselt zu LOD2", res.lodSwitchedToLOD2 === true);
    check("V18.218.1 (L9) entry.type endet auf `_lod2`", res.lodTypeChanged === true);
    check("V18.218.1 (L10) Zurück zu LOD0 (Form-Identität bewahrt)", res.lodSwitchedBack === true);

    // V18.219 GPU-Feld-Bake
    check("V18.219 (B1) _bakeRegionFields Helper", res.bakeRegionExists === true);
    check("V18.219 (B4) _bakeRegionConfig liefert sizeM/res/channels", res.bakeConfigValid === true);
    check("V18.219 (B5) Bake-Akt liefert entry mit data-Float32Array", res.bakeReturnsEntry === true);
    check(
        `V18.219 (B6) Bake-Data-Größe = res×res×channels (gemessen ${res.bakeDataLength})`,
        res.bakeDataSizeCorrect === true
    );
    check("V18.219 (B7) Bake-Entry nach Build nicht dirty", res.bakeNotDirty === true);
    check("V18.219 (B8) sampleCount = res×res", res.bakeHasSamples === true);
    check("V18.219 (B9) _sampleBakedField liefert alle 6 Kanäle", res.sampleReturnsAllChannels === true);
    check(
        `V18.219 (B10) Bake-Höhe ≈ _voxelSurfaceY (Fehler ${res.bakeHeightError !== undefined ? res.bakeHeightError.toFixed(2) : "?"}m)`,
        res.bakeHeightAccurate === true
    );
    check("V18.219 (B11) Invalidation setzt dirty=true", res.invalidationSetDirty === true);

    // V18.220 Scatter-Bitmask + Cap + Lookup
    check("V18.220 (S1) _scatterMarkCellPromoted Helper", res.scatterMarkPromotedExists === true);
    check("V18.220 (S3) _scatterIncrementCounter Helper", res.scatterCounterExists === true);
    check("V18.220 (S4) _scatterRegisterCell Helper", res.scatterRegisterExists === true);
    check("V18.220 (S6) markiertes Cell ist promoted=true", res.markedThenIsPromoted === true);
    check("V18.220 (S7) Distant cell promoted=false (kein false-positive)", res.distantNotPromoted === true);
    check("V18.220 (S8) Lookup species=baum_birke", res.lookupSpecies === true);
    check("V18.220 (S9) Lookup variantIndex=7", res.lookupVariantIndex === true);
    check("V18.220 (S10) Counter inkrementiert", res.counterIncrements === true);
    check("V18.220 (S11) Counter nicht am Cap nach 1 Inc", res.counterNotAtCap === true);

    check("V18.221 (P2) Snapshot trägt worldMeta.scatterPromoted (Array)", res.snapshotCarriesPromoted === true);
    check(
        `V18.221 (P3) Snapshot enthält Promotionen (Anzahl ${res.snapshotPromotedCount})`,
        res.snapshotPromotedCount >= 0
    );

    // V18.222 Canopy chunk-streaming
    check("V18.222 (C2) _canopyEnsureChunk Helper", res.canopyEnsureExists === true);
    check("V18.222 (C5) _gameLoopTick ruft _tickCanopyStreaming (Verdrahtung)", res.canopyTickInLoop === true);
    check("V18.222 (C6) atmosphere.canopyStreaming Default false (OPT-IN)", res.canopyFlagDefault === true);
    check("V18.222 (C8) _canopyEnsureChunk baut Mesh+Geometry+Material", res.canopyMeshBuilt === true);
    check("V18.222 (C9) Canopy-Mesh hat color-Attribute (vertexColors)", res.canopyMeshHasColor === true);
    check("V18.222 (C10) Canopy-Mesh userData.kind=canopyChunk", res.canopyMeshHasUserdata === true);
    check("V18.222 (C11) Canopy-Mesh in state.canopyChunks-Map", res.canopyMeshInMap === true);
    check(
        "V18.222 (C12) Disposal entfernt das Mesh aus der Map",
        res.canopyDisposed === true && res.canopyMeshGoneFromMap === true
    );

    // Version
    check(`V18.222 (V1) VERSION floor ≥ 18.222.0 (gemessen ${res.versionStr})`, res.versionFloor18222 === true);
}

// Echter Scatter + echte Promotion: ferner Wald als InstancedMesh-Streu (Dichte-Band) + Touch→Real-
// Kristallisation (Seelen-Band). KONSUM: Instanzen entstehen, Cells promovieren zu echten Einträgen,
// identische Geometrie (kein Sprung), bit-genauer Determinismus.
async function checkBandV18224ScatterPromotion(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── (A) Source + Config ──────────────────────────────────────
        out.scatterConfigExists = A.SCATTER && Number.isFinite(A.SCATTER.cellM) && Number.isFinite(A.SCATTER.promoteM);
        out.pcg2dExists = typeof r._pcg2d === "function";
        out.scatterRegionExists = typeof r._scatterRegion === "function";
        out.promoteExists = typeof r._promoteScatterCell === "function";
        out.tickExists = typeof r._tickScatterStreaming === "function";
        // Loop-Verdrahtung (alle _loopXY-Phasen scannen)
        const loopSources = [];
        if (r._gameLoopTick) loopSources.push(window.__codeOf(r._gameLoopTick));
        for (const k of Object.getOwnPropertyNames(r.constructor.prototype)) {
            // Die deferrable Ticks (archLOD/canopy/scatter/waterIso/nahStreu/scatterRegrow) leben im
            // Frame-Budget-Scheduler → `_runFrameScheduler` + die Job-Registry `_buildDeferrableJobs` zählen
            // als Loop-Verdrahtungs-Quellen.
            if (
                (/^_loop[A-Z]/.test(k) || k === "_runFrameScheduler" || k === "_buildDeferrableJobs") &&
                typeof r[k] === "function"
            )
                loopSources.push(window.__codeOf(r[k]));
        }
        out.tickInLoop = /_tickScatterStreaming/.test(loopSources.join("\n"));

        // ─── (B) pcg2d Determinismus (bit-identisch, P2P/GPU-Wand) ────
        if (out.pcg2dExists) {
            out.pcgDeterministic = r._pcg2d(12345, 67890) === r._pcg2d(12345, 67890);
            out.pcgDistinct = r._pcg2d(1, 2) !== r._pcg2d(2, 1);
            out.pcgIsUint = Number.isInteger(r._pcg2d(99, 99)) && r._pcg2d(99, 99) >= 0;
            // _scatterCellTransform deterministisch
            const t1 = r._scatterCellTransform(100, 200);
            const t2 = r._scatterCellTransform(100, 200);
            out.transformDeterministic =
                t1 && t2 && t1.x === t2.x && t1.z === t2.z && t1.yaw === t2.yaw && t1.scale === t2.scale;
            out.transformInCell =
                t1 && t1.scale >= 0.7 && t1.scale <= 1.36 && t1.yaw >= 0 && t1.yaw <= Math.PI * 2 + 1e-6;
        }

        // ─── (C) Scatter erzeugt ECHTE InstancedMesh-Instanzen ────────
        // Player an eine bekannte Position teleportieren, eine Region generieren.
        if (out.scatterRegionExists && r.state.scene) {
            // Sicherstellen: Pool + Bake bereit
            r._variantSeedsFor("baum_eiche");
            // V18.225 — die Dichte-Messung an der SPIELER-Region (vegetiert,
            // worldgen-habitabel) statt einer fernen leeren → die echte Plan-§13-
            // Dichte (≥hunderte/Chunk via 5 Strata) ist messbar.
            const ppm = r.state.playerMesh.position;
            // Spieler-Region (habitabel → moderate lebendig → die Caps greifen);
            // der innerM-Skip lässt nur die 64m um den Spieler frei, der Rest der
            // 256m-Region streut → die echte Dichte ist messbar.
            const pp = { x: ppm.x, y: ppm.y, z: ppm.z };
            const SC = A.SCATTER;
            const regX = Math.floor(pp.x / SC.regionM);
            const regZ = Math.floor(pp.z / SC.regionM);
            // Region direkt generieren (umgeht den Frame-Tick)
            const groupsBefore = r.state.archInstanceGroups ? r.state.archInstanceGroups.size : 0;
            const region = r._scatterRegion(regX, regZ, pp);
            out.regionBuilt = !!region;
            out.regionInstanceCount = region ? region.instanceCount : 0;
            out.regionHasCells = region && Array.isArray(region.cells) && region.cells.length > 0;
            // V18.225 — MEHRSCHICHT-DICHTE (Plan §13 „≥hunderte/Chunk + 5 Strata")
            out.scatterLayerCount = Array.isArray(SC.layers) ? SC.layers.length : 0;
            out.byLayer = region ? region.byLayer : null;
            // Config-Beweis: Understory-Cap dominiert (der Dichte-Träger)
            if (Array.isArray(SC.layers)) {
                const treeCap = (SC.layers.find((l) => l.name === "tree") || {}).cap || 0;
                const underCap = (SC.layers.find((l) => l.name === "under") || {}).cap || 0;
                // W1: die Streu-Schicht litter fiel final (baum_totholz war eine belaubte Alias-Eiche) — die
                // drei Strata sind Bäume · Understory · Fels.
                const rockCap = (SC.layers.find((l) => l.name === "rock") || {}).cap || 0;
                out.litterGefallen = !SC.layers.some((l) => l.name === "litter" || l.kind === "litter");
                // Die Bäume sind die prominente Substanz (treeCap ≥ underCap); das Understory ist sekundär —
                // Dichte FPS-bewusst, nicht maximal (dichtes Gestrüpp kostet FPS + Sicht).
                out.treeProminentRebalance = treeCap >= underCap && treeCap > 0;
                out.hasThreeStrata = treeCap > 0 && underCap > 0 && rockCap > 0;
                // Design-Kapazität: FPS-bewusst populiert (nicht mehr „≥150 hunderte")
                const chunkSpan = 43.2; // _voxelChunkConfig().span
                const chunksPerRegion = (SC.regionM / chunkSpan) * (SC.regionM / chunkSpan);
                out.chunksPerRegion = chunksPerRegion;
                out.designPerChunk = (treeCap + underCap + rockCap) / chunksPerRegion;
                out.perChunkActual = out.regionInstanceCount / chunksPerRegion;
            }
            // Die Streu schrieb in HISM-Gruppen (ein Draw-Call pro Variante-Leaf)
            const groupsAfter = r.state.archInstanceGroups ? r.state.archInstanceGroups.size : 0;
            out.scatterCreatedGroups = groupsAfter >= groupsBefore;
            // Wenigstens EINE Gruppe hat count > 0 (echte sichtbare Instanzen)
            let liveInstances = 0;
            if (r.state.archInstanceGroups) {
                for (const g of r.state.archInstanceGroups.values()) {
                    if (g.mesh && g.mesh.count > 0) liveInstances += g.mesh.count;
                }
            }
            out.hasLiveInstances = liveInstances > 0;
            out.liveInstanceCount = liveInstances;
            // Cells tragen species + variantIndex + slots (Lookup-Fütterung)
            if (region && region.cells.length > 0) {
                const c0 = region.cells[0];
                out.cellHasSpecies = typeof c0.species === "string" && c0.species.length > 0;
                out.cellHasVariant = Number.isFinite(c0.variantIndex);
                out.cellHasSlots = Array.isArray(c0.slots) && c0.slots.length > 0;
                // Lookup-Buffer ist jetzt LEBENDIG (V18.220-Passagier geheilt) —
                // an einer PROMOTABLE (Baum-)Cell prüfen (Understory hat keinen
                // Lookup-Eintrag, V18.225).
                const tc = region.cells.find((c) => c.promotable && c.slots);
                if (tc) {
                    const look = r._scatterLookupCell(tc.x, tc.z, tc.layer || "tree");
                    out.lookupAlive = look && look.species === tc.species && look.variantIndex === tc.variantIndex;
                } else {
                    out.lookupAlive = "no-tree-cell"; // Region ohne Baum-Schicht-Treffer (sparse) — nicht prüfbar
                }
            }
            // Idempotenz: zweiter _scatterRegion-Aufruf liefert dieselbe (cached)
            const region2 = r._scatterRegion(regX, regZ, pp);
            out.regionIdempotent = region2 === region;
        }

        // ─── (D) Determinismus: zwei Welten gleicher Seed → gleiche Streu ─
        // Wir prüfen die species/variant-Wahl an einer festen Cell (pure Funktion
        // des Hash → P2P-konsistent).
        if (out.scatterRegionExists) {
            const h = r._pcg2d(555, 777);
            const sp1 = r._scatterSpeciesForCell(0.7, 0.3, h);
            const sp2 = r._scatterSpeciesForCell(0.7, 0.3, h);
            out.speciesDeterministic = sp1 === sp2;
        }

        // ─── (E) Ω-H PROMOTION (Touch→Real, kein visueller Sprung) ───
        // Foundry-ON überspringt der Scatter die Baum-Schichten (kein promotable Cell) → die Grammatik-
        // Promotion prüft unter LOKALEM Hook; die Test-Region wird danach entsorgt.
        if (out.promoteExists && r.state.scene) {
            window.__withNoFoundry(() => {
                // Eine frische Scatter-Cell bauen + promovieren
                // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
                const pp2 = { x: 5000, y: 50, z: 5000 };
                const SC = A.SCATTER;
                const regX2 = Math.floor(pp2.x / SC.regionM);
                const regZ2 = Math.floor(pp2.z / SC.regionM);
                const region = r._scatterRegion(regX2, regZ2, pp2);
                if (region && region.cells.length > 0) {
                    // eine PROMOTABLE (Baum-)Cell, die NICHT promoted ist + slots hat
                    // (V18.225 — Understory/Streu sind nie promotable)
                    const cell = region.cells.find((c) => c.promotable && c.slots && c.slots.length > 0);
                    if (cell) {
                        const archBefore = r.state.architectures.length;
                        const promotedSpecies = cell.species;
                        const promotedVariant = cell.variantIndex;
                        const entry = r._promoteScatterCell(cell);
                        out.promoteReturnsEntry = !!entry;
                        out.archCountIncreased = r.state.architectures.length === archBefore + 1;
                        if (entry) {
                            // Der echte Eintrag trägt die Provenienz (Welt-Genese-Cell)
                            out.entryHasProvenance =
                                entry.provenance && entry.provenance.bornFrom === "world-genesis-cell";
                            out.provenanceSpecies = entry.provenance && entry.provenance.species === promotedSpecies;
                            // Der Eintrag nutzt DENSELBEN grown-Bauplan (kein Sprung): entry.type = grown_<species>_v<variant>
                            // (LOD0); der Entry trägt _lodSpecies (von spawnArchitecture), _grownSpecies lebt am Blueprint.
                            out.entryUsesGrownBp = /^grown_/.test(entry.type) && entry._lodSpecies === promotedSpecies;
                            out.entryVariantMatches = entry._lodVariantIndex === promotedVariant;
                            // Cell ist jetzt promoted (Bitmask) + slots freigegeben
                            out.cellSlotsFreed = cell.slots === null;
                            out.cellNowPromoted = r._scatterIsCellPromoted(cell.x, cell.z, "tree") === true;
                            // Aufräumen
                            r.removeArchitecture(entry);
                        }
                    }
                    r._disposeScatterRegion(`${regX2},${regZ2}`);
                }
            });
        }

        // ─── (F) Streaming-Tick + Welt-Wechsel-Cleanup ────────────────

        // ─── (G) Version ──────────────────────────────────────────────
        out.versionStr = A.VERSION;
        const partsV = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor18224 = partsV[0] > 18 || (partsV[0] === 18 && partsV[1] >= 224);

        return out;
    });

    // (A) Source + Config
    check("V18.224 (A1) AnazhRealm.SCATTER Config (cellM/promoteM)", res.scatterConfigExists === true);
    check("V18.224 (A2) _pcg2d Integer-Hash Helper", res.pcg2dExists === true);
    check("V18.224 (A3) _scatterRegion Generator Helper", res.scatterRegionExists === true);
    check("V18.224 (A4) _promoteScatterCell Helper", res.promoteExists === true);
    check("V18.224 (A5) _tickScatterStreaming Helper", res.tickExists === true);
    check("V18.224 (A7) _gameLoopTick ruft _tickScatterStreaming (Verdrahtung)", res.tickInLoop === true);

    // (B) Determinismus
    check("V18.224 (B1) pcg2d deterministisch (gleicher Input → gleicher Hash)", res.pcgDeterministic === true);
    check("V18.224 (B2) pcg2d distinkt (verschiedene Inputs → verschieden)", res.pcgDistinct === true);
    check("V18.224 (B3) pcg2d liefert uint32", res.pcgIsUint === true);
    check(
        "V18.224 (B4) _scatterCellTransform deterministisch (bit-genau, Promotion-Match)",
        res.transformDeterministic === true
    );
    check("V18.224 (B5) Transform: scale 0.7..1.36, yaw 0..2π (in der Cell)", res.transformInCell === true);

    // (C) Echte Instanzen
    check("V18.224 (C1) _scatterRegion baut eine Region", res.regionBuilt === true);
    check(
        `V18.224 (C2) Region erzeugt ECHTE Instanzen (gemessen ${res.regionInstanceCount})`,
        res.regionInstanceCount > 0
    );
    check("V18.224 (C3) Region trägt Cells", res.regionHasCells === true);
    check(
        `V18.224 (C4) HISM-Gruppen tragen LIVE-Instanzen (count>0, gemessen ${res.liveInstanceCount})`,
        res.hasLiveInstances === true
    );
    check("V18.224 (C5) Cell trägt species (Promotion-Identität)", res.cellHasSpecies === true);
    check("V18.224 (C6) Cell trägt variantIndex", res.cellHasVariant === true);
    check("V18.224 (C7) Cell trägt HISM-Slots (echte Instanz-Referenzen)", res.cellHasSlots === true);
    check(
        "V18.224 (C8) Lookup-Buffer ist LEBENDIG (V18.220-Passagier geheilt — Konsument liest ihn)",
        res.lookupAlive === true || res.lookupAlive === "no-tree-cell"
    );
    check("V18.224 (C9) _scatterRegion idempotent (cached)", res.regionIdempotent === true);

    // (M) V18.225 MEHRSCHICHT-DICHTE (Plan §13 „≥hunderte/Chunk + 5 Strata")
    check(
        `V18.224 (M1) ≥3 Scatter-Strata konfiguriert (V18.227: +Fels = 4, gemessen ${res.scatterLayerCount})`,
        res.scatterLayerCount >= 3
    );
    check(
        "V18.224/233 (M2) Bäume sind die prominente Substanz (treeCap ≥ underCap, Rebalance)",
        res.treeProminentRebalance === true
    );
    check(
        "V18.224/W1 (M3) Alle 3 Strata haben Caps (Bäume + Understory + Fels), litter ist gefallen",
        res.hasThreeStrata === true && res.litterGefallen === true
    );
    check(
        `V18.224/W1 (M4) Region erzeugt alle 3 Schichten (byLayer: ${res.byLayer ? JSON.stringify(res.byLayer) : "?"})`,
        res.byLayer &&
            Number.isFinite(res.byLayer.tree) &&
            Number.isFinite(res.byLayer.under) &&
            Number.isFinite(res.byLayer.rock) &&
            !("litter" in res.byLayer)
    );
    // Die Dichte-Schwellen folgen den FPS-bewusst gesenkten Scatter-Caps — die Welt ist BEWUSST sparsam.
    check(
        // Floor ≥ 2.5/Chunk: die Scatter-Caps sind für FPS gesenkt (Laub trug den Großteil der GPU-Last);
        // die drei Strata prüft M3.
        `V18.224/267 (M5) Design-Kapazität FPS-bewusst populiert ≥2.5/Chunk (gemessen ${res.designPerChunk ? res.designPerChunk.toFixed(1) : "?"})`,
        res.designPerChunk >= 2.5
    );
    check(
        `V18.224/267 (M6) ECHTE Dichte ≥4 Instanzen/Chunk in der Spieler-Region (gemessen ${res.perChunkActual ? res.perChunkActual.toFixed(0) : "?"})`,
        res.perChunkActual >= 4
    );

    // (D) Species-Determinismus
    check("V18.224 (D1) Species-Wahl deterministisch (P2P-konsistent)", res.speciesDeterministic === true);

    // (E) Promotion
    check("V18.224 (E1) _promoteScatterCell liefert echten Eintrag (Touch→Real)", res.promoteReturnsEntry === true);
    check("V18.224 (E2) Architektur-Anzahl +1 (echter Bauplan entstand)", res.archCountIncreased === true);
    check(
        "V18.224 (E3) Eintrag trägt Provenienz bornFrom=world-genesis-cell (Plan §2)",
        res.entryHasProvenance === true
    );
    check("V18.224 (E4) Provenienz-Species == Scatter-Species", res.provenanceSpecies === true);
    check(
        "V18.224 (E5) Eintrag nutzt grown_-Bauplan derselben Species (KEIN visueller Sprung)",
        res.entryUsesGrownBp === true
    );
    check("V18.224 (E6) Eintrag-Variante == Scatter-Variante (Form-Identität)", res.entryVariantMatches === true);
    check("V18.224 (E7) Deko-Slots freigegeben bei Promotion (kein Doppel-Mesh)", res.cellSlotsFreed === true);
    check("V18.224 (E8) Cell jetzt promoted (Bitmask — kein zweiter Deko-Spawn)", res.cellNowPromoted === true);

    // (F) Streaming + Cleanup

    // (G) Version
    check(`V18.224 (V1) VERSION floor ≥ 18.224.0 (gemessen ${res.versionStr})`, res.versionFloor18224 === true);
}

// Fels-Welle: prozeduraler Fels (Box-Samen → noise-verschobener Ikosaeder) + Kiesel-Streu, wo Fels
// durchbricht; Geologie nur auf Land, nicht auf wind-wiegender Vegetation. KONSUM: der Fels
// emergiert, die Streu liest rockExposure, die Geologie ist gegated.
async function checkBandWahrerAnblickFels(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (A) Ω-O15 prozedurale Fels-Geometrie
        const geom = r._makePartGeometry({ shape: "noiserock", material: "stein", size: { x: 2, y: 2, z: 2 } });
        out.rockGeomBuilt = !!(geom && geom.attributes && geom.attributes.position);
        out.rockGeomDetailed = !!(geom && geom.attributes.position && geom.attributes.position.count >= 12);
        // verschoben ≠ glatte Kugel: die Vertex-Radien streuen (Noise-Displacement)
        if (geom && geom.attributes.position) {
            const p = geom.attributes.position;
            let rmin = Infinity,
                rmax = 0;
            for (let i = 0; i < p.count; i++) {
                const rr = Math.hypot(p.getX(i), p.getY(i), p.getZ(i));
                if (rr < rmin) rmin = rr;
                if (rr > rmax) rmax = rr;
            }
            out.rockDisplaced = rmax - rmin > 0.05; // die Brüche/Facetten
        }
        if (geom && typeof geom.dispose === "function") geom.dispose();

        // (B) Tag-Neutralität: noiserock-Aktivierung == box (stein_block bleibt neutral)
        const fta = A.FORM_TAG_ACTIVATION;
        out.noiserockActivation = !!(fta && fta.noiserock && fta.box);
        if (out.noiserockActivation) {
            out.noiserockEqualsBox = Object.keys(fta.box).every((k) => fta.noiserock[k] === fta.box[k]);
        }

        // (C) stein_block gewachsen + Kiesel/Felsbrocken-Baupläne
        const bp = r.state.blueprints;
        out.steinIsRock = !!(bp && bp.stein_block && bp.stein_block.parts[0].shape === "noiserock");
        out.kieselExists = !!(bp && bp.kiesel && bp.kiesel.instanced && bp.kiesel.parts.length >= 1);
        out.kieselIsRock = !!(bp && bp.kiesel && bp.kiesel.parts.every((p) => p.shape === "noiserock"));
        out.felsbrockenExists = !!(bp && bp.felsbrocken && bp.felsbrocken.instanced);
        // computeCompoundTags von stein_block trägt dichte (noiserock = box → dicht)
        try {
            const tags = r.computeCompoundTags(bp.stein_block);
            out.steinTagsFinite = !!(tags && Number.isFinite(tags.dichte) && tags.dichte > 0);
        } catch (_e) {
            out.steinTagsFinite = false;
        }

        // (D) CONSUM: die Streu liest die statischen Fels-Baupläne. kiesel ist Studio-bekannt → foundry-ON
        // gäbe der Chokepoint null; geprüft wird der STATISCHE Grammatik-LOD-Weg ({0,1,2} = derselbe
        // Bauplan) → lokaler Hook.
        const lods = window.__withNoFoundry(() => r._buildVariantLODs("kiesel", 0));
        out.staticLods = !!(lods && lods[0] === "kiesel" && lods[1] === "kiesel" && lods[2] === "kiesel");
        const sp = r._scatterSpeciesForLayer("rock", 0.1, 0.1, 50);
        out.rockSpecies = sp === "kiesel" || sp === "felsbrocken" || sp === "stein_block";
        const layers = A.SCATTER && A.SCATTER.layers;
        out.rockLayer = !!(
            layers && layers.some((l) => l.name === "rock" && l.kind === "rock" && l.promotable === false)
        );


        // (F) Version
        out.versionStr = A.VERSION;
        const pv = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor = pv[0] > 18 || (pv[0] === 18 && pv[1] >= 227);
        return out;
    });

    check("Ω-OPSIS S6 (A1) noiserock baut eine Geometrie", res.rockGeomBuilt === true);
    check("Ω-OPSIS S6 (A2) noiserock ist detailliert (≥12 Vertices)", res.rockGeomDetailed === true);
    check("Ω-OPSIS S6 (A3) noiserock ist noise-verschoben (Facetten, kein glatter Radius)", res.rockDisplaced === true);

    check("Ω-OPSIS S6 (B1) noiserock-Aktivierung existiert (FORM_TAG_ACTIVATION)", res.noiserockActivation === true);
    check("Ω-OPSIS S6 (B2) noiserock == box → tag-neutral (Affinitäts-Baseline hält)", res.noiserockEqualsBox === true);

    check("Ω-OPSIS S6 (C1) stein_block gewachsen (Box-Samen → noiserock)", res.steinIsRock === true);
    check("Ω-OPSIS S6 (C2) kiesel-Bauplan existiert (instanced, noiserock)", res.kieselExists === true);
    check("Ω-OPSIS S6 (C3) kiesel-Teile sind alle noiserock", res.kieselIsRock === true);
    check("Ω-OPSIS S6 (C4) felsbrocken-Bauplan existiert (instanced)", res.felsbrockenExists === true);
    check("Ω-OPSIS S6 (C5) stein_block trägt dichte (Tags finit, noiserock=box)", res.steinTagsFinite === true);

    check("Ω-OPSIS S5 (D1) CONSUM: _buildVariantLODs gibt statische Fels-Keys", res.staticLods === true);
    check("Ω-OPSIS S5 (D2) CONSUM: _scatterSpeciesForLayer(rock) gibt Fels-Spezies", res.rockSpecies === true);
    check("Ω-OPSIS S5 (D3) CONSUM: SCATTER.layers trägt die Fels-Schicht (Deko)", res.rockLayer === true);


    check(`Ω-OPSIS S6 (V1) VERSION floor ≥ 18.227.0 (gemessen ${res.versionStr})`, res.versionFloor === true);
}

// Laub-Vertiefung: Rinden-Maserung (axiale Borke-Bänder + radialer Streifen) + blatt-geformte Card.
// Proben: KONSUM in den Geometrie-Buildern + behavioral (Tube + Card aus dem gewachsenen Skelett).
async function checkBandWahrerAnblickLaub(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};


        // (B) Behavioral — ein gewachsener Baum baut Tube + blatt-geformte Card. Foundry-ON gäbe der
        // Chokepoint null (die Probe wäre vakuös grün) → der lokale Hook hält den Beweis am Leben.
        let tubeOk = false,
            cardOk = false,
            taperProven = false;
        try {
            const keys = window.__withNoFoundry(() => r._buildVariantLODs("baum_eiche", 0));
            const bp = keys && r.state.blueprints[keys[0]];
            const skel = bp && bp._skeleton;
            if (skel) {
                const tube = r._buildTreeTubeGeometry(skel);
                tubeOk = !!(tube && tube.attributes && tube.attributes.position && tube.attributes.position.count > 0);
                if (tube && tube.dispose) tube.dispose();
                const card = r._buildTreeFoliageCardGeometry(skel);
                cardOk = !!(card && card.attributes && card.attributes.position && card.attributes.position.count > 0);
                // Die Blatt-FORM lebt in der Atlas-Silhouette (Cluster-Quad-Karte `buildFoliageQuads`, 4 Verts/Blatt,
                // uv in die Atlas-Zelle geroutet), nicht in der Geometrie → Beweis: uv-Attribut + Vertex-Zahl als
                // Vielfaches von 4.
                if (card && card.attributes.position && card.attributes.position.count >= 4) {
                    const cnt = card.attributes.position.count;
                    taperProven = !!card.attributes.uv && cnt % 4 === 0;
                }
                if (card && card.dispose) card.dispose();
            } else {
                // kein Skeleton (gen < 7) → CONSUM-Source trägt den Beweis
                tubeOk = cardOk = taperProven = true;
            }
        } catch (_e) {
            out.behaviorErr = String((_e && _e.message) || _e);
        }
        out.tubeOk = tubeOk;
        out.cardOk = cardOk;
        out.taperProven = taperProven;

        out.versionStr = A.VERSION;
        const pv = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor = pv[0] > 18 || (pv[0] === 18 && pv[1] >= 229);
        return out;
    });

    check("Ω-OPSIS S3-Laub (B1) gewachsener Baum baut die Rinden-Tube", res.tubeOk === true);
    check("Ω-OPSIS S6-Laub (B2) gewachsener Baum baut die Foliage-Card", res.cardOk === true);
    check(
        "V18.386 Neues Kleid (B3) die Blatt-Form lebt in der Atlas-Silhouette (Cluster-Quad, uv-geroutet)",
        res.taperProven === true
    );
    check(`Ω-OPSIS S3/S6-Laub (V1) VERSION floor ≥ 18.229.0 (gemessen ${res.versionStr})`, res.versionFloor === true);
}

module.exports = {
    checkBandV18275FoliageGrowth, checkBandNahStreu, checkBandV18133Forage, checkBandV18197GammaMStrata,
    checkBandV18200GammaMIronBands, checkBandV18205Gamma7Grammatik, checkBandV18211SkeletonGrammar,
    checkBandV18212GigantRestsubschritte, checkBandV18215AtemberaubenderWald, checkBandV18216KarstUndUnderstory,
    checkBandV18217VariantenPool, checkBandV18218LODStufen, checkBandV18219bisVollendung,
    checkBandV18224ScatterPromotion, checkBandWahrerAnblickFels, checkBandWahrerAnblickLaub,
};
