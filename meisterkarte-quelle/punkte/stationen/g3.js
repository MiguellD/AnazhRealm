// Stationen der Gruppe III (src/g3.js): Licht, Ferne, Material. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst sind die Kriterien mit Punkten (licht.K2, ferne.K1, ferne.K2), die Messschuld M43 (material.K3) und die Kriterien, die
// ein Zweig im Stau kippen soll (material-lack K1, material-mikro K2, material-albedo K3, w3v-licht licht.K1 und K3). Jede Station misst im Ausgabe-Bild
// auf der Karte (gpu: true, über gpu-lauf.sh); headless ist hier keine, weil keines dieser Sollwerte reine Mechanik ist.
//
// DIE FOLGE (`folge`, unten) fährt die Schritte der Station der Reihe nach in der Welt der Sitzung (punkte.cjs fahreSitzung:
// `werkbank start --echt` an WERKBANK_PORT, ihr Log PUNKTE_SITZUNG_LOG nennt die Karte) — sie startet und stoppt nie eine Welt
// (bis 29.10. bootete jede Folge ihre eigene, ohne --echt, und hielt mit `stop` an). Nach {AUS} schreibt sie
// `{ adapter, schritte: { name: { exit, json, rest } }, dateien, fehler }`; Bilder und base64 fallen weg. Weil der Code der Folge im Befehl steht, gehört er zum Abdruck: ändert er sich, zählt die alte Messung nicht.
// Ein Adapter wie swiftshader, llvmpipe, lavapipe oder software ist in jedem Urteil ROT.
//
// `stationen.fehlt` enthält, was sich nicht als Station fassen lässt, mit Grund und den Teilen, die schon messbar wären. Es steht
// neben der Liste, nicht in ihr: der Läufer nimmt jeden Eintrag mit `befehl: null` als „befehl ist kein argv“ und bräche sonst
// den Lauf aller Gruppen ab.
"use strict";
const PW = require("./proben-welt.cjs"); // die Proben der Welt in der Sitzung (licht.K1#1, licht.K3 — `werkbankLinse`)
const { probeBefehl } = require("./sitzung-seite.js"); // die Albedo-Tafel beider Seiten (material.K1, material.K3): Welt und Labor im Browser der Sitzung

// eslint-disable-next-line max-lines-per-function
async function folge(plan) {
    const fs = require("fs");
    const path = require("path");
    const cp = require("child_process");
    const crypto = require("crypto");
    const [AUS, KOORD] = process.argv.slice(1);
    const DIR = AUS + ".d";
    fs.mkdirSync(DIR, { recursive: true });
    const WB = path.join("scripts", "werkbank.cjs");
    const P = String(process.env.WERKBANK_PORT);
    const aus = { plan: plan.name, adapter: null, schritte: {}, dateien: {} };
    // @DIR@ · @KOORD@ · @T:<name>@ (ein Text aus plan.texte) · @<schritt>.<i>@ (das i-te Feld des Ergebnisses eines früheren Schritts)
    const ers = (s) =>
        String(s)
            .replace(/@T:([A-Z_]+)@/g, (_m, n) => plan.texte[n])
            .split("@DIR@").join(DIR)
            .split("@KOORD@").join(KOORD)
            .replace(/@([a-z0-9-]+)\.(\d+)@/g, (_m, n, i) => {
                const e = aus.schritte[n] && aus.schritte[n].json && aus.schritte[n].json.ergebnis;
                if (!Array.isArray(e) || e[+i] == null) throw new Error("Schritt " + n + " trägt kein Feld " + i + ": " + JSON.stringify(e));
                return String(e[+i]);
            });
    const duenn = (o) => (o == null ? null : JSON.parse(JSON.stringify(o, (_k, v) => (typeof v === "string" && v.length > 4096 ? undefined : v))));
    const json = (t) => {
        const s = String(t || "");
        const e = s.lastIndexOf("}");
        for (const i of [s.startsWith("{") ? 0 : -1, s.indexOf("\n{")])
            if (i >= 0 && e > i)
                try {
                    return JSON.parse(s.slice(i, e + 1));
                } catch (_e) {
                    /* der nächste Anfang */
                }
        return null;
    };
    const wb = (args, ms) =>
        cp.spawnSync(process.execPath, [WB, ...args, "--port", P], { encoding: "utf8", timeout: ms || 900000, maxBuffer: 1 << 28 });
    let code = 0;
    try {
        aus.adapter = (/\[linse-gpu\][^\r\n]*/.exec(fs.readFileSync(String(process.env.PUNKTE_SITZUNG_LOG), "utf8")) || [null])[0];
        for (const s of plan.schritte) {
            let args = (s.args || []).map(ers);
            if (s.probe) {
                // eine Seiten-Probe aus einer Datei; ihr git-Blob ist fest, damit eine geänderte Probe nie still mitmisst
                const roh = fs.readFileSync(ers(s.probe));
                const blob = crypto.createHash("sha1").update("blob " + roh.length + "\0").update(roh).digest("hex");
                if (blob !== s.blob) throw new Error("Probe " + s.probe + " ist Blob " + blob + ", die Station kennt " + s.blob);
                args = ["eval", roh.toString("utf8")];
            }
            const r = wb(args, s.ms);
            // der Rest der Ausgabe steht IMMER (29.10.: die Urteils-Zeile eines Werkzeugs, das daneben JSON druckt, fiel sonst weg)
            const e = { exit: r.status, json: duenn(json(r.stdout)), rest: String((r.stdout || "") + (r.stderr || "")).slice(-1500) };
            aus.schritte[s.name] = e;
            if (s.datei) {
                const f = ers(s.datei);
                aus.dateien[s.name] = fs.existsSync(f) ? duenn(JSON.parse(fs.readFileSync(f, "utf8"))) : null;
            }
            console.log("  " + s.name + " · Exit " + r.status + (e.json ? "" : " · " + String(e.rest).trim().split("\n").slice(-1)[0]));
            if (s.muss && r.status !== 0) throw new Error(s.name + ": Exit " + r.status + " " + String(e.rest || "").slice(-300));
        }
    } catch (e) {
        aus.fehler = String((e && e.message) || e);
        code = 1;
    } finally {
        fs.writeFileSync(AUS, JSON.stringify(aus, null, 1));
    }
    console.log(aus.adapter || "[linse-gpu] ungenannt");
    console.log(aus.fehler ? "FOLGE ROT: " + aus.fehler : "FOLGE " + plan.name + ": " + plan.schritte.length + " Schritte");
    process.exit(code);
}
const befehlDer = (plan) => ["node", "-e", "(" + folge.toString() + ")(" + JSON.stringify(plan) + ")", "{AUS}", "{KOORD}"];
// MSYS2_ARG_CONV_EXCL: gpu-lauf.sh ruft node über die Git-bash; ohne diese Variable würde msys die Pfade in den Argumenten umschreiben.
// Die Folge und die Albedo-Tafel (material.K1) treffen die Werkbank der Sitzung über WERKBANK_PORT (punkte.cjs setzt {PORT}+20000)
const envDer = { MSYS2_ARG_CONV_EXCL: "*" };
// DIE UHR DER POSE (w4-linsen-b): eine Probe stellt die Uhr (`setTimeOfDay`, die Bühne) und baut danach im Takt des Spiels — die Uhr
// läuft dabei weiter. spiegel-lack (material.K4#1) stellt 0,5 und baut den GT bis `__gebautNach`: die Uhr stand danach bei 0,50058
// (GTX 3ed95dcf), 0,50136 (Radeon 715754fc), 0,50188 (GTX 24a0f3ef) — die Gleichheit `uhr === 0.5` nahm jeder dieser Messungen die
// Pose (an 3ed95dcf Lack 0,9683 ≥ 0,5 und doch ROT, ohne Grund in der Zahl). Die Pose gilt, wenn die Uhr ± UHR_TOL Tag (± 14,4 min)
// bei der Soll-Stunde steht: am Mittag rückt die Sonne darin um höchstens 3,6° Stundenwinkel, ihre Höhe um Zehntelgrad. EIN Leser
// für jede Uhr einer Pose in dieser Gruppe (licht.K2, ferne.K1/K2, material.K4/K5)
const UHR_TOL = 0.01;
const uhrIst = (ist, soll) => Number.isFinite(ist) && Math.abs(ist - soll) <= UHR_TOL;

// Der Pfad des Wechsels (lod.K5, lod.K2): das Gesetz, seine Leser, der Regler, die Stufen der Kerne
const LOD_PFAD = [
    "stamm/vegetation-*.js",
    "stamm/siedlung-bauten.js",
    "stamm/studio-bruecke.js",
    "stamm/dirigent-regler.js",
    "stamm/dirigent-takt.js",
    "stamm/stoff-material.js",
    "foundry-core.js",
    "fachwerk-core.js",
    "porta-core.js",
    "vehicle-core.js",
    "phyto-core.js",
];

// Der Pfad, den jedes Ausgabe-Bild liest: Szene, Stoffe, Licht, Loop, Kerne, Seite, three r184, die Werkbank und ihre Aufnahme
const BILD = [
    "stamm/bild-*.js",
    "stamm/stoff-*.js",
    "stamm/dirigent-*.js",
    "stamm/daten.js",
    "foundry-core.js",
    "index.html",
    "vendor/**",
    "scripts/werkbank.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/licht-linsen.cjs",
    "scripts/lib/software-gpu.cjs",
    "scripts/lib/welt-boot.cjs",
    "scripts/lib/welt-orte.cjs",
    "spec/profiband/haushalt.json",
];

// fels-ziel.js aus material-mikro (artifacts/mikro, 9e124cd94): der höchste Punkt der nächsten Formation (formationenSatz) im
// Umkreis __felsR; der Spieler steht __felsD davor und blickt darauf. Rückgabe [h, x, y, z, sx, sz].
const FELS_ZIEL = `const st = r.state, pm = st.playerMesh.position, D = globalThis.__felsD || 6;
let best = null;
st.scene.traverse((o) => {
    if (!o.isMesh || o.name !== "formationenSatz") return;
    o.updateMatrixWorld(true);
    const M = o.matrixWorld, v = new T.Vector3(), q = new T.Vector3(), p = o.geometry.attributes.position, nn = o.geometry.attributes.normal;
    for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(M);
        if (Math.hypot(v.x - pm.x, v.z - pm.z) > (globalThis.__felsR || 8)) continue;
        q.fromBufferAttribute(nn, i).transformDirection(M);
        if (globalThis.__felsOben ? q.y < 0.7 : Math.abs(q.y) > 0.5) continue;
        const g = r._voxelSurfaceY(v.x, v.z), h = v.y - g;
        if (!(h > 0.4 && h < 4)) continue;
        if (!best || h > best.h) best = { h, x: v.x, y: v.y, z: v.z, nx: q.x, nz: q.z };
    }
});
if (!best) return "kein Fels";
let dx = best.nx, dz = best.nz, l = Math.hypot(dx, dz);
if (l < 0.3) (dx = pm.x - best.x), (dz = pm.z - best.z), (l = Math.hypot(dx, dz) || 1);
const sx = best.x + (dx / l) * D, sz = best.z + (dz / l) * D, gy = r._voxelSurfaceY(sx, sz);
st.playerMesh.position.set(sx, gy + 1, sz);
st.yaw = Math.atan2(best.x - sx, best.z - sz);
st.pitch = Math.atan2(best.y - (gy + 1.6), D);
return [+best.h.toFixed(2), +best.x.toFixed(2), +best.y.toFixed(2), +best.z.toFixed(2), +sx.toFixed(2), +sz.toFixed(2)];`;

const ARM = ["0.5", "1", "2"];
// DAS EINSCHWINGEN NACH EINEM ORTSWECHSEL in der Sitzung (material.K2#1): 30 echte Takte mit der Bühne, dann das EINE „die Welt
// steht" (`__weltStehtNach`, wie `umstellen`) — in Bau-Ereignissen, nie an der Wanduhr
const EIN_TAKT =
    "const takt = async () => { try { window.__buehne(); r._gameLoopTick(performance.now()); } catch (_e) {} await new Promise((x) => setTimeout(x, 16)); }; " +
    "for (let i = 0; i < 30; i++) await takt(); await window.__weltStehtNach(takt); return 1;";

// DIE ALBEDO-TAFEL IN DER SITZUNG (w4-stationen-schnell-a, 31.10.; material.K1#1 · K1#2 · K3#1 · K3#2 — Zwillinge, EIN Lauf): die
// Welt-Seite der Tafel EINMAL für beide Kriterien — `/albedo` der Werkbank am Ort ihrer Messung (Genesis, `gemessen.welt.ort` der
// Tafel: jede Zeile zu jeder Uhr — K3 liest Haus, Birke und Fichte in ihren Stufen, K1 die Zeilen der Klassen und die Karte) und die
// Stufen der Art rock; NEBEN der Welt das Labor: die Linse diag-albedo-tafel `messeLabor` als Bibliothek im Browser der Sitzung, jedes
// Studio eine Seite derselben Herkunft (der save-server der Sitzung) in EINEM eigenen Fenster (ein eigener Kontext — die Welt bleibt
// sichtbar und zeichnet; ein Tab dahinter zeichnete nie). Gerechnet wird je Zeile der Tafel am SHA: Welt/Labor und beide Seiten im
// realen Band ihrer Klasse (`H.seite.BAENDER`, fest in der Station mit Quelle — der Baum trägt kein Band, und eine Zeile ohne Band hier
// ist ROT); dazu die Eichung beider Seiten gegen die Karte der Tafel. Nach {AUS}: der Folge-Teil für K3 (`schritte` ort · welt · fels,
// `dateien.welt`) und der Tafel-Teil für K1 (`welt`, `labor`, `zeilen`, `eichung`); `fehler` nur, wenn die Welt-Seite nicht misst — ein
// Bruch des Labors steht in `laborFehler` (K1 urteilt das Labor selbst: ohne es „echt NEIN“), nie in der Welt-Messung von K3. Bis
// 31.10. maß K3 die Tafel in seiner Folge (`umstellen 0 0`, drei Werkbank-Prozesse) und K1 sie ein zweites Mal, das Labor dazu in
// einem eigenen Browser mit eigenem Statik-Server (GTX b4bcf19c: beide Läufe ≥ 90 s; ea07267e Radeon 5,37 min). DAS TEMPO in den
// Linsen des Spiels (w4-stationen-schnell-a): die Tafel taktet im Takt der Werkbank und seinem Bild (bis dahin 50 ms Schlaf je Takt,
// rund 680 Takte: 34 s), liest ihre Halb-Floats in einer Schleife (Node 46 → 6 ms je Pass, rund 385 Pässe), wertet in einer Liste aus
// (491 → 214 ms je Zeile) und schießt die Karte der Eichung nur im Gang, der sie liest (20 von 21 Karten las keiner).
// eslint-disable-next-line max-lines-per-function
async function probeAlbedo(H) {
    const { fs, path } = H;
    const t0 = Date.now();
    const DIR = H.AUS + ".d";
    fs.mkdirSync(DIR, { recursive: true });
    const duenn = (o) => (o == null ? null : JSON.parse(JSON.stringify(o, (_k, v) => (typeof v === "string" && v.length > 4096 ? undefined : v))));
    const log = process.env.PUNKTE_SITZUNG_LOG;
    const j = (H.teil = {
        plan: "material.K1+K3",
        adapter: (/\[linse-gpu\][^\r\n]*/.exec(log && fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "") || [null])[0],
        schritte: {},
        dateien: {},
        welt: null,
        labor: null,
        zeilen: [],
        eichung: null,
        fehler: null,
    });
    const t = JSON.parse(fs.readFileSync(path.join("spec", "farbe", "albedo-tafel.json"), "utf8"));
    // DAS LABOR NEBEN DER WELT: das Fenster des Labors im Browser der Sitzung, die Seiten der Studios vom save-server der Sitzung
    const labor = (async () => {
        const { browser } = await H.verbinde();
        const kontext = await browser.createBrowserContext();
        H.beimAbbau(() => kontext.close().catch(() => null));
        const { CODE_OF_SEITE } = require(path.resolve("scripts/lib/welt-boot.cjs"));
        const derSitzung = {
            newPage: async () => {
                const p = await kontext.newPage();
                await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
                await p.evaluateOnNewDocument(CODE_OF_SEITE);
                return p;
            },
            close: async () => {},
        };
        const server = {
            lausche: async () => server,
            zeige: (seite, frist, rest = "index.html", warte = "domcontentloaded") =>
                seite.goto("http://localhost:" + H.S + "/" + rest, { waitUntil: warte, timeout: frist }),
            close: () => {},
        };
        const L = H.linse("scripts/diag-albedo-tafel.cjs", ["messeLabor"], { stumm: { statikServer: () => server, starteBrowser: async () => derSitzung } });
        const AT = require(path.resolve("scripts/lib/albedo-tafel.cjs"));
        try {
            const m = await L.messeLabor({ echt: true, nur: null, tafel: AT.ladeTafel() });
            H.zeile("Labor " + Object.keys(m.labor).length + " Zeilen · " + m.geraet);
            return Object.assign(m, { datum: new Date().toISOString(), echt: true });
        } finally {
            await kontext.close().catch(() => null);
        }
    })().catch((e) => {
        j.laborFehler = "Labor: " + String((e && e.message) || e).split("\n")[0].slice(0, 300);
        H.zeile(j.laborFehler);
        return null;
    });
    // DIE WELT: an den Ort der Tafel, die Tafel, die Stufen der Art rock
    let Wm = null;
    const schritt = (name, o, exit) => (j.schritte[name] = { exit, json: duenn(o), rest: String((o && (o.tabelle || o.fehler)) || "").slice(-1500) });
    try {
        const gw = (t.gemessen && t.gemessen.welt) || {};
        if (gw.ort !== "genesis") throw new Error("die Tafel misst ihre Welt-Seite an " + JSON.stringify(gw.ort || gw.spieler) + ", die Probe steht an genesis");
        const um = await H.wb("/umstellen", { ort: "genesis", sicht: "ego" }, 300000);
        schritt("ort", um, um && !um.fehler ? 0 : 1);
        if (!um || um.fehler) throw new Error("umstellen: " + String((um && um.fehler) || "keine Antwort").slice(0, 300));
        H.zeile("ort · " + um.takte + " Takte");
        const wd = path.join(DIR, "welt.json");
        const al = await H.wb("/albedo", { datei: wd, ordner: path.join(DIR, "albw") }, 900000);
        schritt("welt", al, al && al.urteil === "GRUEN" ? 0 : 1);
        if (fs.existsSync(wd)) Wm = JSON.parse(fs.readFileSync(wd, "utf8"));
        j.dateien.welt = duenn(Wm);
        H.zeile("welt · " + (Wm ? Object.keys(Wm.welt || {}).length + " Zeilen, Karte " + Wm.eichung : "ohne Messung"));
        const fe = await H.wb("/eval", { code: H.seite.FELS }, 60000);
        schritt("fels", fe, fe && !fe.fehler ? 0 : 1);
        if (!Wm) throw new Error("albedo --tafel ohne Messung: " + j.schritte.welt.rest.slice(-300));
    } catch (e) {
        j.fehler = "Welt: " + String((e && e.message) || e).split("\n")[0].slice(0, 400);
    }
    const Lm = await labor;
    if (Wm && Lm) {
        const W = Wm.welt || {}, Lz = Lm.labor || {};
        j.welt = { echt: Wm.echt === true, geraet: Wm.geraet || null, eichung: Wm.eichung };
        j.labor = { echt: Lm.echt === true, geraet: Lm.geraet || null, eichung: (Lm.eichung && Lm.eichung.labor) || {}, fehler: Lm.fehler || [] };
        const k = t.karte || {};
        const ok = (y) => typeof y === "number" && Math.abs(y - k.albedo) <= k.eichRand;
        j.eichung = {
            soll: k.albedo,
            rand: k.eichRand,
            welt: Wm.eichung,
            labor: j.labor.eichung,
            gruen: ok(Wm.eichung) && Object.keys(j.labor.eichung).length > 0 && Object.values(j.labor.eichung).every(ok),
        };
        for (const z of t.zeilen) {
            const l = Lz[z.id] && Lz[z.id].Y, y = W[z.id] && W[z.id].Y;
            const e = H.seite.BAENDER[z.id] || null;
            const b = e && e.slice(0, 2);
            const bandOk = !!e;
            j.zeilen.push({
                id: z.id,
                L: l > 0 ? l : null,
                W: y > 0 ? y : null,
                v: l > 0 && y > 0 ? +(y / l).toFixed(4) : null,
                band: b,
                quelle: e && e[2],
                bandOk,
                inBand: bandOk && l > 0 && y > 0 && [l, y].every((x) => x >= b[0] && x <= b[1]),
            });
        }
    }
    j.sek = +((Date.now() - t0) / 1000).toFixed(1);
    console.log(j.adapter || "[linse-gpu] ungenannt");
    console.log(j.fehler ? "ALBEDO-TAFEL ROT: " + j.fehler : "ALBEDO-TAFEL " + j.zeilen.length + " Zeilen beider Seiten" + (j.laborFehler ? " — " + j.laborFehler : ""));
    return j;
}
// DAS REALE BAND je Zeile der Tafel (lineare Albedo-Luminanz, bei Metallen F0): Fels, Rinde und Laub wörtlich aus dem aaaa der
// Karte (src/g3.js material), die Dielektrika aus Frostbite (die Referenz der Karte unter „beste“), die Metalle aus dem Band der
// Natur des Spiels (scripts/diag-gegenstand-stoff.cjs BAND, PBR-Tafeln).
const DIEL = [0.0123, 0.871, "Frostbite (Lagarde & de Rousiers 2014, §3.2.1): Dielektrika sRGB 30–240 = linear 0,0123–0,871"];
const BAENDER = {
    rinde: [0.07, 0.12, "Karte material (aaaa): Rinde 0,07–0,12"],
    laub: [0.15, 0.26, "Karte material (aaaa): Laub/Gras 0,15–0,26"],
    fels: [0.1, 0.3, "Karte material (aaaa): Fels 0,10–0,30 (PSU EARTH 103, spec/abnahme/soll-tafel.json)"],
    boden: DIEL,
    haus: DIEL,
    "haus-l1": DIEL,
    "haus-l2": DIEL,
    lack: DIEL,
    haut: DIEL,
    fell: DIEL,
    tor: [0.25, 0.95, "Buntmetall (gegenstand-stoff BAND buntmetall; PBR-Tafeln: Messing/Bronze F0 ~0,8)"],
    klinge: [0.3, 0.95, "blankes Metall (gegenstand-stoff BAND blank; PBR-Tafeln: Eisen F0 0,56)"],
};
// die Stufen der Art rock (`_foundryKindStages`): zeigt die Welt den Fels nur in L0, ist die Fels-Hälfte von material.K3 erfüllt (M43)
const FELS_STUFEN =
    'const f = r._foundry, o = {}; for (const [k, v] of Object.entries((f && f.recipes) || {})) if (v && v.kind === "rock") o[k] = r._foundryKindStages(k); return o;';
// EINE Probe für vier Stationen (material.K1#1 · K1#2 · K3#1 · K3#2, Zwillinge): die Welt-Seite der Tafel in der Sitzung, das Labor
// daneben im Browser der Sitzung
const ALBEDO_SITZUNG = probeBefehl(probeAlbedo, 10, { BAENDER: JSON.stringify(BAENDER), FELS: JSON.stringify(FELS_STUFEN) });
const ALBEDO_PFAD = [
    ...BILD,
    "*-core.js",
    "stamm/**",
    "worlds/**",
    "spec/farbe/albedo-tafel.json",
    "scripts/lib/albedo-tafel.cjs",
    "scripts/diag-albedo-tafel.cjs",
];

// ───────── licht.K2 Staffel 2: die Spalten Uhr × Wetter ─────────
// Die Kugel-Probe von Staffel 1 (kugel.js, ihr Blob fest) stellt ihre Bühne selbst: `window.__buehne({})` (klar) und
// `r.setTimeOfDay(0.5, "human")`. Je Spalte setzt ein Schritt davor die Spalte in die Welt — die Bühne trägt das Wetter-Wort der
// Spalte (`__buehne` mit `wetter`, wie `werkbank bild --wetter`), der Uhr-Schreiber setzt die Uhr der Spalte (wie
// `licht --kontakt`: setTimeOfDay, der Sprung des Himmels, `_applyDayNightToScene`) — und ein Schritt danach nimmt beides
// zurück. Die Probe selbst bleibt Byte für Byte die von Staffel 1; ihr `stand` (uhr, wetter) beweist die Spalte im Urteil.
const LICHT_SPALTEN = [
    [0.5, "sunny"],
    [0.27, "sunny"],
    [0.73, "sunny"],
    [0.5, "rainy"],
    [0.27, "rainy"],
    [0.73, "rainy"],
];
const SPALTE_TEXTE = {
    SETZ: `const proto = Object.getPrototypeOf(r);
window.__buehneRoh = window.__buehneRoh || window.__buehne;
window.__buehne = (o) => window.__buehneRoh(Object.assign({}, o, { wetter: W }));
r.setTimeOfDay = function (_u, q) { const ok = proto.setTimeOfDay.call(this, U, q); this._himmelSprung = true; this._applyDayNightToScene(); return ok; };
return [U, W];`,
    LOS: "delete r.setTimeOfDay; if (window.__buehneRoh) window.__buehne = window.__buehneRoh; return 1;",
};

// DER HIMMEL ZUR SONNE (Soll der Karte am klaren Mittag „Himmel zur Sonne ≥ 1,2“, Liu & Jordan: der klare Himmel ist zur Sonne
// hin heller): eine 18-%-Kugel (das EINE Stoff-Programm der Welt, wie kugel.js) im Freien, die Sonne aus (dl.intensity 0: nur
// Himmel und Umgebung), Bühne klar, Uhr 0,5. Zwei Schüsse aus dem Ausgabe-Pfad (1920 × 1080): das Auge 4 m waagrecht auf der
// Sonnen-Seite bzw. auf der abgewandten, 0,5 m über der Kugel-Mitte, Blick auf die Mitte; je Schuss die Pixel mit waagrechter
// Normale (|N·up| ≤ 0,25), die zum Azimut der Sonne zeigt (N·a ≥ 0,85) bzw. von ihm weg (N·a ≤ −0,85) — das senkrechte
// Kugel-Paar; linear zurück wie kugel.js (sRGB, PBR Neutral invertiert, ÷ Belichtung). Der Ort: voraus im Blick des Messorts die
// erste Stelle, an der kein Werfer (SHADOW_TWIN_LAYER) die Strahlen über den Azimuten ±a (je ±45°) bei 20° und 45° Höhe in 60 m
// kreuzt (ein Wald auf einer Seite machte das Verhältnis zum Ort). ÜBER DEM KRONENDACH (w8-linsen-blick): an der Mess-Wiese, an Genesis
// und am Dorf ist keine Stelle 10–70 m um den Spieler am Boden frei (144 je Ort, Radeon 8e6262cc — Tanne, Fichte, Eiche, Birke im Strahl,
// der Wald wuchs seit w4-b-pflanzen) — dieselben Stellen, je Stufe höher (0 · 10 · 20 · 30 · 45 · 60 m über dem Boden), die erste freie;
// der Himmel ist die EINE Umgebung der Welt, die Höhe ändert ihn nicht, die Prüfung der Strahlen bleibt dieselbe.
async function himmelZurSonne(r, T) {
    const st = r.state;
    const rend = st.renderer;
    const cam = st.camera;
    const sc = st.scene;
    const dl = st.directionalLight;
    const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
    rend.setAnimationLoop(null);
    window.__buehne({});
    r.setTimeOfDay(0.5, "human");
    r._himmelSprung = true;
    r._applyDayNightToScene();
    for (let i = 0; i < 20 && typeof r._leuchtTakt === "function"; i++) (r._leuchtTakt(), await warte(50));
    const S = dl.position.clone().sub(dl.target.position).normalize();
    const a = new T.Vector3(S.x, 0, S.z).normalize();
    const R = 0.5;
    const P0 = st.playerMesh.position.clone();
    const fwd = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
    const quer = new T.Vector3(-fwd.z, 0, fwd.x);
    const rc = new T.Raycaster();
    rc.layers.set(AnazhRealm.SHADOW_TWIN_LAYER);
    rc.far = 60;
    const frei = (p) =>
        [1, -1].every((sg) =>
            [-45, 0, 45].every((dw) =>
                [20, 45].every((el) => {
                    const w = Math.atan2(a.z * sg, a.x * sg) + (dw * Math.PI) / 180;
                    const e = (el * Math.PI) / 180;
                    rc.set(p, new T.Vector3(Math.cos(w) * Math.cos(e), Math.sin(e), Math.sin(w) * Math.cos(e)));
                    return !rc.intersectObject(sc, true).some((h) => !(h.object.name || "").startsWith("probe:") && h.object !== st.playerMesh);
                })
            )
        );
    let mitte = null;
    let ueber = null;
    for (const hoch of [0, 10, 20, 30, 45, 60])
        for (const d of [10, 14, 18, 22, 27, 33, 40])
            for (const s of [0, 5, -5, 10, -10]) {
                if (mitte) break;
                const m = P0.clone().addScaledVector(fwd, d).addScaledVector(quer, s);
                m.y = r._voxelSurfaceY(m.x, m.z) + R + hoch;
                if (frei(m)) (mitte = m), (ueber = hoch);
            }
    if (!mitte) return { ende: "kein freier Himmel", stand: { uhr: st.timeOfDay, wetter: st.weather } };
    const geo = new T.SphereGeometry(R, 96, 64);
    const kugel = new T.Mesh(geo, r._buildToonNodeMaterial({ color: new T.Color(0.18, 0.18, 0.18) }));
    kugel.position.copy(mitte);
    kugel.castShadow = kugel.receiveShadow = true;
    kugel.frustumCulled = false;
    kugel.name = "probe:kugel:himmel";
    sc.add(kugel);
    const [fov0, pos0, quat0, I0] = [cam.fov, cam.position.clone(), cam.quaternion.clone(), dl.intensity];
    const W = 1920;
    const H = 1080;
    const srgb = (b) => {
        const v = b / 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const SC = 0.76;
    const DD = 1 - SC;
    const invNeutral = (y) => {
        const ymin = Math.min(...y);
        const ymax = Math.max(...y);
        let k = 1;
        if (ymax >= SC) {
            const np = Math.min(ymax, 0.9995);
            k = ((DD * DD) / (1 - np) - DD + SC) / np;
        }
        const um = ymin * k;
        const xm = Math.sqrt(um / 6.25);
        const off = um < 0.04 ? xm - 6.25 * xm * xm : 0.04;
        return y.map((v) => v * k + off);
    };
    const seiten = {};
    st.playerMesh.visible = false;
    dl.intensity = 0;
    try {
        for (const [name, sg] of [
            ["zur", 1],
            ["weg", -1],
        ]) {
            cam.fov = 50;
            cam.updateProjectionMatrix();
            cam.position.copy(mitte).addScaledVector(a, 4 * sg);
            cam.position.y += 0.5;
            cam.lookAt(mitte);
            cam.updateMatrixWorld(true);
            let x = null;
            for (let i = 0; i < 3; i++) {
                r._schattenAlleNeu();
                x = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
            }
            const [camM, projI, cp, belicht] = [cam.matrixWorld.clone(), cam.projectionMatrixInverse.clone(), cam.position.clone(), rend.toneMappingExposure];
            const pc = mitte.clone().project(cam);
            const rpx = (((R / mitte.distanceTo(cp)) * (H / 2)) / Math.tan((50 * Math.PI) / 360)) * 1.15;
            const [cx, cy] = [((pc.x + 1) / 2) * W, ((1 - pc.y) / 2) * H];
            const [sp, ray, v, hit] = [new T.Sphere(mitte, R), new T.Ray(), new T.Vector3(), new T.Vector3()];
            const Ys = [];
            let clip = 0;
            for (let y = Math.max(0, Math.floor(cy - rpx)); y < Math.min(H, Math.ceil(cy + rpx)); y++)
                for (let px = Math.max(0, Math.floor(cx - rpx)); px < Math.min(W, Math.ceil(cx + rpx)); px++) {
                    v.set(((px + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, 0.5).applyMatrix4(projI).applyMatrix4(camM);
                    ray.set(cp, v.sub(cp).normalize());
                    if (!ray.intersectSphere(sp, hit)) continue;
                    const N = hit.clone().sub(mitte).normalize();
                    if (N.dot(ray.direction) > -0.26 || Math.abs(N.y) > 0.25 || N.dot(a) * sg < 0.85) continue;
                    const i = (y * W + px) * 4;
                    const y8 = [x.u8[i], x.u8[i + 1], x.u8[i + 2]];
                    if (Math.max(...y8) >= 254) clip++;
                    const lin = invNeutral(y8.map(srgb)).map((c) => c / belicht);
                    Ys.push(0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]);
                }
            Ys.sort((p, q) => p - q);
            seiten[name] = {
                Y: Ys.length ? +Ys[Ys.length >> 1].toFixed(5) : null,
                n: Ys.length,
                clip,
                belicht: +belicht.toFixed(4),
                auge: cp.toArray().map((q) => +q.toFixed(2)),
            };
        }
    } finally {
        dl.intensity = I0;
        sc.remove(kugel);
        kugel.material.dispose();
        geo.dispose();
        cam.fov = fov0;
        cam.updateProjectionMatrix();
        cam.position.copy(pos0);
        cam.quaternion.copy(quat0);
        cam.updateMatrixWorld(true);
        st.playerMesh.visible = true;
    }
    const [z, w] = [seiten.zur, seiten.weg];
    return {
        ende: "ok",
        stand: { uhr: st.timeOfDay, wetter: st.weather },
        sonneGrad: +((Math.asin(S.y) * 180) / Math.PI).toFixed(1),
        ort: mitte.toArray().map((q) => +q.toFixed(1)),
        ueberBoden: ueber,
        seiten,
        himmelZurSonne: z.Y && w.Y ? +(z.Y / w.Y).toFixed(3) : null,
    };
}
// Der Befehl: die Git-bash reicht kein Argument über 8191 Zeichen an node weiter (gemessen 25.10.: 8060 kommt an, 10 860 bricht),
// Folge + Plan + Himmel-Probe in EINEM Argument wären 15 266. Darum `bash -c`: der erste node schreibt die Himmel-Probe (ein
// eigenes Argument) nach {AUS}.d/himmel.js, die Folge liest sie als Seiten-Probe mit festem Blob (wie kugel.js) — der Text steht
// im Befehl und im Abdruck, eine andere Datei fällt am Blob.
const HIMMEL = "return await (" + himmelZurSonne.toString() + ")(r, T);";
const HIMMEL_BLOB = require("crypto")
    .createHash("sha1")
    .update("blob " + Buffer.byteLength(HIMMEL) + "\0")
    .update(HIMMEL)
    .digest("hex");
const HIMMEL_SCHREIBER =
    'const fs = require("fs"); const [aus, t] = process.argv.slice(1); fs.mkdirSync(aus + ".d", { recursive: true }); fs.writeFileSync(aus + ".d/himmel.js", t);';
const befehlMitHimmel = (plan) => [
    "bash",
    "-c",
    'set -u; node -e "$1" "$3" "$5" && exec node -e "$2" "$3" "$4"',
    "licht",
    HIMMEL_SCHREIBER,
    befehlDer(plan)[2],
    "{AUS}",
    "{KOORD}",
    HIMMEL,
];

// Die Laub-Silhouette (lod.K1): die Klassen der Soll-Tafel (laub-kante `mass.werkzeug`), das Auge des Spiels zum Waldhang der Tafel
// (Gier aus der Richtung zum Ziel der Tafel, Neigung 0, das Rig 30 Schritte), Rückgabe die Pose des Auges als Kamera und Blickpunkt.
const LAUB_KLASSE = "^(f:(tanne|fichte|eiche|birke|buche|kiefer|weide|strauch|mammut)[a-z_]*:L[0-2]|fimp:[a-z_]+:L[0-2]|kronendach)$";
const LAUB_AUGE =
    "const st = r.state, pm = st.playerMesh.position; st.yaw = r._blickGierZu(-269 - pm.x, -1036 - pm.z); st.pitch = 0; " +
    "for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100); " +
    "const c = st.camera, d = new T.Vector3(); c.getWorldDirection(d); " +
    "return [c.position.x, c.position.y, c.position.z, c.position.x + 100 * d.x, c.position.y + 100 * d.y, c.position.z + 100 * d.z].map((v) => +v.toFixed(3));";
const LAUB_KANTE_MAX = 0.22;
const LAUB_PIXEL_MIN = 5000;
// das Rohe der Proben (stdout `LOD-K1 {…}` im Format von {AUS}); die Messung selbst liest {AUS}
const laubKanteRoh = (s) => {
    const m = /^LOD-K1 (\{.*\})$/m.exec(String(s || ""));
    try {
        return m ? JSON.parse(m[1]) : null;
    } catch (_e) {
        return null;
    }
};
function laubKanteUrteil(e) {
    if (!e) return { gruen: false, zahl: "keine Messung in {AUS}" };
    const hw = !!e.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(e.adapter);
    if (e.fehler) return { gruen: false, zahl: "Folge: " + e.fehler };
    let gruen = hw;
    const teile = [];
    for (const [schuss, titel] of [["tafel", "Tafel-Pose"], ["spielgang", "Spielgang"]]) {
        const s = e.schritte && e.schritte[schuss];
        const o = s && s.json;
        const k = o && o.klasse;
        // die Leinwand des Schusses steht im Begleit-JSON (`<bild>.abnahme.json`, die Folge liest es als `dateien`) — die Zeile der
        // Werkbank trägt `abnahme` als Satz (scripts/werkbank.cjs `/bild`), ihr `.bild` war nie da: bis w4-proben-tempo fiel jede
        // Messung „kein Bild der Klassen in 1920 × 1080“ (GTX 379e5f56: die Tafel stand nach 27,3 s, die Zahl las sie nicht)
        const a = e.dateien && e.dateien[schuss];
        const b = a && a.bild;
        if (!k || !k.klassen || !b || b.w !== 1920 || b.h !== 1080) {
            gruen = false;
            teile.push(titel + ": " + String((o && o.fehler) || (s && s.rest) || "kein Bild der Klassen in 1920 × 1080").slice(-160));
            continue;
        }
        const je = Object.entries(k.klassen).filter(([, m]) => m.pixel >= LAUB_PIXEL_MIN && m.kante != null);
        const karte = je.filter(([n]) => /^fimp:/.test(n));
        const schlecht = je.reduce((a, x) => (!a || x[1].kante > a[1].kante ? x : a), null);
        const dither = je.filter(([, m]) => m.zweiton !== 0).map(([n]) => n);
        if (!(karte.length && schlecht && schlecht[1].kante <= LAUB_KANTE_MAX && !dither.length)) gruen = false;
        teile.push(
            titel + " " + (schlecht ? "schlechteste " + schlecht[0] + " " + schlecht[1].kante.toFixed(4) : "ohne Klasse ≥ " + LAUB_PIXEL_MIN + " px") +
                " · Karte " + (karte.length ? karte.map(([n, m]) => n + " " + m.kante.toFixed(4) + " (" + m.pixel + " px)").join(", ") : "NICHT im Bild") +
                (dither.length ? " · zweiton ≠ 0: " + dither.join(", ") : "")
        );
    }
    return { gruen, zahl: teile.join(" | ") + " (Soll kante ≤ 0,22 je Teil-Klasse, zweiton 0) · " + (e.adapter || "Adapter ungenannt") };
}
// die Schlupflöcher als Mutanten (der Selbsttest urteilt jede): der Saum an beiden Bildern ist GRÜN, ebenso eine kleine Klasse unter
// 5 000 px mit zerrissenem Rand; die Karte von unten wie am 26.10. (0,2632), ein Dither statt Gestalt, ein Spielgang ohne Karte, ein
// Schuss in 1280 × 720, ein fehlender Schuss und swiftshader sind ROT
function laubKanteProben() {
    const kl = (o = {}) =>
        Object.assign(
            {
                "f:fichte:L1": { pixel: 265858, kante: 0.1897, zweiton: 0 },
                "f:tanne:L0": { pixel: 71125, kante: 0.1775, zweiton: 0 },
                "f:tanne:L1": { pixel: 290363, kante: 0.1598, zweiton: 0 },
                "fimp:atlas:L2": { pixel: 532920, kante: 0.2051, zweiton: 0 },
            },
            o
        );
    // ein Schuss: der Schritt der Folge (die Zeile der Werkbank, `abnahme` als Satz) und sein Begleit-JSON (`dateien`, die Leinwand)
    const schuss = (klassen, w = 1920) => ({ exit: 0, json: { klasse: { klassen }, abnahme: "ABNAHME ok" }, datei: { bild: { w, h: (w * 9) / 16 } } });
    const zeile = (o = {}) => {
        const sch = Object.assign({ tafel: schuss(kl()), spielgang: schuss(kl()) }, o.schritte || {});
        const e = { plan: "lod.K1#1", adapter: "[linse-gpu] amd/rdna-3", ...o, schritte: {}, dateien: {} };
        for (const [n, s] of Object.entries(sch)) {
            const { datei, ...schritt } = s;
            e.schritte[n] = schritt;
            if (datei) e.dateien[n] = datei;
        }
        return "LOD-K1 " + JSON.stringify(e);
    };
    const ohne = (n) => Object.fromEntries(Object.entries(kl()).filter(([k]) => k !== n));
    return [
        { name: "der Saum an Tafel und Spielgang", stdout: zeile(), gruen: true },
        { name: "eine kleine Klasse zerrissen", stdout: zeile({ schritte: { spielgang: schuss(kl({ "f:birke:L0": { pixel: 900, kante: 0.41, zweiton: 0 } })) } }), gruen: true },
        { name: "die Karte von unten 0,2632", stdout: zeile({ schritte: { tafel: schuss(kl({ "fimp:atlas:L2": { pixel: 532920, kante: 0.2632, zweiton: 0 } })) } }), gruen: false },
        { name: "Dither statt Gestalt", stdout: zeile({ schritte: { tafel: schuss(kl({ "fimp:atlas:L2": { pixel: 532920, kante: 0.17, zweiton: 0.4 } })) } }), gruen: false },
        { name: "Spielgang ohne Karte", stdout: zeile({ schritte: { spielgang: schuss(ohne("fimp:atlas:L2")) } }), gruen: false },
        { name: "Schuss in 1280 × 720", stdout: zeile({ schritte: { spielgang: schuss(kl(), 1280) } }), gruen: false },
        { name: "der Spielgang fehlt", stdout: zeile({ schritte: { spielgang: { exit: 1, json: null, rest: "Exit 1" } } }), gruen: false },
        { name: "die Tafel ohne Begleit-JSON (die Leinwand nur in der Zeile)", stdout: zeile({ schritte: { tafel: { exit: 0, json: { klasse: { klassen: kl() }, abnahme: "ABNAHME ok" } } } }), gruen: false },
        { name: "swiftshader", stdout: zeile({ adapter: "[linse-gpu] google/swiftshader" }), gruen: false },
    ];
}

// DIE LUFT IN DER SITZUNG (29.10.): ferne.K1#1, ferne.K2#1, ferne.K1#2 und ferne.K2#2 lesen EINEN Lauf (Zwillinge) — die Luft-Linse
// vom Hügel (Genesis + 120 m, Uhr 0,5 und 0,27 × 4 Azimute, das ferne Weiß) und vom Gipfel (Uhr 0,5 × 4 Azimute), danach am Messort
// Genesis die Band-Linse (Klasse boden im Haushalt). Bis dahin fuhren die drei ersten `licht --luft` je für sich (als Zwillinge EIN
// Lauf) und ferne.K2#2 dieselbe Luft ein zweites Mal vor ihrem Band. Das Urteil je Station liest die LUFT-Zeile im Rest des Schritts
// luft, die Messung in dateien.luft, den Adapter der Sitzung.
// DAS TEMPO (w4-stationen-schnell-a, 31.10., in den Linsen des Spiels): der Marsch der Luft (8 100 Strahlen je Sicht gegen das
// Gelände-Gesetz) geht je Strahl einmal (die Nachsicht mit Blende 1/4 marschierte denselben Blick ein zweites Mal; Genesis, Uhr 0,5:
// 18,2 → 10,4 Mio. Rufe des Gesetzes); das Band schwingt im Takt der Werkbank und seinem Bild statt 50 ms Schlaf je Takt ein, und ein
// ruhender Dorf-Plan (`_dorfTaktLebt` false am Messort genesis) hält es nicht mehr bis zum Deckel 240 s offen (Radeon a03b7b06:
// „dorfWaechst 0/18“, 4 007 Takte) — Befehl und Urteile unberührt.
const FERNE_SITZUNG = {
    sek: 10,
    befehl: befehlDer({
        name: "ferne",
        schritte: [
            { name: "luft", args: ["licht", "--luft", "--datei", "@DIR@/luft.json"], datei: "@DIR@/luft.json" },
            { name: "genesis", args: ["umstellen", "--ort", "genesis", "--sicht", "ego"], muss: true },
            { name: "band", args: ["band", "--ort", "genesis", "--datei", "@DIR@/band.json"], datei: "@DIR@/band.json" },
        ],
    }),
};
// die Luft des Laufs: die LUFT-Zeile (Rest des Schritts luft), die Messung, der Adapter der Sitzung
const luftDer = (j) => {
    const l = (j && j.schritte && j.schritte.luft) || {};
    const ad = (j && j.adapter) || null;
    return { rest: String(l.rest || ""), exit: l.exit, m: (j && j.dateien && j.dateien.luft) || null, ad, hw: !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad), fehler: j ? j.fehler : "keine Messung in {AUS}" };
};

// DIE LICHT-LINSEN IN DER SITZUNG (w4-fehlt-acht, proben-welt.cjs `werkbankLinse`): licht.K1#1 und licht.K3 fuhren `werkbank licht
// --tag|--laub --eigen` — ein eigenes Tor (SITZUNG_FEINDE). Hier derselbe Befehl der Linse gegen die Welt der Sitzung durch den
// Spiegel: das Abwarten ist die Beruhigung beim Namen, die Urteile sind die der Linse. Die Deckel sind die Arbeit, nie das Einschwingen:
// TAG je Ort 100 Uhren und ≥ 60 Fein-Uhren, je Uhr EINE Aufnahme; LAUB 33 Zeilen, je Karten-Zeile zwei Teleporte, zwei Schüsse und die
// Beruhigungen der Stufen — ungemessen an der Karte, die GPU-Fahrt nennt je Ruf die Sekunden.
// DIE NACHT PER UHR-SPRUNG (TAG): je Uhr springt die Uhr (die Linse: `setTimeOfDay`), der Licht-Pool springt mit ihr zu seinem Fixpunkt
// (Wahl- und Blend-Uhr zurück, EIN `_leuchtTakt` trägt die Stunde — die Linse wartete bis 20 × 50 ms), und die Aufnahme beruhigt beim
// Namen: DAS BILD STEHT, sobald zwei Folge-Bilder der Geschichte (TRAA, die als Mittel anläuft) dasselbe Mittel der unteren Hälfte
// tragen (≤ 0,2 %), höchstens die 32 der Linse (`__aufnahmeRuhig`, ihre Aufnahme am Anker der Warm-Bilder). DER WEG GEGEN DIE GESCHICHTE
// (die Linse des Wegs): an Uhr 0 · 0,25 · 0,5 · 0,75 je Ort daneben die volle Aufnahme der Linse — weichen hell, Y, X oder R/B über
// 0,5 Luma · 0,01 EV · 1 % ab, ist die Probe ROT beim Namen (Exit 1: das Urteil verlangt Exit 0), nie still kurz
const TAG_RUHE = [
    "for (let k = 0; k < nWarm; k++) frame();",
    "window.__ruheBilder = 0;\n" +
        "            for (let k = 0, m0 = null; k < nWarm; k++) {\n" +
        "                frame();\n" +
        "                if (nWarm < 2) continue;\n" +
        "                const px0 = await rend.readRenderTargetPixelsAsync(rt, 0, 0, BW, BH);\n" +
        "                const u0 = px0 instanceof Uint8Array ? px0 : new Uint8Array(px0.buffer || px0);\n" +
        "                const z0 = u0.length > BW * 4 * BH ? Math.ceil((BW * 4) / 256) * 256 : BW * 4;\n" +
        "                let s0 = 0, n0 = 0;\n" +
        "                for (let y = BH >> 1; y < BH; y += 2) for (let x = 0; x < BW; x += 2, n0++) s0 += window.luma709(u0, y * z0 + x * 4);\n" +
        "                const m = s0 / n0;\n" +
        "                window.__ruheBilder = k + 1;\n" +
        "                if (m0 !== null && Math.abs(m - m0) <= 0.002 * Math.max(m0, 1)) break;\n" +
        "                m0 = m;\n" +
        "            }",
];
const TAG_WEG = [
    'const u8 = (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;',
    'const u8 = (await window.__aufnahmeRuhig(W, H, 1, { satz: "messung" })).u8;\n' +
        "                const P = (window.__wegProbe = window.__wegProbe || { uhren: [0, 0.25, 0.5, 0.75], zeilen: [], bilder: [] });\n" +
        "                P.bilder.push(window.__ruheBilder);\n" +
        "                if (P.uhren.includes(u)) {\n" +
        "                    const masse = (b) => { const q = [0, 0, 0, 0, 0]; let n = 0; for (let i = (H / 2) * W * 4; i < W * H * 4; i += 4, n++) { q[0] += luma709(b, i); for (let c = 0; c < 3; c++) q[c + 1] += lin[b[i + c]]; q[4] += vor(luma709([lin[b[i]], lin[b[i + 1]], lin[b[i + 2]]])); } return [q[0] / n, luma709(q.slice(1)) / n, q[4] / n, q[1] / Math.max(q[3], 1e-9)]; };\n" +
        '                    P.zeilen.push([u, window.__ruheBilder, masse(u8), masse((await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8)]);\n' +
        "                }",
];
// das Urteil des Wegs in der Seite (nach der Linse): je Zeile [Uhr, Bilder, kurz, voll] mit [hell, Y, X, R/B]
const TAG_PRUEFE =
    "const P = window.__wegProbe || { zeilen: [], bilder: [] }; delete window.__wegProbe;" +
    " const ev = (a, b) => Math.abs(Math.log2(Math.max(a, 1e-9) / Math.max(b, 1e-9)));" +
    " const d = P.zeilen.map(([u, n, k, v]) => ({ uhr: u, bilder: n, hell: +Math.abs(k[0] - v[0]).toFixed(2), Y: +ev(k[1], v[1]).toFixed(4), X: +ev(k[2], v[2]).toFixed(4), rb: +Math.abs(k[3] / v[3] - 1).toFixed(4) }));" +
    " const rot = d.filter((x) => x.hell > 0.5 || x.Y > 0.01 || x.X > 0.01 || x.rb > 0.01).map((x) => 'Uhr ' + x.uhr + ' weicht ab: ' + JSON.stringify(x));" +
    " const B = P.bilder; return { aufnahmen: B.length, bilder: B.length ? [Math.min(...B), +(B.reduce((a, b) => a + b, 0) / B.length).toFixed(1), Math.max(...B)] : null, gegen: d, rot: !d.length ? 'keine Zeile gegen die Geschichte' : rot.length ? rot.join(' | ') : null };";
const TAG_LINSE = {
    vorher: ["umstellen", "--ort", "genesis", "--sicht", "ego"],
    args: ["licht", "--tag"],
    fenster: [640, 360],
    seite: {
        __aufnahmeRuhig: ["scripts/lib/ausgabe-aufnahme.cjs", "ausgabeAufnahme", [TAG_RUHE]],
        __tagKurve: ["scripts/lib/licht-linsen.cjs", "tagKurve", [["for (let i = 0, p; i < 20 && r._leuchtTakt; i++, await sleep(50)) {", "if (r._leuchtPool) r._leuchtPool.t = r._leuchtPool.uhr = -Infinity;\n                for (let i = 0, p; i < 20 && r._leuchtTakt; i++, await sleep(50)) {"], TAG_WEG]],
    },
    pruefe: TAG_PRUEFE,
};
// DER DECKEL DER ARBEIT (geschätzt, ungemessen an der Karte): zwei Orte × 100 Uhren und ≥ 60 Fein-Uhren, je Uhr der Sprung, der Himmel
// und EINE Aufnahme bis das Bild steht (640×360, ~3–5 Bilder), je Ort vier volle gegen die Geschichte, die Mess-Wiese kalt (9–18 s,
// Radeon eich3–6) — 40 s; die RUF-Zeilen je Kurve nennen die Sekunden je Uhr
const TAG_PROBE = { sek: 40, befehl: PW.torBefehl(PW.werkbankLinse, JSON.stringify(TAG_LINSE)) };
const LAUB_LINSE = {
    vorher: ["umstellen", "--ort", "dorf", "--sicht", "ego"],
    args: ["licht", "--laub", "ring,feld,feld0,feld90,feld180,panorama,spiegel,spiegel180,wasser,fichte,tanne", "--karte", "--uhr", "0.5,0.27,0.05", "--ort", "dorf"],
    fenster: [640, 360],
    ruheMax: 600,
};
// DER DECKEL DER ARBEIT (geschätzt, ungemessen an der Karte): 24 Wege des Lichts am Dorf (je ein Seiten-Ruf), drei Ringe, Fichte und Tanne
// je Uhr an der Mess-Wiese (die Wiese kalt 9–18 s, Radeon eich3–6), je Karten-Zeile zwei Teleporte, zwei Schüsse 320×240 und vier
// Beruhigungen — 60 s; je Beruhigung und teurem Ruf eine Zeile
// DIE STAFFEL 2 (33 Zeilen) über dem Gesetz der Fahrt (w4-proben-tempo2, 31.10.): GTX e0139769 86,5 s (Deckel aus der Zahl 130 s über
// 90 s), Radeon 6b3da705 am 60-s-Deckel gerissen — 10 s, UNGEMESSEN beim Namen wie die übrigen nie endenden, bis die Linse fällt
const LAUB_PROBE = { sek: 10, befehl: PW.torBefehl(PW.werkbankLinse, JSON.stringify(LAUB_LINSE)) };
// DIE STAFFEL 1 FÄHRT ALLEIN (w4-proben-tempo2): ihr Urteil liest neun Zeilen (fichte, tanne, ring je Uhr) — die Linse misst nur sie,
// nicht die 24 Wege der Staffel 2 (bis dahin EIN Lauf der Zwillinge, der jeden Deckel riss)
// Sie ändert die Welt (der Gang ans Dorf und zur Fichte legt Orte und Wege an, Sitzung 00d3f283): mutiert. DIE ZAHL (Radeon 7521ca51, der
// Plan je Art im Spiel-Zweig, unter fremder Last): der Ring am Dorf mit drei Uhren bis 28 s — davon der Gang ans Auge des Rings 17,3 s
// (57 m im lebenden Dorf) —, dann der Gang zur Mess-Wiese (600 m, kalt) für Fichte und Tanne, am 45-s-Deckel gerissen. Offen beim Namen:
// zwei Orte in EINER Probe; der Deckel bleibt 45 s (das Gesetz ohne Ausnahme). EIN ORT (w8-linsen-blick): Fichte und Tanne am Exemplar nächst
// dem Dorf (`--ort dorf`) — der Gang zur Mess-Wiese trug 18,1 s kalt im Deckel (Radeon 98a813b2, gerissen bei 45,1 s, als die Gestalt
// wieder zeichnete); dasselbe Gesetz, der Ort der Sitzung
const LAUB_PROBE_1 = {
    sek: 45,
    mutiert: true,
    befehl: PW.torBefehl(PW.werkbankLinse, JSON.stringify({ ...LAUB_LINSE, args: ["licht", "--laub", "ring,fichte,tanne", "--karte", "--uhr", "0.5,0.27,0.05", "--ort", "dorf"] })),
};
// DER WETTER-ZUG IN DER SITZUNG (licht.K5#1, w4-stationen-schnell-b; GTX b4bcf19c 69 s, am Gesetz 45 s gerissen): derselbe Befehl der
// Linse (`licht --luft --wetter rainy --zug`, `wetterZug` in licht-linsen.cjs) durch den Spiegel der Licht-Linsen. Zwei Täter beim Namen:
// (1) DER ORT: die Linse stellt selbst nach Genesis um — ihr Befehl nannte keinen Messort (`probeOrt` null), die Probe lief am Ende der
// Sitzung und zahlte den kalten Ring in ihrem Deckel; `vorher` nennt ihn, die Sitzung stellt Genesis VOR dem Deckel. (2) DIE LEINWAND:
// `__ausgabeAufnahme(160, 90)` rendert jede ihrer 33 Bilder (32 der Geschichte + 1) in der vollen Leinwand und mittelt erst danach
// auf 160×90 — im Fenster der Sitzung (1920×1080) je Spiel-Sekunde 33 Bilder zu 2,07 Mio. Pixeln, 125-mal. Im Fenster der Licht-Linsen
// (640×360, wie TAG und LAUB) ein Neuntel der Pixel; das Urteil liest die Summe der linearen Leuchtdichte eines Box-Mittels je Sekunde
// und den Sprung zwischen zwei Sekunden derselben Leinwand — dasselbe Maß, dieselbe Reihe, dieselben Wörter
const ZUG_PROBE = {
    sek: 33,
    befehl: PW.torBefehl(PW.werkbankLinse, JSON.stringify({ vorher: ["umstellen", "--ort", "genesis", "--sicht", "ego"], args: ["licht", "--luft", "--wetter", "rainy", "--zug"], fenster: [640, 360] })),
};
// ───────── DIE NEUN (p3-stationen-g3, 01.11.): schatten.K2 · K3 · K4 · K5 · licht.K4 · ferne.K3 · K4 · lod.K4 · vegetation.K3 ─────────
// Bis hierher standen sie in `fehlt` (Spike w4-stationen-a am main 94c079cb: was dem Spiel fehlt, beim Namen) und zählten 0 ungemessen.
// Jetzt misst EINE Probe der Sitzung alle neun im Ausgabe-Pfad (`__ausgabeAufnahme`, satz „messung“) der warmen Welt am Ort dorf (die
// Sitzung stellt ihn VOR dem Deckel, punkte.cjs `probeOrt`: Häuser, Feuerstelle, Wald und Fern-Ring an EINEM Ort) — neun Zwillinge, EIN
// Lauf. DER DECKEL ist das Gesetz der Fahrt, nie die Arbeit: Radeon 1 790 + 10 = 1 800 s, GTX 1 795 von 1 800 s. Die Arbeit (geschätzt,
// ungemessen an der Karte): ~18 Aufnahmen, ein Gang von 2 × 20 Bildern, zwei Märsche des Gelände-Gesetzes (≈ 50 000 Rufe
// `_terrainMacroSurfaceY`) — mehr als 10 s. Darum misst die Probe gegen ihr Budget (`budgetS`, ab dem Start des Prozesses) in der Reihe
// unten; wer nicht mehr drankommt, schreibt KEINE Zeile — sein Urteil gleicht dem über den leeren Lauf, die Maschine nennt ihn
// UNGEMESSEN beim Namen (punkte.cjs keinUrteil a), nie ein ROT, das kein Urteil über das Spiel ist. Die Zeit je Teil steht in `s`.
// Jeder Teil misst, was der Spieler sieht: Körper der Probe (`probe:neun:*`, der EINE Stoff der Welt `_buildToonNodeMaterial`, castShadow
// = die Wurf-Ebene), die Uhr der Bühne (`__buehne`), das Gelände-Gesetz für Orte jenseits des Rings; nach jedem Teil fallen seine Körper,
// am Ende stehen Kamera, Uhr, Wetter, Bild-Uhr, Schatten und Fenster, wie die Probe sie fand. Linear heißt: sRGB zurück, PBR Neutral
// zurück, durch die Belichtung (wie `licht --kontakt`).
// DIE REIHE (Teil A im Fenster der Sitzung 1920 × 1080, Teil B im Fenster der Licht-Linsen 640 × 360):
//   ferne.K3   Kamm-Saum: Höhe über dem Spieler 25 · 60 · 120 m und Azimut mit den meisten Kamm-Spalten im Band (Gesetz-Marsch
//              je Spalte bis 8 km; Spalten, in denen ein naher Körper den Kamm deckt, fallen unten); der Himmel ist, was ein Schuss nur mit dem Himmel gleich zeigt; Kohärenz des
//              Struktur-Tensors am Umriss gegen den Himmel (`__klassenMasse` kante — dieselbe Funktion wie die REF 0,160) über den
//              Spalten mit Kamm in 0,4–4 km, die Umriss-Schwankung (RMS gegen den Median über 7 Spalten, in m am Kamm) über 1,5–2,5 km.
//              Spalten, deren Umriss > 12 px über dem Gesetz steht, trägt ein naher Körper (fallen).
//   schatten.K4  eine weiße Wand 4 × 3 m (Albedo 0,8) auf freiem, ebenem Boden, die Fläche von der Sonne weg (Eigenschatten, N·L < 0),
//              Uhr 0,5: Luma der Fläche mit dem besonnten Boden davor gegen den Gegenschuss mit einer Platte Albedo 0 (16 × 16 m) davor.
//   schatten.K3  ohne Sonne (nur Himmel und Umgebung — die Himmels-Sicht allein): ein Körper wie ein stehender Mensch (0,45 × 1,75 × 0,3,
//              der Fuß) und ein Haus-Block 4 × 3 × 4 m (der Sockel), die Stirnflächen auf einer Linie, auf freiem Boden ohne Halm-Marke
//              (Raster ±150 m, Grün ≤ 0,05) und Höhe aus dem gezeichneten Boden; das Auge 2 m davor, 2,5 m hoch: das Kontaktband
//              7–16 cm vor der Fläche gegen den freien Boden 1–1,6 m davor, je mit/ohne Körper (die Textur des Bodens fällt heraus), nur
//              über Punkten, deren Plättchen das Auge sieht (w6-g3-linsen).
//   lod.K4     derselbe Blick der Sitzung, das Auge der Stufen (`_lodAuge`, die EINE Naht von Maske und Wahl) um ±4 m längs des Blicks
//              versetzt: die Pixel, die der Wechsel ändert, ihre Luma vorher/nachher und das Zweiton-Raster (`__klassenMasse`).
//   licht.K4   Deckung 0,4 gegen 0, die Bild-Uhr t und t + 5 s, das Auge 600 m LOTRECHT über dem Boden: der Durchlass D = (Bild − Bild
//              ohne Richtlicht) bei 0,4 gegen bei 0 über besonnten Blöcken (die statische Sonnen-Maske fällt heraus); Varianz von D, die
//              beste Korrelation D(t) ↔ D(t + 5) über die Verschiebung und der Anteil der Änderung, den sie erklärt — ein gemaltes
//              Muster steht (Verschiebung 0), ein dunklerer Himmel trägt keinen Durchlass am Boden (w6-g3-linsen).
//   ferne.K4   die Uhr der Sonne 5° (die Abend-Uhr der Bühne, halbiert), Orte 2,5–7 km aus dem Gelände-Gesetz: zur Sonne geneigt
//              (N·L > 0,2), dem Auge zugewandt (N·V ≥ 0,2) und vom Auge sichtbar — das Auge 1 500 · 600 · 250 m über dem Spieler, die
//              erste Höhe mit ≥ 5 Orten je Seite (aus 80 m sah es am Dorf 3 im Schatten); im Schatten, wo der Horizont zur Sonne > 6,5°
//              steht und sein Grat ≥ 2 km vom Auge liegt, im Licht unter 3,5°. Luma je N·L im Schatten gegen im Licht über den Orten,
//              die das Bild trägt (eine dunklere Fern-Farbe trifft beide).
//   schatten.K5  Mitternacht, die nächste Leuchtquelle des LICHT_GESETZ (`_blockerMit("licht")`, im Pool der Probe), ein Pfosten
//              0,3 × 2 m 2 m daneben: Boden 0,35–0,85 m hinter dem Pfosten gegen denselben Radius ±30° daneben, das Auge 5 m lotrecht
//              darüber, der Pfosten im Blick (sein Plättchen gesehen); dazu ohne Pfosten (Kontrolle, je Pose zuerst).
//   schatten.K2  Gehen 4 m/s im Takt des Spiels (`_loopShadowUpdate` + Bild, 20 Bilder, 4 eingeschwungen): derselbe Gang mit und ohne
//              Schatten (Intensität 0 je Kaskade, kein Programm-Wechsel); ein Rand-Pixel des Schattens ist unerklärt, wenn das per
//              Kamera-Bewegung reprojizierte Vorbild (die Ebene des Bodens) ihn mit Schatten nicht trägt (±18 über die 3 × 3), ohne
//              Schatten schon — die Parallaxe ortsfester Schatten erklärt sich, das Schwimmen der Kaskade nicht (w6-g3-linsen).
//   vegetation.K3  der Boden unter Kronen (ein Strahl nach oben trifft einen Werfer) gegen offenen Boden, Uhr 0,5 und 0,56: die Flecken
//              (Variationskoeffizient der Block-Luma) und ihr Wandern mit der Sonne (Korrelation der zwei Uhren). Das Band der REF
//              real-mischwald für Stämme und Unterholz steht nirgends (nicht im Spiel-Baum, nicht in der Soll-Tafel): ROT beim Namen.
async function neunSeite(r, T, C) {
    const st = r.state, rend = st.renderer, cam = st.camera, sc = st.scene, dl = st.directionalLight, A = r.constructor;
    const t0 = performance.now();
    const sek = () => (performance.now() - t0) / 1000;
    const aus = { teile: {}, ausgelassen: [], leinwand: null };
    rend.setAnimationLoop(null);
    const merk = { pos: cam.position.clone(), quat: cam.quaternion.clone(), fov: cam.fov, uhr: st.timeOfDay, wetter: st.weather, spieler: st.playerMesh.visible };
    const P0 = st.playerMesh.position.clone();
    aus.ort = [+P0.x.toFixed(1), +P0.z.toFixed(1)];
    const fwd0 = new T.Vector3(0, 0, -1).applyQuaternion(merk.quat).setY(0).normalize();
    const quer0 = new T.Vector3(-fwd0.z, 0, fwd0.x);
    let W = 0, H = 0;
    const leinwand = () => {
        const d = rend.getDrawingBufferSize(new T.Vector2());
        [W, H] = [Math.round(d.x), Math.round(d.y)];
    };
    leinwand();
    aus.leinwand = [W, H];
    const LUT = Float32Array.from({ length: 256 }, (_, i) => (i / 255 <= 0.04045 ? i / 255 / 12.92 : Math.pow((i / 255 + 0.055) / 1.055, 2.4)));
    const zurueck = (c) => {
        const hi = Math.min(Math.max(...c), 0.9995);
        const k = hi >= 0.76 ? (0.0576 / (1 - hi) + 0.52) / hi : 1;
        const m = Math.min(...c) * k;
        const x = Math.sqrt(m / 6.25);
        return c.map((v) => v * k + (m < 0.04 ? x - 6.25 * x * x : 0.04));
    };
    const Yp = (u8, p) => {
        const c = zurueck([LUT[u8[p]], LUT[u8[p + 1]], LUT[u8[p + 2]]]);
        return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / rend.toneMappingExposure;
    };
    const Yb = (u8, x, y) => {
        let s = 0, n = 0;
        for (let j = -1; j <= 1; j++)
            for (let i = -1; i <= 1; i++) {
                const xx = Math.round(x) + i, yy = Math.round(y) + j;
                if (xx >= 0 && yy >= 0 && xx < W && yy < H) (s += Yp(u8, (yy * W + xx) * 4)), n++;
            }
        return n ? s / n : NaN;
    };
    const l8 = (u8, p) => 0.2126 * u8[p] + 0.7152 * u8[p + 1] + 0.0722 * u8[p + 2];
    const med = (a) => {
        const b = a.filter(Number.isFinite).sort((p, q) => p - q);
        return b.length ? b[b.length >> 1] : null;
    };
    const r4 = (x) => (x == null || !Number.isFinite(x) ? null : +x.toFixed(4));
    // jede Aufnahme prüft, dass die Kamera danach noch am Auge der Probe steht (sonst misst der Teil ein anderes Bild): Bruch beim Namen
    const schuss = async () => {
        r._schattenAlleNeu();
        leinwand();
        const u = (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
        const weg = cam.position.distanceTo(fuehr.pos);
        if (weg > 0.5) throw new Error("die Kamera stand nach der Aufnahme nicht am Auge (" + weg.toFixed(1) + " m daneben)");
        return u;
    };
    // DIE KAMERA DER PROBE führt die EINE Naht des Spiels (`kameraFuehren`, `_loopCamera` liest sie): läuft ein Takt des Spiels in einer
    // Pause der Aufnahme, setzt er die Kamera der Probe, nie die des Spielers. Jede Aufnahme prüft danach den Ort (unten, `schuss`) —
    // im Mechanik-Lauf (swiftshader, Dorf) holte ein zweites `/eval` derselben Seite die Kamera zum Spieler zurück, und der Teil maß ein
    // anderes Bild, bis der Wächter es beim Namen nannte
    const fuehrAlt = r._kameraFuehrung || null;
    const fuehr = { pos: cam.position.clone(), quat: cam.quaternion.clone(), fov: cam.fov };
    const setze = (c) => {
        c.position.copy(fuehr.pos);
        c.quaternion.copy(fuehr.quat);
        if (c.fov !== fuehr.fov) (c.fov = fuehr.fov), c.updateProjectionMatrix();
        c.updateMatrixWorld(true);
    };
    r.kameraFuehren(setze);
    const stell = (pos, ziel, fov) => {
        cam.fov = fov;
        cam.updateProjectionMatrix();
        cam.position.copy(pos);
        cam.lookAt(ziel);
        cam.updateMatrixWorld(true);
        [fuehr.pos, fuehr.quat, fuehr.fov] = [cam.position.clone(), cam.quaternion.clone(), cam.fov];
    };
    const bp = (v) => {
        const p = v.clone().project(cam);
        return p.z > -1 && p.z < 1 && Math.abs(p.x) < 0.97 && Math.abs(p.y) < 0.97 ? [((p.x + 1) / 2) * W - 0.5, ((1 - p.y) / 2) * H - 0.5] : null;
    };
    const probeL = (u8, pts) => {
        const q = pts.map(bp).filter(Boolean);
        return { L: med(q.map(([x, y]) => Yb(u8, x, y))), n: q.length };
    };
    const boden = (x, z) => r._voxelSurfaceY(x, z);
    const gesetz = (x, z) => r._terrainMacroSurfaceY(x, z, false);
    // die Sonne aus dem Himmel (`skyboxUniforms.sunDir`, derselbe Schreiber wie das Richtlicht): nach Sonnenuntergang trägt das Richtlicht
    // den Mond (Uhr 0,8: Sonne −16,7°, Licht +18°) — die Abend-Uhr halbierte sonst gegen den Mond
    const sonne = () => {
        const U = st.skyboxUniforms;
        return U && U.sunDir && U.sunDir.value ? U.sunDir.value.clone().normalize() : dl.position.clone().sub(dl.target.position).normalize();
    };
    const koerperListe = [];
    const koerper = (geo, rgb, name) => {
        const m = new T.Mesh(geo, r._buildToonNodeMaterial({ color: new T.Color(rgb[0], rgb[1], rgb[2]) }));
        m.castShadow = m.receiveShadow = true;
        m.frustumCulled = false;
        m.name = "probe:neun:" + name;
        sc.add(m);
        koerperListe.push(m);
        return m;
    };
    const rc = new T.Raycaster();
    rc.layers.set(A.SHADOW_TWIN_LAYER);
    const frei = (p, d, far) => {
        rc.set(p, d.clone().normalize());
        rc.far = far;
        return !rc.intersectObject(sc, true).some((h) => !String(h.object.name || "").startsWith("probe:") && h.object !== st.playerMesh);
    };
    const OBEN = new T.Vector3(0, 1, 0);
    // DER FREIE PLATZ: die ebenste Stelle auf Land 8–120 m um den Spieler (16 Richtungen), ihr Hang über ±R m höchstens C.hangMax, über
    // der kein Werfer Sonne und Himmel nimmt (am Dorf lag im Umkreis 40 m keine Stelle unter 20 % Hang). Fehlt sie: die Gründe gezählt
    const platz = (R, S, nicht) => {
        const grund = { nah: 0, wasser: 0, hang: 0, werfer: 0 };
        const kand = [];
        for (const d of [8, 14, 22, 32, 45, 60, 80, 100, 120])
            for (let k = 0; k < 16; k++) {
                const w = (k * Math.PI) / 8, x = P0.x + d * Math.sin(w), z = P0.z + d * Math.cos(w);
                if ((nicht || []).some((q) => Math.hypot(q.x - x, q.z - z) < 2 * R + 4)) (grund.nah++, 0);
                else if (typeof r._landAt === "function" && !r._landAt(x, z, 0.3)) grund.wasser++;
                else {
                    const h = boden(x, z);
                    if (!Number.isFinite(h)) continue;
                    let hang = 0;
                    for (const [a, b] of [[R, 0], [-R, 0], [0, R], [0, -R], [0.7 * R, 0.7 * R], [-0.7 * R, -0.7 * R], [0.7 * R, -0.7 * R], [-0.7 * R, 0.7 * R]])
                        hang = Math.max(hang, Math.abs(boden(x + a, z + b) - h) / R);
                    if (!(hang <= C.hangMax)) grund.hang++;
                    else kand.push({ x, z, h, hang });
                }
            }
        kand.sort((a, b) => a.hang - b.hang);
        for (const q of kand.slice(0, 12)) {
            const p = new T.Vector3(q.x, q.h + 0.3, q.z);
            if ((S && !frei(p, S, 120)) || !frei(p, OBEN, 120)) grund.werfer++;
            else return Object.assign(new T.Vector3(q.x, q.h, q.z), { hang: +q.hang.toFixed(3) });
        }
        throw new Error("kein freier Platz (±" + R + " m, Hang ≤ " + C.hangMax + "): " + JSON.stringify(grund));
    };
    const plaetze = [];
    const teil = async (name, fn) => {
        if (sek() >= C.rest) return void aus.ausgelassen.push(name);
        const ts = sek();
        try {
            aus.teile[name] = Object.assign(await fn(), { s: +(sek() - ts).toFixed(2) });
        } catch (e) {
            aus.teile[name] = { fehler: String((e && e.message) || e).slice(0, 300), s: +(sek() - ts).toFixed(2) };
        } finally {
            for (const m of koerperListe.splice(0)) (sc.remove(m), m.material.dispose(), m.geometry.dispose());
        }
    };
    st.playerMesh.visible = false;
    try {
        // ───── ferne.K3 — der Saum am Kamm (Teil A, 1920 × 1080) ─────
        if (C.teile.includes("ferne.K3"))
            await teil("ferne.K3", async () => {
                window.__buehne({});
                const E = new T.Vector3(P0.x, 0, P0.z);
                // der Boden eines Stands abseits des Spielers: das Netz trägt ihn nur im gebauten Ring, das Gesetz überall
                const grund = (x, z) => Math.max(...[boden(x, z), gesetz(x, z)].filter(Number.isFinite));
                // der Kamm je Azimut: der höchste Winkel des Gesetzes bis 8 km und sein Abstand
                const kamm = (az, f = 1.045) => {
                    const dx = Math.sin(az), dz = Math.cos(az);
                    let best = -Infinity, bd = 0;
                    for (let d = 40; d <= 8000; d *= f) {
                        const w = (gesetz(E.x + dx * d, E.z + dz * d) - E.y) / d;
                        if (w > best) (best = w), (bd = d);
                    }
                    return { w: Math.atan(best), d: bd };
                };
                // die Höhe des Auges und den Azimut wählt die Zahl der Kamm-Spalten im Band (aus 60 m lag der Kamm am Dorf 4,4–7,9 km fern)
                let wahl = null;
                for (const [ox, oz] of C.kammStand)
                for (const hoch of C.kammHoch)
                for (let k = 0; k < 8; k++) {
                    E.set(P0.x + ox, grund(P0.x + ox, P0.z + oz) + hoch, P0.z + oz);
                    if (!Number.isFinite(E.y)) continue;
                    const az0 = (k * Math.PI) / 4;
                    let n = 0, m = 0, ws = 0;
                    for (let i = 0; i < 8; i++) {
                        const q = kamm(az0 + (((i - 3.5) / 8) * C.kammFov * Math.PI) / 180, 1.06);
                        if (q.d >= 400 && q.d <= 4000) (n++, (ws += q.w));
                        if (q.d >= 1500 && q.d <= 2500) m++;
                    }
                    if (!wahl || m * 3 + n > wahl.m * 3 + wahl.n) wahl = { az: az0, n, m, w: n ? ws / n : 0, hoch, stand: [ox, oz] };
                }
                E.set(P0.x + wahl.stand[0], grund(P0.x + wahl.stand[0], P0.z + wahl.stand[1]) + wahl.hoch, P0.z + wahl.stand[1]);
                const fov = C.kammFov / (W / H); // C.kammFov ist die waagrechte Öffnung
                const ziel = E.clone().add(new T.Vector3(Math.sin(wahl.az), Math.tan(wahl.w), Math.cos(wahl.az)).multiplyScalar(1000));
                stell(E, ziel, fov);
                const u8 = await schuss();
                // DER HIMMEL ALLEIN (derselbe Blick, jedes Kind der Szene außer Himmel und Licht verborgen): ein Pixel, das ihm gleicht
                // (±6 je Kanal), ist Himmel — die Farb-Regel der Soll-Tafel brach am Dunst (swiftshader, Dorf: Luma 149 unter 150)
                const verborgen = sc.children.filter((o) => o !== st.skybox && !o.isLight && o.visible);
                verborgen.forEach((o) => (o.visible = false));
                window.__bundlesNeu();
                let leer;
                try {
                    leer = await schuss();
                } finally {
                    verborgen.forEach((o) => (o.visible = true));
                    window.__bundlesNeu();
                }
                const himmel = (p) => Math.abs(u8[p] - leer[p]) <= 6 && Math.abs(u8[p + 1] - leer[p + 1]) <= 6 && Math.abs(u8[p + 2] - leer[p + 2]) <= 6;
                const camI = cam.projectionMatrixInverse.clone(), camM = cam.matrixWorld.clone();
                const mpp = (d) => (d * 2 * Math.tan((fov * Math.PI) / 360)) / H;
                const spalten = [];
                for (let x = 2; x < W - 2; x += C.kammSchritt) {
                    const v = new T.Vector3(((x + 0.5) / W) * 2 - 1, 0, 0.5).applyMatrix4(camI).applyMatrix4(camM).sub(E);
                    const q = kamm(Math.atan2(v.x, v.z));
                    let y = 0;
                    for (; y < H - 3; y++) if (!himmel((y * W + x) * 4) && !himmel(((y + 1) * W + x) * 4) && !himmel(((y + 2) * W + x) * 4)) break;
                    const g = bp(E.clone().add(new T.Vector3(Math.sin(Math.atan2(v.x, v.z)), Math.tan(q.w), Math.cos(Math.atan2(v.x, v.z))).multiplyScalar(q.d)));
                    spalten.push({ x, y, d: q.d, gy: g ? g[1] : null });
                }
                const kammS = spalten.filter((s) => s.d >= 400 && s.d <= 4000 && s.y > 0 && s.y < H - 3 && s.gy != null && s.gy - s.y <= 12);
                const m = new Uint8Array(W * H), aussen = new Uint8Array(W * H);
                for (const s of kammS)
                    for (let dx = 0; dx < C.kammSchritt && s.x + dx < W; dx++)
                        for (let y = Math.max(0, s.y - 40); y < Math.min(H, s.y + 40); y++) {
                            const p = y * W + s.x + dx;
                            if (himmel(p * 4)) aussen[p] = 1;
                            else if (y >= s.y) m[p] = 1;
                        }
                const km = kammS.length >= 20 ? window.__klassenMasse(u8, m, W, H, aussen) : null;
                const zwei = kammS.filter((s) => s.d >= 1500 && s.d <= 2500);
                const res = zwei.map((s, i) => {
                    const nb = zwei.slice(Math.max(0, i - 3), i + 4).map((q) => q.y);
                    return (s.y - med(nb)) * mpp(s.d);
                });
                const rms = res.length ? Math.sqrt(res.reduce((a, b) => a + b * b, 0) / res.length) : null;
                return {
                    azimutGrad: Math.round((wahl.az * 180) / Math.PI),
                    hochM: wahl.hoch,
                    standM: wahl.stand,
                    spalten: spalten.length,
                    kamm: kammS.length,
                    zweiKm: zwei.length,
                    kohaerenz: km ? r4(km.kante) : null,
                    kantePixel: km ? km.kr : 0,
                    schwankungM: r4(rms),
                    reliefM: r4(med(kammS.map((s) => (s.gy - s.y) * mpp(s.d)))),
                    stich: spalten.filter((_s, i) => i % 40 === 0).map((s) => [s.x, s.y, Math.round(s.d), s.gy == null ? null : Math.round(s.gy)]),
                    leinwand: [W, H],
                };
            });
        if (C.teil === "A") return aus;
        // ───── schatten.K4 — Licht springt einmal ─────
        await teil("schatten.K4", async () => {
            window.__buehne({});
            const S = sonne();
            const a = new T.Vector3(S.x, 0, S.z).normalize();
            const M = platz(4, S, plaetze);
            plaetze.push(M);
            const n = a.clone().negate();
            const quer = new T.Vector3(-n.z, 0, n.x);
            const wand = koerper(new T.BoxGeometry(4, 3, 0.2), [0.8, 0.8, 0.8], "wand");
            wand.position.set(M.x, M.y + 1.5, M.z);
            wand.rotation.y = Math.atan2(n.x, n.z);
            const F = M.clone().addScaledVector(n, 0.12);
            const pts = [];
            for (const u of [-1.4, -0.7, 0, 0.7, 1.4]) for (const v of [0.7, 1.3, 1.9, 2.5]) pts.push(F.clone().addScaledVector(quer, u).setY(M.y + v));
            stell(M.clone().addScaledVector(n, 7).setY(M.y + 1.7), new T.Vector3(M.x, M.y + 1.5, M.z), 60);
            const wurfM = 3 / Math.tan(Math.max(0.05, Math.asin(S.y)));
            const bodenPts = [];
            for (const u of [-1.5, 0, 1.5]) for (const e of [wurfM + 0.6, wurfM + 1.2]) bodenPts.push(M.clone().addScaledVector(n, e).addScaledVector(quer, u).setY(boden(M.x + n.x * e + quer.x * u, M.z + n.z * e + quer.z * u) + 0.02));
            const mit = await schuss();
            const A0 = probeL(mit, pts), Bo = probeL(mit, bodenPts);
            let hub = 0;
            for (const e of [2, 8, 15]) for (const u of [-7, 0, 7]) hub = Math.max(hub, boden(M.x + n.x * e + quer.x * u, M.z + n.z * e + quer.z * u) - M.y);
            const platte = koerper(new T.PlaneGeometry(16, 16), [0, 0, 0], "platte");
            platte.castShadow = false;
            platte.rotation.x = -Math.PI / 2;
            platte.position.copy(M).addScaledVector(n, 8.2).setY(M.y + Math.max(0, hub) + 0.04);
            const ohne = await schuss();
            const B0 = probeL(ohne, pts);
            return {
                LA: r4(A0.L), LB: r4(B0.L), n: Math.min(A0.n, B0.n), boden: r4(Bo.L),
                gewinn: A0.L > 0 && B0.L > 0 ? r4(A0.L / B0.L - 1) : null,
                nl: r4(n.dot(S)), sonneGrad: +((Math.asin(S.y) * 180) / Math.PI).toFixed(1), hubM: r4(hub), platz: [+M.x.toFixed(1), +M.z.toFixed(1)], hang: M.hang,
            };
        });
        // ───── schatten.K3 — Kontakt und Himmels-Sicht (die Sonne aus) ─────
        await teil("schatten.K3", async () => {
            window.__buehne({});
            // DER FREIE BODEN (w6-g3-linsen): Fuß und Sockel stehen, wo die Wiese keinen Halm trägt — der Grün-Kanal des gezeichneten Bodens
            // (`_bodenSichtAt` aus, die Halm-Marke der Wiese: Rasen grünt, Pflaster deckt) ≤ C.k3Gruen über dem ganzen Platz; am Dorf deckte
            // Gras das Band 2–18 cm, die Station maß Halme (GTX 8ed70734: Fuß 0,9998). Höhe jedes Punkts: der GEZEICHNETE Boden (Lehre 22)
            const sichtY = (x, z) => {
                const y = r._bodenSichtAt(x, z);
                if (y === null) throw new Error("kein gezeichneter Boden bei " + x.toFixed(1) + ", " + z.toFixed(1));
                return y;
            };
            const gruen = (x, z) => {
                const g = {};
                return r._bodenSichtAt(x, z, g) === null ? null : g.gruen;
            };
            // der Platz: das Raster ±C.k3Feld m um den Spieler (C.k3Schritt), nah zuerst — eben (Hang ≤ C.hangMax über ±5 m), Land, ohne Halm
            // an neun Punkten des Platzes, über ihm kein Werfer; die 16 Richtungen von `platz` trafen am Dorf keinen (137 von 144 am Hang)
            const grund = { hang: 0, gruen: 0, werfer: 0, wasser: 0 };
            const kand = [];
            for (let dx = -C.k3Feld; dx <= C.k3Feld; dx += C.k3Schritt)
                for (let dz = -C.k3Feld; dz <= C.k3Feld; dz += C.k3Schritt) {
                    const x = P0.x + dx, z = P0.z + dz, R = 5;
                    if (Math.hypot(dx, dz) < 8 || plaetze.some((q) => Math.hypot(q.x - x, q.z - z) < 14)) continue;
                    if (typeof r._landAt === "function" && !r._landAt(x, z, 0.3)) (grund.wasser++, 0);
                    else if ([[0, 0], [R, 0], [-R, 0], [0, R], [0, -R], [R / 2, R / 2], [-R / 2, -R / 2], [R / 2, -R / 2], [-R / 2, R / 2]].some(([a, b]) => {
                        const g = gruen(x + a, z + b);
                        return g === null || g > C.k3Gruen;
                    })) grund.gruen++;
                    else {
                        const h = boden(x, z);
                        let hang = 0;
                        for (const [a, b] of [[R, 0], [-R, 0], [0, R], [0, -R], [0.7 * R, 0.7 * R], [-0.7 * R, -0.7 * R], [0.7 * R, -0.7 * R], [-0.7 * R, 0.7 * R]])
                            hang = Math.max(hang, Math.abs(boden(x + a, z + b) - h) / R);
                        if (!(hang <= C.hangMax)) grund.hang++;
                        else kand.push({ x, z, h, hang, d: Math.hypot(dx, dz) });
                    }
                }
            kand.sort((p, q) => p.d - q.d);
            const fund = kand.slice(0, 12).find((q) => frei(new T.Vector3(q.x, q.h + 0.3, q.z), OBEN, 120));
            if (!fund) throw new Error("kein freier Boden ohne Halm (±" + C.k3Feld + " m): " + JSON.stringify(Object.assign(grund, { kand: kand.length })));
            const M = Object.assign(new T.Vector3(fund.x, fund.h, fund.z), { hang: +fund.hang.toFixed(3) });
            plaetze.push(M);
            const c = fwd0.clone().negate(); // zur Kamera
            const b = new T.Vector3(-c.z, 0, c.x);
            const I0 = dl.intensity;
            dl.intensity = 0;
            try {
                // DIE ARMLÄNGE (w6-g3-linsen): beide Stirnflächen auf EINER Linie quer zum Auge, das Auge 2 m davor und 2,5 m hoch, steil auf den
                // Boden — aus 4,5 m und 2,6 m Höhe lag das Band 1–2 px unter der Kante des Körpers, die Kante blutete in den Punkt (main: das Band
                // 15–18 % HELLER als der freie Boden, aus 3 m flach 344 %); das Band 7–16 cm vor der Fläche (≥ 4 px), der Sockel über seine
                // mittleren 2 m, der freie Boden 1–1,6 m davor
                const ding = (name, w, h, t, s, breit) => {
                    const q = M.clone().addScaledVector(b, s).addScaledVector(c, -t / 2);
                    q.y = sichtY(q.x, q.z);
                    const k = koerper(new T.BoxGeometry(w, h, t), [0.45, 0.43, 0.4], name);
                    k.position.set(q.x, q.y + h / 2 - 0.02, q.z);
                    k.rotation.y = Math.atan2(c.x, c.z);
                    const pt = (e, u) => {
                        const p = q.clone().addScaledVector(c, t / 2 + e).addScaledVector(b, u);
                        return p.setY(sichtY(p.x, p.z) + 0.01);
                    };
                    const us = [-0.4, -0.2, 0, 0.2, 0.4].map((f) => f * (breit - 0.1));
                    return { k, band: [0.07, 0.1, 0.13, 0.16].flatMap((e) => us.map((u) => pt(e, u))), frei: [1.0, 1.2, 1.4, 1.6].flatMap((e) => us.map((u) => pt(e, u))) };
                };
                const D = [ding("fuss", 0.45, 1.75, 0.3, 1.2, 0.45), ding("sockel", 4, 3, 4, -1.6, 2)];
                stell(M.clone().addScaledVector(b, -0.2).addScaledVector(c, 2).setY(M.y + 2.5), M.clone().addScaledVector(b, -0.2).addScaledVector(c, 0.6), 70);
                const mit = await schuss();
                D.forEach((d) => (d.k.visible = false));
                const ohne = await schuss();
                // DIE SICHT AUF DEN BODEN (die Tiefe des Schusses): je Punkt ein Plättchen 4 cm, unbeleuchtet weiß, 1 cm über dem Boden — sieht
                // das Auge es, ändert sich der Pixel; ein Halm, ein Stein oder der Körper davor deckt es. Gemessen wird nur, wo die Sicht trägt
                const zeichen = koerper(new T.BufferGeometry(), [1, 1, 1], "zeichen");
                zeichen.material.dispose();
                zeichen.material = new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide });
                zeichen.castShadow = zeichen.receiveShadow = false;
                const lage = [];
                for (const d of D) for (const p of [...d.band, ...d.frei]) for (const [dx, dz] of [[-0.02, -0.02], [0.02, -0.02], [0.02, 0.02], [-0.02, -0.02], [0.02, 0.02], [-0.02, 0.02]]) lage.push(p.x + dx, p.y + 0.005, p.z + dz);
                zeichen.geometry.setAttribute("position", new T.Float32BufferAttribute(lage, 3));
                D.forEach((d) => (d.k.visible = true));
                const mark = await schuss();
                // gemessen wird nur, was das Auge vom Boden sieht (das Plättchen hebt den Pixel um > 30); n zählt die gesehenen Punkte
                const sieht = (pts) => pts.filter((p) => {
                    const q = bp(p);
                    if (!q) return false;
                    const i = (Math.round(q[1]) * W + Math.round(q[0])) * 4;
                    return l8(mark, i) - l8(mit, i) > 30;
                });
                // je Punkt sein EINER Pixel (das Plättchen sah genau ihn): die 3 × 3 um einen Punkt 3 cm vor dem Körper griffen seinen Fuß
                const L1 = (u8, pts) => {
                    const q = pts.map(bp).filter(Boolean);
                    return { L: med(q.map(([x, y]) => Yp(u8, (Math.round(y) * W + Math.round(x)) * 4))), n: q.length };
                };
                const je = D.map((d, i) => {
                    const [sb, sf] = [sieht(d.band), sieht(d.frei)];
                    const [bm, bo, fm, fo] = [L1(mit, sb), L1(ohne, sb), L1(mit, sf), L1(ohne, sf)];
                    return {
                        was: ["fuss", "sockel"][i],
                        band: bm.L > 0 && bo.L > 0 && fm.L > 0 && fo.L > 0 ? r4(bm.L / bo.L / (fm.L / fo.L)) : null,
                        frei: fm.L > 0 && fo.L > 0 ? r4(fm.L / fo.L) : null,
                        n: Math.min(bm.n, fm.n),
                        sicht: r4(Math.min(sb.length / d.band.length, sf.length / d.frei.length)),
                    };
                });
                return { je, platz: [+M.x.toFixed(1), +M.z.toFixed(1)], hang: M.hang, gruen: r4(gruen(M.x, M.z)) };
            } finally {
                dl.intensity = I0;
            }
        });
        // ───── lod.K4 — der Wechsel in Ruhe (das Auge der Stufen versetzt) ─────
        await teil("lod.K4", async () => {
            window.__buehne({});
            stell(merk.pos, merk.pos.clone().add(new T.Vector3(0, 0, -1).applyQuaternion(merk.quat)), merk.fov);
            const vor = await schuss();
            const auge = r._lodAuge().clone();
            const eigen = Object.prototype.hasOwnProperty.call(r, "_lodAuge") ? r._lodAuge : undefined;
            const blick = new T.Vector3(0, 0, -1).applyQuaternion(merk.quat).setY(0).normalize();
            let best = null;
            for (const dm of C.lodVersatz) {
                const V = auge.clone().addScaledVector(blick, dm);
                r._lodAuge = function () {
                    return V;
                };
                let nach;
                try {
                    nach = await schuss();
                } finally {
                    if (eigen) r._lodAuge = eigen;
                    else delete r._lodAuge;
                }
                const m = new Uint8Array(W * H), aussen = new Uint8Array(W * H);
                let px = 0;
                for (let p = 0, i = 0; p < W * H; p++, i += 4) {
                    const d = Math.max(Math.abs(vor[i] - nach[i]), Math.abs(vor[i + 1] - nach[i + 1]), Math.abs(vor[i + 2] - nach[i + 2]));
                    if (d > 2) (m[p] = 1), px++;
                    else aussen[p] = 1;
                }
                if (!best || px > best.px) best = { dm, px, m, aussen, nach };
                if (px >= C.lodPixelMin) break;
            }
            const a = window.__klassenMasse(vor, best.m, W, H, best.aussen);
            const z = window.__klassenMasse(best.nach, best.m, W, H, best.aussen);
            return {
                versatzM: best.dm, pixel: best.px, anteil: r4(best.px / (W * H)),
                lumaVor: a.luma, lumaNach: z.luma,
                sprung: a.luma > 0 && z.luma != null ? r4(Math.abs(z.luma - a.luma) / a.luma) : null,
                zweitonVor: a.zweiton, zweitonNach: z.zweiton, uhr: +st.timeOfDay.toFixed(3),
            };
        });
        // ───── licht.K4 — der Wolken-Schatten wandert mit dem Feld ─────
        await teil("licht.K4", async () => {
            window.__buehne({});
            const U = st.skyboxUniforms;
            if (!U || !U.cloudCover) throw new Error("keine Wolken-Uniforms (skyboxUniforms.cloudCover)");
            const hb = boden(P0.x, P0.z);
            // DER BLICK SENKRECHT (w6-g3-linsen): aus C.wolkeHoch m lotrecht auf den Boden ist ein Zug in der Welt EINE Verschiebung im Bild —
            // schräg (90 m, 70°) zog derselbe Zug nah 40 Blöcke und fern 5, und keine Verschiebung erklärte ihn
            stell(new T.Vector3(P0.x, hb + C.wolkeHoch, P0.z), new T.Vector3(P0.x + fwd0.x, hb, P0.z + fwd0.z), C.wolkeFov);
            const mpp = (2 * C.wolkeHoch * Math.tan((C.wolkeFov * Math.PI) / 360)) / H;
            // die Bild-Uhr hält die Bühne (`__uhrHalten`: `_bildZeit` liest `__buehneUhr.T`, ein Schreiben verweigert sie und zählt es)
            const BU = window.__buehneUhr;
            if (!BU) throw new Error("die Bühne hält keine Bild-Uhr (__buehneUhr)");
            const t = BU.T, cov0 = U.cloudCover.value, I0 = dl.intensity;
            // DER DURCHLASS (w6-g3-linsen): das Bild ohne Richtlicht (unten: EIN Schuss trägt beide Deckungen und Uhren) zieht Himmel, Umgebung und Gras ab — was
            // bleibt, ist das direkte Licht; sein Verhältnis Deckung 0,4 gegen 0 ist der Wurf der Wolke allein. Bild/Bild trug die statische
            // Sonnen-Maske (Kaskade, Eigenschatten der Kronen: ein Block im Schatten bleibt 1, ein besonnter fällt) — r0 ≥ 0,8 bei [0,0]
            const auf = async (cov, dt, an) => {
                BU.T = t + dt;
                U.cloudCover.value = cov;
                dl.intensity = an ? I0 : 0;
                const u = await schuss();
                return { u, cov: U.cloudCover.value };
            };
            const bilder = {};
            try {
                // VIER SCHÜSSE (das Budget der Probe): aus 600 m lotrecht trägt das Bild ohne Sonne weder Wind noch Deckung, das Bild ohne Wolke
                // keinen Wind (Zweig 35414866, je Pixel gemittelt: ohne Sonne 0,4 gegen 0 0,004 %, ohne Sonne t gegen t + 5 s 0,007 %, Deckung 0
                // t gegen t + 5 s 0,07 % — der Wurf ändert 3,6 %) — gemessen werden Deckung 0 mit und ohne Sonne zur Uhr t, Deckung 0,4 zu t und t + 5 s
                for (const [dt, cov, an] of [[0, 0, true], [0, 0, false], [0, C.wolkeDeckung, true], [C.wolkeSek, C.wolkeDeckung, true]]) bilder[[dt, cov, an].join()] = await auf(cov, dt, an);
            } finally {
                BU.T = t;
                U.cloudCover.value = cov0;
                dl.intensity = I0;
            }
            const B = C.wolkeBlock, gx = Math.floor(W / B), y0 = 0, gy = Math.floor(H / B);
            // je Uhr der Durchlass D = (Bild − ohne Richtlicht) bei Deckung 0,4 gegen bei 0 je Block 8 × 8 (16 Proben) — nur, wo JEDE Probe
            // besonnt ist (das direkte Licht trägt ≥ C.wolkeDirekt ihres Bilds bei Deckung 0) und kein Kanal nahe Weiß steht (die Rück-Rechnung
            // des Tons trägt dort nicht: Dächer standen hell in D, an t und t + 5 s gleich); dazu fällt, was mehr als 4 MAD vom Median steht
            // (Wasser spiegelt die Sonne, kein Lambert) — sonst NaN. Halbschatten-Blöcke und weiße Dächer trugen ein stehendes Muster in D
            const durchlass = (dt) => {
                const [b0, o0, b4, o4] = [[0, 0, true], [0, 0, false], [dt, C.wolkeDeckung, true], [0, 0, false]].map((k) => bilder[k.join()].u);
                const D = new Float32Array(gx * gy);
                for (let j = 0; j < gy; j++)
                    for (let i = 0; i < gx; i++) {
                        let s0 = 0, s4 = 0, ok = true;
                        for (let yy = 0; yy < B && ok; yy += B / 4)
                            for (let xx = 0; xx < B && ok; xx += B / 4) {
                                const q = (((y0 + j) * B + yy) * W + i * B + xx) * 4;
                                const [hb0, ho0] = [Yp(b0, q), Yp(o0, q)];
                                if (Math.max(b0[q], b0[q + 1], b0[q + 2], b4[q], b4[q + 1], b4[q + 2]) >= 235 || !(hb0 > 0) || hb0 - ho0 < C.wolkeDirekt * hb0) ok = false;
                                else (s0 += hb0 - ho0), (s4 += Yp(b4, q) - Yp(o4, q));
                            }
                        D[j * gx + i] = ok ? s4 / s0 : NaN;
                    }
                const m = med(Array.from(D)), mad = med(Array.from(D).filter(Number.isFinite).map((v) => Math.abs(v - m)));
                for (let k = 0; k < D.length; k++) if (Number.isFinite(D[k]) && Math.abs(D[k] - m) > 4 * 1.4826 * Math.max(mad, 1e-4)) D[k] = NaN;
                return D;
            };
            const SA = durchlass(0), SB = durchlass(C.wolkeSek);
            const da = Array.from(SA).filter(Number.isFinite);
            const mw = da.length ? da.reduce((p, q) => p + q, 0) / da.length : NaN;
            const sigma = da.length ? Math.sqrt(da.reduce((p, q) => p + (q - mw) * (q - mw), 0) / da.length) : null;
            const korr = (dx, dy) => {
                let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
                for (let j = Math.max(0, -dy); j < gy - Math.max(0, dy); j++)
                    for (let i = Math.max(0, -dx); i < gx - Math.max(0, dx); i++) {
                        const p = SA[j * gx + i], q = SB[(j + dy) * gx + i + dx];
                        if (Number.isFinite(p) && Number.isFinite(q)) (n++, (sa += p), (sb += q), (saa += p * p), (sbb += q * q), (sab += p * q));
                    }
                if (n < 60 || n < 0.4 * da.length) return null;
                const va = saa - (sa * sa) / n, vb = sbb - (sb * sb) / n;
                return va > 1e-9 && vb > 1e-9 ? (sab - (sa * sb) / n) / Math.sqrt(va * vb) : null;
            };
            let best = { r: -2, dx: 0, dy: 0 };
            const R = Math.ceil(0.2 * gx);
            for (let dy = -R; dy <= R; dy++)
                for (let dx = -R; dx <= R; dx++) {
                    const k = korr(dx, dy);
                    if (k != null && k > best.r) best = { r: k, dx, dy };
                }
            const [c0, a] = [bilder[[0, 0, true].join()], bilder[[0, C.wolkeDeckung, true].join()]];
            // DIE ÄNDERUNG und was der Zug von ihr erklärt: eine Wolke von einigen hundert Metern, die in 5 s 50 m zieht, korreliert mit sich
            // selbst schon ohne Verschiebung hoch (r0) — das Maß ist der Anteil der Änderung, den die Verschiebung erklärt ((r − r0)/(1 − r0)),
            // und die Änderung selbst (RMS von D(t + 5) − D(t) am Ort): ein stehendes Muster ändert sich nicht, eines, das seine Form
            // wechselt statt zu ziehen, bleibt unerklärt
            let dn = 0, dq = 0;
            for (let k = 0; k < SA.length; k++) if (Number.isFinite(SA[k]) && Number.isFinite(SB[k])) (dn++, (dq += (SB[k] - SA[k]) ** 2));
            const r0 = korr(0, 0);
            return {
                mass: "durchlass", besonnt: r4(da.length / SA.length), mittel: r4(mw), sigma: r4(sigma), r0: r4(r0), r: r4(best.r),
                aenderung: dn ? r4(Math.sqrt(dq / dn)) : null, erklaert: r0 != null && r0 < 1 && best.r > -2 ? r4((best.r - r0) / (1 - r0)) : null,
                verschiebung: [best.dx, best.dy], zugMS: r4((Math.hypot(best.dx, best.dy) * B * mpp) / C.wolkeSek), deckung: [r4(c0.cov), r4(a.cov)], sek: C.wolkeSek,
                block: [gx, gy], blockM: r4(B * mpp),
            };
        });
        // ───── ferne.K4 — Grate werfen Abendschatten ─────
        await teil("ferne.K4", async () => {
            let lo = 0.5, hi = 0.97, e = null;
            for (let i = 0; i < 16; i++) {
                const u = (lo + hi) / 2;
                window.__buehne({ uhr: u });
                e = (Math.asin(sonne().y) * 180) / Math.PI;
                if (e > C.sonneGrad) lo = u;
                else hi = u;
            }
            const S = sonne(), el = Math.asin(S.y);
            const a = new T.Vector3(S.x, 0, S.z).normalize();
            // DIE ORTE hängen nur am Gelände-Gesetz und an der Sonne (zur Sonne geneigt, Horizont zur Sonne über oder unter ihr) — EINMAL
            // gerechnet; DAS AUGE wählt die Station (w6-g3-linsen): je Höhe C.fernHoch (über dem Boden am Spieler) die Sicht auf jeden Ort und
            // der Grat ≥ 2 km vom Auge, die erste Höhe, aus der ein Azimut ≥ C.fernMin Orte im Schatten UND im Licht zeigt (aus 80 m sah das
            // Auge am Dorf 3 im Schatten — das Gelände trug den Text, das Auge nicht)
            const B0 = boden(P0.x, P0.z);
            let saat = 7;
            const zufall = () => (saat = (saat * 1664525 + 1013904223) >>> 0) / 4294967296;
            const kand = [];
            for (let i = 0; i < C.fernOrte; i++) {
                const w = zufall() * 2 * Math.PI, d = C.fernAb[0] + (C.fernAb[1] - C.fernAb[0]) * Math.sqrt(zufall());
                const x = P0.x + d * Math.sin(w), z = P0.z + d * Math.cos(w), h = gesetz(x, z);
                const N = new T.Vector3(gesetz(x - 25, z) - gesetz(x + 25, z), 50, gesetz(x, z - 25) - gesetz(x, z + 25)).normalize();
                const nl = N.dot(S);
                if (!(nl > 0.2)) continue;
                let hor = -Infinity, hd = 0;
                for (let s = 60; s <= 3000; s += 60) {
                    const q = Math.atan((gesetz(x + a.x * s, z + a.z * s) - h) / s);
                    if (q > hor) (hor = q), (hd = s);
                }
                const gratAb = Math.hypot(x + a.x * hd - P0.x, z + a.z * hd - P0.z);
                const schatten = hor > el + (1.5 * Math.PI) / 180 && gratAb >= 2000;
                const licht = hor < el - (1.5 * Math.PI) / 180;
                if (schatten || licht) kand.push({ p: new T.Vector3(x, h + 1, z), N, nl, schatten, w, gratAb });
            }
            const halb = (0.9 * C.fernFov * Math.PI) / 360;
            let E = null, orte = [], wahl = null;
            for (const hoch of C.fernHoch) {
                const Eh = new T.Vector3(P0.x, B0 + hoch, P0.z);
                // der Hang zeigt dem Auge sein Gesicht (N·V ≥ C.fernNv): zur Sonne geneigt und vom Auge abgewandt sah das Bild den Rücken
                // des Hangs oder den Himmel über ihm (Zweig 35414866 aus 250 m: 6 von 13 Orten am Horizont-Saum)
                const sichtbar = kand.filter((o) => {
                    if (o.N.dot(Eh.clone().sub(o.p).normalize()) < C.fernNv) return false;
                    for (let k = 1; k < 40; k++) {
                        const f = k / 40;
                        if (gesetz(Eh.x + (o.p.x - Eh.x) * f, Eh.z + (o.p.z - Eh.z) * f) > Eh.y + (o.p.y - Eh.y) * f - 2) return false;
                    }
                    return true;
                });
                let wh = null;
                for (let k = 0; k < 24; k++) {
                    const az = (k * Math.PI) / 12;
                    const im = sichtbar.filter((o) => Math.abs(Math.atan2(Math.sin(o.w - az), Math.cos(o.w - az))) < halb);
                    const ns = im.filter((o) => o.schatten).length, nli = im.length - ns;
                    if (!wh || Math.min(ns, nli) > Math.min(wh.ns, wh.nl)) wh = { az, ns, nl: nli, hoch };
                }
                if (!wahl || Math.min(wh.ns, wh.nl) > Math.min(wahl.ns, wahl.nl)) [E, orte, wahl] = [Eh, sichtbar, wh];
                if (Math.min(wh.ns, wh.nl) >= C.fernMin) break;
            }
            const im = orte.filter((o) => Math.abs(Math.atan2(Math.sin(o.w - wahl.az), Math.cos(o.w - wahl.az))) < halb);
            const zielY = med(im.map((o) => o.p.y));
            stell(E, new T.Vector3(E.x + Math.sin(wahl.az) * 4000, zielY == null ? E.y : zielY, E.z + Math.cos(wahl.az) * 4000), C.fernFov / (W / H));
            const u8 = await schuss();
            // gezählt wird, was das Bild trägt (der Ort projiziert ins Bild), nie der Plan
            const je = (s) => im.filter((o) => o.schatten === s).map((o) => {
                const q = bp(o.p);
                return q ? Yb(u8, q[0], q[1]) / o.nl : NaN;
            }).filter(Number.isFinite);
            const [js, jl] = [je(true), je(false)];
            const [Ls, Ll] = [med(js), med(jl)];
            return {
                sonneGrad: r4((el * 180) / Math.PI), uhr: r4(st.timeOfDay), hochM: wahl.hoch, orte: orte.length, imBild: [js.length, jl.length],
                gratKm: r4(med(im.filter((o) => o.schatten).map((o) => o.gratAb)) / 1000), Ls: r4(Ls), Ll: r4(Ll),
                verhaeltnis: Ls != null && Ll > 0 ? r4(Ls / Ll) : null,
            };
        });
        // ───── schatten.K5 — nachts wirft das Feuer ─────
        await teil("schatten.K5", async () => {
            const qs = (r._blockerMit("licht") || [])
                .filter((e) => e && e.position && r._lichtDatum(e))
                .map((e) => ({ e, d: Math.hypot(e.position.x - P0.x, e.position.z - P0.z) }))
                .filter((q) => q.d <= C.feuerM)
                .sort((p, q) => p.d - q.d);
            if (!qs.length) throw new Error("keine Leuchtquelle des LICHT_GESETZ im Umkreis " + C.feuerM + " m");
            // Höhe jedes Punkts: der GEZEICHNETE Boden (Lehre 22)
            const sichtY = (x, z) => {
                const y = r._bodenSichtAt(x, z);
                if (y === null) throw new Error("kein gezeichneter Boden bei " + x.toFixed(1) + ", " + z.toFixed(1));
                return y;
            };
            const rs = [2.35, 2.5, 2.65, 2.85];
            const ptVon = (Q) => (d, e, u) => {
                const p = Q.clone().addScaledVector(d, e).addScaledVector(new T.Vector3(-d.z, 0, d.x), u);
                return p.setY(sichtY(p.x, p.z) + 0.01);
            };
            // DIE POSEN (w6-g3-linsen): je Leuchtquelle des Gesetzes (nah zuerst) und Richtung mit ebenem Boden 2 m neben ihr der Pfosten, das
            // Auge C.k5Hoch m LOTRECHT über den Messpunkten (2,35–2,85 m von der Quelle): zwischen ihm und dem Boden steht nur, was über dem
            // Punkt selbst wächst. Von der Seite (3 m quer, 2,6 m hoch) stand das Auge im Schilf um den Glutbrunnen (GTX b4bb2f62), jeder Halm
            // deckte Boden und Pfosten
            const posen = [];
            for (const { e: q, d: abM } of qs) {
                const Lq = r._lichtDatum(q), sk = Number.isFinite(q.scale) && q.scale > 0 ? q.scale : 1;
                const Q = new T.Vector3(q.position.x, q.position.y - 0.5 + (Lq.hoeheM || 0) * sk, q.position.z);
                const zuP = new T.Vector3(P0.x - Q.x, 0, P0.z - Q.z).normalize();
                for (const w of [0, 90, -90, 180, 45, -45, 135, -135]) {
                    const d = zuP.clone().applyAxisAngle(OBEN, (w * Math.PI) / 180);
                    const p = Q.clone().addScaledVector(d, 2);
                    const h = boden(p.x, p.z);
                    if ([0.6, 1.2, -0.6].every((e) => Math.abs(boden(p.x + d.x * e, p.z + d.z * e) - h) < 0.3)) posen.push({ q, abM, Q, dir: d });
                }
            }
            if (!posen.length) throw new Error("kein ebener Boden 2 m neben einer Leuchtquelle im Umkreis " + C.feuerM + " m (" + qs.length + " Quellen)");
            const pf = koerper(new T.BoxGeometry(0.3, 2, 0.3), [0.4, 0.4, 0.4], "pfosten");
            // DIE SICHT: je Pose EIN Schuss mit Zeichen — ein grünes, unbeleuchtetes Plättchen 4 cm auf jedem Messpunkt und eines auf dem Kopf
            // des Pfostens; die erste Pose, aus der das Auge den Pfosten sieht, misst (höchstens C.k5Versuche) — sonst die beste.
            // Gemessen wird, was das Auge in der Säule über jedem Punkt sieht (aus C.k5Hoch m lotrecht: den Boden oder den Halm, der auf ihm
            // steht und den Wurf so fängt wie er); `boden` nennt, wie viel davon Boden ist
            const zeichen = koerper(new T.BufferGeometry(), [0, 1, 0], "zeichen");
            zeichen.material.dispose();
            zeichen.material = new T.MeshBasicMaterial({ color: 0x00ff00, side: T.DoubleSide });
            zeichen.castShadow = zeichen.receiveShadow = false;
            const gruenPx = (u8, p) => {
                const q2 = bp(p);
                if (!q2) return false;
                const i = (Math.round(q2[1]) * W + Math.round(q2[0])) * 4;
                return u8[i + 1] - Math.max(u8[i], u8[i + 2]) > 100;
            };
            // je Pose zuerst OHNE Pfosten (die Kontrolle: der Boden hinter und neben ihm gleich hell — am Glutbrunnen lag ohne Pfosten schon der
            // Wurf seines Steinrings auf dem Platz, 2,99 : 1), dann mit Pfosten und Zeichen; die erste Pose mit Pfosten im Blick und ruhiger
            // Kontrolle misst
            const stellPose = (ps, gy) => {
                const A = ps.Q.clone().addScaledVector(ps.dir, 2.6);
                stell(A.clone().setY(gy + C.k5Hoch), A.clone().addScaledVector(ps.dir, -0.05).setY(gy), 70);
                // der Pool der Probe an der Pose (neu gewählt, dann die Uhr)
                if (r._leuchtPool) r._leuchtPool.t = r._leuchtPool.uhr = -Infinity;
                window.__buehne({ uhr: C.mitternacht });
            };
            const ruhig = (k) => k != null && k >= 0.67 && k <= 1.5;
            let wahl = null;
            for (const ps of posen.slice(0, C.k5Versuche)) {
                const dir = ps.dir, pt = ptVon(ps.Q);
                const PF = ps.Q.clone().addScaledVector(dir, 2), gy = sichtY(PF.x, PF.z);
                pf.position.set(PF.x, gy + 0.98, PF.z);
                pf.rotation.y = Math.atan2(dir.x, dir.z);
                const dS = rs.flatMap((e) => [-0.05, 0, 0.05].map((u) => pt(dir, e, u)));
                const dL = [30, -30].flatMap((w) => rs.flatMap((e) => [-0.05, 0, 0.05].map((u) => pt(dir.clone().applyAxisAngle(OBEN, (w * Math.PI) / 180), e, u))));
                const pfZ = PF.clone().setY(gy + 1.99);
                const lage = [];
                // das Plättchen liegt 8 cm NEBEN dem Punkt (quer, 4 cm): der Schuss mit Zeichen ist zugleich der Schuss mit Pfosten — gemessen wird
                // der Pixel des Punkts, gesehen ist der Boden daneben
                const nb = (p) => [p.x + 0.08 * dir.z, p.z - 0.08 * dir.x];
                for (const p of [...dS, ...dL]) for (const [dx, dz] of [[-0.02, -0.02], [0.02, -0.02], [0.02, 0.02], [-0.02, -0.02], [0.02, 0.02], [-0.02, 0.02]]) lage.push(nb(p)[0] + dx, p.y + 0.005, nb(p)[1] + dz);
                for (const [u, v] of [[-0.05, -0.05], [0.05, -0.05], [0.05, 0.05], [-0.05, -0.05], [0.05, 0.05], [-0.05, 0.05]]) lage.push(pfZ.x + u, pfZ.y, pfZ.z + v);
                zeichen.geometry.setAttribute("position", new T.Float32BufferAttribute(lage, 3));
                stellPose(ps, gy);
                const P = r._leuchtPool;
                const imPool = !!P && P.halter.some((h, j) => h && h.id === ps.q && P.blende[j] > 0);
                [pf.visible, zeichen.visible] = [false, false];
                const ohne = await schuss();
                [pf.visible, zeichen.visible] = [true, true];
                const mark = await schuss();
                zeichen.visible = false;
                const neben = (p) => new T.Vector3(nb(p)[0], p.y, nb(p)[1]);
                const sS = dS.filter((p) => gruenPx(mark, neben(p))), sL = dL.filter((p) => gruenPx(mark, neben(p)));
                const sicht = Math.min(sS.length / dS.length, sL.length / dL.length), pfosten = gruenPx(mark, pfZ);
                const [s0, l0] = [probeL(ohne, dS), probeL(ohne, dL)];
                const kontrolle = s0.L > 0 && l0.L > 0 ? l0.L / s0.L : null;
                const kand = { ps, PF, gy, dS, dL, sicht, pfosten, ohne, mit: mark, kontrolle, imPool, gut: pfosten && ruhig(kontrolle) };
                if (!wahl || (kand.gut && !wahl.gut) || (kand.gut === wahl.gut && pfosten && !wahl.pfosten)) wahl = kand;
                if (kand.gut) break;
            }
            const { ps, dS, dL, ohne, mit, imPool } = wahl;
            const q = ps.q;
            const [s1, l1, s0, l0] = [probeL(mit, dS), probeL(mit, dL), probeL(ohne, dS), probeL(ohne, dL)];
            return {
                quelle: String(q.type || "?"), abM: r4(ps.abM), imPool, uhr: r4(st.timeOfDay), boden: r4(wahl.sicht), pfosten: wahl.pfosten,
                Llicht: r4(l1.L), Lschatten: r4(s1.L), kontrast: s1.L > 0 ? r4(l1.L / s1.L) : null,
                kontrolle: s0.L > 0 && l0.L > 0 ? r4(l0.L / s0.L) : null, n: Math.min(s1.n, l1.n),
            };
        });
        // ───── schatten.K2 — ruhige Schatten beim Gehen ─────
        await teil("schatten.K2", async () => {
            window.__buehne({});
            const csm = st.csmNode;
            const lichter = (csm && csm.lights && csm.lights.length ? csm.lights : [dl]).filter((l) => l.shadow);
            const I0 = lichter.map((l) => l.shadow.intensity);
            leinwand();
            const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
            const [prevOut, prevZiel] = [rend.getOutputRenderTarget(), rend.getRenderTarget()];
            const pose = (k) => {
                const x = P0.x + fwd0.x * C.gangMs * (k / 60), z = P0.z + fwd0.z * C.gangMs * (k / 60);
                const p = new T.Vector3(x, boden(x, z) + 1.7, z);
                stell(p, p.clone().addScaledVector(fwd0, 20).setY(p.y - 4), merk.fov);
            };
            const Kam = [];
            const gang = async (an) => {
                lichter.forEach((l, i) => (l.shadow.intensity = an ? I0[i] : 0));
                const tn = st.traaNode;
                if (tn) {
                    tn._jitterIndex = 0;
                    if (tn._historyRenderTarget) tn._historyRenderTarget.setSize(1, 1);
                }
                if (st._traaR) st._traaR.neu = true;
                pose(0);
                r._schattenAlleNeu();
                const bilder = [];
                rend.setOutputRenderTarget(rt);
                try {
                    for (let k = 0; k < C.gangBilder; k++) {
                        pose(k);
                        if (an && k >= C.gangEin) Kam.push({ welt: cam.matrixWorld.clone(), inv: cam.projectionMatrixInverse.clone(), proj: cam.projectionMatrix.clone() });
                        r._loopShadowUpdate();
                        window.__loopBild();
                        if (k >= C.gangEin) bilder.push((await window.__zielLesen(rt, W, H)).slice());
                    }
                } finally {
                    rend.setOutputRenderTarget(prevOut);
                    rend.setRenderTarget(prevZiel);
                }
                return bilder;
            };
            let S, N;
            try {
                S = await gang(true);
                N = await gang(false);
            } finally {
                lichter.forEach((l, i) => (l.shadow.intensity = I0[i]));
                rt.dispose();
            }
            // DIE REPROJEKTION (w6-g3-linsen; main mit eingefrorenen Kaskaden maß 4,63 %: ein ortsfester Schatten zieht im Bild mit der Kamera,
            // ohne Schatten zieht dort nichts — die alte Zählung nannte jede Parallaxe unerklärt): je Bild k und Rand-Pixel des Schattens (die
            // Maske N − S > 18 wechselt zu einem Nachbarn) der Welt-Punkt auf der Ebene des Bodens unter dem Gang (kleinste Quadrate über dem
            // Gelände-Gesetz voraus), mit der Kamera des Bilds k − 1 zurück ins Vorbild; erklärt ist der Pixel, wenn sein Wert in der Spanne
            // der 3 × 3 des Vorbilds um ihn liegt (±18, wie die Bewegung von TAAU sie zuließe). Unerklärt: mit Schatten außerhalb, ohne Schatten
            // innerhalb — was die Reprojektion ohne Schatten nicht trägt (ein Körper über dem Boden, ein Halm im Wind), fällt heraus
            const ebene = (() => {
                let [sxx, sxz, szz, sx, sz, n, sxy, szy, sy] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (let a = 0; a <= 30; a += 5)
                    for (let b = -12; b <= 12; b += 4) {
                        const x = P0.x + fwd0.x * a + quer0.x * b, z = P0.z + fwd0.z * a + quer0.z * b, y = boden(x, z);
                        if (!Number.isFinite(y)) continue;
                        const [u, v] = [x - P0.x, z - P0.z];
                        (sxx += u * u), (sxz += u * v), (szz += v * v), (sx += u), (sz += v), n++, (sxy += u * y), (szy += v * y), (sy += y);
                    }
                const M = new T.Matrix3().set(sxx, sxz, sx, sxz, szz, sz, sx, sz, n).invert();
                const k = new T.Vector3(sxy, szy, sy).applyMatrix3(M);
                return { a: k.x, b: k.y, c: k.z }; // y = a·(x − P0.x) + b·(z − P0.z) + c
            })();
            const kam = Kam.map((m) => ({ welt: m.welt, inv: m.inv, proj: m.proj, sicht: m.welt.clone().invert() }));
            const rueck = (k, px, py) => {
                const A = kam[k], B = kam[k - 1];
                const o = new T.Vector3().setFromMatrixPosition(A.welt);
                const d = new T.Vector3(((px + 0.5) / W) * 2 - 1, 1 - ((py + 0.5) / H) * 2, 0.5).applyMatrix4(A.inv).applyMatrix4(A.welt).sub(o).normalize();
                // die Ebene: n·X = c mit n = (−a, 1, −b) um P0
                const nx = -ebene.a, nz = -ebene.b;
                const den = nx * d.x + d.y + nz * d.z;
                if (Math.abs(den) < 1e-6) return null;
                const t = (ebene.c - (nx * (o.x - P0.x) + o.y + nz * (o.z - P0.z))) / den;
                if (!(t > 0)) return null;
                const X = o.addScaledVector(d, t).applyMatrix4(B.sicht).applyMatrix4(B.proj);
                if (!(Math.abs(X.x) <= 1 && Math.abs(X.y) <= 1)) return null;
                return [Math.round(((X.x + 1) / 2) * W - 0.5), Math.round(((1 - X.y) / 2) * H - 0.5)];
            };
            const spanne = (bild, x, y, v) => {
                let lo = Infinity, hi = -Infinity;
                for (let j = -1; j <= 1; j++)
                    for (let i = -1; i <= 1; i++) {
                        const xx = Math.min(W - 1, Math.max(0, x + i)), yy = Math.min(H - 1, Math.max(0, y + j));
                        const w = l8(bild, (yy * W + xx) * 4);
                        (lo = Math.min(lo, w)), (hi = Math.max(hi, w));
                    }
                return v >= lo - 18 && v <= hi + 18;
            };
            const je = [], rand = [];
            let schatten = 0;
            for (let k = 1; k < S.length; k++) {
                const maske = new Uint8Array(W * H);
                for (let p = 0; p < W * H; p++) maske[p] = l8(N[k], p * 4) - l8(S[k], p * 4) > 18 ? 1 : 0;
                let u = 0, r0 = 0;
                for (let y = 1; y < H - 1; y++)
                    for (let x = 1; x < W - 1; x++) {
                        const p = y * W + x;
                        if (k === 1 && maske[p]) schatten++;
                        const m = maske[p];
                        if (maske[p - 1] === m && maske[p + 1] === m && maske[p - W] === m && maske[p + W] === m) continue;
                        r0++;
                        const q = rueck(k, x, y);
                        if (!q || q[0] < 1 || q[1] < 1 || q[0] >= W - 1 || q[1] >= H - 1) continue;
                        if (!spanne(S[k - 1], q[0], q[1], l8(S[k], p * 4)) && spanne(N[k - 1], q[0], q[1], l8(N[k], p * 4))) u++;
                    }
                je.push(u / (W * H));
                rand.push(r0 ? u / r0 : 0);
            }
            return {
                mass: "reprojektion", bilder: je.length, unerklaertMax: r4(Math.max(...je)), unerklaertMittel: r4(je.reduce((a, b) => a + b, 0) / je.length),
                randMax: r4(Math.max(...rand)), schattenAnteil: r4(schatten / (W * H)), ms: C.gangMs, ebene: [r4(ebene.a), r4(ebene.b)],
            };
        });
        // ───── vegetation.K3 — der Wald von innen ─────
        await teil("vegetation.K3", async () => {
            window.__buehne({});
            const kandidat = [];
            for (let i = 0; i < 48 && kandidat.length < 2; i++) {
                const w = (i * 2.399963) % (2 * Math.PI), d = 6 + 1.0 * i;
                const x = P0.x + d * Math.sin(w), z = P0.z + d * Math.cos(w);
                if (typeof r._landAt === "function" && !r._landAt(x, z, 0.3)) continue;
                const p = new T.Vector3(x, boden(x, z) + 0.3, z);
                const unter = !frei(p, OBEN, 30);
                if (unter && !kandidat.some((k) => k.unter)) kandidat.push({ p, unter: true });
                else if (!unter && !kandidat.some((k) => !k.unter) && frei(p, sonne(), 120)) kandidat.push({ p, unter: false });
            }
            const k = kandidat.find((q) => q.unter), o = kandidat.find((q) => !q.unter);
            if (!k || !o) throw new Error("kein Boden " + (k ? "im Offenen" : "unter Kronen") + " im Umkreis 54 m");
            const blockFeld = (u8) => {
                const B = 8, f = [];
                for (let y = Math.floor(0.4 * H); y + B <= H; y += B)
                    for (let x = 0; x + B <= W; x += B) {
                        let s = 0;
                        for (let j = 0; j < B; j += 2) for (let i = 0; i < B; i += 2) s += Yp(u8, ((y + j) * W + x + i) * 4);
                        f.push(s / 16);
                    }
                return f;
            };
            const cv = (f) => {
                const m = f.reduce((a, b) => a + b, 0) / f.length;
                return m > 0 ? Math.sqrt(f.reduce((a, b) => a + (b - m) * (b - m), 0) / f.length) / m : null;
            };
            const blick = (q) => stell(q.p.clone().addScaledVector(fwd0, -2).setY(q.p.y + 1.4), q.p, 70);
            blick(k);
            const f1 = blockFeld(await schuss());
            window.__buehne({ uhr: C.fleckUhr });
            const f2 = blockFeld(await schuss());
            window.__buehne({});
            blick(o);
            const fo = blockFeld(await schuss());
            let n = f1.length, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
            for (let i = 0; i < n; i++) (sa += f1[i]), (sb += f2[i]), (saa += f1[i] * f1[i]), (sbb += f2[i] * f2[i]), (sab += f1[i] * f2[i]);
            const va = saa - (sa * sa) / n, vb = sbb - (sb * sb) / n;
            return {
                fleckenCv: r4(cv(f1)), offenCv: r4(cv(fo)), wandern: va > 1e-12 && vb > 1e-12 ? r4((sab - (sa * sb) / n) / Math.sqrt(va * vb)) : null,
                uhren: [0.5, C.fleckUhr], ref: null,
            };
        });
        return aus;
    } finally {
        r.kameraFuehren(fuehrAlt);
        st.playerMesh.visible = merk.spieler;
        try {
            window.__buehne({ uhr: merk.uhr, wetter: merk.wetter });
        } catch (_e) {
            window.__buehne({ uhr: merk.uhr });
        }
        cam.fov = merk.fov;
        cam.updateProjectionMatrix();
        cam.position.copy(merk.pos);
        cam.quaternion.copy(merk.quat);
        cam.updateMatrixWorld(true);
        r._schattenAlleNeu();
    }
}
// DIE PROBE (im Prozess, cwd = der Spiel-Baum): Teil A im Fenster der Sitzung, Teil B im Fenster der Licht-Linsen, das Fenster zurück; je
// gemessenem Teil EINE Zeile „NEUN <kriterium> {…}“ (das Urteil liest sie), dazu {AUS}. Das Budget zählt ab dem Start des Prozesses.
// DIE LÄNGE DES BEFEHLS: Windows startet node mit höchstens 32 767 Zeichen Kommandozeile (gpu-lauf.sh auf Radeon und GTX) — mit dem Tor
// der Sitzung (`PW.torBefehl`, sein Text samt Kommentaren) und der Seite wörtlich trug der Befehl 40 923. Darum ein eigenes Tor (der Ruf
// an die Werkbank, die Karte aus dem Log der Sitzung) und die Seite ohne Einrückung und Kommentarzeilen (`kompakt`): ~28 000. Mit dem
// Durchlass, der Sicht auf den Boden und dem Auge der Grate (w6-g3-linsen) trug er 33 298 — darum steht die Seite nicht mehr im Befehl:
// die Probe lädt sie aus dieser Datei ({KOORD}, `neunSeite` am Export) und prüft ihren Abdruck gegen den des Befehls (sha1, 16 Zeichen) —
// der Befehl ändert sich mit jeder Zeile der Seite (der Abdruck der Station), eine andere Seite misst nie (NEUN-BRUCH, kein Urteil).
async function neunProbe() {
    const fs = require("fs");
    const http = require("http");
    const t0 = Date.now();
    const [aus, cfg, datei, abdruck] = process.argv.slice(1);
    const seite = require(datei).neunSeite;
    const ist = require("crypto").createHash("sha1").update(String(seite)).digest("hex").slice(0, 16);
    if (ist !== abdruck) {
        console.log("NEUN-BRUCH die Seite in " + datei + " trägt den Abdruck " + ist + ", der Befehl " + abdruck);
        process.exit(1);
    }
    const C = JSON.parse(cfg);
    const rest = () => C.budgetS - (Date.now() - t0) / 1000;
    const ruf = (weg, nutz, ms) =>
        new Promise((ok, nein) => {
            const q = http.request({ host: "127.0.0.1", port: Number(process.env.WERKBANK_PORT), path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (a) => {
                let d = "";
                a.on("data", (c) => (d += c));
                a.on("end", () => {
                    let x = null;
                    try {
                        x = JSON.parse(d);
                    } catch (_e) {
                        return nein(new Error(weg + ": keine JSON-Antwort: " + d.slice(0, 200)));
                    }
                    if (x && typeof x.fehler === "string") return nein(new Error(weg + ": " + x.fehler.slice(0, 300)));
                    ok(x);
                });
            });
            q.on("error", nein);
            q.setTimeout(ms, () => q.destroy(new Error(weg + ": Frist " + ms + " ms")));
            q.end(JSON.stringify(nutz || {}));
        });
    const log = process.env.PUNKTE_SITZUNG_LOG;
    console.log((/^\[linse-gpu\] .*$/m.exec(log && fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "") || ["KEINE KARTE: das Log der Sitzung nennt keinen [linse-gpu]"])[0]);
    const j = { teile: {}, ausgelassen: [], ort: null, leinwand: {}, fehler: [] };
    const lauf = async (teil, extra) => {
        try {
            const C2 = Object.assign({}, C, extra, { teil, rest: rest() });
            const a = (await ruf("/eval", { code: "return await (" + seite + ")(r, T, " + JSON.stringify(C2) + ");" }, Math.max(30, rest() + 60) * 1000)).ergebnis;
            Object.assign(j.teile, a.teile);
            j.ausgelassen.push(...a.ausgelassen);
            j.ort = a.ort;
            j.leinwand[teil] = a.leinwand;
        } catch (e) {
            j.fehler.push(teil + ": " + String((e && e.message) || e).slice(0, 300));
        }
    };
    try {
        await ruf("/fenster", { w: 1920, h: 1080 }, 30000);
        await lauf("A", { teile: ["ferne.K3"] });
        await ruf("/fenster", { w: C.fenster[0], h: C.fenster[1] }, 30000);
        await lauf("B", { teile: [] });
    } finally {
        await ruf("/fenster", { w: 1920, h: 1080 }, 30000).catch(() => {});
        fs.writeFileSync(aus, JSON.stringify(j));
    }
    for (const [k, v] of Object.entries(j.teile)) console.log("NEUN " + k + " " + JSON.stringify(Object.assign({ ort: j.ort }, v)));
    for (const f of j.fehler) console.log("NEUN-BRUCH " + f);
    console.log("NEUN-ENDE " + Object.keys(j.teile).length + " gemessen, ausgelassen am Budget " + C.budgetS + " s: " + (j.ausgelassen.join(", ") || "keiner") + " · " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
}
const kompakt = (t) => t.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//")).join("\n");
const NEUN_C = {
    ort: ["umstellen", "--ort", "dorf", "--sicht", "ego"],
    budgetS: 8.5,
    fenster: [640, 360],
    kammHoch: [25, 60, 120],
    kammStand: [[0, 0]],
    kammFov: 60,
    kammSchritt: 3,
    lodVersatz: [4, -4],
    lodPixelMin: 1500,
    wolkeDeckung: 0.4,
    wolkeSek: 5,
    wolkeDirekt: 0.25,
    wolkeHoch: 600,
    wolkeBlock: 8,
    wolkeFov: 70,
    sonneGrad: 5,
    fernHoch: [1500, 600, 250],
    fernMin: 5,
    fernNv: 0.2,
    fernOrte: 5000,
    fernAb: [2500, 7000],
    fernFov: 90,
    feuerM: 120,
    k5Versuche: 3,
    k5Hoch: 5,
    mitternacht: 0,
    gangMs: 4,
    gangBilder: 20,
    gangEin: 4,
    fleckUhr: 0.56,
    hangMax: 0.12,
    k3Gruen: 0.05,
    k3Feld: 150,
    k3Schritt: 6,
};
const NEUN_SEITE = kompakt(neunSeite.toString());
const NEUN_ABDRUCK = require("crypto").createHash("sha1").update(NEUN_SEITE).digest("hex").slice(0, 16);
const NEUN_PROBE = {
    sek: 10,
    befehl: [
        "node",
        "-e",
        "(" + kompakt(neunProbe.toString()) + ")().then(() => process.exit(0), (e) => { console.log('PROBE-FEHLER ' + String((e && e.stack) || e).split('\\n').slice(0, 4).join(' | ')); process.exit(1); });",
        "{AUS}",
        JSON.stringify(NEUN_C),
        "{KOORD}/meisterkarte-quelle/punkte/stationen/g3.js",
        NEUN_ABDRUCK,
    ],
};
// DAS URTEIL liest die Zeile seines Teils und die Karte der Sitzung (stdout); fehlt die Zeile, gleicht die Zahl der des leeren Laufs:
// UNGEMESSEN beim Namen (keinUrteil a), nie ROT
const NEUN_HW = /^\[linse-gpu\][^\r\n]*/m;
const neunZeile = (s, k) => {
    const m = new RegExp("^NEUN " + k.replace(".", "\\.") + " (\\{.*\\})$", "m").exec(String(s || ""));
    try {
        return m ? JSON.parse(m[1]) : null;
    } catch (_e) {
        return null;
    }
};
const neunUrteil = (k, fn) => (j, lauf) => {
    const s = String((lauf && lauf.stdout) || "");
    const t = neunZeile(s, k);
    if (!t) return { gruen: false, zahl: "keine Zeile NEUN " + k };
    const ad = (NEUN_HW.exec(s) || [null])[0];
    const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
    if (t.fehler) return { gruen: false, zahl: "Bruch: " + t.fehler + " · " + (ad || "Adapter ungenannt") };
    const [ok, zahl] = fn(t);
    return { gruen: hw && ok, zahl: zahl + " · Ort " + JSON.stringify(t.ort) + " · " + t.s + " s · " + (ad || "Adapter ungenannt") };
};
const NEUN_RADEON = "[linse-gpu] webgl2/ANGLE (AMD, AMD Radeon(TM) 890M Graphics (0x0000150E) Direct3D11 vs_5_0 ps_5_0, D3D11)";
const neunProben = (k, gruen, rot) => [
    ...(gruen ? [{ name: "das Soll an der Karte", stdout: NEUN_RADEON + "\nNEUN " + k + " " + JSON.stringify(Object.assign({ ort: [-841, -861], s: 1.2 }, gruen)), gruen: true }] : []),
    ...rot.map(([name, t]) => ({ name, stdout: NEUN_RADEON + "\nNEUN " + k + " " + JSON.stringify(Object.assign({ ort: [-841, -861], s: 1.2 }, t)), gruen: false })),
    ...(gruen ? [{ name: "swiftshader", stdout: "[linse-gpu] google/swiftshader\nNEUN " + k + " " + JSON.stringify(Object.assign({ ort: [-841, -861], s: 1.2 }, gruen)), gruen: false }] : []),
    { name: "der Teil kam nicht dran (keine Zeile)", stdout: NEUN_RADEON + "\nNEUN-ENDE 3 gemessen, ausgelassen am Budget 8.5 s: " + k, gruen: false },
    { name: "der Teil brach", stdout: NEUN_RADEON + "\nNEUN " + k + ' {"ort":[0,0],"fehler":"kein freier Platz","s":0.4}', gruen: false },
];
const NEUN_PFAD = [...BILD, "stamm/gelaende-*.js", "stamm/vegetation-*.js", "stamm/siedlung-*.js", "gelaende-core.js", "fachwerk-core.js", "phyto-core.js", "scripts/lib/abnahme-urteil.cjs"];
const neunStation = (kriterium, quelle, urteil, proben) => ({
    kriterium,
    staffel: 1,
    geraet: "radeon",
    probe: NEUN_PROBE,
    gpu: true,
    zeit: false,
    minuten: 1,
    urteil: neunUrteil(kriterium, urteil),
    proben,
    pfad: NEUN_PFAD,
    quelle,
});
const NEUN = [
    neunStation(
        "schatten.K2",
        "1 = ≤ 0,5 % unerklärte Randpixel beim Gehen an einem Gerät",
        // DAS MASS IST DIE REPROJEKTION (w6-g3-linsen): unerklärt ist ein Rand-Pixel des Schattens, den das per Kamera-Bewegung reprojizierte
        // Vorbild nicht trägt — die alte Zählung (Bild gegen Bild am selben Pixel) nannte die Parallaxe ortsfester Schatten unerklärt (main mit
        // eingefrorenen Kaskaden 4,63 %)
        (t) => [t.mass === "reprojektion" && t.bilder >= 10 && t.schattenAnteil >= 0.01 && t.unerklaertMax <= 0.005, `Maß ${t.mass || "Bild gegen Bild (die Parallaxe)"}: unerklärt je Bild max ${(100 * t.unerklaertMax).toFixed(2)} %, Mittel ${(100 * t.unerklaertMittel).toFixed(2)} % (Soll ≤ 0,5 %; je Rand-Pixel max ${t.randMax}) über ${t.bilder} Bilder Gang ${t.ms} m/s, Schatten im Bild ${(100 * t.schattenAnteil).toFixed(1)} % (≥ 1 %)`],
        neunProben("schatten.K2", { mass: "reprojektion", bilder: 15, unerklaertMax: 0.0016, unerklaertMittel: 0.001, randMax: 0.0084, schattenAnteil: 0.51, ms: 4 }, [
            ["der Schatten flimmert (Anhalt GTX e0139769 1,6 %)", { mass: "reprojektion", bilder: 15, unerklaertMax: 0.016, unerklaertMittel: 0.008, randMax: 0.1, schattenAnteil: 0.2, ms: 4 }],
            ["die Kaskade schwimmt (main 0e3eadad, das Richtlicht ±1° je Bild: 0,57 %)", { mass: "reprojektion", bilder: 15, unerklaertMax: 0.0057, unerklaertMittel: 0.0031, randMax: 0.0443, schattenAnteil: 0.51, ms: 4 }],
            ["kein Schatten im Bild (ein Standbild ist immer ruhig)", { mass: "reprojektion", bilder: 15, unerklaertMax: 0, unerklaertMittel: 0, randMax: 0, schattenAnteil: 0.002, ms: 4 }],
            ["zu kurzer Gang", { mass: "reprojektion", bilder: 3, unerklaertMax: 0, unerklaertMittel: 0, randMax: 0, schattenAnteil: 0.2, ms: 4 }],
            ["das alte Maß Bild gegen Bild (ohne Reprojektion)", { bilder: 15, unerklaertMax: 0.003, unerklaertMittel: 0.001, schattenAnteil: 0.2, ms: 4 }],
        ])
    ),
    neunStation(
        "schatten.K3",
        "1 = Kontaktband (0–20 cm) 30–60 % des freien Bodens an Fuß und Sockel an einem Gerät",
        (t) => {
            const je = t.je || [];
            // gemessen über gesehenem Boden (das Plättchen je Punkt: ≥ 10 Punkte und ≥ 50 % in Band und frei) auf einem Platz ohne Halm-Marke
            // (Grün ≤ 0,05, w6-g3-linsen: am Dorf deckte Gras das Band, die Station maß Halme)
            const ok = t.gruen != null && t.gruen <= 0.05 && je.length === 2 &&
                je.every((x) => x.band != null && x.band >= 0.3 && x.band <= 0.6 && x.frei != null && Math.abs(x.frei - 1) <= 0.1 && x.n >= 10 && x.sicht != null && x.sicht >= 0.5);
            return [ok, je.map((x) => `${x.was} Band ${x.band == null ? "—" : (100 * x.band).toFixed(1) + " %"} des freien Bodens (frei mit/ohne ${x.frei}, ${x.n} Punkte gesehen, Sicht ${x.sicht})`).join(" · ") + ` (Soll 30–60 %, Himmel allein; Platz ${JSON.stringify(t.platz)} Grün ${t.gruen})`];
        },
        neunProben("schatten.K3", { platz: [-739, -837], hang: 0.073, gruen: 0.0039, je: [{ was: "fuss", band: 0.4146, frei: 1.0013, n: 20, sicht: 1 }, { was: "sockel", band: 0.337, frei: 1.0, n: 20, sicht: 1 }] }, [
            ["keine Verdeckung (main 0e3eadad: 1,000 und 1,000)", { platz: [-739, -837], hang: 0.073, gruen: 0.0039, je: [{ was: "fuss", band: 1.0, frei: 1.0, n: 20, sicht: 1 }, { was: "sockel", band: 1.0, frei: 1.0, n: 20, sicht: 1 }] }],
            ["nur der Sockel trägt", { platz: [-739, -837], hang: 0.073, gruen: 0.0039, je: [{ was: "fuss", band: 0.97, frei: 1.0, n: 20, sicht: 1 }, { was: "sockel", band: 0.45, frei: 1.0, n: 20, sicht: 1 }] }],
            ["ein gemalter Ring dunkelt auch den freien Boden", { platz: [-739, -837], hang: 0.073, gruen: 0.0039, je: [{ was: "fuss", band: 0.5, frei: 0.7, n: 20, sicht: 1 }, { was: "sockel", band: 0.45, frei: 0.7, n: 20, sicht: 1 }] }],
            ["schwarz statt Kontakt", { platz: [-739, -837], hang: 0.073, gruen: 0.0039, je: [{ was: "fuss", band: 0.1, frei: 1.0, n: 20, sicht: 1 }, { was: "sockel", band: 0.12, frei: 1.0, n: 20, sicht: 1 }] }],
            ["Gras deckt das Band (das Auge sieht 4 von 20 Punkten)", { platz: [-739, -837], hang: 0.073, gruen: 0.0039, je: [{ was: "fuss", band: 0.45, frei: 1.0, n: 4, sicht: 0.2 }, { was: "sockel", band: 0.4, frei: 1.0, n: 20, sicht: 1 }] }],
            ["der Platz trägt Halme (Grün 1, die Pose am Dorf bis 03.11.)", { platz: [-829, -871], hang: 0.05, gruen: 1, je: [{ was: "fuss", band: 0.45, frei: 1.0, n: 20, sicht: 0.9 }, { was: "sockel", band: 0.4, frei: 1.0, n: 20, sicht: 0.9 }] }],
            ["das alte Maß ohne Sicht und Platz (Halme im Band)", { je: [{ was: "fuss", band: 0.52, frei: 0.99, n: 20 }, { was: "sockel", band: 0.45, frei: 1.0, n: 20 }] }],
        ])
    ),
    neunStation(
        "schatten.K4",
        "1 = weiße Hauswand im Schatten neben besonnter Wiese: Gewinn ≥ 10 % gegen den Gegenschuss mit Boden-Albedo 0, an einem Gerät",
        (t) => [t.gewinn != null && t.gewinn >= 0.1 && t.nl < 0 && t.n >= 10, `Gewinn ${t.gewinn == null ? "—" : (100 * t.gewinn).toFixed(1) + " %"} (Wand ${t.LA} gegen ${t.LB} mit Boden-Albedo 0; Soll ≥ 10 %), N·L ${t.nl}, Sonne ${t.sonneGrad}°, Boden ${t.boden}`],
        neunProben("schatten.K4", { LA: 0.07, LB: 0.0634, gewinn: 0.104, nl: -0.4, n: 20, boden: 0.2, sonneGrad: 60 }, [
            ["keine Rückstrahlung (Spike 94c079cb: 0 %)", { LA: 0.0634, LB: 0.0634, gewinn: 0, nl: -0.27, n: 20, boden: 0.2, sonneGrad: 60 }],
            ["die Wand steht in der Sonne", { LA: 0.3, LB: 0.25, gewinn: 0.2, nl: 0.3, n: 20, boden: 0.2, sonneGrad: 60 }],
            ["die Wand nicht im Bild", { LA: null, LB: null, gewinn: null, nl: -0.4, n: 0, boden: 0.2, sonneGrad: 60 }],
        ])
    ),
    neunStation(
        "schatten.K5",
        "1 = Schatten-Kontrast ≥ 3:1 an einem Pfosten 2 m vom Feuer an einem Gerät",
        // DIE POSE (w6-g3-linsen): das Auge lotrecht über den Messpunkten, der Pfosten im Blick (sein Plättchen gesehen) — von der Seite stand
        // es im Schilf (GTX b4bb2f62); `boden` nennt den Anteil gesehenen Bodens (in Gras misst die Säule den Halm, der den Wurf fängt)
        (t) => [t.pfosten === true && t.imPool && t.kontrast != null && t.kontrast >= 3 && t.kontrolle != null && t.kontrolle >= 0.67 && t.kontrolle <= 1.5 && t.n >= 6, `Kontrast ${t.kontrast}:1 (Soll ≥ 3:1) am Pfosten 2 m von ${t.quelle} (${t.abM} m vom Spieler, im Pool ${t.imPool}, im Blick ${t.pfosten}, Boden gesehen ${t.boden}), ohne Pfosten ${t.kontrolle}, Uhr ${t.uhr}`],
        neunProben("schatten.K5", { quelle: "glutbrunnen", abM: 6.27, imPool: true, uhr: 0, boden: 0, pfosten: true, Llicht: 0.0657, Lschatten: 0.0071, kontrast: 9.26, kontrolle: 1.45, n: 12 }, [
            ["das Auge sieht den Pfosten nicht (im Schilf, GTX b4bb2f62)", { quelle: "glutbrunnen", abM: 6.27, imPool: true, uhr: 0, boden: 0, pfosten: false, Llicht: 0.06, Lschatten: 0.015, kontrast: 4, kontrolle: 1.05, n: 12 }],
            ["das alte Maß ohne Sicht (die Pose von der Seite)", { quelle: "feuerstelle", abM: 20, imPool: true, uhr: 0, Llicht: 0.06, Lschatten: 0.015, kontrast: 4, kontrolle: 1.05, n: 12 }],
            ["das Feuer wirft nicht (Spike 94c079cb)", { quelle: "feuerstelle", abM: 20, imPool: true, uhr: 0, Llicht: 0.06, Lschatten: 0.058, kontrast: 1.03, kontrolle: 1.02, n: 12 }],
            ["eine gemalte Schatten-Textur (dunkel auch ohne Pfosten)", { quelle: "feuerstelle", abM: 20, imPool: true, uhr: 0, Llicht: 0.06, Lschatten: 0.015, kontrast: 4, kontrolle: 4, n: 12 }],
            ["die Quelle leuchtet nicht im Pool", { quelle: "feuerstelle", abM: 20, imPool: false, uhr: 0, Llicht: 0.06, Lschatten: 0.015, kontrast: 4, kontrolle: 1, n: 12 }],
        ])
    ),
    neunStation(
        "licht.K4",
        "1 = der Wolken-Schatten wandert mit dem Wolkenfeld über die Wiese (r ≥ 0,6) an einem Gerät",
        // DAS MASS IST DER DURCHLASS (w6-g3-linsen): Bild/Bild trug die statische Sonnen-Maske (main r0 0,98, Zweig w5-fernschatten 0,79 bei
        // [0,0]) — gemessen wird das direkte Licht allein über besonnten Blöcken, lotrecht aus 600 m (ein Zug der Welt ist EINE Verschiebung
        // im Bild, das Feld ist größer als ein Blick aus 90 m); die Verschiebung muss die Änderung erklären (≥ 50 %), nicht nur ein Maximum
        (t) => {
            const zieht = t.verschiebung && (t.verschiebung[0] !== 0 || t.verschiebung[1] !== 0);
            const ok = t.mass === "durchlass" && t.besonnt >= 0.3 && t.sigma >= 0.03 && t.r >= 0.6 && zieht && t.r - (t.r0 == null ? -1 : t.r0) >= 0.05 &&
                t.erklaert != null && t.erklaert >= 0.5 && t.aenderung != null && t.aenderung >= 0.005 && t.deckung && Math.abs(t.deckung[1] - 0.4) <= 0.01;
            return [ok, `Maß ${t.mass || "Bild/Bild (die Sonnen-Maske)"}: r ${t.r} bei Verschiebung ${JSON.stringify(t.verschiebung)} Blöcke à ${t.blockM} m in ${t.sek} s (${t.zugMS} m/s; ohne Verschiebung ${t.r0}; Soll r ≥ 0,6, das Muster zieht), der Zug erklärt ${t.erklaert} der Änderung ${t.aenderung} (≥ 0,5), Durchlass-σ ${t.sigma} (≥ 0,03) über ${t.besonnt} besonnten Blöcken (≥ 0,3), Deckung ${JSON.stringify(t.deckung)}`];
        },
        neunProben("licht.K4", { mass: "durchlass", besonnt: 0.91, mittel: 0.927, sigma: 0.0725, r0: 0.876, r: 0.97, aenderung: 0.036, erklaert: 0.76, verschiebung: [0, -3], zugMS: 11.2, deckung: [0, 0.4], sek: 5, blockM: 18.7 }, [
            ["kein Wurf (main 0e3eadad: der Durchlass bleibt 1)", { mass: "durchlass", besonnt: 0.9, mittel: 1, sigma: 0.002, r0: 0.1, r: 0.2, aenderung: 0.001, erklaert: 0.1, verschiebung: [3, 2], zugMS: 8, deckung: [0, 0.4], sek: 5, blockM: 18.7 }],
            ["ein gemaltes Muster steht", { mass: "durchlass", besonnt: 0.9, mittel: 0.93, sigma: 0.12, r0: 0.95, r: 0.95, aenderung: 0.02, erklaert: 0, verschiebung: [0, 0], zugMS: 0, deckung: [0, 0.4], sek: 5, blockM: 18.7 }],
            ["die Deckung hielt nicht", { mass: "durchlass", besonnt: 0.91, mittel: 0.927, sigma: 0.0725, r0: 0.876, r: 0.97, aenderung: 0.036, erklaert: 0.76, verschiebung: [0, -3], zugMS: 11.2, deckung: [0, 0.12], sek: 5, blockM: 18.7 }],
            ["das alte Maß Bild/Bild (die Sonnen-Maske trägt S, kein Durchlass)", { sigma: 0.12, r0: 0.3, r: 0.82, verschiebung: [6, -1], deckung: [0, 0.4], sek: 5 }],
            ["der Blick liegt im Schatten (kaum besonnte Blöcke)", { mass: "durchlass", besonnt: 0.08, mittel: 0.927, sigma: 0.0725, r0: 0.876, r: 0.97, aenderung: 0.036, erklaert: 0.76, verschiebung: [0, -3], zugMS: 11.2, deckung: [0, 0.4], sek: 5, blockM: 18.7 }],
            ["das Muster wechselt die Form statt zu ziehen (Zweig 35414866 aus 200 m: der Zug erklärt 0,23)", { mass: "durchlass", besonnt: 0.46, mittel: 0.89, sigma: 0.0696, r0: 0.7476, r: 0.8052, aenderung: 0.048, erklaert: 0.23, verschiebung: [0, -5], zugMS: 6.2, deckung: [0, 0.4], sek: 5, blockM: 6.2 }],
        ])
    ),
    neunStation(
        "ferne.K3",
        "1 = am Kamm in 0,4–4 km Kohärenz des Struktur-Tensors < 0,3 gegen REF real-mischwald und Umriss-Schwankung ≥ 3 m bei 2 km, an einem Gerät",
        (t) => [t.kamm >= 100 && t.zweiKm >= 30 && t.kohaerenz != null && t.kohaerenz < 0.3 && t.schwankungM != null && t.schwankungM >= 3, `Kohärenz ${t.kohaerenz} über ${t.kamm} Kamm-Spalten 0,4–4 km (Soll < 0,3; REF real-mischwald 0,160), Umriss-Schwankung ${t.schwankungM} m über ${t.zweiKm} Spalten 1,5–2,5 km (Soll ≥ 3 m), Relief über dem Gesetz ${t.reliefM} m, Azimut ${t.azimutGrad}°`],
        neunProben("ferne.K3", { azimutGrad: 90, spalten: 958, kamm: 640, zweiKm: 120, kohaerenz: 0.18, kantePixel: 900, schwankungM: 4.2, reliefM: 11 }, [
            ["der Kamm ist Farbe (glatte Gelände-Linie)", { azimutGrad: 90, spalten: 958, kamm: 640, zweiKm: 120, kohaerenz: 0.86, kantePixel: 900, schwankungM: 0.4, reliefM: 0 }],
            ["ein Sägezahn-Band (gezackt, aber gerade)", { azimutGrad: 90, spalten: 958, kamm: 640, zweiKm: 120, kohaerenz: 0.62, kantePixel: 900, schwankungM: 3.4, reliefM: 6 }],
            ["kein Kamm bei 2 km im Bild", { azimutGrad: 90, spalten: 958, kamm: 640, zweiKm: 4, kohaerenz: 0.18, kantePixel: 900, schwankungM: 4.2, reliefM: 11 }],
        ])
    ),
    neunStation(
        "ferne.K4",
        "1 = bei Sonne 5° Luma Schatten-/Lichthang ≤ 0,4 hinter einem ≥ 2 km fernen Grat an einem Gerät",
        // DAS AUGE WÄHLT DIE STATION (w6-g3-linsen): die Höhe über dem Spieler, aus der ≥ 5 Orte im Schatten UND im Licht im Bild stehen, nur
        // Hänge, die dem Auge ihr Gesicht zeigen (N·V ≥ 0,2), gezählt, was das Bild trägt — aus 80 m sah das Auge am Dorf 3 Orte im Schatten
        (t) => [t.hochM != null && t.verhaeltnis != null && t.verhaeltnis <= 0.4 && t.imBild[0] >= 5 && t.imBild[1] >= 5 && Math.abs(t.sonneGrad - 5) <= 0.5 && t.gratKm >= 2, `Schatten-/Lichthang ${t.verhaeltnis} (je N·L; Soll ≤ 0,4) aus ${t.imBild[0]}/${t.imBild[1]} Orten im Bild, Auge ${t.hochM} m, Grat ${t.gratKm} km, Sonne ${t.sonneGrad}° (Uhr ${t.uhr})`],
        neunProben("ferne.K4", { sonneGrad: 5.02, uhr: 0.74, hochM: 1500, orte: 377, imBild: [28, 100], gratKm: 5.4, Ls: 0.02, Ll: 0.09, verhaeltnis: 0.22 }, [
            ["main 0e3eadad und Zweig 35414866: kein Abendschatten an den Hängen im Blick (0,71 aus 28/100)", { sonneGrad: 5.0039, uhr: 0.7351, hochM: 1500, orte: 377, imBild: [28, 100], gratKm: 5.4342, Ls: 0.0345, Ll: 0.0489, verhaeltnis: 0.7063 }],
            ["das alte Auge 80 m ohne Wahl (3/7 Orte, der Rücken der Hänge: 0,24)", { sonneGrad: 5.02, uhr: 0.74, orte: 44, imBild: [3, 7], gratKm: 3.1, Ls: 0.02, Ll: 0.09, verhaeltnis: 0.24 }],
            ["jenseits der Kaskaden nur N·L (Spike 94c079cb)", { sonneGrad: 5.02, uhr: 0.74, orte: 140, imBild: [14, 22], gratKm: 3.1, Ls: 0.088, Ll: 0.09, verhaeltnis: 0.98 }],
            ["eine dunklere Fern-Farbe am Abend (trifft beide)", { sonneGrad: 5.02, uhr: 0.74, orte: 140, imBild: [14, 22], gratKm: 3.1, Ls: 0.03, Ll: 0.031, verhaeltnis: 0.97 }],
            ["die Sonne steht nicht bei 5°", { sonneGrad: 12, uhr: 0.7, orte: 140, imBild: [14, 22], gratKm: 3.1, Ls: 0.02, Ll: 0.09, verhaeltnis: 0.22 }],
            ["zu wenige Orte im Bild (am Dorf aus 80 m: 3 im Schatten)", { sonneGrad: 5.02, uhr: 0.74, orte: 44, imBild: [3, 6], gratKm: 3.1, Ls: 0.02, Ll: 0.09, verhaeltnis: 0.22 }],
        ])
    ),
    neunStation(
        "lod.K4",
        "1 = Luma-Sprung je Klasse < 2 % und zweiton 0 bei Uhr 0,5 an einem Gerät",
        (t) => [t.pixel >= 1500 && t.sprung != null && t.sprung < 0.02 && t.zweitonVor === 0 && t.zweitonNach === 0 && Math.abs(t.uhr - 0.5) <= 0.01, `Luma-Sprung ${t.sprung == null ? "—" : (100 * t.sprung).toFixed(2) + " %"} (Soll < 2 %) über ${t.pixel} px, die der Wechsel ändert (Auge ${t.versatzM} m; die Klassen zusammen), zweiton ${t.zweitonVor}/${t.zweitonNach}, Uhr ${t.uhr}`],
        neunProben("lod.K4", { versatzM: 4, pixel: 9000, anteil: 0.04, lumaVor: 81, lumaNach: 80.4, sprung: 0.0074, zweitonVor: 0, zweitonNach: 0, uhr: 0.5 }, [
            ["die Stufe trägt den Ton nicht (Spike 94c079cb: Weide L1 −6,0 %)", { versatzM: 4, pixel: 9000, anteil: 0.04, lumaVor: 81, lumaNach: 76.1, sprung: 0.06, zweitonVor: 0, zweitonNach: 0, uhr: 0.5 }],
            ["ein langer Dither versteckt den Sprung", { versatzM: 4, pixel: 9000, anteil: 0.04, lumaVor: 81, lumaNach: 80.4, sprung: 0.0074, zweitonVor: 0, zweitonNach: 0.31, uhr: 0.5 }],
            ["kein Wechsel im Bild", { versatzM: -4, pixel: 40, anteil: 0, lumaVor: 81, lumaNach: 81, sprung: 0, zweitonVor: 0, zweitonNach: 0, uhr: 0.5 }],
        ])
    ),
    neunStation(
        "vegetation.K3",
        "1 = im Mischwald (Ego, Mittag) Stamm-Dichte und Unterholz-Deckung im Band der REF und Licht-Flecken am Boden aus der Kaskade, an einem Gerät",
        (t) => [false, `REF real-mischwald fehlt (kein Band für Stämme je Bildbreite und Unterholz-Deckung 0–2 m im Spiel-Baum): ROT · Licht-Flecken unter Kronen CV ${t.fleckenCv} gegen offen ${t.offenCv}, Wandern Uhr ${JSON.stringify(t.uhren)} r ${t.wandern}`],
        neunProben("vegetation.K3", null, [
            ["Flecken, die wandern — ohne REF ROT", { fleckenCv: 0.45, offenCv: 0.08, wandern: 0.3, uhren: [0.5, 0.56], ref: null }],
            ["kein Fleck", { fleckenCv: 0.05, offenCv: 0.08, wandern: 0.99, uhren: [0.5, 0.56], ref: null }],
        ])
    ),
];
const stationen = [
    {
        kriterium: "licht.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // Die Kugel-Bilanz aus bericht/2110-messschuld2 (licht.K2 S1, GTX, n = 3, 5,0132 / 0,1995): koordination
        // `bericht/2110-messschuld2/kugel.js` über `werkbank eval` am Messort wiese, drei Schüsse aus dem Ausgabe-Pfad bei
        // 1920×1080: A ist die Welt, B die Kugeln ohne Schatten-Empfang, C die Sonne aus.
        // IN DER SITZUNG (29.10.): EIN Teleport an die Wiese, die Kugel-Bilanz (9 Schüsse) — Ziel 15 s
        // DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 11,4 s GRÜN): der Deckel steht in der Tafel der Fahrt (punkte.cjs DIE DECKEL).
        // DER DECKEL NACH SEINER MESSUNG (w4-fehlt-acht): Radeon eich3–6 7,2 · 9,0 · 6,6 · 7,2 s am selben Abdruck — 10 s, das Mindeste
        probe: { sek: 14, befehl: befehlDer({
            name: "licht.K2#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "umstellen", args: ["umstellen", "--ort", "wiese"], muss: true },
                { name: "kugel", probe: "@KOORD@/bericht/2110-messschuld2/kugel.js", blob: "2f71153039543f9f842d56ad19ad5dc0a1fed3ef", muss: true },
            ],
        }) },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 5,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const k = j.schritte && j.schritte.kugel;
            const e = k && k.json && k.json.ergebnis;
            if (!e) return { gruen: false, zahl: "keine Kugel-Antwort (" + ((k && k.rest) || "").slice(-200) + ")" };
            if (e.ende !== "ok") return { gruen: false, zahl: "Probe: " + (e.fehler || e.ende) };
            const S = e.schuesse || [];
            const Y = (i, n) => (S[i] && S[i][n] && S[i][n].oben ? S[i][n].oben.Y : null);
            const ab = Y(0, "G-sonne") && Y(1, "G-sonne") ? Y(0, "G-sonne") / Y(1, "G-sonne") : null;
            const ac = Y(0, "G-schatten") && Y(2, "G-schatten") ? Y(0, "G-schatten") / Y(2, "G-schatten") : null;
            const n = S[0] && S[0]["G-sonne"] && S[0]["G-sonne"].oben ? S[0]["G-sonne"].oben.n : 0;
            const b = e.bilanz || {};
            const v = b.verhaeltnisG_oben;
            const a = b.schattenAnteilG;
            const st = e.stand || {};
            // gültig nur, wenn A = B an der Sonnen-Kugel (kein Schatten fällt) und A = C an der Schatten-Kugel (die Sonne ist weg)
            const gueltig = ab != null && Math.abs(ab - 1) <= 0.02 && ac != null && Math.abs(ac - 1) <= 0.02 && n >= 100;
            const gruen = hw && gueltig && uhrIst(st.uhr, 0.5) && st.wetter === "sunny" && v >= 5 && v <= 12.5 && a >= 0.08 && a <= 0.2;
            return {
                gruen,
                zahl:
                    "Verhältnis " + v + " (5–12,5), Schatten-Anteil " + a + " (0,08–0,20), A/B " + (ab && ab.toFixed(3)) +
                    ", A/C " + (ac && ac.toFixed(3)) + ", Kappe " + n + " px, Uhr " + st.uhr + " " + st.wetter + ", " + (j.adapter || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-boden.js", "stamm/gelaende-chunks.js", "stamm/bau-teile.js"],
        quelle: "1 = klar am Mittag Verhältnis 5–12,5 und Schatten-Anteil 0,08–0,20 an einem Gerät",
    },
    {
        kriterium: "licht.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // Je Spalte Uhr × Wetter die Kugel-Probe von Staffel 1 (oben: `spalteSetzen` davor, `SPALTE_LOS` danach), dann der Himmel zur
        // Sonne. Das Soll der Karte (Messung, Liu & Jordan 1960): klar am Mittag Verhältnis 5–12,5, Schatten-Anteil 0,08–0,20 und
        // Himmel zur Sonne ≥ 1,2; die tiefe Sonne (Uhr 0,27 und 0,73, klar) ≥ 2,5; bedeckt (Regen, jede Uhr) ≤ 1,5. Gültig ist eine
        // Spalte wie Staffel 1 nur mit A = B an der Sonnen-Kugel und A = C an der Schatten-Kugel (±2 %), ≥ 100 px, und wenn ihr
        // `stand` die Uhr und das Wetter der Spalte trägt.
        probe: { sek: 33, befehl: befehlMitHimmel({
            name: "licht.K2#2",
            texte: SPALTE_TEXTE,
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "umstellen", args: ["umstellen", "--ort", "wiese"], muss: true },
                ...LICHT_SPALTEN.flatMap(([u, w], i) => [
                    { name: "setz-" + i, args: ["eval", `const U = ${u}, W = "${w}";@T:SETZ@`], muss: true },
                    { name: "kugel-" + i, probe: "@KOORD@/bericht/2110-messschuld2/kugel.js", blob: "2f71153039543f9f842d56ad19ad5dc0a1fed3ef" },
                    { name: "los-" + i, args: ["eval", "@T:LOS@"], muss: true },
                ]),
                { name: "himmel", probe: "@DIR@/himmel.js", blob: HIMMEL_BLOB },
            ],
        }), },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 12,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            let gruen = hw;
            const teile = [];
            const f3 = (x) => (x == null ? "?" : (+x).toFixed(3));
            for (const [i, [u, w]] of LICHT_SPALTEN.entries()) {
                const k = j.schritte["kugel-" + i];
                const e = k && k.json && k.json.ergebnis;
                const name = "Uhr " + u + " " + (w === "sunny" ? "klar" : "Regen");
                if (!e || e.ende !== "ok") {
                    gruen = false;
                    teile.push(name + ": " + ((e && (e.fehler || e.ende)) || String((k && k.rest) || "keine Antwort").slice(-120)));
                    continue;
                }
                const S = e.schuesse || [];
                const Y = (s, n) => (S[s] && S[s][n] && S[s][n].oben ? S[s][n].oben.Y : null);
                const ab = Y(0, "G-sonne") && Y(1, "G-sonne") ? Y(0, "G-sonne") / Y(1, "G-sonne") : null;
                const ac = Y(0, "G-schatten") && Y(2, "G-schatten") ? Y(0, "G-schatten") / Y(2, "G-schatten") : null;
                const n = S[0] && S[0]["G-sonne"] && S[0]["G-sonne"].oben ? S[0]["G-sonne"].oben.n : 0;
                const gueltig = ab != null && Math.abs(ab - 1) <= 0.02 && ac != null && Math.abs(ac - 1) <= 0.02 && n >= 100;
                const st = e.stand || {};
                const spalte = uhrIst(st.uhr, u) && st.wetter === w;
                const b = e.bilanz || {};
                const v = b.verhaeltnisG_oben;
                const a = b.schattenAnteilG;
                const soll =
                    v != null &&
                    (w === "rainy" ? v <= 1.5 : u === 0.5 ? v >= 5 && v <= 12.5 && a >= 0.08 && a <= 0.2 : v >= 2.5);
                if (!(gueltig && spalte && soll)) gruen = false;
                teile.push(
                    name + " (Sonne " + e.sonnenHoeheGrad + "°) " + v + (u === 0.5 && w === "sunny" ? ", Schatten-Anteil " + a : "") +
                        (gueltig ? "" : " UNGÜLTIG (A/B " + f3(ab) + ", A/C " + f3(ac) + ", " + n + " px)") +
                        (spalte ? "" : " BÜHNE " + st.uhr + " " + st.wetter)
                );
            }
            const h = j.schritte.himmel && j.schritte.himmel.json && j.schritte.himmel.json.ergebnis;
            const hs = (h && h.seiten) || {};
            const hok =
                !!h && h.ende === "ok" && h.himmelZurSonne >= 1.2 && hs.zur.n >= 100 && hs.weg.n >= 100 &&
                Math.abs(hs.zur.belicht / hs.weg.belicht - 1) <= 0.01 && uhrIst(h.stand.uhr, 0.5) && h.stand.wetter === "sunny";
            if (!hok) gruen = false;
            teile.push(
                "Himmel zur Sonne " +
                    (!h ? "ungemessen" : h.ende !== "ok" ? h.ende : h.himmelZurSonne + " (" + hs.zur.n + "/" + hs.weg.n + " px, Belichtung " + hs.zur.belicht + "/" + hs.weg.belicht + (h.ueberBoden ? ", " + h.ueberBoden + " m über dem Boden" : "") + ")")
            );
            return {
                gruen,
                zahl:
                    teile.join(" · ") + " · Soll klar 0,5: 5–12,5, 0,08–0,20, Himmel ≥ 1,2; klar 0,27/0,73 ≥ 2,5; Regen ≤ 1,5 · " +
                    (j.adapter || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-boden.js", "stamm/gelaende-chunks.js", "stamm/bau-teile.js"],
        quelle: "2 = alle Spalten Uhr 0,5/0,27/0,73 × klar/Regen, beide Geräte",
    },
    {
        kriterium: "ferne.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // gate:luft-tiefe:echt mit Messung (ferne-luft e9f79deb, Beleg an d3a626ee): luftTiefe vom Hügel Genesis + 120 m,
        // 4 Azimute, Uhr 0,5 und 0,27, Urteil luftTiefeUrteil gegen spec/farbe/luft-referenz.json (Bucholtz 1995)
        probe: { ...FERNE_SITZUNG },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j0) => {
            const L = luftDer(j0);
            const { ad, hw } = L;
            const j = L.m;
            const z = /^LUFT (GRUEN|ROT) · ([^\r\n]+)/m.exec(L.rest);
            if (!z) return { gruen: false, zahl: "keine LUFT-Zeile (Exit " + L.exit + (L.fehler ? ", " + L.fehler : "") + "): " + L.rest.trim().slice(-200) };
            const s = /K1-1 (GRUEN|ROT)/.exec(z[2]);
            const q = ((j && j.zeilen) || [])
                .filter((x) => uhrIst(x.uhr, 0.5))
                // die Bänder, die die Linse zählt (luft-referenz `mindest.n` 10)
                .flatMap((x) => (x.baender || []).filter((b) => b.n >= 10).flatMap((b) => b.q || []))
                .filter((x) => x != null);
            const az = new Set(((j && j.zeilen) || []).filter((x) => uhrIst(x.uhr, 0.5)).map((x) => x.az)).size;
            const gruen = hw && !!s && s[1] === "GRUEN" && q.length > 0;
            return {
                gruen,
                zahl:
                    "Koschmieder T/T_soll " + (q.length ? Math.min(...q).toFixed(2) + "–" + Math.max(...q).toFixed(2) : "ungemessen") +
                    " bei 1/2/5/8 km, Uhr 0,5, " + az + " Azimute, K1-1 " + (s ? s[1] : "fehlt") + ", " + (ad || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-*.js", "stamm/vegetation-*.js", "phyto-core.js", "spec/farbe/luft-referenz.json"],
        quelle: "1 = C = e^(−βd) ±15 % bei 1/2/5/8 km an einem Gerät, Uhr 0,5",
    },
    {
        kriterium: "ferne.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // derselbe Lauf wie ferne.K1#1 (gate:luft-tiefe:echt): der Restkontrast am Rand der letzten Fern-Schale, 4 Azimute, klar, Uhr 0,5
        probe: { ...FERNE_SITZUNG },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j0) => {
            const L = luftDer(j0);
            const { ad, hw } = L;
            const j = L.m;
            const z = /^LUFT (GRUEN|ROT) · ([^\r\n]+)/m.exec(L.rest);
            if (!z) return { gruen: false, zahl: "keine LUFT-Zeile (Exit " + L.exit + (L.fehler ? ", " + L.fehler : "") + "): " + L.rest.trim().slice(-200) };
            const s = /K2-1 (GRUEN|ROT)/.exec(z[2]);
            const r = ((j && j.zeilen) || []).filter((x) => uhrIst(x.uhr, 0.5) && x.rand && x.rand.C != null);
            const C = r.map((x) => x.rand.C);
            const km = r.map((x) => x.rand.km);
            const gruen = hw && !!s && s[1] === "GRUEN" && r.length >= 4;
            return {
                gruen,
                zahl:
                    "Restkontrast am Rand " + (C.length ? (Math.min(...C) * 100).toFixed(1) + "–" + (Math.max(...C) * 100).toFixed(1) + " %" : "ungemessen") +
                    " bei " + (km.length ? Math.min(...km) + "–" + Math.max(...km) + " km" : "–") + " (≤ 2 %), " + r.length + " Azimute, K2-1 " +
                    (s ? s[1] : "fehlt") + ", " + (ad || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-*.js", "stamm/vegetation-*.js", "phyto-core.js", "spec/farbe/luft-referenz.json"],
        quelle: "1 = Restkontrast am Rand der letzten Fern-Schale ≤ 2 % bei klarem Wetter an einem Gerät, 4 Azimute",
    },
    {
        kriterium: "ferne.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // derselbe Lauf wie ferne.K1#1 (gate:luft-tiefe:echt, Luft-Linse aus ferne-blau-heim): K1-2 der LUFT-Zeile trägt je Uhr 0,5 und
        // 0,27 je Kanal (Δβ blau−rot), den Farbton bei 8 km (≤ 10° von der In-Streuung), die Sonnenseite (Y der In-Streuung zur Sonne /
        // gegen sie ≥ 1,2), das ferne Weiß bei Sonne 5° (weiße Lambert-Tafel 5 km, R/B ≥ 1,3) und den Ton des Himmels (Hillaire). Ein
        // OFFEN der Referenz hält nur den Exit des Gates, die Staffel K1-2 bleibt ROT, solange ein K1-2-Befund steht.
        probe: { ...FERNE_SITZUNG },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j0) => {
            const L = luftDer(j0);
            const { ad, hw } = L;
            const j = L.m;
            const z = /^LUFT (GRUEN|ROT) · ([^\r\n]+)/m.exec(L.rest);
            if (!z) return { gruen: false, zahl: "keine LUFT-Zeile (Exit " + L.exit + (L.fehler ? ", " + L.fehler : "") + "): " + L.rest.trim().slice(-200) };
            const s = /K1-2 (GRUEN|ROT)/.exec(z[2]);
            const zl = (j && j.zeilen) || [];
            const Y = (c) => (c ? 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] : null);
            // die Sonnenseite je Uhr wie das Urteil der Linse: Y der In-Streuung zur Sonne (Azimut 0) gegen sie (180)
            const seite = [0.5, 0.27].map((u) => {
                const h = [0, 180].map((az) => Y((zl.find((x) => x.uhr === u && x.az === az) || {}).himmel));
                return h[0] != null && h[1] > 0 ? +(h[0] / h[1]).toFixed(3) : null;
            });
            const dh = zl.flatMap((x) => (x.baender || []).filter((b) => b.d === 8000 && b.n >= 10).map((b) => b.dh)).filter((x) => x != null);
            const rb = j && j.weiss ? j.weiss.RB : null;
            const n = (L.rest.match(/^\s+(ROT|OFFEN) K1-2 /gm) || []).length;
            const gruen = hw && !!s && s[1] === "GRUEN" && seite.every((x) => x != null) && dh.length > 0 && rb != null;
            return {
                gruen,
                zahl:
                    "K1-2 " + (s ? s[1] : "fehlt") + " (" + n + " Befunde) · Farbton 8 km " + (dh.length ? Math.min(...dh) + "–" + Math.max(...dh) + "°" : "ungemessen") +
                    " (≤ 10°) · Sonnenseite Uhr 0,5/0,27 " + seite.join("/") + " (≥ 1,2) · fernes Weiß R/B " + rb + " (≥ 1,3) · " + (ad || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-*.js", "stamm/vegetation-*.js", "phyto-core.js", "spec/farbe/luft-referenz.json"],
        quelle: "2 = je Kanal (der Farbton rückt zum Himmel, Δh ≤ 10° bei 8 km), Sonnenseite/Gegenseite ≥ 1,2, bei Sonne 5° fernes Weiß R/B ≥ 1,3, Uhr 0,5 und 0,27, beide Geräte",
    },
    {
        kriterium: "ferne.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // ferne-blau-heim in EINER Werkbank-Welt: die Luft-Linse vom Hügel (Genesis + 120 m) und vom Gipfel (das Höchste des Gesetzes
        // binnen 3 km, Auge 40 m) — K2-2 je Rand-Spalte der Struktur-Tensor von ln Y, keine waagrechte Linie ab 1° (luft-referenz
        // `band.linie`), 4 Azimute je Ort, Uhr 0,5 —, danach am Messort Genesis die Band-Linse: die Klasse boden (Boden-Satz · Wasser-Satz ·
        // Fern-Ring · Fern-Wasser) über Haupt + k0 + k1 im Haushalt (12 Befehle / 120k Dreiecke, spec/profiband/haushalt.json).
        // IN DER SITZUNG (29.10.): derselbe Lauf wie ferne.K1#1, K2#1, K1#2 (FERNE_SITZUNG, Zwillinge)
        probe: { ...FERNE_SITZUNG },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 12,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const l = j.schritte.luft || {};
            const s = /LUFT (GRUEN|ROT) · [^\r\n]*K2-2 (GRUEN|ROT)/.exec(String(l.rest || ""));
            const m = j.dateien.luft;
            const linie = (zs) => [0, 90, 180, 270].map((az) => ((zs || []).find((x) => uhrIst(x.uhr, 0.5) && x.az === az) || {}).kante).map((k) => (k ? k.linie : null));
            const huegel = linie(m && m.zeilen);
            const gipfel = linie(m && m.gipfel && m.gipfel.zeilen);
            const b = j.dateien.band;
            const k = b && (b.klassen || []).find((x) => x.id === "boden");
            const haushalt = !!k && !!k.soll && k.ist.befehle <= k.soll.befehle && k.ist.dreiecke <= k.soll.dreiecke && b.amMessort === true;
            const gruen = hw && !!s && s[2] === "GRUEN" && huegel.concat(gipfel).every((x) => x != null) && haushalt;
            return {
                gruen,
                zahl:
                    "K2-2 " + (s ? s[2] : "fehlt (Exit " + l.exit + ")") + " · Kanten-Linie Hügel " + huegel.join("/") + "°, Gipfel " + gipfel.join("/") + "° (< 1°) · Boden " +
                    (k ? k.ist.befehle + "/" + k.soll.befehle + " Befehle, " + (k.ist.dreiecke / 1000).toFixed(1) + "k/" + k.soll.dreiecke / 1000 + "k Dreiecke" + (b.amMessort ? "" : " (nicht am Messort)") : "ungemessen") +
                    " · " + (j.adapter || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-*.js", "stamm/vegetation-*.js", "phyto-core.js", "spec/farbe/luft-referenz.json", "scripts/lib/band-urteil.cjs", "scripts/lib/draw-zaehler.cjs"],
        quelle: "2 = keine waagrechte Kanten-Linie (Struktur-Tensor am Horizont), Hügel und Gipfel, im Boden-Haushalt, beide Geräte",
    },
    {
        kriterium: "ferne.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // wetter-sicht: die Luft-Linse vom Hügel (Genesis + 120 m) mit dem Spieler-Wort Sturm (`--wetter stormy`, die Bühne über den
        // EINEN Wetter-Schreiber), Uhr 0,5, 4 Azimute ab der Sonne; je Sicht die Sichtweite am Bezugsniveau aus dem Kontrast-Abfall
        // im Bild, −ln 0,02 · g·d / −ln T_grün je Pixel der Szene (T 0,02…0,95, T = (L − S)/(L0 − S) aus drei Schüssen), der Median;
        // das Urteil der Median der Azimute (≥ 10 Pixel, ≥ 3 Azimute) gegen 1 500 m ±15 %
        // IN DER SITZUNG (29.10.): EIN Teleport (Genesis), EINE Uhr × 4 Azimute je drei Schüsse 480×270, kein Gipfel — Ziel 20 s
        probe: { sek: 31, befehl: ["node", "scripts/werkbank.cjs", "licht", "--luft", "--wetter", "stormy", "--datei", "{AUS}"] },
        env: { MSYS2_ARG_CONV_EXCL: "*" },
        gpu: true,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(lauf.stdout) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const z = /^SICHT (GRUEN|ROT) · ([^\r\n]+)/m.exec(lauf.stdout);
            if (!z) return { gruen: false, zahl: "keine SICHT-Zeile (Exit " + lauf.exit + "): " + String(lauf.stderr || "").trim().slice(-200) };
            const s = ((j && j.zeilen) || []).map((x) => x.sicht).filter((x) => x && x.m != null && x.n >= 10).map((x) => x.m).sort((a, b) => a - b);
            const m = s.length >= 3 ? s[s.length >> 1] : null;
            const gruen = hw && z[1] === "GRUEN" && m != null && Math.abs(m / 1500 - 1) <= 0.15;
            return {
                gruen,
                zahl: "Sicht im Sturm " + (m == null ? "ungemessen" : Math.round(m) + " m") + " (Azimute " + s.map(Math.round).join("/") + ", Soll 1 500 m ±15 %), " + (ad || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-*.js", "spec/farbe/luft-referenz.json"],
        quelle: "1 = im Sturm Sicht 1,5 km ±15 % im Bild an einem Gerät",
    },
    {
        kriterium: "licht.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // wetter-sicht: der Wetter-Zug als Spielgang — klar 5 s, dann Regen und wieder klar als Wort des Spielers (`--wetter rainy
        // --zug`), je Wort ≥ 60 s der Welt-Uhr im echten Takt (`_gameLoopTick`, 0,1 s) über die Transition des Spiels (45 s, das Gemüt
        // moduliert sie), bis das Wort steht; die Uhr steht auf Mittag; je Sekunde die Leuchtdichte des Ausgabe-Bilds (linear). Das Urteil: der größte Sprung |log2 Y_k/Y_k−1| je
        // Sekunde ≤ 0,1 EV/s, und beide Wörter standen am Ende ihrer Phase (sonst misst die Reihe keinen Übergang)
        // IN DER SITZUNG (29.10.): die Welt-Uhr läuft im echten Takt ohne Wanduhr (10 Takte je Spiel-Sekunde, je Sekunde ein Bild
        // 160×90) — der Zug selbst trägt ~125 Spiel-s (klar 5 s, je Wort ≥ 60 s); das Wort setzt die Phase am Ende zurück auf klar.
        // SCHNELL (w4-stationen-schnell-b, ZUG_PROBE): Genesis VOR dem Deckel, die Aufnahmen im Fenster der Licht-Linsen
        probe: ZUG_PROBE,
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(lauf.stdout) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const z = /^ZUG (GRUEN|ROT) · ([^\r\n]+)/m.exec(lauf.stdout);
            if (!z) return { gruen: false, zahl: "keine ZUG-Zeile (Exit " + lauf.exit + "): " + String(lauf.stderr || "").trim().slice(-200) };
            const x = (j && j.reihe) || [];
            const ev = x.slice(1).map((y, i) => Math.abs(Math.log2(y.Y / x[i].Y)) / (y.t - x[i].t));
            const max = ev.length ? Math.max(...ev) : null;
            const stand = x.some((y) => y.wetter === "rainy" && y.zug === 1) && x.length > 2 && x[x.length - 1].wetter === "sunny" && x[x.length - 1].zug === 1;
            const hub = x.length ? Math.log2(Math.max(...x.map((y) => y.Y)) / Math.min(...x.map((y) => y.Y))) : null;
            const gruen = hw && z[1] === "GRUEN" && stand && max != null && max <= 0.1;
            return {
                gruen,
                zahl:
                    "größter Sprung " + (max == null ? "ungemessen" : max.toFixed(3) + " EV/s") + " (Soll ≤ 0,1) · Hub klar ↔ Regen " +
                    (hub == null ? "–" : hub.toFixed(2) + " EV") + " · " + x.length + " s, Wörter " + (stand ? "standen" : "standen NICHT") + " · " + (ad || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-*.js", "stamm/vegetation-*.js", "phyto-core.js"],
        quelle: "1 = der Wetter-Zug klar → Regen → klar ohne Sprung > 0,1 EV/s an einem Gerät",
    },
    {
        kriterium: "material.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // material-mikro (6a6f7521, 9e124cd9; artifacts/mikro/mikro-lauf.sh + fels-lauf.sh): `werkbank bild --arm <m>` setzt die
        // Kamera <m> vor die Fläche, die der Ego-Blick trifft; klassenMasse liefert glatt (8×8-Blöcke mit σ Luma < 4) und nyquist.
        // Die Schüsse: Boden (bodenSatz) an der Mess-Wiese, Fels (formationenSatz) am höchsten Punkt einer Genesis-Formation.
        // An origin/main gibt es `--arm` noch nicht; die Station ist dort ROT („arm fehlt“).
        // IN DER SITZUNG (29.10.): nach jedem Ortswechsel EIN_TAKT (30 echte Takte, dann „die Welt steht“ wie `umstellen`) statt
        // `lauf <n> --ein <m>` — 156 s Einschwingen an der Wanduhr fielen (8+20, 10+30, 10+30, 3 × 4+12)
        // OFFEN (w4-stationen-schnell-b; GTX b4bcf19c 63,7 s): zwei Orte in EINER Probe — der Boden an der Mess-Wiese (die Sitzung stellt
        // sie), der Fels an der höchsten Formation bis 400 m um Genesis: die Probe zieht 1,1 km und zahlt den kalten Ring im Deckel (GTX
        // Genesis kalt 18,6 s, ab040980), dazu den Gang an den Fels; sechs Klassen-Bilder 1920×1080 zu je vier Aufnahmen à 33 Bildern.
        // Im Ring der Wiese trug lokal die höchste Formation 0,47 m (≤ 111 m) — der Fels der Staffel steht an Genesis. Den Weg je Fahrt
        // nennt DER ORT IM DECKEL (punkte.cjs)
        probe: { sek: 33, befehl: befehlDer({
            name: "material.K2#1",
            texte: { FELS_ZIEL, EIN: EIN_TAKT },
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "wiese", args: ["umstellen", "--ort", "wiese", "--sicht", "ego"], muss: true },
                { name: "ein-wiese", args: ["eval", "@T:EIN@"] },
                { name: "blick", args: ["eval", "r.state.pitch = -0.75; return [r.state.cameraMode, r.state.yaw, r.state.pitch]"] },
                ...ARM.map((d) => ({ name: "boden-" + d, args: ["bild", "0", "0", "0", "0", "0", "0", "--arm", d, "--wahl", "0", "--klasse", "^bodenSatz$", "--datei", "@DIR@/boden-" + d + ".png"] })),
                { name: "genesis", args: ["umstellen", "--ort", "genesis", "--sicht", "ego"], muss: true },
                { name: "ein-genesis", args: ["eval", "@T:EIN@"] },
                { name: "fels-weit", args: ["eval", "globalThis.__felsR = 400; globalThis.__felsOben = 1; globalThis.__felsD = 1.5; @T:FELS_ZIEL@"], muss: true },
                { name: "fels-ort", args: ["umstellen", "@fels-weit.4@", "@fels-weit.5@", "--sicht", "ego"], muss: true },
                { name: "ein-fels", args: ["eval", "@T:EIN@"] },
                ...ARM.flatMap((d) => [
                    { name: "fels-stand-" + d, args: ["eval", "globalThis.__felsR = 8; @T:FELS_ZIEL@"] },
                    { name: "ein-fels-" + d, args: ["eval", "@T:EIN@"] },
                    { name: "fels-" + d, args: ["bild", "0", "0", "0", "0", "0", "0", "--arm", d, "--wahl", "0", "--klasse", "^formationenSatz$", "--datei", "@DIR@/fels-" + d + ".png"] },
                ]),
            ],
        }), },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const teile = [];
            let gruen = hw;
            for (const [art, klasse] of [["boden", "bodenSatz"], ["fels", "formationenSatz"]]) {
                const z = [];
                for (const d of ["0.5", "1", "2"]) {
                    const o = j.schritte["" + art + "-" + d] && j.schritte["" + art + "-" + d].json;
                    const k = o && o.klasse;
                    const m = k && k.klassen && k.klassen[klasse];
                    if (!o || o.fehler || !m) {
                        gruen = false;
                        z.push(d + " m: " + String((o && o.fehler) || "keine Klasse " + klasse).slice(0, 90));
                        continue;
                    }
                    // die Armlänge, die die Tiefe der Bildmitte misst: ohne `arm` kennt das Werkzeug `--arm` nicht
                    const arm = k.arm;
                    const ok = !!arm && +arm.soll === +d && arm.ist > 0 && arm.ist <= 1.5 * d + 0.1 && m.pixel > 0 && m.nyquist >= 0.15 && m.glatt <= 0.1;
                    if (!ok) gruen = false;
                    z.push(d + " m glatt " + m.glatt + " nyquist " + m.nyquist + (arm ? " (Arm " + arm.ist + ")" : " (arm fehlt)"));
                }
                teile.push(art + " " + z.join(", "));
            }
            return { gruen, zahl: teile.join(" · ") + " · Soll nyquist ≥ 0,15, glatt ≤ 0,10 · " + (j.adapter || "Adapter ungenannt") };
        },
        pfad: [
            ...BILD,
            "gelaende-core.js",
            "stamm/gelaende-boden.js",
            "stamm/gelaende-chunks.js",
            "stamm/vegetation-*.js",
            "stamm/bau-vorlagen.js",
            "stamm/studio-*.js",
            "phyto-core.js",
            "scripts/lib/abnahme-urteil.cjs",
        ],
        quelle: "1 = Boden und Fels auf 0,5/1/2 m: nyquist ≥ 0,15 und glatte Blöcke ≤ 10 % an einem Gerät",
    },
    {
        kriterium: "material.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // Messschuld M43 (Beleg am Kopf 3528f2d0): die Welt-Seite der Albedo-Tafel `werkbank albedo --tafel` am Ort der Tafel-Messung,
        // genau so wie diag-albedo-tafel neuMessen (`umstellen --ort` des Orts der Tafel, albedo --tafel --datei). Gemessen wird der Stoff unter weißem
        // Umgebungslicht π, nicht das belichtete Bild. Für das Haus wird der Ton jeder Stufe gegen L0 gerechnet (`stufeVon`); für den Fels
        // werden die Stufen der Art rock abgefragt (`_foundryKindStages`): ist es nur [0], zeigt die Welt den Fels nur in L0, und die
        // Fels-Hälfte ist erfüllt (M43).
        // IN DER SITZUNG (31.10.): EIN Lauf für beide Staffeln und material.K1 (ALBEDO_SITZUNG, Zwillinge) — die Tafel misst ohnehin jede
        // Zeile zu jeder ihrer Uhren, am Ort ihrer Messung (Genesis, `gemessen.welt.ort`: bis 31.10. `umstellen 0 0` neben dem Ort)
        probe: { ...ALBEDO_SITZUNG },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 6,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const W = (j.dateien && j.dateien.welt && j.dateien.welt.welt) || null;
            if (!W) return { gruen: false, zahl: "albedo --tafel ohne Messung: " + String((j.schritte.welt && j.schritte.welt.rest) || "").slice(-200) };
            const nur = (z, s) => !!z && Array.isArray(z.stufen) && z.stufen.length > 0 && z.stufen.every((x) => x === s);
            const h0 = W.haus;
            let gruen = hw && !!h0 && h0.Y > 0 && nur(h0, 0);
            const teile = ["Haus L0 " + (h0 && h0.Y) + (nur(h0, 0) ? "" : " (Stufen " + JSON.stringify(h0 && h0.stufen) + ")")];
            for (const s of [1, 2]) {
                const z = W["haus-l" + s];
                const v = z && z.Y > 0 && h0 && h0.Y > 0 ? z.Y / h0.Y : null;
                if (!(v != null && v >= 0.95 && v <= 1.05 && nur(z, s))) gruen = false;
                teile.push("L" + s + "/L0 " + (v == null ? "ungemessen" : v.toFixed(3)) + (nur(z, s) ? "" : " (Stufen " + JSON.stringify(z && z.stufen) + ")"));
            }
            const fe = j.schritte.fels && j.schritte.fels.json && j.schritte.fels.json.ergebnis;
            const arten = fe && typeof fe === "object" ? Object.entries(fe) : [];
            const nurL0 = arten.length > 0 && arten.every(([, st]) => Array.isArray(st) && st.length === 1 && st[0] === 0);
            const felsY = W.fels && W.fels.Y;
            if (!(nurL0 && felsY > 0)) gruen = false;
            teile.push("Fels " + (nurL0 ? "nur L0" : "Stufen " + JSON.stringify(fe)) + " (" + arten.map(([k]) => k).join(", ") + "), Welt-Y " + felsY);
            return { gruen, zahl: teile.join(" · ") + " · Soll 0,95–1,05 · " + (j.adapter || "Adapter ungenannt") };
        },
        pfad: [
            ...BILD,
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "stamm/siedlung-*.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/vegetation-*.js",
            "phyto-core.js",
            "spec/farbe/albedo-tafel.json",
            "scripts/lib/albedo-tafel.cjs",
            "scripts/lib/abnahme-urteil.cjs",
        ],
        quelle: "1 = Haus und Fels Stufe/L0 0,95–1,05 bei Uhr 0,5 an einem Gerät",
    },
    {
        kriterium: "material.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // material-k3-stufen: die Albedo-Tafel trägt je Klasse ihre Stufen (`welt.folgen`: Haus L1/L2, Birke und Fichte L1 und Karte) und
        // die Uhr-Spalten 0,5 und 0,27 (`uhren`); `werkbank albedo --tafel` misst jede Stufen-Zeile im Auge ihrer Stufe zu jeder Uhr
        // (der Baum in jeder Stufe waagrecht wie seine Karte, das Exemplar allein). Je Klasse und Uhr Stufe/L0 0,95–1,05, jede Zeile genau
        // in ihrer Stufe; der Fels zeigt nur L0 (wie #1). Die Haus-Stufen des Glas-Stils (hochhaus, volle_moderne) hält offline
        // gate:haus-fern S8 über 64 Häuser. Cloud (swiftshader, 27.10.): Birke L1 0,994 Karte 0,986, Fichte L1 1,017 Karte 0,998 —
        // das Haus L0/L1 zeichnet dort kein Pixel (der Satz der Stufe), die Radeon maß #1 L1/L0 0,992, L2/L0 0,986.
        // IN DER SITZUNG (31.10.): derselbe Lauf wie material.K3#1 (ALBEDO_SITZUNG, Zwillinge)
        probe: { ...ALBEDO_SITZUNG },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 40,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const D = j.dateien && j.dateien.welt;
            if (!(D && D.welt)) return { gruen: false, zahl: "albedo --tafel ohne Messung: " + String((j.schritte.welt && j.schritte.welt.rest) || "").slice(-200) };
            // die Uhr-Spalten der Tafel: Mittag `<id>`, 0,27 `<id>@0.27`
            const nur = (z, s) => !!z && Array.isArray(z.stufen) && z.stufen.length > 0 && z.stufen.every((x) => x === s);
            let gruen = hw;
            const teile = [];
            for (const u of ["", "@0.27"]) {
                for (const [k, folgen] of [["haus", ["l1", "l2"]], ["birke", ["l1", "karte"]], ["fichte", ["l1", "karte"]]]) {
                    const b = D.welt[k + u];
                    const r = folgen.map((n, i) => {
                        const z = D.welt[k + "-" + n + u];
                        const v = z && z.Y > 0 && b && b.Y > 0 && nur(b, 0) && nur(z, i + 1) ? z.Y / b.Y : null;
                        if (!(v != null && v >= 0.95 && v <= 1.05)) gruen = false;
                        return n + " " + (v == null ? "ungemessen" : v.toFixed(3));
                    });
                    teile.push(k + (u || "@0.5") + " " + r.join("/"));
                }
            }
            const fe = j.schritte.fels && j.schritte.fels.json && j.schritte.fels.json.ergebnis;
            const arten = fe && typeof fe === "object" ? Object.entries(fe) : [];
            const nurL0 = arten.length > 0 && arten.every(([, st]) => Array.isArray(st) && st.length === 1 && st[0] === 0);
            if (!(nurL0 && D.welt.fels && D.welt.fels.Y > 0)) gruen = false;
            teile.push("Fels " + (nurL0 ? "nur L0" : "Stufen " + JSON.stringify(fe)));
            return { gruen, zahl: teile.join(" · ") + " · Soll 0,95–1,05 · " + (j.adapter || "Adapter ungenannt") };
        },
        pfad: [
            ...BILD,
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "stamm/siedlung-*.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/vegetation-*.js",
            "phyto-core.js",
            "spec/farbe/albedo-tafel.json",
            "scripts/lib/albedo-tafel.cjs",
            "scripts/lib/abnahme-urteil.cjs",
        ],
        quelle: "2 = Haus, Birke, Fichte, Fels, L0/L1/L2/Karte, Uhr 0,5 und 0,27, beide Geräte",
    },
    {
        kriterium: "material.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // material-lack (Zug 5) hob Haut Labor/Welt 0,857 → 0,997 und Tiefschwarz ins Band, gemessen nur am Zweig-Kopf. Die Station
        // misst beide Seiten echt am SHA: jede Zeile Welt/Labor 0,9–1,1 und beidseits im realen Band ihrer Klasse (BAENDER), die
        // Seiten auf der Karte (nie ein Ersatz-Renderer).
        probe: { ...ALBEDO_SITZUNG }, // derselbe Lauf wie material.K3#1 (Zwillinge)
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 1.5,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            if (j.fehler) return { gruen: false, zahl: j.fehler };
            const soft = /swiftshader|llvmpipe|lavapipe|software|subzero/i;
            const Z = j.zeilen || [];
            const echt = !!j.adapter && !soft.test(j.adapter) && !!j.welt && j.welt.echt && !!j.labor && j.labor.echt && !soft.test(String(j.labor.geraet || ""));
            const imV = Z.filter((z) => z.v != null && z.v >= 0.9 && z.v <= 1.1);
            const imB = Z.filter((z) => z.inBand);
            const raus = Z.filter((z) => !imV.includes(z) || !z.inBand).map((z) =>
                z.id + " " + (z.v == null ? "stumm" : z.v) + (z.bandOk ? (z.inBand ? "" : " ∉ [" + z.band.join(", ") + "] L " + z.L + " W " + z.W) : " ohne reales Band")
            );
            const gruen = echt && Z.length >= 10 && imV.length === Z.length && imB.length === Z.length;
            const zahl =
                "Welt/Labor 0,9–1,1: " + imV.length + "/" + Z.length + " · im realen Band beidseits: " + imB.length + "/" + Z.length +
                (raus.length ? " — " + raus.join(" · ") : "") + " · echt " + (echt ? "beide Seiten" : "NEIN") + " · " + (j.adapter || "Adapter ungenannt");
            return { gruen, zahl };
        },
        pfad: ALBEDO_PFAD,
        quelle: "1 = alle Zeilen Welt/Labor 0,9–1,1 und im realen Band, beide Seiten --echt, an einem Gerät",
    },
    {
        kriterium: "material.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Messung; dazu liest die 18-%-Karte auf beiden Seiten 0,180 (± eichRand der Tafel), je Gerät
        probe: { ...ALBEDO_SITZUNG }, // derselbe Lauf wie material.K3#1 (Zwillinge)
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 1.5,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            if (j.fehler) return { gruen: false, zahl: j.fehler };
            const soft = /swiftshader|llvmpipe|lavapipe|software|subzero/i;
            const Z = j.zeilen || [];
            const echt = !!j.adapter && !soft.test(j.adapter) && !!j.welt && j.welt.echt && !!j.labor && j.labor.echt && !soft.test(String(j.labor.geraet || ""));
            const alle = Z.length >= 10 && Z.every((z) => z.v != null && z.v >= 0.9 && z.v <= 1.1 && z.inBand);
            const e = j.eichung || {};
            const lab = Object.entries(e.labor || {}).map(([s, y]) => s + " " + y);
            const gruen = echt && alle && e.gruen === true;
            const zahl =
                "Karte Welt " + e.welt + " · Labor " + (lab.join(", ") || "stumm") + " · Soll " + e.soll + " ± " + e.rand +
                " · Zeilen " + (alle ? "alle im Soll und Band" : "NICHT alle im Soll und Band") + " · echt " + (echt ? "beide Seiten" : "NEIN") +
                " · " + (j.adapter || "Adapter ungenannt");
            return { gruen, zahl };
        },
        pfad: ALBEDO_PFAD,
        quelle: "2 = beide Geräte, Eichung Karte 0,180",
    },
    {
        kriterium: "schatten.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // schatten-k1-kontakt: werkbank licht --kontakt (scripts/lib/licht-linsen.cjs `kontaktSicht` + `kontaktUrteil`): Pfosten
        // 0,5 × 0,5 × 3 m auf der Prüfbühne, A Welt / B ohne Pfosten / C ohne Sonne aus dem Ausgabe-Pfad, Halbschatten 10–90 % am
        // Fuß je Pose bei Uhr 0,5; am Kopf vor dem Zweig kennt licht kein --kontakt (ROT beim Namen)
        // IN DER SITZUNG (29.10.): EINE Uhr (0,5), zwei Posen je drei Schüsse — Ziel 25 s; der Messort buehne importiert die Welt der
        // Prüfbühne und lädt die Seite in ihr: danach steht die Sitzung in einer fremden Welt (mutiert). DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 45,0 s GRÜN am Deckel
        // 45 — die GTX risse ihn): der Deckel steht in der Tafel der Fahrt (punkte.cjs DIE DECKEL)
        // DAS TEMPO (w4-proben-tempo, 30.10.; GTX 379e5f56 ≥ 90 s am Eich-Deckel, „zuletzt: fenster“): DIE TÄTER — der Wechsel in die
        // Welt der Prüfbühne (Tür, Neuladen, Ring) lag IM Deckel (die Probe nannte keinen Ort), die Linse schoss die Linien des
        // Zuwachses mit (Staffel 2; die Hälfte der Schüsse, die Staffel 1 nie liest) und zwei Aufnahmen je Schuss. Jetzt nennt die
        // Probe den Ort buehne (die Sitzung stellt ihn VOR dem Deckel, punkte.cjs `probeOrt`), `licht --kontakt` schießt nur den Fuß
        // (ohne `--zuwachs`), EINE Aufnahme je Schuss, die Treue einmal: 7 statt 24 Aufnahmen, im Deckel der warme Ort und der Ring
        // an der Platte. DER TÄTER DES RISSES (Spiel-Baum w4-proben-tempo, scripts/werkbank.cjs `weltDesOrts`): seit 30.10. bootet die
        // Sitzung mit `--ort wiese`, ihr Dorf-Haken lag vor jeder Ladung — in der Prüfbühne baute `_tickGenesisOrt` (stamm/siedlung-ort.js
        // :2776) den Ring nie, die Ankunft wartete ohne Frist (swiftshader 28 min); die Ankunft hebt ihn jetzt, bis der Ring steht:
        // swiftshader Bühne 70 s (vor dem Deckel), Kontakt 41 s, Treue 0 Bytes
        probe: { sek: 22,  befehl: befehlDer({
            name: "schatten.K1#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "buehne", args: ["umstellen", "--ort", "buehne", "--sicht", "ego"], muss: true },
                { name: "kontakt", args: ["licht", "--kontakt"], ms: 900000 },
            ],
        }), mutiert: true },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            const k = j.schritte && j.schritte.kontakt;
            const w = k && k.json;
            if (j.fehler || !w) return { gruen: false, zahl: "Folge: " + String(j.fehler || (k && k.rest) || "").slice(-200) };
            const z = ["ego", "third"].map((p) => {
                const f = (((w["0.5"] || {}).posen || {})[p] || {}).fuss || {};
                return [p, f.halbschattenCm, f.kanten || 0];
            });
            const gruen = hw && k.exit === 0 && z.every(([, cm, n]) => cm != null && cm <= 3 && n >= 6);
            return { gruen, zahl: z.map(([p, cm, n]) => `Uhr 0.5 ${p} ${cm} cm (${n} Kanten)`).join(" · ") + ", " + (j.adapter || "Adapter ungenannt") };
        },
        pfad: [...BILD, "gelaende-core.js", "stamm/gelaende-*.js", "spec/pruefbuehne/**"],
        quelle: "1 = Halbschatten am Fuß ≤ 3 cm an einem Gerät",
    },

    // ───────── lod.K1 — der Umriss hält in jeder Stufe (w4-laub-saum) ─────────
    // DER SAUM AUS DEM GESETZ im Spiel-Baum (phyto-core `karteSaum` · `karteSaumMuster` in der Wahl der Stufen `impostorMips`, die
    // GPU-Ablage `KARTE_RECHNER_WGSL` saumK): über dem Kronen-Fuß wählt jede Stufe der Karte ihre Texel nach der Deckung des
    // Fußabdrucks und dem Muster der Art (Laub-Lappen, Nadel-Grate, die Zelle aus der Blattgröße in treeParams), genau so viele, wie
    // Stufe 0 deckt. K1#1 an der GPU: die Tafel-Pose der Soll-Tafel (laub-kante, `mass.werkzeug`) und ein Spielgang-Bild — das
    // Ego-Rig (`_loopCamera`) nach 8 s Gang auf der Bahn der Mess-Wiese, zum Waldhang der Tafel gedreht, ohne Blick-Wahl —, je
    // Bild die Klassen der Laub-Silhouette. Die schlechteste Teil-Klasse mit ≥ 5 000 px urteilt (darunter ist kante Rauschen
    // weniger Rand-Pixel), die Karte (fimp) steht in beiden Bildern, zweiton 0 (ein Dither senkt die Kohärenz ohne Gestalt).
    // DIE FAHRT (Merge w4-koord-sitzung, 30.10.): die Station kam mit Deckel 600 s aus koordination (eigener Boot, `lauf 8 --ein 20`).
    // IN DER SITZUNG (w4-sitzung-reif): die Probe gekürzt, nie ihr Urteil — den Ort Mess-Wiese stellt die Sitzung VOR dem Deckel (der Plan
    // nennt ihn, `probeOrt`), die Tafel-Pose liegt 5 m neben ihm im gebauten Ring; der Gang schwingt 2 s statt 20 s ein (die 20 s trugen
    // den kalten Ring des eigenen Boots — `--ein` misst nichts, es wartet), dann 8 s Gang auf der Bahn. Die Arbeit: Tafel-Bild ~6 s,
    // Teleport in den Ring ~3 s, Gang 10 s, Spielgang-Bild ~6 s — der Deckel 30 s; die GPU-Fahrt nennt, ob er warm hält.
    // OFFEN (w4-stationen-schnell-b; GTX b4bcf19c 49,4 s): jedes Klassen-Bild zahlt in 1920×1080 (die Leinwand der Soll-Tafel) Aufnahme,
    // G, G2 und je Teil-Klasse des Laubs ein O zu je 33 Bildern — das Tafel-Bild mit Blick-Wahl eine Aufnahme mehr —, der Gang 10 s
    // Wanduhr ist das Spielgang-Bild selbst (die Stufen im Gehen, nie in einer ruhenden Welt): kein Warten ohne Messung mehr darin
    {
        kriterium: "lod.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { sek: 30, befehl: befehlDer({
            name: "lod.K1#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "tafel", args: ["bild", "-284", "+1.7", "-1042", "-269", "34", "-1036", "--ziel", "tanne", "--klasse", LAUB_KLASSE, "--datei", "@DIR@/tafel.png"], datei: "@DIR@/tafel.abnahme.json" },
                { name: "wiese", args: ["umstellen", "--ort", "wiese", "--sicht", "ego"], muss: true },
                { name: "gang", args: ["lauf", "8", "--ein", "2", "--wandern", "bahn"] },
                { name: "auge", args: ["eval", LAUB_AUGE], muss: true },
                { name: "spielgang", args: ["bild", "@auge.0@", "@auge.1@", "@auge.2@", "@auge.3@", "@auge.4@", "@auge.5@", "--wahl", "0", "--klasse", LAUB_KLASSE, "--datei", "@DIR@/spielgang.png"], datei: "@DIR@/spielgang.abnahme.json" },
            ],
        }) },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => laubKanteUrteil(j || laubKanteRoh(lauf.stdout)),
        proben: laubKanteProben(),
        pfad: [...BILD, ...LOD_PFAD, "scripts/lib/abnahme-urteil.cjs"],
        quelle: "1 = kante ≤ 0,22 je Teil-Klasse (die schlechteste urteilt) an der Tafel-Pose UND einem Spielgang-Bild an einem Gerät, frisch am Kopf",
    },

    // ───────── lod.K5 · lod.K2 — die Stufe folgt dem Schirm, nicht dem Regler (w3v-lod) ─────────
    // DAS GESETZ DES WECHSELS im Spiel-Baum (`AnazhRealm._wechselGesetz`, stamm/vegetation-streu.js): der Abstand, an dem der Fehler der
    // Stufe (LOD_SCHIRM.fehler, am Bau gemessen) am Schirm 1 px trägt, höchstens der Haushalt des Buchs; jeder Leser fragt es (die
    // Schwellen der Masken von Baum, Streu und Wagen, die Grenzen von Haus, Tor, Ausstattung), der Laub- und der Bau-Rand sind der Haushalt
    // (`_randSchirm`), kein Regler. K5#1 an der GPU: je Familie die schlechteste Vorlage im Wechsel-Abstand des Gesetzes, L0 erzwungen gegen
    // die gewählte Stufe im Ausgabe-Bild, Chamfer der Masken-Kanten (bericht/2910-lod-k5/kanten.js); die Mechanik ohne Bild misst
    // bericht/2910-lod-k5/fehler-am-bau.cjs am Bau (29.10.: Baum 12,06 px, Haus 2,95, Tor 7,85, Wagen 0,02, Ausstattung 0,72 — ROT
    // erwartet an Baum, Haus und Tor: der Haushalt hält, die Stufe trägt das Soll dort nicht).
    // K5#2 headless: die Regler-Simulation des Playtests (S6, die echte Kette Fold → PID → Aktuator) bei 30/60/144 fps, Puls und Regler
    // ±10 %. K2#1 an der GPU: Gehen 4 m/s an der Mess-Wiese, je Schritt dieselbe Pose vor und nach dem Takt (bericht/2910-lod-k5/pop.js).
    {
        kriterium: "lod.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // IN DER SITZUNG (29.10.): EIN Ort (Wiese), 7 Fälle Familie × Stufe je drei Schüsse (leer, L0, Stufe); die Exemplare fallen
        // am Ende, die Schalter kehren zurück. DAS TEMPO (w4-proben-tempo, 30.10.; GTX 379e5f56 ≥ 90 s am Eich-Deckel): DER TÄTER — die
        // Foundry gibt ihre Lieferung nur im Takt frei (`_tickFoundryIngest`, stamm/dirigent-takt.js:307), die Welt ruht in der Probe:
        // `stelle` wartete je Stufe 400 × 50 ms ins Leere (jeder Fall „Stufe nicht gestellt“ an GTX und Radeon seit 29.10., 14 × 20 s);
        // dazu drei Aufnahmen je Schuss (63 zu 33 Bildern). Jetzt bestellt kanten.js L0 und Stufe gleich nach dem Setzen, gibt die
        // Lieferung unter den Schaltern der Welt frei (eine Lieferung ohne `foundryCrossfade` trägt keine Stufen-Stempel — die Nah-Streu
        // bricht an ihr, Werkbank 30.10.) und schießt EINE Aufnahme je Schuss, die Treue einmal: 22 Aufnahmen, swiftshader alle 14 Stufen
        // gestellt (vorher 0), Treue 0 Bytes. Der Deckel aus der Arbeit: 22 Aufnahmen (GTX ≈ 0,43 s je Aufnahme aus lod.K2#1) + 14
        // Lieferungen (kalt 0,15–1,0 s) — 26 s; die Eich-Fahrt der GTX richtet ihn. DAS WARTEN IM BAU-EREIGNIS (w4-stationen-schnell-a,
        // 31.10.; GTX b4bcf19c wieder ≥ 90 s nach „umstellen“): DER TÄTER die Höhen-Schleife des Baums mit verkehrter Bedingung — sie
        // wartete für Haus, Haus, Tor, Tor und Wagen je volle 400 × 50 ms (Null-Welt ohne Aufnahmen 108,5 s, davon 104 s); dazu warteten
        // Lieferung und `stelle` an der Wanduhr. Jetzt `__gebautNach` je Wartestelle (der Deckel zählt nur Takte ohne Offenes), die Höhe
        // nur am Baum: dieselbe Null-Welt 4,2 s, alle 7 Fälle gestellt; ein Fall ohne Stufe steht nach 120 leeren Takten beim Namen
        // (`fehler`, ein Bruch im Urteil). GTX hergeleitet: 22 Aufnahmen × 0,43 s + Lieferungen ≈ 13–17 s statt ≥ 90 s
        probe: { sek: 10, befehl: befehlDer({
            name: "lod.K5#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "umstellen", args: ["umstellen", "--ort", "wiese"], muss: true },
                { name: "kanten", probe: "@KOORD@/bericht/2910-lod-k5/kanten.js", blob: "64942eb74271d12c08d4df01327ce89a06962311", muss: true, ms: 1800000 },
            ],
        }), },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 15,
        // DIE POSE DES TORS (w8-lod-wechsel, 03.11.): kanten.js stellt die Flügel der L0 über den EINEN Schwenk-Träger in die Fern-Pose,
        // die die Stufe im Körper trägt — ein Tor-Fall ohne ihren Winkel (`pose`) maß die gebacken geschlossene L0 (8e6262cc: Kathedrale
        // L1 9,95 px, die Flügel, nie der Bau) und ist ein Bruch. Ohne {AUS} liest das Urteil die Folge aus der Ausgabe (die Proben).
        urteil: (j, lauf) => {
            if (!j && lauf && /^s*{/.test(String(lauf.stdout)))
                try {
                    j = JSON.parse(lauf.stdout);
                } catch (_e) {
                    j = null;
                }
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const k = j.schritte && j.schritte.kanten;
            const e = k && k.json && k.json.ergebnis;
            if (!e || !Array.isArray(e.faelle)) return { gruen: false, zahl: "keine Kanten-Antwort (" + ((k && k.rest) || "").slice(-200) + ")" };
            const FAM = { tree: "Baum", haus: "Haus", gate: "Tor", vehicle: "Wagen" };
            const je = {};
            const bruch = [];
            for (const f of e.faelle) {
                if (f.fehler || !f.ok || f.px == null || !(f.pixel >= 200)) bruch.push(f.kind + " L" + f.stufe + ": " + (f.fehler || (f.ok ? "Exemplar " + f.pixel + " px" : "Stufe nicht gestellt")));
                else if (f.kind === "gate" && !Number.isFinite(f.pose)) bruch.push("gate L" + f.stufe + ": die L0 ohne die Pose des Spiels");
                else je[f.kind] = Math.max(je[f.kind] || 0, f.px);
            }
            const fehlt = Object.keys(FAM).filter((x) => !(x in je));
            const gruen = hw && !bruch.length && !fehlt.length && Object.values(je).every((x) => x <= 1);
            return {
                gruen,
                zahl:
                    Object.keys(FAM).map((x) => FAM[x] + " " + (x in je ? je[x].toFixed(2) : "—") + " px").join(" · ") + " (Soll ≤ 1 px am Wechsel-Abstand, 1920 × 1080)" +
                    (bruch.length ? " · " + bruch.join(" · ") : "") + ", " + (j.adapter || "Adapter ungenannt"),
            };
        },
        proben: (() => {
            const fall = (kind, stufe, px, pose) => ({ kind, stufe, d: 12, px, pixel: 40000, pose, ok: true, geliefert: true });
            const folge = (faelle) => JSON.stringify({ plan: "lod.K5#1", adapter: "[linse-gpu] amd/rdna-3", schritte: { kanten: { exit: 0, json: { ergebnis: { schirm: [1920, 1080], faelle } } } } });
            const gut = [fall("tree", 1, 0.8), fall("haus", 2, 0.9), fall("gate", 1, 0.67, 0.975), fall("gate", 2, 0.9, 0.975), fall("vehicle", 1, 0.3)];
            return [
                { name: "jede Familie ≤ 1 px, die Tore in der Pose des Spiels", stdout: folge(gut), gruen: true },
                { name: "ein Tor ohne die Pose des Spiels (die L0 gebacken zu)", stdout: folge(gut.map((f) => (f.kind === "gate" ? Object.assign({}, f, { pose: undefined }) : f))), gruen: false },
                { name: "die geschlossene L0 neben der Fern-Pose (8e6262cc: Tor 9,95 px)", stdout: folge(gut.map((f, i) => (i === 2 ? Object.assign({}, f, { px: 9.952 }) : f))), gruen: false },
                { name: "der Wagen ohne Exemplar im Bild", stdout: folge(gut.map((f) => (f.kind === "vehicle" ? Object.assign({}, f, { px: null, pixel: 0 }) : f))), gruen: false },
            ];
        })(),
        pfad: [...BILD, ...LOD_PFAD],
        quelle: "1 = je Familie (Baum, Haus, Tor, Wagen) ist am Wechsel-Abstand der Kanten-Versatz L0 ↔ Stufe ≤ 1 px bei 1920×1080, an einem Gerät",
    },
    {
        kriterium: "lod.K5",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/playtest.cjs"],
        env: { PLAYTEST_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/).find((x) => /^\s*(✅|❌) Regler-Sim S6 die Stufe und der Rand am Schirm/.test(x));
            const m = l && /— K5#2 Spanne ([\d.]+) · (\{.*)$/.exec(l);
            if (!m) return { gruen: false, zahl: "keine S6-Zeile der Regler-Simulation (Exit " + lauf.exit + ")" };
            let s = null;
            try {
                s = JSON.parse(m[2]);
            } catch (_e) {
                return { gruen: false, zahl: "die S6-Zeile trägt kein JSON" };
            }
            const gruen = /^\s*✅/.test(l) && +m[1] >= 0.3 && s.laeufe >= 17 && s.anders === null;
            return {
                gruen,
                zahl: s.laeufe + " Läufe bei 30/60/144 fps, Puls und Regler ±10 % (loadScale " + s.loadScale.join("–") + "): " +
                    (s.anders === null ? "Abstände, Schwellen, Grenzen, Wahl und Ränder gleich" : "es wandert " + String(s.anders).slice(0, 120)) +
                    ", die Mutante (Regler-Term im Gesetz) " + (/^\s*✅/.test(l) ? "wandert" : "oder die Spanne fehlt"),
            };
        },
        pfad: [...LOD_PFAD, "scripts/playtest.cjs", "scripts/playtest/dirigent.cjs"],
        quelle: "2 = die Wechsel-Abstände bleiben bei 30/60/144 fps und Regler des Spielers ±10 % gleich (Pixelgröße statt Bildrate), beide Geräte",
    },
    {
        kriterium: "lod.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // IN DER SITZUNG (29.10.): EINE Sekunde Gehen (4 m in 8 Schritten) je Schritt zwei Schüsse — Ziel 25 s. DAS TEMPO
        // (w4-proben-tempo, 30.10.; GTX 379e5f56 49,3 s über dem Gesetz): sechs Aufnahmen je Schuss (96 zu 33 Bildern, die letzte
        // zählte) → EINE, die Treue einmal: 17 Aufnahmen (swiftshader Treue 0 Bytes, Pop 0,635 %/s ROT wie zuvor) — der Deckel aus der
        // Arbeit: 17 Aufnahmen (GTX ≈ 0,43 s) + 8 × 24 Takte des Spiels — 22 s; die Eich-Fahrt der GTX richtet ihn
        probe: { sek: 21, befehl: befehlDer({
            name: "lod.K2#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "umstellen", args: ["umstellen", "--ort", "wiese", "--sicht", "ego"], muss: true },
                { name: "pop", probe: "@KOORD@/bericht/2910-lod-k5/pop.js", blob: "16db9f06fb6384ac170302e26e7d0dc73069b8e8", muss: true, ms: 1800000 },
            ],
        }) },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const k = j.schritte && j.schritte.pop;
            const e = k && k.json && k.json.ergebnis;
            if (!e || !Array.isArray(e.schritte) || e.schritte.length < 8) return { gruen: false, zahl: "keine Pop-Antwort (" + ((k && k.rest) || "").slice(-200) + ")" };
            const gruen = hw && e.anteilJeSekunde <= 0.05;
            return {
                gruen,
                zahl:
                    "Gehen 4 m/s: " + e.anteilJeSekunde + " % Pop-Pixel je Sekunde (" + e.popPixel + " px, Soll ≤ 0,05 %), je Schritt " +
                    e.schritte.map((x) => x.pop + (x.stufen ? "*" : "")).join("/") + " (* = Stufen-Wechsel), Laub " + e.laub[0] + "–" + e.laub[e.laub.length - 1] +
                    " m, perfTarget " + e.perfTargetMs + " ms, " + (j.adapter || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, ...LOD_PFAD, "stamm/gelaende-*.js"],
        quelle: "1 = eine Bewegungsart an einem Gerät ≤ 0,05 % Pop-Pixel je Sekunde",
    },
    {
        kriterium: "material.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // w3w-glanz (EIN Spiegel-Pass für Wasser, Glas, Lack, Metall, Nässe — das Glanz-Ziel des Szenen-Passes, `_spiegelUmgebung`):
        // koordination `bericht/2910-w3w-glanz/spiegel-lack.js` über `werkbank eval` in der Welt der Sitzung — ein GT rechts neben dem
        // Spieler, der Ego-Blick (`_loopCamera`) trifft seine Flanke streifend; Lack und Seiten-Scheibe je mit ihrer Maske (der Schuss
        // ohne sie) und ihrer Ebene (Haupt-Achsen der Welt-Punkte, ≤ 3 cm), das Maß der Wasser-Station (`klassenMasse` spiegelTreue,
        // die Achse an der Ebene: abnahme-urteil `spiegelPartner` mit `normale`). Gültig: Ego, Mittag klar, Einfall 45–85°, ≥ 2 000 Pixel
        // in der Ebene und ≥ 8 Blöcke.
        // DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 4,8 s): der Deckel steht in der Tafel der Fahrt (punkte.cjs DIE DECKEL)
        probe: { sek: 10, befehl: befehlDer({
            name: "material.K4#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "spiegel", probe: "@KOORD@/bericht/2910-w3w-glanz/spiegel-lack.js", blob: "e9ba0e39b1c24c8773296cdefc57551d1b298d4c", muss: true },
            ],
        }) },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 4,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const k = j.schritte && j.schritte.spiegel;
            const e = k && k.json && k.json.ergebnis;
            if (!e) return { gruen: false, zahl: "keine Spiegel-Antwort (" + ((k && k.rest) || "").slice(-200) + ")" };
            if (e.ende !== "ok" || !e.ergebnis) return { gruen: false, zahl: "Probe: " + (e.fehler || e.ende) };
            const st = e.stand || {};
            // DIE POSE beim Namen (w4-linsen-b): Ego, Mittag klar — die Uhr über `uhrIst` (die Probe baut den GT im Takt des Spiels)
            const posefehl = [st.sicht === "first" ? null : "Sicht " + st.sicht, uhrIst(st.uhr, 0.5) ? null : "Uhr " + st.uhr + " nicht Mittag (± " + UHR_TOL + ")",
                st.wetter === "sunny" ? null : "Wetter " + st.wetter].filter(Boolean);
            const teile = [];
            let gruen = false;
            for (const n of ["lack", "glas"]) {
                const m = e.ergebnis[n] || {};
                const gueltig = m.ebene >= 2000 && m.bloecke >= 8 && m.einfallGrad >= 45 && m.einfallGrad <= 85 && !m.quer;
                if (hw && !posefehl.length && gueltig && m.spiegelTreue != null && m.spiegelTreue >= 0.5) gruen = true;
                teile.push(
                    n + " spiegelTreue " + m.spiegelTreue + (gueltig ? "" : " UNGÜLTIG") + " (" + (m.fehler || m.ebene + " px in der Ebene, " + m.bloecke +
                        " Blöcke, Einfall " + m.einfallGrad + "°, Normale " + JSON.stringify(m.normale)) + ")"
                );
            }
            return {
                gruen,
                zahl: teile.join(" · ") + " · Soll ≥ 0,5 an Lack oder Scheibe · " + st.sicht + " Uhr " + st.uhr + " " + st.wetter +
                    (posefehl.length ? " — POSE UNGÜLTIG: " + posefehl.join(", ") : "") + (hw ? "" : " — kein Adapter einer Karte") + " · " + (j.adapter || "Adapter ungenannt"),
            };
        },
        pfad: [
            ...BILD,
            "stamm/studio-*.js",
            "stamm/siedlung-*.js",
            "stamm/bau-*.js",
            "vehicle-core.js",
            "foundry-bruecke.js",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = spiegelTreue ≥ 0,5 an Fenster-Glas ODER Lack aus Ego an einem Gerät",
    },
    {
        kriterium: "material.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // w3w-glanz (Rauheit und Metall aus der Stoff-Zeile, `_stoffOptik`): koordination `bericht/2910-w3w-glanz/kugel-glanz.js` über
        // `werkbank eval` — je Klasse EINE Kugel im Welt-Stoff ihrer Zeile (Umgebung aus), das Auge bei θd 25°, die Belichtungs-Reihe
        // C / A × 1, 1/32, 1/1024 → die BRDF je Pixel, ihr Profil über θh; Breite θ50 (Median der Spitzen-Energie über θh 0–20°) und
        // Spitze ρ (Kappe θh ≤ 1° je Energie, 1/sr). DIE REFERENZ: MERL (Matusik et al. 2003) über die NBRDF-Netze von Sztrajman et al.
        // 2021 (github asztr/Neural-BRDF data/merl_nbrdf.zip), bei θd 25° dieselben Maße je Exemplar; das Band der Klasse von ihrem
        // kleinsten bis zum größten Exemplar, die Toleranz der Bühne Breite ± max(0,3°, 5 %), Spitze ×/÷ 1,3.
        // DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 11,4 s): der Deckel steht in der Tafel der Fahrt (punkte.cjs DIE DECKEL)
        probe: { sek: 17, befehl: befehlDer({
            name: "material.K5#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "kugel", probe: "@KOORD@/bericht/2910-w3w-glanz/kugel-glanz.js", blob: "d3d9eb61334d924027e700d582839c5a8c09a694", muss: true },
            ],
        }) },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 4,
        urteil: (j) => {
            if (!j) return { gruen: false, zahl: "keine Messung in {AUS}" };
            const hw = !!j.adapter && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(j.adapter);
            if (j.fehler) return { gruen: false, zahl: "Folge: " + j.fehler };
            const k = j.schritte && j.schritte.kugel;
            const e = k && k.json && k.json.ergebnis;
            if (!e) return { gruen: false, zahl: "keine Kugel-Antwort (" + ((k && k.rest) || "").slice(-200) + ")" };
            if (e.ende !== "ok") return { gruen: false, zahl: "Probe: " + (e.fehler || e.ende) };
            // je Klasse [θ50 von, bis] in Grad und [ρ von, bis] in 1/sr — MERL über NBRDF bei θd 25°
            const REF = {
                eisen: [[11.09, 11.09], [8.2, 8.2], "black-oxidized-steel"],
                bronze: [[1.31, 7.79], [51.4, 471.3], "alum-bronze 7,79°/51,4, brass 1,31°/471,3"],
                quarz: [[0.63, 1.45], [437.3, 698.5], "black-obsidian 0,63°/698,5, aventurnine 1,45°/437,3"],
                stahl: [[0.45, 0.47], [716.5, 775.0], "steel, ss440, chrome-steel"],
            };
            const teile = [];
            let im = 0;
            for (const [n, [b, s, ex]] of Object.entries(REF)) {
                const m = (e.klassen || {})[n];
                if (!m || m.breite == null || m.spitze == null) {
                    teile.push(n + " ungemessen");
                    continue;
                }
                const tb = Math.max(0.3, 0.05 * b[1]);
                const gueltig = m.thetaD != null && Math.abs(m.thetaD - 25) <= 3 && m.pixel >= 5000 && (m.luecken || []).length === 0;
                const breit = m.breite >= b[0] - tb && m.breite <= b[1] + tb;
                const spitz = m.spitze >= s[0] / 1.3 && m.spitze <= s[1] * 1.3;
                if (gueltig && breit && spitz) im++;
                teile.push(
                    n + " θ50 " + m.breite + "° " + (breit ? "im" : "NEBEN dem") + " Band, ρ " + m.spitze + " " + (spitz ? "im" : "NEBEN dem") + " Band" +
                        (gueltig ? "" : " UNGÜLTIG (θd " + m.thetaD + ", " + m.pixel + " px, Lücken " + JSON.stringify(m.luecken) + ")") + " — " + ex
                );
            }
            const st = e.stand || {};
            const gruen = hw && im >= 3 && uhrIst(st.uhr, 0.5) && st.wetter === "sunny";
            return {
                gruen,
                zahl: im + " von 4 Klassen im Band (Soll ≥ 3): " + teile.join(" · ") + " · Sonne " + e.sonnenHoeheGrad + "°, Uhr " + st.uhr + " " + st.wetter + ", " + (j.adapter || "Adapter ungenannt"),
            };
        },
        pfad: [...BILD, "stamm/bau-*.js", "stamm/siedlung-*.js", "stamm/vegetation-*.js", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = Glanz-Breite und -Spitze an der Kugel-Bühne für ≥ 3 Klassen im realen Band einer gemessenen BRDF-Referenz, an einem Gerät",
    },
    // ───────── licht.K1 · licht.K3 — die Tag-Achse und das Laub im Licht der Uhr (w3v-licht, w4-licht-baustein) ─────────
    {
        kriterium: "licht.K1",
        staffel: 1,
        // EIN Gerät (die Staffel: „an einem Gerät"; w4-fehlt-acht): die GTX — die Fahrt der Radeon trägt die Laub-Probe und tiere.K5#1
        geraet: "gtx",
        // werkbank licht --tag (licht-linsen.cjs `tagKurve` · `tagFeinUhren` · `tagKurveUrteil`, w3v-licht): Spawn (genesis) und
        // Mess-Wiese in Ego, Uhr 0 … 0,99 in 0,01, um den Horizont (Sonne −18 … 15°) in 0,002 nachgetastet, mittags die 18-%-Karte
        // im Ausgabe-Bild. Die Linse urteilt das ganze Soll (ANKER · SPRUNG · BUCKEL · GOLD · NACHT · REF gegen spec/farbe/tag-ref.json
        // ± 0,3 Stufen · ASYNC · SCHREIBER); die Station rechnet die Zahlen der Staffel noch einmal aus der Messung selbst und verlangt
        // die ganze Bahn (100 Grob-Zeilen, ≥ 60 Fein-Zeilen je Ort).
        // IN DER SITZUNG (w4-fehlt-acht, proben-welt.cjs `werkbankLinse`): derselbe Befehl der Linse ohne `--eigen`, im Fenster der Station
        // (640×360, das Tor trug es) — Genesis stellt die Sitzung VOR dem Deckel, die Mess-Wiese die Linse. DER SPRUNG DES LICHTS je Uhr:
        // der Gang des Licht-Pools (Wahl und Blende, `_leuchtTakt`) springt mit der Uhr zu seinem Fixpunkt — die Linse wartete bis
        // 20 × 50 ms, bis jeder Platz stand; der Anker in `tagKurve` setzt Wahl- und Blend-Uhr zurück, EIN Takt trägt die Stunde (dasselbe
        // Licht, nur ohne Warten). Die Aufnahme bleibt die der Linse (die 32 Bilder der Geschichte, A8-n1). RUF-Zeilen je Kurve: am Deckel
        // nennt die letzte die Sekunden je Uhr.
        // OFFEN (w4-stationen-schnell-b; GTX b4bcf19c 48,6 s): die Staffel liest zwei Orte — Genesis (die Sitzung stellt es), dann die
        // Mess-Wiese kalt im Deckel (RUF /umstellen 13,2 s) — und je Ort 188 Uhren (100 grob, 88 fein): 376 Aufnahmen zu 2–5 Bildern
        // (Mittel 4,2), 9,5–9,7 s je grobe Kurve, ~95 ms je Uhr. Der WEG gegen die volle Aufnahme ist an b4bcf19c selbst ROT (Y 0,0124 > 0,01)
        probe: TAG_PROBE,
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(lauf.stdout) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const u = /^TAG-ACHSE (GRUEN|ROT)[^\r\n]*/m.exec(lauf.stdout);
            if (!j || !u) return { gruen: false, zahl: "keine Messung oder keine TAG-ACHSE-Zeile (Exit " + lauf.exit + "): " + String(lauf.stderr || "").trim().slice(-200) };
            let gruen = hw && u[1] === "GRUEN" && lauf.exit === 0;
            const teile = [];
            for (const ort of ["genesis", "wiese"]) {
                const m = j[ort] || {};
                const grob = m.zeilen || [];
                const alle = grob.concat(m.fein || []).sort((a, b) => a.uhr - b.uhr);
                const [mittag, nacht] = [0.5, 0].map((x) => alle.find((z) => z.uhr === x));
                if (!mittag || !nacht || grob.length < 100 || alle.length - grob.length < 60) {
                    gruen = false;
                    teile.push(ort + ": Bahn " + grob.length + "/100 grob, " + (alle.length - grob.length) + " fein");
                    continue;
                }
                const e = (z) => Math.log2(z.Y / mittag.Y);
                const sprung = Math.max(...alle.slice(1).map((z, i) => Math.abs(e(z) - e(alle[i]))));
                const buckel = Math.max(...alle.map(e));
                // die Sonne 10° je Seite zwischen ihren Zeilen gelesen: EV gegen Mittag und R/B gegen Mittag
                const gold = [alle.filter((z) => z.uhr < 0.5), alle.filter((z) => z.uhr > 0.5)].map((s) => {
                    const i = s.findIndex((z, k) => k && (s[k - 1].sonne - 10) * (z.sonne - 10) <= 0);
                    if (i < 1) return null;
                    const [a, b] = [s[i - 1], s[i]];
                    const t = (10 - a.sonne) / (b.sonne - a.sonne || 1);
                    return [e(a) + (e(b) - e(a)) * t, (a.warm + (b.warm - a.warm) * t) / mittag.warm];
                });
                const ok =
                    m.karte >= 110 && m.karte <= 130 && sprung <= 0.1 && buckel <= 0.15 &&
                    gold.every((g) => g && g[0] >= -1 && g[0] <= -0.5 && g[1] >= 1.3) &&
                    e(nacht) >= -5 && e(nacht) <= -3 && nacht.hell >= 22;
                if (!ok) gruen = false;
                teile.push(
                    ort + ": Karte Luma " + m.karte + ", Sprung " + sprung.toFixed(3) + " EV, Buckel " + buckel.toFixed(2) + " EV, Sonne 10° " +
                        gold.map((g) => (g ? g[0].toFixed(2) + " EV R/B ×" + g[1].toFixed(2) : "fehlt")).join(" | ") + ", Nacht " +
                        e(nacht).toFixed(2) + " EV Luma " + nacht.hell
                );
            }
            return { gruen, zahl: teile.join(" · ") + " · Linse " + u[0].slice(0, 200) + " · " + (ad || "Adapter ungenannt") };
        },
        pfad: [...BILD, "spec/farbe/tag-ref.json", "stamm/studio-bruecke.js", "stamm/vegetation-*.js", "gelaende-core.js", "stamm/gelaende-*.js"],
        quelle: "1 = an einem Gerät in einer Sicht über die ganze Bahn im Soll",
    },
    {
        kriterium: "licht.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // die F6-Linse (werkbank licht --laub … --karte --uhr, licht-linsen.cjs `laubGegenlicht` + `laubLichtUrteil`): die Karte
        // gegen ihre Gestalt (fichte, tanne, am Exemplar nächst der Mess-Wiese) und der Fern-Ring gegen den Boden-Satz an derselben
        // Stelle (Messort dorf), dasselbe Auge, je Uhr 0,5/0,27/0,05. Das Soll der Staffel: jede Zeile Fernstufe/Gestalt 0,9–1,1
        // (die Linse urteilt die Stunde gegen ihren Mittag; hier zählt jede Zeile selbst, der Mittag eingeschlossen).
        // IN DER SITZUNG (w4-proben-tempo2): ihr eigener Lauf der neun Zeilen (fichte, tanne, ring je Uhr, LAUB_PROBE_1)
        probe: LAUB_PROBE_1,
        gpu: true,
        zeit: false,
        minuten: 20,
        urteil: (j, lauf) => {
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(lauf.stdout) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const w = (j && j.welt) || {};
            let gruen = hw;
            const teile = [];
            for (const art of ["fichte", "tanne", "ring"])
                for (const uhr of ["0.5", "0.27", "0.05"]) {
                    const z = w[art + "@" + uhr];
                    const v = z && z.karte ? z.karte.verhaeltnis : null;
                    if (!(v >= 0.9 && v <= 1.1)) gruen = false;
                    teile.push(art + "@" + uhr + " " + (v != null ? v : (z && z.fehler) || "ungemessen"));
                }
            return { gruen, zahl: teile.join(" · ") + " · Soll 0,9–1,1 · " + (ad || "Adapter ungenannt") };
        },
        pfad: [...BILD, "phyto-core.js", "gelaende-core.js", "stamm/gelaende-*.js", "stamm/vegetation-*.js", "stamm/studio-bruecke.js"],
        quelle: "1 = Karte und Fern-Ring je Uhr 0,5/0,27/0,05 im Band 0,9–1,1 an einem Gerät",
    },
    {
        kriterium: "licht.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // w4-licht-baustein: dieselbe F6-Linse (werkbank licht --laub … --karte --uhr, licht-linsen.cjs `laubGegenlicht`, `lichtWeg`,
        // `laubLichtUrteil`) über die Fernstufen der Staffel 1 (die Karte fichte/tanne gegen ihre Gestalt, der Fern-Ring gegen den
        // Boden-Satz) UND die Wege, die ihr Licht aus dem EINEN Baustein `_weltLicht` nehmen: die graue Fläche (18 %) im Licht der
        // Welt-Stoffe gegen den Feld-March (waagrecht, senkrecht 0/90/180° neben der Sonne), das Panorama, den Spiegel (der Boden des
        // Spiegel-Felds gegen die waagrechte Karte, zur Sonne und abgewandt) und den Wasser-Körper — je Uhr 0,5/0,27/0,05, ohne Luft
        // und Schatten (Messort dorf). Das Soll der Staffel: jede Zeile Weg bzw. Fernstufe gegen die Welt 0,9–1,1; das Urteil fällt je
        // Gerät, die Staffel gilt mit beiden. Die Mechanik (jeder Pass nimmt jedes Licht aus dem Baustein, drei Mutanten ROT beim
        // Namen) urteilt der Playtest (`checkBandLichtBaustein`).
        // IN DER SITZUNG (w4-fehlt-acht, proben-welt.cjs `werkbankLinse`): derselbe Befehl der Linse ohne `--eigen`, im Fenster der Station
        // (640×360); jedes Einschwingen der Linse (`ein()`: `/lauf` 5 s, `ein` 8 s, Ruhe bis 120 s — je Karten-Zeile bis zu sechsmal) ist
        // DIE BERUHIGUNG beim Namen (die Bühne, dann `__weltStehtNach`: die Welt steht). Die Reihe der Arten beginnt am Dorf (der Ring und
        // die Wege des Lichts, sein Messort stellt die Sitzung VOR dem Deckel), Fichte und Tanne folgen an der Mess-Wiese — das Urteil liest
        // jede Zeile beim Namen, die Reihe nie.
        // OFFEN (w4-stationen-schnell-b; GTX b4bcf19c 80,1 s, die RUF-Zeilen): am Dorf der Gang ans Auge des Rings 57 m im lebenden Dorf
        // 14,1 s (die Welt steht erst, wenn seine Leute stehen) und 24 Wege des Lichts ~10 s, dann die Mess-Wiese für Fichte und Tanne kalt
        // 33,7 s im Deckel, dort 20 Beruhigungen und die Schüsse ~15 s — zwei Orte in EINER Probe; DER ORT IM DECKEL nennt den Weg
        probe: LAUB_PROBE,
        gpu: true,
        zeit: false,
        minuten: 40,
        urteil: (j, lauf) => {
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(lauf.stdout) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const w = (j && j.welt) || {};
            let gruen = hw;
            const teile = [];
            for (const art of ["fichte", "tanne", "ring", "feld", "feld0", "feld90", "feld180", "panorama", "spiegel", "spiegel180", "wasser"])
                for (const uhr of ["0.5", "0.27", "0.05"]) {
                    const z = w[art + "@" + uhr];
                    const v = z && z.karte ? z.karte.verhaeltnis : null;
                    if (!(v >= 0.9 && v <= 1.1)) gruen = false;
                    teile.push(art + "@" + uhr + " " + (v != null ? v : (z && z.fehler) || "ungemessen"));
                }
            return { gruen, zahl: teile.join(" · ") + " · Soll 0,9–1,1 · " + (ad || "Adapter ungenannt") };
        },
        pfad: [...BILD, "phyto-core.js", "gelaende-core.js", "stamm/gelaende-*.js", "stamm/vegetation-*.js", "stamm/studio-bruecke.js", "stamm/wasser-*.js"],
        quelle: "2 = auch Feld-Pass, Panorama und Wasser, beide Geräte",
    },
    // ───────── lod.K3 — aus jeder Blick-Hebung (w4-hebungsringe) ─────────
    // DIE HEBUNGS-RINGE (foundry-core impostor.hebungen −20/0/40/80, ringTeiler 2: der Ring 0° in voller Zelle, die übrigen in ¼
    // der Zellfläche — die Atlas-Diät, phyto-core `karteRinge`): die Karte backt je Takt EINEN Ring, kippt zum Auge und wählt je
    // Pixel den Ring der Hebung. gate:foundry-impostor C6 backt eine flache Krone über einem Stamm durch den ECHTEN Bake (gedreht
    // −119°, Skala 1,5, abseits des Ursprungs) und misst je Hebung Deckung K/G und IoU gegen dieselbe Gestalt als Mesh, je
    // Schicht-Format (bc mit WebGPU-BC, rgba8); Selbsttest: jeder Ring waagrecht gebacken. Cloud (swiftshader, w4-hebungsringe
    // 69d7d3f2): bc −20° 1,004/0,966 · 0° 1,064/0,894 · 40° 1,003/0,983 · 80° 0,97/0,97, waagrecht 80° 0,341/0,237; dieselbe Probe
    // an main 715754fc: 80° 0,064/0,064, 40° 0,294/0,272, −20° 0,493/0,432.
    {
        kriterium: "lod.K3",
        staffel: 1,
        // EIN Gerät (die Staffel: „an einem Gerät"; w4-fehlt-acht): die GTX — die Fahrt der Radeon trägt die Laub-Probe und tiere.K5#1
        geraet: "gtx",
        // IN DER SITZUNG (w4-fehlt-acht, proben-welt.cjs `karteHebung`): Teil C der Linse in der Seite der Welt, mit drei Ankern auf C6
        // gekürzt (C6 Byte für Byte), je Format ein frischer Probe-Renderer und Probe-Atlas, gedruckt mit dem Block der Linse; die Welt
        // bekommt Atlas, Bühne, Rechner, Stoffe, Wind und Foundry zurück (`leihe`), die Ziele des Probe-Renderers fallen vor ihm (die
        // Bühne ruht sofort), der VRAM-Rest nach dem GC ≤ 1 MB, sonst keine Zeile (headless swiftshader: beide Zeilen, Rest +0 MB).
        // FIMP_PORT las im Spiel-Baum niemand (die Linse lauschte auf Port 0). DER DECKEL DER ARBEIT (geschätzt): zwei Formate × (2 Bakes
        // × 4 Ringe, 15 Renders 128²) und der Pipeline-Bau des frischen Geräts — 15 s
        probe: { befehl: PW.torBefehl(PW.karteHebung), sek: 10, mutiert: false },
        gpu: true,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(t) || ["[linse-gpu] ungenannt"])[0];
            const hw = !/swiftshader|llvmpipe|lavapipe|software|subzero|ungenannt|kein /i.test(ad);
            const je = [...t.matchAll(/C6 HEBUNG \[(\w+)\]: ([^|\r\n]*)\| waagrecht 80° ([\d.]+)\/([\d.]+)/g)].map(([, fmt, rest, sd, si]) => {
                const w = {};
                for (const m of rest.matchAll(/(-?\d+)° ([\d.]+)\/([\d.]+)/g)) w[m[1]] = [+m[2], +m[3]];
                const ok = [-20, 0, 40, 80].every((p) => w[p] && w[p][0] >= 0.75 && w[p][1] >= 0.65) && +si < 0.65;
                return { ok, text: fmt + " " + [-20, 0, 40, 80].map((p) => p + "° " + (w[p] ? w[p].join("/") : "—")).join(" · ") + " (waagrecht 80° " + sd + "/" + si + ")" };
            });
            if (!je.length) return { gruen: false, zahl: "keine C6-Zeile (Exit " + lauf.exit + ") · " + ad };
            return { gruen: hw && je.every((x) => x.ok), zahl: "Deckung/IoU " + je.map((x) => x.text).join(" · ") + " (Soll ≥ 0,75/0,65) · " + ad };
        },
        proben: (() => {
            const zeile = (fmt, w, s) => "  C6 HEBUNG [" + fmt + "]: " + w + " | waagrecht 80° " + s + " · Ringe -20,0,40,80 · Schicht 515200 B";
            const ringe = "0° 1.064/0.894 · 40° 1.003/0.983 · 60° 0.882/0.745 · 80° 0.97/0.97 · -20° 1.004/0.966";
            const waag = "0° 1.065/0.894 · 40° 0.294/0.272 · 60° 0.182/0.179 · 80° 0.064/0.064 · -20° 0.493/0.432";
            const radeon = "[linse-gpu] webgl2/ANGLE (AMD, AMD Radeon(TM) 890M Graphics (0x0000150E) Direct3D11 vs_5_0 ps_5_0, D3D11)";
            return [
                { name: "eigener Lauf (swiftshader, Cloud)", stdout: "[linse-gpu] google/swiftshader\n" + zeile("bc", ringe, "0.341/0.237"), gruen: false },
                { name: "dieselben Zahlen auf der Karte", stdout: radeon + "\n" + zeile("bc", ringe, "0.341/0.237") + "\n" + zeile("rgba8", ringe, "0.341/0.237"), gruen: true },
                { name: "Mutante: die waagrechte Karte (main 715754fc, dieselbe Probe)", stdout: radeon + "\n" + zeile("bc", waag, "0.064/0.064"), gruen: false },
                { name: "Mutante: der Selbsttest ist blind (waagrecht 80° besteht)", stdout: radeon + "\n" + zeile("bc", ringe, "0.97/0.97"), gruen: false },
                { name: "ein Format reißt (rgba8 aus 80° 0,4)", stdout: radeon + "\n" + zeile("bc", ringe, "0.341/0.237") + "\n" + zeile("rgba8", ringe.replace("80° 0.97/0.97", "80° 0.4/0.38"), "0.341/0.237"), gruen: false },
                { name: "keine C6-Zeile (die Linse vor lod.K3)", stdout: radeon + "\n✅ GRÜN — die Welt-Fernstufe liest die im Welt-Renderer gebackene Karte", gruen: false },
            ];
        })(),
        // der Pfad der Probe dazu (w4-fehlt-acht): der Foundry-Cache der Probe-Körper (studio-*), der VRAM-Abgriff ihres Rests
        pfad: [...BILD, "phyto-core.js", "foundry-bruecke.js", "stamm/siedlung-satz.js", "stamm/vegetation-baum.js", "scripts/diag-foundry-impostor.cjs", "stamm/studio-*.js", "scripts/lib/vram-abgriff.cjs"],
        quelle: "1 = Karten-Deckung ≥ 0,75 und IoU ≥ 0,65 bei −20/0/40/80° für Bäume an einem Gerät",
    },
    // die Neun der Sitzung (DIE NEUN, oben): EIN Lauf, neun Urteile
    ...NEUN,
];

// Was sich nicht als Station fassen lässt. Steht neben der Liste; der Läufer liest es nicht.
stationen.fehlt = [
    {
        kriterium: "schatten.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund: "nicht in der Fahrt (w4-fehlt-acht, 30.10.): DER TÄTER BEIM NAMEN — `licht --kontakt` stellt je Uhr zweimal um (scripts/werkbank.cjs der CLI-Zweig: die Bühne, dann die Platte saat-s7-platte 461 m daneben), je Umstellen ein kalter Ring 4: an 24a0f3ef (Radeon, 3,94 min, ROT Zuwachs 0,48–0,80 cm/m gegen 0,9 ± 0,25) trugen fünf Ringe ≈ 170 s, 84 Aufnahmen bei 1920×1080 (je Schuss zwei, die erste verworfen) ≈ 52 s, zerlegen k0 ≈ 6 s. DER SCHNITT: Bühne und Platte EINMAL vor der Uhr-Schleife (die Uhr springt danach), die Mess-Wiese vor dem Deckel durch die Sitzung, L nur für die abgetasteten Pixel — geschätzt 72–91 s, mit EINER Aufnahme je Schuss (Byte-Beweis an beiden Geräten) 51–70 s. Kein Zwilling von schatten.K1#1: dessen Urteil liest den Exit des Kontakts, der Zuwachs beider Uhren trüge ihn. Die Fahrt trägt sie nicht: nach den gemessenen Deckeln (Boot 120 → 60 s, profiband.K4 45 → 29, K5 45 → 36, affekt.K1#2 33 → 10, oekologie.K4#2 33 → 31, vegetation.K2#1 15 → 14, licht.K2#1 11 → 10) und licht.K1#1 · licht.K3 · lod.K3#1 · tiere.K5#1 steht jede Karte bei 1 800 von 1 800 s. Die Station steht in koordination 32fe3ffc.",
        quelle: "2 = Zuwachs ≈ 0,9 cm je m, Uhr 0,5 und 0,3, Kosten ≤ +0,3 ms an der GTX, beide Geräte",
    },
    {
        kriterium: "lod.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Je Familie fehlt die Karte selbst: Haus und Tor sind fern NUR-WURF, der Wagen trägt keine Karte — die Hebungs-Ringe " +
            "(w4-hebungsringe) gelten den Bäumen. Messbar wäre schon das VRAM-Band (werkbank band: tex:karte-albedo/-normal/-licht, " +
            "mit den Ringen 515 200 statt 294 784 B je Schicht; die Ratschen-Zeilen tragen das Vorher).",
        quelle: "2 = je Familie (Baum, Haus, Tor, Wagen), Atlas im VRAM-Band (≤ 118 MB gesamt), beide Geräte",
    },
    {
        kriterium: "material.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "`bild --arm` (material-mikro) hat Ziele nur für Boden und Fels; für Rinde, Putz, Holz und Haut auf Armlänge fehlt das Ziel. " +
            "β misst klassenMasse zwar, aber eine Linse gegen Kachel-Muster gibt es nicht.",
        quelle: "2 = Boden, Fels, Rinde, Putz, Holz, Haut, kein Kachel-Muster (1/f^β, β 0–2,4), beide Geräte",
    },
];

module.exports = stationen;
// die Seite der NEUN-Probe (die Probe lädt sie, `neunProbe`), nicht aufzählbar: die Liste bleibt die Liste der Stationen
Object.defineProperty(stationen, "neunSeite", { value: NEUN_SEITE, enumerable: false });
