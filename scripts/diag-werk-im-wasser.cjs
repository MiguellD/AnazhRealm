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
//   S — DAS HAUS AUS DEM SATZ (Gegenprüfung 10.10.): „bau mir ein haus am wasser" an Uferorten um den Schau-Ort, die Furt
//       −935/−1070 und den See −906/−634 (je Zentrum bis zu drei trockene Standorte 18–40 m vom Zentrum). Befund am Kopf
//       f5714efb: 11 von 11 Fundamenten im Wasser (6–67 von 81 Raster-Punkten, bis 0,92–3,68 m) — der Satz fragte die Mitte,
//       und die Spieler-Klemme der Wurzel schob das Haus vom Spieler weg ins Wasser. Die Häuser misst Z.  Soll ≥ 5 Häuser
//   Z — DER ZENSUS DER WERKE: jedes Werk, das während der Probe gesetzt wird (Wald und Unterholz beim Strömen, der Hain, die
//       Bau-Eiche, die Häuser der Sätze, „dorf" am Fluss: `spawnSettlement` seed 7, 18 Häuser, Brunnen, Stände; kein
//       Fahrzeug). Der Setz-Punkt `spawnArchitecture` ist Beobachtungs-Punkt: ein Stamm misst das Wasser über seinem Fuß VOR
//       seinem Stempel; ein anderes Werk hält dort das Wasser über dem Boden im Umkreis von 18 m fest (1-m-Gitter, Bild UND
//       Gesetz — ein Stempel verdrängt danach das gezeichnete), und gemessen wird, wenn es STEHT: jede Box seiner Hülle, die
//       den Boden trägt (die Solids des Gesetzbuchs samt Fundament-Podest — das Haus, mit dem der Körper kollidiert; nie die
//       Grundriss-Rechnung des Wirts), auf einem Raster ≤ 1 m.                                              Soll 0 im Wasser
//   L — DIE LESER (kommentarfrei, Node): keine Zwillings-Probe des Lands mehr (`_isAboveWaterAt` fiel), `_waterLevelAt`
//       nur noch als Bezug der Ufer-Bänder (jeder Aufruf mit `aus`), der Wald plant gegen das Gesetz des Wassers
//       (`_atlasWaterLevelAt`), die Natur-Wand fragt das Land (`_landAt`), die Pflanze stempelt keine Wasser-Zelle, ein Bau
//       weckt den Automaten nur, wenn sein Stempel Wasser verdrängt, und beide Fahr-Schritte reichen die Tiefe am Wagen.
//       Das Fundament: die Wurzel (`spawnArchitecture`) urteilt nach ihrer Spieler-Klemme über jedes Werk mit Grundriss-Gesetz
//       (`_werkImWasser` → `_fundamentLand`), die Siedlung fragt dasselbe `_fundamentLand`, der Satz, der Tempel und das
//       Bauplan-Programm suchen ihren Ort über `_werkOrtSuchen`.
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
    satzOrteMin: 6, // Uferorte, an denen der Haus-Satz gesprochen wird
    satzHaeuserMin: 5, // Häuser, die der Haus-Satz an ihnen setzen muss (sonst misst Z keins)
    satzAbstandMax: 12, // m vom Haus zum nächsten Wasser: „am Wasser" bleibt am Wasser
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
    // S
    const SA = b.satz;
    if (!SA || SA.fehler) v.push(`S: ${SA ? SA.fehler : "die Satz-Probe lief nicht"}`);
    else {
        if (!(SA.orte >= S.satzOrteMin))
            v.push(`S LEER: nur ${SA.orte} Uferorte für den Haus-Satz gefunden (Soll ≥ ${S.satzOrteMin})`);
        if (!(SA.haeuser >= S.satzHaeuserMin))
            v.push(
                `S LEER: der Haus-Satz setzte ${SA.haeuser} Häuser an ${SA.orte} Uferorten (Soll ≥ ${S.satzHaeuserMin})`
            );
        for (const h of SA.fern || [])
            v.push(
                `S: ${h.typ} #${h.id} (${m(h.x)}/${m(h.z)}) steht ${m(h.abstand)} m vom Wasser — „am Wasser" (Soll ≤ ${S.satzAbstandMax} m)`
            );
    }
    // Z
    const Z = b.zensus;
    if (!Z || Z.fehler) v.push(`Z: ${Z ? Z.fehler : "der Zensus lief nicht"}`);
    else {
        if (!(Z.werke >= S.zensusMin)) v.push(`Z LEER: nur ${Z.werke} Werke gesetzt (Soll ≥ ${S.zensusMin})`);
        if (!(Z.haeuser >= S.haeuserMin)) v.push(`Z LEER: nur ${Z.haeuser} Häuser im Zensus (Soll ≥ ${S.haeuserMin})`);
        for (const w of Z.ohneHuelle || [])
            v.push(`Z LEER: ${w.typ} #${w.id} (${w.quelle}) stand ohne Hülle — sein Fundament blieb ungemessen`);
        for (const w of Z.imWasser || [])
            v.push(
                `Z: ${w.typ} #${w.id} (${m(w.x)}/${m(w.z)}) ${w.wo} ${m(w.tiefe)} m im Wasser${w.punkte ? ` (${w.punkte})` : ""} (${w.quelle})`
            );
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
    if (!wand || !/_stammFussLand\(/.test(wand))
        v.push("die Natur-Wand (`_naturWand`) fragt den Fuß des Stamms nicht (`_stammFussLand`)");
    const fuss = fnBody(src, /\n {4}_stammFussLand\([^)]*\) \{/);
    if (!fuss || !/_landAt\(/.test(fuss) || !/STAMM_FUSS_M/.test(fuss))
        v.push("`_stammFussLand` fragt nicht das Land auf dem Fuß-Kreis (`_landAt` × `STAMM_FUSS_M`)");
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
    // Das Fundament (Gegenprüfung 10.10.): die Wurzel urteilt NACH ihrer Spieler-Klemme, jeder Sucher fragt dasselbe Land.
    if (spawn) {
        const iK = spawn.indexOf("_structureSpawnPos(");
        const iW = spawn.indexOf("_werkImWasser(");
        if (iW < 0) v.push("die Wurzel (`spawnArchitecture`) urteilt nicht über das Fundament (`_werkImWasser`)");
        else if (iK < 0 || iW < iK) v.push("die Wurzel urteilt über das Fundament VOR ihrer Spieler-Klemme");
    }
    const wiw = fnBody(src, /\n {4}_werkImWasser\([^)]*\) \{/);
    if (!wiw || !/_fundamentLand\(/.test(wiw))
        v.push("`_werkImWasser` fragt nicht das Land des Fundaments (`_fundamentLand`)");
    const fl = fnBody(src, /\n {4}_fundamentLand\([^)]*\) \{/);
    if (!fl || !/_fundamentRaster\(/.test(fl) || !/_landAt\(/.test(fl))
        v.push("`_fundamentLand` fragt nicht jeden Raster-Punkt des Fundaments (`_fundamentRaster` × `_landAt`)");
    const slot = fnBody(src, /\n {4}_spawnSettlementSlot\([^)]*\) \{/);
    if (!slot || !/_fundamentLand\(/.test(slot))
        v.push("die Siedlung (`_spawnSettlementSlot`) fragt nicht das Land des Fundaments (`_fundamentLand`)");
    for (const [wer, re] of [
        ["der Satz (`_dslSpawnStudioItems`)", /\n {4}_dslSpawnStudioItems\([^)]*\) \{/],
        ["der Tempel (`spawn_temple`)", /\n {12}spawn_temple: \(\[[^\]]*\], ctx\) => \{/],
        ["das Bauplan-Programm (`spawn_blueprint`)", /\n {12}spawn_blueprint: \(\[[^\]]*\], ctx\) => \{/],
    ]) {
        const body = fnBody(src, re);
        if (!body || !/_werkOrtSuchen\(/.test(body))
            v.push(`${wer} sucht keinen Ort, der das ganze Fundament trägt (\`_werkOrtSuchen\`)`);
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
    // ── Z: der Setz-Punkt als Beobachtungs-Punkt ──
    // Ein Stamm misst VOR seinem Stempel; jedes andere Werk (kein Fahrzeug) hält am Setz-Punkt das Wasser über dem Boden im
    // Umkreis von `gitterR` m fest (1-m-Gitter, Bild UND Gesetz) und wird gemessen, wenn es steht (`werkeMessen`: seine Hülle).
    const zensus = { werke: 0, haeuser: 0, baeume: 0, imWasser: [], ohneHuelle: [], quelle: "strom" };
    const werke = [];
    const R = A.gitterR;
    const gitter = (x0, z0) => {
        const n = 2 * R + 1;
        const t = new Float32Array(n * n);
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) t[i * n + j] = sichtbar(x0 - R + i, z0 - R + j, true);
        return { x0, z0, n, t };
    };
    const imGitter = (G, x, z) => {
        const i = Math.round(x - G.x0 + R);
        const j = Math.round(z - G.z0 + R);
        if (i < 0 || j < 0 || i >= G.n || j >= G.n) return sichtbar(x, z, true); // jenseits des Gitters: das Wasser von jetzt
        return G.t[i * G.n + j];
    };
    const spawnAlt = r.spawnArchitecture;
    r.spawnArchitecture = function (type, position, opts) {
        const natur = r._istNatur({ type });
        const werk = !natur && !/^fahrzeug_/.test(String(type));
        let fussT = null;
        let G = null;
        if (position && natur) {
            const g = r._voxelSurfaceY(position.x, position.z);
            if (Number.isFinite(g)) fussT = stammTiefe(position.x, position.z, g, 0.5, true);
        } else if (position && werk) G = gitter(position.x, position.z);
        const e = spawnAlt.apply(this, arguments);
        if (e && (fussT !== null || G)) {
            zensus.werke++;
            if (natur) zensus.baeume++;
            else if (/^haus_/.test(type)) zensus.haeuser++;
            if (G) werke.push({ e, G, quelle: zensus.quelle });
            else if (fussT > A.tiefeStamm && zensus.imWasser.length < 40)
                zensus.imWasser.push({
                    typ: type,
                    id: e.id,
                    x: e.position.x,
                    z: e.position.z,
                    wo: "Fuß",
                    tiefe: fussT,
                    // der Täter beim Namen: der erste Rufer hinter der Natur-Wand (Wald-Schlange, Promotion, Satz …)
                    quelle: `${zensus.quelle} · ${
                        String(new Error().stack)
                            .split("\n")
                            .map((l) => (/at (?:\S+\.)?(\w+)/.exec(l.trim()) || [])[1])
                            .filter((f) => f && !/^(spawnArchitecture|_naturSetzen|Error)$/.test(f))[0] || "?"
                    }`,
                });
        }
        return e;
    };
    // Jedes festgehaltene Werk, wenn es steht: ein Haus wartet auf die Hülle seines Gesetzbuchs (`_hausHuelle`, die Solids
    // der Stufe 0), jedes andere misst seine Blocker. Gemessen wird jede Box, die den Boden trägt (Unterkante ≤ 0,6 m über
    // der Haus-Basis: das Podest, die Wände des Erdgeschosses, Treppe und Tritt — nie ein Balkon), auf einem Raster ≤ 1 m.
    const werkeMessen = async () => {
        const dl = performance.now() + A.huelleMs;
        const fertig = (w) =>
            w.done ||
            !st.architectures.includes(w.e) ||
            (/^haus_/.test(w.e.type) ? !!w.e._hausHuelle : !!(w.e.blockerAABBs && w.e.blockerAABBs.length));
        while (performance.now() < dl && !werke.every(fertig)) {
            for (let i = 0; i < 30; i++)
                try {
                    frame();
                } catch (_e) {}
            for (const w of werke) if (!fertig(w)) r._rebuildArchitectureMesh(w.e);
            await new Promise((res) => setTimeout(res, 50));
        }
        for (const w of werke) {
            const e = w.e;
            if (w.done || !st.architectures.includes(e)) continue;
            w.done = true;
            const boxen = (e.blockerAABBs || []).filter(
                (b) => b && Number.isFinite(b.botY) && b.botY <= e.position.y - 0.5 + 0.6
            );
            if (!boxen.length || (/^haus_/.test(e.type) && !e._hausHuelle)) {
                zensus.ohneHuelle.push({ typ: e.type, id: e.id, quelle: w.quelle });
                continue;
            }
            let max = -Infinity;
            let nass = 0;
            let n = 0;
            for (const b of boxen) {
                const o = b.obb || {
                    cx: (b.minX + b.maxX) / 2,
                    cz: (b.minZ + b.maxZ) / 2,
                    c: 1,
                    s: 0,
                    hx: (b.maxX - b.minX) / 2,
                    hz: (b.maxZ - b.minZ) / 2,
                };
                const ni = Math.max(1, Math.ceil(2 * o.hx));
                const nj = Math.max(1, Math.ceil(2 * o.hz));
                for (let i = 0; i <= ni; i++)
                    for (let j = 0; j <= nj; j++) {
                        const lx = o.hx * ((2 * i) / ni - 1);
                        const lz = o.hz * ((2 * j) / nj - 1);
                        // lokal = (Δx·c − Δz·s, Δx·s + Δz·c) → Welt = (lx·c + lz·s, −lx·s + lz·c)
                        const t = imGitter(w.G, o.cx + lx * o.c + lz * o.s, o.cz - lx * o.s + lz * o.c);
                        n++;
                        if (t > A.tiefeFundament) nass++;
                        if (t > max) max = t;
                    }
            }
            if (max > A.tiefeFundament && zensus.imWasser.length < 40)
                zensus.imWasser.push({
                    typ: e.type,
                    id: e.id,
                    x: e.position.x,
                    z: e.position.z,
                    wo: "Fundament",
                    tiefe: max,
                    punkte: `${nass} von ${n} Punkten der Hülle`,
                    quelle: w.quelle,
                });
        }
        zensus.gemessen = werke.filter((w) => w.done).length;
    };
    // ── S: der Haus-Satz an Uferorten um ein Zentrum (die Häuser misst Z) ──
    const satz = { orte: 0, haeuser: 0, saetze: [], fern: [] };
    const wasserAbstand = (x, z) => {
        for (let rr = 0.5; rr <= 30; rr += 0.5)
            for (let k = 0; k < 48; k++) {
                const a = (k / 48) * Math.PI * 2;
                if (sichtbar(x + Math.cos(a) * rr, z + Math.sin(a) * rr, true) > A.tiefeFundament) return rr;
            }
        return Infinity;
    };
    const satzProbe = async (cx, cz) => {
        const LAND = (x, z) => r._landAt(x, z, 0.4) && !r._nassAt(x, z, 0.4);
        const orte = [];
        for (let k = 0; k < 24 && orte.length < A.satzJe; k++) {
            const a = (k / 24) * Math.PI * 2;
            for (let rr = 18; rr <= 40; rr += 4) {
                const px = cx + Math.cos(a) * rr;
                const pz = cz + Math.sin(a) * rr;
                if (LAND(px, pz) && LAND(px + 3, pz) && LAND(px - 3, pz) && LAND(px, pz + 3) && LAND(px, pz - 3)) {
                    orte.push([px, pz]);
                    k += 5;
                    break;
                }
            }
        }
        const o = document.getElementById("chat-output");
        for (const [PX, PZ] of orte) {
            for (let i = 0; i < 200; i++) {
                st.playerMesh.position.set(PX, r._voxelSurfaceY(PX, PZ) + 1.8, PZ);
                try {
                    frame();
                } catch (_e) {}
                if (i % 20 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            st.playerMesh.position.set(PX, r._voxelSurfaceY(PX, PZ) + 1.8, PZ);
            st.yaw = Math.PI / 2;
            const v0 = new Set(st.architectures);
            zensus.quelle = "Haus-Satz";
            const t0 = performance.now();
            r.processChatCommand("bau mir ein haus am wasser");
            const ms = performance.now() - t0; // der Satz samt Ort-Suche und Spawn, synchron
            const neu = st.architectures.filter((e) => e && !v0.has(e) && /^haus_/.test(e.type));
            for (let i = 0; i < 60; i++) {
                try {
                    frame();
                } catch (_e) {}
                if (i % 20 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            zensus.quelle = "strom";
            satz.orte++;
            satz.haeuser += neu.length;
            const zeile = o && o.lastElementChild ? o.lastElementChild.textContent : null;
            const haeuser = neu.map((e) => {
                const ab = wasserAbstand(e.position.x, e.position.z);
                if (ab > A.satzAbstandMax)
                    satz.fern.push({ typ: e.type, id: e.id, x: e.position.x, z: e.position.z, abstand: ab });
                return { typ: e.type, id: e.id, x: +e.position.x.toFixed(1), z: +e.position.z.toFixed(1), abstand: ab };
            });
            satz.saetze.push({ spieler: [+PX.toFixed(1), +PZ.toFixed(1)], ms: +ms.toFixed(1), chat: zeile, haeuser });
        }
    };
    // Strömen an einen Ort (Sync-Bau, Worker ausgehängt — wie die Wasser-Linse)
    const stroemen = async (X, Z, nachlauf) => {
        st.playerMesh.position.set(X, r._voxelSurfaceY(X, Z) + 1.8, Z);
        const t0 = performance.now();
        let last = -1;
        let still = performance.now();
        for (;;) {
            st.playerMesh.position.set(X, r._voxelSurfaceY(X, Z) + 1.8, Z);
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
        for (let i = 0; i < nachlauf; i++) {
            try {
                frame();
            } catch (_e) {}
            if (i % 20 === 0) await new Promise((res) => setTimeout(res, 0));
        }
    };
    try {
        const X = A.ort[0];
        const Z = A.ort[1];
        const worker = st.voxelWorker;
        st.voxelWorker = null;
        await stroemen(X, Z, 240);
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
            } catch (e) {
                zensus.fehler = "Dorf: " + String((e && e.message) || e);
            }
        // ── S: der Haus-Satz am Schau-Ort und an der Furt (dieselbe gestreamte Welt), gemessen, solange sie steht ──
        if (soll("satz"))
            try {
                for (const [cx, cz] of A.satzNah) await satzProbe(cx, cz);
            } catch (e) {
                satz.fehler = String((e && e.stack) || e).split("\n")[0];
            }
        if (soll("zensus") || soll("satz")) await werkeMessen();
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
        // ── S: der Haus-Satz am See (−906/−634, eine eigene gestreamte Welt) ──
        if (soll("satz"))
            try {
                for (const [cx, cz] of A.satzFern) {
                    await stroemen(cx, cz, 120);
                    await satzProbe(cx, cz);
                }
                await werkeMessen();
            } catch (e) {
                satz.fehler = String((e && e.stack) || e).split("\n")[0];
            }
        if (soll("zensus") || soll("satz")) out.zensus = zensus;
        if (soll("satz")) out.satz = satz;
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
        zensus: { werke: 80, haeuser: 12, baeume: 68, imWasser: [], ohneHuelle: [] },
        satz: { orte: 9, haeuser: 9, fern: [] },
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
            "Z Haus aus dem Satz im Wasser",
            (b) =>
                b.zensus.imWasser.push({
                    typ: "haus_alemannisch",
                    id: 4,
                    x: -926,
                    z: -1072.2,
                    wo: "Fundament",
                    tiefe: 3.68,
                    punkte: "67 von 81 Punkten der Hülle",
                    quelle: "Haus-Satz",
                }),
            /Z: haus_alemannisch #4 .* Fundament 3\.68 m im Wasser \(67 von 81 Punkten der Hülle\) \(Haus-Satz\)/,
        ],
        [
            "Z ohne Hülle",
            (b) => b.zensus.ohneHuelle.push({ typ: "haus_x", id: 7, quelle: "Haus-Satz" }),
            /Z LEER: haus_x #7 \(Haus-Satz\) stand ohne Hülle/,
        ],
        ["S keine Orte", (b) => (b.satz.orte = 2), /S LEER: nur 2 Uferorte/],
        ["S keine Häuser", (b) => (b.satz.haeuser = 0), /S LEER: der Haus-Satz setzte 0 Häuser/],
        [
            "S fern vom Wasser",
            (b) => b.satz.fern.push({ typ: "haus_x", id: 3, x: 0, z: 0, abstand: 31 }),
            /S: haus_x #3 .* steht 31\.00 m vom Wasser/,
        ],
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
            "Wurzel ohne Fundament-Wand",
            (s) =>
                s.replace(
                    "if (position && opts.id == null && this._werkImWasser(type, position, opts, seed)) {",
                    "if (position && opts.id == null && false) {"
                ),
            /Wurzel .* urteilt nicht über das Fundament/,
        ],
        [
            "Natur-Wand fragt die Achse",
            (s) =>
                s.replace(
                    'return name && !this._stammFussLand(position.x, position.z, 0.05) ? "wasser" : false;',
                    'return name && !this._landAt(position.x, position.z, 0.05) ? "wasser" : false;'
                ),
            /die Natur-Wand .* fragt den Fuß des Stamms nicht/,
        ],
        [
            "Satz fragt die Mitte",
            (s) => s.replace("const q = this._werkOrtSuchen(name, ziel, opts, wurf);", "const q = ziel;"),
            /der Satz .* sucht keinen Ort/,
        ],
        [
            "Siedlung fragt die Mitte",
            (s) =>
                s.replace(
                    "if (!this._fundamentLand(wx, wz, ry, fp, tu)) return null;",
                    "if (!this._landAt(wx, wz, 0.2)) return null;"
                ),
            /die Siedlung .* fragt nicht das Land des Fundaments/,
        ],
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

// `--nur hain,zensus,satz,wagen` und `--furt x,z,ux,uz` (der Vergleich an DERSELBEN Furt) — Werkbank-Fragen, das Gate fährt alle.
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
            gitterR: 18,
            huelleMs: 60000,
            satzJe: 3,
            satzAbstandMax: SCHWELLE.satzAbstandMax,
            satzNah: [
                [-872, -1127],
                [-935, -1070],
            ],
            satzFern: [[-906, -634]],
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
