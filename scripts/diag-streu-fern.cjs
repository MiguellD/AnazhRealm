// diag-streu-fern.cjs — DIE FERNFORM DER KLEIN-STREU KOMMT AUS DEM BUDGET (npm run gate:streu-fern).
//
// Studio-Vertrag B2c: jede Art trägt `PORTAL_RENDER_CONFIG.lod.budget[kind].fern` ("gesetz" | "boden" | "karte") —
// was sie jenseits Welt-d1 ist. Der EINE Zellen-Chokepoint `_scatterMaterializeCell` liest sie VOR jedem Mesh-Zug:
// eine Nicht-Baum-Zelle mit Fern-Wunsch fragt nie ein geklemmtes L0 an. "gesetz" = Platz im Welt-March (oder
// `wartet`: slots [], keine Instanz-Bahn), "boden" = Datensatz ohne Geometrie (die Boden-Funktion trägt), "karte" =
// die Studio-Karte. Der stille Rückfall (Blume-L0 84 / Geröll-L0 18 Befehle an der Mess-Wiese, V18.526) stirbt.
//
// Boot mit Foundry-ON und Null-Renderer (die Form-Entscheidung fällt CPU-seitig; die Gesetz-Bahn ist headless zu —
// Lehre 16 —, Gesetz-Zellen stehen dort `wartet`). Die Echt-GPU-Zahl kommt aus `werkbank zaehlen`.
//
//   A KONSUM   die fern-Zeilen liegen live auf dem Host (tree/shrub karte · flower/rock gesetz · grass boden); der
//              Flip `rock.fern = "boden"` baut eine Region neu und ihre Fels-Zellen tragen form "boden" — zurück auf
//              "gesetz" tragen sie "gesetz". Das Datum ändert die Welt, kein Zwilling fährt.
//   B ABSENZ   keine lebende Instanz einer Nicht-Baum-Streu-Gruppe `fscatter:<art>:<g>:<stufe>` steht jenseits
//              Welt-d1 + Hysterese; ein Treffer nennt Gruppe und Distanz.
//   C FORM     jede Nicht-Baum-Zelle mit Fern-Wunsch trägt ihre Budget-Form; "gesetz"/"boden" ohne Slots; keine
//              litter-Zelle (die Schicht fiel final).
//   D WAND     die Kapsel-Liste ist nicht erschöpft (`_weltKapselnVollWarn`) — erschöpft wird sie ROT, nie L0.
//   E TICK     die Wiederholung einer wartenden Zelle legt keine Instanz-Slots an (kein Duplikat-Zug je Durchlauf).
//   F PASSUNG  die Geröll-Fernform passt aus den UNVERSCHMOLZENEN Steinen der Studio-Gestalt: 6 Fuß-Steine statt
//              einer liegenden Haufen-Kapsel.
//   SELBSTTEST (sonst wäre das Grün vakuös): (1) eine injizierte `fscatter:geroell:3:0`-Instanz bei 200 m macht B rot
//   mit Namen; (2) eine erschöpfte Kapsel-Liste (Gesetz-Bahn offen, Spawn scheitert, Warn-Flagge) lässt die Zellen
//   `wartet` stehen — 0 L0-Instanzen — und D wird rot; (3) ohne `budget.flower.fern` bricht der Host-Leser
//   fail-closed (KERN-PFLICHT).
//
//   node scripts/diag-streu-fern.cjs        (Port: STREU_FERN_PORT)
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.STREU_FERN_PORT || 4586);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });

    const out = await page.evaluate(async () => {
        const res = { boot: false };
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl0 = performance.now() + 120000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._tickScatterLod !== "function") &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return res;
        res.boot = true;
        const AR = r.constructor;
        const f = r._ensureAssetFoundry();
        const dl1 = performance.now() + 90000;
        while (performance.now() < dl1) {
            if (f && f.ready && f.recipes && AR._studioRenderConfig && AR._studioRenderConfig.lod) break;
            await sleep(100);
        }
        const cfg = AR._studioRenderConfig;
        const B = cfg && cfg.lod && cfg.lod.budget;
        res.buch = !!B;
        if (!B) return res;
        // ── A1: die fern-Zeilen live auf dem Host ──
        res.fern = {};
        for (const k of ["tree", "shrub", "grass", "flower", "rock"]) res.fern[k] = B[k] ? B[k].fern : undefined;

        // Die Mess-Wiese (−900/−850, dieselbe Stelle wie werkbank zaehlen).
        const pm = r.state.playerMesh.position;
        pm.set(-900, r._voxelSurfaceY(-900, -850) + 1.8, -850);
        const map = r._ensureScatterRegionMap();
        const zellen = () => {
            let n = 0;
            for (const reg of map.values()) n += reg.cells ? reg.cells.length : 0;
            return n;
        };
        const bauRing = async (msMax) => {
            const dl = performance.now() + msMax;
            let ruhig = 0,
                letzt = -1;
            while (performance.now() < dl) {
                r._tickScatterStreaming(pm);
                const n = zellen();
                let offen = false;
                for (const reg of map.values()) if (reg._cont || reg._deferredFoundry) offen = true;
                if (n === letzt && !offen) ruhig++;
                else ruhig = 0;
                letzt = n;
                if (ruhig >= 20 && n > 0) break;
                await sleep(40);
            }
        };
        await bauRing(120000);
        res.zellen = zellen();
        const LD = AR.LOD_DISTANCES;
        const dGrenze = LD.thresh12 + (LD.hysteresis || 0);
        res.dGrenze = dGrenze;
        const NICHT_BAUM = new Set(["under", "litter", "rock"]);
        const istBaumArt = (p) => r._foundryPresetIsTree(p);

        // ── B: Absenz-Zensus über die lebenden Instanz-Gruppen ──
        const absenz = () => {
            const treffer = [];
            let n = 0;
            const groups = r.state.archInstanceGroups;
            if (!groups) return { n, treffer };
            for (const [key, g] of groups) {
                const m = /^fscatter:([^:#]+):(\d+):(\d)#/.exec(key);
                if (!m || istBaumArt(m[1])) continue;
                if (!g.mesh || !g.mesh.instanceMatrix) continue;
                const frei = new Set(g.free || []);
                const a = g.mesh.instanceMatrix.array;
                for (let s = 0; s < (g.next | 0); s++) {
                    if (frei.has(s)) continue;
                    const o = s * 16;
                    if (a[o] === 0 && a[o + 5] === 0 && a[o + 10] === 0) continue; // Null-Skala = frei
                    const d = Math.hypot(a[o + 12] - pm.x, a[o + 14] - pm.z);
                    if (d > dGrenze) {
                        n++;
                        if (treffer.length < 4) treffer.push(`${key.split("#")[0]} @ ${d.toFixed(0)} m`);
                    }
                }
            }
            return { n, treffer };
        };
        res.b = absenz();

        // ── C: die Form je Nicht-Baum-Zelle mit Fern-Wunsch ──
        const formZensus = () => {
            const z = { gesetz: 0, boden: 0, karte: 0, wartet: 0, ohneForm: 0, slotsBeiForm: 0, litter: 0, falsch: [] };
            for (const reg of map.values()) {
                for (const c of reg.cells || []) {
                    if (c.layer === "litter") z.litter++;
                    if (!NICHT_BAUM.has(c.layer) || !(c.lod >= 2)) continue;
                    const preset = r._foundryPresetFor(c.species);
                    if (!preset) continue;
                    let soll;
                    try {
                        soll = r._foundryFernForm(preset);
                    } catch (e) {
                        soll = "BRUCH";
                    }
                    if (!c.form) {
                        z.ohneForm++;
                        if (z.falsch.length < 3) z.falsch.push(`${c.species} ohne form`);
                        continue;
                    }
                    if (c.form !== soll && z.falsch.length < 3) z.falsch.push(`${c.species}: ${c.form} ≠ ${soll}`);
                    if (c.form !== soll) continue;
                    z[c.form]++;
                    if (c.wartet) z.wartet++;
                    if ((c.form === "gesetz" || c.form === "boden") && Array.isArray(c.slots) && c.slots.length)
                        z.slotsBeiForm++;
                }
            }
            return z;
        };
        res.c = formZensus();
        res.d = { voll: r._weltKapselnVollWarn === true };

        // Eine Region mit Fels-Zellen auf der Fernstufe (Flip-Ziel).
        let flipKey = null;
        for (const [k, reg] of map) {
            if ((reg.cells || []).some((c) => c.layer === "rock" && c.lod >= 2)) {
                flipKey = k;
                break;
            }
        }
        res.flipKey = flipKey;
        const neuBau = (k) => {
            const reg = map.get(k);
            const rx = reg.regX,
                rz = reg.regZ;
            r._disposeScatterRegion(k);
            return r._scatterRegion(rx, rz, pm);
        };
        const felsFormen = (reg) => {
            const s = { n: 0, formen: {}, slots: 0 };
            for (const c of reg.cells || []) {
                if (c.layer !== "rock" || !(c.lod >= 2)) continue;
                s.n++;
                s.formen[c.form] = (s.formen[c.form] || 0) + 1;
                if (Array.isArray(c.slots)) s.slots += c.slots.length;
            }
            return s;
        };
        // ── A2: der Flip (Konsum, nicht Existenz) ──
        if (flipKey && B.rock) {
            const alt = B.rock.fern;
            try {
                B.rock.fern = "boden";
                res.flipBoden = felsFormen(neuBau(flipKey) || {});
            } catch (e) {
                res.flipErr = String((e && e.message) || e);
            } finally {
                B.rock.fern = alt;
            }
            try {
                res.flipZurueck = felsFormen(neuBau(flipKey) || {});
            } catch (e) {
                res.flipErr = String((e && e.message) || e);
            }
        }

        // ── F: die Geröll-Passung aus den unverschmolzenen Steinen ──
        const fit = {};
        try {
            let satz = null;
            const dlF = performance.now() + 60000;
            while (performance.now() < dlF) {
                satz = r._streuGesetzFit("geroell", 7);
                if (satz && satz.length) break;
                await sleep(100);
            }
            fit.n = satz ? satz.length : 0;
            let groesste = 0;
            for (const d of satz || []) {
                const ausdehnung = d.h
                    ? 2 * Math.max(d.h.x, d.h.y, d.h.z)
                    : d.a && d.b
                      ? Math.hypot(d.b.x - d.a.x, d.b.y - d.a.y, d.b.z - d.a.z) + 2 * d.r
                      : 0;
                groesste = Math.max(groesste, ausdehnung);
            }
            fit.groessteM = +groesste.toFixed(2);
            // die Quelle: unverschmolzen trägt der Haufen mehr Teile, als der Satz übernimmt
            const bf = r._foundryFlattenFor({ seed: 7 }, "geroell", 1);
            fit.teile =
                bf && bf.leaves && bf.leaves[0] && bf.leaves[0]._srcGroup ? bf.leaves[0]._srcGroup.children.length : 0;
            fit.leaves = bf && bf.leaves ? bf.leaves.length : 0;
        } catch (e) {
            fit.err = String((e && e.message) || e);
        }
        res.f = fit;

        // ── SELBSTTEST 1: eine injizierte Geröll-L0-Instanz bei 200 m macht B rot ──
        const st1 = {};
        try {
            let flat = null;
            const dlS = performance.now() + 60000;
            while (performance.now() < dlS) {
                flat = r._foundryFlattenFor({ seed: 7 }, "geroell", 0);
                if (flat && flat.instanceable && flat.leaves && flat.leaves.length) break;
                await sleep(100);
            }
            if (flat && flat.leaves) {
                const vor = absenz().n;
                const slots = r._scatterInstanceAdd(
                    "fscatter:geroell:3:0",
                    pm.x + 200,
                    0,
                    pm.z,
                    0,
                    1,
                    null,
                    Math.floor((pm.x + 200) / AR.SCATTER.regionM) + "," + Math.floor(pm.z / AR.SCATTER.regionM),
                    flat
                );
                const mit = absenz();
                st1.feuert = mit.n > vor && mit.treffer.some((t) => t.startsWith("fscatter:geroell:3:0"));
                st1.treffer = mit.treffer[0] || "";
                r._scatterFreeSlots(slots);
                st1.zurueck = absenz().n === vor;
            }
        } catch (e) {
            st1.err = String((e && e.message) || e);
        }
        res.st1 = st1;

        // ── SELBSTTEST 2 + E: die erschöpfte Kapsel-Liste — Gesetz-Bahn offen, jeder Spawn scheitert ──
        const st2 = {};
        if (flipKey) {
            const add0 = r._scatterInstanceAdd;
            let zuege = 0;
            try {
                r._streuGesetzBahnOffen = () => true;
                r._streuGesetzSpawn = () => null;
                r._weltKapselnVollWarn = true;
                r._scatterInstanceAdd = function (name) {
                    const m = /^fscatter:([^:]+):/.exec(String(name));
                    if (m && !r._foundryPresetIsTree(m[1])) zuege++;
                    return add0.apply(this, arguments);
                };
                const reg = neuBau(flipKey) || {};
                let wartet = 0,
                    gesetzZellen = 0;
                for (const c of reg.cells || [])
                    if (NICHT_BAUM.has(c.layer) && c.lod >= 2 && c.form === "gesetz") {
                        gesetzZellen++;
                        if (c.wartet && Array.isArray(c.slots) && !c.slots.length && !c.feld) wartet++;
                    }
                st2.gesetzZellen = gesetzZellen;
                st2.wartet = wartet;
                st2.l0 = absenz().n;
                st2.wandRot = r._weltKapselnVollWarn === true;
                // E: die Wiederholung im Tick — 40 Durchläufe, kein Instanz-Zug für Nicht-Baum-Arten
                const zVor = zuege;
                for (let i = 0; i < 40; i++) r._tickScatterLod(pm, 8, 800);
                st2.tickZuege = zuege - zVor;
                st2.bauZuege = zVor;
            } catch (e) {
                st2.err = String((e && e.message) || e);
            } finally {
                delete r._streuGesetzBahnOffen;
                delete r._streuGesetzSpawn;
                r._scatterInstanceAdd = add0;
                delete r._scatterInstanceAdd;
                r._weltKapselnVollWarn = false;
            }
            try {
                neuBau(flipKey);
            } catch (_e) {}
        }
        res.st2 = st2;

        // ── SELBSTTEST 3: ohne budget.flower.fern bricht der Leser fail-closed ──
        const st3 = {};
        if (B.flower) {
            const alt = B.flower.fern;
            try {
                delete B.flower.fern;
                try {
                    r._foundryFernForm("blume");
                    st3.bruch = false;
                } catch (e) {
                    st3.bruch = /KERN-PFLICHT/.test(String(e && e.message));
                    st3.meldung = String(e && e.message).slice(0, 120);
                }
            } finally {
                B.flower.fern = alt;
            }
        }
        res.st3 = st3;
        res.bNachher = absenz();
        return res;
    });

    console.log("=== STREU-FERN — die Fernform der Klein-Streu kommt aus dem Budget (B2c `fern`) ===");
    check("Boot + Studio-Buch (lod.budget) auf dem Host", out.boot && out.buch, `zellen=${out.zellen}`);
    const F = out.fern || {};
    check(
        "A KONSUM: fern je Art live (tree/shrub karte · flower/rock gesetz · grass boden)",
        F.tree === "karte" &&
            F.shrub === "karte" &&
            F.flower === "gesetz" &&
            F.rock === "gesetz" &&
            F.grass === "boden",
        JSON.stringify(F)
    );
    const fb = out.flipBoden || {},
        fz = out.flipZurueck || {};
    check(
        'A KONSUM: Flip rock.fern="boden" → die neu gebaute Region trägt form boden (ohne Slots), zurück → gesetz',
        fb.n > 0 && fb.formen && fb.formen.boden === fb.n && fb.slots === 0 && fz.formen && fz.formen.gesetz === fz.n,
        out.flipErr || `Region ${out.flipKey}: boden ${JSON.stringify(fb.formen)} · zurück ${JSON.stringify(fz.formen)}`
    );
    const b = out.b || { n: -1, treffer: [] };
    check(
        `B ABSENZ: keine Nicht-Baum-Streu-Instanz jenseits Welt-d1+Hyst (${out.dGrenze} m)`,
        b.n === 0,
        `${b.n} Instanzen${b.treffer.length ? ": " + b.treffer.join(" · ") : ""}`
    );
    const c = out.c || {};
    check(
        "C FORM: jede Nicht-Baum-Fern-Zelle trägt ihre Budget-Form, gesetz/boden ohne Slots, keine litter-Zelle",
        c.ohneForm === 0 && c.slotsBeiForm === 0 && c.litter === 0 && (c.falsch || []).length === 0 && c.gesetz > 0,
        `gesetz ${c.gesetz} (wartet ${c.wartet}) · boden ${c.boden} · karte ${c.karte} · ohne Form ${c.ohneForm} · litter ${c.litter}${c.falsch && c.falsch.length ? " · " + c.falsch.join(" · ") : ""}`
    );
    check("D WAND: die Kapsel-Liste ist nicht erschöpft", out.d && out.d.voll === false);
    const st2 = out.st2 || {};
    check(
        "E TICK: die Wiederholung wartender Zellen legt keine Instanz-Slots an (40 Durchläufe)",
        st2.tickZuege === 0,
        st2.err || `Züge im Tick ${st2.tickZuege}`
    );
    const ft = out.f || {};
    check(
        "F PASSUNG: Geröll fern = die 6 größten Fuß-Steine (unverschmolzen), kein Haufen-Primitiv",
        ft.n === 6 && ft.teile > 6 && ft.groessteM > 0 && ft.groessteM < 2,
        ft.err ||
            `${ft.n} Primitive aus ${ft.teile} Steinen (verschmolzen ${ft.leaves} Leaf), größtes ${ft.groessteM} m`
    );
    const st1 = out.st1 || {};
    check(
        "SELBSTTEST 1: eine injizierte fscatter:geroell:3:0-Instanz bei 200 m macht B rot (mit Namen)",
        st1.feuert === true && st1.zurueck === true,
        st1.err || st1.treffer
    );
    check(
        "SELBSTTEST 2: erschöpfte Kapsel-Liste → die Zellen warten (0 L0-Instanzen) und die Wand D wird rot",
        st2.gesetzZellen > 0 &&
            st2.wartet === st2.gesetzZellen &&
            st2.l0 === 0 &&
            st2.bauZuege === 0 &&
            st2.wandRot === true,
        st2.err || `wartet ${st2.wartet}/${st2.gesetzZellen} · L0 ${st2.l0} · Bau-Züge ${st2.bauZuege}`
    );
    const st3 = out.st3 || {};
    check(
        "SELBSTTEST 3: ohne budget.flower.fern bricht der Host-Leser fail-closed",
        st3.bruch === true,
        st3.meldung || ""
    );
    check(
        "nach den Selbsttests: B wieder leer",
        out.bNachher && out.bNachher.n === 0,
        out.bNachher ? `${out.bNachher.n}` : "—"
    );
    check("keine Page-Errors während der Probe", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));

    await browser.close();
    server.close();
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Klein-Streu liest ihre Fernform aus dem Studio-Budget: jenseits Welt-d1 kein L0-Mesh, wartende Zellen ohne Instanz-Zug, die erschöpfte Kapsel-Liste wird rot statt still L0."
    );
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    server.close();
    process.exit(1);
});
