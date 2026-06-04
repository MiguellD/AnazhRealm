// Diagnose: woher die Zwei-Ton-Rauten im Stein-Biom kommen.
// Schöpfer-Screenshot (reines Stein-Biom, kein Schnee): harte diamant-förmige
// Helligkeits-Flächen (zwei Grau-Töne), die unter Licht driften (tags stark,
// abends verschmelzend). Albedo ist ~uniform stone [0.42,0.44,0.49]. Frage: ist
// das die NORMALEN-Facettierung (Surface-Nets-Quads) auf der directional Sonne?
//
// Diese Messung baut einen echten Stein-Chunk + misst:
//   (a) sind die Vertex-(Shading-)Normalen glatt oder faceted (Nachbar-Sprünge)?
//   (b) die FLAT-Face-Normalen (geometrische Facette) vs die Vertex-Normalen.
//   (c) das dot(N, sunDir)-Histogramm — bimodal (= zwei Helligkeits-Flächen) oder
//       glatt? Plus: senkt ein Flatten-zur-Up-Normale (der 2.5D-Look) die Varianz?
//
// Lauf: `node scripts/diag-facets.cjs`. Kein CI-Gate.

const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const SERVER_URL = "http://127.0.0.1:4312/index.html";
const WORLD_READY_TIMEOUT_MS = 60000;

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["save-server.js"], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const t = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(t);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
    });
    try {
        const page = await browser.newPage();
        page.on("pageerror", (e) => console.error("PAGE-ERROR:", String(e)));
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        const t0 = Date.now();
        let ready = false;
        while (Date.now() - t0 < WORLD_READY_TIMEOUT_MS) {
            const r = await page
                .evaluate(
                    () =>
                        !!(
                            window.anazhRealm &&
                            window.anazhRealm.state.hydrosphere &&
                            window.anazhRealm.state.hydrosphere.ready
                        )
                )
                .catch(() => false);
            if (r) {
                ready = true;
                break;
            }
            await new Promise((r2) => setTimeout(r2, 500));
        }
        if (!ready) throw new Error("Welt nicht bereit");
        console.log(`Welt bereit nach ${Math.round((Date.now() - t0) / 1000)}s.\n`);

        const data = await page.evaluate(() => {
            const r = window.anazhRealm;
            // Einen Stein-Hang finden: über Wasser, mit Neigung, niedrige Felder.
            let spot = null;
            for (let tryI = 0; tryI < 4000 && !spot; tryI++) {
                const x = (Math.random() - 0.5) * 1200;
                const z = (Math.random() - 0.5) * 1200;
                const y = r._terrainMacroSurfaceY(x, z, true);
                const wY = r._waterLevelAt ? r._waterLevelAt(x, z) : -3;
                if (y < wY + 4) continue;
                const f = r.worldFieldAt(x, z);
                if (f.lebendig > 0.2 || f.glut > 0.2 || f.magieleitung > 0.4) continue;
                // Neigung: |∇surf|
                const dx = (r._terrainMacroSurfaceY(x + 4, z, true) - r._terrainMacroSurfaceY(x - 4, z, true)) / 8;
                const dz = (r._terrainMacroSurfaceY(x, z + 4, true) - r._terrainMacroSurfaceY(x, z - 4, true)) / 8;
                const slope = Math.hypot(dx, dz);
                if (slope < 0.25) continue; // einen echten Hang (wie im Screenshot)
                spot = { x, y, z, slope };
            }
            if (!spot) return { error: "kein Stein-Hang gefunden" };

            // Den Chunk bauen, der diesen Spot enthält — das bewährte Test-Chunk-
            // Muster (_spawnVoxelTestChunk): 24³ bei step 1.6, oy = surface − 20.
            const dim = 24;
            const step = 1.6;
            const ox = spot.x - (dim * step) / 2;
            const oz = spot.z - (dim * step) / 2;
            const oy = Math.round(r._terrainMacroSurfaceY(spot.x, spot.z, true)) - 20;
            const geom = r._voxelChunkGeometry(ox, oy, oz, dim, dim, dim, step);
            if (!geom) return { error: "Chunk-Geometrie leer", spot };

            const pos = geom.getAttribute("position");
            const nrm = geom.getAttribute("normal");
            const idx = geom.getIndex();
            const indexed = !!idx;
            const N = pos.count;

            // Sonnen-Richtung wie tagsüber (schräg).
            const L = (() => {
                const v = [0.4, 0.72, 0.56];
                const m = Math.hypot(v[0], v[1], v[2]);
                return [v[0] / m, v[1] / m, v[2] / m];
            })();

            // (a) Vertex-(Shading-)Normalen: dot(N,L) Histogramm + Up-Anteil.
            const hist = new Array(10).fill(0);
            let nlSum = 0,
                nlSq = 0;
            const up = [0, 1, 0];
            let upDotSum = 0;
            const nls = new Float64Array(N);
            for (let i = 0; i < N; i++) {
                const nx = nrm.getX(i),
                    ny = nrm.getY(i),
                    nz = nrm.getZ(i);
                let nl = nx * L[0] + ny * L[1] + nz * L[2];
                if (nl < 0) nl = 0;
                nls[i] = nl;
                nlSum += nl;
                nlSq += nl * nl;
                hist[Math.min(9, Math.floor(nl * 10))]++;
                upDotSum += ny; // N·up
            }
            const nlMean = nlSum / N;
            const nlStd = Math.sqrt(Math.max(0, nlSq / N - nlMean * nlMean));

            // (b) FLAT-Face-Normalen (geometrische Facette) — dot(faceN, L) Varianz,
            // + der Winkel zwischen Face-Normale und der gemittelten Vertex-Normale
            // (wie stark "lügt" die glatte Normale über die Geometrie?).
            const triCount = indexed ? idx.count / 3 : N / 3;
            let fnlSum = 0,
                fnlSq = 0,
                faceVsVertSum = 0,
                fc = 0;
            const gi = (t, k) => (indexed ? idx.getX(t * 3 + k) : t * 3 + k);
            for (let t = 0; t < triCount; t++) {
                const a = gi(t, 0),
                    b = gi(t, 1),
                    c = gi(t, 2);
                const ax = pos.getX(a),
                    ay = pos.getY(a),
                    az = pos.getZ(a);
                const bx = pos.getX(b),
                    by = pos.getY(b),
                    bz = pos.getZ(b);
                const cxx = pos.getX(c),
                    cyy = pos.getY(c),
                    czz = pos.getZ(c);
                const e1 = [bx - ax, by - ay, bz - az];
                const e2 = [cxx - ax, cyy - ay, czz - az];
                let fn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
                const fm = Math.hypot(fn[0], fn[1], fn[2]);
                if (fm < 1e-9) continue;
                fn = [fn[0] / fm, fn[1] / fm, fn[2] / fm];
                let fnl = fn[0] * L[0] + fn[1] * L[1] + fn[2] * L[2];
                if (fnl < 0) fnl = 0;
                fnlSum += fnl;
                fnlSq += fnl * fnl;
                // Vertex-Normale gemittelt
                const vnx = (nrm.getX(a) + nrm.getX(b) + nrm.getX(c)) / 3;
                const vny = (nrm.getY(a) + nrm.getY(b) + nrm.getY(c)) / 3;
                const vnz = (nrm.getZ(a) + nrm.getZ(b) + nrm.getZ(c)) / 3;
                const vm = Math.hypot(vnx, vny, vnz) || 1;
                const dotFV = (fn[0] * vnx + fn[1] * vny + fn[2] * vnz) / vm;
                faceVsVertSum += Math.acos(Math.max(-1, Math.min(1, dotFV))) * (180 / Math.PI);
                fc++;
            }
            const fnlMean = fnlSum / (fc || 1);
            const fnlStd = Math.sqrt(Math.max(0, fnlSq / (fc || 1) - fnlMean * fnlMean));
            const faceVsVert = faceVsVertSum / (fc || 1);

            // (c) Was, wenn wir die Shading-Normale zur Up-Achse flatten (2.5D-Look)?
            // dot(Nf, L) Varianz bei flatten=0.5 und 0.8.
            const tryFlatten = (amt) => {
                let s = 0,
                    sq = 0;
                for (let i = 0; i < N; i++) {
                    const nx = nrm.getX(i) * (1 - amt) + up[0] * amt;
                    const ny = nrm.getY(i) * (1 - amt) + up[1] * amt;
                    const nz = nrm.getZ(i) * (1 - amt) + up[2] * amt;
                    const m = Math.hypot(nx, ny, nz) || 1;
                    let nl = (nx * L[0] + ny * L[1] + nz * L[2]) / m;
                    if (nl < 0) nl = 0;
                    s += nl;
                    sq += nl * nl;
                }
                const mean = s / N;
                return Math.sqrt(Math.max(0, sq / N - mean * mean));
            };

            return {
                spot,
                indexed,
                N,
                triCount,
                nlMean,
                nlStd,
                upDotMean: upDotSum / N,
                hist,
                faceNlStd: fnlStd,
                faceVsVertAngle: faceVsVert,
                flattenStd05: tryFlatten(0.5),
                flattenStd08: tryFlatten(0.8),
            };
        });

        if (data.error) {
            console.log("FEHLER:", data.error, data.spot || "");
            return;
        }
        console.log("=== STEIN-FACETTEN-MESSUNG ===\n");
        console.log(
            `Spot: x=${data.spot.x.toFixed(0)} z=${data.spot.z.toFixed(0)} y=${data.spot.y.toFixed(1)} slope=${data.spot.slope.toFixed(2)}`
        );
        console.log(`Geometrie: ${data.N} Vertices, ${data.triCount} Dreiecke, indexed=${data.indexed}\n`);
        console.log(
            `VERTEX-(Shading-)Normalen  dot(N,L): mean=${data.nlMean.toFixed(3)} STD=${data.nlStd.toFixed(3)}  (N·up mean=${data.upDotMean.toFixed(3)})`
        );
        console.log(`  Histogramm dot(N,L) [0..1] in 10 Bins: ${data.hist.join(" ")}`);
        console.log(
            `FLAT-Face-Normalen         dot(fN,L): STD=${data.faceNlStd.toFixed(3)}   (Face-vs-Vertex-Winkel: ${data.faceVsVertAngle.toFixed(1)}°)`
        );
        console.log("");
        console.log(`FLATTEN zur Up-Achse (2.5D-Look) senkt die dot(N,L)-STD:`);
        console.log(
            `  flatten 0.0 (heute): ${data.nlStd.toFixed(3)}  →  0.5: ${data.flattenStd05.toFixed(3)}  →  0.8: ${data.flattenStd08.toFixed(3)}`
        );
        console.log("");
        console.log("Lesart: hohe Vertex-STD + bimodales Histogramm = die Normalen tragen den");
        console.log("Facetten-Kontrast (nicht nur die Geometrie). Ein Face-vs-Vertex-Winkel >>0");
        console.log("heißt die glatte Normale lügt stark über die faceted Geometrie → die Cel-");
        console.log("Bänder reiten auf der echten Geometrie-Silhouette. Flatten senkt die STD →");
        console.log("der 2.5D-'grosse-Region'-Look, den der Schöpfer vermisst.");
    } finally {
        await browser.close();
        server.kill();
    }
})();
