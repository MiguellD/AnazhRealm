#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-klang-zensus.cjs — DIE KLANG-LINSE (npm run gate:klang-zensus, Welle 5 Klang)
//
// Die Frage je Ort: WAS hört man dort, und trägt jede klingende Quelle ein GESETZ —
// oder ist sie ein Stamm-Literal? Und kostet sie nur, solange man sie hört?
//
//  (O) DIE ORTE aus dem Gesetz gefunden (Standard-Saat, Null-Renderer): Wiese = die
//      Mess-Wiese (−900/−850) · Seeufer = der nächste trockene Punkt, 3–7 m vor stillem
//      Wasser · Waldinneres = der Punkt höchster Kronen-Deckung (1 − _canopyLightAt) ·
//      Dorf = 4 m neben dem nächsten Glut-Bau (Teile aus Material „glut").
//  (Z) DER ZENSUS je Ort (Bühne Mittag · Sonne · Sommer, Tiere halten, die Musik ruht):
//      jede gestartete Quelle (Oszillator/Puffer/Konstante) mit ihrem ERZEUGER (Datei +
//      Funktion aus dem Stapel), die Umwelt-Stimmen des Gesetzes (Pegel, an/aus) und der
//      AUSGANG (Abgriff am Master: Pegel je Oktavband).
//  (G) GESETZ-HERKUNFT: jede laufende Quelle ist im Gesetzbuch gebaut (klang-core.js im
//      Stapel) oder ein Wirt-Leser eines benannten klang-Gesetzes (Musik ← klang:GENRES ·
//      Schritt ← klang:SCHRITT_TIMBRE). Alles andere ist ein STAMM-LITERAL — beim Namen.
//  (H) HÖRBAR-KOSTEN: jede dauernd laufende Quelle (Schleife, Oszillator ohne Stop) gehört
//      einer Gesetz-Stimme über der Hörschwelle; Quellen-Zahl = Σ der hörbaren Stimmen.
//  (S) SOLL-KLANG je Ort (Pegel am Welt-Bus, die Lage am Ohr bei mittlerer Böe):
//      Wiese: wind ≥ −46 · vogel ≥ −52 · kein Wasser · Glut ≤ Wind · Seeufer: ufer ≥ −32
//      und ≥ wind + 6 · Wald: laub ≥ −44 und ≥ Wiese.laub + 8 · Dorf: glut ≥ −34.
//      Dazu der OFFLINE-RENDER des Studio-Graphen (umweltGraph auf OfflineAudioContext):
//      je Stimme gemessener Pegel = Gesetz-Pegel (±1,5 dB) und Schwerpunkt im Band.
//  (K) KOSTEN je Takt: die Welt-Abfragen des Klang-Takts (Boden · Wasser · Strömung ·
//      Fluss-Segmente · Bauten-Lesungen) bleiben gleich, wenn 4000 ferne Bauten und 200
//      ferne Fluss-Läufe dazukommen — Kosten an Hörbares, nie an die Weltgröße.
//  (E) EREIGNISSE: Treffer · Wasser strömt · eine Form singt · eine Form verklingt · ein
//      Tier ruft — je einmal über den echten Weg ausgelöst: jede Quelle aus dem Gesetzbuch,
//      keine Verbindung am Master vorbei direkt an den Ausgang.
//  (L) LAB = WELT: das Klang-Studio (worlds/klang) spielt seine Orte über
//      __klangCore.umweltGraph, sein Seeufer trägt das Ufer, und jeder Lab-Ort hält
//      dasselbe SOLL wie der Welt-Ort.
//  SELBST-TEST (--selftest, die Linse feuert): ein eingeschmuggelter Drohn-Oszillator
//  (zwillingDrohne) → G beim Namen · eine stumme Schleife (stummeSchleife) → H · das
//  Wasser am Seeufer weg → S · ein Glut-Umlauf über ALLE Bauten → K · eine Ereignis-Glocke
//  aus dem Stamm am Master vorbei (zwillingGlocke) → E. Stubs restauriert.
//
//   node scripts/diag-klang-zensus.cjs [--selftest] [--aufnahme <ordner>] [--json <datei>]
//   (--aufnahme: je Ort 6 s Ausgang als WAV + Spektrogramm-PNG, dazu der Lab-Ort offline;
//    KLANG_WURZEL=<baum> misst einen anderen Arbeitsbaum unter derselben Linse)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
// KLANG_WURZEL: eine Überlagerung — liegt eine Datei dort, gewinnt sie (z. B. die Stände eines älteren Commits);
// vorher↔nachher unter derselben Linse, denselben Bedingungen.
const UEBER = process.env.KLANG_WURZEL ? path.resolve(process.env.KLANG_WURZEL) : null;
const PORT = Number(process.env.DIAG_PORT) || 7452;
const argv = process.argv.slice(2);
const SELBST = argv.includes("--selftest");
const opt = (k) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : null;
};
const AUFNAHME = opt("--aufnahme");
const JSON_AUS = opt("--json");

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const rel = decodeURIComponent(p);
    const ueber = UEBER ? path.join(UEBER, rel) : null;
    const fp = ueber && ueber.startsWith(UEBER) && fs.existsSync(ueber) ? ueber : path.join(root, rel);
    if (!fp.startsWith(root) && !(UEBER && fp.startsWith(UEBER))) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// DER QUELLEN-ABGRIFF (vor jedem Seiten-Skript): jede erzeugte Quelle mit Stapel, Start, Stop, Ende — und jede
// Verbindung direkt an den Ausgang (ctx.destination) mit ihrem Stapel (am Master vorbei?).
function quellenAbgriff() {
    if (window.__klangQuellen) return;
    const Q = (window.__klangQuellen = []);
    const D = (window.__klangAusgang = []);
    const proto = window.BaseAudioContext && BaseAudioContext.prototype;
    if (!proto) return;
    const conn = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (ziel) {
        if (ziel && this.context && ziel === this.context.destination)
            D.push({ ctx: this.context, stapel: (new Error().stack || "").split("\n").slice(2, 6) });
        return conn.apply(this, arguments);
    };
    for (const art of ["createOscillator", "createBufferSource", "createConstantSource"]) {
        const org = proto[art];
        proto[art] = function () {
            const n = org.apply(this, arguments);
            const stapel = (new Error().stack || "").split("\n").slice(2, 7);
            const e = { art, stapel, start: null, stop: null, ende: false, loop: false, freq: null, ctx: this, knoten: n };
            Q.push(e);
            const s0 = n.start;
            const s1 = n.stop;
            n.start = function () {
                e.start = this.context.currentTime;
                e.loop = !!this.loop;
                if (this.frequency) e.freq = this.frequency.value;
                return s0.apply(this, arguments);
            };
            n.stop = function (when) {
                e.stop = Number.isFinite(when) && when > 0 ? when : this.context.currentTime;
                return s1.apply(this, arguments);
            };
            n.addEventListener("ended", () => (e.ende = true));
            return n;
        };
    }
}

// DER SEITEN-WERKZEUGKASTEN (in die Spiel-Seite): Orte finden, umstellen, messen.
function werkzeug() {
    const r = window.anazhRealm;
    const st = r.state;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const W = {};
    // Ein Frame des echten Loops (Bühne fest, Tiere halten).
    W.takt = () => {
        try {
            window.__buehne();
            r._gameLoopTick(performance.now());
        } catch (_e) {}
    };
    W.umstellen = async (x, z) => {
        st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
        let stabil = 0;
        let last = -1;
        let takte = 0;
        const dl = performance.now() + 120000;
        while (performance.now() < dl) {
            W.takt();
            st.playerMesh.position.x = x;
            st.playerMesh.position.z = z;
            takte++;
            const sz = st.voxelChunks ? st.voxelChunks.size : 0;
            if (sz === last) stabil++;
            else {
                stabil = 0;
                last = sz;
            }
            if (takte >= 40 && stabil >= 15) break;
            await sleep(20);
        }
        // Die Kamera blickt nach Norden (−z), 3 m hinter und 1,6 m über dem Spieler: das Panorama ist definiert.
        const cam = st.camera;
        if (cam) {
            const p = st.playerMesh.position;
            cam.position.set(p.x, p.y + 1.6, p.z + 3);
            cam.lookAt(p.x, p.y + 1.2, p.z - 10);
            cam.updateMatrixWorld(true);
        }
        return { takte, chunks: last };
    };
    W.nass = (x, z) => {
        const b = r._voxelSurfaceY(x, z);
        return b !== null && Number.isFinite(b) && b < r._waterLevelAt(x, z) - 0.05;
    };
    W.fliesst = (x, z) => !!r._waterFlowAt(x, z);
    W.glutVolumen = (e) => {
        const bp = st.blueprints && st.blueprints[e.type];
        if (!bp || !Array.isArray(bp.parts)) return 0;
        let v = 0;
        for (const p of bp.parts) if (p && p.material === "glut" && p.size) v += p.size.x * p.size.y * p.size.z;
        return v;
    };
    // DIE ORTE aus dem Gesetz.
    W.orte = async (wx, wz) => {
        const orte = { wiese: { x: wx, z: wz } };
        // Seeufer: nächster trockener Punkt, der 3–7 m vor stillem Wasser liegt.
        let best = null;
        for (let r0 = 16; r0 <= 480 && !best; r0 += 16) {
            for (let a = 0; a < 64; a++) {
                const ang = (a / 64) * Math.PI * 2;
                const x = wx + Math.sin(ang) * r0;
                const z = wz + Math.cos(ang) * r0;
                if (!W.nass(x, z) || W.fliesst(x, z)) continue;
                // vom Wasser zurück Richtung Wiese, bis trocken
                const ux = (wx - x) / r0;
                const uz = (wz - z) / r0;
                for (let s = 1; s < 40; s++) {
                    const qx = x + ux * s;
                    const qz = z + uz * s;
                    if (!W.nass(qx, qz)) {
                        const fx = qx + ux * 4;
                        const fz = qz + uz * 4;
                        if (!W.nass(fx, fz)) best = { x: fx, z: fz, wasser: { x, z } };
                        break;
                    }
                }
                if (best) break;
            }
            await sleep(0);
        }
        if (best) orte.seeufer = best;
        // Waldinneres: höchste Kronen-Deckung auf trockenem Land.
        let wald = null;
        for (let gx = -240; gx <= 240; gx += 12) {
            for (let gz = -240; gz <= 240; gz += 12) {
                const x = wx + gx;
                const z = wz + gz;
                const y = r._voxelSurfaceY(x, z);
                if (y === null || W.nass(x, z)) continue;
                const deck = 1 - r._canopyLightAt(x, z, y);
                if (!wald || deck > wald.deckung) wald = { x, z, deckung: +deck.toFixed(3) };
            }
            await sleep(0);
        }
        if (wald) orte.wald = wald;
        // Dorf: der nächste Glut-Bau (aus der gestreamten Welt um die Wiese), 4 m davor.
        let glut = null;
        for (const e of st.architectures || []) {
            if (!e || !e.position || !(W.glutVolumen(e) > 0)) continue;
            const d = Math.hypot(e.position.x - wx, e.position.z - wz);
            if (!glut || d < glut.d) glut = { e, d };
        }
        if (glut) {
            const ex = glut.e.position.x;
            const ez = glut.e.position.z;
            const d = Math.max(1e-3, glut.d);
            orte.dorf = { x: ex + ((wx - ex) / d) * 4, z: ez + ((wz - ez) / d) * 4, glut: { x: ex, z: ez, typ: glut.e.type } };
        }
        return orte;
    };
    // DER AUSGANGS-ABGRIFF: Oktavband-Pegel (dBFS, Mono-Summe) über `sek` Sekunden, der Loop läuft.
    W.ausgang = async (sek) => {
        const s = st.symphony;
        const an = s.ctx.createAnalyser();
        an.fftSize = 8192;
        an.smoothingTimeConstant = 0;
        s.masterGain.connect(an);
        const N = an.frequencyBinCount;
        const fd = new Float32Array(N);
        const td = new Float32Array(an.fftSize);
        const baender = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
        const leistung = new Float64Array(baender.length);
        let rmsSum = 0;
        let proben = 0;
        const dl = performance.now() + sek * 1000;
        while (performance.now() < dl) {
            W.takt();
            await sleep(90);
            an.getFloatFrequencyData(fd);
            an.getFloatTimeDomainData(td);
            let q = 0;
            for (let i = 0; i < td.length; i++) q += td[i] * td[i];
            rmsSum += q / td.length;
            const hz = s.ctx.sampleRate / an.fftSize;
            for (let k = 1; k < N; k++) {
                const f = k * hz;
                const p = Math.pow(10, fd[k] / 10);
                for (let b = 0; b < baender.length; b++)
                    if (f >= baender[b] / Math.SQRT2 && f < baender[b] * Math.SQRT2) leistung[b] += p;
            }
            proben++;
        }
        s.masterGain.disconnect(an);
        const db = (v) => (v > 0 ? +(10 * Math.log10(v)).toFixed(1) : -200);
        return {
            dbfs: db(rmsSum / Math.max(1, proben)),
            baender: Object.fromEntries(baender.map((b, i) => [b, db(leistung[i] / Math.max(1, proben))])),
        };
    };
    // Stapel → [{fn, datei}] (Funktion + Datei je Rahmen).
    W.frames = (stapel) =>
        stapel.map((z) => {
            const m = /^\s*at (?:async )?(?:new )?(?:(\S+) \()?(.*?)\)?$/.exec(z);
            if (!m) return { fn: "?", datei: "?" };
            const d = /([^/?]+\.(?:js|cjs|html))/.exec(m[2]);
            return { fn: (m[1] || "(anonym)").replace(/^.*\./, ""), datei: d ? d[1] : m[2].slice(0, 24) };
        });
    // Die EREIGNIS-KLÄNGE der Welt, je einmal ausgelöst über ihre echten Wege: welche Quellen entstehen, wer baut sie,
    // und wer verbindet direkt an den Ausgang (am Master vorbei)?
    W.ereignisse = () => {
        const s = st.symphony;
        const out = [];
        const fang = (art, fn) => {
            const a = window.__klangQuellen.length;
            const b = window.__klangAusgang.length;
            try {
                fn();
            } catch (e) {
                out.push({ art, fehler: String((e && e.message) || e) });
                return;
            }
            out.push({
                art,
                quellen: window.__klangQuellen
                    .slice(a)
                    .filter((e) => e.ctx === s.ctx)
                    .map((e) => ({ art: e.art, frames: W.frames(e.stapel) })),
                amAusgang: window.__klangAusgang
                    .slice(b)
                    .filter((e) => e.ctx === s.ctx)
                    .map((e) => W.frames(e.stapel)),
            });
        };
        fang("treffer", () => r._playKampfOneShot({ härte: 1, dichte: 0.2 }));
        fang("wasser", () => r._playWaterReactionPing());
        fang("abschied", () => r._playArchitectureFarewellPing({ type: "kristall_geode" }));
        fang("singen", () => {
            st.blueprints.__klangOrb = {
                name: "__klangOrb",
                label: "Linsen-Orb",
                builtIn: false,
                parts: [{ shape: "sphere", material: "quarz", opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }] }],
            };
            if (st.worldJournal && st.worldJournal.seen && st.worldJournal.seen.delete) st.worldJournal.seen.delete("singing:__klangOrb");
            r._applyCompoundWorldEffects("__klangOrb");
            delete st.blueprints.__klangOrb;
        });
        fang("tier", () => {
            // ein Wesen 3 m neben dem Ohr (leerer Körper → die Bezugslänge des Gesetzes)
            const c = new window.THREE.Object3D();
            c.position.set(st.playerMesh.position.x + 3, st.playerMesh.position.y, st.playerMesh.position.z);
            if (typeof r._tierRuf === "function") r._tierRuf(c, "freude");
            else r.playCreaturePing("happy");
        });
        return out;
    };
    // Die laufenden Quellen jetzt (gestartet, nicht beendet, Stop noch nicht erreicht).
    W.laufend = () => {
        const s = st.symphony;
        const jetzt = s.ctx ? s.ctx.currentTime : 0;
        const um = s.umwelt;
        const knoten = um && um.graph && um.graph.knoten;
        return window.__klangQuellen
            .filter((e) => e.ctx === s.ctx && e.start !== null && !e.ende && (e.stop === null || e.stop > jetzt))
            .map((e) => {
                const frames = W.frames(e.stapel);
                return {
                    art: e.art,
                    // dauernd = läuft ohne gesetztes Ende (Schleife oder Oszillator ohne Stop); ein gesetzter Stop ist
                    // ein Ausklingen (die Rampe des Verstummens), kein Dauer-Läufer.
                    dauernd: e.stop === null && (e.loop || e.art !== "createBufferSource"),
                    freq: e.freq,
                    frames,
                    gesetzKnoten: !!(knoten && knoten.has(e.knoten)),
                };
            });
    };
    // ±∞ reist über die Brücke als null (und null > −64 ist wahr — Lehre 17): −∞ (Pegel) wird −999, +∞ (Abstand)
    // wird 1e9 — beide bleiben auf ihrer Seite jeder Schwelle.
    W.endlich = (o) =>
        JSON.parse(JSON.stringify(o, (k, v) => (v === Infinity ? 1e9 : v === -Infinity ? -999 : v)));
    W.zensus = () => (typeof r._klangZensus === "function" && r._klangZensus() ? W.endlich(r._klangZensus()) : null);
    W.mischung = (lage) => W.endlich(window.__klangCore.umweltMischung(lage));
    return W;
}

// Die Wirt-Leser benannter klang-Gesetze (der Wirt baut die Quelle, das Gesetz trägt die Zahlen).
const WIRT_LESER = {
    _lofiPlayChord: "klang:GENRES",
    _lofiPlayMelody: "klang:GENRES",
    _lofiPlayBass: "klang:GENRES",
    _lofiKick: "klang:GENRES",
    _lofiSnare: "klang:GENRES",
    _lofiHihat: "klang:GENRES",
    _playSchrittOneShot: "klang:SCHRITT_TIMBRE",
};
// SOLL je Ort (dB am Welt-Bus, Lage bei mittlerer Böe; der Master legt −9 dB darauf, die Musik liegt bei
// −27 dBFS — die Welt trägt 10–18 dB darunter).
const SOLL = {
    wiese: (m) => [
        ["wind ≥ −46", m.wind.db >= -46],
        ["vogel ≥ −52", m.vogel.db >= -52],
        ["kein Wasser (Ufer/Fluss/Fall)", !(m.ufer.db > -64) && !(m.fluss.db > -64) && !(m.fall.db > -64)],
        ["Glut trägt nicht (≤ wind)", !(m.glut.db > m.wind.db)],
    ],
    seeufer: (m) => [
        ["ufer ≥ −32", m.ufer.db >= -32],
        ["ufer ≥ wind + 6", m.ufer.db >= m.wind.db + 6],
    ],
    wald: (m, alle) => [
        ["laub ≥ −44", m.laub.db >= -44],
        ["laub ≥ Wiese.laub + 8", alle.wiese ? m.laub.db >= alle.wiese.laub.db + 8 : false],
    ],
    dorf: (m) => [["glut ≥ −34", m.glut.db >= -34]],
};
// Band je Stimme (spektraler Schwerpunkt des Offline-Renders, Hz).
const BAND = {
    wind: [80, 1200],
    laub: [1500, 7000],
    ufer: [60, 900],
    fluss: [300, 3000],
    fall: [60, 900],
    regen: [1500, 7500],
    glut: [250, 4000],
    vogel: [2000, 6000],
    grille: [3500, 5600],
};

async function messeOrt(page, name, ort, stubs) {
    return page.evaluate(
        async (name, ort, stubs) => {
            const r = window.anazhRealm;
            const W = window.__klangW;
            const st = r.state;
            const P = Object.getPrototypeOf(r);
            const alt = {};
            if (stubs && stubs.ohneWasser) {
                alt._waterLevelAt = P._waterLevelAt;
                P._waterLevelAt = () => -1e9;
            }
            try {
                const um = await W.umstellen(ort.x, ort.z);
                // Einschwingen: der Ring läuft voll, die Stimmen rampen ein.
                const dl = performance.now() + 2500;
                while (performance.now() < dl) {
                    W.takt();
                    await new Promise((res) => setTimeout(res, 30));
                }
                const aus = await W.ausgang(2.0);
                const laufend = W.laufend();
                const zensus = W.zensus();
                const bp = st.playerMesh.position;
                let baeume = 0;
                for (const e of st.architectures || []) {
                    if (e && e._lodSpecies && e.position && Math.hypot(e.position.x - bp.x, e.position.z - bp.z) < 15)
                        baeume++;
                }
                return { name, ort, um, aus, laufend, zensus, baeume };
            } finally {
                if (alt._waterLevelAt) P._waterLevelAt = alt._waterLevelAt;
            }
        },
        name,
        ort,
        stubs || null
    );
}

// OFFLINE-RENDER über den Studio-Graphen: je Stimme solo, Pegel + Schwerpunkt; die Mischung aus der Lage
// bei mittlerer Böe.
async function offlineRender(page, lage) {
    return page.evaluate(async (lage) => {
        const K = window.__klangCore;
        if (!K || typeof K.umweltGraph !== "function") return null;
        const mix = K.umweltMischung(lage);
        const out = {};
        for (const name of Object.keys(mix)) {
            if (!(mix[name].db >= K.UMWELT.hoerschwelleDb)) continue;
            const sr = 48000;
            // Das Fenster deckt die längste Schleife der Stimme (spärliche Texturen — Vögel, Knistern — mitteln nur
            // über den ganzen Umlauf), dazu 1,5 s Rampe.
            const S = K.UMWELT.stimmen[name];
            const sek = 1.5 + Math.max.apply(null, [].concat(S.sek));
            const ctx = new OfflineAudioContext(2, Math.ceil(sr * sek), sr);
            const g = K.umweltGraph(ctx, ctx.destination);
            const solo = {};
            for (const k of Object.keys(mix)) solo[k] = k === name ? mix[k] : Object.assign({}, mix[k], { db: -Infinity });
            g.anwenden(solo, 0);
            const buf = await ctx.startRendering();
            const a = buf.getChannelData(0);
            const b = buf.getChannelData(1);
            const i0 = sr * 1.5; // nach der Rampe
            let q = 0;
            const n = a.length - i0;
            const mono = new Float32Array(n);
            for (let i = 0; i < n; i++) {
                const l = a[i0 + i];
                const rr = b[i0 + i];
                q += l * l + rr * rr; // Leistung beider Kanäle (Panner gleich-leistig)
                mono[i] = (l + rr) * 0.5;
            }
            // Schwerpunkt über eine 8192-DFT-Mittelung (Hann).
            const N = 8192;
            let sw = 0;
            let sf = 0;
            const re = new Float64Array(N);
            const im = new Float64Array(N);
            for (let o = 0; o + N <= n; o += N) {
                for (let i = 0; i < N; i++) {
                    re[i] = mono[o + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
                    im[i] = 0;
                }
                for (let i = 1, j = 0; i < N; i++) {
                    let bit = N >> 1;
                    for (; j & bit; bit >>= 1) j ^= bit;
                    j ^= bit;
                    if (i < j) {
                        [re[i], re[j]] = [re[j], re[i]];
                        [im[i], im[j]] = [im[j], im[i]];
                    }
                }
                for (let len = 2; len <= N; len <<= 1) {
                    const ang = (-2 * Math.PI) / len;
                    const wr = Math.cos(ang);
                    const wi = Math.sin(ang);
                    for (let i = 0; i < N; i += len) {
                        let cr = 1;
                        let ci = 0;
                        for (let j = 0; j < len / 2; j++) {
                            const h = i + j + len / 2;
                            const vr = re[h] * cr - im[h] * ci;
                            const vi = re[h] * ci + im[h] * cr;
                            re[h] = re[i + j] - vr;
                            im[h] = im[i + j] - vi;
                            re[i + j] += vr;
                            im[i + j] += vi;
                            const nr = cr * wr - ci * wi;
                            ci = cr * wi + ci * wr;
                            cr = nr;
                        }
                    }
                }
                for (let k = 1; k < N / 2; k++) {
                    const p = re[k] * re[k] + im[k] * im[k];
                    sw += p;
                    sf += (p * k * sr) / N;
                }
            }
            out[name] = {
                kalibDb: +K.umweltKalibDb(name).toFixed(1),
                gesetzDb: +mix[name].db.toFixed(1),
                gemessenDb: +(10 * Math.log10(q / n / 2 + 1e-20) + 3.01).toFixed(1),
                schwerpunktHz: Math.round(sf / Math.max(1e-20, sw)),
            };
        }
        return out;
    }, lage);
}

// DIE KOSTEN je Klang-Takt: Welt-Abfragen zählen (nur innerhalb symphonyTick), vor und nach der Injektion.
async function kosten(page, stubs) {
    return page.evaluate(async (stubs) => {
        const r = window.anazhRealm;
        const st = r.state;
        const P = Object.getPrototypeOf(r);
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const zaehl = { boden: 0, wasser: 0, stroemung: 0, fluss: 0, segmente: 0, bauten: 0 };
        const wer = {};
        let imTakt = false;
        const fns = {
            _voxelSurfaceY: "boden",
            _waterLevelAt: "wasser",
            _waterFlowAt: "stroemung",
            _hydroRiverAt: "fluss",
            _pointSegDist2D: "segmente",
        };
        const alt = {};
        for (const [fn, k] of Object.entries(fns)) {
            if (typeof P[fn] !== "function") continue;
            alt[fn] = P[fn];
            P[fn] = function () {
                if (imTakt) {
                    zaehl[k]++;
                    if (!wer[k]) {
                        const z = (new Error().stack || "").split("\n")[2] || "";
                        const m = /at (?:\S+\.)?(\S+) \(/.exec(z);
                        wer[k] = m ? m[1] : "?";
                    }
                }
                return alt[fn].apply(this, arguments);
            };
        }
        const altTick = P.symphonyTick;
        P.symphonyTick = function () {
            imTakt = true;
            try {
                return altTick.apply(this, arguments);
            } finally {
                imTakt = false;
            }
        };
        const altArchs = st.architectures;
        st.architectures = new Proxy(altArchs, {
            get(t, k, rcv) {
                if (imTakt && typeof k === "string" && /^\d+$/.test(k)) {
                    zaehl.bauten++;
                    if (!wer.bauten) {
                        const z = (new Error().stack || "").split("\n")[2] || "";
                        const m = /at (?:\S+\.)?(\S+) \(/.exec(z);
                        wer.bauten = m ? m[1] : "?";
                    }
                }
                return Reflect.get(t, k, rcv);
            },
        });
        const altSweep = P._umweltGlutSweep;
        if (stubs && stubs.alleBauten && altSweep) {
            P._umweltGlutSweep = function (um, px, pz) {
                return altSweep.call(this, um, px, pz, 1e9);
            };
        }
        const lauf = async (n) => {
            for (const k of Object.keys(zaehl)) zaehl[k] = 0;
            for (let i = 0; i < n; i++) {
                r.symphonyTick();
                await sleep(25);
            }
            const o = {};
            for (const k of Object.keys(zaehl)) o[k] = +(zaehl[k] / n).toFixed(2);
            return o;
        };
        let vor;
        let nach;
        const hydro = st.hydrosphere;
        const altRivers = hydro && Array.isArray(hydro.rivers) ? hydro.rivers : null;
        try {
            vor = await lauf(40);
            // Injektion: 4000 ferne Bauten (5 km), 200 ferne Fluss-Läufe (je 20 Punkte).
            const p = st.playerMesh.position;
            for (let i = 0; i < 4000; i++)
                altArchs.push({ type: "glutbrunnen", position: { x: p.x + 5000 + i, y: 0, z: p.z + 5000 }, __klangFake: true });
            if (altRivers) {
                const fake = [];
                for (let i = 0; i < 200; i++) {
                    const pts = [];
                    for (let k = 0; k < 20; k++) pts.push({ x: p.x + 6000 + k * 10, y: 0, z: p.z + 6000 + i * 10 });
                    fake.push({ points: pts, __klangFake: true });
                }
                hydro.rivers = altRivers.concat(fake);
            }
            nach = await lauf(40);
        } finally {
            for (let i = altArchs.length - 1; i >= 0; i--) if (altArchs[i] && altArchs[i].__klangFake) altArchs.splice(i, 1);
            if (altRivers) hydro.rivers = altRivers;
            st.architectures = altArchs;
            P.symphonyTick = altTick;
            for (const fn of Object.keys(alt)) P[fn] = alt[fn];
            if (altSweep) P._umweltGlutSweep = altSweep;
        }
        const wachsen = [];
        for (const k of Object.keys(vor)) if (nach[k] > vor[k] * 1.25 + 2) wachsen.push(`${k} ${vor[k]} → ${nach[k]} (${wer[k] || "?"})`);
        return { vor, nach, wachsen };
    }, stubs || null);
}

// DAS LAB: worlds/klang — der Welt-Modus baut über __klangCore.umweltGraph; je Ort hält die Lab-Lage das SOLL.
async function labPruefen(browser) {
    const page = await browser.newPage();
    try {
        await page.goto(`http://127.0.0.1:${PORT}/worlds/klang/index.html`, { waitUntil: "load", timeout: 60000 });
        return await page.evaluate(async () => {
            const K = window.__klangCore;
            const o = { weltModus: !!document.getElementById("weltModeBtn"), graphGebaut: 0, orte: {} };
            if (!o.weltModus || !K || typeof K.umweltGraph !== "function") return o;
            const org = K.umweltGraph;
            K.umweltGraph = function () {
                o.graphGebaut++;
                return org.apply(this, arguments);
            };
            try {
                document.getElementById("weltModeBtn").click();
                const knopf = document.querySelector('[data-welt-ort="seeufer"]');
                if (knopf) knopf.click();
                await new Promise((res) => setTimeout(res, 1500));
                const z = window.__klangWelt && window.__klangWelt.zensus ? window.__klangWelt.zensus() : [];
                o.seeuferUfer = z.some((v) => v.name === "ufer" && v.an);
                o.laufendLab = z.filter((v) => v.an).map((v) => v.name);
                for (const [ort, lage] of Object.entries(K.UMWELT.orte)) {
                    const m = K.umweltMischung(Object.assign({}, lage, { boe: 0.7 }));
                    // −∞ als −999 über die Brücke (null > −64 wäre wahr — Lehre 17).
                    o.orte[ort] = Object.fromEntries(
                        Object.entries(m).map(([k, v]) => [k, { db: Number.isFinite(v.db) ? v.db : -999 }])
                    );
                }
            } finally {
                K.umweltGraph = org;
            }
            return o;
        });
    } finally {
        await page.close();
    }
}

// DIE AUFNAHME: 6 s Ausgang (ScriptProcessor am Master, Stereo) + Spektrogramm-PNG je Ort; der Lab-Ort offline.
async function aufnahme(page, name, ordner, lage) {
    const o = await page.evaluate(
        async (sek, lage) => {
            const r = window.anazhRealm;
            const W = window.__klangW;
            const s = r.state.symphony;
            const ctx = s.ctx;
            const sp = ctx.createScriptProcessor(4096, 2, 2);
            const L = [];
            const R = [];
            let n = 0;
            const ziel = Math.floor(sek * ctx.sampleRate);
            sp.onaudioprocess = (e) => {
                if (n >= ziel) return;
                L.push(Float32Array.from(e.inputBuffer.getChannelData(0)));
                R.push(Float32Array.from(e.inputBuffer.getChannelData(1)));
                n += e.inputBuffer.length;
            };
            s.masterGain.connect(sp);
            sp.connect(ctx.destination);
            while (n < ziel) {
                W.takt();
                await new Promise((res) => setTimeout(res, 30));
            }
            s.masterGain.disconnect(sp);
            sp.disconnect();
            const flach = (arr) => {
                const out = new Float32Array(ziel);
                let i = 0;
                for (const a of arr) {
                    out.set(a.subarray(0, Math.min(a.length, ziel - i)), i);
                    i += a.length;
                    if (i >= ziel) break;
                }
                return out;
            };
            const welt = { l: flach(L), r: flach(R), sr: ctx.sampleRate };
            // Der Lab-Ort offline (derselbe Graph, die Lage bei mittlerer Böe) — nur mit Gesetz.
            let lab = null;
            const K = window.__klangCore;
            if (lage && K && typeof K.umweltGraph === "function") {
                const off = new OfflineAudioContext(2, Math.floor(sek * 48000), 48000);
                const g = off.createGain();
                g.gain.value = K.UMWELT.masterBasis;
                g.connect(off.destination);
                K.umweltGraph(off, g).anwenden(K.umweltMischung(lage), 0);
                const b = await off.startRendering();
                lab = { l: b.getChannelData(0), r: b.getChannelData(1), sr: 48000 };
            }
            // Spektrogramm (log-Frequenz 50 Hz–12 kHz, −100…−20 dBFS) auf Canvas.
            const spektro = (x, sr) => {
                const Wd = 900;
                const H = 300;
                const cv = document.createElement("canvas");
                cv.width = Wd;
                cv.height = H;
                const c2 = cv.getContext("2d");
                const img = c2.createImageData(Wd, H);
                const N = 2048;
                const re = new Float64Array(N);
                const im = new Float64Array(N);
                for (let col = 0; col < Wd; col++) {
                    const o0 = Math.floor((col / Wd) * (x.length - N));
                    for (let i = 0; i < N; i++) {
                        re[i] = x[o0 + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
                        im[i] = 0;
                    }
                    for (let i = 1, j = 0; i < N; i++) {
                        let bit = N >> 1;
                        for (; j & bit; bit >>= 1) j ^= bit;
                        j ^= bit;
                        if (i < j) {
                            [re[i], re[j]] = [re[j], re[i]];
                            [im[i], im[j]] = [im[j], im[i]];
                        }
                    }
                    for (let len = 2; len <= N; len <<= 1) {
                        const ang = (-2 * Math.PI) / len;
                        const wr = Math.cos(ang);
                        const wi = Math.sin(ang);
                        for (let i = 0; i < N; i += len) {
                            let cr = 1;
                            let ci = 0;
                            for (let j = 0; j < len / 2; j++) {
                                const h = i + j + len / 2;
                                const vr = re[h] * cr - im[h] * ci;
                                const vi = re[h] * ci + im[h] * cr;
                                re[h] = re[i + j] - vr;
                                im[h] = im[i + j] - vi;
                                re[i + j] += vr;
                                im[i + j] += vi;
                                const nr = cr * wr - ci * wi;
                                ci = cr * wi + ci * wr;
                                cr = nr;
                            }
                        }
                    }
                    for (let row = 0; row < H; row++) {
                        const f = 50 * Math.pow(12000 / 50, 1 - row / (H - 1));
                        const k = Math.max(1, Math.min(N / 2 - 1, Math.round((f * N) / sr)));
                        const p = (re[k] * re[k] + im[k] * im[k]) / (N * N * 0.0625);
                        const dbv = 10 * Math.log10(p + 1e-20);
                        const t = Math.max(0, Math.min(1, (dbv + 100) / 80));
                        const i4 = (row * Wd + col) * 4;
                        img.data[i4] = Math.round(255 * Math.min(1, t * 1.6));
                        img.data[i4 + 1] = Math.round(255 * Math.max(0, Math.min(1, t * 1.6 - 0.5)));
                        img.data[i4 + 2] = Math.round(255 * Math.max(0, 0.5 - Math.abs(t - 0.3)) * 1.5);
                        img.data[i4 + 3] = 255;
                    }
                }
                c2.putImageData(img, 0, 0);
                c2.fillStyle = "rgba(255,255,255,0.75)";
                c2.font = "11px monospace";
                for (const f of [100, 250, 500, 1000, 2000, 4000, 8000]) {
                    const row = (1 - Math.log(f / 50) / Math.log(12000 / 50)) * (H - 1);
                    c2.fillText(f >= 1000 ? f / 1000 + "k" : String(f), 2, row + 4);
                }
                return cv.toDataURL("image/png");
            };
            const mono = (a) => {
                const m = new Float32Array(a.l.length);
                for (let i = 0; i < m.length; i++) m[i] = (a.l[i] + a.r[i]) * 0.5;
                return m;
            };
            const pcm = (a) => {
                const out = new Int16Array(a.l.length * 2);
                for (let i = 0; i < a.l.length; i++) {
                    out[2 * i] = Math.max(-32768, Math.min(32767, Math.round(a.l[i] * 32767)));
                    out[2 * i + 1] = Math.max(-32768, Math.min(32767, Math.round(a.r[i] * 32767)));
                }
                let bin = "";
                const u8 = new Uint8Array(out.buffer);
                for (let i = 0; i < u8.length; i += 32768) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
                return btoa(bin);
            };
            return {
                welt: { sr: welt.sr, pcm: pcm(welt), png: spektro(mono(welt), welt.sr) },
                lab: lab ? { sr: lab.sr, pcm: pcm(lab), png: spektro(mono(lab), lab.sr) } : null,
            };
        },
        6,
        lage
    );
    fs.mkdirSync(ordner, { recursive: true });
    const wav = (datei, sr, b64) => {
        const daten = Buffer.from(b64, "base64");
        const kopf = Buffer.alloc(44);
        kopf.write("RIFF", 0);
        kopf.writeUInt32LE(36 + daten.length, 4);
        kopf.write("WAVE", 8);
        kopf.write("fmt ", 12);
        kopf.writeUInt32LE(16, 16);
        kopf.writeUInt16LE(1, 20);
        kopf.writeUInt16LE(2, 22);
        kopf.writeUInt32LE(sr, 24);
        kopf.writeUInt32LE(sr * 4, 28);
        kopf.writeUInt16LE(4, 32);
        kopf.writeUInt16LE(16, 34);
        kopf.write("data", 36);
        kopf.writeUInt32LE(daten.length, 40);
        fs.writeFileSync(datei, Buffer.concat([kopf, daten]));
    };
    const dateien = [];
    for (const [art, a] of [
        ["welt", o.welt],
        ["lab", o.lab],
    ]) {
        if (!a) continue;
        const basis = path.join(ordner, `${name}-${art}`);
        wav(basis + ".wav", a.sr, a.pcm);
        fs.writeFileSync(basis + ".png", Buffer.from(a.png.split(",")[1], "base64"));
        dateien.push(basis + ".wav", basis + ".png");
    }
    return dateien;
}

function urteile(daten, offline, lab, ereig) {
    const rot = [];
    const zeilen = [];
    const mixAlle = {};
    // (E) Ereignis-Klänge: jede Quelle aus dem Gesetzbuch, keine Verbindung am Master vorbei.
    for (const e of ereig || []) {
        if (e.fehler) {
            rot.push(`E ${e.art}: wirft (${e.fehler})`);
            continue;
        }
        if (!e.quellen.length) rot.push(`E ${e.art}: keine Quelle (stumm)`);
        for (const q of e.quellen)
            if (!q.frames.some((f) => f.datei === "klang-core.js"))
                rot.push(
                    `E ${e.art}: ${q.art.replace("create", "")} aus ${q.frames
                        .slice(0, 2)
                        .map((f) => f.fn)
                        .join(" ← ")} trägt kein Gesetz`
                );
        for (const a of e.amAusgang)
            rot.push(
                `E ${e.art}: ${a
                    .slice(0, 2)
                    .map((f) => f.fn)
                    .join(" ← ")} verbindet am Master vorbei direkt an den Ausgang`
            );
    }
    for (const [name, d] of Object.entries(daten)) {
        // (G) Herkunft
        for (const q of d.laufend) {
            const f0 = q.frames[0] || {};
            const imKern = q.frames.some((f) => f.datei === "klang-core.js");
            const leser = q.frames.map((f) => WIRT_LESER[f.fn]).find(Boolean);
            q.herkunft = imKern ? "Gesetzbuch" : leser ? "Wirt-Leser " + leser : "STAMM-LITERAL " + f0.fn;
            if (!imKern && !leser)
                rot.push(
                    `G ${name}: ${q.art.replace("create", "")} ${q.freq ? Math.round(q.freq) + " Hz " : ""}aus ${q.frames
                        .slice(0, 2)
                        .map((f) => f.fn)
                        .join(" ← ")} trägt kein Gesetz`
                );
        }
        // (H) Hörbar-Kosten
        const z = d.zensus;
        const stimmen = z ? z.stimmen : [];
        const sumQuellen = stimmen.filter((v) => v.an).reduce((a, v) => a + v.quellen, 0);
        const dauernd = d.laufend.filter((q) => q.dauernd);
        for (const q of dauernd) {
            if (!q.gesetzKnoten)
                rot.push(
                    `H ${name}: dauernde Quelle ohne Gesetz-Stimme (${q.frames
                        .slice(0, 2)
                        .map((f) => f.fn)
                        .join(" ← ")})`
                );
        }
        const imKnoten = dauernd.filter((q) => q.gesetzKnoten).length;
        if (z && imKnoten !== sumQuellen) rot.push(`H ${name}: ${imKnoten} laufende Gesetz-Quellen ≠ ${sumQuellen} der hörbaren Stimmen`);
        for (const v of stimmen)
            if (v.an && !(v.db >= -68)) rot.push(`H ${name}: Stimme ${v.name} läuft bei ${v.db} dB (unter der Hörschwelle)`);
        // (S) SOLL
        const m = d.mixMitte;
        if (m) mixAlle[name] = m;
        zeilen.push({ name, d, stimmen, dauernd: dauernd.length });
    }
    for (const [name, m] of Object.entries(mixAlle)) {
        if (!SOLL[name]) continue;
        for (const [txt, ok] of SOLL[name](m, mixAlle)) if (!ok) rot.push(`S ${name}: ${txt} verfehlt`);
    }
    for (const name of Object.keys(SOLL)) if (!mixAlle[name]) rot.push(`S ${name}: kein Umwelt-Gesetz am Ohr (Lage/Mischung fehlt)`);
    // Offline-Render: Pegel und Band
    for (const [name, o] of Object.entries(offline || {})) {
        if (!o) continue;
        for (const [stimme, v] of Object.entries(o)) {
            if (Math.abs(v.gemessenDb - v.gesetzDb) > 1.5)
                rot.push(`S ${name}/${stimme}: Offline ${v.gemessenDb} dB ≠ Gesetz ${v.gesetzDb} dB`);
            const B = BAND[stimme];
            if (B && !(v.schwerpunktHz >= B[0] && v.schwerpunktHz <= B[1]))
                rot.push(`S ${name}/${stimme}: Schwerpunkt ${v.schwerpunktHz} Hz außerhalb ${B[0]}–${B[1]}`);
        }
    }
    // (L) Lab = Welt
    if (lab) {
        if (!lab.weltModus) rot.push("L: das Klang-Studio kennt die Welt nicht (kein Welt-Modus)");
        else {
            if (!lab.graphGebaut) rot.push("L: das Lab baut seine Welt nicht über __klangCore.umweltGraph");
            if (!lab.seeuferUfer) rot.push("L: das Seeufer des Labs trägt kein Ufer");
            for (const name of Object.keys(SOLL)) {
                const m = lab.orte[name];
                if (!m) {
                    rot.push(`L: Lab-Ort ${name} fehlt`);
                    continue;
                }
                for (const [txt, ok] of SOLL[name](m, lab.orte)) if (!ok) rot.push(`L ${name}: ${txt} verfehlt (Lab)`);
            }
        }
    }
    return { rot, zeilen };
}

function drucke(zeilen, offline, kostenErg, lab) {
    for (const { name, d, stimmen, dauernd } of zeilen) {
        console.log(
            `\n── ${name.toUpperCase()} (${Math.round(d.ort.x)}/${Math.round(d.ort.z)}) — Ausgang ${d.aus.dbfs} dBFS · Bäume ≤ 15 m: ${d.baeume}`
        );
        console.log(
            "   Oktavbänder: " +
                Object.entries(d.aus.baender)
                    .map(([b, v]) => `${b}:${v}`)
                    .join(" ")
        );
        if (d.zensus && d.zensus.lage) {
            const L = d.zensus.lage;
            const nah = (v) => Number.isFinite(v) && v < 1e8;
            console.log(
                `   Lage: wind ${L.windFeld.toFixed(3)} · böe ${L.boe.toFixed(2)} · deckung ${L.deckung.toFixed(2)} · regen ${L.regen} · sonne ${L.sonne.toFixed(2)} · leben ${L.lebendig.toFixed(2)} · ufer ${nah(L.ufer.d) ? L.ufer.d + " m/" + L.ufer.anteil.toFixed(2) : "—"} · fluss ${nah(L.fluss.d) ? L.fluss.d + " m" : "—"} · fall ${nah(L.fall.d) ? Math.round(L.fall.d) + " m" : "—"} · glut ${nah(L.glut.d) ? L.glut.d.toFixed(1) + " m" : "—"}`
            );
        }
        for (const v of stimmen)
            if (v.an || v.db > -80)
                console.log(
                    `   ${v.an ? "▶" : "·"} ${v.name.padEnd(7)} ${String(v.db > -900 ? v.db.toFixed(1) : "−∞").padStart(6)} dB  ${v.gesetz}  (${v.quellen} Quellen)`
                );
        const grup = {};
        for (const q of d.laufend) {
            const k = `${q.herkunft} · ${q.art.replace("create", "")}${q.freq ? " " + Math.round(q.freq) + " Hz" : ""} · ${q.frames
                .slice(0, 2)
                .map((f) => f.fn)
                .join(" ← ")}`;
            grup[k] = (grup[k] || 0) + 1;
        }
        console.log(`   laufende Quellen: ${d.laufend.length} (dauernd ${dauernd})`);
        for (const [k, n] of Object.entries(grup)) console.log(`     ${n}× ${k}`);
        if (offline && offline[name])
            for (const [s, v] of Object.entries(offline[name]))
                console.log(`   offline ${s.padEnd(7)} Gesetz ${v.gesetzDb} dB · gemessen ${v.gemessenDb} dB · Schwerpunkt ${v.schwerpunktHz} Hz`);
    }
    if (kostenErg) {
        console.log("\n── KOSTEN je Klang-Takt (Welt-Abfragen, vor → nach 4000 Bauten + 200 Fluss-Läufe)");
        console.log("   vor  " + JSON.stringify(kostenErg.vor));
        console.log("   nach " + JSON.stringify(kostenErg.nach));
    }
    if (lab)
        console.log(
            `\n── LAB: Welt-Modus ${lab.weltModus ? "ja" : "NEIN"} · Graph über umweltGraph ${lab.graphGebaut}× · Seeufer-Ufer ${lab.seeuferUfer ? "ja" : "nein"} · laufend ${JSON.stringify(lab.laufendLab || [])}`
        );
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 600000,
        args: ["--no-sandbox", "--disable-gpu", "--autoplay-policy=no-user-gesture-required"],
    });
    let exit = 1;
    const ergebnis = {};
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(590000);
        page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
        await page.evaluateOnNewDocument(() => {
            window.__anazhHeadlessNullRenderer = true;
        });
        await page.evaluateOnNewDocument(quellenAbgriff);
        const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 180000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 180000,
        });
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(`window.__klangW = (${werkzeug.toString()})();`);
        // Symphonie an, die Musik ruht (die Linse misst die WELT), die Tiere halten still.
        const init = await page.evaluate(() => {
            const r = window.anazhRealm;
            window.__tiereHalten();
            const P = Object.getPrototypeOf(r);
            window.__lofiTickOrg = P._lofiTick;
            P._lofiTick = function () {};
            const ok = r.initSymphony();
            return { ok, laeuft: r.state.symphony.ctx && r.state.symphony.ctx.state };
        });
        console.log("Symphonie:", JSON.stringify(init));
        // Die Orte.
        await page.evaluate(() => window.__klangW.umstellen(-900, -850));
        const orte = await page.evaluate(() => window.__klangW.orte(-900, -850));
        console.log("Orte:", JSON.stringify(orte));
        const daten = {};
        const offline = {};
        for (const name of ["wiese", "seeufer", "wald", "dorf"]) {
            if (!orte[name]) continue;
            daten[name] = await messeOrt(page, name, orte[name]);
            const z = daten[name].zensus;
            if (z && z.lage) {
                const lageMitte = Object.assign({}, z.lage, { boe: 0.7 });
                daten[name].mixMitte = await page.evaluate((l) => window.__klangW.mischung(l), lageMitte);
                offline[name] = await offlineRender(page, lageMitte);
            }
            if (AUFNAHME) {
                const lageMitte = z && z.lage ? Object.assign({}, z.lage, { boe: 0.7 }) : null;
                const dat = await aufnahme(page, name, path.resolve(AUFNAHME), lageMitte);
                console.log(`Aufnahme ${name}: ${dat.map((f) => path.basename(f)).join(", ")}`);
            }
        }
        await page.evaluate(() => window.__klangW.umstellen(-900, -850));
        const kostenErg = await kosten(page);
        const ereig = await page.evaluate(() => window.__klangW.ereignisse());
        const lab = await labPruefen(browser);
        const { rot, zeilen } = urteile(daten, offline, lab, ereig);
        for (const w of kostenErg.wachsen) rot.push(`K: ${w} wächst mit der Welt`);
        drucke(zeilen, offline, kostenErg, lab);
        console.log("\n── EREIGNISSE (je einmal über den echten Weg ausgelöst)");
        for (const e of ereig)
            console.log(
                `   ${e.art.padEnd(9)} ${
                    e.fehler
                        ? "WIRFT " + e.fehler
                        : `${e.quellen.length} Quelle(n): ${e.quellen
                              .map(
                                  (q) =>
                                      (q.frames.some((f) => f.datei === "klang-core.js") ? "Gesetzbuch " : "STAMM ") +
                                      q.frames
                                          .slice(0, 2)
                                          .map((f) => f.fn)
                                          .join(" ← ")
                              )
                              .join(" · ")}${e.amAusgang.length ? " · AM MASTER VORBEI" : ""}`
                }`
            );
        Object.assign(ergebnis, { orte, daten, offline, kosten: kostenErg, lab, ereig, rot });

        let selbstOk = true;
        if (SELBST) {
            console.log("\n── SELBST-TEST (die Linse feuert)");
            const fehl = [];
            // S1 + S2: der Drohn-Zwilling und die stumme Schleife.
            await page.evaluate(() => {
                const s = window.anazhRealm.state.symphony;
                window.zwillingDrohne = function () {
                    const o = s.ctx.createOscillator();
                    o.frequency.value = 110;
                    const g = s.ctx.createGain();
                    g.gain.value = 0.01;
                    o.connect(g);
                    g.connect(s.masterGain);
                    o.start();
                    return o;
                };
                window.stummeSchleife = function () {
                    const b = s.ctx.createBuffer(1, 4800, 48000);
                    const q = s.ctx.createBufferSource();
                    q.buffer = b;
                    q.loop = true;
                    const g = s.ctx.createGain();
                    g.gain.value = 0;
                    q.connect(g);
                    g.connect(s.masterGain);
                    q.start();
                    return q;
                };
                window.__selbst = [window.zwillingDrohne(), window.stummeSchleife()];
            });
            const dS = { wiese: await messeOrt(page, "wiese", orte.wiese) };
            await page.evaluate(() => window.__selbst.forEach((q) => q.stop()));
            const uS = urteile(dS, null, null).rot;
            if (!uS.some((t) => /^G wiese: .*zwillingDrohne/.test(t))) fehl.push("S1: der Drohn-Zwilling bleibt unbenannt");
            if (!uS.some((t) => /^H wiese: .*stummeSchleife/.test(t))) fehl.push("S2: die stumme Schleife bleibt unbenannt");
            // S3: das Wasser am Seeufer weg.
            if (orte.seeufer) {
                const d3 = await messeOrt(page, "seeufer", orte.seeufer, { ohneWasser: true });
                const z3 = d3.zensus;
                const m3 =
                    z3 && z3.lage
                        ? await page.evaluate((l) => window.__klangW.mischung(l), Object.assign({}, z3.lage, { boe: 0.7 }))
                        : null;
                const ok3 = m3 ? SOLL.seeufer(m3, {}).every(([, ok]) => ok) : false;
                if (ok3) fehl.push("S3: das Seeufer ohne Wasser hält das SOLL (die Linse ist blind)");
            } else fehl.push("S3: kein Seeufer gefunden");
            // S4: ein Glut-Umlauf über alle Bauten.
            await page.evaluate(() => window.__klangW.umstellen(-900, -850));
            const k4 = await kosten(page, { alleBauten: true });
            if (!k4.wachsen.some((t) => /^bauten/.test(t))) fehl.push("S4: der Voll-Umlauf über alle Bauten bleibt unbemerkt");
            // S5: ein Ereignis-Zwilling (Glocke aus dem Stamm, direkt an den Ausgang).
            const e5 = await page.evaluate(() => {
                const r = window.anazhRealm;
                const P = Object.getPrototypeOf(r);
                const alt = P._playWaterReactionPing;
                P._playWaterReactionPing = function zwillingGlocke() {
                    const ctx = this.state.symphony.ctx;
                    const o = ctx.createOscillator();
                    o.connect(ctx.destination);
                    o.start();
                    o.stop(ctx.currentTime + 0.05);
                };
                try {
                    return window.__klangW.ereignisse();
                } finally {
                    P._playWaterReactionPing = alt;
                }
            });
            const u5 = urteile({}, null, null, e5).rot;
            if (!u5.some((t) => /^E wasser: .*zwillingGlocke.*kein Gesetz/.test(t))) fehl.push("S5: der Ereignis-Zwilling bleibt unbenannt");
            if (!u5.some((t) => /^E wasser: .*am Master vorbei/.test(t))) fehl.push("S5: die Verbindung am Master vorbei bleibt unbemerkt");
            for (const t of fehl) console.log("   ❌ " + t);
            if (!fehl.length)
                console.log(
                    "   ✅ S1 Zwilling beim Namen · S2 stumme Schleife beim Namen · S3 Seeufer ohne Wasser rot · S4 Voll-Umlauf rot · S5 Ereignis-Zwilling + Master-Umweg beim Namen"
                );
            selbstOk = fehl.length === 0;
            ergebnis.selbsttest = fehl;
        }
        console.log("");
        if (rot.length) {
            console.log(`❌ ROT — ${rot.length} Befund(e):`);
            for (const t of rot) console.log("   " + t);
        } else console.log("✅ GRÜN — jede klingende Quelle trägt ein Gesetz, kostet nur hörbar, jeder Ort hält sein SOLL, Lab = Welt.");
        exit = rot.length === 0 && selbstOk ? 0 : 1;
    } catch (e) {
        console.log("FEHLER:", e && e.stack ? e.stack : e);
        exit = 1;
    } finally {
        if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify(ergebnis, (k, v) => (v === -Infinity ? "-Infinity" : v), 1));
        await browser.close();
        server.close();
        process.exit(exit);
    }
})();
