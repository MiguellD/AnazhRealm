// diag-koerper-tiefpass.cjs — DIE WAND fuer lebendiger-koerper §2½ WURZEL 1.
//
// Der Schoepfer-Befund (17.06.): das Reh ist eine horizontale Rakete, der Humanoid ein
// weicher Schlauch — OBWOHL _creatureSkeleton/_humanoidSkeleton die Anatomie schon korrekt
// in die VARIANZ zwischen den Stationen kodieren (tiefe Brust · Flanken-Tuck · hohe Kruppe;
// Schulter↔Taille↔Huefte). Die These: die Skin-Pipeline TIEFPASS-FILTERT diese Korrektheit
// weg — zwei Filter: (1) smin mit grossem k zieht die Scheiben zu ihrem Mittel, (2) 6× Taubin
// (λ=0.46) mittelt die Nachbar-Vertices und raeumt die Stations-RINGE weg. Das Mittel
// verschmierter Scheiben IST ein Ellipsoid.
//
// Diese Wand MISST das (eine ZAHL, kein Gefuehl): sie baut die ECHTE Skin-Geometrie (Reh =
// CREATURE_SOULS.wesen · Humanoid = _humanoidSkeleton) bei verschiedenen Taubin-Paessen + k-
// Deckeln und liest das ueberlebende RELIEF ab — Reh: die Ruecken-Profil-Welle (Kruppe/
// Widerrist), Humanoid: die Silhouetten-Taille (Schulter↔Taille↔Huefte). Die Pipeline-Defaults
// sind unveraendert (6× / k=0.12) → der erste Block beweist KEINE Regression.
//
//   node scripts/diag-koerper-tiefpass.cjs
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message));
    let failed = false;
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 12000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.materials) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const out = await page.evaluate(() => {
            const r = window.anazhRealm,
                C = r.constructor;
            const o = { ok: true, deer: {}, human: {} };

            // ── die Profil-Metrik: binne die Vertices entlang einer ACHSE, lies pro Bin den
            //    Extremwert einer anderen Achse. Reh: binne entlang der LANGEN Horizontalen,
            //    lies die TOPLINE (max Y) = das Ruecken-Profil. Humanoid: binne entlang Y,
            //    lies die HALB-BREITE (max |X|) = die Silhouette. Leere Rand-Bins faerben ab.
            const profile = (pos, binAxis, readAxis, NB, mode) => {
                const n = pos.length / 3;
                let lo = 1e9,
                    hi = -1e9;
                for (let i = 0; i < n; i++) {
                    const v = pos[i * 3 + binAxis];
                    if (v < lo) lo = v;
                    if (v > hi) hi = v;
                }
                const span = Math.max(1e-6, hi - lo);
                const arr = new Array(NB).fill(mode === "min" ? 1e9 : -1e9);
                const cnt = new Array(NB).fill(0);
                for (let i = 0; i < n; i++) {
                    let b = Math.floor(((pos[i * 3 + binAxis] - lo) / span) * NB);
                    if (b >= NB) b = NB - 1;
                    if (b < 0) b = 0;
                    let v = pos[i * 3 + readAxis];
                    if (mode === "absmax") v = Math.abs(v);
                    cnt[b]++;
                    if (mode === "min") {
                        if (v < arr[b]) arr[b] = v;
                    } else if (v > arr[b]) arr[b] = v;
                }
                // nur Bins mit Vertices behalten (die anatomisch belegte Spanne)
                const prof = [];
                for (let b = 0; b < NB; b++) if (cnt[b] > 0) prof.push(arr[b]);
                return prof;
            };
            // die RELIEF-Zahl: Spitze-zu-Tal des Profils (wie stark die Welle ueberlebt).
            const relief = (prof) => {
                if (!prof.length) return 0;
                let mn = 1e9,
                    mx = -1e9;
                for (const v of prof) {
                    if (v < mn) mn = v;
                    if (v > mx) mx = v;
                }
                return mx - mn;
            };
            // detrendete Standardabweichung (entfernt die lineare Neigung → reines Relief).
            const detrendStd = (prof) => {
                const m = prof.length;
                if (m < 3) return 0;
                // lineare Regression (Index → Wert), Residuen-StdDev
                let sx = 0,
                    sy = 0,
                    sxx = 0,
                    sxy = 0;
                for (let i = 0; i < m; i++) {
                    sx += i;
                    sy += prof[i];
                    sxx += i * i;
                    sxy += i * prof[i];
                }
                const denom = m * sxx - sx * sx || 1;
                const slope = (m * sxy - sx * sy) / denom;
                const intc = (sy - slope * sx) / m;
                let ss = 0;
                for (let i = 0; i < m; i++) {
                    const res = prof[i] - (slope * i + intc);
                    ss += res * res;
                }
                return Math.sqrt(ss / m);
            };

            const NB = 24;

            // ════ REH (CREATURE_SOULS.wesen, archetype deer) ════
            const deerParts = C.CREATURE_SOULS.wesen.bodyParts;
            // die Welt-Achsen-Extente bestimmen die LANGE Horizontale (= Koerper-Laenge).
            const measureDeer = (opts) => {
                const geom = r._buildCreatureSkinGeometry(deerParts, opts);
                if (!geom || !geom.attributes || !geom.attributes.position) return null;
                const pos = geom.attributes.position.array;
                const ext = [0, 0, 0].map((_, a) => {
                    let lo = 1e9,
                        hi = -1e9;
                    for (let i = 0; i < pos.length / 3; i++) {
                        const v = pos[i * 3 + a];
                        if (v < lo) lo = v;
                        if (v > hi) hi = v;
                    }
                    return hi - lo;
                });
                // lange Horizontale: X(0) vs Z(2), die groessere
                const lenAxis = ext[0] >= ext[2] ? 0 : 2;
                const topline = profile(pos, lenAxis, 1, NB, "max"); // max Y = Ruecken
                const belly = profile(pos, lenAxis, 1, NB, "min"); // min Y = Bauch/Bein-Ansatz
                const vCount = pos.length / 3;
                return {
                    vCount,
                    lenAxis,
                    ext: ext.map((e) => +e.toFixed(3)),
                    toplineRelief: +relief(topline).toFixed(4),
                    toplineStd: +detrendStd(topline).toFixed(4),
                    bellyRelief: +relief(belly).toFixed(4),
                    topline: topline.map((v) => +v.toFixed(3)),
                };
            };
            // Default-Bau (6× / k=0.12) = das LIVE-Verhalten (Regressions-Anker).
            o.deer.live = measureDeer({});
            o.deer.p0 = measureDeer({ taubinPasses: 0 }); // roh (Surface-Nets, vor Taubin)
            o.deer.p1 = measureDeer({ taubinPasses: 1 });
            o.deer.p2 = measureDeer({ taubinPasses: 2 });
            o.deer.p3 = measureDeer({ taubinPasses: 3 });
            o.deer.p6 = measureDeer({ taubinPasses: 6 }); // == live (Beweis: Default-Parametrierung)
            // k-Deckel-Sweep (bei 2 Paessen — der erste Filter isoliert)
            o.deer.p2_k08 = measureDeer({ taubinPasses: 2, kMax: 0.08 });
            o.deer.p2_k06 = measureDeer({ taubinPasses: 2, kMax: 0.06 });

            // ── WURZEL 2 (der Hebel) am SKELETT bestaetigt: tragen die vier Beine heute
            //    IDENTISCHEN Querschnitt? _creatureSkeleton baut alle aus EINEM legR
            //    (segBetween r=legR*1.15/0.84), die Hinterhand bekommt KEINE Muskel-Masse.
            //    Lies die Bein-limb-Radien der Vorder- (z>0) vs Hinter-Paare (z<0) direkt. ──
            const legParts = deerParts.filter(
                (p) => p.shape === "limb" && Math.abs(p.position.x) > 0.03 && p.position.y < -0.05
            );
            const radList = (sgn) => legParts.filter((p) => Math.sign(p.position.z) === sgn).map((p) => p.size.x);
            const frontRs = radList(1),
                rearRs = radList(-1);
            const mx = (a) => (a.length ? Math.max(...a) : 0);
            o.deer.legSegN = legParts.length;
            o.deer.legFrontR = +mx(frontRs).toFixed(5);
            o.deer.legRearR = +mx(rearRs).toFixed(5);
            o.deer.legSymmetric = Math.abs(mx(frontRs) - mx(rearRs)) < 1e-6;

            // ════ HUMANOID (_humanoidSkeleton, Default-Genom) ════
            const humanParts = C._humanoidSkeleton({});
            const measureHuman = (opts) => {
                const geom = r._buildCreatureSkinGeometry(humanParts, Object.assign({ res: 80 }, opts));
                if (!geom || !geom.attributes || !geom.attributes.position) return null;
                const pos = geom.attributes.position.array;
                // binne entlang Y(Hoehe), lies die HALB-BREITE (max |X|) = Schulter↔Taille↔Huefte
                const widthProf = profile(pos, 1, 0, NB, "absmax");
                const vCount = pos.length / 3;
                return {
                    vCount,
                    widthRelief: +relief(widthProf).toFixed(4),
                    widthStd: +detrendStd(widthProf).toFixed(4),
                    width: widthProf.map((v) => +v.toFixed(3)),
                };
            };
            o.human.live = measureHuman({});
            o.human.p0 = measureHuman({ taubinPasses: 0 });
            o.human.p1 = measureHuman({ taubinPasses: 1 });
            o.human.p2 = measureHuman({ taubinPasses: 2 });
            o.human.p3 = measureHuman({ taubinPasses: 3 });
            o.human.p6 = measureHuman({ taubinPasses: 6 });

            return o;
        });

        // ── Auswertung ──
        const checks = [];
        const ck = (name, val, cond) => {
            checks.push({ name, val, ok: !!cond });
            if (!cond) failed = true;
        };

        const d = out.deer,
            h = out.human;
        const pct = (a, b) => (b > 1e-9 ? ((a / b) * 100).toFixed(0) + "%" : "—");

        console.log("\n══ REH (wesen) — Ruecken-Profil-RELIEF (Top-Linie, max Y pro Laengs-Bin) ══");
        console.log(`  roh (0× Taubin)   relief=${d.p0.toplineRelief}  std=${d.p0.toplineStd}  v=${d.p0.vCount}`);
        console.log(`  1× Taubin         relief=${d.p1.toplineRelief}  std=${d.p1.toplineStd}`);
        console.log(`  2× Taubin         relief=${d.p2.toplineRelief}  std=${d.p2.toplineStd}`);
        console.log(`  3× Taubin         relief=${d.p3.toplineRelief}  std=${d.p3.toplineStd}`);
        console.log(`  6× Taubin (LIVE)  relief=${d.p6.toplineRelief}  std=${d.p6.toplineStd}  v=${d.p6.vCount}`);
        console.log(`  → ueberlebendes Relief 6× vs roh: ${pct(d.p6.toplineRelief, d.p0.toplineRelief)}`);
        console.log(`  → ueberlebendes Std    6× vs roh: ${pct(d.p6.toplineStd, d.p0.toplineStd)}`);
        console.log(
            `  k-Deckel @2×: k0.12→std ${d.p2.toplineStd} · k0.08→${d.p2_k08.toplineStd} · k0.06→${d.p2_k06.toplineStd}`
        );
        console.log(`  topline roh : [${d.p0.topline.join(", ")}]`);
        console.log(`  topline LIVE: [${d.p6.topline.join(", ")}]`);

        console.log("\n══ HUMANOID — Silhouetten-Breite (max |X| pro Hoehen-Bin: Schulter↔Taille↔Huefte) ══");
        console.log(`  roh (0× Taubin)   relief=${h.p0.widthRelief}  std=${h.p0.widthStd}  v=${h.p0.vCount}`);
        console.log(`  1× Taubin         relief=${h.p1.widthRelief}  std=${h.p1.widthStd}`);
        console.log(`  2× Taubin         relief=${h.p2.widthRelief}  std=${h.p2.widthStd}`);
        console.log(`  3× Taubin         relief=${h.p3.widthRelief}  std=${h.p3.widthStd}`);
        console.log(`  6× Taubin (LIVE)  relief=${h.p6.widthRelief}  std=${h.p6.widthStd}  v=${h.p6.vCount}`);
        console.log(`  → ueberlebende Taille 6× vs roh: ${pct(h.p6.widthStd, h.p0.widthStd)}`);
        console.log(`  width roh : [${h.p0.width.join(", ")}]`);
        console.log(`  width LIVE: [${h.p6.width.join(", ")}]`);

        console.log(`\n══ WURZEL 2 (Skelett): Vorder- vs Hinterbein-Querschnitt ══`);
        console.log(
            `  ${d.legSegN} Bein-Segmente · frontR=${d.legFrontR} · rearR=${d.legRearR} · symmetrisch=${d.legSymmetric}`
        );

        console.log("\n── INVARIANTEN ──");
        // 1. Regressions-Anker: das opt-parametrisierte 6× ist BIT-gleich dem Default-Bau.
        ck(
            "REGRESSION: p6 == live (Default-Parametrierung aendert nichts)",
            `deer ${d.p6.toplineRelief}==${d.live.toplineRelief} · human ${h.p6.widthRelief}==${h.live.widthRelief}`,
            d.p6.toplineRelief === d.live.toplineRelief &&
                d.p6.vCount === d.live.vCount &&
                h.p6.widthRelief === h.live.widthRelief &&
                h.p6.vCount === h.live.vCount
        );
        // 2. die Pipeline baut bei jeder Parametrierung eine gueltige Geometrie.
        ck(
            "BAUT: jede Variante ergibt Vertices > 0",
            `deer ${d.p0.vCount}/${d.p6.vCount} · human ${h.p0.vCount}/${h.p6.vCount}`,
            d.p0.vCount > 0 && d.p6.vCount > 0 && h.p0.vCount > 0 && h.p6.vCount > 0
        );
        // 3. BEFUND (die gemessene WAHRHEIT, §2½ „MESSEN ZUERST"): Taubin + smin-k BEWAHREN das
        //    Makro-Relief (Ruecken-Welle · Silhouetten-Taille). 6× behaelt ≥90% des roh-Reliefs,
        //    der k-Deckel (0.12→0.06) aendert es <10% → die „Tiefpass filtert die Korrektheit weg"-
        //    These ist REFUTIERT. Diese Invariante ist die WAND gegen das blinde Halbieren von
        //    Taubin/k (das den Blob NICHT heilt + die duennen Beine erodieren wuerde).
        const deerKeep = d.p6.toplineStd / Math.max(1e-9, d.p0.toplineStd);
        const humanKeep = h.p6.widthStd / Math.max(1e-9, h.p0.widthStd);
        const kSwing = Math.abs(d.p2.toplineStd - d.p2_k06.toplineStd) / Math.max(1e-9, d.p2.toplineStd);
        ck(
            `BEFUND: Taubin bewahrt das Makro-Relief (deer ${(deerKeep * 100).toFixed(0)}% · human ${(humanKeep * 100).toFixed(0)}% · k-Swing ${(kSwing * 100).toFixed(0)}%) — WURZEL 1 refutiert`,
            `deerKeep=${(deerKeep * 100).toFixed(0)}% humanKeep=${(humanKeep * 100).toFixed(0)}% kSwing=${(kSwing * 100).toFixed(0)}%`,
            deerKeep >= 0.9 && humanKeep >= 0.9 && kSwing < 0.1
        );
        // 4. HEBEL (WURZEL 2, am Skelett bestaetigt): die vier Beine teilen HEUTE legR (front==rear),
        //    die Hinterhand traegt keine Muskel-Masse — die fehlende Front-Strebe/Heck-Motor-Asymmetrie
        //    ist der echte Hebel. DIESE Invariante FLIPPT, wenn WURZEL 2 landet (dann rearR > frontR,
        //    „der Test wandert mit dem Code"). Heute bestaetigt sie die Diagnose.
        ck(
            `HEBEL WURZEL 2: die Beine sind heute symmetrisch (legR geteilt) — die Heck-Motor-Masse fehlt`,
            `frontR=${d.legFrontR} rearR=${d.legRearR}`,
            d.legSegN >= 8 && d.legSymmetric === true
        );

        console.log("\n── ERGEBNIS ──");
        for (const c of checks) console.log(`  ${c.ok ? "OK " : "XX "}${c.name}  [${c.val}]`);
        console.log(failed ? "\nXX  Es gibt offene Punkte.\n" : "\nOK  Alle Invarianten OK.\n");
    } catch (e) {
        console.error("DIAG-FEHLER:", e && e.stack ? e.stack : e);
        failed = true;
    } finally {
        await browser.close();
        server.kill();
    }
    process.exit(failed ? 1 : 0);
})();
