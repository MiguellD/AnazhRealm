"use strict";
// scripts/playtest/studio.cjs — der Richter von Studio (spec/stamm/modul-karte.json): Foundry-Brücke · Bücher · Aufträge · Uhren · Vorrat · Foundry-Gestalt · Gruppen · Bibliothek · Bereitschaft.
// 7 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const path = require("path");
const { safeEvaluate } = require("../playtest.cjs");
const SKRIPTE = path.join(__dirname, "..");

async function checkBandLambda4Streu({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const arten = r._nahStreuArten() || [];
        const G = {};
        for (const a of arten) G[a.id] = r._foundryGestalten(a.id);
        return [
            arten.length > 0 &&
                arten.every((a) => Number.isInteger(G[a.id]) && G[a.id] >= 1) &&
                ["farn", "schilf", "blume"].every((id) => G[id] === 2),
            JSON.stringify(G),
        ];
    });
    check(
        "Λ.4 Streu (Waldboden): jede Art trägt ihre Studio-Gestalten, die Massen-Arten (Farn · Schilf · Blume) zwei",
        ...res
    );
}

// 1310-18 — EIN GRAPH JE SIGNATUR (der Schlüssel geprüft): r184 schlüsselt ein Programm nach der IDENTITÄT seiner Knoten
// (`customCacheKey` = Knoten-id). Stoffe gleicher Signatur und verschiedener Werte (Regler, Leucht-Maß, Wind der Art, Gestalt
// und Realm-Fenster des Tors) tragen DENSELBEN Programm-Schlüssel und ihre Werte als Stoff-Wert; verschiedene Signaturen
// verschiedene. Lauf-Kontrolle: zwei frisch und gleich gebaute Graphen tragen zwei Schlüssel — ohne den geteilten Graphen
// baute jeder Stoff sein eigenes Programm (1310-17: 43 Foundry-Stoffe, 43 Bauten; 5 Membranen, 5 Bauten).
async function checkBandStoffSignatur({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const T = window.THREE;
        const TSL = T.TSL;
        const k = (m) => m.customProgramCacheKey();
        const out = {};
        const a = r._foundryTreeMaterial("unknown", { roughness: 0.41, metalness: 0.1 });
        const b = r._foundryTreeMaterial("unknown", {
            roughness: 0.77,
            metalness: 0.3,
            emissive: [0.2, 0.1, 0],
            emissiveIntensity: 2,
        });
        const l1 = r._foundryTreeMaterial("unknown", { roughness: 0.5, leucht: 2 });
        const l2 = r._foundryTreeMaterial("unknown", { roughness: 0.5, leucht: 3.5 });
        const w1 = r._foundryTreeMaterial("bark", null, false, { ht: 9.5, delta: 0.021, an: 1 });
        const w2 = r._foundryTreeMaterial("bark", null, false, { ht: 14.25, delta: 0.034, an: 1 });
        out[
            "1310-18 Schlüssel: Foundry-Stoffe gleicher Signatur, verschiedener Regler tragen EINEN Programm-Schlüssel"
        ] = a !== b && k(a) === k(b);
        out["1310-18 Schlüssel: das Leucht-Maß ist ein Stoff-Wert (zwei Maße, EIN Programm-Schlüssel)"] =
            l1 !== l2 &&
            k(l1) === k(l2) &&
            l1.userData.stoffWerte.leucht === 2 &&
            l2.userData.stoffWerte.leucht === 3.5;
        out["1310-18 Schlüssel: der Wind der Art ist ein Stoff-Wert (zwei Arten, EIN Programm-Schlüssel)"] =
            w1 !== w2 &&
            k(w1) === k(w2) &&
            (!w1.positionNode || (w1.userData.windArt.x === 9.5 && w2.userData.windArt.x === 14.25));
        out["1310-18 Schlüssel: verschiedene Signaturen tragen verschiedene Programm-Schlüssel"] =
            k(a) !== k(l1) && k(a) !== k(w1);
        const pc = globalThis.__portaCore;
        const tor = (n) => {
            const p = pc.gateParams(pc.PRESETS[n]);
            return { gestalt: n, p, mu: pc.membranUniforms(p), gesetz: pc.MEMBRAN_GESETZ };
        };
        const ma = r._membranMaterialFor(tor("drachentor"));
        const mb = r._membranMaterialFor(tor("kathedrale"));
        const sa = ma.mat.userData.tor;
        const sb = mb.mat.userData.tor;
        out[
            "1310-18 Schlüssel: zwei Tore verschiedener Gestalt (Bogen, Palette) tragen EINE Membran (D8: der Nebel fiel)"
        ] =
            !sa.a.equals(sb.a) &&
            !sa.pd.equals(sb.pd) &&
            k(ma.mat) === k(mb.mat) &&
            typeof ma.u.time.value === "number" &&
            ma.u !== mb.u;
        const bau = () => {
            const m = new T.MeshStandardNodeMaterial();
            m.colorNode = TSL.vec4(TSL.attribute("color", "vec3").mul(0.5), 1.0);
            return m;
        };
        out[
            "1310-18 Lauf-Kontrolle: zwei frisch und gleich gebaute Graphen tragen zwei Schlüssel (r184 schlüsselt nach Identität)"
        ] = k(bau()) !== k(bau());
        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Co-Schöpfer spricht Studio: ein Satz an die KI (oder ohne Schlüssel in den Chat) wird über
// DIESELBEN Tabellen wie die Werkstatt zu Studio-Bauplänen — geerdet, nie im Wasser. Beweist
// Auflöser · Op · Satz-Parser · near_water · Prompt (den KI-Pfad mit echten Antworten trägt der Korpus, diag-v1-pfad --korpus).
// (checkBandV18331ReplayDeterminism unten: gleicher Start + gleiche Input-Folge ⇒ bit-identisch;
// sonst Math.random/Zeit/Float-Drift im Schritt-Pfad.)
async function checkBandV18493CoSchoepferStudio({ page, check }) {
    // je Prüfung ein Satz der Seite (`out[satz] = urteil`, mit Detail `[urteil, detail]`)
    const res = await page.evaluate(async () => {
        const out = {};
        const archs = r.state.architectures;
        const vorherAll = archs.length;
        let err;
        try {
            const wort = (w) => r._studioBlueprintForWord(w);
            const eiche = wort("eiche");
            const eichen = wort("Eichen");
            const fels = wort("fels");
            const unbekannt = wort("quasselstrippe");
            out[
                "Co-Schöpfer: der Wort-Auflöser liest die lebenden Tabellen (eiche/Eichen → baum_eiche, fels → Bauplan, Unsinn → null)"
            ] = [
                eiche === "baum_eiche" && eichen === "baum_eiche" && !!fels && unbekannt === null,
                `eiche=${eiche} eichen=${eichen} fels=${fels} unbekannt=${unbekannt}`,
            ];
            const f = r._foundry;
            const treeIds =
                f && f.recipes
                    ? Object.keys(f.recipes).filter((k) => f.recipes[k] && f.recipes[k].kind === "tree")
                    : [];
            out[`Co-Schöpfer: JEDE Baum-Art des Rezeptbuchs ist ein sagbares Wort (${treeIds.length} Arten)`] =
                treeIds.every((id) => !!wort(id)) && treeIds.length > 0;
            // Ein sicher trockener Fleck nahe dem Spieler (der Test soll nie am Zufall des Sees hängen) — 50 m vor der
            // Genesis-Mitte: ihre Lichtung ist ein Grundriss der Natur-Wand, dort wächst keine Eiche, deren Krone über die
            // Scheibe reicht (Integration Welle L, Entscheid D3; die Eiche reicht mit Hain-Streuung bis ~36 m).
            const p = r.state.playerMesh.position;
            const gM = r._genesisMitte();
            let spot = null;
            for (let i = 0; i < 64 && !spot; i++) {
                const a = i * 0.618 * Math.PI * 2,
                    d = 20 + (i % 8) * 8;
                const x = p.x + Math.cos(a) * d,
                    z = p.z + Math.sin(a) * d;
                if (Math.hypot(x - gM.x, z - gM.z) >= 50 && r._landAt(x, z, 2)) spot = { x, z };
            }
            const vorher = archs.length;
            const res1 = r.dslRun(["spawn_studio", "eiche", ["at", spot.x, p.y, spot.z], 5, 4242], { source: "test" });
            const neu = archs.slice(vorher);
            const alleEiche = neu.length > 0 && neu.every((e) => e.type === "baum_eiche");
            const alleTrocken = neu.every((e) => r._landAt(e.position.x, e.position.z, 0.2));
            const alleGeerdet = neu.every((e) => {
                const sy = r._voxelSurfaceY(e.position.x, e.position.z);
                return Number.isFinite(sy) && Math.abs(e.position.y - (sy + 0.5)) < 0.6;
            });
            out["Co-Schöpfer: spawn_studio pflanzt 5 Eichen — geerdet (Oberfläche+0.5), trocken, am EINEN Chokepoint"] =
                [
                    neu.length === 5 && alleEiche && alleTrocken && alleGeerdet && res1.ok,
                    `neu=${neu.length} eiche=${alleEiche} trocken=${alleTrocken} geerdet=${alleGeerdet}`,
                ];
            const v2 = archs.length;
            const res2 = r.dslRun(["spawn_studio", "quasselstrippe", ["at_player"], 3], { source: "test" });
            out["Co-Schöpfer: ein unbekanntes Wort pflanzt NICHTS und sagt es im Log"] =
                archs.length === v2 && res2.log.some((l) => l.event === "unknown_studio_word");
            const parsed = r.parseChatToDsl("pflanz mir einen eichenhain am wasser");
            const satz = parsed
                ? JSON.stringify([parsed.program[0], parsed.program[1], parsed.program[2][0], parsed.program[3]])
                : null;
            out[
                "Co-Schöpfer: der Satz OHNE KI („pflanz mir einen eichenhain am wasser“) wird spawn_studio eichen · near_water · 6"
            ] = [satz === JSON.stringify(["spawn_studio", "eichen", "near_water", 6]), String(satz)];
            const alt = r.parseChatToDsl("pflanze baum hier");
            out["Co-Schöpfer: die spezifischere alte Geste bleibt („pflanze baum hier“ → spawn_tree)"] =
                !!alt && alt.program[0] === "spawn_tree";
            // near_water liefert einen trockenen Ufer-Ort am Wasser — oder, ohne Wasser im Umkreis, KEINEN
            // (die Engstelle `dslEvalPos` wirft benannt), nie still den Spieler-Ort. Ob es Wasser gibt, sagt ein EIGENES
            // 4-m-Raster über den Kreis (nicht die Such-Funktion des Spiels); der Rand-Gürtel 150–166 m gilt beides.
            let nassNah = false,
                nassFern = false;
            const nassPunkte = [];
            for (let dz = -166; dz <= 166; dz += 4)
                for (let dx = -166; dx <= 166; dx += 4) {
                    const d = Math.hypot(dx, dz);
                    if (d > 166 || r._landAt(p.x + dx, p.z + dz, 0.2)) continue;
                    nassFern = true;
                    if (d <= 150) nassNah = true;
                    nassPunkte.push([p.x + dx, p.z + dz]);
                }
            let nw = null,
                nwFehler = null;
            const nwCtx = r.dslCtx({ source: "test" });
            try {
                nw = r.dslEvalPos(["near_water", 160], nwCtx);
            } catch (e) {
                nwFehler = e && e.dslKeinOrt ? e.dslKeinOrt.grund : String(e);
            }
            const amWasser =
                !!nw &&
                Number.isFinite(nw.x) &&
                Number.isFinite(nw.z) &&
                Math.hypot(nw.x - p.x, nw.z - p.z) > 0.5 &&
                nassPunkte.some(([x, z]) => Math.hypot(x - nw.x, z - nw.z) <= 8);
            const benannt = nwFehler === "kein Wasser im Umkreis von 160 m";
            out[
                "Co-Schöpfer: near_water liefert einen Ufer-Ort am Wasser (eigenes 4-m-Raster) — ohne Wasser im Umkreis KEINEN, benannt (nie still den Spieler-Ort)"
            ] = [
                (nassNah ? amWasser : !nassFern ? benannt : amWasser || benannt) === true &&
                    (nw ? r._landAt(nw.x, nw.z, 0.3) : benannt) === true,
                JSON.stringify({ nassNah, nassFern, nw, nwFehler }),
            ];
            // jedes Verb mit Form: gate:weltakt-wache (K)
            out[
                "Co-Schöpfer: das KI-Prompt lehrt die lebenden Wörter (spawn_studio wie jedes Verb: gate:weltakt-wache K); Regeln dürfen es nicht"
            ] =
                /Bäume: /.test(r.llmBuildSystemPrompt()) &&
                r.constructor.RULE_FORBIDDEN_EFFECT_OPS.has("spawn_studio") === true;
            // Die Anthropic-Anfrage folgt der aktuellen Generation: 5er-Modelle mit effort +
            // fallbacks + Beta-Header, Haiku 4.5 schlicht (es kennt beides nicht).
            const an = r.llmProviderDefs().anthropic;
            const bOpus = an.buildBody("claude-opus-5-5", "s", "u");
            const hOpus = an.buildHeaders("k", { model: "claude-opus-5-5" });
            const bHaiku = an.buildBody("claude-haiku-4-5", "s", "u");
            const hHaiku = an.buildHeaders("k", { model: "claude-haiku-4-5" });
            out[
                "Co-Schöpfer: die Claude-Anfrage spricht die aktuelle Generation (5er: effort low + fallbacks; Haiku schlicht)"
            ] = !!(
                an.models.some((m) => m.id === "claude-opus-5-5") &&
                bOpus.output_config &&
                bOpus.output_config.effort === "low" &&
                bOpus.fallbacks === "default" &&
                hOpus["anthropic-beta"] === "server-side-fallback-2026-07-01" &&
                !bHaiku.output_config &&
                !bHaiku.fallbacks &&
                !hHaiku["anthropic-beta"]
            );
        } catch (e) {
            err = (e && e.message) || String(e);
        }
        // Aufräumen: die Test-Pflanzung verlässt die Welt wieder (die Folge-Bänder sehen den alten Stand).
        for (const e of archs.slice(vorherAll).reverse()) {
            try {
                r.removeArchitecture(e);
            } catch {}
        }
        out["Co-Schöpfer: Band lief ohne Fehler"] = [!err, err];
        out["Co-Schöpfer: die Test-Pflanzung ist wieder aufgeräumt"] = archs.length === vorherAll;
        return out;
    });
    for (const s in res) check(s, ...[res[s]].flat());
}

// DER DICHTE WALD der Foundry-Bänder (in der Seite, `(${probe})(${waldWarm})` — die Probe ruft ihn): 25 Chunks um den
// Spieler, die Foundry bereit, dann `n` Takte des Streu-Streamings (je `ms` Schlaf); er gibt die Foundry zurück
async function waldWarm(n, ms) {
    await window.__weltDa();
    await window.__gebautNach("25 Chunks um den Spieler", {
        fertig: () => (r.state.voxelChunks ? r.state.voxelChunks.size : 0) >= 25,
        takt: async () => {
            try {
                r._gameLoopTick(performance.now());
            } catch {}
            await sleep(6);
        },
        max: 2000,
    });
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => !f || f.ready);
    for (let it = 0; it < n; it++) {
        r.state._frameOverBudget = false;
        try {
            r._gameLoopTick(performance.now());
            r._tickScatterStreaming(r.state.playerMesh.position);
        } catch {}
        await sleep(ms);
    }
    return f;
}

// V4(B) Foundry-Geometrie-Speicher flach über 4 LRU-Churn-Zyklen (Deckel 32) — eingefaltet aus gate:foundry-memory (D3b, die Welt des Läufers statt eines eigenen Boots): V4(B)-GATE — DER FOUNDRY-GEOMETRIE-SPEICHER IST FLACH (Null-Renderer, foundry-ON, JS-Bilanz-Zähler):
async function checkBandFoundrySpeicherFlach({ page, check }) {
    const probe = async (wald) => {
        // dichten Wald streamen.
        const f = await wald(300, 6);
        // REF-GUARD-Instrument: bei JEDEM _disposeFoundryGroupGeom die _liveRefs prüfen.
        let maxRefsAtDispose = 0;
        const orig = r._disposeFoundryGroupGeom.bind(r);
        r._disposeFoundryGroupGeom = function (g) {
            const refs = (g && g._liveRefs) || 0;
            if (refs > maxRefsAtDispose) maxRefsAtDispose = refs;
            return orig(g);
        };
        const snap = () => ({ built: f._geomBuiltCount || 0, disposed: f._geomDisposedCount || 0 });
        // DER CHURN: Cache-Deckel auf 32 (die Welt hält gerade weit mehr) und je Zyklus alle 16 Gestalten von sechs
        // '*'-Arten flach anfordern (96 Schlüssel, Stufe 0) — die LRU muss räumen, jeder Zyklus baut die geräumten neu.
        const CAP0 = r.constructor.FOUNDRY_CACHE_CAP;
        r.constructor.FOUNDRY_CACHE_CAP = 32;
        // Der Anstoß: der Vorrat hat alle Gestalten schon warm (kein Neubau, keine Räumung) — EINE Räumung über die EINE
        // Naht, dann baut die erste Ankunft neu und der Deckel räumt die LRU auf 32 (der Churn läuft ab Zyklus 1).
        r._foundryCacheEvict(r._foundryKoerperKey("findling", 1, 0));
        const arten = ["findling", "basalt", "sediment", "zacken", "kristalle", "blume"];
        const cycles = [];
        for (let c = 0; c < 4; c++) {
            for (const sp of arten) {
                const V = r._foundryGestalten(sp);
                const getroffen = new Set();
                for (let s = 0; getroffen.size < V && s < 4000; s++) {
                    const g = r._foundryVariantFor(s, sp);
                    if (getroffen.has(g)) continue;
                    getroffen.add(g);
                    r._foundryFlattenFor({ seed: s, position: { x: 0, y: 0, z: 0 } }, sp, 0);
                }
            }
            for (let it = 0; it < 400; it++) {
                r.state._frameOverBudget = false;
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
                if (f.pending.size === 0 && !(f.warte && f.warte.length) && it > 30) break;
                await sleep(6);
            }
            cycles.push(snap());
        }
        r.constructor.FOUNDRY_CACHE_CAP = CAP0;
        // das Urteil in der Seite: die Brüche beim Namen (leer = flach)
        const fails = [];
        const live = cycles.map((c) => c.built - c.disposed);
        const growth = live[3] - live[1]; // Zyklus 4 vs Zyklus 2
        if (cycles[3].disposed <= 0)
            fails.push(
                "kein Dispose gefeuert (der LRU räumt nicht / Cap nicht überschritten — die Geom wird nie frei)"
            );
        if (maxRefsAtDispose > 0)
            fails.push(
                `Dispose mit _liveRefs=${maxRefsAtDispose} > 0 (USE-AFTER-FREE-Risiko: eine noch gehaltene Geometrie wurde freigegeben)`
            );
        // "flach": das live-Wachstum Zyklus2->4 muss deutlich unter dem built-Zuwachs bleiben (sub-linear).
        const builtGrowth = cycles[3].built - cycles[1].built;
        if (builtGrowth > 0 && growth > builtGrowth * 0.5)
            fails.push(`live wuchs ${growth} bei ${builtGrowth} neuen Bakes (>50% = quasi-linear = das Leck lebt)`);
        if (growth > 32 * 8) fails.push(`live-Wachstum ${growth} > ${32 * 8} (unbounded)`);
        return fails;
    };
    const fails = (await safeEvaluate(page, `(${probe})(${waldWarm})`)) || ["keine Antwort der Seite: null"];
    check(
        "V4(B) Foundry-Geometrie-Speicher flach über 4 LRU-Churn-Zyklen (Deckel 32): dispose feuert, kein Use-after-free, live sub-linear",
        fails.length === 0,
        fails.join(" · ")
    );
}

// V1 das Kristall-Kleid — eingefaltet aus gate:v1-resolve: `_foundryPresetForEntry` löst die Formations-VARIANTEN
// (kristall_var${N}/fels_var${N}) auf ein Studio-Rezept auf; die Ausstattung (glutbrunnen · marktstand_dorf ·
// brunnen_dorf · laterne_dorf) löst über ihre studioGestalt-Zeile auf das Gesetzbuch der Architektur; das Glut-Genom
// ist gefallen, sein Umzug trägt alte Welten auf glutbrunnen; ein Tor-Wort ohne tor_-Klon fällt nie auf das
// welt_-Portal derselben Gestalt; V2 der Werkstatt-Rezept-Regler erkennt die Repräsentanten.
async function checkBandKristallKleid({ page, check }) {
    const out = await safeEvaluate(page, async () => {
        // die Ausstattung löst über das LIVE-Buch auf (studioGestalt): warten, bis das Gesetzbuch der Architektur da ist
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => !!(f && f.ready && f.recipes && f.recipes.feuerstelle));
        const bp = r.state.blueprints || {};
        const res = {};
        // je Eintrag sein Studio-Rezept; das Glut-Genom ist gefallen (glut_var0 lebt nicht mehr)
        for (const t of [
            "kristall_var0",
            "kristall_var7",
            "fels_var0",
            "fels_var5",
            "fels_var7",
            "glutbrunnen",
            "marktstand_dorf",
            "brunnen_dorf",
            "laterne_dorf",
            "kristall_geode",
            "felsturm",
            "stein_block",
        ])
            res[t] = r._foundryPresetForEntry({ type: t });
        res._glutLebt = !!bp.glut_var0;
        res._umzug = r.constructor.BAUPLAN_UMZUG ? r.constructor.BAUPLAN_UMZUG.glut_var3 : null;
        const wort = (w) => r._studioBlueprintForWord(w);
        res._wort = [wort("feuerstelle"), wort("marktstand"), wort("brunnen"), wort("laterne")].join("/");
        const portal = Object.keys(bp).find(
            (n) => bp[n] && bp[n].role === "portal" && typeof bp[n].studioGestalt === "string"
        );
        if (portal) {
            const g = bp[portal].studioGestalt;
            const klon = bp["tor_" + g];
            delete bp["tor_" + g];
            try {
                res._torWort = { gestalt: g, portal, ziel: wort(g) };
            } finally {
                if (klon) bp["tor_" + g] = klon;
            }
        }
        res._kind = [r._workshopRecipeKind(bp["fels_var0"]), r._workshopRecipeKind(bp["kristall_var0"])].join("/");
        return res;
    });
    const o = out || {};
    const soll = {
        kristall_var0: "kristalle",
        kristall_var7: "kristalle",
        glutbrunnen: "feuerstelle",
        marktstand_dorf: "marktstand",
        brunnen_dorf: "brunnen",
        laterne_dorf: "laterne",
        kristall_geode: "kristalle",
        felsturm: "zacken",
        stein_block: "basalt",
    };
    const fails = Object.entries(soll)
        .filter(([t, w]) => o[t] !== w)
        .map(([t, w]) => `${t} → ${o[t]} (erwartet ${w})`);
    for (const t of ["fels_var0", "fels_var5", "fels_var7"])
        if (!o[t] || o[t] === "null") fails.push(`${t} → ${o[t]} (erwartet ein Fels-Rezept)`);
    if (o._glutLebt !== false) fails.push("glut_var0 lebt (das Glut-Genom ist gefallen)");
    if (o._umzug !== "glutbrunnen") fails.push(`Umzug glut_var3 → ${o._umzug}`);
    check(
        "V1 Kristall-Kleid: jede Fels/Kristall-Variante trägt ihr Studio-Rezept, die Ausstattung ihr Gesetzbuch, das Glut-Genom zieht auf glutbrunnen",
        fails.length === 0,
        fails.join(" · ")
    );
    const t = o._torWort;
    check(
        "V1 Wort: feuerstelle/marktstand/brunnen/laterne lösen auf die Ausstattung, ein Tor-Wort ohne tor_-Klon nie auf das welt_-Portal",
        o._wort === "glutbrunnen/marktstand_dorf/brunnen_dorf/laterne_dorf" &&
            !!t &&
            t.ziel !== t.portal &&
            !/^welt_/.test(String(t.ziel)),
        `${o._wort} · ${t ? `${t.gestalt} → ${t.ziel}` : "kein Portal mit Gestalt"}`
    );
    check(
        "V2 Werkstatt: der Rezept-Regler erkennt die Repräsentanten (fels_var0 rock, kristall_var0 crystal)",
        o._kind === "rock/crystal",
        o._kind
    );
}

// V3 kein zweiter Baum-Bäcker — eingefaltet aus gate:no-second-treebuilder: die P4-Invariante — bei lebender Foundry rendert
// KEIN Baum die Grammatik-Geometrie (der „83 batched-174k-Bäume"-Nachbau ist weg); der Scatter trägt Bäume UND Fels/Kiesel als
// Studio-Asset (fscatter:*, die Karten in der EINEN Atlas-Gruppe), die Grammatik erscheint nur für wirklich ungemappte Arten.
async function checkBandKeinZweiterBaumbaecker({ page, check }) {
    const probe = async (wald) => {
        // Kräftig ticken → der Scatter streamt Regionen um den Spieler; Studio-Assets kommen an.
        const f = await wald(350, 10);
        const o = { foundryReady: !!(f && f.ready) };
        // Instanz-Gruppen enumerieren: Schlüssel = Bauplan-Name#leaf[@region].
        const groups = [];
        const eat = (map) => {
            if (!map) return;
            for (const [k, g] of map) {
                let c = 0;
                if (g && g.mesh && Number.isFinite(g.mesh.count)) c = g.mesh.count;
                else if (g && Number.isFinite(g.count)) c = g.count;
                groups.push({ key: String(k), count: c });
            }
        };
        eat(r.state.archInstanceGroups);
        // Klassifizieren: die FOUNDRY-Herkunft lebt im LEAF-Key (nach `#`): `f:`/`fimp:` = Foundry-Geometrie/
        // -Impostor (auch für die PLATZIERTE Architektur, deren Gruppen-NAME die Art `baum_tanne` trägt, aber
        // deren Leaf `f:tanne|…` ist). `fscatter:` im Namen = Foundry-Scatter. Ein GRAMMATIK-Baum hat einen
        // Baum-Namen UND einen nicht-foundry Leaf (numerischer Index / `grown_…`-Grammatik-Bauplan).
        // ein Schlüssel ohne Typ (platzierter Bau nach Studio-Geometrie) ist selbst das Leaf.
        const leafOf = (k) => {
            const i = k.indexOf("#");
            if (i >= 0) return k.slice(i + 1);
            return /^(f:|fimp:)/.test(k) ? k : "";
        };
        const isFoundry = (k) => k.startsWith("fscatter:") || /^(f:|fimp:)/.test(leafOf(k));
        const isTreeName = (k) => /(^|[#@:_])baum_[a-z]+/.test(k) || /grown_baum_/.test(k);
        const foundryScatterKeys = groups
            .filter((x) => x.key.startsWith("fscatter:") && x.count > 0)
            .map((x) => x.key.split("#")[0]);
        o.grammarTreeGroups = groups
            .filter((x) => !isFoundry(x.key) && isTreeName(x.key) && x.count > 0)
            .map((x) => ({ key: x.key, count: x.count }));
        // Foundry-Scatter-Presets (Art-Sicht): eiche/fichte… (Baum) + findling/basalt/geroell… (Fels) + kristalle.
        const presets = new Set();
        for (const k of foundryScatterKeys) {
            const m = k.match(/^fscatter:([a-z]+)/);
            if (m) presets.add(m[1]);
        }
        // W6: die Karten (L2) zeichnen in der EINEN Atlas-Gruppe — die Art eines lebenden Slots nennt seine Schicht.
        const ag = r.state.archInstanceGroups && r.state.archInstanceGroups.get(r.constructor.IMPOSTOR_ATLAS_GRUPPE);
        const ak = ag && ag.mesh && ag.mesh.geometry.attributes.aKarte; // (Schicht, Halbbreite, Höhe, verdeckt)
        if (ak && r._kartenAtlas) {
            const artVon = new Map();
            for (const z of r._kartenAtlas.zellen.values()) artVon.set(z.idx, z.preset);
            // Die Gruppe ist dicht (`_archGroupFree` verdichtet): jeder Slot in [0, count) lebt.
            for (let s = 0; s < ag.mesh.count; s++)
                if (artVon.has(ak.array[s * 4])) presets.add(artVon.get(ak.array[s * 4]));
        }
        o.foundryPresets = Array.from(presets).sort();
        return o;
    };
    const out = (await safeEvaluate(page, `(${probe})(${waldWarm})`)) || { grammarTreeGroups: [], foundryPresets: [] };
    const baeume = out.foundryPresets.filter((p) =>
        ["eiche", "fichte", "tanne", "birke", "weide", "mammut"].includes(p)
    );
    check(
        "V3 kein zweiter Baum-Bäcker: bei lebender Foundry 0 Grammatik-Baum-Gruppen, der Scatter trägt das Studio-Kleid (mindestens ein Studio-Baum)",
        out.foundryReady === true && out.grammarTreeGroups.length === 0 && baeume.length > 0,
        `ready ${out.foundryReady} · Grammatik ${out.grammarTreeGroups.map((g) => `${g.key} (${g.count})`).join(", ") || "0"} · Presets ${out.foundryPresets.join("/")}`
    );
}

// Der Leistungs-Vertrag — eingefaltet aus gate:leistungs-vertrag (D3b, Profi-Doktrin Welle 5): die erkämpften Leistungs-
// Invarianten stehen als VERTRAG. V1 Stand-Churn null (Welt gesettelt, Spieler steht → 0 Gruppen-Mints) · V2 der Ingest-Takt (echte
// Request-Ergebnisse resolven nie synchron, ≤ 3 je Frame in Ankunfts-Reihenfolge, über Budget 1, headless sofort) · V3 die Gruppen
// klettern im Stand nicht · V4 der Trace trägt bundleDeckung + ingestTakt + gruppenChurn · V5 das Szene-Live-Set < 700 MB;
// Selbsttest: ein absichtlicher Mint+Dispose im Fenster bewegt die Churn-Zähler.
async function checkBandLeistungsVertrag({ page, check }) {
    const { EINSCHWING_INSTALL } = require(path.join(SKRIPTE, "lib", "band-urteil.cjs"));
    await safeEvaluate(page, EINSCHWING_INSTALL); // die EINE Liste dessen, was die Welt noch baut (band-urteil `einschwingOffen`)
    const out = (await safeEvaluate(page, async () => {
        const o = { err: null };
        try {
            await window.__weltDa();
            // ein Takt des Loops (ein Wurf im Takt hält die Probe nicht an)
            const takt = () => {
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
            };
            // Kurzes Boot-Settle, dann PRODUKTIONS-TREUES Regime: headless streamt
            // mit Radius=MAX endlos Welt (Boot-Mints ≠ Churn) — das Stand-Fenster
            // misst darum im GELÜFTETEN Regler-Regime (das regler-sim-Muster:
            // _isHeadlessNull ab, GPU-Anwender gestubbt, Über-Budget-Folds fahren
            // den Radius auf den Boden 70 m → die kleine Welt wird schnell FERTIG).
            for (let i = 0; i < 200; i++) {
                takt();
                if (i % 15 === 0) await sleep(15);
            }
            // DIE WARTENDEN REGIONEN: eine Streu-Region mit einem Baum-Platz, dessen Karte fehlt, bleibt
            // `_deferredFoundry`, und JEDE Foundry-Lieferung baut sie ganz neu (`_tickScatterStreaming` Refill) — im Spiel
            // nur im Boot (echte GPU, Mess-Wiese, Erst-Boot: 14 Lieferungs-Anstöße, 11 Region-Neubauten in 149 s, danach 0
            // wartende Regionen und 0 Mints in 60 s Stand). Das Boot-Settle läuft headless, bis keine Region mehr wartet —
            // das Stand-Fenster misst Churn, nicht den Boot.
            {
                // ... und bis der Vorrat durch ist (`_foundryPrefetchLibrary`, seine Phase `f._vorrat`): er wärmt neben der
                // Welt (K30: keine Region wartet auf ihn), das Stand-Fenster misst den Churn ohne seine Lieferungen.
                const vorrat = () => (r._foundry && r._foundry._vorrat) || false;
                // die EINE Antwort der Welt (`_streuWartet`: auch die fehlende Regionen-Karte wartet)
                const wartend = (liste) => r._streuWartet(st.playerMesh.position, liste);
                await window.__gebautNach("die Streu um den Spieler und der Vorrat", {
                    fertig: () => !(wartend() > 0 || vorrat()),
                    takt: async () => {
                        for (let i = 0; i < 30; i++) takt();
                        await sleep(30);
                    },
                    max: 5000,
                });
                o.wartendListe = [];
                o.wartendNachBoot = wartend(o.wartendListe) + (vorrat() ? 1 : 0);
            }
            const _oH0 = st.renderer._isHeadlessNull;
            const _oRS = r._applyRenderScale,
                _oSR = r._applyEffectiveShadowRange;
            st.renderer._isHeadlessNull = false;
            r._applyRenderScale = () => {};
            r._applyEffectiveShadowRange = () => {};
            // DIE KARTE IST EIN GPU-ANWENDER wie Render-Skala und Schatten-Weite: mit echtem Renderer trägt eine Baum-Karte
            // erst gebacken (`_foundryBuildImpostorFlat`), der Null-Renderer bäckt nie — er legt ihre Zelle aus der
            // L1-Geometrie an. Gelüftet nahm er den Bäcker-Zweig und wartete für immer: 2–4 Regionen blieben aufgeschoben
            // (Erle und Tanne auf 289–377 m), jede Lieferung baute sie ganz neu, 6–8 Mints im Fenster (3 von 3 Läufen).
            // Die Karten-Leser laufen darum mit der Null-Semantik, wie die anderen GPU-Anwender gestubbt sind.
            const _oKF = r._foundryBuildImpostorFlat,
                _oKR = r._foundryEnsureImpostorRecord;
            const nullKarte =
                (f) =>
                (...a) => {
                    const h = st.renderer._isHeadlessNull;
                    st.renderer._isHeadlessNull = true;
                    try {
                        return f.apply(r, a);
                    } finally {
                        st.renderer._isHeadlessNull = h;
                    }
                };
            r._foundryBuildImpostorFlat = nullKarte(_oKF);
            r._foundryEnsureImpostorRecord = nullKarte(_oKR);
            // DER STOFF IST EIN GPU-ANWENDER (Integration Grund): die Physical-Klasse des Klarlacks lebt in der
            // Node-Bibliothek des Renderers (`_foundryTreeMaterial`), der Null-Renderer trägt keine — kam eine Lieferung mit
            // Haut im gelüfteten Fenster, brach der Stoff laut („STOFF: die Gruppe der Foundry-Lieferung"). Er baut mit der
            // Null-Semantik, in BEIDEN gelüfteten Fenstern (Stand und Ingest-Takt).
            const _oTM = r._foundryTreeMaterial;
            r._foundryTreeMaterial = nullKarte(_oTM);
            const feed = (ms) => {
                st._perfFrame = {
                    render: 90,
                    streaming: 2,
                    waterIso: 1,
                    archCulling: 0.1,
                    creatures: 1,
                    physics: 1,
                    renderCalls: 1000,
                    renderTris: 12e6,
                };
                st._perfMarks = {};
                r._perfSenseFoldFrame(ms, ms / 1000);
            };
            for (let i = 0; i < 200; i++) feed(150); // Regler auf den Boden (Radius → 70)
            // Settle bis QUIESZENZ in DIESEM Regime (Batches à 100 Ticks, 2 ruhige in
            // Folge; 180 s Deadline — erreicht der Boot sie nie, ist DAS der Befund).
            // Ruhig heißt: kein Mint UND der Streu-Ring steht — dieselben Regionen, keine offene Scheiben-Fortsetzung
            // (`_cont`), keine wartende Region. Gezählt wurden nur Mints: ein Ring, der nach dem Regime-Wechsel
            // Regionen in Scheiben neu baute (Zellen 0 → 53), lief durch zwei Batches ohne neuen Schlüssel und münzte
            // seine Konifere-L1 erst im Fenster (2 Mints, 3 von 3 Läufen) — das Fenster maß den Boot, nicht den Stand.
            {
                // was am Ring wartet: die EINE Antwort der Welt je Region in Reichweite (`_streuWartet` — auch eine fehlende
                // Karte) und jede Region der Karte, die noch wartet
                // (`_streuRegionWartet` — eine Scheibe jenseits der Reichweite des gedrosselten Radius baut weiter)
                const ringWartet = () => {
                    const liste = [];
                    r._streuWartet(st.playerMesh.position, liste);
                    if (st.scatterRegions)
                        for (const k of st.scatterRegions.keys()) {
                            const grund = r._streuRegionWartet(k);
                            if (grund && !liste.includes(`${k} ${grund}`)) liste.push(`${k} ${grund}`);
                        }
                    return liste;
                };
                const ringStand = () =>
                    (st.scatterRegions ? Array.from(st.scatterRegions.keys()).sort().join(";") : "") +
                    "|" +
                    ringWartet().length;
                // ... und die Welt baut nichts mehr: die EINE Liste des Einschwingens (band-urteil `einschwingOffen`, dieselbe
                // wie `werkbank band`) ist leer — kein Foundry-Auftrag im Flug oder in der Worker-Schlange, keine Lieferung vor
                // dem Ingest-Takt, kein Karten-Bake, kein Chunk im Bau, und der DORF-ZUG ruht (kein Export, keine Ort-Wahl,
                // keine wachsende Siedlung). Ein Bau dauert 0,1–25 s; zwei ruhige Batches sind ein Takt-Maß, keine Uhr — am
                // langsamen CI-Läufer
                // lieferte er erst IM Fenster: 18–22 Mints, 168 → 186–190 Gruppen; lokal mit 3 s späteren Worker-Antworten
                // 88 Mints, 80 → 168. K10-6: der eigene Zähler (Foundry allein) sah den Dorf-Zug nicht — die Ort-Wahl des
                // Start-Dorfs rechnete in 3 von 3 Läufen noch beim Fenster-Start (18–19 Scheiben), landete im Fenster oder
                // im Ingest-Takt: CI 12 Mints im Stand (V1), über Budget 0 statt 1 Freigabe (V2, 3 von 6 lokal).
                const offen = () => window.__einschwingOffen(r);
                const baut = () => Object.keys(offen()).length;
                let ruhigeBatches = 0;
                await window.__gebautNach("die Ruhe der Welt (zwei ruhige Scheiben)", {
                    fertig: () => ruhigeBatches >= 2,
                    takt: async () => {
                        const mv = r._archGruppenMints || 0;
                        const ring0 = ringStand();
                        for (let i = 0; i < 100; i++) {
                            takt();
                            feed(150);
                            if (i % 20 === 0) await sleep(15);
                        }
                        const ring1 = ringStand();
                        const ruhig =
                            (r._archGruppenMints || 0) === mv &&
                            ring0 === ring1 &&
                            ring1.endsWith("|0") &&
                            baut() === 0;
                        ruhigeBatches = ruhig ? ruhigeBatches + 1 : 0;
                    },
                    max: 200,
                });
                o.quieszent = ruhigeBatches >= 2;
                o.ringOffen = ringWartet();
                o.weltOffen = offen();
            }
            // GOLD 4 — V5: DAS SZENE-SPEICHER-BAND. Der Live-Set-Zensus
            // (heapZensus, reine Lese-Linse) misst die CPU-TypedArray-Bytes der
            // gesettelten kleinen Welt — keine künftige Welle darf das Live-Set
            // still zurück in die GB-Klasse wachsen lassen (die 819-MB-Messung
            // VOR der Batch-Klein-Münze ist die Referenz; das Band liegt mit
            // Kopfraum darunter).
            const hz = r._flightRecorderHeapZensus();
            o.szeneMB = hz ? hz.szeneMB : null;
            // ── V1 + V3: STAND-FENSTER (Spieler steht, 400 Ticks im Regime) ──
            const mints0 = r._archGruppenMints || 0;
            const groups0 = st.archInstanceGroups ? st.archInstanceGroups.size : 0;
            let groupsMax = groups0;
            for (let i = 0; i < 400; i++) {
                takt();
                feed(150);
                if (st.archInstanceGroups && st.archInstanceGroups.size > groupsMax)
                    groupsMax = st.archInstanceGroups.size;
                if (i % 25 === 0) await sleep(15);
            }
            o.standMints = (r._archGruppenMints || 0) - mints0;
            o.groups0 = groups0;
            o.groupsMax = groupsMax;
            o.v1ChurnNull = o.standMints === 0;
            o.v3Stabil = groupsMax <= groups0; // stehen: nichts klettert (Reaper darf senken)
            // Regime zurück (die Gate-Hook-Lehre: sichern + wiederherstellen):
            st.renderer._isHeadlessNull = _oH0;
            r._applyRenderScale = _oRS;
            r._applyEffectiveShadowRange = _oSR;
            r._foundryBuildImpostorFlat = _oKF;
            r._foundryEnsureImpostorRecord = _oKR;
            // der Stoff bleibt bis nach dem Ingest-Takt unter der Null-Semantik (s. oben)
            st._perfFrame = {};
            st._perfMarks = {};
            st.perfSense = null;
            r._perfSenseFoldFrame(8, 0.0167);
            // ── SELBSTTEST: die Churn-Linse ist nicht blind ──
            let bpName = null;
            for (const n in st.blueprints) {
                const fl = r._archFlattenBlueprint(n);
                if (fl && fl.instanceable && fl.leaves && fl.leaves.length) {
                    bpName = n;
                    break;
                }
            }
            if (bpName) {
                const mintsVor = r._archGruppenMints || 0;
                const slots = r._scatterInstanceAdd(bpName, 7000, 10, 7000, 0, 1, null, "888,888");
                if (slots) r._scatterFreeSlots(slots);
                o.selbsttestChurn = (r._archGruppenMints || 0) > mintsVor;
            } else o.selbsttestChurn = false;
            // ── V2: DER INGEST-TAKT (headless gelüftet = echte Takt-Semantik) ──
            const _oH = st.renderer._isHeadlessNull;
            st.renderer._isHeadlessNull = false;
            const reihenfolge = [];
            const fertig = [];
            for (let i = 0; i < 8; i++) {
                fertig.push(false);
                r._foundryIngestTakt(["payload" + i]).then(() => {
                    fertig[i] = true;
                    reihenfolge.push(i);
                });
            }
            await sleep(0); // Microtasks leeren — NICHTS darf schon durch sein
            o.v2KeineSofort = fertig.every((x) => x === false);
            st._frameOverBudget = false; // 3 Freigaben je Tick
            r._tickFoundryIngest();
            await sleep(0);
            o.v2NachTick1 = fertig.filter(Boolean).length; // erwartet 3
            r._tickFoundryIngest();
            r._tickFoundryIngest();
            await sleep(0);
            o.v2Alle = fertig.every(Boolean);
            o.v2Reihenfolge = reihenfolge.join(",") === "0,1,2,3,4,5,6,7";
            // Über-Budget-Frame: nur 1 Freigabe.
            r._foundryIngestTakt(["extra0"]).then(() => reihenfolge.push("e0"));
            r._foundryIngestTakt(["extra1"]).then(() => reihenfolge.push("e1"));
            await sleep(0);
            st._frameOverBudget = true;
            r._tickFoundryIngest();
            await sleep(0);
            o.v2UeberBudgetEins = reihenfolge.filter((x) => x === "e0" || x === "e1").length === 1;
            st._frameOverBudget = false;
            r._tickFoundryIngest();
            await sleep(0);
            // headless byte-schnell: sofort resolven.
            st.renderer._isHeadlessNull = true;
            let hlSofort = false;
            r._foundryIngestTakt(["hl"]).then(() => (hlSofort = true));
            await sleep(0);
            o.v2HeadlessSofort = hlSofort;
            st.renderer._isHeadlessNull = _oH;
            r._foundryTreeMaterial = _oTM;
            // ── V4: LINSEN-KONSUM im gebauten Trace ──
            const trace = r._flightRecorderBuildTrace();
            const ss = trace && trace.steadyState;
            o.v4Linsen = !!(
                ss &&
                ss.bundleDeckung &&
                Number.isFinite(ss.bundleDeckung.deckungPct) &&
                ss.ingestTakt &&
                Number.isFinite(ss.ingestTakt.frei) &&
                ss.gruppenChurn &&
                Number.isFinite(ss.gruppenChurn.mints)
            );
        } catch (e) {
            o.err = (e && e.message) || String(e);
        }
        return o;
    })) || { err: "keine Antwort der Seite" };
    const errs = [];
    if (out.err) errs.push("Vertrag brach ab: " + out.err);
    if (out.wartendNachBoot !== 0)
        errs.push(
            `BOOT: ${out.wartendNachBoot} Streu-Regionen in Reichweite stehen nicht (${(out.wartendListe || []).join(", ") || "—"})`
        );
    if (!out.quieszent)
        errs.push(
            `QUIESZENZ: die Welt wurde nie still (offen: ${(out.ringOffen || []).join(", ") || "Mints oder Ring-Wechsel"}; ${JSON.stringify(out.weltOffen || {})})`
        );
    if (!out.v1ChurnNull) errs.push(`V1: ${out.standMints} Gruppen-Mints im Stand (Vertrag: 0)`);
    if (!out.v3Stabil) errs.push(`V3: archInstanceGroups kletterte im Stand (${out.groups0} → ${out.groupsMax})`);
    if (!(
        out.v2KeineSofort &&
        out.v2NachTick1 === 3 &&
        out.v2Alle &&
        out.v2Reihenfolge &&
        out.v2UeberBudgetEins &&
        out.v2HeadlessSofort
    ))
        errs.push(
            `V2: keineSofort=${out.v2KeineSofort} nachTick1=${out.v2NachTick1}/3 alle=${out.v2Alle} reihenfolge=${out.v2Reihenfolge} überBudget1=${out.v2UeberBudgetEins} headlessSofort=${out.v2HeadlessSofort}`
        );
    if (!out.v4Linsen) errs.push("V4: die Mess-Flächen (bundleDeckung/ingestTakt/gruppenChurn) fehlen im Trace");
    if (!(Number.isFinite(out.szeneMB) && out.szeneMB < 700)) errs.push(`V5: Szene-Live-Set ${out.szeneMB} MB ≥ 700`);
    if (!out.selbsttestChurn) errs.push("SELBSTTEST: die Churn-Linse zählte einen echten Mint NICHT (blind)");
    check(
        `Leistungs-Vertrag: 0 Stand-Churn (${out.standMints}), der Ingest-Takt 3/1 je Frame in Reihenfolge, die Gruppen klettern nicht (${out.groups0} → ${out.groupsMax}), die Mess-Flächen im Trace, Szene ${out.szeneMB} MB < 700, der Selbsttest feuert`,
        errs.length === 0,
        errs.join(" · ")
    );
}

module.exports = {
    checkBandLambda4Streu,
    checkBandStoffSignatur,
    checkBandV18493CoSchoepferStudio,
    checkBandFoundrySpeicherFlach,
    checkBandKristallKleid,
    checkBandKeinZweiterBaumbaecker,
    checkBandLeistungsVertrag,
};
