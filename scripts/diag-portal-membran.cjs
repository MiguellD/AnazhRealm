// diag-portal-membran.cjs — V18.464 DIE PORTAL-VOLLENDUNG (Konsum-Beweis).
// Beweist im ECHTEN Boot (foundry-ON, warmes Buch, Null-Renderer), dass ein
// Tor-Gestalt-Portal in der Welt VOLLSTÄNDIG integriert ist:
//
//   K (Kollision): das gespawnte Welt-Portal trägt die GESETZ-Hülle
//     (5 Pseudo-Part-Boxen aus deriveGate) — die APERTUR ist körperlich FREI
//     (Probe-Punkte in der Öffnung treffen keine Box), die PFOSTEN sind
//     SOLIDE (Probe-Punkte im Rahmen treffen), und der alte Quarz-Riegel
//     (Alt-Substanz-AABB mitten in der Öffnung) ist GEFALLEN.
//   M (Membran): der Membran-Tick baut für das Portal EIN Passage-Mesh
//     (Registry je entry.id, Material-Marker portalMembran bzw. fail-LAUT-
//     Fallback), und die Uniforms atmen (time/act ändern sich mit Tick+Nähe).
//   W (Hindurchgehen): kreuzt der Spieler die Membran-Ebene INNERHALB der
//     Apertur, feuert enterPortal (derselbe Chokepoint wie die E-Taste) —
//     seitlich am Pfosten vorbei feuert NICHT.
//   B (Blick, 0910-4 — echter Frame, WebGPU auf swiftshader, am Genesis-Ring): die Membran trug `frustumCulled = false`
//     und zeichnete 8 Befehle und 129 600 Dreiecke auch mit dem Ring im Rücken (Spike der Prüfbühne 10.10.). Gezählt wird,
//     was der Renderer nach dem Culling zeichnet (`_renderObjectDirect` je Objekt im Hauptbild):
//       B1 aus der Ring-Mitte nach −x zeichnen Membranen (nicht vakuös), die im Rücken nicht alle
//       B2 70 m vor dem Ring, Blick vom Ring weg: KEINE Membran und kein Nebel zeichnet — Täter beim Namen (Gestalt, Abstand)
//       B3 die Hülle trägt die Welle: die Kugel jeder Membran-Geometrie reicht in z bis zur Amplitude des Gesetzes
//       BS Selbsttest am echten Frame: mit `frustumCulled = false` (dem alten Stand) MUSS B2 jede Membran beim Namen nennen
//       H  (K64-n1) aus der Ring-Mitte, AUSGABE-Pfad gegen das Labor-Bild derselben Pixel: die Welt hebt die Membran nicht über
//          ihren Anzeige-Wert (Y ≤ 1,15 ×) und brennt nicht aus (Y > 240 ≤ 5 %) — die Shell malt in Bild-Werten, die Welt liest
//          sie durch das FARB-GESETZ ins Lineare (Lehre 21)
//       HS Selbsttest: der rohe Leser (Anzeige-Wert als Strahlung, der Stand vor K64-n1) MUSS in H rot werden
//
//   node scripts/diag-portal-membran.cjs [--ohne-blick]
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");

const PORT = Number(process.env.PORTAL_MEMBRAN_PORT || 4439);
const server = statikServer();

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// B: die Seite — der Renderer steht, die Membranen sind gebaut; dann ruht der Loop, und je Blick zählt EIN Frame, was der
// Renderer nach dem Culling zeichnet. `opts.alt`: alle Membranen und Nebel auf `frustumCulled = false` (der Selbsttest).
async function blickProbe(opts) {
    const warte = (ms) => new Promise((q) => setTimeout(q, ms));
    const t0 = performance.now();
    let r = null,
        st = null;
    while (performance.now() - t0 < 300000) {
        r = window.anazhRealm;
        st = r && r.state;
        if (st && st.rendererReady && st.renderer && st.renderer.backend && st.camera && r._portalMembranes)
            if (r._portalMembranes.size >= 3) break;
        await warte(250);
    }
    if (!st || !st.renderer || st.renderer.backend.isWebGPUBackend !== true) return { fehler: "kein WebGPU-Renderer" };
    if (!r._portalMembranes || r._portalMembranes.size < 3)
        return { fehler: `Membranen am Ring: ${r._portalMembranes ? r._portalMembranes.size : 0} nach 300 s` };
    const rend = st.renderer;
    rend.setAnimationLoop(null);
    const recs = [...r._portalMembranes.values()];
    if (opts.alt)
        for (const rec of recs) {
            rec.mesh.frustumCulled = false;
            if (rec.nebel) rec.nebel.frustumCulled = false;
        }
    const nf = rend._nodes && rend._nodes.nodeFrame;
    const roh = rend._renderObjectDirect;
    let zug = null;
    rend._renderObjectDirect = function (object, material, scene, camera, ...rest) {
        const inv = object.userData && object.userData.inventar;
        if (zug && camera === st.camera && (inv === "portal-membran" || inv === "portal-nebel")) zug.push(object);
        return roh.call(this, object, material, scene, camera, ...rest);
    };
    const g = r._genesisMitte();
    const hoch = (x, z) => r._voxelSurfaceY(x, z);
    const blick = async (px, pz, lx, lz) => {
        const cam = st.camera;
        cam.position.set(px, hoch(px, pz) + 1.7, pz);
        cam.lookAt(lx, hoch(lx, lz) + 1.7, lz + 1e-4);
        cam.updateMatrixWorld(true);
        zug = [];
        if (nf) nf.update();
        r._loopRender(performance.now());
        try {
            await rend.backend.device.queue.onSubmittedWorkDone();
        } catch (_e) {}
        const gesehen = zug;
        zug = null;
        const name = (o) => {
            const rec = recs.find((x) => x.mesh === o || x.nebel === o);
            const p = new window.THREE.Vector3();
            o.getWorldPosition(p);
            return `${o.userData.inventar} ${rec ? rec.tor.gestalt : "?"} (${Math.round(p.distanceTo(cam.position))} m)`;
        };
        return {
            membran: gesehen.filter((o) => o.userData.inventar === "portal-membran").length,
            nebel: gesehen.filter((o) => o.userData.inventar === "portal-nebel").length,
            taeter: gesehen.map(name),
        };
    };
    const aus = { membranen: recs.length, mitte: [Math.round(g.x), Math.round(g.z)] };
    try {
        aus.im = await blick(g.x, g.z, g.x - 10, g.z);
        aus.weg = await blick(g.x + 70, g.z, g.x + 104, g.z);
    } finally {
        rend._renderObjectDirect = roh;
    }
    // B3: die Hülle je Gestalt gegen die Amplitude des Gesetzes
    const KL = r.constructor;
    aus.huelle = recs.map((rec) => {
        const bs = rec.mesh.geometry.boundingSphere;
        const bb = rec.mesh.geometry.boundingBox;
        const a = typeof KL._membranAmplitude === "function" ? KL._membranAmplitude(rec.tor) : null;
        return {
            gestalt: rec.tor.gestalt,
            amplitude: a,
            zReicht: !!(bb && a != null && bb.max.z >= a - 1e-6 && bb.min.z <= -a + 1e-6),
            kugelUmfasst: !!(bs && bb && bs.radius + 1e-6 >= bb.getBoundingSphere(new window.THREE.Sphere()).radius),
        };
    });
    return aus;
}

// H (K64-n1, die Hellen Tafeln): aus der Ring-Mitte (der Spieler am Spawn, die Tore wach) liest der AUSGABE-Pfad die Pixel jeder
// Membran — die Maske ist ein zweiter Schuss mit Magenta-Membranen und schwarzem Nebel bei angehaltener Uhr. Die Shell malt in
// Bild-Werten (ACES endet im Anzeige-Wert); roh als lineare Strahlung gelesen hob die Ausgabe ihre dunklen Bänder an, die Membran
// stand milchig-weiß (entsättigt). `opt.roh`: die Membranen und Nebel zeichnen ihren Anzeige-Wert roh (der alte Leser, Selbsttest).
async function hellProbe(opt) {
    const r = window.anazhRealm;
    const st = r.state;
    const T = window.THREE;
    const TSL = T.TSL;
    const rend = st.renderer;
    rend.setAnimationLoop(null);
    const W = 480,
        H = 270;
    const g = r._genesisMitte();
    const cam = st.camera;
    cam.position.set(g.x, r._voxelSurfaceY(g.x, g.z) + 1.7, g.z);
    cam.lookAt(g.x - 10, r._voxelSurfaceY(g.x - 10, g.z) + 1.7, g.z + 1e-4);
    cam.updateMatrixWorld(true);
    window.__buehne();
    const echtNow = performance.now.bind(performance);
    performance.now = () => 4.2e6; // die Uhr steht: Atem, Puls und Welle gleich in beiden Schüssen
    const recs = [...r._portalMembranes.values()];
    const vor = recs.map((rec) => [rec.mesh.material.colorNode, rec.nebel ? rec.nebel.material.colorNode : null]);
    const setze = (fm, fn) =>
        recs.forEach((rec) => {
            rec.mesh.material.colorNode = fm(rec);
            rec.mesh.material.needsUpdate = true;
            if (rec.nebel) {
                rec.nebel.material.colorNode = fn(rec);
                rec.nebel.material.needsUpdate = true;
            }
        });
    const schuss = async () => {
        r._schattenAlleNeu();
        await window.__ausgabeAufnahme(W, H, 1, { wahl: 0 });
        return (await window.__ausgabeAufnahme(W, H, 1, { wahl: 0 })).u8.slice();
    };
    try {
        if (opt.roh)
            setze(
                (rec) => TSL.vec4(r._membranGraph(rec.tor.gesetz).anzeige, 1.0),
                (rec) => TSL.vec4(r._nebelGraph(rec.tor.gesetz).anzeige, 1.0)
            );
        const A = await schuss();
        setze(
            () => TSL.vec4(1, 0, 1, 1),
            () => TSL.vec4(0, 0, 0, 1)
        );
        const M = await schuss();
        // DAS LABOR-BILD derselben Pixel: die Shell zeigt ihren Anzeige-Wert als Pixel (kein Ausgabe-Schritt). Ein eigenes
        // Render-Ziel liefert in r184 die rohen Werte des Stoffs (linear, ungetont — scripts/lib/ausgabe-aufnahme.cjs): die
        // Membranen und Nebel zeichnen dort ihren Anzeige-Wert, ein zweiter Schuss in Magenta ist die Maske desselben Ziels.
        const roh = async () => {
            const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
            try {
                // die neuen Stoff-Werte kompilieren erst (r184 überspringt ein Objekt, dessen Programm noch baut)
                if (typeof rend.compileAsync === "function") await rend.compileAsync(st.scene, cam);
                rend.setRenderTarget(rt);
                rend.render(st.scene, cam);
                rend.render(st.scene, cam);
                const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                const u = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                // WebGPU richtet jede Zeile auf 256 Byte aus (480 px → 2 048 Byte): das Polster fällt (wie in der Aufnahme)
                const zeile = W * 4,
                    schritt = u.length > zeile * H ? Math.ceil(zeile / 256) * 256 : zeile;
                if (schritt === zeile) return u;
                const voll = new Uint8Array(zeile * H);
                for (let y = 0; y < H; y++) voll.set(u.subarray(y * schritt, y * schritt + zeile), y * zeile);
                return voll;
            } finally {
                rend.setRenderTarget(null);
                rt.dispose();
            }
        };
        setze(
            (rec) => TSL.vec4(r._membranGraph(rec.tor.gesetz).anzeige, 1.0),
            (rec) => TSL.vec4(r._nebelGraph(rec.tor.gesetz).anzeige, 1.0)
        );
        const L = await roh();
        setze(
            () => TSL.vec4(1, 0, 1, 1),
            () => TSL.vec4(0, 0, 0, 1)
        );
        const LM = await roh();
        const Y = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
        let nL = 0,
            sL = 0;
        for (let i = 0; i < W * H * 4; i += 4)
            if (LM[i] > LM[i + 1] + 70 && LM[i + 2] > LM[i + 1] + 70) {
                nL++;
                sL += Y(L, i);
            }
        let n = 0,
            weiss = 0,
            sY = 0,
            sat = 0;
        for (let i = 0; i < W * H * 4; i += 4) {
            if (!(M[i] > M[i + 1] + 70 && M[i + 2] > M[i + 1] + 70)) continue;
            n++;
            const y = Y(A, i);
            sY += y;
            if (y > 240) weiss++;
            const mx = Math.max(A[i], A[i + 1], A[i + 2]);
            sat += mx > 0 ? (mx - Math.min(A[i], A[i + 1], A[i + 2])) / mx : 0;
        }
        const P = new T.Vector3();
        const imBild = recs
            .filter((rec) => {
                rec.mesh.getWorldPosition(P);
                return P.sub(cam.position).normalize().dot(cam.getWorldDirection(new T.Vector3())) > 0.5;
            })
            .map((rec) => rec.tor.gestalt);
        return {
            n,
            anteil: n / (W * H),
            weiss: n ? weiss / n : 0,
            Y: n ? sY / n : 0,
            saettigung: n ? sat / n : 0,
            Ylabor: nL ? sL / nL : 0,
            nLabor: nL,
            imBild,
            belichtung: rend.toneMappingExposure,
        };
    } finally {
        recs.forEach((rec, i) => {
            rec.mesh.material.colorNode = vor[i][0];
            rec.mesh.material.needsUpdate = true;
            if (rec.nebel) {
                rec.nebel.material.colorNode = vor[i][1];
                rec.nebel.material.needsUpdate = true;
            }
        });
        performance.now = echtNow;
    }
}
// Das Soll (K64-n1): Labor = Welt (Lehre 19) — die Welt hebt die Membran nicht über ihr Labor-Bild: Y der Welt ≤ 1,15 × Y des
// Anzeige-Werts derselben Tore (gemessen swiftshader, Ring-Mitte, Belichtung 0,615: der rohe Leser hob um ≈ 1,6 ×, das FARB-
// GESETZ zeigt ≈ 0,9 ×), und kein Ausbrand: Y > 240 auf ≤ 5 % der Membran-Pixel (Nordstern Portale).
const HELL = { hub: 1.15, weiss: 0.05 };

async function blickStufe(check) {
    const browser = await starteBrowser({ art: "linse", frist: 900000 });
    const lauf = async (alt) => {
        const page = await browser.newPage();
        await page.setViewport({ width: 480, height: 270 });
        const seite = [];
        page.on("pageerror", (e) => seite.push((e.message || String(e)).split("\n")[0]));
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const o = await page.evaluate(blickProbe, { alt });
        if (!o.fehler) {
            await page.evaluate(AUSGABE_INSTALL);
            o.hell = await page.evaluate(hellProbe, { roh: alt });
        }
        o.seite = seite;
        await page.close();
        return o;
    };
    try {
        const b = await lauf(false);
        if (b.fehler) throw new Error(b.fehler);
        console.log(`=== B — der Blick am Genesis-Ring ${JSON.stringify(b.mitte)} (WebGPU auf swiftshader, ${b.membranen} Membranen) ===`);
        check(
            "B1 aus der Ring-Mitte nach −x zeichnen Membranen, die im Rücken nicht alle",
            b.im.membran > 0 && b.im.membran < b.membranen,
            `${b.im.membran} von ${b.membranen} Membranen, ${b.im.nebel} Nebel`
        );
        check(
            "B2 70 m vor dem Ring, Blick vom Ring weg: keine Membran und kein Nebel zeichnet",
            b.weg.membran === 0 && b.weg.nebel === 0,
            b.weg.taeter.length ? b.weg.taeter.join(" · ") : "0 Befehle"
        );
        const loch = b.huelle.filter((h) => !h.zReicht || !h.kugelUmfasst);
        check(
            "B3 die Hülle jeder Membran-Geometrie trägt die Amplitude der Welle",
            loch.length === 0,
            loch.length
                ? loch.map((h) => `${h.gestalt} (Amplitude ${h.amplitude})`).join(" · ")
                : b.huelle.map((h) => `${h.gestalt} ±${h.amplitude.toFixed(2)} m`).join(" · ")
        );
        const hellZeile = (h) =>
            `${h.n} Membran-Pixel (${(h.anteil * 100).toFixed(1)} %), Y Welt ${h.Y.toFixed(1)} gegen Labor ${h.Ylabor.toFixed(1)} (× ${(h.Y / Math.max(1, h.Ylabor)).toFixed(2)}), Sättigung ${h.saettigung.toFixed(3)}, ` +
            `Y > 240 ${(h.weiss * 100).toFixed(1)} %, Belichtung ${h.belichtung.toFixed(3)} — ${h.imBild.join(" · ")}`;
        const hellRot = (h) => !(h.n > 200 && h.nLabor > 200 && h.Y <= HELL.hub * h.Ylabor && h.weiss <= HELL.weiss);
        check(
            `H aus der Ring-Mitte: die Welt hebt die Membran nicht über ihr Labor-Bild (Y ≤ ${HELL.hub} × Labor) und brennt nicht aus (Y > 240 ≤ ${HELL.weiss * 100} %)`,
            !hellRot(b.hell),
            hellZeile(b.hell)
        );
        check("B keine Page-Errors", b.seite.length === 0, b.seite.slice(0, 2).join(" | "));
        // BS: der alte Stand (frustumCulled = false) in einer frischen Seite — B2 MUSS jede Membran beim Namen nennen
        const s = await lauf(true);
        if (s.fehler) throw new Error("Selbsttest: " + s.fehler);
        check(
            "BS Selbsttest: mit frustumCulled = false nennt B2 die Membranen im Rücken beim Namen",
            s.weg.membran === s.membranen,
            `${s.weg.membran} von ${s.membranen}: ${s.weg.taeter.slice(0, 4).join(" · ")}${s.weg.taeter.length > 4 ? " …" : ""}`
        );
        check("HS Selbsttest: der rohe Leser (Anzeige-Wert als Strahlung) wird in H rot beim Namen", hellRot(s.hell), hellZeile(s.hell));
    } catch (e) {
        check("B Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "webgl", frist: 300000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { boot: false, warm: false };
        const dl0 = performance.now() + 90000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        if (!r) return res;
        res.boot = true;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 60000;
        while (performance.now() < dl) {
            if (f && f.ready && f.recipes && f.recipes.geisttor) break;
            await new Promise((r2) => setTimeout(r2, 100));
        }
        res.warm = !!(f && f.ready && f.recipes && f.recipes.geisttor);

        // ── Bühne: ein Welt-Portal (geisttor-Gestalt) direkt vor dem Spieler ──
        const p = r.state.playerMesh.position;
        const entry = r.spawnArchitecture("welt_portal", { x: p.x + 10, y: p.y, z: p.z }, { precise: true });
        res.spawned = !!entry;
        if (!entry) return res;
        const tor = r._torGesetzFor(entry);
        res.torGesetz = !!tor;
        if (!tor) return res;
        const mu = tor.mu;
        res.gestalt = tor.gestalt;

        // ── K: Kollisions-Hülle aus dem Gesetz ──
        const boxes = entry.blockerAABBs || [];
        res.k = { boxCount: boxes.length };
        const hit = (wx, wy, wz) =>
            boxes.some(
                (b) => wx >= b.minX && wx <= b.maxX && wz >= b.minZ && wz <= b.maxZ && wy >= b.botY && wy <= b.topY
            );
        const ex = entry.position.x,
            ey = entry.position.y - 0.5,
            ez = entry.position.z;
        // Apertur-Probe: Torso-Höhe, Mitte + halbe Öffnung, über die Tiefe.
        res.k.aperturFrei =
            !hit(ex, ey + 1.2, ez) &&
            !hit(ex + mu.rimAx * 0.6, ey + 1.2, ez) &&
            !hit(ex - mu.rimAx * 0.6, ey + 1.2, ez) &&
            !hit(ex, ey + 1.2, ez + mu.zFace * 0.8) &&
            !hit(ex, ey + 1.2, ez - mu.zFace * 0.8);
        // Pfosten-Probe: mitten im Rahmen, beidseitig — der Pfosten reicht von der Öffnung bis zur gezeichneten Außenkante
        // (die gemintete Hülle des Gesetzbuchs `__portaCore.TOR_HUELLE`, seit der Leben-Schau 2 aus dem Bild statt aus
        // jambW·(Ordnungen + ½); je Seite [pfostenX, pfostenZ, obenX, obenZ]).
        const hm = globalThis.__portaCore.TOR_HUELLE[tor.gestalt];
        const jambXr = (mu.rimAx + hm.seiten[1][0]) / 2;
        const jambXl = (mu.rimAx + hm.seiten[0][0]) / 2;
        res.k.pfostenSolide = hit(ex + jambXr, ey + 1.2, ez) && hit(ex - jambXl, ey + 1.2, ez);
        // Krone-Probe: über dem Scheitel.
        res.k.kroneSolide = hit(ex, ey + mu.apexY + 0.15, ez);

        // ── M: Membran-Bau + Atem ──
        r._tickPortalMembranes(1.0);
        // 1-Hz-Scan-Throttle überspringen: zweiter Tick nach Scan-Fenster.
        r._tickPortalMembranes(2.5);
        const reg = r._portalMembranes;
        const rec = reg ? reg.get(entry.id) : null;
        res.m = { built: !!(rec && rec.mesh), inScene: !!(rec && rec.mesh && rec.mesh.parent === r.state.scene) };
        if (rec) {
            const t0 = rec.u.time.value;
            r._tickPortalMembranes(3.7);
            res.m.atmet = rec.u.time.value !== t0;
            res.m.echt = !!(
                rec.mesh.material &&
                rec.mesh.material.userData &&
                rec.mesh.material.userData.portalNebel === undefined &&
                rec.mesh.material.userData.portalMembran
            );
            res.m.marker = res.m.echt || !!rec.mesh.material.isMeshBasicMaterial;
            // PORTA-NEBEL (18.07.) — die lebende Kette Dial→mu→Uniform→Draw:
            // das fog-Gesetz trägt (mu.fog > 0), der Kasten hängt gestempelt in
            // der Szene, und bei Spieler-Nähe (act > 0) speist mu.fog die
            // nebelAct-Uniform > 0 + der Kasten ist sichtbar.
            res.n = { gesetz: Number.isFinite(mu.fog) && mu.fog > 0 };
            res.n.gebaut = !!(rec.nebel && rec.nebel.parent === r.state.scene);
            res.n.stempel = !!(rec.nebel && rec.nebel.userData.inventar === "portal-nebel");
            res.n.echt = !!(
                rec.nebel &&
                rec.nebel.material &&
                rec.nebel.material.userData &&
                rec.nebel.material.userData.portalNebel
            );
            res.n.uniform = !!(rec.u.nebelAct && rec.u.nebelAct.value > 0 && rec._act > 0);
            res.n.sichtbar = !!(rec.nebel && rec.nebel.visible === (rec._act > 0.001));
        }

        // ── F: Tür-Flügel öffnen sich dem Reisenden (V18.465) ──
        // Erst MATERIALISIEREN (das Asset ist async — der Rewarm-Weg von Hand,
        // das Gestalt-Gate-C-Muster), dann Nähe + Ticks.
        const dlF = performance.now() + 90000;
        while (!entry.instanced && performance.now() < dlF) {
            r._rebuildArchitectureMesh(entry);
            if (entry.instanced) break;
            await new Promise((r2) => setTimeout(r2, 300));
        }
        res.fInstanced = entry.instanced === true;
        p.x = ex;
        p.z = ez + 2.0;
        p.y = ey + 1.0;
        for (let i = 0; i < 40; i++) r._tickPortalMembranes(3.8 + i * 0.016);
        const recF = r._portalMembranes.get(entry.id);
        res.f = {
            fluegelGefunden: !!(recF && recF._fluegel && recF._fluegel.length > 0),
            anzahl: recF && recF._fluegel ? recF._fluegel.length : 0,
            geoeffnet: !!(recF && recF._fluegelWinkel > 0.2),
            winkel: recF ? +(recF._fluegelWinkel || 0).toFixed(3) : 0,
        };
        // DIE FLÜGEL-INSTANZ (1310-4): gleiche Gestalten teilen ihren Zug, und jeder Flügel steht, wo SEINE Gestalt um SEIN
        // Scharnier geschwenkt landet — die Mitte der gezeichneten Geometrie unter der Slot-Matrix gegen
        // Eintrag · Welt-Skala · (h + R(w)·(Basis · Mitte − h)).
        if (recF && recF._fluegel && recF._fluegel.length) {
            const T = window.THREE;
            const ew = r._archEntryWorldMatrix(entry, new T.Matrix4());
            const ws = r._foundryWorldScaleMatrix(recF.tor.gestalt);
            const M = new T.Matrix4();
            const Y = new T.Vector3(0, 1, 0);
            let abweichung = 0;
            let basis = 0;
            for (const fl of recF._fluegel) {
                const t = fl.tuer;
                const geo = fl.g.mesh.geometry;
                if (!geo.boundingBox) geo.computeBoundingBox();
                const c = geo.boundingBox.getCenter(new T.Vector3());
                fl.g.mesh.getMatrixAt(fl.ref.slot, M);
                const ist = c.clone().applyMatrix4(M);
                const q = c.clone();
                if (t.basis) {
                    q.applyMatrix4(t.basis);
                    basis++;
                }
                q.x -= t.hx || 0;
                q.z -= t.zf || 0;
                q.applyAxisAngle(Y, (t.seite || 1) * (t.zf >= 0 ? 1 : -1) * recF._fluegelWinkel);
                q.x += t.hx || 0;
                q.z += t.zf || 0;
                abweichung = Math.max(abweichung, ist.distanceTo(q.applyMatrix4(ws).applyMatrix4(ew)));
            }
            res.f.zuege = new Set(recF._fluegel.map((x) => x.g)).size;
            res.f.basis = basis;
            res.f.abweichung = +abweichung.toFixed(4);
        }

        // ── W: Hindurchgehen (Ebenen-Kreuzung in der Apertur → enterPortal) ──
        let entered = 0;
        const origEnter = r.enterPortal.bind(r);
        r.enterPortal = (e2) => {
            entered++;
            return { ok: true, reason: "diag-abgefangen", type: e2 && e2.type };
        };
        // Vor dem Tor stehen (lz > 0), dann über die Ebene (lz < 0) — in der Apertur.
        p.x = ex;
        p.z = ez + 1.5;
        p.y = ey + 1.0;
        r._tickPortalMembranes(4.2);
        p.z = ez - 1.5;
        r._tickPortalMembranes(4.3);
        res.w = { feuert: entered === 1 };
        // Re-Arm-Wand: OHNE die Zone zu verlassen feuert das Rueck-Kreuzen NICHT;
        // nach dem Verlassen (lz jenseits zFace+1.2) feuert der naechste Durchgang wieder.
        p.z = ez + 1.5;
        r._tickPortalMembranes(4.4);
        res.w.keinDoppel = entered === 1;
        p.z = ez + mu.zFace + 4.0;
        r._tickPortalMembranes(4.5);
        p.z = ez + 1.5;
        r._tickPortalMembranes(4.55);
        p.z = ez - 1.5;
        r._tickPortalMembranes(4.6);
        res.w.rearmWand = entered === 2;
        // Seitlich am Pfosten vorbei (außerhalb der Apertur) feuert NICHT.
        entered = 0;
        p.x = ex + mu.rimAx + 2.0;
        p.z = ez + 1.5;
        r._tickPortalMembranes(4.7);
        p.z = ez - 1.5;
        r._tickPortalMembranes(4.8);
        res.w.seitlichStumm = entered === 0;
        r.enterPortal = origEnter;
        return res;
    });

    console.log("=== V18.464 PORTAL-MEMBRAN — Kollision · Passage · Hindurchgehen ===");
    check("Boot + warmes Buch (geisttor im LIVE-Buch)", out.boot && out.warm);
    check("welt_portal gespawnt + Tor-Gesetz aufgelöst", out.spawned && out.torGesetz, `gestalt=${out.gestalt}`);
    if (out.k) {
        // je Seite (Leben-Schau 2, `TOR_HUELLE` des Gesetzbuchs): Pfosten bis zur Kämpferlinie · Rahmen darüber · Schulter · die
        // halbe Krone — eine Ruine trägt hier einen Stein, dort keinen
        check(
            "K: Gesetz-Hülle trägt 8 Boxen (je Seite Pfosten · Rahmen · Schulter · halbe Krone)",
            out.k.boxCount === 8,
            `boxen=${out.k.boxCount}`
        );
        check("K: die APERTUR ist körperlich FREI (5 Probe-Punkte, Torso-Höhe)", out.k.aperturFrei === true);
        check("K: die PFOSTEN sind solide (beidseitig)", out.k.pfostenSolide === true);
        check("K: die KRONE über dem Scheitel ist solide", out.k.kroneSolide === true);
    } else check("K: Kollisions-Block erreicht", false);
    if (out.m) {
        check("M: der Membran-Tick baut das Passage-Mesh (Registry je entry.id)", out.m.built === true);
        check("M: die Membran hängt in der Szene", out.m.inScene === true);
        check("M: die Uniforms atmen (time folgt dem Tick)", out.m.atmet === true);
        check("M: Material trägt den portalMembran-Marker (oder fail-LAUT-Fallback)", out.m.marker === true);
        check("M: der ECHTE TSL-Gesetz-Graph baute (kein Fallback noetig)", out.m.echt === true);
    } else check("M: Membran-Block erreicht", false);
    if (out.n) {
        check("N: das fog-Gesetz trägt (mu.fog > 0 — der Dial reist)", out.n.gesetz === true);
        check("N: der Nebel-Kasten hängt gestempelt in der Szene (portal-nebel)", out.n.gebaut && out.n.stempel);
        check("N: der ECHTE Nebel-TSL-Graph baute (portalNebel-Marker)", out.n.echt === true);
        check("N: mu.fog speist die nebelAct-Uniform (> 0 bei Nähe) — die Kette Dial→mu→Uniform lebt", out.n.uniform === true);
        check("N: der Kasten lebt nähe-aktiviert (visible == act > 0.001)", out.n.sichtbar === true);
    } else check("N: Nebel-Block erreicht", false);
    if (out.f) {
        check(
            `F: Flügel-Meshes durch die Pipe gefunden (${out.f.anzahl})`,
            out.f.fluegelGefunden === true,
            `anzahl=${out.f.anzahl}`
        );
        check(`F: die Flügel ÖFFNEN sich dem Reisenden (Winkel ${out.f.winkel})`, out.f.geoeffnet === true);
        check(
            `F: gleiche Flügel-Gestalten teilen ihren Zug (${out.f.zuege} Züge für ${out.f.anzahl} Flügel, ${out.f.basis} als Instanz)`,
            out.f.basis > 0 && out.f.zuege < out.f.anzahl,
            `zuege=${out.f.zuege} anzahl=${out.f.anzahl} basis=${out.f.basis}`
        );
        check(
            `F: jeder Flügel steht, wo seine Gestalt um sein Scharnier schwenkt (größte Abweichung ${out.f.abweichung} m)`,
            out.f.abweichung < 0.01,
            `abweichung=${out.f.abweichung}`
        );
    } else check("F: Flügel-Block erreicht", false);
    if (out.w) {
        check("W: Hindurchgehen durch die Apertur feuert enterPortal (genau 1×)", out.w.feuert === true);
        check("W: kein Doppelfeuer im selben Pass (Rueck-Kreuzen in der Zone stumm)", out.w.keinDoppel === true);
        check("W: nach Verlassen der Zone feuert der naechste Durchgang wieder", out.w.rearmWand === true);
        check("W: seitlich am Pfosten vorbei feuert NICHT", out.w.seitlichStumm === true);
    } else check("W: Hindurchgeh-Block erreicht", false);
    check("keine Page-Errors während der Probe", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));

    await browser.close();
    if (!process.argv.includes("--ohne-blick")) await blickStufe(check);
    server.close();
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — das Welt-Portal ist VOLL integriert: die Kollision folgt der sichtbaren Studio-Form (Öffnung frei, Rahmen solide), die Passage-Membran baut + atmet aus dem EINEN Gesetz, Hindurchgehen IST Betreten, und mit dem Ring im Rücken zeichnet keine Membran (B)."
    );
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    server.close();
    process.exit(1);
});
