// faecher.cjs — DER FÄCHER: die EINE Probe-Bauart der Augen-Sprossen (R11, vision/REGELN.md). Eine Station der Punkte-Maschine schießt
// EIN Bild an EINER Pose (Deckel 60 s je Leiter); ein Blind-Blatt braucht ≥ 40 Paare (Isola et al. 2017: 40 Urteile je Sitzung nach
// 10 Übungen). Der Fächer schießt darum je Sprosse ≥ 40 Posen aus dem GESETZ ihrer Station — dieselbe Seiten-Funktion, dieselbe
// Formel der Pose, aufgefächert über die Adressen (Häuser, Äcker), Richtungen und Tageszeiten, die das Gesetz hergibt; gezählt und
// wiederholbar, nie von Hand gesucht. Gibt das Gesetz an < 40 Posen das Motiv her, ist das Urteil „Umfang nicht erzeugbar: n von
// 40“ mit Datei:Zeile — keine gestellte Pose, kein Ersatz-Motiv. Je Bild ≥ 720 Zeilen (am PNG gelesen) und eine Akte (sha, Gerät,
// Ort, Saat, Pose, Uhr).
//
//   node vision/pruefer/faecher.cjs start   --spiel <Spiel-Baum am Kopf> --aus <Ordner außerhalb> [--ort dorf] [--port 4631] [--seite-port 4611]
//   node vision/pruefer/faecher.cjs schiesse --sprosse <leiter#n>[,<leiter#n>…] --spiel <Baum> --aus <Ordner> [--port 4631] [--lauf-s 270]
//   node vision/pruefer/faecher.cjs stop    --aus <Ordner> [--port 4631]
//   node vision/pruefer/faecher.cjs --selftest
//
// `start` fährt den eigenen save-server (eigener Port) und die Werkbank `--echt --seite` an ihm (eigene PIDs in <aus>/sitzung.json),
// stellt an den Messort und prüft Seite, Version und Schirm; zwischen den Befehlen ruht der Loop der Werkbank. `schiesse` nimmt die
// Posen der Sprosse aus der Seite, schießt, was fehlt (ein vorhandenes Bild bleibt), und endet vor `--lauf-s`. Jeder Befehl läuft
// unter dem GPU-Schloss (meisterkarte-quelle/punkte/werkzeug/gpu-lauf.sh, ≤ 5 min); `stop` beendet nur die eigenen PIDs.
// Danach: paare.cjs --spiel <aus>/<leiter.n>/bild.
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const { spawn, execFileSync } = require("child_process");

const MIN = 40; // Paare je Blatt (pruefer.cjs MIN_PAARE)
const MAX = 44; // der Fächer schießt, bis 44 Bilder das Motiv tragen: Dubletten und dunkle Bilder kosten kein Blatt
// DAS MOTIV IM BILD: die Abnahme der Werkbank (/bild: Blickziel frei, Sicht frei) ist der Richter des Spiels — ein Bild, dessen Ziel
// hinter Gelände liegt oder dessen Sicht Laub verdeckt, trägt das Motiv nicht und zählt nicht (es liegt unter nicht/, mit Akte)
const GRUEN = (abnahme) => /ABNAHME GRÜN/.test(abnahme);
const ZEILEN = 720;
// die Tageszeiten des Fächers: Tag zwischen 07:55 und 16:05 (die Stationen schießen am Mittag oder zur Uhr der Sitzung)
const UHREN = [0.5, 0.4, 0.6, 0.33, 0.67, 0.45, 0.55, 0.36, 0.64];
const STATIONEN = path.join(__dirname, "..", "..", "meisterkarte-quelle", "punkte", "stationen");

// die Seiten-Funktionen einer Stations-Datei (ihr `seite: { … }` je Leiter) — der Fächer ruft das Gesetz der Station, nie eine Abschrift
function stationsSeite(datei) {
    const defs = {};
    const F = new Proxy({}, { get: (_, k) => (k === "leiter" ? (id, def) => ((defs[id] = def), { id }) : () => ({})) });
    const m = require(path.join(STATIONEN, datei));
    if (typeof m === "function") m(F);
    return defs;
}
const seiteVon = (datei, leiter, name) => {
    const d = stationsSeite(datei)[leiter];
    if (!d || !d.seite || typeof d.seite[name] !== "function") throw new Error("Gesetz fehlt: " + datei + " trägt an " + leiter + " keine Seiten-Funktion " + name);
    return String(d.seite[name]);
};
// die Seiten-Funktion STADT mit ihrer eigenen Zählung je Richtung: drei Zeilen ihres Ortsrands, am Wortlaut gefasst (ändert die Station
// sie, wirft der Fächer beim Namen statt still eine andere Zählung zu fahren)
function stadtAlle() {
    let s = seiteVon("k2-mensch-stadt.js", "mensch.stadt.groesse", "STADT");
    for (const [a, b] of [
        ["for (let i = 0; i < 8; i++) {", "for (let i = 0; i < 16; i++) {"],
        ["const a = (i * Math.PI) / 4;", "const a = (i * Math.PI) / 8;"],
        ["if (!best || L.length > best.L.length) best = { P, L, grad: i * 45 };", "if (!best || L.length > best.L.length) best = { P, L, grad: i * 22.5 }; (aus.alle = aus.alle || []).push({ P, n: L.length, grad: i * 22.5 });"],
    ]) {
        if (!s.includes(a)) throw new Error("Gesetz fehlt: k2-mensch-stadt.js trägt die Zeile des Ortsrands nicht mehr („" + a + "“)");
        s = s.replace(a, () => b);
    }
    return s;
}
const SAAT = "const saat = r.state.worldMeta && r.state.worldMeta.seed != null ? r.state.worldMeta.seed : null;";

// JE SPROSSE: der Messort, die Zeile des Gesetzes, der Rumpf in der Seite (r = Welt, T = THREE) → { saat, posen: [{ pose, wort }], lage }
const SPROSSEN = {
    // der Ortsrand: die Station nimmt von 8 Richtungen die mit den meisten Häusern im Kegel der Kamera (k2-mensch-stadt.js:224–236,
    // ihr `imBlick`) — der Fächer nimmt 16 Richtungen desselben Kreises (R + 20 m, 8 m über Grund, Blick auf die Mitte) und nennt je
    // Richtung dieselbe Zählung. Sie kennt keine Verdeckung (Radeon 26.11.: „10 Häuser im Bild“ bei 67,5°, das Bild zeigt Wald):
    // das Motiv richtet die Abnahme der Werkbank — die Mitte frei, oder ein Haus des Weilers davor
    "mensch.stadt.groesse#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-stadt.js:224",
        faecher: "16 Richtungen um die Mitte der Häuser × Tageszeit",
        mehr: { wahl: 0 },
        motiv: (a) => GRUEN(a) || /Blickziel verdeckt von (an Punkt \d+ )?bauSatz/.test(a),
        rumpf: () =>
            SAAT +
            "const D = await (" + stadtAlle() + ")(r, T, { rand: true });" +
            "if (!D || D.fehler || !D.rand || !D.alle) return { saat, posen: [], lage: (D && D.fehler) || 'kein Ortsrand' };" +
            "const posen = D.alle.map((x) => ({ pose: x.P, wort: 'Ortsrand ' + x.grad + ' Grad, ' + x.n + ' Häuser im Bild' }));" +
            "return { saat, posen, lage: 'R ' + D.rand.R + ' m, stehend ' + D.steht + ' von ' + D.slots + ', Häuser im Bild je Richtung ' + D.alle.map((x) => x.n).join(' ') };",
    },
    // 10 m vor der Tür: die Station nimmt das erste Wohnhaus mit Tür (k2-mensch-bau.js:73–74), der Fächer jedes stehende Haus mit Tür
    // des nächsten Orts (dieselbe Formel: Tür, Richtung Mitte → Tür, Auge 1,7 m, Blick 2,5 m über dem Fuß)
    "mensch.bau.huelle#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-bau.js:74",
        faecher: "jedes stehende Haus mit Tür des nächsten Orts × Tageszeit",
        mehr: {},
        // das Blickziel ist die Mitte des Hauses: seine eigene Wand davor IST das Motiv; Gelände, Laub oder Fels davor nicht
        motiv: (a) => GRUEN(a) || /Blickziel verdeckt von (an Punkt \d+ )?bauSatz/.test(a),
        rumpf: () =>
            SAAT +
            "const s = r.state, pm = s.playerMesh.position, hh = (x, z) => r.getTerrainHeightAt(x, z), steht = new Map();" +
            "for (const e of s.architectures || []) if (e && Number.isFinite(e.seed) && e.position) steht.set((e.seed >>> 0) + '@' + Math.round(e.position.x) + ',' + Math.round(e.position.z), e);" +
            "const orte = [];" +
            "for (const S of (r._bewohnerSiedlungen || new Map()).values()) { if (!S || !S.plan || !Array.isArray(S.plan.slots)) continue; const H = [];" +
            " for (const sl of S.plan.slots) { const wx = S.ox + sl.x, wz = S.oz + sl.z, e = steht.get((sl.seed >>> 0) + '@' + Math.round(wx) + ',' + Math.round(wz)); if (!e || !e.tuer) continue;" +
            "  const c = Math.cos(sl.phi || 0), sn = Math.sin(sl.phi || 0), tu = sl.tuer || { x: 0, z: 0 }, tx = wx + tu.x * c + tu.z * sn, tz = wz - tu.x * sn + tu.z * c;" +
            "  const mx = sl.obb ? S.ox + sl.obb.cx : wx, mz = sl.obb ? S.oz + sl.obb.cz : wz, ul = Math.hypot(tx - mx, tz - mz) || 1, ux = (tx - mx) / ul, uz = (tz - mz) / ul;" +
            "  H.push({ pose: { px: +(tx + ux * 10).toFixed(2), py: +(hh(tx + ux * 10, tz + uz * 10) + 1.7).toFixed(2), pz: +(tz + uz * 10).toFixed(2), lx: +wx.toFixed(2), ly: +(e.position.y + 2.5).toFixed(2), lz: +wz.toFixed(2) }," +
            "   wort: '10 m vor der Tür von ' + e.type + ' (' + (typeof sl.rolle === 'string' ? sl.rolle : 'wohnhaus') + ')' }); }" +
            " if (H.length) orte.push({ d: Math.hypot(S.ox - pm.x, S.oz - pm.z), H, name: S.plan.name || '?' }); }" +
            "orte.sort((a, b) => a.d - b.d); const nah = orte[0];" +
            "return { saat, posen: nah ? nah.H : [], lage: nah ? nah.name + ': ' + nah.H.length + ' Häuser mit Tür' : 'kein Haus mit Tür am Messort' };",
    },
    // der Rand des Ackers: die Station nimmt den nächsten gemalten Acker und schießt nur, wo er Halme der Frucht trägt
    // (k2-mensch-nahrung.js:724 und :746) — der Fächer jeden gemalten Acker, der Frucht trägt, an der Pose der Seiten-Funktion FRUCHT
    "mensch.nahrung.frucht#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-nahrung.js:746",
        faecher: "jeder gemalte Acker mit Halmen der Frucht × Tageszeit",
        mehr: { wahl: 0 },
        rumpf: () =>
            SAAT +
            "const Z = await (" + seiteVon("k2-mensch-nahrung.js", "mensch.nahrung.frucht", "ZENSUS") + ")(r, T, {});" +
            "const F = (Z.felder || []).filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2); const posen = []; let leer = 0;" +
            "for (const f of F) { let R = null; try { R = await (" + seiteVon("k2-mensch-nahrung.js", "mensch.nahrung.frucht", "FRUCHT") + ")(r, T, { feld: f }); } catch (e) { R = null; }" +
            " if (R && R.halme >= 1 && R.pose) posen.push({ pose: R.pose, wort: 'Acker ' + f.x + ',' + f.z + ': ' + R.halme + ' Strecken mit Halmen' }); else leer++; }" +
            "return { saat, posen, lage: (Z.felder || []).length + ' Äcker, gemalt ' + F.length + ', ohne Halme der Frucht ' + leer };",
    },
    // der Erntetag: die Station schießt nur, wo um 10 Uhr ≥ 50 Bewohner am Acker stehen (k2-mensch-nahrung.js:1015–1018) — der Fächer
    // jeden Acker aus seinen vier Diagonalen (12 m), 10 Uhr; unter 50 trägt das Gesetz das Motiv an keiner Pose
    "mensch.nahrung.hand#3": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-nahrung.js:1016",
        faecher: "jeder Acker × 4 Diagonalen, 10 Uhr",
        mehr: { uhr: 10 / 24 },
        uhren: [10 / 24],
        rumpf: () =>
            SAAT +
            "const Z = await (" + seiteVon("k2-mensch-nahrung.js", "mensch.nahrung.hand", "ZENSUS") + ")(r, T, {});" +
            "const posen = []; if (Z.feld10 >= 50) for (const f of Z.felder || []) for (const [a, b] of [[12, 12], [-12, 12], [12, -12], [-12, -12]])" +
            " posen.push({ pose: { px: f.x + a, py: '+1.7', pz: f.z + b, lx: f.x, ly: '+1.0', lz: f.z }, wort: 'Acker ' + f.x + ',' + f.z + ' aus ' + a + ',' + b });" +
            "return { saat, posen, lage: 'um 10 Uhr ' + Z.feld10 + ' am Acker (Soll der Station ≥ 50), ' + Z.bewohner + ' Bewohner, ' + (Z.felder || []).length + ' Äcker' };",
    },
    // die Glut: die Station setzt ihre Lava-Tat selbst und schießt am Spawn (k2-planet.js:1228); das Gesetz der Welt stellt keinen
    // Vulkan (kein Schlüssel am Planet-Faden, kein Leser eines Ausbruchs) — Adressen der Glut sind nur die Lava-Zellen, die die Welt trägt
    "planet.geologie.vulkan#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-planet.js:1228",
        faecher: "jede Adresse, an der das Gesetz der Welt Glut stellt",
        mehr: {},
        rumpf: () =>
            SAAT +
            "await r._fadenQuelle(); const o = await r._planetAuftrag({ type: 'planet-ort', samen: r._planetSamen(), breite: 10, laenge: 20, zeitMa: 0 });" +
            "const namen = new Set(); for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) namen.add(n);" +
            "const N = [...namen], leser = N.filter((n) => /vulkan|volcan|magma|ausbruch|eruption|roehre/i.test(n)), schl = Object.keys(o).sort().join(',') + ' · delta ' + Object.keys(o.delta || {}).sort().join(',');" +
            "return { saat, posen: [], lage: 'der Planet-Faden trägt ' + (/vulkan/.test(schl) ? 'einen' : 'keinen') + ' Vulkan (' + schl + '), die Welt ' + leser.length + ' Leser eines Ausbruchs; Glut steht nur an einer gesetzten Lava-Tat' };",
    },
};

// ───────────────────────── reine Teile (der Selbsttest fährt sie) ─────────────────────────
// der Fächer: die Posen des Gesetzes × Tageszeiten, Uhr um Uhr (geschossen wird, bis MAX Bilder das Motiv tragen); unter MIN ist
// der Umfang nicht erzeugbar
function faechern(basis, uhren, mehr) {
    const aus = [];
    for (const u of uhren) basis.forEach((b, i) => aus.push({ basis: i, pose: b.pose, wort: b.wort, mehr: Object.assign({}, mehr, { uhr: u }) }));
    return aus;
}
// eine Pose, deren Ziel hinter Gelände liegt, deren Sicht verdeckt ist oder deren Vordergrund das Bild füllt, bleibt es zu jeder Uhr
// (nie bei „kamm-krone“: die schwarzen Punkte, die das Spiel ab ≈ 2 min Sitzung über den Himmel zeichnet, sind kein Ort)
const ORT_FEST = (abnahme) => /verdeckt von (Gelände|Formation)|Sicht verdeckt|Vordergrund/.test(abnahme);
const umfang = (n, gesetz, lage) => (n >= MIN ? null : "Umfang nicht erzeugbar: " + n + " von " + MIN + " (" + gesetz + (lage ? " — " + lage : "") + ")");
// Breite und Zeilen eines PNG aus seinem Kopf (IHDR)
function pngMass(b) {
    if (!b || b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
    return { breite: b.readUInt32BE(16), zeilen: b.readUInt32BE(20) };
}
const ordner = (s) => String(s).replace("#", ".");
const nr = (i) => String(i + 1).padStart(2, "0");
const sha256 = (b) => crypto.createHash("sha256").update(b).digest("hex");

// ───────────────────────── die Werkbank ─────────────────────────
const opt = (n, v) => {
    const i = process.argv.indexOf(n);
    return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : v;
};
const ruf = (port, weg, nutzlast, ms) =>
    new Promise((res, rej) => {
        const req = http.request({ host: "127.0.0.1", port, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json", "x-rufer": "traegt" } }, (r) => {
            let d = "";
            r.on("data", (c) => (d += c));
            r.on("end", () => {
                try {
                    res(JSON.parse(d));
                } catch {
                    res({ roh: d });
                }
            });
        });
        req.setTimeout(ms || 120000, () => req.destroy(new Error("Werkbank " + weg + ": keine Antwort in " + (ms || 120000) + " ms")));
        req.on("error", rej);
        req.end(JSON.stringify(nutzlast || {}));
    });
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const evalSeite = async (port, code, ms) => {
    const a = await ruf(port, "/eval", { code, name: "faecher" }, ms);
    if (!a || a.fehler) throw new Error("Seite: " + ((a && a.fehler) || "ohne Antwort"));
    return a.ergebnis;
};

async function start() {
    const spiel = path.resolve(opt("--spiel"));
    const aus = path.resolve(opt("--aus"));
    const port = +opt("--port", 4631);
    const sp = +opt("--seite-port", 4611);
    const ort = opt("--ort", "dorf");
    fs.mkdirSync(aus, { recursive: true });
    const log = (n) => fs.openSync(path.join(aus, n), "w");
    const kind = (args, env, n) => {
        const k = spawn(process.execPath, args, { cwd: spiel, env: Object.assign({}, process.env, env), detached: true, windowsHide: true, stdio: ["ignore", log(n), log(n + ".err")] });
        k.unref();
        return k.pid;
    };
    const server = kind(["save-server.js"], { PORT: String(sp) }, "save-server.log");
    await schlaf(1500);
    const seite = "http://localhost:" + sp;
    const bank = kind(["scripts/werkbank.cjs", "start", "--port", String(port), "--ort", ort, "--echt", "--seite", seite], {}, "werkbank.log");
    const sha = execFileSync("git", ["-C", spiel, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    fs.writeFileSync(path.join(aus, "sitzung.json"), JSON.stringify({ server, bank, port, seite, spiel, sha, ort, start: new Date().toISOString() }, null, 1));
    const t0 = Date.now();
    for (;;) {
        const t = fs.readFileSync(path.join(aus, "werkbank.log"), "utf8");
        if (/WERKBANK bereit/.test(t)) break;
        if (Date.now() - t0 > 200000) throw new Error("die Werkbank meldet in 200 s kein „bereit“ (" + path.join(aus, "werkbank.log") + ")");
        await schlaf(1000);
    }
    console.log("Werkbank bereit nach " + ((Date.now() - t0) / 1000).toFixed(0) + " s");
    const u = await ruf(port, "/umstellen", { ort, sicht: "ego" }, 150000);
    if (!u || u.fehler) throw new Error("/umstellen " + ort + ": " + ((u && u.fehler) || "ohne Antwort"));
    const lage = await evalSeite(
        port,
        "let adapter = null; try { adapter = __abnahmeMessen({}).geraet.adapter; } catch (e) { adapter = null; }" +
            "const c = r.state.renderer.domElement; return { href: location.href, version: r.constructor.VERSION, schirm: typeof r._schirm === 'function' ? r._schirm() : null, leinwand: [c.width, c.height], adapter };",
        30000
    );
    if (!String(lage.href).startsWith(seite)) throw new Error("die Werkbank lädt " + lage.href + ", nicht den eigenen save-server " + seite);
    const S = JSON.parse(fs.readFileSync(path.join(aus, "sitzung.json"), "utf8"));
    Object.assign(S, { lage, bereitS: +((Date.now() - t0) / 1000).toFixed(0) });
    fs.writeFileSync(path.join(aus, "sitzung.json"), JSON.stringify(S, null, 1));
    console.log("am Messort " + ort + " · " + JSON.stringify(lage));
}

async function schiesse() {
    const aus = path.resolve(opt("--aus"));
    const S = JSON.parse(fs.readFileSync(path.join(aus, "sitzung.json"), "utf8"));
    const port = +opt("--port", S.port);
    const frist = Date.now() + +opt("--lauf-s", 270) * 1000;
    if (!S.lage || !S.lage.adapter) throw new Error("die Sitzung nennt kein Gerät (sitzung.json ohne Adapter) — kein Bild ohne Akte");
    for (const id of String(opt("--sprosse", "")).split(",").filter(Boolean)) {
        const D = SPROSSEN[id];
        if (!D) throw new Error("kein Fächer für " + id + " (gebaut: " + Object.keys(SPROSSEN).join(", ") + ")");
        if (D.ort !== S.ort) throw new Error(id + " misst am Messort " + D.ort + ", die Sitzung steht an " + S.ort);
        const hier = path.join(aus, ordner(id));
        fs.mkdirSync(path.join(hier, "bild"), { recursive: true });
        fs.mkdirSync(path.join(hier, "akte"), { recursive: true });
        const blatt = path.join(hier, "faecher.json");
        let G = fs.existsSync(blatt) ? JSON.parse(fs.readFileSync(blatt, "utf8")) : null;
        if (!G || G.sha !== S.sha) {
            // die Posen EINMAL je Kopf aus dem Gesetz: jeder weitere Lauf schießt dieselbe Liste weiter
            const g = await evalSeite(port, D.rumpf(), 120000);
            const posen = faechern(g.posen || [], D.uhren || UHREN, D.mehr);
            G = { sprosse: id, sha: S.sha, geraet: S.lage.adapter, version: S.lage.version, ort: D.ort, saat: g.saat, gesetz: D.gesetz, faecher: D.faecher, lage: g.lage, posenDesGesetzes: (g.posen || []).length, posen, urteil: umfang(posen.length, D.gesetz, g.lage) };
            fs.writeFileSync(blatt, JSON.stringify(G, null, 1));
        }
        console.log(id + ": " + G.posenDesGesetzes + " Posen des Gesetzes → Fächer " + G.posen.length + (G.urteil ? " · " + G.urteil : "") + " · " + G.lage);
        if (G.urteil) continue;
        fs.mkdirSync(path.join(hier, "nicht"), { recursive: true });
        const motiv = D.motiv || GRUEN;
        const akteVon = (i) => path.join(hier, "akte", nr(i) + ".json");
        const lies = (i) => (fs.existsSync(akteVon(i)) ? JSON.parse(fs.readFileSync(akteVon(i), "utf8")) : null);
        const stand = () => {
            const A = G.posen.map((_, i) => lies(i));
            return { A, traegt: A.filter((a) => a && a.traegt).length, fest: new Set(A.filter((a) => a && !a.traegt && ORT_FEST(a.abnahme)).map((a) => a.basis)) };
        };
        const ende = (wort) => {
            const s = stand();
            const offen = s.traegt >= MAX ? 0 : G.posen.filter((p, i) => !s.A[i] && !s.fest.has(p.basis)).length;
            G.bilder = s.traegt;
            G.ohneMotiv = s.A.filter((a) => a && !a.traegt).length;
            G.urteil = s.traegt >= MIN || offen ? null : umfang(s.traegt, D.gesetz, "das Motiv im Bild an " + s.traegt + " von " + s.A.filter(Boolean).length + " geschossenen Posen, " + s.fest.size + " von " + G.posenDesGesetzes + " Posen des Gesetzes verdeckt");
            fs.writeFileSync(blatt, JSON.stringify(G, null, 1));
            console.log(id + ": " + wort + " — " + s.traegt + " Bilder tragen das Motiv, " + G.ohneMotiv + " ohne, " + offen + " Posen offen" + (G.urteil ? " · " + G.urteil : ""));
            return s;
        };
        let frei = true;
        for (let i = 0; i < G.posen.length && frei; i++) {
            const P = G.posen[i];
            const s = stand();
            if (s.traegt >= MAX) break;
            if (s.A[i] || s.fest.has(P.basis)) continue;
            if (Date.now() + 35000 > frist) {
                frei = false;
                break;
            }
            const datei = path.join(hier, "bild", nr(i) + ".png");
            const rot = datei.replace(/\.png$/, "-rot.png");
            const t = Date.now();
            let a = null, da = null;
            // ein Wurf der Werkbank an einer Pose: EIN zweiter Versuch, dann steht die Pose mit ihrem Fehler in der Akte
            for (let v = 0; v < 2 && !da; v++) {
                a = await ruf(port, "/bild", Object.assign({ datei, w: 1280, h: 720 }, P.pose, P.mehr), 90000).catch((e) => ({ verbindung: e.message }));
                // eine Werkbank, die nicht antwortet, ist kein Urteil über die Pose: der Lauf endet beim Namen, keine Akte
                if (a && a.verbindung) throw new Error(id + " Bild " + nr(i) + ": die Werkbank antwortet nicht (" + a.verbindung + ") — Sitzung neu starten, die Posen bleiben offen");
                da = [a && a.datei, datei, rot].find((f) => f && fs.existsSync(f));
            }
            const abnahme = String((a && (a.abnahme || a.fehler)) || "").slice(0, 300);
            const akte = { sprosse: id, nr: i + 1, basis: P.basis, sha: S.sha, geraet: S.lage.adapter, version: S.lage.version, ort: D.ort, saat: G.saat, gesetz: D.gesetz, pose: P.pose, uhr: P.mehr.uhr, wort: P.wort, abnahme, sek: 0, datum: new Date().toISOString() };
            if (!da) Object.assign(akte, { traegt: false, fehler: "kein Bild nach zwei Versuchen" });
            else {
                if (da !== datei) fs.renameSync(da, datei);
                const b = fs.readFileSync(datei);
                const m = pngMass(b);
                if (!m || m.zeilen < ZEILEN) {
                    fs.unlinkSync(datei);
                    throw new Error(id + " Bild " + nr(i) + ": " + (m ? m.zeilen : 0) + " Zeilen < " + ZEILEN);
                }
                Object.assign(akte, { breite: m.breite, zeilen: m.zeilen, sha256: sha256(b), traegt: motiv(abnahme) });
                if (!akte.traegt) fs.renameSync(datei, path.join(hier, "nicht", nr(i) + ".png"));
            }
            akte.sek = +((Date.now() - t) / 1000).toFixed(1);
            fs.writeFileSync(akteVon(i), JSON.stringify(akte, null, 1));
        }
        ende(frei ? "Fächer durch" : "Frist des Laufs");
        if (!frei) return;
    }
    console.log("ALLE DURCH");
}

async function stop() {
    const aus = path.resolve(opt("--aus"));
    const S = JSON.parse(fs.readFileSync(path.join(aus, "sitzung.json"), "utf8"));
    await ruf(+opt("--port", S.port), "/stop", {}, 20000).catch((e) => console.log("stop: " + e.message));
    await schlaf(3000);
    // nur die EIGENEN PIDs der Sitzung
    for (const pid of [S.bank, S.server])
        try {
            process.kill(pid);
        } catch {
            /* schon fort */
        }
    console.log("Sitzung beendet (PIDs " + S.bank + ", " + S.server + ")");
}

function selbsttest() {
    const F = [];
    const t = (name, ok) => F.push([name, !!ok]);
    const basis = (n) => Array.from({ length: n }, (_, i) => ({ pose: { px: i }, wort: "p" + i }));
    t("16 Posen × 9 Uhren = 144, Uhr um Uhr, jede mit ihrer Pose des Gesetzes", faechern(basis(16), UHREN, { wahl: 0 }).length === 144 && faechern(basis(16), UHREN, { wahl: 0 })[47].mehr.uhr === 0.6 && faechern(basis(16), UHREN, {})[17].basis === 1);
    t("das Motiv: GRÜN trägt, ein Ziel hinter Gelände, Laub im Vordergrund oder verdeckte Sicht nicht; am Haus und am Weiler trägt ein Haus vor der Mitte", GRUEN("ABNAHME GRÜN · beweis") && !GRUEN("ABNAHME ROT [Ziel Blickziel verdeckt von Gelände in 27.49 m]") && SPROSSEN["mensch.bau.huelle#1"].motiv("ABNAHME ROT [Ziel Blickziel verdeckt von an Punkt 1 bauSatz in 108.8 m]") && !SPROSSEN["mensch.bau.huelle#1"].motiv("ABNAHME ROT [Ziel Blickziel verdeckt von Laub fscatter:tanne:L1 in 3.47 m]") && !SPROSSEN["mensch.stadt.groesse#1"].motiv("ABNAHME ROT [Vordergrund 50.0 % näher als 8 m (der halbe Ziel-Abstand): Laub]") && SPROSSEN["mensch.stadt.groesse#1"].motiv("ABNAHME ROT [Ziel Blickziel verdeckt von bauSatz in 57.78 m]") && !SPROSSEN["mensch.stadt.groesse#1"].motiv("ABNAHME ROT [Sicht verdeckt 28.5 % (Laub)]") && ORT_FEST("ABNAHME ROT [Vordergrund 50.0 % näher als 8 m]") && ORT_FEST("ABNAHME ROT [Ziel Blickziel verdeckt von Formation in 18.17 m]") && !ORT_FEST("ABNAHME ROT [Leinwand]") && !ORT_FEST("ABNAHME ROT [Ziel Blickziel verdeckt von kamm-krone in 3.47 m]"));
    t("3 Posen × 9 Uhren = 27: Umfang nicht erzeugbar beim Namen", /^Umfang nicht erzeugbar: 27 von 40 \(x:1/.test(umfang(faechern(basis(3), UHREN, {}).length, "x:1", "")));
    t("0 Posen: 0 von 40, kein Bild", umfang(faechern([], UHREN, {}).length, "x:1", "leer").includes("0 von 40") && faechern([], UHREN, {}).length === 0);
    t("40 Posen tragen", umfang(40, "x:1") === null);
    t("eine feste Uhr (Erntetag) fächert nur über Adressen", faechern(basis(12), [10 / 24], { uhr: 1 }).length === 12 && faechern(basis(12), [10 / 24], {})[0].mehr.uhr === 10 / 24);
    const png = Buffer.alloc(24);
    png.writeUInt32BE(0x89504e47, 0);
    png.writeUInt32BE(1280, 16);
    png.writeUInt32BE(360, 20);
    t("ein Bild in 360 Zeilen fällt am Kopf des PNG", pngMass(png).zeilen === 360 && pngMass(png).zeilen < ZEILEN && pngMass(Buffer.from("kein png, nur Text ......")) === null);
    t("jede Sprosse nennt Messort, Gesetz mit Zeile und Rumpf", Object.values(SPROSSEN).every((d) => d.ort && /:\d+$/.test(d.gesetz) && typeof d.rumpf === "function"));
    let rumpf = "";
    try {
        rumpf = Object.values(SPROSSEN).map((d) => d.rumpf()).join("\n");
        for (const d of Object.values(SPROSSEN)) new (Object.getPrototypeOf(async function () {}).constructor)("r", "T", d.rumpf());
    } catch (e) {
        rumpf = "FEHLER " + e.message;
    }
    t("die Rümpfe tragen die Seiten-Funktionen der Stationen und sind gültiger Text" + (rumpf.startsWith("FEHLER") ? " — " + rumpf : ""), !rumpf.startsWith("FEHLER") && /_bewohnerSiedlungen/.test(rumpf) && /aus\.alle/.test(rumpf) && /i < 16/.test(rumpf));
    let wurf = "";
    try {
        seiteVon("k2-mensch-stadt.js", "mensch.stadt.groesse", "GIBTESNICHT");
    } catch (e) {
        wurf = e.message;
    }
    t("ein fehlendes Gesetz wirft beim Namen", /Gesetz fehlt: k2-mensch-stadt.js/.test(wurf));
    const rot = F.filter((f) => !f[1]);
    for (const f of F) console.log((f[1] ? "GRÜN " : "ROT  ") + f[0]);
    console.log(F.length - rot.length + " GRÜN · " + rot.length + " ROT");
    process.exit(rot.length ? 1 : 0);
}

module.exports = { SPROSSEN, faechern, umfang, pngMass, MIN, MAX, ZEILEN, UHREN };
if (require.main === module) {
    const cmd = process.argv[2];
    const lauf = cmd === "--selftest" ? selbsttest : cmd === "start" ? start : cmd === "schiesse" ? schiesse : cmd === "stop" ? stop : null;
    if (!lauf) {
        console.error("Aufruf: faecher.cjs start|schiesse|stop|--selftest (Kopf der Datei)");
        process.exit(2);
    }
    Promise.resolve()
        .then(lauf)
        .catch((e) => {
            console.error("ROT " + String((e && e.message) || e));
            process.exit(1);
        });
}
