#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-klang-zensus.cjs — DIE KLANG-LINSE (npm run gate:klang-zensus): was hört man je Ort, trägt jede
// klingende Quelle ein GESETZ, und kostet sie nur, solange man sie hört?
//  (O) ORTE aus dem Gesetz (Null-Renderer): Wiese = Messort · Seeufer 3–7 m vor stillem Wasser · Wald = höchste
//      Deckung der Kronen-Karte `_kronenStreuAt`, geprüft am Bestand ≤ 15 m · Dorf 4 m neben dem nächsten Glut-Bau.
//  (Z) ZENSUS je Ort (Mittag · Sonne · Sommer, die Musik ruht): jede Quelle mit Erzeuger, Gesetz-Stimmen, Ausgang je Oktavband.
//  (G) HERKUNFT: gebaut in klang-core.js oder ein Wirt-Leser eines klang-Gesetzes, sonst STAMM-LITERAL beim Namen
//      (dazu statisch jede Quellen-Stelle im Stamm).
//  (H) HÖRBAR: jede Dauer-Quelle gehört einer Stimme über der Hörschwelle.
//  (K) KOSTEN je Takt: die Welt-Abfragen bleiben gleich bei 4000 fernen Bauten und 200 Fluss-Läufen.
//  (E) EREIGNISSE über den echten Weg: jede Quelle aus dem Gesetzbuch, keine am Master vorbei; still, wo die Welt still ist.
//  (L) LAB = WELT: worlds/klang spielt seine Orte über umweltGraph mit demselben SOLL.
//  (W) WERKSTATT: der Haupt-Thread rechnet keinen Sample (klang:umweltSynthese je Thread).
//  (A) ARMLÄNGE: 1 m vor der Glut, 3–24 m neben dem Wasserfall, eigenes SOLL.
//  (P) SPITZEN: jede Mischung offline durch Master und Spitzen-Wand — keine Spitze erreicht 0 dBFS.
//  SELBST-TEST (--selftest): je Wand ein gepflanzter Täter (die Zeile S1–S11 unten), Stubs restauriert.
//  (T) KLANG-TAKT IN BEWEGUNG: der eigene Lauf `--takt` (an `taktSeite`).
//   node scripts/diag-klang-zensus.cjs [--selftest] [--takt [--echt] [--minuten <n>]] [--json <datei>]
//   (KLANG_WURZEL=<baum> misst einen anderen Arbeitsbaum unter derselben Linse)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const {
    statikServer,
    starteBrowser,
    warteAufWelt,
    nullRenderer,
    halteBis,
    ROOT: root,
} = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const MESS = require("./lib/welt-orte.cjs").messort("wiese"); // der Messort aus spec/profiband/haushalt.json

// KLANG_WURZEL: eine Überlagerung — liegt eine Datei dort, gewinnt sie (z. B. die Stände eines älteren Commits);
// vorher↔nachher unter derselben Linse, denselben Bedingungen.
const UEBER = process.env.KLANG_WURZEL ? path.resolve(process.env.KLANG_WURZEL) : null;
const PORT = Number(process.env.KLANG_ZENSUS_PORT) || 7452;
const argv = process.argv.slice(2);
const SELBST = argv.includes("--selftest");
const TAKT = argv.includes("--takt");
const ECHT = TAKT && argv.includes("--echt"); // der Zensus misst im Null-Renderer
const opt = (k) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : null;
};
const JSON_AUS = opt("--json");

const server = statikServer({
    root,
    seiten: {
        "/__stotter.js":
            "registerProcessor('stotter', class extends AudioWorkletProcessor { process() { for (const e = Date.now() + 8; Date.now() < e; ); return true; } });",
    },
    wandle: (p, data) => {
        if (!UEBER) return data;
        const ueber = path.join(UEBER, p);
        return ueber.startsWith(UEBER) && fs.existsSync(ueber) ? fs.readFileSync(ueber) : data;
    },
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
            const e = {
                art,
                stapel,
                start: null,
                stop: null,
                ende: false,
                loop: false,
                freq: null,
                ctx: this,
                knoten: n,
            };
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
        // Einschwingen, bis die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`: Ring, Foundry und Wald — die
        // Kronen-Karte trägt nur gepflanzte Kronen). Die Decke zählt Takte, nie Sekunden; steht die Welt nicht, wirft sie.
        const takte = await window.__weltStehtNach(() => {
            W.takt();
            st.playerMesh.position.x = x;
            st.playerMesh.position.z = z;
        });
        const wald = W.waldSteht();
        // Die Kamera blickt nach Norden (−z), 3 m hinter und 1,6 m über dem Spieler: das Panorama ist definiert.
        const cam = st.camera;
        if (cam) {
            const p = st.playerMesh.position;
            cam.position.set(p.x, p.y + 1.6, p.z + 3);
            cam.lookAt(p.x, p.y + 1.2, p.z - 10);
            cam.updateMatrixWorld(true);
        }
        return { takte, chunks: st.voxelChunks.size, wald, waldTakte: takte };
    };
    // DER WALD STEHT: nichts im Wald baut (`_weltOffen`, A9: Plan-Schlange, Pflanz-Gänge, Pflanz-Schlange), keine Streu-Region wartet.
    W.waldSteht = () => r._weltOffen().wald === 0 && r._streuWartet(st.playerMesh.position) === 0;
    // Die Nässe des Klangs ist SEINE (`_nassAt`: der Boden unter der EINEN Wasser-Wahrheit am Körper) — die Linse rechnet
    // sie nie nach.
    W.nass = (x, z) => r._nassAt(x, z);
    // DER BESTAND an (x, z): die stehenden Bäume im Umkreis `m` — Einträge mit Art (gesetzt, promoviert) und die Zellen
    // der Baum-Streu (promotable), gezählt an den Objekten der Welt, nie an der Kronen-Karte.
    W.bestand = (x, z, m) => {
        let n = 0;
        for (const e of st.architectures || [])
            if (e && e._lodSpecies && e.position && Math.hypot(e.position.x - x, e.position.z - z) < m) n++;
        for (const reg of st.scatterRegions ? st.scatterRegions.values() : [])
            for (const c of reg.cells || []) if (c && c.promotable && Math.hypot(c.x - x, c.z - z) < m) n++;
        return n;
    };
    // DIE ORTE aus dem Gesetz.
    W.orte = async (wx, wz) => {
        const orte = { wiese: { x: wx, z: wz } };
        const O = window.__klangCore.UMWELT.ohr;
        // Seeufer: der trockene Punkt vor dem nächsten SEE des Gesetzes (die Senken des Flussnetzes, ≥ 16 Zellen, über dem
        // Meer) in den Kacheln bis zum zweiten Ring, die Zelle nächst der Wiese.
        let best = null;
        const kachel = r.constructor.HYDROSPHERE.regionSize;
        let seeZelle = null;
        for (let rx = -2; rx <= 2; rx++)
            for (let rz = -2; rz <= 2; rz++) {
                r._ensureHydroTilesAround(wx + rx * kachel, wz + rz * kachel, 0);
                const h = r._hydroFor(wx + rx * kachel, wz + rz * kachel);
                for (const lake of (h && h.lakes) || []) {
                    if (!lake.cells || lake.cells.length < 16 || !(lake.level > st.waterLevel + 2)) continue;
                    for (const q of lake.cells) {
                        const x = h.originX + ((q % h.dim) + 0.5) * h.cell;
                        const z = h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell;
                        const d = Math.hypot(x - wx, z - wz);
                        if (!seeZelle || d < seeZelle.d) seeZelle = { x, z, d };
                    }
                }
                await sleep(0);
            }
        if (seeZelle) {
            // vom See zurück Richtung Wiese, bis trocken
            const r0 = Math.max(1e-3, seeZelle.d);
            const ux = (wx - seeZelle.x) / r0;
            const uz = (wz - seeZelle.z) / r0;
            // Der Leser ist der Hör-Ring des Ohrs (UMWELT.ohr: radien × richtungen, feste Welt-Achsen): das Ufer steht, wo
            // das Ohr trocken steht und sein ERSTER Ring Wasser trifft — der Punkt hinter dem ersten trockenen Punkt mit den
            // meisten nassen Ring-Punkten.
            const ringNass = (x, z) => {
                let erst = 0,
                    alle = 0;
                for (const rad of O.radien)
                    for (let k = 0; k < O.richtungen; k++) {
                        const a = (k / O.richtungen) * Math.PI * 2;
                        if (!W.nass(x + Math.sin(a) * rad, z + Math.cos(a) * rad)) continue;
                        alle++;
                        if (rad === O.radien[0]) erst++;
                    }
                return { erst, alle };
            };
            for (let s = 1; s < r0; s++) {
                const qx = seeZelle.x + ux * s;
                const qz = seeZelle.z + uz * s;
                if (!W.nass(qx, qz)) {
                    let wahl = null;
                    for (let t = 0; t <= O.radien[0]; t += 0.5) {
                        const fx = qx + ux * t;
                        const fz = qz + uz * t;
                        if (W.nass(fx, fz)) continue;
                        const n = ringNass(fx, fz);
                        if (n.erst > 0 && (!wahl || n.alle > wahl.n.alle)) wahl = { x: fx, z: fz, n };
                    }
                    if (wahl) best = { x: wahl.x, z: wahl.z, wasser: { x: qx - ux, z: qz - uz }, ring: wahl.n };
                    break;
                }
            }
        }
        if (best) orte.seeufer = best;
        W.wasserPunkt = best ? best.wasser : null; // die Ereignis-Tour lässt das Wasser hier zurückströmen
        // Waldinneres: höchste Kronen-Deckung der Kronen-Karte auf trockenem Land (die Karte trägt die stehenden Kronen;
        // bei Gleichstand gewinnt der dichtere Bestand).
        let wald = null;
        for (let gx = -240; gx <= 240; gx += 12) {
            for (let gz = -240; gz <= 240; gz += 12) {
                const x = wx + gx;
                const z = wz + gz;
                const y = r._voxelSurfaceY(x, z);
                if (y === null || W.nass(x, z)) continue;
                const deck = +r._kronenStreuAt(x, z).toFixed(3);
                if (wald && deck < wald.deckung) continue;
                const bestand = W.bestand(x, z, 15);
                if (!wald || deck > wald.deckung || bestand > wald.bestand) wald = { x, z, deckung: deck, bestand };
            }
            await sleep(0);
        }
        if (wald) orte.wald = wald;
        // Dorf: der nächste Glut-Bau (aus der gestreamten Welt um die Wiese), 4 m davor. Die Bauten streamen nach den
        // Chunks (Pflanz-/Bau-Takt): der Loop läuft weiter, bis einer im Umkreis von 160 m steht (der Deckel zählt Takte).
        const sucheGlut = () => {
            let g = null;
            for (const e of st.architectures || []) {
                if (!e || !e.position || !(r._glutFlaeche(e) > 0)) continue;
                const d = Math.hypot(e.position.x - wx, e.position.z - wz);
                if (!g || d < g.d) g = { e, d };
            }
            return g;
        };
        let glut = sucheGlut();
        for (const weiter = window.__deckel("eine Glut in Hörweite", 3000); !(glut && glut.d < 160) && weiter();) {
            W.takt();
            st.playerMesh.position.x = wx;
            st.playerMesh.position.z = wz;
            await sleep(30);
            glut = sucheGlut();
        }
        if (glut) {
            const ex = glut.e.position.x;
            const ez = glut.e.position.z;
            const d = Math.max(1e-3, glut.d);
            const bau = { x: ex, z: ez, typ: glut.e.type };
            orte.dorf = { x: ex + ((wx - ex) / d) * 4, z: ez + ((wz - ez) / d) * 4, glut: bau };
            // ARMLÄNGE an der Glut: 1 m vor dem Bau (das Knistern aus nächster Nähe — die Spitzen-Probe).
            orte.glutArm = { x: ex + (wx - ex) / d, z: ez + (wz - ez) / d, glut: bau };
        }
        // DIE WIESE liegt jenseits der Hörweite jeder Glut (klang-core UMWELT.stimmen.glut.hoerweiteM): an der Mess-Wiese
        // steht ein Dorf des Gesetzes. Das Dorf wächst erst ganz (die Bau-Schlange leer), dann gilt der nächste trockene,
        // ebene Punkt um den Messort, an dem jede Glut außer Hörweite liegt und kein Wasser im Hör-Ring.
        for (
            const weiter = window.__deckel("der Dorf-Plan", 1000);
            r._autoSettlementQueue && r._autoSettlementQueue.plan && weiter();
        ) {
            W.takt();
            await sleep(30);
        }
        const hoerweite = window.__klangCore.UMWELT.stimmen.glut.hoerweiteM;
        const gluten = (st.architectures || []).filter((e) => e && e.position && r._glutFlaeche(e) > 0);
        // offen wie der Messort: keine dichtere Krone, kein größerer Bestand im 15-m-Kreis (der Waldrand dämpft den Wind)
        const deckMess = r._kronenStreuAt(wx, wz);
        const bestandMess = W.bestand(wx, wz, 15);
        const wieseHaelt = (x, z) => {
            for (const e of gluten) if (Math.hypot(e.position.x - x, e.position.z - z) < hoerweite + 4) return false;
            if (r._kronenStreuAt(x, z) > deckMess || W.bestand(x, z, 15) > bestandMess) return false;
            let lo = Infinity,
                hi = -Infinity;
            for (let k = 0; k <= O.richtungen; k++) {
                const a = (k / O.richtungen) * Math.PI * 2;
                for (const rad of k === O.richtungen ? [0] : O.radien) {
                    const px = x + Math.sin(a) * rad,
                        pz = z + Math.cos(a) * rad;
                    if (W.nass(px, pz)) return false;
                    if (rad > 6) continue;
                    const y = r._voxelSurfaceY(px, pz);
                    if (y === null) return false;
                    lo = Math.min(lo, y);
                    hi = Math.max(hi, y);
                }
            }
            return hi - lo <= 1.5;
        };
        if (!wieseHaelt(wx, wz)) {
            let neu = null;
            for (let rr = 6; rr <= 240 && !neu; rr += 6) {
                const n = Math.round((2 * Math.PI * rr) / 6);
                for (let q = 0; q < n && !neu; q++) {
                    const a = (q / n) * Math.PI * 2;
                    const x = wx + Math.cos(a) * rr,
                        z = wz + Math.sin(a) * rr;
                    if (wieseHaelt(x, z)) neu = { x, z, vomMessort: rr, glutHoerweite: hoerweite };
                }
            }
            orte.wiese = neu || { x: wx, z: wz, ohneOrt: "kein Punkt jenseits der Glut-Hörweite binnen 240 m" };
        }
        // ARMLÄNGE am Wasserfall: der nächste Fall der Kacheln bis zum zweiten Ring (wie der Playtest,
        // `__wasserOrt("fall")`), der nächste trockene Punkt 3–24 m neben seinem Fuß — das Becken eines Falls reicht bis
        // zur Krone seines Kanals, das SOLL misst die Ferne mit (SOLL.fallArm).
        let wfN = null;
        for (let rx = -2; rx <= 2; rx++)
            for (let rz = -2; rz <= 2; rz++) {
                const h = r._hydroFor(wx + rx * kachel, wz + rz * kachel);
                for (const f of (h && h.waterfalls) || []) {
                    const d = Math.hypot(f.x - wx, f.z - wz);
                    if (!wfN || d < wfN.d) wfN = { f, d };
                }
            }
        for (const rad of wfN ? [3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24] : []) {
            for (let a = 0; a < 16 && !orte.fallArm; a++) {
                const ang = (a / 16) * Math.PI * 2;
                const x = wfN.f.x + Math.sin(ang) * rad;
                const z = wfN.f.z + Math.cos(ang) * rad;
                if (W.nass(x, z)) continue;
                orte.fallArm = {
                    x,
                    z,
                    fall: { x: wfN.f.x, z: wfN.f.z, d: rad, hoehe: +(wfN.f.topY - wfN.f.bottomY).toFixed(1) },
                };
            }
            if (orte.fallArm) break;
        }
        // Kein trockener Punkt / kein Fall: die Spur reist mit (der Befund O nennt den Ort).
        if (!orte.fallArm)
            orte.fallSuche = wfN ? { x: wfN.f.x, z: wfN.f.z, d: Math.round(wfN.d) } : "kein Wasserfall der Region";
        return orte;
    };
    // Der Abgriff ist, was der Spieler hört: hinter der Spitzen-Wand.
    W.abgriff = () => st.symphony.spitze.ausgang;
    // DER AUSGANGS-ABGRIFF: Oktavband-Pegel (dBFS, Mono-Summe) und Spitze über `sek` Sekunden, der Loop läuft.
    W.ausgang = async (sek) => {
        const s = st.symphony;
        const an = s.ctx.createAnalyser();
        an.fftSize = 8192;
        an.smoothingTimeConstant = 0;
        const tap = W.abgriff();
        tap.connect(an);
        let spitze = 0;
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
            for (let i = 0; i < td.length; i++) {
                q += td[i] * td[i];
                if (Math.abs(td[i]) > spitze) spitze = Math.abs(td[i]);
            }
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
        tap.disconnect(an);
        const db = (v) => (v > 0 ? +(10 * Math.log10(v)).toFixed(1) : -200);
        return {
            dbfs: db(rmsSum / Math.max(1, proben)),
            spitzeDbfs: db(spitze * spitze),
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
    // DER SYNTHESE-ZÄHLER des Haupt-Threads (klang:umweltSynthese — Samples aus Textur- und Ruf-Gesetzen): die Welt
    // rechnet in der Klang-Werkstatt, nie im Spiel-Takt.
    W.synthese = () => window.__klangCore.umweltSynthese().samples;
    // Die EREIGNIS-KLÄNGE der Welt, je einmal ausgelöst über ihre echten Wege: welche Quellen entstehen, wer baut sie,
    // wer verbindet direkt an den Ausgang (am Master vorbei), und wie viele Samples rechnet der Haupt-Thread dafür?
    // Ein Ereignis darf seine Quelle verzögert bauen (der Tier-Ruf kommt aus der Werkstatt): gewartet wird bis zur
    // ersten Quelle, höchstens `warteMs`.
    W.ereignisse = async () => {
        const s = st.symphony;
        const out = [];
        // `still`: ein Ereignis, das die Welt an diesem Ort NICHT hören darf (keine Quelle ist das Soll).
        const fang = async (art, fn, warteMs, still) => {
            const a = window.__klangQuellen.length;
            const b = window.__klangAusgang.length;
            const syn0 = W.synthese();
            try {
                fn();
            } catch (e) {
                out.push({ art, fehler: String((e && e.message) || e) });
                return;
            }
            const neu = () => window.__klangQuellen.slice(a).filter((e) => e.ctx === s.ctx);
            const dl = performance.now() + (warteMs || 0);
            while (!neu().length && performance.now() < dl) await sleep(25);
            const syn1 = W.synthese();
            out.push({
                art,
                still: !!still,
                quellen: neu().map((e) => ({ art: e.art.slice(6), frames: W.frames(e.stapel) })),
                amAusgang: window.__klangAusgang
                    .slice(b)
                    .filter((e) => e.ctx === s.ctx)
                    .map((e) => W.frames(e.stapel)),
                hauptSynthese: syn1 - syn0,
            });
        };
        await fang("treffer", () => r._playKampfOneShot({ härte: 1, dichte: 0.2 }));
        // Wasser strömt zurück — am Wasser des Seeufers; auf der trockenen Wiese (das Ohr steht dort) bleibt es still.
        const wp = W.wasserPunkt;
        await fang("wasser", () => r._playWaterReactionPing(wp ? [{ cx: wp.x, cz: wp.z, r: 1 }] : []));
        const pm0 = st.playerMesh.position;
        await fang("wasserTrocken", () => r._playWaterReactionPing([{ cx: pm0.x, cz: pm0.z, r: 1 }]), 0, true);
        await fang("abschied", () => r._playArchitectureFarewellPing({ type: "kristall_geode" }));
        await fang("singen", () => {
            st.blueprints.__klangOrb = {
                name: "__klangOrb",
                label: "Linsen-Orb",
                builtIn: false,
                parts: [
                    {
                        shape: "sphere",
                        material: "quarz",
                        opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }],
                    },
                ],
            };
            r._applyCompoundWorldEffects("__klangOrb");
            delete st.blueprints.__klangOrb;
        });
        await fang(
            "tier",
            () => {
                // ein Wesen 3 m neben dem Ohr (leerer Körper → die Bezugslänge des Gesetzes)
                const c = new window.THREE.Object3D();
                c.position.set(st.playerMesh.position.x + 3, st.playerMesh.position.y, st.playerMesh.position.z);
                r._tierRuf(c, "freude");
            },
            4000
        );
        // Ein Ding im Inventar (resonierend) unter der Maus.
        await fang("inventar", () => {
            st.inventoryHoverLast = 0;
            r.playInventoryHoverPing({ resoniert: 1 });
        });
        // Ein echtes Tier, 3 m neben dem Ohr: es antwortet auf den Auftrag „folge mir" und steigt eine Stufe auf (danach
        // stehen Ort und Auftrag wie vorher). Antwortet der Weg mit einer Tier-Stimme, kommt sie aus der Werkstatt.
        const tier = (st.creatures || []).find((c) => c && c.position && c.userData && !c.userData.dying);
        if (!tier) {
            out.push({ art: "auftrag", fehler: "kein Tier in der Welt" });
            out.push({ art: "stufe", fehler: "kein Tier in der Welt" });
            return out;
        }
        const pos0 = tier.position.clone();
        const task0 = tier.userData.task ? { name: tier.userData.task.name, args: tier.userData.task.args } : null;
        const pm = st.playerMesh.position;
        tier.position.set(pm.x + 3, pm.y, pm.z);
        try {
            await fang(
                "auftrag",
                () => {
                    r.assignCreatureTask(tier, "wander", {}, { silent: true });
                    r.assignCreatureTask(tier, "follow_player");
                },
                4000
            );
            await fang("stufe", () => r._onCreatureLevelUp(tier, "gather", "holz", 3), 4000);
        } finally {
            tier.position.copy(pos0);
            r.assignCreatureTask(tier, task0 ? task0.name : "wander", task0 ? task0.args : {}, { silent: true });
        }
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
                    art: e.art.slice(6),
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
    W.endlich = (o) => JSON.parse(JSON.stringify(o, (k, v) => (v === Infinity ? 1e9 : v === -Infinity ? -999 : v)));
    W.zensus = () => (r._klangZensus() ? W.endlich(r._klangZensus()) : null);
    W.mischung = (lage) => W.endlich(window.__klangCore.umweltMischung(lage));
    return W;
}

// Die Rahmen eines Stapels als Kette der Funktionen; gebaut im Gesetzbuch, wenn klang-core.js im Stapel steht.
const kette = (frames, n = 2) =>
    frames
        .slice(0, n)
        .map((f) => f.fn)
        .join(" ← ");
const imGesetz = (frames) => frames.some((f) => f.datei === "klang-core.js");
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

// (G) DIE STAMM-KLASSE, statisch: jede Stelle im Stamm, die eine Quelle baut (createOscillator · createBufferSource ·
// createConstantSource), liegt in einer Methode, die ein benannter Wirt-Leser ist — sonst ist sie ein STAMM-LITERAL,
// beim Namen und mit Zeile, auch wenn keine Tour sie je auslöst. Kommentare zählen nicht; der Helfer leert die Leiber der
// Wirt-Leser an ihrer Definition (ein toter Wirt-Leser wirft) und nennt den Täter mit Datei und Zeile.
// Der Stamm der Überlagerung, wenn sie einen trägt (eine Form; beide wirft scripts/lib/stamm.cjs), sonst der des Baums.
const QUELL_BAU = /\.create(Oscillator|BufferSource|ConstantSource)\(/;
const STAMM_WURZEL =
    UEBER && (fs.existsSync(path.join(UEBER, stammLib.ALT)) || fs.existsSync(path.join(UEBER, stammLib.DIR)))
        ? UEBER
        : root;
// die EINE Absenz über den Helfer: außerhalb der Wirt-Leser baut keine Stelle eine Quelle; `q` die Wandlung des Vor-Stands
function stammQuellen(q) {
    const ok = stammLib.fehlt({ ausser: Object.keys(WIRT_LESER) }, QUELL_BAU, { wurzel: STAMM_WURZEL, wandel: q });
    return {
        rot: ok ? [] : [`G Stamm: ${stammLib.fehlt.wo} baut eine Klang-Quelle ohne Gesetz (außerhalb der Wirt-Leser)`],
    };
}
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
    // ARMLÄNGE: die nahe Quelle trägt den Ort (und die Spitzen-Probe P hält sie unter 0 dBFS).
    glutArm: (m) => [
        ["glut ≥ −20", m.glut.db >= -20],
        ["glut ≥ wind + 6", m.glut.db >= m.wind.db + 6],
    ],
    // Der Fall am nächsten trockenen Punkt (≤ 12 m): der kleinste Fall des Gesetzes (waterfallMinDrop 6 m) trägt dort
    // −14 − 20·lg(12/5) = −21,6 dB. Liegt der Punkt weiter (das Becken reicht bis zur Krone, `ort.fall.d`), fällt das
    // Soll mit der Ferne wie das Gesetz: −14 − 20·lg(d/5) − 0,4 (das Labor misst in 12 m).
    fallArm: (m, _alle, ort) => {
        const d = ort && ort.fall && ort.fall.d > 12 ? ort.fall.d : 12;
        const grenze = Math.round((-14 - 20 * Math.log10(d / 5) - 0.4) * 10) / 10;
        return [
            [`fall ≥ ${grenze} (in ${d} m)`, m.fall.db >= grenze],
            ["fall ≥ wind + 10", m.fall.db >= m.wind.db + 10],
        ];
    },
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
                // das Wasser an seiner Quelle weg: die EINE Wahrheit am Körper (die Nässe des Klangs liest sie)
                alt._koerperWasser = P._koerperWasser;
                P._koerperWasser = () => -Infinity;
            }
            const um0 = st.symphony.umwelt;
            if (stubs && stubs.ohneWerkstatt && um0) {
                // Selbst-Test: ein Graph, der im Haupt-Thread rechnet (ohne Lieferung der Werkstatt).
                alt.graph = um0.graph;
                alt.graph.stopAlle();
                um0.graph = window.__klangCore.umweltGraph(st.symphony.ctx, um0.bus);
            }
            const syn0 = W.synthese();
            try {
                // umstellen schwingt ein, bis der Wald steht (`W.waldSteht`); dann läuft der Ring voll, die Stimmen werden
                // bestellt, geliefert und rampen ein.
                const um = await W.umstellen(ort.x, ort.z);
                const dl = performance.now() + 2500;
                while (performance.now() < dl) {
                    W.takt();
                    await new Promise((res) => setTimeout(res, 30));
                }
                const aus = await W.ausgang(2.0);
                const laufend = W.laufend();
                const zensus = W.zensus();
                const syn1 = W.synthese();
                const bp = st.playerMesh.position;
                const baeume = W.bestand(bp.x, bp.z, 15);
                return { name, ort, um, aus, laufend, zensus, baeume, hauptSynthese: syn1 - syn0 };
            } finally {
                if (alt._koerperWasser) P._koerperWasser = alt._koerperWasser;
                if (alt.graph) {
                    um0.graph.stopAlle();
                    um0.graph = alt.graph;
                }
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
            for (const k of Object.keys(mix))
                solo[k] = k === name ? mix[k] : Object.assign({}, mix[k], { db: -Infinity });
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
                gesetzDb: +mix[name].db.toFixed(1),
                gemessenDb: +(10 * Math.log10(q / n / 2 + 1e-20) + 3.01).toFixed(1),
                schwerpunktHz: Math.round(sf / Math.max(1e-20, sw)),
            };
        }
        return out;
    }, lage);
}

// (P) DIE SPITZEN-PROBE: die ganze Mischung eines Ortes (alle hörbaren Stimmen) offline über 9 s durch den Welt-Master
// und die Spitzen-Wand (klang:umweltSpitze) — Spitze und RMS am Ausgang in dBFS. `mitWand` false misst ohne Wand.
async function offlineSpitze(page, lage, mitWand) {
    return page.evaluate(
        async (lage, mitWand) => {
            const K = window.__klangCore;
            if (typeof lage === "string") lage = K.UMWELT.orte[lage];
            const sr = 48000;
            const sek = 9;
            const ctx = new OfflineAudioContext(2, sr * sek, sr);
            const m = ctx.createGain();
            m.gain.value = K.UMWELT.masterBasis;
            const wand = mitWand ? K.umweltSpitze(ctx) : null;
            if (wand) {
                m.connect(wand.eingang);
                wand.ausgang.connect(ctx.destination);
            } else m.connect(ctx.destination);
            K.umweltGraph(ctx, m).anwenden(K.umweltMischung(lage), 0);
            const b = await ctx.startRendering();
            let pk = 0;
            let q = 0;
            const i0 = sr * 1.5;
            for (let c = 0; c < 2; c++) {
                const x = b.getChannelData(c);
                for (let i = i0; i < x.length; i++) {
                    const v = Math.abs(x[i]);
                    if (v > pk) pk = v;
                    q += x[i] * x[i];
                }
            }
            const db = (v) => (v > 0 ? +(20 * Math.log10(v)).toFixed(1) : -200);
            return { wand: !!wand, spitzeDbfs: db(pk), rmsDbfs: db(Math.sqrt(q / (2 * (b.length - i0)))) };
        },
        lage,
        mitWand
    );
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
        // zählt eine Welt-Abfrage im Takt, der erste Fragende beim Namen
        const zaehle = (k) => {
            if (!imTakt) return;
            zaehl[k]++;
            if (wer[k]) return;
            const m = /at (?:\S+\.)?(\S+) \(/.exec((new Error().stack || "").split("\n")[3] || "");
            wer[k] = m ? m[1] : "?";
        };
        const fns = {
            _voxelSurfaceY: "boden",
            _koerperWasser: "wasser",
            _waterLevelAt: "wasser",
            _waterFlowAt: "stroemung",
            _hydroRiverAt: "fluss",
            _pointSegDist2D: "segmente",
        };
        const alt = {};
        for (const [fn, k] of Object.entries(fns)) {
            alt[fn] = P[fn];
            P[fn] = function () {
                zaehle(k);
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
                if (typeof k === "string" && /^\d+$/.test(k)) zaehle("bauten");
                return Reflect.get(t, k, rcv);
            },
        });
        // der Zwilling der Glut (S4): statt des Verzeichnisses (`_blockerMit("glut")`) ein Umlauf über ALLE Bauten
        const altMit = P._blockerMit;
        if (stubs && stubs.alleBauten && altMit) {
            P._blockerMit = function (name) {
                if (name !== "glut") return altMit.call(this, name);
                return this.state.architectures.filter((e) => e && this._glutFlaeche(e) > 0);
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
                altArchs.push({
                    type: "glutbrunnen",
                    position: { x: p.x + 5000 + i, y: 0, z: p.z + 5000 },
                    __klangFake: true,
                });
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
            for (let i = altArchs.length - 1; i >= 0; i--)
                if (altArchs[i] && altArchs[i].__klangFake) altArchs.splice(i, 1);
            if (altRivers) hydro.rivers = altRivers;
            st.architectures = altArchs;
            P.symphonyTick = altTick;
            for (const fn of Object.keys(alt)) P[fn] = alt[fn];
            if (altMit) P._blockerMit = altMit;
        }
        const wachsen = [];
        for (const k of Object.keys(vor))
            if (nach[k] > vor[k] * 1.25 + 2) wachsen.push(`${k} ${vor[k]} → ${nach[k]} (${wer[k] || "?"})`);
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
            if (!o.weltModus) return o;
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

function urteile(daten, offline, lab, ereig, phasen, spitzen) {
    const rot = [];
    const zeilen = [];
    const mixAlle = {};
    // (W) DIE WERKSTATT: der Haupt-Thread rechnet keinen Sample (Texturen, Rufe) — weder auf der Anreise noch an einem
    // Ort, in den Kosten-Takten oder für ein Ereignis.
    const werkstatt = (wo, n) => {
        if (n > 0) rot.push(`W ${wo}: ${n} Samples im Haupt-Thread gerechnet (rechnen darf nur die Klang-Werkstatt)`);
    };
    for (const [wo, n] of Object.entries(phasen || {})) werkstatt(wo, n);
    // (E) Ereignis-Klänge: jede Quelle aus dem Gesetzbuch, keine Verbindung am Master vorbei.
    for (const e of ereig || []) {
        if (e.fehler) {
            rot.push(`E ${e.art}: wirft (${e.fehler})`);
            continue;
        }
        werkstatt(e.art, e.hauptSynthese);
        if (e.still) {
            if (e.quellen.length)
                rot.push(
                    `E ${e.art}: ${e.quellen.length} Quelle(n), wo die Welt still ist (${kette(e.quellen[0].frames, 3)})`
                );
            continue;
        }
        if (!e.quellen.length) rot.push(`E ${e.art}: keine Quelle (stumm)`);
        for (const q of e.quellen)
            if (!imGesetz(q.frames)) rot.push(`E ${e.art}: ${q.art} aus ${kette(q.frames)} trägt kein Gesetz`);
        for (const a of e.amAusgang)
            rot.push(`E ${e.art}: ${kette(a)} verbindet am Master vorbei direkt an den Ausgang`);
    }
    for (const [name, d] of Object.entries(daten)) {
        // (G) Herkunft
        for (const q of d.laufend) {
            const f0 = q.frames[0] || {};
            const imKern = imGesetz(q.frames);
            const leser = q.frames.map((f) => WIRT_LESER[f.fn]).find(Boolean);
            q.herkunft = imKern ? "Gesetzbuch" : leser ? "Wirt-Leser " + leser : "STAMM-LITERAL " + f0.fn;
            if (!imKern && !leser)
                rot.push(
                    `G ${name}: ${q.art} ${q.freq ? Math.round(q.freq) + " Hz " : ""}aus ${kette(q.frames)} trägt kein Gesetz`
                );
        }
        // (O) der Ort steht: die Stimmen des Walds hört nur, wer ihn gepflanzt findet (`W.waldSteht`)
        if (d.um && d.um.wald === false)
            rot.push(
                `O ${name}: der Wald steht nach ${d.um.waldTakte} Takten nicht (Schlange, Pflanz-Gang oder Streu wartet)`
            );
        // (W) die Welt rechnet in der Werkstatt
        werkstatt(name, d.hauptSynthese);
        if (d.zensus && !(d.zensus.werkstatt && d.zensus.werkstatt.laeuft))
            rot.push(`W ${name}: keine Klang-Werkstatt`);
        // (H) Hörbar-Kosten
        const z = d.zensus;
        const stimmen = z ? z.stimmen : [];
        const sumQuellen = stimmen.filter((v) => v.an).reduce((a, v) => a + v.quellen, 0);
        const dauernd = d.laufend.filter((q) => q.dauernd);
        for (const q of dauernd) {
            if (!q.gesetzKnoten) rot.push(`H ${name}: dauernde Quelle ohne Gesetz-Stimme (${kette(q.frames)})`);
        }
        const imKnoten = dauernd.filter((q) => q.gesetzKnoten).length;
        if (z && imKnoten !== sumQuellen)
            rot.push(`H ${name}: ${imKnoten} laufende Gesetz-Quellen ≠ ${sumQuellen} der hörbaren Stimmen`);
        for (const v of stimmen)
            if (v.an && !(v.db >= -68))
                rot.push(`H ${name}: Stimme ${v.name} läuft bei ${v.db} dB (unter der Hörschwelle)`);
        // (S) SOLL
        const m = d.mixMitte;
        if (m) mixAlle[name] = m;
        zeilen.push({ name, d, stimmen, dauernd: dauernd.length });
    }
    for (const [name, m] of Object.entries(mixAlle)) {
        if (!SOLL[name]) continue;
        for (const [txt, ok] of SOLL[name](m, mixAlle, daten[name] && daten[name].ort))
            if (!ok) rot.push(`S ${name}: ${txt} verfehlt`);
    }
    // Der Wald-Ort ist aus der Kronen-Karte gewählt, die auch das Ohr liest — geprüft wird er am BESTAND, an den
    // Objekten der Welt (stehende Bäume ≤ 15 m, Einträge + Streu-Zellen): mindestens doppelt so dicht wie die Wiese.
    if (daten.wald && daten.wiese && !(daten.wald.baeume > 0 && daten.wald.baeume >= 2 * daten.wiese.baeume))
        rot.push(
            `S wald: der Bestand trägt keinen Wald (${daten.wald.baeume} Bäume ≤ 15 m, Soll ≥ 2 × Wiese ${daten.wiese.baeume})`
        );
    for (const name of Object.keys(SOLL))
        if (!mixAlle[name])
            rot.push(
                daten[name]
                    ? `S ${name}: kein Umwelt-Gesetz am Ohr (Lage/Mischung fehlt)`
                    : `O ${name}: der Ort fehlt (aus dem Gesetz nicht gefunden)`
            );
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
    // (P) keine Spitze erreicht 0 dBFS am Ausgang (die Spitzen-Wand hält sie unter UMWELT.spitze.deckeDb).
    for (const [wo, sp] of Object.entries(spitzen || {}))
        if (sp && sp.spitzeDbfs >= 0)
            rot.push(
                `P ${wo}: Spitze ${sp.spitzeDbfs} dBFS am Ausgang (${sp.wand ? "trotz" : "ohne"} Spitzen-Wand) — Clipping`
            );
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
            const k = `${q.herkunft} · ${q.art}${q.freq ? " " + Math.round(q.freq) + " Hz" : ""} · ${kette(q.frames)}`;
            grup[k] = (grup[k] || 0) + 1;
        }
        console.log(`   laufende Quellen: ${d.laufend.length} (dauernd ${dauernd})`);
        for (const [k, n] of Object.entries(grup)) console.log(`     ${n}× ${k}`);
        const ws = d.zensus && d.zensus.werkstatt;
        console.log(
            `   Synthese im Haupt-Thread: ${d.hauptSynthese} Samples` +
                (ws
                    ? ` · Werkstatt: ${ws.laeuft ? "läuft" : "FEHLT"}, Pakete ${ws.geliefert}/${ws.bestellt}, Rufe ${ws.rufeGespielt}/${ws.rufeBestellt}`
                    : "")
        );
        if (offline && offline[name])
            for (const [s, v] of Object.entries(offline[name]))
                console.log(
                    `   offline ${s.padEnd(7)} Gesetz ${v.gesetzDb} dB · gemessen ${v.gemessenDb} dB · Schwerpunkt ${v.schwerpunktHz} Hz`
                );
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

// (T) DER KLANG-TAKT IN BEWEGUNG (`--takt [--echt]`, klang.K5): je präsentiertem Bild die Haupt-Faden-ms der Klang-Arbeit
// (symphonyTick + _schrittKlangTick + _tierRuf, der äußere Aufruf) im echten Spiel, Klang über den Knopf — gehen, Fahrt
// (GT, Gas und rückwärts im Wechsel), nachts gehen; p95 ≤ TAKT_SOLL_MS je Phase, der Träger der Bilder über dem Soll beim
// Namen; über den Gang 0 Aussetzer am Ausgang. Die Seite ist isoliert (COOP + COEP: 5 µs statt des 100-µs-Rasters).
// `--echt`: Fenster, echte GPU und Audio-Gerät. `--minuten`: der Spielgang, gehen · Fahrt · nachts zu 4 : 3 : 3.
// `--selftest`: Phase „selbst", der Takt fragt je Bild 300 Rufer → ROT, eine stotternde Stimme → Aussetzer gezählt.
const TAKT_SOLL_MS = 0.2;
const MINUTEN = Number(opt("--minuten")) || 0;
const TAKT_TEILE = [
    "_lofiPlayChord",
    "_lofiPlayMelody",
    "_lofiPlayGroove",
    "_lofiPlayBass",
    "_lofiRaum",
    "_umweltLage",
    "_tierRufTakt",
    "_fahrtKlangTick",
    "_schrittMaterialAt",
    "_playSchrittOneShot",
];
function taktSeite(m, echt, namen) {
    const r = window.anazhRealm;
    const st = r.state;
    const P = Object.getPrototypeOf(r);
    const T = (window.__klangTakt = { phase: "", bilder: [], weg: 0, m });
    let tiefe = 0;
    let b = { ms: 0, schreiben: 0, teile: {} }; // das laufende Bild
    const huelle = (o, fn, nach, tief = 0) => {
        const org = o[fn];
        o[fn] = function () {
            const t = performance.now();
            tiefe += tief;
            try {
                return org.apply(this, arguments);
            } finally {
                tiefe -= tief;
                nach(performance.now() - t);
            }
        };
    };
    // der äußere Aufruf zählt (ein innerer liegt in ihm), dazu jede Parameter-Schreibung in ihm
    for (const fn of ["symphonyTick", "_schrittKlangTick", "_tierRuf"]) huelle(P, fn, (d) => tiefe || (b.ms += d), 1);
    for (const fn of namen) if (P[fn]) huelle(P, fn, (d) => (b.teile[fn] = (b.teile[fn] || 0) + d));
    for (const fn of ["setValueAtTime", "setTargetAtTime", "linearRampToValueAtTime", "exponentialRampToValueAtTime"])
        huelle(AudioParam.prototype, fn, () => tiefe && b.schreiben++);
    let vor = null;
    const bild = () => {
        const e = st.player && st.player.mountedArch != null ? window.__klangGT : null;
        const q = e ? e.position : st.playerMesh.position;
        if (vor && vor.q === q) T.weg += Math.hypot(q.x - vor.x, q.z - vor.z);
        vor = { q, x: q.x, z: q.z };
        if (T.phase) T.bilder.push(b);
        b = { ms: 0, schreiben: 0, teile: {} };
        requestAnimationFrame(bild);
    };
    requestAnimationFrame(bild);
    // der Null-Renderer zeichnet nicht: hier trägt die Linse den Takt des Spiels (das Fenster trägt ihn selbst)
    const takt = (t) => (r._gameLoopTick(t), requestAnimationFrame(takt));
    if (!echt) requestAnimationFrame(takt);
    st.playerMesh.position.set(m.x, r._voxelSurfaceY(m.x, m.z) + 1.8, m.z);
    document.getElementById("anazh-symphony-toggle").click();
    T.start = (p) => Object.assign(T, { phase: p, bilder: [], weg0: T.weg });
    T.urteil = (soll) => {
        T.phase = "";
        const s = T.bilder.map((x) => x.ms).sort((x, y) => x - y);
        const q = (k) => +(s[Math.min(s.length - 1, Math.floor(k * s.length))] || 0).toFixed(2);
        const ueber = T.bilder.filter((x) => x.ms > soll);
        const last = {};
        for (const x of ueber) for (const k in x.teile) last[k] = (last[k] || 0) + x.teile[k] / ueber.length;
        return {
            bilder: s.length,
            weg: Math.round(T.weg - T.weg0),
            p95: q(0.95),
            max: q(1),
            schreiben: +(T.bilder.reduce((a, x) => a + x.schreiben, 0) / s.length).toFixed(2),
            traeger: Object.entries(last)
                .sort((u, v) => v[1] - u[1])
                .slice(0, 3)
                .map(([k, v]) => `${k} ${v.toFixed(2)}`),
        };
    };
    // der Aussetzer-Zähler am Ausgang (AudioContext.playbackStats), dazu ob es noch der Kontext des ersten Abrufs ist
    T.audio = () => {
        const c = st.symphony.ctx,
            p = c && c.playbackStats;
        T.ctx = T.ctx || c;
        return p && { n: p.underrunEvents, still: p.underrunDuration, s: p.totalDuration, gleich: T.ctx === c };
    };
    T.uhr = () => (st.symphony.ctx || { currentTime: NaN }).currentTime;
    // sein Täter: eine Worklet-Stimme rechnet je Render-Quantum (2,7 ms) 8 ms
    T.stotterer = async () => {
        await st.symphony.ctx.audioWorklet.addModule("/__stotter.js");
        new AudioWorkletNode(st.symphony.ctx, "stotter").connect(st.symphony.ctx.destination);
    };
    // der Täter des Takts: 300 Rufer im Hör-Radius, und der Takt fragt sie je Bild (statt im Misch-Takt)
    T.taeter = () => {
        for (let i = 0; i < 300; i++)
            st.creatures.push({
                position: { x: m.x + (i % 20) * 2, y: 0, z: m.z + Math.floor(i / 20) * 2 },
                userData: { emotions: { joy: 0.5 } },
            });
        const alt = P._umweltKlangTick;
        P._umweltKlangTick = function () {
            alt.apply(this, arguments);
            for (const c of st.creatures) this._koerperWasser(c.position.x, c.position.z, 0);
            this._tierRufTakt(1 / 60);
        };
    };
    return { isoliert: self.crossOriginIsolated, tiere: st.creatures.length };
}
// Gehen: W gehalten, je 60 Bilder ein Tipp auf A. Fahrt (`pendeln`): je 120 Bilder Gas (W) und rückwärts (S) im Wechsel —
// der Motor dreht hoch und runter, der GT bleibt in der Lichtung der Mess-Wiese. Die Taste hält bis zum Bild, nie nach der Uhr;
// `sek`: die Phase geht, bis der Ausgang so lange spielte (die Uhr des Klangs).
async function taktPhase(page, phase, n, pendeln, sek = 0) {
    const uhr = () => page.evaluate(() => window.__klangTakt.uhr());
    const t0 = await page.evaluate((p) => (window.__klangTakt.start(p), window.__klangTakt.uhr()), phase);
    for (let i = 0; i < n || (await uhr()) - t0 < sek; i++) {
        const taste = pendeln && Math.floor(i / 2) % 2 ? "s" : "w";
        await halteBis(page, { taste, ziel: (b) => window.__klangTakt.bilder.length >= b, args: [60 * (i + 1)] });
        if (!pendeln) await page.keyboard.press("a", { delay: 70 });
    }
    const z = await page.evaluate((soll) => window.__klangTakt.urteil(soll), TAKT_SOLL_MS);
    console.log(
        `── ${phase}: Klang-ms je Bild p95 ${z.p95} · max ${z.max} (${z.bilder} Bilder, ${z.weg} m) · ${z.schreiben} Parameter-Schreibungen je Bild · über dem Soll trägt ${z.traeger.join(" · ") || "—"}`
    );
    return z;
}
async function takt(page, erg) {
    erg.seite = await page.evaluate(taktSeite, MESS, ECHT, TAKT_TEILE);
    console.log("Klang-Takt:", JSON.stringify(erg.seite));
    // bereit: W gehalten, bis der Spieler geht (die Ankunft gibt die Kontrolle frei; im Fenster kalt bis 80 s)
    await halteBis(page, { taste: "w", ziel: () => window.__klangTakt.weg >= 3, frist: 180000 });
    await taktPhase(page, "ein", 5);
    const audio = () => page.evaluate(() => window.__klangTakt.audio());
    const a = await audio();
    const ph = (erg.phasen = {});
    ph.gehen = await taktPhase(page, "gehen", 20, false, MINUTEN * 24);
    // zurück in die Mitte der Lichtung, der GT daneben, aufsitzen
    await page.evaluate(async () => {
        const r = window.anazhRealm,
            p = r.state.playerMesh.position,
            m = window.__klangTakt.m;
        p.set(m.x, r._voxelSurfaceY(m.x, m.z) + 1.8, m.z);
        const e = (window.__klangGT = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: p.x + 3, y: r.getTerrainHeightAt(p.x + 3, p.z) + 0.5, z: p.z },
            { silent: true, precise: true }
        ));
        await window.__gebautNach(e);
        r.mountArchitecture(e);
    });
    ph.fahrt = await taktPhase(page, "fahrt", 20, true, MINUTEN * 18);
    ph.fahrt.sattel = await page.evaluate(() => !!window.anazhRealm.state.symphony.fahrt);
    await page.evaluate(() => {
        const r = window.anazhRealm;
        r.dismountArchitecture();
        r.setTimeOfDay(0, "regler");
    });
    ph.nacht = await taktPhase(page, "nacht", 20, false, MINUTEN * 18);
    const b = await audio();
    const aus =
        a && b && b.gleich
            ? { n: b.n - a.n, still: +(b.still - a.still).toFixed(3), s: +(b.s - a.s).toFixed(1) }
            : null;
    erg.aussetzer = aus;
    console.log(
        `── Aussetzer am Ausgang: ${aus ? `${aus.n} in ${aus.s} s Wiedergabe (${aus.still} s still)` : "ungezählt"}`
    );
    const rot = (erg.rot = []);
    if (!aus) rot.push("T aussetzer: ungezählt — kein playbackStats am Kontext, oder er wechselte");
    else if (aus.n) rot.push(`T aussetzer: ${aus.n} in ${aus.s} s Wiedergabe`);
    for (const [name, z] of Object.entries(ph)) {
        if (!(z.bilder >= 300 && z.weg >= 10))
            rot.push(`T ${name}: ${z.bilder} Bilder, ${z.weg} m — keine Bewegung gemessen`);
        else if (!(z.p95 <= TAKT_SOLL_MS))
            rot.push(
                `T ${name}: Klang-ms je Bild p95 ${z.p95} > ${TAKT_SOLL_MS} (max ${z.max}; trägt ${z.traeger.join(" · ")})`
            );
    }
    if (!ph.fahrt.sattel) rot.push("T fahrt: die Stimme der Fahrt klang nicht (nicht im Sattel)");
    let feuert = true;
    if (SELBST) {
        await page.evaluate(() => window.__klangTakt.taeter());
        const s0 = await audio();
        await page.evaluate(() => window.__klangTakt.stotterer());
        erg.selbst = await taktPhase(page, "selbst", 10);
        const s1 = await audio();
        erg.selbst.aussetzer = s0 && s1 ? s1.n - s0.n : null;
        feuert = erg.selbst.p95 > TAKT_SOLL_MS && erg.selbst.aussetzer > 0;
        console.log(
            `${feuert ? "✅" : "❌"} SELBSTTEST: der Takt, der je Bild 300 Rufer fragt, ist ${erg.selbst.p95 > TAKT_SOLL_MS ? "ROT" : "unbemerkt"} (p95 ${erg.selbst.p95} ms) · die stotternde Stimme zählt ${erg.selbst.aussetzer} Aussetzer`
        );
    }
    for (const t of rot) console.log("   " + t);
    console.log(
        rot.length
            ? `❌ ROT — Klang-Takt in Bewegung: ${rot.length} Befund(e)`
            : `✅ GRÜN — Klang-Takt in Bewegung p95 ≤ ${TAKT_SOLL_MS} ms je Bild (gehen · Fahrt · nachts)`
    );
    return rot.length === 0 && feuert ? 0 : 1;
}

// DER ZENSUS (O · Z · G · H · S · K · E · L · W · A · P) an den Orten aus dem Gesetz.
async function zensus(page, browser, ergebnis) {
    await page.evaluate(AUSGABE_INSTALL);
    await page.evaluate(`window.__klangW = (${werkzeug.toString()})();`);
    // Symphonie an, die Musik ruht (die Linse misst die WELT), die Tiere halten still.
    const init = await page.evaluate(() => {
        const r = window.anazhRealm;
        window.__tiereHalten();
        const P = Object.getPrototypeOf(r);
        P._lofiTick = function () {};
        const ok = r.initSymphony();
        return { ok, laeuft: r.state.symphony.ctx && r.state.symphony.ctx.state };
    });
    console.log("Symphonie:", JSON.stringify(init));
    // Der Synthese-Zähler je Welt-Phase (die Offline-Renders rechnen für die LINSE, nie gezählt).
    const syn = () => page.evaluate(() => window.__klangW.synthese());
    const phasen = {};
    // Die Orte.
    let s0 = await syn();
    await page.evaluate((m) => window.__klangW.umstellen(m.x, m.z), MESS);
    const orte = await page.evaluate((m) => window.__klangW.orte(m.x, m.z), MESS);
    phasen.anreise = (await syn()) - s0;
    console.log("Orte:", JSON.stringify(orte));
    const daten = {};
    const offline = {};
    // die nahen Orte zuerst, dann die fernen (Seeufer und Fall liegen Kilometer weit — kehrt die Tour von dort zurück,
    // pflanzt der Wald seinen Bestand neu)
    for (const name of ["wiese", "wald", "dorf", "glutArm", "seeufer", "fallArm"]) {
        if (!orte[name]) continue;
        daten[name] = await messeOrt(page, name, orte[name]);
        const z = daten[name].zensus;
        if (z && z.lage) {
            const lageMitte = Object.assign({}, z.lage, { boe: 0.7 });
            daten[name].mixMitte = await page.evaluate((l) => window.__klangW.mischung(l), lageMitte);
            offline[name] = await offlineRender(page, lageMitte);
        }
    }
    s0 = await syn();
    await page.evaluate((m) => window.__klangW.umstellen(m.x, m.z), MESS);
    const kostenErg = await kosten(page);
    phasen.kosten = (await syn()) - s0;
    const ereig = await page.evaluate(() => window.__klangW.ereignisse());
    const lab = await labPruefen(browser);
    // (P) die Spitzen-Probe: jeder Welt-Ort (mittlere Böe) und jeder Lab-Ort des Gesetzes, mit der Spitzen-Wand.
    const spitzen = {};
    for (const [name, d] of Object.entries(daten))
        if (d.zensus && d.zensus.lage)
            spitzen[name] = await offlineSpitze(page, Object.assign({}, d.zensus.lage, { boe: 0.7 }), true);
    const labOrte = await page.evaluate(() => Object.keys(window.__klangCore.UMWELT.orte));
    for (const o of labOrte) spitzen["lab:" + o] = await offlineSpitze(page, o, true);
    const { rot, zeilen } = urteile(daten, offline, lab, ereig, phasen, spitzen);
    for (const w of kostenErg.wachsen) rot.push(`K: ${w} wächst mit der Welt`);
    // (G) die Stamm-Klasse, statisch: jede Quell-Stelle des Stamms in einem Wirt-Leser.
    const stamm = stammQuellen();
    for (const t of stamm.rot) rot.push(t);
    ergebnis.stamm = stamm;
    console.log(
        `\n── STAMM-KLASSE (statisch): ${stamm.rot.length ? "eine Quell-Stelle ohne Gesetz" : "jede Quell-Stelle des Stamms in einem Wirt-Leser"} (Wirt-Leser: ${Object.keys(WIRT_LESER).join(" · ")})`
    );
    drucke(zeilen, offline, kostenErg, lab);
    // Die Summe der Welt über die Tour (Anreise + Orte + Kosten-Takte + Ereignisse; ein werfendes Ereignis ist E).
    const summe = [phasen.anreise, phasen.kosten]
        .concat(Object.values(daten).map((d) => d.hauptSynthese))
        .concat(ereig.map((e) => e.hauptSynthese || 0))
        .reduce((a, v) => a + v, 0);
    console.log(
        `\n── SYNTHESE IM HAUPT-THREAD über die Tour: ${summe} Samples ` +
            `(Anreise ${phasen.anreise} · Orte ${Object.entries(daten)
                .map(([n, d]) => n + " " + d.hauptSynthese)
                .join(
                    " · "
                )} · Kosten-Takte ${phasen.kosten} · Ereignisse ${ereig.map((e) => e.art + " " + e.hauptSynthese).join(" · ")})`
    );
    ergebnis.hauptSynthese = { summe, phasen };
    console.log(
        "\n── SPITZEN am Ausgang (offline, 9 s, mittlere Böe, Spitze/RMS dBFS): " +
            Object.entries(spitzen)
                .map(([wo, sp]) =>
                    sp ? `${wo} ${sp.spitzeDbfs}/${sp.rmsDbfs}${sp.wand ? "" : " ohne Wand"}` : `${wo} —`
                )
                .join(" · ")
    );
    ergebnis.spitzen = spitzen;
    console.log("\n── EREIGNISSE (je einmal über den echten Weg ausgelöst)");
    for (const e of ereig)
        console.log(
            `   ${e.art.padEnd(9)} ${
                e.fehler
                    ? "WIRFT " + e.fehler
                    : `${e.quellen.length} Quelle(n): ${e.quellen
                          .map((q) => (imGesetz(q.frames) ? "Gesetzbuch " : "STAMM ") + kette(q.frames))
                          .join(" · ")}${e.amAusgang.length ? " · AM MASTER VORBEI" : ""} · Haupt-Thread-Synthese ${
                          e.hauptSynthese === null ? "unmessbar" : e.hauptSynthese + " Samples"
                      }`
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
        if (!uS.some((t) => /^H wiese: .*stummeSchleife/.test(t)))
            fehl.push("S2: die stumme Schleife bleibt unbenannt");
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
        await page.evaluate((m) => window.__klangW.umstellen(m.x, m.z), MESS);
        const k4 = await kosten(page, { alleBauten: true });
        if (!k4.wachsen.some((t) => /^bauten/.test(t)))
            fehl.push("S4: der Voll-Umlauf über alle Bauten bleibt unbemerkt");
        // S5: ein Ereignis-Zwilling (Glocke aus dem Stamm, direkt an den Ausgang).
        const e5 = await page.evaluate(async () => {
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
                return await window.__klangW.ereignisse();
            } finally {
                P._playWaterReactionPing = alt;
            }
        });
        const u5 = urteile({}, null, null, e5).rot;
        if (!u5.some((t) => /^E wasser: .*zwillingGlocke.*kein Gesetz/.test(t)))
            fehl.push("S5: der Ereignis-Zwilling bleibt unbenannt");
        if (!u5.some((t) => /^E wasser: .*am Master vorbei/.test(t)))
            fehl.push("S5: die Verbindung am Master vorbei bleibt unbemerkt");
        // S6: ein Ort, dessen Graph im Haupt-Thread rechnet (ohne Lieferung der Werkstatt).
        if (orte.seeufer) {
            const d6 = await messeOrt(page, "seeufer", orte.seeufer, { ohneWerkstatt: true });
            const u6 = urteile({ seeufer: d6 }, null, null).rot;
            if (!u6.some((t) => /^W seeufer: \d+ Samples im Haupt-Thread/.test(t)))
                fehl.push("S6: der Graph ohne Werkstatt bleibt unbemerkt");
        }
        // S7: ein Ruf, der im Haupt-Thread rechnet (der Zwilling ruft das Gesetzbuch direkt im Spiel-Takt).
        const e7 = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const P = Object.getPrototypeOf(r);
            const alt = P._tierRuf;
            P._tierRuf = function zwillingRuf(_c, stimmung) {
                const s = this.state.symphony;
                return s.umwelt.kern.tierRuf(s.ctx, s.umwelt.bus, {
                    laengeM: 1,
                    stimmung,
                    d: 3,
                    pan: 0,
                    saat: 5,
                });
            };
            try {
                return await window.__klangW.ereignisse();
            } finally {
                P._tierRuf = alt;
            }
        });
        const u7 = urteile({}, null, null, e7).rot;
        if (!u7.some((t) => /^W tier: \d+ Samples im Haupt-Thread/.test(t)))
            fehl.push("S7: der Ruf im Haupt-Thread bleibt unbemerkt");
        // S8: die Glut auf Armlänge (Lab-Ort des Gesetzes) OHNE Spitzen-Wand clippt — und die Probe nennt es.
        const s8 = await offlineSpitze(page, "glutArm", false);
        const u8 = urteile({}, null, null, [], {}, { "lab:glutArm": s8 }).rot;
        if (!u8.some((t) => /^P lab:glutArm: Spitze .*ohne Spitzen-Wand/.test(t)))
            fehl.push(`S8: die Glut auf Armlänge ohne Spitzen-Wand bleibt unbemerkt (${s8 && s8.spitzeDbfs} dBFS)`);
        // S9: ein Ping-Zwilling im Stamm-Text — eine Methode, die einen Oszillator baut, ohne Wirt-Leser zu sein (keine
        // Tour löst sie aus; die statische Linse nennt sie trotzdem beim Namen).
        const s9 = stammQuellen((t) => {
            const nach = stammLib.glieder(t)[0].ende; // hinter das erste Glied der Klasse (die Methode am AST)
            const ping =
                "\n    zwillingPing(\n        tags\n    ) {\n        const o = this.state.symphony.ctx.createOscillator();\n    }";
            return t.slice(0, nach) + ping + t.slice(nach);
        });
        if (
            !s9.rot.some((t) => /^G Stamm: Zeile \d+ `\.createOscillator\(` baut eine Klang-Quelle ohne Gesetz/.test(t))
        )
            fehl.push("S9: der Ping-Zwilling im Stamm bleibt unbenannt");
        // S10: ein Wald-Ort, an dem die Karte Wald sagt, aber kein Baum steht — der Bestand nennt es.
        if (daten.wald && daten.wiese) {
            const d10 = { wiese: daten.wiese, wald: Object.assign({}, daten.wald, { baeume: 0 }) };
            if (!urteile(d10, null, null).rot.some((t) => /^S wald: der Bestand trägt keinen Wald/.test(t)))
                fehl.push("S10: ein Wald ohne Bäume bleibt unbemerkt");
        } else fehl.push("S10: kein Wald-/Wiesen-Ort gemessen");
        // S11: ein Wasser-Hauch, der den Fußabdruck nicht liest (er klänge auch auf trockenem Land) — die Tour nennt es.
        const e11 = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const P = Object.getPrototypeOf(r);
            const alt = P._playWaterReactionPing;
            P._playWaterReactionPing = function zwillingHauch() {
                this._substanzKlang("wasser", null);
            };
            try {
                return await window.__klangW.ereignisse();
            } finally {
                P._playWaterReactionPing = alt;
            }
        });
        if (
            !urteile({}, null, null, e11).rot.some((t) =>
                /^E wasserTrocken: \d+ Quelle\(n\), wo die Welt still ist/.test(t)
            )
        )
            fehl.push("S11: der Wasser-Hauch auf trockenem Land bleibt unbemerkt");
        for (const t of fehl) console.log("   ❌ " + t);
        if (!fehl.length)
            console.log(
                "   ✅ S1 Zwilling beim Namen · S2 stumme Schleife beim Namen · S3 Seeufer ohne Wasser rot · S4 Voll-Umlauf rot · S5 Ereignis-Zwilling + Master-Umweg beim Namen · S6 Graph ohne Werkstatt rot · S7 Ruf im Haupt-Thread rot · S8 Glut auf Armlänge ohne Spitzen-Wand rot · S9 Ping-Zwilling im Stamm beim Namen · S10 Wald ohne Bestand rot · S11 Wasser-Hauch auf trockenem Land beim Namen"
            );
        selbstOk = fehl.length === 0;
        ergebnis.selbsttest = fehl;
    }
    console.log("");
    if (rot.length) {
        console.log(`❌ ROT — ${rot.length} Befund(e):`);
        for (const t of rot) console.log("   " + t);
    } else
        console.log(
            "✅ GRÜN — jede klingende Quelle trägt ein Gesetz, kostet nur hörbar, jeder Ort hält sein SOLL, Lab = Welt."
        );
    return rot.length === 0 && selbstOk ? 0 : 1;
}

(async () => {
    if (TAKT)
        server.prependListener("request", (_q, res) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({
        art: ECHT ? "echt" : "null",
        headless: !ECHT,
        frist: 600000,
        zusatz: ["--autoplay-policy=no-user-gesture-required"],
    });
    let exit = 1;
    const ergebnis = {};
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(590000);
        page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
        if (!ECHT) await nullRenderer(page);
        // der Quellen-Abgriff kostet je Quelle einen Stapel — der Takt misst ohne ihn
        if (!TAKT) await page.evaluateOnNewDocument(quellenAbgriff);
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 180000 });
        await warteAufWelt(page, 180000);
        exit = await (TAKT ? takt(page, ergebnis) : zensus(page, browser, ergebnis));
    } catch (e) {
        console.log("FEHLER:", e && e.stack ? e.stack : e);
    } finally {
        if (JSON_AUS)
            fs.writeFileSync(
                JSON_AUS,
                JSON.stringify(ergebnis, (k, v) => (v === -Infinity ? "-Infinity" : v), 1)
            );
        await browser.close();
        server.close();
        process.exit(exit);
    }
})();
