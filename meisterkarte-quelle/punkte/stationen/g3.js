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

// DIE ALBEDO-TAFEL BEIDER SEITEN ECHT (material.K1) als Probe der Sitzung: die Welt-Seite wie diag-albedo-tafel neuMessen in der
// EINEN warmen Welt der Sitzung auf der echten GPU (WERKBANK_PORT, am Ort der gespeicherten Messung, die Welt steht —
// `__weltStehtNach` statt 10 s Wanduhr —, `albedo --tafel`), NEBENHER die Labor-Seite `diag-albedo-tafel.cjs --labor --echt` je
// Studio (die Studio-Seiten in ihrem Browser, Port WERKBANK_PORT+2; ihr Log neben der Ausgabe). Gerechnet wird je Zeile der Tafel
// am SHA: Welt/Labor und beide Seiten im realen Band ihrer Klasse (`plan.baender`, fest in der Station mit Quelle — der Baum
// trägt kein Band, und eine Zeile ohne Band hier ist ROT); dazu die Eichung beider Seiten gegen die Karte der Tafel. Nach {AUS}:
// `{ adapter, welt: { echt, geraet, eichung }, labor: { echt, geraet, eichung }, zeilen: [{ id, L, W, v, band, quelle, inBand }],
// eichung: { soll, rand, welt, labor }, fehler, sek }`. Exit 1 nur, wenn eine Seite nichts misst; das Urteil fällt die Station.
// Bis 29.10. startete die Probe ihre eigene Welt (save-server + Werkbank, 10 s Ruhe) und danach das Labor (ea07267e Radeon 5,37 min).
// eslint-disable-next-line max-lines-per-function
async function albedoTafelEcht(plan) {
    const fs = require("fs");
    const path = require("path");
    const cp = require("child_process");
    const [AUS] = process.argv.slice(1);
    const DIR = AUS + ".d";
    fs.mkdirSync(DIR, { recursive: true });
    const P = String(process.env.WERKBANK_PORT);
    const WB = path.join("scripts", "werkbank.cjs");
    const t0 = Date.now();
    const aus = { plan: plan.name, adapter: null, welt: null, labor: null, zeilen: [], eichung: null, fehler: null };
    const wb = (args, ms) =>
        cp.spawnSync(process.execPath, [WB, ...args, "--port", P], { encoding: "utf8", timeout: ms || 900000, maxBuffer: 1 << 28 });
    const rest = (r) => String((r.stdout || "") + (r.stderr || "")).slice(-300);
    // das Labor nebenher: sein Browser trägt nur die Studio-Seiten, seine Ausgabe geht in eine Datei (kein Rohr, das voll läuft)
    const ld = path.join(DIR, "labor.json");
    const llog = path.join(DIR, "labor.log");
    const lk = cp.spawn(process.execPath, [path.join("scripts", "diag-albedo-tafel.cjs"), "--labor", "--echt", "--datei", ld], {
        env: { ...process.env, ALBEDO_PORT: String(Number(P) + 2) },
        stdio: ["ignore", fs.openSync(llog, "w"), fs.openSync(llog, "a")],
    });
    const labor = new Promise((ok) => {
        lk.on("exit", (c) => ok(c));
        lk.on("error", (e) => ok("Start: " + e.message));
    });
    let t = null, Wm = null, Lm = null;
    try {
        t = JSON.parse(fs.readFileSync(path.join("spec", "farbe", "albedo-tafel.json"), "utf8"));
        aus.adapter = (/\[linse-gpu\][^\r\n]*/.exec(fs.readFileSync(String(process.env.PUNKTE_SITZUNG_LOG), "utf8")) || [null])[0];
        const gw = (t.gemessen && t.gemessen.welt) || {};
        const um = wb(gw.ort ? ["umstellen", "--ort", gw.ort] : ["umstellen", ...(gw.spieler || [0, 0]).map(String)]);
        if (um.status !== 0) throw new Error("umstellen: Exit " + um.status + " " + rest(um));
        const ruhe = wb(["eval", "return await window.__weltStehtNach()"], 300000);
        if (ruhe.status !== 0) throw new Error("die Welt steht nicht: Exit " + ruhe.status + " " + rest(ruhe));
        const wd = path.join(DIR, "welt.json");
        const al = wb(["albedo", "--tafel", "--datei", wd, "--ordner", path.join(DIR, "albw")]);
        if (!fs.existsSync(wd)) throw new Error("albedo --tafel ohne Messung: Exit " + al.status + " " + rest(al));
        Wm = JSON.parse(fs.readFileSync(wd, "utf8"));
        // die echte Welt nennt ihren Adapter in der Messung (werkbank geraetInfo), nicht als [linse-gpu]-Zeile
        aus.adapter = aus.adapter || (Wm.geraet ? "[echt] " + (typeof Wm.geraet === "string" ? Wm.geraet : JSON.stringify(Wm.geraet)) : null);
    } catch (e) {
        aus.fehler = "Welt: " + String((e && e.message) || e);
    }
    const lc = await labor;
    if (fs.existsSync(ld)) Lm = JSON.parse(fs.readFileSync(ld, "utf8"));
    else if (!aus.fehler) aus.fehler = "Labor ohne Messung: Exit " + lc + " " + fs.readFileSync(llog, "utf8").slice(-300);
    if (Wm && Lm) {
        const W = Wm.welt || {}, L = Lm.labor || {};
        aus.welt = { echt: Wm.echt === true, geraet: Wm.geraet || null, eichung: Wm.eichung };
        aus.labor = { echt: Lm.echt === true, geraet: Lm.geraet || null, eichung: (Lm.eichung && Lm.eichung.labor) || {}, fehler: Lm.fehler || [] };
        const k = t.karte || {};
        const ok = (y) => typeof y === "number" && Math.abs(y - k.albedo) <= k.eichRand;
        aus.eichung = {
            soll: k.albedo,
            rand: k.eichRand,
            welt: Wm.eichung,
            labor: aus.labor.eichung,
            gruen: ok(Wm.eichung) && Object.keys(aus.labor.eichung).length > 0 && Object.values(aus.labor.eichung).every(ok),
        };
        for (const z of t.zeilen) {
            const l = L[z.id] && L[z.id].Y, y = W[z.id] && W[z.id].Y;
            const e = plan.baender[z.id] || null;
            const b = e && e.slice(0, 2);
            const bandOk = !!e;
            aus.zeilen.push({
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
    aus.sek = +((Date.now() - t0) / 1000).toFixed(1);
    fs.writeFileSync(AUS, JSON.stringify(aus, null, 1));
    console.log(aus.adapter || "[linse-gpu] ungenannt");
    console.log(aus.fehler ? "ALBEDO-TAFEL ROT: " + aus.fehler : "ALBEDO-TAFEL " + aus.zeilen.length + " Zeilen beider Seiten");
    process.exit(aus.fehler ? 1 : 0);
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
const ALBEDO_TAFEL_ECHT = [
    "node",
    "-e",
    "(" + albedoTafelEcht.toString() + ")(" + JSON.stringify({ name: "material.K1", baender: BAENDER }) + ")",
    "{AUS}",
];
// EINE Probe für beide Staffeln (Zwillinge): die Welt-Seite in der Sitzung, das Labor nebenher in seinem Browser
const ALBEDO_PROBE = { sek: 33, befehl: ALBEDO_TAFEL_ECHT };
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
// kreuzt (ein Wald auf einer Seite machte das Verhältnis zum Ort).
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
    for (const d of [10, 14, 18, 22, 27, 33, 40])
        for (const s of [0, 5, -5, 10, -10]) {
            if (mitte) break;
            const m = P0.clone().addScaledVector(fwd, d).addScaledVector(quer, s);
            m.y = r._voxelSurfaceY(m.x, m.z) + R;
            if (frei(m)) mitte = m;
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
            // der Grund steht am ANFANG der Zeile der Abnahme („ABNAHME ROT [Feld …]“) — bis w4-proben-tempo zeigte die Zahl ihr Ende
            // (Luma, Stand, Gerät: GTX 24a0f3ef · 3ed95dcf · 379e5f56 „Spielgang: … Luma 51 σ 26.8“, der Täter fehlte)
            teile.push(titel + ": " + String((o && o.fehler) || (s && s.rest) || "kein Bild der Klassen in 1920 × 1080").slice(0, 220));
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
const FERNE_SITZUNG = {
    sek: 33,
    befehl: befehlDer({
        name: "ferne",
        schritte: [
            { name: "luft", args: ["licht", "--luft", "--datei", "@DIR@/luft.json"], datei: "@DIR@/luft.json" },
            { name: "genesis", args: ["umstellen", "--ort", "genesis", "--sicht", "ego"], muss: true },
            { name: "band", args: ["band", "--ort", "genesis", "--datei", "@DIR@/band.json"], datei: "@DIR@/band.json" },
        ],
    }),
};
// DIE ALBEDO-TAFEL IN DER SITZUNG (29.10.): material.K3#1 und material.K3#2 lesen EINEN Lauf (Zwillinge) — `albedo --tafel` misst
// jede Zeile der Tafel (Haus L0/L1/L2, Birke, Fichte, Fels, …) zu jeder ihrer Uhren (0,5 und 0,27), je Stufen-Zeile ein eigener Gang;
// dazu die Stufen der Art rock. Bis dahin fuhr jede Staffel dieselbe Tafel für sich, nach 10 s Ruhe an der Wanduhr.
const MATERIAL_K3_SITZUNG = {
    sek: 33,
    befehl: befehlDer({
        name: "material.K3",
        schritte: [
            { name: "ort", args: ["umstellen", "0", "0"], muss: true },
            { name: "welt", args: ["albedo", "--tafel", "--datei", "@DIR@/welt.json", "--ordner", "@DIR@/albw"], datei: "@DIR@/welt.json" },
            {
                name: "fels",
                args: [
                    "eval",
                    "const f = r._foundry, o = {}; for (const [k, v] of Object.entries((f && f.recipes) || {})) if (v && v.kind === \"rock\") o[k] = r._foundryKindStages(k); return o;",
                ],
            },
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
    args: ["licht", "--laub", "ring,feld,feld0,feld90,feld180,panorama,spiegel,spiegel180,wasser,fichte,tanne", "--karte", "--uhr", "0.5,0.27,0.05"],
    fenster: [640, 360],
    ruheMax: 600,
};
// DER DECKEL DER ARBEIT (geschätzt, ungemessen an der Karte): 24 Wege des Lichts am Dorf (je ein Seiten-Ruf), drei Ringe, Fichte und Tanne
// je Uhr an der Mess-Wiese (die Wiese kalt 9–18 s, Radeon eich3–6), je Karten-Zeile zwei Teleporte, zwei Schüsse 320×240 und vier
// Beruhigungen — 60 s; je Beruhigung und teurem Ruf eine Zeile
const LAUB_PROBE = {
    sek: 60,
    ausnahme: "33 Zeilen (11 Wege × Uhr 0,5/0,27/0,05), je Karten-Zeile zwei Teleporte, zwei Schüsse und die Beruhigung der Stufen — die Arbeit der Linse",
    befehl: PW.torBefehl(PW.werkbankLinse, JSON.stringify(LAUB_LINSE)),
};
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
        probe: { sek: 10, befehl: befehlDer({
            name: "licht.K2#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "umstellen", args: ["umstellen", "--ort", "wiese"], muss: true },
                { name: "kugel", probe: "@KOORD@/bericht/2110-messschuld2/kugel.js", blob: "3d42b5fefd53dafb551534e030bdc5c7c958e842", muss: true },
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
            const gruen = hw && gueltig && st.uhr === 0.5 && st.wetter === "sunny" && v >= 5 && v <= 12.5 && a >= 0.08 && a <= 0.2;
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
                    { name: "kugel-" + i, probe: "@KOORD@/bericht/2110-messschuld2/kugel.js", blob: "3d42b5fefd53dafb551534e030bdc5c7c958e842" },
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
                const spalte = Math.abs(st.uhr - u) <= 1e-6 && st.wetter === w;
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
                Math.abs(hs.zur.belicht / hs.weg.belicht - 1) <= 0.01 && h.stand.uhr === 0.5 && h.stand.wetter === "sunny";
            if (!hok) gruen = false;
            teile.push(
                "Himmel zur Sonne " +
                    (!h ? "ungemessen" : h.ende !== "ok" ? h.ende : h.himmelZurSonne + " (" + hs.zur.n + "/" + hs.weg.n + " px, Belichtung " + hs.zur.belicht + "/" + hs.weg.belicht + ")")
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
                .filter((x) => x.uhr === 0.5)
                // die Bänder, die die Linse zählt (luft-referenz `mindest.n` 10)
                .flatMap((x) => (x.baender || []).filter((b) => b.n >= 10).flatMap((b) => b.q || []))
                .filter((x) => x != null);
            const az = new Set(((j && j.zeilen) || []).filter((x) => x.uhr === 0.5).map((x) => x.az)).size;
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
            const r = ((j && j.zeilen) || []).filter((x) => x.uhr === 0.5 && x.rand && x.rand.C != null);
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
            const linie = (zs) => [0, 90, 180, 270].map((az) => ((zs || []).find((x) => x.uhr === 0.5 && x.az === az) || {}).kante).map((k) => (k ? k.linie : null));
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
        probe: { sek: 15, befehl: ["node", "scripts/werkbank.cjs", "licht", "--luft", "--wetter", "stormy", "--datei", "{AUS}"] },
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
        // 160×90) — der Zug selbst trägt ~125 Spiel-s (klar 5 s, je Wort ≥ 60 s); das Wort setzt die Phase am Ende zurück auf klar
        probe: { sek: 33, befehl: ["node", "scripts/werkbank.cjs", "licht", "--luft", "--wetter", "rainy", "--zug", "--datei", "{AUS}"], },
        env: { MSYS2_ARG_CONV_EXCL: "*" },
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
        // genau so wie diag-albedo-tafel neuMessen (umstellen 0 0, 10 s, albedo --tafel --datei). Gemessen wird der Stoff unter weißem
        // Umgebungslicht π, nicht das belichtete Bild. Für das Haus wird der Ton jeder Stufe gegen L0 gerechnet (`stufeVon`); für den Fels
        // werden die Stufen der Art rock abgefragt (`_foundryKindStages`): ist es nur [0], zeigt die Welt den Fels nur in L0, und die
        // Fels-Hälfte ist erfüllt (M43).
        // IN DER SITZUNG (29.10.): EIN Lauf für beide Staffeln (MATERIAL_K3_SITZUNG, Zwillinge) — `albedo --tafel` misst ohnehin jede
        // Zeile der Tafel zu jeder ihrer Uhren; die 10 s Ruhe an der Wanduhr fielen (`umstellen` endet, wenn die Welt steht)
        probe: { ...MATERIAL_K3_SITZUNG },
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
        // IN DER SITZUNG (29.10.): derselbe Lauf wie material.K3#1 (MATERIAL_K3_SITZUNG, Zwillinge)
        probe: { ...MATERIAL_K3_SITZUNG },
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
        probe: { ...ALBEDO_PROBE, mutiert: false },
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
        probe: { ...ALBEDO_PROBE, mutiert: false },
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
        probe: { sek: 33,  befehl: befehlDer({
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
    // Teleport in den Ring ~3 s, Gang 10 s, Spielgang-Bild ~6 s — der Deckel 30 s; die GPU-Fahrt nennt, ob er warm hält
    // DIE ZAHL DER GTX (379e5f56, 47 s über dem Gesetz): das Tafel-Bild allein 27,3 s (3ed95dcf 26,9 s) — je Teil-Klasse eine Aufnahme
    // zu 33 Bildern und ihre Maße (abnahme-urteil `klassenMasse` je Klasse mit dem ganzen Bild; jetzt `pass` je Schuss, Node 567 → 242 ms
    // je Klasse, Byte-gleich); der Spielgang warf an GTX und Radeon an der Abnahme des Beweisbilds (Exit 1, 24a0f3ef · 3ed95dcf · 379e5f56)
    // und kostete darum fast nichts; das Urteil las die Leinwand an `abnahme.bild`, das die Zeile der Werkbank nie trägt (jetzt das
    // Begleit-JSON). Offen beim Namen: zwei Teilungen zu je (Klassen + 4) Aufnahmen und der Gang von 8 s — über 30 s, sobald der Spielgang
    // wieder misst; die Abnahme des Spielgangs nennt die nächste Fahrt beim Namen (der Anfang der Zeile)
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
        // Lieferungen (kalt 0,15–1,0 s) — 26 s; die Eich-Fahrt der GTX richtet ihn
        probe: { sek: 26, befehl: befehlDer({
            name: "lod.K5#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "umstellen", args: ["umstellen", "--ort", "wiese"], muss: true },
                { name: "kanten", probe: "@KOORD@/bericht/2910-lod-k5/kanten.js", blob: "502a3c926930826c854b377e5c00452d4159741f", muss: true, ms: 1800000 },
            ],
        }), },
        env: envDer,
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j) => {
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
        // Arbeit: 17 Aufnahmen (GTX ≈ 0,43 s) + 8 × 24 Takte des Spiels — 22 s; die Eich-Fahrt der GTX richtet ihn.
        // DER TÄTER IM MASS (w4-proben-tempo): der Feld-Pass der Ferne trug im Schuss die Kamera des letzten Takts (`_tickFeldPass`, im
        // Takt gesetzt) — vor A die des Rigs am alten Ort, vor B die am neuen: der Horizont sprang, die Probe zählte ihn als Pop (allein
        // 1 926 Pixel je Schuss, 71 % oben). pop.js stellt den Feld-Pass auf die Kamera der Pose wie `werkbank bild`: swiftshader in
        // derselben Welt 8 226 → 1 566 Pop-Pixel (0,397 → 0,0755 %/s, jeder der acht Schritte fällt), ROT bleibt bei den Stufen-Wechseln
        probe: { sek: 22, befehl: befehlDer({
            name: "lod.K2#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "umstellen", args: ["umstellen", "--ort", "wiese", "--sicht", "ego"], muss: true },
                { name: "pop", probe: "@KOORD@/bericht/2910-lod-k5/pop.js", blob: "b5fed3ff01548fa387c674bc1c70b0247e0780f3", muss: true, ms: 1800000 },
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
            const pose = st.sicht === "first" && st.uhr === 0.5 && st.wetter === "sunny";
            const teile = [];
            let gruen = false;
            for (const n of ["lack", "glas"]) {
                const m = e.ergebnis[n] || {};
                const gueltig = m.ebene >= 2000 && m.bloecke >= 8 && m.einfallGrad >= 45 && m.einfallGrad <= 85 && !m.quer;
                if (hw && pose && gueltig && m.spiegelTreue != null && m.spiegelTreue >= 0.5) gruen = true;
                teile.push(
                    n + " spiegelTreue " + m.spiegelTreue + (gueltig ? "" : " UNGÜLTIG") + " (" + (m.fehler || m.ebene + " px in der Ebene, " + m.bloecke +
                        " Blöcke, Einfall " + m.einfallGrad + "°, Normale " + JSON.stringify(m.normale)) + ")"
                );
            }
            return {
                gruen,
                zahl: teile.join(" · ") + " · Soll ≥ 0,5 an Lack oder Scheibe · " + st.sicht + " Uhr " + st.uhr + " " + st.wetter + " · " + (j.adapter || "Adapter ungenannt"),
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
        probe: { sek: 11, befehl: befehlDer({
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
            const gruen = hw && im >= 3 && st.uhr === 0.5 && st.wetter === "sunny";
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
        // nennt die letzte die Sekunden je Uhr
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
        // IN DER SITZUNG (w4-fehlt-acht): EIN Lauf mit Staffel 2 (Zwillinge, LAUB_PROBE) — sein Befehl trägt die neun Zeilen der Staffel 1
        // (fichte, tanne, ring je Uhr), das Urteil liest nur sie
        probe: LAUB_PROBE,
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
        // jede Zeile beim Namen, die Reihe nie
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
        probe: { befehl: PW.torBefehl(PW.karteHebung), sek: 15, mutiert: false },
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
