// diag-trias.cjs — DIE TRIAS-LINSE: die Szenen-Dreiecke bleiben
// ueber die Wanderung GEDECKELT — platzierte Studio-Architektur (haus_ u. a.) lebt in
// der EINEN LOD-Geschichte statt fuer immer auf ihrer Bau-Stufe zu kleben.
//
// DER GEMESSENE BEFUND (Schoepfer „Trias steigen, ab ~1000k stockend, ~12000k Freeze"):
//   Fachwerk-Haus L0 ~88k / L1 ~75k / L2 ~2.8k Tris — und Haeuser gingen NIE durch
//   `_tickArchitectureLOD` (kein `_lodSpecies`) → nah gebaute Haeuser (L0/L1) blieben
//   im Cull-Radius (100-150 m) fuer immer schwer: 9 Haeuser nah gebaut = 434k Tris,
//   nach 120 m Zuruecktreten unveraendert 380k statt ehrlicher ~22k; ein durchlaufenes
//   16-Haus-Dorf konvergierte auf ~1.3M Tris und kam nie zurueck.
// DIE HEILUNG (an den Chokepoints, M8-treu — kein kind-Literal, kein Parallel-LOD):
//   (1) der Kalt-Stempel `entry._lodLevel` gilt JEDEM Foundry-Eintrag (Distanz-Autoritaet),
//   (2) `_tickArchitectureLOD` nimmt `instFoundry`-Eintraege in die EINE LOD-Geschichte,
//   (3) `_switchArchitectureLOD` serviert die neue Stufe aus der Foundry (kindStages-
//       Klammer bleibt die Stufen-Wahrheit) + Clamp-Kurzschluss via `_servedLod`
//       (Ein-Stufen-Arten re-allozieren nicht),
//   (4) W-A3.1: `cloneBlueprint` vererbt `studioGestalt` (donorOnly bewusst NICHT).
// TEILE:
//   N (Node, direkt): die fachwerk-Stufen-Wahrheit als Zahl (L2 ist die leichte Fernstufe).
//   S (statisch, kommentar-gestrippt): die Absenz donorOnly im Klon; Kalt-Stempel und Clamp-Kurzschluss misst Teil B.
//   B (Browser, foundry-ON, Null-Renderer): das Sticky-Experiment als Invariante —
//     nah bauen → 120 m zuruecktreten → ALLE instanzierten Haeuser tragen die Fernstufe
//     (Zahl: Haus-Tris ≤ Deckel) · Promotion beim Wieder-Annaehern · +500 m → alles
//     gecullt, Ghost-Slots 0, Band-Bilanz 0, Gruppen entsorgt (der DECKEL ueber Churn) ·
//     Klon-Erbe (studioGestalt reist, donorOnly nicht).
//   --selftest: injizierte Verletzungen machen die Gesetze rot (Linse nicht vakuoes).
//   node scripts/diag-trias.cjs [--selftest]
const { statikServer, ROOT: root, hauptLauf, nullSeite, pruefer, wandEnde, selbsttestEnde, studioKern } = require("./lib/welt-boot.cjs");
const crypto = require("crypto");
const stammLib = require("./lib/stamm.cjs");

const { errs, check } = pruefer();

// Der DECKEL (aus der Messung, mit Marge): 8-9 Haeuser auf der Fernstufe = ~28k Tris
// gemessen → Deckel 70k (×2.5 Marge). Die Fernstufe selbst: L2 ≤ 8k Tris je Haus.
const HAUS_FERN_DECKEL_TRIS = 70000;
const HAUS_L2_MAX_TRIS = 8000;

// ── AUSLÖSCHUNGS-WELLE — DIE SUBSTANZ-PARITAET (stehende Linse, Teil N4) ──
// Die Judge-Substanz der fuenf gefallenen Donor-Blueprints lebt EINGEFROREN in
// AnazhRealm.KIND_SUBSTANCE (je EINE Zeile `    <name>: {...json...},`). Die Muenzen
// (sha256 ueber JSON.stringify der geparsten Zeile) machen jede
// Drift der Substanz laut.
const KIND_SUBSTANCE_MINT = {
    geraet_schwert: "fbd9f91fa5f8e26c9dd99959ce99f0c8906cbe82662ee1f82035003529e4ff9b",
    geraet_spitzhacke: "f9465bb4d29ee17d0145c2fec6eebad0581f05c17c6c54af675fa19cb326c7f6",
    fahrzeug_wagen: "2850d66feda2a749e0df6d9726cfe23255afa205becbdfd893f7b95b31d5d3cd",
    tor_basis: "3192e75d2f5e82ab941f1b2356de608d45824819d704779750163797732ecfb3",
    haus_basis: "56b2a5e79068d1e21df40e1b77299e11b683f441d47c9bd427c9f7f69f6bc628",
};
// Die Substanz ist der WERT der geladenen Klasse (`stammLib.ladeKlasse`: Kerne wie index.html, dann der Stamm) — kein
// Zeilen-Parser am Stamm-Text (ERFINDER-WELLE: er griff nach einem Prettier-Lauf ins Leere); JSON.stringify des Objekts
// reproduziert die gemintete Kanonik (Key-Reihenfolge = Quelle, Zahlen exakt), sonst waere es ECHTE Drift.
const kindSubstanceRows = () => stammLib.ladeKlasse(root).AnazhRealm.KIND_SUBSTANCE || null;
// N4: je Muenze die Zeile steht (parts > 0) und ihr sha256 trifft — [name, ok, detail]
const n4 = (rows) =>
    Object.entries(KIND_SUBSTANCE_MINT).map(([name, mint]) => {
        const row = rows && rows[name];
        const okParts = !!row && Array.isArray(row.parts) && row.parts.length > 0;
        const hash = okParts ? kindSubstanceHash(row) : "fehlt";
        return [`N4: KIND_SUBSTANCE.${name} steht (parts > 0) + sha256 == Muenze`, okParts && hash === mint, hash === mint ? `parts=${row.parts.length}` : hash];
    });
function kindSubstanceHash(row) {
    return crypto.createHash("sha256").update(JSON.stringify(row)).digest("hex");
}

// ── Teil S: die Absenz über den EINEN Helfer (stammLib.fehlt) — die Präsenzen beweist Teil B am Verhalten ──
const triasStaticLaws = () => [
    ["T-S4: cloneBlueprint fasst donorOnly NICHT an", stammLib.fehlt("cloneBlueprint", /donorOnly/), stammLib.fehlt.wo],
];

hauptLauf(async () => {
    // ===== SELBST-TEST =====
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Trias-Linse feuert ===");
        // Die ZAHLEN-Linse ist nicht vakuoes: die Nahstufe L0 (gemessen ~93k) liegt allein
        // ueber dem Fern-Deckel — klebte sie fern, risse der Deckel (L1 ist seit V18.500 die
        // leichte Flaechen-Stufe ~20k; ein fern klebendes L1 faengt B4 am Stufen-Schluessel).
        const FCst = studioKern("fachwerk-core.js", "__fachwerkCore");
        const g0 = FCst.buildInstance("alemannisch", 7, 0);
        let t0 = 0;
        g0.traverse((o) => {
            if (o.isMesh && o.geometry)
                t0 += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
        });
        check(
            "Selbst-Test 4: EIN L0-Haus (~93k) risse den Fern-Deckel allein (Zahl nicht vakuoes)",
            t0 > HAUS_FERN_DECKEL_TRIS,
            `L0=${Math.round(t0)} tris`
        );
        // AUSLÖSCHUNGS-WELLE — N4 ist nicht vakuoes: eine gedriftete Substanz-Zeile verfehlt die Muenze, eine fehlende
        // faellt; T-S4 feuert an einem Klon, der donorOnly anfasst (der Vor-Stand ueber den EINEN Helfer).
        const rows = kindSubstanceRows();
        const n4Rot = (wandel) => n4(wandel(structuredClone(rows))).filter((l) => !l[1]).map((l) => l[0]);
        check("Selbst-Test 5-: die echten Zeilen treffen ihre Muenzen (der Vergleich ist nicht immer rot)", n4(rows).every((l) => l[1]));
        check(
            "Selbst-Test 5: eine gedriftete Substanz-Zeile verfehlt die Muenze (N4 feuert)",
            n4Rot((r) => ((r.geraet_schwert.label += "x"), r)).join() === "N4: KIND_SUBSTANCE.geraet_schwert steht (parts > 0) + sha256 == Muenze"
        );
        check(
            "Selbst-Test 5b: eine ENTFERNTE Substanz-Zeile faellt (N4 feuert)",
            n4Rot((r) => (delete r.tor_basis, r)).join() === "N4: KIND_SUBSTANCE.tor_basis steht (parts > 0) + sha256 == Muenze"
        );
        check(
            "Selbst-Test 6: ein Klon, der donorOnly anfasst, macht T-S4 rot beim Namen",
            !stammLib.fehlt("cloneBlueprint", /donorOnly/, (t) => stammLib.ersetze(t, "cloneBlueprint", "const source = ", "const donorOnly = 0, source = ")),
            stammLib.fehlt.wo
        );
        selbsttestEnde(errs);
        process.exit(0);
    }

    // ===== Teil N: die fachwerk-Stufen-Wahrheit als Zahl =====
    console.log("=== TEIL N: die Stufen-Wahrheit (fachwerk-core, Node-direkt) ===");
    const FC = studioKern("fachwerk-core.js", "__fachwerkCore");
    const trisOf = (g) => {
        let t = 0;
        g.traverse((o) => {
            if (o.isMesh && o.geometry)
                t += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
        });
        return Math.round(t);
    };
    const t0 = trisOf(FC.buildInstance("alemannisch", 7, 0));
    const t1 = trisOf(FC.buildInstance("alemannisch", 7, 1));
    const t2 = trisOf(FC.buildInstance("alemannisch", 7, 2));
    check(
        `N1: L2 ist die LEICHTE Fernstufe (≤ ${HAUS_L2_MAX_TRIS} Tris)`,
        t2 > 0 && t2 <= HAUS_L2_MAX_TRIS,
        `L2=${t2}`
    );
    check("N2: die Stufen sind REAL differenziert (L0 ≥ 5×L2)", t0 >= 5 * t2, `L0=${t0} L1=${t1} L2=${t2}`);
    check(
        "N3: kindStages.haus deklariert [0,1,2,3] (die Mehr-Stufen-Domaene; 3 = NUR-WURF, S3 haus — nie gezeigt, sie wirft)",
        JSON.stringify(
            FC.PORTAL_RENDER_CONFIG && FC.PORTAL_RENDER_CONFIG.lod && FC.PORTAL_RENDER_CONFIG.lod.kindStages
                ? FC.PORTAL_RENDER_CONFIG.lod.kindStages.haus
                : null
        ) === "[0,1,2,3]"
    );
    // AUSLÖSCHUNGS-WELLE — N4: die Substanz-Paritaet als stehende Linse (alle 5 KIND_SUBSTANCE-Zeilen der geladenen
    // Klasse existieren mit nicht-leeren parts, sha256 == Muenze).
    for (const [name, ok, detail] of n4(kindSubstanceRows())) check(name, ok, detail);

    // ===== Teil S =====
    console.log("\n=== TEIL S: die Absenz am Stamm ===");
    for (const [name, ok, wo] of triasStaticLaws()) check(name, ok, wo);

    // ===== Teil B: das Sticky-Experiment als Invariante (Browser) =====
    console.log("\n=== TEIL B: die LOD-Geschichte lebt (Browser, foundry-ON, Null-Renderer) ===");
    const PORT = Number(process.env.TRIAS_PORT || 4443);
    const server = statikServer();
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 480000, zusatz: ["--disable-setuid-sandbox"] });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async () => {
        const res = { errors: [] };
        const r = await window.__weltDa();
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.alemannisch);

        const pm = r.state.playerMesh;
        // Das Auge reist mit: jede Stufen-Frage misst vom Auge der Maske (`_lodAuge`, die Kamera) — wie die Ego-
        // Kamera des Spiels sitzt es über dem Spieler (ohne Spiel-Takt folgt die Kamera dem Teleport sonst nicht).
        const tp = (x, z) => {
            pm.position.set(x, r.getTerrainHeightAt(x, z) + 2, z);
            r.state.camera.position.set(x, pm.position.y + 1.6, z);
        };
        async function pumpRender(nTicks) {
            for (let i = 0; i < nTicks; i++) {
                r.state._frameOverBudget = false;
                try {
                    r.tickArchitectureCulling();
                    r._tickArchitectureLOD(8, r.state.playerMesh.position); // das Auge = der Proben-Ort
                } catch (e) {
                    res.errors.push("render: " + e.message);
                    break;
                }
                if (i % 4 === 3) await sleep(35);
            }
        }
        function hausStats() {
            const s = { lods: {}, tris: 0, instanced: 0, entries: 0, lodLevelFinite: 0 };
            for (const e of r.state.architectures) {
                if (!e || typeof e.type !== "string" || e.type.indexOf("haus_") !== 0) continue;
                s.entries++;
                if (Number.isFinite(e._lodLevel)) s.lodLevelFinite++;
                if (!e.instanced || !e.instSlots) continue;
                s.instanced++;
                const m = e.instSlots[0] && e.instSlots[0].key.match(/(^|#)f:[^|]+\|\d+\|(\d)[|:]/);
                const lod = m ? m[2] : "?";
                s.lods[lod] = (s.lods[lod] || 0) + 1;
                for (const { key } of e.instSlots) {
                    const g = r.state.archInstanceGroups.get(key);
                    if (g && g.geom)
                        s.tris += g.geom.index ? g.geom.index.count / 3 : g.geom.attributes.position.count / 3;
                }
            }
            s.tris = Math.round(s.tris);
            return s;
        }
        function ghostAndBand() {
            const o = { ghost: 0, band: 0, hausGroups: 0 };
            if (r.state.archInstanceGroups)
                for (const [key, g] of r.state.archInstanceGroups) {
                    if (!g || !g.geom) continue;
                    const tris = g.geom.index ? g.geom.index.count / 3 : g.geom.attributes.position.count / 3;
                    o.ghost += Math.max(0, (g.mesh ? g.mesh.count : 0) - (g.liveCount || 0)) * tris;
                    if (key.indexOf("haus_") === 0) o.hausGroups++;
                }
            for (const e of r.state.architectures) if (e && e.instSlotsBand) o.band++;
            o.ghost = Math.round(o.ghost);
            return o;
        }

        // (1) Dorf deliberat heben (die EINE Slot-Quelle; kein Auto-Hook noetig).
        // BÜHNE: Bau-Anker: das Dorf hebt am Anker — den Ort trägt das Platz-Gesetz des Stamms (_foundryRequestSettlement)
        const anchor = { x: 900, z: 900 };
        const plan = await Promise.race([
            r._foundryRequestSettlement({ seed: 7, nH: 6 }),
            new Promise((rs) => setTimeout(() => rs(null), 90000)),
        ]);
        if (!plan || !plan.slots) return Object.assign(res, { fatal: "kein Settlement-Export" });
        tp(anchor.x, anchor.z);
        res.placed = (await r._spawnSettlementFromExport(await r._ortWahl(plan, anchor), anchor)).placed;
        // DER KALT-STEMPEL (vor dem ersten Tick): jeder kalte Foundry-Eintrag im Radius trägt seine Distanz-Stufe von Geburt an
        const kalt = r.state.architectures.filter(
            (e) => e && typeof e.type === "string" && e.type.indexOf("haus_") === 0 && !e.instanced && !e.mesh &&
                Math.hypot(e.position.x - pm.position.x, e.position.z - pm.position.z) <= r.state.architectureCullingRadius
        );
        res.kaltStempel = kalt.length > 0 && kalt.every((e) => Number.isFinite(e._lodLevel) && e._lodLevel === r._foundryLodForEntry(e));

        // (2) An die 3 naechsten Haeuser herantreten -> sie bauen NAH (schwere Stufe).
        const haeuser = r.state.architectures.filter(
            (e) => e && typeof e.type === "string" && e.type.indexOf("haus_") === 0
        );
        const near3 = haeuser
            .slice()
            .sort(
                (a, b) =>
                    Math.hypot(a.position.x - anchor.x, a.position.z - anchor.z) -
                    Math.hypot(b.position.x - anchor.x, b.position.z - anchor.z)
            )
            .slice(0, 3);
        for (const h of near3) {
            tp(h.position.x + 6, h.position.z);
            await window.__gebautNach(h, { fertig: () => h.instanced, bau: () => {}, takt: () => pumpRender(8) });
        }
        res.nearBuilt = hausStats();
        res.nearHeavy = near3.every((h) => h.instanced); // die 3 stehen (Voraussetzung)
        // KONSUM (Clamp-Kurzschluss): dieselbe servierte Stufe re-alloziert nicht (der Spion an _archInstanceRemove bleibt
        // stumm, die Distanz-Autorität stempelt); eine andere Stufe ruft ihn (Selbsttest der Probe), danach zurück.
        const hK = near3.find((e) => e.instanced && Number.isFinite(e._servedLod));
        if (hK) {
            const rm0 = r._archInstanceRemove, sK = hK._servedLod;
            let nRm = 0;
            r._archInstanceRemove = (...a) => (nRm++, rm0.apply(r, a));
            try {
                r._switchArchitectureLOD(hK, sK);
                res.clamp = { gleich: nRm, stempel: hK._lodLevel === sK };
                nRm = 0;
                r._switchArchitectureLOD(hK, sK === 0 ? 1 : 0);
                res.clamp.anders = nRm;
                r._switchArchitectureLOD(hK, sK);
            } finally {
                delete r._archInstanceRemove;
            }
        }

        // (2b) FLAECHEN-STUFE: im L1-RING stempelt die Distanz-Autoritaet 1 und
        // die Foundry SERVIERT die echte Stufe 1 (das Studio liefert sie, kein Host-Mapping).
        // Ring visH-echt via _chooseLODForDistance gescannt, Konvergenz gepumpt.
        const h0b = near3[0];
        const visH0 = r._lodTreeVisHeight(h0b);
        let dRing = -1;
        for (let d = 10; d < 400; d += 2) {
            if (r._chooseLODForDistance(d, 0, visH0) === 1) {
                dRing = d + 6;
                break;
            }
        }
        res.l1RingDist = dRing;
        if (dRing > 0) {
            tp(h0b.position.x + dRing, h0b.position.z);
            for (const weiter = window.__deckel("die Stufe L1 am Haus", 3000); weiter(); ) {
                await pumpRender(24);
                if (h0b._lodLevel === 1 && h0b._servedLod === 1) break;
            }
            res.l1Level = h0b._lodLevel;
            res.l1Served = h0b._servedLod;
            // der platzierte Bau keyt nach Studio-Geometrie (`f:…` am Anfang), die Streu `typ#f:…`.
            const mS = h0b.instanced && h0b.instSlots[0] && h0b.instSlots[0].key.match(/(^|#)f:[^|]+\|\d+\|(\d)[|:]/);
            res.l1Slot = mS ? Number(mS[2]) : null;
        }

        // (3) 120 m zuruecktreten (IM Cull-Radius) -> die EINE LOD-Geschichte demotet.
        // KONVERGENZ-PUMPE: die Hysterese-Leiter (0 -> 1 -> 2) braucht je Stufe einen
        // Switch UND die Ziel-Stufe muss ggf. erst im Worker backen (L1 einer frischen
        // Kultur|Variante = Sekunden) -> pumpen bis konvergiert, Deadline 150 s.
        tp(anchor.x + 120, anchor.z);
        for (const weiter = window.__deckel("die Häuser in L2", 5000); weiter(); ) {
            await pumpRender(24);
            const s = hausStats();
            if (s.instanced >= 3 && Object.keys(s.lods).every((k) => k === "2")) break;
        }
        res.after120m = hausStats();
        const distsNow = haeuser.map((h) =>
            Math.round(Math.hypot(h.position.x - (anchor.x + 120), h.position.z - anchor.z))
        );
        res.minDistAt120 = Math.min.apply(null, distsNow);

        // (4) Promotion: wieder an das naechste Haus heran -> nahe Stufe (≤1) kehrt zurueck.
        const h0 = near3[0];
        tp(h0.position.x + 6, h0.position.z);
        await pumpRender(120);
        const m0 = h0.instanced && h0.instSlots[0] && h0.instSlots[0].key.match(/(^|#)f:[^|]+\|\d+\|(\d)[|:]/);
        res.promotedLod = m0 ? Number(m0[2]) : null;

        // (5) +500 m -> alles gecullt: der DECKEL ueber Churn.
        tp(anchor.x + 500, anchor.z + 500);
        await pumpRender(120);
        res.afterLeave = hausStats();
        res.leaveBalance = ghostAndBand();

        // (6) W-A3.1 — das Klon-Erbe am EINEN Chokepoint.
        const cloneName = "trias_probe_klon";
        const cloneName2 = "trias_probe_klon2";
        delete r.state.blueprints[cloneName];
        delete r.state.blueprints[cloneName2];
        const ok1 = r.cloneBlueprint("welt_portal", cloneName);
        const c1 = r.state.blueprints[cloneName];
        res.kloneGestalt = !!(ok1 && c1 && c1.studioGestalt === (r.state.blueprints.welt_portal || {}).studioGestalt);
        // AUSLÖSCHUNGS-WELLE: der Alt-Donor tor_basis ist gefallen — die Klon-
        // Sichtbarkeits-Regel wird an einem SYNTHETISCHEN donorOnly-Blueprint bewiesen
        // (registrieren → klonen → aufraeumen; kein vakuoeses skip mehr).
        delete r.state.blueprints._t_donor;
        r.state.blueprints._t_donor = {
            name: "_t_donor",
            donorOnly: true,
            parts: [{ shape: "box", material: "stein", position: { x: 0, y: 0.5, z: 0 }, size: { x: 1, y: 1, z: 1 } }],
        };
        const ok2 = r.cloneBlueprint("_t_donor", cloneName2);
        const c2 = r.state.blueprints[cloneName2];
        res.kloneSichtbar = !!(ok2 && c2 && c2.donorOnly !== true && r.state.blueprints._t_donor.donorOnly === true);
        delete r.state.blueprints._t_donor;
        delete r.state.blueprints[cloneName];
        delete r.state.blueprints[cloneName2];
        // ERFINDER-WELLE — DIE KLON-IDENTITAET eines Auto-Blueprints (der Schoepfer-Befund
        // „ich klone einen reiterbogen, und er wird zum alten schwert"): jeder Auto-
        // Blueprint traegt seine Rezept-Identitaet als DATEN (`studioGestalt`), der Klon
        // erbt sie, und der EINE Resolver loest den Klon aufs REZEPT — nie auf die
        // Donor-Substanz. Gemessen an einem echten klinge_-Auto-Blueprint des LIVE-Buchs.
        const autoBp = Object.keys(r.state.blueprints).find(
            (n) => r.state.blueprints[n] && r.state.blueprints[n]._foundryAutoSpecies && /^klinge_/.test(n)
        );
        res.autoBpName = autoBp || null;
        if (autoBp) {
            const recId = r.state.blueprints[autoBp]._foundryAutoSpecies;
            res.autoGestaltStamp = r.state.blueprints[autoBp].studioGestalt === recId;
            const cloneName3 = "trias_probe_bogen_klon";
            delete r.state.blueprints[cloneName3];
            const ok3 = r.cloneBlueprint(autoBp, cloneName3);
            const resolved = ok3 ? r._foundryPresetForEntry({ type: cloneName3 }) : null;
            res.kloneRezept = !!(ok3 && resolved === recId);
            delete r.state.blueprints[cloneName3];
        } else {
            res.autoGestaltStamp = false;
            res.kloneRezept = false;
        }

        // (7) ABSCHIEDS-WELLE (E) — DER GEWICHTS-DECKEL des fCache: die warme Bibliothek
        // MESSEN (die Budget-Begruendungs-Zahl: 189-255 MB Arbeits-Menge gemessen ->
        // Budget 512 MB = ~2x Kopfraum, KEIN Arbeits-Mengen-Churn [der Crossfade-Sweep
        // fing ein zu enges Budget]), dann synthetisch beweisen (Scratch-Swap, Sicherung
        // + Wiederherstellung — die Gate-Hook-Disziplin): 80 x 8-MB-Eintraege mit lebender Senke deckeln am
        // BYTE-Budget (512/8 = 64, weit vor dem Eintrags-Deckel), 80 untaetige am RUHE-Deckel (64/8 = 8, profiband K5);
        // Deckel + 44 leichte deckeln an der Entries-Zweitwand (FOUNDRY_CACHE_CAP, seit V18.527 512).
        const f2 = r._ensureAssetFoundry();
        res.warmCacheMB = Math.round(((f2.cacheBytes || 0) / 1048576) * 10) / 10;
        res.warmCacheSize = f2.cache.size;
        const savedC = { cache: f2.cache, bytes: f2.cacheBytes, req: f2.requested, lru: f2.lruEvicted };
        const BYTES = r.constructor.FOUNDRY_CACHE_BYTES;
        const mkFake = (mb, lebt) => ({
            _liveRefs: lebt ? 1 : 0,
            children: [
                {
                    geometry: {
                        attributes: {
                            position: { array: new Float32Array(Math.max(1, Math.round((mb * 1048576) / 4))) },
                        },
                    },
                },
            ],
        });
        f2.cache = new Map();
        f2.cacheBytes = 0;
        f2.requested = new Set();
        f2.lruEvicted = new Set();
        for (let i = 0; i < 80; i++) r._foundryCacheSet("gewicht8|" + i, mkFake(8, true));
        res.heavySize = f2.cache.size;
        res.heavyBytesOk = f2.cacheBytes <= BYTES;
        f2.cache = new Map();
        f2.cacheBytes = 0;
        for (let i = 0; i < 80; i++) r._foundryCacheSet("ruhe8|" + i, mkFake(8));
        res.ruheSize = f2.cache.size;
        res.ruheSoll = r.constructor.FOUNDRY_RUHE_BYTES / (8 << 20);
        f2.cache = new Map();
        f2.cacheBytes = 0;
        f2.requested = new Set();
        // der Deckel trägt einen ganzen Boot (FOUNDRY_CACHE_CAP, 512) — die Zweitwand wird mit Deckel + 44
        // leichten Einträgen bewiesen, gelesen aus der EINEN Konstante.
        res.cap = r.constructor.FOUNDRY_CACHE_CAP;
        for (let i = 0; i < res.cap + 44; i++) r._foundryCacheSet("leicht|" + i, mkFake(0.001));
        res.lightSize = f2.cache.size;
        f2.cache = savedC.cache;
        f2.cacheBytes = savedC.bytes;
        f2.requested = savedC.req;
        f2.lruEvicted = savedC.lru;
        return res;
    });

    await browser.close();
    server.close();

    if (out.fatal) {
        check("B: Aufbau", false, out.fatal);
    } else {
        check("B1: das Dorf steht (deliberate Slot-Quelle)", out.placed >= 4, `placed=${out.placed}`);
        check(
            "B2: nah gebaut = die schweren Stufen leben (≥1 Haus L0/L1, alle 3 instanziert)",
            out.nearHeavy === true && (out.nearBuilt.lods["0"] || 0) + (out.nearBuilt.lods["1"] || 0) >= 1,
            JSON.stringify(out.nearBuilt && out.nearBuilt.lods)
        );
        check(
            "B3: JEDES Haus traegt die Distanz-Autoritaet (_lodLevel finit — die LOD-Geschichte kennt es)",
            out.after120m && out.after120m.lodLevelFinite === out.after120m.entries,
            out.after120m ? `${out.after120m.lodLevelFinite}/${out.after120m.entries}` : ""
        );
        check(
            "B4: 120 m zurueck -> ALLE instanzierten Haeuser tragen die FERNSTUFE (2) — nichts klebt",
            out.after120m &&
                out.after120m.instanced >= 3 &&
                Object.keys(out.after120m.lods).every((k) => k === "2") &&
                out.minDistAt120 > 43,
            `lods=${JSON.stringify(out.after120m && out.after120m.lods)} minDist=${out.minDistAt120}`
        );
        check(
            `B5: der TRIAS-DECKEL haelt (Haus-Tris ≤ ${HAUS_FERN_DECKEL_TRIS} auf der Fernstufe; vor der Heilung: 380k)`,
            out.after120m && out.after120m.tris > 0 && out.after120m.tris <= HAUS_FERN_DECKEL_TRIS,
            `tris=${out.after120m && out.after120m.tris}`
        );
        check(
            "B6: PROMOTION lebt (wieder nah -> Stufe ≤ 1 kehrt zurueck)",
            Number.isFinite(out.promotedLod) && out.promotedLod <= 1,
            `lod=${out.promotedLod}`
        );
        check("B-KALT: jeder kalte Foundry-Eintrag im Radius trägt seine Distanz-Stufe vor dem ersten Tick", out.kaltStempel === true);
        const c = out.clamp || {};
        check(
            "B-CLAMP: dieselbe servierte Stufe re-alloziert nicht (Konsum: kein _archInstanceRemove), eine andere ruft ihn (Selbsttest)",
            c.gleich === 0 && c.stempel === true && c.anders > 0,
            JSON.stringify(c)
        );
        check(
            "B7: +500 m -> das Dorf ist GECULLT (0 instanziert, 0 Haus-Gruppen — der Deckel ueber Churn)",
            out.afterLeave && out.afterLeave.instanced === 0 && out.leaveBalance.hausGroups === 0,
            JSON.stringify(out.leaveBalance)
        );
        check(
            "B8: die SLOT-BILANZ ist ausgeglichen (Ghost-Tris 0, keine Band-Reste)",
            out.leaveBalance && out.leaveBalance.ghost === 0 && out.leaveBalance.band === 0
        );
        check("B9: W-A3.1 — der Klon erbt die studioGestalt (welt_portal -> geisttor)", out.kloneGestalt === true);
        check(
            "B9b: ERFINDER — jeder Auto-Blueprint traegt studioGestalt=Rezept (Daten-Identitaet statt Name)",
            out.autoGestaltStamp === true,
            `bp=${out.autoBpName}`
        );
        check(
            "B9c: ERFINDER — der Klon eines Auto-Blueprints loest aufs REZEPT (nie Donor-Substanz)",
            out.kloneRezept === true,
            `bp=${out.autoBpName}`
        );
        check(
            "B10: donorOnly reist NICHT mit (der Klon eines synthetischen donorOnly-Blueprints ist sichtbar — nie skip)",
            out.kloneSichtbar === true,
            String(out.kloneSichtbar)
        );
        check(
            "B11 (Flaechen-Stufe): im L1-Ring stempelt die Distanz-Autoritaet 1 und die Foundry SERVIERT Stufe 1 (Slot-Key-Beweis)",
            out.l1Level === 1 && out.l1Served === 1 && out.l1Slot === 1,
            `ring=${out.l1RingDist}m level=${out.l1Level} served=${out.l1Served} slot=${out.l1Slot}`
        );
        check(
            `B12 (E/Gewicht): 80x8-MB-Eintraege deckeln am BYTE-Budget (64 = 512MB/8MB, weit vor CAP ${out.cap}), untaetige am RUHE-Deckel (${out.ruheSoll})`,
            out.heavySize === 64 && out.heavyBytesOk === true && out.ruheSoll >= 1 && out.ruheSize === out.ruheSoll,
            `size=${out.heavySize} ruhe=${out.ruheSize} warmeBibliothek=${out.warmCacheMB}MB/${out.warmCacheSize} Eintraege`
        );
        check(
            `B13 (E/Zweitwand): ${out.cap + 44} leichte Eintraege deckeln an der Entries-Wand (${out.cap})`,
            Number.isInteger(out.cap) && out.cap > 64 && out.lightSize === out.cap
        );
        if (out.errors && out.errors.length) check("B: keine Tick-Fehler", false, out.errors[0]);
    }

    wandEnde(errs, "DIE TRIAS BLEIBT GEDECKELT: platzierte Studio-Architektur lebt in der EINEN LOD-Geschichte (Fernstufe fern, Promotion nah, Cull + Slot-Bilanz sauber ueber Churn) und der Klon erbt die Studio-Gestalt.");
});
