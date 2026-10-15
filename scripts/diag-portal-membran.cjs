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
//       HS Selbsttest: der rohe Leser (Anzeige-Wert als Strahlung, der Stand vor K64-n1) MUSS in H rot werden — in DERSELBEN
//          Seite, gegen dieselbe Maske und dasselbe Labor-Bild (K64-n2: seine Stoffe SIND die des Labors)
//       HM (K64-n3) die Maske zeichnet ohne kaltes Programm (je Bild gezählt: neue Vertex-/Fragment-Programme), HMS Selbsttest:
//          derselbe Zähler sieht die kalten Programme des rohen Lesers
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
    if (opts.nurWarten) return { bereit: true };
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
// Membran. Die Shell malt in Bild-Werten (ACES endet im Anzeige-Wert); roh als lineare Strahlung gelesen hob die Ausgabe ihre
// dunklen Bänder an, die Membran stand milchig-weiß (entsättigt). EINE Seite, EIN Blick, die Uhr steht — vier Bilder:
//   A    die Welt, wie sie die Membran zeigt: der Ausgabe-Pfad der Welt (TRAA, Tonung, Belichtung aus dem Licht), gezeichnet
//        werden nur die gemessenen Bürger — Membran, Nebel, Himmel (K64-n3). Die Membran ist deckend, wirft und empfängt keinen
//        Schatten (`_membranBauFor`): ihr Pixel hängt an keinem anderen Bürger. Die ganze Welt im Bild baute auf swiftshader jedes
//        Programm im Blick, das die Bühne neu lichtet, und jedes, das während H ankam (CI Lauf 38674187005: A 10 kalt 113 s,
//        M 6 kalt 227 s). Die Lichter bleiben (kein Programm wechselt seinen Licht-Schlüssel).
//   M    die Maske OHNE Programm (K64-n3): dieselbe Welt mit verborgenen Membranen — Membran-Pixel sind die, in denen die Welt
//        mit Membran sichtbar anders steht (ein Kanal ≥ STUFE). Bis K64-n3 malte M die Membranen magenta: EIN kaltes
//        Programm, in der CI 195 s von 233 s des Gates (Lauf 38670064375); A gegen A wiederholt weicht kein Pixel ab (die Uhr
//        steht, TRAA ist bei gleicher Lage gleich), die Differenz-Maske deckt sich mit der magenta (swiftshader: 7 876 von 8 014
//        Pixeln, 1 außerhalb). HM zählt die kalten Programme je Bild und hält die Maske bei 0.
// H läuft VOR den Blicken B: deren Frames stoßen die Programme der ganzen Welt an, die der GPU-Prozess sonst während H übersetzt.
//   R    der rohe Leser (der Stand vor K64-n1): Membran und Nebel zeichnen ihren Anzeige-Wert als Strahlung (HS, zwei Programme)
//   L    das Labor-Bild derselben Pixel: DIESELBEN rohen Stoffe in ein Ziel im Format des Szenen-Passes, gezeichnet nur Membran
//        und Nebel — die Shell zeigt ihren Anzeige-Wert als Pixel, ein Ziel, das nicht Ausgabe ist, hält ihn ungewandelt.
//        Format, Tiefe und Proben gleich dem Szenen-Pass: R und L teilen ihre Programme.
// K64-n2 (die CI-Frist der Linse): bis dahin zeichnete das Labor die GANZE Szene in ein RGBA8-Ziel (jedes Programm im Blick neu
// auf swiftshader), je Seite mit eigener Maske, und der Selbsttest fuhr H in einer zweiten Seite — gate:portal-membran 578 s.
async function hellProbe() {
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
    performance.now = () => 4.2e6; // die Uhr steht: Atem, Puls und Welle gleich in jedem Bild
    const recs = [...r._portalMembranes.values()];
    const vor = recs.map((rec) => [rec.mesh.material.colorNode, rec.nebel ? rec.nebel.material.colorNode : null]);
    const sicht = recs.map((rec) => rec.mesh.visible);
    const setze = (fm, fn) =>
        recs.forEach((rec) => {
            rec.mesh.material.colorNode = fm(rec);
            rec.mesh.material.needsUpdate = true;
            if (rec.nebel && fn) {
                rec.nebel.material.colorNode = fn(rec);
                rec.nebel.material.needsUpdate = true;
            }
        });
    // NUR DIE GEMESSENEN BÜRGER zeichnen (K64-n3): jedes Objekt der Szene außer Membran, Nebel und Himmel fällt aus dem Zeichnen
    // (die Render-Objekt-Funktion des Renderers; die Ausgabe-Kette und der Hintergrund hängen nicht in der Szene und zeichnen)
    const nur = new Set();
    for (const rec of recs) {
        nur.add(rec.mesh);
        if (rec.nebel) nur.add(rec.nebel);
    }
    const himmel = st.scene.getObjectByName("himmel");
    if (himmel) nur.add(himmel);
    const rofWelt = rend.getRenderObjectFunction();
    const inSzene = (o) => {
        while (o && o !== st.scene) o = o.parent;
        return o === st.scene;
    };
    rend.setRenderObjectFunction(function (object, ...rest) {
        if (!nur.has(object) && inSzene(object)) return;
        if (rofWelt) rofWelt.call(this, object, ...rest);
        else rend.renderObject(object, ...rest);
    });
    // je Bild die Frames der Erst-Ruhe (Wanduhr): wie lange das Bild auf Programme wartete
    const ruhe = {};
    let ruheK = null;
    const ruheWelt = window.__erstRuhe;
    window.__erstRuhe = async (frame, opt, wer) => {
        let n = 0;
        const t = echtNow();
        const v = await ruheWelt(
            () => {
                n++;
                frame();
            },
            opt,
            wer
        );
        if (ruheK) ruhe[ruheK] = { n, ms: Math.round(echtNow() - t) };
        return v;
    };
    const E = r._erstZeichnung;
    const offenStart = E ? E.offen.size : null;
    const schuss = async () => (await window.__ausgabeAufnahme(W, H, 1, { wahl: 0, nurGezeichnete: true })).u8;
    const zeit = {};
    // je Bild die Wanduhr und die KALTEN PROGRAMME (HM): Vertex- und Fragment-Programme, die der Renderer in diesem Bild neu
    // übersetzt (r184 hält sie je Quelltext in `_pipelines.programs`) — auf swiftshader kostet ein kaltes Programm bis Minuten
    const kalt = {};
    const programme = () => {
        const P = rend._pipelines && rend._pipelines.programs;
        return P ? new Set([...P.vertex.keys(), ...P.fragment.keys()]) : null;
    };
    const uhr = async (k, f) => {
        const t = echtNow();
        const vor = programme();
        ruheK = k;
        const v = await f();
        const nach = programme();
        kalt[k] = vor && nach ? [...nach].filter((c) => !vor.has(c)).length : null;
        if (ruhe[k] && E) ruhe[k].offen = E.offen.size; // offene Pipelines ausgelassener Bürger nach dem Bild
        zeit[k] = Math.round(echtNow() - t);
        return v;
    };
    // DAS LABOR-ZIEL: eine Kopie des Szenen-Ziels (Format, Tiefen-Textur, Proben) in der Größe der Aufnahme; gelesen wird der
    // Anzeige-Wert je Pixel auf 0..255 — rg11b10ufloat (gepackt), rgba16float oder 8 Bit, je nachdem, was das Gerät trägt.
    const labor = async () => {
        // neu gebaut, nie geklont: eine geklonte Tiefen-Textur teilt ihre Quelle (Größe) mit dem Szenen-Ziel
        const sp = st.scenePass && st.scenePass.renderTarget;
        const rt = new T.RenderTarget(W, H, {
            type: sp ? sp.texture.type : T.UnsignedByteType,
            format: sp ? sp.texture.format : T.RGBAFormat,
            depthBuffer: true,
            samples: sp ? sp.samples : 0,
        });
        if (sp && sp.depthTexture) {
            rt.depthTexture = new T.DepthTexture(W, H);
            rt.depthTexture.type = sp.depthTexture.type;
        }
        // nur Membran und Nebel (die Render-Objekt-Funktion des Renderers): der Graph der Membran liest keinen Grund (kein
        // Schirm-, kein Tiefen-Knoten), ihr Anzeige-Wert hängt an keinem anderen Objekt — und kein anderes Programm entsteht
        const nur = new Set();
        for (const rec of recs) {
            nur.add(rec.mesh);
            if (rec.nebel) nur.add(rec.nebel);
        }
        const rof = rend.getRenderObjectFunction();
        const zeichne = () => {
            rend.setRenderTarget(rt);
            rend.setRenderObjectFunction(function (object, ...rest) {
                if (nur.has(object)) rend.renderObject(object, ...rest);
            });
            try {
                rend.render(st.scene, cam);
            } finally {
                rend.setRenderObjectFunction(rof);
                rend.setRenderTarget(null);
            }
        };
        try {
            await window.__erstRuhe(zeichne, { erstFristMs: 120000, nurGezeichnete: true }, "das Labor-Bild (H)");
            zeichne();
            const roh = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            const gepackt = rt.texture.type === T.UnsignedInt101111Type;
            // r184 reicht rg11b10ufloat als Bytes: je Texel EIN 32-Bit-Wort
            const px = gepackt ? new Uint32Array(roh.buffer, roh.byteOffset, roh.byteLength >> 2) : roh;
            const kanaele = gepackt ? 1 : 4;
            // WebGPU richtet jede Zeile auf 256 Byte aus (die letzte ohne Polster): die Zeile in Elementen
            const zeile = (Math.ceil((W * kanaele * px.BYTES_PER_ELEMENT) / 256) * 256) / px.BYTES_PER_ELEMENT;
            // 11/10-Bit-Gleitkomma ohne Vorzeichen: 5 Bit Exponent (Bias 15), 6 bzw. 5 Bit Mantisse
            const klein = (v, mant) => {
                const e = v >> mant,
                    m = v & ((1 << mant) - 1);
                if (e === 0) return (m / (1 << mant)) * Math.pow(2, -14);
                if (e === 31) return 1;
                return (1 + m / (1 << mant)) * Math.pow(2, e - 15);
            };
            const wert = (i) => {
                if (gepackt) {
                    const p = px[i];
                    return [klein(p & 0x7ff, 6), klein((p >>> 11) & 0x7ff, 6), klein((p >>> 22) & 0x3ff, 5)];
                }
                if (px instanceof Uint8Array) return [px[i] / 255, px[i + 1] / 255, px[i + 2] / 255];
                if (px instanceof Uint16Array) return [0, 1, 2].map((k) => T.DataUtils.fromHalfFloat(px[i + k]));
                return [px[i], px[i + 1], px[i + 2]];
            };
            const u = new Uint8Array(W * H * 4);
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    const c = wert(y * zeile + x * kanaele);
                    const o = (y * W + x) * 4;
                    for (let k = 0; k < 3; k++) u[o + k] = Math.round(Math.min(1, Math.max(0, c[k])) * 255);
                    u[o + 3] = 255;
                }
            return { u, format: gepackt ? "rg11b10ufloat" : px.constructor.name };
        } finally {
            rt.dispose();
        }
    };
    try {
        const A = await uhr("A", schuss);
        // die Maske: dieselbe Welt ohne Membranen (kein Stoff wechselt, kein Programm entsteht)
        recs.forEach((rec) => (rec.mesh.visible = false));
        const M = await uhr("M", schuss);
        recs.forEach((rec, i) => (rec.mesh.visible = sicht[i]));
        setze(
            (rec) => TSL.vec4(r._membranGraph(rec.tor.gesetz).anzeige, 1.0),
            (rec) => TSL.vec4(r._nebelGraph(rec.tor.gesetz).anzeige, 1.0)
        );
        const R = await uhr("R", schuss);
        const L = await uhr("L", labor);
        const Y = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
        const S = (u, i) => {
            const mx = Math.max(u[i], u[i + 1], u[i + 2]);
            return mx > 0 ? (mx - Math.min(u[i], u[i + 1], u[i + 2])) / mx : 0;
        };
        // EINE Maske für alle drei Bilder: die Pixel, in denen die Welt eine Membran zeigt — mit Membran steht ein Kanal um
        // mindestens STUFE anders als ohne (swiftshader: Stufe 10 nimmt 7 876 der 8 014 magenta Pixel, 1 außerhalb; 6 griff
        // 71 Pixel neben die Membran, 16 ließ 353 Rand-Pixel fallen)
        const STUFE = 10;
        const maske = [];
        for (let i = 0; i < W * H * 4; i += 4)
            if (Math.max(Math.abs(A[i] - M[i]), Math.abs(A[i + 1] - M[i + 1]), Math.abs(A[i + 2] - M[i + 2])) >= STUFE)
                maske.push(i);
        const mass = (u) => {
            let sY = 0,
                sat = 0,
                weiss = 0;
            for (const i of maske) {
                const y = Y(u, i);
                sY += y;
                if (y > 240) weiss++;
                sat += S(u, i);
            }
            const n = maske.length;
            return { Y: n ? sY / n : 0, saettigung: n ? sat / n : 0, weiss: n ? weiss / n : 0 };
        };
        const P = new T.Vector3();
        const imBild = recs
            .filter((rec) => {
                rec.mesh.getWorldPosition(P);
                return P.sub(cam.position).normalize().dot(cam.getWorldDirection(new T.Vector3())) > 0.5;
            })
            .map((rec) => rec.tor.gestalt);
        return {
            n: maske.length,
            anteil: maske.length / (W * H),
            welt: mass(A),
            roh: mass(R),
            labor: mass(L.u),
            laborFormat: L.format,
            imBild,
            belichtung: rend.toneMappingExposure,
            zeit,
            kalt,
            ruhe,
            offenStart,
        };
    } finally {
        recs.forEach((rec, i) => {
            rec.mesh.material.colorNode = vor[i][0];
            rec.mesh.material.needsUpdate = true;
            rec.mesh.visible = sicht[i];
            if (rec.nebel) {
                rec.nebel.material.colorNode = vor[i][1];
                rec.nebel.material.needsUpdate = true;
            }
        });
        rend.setRenderObjectFunction(rofWelt);
        window.__erstRuhe = ruheWelt;
        // ein Bündel, das unter dem Filter neu aufnahm, trug nur die gemessenen Bürger: jedes nimmt beim nächsten Zeichnen neu auf
        st.scene.traverse((o) => {
            if (o.isBundleGroup) o.needsUpdate = true;
        });
        performance.now = echtNow;
    }
}
// Das Soll (K64-n1): Labor = Welt (Lehre 19) — die Welt hebt die Membran nicht über ihr Labor-Bild: Y der Welt ≤ 1,15 × Y des
// Anzeige-Werts derselben Tore, sie bleicht ihn nicht (Sättigung ≥ 0,75 × Labor — die weiße Tafel ist hell UND entsättigt) und
// brennt nicht aus: Y > 240 auf ≤ 5 % der Membran-Pixel (Nordstern Portale). Gemessen swiftshader, Ring-Mitte, Belichtung 0,615
// (K64-n2, eine Seite): das FARB-GESETZ Y × 0,77, der rohe Leser × 1,22 bei Sättigung 0,093 gegen 0,183; die Welt steht in einem
// zweiten Zustand (der Lauf vor K64-n2 sah ihn auch) bei × 0,81 und × 1,15 — dort fällt der rohe Leser an der Sättigung
// (0,080 gegen 0,162). Mit der Differenz-Maske (K64-n3) dieselben zwei Zustände: Radeon × 0,77 / roh × 1,23 bei Sättigung
// 0,094 gegen 0,184, swiftshader × 0,81 / roh × 1,15 bei 0,089 gegen 0,163.
const HELL = { hub: 1.15, weiss: 0.05, bleich: 0.75 };

async function blickStufe(check) {
    const browser = await starteBrowser({ art: "linse", frist: 900000 });
    const lauf = async (alt) => {
        const page = await browser.newPage();
        await page.setViewport({ width: 480, height: 270 });
        const seite = [];
        page.on("pageerror", (e) => seite.push((e.message || String(e)).split("\n")[0]));
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        // H und sein Selbsttest HS in DERSELBEN Seite (eine Maske, ein Labor-Bild), VOR den Blicken B (K64-n3); die Seite des
        // alten Culling-Stands (BS) zählt nur Befehle
        let hell = null;
        if (!alt) {
            const w = await page.evaluate(blickProbe, { nurWarten: true });
            if (w.fehler) return { fehler: w.fehler, seite };
            await page.evaluate(AUSGABE_INSTALL);
            hell = await page.evaluate(hellProbe);
        }
        const o = await page.evaluate(blickProbe, { alt });
        o.hell = hell;
        o.seite = seite;
        await page.close();
        return o;
    };
    try {
        const b = await lauf(false);
        if (b.fehler) throw new Error(b.fehler);
        console.log(
            `=== B — der Blick am Genesis-Ring ${JSON.stringify(b.mitte)} (WebGPU auf swiftshader, ${b.membranen} Membranen) ===`
        );
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
        // je Bild Wanduhr und kalte Programme: „M 512 ms/0 kalt"
        const kaltZeile = (h) =>
            ["A", "M", "R", "L"]
                .map(
                    (k) =>
                        `${k} ${h.zeit[k]} ms/${h.kalt[k] == null ? "?" : h.kalt[k]} kalt` +
                        (h.ruhe[k] ? `/${h.ruhe[k].n} F ${h.ruhe[k].ms} ms/${h.ruhe[k].offen} offen` : "")
                )
                .join(" · ") + `; offen beim Start ${h.offenStart == null ? "?" : h.offenStart}`;
        // `w`: das Bild unter dem Urteil (welt = das Spiel, roh = der alte Leser), gegen DASSELBE Labor-Bild in DERSELBEN Maske
        const hellZeile = (h, w) =>
            `${h.n} Membran-Pixel (${(h.anteil * 100).toFixed(1)} %), Y ${w === h.welt ? "Welt" : "roh"} ${w.Y.toFixed(1)} gegen Labor ${h.labor.Y.toFixed(1)} (× ${(w.Y / Math.max(1, h.labor.Y)).toFixed(2)}), Sättigung ${w.saettigung.toFixed(3)} gegen Labor ${h.labor.saettigung.toFixed(3)}, ` +
            `Y > 240 ${(w.weiss * 100).toFixed(1)} %, Belichtung ${h.belichtung.toFixed(3)}, Labor ${h.laborFormat} — ${h.imBild.join(" · ")} [${kaltZeile(h)}]`;
        const hellRot = (h, w) =>
            !(
                h.n > 200 &&
                h.labor.Y > 0 &&
                w.Y <= HELL.hub * h.labor.Y &&
                w.saettigung >= HELL.bleich * h.labor.saettigung &&
                w.weiss <= HELL.weiss
            );
        check(
            `H aus der Ring-Mitte: die Welt hebt die Membran nicht über ihr Labor-Bild (Y ≤ ${HELL.hub} × Labor), bleicht sie nicht (Sättigung ≥ ${HELL.bleich} × Labor) und brennt nicht aus (Y > 240 ≤ ${HELL.weiss * 100} %)`,
            !hellRot(b.hell, b.hell.welt),
            hellZeile(b.hell, b.hell.welt)
        );
        check(
            "HS Selbsttest: der rohe Leser (Anzeige-Wert als Strahlung) wird in H rot beim Namen",
            hellRot(b.hell, b.hell.roh),
            hellZeile(b.hell, b.hell.roh)
        );
        // HM (K64-n3, die CI-Frist): die Maske übersetzt kein Programm — ein kaltes Programm kostete auf swiftshader in der CI
        // 195 s (die magenta Maske bis K64-n3); HMS: derselbe Zähler sieht die kalten Programme des rohen Lesers (nicht vakuös)
        check(
            "HM die Maske zeichnet ohne kaltes Programm",
            b.hell.kalt.M === 0,
            `M: ${b.hell.kalt.M == null ? "Zähler fehlt (r184 _pipelines.programs)" : `${b.hell.kalt.M} kalte Programme`} [${kaltZeile(b.hell)}]`
        );
        check(
            "HMS Selbsttest: der Zähler sieht die kalten Programme des rohen Lesers",
            b.hell.kalt.R > 0,
            `R: ${b.hell.kalt.R == null ? "Zähler fehlt" : `${b.hell.kalt.R} kalte Programme`}`
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
            res.n.sichtbar = !!(rec.nebel && rec.nebel.visible === rec._act > 0.001);
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
        check(
            "N: mu.fog speist die nebelAct-Uniform (> 0 bei Nähe) — die Kette Dial→mu→Uniform lebt",
            out.n.uniform === true
        );
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
