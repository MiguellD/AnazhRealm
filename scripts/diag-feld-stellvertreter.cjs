// diag-feld-stellvertreter.cjs — DIE STELLVERTRETER-WAND (npm run gate:feld-stellvertreter).
//
// Befund 06.10. (Welle G, OMEN: GTX 1060, 1080p, Mess-Wiese, gpu-bank AUS/AN): der Feld-Pass kostete 2,40 ms je Frame für
// EINEN Vollbild-Draw, der 1,3 % des Bildes änderte. Er schrieb seine Tiefe im Fragment (depthNode) und verwarf per
// Discard — ohne frühen Tiefentest lief sein Fragment für jedes der 2,07 Mio. Pixel, auch hinter naher Geometrie, und
// jedes Pixel ging durch die Seiten-Schleife (an der Mess-Wiese spannte EINE Seite über die Kamera: alle Pixel in 32
// Einträgen). Die Heilung sitzt im Pass (`_feldPassEnsure`): zwei Draws mit EINER Aufgabe je Draw —
//   MARCH:    je Analog-Satz (bzw. Gesetz-Platz) ein Stellvertreter, Rückseiten seiner Hülle, EIN instanzierter Draw mit
//             Fragment-Tiefe; jedes Fragment marcht den EINEN Satz seines Stellvertreters.
//   PANORAMA: Vollbild-Dreieck auf fester Tiefe OHNE Fragment-Tiefe, ohne Schleife — der frühe Tiefentest verwirft Szene und
//             Sätze, nur Himmels-Pixel schattieren.
// Gemessen (echte GPU Radeon 890M, Werkbank, Mess-Wiese, Blick des Spielers): Fragmente des Marchs 2 073 600 → 505–663,
// des Panoramas 15 987–16 191 (Himmel). Das Bild aus dem Ausgabe-Pfad, alter gegen neuen Stand in derselben Welt
// (Uhr, TRAA und Dither je Schuss fest), 28 Bildpaare + 6 Paare eines fernen Tiers (Glieder-Kapseln, 1 125 m vom Spieler):
// im Fußabdruck des Feld-Passes 1 von 6 558 Pixeln mit 1 Stufe; die Kapseln aus 6,5 m und 6 m pixelgleich (4 063 und
// 4 721 Fußabdruck-Pixel), aus 93 m (4°) 1 bzw. 4 von ~8 960 an Glied-Kanten (≤ 40 Stufen); außerhalb der Fußabdrücke
// höchstens 279 Pixel mit ≤ 9 Stufen (Laub am Bildrand, nicht im Feld-Pass).
//
// Diese Linse (Null-Renderer, GPU-frei) fährt die ECHTEN Organ-Methoden:
//   O1  die Obergrenze (Stellvertreter-Zahl / Plätze je Block) folgt dem höchsten belegten Slot — auch nach Freigaben
//   O2  ein freigegebener Slot kehrt zurück und hebt die Obergrenze wieder; kein Slot doppelt
//   T1  der Pass-Takt setzt die Instanzen = Obergrenze × Plätze je Block und zieht Strahl und Raster aus EINER Matrix
//   K1  der March-Draw: instanzierte Kiste, Rückseiten, Vertex-Knoten aus dem Stellvertreter, Fragment-Tiefe, vor dem Panorama
//   K2  DAS STATISCHE BUDGET je Fragment (WGSL der Draws, `fp.wgsl`): Panorama 0 Schleifen · ≤ 1 Abtastung · keine Fragment-
//       Tiefe; March ≤ 4 Schleifen (je Zweig Schritte × Primitive), keine Seiten-/Eintrags-/Platz-Schleife, EIN Satz je Fragment
//   S1  Selbsttest: ein Panorama mit Fragment-Tiefe bricht K2; S2: eine Obergrenze ohne Nachzug bricht O1
//
//   node scripts/diag-feld-stellvertreter.cjs        (Port: STELLV_PORT, Standard 4575)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.STELLV_PORT || 4575);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
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

// Die Probe (Seiten-Kontext): `modus` "echt" (das Organ) · "panoTiefe" (S1: das Panorama trägt Fragment-Tiefe) ·
// "ohneNachzug" (S2: die Obergrenze bleibt nach Freigaben stehen).
function probe(modus) {
    const r = window.anazhRealm;
    const T = window.THREE;
    const W = r.constructor.WELT_MARCH;
    if (r.state.feldPass) r._feldPassDispose();
    r.state.weltMarch = null;
    const wm = r._weltMarchEnsure();
    if (modus === "ohneNachzug") {
        // S2: die Freigabe ohne Nachzug (die Obergrenze bleibt der Hochwasser-Stand)
        const P = Object.getPrototypeOf(r);
        const echt = P._weltFeldFrei;
        r._weltFeldFrei = function (h) {
            const o = wm.obergrenze;
            echt.call(this, h);
            wm.obergrenze = o;
        };
    }
    let s = 12345;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const box = () => [{ box: true, c: new T.Vector3(1, 2, 1), h: new T.Vector3(1, 2, 1) }];
    const M = new T.Matrix4();
    const handles = [];
    for (let i = 0; i < 300; i++) {
        M.makeTranslation((rnd() - 0.5) * 600, rnd() * 20, (rnd() - 0.5) * 600);
        handles.push(r._weltKapselSpawn("stellv-probe:kiste", M, box));
    }
    for (let i = 0; i < handles.length; i += 7) r._weltFeldFrei(handles[i]); // Lücken wie im Spiel
    for (let i = 250; i < handles.length; i++) if (i % 7 !== 0) r._weltFeldFrei(handles[i]); // die obersten fallen
    let hoechster = -1;
    for (let f = 0; f < W.felder; f++) if (wm.handles[f]) hoechster = f;
    const grenzeNachFrei = wm.obergrenze;
    // O2: ein neuer Eintrag nimmt einen freien Slot, die Obergrenze trägt ihn
    M.makeTranslation(5, 0, 5);
    const neu = r._weltKapselSpawn("stellv-probe:kiste", M, box);
    const belegt = new Set();
    let doppelt = 0;
    for (let f = 0; f < W.felder; f++) {
        const h = wm.handles[f];
        if (!h) continue;
        if (belegt.has(h)) doppelt++;
        belegt.add(h);
        if (h.feld !== f) doppelt++;
    }
    if (modus === "ohneNachzug") delete r._weltFeldFrei;
    // Der Pass unter dem Linsen-Seam (der Null-Renderer zeichnet nie; die Knoten entstehen GPU-frei)
    const hookAlt = window.__anazhFernRing;
    window.__anazhFernRing = true;
    let fp = null;
    try {
        fp = r._feldPassEnsure(r.state.fernRing || { anchorX: null, anchorZ: null });
    } finally {
        if (hookAlt === undefined) delete window.__anazhFernRing;
        else window.__anazhFernRing = hookAlt;
    }
    if (!fp) return { fehler: "kein Feld-Pass" };
    if (modus === "panoTiefe") fp.mat.depthNode = window.THREE.TSL.float(0.999999); // S1
    // T1: der Takt (Anker gleich → kein Anstrich; sichtbar → Kamera-Uniforms + Instanzen)
    fp.mesh.visible = true;
    fp.march.visible = true;
    const cam = r.state.camera;
    cam.position.set(12, 30, -40);
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld(true);
    r._tickFeldPass({ anchorX: fp.anchorX, anchorZ: fp.anchorZ });
    const vp = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    const ident = new T.Matrix4().multiplyMatrices(fp.U.vp.value, fp.U.invVP.value);
    let abwVp = 0,
        abwIdent = 0;
    for (let i = 0; i < 16; i++) {
        abwVp = Math.max(abwVp, Math.abs(fp.U.vp.value.elements[i] - vp.elements[i]));
        abwIdent = Math.max(abwIdent, Math.abs(ident.elements[i] - (i % 5 === 0 ? 1 : 0)));
    }
    // K2: der WGSL-Text der Draws (die Funktion samt Includes, `fp.wgsl`) — das statische Budget je Fragment
    const wgsl = (fn) => {
        const texte = [];
        const lauf = (n) => {
            if (!n || typeof n.code !== "string" || texte.includes(n.code)) return;
            texte.push(n.code);
            for (const inc of n.includes || []) lauf(inc);
        };
        lauf(fn && fn.functionNode);
        return texte;
    };
    const zaehl = (texte) => {
        const code = texte.join("\n");
        const c = (re) => (code.match(re) || []).length;
        return {
            schleifen: c(/\bfor\s*\(/g) + c(/\bloop\s*\{/g) + c(/\bwhile\s*\(/g),
            abtastungen: c(/textureLoad\(/g) + c(/textureSample[A-Za-z]*\(/g),
            seitenSchleife: /for \(var (pi|q|pk): i32/.test(code),
            einSatz: /let j = i32\(i \/ \d+u\);/.test(code),
            funktionen: texte.length,
        };
    };
    const panoTexte = wgsl(fp.wgsl.panorama);
    const marchTexte = wgsl(fp.wgsl.march);
    const vertexTexte = wgsl(fp.wgsl.stellvertreter);
    return {
        hoechster,
        grenzeNachFrei,
        neuFeld: neu ? neu.feld : -1,
        grenzeNeu: wm.obergrenze,
        doppelt,
        instanzen: fp.march.geometry.instanceCount,
        plaetze: W.gesetzBlock,
        abwVp,
        abwIdent,
        march: {
            instanziert: fp.march.geometry.isInstancedBufferGeometry === true,
            rueckseite: fp.matMarch.side === T.BackSide,
            tiefe: fp.matMarch.depthNode != null,
            vertex:
                vertexTexte.some((t) => /fn feldStellvertreter\(i: u32/.test(t)) &&
                !!fp.matMarch.vertexNode &&
                fp.matMarch.vertexNode.functionNode === fp.wgsl.stellvertreter.functionNode,
            reihe: fp.march.renderOrder < fp.mesh.renderOrder,
            inventar: fp.march.userData.inventar === "feld-pass" && fp.mesh.userData.inventar === "feld-pass",
        },
        pano: { tiefe: fp.mat.depthNode != null, z: fp.mat.vertexNode != null },
        budgetPano: zaehl(panoTexte),
        budgetMarch: zaehl(marchTexte),
    };
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.message || String(e)).split("\n")[0]));
    let ok = true;
    const check = (name, cond, detail) => {
        console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!cond) ok = false;
    };
    // Die Urteile EINMAL (das Organ und die Selbsttests lesen dieselben Regeln).
    const urteilO1 = (a) => a.grenzeNachFrei === a.hoechster + 1;
    const urteilK2 = (a) =>
        !a.pano.tiefe &&
        a.budgetPano.schleifen === 0 &&
        a.budgetPano.abtastungen <= 1 &&
        a.budgetMarch.schleifen <= 4 &&
        !a.budgetMarch.seitenSchleife &&
        a.budgetMarch.einSatz;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(
            () => window.anazhRealm && typeof window.anazhRealm._feldPassEnsure === "function" && window.THREE,
            { timeout: 120000 }
        );
        const a = await page.evaluate(probe, "echt");
        if (a.fehler) throw new Error(a.fehler);
        console.log("=== Stellvertreter-Wand: 300 Sätze, Lücken, die obersten fallen ===");
        check(
            "O1 die Obergrenze folgt dem höchsten belegten Slot",
            urteilO1(a),
            `Obergrenze ${a.grenzeNachFrei}, höchster Slot ${a.hoechster}`
        );
        check(
            "O2 ein freier Slot kehrt zurück, die Obergrenze trägt ihn, kein Slot doppelt",
            a.neuFeld >= 0 && a.grenzeNeu >= a.neuFeld + 1 && a.doppelt === 0,
            `Slot ${a.neuFeld}, Obergrenze ${a.grenzeNeu}`
        );
        check(
            "T1 der Takt: Instanzen = Obergrenze × Plätze, Raster und Strahl aus EINER Matrix",
            a.instanzen === a.grenzeNeu * a.plaetze && a.abwVp < 1e-9 && a.abwIdent < 1e-4,
            `${a.instanzen} Instanzen (${a.grenzeNeu} × ${a.plaetze}), |vp − Kamera| ${a.abwVp.toExponential(1)}, |vp·invVP − I| ${a.abwIdent.toExponential(1)}`
        );
        const m = a.march;
        check(
            "K1 der March-Draw: instanziert, Rückseiten, Stellvertreter-Vertex, Fragment-Tiefe, vor dem Panorama",
            m.instanziert && m.rueckseite && m.vertex && m.tiefe && m.reihe && m.inventar,
            JSON.stringify(m)
        );
        check(
            "K2 das Budget je Fragment: Panorama ohne Schleife und Fragment-Tiefe, March EIN Satz ohne Seiten-Schleife",
            urteilK2(a),
            `Panorama ${a.budgetPano.schleifen} Schleifen · ${a.budgetPano.abtastungen} Abtastung · Tiefe ${a.pano.tiefe}; ` +
                `March ${a.budgetMarch.schleifen} Schleifen · ${a.budgetMarch.abtastungen} Abtastungen · ein Satz ${a.budgetMarch.einSatz}`
        );
        const s1 = await page.evaluate(probe, "panoTiefe");
        const s2 = await page.evaluate(probe, "ohneNachzug");
        console.log("=== Selbsttest ===");
        check("S1 ein Panorama mit Fragment-Tiefe bricht K2", !urteilK2(s1));
        check(
            "S2 eine Obergrenze ohne Nachzug bricht O1",
            !urteilO1(s2),
            `Obergrenze ${s2.grenzeNachFrei}, höchster Slot ${s2.hoechster}`
        );
        check("keine Page-Errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    } catch (e) {
        check("Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    server.close();
    console.log(ok ? "GRÜN feld-stellvertreter" : "ROT feld-stellvertreter");
    process.exit(ok ? 0 : 1);
})();
