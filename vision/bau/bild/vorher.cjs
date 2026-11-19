// vorher.cjs <baum> <aus-ordner> — die festen VORHER-Bilder des Bau-Zensus (koordination vision/bau/tafel.md TEIL 3, B1…B16) IM
// ECHTEN SPIEL: echte GPU, Werkbank, 1920 × 1080. Dieselben Posen dienen als NACHHER: an einem anderen Baum rechnet der Treiber
// sie aus Samen + Wort neu; VORHER_POSEN=<vorher.json eines früheren Laufs> nimmt dessen Posen wörtlich (Spieler, Kamera, Ziel, FOV).
//   VORHER_NUR=b01a,b06a   nur die genannten Bilder (Kürzel vor dem ersten Strich oder der ganze Name)
//   VORHER_MAX_S=1500      die Zeitgrenze des Laufs: was danach noch offen ist, steht mit `fehler` in vorher.json
//   VORHER_WORT="dorf 7 4750"  das Wort der Stadt (am Anker von stadt-voll, wie p3/n1811/netz/gasse.cjs)
// DREI ORTE EINER WELT, jeder mit eigenem Fang (ein Ort, der nicht steht, lässt die anderen fahren):
//   STADT  „dorf 7 4750“ am Anker von stadt-voll, 3 × 3 Kacheln wach (gasse.cjs Modus bild): b01a b01b b06b b06a b07 b15
//   DORF   der Messort `dorf` (/umstellen, wie p3/n1711/hs/ziel.cjs): b02 b09 b10 b05 b11 b01c b03
//   WIESE  der Messort `wiese`, EIN Haus je Kultur über die Wurzel des Spiels gesetzt: b04 b08 b13a b13b b12b b12a b14 b16a b16b
// Der Schuss: `/schirm` an der Pose (`_loopCamera` hält die Kamera, die Bühne steht auf Mittag · Sonne · Sommer — `/schirm` stellt
// sie selbst so); nur b16 schießt über `/bild` (der einzige Weg, der Wetter und Saison bis in den Schuss trägt).
// Ein Bild, das nicht gelingt, bricht den Lauf nicht: es steht mit `fehler` in vorher.json. Nach jedem Bild wird gesichert.
// Unter dem GPU-Schloss fahren (p3/gpu-lauf.sh). Ports: save-server 7949, Werkbank 7959.
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { spawn, spawnSync } = require("child_process");
const [baumArg, ausArg] = process.argv.slice(2);
if (!baumArg || !ausArg) { console.error("Aufruf: node vorher.cjs <baum> <aus-ordner>"); process.exit(2); }
const BAUM = path.resolve(baumArg), AUS = path.resolve(ausArg);
const S = 7949, W = 7959, SEITE = require("./seite.js");
const WORT = (process.env.VORHER_WORT || "dorf 7 4750").split(" "), [SAMEN, NH] = [Number(WORT[1]), Number(WORT[2])];
const ANLAUF = [400, 400], ANKER = [836.0867207453832, 438.24283067541955];
const NUR = (process.env.VORHER_NUR || "").split(",").map((s) => s.trim()).filter(Boolean);
const MAX_S = Number(process.env.VORHER_MAX_S) || 1500;
const SOLO_SAMEN = 7;
// der Stempel des Studio-Werks für b14: Zahlen-Regler des Fachwerk-Studios (fachwerk-core.js PARAMS, die 21 Regler, die `werk` reicht)
const STUDIO_OV = { storeys: 3, hip: 0.5, turm: 1, balcony: 1, annexN: 1, vorkragung: 1 };
const STAND = ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"];
fs.mkdirSync(AUS, { recursive: true });
const { werkbankRuf } = require(path.join(BAUM, "scripts/lib/welt-boot.cjs"));
const POSEN = process.env.VORHER_POSEN ? JSON.parse(fs.readFileSync(path.resolve(process.env.VORHER_POSEN), "utf8")).bilder || {} : null;

// [Name, Befund, Ort, was das Bild zeigt]
const BILDER = [
    ["b01a-fenster-tafel-gasse-nah", "B1", "stadt", "die Fensterwand an der Gasse aus 5 m, Augenhöhe, Mittag"],
    ["b01b-fenster-tafel-hof-nah", "B1", "stadt", "die Rückseite desselben Hauses (Hof) aus 5 m, Augenhöhe, Mittag"],
    ["b06b-grenze-aussen-310m", "B6", "stadt", "dasselbe Haus mit Tele (4°) aus 310 m: jenseits nahM 300 (Masse der Ferne)"],
    ["b06a-grenze-innen-290m", "B6", "stadt", "dasselbe Haus mit Tele (4°) aus 290 m, dieselbe Richtung: diesseits nahM 300 (Satz)"],
    ["b07-ferne-stadt-260m", "B7", "stadt", "die Stadt von oben aus 260 m (die Kamera von kopf-4750-ueber-260m), der Spieler unter der Kamera"],
    ["b15-dachlandschaft-60m", "B15", "stadt", "die Dachlandschaft der Stadt aus 60 m Höhe schräg"],
    ["b02-reihe-gleicher-haeuser", "B2", "dorf", "die Reihe der Häuser im Dorf, fern (70 m zurück, 18 m höher), Mittag"],
    ["b09-rauch-mittag", "B9", "dorf", "die Dächer mit Kaminen im Dorf, Mittag"],
    ["b10-kein-hof", "B10", "dorf", "der Raum zwischen den zwei nächsten Häusern am Boden"],
    ["b05-rinne-traufe", "B5", "dorf", "Traufe und Hausecke nah von schräg unten"],
    ["b11-sturz-massstab", "B11", "dorf", "der Spieler (dritte Person) neben Tür und EG-Fenster"],
    ["b01c-fenster-tafel-fern", "B1b", "dorf", "die Fensterwand fern (60 m, Tele 12°): die Stufe 2"],
    ["b03-innenraum-schmiede", "B3", "dorf", "innen in der Schmiede (sonst Gasthaus, sonst Wohnhaus), der Blick von der Tür durch den Raum"],
    ["b04-moos-fachwerkholz", "B4", "wiese", "Fachwerk-Balken nah (alemannisch), Welttag und Alter im Eintrag"],
    ["b08-fachwerk-40m", "B8", "wiese", "das alemannische Fachwerkhaus aus 40 m (Tele 20°)"],
    ["b13a-masse-alemannisch", "B13", "wiese", "alemannisch aus der festen Pose (13 m vor, 9 m quer)"],
    ["b13b-masse-italienisch", "B13", "wiese", "italienisch aus derselben Pose relativ zum Haus"],
    ["b12b-deckung-terrakotta", "B12", "wiese", "das Dach nah: italienisch (Terrakotta, Mönch-Nonne der Wirklichkeit)"],
    ["b12a-deckung-schiefer", "B12", "wiese", "das Dach nah: franzoesisch (Schiefer)"],
    ["b14-studio-werk-welt", "B14", "wiese", "ein Studio-Werk (alemannisch + Stempel der Regler) in der Welt — nur Welt-Seite"],
    ["b16a-regen-ueberstand", "B16", "wiese", "Regen: Wand und Traufe unter dem Überstand nah"],
    ["b16b-dach-winter", "B16", "wiese", "Winter + Niederschlag: das Dach nah (liegt Schnee?)"],
];
const will = (name) => !NUR.length || NUR.some((t) => t === name || name.split("-")[0] === t);
const t0 = Date.now();
const log = (s) => { const z = ((Date.now() - t0) / 1000).toFixed(0).padStart(4) + " s " + s; console.log(z); fs.appendFileSync(path.join(AUS, "lauf.log"), z + "\n"); };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const da = (port) => new Promise((r) => http.get("http://127.0.0.1:" + port + "/", (x) => (x.resume(), r(true))).on("error", () => r(false)));
const ruf = async (weg, o) => {
    let uhr = null;
    const a = await Promise.race([werkbankRuf(W, weg, o), new Promise((_, nein) => (uhr = setTimeout(() => nein(new Error(weg + " ohne Antwort nach 900 s")), 900000)))]).finally(() => clearTimeout(uhr));
    if (a && typeof a.fehler === "string") log(weg + " meldet: " + a.fehler.slice(0, 400));
    return a;
};
// der Rumpf in der Seite; ein Wurf des Rumpfs kommt als Fehler zurück (nie als Ergebnis)
const ev = async (code) => {
    const a = await ruf("/eval", { code });
    if (a && a.ergebnis === undefined && typeof a.fehler === "string") throw new Error("eval: " + a.fehler.slice(0, 600));
    return a ? a.ergebnis : a;
};
const J = (x) => JSON.stringify(x);
const r2 = (v) => (Array.isArray(v) ? v.map(r2) : typeof v === "number" ? +v.toFixed(2) : v);

// ── die Geometrie am Haus (h aus __vb.info): haus-lokal (lx, lz) → Welt, die vier Wände von der Tür-Wand aus
const lok = (h, lx, lz) => { const c = Math.cos(h.phi), s = Math.sin(h.phi); return [h.x + lx * c + lz * s, h.z - lx * s + lz * c]; };
const wand = (h, seite) => {
    let n = h.n || [0, 1];
    if (seite === "rueck") n = [-n[0], -n[1]];
    if (seite === "links") n = [n[1], -n[0]];
    if (seite === "rechts") n = [-n[1], n[0]];
    const a = n[0] ? h.W / 2 : h.D / 2, b = n[0] ? h.D / 2 : h.W / 2, t = [-n[1], n[0]];
    // p(dist, seit): der Punkt `dist` m vor der Wand (negativ: im Haus), `seit` m längs der Wand von ihrer Mitte
    return { n, t, a, b, p: (dist, seit) => lok(h, h.mx + n[0] * (a + dist) + t[0] * seit, h.mz + n[1] * (a + dist) + t[1] * seit) };
};
// die Lage der Tür längs ihrer Wand (0 ohne Tür-Zeile)
const tuerS = (h, w) => (h.tuer ? (h.tuer.x - h.mx) * w.t[0] + (h.tuer.z - h.mz) * w.t[1] : 0);
// die Wand unter der Traufe: die Traufen des Kerns liegen an ±z (ovEave → ovZ, fachwerk-core.js:1800)
const traufWand = (h) => wand(h, (h.n || [0, 1])[1] ? "tuer" : "links");
// Traufe und First über dem Boden des Hauses aus den Maßen des Kerns (foundH 0,55 · egH 2,55 · ogH 2,35, fachwerk-core.js:178)
const trauf = (h) => 0.55 + 2.55 + 2.35 * (Math.max(1, Math.round(h.st || 2)) - 1);
const first = (h) => trauf(h) + Math.tan(((h.pitch || 45) * Math.PI) / 180) * (Math.min(h.W, h.D) / 2);
const imRect = (g, x, z, rand) => { const c = Math.cos(g.phi), s = Math.sin(g.phi), dx = x - g.x, dz = z - g.z; return Math.abs(dx * c - dz * s - g.fx.ox) < g.fx.ex + rand && Math.abs(dx * s + dz * c - g.fx.oz) < g.fx.ez + rand; };
const freiIn = (A) => (x, z, rand) => !A.some((g) => imRect(g, x, z, rand == null ? 0.8 : rand));
const nachAbstand = (L, x, z) => L.slice().sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z) || a.id - b.id);
const wohn = (h) => !h.rolle || h.rolle === "wohnhaus";

// VORHER_UHR (0..1, 0,5 = Mittag) und VORHER_WETTER (sunny | rainy …) stellen die Bühne des /schirm-Schusses (die Flügel-Bilder der Bahn Öffnungen)
const B_UHR = process.env.VORHER_UHR == null ? 0.5 : Number(process.env.VORHER_UHR), B_WETTER = process.env.VORHER_WETTER || "sunny";
const BUEHNE = `try { window.__buehne({ uhr: ${B_UHR}, wetter: ${JSON.stringify(B_WETTER)} }); __loop(1); await sleep(2500); __loop(); return "uhr ${B_UHR} ${B_WETTER}"; } catch (e) { return "FEHLER " + e.message; }`;

(async () => {
    let sv = null, wk = null, zu = false;
    const erg = { treiber: "p3/n1811/bau-bild/vorher.cjs", baum: BAUM, kopf: spawnSync("git", ["-C", BAUM, "rev-parse", "HEAD"]).stdout.toString().trim(), zeit: new Date().toISOString(),
        fenster: "1920x1080", wort: WORT.join(" "), anker: ANKER, nur: NUR.length ? NUR : null, posenAus: process.env.VORHER_POSEN || null, orte: {}, bilder: {} };
    // ein Lauf mit VORHER_NUR schreibt in ein bestehendes vorher.json desselben Ordners nur seine Bilder neu
    if (NUR.length && fs.existsSync(path.join(AUS, "vorher.json"))) { try { erg.bilder = JSON.parse(fs.readFileSync(path.join(AUS, "vorher.json"), "utf8")).bilder || {}; } catch (_e) { /* */ } }
    const sichern = () => fs.writeFileSync(path.join(AUS, "vorher.json"), JSON.stringify(erg, null, 1));
    const gefahren = new Set();
    const ende = async () => {
        if (zu) return;
        zu = true;
        sichern();
        try { spawnSync(process.execPath, ["scripts/werkbank.cjs", "stop"], { cwd: BAUM, timeout: 30000, env: { ...process.env, WERKBANK_PORT: String(W) } }); } catch (_e) { /* */ }
        await warte(1500);
        for (const p of [wk, sv]) if (p && p.pid) try { spawnSync("taskkill", ["/PID", String(p.pid), "/T", "/F"], { windowsHide: true }); } catch (_e) { /* */ }
        // die Stand-Dateien des Laufs aus dem Baum, die von vorher zurück an ihren Ort
        for (const f of STAND) {
            try { if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "nach-" + f)); } catch (e) { log("Stand " + f + " nicht geräumt: " + e.message); }
            try { if (fs.existsSync(path.join(AUS, "vor-" + f))) fs.renameSync(path.join(AUS, "vor-" + f), path.join(BAUM, f)); } catch (e) { log("Stand " + f + " nicht zurückgelegt: " + e.message); }
        }
        log("ENDE");
    };
    for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => { log("Signal " + sig); erg.fehler = "abgebrochen: " + sig; ende().then(() => process.exit(1)); });

    // EIN BILD: sein Rumpf liefert den Eintrag; ein Wurf steht als `fehler`, der Lauf fährt fort
    const bild = async (name, fn) => {
        if (!will(name)) return;
        const B = BILDER.find((b) => b[0] === name), t = Date.now(), kopf = { befund: B[1], ort: B[2], was: B[3] };
        gefahren.add(name);
        if ((Date.now() - t0) / 1000 > MAX_S) erg.bilder[name] = { ...kopf, fehler: "Zeitgrenze des Laufs (" + MAX_S + " s) vor diesem Bild erreicht", kopf: erg.kopf };
        else
            try {
                erg.bilder[name] = { ...kopf, ...(await fn(name)), kopf: erg.kopf, sek: +((Date.now() - t) / 1000).toFixed(1) };
            } catch (f) {
                erg.bilder[name] = { ...kopf, fehler: String((f && f.stack) || f).slice(0, 900), kopf: erg.kopf, sek: +((Date.now() - t) / 1000).toFixed(1) };
                try { await ev("return __vb.frei();"); } catch (_e) { /* */ }
            }
        sichern();
        const e = erg.bilder[name];
        log("Bild " + name + " " + (e.sek == null ? "" : e.sek + " s ") + (e.fehler ? "FEHLER " + e.fehler.split("\n")[0].slice(0, 300) : "steht · Stufe " + (e.stufe || "–") + " · " + J(e.pose && r2(e.pose.kamera))));
    };
    // EIN ORT: wirft seine Aufstellung, stehen seine noch offenen Bilder mit dem Grund
    const ort = async (id, fn) => {
        const namen = BILDER.filter((b) => b[2] === id && will(b[0])).map((b) => b[0]);
        if (!namen.length) return;
        const t = Date.now();
        log("ORT " + id + ": " + namen.map((n) => n.split("-")[0]).join(" "));
        try {
            await fn();
        } catch (f) {
            const grund = "Ort " + id + " steht nicht: " + String((f && f.stack) || f).slice(0, 700);
            log("FEHLER " + grund.slice(0, 500));
            for (const n of namen) if (!gefahren.has(n)) { const B = BILDER.find((b) => b[0] === n); erg.bilder[n] = { befund: B[1], ort: B[2], was: B[3], fehler: grund, kopf: erg.kopf }; gefahren.add(n); }
            try { await ev("return __vb.frei();"); } catch (_e) { /* */ }
            sichern();
        }
        log("ORT " + id + " " + ((Date.now() - t) / 1000).toFixed(0) + " s");
    };
    // DER SCHUSS über /schirm: Pose setzen (VORHER_POSEN überstimmt sie), die Welt ruht, das Haus steht in seiner Stufe, Bühne
    // Mittag, Schuss, Lage lesen, Kamera und Sicht des Spiels zurück
    const posenAus = (name, o) => {
        const P = POSEN && POSEN[name] && POSEN[name].pose;
        if (P && P.spieler && P.kamera && P.ziel) Object.assign(o, { sp: P.spieler, kam: P.kamera, ziel: P.ziel, fov: P.fov, kamH: null, zielH: null, poseAus: "VORHER_POSEN" });
        return o;
    };
    const eintrag = (g, lz, h, o, mehr) => ({
        pose: { spieler: g.spieler, kamera: g.kamera, ziel: g.ziel, fov: g.fov, aus: o.poseAus || "gerechnet", sicht: lz.lage.sicht },
        welt: { uhr: lz.lage.uhr, weltTag: lz.lage.weltTag, wetter: lz.lage.wetter, saison: lz.lage.saison, saisonPhase: lz.lage.saisonPhase, nassTage: lz.lage.nassTage },
        siedlung: o.siedlung || null,
        haus: h ? { ...h, ...(lz.haus || {}), rolle: h.rolle || (lz.haus && lz.haus.rolle) || null } : null,
        stufe: lz.haus ? lz.haus.stufe : null,
        schirm: lz.lage.schirm,
        kameraIst: r2(lz.lage.kamera), fovIst: lz.lage.fov, spielerIst: r2(lz.lage.spieler),
        ...mehr,
    });
    const schuss = async (name, o, h) => {
        posenAus(name, o);
        const g = await ev(`return __vb.setz(${J(o)});`);
        if (!g || !g.kamera) throw new Error("die Pose steht nicht: " + J(g).slice(0, 300));
        const ruhe = await ev(`return await __vb.ruhe(${o.ruheS || 12}, ${o.minS || 3});`);
        const sw = h ? await ev(`return await __vb.warteStufe(${J(h.id)}, ${J(o.soll || null)}, ${o.stufeS || 15});`) : null;
        const bu = await ev(BUEHNE);
        if (/^FEHLER/.test(String(bu))) throw new Error("die Bühne steht nicht: " + bu);
        const datei = path.join(AUS, name + ".png");
        if (fs.existsSync(datei)) fs.unlinkSync(datei);
        const b = await ruf("/schirm", { datei });
        if (!fs.existsSync(datei)) throw new Error("/schirm ohne Bild: " + J(b).slice(0, 300));
        const lz = await ev(`return { lage: __vb.lage(), haus: ${h ? `__vb.info(__vb.e(${J(h.id)}), null)` : "null"}, ferne: __vb.ferne() };`);
        // DER PREIS an derselben Pose (VORHER_PREIS=1, nur wo die Pose `preis` trägt): `/lauf` stehend wie gasse.cjs, die Kamera hält
        let preis = null;
        if (o.preis && process.env.VORHER_PREIS) {
            const l = await ruf("/lauf", { sek: 20, ein: 10, regler: "frei" });
            fs.writeFileSync(path.join(AUS, name + ".lauf.roh.json"), JSON.stringify(l));
            preis = l && Object.fromEntries(Object.entries(l).filter(([, v]) => typeof v !== "object" || v === null || JSON.stringify(v).length < 600));
            log("PREIS " + name + " " + J(preis).slice(0, 700));
        }
        await ev("return __vb.frei();");
        return eintrag(g, lz, h, o, { preis, datei, methode: "/schirm an der Pose (_loopCamera), Bühne Uhr " + B_UHR + " · " + B_WETTER + " · Sommer", ruhe, stufeWarten: sw, stufeSoll: o.soll || null, stadtFerne: lz.ferne, hinweis: o.hinweis || null });
    };
    // DER SCHUSS über /bild (b16): der Spieler an der Pose, die Bühne des Schusses trägt Wetter und Saison (`werkbank bild --wetter
    // --saison`), --wahl 0. Ein ROT der Abnahme ist kein Fehler des Bilds: das Bild liegt dann als *-rot.png, es wird umbenannt und
    // der Grund steht in `abnahme`. Danach die Bühne zurück auf Mittag · Sonne · Sommer.
    const schussBild = async (name, o, h, wort) => {
        posenAus(name, o);
        const g = await ev(`return __vb.setz(${J({ ...o, ohneKamera: true })});`);
        if (!g || !g.kamera) throw new Error("die Pose steht nicht: " + J(g).slice(0, 300));
        const ruhe = await ev(`return await __vb.ruhe(${o.ruheS || 15}, ${o.minS || 3});`);
        const datei = path.join(AUS, name + ".png"), rot = path.join(AUS, name + "-rot.png");
        for (const f of [datei, rot]) if (fs.existsSync(f)) fs.unlinkSync(f);
        let lz = null, b = null;
        try {
            b = await ruf("/bild", { px: g.kamera[0], py: g.kamera[1], pz: g.kamera[2], lx: g.ziel[0], ly: g.ziel[1], lz: g.ziel[2], wahl: "0", w: 1920, h: 1080, uhr: 0.5, wetter: wort.wetter, saison: wort.saison, fov: g.fov, datei });
            lz = await ev(`return { lage: __vb.lage(), haus: ${h ? `__vb.info(__vb.e(${J(h.id)}), null)` : "null"}, schnee: (() => { try { const p = r.state.playerMesh.position; return r._schneeTrittAt(p.x, r.getTerrainHeightAt(p.x, p.z), p.z); } catch (e) { return "nicht lesbar: " + e.message; } })() };`);
        } finally {
            try { await ev(`window.__buehne({ uhr: 0.5 }); return 1;`); } catch (_e) { /* */ }
        }
        let abnahme = b && b.abnahme ? String(b.abnahme).slice(0, 400) : null;
        if (!fs.existsSync(datei) && fs.existsSync(rot)) { fs.renameSync(rot, datei); abnahme = "ROT (das Bild liegt trotzdem): " + String(b && b.fehler).slice(0, 500); }
        if (!fs.existsSync(datei)) throw new Error("/bild ohne Bild: " + J(b).slice(0, 500));
        return eintrag(g, lz, h, o, { datei, methode: "/bild --wahl 0 mit Wetter und Saison der Bühne", wort, ruhe, abnahme, schneeTrittAmSpieler: lz.schnee, hinweis: o.hinweis || null });
    };

    try {
        for (const f of STAND) if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "vor-" + f));
        const sl = fs.openSync(path.join(AUS, "save.log"), "w");
        sv = spawn(process.execPath, ["save-server.js"], { cwd: BAUM, env: { ...process.env, PORT: String(S) }, stdio: ["ignore", sl, sl], windowsHide: true });
        for (let i = 0; !(await da(S)); i++) { if (i > 60) throw new Error("save-server steht nicht"); await warte(1000); }
        const wl = path.join(AUS, "werkbank.log"), wf = fs.openSync(wl, "w");
        wk = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--echt", "--port", String(W), "--seite", "http://localhost:" + S, "--ort", "wiese"], { cwd: BAUM, env: { ...process.env, WERKBANK_FENSTER: "1920x1080" }, stdio: ["ignore", wf, wf], windowsHide: true });
        for (let i = 0; !/WERKBANK bereit/.test(fs.readFileSync(wl, "utf8")); i++) {
            if (i > 600 || /FEHLER/.test(fs.readFileSync(wl, "utf8"))) throw new Error("Werkbank nicht bereit: " + fs.readFileSync(wl, "utf8").slice(-400));
            await warte(1000);
        }
        log("bereit " + erg.kopf.slice(0, 9));
        await ev(SEITE.install);
        erg.boot = await ev(`return { schirm: r._schirm(), fenster: [innerWidth, innerHeight], version: (typeof AnazhRealm !== "undefined" && AnazhRealm.VERSION) || null, weltTag: r._weltTag(), uhr: r.state.timeOfDay, fov: AnazhRealm.KAM_FOV_GRAD, nahM: AnazhRealm.STADT_FERNE ? AnazhRealm.STADT_FERNE.nahM : null, satzBand: AnazhRealm.WELT_MARCH ? AnazhRealm.WELT_MARCH.satzBand : null };`);
        sichern();
        log("Boot " + J(erg.boot));

        // ════ STADT ════ die Gründung am Anker von stadt-voll, 3 × 3 Kacheln wach (wörtlich gasse.cjs Modus bild)
        await ort("stadt", async () => {
            await ev(`const st = r.state; window.__anazhAutoSettlement = false;
                st.playerMesh.position.set(${ANLAUF[0]}, r._voxelSurfaceY(${ANLAUF[0]}, ${ANLAUF[1]}) + 1.8, ${ANLAUF[1]});
                __loop(1);
                await __weltDa(() => AnazhRealm._siedlungGesetz());
                window.__aktT = performance.now(); window.__aktErg = null;
                r.spawnSettlement({ verlangt: "human", seed: ${SAMEN}, nH: ${NH}, position: { x: ${ANKER[0]}, y: 0, z: ${ANKER[1]} } }).then(
                    (res) => (window.__aktErg = { placed: res && res.placed, skipped: res && res.skipped, name: res && res.name, ms: Math.round(performance.now() - window.__aktT) }),
                    (e) => (window.__aktErg = { fehler: String((e && e.message) || e) }));
                return 1;`);
            for (let i = 0; i < 400; i++) {
                const q = await ev(`return { erg: window.__aktErg, offen: r._dorfOffen(), s: Math.round((performance.now() - window.__aktT) / 1000) };`);
                if (i % 6 === 0 || q.erg) log("Akt " + J(q).slice(0, 300));
                if (q.erg && (q.erg.fehler || !q.offen)) break;
                await warte(5000);
            }
            const gr = await ev(`const st = r.state, res = window.__aktErg || {};
                __loop();
                const SG = AnazhRealm._siedlungGesetz(), s = r._staedte()[0] || null;
                const c = s && st.worldMeta.settlementCells[s.key], B = r._bewohnerSiedlungen, P = s && B && B.get(s.key);
                return { res, zellM: SG.cellM, stadt: s && { key: s.key, seed: s.seed, nH: s.nH, ringe: s.ringe, x: s.x, z: s.z, cx: s.cx, cz: s.cz }, mitte: c && { nH: c.nH, stadt: c.stadt },
                    plan: P && { lose: P.plan.slots.length, mauer: P.plan.mauer ? P.plan.mauer.segs.length : 0, kernel: P.plan.kernel, region: P.plan.region, jahr: P.plan.jahr } };`);
            log("Gründung " + J(gr).slice(0, 900));
            if (!gr || !gr.stadt) throw new Error("keine Stadt: " + J(gr).slice(0, 300));
            const s = gr.stadt, M = gr.zellM;
            const SIED = { wort: WORT.join(" "), samen: SAMEN, nH: NH, anker: ANKER, key: s.key, region: gr.plan && gr.plan.region };
            // 3 × 3 Kacheln erwachen: der Spieler steht auf der Hauptstraße in der Mitte, bis die acht Nachbarn stehen (höchstens 600 s)
            const H = await ev(`return __haupt(${J(s)}, -1, 1, 0);`);
            const mi = H.reduce((b, q, i) => (Math.abs(q[0] - s.x) < Math.abs(H[b][0] - s.x) ? i : b), 0), P0 = H[mi];
            const acht = []; for (let k = -1; k <= 1; k++) for (let i = -1; i <= 1; i++) if (i || k) acht.push(s.cx + i + "," + (s.cz + k));
            const tW = Date.now();
            const st1 = await ev(`const p = r.state.playerMesh.position; p.set(${P0[0]}, r._voxelSurfaceY(${P0[0]}, ${P0[1]}) + 1.8, ${P0[1]}); r.state.yaw = ${Math.PI / 2};
                window.__anazhAutoSettlement = true; __loop(1);
                for (let i = 0; i < 2400 && (i < 24 || !${J(acht)}.every((k) => r.state.worldMeta.settlementCells[k]) || r._dorfOffen()); i++) await sleep(250);
                __loop();
                window.__anazhAutoSettlement = false;
                return { spieler: [+p.x.toFixed(1), +p.y.toFixed(1), +p.z.toFixed(1)], boden: +r._voxelSurfaceY(${P0[0]}, ${P0[1]}).toFixed(1), offen: r._dorfOffen(), zellen: Object.keys(r.state.worldMeta.settlementCells || {}).length, wach: ${J(acht)}.filter((k) => r.state.worldMeta.settlementCells[k]).length };`);
            const Z = await ev(`return __vb.haeuser(${J(s.key)});`), A = await ev("return __vb.alle();"), frei = freiIn(A), b0 = st1.boden;
            erg.orte.stadt = { gruendung: gr, P0, neun: { sek: Math.round((Date.now() - tW) / 1000), ...st1 }, haeuserMitte: Z.length, haeuserAlle: A.length, kulturen: [...new Set(Z.map((h) => h.kultur))], rollen: [...new Set(Z.map((h) => h.rolle || "wohnhaus"))], dorfZugNachDemErwachen: false };
            sichern();
            log("3 × 3 wach nach " + erg.orte.stadt.neun.sek + " s: " + J(st1) + " · Mitte " + Z.length + " Häuser, alle " + A.length);
            if (!Z.length) throw new Error("die Mitte der Stadt trägt kein Haus");
            const reihe = nachAbstand(Z.filter((h) => h.tuer && wohn(h)), s.x, s.z);
            const zwei = reihe.filter((h) => h.st >= 2).concat(reihe.filter((h) => h.st < 2));

            // b01a — die Gasse: 5 m vor der Tür-Wand, 2 m neben ihrer Mitte, Augenhöhe; das erste Wohnhaus ab der Mitte, dessen Pose frei steht
            let h1 = null;
            await bild("b01a-fenster-tafel-gasse-nah", async (name) => {
                let pose = null;
                for (const h of zwei) {
                    const w = wand(h, "tuer");
                    for (const seit of [2, -2, 0]) { const k = w.p(5, seit); if (frei(k[0], k[1]) && frei(...w.p(2.5, seit), 0.3)) { pose = { h, w, seit, k }; break; } }
                    if (pose) break;
                }
                if (!pose) throw new Error("kein Wohnhaus der Mitte mit freier Pose 5 m vor der Tür-Wand (" + zwei.length + " geprüft)");
                h1 = pose.h;
                const zp = pose.w.p(0, pose.seit);
                return schuss(name, { sp: pose.k, kam: [pose.k[0], null, pose.k[1]], kamH: 1.7, ziel: [zp[0], pose.h.y0 + 2.4, zp[1]], siedlung: SIED, soll: ["L0", "L1"], stufeS: 20, preis: true,
                    hinweis: "Haus: das erste Wohnhaus (zuerst ≥ 2 Geschosse) nach Abstand zur Stadt-Mitte mit freier Pose; Wand = Tür-Wand, seit " + pose.seit + " m" }, pose.h);
            });
            // b01b — der Hof: die Rückseite, 5 m (sonst 4 m) dahinter; zuerst dasselbe Haus
            await bild("b01b-fenster-tafel-hof-nah", async (name) => {
                let pose = null;
                for (const h of (h1 ? [h1] : []).concat(zwei)) {
                    const w = wand(h, "rueck");
                    for (const [dist, seit] of [[5, 0], [5, 2], [5, -2], [4, 0]]) { const k = w.p(dist, seit); if (frei(k[0], k[1]) && frei(...w.p(dist / 2, seit), 0.3)) { pose = { h, w, seit, k, dist }; break; } }
                    if (pose) break;
                }
                if (!pose) throw new Error("kein Wohnhaus der Mitte mit freier Pose hinter der Rückwand");
                const zp = pose.w.p(0, pose.seit);
                return schuss(name, { sp: pose.k, kam: [pose.k[0], null, pose.k[1]], kamH: 1.7, ziel: [zp[0], pose.h.y0 + 2.4, zp[1]], siedlung: SIED, soll: ["L0", "L1"], stufeS: 20, preis: true,
                    hinweis: (h1 && pose.h.id === h1.id ? "dasselbe Haus wie b01a" : "ANDERES Haus als b01a (dessen Rückseite stand nicht frei)") + "; Rückwand, " + pose.dist + " m, seit " + pose.seit + " m" }, pose.h);
            });

            // b06 — die Grenze nahM (STADT_FERNE.nahM 300, studio-bruecke.js:3656): der Abstand zählt waagrecht vom SPIELER
            // (`_bedarfAbstand`, vegetation-baum.js:2794), ein gehaltener Satz fällt erst jenseits 300 × 1,1 (`satzBand`). Darum der
            // Anlauf von außen: 345 m (der Satz fällt) → 310 m (Schuss b: Masse) → 290 m (Schuss a: Satz). Die Kamera 80 m über dem
            // Spieler, Tele 4°, dieselbe Richtung.
            const h6 = nachAbstand(Z.filter((h) => h.masse && wohn(h)), s.x, s.z)[0] || nachAbstand(Z, s.x, s.z)[0];
            let ri = null;
            for (let k = 0; k < 24 && !ri; k++) { const w = (k * 15 * Math.PI) / 180, v = [Math.sin(w), Math.cos(w)]; if ([290, 310, 345].every((d) => frei(h6.x + v[0] * d, h6.z + v[1] * d, 1.5))) ri = { grad: k * 15, v }; }
            if (!ri) ri = { grad: 0, v: [0, 1], nichtFrei: true };
            let anlauf = 0;
            const sechs = (d) => ({ sp: [h6.x + ri.v[0] * d, h6.z + ri.v[1] * d], kam: [h6.x + ri.v[0] * d, null, h6.z + ri.v[1] * d], kamH: 80, ziel: [h6.x, h6.y0 + 4, h6.z], fov: 4, siedlung: SIED, ruheS: 12 });
            const gehe = async (d, sek) => { const o = posenAus(d === 310 ? "b06b-grenze-aussen-310m" : "b06a-grenze-innen-290m", sechs(d)); const x = d === 345 && o.poseAus ? null : o; if (x) { await ev(`return __vb.setz(${J({ ...x, ohneKamera: true })});`); await ev(`return await __vb.ruhe(${sek}, 3);`); } };
            const von345 = async () => {
                // (mit VORHER_POSEN: 345 m in der Richtung der gemerkten Pose, vom Haus gesehen)
                const P = POSEN && POSEN["b06b-grenze-aussen-310m"] && POSEN["b06b-grenze-aussen-310m"].pose;
                const v = P ? [(P.spieler[0] - h6.x) / Math.hypot(P.spieler[0] - h6.x, P.spieler[1] - h6.z), (P.spieler[1] - h6.z) / Math.hypot(P.spieler[0] - h6.x, P.spieler[1] - h6.z)] : ri.v;
                const sp = [h6.x + v[0] * 345, h6.z + v[1] * 345];
                await ev(`return __vb.setz(${J({ sp, kam: [sp[0], null, sp[1]], kamH: 80, ziel: [h6.x, h6.y0 + 4, h6.z], ohneKamera: true })});`);
                const w = await ev(`await __vb.ruhe(10, 3); return await __vb.warteStufe(${J(h6.id)}, ["S4-masse", "ohne-bild"], 20);`);
                log("b06 Anlauf 345 m: " + J(w));
                anlauf = 345;
                return w;
            };
            await bild("b06b-grenze-aussen-310m", async (name) => {
                const a = await von345();
                anlauf = 310;
                return schuss(name, { ...sechs(310), soll: ["S4-masse"], stufeS: 30, hinweis: "Haus: das nächste Wohnhaus zur Stadt-Mitte mit Los der Ferne (_masse); Richtung " + ri.grad + "° (sin → x, cos → z)" + (ri.nichtFrei ? " — KEINE Richtung mit drei freien Standpunkten gefunden" : "") + "; Anlauf 345 m: " + J(a) }, h6);
            });
            await bild("b06a-grenze-innen-290m", async (name) => {
                let a = null;
                if (anlauf !== 310) { a = await von345(); await gehe(310, 8); }
                anlauf = 290;
                return schuss(name, { ...sechs(290), soll: ["S3-satz", "L0", "L1", "L2"], stufeS: 45, hinweis: "dasselbe Haus und dieselbe Richtung wie b06b, 20 m näher" + (a ? "; eigener Anlauf 345 → 310 m: " + J(a) : "") }, h6);
            });

            // b07 — die Kamera von kopf-4750-ueber-260m (gasse.cjs `ueber-260m`), der Spieler UNTER ihr: die ganze Stadt jenseits nahM
            await bild("b07-ferne-stadt-260m", (name) => schuss(name, { sp: [s.x - 520, s.z + 520], kam: [s.x - 520, b0 + 260, s.z + 520], ziel: [s.x, b0, s.z], siedlung: SIED, ruheS: 20, minS: 6,
                hinweis: "b0 = Boden an P0 (Hauptstraße in der Mitte) " + b0 + "; der Spieler steht unter der Kamera (735 m von der Mitte): die Stadt zeigt ihre Massen" }, null));
            // b15 — 60 m über einem freien Punkt 70 m südwestlich von P0, der Blick über die Mitte nach Nordosten
            await bild("b15-dachlandschaft-60m", (name) => {
                let sp = [P0[0] - 70, P0[1] + 70];
                aussen: for (let rad = 0; rad <= 14; rad += 2) for (let k = 0; k < 8; k++) { const x = P0[0] - 70 + rad * Math.sin((k * Math.PI) / 4), z = P0[1] + 70 + rad * Math.cos((k * Math.PI) / 4); if (frei(x, z, 1)) { sp = [x, z]; break aussen; } }
                return schuss(name, { sp, kam: [sp[0], null, sp[1]], kamH: 60, ziel: [P0[0] + 40, b0 + 6, P0[1] - 40], siedlung: SIED, ruheS: 15, minS: 5 }, null);
            });
        });

        // ════ DORF ════ der Messort `dorf` (das Dorf der Zelle −4,−4), aufgestellt von der Werkbank wie in ziel.cjs
        await ort("dorf", async () => {
            const u = await ruf("/umstellen", { ort: "dorf" });
            if (!u || u.fehler || !u.spieler) throw new Error("umstellen dorf: " + J(u).slice(0, 400));
            log("umstellen dorf " + J({ takte: u.takte, steht: u.steht, spieler: u.spieler, blick: u.blick }));
            // die Kamera des Spiels am Messort (wörtlich ziel.cjs): nah; fern = dieselbe Blickachse 70 m zurück, 18 m höher
            const d0 = u.blick ? Math.hypot(u.blick[0] - u.spieler[0], u.blick[1] - u.spieler[1]) : 10;
            const k = await ev("for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100); const c = r.state.camera; const v = c.getWorldDirection(new T.Vector3()).multiplyScalar(" + d0.toFixed(1) + ").add(c.position); return [c.position.x, c.position.y, c.position.z, v.x, v.y, v.z].map((x) => +x.toFixed(2));");
            const dx = k[3] - k[0], dz = k[5] - k[2], nn = Math.hypot(dx, dz) || 1;
            const fern = [+(k[0] - (dx / nn) * 70).toFixed(2), +(k[1] + 18).toFixed(2), +(k[2] - (dz / nn) * 70).toFixed(2), k[3], k[4], k[5]];
            await ev("window.__anazhAutoSettlement = false; return 1;");
            const nk = await ev(`const p = r.state.playerMesh.position; return __vb.naechste(p.x, p.z);`);
            if (!nk) throw new Error("am Messort dorf steht keine Siedlung");
            const D = await ev(`return __vb.haeuser(${J(nk.key)});`), A = await ev("return __vb.alle();"), frei = freiIn(A);
            if (!D.length) throw new Error("das Dorf " + nk.key + " trägt kein Haus");
            const C = [D.reduce((a, h) => a + h.x, 0) / D.length, D.reduce((a, h) => a + h.z, 0) / D.length];
            const SIED = { wort: "Messort dorf (haushalt.json: das Dorf der Zelle −4,−4, der Dorf-Zug gründet es)", key: nk.key, samen: null, mitte: r2(C) };
            erg.orte.dorf = { umstellen: { takte: u.takte, steht: u.steht, spieler: u.spieler, blick: u.blick || null }, kameras: { nah: k, fern }, key: nk.key, abstandM: +nk.d.toFixed(1), haeuser: D.length, kulturen: [...new Set(D.map((h) => h.kultur))], rollen: D.map((h) => h.rolle || "wohnhaus"), mitKamin: D.filter((h) => h.kamin).length, dorfZugNachDemUmstellen: false };
            sichern();
            log("Dorf " + J(erg.orte.dorf).slice(0, 700));
            const reihe = nachAbstand(D, C[0], C[1]), mitTuer = reihe.filter((h) => h.tuer);
            const hn = mitTuer[0] || reihe[0];

            await bild("b02-reihe-gleicher-haeuser", (name) => schuss(name, { sp: [fern[0], fern[2]], kam: [fern[0], fern[1], fern[2]], ziel: [fern[3], fern[4], fern[5]], siedlung: SIED, ruheS: 15, minS: 4,
                hinweis: "die ferne Kamera von welt-tag-fern (ziel.cjs): die Kamera des Spiels am Messort 70 m zurück, 18 m höher" }, null));
            await bild("b09-rauch-mittag", (name) => {
                const hk = reihe.find((h) => h.kamin) || null, h = hk || reihe[0];
                const tip = hk ? lok(h, hk.kamin.x, hk.kamin.z) : [h.x, h.z], ty = h.y0 + (hk ? hk.kamin.y : first(h));
                let v = [fern[0] - h.x, fern[2] - h.z]; const vl = Math.hypot(v[0], v[1]) || 1; v = [v[0] / vl, v[1] / vl];
                const kx = tip[0] + v[0] * 20, kz = tip[1] + v[1] * 20;
                return schuss(name, { sp: [kx, kz], kam: [kx, ty + 4, kz], ziel: [tip[0], ty, tip[1]], fov: 50, siedlung: SIED, ruheS: 15, minS: 6, soll: ["L0", "L1", "L2"],
                    hinweis: (hk ? "Haus: das nächste zur Dorf-Mitte mit Kamin-Zeile (entry.chimney); Ziel seine Kamin-Spitze" : "KEIN Haus des Dorfs trägt eine Kamin-Zeile — Ziel der First des Hauses an der Mitte") + "; Kamera 20 m zur fernen Kamera hin, 4 m über der Spitze" }, h);
            });
            await bild("b10-kein-hof", (name) => {
                let paar = null;
                for (let i = 0; i < D.length; i++) for (let j = i + 1; j < D.length; j++) { const d = Math.hypot(D[i].x - D[j].x, D[i].z - D[j].z); if (!paar || d < paar.d) paar = { a: D[i], b: D[j], d }; }
                if (!paar) throw new Error("das Dorf trägt nur ein Haus");
                const m = [(paar.a.x + paar.b.x) / 2, (paar.a.z + paar.b.z) / 2], q = [-(paar.b.z - paar.a.z) / paar.d, (paar.b.x - paar.a.x) / paar.d];
                let kp = null;
                for (const dist of [7, -7, 5, -5, 9, -9]) { const x = m[0] + q[0] * dist, z = m[1] + q[1] * dist; if (frei(x, z)) { kp = [x, z, dist]; break; } }
                if (!kp) throw new Error("keine freie Pose quer zum Zwischenraum der Häuser " + paar.a.id + " und " + paar.b.id);
                return schuss(name, { sp: [kp[0], kp[1]], kam: [kp[0], null, kp[1]], kamH: 1.6, ziel: [m[0], null, m[1]], zielH: 1.0, siedlung: SIED, ruheS: 15, soll: ["L0", "L1", "L2"],
                    hinweis: "die zwei Häuser mit dem kleinsten Abstand der Mitten (" + paar.d.toFixed(1) + " m): " + paar.a.id + " und " + paar.b.id + "; Kamera " + kp[2] + " m quer zur Verbindung, Ziel ihre Mitte 1 m über dem Boden", zweitesHaus: paar.b.id }, paar.a);
            });
            await bild("b05-rinne-traufe", (name) => {
                let pose = null;
                for (const h of reihe) {
                    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                        const e = lok(h, h.mx + (sx * h.W) / 2, h.mz + (sz * h.D) / 2), kk = lok(h, h.mx + sx * (h.W / 2 + 2.2), h.mz + sz * (h.D / 2 + 2.2));
                        if (frei(kk[0], kk[1], 0.6)) { pose = { h, e, kk, sx, sz }; break; }
                    }
                    if (pose) break;
                }
                if (!pose) throw new Error("keine Hausecke des Dorfs mit freier Pose");
                return schuss(name, { sp: pose.kk, kam: [pose.kk[0], null, pose.kk[1]], kamH: 1.4, ziel: [pose.e[0], pose.h.y0 + trauf(pose.h), pose.e[1]], fov: 65, siedlung: SIED, ruheS: 15, soll: ["L0"], stufeS: 20,
                    hinweis: "Haus: das nächste zur Dorf-Mitte mit freier Ecke; Ecke lokal (" + pose.sx + ", " + pose.sz + ") des Kern-Maßes, Kamera 3,1 m diagonal davor; Traufhöhe gerechnet " + trauf(pose.h).toFixed(2) + " m (Geschosse " + pose.h.st + ")" }, pose.h);
            });
            await bild("b11-sturz-massstab", (name) => {
                let pose = null;
                for (const h of mitTuer) {
                    const w = wand(h, "tuer"), sT = tuerS(h, w), tw = h.tuer.w || 1;
                    for (const vz of sT <= 0 ? [1, -1] : [-1, 1]) {
                        const ps = sT + vz * (tw / 2 + 0.9);
                        if (Math.abs(ps) > w.b - 0.3) continue;
                        const sp = w.p(1.0, ps), kk = w.p(5.5, sT - vz * 1.2);
                        if (frei(sp[0], sp[1], 0.3) && frei(kk[0], kk[1], 0.6)) { pose = { h, w, sT, vz, sp, kk, zp: w.p(0, sT + vz * (tw / 2 + 0.5)) }; break; }
                    }
                    if (pose) break;
                }
                if (!pose) throw new Error("kein Haus des Dorfs mit Tür-Zeile und freiem Platz vor der Tür-Wand");
                return schuss(name, { sp: pose.sp, kam: [pose.kk[0], null, pose.kk[1]], kamH: 1.5, ziel: [pose.zp[0], pose.h.y0 + 0.55 + 1.35, pose.zp[1]], fov: 55, sicht: "third", siedlung: SIED, ruheS: 15, minS: 6, soll: ["L0"], stufeS: 20,
                    hinweis: "der Spieler 1 m vor der Tür-Wand, " + (pose.vz > 0 ? "+" : "−") + " neben der Tür (Sicht third für den Schuss, danach zurück); Kamera 5,5 m vor der Wand, 1,5 m über dem Boden" }, pose.h);
            });
            await bild("b01c-fenster-tafel-fern", (name) => {
                let w = null, seite = null;
                for (const sn of ["tuer", "rueck", "links", "rechts"]) { const x = wand(hn, sn); if ([8, 16, 24, 32, 40, 50, 60].every((dd) => frei(...x.p(dd, dd / 5), 0.5))) { w = x; seite = sn; break; } }
                if (!w) { w = wand(hn, "tuer"); seite = "tuer (KEINE Wand mit freier Sichtlinie gefunden)"; }
                const kk = w.p(60, 12), zp = w.p(0, 0);
                return schuss(name, { sp: kk, kam: [kk[0], null, kk[1]], kamH: 8, ziel: [zp[0], hn.y0 + 3, zp[1]], fov: 12, siedlung: SIED, ruheS: 15, minS: 4, soll: ["L2"], stufeS: 20,
                    hinweis: "Haus: das nächste zur Dorf-Mitte mit Tür-Zeile; Wand " + seite + "; Kamera 60 m vor der Wand, 12 m quer, 8 m über dem Boden" }, hn);
            });
            await bild("b03-innenraum-schmiede", (name) => {
                const h = mitTuer.find((x) => x.rolle === "schmiede") || mitTuer.find((x) => x.rolle === "gasthaus") || mitTuer.find(wohn) || null;
                if (!h) throw new Error("kein Haus des Dorfs mit Tür-Zeile");
                const w = wand(h, "tuer"), sT = tuerS(h, w), kk = w.p(-0.9, sT), zp = w.p(-(2 * w.a - 0.6), -sT * 0.5), sp = w.p(2.2, sT);
                return schuss(name, { sp, kam: [kk[0], h.y0 + 0.55 + 1.6, kk[1]], ziel: [zp[0], h.y0 + 0.55 + 1.2, zp[1]], fov: 80, siedlung: SIED, ruheS: 15, minS: 5, soll: ["L0"], stufeS: 25,
                    hinweis: "Haus: Rolle des Loses „" + (h.rolle || "wohnhaus") + "“ (gesucht: schmiede, sonst gasthaus, sonst Wohnhaus — erkannt am Feld `rolle` des Loses im Plan); Kamera 0,9 m HINTER der Tür-Wand in der Achse der Tür, 1,6 m über dem Boden des EG (foundH 0,55), Blick zur Rückwand; der Spieler steht 2,2 m vor der Tür" }, h);
            });
        });

        // ════ WIESE ════ der Messort `wiese` (eben, offen): EIN Haus je Kultur an seinem Ort, die Tür-Wand zum offenen Blick (WSW)
        await ort("wiese", async () => {
            const u = await ruf("/umstellen", { ort: "wiese" });
            if (!u || u.fehler) throw new Error("umstellen wiese: " + J(u).slice(0, 400));
            const spec = JSON.parse(fs.readFileSync(path.join(BAUM, "spec/profiband/haushalt.json"), "utf8")).messorte.find((x) => x.id === "wiese");
            const O = spec.spieler, bl = [spec.blick[0] - O[0], spec.blick[1] - O[1]], bn = Math.hypot(bl[0], bl[1]) || 1, d = [bl[0] / bn, bl[1] / bn];
            const SIED = { wort: "einzelnes Haus am Messort wiese (spawnArchitecture, silent + precise)", samen: SOLO_SAMEN, ort: O, tuerWandNach: r2(d) };
            erg.orte.wiese = { umstellen: { takte: u.takte, steht: u.steht, spieler: u.spieler }, ort: O, blick: spec.blick };
            sichern();
            log("umstellen wiese " + J(erg.orte.wiese.umstellen));
            // ein Haus setzen: der Spieler tritt vorher 22 m in den offenen Blick (er stünde sonst im Grundriss)
            const solo = async (kultur, ov) => {
                const sp = [O[0] + d[0] * 22, O[1] + d[1] * 22];
                await ev(`return __vb.setz(${J({ sp, kam: [sp[0], null, sp[1]], ziel: [O[0], null, O[1]], zielH: 2, ohneKamera: true })});`);
                const a = await ev(`return await __vb.solo(${J(kultur)}, ${SOLO_SAMEN}, ${O[0]}, ${O[1]}, ${d[0]}, ${d[1]}, ${J(ov || null)});`);
                if (!a || a.fehler || !a.info) throw new Error("das Haus " + kultur + " steht nicht: " + J(a).slice(0, 400));
                log("Haus " + kultur + (ov ? " + Stempel" : "") + " steht: " + J({ id: a.info.id, type: a.info.type, W: a.info.W, D: a.info.D, n: a.info.n, st: a.info.st, pitch: a.info.pitch, takte: a.takte, tuerAusGesetz: a.tuerAusGesetz }).slice(0, 400));
                return a;
            };
            // die Bilder EINES Hauses; steht es nicht, stehen sie mit dem Grund
            const mit = async (kultur, ov, namen, fn) => {
                if (!namen.some(will)) return;
                let a = null, grund = null;
                try { a = await solo(kultur, ov); } catch (f) { grund = String((f && f.message) || f).slice(0, 600); log("FEHLER " + grund); }
                if (!a) { for (const n of namen) await bild(n, () => { throw new Error(grund); }); return; }
                await fn(a.info, a);
            };
            const dreiViertel = (h, mehr) => { const w = wand(h, "tuer"), kk = w.p(13, 9); return { sp: kk, kam: [kk[0], null, kk[1]], kamH: 1.7, ziel: [h.x, h.y0 + 3.2, h.z], fov: 55, siedlung: SIED, ruheS: 15, soll: ["L1", "L2"], stufeS: 20, ...mehr }; };
            const dachNah = (h, mehr) => { const w = traufWand(h), kk = w.p(4, 1.5), zp = w.p(-w.a * 0.5, 0); return { sp: kk, kam: [kk[0], h.y0 + trauf(h) + 2.2, kk[1]], ziel: [zp[0], h.y0 + (trauf(h) + first(h)) / 2, zp[1]], fov: 60, siedlung: SIED, ruheS: 15, soll: ["L0"], stufeS: 20, ...mehr }; };
            const dachHinweis = (h) => "Kamera 4 m vor der Trauf-Wand (die Wand an ±z des Kerns), 2,2 m über der gerechneten Traufe (" + trauf(h).toFixed(2) + " m), Ziel die halbe Dachfläche; First gerechnet " + first(h).toFixed(2) + " m (Neigung " + h.pitch + "°)";

            await mit("alemannisch", null, ["b04-moos-fachwerkholz", "b08-fachwerk-40m", "b13a-masse-alemannisch"], async (h) => {
                await bild("b04-moos-fachwerkholz", (name) => { const w = wand(h, "tuer"), kk = w.p(2.2, 1.5), zp = w.p(0, 2.3);
                    return schuss(name, { sp: kk, kam: [kk[0], null, kk[1]], kamH: 1.6, ziel: [zp[0], h.y0 + 1.9, zp[1]], fov: 60, siedlung: SIED, ruheS: 15, soll: ["L0"], stufeS: 20,
                        hinweis: "das Haus ist FRISCH gesetzt (kein altes Haus: die Welt wird nicht verstellt); sein Alter liest `_werkAlter` (haus.alter, Tage × Nässe des Orts), `geburt` null zählt ab Welttag 0; der Welttag steht in welt.weltTag" }, h); });
                await bild("b08-fachwerk-40m", (name) => { const w = wand(h, "tuer"), kk = w.p(33, 14);
                    return schuss(name, { sp: kk, kam: [kk[0], null, kk[1]], kamH: 1.7, ziel: [h.x, h.y0 + 3.5, h.z], fov: 20, siedlung: SIED, ruheS: 15, soll: ["L2"], stufeS: 20, hinweis: "33 m vor der Tür-Wand, 14 m quer: " + Math.hypot(33 + w.a, 14).toFixed(1) + " m zur Haus-Mitte" }, h); });
                await bild("b13a-masse-alemannisch", (name) => schuss(name, dreiViertel(h, { hinweis: "die feste Pose relativ zum Haus: 13 m vor der Tür-Wand, 9 m quer, Augenhöhe, Ziel die Haus-Mitte 3,2 m hoch" }), h));
            });
            await mit("italienisch", null, ["b13b-masse-italienisch", "b12b-deckung-terrakotta"], async (h) => {
                await bild("b13b-masse-italienisch", (name) => schuss(name, dreiViertel(h, { hinweis: "dieselbe Pose relativ zum Haus wie b13a, am selben Ort, derselbe Same" }), h));
                await bild("b12b-deckung-terrakotta", (name) => schuss(name, dachNah(h, { hinweis: "italienisch: KULTUR.label „Terrakotta“ (fachwerk-core.js:2128) — die Mönch-Nonne-Deckung der Wirklichkeit; " + dachHinweis(h) }), h));
            });
            await mit("franzoesisch", null, ["b12a-deckung-schiefer"], async (h) => {
                await bild("b12a-deckung-schiefer", (name) => schuss(name, dachNah(h, { hinweis: "franzoesisch: KULTUR.label „Schiefer, hoch“ (fachwerk-core.js:2127); Stroh nennt keine der 32 Kulturen (stil 'stroh' steht nur in STIL_GRENZNEIGUNG/der Stil-Tafel :160/:196) — kein Stroh-Bild; " + dachHinweis(h) }), h));
            });
            await mit("alemannisch", STUDIO_OV, ["b14-studio-werk-welt"], async (h, a) => {
                await bild("b14-studio-werk-welt", async (name) => ({ ...(await schuss(name, dreiViertel(h, { hinweis: "NUR WELT-SEITE: kein Editor-Bild. Das Werk: Preset alemannisch + Stempel der Zahlen-Regler über `_studioStampFor` (die Klemme des Vertrags), gesetzt mit spawnArchitecture({ studioOv }) — der Weg, auf dem auch das Los eines Orts seinen Stempel trägt; Figur/Stil/Dachtyp/Bogen/Farbe reisen auf diesem Weg nicht (tafel Z40)" }), h)),
                    studio: { preset: "alemannisch", verlangt: STUDIO_OV, stempel: a.stempel, geklemmt: a.geklemmt, kennt: a.kennt } }));
            });
            // b16 zuletzt: Wetter und Saison der Bühne (danach steht sie wieder auf Mittag · Sonne · Sommer)
            await mit("alemannisch", null, ["b16a-regen-ueberstand", "b16b-dach-winter"], async (h) => {
                await bild("b16a-regen-ueberstand", (name) => { const w = traufWand(h), kk = w.p(2.6, 1.0), zp = w.p(0.2, 2.0);
                    return schussBild(name, { sp: kk, kam: [kk[0], null, kk[1]], kamH: 1.5, ziel: [zp[0], h.y0 + trauf(h) - 0.3, zp[1]], fov: 70, siedlung: SIED, ruheS: 15,
                        hinweis: "Wetter `rainy` über die Bühne der Werkbank (`__buehne` → `__wetterSetzen` → `_setWeather(wort, \"human\")`), Nässe im Ruhezustand des Worts; 2,6 m vor der Trauf-Wand, Blick unter die Traufe" }, h, { wetter: "rainy" }); });
                await bild("b16b-dach-winter", (name) => schussBild(name, dachNah(h, { hinweis: "Saison `winter` + Wetter `rainy` über die Bühne (`setSeason`, `_tickSeason`: Tönung und Schneegrenze des Geländes); ein eigener Schnee-Schalter für Dächer ist im Stamm nicht gefunden — das Bild zeigt, was der Winter dem Dach gibt; " + dachHinweis(h) }), h, { wetter: "rainy", saison: "winter" }));
            });
            try { await ev("return __vb.soloWeg();"); } catch (_e) { /* */ }
        });
    } catch (e) {
        erg.fehler = String((e && e.stack) || e).slice(0, 900);
        log("FEHLER " + erg.fehler);
        // was der Lauf nicht mehr erreichte, steht mit dem Grund
        for (const B of BILDER) if (will(B[0]) && !gefahren.has(B[0])) erg.bilder[B[0]] = { befund: B[1], ort: B[2], was: B[3], fehler: "der Lauf brach vorher: " + erg.fehler.split("\n")[0], kopf: erg.kopf };
    } finally {
        const alle = BILDER.filter((b) => will(b[0])).map((b) => b[0]);
        erg.bilanz = { verlangt: alle.length, stehen: alle.filter((n) => erg.bilder[n] && !erg.bilder[n].fehler).length, fehler: alle.filter((n) => !erg.bilder[n] || erg.bilder[n].fehler), sek: Math.round((Date.now() - t0) / 1000) };
        log("Bilanz " + J(erg.bilanz));
        await ende();
        process.exit(erg.fehler ? 1 : 0);
    }
})();
