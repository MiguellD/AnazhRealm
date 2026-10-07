#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-klang-zensus.cjs — DIE KLANG-LINSE (npm run gate:klang-zensus, Welle 5 Klang)
//
// Die Frage je Ort: WAS hört man dort, und trägt jede klingende Quelle ein GESETZ —
// oder ist sie ein Stamm-Literal? Und kostet sie nur, solange man sie hört?
//
//  (O) DIE ORTE aus dem Gesetz gefunden (Standard-Saat, Null-Renderer): Wiese = die
//      Mess-Wiese (−900/−850) · Seeufer = der nächste trockene Punkt, 3–7 m vor stillem
//      Wasser · Waldinneres = der Punkt höchster Kronen-Deckung der Kronen-Karte (`_kronenStreuAt`: die EINE
//      Quelle, wo Wald STEHT — das Ohr liest dieselbe; geprüft wird sie am Bestand: die stehenden Bäume ≤ 15 m,
//      Einträge + Streu-Zellen, gezählt an den Objekten, nie an der Karte) · Dorf = 4 m neben dem nächsten Glut-Bau
//      (Teile aus Material „glut", Brenn-Fläche > 0).
//  (Z) DER ZENSUS je Ort (Bühne Mittag · Sonne · Sommer, Tiere halten, die Musik ruht):
//      jede gestartete Quelle (Oszillator/Puffer/Konstante) mit ihrem ERZEUGER (Datei +
//      Funktion aus dem Stapel), die Umwelt-Stimmen des Gesetzes (Pegel, an/aus) und der
//      AUSGANG (Abgriff am Master: Pegel je Oktavband).
//  (G) GESETZ-HERKUNFT: jede laufende Quelle ist im Gesetzbuch gebaut (klang-core.js im
//      Stapel) oder ein Wirt-Leser eines benannten klang-Gesetzes (Musik ← klang:GENRES ·
//      Schritt ← klang:SCHRITT_TIMBRE). Alles andere ist ein STAMM-LITERAL — beim Namen. Dazu STATISCH, unabhängig
//      von jeder Tour: jede Stelle im Stamm, die eine Quelle baut (Oszillator · Puffer · Konstante), liegt in einem
//      Wirt-Leser — sonst beim Namen mit Zeile (bis 06.10. klangen drei Sinus-Pings, die keine Tour auslöste).
//  (H) HÖRBAR-KOSTEN: jede dauernd laufende Quelle (Schleife, Oszillator ohne Stop) gehört
//      einer Gesetz-Stimme über der Hörschwelle; Quellen-Zahl = Σ der hörbaren Stimmen.
//  (S) SOLL-KLANG je Ort (Pegel am Welt-Bus, die Lage am Ohr bei mittlerer Böe):
//      Wiese: wind ≥ −46 · vogel ≥ −52 · kein Wasser · Glut ≤ Wind · Seeufer: ufer ≥ −32
//      und ≥ wind + 6 · Wald: laub ≥ −44 und ≥ Wiese.laub + 8, der Bestand trägt den Wald · Dorf: glut ≥ −34.
//      Dazu der OFFLINE-RENDER des Studio-Graphen (umweltGraph auf OfflineAudioContext):
//      je Stimme gemessener Pegel = Gesetz-Pegel (±1,5 dB) und Schwerpunkt im Band.
//  (K) KOSTEN je Takt: die Welt-Abfragen des Klang-Takts (Boden · Wasser · Strömung ·
//      Fluss-Segmente · Bauten-Lesungen) bleiben gleich, wenn 4000 ferne Bauten und 200
//      ferne Fluss-Läufe dazukommen — Kosten an Hörbares, nie an die Weltgröße.
//  (E) EREIGNISSE: Treffer · Wasser strömt · eine Form singt · eine Form verklingt · ein
//      Tier ruft · ein Ding im Inventar klingt · ein Tier antwortet auf einen Auftrag · ein Tier
//      steigt eine Stufe — je einmal über den echten Weg ausgelöst: jede Quelle aus dem Gesetzbuch,
//      keine Verbindung am Master vorbei direkt an den Ausgang. Und still, wo die Welt still ist: der
//      Wasser-Hauch auf trockenem Land baut keine Quelle.
//  (L) LAB = WELT: das Klang-Studio (worlds/klang) spielt seine Orte über
//      __klangCore.umweltGraph, sein Seeufer trägt das Ufer, und jeder Lab-Ort hält
//      dasselbe SOLL wie der Welt-Ort.
//  (W) DIE WERKSTATT: der Haupt-Thread des Spiels rechnet keinen Sample (Texturen, Rufe —
//      klang:umweltSynthese zählt je Thread), weder an einem Ort noch für ein Ereignis;
//      gerechnet wird in der Klang-Werkstatt (Worker), der Haupt-Thread nimmt auf und spielt.
//  (A) ARMLÄNGE: zwei Orte aus nächster Nähe — 1 m vor dem Glut-Bau, der nächste trockene
//      Punkt 3–12 m neben dem Fuß des nächsten Wasserfalls der Region (der Fuß liegt im
//      Becken; Mess-Saat seit Welle L: 12 m neben einem 9,1-m-Fall) — mit eigenem SOLL (die nahe Quelle trägt den Ort).
//  (P) DIE SPITZEN-PROBE: die ganze Mischung jedes Welt- und jedes Lab-Ortes offline durch
//      Welt-Master und Spitzen-Wand (klang:umweltSpitze) — keine Spitze erreicht 0 dBFS.
//  SELBST-TEST (--selftest, die Linse feuert): ein eingeschmuggelter Drohn-Oszillator
//  (zwillingDrohne) → G beim Namen · eine stumme Schleife (stummeSchleife) → H · das
//  Wasser am Seeufer weg → S · ein Glut-Umlauf über ALLE Bauten → K · eine Ereignis-Glocke
//  aus dem Stamm am Master vorbei (zwillingGlocke) → E · ein Graph ohne Werkstatt am
//  Seeufer → W · ein Ruf, der im Spiel-Takt rechnet (zwillingRuf) → W · die Glut auf Armlänge
//  ohne Spitzen-Wand → P · ein Ping-Zwilling im Stamm-Text (zwillingPing) → G Stamm beim Namen · ein Wald-Ort
//  ohne stehenden Baum → S wald · ein Wasser-Hauch, der den Fußabdruck nicht liest (zwillingHauch) → E wasserTrocken.
//  Stubs restauriert.
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
const PORT = Number(process.env.KLANG_ZENSUS_PORT) || 7452;
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
    // Die Nässe des Klangs ist SEINE (`_nassAt`: der Boden unter der EINEN Wasser-Wahrheit am Körper) — die Linse rechnet
    // sie nie nach (bis Welle L ein Zwilling über das 3×3-gedehnte `_waterLevelAt`).
    W.nass = (x, z) => r._nassAt(x, z);
    W.fliesst = (x, z) => !!r._waterFlowAt(x, z);
    // Die Brenn-Fläche eines Baus (Grundfläche seiner Glut-Teile) — wie das Ohr sie misst (`_glutFlaeche`).
    W.glutFlaeche = (e) => {
        const bp = st.blueprints && st.blueprints[e.type];
        if (!bp || !Array.isArray(bp.parts)) return 0;
        let a = 0;
        for (const p of bp.parts) if (p && p.material === "glut" && p.size) a += p.size.x * p.size.z;
        return a;
    };
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
                        // drei Meter hinter dem ersten trockenen Punkt (das Wasser 3–4 m entfernt): das Ohr hört das Ufer auf
                        // seinem ersten Ring (4 m). Mit vier Metern traf der erste Ring den trockenen Saum, seit die Welt das
                        // flache Ufer zeichnet und der Körper es liest (Gegenprüfung 07.10., Runde 3: Ufer 10 m, −31,5 dB).
                        const fx = qx + ux * 3;
                        const fz = qz + uz * 3;
                        if (!W.nass(fx, fz)) best = { x: fx, z: fz, wasser: { x, z } };
                        break;
                    }
                }
                if (best) break;
            }
            await sleep(0);
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
        // Chunks (Pflanz-/Bau-Takt): der Loop läuft weiter, bis einer im Umkreis von 160 m steht (höchstens 90 s).
        const sucheGlut = () => {
            let g = null;
            for (const e of st.architectures || []) {
                if (!e || !e.position || !(W.glutFlaeche(e) > 0)) continue;
                const d = Math.hypot(e.position.x - wx, e.position.z - wz);
                if (!g || d < g.d) g = { e, d };
            }
            return g;
        };
        let glut = sucheGlut();
        const dlGlut = performance.now() + 90000;
        while (!(glut && glut.d < 160) && performance.now() < dlGlut) {
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
            orte.dorf = { x: ex + ((wx - ex) / d) * 4, z: ez + ((wz - ez) / d) * 4, glut: { x: ex, z: ez, typ: glut.e.type } };
            // ARMLÄNGE an der Glut: 1 m vor dem Bau (das Knistern aus nächster Nähe — die Spitzen-Probe).
            orte.glutArm = { x: ex + (wx - ex) / d, z: ez + (wz - ez) / d, glut: { x: ex, z: ez, typ: glut.e.type } };
        }
        // ARMLÄNGE am Wasserfall: der nächste Fall der Region, der nächste trockene Punkt 3–24 m neben seinem Fuß (der
        // Fuß liegt im Becken). Seit die Bank mit ihrer Neigung ins Gelände läuft (Welle L, Gegenprüfung 07.10.), reicht
        // das Becken eines Falls bis zur Krone seines Kanals: am 9,1-m-Fall der Mess-Wiese ist kein Punkt ≤ 12 m trocken.
        // Das SOLL misst die Ferne mit (SOLL.fallArm).
        const h = r._hydroFor(wx, wz);
        let wfN = null;
        for (const f of (h && h.waterfalls) || []) {
            const d = Math.hypot(f.x - wx, f.z - wz);
            if (!wfN || d < wfN.d) wfN = { f, d };
        }
        for (const rad of wfN ? [3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24] : []) {
            for (let a = 0; a < 16 && !orte.fallArm; a++) {
                const ang = (a / 16) * Math.PI * 2;
                const x = wfN.f.x + Math.sin(ang) * rad;
                const z = wfN.f.z + Math.cos(ang) * rad;
                if (W.nass(x, z)) continue;
                orte.fallArm = { x, z, fall: { x: wfN.f.x, z: wfN.f.z, d: rad, hoehe: +(wfN.f.topY - wfN.f.bottomY).toFixed(1) } };
            }
            if (orte.fallArm) break;
        }
        // Kein trockener Punkt / kein Fall: die Spur reist mit (der Befund O nennt den Ort).
        if (!orte.fallArm) orte.fallSuche = wfN ? { x: wfN.f.x, z: wfN.f.z, d: Math.round(wfN.d) } : "kein Wasserfall der Region";
        return orte;
    };
    // Der Abgriff ist, was der Spieler hört: hinter der Spitzen-Wand (ohne Wand — ein alter Stand — der Master).
    W.abgriff = () => (st.symphony.spitze ? st.symphony.spitze.ausgang : st.symphony.masterGain);
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
    // rechnet in der Klang-Werkstatt, nie im Spiel-Takt. Ohne Zähler im Kern null (ein alter Stand).
    W.synthese = () => {
        const K = window.__klangCore;
        return K && typeof K.umweltSynthese === "function" ? K.umweltSynthese().samples : null;
    };
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
                quellen: neu().map((e) => ({ art: e.art, frames: W.frames(e.stapel) })),
                amAusgang: window.__klangAusgang
                    .slice(b)
                    .filter((e) => e.ctx === s.ctx)
                    .map((e) => W.frames(e.stapel)),
                hauptSynthese: syn0 === null || syn1 === null ? null : syn1 - syn0,
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
                parts: [{ shape: "sphere", material: "quarz", opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }] }],
            };
            if (st.worldJournal && st.worldJournal.seen && st.worldJournal.seen.delete) st.worldJournal.seen.delete("singing:__klangOrb");
            r._applyCompoundWorldEffects("__klangOrb");
            delete st.blueprints.__klangOrb;
        });
        await fang(
            "tier",
            () => {
                // ein Wesen 3 m neben dem Ohr (leerer Körper → die Bezugslänge des Gesetzes)
                const c = new window.THREE.Object3D();
                c.position.set(st.playerMesh.position.x + 3, st.playerMesh.position.y, st.playerMesh.position.z);
                if (typeof r._tierRuf === "function") r._tierRuf(c, "freude");
                else r.playCreaturePing("happy");
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

// (G) DIE STAMM-KLASSE, statisch: jede Stelle im Stamm, die eine Quelle baut (createOscillator · createBufferSource ·
// createConstantSource), liegt in einer Methode, die ein benannter Wirt-Leser ist — sonst ist sie ein STAMM-LITERAL,
// beim Namen und mit Zeile, auch wenn keine Tour sie je auslöst. Kommentare zählen nicht. Die Methode einer Zeile ist
// der letzte Klassen-Kopf darüber (4 Leerzeichen eingerückt).
const STAMM_DATEI =
    UEBER && fs.existsSync(path.join(UEBER, "anazhRealm.js")) ? path.join(UEBER, "anazhRealm.js") : path.join(root, "anazhRealm.js");
function stammQuellen(src) {
    const rot = [];
    let stellen = 0;
    let methode = null;
    const zeilen = src.split("\n");
    for (let i = 0; i < zeilen.length; i++) {
        const z = zeilen[i];
        const kopf = /^    (?:static |async |get |set )*([A-Za-z_$][\w$]*)\s*\(/.exec(z);
        if (kopf) methode = kopf[1];
        const t = z.trimStart();
        if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
        const m = /\.create(Oscillator|BufferSource|ConstantSource)\(/.exec(z);
        if (!m) continue;
        const kommentar = /(^|\s)\/\//.exec(z);
        if (kommentar && kommentar.index < m.index) continue;
        stellen++;
        if (!WIRT_LESER[methode])
            rot.push(`G Stamm: ${methode || "(außerhalb einer Methode)"} baut ${m[1]} ohne Gesetz (anazhRealm.js:${i + 1})`);
    }
    return { rot, stellen };
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
    // −14 − 20·lg(12/5) = −21,6 dB. (Bis Welle L stand hier ≥ −18 für den „17-m-Fall“ der Mess-Wiese — das war der
    // 13-m-Kessel unter einem 4,3-m-Spiegel-Sturz; der Spiegel ist seit Welle L das Gesetz, der Kessel kein Fall.)
    // Liegt der nächste trockene Punkt weiter (das Becken reicht bis zur Krone, `ort.fall.d`), fällt das Soll mit der
    // Ferne wie das Gesetz: −14 − 20·lg(d/5) − 0,4 (bei 12 m −22,0 wie bisher; das Labor misst in 12 m).
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
                const um = await W.umstellen(ort.x, ort.z);
                // Einschwingen: der Ring läuft voll, die Stimmen werden bestellt, geliefert und rampen ein.
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
                const hauptSynthese = syn0 === null || syn1 === null ? null : syn1 - syn0;
                return { name, ort, um, aus, laufend, zensus, baeume, hauptSynthese };
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
            if (!K || typeof K.umweltGraph !== "function") return null;
            if (typeof lage === "string") lage = K.UMWELT.orte && K.UMWELT.orte[lage];
            if (!lage) return null;
            const sr = 48000;
            const sek = 9;
            const ctx = new OfflineAudioContext(2, sr * sek, sr);
            const m = ctx.createGain();
            m.gain.value = K.UMWELT.masterBasis;
            const wand = mitWand && typeof K.umweltSpitze === "function" ? K.umweltSpitze(ctx) : null;
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
            const tap = W.abgriff();
            tap.connect(sp);
            sp.connect(ctx.destination);
            while (n < ziel) {
                W.takt();
                await new Promise((res) => setTimeout(res, 30));
            }
            tap.disconnect(sp);
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
                // Lab = Welt: derselbe Master und dieselbe Spitzen-Wand wie das Spiel (ein alter Kern hat keine).
                if (typeof K.umweltSpitze === "function") {
                    const wand = K.umweltSpitze(off);
                    g.connect(wand.eingang);
                    wand.ausgang.connect(off.destination);
                } else g.connect(off.destination);
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

function urteile(daten, offline, lab, ereig, phasen, spitzen) {
    const rot = [];
    const zeilen = [];
    const mixAlle = {};
    // (W) DIE WERKSTATT: der Haupt-Thread rechnet keinen Sample (Texturen, Rufe) — weder auf der Anreise noch an einem
    // Ort, in den Kosten-Takten oder für ein Ereignis; ohne Zähler im Kern ist das unmessbar (ein Befund, einmal).
    let ohneZaehler = false;
    const werkstatt = (wo, n) => {
        if (n === null || n === undefined) ohneZaehler = true;
        else if (n > 0) rot.push(`W ${wo}: ${n} Samples im Haupt-Thread gerechnet (rechnen darf nur die Klang-Werkstatt)`);
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
                rot.push(`E ${e.art}: ${e.quellen.length} Quelle(n), wo die Welt still ist (${e.quellen[0].frames.slice(0, 3).map((f) => f.fn).join(" ← ")})`);
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
        // (W) die Welt rechnet in der Werkstatt
        werkstatt(name, d.hauptSynthese);
        if (d.zensus && !(d.zensus.werkstatt && d.zensus.werkstatt.laeuft)) rot.push(`W ${name}: keine Klang-Werkstatt`);
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
            rot.push(`P ${wo}: Spitze ${sp.spitzeDbfs} dBFS am Ausgang (${sp.wand ? "trotz" : "ohne"} Spitzen-Wand) — Clipping`);
    if (ohneZaehler) rot.push("W: der Kern zählt die Synthese nicht (klang:umweltSynthese fehlt) — die Werkstatt ist unmessbar");
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
        const ws = d.zensus && d.zensus.werkstatt;
        console.log(
            `   Synthese im Haupt-Thread: ${d.hauptSynthese === null || d.hauptSynthese === undefined ? "unmessbar" : d.hauptSynthese + " Samples"}` +
                (ws ? ` · Werkstatt: ${ws.laeuft ? "läuft" : "FEHLT"}, Pakete ${ws.geliefert}/${ws.bestellt}, Rufe ${ws.rufeGespielt}/${ws.rufeBestellt}` : "")
        );
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
        // Der Synthese-Zähler je Welt-Phase (die Offline-Renders und die Aufnahme rechnen für die LINSE, nie gezählt).
        const syn = () => page.evaluate(() => window.__klangW.synthese());
        const phase = (a, b) => (a === null || b === null ? null : b - a);
        const phasen = {};
        // Die Orte.
        let s0 = await syn();
        await page.evaluate(() => window.__klangW.umstellen(-900, -850));
        const orte = await page.evaluate(() => window.__klangW.orte(-900, -850));
        phasen.anreise = phase(s0, await syn());
        console.log("Orte:", JSON.stringify(orte));
        const daten = {};
        const offline = {};
        for (const name of ["wiese", "seeufer", "wald", "dorf", "glutArm", "fallArm"]) {
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
        s0 = await syn();
        await page.evaluate(() => window.__klangW.umstellen(-900, -850));
        const kostenErg = await kosten(page);
        phasen.kosten = phase(s0, await syn());
        const ereig = await page.evaluate(() => window.__klangW.ereignisse());
        const lab = await labPruefen(browser);
        // (P) die Spitzen-Probe: jeder Welt-Ort (mittlere Böe) und jeder Lab-Ort des Gesetzes, mit der Spitzen-Wand.
        const spitzen = {};
        for (const [name, d] of Object.entries(daten))
            if (d.zensus && d.zensus.lage)
                spitzen[name] = await offlineSpitze(page, Object.assign({}, d.zensus.lage, { boe: 0.7 }), true);
        const labOrte = await page.evaluate(() =>
            window.__klangCore && window.__klangCore.UMWELT ? Object.keys(window.__klangCore.UMWELT.orte || {}) : []
        );
        for (const o of labOrte) spitzen["lab:" + o] = await offlineSpitze(page, o, true);
        const { rot, zeilen } = urteile(daten, offline, lab, ereig, phasen, spitzen);
        for (const w of kostenErg.wachsen) rot.push(`K: ${w} wächst mit der Welt`);
        // (G) die Stamm-Klasse, statisch: jede Quell-Stelle des Stamms in einem Wirt-Leser.
        const stamm = stammQuellen(fs.readFileSync(STAMM_DATEI, "utf8"));
        for (const t of stamm.rot) rot.push(t);
        ergebnis.stamm = stamm;
        console.log(
            `\n── STAMM-KLASSE (statisch): ${stamm.stellen} Quell-Stellen im Stamm, ${stamm.rot.length} ohne Gesetz (Wirt-Leser: ${Object.keys(WIRT_LESER).join(" · ")})`
        );
        drucke(zeilen, offline, kostenErg, lab);
        // Die Summe der Welt über die Tour (Anreise + Orte + Kosten-Takte + Ereignisse).
        const teile = [phasen.anreise, phasen.kosten]
            .concat(Object.values(daten).map((d) => d.hauptSynthese))
            .concat(ereig.map((e) => e.hauptSynthese));
        const summe = teile.some((v) => v === null || v === undefined) ? null : teile.reduce((a, v) => a + v, 0);
        console.log(
            `\n── SYNTHESE IM HAUPT-THREAD über die Tour: ${summe === null ? "unmessbar (kein Zähler im Kern)" : summe + " Samples"} ` +
                `(Anreise ${phasen.anreise} · Orte ${Object.entries(daten)
                    .map(([n, d]) => n + " " + d.hauptSynthese)
                    .join(" · ")} · Kosten-Takte ${phasen.kosten} · Ereignisse ${ereig.map((e) => e.art + " " + e.hauptSynthese).join(" · ")})`
        );
        ergebnis.hauptSynthese = { summe, phasen };
        console.log(
            "\n── SPITZEN am Ausgang (offline, 9 s, mittlere Böe, Spitze/RMS dBFS): " +
                Object.entries(spitzen)
                    .map(([wo, sp]) => (sp ? `${wo} ${sp.spitzeDbfs}/${sp.rmsDbfs}${sp.wand ? "" : " ohne Wand"}` : `${wo} —`))
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
                              .map(
                                  (q) =>
                                      (q.frames.some((f) => f.datei === "klang-core.js") ? "Gesetzbuch " : "STAMM ") +
                                      q.frames
                                          .slice(0, 2)
                                          .map((f) => f.fn)
                                          .join(" ← ")
                              )
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
            if (!u5.some((t) => /^E wasser: .*zwillingGlocke.*kein Gesetz/.test(t))) fehl.push("S5: der Ereignis-Zwilling bleibt unbenannt");
            if (!u5.some((t) => /^E wasser: .*am Master vorbei/.test(t))) fehl.push("S5: die Verbindung am Master vorbei bleibt unbemerkt");
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
                    return s.umwelt.kern.tierRuf(s.ctx, s.umwelt.bus, { laengeM: 1, stimmung, d: 3, pan: 0, saat: 5 });
                };
                try {
                    return await window.__klangW.ereignisse();
                } finally {
                    P._tierRuf = alt;
                }
            });
            const u7 = urteile({}, null, null, e7).rot;
            if (!u7.some((t) => /^W tier: \d+ Samples im Haupt-Thread/.test(t))) fehl.push("S7: der Ruf im Haupt-Thread bleibt unbemerkt");
            // S8: die Glut auf Armlänge (Lab-Ort des Gesetzes) OHNE Spitzen-Wand clippt — und die Probe nennt es.
            const s8 = await offlineSpitze(page, "glutArm", false);
            const u8 = urteile({}, null, null, [], {}, { "lab:glutArm": s8 }).rot;
            if (!u8.some((t) => /^P lab:glutArm: Spitze .*ohne Spitzen-Wand/.test(t)))
                fehl.push(`S8: die Glut auf Armlänge ohne Spitzen-Wand bleibt unbemerkt (${s8 && s8.spitzeDbfs} dBFS)`);
            // S9: ein Ping-Zwilling im Stamm-Text — eine Methode, die einen Oszillator baut, ohne Wirt-Leser zu sein (keine
            // Tour löst sie aus; die statische Linse nennt sie trotzdem beim Namen).
            const s9 = stammQuellen(
                fs.readFileSync(STAMM_DATEI, "utf8") +
                    "\n    zwillingPing(tags) {\n        const o = this.state.symphony.ctx.createOscillator();\n    }\n"
            );
            if (!s9.rot.some((t) => /^G Stamm: zwillingPing baut Oscillator ohne Gesetz/.test(t)))
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
            if (!urteile({}, null, null, e11).rot.some((t) => /^E wasserTrocken: \d+ Quelle\(n\), wo die Welt still ist/.test(t)))
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
