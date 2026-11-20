#!/usr/bin/env node
// mess-sicht.cjs — DIE MESSUNG DES SPIKES SICHT (E7, spike/einheit-sicht/BLATT.md): S1 Dreiecke · S3 Züge · S4 Frame-p95 im ABAB
// (A = der Stand vor dem Schnitt, B = die Sicht, je Boot eine frische Welt, gleiche Kamera), S2 · S5 in EINER Welt von B: der
// Flug mit der Sicht gegen denselben Flug ohne sie (der frühe Zug blind, kein Bündel verdeckt) und ohne die Körper der Sicht
// (die Maske) — jedes Bild des Flugs am selben Versatz der zeitlichen Auflösung, die Welt unter der Bühne.
//
//   node spike/einheit-sicht/mess-sicht.cjs --a http://localhost:4397 --b http://localhost:4398 [--port 4798] [--boots 4]
//        [--orte wiese] [--flug dorf] [--datei mess.json] [--bilder spike/einheit-sicht]       (die GPU nur über gpu-lauf.sh)
"use strict";
const path = require("path");
const fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const { werkbankTor, werkbankRuf } = require(path.join(ROOT, "scripts/lib/welt-boot.cjs"));
const BAND = require(path.join(ROOT, "scripts/lib/band-urteil.cjs"));

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf("--" + k);
    return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d;
};
const PORT = Number(opt("port", 4798));
const SEITE = { A: opt("a", "http://localhost:4397"), B: opt("b", "http://localhost:4398") };
const BOOTS = Number(opt("boots", 4));
const ORTE = opt("orte", "wiese").split(",").filter(Boolean);
const FLUG = opt("flug", "dorf");
const DATEI = opt("datei", null);
const BILDER = path.resolve(opt("bilder", path.join(ROOT, "spike/einheit-sicht")));

// der Ort ohne `/umstellen` (wie der Pixel-Zensus): Spieler am Platz der Spec, Blick des Orts, Takt des Orts, die Sicht
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


// S1 · S3 · S4 an der Pose: der Draw-Zähler (Hauptbild: Züge, Dreiecke, der Bau-Satz), dann die Bank — n Einzel-Bilder ohne rAF,
// je Bild bis die GPU fertig ist, unter der Bühne und der Skala des Geräts (wie `gpuBank`)
function messen(k) {
    return (async () => {
        const rend = r.state.renderer;
        rend.setAnimationLoop(null);
        __buehne();
        const z = await __drawZensus({ alle: true });
        const bau = z.klassen.filter((x) => x.klasse === "bauSatz");
        const satz = (feld) => bau.reduce((s, x) => s + ((x.jeTris && x.jeTris.haupt) || 0) * (feld === "tris") + ((x.je && x.je.haupt) || 0) * (feld === "cmd"), 0);
        const skalaOffen = !(window.__offen ||= new Set()).has("skala") && !!window.__offen.add("skala");
        const zeiten = [];
        try {
            await __bankRunde(5);
            for (let i = 0; i < (k.n || 60); i++) zeiten.push((await __bankRunde(1)).jeFrame);
        } finally {
            if (skalaOffen) window.__offen.delete("skala");
        }
        const s = zeiten.slice().sort((a, b) => a - b);
        const q = (p) => +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(2);
        return {
            haupt: z.passe.haupt,
            gesamt: z.gesamt,
            bau: { tris: satz("tris"), cmd: satz("cmd") },
            frame: { n: s.length, p50: q(0.5), p95: q(0.95), max: +s[s.length - 1].toFixed(2) },
            sicht: r._sichtTiefeZahl ? r._sichtTiefeZahl() : null,
            kamera: z.kamera,
        };
    })();
}

// S2 · S5 (Seite, nur B): DER FLUG — Pose 0 schwingt 32 Bilder ein (die Geschichte der zeitlichen Auflösung), dann `schritte`
// Bilder je `schrittM` Meter längs des Blicks. Drei Fahrten am selben Versatz: OHNE die Körper der Sicht (Bau-Sätze und Bündel
// ruhen: die Maske), BLIND (alles gezeichnet), MIT der Sicht. Je Bild: der Anteil der Masken-Pixel, deren Luma (Rec. 709)
// MIT gegen BLIND um > 8/255 abweicht — Bild 0 ist S2 (ruhend), der Rest S5 (in Bewegung).
function flug(o) {
    return (async () => {
        const T = window.THREE;
        const rend = st.renderer;
        rend.setAnimationLoop(null);
        __buehne();
        window.__halten(["tiere", "bewohner", "wagen", "leib", "spiegel", "skala"]);
        const db = rend.getDrawingBufferSize(new T.Vector2());
        const BW = Math.round(db.x),
            BH = Math.round(db.y),
            N = BW * BH;
        const rt = new T.RenderTarget(BW, BH, { depthBuffer: true, samples: 0 });
        const prevOut = rend.getOutputRenderTarget(),
            prevZiel = rend.getRenderTarget();
        const cam = st.camera;
        const p0 = new T.Vector3().fromArray(o.p),
            vorn = new T.Vector3().fromArray(o.l).sub(p0).normalize();
        const setze = (i) => {
            const p = p0.clone().addScaledVector(vorn, i * o.schrittM);
            cam.position.copy(p);
            cam.lookAt(p.clone().add(vorn));
            cam.updateMatrixWorld(true);
        };
        const roh = { beginn: r._sichtTiefeBeginn, buendel: r._sichtBuendelVerdeckt, satz: r._sichtSatz, abbild: r._tiefenAbbild };
        const zurueck = () => {
            for (const k of ["_sichtTiefeBeginn", "_sichtBuendelVerdeckt", "_sichtSatz", "_tiefenAbbild"]) delete r[k];
        };
        const modus = {
            mit: () => {},
            // VORHER (E9): der Zeitpunkt der Leser bricht nie — Wasser, Feld-Pass und Rauch lesen das Abbild vom Bruch der Sicht
            vorher: () => {
                r._tiefenAbbild = function (frame, abbild, punkt) {
                    if (punkt === "leser") return;
                    return roh.abbild.call(this, frame, abbild, punkt);
                };
            },
            blind: () => {
                r._sichtTiefeBeginn = function (k) {
                    const ok = roh.beginn.call(this, k);
                    if (this._sichtTiefeZ) this._sichtTiefeZ.frisch = false;
                    return ok;
                };
                r._sichtBuendelVerdeckt = () => false;
            },
            ohne: () => {
                r._sichtSatz = function (s, a, S) {
                    if (s.mesh.visible) {
                        s.mesh.visible = false;
                        S.ab.push(s.mesh);
                    }
                };
                r._sichtBuendelVerdeckt = () => true;
            },
        };
        const luma = (u8) => {
            const L = new Uint8Array(N);
            for (let i = 0, j = 0; i < N; i++, j += 4) L[i] = Math.round(0.2126 * u8[j] + 0.7152 * u8[j + 1] + 0.0722 * u8[j + 2]);
            return L;
        };
        const bildUrl = (u8) => {
            const c = document.createElement("canvas");
            c.width = BW;
            c.height = BH;
            const g = c.getContext("2d");
            const d = g.createImageData(BW, BH);
            d.data.set(u8);
            g.putImageData(d, 0, 0);
            return c.toDataURL("image/png");
        };
        const fahrt = async (art, je) => {
            modus[art]();
            try {
                const tn = st.traaNode;
                if (tn) {
                    tn._jitterIndex = 0;
                    tn._historyRenderTarget?.setSize(1, 1);
                }
                if (st._traaR) st._traaR.neu = true;
                const lu = st.lodUniforms;
                if (lu?.uDitherT) lu.uDitherT.value = 0;
                r._schattenAlleNeu();
                rend.setOutputRenderTarget(rt);
                setze(0);
                for (let k = 0; k < 32; k++) __loopBild();
                for (let i = 0; i < o.schritte; i++) {
                    if (i) setze(i);
                    // je Schuss die Schatten-Map neu (Lehre 17): sonst hängt die Lage jeder Kaskade am Takt der Fahrt
                    r._schattenAlleNeu();
                    __loopBild();
                    je(i, await __zielLesen(rt, BW, BH));
                }
            } finally {
                rend.setOutputRenderTarget(prevOut);
                rend.setRenderTarget(prevZiel);
                zurueck();
            }
        };
        const ohne = [],
            maske = [],
            blind = [],
            aus = { schirm: [BW, BH], schritte: o.schritte, schrittM: o.schrittM, je: [], bilder: {} };
        const sz0 = r._sichtTiefeZahl();
        await fahrt("ohne", (i, u8) => ohne.push(luma(u8)));
        await fahrt("blind", (i, u8) => {
            const L = luma(u8),
                M = new Uint8Array(N);
            let n = 0;
            for (let p = 0; p < N; p++) if (Math.abs(L[p] - ohne[i][p]) > 2) (M[p] = 1), n++;
            maske.push({ M, n });
            blind.push(L);
            if (i === 0) aus.bilder.blind0 = bildUrl(u8);
        });
        const sz1 = r._sichtTiefeZahl();
        let schlimmst = { i: -1, anteil: -1 };
        await fahrt("mit", (i, u8) => {
            const L = luma(u8),
                { M, n } = maske[i];
            let d = 0,
                dAlle = 0;
            for (let p = 0; p < N; p++) {
                const x = Math.abs(L[p] - blind[i][p]) > 8;
                if (x) dAlle++;
                if (x && M[p]) d++;
            }
            const anteil = n ? d / n : 0;
            // DAS VORZEICHEN: ein fehlender Haufen färbt einseitig, ein Versatz des Musters (Halme, Lichtflecken) beidseitig
            let hell = 0;
            for (let p = 0; p < N; p++) if (M[p] && L[p] - blind[i][p] > 8) hell++;
            aus.je.push({ i, maske: n, ab8: d, anteil: +anteil.toFixed(5), ab8Bild: dAlle, hell, dunkel: d - hell });
            if (i === 0) aus.bilder.mit0 = bildUrl(u8);
            // das Unterschieds-Bild (Maske grau, abweichende Pixel rot) des schlimmsten Bilds und des letzten (das Paar je Stand)
            const letzt = i === o.schritte - 1;
            if (anteil > schlimmst.anteil || letzt) {
                if (anteil > schlimmst.anteil) schlimmst = { i, anteil };
                const v = new Uint8Array(N * 4);
                for (let p = 0, j = 0; p < N; p++, j += 4) {
                    const x = Math.abs(L[p] - blind[i][p]) > 8;
                    v[j] = x ? 255 : M[p] ? 90 : L[p] >> 2;
                    v[j + 1] = x ? 0 : M[p] ? 90 : L[p] >> 2;
                    v[j + 2] = x ? 0 : M[p] ? 90 : L[p] >> 2;
                    v[j + 3] = 255;
                }
                if (schlimmst.i === i) [aus.bilder.schlimmst, aus.bilder.schlimmstMit] = [bildUrl(v), bildUrl(u8)];
                if (letzt) [aus.bilder.letzt, aus.bilder.letztMit] = [bildUrl(v), bildUrl(u8)];
            }
        });
        const sz2 = r._sichtTiefeZahl();
        // A GEGEN A: derselbe Flug noch einmal blind — der Boden des Rauschens (Wind, Schatten-Takt, zeitliche Auflösung) je Bild
        // auf derselben Maske, gegen den ersten blinden Flug
        await fahrt("blind", (i, u8) => {
            const L = luma(u8),
                { M, n } = maske[i];
            let d = 0;
            for (let p = 0; p < N; p++) if (M[p] && Math.abs(L[p] - blind[i][p]) > 8) d++;
            aus.je[i].rauschen = n ? +(d / n).toFixed(5) : 0;
        });
        // VORHER: derselbe Flug mit der Sicht OHNE den Bruch der Leser (E9 vor dem Schnitt) gegen den ersten blinden Flug
        let schlimmstV = { i: -1, anteil: -1 };
        await fahrt("vorher", (i, u8) => {
            const L = luma(u8),
                { M, n } = maske[i];
            let d = 0;
            for (let p = 0; p < N; p++) if (M[p] && Math.abs(L[p] - blind[i][p]) > 8) d++;
            const anteil = n ? d / n : 0;
            aus.je[i].vorher = +anteil.toFixed(5);
            if (anteil > schlimmstV.anteil) {
                schlimmstV = { i, anteil };
                const v = new Uint8Array(N * 4);
                for (let p = 0, j = 0; p < N; p++, j += 4) {
                    const x = Math.abs(L[p] - blind[i][p]) > 8;
                    v[j] = x ? 255 : M[p] ? 90 : L[p] >> 2;
                    v[j + 1] = x ? 0 : M[p] ? 90 : L[p] >> 2;
                    v[j + 2] = x ? 0 : M[p] ? 90 : L[p] >> 2;
                    v[j + 3] = 255;
                }
                aus.bilder.schlimmstVorher = bildUrl(v);
                aus.bilder.schlimmstVorherMit = bildUrl(u8);
            }
        });
        aus.schlimmstVorher = schlimmstV;
        const d = (a, b) => Object.fromEntries(Object.keys(b).map((k) => [k, b[k] - (a[k] || 0)]));
        aus.sicht = { blind: d(sz0, sz1), mit: d(sz1, sz2) };
        aus.schlimmst = schlimmst;
        rt.dispose();
        return aus;
    })();
}

// E9 IM SELBEN BOOT (Seite): die Kamera am Platz des Flugs (Pose 0), je Zustand (mit = der Bruch der Leser, vorher = ohne) die
// EINE Bank-Runde (`__bankRunde`: n Frames ohne rAF, dann auf die GPU warten) im Wechsel ABBA; danach je Zustand EINE gezählte
// Runde: Render-Pässe, Züge (draw · drawIndexed · indirekt) und Bündel-Abspielungen je Frame an den WebGPU-Prototypen.
function bankE9(o) {
    return (async () => {
        const T = window.THREE;
        const rend = st.renderer;
        rend.setAnimationLoop(null);
        __buehne();
        const cam = st.camera;
        const p0 = new T.Vector3().fromArray(o.p),
            vorn = new T.Vector3().fromArray(o.l).sub(p0).normalize();
        cam.position.copy(p0);
        cam.lookAt(p0.clone().add(vorn));
        cam.updateMatrixWorld(true);
        const roh = r._tiefenAbbild;
        const zustand = {
            mit: () => delete r._tiefenAbbild,
            vorher: () => {
                r._tiefenAbbild = function (frame, abbild, punkt) {
                    if (punkt === "leser") return;
                    return roh.call(this, frame, abbild, punkt);
                };
            },
        };
        const je = { mit: [], vorher: [] };
        try {
            zustand.mit();
            await __bankRunde(6);
            for (let k = 0; k < o.runden; k++)
                for (const z of k % 2 ? ["vorher", "mit"] : ["mit", "vorher"]) {
                    zustand[z]();
                    await __bankRunde(4);
                    je[z].push(await __bankRunde(o.n));
                }
            const med = (a, key) => {
                const v = a.map((x) => x[key]).sort((x, y) => x - y);
                return +((v[(v.length - 1) >> 1] + v[v.length >> 1]) / 2).toFixed(3);
            };
            const aus = {};
            for (const z of ["mit", "vorher"])
                aus[z] = { gpuMs: med(je[z], "jeFrame"), cpuMs: med(je[z], "cpuJeFrame"), runden: je[z].map((x) => +x.jeFrame.toFixed(2)) };
            // die Zählung je Zustand (eigene Runde, nie in der Zeit)
            const RP = GPURenderPassEncoder.prototype,
                CE = GPUCommandEncoder.prototype;
            const namen = ["draw", "drawIndexed", "drawIndirect", "drawIndexedIndirect", "executeBundles"];
            const zaehle = async (z) => {
                zustand[z]();
                await __bankRunde(4);
                const c = { paesse: 0, draw: 0, drawIndexed: 0, drawIndirect: 0, drawIndexedIndirect: 0, executeBundles: 0 };
                const alt = namen.map((m) => RP[m]);
                const bp = CE.beginRenderPass;
                namen.forEach((m, i) => {
                    RP[m] = function (...a) {
                        c[m]++;
                        return alt[i].apply(this, a);
                    };
                });
                CE.beginRenderPass = function (...a) {
                    c.paesse++;
                    return bp.apply(this, a);
                };
                try {
                    await __bankRunde(o.nZaehl);
                } finally {
                    namen.forEach((m, i) => (RP[m] = alt[i]));
                    CE.beginRenderPass = bp;
                }
                for (const k of Object.keys(c)) c[k] = +(c[k] / o.nZaehl).toFixed(2);
                return c;
            };
            aus.zaehlung = { mit: await zaehle("mit"), vorher: await zaehle("vorher") };
            return aus;
        } finally {
            delete r._tiefenAbbild;
        }
    })();
}

async function main() {
    const ergebnis = { abab: [], flug: null, start: new Date().toISOString() };
    const schreib = () => DATEI && fs.writeFileSync(path.resolve(DATEI), JSON.stringify(ergebnis, null, 1));
    let tor = null;
    const rufe = (weg, b) => werkbankRuf(PORT, weg, b);
    const evalRuf = async (code, name) => {
        const a = await rufe("/eval", { code, name });
        if (!a.ergebnis && a.fehler) throw new Error(name + ": " + a.fehler);
        return a.ergebnis;
    };
    const starte = async (seite, ort) => {
        if (tor) tor.stop();
        tor = werkbankTor(PORT, [...(argv.includes("--software") ? [] : ["--echt"]), "--seite", SEITE[seite], "--ort", ort]);
        await tor.bereit;
    };
    const aufstellen = async (ort, sicht) => {
        const { ort: spec, haushalt } = BAND.ladeSpec(ort);
        const o = { x: spec.spieler[0], z: spec.spieler[1], gier: spec.blick ? BAND.ortGier(spec) : null, takt: spec.ortTakt || [], dorfZug: !!spec.dorfZug, kamera: haushalt.sichten[sicht].kamera };
        const u = await evalRuf(`return (${stellen.toString()})(${JSON.stringify(o)});`, "mess-stellen");
        const ein = await rufe("/einschwingen", { capMs: 240000, ruhig: 30 }); // das EINE Einschwingen des Bands (werkbank `bandEinschwingen`)
        return { u, ein };
    };
    try {
        // S1 · S3 · S4: ABAB, je Ort und Seite BOOTS frische Welten
        for (const ort of ORTE)
            for (let i = 0; i < BOOTS; i++)
                for (const seite of ["A", "B"]) {
                    await starte(seite, ort);
                    const a = await aufstellen(ort, "third");
                    const m = await evalRuf(`return (${messen.toString()})({ n: 60 });`, "mess-messen");
                    ergebnis.abab.push({ ort, sicht: "third", boot: i, seite, ...a, ...m });
                    console.log(
                        `MESS ${ort}/third ${seite}${i}: Hauptbild ${m.haupt.cmd} Züge · ${m.haupt.tris} Dreiecke · Bau-Satz ${m.bau.tris} Dreiecke in ${m.bau.cmd} Zügen · ` +
                            `Frame p50 ${m.frame.p50} p95 ${m.frame.p95} ms · eingeschwungen ${a.ein.eingeschwungen} (${a.ein.ms} ms)` +
                            (m.sicht ? ` · Sicht ${JSON.stringify(m.sicht)}` : "")
                    );
                    schreib();
                }
        // S1 am Dorf (beide Seiten, ein Boot) und S2 · S5 (der Flug in B)
        if (FLUG) {
            for (const seite of argv.includes("--nur-b") ? ["B"] : ["A", "B"]) {
                await starte(seite, FLUG);
                const a = await aufstellen(FLUG, "third");
                const m = await evalRuf(`return (${messen.toString()})({ n: 60 });`, "mess-messen");
                ergebnis.abab.push({ ort: FLUG, sicht: "third", boot: 0, seite, ...a, ...m });
                console.log(`MESS ${FLUG}/third ${seite}: Hauptbild ${m.haupt.cmd} Züge · ${m.haupt.tris} Dreiecke · Bau-Satz ${m.bau.tris} Dreiecke in ${m.bau.cmd} Zügen · Frame p95 ${m.frame.p95} ms`);
                schreib();
                if (seite !== "B") continue;
                const kam = await evalRuf(
                    "const c = st.camera; const v = c.getWorldDirection(new THREE.Vector3()); v.y = 0; v.normalize(); return { p: c.position.toArray(), l: c.position.clone().add(v).toArray() };",
                    "mess-kamera"
                );
                const f = await evalRuf(`return (${flug.toString()})(${JSON.stringify({ p: kam.p, l: kam.l, schritte: 24, schrittM: 1.5 })});`, "mess-flug");
                fs.mkdirSync(BILDER, { recursive: true });
                for (const [k, url] of Object.entries(f.bilder)) {
                    const datei = path.join(BILDER, `${FLUG}-third-${k}.png`);
                    fs.writeFileSync(datei, Buffer.from(url.split(",")[1], "base64"));
                    f.bilder[k] = path.relative(ROOT, datei).split(path.sep).join("/");
                }
                ergebnis.flug = { ort: FLUG, kamera: kam, ...f };
                const bank = await evalRuf(`return (${bankE9.toString()})(${JSON.stringify({ p: kam.p, l: kam.l, n: 24, runden: 8, nZaehl: 6 })});`, "mess-bank-e9");
                ergebnis.bankE9 = bank;
                console.log(
                    `BANK E9 ${FLUG}/third (ABBA × 8, n 24): GPU je Frame mit Leser-Bruch ${bank.mit.gpuMs} ms · vorher ${bank.vorher.gpuMs} ms ` +
                        `(CPU ${bank.mit.cpuMs} / ${bank.vorher.cpuMs}) · Runden mit ${bank.mit.runden.join(" ")} · vorher ${bank.vorher.runden.join(" ")} · ` +
                        `je Frame mit ${JSON.stringify(bank.zaehlung.mit)} · vorher ${JSON.stringify(bank.zaehlung.vorher)}`
                );
                console.log(`FLUG ${FLUG}/third VORZEICHEN je Bild heller/dunkler: ` + f.je.map((x) => `${x.i}:${x.hell}/${x.dunkel}`).join(" "));
                const ueber = f.je.filter((x) => x.anteil > 0.01).length;
                // über dem Rauschen: ein Bild, in dem die Sicht mehr als 1 % der Maske über den Boden von A gegen A hinaus ändert
                const ueberR = f.je.filter((x) => x.anteil - (x.rauschen || 0) > 0.01).length;
                const ueberV = f.je.filter((x) => x.vorher - (x.rauschen || 0) > 0.01).length;
                console.log(
                    `FLUG ${FLUG}/third VORHER (ohne Leser-Bruch): schlimmstes Bild ${f.schlimmstVorher.i} ${(100 * f.schlimmstVorher.anteil).toFixed(3)} % · ` +
                        `über dem Rauschen: ${ueberV} von ${f.je.length} · je Bild vorher/mit/Rauschen ` +
                        f.je.map((x) => `${x.i}:${(100 * x.vorher).toFixed(2)}/${(100 * x.anteil).toFixed(2)}/${(100 * (x.rauschen || 0)).toFixed(2)}`).join(" ")
                );
                console.log(
                    `FLUG ${FLUG}/third: S2 Bild 0 ${(100 * f.je[0].anteil).toFixed(3)} % der ${f.je[0].maske} Masken-Pixel > 8/255 · S5 schlimmstes Bild ${f.schlimmst.i} ` +
                        `${(100 * f.schlimmst.anteil).toFixed(3)} % · Bilder über 1 %: ${ueber} von ${f.je.length} · über dem Rauschen: ${ueberR} · ` +
                        `je Bild mit/Rauschen ${f.je.map((x) => `${x.i}:${(100 * x.anteil).toFixed(2)}/${(100 * (x.rauschen || 0)).toFixed(2)}`).join(" ")}`
                );
                schreib();
            }
        }
    } finally {
        schreib();
        if (tor) tor.stop();
    }
}
main().then(
    () => process.exit(0),
    (e) => {
        console.error("MESS-SICHT BRICHT: " + (e && e.stack ? e.stack : e));
        process.exit(1);
    }
);
