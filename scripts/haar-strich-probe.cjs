// haar-strich-probe.cjs — AUF ZEIT (w26-haar-arm, fällt vor der Abgabe): die Szene der Station haar.K2#1 auf der echten Karte über die
// GPU-Probe — eigene Werkbank an der Mess-Wiese, Third, 1920 × 1080, die Pose gehalten wie die Station (`__halten` leib, die Anzeige-Uhr auf 0, der Wind still, die Feder ruht),
// je Schuss das Maß strich der Klasse spieler:kopf/hair (werkbank bild --klasse, ohne --ist). Je Spielart zwei Schüsse (arm 0,7 m,
// third −4 m), die Spielarten live in derselben Welt: der Zweig, die Normale ohne Rundung, Kajiya-Kay (Tangente der Strähne).
"use strict";
const { spawn, execFileSync } = require("child_process");
const path = require("path");
const os = require("os");
const ROOT = path.resolve(__dirname, "..");
const PORT = 4793;
const env = { ...process.env, WERKBANK_PORT: String(PORT) };
const wb = (...a) => execFileSync(process.execPath, ["scripts/werkbank.cjs", ...a], { cwd: ROOT, env, encoding: "utf8", maxBuffer: 1 << 26 });
const json = (t) => {
    const o = JSON.parse(t.slice(t.indexOf("{")));
    if (o.fehler) throw new Error("eval: " + String(o.fehler).slice(0, 300));
    return o;
};
// DIE SPIELARTEN (w27-haar-arm-2): [Name, die Farbe des Leibs (null: der Anker der Welt wie an main; sonst die Prägung des
// Rezepts), der Flicken auf HAAR_LOOK.kk.fuss (null: der Zweig)] — das Lichtmodell ist das des Stamms (`_haarLichtModell`)
const DUNKEL = { skinTone: "karamell", hairColor: "darkbrown" };
const STAENDE = {
    a: [
        ["anker", null, null],
        ["anker-ohne-kruemmung", null, { kern: 0, diffus: 0 }],
        ["dunkel", DUNKEL, null],
        ["dunkel-ohne-kruemmung", DUNKEL, { kern: 0, diffus: 0 }],
    ],
    b: [["anker", null, null]],
};
// die Farbe: die Prägung des Mensch-Rezepts über den EINEN Übergabe-Kanal (null: ohne Prägung), der Leib gießt neu
const FARBE = (f) => `if (r.state.workshop) r.state.workshop.studioOv = {}; ${f ? `r._studioUebergabeEmpfang({ type: "uebergabe", world: "probe", kind: "koerper", preset: "mensch", seed: 0, ov: ${JSON.stringify(f)} });` : `r.applyPlayerSoul(r.state.player.soul || "human");`}
let k = 0; const nah = () => { const g = r.state.playerMesh.userData._gelenk; return g && !g.istFern && g.nahStufe !== 1; };
for (; k < 600 && !nah(); k++) { await sleep(50); r._gameLoopTick(performance.now()); }
const f = r._menschGussFarben(r._koerperStudioDials()); return { nah: nah(), takte: k, haar: "#" + (f.hair >>> 0).toString(16), haut: "#" + (f.skin >>> 0).toString(16) };`;
// das Licht: das Lichtmodell des Stamms mit dem Flicken auf kk.fuss (null: der Zweig)
const LICHT = (o) => `const haar = []; r.state.playerMesh.traverse((x) => x.isMesh && (x.userData.__klasse || x.material?.userData?.__klasse) === "hair" && haar.push(x));
const K = AnazhRealm._haarLichtModell(), kk0 = window.__koerperCore.HAAR_LOOK.kk, o = ${JSON.stringify(o)}; let n = 0;
for (const m of new Set(haar.map((x) => x.material))) {
  if (!m.userData.__lichtOrig) m.userData.__lichtOrig = [m.setupLightingModel, m.customProgramCacheKey, m.setupLightingModel()];
  const [lm0, key0, inst] = m.userData.__lichtOrig;
  if (!o) { m.setupLightingModel = lm0; m.customProgramCacheKey = key0; }
  else { const kk = { ...kk0, fuss: { ...kk0.fuss, ...o } }; m.setupLightingModel = () => new K(kk, { ...inst.faser, lappen: K.lappen(kk, inst.faser.unter, inst.faser.k) }); m.customProgramCacheKey = function () { return key0.call(this) + "|" + JSON.stringify(o); }; }
  m.needsUpdate = true; n++;
}
window.__bundlesNeu && window.__bundlesNeu(); return n;`;
// DIE ALBEDO-ZEILE haar NEU (`--albedo`): Welt (werkbank start --echt + albedo --tafel) und Labor (diag-albedo-tafel --labor --echt
// --nur koerperstudio) auf der Karte, der Nachzug --nur haar; die Zeile danach als EINE JSON-Zeile (sie fällt byte-gleich in die Tafel)
async function albedo() {
    const d = path.join(os.tmpdir(), "haar-albedo");
    require("fs").mkdirSync(d, { recursive: true });
    // die echte Seite kommt vom save-server (werkbank `--echt --seite`, wie die Sitzung der Punkte-Maschine)
    const SP = PORT + 1;
    const server = spawn(process.execPath, ["save-server.js"], { cwd: ROOT, env: { ...process.env, PORT: String(SP) } });
    for (let i = 0; i < 60; i++) {
        const da = await new Promise((ok) => require("http").get("http://127.0.0.1:" + SP + "/", (r) => (r.resume(), ok(true))).on("error", () => ok(false)));
        if (da) break;
        await new Promise((ok) => setTimeout(ok, 1000));
    }
    process.on("exit", () => server.kill());
    const welt = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--echt", "--port", String(PORT), "--seite", "http://localhost:" + SP, "--ort", "wiese"], { cwd: ROOT, env });
    let log = "";
    await new Promise((ok, nein) => {
        const t = setTimeout(() => nein(new Error("die Werkbank stand nach 240 s nicht")), 240000);
        const lies = (x) => ((log += x), /WERKBANK bereit/.test(log) && (clearTimeout(t), ok()));
        welt.stdout.on("data", lies);
        welt.stderr.on("data", lies);
        welt.on("exit", (c) => nein(new Error("die Werkbank endete " + c + ": " + log.slice(-400))));
    });
    try {
        const o = execFileSync(process.execPath, ["scripts/werkbank.cjs", "albedo", "--tafel", "--datei", path.join(d, "welt.json")], { cwd: ROOT, env, encoding: "utf8", maxBuffer: 1 << 26 }); // prettier-ignore
        console.log("✅ WELT " + (o.split("\n").find((z) => /^haar\b/.test(z.trim())) || "").trim());
    } catch (e) {
        console.log("✅ WELT (Urteil ROT) " + (String(e.stdout || "").split("\n").find((z) => /^haar\b/.test(z.trim())) || "").trim());
    } finally {
        try {
            wb("stop");
        } catch {}
        welt.kill();
    }
    const lauf = (a) => {
        try {
            return execFileSync(process.execPath, ["scripts/diag-albedo-tafel.cjs", ...a], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 });
        } catch (e) {
            return String(e.stdout || "") + String(e.stderr || "");
        }
    };
    const l = lauf(["--labor", "--echt", "--nur", "koerperstudio", "--datei", path.join(d, "labor.json")]);
    console.log("✅ LABOR " + (l.split("\n").find((z) => /^haar\b/.test(z.trim())) || l.trim().split("\n").pop()).trim());
    const n = lauf(["--nachziehen", path.join(d, "welt.json"), path.join(d, "labor.json"), "--nur", "haar"]);
    console.log("✅ NACHZUG " + n.trim().split("\n").slice(-3).join(" | "));
    const z = JSON.parse(require("fs").readFileSync(path.join(ROOT, "spec/farbe/albedo-tafel.json"), "utf8")).zeilen.find((x) => x.id === "haar");
    // die Zeile in kurzen Zeilen (der Bericht der Probe kappt lange): Ist, Ratsche, je Seite Kopf und Quellen
    console.log("✅ ALBEDO-IST " + JSON.stringify({ ist: z.ist, ratsche: z.ratsche }));
    for (const [k, g] of Object.entries(z.gemessen || {})) {
        const { quellen, ...kopf } = g;
        console.log("✅ ALBEDO-KOPF " + k + " " + JSON.stringify(kopf));
        console.log("✅ ALBEDO-QUELLEN " + k + " " + JSON.stringify(quellen));
    }
    process.exit(0);
}
(async () => {
    if (process.argv.includes("--albedo")) return albedo();
    const welt = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--port", String(PORT), "--ort", "wiese"], { cwd: ROOT, env });
    let log = "";
    await new Promise((ok, nein) => {
        const t = setTimeout(() => nein(new Error("die Werkbank stand nach 240 s nicht")), 240000);
        const lies = (d) => ((log += d), (global.__weltLog = log), /WERKBANK bereit/.test(log) && (clearTimeout(t), ok()));
        welt.stdout.on("data", lies);
        welt.stderr.on("data", lies);
        welt.on("exit", (c) => nein(new Error("die Werkbank endete " + c + ": " + log.slice(-400))));
    });
    console.log((/\[linse-gpu\][^\n]*/.exec(log) || ["[linse-gpu] ?"])[0]);
    const zeilen = [];
    const SATZ = process.argv.includes("--satz") ? process.argv[process.argv.indexOf("--satz") + 1] : "a";
    try {
        wb("fenster", "1920", "1080");
        const u = json(wb("umstellen", "--ort", "wiese", "--sicht", "third"));
        console.log("umgestellt", JSON.stringify({ ort: u.ort, sicht: u.sicht, fehler: u.fehler }));
        const POSE = "const pm = r.state.playerMesh, z = []; pm.traverse((o) => { if (!o.isMesh) z.push(...o.position.toArray(), ...o.quaternion.toArray()); else if (o.userData.__haarFeder) z.push(o.userData.__haarFeder.x, o.userData.__haarFeder.y, o.userData.__haarFeder.z); }); return z;";
        const schuss = (n, g) => {
            const d = path.join(os.tmpdir(), `haar-strich-${n}.png`);
            let o;
            try {
                o = json(wb("bild", "0", "0", "0", "0", "0", "0", "--gesicht", g, "--spieler", "--wahl", "0", "--klasse", "^spieler:kopf/hair$", "--datei", d)); // prettier-ignore
            } catch (e) {
                o = { fehler: String(e.stdout || e.message).slice(-300) };
            }
            const k = o.klasse && o.klasse.klassen && o.klasse.klassen["spieler:kopf/hair"];
            return k ? { strich: k.strich, si: k.si, luma: k.luma } : { fehler: o.fehler || "ohne Klasse" };
        };
        let farbe0;
        for (const [stand, farbe, licht] of STAENDE[SATZ]) {
            if (JSON.stringify(farbe) !== farbe0) {
                farbe0 = JSON.stringify(farbe);
                const f = json(wb("eval", FARBE(farbe))).ergebnis;
                const h = json(wb("eval", 'window.__halten(["leib"]); window.__gehalten.t = 0; r.animatePlayerSoul(0); r._windWob = () => 0; const ruht = () => { let j = true; r.state.playerMesh.traverse((o) => { const f = o.userData.__haarFeder; if (f && (f.x || f.y || f.z)) j = false; }); return j; }; let k = 0; for (; k < 40 && !ruht(); k++) { await sleep(110); r._gameLoopTick(performance.now()); } const c = []; r.state.playerMesh.traverse((o) => o.isMesh && o.material?.userData?.__klasse === "hair" && o.geometry.attributes.color && c.push(o.geometry.attributes.color.getX(2))); return { gehalten: [...window.__gehalten], takte: k, ruht: ruht(), haarRot: c.slice(0, 3) };')).ergebnis; // prettier-ignore
                console.log("✅ FARBE " + stand + " " + JSON.stringify(f) + " gehalten " + JSON.stringify(h.ergebnis));
            }
            json(wb("eval", LICHT(licht)));
            const pose0 = json(wb("eval", POSE)).ergebnis;
            const a = schuss(stand + "-arm", "0.7"),
                t = schuss(stand + "-third", "-4");
            const p = json(wb("eval", POSE)).ergebnis;
            const dp = Math.max(...p.map((v, i) => Math.abs(v - pose0[i])));
            const im = (x) => x.strich != null && x.strich >= 0.3554 && x.strich <= 0.533;
            zeilen.push([stand, a.strich, t.strich, im(a), im(t)]);
            console.log(`✅ MESSUNG ${stand}: arm ${JSON.stringify(a)} · third ${JSON.stringify(t)} · Pose Δ ${dp.toExponential(1)}`);
        }
    } finally {
        try {
            wb("stop");
        } catch {}
        welt.kill();
    }
    for (const [art, a, t, ia, it] of zeilen)
        console.log(`${ia && it ? "✅ GRÜN" : "❌ ROT"} ${art}: arm ${a} ${ia ? "im" : "außer"} Band · third ${t} ${it ? "im" : "außer"} Band [0,3554; 0,533]`);
    process.exit(0);
})().catch((e) => {
    const t = String((e.stdout || "") + (e.stderr || "")).replace(/\s+/g, " ");
    console.log("❌ ROT haar-strich: " + e.message.split("\n")[0].slice(-120) + " — " + t.slice(-500));
    for (const z of (global.__weltLog || "").split("\n").filter((x) => /ERROR|FEHLER|Bruch|BRUCH/.test(x)).slice(-6)) console.log("❌ ROT Welt: " + z.slice(0, 400));
    process.exit(1);
});
