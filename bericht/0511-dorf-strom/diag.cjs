// Fahrt-Probe mit Diagnose: Dorf-Erwachen, Haus-Geburt und erstes Bild je Haus, in Spiel-Zeit (Takt-Zahl) und Weg
const path = require("path"), fs = require("fs"), { spawnSync } = require("child_process");
const ST = "C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination/meisterkarte-quelle/punkte/stationen/";
const src = fs.readFileSync(ST + "g6.js", "utf8");
const a = src.indexOf("async function fahrtProbe(");
const b = src.indexOf("\n}\n", a) + 2;
const fahrtSrc = src.slice(a, b);
const g1 = require(ST + "g1.js");
const st = require(ST + "g6.js");
const k1 = st.find((x) => x.kriterium === "streaming.K1"), k2 = st.find((x) => x.kriterium === "streaming.K2");
async function diagProbe(r, T, o, G) {
    const s = r.state, pm = s.playerMesh;
    const D = { zellen: [], bereit: [], haeuser: [], baeume: {} };
    let takt = 0;
    const weg = () => [Math.round(pm.position.x), Math.round(pm.position.z)];
    const sp = r._autoSettlementSpawnCell.bind(r);
    r._autoSettlementSpawnCell = function (cx, cz, i) { D.zellen.push({ takt, cell: cx + "," + cz, anker: [Math.round(i.x), Math.round(i.z)], p: weg(), d: Math.round(Math.hypot(i.x - pm.position.x, i.z - pm.position.z)), t: Math.round(performance.now()) }); return sp(cx, cz, i); };
    const be = r._dorfBereiten.bind(r);
    r._dorfBereiten = function (key, i2) { if (!(r._dorfVorraete && r._dorfVorraete.has(key))) D.bereit.push({ takt, key, d: Math.round(Math.hypot(i2.x - pm.position.x, i2.z - pm.position.z)), t: Math.round(performance.now()) }); return be(key, i2); };
    const ss = r._spawnSettlementSlot.bind(r);
    const neu = [];
    r._spawnSettlementSlot = function (...args) { const e = ss(...args); if (e && e.position) neu.push({ e, takt, t: performance.now(), d: Math.hypot(e.position.x - pm.position.x, e.position.z - pm.position.z), blick: r._imErstenBlick(e.position.x, e.position.z, 6, true) }); return e; };
    const gl = r._gameLoopTick.bind(r);
    r._gameLoopTick = function (now) { takt++; const x = gl(now); for (const h of neu) if (!h.da && r._archIsRendered(h.e)) { h.da = takt; h.tDa = performance.now(); h.dDa = Math.hypot(h.e.position.x - pm.position.x, h.e.position.z - pm.position.z); } return x; };
    const e = await (FAHRT_PROBE)(r, T, o, G);
    D.haeuser = neu.map((h) => ({ takt: h.takt, d: Math.round(h.d), blick: h.blick, daNach: h.da ? h.da - h.takt : -1, ms: h.da ? Math.round(h.tDa - h.t) : -1, dDa: h.da ? Math.round(h.dDa) : -1, lod: h.e._lodLevel, inst: !!h.e.instFoundry }));
    const R = s.architectureCullingRadius;
    D.R = R; D.nearM = r.constructor.AUTO_SETTLEMENT.nearM;
    // die Bäume: wer ist ein Baum ohne Bild, Herkunft
    const H = {};
    for (const x of s.architectures || []) if (x && x._lodSpecies) { const k = (x._dorfBaum ? "dorf" : x.source || x._quelle || x.kind || "?") + ":" + (r._archIsRendered(x) ? "da" : "nicht"); H[k] = (H[k] || 0) + 1; }
    D.baeume = H;
    e.diag = D;
    return e;
}
const probeSrc = String(diagProbe).replace("(FAHRT_PROBE)", "(" + fahrtSrc + ")");
const befehl = g1.weltProbe.befehl([["fahrt", probeSrc, { sek: 60, ort: "dorf" }]]);
const aus = path.join(__dirname, "fahrt-" + (process.argv[2] || "x") + ".json");
const port = process.argv[3] || "7791";
const bb = befehl.map((x) => x.replace("{AUS}", aus).replace("{PORT}", port));
// weltBefehl erwartet Funktionen; diagProbe ist Text: in die Probenliste als Text
const r = spawnSync(bb[0], bb.slice(1), { cwd: process.cwd(), encoding: "utf8", maxBuffer: 1 << 28, timeout: 1500000 });
if (!fs.existsSync(aus)) { console.log(r.stdout.slice(-3000), r.stderr.slice(-3000)); process.exit(1); }
const j = JSON.parse(fs.readFileSync(aus, "utf8"));
console.log("FEHLER", JSON.stringify(j.fehler));
const lauf = { stdout: r.stdout };
console.log("K1", JSON.stringify(k1.urteil(j, lauf)));
console.log("K2", JSON.stringify(k2.urteil(j, lauf)));
const e = j.proben.fahrt;
if (e && e.diag) { const d = e.diag; console.log("ZELLEN", JSON.stringify(d.zellen)); console.log("BEREIT", JSON.stringify(d.bereit)); console.log("R", d.R, "nearM", d.nearM, "BAEUME", JSON.stringify(d.baeume)); console.log("HAEUSER n", d.haeuser.length, JSON.stringify(d.haeuser.slice(0, 60))); }
if (e) console.log("EINTRITT", JSON.stringify(e.eintritt), "JE", JSON.stringify(e.je && Object.fromEntries(Object.entries(e.je).map(([k, v]) => [k, { luecke: v.luecke, bilder: v.bilder, je: v.je, zeugen: v.zeugen }]))));
