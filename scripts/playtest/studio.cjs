"use strict";
// scripts/playtest/studio.cjs — der Richter von Studio (spec/stamm/modul-karte.json): Foundry-Brücke · Bücher · Aufträge · Uhren · Vorrat · Foundry-Gestalt · Gruppen · Bibliothek · Bereitschaft.
// 3 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

async function checkBandLambda4Streu(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const arten = r._nahStreuArten() || [];
        const G = {};
        for (const a of arten) G[a.id] = r._foundryGestalten(a.id);
        out.gestalten = G;
        out.massenZwei = arten.length > 0 && ["farn", "schilf", "blume"].every((id) => G[id] === 2);
        out.alleGestalten = arten.length > 0 && arten.every((a) => Number.isInteger(G[a.id]) && G[a.id] >= 1);
        return out;
    });
    check(
        "Λ.4 Streu (Waldboden): jede Art trägt ihre Studio-Gestalten, die Massen-Arten (Farn · Schilf · Blume) zwei",
        res.alleGestalten === true && res.massenZwei === true,
        JSON.stringify(res.gestalten)
    );
}

// 1310-18 — EIN GRAPH JE SIGNATUR (der Schlüssel geprüft): r184 schlüsselt ein Programm nach der IDENTITÄT seiner Knoten
// (`customCacheKey` = Knoten-id). Stoffe gleicher Signatur und verschiedener Werte (Regler, Leucht-Maß, Wind der Art, Gestalt
// und Realm-Fenster des Tors) tragen DENSELBEN Programm-Schlüssel und ihre Werte als Stoff-Wert; verschiedene Signaturen
// verschiedene. Lauf-Kontrolle: zwei frisch und gleich gebaute Graphen tragen zwei Schlüssel — ohne den geteilten Graphen
// baute jeder Stoff sein eigenes Programm (1310-17: 43 Foundry-Stoffe, 43 Bauten; 5 Membranen, 5 Bauten).
async function checkBandStoffSignatur(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
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
        out.regler = a !== b && k(a) === k(b);
        out.leucht =
            l1 !== l2 &&
            k(l1) === k(l2) &&
            l1.userData.stoffWerte.leucht === 2 &&
            l2.userData.stoffWerte.leucht === 3.5;
        out.wind =
            w1 !== w2 &&
            k(w1) === k(w2) &&
            (!w1.positionNode || (w1.userData.windArt.x === 9.5 && w2.userData.windArt.x === 14.25));
        out.trennt = k(a) !== k(l1) && k(a) !== k(w1);
        const pc = globalThis.__portaCore;
        const tor = (n) => {
            const p = pc.gateParams(pc.PRESETS[n]);
            return { gestalt: n, p, mu: pc.membranUniforms(p), gesetz: pc.MEMBRAN_GESETZ };
        };
        const ta = tor("drachentor");
        const tb = tor("kathedrale");
        const ma = r._membranMaterialFor(ta);
        const mb = r._membranMaterialFor(tb);
        const sa = ma.mat.userData.tor;
        const sb = mb.mat.userData.tor;
        out.gestaltVerschieden = !sa.a.equals(sb.a) && !sa.pd.equals(sb.pd);
        out.membran = k(ma.mat) === k(mb.mat);
        out.atem = typeof ma.u.time.value === "number" && ma.u !== mb.u;
        const bau = () => {
            const m = new T.MeshStandardNodeMaterial();
            m.colorNode = TSL.vec4(TSL.attribute("color", "vec3").mul(0.5), 1.0);
            return m;
        };
        out.kontrolle = k(bau()) !== k(bau());
        return out;
    });
    check(
        "1310-18 Schlüssel: Foundry-Stoffe gleicher Signatur, verschiedener Regler tragen EINEN Programm-Schlüssel",
        res.regler === true
    );
    check(
        "1310-18 Schlüssel: das Leucht-Maß ist ein Stoff-Wert (zwei Maße, EIN Programm-Schlüssel)",
        res.leucht === true
    );
    check(
        "1310-18 Schlüssel: der Wind der Art ist ein Stoff-Wert (zwei Arten, EIN Programm-Schlüssel)",
        res.wind === true
    );
    check("1310-18 Schlüssel: verschiedene Signaturen tragen verschiedene Programm-Schlüssel", res.trennt === true);
    check(
        "1310-18 Schlüssel: zwei Tore verschiedener Gestalt (Bogen, Palette) tragen EINE Membran (D8: der Nebel fiel)",
        res.gestaltVerschieden === true && res.membran === true && res.atem === true
    );
    check(
        "1310-18 Lauf-Kontrolle: zwei frisch und gleich gebaute Graphen tragen zwei Schlüssel (r184 schlüsselt nach Identität)",
        res.kontrolle === true
    );
}

// Co-Schöpfer spricht Studio: ein Satz an die KI (oder ohne Schlüssel in den Chat) wird über
// DIESELBEN Tabellen wie die Werkstatt zu Studio-Bauplänen — geerdet, nie im Wasser. Beweist
// Auflöser · Op · Satz-Parser · near_water · Prompt · KI-Pfad END-ZU-END (gestubbte Antwort →
// maybeAnswerWithLlm → dslRun → spawnArchitecture).
// (checkBandV18331ReplayDeterminism unten: gleicher Start + gleiche Input-Folge ⇒ bit-identisch;
// sonst Math.random/Zeit/Float-Drift im Schritt-Pfad.)
async function checkBandV18493CoSchoepferStudio(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = {};
        const archs = r.state.architectures;
        const vorherAll = archs.length;
        try {
            out.eiche = r._studioBlueprintForWord("eiche");
            out.eichen = r._studioBlueprintForWord("Eichen");
            out.fels = r._studioBlueprintForWord("fels");
            out.unbekannt = r._studioBlueprintForWord("quasselstrippe");
            const f = r._foundry;
            const treeIds =
                f && f.recipes
                    ? Object.keys(f.recipes).filter((k) => f.recipes[k] && f.recipes[k].kind === "tree")
                    : [];
            out.treeIds = treeIds.length;
            out.alleBaeumeLoesen = treeIds.every((id) => !!r._studioBlueprintForWord(id));
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
            out.spot = !!spot;
            const vorher = archs.length;
            const res1 = r.dslRun(["spawn_studio", "eiche", ["at", spot.x, p.y, spot.z], 5, 4242], { source: "test" });
            const neu = archs.slice(vorher);
            out.neuZahl = neu.length;
            out.alleEiche = neu.length > 0 && neu.every((e) => e.type === "baum_eiche");
            out.alleTrocken = neu.every((e) => r._landAt(e.position.x, e.position.z, 0.2));
            out.alleGeerdet = neu.every((e) => {
                const sy = r._voxelSurfaceY(e.position.x, e.position.z);
                return Number.isFinite(sy) && Math.abs(e.position.y - (sy + 0.5)) < 0.6;
            });
            out.ok1 = res1.ok;
            const v2 = archs.length;
            const res2 = r.dslRun(["spawn_studio", "quasselstrippe", ["at_player"], 3], { source: "test" });
            out.unbekanntKeinSpawn = archs.length === v2 && res2.log.some((l) => l.event === "unknown_studio_word");
            const parsed = r.parseChatToDsl("pflanz mir einen eichenhain am wasser");
            out.satz = parsed
                ? JSON.stringify([parsed.program[0], parsed.program[1], parsed.program[2][0], parsed.program[3]])
                : null;
            const alt = r.parseChatToDsl("pflanze baum hier");
            out.altGesteBleibt = !!alt && alt.program[0] === "spawn_tree";
            // Welle L (V-k5): near_water liefert einen trockenen Ufer-Ort am Wasser — oder, ohne Wasser im Umkreis, KEINEN
            // (die Engstelle `dslEvalPos` wirft benannt), nie still den Spieler-Ort. Ob es Wasser gibt, sagt ein EIGENES
            // 4-m-Raster über den Kreis (nicht die Such-Funktion des Spiels); der Rand-Gürtel 150–166 m gilt beides.
            const pm0 = r.state.playerMesh.position;
            let nassNah = false,
                nassFern = false;
            const nassPunkte = [];
            for (let dz = -166; dz <= 166; dz += 4)
                for (let dx = -166; dx <= 166; dx += 4) {
                    const d = Math.hypot(dx, dz);
                    if (d > 166 || r._landAt(pm0.x + dx, pm0.z + dz, 0.2)) continue;
                    nassFern = true;
                    if (d <= 150) nassNah = true;
                    nassPunkte.push([pm0.x + dx, pm0.z + dz]);
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
                Math.hypot(nw.x - pm0.x, nw.z - pm0.z) > 0.5 &&
                nassPunkte.some(([x, z]) => Math.hypot(x - nw.x, z - nw.z) <= 8);
            const benannt = nwFehler === "kein Wasser im Umkreis von 160 m";
            out.nearWater = nassNah ? amWasser : !nassFern ? benannt : amWasser || benannt;
            out.nearWaterBefund = { nassNah, nassFern, nw, nwFehler };
            out.nearWaterTrocken = nw ? r._landAt(nw.x, nw.z, 0.3) : benannt;
            out.promptWoerter = /Bäume: /.test(r.llmBuildSystemPrompt()); // jedes Verb mit Form: gate:weltakt-wache (K)
            out.ruleVerbot = r.constructor.RULE_FORBIDDEN_EFFECT_OPS.has("spawn_studio");
            // Die Anthropic-Anfrage folgt der aktuellen Generation: 5er-Modelle mit effort +
            // fallbacks + Beta-Header, Haiku 4.5 schlicht (es kennt beides nicht).
            const an = r.llmProviderDefs().anthropic;
            const bOpus = an.buildBody("claude-opus-5-5", "s", "u");
            const hOpus = an.buildHeaders("k", { model: "claude-opus-5-5" });
            const bHaiku = an.buildBody("claude-haiku-4-5", "s", "u");
            const hHaiku = an.buildHeaders("k", { model: "claude-haiku-4-5" });
            out.anthropicForm =
                an.models.some((m) => m.id === "claude-opus-5-5") &&
                bOpus.output_config &&
                bOpus.output_config.effort === "low" &&
                bOpus.fallbacks === "default" &&
                hOpus["anthropic-beta"] === "server-side-fallback-2026-07-01" &&
                !bHaiku.output_config &&
                !bHaiku.fallbacks &&
                !hHaiku["anthropic-beta"];
            // Der KI-Pfad END-ZU-END (die Antwort ist gestubbt — der Container hat kein Netz zum LLM).
            const llm = r.state.llm;
            const altLlm = { enabled: llm.enabled, provider: llm.provider };
            const origCall = r.llmCall;
            llm.enabled = true;
            llm.provider = "ollama";
            r.llmCall = async () => ({
                say: "Ich lasse Birken wachsen.",
                program: ["spawn_studio", "birke", ["at", spot.x + 6, p.y, spot.z + 6], 4, 77],
            });
            const v3 = archs.length;
            const said = [];
            try {
                await r.maybeAnswerWithLlm("pflanz mir ein paar birken", (t) => said.push(t));
            } finally {
                r.llmCall = origCall;
                llm.enabled = altLlm.enabled;
                llm.provider = altLlm.provider;
            }
            const neu3 = archs.slice(v3);
            out.kiNeu = neu3.length;
            out.kiBirke = neu3.length > 0 && neu3.every((e) => e.type === r._studioBlueprintForWord("birke"));
            out.kiSagte = said.some((t) => /Birken/.test(t)) && said.some((t) => /Welt verändert/.test(t));
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        // Aufräumen: die Test-Pflanzung verlässt die Welt wieder (die Folge-Bänder sehen den alten Stand).
        for (const e of archs.slice(vorherAll).reverse()) {
            try {
                r.removeArchitecture(e);
            } catch (_e) {}
        }
        out.aufgeraeumt = archs.length === vorherAll;
        return out;
    });
    const R = res || {};
    check("V18.493 Co-Schöpfer: Band lief ohne Fehler", !R.err, R.err);
    check(
        "V18.493 Co-Schöpfer: der Wort-Auflöser liest die lebenden Tabellen (eiche/Eichen → baum_eiche, fels → Bauplan, Unsinn → null)",
        R.eiche === "baum_eiche" && R.eichen === "baum_eiche" && !!R.fels && R.unbekannt === null,
        `eiche=${R.eiche} eichen=${R.eichen} fels=${R.fels} unbekannt=${R.unbekannt}`
    );
    check(
        `V18.493 Co-Schöpfer: JEDE Baum-Art des Rezeptbuchs ist ein sagbares Wort (${R.treeIds} Arten)`,
        R.alleBaeumeLoesen === true && R.treeIds > 0
    );
    check(
        "V18.493 Co-Schöpfer: spawn_studio pflanzt 5 Eichen — geerdet (Oberfläche+0.5), trocken, am EINEN Chokepoint",
        R.spot === true && R.neuZahl === 5 && R.alleEiche && R.alleTrocken && R.alleGeerdet && R.ok1,
        `neu=${R.neuZahl} eiche=${R.alleEiche} trocken=${R.alleTrocken} geerdet=${R.alleGeerdet}`
    );
    check("V18.493 Co-Schöpfer: ein unbekanntes Wort pflanzt NICHTS und sagt es im Log", R.unbekanntKeinSpawn === true);
    check(
        "V18.493 Co-Schöpfer: der Satz OHNE KI („pflanz mir einen eichenhain am wasser“) wird spawn_studio eichen · near_water · 6",
        R.satz === JSON.stringify(["spawn_studio", "eichen", "near_water", 6]),
        String(R.satz)
    );
    check(
        "V18.493 Co-Schöpfer: die spezifischere alte Geste bleibt („pflanze baum hier“ → spawn_tree)",
        R.altGesteBleibt === true
    );
    check(
        "V18.493 Co-Schöpfer: near_water liefert einen Ufer-Ort am Wasser (eigenes 4-m-Raster) — ohne Wasser im Umkreis KEINEN, benannt (nie still den Spieler-Ort)",
        R.nearWater === true && R.nearWaterTrocken === true,
        JSON.stringify(R.nearWaterBefund)
    );
    check(
        "V18.493 Co-Schöpfer: das KI-Prompt lehrt die lebenden Wörter (spawn_studio wie jedes Verb: gate:weltakt-wache K); Regeln dürfen es nicht",
        R.promptWoerter === true && R.ruleVerbot === true
    );
    check(
        "V18.493 Co-Schöpfer: KI-Pfad END-ZU-END — Antwort → maybeAnswerWithLlm → 4 Birken aus dem Studio in der Welt",
        R.kiNeu === 4 && R.kiBirke === true && R.kiSagte === true,
        `neu=${R.kiNeu} birke=${R.kiBirke} sagte=${R.kiSagte}`
    );
    check(
        "V18.493 Co-Schöpfer: die Claude-Anfrage spricht die aktuelle Generation (5er: effort low + fallbacks; Haiku schlicht)",
        R.anthropicForm === true
    );
    check("V18.493 Co-Schöpfer: die Test-Pflanzung ist wieder aufgeräumt", R.aufgeraeumt === true);
}

module.exports = {
    checkBandLambda4Streu, checkBandStoffSignatur, checkBandV18493CoSchoepferStudio,
};
