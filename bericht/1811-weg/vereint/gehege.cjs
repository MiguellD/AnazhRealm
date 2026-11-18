// gehege.cjs <baum> <aus-ordner> — der Graben des Geheges (Genesis-Plan S8, Zoo) am Mittag aus 1,7 m: frontal von Süden, schräg
// entlang der Süd-Kante, dazu von oben. Echte GPU, Werkbank `--ort genesis`, 1920 × 1080. Rohes nach <aus>/gehege.json.
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { spawn, spawnSync } = require("child_process");
const [BAUM, AUS] = process.argv.slice(2).map((p) => path.resolve(p));
const S = 7946, W = 7956;
fs.mkdirSync(AUS, { recursive: true });
const { werkbankRuf } = require(path.join(BAUM, "scripts/lib/welt-boot.cjs"));
const t0 = Date.now();
const log = (s) => { const z = ((Date.now() - t0) / 1000).toFixed(0).padStart(4) + " s " + s; console.log(z); fs.appendFileSync(path.join(AUS, "lauf.log"), z + "\n"); };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const da = (port) => new Promise((r) => http.get("http://127.0.0.1:" + port + "/", (x) => (x.resume(), r(true))).on("error", () => r(false)));
const ruf = async (weg, o) => {
    let uhr = null;
    const a = await Promise.race([werkbankRuf(W, weg, o), new Promise((_, nein) => (uhr = setTimeout(() => nein(new Error(weg + " ohne Antwort nach 900 s")), 900000)))]).finally(() => clearTimeout(uhr));
    if (a && typeof a.fehler === "string") log(weg + " meldet: " + a.fehler.slice(0, 300));
    return a;
};
const ev = async (code) => { const a = await ruf("/eval", { code }); return a && a.ergebnis !== undefined ? a.ergebnis : a; };
(async () => {
    let sv = null, wk = null;
    const erg = { baum: BAUM, zeit: new Date().toISOString() };
    try {
        for (const f of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "vor-" + f));
        const sl = fs.openSync(path.join(AUS, "save.log"), "w");
        sv = spawn(process.execPath, ["save-server.js"], { cwd: BAUM, env: { ...process.env, PORT: String(S) }, stdio: ["ignore", sl, sl], windowsHide: true });
        for (let i = 0; !(await da(S)); i++) { if (i > 60) throw new Error("save-server steht nicht"); await warte(1000); }
        const wl = path.join(AUS, "werkbank.log"), wf = fs.openSync(wl, "w");
        wk = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--echt", "--port", String(W), "--seite", "http://localhost:" + S, "--ort", "genesis"], { cwd: BAUM, env: { ...process.env, WERKBANK_FENSTER: "1920x1080" }, stdio: ["ignore", wf, wf], windowsHide: true });
        for (let i = 0; !/WERKBANK bereit/.test(fs.readFileSync(wl, "utf8")); i++) {
            if (i > 600 || /FEHLER/.test(fs.readFileSync(wl, "utf8"))) throw new Error("Werkbank nicht bereit: " + fs.readFileSync(wl, "utf8").slice(-400));
            await warte(1000);
        }
        log("bereit");
        const P = await ev(`const p = r._genesisPlan, g = p && p.gehege && p.gehege[0]; if (!g) return { fehler: "kein Gehege im Plan", plan: !!p };
            const y = (x, z) => r._voxelSurfaceY(p.ort.x + x, p.ort.z + z);
            return { ort: p.ort, rand: g.rand, graben: g.graben, lager: g.lager, steht: !!(r.state.worldMeta.genesisOrt || {}).steht, version: AnazhRealm.VERSION || null,
                boden: { mitte: y(g.rand.cx, g.rand.cz), sued: y(g.rand.cx, g.rand.cz + g.rand.ez + g.graben.b + 4), nord: y(g.rand.cx, g.rand.cz - g.rand.ez - g.graben.b - 4) } };`);
        erg.plan = P;
        log("Plan " + JSON.stringify(P).slice(0, 900));
        if (!P || P.fehler) throw new Error("Plan ohne Gehege");
        const { ort: o, rand: R, graben: G } = P, wx = (x) => o.x + x, wz = (z) => o.z + z;
        const zS = R.cz + R.ez + G.b / 2, zN = R.cz - R.ez - G.b / 2; // die Achsen des Grabens im Süden (+z) und Norden
        const yb = (x, z) => ev(`return r._voxelSurfaceY(${wx(x)}, ${wz(z)});`);
        const bild = async (name, px, pz, hoch, lx, lz, lh) => {
            const [y0, y1] = [await yb(px, pz), await yb(lx, lz)];
            const b = await ruf("/bild", { px: wx(px), py: y0 + hoch, pz: wz(pz), lx: wx(lx), ly: y1 + lh, lz: wz(lz), w: 1920, h: 1080, uhr: 0.5, datei: path.join(AUS, name + ".png") });
            erg[name] = { von: [px, hoch, pz], nach: [lx, lh, lz], boden: [y0, y1], datei: b && b.datei, antwort: b && Object.fromEntries(Object.entries(b).filter(([, v]) => typeof v !== "object")) };
            log("Bild " + name + " " + JSON.stringify(erg[name]).slice(0, 400));
        };
        // DER SPIELER TRITT VOR DEN GRABEN (die fernen Bühnen bauen erst vor ihrem Rand), dann warten, bis der Ort steht (≤ 180 s)
        await ev(`const p = r._genesisPlan.ort, x = p.x + ${R.cx}, z = p.z + ${zS + G.b / 2 + 4}; r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z); return true;`);
        // DER ECHTE TAKT (die Bühne ruht sonst: kein Ort-Takt, keine Kachel der Nah-Wiese, kein Neubau der Chunks am Erdbau)
        // DER ORT-TAKT: auf der Bühne lebt er nicht von selbst (`__anazhAutoSettlement` false) — dasselbe Glied wie das Instrument
        // (`__ortSchritt` der Werkbank, sonst `_genesisOrt`), 1×/s, solange der Lauf geht
        erg.ortTakt = await ev(`delete window.__anazhAutoSettlement; window.__gehegeTakt = setInterval(() => { try { if (window.__ortSchritt) window.__ortSchritt(); else r._genesisOrt(r.state.playerMesh.position); } catch (e) { window.__gehegeFehler = String(e && e.stack || e).slice(0, 400); } }, 1000); return { ortSchritt: !!window.__ortSchritt, ortTakt: window.__ortTakt || null };`);
        log("Ort-Takt " + JSON.stringify(erg.ortTakt));
        await ruf("/lauf", { sek: 20, ein: 40, regler: "frei" });
        const lf = await ruf("/lauf", { sek: 30, ein: 25, regler: "frei" });
        erg.taktFehler = await ev("clearInterval(window.__gehegeTakt); return window.__gehegeFehler || null;");
        if (erg.taktFehler) log("Takt-Fehler " + erg.taktFehler);
        erg.lauf = lf && { fps: lf.fps, p95: lf.p95, fehler: lf.fehler };
        erg.ortStand = await ev(`const g = r.state.worldMeta.genesisOrt || {}; return { steht: !!g.steht, werke: r._genesisWerkeFertig ? r._genesisWerkeFertig.size : -1, absagen: r._genesisAbsagen ? [...r._genesisAbsagen] : [], wildnis: !!r._wildnisTraegt(r._genesisPlan.ort.x + ${R.cx}, r._genesisPlan.ort.z + ${R.cz}), slug: r.state.worldMeta.slug, spieler: r.state.playerMesh.position.toArray().map((v) => +v.toFixed(1)) };`);
        log("Ort " + JSON.stringify(erg.ortStand).slice(0, 600));
        erg.gras = await ev(require(path.join(__dirname, "gras-sonde.js"))(wx(R.cx), wz(R.cz), 14));
        log("Gras " + JSON.stringify(erg.gras).slice(0, 2500));
        // DIE URSACHE (Koordinator 15:36): quer über den Graben Süd, Funktion gegen gezeichneten Boden — in der Mitte und 5 m östlich
        erg.ursache = [await ev(require(path.join(__dirname, "ursache-sonde.js"))(wx(R.cx), wz(zS - 4), wz(zS + 4))), await ev(require(path.join(__dirname, "ursache-sonde.js"))(wx(R.cx + 5), wz(zS - 4), wz(zS + 4)))];
        log("Ursache " + JSON.stringify(erg.ursache));
        // das Profil quer durch den Graben im Süden und im Norden (x = Mitte), alle 0,25 m
        erg.profil = await ev(`const o = [], p = r._genesisPlan.ort; for (let z = ${R.cz - R.ez - 9}; z <= ${R.cz + R.ez + 9}; z += 0.25) o.push([+z.toFixed(2), +r._voxelSurfaceY(p.x + ${R.cx}, p.z + z).toFixed(2)]); return o;`);
        log("Profil " + JSON.stringify(erg.profil));
        const yP = P.boden.mitte, aS = zS + G.b / 2, aN = zN - G.b / 2; // Platte des Zoos, Außenkante des Grabens Süd / Nord
        const abs = async (name, p, l) => {
            const b = await ruf("/bild", { px: wx(p[0]), py: p[1], pz: wz(p[2]), lx: wx(l[0]), ly: l[1], lz: wz(l[2]), w: 1920, h: 1080, uhr: 0.5, datei: path.join(AUS, name + ".png") });
            erg[name] = { von: p, nach: l, antwort: b && Object.fromEntries(Object.entries(b).filter(([, v]) => typeof v !== "object")) };
            log("Bild " + name + " " + JSON.stringify(erg[name]).slice(0, 300));
        };
        const yA = async (x, z) => (await yb(x, z)) + 1.7;
        // frontal von Süden: 2,5 m vor der Außenkante, Auge 1,7 m, Blick auf den Fuß der inneren Wand
        await abs("frontal-sued", [R.cx, await yA(R.cx, aS + 2.5), aS + 2.5], [R.cx, yP - 1, aS - G.b]);
        // frontal weit: 7 m vor der Außenkante, Blick waagrecht über den Graben ins Gehege
        await abs("frontal-sued-weit", [R.cx, await yA(R.cx, aS + 7), aS + 7], [R.cx, yP + 0.6, R.cz]);
        // schräg entlang der Außenkante: an der Südwest-Ecke, 0,6 m hinter der Kante, Blick nach Osten die Kante entlang
        await abs("entlang-sued", [R.cx - R.ex - 2, await yA(R.cx - R.ex - 2, aS + 0.6), aS + 0.6], [R.cx + R.ex + G.b, yP - 0.3, aS - 0.4]);
        // nah auf die Kante: an der Außenkante stehend, Blick 3 m voraus auf die Kante
        await abs("kante-nah", [R.cx - 4, await yA(R.cx - 4, aS + 0.9), aS + 0.9], [R.cx - 1, yP, aS]);
        // schräg über die Ecke: 6 m südwestlich der Ecke, Blick auf die Südost-Ecke des Geheges
        await abs("ecke-schraeg", [R.cx - R.ex - G.b - 5, await yA(R.cx - R.ex - G.b - 5, aS + 5), aS + 5], [R.cx + R.ex, yP - 0.5, R.cz - R.ez]);
        // von Norden frontal (die Sonne steht im Süden: dort liegt die Kante im Licht)
        await abs("frontal-nord", [R.cx, await yA(R.cx, aN - 2.5), aN - 2.5], [R.cx, yP - 1, aN + G.b]);
    } catch (e) {
        erg.fehler = String(e && e.stack || e);
        log("FEHLER " + erg.fehler.slice(0, 600));
    } finally {
        fs.writeFileSync(path.join(AUS, "gehege.json"), JSON.stringify(erg, null, 1));
        try { await ruf("/ende", {}); } catch {}
        for (const p of [wk, sv]) if (p && p.pid) try { spawnSync("taskkill", ["/PID", String(p.pid), "/T", "/F"], { windowsHide: true }); } catch {}
        log("ENDE");
        process.exit(erg.fehler ? 1 : 0);
    }
})();
