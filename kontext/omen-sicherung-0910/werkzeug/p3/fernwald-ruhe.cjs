// diag-fernwald.cjs — DER FERNWALD IST KARTE (npm run gate:fernwald).
//
// Studio-Vertrag B2c: Baum und Strauch tragen `lod.budget[kind].fernform: "karte"` — jenseits der Nah-Grenze des Wirts
// IST die Art ihre Karte (der Leser `_foundryFernForm`; Tor und Fahrzeug tragen "gesetz", ihren Box-Satz). Die Streu
// las das seit 04.10.; der GESETZTE Wald (Architektur-Einträge aus `_forestPlantChunk`) trug jenseits der Mesh-Zone (des
// geregelten Cull-Radius, 100–150 m) bis 05.10. einen Kegel-und-Lappen-Satz im Welt-March: aus 45 m glatte, gestreifte,
// einfarbig hellgrüne Ellipsoide vor dem Wald (Blick-Tour 10-panorama-45m; an der Mess-Wiese 895 Sätze), am Radius
// sprang die Karte in den Satz. Der EINE Chokepoint `tickArchitectureCulling` liest jetzt `_archKartenPreset`: ein
// Karten-Ding trägt seine Studio-Kette über die Mesh-Zone hinaus — dieselbe EINE Stufen-Wahl wie nah legt es jenseits
// seines L1↔Karte-Bands auf die Karte allein (kein Partner; ein Riese trägt sein Band über den Radius hinaus) bis zu
// SEINEM Rand im Saum vor `SCATTER.outerM` (`_archKartenHorizont`, aus dem Samen), geräumt erst
// `KARTEN_HORIZONT_TOTBAND_M` dahinter. Keine Karte dithert am Horizont (die Maske trägt keinen Schwund).
//
// Boot mit Foundry-ON und Null-Renderer (die Form-Entscheidung fällt CPU-seitig; headless trägt der Rahmen aus der
// L1-Geometrie, die Karte steht ohne Bake). Die Linse nennt jeden Täter beim Namen (Art, Distanz, Grund).
//   A FORM      an der Mess-Wiese trägt JEDES Karten-Ding zwischen Mesh-Zone und seinem Rand seine Gestalt: platziert,
//               jenseits seines Bands (d·min(lodRef/Sichthöhe, 1) ≥ D1 + M) die Karte allein, Stufe 2 ohne Partner —
//               nicht vakuös: mindestens 100 solche Bäume.
//   B ABSENZ    kein Karten-Ding trägt einen Feld-Satz; der Satz-Weg (`_archZiegelFern`, mit echtem Renderer) legt für
//               ein Karten-Ding keinen an.
//   C HORIZONT  der Spieler zieht 320 m weiter: kein Karten-Ding jenseits seines Rands + Totband ist platziert, jedes in
//               der Karten-Zone trägt seine Gestalt; die Ränder liegen im Saum und streuen über mindestens seine Hälfte.
//   D ÜBERGANG  ein Baum am Rand der Mesh-Zone (Karte, diesseits) wandert hinüber und zurück: dieselben Instanz-Slots
//               (kein Abbau, kein Neubau, kein Takt ohne Gestalt), draußen die Karte allein — kein Pop am Radius.
//   D2 RIESE    eine Eiche mit Sichthöhe 110 m (Band 134–270 m, jenseits jedes Radius): im Band trägt sie ihren Partner
//               (nicht voll gestempelt), jenseits die Karte allein, zurück wieder das Band — kein Takt ohne Gestalt.
//   SELBSTTEST (sonst wäre das Grün vakuös): (1) der alte Weg (`_archKartenPreset` → null: jenseits der Mesh-Zone
//               geräumt) macht A und D rot; (2) ein injizierter Feld-Satz an einem Baum macht B rot mit Namen;
//               (3) kein Band jenseits des Radius (die Zonen-Klemme bis 05.10.) — D2 rot.
//
//   node scripts/diag-fernwald.cjs        (Port: FERNWALD_PORT)
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FERNWALD_PORT || 4598);
const root = path.resolve(process.env.FW_ROOT);
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
    await page.evaluateOnNewDocument((w) => {
        window.__fwWecken = w;
    }, !!process.env.FW_WECKEN);
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
        // Jenseits seines L1↔Karte-Bands IST ein Karten-Ding die Karte allein (dieselbe Wahrnehmung wie die Stufen-Wahl);
        // sein Rand liegt im Saum vor dem Horizont (Prototyp — die Selbsttests ersetzen nur Methoden der Welt).
        const LD = AR.LOD_DISTANCES;
        const jenseitsBand = (e, d) => {
            const h = r._lodTreeVisHeight(e);
            return h !== null && r._lodPerceptionDistance(d, h) >= LD.thresh12 + (LD.hysteresis || 0);
        };
        const partner = (e) => (Number.isFinite(e._lodBandLevel) ? e._lodBandLevel : null);
        const RAND = AR.prototype._archKartenHorizont;
        const rand = (e) => RAND.call(r, e);
        // A: der Zustand jedes Karten-Dings der Karten-Zone, Täter beim Namen.
        const formZensus = () => {
            const R = st.architectureCullingRadius;
            const t = [];
            let n = 0,
                ok = 0,
                riesen = 0;
            for (const e of karten()) {
                const d = dist(e);
                if (!(d > R && d <= rand(e))) continue;
                n++;
                const p = kartenPreset(e);
                const karte = jenseitsBand(e, d);
                if (!karte) riesen++; // sein Band liegt jenseits des Radius: er folgt seiner Kette (D2)
                let grund = null;
                if (!r._archIsRendered(e)) grund = r._foundryPlatzBereit(e, p) ? "kalt (Karte bereit)" : "kalt (Karte lädt)";
                else if (karte && e._lodLevel !== 2) grund = "Stufe L" + e._lodLevel;
                else if (karte && partner(e) !== null) grund = "Band-Partner L" + partner(e) + " jenseits des Bands";
                else if (e._ziegelSlot) grund = "Feld-Satz";
                if (grund) {
                    if (t.length < 6) t.push(`${e.type} @ ${d.toFixed(0)} m: ${grund}`);
                } else ok++;
            }
            return { radius: Math.round(R), n, ok, riesen, taeter: t };
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
        // Der Cull-Radius ist GEREGELT (ARCH_QUALITY_RADIUS_MIN..MAX; headless folgt er dem PID je Takt — unter Last
        // sprang er im Lauf 05.10. über den Baum hinweg, D las „voll false" bei einem Baum, der diesseits stand): der
        // Baum steht diesseits des kleinsten Radius und wandert jenseits des größten, der Zonen-Wechsel hängt nie am
        // Regler-Stand.
        const RMIN = AR.ARCH_QUALITY_RADIUS_MIN,
            RMAX = AR.ARCH_QUALITY_RADIUS_MAX;
        const uebergang = async () => {
            const kand = karten()
                .filter(
                    (e) =>
                        r._archIsRendered(e) &&
                        e._lodLevel === 2 &&
                        !e._bruecke &&
                        !e._occluded &&
                        dist(e) > RMIN - 25 &&
                        dist(e) < RMIN - 3
                )
                .sort((a, b) => dist(b) - dist(a));
            const e = kand[0];
            if (!e) return { fehlt: true };
            const start = { x: pm.x, z: pm.z };
            const slots = JSON.stringify(e.instSlots);
            const d0 = dist(e);
            // den Spieler radial vom Baum weg setzen, bis der Baum RMAX + 15 m entfernt steht
            const ux = (pm.x - e.position.x) / d0,
                uz = (pm.z - e.position.z) / d0;
            const weg = RMAX + 15 - d0;
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
                partner: partner(e),
                stufe: e._lodLevel,
                radius: Math.round(st.architectureCullingRadius),
            };
            stelle(start.x, start.z);
            await folge(40);
            const drinnen = {
                d: +dist(e).toFixed(1),
                gleich: JSON.stringify(e.instSlots) === slots,
                voll: stempel(e) < 0,
                partner: partner(e),
                stufe: e._lodLevel,
                radius: Math.round(st.architectureCullingRadius),
            };
            return { typ: e.type, d0: +d0.toFixed(1), radius: RMIN + "–" + RMAX, draussen, drinnen, luecke, takte };
        };
        res.D = await uebergang();

        // ── D2: der Riese — sein L1↔Karte-Band liegt jenseits des Radius: er trägt dort seinen Band-Partner (kein harter
        // Sprung am Radius) und ist erst jenseits des Bands die Karte allein. Die Sichthöhe 110 m legt das Band auf
        // 134–270 m, jenseits jedes geregelten Radius; die Distanzen folgen der Wahrnehmung (dn 18 im Band, auch unter
        // Perf ×1,3 unter D1 + M; dn 36 jenseits), beide diesseits des Saums. ──
        const lodRef = st.lodRef > 0 ? st.lodRef : AR.LOD_DISTANCES.lodRef;
        const ZIEL_H = 110;
        const dBand = (18 * ZIEL_H) / lodRef,
            dKarte = (36 * ZIEL_H) / lodRef;
        let riesenEintrag = null;
        const rieseZustand = (e) => ({
            d: +dist(e).toFixed(1),
            stufe: e._lodLevel,
            partner: Number.isFinite(e._lodBandLevel) ? e._lodBandLevel : null,
            voll: stempel(e) < 0,
            da: r._archIsRendered(e),
        });
        const riese = async () => {
            const vorbild = karten().find((e) => kartenPreset(e) === "eiche" && r._foundrySichtHoehe("eiche", e, 1) > 0);
            if (!vorbild) return { fehlt: "keine Eiche mit bekannter Höhe" };
            const h0 = r._foundrySichtHoehe("eiche", vorbild, 1);
            const x = pm.x + dBand,
                z = pm.z;
            const e = r.spawnArchitecture("baum_eiche", { x, y: r._voxelSurfaceY(x, z), z }, {
                rotationY: 0,
                scale: ZIEL_H / h0,
                seed: vorbild.seed,
            });
            if (!e) return { fehlt: "Spawn verweigert" };
            riesenEintrag = e;
            const start = { x: pm.x, z: pm.z };
            let luecke = 0,
                takte = 0;
            const bis = async (n, fertig) => {
                for (let i = 0; i < n; i++) {
                    await tick(1);
                    if (takte++ > 0 && !r._archIsRendered(e)) luecke++;
                    if (fertig && fertig()) break;
                }
            };
            // das Band einschwingen: platziert, Höhe bekannt, Partner gedockt
            await bis(600, () => r._archIsRendered(e) && Number.isFinite(e._lodBandLevel));
            const sichtH = r._foundrySichtHoehe("eiche", e, e.scale);
            luecke = 0;
            await bis(20);
            const imBand = rieseZustand(e);
            // jenseits des Bands: der Spieler rückt vom Riesen weg, bis er dKarte entfernt steht
            stelle(e.position.x - dKarte, e.position.z);
            await bis(60);
            const jenseitsBand = rieseZustand(e);
            stelle(e.position.x - dBand, e.position.z);
            await bis(60, () => Number.isFinite(e._lodBandLevel));
            const zurueck = rieseZustand(e);
            stelle(start.x, start.z);
            return { sichtH: sichtH && +sichtH.toFixed(1), imBand, jenseitsBand, zurueck, luecke, takte };
        };
        res.D2 = await riese();
        // ── SELBSTTEST (3): kein Band jenseits des Radius (die Zonen-Klemme bis 05.10.: jenseits des Radius trug ein
        // Karten-Ding keinen Band-Partner) — D2 muss rot werden ──
        if (riesenEintrag) {
            const e = riesenEintrag;
            stelle(e.position.x - dBand, e.position.z);
            const BP = AR.prototype._foundryLodBandPartner;
            r._foundryLodBandPartner = function (en, d) {
                const R = this.state.architectureCullingRadius;
                return Number.isFinite(R) && d > R && this._archKartenPreset(en) ? null : BP.call(this, en, d);
            };
            await tick(60);
            res.S3 = rieseZustand(e);
            delete r._foundryLodBandPartner;
            await tick(60);
            res.S3.zurueck = rieseZustand(e);
            stelle(-900, -850);
            await tick(10);
        }

        // ── C: der Horizont — der Spieler zieht weiter, die Ferne räumt, die Karten-Zone trägt ──
        stelle(-900 + 320, -850);
        const zC = await einschwingen(240000);
        const jenseits = [];
        let nJ = 0,
            randMin = Infinity,
            randMax = -Infinity;
        for (const e of karten()) {
            const d = dist(e);
            const h = rand(e);
            randMin = Math.min(randMin, h);
            randMax = Math.max(randMax, h);
            if (d > h + TOT) {
                nJ++;
                if (r._archIsRendered(e) && jenseits.length < 6)
                    jenseits.push(`${e.type} @ ${d.toFixed(0)} m (Rand ${h.toFixed(0)} m) platziert`);
            }
        }
        res.C = { zone: zC, jenseitsN: nJ, jenseits, randMin, randMax, saum: AR.KARTEN_HORIZONT_SAUM_M };

        // ── SELBSTTEST (1): der alte Weg — kein Karten-Ding: jenseits der Mesh-Zone geräumt ──
        stelle(-900, -850);
        await einschwingen(120000);
        const D1 = r.constructor.prototype._archKartenPreset;
        const kandS1 = await uebergang(); // der Kandidat unter dem echten Weg (der Baum steht am Rand)
        let ruhtVor = 0;
        for (let i = 0; i < 900; i++) {
            await tick(1);
            const tw = r._standWache && r._standWache.takte.get("archCull");
            if (tw && tw.ruht > 0) { ruhtVor = i + 1; break; }
        }
        // die eingeschwungene Welt (wie im CI-Takt): der Stempel der Wache steht, nur ein Weckruf (`_weltRegt`) ändert ihn;
        // Regler, Ankünfte und Bau-Regung schweigen in diesen 30 Takten
        const PS = Object.getPrototypeOf(r);
        const s0 = r._standStempel();
        const w0 = r._weltRegung | 0;
        r._standStempel = function () {
            return (this._weltRegung | 0) === w0 ? s0 : PS._standStempel.call(this);
        };
        r._bauRegt = () => {};
        let gaenge = 0;
        r.tickArchitectureCulling = function () {
            const t = this._standWache && this._standWache.takte.get("archCull");
            const vor = t ? t.ruht : 0;
            const o = PS.tickArchitectureCulling.call(this);
            if (!t || t.ruht === vor) gaenge++;
            return o;
        };
        r._archKartenPreset = () => null;
        if (window.__fwWecken) r._weltRegt();
        await tick(30);
        res.S1ruhe = ruhtVor + " · Gänge des Culls in 30 Takten: " + gaenge;
        const s1A = formZensus();
        delete r._standStempel;
        delete r._bauRegt;
        delete r.tickArchitectureCulling;
        res.S1 = { A: s1A, D: await uebergang(), vorher: !kandS1.fehlt };
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
        `Karten-Zone ${A.radius} m bis zum Rand: ${A.ok}/${A.n} Karten-Dinge tragen ihre Gestalt (jenseits des Bands die Karte allein; ${A.riesen} Riesen im Band)` +
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
    // Die Ränder liegen im Saum und streuen über ihn (mindestens die halbe Breite): der Wald dünnt aus, kein Ring.
    const saumOk = C.randMin >= out.horizont - C.saum && C.randMax <= out.horizont && C.randMax - C.randMin >= C.saum / 2;
    check(
        "C HORIZONT",
        C.jenseitsN > 0 && C.jenseits.length === 0 && C.zone.n > 0 && C.zone.ok === C.zone.n && saumOk,
        `nach dem Umzug: ${C.jenseitsN} Karten-Dinge jenseits ihres Rands + ${out.totband} m, platziert: ${C.jenseits.length}` +
            (C.jenseits.length ? ` (${C.jenseits.join(" | ")})` : "") +
            ` · Ränder ${C.randMin.toFixed(1)}–${C.randMax.toFixed(1)} m (Saum ${out.horizont - C.saum}–${out.horizont})` +
            ` · Karten-Zone ${C.zone.ok}/${C.zone.n}` +
            (C.zone.taeter.length ? ` · Täter: ${C.zone.taeter.join(" | ")}` : "")
    );
    const D = out.D;
    const dOk = (x) =>
        !x.fehlt &&
        x.luecke === 0 &&
        x.draussen.gleich &&
        x.draussen.partner === null &&
        x.draussen.stufe === 2 &&
        x.drinnen.gleich &&
        !x.drinnen.voll &&
        x.drinnen.stufe === 2;
    check(
        "D ÜBERGANG",
        dOk(D),
        D.fehlt
            ? "kein Baum am Rand der Mesh-Zone"
            : `${D.typ} (${D.d0} m, Radius geregelt ${D.radius} m) → ${D.draussen.d} m (Radius ${D.draussen.radius}): Slots gleich ${D.draussen.gleich}, L${D.draussen.stufe}${D.draussen.partner !== null ? "+L" + D.draussen.partner : " allein"}` +
                  ` · zurück ${D.drinnen.d} m: Slots gleich ${D.drinnen.gleich}, voll ${D.drinnen.voll} · Takte ohne Gestalt ${D.luecke}/${D.takte}`
    );
    // D2: im Band der Partner (kein Voll-Stempel), jenseits die Karte allein, zurück wieder das Band — lückenlos.
    const R2 = out.D2 || { fehlt: "nicht gelaufen" };
    const mitBand = (z) => z && z.da && !z.voll && z.partner !== null && z.partner !== z.stufe;
    const kartAllein = (z) => z && z.da && z.stufe === 2 && z.partner === null;
    const zs = (z) => (z ? `${z.d} m L${z.stufe}${z.partner !== null ? "+L" + z.partner : ""}${z.voll ? " voll" : ""}` : "—");
    check(
        "D2 RIESE",
        !R2.fehlt && mitBand(R2.imBand) && kartAllein(R2.jenseitsBand) && mitBand(R2.zurueck) && R2.luecke === 0,
        R2.fehlt
            ? R2.fehlt
            : `Sichthöhe ${R2.sichtH} m · im Band ${zs(R2.imBand)} · jenseits ${zs(R2.jenseitsBand)} · zurück ${zs(R2.zurueck)}` +
                  ` · Takte ohne Gestalt ${R2.luecke}/${R2.takte}`
    );
    const s3 = out.S3;
    check(
        "SELBSTTEST 3 (kein Band jenseits des Radius — D2 rot)",
        !!s3 && !mitBand(s3) && mitBand(s3.zurueck),
        s3 ? `alt: ${zs(s3)} · wieder: ${zs(s3.zurueck)}` : "kein Riese"
    );
    const s1 = out.S1;
    console.log("  [Ruhe-Probe] der Cull-Gang ruhte vor dem Tausch nach " + out.S1ruhe + " Takten; Wecken " + !!process.env.FW_WECKEN);
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
