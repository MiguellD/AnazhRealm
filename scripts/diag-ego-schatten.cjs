#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-ego-schatten.cjs — DIE EGO-SCHATTEN-WAND (gate:ego-schatten, 0910-5)
//
// Befund (Gegenprüfung 0710-12): in der Ego-Sicht, dem Standard-Blick (`cameraMode: "first"`), warf der Spieler KEINEN
// Schatten. `_applyEgoSicht` blendete Kopf und Haut mit `visible = false` aus — und nahm damit den Wurf. Der Schnitt:
// EIN Ebenen-Schalter. Im 1st verlässt der Leib die Ebene 0 der Haupt-Kamera und liegt auf SHADOW_TWIN_LAYER; die
// Kaskaden sehen ihn ganz, das Auge nie (Lehre 26: unsichtbar für die Haupt-Kamera heißt Ebene, nie Transparenz).
//
// Die Linse fährt den ECHTEN Renderer (swiftshader, kienspan) an einer eigenen Bühne: der ECHTE Leib des Spielers
// (`state.playerMesh`, der Mensch aus dem Ofen), die ECHTE Regel (`_applyEgoSicht` über setCameraMode und _loopCamera),
// die ECHTE Haupt-Kamera am Auge (ihre Ebenen), ein Boden und ein Richtungslicht, dessen Schatten-Kamera die Ebenen des
// Spiel-Lichts trägt (der Vertrag, den die Kaskaden klonen). Die Sonne steht seitlich hinter dem Leib (30° hoch, der
// Schatten fällt 35° neben der Blickachse); der Blick geht 49° hinab. Je Schuss ein Render in ein Ziel (192×108):
//   E1/E0 Ego mit/ohne Wurf des Leibs · X ohne Leib · D1/D0 dieselbe Pose (dieselbe Kamera) in der 3rd-Person mit/ohne Wurf.
// Gemessen: die Schatten-Maske des Spielers am Boden (E0 − E1 bzw. D0 − D1 dunkler als SCHWELLE), ohne die Bildpunkte,
// die in der 3rd-Person der Leib selbst deckt (|D0 − X|), und die Leib-Punkte im Ego-Bild (|E0 − X|). Das Urteil nennt:
//   LEIB WIRFT NICHT — in der Ego-Sicht 0 px Schatten des Spielers (main: die Haut verborgen, der Wurf mit ihr).
//   UMRISS — der Ego-Schatten deckt den der 3rd-Person zu IoU < 0,9: es wirft nicht der ganze Leib.
//   AUGE — die Haupt-Kamera sieht in der Ego-Sicht Leib (Bildpunkte vor dem Auge oder ein sichtbares Leib-Mesh auf
//          Ebene 0).
//   GERÄT — das Gerät in der Hand (`_gehalten`) verlässt in der Ego-Sicht die Ebene 0 (das Auge sähe es nicht).
//   ZWILLING — ein Knoten, der nur in den Kaskaden lebt, liegt nach 1st → 3rd auf Ebene 0 (die Haupt-Kamera sähe ihn).
//   ZURÜCK — 3rd gibt nicht jede Maske zurück, oder die Regel schaltet `visible`.
//   VERTRAG — die Haupt-Kamera sieht SHADOW_TWIN_LAYER, oder eine Schatten-Kamera des Spiel-Lichts sieht sie nicht.
//   BLIND — die 3rd-Person wirft auf der Bühne nicht (die Linse sähe nichts).
// GEGENPROBE im selben Lauf: vier eingeschmuggelte Regeln fallen je beim Namen — die von main (`visible`), „Ebene 0
// bleibt", „fremde Ebene", „das Gerät mit" und „Zwilling geweckt"; fällt eine nicht, ist die Linse blind.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil über einen grünen Lauf und je einen Täter.
//   node scripts/diag-ego-schatten.cjs [--selftest]   (npm run gate:ego-schatten; Port EGO_SCHATTEN_PORT, 4398)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const IOU_SOLL = 0.9; // der Ego-Schatten deckt den der 3rd-Person (dieselbe Pose)
const WURF_MIN = 400; // Bildpunkte: so viel Schatten wirft der Leib auf der Bühne mindestens (192×108)
const SCHWELLE = 8; // Luma-Stufen (8 bit, linear): dunkler als das zählt als Schatten, verschieden als Leib

// Das Urteil über EINE Regel (m: ihre Messung, d: die 3rd-Referenz der echten Regel).
function regelUrteil(m, d) {
    const v = [];
    if (m.ego.wurf === 0)
        v.push(
            `LEIB WIRFT NICHT: in der Ego-Sicht 0 px Schatten des Spielers am Boden (3rd-Person: ${d.wurf} px) — die Ego-Regel nimmt dem Leib den Wurf`
        );
    else if (!(m.iou >= IOU_SOLL))
        v.push(
            `UMRISS: der Ego-Schatten deckt den der 3rd-Person zu IoU ${m.iou} (Soll ≥ ${IOU_SOLL}; Ego ${m.ego.wurf} px, 3rd ${d.wurf} px) — es wirft nicht der ganze Leib`
        );
    if (m.ego.leibPx > 0 || m.ego.leibAufNull > 0)
        v.push(
            `AUGE: die Haupt-Kamera sieht in der Ego-Sicht Leib — ${m.ego.leibPx} Bildpunkte vor dem Auge, ${m.ego.leibAufNull} sichtbare Leib-Meshes auf Ebene 0`
        );
    if (m.geraet !== true)
        v.push(
            `GERÄT: das Gerät in der Hand liegt in der Ego-Sicht auf Maske ${m.geraet} statt 1 (Ebene 0) — das Auge sähe es nicht`
        );
    if (m.zwilling !== true)
        v.push(
            `ZWILLING: ein Knoten, der nur in den Kaskaden lebt, trägt nach 1st → 3rd die Maske ${m.zwilling} — die Haupt-Kamera sähe ihn`
        );
    if (m.zurueck !== true) v.push(`ZURÜCK: ${m.zurueck}`);
    return v;
}

function urteil(z) {
    const v = [];
    const d = z.dritt || {};
    if (!(d.wurf >= WURF_MIN))
        v.push(
            `BLIND: die 3rd-Person wirft auf der Bühne ${d.wurf} px (Soll ≥ ${WURF_MIN}) — die Linse sähe keinen Schatten`
        );
    if (z.vertrag !== true) v.push(`VERTRAG: ${z.vertrag}`);
    for (const s of regelUrteil(z.kopf, d)) v.push(s);
    for (const t of z.gegenprobe || []) {
        const r = regelUrteil(t.m, d);
        if (!r.some((s) => s.startsWith(t.soll)))
            v.push(
                `GEGENPROBE: die Regel „${t.name}" fällt nicht als ${t.soll} (${r.join(" · ") || "grün"}) — die Linse ist blind`
            );
    }
    return v;
}

const GEGENPROBEN = [
    { name: "main: visible", soll: "LEIB WIRFT NICHT" },
    { name: "Ebene 0 bleibt", soll: "AUGE" },
    { name: "fremde Ebene", soll: "LEIB WIRFT NICHT" },
    { name: "das Gerät mit", soll: "GERÄT" },
    { name: "Zwilling geweckt", soll: "ZWILLING" },
];

function selbsttest() {
    const gut = () => ({
        ego: { wurf: 1500, leibPx: 0, leibAufNull: 0 },
        iou: 1,
        geraet: true,
        zwilling: true,
        zurueck: true,
    });
    const gruen = {
        dritt: { wurf: 1500, leib: 900 },
        vertrag: true,
        kopf: gut(),
        gegenprobe: [
            {
                name: "main: visible",
                soll: "LEIB WIRFT NICHT",
                m: Object.assign(gut(), { ego: { wurf: 0, leibPx: 0, leibAufNull: 0 } }),
            },
            {
                name: "Ebene 0 bleibt",
                soll: "AUGE",
                m: Object.assign(gut(), { ego: { wurf: 1500, leibPx: 40, leibAufNull: 8 } }),
            },
            {
                name: "fremde Ebene",
                soll: "LEIB WIRFT NICHT",
                m: Object.assign(gut(), { ego: { wurf: 0, leibPx: 0, leibAufNull: 0 } }),
            },
            { name: "das Gerät mit", soll: "GERÄT", m: Object.assign(gut(), { geraet: 4 }) },
            { name: "Zwilling geweckt", soll: "ZWILLING", m: Object.assign(gut(), { zwilling: 5 }) },
        ],
    };
    const fehler = [];
    if (urteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + urteil(gruen).join(" · "));
    const mit = (pfad, wert) => {
        const z = JSON.parse(JSON.stringify(gruen));
        let o = z;
        for (const k of pfad ? pfad.split(".") : []) o = o[k];
        Object.assign(o, wert);
        return z;
    };
    const faelle = [
        {
            name: "main (der Wurf geht mit der Haut)",
            z: mit("kopf.ego", { wurf: 0 }),
            muss: /LEIB WIRFT NICHT: in der Ego-Sicht 0 px/,
        },
        { name: "nur der Rumpf wirft", z: mit("kopf", { iou: 0.62 }), muss: /UMRISS: .* IoU 0\.62/ },
        { name: "Leib vor dem Auge", z: mit("kopf.ego", { leibPx: 12 }), muss: /AUGE: .* 12 Bildpunkte vor dem Auge/ },
        {
            name: "Leib-Mesh auf Ebene 0",
            z: mit("kopf.ego", { leibAufNull: 3 }),
            muss: /AUGE: .* 3 sichtbare Leib-Meshes auf Ebene 0/,
        },
        { name: "Gerät verborgen", z: mit("kopf", { geraet: 4 }), muss: /GERÄT: .* Maske 4 statt 1/ },
        { name: "Zwilling geweckt", z: mit("kopf", { zwilling: 5 }), muss: /ZWILLING: .* Maske 5/ },
        {
            name: "visible geschaltet",
            z: mit("kopf", { zurueck: "die Regel schaltet visible an 2 Knoten" }),
            muss: /ZURÜCK: die Regel schaltet visible/,
        },
        {
            name: "Haupt-Kamera sieht die Zwillings-Ebene",
            z: mit("", { vertrag: "die Haupt-Kamera sieht Ebene 2" }),
            muss: /VERTRAG: die Haupt-Kamera sieht Ebene 2/,
        },
        {
            name: "Bühne ohne Schatten",
            z: mit("dritt", { wurf: 3 }),
            muss: /BLIND: die 3rd-Person wirft auf der Bühne 3 px/,
        },
        {
            name: "Gegenprobe blind",
            z: mit("gegenprobe.0.m.ego", { wurf: 1500 }),
            muss: /GEGENPROBE: die Regel „main: visible" fällt nicht/,
        },
    ];
    for (const f of faelle) {
        const v = urteil(f.z);
        if (!v.some((s) => f.muss.test(s))) fehler.push(`${f.name}: die Wand nennt den Täter nicht (${f.muss})`);
        console.log(`  ${v.length ? "✅" : "❌"} Selbsttest „${f.name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== EGO-SCHATTEN — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.EGO_SCHATTEN_PORT) || 4398;
const BILDER = (() => {
    const i = process.argv.indexOf("--bilder");
    return i > 0 ? path.resolve(process.argv[i + 1]) : null;
})();
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
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

// DIE BÜHNE (Seiten-Kontext): der echte Renderer, der echte Leib, die echte Regel; eigene Szene, Zeit fest.
function buehne(arg) {
    return (async () => {
        const { W, H, SCHWELLE, bilder } = arg;
        const r = window.anazhRealm,
            st = r.state,
            T = window.THREE;
        const rend = st.renderer;
        const E = r.constructor.SHADOW_TWIN_LAYER;
        const P = Object.getPrototypeOf(r);
        const nf = rend._nodes.nodeFrame;
        const zeit = nf.time;
        nf.update = function () {
            this.frameId++;
            this.deltaTime = 0;
            this.time = zeit;
        };
        const aus = { ms: {} };
        const t0 = performance.now();
        const pm = st.playerMesh;
        const kam = st.camera;
        const modusAlt = st.cameraMode;
        const yawAlt = st.yaw,
            pitchAlt = st.pitch;
        const schattenAlt = rend.shadowMap.enabled;
        const elternAlt = pm.parent;
        rend.shadowMap.enabled = true;
        const szene = new T.Scene();
        szene.name = "ego-schatten:buehne";
        const ziel = new T.RenderTarget(W, H, { depthBuffer: true });
        ziel.texture.name = "ego-schatten:bild";
        const knoten = [];
        const sammle = (o) => {
            if (o.userData && o.userData._gehalten) return;
            knoten.push(o);
            for (const k of o.children) sammle(k);
        };
        const kopf = pm.userData && pm.userData.parts && pm.userData.parts.head;
        if (kopf) sammle(kopf);
        for (const ch of pm.children) if (ch.userData && ch.userData._creatureSkin) sammle(ch);
        const meshes = [...new Set(knoten)].filter((o) => o.isMesh);
        const wirft = meshes.filter((o) => o.castShadow);
        try {
            // der Vertrag: die Haupt-Kamera sieht SHADOW_TWIN_LAYER nie, jede Schatten-Kamera des Spiel-Lichts sieht sie
            const dl = st.directionalLight;
            const kaskaden = st.csmNode && Array.isArray(st.csmNode.lights) ? st.csmNode.lights : [];
            const schattenKameras = [dl.shadow.camera, ...kaskaden.map((l) => l.shadow && l.shadow.camera)].filter(
                Boolean
            );
            const blinde = schattenKameras.filter((c) => !c.layers.isEnabled(E)).length;
            aus.vertrag = kam.layers.isEnabled(E)
                ? `die Haupt-Kamera sieht Ebene ${E}`
                : blinde
                  ? `${blinde} von ${schattenKameras.length} Schatten-Kameras des Spiel-Lichts sehen Ebene ${E} nicht`
                  : true;
            aus.schattenKameras = schattenKameras.length;
            // die Pose: der Mensch steht, die Sonne 30° hoch seitlich hinter ihm, der Blick 49° hinab
            st.yaw = 0;
            st.pitch = -0.85;
            r.setCameraMode("third");
            szene.add(pm);
            pm.updateMatrixWorld(true);
            const box = new T.Box3().setFromObject(pm);
            const fuss = box.min.y;
            const mitte = pm.position.clone();
            mitte.y = fuss + 0.9;
            const vorn = new T.Vector3(Math.sin(st.yaw), 0, Math.cos(st.yaw));
            const rechts = new T.Vector3(-Math.cos(st.yaw), 0, Math.sin(st.yaw));
            const fall = vorn
                .clone()
                .multiplyScalar(Math.cos(0.61))
                .addScaledVector(rechts, Math.sin(0.61))
                .normalize();
            const hoch = (30 * Math.PI) / 180;
            const licht = new T.DirectionalLight(0xffffff, 6);
            licht.position
                .copy(mitte)
                .addScaledVector(fall, -25 * Math.cos(hoch))
                .add(new T.Vector3(0, 25 * Math.sin(hoch), 0));
            licht.target.position.copy(mitte);
            licht.castShadow = true;
            licht.shadow.mapSize.set(1024, 1024);
            Object.assign(licht.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 60 });
            licht.shadow.camera.layers.mask = dl.shadow.camera.layers.mask;
            licht.shadow.camera.updateProjectionMatrix();
            szene.add(licht, licht.target, new T.AmbientLight(0xffffff, 1.5));
            const diaet = (m) => (typeof r._materialObserverDiaet === "function" ? r._materialObserverDiaet(m) : m);
            const boden = new T.Mesh(
                new T.PlaneGeometry(16, 16),
                diaet(new T.MeshStandardNodeMaterial({ color: 0xb0b0b0 }))
            );
            boden.rotation.x = -Math.PI / 2;
            boden.position.set(mitte.x, fuss, mitte.z);
            boden.receiveShadow = true;
            boden.frustumCulled = false;
            szene.add(boden);
            // die Ego-Kamera stellt das Spiel (_loopCamera, 1st); die 3rd-Schüsse halten genau diese Pose
            r.setCameraMode("first");
            r._loopCamera(performance.now() / 1000);
            const pose = { p: kam.position.clone(), q: kam.quaternion.clone() };
            const halte = () => {
                kam.position.copy(pose.p);
                kam.quaternion.copy(pose.q);
                kam.updateMatrixWorld(true);
            };
            aus.kamera = { auge: +(pose.p.y - fuss).toFixed(2), fov: kam.fov };
            const frame = () => {
                halte();
                rend.setRenderTarget(ziel);
                rend.render(szene, kam);
                rend.setRenderTarget(null);
            };
            const bildDaten = {};
            const schuss = async (name) => {
                await window.__erstRuhe(frame, { erstFristMs: 60000 }, "die Ego-Schatten-Bühne");
                frame();
                const px = await rend.readRenderTargetPixelsAsync(ziel, 0, 0, W, H);
                const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                const zeile = u8.length / H;
                const l = new Float32Array(W * H);
                for (let y = 0; y < H; y++)
                    for (let x = 0; x < W; x++) {
                        const i = y * zeile + x * 4;
                        l[y * W + x] = 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
                    }
                if (bilder) {
                    const rgba = new Uint8ClampedArray(W * H * 4);
                    for (let y = 0; y < H; y++) rgba.set(u8.subarray(y * zeile, y * zeile + W * 4), y * W * 4);
                    bildDaten[name] = Array.from(rgba);
                }
                return l;
            };
            const wurfAus = (an) => {
                for (const o of wirft) o.castShadow = an;
            };
            const dunkler = (ohne, mit) => {
                const m = new Uint8Array(W * H);
                for (let i = 0; i < m.length; i++) m[i] = ohne[i] - mit[i] > SCHWELLE ? 1 : 0;
                return m;
            };
            const anders = (a, b) => {
                const m = new Uint8Array(W * H);
                for (let i = 0; i < m.length; i++) m[i] = Math.abs(a[i] - b[i]) > SCHWELLE ? 1 : 0;
                return m;
            };
            const summe = (m) => m.reduce((s, x) => s + x, 0);
            // X: ohne Leib (der Boden allein)
            pm.visible = false;
            const X = await schuss("x-ohne-leib");
            pm.visible = true;
            aus.ms.erst = Math.round(performance.now() - t0);
            // die 3rd-Referenz mit der ECHTEN Regel: dieselbe Kamera, der Leib auf Ebene 0
            r.setCameraMode("third");
            wurfAus(true);
            const D1 = await schuss("d1-dritt-wurf");
            wurfAus(false);
            const D0 = await schuss("d0-dritt-ohne");
            wurfAus(true);
            const S3 = dunkler(D0, D1);
            const B3 = anders(D0, X);
            const s3 = S3.map((x, i) => (B3[i] ? 0 : x));
            aus.dritt = { wurf: summe(s3), leib: summe(B3) };
            const egoMessen = async (tag) => {
                r.setCameraMode("first");
                wurfAus(true);
                const E1 = await schuss(tag + "-e1-ego-wurf");
                wurfAus(false);
                const E0 = await schuss(tag + "-e0-ego-ohne");
                wurfAus(true);
                const se = dunkler(E0, E1).map((x, i) => (B3[i] ? 0 : x));
                let schnitt = 0,
                    vereint = 0;
                for (let i = 0; i < se.length; i++) {
                    if (se[i] && s3[i]) schnitt++;
                    if (se[i] || s3[i]) vereint++;
                }
                // ein Leib-Mesh, das die Haupt-Kamera zeichnen würde: auf Ebene 0 und sichtbar bis zum Leib hinauf
                const zeichnet = (o) => {
                    for (let p = o; p && p !== szene; p = p.parent) if (!p.visible) return false;
                    return true;
                };
                const leibAufNull = meshes.filter((o) => o.layers.isEnabled(0) && zeichnet(o)).length;
                const ego = { wurf: summe(se), leibPx: summe(anders(E0, X)), leibAufNull };
                r.setCameraMode("third");
                return { ego, iou: vereint ? +(schnitt / vereint).toFixed(4) : 0 };
            };
            // die Struktur je Regel: Gerät, Zwilling, Rückgabe, visible (ohne Bild — die Prüf-Knoten zeichnen nie mit)
            const struktur = () => {
                const skin = pm.children.find((c) => c.userData && c.userData._creatureSkin);
                const rig = pm.userData.rig;
                const hand = (rig && rig.armR && rig.armR.wrist) || skin;
                const geraet = new T.Mesh(new T.BoxGeometry(0.05, 0.05, 0.05), new T.MeshBasicNodeMaterial());
                geraet.userData._gehalten = true;
                geraet.visible = false;
                hand.add(geraet);
                const zw = new T.Mesh(new T.BoxGeometry(0.05, 0.05, 0.05), new T.MeshBasicNodeMaterial());
                zw.layers.set(E);
                zw.visible = false;
                skin.add(zw);
                const alle = [];
                pm.traverse((o) => alle.push([o, o.layers.mask, o.visible]));
                r.setCameraMode("first");
                const geraetEgo = geraet.layers.mask;
                r.setCameraMode("third");
                const zwDritt = zw.layers.mask;
                let maske = 0,
                    sicht = 0;
                for (const [o, m, s] of alle) {
                    if (o.layers.mask !== m) maske++;
                    if (o.visible !== s) sicht++;
                }
                hand.remove(geraet);
                skin.remove(zw);
                geraet.geometry.dispose();
                zw.geometry.dispose();
                return {
                    geraet: geraetEgo === 1 ? true : geraetEgo,
                    zwilling: zwDritt === 1 << E ? true : zwDritt,
                    zurueck:
                        maske || sicht
                            ? `nach 1st → 3rd tragen ${maske} Knoten eine andere Maske, ${sicht} eine andere Sichtbarkeit (die Regel schaltet visible oder gibt die Maske nicht zurück)`
                            : true,
                };
            };
            // der Ausgangs-Stand (3rd, die echte Regel) — nach jeder Gegenprobe kehrt der Leib genau dorthin zurück
            r.setCameraMode("third");
            const stand = [];
            pm.traverse((o) => stand.push([o, o.layers.mask, o.visible]));
            const zurueckStellen = () => {
                delete r._applyEgoSicht;
                for (const [o, m, s] of stand) {
                    o.layers.mask = m;
                    o.visible = s;
                    if (o.userData) o.userData._egoMaske = undefined;
                }
                r.setCameraMode("third");
            };
            const tE = performance.now();
            aus.kopf = Object.assign(await egoMessen("kopf"), struktur());
            aus.ms.kopf = Math.round(performance.now() - tE);
            // DIE GEGENPROBE: eingeschmuggelte Regeln, je eine Klasse
            const leibJe = (p, f) => {
                const h = p.userData && p.userData.parts && p.userData.parts.head;
                const geh = (o) => {
                    if (o.userData && o.userData._gehalten && f.gehalten !== true) return;
                    f(o);
                    for (const k of o.children) geh(k);
                };
                if (h) geh(h);
                for (const ch of p.children) if (ch.userData && ch.userData._creatureSkin) geh(ch);
            };
            const regeln = {
                "main: visible": function () {
                    const p = this.state.playerMesh;
                    const third = this.state.cameraMode === "third";
                    const h = p.userData && p.userData.parts && p.userData.parts.head;
                    if (h) h.visible = third;
                    for (const ch of p.children) if (ch.userData && ch.userData._creatureSkin) ch.visible = third;
                },
                "Ebene 0 bleibt": function () {
                    const third = this.state.cameraMode === "third";
                    leibJe(this.state.playerMesh, (o) => (third ? o.layers.disable(E) : o.layers.enable(E)));
                },
                // der GANZE Leib (auch ein Zwilling, der den Wurf trägt) auf eine Ebene, die keine Schatten-Kamera sieht
                "fremde Ebene": function () {
                    const third = this.state.cameraMode === "third";
                    leibJe(this.state.playerMesh, (o) => {
                        if (third) {
                            if (o.userData._egoMaske !== undefined) o.layers.mask = o.userData._egoMaske;
                            o.userData._egoMaske = undefined;
                        } else if (o.userData._egoMaske === undefined) {
                            o.userData._egoMaske = o.layers.mask;
                            o.layers.mask = 1 << 5;
                        }
                    });
                },
                "das Gerät mit": function () {
                    const third = this.state.cameraMode === "third";
                    const f = (o) => {
                        if (third) {
                            if (o.userData._egoMaske !== undefined) o.layers.mask = o.userData._egoMaske;
                            o.userData._egoMaske = undefined;
                        } else if (o.layers.mask & 1) {
                            o.userData._egoMaske = o.layers.mask;
                            o.layers.mask = (o.layers.mask & ~1) | (1 << E);
                        }
                    };
                    f.gehalten = true;
                    leibJe(this.state.playerMesh, f);
                },
                "Zwilling geweckt": function () {
                    const third = this.state.cameraMode === "third";
                    leibJe(this.state.playerMesh, (o) => {
                        if (third) {
                            o.layers.enable(0);
                            o.layers.disable(E);
                        } else {
                            o.layers.disable(0);
                            o.layers.enable(E);
                        }
                    });
                },
            };
            aus.gegenprobe = [];
            const tG = performance.now();
            for (const g of arg.gegenproben) {
                r._applyEgoSicht = regeln[g.name];
                // nur die Regeln, deren Klasse ein Bild braucht, rendern; die übrigen urteilen an der Struktur
                const bild = g.soll === "LEIB WIRFT NICHT" || g.soll === "AUGE";
                const m = bild
                    ? await egoMessen(g.name.replace(/[^a-z0-9]+/gi, "-"))
                    : { ego: aus.kopf.ego, iou: aus.kopf.iou };
                zurueckStellen();
                r._applyEgoSicht = regeln[g.name];
                Object.assign(m, struktur());
                zurueckStellen();
                aus.gegenprobe.push({ name: g.name, soll: g.soll, m });
            }
            aus.ms.gegenprobe = Math.round(performance.now() - tG);
            aus.leib = { meshes: meshes.length, wirft: wirft.length };
            if (st.playerMesh !== pm)
                throw new Error(
                    "der Leib wurde während der Bühne neu gegossen — die Regel erreichte den gemessenen Körper nicht"
                );
            if (bilder) aus.bilder = bildDaten;
        } finally {
            delete r._applyEgoSicht;
            st.yaw = yawAlt;
            st.pitch = pitchAlt;
            r.setCameraMode(modusAlt);
            if (elternAlt) elternAlt.add(pm);
            pm.visible = true;
            rend.shadowMap.enabled = schattenAlt;
            ziel.dispose();
        }
        aus.ms.gesamt = Math.round(performance.now() - t0);
        return aus;
    })();
}

(async () => {
    console.log("=== EGO-SCHATTEN — der Leib wirft in der Ego-Sicht, das Auge sieht ihn nicht ===");
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 180 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    let out = null;
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        await page.evaluate(AUSGABE_INSTALL);
        // der Renderer und der Leib aus dem Ofen (der Mensch mit seiner Haut) — erst NACH dem Foundry-Buch: seine Ankunft
        // gießt den Avatar einmal neu (`_foundryIngestRecipes`, die Konstanten-Gestalt zieht nach), und eine Bühne am alten
        // Leib misst einen Körper, den keine Regel mehr erreicht. Danach ruht der Spiel-Loop.
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            while (performance.now() - t0 < 240000) {
                const r = window.anazhRealm;
                const st = r && r.state;
                const pm = st && st.playerMesh;
                if (
                    st &&
                    st.rendererReady &&
                    st.renderer &&
                    st.renderer.backend &&
                    r._foundry &&
                    r._foundry.recipes &&
                    !st._deferredAvatarSoul &&
                    pm &&
                    pm.children.some((c) => c.userData && c.userData._creatureSkin)
                ) {
                    st.renderer.setAnimationLoop(null);
                    for (const c of st.creatures || []) c.visible = false;
                    return {
                        ok: true,
                        ms: Math.round(performance.now() - t0),
                        webgpu: st.renderer.backend.isWebGPUBackend === true,
                        seele: st.player && st.player.soul,
                    };
                }
                await new Promise((res) => setTimeout(res, 100));
            }
            return { ok: false };
        });
        if (!bereit.ok) throw new Error("Renderer oder Leib standen nach 240 s nicht");
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend — die Bühne wäre nicht der Renderer des Spiels");
        log(`Renderer und Leib (${bereit.seele}) bereit nach ${Math.round(bereit.ms / 1000)} s`);
        out = await page.evaluate(buehne, { W: 192, H: 108, SCHWELLE, bilder: !!BILDER, gegenproben: GEGENPROBEN });
        log(
            `Bühne ${Math.round(out.ms.gesamt / 1000)} s (Erst-Zeichnung ${Math.round(out.ms.erst / 1000)} s, echte Regel ` +
                `${Math.round(out.ms.kopf / 1000)} s, Gegenprobe ${Math.round(out.ms.gegenprobe / 1000)} s) · Leib ${out.leib.meshes} Meshes, ` +
                `${out.leib.wirft} werfen · Auge ${out.kamera.auge} m über dem Fuß · ${out.schattenKameras} Schatten-Kameras im Vertrag`
        );
        log(`3rd-Person: Schatten ${out.dritt.wurf} px, Leib im Bild ${out.dritt.leib} px`);
        log(`Ego (Kopf): ${JSON.stringify(out.kopf)}`);
        for (const g of out.gegenprobe) log(`Gegenprobe „${g.name}": ${JSON.stringify(g.m)}`);
        if (BILDER && out.bilder) {
            fs.mkdirSync(BILDER, { recursive: true });
            const roh = (n) => Buffer.from(out.bilder[n]);
            fs.writeFileSync(
                path.join(BILDER, "bilder.json"),
                JSON.stringify({ W: 192, H: 108, namen: Object.keys(out.bilder) })
            );
            for (const n of Object.keys(out.bilder)) fs.writeFileSync(path.join(BILDER, n + ".rgba"), roh(n));
            delete out.bilder;
            log(`Bilder (RGBA 192×108) in ${BILDER}`);
        }
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    const v = urteil(out);
    if (pageErrors.length) v.push(`${pageErrors.length} Seiten-Fehler: ${pageErrors[0]}`);
    if (v.length) {
        console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
        for (const s of v) console.log("   • " + s);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — in der Ego-Sicht wirft der Leib ${out.kopf.ego.wurf} px Schatten am Boden, IoU ${out.kopf.iou} gegen dieselbe ` +
            `Pose in der 3rd-Person (${out.dritt.wurf} px); die Haupt-Kamera sieht 0 Bildpunkte Leib, kein Leib-Mesh liegt auf Ebene 0; ` +
            `das Gerät bleibt auf Ebene 0, ein Zwilling bleibt in den Kaskaden, 3rd gibt jede Maske zurück, visible wechselt nie; ` +
            `die ${out.gegenprobe.length} Gegenproben fallen je beim Namen (${out.gegenprobe.map((g) => g.soll).join(" · ")}).`
    );
})();
