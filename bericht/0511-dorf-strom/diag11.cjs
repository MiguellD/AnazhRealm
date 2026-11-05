// Fahrt-Probe mit Baum-Diagnose: je Baum, der nicht fertig eintritt, sein Zustand; je Export seine Dauer und Bahn-Last
const path = require("path"), fs = require("fs"), { spawnSync } = require("child_process");
const ST = "C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination/meisterkarte-quelle/punkte/stationen/";
const src = fs.readFileSync(ST + "g6.js", "utf8");
const a = src.indexOf("async function fahrtProbe(");
const b = src.indexOf("\n}\n", a) + 2;
let fahrtSrc = src.slice(a, b);
const ersetze = (alt, neu) => { if (!fahrtSrc.includes(alt)) throw new Error("Anker fehlt: " + alt); fahrtSrc = fahrtSrc.replace(alt, neu); };
ersetze('out.push([ort(e.position.x, e.position.z) + ":" + kl, kl, da, fertig]);', 'out.push([ort(e.position.x, e.position.z) + ":" + kl, kl, da, fertig, e, soll, d]);');
ersetze("for (const [key, k, da, fertig] of bedarf()) {", "for (const [key, k, da, fertig, E, SOLL, DD] of bedarf()) {");
ersetze("if (!ev) ein.set(key, { k, ok: !!fertig, t: jetzt, spaet: fertig ? 0 : null });", "if (!ev) { ein.set(key, { k, ok: !!fertig, t: jetzt, spaet: fertig ? 0 : null }); if (!fertig && E && k === 'baum' && window.__BD.length < 4000) window.__BD.push({ x: Math.round(E.position.x), z: Math.round(E.position.z), d: Math.round(DD), soll: SOLL, inst: !!E.instanced, lod: E._lodLevel, sp: E._lodSpecies, alter: E.__geb ? Math.round(jetzt - E.__geb) : null, weg: Math.round(weg), urt: E.__urt === undefined ? 'nie' : (window.__TK() - E.__urt < 60 ? '<60' : window.__TK() - E.__urt < 600 ? '<600' : '>600'), st: (() => { const f = r._foundry; const pr = r._foundryPresetForEntry(E); if (!pr) return 'keinPreset'; if (!r._foundryPresetIsTree(pr)) return 'keinBaum'; const M = {}; const g = r._foundryGestaltFor(E, pr); if (g == null) { const wahr = r._forestGesetzWahr(); const plan = r._waldPlanSteht(E.position.x, E.position.z); return 'gestaltNull:wahr' + (wahr ? 1 : 0) + ':plan' + (plan ? 1 : 0) + ':ortWaehlt' + (A._ortWaehlt(pr) ? 1 : 0); } const st2 = r._foundryHoehenStufe(pr); const ov = r._artifactStudioOv(E); const key = r._foundryKoerperKey(pr, g, st2, ov); return 'g:' + (f.hoehen && f.hoehen.get(key) > 0 ? 'hoehe' : 'keineHoehe') + (ov ? ':ov' : '') + (f.zuege && f.zuege.has(key) ? ':zug' : '') + (f.requested && f.requested.has(key) ? ':req' : '') + (f.hoeheFehlt && f.hoeheFehlt.has(key) ? ':fehlt' : ''); })() }); }");
const g1 = require(ST + "g1.js");
const st = require(ST + "g6.js");
const k1 = st.find((x) => x.kriterium === "streaming.K1"), k2 = st.find((x) => x.kriterium === "streaming.K2");
async function diagProbe(r, T, o, G) {
    const s = r.state;
    window.__BD = []; let TK = 0; const SR = { ruht: 0, geht: 0 }; window.__SR = SR; const su = r._archStufeUrteil.bind(r); r._archStufeUrteil = function (e, ...a) { if (e) e.__urt = TK; return su(e, ...a); }; const sr = r._standRuht.bind(r); r._standRuht = function (k, ...a) { const v = sr(k, ...a); if (k === 'archLod') v ? SR.ruht++ : SR.geht++; return v; }; const gl0 = r._gameLoopTick.bind(r); r._gameLoopTick = function (n) { TK++; return gl0(n); }; window.__TK = () => TK;
    const EX = [];
    const rq = r._foundryRequestSettlement.bind(r);
    r._foundryRequestSettlement = function (dp, kopf) { const t = performance.now(); const p = rq(dp, kopf); const x = { t0: Math.round(t), nH: dp && dp.nH, kopf: !!kopf, warte: ((r._foundry || {}).warte || []).length }; EX.push(x); p.then(() => (x.ms = Math.round(performance.now() - t))); return p; };
    // Geburt je Eintrag
    const seen = new WeakSet();
    const gl = r._gameLoopTick.bind(r); const SAMP = []; let tk = 0;
    r._gameLoopTick = function (now) { const x = gl(now); if (++tk % 150 === 0) { const f = r._foundry || {}; const W = f.warte || []; const je = {}; for (const a of W) { const m = a.msg || {}; const k = (m.type || '?') + ':' + String(m.presetId || m.preset || '').split('_')[0]; je[k] = (je[k] || 0) + 1; } SAMP.push({ tk, p: [Math.round(s.playerMesh.position.x), Math.round(s.playerMesh.position.z)], warte: W.length, pending: f.pending ? f.pending.size : -1, ingest: (r._foundryIngestQueue || []).length, je }); } for (const e of s.architectures || []) if (e && !seen.has(e)) { seen.add(e); e.__geb = performance.now(); } return x; };
    for (const e of s.architectures || []) if (e) { seen.add(e); e.__geb = 0; }
    const e = await (FAHRT_PROBE)(r, T, o, G);
    const B = []; for (const x of window.__BD.slice(0, 600)) { const E = (s.architectures || []).find((q) => q && q.position && Math.round(q.position.x) === x.x && Math.round(q.position.z) === x.z && q._lodSpecies); if (!E) { B.push('weg'); continue; } const f = r._foundry; const pr = r._foundryPresetForEntry(E); const g = pr ? r._foundryGestaltFor(E, pr) : null; if (g == null) { B.push('gestaltNull:' + pr); continue; } const st2 = r._foundryHoehenStufe(pr); const ov = r._artifactStudioOv(E); const key = r._foundryKoerperKey(pr, g, st2, ov); B.push((f.hoehen && f.hoehen.get(key) > 0 ? 'hoehe' : 'keineHoehe') + (ov ? ':ov' : '') + (f.zuege && f.zuege.has(key) ? ':zug' : '') + (f.requested && f.requested.has(key) ? ':req' : '') + (f.hoeheFehlt && f.hoeheFehlt.has(key) ? ':fehlt' : '') + (r._foundryCacheGet(key) !== undefined ? ':cache' : '')); } const BS = {}; for (const b of B) BS[b] = (BS[b] || 0) + 1; e.diag = { SR: window.__SR,  bs: BS, samp: SAMP, ex: EX, bd: window.__BD, helfer: ((r._foundry || {}).helfer || []).length, imFlug: r.constructor.FOUNDRY_IM_FLUG, v0: r._bedarfFuss() };
    return e;
}
const probeSrc = String(diagProbe).replace("(FAHRT_PROBE)", "(" + fahrtSrc + ")");
const befehl = g1.weltProbe.befehl([["fahrt", probeSrc, { sek: 60, ort: "dorf" }]]);
const aus = path.join(__dirname, "fahrt11-" + (process.argv[2] || "x") + ".json");
const port = process.argv[3] || "7795";
const bb = befehl.map((x) => x.replace("{AUS}", aus).replace("{PORT}", port));
const r = spawnSync(bb[0], bb.slice(1), { cwd: process.cwd(), encoding: "utf8", maxBuffer: 1 << 28, timeout: 1500000 });
if (!fs.existsSync(aus)) { console.log(r.stdout.slice(-3000), r.stderr.slice(-3000)); process.exit(1); }
const j = JSON.parse(fs.readFileSync(aus, "utf8"));
console.log("FEHLER", JSON.stringify(j.fehler));
const lauf = { stdout: r.stdout };
console.log("K1", JSON.stringify(k1.urteil(j, lauf)));
console.log("K2", JSON.stringify(k2.urteil(j, lauf)));
const e = j.proben.fahrt;
if (e && e.diag) {
    const d = e.diag;
    console.log("HELFER", d.helfer, "IM_FLUG", d.imFlug, "v0", d.v0);
    console.log("BAUM-STATUS am Ende", JSON.stringify(d.bs)); console.log("SCHLANGE", JSON.stringify(d.samp.filter((_x, i) => i % 3 === 0)));
    const bd = d.bd;
    const grp = {};
    for (const x of bd) { const k = "soll" + x.soll + "/lod" + x.lod + "/inst" + (x.inst ? 1 : 0) + "/alt" + (x.alter === null ? "?" : x.alter < 0 ? "neg" : x.alter < 2000 ? "<2s" : x.alter < 10000 ? "<10s" : ">10s"); grp[k] = (grp[k] || 0) + 1; }
    console.log("BAUM-NICHT n", bd.length, JSON.stringify(grp));
    const dd = {}; for (const x of bd) { const k = Math.floor(x.d / 25) * 25; dd[k] = (dd[k] || 0) + 1; } console.log("BAUM-NICHT je Abstand", JSON.stringify(dd));
    const ww = {}; for (const x of bd) { const k = Math.floor(x.weg / 100) * 100; ww[k] = (ww[k] || 0) + 1; } console.log("BAUM-NICHT je Weg", JSON.stringify(ww));
    const SS = {}; for (const x of bd) SS[x.st] = (SS[x.st] || 0) + 1; console.log("STATUS beim Eintritt", JSON.stringify(SS)); const UU = {}; for (const x of bd) UU[x.urt] = (UU[x.urt] || 0) + 1; console.log("LETZTES URTEIL (Takte)", JSON.stringify(UU), "Stand-Wache", JSON.stringify(d.SR)); console.log("BEISPIEL", JSON.stringify(bd.slice(0, 12)));
}
