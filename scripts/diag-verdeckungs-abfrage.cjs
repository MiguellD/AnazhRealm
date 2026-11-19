// diag-verdeckungs-abfrage.cjs — DIE LINSE DER VERDECKUNG (npm run gate:verdeckungs-abfrage; E7, die Sicht der Einheit).
//
// Wurzel: EIN Ort im Stamm entscheidet, ob ein Körper hinter dem steht, was das Bild schon zeigt (Bild/tiefe: die Pyramide aus
// der opaken Tiefe, das Gesetz `verdeckt`, der Haufen-Schnitt der Bau-Sätze in zwei Zügen). Der Berg aus der Makro-Höhe und
// der Query-Kasten „Wald-vor-Wald" (occlusionTest, sein Wirt im Pass-Bruch) fielen mit ihr; die Linse ihrer Abfrage wurde die
// Linse der Sicht.
//
// Die Linse (echter Frame, WebGPU auf swiftshader, holz=kienspan, 320 × 180), durch den echten Spiel-Takt (`_gameLoopTick`):
//   V  VERDECKT: ein Studio-Haus (Bau-Satz) 30 m vor dem Auge, eine Wand 12 m vor dem Auge, die den ganzen Schirm deckt — nach
//      dem Einschwingen zeichnet KEIN Haufen hinter der Wand, weder früh noch spät (nicht vakuös: Haufen hinter der Wand stehen
//      in der Tafel, die Bilder trugen die Pyramide, jedes Bild brach, die Wand zeichnete).
//   F  FREI: die Wand fällt — im ERSTEN Bild danach verdeckt der frühe Zug die Haufen noch (die Pyramide des letzten Bilds trägt
//      die Wand), der späte zeichnet sie: jeder Haufen, den drei Bilder später das eingeschwungene Bild zeichnet, stand schon im
//      ersten (0 Pop).
//   S  SELBSTTEST AM ECHTEN FRAME: BLIND (der frühe Zug prüft nie — jedes Bild ohne Pyramide) macht V ROT „HAUFEN TROTZ VOLLER
//      VERDECKUNG GEZEICHNET"; OHNE SPÄTEN ZUG (sein Auftrag nach dem Bruch geleert) macht F ROT „POP".
//   In jeder Phase ROT bei jedem WebGPU-Validierungsfehler beim Namen: `uncapturederror`, die GPU-Wache des Stamms und jeder
//   Seitenfehler. Gezählt wird in gerenderten Frames (die GPU-Leine), nie in Wanduhr-Wartezeiten (CI-Soll ≤ 3 min).
//   --selftest (Node): das Urteil nennt jeden Täter und jede vakuöse Phase beim Namen.
//
//   node scripts/diag-verdeckungs-abfrage.cjs [--selftest]
"use strict";

const PHASEN = ["boot", "verdeckt", "frei"];

// Das Urteil einer Verdeckt-Phase (auch im Selbsttest am echten Frame).
function urteilVerdeckt(V, marke) {
    const v = [];
    const z = V.z;
    if (!(z.haufen > 0)) v.push(`${marke} VAKUÖS: kein Haufen eines Bau-Satzes hinter der Wand`);
    if (!(z.wand > 0)) v.push(`${marke} VAKUÖS: die Wand zeichnete nie`);
    if (!(z.frisch > 0)) v.push(`${marke} VAKUÖS: kein Bild trug die Pyramide`);
    if (z.ohneBruch > 0) v.push(`${marke}: ${z.ohneBruch} Bilder ohne Bruch (der späte Zug blieb leer)`);
    if (z.gezeichnet > 0)
        v.push(
            `HAUFEN TROTZ VOLLER VERDECKUNG GEZEICHNET (${marke}): ${z.gezeichnet} von ${z.haufen} Haufen hinter der Wand ` +
                `(früh ${z.frueh}, spät ${z.spaet})`
        );
    return v;
}

// Das Urteil einer Frei-Phase.
function urteilFrei(F, marke) {
    const v = [];
    const z = F.z;
    if (!(z.haufen > 0)) v.push(`${marke} VAKUÖS: kein Haufen hinter der Wand`);
    if (!(z.frueh0Verdeckt > 0))
        v.push(`${marke} VAKUÖS: der frühe Zug verdeckte im ersten Bild nichts (die Wand stand nicht in der Pyramide)`);
    if (!(z.gezeichnet3 > 0)) v.push(`${marke} VAKUÖS: das eingeschwungene Bild zeichnet keinen Haufen hinter der Wand`);
    if (z.pop > 0)
        v.push(
            `POP (${marke}): ${z.pop} von ${z.gezeichnet3} Haufen fehlten im ersten Bild nach dem Fall der Wand ` +
                `(gezeichnet ${z.gezeichnet0}, davon spät ${z.spaet0})`
        );
    return v;
}

// Das Urteil: aus dem Befund je Phase die Verletzungen (leer = GRÜN).
function urteil(out) {
    const v = [];
    if (out.abbruch) v.push(`ABBRUCH: ${out.abbruch}`);
    const P = out.phasen || {};
    for (const ph of PHASEN) {
        const p = P[ph];
        if (!p) {
            if (!out.abbruch) v.push(`${ph.toUpperCase()}: Phase fehlt`);
            continue;
        }
        for (const [msg, n] of Object.entries(p.gpu || {})) v.push(`${ph.toUpperCase()} GPU-VALIDIERUNG ${n}×: ${msg}`);
        for (const [msg, n] of Object.entries(p.wache || {})) v.push(`${ph.toUpperCase()} GPU-WACHE ${n}×: ${msg}`);
        for (const [msg, n] of Object.entries(p.seite || {})) v.push(`${ph.toUpperCase()} SEITENFEHLER ${n}×: ${msg}`);
    }
    if (P.verdeckt?.z) v.push(...urteilVerdeckt(P.verdeckt, "VERDECKT"));
    if (P.frei?.z) v.push(...urteilFrei(P.frei, "FREI"));
    // der Selbsttest am echten Frame: die Mutanten fallen beim Namen
    const S = out.selbst;
    if (S) {
        if (!S.blind?.z || !urteilVerdeckt(S.blind, "BLIND").some((x) => x.startsWith("HAUFEN TROTZ VOLLER VERDECKUNG")))
            v.push("SELBSTTEST VAKUÖS: der blinde frühe Zug zeichnete hinter der Wand nicht");
        if (!S.ohneSpaet?.z || !urteilFrei(S.ohneSpaet, "OHNE SPÄT").some((x) => x.startsWith("POP")))
            v.push("SELBSTTEST VAKUÖS: ohne späten Zug fehlte im ersten Bild kein Haufen");
    } else if (!out.abbruch) v.push("SELBSTTEST fehlt");
    return v;
}

function selbsttest() {
    const fehlerfrei = () => ({ gpu: {}, wache: {}, seite: {} });
    const sauber = () => ({
        phasen: {
            boot: fehlerfrei(),
            verdeckt: {
                ...fehlerfrei(),
                z: { haufen: 40, wand: 6, frisch: 5, ohneBruch: 0, gezeichnet: 0, frueh: 0, spaet: 0 },
            },
            frei: {
                ...fehlerfrei(),
                z: { haufen: 40, frueh0Verdeckt: 40, gezeichnet0: 31, spaet0: 31, gezeichnet3: 22, pop: 0 },
            },
        },
        selbst: {
            blind: { z: { haufen: 40, wand: 6, frisch: 0, ohneBruch: 0, gezeichnet: 40, frueh: 40, spaet: 0 } },
            ohneSpaet: { z: { haufen: 40, frueh0Verdeckt: 40, gezeichnet0: 0, spaet0: 0, gezeichnet3: 22, pop: 22 } },
        },
    });
    const faelle = [
        ["sauber", (o) => o, null],
        [
            "Verdeckt: gezeichnet",
            ["phasen.verdeckt.z.gezeichnet=", 7],
            /HAUFEN TROTZ VOLLER VERDECKUNG GEZEICHNET \(VERDECKT\): 7 von 40/,
        ],
        ["Verdeckt: ohne Haufen", ["phasen.verdeckt.z.haufen=", 0], /VERDECKT VAKUÖS: kein Haufen/],
        ["Verdeckt: Wand nie", ["phasen.verdeckt.z.wand=", 0], /VERDECKT VAKUÖS: die Wand zeichnete nie/],
        ["Verdeckt: ohne Pyramide", ["phasen.verdeckt.z.frisch=", 0], /VERDECKT VAKUÖS: kein Bild trug die Pyramide/],
        ["Verdeckt: ohne Bruch", ["phasen.verdeckt.z.ohneBruch=", 2], /VERDECKT: 2 Bilder ohne Bruch/],
        ["Frei: Pop", ["phasen.frei.z.pop=", 5], /POP \(FREI\): 5 von 22 Haufen fehlten/],
        ["Frei: nichts früh verdeckt", ["phasen.frei.z.frueh0Verdeckt=", 0], /FREI VAKUÖS: der frühe Zug verdeckte/],
        ["Frei: nichts eingeschwungen", ["phasen.frei.z.gezeichnet3=", 0], /FREI VAKUÖS: das eingeschwungene Bild/],
        [
            "Boot: ein Fehler",
            (o) => (o.phasen.boot.gpu["Destroyed buffer"] = 1),
            /BOOT GPU-VALIDIERUNG 1×: Destroyed buffer/,
        ],
        [
            "Frei: Validierung",
            (o) => (o.phasen.frei.gpu["Binding size is smaller than the minimum binding size"] = 3),
            /FREI GPU-VALIDIERUNG 3×: Binding size/,
        ],
        [
            "Verdeckt: Wache",
            (o) => (o.phasen.verdeckt.wache["three: Indirect buffer"] = 1),
            /VERDECKT GPU-WACHE 1×: three: Indirect buffer/,
        ],
        ["Phase fehlt", ["phasen.frei"], /FREI: Phase fehlt/],
        ["Selbsttest blind sieht", ["selbst.blind.z.gezeichnet=", 0], /SELBSTTEST VAKUÖS: der blinde frühe Zug/],
        ["Selbsttest ohne Spät heil", ["selbst.ohneSpaet.z.pop=", 0], /SELBSTTEST VAKUÖS: ohne späten Zug/],
        ["Selbsttest fehlt", ["selbst"], /SELBSTTEST fehlt/],
        ["Abbruch", ["abbruch=", "Renderer stand nicht"], /ABBRUCH: Renderer stand nicht/],
    ];
    const W = require("./lib/welt-boot.cjs");
    W.selbsttestEnde(
        W.taeterFaelle(faelle, urteil, { klon: sauber }),
        `${faelle.length} Fälle: jeder Täter, jede vakuöse Phase und jeder blinde Mutant beim Namen`
    );
    process.exit(0);
}

if (process.argv.includes("--selftest")) selbsttest();

const { statikServer, nullWelt, selbsttest: selbstMarke, laufUhr, fehlerText, rotListe } = require("./lib/welt-boot.cjs");

const server = statikServer();

// Vor jedem Seiten-Skript: die Fehler je Phase (Device-Meldung und Seitenfehler; die Phase setzt die Linse).
function sammlerInstall() {
    const S = (window.__verdeckung = { phase: "boot", gpu: {}, seite: {} });
    const buche = (art, msg) => {
        const p = S[art][S.phase] || (S[art][S.phase] = {});
        const k = String(msg).split("\n")[0].slice(0, 160);
        p[k] = (p[k] || 0) + 1;
    };
    S.buche = buche;
    if (typeof GPUAdapter !== "undefined") {
        const rd = GPUAdapter.prototype.requestDevice;
        GPUAdapter.prototype.requestDevice = async function (d) {
            const dev = await rd.call(this, d);
            try {
                dev.addEventListener("uncapturederror", (ev) => buche("gpu", ev.error?.message || ev.error));
            } catch {}
            return dev;
        };
    }
    window.addEventListener("error", (e) => buche("seite", e.error?.message || e.message));
    window.addEventListener("unhandledrejection", (e) => buche("seite", e.reason?.message || e.reason));
}

// Seite: der Ort — ein Studio-Haus 30 m vor dem Auge (Ego-Sicht, der Spieler steht), gebaut durch den echten Takt.
async function sichtOrt() {
    const rend = st.renderer;
    const be = rend.backend;
    const nf = rend._nodes && rend._nodes.nodeFrame;
    rend.setAnimationLoop(null);
    let tMs = performance.now();
    const takt = async () => {
        tMs += 16.7;
        if (nf) nf.update();
        r._gameLoopTick(tMs);
        try {
            await be.device.queue.onSubmittedWorkDone();
        } catch {}
        await sleep(0);
    };
    window.__sichtTakt = takt;
    const p = st.playerMesh.position;
    let haus = null;
    for (let a = 0; a < 8 && !haus; a++) {
        const yaw = (a * Math.PI) / 4;
        const hx = p.x + Math.sin(yaw) * 30,
            hz = p.z + Math.cos(yaw) * 30;
        if (!r._landAt(hx, hz, 0.2)) continue;
        const e = r.spawnArchitecture(
            "haus_alemannisch",
            { x: hx, y: r.getTerrainHeightAt(hx, hz) + 0.5, z: hz },
            { silent: true, seed: 4711 }
        );
        if (e) haus = { e, yaw };
    }
    if (!haus) throw new Error("kein Land für das Haus in 30 m");
    r.setCameraMode("first");
    st.yaw = haus.yaw;
    st.pitch = -0.04;
    await __gebautNach(haus.e, { takt });
    for (let i = 0; i < 20; i++) await takt();
    window.__sichtHaus = haus.e;
    return { haus: [Math.round(haus.e.position.x), Math.round(haus.e.position.z)], yaw: haus.yaw };
}

// Seite: eine Phase der Linse. `opts.phase` = verdeckt | frei, `opts.mutant` = blind | ohneSpaet (Selbsttest am echten Frame).
async function sichtPhase(opts) {
    const T3 = window.THREE;
    const rend = st.renderer;
    const be = rend.backend;
    const dev = be.device;
    const S = window.__verdeckung;
    const W = r._gpuWache || (r._gpuWache = { n: 0, meldungen: [] });
    const wacheVor = W.n;
    const kopfVor = new Set(W.meldungen.map((m) => m.kopf));
    const marke = (opts.mutant ? opts.mutant + ":" : "") + opts.phase;
    S.phase = marke;
    const takt = window.__sichtTakt;
    const cam = st.camera;
    const NIE = 0xffffffff;
    // die Wand: 12 m vor dem Auge, 200 × 120 m, opak (sie schreibt Tiefe) — sie deckt den ganzen Schirm
    let wand = window.__sichtWand;
    if (!wand) {
        const m = new T3.MeshBasicNodeMaterial({ color: 0x777777, side: T3.DoubleSide });
        wand = window.__sichtWand = new T3.Mesh(new T3.PlaneGeometry(200, 120), m);
        wand.name = "sicht-wand";
        wand.frustumCulled = false;
        st.scene.add(wand);
    }
    const auge = new T3.Vector3().setFromMatrixPosition(cam.matrixWorld);
    const vorn = new T3.Vector3();
    cam.getWorldDirection(vorn);
    const WAND_M = 12;
    // DIE LESUNG EINES BILDS: je Satz der frühe und der späte Auftrag und je Haufen ihr Ziel; „hinter der Wand" heißt jede Ecke
    // weiter als die Wand (+1 m) längs des Blicks. Die Kennung eines Haufens: seine Zelle und sein Rang in ihr.
    const lesen = async () => {
        const T = r._sichtTiefeZ;
        const jobs = T ? T.auftraege.slice() : [];
        const roh = [];
        const enc = dev.createCommandEncoder({ label: "linse:sicht" });
        const kopie = (puffer, bytes) => {
            const rb = dev.createBuffer({ size: Math.max(16, bytes), usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
            enc.copyBufferToBuffer(puffer, 0, rb, 0, bytes);
            roh.push(rb);
            return rb;
        };
        const teile = jobs.map((V) => ({
            V,
            af: kopie(be.get(V.auftrag).buffer, 32),
            as: kopie(be.get(V.spaet.auftrag).buffer, 32),
            zf: V.n ? kopie(V.zielPuffer, V.n * 4) : null,
            zs: V.n ? kopie(V.spaet.zielPuffer, V.n * 4) : null,
        }));
        dev.queue.submit([enc.finish()]);
        const u32 = async (rb) => {
            if (!rb) return new Uint32Array(0);
            await rb.mapAsync(GPUMapMode.READ);
            const a = new Uint32Array(rb.getMappedRange().slice(0));
            rb.unmap();
            return a;
        };
        const aus = { haufen: 0, frueh: 0, spaet: 0, verdecktFrueh: 0, gezeichnet: new Set() };
        for (const t of teile) {
            const [af, as, zf, zs] = [await u32(t.af), await u32(t.as), await u32(t.zf), await u32(t.zs)];
            const V = t.V;
            const tafel = V.tafel;
            const rang = new Map();
            for (let i = 0; i < V.n; i++) {
                const z = V.haufenZelle[i];
                const k = (rang.get(z) || 0) + 1;
                rang.set(z, k);
                let naechste = Infinity;
                for (let c = 0; c < 8; c++) {
                    const x = tafel[i * 8 + (c & 1 ? 4 : 0)] - auge.x,
                        y = tafel[i * 8 + 1 + (c & 2 ? 4 : 0)] - auge.y,
                        w = tafel[i * 8 + 2 + (c & 4 ? 4 : 0)] - auge.z;
                    naechste = Math.min(naechste, x * vorn.x + y * vorn.y + w * vorn.z);
                }
                if (!(naechste > WAND_M + 1)) continue;
                aus.haufen++;
                const f = af[0] > 0 && zf[i] !== NIE;
                const s = as[0] > 0 && zs[i] !== NIE;
                if (f) aus.frueh++;
                else aus.verdecktFrueh++;
                if (s) aus.spaet++;
                if (f || s) aus.gezeichnet.add(z.bereich.key + "|" + z.bereich.zellen.indexOf(z) + "|" + k);
            }
        }
        for (const rb of roh) rb.destroy();
        return aus;
    };
    // die Mutanten des Selbsttests: BLIND (jedes Bild ohne Pyramide) · OHNE SPÄT (der späte Auftrag nach dem Bruch geleert)
    const beginnRoh = r._sichtTiefeBeginn;
    const bruchRoh = r._sichtTiefeBruch;
    const blind = () => {
        r._sichtTiefeBeginn = function (k) {
            const ok = beginnRoh.call(this, k);
            if (this._sichtTiefeZ) this._sichtTiefeZ.frisch = false;
            return ok;
        };
    };
    const ohneSpaet = () => {
        r._sichtTiefeBruch = function (enc, A) {
            const T = this._sichtTiefeZ;
            const jobs = T && T.bruchOffen ? T.auftraege.slice() : [];
            bruchRoh.call(this, enc, A);
            for (const V of jobs) enc.clearBuffer(be.get(V.spaet.auftrag).buffer, 0, 32);
        };
    };
    const zahl = () => r._sichtTiefeZahl() || { bilder: 0, ohneTiefe: 0, ohneBruch: 0 };
    const aus = { phase: marke };
    try {
        if (opts.phase === "verdeckt") {
            if (opts.mutant === "blind") blind();
            // die Wand steht 12 m vor dem Auge, dem Auge zugewandt; sie zeichnet, wenn ihr Stoff steht
            wand.position.copy(auge).addScaledVector(vorn, WAND_M);
            wand.lookAt(auge);
            wand.visible = true;
            let wandZuege = 0;
            const dv = be.draw;
            be.draw = function (ro, info) {
                if (ro.object === wand && this.get(ro.pipeline).error !== true) wandZuege++;
                return dv.call(this, ro, info);
            };
            try {
                for (let i = 0; i < 200 && wandZuege < 1; i++) await takt();
                const z0 = zahl();
                for (let i = 0; i < 5; i++) await takt();
                const z1 = zahl();
                const l = await lesen();
                aus.z = {
                    haufen: l.haufen,
                    wand: wandZuege,
                    frisch: z1.bilder - z1.ohneTiefe - (z0.bilder - z0.ohneTiefe),
                    ohneBruch: z1.ohneBruch - z0.ohneBruch,
                    gezeichnet: l.gezeichnet.size,
                    frueh: l.frueh,
                    spaet: l.spaet,
                };
            } finally {
                be.draw = dv;
            }
        } else {
            // FREI: die Wand fällt; das erste Bild danach, dann drei weitere
            wand.visible = false;
            if (opts.mutant === "ohneSpaet") ohneSpaet();
            await takt();
            const l0 = await lesen();
            r._sichtTiefeBruch = bruchRoh;
            for (let i = 0; i < 3; i++) await takt();
            const l3 = await lesen();
            let pop = 0;
            for (const k of l3.gezeichnet) if (!l0.gezeichnet.has(k)) pop++;
            aus.z = {
                haufen: l0.haufen,
                frueh0Verdeckt: l0.verdecktFrueh,
                gezeichnet0: l0.gezeichnet.size,
                spaet0: l0.spaet,
                gezeichnet3: l3.gezeichnet.size,
                pop,
            };
        }
    } catch (e) {
        aus.fehler = fehlerText(e);
    } finally {
        r._sichtTiefeBeginn = beginnRoh;
        r._sichtTiefeBruch = bruchRoh;
        delete r._sichtTiefeBeginn;
        delete r._sichtTiefeBruch;
    }
    // die Nachläufer der Phase (asynchron) noch in ihr buchen
    for (let i = 0; i < 2; i++) await takt();
    S.phase = "zwischen";
    aus.gpu = S.gpu[marke] || {};
    aus.seite = S.seite[marke] || {};
    aus.wache = {};
    if (W.n > wacheVor)
        for (const m of W.meldungen)
            if (!kopfVor.has(m.kopf)) aus.wache[`${m.quelle}: ${m.kopf}`] = (aus.wache[`${m.quelle}: ${m.kopf}`] || 0) + 1;
    return aus;
}

(async () => {
    console.log("=== VERDECKUNG — die Sicht der Einheit: Haus hinter der Wand, die Wand fällt (WebGPU auf swiftshader) ===");
    const log = laufUhr();
    const { browser, page } = await nullWelt(server, { art: "linse", bild: true, frist: 1200000, fenster: { width: 320, height: 180 }, vor: sammlerInstall }, 60000, "index.html?holz=kienspan"); // prettier-ignore
    const out = { phasen: {} };
    try {
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            await __weltDa((r) => {
                const st = r.state;
                return !!(st?.rendererReady && st.renderer?.backend && st.camera && st.playerMesh);
            });
            return { ms: Math.round(performance.now() - t0), webgpu: st.renderer.backend.isWebGPUBackend === true };
        });
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend — die Sicht rechnet auf WebGPU, die Linse wäre blind");
        log(`Renderer und Welt bereit nach ${Math.round(bereit.ms / 1000)} s`);
        const ort = await page.evaluate(sichtOrt);
        out.phasen.boot = await page.evaluate(() => {
            const S = window.__verdeckung;
            S.phase = "zwischen";
            const W = r._gpuWache || { n: 0, meldungen: [] };
            const wache = {};
            for (const m of W.meldungen) wache[`${m.quelle}: ${m.kopf}`] = 1;
            return { gpu: S.gpu.boot || {}, seite: S.seite.boot || {}, wache };
        });
        log(`Ort: Haus ${JSON.stringify(ort.haus)}, Blick ${ort.yaw.toFixed(2)} rad`);
        for (const phase of ["verdeckt", "frei"]) {
            const p = await page.evaluate(sichtPhase, { phase });
            if (p.fehler) throw new Error(`${phase}: ${p.fehler}`);
            out.phasen[phase] = p;
            const fehler = Object.keys(p.gpu).length + Object.keys(p.wache).length + Object.keys(p.seite).length;
            log(`${phase.toUpperCase()}: ${JSON.stringify(p.z)} · ${fehler ? fehler + " Täter" : "0 Fehler"}`);
        }
        // S: der Selbsttest am echten Frame — die Mutanten
        out.selbst = {};
        selbstMarke("S (blind · ohne späten Zug)");
        out.selbst.blind = await page.evaluate(sichtPhase, { phase: "verdeckt", mutant: "blind" });
        log(`SELBSTTEST blind: ${JSON.stringify(out.selbst.blind.z)}`);
        await page.evaluate(sichtPhase, { phase: "verdeckt" });
        out.selbst.ohneSpaet = await page.evaluate(sichtPhase, { phase: "frei", mutant: "ohneSpaet" });
        log(`SELBSTTEST ohne späten Zug: ${JSON.stringify(out.selbst.ohneSpaet.z)}`);
    } catch (e) {
        out.abbruch = fehlerText(e);
    }
    await browser.close();
    server.close();
    const v = urteil(out);
    log(v.length ? "ROT" : "GRÜN");
    rotListe(v);
    const V = out.phasen.verdeckt.z,
        F = out.phasen.frei.z;
    console.log(
        `\n✅ GRÜN — hinter der Wand ${V.haufen} Haufen, 0 gezeichnet (${V.frisch} Bilder mit Pyramide, jedes brach); die Wand ` +
            `fiel: im ersten Bild ${F.frueh0Verdeckt} früh verdeckt, ${F.spaet0} spät gezeichnet, 0 Pop gegen ${F.gezeichnet3} ` +
            `eingeschwungene; blind fällt „HAUFEN TROTZ VOLLER VERDECKUNG GEZEICHNET“, ohne späten Zug „POP“ — 0 WebGPU-` +
            `Validierungsfehler, 0 Seitenfehler.`
    );
})();
