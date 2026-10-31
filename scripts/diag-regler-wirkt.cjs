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
// DIE STUFEN (pipeline.K3, unten `stufenMessen`): jede Stufe jeder Budget-Art, jedes Rezept, jeder Regler-Rand über die
// echte Brücke gegen die Budget-Zeile (Ratsche reglerBudget mit Staffel) und die Reduktion je Art (L1/L0, L2/L0).
// DER WURF (1110-9, unten `wurfAus`): die NUR-WURF-Stufe richtet am Regler-Rand die Kosten-Regel des Wirts, nie ihre
// Zeile (die ist das Rezept-Maß) — die Linse nennt jede Stelle, an der die gezeigte Stufe selbst wirft, mit den Kosten,
// und ist rot, wo die Regel des Stamms von der teureren Stufe würfe.
//
//   node scripts/diag-regler-wirkt.cjs --selftest   die Linse feuert: der alte Brücken-Defekt (W-A1: ov kam nicht
//                                                   an, die Brücke reichte null) macht jeden Regler tot → rot; ein
//                                                   Regler, dessen Bau wirft bzw. NaN rechnet → BRICHT beim Namen;
//                                                   am Ofen: der Ofen verliert den Wert → koerper tot, der
//                                                   Mensch-Bäcker wirft → Not-Körper → BRICHT; WURF: die Regel
//                                                   „der Zwilling wirft immer" wirft an kathedrale von der
//                                                   teureren Stufe → rot beim Namen
//   node scripts/diag-regler-wirkt.cjs --teil=1|2|3 Messung gegen die Ratsche, je Teil (CI-Zeit ≤ 3 min): Teil 1 den
//                                                   Selbsttest und alle Arten außer dem Haus samt Ofen; das Haus (3 936 der 6 527 Bauten) teilt
//                                                   seine Regler abwechselnd in PARAMS-Reihenfolge auf Teil 2 (mit den
//                                                   Grund-Bauten) und Teil 3 (der Grund-Bau nur als Abdruck der Wirkung);
//                                                   jeder Teil richtet NUR die Ratschen-Zeilen seiner Regler (die Quote
//                                                   nach ihrem Zeugen „an <rezept> <id>=…“), die Staffel zählt die Zeilen
//                                                   der anderen Teile aus der Ratsche hinzu
//   node scripts/diag-regler-wirkt.cjs --messen     nur messen und ausgeben (kein Urteil)
// Port über REGLER_WIRKT_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4561; der Stamm des
// Ofen-Kanals über REGLER_WIRKT_OFEN_PORT, Standard Port + 1.
"use strict";
const { statikServer, starteBrowser, ROOT, hauptLauf } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const { runWithWorker } = require("./lib/asset-worker-harness.cjs");
const PORT = Number(process.env.REGLER_WIRKT_PORT || 4561);
const RATSCHE_PFAD = path.join(ROOT, "spec", "vertraege", "ratsche.json");
const SEED = 1;
const TEIL = Number((process.argv.find((a) => a.startsWith("--teil=")) || "--teil=0").slice(7));
const HAUS = "haus"; // die Art der Teile 2 und 3
// Der Teil eines Reglers (id null = der Grund-Bau der Art); ids = die PARAMS-Reihenfolge der Art.
const teilDer = (art, id, ids) => (art !== HAUS ? 1 : 2 + Math.max(0, (ids || []).indexOf(id)) % 2);
// Der Teil einer Ratschen-Zeile: Regler „kern:art:id", Quote „art:Lk" nach ihrem Zeugen (Wert „… an <rezept> <id>=…").
function zeileTeil(n, wert, ids) {
    const q = /^([^:]+):L\d+$/.exec(n);
    const z = q && /an \S+ (\w+)=/.exec(String(wert));
    return q ? teilDer(q[1], z ? z[1] : null, ids) : teilDer(n.split(":")[1], n.split(":")[2], ids);
}
// Das Urteil eines Teils: neu ist, was die ganze Ratsche nicht kennt; geheilt, was der Teil trägt und nicht mehr misst.
function vergleichTeil(jetzt, ratsche, ids, teil = TEIL) {
    const v = vergleich(jetzt, { tot: ratsche });
    const eigen = (n) => zeileTeil(n, ratsche?.[n], ids) === teil;
    return { neu: v.neu, geheilt: v.geheilt.filter(eigen), ok: !v.neu.length && !v.geheilt.some(eigen), eigen };
}
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
    const server = statikServer();
    await server.lausche(OFEN_PORT);
    const browser = await starteBrowser({ art: "null", frist: 300000 });
    try {
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(() => {
            if (window.top !== window) return;
            window.__anazhHeadlessNullRenderer = true;
        });
        await server.zeige(page, 60000);
        // Warm: die Heimat steht, die Foundry ist bereit, das Buch (Rezepte + PARAMS) ist da, die Kerne der Öfen sind
        // geladen und der Boot-Prefetch der Gattungen ist durch.
        await page.waitForFunction(
            () => {
                const f = r && r._foundry;
                return !!(f?.ready && f.recipes && f.paramsByKind && Object.keys(f.paramsByKind).length && !f._vorrat && globalThis.BAKERS_BY_KIND && window.__koerperCore && window.__tetrapodaCore);
            },
            { timeout: 240000, polling: 250 }
        );
        const out = await cb(page);
        return out;
    } finally {
        await browser.close();
        server.close();
    }
    }
// Im Stamm: je Ofen-Art die Zeilen über die echte Vorschau-Quelle. `taeter`: "ohneOv" (der Ofen verliert den Wert: der
// EINE Leser des Prägungs-Speichers `_studioPraegung` liefert nichts), {bruch: id, wert} (der Mensch-Bäcker wirft bei diesem Wert).
function ofenMessen(page, opts) {
    return page.evaluate(async (o) => {
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
                if (x.userData?.__kaltPlatzhalter) aus.platzhalter++;
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
                    if (m?.color && typeof m.color.getHexString === "function") text(m.color.getHexString());
                    if (m?.userData?.__klasse) text(m.userData.__klasse);
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
                // Der Budget-Bruch (Studio-Vertrag B2c: die Stufe über ihrer Zeile) ist ein eigenes Urteil — der Guss steht;
                // der Guss im Haupt-Faden („FADEN-UMGANGEN", streaming.K4) ebenso
                if (lvl === "ERROR" && !/^FADEN-UMGANGEN/.test(m))
                    (/^BUDGET-BRUCH /.test(String(m)) ? budget : fehler).push(String(m).slice(0, 200));
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
                wurf = String(e?.message || e).slice(0, 160);
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
        if (o.taeter === "ohneOv") r._studioPraegung = () => null;
        if (o.taeter?.bruch) {
            AnazhRealm._tierOfenMemo && AnazhRealm._tierOfenMemo.clear();
            B.koerper = function (core, id, seed, lod, ov) {
                if (ov?.dials && ov.dials[o.taeter.bruch] === o.taeter.wert) throw new Error("Täter: der Mensch-Bäcker wirft");
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
            if (Object.prototype.hasOwnProperty.call(r, "_studioPraegung")) delete r._studioPraegung;
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
// DIE WIRKUNG aus den Bauten der Stufen-Probe (unten): je Zeile von PARAMS_BY_KIND an der ersten Stufe jedes Rezepts der
// Bau-Hash ohne ov gegen den Bau mit {id: min} bzw. {id: max}; der Regler wirkt am ersten Rezept, an dem er den Hash bewegt.
// Die Täter des Selbsttests (in `stufenMessen`): `ohneOv` (der alte Brücken-Defekt W-A1: die Bau-Nachricht trägt den
// Regler-Wert nicht) und `bruch` = id eines Reglers, dessen Bau bricht (min: die Nachricht nennt ein Rezept, das das Buch
// nicht kennt — der Worker wirft, die Brücke liefert 0 Teile; max: der Wert ist Text — der Bäcker rechnet NaN).
function wirkenAus(st) {
    const zeilen = [];
    for (const [art, A] of Object.entries(st.arten))
        for (const d of A.params) {
            const z = {
                kern: A.kern,
                art,
                id: d.id,
                d,
                rezepte: A.rezepte,
                lod: A.lod,
                kanal: "build-asset",
                wirkt: false,
                grund: "",
                an: null,
                bricht: [],
            };
            for (const p of A.rezepte) {
                const b = st.je.get(p + "|null|" + A.lod).bau;
                // Der Grund-Bau einer Mesh-Art bricht: ein benannter Fehler an jeder Zeile, die ihn braucht.
                if (bauBruch(b)) {
                    z.bricht.push(`Grund-Bau ${p}: ${bauBruch(b)}`);
                    continue;
                }
                for (const wert of [d.min, d.max]) {
                    const k = st.je.get(p + "|" + [d.id, wert] + "|" + A.lod);
                    if (k && bauBruch(k.bau)) z.bricht.push(`${d.id}=${wert} an ${p}: ${bauBruch(k.bau)}`);
                    else if (k && k.bau.hash !== b.hash && !z.wirkt) [z.wirkt, z.an] = [true, p];
                }
            }
            z.grund = z.bricht.length
                ? "BRICHT — " + z.bricht.slice(0, 2).join(" · ") + (z.bricht.length > 2 ? " …" : "")
                : z.wirkt
                  ? "wirkt an " + z.an
                  : !z.rezepte.length
                    ? "kein Rezept der Art im Buch"
                    : "bewegt den Bau an keinem der " +
                      z.rezepte.length +
                      " Rezepte (min " +
                      d.min +
                      " · max " +
                      d.max +
                      ")";
            zeilen.push(z);
        }
    return zeilen;
    }
// ── DIE STUFEN-PROBE (pipeline.K3, Kosten am Asset, Studio-Vertrag B2c): jede Stufe jeder Art mit Budget-Zeile, je Rezept
// ohne ov und an jedem Regler-Rand (min, max) über die echte Brücke — Dreiecke und Befehle gegen ihre Zeile
// (PORTAL_RENDER_CONFIG.lod.budget[art][stufe]); dazu die REDUKTION je Art: das Höchste über Rezepte × Rand von
// tris(L1)/tris(L0) und tris(L2)/tris(L0) gegen STUFEN_QUOTE. Ein Rand, der den Wert des Rezepts trägt (s/fx), ist der
// Grund-Bau und fällt aus der Liste. Selbsttest-Täter `ohneReduktion`: die Art baut jede Stufe als ihre erste.
const STUFEN_QUOTE = { 1: 0.5, 2: 0.15 };
async function stufenMessen(h, opts) {
    const o = opts || {};
    const env = await h.getData("get-book");
    const [buch, pbk, rc, kerne] = [env.book || {}, env.paramsByKind || {}, env.renderConfig || {}, kernVonArt()];
    const plan = [];
    const arten = {};
    for (const art of Object.keys(pbk).sort()) {
        const B = budgetVonArt(rc, art);
        if (!B || (o.ohneArten || []).includes(art) || (o.nurArt && art !== o.nurArt)) continue;
        const stufen = Object.keys(B)
            .filter((k) => /^\d+$/.test(k))
            .map(Number);
        const lod = Math.min(...stufen);
        const s = B[lod].schatten;
        const rezepte = Object.keys(buch)
            .filter((id) => buch[id] && buch[id].kind === art && (!o.nurRezept || o.nurRezept === id))
            .sort();
        // der Teil (--teil): seine Regler; den Grund-Bau trägt ein Teil ganz, die anderen nur als Abdruck der Wirkung
        const ids = pbk[art].map((d) => d.id);
        const grund = !o.grund || o.grund(art, ids);
        arten[art] = {
            lod,
            kern: kerne[art] || "phyto",
            ids,
            params: o.regler ? pbk[art].filter((d) => o.regler(art, d.id, ids)) : pbk[art],
            rezepte,
            s: Number.isInteger(s) && s !== lod && B[s] && B[s].nurWurf === true ? s : null,
            quote: {},
        };
        for (const p of rezepte) {
            const eigen = Object.assign({}, buch[p].s, buch[p].fx);
            const raender = [
                null,
                ...arten[art].params
                    .flatMap((d) => [
                        [d.id, d.min],
                        [d.id, d.max],
                    ])
                    .filter((r) => eigen[r[0]] !== r[1]),
            ];
            for (const r of raender)
                for (const st of o.nurErste || (!r && !grund) ? [lod] : stufen)
                    plan.push({ art, p, r, s: st, zeile: B[st], lod: o.ohneReduktion === art ? lod : st, nurAbdruck: !r && !grund });
        }
    }
    const msg = (pl) => {
        const m = { presetId: pl.p, seed: SEED, lod: pl.lod };
        if (pl.r && !o.ohneOv) m.ov = { [pl.r[0]]: o.bruch !== pl.r[0] ? pl.r[1] : "kein-wert" };
        if (pl.r && o.bruch === pl.r[0] && pl.r[1] === pbk[pl.art].find((d) => d.id === pl.r[0]).min)
            m.presetId = "__taeter_unbekannt__";
        if (o.leereStufe === pl.s) m.presetId = "__taeter_unbekannt__";
        return m;
    };
    // der Bau-Abdruck (die Wirkung) an der ersten Stufe, die Teile (der Wurf) an jeder
    const erste = new Set();
    const liste = plan.map((pl) => {
        const m = msg(pl);
        if (pl.s === arten[pl.art].lod) erste.add(m);
        return m;
    });
    const res = await h.kostenListe(liste, (c) => erste.has(c), true);
    const [bruch, leer] = [{}, []];
    const je = new Map();
    plan.forEach((pl, i) => {
        pl.k = res[i] || {};
        je.set(pl.p + "|" + pl.r + "|" + pl.s, pl.k);
        if (pl.nurAbdruck) return;
        // eine Stufe ohne Teile hält jede Zeile und zeigt nichts: immer rot, ohne Ratsche
        if (!(pl.k.teile && pl.k.teile.length)) leer.push(`${pl.art} ${pl.p}${pl.r ? " " + pl.r.join("=") : ""} L${pl.s}`);
        // die Dreiecke der NUR-WURF-Stufe sind das Rezept-Maß (Entscheidung A): am Regler-Rand richtet der WURF
        const zu = ["tris", "draws"].filter(
            (f) =>
                Number.isFinite(pl.zeile[f]) && !(pl.k[f] <= pl.zeile[f]) && !(f === "tris" && pl.r && pl.zeile.nurWurf)
        );
        const n = `${kerne[pl.art] || "phyto"}:${pl.art}:${pl.r ? pl.r[0] : "(Rezept)"}`;
        if (zu.length)
            (bruch[n] = bruch[n] || []).push(
                `${pl.r ? pl.r.join("=") + " an " : ""}${pl.p} L${pl.s}: ${zu.map((f) => `${f} ${pl.k[f]} > ${pl.zeile[f]}`).join(", ")}`
            );
    });
    for (const pl of plan) {
        const t0 = je.get(pl.p + "|" + pl.r + "|0")?.tris;
        const q = arten[pl.art].quote;
        if (pl.s in STUFEN_QUOTE && !pl.nurAbdruck && !pl.zeile.nurWurf && t0 > 0 && !(q[pl.s] && q[pl.s].q >= pl.k.tris / t0))
            q[pl.s] = { q: pl.k.tris / t0, wo: pl.p + (pl.r ? " " + pl.r.join("=") : "") };
    }
    return { bruch, leer, arten, plan, je, builds: plan.length };
}
// Die Quoten über ihrem Soll beim Namen (art:L1 · art:L2), Wert = Quote und Ort.
const quoteUeber = (st) =>
    Object.fromEntries(
        Object.entries(st.arten).flatMap(([art, a]) =>
            Object.entries(a.quote)
                .filter(([s, v]) => v.q > STUFEN_QUOTE[s])
                .map(([s, v]) => [`${art}:L${s}`, `${v.q.toFixed(3)} an ${v.wo}`])
        )
    );
// ── DIE WURF-PROBE (1110-9, docs/studio-vertrag.md N5): DIE KOSTEN-REGEL DES WIRTS am Regler-Rand. Wirft die erste Stufe
// einer Art über ihre NUR-WURF-Stufe (B2c `schatten` → eine Stufe mit `nurWurf`), nimmt der Wirt deren Zwilling nur, wo er
// weniger Dreiecke wirft als die werfenden Teile der Stufe selbst (`_wurfVonBilligerer` in `_foundryFlattenFor`; das
// Wurf-Recht je Teil `_teilWirft`). Die Probe liest BEIDE Regeln aus der Quelle des Stamms und richtet je Rezept × Rand
// das Paar aus den Bauten der Stufen-Probe (erste Stufe, NUR-WURF-Stufe; die volle Regler-Hülle jeder Art): die Regel wirft
// nie von der teureren Stufe. Die Zeile der NUR-WURF-Stufe ist das Rezept-Maß (gate:asset-contract), am Regler-Rand
// richtet die Regel — die Probe nennt jede Stelle, an der die Stufe selbst wirft, mit ihren Kosten.
const stammLib = require("./lib/stamm.cjs");
// Die Methode am NAMEN (gate:apparat Klinge 3), ihre Parameter liest die Probe aus dem Kopf — nie eine eigene Liste.
function statischeMethode(src, name) {
    const i = stammLib.kopf(src, name);
    if (i < 0) throw new Error("im Stamm nicht gefunden: " + name);
    const p = src.indexOf("(", i);
    const args = src.slice(p + 1, src.indexOf(")", p));
    const rumpf = stammLib.rumpf(src, name).slice(1, -1); // der EINE Rumpf-Schneider (scripts/lib/stamm.cjs)
    return { rumpf, fn: new Function(args, rumpf) };
}
function stammRegel() {
    const s = stammLib.text(ROOT);
    return {
        teilWirft: statischeMethode(s, "_teilWirft").fn,
        vonBilligerer: statischeMethode(s, "_wurfVonBilligerer").fn,
    };
}
function budgetVonArt(rc, art) {
    const L = rc?.lod || {};
    if (L.budget?.[art]) return L.budget[art];
    for (const k in L.zusatzBudget || {}) if (L.zusatzBudget[k]?.[art]) return L.zusatzBudget[k][art];
    return null;
}
function wurfAus(st, regel) {
    const kosten = (teile) => (teile || []).reduce((a, t) => a + (regel.teilWirft(t) ? t.tris : 0), 0);
    const zeilen = [];
    for (const pl of st.plan) {
        const A = st.arten[pl.art];
        if (A.s == null || pl.s !== A.lod || pl.nurAbdruck) continue;
        const a = pl.k,
            b = st.je.get(pl.p + "|" + pl.r + "|" + A.s) || {};
        const bruch =
            !a.teile || !a.teile.length
                ? "die Stufe " + A.lod + " baut 0 Teile"
                : !b.teile || !b.teile.length
                  ? "die NUR-WURF-Stufe " + A.s + " baut 0 Teile"
                  : null;
        zeilen.push({
            art: pl.art,
            p: pl.p,
            lod: A.lod,
            s: A.s,
            wo: pl.p + (pl.r ? " " + pl.r.join("=") : ""),
            eigen: kosten(a.teile),
            zwilling: kosten(b.teile),
            bruch,
            ueberZeile: !!b.budgetBruch,
        });
    }
    const arten = Object.keys(st.arten).filter((art) => st.arten[art].s != null);
    return {
        zeilen: wurfRichten(zeilen, regel),
        arten: arten.map((art) => `${art} L${st.arten[art].lod}→${st.arten[art].s}`),
        builds: 0,
    };
}
// Die Regel des Stamms entscheidet je Paar, wer wirft (der Selbsttest richtet dieselben Bauten mit dem Täter neu).
function wurfRichten(zeilen, regel) {
    return zeilen.map((z) => {
        const von = regel.vonBilligerer(z.eigen, z.zwilling);
        return Object.assign({}, z, { von, wirft: von === "zwilling" ? z.zwilling : z.eigen });
    });
}
// Das Urteil (rein): rot, wo die Regel von der teureren Stufe wirft oder eine Stufe bricht.
function wurfUrteil(zeilen) {
    const rot = [];
    for (const z of zeilen) {
        if (z.bruch) rot.push(`${z.art} ${z.wo}: ${z.bruch}`);
        else if (z.von !== "zwilling" && z.von !== "selbst") rot.push(`${z.art} ${z.wo}: die Regel antwortet „${z.von}"`);
        else if (z.wirft > Math.min(z.eigen, z.zwilling))
            rot.push(`${z.art} ${z.wo}: wirft ${z.wirft} Dreiecke von der teureren Stufe (${z.von === "zwilling" ? "Zwilling " + z.zwilling + " ≥ Stufe " + z.lod + " " + z.eigen : "Stufe " + z.lod + " " + z.eigen + " > Zwilling " + z.zwilling})`);
    }
    return rot;
}
const tausend = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
function wurfBericht(w) {
    const selbst = w.zeilen.filter((z) => !z.bruch && z.von === "selbst");
    const ueber = w.zeilen.filter((z) => !z.bruch && z.ueberZeile);
    console.log(
        `WURF (Kosten-Regel des Wirts, N5): ${w.zeilen.length} Bauten-Paare über die Regler-Hülle (${w.arten.join(", ")}) · ${w.builds} Bauten · die Stufe wirft selbst an ${selbst.length} · die NUR-WURF-Stufe über ihrer Zeile an ${ueber.length}`
    );
    for (const z of selbst)
        console.log(`  WURF ${z.art} ${z.wo}: Stufe ${z.lod} wirft (${tausend(z.eigen)} Dreiecke; der Zwilling trüge ${tausend(z.zwilling)})`);
    for (const z of ueber.filter((x) => x.von === "zwilling"))
        console.log(`  WURF ${z.art} ${z.wo}: der Zwilling wirft (${tausend(z.zwilling)} über der Zeile, billiger als Stufe ${z.lod} mit ${tausend(z.eigen)})`);
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
    const ofen = TEIL === 1 ? await imStamm((page) => ofenMessen(page, {})) : { zeilen: [], arten: {} };
    let stufen = null;
    await runWithWorker(PORT, async (h) => {
        const imTeil = { regler: (art, id, ids) => teilDer(art, id, ids) === TEIL, grund: (art, ids) => teilDer(art, null, ids) === TEIL };
        stufen = await stufenMessen(h, TEIL === 1 ? { ohneArten: [...Object.keys(ofen.arten), HAUS] } : { nurArt: HAUS, ...imTeil });
    });
    const gusse = ofen.zeilen.reduce((s, z) => s + z.gusse, 0);
    return {
        zeilen: [...wirkenAus(stufen), ...ofenZeilen(ofen)],
        builds: stufen.builds,
        gusse,
        ofenArten: ofen.arten,
        wurf: wurfAus(stufen, stammRegel()),
        stufen,
    };
    }
const name = (z) => z.kern + ":" + z.art + ":" + z.id;
// Drei Urteile je Zeile: wirkt · bricht (ein Bau mit diesem Regler ist gebrochen — immer rot, nie Ratsche) · tot.
const bricht = (z) => z.bricht.length > 0;
const tot = (z) => !z.wirkt && !bricht(z);
// Das Urteil gegen die Ratsche (rein, ohne Browser): neu tot = rot, geheilt = rot bis die Zeile fällt.
function vergleich(tot, ratsche) {
    const bekannt = new Set(Object.keys(ratsche?.tot || {}));
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
    // Der Teil richtet nur seine Zeilen: Teil 1 ohne die Haus-Zeilen grün (ungefiltert hießen sie „geheilt"), Teil 2 trägt
    // doppel, Teil 3 storeys und den Zeugen der Quote haus:L1 — fällt er dort, ist Teil 3 rot, Teil 2 misst sie nie neu.
    const rt = { "fachwerk:haus:doppel": "", "fachwerk:haus:storeys": "", "porta:gate:glow": "", "haus:L1": "0.544 an pueblo storeys=2" };
    const ids = ["doppel", "storeys"];
    const t = [
        vergleichTeil(["porta:gate:glow"], rt, ids, 1).ok,
        vergleichTeil(["fachwerk:haus:doppel", "haus:L1"], rt, ids, 2).ok,
        vergleichTeil(["fachwerk:haus:storeys", "haus:L1"], rt, ids, 3).ok,
        !vergleichTeil(["fachwerk:haus:storeys"], rt, ids, 3).ok,
        !vergleich(["porta:gate:glow"], { tot: rt }).ok,
    ];
    const teile = t.every(Boolean);
    console.log(
        `${rein && teile ? "✅" : "❌"} SELBST-TEST Urteil: gleich grün · neu tot rot (${v2.neu}) · geheilt rot bis die Zeile fällt (${v3.geheilt}) · je Teil nur seine Zeilen (${t.map((x) => (x ? "✓" : "✗")).join("")}: Teil 1 · 2 · 3 grün, der Zeuge fällt in Teil 3 rot, ungefiltert rot)`
    );
    // (b) der Täter am echten Kanal: die Brücke bekommt den Regler-Wert nicht (der W-A1-Defekt) — jede Zeile der Art
    // vehicle wird tot und beim Namen genannt; ohne Täter wirkt dieselbe Art.
    let taeter = null,
        heil = null,
        brecher = null;
    await runWithWorker(PORT, async (h) => {
        taeter = { zeilen: wirkenAus(await stufenMessen(h, { nurArt: "vehicle", nurErste: true, ohneOv: true })) };
        heil = { zeilen: wirkenAus(await stufenMessen(h, { nurArt: "vehicle", nurErste: true })) };
        // (c) der Täter „ein Regler bricht den Bau" am echten Kanal: radstand min → der Worker wirft (0 Teile),
        // max → Text statt Zahl (NaN-Bau). Beide Bauten haben einen anderen Hash als die Basis — die Linse von vorher
        // zählte sie als „wirkt"; jetzt ist radstand BRICHT beim Namen und nie „wirkt".
        brecher = {
            zeilen: wirkenAus(await stufenMessen(h, { nurArt: "vehicle", nurErste: true, bruch: "radstand" })),
        };
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
    // „der Ofen verliert den Wert" (`_studioPraegung` liefert nichts) macht jeden koerper-Regler tot → NEU TOT gegen die
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
    // (e) DIE WURF-PROBE am Tor kathedrale (Grund-Bau und jeder Rand): die Regel des Stamms wirft nie von der teureren
    // Stufe; der Täter „der Zwilling wirft immer" (der Stand vor der Kosten-Regel, von Hand neben die Regel gesetzt) wirft am
    // Regler-Rand von der teureren Stufe (orders=9: 20 308 gegen 16 900) → rot beim Namen (dieselben Bauten, neu gerichtet).
    let wHeil = null,
        sHeil = null,
        sTaeter = null,
        sLeer = null;
    await runWithWorker(PORT, async (h) => {
        wHeil = wurfAus(await stufenMessen(h, { nurArt: "gate", nurRezept: "kathedrale" }), stammRegel());
        // (f) DIE STUFEN-PROBE: der Täter „die Stufe reduziert nicht" (die Ausstattung baut jede Stufe als L0) ist rot beim
        // Namen — die Stufe 1 über ihrer Zeile und ihre Quote über dem Soll; ohne Täter hält jede Stufe ihr Rezept-Maß.
        sHeil = await stufenMessen(h, { nurArt: "ausstattung" });
        sTaeter = await stufenMessen(h, { nurArt: "ausstattung", ohneReduktion: "ausstattung" });
        sLeer = await stufenMessen(h, { nurArt: "ausstattung", nurRezept: "brunnen", leereStufe: 1 });
    });
    const sT = (sTaeter.bruch["fachwerk:ausstattung:(Rezept)"] || []).filter((b) => / L1: tris/.test(b));
    const qT = quoteUeber(sTaeter)["ausstattung:L1"];
    const leerOk = !sHeil.leer.length && sLeer.leer.includes("ausstattung brunnen L1");
    const stufenOk =
        !sHeil.bruch["fachwerk:ausstattung:(Rezept)"] && !quoteUeber(sHeil)["ausstattung:L1"] && sT.length > 0 && !!qT && leerOk;
    console.log(
        `${stufenOk ? "✅" : "❌"} SELBST-TEST STUFEN (Täter: die Stufe reduziert nicht): ${sT.length} Rezepte über der Zeile L1 (${sT[0] || "—"}) · Quote ausstattung:L1 ${qT || "im Soll"} · ohne Täter ${Object.keys(sHeil.bruch).length} Regler über Budget, kein Rezept · Täter „die Stufe 1 liefert nichts" leer: ${sLeer.leer.slice(0, 2).join(", ") || "—"}`
    );
    const wTaeter = wurfRichten(wHeil.zeilen, { teilWirft: stammRegel().teilWirft, vonBilligerer: () => "zwilling" });
    const rotHeil = wurfUrteil(wHeil.zeilen);
    const rotTaeter = wurfUrteil(wTaeter);
    const wurfOk = wHeil.zeilen.length > 0 && !rotHeil.length && rotTaeter.length > 0;
    console.log(
        `${wurfOk ? "✅" : "❌"} SELBST-TEST WURF (Täter: der Zwilling wirft immer): heil ${wHeil.zeilen.length} Paare, ${rotHeil.length} rot · Täter ${rotTaeter.length} rot (${rotTaeter.slice(0, 2).join(" · ")})`
    );
    return rein && teile && kanal && bruchOk && ofenKanal && ofenBruch && wurfOk && stufenOk;
    }
hauptLauf(async () => {
    // Der Selbsttest läuft EINMAL: vor Teil 1 (alle Teile ein Befehl bis auf --teil) oder allein (--selftest).
    if (process.argv.includes("--selftest") || TEIL === 1) {
        const ok = await selbsttest();
        if (!ok || TEIL !== 1) process.exit(ok ? 0 : 1);
    }
    if (![1, 2, 3].includes(TEIL)) throw new Error(`--teil=${TEIL}: erlaubt 1, 2 oder 3`);
    const m = await messenAlle();
    const toteZ = m.zeilen.filter(tot);
    const brechend = m.zeilen.filter(bricht);
    const oa = Object.keys(m.ofenArten).sort();
    console.log(
        `Regler-wirkt Teil ${TEIL} (${TEIL === 1 ? "ohne " + HAUS : HAUS + " Regler " + m.zeilen.map((z) => z.id).join(",")}): ${m.zeilen.length} PARAMS-Zeilen · ${m.builds} Bauten über die echte Brücke (Seed ${SEED}, jede Stufe — die Wirkung an der ersten) · ${m.gusse} Güsse im Host-Ofen der Werkstatt (${oa.map((a) => a + (m.ofenArten[a].baecker ? "" : " ohne Bäcker")).join(", ")})`
    );
    bericht(m.zeilen);
    for (const z of toteZ) console.log(`  TOT ${name(z)} — ${z.grund}`);
    for (const z of brechend) console.log(`❌ BRICHT ${name(z)} — ${z.grund}`);
    const budget = Object.assign(
        {},
        m.stufen.bruch,
        ...m.zeilen.filter((z) => z.budget && z.budget.length).map((z) => ({ [name(z)]: z.budget }))
    );
    console.log(
        `STUFEN (B2c, pipeline.K3): ${m.stufen.builds} Bauten (jede Stufe × Rezept × Regler-Rand) · über Budget ${Object.keys(budget).length} · Reduktion je Art ${Object.entries(
            m.stufen.arten
        )
            .map(
                ([a, x]) =>
                    a +
                    " " +
                    Object.entries(x.quote)
                        .map(([s, v]) => "L" + s + "/L0 " + v.q.toFixed(2))
                        .join(" ")
            )
            .join(" · ")}`
    );
    for (const n of Object.keys(budget))
        console.log(`  BUDGET ${n} (${budget[n].length}) — ${budget[n].slice(0, 2).join(" · ")}`);
    wurfBericht(m.wurf);
    const wurfRot = wurfUrteil(m.wurf.zeilen);
    for (const r of wurfRot.slice(0, 12)) console.log(`❌ WURF ${r}`);
    if (process.argv.includes("--messen")) {
        for (const z of m.zeilen.filter((x) => x.wirkt && !bricht(x))) console.log(`  wirkt ${name(z)} — ${z.grund}`);
        process.exit(0);
    }
    const ratsche = ratscheLesen();
    const ids = m.stufen.arten[HAUS]?.ids;
    const v = vergleichTeil(toteZ.map(name), ratsche.tot, ids);
    for (const n of v.neu) console.log(`❌ NEU TOT: ${n} — ${toteZ.find((z) => name(z) === n).grund}`);
    for (const n of v.geheilt) console.log(`❌ GEHEILT: ${n} wirkt jetzt — die Zeile fällt im selben Commit aus spec/vertraege/ratsche.json (reglerTot.tot), die Ratsche sinkt`);
    const soll = ratsche.soll;
    // Die Budget-Ratsche: ein Regler, dessen Rand-Wert die Stufe über ihre Budget-Zeile treibt (der Guss steht, das
    // Gesetz bricht) — neu rot, geheilt rot bis die Zeile fällt.
    const rb = budgetRatscheLesen();
    const vB = vergleichTeil(Object.keys(budget), rb.bruch, ids);
    for (const n of vB.neu) console.log(`❌ NEU ÜBER BUDGET: ${n} — ${budget[n][0]}`);
    for (const n of vB.geheilt) console.log(`❌ BUDGET GEHEILT: ${n} — die Zeile fällt im selben Commit aus spec/vertraege/ratsche.json (reglerBudget.bruch)`);
    // Die Staffel (pipeline.K3): die Ratsche liegt höchstens auf ihr — die Klasse fällt im Rezept, nie am Regler-Rand.
    const anderer = Object.keys(rb.bruch).filter((n) => !vB.eigen(n)).length;
    const ueberStaffel = Object.keys(budget).length + anderer > rb.staffel;
    if (ueberStaffel)
        console.log(
            `❌ STAFFEL: ${Object.keys(budget).length} Regler über Budget + ${anderer} in den anderen Teilen (Ratsche) > Staffel ${rb.staffel} — ${Object.keys(budget).join(", ")}`
        );
    // Die Reduktion je Art (Staffel 2): eine Stufe über ihrer Quote ist beim Namen in der Ratsche reglerBudget.quote.
    const quote = quoteUeber(m.stufen);
    const vQ = vergleichTeil(Object.keys(quote), rb.quote, ids);
    for (const n of vQ.neu)
        console.log(
            `❌ NEU ÜBER DER QUOTE: ${n} ${quote[n]} (Soll L1/L0 ≤ ${STUFEN_QUOTE[1]}, L2/L0 ≤ ${STUFEN_QUOTE[2]})`
        );
    for (const n of vQ.geheilt)
        console.log(
            `❌ QUOTE GEHEILT: ${n} — die Zeile fällt im selben Commit aus spec/vertraege/ratsche.json (reglerBudget.quote)`
        );
    for (const l of m.stufen.leer) console.log(`❌ LEER: ${l} baut 0 Teile`);
    if (!v.ok || !vB.ok || !vQ.ok || ueberStaffel || m.stufen.leer.length || brechend.length || wurfRot.length) process.exit(1);
    const wirkend = m.zeilen.filter((z) => z.wirkt && !bricht(z)).length;
    console.log(
        `✅ gate:regler-wirkt Teil ${TEIL}: ${wirkend}/${m.zeilen.length} Regler wirken · 0 brechen · ${toteZ.length} tot = Ratsche ${Object.keys(ratsche.tot).filter(v.eigen).length} von ${Object.keys(ratsche.tot).length} (Soll ${soll}, ${ratsche.sollQuelle}) · über Budget ${Object.keys(budget).length} = Ratsche ${Object.keys(rb.bruch).length - anderer} von ${Object.keys(rb.bruch).length} (Staffel ${rb.staffel}, Soll ${rb.soll}) · über der Quote ${Object.keys(quote).length} · WURF ${m.wurf.zeilen.length} Paare, nie von der teureren Stufe`
    );
    process.exit(0);
});