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
ersetze("if (!ev) ein.set(key, { k, ok: !!fertig, t: jetzt, spaet: fertig ? 0 : null });", "if (!ev) { ein.set(key, { k, ok: !!fertig, t: jetzt, spaet: fertig ? 0 : null }); if (!fertig && E && k === 'baum' && window.__BD.length < 4000) window.__BD.push({ x: Math.round(E.position.x), z: Math.round(E.position.z), d: Math.round(DD), soll: SOLL, inst: !!E.instanced, lod: E._lodLevel, sp: E._lodSpecies, alter: E.__geb ? Math.round(jetzt - E.__geb) : null, weg: Math.round(weg) }); }");
const g1 = require(ST + "g1.js");
const st = require(ST + "g6.js");
const k1 = st.find((x) => x.kriterium === "streaming.K1"), k2 = st.find((x) => x.kriterium === "streaming.K2");
async function diagProbe(r, T, o, G) {
    const s = r.state;
    window.__BD = []; const VR = {}; window.__VR = VR; const pp = () => s.playerMesh.position; const dd = (x, z) => Math.round(Math.hypot(x - pp().x, z - pp().z)); const T0 = performance.now(); const tt = () => Math.round((performance.now() - T0) / 100) / 10;
    const db = r._dorfBereiten.bind(r); r._dorfBereiten = function (key, i2) { const neu = !(r._dorfVorraete && r._dorfVorraete.has(key)); const p = db(key, i2); if (neu) { const e = (VR[key] = VR[key] || []); const x = { start: [tt(), dd(i2.x, i2.z)], wunsch: [Math.round(i2.x), Math.round(i2.z)] }; e.push(x); Promise.resolve(p).then((b) => { if (b && b.anker) { x.ortWahl = [tt(), dd(b.anker.x, b.anker.z)]; x.anker = [Math.round(b.anker.x), Math.round(b.anker.z)]; x.versatz = Math.round(Math.hypot(b.anker.x - i2.x, b.anker.z - i2.z)); const v = r._dorfVorraete && r._dorfVorraete.get(key); if (v && v.wasser) x.w = v.wasser; } else x.leer = tt(); }); } return p; };
    const ws2 = r._dorfWasserSchritt.bind(r); r._dorfWasserSchritt = function (w) { const vor = w.nass; const q = ws2(w); if (vor === undefined && w.nass !== undefined) for (const k in VR) for (const x of VR[k]) if (x.w === w && x.anker) { x.wasser = [tt(), dd(x.anker[0], x.anker[1])]; x.raten = w.__r; } if (w.nass === undefined) w.__r = (w.__r | 0) + 1; return q; };
    const es = r._erdbauSetzen.bind(r); r._erdbauSetzen = function (key, splats, nass) { const q = es(key, splats, nass); if (q) { const wer = String(new Error().stack).split(String.fromCharCode(10))[2].trim().split(" ")[1]; for (const k in VR) for (const x of VR[k]) { const v = r._dorfVorraete && r._dorfVorraete.get(k); if (x.anker && !x.grund && ((v && v.ort === key) || key.indexOf(x.anker[0]) >= 0)) { x.grund = [tt(), dd(x.anker[0], x.anker[1]), wer]; } } } return q; };
    const EX = [];
    const rq = r._foundryRequestSettlement.bind(r);
    r._foundryRequestSettlement = function (dp, kopf) { const t = performance.now(); const p = rq(dp, kopf); const x = { t0: Math.round(t), nH: dp && dp.nH, kopf: !!kopf, warte: ((r._foundry || {}).warte || []).length }; EX.push(x); p.then(() => (x.ms = Math.round(performance.now() - t))); return p; };
    // Geburt je Eintrag
    const seen = new WeakSet();
    const gl = r._gameLoopTick.bind(r); const SAMP = []; let tk = 0; const W9 = { tick: 0, lebt: 0, schick: 0, sendZ: 0, an: 0, anZ: 0, angenommen: 0, qPos: 0, qMax: 0 }; window.__W9 = W9; const tw = r._tickWaldPlan.bind(r); r._tickWaldPlan = function (ms) { W9.tick++; if (r._waldFadenLebt()) W9.lebt++; return tw(ms); }; const vw = r._voxelWorkerWaldDarts.bind(r); r._voxelWorkerWaldDarts = function (z, ...a) { W9.schick++; W9.sendZ += z.length / 2; return vw(z, ...a); }; const wa = r._waldDartsAn.bind(r); r._waldDartsAn = function (memo, zellen, rr, erd) { W9.an++; W9.anZ += zellen.length / 2; const m0 = r._forestDartMemo ? r._forestDartMemo.size : 0; const x = wa(memo, zellen, rr, erd); W9.angenommen += (r._forestDartMemo ? r._forestDartMemo.size : 0) - m0; if (!rr) W9.ohneR = (W9.ohneR || 0) + 1; if (r._forestDartMemo !== memo) W9.andereMemo = (W9.andereMemo || 0) + 1; return x; };
    r._gameLoopTick = function (now) { const x = gl(now); { const q = r._waldPlanSchlange ? r._waldPlanSchlange.size : 0; if (q > 0) W9.qPos++; if (q > W9.qMax) W9.qMax = q; } if (++tk % 150 === 0) { const f = r._foundry || {}; const W = f.warte || []; const je = {}; for (const a of W) { const m = a.msg || {}; const k = (m.type || '?') + ':' + String(m.presetId || m.preset || '').split('_')[0]; je[k] = (je[k] || 0) + 1; } SAMP.push({ tk, p: [Math.round(s.playerMesh.position.x), Math.round(s.playerMesh.position.z)], warte: W.length, pending: f.pending ? f.pending.size : -1, ingest: (r._foundryIngestQueue || []).length, je }); } for (const e of s.architectures || []) if (e && !seen.has(e)) { seen.add(e); e.__geb = performance.now(); } return x; };
    for (const e of s.architectures || []) if (e) { seen.add(e); e.__geb = 0; }
    const e = await (FAHRT_PROBE)(r, T, o, G);
    const B = []; for (const x of window.__BD.slice(0, 600)) { const E = (s.architectures || []).find((q) => q && q.position && Math.round(q.position.x) === x.x && Math.round(q.position.z) === x.z && q._lodSpecies); if (!E) { B.push('weg'); continue; } const f = r._foundry; const pr = r._foundryPresetForEntry(E); const g = pr ? r._foundryGestaltFor(E, pr) : null; if (g == null) { B.push('gestaltNull:' + pr); continue; } const st2 = r._foundryHoehenStufe(pr); const ov = r._artifactStudioOv(E); const key = r._foundryKoerperKey(pr, g, st2, ov); B.push((f.hoehen && f.hoehen.get(key) > 0 ? 'hoehe' : 'keineHoehe') + (ov ? ':ov' : '') + (f.zuege && f.zuege.has(key) ? ':zug' : '') + (f.requested && f.requested.has(key) ? ':req' : '') + (f.hoeheFehlt && f.hoeheFehlt.has(key) ? ':fehlt' : '') + (r._foundryCacheGet(key) !== undefined ? ':cache' : '')); } const BS = {}; for (const b of B) BS[b] = (BS[b] || 0) + 1; e.diag = { vr: JSON.parse(JSON.stringify(window.__VR, (k, v) => (k === 'w' ? undefined : v))), w9: window.__W9, takte: tk,  bs: BS, samp: SAMP, ex: EX, bd: window.__BD, helfer: ((r._foundry || {}).helfer || []).length, imFlug: r.constructor.FOUNDRY_IM_FLUG, v0: r._bedarfFuss() };
    return e;
}
const probeSrc = String(diagProbe).replace("(FAHRT_PROBE)", "(" + fahrtSrc + ")");
const befehl = g1.weltProbe.befehl([["fahrt", probeSrc, { sek: 60, ort: "dorf" }]]);
const aus = path.join(__dirname, "fahrt9-" + (process.argv[2] || "x") + ".json");
const port = process.argv[3] || "7794";
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
    console.log("W9", JSON.stringify(d.w9), "takte", d.takte); 
    const bd = d.bd;
    const grp = {};
    for (const x of bd) { const k = "soll" + x.soll + "/lod" + x.lod + "/inst" + (x.inst ? 1 : 0) + "/alt" + (x.alter === null ? "?" : x.alter < 0 ? "neg" : x.alter < 2000 ? "<2s" : x.alter < 10000 ? "<10s" : ">10s"); grp[k] = (grp[k] || 0) + 1; }
    for (const k in d.vr || {}) console.log("VR", k, JSON.stringify(d.vr[k]));
    console.log("BAUM-NICHT n", bd.length, JSON.stringify(grp));
    const dd = {}; for (const x of bd) { const k = Math.floor(x.d / 25) * 25; dd[k] = (dd[k] || 0) + 1; } console.log("BAUM-NICHT je Abstand", JSON.stringify(dd));
    const ww = {}; for (const x of bd) { const k = Math.floor(x.weg / 100) * 100; ww[k] = (ww[k] || 0) + 1; } console.log("BAUM-NICHT je Weg", JSON.stringify(ww));
    console.log("BEISPIEL", JSON.stringify(bd.slice(0, 12)));
}
