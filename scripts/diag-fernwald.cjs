// diag-fernwald.cjs — DER FERNWALD IST KARTE (npm run gate:fernwald).
//
// Studio-Vertrag B2c: Baum und Strauch tragen `lod.budget[kind].fernform: "karte"` — jenseits der Nah-Grenze des Wirts
// IST die Art ihre Karte (KIND_POLICY.impostor, auch Tor und Fahrzeug). Die Streu las das seit 04.10.; der GESETZTE Wald
// (Architektur-Einträge aus `_forestPlantChunk`) trug jenseits der Mesh-Zone (des geregelten Cull-Radius, 100–150 m)
// bis 05.10. einen Kegel-und-Lappen-Satz im Welt-March: aus 45 m glatte, gestreifte, einfarbig hellgrüne Ellipsoide
// vor dem Wald (Blick-Tour 10-panorama-45m; an der Mess-Wiese 895 Sätze), am Radius sprang die Karte in den Satz.
// Der EINE Chokepoint `tickArchitectureCulling` liest jetzt `_archKartenPreset`: ein Karten-Ding ist jenseits der
// Mesh-Zone seine Karte (`_archInKartenZone`: Stufe 2, VOLL gestempelt, kein Band-Partner) bis zum Karten-Horizont
// `SCATTER.outerM` (derselbe wie die gestreuten Bäume), geräumt erst `KARTEN_HORIZONT_TOTBAND_M` dahinter.
//
// Boot mit Foundry-ON und Null-Renderer (die Form-Entscheidung fällt CPU-seitig; headless trägt der Rahmen aus der
// L1-Geometrie, die Karte steht ohne Bake). Die Linse nennt jeden Täter beim Namen (Art, Distanz, Grund).
//   A FORM      an der Mess-Wiese trägt JEDES Karten-Ding zwischen Mesh-Zone und Karten-Horizont seine Karte: platziert,
//               Stufe 2, VOLL gestempelt (aKarte.w < 0) — nicht vakuös: mindestens 100 solche Bäume.
//   B ABSENZ    kein Karten-Ding trägt einen Feld-Satz; der Satz-Weg (`_archZiegelFern`, mit echtem Renderer) legt für
//               ein Karten-Ding keinen an.
//   C HORIZONT  der Spieler zieht 320 m weiter: kein Karten-Ding jenseits Horizont + Totband ist platziert, jedes in der
//               Karten-Zone trägt seine Karte.
//   D ÜBERGANG  ein Baum am Rand der Mesh-Zone (Karte, diesseits) wandert hinüber und zurück: dieselben Instanz-Slots
//               (kein Abbau, kein Neubau, kein Takt ohne Gestalt), der Voll-Stempel folgt der Zone — kein Pop am Radius.
//   SELBSTTEST (sonst wäre das Grün vakuös): (1) der alte Weg (`_archKartenPreset` → null: jenseits der Mesh-Zone
//               geräumt) macht A und D rot; (2) ein injizierter Feld-Satz an einem Baum macht B rot mit Namen.
//
//   node scripts/diag-fernwald.cjs        (Port: FERNWALD_PORT)
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FERNWALD_PORT || 4598);
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
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhForceFoundry = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });

    const out = await page.evaluate(async () => {
        const res = { boot: false };
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl0 = performance.now() + 120000;
        while (
            (!window.anazhRealm ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return res;
        res.boot = true;
        const AR = r.constructor;
        const st = r.state;
        const f = r._ensureAssetFoundry();
        const dl1 = performance.now() + 90000;
        while (performance.now() < dl1) {
            if (f && f.ready && f.recipes && AR._studioRenderConfig && AR._studioRenderConfig.lod) break;
            await sleep(100);
        }
        res.buch = !!(f && f.ready);
        if (!res.buch) return res;
        let taktFehler = null;
        const tick = async (n) => {
            for (let i = 0; i < n; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (e) {
                    if (!taktFehler) taktFehler = String((e && e.message) || e).split("\n")[0];
                }
                await sleep(0);
            }
        };
        const pm = st.playerMesh.position;
        const stelle = (x, z) => pm.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
        const H = AR.SCATTER.outerM;
        const TOT = AR.KARTEN_HORIZONT_TOTBAND_M;
        res.horizont = H;
        res.totband = TOT;
        const dist = (e) => Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
        // Die Linse liest die Karten-Art über die Prototyp-Methode — der Selbsttest ersetzt nur die der Welt.
        const KP = AR.prototype._archKartenPreset;
        const kartenPreset = (e) => KP.call(r, e);
        const karten = () => st.architectures.filter((e) => e && e.position && kartenPreset(e));
        // Der Stempel einer Karten-Instanz: das Vorzeichen von aKarte.w im Slot (negativ = voll).
        const stempel = (e) => {
            for (const s of e.instSlots || []) {
                const g = st.archInstanceGroups.get(s.key);
                const ak = g && g.mesh && g.mesh.geometry.attributes.aKarte;
                if (ak) return ak.array[s.slot * 4 + 3];
            }
            return null;
        };
        // A: der Zustand jedes Karten-Dings der Karten-Zone, Täter beim Namen.
        const formZensus = () => {
            const R = st.architectureCullingRadius;
            const t = [];
            let n = 0,
                ok = 0;
            for (const e of karten()) {
                const d = dist(e);
                if (!(d > R && d <= H)) continue;
                n++;
                const p = kartenPreset(e);
                let grund = null;
                if (!r._archIsRendered(e)) grund = r._foundryPlatzBereit(e, p) ? "kalt (Karte bereit)" : "kalt (Karte lädt)";
                else if (e._lodLevel !== 2) grund = "Stufe L" + e._lodLevel;
                else if (!(stempel(e) < 0)) grund = "Karte nicht voll gestempelt";
                else if (e._ziegelSlot) grund = "Feld-Satz";
                if (grund) {
                    if (t.length < 6) t.push(`${e.type} @ ${d.toFixed(0)} m: ${grund}`);
                } else ok++;
            }
            return { radius: Math.round(R), n, ok, taeter: t };
        };
        const einschwingen = async (msMax) => {
            const dl = performance.now() + msMax;
            let vor = -1,
                ruhig = 0,
                z = formZensus();
            while (performance.now() < dl) {
                await tick(10);
                z = formZensus();
                const s = st.architectures.length * 1000 + z.ok;
                ruhig = s === vor ? ruhig + 1 : 0;
                vor = s;
                if (z.n > 0 && z.ok === z.n && ruhig >= 3) break;
                if (ruhig >= 30) break;
            }
            return z;
        };
        // ── Die Mess-Wiese: der Wald wächst, die Karten stehen ──
        stelle(-900, -850);
        await tick(60);
        res.A = await einschwingen(240000);

        // ── B: Absenz — kein Satz an einem Karten-Ding; der Satz-Weg legt mit echtem Renderer keinen an ──
        const absenz = () => {
            const t = [];
            for (const e of karten())
                if (e._ziegelSlot && t.length < 6) t.push(`${e.type} @ ${dist(e).toFixed(0)} m trägt einen Feld-Satz`);
            return t;
        };
        res.B = { taeter: absenz() };
        {
            const probe = karten().find((e) => dist(e) > st.architectureCullingRadius);
            const rend = st.renderer;
            const alt = rend._isHeadlessNull;
            if (probe) {
                rend._isHeadlessNull = false; // der Satz-Weg nur bis zur Wand (das Karten-Ding kehrt vor jedem Bau um)
                let ret = null;
                try {
                    ret = r._archZiegelFern(probe);
                } finally {
                    rend._isHeadlessNull = alt;
                }
                res.B.wand = { typ: probe.type, ret, slot: !!probe._ziegelSlot, gebacken: !!probe._ziegelGebacken };
            }
        }

        // ── D: der Übergang am Radius — ein Baum in der Mesh-Zone nahe dem Rand wandert hinaus und zurück ──
        const uebergang = async () => {
            const R = st.architectureCullingRadius;
            const kand = karten()
                .filter(
                    (e) =>
                        r._archIsRendered(e) &&
                        e._lodLevel === 2 &&
                        !e._bruecke &&
                        !e._occluded &&
                        dist(e) > R - 25 &&
                        dist(e) < R - 3
                )
                .sort((a, b) => dist(b) - dist(a));
            const e = kand[0];
            if (!e) return { fehlt: true };
            const start = { x: pm.x, z: pm.z };
            const slots = JSON.stringify(e.instSlots);
            const d0 = dist(e);
            // den Spieler radial vom Baum weg setzen, bis der Baum R + 15 m entfernt steht
            const ux = (pm.x - e.position.x) / d0,
                uz = (pm.z - e.position.z) / d0;
            const weg = R + 15 - d0;
            let luecke = 0,
                takte = 0;
            const folge = async (n) => {
                for (let i = 0; i < n; i++) {
                    await tick(1);
                    takte++;
                    if (!r._archIsRendered(e)) luecke++;
                }
            };
            stelle(start.x + ux * weg, start.z + uz * weg);
            await folge(40);
            const draussen = {
                d: +dist(e).toFixed(1),
                gleich: JSON.stringify(e.instSlots) === slots,
                voll: stempel(e) < 0,
                stufe: e._lodLevel,
            };
            stelle(start.x, start.z);
            await folge(40);
            const drinnen = {
                d: +dist(e).toFixed(1),
                gleich: JSON.stringify(e.instSlots) === slots,
                voll: stempel(e) < 0,
                stufe: e._lodLevel,
            };
            return { typ: e.type, d0: +d0.toFixed(1), radius: Math.round(R), draussen, drinnen, luecke, takte };
        };
        res.D = await uebergang();

        // ── C: der Horizont — der Spieler zieht weiter, die Ferne räumt, die Karten-Zone trägt ──
        stelle(-900 + 320, -850);
        const zC = await einschwingen(240000);
        const jenseits = [];
        let nJ = 0;
        for (const e of karten()) {
            const d = dist(e);
            if (d > H + TOT) {
                nJ++;
                if (r._archIsRendered(e) && jenseits.length < 6) jenseits.push(`${e.type} @ ${d.toFixed(0)} m platziert`);
            }
        }
        res.C = { zone: zC, jenseitsN: nJ, jenseits };

        // ── SELBSTTEST (1): der alte Weg — kein Karten-Ding: jenseits der Mesh-Zone geräumt ──
        stelle(-900, -850);
        await einschwingen(120000);
        const D1 = r.constructor.prototype._archKartenPreset;
        const kandS1 = await uebergang(); // der Kandidat unter dem echten Weg (der Baum steht am Rand)
        r._archKartenPreset = () => null;
        await tick(30);
        res.S1 = { A: formZensus(), D: await uebergang(), vorher: !kandS1.fehlt };
        delete r._archKartenPreset; // die Prototyp-Methode trägt wieder
        res.S1.zurueck = r._archKartenPreset === D1;
        // ── SELBSTTEST (2): ein injizierter Satz an einem Baum ──
        const opfer = karten()[0];
        if (opfer) {
            opfer._ziegelSlot = { feld: -1, injiziert: true };
            res.S2 = absenz();
            opfer._ziegelSlot = null;
        }
        res.taktFehler = taktFehler;
        res.arch = st.architectures.length;
        return res;
    });
    await browser.close();
    server.close();

    console.log("=== DER FERNWALD IST KARTE (gate:fernwald) ===");
    if (!out.boot || !out.buch) {
        console.log(`  ❌ Boot ${out.boot} · Buch ${out.buch}`);
        process.exit(2);
    }
    const A = out.A;
    check(
        "A FORM",
        A.n >= 100 && A.ok === A.n,
        `Karten-Zone ${A.radius}–${out.horizont} m: ${A.ok}/${A.n} Karten-Dinge tragen ihre Karte (Stufe 2, voll)` +
            (A.taeter.length ? ` · Täter: ${A.taeter.join(" | ")}` : "")
    );
    const w = out.B.wand;
    check(
        "B ABSENZ",
        out.B.taeter.length === 0 && !!w && w.ret === false && !w.slot && !w.gebacken,
        `Feld-Sätze an Karten-Dingen: ${out.B.taeter.length}` +
            (out.B.taeter.length ? ` (${out.B.taeter.join(" | ")})` : "") +
            ` · Satz-Weg für ${w ? w.typ : "?"}: ${w ? `ret ${w.ret}, Slot ${w.slot}, aufgegeben ${w.gebacken}` : "keine Probe"}`
    );
    const C = out.C;
    check(
        "C HORIZONT",
        C.jenseitsN > 0 && C.jenseits.length === 0 && C.zone.n > 0 && C.zone.ok === C.zone.n,
        `nach dem Umzug: ${C.jenseitsN} Karten-Dinge jenseits ${out.horizont}+${out.totband} m, platziert: ${C.jenseits.length}` +
            (C.jenseits.length ? ` (${C.jenseits.join(" | ")})` : "") +
            ` · Karten-Zone ${C.zone.ok}/${C.zone.n}` +
            (C.zone.taeter.length ? ` · Täter: ${C.zone.taeter.join(" | ")}` : "")
    );
    const D = out.D;
    const dOk = (x) =>
        !x.fehlt &&
        x.luecke === 0 &&
        x.draussen.gleich &&
        x.draussen.voll &&
        x.draussen.stufe === 2 &&
        x.drinnen.gleich &&
        !x.drinnen.voll &&
        x.drinnen.stufe === 2;
    check(
        "D ÜBERGANG",
        dOk(D),
        D.fehlt
            ? "kein Baum am Rand der Mesh-Zone"
            : `${D.typ} (${D.d0} m, Radius ${D.radius} m) → ${D.draussen.d} m: Slots gleich ${D.draussen.gleich}, voll ${D.draussen.voll}` +
                  ` · zurück ${D.drinnen.d} m: Slots gleich ${D.drinnen.gleich}, voll ${D.drinnen.voll} · Takte ohne Gestalt ${D.luecke}/${D.takte}`
    );
    const s1 = out.S1;
    const s1Rot = s1.vorher && s1.zurueck && !(s1.A.n >= 100 && s1.A.ok === s1.A.n) && !s1.D.fehlt && !dOk(s1.D);
    check(
        "SELBSTTEST 1 (der alte Weg macht A und D rot)",
        s1Rot,
        `A ${s1.A.ok}/${s1.A.n}` +
            (s1.A.taeter[0] ? ` (${s1.A.taeter[0]})` : "") +
            ` · D ${s1.D.fehlt ? "kein Kandidat" : `Takte ohne Gestalt ${s1.D.luecke}, Slots gleich ${s1.D.draussen.gleich}`}`
    );
    check(
        "SELBSTTEST 2 (ein injizierter Satz macht B rot)",
        Array.isArray(out.S2) && out.S2.length === 1,
        out.S2 ? out.S2.join(" | ") : "kein Opfer"
    );
    check("T keine Ausnahme im Spiel-Takt", !out.taktFehler, out.taktFehler || "");
    check("P keine Seiten-Fehler", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.join(", ")}`);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — der gesetzte Wald ist jenseits der Mesh-Zone seine Karte (${A.ok} Bäume), kein Satz, kein Pop am Radius.`
    );
    process.exit(0);
})().catch((e) => {
    console.error("DIAG-FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
