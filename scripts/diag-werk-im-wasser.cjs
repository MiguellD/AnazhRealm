// diag-werk-im-wasser.cjs — DIE WASSER-WAHRHEIT DER WERKE (Schau-2, Familie wasser-wahrheit): „Werk steht im Wasser" und
// „Wagen im Wasser ohne Widerstand", je Täter beim Namen. Befund 09.10. (artifacts/profiband/leben-schau-2/befund.md §6 #2,
// sichtbar gespielt auf der Radeon, Bilder a-ankunft-dorf-bauen 41–44 und b-fahren 25): der Vorführ-Satz der Ziellinie
// „pflanz mir einen eichenhain am wasser" ließ 6 von 6 Eichen 1,2–4,3 m unter dem gezeichneten Wasser stehen, und der GT
// fuhr 19 m durch 0,61 m Wasser mit 43 km/h. Jede Probe ruft den Chokepoint selbst im echten Boot (headless, Foundry an,
// Null-Renderer der Welt), im echten Spiel-Takt (`_gameLoopTick`):
//
//   H — DER HAIN AM FLUSS (−872/−1127, der Ort der Schau): der Schau-Ablauf — eine Eiche per Bau 16 m östlich (wie F im
//       Bau-Modus), dann der Satz, dann 1200 Spiel-Takte (20 s). Je Stamm das gezeichnete Wasser (`_wasserBildAt`) im
//       Ring von 1,5 m über seinem Fuß, wo es sichtbar über dem Boden steht. Befund V18.537: der Bau weckte den
//       Wasser-Automaten (15 Chunks), der flutete das Tal — 6 von 6 Stämmen 1,9–3,8 m unter dem Wasser.  Soll 0 · 0 Chunks
//   Z — DER ZENSUS DER WERKE: jeder Baum, Strauch und jedes Haus, das während der Probe gesetzt wird (Wald und Unterholz
//       beim Strömen, der Hain, die Bau-Eiche, „dorf" am Fluss: `spawnSettlement` seed 7, 18 Häuser), gemessen VOR seinem
//       Stempel (der Setz-Punkt `spawnArchitecture` ist Beobachtungs-Punkt): das gezeichnete Wasser über dem Boden am Stamm
//       bzw. an jedem Raster-Punkt des Fundaments.                                                          Soll 0 im Wasser
//   L — DIE LESER (kommentarfrei, Node): keine Zwillings-Probe des Lands mehr (`_isAboveWaterAt` fiel), `_waterLevelAt`
//       nur noch als Bezug der Ufer-Bänder (jeder Aufruf mit `aus`), der Wald plant gegen das Gesetz des Wassers
//       (`_atlasWaterLevelAt`), die Natur-Wand fragt das Land (`_landAt`), die Pflanze stempelt keine Wasser-Zelle, ein Bau
//       weckt den Automaten nur, wenn sein Stempel Wasser verdrängt, und beide Fahr-Schritte reichen die Tiefe am Wagen.
//   F — DER WAGEN IM WASSER: der GT fährt im echten Sim-Schritt mit Vollgas aus 26 m Anlauf in 0,5–0,75 m Wasser (eine
//       Furt um den Schau-Ort, gesucht). Befund: 43 km/h durch 0,61 m, ohne Widerstand. Soll: 1 s nach dem Eintauchen
//       ≤ 50 % des Eintritts-Tempos; die Verfolger-Kamera nie unter dem Spiegel.
//   K — DER KERN (Node, vehicle-core fahrKraefte): ohne Tiefe byte-gleich (das Labor kennt kein Wasser, Labor = Welt an
//       Land); in 0,61 m aus 12 m/s nach 1 s ≤ 6 m/s; Vollgas im Wasser endet im Gleichgewicht des Gesetzes
//       √((aEngine − rollDecel) / (kStirn·Tiefe + dragK)) ± 5 %; steht das Wasser an der Ansaugung (Gürtellinie), fährt er
//       aus dem Stand keine 5 cm.
//
//   node scripts/diag-werk-im-wasser.cjs [--selftest]          Port: WERK_WASSER_PORT (Standard 4643)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const fs = require("fs");
const path = require("path");

const SCHWELLE = {
    tiefeStamm: 0.05, // m sichtbares Wasser über dem Fuß eines Stamms
    tiefeFundament: 0.1, // m sichtbares Wasser über dem Boden an einem Raster-Punkt des Fundaments
    caChunks: 0, // Chunks, die der Wasser-Automat nach den Bauten am Ufer rechnet
    hainMin: 6, // Stämme, die der Satz setzen muss (sonst prüft die Probe nichts)
    zensusMin: 40, // Werke im Zensus (Wald + Hain + Dorf), sonst LEER
    haeuserMin: 6, // Häuser des Dorfs im Zensus
    eintrittMin: 6, // m/s: so schnell muss der Wagen ins Wasser fahren (sonst LEER)
    restAnteil: 0.5, // Tempo 1 s nach dem Eintauchen gegen das Eintritts-Tempo
    kameraUnter: 0, // Frames mit der Kamera unter dem Spiegel
};

// ── DAS URTEIL (rein; Lauf und Selbsttest). Rückgabe: die Täter beim Namen. ──
function urteil(b) {
    const v = [];
    const S = SCHWELLE;
    const m = (x) => (Number.isFinite(x) ? x.toFixed(2) : String(x));
    // H
    const H = b.hain;
    if (!H || H.fehler) v.push(`H: ${H ? H.fehler : "die Hain-Probe lief nicht"}`);
    else {
        if (!(H.satz >= S.hainMin)) v.push(`H LEER: der Satz setzte ${H.satz} von ${S.hainMin} Eichen`);
        for (const s of H.staemme || [])
            if (s.tiefe > S.tiefeStamm)
                v.push(
                    `H: ${s.typ} #${s.id} (${m(s.x)}/${m(s.z)}) steht ${m(s.tiefe)} m im Wasser nach ${H.takte} Takten`
                );
        if (!(H.caChunks <= S.caChunks))
            v.push(`H: die Bauten am Ufer weckten den Wasser-Automaten (${H.caChunks} Chunks rechnen)`);
    }
    // Z
    const Z = b.zensus;
    if (!Z || Z.fehler) v.push(`Z: ${Z ? Z.fehler : "der Zensus lief nicht"}`);
    else {
        if (!(Z.werke >= S.zensusMin)) v.push(`Z LEER: nur ${Z.werke} Werke gesetzt (Soll ≥ ${S.zensusMin})`);
        if (!(Z.haeuser >= S.haeuserMin)) v.push(`Z LEER: nur ${Z.haeuser} Häuser des Dorfs (Soll ≥ ${S.haeuserMin})`);
        for (const w of Z.imWasser || [])
            v.push(`Z: ${w.typ} #${w.id} (${m(w.x)}/${m(w.z)}) ${w.wo} ${m(w.tiefe)} m im Wasser (${w.quelle})`);
    }
    // L
    for (const x of b.leser || []) v.push(`L: ${x}`);
    // F
    const F = b.wagen;
    if (!F || F.fehler) v.push(`F: ${F ? F.fehler : "die Wagen-Probe lief nicht"}`);
    else {
        if (!(F.vEin >= S.eintrittMin))
            v.push(`F LEER: der Wagen kam mit ${m(F.vEin)} m/s ins Wasser (Soll ≥ ${S.eintrittMin})`);
        else if (!(F.v1 <= S.restAnteil * F.vEin))
            v.push(
                `F: Wagen im Wasser ohne Widerstand — ${m(F.vEin * 3.6)} km/h beim Eintauchen, 1 s später ${m(F.v1 * 3.6)} km/h in ${m(F.tiefe)} m Wasser`
            );
        if (!(F.kameraUnter <= S.kameraUnter))
            v.push(
                `F: die Verfolger-Kamera steht in ${F.kameraUnter} Frames unter dem Spiegel (bis ${m(F.kameraTiefe)} m)`
            );
    }
    // K
    for (const x of b.kern || []) v.push(`K: ${x}`);
    return v;
}

// ── L: DIE LESER (kommentarfrei). ──
function ohneKommentare(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}
function fnBody(src, sigRe) {
    const mm = sigRe.exec(src);
    if (!mm) return null;
    let i = src.indexOf("{", mm.index + mm[0].length - 1);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}
function leserUrteil(srcRoh) {
    const src = ohneKommentare(srcRoh);
    const v = [];
    if (/_isAboveWaterAt\s*\(/.test(src)) v.push("die Zwillings-Probe des Lands `_isAboveWaterAt` lebt");
    // `_waterLevelAt` nur als Bezug der Ufer-Bänder: jeder Aufruf trägt sein `aus` (drei Argumente)
    const re = /\b_waterLevelAt\(([^()]*)\)/g;
    let mm;
    let zeilen = 0;
    while ((mm = re.exec(src))) {
        if (/^\s*x\s*,\s*z\s*,\s*aus\s*$/.test(mm[1])) continue; // die Definition
        if (mm[1].split(",").length !== 3) {
            const z = src.slice(0, mm.index).split("\n").length;
            v.push(
                `\`_waterLevelAt(${mm[1].trim()})\` liest den Bezug der Ufer-Bänder als Wasser-Probe (Code-Zeile ${z})`
            );
        }
        zeilen++;
    }
    if (!zeilen) v.push("kein Aufruf von `_waterLevelAt` gefunden (die Probe prüft nichts)");
    const wald = fnBody(src, /\n {4}_forestCellDarts\(cx, cz, seedInt\) \{/);
    const waldWasser = wald ? /waterYAt:([\s\S]*?)slopeAt:/.exec(wald) : null;
    if (!waldWasser) v.push("`_forestCellDarts` mit waterYAt nicht gefunden");
    else if (!/_atlasWaterLevelAt\(/.test(waldWasser[1]) || /_waterLevelAt\(/.test(waldWasser[1]))
        v.push("der Wald (`_forestCellDarts` waterYAt) plant nicht gegen das Gesetz des Wassers `_atlasWaterLevelAt`");
    const wand = fnBody(src, /\n {4}_naturWand\(name, position, opts\) \{/);
    if (!wand || !/_landAt\(/.test(wand)) v.push("die Natur-Wand (`_naturWand`) fragt das Land nicht (`_landAt`)");
    const spanne = fnBody(src, /\n {4}_stempelSpanne\([^)]*\) \{/);
    if (!spanne || !/aabb\.pflanze\)\s*return null/.test(spanne))
        v.push("die Pflanze stempelt Wasser-Zellen (`_stempelSpanne` ohne Pflanzen-Ausnahme)");
    const stamp = fnBody(src, /\n {4}_stampArchitectureSolidCellsInto\([^)]*\) \{/);
    if (!stamp || !/_stempelSpanne\(/.test(stamp))
        v.push("der Zell-Stempel liest nicht die EINE Spanne `_stempelSpanne`");
    const spawn = fnBody(src, /\n {4}spawnArchitecture\(type, position, opts = \{\}\) \{/);
    if (!spawn) v.push("`spawnArchitecture` nicht gefunden");
    else {
        const i = spawn.indexOf("_invalidateWaterCapsAround(");
        const vor = i >= 0 ? spawn.slice(Math.max(0, i - 400), i) : "";
        if (!/_stempelImWasser\(/.test(spawn) || !/if \(verdraengt\)/.test(vor))
            v.push("ein Bau weckt den Wasser-Automaten, ohne dass sein Stempel Wasser verdrängt");
    }
    const kraefte = src.match(/vc\.fahrKraefte\([\s\S]*?\);/g) || [];
    if (kraefte.length < 2) v.push(`nur ${kraefte.length} Aufrufe von vc.fahrKraefte gefunden`);
    for (const k of kraefte)
        if (!/tiefe:\s*this\._fahrTiefe\(/.test(k))
            v.push(`ein Fahr-Schritt ohne die Tiefe am Wagen: ${k.replace(/\s+/g, " ").slice(0, 90)}`);
    return v;
}

// ── K: DER KERN (Node). ──
function kernUrteil(VC) {
    const v = [];
    if (!VC || typeof VC.fahrKraefte !== "function" || typeof VC.exportDrive !== "function")
        return ["vehicle-core ohne fahrKraefte/exportDrive"];
    const preset = VC.PRESETS && VC.PRESETS.gt;
    const d = VC.exportDrive(Object.assign({}, preset ? preset.s : {}, preset ? preset.fx : {}));
    const G = VC.fahrGesetz({
        zweispur: d.zweispur,
        lenkung: d.lenkung,
        vmax: d.vmax,
        kAcc: d.kAcc,
        spur: d.spur,
        cgH: d.cgH,
        radR: d.radR,
        spring: d.spring,
        huelle: d.huelle,
    });
    if (!G) return ["fahrGesetz verwirft den GT"];
    if (!G.wasser) return ["der Fahr-Satz des GT trägt kein Wasser-Maß (G.wasser)"];
    const lauf = (tiefe, v0, s, thr) => {
        const z = VC.fahrZustand(0, 0, 0);
        z.vlong = v0;
        z.speed = Math.abs(v0);
        const e = { throttle: thr, brake: 0, steer: 0, hand: false };
        if (tiefe !== undefined) e.tiefe = tiefe;
        const out = [];
        for (let i = 0; i < Math.round(s * 60); i++) {
            VC.fahrKraefte(z, e, G, 1 / 60);
            out.push(z.vlong, z.vlat, z.x, z.z, z.yaw, z.yawRate, z.aLong);
        }
        return { z, out };
    };
    // K1 ohne Tiefe byte-gleich (Labor = Welt an Land)
    const a = lauf(undefined, 12, 2, 1).out;
    const b0 = lauf(0, 12, 2, 1).out;
    let gleich = a.length === b0.length;
    for (let i = 0; gleich && i < a.length; i++) if (!Object.is(a[i], b0[i])) gleich = false;
    if (!gleich) v.push("K1 fahrKraefte mit Tiefe 0 weicht vom Lauf ohne Tiefe ab (Labor ≠ Welt an Land)");
    // K2 in 0,61 m aus 12 m/s
    const t = 0.61;
    const k2 = lauf(t, 12, 1, 1).z;
    if (!(k2.vlong <= 6)) v.push(`K2 in ${t} m Wasser aus 12 m/s nach 1 s noch ${k2.vlong.toFixed(2)} m/s (Soll ≤ 6)`);
    // K3 Gleichgewicht
    const k3 = lauf(t, 0, 12, 1).z;
    const soll = Math.sqrt((G.aEngine - VC.FAHR.rollDecel) / (G.wasser.kStirn * t + G.dragK));
    if (!(Math.abs(k3.vlong - soll) <= 0.05 * soll))
        v.push(
            `K3 Vollgas in ${t} m: ${k3.vlong.toFixed(2)} m/s, das Gleichgewicht des Gesetzes ${soll.toFixed(2)} m/s`
        );
    // K4 Ansaugung
    const k4 = lauf(G.wasser.ansaug + 0.05, 0, 3, 1).z;
    if (!(Math.hypot(k4.x, k4.z) <= 0.05))
        v.push(
            `K4 über der Ansaugung (${(G.wasser.ansaug + 0.05).toFixed(2)} m) fuhr er ${Math.hypot(k4.x, k4.z).toFixed(2)} m`
        );
    return v;
}

// ── DIE PROBE IN DER SEITE (r = die Welt). ──
async function probe(A) {
    const out = {};
    const soll = (n) => !A.nur || A.nur.includes(n); // `--nur`: Werkbank-Fragen (das Gate fährt alle)
    const dl0 = performance.now() + 120000;
    while (
        (!window.anazhRealm || !window.anazhRealm.state.hydrosphere || !window.anazhRealm.state.hydrosphere.ready) &&
        performance.now() < dl0
    )
        await new Promise((res) => setTimeout(res, 200));
    const r = window.anazhRealm;
    const st = r.state;
    const f = r._ensureAssetFoundry();
    const dlF = performance.now() + 60000;
    while (performance.now() < dlF) {
        if (f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt) break;
        await new Promise((res) => setTimeout(res, 100));
    }
    if (st.renderer) {
        st.renderer.render = function () {};
        if (typeof st.renderer.renderAsync === "function") st.renderer.renderAsync = () => Promise.resolve();
    }
    st.postProcessingFailed = true;
    const MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7];
    let tMs = performance.now();
    let nFrame = 0;
    const frame = () => {
        tMs += MUSTER[nFrame++ % MUSTER.length];
        r._gameLoopTick(tMs);
    };
    // Das Wasser über dem Boden an (x, z), wo es über ihm steht (sonst −Infinity): das gezeichnete (`_wasserBildAt`) und —
    // `gesetz` — das des Gesetzes, aus dem das Bild wird (`_atlasWaterLevelAt` über dem Boden: ein Fern-Chunk zeichnet einen
    // See erst später).
    const wasserUeber = (x, z, gesetz) => {
        const g = r._voxelSurfaceY(x, z);
        if (!Number.isFinite(g)) return -Infinity;
        let w = r._wasserBildAt(x, z);
        if (!Number.isFinite(w)) w = -Infinity;
        if (gesetz) w = Math.max(w, r._atlasWaterLevelAt(x, z, g));
        return w > g ? w : -Infinity;
    };
    const sichtbar = (x, z, gesetz) => {
        const w = wasserUeber(x, z, gesetz);
        return Number.isFinite(w) ? w - r._voxelSurfaceY(x, z) : -Infinity;
    };
    // Wie tief steht ein Fuß im Wasser: das Wasser am Punkt und im Ring (`ring` m), wo es über dem Boden steht, über dem Fuß.
    const stammTiefe = (x, z, fuss, ring, gesetz) => {
        let t = -Infinity;
        for (let k = 0; k <= 8; k++) {
            const px = k === 8 ? x : x + Math.cos(k * 0.785398) * ring;
            const pz = k === 8 ? z : z + Math.sin(k * 0.785398) * ring;
            const w = wasserUeber(px, pz, gesetz);
            if (Number.isFinite(w) && w - fuss > t) t = w - fuss;
        }
        return t;
    };
    // ── Z: der Setz-Punkt als Beobachtungs-Punkt (gemessen VOR dem Stempel) ──
    const zensus = { werke: 0, haeuser: 0, baeume: 0, imWasser: [], quelle: "strom" };
    const spawnAlt = r.spawnArchitecture;
    r.spawnArchitecture = function (type, position, opts) {
        const natur = r._istNatur({ type });
        const fu = opts && opts.fundament;
        const mess = [];
        if (position && natur) {
            const g = r._voxelSurfaceY(position.x, position.z);
            if (Number.isFinite(g)) mess.push({ wo: "Fuß", t: stammTiefe(position.x, position.z, g, 0.5, true) });
        } else if (position && fu && Number.isFinite(fu.ex)) {
            const ry = (opts && opts.rotationY) || 0;
            const c = Math.cos(ry);
            const s = Math.sin(ry);
            const nx = Math.min(12, Math.max(1, Math.ceil(fu.ex)));
            const nz = Math.min(12, Math.max(1, Math.ceil(fu.ez)));
            let t = -Infinity;
            for (let i = 0; i <= nx; i++)
                for (let j = 0; j <= nz; j++) {
                    const lx = (fu.ox || 0) + fu.ex * ((2 * i) / nx - 1);
                    const lz = (fu.oz || 0) + fu.ez * ((2 * j) / nz - 1);
                    t = Math.max(t, sichtbar(position.x + lx * c + lz * s, position.z - lx * s + lz * c, true));
                }
            mess.push({ wo: "Fundament", t });
        }
        const e = spawnAlt.apply(this, arguments);
        if (e && mess.length) {
            zensus.werke++;
            if (natur) zensus.baeume++;
            else zensus.haeuser++;
            for (const q of mess) {
                const grenze = q.wo === "Fuß" ? A.tiefeStamm : A.tiefeFundament;
                if (q.t > grenze && zensus.imWasser.length < 40)
                    zensus.imWasser.push({
                        typ: type,
                        id: e.id,
                        x: e.position.x,
                        z: e.position.z,
                        wo: q.wo,
                        tiefe: q.t,
                        quelle: zensus.quelle,
                    });
            }
        }
        return e;
    };
    try {
        // Strömen an den Schau-Ort (Sync-Bau, Worker ausgehängt — wie die Wasser-Linse)
        const X = A.ort[0];
        const Z = A.ort[1];
        st.playerMesh.position.set(X, r._voxelSurfaceY(X, Z) + 1.8, Z);
        const worker = st.voxelWorker;
        st.voxelWorker = null;
        const t0 = performance.now();
        let last = -1;
        let still = performance.now();
        for (;;) {
            try {
                frame();
            } catch (_e) {}
            const n = st.voxelChunks ? st.voxelChunks.size : 0;
            if (n !== last) {
                last = n;
                still = performance.now();
            }
            if ((n >= 9 && performance.now() - still > 1500) || performance.now() - t0 > 90000) break;
            await new Promise((res) => setTimeout(res, 0));
        }
        for (let i = 0; i < 240; i++) {
            try {
                frame();
            } catch (_e) {}
            if (i % 20 === 0) await new Promise((res) => setTimeout(res, 0));
        }
        // ── H: der Schau-Ablauf ──
        if (soll("hain"))
            try {
                st.yaw = Math.PI / 2;
                const caVor = st.waterCAActive ? st.waterCAActive.size : 0;
                zensus.quelle = "Bau-Eiche";
                const ex = A.eiche[0];
                const ez = A.eiche[1];
                const fE = r.spawnArchitecture("baum_eiche", { x: ex, y: r._voxelSurfaceY(ex, ez) + 0.5, z: ez }, {});
                zensus.quelle = "Hain-Satz";
                const v0 = st.architectures.length;
                r.processChatCommand("pflanz mir einen eichenhain am wasser");
                const neu = st.architectures.slice(v0).filter((a) => a && a.type === "baum_eiche");
                const caNach = st.waterCAActive ? st.waterCAActive.size : 0;
                zensus.quelle = "Spiel-Takt";
                for (let i = 0; i < A.takte; i++) {
                    try {
                        frame();
                    } catch (_e) {}
                    if (i % 20 === 0) await new Promise((res) => setTimeout(res, 0));
                }
                out.hain = {
                    takte: A.takte,
                    caVor,
                    caNachBau: caNach,
                    caChunks: Math.max(caNach, st.waterCAActive ? st.waterCAActive.size : 0) - caVor,
                    staemme: (fE ? [fE] : []).concat(neu).map((a) => ({
                        typ: a.type,
                        id: a.id,
                        x: a.position.x,
                        z: a.position.z,
                        tiefe: stammTiefe(a.position.x, a.position.z, a.position.y - 0.5, 1.5, false),
                    })),
                };
                out.hain.satz = neu.length; // die Eichen des Satzes (die Bau-Eiche steht mit in der Flut-Probe)
            } catch (e) {
                out.hain = { fehler: String((e && e.stack) || e).split("\n")[0] };
            }
        // ── Z: das Dorf am Fluss ──
        if (soll("zensus"))
            try {
                zensus.quelle = "Dorf";
                await r.spawnSettlement({ seed: 7, nH: 18, position: { x: X, y: r._voxelSurfaceY(X, Z), z: Z } });
                zensus.quelle = "strom";
                out.zensus = zensus;
            } catch (e) {
                out.zensus = Object.assign({}, zensus, { fehler: "Dorf: " + String((e && e.message) || e) });
            }
        // ── F: der Wagen in der Furt ──
        if (soll("wagen"))
            try {
                const hh = (a, b) => r.getTerrainHeightAt(a, b);
                let furt = A.furt
                    ? { x: A.furt[0], z: A.furt[1], ux: A.furt[2], uz: A.furt[3], tiefe: NaN, hub: NaN }
                    : null;
                for (let gz = -A.suchR; gz <= A.suchR && !furt; gz += 3)
                    for (let gx = -A.suchR; gx <= A.suchR; gx += 3) {
                        const px = X + gx;
                        const pz = Z + gz;
                        const t = sichtbar(px, pz);
                        if (!(t >= 0.5 && t <= 0.75)) continue;
                        for (let k = 0; k < 16; k++) {
                            const ux = Math.cos((k * Math.PI) / 8);
                            const uz = Math.sin((k * Math.PI) / 8);
                            let ok = true;
                            let lo = Infinity;
                            let hi = -Infinity;
                            let vor = null;
                            for (let s = 3; s <= 28 && ok; s++) {
                                const qx = px - ux * s;
                                const qz = pz - uz * s;
                                const h = hh(qx, qz);
                                if (!Number.isFinite(h) || sichtbar(qx, qz) > -Infinity) ok = false;
                                else {
                                    lo = Math.min(lo, h);
                                    hi = Math.max(hi, h);
                                    if (vor !== null && Math.abs(h - vor) > 0.35) ok = false;
                                    vor = h;
                                }
                            }
                            if (!ok || hi - lo > 3) continue;
                            let tief = true;
                            for (let s = 0; s <= 6 && tief; s += 1.5)
                                if (!(sichtbar(px + ux * s, pz + uz * s) >= 0.35)) tief = false;
                            if (!tief) continue;
                            furt = { x: px, z: pz, ux, uz, tiefe: t, hub: hi - lo };
                            break;
                        }
                    }
                if (!furt)
                    throw new Error(`keine Furt (0,5–0,75 m, 26 m trockener Anlauf) im Umkreis von ${A.suchR} m`);
                const sx = furt.x - furt.ux * 26;
                const sz = furt.z - furt.uz * 26;
                // die Bahn frei (gemessen wird das Wasser, nie der Wald)
                const raeumen = () => {
                    for (const e of st.architectures.slice()) {
                        if (!e || !e.blockerAABBs || !e.position || /^fahrzeug_/.test(e.type || "")) continue;
                        const dx = e.position.x - sx;
                        const dz = e.position.z - sz;
                        const l = dx * furt.ux + dz * furt.uz;
                        if (l > -6 && l < 40 && Math.abs(dx * furt.uz - dz * furt.ux) < 4) r.removeArchitecture(e);
                    }
                };
                raeumen();
                for (const c of st.creatures || []) {
                    const dx = c.position.x - sx;
                    const dz = c.position.z - sz;
                    const l = dx * furt.ux + dz * furt.uz;
                    if (l > -6 && l < 40 && Math.abs(dx * furt.uz - dz * furt.ux) < 5) c.position.y -= 500;
                }
                const fahrt = Math.atan2(furt.ux, furt.uz); // Fahrt-Richtung (sin, cos)
                st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
                if (st.playerVel) st.playerVel.setValue(0, 0, 0);
                st._fieldVy = 0;
                const gt = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x: sx, y: hh(sx, sz) + 0.5, z: sz },
                    { silent: true, precise: true, rotationY: fahrt - Math.PI / 2 }
                );
                if (!gt) throw new Error("kein GT");
                const mr = r.mountArchitecture(gt);
                if (!mr || !mr.ok) throw new Error("Aufsitzen scheiterte");
                for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
                for (let i = 0; i < 12; i++) frame();
                st.keys.w = true;
                const spur = [];
                let kamUnter = 0;
                let kamTiefe = 0;
                let tEin = null;
                for (let i = 0; i < 900; i++) {
                    frame();
                    raeumen();
                    const fz = gt._fahr;
                    if (!fz) continue;
                    const t = sichtbar(fz.x, fz.z);
                    const zeit = tMs;
                    spur.push({ t: zeit, v: Math.hypot(fz.vlong, fz.vlat), tiefe: t });
                    if (tEin === null && t >= 0.3) tEin = { zeit, v: Math.hypot(fz.vlong, fz.vlat), tiefe: t };
                    const cam = st.camera && st.camera.position;
                    if (cam) {
                        const b = r._wasserBildAt(cam.x, cam.z);
                        if (Number.isFinite(b) && cam.y < b) {
                            kamUnter++;
                            kamTiefe = Math.max(kamTiefe, b - cam.y);
                        }
                    }
                    if (tEin && zeit - tEin.zeit > 2500) break;
                    if (i % 30 === 0) await new Promise((res) => setTimeout(res, 0));
                }
                st.keys.w = false;
                r.dismountArchitecture();
                if (!tEin)
                    throw new Error(
                        `der Wagen erreichte das Wasser nicht (Furt ${furt.x.toFixed(1)}/${furt.z.toFixed(1)})`
                    );
                const nach = spur.find((p) => p.t >= tEin.zeit + 1000);
                out.wagen = {
                    furt,
                    vEin: tEin.v,
                    tiefe: tEin.tiefe,
                    v1: nach ? nach.v : NaN,
                    v2: spur.length ? spur[spur.length - 1].v : NaN,
                    kameraUnter: kamUnter,
                    kameraTiefe: kamTiefe,
                    // [s nach dem Eintauchen, m/s, m Wasser unter der Wagen-Mitte] je ~0,25 s
                    verlauf: spur
                        .filter((p) => p.t >= tEin.zeit - 500)
                        .filter((_, i) => i % 15 === 0)
                        .map((p) => [
                            +((p.t - tEin.zeit) / 1000).toFixed(2),
                            +p.v.toFixed(2),
                            +(p.tiefe > 0 ? p.tiefe : 0).toFixed(2),
                        ]),
                };
            } catch (e) {
                out.wagen = { fehler: String((e && e.message) || e) };
            }
        st.voxelWorker = worker;
    } finally {
        r.spawnArchitecture = spawnAlt;
    }
    return out;
}

function selbsttest() {
    const gruen = {
        hain: {
            takte: 1200,
            satz: 6,
            caChunks: 0,
            staemme: Array.from({ length: 7 }, (_, i) => ({ typ: "baum_eiche", id: i, x: 0, z: 0, tiefe: -0.4 })),
        },
        zensus: { werke: 80, haeuser: 12, baeume: 68, imWasser: [] },
        leser: [],
        wagen: { vEin: 11, v1: 3, tiefe: 0.61, kameraUnter: 0, kameraTiefe: 0 },
        kern: [],
    };
    const faelle = [
        ["H Stamm im Wasser", (b) => (b.hain.staemme[3].tiefe = 2.4), /H: baum_eiche #3 .* steht 2\.40 m im Wasser/],
        ["H Automat geweckt", (b) => (b.hain.caChunks = 15), /H: die Bauten am Ufer weckten den Wasser-Automaten \(15/],
        ["H leer", (b) => (b.hain.satz = 2), /H LEER/],
        [
            "Z Fundament im Wasser",
            (b) =>
                b.zensus.imWasser.push({
                    typ: "haus_x",
                    id: 9,
                    x: 1,
                    z: 2,
                    wo: "Fundament",
                    tiefe: 0.8,
                    quelle: "Dorf",
                }),
            /Z: haus_x #9 .* Fundament 0\.80 m im Wasser \(Dorf\)/,
        ],
        ["Z leer", (b) => (b.zensus.werke = 3), /Z LEER/],
        [
            "L Zwilling",
            (b) => b.leser.push("die Zwillings-Probe des Lands `_isAboveWaterAt` lebt"),
            /L: die Zwillings-Probe/,
        ],
        ["F ohne Widerstand", (b) => (b.wagen.v1 = 11.9), /F: Wagen im Wasser ohne Widerstand — 39\.60 km\/h/],
        [
            "F Kamera",
            (b) => ((b.wagen.kameraUnter = 4), (b.wagen.kameraTiefe = 0.3)),
            /F: die Verfolger-Kamera steht in 4/,
        ],
        ["F leer", (b) => (b.wagen.vEin = 1), /F LEER/],
        ["K Kern", (b) => b.kern.push("K2 …"), /K: K2/],
    ];
    let ok = urteil(JSON.parse(JSON.stringify(gruen))).length === 0;
    console.log(`  ${ok ? "✅" : "❌"} grüner Befund → 0 Täter`);
    for (const [name, gift, re] of faelle) {
        const b = JSON.parse(JSON.stringify(gruen));
        gift(b);
        const v = urteil(b);
        const t = v.some((x) => re.test(x));
        console.log(`  ${t ? "✅" : "❌"} ${name} → ${v[0] || "(kein Täter)"}`);
        if (!t) ok = false;
    }
    // die Leser-Linse gegen eingeschmuggelte Täter im echten Stamm
    const src = fs.readFileSync(path.join(__dirname, "..", "anazhRealm.js"), "utf8");
    const echt = leserUrteil(src);
    const gifte = [
        [
            "Zwilling zurück",
            (s) =>
                s.replace(
                    "    _nassAt(x, z, marge = -0.05) {",
                    "    _isAboveWaterAt(x, z) {\n        return true;\n    }\n    _nassAt(x, z, marge = -0.05) {"
                ),
            /Zwillings-Probe/,
        ],
        [
            "Bezug als Probe",
            (s) => s.replace("this._waterLevelAt(x, z, uf);", "this._waterLevelAt(x, z);"),
            /liest den Bezug/,
        ],
        [
            "Pflanze stempelt",
            (s) => s.replace("if (aabb.pflanze) return null;", "if (aabb.pflanzeX) return null;"),
            /Pflanze stempelt/,
        ],
        ["Automat immer", (s) => s.replace("if (verdraengt)\n", "if (true)\n"), /weckt den Wasser-Automaten/],
        [
            "Fahr-Schritt ohne Tiefe",
            (s) => s.replace("tiefe: this._fahrTiefe(fz) }", "}"),
            /Fahr-Schritt ohne die Tiefe/,
        ],
    ];
    const echtOk = echt.length === 0;
    console.log(`  ${echtOk ? "✅" : "❌"} der echte Stamm → ${echt.length ? echt.join(" · ") : "0 Täter"}`);
    if (!echtOk) ok = false;
    for (const [name, gift, re] of gifte) {
        const s2 = gift(src);
        const v = s2 === src ? ["(Gift griff nicht)"] : leserUrteil(s2);
        const t = v.some((x) => re.test(x));
        console.log(`  ${t ? "✅" : "❌"} Leser: ${name} → ${v[0] || "(kein Täter)"}`);
        if (!t) ok = false;
    }
    console.log(ok ? "\nWERK-IM-WASSER SELBSTTEST GRÜN" : "\nWERK-IM-WASSER SELBSTTEST ROT");
    process.exit(ok ? 0 : 1);
}

// `--nur hain,zensus,wagen` und `--furt x,z,ux,uz` (der Vergleich an DERSELBEN Furt) — Werkbank-Fragen, das Gate fährt alle.
function argListe(name) {
    const i = process.argv.indexOf(name);
    return i >= 0 && process.argv[i + 1] ? process.argv[i + 1].split(",") : null;
}

async function lauf() {
    const puppeteer = require("puppeteer");
    const http = require("http");
    const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
    const PORT = Number(process.env.WERK_WASSER_PORT || 4643);
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
    const befund = {};
    befund.leser = leserUrteil(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    require(path.join(root, "vehicle-core.js"));
    befund.kern = kernUrteil(globalThis.__vehicleCore);
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
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: softwareWebGpuArgs() });
    const seitenFehler = [];
    let exit = 2;
    try {
        const page = await browser.newPage();
        page.on("pageerror", (e) => seitenFehler.push((e.stack || e.message || String(e)).split("\n")[0]));
        await page.evaluateOnNewDocument(() => {
            window.__anazhForceFoundry = true;
            window.__anazhHeadlessNullRenderer = true;
        });
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        const out = await page.evaluate(probe, {
            ort: [-872, -1127],
            eiche: [-856, -1127],
            takte: 1200,
            hainMin: SCHWELLE.hainMin,
            tiefeStamm: SCHWELLE.tiefeStamm,
            tiefeFundament: SCHWELLE.tiefeFundament,
            suchR: 90,
            nur: argListe("--nur"),
            furt: argListe("--furt") ? argListe("--furt").map(Number) : null,
        });
        Object.assign(befund, out);
        const v = urteil(befund);
        const kurz = Object.assign({}, befund, { seitenFehler: seitenFehler.slice(0, 5) });
        console.log(JSON.stringify(kurz, null, 1));
        if (v.length) {
            console.log(`\nWERK-IM-WASSER ROT (${v.length}):`);
            for (const x of v) console.log("  ❌ " + x);
        } else console.log("\nWERK-IM-WASSER GRÜN");
        exit = v.length ? 1 : 0;
    } catch (e) {
        console.log("WERK-IM-WASSER ABBRUCH:", (e && e.message) || e);
        exit = 2;
    } finally {
        await browser.close().catch(() => {});
        server.close();
    }
    process.exit(exit);
}

if (process.argv.includes("--selftest")) selbsttest();
else lauf();
