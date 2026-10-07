#!/usr/bin/env node
// diag-albedo-tafel.cjs — DIE ALBEDO-WAND LABOR ↔ WELT (S1 W1e): die Tafel spec/farbe/albedo-tafel.json, ihre Ratsche und
// ihre Labor-Seite (Rechnung, Begriffe, Werkzeuge: scripts/lib/albedo-tafel.cjs).
//
//   node scripts/diag-albedo-tafel.cjs                 (npm run gate:albedo-tafel, GPU-frei) die Tafel trägt Schema und
//        Messung: jede der acht Klassen eine Zeile, jede Zeile Labor-Y, Welt-Y, Verhältnis und Ratsche, jedes Studio
//        seine Karte; das gespeicherte Ist liegt in seiner Ratsche; Soll-Stand (n von N im Rand) steht in der Ausgabe
//   node scripts/diag-albedo-tafel.cjs --selftest      die Rechnung feuert: ein Verhältnis über der Ratsche, eine falsche
//        Eichung, eine stumme Seite, eine Tafel ohne Klasse werden ROT; der Nachzug senkt und hebt nie — und im echten
//        r128-Labor (Chrome, die Linse aus der Bibliothek) liest die 18-%-Karte 0,180, ein roh gelesenes Hex (der alte
//        Defekt des Labors, Täter eingespielt) steht über dem Rand, dasselbe Hex nach dem FARB-GESETZ im Rand
//   node scripts/diag-albedo-tafel.cjs --labor [--echt] [--nur terrain,garage] [--datei f.json]
//        die Labor-Seite messen (je Studio die Zeilen der Tafel + seine 18-%-Karte), gegen das gespeicherte Welt-Ist urteilen
//   node scripts/diag-albedo-tafel.cjs --nachziehen welt.json labor.json
//        aus einer Messung BEIDER Seiten das Ist setzen und die Ratsche senken (nie heben)
//
// Port: ALBEDO_PORT (Standard 4587). `--echt` fährt die echte GPU (scripts/lib/software-gpu.cjs echteWebGpuArgs), sonst
// swiftshader (softwareWebGpuArgs, das EINE Start-Rezept).
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const AT = require("./lib/albedo-tafel.cjs");

const root = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const PORT = Number(process.env.ALBEDO_PORT || 4587);
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
};

function statisch(seiten) {
    return http.createServer((req, res) => {
        const p = req.url.split("?")[0];
        if (seiten && seiten[p]) {
            res.setHeader("Content-Type", "text/html");
            return res.end(seiten[p]);
        }
        const fp = path.join(root, decodeURIComponent(p));
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
}

async function browser(echt) {
    const puppeteer = require("puppeteer");
    const { softwareWebGpuArgs, echteWebGpuArgs } = require("./lib/software-gpu.cjs");
    return puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: [...(echt ? echteWebGpuArgs() : softwareWebGpuArgs()), "--window-size=1280,800"],
        defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 },
    });
}

// ── Die Labor-Seite ─────────────────────────────────────────────────────────────────────────────────────────────────────
// Je Studio: die Seite laden, auf die Wurzel warten, je Zeile die Labor-Aktion (der echte UI-Pfad: Vorlagen-Knopf, Lack-
// Feld, Kultur-Wahl, der Wald) und dann der Schuss; zuletzt die Karte des Studios.
async function aktion(page, a) {
    if (!a) return;
    // Eine Folge von Aktionen (Kultur wählen, dann den Garten aus) läuft der Reihe nach.
    if (Array.isArray(a)) {
        for (const x of a) await aktion(page, x);
        return;
    }
    if (a.klick)
        await page.evaluate((a) => {
            const el = document.querySelectorAll(a.klick)[a.index || 0];
            if (!el) throw new Error("Labor-Aktion: kein Element " + a.klick);
            el.click();
        }, a);
    if (a.waehle)
        await page.evaluate((a) => {
            const el = document.querySelector(a.waehle);
            if (!el) throw new Error("Labor-Aktion: keine Wahl " + a.waehle);
            el.value = a.wert;
            el.dispatchEvent(new Event("change", { bubbles: true }));
        }, a);
    if (a.wald) {
        await page.evaluate(() => enterForest()); // eslint-disable-line no-undef
        await page.waitForFunction(
            () => {
                const m = typeof _terMat !== "undefined" ? _terMat : null; // eslint-disable-line no-undef
                if (!m) return false;
                let da = false;
                scene.traverse((x) => (da = da || (x.isMesh && x.material === m))); // eslint-disable-line no-undef
                return da;
            },
            { timeout: 300000, polling: 500 }
        );
    }
    // Die Shells bauen im Klick-Takt oder entprellt (Regler 90–180 ms) — zwei Bilder später steht die Gestalt.
    await page.evaluate(() => new Promise((r) => setTimeout(r, 600)));
}

async function messeLabor({ echt, nur, tafel }) {
    const server = statisch();
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const b = await browser(echt);
    const out = { labor: {}, karten: {}, eichung: { labor: {} }, geraet: null, fehler: [] };
    try {
        for (const [sid, S] of Object.entries(AT.STUDIOS)) {
            if (nur && !nur.includes(sid)) continue;
            const page = await b.newPage();
            const fehler = [];
            page.on("pageerror", (e) => fehler.push(String((e && e.message) || e).split("\n")[0]));
            await page.goto(`http://127.0.0.1:${PORT}/${S.pfad}`, { waitUntil: "load", timeout: 120000 });
            await page.evaluate(AT.LABOR_INSTALL);
            await page.waitForFunction(
                (S) => {
                    const g = (n) => new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)();
                    const w = g(S.wurzel);
                    let n = 0;
                    if (w) w.traverse((x) => (n += x.isMesh ? 1 : 0));
                    return n > 0 && !!g(S.renderer);
                },
                { timeout: 180000, polling: 300 },
                S
            );
            if (!out.geraet)
                out.geraet = await page.evaluate((S) => {
                    const R = new Function(`return ${S.renderer};`)();
                    const gl = R.getContext();
                    const e = gl.getExtension("WEBGL_debug_renderer_info");
                    return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
                }, S);
            // Die Karte zuerst: das Labor-Licht, wie das Studio startet (vor jeder Vorlagen-Wahl, vor dem Wald).
            out.karten[sid] = await page.evaluate((o) => window.__laborKarte(o), { studio: S, studioId: sid });
            const zeilen = tafel.zeilen.filter((z) => z.labor && z.labor.studio === sid);
            // Der Wald baut die Pflanzen-Welt um — seine Zeilen zuletzt.
            const wald = (z) => [].concat(z.labor.aktion || []).some((x) => x.wald);
            zeilen.sort((a, c) => (wald(a) ? 1 : 0) - (wald(c) ? 1 : 0));
            let eich = null;
            for (const z of zeilen) {
                await aktion(page, z.labor.aktion);
                const res = await page.evaluate((o) => window.__laborAlbedo(o), { studio: S, zeilen: [z] });
                const e = res.find((x) => x.id === z.id || x.name === z.id) || { fehler: "keine Antwort" };
                const k = res.find((x) => x.name === "graukarte");
                if (k && k.gesamt) eich = k.gesamt.Y;
                const ordner = opt("--bilder");
                if (ordner && e.png) {
                    fs.mkdirSync(ordner, { recursive: true });
                    fs.writeFileSync(path.join(ordner, `labor-${z.id}.png`), Buffer.from(e.png.split(",")[1], "base64"));
                }
                out.labor[z.id] = e.gesamt
                    ? { Y: e.gesamt.Y, rgb: e.gesamt.rgb, pixel: e.pixel, zuege: e.zuege, stoffe: e.stoffe }
                    : { Y: null, fehler: e.fehler || "kein Pixel" };
            }
            out.eichung.labor[sid] = eich;
            if (fehler.length) out.fehler.push(`${sid}: ${fehler.slice(0, 3).join(" | ")}`);
            await page.close();
        }
    } finally {
        await b.close();
        server.close();
    }
    return out;
}

// ── Der Selbsttest ──────────────────────────────────────────────────────────────────────────────────────────────────────
function tafelZumTest() {
    const t = AT.ladeTafel();
    const k = JSON.parse(JSON.stringify(t));
    for (const z of k.zeilen) z.ratsche = 0.05;
    for (const s of Object.keys(k.karten)) k.karten[s].ratsche = 0.05;
    return k;
}
function messungZumTest(t, faktor) {
    const m = { labor: {}, welt: {}, karten: {}, eichung: { welt: 0.18, labor: {} } };
    for (const z of t.zeilen) {
        m.welt[z.id] = { Y: 0.2, rgb: "0.2/0.2/0.2" };
        m.labor[z.id] = { Y: 0.2 * ((faktor && faktor[z.id]) || 1), rgb: "x" };
    }
    for (const s of Object.keys(t.karten)) {
        m.karten[s] = { kL: 0.3147, ausgabe: [173, 173, 173] };
        m.eichung.labor[s] = 0.18;
    }
    return m;
}

async function selbsttest() {
    const tests = [];
    const t = (name, ok) => tests.push({ name, ok: !!ok });
    const T0 = tafelZumTest();
    const hatRot = (u, art) => u.rot.some((r) => r.art === art);
    // S1 — gleich auf beiden Seiten: GRÜN, alle Zeilen im Soll.
    const u1 = AT.tafelUrteil(T0, messungZumTest(T0));
    t("Labor = Welt auf jeder Zeile → GRÜN, jede Zeile und Karte im Soll", u1.urteil === "GRUEN" && u1.zeilen.every((z) => z.imSoll));
    // S2 — das Labor liest das Hex roh (Faktor 2,3 auf einer Zeile): über der Ratsche ROT und außerhalb des Solls; ein
    // Schritt Richtung 1 innerhalb von Ratsche + Rand bleibt grün.
    const u2 = AT.tafelUrteil(T0, messungZumTest(T0, { [T0.zeilen[0].id]: 2.3 }));
    const u2b = AT.tafelUrteil(T0, messungZumTest(T0, { [T0.zeilen[0].id]: 1.06 }));
    t(
        "eine Zeile Labor/Welt 2,3 → ROT `ratsche`, nicht im Soll; 1,06 (|ln| 0,058 ≤ 0,05 + Rand) → GRÜN",
        hatRot(u2, "ratsche") && !u2.zeilen[0].imSoll && u2b.urteil === "GRUEN"
    );
    // S3 — die Eichung: eine Karte, die 0,20 liest, ist ROT (keine Zahl der Tafel wäre dann eine Albedo).
    const m3 = messungZumTest(T0);
    m3.eichung.welt = 0.2;
    t("Welt-Karte liest 0,20 → ROT `eichung`", hatRot(AT.tafelUrteil(T0, m3), "eichung"));
    // S4 — eine stumme Seite (das Labor maß 0 Pixel) ist ROT, nie still grün.
    const m4 = messungZumTest(T0);
    m4.labor[T0.zeilen[1].id] = { Y: null, fehler: "kein Pixel" };
    t("eine stumme Labor-Zeile → ROT `stumm`", hatRot(AT.tafelUrteil(T0, m4), "stumm"));
    // S5 — die Karte: k·L 0,62 (der Belichtungs-Bias des Labors) über der Ratsche ROT.
    const m5 = messungZumTest(T0);
    m5.karten.garage.kL = 0.62;
    t("Karte garage k·L 0,62 → ROT `ratsche`", hatRot(AT.tafelUrteil(T0, m5), "ratsche"));
    // S6 — das Schema: eine fehlende Klasse, ein Welt-Muster ohne Anker, eine Zeile mit falschem Verhältnis werden rot.
    const s6a = JSON.parse(JSON.stringify(T0));
    s6a.zeilen = s6a.zeilen.filter((z) => z.gruppe !== "Klinge");
    const s6b = JSON.parse(JSON.stringify(T0));
    s6b.zeilen[0].welt.klasse = "f:eiche";
    const s6c = JSON.parse(JSON.stringify(T0));
    s6c.zeilen[0].ist = { labor: { Y: 0.2, rgb: "x" }, welt: { Y: 0.1, rgb: "x" }, verhaeltnis: 1 };
    t(
        "Tafel ohne Klinge, Welt-Muster ohne Anker, Verhältnis ≠ Labor/Welt → rot; die echte Tafel nicht",
        AT.tafelPruefen(s6a).some((f) => /Klinge/.test(f)) &&
            AT.tafelPruefen(s6b).some((f) => /Anker/.test(f)) &&
            AT.tafelPruefen(s6c).some((f) => /nicht Labor\/Welt/.test(f)) &&
            !AT.tafelPruefen(AT.ladeTafel()).length
    );
    // S7 — der Nachzug senkt, hebt nie, und zieht ohne Eichung nicht.
    const n7 = AT.tafelNachziehen(T0, messungZumTest(T0, { [T0.zeilen[2].id]: 1.01 }), { labor: {}, welt: {} });
    const n7b = AT.tafelNachziehen(T0, messungZumTest(T0, { [T0.zeilen[2].id]: 1.2 }), { labor: {}, welt: {} });
    t(
        "Nachzug: 0,05 → 0 (Labor = Welt) und 0,05 → 0,01; über der Ratsche bleibt 0,05; eine falsche Eichung zieht nicht",
        n7.tafel.zeilen[0].ratsche === 0 &&
            Math.abs(n7.tafel.zeilen[2].ratsche - 0.01) < 1e-3 &&
            n7b.tafel.zeilen[2].ratsche === 0.05 &&
            AT.tafelNachziehen(T0, m3, {}).tafel === null
    );
    // S8 — DER TÄTER IM ECHTEN LABOR (r128, Chrome, die Linse der Bibliothek): eine Szene mit drei Stoffen — die 18-%-Karte,
    // Granit 0x8e939a nach dem FARB-GESETZ (linear gesetzt, wie die Welt ihn backt) und DERSELBE Hex roh gelesen
    // (`new THREE.Color(hex)`, der alte Defekt des Labors). Gegen die Welt-Albedo des Hex (linear) steht der rohe über dem
    // Rand einer geheilten Ratsche (0), der gesetzlich gelesene darin; die Karte liest 0,180.
    const server = statisch({
        "/__albedo_selbst.html": `<!doctype html><meta charset="utf-8"><body style="margin:0"><script src="/worlds/terrain/lib/three-r128.min.js"></script><script>
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(320, 200);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x203040);
scene.fog = new THREE.Fog(0x203040, 1, 10);
const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(3, 5, 2); scene.add(key);
scene.add(new THREE.HemisphereLight(0xaaccff, 0x332211, 0.8));
const subject = new THREE.Group(); scene.add(subject);
const roh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: new THREE.Color(0x8e939a), roughness: 0.81, metalness: 0.3, emissive: 0x221100 }));
roh.material.userData.__seh = "roh";
const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const gesetz = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.81, metalness: 0.3 }));
gesetz.material.color.setRGB(lin(0x8e / 255), lin(0x93 / 255), lin(0x9a / 255));
gesetz.material.userData.__seh = "gesetz";
roh.position.x = -0.8; gesetz.position.x = 0.8; subject.add(roh); subject.add(gesetz);
window.__bereit = true;
</script>`,
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const b = await browser(false);
    try {
        const page = await b.newPage();
        await page.goto(`http://127.0.0.1:${PORT}/__albedo_selbst.html`, { waitUntil: "load", timeout: 60000 });
        await page.waitForFunction(() => window.__bereit === true, { timeout: 30000 });
        await page.evaluate(AT.LABOR_INSTALL);
        const S = { szene: "scene", renderer: "renderer", wurzel: "subject", ausgabe: null };
        const res = await page.evaluate(
            (o) => window.__laborAlbedo(o),
            {
                studio: S,
                zeilen: [
                    { id: "roh", labor: { stoff: { seh: "roh" } } },
                    { id: "gesetz", labor: { stoff: { seh: "gesetz" } } },
                ],
            }
        );
        const y = (id) => (res.find((x) => x.name === id || x.id === id) || {}).gesamt;
        const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        const weltY = 0.2126 * lin(0x8e / 255) + 0.7152 * lin(0x93 / 255) + 0.0722 * lin(0x9a / 255);
        const karteY = y("graukarte") && y("graukarte").Y;
        const vRoh = y("roh") ? y("roh").Y / weltY : null;
        const vGes = y("gesetz") ? y("gesetz").Y / weltY : null;
        const T8 = JSON.parse(JSON.stringify(T0));
        T8.zeilen = [Object.assign({}, T0.zeilen[0], { id: "probe", ratsche: 0 })];
        T8.karten = {};
        const m8 = (vY) => ({
            labor: { probe: { Y: vY, rgb: "x" } },
            welt: { probe: { Y: weltY, rgb: "x" } },
            karten: {},
            eichung: { welt: 0.18, labor: { probe: karteY } },
        });
        const u8roh = AT.tafelUrteil(T8, m8(y("roh") ? y("roh").Y : null));
        const u8ges = AT.tafelUrteil(T8, m8(y("gesetz") ? y("gesetz").Y : null));
        console.log(
            `   Labor-Probe (r128): Karte ${karteY} · Granit roh Y ${y("roh") && y("roh").Y} (Labor/Welt ${vRoh && vRoh.toFixed(3)}) · ` +
                `nach dem Gesetz Y ${y("gesetz") && y("gesetz").Y} (${vGes && vGes.toFixed(3)}) · Welt-Y ${weltY.toFixed(4)}`
        );
        t("Labor-Linse: die 18-%-Karte liest 0,180 ± 0,002 unter Fremd-Licht, Nebel, ACES und Belichtung 1,3", Math.abs(karteY - 0.18) <= 0.002);
        t(
            "Täter roh gelesenes Hex 0x8e939a: Labor/Welt ≈ 2 (> 1,5) → ROT gegen die geheilte Ratsche; nach dem FARB-GESETZ 1 ± 1 % → GRÜN",
            vRoh > 1.5 && hatRot(u8roh, "ratsche") && Math.abs(vGes - 1) <= 0.01 && u8ges.urteil === "GRUEN"
        );
        // S9 — die Karte im Labor: k·L = Belichtung × Leuchtdichte (der Probe-Aufbau: Belichtung 1,3, Key 3 + Hemi).
        const k = await page.evaluate((o) => window.__laborKarte(o), { studio: S, studioId: "probe" });
        console.log(`   Labor-Karte der Probe: k·L ${k.kL} (Belichtung ${k.belichtung}), Ausgabe ${k.ausgabe}`);
        t("Labor-Karte: k·L > 0 und die Belichtung 1,3 steht im Ergebnis, der Ausgabe-Pixel ist gelesen", k.kL > 0 && k.belichtung === 1.3 && Array.isArray(k.ausgabe));
    } finally {
        await b.close();
        server.close();
    }
    const rot = tests.filter((x) => !x.ok);
    for (const x of tests) console.log(`${x.ok ? "✅" : "❌"} SELBST-TEST: ${x.name}`);
    if (rot.length) {
        console.log(`⛔ DIE ALBEDO-WAND ist blind: ${rot.length} von ${tests.length} Selbsttests feuern nicht`);
        process.exit(1);
    }
    console.log(`✅ SELBST-TEST: die Albedo-Wand feuert (${tests.length}/${tests.length})`);
}

// Die gespeicherte Tafel als Messung (für das Urteil ohne GPU).
function gespeichert(t) {
    const m = { labor: {}, welt: {}, karten: {}, eichung: { welt: t.karte.albedo, labor: {} } };
    for (const z of t.zeilen)
        if (z.ist) {
            m.labor[z.id] = z.ist.labor;
            m.welt[z.id] = z.ist.welt;
        }
    for (const [s, k] of Object.entries(t.karten)) {
        if (k.ist) m.karten[s] = k.ist;
        m.eichung.labor[s] = t.karte.albedo;
    }
    return m;
}

async function main() {
    if (argv.includes("--selftest")) return selbsttest();
    const t = AT.ladeTafel();
    const schema = AT.tafelPruefen(t);
    if (schema.length) {
        console.log("⛔ DIE ALBEDO-TAFEL:");
        for (const f of schema) console.log("   ❌ " + f);
        process.exit(1);
    }
    if (argv.includes("--labor")) {
        const nur = opt("--nur") ? opt("--nur").split(",") : null;
        const m = await messeLabor({ echt: argv.includes("--echt"), nur, tafel: t });
        m.datum = new Date().toISOString();
        m.echt = argv.includes("--echt");
        if (opt("--datei")) fs.writeFileSync(path.resolve(opt("--datei")), JSON.stringify(m, null, 1));
        // Gegen das gespeicherte Welt-Ist: die Labor-Seite lebt, die Welt-Seite steht in der Tafel.
        const g = gespeichert(t);
        const mm = Object.assign({}, g, { labor: m.labor, karten: m.karten, eichung: { welt: g.eichung.welt, labor: m.eichung.labor } });
        if (nur)
            for (const z of t.zeilen)
                if (!nur.includes(z.labor.studio)) mm.labor[z.id] = g.labor[z.id];
        const u = AT.tafelUrteil(t, mm);
        if (nur) {
            u.karten = u.karten.filter((k) => nur.includes(k.studio));
            u.rot = u.rot.filter((r) => !/^Karte /.test(r.text) || nur.some((s) => r.text.includes(" " + s + ":")));
            u.urteil = u.rot.length ? "ROT" : "GRUEN";
        }
        console.log(`Labor: ${m.geraet}${m.fehler.length ? " · Seiten-Fehler: " + m.fehler.join(" ; ") : ""}`);
        console.log(AT.tafelTabelle(u));
        process.exit(u.urteil === "GRUEN" ? 0 : 1);
    }
    if (argv.includes("--nachziehen")) {
        const i = argv.indexOf("--nachziehen");
        const welt = JSON.parse(fs.readFileSync(path.resolve(argv[i + 1]), "utf8"));
        const labor = JSON.parse(fs.readFileSync(path.resolve(argv[i + 2]), "utf8"));
        const m = { labor: labor.labor, karten: labor.karten, welt: welt.welt, eichung: { welt: welt.eichung, labor: labor.eichung.labor } };
        const r = AT.tafelNachziehen(t, m, {
            labor: { datum: labor.datum, geraet: labor.geraet, echt: labor.echt },
            welt: { datum: welt.datum, geraet: welt.geraet, ort: welt.ort, spieler: welt.spieler, echt: welt.echt },
        });
        console.log(AT.tafelTabelle(r.u));
        if (!r.tafel) {
            console.log("\nTafel NICHT nachgezogen: " + r.grund);
            process.exit(1);
        }
        fs.writeFileSync(AT.TAFEL_PFAD, JSON.stringify(r.tafel, null, 4) + "\n");
        console.log(`\nTafel nachgezogen (${r.aenderungen.length}): ${r.aenderungen.join(" · ") || "nichts fiel"}`);
        process.exit(0);
    }
    // DIE WAND (GPU-frei): jede Zeile gemessen, das Ist in seiner Ratsche, der Soll-Stand benannt.
    const errs = [];
    if (!t.gemessen) errs.push("die Tafel ist ungemessen (gemessen = null)");
    for (const z of t.zeilen) if (!z.ist || z.ratsche == null) errs.push(`${z.id}: ohne Ist oder Ratsche`);
    for (const [s, k] of Object.entries(t.karten)) if (!k.ist || k.ratsche == null) errs.push(`Karte ${s}: ohne Ist oder Ratsche`);
    const u = AT.tafelUrteil(t, gespeichert(t));
    for (const r of u.rot) errs.push(`[${r.art}] ${r.text}`);
    if (errs.length) {
        console.log("⛔ DIE ALBEDO-TAFEL:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    const weit = u.zeilen
        .filter((z) => !z.imSoll)
        .sort((a, b) => b.abweichung - a.abweichung)
        .map((z) => `${z.id} ${z.verhaeltnis}`);
    console.log(
        `✅ DIE ALBEDO-TAFEL steht — ${t.zeilen.length} Zeilen in ${AT.PFLICHT_GRUPPEN.length} Klassen, ${Object.keys(t.karten).length} ` +
            `Studio-Karten; im Soll (±${Math.round(t.toleranz * 100)} %) ${u.soll.zeilen} Zeilen, ${u.soll.karten} Karten` +
            (weit.length ? ` — außerhalb (Labor/Welt): ${weit.join(" · ")}` : "") +
            ` · gemessen Labor ${t.gemessen.labor.datum ? t.gemessen.labor.datum.slice(0, 10) : "?"} (${t.gemessen.labor.geraet || "?"}), ` +
            `Welt ${t.gemessen.welt.datum ? t.gemessen.welt.datum.slice(0, 10) : "?"} (Ort ${t.gemessen.welt.ort || "?"}).`
    );
}

main().catch((e) => {
    console.error("ALBEDO-TAFEL-FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
