#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kamera-treue.cjs — DIE KAMERA-TREUE-WAND der Region-Bundles (gate:kamera-treue, 04.10.)
//
// Befund (echte GPU, Mess-Wiese −900/−850, Werkbank, EINE Welt): die Region-RenderBundles trugen die Kamera nicht.
// r184 hält `_currentRenderBundle` ohne Stapel; das erste lichtempfangende Objekt im Hauptbild startet über
// ShadowNode.updateBefore den Schatten-Render, dessen eigene Aufnahme den Zeiger auf null setzt — gemessen 107 von 237
// aufgenommenen Draws verfolgt; der Replay refresht nur Verfolgte, der Rest zeigte die Kamera seiner Aufnahme. Und der
// Replay refresht seine Bürger AUSSERHALB von renderObject: im Schatten-Render gegen den geteilten Override-Stoff, der
// den Zustand des zuletzt direkt gezeichneten Werfers trägt (alphaTest) — die ausgeschnittenen Blätter warfen volle
// Karten (81 % gleiche Pixel, Rauschboden 90 %). Der Chokepoint `_renderScene` (_configureRenderer) stapelt den Zeiger
// und sammelt unter einem overrideMaterial keine Bundles.
//
// Die Wand fährt den ECHTEN Renderer des Spiels (swiftshader, Software-Holz `kienspan`, mit eingeschaltetem
// Schatten) an einer eigenen Bühne: eine BundleGroup trägt einen lichtempfangenden Boden, ausgeschnittene Karten
// (alphaTest, jede ihr eigenes Programm) und Kisten; ein Richtungslicht wirft Schatten. Sie nennt jeden Täter:
//   (a) STAPEL — eine Aufnahme mit Schatten-Render verfolgt jeden aufgenommenen Draw (verfolgt = gezeichnet).
//   (b) OVERRIDE — kein Bundle wird unter einem overrideMaterial gesammelt (der Schatten-Render zeichnet direkt).
//   (c) BILD — Blick Y als Replay einer Aufnahme an Blick X gleicht dem direkten Pfad bei Y (≥ 0,999, Zeit fest), und
//       das auch, wenn der geteilte Schatten-Stoff vor dem Replay einen fremden alphaTest trägt (der Zustand, den der
//       letzte direkte Werfer hinterlässt).
//   LAUF-KONTROLLEN (sonst ist die Wand blind und rot): ohne den Chokepoint klebt der Replay an Blick X, und ein
//   Schatten-Replay mit fremdem Stoff wirft anders (je < 0,98); Blick X und Y sind verschiedene Bilder (< 0,9).
// DIE STAND-WAND (Welle K, 07.10.): was die Diät im Stand arbeitet, am selben echten Renderer.
//   (d) TEILEN — die acht Karten-Programme (gleiche Quellen: Kamera, Licht, Schatten) tragen EINE geteilte Gruppe (der
//       EINE Knoten je Quelle, _configureRenderer). V18.534: 8 Gruppen, jede lud Kamera und Schatten für sich.
//   (e) STAND — je Pfad (direkt · Replay) vier Frames ohne Änderung: kein Voll-Refresh, kein Upload einer geteilten
//       Gruppe, kein zweiter Gang über einen Knoten, Vorher-Knoten oder eine geteilte Gruppe im selben Render (ein
//       verschachtelter Render ist nie der Gang). V18.534: 136 wiederholte Gänge je Render.
//   (f) ÄNDERUNG — im Stand rückt eine Kiste, ein Blatt dreht: das Bild der Diät gleicht dem Bild, in dem jedes Objekt
//       voll refresht (≥ 0,999); Lauf-Kontrolle: eine Diät, die nie refresht, weicht ab (< 0,98). So fiel der gemerkte
//       Node-Frame (Hauptbild mit der Schatten-Kamera: 0,10) beim Bau des Gangs auf.
//   (g) VERSCHACHTELT — ein verschachtelter Render, der die geteilten Kamera-Knoten über die VENDOR-Bahn auf SEINE Kamera
//       stellt (ein Werfer ohne Diät), macht jeden Stempel des äußeren Renders alt. Eigene Bühne (in (f) wirft jeder als
//       Diät-Stoff und stempelt neu — dort ist die Klasse unsichtbar): ein Diät-Stoff ohne Schatten zuerst (er stellt die
//       Kamera-Knoten), der Diät-Boden (sein Schatten startet den verschachtelten Render), ein Werfer ohne Diät. Die Diät
//       zeichnet wie der volle Refresh (≥ 0,999); Lauf-Kontrollen: ein verschachtelter Render lief, und der Gang mit
//       einem Stempel nur aus der Render-Id (er überlebt den verschachtelten Render) weicht ab (< 0,98). Gegenprüfung
//       07.10.: der Gang von 181d3c9e zeichnete hier 0,11.
//   Die Wiederholung zählt je RENDER-ABSCHNITT (Render-Id und `info.calls`): nach einem verschachtelten Render stellt
//   der äußere seine Knoten zu Recht ein zweites Mal.
//   Die Bühne nimmt keinen Spiel-Loop an (die Welt bootet weiter und renderte sonst mitten hinein), und die Wand zählt
//   nach: LAUF — kein Bild der Spiel-Szene, kein Puffer des GPU-Kehraus während der Bühne. Ein Spiel-Frame nimmt der
//   Bühne (nicht im Spiel-Graph) ihre Geometrie-Puffer, ein Replay danach zeichnete das Bild davor (0,3064 = X gegen Y,
//   die roten Läufe auf integ-probe unter Last; nachgestellt mit einem Spiel-Takt zwischen Aufnahme und Replay, ohne
//   Kehraus 1,0).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil über einen grünen Lauf und je einen injizierten
// Täter — jeder fällt rot und wird genannt.
//   node scripts/diag-kamera-treue.cjs [--selftest]   (npm run gate:kamera-treue)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const BILD_SOLL = 0.999; // der Replay zeichnet wie der direkte Pfad
const BLIND_GRENZE = 0.98; // die Lauf-Kontrollen MÜSSEN darunter liegen
const BLICK_GRENZE = 0.9; // Blick X und Blick Y sind verschiedene Bilder

function urteil(z) {
    const v = [];
    const l = z.lauf || {};
    if (l.spielBilder !== 0 || l.kehraus !== 0)
        v.push(
            `LAUF: ${l.spielBilder} Spiel-Bilder während der Bühne, der GPU-Kehraus nahm ${l.kehraus} Geometrie-Puffer — der Spiel-Loop lief hinein (ein Replay danach zeichnet das Bild davor: 0,3064) — der Lauf ist ungültig`
        );
    const a = z.aufnahme || {};
    if (!(a.gezeichnet > 0)) v.push("STAPEL: die Bühne nahm kein Bundle auf (die Probe ist blind)");
    else if (a.verfolgt !== a.gezeichnet)
        v.push(
            `STAPEL: die Aufnahme verfolgt ${a.verfolgt} von ${a.gezeichnet} Draws — der Schatten-Render nullte den Zeiger, der Replay refresht die übrigen nie`
        );
    if (!(a.schattenRenders > 0)) v.push("STAPEL: kein Schatten-Render während der Aufnahme (die Probe ist blind)");
    if (a.unterOverride !== 0)
        v.push(`OVERRIDE: ${a.unterOverride} Bundle(s) unter einem overrideMaterial gesammelt — der Replay refresht sie gegen den geteilten Stoff`);
    const b = z.bild || {};
    if (!(b.replay >= BILD_SOLL))
        v.push(`BILD: der Replay zeichnet Blick Y zu ${b.replay} gleich mit dem direkten Pfad (Soll ≥ ${BILD_SOLL}) — ein Bürger klebt an der Kamera seiner Aufnahme`);
    if (!(b.fremd >= BILD_SOLL))
        v.push(`BILD: mit fremdem Schatten-Stoff zeichnet der Replay Y zu ${b.fremd} gleich (Soll ≥ ${BILD_SOLL}) — ein Schatten-Bundle wirft gegen den geteilten Stoff`);
    if (!(b.ohneStapel < BLIND_GRENZE))
        v.push(`BILD: ohne den Chokepoint zeichnet der Replay Y zu ${b.ohneStapel} gleich (Soll < ${BLIND_GRENZE}) — die Stapel-Probe ist blind`);
    if (!(b.schattenBundle < BLIND_GRENZE))
        v.push(`BILD: ein Schatten-Bundle mit fremdem Stoff zeichnet Y zu ${b.schattenBundle} gleich (Soll < ${BLIND_GRENZE}) — die Override-Probe ist blind`);
    if (!(b.xGegenY < BLICK_GRENZE)) v.push(`BILD: Blick X und Blick Y sind zu ${b.xGegenY} gleich (Soll < ${BLICK_GRENZE}) — die Bühne ist blind`);
    // DIE STAND-WAND (Welle K): im Stand kostet die Diät nur die Prüfung — kein Voll-Refresh, kein zweiter Gang über einen
    // Knoten oder eine geteilte Gruppe im selben Render, kein Upload; Programme mit denselben Quellen teilen EINE Gruppe;
    // eine Änderung im Stand erreicht das Bild wie ein voller Refresh.
    const s = z.stand || {};
    const t = s.teilen || {};
    if (!(t.programme >= 8)) v.push(`TEILEN: ${t.programme || 0} Karten-Programme im Hauptbild gesammelt (Soll 8) — die Probe ist blind`);
    else if (t.gruppen !== t.gruppenJeProgramm)
        v.push(
            `TEILEN: die ${t.programme} Karten-Programme (gleiche Quellen: Kamera, Licht, Schatten) tragen ${t.gruppen} geteilte Gruppen statt ${t.gruppenJeProgramm} — jedes Programm lädt Kamera und Schatten in seinen eigenen Puffer`
        );
    for (const pfad of ["direkt", "replay"]) {
        const r = s[pfad] || {};
        if (!(r.pruef > 0)) v.push(`STAND ${pfad}: keine Diät-Prüfung gezählt — die Probe ist blind`);
        if (r.voll !== 0) v.push(`STAND ${pfad}: ${r.voll} Voll-Refreshs je Render ohne Änderung (Soll 0) — ein Refresh je Frame ohne Änderung`);
        if (r.wiederholt !== 0)
            v.push(
                `STAND ${pfad}: ${r.wiederholt} wiederholte Gänge je Render (${JSON.stringify(r.wer || {})}: k Knoten · v Vorher · g Gruppe) — dieselbe Arbeit je Programm statt EINMAL`
            );
        if (r.uploads !== 0) v.push(`STAND ${pfad}: ${r.uploads} Uploads geteilter Gruppen je Render ohne Änderung (Soll 0)`);
        const a = (s.aenderung || {})[pfad] || {};
        if (!(a.diaet >= BILD_SOLL))
            v.push(`ÄNDERUNG ${pfad}: nach Kiste und Blatt zeichnet die Diät ${a.diaet} gleich mit dem vollen Refresh (Soll ≥ ${BILD_SOLL}) — ein vergessener Refresh`);
        if (!(a.taeter < BLIND_GRENZE))
            v.push(`ÄNDERUNG ${pfad}: eine Diät, die nie refresht, zeichnet ${a.taeter} gleich (Soll < ${BLIND_GRENZE}) — die Änderungs-Probe ist blind`);
        const n = (s.verschachtelt || {})[pfad] || {};
        if (!(n.renders > 0)) v.push(`VERSCHACHTELT ${pfad}: kein verschachtelter Render im Bild der Diät — die Probe ist blind`);
        if (!(n.diaet >= BILD_SOLL))
            v.push(
                `VERSCHACHTELT ${pfad}: nach einem verschachtelten Render über die Vendor-Bahn (Werfer ohne Diät) zeichnet die Diät ${n.diaet} gleich mit dem vollen Refresh (Soll ≥ ${BILD_SOLL}) — ein Stempel überlebte den verschachtelten Render, die nächste geteilte Gruppe trug dessen Kamera`
            );
        if (!(n.taeter < BLIND_GRENZE))
            v.push(
                `VERSCHACHTELT ${pfad}: ein Stempel nur aus der Render-Id zeichnet ${n.taeter} gleich (Soll < ${BLIND_GRENZE}) — die Probe ist blind (oder der Gang liest seinen Render-Abschnitt nicht aus \`rend.info.calls\`)`
            );
    }
    return v;
}

function selbsttest() {
    const ruhig = { pruef: 13, voll: 0, uploads: 0, wiederholt: 0, wer: {} };
    const gruen = {
        lauf: { spielBilder: 0, kehraus: 0 },
        aufnahme: { gezeichnet: 13, verfolgt: 13, schattenRenders: 1, unterOverride: 0 },
        bild: { replay: 1, fremd: 1, ohneStapel: 0.62, schattenBundle: 0.91, xGegenY: 0.31 },
        stand: {
            teilen: { programme: 8, gruppenJeProgramm: 1, gruppen: 1 },
            direkt: ruhig,
            replay: ruhig,
            aenderung: { direkt: { diaet: 1, taeter: 0.93 }, replay: { diaet: 1, taeter: 0.93 } },
            verschachtelt: { direkt: { renders: 1, diaet: 1, taeter: 0.11 }, replay: { renders: 1, diaet: 1, taeter: 0.11 } },
        },
    };
    const fehler = [];
    if (urteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + urteil(gruen).join(" · "));
    const mit = (pfad, wert) => {
        const z = JSON.parse(JSON.stringify(gruen));
        let o = z;
        for (const k of pfad.split(".")) o = o[k];
        Object.assign(o, wert);
        return z;
    };
    const faelle = [
        { name: "Zeiger genullt", z: mit("aufnahme", { verfolgt: 1 }), muss: /verfolgt 1 von 13/ },
        { name: "Bundle unter Override", z: mit("aufnahme", { unterOverride: 2 }), muss: /unter einem overrideMaterial/ },
        { name: "Bühne ohne Schatten", z: mit("aufnahme", { schattenRenders: 0 }), muss: /kein Schatten-Render/ },
        { name: "Replay klebt", z: mit("bild", { replay: 0.4 }), muss: /klebt an der Kamera seiner Aufnahme/ },
        { name: "Schatten gegen fremden Stoff", z: mit("bild", { fremd: 0.9 }), muss: /wirft gegen den geteilten Stoff/ },
        { name: "Stapel-Probe blind", z: mit("bild", { ohneStapel: 1 }), muss: /die Stapel-Probe ist blind/ },
        { name: "Override-Probe blind", z: mit("bild", { schattenBundle: 1 }), muss: /die Override-Probe ist blind/ },
        { name: "Bühne blind", z: mit("bild", { xGegenY: 0.99 }), muss: /die Bühne ist blind/ },
        { name: "Refresh je Frame ohne Änderung", z: mit("stand.direkt", { voll: 2 }), muss: /STAND direkt: 2 Voll-Refreshs/ },
        { name: "Gang je Programm (Replay)", z: mit("stand.replay", { wiederholt: 31, wer: { k: 28, g: 3 } }), muss: /STAND replay: 31 wiederholte Gänge/ },
        { name: "Upload ohne Änderung", z: mit("stand.direkt", { uploads: 1 }), muss: /1 Uploads geteilter Gruppen/ },
        { name: "vergessener Refresh", z: mit("stand.aenderung.replay", { diaet: 0.9 }), muss: /ÄNDERUNG replay: .* ein vergessener Refresh/ },
        { name: "Änderungs-Probe blind", z: mit("stand.aenderung.direkt", { taeter: 1 }), muss: /die Änderungs-Probe ist blind/ },
        { name: "Gruppe je Programm", z: mit("stand.teilen", { gruppen: 8 }), muss: /tragen 8 geteilte Gruppen statt 1/ },
        { name: "Teilen blind", z: mit("stand.teilen", { programme: 0 }), muss: /TEILEN: 0 Karten-Programme/ },
        { name: "Stand blind", z: mit("stand.direkt", { pruef: 0 }), muss: /STAND direkt: keine Diät-Prüfung/ },
        {
            name: "Stempel überlebt den verschachtelten Render",
            z: mit("stand.verschachtelt.replay", { diaet: 0.1099 }),
            muss: /VERSCHACHTELT replay: .* 0\.1099 .* ein Stempel überlebte den verschachtelten Render/,
        },
        { name: "Verschachtelt blind (Täter)", z: mit("stand.verschachtelt.direkt", { taeter: 1 }), muss: /nur aus der Render-Id zeichnet 1 gleich/ },
        { name: "kein verschachtelter Render", z: mit("stand.verschachtelt.replay", { renders: 0 }), muss: /VERSCHACHTELT replay: kein verschachtelter Render/ },
        { name: "Spiel-Frame in der Bühne", z: mit("lauf", { spielBilder: 2, kehraus: 51 }), muss: /LAUF: 2 Spiel-Bilder .* nahm 51 Geometrie-Puffer/ },
        { name: "Kehraus ohne Spiel-Bild", z: mit("lauf", { kehraus: 3 }), muss: /LAUF: 0 Spiel-Bilder .* nahm 3 Geometrie-Puffer/ },
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
    console.log("=== KAMERA-TREUE — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.KAMERA_TREUE_PORT) || 4472;
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

// DIE BÜHNE (Seiten-Kontext): der echte Renderer des Spiels mit seinen Eingriffen (_configureRenderer), eine eigene
// Szene, Zeit fest. Jeder Schuss ist ein echter Render in ein Ziel (160×120).
function buehne() {
    return (async () => {
        const r = window.anazhRealm,
            st = r.state,
            T = window.THREE,
            TSL = T.TSL;
        const rend = st.renderer;
        if (typeof rend.setAnimationLoop === "function") rend.setAnimationLoop(null);
        // DER RUHENDE SPIEL-LOOP (Lauf-Kontrolle, Welle K): die Welt bootet nach „Renderer bereit" weiter und setzt ihren
        // Loop selbst — er renderte dann mitten in die Bühne (info sprang zurück, gemessen 2 von 4 Läufen unter Last), und
        // unter einer Täter-Diät zeichnete die Welt ohne Upload (setIndexBuffer ohne Puffer). Für die Bühne nimmt der
        // Renderer keinen Loop an; danach gilt der zuletzt verlangte.
        const loopRoh = rend.setAnimationLoop;
        let loopVerlangt = null;
        rend.setAnimationLoop = (f) => {
            loopVerlangt = f;
        };
        const nf = rend._nodes.nodeFrame;
        const zeit = nf.time;
        nf.update = function () {
            this.frameId++;
            this.deltaTime = 0;
            this.time = zeit;
        };
        const schattenAlt = rend.shadowMap.enabled;
        rend.shadowMap.enabled = true;
        const szene = new T.Scene();
        const licht = new T.DirectionalLight(0xffffff, 3);
        licht.position.set(6, 12, 4);
        licht.castShadow = true;
        licht.shadow.mapSize.set(256, 256);
        Object.assign(licht.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 0.5, far: 50 });
        licht.shadow.camera.updateProjectionMatrix();
        szene.add(licht, licht.target, new T.AmbientLight(0xffffff, 0.35));
        const gruppe = new T.BundleGroup();
        gruppe.name = "kamera-treue:BUEHNE";
        szene.add(gruppe);
        const diaet = (m) => (typeof r._materialObserverDiaet === "function" ? r._materialObserverDiaet(m) : m);
        const boden = new T.Mesh(
            new T.PlaneGeometry(30, 30),
            diaet(
                new T.MeshStandardNodeMaterial({
                    colorNode: TSL.mix(TSL.color(0x2a6a2a), TSL.color(0xc8b080), TSL.positionWorld.x.div(30).add(0.5).clamp()),
                })
            )
        );
        boden.rotation.x = -Math.PI / 2;
        boden.receiveShadow = true;
        boden.frustumCulled = false;
        gruppe.add(boden);
        const farben = [0x2f8f2f, 0x3f7f1f, 0x1f9f4f, 0x4f8f2f, 0x2f6f3f, 0x5f9f1f, 0x1f7f2f, 0x3f9f3f];
        const karten = [];
        for (let i = 0; i < farben.length; i++) {
            // Jede Karte ihr eigenes Programm (eigene Konstante): der Zeiger-Verlust trifft sie einzeln.
            const m = new T.MeshStandardNodeMaterial({ side: T.DoubleSide, alphaTest: 0.5 });
            m.colorNode = TSL.vec4(TSL.color(farben[i]), TSL.step(0.5, TSL.fract(TSL.uv().x.mul(3 + i))));
            const k = new T.Mesh(new T.PlaneGeometry(2.4, 3), diaet(m));
            k.position.set(-8 + i * 2.1, 1.6, -3 + (i % 3) * 2.5);
            k.rotation.y = 0.4 * i;
            k.castShadow = true;
            k.receiveShadow = true;
            k.frustumCulled = false;
            gruppe.add(k);
            karten.push(k);
        }
        // Das LAUB: eine ausgeschnittene Instanz-Gruppe wie die Streu der Welt — eine Instanz-Mutation refresht ihren
        // Schatten-Bürger (Instanz-Wächter der Diät), im Replay gegen den geteilten Schatten-Stoff.
        const laubStoff = new T.MeshStandardNodeMaterial({ side: T.DoubleSide, alphaTest: 0.5 });
        // Weiches Alpha (eine Rampe wie ein Blatt-Rand): alphaTest 0,5 schneidet die Hälfte, 0 fast nichts.
        laubStoff.colorNode = TSL.vec4(TSL.color(0x3a8a2a), TSL.fract(TSL.uv().y.mul(5)));
        // Ein Blätterdach: flach liegende Karten über dem Boden werfen große ausgeschnittene Schatten.
        const laub = new T.InstancedMesh(new T.PlaneGeometry(6, 6), diaet(laubStoff), 6);
        {
            const m4 = new T.Matrix4();
            for (let i = 0; i < 6; i++) {
                m4.makeRotationX(-Math.PI / 2 + 0.25 * (i % 3)).setPosition(-7 + (i % 3) * 7, 3.5, -4 + Math.floor(i / 3) * 7);
                laub.setMatrixAt(i, m4);
            }
            laub.instanceMatrix.needsUpdate = true;
        }
        laub.castShadow = true;
        laub.receiveShadow = true;
        laub.frustumCulled = false;
        gruppe.add(laub);
        const kisten = [];
        for (let i = 0; i < 3; i++) {
            const kiste = new T.Mesh(new T.BoxGeometry(1.5, 1.5 + i, 1.5), diaet(new T.MeshStandardNodeMaterial({ color: 0x8a6a4a + i * 0x101010 })));
            kisten.push(kiste);
            kiste.position.set(4 + i * 2.5, 0.75 + i / 2, 5 - i * 3);
            kiste.castShadow = true;
            kiste.receiveShadow = true;
            kiste.frustumCulled = false;
            gruppe.add(kiste);
        }
        const kam = new T.PerspectiveCamera(60, 4 / 3, 0.1, 100);
        const blick = (vz) => {
            kam.position.set(1, 7, 15 * vz);
            kam.lookAt(0, 0.5, 0);
            kam.updateMatrixWorld(true);
        };
        // Zähler am echten Renderer: aufgenommene/verfolgte Draws der Haupt-Aufnahme, Schatten-Renders währenddessen,
        // Bundles unter einem overrideMaterial; dazu der geteilte Schatten-Stoff (für den fremden Zustand).
        const z = { gezeichnet: 0, verfolgt: 0, schattenRenders: 0, unterOverride: 0 };
        const stoffe = new Set();
        let aufnahmeKontext = null;
        const rbRoh = rend._renderBundle;
        rend._renderBundle = function (bundle, sc, l) {
            if (sc && sc.overrideMaterial) z.unterOverride++;
            const alt = aufnahmeKontext;
            if (!sc.overrideMaterial) aufnahmeKontext = this._currentRenderContext;
            try {
                return rbRoh.call(this, bundle, sc, l);
            } finally {
                aufnahmeKontext = alt;
            }
        };
        const odRoh = rend._renderObjectDirect;
        rend._renderObjectDirect = function (...a) {
            if (aufnahmeKontext && this._currentRenderContext === aufnahmeKontext) {
                z.gezeichnet++;
                if (this._currentRenderBundle) z.verfolgt++;
            }
            return odRoh.apply(this, a);
        };
        // Der Zähler legt sich um eine _renderScene-Bahn: das Spiel (Chokepoint), der Vendor oder nur der Stapel.
        const spielSzene = rend._renderScene;
        const protoSzene = Object.getPrototypeOf(rend)._renderScene;
        const nurStapel = function (sc, c, f) {
            const a = this._currentRenderBundle;
            this._currentRenderBundle = null;
            try {
                return protoSzene.call(this, sc, c, f);
            } finally {
                this._currentRenderBundle = a;
            }
        };
        // DER SPIEL-FRAME IN DER BÜHNE (Lauf-Kontrolle, Gegenprüfung 07.10.): ein Hauptbild der Spiel-Szene während der
        // Bühne ist ein Spiel-Frame — sein GPU-Kehraus (`_gpuKehraus`) nimmt jedem Geometrie-Puffer die GPU, den der Spiel-
        // Graph nicht trägt, also der ganzen Bühne; ein Bundle-Replay danach lädt keine Geometrie neu (r184 refresht im
        // Replay nur Knoten und Bindungen), sein Pass verfällt, das Ziel behält das Bild davor. Nachgestellt (ein Spiel-
        // Takt zwischen Aufnahme an X und Replay an Y): der Replay zeichnete Blick X (0,3064 gegen Y — die roten Läufe auf
        // integ-probe unter Last, deren Bühne den Loop der bootenden Welt noch annahm), ohne Kehraus 1,0. Die Bühne nimmt
        // keinen Spiel-Loop an; die Wand zählt nach (Spiel-Bilder, Puffer des Kehraus) und nennt einen Lauf ungültig.
        let spielBilder = 0;
        const kehrausVor = st._gpuKehrausN || 0;
        const zaehlUm = (bahn) =>
            function (sc, c, f) {
                if (sc && sc === st.scene && !sc.overrideMaterial) spielBilder++;
                if (sc && sc.overrideMaterial) {
                    if (sc.overrideMaterial.isShadowPassMaterial) stoffe.add(sc.overrideMaterial);
                    if (aufnahmeKontext) z.schattenRenders++;
                }
                return bahn.call(this, sc, c, f);
            };
        rend._renderScene = zaehlUm(spielSzene);
        const W = 160,
            H = 120;
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
        const schuss = async (sc = szene) => {
            nf.update();
            rend.setRenderTarget(rt);
            rend.render(sc, kam);
            rend.setRenderTarget(null);
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            const roh = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const zeile = W * 4,
                schritt = roh.length > zeile * H ? Math.ceil(zeile / 256) * 256 : zeile;
            const u8 = new Uint8Array(zeile * H);
            for (let y = 0; y < H; y++) u8.set(roh.subarray(y * schritt, y * schritt + zeile), y * zeile);
            return u8;
        };
        const gleich = (a, b) => {
            let g = 0;
            for (let i = 0; i < W * H; i++) {
                const o = i * 4;
                if (Math.abs(a[o] - b[o]) <= 2 && Math.abs(a[o + 1] - b[o + 1]) <= 2 && Math.abs(a[o + 2] - b[o + 2]) <= 2) g++;
            }
            return +(g / (W * H)).toFixed(4);
        };
        // Der fremde Zustand: der geteilte Schatten-Stoff trägt den alphaTest eines vollen Werfers (renderObject setzt
        // alphaTest je Objekt und setzt ihn nie zurück), und das Laub mutiert eine Instanz (sein Schatten-Bürger refresht).
        const fremderStoff = () => {
            for (const s of stoffe) s.alphaTest = 0;
            laub.instanceMatrix.needsUpdate = true;
        };
        // Ein Replay-Schuss: an X aufnehmen (zwei Frames), an Y den Replay zeichnen (vorY: vor dem Y-Frame).
        const replay = async (vorY) => {
            gruppe.isBundleGroup = true;
            gruppe.needsUpdate = true;
            blick(1);
            await schuss();
            await schuss();
            blick(-1);
            if (vorY) vorY();
            return schuss();
        };
        try {
            // Wahrheit: der direkte Pfad (die Gruppe als Gruppe) bei Y und bei X.
            gruppe.isBundleGroup = false;
            blick(-1);
            await schuss();
            const wahrY = await schuss();
            blick(1);
            const wahrX = await schuss();
            // (a)(b) die Aufnahme mit Schatten-Render, gezählt.
            gruppe.isBundleGroup = true;
            gruppe.needsUpdate = true;
            blick(1);
            aufnahmeKontext = null;
            Object.assign(z, { gezeichnet: 0, verfolgt: 0, schattenRenders: 0, unterOverride: 0 });
            await schuss();
            const aufnahme = Object.assign({}, z);
            // (c) der Replay bei Y, dann derselbe mit fremdem Schatten-Stoff.
            const bReplay = await replay(null);
            const bFremd = await replay(fremderStoff);
            // Lauf-Kontrolle 1: ohne den Chokepoint (Vendor-_renderScene, Zähler darüber).
            rend._renderScene = zaehlUm(protoSzene);
            const bOhne = await replay(null);
            // Lauf-Kontrolle 2: nur der Stapel (Bundles auch im Schatten-Render) mit fremdem Schatten-Stoff.
            rend._renderScene = zaehlUm(nurStapel);
            const bSchatten = await replay(fremderStoff);
            rend._renderScene = zaehlUm(spielSzene);
            // (d)(e)(f)(g) DIE STAND-WAND (Welle K): die Diät-Arbeit je Render am echten Renderer — Prüfungen, Voll-Refreshs,
            // die Gänge der Diät über Vorher-Knoten, Knoten und geteilte Gruppen (je Render-Abschnitt: Render-Id und
            // `info.calls` — nach einem verschachtelten Render stellt der äußere seine Knoten zu Recht neu), die Uploads
            // geteilter Gruppen.
            const A = r.constructor;
            const diaetRoh = A._diaetRefresh,
                schreibRoh = A._diaetGeteiltSchreiben;
            const nfP = Object.getPrototypeOf(nf);
            const buRoh = rend._bindings._update;
            const be = rend.backend;
            const ubEigen = Object.prototype.hasOwnProperty.call(be, "updateBinding");
            const ubRoh = be.updateBinding;
            let messen = false,
                imSchreib = false,
                sammle = null;
            const zs = { pruef: 0, voll: 0, besuche: new Map(), uploads: 0 };
            const besuch = (art, id) => {
                const k = nf.renderId + ":" + rend.info.calls + ":" + art + id;
                zs.besuche.set(k, (zs.besuche.get(k) || 0) + 1);
            };
            A._diaetRefresh = function (obs, ro, frame, altNR) {
                const v = diaetRoh(obs, ro, frame, altNR);
                if (messen) {
                    zs.pruef++;
                    if (v) zs.voll++;
                }
                // (d) TEILEN: die geteilten Gruppen je Karten-Programm im Hauptbild
                if (sammle && ro.material && ro.material.isShadowPassMaterial !== true && karten.includes(ro.object)) {
                    const ids = [];
                    for (const g of ro.getBindings()) if (g.bindings[0] && g.bindings[0].groupNode && g.bindings[0].groupNode.shared === true) ids.push(g.id);
                    sammle.set(ro.getNodeBuilderState(), ids);
                }
                return v;
            };
            A._diaetGeteiltSchreiben = function (rr, ro, rid) {
                imSchreib = true;
                try {
                    return schreibRoh(rr, ro, rid);
                } finally {
                    imSchreib = false;
                }
            };
            nf.updateNode = function (n) {
                if (messen && imSchreib) besuch("k", n.id);
                return nfP.updateNode.call(this, n);
            };
            nf.updateBeforeNode = function (n) {
                if (messen && imSchreib) besuch("v", n.id);
                return nfP.updateBeforeNode.call(this, n);
            };
            rend._bindings._update = function (g, alle) {
                if (messen && imSchreib) besuch("g", g.id);
                return buRoh.call(this, g, alle);
            };
            be.updateBinding = function (b) {
                if (messen && b && b.groupNode && b.groupNode.shared === true) zs.uploads++;
                return ubRoh.call(this, b);
            };
            // Ein verschachtelter Render (der Schatten, den ein Vorher-Knoten im Gang startet) ist nie der Gang; (g) zählt ihn.
            const szeneMitGang = rend._renderScene;
            let tiefe = 0,
                verschachtelteRenders = 0;
            rend._renderScene = function (sc, c, f) {
                const alt = imSchreib;
                imSchreib = false;
                if (tiefe > 0) verschachtelteRenders++;
                tiefe++;
                try {
                    return szeneMitGang.call(this, sc, c, f);
                } finally {
                    tiefe--;
                    imSchreib = alt;
                }
            };
            const stand = {};
            try {
                // (d) TEILEN: ein Hauptbild (direkter Pfad) sammelt die geteilten Gruppen der acht Karten-Programme.
                gruppe.isBundleGroup = false;
                blick(1);
                sammle = new Map();
                await schuss();
                const jeProgramm = [...sammle.values()];
                sammle = null;
                const alle = new Set();
                for (const ids of jeProgramm) for (const id of ids) alle.add(id);
                stand.teilen = { programme: jeProgramm.length, gruppenJeProgramm: jeProgramm.length ? jeProgramm[0].length : 0, gruppen: alle.size };
                // (e) STAND: einschwingen, dann je Pfad (direkt · Replay) vier Frames ohne jede Änderung, gezählt.
                const ruhe = async (bundle) => {
                    gruppe.isBundleGroup = bundle;
                    gruppe.needsUpdate = true;
                    await schuss();
                    await schuss();
                    Object.assign(zs, { pruef: 0, voll: 0, uploads: 0 });
                    zs.besuche.clear();
                    messen = true;
                    for (let i = 0; i < 4; i++) await schuss();
                    messen = false;
                    let wiederholt = 0;
                    const wer = {};
                    for (const [k, n] of zs.besuche)
                        if (n > 1) {
                            wiederholt += n - 1;
                            const art = k.split(":")[2][0];
                            wer[art] = (wer[art] || 0) + n - 1;
                        }
                    for (const k in wer) wer[k] /= 4;
                    return { pruef: zs.pruef / 4, voll: zs.voll / 4, uploads: zs.uploads / 4, wiederholt: wiederholt / 4, wer };
                };
                stand.direkt = await ruhe(false);
                stand.replay = await ruhe(true);
                // (f) ÄNDERUNG IM STAND: eine Kiste rückt, ein Blatt dreht — das Bild der Diät gleicht dem Bild, in dem jedes
                // Objekt voll refresht (die Wahrheit ohne Diät); eine Täter-Diät, die nie refresht, weicht ab (Lauf-Kontrolle).
                const immer = () => true;
                const nie = (obs, ro, frame, altNR) => (obs.renderObjects.has(ro) ? false : altNR.call(obs, ro, frame));
                const m4 = new T.Matrix4();
                let schritt = 0;
                const aendere = () => {
                    schritt++;
                    kisten[0].position.x += 1.5;
                    kisten[0].updateMatrixWorld(true);
                    m4.makeRotationX(-Math.PI / 2 + 0.3 * schritt).setPosition(0, 3.5, -4);
                    laub.setMatrixAt(1, m4);
                    laub.instanceMatrix.needsUpdate = true;
                };
                const mitDiaet = async (fn) => {
                    const alt = A._diaetRefresh;
                    if (fn) A._diaetRefresh = fn;
                    try {
                        return await schuss();
                    } finally {
                        A._diaetRefresh = alt;
                    }
                };
                const bild = {};
                for (const bundle of [false, true]) {
                    gruppe.isBundleGroup = bundle;
                    gruppe.needsUpdate = true;
                    await schuss();
                    await schuss();
                    aendere();
                    const diaetBild = await mitDiaet(null);
                    const wahr = await mitDiaet(immer);
                    aendere();
                    const taeterBild = await mitDiaet(nie);
                    const wahr2 = await mitDiaet(immer);
                    bild[bundle ? "replay" : "direkt"] = { diaet: gleich(diaetBild, wahr), taeter: gleich(taeterBild, wahr2) };
                }
                stand.aenderung = bild;
                // (g) VERSCHACHTELT (Gegenprüfung 07.10.): eine eigene Bühne, in deren Schatten-Render KEIN Diät-Stoff wirft —
                // die geteilten Kamera-Knoten stellt dort nur die Vendor-Bahn des Werfers ohne Diät. Ein Diät-Stoff ohne
                // Schatten zeichnet zuerst (renderOrder −1: er stellt und stempelt die Kamera-Knoten), dann startet der
                // Diät-Boden den Schatten; seine erstmals geladene Gruppe trägt die Kamera, die die Knoten JETZT halten.
                const szene2 = new T.Scene();
                const licht2 = new T.DirectionalLight(0xffffff, 3);
                licht2.position.set(6, 12, 4);
                licht2.castShadow = true;
                licht2.shadow.mapSize.set(256, 256);
                Object.assign(licht2.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 0.5, far: 50 });
                licht2.shadow.camera.updateProjectionMatrix();
                szene2.add(licht2, licht2.target, new T.AmbientLight(0xffffff, 0.35));
                const gruppe2 = new T.BundleGroup();
                gruppe2.name = "kamera-treue:VERSCHACHTELT";
                szene2.add(gruppe2);
                const stein = new T.Mesh(new T.BoxGeometry(2, 2, 2), diaet(new T.MeshStandardNodeMaterial({ color: 0x8080c0 })));
                stein.position.set(-6, 1, 3);
                stein.renderOrder = -1;
                stein.castShadow = false;
                stein.receiveShadow = false;
                stein.frustumCulled = false;
                gruppe2.add(stein);
                const boden2 = new T.Mesh(
                    new T.PlaneGeometry(30, 30),
                    diaet(
                        new T.MeshStandardNodeMaterial({
                            colorNode: TSL.mix(TSL.color(0x2a6a2a), TSL.color(0xc8b080), TSL.positionWorld.x.div(30).add(0.5).clamp()),
                        })
                    )
                );
                boden2.rotation.x = -Math.PI / 2;
                boden2.receiveShadow = true;
                boden2.castShadow = false;
                boden2.frustumCulled = false;
                gruppe2.add(boden2);
                const werfer = new T.Mesh(new T.BoxGeometry(2, 4, 2), new T.MeshStandardNodeMaterial({ color: 0x8a6a4a }));
                werfer.position.set(3, 2, 0);
                werfer.renderOrder = 1;
                werfer.castShadow = true;
                werfer.receiveShadow = false;
                werfer.frustumCulled = false;
                gruppe2.add(werfer);
                // Der Täter (Lauf-Kontrolle): derselbe Gang, dem `info.calls` stehen bleibt (er liest die Render-Id) — sein
                // Stempel ist nur die Render-Id und überlebt den verschachtelten Render. Liest der Gang seinen Abschnitt
                // anderswo, gleicht der Täter dem Gang und die Kontrolle fällt rot (nie still). Ohne eval (die CSP der Seite).
                const taeterGang = (rr, ro, rid) => schreibRoh(Object.create(rr, { info: { value: { calls: rid } } }), ro, rid);
                const mit2 = async (refresh, gang) => {
                    const altR = A._diaetRefresh,
                        altG = A._diaetGeteiltSchreiben;
                    if (refresh) A._diaetRefresh = refresh;
                    if (gang) A._diaetGeteiltSchreiben = gang;
                    try {
                        return await schuss(szene2);
                    } finally {
                        A._diaetRefresh = altR;
                        A._diaetGeteiltSchreiben = altG;
                    }
                };
                const verschachtelt = {};
                for (const bundle of [false, true]) {
                    gruppe2.isBundleGroup = bundle;
                    gruppe2.needsUpdate = true;
                    for (let i = 0; i < 3; i++) await schuss(szene2);
                    const r0 = verschachtelteRenders;
                    const diaetBild = await mit2(null, null);
                    const renders = verschachtelteRenders - r0;
                    const wahr = await mit2(immer, null);
                    const taeterBild = await mit2(null, taeterGang);
                    const wahr2 = await mit2(immer, null);
                    verschachtelt[bundle ? "replay" : "direkt"] = { renders, diaet: gleich(diaetBild, wahr), taeter: gleich(taeterBild, wahr2) };
                }
                stand.verschachtelt = verschachtelt;
            } finally {
                A._diaetRefresh = diaetRoh;
                A._diaetGeteiltSchreiben = schreibRoh;
                delete nf.updateNode;
                delete nf.updateBeforeNode;
                rend._bindings._update = buRoh;
                rend._renderScene = szeneMitGang;
                if (ubEigen) be.updateBinding = ubRoh;
                else delete be.updateBinding;
            }
            return {
                stand,
                aufnahme,
                stoffe: stoffe.size,
                lauf: { spielBilder, kehraus: (st._gpuKehrausN || 0) - kehrausVor },
                bild: {
                    replay: gleich(bReplay, wahrY),
                    fremd: gleich(bFremd, wahrY),
                    ohneStapel: gleich(bOhne, wahrY),
                    schattenBundle: gleich(bSchatten, wahrY),
                    xGegenY: gleich(wahrX, wahrY),
                },
            };
        } finally {
            rend._renderBundle = rbRoh;
            rend._renderObjectDirect = odRoh;
            rend._renderScene = spielSzene;
            rend.shadowMap.enabled = schattenAlt;
            rend.setAnimationLoop = loopRoh;
            if (loopVerlangt) rend.setAnimationLoop(loopVerlangt);
            if (rt.dispose) rt.dispose();
        }
    })();
}

(async () => {
    console.log("=== KAMERA-TREUE — echter Renderer (WebGPU, swiftshader-Adapter, kienspan, Schatten an): Stapel · Override · Bild ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        // WebGPU auf swiftshader (die Bundle-API lebt nur im WebGPU-Backend; der WebGL2-Rückfall liest jede BundleGroup
        // als Gruppe — dort wäre die Wand blind). Die Schalter je Plattform trägt das EINE Rezept (scripts/lib/software-gpu.cjs).
        args: softwareWebGpuArgs(),
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    const vendorDrift = [];
    page.on("console", (m) => {
        const t = m.text();
        if (/Vendor-Drift/.test(t)) vendorDrift.push(t.slice(0, 200));
    });
    let out = null;
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        // Nur der Renderer muss stehen (die Welt selbst ist nicht die Bühne).
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            while (performance.now() - t0 < 240000) {
                const r = window.anazhRealm;
                if (r && r.state && r.state.rendererReady && r.state.renderer && r.state.renderer.backend) {
                    r.state.renderer.setAnimationLoop(null);
                    const be = r.state.renderer.backend;
                    return {
                        ok: true,
                        ms: Math.round(performance.now() - t0),
                        wahrheit: !!r.state.renderer.__anazhBundleWahrheit,
                        webgpu: be.isWebGPUBackend === true,
                    };
                }
                await new Promise((res) => setTimeout(res, 100));
            }
            return { ok: false };
        });
        if (!bereit.ok) throw new Error("der Renderer stand nach 240 s nicht");
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend (die Bundle-API fehlt) — die Wand wäre blind");
        log(`Renderer bereit nach ${Math.round(bereit.ms / 1000)} s (Chokepoint ${bereit.wahrheit ? "eingehängt" : "FEHLT"})`);
        out = await page.evaluate(buehne);
        log(
            `Aufnahme: ${out.aufnahme.verfolgt}/${out.aufnahme.gezeichnet} verfolgt · ${out.aufnahme.schattenRenders} Schatten-Render · ` +
                `${out.aufnahme.unterOverride} Bundles unter Override · Bild ${JSON.stringify(out.bild)}`
        );
        log(`Stand: ${JSON.stringify(out.stand)}`);
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
    for (const d of vendorDrift) v.push(`VENDOR-DRIFT: ${d}`);
    if (v.length) {
        console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
        for (const s of v) console.log("   • " + s);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — LAUF: ${out.lauf.spielBilder} Spiel-Bilder, ${out.lauf.kehraus} Kehraus-Puffer in der Bühne; die Aufnahme verfolgt ${out.aufnahme.verfolgt} von ${out.aufnahme.gezeichnet} Draws trotz Schatten-Render, ` +
            `kein Bundle unter dem Override-Stoff; der Replay zeichnet Blick Y wie der direkte Pfad (${out.bild.replay}, mit fremdem ` +
            `Schatten-Stoff ${out.bild.fremd}); ohne den Chokepoint ${out.bild.ohneStapel}, ein Schatten-Bundle ${out.bild.schattenBundle}. ` +
            `STAND: ${out.stand.teilen.programme} Karten-Programme tragen ${out.stand.teilen.gruppen} geteilte Gruppe(n); je Render ${out.stand.direkt.pruef} Prüfungen, 0 Voll-Refreshs, 0 Uploads, 0 wiederholte Gänge (direkt und Replay); nach einer Änderung im Stand zeichnet die Diät ${out.stand.aenderung.direkt.diaet}/${out.stand.aenderung.replay.diaet} wie der volle Refresh (nie-Refresh ${out.stand.aenderung.direkt.taeter}/${out.stand.aenderung.replay.taeter}); ` +
            `VERSCHACHTELT (Werfer ohne Diät) ${out.stand.verschachtelt.direkt.diaet}/${out.stand.verschachtelt.replay.diaet} (Stempel nur aus der Render-Id ${out.stand.verschachtelt.direkt.taeter}/${out.stand.verschachtelt.replay.taeter}).`
    );
})();
