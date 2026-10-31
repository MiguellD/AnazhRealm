#!/usr/bin/env node
// diag-kamera-treue.cjs — DIE KAMERA-TREUE-WAND (gate:kamera-treue): der echte Renderer (WebGPU, kienspan, Schatten an) an
// einer eigenen Bühne (BundleGroup: Boden, ausgeschnittene Karten, Kisten, ein werfendes Richtungslicht); die Chronik ist git.
//   (a) STAPEL — eine Aufnahme mit Schatten-Render verfolgt jeden aufgenommenen Draw (`_renderScene` stapelt den Zeiger).
//   (b) OVERRIDE — kein Bundle wird unter einem overrideMaterial gesammelt.
//   (c) BILD — der Replay einer Aufnahme an Blick X zeichnet Blick Y wie der direkte Pfad (≥ 0,999), auch mit fremdem
//       alphaTest am geteilten Schatten-Stoff; Kontrollen: ohne Chokepoint und mit Schatten-Bundle < 0,98, X ≠ Y (< 0,9).
//   (d) TEILEN — Programme gleicher Quellen tragen EINE geteilte Gruppe.
//   (e) STAND — je Pfad vier Frames ohne Änderung: kein Voll-Refresh (auch nicht für einen Ausschnitt je Pass, K71), kein
//       Upload, kein zweiter Gang je Render-Abschnitt (Render-Id + `info.calls`); EINMAL: eine Attribut-Änderung frischt je
//       Bürger einmal auf, der Frame danach nicht.
//   (f) ÄNDERUNG — eine Änderung im Stand zeichnet wie der volle Refresh (≥ 0,999); Kontrolle: gemuteter Melder < 0,98.
//   (g) VERSCHACHTELT — nach einem verschachtelten Render über die Vendor-Bahn (Werfer ohne Diät) zeichnet die Diät wie der
//       volle Refresh; Kontrolle: ein Stempel nur aus der Render-Id < 0,98.
//   (h) SENKE — zwei Senken EINES Stoffs zeichnen aus EINEM Knoten-Zustand, bild-gleich mit r184s InstancedMesh.
//   (i) SCHLÜSSEL (B-K1) — jedes Hauptpass-Render-Objekt der Welt trägt nach der Erst-Zeichnung den Schlüssel seines Baus.
//   (j) WURF (B-K1, Lehre 26) — Hauptpass und Wurf verwerfen gleich; ohne Ausschnitt wirft ein Werfer ohne Farb-Graph.
//   LAUF — kein Spiel-Bild und kein Kehraus-Puffer während der Bühne (der Loop ruht).
//   node scripts/diag-kamera-treue.cjs [--selftest]   (--selftest: das Urteil über grün und je einen injizierten Täter)
"use strict";
const { statikServer, starteBrowser, laufUhr, taeterFaelle, selbsttestEnde, wandEnde, abwandlung } = require("./lib/welt-boot.cjs");
const { DIAET_INSTALL, diaetUrteil } = require("./lib/diaet-linse.cjs");

const BILD_SOLL = 0.999; // der Replay zeichnet wie der direkte Pfad
const BLIND_GRENZE = 0.98; // die Lauf-Kontrollen MÜSSEN darunter liegen
const BLICK_GRENZE = 0.9; // Blick X und Blick Y sind verschiedene Bilder

const namen = (w) =>
    Object.entries(w || {})
        .map(([k, n]) => `${k} ×${n}`)
        .join(" · ") || "?";

function urteil(z) {
    const v = [];
    const l = z.lauf || {};
    if (l.spielBilder !== 0 || l.kehraus !== 0)
        v.push(
            `LAUF: ${l.spielBilder} Spiel-Bilder während der Bühne, der GPU-Kehraus nahm ${l.kehraus} Geometrie-Puffer — der Spiel-Loop lief hinein, der Lauf ist ungültig`
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
    // DIE SENKE (1410-1): EIN Knoten-Zustand je Signatur auch für Instanz-Senken, und sie zeichnet wie r184s InstancedMesh.
    const sk = z.senke || {};
    if (sk.kontrolle !== true)
        v.push("SENKE: zwei r184-InstancedMesh EINES Stoffs tragen nicht zwei Knoten-Zustände — die Lauf-Kontrolle ist blind");
    if (sk.geteilt !== true)
        v.push("SENKE: zwei Senken EINES Stoffs und EINER Geometrie tragen zwei Knoten-Zustände — die uuid je InstancedMesh steht wieder im Schlüssel (Programm je Senke)");
    if (!(sk.bild >= BILD_SOLL))
        v.push(`SENKE: der Zeichner zeichnet ${sk.bild} gleich mit r184s InstancedMesh derselben Matrizen (Soll ≥ ${BILD_SOLL}) — Lage, Farbe oder Wurf je Instanz weichen ab`);
    if (!(sk.blind < BLIND_GRENZE))
        v.push(`SENKE: ohne die Senke zeichnet die Bühne ${sk.blind} gleich (Soll < ${BLIND_GRENZE}) — die Bild-Probe sieht die Senke nicht`);
    // (i) SCHLÜSSEL · (j) WURF
    const ks = z.schluessel || {},
        wu = z.wurf || {};
    if (!ks.geprueft) v.push("SCHLÜSSEL: die Welt zeichnete kein Render-Objekt — die Probe ist blind");
    if (Object.keys(ks.veraltet || {}).length) v.push(`SCHLÜSSEL: ${namen(ks.veraltet)} — nach der Erst-Zeichnung ein anderer Schlüssel als der des Baus`);
    if (ks.kontrolle !== true) v.push("SCHLÜSSEL: die Kontrolle ist blind");
    if (!wu.leer || wu.leer.verwirft) v.push("WURF: das Standard-Fragment fehlt oder verwirft — die Probe ist blind");
    if (!(wu.werfer || []).some((x) => x.aus && x.haupt)) v.push("WURF: kein Ausschnitt verwirft — die Probe ist blind");
    for (const x of wu.werfer || []) {
        if (x.haupt !== x.wurf) v.push(`WURF: ${x.name} — Hauptpass verwirft ${x.haupt}, Wurf verwirft ${x.wurf}`);
        if (!x.aus && x.farbe) v.push(`WURF: ${x.name} — ohne Ausschnitt trägt der Wurf den Farb-Graphen`);
    }
    // DIE STAND-WAND: im Stand kostet die Diät nur die Prüfung — kein Voll-Refresh, kein zweiter Gang über einen
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
        const zl = r.zahl || {};
        // die Ruhe urteilt die Diät-Linse
        for (const u of diaetUrteil({ modus: "ruhe", frames: 4, zahl: zl, ohneMeldung: r.ohneMeldung })) v.push(`STAND ${pfad}: ${u}`);
        if ((zl.voll || 0) !== 0)
            v.push(
                `STAND ${pfad}: ${zl.voll} Voll-Refreshs je Render ohne Änderung (Soll 0: ${namen(r.vollWer)}) — ein Refresh je Frame ohne Änderung`
            );
        const e1 = r.einmal || {};
        if (!(e1.erst > 0)) v.push(`EINMAL ${pfad}: die Attribut-Änderung der Kiste frischt nichts auf — die Probe ist blind`);
        if (e1.danach !== 0)
            v.push(
                `EINMAL ${pfad}: der Frame nach einer Attribut-Änderung frischt ${e1.danach}× ein zweites Mal auf (Soll 0: ${namen(e1.wer)}) — ein Refresh ohne Änderung, die Geometrie zweimal geprüft`
            );
        if ((zl.uploadGeteilt || 0) !== 0) v.push(`STAND ${pfad}: ${zl.uploadGeteilt} Uploads geteilter Gruppen je Render ohne Änderung (Soll 0)`);
        const a = s.aenderung?.[pfad] || {};
        if (!(a.diaet >= BILD_SOLL))
            v.push(`ÄNDERUNG ${pfad}: nach Kiste und Blatt zeichnet die Diät ${a.diaet} gleich mit dem vollen Refresh (Soll ≥ ${BILD_SOLL}) — ein vergessener Refresh`);
        if (!(a.taeter < BLIND_GRENZE))
            v.push(`ÄNDERUNG ${pfad}: mit gemutetem Melder zeichnet die Diät ${a.taeter} gleich (Soll < ${BLIND_GRENZE}) — die Änderungs-Probe ist blind`);
        const n = s.verschachtelt?.[pfad] || {};
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
    const ruhig = { zahl: { pruef: 13, pruefVoll: 2 }, vollWer: {}, ohneMeldung: [], einmal: { erst: 2, danach: 0, wer: {} } };
    const gruen = {
        lauf: { spielBilder: 0, kehraus: 0 },
        aufnahme: { gezeichnet: 13, verfolgt: 13, schattenRenders: 1, unterOverride: 0 },
        bild: { replay: 1, fremd: 1, ohneStapel: 0.62, schattenBundle: 0.91, xGegenY: 0.31 },
        senke: { geteilt: true, kontrolle: true, bild: 1, blind: 0.95 },
        schluessel: { geprueft: 69, veraltet: {}, kontrolle: true },
        wurf: { leer: { verwirft: false }, werfer: [{ name: "wurf:voll", farbe: false }, { name: "wurf:schnitt", aus: true, haupt: true, wurf: true }] },
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
    const mit = abwandlung(gruen);
    const faelle = [
        { name: "Zeiger genullt", z: mit("aufnahme", { verfolgt: 1 }), muss: /verfolgt 1 von 13/ },
        { name: "Bundle unter Override", z: mit("aufnahme", { unterOverride: 2 }), muss: /unter einem overrideMaterial/ },
        { name: "Bühne ohne Schatten", z: mit("aufnahme", { schattenRenders: 0 }), muss: /kein Schatten-Render/ },
        { name: "Replay klebt", z: mit("bild", { replay: 0.4 }), muss: /klebt an der Kamera seiner Aufnahme/ },
        { name: "Schatten gegen fremden Stoff", z: mit("bild", { fremd: 0.9 }), muss: /wirft gegen den geteilten Stoff/ },
        { name: "Stapel-Probe blind", z: mit("bild", { ohneStapel: 1 }), muss: /die Stapel-Probe ist blind/ },
        { name: "Override-Probe blind", z: mit("bild", { schattenBundle: 1 }), muss: /die Override-Probe ist blind/ },
        { name: "Bühne blind", z: mit("bild", { xGegenY: 0.99 }), muss: /die Bühne ist blind/ },
        { name: "Refresh je Frame ohne Änderung", z: mit("stand.direkt.zahl", { voll: 2 }), muss: /STAND direkt: 2 Voll-Refreshs/ },
        {
            name: "Ausschnitt je Pass frischt auf (K71)",
            z: mit("stand.replay", { zahl: { pruef: 13, voll: 2 }, vollWer: { SATZ: 2 } }),
            muss: /STAND replay: 2 Voll-Refreshs je Render ohne Änderung \(Soll 0: SATZ ×2\)/,
        },
        {
            name: "Geometrie zweimal geprüft (K71)",
            z: mit("stand.direkt", { einmal: { erst: 2, danach: 2, wer: { KISTE: 2 } } }),
            muss: /EINMAL direkt: der Frame nach einer Attribut-Änderung frischt 2× ein zweites Mal auf \(Soll 0: KISTE ×2\)/,
        },
        { name: "Einmal-Probe blind", z: mit("stand.replay", { einmal: { erst: 0, danach: 0, wer: {} } }), muss: /EINMAL replay: .* die Probe ist blind/ },
        { name: "Gang je Programm (Replay)", z: mit("stand.replay.zahl", { wiederholtKnoten: 28, wiederholtGruppe: 3 }), muss: /STAND replay: RUHE: 31 wiederholte Gänge/ },
        { name: "Upload ohne Änderung", z: mit("stand.direkt.zahl", { uploadGeteilt: 1 }), muss: /1 Uploads geteilter Gruppen/ },
        { name: "Prüfung ohne Meldung", z: mit("stand.direkt", { zahl: { pruef: 27, ohneMeldung: 27 }, ohneMeldung: ["KISTE: 1"] }), muss: /STAND direkt: RUHE: 27 Prüfungen ohne Meldung je Frame \(KISTE: 1\)/ },
        { name: "vergessener Refresh", z: mit("stand.aenderung.replay", { diaet: 0.9 }), muss: /ÄNDERUNG replay: .* ein vergessener Refresh/ },
        { name: "Änderungs-Probe blind", z: mit("stand.aenderung.direkt", { taeter: 1 }), muss: /die Änderungs-Probe ist blind/ },
        { name: "Gruppe je Programm", z: mit("stand.teilen", { gruppen: 8 }), muss: /tragen 8 geteilte Gruppen statt 1/ },
        { name: "Teilen blind", z: mit("stand.teilen", { programme: 0 }), muss: /TEILEN: 0 Karten-Programme/ },
        { name: "Programm je Senke", z: mit("senke", { geteilt: false }), muss: /SENKE: zwei Senken EINES Stoffs/ },
        { name: "Senken-Kontrolle blind", z: mit("senke", { kontrolle: false }), muss: /SENKE: zwei r184-InstancedMesh/ },
        { name: "Senke zeichnet anders", z: mit("senke", { bild: 0.97 }), muss: /SENKE: der Zeichner zeichnet 0.97/ },
        { name: "Senken-Bild blind", z: mit("senke", { blind: 0.999 }), muss: /SENKE: ohne die Senke/ },
        { name: "Diät nach Anlage (B-K1)", z: mit("schluessel", { veraltet: { bauSatz: 1 } }), muss: /SCHLÜSSEL: bauSatz ×1/ },
        { name: "Schlüssel-Kontrolle blind", z: mit("schluessel", { kontrolle: false }), muss: /die Kontrolle ist blind/ },
        { name: "Welt ohne Render-Objekt", z: mit("schluessel", { geprueft: 0 }), muss: /die Welt zeichnete kein Render-Objekt/ },
        { name: "alphaTest-0,5-Werfer verliert discard", z: mit("wurf.werfer.1", { wurf: false }), muss: /WURF: wurf:schnitt — Hauptpass verwirft true, Wurf verwirft false/ },
        { name: "Farb-Graph im Wurf", z: mit("wurf.werfer.0", { farbe: true }), muss: /WURF: wurf:voll — ohne Ausschnitt/ },
        { name: "Stand blind", z: mit("stand.direkt.zahl", { pruef: 0 }), muss: /STAND direkt: DIÄT: keine Diät-Prüfung/ },
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
    taeterFaelle(faelle, urteil, { fehler });
    selbsttestEnde(fehler);
}

if (process.argv.includes("--selftest")) {
    console.log("=== KAMERA-TREUE — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}


const server = statikServer();

// DIE BÜHNE (Seiten-Kontext): der echte Renderer des Spiels mit seinen Eingriffen (_configureRenderer), eine eigene
// Szene, Zeit fest. Jeder Schuss ist ein echter Render in ein Ziel (160×120).
function buehne() {
    return (async () => {
        const T = window.THREE,
            TSL = T.TSL;
        const rend = st.renderer;
        // (i) SCHLÜSSEL: jedes Hauptpass-Render-Objekt der Welt (Welt-Szene, Senken über ihren Zeichner) trägt nach der
        // Erst-Zeichnung den Schlüssel seines Baus; Kontrolle: die Aufzählbarkeit des Beobachters wechselt ihn.
        const schluessel = { geprueft: 0, veraltet: {} };
        {
            const ros = new Set();
            st.scene.traverse((o) => {
                for (const q of [o, o.__zeichner])
                    for (const ro of q?.__renderObjekte || []) if ([].concat(ro.object.material).includes(ro.material)) ros.add(ro);
            });
            for (const ro of ros) {
                const n = ro.material.name || ro.object.name || ro.object.type;
                if (ro.initialCacheKey !== ro.getCacheKey()) schluessel.veraltet[n] = (schluessel.veraltet[n] || 0) + 1;
            }
            schluessel.geprueft = ros.size;
            const ro = [...ros].find((x) => Object.getOwnPropertyDescriptor(x.material, "setupObserver"));
            const d = ro && Object.getOwnPropertyDescriptor(ro.material, "setupObserver");
            if (d) {
                const k = ro.getCacheKey();
                Object.defineProperty(ro.material, "setupObserver", { ...d, enumerable: !d.enumerable });
                schluessel.kontrolle = ro.getCacheKey() !== k;
                Object.defineProperty(ro.material, "setupObserver", d);
            }
        }
        if (typeof rend.setAnimationLoop === "function") rend.setAnimationLoop(null);
        // DER RUHENDE SPIEL-LOOP (Lauf-Kontrolle): für die Bühne nimmt der Renderer keinen Loop an; danach gilt der verlangte.
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
        gruppe.matrixAutoUpdate = false;
        szene.add(gruppe);
        const diaet = (m) => r._materialObserverDiaet(m);
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
            // die erste Kiste ist STATISCH (rückt über updateMatrix)
            kiste.matrixAutoUpdate = i > 0;
            kiste.updateMatrix();
            kiste.castShadow = true;
            kiste.receiveShadow = true;
            kiste.frustumCulled = false;
            gruppe.add(kiste);
        }
        // DER SATZ: ein Diät-Objekt, dessen Ausschnitt (drawRange) je Pass wechselt wie ein Chunk-Satz der Welt
        // (`_chunkSatzPass`: das Hauptbild zeichnet seinen Abschnitt, die Kaskade ihren). Der Ausschnitt ist ein Draw-Parameter
        // (r184 liest ihn bei jedem Draw) — die STAND-Wand nennt jeden Voll-Refresh, den er auslöst, beim Namen.
        const satz = new T.Mesh(new T.BoxGeometry(2, 1, 2), diaet(new T.MeshStandardNodeMaterial({ color: 0x6a8aaa })));
        satz.name = "SATZ";
        satz.position.set(-4, 0.5, 6);
        satz.castShadow = true;
        satz.receiveShadow = true;
        satz.frustumCulled = false;
        gruppe.add(satz);
        // je Pass sein Abschnitt, danach wieder der des Hauptbilds (der Schatten-Render läuft mitten im Hauptbild)
        szene.onBeforeRender = (_rr, _sc, cam) => satz.geometry.setDrawRange(0, cam === kam ? Infinity : 18);
        szene.onAfterRender = () => satz.geometry.setDrawRange(0, Infinity);
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
            if (sc?.overrideMaterial) z.unterOverride++;
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
        // DER SPIEL-FRAME IN DER BÜHNE (Lauf-Kontrolle): sein GPU-Kehraus nähme der Bühne die Geometrie-Puffer, ein Replay
        // danach zeichnete das Bild davor — die Wand zählt Spiel-Bilder und Kehraus-Puffer und nennt einen Lauf ungültig.
        let spielBilder = 0;
        const kehrausVor = st._gpuKehrausN || 0;
        const zaehlUm = (bahn) =>
            function (sc, c, f) {
                if (sc && sc === st.scene && !sc.overrideMaterial) spielBilder++;
                if (sc?.overrideMaterial) {
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
            // (d)(e)(f)(g) DIE STAND-WAND: Prüfungen, Voll-Refreshs, Gänge und Uploads je Render-Abschnitt — der Zähler der Diät-Linse.
            const schreibRoh = AnazhRealm._diaetGeteiltSchreiben;
            const Z = window.__diaetZaehler();
            const gezaehlt = async (fn) => {
                const z = Z.an();
                try {
                    await fn();
                } finally {
                    Z.aus();
                }
                return z;
            };
            const stand = {};
            try {
                // (d) TEILEN: ein Hauptbild (direkter Pfad) sammelt die geteilten Gruppen der acht Karten-Programme.
                gruppe.isBundleGroup = false;
                blick(1);
                const sammle = new Map();
                const pruefRoh = AnazhRealm._diaetRefresh;
                AnazhRealm._diaetRefresh = function (obs, ro, frame, altNR) {
                    if (!ro.material.isShadowPassMaterial && karten.includes(ro.object))
                        sammle.set(ro.getNodeBuilderState(), ro.getBindings().filter((g) => g.bindings[0]?.groupNode?.shared === true).map((g) => g.id));
                    return pruefRoh(obs, ro, frame, altNR);
                };
                await schuss().finally(() => (AnazhRealm._diaetRefresh = pruefRoh));
                const jeProgramm = [...sammle.values()];
                const alle = new Set();
                for (const ids of jeProgramm) for (const id of ids) alle.add(id);
                stand.teilen = { programme: jeProgramm.length, gruppenJeProgramm: jeProgramm.length ? jeProgramm[0].length : 0, gruppen: alle.size };
                // (e) STAND: einschwingen, dann je Pfad (direkt · Replay) vier Frames ohne jede Änderung, gezählt.
                const ruhe = async (bundle) => {
                    gruppe.isBundleGroup = bundle;
                    gruppe.needsUpdate = true;
                    await schuss();
                    await schuss();
                    const z = await gezaehlt(async () => {
                        for (let i = 0; i < 4; i++) await schuss();
                    });
                    const still = { zahl: {}, vollWer: {}, ohneMeldung: Object.keys(z.ohneM) };
                    for (const k in z.n) still.zahl[k] = z.n[k] / 4;
                    for (const k in z.grund) still.vollWer[k] = z.grund[k] / 4;
                    // EINMAL JE ÄNDERUNG: ein Attribut, das jeder Pass liest, hebt seine Version — je Bürger EIN Voll-Refresh, danach keiner.
                    kisten[2].name = "KISTE";
                    kisten[2].geometry.attributes.position.needsUpdate = true;
                    const erst = await gezaehlt(schuss);
                    const danach = await gezaehlt(schuss);
                    still.einmal = { erst: erst.n.voll || 0, danach: danach.n.voll || 0, wer: danach.grund };
                    return still;
                };
                stand.direkt = await ruhe(false);
                stand.replay = await ruhe(true);
                // (f) ÄNDERUNG IM STAND: eine Kiste rückt, ein Blatt dreht — das Bild der Diät gleicht dem Bild, in dem jedes
                // Objekt voll refresht (die Wahrheit ohne Diät); mit gemutetem Melder weicht sie ab (Lauf-Kontrolle).
                const immer = () => true;
                const m4 = new T.Matrix4();
                let schritt = 0;
                const aendere = () => {
                    schritt++;
                    kisten[0].position.x += 1.5;
                    kisten[0].updateMatrix();
                    m4.makeRotationX(-Math.PI / 2 + 0.6 * schritt).setPosition(0, 3.5, -4);
                    laub.setMatrixAt(1, m4);
                    laub.instanceMatrix.needsUpdate = true;
                };
                const mitDiaet = async (fn) => {
                    const alt = AnazhRealm._diaetRefresh;
                    if (fn) AnazhRealm._diaetRefresh = fn;
                    try {
                        return await schuss();
                    } finally {
                        AnazhRealm._diaetRefresh = alt;
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
                    // der Täter: der Melder schweigt
                    const regt = AnazhRealm._regt;
                    AnazhRealm._regt = () => 0;
                    aendere();
                    const taeterBild = await mitDiaet(null).finally(() => (AnazhRealm._regt = regt));
                    const wahr2 = await mitDiaet(immer);
                    bild[bundle ? "replay" : "direkt"] = { diaet: gleich(diaetBild, wahr), taeter: gleich(taeterBild, wahr2) };
                }
                stand.aenderung = bild;
                // (g) VERSCHACHTELT: im Schatten-Render wirft nur ein Werfer ohne Diät (die Vendor-Bahn stellt die Kamera-Knoten);
                // ein Diät-Stoff ohne Schatten zeichnet zuerst (renderOrder −1), dann startet der Diät-Boden den Schatten.
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
                // Der Täter (Kontrolle): derselbe Gang mit stehendem `info.calls` — sein Stempel ist nur die Render-Id.
                const taeterGang = (rr, ro, rid) => schreibRoh(Object.create(rr, { info: { value: { calls: rid } } }), ro, rid);
                const mit2 = async (refresh, gang) => {
                    const altR = AnazhRealm._diaetRefresh,
                        altG = AnazhRealm._diaetGeteiltSchreiben;
                    if (refresh) AnazhRealm._diaetRefresh = refresh;
                    if (gang) AnazhRealm._diaetGeteiltSchreiben = gang;
                    try {
                        return await schuss(szene2);
                    } finally {
                        AnazhRealm._diaetRefresh = altR;
                        AnazhRealm._diaetGeteiltSchreiben = altG;
                    }
                };
                const verschachtelt = {};
                for (const bundle of [false, true]) {
                    gruppe2.isBundleGroup = bundle;
                    gruppe2.needsUpdate = true;
                    for (let i = 0; i < 3; i++) await schuss(szene2);
                    let diaetBild = null;
                    const renders = (await gezaehlt(async () => (diaetBild = await mit2(null, null)))).n.schattenRenders || 0;
                    const wahr = await mit2(immer, null);
                    const taeterBild = await mit2(null, taeterGang);
                    const wahr2 = await mit2(immer, null);
                    verschachtelt[bundle ? "replay" : "direkt"] = { renders, diaet: gleich(diaetBild, wahr), taeter: gleich(taeterBild, wahr2) };
                }
                stand.verschachtelt = verschachtelt;
            } finally {
                Z.zurueck();
            }
            // (h) DIE SENKE (1410-1): zwei Senken EINES Stoffs zeichnen aus EINEM Knoten-Zustand (zwei r184-InstancedMesh: zwei)
            // und wie r184s InstancedMesh derselben Matrizen; ohne die Senke weicht das Bild ab.
            const senke = {};
            {
                gruppe.isBundleGroup = false;
                const sStoff = diaet(new T.MeshStandardNodeMaterial({ color: 0x9a5a3a }));
                const sGeo = new T.BoxGeometry(1, 2, 1);
                const lage = (m, dx) => {
                    const m4 = new T.Matrix4();
                    for (let i = 0; i < 3; i++) {
                        m4.makeRotationY(0.5 * i).setPosition(-3 + dx + i * 1.6, 1, 6);
                        m.setMatrixAt(i, m4);
                        m.setColorAt(i, new T.Color().setHSL(i / 3, 0.6, 0.5));
                    }
                    m.instanceMatrix.needsUpdate = true;
                    m.instanceColor.needsUpdate = true;
                    m.castShadow = true;
                    m.receiveShadow = true;
                    m.frustumCulled = false;
                    return m;
                };
                const sA = lage(AnazhRealm._instanzMesh(sGeo, sStoff, 3), 0);
                const sB = lage(AnazhRealm._instanzMesh(sGeo, sStoff, 3), 6);
                AnazhRealm._instanzZahl(sA, 3);
                AnazhRealm._instanzZahl(sB, 3);
                const refA = lage(new T.InstancedMesh(sGeo, sStoff, 3), 0);
                const refB = lage(new T.InstancedMesh(sGeo, sStoff, 3), 6);
                const zustand = (o) => {
                    const ro = (o.__renderObjekte || []).find((x) => x.camera === kam);
                    return ro ? ro.getNodeBuilderState() : null;
                };
                blick(1);
                gruppe.add(sA, sB);
                await schuss();
                const bildSenke = await schuss();
                // wer zeichnet: der Zeichner der Senke (ein Stand ohne Zeichner zeichnet die Senke selbst)
                const zeichnet = (o) => o.__zeichner || o;
                senke.geteilt = !!zustand(zeichnet(sA)) && zustand(zeichnet(sA)) === zustand(zeichnet(sB));
                gruppe.remove(sA);
                await schuss();
                const bildOhne = await schuss();
                gruppe.add(refA);
                await schuss();
                const bildRef = await schuss();
                gruppe.remove(sB);
                gruppe.add(refB);
                await schuss();
                senke.kontrolle = !!zustand(refA) && zustand(refA) !== zustand(refB);
                senke.bild = gleich(bildSenke, bildRef);
                senke.blind = gleich(bildOhne, bildRef);
                gruppe.remove(refA, refB);
            }
            // (j) WURF: je Werfer Haupt- und Schatten-Fragment (nur der Knoten-Bau, kein kaltes Programm); Soll s. Kopf.
            const wurf = { werfer: [] };
            {
                const wSzene = new T.Scene();
                const wl = new T.DirectionalLight(0xffffff, 3);
                wl.castShadow = true;
                wSzene.add(wl, wl.target);
                const karte = new T.DataTexture(new Uint8Array(16).fill(200), 2, 2);
                const stoff = (name, o, colorNode) => Object.assign(new T.MeshStandardNodeMaterial(o), { name }, colorNode ? { colorNode } : {});
                const probe = [
                    stoff("wurf:leer", {}),
                    stoff("wurf:voll", {}, TSL.vec4(TSL.mix(TSL.color(0x2a6a2a), TSL.color(0xc8b080), TSL.uv().x), 1)),
                    stoff("wurf:karte", { map: karte }),
                    stoff("wurf:ausschnitt", { alphaTest: 0.5 }, TSL.vec4(TSL.color(0x3a8a2a), TSL.step(0.5, TSL.fract(TSL.uv().x.mul(3))))),
                ];
                for (const m of probe) wSzene.add(Object.assign(new T.Mesh(new T.PlaneGeometry(2, 2), m), { castShadow: true, receiveShadow: true, frustumCulled: false }));
                const fang = [];
                const odVor = rend._renderObjectDirect;
                rend._renderObjectDirect = function (object, material, sc, camera, lightsNode, group, clip, passId) {
                    const ro = this._objects.get(object, material, sc, camera, lightsNode, this._currentRenderContext, clip, passId);
                    const w = material.isShadowPassMaterial === true;
                    fang.push([object.material.name, w, ro.getNodeBuilderState().fragmentShader]);
                    if (!w) this._nodes.updateBefore(ro); // der Hauptpass startet die Kaskade
                };
                try {
                    rend.setRenderTarget(rt);
                    rend.render(wSzene, kam);
                } finally {
                    rend.setRenderTarget(null);
                    rend._renderObjectDirect = odVor;
                }
                const frag = (n, w) => (fang.find((f) => f[0] === n && f[1] === w) || [])[2] || "";
                const verwirft = (f) => /\bdiscard\b/.test(f);
                const leer = frag("wurf:leer", true);
                wurf.leer = leer && { verwirft: verwirft(leer) };
                for (const { name, alphaTest } of probe.slice(1))
                    wurf.werfer.push({ name, aus: alphaTest > 0, haupt: verwirft(frag(name, false)), wurf: verwirft(frag(name, true)), farbe: frag(name, true) !== leer });
                for (const m of probe) m.dispose();
            }
            return {
                wurf,
                schluessel,
                senke,
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
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 600000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    const vendorDrift = [];
    page.on("console", (m) => {
        const t = m.text();
        if (/Vendor-Drift/.test(t)) vendorDrift.push(t.slice(0, 200));
    });
    let out = null;
    const log = laufUhr();
    try {
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        // Das erste Weltbild muss stehen: (i) liest die Render-Objekte der Welt, die übrige Bühne ist eine eigene Szene.
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            await window.__weltDa((r) => {
                return !!(r?.state?.rendererReady && r.state._weltbildDa && r.state.renderer?.backend);
            });
            st.renderer.setAnimationLoop(null);
            const be = st.renderer.backend;
            return {
                ok: true,
                ms: Math.round(performance.now() - t0),
                wahrheit: !!st.renderer.__anazhBundleWahrheit,
                webgpu: be.isWebGPUBackend === true,
            };
        });
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend (die Bundle-API fehlt) — die Wand wäre blind");
        log(`Weltbild nach ${Math.round(bereit.ms / 1000)} s (Chokepoint ${bereit.wahrheit ? "eingehängt" : "FEHLT"})`);
        await page.evaluate(DIAET_INSTALL);
        out = await page.evaluate(buehne);
        log(
            `Aufnahme: ${out.aufnahme.verfolgt}/${out.aufnahme.gezeichnet} verfolgt · ${out.aufnahme.schattenRenders} Schatten-Render · ` +
                `${out.aufnahme.unterOverride} Bundles unter Override · Bild ${JSON.stringify(out.bild)}`
        );
        log(`Stand: ${JSON.stringify(out.stand)}`);
        log(`B-K1 ${JSON.stringify([out.schluessel, out.wurf])}`);
    } catch (e) {
        out = { error: e?.message || String(e) };
    }
    await browser.close();
    server.close();
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    const v = urteil(out);
    for (const d of vendorDrift) v.push(`VENDOR-DRIFT: ${d}`);
    wandEnde(
        v,
        `LAUF: ${out.lauf.spielBilder} Spiel-Bilder, ${out.lauf.kehraus} Kehraus-Puffer in der Bühne; die Aufnahme verfolgt ${out.aufnahme.verfolgt} von ${out.aufnahme.gezeichnet} Draws trotz Schatten-Render, ` +
            `kein Bundle unter dem Override-Stoff; der Replay zeichnet Blick Y wie der direkte Pfad (${out.bild.replay}, mit fremdem ` +
            `Schatten-Stoff ${out.bild.fremd}); ohne den Chokepoint ${out.bild.ohneStapel}, ein Schatten-Bundle ${out.bild.schattenBundle}. ` +
            `SCHLÜSSEL · WURF halten. ` +
            `SENKE: zwei Senken EINES Stoffs zeichnen aus EINEM Knoten-Zustand (zwei r184-InstancedMesh: zwei), bild-gleich mit r184s InstancedMesh (${out.senke.bild}; ohne die Senke ${out.senke.blind}). ` +
            `STAND: ${out.stand.teilen.programme} Karten-Programme tragen ${out.stand.teilen.gruppen} geteilte Gruppe(n); je Render ${out.stand.direkt.zahl.pruef} Prüfungen, 0 Voll-Refreshs (auch der SATZ mit Ausschnitt je Pass), 0 Uploads, 0 wiederholte Gänge (direkt und Replay); eine Attribut-Änderung frischt ${out.stand.direkt.einmal.erst}× auf und im Frame danach 0×; nach einer Änderung im Stand zeichnet die Diät ${out.stand.aenderung.direkt.diaet}/${out.stand.aenderung.replay.diaet} wie der volle Refresh (gemuteter Melder ${out.stand.aenderung.direkt.taeter}/${out.stand.aenderung.replay.taeter}); ` +
            `VERSCHACHTELT (Werfer ohne Diät) ${out.stand.verschachtelt.direkt.diaet}/${out.stand.verschachtelt.replay.diaet} (Stempel nur aus der Render-Id ${out.stand.verschachtelt.direkt.taeter}/${out.stand.verschachtelt.replay.taeter}).`
    );
})();
