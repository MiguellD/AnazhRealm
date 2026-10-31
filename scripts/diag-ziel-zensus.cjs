#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-ziel-zensus.cjs — DER ZIEL-ZENSUS ALS WAND (gate:ziel-zensus, Auftrag 0710-1 P2 Familie HOST-VRAM)
//
// Jede GPU-Textur des Hosts hat ihren Leser, die Karte der Kaskade trägt keine Farbe (scripts/lib/ziel-zensus.cjs):
//   (a) ZENSUS — der echte Frame des Spiels (WebGPU auf swiftshader, Holz `kienspan`), n Frames der Bank-Runde: keine
//       Täter-Klasse fällt (ohne Leser · teilbar · volle Auflösung · Tiefe · Format), jede Textur trägt einen Erzeuger. Am Bach
//       der Mess-Wiese (`uferStellen`): ein Leser der Szenen-Tiefe zeichnet im Blick, sie MUSS im Fenster gelesen sein.
//   (b) KARTE OHNE FARBE — eine Schatten-Bühne in der Welt (Richtungslicht, ein r184-Schatten-Knoten durch die Hülle
//       `_kaskadenZiele`, wie jede Kaskade): der Schatten-Pass zeichnet ohne Farb-Anhang (die Farbe der Karte hat keine
//       GPU-Textur), der Schatten fällt (unter der Kiste dunkler als daneben), keine GPU-Validierung meldet sich.
//   (d) fiel mit K50: die Vortiefe der zeitlichen Auflösung lebt im Kanal a ihrer Geschichte (`_zeitAufloesung`), kein
//       eigenes Tiefen-Ziel und kein Kopier-Ruf mehr.
//   (c) SELBSTTEST IM FRAME — je Klasse ein eingeschmuggelter Täter nach jedem `_loopRender` (`__zielSchmuggel`): jeder
//       fällt beim Namen rot, nach dem Abbau steht kein Name des Selbsttests mehr im Zensus. Dazu ein eigenes
//       64-bit-Ziel, das sich für die Dauer als Szenen-Ziel ausweist (`__zielAusgabe`): AUSGABE-FORMAT nennt es beim Namen.
//   (r) DIE RUNDUNG DES AUSGABE-ZIELS (w4-ferne-blau): das Szenen-Ziel in 11/11/10 schreibt gedithert (`_ausgabeDither`). Echter
//       Frame: die Sonde lief, der Versatz der Ditherung passt zur Rundung des Geräts (gegen null 0, zum nächsten ½); drei
//       Frames unter der Bühne (der Szenen-Pass rendert einmal je Knoten-Frame): dieselbe Phase zweimal ist bit-gleich (die
//       Welt steht), die zweite Phase ändert das Ausgabe-Bild Pixel für Pixel (das Ziel trägt sie) und lässt sein Mittel
//       stehen (sie hebt nichts). Bis w4-ferne-blau hob ein Ausgleich das Mittel nach dem Lesen (W9).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil an gebauten Läufen — sauber grün, je Klasse ein
// Täter beim Namen.
//   node scripts/diag-ziel-zensus.cjs [--selftest]   (npm run gate:ziel-zensus)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, starteBrowser, uferStellen, taeterFaelle, selbsttestEnde, wandEnde, laufUhr } = require("./lib/welt-boot.cjs");
const { ladeSpec } = require("./lib/band-urteil.cjs");
const ZZ = require("./lib/ziel-zensus.cjs");

const N_FRAMES = 8;
// Der Schatten der Bühne: das Pixel unter der Kiste ist um mindestens so viel dunkler (Luma, 0–255) als das freie Licht.
const SCHATTEN_MIN = 12;
// Die Ditherung im Ausgabe-Bild: zwei Phasen ändern mindestens diesen Anteil der Pixel und das Mittel höchstens um so viele
// Luma-Stufen; dieselbe Phase zweimal ändert höchstens `ruhe` (am Bach bewegt sich die Welt um 0,1 %).
const DITHER = { anders: 0.05, mittel: 0.2, ruhe: 0.01 };

// Das Urteil der Wand über einen Lauf (rein).
function urteil(z) {
    const v = [];
    if (z.abbruch) v.push(`ABBRUCH: ${z.abbruch}`);
    for (const x of z.zensusRot || []) v.push("ZENSUS: " + x);
    if (!z.tiefeGelesen) v.push("ZENSUS: die Szenen-Tiefe trug im Fenster keinen Leser im Blick — die Wand ist blind für sie");
    const k = z.karte || {};
    if (!k.gelaufen) v.push("KARTE: die Schatten-Bühne lief nicht (die Wand ist blind für die Karte ohne Farbe)");
    else {
        if (!k.huelle) v.push("KARTE: der Schatten-Knoten der Bühne trägt die Hülle nicht (die Karte ohne Farbe ist blind)");
        if (k.farbeGpu) v.push("KARTE: die Farbe der Schatten-Karte trägt eine GPU-Textur — sie hat keinen Leser");
        if (!(k.farbAnhaenge === 0)) v.push(`KARTE: der Schatten-Pass zeichnet mit ${k.farbAnhaenge} Farb-Anhängen (Soll 0)`);
        if (!(k.schattenPaesse > 0)) v.push("KARTE: kein Schatten-Pass lief (die Probe ist blind)");
        if (!(k.dunkler >= SCHATTEN_MIN))
            v.push(`KARTE: unter der Kiste ist es nur ${k.dunkler} dunkler als daneben (Soll ≥ ${SCHATTEN_MIN}) — der Schatten fällt nicht`);
    }
    const rd = z.rundung || {};
    if (!rd.gelaufen) v.push("RUNDUNG: die Probe lief nicht (die Wand ist blind für die Ditherung)");
    else if (rd.format === "rg11b10ufloat") {
        if (!rd.rundung) v.push("RUNDUNG: die Sonde lief nicht — das Gerät schreibt 11/11/10, und keiner weiß, wie es rundet");
        else if (rd.versatz !== (rd.rundung === "gegen null" ? 0 : 0.5))
            v.push(`RUNDUNG: die Ditherung trägt den Versatz ${rd.versatz}, das Gerät rundet „${rd.rundung}“`);
        if (!(rd.ruhe <= DITHER.ruhe)) v.push(`RUNDUNG: dieselbe Phase ändert ${rd.ruhe} der Pixel — die Welt steht nicht, der Vergleich misst sie statt der Ditherung`);
        else if (!(rd.anders >= DITHER.anders))
            v.push(`RUNDUNG: zwei Phasen der Ditherung ändern ${rd.anders} der Pixel (Soll ≥ ${DITHER.anders}) — das Ziel trägt sie nicht`);
        else if (!(Math.abs(rd.mittel) <= DITHER.mittel)) v.push(`RUNDUNG: die Ditherung verschiebt das Mittel um ${rd.mittel} Stufen`);
    }
    for (const f of z.gpuFehler || []) v.push("GPU: " + f);
    const s = z.selbst || [];
    if (!s.length) v.push("SELBSTTEST: der Schmuggel lief nicht");
    for (const x of s) if (!x.ok) v.push(`SELBSTTEST: blind für ${x.muss}`);
    if ((z.rest || []).length) v.push(`SELBSTTEST: nach dem Abbau noch im Zensus: ${z.rest.join(", ")}`);
    return v;
}

function selbsttest() {
    const fehler = ZZ.selbsttest().map((s) => "Zensus-Urteil: " + s);
    const gruen = {
        zensusRot: [],
        tiefeGelesen: true,
        karte: { gelaufen: true, huelle: true, farbeGpu: false, farbAnhaenge: 0, schattenPaesse: 3, dunkler: 60 },
        gpuFehler: [],
        selbst: [{ muss: "OHNE LESER", ok: true }],
        rest: [],
        rundung: { gelaufen: true, format: "rg11b10ufloat", rundung: "gegen null", versatz: 0, ruhe: 0, anders: 0.4, mittel: 0.02 },
    };
    const faelle = [
        ["der grüne Lauf", () => {}],
        ["Täter im Zensus", (z) => (z.zensusRot = ["OHNE LESER: kaskade0:farbe"]), /ZENSUS: OHNE LESER/],
        ["kein Leser der Tiefe im Blick", (z) => (z.tiefeGelesen = false), /keinen Leser im Blick/],
        ["Farbe auf der GPU", (z) => (z.karte.farbeGpu = true), /trägt eine GPU-Textur/],
        ["Farb-Anhang im Schatten-Pass", (z) => (z.karte.farbAnhaenge = 1), /mit 1 Farb-Anhängen/],
        ["Schatten fällt nicht", (z) => (z.karte.dunkler = 1), /der Schatten fällt nicht/],
        ["Hülle fehlt", (z) => (z.karte.huelle = false), /trägt die Hülle nicht/],
        ["Bühne blind", (z) => (z.karte = {}), /lief nicht/],
        ["GPU-Validierung", (z) => (z.gpuFehler = ["Attachment state mismatch"]), /GPU: Attachment/],
        ["Schmuggel blind", (z) => (z.selbst = [{ muss: "TEILBAR", ok: false }]), /blind für TEILBAR/],
        ["Schmuggel bleibt", (z) => (z.rest = ["zensus-selbsttest:bloom"]), /noch im Zensus/],
        ["Sonde lief nicht", (z) => (z.rundung.rundung = null), /die Sonde lief nicht/],
        ["halber Versatz beim Runden gegen null", (z) => (z.rundung.versatz = 0.5), /Versatz 0.5, das Gerät rundet „gegen null“/],
        ["kein Versatz beim Runden zum nächsten", (z) => (z.rundung.rundung = "zum nächsten"), /rundet „zum nächsten“/],
        ["Ditherung erreicht das Ziel nicht", (z) => (z.rundung.anders = 0), /das Ziel trägt sie nicht/],
        ["Ditherung hebt das Mittel", (z) => (z.rundung.mittel = 1.5), /verschiebt das Mittel um 1.5/],
        ["die Welt steht nicht", (z) => (z.rundung.ruhe = 0.3), /die Welt steht nicht/],
        ["Rundungs-Probe blind", (z) => (z.rundung = {}), /RUNDUNG: die Probe lief nicht/],
    ];
    taeterFaelle(faelle, urteil, { fehler, gruen });
    return fehler;
}

if (process.argv.includes("--selftest")) {
    console.log("=== ZIEL-ZENSUS — Selbsttest (ohne Browser) ===");
    selbsttestEnde(selbsttest(), "das Urteil nennt jeden gebauten Täter beim Namen, der saubere Lauf bleibt grün.");
    process.exit(0);
}

const { vramAbgriff } = require("./lib/vram-abgriff.cjs");
const { FALTE_INSTALL, ZAEHLER_INSTALL } = require("./lib/draw-zaehler.cjs");
const { ZERLEGE_INSTALL } = require("./lib/zerlege-linse.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");

const server = statikServer();

// DIE SCHATTEN-BÜHNE (Seite): ein Richtungslicht mit einem r184-Schatten-Knoten, der durch die Hülle der Kaskaden geht
// (`_kaskadenZiele`), eine Kiste über einem Boden, eine Kamera von oben. Gezählt: die Farb-Anhänge jedes Passes, der in
// die Schatten-Karte zeichnet, und die GPU-Textur ihrer Farbe; das Bild: Luma unter der Kiste gegen freies Licht.
function karteOhneFarbe() {
    return (async () => {
        const T = window.THREE,
            TSL = T.TSL;
        const rend = st.renderer;
        const be = rend.backend;
        const aus = { gelaufen: false };
        const schattenAlt = rend.shadowMap.enabled;
        rend.shadowMap.enabled = true;
        const szene = new T.Scene();
        szene.name = "ziel-zensus:schatten-buehne";
        const licht = new T.DirectionalLight(0xffffff, 3);
        // schräges Licht (von +x): der Schatten der Kiste fällt links neben sie (Boden x ∈ [−8,5; −6]), sichtbar von oben
        licht.position.set(10, 20, 0);
        licht.castShadow = true;
        licht.shadow.mapSize.set(256, 256);
        Object.assign(licht.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 0.5, far: 50 });
        licht.shadow.camera.updateProjectionMatrix();
        const sn = TSL.shadow(licht, licht.shadow);
        licht.shadow.shadowNode = sn;
        r._kaskadenZiele({ _shadowNodes: [sn] });
        aus.huelle = Object.prototype.hasOwnProperty.call(sn, "setupRenderTarget");
        szene.add(licht, licht.target, new T.AmbientLight(0xffffff, 0.2));
        const boden = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardNodeMaterial({ color: 0xc8c8c8 }));
        boden.rotation.x = -Math.PI / 2;
        boden.receiveShadow = true;
        const kiste = new T.Mesh(new T.BoxGeometry(4, 4, 4), new T.MeshStandardNodeMaterial({ color: 0x806040 }));
        kiste.position.set(-4, 3, 0);
        kiste.castShadow = true;
        szene.add(boden, kiste);
        const kam = new T.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
        // BÜHNE: eigene Szene der Ziel-Bühne
        kam.position.set(0, 40, 0);
        kam.up.set(0, 0, -1);
        kam.lookAt(0, 0, 0);
        kam.updateMatrixWorld(true);
        const ziel = new T.RenderTarget(64, 64, { depthBuffer: true });
        ziel.texture.name = "ziel-zensus:schatten-bild";
        // die Pässe in die Schatten-Karte: ihre Tiefe ist die Karten-Tiefe (DepthTexture des Schatten-Ziels)
        let schattenPaesse = 0,
            farbAnhaenge = 0;
        const CE = GPUCommandEncoder.prototype;
        const brp = CE.beginRenderPass;
        CE.beginRenderPass = function (d) {
            const ds = d && d.depthStencilAttachment;
            const t = ds && window.__viewTex ? window.__viewTex.get(ds.view) : null;
            if (t && /^kaskade\d+:tiefe/.test(String(t.__vramK || "").replace(/^tex:/, ""))) {
                schattenPaesse++;
                farbAnhaenge += (d?.colorAttachments || []).filter(Boolean).length;
            }
            return brp.call(this, d);
        };
        try {
            for (let i = 0; i < 3; i++) {
                rend.setRenderTarget(ziel);
                rend.render(szene, kam);
            }
            rend.setRenderTarget(null);
            await be.device.queue.onSubmittedWorkDone();
            const px = await rend.readRenderTargetPixelsAsync(ziel, 0, 0, 64, 64);
            const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const zeile = u8.length / 64;
            const lum = (x, y) => luma709(u8, y * zeile + x * 4);
            // Draufsicht (rechts = +x, Spalte = (x + 10) / 20 · 64, Zeile 32 = z 0): der Schatten bei x = −7,25 (Spalte 9),
            // freies Licht bei x = +6 (Spalte 51)
            const schatten = lum(9, 32),
                frei = lum(51, 32);
            aus.dunkler = +(frei - schatten).toFixed(1);
            aus.luma = [+schatten.toFixed(1), +frei.toFixed(1)];
            const map = licht.shadow.map;
            aus.farbeGpu = !!(map?.texture && be.has(map.texture) && be.get(map.texture).texture);
            aus.schattenPaesse = schattenPaesse;
            aus.farbAnhaenge = farbAnhaenge;
            aus.gelaufen = true;
        } finally {
            CE.beginRenderPass = brp;
            rend.shadowMap.enabled = schattenAlt;
            ziel.dispose();
        }
        return aus;
    })();
}

function rundungProbe() {
    return (async () => {
        const rend = st.renderer,
            lu = r._ensureLodUniforms();
        const V = st._ausgabeVersatz;
        const aus = { gelaufen: true, format: st._ausgabeFormat || null, rundung: st._ausgabeRundung || null, versatz: V ? V.value : null };
        // DREI FRAMES UNTER DER BÜHNE: der Szenen-Pass rendert einmal je Knoten-Frame (r184 PassNode), darum schaltet jeder Frame
        // ihn selbst; die Bühne hält die Welt (die Bild-Uhr steht, Holz kienspan ohne Versatz) — nur das Rauschen wechselt.
        window.__buehne();
        await window.__ausgabeAufnahme(64, 48, 1, { satz: "messung" }); // die Erst-Ruhe
        const db = rend.getDrawingBufferSize(new window.THREE.Vector2()),
            [W, H] = [Math.round(db.x), Math.round(db.y)];
        const [phase, vorOut, vorZiel, nf] = [lu.uDitherT.value, rend.getOutputRenderTarget(), rend.getRenderTarget(), rend._nodes.nodeFrame];
        const b = [];
        try {
            for (const t of [0, 0, 0.5]) {
                const rt = new window.THREE.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
                lu.uDitherT.value = t;
                nf.update();
                rend.setOutputRenderTarget(rt);
                r._loopRender(); // zur Bild-Uhr (A9)
                rend.setOutputRenderTarget(vorOut);
                const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                b.push(px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px));
                rt.dispose();
            }
        } finally {
            lu.uDitherT.value = phase;
            rend.setOutputRenderTarget(vorOut);
            rend.setRenderTarget(vorZiel);
        }
        const zeile = b[0].length > W * 4 * H ? Math.ceil((W * 4) / 256) * 256 : W * 4; // WebGPU richtet Zeilen auf 256 Byte aus
        const vergleich = (p, q) => {
            let [n, d] = [0, 0];
            for (let i = 0, o = 0; i < W * H; i++, o = Math.floor(i / W) * zeile + (i % W) * 4) {
                if (p[o] !== q[o] || p[o + 1] !== q[o + 1] || p[o + 2] !== q[o + 2]) n++;
                d += luma709(q, o) - luma709(p, o); // die EINE Luma aus abnahme-urteil (AUSGABE_INSTALL)
            }
            return [+(n / (W * H)).toFixed(3), +(d / (W * H)).toFixed(3)];
        };
        const [anders, mittel] = vergleich(b[1], b[2]);
        return Object.assign(aus, { ruhe: vergleich(b[0], b[1])[0], anders, mittel });
    })();
}

(async () => {
    console.log("=== ZIEL-ZENSUS — die Wand am echten Frame (WebGPU auf swiftshader) ===");
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 900000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    await page.evaluateOnNewDocument(FALTE_INSTALL);
    await page.evaluateOnNewDocument(vramAbgriff);
    const log = laufUhr();
    let out = {};
    try {
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            await window.__weltDa((r) => {
                const st = r.state;
                return !!(st?.rendererReady && st.renderer?.backend && st.postProcessing && st.camera);
            });
            return { ok: true, ms: Math.round(performance.now() - t0), webgpu: st.renderer.backend.isWebGPUBackend === true };
        });
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend — der Zensus liest GPU-Befehle, die Wand wäre blind");
        log(`Renderer und Post-Kette bereit nach ${Math.round(bereit.ms / 1000)} s`);
        // DER LESER IM BLICK: das Wasser am Bach der Mess-Wiese zeichnet — die Szenen-Tiefe steht mit ihrem Leser im Zensus
        const ufer = await page.evaluate(uferStellen, { messort: ladeSpec("wiese").ort.spieler });
        if (ufer.fehler) throw new Error(ufer.fehler);
        log(`am Ufer ${JSON.stringify(ufer)}`);
        await page.evaluate(ZAEHLER_INSTALL);
        await page.evaluate(ZERLEGE_INSTALL);
        await page.evaluate(AUSGABE_INSTALL); // die Ruhe der Erst-Zeichnung (`__erstRuhe`), vor jedem Zensus
        await page.evaluate(ZZ.ZIEL_INSTALL);
        await page.evaluate(() => {
            st.renderer.setAnimationLoop(null);
            window.__gpuFehlerZ = [];
            st.renderer.backend.device.addEventListener("uncapturederror", (e) =>
                window.__gpuFehlerZ.push(String(e.error?.message || e.message || e).slice(0, 240))
            );
        });
        const zensus = () => ZZ.zensusDer(page, N_FRAMES); // der EINE Zensus der Seite (die Werkbank `ziele` liest ihn ebenso)
        // (c) der Schmuggel zuerst: jeder Täter beim Namen, danach restlos fort
        const s = await page.evaluate(() => window.__zielSchmuggel(true));
        if (!s || s.fehler) throw new Error("Schmuggel: " + (s?.fehler || "keine Antwort"));
        let mit;
        try {
            mit = await zensus();
        } finally {
            await page.evaluate(() => window.__zielSchmuggel(false));
        }
        const soll = [
            /OHNE LESER: zensus-selbsttest:ohne-leser/,
            /VOLLE AUFLÖSUNG: zensus-selbsttest:bloom/,
            /TEILBAR: zensus-selbsttest:paar-a und zensus-selbsttest:paar-b/,
            /DOPPELTE TIEFE: zensus-selbsttest:tiefe-kopie .* ist eine Kopie von depth,/,
            /FORMAT: zensus-selbsttest:f32 /,
        ];
        out.selbst = soll.map((m) => ({ muss: m.source, ok: mit.u.rot.some((x) => m.test(x)) }));
        // das ausgewiesene 64-bit-Szenen-Ziel: ROT auf einem Gerät mit rg11b10ufloat-renderable, sonst nennt der Zensus die
        // Adapter-Bedingung beim Namen
        if (mit.z?.geraet?.rg11b10)
            out.selbst.push({
                muss: "AUSGABE-FORMAT: zensus-selbsttest:ausgabe",
                ok: mit.u.rot.some((x) => /AUSGABE-FORMAT: zensus-selbsttest:ausgabe /.test(x)),
            });
        else
            out.selbst.push({
                muss: "ADAPTER … zensus-selbsttest:ausgabe",
                ok: mit.u.hinweis.some((x) => /ADAPTER: .*zensus-selbsttest:ausgabe /.test(x)),
            });
        log(`Schmuggel: ${out.selbst.filter((x) => x.ok).length} von ${out.selbst.length} Tätern beim Namen`);
        // (a) der Zensus des echten Frames
        const { z, u } = await zensus();
        out.zensusRot = u.rot;
        const tiefe = (z.ziele || []).find((x) => x.name === "szene:tiefenabbild");
        out.tiefeGelesen = !!tiefe && tiefe.ereignisse.some((e) => e.art === "R");
        out.rest = u.zeilen.filter((x) => /zensus-selbsttest/.test(x.name)).map((x) => x.name);
        log(
            `Zensus: ${u.zeilen.length} Texturen, ${z.frames} Frames, ${u.rot.length} rot, ${u.hinweis.length} Hinweise; ` +
                `Ruhe der Erst-Zeichnung ${z.erst ? z.erst.warteMs + " ms, offen " + z.erst.offen : "-"}`
        );
        if (process.env.ZIEL_ZENSUS_TABELLE) console.log(ZZ.zielTabelle(u, z));
        // (b) die Karte ohne Farbe
        out.karte = await page.evaluate(karteOhneFarbe);
        log(`Karte ohne Farbe: ${JSON.stringify(out.karte)}`);
        // (r) die Rundung des Ausgabe-Ziels am echten Frame
        out.rundung = await page.evaluate(rundungProbe);
        log(`Rundung: ${JSON.stringify(out.rundung)}`);
        out.gpuFehler = await page.evaluate(() => window.__gpuFehlerZ.slice(0, 5));
    } catch (e) {
        out.abbruch = e?.message || String(e);
    }
    await browser.close();
    server.close();
    const v = urteil(out);
    wandEnde(
        v,
        `kein Ziel ohne Leser, keine Klasse fällt; die Schatten-Karte zeichnet ohne Farbe (${out.karte.schattenPaesse} Pässe, ` +
            `0 Farb-Anhänge, Schatten ${out.karte.dunkler} dunkler); ` +
            `${out.selbst.length} eingeschmuggelte Täter beim Namen und restlos fort; die Ausgabe ` +
            `${out.rundung.format} rundet ${out.rundung.rundung || "-"}, die Ditherung (Versatz ${out.rundung.versatz}) ändert ` +
            `${out.rundung.anders} der Pixel bei Mittel ${out.rundung.mittel} Stufen.`
    );
})();
