#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-fall-waechter.cjs — DER FALL-WÄCHTER (Leben-Schau 2, 09.10., Familie koerper-bild): jeder Körper steht auf dem Boden
// UNTER ihm — keiner fällt durch ihn, keiner springt aufs Dach. Befund (sichtbar gefahren, echte Radeon, Spur B Bilder 34–37):
// der GT flog mit 38 km/h über die Spaltkante (−904/−975), prallte an die Gegenwand, rollte zurück in den Grund und unter den
// Überhang der Westwand (Fels 22,3–29,5 m, Luft 16–22,3 m) — dort lag sein Boden 12 m ÜBER ihm: der Fahr-Schritt las die
// Oberkante der Säule (`getTerrainHeightAt`), und der Flug-Zweig des Kerns ließ ihn fallen, −6 428 m nach 30 s, das Bild
// fror senkrecht ein. Dieselbe Klasse trug das gestoßene Tier (der Gleit-Schritt las die Oberkante: in der Höhle aufs Dach)
// und der Ritt (`_rittEbene`, `_rittSchritt`); der Spieler (`_fieldSurfaceBelow`) und das gehende Tier
// (`_creatureGroundY` → `_koerperBodenUnter`) lasen den Boden unter dem Körper schon. Die Wand (Null-Renderer, echter
// Spiel-Takt `_gameLoopTick`, die Boden-Wahrheit ist das Dichtefeld selbst — der erste Fels unter dem Körper):
//   (O) DIE ORTE DER SCHAU
//       O1 der Wagen im Spaltgrund unter dem Überhang (−900,6/−976,1): aufgesessen, in der Luft wie in der Schau — nach 4 s
//          steht er auf seinem Grund (≤ STEHT_M daneben), er war nie tiefer als FALL_M unter ihm;
//       O2 die Fahrt der Schau: der GT mit 10,6 m/s über die Spaltkante (Start −912/−975, Fahrt +x, 4 s Gas), 20 s — nie
//          tiefer als FALL_M unter seinem Grund, nie unter der Todes-Ebene;
//       O3 die Höhle der Boden-Funktion (−875,5/−1229,4, Fels 38,5–48,5 m, Luft 30–38,5 m): ein Wagen auf dem Höhlen-Grund,
//          ein an die nächste Wand gestoßener Wolf, ein in sie laufender Wolf, der Spieler zu Fuß — jeder steht am Ende auf
//          dem Grund, keiner unter ihm, keiner auf dem Dach (die Wand hält den Leib: CI 38009273564 trug ein Stoß den Wolf in
//          den Fels, sein Boden fiel auf die Oberkante der Säule, 11,88 m auf dem Dach);
//   (Z) DER ZENSUS: je Ort die Überhang-Spalten im Umkreis (Luft ≥ 3 m unter ≥ 2 m Fels, ihr Grund begehbar) — Wagen und
//       an die nächste Wand gestoßener Wolf je Spalte; ROT je Körper beim Namen, Ort und Maß;
//   (T) DER EINGESCHMUGGELTE TÄTER: im selben Lauf liest der Boden des Werks die Oberkante der Säule (der alte Leser) — O1
//       MUSS rot fallen, beim Namen;
//   (Q) DIE QUELLE (AST, acorn): die Körper-Schritte lesen ihren Boden nur über `_koerperBodenUnter` — kein
//       `getTerrainHeightAt` / `_voxelSurfaceY` / `findSurfaceAbove` / `_terrainMacroSurfaceY` in ihnen, und jeder ruft den
//       Boden des Körpers;
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter MUSS rot fallen und ihn beim Namen
// nennen; die Quellen-Wand nennt eine eingeschleuste Zeile in einer Kopie des Stamms (und ist am Stamm grün).
//   node scripts/diag-fall-waechter.cjs [--selftest]   (npm run gate:fall-waechter; Port FALL_WAECHTER_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const FALL_M = 1.0; // so tief darf ein Körper nie unter dem Fels unter ihm liegen
const STEHT_M = 0.6; // so nah steht ein ruhender Körper an seinem Grund (Rad-Ebene, Nick, Sohle)
const DACH_M = 2.0; // höher über dem Grund steht er nicht — er sprang aufs Dach
// Die Körper-Schritte und die Leser, die nie den Boden eines Körpers liefern dürfen.
const KOERPER_SCHRITTE = [
    "_fahrBoden",
    "_werkBoden",
    "_rittEbene",
    "_rittSchritt",
    "_kreaturStossSchritt",
    "_creatureGroundY",
    "_creatureSlopeProbe",
    "_koerperSchritt",
];
const DACH_LESER = new Set(["getTerrainHeightAt", "_voxelSurfaceY", "findSurfaceAbove", "_terrainMacroSurfaceY"]);
const BODEN_LESER = new Set(["_koerperBodenUnter", "_koerperSchritt", "_werkBoden", "_fahrBoden"]);

// DIE QUELLEN-WAND (AST): je Körper-Schritt die Rufe eines Dach-Lesers (Täter) und ob er einen Boden-Leser ruft.
function quellenWand(quelle) {
    const acorn = require("acorn");
    const ast = acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const befunde = [];
    const gefunden = new Set();
    const lauf = (n, f) => {
        if (!n || typeof n.type !== "string") return;
        f(n);
        for (const k in n) {
            if (k === "type" || k === "loc" || k === "start" || k === "end") continue;
            const v = n[k];
            if (Array.isArray(v)) for (const x of v) lauf(x, f);
            else if (v && typeof v.type === "string") lauf(v, f);
        }
    };
    const name = (m) => (m.computed ? null : m.property && m.property.name);
    lauf(ast, (n) => {
        if (n.type !== "MethodDefinition" || !n.key || !KOERPER_SCHRITTE.includes(n.key.name)) return;
        const methode = n.key.name;
        gefunden.add(methode);
        let ruftBoden = false;
        lauf(n.value.body, (c) => {
            if (c.type !== "CallExpression" || c.callee.type !== "MemberExpression") return;
            const nm = name(c.callee);
            if (DACH_LESER.has(nm))
                befunde.push(`${methode} Zeile ${c.loc.start.line} ruft ${nm} (die Oberkante der Säule)`);
            if (BODEN_LESER.has(nm) && nm !== methode) ruftBoden = true;
        });
        if (!ruftBoden && methode !== "_koerperBodenUnter")
            befunde.push(`${methode} ruft den Boden des Körpers nicht (_koerperBodenUnter · _werkBoden · _fahrBoden)`);
    });
    for (const m of KOERPER_SCHRITTE) if (!gefunden.has(m)) befunde.push(`${m} fehlt im Stamm (die Wand kennt ihn)`);
    return befunde;
}

// Das Urteil über einen Befund: Liste der Verstöße (leer = grün). Rein, im Selbsttest wie im Lauf.
function urteil(b) {
    const v = [];
    const proben = b.proben || [];
    for (const name of [
        "O1 Wagen unter dem Überhang",
        "O2 Schau-Fahrt über die Spaltkante",
        "O3 Wagen in der Höhle",
        "O3 Wolf in der Höhle",
        "O3 Spieler in der Höhle",
        "O3 Wolf läuft in die Wand",
    ])
        if (!proben.some((p) => p.name === name)) v.push(`LEER: die Probe „${name}" fehlt`);
    for (const p of proben) {
        if (p.fehler) {
            v.push(`LEER: ${p.name}: ${p.fehler}`);
            continue;
        }
        const wo = `${p.koerper} bei ${p.ort}`;
        // ein Tier steht auf der Sicht (Q4, Lehre 22: der sichtbare Boden ist das Mesh) — sein Leib darf so weit neben dem
        // Gesetz liegen, wie das Stand-Band des Spiels trägt (`band`, STAND_SICHT_BAND); Wagen und Spieler stehen auf dem Gesetz
        const fallM = Number.isFinite(p.band) ? Math.max(FALL_M, p.band) : FALL_M;
        const stehtM = Number.isFinite(p.band) ? Math.max(STEHT_M, p.band) : STEHT_M;
        if (p.tiefsteUnter > fallM)
            v.push(
                `(O) DURCH DEN BODEN: ${p.name} — ${wo} lag ${p.tiefsteUnter.toFixed(2)} m unter dem Fels unter ihm` +
                    ` (am Ende y ${p.yEnde.toFixed(2)}, Grund ${p.grundEnde.toFixed(2)})`
            );
        if (p.todesEbene)
            v.push(`(O) UNENDLICHER FALL: ${p.name} — ${wo} fiel unter die Todes-Ebene (y ${p.yMin.toFixed(1)})`);
        if (
            p.ruhe &&
            !(Math.abs(p.yEnde - p.grundEnde) <= stehtM) &&
            !(p.yEnde - (Number.isFinite(p.grundSoll) ? p.grundSoll : p.grundEnde) > DACH_M)
        )
            v.push(
                `(O) STEHT NICHT: ${p.name} — ${wo} ruht ${(p.yEnde - p.grundEnde).toFixed(2)} m über seinem Grund ` +
                    `(y ${p.yEnde.toFixed(2)}, Grund ${p.grundEnde.toFixed(2)})`
            );
        const soll = Number.isFinite(p.grundSoll) ? p.grundSoll : p.grundEnde;
        if (p.yEnde - soll > DACH_M)
            v.push(
                `(O) AUF DEM DACH: ${p.name} — ${wo} steht ${(p.yEnde - soll).toFixed(2)} m über dem Grund, auf den er gesetzt war ` +
                    `(y ${p.yEnde.toFixed(2)}, Grund ${soll.toFixed(2)}, Säulen-Oberkante ${p.dach.toFixed(2)})`
            );
    }
    const z = b.zensus || {};
    if (!(z.spalten > 0)) v.push("LEER: (Z) der Zensus fand keine Überhang-Spalte");
    for (const t of z.taeter || []) v.push(`(Z) ${t}`);
    if (!b.schmuggel || !b.schmuggel.rot)
        v.push(
            "LINSE STUMPF: (T) mit dem Dach-Leser im Boden des Werks fiel O1 nicht rot" +
                (b.schmuggel && b.schmuggel.mass ? ` (${b.schmuggel.mass})` : "")
        );
    for (const q of b.quelle || []) v.push(`(Q) DACH-LESER: ${q}`);
    for (const e of b.pageErrors || []) v.push(`PAGE-ERROR: ${e}`);
    return v;
}

function selbsttest() {
    const probe = (name, koerper, o) =>
        Object.assign(
            {
                name,
                koerper,
                ort: "-900.6/-976.1",
                tiefsteUnter: 0.1,
                yEnde: 16.1,
                grundEnde: 16.0,
                dach: 29.6,
                ruhe: true,
                yMin: 15,
            },
            o || {}
        );
    const gruen = {
        proben: [
            probe("O1 Wagen unter dem Überhang", "Wagen fahrzeug_gt#9"),
            probe("O2 Schau-Fahrt über die Spaltkante", "Wagen fahrzeug_gt#10", { ruhe: false }),
            probe("O3 Wagen in der Höhle", "Wagen fahrzeug_gt#11"),
            probe("O3 Wolf in der Höhle", "Tier wolf#3", { band: 2 }),
            probe("O3 Spieler in der Höhle", "Spieler"),
            probe("O3 Wolf läuft in die Wand", "Tier wolf#4 (läuft an die Wand 0.4 m)", { band: 2 }),
        ],
        zensus: { spalten: 8, proben: 16, taeter: [] },
        schmuggel: { rot: true, mass: "8,2 m durch den Boden" },
        quelle: [],
        pageErrors: [],
    };
    const fehler = [];
    const g = urteil(gruen);
    if (g.length) fehler.push("der grüne Befund fällt rot: " + g.join(" · "));
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const faelle = [
        [
            "der Wagen der Schau fällt durch den Spaltgrund",
            (b) => Object.assign(b.proben[0], { tiefsteUnter: 6444, yEnde: -6428, todesEbene: true, yMin: -6428 }),
            /\(O\) DURCH DEN BODEN: O1 Wagen unter dem Überhang — Wagen fahrzeug_gt#9 bei -900\.6\/-976\.1 lag 6444\.00 m unter/,
        ],
        [
            "unendlicher Fall",
            (b) => Object.assign(b.proben[1], { todesEbene: true, yMin: -900 }),
            /UNENDLICHER FALL: O2/,
        ],
        [
            "der Wolf auf dem Dach",
            (b) => Object.assign(b.proben[3], { yEnde: 48.6, grundEnde: 30.0, dach: 48.6 }),
            /\(O\) AUF DEM DACH: O3 Wolf in der Höhle — Tier wolf#3 .* 18\.60 m über dem Grund/,
        ],
        [
            "der Wagen schwebt",
            (b) => Object.assign(b.proben[2], { yEnde: 31.5, grundEnde: 30.0 }),
            /\(O\) STEHT NICHT: O3 Wagen in der Höhle — .* ruht 1\.50 m/,
        ],
        ["fehlende Probe", (b) => b.proben.splice(4, 1), /LEER: die Probe „O3 Spieler in der Höhle" fehlt/],
        [
            "der Wolf läuft durch die Wand aufs Dach",
            (b) => Object.assign(b.proben[5], { yEnde: 42.28, grundEnde: 42.28, dach: 42.33, grundSoll: 30.4 }),
            /\(O\) AUF DEM DACH: O3 Wolf läuft in die Wand — Tier wolf#4 \(läuft an die Wand 0\.4 m\) .* 11\.88 m über dem Grund/,
        ],
        [
            "ein Tier tiefer als sein Sicht-Band",
            (b) => Object.assign(b.proben[5], { tiefsteUnter: 2.5, yEnde: 29.8, grundEnde: 32.3 }),
            /\(O\) DURCH DEN BODEN: O3 Wolf läuft in die Wand — .* lag 2\.50 m unter dem Fels/,
        ],
        ["leerer Zensus", (b) => (b.zensus.spalten = 0), /LEER: \(Z\) der Zensus fand keine/],
        [
            "Zensus-Täter",
            (b) => b.zensus.taeter.push("Wagen an -870/-1230 3,1 m durch den Boden"),
            /\(Z\) Wagen an -870\/-1230/,
        ],
        ["stumpfer Schmuggel", (b) => (b.schmuggel.rot = false), /LINSE STUMPF: \(T\)/],
        [
            "Quelle",
            (b) => b.quelle.push("_fahrBoden Zeile 1 ruft getTerrainHeightAt"),
            /\(Q\) DACH-LESER: _fahrBoden Zeile 1/,
        ],
        ["Page-Error", (b) => b.pageErrors.push("TypeError: x"), /PAGE-ERROR: TypeError: x/],
    ];
    {
        // das Gegenstück: ein Tier am steilen Fuß der Höhlenwand steht auf dem Mesh, 0,75 m unter dem Gesetz — im Band, grün
        const b = klon();
        Object.assign(b.proben[5], { tiefsteUnter: 1.0, yEnde: 31.52, grundEnde: 32.27 });
        const v = urteil(b);
        console.log(
            `  ${v.length ? "❌" : "✅"} Selbsttest „Tier im Sicht-Band" bleibt grün: ${v.join(" · ") || "grün"}`
        );
        if (v.length) fehler.push("ein Tier im Sicht-Band fällt rot: " + v.join(" · "));
    }
    for (const [name, tat, muss] of faelle) {
        const b = klon();
        tat(b);
        const v = urteil(b);
        const ok = v.some((x) => muss.test(x));
        if (!ok) fehler.push(`${name}: die Wand nennt den Täter nicht (${muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    // die Quellen-Wand am Stamm (grün) und an einer Kopie mit dem alten Leser (rot, beim Namen)
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const amStamm = quellenWand(stamm);
    console.log(`  ${amStamm.length ? "❌" : "✅"} Quellen-Wand am Stamm: ${amStamm.join(" · ") || "sauber"}`);
    if (amStamm.length) fehler.push("die Quellen-Wand ist am Stamm rot: " + amStamm.join(" · "));
    const kopie = stamm.replace(
        /(\n {4}_werkBoden\(entry\) \{)/,
        "$1\n        if (entry.__schmuggel) return () => this.getTerrainHeightAt(0, 0);"
    );
    const anKopie = quellenWand(kopie);
    const genannt = anKopie.some((x) => /^_werkBoden Zeile \d+ ruft getTerrainHeightAt/.test(x));
    console.log(
        `  ${genannt ? "✅" : "❌"} Quellen-Wand an der Kopie mit dem alten Leser → ${anKopie.join(" · ") || "(nichts)"}`
    );
    if (!genannt) fehler.push("die Quellen-Wand nennt den eingeschleusten Dach-Leser nicht");
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== FALL-WÄCHTER — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const PORT = Number(process.env.FALL_WAECHTER_PORT) || 4633;
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

// Die Proben im Seiten-Kontext.
async function probe(K) {
    const r = window.anazhRealm;
    const st = r.state;
    const A = r.constructor;
    const pause = (ms) => new Promise((ok) => setTimeout(ok, ms || 0));
    let tMs = performance.now();
    const takt = () => {
        tMs += 1000 / 60;
        r._gameLoopTick(tMs);
    };
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 90000;
    while (performance.now() < dl && !(f && f.ready && f.recipes && f.recipes.gt && st.blueprints.fahrzeug_gt))
        await pause(100);
    const todesEbene = (st.terrainBaseHeight || 0) - 88;
    // DIE BODEN-WAHRHEIT: das Dichtefeld selbst — der erste Fels unter einem Punkt (0,05-m-Schritte), unabhängig von jedem
    // Leser des Spiels. Startet der Punkt im Fels, ist der Körper darin: Grund = +Infinity (er liegt unter ihm).
    const grundUnter = (x, y, z) => {
        if (r._fieldSolid(x, y, z)) return Infinity;
        for (let yy = y; yy > y - 60; yy -= 0.05) if (r._fieldSolid(x, yy, z)) return yy;
        return -Infinity;
    };
    // DIE LAGE DES KÖRPERS: wie `grundUnter`, aber steckt der Punkt im Fels, ist sein Grund die Fels-Grenze ÜBER ihm — die
    // Tiefe, in der der Körper steckt, als Zahl (ein Leib 0,3 m im Fuß einer Wand ist kein Sturz durch den Boden); ohne
    // Grenze in 60 m +Infinity (99 m). Der Soll-Grund (`grundAb`) bleibt beim Fels UNTER dem Punkt.
    const grundAm = (x, y, z) => {
        if (!r._fieldSolid(x, y, z)) return grundUnter(x, y, z);
        for (let yy = y; yy < y + 60; yy += 0.05) if (!r._fieldSolid(x, yy, z)) return yy;
        return Infinity;
    };
    const dachAn = (x, z) => r._voxelSurfaceY(x, z);
    const einschwingen = async (x, z, y) => {
        st.playerMesh.position.set(x, Number.isFinite(y) ? y : r._voxelSurfaceY(x, z) + 1.8, z);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        let stabil = 0,
            last = -1;
        for (let i = 0; i < 6000; i++) {
            takt();
            const sz = st.voxelChunks ? st.voxelChunks.size : 0;
            if (sz === last) stabil++;
            else {
                stabil = 0;
                last = sz;
            }
            if (i > 200 && stabil > 100 && !(st.voxelMeshPending && st.voxelMeshPending.size > 0)) break;
            if (i % 5 === 0) await pause(10);
        }
    };
    const tasten = (w) => {
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        st.keys.w = !!w;
    };
    const absteigen = () => {
        if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
    };
    const raeumen = (x, z, rad) => {
        for (const cr of (st.creatures || []).slice())
            if (cr && cr.position && Math.hypot(cr.position.x - x, cr.position.z - z) < rad) r.removeCreature(cr);
    };
    // Ein Wagen auf dem Grund bei (x, z): gesetzt auf die Höhe `y` (der Grund der Probe), aufgesessen.
    const wagen = async (x, z, y, gier) => {
        absteigen();
        st.playerMesh.position.set(x, y + 1.2, z);
        st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x, y: y + 0.5, z },
            { silent: true, precise: true, rotationY: gier - Math.PI / 2 }
        );
        if (!e) return null;
        for (let i = 0; i < 150 && !e.instanced && !e.mesh; i++) {
            r._rebuildArchitectureMesh(e);
            await pause(100);
        }
        const mr = r.mountArchitecture(e);
        if (!mr || !mr.ok) {
            r.removeArchitecture(e);
            return null;
        }
        tasten(false);
        return e;
    };
    const weg = (e) => {
        absteigen();
        if (e) r.removeArchitecture(e);
    };
    // Die Spur eines Wagens: je Frame die Lage gegen den Fels unter ihm.
    // der Grund unter (x, z), gemessen ab der Höhe, auf die die Probe den Körper setzte (+1,5 m) — unabhängig davon, wo er endet
    const grundAb = (x, z, ySoll) => {
        if (!Number.isFinite(ySoll)) return NaN;
        const g = grundUnter(x, ySoll + 1.5, z);
        return Number.isFinite(g) ? g : ySoll;
    };
    const wagenSpur = (e, n, onFrame, ySoll) => {
        const m = { tiefsteUnter: -Infinity, yMin: Infinity, todesEbene: false };
        for (let i = 0; i < n; i++) {
            if (onFrame) onFrame(i);
            takt();
            const fz = e._fahr;
            if (!fz || !Number.isFinite(fz.y)) continue;
            const g = grundAm(e.position.x, fz.y + 0.6, e.position.z);
            const unter = g === Infinity ? 99 : Number.isFinite(g) ? g - fz.y : 99;
            if (unter > m.tiefsteUnter) m.tiefsteUnter = unter;
            if (fz.y < m.yMin) m.yMin = fz.y;
            if (fz.y < todesEbene) {
                m.todesEbene = true;
                break;
            }
        }
        const fz = e._fahr;
        m.yEnde = fz ? fz.y : NaN;
        const gE = grundAm(e.position.x, m.yEnde + 0.6, e.position.z);
        m.grundEnde = Number.isFinite(gE) ? gE : m.yEnde - 99;
        m.dach = dachAn(e.position.x, e.position.z);
        m.grundSoll = grundAb(e.position.x, e.position.z, ySoll);
        m.luft = !!(fz && fz.luft);
        m.ruhe = !m.luft;
        return m;
    };
    const proben = [];
    const ort = (x, z) => x.toFixed(1) + "/" + z.toFixed(1);
    // DIE ÜBERHANG-SPALTEN um (cx, cz): von der Oberkante abwärts Fels ≥ felsMin, dann Luft ≥ luftMin, dann ein Grund ≥ 1 m Fels.
    const spaltenUm = (cx, cz, n, felsMin = 2, luftMin = 3) => {
        const out = [];
        for (let rr = 0; rr <= 40 && out.length < n; rr += 3)
            for (let k = 0; k < 12 && out.length < n; k++) {
                const w = (k / 12) * Math.PI * 2 + rr * 0.37;
                const x = cx + Math.cos(w) * rr,
                    z = cz + Math.sin(w) * rr;
                const top = dachAn(x, z);
                if (!Number.isFinite(top)) continue;
                // von der Oberkante abwärts: Fels, dann Luft, dann ein Grund aus Fels
                let y = top - 0.05;
                let fels = 0;
                while (y > top - 40 && r._fieldSolid(x, y, z)) {
                    y -= 0.1;
                    fels += 0.1;
                }
                if (fels < felsMin) continue;
                let luft = 0;
                while (y > top - 60 && !r._fieldSolid(x, y, z)) {
                    y -= 0.1;
                    luft += 0.1;
                }
                if (luft < luftMin || y <= top - 60) continue;
                if (!r._fieldSolid(x, y - 1, z)) continue;
                if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 5)) continue;
                out.push({ x, z, grund: y, dach: top });
            }
        return out;
    };
    // ── O1 DER WAGEN UNTER DEM ÜBERHANG (Spaltgrund −900,6/−976,1)
    const O1 = { x: -900.6, z: -976.1 };
    const o1 = async (name) => {
        await einschwingen(-904, -975);
        raeumen(O1.x, O1.z, 30);
        const grund = grundUnter(O1.x, 20, O1.z);
        if (!Number.isFinite(grund) || grund > 18 || dachAn(O1.x, O1.z) - grund < 8)
            return {
                name,
                fehler: `kein Überhang an ${ort(O1.x, O1.z)} (Grund ${grund}, Oberkante ${dachAn(O1.x, O1.z)})`,
            };
        const e = await wagen(O1.x, O1.z, grund, Math.PI / 2);
        if (!e) return { name, fehler: "der GT ließ sich nicht setzen/aufsitzen" };
        for (let i = 0; i < 3; i++) takt();
        const fz = e._fahr;
        if (fz) {
            // die Lage der Schau: im Grund, in der Luft (Rückrollen von der Gegenwand)
            fz.y = grund + 1.4;
            fz.vy = 0;
            fz.luft = true;
            fz.yBoden = NaN;
        }
        const m = wagenSpur(e, 240, null, grund);
        const aus = Object.assign(
            { name, koerper: "Wagen " + e.type + "#" + e.id, ort: ort(e.position.x, e.position.z) },
            m
        );
        weg(e);
        return aus;
    };
    proben.push(await o1("O1 Wagen unter dem Überhang"));
    // ── (T) DER EINGESCHMUGGELTE TÄTER: der Boden des Werks liest die Oberkante der Säule (der alte Leser)
    {
        const P = Object.getPrototypeOf(r);
        r._werkBoden = function (entry) {
            return (x, z) => this.getTerrainHeightAt(x, z);
        };
        let t;
        try {
            t = await o1("T Schmuggel");
        } finally {
            delete r._werkBoden;
        }
        if (r._werkBoden !== P._werkBoden) throw new Error("der Schmuggel blieb im Stamm");
        window.__fallSchmuggel = t;
    }
    // ── O2 DIE SCHAU-FAHRT über die Spaltkante
    {
        const name = "O2 Schau-Fahrt über die Spaltkante";
        const S = { x: -912, z: -975 };
        const grund = grundUnter(S.x, r._voxelSurfaceY(S.x, S.z) + 1, S.z);
        const e = await wagen(S.x, S.z, grund, Math.PI / 2);
        if (!e) proben.push({ name, fehler: "der GT ließ sich nicht setzen/aufsitzen" });
        else {
            raeumen(-900, -975, 40);
            for (let i = 0; i < 12; i++) takt();
            st.playerVel.setValue(10.6, 0, 0);
            if (e._fahr) e._fahr.vlong = 10.6;
            const m = wagenSpur(e, 1200, (i) => tasten(i < 240));
            tasten(false);
            proben.push(
                Object.assign(
                    { name, koerper: "Wagen " + e.type + "#" + e.id, ort: ort(e.position.x, e.position.z) },
                    m,
                    { ruhe: false }
                )
            );
            weg(e);
        }
    }
    // ── O3 DIE HÖHLE der Boden-Funktion
    const O3 = { x: -875.5, z: -1229.4 };
    await einschwingen(O3.x, O3.z);
    raeumen(O3.x, O3.z, 40);
    // die Höhle am Ort der Schau: die nächste Spalte mit ≥ 4 m Fels über ≥ 3 m Luft (das Dichtefeld des Orts trägt den
    // Fluss-Schnitt seiner Hydro-Kachel — die Höhe der Decke wandert um Meter, die Höhle bleibt)
    const hs = spaltenUm(O3.x, O3.z, 1, 4, 3)[0] || null;
    const H = hs ? { x: hs.x, z: hs.z } : O3;
    const hoehleGrund = hs ? hs.grund : NaN;
    const hoehleOk = !!hs;
    {
        const name = "O3 Wagen in der Höhle";
        if (!hoehleOk)
            proben.push({
                name,
                fehler: `keine Höhle um ${ort(O3.x, O3.z)} (keine Spalte mit 4 m Fels über 3 m Luft)`,
            });
        else {
            const e = await wagen(H.x, H.z, hoehleGrund, 0);
            if (!e) proben.push({ name, fehler: "der GT ließ sich nicht setzen/aufsitzen" });
            else {
                const m = wagenSpur(e, 120, null, hoehleGrund);
                proben.push(
                    Object.assign(
                        { name, koerper: "Wagen " + e.type + "#" + e.id, ort: ort(e.position.x, e.position.z) },
                        m
                    )
                );
                weg(e);
            }
        }
    }
    // DIE WAND DER HÖHLE (die Wahrheit der Linse, das Dichtefeld): je Richtung (16) der erste Abstand, an dem der Fels vom
    // Fuß + einer Stufe bis über zwei weitere Meter reicht — dort ist kein Boden in der Schicht des Körpers, nur Wand. Die
    // nächste Wand im Umkreis von 2,5 m, sonst null.
    const wandUm = (x, z, grund) => {
        let best = null;
        for (let k = 0; k < 16; k++) {
            const w = (k / 16) * Math.PI * 2;
            const dx = Math.cos(w),
                dz = Math.sin(w);
            for (let d = 0.1; d <= 2.5 && (!best || d < best.d); d += 0.1) {
                const px = x + dx * d,
                    pz = z + dz * d;
                let fels = true;
                for (let yy = grund + A.PLAYER_STEP_UP; yy <= grund + A.PLAYER_STEP_UP + 2.1 && fels; yy += 0.25)
                    fels = r._fieldSolid(px, yy, pz);
                if (fels) {
                    best = { dx, dz, d };
                    break;
                }
            }
        }
        return best;
    };
    // Ein Wolf an der Wand: er steht (sein Steuer-Schritt hält ihn), dann gleitet er gestoßen 1,5 s auf die nächste Wand zu
    // (6 m/s — die Reibung zehrt 0,6·g, er trüge 3 m weit; ohne Wand 3 m/s in +x) — oder er LÄUFT 2,5 s mit 2 m/s in sie
    // hinein (`art` „lauf"). Die Wand hält ihn; vorher trug ihn der Schritt in den Fels, und der Boden des Körpers fiel auf
    // die Oberkante der Säule (CI 38009273564: ein gestoßener Wolf 11,88 m auf dem Dach der Höhle).
    const steuerRoh = A._steuerGesetz;
    const kappe = st.maxCreatures;
    const wolfStoss = async (x, z, y, art) => {
        const wand = wandUm(x, z, y);
        const rx = wand ? wand.dx : 1,
            rz = wand ? wand.dz : 0;
        const lauf = art === "lauf";
        const steuer = { lauf: false };
        const steht = Object.create(steuerRoh.call(A));
        steht.steuerSchritt = (sw) => {
            if (steuer.lauf) {
                sw.gier = Math.atan2(rx, rz);
                sw.v = 2;
            } else sw.v = 0;
        };
        A._steuerGesetz = () => steht;
        st.maxCreatures = st.creatures.length + 2;
        try {
            const w = r.spawnCreatureAt(x, y, z, "calm", "wolf", { precise: true, bodySize: 1 });
            if (!w) return null;
            for (let i = 0; i < 20; i++) takt();
            const v0 = wand ? 6 : 3;
            if (lauf) steuer.lauf = true;
            else w.userData._stossV = { x: rx * v0, z: rz * v0 };
            let tiefsteUnter = -Infinity,
                yMin = Infinity;
            for (let i = 0; i < (lauf ? 150 : 90); i++) {
                takt();
                const g = grundAm(w.position.x, w.position.y + 0.6, w.position.z);
                const unter = g === Infinity ? 99 : Number.isFinite(g) ? g - w.position.y : 99;
                if (unter > tiefsteUnter) tiefsteUnter = unter;
                if (w.position.y < yMin) yMin = w.position.y;
            }
            const gE = grundAm(w.position.x, w.position.y + 0.6, w.position.z);
            const out = {
                koerper:
                    "Tier wolf#" +
                    (w.userData.id != null ? w.userData.id : w.id) +
                    (wand ? ` (${lauf ? "läuft" : "gestoßen"} an die Wand ${wand.d.toFixed(1)} m)` : ""),
                ort: ort(w.position.x, w.position.z),
                tiefsteUnter,
                yMin,
                todesEbene: yMin < todesEbene,
                yEnde: w.position.y,
                grundEnde: Number.isFinite(gE) ? gE : w.position.y - 99,
                dach: dachAn(w.position.x, w.position.z),
                grundSoll: grundAb(w.position.x, w.position.z, y),
                ruhe: true,
                band: A.STAND_SICHT_BAND,
            };
            r.removeCreature(w);
            return out;
        } finally {
            A._steuerGesetz = steuerRoh;
            st.maxCreatures = kappe;
        }
    };
    {
        const name = "O3 Wolf in der Höhle";
        if (!hoehleOk) proben.push({ name, fehler: "keine Höhle" });
        else {
            const m = await wolfStoss(H.x, H.z, hoehleGrund);
            proben.push(m ? Object.assign({ name }, m) : { name, fehler: "der Wolf ließ sich nicht rufen" });
        }
    }
    {
        const name = "O3 Wolf läuft in die Wand";
        if (!hoehleOk) proben.push({ name, fehler: "keine Höhle" });
        else if (!wandUm(H.x, H.z, hoehleGrund))
            proben.push({ name, fehler: "keine Wand der Höhle im Umkreis von 2,5 m" });
        else {
            const m = await wolfStoss(H.x, H.z, hoehleGrund, "lauf");
            proben.push(m ? Object.assign({ name }, m) : { name, fehler: "der Wolf ließ sich nicht rufen" });
        }
    }
    {
        const name = "O3 Spieler in der Höhle";
        if (!hoehleOk) proben.push({ name, fehler: "keine Höhle" });
        else {
            absteigen();
            const pm = st.playerMesh.position;
            pm.set(H.x, hoehleGrund + A.PLAYER_FOOT_OFFSET + 0.05, H.z);
            st.playerVel.setValue(0, 0, 0);
            st._fieldVy = 0;
            st.yaw = Math.PI; // nach −z, in die Halle
            let tiefsteUnter = -Infinity,
                yMin = Infinity;
            for (let i = 0; i < 180; i++) {
                tasten(i < 150);
                takt();
                const fuss = pm.y - A.PLAYER_FOOT_OFFSET;
                const g = grundAm(pm.x, fuss + 0.6, pm.z);
                const unter = g === Infinity ? 99 : Number.isFinite(g) ? g - fuss : 99;
                if (unter > tiefsteUnter) tiefsteUnter = unter;
                if (fuss < yMin) yMin = fuss;
            }
            tasten(false);
            const fuss = pm.y - A.PLAYER_FOOT_OFFSET;
            const gE = grundAm(pm.x, fuss + 0.6, pm.z);
            proben.push({
                name,
                koerper: "Spieler",
                ort: ort(pm.x, pm.z),
                tiefsteUnter,
                yMin,
                todesEbene: yMin < todesEbene,
                yEnde: fuss,
                grundEnde: Number.isFinite(gE) ? gE : fuss - 99,
                dach: dachAn(pm.x, pm.z),
                grundSoll: grundAb(pm.x, pm.z, hoehleGrund),
                ruhe: true,
            });
        }
    }
    // ── (Z) DER ZENSUS: Überhang-Spalten um O1 und O3 (Luft ≥ 3 m unter ≥ 2 m Fels, der Grund ≥ 1 m Fels)
    const zensus = { spalten: 0, proben: 0, taeter: [], orte: [] };
    for (const [cx, cz] of [
        [O1.x, O1.z],
        [O3.x, O3.z],
    ]) {
        await einschwingen(cx, cz);
        raeumen(cx, cz, 60);
        const sp = spaltenUm(cx, cz, K.spaltenJeOrt);
        zensus.spalten += sp.length;
        for (const s of sp) {
            zensus.orte.push(
                ort(s.x, s.z) + " (Grund " + s.grund.toFixed(1) + ", Oberkante " + s.dach.toFixed(1) + ")"
            );
            const e = await wagen(s.x, s.z, s.grund, 0);
            if (e) {
                const m = wagenSpur(e, 90, null, s.grund);
                zensus.proben++;
                const wo = `Wagen ${e.type}#${e.id} an ${ort(e.position.x, e.position.z)}`;
                if (m.tiefsteUnter > K.FALL_M || m.todesEbene)
                    zensus.taeter.push(
                        `${wo}: ${m.tiefsteUnter.toFixed(2)} m durch den Boden (y ${m.yEnde.toFixed(2)}, Grund ${m.grundEnde.toFixed(2)})`
                    );
                else if (m.yEnde - m.grundSoll > K.DACH_M)
                    zensus.taeter.push(
                        `${wo}: ${(m.yEnde - m.grundSoll).toFixed(2)} m über seinem Grund — aufs Dach (Oberkante ${m.dach.toFixed(1)})`
                    );
                weg(e);
            }
            const t = await wolfStoss(s.x, s.z, s.grund);
            if (t) {
                zensus.proben++;
                const wo = `${t.koerper} an ${t.ort}`;
                if (t.tiefsteUnter > Math.max(K.FALL_M, t.band || 0) || t.todesEbene)
                    zensus.taeter.push(`${wo}: ${t.tiefsteUnter.toFixed(2)} m durch den Boden`);
                else if (t.yEnde - t.grundSoll > K.DACH_M)
                    zensus.taeter.push(
                        `${wo}: ${(t.yEnde - t.grundSoll).toFixed(2)} m über seinem Grund — aufs Dach (Oberkante ${t.dach.toFixed(1)})`
                    );
            }
        }
    }
    const t = window.__fallSchmuggel;
    const schmuggel = t
        ? {
              rot: !!(
                  t.fehler === undefined &&
                  (t.tiefsteUnter > K.FALL_M || t.todesEbene || t.yEnde - t.grundEnde > K.DACH_M)
              ),
              mass:
                  t.fehler ||
                  `${(t.tiefsteUnter || 0).toFixed(2)} m unter dem Grund, am Ende y ${(t.yEnde || 0).toFixed(2)}`,
          }
        : null;
    return { proben, zensus, schmuggel };
}

(async () => {
    console.log("=== DER FALL-WÄCHTER (Leben-Schau 2) — Null-Renderer, echter Spiel-Takt, Spaltgrund + Höhle ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 900000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(880000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    let befund = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 180000,
        });
        befund = await page.evaluate(probe, { FALL_M, DACH_M, spaltenJeOrt: 6 });
    } catch (e) {
        befund = { fehler: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
    befund.pageErrors = pageErrors;
    befund.quelle = quellenWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    for (const p of befund.proben)
        console.log(
            p.fehler
                ? `  ${p.name}: ${p.fehler}`
                : `  ${p.name.padEnd(36)} ${p.koerper} bei ${p.ort}: am Ende y ${p.yEnde.toFixed(2)} · Grund ${p.grundEnde.toFixed(2)} · ` +
                      `Oberkante ${p.dach.toFixed(2)} · tiefste Lage unter dem Grund ${p.tiefsteUnter.toFixed(2)} m · y min ${p.yMin.toFixed(2)}`
        );
    console.log(
        `  Zensus: ${befund.zensus.spalten} Überhang-Spalten, ${befund.zensus.proben} Proben, ${befund.zensus.taeter.length} Täter`
    );
    for (const o of befund.zensus.orte) console.log(`    · ${o}`);
    console.log(`  Schmuggel (T): ${JSON.stringify(befund.schmuggel)}`);
    console.log(
        `  Quelle: ${befund.quelle.length ? befund.quelle.join(" · ") : "die Körper-Schritte lesen den Boden unter dem Körper"}`
    );
    const v = urteil(befund);
    if (v.length) {
        console.log("\n❌ FALL-WÄCHTER ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    console.log(
        "\n✅ FALL-WÄCHTER GRÜN — jeder Körper steht auf dem Boden unter ihm: keiner fällt durch, keiner springt aufs Dach."
    );
    process.exit(0);
})();
