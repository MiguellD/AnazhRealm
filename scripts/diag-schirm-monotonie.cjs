// diag-schirm-monotonie.cjs — DIE SCHIRM-WAND (gate:schirm-monotonie): ein kleinerer Schirm trägt höchstens
// gleich viel Welt — je Pass und Täter-Klasse —, und jedes Gesetz liest den Schirm aus der EINEN Quelle (`_schirm`).
//
// Die Wand fährt die echte Welt (Null-Renderer, Foundry an; sein Zeichenpuffer ist der Canvas, den der ECHTE
// resize-Handler setzt):
//   Q  QUELLE (kommentar-frei): eine Schirm-Größe (Zeichenpuffer · Canvas-Maß · Fenster-Maß · Bildschirm) liest nur die
//      EINE Quelle `_schirmMessen`; die Erzeuger des Puffers und die UI-Lage stehen namentlich in der Erlaubnis — jede
//      andere Methode ist ein zweiter Weg und wird mit Zeile genannt — auch über einen Alias des Renderer-Canvas (eine
//      Variable, der `….domElement` zugewiesen wird, und dort `.width/.height`).
//   K  KONSUM: `_schirm()` folgt dem Fenster, und das Fell-Gesetz liest ihn im echten Takt — derselbe Wolf im selben
//      Abstand trägt sein Fell im großen Fenster und im kleinen nicht (ein kleinerer Schirm schaltet früher ab); K-fern:
//      jenseits der Gelenk-Grenze ist sein Fell aus (die Grobstufe ist kahl), zurück an d* kehrt es zurück.
//   M  MONOTONIE: dieselbe Welt (Bühne Mittag · Sonne · Sommer je Takt gehalten, Tiere still, Regler headless voll,
//      eingeschwungen, bis sie nicht mehr wächst) in drei Fenstergrößen, gespiegelt (groß → klein → groß), je Größe drei
//      Proben aus Takten durch den echten Loop: der Szenen-Zensus je Pass (haupt = Kamera-Layer, schatten = castShadow;
//      ein unsichtbarer Ahne betritt keinen Pass) und Täter-Klasse (`_taeterKlasse`). Befehle und Dreiecke im kleineren
//      Fenster ≤ im größeren, geurteilt über Spannen und beide Klammern (Partikel atmen, ein Satz kriecht nach — beides
//      ohne den Schirm, die Drift steht im Bericht).
// SELBSTTEST (--selftest, nach der Messung in derselben Welt): (a) ein eingeschmuggeltes Gesetz liest `_schirm()`
// VERKEHRT (die Probe-Gruppe `schirmProbe` zeichnet mehr Instanzen, je kleiner der Schirm) → M rot, die Klasse genannt;
// (b) eine eingeschmuggelte Zeile liest die Canvas-Höhe an `_schirm` vorbei → Q rot, die Methode genannt; (d) dieselbe
// Lesung über einen Alias (`leinwand = renderer.domElement`, `leinwand.height`) → Q rot; (c) die Quelle eingefroren (ein
// fester Schirm) → K rot; (e) das alte Fell (das Gesetz entscheidet nur an der feinen Gestalt) → K-fern rot.
//   node scripts/diag-schirm-monotonie.cjs [--selftest]       (npm run gate:schirm-monotonie)
"use strict";
const { statikServer, ROOT: root, hauptLauf, sleep, nullSeite, stammLib, SELBSTTEST } = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");

// groß → klein; die Reihe läuft gespiegelt zurück (groß → klein → groß), jede kleinere Größe zwischen zwei Klammern
const GROESSEN = [
    [1280, 720],
    [960, 540],
    [640, 360],
];
const TAKTE = 12; // Takte je Probe
const PROBEN = 3; // Proben je Größe (die Spanne)

// ── Q: die Quelle ─────────────────────────────────────────────────────────────────────────────────────────────────────
const SCHIRM_RE =
    /getDrawingBufferSize\s*\(|domElement\.(?:width|height|clientWidth|clientHeight)\b|\binnerWidth\b|\binnerHeight\b|\bscreen\.(?:width|height|availWidth|availHeight)\b|\bvisualViewport\b/;
const ERLAUBT = {
    _schirmMessen: "die EINE Quelle (Zeichenpuffer + Sichtfeld)",
    _configureRenderer: "Erzeuger des Zeichenpuffers (setSize)",
    init: "Erzeuger: Canvas, Kamera-Seitenverhältnis, resize-Handler",
    _installHelpPopovers: "UI-Lage (Hilfe-Popover im Fenster)",
    _installResizeHandle: "UI-Lage (Panel-Griff)",
};
// Block-Kommentare behalten ihre Zeilenumbrüche (die Zeilennummern der Befunde bleiben die der Datei).
const ohneKommentare = stammLib.ohneKommentare;
// DER ALIAS: eine Methode legt den Canvas des Renderers in eine eigene Variable (`schirm =
// this.state.renderer.domElement`) und liest dort die Größe (`schirm.height`) — SCHIRM_RE sah nur `domElement.height`.
// Je Methode merkt die Linse jede Variable, der ein `….domElement` zugewiesen wird (const/let/var, Komma-Liste oder
// Zuweisung), und liest dann `<alias>.width/height/clientWidth/clientHeight` als Schirm-Lesung.
const ALIAS_ZUWEISUNG = /(?:^|[\s,(;{])([A-Za-z_$][\w$]*)\s*=\s*[^;=]*?\bdomElement\b(?!\s*\.)/g;
function quellBefunde(src) {
    const b = [];
    const zeilen = ohneKommentare(src).split("\n");
    // Die Methode einer Zeile am AST (stammLib.glieder, K38-N2): ein umbrochener Kopf oder ein Kopf mit `)` im
    // Default-Parameter fiel aus dem Kopf-Muster, und seine Zeilen lasen still unter dem Namen der Methode davor.
    const gl = stammLib.glieder(src);
    const roh = src.split("\n");
    const ab = [];
    for (let i = 0, o = 0; i < roh.length; o += roh[i].length + 1, i++) ab.push(o);
    let methode = null;
    let aliase = new Set();
    zeilen.forEach((z, i) => {
        const g = stammLib.gliedAn(gl, ab[i] + roh[i].search(/\S|$/));
        if ((g ? g.name : null) !== methode) {
            methode = g ? g.name : null;
            aliase = new Set();
        }
        ALIAS_ZUWEISUNG.lastIndex = 0;
        let m;
        while ((m = ALIAS_ZUWEISUNG.exec(z))) aliase.add(m[1]);
        const aliasLiest = [...aliase].some((a) =>
            new RegExp("(?:^|[^\\w$.])" + a.replace(/\$/g, "\\$") + "\\.(?:width|height|clientWidth|clientHeight)\\b").test(z)
        );
        if (!SCHIRM_RE.test(z) && !aliasLiest) return;
        if (!methode || !ERLAUBT[methode])
            b.push(`${methode || "?"} (Zeile ${i + 1}) liest die Schirm-Größe an \`_schirm\` vorbei: \`${z.trim().slice(0, 90)}\``);
    });
    return b;
}

// ── M: das Urteil über die Zensus-Reihe (rein, Node) ──────────────────────────────────────────────────────────────────
// reihe = die gespiegelte Folge groß → klein → groß (1280×720 · 960×540 · 640×360 · 960×540 · 1280×720), je Größe {
// groesse, proben: [{ "<klasse>|<pass>": { cmd, tris } }, …] }. Zwei Dinge bewegen die Welt ohne den Schirm: Zufälliges
// (Partikel — der Dorf-Rauch atmet bei fester Größe 23–26 Befehle) und langsames Wachsen (der Wasser-Satz kroch über
// eine Reihe 2124 → 2152 Dreiecke). Darum urteilt die Wand über SPANNEN und KLAMMERN: eine Größe trägt die Proben
// beider Durchgänge, und VERKEHRT ist eine Klasse erst, wenn JEDE Probe im kleineren Fenster über JEDER im größeren
// liegt — eine Drift hebt die spätere Klammer mit und wird nie als Schirm-Gesetz gelesen (sie steht als DRIFT im
// Bericht, wenn die beiden Enden der Reihe sich nicht treffen).
const werte = (r, k, f) => r.proben.map((z) => (z[k] ? z[k][f] : 0));
const spanne = (w) => ({ lo: Math.min(...w), hi: Math.max(...w) });
const zeige = (s) => (s.lo === s.hi ? `${s.lo}` : `${s.lo}–${s.hi}`);
function monotonieBefunde(reihe) {
    const b = [];
    const L = reihe.length;
    const stufen = (L + 1) / 2; // groß … klein
    const schluessel = new Set(reihe.flatMap((r) => r.proben.flatMap((z) => Object.keys(z))));
    const stufe = (i, k, f) =>
        spanne(i === L - 1 - i ? werte(reihe[i], k, f) : [...werte(reihe[i], k, f), ...werte(reihe[L - 1 - i], k, f)]);
    for (const k of schluessel) {
        const i = k.lastIndexOf("|"),
            [kl, pass] = [k.slice(0, i), k.slice(i + 1)];
        for (const f of ["cmd", "tris"]) {
            const was = f === "cmd" ? "Befehle" : "Dreiecke";
            for (let i = 1; i < stufen; i++) {
                const gross = stufe(i - 1, k, f),
                    klein = stufe(i, k, f);
                if (klein.lo > gross.hi)
                    b.push(
                        `VERKEHRT ${kl} · ${pass}: ${was} ${reihe[i].groesse} ${zeige(klein)} > ${reihe[i - 1].groesse} ${zeige(gross)} — ein kleinerer Schirm zeichnet mehr`
                    );
            }
        }
    }
    return b;
}
// Die Drift (Bericht, kein Urteil): Klassen, deren Anfang und Ende der Reihe (dieselbe Größe) sich nicht treffen.
function driftBefunde(reihe) {
    const [a, e] = [reihe[0], reihe[reihe.length - 1]];
    const aus = [];
    for (const k of new Set([...a.proben, ...e.proben].flatMap((z) => Object.keys(z)))) {
        const [sa, se] = [spanne(werte(a, k, "tris")), spanne(werte(e, k, "tris"))];
        if (se.lo > sa.hi || se.hi < sa.lo) aus.push(`${k.replace("|", " · ")} ${zeige(sa)} → ${zeige(se)} Dreiecke`);
    }
    return aus;
}

// ── die Welt ──────────────────────────────────────────────────────────────────────────────────────────────────────────
async function welt() {
    const server = statikServer();
    await server.lausche(0);
    const { browser, page } = await nullSeite({ frist: 900000 });
    await page.setViewport({ width: GROESSEN[0][0], height: GROESSEN[0][1], deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // der Messort aus spec/profiband/haushalt.json (`__messWiese`)
    await server.zeige(page, 60000);
    await page.evaluate(AUSGABE_INSTALL);
    const ende = async () => {
        await browser.close();
        server.close();
    };

    // Boot · Mess-Wiese · Einschwingen · Bühne · stille Tiere · der Wolf der Fell-Probe
    const boot = await page.evaluate(async (groessen) => {
        await window.__weltDa();
        if (!st.renderer?._isHeadlessNull) return { fatal: "kein Null-Renderer" };
        const f = r._ensureAssetFoundry?.();
        await __weltDa(() => f?.ready && f.recipeCount > 0);
        if (!f?.ready) return { fatal: "Foundry nicht bereit" };
        // DER TAKT der Wand: der echte Loop unter gehaltener Bühne (Mittag, Wetter fest).
        window.__schirmTakt = () => {
            st._frameOverBudget = false;
            st.timeOfDay = 0.5;
            if (st.world) st.world.timeOfDay = 0.5;
            window.__wetterHalten();
            __handTakt();
            // Der Probe-Wolf behält sein Maß: zwei Schreiber lassen Tiere im Takt wachsen (`updateGrowth` ×1,01, die
            // Nexus-Geste `creatures_size_mul` bis ×3 je Ruf) — ein Lauf traf den Wolf 13,8-fach, nachdem d* stand.
            const wolf = window.__schirmWolf;
            if (wolf && window.__schirmWolfMass) wolf.scale.setScalar(window.__schirmWolfMass);
        };
        const takt = window.__schirmTakt;
        // DER SZENEN-ZENSUS je Täter-Klasse und Pass: haupt = Kamera-Layer, schatten = castShadow; ein unsichtbarer Ahne
        // betritt keinen Pass, eine leere Instanz-Senke zeichnet nicht. Befehle wie der Draw-Zähler (BatchedMesh je Instanz).
        window.__schirmZensus = () => {
            const z = {};
            st.scene.traverseVisible((o) => {
                const g = o.geometry;
                if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite)) return;
                let [cmd, tris] = [1, 0];
                if (o.isBatchedMesh) {
                    cmd = o._multiDrawCount | 0;
                    for (let i = 0; i < cmd; i++) tris += o._multiDrawCounts[i] / 3;
                } else if (g) {
                    const nn = g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
                    tris = (Number.isFinite(g.drawRange.count) ? Math.min(g.drawRange.count, nn) : nn) / 3;
                    if (o.isInstancedMesh) [tris, cmd] = [tris * o.count, o.count > 0 ? 1 : 0];
                }
                const kl = r._taeterKlasse(o);
                for (const [pass, an] of [
                    ["haupt", o.layers.test(st.camera.layers)],
                    ["schatten", o.castShadow],
                ])
                    if (cmd > 0 && an) {
                        const e = z[kl + "|" + pass] || (z[kl + "|" + pass] = { cmd: 0, tris: 0 });
                        [e.cmd, e.tris] = [e.cmd + cmd, e.tris + Math.round(tris)];
                    }
            });
            return z;
        };
        const [x, z] = window.__messWiese;
        pm.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
        const offen = () => r._weltOffen().foundry; // die Foundry, wie sie das Wort „die Welt steht" zählt (A9)
        const takte = await __weltStehtNach(takt); // die Welt steht (das EINE Einschwingen, welt-boot)
        window.__buehne();
        window.__halten();
        // DIE VÖGEL HALTEN STILL: Lied und Bahn je Revier folgen der Welt-Uhr (`_vogelTakt` liest `spielZeit`, der Schwarm ebenso),
        // nie dem Schirm, und ihr Pool zählt jeden Sänger im Hör-Kreis, im Bild oder nicht — die Uhr lief durch die Reihe: am 30.10.
        // (tore-k5-tuer-neu, zwei Läufe) sang im kleinen Fenster einer mehr, Klasse vogel 688 > 608–648 Dreiecke, VERKEHRT ohne ein
        // Schirm-Gesetz (auf main schwankte dieselbe Klasse ±40 je Reihe, nur nie im Buckel der Mitte). Ihr Takt ruht: der Pool
        // behält die Lage seines letzten Takts
        r._vogelTakt = r._bestaeuberTakt = () => {};
        // DIE BESTÄUBER EBENSO: ihr Besuch je Blüte folgt der Welt-Uhr (`_bestaeuberTakt`: `bestaeuberBesuch(h, spielZeit, …)`),
        // nie dem Schirm — am 03.11. (w5-stufen, zwei Läufe) flog im kleinen Fenster einer mehr, tier:bestaeuber 432 > 416–424
        // Dreiecke; ihr Pool behält die Lage seines letzten Takts
        // DER WOLF DER FELL-PROBE: im Abstand d*, an dem das Fell-Gesetz im großen Fenster trägt (px ≥ px·(1+hyst)) und
        // im kleinen nicht (px < px·(1−hyst)) — das geometrische Mittel der Schwellen der beiden Ränder der Reihe.
        const cam = st.camera;
        const vor = new window.THREE.Vector3();
        cam.getWorldDirection(vor);
        vor.y = 0;
        vor.normalize();
        const wx = cam.position.x + vor.x * 4,
            wz = cam.position.z + vor.z * 4;
        const w = r.spawnCreatureAt(wx, r._voxelSurfaceY(wx, wz) + 0.5, wz, "happy", "wolf", { bodySize: 1 });
        if (!w) return { fatal: "Wolf-Spawn scheiterte" };
        w.userData.task = { name: "wait", args: {}, since: performance.now() / 1000 };
        w.userData.emotions = null;
        window.__schirmWolf = w;
        window.__schirmWolfMass = w.scale.x;
        for (let i = 0; i < 400 && !w.userData._tierBaum?.wrap; i++) {
            takt();
            await sleep(15);
        }
        const tB = w.userData._tierBaum;
        if (!tB) return { fatal: "der Wolf trägt keine Studio-Gestalt" };
        // DIE STILLE: gemessen wird erst, wenn die Welt nicht mehr WÄCHST — dreimal in Folge (je 30 Takte) übersteigt keine
        // Klasse ihr bisheriges Maximum (Zufälliges wie der Rauch atmet innerhalb seiner Spanne und hält die Stille nicht auf).
        const hoch = {};
        const waechst = () =>
            Object.entries(window.__schirmZensus()).filter(([k, e]) => {
                const h = hoch[k] || { cmd: -1, tris: -1 };
                hoch[k] = { cmd: Math.max(h.cmd, e.cmd), tris: Math.max(h.tris, e.tris) };
                return e.cmd > h.cmd || e.tris > h.tris;
            }).length > 0;
        waechst();
        let still = 0,
            stillTakte = 0;
        for (const weiter = __deckel("der stille Schirm", 400); still < 3 && weiter(); ) {
            for (let i = 0; i < 30; i++) {
                takt();
                stillTakte++;
                await sleep(10);
            }
            still = waechst() ? 0 : still + 1;
        }
        // erst nach der Stille: der Wolf steht im Abstand d* seines jetzigen Maßes
        // das Maß des Fells ist die Höhe seines Schalen-Stapels (`_fellHoehe`), die Toleranz die jeder Stufe (LOD_SCHIRM.px)
        const breite = AnazhRealm._fellHoehe(tB) * w.scale.x;
        const dStern =
            (breite * Math.sqrt(groessen[0][1] * groessen[groessen.length - 1][1])) /
            (2 * Math.tan((cam.fov * Math.PI) / 360)) /
            AnazhRealm.LOD_SCHIRM.px;
        // DAS FELL FOLGT DER STUFE (K-fern, w5-stufen): derselbe Wolf jenseits der Gelenk-Grenze (1,5 × `ab` der Grobstufe) — die
        // Grobstufe ist kahl, das Fell aus; zurück an d* trägt er es wieder (K). Vorher trug ein Tier jenseits (im Satz, im Feld)
        // den Zustand seines letzten nahen Takts oder keinen („an“ in jeder Ferne, haar.K5 Radeon 5fba36ea).
        const fernAb = 1.5 * window.__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur[1].ab * w.scale.x;
        window.__fellFern = async () => {
            for (let k = 0; k < 20; k++) {
                w.position.copy(cam.position).addScaledVector(vor, fernAb);
                takt();
                await sleep(10);
            }
            return [w.userData._gelenk.istFern, tB._fellAn, tB.straehnen.filter((o) => o.visible).length];
        };
        const fern = await window.__fellFern();
        // horizontal so weit, dass der 3D-Abstand d* ist (die Kamera steht über dem Boden)
        for (let k = 0; k < 3; k++) {
            const dy = cam.position.y - w.position.y;
            const hz = Math.sqrt(Math.max(0.25, dStern * dStern - dy * dy));
            const px = cam.position.x + vor.x * hz,
                pz = cam.position.z + vor.z * hz;
            w.position.set(px, r._voxelSurfaceY(px, pz) + 0.5, pz);
            takt();
            await sleep(15);
        }
        return {
            fern,
            takte,
            stillTakte,
            still: still >= 3,
            chunks: st.voxelChunks ? st.voxelChunks.size : 0,
            foundryOffen: offen(),
            dStern: +dStern.toFixed(2),
            dWolf: +cam.position.distanceTo(w.position).toFixed(2),
            nahGrenze: +(fernAb / 1.5).toFixed(1),
        };
    }, GROESSEN);
    if (boot.fatal) {
        await ende();
        return { fatal: boot.fatal };
    }

    // Eine Größe: der ECHTE resize-Handler (Viewport), Takte durch den Loop, dann Schirm, Fell und Zensus.
    const phase = async (w, h) => {
        await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
        await sleep(150);
        return page.evaluate(
            async (TAKTE, PROBEN) => {
                const proben = [];
                for (let p = 0; p < PROBEN; p++) {
                    for (let i = 0; i < TAKTE; i++) {
                        window.__schirmTakt();
                        await sleep(10);
                    }
                    proben.push(window.__schirmZensus());
                }
                const [s, w] = [r._schirm(), window.__schirmWolf];
                return {
                    schirm: { breite: s.breite, hoehe: s.hoehe, pxJeM: s.pxJeM && +s.pxJeM.toFixed(1) },
                    fell: w.userData._tierBaum._fellAn,
                    dWolf: +st.camera.position.distanceTo(w.position).toFixed(2),
                    proben,
                };
            },
            TAKTE,
            PROBEN
        );
    };
    const reihe = async () => {
        const aus = [];
        for (const [w, h] of [...GROESSEN, ...GROESSEN.slice(0, -1).reverse()]) aus.push(Object.assign({ groesse: `${w}×${h}` }, await phase(w, h)));
        return aus;
    };

    const messung = await reihe();
    // die EINE Quelle liest den Zeichenpuffer am Ruf
    const quelleLiest = await page.evaluate(() => {
        const ren = st.renderer,
            alt = ren.getDrawingBufferSize,
            eigen = Object.hasOwn(ren, "getDrawingBufferSize");
        let n = 0;
        ren.getDrawingBufferSize = function (...a) { n++; return alt.apply(this, a); };
        try { r._schirmMessen(); } finally { if (eigen) ren.getDrawingBufferSize = alt; else delete ren.getDrawingBufferSize; }
        return n > 0;
    });
    let selbst = null;
    if (SELBSTTEST) {
        selbst = {};
        // (a) ein VERKEHRTES Gesetz: die Probe-Gruppe liest `_schirm()` und zeichnet mehr Instanzen, je kleiner der Schirm
        await page.evaluate(() => {
            const T = window.THREE;
            const probe = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial(), 64);
            Object.assign(probe, { name: "schirmProbe", frustumCulled: false });
            st.scene.add(probe);
            const roh = Object.getPrototypeOf(r)._schirmMessen;
            r._schirmMessen = function () {
                const s = roh.call(this);
                AnazhRealm._instanzZahl(probe, Math.min(64, Math.round((8 * 720) / Math.max(1, s.hoehe))));
                return s;
            };
            window.__schirmProbe = probe;
        });
        selbst.verkehrt = await reihe();
        // (c) die Quelle EINGEFROREN: ein fester Schirm (der alte Rückfall 1080) — das Fell folgt dem Fenster nicht mehr
        await page.evaluate(() => {
            st.scene.remove(window.__schirmProbe);
            const roh = Object.getPrototypeOf(r)._schirmMessen;
            r._schirmMessen = function () {
                const s = roh.call(this);
                s.hoehe = 1080;
                s.pxJeM = 1080 / (2 * Math.tan((this.state.camera.fov * Math.PI) / 360));
                return s;
            };
        });
        selbst.eingefroren = await reihe();
        // (e) DAS ALTE FELL: das Gesetz entscheidet nur an der feinen Gestalt (jenseits bleibt der Zustand stehen) — K-fern rot
        selbst.fern = await page.evaluate(() => {
            delete r._schirmMessen;
            const roh = Object.getPrototypeOf(r)._fellBildschirmGesetz;
            r._fellBildschirmGesetz = function (c, tB, a, g) {
                if (g !== false) roh.call(this, c, tB, a);
            };
            return window.__fellFern();
        });
    }
    await ende();
    return { boot, messung, selbst, quelleLiest };
}

// K: das Fell-Gesetz folgt dem Schirm (Reihe groß → klein → Kontrolle)
function konsumBefunde(reihe) {
    const [b, [a, , c], kontrolle] = [[], reihe, reihe[reihe.length - 1]];
    if (!(a.schirm.hoehe === GROESSEN[0][1] && c.schirm.hoehe === GROESSEN[2][1]))
        b.push(`der Schirm folgt dem Fenster nicht (${reihe.map((x) => x.schirm.hoehe).join(" → ")} Bildpunkte hoch)`);
    if (!(a.schirm.pxJeM > c.schirm.pxJeM))
        b.push(`pxJeM fällt mit dem Fenster nicht (${a.schirm.pxJeM} → ${c.schirm.pxJeM})`);
    if (a.fell !== true) b.push(`großes Fenster (${a.groesse}, ${a.dWolf} m) ohne Fell — die Probe ist blind`);
    if (c.fell !== false)
        b.push(`kleines Fenster (${c.groesse}, ${c.dWolf} m) noch Fell — das Fell-Gesetz liest den Schirm nicht`);
    if (kontrolle.fell !== true) b.push(`zurück im großen Fenster kein Fell (${kontrolle.fell})`);
    return b;
}

// K-fern: jenseits der Gelenk-Grenze ist das Fell aus (die Grobstufe ist kahl)
const fernBefunde = ([fern, an, n]) =>
    fern && an === false && !n ? [] : [`jenseits der Gelenk-Grenze (fern ${fern}) Fell ${an}, ${n} Strähnen`];

hauptLauf(async () => {
    let ok = true;
    const check = (name, befunde) => {
        const gut = befunde.length === 0;
        console.log(`  ${gut ? "✅" : "❌"} ${name}`);
        for (const b of befunde.slice(0, 12)) console.log(`      ${b}`);
        if (befunde.length > 12) console.log(`      … ${befunde.length - 12} weitere`);
        if (!gut) ok = false;
    };
    const src = stammLib.text(root);
    console.log("=== Schirm-Wand: Q · die EINE Quelle ===");
    check("Q jede Schirm-Größe liest `_schirm` (Erzeuger und UI-Lage namentlich erlaubt)", quellBefunde(src));

    const w = await welt();
    if (w.fatal) {
        console.log(`  ❌ Welt: ${w.fatal}\nROT schirm-monotonie`);
        process.exit(1);
    }
    const b = w.boot;
    console.log(
        `=== Welt: ${b.takte} Takte, ${b.chunks} Chunks, Foundry offen ${b.foundryOffen}, still nach ${b.stillTakte} (${b.still ? "ja" : "NEIN"}) · d* ${b.dStern} m (Wolf ${b.dWolf} m, Grobstufe ab ${b.nahGrenze} m) ===`
    );
    for (const p of w.messung) {
        const sum = (pass) =>
            Object.entries(p.proben[0])
                .filter(([k]) => k.endsWith("|" + pass))
                .reduce((a, [, e]) => ({ cmd: a.cmd + e.cmd, tris: a.tris + e.tris }), { cmd: 0, tris: 0 });
        const hp = sum("haupt"),
            sp = sum("schatten");
        console.log(
            `  ${p.groesse.padEnd(9)} Schirm ${p.schirm.breite}×${p.schirm.hoehe} pxJeM ${p.schirm.pxJeM} · haupt ${hp.cmd} Befehle ${hp.tris} Dreiecke · schatten ${sp.cmd} / ${sp.tris} · Wolf-Fell ${p.fell}`
        );
    }
    console.log("=== K · das Fell-Gesetz liest den Schirm ===");
    check("K derselbe Wolf: Fell im großen Fenster, keines im kleinen, zurück im großen", konsumBefunde(w.messung));
    check("K-fern jenseits der Gelenk-Grenze kein Fell (die Grobstufe ist kahl)", fernBefunde(b.fern));
    check(
        "Q `_schirmMessen` liest den Zeichenpuffer (getDrawingBufferSize, am Ruf)",
        w.quelleLiest ? [] : ["kein Ruf"]
    );
    console.log("=== M · ein kleinerer Schirm trägt höchstens gleich viel (je Pass und Täter-Klasse) ===");
    check("M Befehle und Dreiecke fallen oder halten von groß nach klein (Spannen, beide Klammern)", monotonieBefunde(w.messung));
    for (const d of driftBefunde(w.messung)) console.log(`      (Drift, ohne Schirm) ${d}`);

    if (SELBSTTEST) {
        console.log("=== SELBSTTEST ===");
        const sa = monotonieBefunde(w.selbst.verkehrt);
        check(
            "S(a) ein verkehrtes Gesetz (schirmProbe): M rot, die Klasse genannt",
            sa.some((x) => /^VERKEHRT schirmProbe · haupt/.test(x))
                ? []
                : ["M blieb blind: " + (sa[0] || "kein Befund")]
        );
        for (const x of sa.filter((y) => /schirmProbe/.test(y)).slice(0, 2)) console.log(`      (Selbsttest) ${x}`);
        // S(b) eine Zeile liest die Canvas-Höhe an `_schirm` vorbei · S(d) DER ALIAS-TÄTER: dieselbe Lesung über eine lokale Variable,
        // der der Canvas des Renderers zugewiesen wird — je Q rot, die Methode genannt
        for (const [fall, name, zeile] of [
            [
                "S(b)",
                "eine Zeile liest die Canvas-Höhe an `_schirm` vorbei",
                "const pxJeM = this.state.renderer.domElement.height / 1.53;",
            ],
            [
                "S(d)",
                "ein Alias des Renderer-Canvas (`leinwand.height`)",
                "const leinwand = this.state.renderer && this.state.renderer.domElement;\n        const pxJeM = leinwand.height / 1.53;",
            ],
        ]) {
            const taeter = stammLib.ersetze(src, "_fellBildschirmGesetz", "const pxJeM = this._schirm().pxJeM;", zeile);
            const sb = quellBefunde(taeter);
            const genannt = taeter !== src && sb.some((x) => /^_fellBildschirmGesetz \(Zeile \d+\)/.test(x));
            check(
                `${fall} ${name}: Q rot, die Methode genannt`,
                genannt ? [] : ["Q blieb blind: " + (sb[0] || "kein Befund")]
            );
            for (const x of sb.slice(0, 2)) console.log(`      (Selbsttest) ${x}`);
        }
        const sc = konsumBefunde(w.selbst.eingefroren);
        check(
            "S(c) die Quelle eingefroren (fester Schirm 1080): K rot",
            sc.some((x) => /noch Fell|folgt dem Fenster nicht/.test(x)) ? [] : ["K blieb blind"]
        );
        for (const x of sc.slice(0, 2)) console.log(`      (Selbsttest) ${x}`);
        const se = fernBefunde(w.selbst.fern);
        check("S(e) das Fell nur nah entschieden: K-fern rot", se.length ? [] : ["K-fern blieb blind"]);
        for (const x of se) console.log(`      (Selbsttest) ${x}`);
    }
    console.log(ok ? "GRÜN schirm-monotonie" : "ROT schirm-monotonie");
    process.exit(ok ? 0 : 1);
});
