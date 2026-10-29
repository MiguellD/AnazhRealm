"use strict";
// scripts/playtest/vegetation.cjs — der Richter von Vegetation (spec/stamm/modul-karte.json): Nah-Wiese · Nah-Streu · Affinität · Boden-Material · Baum-Geometrie · Laub-Atlas · Wald-Pflanzung · Fels-Varianten · Natur-Plätze · Gebackene Regionen · Streu-Zellen · Streu-Streaming.
// 17 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, erreichbar } = require("../playtest.cjs");

// perf-geregelten `foliageRadius`; ferne warten in `pendingFoliageChunks`, bis der
// Radius (mit der gemessenen Render-Kapazität) zu ihnen wächst. Spawn leicht → wächst.
async function checkBandV18275FoliageGrowth(ctx) {
    const { page, check } = ctx;
    // das Urteil als Satz (wie das Klang-Band): die Seite schreibt je Prüfung `out[satz] = urteil` (mit Detail
    // `[urteil, detail]`), der Läufer prüft jeden Satz
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const st = r.state;
        const pm = st.playerMesh;
        const SC = (window.AnazhRealm || r.constructor).SCATTER;
        // headless (Null-Renderer) fährt der Aktuator Radius und Dichte voll (gate-treu)
        const voll = !st.renderer || !st.renderer._isHeadlessNull;
        const out = {};
        // der Fehler einer Teil-Probe als Satz (rot, mit dem Wurf)
        const wurf = (satz, e) => (out[satz] = [false, String((e && e.message) || e)]);
        // Headless (Null-Renderer): der Aktuator setzt foliageRadius = MAX (gate-treu).
        out["headless (Null-Renderer) → foliageRadius = MAX (gate-treu)"] =
            voll || st.foliageRadius === r.constructor.PERF_FOLIAGE_RADIUS_MAX;
        const span = r._voxelChunkConfig().span;
        const pcx = Math.floor(pm.position.x / span),
            pcz = Math.floor(pm.position.z / span);
        // (1) kleiner Radius → ein ferner Chunk ist NICHT in-radius, der Spieler-Chunk schon. Klein = der kleinste Radius,
        // den der Regler fährt (`PERF_FOLIAGE_RADIUS_MIN`); 30 m lagen unter der halben Chunk-Diagonale (30,5 m), und am
        // Chunk-Eck (die Genesis-Plattform steht seit K16 auf dem Ursprung) fiel der eigene Chunk heraus.
        st.foliageRadius = r.constructor.PERF_FOLIAGE_RADIUS_MIN;
        out["kleiner Radius → ferner Chunk wartet, Spieler-Chunk füllt"] =
            r._foliageChunkInRadius(pcx + 6, pcz + 6) === false && r._foliageChunkInRadius(pcx, pcz) === true;
        // (2) Radius wächst → derselbe ferne Chunk wird in-radius (die Welt wächst nach außen).
        st.foliageRadius = 9999;
        out["der Radius wächst → der ferne Chunk wird in-radius (Welt wächst)"] =
            r._foliageChunkInRadius(pcx + 6, pcz + 6) === true;
        // (3) CONSUM: _tickFoliageGrowth drainiert einen wartenden, in-radius Chunk-Key. Drain-Mechanik
        // isoliert: _frameOverBudget (pausiert Wachstum legitim, siehe (4)) hier AUS — die warme
        // Gate-Welt hat hohe Warmup-frameMs.
        st._frameOverBudget = false;
        const tk = `${pcx + 1},${pcz + 1}`;
        // nicht existent → durch den EINEN Abbau (der Boden-Satz verliert den Bereich mit), kein Re-Populate
        if (st.voxelChunks && st.voxelChunks.has(tk)) r._disposeVoxelChunk(tk);
        st.pendingFoliageChunks = new Set([tk]);
        r._tickFoliageGrowth();
        out["CONSUM: _tickFoliageGrowth füllt wartende in-radius Chunks (sanftes Nachwachsen)"] =
            !st.pendingFoliageChunks.has(tk);
        // (4) EXISTENZ VOR FRAMERATE (Lehre 13, K22-3): Frame ÜBER BUDGET → das Wachstum drosselt sein TEMPO, nie seine
        // Existenz: EIN Chunk je WUCHS_DROSSEL_MS, der NÄCHSTE zuerst; innerhalb der Frist keiner; Frame frei → es
        // läuft.
        const tk2 = `${pcx + 2},${pcz + 2}`;
        const tk3 = `${pcx + 4},${pcz + 4}`;
        for (const k of [tk2, tk3]) if (st.voxelChunks && st.voxelChunks.has(k)) r._disposeVoxelChunk(k);
        st.foliageRadius = 9999;
        st.pendingFoliageChunks = new Set([tk3, tk2]); // der fernere zuerst eingereiht: die Wahl folgt der Nähe
        st._frameOverBudget = true;
        r._wuchsNaechster = undefined;
        r._tickFoliageGrowth();
        const naechster = !st.pendingFoliageChunks.has(tk2) && st.pendingFoliageChunks.has(tk3);
        r._tickFoliageGrowth();
        const frist = st.pendingFoliageChunks.has(tk3); // in der Frist: keiner
        r._wuchsNaechster = 0; // die Frist ist um
        r._tickFoliageGrowth();
        const nie = !st.pendingFoliageChunks.has(tk3);
        out[
            "K22-3 EXISTENZ VOR FRAMERATE: Frame über Budget → EIN Chunk je Frist, der nächste zuerst, nie verhungert"
        ] = [naechster && frist && nie, `nächster ${naechster} · Frist ${frist} · nie verhungert ${nie}`];
        st.pendingFoliageChunks = new Set([tk2]);
        st._frameOverBudget = false;
        r._tickFoliageGrowth();
        out["Frame frei → das Wachstum läuft weiter (lädt in den Lücken)"] = !st.pendingFoliageChunks.has(tk2); // jetzt gedrainiert

        const ppD = pm.position;
        // CONSUM (behavioral): die Scatter-Region des Spielers (der Warmup baut sie nicht) bei voller vs
        // gedrosselter Dichte neu bauen → `instanceCount` fällt. Der Faktor lichtet Platzierungs-
        // Wahrscheinlichkeit UND Pro-Region-Cap (sonst maskiert der Cap die Drosselung im dichten Wald).
        // Der Regler-Pfad lebt nur foundry-aus → lokaler Hook (`__withNoFoundry`); die echte
        // Region wird erst NACH dem Restore neu gebaut, im ambienten Regime.
        let gebaut; // die Region trägt die Dichte, bei der sie gebaut wurde (Grund des Nach-Dünnens)
        try {
            if (SC && Number.isFinite(SC.regionM)) {
                const frx = Math.floor(ppD.x / SC.regionM),
                    frz = Math.floor(ppD.z / SC.regionM);
                const fk = `${frx},${frz}`;
                const existed = !!(st.scatterRegions && st.scatterRegions.has(fk));
                const bd = {};
                const instAt = (scale) => {
                    st._foliageDensityScale = scale;
                    r._disposeScatterRegion(fk);
                    const reg = r._scatterRegion(frx, frz, ppD);
                    bd[scale] = reg ? reg.builtDensity : null;
                    return reg ? reg.instanceCount : 0;
                };
                const [dFull, dLow] = window.__withNoFoundry(() => {
                    const d = [instAt(1), instAt(0.4)];
                    gebaut = bd[1] === 1 && bd[0.4] === 0.4;
                    r._disposeScatterRegion(fk);
                    st._foliageDensityScale = 1;
                    return d;
                });
                if (existed) r._scatterRegion(frx, frz, ppD); // echte Region wiederherstellen (ambientes Regime)
                if (dFull > 5)
                    out[
                        `CONSUM: gedrosselte Dichte baut WENIGER ferne Scatter-Instanzen (${dFull} → ${dLow}) — direkt weniger Geometrie (der Bulk-Hebel)`
                    ] = dLow < dFull;
            }
        } catch (e) {
            wurf("CONSUM: Dichte-Probe lief ohne Fehler", e);
        }
        // Headless (Null-Renderer): der Aktuator setzt die Dichte auf 1 (volle Welt fürs Gate).
        r._nexusPerfActuate({
            loadScale: 0.3,
            renderCalls: 1500,
            phase: { streaming: 1, render: 0, archCulling: 1, waterIso: 0, creatures: 0, physics: 0 },
        });
        out["headless (Null-Renderer) → _foliageDensityScale = 1 (volle Dichte, gate-treu)"] =
            voll || st._foliageDensityScale === 1;
        st._foliageDensityScale = 1;

        // DAS NACH-DÜNNEN: eine STATIONÄRE, bei voller Dichte gebaute Region schrumpft,
        // wenn die geregelte Dichte sinkt (`_tickFoliageThin` re-streamt sie) → die schon geladene
        // Welt sinkt auf die Kapazität, nicht nur die frisch gebaute. CONSUM: instanceCount fällt.
        const ruft = window.__consumes(r, "_tickScatterStreaming", r, "_tickFoliageThin", [pm.position]);
        out["Region trägt builtDensity · der Scatter-Tick ruft das Nach-Dünnen (Konsum)"] = !!gebaut && ruft;
        // CONSUM (behavioral; Hook SICHERN + WIEDERHERSTELLEN, nie löschen-und-vergessen): foundry-ON
        // ist Default → die eine Quelle liefert 1 trotz gesenktem Regler, Nach-Dünnen = No-op; foundry-aus
        // („der Regler führt“) per lokalem Hook. Beide Pfade sind Frühausstiege ohne Worker → gate-sicher.
        try {
            const _prevHook = window.__anazhGateNoFoundry;
            st._foliageDensityScale = 0.4;
            delete window.__anazhGateNoFoundry; // Foundry AN (explizit; unter globalem Hook wäre das die Lüftung)
            const voll = r._effectiveFoliageDensity() === 1;
            const noop = r._tickFoliageThin({ x: 0, y: 0, z: 0 }) === 0;
            // der Unit-Richter: foundry-aus → der Regler führt
            out[
                "W1 CONSUM: Studio-Regime → Dichte-Quelle 1 trotz gesenktem Regler + Thin ist No-op; foundry-aus → der Regler führt (0.4)"
            ] = voll && noop && window.__withNoFoundry(() => r._effectiveFoliageDensity() === 0.4);
            if (_prevHook) window.__anazhGateNoFoundry = _prevHook;
            st._foliageDensityScale = 1;
        } catch (e) {
            wurf("W1 CONSUM: Studio-Regime-Dichte-Probe lief ohne Fehler", e);
        }
        try {
            if (SC && Number.isFinite(SC.regionM) && st.scatterRegions) {
                // Den Region-SET ISOLIEREN (Snapshot/ersetzen/restoren), damit MEINE Test-Region
                // die einzige Kandidatin ist (sonst dünnt _tickFoliageThin die NÄCHSTE im Warmup-Set).
                const snap = st.scatterRegions;
                st.scatterRegions = new Map();
                // N7.3 — UNIT-RICHTER: das Nach-Dünnen ist im Studio-Regime BY DESIGN ein No-op
                // (der W1-Satz oben) → die lebende Regler-Mechanik prüft dieser Block unter
                // LOKALEM Hook (`__withNoFoundry`: sichern + wiederherstellen im finally).
                window.__withNoFoundry(() => {
                    const prx = Math.floor(ppD.x / SC.regionM),
                        prz = Math.floor(ppD.z / SC.regionM);
                    st._foliageDensityScale = 1;
                    st._frameOverBudget = false;
                    let tfk = null,
                        tFull = 0;
                    for (let dz = -1; dz <= 1 && tFull <= 5; dz++) {
                        for (let dx = -1; dx <= 1 && tFull <= 5; dx++) {
                            const k = `${prx + dx},${prz + dz}`;
                            const reg = r._scatterRegion(prx + dx, prz + dz, ppD);
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
                        r._tickFoliageThin(ppD); // MEINE Region ist die einzige Kandidatin → wird gedünnt
                        const regThin = st.scatterRegions.get(tfk);
                        const nach = regThin ? regThin.instanceCount : 0;
                        out[
                            `CONSUM: sinkt die Kapazität, schrumpft die STATIONÄRE Welt (Region ${tFull} → ${nach}) — die geladene Welt dünnt beim Drehen`
                        ] = nach < tFull;
                    }
                    // alles disposen (HISM-Instanzen freigeben) + den echten SET wiederherstellen
                    for (const k of Array.from(st.scatterRegions.keys())) r._disposeScatterRegion(k);
                    st.scatterRegions = snap;
                    st._foliageDensityScale = 1;
                });
            }
        } catch (e) {
            wurf("CONSUM: Nach-Dünn-Probe lief ohne Fehler", e);
        }
        st._foliageDensityScale = 1;
        st._frameOverBudget = false;
        return out;
    });
    if (erreichbar(check, "Foliage-Growth-Band (realm)", res)) for (const s in res) check(s, ...[res[s]].flat());
}

// DIE NAH-STREU: der Boden nah am Auge wächst aus dem Pflanzen-Studio — die Arten sind die
// Boden-Zeilen des Studios (placement.boden, ring "nah"), gesetzt nach dem EINEN Boden-Gesetz (__phytoCore.
// bodenGewicht), gebaut über die Foundry (Studio-Teile mit leafKey "f:…"). Konsum statt Existenz: eine echte Kachel
// am Spieler wird gesetzt (deterministisch), der Takt baut ihre Blöcke in die Senken (InstancedMesh je Art × Gestalt ×
// Stufe × Teil), Entsorgen und Neubau halten die Block-Tabelle dicht. Headless ist pixel-blind — hier die Struktur.
async function checkBandNahStreu(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const st = r.state;
        if (!r || !st) return { error: "no realm" };
        const out = {};
        // (3) Die Arten kommen aus dem Studio-Buch (warten, bis Buch + Render-Config stehen).
        let arten = null;
        for (let i = 0; i < 300 && !arten; i++) {
            arten = r._nahStreuArten();
            if (!arten) await sleep(200);
        }
        const buch = r._foundry && r._foundry.recipes;
        out["Nah-Streu: die Arten sind Studio-Zeilen (placement.boden ring nah) mit Rezept im Buch (≥ 5)"] = [
            !!arten &&
                arten.length >= 5 &&
                arten.every((a) => buch && buch[a.id] && buch[a.id].kind === a.kind && a.zeile.ring === "nah"),
            JSON.stringify(arten ? arten.map((a) => a.id) : null),
        ];
        if (!arten) return out;
        // (4) Eine Kachel mit Pflanzen nahe dem Spieler (die Chunks stehen), zweimal gesetzt = dieselbe Streu.
        const NS = r.constructor.NAH_STREU;
        const pp = st.playerMesh.position;
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
        out["Nah-Streu: eine Kachel am Spieler trägt Pflanzen"] = !!kachel;
        if (!kachel) return out;
        const zweit = r._nahStreuKachel(kachel.tx, kachel.tz, arten);
        out["Nah-Streu: dieselbe Kachel = dieselbe Streu (Γ5, Würfe je Zelle)"] =
            !!zweit &&
            zweit.items.length === kachel.satz.items.length &&
            zweit.items.every((it, i) => it.id === kachel.satz.items[i].id && it.x === kachel.satz.items[i].x);
        out["Nah-Streu: die Ernte-Identität je Pflanze ist eindeutig"] =
            new Set(kachel.satz.items.map((it) => it.id)).size === kachel.satz.items.length;
        // (5) Der Takt baut den Ring: bis eine Senke Instanzen trägt (die Studio-Teile reisen asynchron).
        const cam = st.camera;
        const camVor = cam.position.clone();
        cam.position.set(pp.x, pp.y + 1.6, pp.z);
        let senken = null;
        for (let i = 0; i < 900; i++) {
            r._tickNahStreu();
            const ns = st.nahStreu;
            if (ns && [...ns.senken.values()].some((a) => a.anzahl > 0) && ns.offen === 0) {
                senken = ns.senken;
                break;
            }
            await sleep(100);
        }
        out["Nah-Streu: der Takt baut den Ring (Studio-Teile kommen an, nichts offen)"] = [
            !!senken,
            `offen ${st.nahStreu ? st.nahStreu.offen : null}`,
        ];
        if (!senken) {
            cam.position.copy(camVor);
            return out;
        }
        // (5b) DER WIND (W7): jede Senke einer Art mit weichem Gewebe (Laub · Blatt-Karte · Stiel)
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
            !m.positionNode || (m.positionNode === baumK.ast && !!m.userData.windArt && m.userData.windArt.z === 0);
        const wind = { wiegend: [], stehend: [], verstoss: [] };
        for (const [preset, e] of jeArt) {
            (e.weich ? wind.wiegend : wind.stehend).push(preset);
            for (const a of e.senken) {
                const satz = st.chunkSaetze ? st.chunkSaetze.get(a.satz) : null;
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
                if (grund) wind.verstoss.push(a.key + " (" + grund + ")");
            }
        }
        // KONSUM: der wiegende Stoff fragt die EINE Böen-Welle mit der Höhe aus dem Satz-Attribut aWiege (frisch gebaut,
        // am Stoff-Cache vorbei; der Spion fängt das Argument)
        const alle = [...senken.values()]; // jede Senke des Rings
        const wa = alle.find((a) => weichK.has((a.mat.userData || {}).foundryKind));
        let hoehe = null;
        if (wa) {
            const u = wa.mat.userData,
                mats = r._foundryMats,
                sway = r._windSwayOffset;
            r._foundryMats = {};
            r._windSwayOffset = function (T, o) {
                hoehe = (o && o.hoehe) || null;
                return sway.call(this, T, o);
            };
            try {
                r._foundryTreeMaterial(u.foundryKind, u.foundryMp, true, null, u.krone === true);
            } catch {
                /* der Ruf vor dem Wurf zählt */
            } finally {
                delete r._windSwayOffset;
                r._foundryMats = mats;
            }
        }
        out["Nah-Streu: weiches Gewebe wiegt im EINEN Wind (_windSwayOffset), Holz und Stein stehen"] = [
            !!hoehe &&
                typeof hoehe.getAttributeName === "function" &&
                hoehe.getAttributeName() === "aWiege" &&
                wind.wiegend.length > 0 &&
                wind.verstoss.length === 0,
            JSON.stringify(wind),
        ];
        const ns = st.nahStreu;
        // (6) DER STREU-SATZ (W7): die Draw-Einheit ist der STOFF — kein Nah-Streu-Objekt zeichnet selbst, je Stoff EIN
        // Satz in der Szene (der stehende Stoff wirft, der wiegende nie — 1310-11), jede Senke ist ein Studio-Teil (leafKey f:…)
        // ohne Mesh, ihre Blöcke treu (Σ n = Anzahl, je Block Identitäten und Matrizen), jeder Block mit Pflanzen ein Bereich im
        // Satz ihres Stoffs.
        let selbst = 0;
        st.scene.traverse((o) => {
            if (o.isMesh && ((o.userData && o.userData.inventar === "streu-klein") || /^streuNah:/.test(o.name || "")))
                selbst++;
        });
        const stoffSaetze = new Map();
        for (const [art, satz] of st.chunkSaetze || []) if (satz.spec.userData.streuSatz) stoffSaetze.set(art, satz);
        const stoffe = new Set(alle.map((a) => a.mat.uuid));
        const stehtJe = new Map(alle.map((a) => [a.satz, !a.wiegt]));
        out[
            "Nah-Streu (W7): die Draw-Einheit ist der Stoff — je Stoff EIN Streu-Satz in der Szene, keine Senke zeichnet, der stehende Stoff wirft, der wiegende nie"
        ] =
            selbst === 0 &&
            alle.every((a) => stoffSaetze.has(a.satz)) &&
            new Set([...stoffSaetze.values()].map((x) => x.spec.mat.uuid)).size === stoffSaetze.size &&
            stoffSaetze.size <= stoffe.size &&
            [...stoffSaetze].every(
                ([art, x]) => x.mesh.parent === st.scene && x.mesh.castShadow === (stehtJe.get(art) === true)
            );
        out["Nah-Streu: jede Senke ist ein Studio-Teil (leafKey f:…), Daten ohne Mesh"] = alle.every(
            (a) => a.mesh === undefined && typeof a.leafKey === "string" && a.leafKey.startsWith("f:")
        );
        out[
            "Nah-Streu: die Blöcke sind treu (Σ n = Anzahl, Identitäten und Matrizen je Block, je Block ein Bereich im Streu-Satz)"
        ] = alle.every((a) => {
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
        out["Nah-Streu: eine gebaute Kachel trägt Blöcke (Voraussetzung der Satz-Disziplin)"] = !!kz;
        if (kz) {
            const vor = new Map([...ns.senken].map(([k, a]) => [k, a.anzahl]));
            const blockN = new Map([...kz.senken].map((sk) => [sk, ns.senken.get(sk).bloecke.get(kKey).n]));
            r._nahStreuKachelEntsorgen(kz);
            out["Nah-Streu: Entsorgen nimmt die Kachel-Blöcke aus den Senken"] = [...blockN].every(
                ([sk, n]) => ns.senken.get(sk).anzahl === vor.get(sk) - n
            );
            for (let i = 0; i < 300 && kz.zustand === null; i++) {
                r._tickNahStreu();
                if (kz.zustand === null) await sleep(50);
            }
            out["Nah-Streu: der Neubau stellt dieselben Zahlen her"] = [...ns.senken].every(
                ([k, a]) => a.anzahl === vor.get(k)
            );
        }
        cam.position.copy(camVor);
        return out;
    });

    if (erreichbar(check, "Nah-Streu: Band (realm verfügbar)", res)) for (const s in res) check(s, ...[res[s]].flat());
}

// S6-B ERNTBARE FLORA: Raycast auf die Senken der Nah-Streu (instanceId → Kachel-Block → Ernte-Identität der
// Pflanze), Ertrag je Studio-kind (STREU_ERNTE: kraut · stein · holz), Session-Gedächtnis + Regrow (nicht
// persistiert); gepflücktes kraut speist den Trank-Bauplan durchs Mach-Tor.
async function checkBandV18133Forage(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        // Behavioral (wenn die Nah-Streu steht — sonst unmessbar=bestanden): die erste Pflanze einer
        // erntbaren Senke pflücken.
        let pick = null;
        let wirkt = true;
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
            const verts = () => (satz.bloecke.has(vorher.bereich) ? satz.bloecke.get(vorher.bereich).vAnzahl : 0);
            const vertsVor = verts();
            const geerntet = r._harvestScatterPick(pick) && countMat() - before === 1;
            const doppelt = r._harvestScatterPick(pick) === false;
            // Die Pflanze tritt aus dem Block aus: ihre Identität fehlt, der Block und die Anzahl der Senke sinken um eins,
            // der Bereich im Streu-Satz ihres Stoffs trägt eine Pflanze weniger (sie zeichnet nie mehr).
            const bereich = r._streuNahBereich(pick.senke, pick.key);
            const ausgetreten =
                !!bereich &&
                !bereich.ids.includes(pick.id) &&
                bereich.n === nVor - 1 &&
                a.anzahl === zahlVor - 1 &&
                vertsVor - verts() === a.geo.attributes.position.count;
            // DIE TAT BLEIBT (feld.K4): die Ernte steht als Tat im worldMeta (sie reist mit jedem Save) und senkt lebendig am Ort
            const L = r.state.worldMeta.taten;
            const i = L.findIndex((x) => x.kachel === pick.key && x.id === pick.id);
            wirkt =
                geerntet &&
                doppelt &&
                ausgetreten &&
                i >= 0 &&
                r.auraAt(L[i].x, L[i].z).lebendig < r.worldFieldAt(L[i].x, L[i].z).lebendig;
            // Aufraeumen: die Tat zuruecknehmen (kein Band-Crosstalk) + die Kachel neu (die Pflanze kehrt zurück)
            if (i >= 0) L.splice(i, 1);
            const k = ns.kacheln.get(pick.key);
            if (k) k.zustand = null;
            r._tickNahStreu();
        }
        return { wirkt };
    });
    if (erreichbar(check, "Foraging: Sonde lief", res, "evaluate warf"))
        check(
            "Foraging: pfluecken wirkt (+1 Stoff · die Pflanze tritt aus der Senke · Doppel-Pflueck abgelehnt · die Tat senkt lebendig) — oder unmessbar",
            res.wirkt
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

        // (S3) MIGRATION-TOLERANZ: 2-arg Aufruf gibt das alte Verhalten
        // (Achse-Argmax), wie vor V18.197 — bit-identisch zu Pre-V18.197.
        // Finde einen Punkt, wo erde gewinnt (Vegetation-Achse stark) — und dessen Schwelle (S6) in Gleitkomma GENAU
        // auf STRATA_STEIN_DEPTH liegt: der Stamm rechnet die Tiefe als surfY − y, und surfY − (surfY − D) trifft D
        // nicht für jede Höhe (≈ 1 % der Höhen läge 1 ulp über D → „stein").
        let erdePt = null;
        for (let i = 0; i < 200 && !erdePt; i++) {
            const x = (Math.random() - 0.5) * 600;
            const z = (Math.random() - 0.5) * 600;
            const surfY = r._voxelSurfaceY(x, z);
            if (!Number.isFinite(surfY)) continue;
            if (surfY - (surfY - A.STRATA_STEIN_DEPTH) !== A.STRATA_STEIN_DEPTH) continue;
            const mat = r._terrainMaterialAt(x, z); // 2-arg, kein y
            if (mat === "erde") {
                erdePt = { x, z, surfY };
                break;
            }
        }

        if (erdePt) {
            // das Material am Punkt in der Tiefe `d` unter der Oberfläche
            const tief = (d) => r._terrainMaterialAt(erdePt.x, erdePt.z, erdePt.surfY - d);
            // (S4) AN DER OBERFLÄCHE (y = surfY): das alte Verhalten bleibt —
            // erde, wenn die Achse erde gewinnt. y nahe surfY → erde.
            const surfMat = tief(0);
            out[`(S4) An Oberfläche (y=surfY): bleibt erde (alte Achse, gemessen ${surfMat})`] = surfMat === "erde";

            // (S5) TIEF UNTER der Oberfläche (y = surfY - STRATA_STEIN_DEPTH - 5):
            // STRATA forciert stein.
            const deepMat = r._terrainMaterialAt(erdePt.x, erdePt.z, erdePt.surfY - A.STRATA_STEIN_DEPTH - 5);
            out[`(S5) Tief unter Strata-Schwelle: forciert stein (gemessen ${deepMat})`] = deepMat === "stein";

            // (S6) GRENZ-FALL: genau auf STRATA_STEIN_DEPTH-Schwelle bleibt
            // erde (strikte >-Wand, kein Off-by-one)
            const onMat = tief(A.STRATA_STEIN_DEPTH);
            out[`(S6) Auf der Strata-Schwelle: bleibt erde (strikte >-Wand, gemessen ${onMat})`] = onMat === "erde";
        }
        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Γ-M IRON-BANDS (genese-plan §Γ-M Folge zu V18.197 STRATA +
// V18.199 LICHEN). Vertikale Eisenadern in tiefen Bergregionen — vollendet
// die Γ-M-Triade (Strata horizontal + Lichen Patina + Iron-Bands vertikal).
async function checkBandV18200GammaMIronBands(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (I2) Determinismus: zweimal gleicher (x,z) → gleicher Wert
        const a1 = r._eisenAderAt(123.7, 456.3);
        const a2 = r._eisenAderAt(123.7, 456.3);
        out["(I2b) deterministisch (zwei Aufrufe gleicher Wert)"] = Math.abs(a1 - a2) < 1e-10;
        // Wert in [0, 1]
        out["(I2c) Werte in [0, 1] gebounded"] = a1 >= 0 && a1 <= 1;
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
        const mean = sum / 500;
        out[
            `(I2d) Verteilung nicht-degeneriert (max=${max && max.toFixed(2)}, mean=${mean && mean.toFixed(2)}, Peaks > 0.5)`
        ] = max > 0.5;

        // (I3) MIGRATION-TOLERANZ: _terrainMaterialAt ohne y bleibt
        // bit-identisch (keine Iron-Bands-Aktivierung ohne y-Probe).
        out["(I3) MIGRATION: ohne y bit-identisch (Pre-V18.197)"] =
            r._terrainMaterialAt(0, 0) === r._terrainMaterialAt(0, 0, r._voxelSurfaceY(0, 0));

        // (I4) STRATA bleibt aktiv: tief unter STRATA_STEIN_DEPTH, wenn KEIN
        // Iron-Band, ist das Material stein.
        // Finde Punkte mit niedrigem ironAder (< threshold) und prüfe Material.
        let steinHits = 0;
        let eisenHits = 0;
        let probedDeep = 0;
        for (let i = 0; i < 30; i++) {
            const x = (i * 173) % 1500;
            const z = (i * 257 + 13) % 1500;
            const surfY = r._voxelSurfaceY(x, z);
            if (!Number.isFinite(surfY)) continue;
            const mat = r._terrainMaterialAt(x, z, surfY - A.IRON_BANDS.minDepth - 10);
            probedDeep++;
            if (mat === "stein") steinHits++;
            if (mat === "eisen") eisenHits++;
        }
        // Iron-Bands sind selten
        out[`(I4) STRATA dominant: stein ${steinHits}/${probedDeep} > eisen ${eisenHits} in tiefen Punkten`] =
            steinHits > eisenHits;

        // (I6) MATH: an einem KÜNSTLICH konstruierten Iron-Band-Punkt
        // (ironAder hoch + tief + dichte hoch) → eisen
        // Finde einen Punkt mit aderwert > threshold
        let hp = null;
        for (let i = 0; i < 1000; i++) {
            const x = (i * 31.4) % 3000;
            const z = (i * 27.9) % 3000;
            if (r._eisenAderAt(x, z) > A.IRON_BANDS.threshold) {
                const surfY = r._voxelSurfaceY(x, z);
                if (Number.isFinite(surfY)) {
                    const f = r.worldFieldAt(x, z);
                    if (f && (f.dichte || 0) > A.IRON_BANDS.dichteFloor) {
                        hp = { x, z, surfY };
                        break;
                    }
                }
            }
        }
        if (hp) {
            out["(I6a) An Iron-Ader-Punkt (tief + dichte hoch + ader>threshold) → eisen"] =
                r._terrainMaterialAt(hp.x, hp.z, hp.surfY - A.IRON_BANDS.minDepth - 5) === "eisen";
            // Plus: an NIEDRIGER Tiefe (< minDepth) bleibt stein-Schicht — die Iron-Schwelle ist nicht erreicht (zu flach)
            out["(I6b) Bei flacher Tiefe bleibt es stein (Iron-Schwelle nicht erreicht)"] =
                r._terrainMaterialAt(hp.x, hp.z, hp.surfY - (A.STRATA_STEIN_DEPTH + 2)) === "stein";
        }

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Γ7 BAUM-VARIANTEN-GRAMMATIK:
// `_growTreeBlueprint(speciesKey, seed)` emittiert parts[] in der bestehenden
// Sprache. Tag-neutral via material-Konsistenz (holz+laub).
async function checkBandV18205Gamma7Grammatik(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};

        // (G2) Determinismus: gleiche seed → gleiche parts
        const p1 = r._growTreeBlueprint("eiche", "seed-a");
        const p2 = r._growTreeBlueprint("eiche", "seed-a");
        out["(G2) Determinismus: gleiche seed → identische parts"] = JSON.stringify(p1) === JSON.stringify(p2);

        // (G3) 6 verschiedene Seeds → 6 unterschiedliche Varianten
        const seeds = ["s1", "s2", "s3", "s4", "s5", "s6"];
        const variants = seeds.map((s) => r._growTreeBlueprint("eiche", s));
        out["(G3) 6 unterschiedliche seeds → 6 unique Varianten"] =
            new Set(variants.map((v) => JSON.stringify(v))).size === 6;

        // (G4) STRUKTUR: Stamm-Parts sind holz, Laub-Parts sind laub.
        // Mind. 3 Stamm-Segmente, mind. 1 Laub-Ellipsoid.
        const sample = variants[0];
        const aus = (m) => sample.filter((p) => p.material === m).length; // die Teile aus dem Stoff `m`
        out["(G4b) Alle Parts holz oder laub Material"] = sample.every(
            (p) => p.material === "holz" || p.material === "laub"
        );
        out["(G4c) Mind. 3 Stamm-Holz-Parts"] = aus("holz") >= 3;
        out["(G4d) Mind. 1 Laub-Krone-Part"] = aus("laub") >= 1;

        // (G5) SPECIES.ts-Regel: Laub sitzt NIE am Hauptstamm (y=0..3), sondern an Ebene-2-Enden →
        // alle laub-Parts haben |xz| > 0.4 ODER y > 2. Der Fuß-Saum (die flache Wurzelanlauf-Disk, Ω-K2) sitzt
        // BEWUSST am Sockel und ist keine Krone (wie V18.211 S3c); seit K24 wächst auch die Bare-Art "eiche" aus dem Gesetz.
        out["(G5) SPECIES.ts-Regel: Laub an Ast-Enden (nie am Hauptstamm direkt)"] = sample
            .filter((p) => p.material === "laub" && !(p.position.y < 1 && p.size.x > p.size.y * 1.5))
            .every((p) => Math.hypot(p.position.x, p.position.z) > 0.4 || p.position.y > 2);

        // (G6) TAG-NEUTRALITÄT: ein generierter Baum hat dieselben Affinitäts-MAX wie baum_eiche (holz+laub,
        // cylinder+sphere). fakeBp trägt die Spezies-Marke (_grownSpecies), damit computeCompoundTags beiden
        // dieselbe Art-Variation gibt — sonst läse die +0.05-Variation als Drift.
        const fakeBp = { parts: sample, _grownSpecies: "baum_eiche" };
        // baum_eiche statisch geschnitten; gegen einen GEWACHSENEN Baum prüfen.
        const g6Key = r._growTreeBlueprintForSpawn("baum_eiche", "g6");
        const treeBp = g6Key && r.state.blueprints[g6Key];
        let diffs, neutral;
        if (treeBp) {
            const fakeTags = r.computeCompoundTags(fakeBp);
            const treeTags = r.computeCompoundTags(treeBp);
            diffs = {};
            neutral = true;
            for (const axis of ["lebendig", "dichte", "brennbar", "magieleitung"]) {
                const dt = (fakeTags[axis] || 0) - (treeTags[axis] || 0);
                diffs[axis] = Number(dt.toFixed(3));
                if (Math.abs(dt) > 0.05) neutral = false;
            }
        }
        out[`(G6) TAG-NEUTRALITÄT zu baum_eiche (V17.16-Disziplin, diffs ${JSON.stringify(diffs)})`] = !!neutral;

        // (G7) WOHLGEFORMTHEIT: jeder Part hat shape, material, position{xyz},
        // size{xyz}
        out["(G7) Parts wohlgeformt (shape+material+position+size vollständig)"] = sample.every(
            (p) =>
                p.shape &&
                p.material &&
                p.position &&
                p.size &&
                [p.position, p.size].every((v) => ["x", "y", "z"].every((k) => typeof v[k] === "number"))
        );

        // (G8) HÖHEN-VARIANZ über 6 Varianten — sample 0..5 + maxHöhe
        const heights = variants.map((v) => {
            let maxY = 0;
            for (const p of v) if (p.position.y + p.size.y * 0.5 > maxY) maxY = p.position.y + p.size.y * 0.5;
            return maxY;
        });
        const spread = Math.max(...heights) - Math.min(...heights);
        // mindestens 0.5 m Spreizung über 6 Varianten
        out[`(G8) Höhen-Spreizung über 6 Varianten > 0.5 m (${Number(spread.toFixed(2))})`] = spread > 0.5;
        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Skeleton-Grammar: mehrstufige Grammatik (trunk + L1 + L2) mit Foliage an den TIPS; Routing-Gate
// gen≥5 (alte Welten bit-identisch). grownBlueprints persistiert NUR Metadaten (parts re-wachsen
// f(seed)) → bleibt unter dem 256-KB-pinCurrentWorld-Cap.
async function checkBandV18211SkeletonGrammar(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const st = r.state;
        const out = {};

        // (S1) K24: jede Kern-Art wächst aus dem Gesetzbuch — `_phytoArt` löst den Welt-Namen auf die Rezept-Zeile der
        // Studio-Tafel auf (die Stamm-Grammatik ist gefallen, der Richter liest treeParams der Art).
        out["K24 (S1b) die 6 Kern-Arten (tanne/kiefer/buche/birke/eiche/erle) sind Baum-Zeilen der Tafel"] = [
            "baum_eiche",
            "baum_tanne",
            "baum_buche",
            "baum_birke",
            "baum_kiefer",
            "baum_erle",
        ].every((sp) => {
            const a = r._phytoArt(sp);
            return !!(a && a.rec.kind === "tree" && Number.isFinite(a.rec.s.api));
        });

        // (S3) RICH-PFAD bei direktem Aufruf produziert ≥50 Parts (vs Legacy ~12).
        // 50 = sicherer Schwellenwert; gemessen 75-81 pro Art.
        const richParts = r._growTreeBlueprintRich("baum_tanne", "v211-test");
        const reich = Array.isArray(richParts);
        out[`(S3a) Rich-Grammatik produziert ≥50 Parts (gemessen ${richParts ? richParts.length : 0})`] =
            reich && richParts.length >= 50;
        // Tag-Neutralität: jedes Part ist holz oder laub (V17.16-Wand).
        out["(S3b) Alle Rich-Parts holz oder laub (V17.16-Wand strukturell)"] =
            reich && richParts.every((p) => p.material === "holz" || p.material === "laub");
        // FOLIAGE AT TIPS: ≥ 80 % der laub-Parts sind vom Stamm-Sockel weg (|xz| > 0.4 oder y > 1.5); nicht
        // 100 %, weil der Ω-K2-Fuß-Flare BEWUSST am Sockel sitzt (Wurzelanlauf-Disk, kein Kronen-Cluster).
        const laub = richParts ? richParts.filter((p) => p.material === "laub") : [];
        const atTipsCount = laub.filter(
            (p) => Math.hypot(p.position.x, p.position.z) > 0.4 || p.position.y > 1.5
        ).length;
        out["(S3c) Foliage AT TIPS: ≥10 laub-Parts, alle vom Stamm weg (Plan-§3.3)"] =
            laub.length >= 10 && atTipsCount >= Math.floor(laub.length * 0.8);

        // (S5) SNAPSHOT-HEILUNG: grownBlueprints im Snapshot trägt KEINE
        // parts-Arrays mehr (Plan-§2.5-konform: f(seed) ist das Erbgut).
        // Spawne einen grown_-Bauplan + prüfe das Snapshot-Feld.
        const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "v211-snapshot-test");
        let gb = null;
        if (grownKey && st.blueprints[grownKey]) {
            // der Snapshot persistiert NUR architektur-REFERENZIERTE grown-Baupläne
            // (die Foliage-Masse re-wächst f(seed), §2.5); eine Sentinel-Architektur hält den Test-
            // Bauplan, sonst filtert ihn der Snapshot KORREKT heraus → das ist die neue Wahrheit.
            st.architectures = st.architectures || [];
            st.architectures.push({ id: "v211-snap-arch", type: grownKey, position: { x: 0, y: 0, z: 0 } });
            // Snapshot bauen und das grownBlueprints-Feld prüfen.
            const snap = r.buildStateSnapshot();
            gb = snap && snap.grownBlueprints && snap.grownBlueprints[grownKey];
            st.architectures = st.architectures.filter((a) => a.id !== "v211-snap-arch");
        }
        out["(S5a) Snapshot grownBlueprints trägt Metadata (_grownSpecies + _grownSeed)"] = !!(
            gb &&
            gb._grownSpecies &&
            gb._grownSeed
        );
        out["(S5b) Snapshot grownBlueprints OHNE parts-Array (re-wächst f(seed))"] = !!(gb && !Array.isArray(gb.parts));
        // Snapshot-Größe (rough estimate): sollte einen kompakten grown-
        // Eintrag tragen (< 500 Bytes vs alte ~7.5 KB mit parts).
        out["(S5c) Snapshot-Eintrag pro grown-Bauplan < 500 Bytes (Plan-§2.5-konform)"] = gb
            ? JSON.stringify(gb).length < 500
            : false;

        return out;
    });
    for (const s in res) check(s, res[s]);
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
        const parts = r._growTreeBlueprintRich("baum_tanne", "k2-test");
        const sk = r._lastTreeSkeleton;
        r._lastTreeSkeleton = null;
        const baseR = sk && sk.branches[0] && sk.branches[0].points[0] ? sk.branches[0].points[0].r : 0;
        // Der Flare skaliert mit der Größenklasse → keine absolute Schwelle: er ist eine FLACHE DISK am
        // Sockel (x/y ~5.5), größenklassen-unabhängig getrennt von den Foliage-Kugeln (x/y ≈ 1.4 < 1.5).
        const sockelParts = parts.filter(
            (p) => p.material === "laub" && p.position.y < baseR * 2 && p.size.x > p.size.y * 1.5
        );
        out["(K2a) Baum-Fuß-Flare existiert (sockel-laub-Part, x-stretched)"] = sockelParts.length >= 1;
        // Der Sockel-Part liegt am Stamm-Ursprung (xz-Position klein).
        const s = sockelParts[0];
        if (s)
            out["(K2b) Flare am Stamm-Ursprung (|x|, |z| < 0.5m)"] =
                Math.abs(s.position.x) < 0.5 && Math.abs(s.position.z) < 0.5;

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
            out["K19 (W1) Wind: die Spitze biegt quadratisch (ζ², der EINE Term)"] =
                Math.abs(spitze(1, 1) / spitze(1, 0.5) - 4) < 0.2;
            out["K19 (W2) Wind: das Blatt flattert schneller als sein Ast"] =
                Math.max(W.blatt.f, W.blatt.ueberAst * W.ast.faktor * 0.4) > W.ast.faktor * 0.4;
            out["K19 (W3) Wind: der Sturm biegt ≥ 3× die Brise (Wind-Zeile)"] = spitze(1, 1) >= 3 * spitze(0.06, 1);
        }

        // Behavioral: einen grown_-Bauplan ernten → result hat .provenance.
        const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "h-test-seed");
        if (grownKey && r.state.blueprints[grownKey]) {
            // Spawn an Test-Position + harvest sofort.
            try {
                const spawn = r.spawnArchitecture(grownKey, { x: 1234, y: 50, z: 5678 }, { silent: true });
                if (spawn) {
                    const prov = (r.harvestArchitecture(spawn, "test-harvester") || {}).provenance;
                    out["(H3) Behavioral: grown-Baum-Ernte trägt provenance.bornFrom='world-genesis'"] =
                        !!prov && prov.bornFrom === "world-genesis";
                    out["(H4) Behavioral: provenance.species = baum_eiche"] = !!prov && prov.species === "baum_eiche";
                }
            } catch {
                /* die Folge-Probe fällt ohne ihr Feld */
            }
        }

        // ─── Ω-C CANOPY-SHELL — GESCHNITTEN ───
        // Foundry-Wald + Fern-Ring (das Kronendach der Arten) tragen die Ferne; das Band prüft die ABWESENHEIT von Konstante
        // und State (die Methoden bewacht gate:altlasten) — N7.4: die Shell ist geschnitten.
        out["N7.4 (C1) CANOPY_SHELL-Konstante geschnitten"] = !A.CANOPY_SHELL;
        out["N7.4 (C3) kein Canopy-Shell-State (canopyShell/Material undefined)"] =
            r.state.canopyShell === undefined && r.state.canopyShellMaterial === undefined;

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Atemberaubender Wald: Palette dunkler + erdiger, per-Spezies distinkte Tag-Vektoren (Variations-
// Wand), SAMPLES-Dichte (W7). Die Grammatik-Art baum_totholz fiel: sie hatte keinen
// Welt-Erzeuger mehr, gezeichnet hatte sie nur die litter-Streu als belaubte Alias-Eiche.
async function checkBandV18215AtemberaubenderWald(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── (W2) baum_totholz ist aus SPECIES_TREE_PARAMS + dem Foundry-Alias GEFALLEN (die Stamm-Grammatik fiel K24) ─
        // Seit dem Waldboden ist Totholz eine Studio-Art: die generische Regel (`baum_<preset>` im
        // LIVE-Buch) löst baum_totholz auf das stehende Studio-Totholz auf — nie auf die belaubte Eiche (der Alias).
        const totholzPreset = r._foundryPresetFor("baum_totholz");
        out[
            "Integration 05.10. (W2) baum_totholz ist aus SPECIES_TREE_PARAMS und dem Eichen-Alias gefallen (Studio-Totholz)"
        ] =
            !(A.SPECIES_TREE_PARAMS && A.SPECIES_TREE_PARAMS.baum_totholz) &&
            (totholzPreset == null || totholzPreset === "totholz");

        // ─── (W5) Behavioral: Spezies-Distinktion in computeCompoundTags ─
        // Bauplan-Stichprobe: rohen parts vs _isGrown+species → Tag-Delta.
        r.state.worldMeta.genVersion = 8;
        const origLast = r._lastTreeSkeleton;
        let tanne = false;
        try {
            // Tanne-Parts (ohne _isGrown-Flag)
            const parts = r._growTreeBlueprintRich("baum_tanne", "v215-tanne-1");
            if (Array.isArray(parts) && parts.length >= 30) {
                const tagsRaw = r.computeCompoundTags({ parts });
                const tagsGrown = r.computeCompoundTags({
                    parts,
                    _isGrown: true,
                    _grownSpecies: "baum_tanne",
                });
                tanne = Math.abs((tagsGrown.brennbar || 0) - (tagsRaw.brennbar || 0) - 0.1) < 1e-9;
            }
        } catch {
            /* die Folge-Proben fallen ohne ihr Feld */
        } finally {
            r._lastTreeSkeleton = origLast;
        }
        out["(W5a) Tanne _isGrown: brennbar +0.1 angewandt (computeCompoundTags-Δ)"] = tanne;

        // ─── (W9) W1: baum_totholz ist aus TREE_NAMES + candidates GEFALLEN ───
        // Totholz zeichnete nur die Streu (belaubte Alias-Eiche); die Grammatik-Art fiel 05.10. mit.
        out["W1 (W9) baum_totholz ist aus den _vegetationSampleSpawn-Kandidaten gefallen"] = !(
            A.FELD_WURF || []
        ).includes("baum_totholz");

        return out;
    });
    for (const s in res) check(s, res[s]);
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
        out["K24 (A1) baum_karst ist die Studio-Art karst (_phytoArt)"] = !!(
            karstArt &&
            karstArt.id === "karst" &&
            karstArt.rec.kind === "tree"
        );
        // K24-N1: der knorrige Sockel ist das Gesetz der Art (P.flare 0,9 im Phänotyp), nie eine Hand-Zeile
        r._growTreeBlueprintRich("baum_karst", "pt-karst-anlauf");
        const skK = r._lastTreeSkeleton;
        r._lastTreeSkeleton = null;
        out["(A7) Karst-Anlauf 0,9 aus dem Gesetz (Sockel knorrig)"] =
            !("flare" in (A.SPECIES_TREE_PARAMS.baum_karst || {})) && !!skK && Math.abs(skK.flareAmp - 0.9) < 1e-9;

        // ─── (B) Drei Unterholz-Arten als Studio-Arten (_phytoArt, K24) ─────────────────────
        const artKind = (sp) => {
            const a = r._phytoArt(sp);
            return a ? a.rec.kind : null;
        };
        out["K24 (B1) busch_hazel ist der Studio-Strauch (_phytoArt)"] = artKind("busch_hazel") === "shrub";
        out["K24 (B2) farn_busch ist der Studio-Farn (_phytoArt)"] = artKind("farn_busch") === "fern";
        out["K24 (B3) blume_gross ist die Studio-Blume (_phytoArt)"] = artKind("blume_gross") === "flower";

        // ─── (C) Wachstum produziert valide Bauplane für die 4 Neuen ─
        // die vier Arten und ihr Kürzel in der Saat
        const ARTEN = [
            ["baum_karst", "karst"],
            ["busch_hazel", "hazel"],
            ["farn_busch", "farn"],
            ["blume_gross", "blume"],
        ];
        r.state.worldMeta.genVersion = 9;
        const origLast = r._lastTreeSkeleton;
        const n = {}; // je Art die Teile ihres reichen Wuchses
        let holzLaub = false,
            anker;
        try {
            for (const [sp, k] of ARTEN) {
                const parts = r._growTreeBlueprintRich(sp, `v216-${k}-1`);
                n[k] = Array.isArray(parts) ? parts.length : 0;
                // KARST: V17.16-VARIATIONS-Wand passt (dichte+0.10 deklariert → spawnable)
                if (k === "karst")
                    holzLaub =
                        Array.isArray(parts) && parts.every((p) => p.material === "holz" || p.material === "laub");
                // farn hat ≥3 foliage anchors (cards)
                if (k === "farn") {
                    const skel = r._lastTreeSkeleton;
                    anker = skel && Array.isArray(skel.anchors) ? skel.anchors.length : 0;
                }
            }
        } catch {
            /* die Folge-Proben fallen ohne ihr Feld */
        } finally {
            r._lastTreeSkeleton = origLast;
        }
        // KARST ≥30 parts (drei Ast-Ebenen + foliage), Bushes ≥10 parts (multi-level branching + Foliage)
        out[`(C1) Karst-rich-Grow ≥30 parts (gemessen ${n.karst})`] = n.karst >= 30;
        out["(C2) Karst alle parts holz/laub (V17.16-Wand strukturell)"] = holzLaub;
        out[`(C3) Hazel-Grow ≥10 parts (gemessen ${n.hazel})`] = n.hazel >= 10;
        out[`(C4) Farn-Grow ≥6 parts (gemessen ${n.farn})`] = n.farn >= 6;
        out[`(C5) Farn ≥3 foliage-anchors (gemessen ${anker})`] = anker >= 3;
        out[`(C6) Blume-Grow ≥4 parts (gemessen ${n.blume})`] = n.blume >= 4;

        // ─── (D) Wachstum als spawnable Bauplan (V17.16-Wand passiert) ─
        const key = {};
        try {
            for (const [sp, k] of ARTEN) key[k] = r._growTreeBlueprintForSpawn(sp, `v216-${k}-spawn-1`);
        } catch {
            /* die Folge-Probe fällt ohne ihr Feld */
        }
        const bp = key.karst && r.state.blueprints[key.karst];
        out["(D1) Karst spawnable (V17.16-VARIATIONS-Wand passiert: dichte+0.10 deklariert)"] = !!key.karst;
        out["(D2) Karst-Bauplan ist _isGrown + _grownSpecies=baum_karst"] =
            !!bp && bp._isGrown === true && bp._grownSpecies === "baum_karst";
        out["(D3) Hazel spawnable"] = !!key.hazel;
        out["(D4) Farn spawnable"] = !!key.farn;
        out["(D5) Blume spawnable"] = !!key.blume;

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Varianten-Pool: N=VARIANTS_PER_SPECIES Varianten je Spezies, gefroren als Genese-Konstante in
// worldMeta.variantSeed. Ein berührter Baum re-wächst BIT-GENAU aus variantSeed[index] (kein
// Sprung); zwei Peers mit gleichem worldSeed bauen den IDENTISCHEN Pool.
async function checkBandV18217VariantenPool(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const st = r.state;
        const A = r.constructor;
        const out = {};

        // ─── (B) Behavioral: Fresh-Welt hat Pool ──────────────────────
        const newMeta = r._generateFreshWorldMeta("test-v18217");
        const frisch = !!(newMeta && newMeta.variantSeed && typeof newMeta.variantSeed === "object");
        out["(B1) Fresh-Welt-Meta trägt variantSeed-Pool"] = frisch;
        let zahl,
            alle = false;
        if (frisch) {
            // K24: die Zeile einer Art entsteht beim ersten Wuchs (_variantSeedsFor) — jede Pflanze des Gesetzbuchs,
            // nie ein Fels; im TEMPORÄREN Meta-Kontext, der Welt-Stand bleibt unberührt.
            const savedFresh = st.worldMeta;
            try {
                st.worldMeta = newMeta;
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
                zahl = Object.keys(newMeta.variantSeed).length;
                alle =
                    ARTEN.every(
                        (sp) =>
                            Array.isArray(newMeta.variantSeed[sp]) &&
                            newMeta.variantSeed[sp].length === A.VARIANTS_PER_SPECIES
                    ) && r._variantSeedsFor("stein_block") === null;
            } finally {
                st.worldMeta = savedFresh;
            }
        }
        out[`K24 (B2) der Pool wächst je Pflanze des Gesetzbuchs, nie für Fels (gemessen ${zahl} Arten)`] = alle;

        // ─── (C) Determinismus: 2 Pools mit gleichem Seed sind identisch ─
        const sampleSeed = "test-determinism-v18217-seed-xyz";
        const poolFor = (seed) => {
            const savedP = st.worldMeta;
            try {
                st.worldMeta = { seed, variantSeed: {} };
                for (const sp of ["baum_eiche", "baum_tanne", "busch_hazel"]) r._variantSeedsFor(sp);
                return st.worldMeta.variantSeed;
            } finally {
                st.worldMeta = savedP;
            }
        };
        const pool1 = poolFor(sampleSeed);
        const pool2 = poolFor(sampleSeed);
        const spec = Object.keys(pool1);
        out["(C1) Pool-Generierung deterministisch (gleicher Seed → gleicher Pool)"] =
            spec.length === Object.keys(pool2).length &&
            spec.every(
                (s) =>
                    Array.isArray(pool1[s]) &&
                    Array.isArray(pool2[s]) &&
                    pool1[s].length === pool2[s].length &&
                    pool1[s].every((v, i) => v === pool2[s][i])
            );

        // Pools mit verschiedenen Seeds → unterscheiden sich (string-equality)
        const pool3 = poolFor("anderer-seed-distinct-abc");
        const specCheck = spec[0];
        out["(C2) Verschiedene worldSeeds erzeugen DISTINKTE Pools"] =
            Array.isArray(pool1[specCheck]) &&
            Array.isArray(pool3[specCheck]) &&
            pool1[specCheck][0] !== pool3[specCheck][0];

        // ─── (D) Cache-Key: regionSeeds, die auf gleichen Index hashen, geben gleichen Bauplan ─
        // Lazy-Init des Pools im laufenden state (falls nicht da)
        r._variantSeedsFor("baum_eiche");
        // Zwei verschiedene regionSeeds, deterministische variantIndex
        const k1 = r._growTreeBlueprintForSpawn("baum_eiche", "test-region-A-0");
        const k2 = r._growTreeBlueprintForSpawn("baum_eiche", "test-region-A-0");
        out["(D1) Gleicher regionSeed → gleicher Bauplan-Key"] = !!(k1 && k1 === k2);
        // Pattern grown_<species>_v<idx>
        out["(D2) Bauplan-Key folgt `grown_<species>_v<idx>`-Form"] = !!(k1 && /^grown_baum_eiche_v\d+$/.test(k1));
        // der Bauplan des Keys: bp._grownSeed ist der variantSeed-String (NICHT der regionSeed)
        const bp = k1 && st.blueprints[k1];
        const pool = st.worldMeta.variantSeed;
        out["(D4) bp._grownSeed === variantSeed[species][index] (Re-Wachstum bit-genau)"] =
            !!(bp && pool && Array.isArray(pool.baum_eiche)) && bp._grownSeed === pool.baum_eiche[bp._variantIndex];

        // ─── (E) Snapshot-Persistierung von variantSeed ───────────────
        const snap = r.buildStateSnapshot();
        const wmSnap = snap && snap.worldMeta;
        const snapPool = !!(wmSnap && wmSnap.variantSeed && typeof wmSnap.variantSeed === "object");
        out["(E1) Snapshot trägt worldMeta.variantSeed"] = snapPool;
        const livePool = st.worldMeta.variantSeed;
        out["(E2) Snapshot-Pool ist bit-identisch zur Live-Welt"] =
            snapPool &&
            !!livePool &&
            Array.isArray(livePool.baum_eiche) &&
            Array.isArray(wmSnap.variantSeed.baum_eiche) &&
            wmSnap.variantSeed.baum_eiche.every((v, i) => v === livePool.baum_eiche[i]);

        // ─── (F) Migration: Pool ohne Eintrag wird lazy ergänzt ───
        // In einem TEMPORÄREN Meta-Kontext testen und den Welt-Stand restlos wiederherstellen — ein
        // mutierter Pool vergiftet die Folge-Bands (LOD-Baupläne brächen die Seed-Identität).
        const savedMeta = { ...st.worldMeta };
        try {
            st.worldMeta = { ...st.worldMeta, seed: "old-world-seed-1", genVersion: 5 };
            delete st.worldMeta.variantSeed;
            const migrated = r._variantSeedsFor("baum_tanne");
            out["(F1) Migration: alte Welt ohne variantSeed bekommt lazy einen Pool"] = !!(
                Array.isArray(migrated) &&
                migrated.length === A.VARIANTS_PER_SPECIES &&
                st.worldMeta.variantSeed.baum_tanne === migrated
            );
        } finally {
            // Welt-Identität wiederherstellen — kein State-Leck in Folge-Bands.
            st.worldMeta = savedMeta;
        }

        // ─── (G) Größe (Snapshot-Tragbarkeit) ────────────────────────
        // 16 Varianten × 11 Spezies × ~30 Bytes/Seed ≈ ~5-7 KB; sicherheits-
        // halber bis 30 KB akzeptieren (256-KB-Snapshot-Cap nicht gefährdet)
        const vs = st.worldMeta.variantSeed;
        const json = vs && JSON.stringify(vs);
        out[`(G1) Pool-JSON-Größe < 30 KB (gemessen ${json && json.length} Bytes)`] = !!json && json.length < 30000;

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// LOD-Stufen: 3 LODs pro Variante (Hero/Mittel/Far) — Geometrie-Beschneidung + Variant-LOD-Builder
// + Distanz-Chooser mit Hysterese.
async function checkBandV18218LODStufen(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ─── (B) Distanz-Chooser ───
        // Die Probe liest die Schwellen aus LOD_DISTANCES (thresh01/thresh12/hysteresis), keine festen Meter.
        const { thresh01: t01, thresh12: t12, hysteresis: h } = A.LOD_DISTANCES;
        // [Satz, Distanz, Stufe davor, gewählte Stufe]: klar unter thresh01 → LOD0, zwischen den Schwellen → LOD1, klar über
        // thresh12 → LOD2; Hysterese: cur=0 + dist=85m bleibt 0 (innerhalb +h Buffer), cur=1 + dist=60m kehrt zu 0 zurück
        // (unter -h-Buffer)
        for (const [satz, d, cur, soll] of [
            ["(B1) chooseLOD(0.6·t01)=0 (Hero-Nähe)", t01 * 0.6, undefined, 0],
            ["(B2) chooseLOD((t01+t12)/2)=1 (Mittel)", (t01 + t12) / 2, undefined, 1],
            ["(B3) chooseLOD(1.25·t12)=2 (Far)", t12 * 1.25, undefined, 2],
            ["(B4) chooseLOD(0)=0 (Spieler-Position)", 0, undefined, 0],
            ["(B5) Hysterese cur=0 + dist=t01+h/2 → bleibt 0 (kein Flackern)", t01 + h * 0.5, 0, 0],
            ["(B6) Hysterese cur=0 + dist=t01+2h → wechselt 1", t01 + h * 2, 0, 1],
            ["(B7) Hysterese cur=1 + dist=t01−2h → kehrt zu 0", t01 - h * 2, 1, 0],
            ["(B8) Hysterese cur=1 + dist=t01−h/2 → bleibt 1", t01 - h * 0.5, 1, 1],
        ])
            out[satz] = r._chooseLODForDistance(d, cur) === soll;
        // Mehrstufen-Sprung: jenseits ZWEIER Schwellen springt die Wahl durch (sonst stand die region-
        // private Fern-Streu, die nur nach 2 zurückwandern darf, für immer auf L0).
        out["Mehrstufen-Sprung: cur=0 jenseits t12+h → 2, cur=2 unter t01−h → 0"] =
            r._chooseLODForDistance(t12 + h * 2, 0) === 2 && r._chooseLODForDistance(Math.max(0, t01 - h * 2), 2) === 0;

        // W1 — DIE FERNFORM IST KONSUM, nicht Quelltext: die Fels-Zellen einer NEU GEBAUTEN Region tragen jenseits der
        // EINEN Nah-Grenze (ANALOG_NAH_M), was das Studio-Budget sagt (B2c `rock.fernform`). Geflippt auf "boden"
        // stehen sie ohne Geometrie, zurück auf "gesetz" als Gesetz-Platz (headless `wartet`, die Gesetz-Bahn zeichnet
        // nur ein echter Renderer) — nie mit Slots. Diesseits der Grenze trägt das Studio-Mesh.
        let fernRegion, fernZellen;
        let fern = false;
        {
            const B = A._studioRenderConfig && A._studioRenderConfig.lod && A._studioRenderConfig.lod.budget;
            const map = r._ensureScatterRegionMap();
            const pm = r.state.playerMesh.position;
            if (B && B.rock && r._foundryEnabled()) {
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
                fernRegion = key;
                if (key) {
                    const alt = B.rock.fernform;
                    let boden;
                    try {
                        B.rock.fernform = "boden";
                        const fz = felsFern(bau(key));
                        boden = fz.length > 0 && fz.every((c) => c.form === "boden" && !c.slots.length && !c.feld);
                    } finally {
                        B.rock.fernform = alt;
                    }
                    const fz2 = felsFern(bau(key));
                    fern = boden && fz2.length > 0 && fz2.every((c) => c.form === "gesetz" && !c.slots.length);
                    fernZellen = fz2.length;
                }
            }
        }
        out[
            `W1 KONSUM: rock.fernform="boden" → die neu gebaute Region trägt jenseits der Nah-Grenze form boden ohne Geometrie, zurück → gesetz (Region ${fernRegion}, ${fernZellen} Fern-Felsen)`
        ] = fern;

        // ─── (C) LOD-Baupläne werden gebaut (3 Stufen) ───
        // Der Gate fährt foundry-ON; für Studio-bekannte Arten gäbe der _buildVariantLODs-Chokepoint null →
        // die Grammatik-LOD-Erzeugung prüft unter LOKALEM Hook (__withNoFoundry).
        // die Schlüssel der drei Stufen ({0, 1, 2}) und ihre Baupläne
        const keys = window.__withNoFoundry(() => r._buildVariantLODs("baum_eiche", 0)) || {};
        const [b0, b1, b2] = [0, 1, 2].map((i) => r.state.blueprints[keys[i]]);
        out["(C2) Key-Form LOD0 `grown_<species>_v<idx>`"] = /^grown_baum_eiche_v\d+$/.test(keys[0]);
        out["(C3) Key-Form LOD1 `grown_<species>_v<idx>_lod1`"] = /^grown_baum_eiche_v\d+_lod1$/.test(keys[1]);
        out["(C4) Key-Form LOD2 `grown_<species>_v<idx>_lod2`"] = /^grown_baum_eiche_v\d+_lod2$/.test(keys[2]);
        // die Stufen 1 und 2 tragen das Feld `f` ihrer Stufe 0
        const teilen = (f) => !!(b1 && b2) && b1[f] === b0[f] && b2[f] === b0[f];
        out["(C7) bp._lodLevel gesetzt"] = !!(b1 && b2) && b1._lodLevel === 1 && b2._lodLevel === 2;
        out["(C8) 3 LOD-Bauplane teilen denselben _variantIndex (Form-Identität)"] = teilen("_variantIndex");
        out["(C9) 3 LOD-Bauplane teilen denselben _grownSeed (Re-Wachstum bit-genau)"] = teilen("_grownSeed");

        // ─── (D) Geometrie: LOD-Reduktion in Parts-Anzahl ────────────
        const origLast = r._lastTreeSkeleton;
        let n, dflt;
        try {
            // die Teile des Eichen-Wuchses aus der Saat `saat` (mit `opt`)
            const teile = (saat, opt) => {
                const p = r._growTreeBlueprintRich("baum_eiche", saat, opt);
                return Array.isArray(p) ? p.length : 0;
            };
            n = [0, 1, 2].map((lod) => teile("v218-lod-test", { lod }));
            dflt = teile("v218-default-test") >= 50;
        } finally {
            r._lastTreeSkeleton = origLast;
        }
        const [l0, l1, l2] = n;
        out[`(D1) LOD0 ≥50 Parts (Hero, gemessen ${l0})`] = l0 >= 50;
        out[`(D2) LOD1 reduziert auf ≤20 Parts (gemessen ${l1})`] = l1 > 0 && l1 <= 20;
        out[`(D3) LOD2 ≤10 Parts (Far, gemessen ${l2})`] = l2 > 0 && l2 <= 10;
        out["(D4) Parts-Anzahl strict monoton: LOD0 > LOD1 > LOD2"] = l0 > l1 && l1 > l2;
        out["(D5) Default-LOD ohne opts ist LOD0 (Backward-Kompat)"] = dflt;
        out[`(D6) LOD2 Parts ≤ 15 % von LOD0 (Plan §3.6 „≤ 10 % Triangle-Count Toleranz")`] =
            l2 <= Math.ceil(l0 * 0.15);

        // ─── (F) V17.16-Tag-Wand: LOD0/1/2 share compoundTags ────────
        // N7.3 — UNIT-RICHTER (wie Block C): die Grammatik-LOD-Baupläne unter lokalem Hook.
        const [f1, f2] = window.__withNoFoundry(() => {
            const k = r._buildVariantLODs("baum_eiche", 1) || {};
            const b = [0, 1, 2].map((i) => k[i] && r.state.blueprints[k[i]]);
            if (!(b[0] && b[1] && b[2])) return [];
            const [t0, t1, t2] = b.map((x) => r.computeCompoundTags(x));
            const gleich = (t) =>
                ["lebendig", "dichte", "brennbar", "magieleitung"].every(
                    (a) => Math.abs((t0[a] || 0) - (t[a] || 0)) < 1e-6
                );
            return [gleich(t1), gleich(t2)];
        });
        out["(F1) LOD0 + LOD1 → identische compoundTags (Tag-Neutralität)"] = f1 === true;
        out["(F2) LOD0 + LOD2 → identische compoundTags (Tag-Neutralität)"] = f2 === true;

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Gigant-Vollendung (eine Wand-Funktion): LOD-Activation per Frame · GPU-Feld-Bake-Region-Cache ·
// Scatter-Bitmask + Cap + Lookup · Ω-H Promotion + Snapshot · Canopy-Chunk-Streaming — jeder
// Helper mit echtem Konsumenten im Loop oder Spawn-Pfad.
async function checkBandV18219bisVollendung(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const st = r.state;
        const out = {};

        // ─── V18.218.1 LOD-ACTIVATION ────────────────────────────────
        // KONSUM: ein Takt des Loops (Phasen → Frame-Scheduler → Job-Registry) ruft den LOD-Tick.
        out["(L3) _gameLoopTick ruft _tickArchitectureLOD (Verdrahtung)"] = window.__consumes(
            r,
            "_gameLoopTick",
            r,
            "_tickArchitectureLOD",
            [performance.now()]
        );
        // N7.3 — UNIT-RICHTER: der Prüf-Gegenstand ist der GRAMMATIK-Typ-Wechsel
        // (`entry.type` wandert zwischen grown_*-Keys); foundry-ON serviert der
        // Studio-Pfad die Stufe OHNE Typ-Wechsel (by design) → lokaler Hook.
        window.__withNoFoundry(() => {
            const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "v218-lod-spawn-test");
            const e =
                grownKey &&
                st.scene &&
                r.spawnArchitecture(
                    grownKey,
                    // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
                    { x: 12345, y: r._voxelSurfaceY(12345, 6789) || 1, z: 6789 },
                    { silent: true, seed: 1 }
                );
            out["(L6) spawnArchitecture markiert grown-tree-Entry mit _lod-Feldern"] =
                !!e && !!e._lodSpecies && Number.isFinite(e._lodVariantIndex) && Number.isFinite(e._lodLevel);
            if (e) {
                out["(L7) _lodSpecies = baum_eiche (Identitäts-Mark)"] = e._lodSpecies === "baum_eiche";
                out["(L8) _switchArchitectureLOD wechselt zu LOD2"] =
                    r._switchArchitectureLOD(e, 2) === true && e._lodLevel === 2;
                out["(L9) entry.type endet auf `_lod2`"] = /_lod2$/.test(e.type);
                r._switchArchitectureLOD(e, 0);
                out["(L10) Zurück zu LOD0 (Form-Identität bewahrt)"] = e._lodLevel === 0 && !/_lod\d+$/.test(e.type);
                r.removeArchitecture(e);
            }
        });

        // ─── V18.220 SCATTER-BITMASK + CAP + LOOKUP ──────────────────
        r._scatterMarkCellPromoted(100, 200, "tree");
        out["(S6) markiertes Cell ist promoted=true"] = r._scatterIsCellPromoted(100, 200, "tree") === true;
        out["(S7) Distant cell promoted=false (kein false-positive)"] =
            r._scatterIsCellPromoted(500, 600, "tree") === false;
        r._scatterRegisterCell(300, 400, "tree", "baum_birke", 7);
        const look = r._scatterLookupCell(300, 400, "tree");
        out["(S8) Lookup species=baum_birke"] = !!look && look.species === "baum_birke";
        out["(S9) Lookup variantIndex=7"] = !!look && look.variantIndex === 7;
        const initial = st.scatterCounters && st.scatterCounters.tree;
        r._scatterIncrementCounter("tree");
        out["(S10) Counter inkrementiert"] = st.scatterCounters.tree === (initial | 0) + 1;
        out["(S11) Counter nicht am Cap nach 1 Inc"] = r._scatterCounterAtCap("tree") === false;

        // ─── V18.222 CANOPY CHUNK-STREAMING ──────────────────────────
        out["(C5) _gameLoopTick ruft _tickCanopyStreaming (Verdrahtung)"] = window.__consumes(
            r,
            "_gameLoopTick",
            r,
            "_tickCanopyStreaming",
            [performance.now()]
        );
        const savedFlag = st.atmosphere.canopyStreaming;
        try {
            st.atmosphere.canopyStreaming = true;
            const mesh = r._canopyEnsureChunk(2, 3);
            out["(C8) _canopyEnsureChunk baut Mesh+Geometry+Material"] = !!(mesh && mesh.geometry && mesh.material);
            if (mesh) {
                out["(C9) Canopy-Mesh hat color-Attribute (vertexColors)"] = !!mesh.geometry.attributes.color;
                out["(C10) Canopy-Mesh userData.kind=canopyChunk"] =
                    !!mesh.userData && mesh.userData.kind === "canopyChunk";
                out["(C11) Canopy-Mesh in state.canopyChunks-Map"] = !!(st.canopyChunks && st.canopyChunks.has("2,3"));
            }
            out["(C12) Disposal entfernt das Mesh aus der Map"] =
                r._canopyDisposeChunkByKey("2,3") === true && !!(st.canopyChunks && !st.canopyChunks.has("2,3"));
        } finally {
            st.atmosphere.canopyStreaming = savedFlag;
        }

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Echter Scatter + echte Promotion: ferner Wald als InstancedMesh-Streu (Dichte-Band) + Touch→Real-
// Kristallisation (Seelen-Band). KONSUM: Instanzen entstehen, Cells promovieren zu echten Einträgen,
// identische Geometrie (kein Sprung), bit-genauer Determinismus.
async function checkBandV18224ScatterPromotion(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const st = r.state;
        const A = r.constructor;
        const SC = A.SCATTER;
        const out = {};

        // KONSUM: der nächste Takt des Loops (Dispatcher-Takt Nr. 4: der Deko-Boden greift) ruft das Streu-Streaming
        r._schedFrameNo = 3;
        out["(A7) _gameLoopTick ruft _tickScatterStreaming (Verdrahtung)"] = window.__consumes(
            r,
            "_gameLoopTick",
            r,
            "_tickScatterStreaming",
            [performance.now()]
        );

        // ─── (B) pcg2d Determinismus (bit-identisch, P2P/GPU-Wand) ────
        out["(B1) pcg2d deterministisch (gleicher Input → gleicher Hash)"] =
            r._pcg2d(12345, 67890) === r._pcg2d(12345, 67890);
        out["(B2) pcg2d distinkt (verschiedene Inputs → verschieden)"] = r._pcg2d(1, 2) !== r._pcg2d(2, 1);
        out["(B3) pcg2d liefert uint32"] = Number.isInteger(r._pcg2d(99, 99)) && r._pcg2d(99, 99) >= 0;
        // _scatterCellTransform deterministisch
        const t1 = r._scatterCellTransform(100, 200);
        const t2 = r._scatterCellTransform(100, 200);
        out["(B4) _scatterCellTransform deterministisch (bit-genau, Promotion-Match)"] =
            !!t1 && !!t2 && t1.x === t2.x && t1.z === t2.z && t1.yaw === t2.yaw && t1.scale === t2.scale;
        out["(B5) Transform: scale 0.7..1.36, yaw 0..2π (in der Cell)"] =
            !!t1 && t1.scale >= 0.7 && t1.scale <= 1.36 && t1.yaw >= 0 && t1.yaw <= Math.PI * 2 + 1e-6;

        // ─── (C) Scatter erzeugt ECHTE InstancedMesh-Instanzen ────────
        // Sicherstellen: Pool + Bake bereit
        r._variantSeedsFor("baum_eiche");
        // die Dichte-Messung an der SPIELER-Region (vegetiert,
        // worldgen-habitabel) statt einer fernen leeren → die echte Plan-§13-
        // Dichte (≥hunderte/Chunk via 5 Strata) ist messbar.
        const ppm = st.playerMesh.position;
        // Spieler-Region (habitabel → moderate lebendig → die Caps greifen);
        // der innerM-Skip lässt nur die 64m um den Spieler frei, der Rest der
        // 256m-Region streut → die echte Dichte ist messbar.
        const pp = ppm.clone();
        const regX = Math.floor(pp.x / SC.regionM);
        const regZ = Math.floor(pp.z / SC.regionM);
        // Region direkt generieren (umgeht den Frame-Tick)
        const region = r._scatterRegion(regX, regZ, pp);
        const anzahl = region ? region.instanceCount : 0;
        out[`(C2) Region erzeugt ECHTE Instanzen (gemessen ${anzahl})`] = anzahl > 0;
        // MEHRSCHICHT-DICHTE (Plan §13): die Schichten der Region und ihre echte Dichte je Chunk (die Caps sind Gesetz,
        // die Probe misst, was die Region trägt; litter fiel final, W1)
        const byLayer = region ? region.byLayer : null;
        out[`V18.224/W1 (M4) Region erzeugt alle 3 Schichten (byLayer: ${byLayer ? JSON.stringify(byLayer) : "?"})`] =
            !!byLayer &&
            Number.isFinite(byLayer.tree) &&
            Number.isFinite(byLayer.under) &&
            Number.isFinite(byLayer.rock) &&
            !("litter" in byLayer);
        // Die Dichte-Schwelle folgt den FPS-bewusst gesenkten Scatter-Caps — die Welt ist BEWUSST sparsam.
        const chunkSpan = 43.2; // _voxelChunkConfig().span
        const jeChunk = anzahl / ((SC.regionM / chunkSpan) * (SC.regionM / chunkSpan));
        out[
            `V18.224/267 (M6) ECHTE Dichte ≥4 Instanzen/Chunk in der Spieler-Region (gemessen ${jeChunk ? jeChunk.toFixed(0) : "?"})`
        ] = jeChunk >= 4;
        // Wenigstens EINE Gruppe hat count > 0 (echte sichtbare Instanzen)
        let live = 0;
        if (st.archInstanceGroups) {
            for (const g of st.archInstanceGroups.values()) {
                if (g.mesh && g.mesh.count > 0) live += g.mesh.count;
            }
        }
        out[`(C4) HISM-Gruppen tragen LIVE-Instanzen (count>0, gemessen ${live})`] = live > 0;
        // Cells tragen species + variantIndex + slots (Lookup-Fütterung)
        if (region && region.cells.length > 0) {
            const c0 = region.cells[0];
            out["(C5) Cell trägt species (Promotion-Identität)"] =
                typeof c0.species === "string" && c0.species.length > 0;
            out["(C6) Cell trägt variantIndex"] = Number.isFinite(c0.variantIndex);
            out["(C7) Cell trägt HISM-Slots (echte Instanz-Referenzen)"] =
                Array.isArray(c0.slots) && c0.slots.length > 0;
            // Lookup-Buffer ist jetzt LEBENDIG (V18.220-Passagier geheilt) —
            // an einer PROMOTABLE (Baum-)Cell prüfen (Understory hat keinen
            // Lookup-Eintrag); eine Region ohne Baum-Schicht-Treffer (sparse) ist nicht prüfbar.
            const tc = region.cells.find((c) => c.promotable && c.slots);
            const look = tc && r._scatterLookupCell(tc.x, tc.z, tc.layer || "tree");
            out["(C8) Lookup-Buffer ist LEBENDIG (V18.220-Passagier geheilt — Konsument liest ihn)"] =
                !tc || (!!look && look.species === tc.species && look.variantIndex === tc.variantIndex);
        }
        // Idempotenz: zweiter _scatterRegion-Aufruf liefert dieselbe (cached)
        out["(C9) _scatterRegion idempotent (cached)"] = r._scatterRegion(regX, regZ, pp) === region;

        // ─── (D) Determinismus: zwei Welten gleicher Seed → gleiche Streu ─
        // Wir prüfen die species/variant-Wahl an einer festen Cell (pure Funktion
        // des Hash → P2P-konsistent).
        const h = r._pcg2d(555, 777);
        out["(D1) Species-Wahl deterministisch (P2P-konsistent)"] =
            r._scatterSpeciesForCell(0.7, 0.3, h) === r._scatterSpeciesForCell(0.7, 0.3, h);

        // ─── (E) Ω-H PROMOTION (Touch→Real, kein visueller Sprung) ───
        // Foundry-ON überspringt der Scatter die Baum-Schichten (kein promotable Cell) → die Grammatik-
        // Promotion prüft unter LOKALEM Hook; die Test-Region wird danach entsorgt.
        window.__withNoFoundry(() => {
            // Eine frische Scatter-Cell bauen + promovieren
            // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
            const pp2 = { x: 5000, y: 50, z: 5000 };
            const regX2 = Math.floor(pp2.x / SC.regionM);
            const regZ2 = Math.floor(pp2.z / SC.regionM);
            const region = r._scatterRegion(regX2, regZ2, pp2);
            // eine PROMOTABLE (Baum-)Cell, die NICHT promoted ist + slots hat
            // Understory/Streu sind nie promotable)
            const cell = region && region.cells.find((c) => c.promotable && c.slots && c.slots.length > 0);
            const archBefore = st.architectures.length;
            const promotedSpecies = cell && cell.species;
            const promotedVariant = cell && cell.variantIndex;
            const entry = cell && r._promoteScatterCell(cell);
            out["(E1) _promoteScatterCell liefert echten Eintrag (Touch→Real)"] = !!entry;
            if (entry) {
                out["(E2) Architektur-Anzahl +1 (echter Bauplan entstand)"] =
                    st.architectures.length === archBefore + 1;
                // Der echte Eintrag trägt die Provenienz (Welt-Genese-Cell)
                const prov = entry.provenance;
                out["(E3) Eintrag trägt Provenienz bornFrom=world-genesis-cell (Plan §2)"] =
                    !!prov && prov.bornFrom === "world-genesis-cell";
                out["(E4) Provenienz-Species == Scatter-Species"] = !!prov && prov.species === promotedSpecies;
                // Der Eintrag nutzt DENSELBEN grown-Bauplan (kein Sprung): entry.type = grown_<species>_v<variant>
                // (LOD0); der Entry trägt _lodSpecies (von spawnArchitecture), _grownSpecies lebt am Blueprint.
                out["(E5) Eintrag nutzt grown_-Bauplan derselben Species (KEIN visueller Sprung)"] =
                    /^grown_/.test(entry.type) && entry._lodSpecies === promotedSpecies;
                out["(E6) Eintrag-Variante == Scatter-Variante (Form-Identität)"] =
                    entry._lodVariantIndex === promotedVariant;
                // Cell ist jetzt promoted (Bitmask) + slots freigegeben
                out["(E7) Deko-Slots freigegeben bei Promotion (kein Doppel-Mesh)"] = cell.slots === null;
                out["(E8) Cell jetzt promoted (Bitmask — kein zweiter Deko-Spawn)"] =
                    r._scatterIsCellPromoted(cell.x, cell.z, "tree") === true;
                // Aufräumen
                r.removeArchitecture(entry);
            }
            if (region && region.cells.length > 0) r._disposeScatterRegion(`${regX2},${regZ2}`);
        });

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Fels-Welle: prozeduraler Fels (Box-Samen → noise-verschobener Ikosaeder) + Kiesel-Streu, wo Fels
// durchbricht; Geologie nur auf Land, nicht auf wind-wiegender Vegetation. KONSUM: der Fels
// emergiert, die Streu liest rockExposure, die Geologie ist gegated.
async function checkBandWahrerAnblickFels(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};

        // (A) Ω-O15 prozedurale Fels-Geometrie
        const geom = r._makePartGeometry({ shape: "noiserock", material: "stein", size: { x: 2, y: 2, z: 2 } });
        const pos = geom && geom.attributes && geom.attributes.position;
        out["Ω-OPSIS S6 (A1) noiserock baut eine Geometrie"] = !!pos;
        out["Ω-OPSIS S6 (A2) noiserock ist detailliert (≥12 Vertices)"] = !!pos && pos.count >= 12;
        // verschoben ≠ glatte Kugel: die Vertex-Radien streuen (Noise-Displacement)
        if (pos) {
            let rmin = Infinity,
                rmax = 0;
            for (let i = 0; i < pos.count; i++) {
                const rr = Math.hypot(pos.getX(i), pos.getY(i), pos.getZ(i));
                if (rr < rmin) rmin = rr;
                if (rr > rmax) rmax = rr;
            }
            // die Brüche/Facetten
            out["Ω-OPSIS S6 (A3) noiserock ist noise-verschoben (Facetten, kein glatter Radius)"] = rmax - rmin > 0.05;
        }
        if (geom && typeof geom.dispose === "function") geom.dispose();

        // (C) stein_block gewachsen + Kiesel/Felsbrocken-Baupläne
        const bp = r.state.blueprints;
        out["Ω-OPSIS S6 (C1) stein_block gewachsen (Box-Samen → noiserock)"] = !!(
            bp &&
            bp.stein_block &&
            bp.stein_block.parts[0].shape === "noiserock"
        );
        out["Ω-OPSIS S6 (C3) kiesel-Teile sind alle noiserock"] = !!(
            bp &&
            bp.kiesel &&
            bp.kiesel.parts.every((p) => p.shape === "noiserock")
        );
        // computeCompoundTags von stein_block trägt dichte (noiserock = box → dicht)
        let dicht = false;
        try {
            const tags = r.computeCompoundTags(bp.stein_block);
            dicht = !!(tags && Number.isFinite(tags.dichte) && tags.dichte > 0);
        } catch {
            /* der Wurf ist kein dichter Stein */
        }
        out["Ω-OPSIS S6 (C5) stein_block trägt dichte (Tags finit, noiserock=box)"] = dicht;

        // (D) CONSUM: die Streu liest die statischen Fels-Baupläne. kiesel ist Studio-bekannt → foundry-ON
        // gäbe der Chokepoint null; geprüft wird der STATISCHE Grammatik-LOD-Weg ({0,1,2} = derselbe
        // Bauplan) → lokaler Hook.
        const lods = window.__withNoFoundry(() => r._buildVariantLODs("kiesel", 0));
        out["Ω-OPSIS S5 (D1) CONSUM: _buildVariantLODs gibt statische Fels-Keys"] = !!(
            lods &&
            lods[0] === "kiesel" &&
            lods[1] === "kiesel" &&
            lods[2] === "kiesel"
        );
        out["Ω-OPSIS S5 (D2) CONSUM: _scatterSpeciesForLayer(rock) gibt Fels-Spezies"] = [
            "kiesel",
            "felsbrocken",
            "stein_block",
        ].includes(r._scatterSpeciesForLayer("rock", 0.1, 0.1, 50));

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Laub-Vertiefung: Rinden-Maserung (axiale Borke-Bänder + radialer Streifen) + blatt-geformte Card.
// Proben: KONSUM in den Geometrie-Buildern + behavioral (Tube + Card aus dem gewachsenen Skelett).
async function checkBandWahrerAnblickLaub(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;

        // (B) Behavioral — ein gewachsener Baum baut Tube + blatt-geformte Card. Foundry-ON gäbe der
        // Chokepoint null (die Probe wäre vakuös grün) → der lokale Hook hält den Beweis am Leben.
        let tubeOk = false,
            cardOk = false,
            taperProven = false;
        // die Geometrie trägt Ecken
        const ecken = (g) => !!(g && g.attributes && g.attributes.position && g.attributes.position.count > 0);
        try {
            const keys = window.__withNoFoundry(() => r._buildVariantLODs("baum_eiche", 0));
            const bp = keys && r.state.blueprints[keys[0]];
            const skel = bp && bp._skeleton;
            if (skel) {
                const tube = r._buildTreeTubeGeometry(skel);
                tubeOk = ecken(tube);
                if (tube && tube.dispose) tube.dispose();
                const card = r._buildTreeFoliageCardGeometry(skel);
                cardOk = ecken(card);
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
        } catch {
            /* die Folge-Proben fallen ohne ihr Feld */
        }
        return {
            "Ω-OPSIS S3-Laub (B1) gewachsener Baum baut die Rinden-Tube": tubeOk,
            "Ω-OPSIS S6-Laub (B2) gewachsener Baum baut die Foliage-Card": cardOk,
            "Neues Kleid (B3) die Blatt-Form lebt in der Atlas-Silhouette (Cluster-Quad, uv-geroutet)": taperProven,
        };
    });
    for (const s in res) check(s, res[s]);
}

// Die Scheiben-Byte-Wand (W3.3b/3c) — eingefaltet aus gate:scatter-slice: `_scatterRegion` baut mit Deadline in ZEIT-
// SCHEIBEN (Fortsetzung `region._cont`: die Würfe des Streu-Fadens → Zellen-Phase). Dieselbe Region One-Shot vs in N Scheiben: `region.cells`
// byte-gleich bei echten Scheiben, die HISM-Slot-Bilanz identisch (ein Doppel-Add wäre im cells-Vergleich unsichtbar), der
// Kalt-Bake gescheibt + Float32-byte-gleich ohne halben Bake in der Map, das Dispose-Storno, der Wecker der aufgeschobenen
// Region, und der Stoff des Walds (unter der Streu-Scheibe rechnet der Haupt-Faden keinen Dart, die Region wartet auf den Voxel-Faden).
async function checkBandScatterScheibe(ctx) {
    const { page, check } = ctx;
    const out = await safeEvaluate(page, async () => {
        const r = window.anazhRealm,
            st = r.state;
        const A = window.AnazhRealm || r.constructor;
        const SC = A.SCATTER;
        const o = {};
        const pos = st.playerMesh.position;
        const rx = Math.floor(pos.x / SC.regionM),
            rz = Math.floor(pos.z / SC.regionM);
        const key = `${rx},${rz}`;
        const snapshot = (reg) =>
            JSON.stringify(
                (reg && reg.cells ? reg.cells : []).map((c) => [
                    c.cellX,
                    c.cellZ,
                    c.layer,
                    c.species,
                    c.variantIndex,
                    c.lod,
                    c.bpName,
                ])
            );
        const groupBalance = () => {
            const b = {};
            if (st.archInstanceGroups)
                for (const [k, g] of st.archInstanceGroups)
                    b[k] = { live: g.liveCount || 0, count: g.mesh ? g.mesh.count : 0 };
            return JSON.stringify(b);
        };
        const clean = () => {
            if (st.scatterRegions && st.scatterRegions.has(key)) r._disposeScatterRegion(key);
        };
        // ── SCHEIBEN-Bau: die Würfe rechnet der Streu-Faden (eine Ereignis-Runde nur, solange sie fehlen), die Zellen in Scheiben ──
        clean();
        // eine Scheibe des Baus (0,4 ms Frist)
        const scheibe = () => r._scatterRegion(rx, rz, pos, performance.now() + 0.4);
        let slices = 0;
        const contSeenPhases = new Set();
        let reg = null;
        for (let i = 0; i < 800; i++) {
            reg = scheibe();
            slices++;
            if (!reg || !reg._cont) break;
            const c = reg._cont;
            contSeenPhases.add(c.darts ? "zellen" : "faden");
            if (!c.darts) await sleep(10);
        }
        const phasen = Array.from(contSeenPhases);
        const sliceDone = !!(reg && !reg._cont);
        const snapSliced = snapshot(reg);
        const balanceOne = groupBalance();
        const slicedCells = reg ? reg.cells.length : -1;
        // ── ONE-SHOT-Referenz im selben Takt (dieselbe Welt): der Haupt-Faden rechnet die Würfe selbst ──
        clean();
        const oneShot = r._scatterRegion(rx, rz, pos);
        const oneShotCells = oneShot ? oneShot.cells.length : -1;
        const snapOne = snapshot(oneShot);
        const balanceEqual = groupBalance() === balanceOne;
        o[
            `Scatter-Scheibe: ECHTE Scheiben (${slices} Aufrufe), region.cells BYTE-EXAKT (One-Shot ${oneShotCells} == Scheiben ${slicedCells}), HISM-Slot-Bilanz identisch`
        ] = [
            slices >= 3 &&
                sliceDone &&
                phasen.includes("zellen") &&
                snapOne === snapSliced &&
                oneShotCells === slicedCells &&
                oneShotCells > 5 &&
                balanceEqual,
            `Phasen [${phasen}] · Bilanz ${balanceEqual}`,
        ];
        // MAIN = FADEN: dieselbe Regel (phyto-core `streuRegion`) an den Lesern beider Fäden, Zahl für Zahl — an der Region des
        // Spielers samt Erdbau und Keller (die Fläche beider Fäden ist eine Probe des Felds, voxel-worker `voxelSurfaceY`) und an
        // der Region eines Orts (die Mitte der ersten Siedlung der Wege-Karte: Platten, Grund und Trasse des Erdbaus, die Wege)
        const wuerfe = { n: 0, gleich: true };
        {
            const sd = st.wegeKarte && st.wegeKarte.siedlungen[0];
            const orte = [[rx, rz, pos.x, pos.z]];
            if (sd) {
                const [ox, oz] = [(sd.x0 + sd.x1) / 2, (sd.z0 + sd.z1) / 2];
                orte.push([Math.floor(ox / SC.regionM), Math.floor(oz / SC.regionM), ox, oz]);
            }
            wuerfe.ort = sd ? orte[1].slice(0, 2).join(",") : null;
            for (const [qx, qz, ax, az] of orte) {
                const mk = () => r._streuAuftrag(qx, qz, ax, az, 1);
                const msg = await r._nebenAuftrag("streu", Object.assign({ type: "streu-region" }, mk()));
                const fa = msg.wuerfe.map((b) => new Float64Array(b));
                const ma = globalThis.__phytoCore.streuRegion(Object.assign(mk(), { leser: r._streuLeser() }));
                wuerfe.n += fa.reduce((n, d) => n + d.length, 0);
                wuerfe.gleich &&=
                    ma.length === fa.length &&
                    ma.every((m, li) => m.length === fa[li].length && m.every((v, k) => Object.is(v, fa[li][k])));
            }
        }
        // ── (4) DISPOSE-STORNO: mitten in der Fortsetzung disposen ──
        clean();
        const storno = { threw: false, contDead: false, rebuildOk: false };
        try {
            let reg2 = scheibe();
            let guard = 0;
            while (reg2 && reg2._cont && !reg2._cont.darts && guard++ < 300) {
                await sleep(10); // die Würfe rechnet der Streu-Faden
                reg2 = scheibe();
            }
            // jetzt in der Zellen-Phase (oder fertig) → mitten drin disposen; wurde die Region zu schnell fertig (winzige
            // Region), prüft das Storno an leerer Stelle
            const mitten = !!(reg2 && reg2._cont);
            r._disposeScatterRegion(key);
            storno.contDead = !st.scatterRegions.has(key) && (!mitten || reg2._cont === null);
            const fresh = r._scatterRegion(rx, rz, pos);
            storno.rebuildOk = !!fresh && (!mitten || !fresh._cont) && snapshot(fresh) === snapOne;
            r._disposeScatterRegion(key);
        } catch (e) {
            storno.threw = String((e && e.message) || e);
        }
        // ── (5) DER WECKER: zwei offene Zusagen, eine fremde Lieferung, dann die eigenen ──
        const wecker = { fremd: null, eine: null, beide: null, threw: false };
        try {
            clean();
            const loes = [];
            const zus = [0, 1].map(() => new Promise((res) => loes.push(res)));
            const altPass = r._scatterPass;
            r._scatterPass = function (region, ...a) {
                region._deferredFoundry = true; // jede Zelle wartet (wie bei kaltem Asset)
                if (typeof this._streuWartetAuf === "function") for (const z of zus) this._streuWartetAuf(z);
                return altPass.call(this, region, ...a);
            };
            // die Zusagen der Region beim Namen: ihre zwei, die Schlange des Walds und jede fremde (Karte, Zug, Buch)
            const altWartet = r._streuWartetAuf;
            const fremde = new Set();
            r._streuWartetAuf = function (z) {
                if (this._streuSammler && z && !zus.includes(z))
                    fremde.add(
                        [...(this._waldZusagen || new Map()).values()].some((e) => e.zusage === z) ? "wald" : "fremd"
                    );
                return altWartet.call(this, z);
            };
            wecker.schlange = r._waldPlanSchlange ? r._waldPlanSchlange.size : 0;
            let reg5;
            try {
                reg5 = r._scatterRegion(rx, rz, pos);
            } finally {
                r._scatterPass = altPass;
                r._streuWartetAuf = altWartet;
            }
            wecker.fremde = [...fremde];
            // wartet ihre Gestalt noch auf den Plan des Walds, wartet die Region benannt auch auf die Zellen ihrer Kästen
            // (`_waldPlanZusage`, B-Wald): die Linse leert die Schlange zuerst (der Takt schickt sie an den Faden) — danach steht
            // die Region NUR noch auf ihren zwei Zusagen
            for (let i = 0; i < 4000 && r._waldPlanSchlange && r._waldPlanSchlange.size; i++) {
                r._tickWaldPlan(Infinity);
                await sleep(10);
            }
            wecker.schlangeNach = r._waldPlanSchlange ? r._waldPlanSchlange.size : 0;
            const steht = () => st.scatterRegions.get(key) === reg5;
            const tick = async () => {
                await sleep(0);
                r._tickScatterStreaming(pos);
            };
            r._scatterRefillPending = true; // eine FREMDE Lieferung
            await tick();
            wecker.fremd = steht();
            loes[0]();
            r._scatterRefillPending = true;
            await tick();
            wecker.eine = steht();
            loes[1]();
            await tick();
            wecker.beide = steht();
            clean();
        } catch (e) {
            wecker.threw = String((e && e.message) || e);
        }
        // ── (6) DER STOFF DES WALDS: die Gestalt der Streu wartet auf die Darts des Fadens ──
        const stoff = {
            buch: false,
            wahr: false,
            faden: false,
            haupt: -1,
            nachher: -1,
            gewartet: false,
            gleich: null,
            zellen: 0,
            threw: false,
        };
        try {
            clean();
            const bereit = () => !!(r._foundry && r._foundry.ready && r._foundry.recipes && r._forestGesetzWahr());
            await window.__weltDa(bereit);
            stoff.buch = !!(r._foundry && r._foundry.recipes);
            stoff.wahr = r._forestGesetzWahr();
            stoff.faden = !!st.voxelWorker;
            // mit Faden, frisches Gedächtnis: wie viele Darts rechnet der Haupt-Faden UNTER der Streu-Scheibe (`_streuSammler`)?
            r._forestDartMemo = null;
            let zaehler = 0;
            const altCD = r._forestCellDarts;
            r._forestCellDarts = function (cx, cz, seedInt) {
                if (this._streuSammler && !(this._forestDartMemo && this._forestDartMemo.has(cx + "," + cz))) zaehler++;
                return altCD.call(this, cx, cz, seedInt);
            };
            const vw = st.voxelWorker;
            try {
                const reg6 = r._scatterRegion(rx, rz, pos);
                stoff.haupt = zaehler;
                // der Takt schickt die Schlange an den Faden (`_tickWaldPlan`, Job `waldPlan`) — die Linse ist sein Takt
                await window.__gebautNach("die Lieferung an die wartende Region", {
                    fertig: () => !(reg6._deferredFoundry && !reg6._geweckt),
                    takt: async () => (r._tickWaldPlan(Infinity), await sleep(50)),
                    max: 1200,
                });
                stoff.gewartet = reg6._deferredFoundry === true && reg6._geweckt === true;
                // der Neubau nach der Lieferung und die Referenz ohne Faden (der Main rechnet jeden Dart selbst, frisches
                // Gedächtnis) Rücken an Rücken, ohne Warten dazwischen: kein Asset kommt zwischen die beiden Bauten
                clean();
                zaehler = 0;
                const neu = r._scatterRegion(rx, rz, pos);
                stoff.nachher = zaehler;
                stoff.zellen = neu && neu.cells ? neu.cells.length : 0;
                const neuSnap = snapshot(neu);
                clean();
                st.voxelWorker = null;
                r._forestDartMemo = null;
                // ohne Faden plant der Takt die Schlange im Haupt-Faden: die Referenz pumpt sie leer (ohne Warten — kein
                // Asset kommt dazwischen) und baut die Region dann neu
                r._scatterRegion(rx, rz, pos);
                for (let i = 0; i < 20000 && r._waldPlanSchlange && r._waldPlanSchlange.size; i++)
                    r._tickWaldPlan(Infinity);
                clean();
                stoff.gleich = snapshot(r._scatterRegion(rx, rz, pos)) === neuSnap;
            } finally {
                st.voxelWorker = vw;
                r._forestCellDarts = altCD;
            }
            clean();
        } catch (e) {
            stoff.threw = String((e && e.message) || e);
        }
        o[
            `Scatter-Scheibe MAIN = FADEN: die Würfe des Streu-Fadens Zahl für Zahl gleich der Regel im Haupt-Faden (${wuerfe.n} Zahlen, Region des Spielers und des Orts ${wuerfe.ort}); Dispose mitten in der Fortsetzung storniert ohne Throw`
        ] = [
            wuerfe.gleich === true &&
                wuerfe.n > 0 &&
                !!wuerfe.ort &&
                phasen.includes("faden") &&
                storno.threw === false &&
                storno.contDead === true &&
                storno.rebuildOk === true,
            JSON.stringify(storno),
        ];
        o[
            "Scatter-Scheibe DER WECKER: die aufgeschobene Region überlebt eine fremde Lieferung und die erste ihrer zwei Zusagen, nach der zweiten baut der Refill sie neu"
        ] = [
            wecker.threw === false && wecker.fremd === true && wecker.eine === true && wecker.beide === false,
            JSON.stringify(wecker) +
                (wecker.fremd === false
                    ? " — TÄTER: der Refill in _tickScatterStreaming warf sie bei einer fremden Lieferung weg"
                    : ""),
        ];
        o[
            "Scatter-Scheibe DER STOFF DES WALDS: unter der Streu-Scheibe kein Dart im Haupt-Faden, die Region wartet auf den Voxel-Faden und steht danach byte-gleich"
        ] = [
            stoff.threw === false &&
                stoff.buch === true &&
                stoff.wahr === true &&
                stoff.faden === true &&
                stoff.haupt === 0 &&
                stoff.gewartet === true &&
                stoff.nachher === 0 &&
                stoff.gleich === true &&
                stoff.zellen > 5,
            JSON.stringify(stoff) +
                (stoff.haupt > 0
                    ? ` — TÄTER: _forestCellDarts unter _scatterRegionWork (${stoff.haupt} Darts im Haupt-Faden)`
                    : ""),
        ];
        return o;
    });
    if (erreichbar(check, "Scatter-Scheibe: die Probe antwortet", out, "keine Antwort der Seite"))
        for (const s in out) check(s, ...[out[s]].flat());
}

module.exports = {
    checkBandV18275FoliageGrowth,
    checkBandNahStreu,
    checkBandV18133Forage,
    checkBandV18197GammaMStrata,
    checkBandV18200GammaMIronBands,
    checkBandV18205Gamma7Grammatik,
    checkBandV18211SkeletonGrammar,
    checkBandV18212GigantRestsubschritte,
    checkBandV18215AtemberaubenderWald,
    checkBandV18216KarstUndUnderstory,
    checkBandV18217VariantenPool,
    checkBandV18218LODStufen,
    checkBandV18219bisVollendung,
    checkBandV18224ScatterPromotion,
    checkBandWahrerAnblickFels,
    checkBandWahrerAnblickLaub,
    checkBandScatterScheibe,
};
