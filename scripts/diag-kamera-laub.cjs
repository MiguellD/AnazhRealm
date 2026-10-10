// diag-kamera-laub.cjs — DIE KAMERA STECKT NIE IN LAUB, STRAUCH ODER FELS (Leben-Schau 2, 09.10., Befund §6 #5, V1-Lücke
// „laufen und sehen"). Befund: in allen drei Spuren füllte Laub, Strauch oder Ast das Bild (A 12 · 27 · 44–47,
// B 24 · 28 · 31 · 35 · 53, C 12) — zu Fuß in der Eichenkrone ein Loch um die Figur, im Ritt Weidenstränge und Fichtenäste
// vor der Linse, im Ich-Auge ein Strauch vor dem Gesicht; durchsichtig wurde nur, was im Rohr um den Sicht-Strahl lag.
//
// Die Linse fährt die echte Welt (headless, Foundry an, Null-Renderer) an die Orte der Schau — die Ankunft (A 27), das Ufer
// mit dem Eichenhain des Satzes (−872/−1127, A 41–47) und den 30°-Hang (−744/−1356, B 28–31, C 05–12) — und stellt dort an
// jeder nahen Pflanze den Spieler in acht Richtungen auf: zu Fuß in 3rd, im Ritt (der GT, die Verfolger-Kamera des Kerns)
// und im Ich-Auge. Je Stellung misst sie die NAH-DECKUNG (scripts/lib/kamera-nah.cjs): den Anteil des Schirms, den eine
// Fläche näher am Auge deckt als der Nah-Radius der Stellung — 3rd 2,0 m, Ritt 3,0 m (beide höchstens bis einen Saum vor
// das Ziel: der Stamm vor dem Spieler bleibt), Ich-Auge 0,8 m (nur Laub: der Leib steht an der Rinde) — mit dem Täter beim
// Namen (Laub · Rinde · Fels · Wagen und das Werk). Urteil: keine Stellung über NAH_DECKUNG_MAX. Die Radien stehen fest in
// der Linse (Vorher und Nachher unter derselben Bedingung).
//
// DER EINGESCHMUGGELTE TÄTER (in derselben Welt, nach der Messung): ein Laub-Stoff ohne Durchsicht und ein Fels vor der
// Linse — die Linse muss beide beim Namen nennen, sonst ist sie vakuös. `--selftest` (ohne Welt): das Urteil über
// synthetische Messungen nennt jeden Täter, die statische Wand fällt am Vor-Stand.
//
//   node scripts/diag-kamera-laub.cjs [--selftest]        Port: KAMERA_LAUB_PORT (Standard 4611)
//   KAMERA_LAUB_STAMM=<datei>                              ein anderer Stamm (anazhRealm.js) — das Vorher eines A/B
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { KAMERA_NAH_INSTALL } = require("./lib/kamera-nah.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
// DAS BILD-PAAR am echten Renderer: `--bilder <ordner> --seite http://localhost:<port>` (der save-server des Arbeitsbaums)
const BILDER = opt("--bilder", null);
const SEITE = opt("--seite", null);

const PORT = Number(process.env.KAMERA_LAUB_PORT || 4611);
const STAMM = process.env.KAMERA_LAUB_STAMM ? path.resolve(process.env.KAMERA_LAUB_STAMM) : null;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
// Die Nah-Radien der Messung (m) — fest in der Linse, damit Vorher und Nachher unter derselben Bedingung stehen.
const RADIUS = Object.freeze({ third: 2.0, ritt: 3.0, first: 0.8 });
const SAUM = 0.6; // der Saum der Durchsicht (KAMERA_DURCHSICHT.saumM): in 3rd endet die Nah-Kugel samt Saum vor dem Ziel
// Höchste Nah-Deckung einer Stellung (Anteil des Schirms).
const NAH_DECKUNG_MAX = 0.02;
// Die Orte der Schau (Befund §2): die Ankunft, das Ufer mit dem Hain des Satzes, die Lichtung der Herde (8a) und der
// 30°-Hang (2c, 8b/8c — dort steht nur Streu: Gestrüpp, Geröll, Stumpf).
const ORTE = [
    { id: "ankunft", bild: "A 27", x: null, z: null },
    { id: "ufer", bild: "A 41–47", x: -872, z: -1127, satz: "pflanz mir einen eichenhain am wasser", satzWerk: "baum_eiche" },
    { id: "lichtung", bild: "C 01–04", x: -789, z: -1331 },
    { id: "hang", bild: "B 28–31, C 05–12", x: -744, z: -1356 },
];
const MODI = ["third", "ritt", "first"];

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const pct = (x) => (x == null ? "—" : `${(100 * x).toFixed(1)} %`);

// ── DAS URTEIL (pure Funktion; Welt UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
function urteil(m) {
    if (!m || !m.orte) return ["keine Messung"];
    const out = [];
    for (const ort of ORTE) {
        const o = m.orte[ort.id];
        if (!o) {
            out.push(`${ort.id}: nicht gemessen (Vorbedingung)`);
            continue;
        }
        if (o.err) {
            out.push(`${ort.id}: Ausnahme (${String(o.err).split("\n")[0]})`);
            continue;
        }
        for (const modus of MODI) {
            const z = (o.modi || {})[modus];
            if (!z || !(z.n > 0)) {
                out.push(`${ort.id} ${modus}: keine Stellung (Vorbedingung${z && z.grund ? `: ${z.grund}` : ""})`);
                continue;
            }
            if (z.max > NAH_DECKUNG_MAX) {
                const t = Object.entries((z.schlimmste && z.schlimmste.taeter) || {})
                    .map(([k, v]) => `${k} ${pct(v)}`)
                    .join(", ");
                out.push(`${ort.id} ${modus}: Deckung im Freiraum bis ${pct(z.max)} (Mittel ${pct(z.mittel)}; ${t || "ohne Namen"})`);
            }
            if (z.fremd) out.push(`${ort.id} ${modus}: ein Pflanzen-Stoff trägt eine fremde Maske (nicht der Knoten seiner Art)`);
        }
    }
    const s = m.schmuggel;
    if (!s) out.push("Schmuggel: nicht gelaufen (Vorbedingung)");
    else {
        if (!(s.laub && s.laub.max > NAH_DECKUNG_MAX && Object.keys(s.laub.taeter || {}).some((k) => /^Laub /.test(k))))
            out.push(`Schmuggel: ein Laub-Stoff ohne Durchsicht bleibt ungenannt (${JSON.stringify(s.laub || null)})`);
        if (!(s.fels && s.fels.max > NAH_DECKUNG_MAX && Object.keys(s.fels.taeter || {}).some((k) => /Formation/.test(k))))
            out.push(`Schmuggel: ein Fels vor der Linse bleibt ungenannt (${JSON.stringify(s.fels || null)})`);
    }
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei): die Proben durch die Bildmitte treffen nur, was das Bild zeigt ──
function ohneKommentare(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index + m[0].length - 1);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}
function wand(quelle) {
    const nc = ohneKommentare(quelle);
    const pick = fnBody(nc, /\n {4}_pickArchitectureAtCrosshair\(\) \{/) || "";
    const streu = fnBody(nc, /\n {4}_pickScatterAtCrosshair\(\) \{/) || "";
    return [
        [
            "W1 der Bau-Pick und der Streu-Pick treffen nur, was das Bild zeigt (`_durchsichtSteht` je Treffer)",
            /this\._durchsichtSteht\(/.test(pick) && /this\._durchsichtSteht\(/.test(streu),
        ],
    ];
}

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = STAMM && p === "/anazhRealm.js" ? STAMM : path.join(root, p);
    if (!STAMM && !fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// ── DIE PROBE IN DER SEITE (r = die Welt) ──
async function probe(arg) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const dl0 = performance.now() + 90000;
    while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0) await sleep(100);
    const r = window.anazhRealm;
    const st = r.state;
    const nahDeckung = window.__nahDeckung;
    // Bild-Paare: der Spiel-Loop ruht (die Probe taktet selbst), die Tiere halten still
    if (arg.bilder) {
        r.state.renderer.setAnimationLoop(null);
        if (window.__tiereHalten) window.__tiereHalten();
    }
    const tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(ms || 30);
        }
    };
    const out = { orte: {}, zeiten: {} };
    const t0 = performance.now();
    await r._foundryAwaitBook(45000);
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    // die Welt wächst, bis ihr Bild steht (`_weltbildFehlt` leer)
    const steht = async (ms) => {
        const dl = performance.now() + ms;
        let n = 0;
        while (performance.now() < dl) {
            await tick(5, 40);
            n++;
            if (n >= 4 && !r._weltbildFehlt().length) break;
        }
        return r._weltbildFehlt();
    };
    await steht(90000);
    out.zeiten.boot = Math.round(performance.now() - t0);
    let T = 1000;
    const ruhig = () => {
        for (let i = 0; i < 10; i++) r._loopCamera((T += 0.1));
    };
    // DIE ANKER: die Stämme der Mesh-Zone (Rinde-Instanzen jeder Quelle: gesetzte und gestreute Bäume, Büsche) und die
    // belaubten Pflanzen der Nah-Streu (Gestrüpp, Farn — der Strauch vor dem Ich-Auge, C 12)
    const v = new THREE.Vector3();
    const m4 = new THREE.Matrix4();
    const streuLaub = () => {
        const out2 = [];
        const ns = st.nahStreu;
        if (!ns) return out2;
        for (const a of ns.senken.values()) {
            const k = a.mat && a.mat.userData ? a.mat.userData.foundryKind : null;
            if (k !== "foliage" && k !== "foliageTex") continue;
            for (const b of a.bloecke.values())
                for (let i = 0; i < b.n; i++) {
                    m4.fromArray(b.matrizen, i * 16);
                    v.setFromMatrixPosition(m4);
                    out2.push({ x: v.x, z: v.z, werk: "Streu " + a.preset, e: null });
                }
        }
        return out2;
    };
    const staemme = () => {
        const out2 = [];
        st.scene.traverseVisible((o) => {
            if (!o.isInstancedMesh || !o.userData || !o.userData.archInstanceKey) return;
            const k = o.material && o.material.userData ? o.material.userData.foundryKind : null;
            if (k !== "bark" && k !== "stem") return;
            const g = st.archInstanceGroups ? st.archInstanceGroups.get(o.userData.archInstanceKey) : null;
            for (let i = 0; i < o.count; i++) {
                m4.fromArray(o.instanceMatrix.array, i * 16);
                if (Math.abs(m4.determinant()) < 1e-12) continue;
                m4.premultiply(o.matrixWorld);
                v.setFromMatrixPosition(m4);
                const e = g && g.slotEntry ? g.slotEntry[i] : null;
                out2.push({ x: v.x, z: v.z, werk: (e && e.type) || "Streu", e });
            }
        });
        return out2;
    };
    // der Spieler steht nie in einem Stamm (die Physik hält ihn davor): eine Stellung, deren Fuß in einem festen Blocker steht,
    // fällt
    const imBlocker = (x, z) => {
        for (const a of st.architectures || [])
            if (a && a.blockerAABBs && a.position && Math.abs(a.position.x - x) < 20 && Math.abs(a.position.z - z) < 20)
                for (const b of a.blockerAABBs) if (x > b.minX - 0.3 && x < b.maxX + 0.3 && z > b.minZ - 0.3 && z < b.maxZ + 0.3) return true;
        return false;
    };
    // ── DER EINGESCHMUGGELTE TÄTER (am ersten Ort mit Laub in der Nah-Kugel, an der Stellung mit den meisten Täter-Flächen):
    // einmal jeder Laub-Stoff der Szene ohne Durchsicht, einmal ein Fels (eine Formation) 1 m vor der Linse — die Linse muss
    // beide beim Namen nennen ──
    const schmuggle = (sl) => {
        const s = { stellung: sl };
        try {
            const tS = performance.now();
            r.setCameraMode("third");
            const stelle = () => {
                st.playerMesh.position.set(sl.x, hh(sl.x, sl.z) + 1.0, sl.z);
                st.yaw = sl.gier;
                st.pitch = sl.pitch;
                ruhig();
            };
            // (1) die Laub-Stoffe der Szene ohne Durchsicht
            const laub = new Map();
            st.scene.traverse((o) => {
                const mt = o && o.material;
                const k = mt && mt.userData ? mt.userData.foundryKind : null;
                if ((k === "foliage" || k === "foliageTex") && mt.maskNode) laub.set(mt, mt.maskNode);
            });
            for (const mt of laub.keys()) mt.maskNode = null;
            stelle();
            s.laub = nahDeckung({ radien: sl.radien, gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null });
            s.laub.max = s.laub.deckung;
            for (const [mt, kn] of laub) mt.maskNode = kn;
            // (2) ein Fels 1 m vor der Linse (eine Formation ohne Durchsicht)
            stelle();
            const c = st.camera.position;
            const f = st.camera.getWorldDirection(new THREE.Vector3());
            const fels = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial());
            fels.name = "formationenSatz";
            fels.position.set(c.x + f.x, c.y + f.y, c.z + f.z);
            st.scene.add(fels);
            fels.updateMatrixWorld(true);
            s.fels = nahDeckung({ radien: sl.radien, gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null, neu: true });
            s.fels.max = s.fels.deckung;
            st.scene.remove(fels);
            fels.geometry.dispose();
            window.__nahSpeicher = null; // der Fels liegt im Speicher: die nächste Stellung rechnet ihn neu
            s.ms = Math.round(performance.now() - tS);
        } catch (e) {
            s.err = (e && e.stack) || String(e);
        }
        return s;
    };
    let gt = null;
    let speicherOrt = null;
    // DIE RADIEN je Sicht (die Täter-Klassen mit ihrem Radius um das Auge): in 3rd und im Ritt fallen Laub und Rinde im
    // FREIRAUM der Kamera (bis einen Saum vor die Ebene des Ziels), die Boden-Streu, Fels und der eigene Wagen in der Nähe der
    // Linse (3rd 2,0 m, Ritt 3,0 m); im Ich-Auge Laub und Boden-Streu bis 0,8 m (die Rinde, an der der Leib steht, bleibt)
    const radienFuer = (modus) => {
        if (modus === "first") return { Laub: arg.radius.first, Streu: arg.radius.first };
        const kz = st._kamZiel;
        const frei = kz ? Math.max(0, Math.hypot(kz.x - kz.ex, kz.y - kz.ey, kz.z - kz.ez) - arg.saum) : 0;
        const nah = Math.min(arg.radius[modus], frei);
        return { Laub: frei, Rinde: frei, Streu: nah, Fels: nah, Wagen: nah };
    };
    // ── DAS BILD-PAAR (`--bilder`, echte GPU): an der schlimmsten Stellung des Vorher dieselbe Welt zweimal aus dem
    // Ausgabe-Pfad (scripts/lib/ausgabe-aufnahme.cjs, Bühne Mittag · Sonne · Sommer) — vorher mit der Nah-Kugel aus (die
    // Formel des Vor-Stands), nachher wie im Spiel; dazu die Nah-Deckung beider ──
    const schuss = async (modus, stelle, sl) => {
        const res = { stellung: sl };
        if (!sl || !arg.bilder) return res;
        const lu = st.lodUniforms;
        for (const phase of ["vorher", "nachher"]) {
            stelle(sl.x, hh(sl.x, sl.z), sl.z, sl.gier);
            st.pitch = sl.pitch;
            ruhig();
            window.__buehne();
            if (phase === "vorher" && lu && lu.uKamNah) lu.uKamNah.value.set(-arg.saum, -arg.saum, -arg.saum);
            const d = nahDeckung({ radien: radienFuer(modus), gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null });
            const W = arg.bilder.w;
            const H = arg.bilder.h;
            const auf = await window.__ausgabeAufnahme(W, H, 1);
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(W, H);
            img.data.set(auf.u8.subarray(0, W * H * 4));
            ctx.putImageData(img, 0, 0);
            res[phase] = { deckung: d.deckung, taeter: d.taeter, dc: auf.info.drawCalls, dreiecke: auf.info.triangles, png: cv.toDataURL("image/png") };
        }
        return res;
    };
    for (const ort of arg.orte) {
        const tO = performance.now();
        const z = (out.orte[ort.id] = { bild: ort.bild, modi: {} });
        try {
            if (ort.x != null) {
                st.playerMesh.position.set(ort.x, r._voxelSurfaceY(ort.x, ort.z) + 1.8, ort.z);
                z.fehlt = await steht(45000);
            }
            z.ms = { boden: Math.round(performance.now() - tO) };
            const P = st.playerMesh.position.clone();
            // der Orts-Speicher der Linse (scripts/lib/kamera-nah.cjs): die Region um den Ort, neu je Ort
            speicherOrt = { id: ort.id, x: P.x, z: P.z, r: 60 };
            window.__nahSpeicher = null;
            // die Stämme des Orts wachsen nach dem Boden (Buch → Bäcker → Instanz): gewartet wird, bis ihre Zahl ruht
            {
                const dlS = performance.now() + 30000;
                let vorN = -1;
                let ruhe = 0;
                while (performance.now() < dlS && ruhe < 4) {
                    await tick(5, 40);
                    const n = staemme().filter((s2) => Math.hypot(s2.x - P.x, s2.z - P.z) < 25).length;
                    ruhe = n === vorN ? ruhe + 1 : 0;
                    vorN = n;
                }
                z.staemme = vorN;
                z.ms.staemme = Math.round(performance.now() - tO);
            }
            z.P = [+P.x.toFixed(1), +P.z.toFixed(1)];
            let hain = [];
            if (ort.satz) {
                const vor = new Set(st.architectures);
                r.processChatCommand(ort.satz);
                await steht(30000);
                hain = st.architectures.filter((a) => a && !vor.has(a) && a.type === ort.satzWerk);
                z.satz = hain.map((a) => a.type);
                z.ms.satz = Math.round(performance.now() - tO);
            }
            // die nahen Stämme (der Hain des Satzes zuerst) und Sträucher der Streu, je 1,5 m einer
            const anker = [];
            const nimm = (s, max) => {
                if (anker.length >= max) return;
                if (anker.some((a) => Math.hypot(a.x - s.x, a.z - s.z) < 1.5)) return;
                anker.push(s);
            };
            const nach = (a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z);
            const alle = staemme().filter((s2) => Math.hypot(s2.x - P.x, s2.z - P.z) < 40);
            for (const s of alle.filter((s2) => s2.e && hain.includes(s2.e))) nimm(s, arg.jeOrt);
            for (const s of alle.sort(nach)) nimm(s, arg.jeOrt);
            const grenzeStreu = anker.length + Math.max(arg.jeStreu, arg.jeOrt - anker.length);
            for (const s of streuLaub()
                .filter((s2) => Math.hypot(s2.x - P.x, s2.z - P.z) < 25)
                .sort(nach)) nimm(s, grenzeStreu);
            z.anker = anker.map((a) => `${a.werk}@${a.x.toFixed(0)}/${a.z.toFixed(0)}`);
            const messe = (modus, stelle, abstand, gieren, nicken) => {
                const m = { n: 0, max: 0, summe: 0, jeKlasse: {}, taeter: {}, schlimmste: null, dichteste: null };
                let dicht = -1;
                for (const a of anker)
                    for (let k = 0; k < 8; k++) {
                        const g = (k / 8) * Math.PI * 2;
                        // aus dem Stamm hinaus (der Leib steht nie in seinem Blocker): je 0,25 m, bis der Fuß frei steht
                        let ab = abstand;
                        while (ab < abstand + 3 && imBlocker(a.x + Math.sin(g) * ab, a.z + Math.cos(g) * ab)) ab += 0.25;
                        const x = a.x + Math.sin(g) * ab;
                        const zz = a.z + Math.cos(g) * ab;
                        const y = hh(x, zz);
                        if (!Number.isFinite(y)) continue;
                        for (const dg of gieren)
                            for (const pitch of nicken) {
                                stelle(x, y, zz, g + dg);
                                st.pitch = pitch;
                                ruhig();
                                // das Vorher in derselben Welt (Bild-Paare): die Nah-Kugel aus, die Formel des Vor-Stands
                                if (arg.nahAus && st.lodUniforms && st.lodUniforms.uKamNah) st.lodUniforms.uKamNah.value.set(-arg.saum, -arg.saum, -arg.saum);
                                const radien = radienFuer(modus);
                                if (!(Math.max(...Object.values(radien)) > 0)) continue;
                                const d = nahDeckung({ radien, gw: arg.gw, gh: arg.gh, ort: speicherOrt, dyn: gt ? gt.id : null });
                                m.n++;
                                m.summe += d.deckung;
                                for (const [kk, vv] of Object.entries(d.jeKlasse)) m.jeKlasse[kk] = +((m.jeKlasse[kk] || 0) + vv).toFixed(4);
                                for (const [kk, vv] of Object.entries(d.taeter)) m.taeter[kk] = +((m.taeter[kk] || 0) + vv).toFixed(4);
                                if (d.fremd) m.fremd = true;
                                const stellung = { anker: a.werk, x: +x.toFixed(3), z: +zz.toFixed(3), gier: +(g + dg).toFixed(4), pitch, auge: d.auge, radien, taeter: d.taeter };
                                if (d.deckung > m.max) {
                                    m.max = d.deckung;
                                    m.schlimmste = stellung;
                                }
                                // die Stellung mit den meisten Täter-Flächen in der Nah-Kugel (dort schmuggelt die Linse)
                                if (d.taeterDreiecke > dicht) {
                                    dicht = d.taeterDreiecke;
                                    m.dichteste = Object.assign({ dreiecke: d.taeterDreiecke }, stellung);
                                }
                            }
                    }
                m.mittel = m.n ? +(m.summe / m.n).toFixed(4) : null;
                delete m.summe;
                m.max = +m.max.toFixed(4);
                return m;
            };
            const fuss = (x, y, zz, gier) => {
                st.playerMesh.position.set(x, y + 1.0, zz);
                st.yaw = gier;
            };
            // ZU FUSS (3rd): der Spieler 1,5 m vor dem Stamm, der Blick von ihm weg (die Kamera in der Krone) und quer;
            // Neigung 0 und −0,35 (die Kamera hoch über der Figur)
            r.setCameraMode("third");
            z.modi.third = messe("third", fuss, 1.5, [0, Math.PI / 2], [0, -0.35]);
            if (arg.bilder) (z.bilder = z.bilder || {}).third = await schuss("third", fuss, z.modi.third.schlimmste);
            if (!arg.bilder && !out.schmuggel && z.modi.third.dichteste && z.modi.third.dichteste.dreiecke > 0) out.schmuggel = schmuggle(z.modi.third.dichteste);
            // DAS ICH-AUGE: der Spieler 0,9 m vor dem Stamm, der Blick zu ihm und von ihm weg, geradeaus und gehoben
            r.setCameraMode("first");
            z.modi.first = messe("first", fuss, 0.9, [0, Math.PI], [0, 0.3]);
            if (arg.bilder) (z.bilder = z.bilder || {}).first = await schuss("first", fuss, z.modi.first.schlimmste);
            r.setCameraMode("third");
            // DER RITT: ein GT, aufgesessen, 3 m vor dem Stamm (die Verfolger-Kamera des Kerns hinter ihm)
            if (!gt) {
                gt = r.spawnArchitecture("fahrzeug_gt", { x: P.x + 30, y: hh(P.x + 30, P.z) + 0.5, z: P.z }, { silent: true, precise: true });
                const dlG = performance.now() + 45000;
                while (gt && !gt.instanced && !gt.mesh && performance.now() < dlG) {
                    r._rebuildArchitectureMesh(gt);
                    if (gt.instanced || gt.mesh) break;
                    await sleep(200);
                }
            }
            const mr = gt ? r.mountArchitecture(gt) : null;
            if (mr && mr.ok) {
                const rittStelle = (x, y, zz, gier) => {
                        gt.position.x = x;
                        gt.position.y = y + 0.5;
                        gt.position.z = zz;
                        gt.rotationY = gier - Math.PI / 2;
                        gt._rideYaw = gier;
                        gt._kamYaw = gier;
                        st.yaw = gier;
                        st.playerMesh.position.set(x, y + 1.0, zz);
                        // der Wagen steht im Bild, wo er steht (Instanz-Matrizen bzw. Mesh)
                        if (gt.instanced && typeof r._archInstanceUpdate === "function") r._archInstanceUpdate(gt);
                        if (gt.mesh) {
                            gt.mesh.position.set(x, y + 0.5, zz);
                            gt.mesh.rotation.y = gt.rotationY;
                            gt.mesh.updateMatrixWorld(true);
                        }
                    };
                z.modi.ritt = messe("ritt", rittStelle, 3.0, [0, Math.PI / 2], [0]);
                if (arg.bilder) (z.bilder = z.bilder || {}).ritt = await schuss("ritt", rittStelle, z.modi.ritt.schlimmste);
                r.dismountArchitecture();
            } else z.modi.ritt = { n: 0, grund: gt ? "Aufsitzen scheiterte" : "kein GT" };
        } catch (e) {
            z.err = (e && e.stack) || String(e);
        }
        out.zeiten[ort.id] = Math.round(performance.now() - tO);
    }
    if (gt) r.removeArchitecture(gt);
    return out;
}

(async () => {
    const quelle = fs.readFileSync(STAMM || path.join(root, "anazhRealm.js"), "utf8");
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST (ohne Welt) ===");
        const ort = (max, taeter) => ({
            modi: Object.fromEntries(MODI.map((k) => [k, { n: 64, max, mittel: max / 4, schlimmste: { taeter } }])),
        });
        const gesund = {
            orte: { ankunft: ort(0, {}), ufer: ort(0.004, {}), hang: ort(0, {}) },
            schmuggel: { laub: { max: 0.4, taeter: { "Laub baum_eiche": 0.4 } }, fels: { max: 0.3, taeter: { "Fels Formation": 0.3 } } },
        };
        check("Selbst-Test: gesund == 0 Täter", urteil(gesund).length === 0, urteil(gesund).join(" · "));
        const brueche = [
            ["Eichenkrone vor der Linse (Befund A 44)", { orte: Object.assign({}, gesund.orte, { ufer: ort(0.437, { "Laub baum_eiche": 0.43 }) }) }, "ufer third: Deckung im Freiraum bis 43.7 %"],
            ["Strauch vor dem Ich-Auge (Befund C 12)", { orte: Object.assign({}, gesund.orte, { hang: ort(0.99, { "Laub Streu": 0.99 }) }) }, "hang third: Deckung im Freiraum bis 99.0 %"],
            ["kein GT", { orte: Object.assign({}, gesund.orte, { ankunft: { modi: { third: { n: 4, max: 0 }, first: { n: 4, max: 0 }, ritt: { n: 0, grund: "kein GT" } } } }) }, "ankunft ritt: keine Stellung"],
            ["fremde Maske", { orte: Object.assign({}, gesund.orte, { hang: { modi: { third: { n: 4, max: 0, fremd: true }, first: { n: 4, max: 0 }, ritt: { n: 4, max: 0 } } } }) }, "hang third: ein Pflanzen-Stoff trägt eine fremde Maske"],
            ["Linse blind für Laub", { schmuggel: { laub: { max: 0, taeter: {} }, fels: gesund.schmuggel.fels } }, "Schmuggel: ein Laub-Stoff ohne Durchsicht bleibt ungenannt"],
            ["Linse blind für Fels", { schmuggel: { laub: gesund.schmuggel.laub, fels: { max: 0, taeter: {} } } }, "Schmuggel: ein Fels vor der Linse bleibt ungenannt"],
            ["ein Ort fehlt", { orte: { ankunft: gesund.orte.ankunft, ufer: gesund.orte.ufer } }, "hang: nicht gemessen"],
        ];
        for (const [name, bruch, soll] of brueche) {
            const v = urteil(Object.assign({}, gesund, bruch));
            check(`Selbst-Test: ‚${name}' → die Linse nennt „${soll}"`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const gruen = wand(quelle);
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const vorStand = quelle.replace(/this\._durchsichtSteht\([^)]*\)/g, "true");
        const rot = wand(vorStand);
        check("Selbst-Test W: der Vor-Stand (die Picks ohne Durchsicht) → W1 feuert", rot.every((w) => !w[1]), rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" "));
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Kamera-Laub-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    if (BILDER) return bildPaare();

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand(quelle)) check(name, ok, detail);

    const t0 = Date.now();
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(KAMERA_NAH_INSTALL);
    const m = await page.evaluate(probe, { orte: process.env.KAMERA_LAUB_NUR ? ORTE.filter((o) => process.env.KAMERA_LAUB_NUR.split(",").includes(o.id)) : ORTE, radius: RADIUS, saum: SAUM, jeOrt: 5, jeStreu: 2, gw: 48, gh: 27 });
    await browser.close();
    server.close();
    if (process.env.KAMERA_LAUB_JSON) fs.writeFileSync(process.env.KAMERA_LAUB_JSON, JSON.stringify(m, null, 1));

    console.log(`=== DIE DECKUNG IM FREIRAUM DER KAMERA JE ORT UND SICHT (3rd/Ritt: Laub und Rinde bis vor die Ebene des Ziels, Streu · Fels · Wagen bis ${RADIUS.third}/${RADIUS.ritt} m; Ich: Laub und Streu bis ${RADIUS.first} m) ===`);
    for (const ort of ORTE) {
        const o = m.orte[ort.id] || {};
        console.log(`  ${ort.id} (${ort.bild}) bei ${(o.P || []).join("/")} · Anker ${(o.anker || []).join(", ")}${o.satz ? ` · Satz: ${o.satz.length} Werke` : ""}`);
        for (const modus of MODI) {
            const z = (o.modi || {})[modus] || {};
            const kl = Object.entries(z.jeKlasse || {})
                .map(([k, v]) => `${k} ${pct(v / Math.max(1, z.n))}`)
                .join(", ");
            console.log(`    ${modus.padEnd(5)} ${String(z.n || 0).padStart(3)} Stellungen · Mittel ${pct(z.mittel)} · max ${pct(z.max)}${kl ? ` · je Klasse (Mittel) ${kl}` : ""}${z.schlimmste && z.max > 0 ? ` · schlimmste ${z.schlimmste.anker} (${z.schlimmste.x}/${z.schlimmste.z}): ${Object.entries(z.schlimmste.taeter || {}).map(([k, v]) => `${k} ${pct(v)}`).join(", ")}` : ""}`);
        }
    }
    const s = m.schmuggel || {};
    console.log(`  Schmuggel: Laub ohne Durchsicht → ${pct(s.laub && s.laub.max)} (${Object.keys((s.laub && s.laub.taeter) || {}).join(", ")}) · Fels vor der Linse → ${pct(s.fels && s.fels.max)} (${Object.keys((s.fels && s.fels.taeter) || {}).join(", ")})`);
    console.log(`  Zeiten (ms): ${JSON.stringify(m.zeiten)} · Lauf ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    const v = urteil(m);
    check("K1 keine Stellung mit Laub, Strauch, Ast oder Fels vor der Linse (Deckung im Freiraum ≤ 2 %), die Linse nennt den eingeschmuggelten Täter", v.length === 0, v.length ? "Täter: " + v.join(" · ") : "");
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — die Kamera steckt nie in Laub, Strauch oder Fels.");
    process.exit(0);
})().catch((e) => {
    console.error("Kamera-Laub-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

// ── DIE BILD-PAARE am echten Renderer (Fenster, Hardware-Adapter) — das Ufer mit dem Hain (A 41–47) und der Hang (B 28–31,
// C 05–12), je Sicht die schlimmste Stellung des Vorher ──
async function bildPaare() {
    const { echteWebGpuArgs } = require("./lib/software-gpu.cjs");
    if (!SEITE) throw new Error("--bilder braucht --seite http://localhost:<port> (der save-server des Arbeitsbaums)");
    fs.mkdirSync(BILDER, { recursive: true });
    const profil = path.join(require("os").tmpdir(), `kamera-laub-profil-${Date.now()}`);
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: profil,
        protocolTimeout: 3600000,
        defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
        args: [...echteWebGpuArgs(), "--window-size=1300,860"],
    });
    try {
        const page = await browser.newPage();
        const fehler = [];
        page.on("pageerror", (e) => fehler.push((e.message || String(e)).split("\n")[0]));
        page.on("console", (m) => {
            if (m.type() === "error" && /WebGPU|GPUValidation|Invalid/.test(m.text())) fehler.push("[konsole] " + m.text().slice(0, 200));
        });
        await page.goto(`${SEITE.replace(/\/$/, "")}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(KAMERA_NAH_INSTALL);
        const nur = (process.env.KAMERA_LAUB_NUR || "ufer,hang").split(",");
        const m = await page.evaluate(probe, { orte: ORTE.filter((o) => nur.includes(o.id)), radius: RADIUS, saum: SAUM, jeOrt: 5, jeStreu: 2, gw: 48, gh: 27, nahAus: true, bilder: { w: 1280, h: 720 } });
        console.log(`=== DIE BILD-PAARE (echte GPU, Ausgabe-Pfad) → ${BILDER} ===`);
        for (const [id, o] of Object.entries(m.orte)) {
            if (o.err) console.log(`  ${id}: Ausnahme ${String(o.err).split("\n")[0]}`);
            for (const [modus, b] of Object.entries(o.bilder || {})) {
                for (const phase of ["vorher", "nachher"]) {
                    const z = b[phase];
                    if (!z) continue;
                    const datei = path.join(BILDER, `${id}-${modus}-${phase}.png`);
                    fs.writeFileSync(datei, Buffer.from(z.png.split(",")[1], "base64"));
                    delete z.png;
                }
                const sl = b.stellung || {};
                console.log(
                    `  ${id} ${modus.padEnd(5)} (${sl.x}/${sl.z}, Gier ${sl.gier}, Neigung ${sl.pitch}, Freiraum ${sl.radien ? (sl.radien.Rinde || sl.radien.Laub || 0).toFixed(1) : "?"} m): ` +
                        `vorher ${pct(b.vorher && b.vorher.deckung)} (${Object.entries((b.vorher && b.vorher.taeter) || {}).map(([k, v]) => `${k} ${pct(v)}`).join(", ")}) → ` +
                        `nachher ${pct(b.nachher && b.nachher.deckung)} · Befehle ${b.vorher && b.vorher.dc}/${b.nachher && b.nachher.dc}`
                );
            }
        }
        fs.writeFileSync(path.join(BILDER, "messung.json"), JSON.stringify(m, null, 1));
        if (fehler.length) console.log(`  Seiten-Fehler: ${fehler.length} (${fehler.slice(0, 3).join(" | ")})`);
    } finally {
        await browser.close();
        try {
            fs.rmSync(profil, { recursive: true, force: true });
        } catch (_e) {}
    }
    process.exit(0);
}
