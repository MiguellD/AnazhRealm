// diag-nervensystem-vehicle.cjs — DER ZWEIT-KERN-BEWEIS (Studio-Vertrag Phase 1, W7b).
// Die Schwester zu diag-nervensystem.cjs fuer die ERSTE Nicht-Pflanzen-Domaene: beweist, dass
// ein kind:"vehicle"-Preset im Zweit-Kern (vehicle-core.js, __vehicleCore — v1.1 N7.2) OHNE
// eine Zeile AnazhRealm-Edit durch die EINE Pipeline fliesst:
//   A (statisch, Node — Absenzen): der Stamm nennt die Zusatz-Felder nie selbst und ruft kerneVereinen genau
//     einmal (kein zweiter Ingest-Pfad); die Bruecke kennt kein self.__vehicleCore-Literal; der Auto-Register-
//     Chokepoint kennt kein kind-if (M8). Den manifest-getriebenen Boot und Stempel beweist gate:fluss (W4/W5)
//     am echten Faden. --selftest injiziert einen zweiten Ingest-Pfad und beweist: die Linse feuert.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die Fahrzeug-Presets (der
//     Draht lebt end-to-end durch den echten Worker); kindStages.vehicle == [0] gemerged,
//     die foundry-core-kinds UNANGETASTET (kein Overwrite).
//   C (Merge-Semantik, direkt): ein Probe-Kern, der einen foundry-core-kind ueberschreiben
//     WILL, verliert (first-wins); ein disjunkter kind kommt an. Restore danach.
//   D (Auto-Blueprint): fahrzeug_gt entsteht am EINEN Register-Chokepoint (Donor-Substanz
//     KIND_SUBSTANCE.fahrzeug_wagen — der Alt-Blueprint ist PHYSISCH gefallen, AUSLÖSCHUNGS-
//     WELLE; KEIN _grownSpecies), die generische fahrzeug_-Regel loest ihn auf;
//     ein injiziertes Probe-Preset registriert sich idempotent.
//   E (das Asset selbst): _foundryRequest("gt",7,0) liefert echte Meshes mit mat.color,
//     _foundryBuildGroup baut die Gruppe mit color-Attribut-Fill.
//   F (Fail-Closed behavioral): die Distanz-Wahl lod=2 wird fuer kind:vehicle auf Stufe 0
//     geklemmt (kindStages-Merge) UND fuer einen unbekannten kind ohne jeden Eintrag ebenso
//     (N7.5 [0]) — gemessen an den requested-Keys.
//   node scripts/diag-nervensystem-vehicle.cjs [--selftest]
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const kernStufen = require("./lib/kern-stufen.cjs");

const PORT = Number(process.env.NERV_PORT || 4407);
const root = path.resolve(__dirname, "..");
const server = statikServer();

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
// Kommentare strippen (die V18.267-Falle: erklaerende Kommentare zitieren die Muster woertlich).
const stripComments = stammLib.ohneKommentare;
// Der Methoden-Body per Klammer-Zaehlung (das diag-pipeline-constitution-Muster).
// der EINE Rumpf-Schneider (scripts/lib/stamm.cjs): der Block an der Definition, nie am ersten Text-Treffer
function fnBody(src, kopf) {
    return stammLib.rumpf(src, kopf);
}
function countOcc(src, needle) {
    let n = 0,
        i = 0;
    for (;;) {
        i = src.indexOf(needle, i);
        if (i < 0) return n;
        n++;
        i += needle.length;
    }
}

// ===== TEIL A: die statischen Absenzen (die Präsenzen beweist der lebende Draht B-F) =====
function staticLaws(anazhSrc, phytoSrc) {
    const anazhNC = stripComments(anazhSrc);
    const phytoNC = stripComments(phytoSrc);
    const out = [];
    // A3 — Chokepoint-Gesetz (N7.5, W8 erweitert): der Stamm nennt keines der Zusatz-Felder selbst und ruft kerneVereinen
    // genau einmal (ein zweiter Ingest-Pfad wird rot); dass der Chokepoint das Gesetz ruft, beweist Teil C per Spion.
    const zusatz = ["zusatzKindStages", "zusatzBudget"];
    const imStamm = zusatz.reduce((s, z) => s + countOcc(anazhNC, z), 0);
    const rufe = countOcc(anazhNC, "kerneVereinen(");
    out.push([
        "A3: kein zweiter Ingest-Pfad für den Zweit-Kern-Merge (Zusatz-Felder im Stamm 0, kerneVereinen genau ein Ruf)",
        rufe === 1 && imStamm === 0,
        `Zusatz-Felder im Stamm=${imStamm} · kerneVereinen-Rufe=${rufe}`,
    ]);
    // A5: die Brücke greift auf keinen Kern per ns-Literal zu (Kommentare gestrippt).
    out.push(["A5: die Bruecke kennt kein self.__vehicleCore-Literal", !/self\.__vehicleCore/.test(phytoNC)]);
    // A10 (M8): im Auto-Register-Chokepoint steht kein kind-String-Vergleich.
    const autoReg = fnBody(anazhNC, /_foundryAutoRegisterSpecies\([^)]*\)\s*\{/);
    out.push(["A10: der Auto-Register-Chokepoint kennt kein kind-if (M8)", autoReg !== null && !/kind\s*[!=]==?\s*"/.test(autoReg)]);
    return out;
}

(async () => {
    const anazhSrc = stammLib.text(root);
    const phytoSrc = fs.readFileSync(path.join(root, "foundry-bruecke.js"), "utf8"); // die Brücke (K42)

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V2: ein ZWEITER Ingest-Pfad (zusatzKindStages-Leser ausserhalb des Chokepoints) -> A3 rot.
        const broken2 = stammLib.ersetze(anazhSrc, "_foundryRequestSettlement",
            /(_foundryRequestSettlement\([^)]*\) \{)/,
            "$1\n        const _leak = this.state && this.state.zusatzKindStages;\n        void _leak;"
        );
        const a3 = staticLaws(broken2, phytoSrc).find((l) => l[0].startsWith("A3"));
        check("Selbst-Test 2: zweiter Ingest-Pfad injiziert -> A3 feuert", a3 && a3[1] === false);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN — die Linse feuert auf den zweiten Ingest-Pfad.");
        process.exit(0);
    }

    console.log("=== ZWEIT-KERN — TEIL A: die statischen Absenzen (Node) ===");
    for (const [name, ok, detail] of staticLaws(anazhSrc, phytoSrc)) check(name, ok, detail);

    console.log("\n=== TEIL B-F: der lebende Draht (Browser, foundry-ON) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "webgl", frist: 180000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { b: {}, c: {}, d: {}, e: {}, f: {} };
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
            if (f && f.ready && f.recipes && f.recipes.gt && rc && rc.lod && rc.lod.kindStages) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        const rc = A._studioRenderConfig;
        const ks = rc && rc.lod ? rc.lod.kindStages : null;
        // ===== B: das Buch + der Merge KOMMEN AN =====
        res.b.gtKind = f && f.recipes && f.recipes.gt ? f.recipes.gt.kind : null;
        res.b.gtRadstand = f && f.recipes && f.recipes.gt && f.recipes.gt.s ? f.recipes.gt.s.radstand : null;
        res.b.vehicleCount =
            f && f.recipes
                ? Object.keys(f.recipes).filter((k) => f.recipes[k] && f.recipes[k].kind === "vehicle").length
                : 0;
        res.b.ksVehicle = ks ? JSON.stringify(ks.vehicle) : null;
        res.b.ks = ks ? JSON.parse(JSON.stringify(ks)) : null;
        // ===== C: die MERGE-SEMANTIK direkt (first-wins + disjunkt), mit Restore =====
        try {
            const orig = A._studioRenderConfig;
            const origState = r.state.studioRenderConfig;
            // KONSUM: der Chokepoint mergt über das Gesetz (phyto-core kerneVereinen), nie über einen Inline-Zwilling.
            const PC = window.__phytoCore, kv = PC.kerneVereinen;
            res.c.gesetz = 0;
            PC.kerneVereinen = (...a) => (res.c.gesetz++, kv.apply(PC, a));
            r._foundryIngestRenderConfig({
                lod: {
                    kindStages: { tree: [7, 8] },
                    zusatzKindStages: { "probe-core": { tree: [9], tor: [1] } },
                },
            });
            PC.kerneVereinen = kv;
            const pks = A._studioRenderConfig.lod.kindStages;
            res.c.treeKept = JSON.stringify(pks.tree); // erwartet [7,8] — der Erst-Kern fuehrt
            res.c.torMerged = JSON.stringify(pks.tor); // erwartet [1] — disjunkt kommt an
            A._studioRenderConfig = orig;
            r.state.studioRenderConfig = origState;
        } catch (e) {
            res.c.err = (e && e.message) || String(e);
        }
        // ===== D: der AUTO-BLUEPRINT =====
        try {
            const bp = r.state.blueprints && r.state.blueprints.fahrzeug_gt;
            res.d.blueprint = !!bp;
            res.d.autoSpecies = bp ? bp._foundryAutoSpecies : null;
            res.d.grownSpecies = bp ? bp._grownSpecies || null : "kein-bp";
            res.d.parts = bp && Array.isArray(bp.parts) ? bp.parts.length : 0;
            // AUSLÖSCHUNGS-WELLE — die neue Donor-Wahrheit: der Alt-Name ist ABWESEND,
            // die Substanz lebt in KIND_SUBSTANCE, der Klon traegt byte-gleiche Parts.
            const KS = A.KIND_SUBSTANCE || {};
            res.d.donorAbsent = !(r.state.blueprints && r.state.blueprints.fahrzeug_wagen);
            res.d.substanzParts =
                KS.fahrzeug_wagen && Array.isArray(KS.fahrzeug_wagen.parts) ? KS.fahrzeug_wagen.parts.length : 0;
            res.d.clonePartsMatch =
                !!bp && !!KS.fahrzeug_wagen && JSON.stringify(bp.parts) === JSON.stringify(KS.fahrzeug_wagen.parts);
            res.d.cloneConnMatch =
                !!bp &&
                !!KS.fahrzeug_wagen &&
                JSON.stringify(bp.connections || null) === JSON.stringify(KS.fahrzeug_wagen.connections || null);
            res.d.presetResolves = r._foundryPresetFor("fahrzeug_gt");
            res.d.entryResolves = r._foundryPresetForEntry({ type: "fahrzeug_gt" });
            // Idempotenz + Probe-Preset (Injektion == der Schoepfer legt ein Preset im Kern an):
            if (f && f.recipes) {
                f.recipes.probemobil = { kind: "vehicle", lab: "Probemobil", s: {}, fx: {} };
                const n1 = r._foundryAutoRegisterSpecies(f.recipes);
                const n2 = r._foundryAutoRegisterSpecies(f.recipes);
                res.d.probeRegistered = !!(r.state.blueprints && r.state.blueprints.fahrzeug_probemobil);
                res.d.probeLabel =
                    r.state.blueprints && r.state.blueprints.fahrzeug_probemobil
                        ? r.state.blueprints.fahrzeug_probemobil.label
                        : null;
                res.d.idempotent = n1 >= 1 && n2 === 0;
                // Aufraeumen (Gate-Hook-Lehre: sichern + wiederherstellen, nie Muell hinterlassen):
                delete f.recipes.probemobil;
                delete r.state.blueprints.fahrzeug_probemobil;
            }
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }
        // ===== E: das ASSET selbst (Worker-Dispatch + mat.color + BuildGroup) =====
        try {
            const meshes = await Promise.race([
                r._foundryRequest("gt", 7, 0),
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
        // ===== F: FAIL-CLOSED behavioral — die Distanz-Wahl 2 fordert NIE Stufe-2-
        // Geometrie (V18.477 FAHRZEUG-FERNSTUFE: fern = Impostor-Politik [KIND_POLICY.
        // vehicle impostor:true, gate:fahrzeug-fern haelt die Route]; ein Wirts-L1-
        // GRADE-Request bleibt erlaubt — "L1/L2 gradet der Wirt", vehicle-core B2).
        // Die Probe wanderte mit dem Gesetz (16.07.): vorher klemmte [0] hart. =====
        try {
            if (!f.requested) f.requested = new Set();
            const before = new Set(f.requested);
            r._foundryFlattenFor({ seed: 7 }, "gt", 2);
            const fresh = Array.from(f.requested).filter((k) => !before.has(k));
            res.f.gtKey = fresh.find((k) => k.startsWith("gt|")) || null;
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        // Unbekannter kind OHNE jeden kindStages-/Budget-Eintrag (N7.5-[0]): die Stufen-Klammer klemmt fail-closed
        // auf [0]; den Wurf trägt kein Wirts-Literal mehr (W8-Integration: `_WIRT_WURF` fiel) — der Flatten bricht
        // laut (KERN-PFLICHT phyto:lod.budget.tor), bevor eine Anfrage an den Worker geht.
        try {
            const before = new Set(f.requested);
            f.recipes.probetor = { kind: "tor", s: {}, fx: {} };
            res.f.torStufe = r._foundryServierStufe("probetor", 2);
            try {
                r._foundryFlattenFor({ seed: 1 }, "probetor", 2);
            } catch (e) {
                res.f.torBruch = (e && e.message) || String(e);
            }
            const fresh = Array.from(f.requested).filter((k) => !before.has(k));
            res.f.torKeys = fresh.filter((k) => k.startsWith("probetor|")).length;
            // Aufraeumen: Probe-Rezept + Probe-Requests entfernen (kein Muell im lebenden f).
            delete f.recipes.probetor;
            for (const k of fresh) if (k.startsWith("probetor|")) f.requested.delete(k);
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        return res;
    });
    // Die Erwartung der Stufen: die Kerne in der Seite (dieselben Dateien wie der Worker), nie eine Abschrift (K64).
    const kern = await page.evaluate(kernStufen.seitenStufen, kernStufen.kernRaeume());

    await browser.close();
    server.close();

    check(
        "B: das LIVE-Buch traegt gt als kind:vehicle (Worker-Draht lebt)",
        out.b.gtKind === "vehicle",
        String(out.b.gtKind)
    );
    check("B: die Regler-Daten fliessen (gt.s.radstand == 2.9)", out.b.gtRadstand === 2.9, String(out.b.gtRadstand));
    check("B: alle 5 Fahrzeug-Gattungen im Buch", out.b.vehicleCount === 5, String(out.b.vehicleCount));
    check("B: kindStages.vehicle == [0,1] (N7.5-Merge am Ingest)", out.b.ksVehicle === "[0,1]", String(out.b.ksVehicle));
    const abweichung = kernStufen.stufenAbweichung(out.b.ks, kern);
    check(
        "B: der Ingest-Merge traegt die Stufen-Liste JEDES Kerns (kein Kern ueberschreibt einen anderen)",
        abweichung.length === 0,
        abweichung.join(" · ") || `${Object.keys(kern).length} Arten`
    );
    check(
        "C: first-wins — ein Zweit-Kern ueberschreibt NIE (tree bleibt [7,8])",
        out.c.treeKept === "[7,8]",
        out.c.err || String(out.c.treeKept)
    );
    check("C: disjunkter kind kommt an (tor == [1])", out.c.torMerged === "[1]", String(out.c.torMerged));
    check("C: der Chokepoint mergt über das Gesetz kerneVereinen (Konsum)", out.c.gesetz === 1, String(out.c.gesetz));
    check(
        "D: Auto-Blueprint fahrzeug_gt registriert (Donor-Klon)",
        out.d.blueprint === true && out.d.parts >= 4,
        out.d.err || `parts=${out.d.parts}`
    );
    check("D: die Herkunfts-Marke sitzt (_foundryAutoSpecies == gt)", out.d.autoSpecies === "gt");
    check(
        "D: KEIN _grownSpecies (ein Fahrzeug ist keine gewachsene Art)",
        out.d.grownSpecies === null,
        String(out.d.grownSpecies)
    );
    check(
        "D: der Alt-Donor fahrzeug_wagen ist ABWESEND (state.blueprints) — die Substanz lebt in KIND_SUBSTANCE (17 Parts)",
        out.d.donorAbsent === true && out.d.substanzParts === 17,
        `substanzParts=${out.d.substanzParts}`
    );
    check(
        "D: der Auto-Klon traegt die Substanz byte-gleich (fahrzeug_gt parts+connections == KIND_SUBSTANCE.fahrzeug_wagen)",
        out.d.clonePartsMatch === true && out.d.cloneConnMatch === true
    );
    check(
        "D: die generische fahrzeug_-Regel loest auf (fahrzeug_gt -> gt)",
        out.d.presetResolves === "gt",
        String(out.d.presetResolves)
    );
    check(
        "D: der Entry-Pfad loest auf (_foundryPresetForEntry)",
        out.d.entryResolves === "gt",
        String(out.d.entryResolves)
    );
    check("D: Probe-Preset registriert + idempotent", out.d.probeRegistered === true && out.d.idempotent === true);
    check("D: das Label reist aus dem Rezept (lab)", out.d.probeLabel === "Probemobil", String(out.d.probeLabel));
    check(
        "E: der Worker liefert das Fahrzeug-Asset (Meshes > 0)",
        out.e.meshCount > 0,
        out.e.err || `meshes=${out.e.meshCount}`
    );
    check("E: die Material-Farbe reist mit (mat.color)", out.e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", out.e.groupChildren > 0, String(out.e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", out.e.allHaveColor === true);
    check(
        "F: die Distanz-Wahl 2 fordert fuer kind:vehicle NIE Stufe-2-Geometrie (fern = Impostor-Politik)",
        // Körper-Schlüssel preset|gestalt|stufe[|ov] (V18.527); die Anfrage MUSS entstehen (sonst prüfte F nichts)
        !!out.f.gtKey && !/^[^|]*\|[^|]*\|2(\||$)/.test(out.f.gtKey),
        out.f.err || String(out.f.gtKey)
    );
    check(
        "F: unbekannter kind OHNE Eintrag klemmt fail-closed auf [0] und bricht ohne Budget laut (kein Wirts-Wurf)",
        out.f.torStufe === 0 && /KERN-PFLICHT[\s\S]*phyto:lod\.budget\.tor/.test(out.f.torBruch || ""),
        `Stufe ${out.f.torStufe} · ${out.f.torBruch || "kein Bruch"} · Anfragen ${out.f.torKeys}`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER ZWEIT-KERN DOCKT AN: vehicle-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + Asset), der N7.5-Merge lebt am EINEN Ingest-Chokepoint (first-wins, disjunkt, fail-closed [0]), der Auto-Blueprint fahrzeug_<id> entsteht ohne eine Zeile AnazhRealm-Edit — EINE Pipeline fuer alle Domaenen (Vertrag Phase 1)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Zweit-Kern-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
