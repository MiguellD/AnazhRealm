#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-ego-schatten.cjs — DIE EGO-SCHATTEN-WAND (gate:ego-schatten, 0910-5)
//
// In der Ego-Sicht wirft der Spieler: im 1st verlässt der Leib die Ebene 0 der Haupt-Kamera und liegt auf SHADOW_TWIN_LAYER;
// die Kaskaden sehen ihn ganz, das Auge nie (Lehre 26: unsichtbar für die Haupt-Kamera heißt Ebene, nie Transparenz).
//
// Die Linse fährt den ECHTEN Renderer (swiftshader, kienspan) an einer eigenen Bühne: der ECHTE Leib des Spielers
// (`state.playerMesh`, der Mensch aus dem Ofen) in BEIDEN Stufen, die er trägt (je Lauf `grob` vor dem Bild, `fein` nach
// dem Tausch, B5), die ECHTE Regel (`_applyEgoSicht` über setCameraMode und _loopCamera),
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
//   BLIND — die 3rd-Person wirft auf der Bühne nicht (die Linse sähe nichts). STUFE — die Bühne misst nicht ihren Leib.
// GEGENPROBE im selben Lauf: sechs Täter fallen je beim Namen — die Regel von main (`visible`), „Ebene 0 bleibt", „fremde
// Ebene", „das Gerät mit", „Zwilling geweckt" und die Bühne ohne Frame-Schritt („Karte steht"); fällt einer nicht, ist die Linse blind.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil über einen grünen Lauf und je einen Täter.
//   node scripts/diag-ego-schatten.cjs [--selftest]   (npm run gate:ego-schatten)
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
    { name: "Karte steht", soll: "LEIB WIRFT NICHT" },
];
const STUFEN = [
    ["grob", 1],
    ["fein", 0],
];

// Das Urteil über den Lauf: je Stufe des Leibs, die Bühne misst den Leib, den ihr Name sagt.
function urteilJeStufe(lauf) {
    const v = [];
    for (const [name, stufe] of STUFEN) {
        const z = lauf[name] || {};
        if (z.stufe !== stufe)
            v.push(
                `STUFE: die Bühne „${name}" misst den Leib mit nahStufe ${z.stufe} statt ${stufe} — nicht den, den der Spieler ${stufe ? "vor" : "nach"} dem Bild trägt`
            );
        for (const x of urteil(z)) v.push(`${name}: ${x}`);
    }
    return v;
}

function selbsttest() {
    const { taeterFaelle, selbsttestEnde } = require("./lib/welt-boot.cjs");
    const gut = (x) => Object.assign({ ego: { wurf: 1500, leibPx: 0, leibAufNull: 0 }, iou: 1, geraet: true, zwilling: true, zurueck: true }, x); // prettier-ignore
    // je Gegenprobe die Messung ihrer Klasse (die Täter-Regel fällt beim Namen)
    const taeter = { "LEIB WIRFT NICHT": { ego: { wurf: 0, leibPx: 0, leibAufNull: 0 } }, AUGE: { ego: { wurf: 1500, leibPx: 40, leibAufNull: 8 } }, "GERÄT": { geraet: 4 }, ZWILLING: { zwilling: 5 } }; // prettier-ignore
    const stufe = (n) => ({ stufe: n, dritt: { wurf: 1500, leib: 900 }, vertrag: true, kopf: gut(), gegenprobe: GEGENPROBEN.map((g) => Object.assign({ m: gut(taeter[g.soll]) }, g)) }); // prettier-ignore
    const gruen = { grob: stufe(1), fein: stufe(0) };
    const fehler = [];
    if (urteilJeStufe(gruen).length) fehler.push("der grüne Lauf fällt rot: " + urteilJeStufe(gruen).join(" · "));
    const mit = (pfad, wert) => {
        const z = JSON.parse(JSON.stringify(gruen));
        let o = z;
        for (const k of pfad ? pfad.split(".") : []) o = o[k];
        Object.assign(o, wert);
        return z;
    };
    // prettier-ignore
    const faelle = [
        { name: "main (der Wurf geht mit der Haut)", z: mit("fein.kopf.ego", { wurf: 0 }), muss: /LEIB WIRFT NICHT: in der Ego-Sicht 0 px/ },
        { name: "nur der Rumpf wirft", z: mit("fein.kopf", { iou: 0.62 }), muss: /UMRISS: .* IoU 0\.62/ },
        { name: "Leib vor dem Auge", z: mit("fein.kopf.ego", { leibPx: 12 }), muss: /AUGE: .* 12 Bildpunkte vor dem Auge/ },
        { name: "Leib-Mesh auf Ebene 0", z: mit("fein.kopf.ego", { leibAufNull: 3 }), muss: /AUGE: .* 3 sichtbare Leib-Meshes auf Ebene 0/ },
        { name: "Gerät verborgen", z: mit("fein.kopf", { geraet: 4 }), muss: /GERÄT: .* Maske 4 statt 1/ },
        { name: "Zwilling geweckt", z: mit("fein.kopf", { zwilling: 5 }), muss: /ZWILLING: .* Maske 5/ },
        { name: "visible geschaltet", z: mit("fein.kopf", { zurueck: "die Regel schaltet visible an 2 Knoten" }), muss: /ZURÜCK: die Regel schaltet visible/ },
        { name: "Haupt-Kamera sieht die Zwillings-Ebene", z: mit("fein", { vertrag: "die Haupt-Kamera sieht Ebene 2" }), muss: /VERTRAG: die Haupt-Kamera sieht Ebene 2/ },
        { name: "Bühne ohne Schatten", z: mit("fein.dritt", { wurf: 3 }), muss: /BLIND: die 3rd-Person wirft auf der Bühne 3 px/ },
        { name: "Gegenprobe blind", z: mit("fein.gegenprobe.0.m.ego", { wurf: 1500 }), muss: /GEGENPROBE: die Regel „main: visible" fällt nicht/ },
        { name: "Grob-Leib liest die Karte des vorigen Schusses (CI Gruppe 17)", z: mit("grob.kopf.ego", { wurf: 0, leibPx: 1075 }), muss: /grob: LEIB WIRFT NICHT: .*0 px/ },
        { name: "Bühne schreitet nicht (Gegenprobe Karte steht blind)", z: mit("grob.gegenprobe.5.m.ego", { wurf: 754 }), muss: /GEGENPROBE: die Regel „Karte steht" fällt nicht/ },
        { name: "Bühne am falschen Leib", z: mit("fein", { stufe: 1 }), muss: /STUFE: die Bühne „fein" misst .* nahStufe 1/ },
    ];
    taeterFaelle(faelle, urteilJeStufe, { fehler });
    selbsttestEnde(fehler);
}

if (process.argv.includes("--selftest")) {
    console.log("=== EGO-SCHATTEN — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const { statikServer, starteBrowser, laufUhr } = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const fs = require("fs");
const path = require("path");

const BILDER = (() => {
    const i = process.argv.indexOf("--bilder");
    return i > 0 ? path.resolve(process.argv[i + 1]) : null;
})();
const server = statikServer();

// DIE BÜHNE (Seiten-Kontext): der echte Renderer, der echte Leib, die echte Regel; eigene Szene, Zeit fest.
function buehne(arg) {
    return (async () => {
        const { W, H, SCHWELLE, bilder } = arg;
        const T = window.THREE;
        const rend = st.renderer;
        const E = r.constructor.SHADOW_TWIN_LAYER;
        const P = Object.getPrototypeOf(r);
        // JE BILD DER BÜHNE EIN FRAME: r184 zeichnet eine Schatten-Karte höchstens einmal je Frame (`ShadowNode.updateBefore`,
        // frameId), den Frame zählt nur der rAF (`Animation.start`) — tickte zwischen zwei Schüssen keiner, las der zweite die
        // Karte des ersten (CI Gruppe 17: Ego-Wurf 0 px in 3 von 9 Läufen). Der rAF ruht, `frame` schreitet; die Zeit steht.
        const nf = rend._nodes.nodeFrame;
        const zeit = nf.time;
        nf.update = () => {};
        let stehend = false;
        const aus = { ms: {}, stufe: st.playerMesh.userData._gelenk.nahStufe };
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
            if (o.userData?._gehalten) return;
            knoten.push(o);
            for (const k of o.children) sammle(k);
        };
        const kopf = pm.userData && pm.userData.parts && pm.userData.parts.head;
        if (kopf) sammle(kopf);
        for (const ch of pm.children) if (ch.userData?._creatureSkin) sammle(ch);
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
            const diaet = (m) => r._materialObserverDiaet(m);
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
                if (!stehend) Object.assign(nf, { frameId: nf.frameId + 1, deltaTime: 0, time: zeit });
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
                        l[y * W + x] = luma709(u8, i);
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
                // der Wurf, wie die Regel ihn lässt (K72: der Wurf ist die Wurf-Ebene — eine Regel, die dem Leib die Ebene
                // nimmt, nimmt ihm den Wurf; ein `castShadow = true` vor dem Schuss gäbe ihn ihm zurück, die Linse wäre blind)
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
                const skin = pm.children.find((c) => c.userData?._creatureSkin);
                const rig = pm.userData.rig;
                const hand = rig?.armR?.wrist || skin;
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
                    if (o.userData) o.userData._maskeVorEgo = undefined;
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
                    if (o.userData?._gehalten && f.gehalten !== true) return;
                    f(o);
                    for (const k of o.children) geh(k);
                };
                if (h) geh(h);
                for (const ch of p.children) if (ch.userData?._creatureSkin) geh(ch);
            };
            const regeln = {
                // die echte Regel an einer Bühne ohne Frame-Schritt (die alte Bühne): die Karte des vorigen Schusses bleibt
                "Karte steht": P._applyEgoSicht,
                "main: visible": function () {
                    const p = this.state.playerMesh;
                    const third = this.state.cameraMode === "third";
                    const h = p.userData && p.userData.parts && p.userData.parts.head;
                    if (h) h.visible = third;
                    for (const ch of p.children) if (ch.userData?._creatureSkin) ch.visible = third;
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
                            if (o.userData._maskeVorEgo !== undefined) o.layers.mask = o.userData._maskeVorEgo;
                            o.userData._maskeVorEgo = undefined;
                        } else if (o.userData._maskeVorEgo === undefined) {
                            o.userData._maskeVorEgo = o.layers.mask;
                            o.layers.mask = 1 << 5;
                        }
                    });
                },
                "das Gerät mit": function () {
                    const third = this.state.cameraMode === "third";
                    const f = (o) => {
                        if (third) {
                            if (o.userData._maskeVorEgo !== undefined) o.layers.mask = o.userData._maskeVorEgo;
                            o.userData._maskeVorEgo = undefined;
                        } else if (o.layers.mask & 1) {
                            o.userData._maskeVorEgo = o.layers.mask;
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
                stehend = g.name === "Karte steht";
                const m = bild
                    ? await egoMessen(g.name.replace(/[^a-z0-9]+/gi, "-"))
                    : { ego: aus.kopf.ego, iou: aus.kopf.iou };
                stehend = false;
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
            delete nf.update;
            ziel.dispose();
        }
        aus.ms.gesamt = Math.round(performance.now() - t0);
        return aus;
    })();
}

(async () => {
    console.log("=== EGO-SCHATTEN — der Leib wirft in der Ego-Sicht, das Auge sieht ihn nicht ===");
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 600000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 180 });
    let out = null;
    const log = laufUhr();
    try {
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        await page.evaluate(AUSGABE_INSTALL);
        // DER LEIB JE STUFE (B5): in der Ego-Sicht trägt der Spieler vor dem Bild die Grobstufe als Nah-Gestalt (`nahStufe` 1),
        // nach dem Bild die feine (`_leibFeinTausch`) — die Bühne misst beide. Der Loop hält in dem Takt, in dem der Leib der
        // Stufe nach dem Foundry-Buch steht (sein Ingest gießt den Avatar neu), nie per Abfrage-Uhr: die Grobstufe lebt nur bis
        // zum Tausch. Danach ruht der Spiel-Loop, bis die Bühne den Leib zurückgibt.
        const halt = (stufe) =>
            page.evaluate(async (stufe) => {
                const t0 = performance.now();
                const steht = (r, st, pm = st.playerMesh) =>
                    !!(r._foundry?.recipes && !st._deferredAvatarSoul && pm?.userData._gelenk) &&
                    pm.userData._gelenk.nahStufe === stufe &&
                    (stufe === 1 || !!st._weltbildDa) &&
                    pm.children.some((c) => c.userData?._creatureSkin);
                let r = await window.__weltDa((w) => w.state.rendererReady && w.state.renderer.backend);
                const st = r.state;
                const ok = await new Promise((res) => {
                    const frist = setTimeout(() => res(false), 240000);
                    const takt = r._gameLoopTick;
                    const halten = () => (st.renderer.setAnimationLoop(null), clearTimeout(frist), res(true));
                    if (steht(r, st)) return halten();
                    st.renderer.setAnimationLoop((t, x) => (takt(t, x), steht(r, st) && halten()));
                });
                for (const c of st.creatures || []) c.visible = false;
                return {
                    ok,
                    ms: Math.round(performance.now() - t0),
                    webgpu: st.renderer.backend.isWebGPUBackend === true,
                };
            }, stufe);
        out = {};
        for (const [name, stufe] of STUFEN) {
            const b = await halt(stufe);
            if (!b.ok) throw new Error(`der Leib der Stufe ${stufe} (${name}) stand nach 240 s nicht`);
            if (!b.webgpu) throw new Error("kein WebGPU-Backend — die Bühne wäre nicht der Renderer des Spiels");
            log(`${name}: Leib der Stufe ${stufe} steht nach ${Math.round(b.ms / 1000)} s`);
            const z = (out[name] = await page.evaluate(buehne, { W: 192, H: 108, SCHWELLE, bilder: !!BILDER, gegenproben: GEGENPROBEN })); // prettier-ignore
            log(
                `${name}: Bühne ${Math.round(z.ms.gesamt / 1000)} s (Erst-Zeichnung ${Math.round(z.ms.erst / 1000)} s, Gegenprobe ` +
                    `${Math.round(z.ms.gegenprobe / 1000)} s) · Leib ${z.leib.meshes} Meshes, ${z.leib.wirft} werfen · Auge ` +
                    `${z.kamera.auge} m über dem Fuß · ${z.schattenKameras} Schatten-Kameras im Vertrag`
            );
            log(
                `${name}: 3rd-Person Schatten ${z.dritt.wurf} px, Leib im Bild ${z.dritt.leib} px · Ego ${JSON.stringify(z.kopf)}`
            );
            for (const g of z.gegenprobe) log(`${name}: Gegenprobe „${g.name}": ${JSON.stringify(g.m)}`);
            if (BILDER && z.bilder) {
                const d = path.join(BILDER, name);
                fs.mkdirSync(d, { recursive: true });
                fs.writeFileSync(
                    path.join(d, "bilder.json"),
                    JSON.stringify({ W: 192, H: 108, namen: Object.keys(z.bilder) })
                );
                for (const n of Object.keys(z.bilder))
                    fs.writeFileSync(path.join(d, n + ".rgba"), Buffer.from(z.bilder[n]));
                delete z.bilder;
                log(`Bilder (RGBA 192×108) in ${d}`);
            }
        }
    } catch (e) {
        out = { error: e?.message || String(e) };
    }
    await browser.close();
    server.close();
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    const v = urteilJeStufe(out);
    if (v.length) {
        console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
        for (const s of v) console.log("   • " + s);
        process.exit(1);
    }
    const [g, f] = [out.grob, out.fein];
    console.log(
        `\n✅ GRÜN — in der Ego-Sicht wirft der Leib Schatten am Boden, grob ${g.kopf.ego.wurf} px (IoU ${g.kopf.iou}) und fein ` +
            `${f.kopf.ego.wurf} px (IoU ${f.kopf.iou}) gegen dieselbe Pose in der 3rd-Person; die Haupt-Kamera sieht 0 Bildpunkte Leib, ` +
            `kein Leib-Mesh liegt auf Ebene 0; das Gerät bleibt auf Ebene 0, ein Zwilling in den Kaskaden, 3rd gibt jede Maske zurück, ` +
            `visible wechselt nie; je Stufe fallen die ${f.gegenprobe.length} Gegenproben beim Namen (${f.gegenprobe.map((x) => x.soll).join(" · ")}).`
    );
})();
