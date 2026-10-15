// diag-portal-membran.cjs — V18.464 DIE PORTAL-VOLLENDUNG (Konsum-Beweis).
// Beweist im ECHTEN Boot (foundry-ON, warmes Buch, Null-Renderer), dass ein
// Tor-Gestalt-Portal in der Welt VOLLSTÄNDIG integriert ist:
//
//   K (Kollision): das gespawnte Welt-Portal trägt die GESETZ-Hülle
//     (5 Pseudo-Part-Boxen aus deriveGate) — die APERTUR ist körperlich FREI
//     (Probe-Punkte in der Öffnung treffen keine Box), die PFOSTEN sind
//     SOLIDE (Probe-Punkte im Rahmen treffen), und der alte Quarz-Riegel
//     (Alt-Substanz-AABB mitten in der Öffnung) ist GEFALLEN.
//   Z (Ziel, D8): das Tor wartet auf sein Ziel — die Zeile seiner Ziel-Welt im Atlas der Ziele kommt aus dem EINEN Export der
//     Welt selbst (der verborgene Rahmen, die Hülle `AnazhHuelle.panorama`) oder von der Platte, mit dem SHA-Stempel ihrer
//     Quellen; die Membran liest genau diese Zeile (Stoff-Wert `ziel`), der Atlas ist rgba16float, 256 Zeilen je Ziel. N (Absenz):
//     kein Nebel-Kasten, kein Nebel-Gesetz am Tor (D8: der Kasten fiel), kein Host-Panorama der eigenen Welt (`_torPanorama`).
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
//       B2 70 m vor dem Ring, Blick vom Ring weg: KEINE Membran zeichnet — Täter beim Namen (Gestalt, Abstand)
//       B3 die Hülle trägt die Welle: die Kugel jeder Membran-Geometrie reicht in z bis zur Amplitude des Gesetzes
//       BS Selbsttest am echten Frame: mit `frustumCulled = false` (dem alten Stand) MUSS B2 jede Membran beim Namen nennen
//       H  (K64-n1, D8) aus der Ring-Mitte, AUSGABE-Pfad: die Öffnung brennt nicht aus (Y > 240 ≤ 5 %) und liest nicht als Milch
//          (unbunt und hell — K5 milchweiss `klassenMasse`: C*ab < 5 bei L* ≥ 50 — ≤ 5 %, gegen das Bild ohne Film: Milch ist,
//          was der Film dem Ziel hinzufügt, nie ein blasses Ziel): sie zeigt das Ziel durch den Film
//       HS Selbsttest: der Milch-Leser (die Öffnung als helles Weiß, das Bild des Stands vor D8) MUSS in H rot werden — in
//          DERSELBEN Seite, gegen dieselbe Maske
//       HM (K64-n3) die Maske zeichnet ohne kaltes Programm (je Bild gezählt: neue Vertex-/Fragment-Programme), HMS Selbsttest:
//          derselbe Zähler sieht das kalte Programm des Milch-Lesers
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
// Renderer nach dem Culling zeichnet. `opts.alt`: alle Membranen auf `frustumCulled = false` (der Selbsttest).
async function blickProbe(opts) {
    const warte = (ms) => new Promise((q) => setTimeout(q, ms));
    const t0 = performance.now();
    let r = null,
        st = null;
    while (performance.now() - t0 < 300000) {
        r = window.anazhRealm;
        st = r && r.state;
        if (st && st.rendererReady && st.renderer && st.renderer.backend && st.camera && r._portalMembranes && r._torZielAtlas) {
            // DAS FENSTER WARTET AUF SEIN ZIEL (D8): erst wenn jedes angefragte Ziel steht (oder bricht) und der nächste 1-Hz-Scan
            // lief, stehen alle Membranen des Rings — vorher hing B1 an der Reihenfolge der Ankünfte (15.10.: drei Membranen ohne
            // das Drachentor im Blick nach −x, 0 von 3; dieselbe Welt mit allen vier: 1 von 4)
            await Promise.all([...r._torZielAtlas.welten.values()].map((z) => z.kommt));
            await warte(1500);
            if (r._portalMembranes.size >= 3) break;
        }
        await warte(250);
    }
    if (!st || !st.renderer || st.renderer.backend.isWebGPUBackend !== true) return { fehler: "kein WebGPU-Renderer" };
    if (!r._portalMembranes || r._portalMembranes.size < 3)
        return { fehler: `Membranen am Ring: ${r._portalMembranes ? r._portalMembranes.size : 0} nach 300 s` };
    if (opts.nurWarten) return { bereit: true };
    const rend = st.renderer;
    rend.setAnimationLoop(null);
    const recs = [...r._portalMembranes.values()];
    if (opts.alt) for (const rec of recs) rec.mesh.frustumCulled = false;
    const nf = rend._nodes && rend._nodes.nodeFrame;
    const roh = rend._renderObjectDirect;
    let zug = null;
    rend._renderObjectDirect = function (object, material, scene, camera, ...rest) {
        const inv = object.userData && object.userData.inventar;
        if (zug && camera === st.camera && inv === "portal-membran") zug.push(object);
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
            const rec = recs.find((x) => x.mesh === o);
            const p = new window.THREE.Vector3();
            o.getWorldPosition(p);
            return `${o.userData.inventar} ${rec ? rec.tor.gestalt : "?"} (${Math.round(p.distanceTo(cam.position))} m)`;
        };
        return {
            membran: gesehen.filter((o) => o.userData.inventar === "portal-membran").length,
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

// H (K64-n1, die Hellen Tafeln; D8 das Tor als Fenster): aus der Ring-Mitte (der Spieler am Spawn, die Tore wach) liest der
// AUSGABE-Pfad die Pixel jeder Membran. Bis D8 stand die Öffnung milchig-weiß (der Nebel-Kasten, der Anzeige-Wert der Shell); seit
// D8 zeigt sie das Panorama der Ziel-Welt durch den Film. EINE Seite, EIN Blick, die Uhr steht — drei Bilder:
//   A    die Welt, wie sie die Membran zeigt: der Ausgabe-Pfad der Welt (TRAA, Tonung, Belichtung aus dem Licht), gezeichnet
//        werden nur die gemessenen Bürger — Membran und Himmel (K64-n3). Die Membran ist deckend, wirft und empfängt keinen
//        Schatten (`_membranBauFor`): ihr Pixel hängt an keinem anderen Bürger. Die ganze Welt im Bild baute auf swiftshader jedes
//        Programm im Blick, das die Bühne neu lichtet, und jedes, das während H ankam (CI Lauf 38674187005: A 10 kalt 113 s,
//        M 6 kalt 227 s). Die Lichter bleiben (kein Programm wechselt seinen Licht-Schlüssel).
//   M    die Maske OHNE Programm (K64-n3): dieselbe Welt mit verborgenen Membranen — Membran-Pixel sind die, in denen die Welt
//        mit Membran sichtbar anders steht (ein Kanal ≥ STUFE). Bis K64-n3 malte M die Membranen magenta: EIN kaltes
//        Programm, in der CI 195 s von 233 s des Gates (Lauf 38670064375); A gegen A wiederholt weicht kein Pixel ab (die Uhr
//        steht, TRAA ist bei gleicher Lage gleich), die Differenz-Maske deckt sich mit der magenta (swiftshader: 7 876 von 8 014
//        Pixeln, 1 außerhalb). HM zählt die kalten Programme je Bild und hält die Maske bei 0.
// H läuft VOR den Blicken B: deren Frames stoßen die Programme der ganzen Welt an, die der GPU-Prozess sonst während H übersetzt.
//   R    der Milch-Leser (HS, EIN Programm): die Öffnung als helles Weiß — das Bild des Stands vor D8, in derselben Maske.
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
    const vor = recs.map((rec) => rec.mesh.material.colorNode);
    const sicht = recs.map((rec) => rec.mesh.visible);
    const setze = (fm) =>
        recs.forEach((rec) => {
            rec.mesh.material.colorNode = fm(rec);
            rec.mesh.material.needsUpdate = true;
        });
    // NUR DIE GEMESSENEN BÜRGER zeichnen (K64-n3): jedes Objekt der Szene außer Membran und Himmel fällt aus dem Zeichnen
    // (die Render-Objekt-Funktion des Renderers; die Ausgabe-Kette und der Hintergrund hängen nicht in der Szene und zeichnen)
    const nur = new Set();
    for (const rec of recs) nur.add(rec.mesh);
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
    try {
        const A = await uhr("A", schuss);
        // die Maske: dieselbe Welt ohne Membranen (kein Stoff wechselt, kein Programm entsteht)
        recs.forEach((rec) => (rec.mesh.visible = false));
        const M = await uhr("M", schuss);
        recs.forEach((rec, i) => (rec.mesh.visible = sicht[i]));
        // DAS BILD OHNE FILM (D8): dieselbe Welt, jede Membran zeigt nur ihr Ziel (`__membranOhneFilm`) — Milch ist, was der Film
        // dem Ziel hinzufügt (K5 `klassenMasse` mit dem Bild ohne Film), nie ein blasses Ziel
        window.__membranOhneFilm(true);
        let Z;
        try {
            Z = await uhr("Z", schuss);
        } finally {
            window.__membranOhneFilm(false);
        }
        // DER MILCH-LESER (HS): die Öffnung als helles Weiß (dreifach über der Belichtung — die ACES-Schulter, das Bild vor D8)
        setze(() => TSL.vec4(TSL.vec3(3.0).mul(r._torZiele().uBelicht), 1.0));
        const R = await uhr("R", schuss);
        const Y = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
        // EINE Maske für alle drei Bilder: die Pixel, in denen die Welt eine Membran zeigt — mit Membran steht ein Kanal um
        // mindestens STUFE anders als ohne (swiftshader: Stufe 10 nimmt 7 876 der 8 014 magenta Pixel, 1 außerhalb; 6 griff
        // 71 Pixel neben die Membran, 16 ließ 353 Rand-Pixel fallen)
        const STUFE = 10;
        const maske = [];
        for (let i = 0; i < W * H * 4; i += 4)
            if (Math.max(Math.abs(A[i] - M[i]), Math.abs(A[i + 1] - M[i + 1]), Math.abs(A[i + 2] - M[i + 2])) >= STUFE)
                maske.push(i);
        // milchweiß = die Regel von K5 (`klassenMasse`: Y > 240 oder unbunt-hell, C*ab < 5 bei L* ≥ 50) gegen das Bild ohne Film
        const m8 = new Uint8Array(W * H);
        for (const i of maske) m8[i / 4] = 1;
        const mass = (u) => {
            let sY = 0,
                weiss = 0;
            for (const i of maske) {
                const y = Y(u, i);
                sY += y;
                if (y > 240) weiss++;
            }
            const n = maske.length;
            const k = n ? window.__klassenMasse(u, m8, W, H, null, Z) : null;
            return {
                Y: n ? sY / n : 0,
                weiss: n ? weiss / n : 0,
                milch: k ? k.weiss : 0,
                zielWeiss: k ? k.wtZiel / n : 0,
            };
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
            milch: mass(R),
            imBild,
            belichtung: rend.toneMappingExposure,
            zeit,
            kalt,
            ruhe,
            offenStart,
        };
    } finally {
        recs.forEach((rec, i) => {
            rec.mesh.material.colorNode = vor[i];
            rec.mesh.material.needsUpdate = true;
            rec.mesh.visible = sicht[i];
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
// Das Soll (K64-n1, D8): die Öffnung zeigt das Ziel durch den Film — sie brennt nicht aus (Y > 240 ≤ 5 % der Membran-Pixel,
// Nordstern Portale) und liest nicht als Milch (unbunt und hell ≤ 5 %, die Regel von K5 milchweiss gegen das Bild ohne Film). Bis D8 maß H die Welt gegen
// das Labor-Bild des Anzeige-Werts der Shell (Labor = Welt, Y ≤ 1,15 ×): die Membran malt keinen Anzeige-Wert mehr, sie liest das
// lineare Panorama der Ziel-Welt durch die Belichtung der Heimat.
const HELL = { weiss: 0.05, milch: 0.05 };

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
        // H und sein Selbsttest HS in DERSELBEN Seite (eine Maske), VOR den Blicken B (K64-n3); die Seite des
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
            `${b.im.membran} von ${b.membranen} Membranen`
        );
        check(
            "B2 70 m vor dem Ring, Blick vom Ring weg: keine Membran zeichnet",
            b.weg.membran === 0,
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
            ["A", "M", "Z", "R"]
                .map(
                    (k) =>
                        `${k} ${h.zeit[k]} ms/${h.kalt[k] == null ? "?" : h.kalt[k]} kalt` +
                        (h.ruhe[k] ? `/${h.ruhe[k].n} F ${h.ruhe[k].ms} ms/${h.ruhe[k].offen} offen` : "")
                )
                .join(" · ") + `; offen beim Start ${h.offenStart == null ? "?" : h.offenStart}`;
        // `w`: das Bild unter dem Urteil (welt = das Spiel, milch = der Milch-Leser) in DERSELBEN Maske
        const hellZeile = (h, w) =>
            `${h.n} Membran-Pixel (${(h.anteil * 100).toFixed(1)} %), ${w === h.welt ? "Welt" : "Milch"}: Y ${w.Y.toFixed(1)}, ` +
            `Y > 240 ${(w.weiss * 100).toFixed(1)} %, milchweiß ${(w.milch * 100).toFixed(1)} % (das Ziel selbst weiß ${(w.zielWeiss * 100).toFixed(1)} %), ` +
            `Belichtung ${h.belichtung.toFixed(3)} — ` +
            `${h.imBild.join(" · ")} [${kaltZeile(h)}]`;
        const hellRot = (h, w) => !(h.n > 200 && w.weiss <= HELL.weiss && w.milch <= HELL.milch);
        check(
            `H aus der Ring-Mitte: die Öffnung brennt nicht aus (Y > 240 ≤ ${HELL.weiss * 100} %) und liest nicht als Milch (≤ ${HELL.milch * 100} %)`,
            !hellRot(b.hell, b.hell.welt),
            hellZeile(b.hell, b.hell.welt)
        );
        check(
            "HS Selbsttest: der Milch-Leser (helles Weiß, das Bild vor D8) wird in H rot beim Namen",
            hellRot(b.hell, b.hell.milch),
            hellZeile(b.hell, b.hell.milch)
        );
        // HM (K64-n3, die CI-Frist): die Maske übersetzt kein Programm — ein kaltes Programm kostete auf swiftshader in der CI
        // 195 s (die magenta Maske bis K64-n3); HMS: derselbe Zähler sieht das kalte Programm des Milch-Lesers (nicht vakuös)
        check(
            "HM die Maske zeichnet ohne kaltes Programm",
            b.hell.kalt.M === 0,
            `M: ${b.hell.kalt.M == null ? "Zähler fehlt (r184 _pipelines.programs)" : `${b.hell.kalt.M} kalte Programme`} [${kaltZeile(b.hell)}]`
        );
        check(
            "HMS Selbsttest: der Zähler sieht das kalte Programm des Milch-Lesers",
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

        // ── Z: das Ziel des Tors (D8) — der erste Frager setzt den Auftrag in Gang, das Fenster wartet auf seine Zeile ──
        const zw = r._torZielWelt(entry);
        r._torZielZeile(entry);
        const zr = r._torZielAtlas && zw ? r._torZielAtlas.welten.get(zw.world) : null;
        res.z = { welt: zw ? zw.world : null, zeile: zr ? await zr.kommt : null };
        if (zr) {
            const Z = r._torZielAtlas;
            const G = r.constructor.TOR_ZIEL;
            Object.assign(res.z, {
                quelle: zr.quelle,
                fehler: zr.fehler,
                stempel: zr.stempel,
                halb: !!(Z.tex && Z.tex.type === window.THREE.HalfFloatType),
                zeilen: Z.tex ? Z.tex.image.height / G.h : 0,
                n: Z.n,
                welten: Z.welten.size,
                breit: Z.tex ? Z.tex.image.width : 0,
            });
            const D = r._torZielDaten({ entry });
            let hell = 0;
            if (D)
                for (let i = 0; i < D.daten.length; i += 4)
                    hell = Math.max(hell, D.daten[i] + D.daten[i + 1] + D.daten[i + 2]);
            res.z.daten = !!D && D.daten.length === G.w * G.h * 4 && hell > 0;
        }
        // ── N (Absenz, D8): kein Nebel-Kasten, kein Nebel-Gesetz, kein Host-Panorama ──
        res.n = {
            gesetz: mu.fog === undefined && globalThis.__portaCore.NEBEL_GESETZ === undefined,
            methoden: ["_nebelMaterialFor", "_nebelGraph", "_torPanorama", "_torPanoMal"].filter(
                (m) => typeof r[m] === "function"
            ),
        };

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
                rec.mesh.material.userData.portalMembran
            );
            res.m.marker = res.m.echt || !!rec.mesh.material.isMeshBasicMaterial;
            // die Membran liest die Zeile IHRES Ziels (Stoff-Wert `ziel`), nichts hängt neben ihr in der Szene
            res.m.zielZeile = rec.mesh.material.userData.tor ? rec.mesh.material.userData.tor.ziel : null;
            res.n.keinKasten = rec.nebel === undefined;
            let fremd = 0;
            r.state.scene.traverse((o) => {
                if (o.userData && /nebel/.test(String(o.userData.inventar || ""))) fremd++;
            });
            res.n.keinNebelInSzene = fremd === 0;
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
    if (out.z) {
        const Z = out.z;
        check(
            `Z: das Ziel des Tors steht (${Z.welt} → Zeile ${Z.zeile}, Quelle ${Z.quelle || "—"})`,
            Number.isInteger(Z.zeile) && (Z.quelle === "welt" || Z.quelle === "platte"),
            Z.fehler || ""
        );
        check(
            "Z: der Export trägt den SHA-Stempel der Quellen seiner Welt",
            typeof Z.stempel === "string" && /^[0-9a-f]{64}\|p\d+$/.test(Z.stempel),
            String(Z.stempel)
        );
        check(
            `Z: der Atlas der Ziele ist rgba16float, 512 breit, 256 Zeilen je angefragter Welt (${Z.zeilen} Zeilen, ${Z.welten} Welten, ${Z.n} gesetzt)`,
            Z.halb === true && Z.breit === 512 && Z.zeilen === Z.welten && Z.n >= 1 && Z.n <= Z.zeilen
        );
        check("Z: die Zeile trägt Licht (das Panorama ist nicht leer)", Z.daten === true);
    } else check("Z: Ziel-Block erreicht", false);
    if (out.m)
        check(
            "Z: die Membran liest die Zeile ihres Ziels (Stoff-Wert ziel)",
            out.m.zielZeile === out.z.zeile,
            `${out.m.zielZeile} / ${out.z.zeile}`
        );
    if (out.n) {
        check("N: kein Nebel-Gesetz am Tor (mu.fog, NEBEL_GESETZ fielen)", out.n.gesetz === true);
        check(
            "N: keine Methode des Nebel-Kastens und des Host-Panoramas",
            out.n.methoden.length === 0,
            out.n.methoden.join(" · ")
        );
        check(
            "N: kein Nebel-Kasten an der Membran, keiner in der Szene",
            out.n.keinKasten === true && out.n.keinNebelInSzene === true
        );
    } else check("N: Absenz-Block erreicht", false);
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
