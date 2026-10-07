#!/usr/bin/env node
// diag-regler-wirkt.cjs — DIE REGLER-WIRKT-PROBE (W1 d, gate:regler-wirkt). Jede Zeile von PARAMS_BY_KIND ist ein
// Regler, den die Werkstatt aus den Buch-Daten rendert (`_workshopRenderStudioParams`: Rezepte aus dem Buch, Regler aus
// `paramsByKind[rezept.kind]`, der Wert liegt in ws.studioOv[preset] und reist über die EINE Vorschau-Quelle
// `_workshopStudioPreviewFrom`). Ein Regler WIRKT, wenn das Bewegen den Bau ändert — gemessen an dem Kanal, den die
// Vorschau nimmt: die MESHFREI-Arten gießt der Host-Ofen des Stamms (der Ofen-Kanal unten, echte Heimat), alle anderen
// baut die Linse über die ECHTE Foundry-Brücke (asset-worker-harness, dieselben Kerne wie der Worker): das Rezept ohne
// ov und mit ov {id: min} bzw. {id: max}, verglichen wird der Bau-Hash (jedes gelieferte Byte: Teil-Art, Stoff,
// Attribute, Index). Ein Regler ist TOT, wenn er an KEINEM Rezept seiner Art den Hash bewegt — dann
// nennt ihn die Linse beim Namen (Kern · Art · id · Grund). Ein Bau mit dem Regler-Wert, der BRICHT (0 Teile: der
// Bäcker wirft, die Brücke fängt und liefert []; oder NaN/Inf in einem Fließkomma-Puffer), wirkt nie: er ist ein
// benannter Fehler und immer rot, ohne Ratsche.
//
// Die RATSCHEN (spec/vertraege/ratsche.json): `reglerTot` (die toten Regler) und `reglerBudget` (ein Rand-Wert treibt
// die Stufe über ihre Budget-Zeile, Studio-Vertrag B2c — der Bau steht, das Gesetz bricht) dürfen nur schrumpfen.
// Ein neuer toter Regler ist rot (beim Namen); ein geheilter ist ebenfalls rot, bis seine Zeile im selben Commit
// fällt (die Zahl sinkt, sie wächst nie still zurück). Das Soll steht daneben (Synthese W4: „Regler-wirkt-Probe grün"
// = 0 tote Regler).
//
//   node scripts/diag-regler-wirkt.cjs --selftest   die Linse feuert: der alte Brücken-Defekt (W-A1: ov kam nicht
//                                                   an, die Brücke reichte null) macht jeden Regler tot → rot; ein
//                                                   Regler, dessen Bau wirft bzw. NaN rechnet → BRICHT beim Namen;
//                                                   am Ofen: der Ofen verliert den Wert → koerper tot, der
//                                                   Mensch-Bäcker wirft → Not-Körper → BRICHT
//   node scripts/diag-regler-wirkt.cjs              Messung gegen die Ratsche
//   node scripts/diag-regler-wirkt.cjs --messen     nur messen und ausgeben (kein Urteil)
// Port über REGLER_WIRKT_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4561; der Stamm des
// Ofen-Kanals über REGLER_WIRKT_OFEN_PORT, Standard Port + 1.
"use strict";
const fs = require("fs");
const path = require("path");
const { runWithWorker } = require("./lib/asset-worker-harness.cjs");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.REGLER_WIRKT_PORT || 4561);
const RATSCHE_PFAD = path.join(ROOT, "spec", "vertraege", "ratsche.json");
const SEED = 1;

// Der Kern je Art, wie die Brücke die Tabellen sammelt (`__mergeParamsMap`: die Zweit-Kerne in Manifest-Reihenfolge,
// first-wins, danach der Primär-Kern): jeder Zweit-Kern mit Namensraum wird THREE-frei im vm gelesen (nur seine
// PARAMS_BY_KIND), was keiner trägt, gehört dem Primär-Kern (phyto).
function kernVonArt() {
    const vm = require("vm");
    const aus = {};
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "cores.manifest.json"), "utf8"));
    for (const c of manifest) {
        if (!c || typeof c.ns !== "string" || !c.ns) continue;
        const ctx = { console, Math, JSON, Date };
        ctx.self = ctx;
        ctx.globalThis = ctx;
        vm.createContext(ctx);
        for (const s of c.scripts) vm.runInContext(fs.readFileSync(path.join(ROOT, s), "utf8"), ctx, { filename: s });
        const pbk = (ctx[c.ns] && ctx[c.ns].PARAMS_BY_KIND) || {};
        for (const art of Object.keys(pbk)) if (!(art in aus)) aus[art] = c.id;
    }
    return aus;
}

// Die niedrigste Stufe, die die Art trägt (die Werkstatt-Vorschau startet auf L0; eine Art ohne L0 baut ihre erste).
function ersteStufe(rc, art) {
    const ks = rc && rc.lod && rc.lod.kindStages;
    const zks = (rc && rc.lod && rc.lod.zusatzKindStages) || {};
    let st = ks && Array.isArray(ks[art]) ? ks[art] : null;
    for (const kern in zks) if (!st && Array.isArray(zks[kern][art])) st = zks[kern][art];
    return st && st.length ? Math.min(...st) : 0;
}

// ── DER OFEN-KANAL (Q0: die Linse misst, wo der Regler WIRKT). Die Werkstatt-Vorschau `_workshopStudioPreviewFrom`
// fragt zuerst den Host-Ofen (`_workshopOvenPreview`): die MESHFREI-Arten (Vertrag §8 — kein Mesh aus dem Kern) gießt
// der Stamm selbst, der Regler-Wert reist aus `ws.studioOv[preset]` in den Guss (koerper: `_buildHumanGroup(ov)` →
// dials des Mensch-Bäckers; kreatur: `_buildCreatureGroup(seele, {dialsOv})` → Gattungs-Dials), nie über build-asset.
// Welche Art der Ofen trägt, entscheidet der Stamm (`_workshopOvenPreview(...) !== undefined`), keine Namensliste hier.
// Die Linse bootet die echte Heimat (Null-Renderer), legt den Wert in den Speicher der Werkstatt und ruft die EINE
// Vorschau-Quelle; der Hash läuft über die gegossene Gruppe (je Objekt Typ, Sichtbarkeit, Welt-Matrix; je Mesh jeder
// Vertex-Puffer, Index, Stoff-Farbe). Gebrochen ist ein Guss, der wirft, ERROR meldet, den Not-Körper
// (`__kaltPlatzhalter`) statt der Gestalt liefert, leer bleibt oder NaN trägt; ein Grund-Guss, der zweimal verschieden
// ausfällt, rauscht (beides rot). Eine Ofen-Art ohne Gestalt-Bäcker (`BAKERS_BY_KIND[art]` fehlt, Vertrag §8.4) gießt
// nichts: ihre Regler sind tot mit diesem Grund (Ratsche).
const OFEN_PORT = Number(process.env.REGLER_WIRKT_OFEN_PORT || PORT + 1);

async function imStamm(cb) {
    const http = require("http");
    const puppeteer = require("puppeteer");
    const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
    const MIME = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css", ".wasm": "application/wasm", ".png": "image/png", ".woff2": "font/woff2" };
    const server = http.createServer((req, res) => {
        let p = decodeURIComponent(req.url.split("?")[0]);
        if (p === "/") p = "/index.html";
        const fp = path.join(ROOT, p);
        if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(OFEN_PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: softwareWebGpuArgs() });
    try {
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(() => {
            if (window.top !== window) return;
            window.__anazhHeadlessNullRenderer = true;
        });
        const seitenFehler = [];
        page.on("pageerror", (e) => seitenFehler.push(String((e && e.message) || e).split("\n")[0].slice(0, 160)));
        await page.goto(`http://127.0.0.1:${OFEN_PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        // Warm: die Heimat steht, die Foundry ist bereit, das Buch (Rezepte + PARAMS) ist da, die Kerne der Öfen sind
        // geladen und der Boot-Prefetch der Gattungen ist durch.
        await page.waitForFunction(
            () => {
                const r = window.anazhRealm;
                const f = r && r._foundry;
                return !!(f && f.ready && f.recipes && f.paramsByKind && Object.keys(f.paramsByKind).length && !f._prefetching && globalThis.BAKERS_BY_KIND && window.__koerperCore && window.__tetrapodaCore);
            },
            { timeout: 240000, polling: 250 }
        );
        seitenFehler.length = 0;
        const out = await cb(page);
        if (seitenFehler.length) throw new Error("Seiten-Fehler im Guss: " + seitenFehler.slice(0, 3).join(" · "));
        return out;
    } finally {
        await browser.close();
        server.close();
    }
}

// Im Stamm: je Ofen-Art die Zeilen über die echte Vorschau-Quelle. `taeter`: "ohneOv" (der Ofen verliert den Wert:
// `_buildHumanGroup` ohne dialsOv — der alte Kanal-Defekt), {bruch: id, wert} (der Mensch-Bäcker wirft bei diesem Wert).
function ofenMessen(page, opts) {
    return page.evaluate(async (o) => {
        const r = window.anazhRealm;
        const f = r._foundry;
        const P = Object.getPrototypeOf(r);
        const ws = r._ensureWorkshopState();
        const B = globalThis.BAKERS_BY_KIND;
        const seedVon = (s) => {
            let n = 0;
            for (let i = 0; i < s.length; i++) n = (Math.imul(n, 131) + s.charCodeAt(i)) >>> 0;
            return n;
        };
        const f64 = new Float64Array(1);
        const u64 = new Uint8Array(f64.buffer);
        const gussHash = (g) => {
            const aus = { hash: "", teile: 0, bytes: 0, nichtEndlich: 0, platzhalter: 0, kein: null };
            if (!g || typeof g !== "object" || typeof g.traverse !== "function") {
                aus.kein = String(g);
                return aus;
            }
            let a = 0x811c9dc5 | 0,
                b = 0x2f0a1c3d | 0;
            const ein = (x) => {
                a = Math.imul(a ^ x, 16777619);
                b = Math.imul(b ^ (x + 0x9e), 16777619);
            };
            const text = (s) => {
                s = String(s);
                for (let i = 0; i < s.length; i++) ein(s.charCodeAt(i) & 255);
                ein(0);
            };
            const zahl = (x) => {
                f64[0] = x;
                for (let i = 0; i < 8; i++) ein(u64[i]);
                if (!Number.isFinite(x)) aus.nichtEndlich++;
            };
            const puffer = (arr) => {
                const u = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
                for (let i = 0; i < u.length; i++) ein(u[i]);
                aus.bytes += u.length;
                if (arr instanceof Float32Array || arr instanceof Float64Array)
                    for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) aus.nichtEndlich++;
            };
            g.updateMatrixWorld(true);
            g.traverse((x) => {
                text(x.type);
                text(x.visible ? 1 : 0);
                for (const e of x.matrixWorld.elements) zahl(e);
                if (x.userData && x.userData.__kaltPlatzhalter) aus.platzhalter++;
                if (!x.isMesh || !x.geometry) return;
                aus.teile++;
                const at = x.geometry.attributes;
                for (const k of Object.keys(at).sort()) {
                    const v = at[k];
                    text(k);
                    text(v.itemSize);
                    if (v.isInterleavedBufferAttribute) {
                        text(v.offset);
                        puffer(v.data.array);
                    } else puffer(v.array);
                }
                if (x.geometry.index) puffer(x.geometry.index.array);
                for (const m of Array.isArray(x.material) ? x.material : [x.material]) {
                    if (m && m.color && typeof m.color.getHexString === "function") text(m.color.getHexString());
                    if (m && m.userData && m.userData.__klasse) text(m.userData.__klasse);
                }
            });
            const hex = (x) => ("0000000" + (x >>> 0).toString(16)).slice(-8);
            aus.hash = hex(a) + hex(b);
            return aus;
        };
        // EIN Guss über die echte Vorschau-Quelle, mit dem Wert im Speicher der Werkstatt (`ws.studioOv[preset]`,
        // gelesen von `_workshopStudioOvFor` — die Form, die der Regler-Panel schreibt). Das Vorschau-Memo fällt je Guss
        // (jeder Hash ist ein frischer Guss); ERROR-Meldungen des Stamms während des Gusses werden mitgeschrieben.
        const guss = (preset, lod, ov) => {
            const fehler = [];
            const budget = [];
            r.log = function (m, lvl) {
                // Der Budget-Bruch (Studio-Vertrag B2c: die Stufe über ihrer Zeile) ist ein eigenes Urteil — der Guss steht.
                if (lvl === "ERROR") (/^BUDGET-BRUCH /.test(String(m)) ? budget : fehler).push(String(m).slice(0, 200));
                return P.log.apply(this, arguments);
            };
            const hatte = Object.prototype.hasOwnProperty.call(ws.studioOv, preset);
            const alt = ws.studioOv[preset];
            if (ov) ws.studioOv[preset] = ov;
            else delete ws.studioOv[preset];
            r._wsOvenMemo = null;
            let g = null,
                wurf = null;
            try {
                g = r._workshopStudioPreviewFrom(preset, seedVon(preset), lod, r._workshopStudioOvFor(preset));
            } catch (e) {
                wurf = String((e && e.message) || e).slice(0, 160);
            } finally {
                if (hatte) ws.studioOv[preset] = alt;
                else delete ws.studioOv[preset];
                delete r.log;
            }
            const h = gussHash(g);
            h.fehler = fehler;
            h.budget = budget;
            h.wurf = wurf;
            return h;
        };
        const bruch = (h) =>
            h.wurf
                ? "der Guss wirft: " + h.wurf
                : h.fehler.length
                  ? "der Guss meldet ERROR: " + h.fehler[0]
                  : h.platzhalter
                    ? "Not-Körper statt Gestalt (__kaltPlatzhalter)"
                    : !h.teile
                      ? "kein Guss (" + h.kein + ")"
                      : h.nichtEndlich
                        ? h.nichtEndlich + " nicht-endliche Werte (NaN/Inf)"
                        : null;
        // Die Täter (Selbsttest), am echten Ofen eingespielt und danach entfernt.
        const altBaecker = B.koerper;
        if (o.taeter === "ohneOv")
            r._buildHumanGroup = function () {
                return P._buildHumanGroup.call(this);
            };
        if (o.taeter && o.taeter.bruch) {
            r.constructor._tierOfenMemo && r.constructor._tierOfenMemo.clear();
            B.koerper = function (core, id, seed, lod, ov) {
                if (ov && ov.dials && ov.dials[o.taeter.bruch] === o.taeter.wert) throw new Error("Täter: der Mensch-Bäcker wirft");
                return altBaecker.apply(this, arguments);
            };
        }
        const aus = { arten: {}, zeilen: [] };
        try {
            const arten = Object.keys(f.paramsByKind)
                .filter((x) => !o.nurArt || x === o.nurArt)
                .sort();
            for (const art of arten) {
                const rezepte = Object.keys(f.recipes)
                    .filter((id) => f.recipes[id] && f.recipes[id].kind === art)
                    .sort();
                if (!rezepte.length) continue;
                const st = r._foundryKindStages(rezepte[0]);
                const lod = st ? Math.min(...st) : 0;
                r._wsOvenMemo = null;
                // Die Werkstatt entscheidet den Kanal: undefined = keine Ofen-Domäne → der Foundry-Pfad (build-asset).
                if (r._workshopOvenPreview(f.recipes[rezepte[0]], rezepte[0], null, lod) === undefined) continue;
                const baecker = typeof B[art] === "function";
                aus.arten[art] = { lod, baecker, rezepte: rezepte.length };
                const zeilen = f.paramsByKind[art].map((d) => ({ art, id: d.id, min: d.min, max: d.max, rezepte, lod, wirkt: false, an: null, bricht: [], budget: [], keinGuss: false, gusse: 0 }));
                for (const p of rezepte) {
                    const offen = zeilen.filter((z) => !z.wirkt);
                    if (!offen.length) break;
                    const b0 = guss(p, lod, null);
                    const bB = bruch(b0);
                    if (bB) {
                        if (!b0.teile && !b0.wurf && !b0.fehler.length && !baecker) offen.forEach((z) => (z.keinGuss = true));
                        else offen.forEach((z) => z.bricht.push(`Grund-Guss ${p}: ${bB}`));
                        continue;
                    }
                    for (const z of offen)
                        for (const wert of [z.min, z.max]) {
                            const h = guss(p, lod, { [z.id]: wert });
                            z.gusse++;
                            const bb = bruch(h);
                            if (bb) {
                                z.bricht.push(`${z.id}=${wert} an ${p}: ${bb}`);
                                continue;
                            }
                            for (const t of h.budget) z.budget.push(`${z.id}=${wert} an ${p}: ${t}`);
                            if (h.hash !== b0.hash && !z.wirkt) {
                                z.wirkt = true;
                                z.an = p;
                            }
                        }
                    const b1 = guss(p, lod, null);
                    if (b1.hash !== b0.hash) offen.forEach((z) => z.bricht.push(`Grund-Guss ${p} rauscht (${b0.hash} · ${b1.hash})`));
                }
                aus.zeilen.push(...zeilen);
            }
        } finally {
            if (Object.prototype.hasOwnProperty.call(r, "_buildHumanGroup")) delete r._buildHumanGroup;
            B.koerper = altBaecker;
        }
        return aus;
    }, opts || {});
}

// DER GEBROCHENE BAU: 0 Teile (der Bäcker wirft — die Brücke fängt und liefert [] — oder liefert nichts) oder
// nicht-endliche Zahlen in einem Fließkomma-Puffer (der Bäcker rechnet mit einem Wert, den er nicht rechnen kann).
// Ein gebrochener Bau hat einen anderen Hash als die Basis, aber er WIRKT nicht: er ist ein benannter Fehler (rot).
function bauBruch(r) {
    if (!r || !r.teile) return "0 Teile (der Bau wirft oder liefert nichts)";
    if (r.nichtEndlich) return r.nichtEndlich + " nicht-endliche Werte (NaN/Inf) in den Puffern";
    return null;
}

// Die Messung: je Art × Regler über die Rezepte der Art, bis einer den Hash bewegt. Die Täter des Selbsttests:
// `ohneOv` (der alte Brücken-Defekt W-A1: die Bau-Nachricht trägt den Regler-Wert nicht) und `bruch` = id eines
// Reglers, dessen Bau bricht (min: die Nachricht nennt ein Rezept, das das Buch nicht kennt — der Worker wirft, die
// Brücke liefert 0 Teile; max: der Wert ist Text — der Bäcker rechnet NaN).
async function messen(h, opts) {
    const o = opts || {};
    const env = await h.getData("get-book");
    const buch = env.book || {};
    const pbk = env.paramsByKind || {};
    const rc = env.renderConfig || {};
    const kerne = kernVonArt();
    const ohne = new Set(o.ohneArten || []);
    const arten = Object.keys(pbk)
        .filter((a) => (!o.nurArt || a === o.nurArt) && !ohne.has(a))
        .sort();
    const zeilen = [];
    for (const art of arten) {
        const rezepte = Object.keys(buch)
            .filter((id) => buch[id] && buch[id].kind === art)
            .sort();
        const lod = ersteStufe(rc, art);
        for (const d of pbk[art])
            zeilen.push({ kern: kerne[art] || "phyto", art, id: d.id, d, rezepte, lod, kanal: "build-asset", wirkt: false, grund: "", an: null, bricht: [], budget: [] });
    }
    const msg = (preset, lod, ov) => {
        const m = { presetId: preset, seed: SEED, lod };
        if (ov && !o.ohneOv) m.ov = ov;
        const k = ov && Object.keys(ov)[0];
        if (k && o.bruch === k) {
            const z = zeilen.find((x) => x.id === k);
            if (ov[k] === z.d.min) m.presetId = "__taeter_unbekannt__";
            else m.ov = { [k]: "kein-wert" };
        }
        return m;
    };
    // Runde je Rezept-Index: alle noch toten Zeilen am i-ten Rezept ihrer Art (die Basis je Rezept einmal).
    const basis = new Map();
    let builds = 0;
    for (let ri = 0; ; ri++) {
        const offen = zeilen.filter((z) => !z.wirkt && ri < z.rezepte.length);
        if (!offen.length) break;
        const liste = [];
        const plan = [];
        for (const z of offen) {
            const p = z.rezepte[ri];
            const bk = p + "|" + z.lod;
            if (!basis.has(bk)) {
                basis.set(bk, null);
                plan.push({ basis: bk });
                liste.push(msg(p, z.lod, null));
            }
            for (const wert of [z.d.min, z.d.max]) {
                plan.push({ z, p, wert });
                liste.push(msg(p, z.lod, { [z.id]: wert }));
            }
        }
        const res = await h.bauHashListe(liste);
        builds += liste.length;
        plan.forEach((pl, i) => {
            if (pl.basis) basis.set(pl.basis, res[i]);
        });
        plan.forEach((pl, i) => {
            if (pl.basis) return;
            const b = basis.get(pl.p + "|" + pl.z.lod);
            // Der Grund-Bau einer Mesh-Art bricht: ein benannter Fehler an jeder Zeile, die ihn braucht (die Ofen-Arten
            // misst der Ofen-Kanal; hier hat jede Art eine Gestalt).
            const bB = bauBruch(b);
            if (bB) {
                const t = `Grund-Bau ${pl.p}: ${bB}`;
                if (!pl.z.bricht.includes(t)) pl.z.bricht.push(t);
                return;
            }
            const bruch = bauBruch(res[i]);
            if (bruch) {
                pl.z.bricht.push(`${pl.z.id}=${pl.wert} an ${pl.p}: ${bruch}`);
                return;
            }
            if (res[i].budgetBruch) pl.z.budget.push(`${pl.z.id}=${pl.wert} an ${pl.p} L${pl.z.lod}: ${res[i].budgetBruch}`);
            if (res[i].hash !== b.hash && !pl.z.wirkt) {
                pl.z.wirkt = true;
                pl.z.an = pl.p;
            }
        });
    }
    for (const z of zeilen) {
        if (z.wirkt) {
            z.grund = "wirkt an " + z.an;
            continue;
        }
        z.grund = !z.rezepte.length
            ? "kein Rezept der Art im Buch"
            : "bewegt den Bau an keinem der " + z.rezepte.length + " Rezepte (min " + z.d.min + " · max " + z.d.max + ")";
    }
    for (const z of zeilen) if (z.bricht.length) z.grund = "BRICHT — " + z.bricht.slice(0, 2).join(" · ") + (z.bricht.length > 2 ? " …" : "");
    return { zeilen, builds };
}

// Die Zeilen des Ofen-Kanals in die gemeinsame Form (Kern je Art wie die Brücke sie sammelt).
function ofenZeilen(ofen) {
    const kerne = kernVonArt();
    return ofen.zeilen.map((z) => {
        const n = { kern: kerne[z.art] || "phyto", art: z.art, id: z.id, d: { min: z.min, max: z.max }, rezepte: z.rezepte, lod: z.lod, kanal: "Ofen", wirkt: z.wirkt, an: z.an, bricht: z.bricht, budget: z.budget, grund: "" };
        n.grund = z.bricht.length
            ? "BRICHT — " + z.bricht.slice(0, 2).join(" · ") + (z.bricht.length > 2 ? " …" : "")
            : z.wirkt
              ? "wirkt an " + z.an + " (Ofen-Guss der Werkstatt)"
              : z.keinGuss
                ? "kein Guss: die Werkstatt fragt den Host-Ofen, die Art hat keinen Gestalt-Bäcker (MESHFREI ohne BAKERS_BY_KIND, Vertrag §8.4) — der Wert hat keinen Leser"
                : "bewegt den Ofen-Guss an keinem der " + z.rezepte.length + " Rezepte (min " + z.min + " · max " + z.max + ")";
        return n;
    });
}

// Die ganze Messung: erst der Stamm (er entscheidet die Ofen-Arten und gießt sie), dann die Brücke für den Rest.
async function messenAlle() {
    const ofen = await imStamm((page) => ofenMessen(page, {}));
    let m = null;
    await runWithWorker(PORT, async (h) => {
        m = await messen(h, { ohneArten: Object.keys(ofen.arten) });
    });
    const gusse = ofen.zeilen.reduce((s, z) => s + z.gusse, 0);
    return { zeilen: [...m.zeilen, ...ofenZeilen(ofen)], builds: m.builds, gusse, ofenArten: ofen.arten };
}

const name = (z) => z.kern + ":" + z.art + ":" + z.id;
// Drei Urteile je Zeile: wirkt · bricht (ein Bau mit diesem Regler ist gebrochen — immer rot, nie Ratsche) · tot.
const bricht = (z) => z.bricht.length > 0;
const tot = (z) => !z.wirkt && !bricht(z);

// Das Urteil gegen die Ratsche (rein, ohne Browser): neu tot = rot, geheilt = rot bis die Zeile fällt.
function vergleich(tot, ratsche) {
    const bekannt = new Set(Object.keys((ratsche && ratsche.tot) || {}));
    const jetzt = new Set(tot);
    const neu = [...jetzt].filter((n) => !bekannt.has(n)).sort();
    const geheilt = [...bekannt].filter((n) => !jetzt.has(n)).sort();
    return { neu, geheilt, ok: !neu.length && !geheilt.length };
}

function ratscheLesen() {
    const r = JSON.parse(fs.readFileSync(RATSCHE_PFAD, "utf8"));
    if (!r.reglerTot || typeof r.reglerTot.tot !== "object") throw new Error("ratsche.json ohne Block reglerTot.tot");
    if (!r.reglerBudget || typeof r.reglerBudget.bruch !== "object") throw new Error("ratsche.json ohne Block reglerBudget.bruch");
    return r.reglerTot;
}
function budgetRatscheLesen() {
    return JSON.parse(fs.readFileSync(RATSCHE_PFAD, "utf8")).reglerBudget;
}

function bericht(zeilen) {
    const jeKern = {};
    for (const z of zeilen) {
        const k = (jeKern[z.kern] = jeKern[z.kern] || { zeilen: 0, wirkt: 0, tot: 0, bricht: 0 });
        k.zeilen++;
        if (z.wirkt && !bricht(z)) k.wirkt++;
        if (tot(z)) k.tot++;
        if (bricht(z)) k.bricht++;
    }
    for (const k of Object.keys(jeKern).sort()) {
        const j = jeKern[k];
        console.log(
            `  ${k.padEnd(10)} ${String(j.wirkt).padStart(3)} wirken · ${String(j.tot).padStart(3)} tot${j.bricht ? ` · ${j.bricht} BRICHT` : ""} (von ${j.zeilen})`
        );
    }
    return jeKern;
}

async function selbsttest() {
    // (a) das Urteil rein: ein neuer Toter und ein Geheilter sind beide rot, die gleiche Liste ist grün.
    const r = { tot: { "a:x:1": "", "a:x:2": "" } };
    const v1 = vergleich(["a:x:1", "a:x:2"], r);
    const v2 = vergleich(["a:x:1", "a:x:2", "a:x:3"], r);
    const v3 = vergleich(["a:x:1"], r);
    const rein = v1.ok && !v2.ok && v2.neu[0] === "a:x:3" && !v3.ok && v3.geheilt[0] === "a:x:2";
    console.log(`${rein ? "✅" : "❌"} SELBST-TEST Urteil: gleich grün · neu tot rot (${v2.neu}) · geheilt rot bis die Zeile fällt (${v3.geheilt})`);
    // (b) der Täter am echten Kanal: die Brücke bekommt den Regler-Wert nicht (der W-A1-Defekt) — jede Zeile der Art
    // vehicle wird tot und beim Namen genannt; ohne Täter wirkt dieselbe Art.
    let taeter = null,
        heil = null,
        brecher = null;
    await runWithWorker(PORT, async (h) => {
        taeter = await messen(h, { nurArt: "vehicle", ohneOv: true });
        heil = await messen(h, { nurArt: "vehicle" });
        // (c) der Täter „ein Regler bricht den Bau" am echten Kanal: radstand min → der Worker wirft (0 Teile),
        // max → Text statt Zahl (NaN-Bau). Beide Bauten haben einen anderen Hash als die Basis — die Linse von vorher
        // zählte sie als „wirkt"; jetzt ist radstand BRICHT beim Namen und nie „wirkt".
        brecher = await messen(h, { nurArt: "vehicle", bruch: "radstand" });
    });
    const tTot = taeter.zeilen.filter(tot).map(name);
    const hTot = heil.zeilen.filter(tot).map(name);
    const ratsche = ratscheLesen();
    const vT = vergleich(tTot, { tot: Object.fromEntries(Object.keys(ratsche.tot).filter((n) => n.includes(":vehicle:")).map((n) => [n, ""])) });
    const kanal = taeter.zeilen.length > 0 && tTot.length === taeter.zeilen.length && !vT.ok && hTot.length < tTot.length;
    console.log(
        `${kanal ? "✅" : "❌"} SELBST-TEST Täter (ov erreicht die Brücke nicht): ${tTot.length}/${taeter.zeilen.length} Regler der Art vehicle tot → rot (neu tot: ${vT.neu.slice(0, 3).join(", ")}${vT.neu.length > 3 ? " …" : ""}) · ohne Täter ${hTot.length} tot`
    );
    const zB = brecher.zeilen.find((z) => z.id === "radstand");
    const andereB = brecher.zeilen.filter((z) => z !== zB && bricht(z)).map(name);
    const bruchArten = zB ? new Set(zB.bricht.map((b) => (/0 Teile/.test(b) ? "leer" : /nicht-endliche/.test(b) ? "nan" : "?"))) : new Set();
    const bruchOk =
        !!zB && bricht(zB) && !zB.wirkt && bruchArten.has("leer") && bruchArten.has("nan") && !andereB.length && !heil.zeilen.some(bricht);
    console.log(
        `${bruchOk ? "✅" : "❌"} SELBST-TEST Täter (ein Regler bricht den Bau): ${zB ? name(zB) + " " + (bricht(zB) ? "BRICHT" : zB.wirkt ? "„wirkt“" : "tot") : "fehlt"} — ${zB ? zB.bricht.slice(0, 2).join(" · ") : ""} · andere BRICHT ${andereB.length} · ohne Täter BRICHT ${heil.zeilen.filter(bricht).length}`
    );
    // (d) der Ofen-Kanal (MESHFREI koerper, Q0): heil wirken die Regler über den Host-Ofen der Werkstatt; der Täter
    // „der Ofen verliert den Wert" (`_buildHumanGroup` ohne dialsOv) macht jeden koerper-Regler tot → NEU TOT gegen die
    // Ratsche; der Täter „der Mensch-Bäcker wirft bei height = max" liefert den Not-Körper → BRICHT, nie „wirkt".
    let oHeil = null,
        oOhne = null,
        oBruch = null;
    await imStamm(async (page) => {
        oHeil = await ofenMessen(page, { nurArt: "koerper" });
        oOhne = await ofenMessen(page, { nurArt: "koerper", taeter: "ohneOv" });
        const hMax = oHeil.zeilen.find((z) => z.id === "height");
        oBruch = await ofenMessen(page, { nurArt: "koerper", taeter: { bruch: "height", wert: hMax ? hMax.max : null } });
    });
    const zH = ofenZeilen(oHeil);
    const zO = ofenZeilen(oOhne);
    const zB2 = ofenZeilen(oBruch);
    const imOfen = !!oHeil.arten.koerper;
    const heilWirkt = zH.filter((z) => z.wirkt && !bricht(z)).length;
    const vO = vergleich(zO.filter(tot).map(name), ratsche);
    const ofenKanal = imOfen && zH.length > 0 && heilWirkt === zH.length && zO.filter(tot).length === zO.length && vO.neu.length === zO.length;
    console.log(
        `${ofenKanal ? "✅" : "❌"} SELBST-TEST Ofen-Kanal (koerper ${imOfen ? "im Host-Ofen" : "NICHT im Ofen"}): heil ${heilWirkt}/${zH.length} wirken · Täter (der Ofen verliert den Wert) ${zO.filter(tot).length}/${zO.length} tot → rot (neu tot: ${vO.neu.slice(0, 3).join(", ")}${vO.neu.length > 3 ? " …" : ""})`
    );
    const hB = zB2.find((z) => z.id === "height");
    const ofenBruch = !!hB && bricht(hB) && zB2.filter(bricht).length === 1 && /Not-Körper|wirft|ERROR/.test(hB.bricht.join(" "));
    console.log(`${ofenBruch ? "✅" : "❌"} SELBST-TEST Ofen-Täter (der Mensch-Bäcker wirft): ${hB ? name(hB) + " — " + hB.grund : "height fehlt"}`);
    return rein && kanal && bruchOk && ofenKanal && ofenBruch;
}

(async () => {
    if (process.argv.includes("--selftest")) {
        const ok = await selbsttest();
        process.exit(ok ? 0 : 1);
    }
    const m = await messenAlle();
    const toteZ = m.zeilen.filter(tot);
    const brechend = m.zeilen.filter(bricht);
    const oa = Object.keys(m.ofenArten).sort();
    console.log(
        `Regler-wirkt: ${m.zeilen.length} PARAMS-Zeilen · ${m.builds} Bauten über die echte Brücke (Seed ${SEED}, erste Stufe je Art) · ${m.gusse} Güsse im Host-Ofen der Werkstatt (${oa.map((a) => a + (m.ofenArten[a].baecker ? "" : " ohne Bäcker")).join(", ")})`
    );
    bericht(m.zeilen);
    for (const z of toteZ) console.log(`  TOT ${name(z)} — ${z.grund}`);
    for (const z of brechend) console.log(`❌ BRICHT ${name(z)} — ${z.grund}`);
    const budgetZ = m.zeilen.filter((z) => z.budget && z.budget.length);
    for (const z of budgetZ) console.log(`  BUDGET ${name(z)} — ${z.budget.slice(0, 2).join(" · ")}`);
    if (process.argv.includes("--messen")) {
        for (const z of m.zeilen.filter((x) => x.wirkt && !bricht(x))) console.log(`  wirkt ${name(z)} — ${z.grund}`);
        process.exit(0);
    }
    const ratsche = ratscheLesen();
    const v = vergleich(toteZ.map(name), ratsche);
    for (const n of v.neu) console.log(`❌ NEU TOT: ${n} — ${toteZ.find((z) => name(z) === n).grund}`);
    for (const n of v.geheilt) console.log(`❌ GEHEILT: ${n} wirkt jetzt — die Zeile fällt im selben Commit aus spec/vertraege/ratsche.json (reglerTot.tot), die Ratsche sinkt`);
    const soll = ratsche.soll;
    // Die Budget-Ratsche: ein Regler, dessen Rand-Wert die Stufe über ihre Budget-Zeile treibt (der Guss steht, das
    // Gesetz bricht) — neu rot, geheilt rot bis die Zeile fällt.
    const rb = budgetRatscheLesen();
    const vB = vergleich(budgetZ.map(name), { tot: rb.bruch });
    for (const n of vB.neu) console.log(`❌ NEU ÜBER BUDGET: ${n} — ${budgetZ.find((z) => name(z) === n).budget[0]}`);
    for (const n of vB.geheilt) console.log(`❌ BUDGET GEHEILT: ${n} — die Zeile fällt im selben Commit aus spec/vertraege/ratsche.json (reglerBudget.bruch)`);
    if (!v.ok || !vB.ok || brechend.length) process.exit(1);
    const wirkend = m.zeilen.filter((z) => z.wirkt && !bricht(z)).length;
    console.log(
        `✅ gate:regler-wirkt: ${wirkend}/${m.zeilen.length} Regler wirken · 0 brechen · ${toteZ.length} tot = Ratsche ${Object.keys(ratsche.tot).length} (Soll ${soll}, ${ratsche.sollQuelle}) · über Budget ${budgetZ.length} = Ratsche ${Object.keys(rb.bruch).length} (Soll ${rb.soll})`
    );
    process.exit(0);
})().catch((e) => {
    console.error("regler-wirkt-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
