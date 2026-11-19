#!/usr/bin/env node
// diag-pixel-zensus.cjs — DER PIXEL-ZENSUS an den Orten des Profi-Bands (Spike SICHT der EINHEIT, E7; scripts/lib/pixel-zensus.cjs):
// EINE echte Welt (`werkbank start --echt --pixel`), je Ort × Sicht einschwingen wie das Band, dann EIN Frame — je Dreieck des
// Hauptbilds gezählt: sichtbar · verdeckt · alpha-leer · rückseitig · unter dem Bildpunkt · außerhalb · Rest, je Klasse des Täters.
//
//   node scripts/diag-pixel-zensus.cjs [--orte wiese,genesis] [--sichten ego,third] [--port 4791] [--seite http://localhost:4312]
//                                      [--K 4] [--datei f.json] [--ohne-start]   (die GPU nur über gpu-lauf.sh)
"use strict";
const path = require("path");
const fs = require("fs");
const { werkbankTor, werkbankRuf } = require("./lib/welt-boot.cjs");
const PZ = require("./lib/pixel-zensus.cjs");

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf("--" + k);
    return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d;
};
const hat = (k) => argv.includes("--" + k);
const PORT = Number(opt("port", 4791));
const SEITE = opt("seite", "http://localhost:4312");
const ORTE = opt("orte", "wiese,genesis").split(",");
const SICHTEN = opt("sichten", "ego,third").split(",");
const K = Number(opt("K", 4));
const DATEI = opt("datei", null);

// das Einschwingen wie das Band (werkbank `bandEinschwingen`): die volle Welt, bis der Bau ruht — Seiten-Kontext
function einschwingen(k) {
    return (async () => {
        const st = r.state;
        const vorDecke = st.perfTargetMs;
        st.perfTargetMs = 1000;
        const t0 = performance.now();
        const dl = t0 + (k.capMs || 240000);
        let takte = 0,
            ruhig = 0,
            vor = null,
            o = {};
        const stand = () => {
            let instanzen = 0;
            if (st.archInstanceGroups) for (const g of st.archInstanceGroups.values()) instanzen += g.mesh ? g.mesh.count : 0;
            const ls = st.perfSense ? +st.perfSense.loadScale.toFixed(3) : 1;
            return { chunks: st.voxelChunks ? st.voxelChunks.size : 0, instanzen, ungebaut: __ungebaut(), loadScale: ls };
        };
        const ziel = Math.min(12, st.chunkRingRadius || 4);
        while (performance.now() < dl) {
            if (st._activeRingRadius < ziel) st._activeRingRadius = ziel;
            const bild = __werkTakt();
            takte++;
            o = __einschwingOffen(r);
            const s = stand();
            if (s.loadScale < 1) o.loadScale = s.loadScale;
            if (vor) for (const key of Object.keys(s)) if (s[key] !== vor[key]) o[key] = `${vor[key]}→${s[key]}`;
            vor = s;
            ruhig = Object.keys(o).length ? 0 : ruhig + 1;
            if (takte >= 40 && ruhig >= (k.ruhig || 30)) break;
            await bild;
        }
        st.perfTargetMs = vorDecke;
        return { eingeschwungen: ruhig >= (k.ruhig || 30), takte, ms: Math.round(performance.now() - t0), offen: Object.keys(o).length ? o : null };
    })();
}

const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) : "–");

// DER ORT OHNE `/umstellen` (probe4 hing 30 min im Warten der Aufstellung auf einen Streu-Chunk): der Spieler am Platz der Spec,
// der Blick des Orts, der Takt des Orts, die Sicht — das Einschwingen danach hat seine Frist (capMs)
function stellen(o) {
    return (() => {
        window.__ortTakt = o.takt || [];
        window.__ortStell = null;
        window.__ortSchritt = () => {
            const pm = r.state.playerMesh.position;
            for (const m of window.__ortTakt) r[m](pm);
        };
        window.__anazhAutoSettlement = o.dorfZug;
        r.state.playerMesh.position.set(o.x, r._voxelSurfaceY(o.x, o.z) + 1.8, o.z);
        if (Number.isFinite(o.gier)) {
            r.state.yaw = o.gier;
            r.state.pitch = 0;
        }
        r.setCameraMode(o.kamera);
        return { p: r.state.playerMesh.position.toArray().map((v) => +v.toFixed(1)), modus: r.state.cameraMode };
    })();
}

async function main() {
    let tor = null;
    const BAND = require("./lib/band-urteil.cjs");
    const starte = async (ort) => {
        if (hat("ohne-start")) return;
        if (tor) tor.stop();
        console.log(`STUFE ${ort}: die Werkbank startet`);
        tor = werkbankTor(PORT, ["--echt", "--pixel", "--seite", SEITE, "--ort", ort]);
        await tor.bereit;
        await evalRuf(PZ.PIXEL_ZENSUS + " return true;", "pixel-zensus-install");
    };
    const rufe = (weg, b) => werkbankRuf(PORT, weg, b);
    const evalRuf = async (code, name) => {
        const a = await rufe("/eval", { code, name });
        if (!a.ergebnis && a.fehler) throw new Error(name + ": " + a.fehler);
        return a.ergebnis;
    };
    const ergebnisse = [];
    try {
        if (hat("ohne-start")) await evalRuf(PZ.PIXEL_ZENSUS + " return true;", "pixel-zensus-install");
        for (const ort of ORTE) {
            await starte(ort);
            const { ort: spec, haushalt } = BAND.ladeSpec(ort);
            if (!spec.spieler) throw new Error(`Messort ${ort}: ohne Spieler-Platz in der Spec (Pose aus dem Plan) — der Zensus stellt ihn nicht`);
            for (const sicht of SICHTEN) {
                const st0 = { x: spec.spieler[0], z: spec.spieler[1], gier: spec.blick ? BAND.ortGier(spec) : null, takt: spec.ortTakt || [], dorfZug: !!spec.dorfZug, kamera: haushalt.sichten[sicht].kamera };
                const u = await evalRuf(`return (${stellen.toString()})(${JSON.stringify(st0)});`, "pixel-stellen");
                console.log(`STUFE ${ort}/${sicht}: gestellt ${JSON.stringify(u)}`);
                const ein = await evalRuf(`return (${einschwingen.toString()})({ capMs: 240000, ruhig: 30 });`, "pixel-einschwingen");
                console.log(`STUFE ${ort}/${sicht}: eingeschwungen ${JSON.stringify(ein)}`);
                console.log(`STUFE ${ort}/${sicht}: Draw-Zähler`);
                const dz = await evalRuf(`return __drawZensus({ top: 4 }).then((z) => ({ haupt: z.passe.haupt, gesamt: z.gesamt }));`, "pixel-drawzensus");
                console.log(`STUFE ${ort}/${sicht}: Zensus`);
                const z = await evalRuf(`return __pixelZensus({ K: ${K}, haufen: 128 });`, "pixel-zensus");
                if (!z || z.fehler) throw new Error(`${ort}/${sicht}: ${JSON.stringify(z).slice(0, 600)}`);
                const g = z.gesamt;
                ergebnisse.push({ ort, sicht, einschwingen: ein, drawZensus: dz, zensus: z });
                console.log(
                    `PIXEL ${ort}/${sicht}: gezeichnet ${g.tris} (Draw-Zähler haupt ${dz.haupt ? dz.haupt.tris : "?"}) · ohne Pixel ${pct(g.tris - g.sichtbar, g.tris)} % — ` +
                        `verdeckt ${pct(g.verdeckt, g.tris)} · unter-px ${pct(g.unterPx, g.tris)} · außerhalb ${pct(g.ausserhalb, g.tris)} · rückseitig ${pct(g.rueckseitig, g.tris)} · ` +
                        `alpha-leer ${pct(g.alphaLeer, g.tris)} · rest ${pct(g.rest, g.tris)} | Haufen ohne Pixel ${pct(g.trisInHaufenOhne, g.tris)} % der Dreiecke ` +
                        `(davon verdeckt ${pct(g.trisInHaufenVerdeckt, g.tris)}) | Treue ${JSON.stringify(z.treue)} | ${z.zuege} Züge, ${z.gesamtMs} ms`
                );
                for (const [pi, s] of (z.hauptStruktur || []).entries())
                    console.log(`  haupt-Pass ${pi}: ${s.w}x${s.h}x${s.samples} Tiefe ${s.tiefe} (#${s.tiefeNr}, ${s.tiefeLaden}) Farben ${JSON.stringify(s.farben)} · ${s.zuege} Züge · ${s.tris} Dreiecke · ${s.klassen.join(" ")}`);
                for (const k of z.klassen.slice(0, 14))
                    console.log(`  ${k.klasse} [${k.art || "-"}]: ${k.tris} · sichtbar ${pct(k.sichtbar, k.tris)} · verdeckt ${pct(k.verdeckt, k.tris)} · unter-px ${pct(k.unterPx, k.tris)} · außerhalb ${pct(k.ausserhalb, k.tris)} · rück ${pct(k.rueckseitig, k.tris)} · alpha ${pct(k.alphaLeer, k.tris)}`);
                if (DATEI) fs.writeFileSync(path.resolve(DATEI), JSON.stringify(ergebnisse, null, 1));
            }
        }
    } finally {
        if (DATEI) {
            fs.mkdirSync(path.dirname(path.resolve(DATEI)), { recursive: true });
            fs.writeFileSync(path.resolve(DATEI), JSON.stringify(ergebnisse, null, 1));
        }
        if (tor) tor.stop();
    }
}
main().then(
    () => process.exit(0),
    (e) => {
        console.error("PIXEL-ZENSUS BRICHT: " + (e && e.stack ? e.stack : e));
        process.exit(1);
    }
);
