// Stationen der Gruppe III (src/g3.js): Licht, Ferne, Material. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst sind die Kriterien mit Punkten (licht.K2, ferne.K1, ferne.K2), die Messschuld M43 (material.K3) und die Kriterien, die
// ein Zweig im Stau kippen soll (material-lack K1, material-mikro K2, material-albedo K3). Jede Station misst im Ausgabe-Bild
// auf der Karte (gpu: true, über gpu-lauf.sh); headless ist hier keine, weil keines dieser Sollwerte reine Mechanik ist.
//
// DIE FOLGE (`folge`, unten): eine Werkbank-Welt `start --port {PORT}` (die Seite einen Port darunter, ohne --echt, also headless
// am Hardware-Adapter der Weiche, wie gate:luft-tiefe:echt) fährt die Schritte der Station der Reihe nach und hält immer mit
// `stop` an. Nach {AUS} schreibt sie `{ adapter, schritte: { name: { exit, json, rest } }, dateien, fehler }`; Bilder und
// base64 fallen weg. Weil der Code der Folge im Befehl steht, gehört er zum Abdruck: ändert er sich, zählt die alte Messung nicht.
// Ein Adapter wie swiftshader, llvmpipe, lavapipe oder software ist in jedem Urteil ROT.
//
// `stationen.fehlt` enthält, was sich nicht als Station fassen lässt, mit Grund und den Teilen, die schon messbar wären. Es steht
// neben der Liste, nicht in ihr: der Läufer nimmt jeden Eintrag mit `befehl: null` als „befehl ist kein argv“ und bräche sonst
// den Lauf aller Gruppen ab.
"use strict";

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
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    const wb = (args, ms) =>
        cp.spawnSync(process.execPath, [WB, ...args, "--port", P], { encoding: "utf8", timeout: ms || 900000, maxBuffer: 1 << 28 });
    const log = path.join(DIR, "werkbank.log");
    const w = cp.spawn(process.execPath, [WB, "start", "--port", P], { stdio: ["ignore", fs.openSync(log, "w"), fs.openSync(log, "a")] });
    let code = 0;
    try {
        for (let t = 0; !/WERKBANK bereit/.test(fs.readFileSync(log, "utf8")); t += 2) {
            if (w.exitCode != null) throw new Error("die Werkbank startet nicht (Exit " + w.exitCode + "): " + fs.readFileSync(log, "utf8").slice(-300));
            if (t > 900) throw new Error("die Werkbank steht nach 900 s nicht");
            await warte(2000);
        }
        aus.adapter = (/\[linse-gpu\][^\r\n]*/.exec(fs.readFileSync(log, "utf8")) || [null])[0];
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
            const e = { exit: r.status, json: duenn(json(r.stdout)) };
            if (!e.json) e.rest = String((r.stdout || "") + (r.stderr || "")).slice(-1500);
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
        wb(["stop"], 60000);
        await warte(2000);
        if (w.exitCode == null) w.kill();
        fs.writeFileSync(AUS, JSON.stringify(aus, null, 1));
    }
    console.log(aus.adapter || "[linse-gpu] ungenannt");
    console.log(aus.fehler ? "FOLGE ROT: " + aus.fehler : "FOLGE " + plan.name + ": " + plan.schritte.length + " Schritte");
    process.exit(code);
}
const befehlDer = (plan) => ["node", "-e", "(" + folge.toString() + ")(" + JSON.stringify(plan) + ")", "{AUS}", "{KOORD}"];
// MSYS2_ARG_CONV_EXCL: gpu-lauf.sh ruft node über die Git-bash; ohne diese Variable würde msys die Pfade in den Argumenten umschreiben
const envDer = { WERKBANK_PORT: "{PORT}", MSYS2_ARG_CONV_EXCL: "*" };

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

const stationen = [
    {
        kriterium: "licht.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // Die Kugel-Bilanz aus bericht/2110-messschuld2 (licht.K2 S1, GTX, n = 3, 5,0132 / 0,1995): koordination
        // `bericht/2110-messschuld2/kugel.js` über `werkbank eval` am Messort wiese, drei Schüsse aus dem Ausgabe-Pfad bei
        // 1920×1080: A ist die Welt, B die Kugeln ohne Schatten-Empfang, C die Sonne aus.
        befehl: befehlDer({
            name: "licht.K2#1",
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "umstellen", args: ["umstellen", "--ort", "wiese"], muss: true },
                { name: "kugel", probe: "@KOORD@/bericht/2110-messschuld2/kugel.js", blob: "3d42b5fefd53dafb551534e030bdc5c7c958e842", muss: true },
            ],
        }),
        env: envDer,
        gpu: true,
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
        kriterium: "ferne.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // gate:luft-tiefe:echt mit Messung (ferne-luft e9f79deb, Beleg an d3a626ee): luftTiefe vom Hügel Genesis + 120 m,
        // 4 Azimute, Uhr 0,5 und 0,27, Urteil luftTiefeUrteil gegen spec/farbe/luft-referenz.json (Bucholtz 1995)
        befehl: ["node", "scripts/werkbank.cjs", "licht", "--luft", "--eigen", "--port", "{PORT}", "--datei", "{AUS}"],
        env: { MSYS2_ARG_CONV_EXCL: "*" },
        gpu: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(lauf.stdout) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const z = /^LUFT (GRUEN|ROT) · ([^\r\n]+)/m.exec(lauf.stdout);
            if (!z) return { gruen: false, zahl: "keine LUFT-Zeile (Exit " + lauf.exit + "): " + String(lauf.stderr || "").trim().slice(-200) };
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
        befehl: ["node", "scripts/werkbank.cjs", "licht", "--luft", "--eigen", "--port", "{PORT}", "--datei", "{AUS}"],
        env: { MSYS2_ARG_CONV_EXCL: "*" },
        gpu: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(lauf.stdout) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const z = /^LUFT (GRUEN|ROT) · ([^\r\n]+)/m.exec(lauf.stdout);
            if (!z) return { gruen: false, zahl: "keine LUFT-Zeile (Exit " + lauf.exit + "): " + String(lauf.stderr || "").trim().slice(-200) };
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
        kriterium: "material.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // material-mikro (6a6f7521, 9e124cd9; artifacts/mikro/mikro-lauf.sh + fels-lauf.sh): `werkbank bild --arm <m>` setzt die
        // Kamera <m> vor die Fläche, die der Ego-Blick trifft; klassenMasse liefert glatt (8×8-Blöcke mit σ Luma < 4) und nyquist.
        // Die Schüsse: Boden (bodenSatz) an der Mess-Wiese, Fels (formationenSatz) am höchsten Punkt einer Genesis-Formation.
        // An origin/main gibt es `--arm` noch nicht; die Station ist dort ROT („arm fehlt“).
        befehl: befehlDer({
            name: "material.K2#1",
            texte: { FELS_ZIEL },
            schritte: [
                { name: "fenster", args: ["fenster", "1920", "1080"], muss: true },
                { name: "wiese", args: ["umstellen", "--ort", "wiese", "--sicht", "ego"], muss: true },
                { name: "ein-wiese", args: ["lauf", "8", "--ein", "20"] },
                { name: "blick", args: ["eval", "r.state.pitch = -0.75; return [r.state.cameraMode, r.state.yaw, r.state.pitch]"] },
                ...ARM.map((d) => ({ name: "boden-" + d, args: ["bild", "0", "0", "0", "0", "0", "0", "--arm", d, "--wahl", "0", "--klasse", "^bodenSatz$", "--datei", "@DIR@/boden-" + d + ".png"] })),
                { name: "genesis", args: ["umstellen", "--ort", "genesis", "--sicht", "ego"], muss: true },
                { name: "ein-genesis", args: ["lauf", "10", "--ein", "30"] },
                { name: "fels-weit", args: ["eval", "globalThis.__felsR = 400; globalThis.__felsOben = 1; globalThis.__felsD = 1.5; @T:FELS_ZIEL@"], muss: true },
                { name: "fels-ort", args: ["umstellen", "@fels-weit.4@", "@fels-weit.5@", "--sicht", "ego"], muss: true },
                { name: "ein-fels", args: ["lauf", "10", "--ein", "30"] },
                ...ARM.flatMap((d) => [
                    { name: "fels-stand-" + d, args: ["eval", "globalThis.__felsR = 8; @T:FELS_ZIEL@"] },
                    { name: "ein-fels-" + d, args: ["lauf", "4", "--ein", "12"] },
                    { name: "fels-" + d, args: ["bild", "0", "0", "0", "0", "0", "0", "--arm", d, "--wahl", "0", "--klasse", "^formationenSatz$", "--datei", "@DIR@/fels-" + d + ".png"] },
                ]),
            ],
        }),
        env: envDer,
        gpu: true,
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
        befehl: befehlDer({
            name: "material.K3#1",
            schritte: [
                { name: "ort", args: ["umstellen", "0", "0"], muss: true },
                { name: "ruhe", args: ["eval", "await new Promise((x) => setTimeout(x, 10000)); return 1"] },
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
        env: envDer,
        gpu: true,
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
];

// Was sich nicht als Station fassen lässt. Steht neben der Liste; der Läufer liest es nicht.
stationen.fehlt = [
    {
        kriterium: "licht.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "kugel.js kennt nur Uhr 0,5 und klar: setTimeOfDay(0.5) und __buehne({}) sind fest eingebaut. Die Spalten Uhr 0,27/0,73 × Regen, " +
            "Sonne 10° ≥ 2,5, bedeckt ≤ 1,5 und der Himmels-Azimut ≥ 1,2 (ein senkrechtes Kugel-Paar) haben kein Werkzeug.",
        quelle: "2 = alle Spalten Uhr 0,5/0,27/0,73 × klar/Regen, beide Geräte",
    },
    {
        kriterium: "ferne.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Die Luft-Linse an origin/main (licht-linsen luftTiefe) misst weder Sonnenseite/Gegenseite noch fernes Weiß R/B bei Sonne 5°. " +
            "Der Zweig himmel-ton trägt beides (Ausgabe „Sonnenseite … fernes Weiß R/B …“, ungemergt). K1-2 je Kanal und Farbton misst sie schon: " +
            "Teil-Befehl wie ferne.K1#1, Wert = K1-2 in der LUFT-Zeile.",
        quelle:
            "2 = je Kanal (der Farbton rückt zum Himmel, Δh ≤ 10° bei 8 km), Sonnenseite/Gegenseite ≥ 1,2, bei Sonne 5° fernes Weiß R/B ≥ 1,3, Uhr 0,5 und 0,27, beide Geräte",
    },
    {
        kriterium: "ferne.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Für die waagrechte Kanten-Linie gibt es keine Struktur-Tensor-Linse am Horizont, und luftTiefe kennt keine Gipfel-Station " +
            "(nur Hügel Genesis + 120 m). „im Boden-Haushalt“ müsste dazu ein Lauf der Ratsche am selben Kopf zeigen.",
        quelle: "2 = keine waagrechte Kanten-Linie (Struktur-Tensor am Horizont), Hügel und Gipfel, im Boden-Haushalt, beide Geräte",
    },
    {
        kriterium: "material.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "„im realen Band“ hat keine externe Referenz je Klasse. spec/farbe/albedo-tafel.json führt nur die Toleranz Labor/Welt und die " +
            "Eichung 0,180; spec/abnahme/soll-tafel.json hat ein Albedo-Band nur für den Fels (0,1–0,3, PSU EARTH 103), keines für Rinde, " +
            "Laub, Boden, Haus, Lack, Tor, Haut, Fell oder Klinge. Ohne das Band wäre es genau das Schlupfloch der Karte (Labor = Welt bei " +
            "falscher Eichung). Messbar ist schon die Hälfte Welt/Labor beider Seiten echt, mit dem Teil-Befehl unten; das Urteil ist " +
            "AT.tafelUrteil frisch gegen frisch, jede Zeile imSoll, Eichung grün.",
        teil: [
            "node scripts/werkbank.cjs start --echt  ·  umstellen 0 0  ·  albedo --tafel --datei welt.json",
            "node scripts/diag-albedo-tafel.cjs --labor --echt --datei labor.json",
        ],
        quelle: "1 = alle Zeilen Welt/Labor 0,9–1,1 und im realen Band, beide Seiten --echt, an einem Gerät",
    },
    {
        kriterium: "material.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund: "wie material.K1#1, weil das reale Band je Klasse fehlt; dazu müssen beide Geräte gemessen sein und die Eichung der Karte 0,180 lesen.",
        quelle: "2 = beide Geräte, Eichung Karte 0,180",
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
    {
        kriterium: "material.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Die Albedo-Tafel hat keine Stufen-Zeilen für Birke, Fichte und Karte und keine Spalte für Uhr 0,27; dazu sind hochhaus und " +
            "volle_moderne (L1 ≠ L0) offen (material.K3 beleg).",
        quelle: "2 = Haus, Birke, Fichte, Fels, L0/L1/L2/Karte, Uhr 0,5 und 0,27, beide Geräte",
    },
];

module.exports = stationen;
