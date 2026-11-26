// Das Bildpaar Ebbe ↔ Flut am Nordsee-Watt (Zensus Rang 6) — swiftshader, der WebGL2-Rückfall der Welt (`__anazhForceWebGL`),
// die Ausgabe-Aufnahme (scripts/lib/ausgabe-aufnahme.cjs), gleiche Kamera, die Gezeit über die Uhr der Prozesse gestellt.
// Dazu der Preis: je Stufe des Spiegels die neu gebauten Chunks, Takte und Wand-ms bis zur Ruhe — mit Gezeit ↔ ohne (der
// Takt ohne Uhr-Sprung).  node gezeit-bild.cjs <ausgabe-ordner>
"use strict";
const path = require("path");
const fs = require("fs");
const WURZEL = "/home/user/AnazhRealm";
const WB = require(path.join(WURZEL, "scripts/lib/welt-boot.cjs"));
const { AUSGABE_INSTALL } = require(path.join(WURZEL, "scripts/lib/ausgabe-aufnahme.cjs"));
const AUS = path.resolve(process.argv[2] || ".");
const W = 960, H = 540;
const KAM = { p: [0, 40, 10390], l: [0, -3, 10620] };
const server = WB.statikServer();

const offenText = `(() => { const st = r.state; return (st.dirtyVoxelChunks ? st.dirtyVoxelChunks.size : 0) + (st.voxelMeshPending ? st.voxelMeshPending.size : 0) + (r._bodenImFlug | 0) + (r._bodenTeile ? r._bodenTeile.length : 0) + (st.fernRing && st.fernRing.wasserLauf ? 1 : 0); })`;

WB.hauptLauf(async () => {
    const t0 = Date.now();
    const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)} s]`, ...a);
    const { browser, page } = await WB.nullWelt(server, { art: "webgl", bild: true, fenster: { width: W, height: H }, vor: [() => (window.__anazhForceWebGL = true)], frist: 1800000 }, 180000, "index.html?holz=" + (process.env.HOLZ || "kienspan"));
    log("Adapter", browser.adapter);
    await page.evaluate(() => __weltDa(() => r && r.state && r.state.rendererReady === true));
    await page.evaluate(AUSGABE_INSTALL);
    const be = await page.evaluate(() => ({ gl: !!r.state.renderer.backend.isWebGLBackend, gpu: !!r.state.renderer.backend.isWebGPUBackend }));
    log("Backend", JSON.stringify(be));
    // an die Bucht: der Spieler auf dem Watt, der natürliche Loop streamt — die Uhr steht dabei (die Bühne: Tag-Länge 10¹² min),
    // sonst wechselt die Gezeit je ~8 s Spielzeit eine Stufe und swiftshader holt den Neubau nie ein
    await page.evaluate(() => {
        const st = r.state;
        __buehne({ uhr: 0.5 });
        st.playerMesh.position.set(0, r._voxelSurfaceY(0, 10590) + 1.8, 10590); // auf dem Watt (die Probe hält ihn: sie taktet nur, bis der Bau ruht)
    });
    // der Strom steht: die Zahl der Chunks hält 5 Proben (10 s) und nichts ist offen — beide Bilder tragen denselben Ring
    let alt = -1, gleich = 0;
    for (let i = 0; i < 300; i++) {
        const s = await page.evaluate(`({ n: r.state.voxelChunks ? r.state.voxelChunks.size : 0, offen: ${offenText}() })`);
        if (i % 10 === 0) log("Strom", JSON.stringify(s));
        gleich = s.n === alt && s.offen === 0 ? gleich + 1 : 0;
        alt = s.n;
        if (gleich >= 5) { log("Strom steht", JSON.stringify(s)); break; }
        await WB.sleep(2000);
    }
    // die Bühne: Mittag, Sonne, Sommer, die Uhr steht (der Loop ruht ab hier, die Probe taktet selbst)
    await page.evaluate(() => {
        r.state.renderer.setAnimationLoop(null);
        __buehne({ uhr: 0.5 });
    });
    // der Ring der Chunks steht: die Probe taktet, bis seine Zahl 30 Takte hält und nichts offen ist (beide Bilder, derselbe Ring)
    const ring = await page.evaluate(async (offenT) => {
        const st = r.state, offen = (0, eval)(offenT);
        let alt = -1, gleich = 0, n = 0;
        for (; n < 4000 && gleich < 30; n++) {
            r._gameLoopTick(performance.now());
            const c = st.voxelChunks ? st.voxelChunks.size : 0;
            gleich = c === alt && !offen() ? gleich + 1 : 0;
            alt = c;
            await new Promise((f) => setTimeout(f, 0));
        }
        return { takte: n, chunks: alt };
    }, offenText);
    log("Ring steht", JSON.stringify(ring));
    // die Gezeit zur Stunde H der Welt-Uhr (der Tag der Prozesse), der Takt des Pegels trägt sie, die Chunks bauen neu
    const stelle = (Hh, sprung) =>
        page.evaluate(
            async (Hh, sprung, offenT) => {
                const st = r.state, R = (v) => Math.round(v * 100) / 100, offen = (0, eval)(offenT);
                const tagAlt = st.dayLengthMinutes;
                st.dayLengthMinutes = AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES;
                r._kalenderZeit();
                const vor = r._gezeitStunde();
                if (sprung) st.spielZeit += ((Hh - vor) * r._kalender().normS) / 24;
                const kVor = r._gelaende().gezeit.k;
                r._pegelTakt();
                const markiert = st.dirtyVoxelChunks ? st.dirtyVoxelChunks.size : 0;
                st.dayLengthMinutes = tagAlt;
                r._kalenderZeit();
                const t0 = performance.now();
                let n = 0, tmax = 0, tsum = 0;
                while (offen() && n < 900) {
                    const s = performance.now();
                    r._gameLoopTick(performance.now());
                    const d = performance.now() - s;
                    tsum += d;
                    if (d > tmax) tmax = d;
                    n++;
                    await new Promise((f) => setTimeout(f, 0));
                }
                const quer = [];
                for (let t = 0; t <= 10; t++) quer.push(r._nassAt(0, 10430 + 40 * t) ? 1 : 0);
                return { H: Hh, stunde: R(r._gezeitStunde()), kVor, k: r._gelaende().gezeit.k, markiert, takte: n, wandMs: R(performance.now() - t0), tickMax: R(tmax), tickSumme: R(tsum), quer: quer.join(""), spieler: [R(st.playerMesh.position.x), R(st.playerMesh.position.y), R(st.playerMesh.position.z)], chunks: st.voxelChunks ? st.voxelChunks.size : 0 };
            },
            Hh,
            sprung,
            offenText
        );
    const schuss = async (datei) => {
        const o = await page.evaluate(
            async (K, W, H) => {
                const st = r.state, cam = st.camera;
                cam.position.set(...K.p);
                cam.lookAt(K.l[0], K.l[1], K.l[2] + 1e-4);
                cam.updateMatrixWorld(true);
                __buehne({ uhr: 0.5 });
                if (st.playerMesh) st.playerMesh.visible = false;
                // wer steht im Vordergrund (die Treffer der Kamera unten im Bild)
                const rc = new THREE.Raycaster(), treffer = [];
                for (const [x, y] of [[-0.6, -0.8], [-0.2, -0.6], [0.2, -0.6], [0.6, -0.8], [0, -0.95]]) {
                    rc.setFromCamera(new THREE.Vector2(x, y), cam);
                    const h = rc.intersectObjects(st.scene.children, true).find((h) => h.object.visible !== false);
                    if (!h) { treffer.push(null); continue; }
                    const kette = []; let ob = h.object; while (ob && kette.length < 5) { kette.push(ob.name || ob.type); ob = ob.parent; }
                    treffer.push({ d: Math.round(h.distance), p: [h.point.x, h.point.y, h.point.z].map(Math.round), kette: kette.join("<") });
                }
                // ohne Ziel: die Tiefe des Bilds liest die Abnahme nur aus dem WebGPU-Puffer (der WebGL2-Rückfall trägt ihn nicht)
                const auf = await __ausgabeAufnahme(W, H, 1, { wahl: null, rotBild: true, bewegt: true });
                // der WebGL2-Rückfall liest die Zeilen von unten (readPixels): hier gewendet, das Urteil der Abnahme ist lageblind
                const gl = !!(st.renderer.backend && st.renderer.backend.isWebGLBackend), u8 = auf.u8;
                if (gl) for (let y = 0; y < H >> 1; y++) { const a = u8.slice(y * W * 4, (y + 1) * W * 4); u8.copyWithin(y * W * 4, (H - 1 - y) * W * 4, (H - y) * W * 4); u8.set(a, (H - 1 - y) * W * 4); }
                return { treffer, k: r._gelaende().gezeit.k, gewendet: gl, zeile: auf.abnahme && auf.abnahme.zeile, png: __png(u8, W, H) };
            },
            KAM,
            W,
            H
        );
        fs.writeFileSync(datei, Buffer.from(o.png.split(",")[1], "base64"));
        delete o.png;
        return o;
    };
    const erg = { adapter: browser.adapter, backend: be, ring, holz: process.env.HOLZ || "kienspan", kamera: KAM, bild: [W, H] };
    erg.ebbe = await stelle(3.1, true);
    log("Ebbe", JSON.stringify(erg.ebbe));
    erg.ebbeBild = await schuss(path.join(AUS, "ebbe-swiftshader.png"));
    log("Ebbe-Bild", JSON.stringify(erg.ebbeBild));
    // der Preis OHNE Gezeit: derselbe Takt, die Uhr springt nicht (keine Stufe wechselt)
    erg.ohne = await stelle(0, false);
    log("ohne Sprung", JSON.stringify(erg.ohne));
    erg.flut = await stelle(9.3, true);
    log("Flut", JSON.stringify(erg.flut));
    erg.flutBild = await schuss(path.join(AUS, "flut-swiftshader.png"));
    log("Flut-Bild", JSON.stringify(erg.flutBild));
    // der Preis EINER Stufe (5 cm, die häufigste Änderung im Spiel): Hochwasser −1 Stufe zur nächsten Stunde der Stufe
    erg.stufe = await stelle(9.75, true);
    log("eine Stufe", JSON.stringify(erg.stufe));
    fs.writeFileSync(path.join(AUS, "messung.json"), JSON.stringify(erg, null, 1));
    await browser.close();
    process.exit(0);
});
