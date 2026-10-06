// diag-asset-inventory.cjs — DIE EINE ASSET-INVENTUR-LINSE (H3, Nervensystem-Plan Phase γ;
// gewachsen aus dem Silhouetten-Zensus [W6-Rest] — Gesetz #0: EINE Linse, zwei Hälften).
//
// HÄLFTE 1 — DER SILHOUETTEN-ZENSUS (DONE-Kriterium 3, „null Fremd-Silhouetten"):
// der Zensus traversiert die GANZE Szene (Null-Renderer, foundry-ON, GPU-frei) und ordnet
// JEDEN zeichnenden Emitter GENAU EINEM Regal zu:
//
//   STUDIO     — aus der Studio-Pipeline (fscatter:* Scatter-Gruppen · f:/fimp:-Leaves der
//                platzierten Architektur · das Studio-Gras-Asset [geo.userData.foundryGras] · die Senken der
//                Nah-Streu und die Senken der Nah-Wiese über ihren Foundry-Leaf-Key). Die Senken der Nah-Wiese füllt
//                ihr Sicht-Satz im Haupt-Pass — headless legt ihn die Linse selbst (scripts/lib/wiese-sicht.cjs) und
//                verlangt: der Ring am Start trägt Büschel, jede Senke belegt und als Studio-Emitter gezählt (W).
//   SUBSTANZ   — Welt-Substanz ohne Studio-Gegenstück, bewusst KEINE Silhouetten-Frage
//                (Terrain-Chunks · Wasser [isHydrosphere] · Himmel/Gestirne · Kreaturen ·
//                Avatar · nicht-vegetative platzierte Architektur · die per userData.inventar
//                GESTEMPELTEN Bau-Quellen: boden-satz · wetter-regen — die einst 222 „unbekannten"
//                Emitter, an der QUELLE geklärt; die Klein-Streu ist seit 04.10. Studio, das Fernfeld fiel).
//   ENTSCHEID  — dokumentierte Schöpfer-Entscheide (glut* [E-E] · start_plattform +
//                fliegende Inseln [E-F]); im Parity-Shot seit W2 versteckt, in der Welt daheim.
//   VERLETZUNG — alles andere: eine Vegetations-/Deko-Silhouette OHNE Studio-Herkunft
//                (Grammatik-Baum/-Strauch/-Fels · Alt-Tuft-Gras · Totholz; die Vor-Studio-
//                Kulissen Mantle/Shell sind N7.4 GESCHNITTEN — per Konstruktion unmöglich)
//                ODER ein UNBEKANNTER Emitter ODER
//                eine unbekannte inventar-Klasse — der Fallback ist bewusst FAIL-CLOSED:
//                was die Linse nicht erklären kann, ist rot, bis es klassifiziert wird
//                (die V18.346-Disziplin: die Teilmenge wird über IDENTITÄT klassifiziert,
//                nie über das gemessene Signal selbst).
//
// HÄLFTE 2 — DIE INVENTUR (H3: requested ⊆ visible|cached): jeder on-demand angefragte
// Foundry-Key (f.requested — die Dedup-Wache der vier Anfrage-Chokepoints: Gras ·
// Impostor-LOD1 · Flatten · Werkstatt-Vorschau) MUSS am Ende entweder RESIDENT sein
// (f.cache trägt den Key — auch ein resolved-leeres/null-Verdikt zählt, das ist eine
// bewusste Antwort) oder SICHTBAR ATTESTIERT (die Szene/der Impostor-Atlas/das Gras-Memo
// tragen eine Gestalt dazu). Ein Key, der angefragt wurde und weder geliefert noch
// resident ist, IST das stille Verhungern (die V18.309-Klasse: pending klemmt, die Queue
// verhungert, err null). BEWUSSTE LRU-Räumungen (f.lruEvicted, das reine Inventur-Buch
// am Cache-Chokepoint) sind KEIN Verlust — der Key bleibt re-anfragbar.
//
// Erwartung (V18.433+): 0 VERLETZUNGEN · 0 verlorene Keys · 0 hängende pending.
// --selftest injiziert NACH der echten Messung (a) drei Fremd-Emitter (Grammatik-Baum-
// Gruppe + nackter Unbekannter + unbekannte inventar-Klasse) und (b) einen synthetisch
// „verlorenen" Key (in f.requested ohne cache/Szene/Räumungs-Buch) und beweist, dass
// ALLE Fangpfade feuern — sonst wäre das Grün vakuös.
//   node scripts/diag-asset-inventory.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { installWieseSicht } = require("./lib/wiese-sicht.cjs");
// Port über ASSET_INVENTORY_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4517.
const PORT = Number(process.env.ASSET_INVENTORY_PORT || 4517);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    const selftest = process.argv.includes("--selftest");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.evaluateOnNewDocument(installWieseSicht);
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async (doSelftest) => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        // ── Warmup: Welt bauen (Chunk-Plateau) + Foundry ready + Scatter konvergieren lassen
        // (das bewährte diag-no-second-treebuilder-Rezept — dieselbe Bühne, breiterer Blick).
        const s0 = performance.now();
        while (performance.now() - s0 < 90000) {
            const r0 = window.anazhRealm;
            if (r0 && typeof r0._gameLoopTick === "function") {
                try {
                    r0._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r0.state.voxelChunks ? r0.state.voxelChunks.size : 0;
                if (sz >= 25) break;
            }
            await sleep(6);
        }
        const r = window.anazhRealm;
        const o = { foundryEnabled: r._foundryEnabled ? r._foundryEnabled() : false };
        const f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null;
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        o.foundryReady = !!(f && f.ready);
        for (let it = 0; it < 350; it++) {
            r.state._frameOverBudget = false;
            try {
                r._gameLoopTick && r._gameLoopTick(performance.now());
                const pp = r.state.playerMesh && r.state.playerMesh.position;
                if (pp && r._tickScatterStreaming) r._tickScatterStreaming(pp);
            } catch (_e) {}
            await sleep(8);
        }
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
        // ── Inventur-Settle: die in-flight-Anfragen ausklingen lassen (ein Key, der nach
        // dem Deckel noch in f.pending hängt, IST das Verhungern-Symptom → zählt unten rot).
        if (f) {
            const tS = performance.now();
            while (f.pending && f.pending.size > 0 && performance.now() - tS < 20000) {
                try {
                    r._gameLoopTick && r._gameLoopTick(performance.now());
                } catch (_e) {}
                await sleep(50);
            }
        }

        // ── Die Nah-Wiese zeichnet nur, was ihr Sicht-Satz legt (`_nahWieseSicht` im Haupt-Pass) — der Null-Renderer
        // zeichnet nie, ihre Senken stünden leer und würden als „leerer Pool" übersprungen. Die Linse legt den Satz
        // selbst (scripts/lib/wiese-sicht.cjs) — jede Senke muss danach als STUDIO-Emitter im Zensus stehen.
        o.wiese = window.__wieseSicht(r);
        // ── Identitäts-Karten (die Teilmenge wird über IDENTITÄT klassifiziert, V18.346):
        const st = r.state;
        const grassSet = new Set();
        if (st.voxelChunkGrass) for (const m of st.voxelChunkGrass.values()) if (m) grassSet.add(m);
        const waterSet = new Set();
        if (st.voxelChunkWaterIso) for (const m of st.voxelChunkWaterIso.values()) if (m) waterSet.add(m);
        const skySet = new Set(
            [st.skybox, st.sunMesh, st.moonMesh, st.starField, st.waterPlane].filter(Boolean)
        );
        const islandSet = new Set((st.floatingIslands || []).filter(Boolean));
        // N7.4 — die Vor-Studio-Kulissen (Horizont-Mantel/Canopy-Shell) sind GESCHNITTEN:
        // die Verletzungs-Klasse ist per Konstruktion unmöglich, der Detektor entfällt.
        // Platzierte/gemergte Architektur: mesh → Bauplan-Name (Wurzel-Objekt des Eintrags).
        const archMeshName = new Map();
        for (const a of st.architectures || []) if (a && a.mesh) archMeshName.set(a.mesh, a.type || "(arch)");
        // Instanz-Gruppen + Batch-Wrapper: mesh → [keys] (ein Batch-Mesh trägt MEHRERE Namen-Keys).
        const meshKeys = new Map();
        if (st.archInstanceGroups)
            for (const [k, g] of st.archInstanceGroups) {
                if (!g || !g.mesh) continue;
                if (!meshKeys.has(g.mesh)) meshKeys.set(g.mesh, []);
                meshKeys.get(g.mesh).push(String(k));
            }
        // V18.508 — die Nah-Wiese (Kamera-Ring aus dem Studio-Gras): je Senke ihr Foundry-Leaf-Key; eine
        // Senke ohne Key bleibt unbekannt → Verletzung (fail-closed).
        if (st.nahWiese)
            for (const a of st.nahWiese.senken.values())
                if (a.mesh && a.leafKey) meshKeys.set(a.mesh, ["nahWiese#" + a.leafKey]);
        // Waldboden 04.10. — die Nah-Streu (Kamera-Ring aus den Studio-Bodenarten): je Senke ihr Foundry-Leaf-Key;
        // eine Senke ohne Key bleibt unbekannt → Verletzung (fail-closed).
        if (st.nahStreu)
            for (const a of st.nahStreu.senken.values())
                if (a.mesh && a.leafKey) meshKeys.set(a.mesh, ["nahStreu#" + a.leafKey]);
        // Welle 6 — der Bau-Satz (`_bauSatzArt`): ein Satz-Mesh zeichnet die Bereiche seiner Gruppen — er trägt ihre
        // Schlüssel wie ein Batch (die schlechteste Klasse gewinnt); ein Bau-Satz ohne Bereich bleibt unbekannt.
        if (st.chunkSaetze)
            for (const s of st.chunkSaetze.values())
                if (s.spec && s.spec.userData && s.spec.userData.bauSatz && s.bloecke.size > 0)
                    meshKeys.set(s.mesh, [...s.bloecke.keys()].map(String));

        // ── Die Regeln (erste trifft; Schlüssel = Gruppen-Key `name#leaf[@region]`):
        const VEG =
            /(^|[#@:_])(baum_|strauch|busch|gras|blume|farn|pilz|kiesel|fels|findling|geroell|basalt|sediment|zacken|kristall|stamm_gefallen|totholz|grown_)/i;
        // Welle B: der platzierte Bau keyt nach Studio-Geometrie — ein Schlüssel OHNE Typ ist selbst das Leaf.
        const leafOf = (k) => {
            const i = k.indexOf("#");
            if (i >= 0) return k.slice(i + 1);
            return /^(f:|fimp:)/.test(k) ? k : "";
        };
        const classifyKey = (k) => {
            if (k.startsWith("fscatter:")) return { b: "studio", why: "fscatter" };
            if (/^(f:|fimp:)/.test(leafOf(k))) return { b: "studio", why: "foundry-leaf" };
            const base = k.split("#")[0];
            if (/glut/i.test(base)) return { b: "entscheid", why: "glut (E-E)" };
            if (/start_plattform/i.test(base)) return { b: "entscheid", why: "start_plattform (E-F)" };
            if (VEG.test(base)) return { b: "verletzung", why: "Grammatik-Vegetation: " + base };
            return { b: "substanz", why: "arch: " + base };
        };
        const classifyName = (nm) => {
            if (/glut/i.test(nm)) return { b: "entscheid", why: "glut (E-E)" };
            if (/start_plattform/i.test(nm)) return { b: "entscheid", why: "start_plattform (E-F)" };
            if (VEG.test(nm)) return { b: "verletzung", why: "Grammatik-Vegetation (merged): " + nm };
            return { b: "substanz", why: "arch-merged: " + nm };
        };
        // H3 — DAS INVENTAR-WÖRTERBUCH der gestempelten Bau-Quellen (userData.inventar am
        // Bau-Chokepoint; die einst 222 unbekannten Emitter, per Instrumentierung an der
        // QUELLE geklärt statt geraten):
        //   (streu-klein   — die Senken der Nah-Streu sind seit 04.10. STUDIO, über ihren Leaf-Key oben geklärt;
        //                    ein streu-klein-Stempel OHNE Key ist unbekannt → Verletzung. deko-fernfeld fiel.)
        //   boden-satz     — _chunkSatz("boden") (Welle B: der Terrain-Ring als EIN Satz, Stitch-Bänder
        //                    eingeschlossen — die Chunk-Meshes sind CPU-Körper ausserhalb der Szene)
        //   wetter-regen   — _ensureRainSystem (Niederschlags-Punkte, nur bei rainy/stormy sichtbar)
        // FAIL-CLOSED: ein Stempel, den das Wörterbuch nicht kennt, ist eine VERLETZUNG.
        const INVENTAR = {
            "boden-satz": { b: "substanz", why: "boden-satz (Terrain-Ring + Stitch als EIN Satz)" },
            "wetter-regen": { b: "substanz", why: "wetter-regen (Niederschlags-Punkte)" },
        };
        const chainOf = (node) => {
            const c = [];
            let p = node;
            while (p) {
                c.push(p);
                p = p.parent;
            }
            return c;
        };
        const census = () => {
            const buckets = { studio: 0, substanz: 0, entscheid: 0, verletzung: 0 };
            const detail = { studio: {}, substanz: {}, entscheid: {} };
            const violations = [];
            let emitters = 0,
                leere = 0;
            st.scene.traverse((node) => {
                if (!(node.isMesh || node.isInstancedMesh || node.isPoints)) return;
                let vis = node.visible,
                    cur = node.parent;
                while (cur && vis) {
                    if (!cur.visible) vis = false;
                    cur = cur.parent;
                }
                if (!vis) return;
                const g = node.geometry;
                if (!g || !g.attributes || !g.attributes.position) return;
                if (node.isInstancedMesh && !(node.count > 0)) {
                    leere++;
                    return; // leerer Instanz-Pool zeichnet nichts
                }
                emitters++;
                const chain = chainOf(node);
                const tally = (b, label) => {
                    buckets[b]++;
                    if (b === "verletzung") {
                        const keys = meshKeys.get(node) || [];
                        violations.push({
                            label,
                            keys: keys.slice(0, 4),
                            name: node.name || "",
                            type: node.isInstancedMesh ? "inst×" + node.count : node.isPoints ? "points" : "mesh",
                            verts: g.attributes.position.count,
                            userDataKeys: Object.keys(node.userData || {}).slice(0, 6),
                            parents: chain
                                .slice(1)
                                .map((p) => p.name || p.type)
                                .slice(0, 3),
                        });
                    } else {
                        detail[b][label] = (detail[b][label] || 0) + 1;
                    }
                };
                // 1) Gruppen-Schlüssel (Scatter + platzierte Architektur-Instanzen + Batches):
                const keys = meshKeys.get(node);
                if (keys && keys.length) {
                    // Ein Batch-Mesh trägt mehrere Keys — die SCHLECHTESTE Klasse gewinnt
                    // (fail-closed: eine Verletzung im geteilten Batch macht den Batch rot).
                    let worst = null;
                    const rank = { studio: 0, substanz: 1, entscheid: 2, verletzung: 3 };
                    for (const k of keys) {
                        const c = classifyKey(k);
                        if (!worst || rank[c.b] > rank[worst.b]) worst = { b: c.b, why: c.why + " [" + k + "]" };
                    }
                    return tally(worst.b, worst.why);
                }
                // 2) Welt-Substanz-Identitäten:
                if ((node.userData && node.userData.isHydrosphere) || waterSet.has(node))
                    return tally("substanz", "wasser");
                // V18.381 — das Fern-Wasser-Sheet (`_ensureFarWaterSheet`, hydroKind "farWater")
                // und jede andere Hydro-Fläche tragen ihre Identität als hydroKind-Stempel.
                if (node.userData && typeof node.userData.hydroKind === "string")
                    return tally("substanz", "wasser (" + node.userData.hydroKind + ")");
                if (node.userData && node.userData.voxelChunkX !== undefined) return tally("substanz", "terrain-chunk");
                if (grassSet.has(node)) {
                    // Studio-Gras trägt den Bäcker-Stempel; ein Gras-Mesh OHNE ihn wäre der
                    // Alt-Tuft-Nachbau (der W6-Fail-Open) → Verletzung.
                    if (g.userData && g.userData.foundryGras) return tally("studio", "gras (foundryGras)");
                    return tally("verletzung", "Gras ohne foundryGras-Stempel (Alt-Tuft?)");
                }
                if (chain.some((p) => skySet.has(p) || (p.userData && p.userData.skyOffset)))
                    return tally("substanz", "himmel/gestirn");
                if (chain.some((p) => p.userData && p.userData.kind === "creature"))
                    return tally("substanz", "kreatur");
                if (st.playerMesh && chain.includes(st.playerMesh)) return tally("substanz", "avatar");
                if (chain.some((p) => islandSet.has(p))) return tally("entscheid", "fliegende Insel (E-F)");
                for (const p of chain) {
                    const nm = archMeshName.get(p);
                    if (nm) {
                        const c = classifyName(nm);
                        return tally(c.b, c.why);
                    }
                }
                // 2b) H3 — der Inventar-Stempel der Bau-Chokepoints (userData.inventar):
                const inv = node.userData && node.userData.inventar;
                if (inv) {
                    const c = INVENTAR[inv];
                    if (c) return tally(c.b, c.why);
                    return tally("verletzung", "unbekannte inventar-Klasse: " + inv);
                }
                // 3) FALLBACK — fail-closed: ein Emitter, den keine Identität erklärt, ist rot.
                return tally("verletzung", "UNBEKANNTER Emitter (keine Identität)");
            });
            return { buckets, detail, violations, emitters, leere };
        };

        o.zensus = census();

        // ── W — die Nah-Wiese im Zensus (Welle 6): der Ring am Start trägt Büschel, jede Senke ist nach dem Sicht-Satz
        // belegt und steht als STUDIO-Emitter im Zensus (über ihren Foundry-Leaf-Key) — sonst ist die Wiese leer bewiesen.
        const wieseImZensus = (z) =>
            Object.entries(z.detail.studio)
                .filter(([k]) => k.indexOf("[nahWiese#") >= 0)
                .reduce((s, [, n]) => s + n, 0);
        const wieseUrteil = (w, z) => {
            const f = [];
            if (!(w.senken > 0)) f.push("keine Senke der Nah-Wiese — die Studio-Gras-Vorlagen fehlen");
            else if (!(w.bueschel > 0))
                f.push(
                    `der Ring am Start trägt keinen Büschel (${w.kacheln} Kacheln) — die Linse misst die Nah-Wiese nicht`
                );
            else {
                const leer = Object.keys(w.je).filter((k) => !(w.je[k] > 0));
                if (leer.length)
                    f.push(`${leer.length} Senken leer nach dem Sicht-Satz (${leer.join(", ")}) — leer bewiesen`);
                const n = wieseImZensus(z);
                if (n !== w.senken) f.push(`${n} von ${w.senken} Senken der Nah-Wiese als Studio-Emitter gezählt`);
            }
            return f;
        };
        o.wieseZensus = wieseImZensus(o.zensus);
        o.wieseFehl = wieseUrteil(o.wiese, o.zensus);

        // ── Positiv-Beweis: die Linse misst eine LEBENDE Studio-Streu (sonst vakuös).
        o.studioScatterGroups = 0;
        if (st.archInstanceGroups)
            for (const [k, g2] of st.archInstanceGroups)
                if (String(k).startsWith("fscatter:") && g2 && g2.mesh && g2.mesh.count > 0) o.studioScatterGroups++;
        // ── Positiv-Beweis der Stempel: mindestens EINE gestempelte Klasse lebt in der
        // Szene (sonst wäre das Inventar-Wörterbuch toter Code — KONSUM, nicht Existenz).
        o.stampedClasses = Object.keys(o.zensus.detail.substanz).filter((k) =>
            /^(boden-satz|wetter-regen)/.test(k)
        ).length;

        // ── HÄLFTE 2 — DIE INVENTUR (H3: requested ⊆ visible|cached).
        // Attestierung SICHTBARER Gestalt je (preset|variant|lod)-Tripel, saison-tolerant:
        //   fscatter:preset:variant:lod-Gruppen · f:<cachekey>-Leaves · fimp:-Impostor-
        //   Records (attestieren ihr LOD1-Bake-Subjekt) · das Studio-Gras-Memo je Stufe.
        const inventory = () => {
            const res = { requested: 0, cached: 0, lruEvicted: 0, pending: 0, lost: [], attested: 0 };
            if (!f) return res;
            const attested = new Set();
            if (st.archInstanceGroups)
                for (const k of st.archInstanceGroups.keys()) {
                    const ks = String(k);
                    if (ks.startsWith("fscatter:")) {
                        const parts = ks.slice(9).split("#")[0].split(":");
                        if (parts.length >= 3) attested.add(parts[0] + "|" + parts[1] + "|" + parts[2]);
                    }
                    const lf = leafOf(ks);
                    if (lf.startsWith("f:")) {
                        const pp = lf.slice(2).split(":")[0].split("|");
                        if (pp.length === 4) attested.add(pp[0] + "|" + pp[1] + "|" + pp[2]);
                    }
                }
            // Waldboden 04.10. — jede Senke der Nah-Streu attestiert ihr Studio-Tripel (preset|gestalt|stufe).
            if (st.nahStreu)
                for (const a of st.nahStreu.senken.values()) {
                    const lf = String(a.leafKey || "");
                    if (!lf.startsWith("f:")) continue;
                    const pp = lf.slice(2).split(":")[0].split("|");
                    if (pp.length >= 3 && a.anzahl > 0) attested.add(pp[0] + "|" + pp[1] + "|" + pp[2]);
                }
            // Die Karten (W6): jede Zelle des EINEN Atlas attestiert die L1 ihrer Art × Gestalt (headless ihr Rahmen,
            // gescheitert = bewusstes Verdikt); Grammatik-Zellen (fimp:g:) tragen keine Foundry-Art.
            if (r._kartenAtlas)
                for (const k of r._kartenAtlas.zellen.keys()) {
                    if (k.startsWith("fimp:g:")) continue;
                    const pp = String(k).slice(5).split("|");
                    if (pp.length >= 2) attested.add(pp[0] + "|" + pp[1] + "|1");
                }
            if (r._grassStudioGeoByStage)
                for (const stg of Object.keys(r._grassStudioGeoByStage)) {
                    const m = r._grassStudioGeoByStage[stg];
                    // Geometrie ODER das bewusste "leer"-Verdikt attestiert; false = Alt-Pfad (kein Studio).
                    if (m !== undefined && m !== null && m !== false) attested.add("gras|1|" + stg);
                }
            res.attested = attested.size;
            const requested = f.requested ? Array.from(f.requested) : [];
            res.requested = requested.length;
            res.cached = f.cache ? f.cache.size : 0;
            res.lruEvicted = f.lruEvicted ? f.lruEvicted.size : 0;
            res.pending = f.pending ? f.pending.size : 0;
            for (const key of requested) {
                if (f.cache && f.cache.has(key)) continue; // resident (auch null = bewusstes Verdikt)
                const pp = String(key).split("|");
                const triple = pp.length === 4 ? pp[0] + "|" + pp[1] + "|" + pp[2] : null;
                if (triple && attested.has(triple)) continue; // sichtbar attestiert
                if (f.lruEvicted && f.lruEvicted.has(key)) continue; // bewusste Räumung, re-anfragbar
                res.lost.push(key); // angefragt, weder geliefert noch resident = das stille Verhungern
            }
            return res;
        };
        o.inventur = inventory();

        // ── Selbst-Test: injizierte Fremd-Emitter + ein synthetisch verlorener Key —
        // ALLE Fangpfade müssen feuern (sonst vakuös).
        if (doSelftest) {
            const injected = [];
            try {
                const geo = new THREE.BoxGeometry(1, 3, 1);
                const mat = new THREE.MeshBasicMaterial();
                const fake1 = new THREE.InstancedMesh(geo, mat, 4);
                fake1.count = 4;
                fake1.userData.archInstanceKey = "baum_eiche#0@3,3";
                // In die Gruppen-Karte einhängen, wie eine echte Grammatik-Gruppe es wäre:
                if (st.archInstanceGroups)
                    st.archInstanceGroups.set("baum_eiche#0@3,3", { key: "baum_eiche#0@3,3", mesh: fake1 });
                st.scene.add(fake1);
                injected.push(fake1);
                const fake2 = new THREE.Mesh(geo, mat); // nackter Unbekannter → Fallback-Pfad
                st.scene.add(fake2);
                injected.push(fake2);
                const fake3 = new THREE.Mesh(geo, mat); // unbekannte inventar-Klasse → Wörterbuch fail-closed
                fake3.userData.inventar = "selftest-fremdklasse";
                st.scene.add(fake3);
                injected.push(fake3);
                // N4.3 (Nervensystem-Plan, DIE TUFT-WAND): ein GRAS-Mesh OHNE foundryGras-Stempel
                // (= der Alt-Tuft-Nachbau, der W6-Fail-Open) MUSS als Verletzung zählen — die
                // stehende Wand, die den N7.3-gebundenen Tuft-Schnitt bis dahin bewacht. Die
                // Injektion beweist, dass die Zensus-Klasse „Gras ohne foundryGras" FEUERT
                // (sonst wäre die Wand vakuös, solange die lebende Wiese brav Studio trägt).
                const fake4 = new THREE.InstancedMesh(geo, mat, 2);
                fake4.count = 2;
                st.scene.add(fake4);
                grassSet.add(fake4); // wie ein Eintrag in st.voxelChunkGrass (der Zensus-Schnappschuss)
                injected.push(fake4);
                // meshKeys ist ein Schnappschuss von VOR der Injektion → fake1 fällt (wie
                // fake2) in den Fail-Closed-Fallback: fake1–fake3 + der Tuft-Fake MÜSSEN als
                // +4 Verletzungen zählen. Der Namens-Regel-Pfad (Grammatik-Baum-Key →
                // verletzung) wird zusätzlich PUR über classifyKey geprüft — alle Fangpfade bewiesen:
                const c1 = classifyKey("baum_eiche#0@3,3");
                const c2 = classifyKey("fscatter:eiche:2:0#0@1,1");
                const c3 = classifyKey("tempel#2");
                o.selftestRules = {
                    grammarTreeCaught: c1.b === "verletzung",
                    fscatterStudio: c2.b === "studio",
                    archSubstanz: c3.b === "substanz",
                };
                const z2 = census();
                o.selftest = {
                    before: o.zensus.buckets.verletzung,
                    after: z2.buckets.verletzung,
                    fired: z2.buckets.verletzung === o.zensus.buckets.verletzung + 4,
                    // N4.3 — die Tuft-Wand feuert NAMENTLICH (nicht nur der Zähler):
                    tuftWallFired: z2.violations.some((v) => /foundryGras/.test(v.label)),
                };
                grassSet.delete(fake4); // Schnappschuss-Hygiene (Szene räumt das finally)
                // (b) der synthetisch VERLORENE Key: in f.requested, aber weder Cache noch
                // Szene noch Räumungs-Buch kennen ihn → die Inventur MUSS ihn als lost fangen.
                if (f) {
                    if (!f.requested) f.requested = new Set();
                    const ghost = "selftest_geist|1|0";
                    f.requested.add(ghost);
                    const inv2 = inventory();
                    o.selftestLost = {
                        before: o.inventur.lost.length,
                        after: inv2.lost.length,
                        fired: inv2.lost.length === o.inventur.lost.length + 1 && inv2.lost.includes(ghost),
                    };
                    f.requested.delete(ghost);
                }
            } finally {
                for (const m of injected) st.scene.remove(m);
                if (st.archInstanceGroups) st.archInstanceGroups.delete("baum_eiche#0@3,3");
            }
            // (c) W: eine belegte Senke der Nah-Wiese ohne Leaf-Key MUSS als Verletzung zählen (sie zeichnet, der Zensus
            // sieht sie — nicht als leeren Pool), und ein Sicht-Satz in den Himmel (leere Senken) MUSS das W-Urteil röten.
            if (st.nahWiese) {
                const a = [...st.nahWiese.senken.values()].find((x) => x.anzahl > 0 && x.mesh);
                o.selftestWiese = { name: a ? a.name : null, ohneKey: false, blind: [] };
                if (a) {
                    const keys = meshKeys.get(a.mesh);
                    meshKeys.delete(a.mesh);
                    const z3 = census();
                    meshKeys.set(a.mesh, keys);
                    o.selftestWiese.ohneKey = z3.violations.some((v) => v.name === a.name);
                }
                o.selftestWiese.blind = wieseUrteil(window.__wieseSicht(r, true), census());
                window.__wieseSicht(r);
            }
        }
        return o;
    }, selftest);
    await browser.close();
    server.close();

    console.log("=== ASSET-INVENTUR (Null-Renderer, foundry-ON) — Zensus + H3 ===");
    console.log(`  foundryEnabled: ${out.foundryEnabled} · foundryReady: ${out.foundryReady}`);
    const z = out.zensus;
    console.log(
        `  Emitter gesamt: ${z.emitters} (leere Pools übersprungen: ${z.leere}) · Studio-Scatter-Gruppen bestückt: ${out.studioScatterGroups}`
    );
    console.log(
        `  STUDIO ${z.buckets.studio} · SUBSTANZ ${z.buckets.substanz} · ENTSCHEID ${z.buckets.entscheid} · VERLETZUNG ${z.buckets.verletzung}`
    );
    for (const b of ["studio", "substanz", "entscheid"]) {
        const rows = Object.entries(z.detail[b]).sort((a, c) => c[1] - a[1]);
        if (rows.length) {
            console.log(`  ── ${b.toUpperCase()}:`);
            for (const [k, n] of rows.slice(0, 12)) console.log(`     ${String(n).padStart(5)} × ${k}`);
            if (rows.length > 12) console.log(`     … (${rows.length - 12} weitere Klassen)`);
        }
    }
    if (z.violations.length) {
        console.log("  ── VERLETZUNGEN (Fremd-Silhouetten):");
        for (const v of z.violations.slice(0, 20)) console.log("     ❌ " + JSON.stringify(v));
        if (z.violations.length > 20) console.log(`     … (${z.violations.length - 20} weitere)`);
    }
    const inv = out.inventur;
    console.log(
        `  ── INVENTUR (H3): requested ${inv.requested} · cache ${inv.cached} · attestiert ${inv.attested} · LRU-geräumt ${inv.lruEvicted} · pending ${inv.pending} · VERLOREN ${inv.lost.length}`
    );
    if (inv.lost.length) for (const k of inv.lost.slice(0, 20)) console.log(`     ❌ verloren: ${k}`);

    const w = out.wiese || { je: {} };
    console.log(
        `  ── NAH-WIESE (Sicht-Satz von der Linse gelegt): ${w.senken} Senken · ${w.bueschel} Büschel im Ring · gelegt ${Object.values(w.je).join("/")} · als Studio-Emitter gezählt ${out.wieseZensus}`
    );
    for (const x of out.wieseFehl || []) console.log(`     ❌ ${x}`);

    const fails = [];
    for (const x of out.wieseFehl || []) fails.push("Nah-Wiese: " + x);
    if (!out.foundryReady) fails.push("Foundry nicht ready (Linse misst die falsche Welt)");
    if (!(out.studioScatterGroups > 0)) fails.push("keine bestückte fscatter:-Gruppe (Linse misst nichts)");
    if (!(out.stampedClasses > 0)) fails.push("keine gestempelte inventar-Klasse in der Szene (Wörterbuch vakuös)");
    if (z.buckets.verletzung > 0) fails.push(`${z.buckets.verletzung} Fremd-Silhouetten (VERLETZUNG)`);
    if (!(inv.requested > 0)) fails.push("f.requested leer (Inventur misst nichts)");
    if (inv.pending > 0) fails.push(`${inv.pending} Anfragen hängen nach dem Settle (pending klemmt)`);
    if (inv.lost.length > 0) fails.push(`${inv.lost.length} verlorene Foundry-Keys (angefragt, nie resident)`);
    if (selftest) {
        console.log(
            `  Selbst-Test Zensus: Regeln ${JSON.stringify(out.selftestRules)} · Injektion vorher=${out.selftest.before} nachher=${out.selftest.after} → ${out.selftest.fired ? "feuert ✅" : "feuert NICHT ❌"}`
        );
        console.log(
            `  Selbst-Test Inventur: verloren vorher=${out.selftestLost ? out.selftestLost.before : "?"} nachher=${out.selftestLost ? out.selftestLost.after : "?"} → ${out.selftestLost && out.selftestLost.fired ? "feuert ✅" : "feuert NICHT ❌"}`
        );
        console.log(
            `  Selbst-Test Tuft-Wand (N4.3): Gras ohne foundryGras-Stempel → ${out.selftest.tuftWallFired ? "feuert ✅" : "feuert NICHT ❌"}`
        );
        if (!out.selftest.fired) fails.push("Selbst-Test: injizierte Fremd-Emitter nicht gefangen");
        if (!out.selftest.tuftWallFired)
            fails.push("Selbst-Test: die Tuft-Wand (Gras ohne foundryGras-Stempel) feuert nicht");
        if (
            !out.selftestRules ||
            !out.selftestRules.grammarTreeCaught ||
            !out.selftestRules.fscatterStudio ||
            !out.selftestRules.archSubstanz
        )
            fails.push("Selbst-Test: Klassifikations-Regeln fehlerhaft");
        if (!out.selftestLost || !out.selftestLost.fired)
            fails.push("Selbst-Test: synthetisch verlorener Key nicht gefangen");
        const sw = out.selftestWiese || { blind: [] };
        console.log(
            `  Selbst-Test Nah-Wiese: belegte Senke ohne Leaf-Key (${sw.name}) → ${sw.ohneKey ? "Verletzung ✅" : "NICHT gesehen ❌"} · Sicht-Satz in den Himmel → ${sw.blind.length ? "rot ✅ (" + sw.blind[0] + ")" : "NICHT rot ❌"}`
        );
        if (!sw.ohneKey) fails.push("Selbst-Test: eine belegte Senke der Nah-Wiese ohne Leaf-Key blieb ungesehen");
        if (!sw.blind.length)
            fails.push("Selbst-Test: leere Senken der Nah-Wiese (Blick in den Himmel) röten das W-Urteil nicht");
    }
    if (fails.length) {
        console.log(`\n❌ ASSET-INVENTUR ROT: ${fails.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        `\n✅ ASSET-INVENTUR GRÜN — ${z.emitters} Emitter erklärt, 0 Fremd-Silhouetten (Studio ${z.buckets.studio} · Substanz ${z.buckets.substanz} · Entscheid ${z.buckets.entscheid}); H3: ${inv.requested} angefragte Keys ⊆ visible|cached (0 verloren, 0 hängend); die Nah-Wiese zeichnet ${out.wieseZensus} belegte Studio-Senken.`
    );
    process.exit(0);
})().catch((e) => {
    console.error("Inventur-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
