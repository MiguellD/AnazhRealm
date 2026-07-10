// diag-nervensystem-schmiede.cjs — DER ε-BEWEIS DER WAFFEN-DOMAENE (Katalysator-Bogen
// W-A4a; Nervensystem-Plan TEIL IV Phase ε). Die Klingen-Domaene (schmiede-core.js,
// __schmiedeCore) dockt NUR ueber die Checkliste §ε an: Manifest-Zeile (N2) +
// KIND_POLICY-Zeile + Donor-Blueprint (N1, beides DATEN) + fx.place als Rezept-Daten
// (N5.5, mode "hand") — der Stamm bekam KEINEN Logik-Zweig (M8; den strukturellen
// „kein kind-if im AutoRegister"-Wall traegt zusaetzlich das Verfassungs-Gesetz N1 in
// gate:constitution). Gestraffte Schwester zu diag-nervensystem-porta.cjs:
//   S (statisch, Node): Manifest traegt schmiede (ns __schmiedeCore) · KIND_POLICY
//     traegt die weapon-Zeile (prefix klinge_, donor geraet_schwert) · der Auto-
//     Register-Chokepoint laeuft die Tabelle OHNE kind-String-Vergleich ·
//     schmiede-core deklariert kindStages.weapon == [0] · die Rezepte tragen
//     fx.place {mode:"hand"} als DATEN · der Donor geraet_schwert ist ein
//     DATENBLOCK in _defaultBlueprints (kein portalMeta/roleManual — die Rolle
//     EMERGIERT aus den Parts, Omega-PHYSIS ist der Wield-Richter).
//     --selftest injiziert 2 Verletzungen.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die 21 Klingen-
//     Rezepte (Waffen UND Werkzeuge) · kindStages.weapon == [0] gemerged (tree/
//     vehicle/gate unberuehrt) · Auto-Blueprint klinge_langschwert entsteht am
//     EINEN Chokepoint (Donor-Klon, KEIN _grownSpecies) · die generische
//     klinge_-Regel loest auf · die Place-Aufloesung liefert mode "hand", der
//     Dispatch streut NICHT + keine klinge_-Wald-Nische ·
//     _foundryRequest("langschwert",7,0) liefert Meshes end-to-end (Mesh-Zahl
//     geloggt; mat.color reist, BuildGroup baut) · die Distanz-Wahl lod=2 klemmt
//     fail-closed auf Stufe 0.
//   H (W-A4b — DIE STUDIO-GESTALT IN DER HAND, eigener Abschnitt + eigene Zaehlung):
//     equipHeld zeigt SOFORT den Part-Bau als Interim (die Hand ist nie leer) und
//     tauscht bei Asset-Ankunft GENAU EINMAL auf die Studio-Wrapper (sharedGeom/
//     sharedMat, foundryHeld) · Skala/Anker-Zahlen geloggt (Template-BBox je Achse
//     fuer langschwert + spitzhacke, gripX aus dem LIVE-Buch, Achsen-Abbildung
//     rotation.z += PI/2) · der Unequip zerstoert das GETEILTE Asset NICHT
//     (_queueDispose instrumentiert; die Cache-Gruppe baut danach noch eine
//     Werkstatt-Vorschau; _liveRefs-Rueckgabe) · foundry-off (lokaler Hook,
//     sichern/wiederherstellen) -> der Part-Pfad byte-alt.
//   node scripts/diag-nervensystem-schmiede.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.NERV_SCHMIEDE_PORT || 4433);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
// Kommentare strippen (die V18.267-Falle: erklaerende Kommentare zitieren die Muster woertlich).
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
// Der Methoden-Body per Klammer-Zaehlung (das diag-pipeline-constitution-Muster).
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}

// ===== TEIL S: die statischen Gesetze =====
function staticLaws(anazhSrc, scSrc, manifestSrc) {
    const anazhNC = stripComments(anazhSrc);
    const scNC = stripComments(scSrc);
    const out = [];
    let manifest = null;
    try {
        manifest = JSON.parse(manifestSrc);
    } catch (_e) {}
    const schmiede = Array.isArray(manifest) ? manifest.find((c) => c && c.id === "schmiede") : null;
    out.push([
        "S1: das Manifest traegt den schmiede-Kern (scripts schmiede-core.js, ns __schmiedeCore)",
        !!schmiede &&
            Array.isArray(schmiede.scripts) &&
            schmiede.scripts.includes("schmiede-core.js") &&
            schmiede.vertrag === "schmiede-core.js" &&
            schmiede.ns === "__schmiedeCore",
    ]);
    out.push([
        "S2: KIND_POLICY traegt die weapon-Zeile (prefix klinge_, donor geraet_schwert — die EINE Daten-Zeile)",
        /weapon:\s*Object\.freeze\(\{\s*prefix:\s*"klinge_",\s*donor:\s*"geraet_schwert"/.test(anazhNC),
    ]);
    // ABSCHIEDS-WELLE (V9.56-i + die V18.440-fnBody-Lehre): die Probe ankert auf der
    // DEFINITIONS-Form (\\(book\\)\\s*\\{) — die CALL-SITE in _foundryIngestRecipes steht
    // im File VOR der Definition und schnitte sonst den falschen Body.
    const autoReg = fnBody(anazhNC, /_foundryAutoRegisterSpecies\(book\)\s*\{/);
    out.push([
        "S3: der Auto-Register-Chokepoint laeuft die Policy-Tabelle (kein kind-String-Vergleich, M8 — s. a. gate:constitution N1)",
        autoReg !== null && /KIND_POLICY/.test(autoReg) && !/kind\s*[!=]==?\s*"/.test(autoReg),
    ]);
    out.push([
        "S4: schmiede-core deklariert kindStages.weapon == [0] (B2-Vertrags-Daten)",
        /kindStages:\s*\{\s*weapon:\s*\[0\]\s*\}/.test(scSrc),
    ]);
    out.push([
        'S5: die Klingen-Rezepte tragen das Platzierungs-Gesetz als DATEN (fx.place mode "hand")',
        /place:\s*\{\s*mode:\s*"hand"\s*\}/.test(scNC),
    ]);
    out.push([
        "S6: der Donor geraet_schwert ist ein DATENBLOCK in den Built-ins (kein portalMeta/roleManual — Rolle emergiert aus den Parts)",
        /geraet_schwert:\s*\{\s*name:\s*"geraet_schwert"/.test(anazhNC) &&
            !/geraet_schwert:\s*\{[^}]*portalMeta/.test(anazhNC) &&
            !/geraet_schwert:\s*\{[^}]*roleManual/.test(anazhNC),
    ]);
    // W-A4b — die Hand-Gesetze (statisch):
    out.push([
        'S7: KIND_POLICY.weapon deklariert die Template-Handachse als DATEN (handAxis "x" — M8, kein kind-if im Konsument)',
        /weapon:\s*Object\.freeze\(\{[^}]*handAxis:\s*"x"/.test(anazhNC),
    ]);
    // Anker = die DEFINITIONS-Form (Zeilenanfang + Methoden-Einzug): ein Regex auf den
    // nackten Namen traefe die CALL-SITE zuerst (this._refreshHeldMesh() im Restore liegt
    // VOR der Definition) und lieferte den falschen Body — gemessen (W-A4b-Heilung).
    const refreshBody = fnBody(anazhNC, /\n    _refreshHeldMesh\(\)\s*\{/);
    const heldSrcBody = fnBody(anazhNC, /\n    _heldFoundryGroup\(bpName\)\s*\{/);
    const disposeBody = fnBody(anazhNC, /\n    _disposeSoulGroup\(group\)\s*\{/);
    out.push([
        "S8: der Hand-Konsument ist verdrahtet — buildHand liest _heldFoundryGroup + waermt (_warmCompilePipeline), die Quelle nutzt die EINE Wrapper-Quelle (_workshopWrapFoundryGroup) + den Welt-Cache (_foundryCacheGet), der Dispose-Chokepoint traegt die sharedGeom-Wand + Ref-Rueckgabe",
        refreshBody !== null &&
            /_heldFoundryGroup\(/.test(refreshBody) &&
            /_warmCompilePipeline\(/.test(refreshBody) &&
            heldSrcBody !== null &&
            /_workshopWrapFoundryGroup\(/.test(heldSrcBody) &&
            /_foundryCacheGet\(/.test(heldSrcBody) &&
            disposeBody !== null &&
            /sharedGeom/.test(disposeBody) &&
            /foundrySrcGroup/.test(disposeBody),
    ]);
    return out;
}

(async () => {
    const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const scSrc = fs.readFileSync(path.join(root, "schmiede-core.js"), "utf8");
    const manifestSrc = fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8");

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: die schmiede-Manifest-Zeile entfernt -> S1 muss rot werden.
        const brokenManifest = JSON.stringify(JSON.parse(manifestSrc).filter((c) => c && c.id !== "schmiede"));
        const s1 = staticLaws(anazhSrc, scSrc, brokenManifest).find((l) => l[0].startsWith("S1"));
        check("Selbst-Test 1: schmiede-Zeile aus dem Manifest entfernt -> S1 feuert", s1 && s1[1] === false);
        // V2: die weapon-Policy-Zeile verstuemmelt -> S2 muss rot werden.
        const brokenPolicy = anazhSrc.replace('donor: "geraet_schwert"', 'donor: "geraet_kaputt"');
        const s2 = staticLaws(brokenPolicy, scSrc, manifestSrc).find((l) => l[0].startsWith("S2"));
        check("Selbst-Test 2: weapon-Policy-Zeile verstuemmelt -> S2 feuert", s2 && s2[1] === false);
        // V3 (W-A4b): die Handachsen-Daten-Zeile gekippt -> S7 muss rot werden.
        const brokenAxis = anazhSrc.replace('handAxis: "x"', 'handAxis: "y"');
        const s7 = staticLaws(brokenAxis, scSrc, manifestSrc).find((l) => l[0].startsWith("S7"));
        check("Selbst-Test 3: handAxis-Daten-Zeile gekippt -> S7 feuert", s7 && s7[1] === false);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN — die Linse feuert auf alle drei Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS SCHMIEDE — TEIL S: die statischen Gesetze (Node) ===");
    for (const [name, ok, detail] of staticLaws(anazhSrc, scSrc, manifestSrc)) check(name, ok, detail);

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { b: {}, d: {}, p: {}, e: {}, f: {}, h: {} };
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        const A = r.constructor;
        const f = r._ensureAssetFoundry();
        // Worker + Buch + Config abwarten (recipes/render-config folgen dem ready-Handshake).
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            const rc = A._studioRenderConfig;
            if (f && f.ready && f.recipes && f.recipes.langschwert && rc && rc.lod && rc.lod.kindStages) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        const rc = A._studioRenderConfig;
        const ks = rc && rc.lod ? rc.lod.kindStages : null;
        // ===== B: das Buch + der N7.5-Merge KOMMEN AN =====
        res.b.kind = f && f.recipes && f.recipes.langschwert ? f.recipes.langschwert.kind : null;
        res.b.griff =
            f && f.recipes && f.recipes.langschwert && f.recipes.langschwert.s ? f.recipes.langschwert.s.griff : null;
        res.b.weaponCount =
            f && f.recipes
                ? Object.keys(f.recipes).filter((k) => f.recipes[k] && f.recipes[k].kind === "weapon").length
                : 0;
        res.b.toolCount =
            f && f.recipes
                ? Object.keys(f.recipes).filter(
                      (k) => f.recipes[k] && f.recipes[k].kind === "weapon" && f.recipes[k].fx && f.recipes[k].fx.tool
                  ).length
                : 0;
        res.b.paramsWeapon =
            f && f.paramsByKind && Array.isArray(f.paramsByKind.weapon) ? f.paramsByKind.weapon.length : -1;
        res.b.ksWeapon = ks ? JSON.stringify(ks.weapon) : null;
        res.b.ksTree = ks ? JSON.stringify(ks.tree) : null;
        res.b.ksVehicle = ks ? JSON.stringify(ks.vehicle) : null;
        res.b.ksGate = ks ? JSON.stringify(ks.gate) : null;
        // ===== D: der AUTO-BLUEPRINT (Donor-Klon am EINEN Chokepoint) =====
        try {
            const bp = r.state.blueprints && r.state.blueprints.klinge_langschwert;
            res.d.blueprint = !!bp;
            res.d.autoSpecies = bp ? bp._foundryAutoSpecies : null;
            res.d.grownSpecies = bp ? bp._grownSpecies || null : "kein-bp";
            res.d.label = bp ? bp.label : null;
            res.d.parts = bp && Array.isArray(bp.parts) ? bp.parts.length : 0;
            res.d.builtIn = bp ? !!bp.builtIn : null;
            res.d.donorIntact = !!(r.state.blueprints.geraet_schwert && r.state.blueprints.geraet_schwert.builtIn);
            res.d.presetResolves = r._foundryPresetFor("klinge_langschwert");
            res.d.entryResolves = r._foundryPresetForEntry({ type: "klinge_spitzhacke" });
            // die Werkzeug-Klasse dockt genauso (geraet_spitzhacke-Klasse gedeckt):
            res.d.toolBlueprint = !!(r.state.blueprints && r.state.blueprints.klinge_spitzhacke);
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }
        // ===== P: die PLACE-AUFLOESUNG (N5.5 — hand als Daten, streut nicht) =====
        try {
            const pol = r._placePolicyFor(f.recipes.langschwert);
            res.p.mode = pol.mode;
            res.p.dispatch = r._placeDispatch(pol, { id: "langschwert" });
            r._forestExtraCache = null;
            res.p.inExtras = r._forestExtraSpecies().some((e) => String(e.species).indexOf("klinge_") === 0);
            r._forestExtraCache = null;
        } catch (e) {
            res.p.err = (e && e.message) || String(e);
        }
        // ===== E: das ASSET selbst (Worker-Dispatch + mat.color + BuildGroup) =====
        try {
            const meshes = await Promise.race([
                r._foundryRequest("langschwert", 7, 0, "summer"),
                new Promise((res3) => setTimeout(() => res3(null), 30000)),
            ]);
            res.e.meshCount = Array.isArray(meshes) ? meshes.length : -1;
            res.e.hasMatColor =
                Array.isArray(meshes) &&
                meshes.some((m) => m && m.mat && Array.isArray(m.mat.color) && m.mat.color.length === 3);
            if (Array.isArray(meshes) && meshes.length) {
                const g = r._foundryBuildGroup(meshes);
                res.e.groupChildren = g && g.children ? g.children.length : 0;
                res.e.allHaveColor =
                    !!g &&
                    g.children.every((ch) => !!(ch.geometry && ch.geometry.attributes && ch.geometry.attributes.color));
                // Aufraeumen (kein Leak in der Probe):
                if (g)
                    g.traverse((o) => {
                        if (o.isMesh && o.geometry) o.geometry.dispose();
                    });
            }
        } catch (e) {
            res.e.err = (e && e.message) || String(e);
        }
        // ===== F: FAIL-CLOSED behavioral — die Distanz-Wahl 2 klemmt auf Stufe 0 =====
        try {
            if (!f.requested) f.requested = new Set();
            const before = new Set(f.requested);
            r._foundryFlattenFor({ seed: 7 }, "langschwert", 2);
            const fresh = Array.from(f.requested).filter((k) => !before.has(k));
            res.f.key = fresh.find((k) => k.startsWith("langschwert|")) || null;
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        // ===== H: DIE HAND (W-A4b) — die Studio-Gestalt am EINEN Equip-Chokepoint =====
        try {
            const box3 = (obj) => {
                obj.updateMatrixWorld(true);
                const bb = new THREE.Box3().setFromObject(obj);
                const rnd = (v) => Number(v.toFixed(3));
                return {
                    x: [rnd(bb.min.x), rnd(bb.max.x)],
                    y: [rnd(bb.min.y), rnd(bb.max.y)],
                    z: [rnd(bb.min.z), rnd(bb.max.z)],
                };
            };
            // Welt-bereit (Spieler-Mesh baut parallel zum Foundry-Handshake).
            const dlh = performance.now() + 60000;
            while ((!r.state.playerMesh || !r.state.player) && performance.now() < dlh)
                await new Promise((r2) => setTimeout(r2, 150));
            const pm = r.state.playerMesh;
            res.h.playerReady = !!(pm && r.state.player);
            if (res.h.playerReady) {
                // (1) INTERIM auf einem JUNGFRAEULICHEN Schluessel (klinge_degen — kein anderer
                // Abschnitt fragte ihn an; langschwert|8|0 kollidiert mit der F-Anfrage):
                // der Equip zeigt SOFORT den Part-Bau, die Ankunft tauscht auf Studio.
                r.equipHeld("klinge_degen");
                const hm0 = pm.userData && pm.userData.heldMesh;
                res.h.interimVisible = !!(
                    hm0 &&
                    hm0.children &&
                    hm0.children.length > 0 &&
                    !(hm0.userData && hm0.userData.foundryHeld)
                );
                const dls = performance.now() + 45000;
                while (performance.now() < dls) {
                    const w = pm.userData && pm.userData.heldMesh;
                    if (w && w.userData && w.userData.foundryHeld) break;
                    await new Promise((r2) => setTimeout(r2, 150));
                }
                const hmD = pm.userData && pm.userData.heldMesh;
                res.h.degenStudio = !!(hmD && hmD.userData && hmD.userData.foundryHeld);
                // (2) WARM: langschwert equipen, auf die Studio-Gestalt warten, Zahlen messen.
                r.equipHeld("klinge_langschwert");
                const dlw = performance.now() + 45000;
                while (performance.now() < dlw) {
                    const w = pm.userData && pm.userData.heldMesh;
                    if (w && w.userData && w.userData.foundryHeld) break;
                    await new Promise((r2) => setTimeout(r2, 150));
                }
                const hm = pm.userData && pm.userData.heldMesh;
                res.h.studio = !!(hm && hm.userData && hm.userData.foundryHeld);
                if (res.h.studio) {
                    res.h.preset = hm.userData.heldPreset;
                    res.h.meshCount = hm.children.length;
                    res.h.allShared = hm.children.every(
                        (c) => c.userData && c.userData.sharedGeom && c.userData.sharedMat
                    );
                    res.h.scale = Number(hm.scale.x.toFixed(4));
                    res.h.scaleOk = hm.scale.x > 0 && hm.scale.x <= r.constructor.HELD_MESH.maxScale;
                    res.h.gripX = hm.userData.heldGripX;
                    res.h.axis = hm.userData.heldAxis;
                    res.h.rotZ = Number(hm.rotation.z.toFixed(4));
                    const parts = pm.userData && pm.userData.parts;
                    const armAnchor = parts && (parts.rightArm || parts.rightWing);
                    res.h.anchored = hm.parent === (armAnchor || pm);
                    const src = hm.userData.foundrySrcGroup;
                    res.h.liveRefs = src ? src._liveRefs : -1;
                    if (src) res.h.bboxLang = box3(src); // Template-Raum (Quell-Gruppe, unskaliert)
                    // (3) UNEQUIP zerstoert das GETEILTE Asset NICHT — _queueDispose instrumentiert.
                    const sharedGeos = [];
                    hm.traverse((o) => {
                        if (o.userData && o.userData.sharedGeom && o.geometry) sharedGeos.push(o.geometry);
                    });
                    const refsBefore = src ? src._liveRefs : 0;
                    const queued = [];
                    const protoQD = r.constructor.prototype._queueDispose;
                    r._queueDispose = function (obj) {
                        queued.push(obj);
                        return protoQD.call(this, obj);
                    };
                    r.equipHeld(null);
                    delete r._queueDispose;
                    res.h.unequipNoMesh = !(pm.userData && pm.userData.heldMesh);
                    res.h.sharedSurvives = !queued.some((q) => sharedGeos.indexOf(q) >= 0);
                    res.h.refReturned = !src || src._liveRefs === Math.max(0, refsBefore - 1);
                    res.h.srcAlive = !!(
                        src &&
                        !src._geomDisposed &&
                        src.children.length > 0 &&
                        src.children[0].geometry &&
                        src.children[0].geometry.attributes &&
                        src.children[0].geometry.attributes.position
                    );
                    // (4) die Cache-Gruppe baut DANACH noch eine Werkstatt-Vorschau (ein Zug, viele Leser).
                    const wsWrap = src ? r._workshopWrapFoundryGroup(src) : null;
                    res.h.workshopAfter = !!(wsWrap && wsWrap.children.length > 0);
                }
                // (5) SPITZHACKE-Probe (Werkzeug-Klasse, s.schaft-Griff) — direkte Quelle + Zahlen.
                let probe = r._heldFoundryGroup("klinge_spitzhacke");
                const dlp = performance.now() + 45000;
                while (probe === "pending" && performance.now() < dlp) {
                    await new Promise((r2) => setTimeout(r2, 150));
                    probe = r._heldFoundryGroup("klinge_spitzhacke");
                }
                if (probe && probe !== "pending") {
                    res.h.spitzGrip = probe.userData.heldGripX;
                    res.h.spitzAxis = probe.userData.heldAxis;
                    res.h.bboxSpitz = box3(probe);
                    r._disposeSoulGroup(probe); // Ref-Rueckgabe (die Probe haelt nichts fest)
                }
                // (6) FOUNDRY-OFF — lokaler Hook, SICHERN + WIEDERHERSTELLEN (die Gate-Hook-Lehre).
                const prevHook = window.__anazhGateNoFoundry;
                window.__anazhGateNoFoundry = true;
                r.equipHeld("klinge_langschwert");
                const hmOff = pm.userData && pm.userData.heldMesh;
                res.h.offIsPart = !!(
                    hmOff &&
                    hmOff.children &&
                    hmOff.children.length > 0 &&
                    !(hmOff.userData && hmOff.userData.foundryHeld)
                );
                r.equipHeld(null);
                if (prevHook) window.__anazhGateNoFoundry = prevHook;
                else delete window.__anazhGateNoFoundry;
            }
        } catch (e) {
            res.h.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check(
        "B: das LIVE-Buch traegt langschwert als kind:weapon (Worker-Draht lebt)",
        out.b.kind === "weapon",
        String(out.b.kind)
    );
    check("B: die Regler-Daten fliessen (langschwert.s.griff == 0.24)", out.b.griff === 0.24, String(out.b.griff));
    check("B: alle 21 Klingen-Gattungen im Buch", out.b.weaponCount === 21, String(out.b.weaponCount));
    check(
        "B: die Werkzeug-Marke reist (8 tool:true — Messer/Faellaxt/Spaltmaul/Vorschlaghammer/Beil/Spitzhacke/Spaten/Schaufel)",
        out.b.toolCount === 8,
        String(out.b.toolCount)
    );
    check(
        "B: die B4-Regler-Tabelle reist (paramsByKind.weapon == 18 Dials, W-A1-Generik)",
        out.b.paramsWeapon === 18,
        String(out.b.paramsWeapon)
    );
    check("B: kindStages.weapon == [0] (N7.5-Merge am Ingest)", out.b.ksWeapon === "[0]", String(out.b.ksWeapon));
    check("B: foundry-core-kinds UNANGETASTET (tree [0,1,2])", out.b.ksTree === "[0,1,2]", String(out.b.ksTree));
    check("B: vehicle-kindStages UNANGETASTET ([0])", out.b.ksVehicle === "[0]", String(out.b.ksVehicle));
    check("B: gate-kindStages UNANGETASTET ([0])", out.b.ksGate === "[0]", String(out.b.ksGate));
    check(
        "D: Auto-Blueprint klinge_langschwert registriert (Donor-Klon)",
        out.d.blueprint === true && out.d.parts >= 2,
        out.d.err || `parts=${out.d.parts}`
    );
    check("D: die Herkunfts-Marke sitzt (_foundryAutoSpecies == langschwert)", out.d.autoSpecies === "langschwert");
    check(
        "D: KEIN _grownSpecies (eine Klinge ist keine gewachsene Art)",
        out.d.grownSpecies === null,
        String(out.d.grownSpecies)
    );
    check("D: das Label reist aus dem Rezept (lab == Langschwert)", out.d.label === "Langschwert", String(out.d.label));
    check("D: builtIn == false (Policy-Zeile; User-Werk-Sicht wie Fahrzeug/Tor)", out.d.builtIn === false);
    check("D: der Donor geraet_schwert bleibt Built-in (unberuehrt)", out.d.donorIntact === true);
    check(
        "D: die Werkzeug-Klasse dockt mit (klinge_spitzhacke registriert — geraet_spitzhacke-Klasse gedeckt)",
        out.d.toolBlueprint === true
    );
    check(
        "D: die generische klinge_-Regel loest auf (klinge_langschwert -> langschwert)",
        out.d.presetResolves === "langschwert",
        String(out.d.presetResolves)
    );
    check(
        "D: der Entry-Pfad loest auf (_foundryPresetForEntry, klinge_spitzhacke -> spitzhacke)",
        out.d.entryResolves === "spitzhacke",
        String(out.d.entryResolves)
    );
    check(
        'P: die Place-Aufloesung liest die Rezept-DATEN (mode "hand")',
        out.p.mode === "hand",
        out.p.err || String(out.p.mode)
    );
    check(
        "P: hand streut NICHT (Dispatch null, N5.5 — Spawn/Befehl/Hand statt Worldgen)",
        out.p.dispatch === null,
        String(out.p.dispatch)
    );
    check("P: keine klinge_-Nische in der Wald-Liste", out.p.inExtras === false);
    check(
        "E: der Worker liefert das Klingen-Asset (Meshes > 0)",
        out.e.meshCount > 0,
        out.e.err || `meshes=${out.e.meshCount}`
    );
    console.log(`      ↳ end-to-end Mesh-Zahl langschwert: ${out.e.meshCount}`);
    check("E: die Material-Farbe reist mit (mat.color)", out.e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", out.e.groupChildren > 0, String(out.e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", out.e.allHaveColor === true);
    check(
        "F: die Distanz-Wahl 2 klemmt fuer kind:weapon auf Stufe 0 (fail-closed [0])",
        /\|0\|/.test(out.f.key || ""),
        out.f.err || String(out.f.key)
    );
    // ===== H: DIE HAND (W-A4b) — eigene Zaehlung =====
    check("H: Spieler-Mesh bereit (der Hand-Beweis hat einen Traeger)", out.h.playerReady === true, out.h.err);
    check(
        "H: INTERIM — der Equip zeigt SOFORT den Part-Bau (klinge_degen, jungfraeulicher Schluessel; die Hand ist nie leer)",
        out.h.interimVisible === true,
        out.h.err
    );
    check(
        "H: die Asset-Ankunft tauscht GENAU EINMAL auf die Studio-Gestalt (foundryHeld, ohne zweiten Equip)",
        out.h.degenStudio === true
    );
    check(
        "H: warm equipHeld(klinge_langschwert) -> der Held-Mesh traegt Studio-Wrapper (foundryHeld, preset langschwert)",
        out.h.studio === true && out.h.preset === "langschwert",
        String(out.h.preset)
    );
    check(
        "H: JEDES Wrapper-Kind teilt Geometrie+Material (sharedGeom/sharedMat — die EINE Wrapper-Quelle)",
        out.h.allShared === true && out.h.meshCount > 3,
        `meshes=${out.h.meshCount}`
    );
    console.log(`      ↳ Hand-Mesh-Zahl langschwert: ${out.h.meshCount}`);
    check(
        "H: auf Hand-Groesse skaliert (0 < scale <= maxScale) + am Arm-Anker geparentet",
        out.h.scaleOk === true && out.h.anchored === true,
        `scale=${out.h.scale}`
    );
    check(
        'H: Anker-Formel — handAxis "x" (KIND_POLICY-Daten), rotation.z == tilt.z + PI/2, gripX == fx.held.gripX (langschwert 0.12 == griff 0.24/2)',
        out.h.axis === "x" &&
            Math.abs((out.h.rotZ || 0) - Math.PI / 2) < 1e-3 &&
            Math.abs((out.h.gripX || 0) - 0.12) < 1e-6,
        `gripX=${out.h.gripX} rotZ=${out.h.rotZ}`
    );
    console.log(
        `      ↳ Skala/Anker langschwert: scale=${out.h.scale} gripX=${out.h.gripX} axis=${out.h.axis} bbox=${JSON.stringify(out.h.bboxLang)}`
    );
    check(
        "H: die Werkzeug-Klasse ankert ueber fx.held.gripX (klinge_spitzhacke gripX > 0, axis x — Vertrags-Daten aus stations(P))",
        out.h.spitzAxis === "x" && Number.isFinite(out.h.spitzGrip) && out.h.spitzGrip > 0,
        `gripX=${out.h.spitzGrip}`
    );
    console.log(`      ↳ Skala/Anker spitzhacke: gripX=${out.h.spitzGrip} bbox=${JSON.stringify(out.h.bboxSpitz)}`);
    check(
        "H: der Unequip zerstoert das GETEILTE Asset NICHT (kein sharedGeom in _queueDispose, Quell-Gruppe lebt, Ref zurueckgegeben)",
        out.h.unequipNoMesh === true &&
            out.h.sharedSurvives === true &&
            out.h.srcAlive === true &&
            out.h.refReturned === true,
        `refs=${out.h.liveRefs}`
    );
    check(
        "H: die Cache-Gruppe baut nach dem Unequip noch eine Werkstatt-Vorschau (ein Zug, viele Leser)",
        out.h.workshopAfter === true
    );
    check(
        "H: foundry-off (lokaler Hook, gesichert/wiederhergestellt) -> der Part-Pfad byte-alt",
        out.h.offIsPart === true
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER ε-BEWEIS STEHT: die Waffen-/Werkzeug-Domaene dockt NUR ueber die Checkliste §ε an (Manifest-Zeile + KIND_POLICY-Zeile + Donor-DATENBLOCK + fx.place-Daten), der Stamm traegt KEINEN neuen kind-Zweig — schmiede-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + B4-Regler + Asset), klinge_<id> entsteht am EINEN Chokepoint, hand reist als Daten ohne Streu (N5.5) — UND (W-A4b) die gehaltene Klinge traegt die STUDIO-GESTALT: Part-Interim -> Ankunfts-Tausch, sharedGeom-Wrapper, daten-getriebener Griff-Anker, Unequip laesst das geteilte Asset stehen, foundry-off bleibt Part byte-alt."
    );
    process.exit(0);
})().catch((e) => {
    console.error("ε-Schmiede-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
