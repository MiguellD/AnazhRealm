// Stationen der Gruppe VI (src/g6.js, Fundament). Format und Regeln: punkte/punkte.cjs (Kopf).
//
// Erfasst ist jedes g6-Kriterium mit Punkten (klang K2 K4 K5, speicher K4 K5), aus der Messschuld (speicher K1 K2 = M30 M35
// M37 M38, profiband K4 = M34 M39, klang K2 K5 = M33 M15) und aus dem Stau (hydro-faden: streaming K4 K5; speicher-journal:
// speicher K2 K3), dazu aus Karten (klang-k1-zensus: klang K1#1; klang-k1-nacht: klang K1#2; streaming-sprung: streaming K3#1;
// ankunft-aussen: ankunft K2#1 K3#1). Je Kriterium und Staffel steht hier der Befehl, mit dem
// der Beleg gemessen wurde.
//
// DIE PROBEN VON KLANG UND SPEICHER (29.10., das Gesetz des Schöpfers: EINE Fahrt durch jedes System ≤ 30 min, die Dauerlast
// eingeschlossen): jede misst in der EINEN warmen Welt der Sitzung (punkte.cjs fahreSitzung: `werkbank start --echt` an
// WERKBANK_PORT, ihr Log PUNKTE_SITZUNG_LOG nennt die Karte) über /eval und /reload — nie mit eigenem Boot, Browser oder Port.
// Bis 29.10. bootete jede ihr eigenes Spiel aus Scratch-Werkzeug unter bericht/ (m15-wind, m15-schritt, echt-k1, speicher-zwei):
// an ea07267e (Radeon) 2,1–14,7 min je Lauf, Σ 60,2 min für die neun Läufe (11,0 davon am Schloss). Der Läufer `sitzungLauf` ruft die
// Seiten-Funktionen (`…Seite`, in der Seite: die Welt `window.anazhRealm`) mit Frist und schreibt sein Ergebnis nach {AUS}; die
// Linse des Spiels (diag-klang-zensus: werkzeug, koerperSeite, taktSeite) liest die Probe aus dem Spiel-Baum am SHA (`skript`) —
// EINE Quelle, kein Zwilling; ihr Skript steht im pfad der Station. Gemessen wird am Ereignis (Bilder, Stände, Haken des
// Schreibers), nie an der Wanduhr; die Uhr, das Wetter, der Ort werden gestellt statt erwartet.
//
// Nicht fassbar (Werkzeug fehlt) steht unten in `fehlt`, mit befehl: null und dem Grund beim Namen. Diese Einträge zählen 0,
// und der Läufer sieht sie nicht: `module.exports` bleibt die Liste der fahrbaren Stationen.
"use strict";
const { jsonBlock, jsonZeile } = require("../hilfe.cjs");

// Vorspann jeder bash-Station: Pfade in Vorwärts-Schreibweise und ein frisches Werk-Verzeichnis neben der Ausgabe.
const VOR =
    "set -u; B=$(cygpath -m '{BAUM}'); K=$(cygpath -m '{KOORD}'); A=$(cygpath -m '{AUS}'); D=\"${A%.json}-werk\"; " +
    'rm -rf "$D"; mkdir -p "$D/roh"; ';
// DER ZYKLUS OHNE ALTER beim Namen (echt-k1 zählt ihn als halbe Welt mit Alter 999): die Probe sucht den Schreiber, dessen
// Stand x/z/b/e dem geladenen GENAU gleicht. 23.10. an 7c6f4b49 (Radeon) gab es ihn je Lauf einmal nicht — der geladene Stand
// lag mit gleichen Blöcken und Edits 4/−25 mm neben dem letzten Schreiber vor dem Tod (z8: 388/93905 → 392/93880): der Spieler
// wird nach dem Laden versetzt, bevor die Probe liest. Genannt wird je Zyklus der jüngste Schreiber vor dem Tod mit gleichem
// b/e, sein Abstand zum Tod und der Versatz; das Urteil bleibt beim Werkzeug (den Lese-Haken baut die OMEN).
function ohneAlter(j) {
    const tz = Array.isArray(j.todZeiten) ? j.todZeiten : [];
    const alle = Array.isArray(j.alle) ? j.alle : [];
    return j.zyklen
        .filter((z) => z.z > 0 && z.alterS == null)
        .map((z) => {
            const tot = tz[z.z - 1], g = z.g || {};
            const w = alle.filter((e) => e.rec && e.t <= tot && e.rec.b === g.b && e.rec.e === g.e).sort((a, b) => b.t - a.t)[0];
            return "z" + z.z + (w ? " " + (g.x - w.rec.x) + "/" + (g.z - w.rec.z) + " mm neben dem Schreiber " + ((tot - w.t) / 1000).toFixed(2) + " s vor dem Tod (b/e gleich)" : " ohne Schreiber mit gleichem b/e");
        });
}

// ─────────────────── DER LÄUFER DER PROBEN (Node, im Spiel-Baum der Sitzung) ───────────────────
// `lauf(h)` mit h = { seite, reload, ruf, skript, aus, koord, warte, path }; was `lauf` zurückgibt, steht in {AUS} (dazu `sek`, die
// Dauer der Probe). Ein Fehler steht dort als `fehler` und endet mit Exit 1. `seite(fn, args, ms)` fährt eine Seiten-Funktion (ihr
// Text) mit JSON-Argumenten in der Welt der Sitzung; `reload()` lädt die Seite im warmen Browser neu (dasselbe Profil, derselbe
// Speicher: die Wiederkehr); `skript(datei, name)` liest eine Funktion der Linse aus ihrem Skript am SHA.
async function sitzungLauf(lauf) {
    const fs = require("fs");
    const path = require("path");
    const http = require("http");
    const [aus, koord] = process.argv.slice(1);
    const port = Number(process.env.WERKBANK_PORT);
    const ruf = (weg, nutz, ms = 60000) =>
        new Promise((ja, nein) => {
            const q = http.request({ host: "127.0.0.1", port, path: weg, method: "POST", headers: { "Content-Type": "application/json" } }, (a) => {
                let d = "";
                a.on("data", (c) => (d += c));
                a.on("end", () => {
                    try {
                        ja(JSON.parse(d));
                    } catch (_e) {
                        ja({ fehler: weg + " ohne JSON: " + d.slice(0, 200) });
                    }
                });
            });
            q.setTimeout(ms, () => q.destroy(new Error(weg + " ohne Antwort binnen " + Math.round(ms / 1000) + " s")));
            q.on("error", nein);
            q.end(JSON.stringify(nutz || {}));
        });
    const seite = async (fn, args = [], ms = 60000) => {
        const a = await ruf("/eval", { code: "return await (" + fn + ")(..." + JSON.stringify(args) + ");" }, ms);
        if (!a || a.fehler)
            throw new Error(String(fn).slice(0, 48).replace(/\s+/g, " ") + " … — " + ((a && a.fehler) || "keine Antwort") + (a && a.stapel ? " @ " + a.stapel.join(" ← ") : ""));
        return a.ergebnis;
    };
    const reload = async () => {
        const a = await ruf("/reload", {}, 120000);
        if (!a || a.neu !== true) throw new Error("/reload: " + JSON.stringify(a).slice(0, 200));
        return a.ms;
    };
    const skript = (datei, name) => {
        const t = fs.readFileSync(datei, "utf8").replace(/\r\n/g, "\n");
        const i = t.search(new RegExp("^(async )?function " + name + "\\(", "m"));
        const e = i < 0 ? -1 : t.indexOf("\n}\n", i);
        if (e < 0) throw new Error(datei + " trägt keine Funktion " + name + " (die Linse am SHA)");
        return t.slice(i, e + 2);
    };
    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
    const t0 = Date.now();
    let j = {}, code = 0;
    try {
        const z = (/\[linse-gpu\][^\r\n]*/.exec(fs.readFileSync(String(process.env.PUNKTE_SITZUNG_LOG), "utf8")) || [null])[0];
        if (z) console.log(z);
        j = (await lauf({ seite, reload, ruf, skript, aus, koord, warte, path, linse: z })) || {};
    } catch (e) {
        j = { fehler: String((e && e.message) || e) };
        console.log("PROBE ROT: " + j.fehler);
        code = 1;
    }
    j.sek = +((Date.now() - t0) / 1000).toFixed(1);
    fs.writeFileSync(aus, JSON.stringify(j, null, 1));
    console.log("PROBE " + j.sek + " s");
    process.exit(code);
}
// der Befehl einer Probe: die Seiten-Funktionen als Konstanten vor dem Läufer; {AUS} und {KOORD} als Argumente
const sitzungBefehl = (lauf, seiten = []) => [
    "node",
    "-e",
    seiten.map((f) => "const " + f.name + " = " + f + ";\n").join("") + "(" + sitzungLauf + ")(" + lauf + ");",
    "{AUS}",
    "{KOORD}",
];

// ─────────────────── klang.K2#1: Wind gesehen ↔ gehört ───────────────────
// In der Seite am Messort der Wiese: Ego, der Blick der Wiese, Tiere gehalten, Sonne (die Böen frei). Der Klang in einem eigenen
// Kontext (die Geste trägt /eval), der Analyser am Gain der Wind-Stimme (Bandpass unter 1,5 kHz, an ihrer Erzeugung gefunden);
// das Bild ist das präsentierte Fenster im Takt seines Bilds (der Zeichen-Puffer, 480 × 270, untere 45 % je 2 px), jedes dritte
// GEZEICHNETE Bild (ein Takt ohne Bild — die GPU-Leine — liest nichts). Je `fen` ms ein Fenster: die mittlere |ΔLuma| je 50 ms und das RMS des Ohrs. Danach stehen Klang, Tiere, Wetter, Sicht
// und Loop wie vorher. Bis 29.10. m15-wind: eigener Boot, CDP-Screencast, 60 s in 0,5-s-Fenstern (ea07267e Radeon 3,68 min).
async function windSeite(o) {
    const r = window.anazhRealm, st = r.state, rend = st.renderer, A = window.BaseAudioContext.prototype, C = Object.getPrototypeOf(r);
    const [bq, gn, kreatur, sicht, wetter, wUhr] = [A.createBiquadFilter, A.createGain, C.__tiereGehalten ? null : C.updateCreatures, st.cameraMode, st.weather, st.weatherEffectTime];
    const paare = [], bilder = [], ohr = [];
    let letzter = null, mess = false, n = 0, takt = null, gezeichnet = 0, gelesen = 0, loop = 0;
    const eigen = Object.prototype.hasOwnProperty.call(r, "_loopRender"), render = r._loopRender;
    r._loopRender = function () {
        gezeichnet++;
        return render.apply(this, arguments);
    };
    A.createBiquadFilter = function () {
        return (letzter = bq.apply(this, arguments));
    };
    A.createGain = function () {
        const g = gn.apply(this, arguments);
        if (letzter) paare.push({ filter: letzter, gain: g });
        letzter = null;
        return g;
    };
    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
    try {
        if (st.symphony.enabled) r.disposeSymphony();
        window.__tiereHalten();
        window.__wetterSetzen("sunny");
        if (st.cameraMode !== "first") r.setCameraMode("first");
        const stell = () => {
            st.playerMesh.position.set(o.x, r._voxelSurfaceY(o.x, o.z) + 1.8, o.z);
            [st.yaw, st.pitch] = [o.gier, -0.12];
        };
        stell();
        await window.__weltStehtNach(async () => (stell(), await window.__seitenTakt()));
        r.initSymphony();
        const s = st.symphony;
        if (s.ctx.state !== "running") await s.ctx.resume();
        const can = rend.domElement, W = 480, H = 270, y0 = Math.floor(H * 0.55), w = W - 8, h = H - 4 - y0;
        const c2 = new OffscreenCanvas(W, H).getContext("2d", { willReadFrequently: true });
        rend.setAnimationLoop((t) => {
            r._gameLoopTick(t);
            loop++;
            if (!mess || gezeichnet === gelesen) return;
            gelesen = gezeichnet;
            if (++n % 3) return;
            c2.drawImage(can, 0, 0, W, H);
            const d = c2.getImageData(4, y0, w, h).data, lum = [];
            for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
                const i = (y * w + x) * 4;
                lum.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
            }
            bilder.push({ t: performance.now(), lum: Float32Array.from(lum) });
        });
        let wind = null;
        for (let i = 0; i < 200 && !wind; i++) {
            wind = paare.filter((p) => p.filter.type === "bandpass" && p.filter.frequency.value < 1500 && p.filter.context === s.ctx).pop() || null;
            if (!wind) await warte(50);
        }
        const stand = { ctx: s.ctx.state, enabled: s.enabled, um: !!s.umwelt, paare: paare.length, steht: !!r._weltSteht() };
        const zensus = s.umwelt.graph.zensus().filter((v) => v.an).map((v) => [v.name, +v.db.toFixed(1)]);
        if (!wind) return { stand, wahl: { fehler: "keine Wind-Stimme", zensus } };
        const an = s.ctx.createAnalyser();
        an.fftSize = 2048;
        wind.gain.connect(an);
        const td = new Float32Array(an.fftSize);
        takt = setInterval(() => {
            an.getFloatTimeDomainData(td);
            let q = 0;
            for (let i = 0; i < td.length; i++) q += td[i] * td[i];
            ohr.push([performance.now(), Math.sqrt(q / td.length)]);
        }, 50);
        const [tA, nA] = [performance.now(), loop];
        mess = true;
        await warte(o.sek * 1000);
        mess = false;
        clearInterval(takt);
        const fps = +((loop - nA) / ((performance.now() - tA) / 1000)).toFixed(1);
        if (bilder.length < 2 || ohr.length < 2) return { stand, wahl: { hz: wind.filter.frequency.value, zensus }, fpsVor: fps, bilder: bilder.length };
        const t0 = Math.max(bilder[0].t, ohr[0][0]), t1 = Math.min(bilder[bilder.length - 1].t, ohr[ohr.length - 1][0]);
        const nF = Math.max(0, Math.floor((t1 - t0) / o.fen));
        const [bew, bewN, lau, lauN] = [0, 0, 0, 0].map(() => new Array(nF).fill(0));
        for (let i = 1; i < bilder.length; i++) {
            const [a, b] = [bilder[i - 1], bilder[i]], dt = b.t - a.t, f = Math.floor((b.t - t0) / o.fen);
            if (dt <= 0 || f < 0 || f >= nF) continue;
            let q = 0;
            for (let k = 0; k < b.lum.length; k++) q += Math.abs(b.lum[k] - a.lum[k]);
            bew[f] += q / b.lum.length / (dt / 50);
            bewN[f]++;
        }
        for (const [t, v] of ohr) {
            const f = Math.floor((t - t0) / o.fen);
            if (f >= 0 && f < nF) (lau[f] += v), lauN[f]++;
        }
        const [B, Q] = [[], []];
        for (let f = 0; f < nF; f++) if (bewN[f] && lauN[f]) B.push(+(bew[f] / bewN[f]).toFixed(4)), Q.push(+(lau[f] / lauN[f]).toFixed(6));
        return { stand, wahl: { hz: wind.filter.frequency.value, kandidaten: paare.length, zensus }, fpsVor: fps, bilder: bilder.length, ohrProben: ohr.length, B, A: Q };
    } finally {
        mess = false;
        clearInterval(takt);
        rend.setAnimationLoop(null);
        if (eigen) r._loopRender = render;
        else delete r._loopRender;
        [A.createBiquadFilter, A.createGain] = [bq, gn];
        if (st.symphony.enabled) r.disposeSymphony();
        if (kreatur) (C.updateCreatures = kreatur), delete C.__tiereGehalten;
        try {
            if (st.weather !== wetter) window.__wetterSetzen(wetter);
        } finally {
            st.weatherEffectTime = wUhr;
        }
        if (st.cameraMode !== sicht) r.setCameraMode(sicht);
    }
}
// die Kreuzkorrelation wie m15-wind (Lag ±3 s), die Zeile `{"stand":…}` liest das Urteil
async function windLauf(h) {
    const BAND = require(h.path.resolve("scripts/lib/band-urteil.cjs"));
    const ort = BAND.ladeSpec("wiese").ort;
    const fen = 200;
    const w = await h.seite(windSeite, [{ x: ort.spieler[0], z: ort.spieler[1], gier: BAND.ortGier(ort), sek: 21, fen }], 90000);
    const [B, A] = [w.B || [], w.A || []];
    const pear = (x, y) => {
        const n = Math.min(x.length, y.length);
        const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n, my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
        let sxy = 0, sxx = 0, syy = 0;
        for (let i = 0; i < n; i++) (sxy += (x[i] - mx) * (y[i] - my)), (sxx += (x[i] - mx) ** 2), (syy += (y[i] - my) ** 2);
        return { r: sxy / Math.sqrt(sxx * syy), n, cvX: Math.sqrt(sxx / n) / mx, cvY: Math.sqrt(syy / n) / my };
    };
    const lags = [];
    const M = Math.round(3000 / fen);
    if (B.length > 2 * M)
        for (let L = -M; L <= M; L++) {
            const x = L >= 0 ? B.slice(L) : B.slice(0, B.length + L);
            const y = L >= 0 ? A.slice(0, A.length - L) : A.slice(-L);
            lags.push({ lagS: +((L * fen) / 1000).toFixed(2), ...pear(x, y) });
        }
    const r0 = lags.find((l) => l.lagS === 0);
    const best = lags.length ? lags.reduce((a, b) => (b.r > a.r ? b : a)) : undefined;
    const zeile = { stand: w.stand, wahl: w.wahl, fpsVor: w.fpsVor, bilder: w.bilder, fenster: B.length, r0, best };
    console.log(JSON.stringify(zeile));
    return { ...zeile, fen, ohrProben: w.ohrProben, lags, reiheBild: B, reiheOhr: A };
}

// ─────────────────── klang.K4#1 · #2: der Schritt je Stoff, der Körper klingt ───────────────────
// (S) In der Seite: die Orte je Stoff am Gesetz des Schritts (`_schrittMaterialAt` bei stehender Boden-Karte, eine 12-m-Strecke
// längs −x zu ≥ 80 % EIN trockener Stoff — erst die Wiese um den Messort, dann ferne Kandidaten, die der Spieler anfährt), je Stoff
// `gehMs` Gehen mit W (die Taste ins Fenster, der Loop läuft), ein Analyser an jedem Schritt-Gain (gefunden an der Erzeugung in
// `_playSchrittOneShot`), je 8 ms Pegel und Spektral-Schwerpunkt; ein Schritt ist eine Folge mit Lücken < 30 ms, sein Etikett der
// Stoff des Klangs (`_schrittKlang.letzter`). Danach Klang, Erzeugung und Loop wie vorher. Bis 29.10. m15-schritt: eigener Boot,
// 10 s je Stoff (ea07267e Radeon 2,09 min); (F) fuhr diag-klang-zensus mit eigenem Boot hinterher (klang.K4#2 5,25 min).
async function schrittSeite(o) {
    const r = window.anazhRealm, st = r.state, rend = st.renderer, A = window.BaseAudioContext.prototype, gn = A.createGain;
    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
    const taste = (typ) => window.dispatchEvent(new KeyboardEvent(typ, { key: "w", code: "KeyW", bubbles: true }));
    let abgriff = null, takt = null;
    A.createGain = function () {
        const g = gn.apply(this, arguments);
        if (abgriff && String(new Error().stack).includes("_playSchrittOneShot"))
            try {
                g.connect(abgriff);
            } catch (_e) {}
        return g;
    };
    const sicht = st.cameraMode;
    try {
        if (st.symphony.enabled) r.disposeSymphony();
        r.initSymphony();
        const s = st.symphony;
        if (s.ctx.state !== "running") await s.ctx.resume();
        if (st.cameraMode !== "first") r.setCameraMode("first");
        rend.setAnimationLoop((t) => r._gameLoopTick(t));
        const mat = (x, z, karte) => (karte && r._bodenSichtAt(x, z) === null ? null : r._schrittMaterialAt(x, z, r._voxelSurfaceY(x, z)));
        const strecke = (x, z, karte, schritt) => {
            const m = mat(x, z, karte);
            if (!m || m === "wasser") return null;
            const n = 3 * (Math.floor(12 / schritt) + 1);
            let fehl = 0;
            for (let d = 0; d <= 12; d += schritt) for (const q of [-0.5, 0, 0.5]) if (mat(x - d, z + q, karte) !== m && ++fehl > 0.2 * n) return null;
            return m;
        };
        const suche = (x0, z0, rad, schon) => {
            const fund = {};
            for (let rr = 0; rr <= rad && schon.length + Object.keys(fund).length < 3; rr += 3)
                for (let i = 0, n = Math.max(1, Math.round(rr * 1.2)); i < n; i++) {
                    const x = x0 + Math.cos((i / n) * 6.283) * rr, z = z0 + Math.sin((i / n) * 6.283) * rr;
                    const m = strecke(x, z, true, 1);
                    if (m && !fund[m] && !schon.includes(m) && schon.length + Object.keys(fund).length < 3) fund[m] = [Math.round(x * 10) / 10, Math.round(z * 10) / 10];
                }
            return fund;
        };
        const kandidaten = (x0, z0, schon) => {
            const je = {}, aus = [];
            for (let rr = 40; rr <= 2500; rr += 25)
                for (let i = 0; i < 64; i++) {
                    const x = x0 + Math.cos((i / 64) * 6.283) * rr, z = z0 + Math.sin((i / 64) * 6.283) * rr;
                    const m = strecke(x, z, false, 3);
                    if (!m || schon.includes(m) || (je[m] = je[m] || []).length >= 3 || je[m].some((p) => Math.hypot(p[0] - x, p[1] - z) < 150)) continue;
                    je[m].push([x, z]);
                    aus.push({ m, x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 });
                }
            return aus;
        };
        const hin = (x, z) => {
            st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        };
        const karteDa = async (x, z) => {
            for (let i = 0; i < 200; i++) {
                if (r._bodenSichtAt(x, z) !== null && r._bodenSichtAt(x - 12, z) !== null) return true;
                await warte(50);
            }
            return false;
        };
        hin(o.x, o.z);
        await karteDa(o.x, o.z);
        const orte = suche(o.x, o.z, 120, []), fahrten = [];
        if (Object.keys(orte).length < 3)
            for (const k of kandidaten(o.x, o.z, Object.keys(orte))) {
                if (Object.keys(orte).length >= 3 || fahrten.length >= 5) break;
                if (orte[k.m]) continue;
                hin(k.x, k.z);
                const karte = await karteDa(k.x, k.z);
                const neu = karte ? suche(k.x, k.z, 30, Object.keys(orte)) : {};
                fahrten.push({ hinweis: k.m, ort: [k.x, k.z], karte, neu: Object.keys(neu) });
                Object.assign(orte, neu);
            }
        const an = s.ctx.createAnalyser();
        an.fftSize = 1024;
        an.smoothingTimeConstant = 0;
        abgriff = an;
        const fd = new Float32Array(an.frequencyBinCount), td = new Float32Array(an.fftSize), proben = [];
        takt = setInterval(() => {
            an.getFloatTimeDomainData(td);
            let q = 0;
            for (let i = 0; i < td.length; i++) q += td[i] * td[i];
            const rms = Math.sqrt(q / td.length);
            if (rms < 1e-4) return;
            an.getFloatFrequencyData(fd);
            const hz = s.ctx.sampleRate / an.fftSize;
            let num = 0, den = 0;
            for (let k = 1; k < fd.length; k++) {
                const p = Math.pow(10, fd[k] / 10);
                (num += p * k * hz), (den += p);
            }
            proben.push({ t: performance.now(), rms, schwer: num / den, mat: st._schrittKlang && st._schrittKlang.letzter && st._schrittKlang.letzter.material });
        }, 8);
        const stoffe = {};
        for (const [m, [x, z]] of Object.entries(orte)) {
            st.yaw = -Math.PI / 2;
            hin(x, z);
            await karteDa(x, z);
            await warte(o.ruhMs);
            const p0 = [st.playerMesh.position.x, st.playerMesh.position.z];
            proben.length = 0;
            taste("keydown");
            await warte(o.gehMs);
            taste("keyup");
            await warte(500);
            const bursts = [];
            let cur = null;
            for (const p of proben.slice()) {
                if (!cur || p.t - cur.t1 > 30) bursts.push((cur = { t0: p.t, t1: p.t, w: 0, sw: 0, mats: {} }));
                cur.t1 = p.t;
                cur.w += p.rms * p.rms;
                cur.sw += p.rms * p.rms * p.schwer;
                cur.mats[p.mat] = (cur.mats[p.mat] || 0) + 1;
            }
            const alle = bursts.map((b) => ({ ms: Math.round(b.t1 - b.t0), schwerHz: Math.round(b.sw / b.w), mat: Object.keys(b.mats).sort((a, c) => b.mats[c] - b.mats[a])[0] }));
            const sw = alle.map((b) => b.schwerHz).sort((a, b) => a - b);
            const p1 = st.playerMesh.position;
            stoffe[m] = { ort: [x, z], wegM: +Math.hypot(p1.x - p0[0], p1.z - p0[1]).toFixed(1), bursts: alle.length, medianHz: sw.length ? sw[sw.length >> 1] : null, alle };
        }
        return { klang: { an: s.enabled, ctx: s.ctx.state }, orte, fahrten, stoffe };
    } finally {
        clearInterval(takt);
        taste("keyup");
        rend.setAnimationLoop(null);
        abgriff = null;
        A.createGain = gn;
        if (st.symphony.enabled) r.disposeSymphony();
        if (st.cameraMode !== sicht) r.setCameraMode(sicht);
    }
}
// (S) je Etikett des Schritts die Zeile, die das Urteil liest; (F) der Körper-Teil der Klang-Linse in derselben Welt: werkzeug und
// koerperSeite aus diag-klang-zensus am SHA (Motor · Landung · Doppler am OfflineAudioContext), ihr Urteil koerperUrteil
async function schrittLauf(h) {
    const M = require(h.path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const S = await h.seite(schrittSeite, [{ x: M.x, z: M.z, gehMs: 3500, ruhMs: 600 }], 120000);
    console.log(JSON.stringify({ klang: S.klang, orte: S.orte, fahrten: S.fahrten }));
    const je = {};
    for (const v of Object.values(S.stoffe)) for (const b of v.alle) (je[b.mat] = je[b.mat] || []).push(b.schwerHz);
    for (const [m, a] of Object.entries(je)) {
        a.sort((x, y) => x - y);
        console.log(m, "n", a.length, "median", a[a.length >> 1], "p10", a[Math.floor(a.length * 0.1)], "p90", a[Math.floor(a.length * 0.9)]);
    }
    const D = "scripts/diag-klang-zensus.cjs";
    const [W, K, U] = ["werkzeug", "koerperSeite", "koerperUrteil"].map((n) => h.skript(D, n));
    const F = await h.seite("async (m) => { window.__klangW = (" + W + ")(); return await (" + K + ")(m, null); }", [M], 120000);
    const u = new Function("return (" + U + ")")()(F);
    console.log("── (F) DER KÖRPER KLINGT: " + u.zahl);
    for (const t of u.rot) console.log("   " + t);
    return { schritt: S, koerper: F, rot: u.rot };
}
// EINE Probe für beide Staffeln (Zwillinge: derselbe Befehl fährt einmal), die Welt danach verändert: Stürze aus 12 m, ein GT
const K4_PROBE = { sek: 60, befehl: sitzungBefehl(schrittLauf, [schrittSeite]) };
const K4_AUSNAHME =
    "der Schritt braucht drei Stoffe an Orten des Gesetzes (ferne Kandidaten mit Karten-Warten, je Stoff 3,5 s Gehen), der Körper 32 " +
    "Abgriffe am OfflineAudioContext — erwartet ~35 s, Deckel 60 s (bis 29.10.: 2,1 + 5,3 min mit zwei eigenen Boots)";

// ─────────────────── klang.K5#2: der Klang-Takt in Bewegung, Aussetzer am Ausgang ───────────────────
// taktSeite der Klang-Linse (diag-klang-zensus am SHA: Klang-ms je Bild über symphonyTick · _schrittKlangTick · _tierRuf, die
// Aussetzer über `AudioContext.playbackStats`) in der Welt der Sitzung, ihr Loop im Fenster (echt). Der Gang verdichtet: je Phase
// `n` × 60 Bilder — gehen (W, je 60 Bilder ein Tipp A) · Fahrt im GT (W/S im Wechsel je 120 Bilder) · Nacht (Uhr 0) —, die Tasten
// ins Fenster, gehalten bis zum Bild, nie nach der Uhr; die Aussetzer über die ganze Wiedergabe der drei Phasen. Bis 29.10.:
// `--takt --echt --minuten 10` mit eigenem Boot (ea07267e Radeon 14,74 min).
async function taktFahrt(quelle, m, namen, o) {
    const r = window.anazhRealm, st = r.state, rend = st.renderer;
    const taktSeite = new Function("return (" + quelle + ")")();
    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
    const taste = (k, typ) => window.dispatchEvent(new KeyboardEvent(typ, { key: k, code: "Key" + k.toUpperCase(), bubbles: true }));
    const T = () => window.__klangTakt;
    const halte = async (k, ziel, ms) => {
        taste(k, "keydown");
        const t0 = performance.now();
        try {
            while (!ziel() && performance.now() - t0 < ms) await warte(16);
        } finally {
            taste(k, "keyup");
        }
        return ziel();
    };
    const phase = async (name, n, pendeln) => {
        T().start(name);
        for (let i = 0; i < n; i++) {
            await halte(pendeln && Math.floor(i / 2) % 2 ? "s" : "w", () => T().bilder.length >= 60 * (i + 1), 10000);
            if (!pendeln) (taste("a", "keydown"), await warte(70), taste("a", "keyup"));
        }
        return T().urteil(o.soll);
    };
    try {
        if (st.symphony.enabled) r.disposeSymphony();
        rend.setAnimationLoop((t) => r._gameLoopTick(t));
        const seite = taktSeite(m, true, namen);
        if (!(await halte("w", () => T().weg >= 3, 20000))) throw new Error("der Spieler geht nicht: W 20 s ohne 3 m");
        await phase("ein", 2);
        const a = T().audio();
        const ph = {};
        ph.gehen = await phase("gehen", o.n);
        const p = st.playerMesh.position;
        p.set(m.x, r._voxelSurfaceY(m.x, m.z) + 1.8, m.z);
        const e = (window.__klangGT = r.spawnArchitecture("fahrzeug_gt", { x: p.x + 3, y: r.getTerrainHeightAt(p.x + 3, p.z) + 0.5, z: p.z }, { silent: true, precise: true }));
        await window.__gebautNach(e);
        r.mountArchitecture(e);
        ph.fahrt = await phase("fahrt", o.n, true);
        ph.fahrt.sattel = !!st.symphony.fahrt;
        r.dismountArchitecture();
        r.setTimeOfDay(0, "regler");
        ph.nacht = await phase("nacht", o.n);
        const b = T().audio();
        const aus = a && b && b.gleich ? { n: b.n - a.n, still: +(b.still - a.still).toFixed(3), s: +(b.s - a.s).toFixed(1) } : null;
        return { seite, phasen: ph, aussetzer: aus };
    } finally {
        for (const k of ["w", "s", "a"]) taste(k, "keyup");
        rend.setAnimationLoop(null);
        if (window.__klangGT && st.player && st.player.mountedArch != null) r.dismountArchitecture();
        if (window.__klangGT) r.removeArchitecture(window.__klangGT, { still: true });
        window.__klangGT = null;
        if (st.symphony.enabled) r.disposeSymphony();
    }
}
// die Befunde wie die Klang-Linse (`takt`): Aussetzer, Bewegung je Phase, p95 über dem Soll, der Sattel der Fahrt
async function taktLauf(h) {
    const D = "scripts/diag-klang-zensus.cjs";
    const text = require("fs").readFileSync(D, "utf8");
    const soll = Number((/const TAKT_SOLL_MS = ([\d.]+);/.exec(text) || [])[1]);
    const teile = (/const TAKT_TEILE = (\[[^\]]*\]);/.exec(text) || [])[1];
    if (!(soll > 0) || !teile) throw new Error(D + " trägt TAKT_SOLL_MS oder TAKT_TEILE nicht");
    const M = require(h.path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const j = await h.seite(taktFahrt, [h.skript(D, "taktSeite"), M, new Function("return " + teile)(), { soll, n: 10 }], 150000);
    console.log("Klang-Takt:", JSON.stringify(j.seite));
    const rot = (j.rot = []);
    for (const [name, z] of Object.entries(j.phasen)) {
        console.log("── " + name + ": Klang-ms je Bild p95 " + z.p95 + " · max " + z.max + " (" + z.bilder + " Bilder, " + z.weg + " m) · trägt " + (z.traeger.join(" · ") || "—"));
        if (!(z.bilder >= 300 && z.weg >= 10)) rot.push("T " + name + ": " + z.bilder + " Bilder, " + z.weg + " m — keine Bewegung gemessen");
        else if (!(z.p95 <= soll)) rot.push("T " + name + ": Klang-ms je Bild p95 " + z.p95 + " > " + soll + " (max " + z.max + "; trägt " + z.traeger.join(" · ") + ")");
    }
    const a = j.aussetzer;
    console.log("── Aussetzer am Ausgang: " + (a ? a.n + " in " + a.s + " s Wiedergabe (" + a.still + " s still)" : "ungezählt"));
    if (!a) rot.push("T aussetzer: ungezählt — kein playbackStats am Kontext, oder er wechselte");
    else if (a.n) rot.push("T aussetzer: " + a.n + " in " + a.s + " s Wiedergabe");
    if (!j.phasen.fahrt.sattel) rot.push("T fahrt: die Stimme der Fahrt klang nicht (nicht im Sattel)");
    for (const t of rot) console.log("   " + t);
    return j;
}

// ─────────────────── speicher.K1#1 · #2: der Tab-Tod am Pfad des Spielers ───────────────────
// Die Welt der Sitzung läuft am Pfad des Spielers ohne save-server-Pfad (isSaveServerHost nur an :4312). Je Zyklus: die Seite
// (nach dem Laden) nennt den Stand, der sie trägt (Lage, Blöcke, Edits) und den Befund des Ladens (logBuffer: „ließ sich nicht
// laden“ · korrupt · unlesbar · „Welt aus .bak“); dann wird der Speicher-Faden mit dem Vorspann `todFaden` neu geboren (die
// Schranke `_speicherStill` vorher, die Welt geht ganz an ihn): er meldet je Stand platz (vor dem Put) · idb (nach dem Put, vor
// dem Ende der Transaktion) · fest (Transaktion zu) und HÄLT an einem scharfen Ort IN seinem Schreiber an. Der Spieler geht (W),
// je 0,5 s ein Stein-Block 6 m rechts und eine Grube 5 m links. DER TOD (`sterben`): kein Schreiber der Seite erreicht mehr den
// Speicher (Storage, IndexedDB, Worker), der Faden stirbt mitten in seiner Transaktion (terminate: sie wird nie fest), die Seite
// lädt neu (/reload, dasselbe Profil) — der Tab-Tod, wie ihn die Platte sieht. Vier Tode: idb und platz am nächsten Autosave des
// Spiels (die Kadenz: der geladene Stand ist der vorige feste), erwachen-hart (sobald der Gang des Dorf-Erwachens läuft),
// erwachen-idb (am IDB-Schreiben des saveState mitten im Gang). Bis 29.10. echt-k1: 20 harte Tode (taskkill des Browsers) mit je
// eigenem Boot (ea07267e Radeon 13,24 min).
function todFaden(rec) {
    let scharf = null;
    const k = new BroadcastChannel("k1");
    k.onmessage = (e) => (scharf = e.data);
    const melde = (art, json) => {
        k.postMessage({ t: Date.now(), art, rec: rec(json), faden: 1 });
        if (scharf !== art) return;
        k.postMessage({ t: Date.now(), art: "__TOD__" });
        for (;;);
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, key) {
        if (String(key).endsWith(".bak") || !v || typeof v.json !== "string") return put.apply(this, arguments);
        melde("platz", v.json);
        const q = put.apply(this, arguments);
        this.transaction.addEventListener("complete", () => melde("fest", v.json));
        melde("idb", v.json);
        return q;
    };
}
function todRec(json) {
    try {
        const s = JSON.parse(json);
        return {
            x: Math.round(s.playerPosition.x * 1e3),
            z: Math.round(s.playerPosition.z * 1e3),
            b: (s.architectures || []).filter((a) => a.type === "stein_block").length,
            e: s.voxelEdits ? s.voxelEdits.n : ((s.worldMeta && s.worldMeta.voxelEdits) || []).length,
        };
    } catch (_e) {
        return { kaputt: 1 };
    }
}
async function todZyklus(o) {
    const r = await window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId && x.state.playerMesh);
    const st = r.state, rend = st.renderer;
    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
    const bis = async (f, ms) => {
        for (const t0 = performance.now(); !f() && performance.now() - t0 < ms; ) await warte(50);
        return !!f();
    };
    rend.setAnimationLoop((t) => r._gameLoopTick(t));
    await bis(() => st._weltbildDa != null, 30000);
    const p = st.playerMesh.position;
    const g = { x: Math.round(p.x * 1e3), z: Math.round(p.z * 1e3), b: (st.architectures || []).filter((a) => a.type === "stein_block").length, e: (st.worldMeta.voxelEdits || []).length, w: st.worldMeta.worldId };
    const befund = (st.logBuffer || []).filter((t) => /ließ sich nicht laden|korrupt|unlesbar|Welt aus \.bak/i.test(t)).map((t) => t.slice(0, 160));
    const dorf = o.dorf ? { reserviert: !!(st.worldMeta.settlementCells || {})[o.dorf.key], haeuser: (st.architectures || []).filter((a) => /^haus_/.test(a.type) && Math.hypot(a.position.x - o.dorf.x, a.position.z - o.dorf.z) < 260).length } : null;
    if (!o.art) return rend.setAnimationLoop(null), { g, befund, dorf };
    const K = { alle: [], tot: null, bauFehler: 0, absage: {} };
    const k = new BroadcastChannel("k1");
    const S = r._speicherZustand();
    let bauer = null;
    const taste = (typ) => window.dispatchEvent(new KeyboardEvent(typ, { key: "w", code: "KeyW", bubbles: true }));
    const sterben = () => {
        if (K.tot) return;
        K.tot = Date.now();
        const nichts = function () {};
        const zu = function () {
            throw new DOMException("die Seite ist tot", "InvalidStateError");
        };
        Storage.prototype.setItem = Storage.prototype.removeItem = Storage.prototype.clear = nichts;
        for (const n of ["put", "add", "delete", "clear"]) IDBObjectStore.prototype[n] = zu;
        IDBFactory.prototype.open = zu;
        Worker.prototype.postMessage = nichts;
        if (S.faden) S.faden.terminate();
        clearInterval(bauer);
        rend.setAnimationLoop(null);
    };
    k.onmessage = (e) => (e.data.art === "__TOD__" ? sterben() : K.alle.push(e.data));
    // der Faden neu geboren mit dem Vorspann (Blob vor importScripts); die Schranke zuerst, dann geht die Welt ganz an ihn
    if (!window.__k1Roh) window.__k1Roh = window.Worker;
    const Roh = window.__k1Roh, vorspann = "(" + o.faden + ")(" + o.rec + ");";
    window.Worker = function (url, opt) {
        if (!opt || opt.name !== "speicher") return new Roh(url, opt);
        return new Roh(URL.createObjectURL(new Blob([vorspann + " importScripts(" + JSON.stringify(new URL(url, location.href).href) + ");"])), opt);
    };
    if (S.faden) {
        await r._speicherStill();
        S.faden.terminate();
        [S.faden, S.welt] = [null, null];
    }
    r.saveState();
    if (!(await bis(() => K.alle.some((x) => x.art === "fest"), 15000))) throw new Error("der neue Faden schreibt keinen festen Stand");
    taste("keydown");
    bauer = setInterval(() => {
        try {
            const q = st.playerMesh.position, ziel = { x: q.x + 6, y: r._terrainMacroSurfaceY(q.x + 6, q.z), z: q.z }, u = r._setzUrteil("stein_block", ziel, true);
            if (u.ok || u.grund === "material") r.spawnArchitecture("stein_block", ziel, { silent: true });
            else K.absage[u.grund] = (K.absage[u.grund] || 0) + 1;
            r.carveVoxel(q.x - 5, r._terrainMacroSurfaceY(q.x - 5, q.z), q.z, 1.5);
        } catch (_e) {
            K.bauFehler++;
        }
    }, 500);
    await warte(o.vorMs);
    let erwachen = null, verfehlt = false;
    if (/^erwachen/.test(o.art)) {
        const A = r.constructor._siedlungGesetz(), res = st.worldMeta.settlementCells || {};
        const [cx0, cz0] = [Math.floor(p.x / A.cellM), Math.floor(p.z / A.cellM)];
        let best = null;
        for (let dx = -3; dx <= 3; dx++)
            for (let dz = -3; dz <= 3; dz++) {
                const i = r._autoSettlementCellInfo(cx0 + dx, cz0 + dz);
                if (!i || res[i.key]) continue;
                const d = Math.hypot(i.x - p.x, i.z - p.z);
                if (!best || d < best.d) best = { i, d, cx: cx0 + dx, cz: cz0 + dz };
            }
        if (!best) throw new Error("keine freie Dorf-Zelle im Umkreis");
        erwachen = { key: best.i.key, nH: best.i.nH, x: best.i.x, z: best.i.z, d: Math.round(best.d) };
        r._autoSettlementSpawnCell(best.cx, best.cz, best.i);
        erwachen.gangAktiv = await bis(() => !!(r._autoSettlementQueue && r._autoSettlementQueue.gang), 30000);
    }
    if (o.art === "erwachen-hart") sterben();
    else {
        k.postMessage(o.art === "erwachen-idb" ? "idb" : o.art);
        if (o.art === "erwachen-idb") r.saveState();
        if (!(await bis(() => K.tot, o.hakenMs))) (verfehlt = true), sterben();
    }
    taste("keyup");
    return { g, befund, dorf, tot: K.tot, alle: K.alle, erwachen, verfehlt, bauFehler: K.bauFehler, absage: K.absage };
}
// je Tod der geladene Stand gegen die Schreiber vor ihm: das Alter am jüngsten FESTEN Schreiber mit gleichen Blöcken und Edits,
// verloren ist, was fest lag und nicht kam; die Felder wie echt-k1 (zyklen, todZeiten, alle — `ohneAlter` liest sie)
async function todLauf(h) {
    const ARTEN = ["idb", "platz", "erwachen-hart", "erwachen-idb"];
    const zyklen = [], alle = [], todZeiten = [];
    let vorher = null, bauFehler = 0;
    for (let z = 0; z <= ARTEN.length; z++) {
        const art = ARTEN[z] || null;
        const c = await h.seite(todZyklus, [{ art, faden: String(todFaden), rec: String(todRec), vorMs: 1500, hakenMs: 12000, dorf: vorher && vorher.erwachen }], 90000);
        const zeile = { z, g: c.g, befund: c.befund };
        if (vorher) {
            const vor = vorher.alle.filter((e) => e.t <= vorher.tot && e.rec && !e.rec.kaputt);
            const gleich = (e) => e.rec.b === c.g.b && e.rec.e === c.g.e;
            const fest = vor.filter((e) => e.art === "fest");
            const traeger = fest.filter(gleich).length ? fest.filter(gleich) : vor.filter(gleich);
            zeile.alterS = traeger.length ? Math.max(0, vorher.tot - Math.max(...traeger.map((e) => e.t))) / 1000 : null;
            zeile.alterAm = traeger.length ? traeger[0].art : null;
            zeile.verlorenBloecke = Math.max(c.g.b, ...fest.map((e) => e.rec.b)) - c.g.b;
            zeile.verlorenEdits = Math.max(c.g.e, ...fest.map((e) => e.rec.e)) - c.g.e;
            zeile.eGeladen = c.g.e;
            zeile.tod = vorher.art;
            if (c.dorf) zeile.dorfGeladen = c.dorf;
        }
        if (art) {
            Object.assign(zeile, { erwachen: c.erwachen || undefined, verfehlt: c.verfehlt, bauFehler: c.bauFehler, absage: c.absage });
            bauFehler += c.bauFehler;
            vorher = { tot: c.tot, art, alle: c.alle, erwachen: c.erwachen };
            todZeiten.push(c.tot);
            alle.push(...c.alle);
        }
        zyklen.push(zeile);
        console.log("z" + z + " " + (zeile.tod || "boot") + " geladen=" + JSON.stringify(c.g) + " alter=" + zeile.alterS + " verloren=" + zeile.verlorenBloecke + "/" + zeile.verlorenEdits + (c.erwachen ? " erw=" + JSON.stringify(c.erwachen) : "") + (c.verfehlt ? " VERFEHLT" : "") + (c.befund.length ? " " + c.befund.join("|") : ""));
        if (art) await h.reload();
    }
    const tod = zyklen.filter((x) => x.tod);
    const j = {
        tode: tod.length,
        alterMax: Math.max(...tod.map((x) => (x.alterS == null ? 999 : x.alterS))),
        ueber10: tod.filter((x) => x.alterS == null || !(x.alterS <= 10)).length,
        halbe: tod.filter((x) => x.alterS == null || x.verlorenBloecke > 0 || x.verlorenEdits > 0).length,
        korrupt: zyklen.filter((x) => x.befund.length).length,
        bauFehler,
        zyklen,
        alle,
        todZeiten,
    };
    console.log("ERGEBNIS " + JSON.stringify({ ...j, zyklen: undefined, alle: undefined }));
    return j;
}
// EINE Probe für beide Staffeln (Zwillinge), vier Neuladen im warmen Browser
const TOD_PROBE = { sek: 90, befehl: sitzungBefehl(todLauf, [todFaden, todRec, todZyklus]) };
const TOD_AUSNAHME =
    "der Tab-Tod ist ein Neuladen je Tod (vier Arten: idb, platz, erwachen-hart, erwachen-idb), idb und platz am nächsten Autosave " +
    "des Spiels (≤ 5 s + Leerlauf, die Kadenz ist die Messung) — erwartet ~60 s, Deckel 90 s (bis 29.10.: 20 Tode mit je eigenem " +
    "Boot, 13,2 min)";

// ─────────────────── speicher.K2#1 · #2: Speichern kostet kein Bild ───────────────────
// taktSeite der Mess-Bahn speicher-zwei (Karte 27.10.) in der Welt der Sitzung: eine Hülle um jeden Speicher-Schritt des
// Haupt-Fadens — der Ruf (`saveState`), das Zusammensetzen (`_standNachholen`), der Besen (`_standFegen`), der Versand (`schicke`)
// — summiert je Task das SPEICHER-BILD; je rAF-Bild die Speicher-ms darin. 20 Stände frisch, dann `edits` Gruben am Ereignis (der
// Zustand „nach 2 h mit 10 000 Edits“, nie die Wanduhr), wieder 20 Stände. Die Uhr des Autosaves gestellt statt erwartet:
// `saveInterval` `intervall` s (das Spiel 5 s) — derselbe Pfad, je Stand dieselbe Arbeit, 20 Stände in ~10 s statt 100 s.
// Ein Bild über 16,7 ms (vsync-Zeitstempel, Toleranz 0,5 ms) trägt das Speichern, wenn es ohne dessen ms darunter bliebe.
// Bis 29.10. eigener Boot und 2 × 20 Stände am 5-s-Autosave (ea07267e Radeon K2#1 5,97 + K2#2 6,56 min).
async function speicherTaktSeite(n, edits, intervall) {
    const r = await window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId && x.state.playerMesh);
    const P = { tiefe: 0, bild: 0 };
    const roh = new Map();
    const huelle = (o, name, zaehlt) => {
        const f = o[name];
        roh.set([o, name], Object.prototype.hasOwnProperty.call(o, name) ? f : null);
        o[name] = function (...a) {
            if (zaehlt && !zaehlt(this)) return f.apply(this, a);
            const t0 = performance.now();
            P.tiefe++;
            try {
                return f.apply(this, a);
            } finally {
                const d = performance.now() - t0;
                if (!--P.tiefe && !P.task) queueMicrotask(() => (P.B.push(P.task[0]), (P.task = null)));
                if (!P.tiefe) (P.task = P.task || [0]), (P.task[0] += d), (P.bild += d);
            }
        };
    };
    const takt = r.state.saveInterval;
    r.state.saveInterval = intervall;
    try {
        for (const x of ["saveState", "_standNachholen", "_standFegen"]) huelle(r, x);
        huelle(r._speicherZustand(), "schicke", (s) => s.unterwegs && ++P.n);
        const phase = async () => {
            Object.assign(P, { B: [], n: 0, wegen: 0 });
            const bild = async () => {
                const vor = r._weltStand ? r._weltStand.takte : -1;
                const t = await new Promise(requestAnimationFrame);
                if ((r._weltStand ? r._weltStand.takte : -1) === vor) r._gameLoopTick(t);
                return t;
            };
            P.ueber = 0;
            for (let i = 0, t = await bild(); P.n < n && i < n * 1200; i++, P.bild = 0) {
                const dt = -t + (t = await bild());
                if (dt > 17.2) P.ueber++;
                if (P.bild && dt > 17.2 && dt - P.bild <= 16.7) P.wegen++;
            }
            const B = P.B.sort((x, y) => x - y), q = (p) => +(B[Math.floor(p * (B.length - 1))] || 0).toFixed(3);
            return { staende: P.n, bilder: B.length, p50: q(0.5), p95: q(0.95), max: q(1), ueber: P.ueber, wegen: P.wegen };
        };
        const [frisch, p] = [await phase(), r.state.playerMesh.position.clone()];
        const t0 = performance.now();
        for (let i = 0; i < edits; i++) {
            const [x, z] = [p.x + (i % 100) * 2 - 100, p.z + Math.floor(i / 100) * 2 - 100];
            r.carveVoxel(x, r._terrainMacroSurfaceY(x, z) - 1, z, 1.5);
            if (i % 100 === 99) await window.__seitenTakt();
        }
        const grubenS = +((performance.now() - t0) / 1000).toFixed(1);
        return { frisch, edits: { ...(await phase()), n: r.state.worldMeta.voxelEdits.length }, grubenS, isoliert: self.crossOriginIsolated };
    } finally {
        r.state.saveInterval = takt;
        for (const [[o, name], f] of roh) if (f) o[name] = f;
            else delete o[name];
    }
}
// die frische Welt: trägt die Welt der Sitzung schon Edits (eine Probe davor), holt die Probe die Grundstellung der Maschine
async function speicherTaktLauf(h) {
    const frisch = await h.seite(() => (window.anazhRealm.state.worldMeta.voxelEdits || []).length === 0);
    if (!frisch) {
        const g = require("child_process").spawnSync(process.execPath, [process.env.PUNKTE_MASCHINE, "grundstellung"], { encoding: "utf8", timeout: 120000 });
        if (g.status !== 0) throw new Error("grundstellung: Exit " + g.status + " " + String(g.stdout + g.stderr).slice(-300));
    }
    const j = await h.seite(speicherTaktSeite, [20, 10000, 0.5], 150000);
    for (const [k, v] of Object.entries({ frisch: j.frisch, edits: j.edits }))
        console.log("(Z) " + k + ": Speicher-Bild " + JSON.stringify(v) + " — Soll p95 ≤ 0,1 ms (Staffel 1: ≤ 0,3), kein Bild > 16,7 ms durch Speichern");
    console.log("Gruben " + j.grubenS + " s · Uhr der Seite " + (j.isoliert ? "isoliert (5 µs)" : "NICHT isoliert (100 µs)") + (frisch ? "" : " · Grundstellung vorher"));
    return { ...j, grundstellung: !frisch };
}
// EINE Probe für beide Staffeln (Zwillinge); die Welt danach: 10 000 Gruben
const SPEICHER_TAKT_PROBE = { sek: 90, befehl: sitzungBefehl(speicherTaktLauf, [speicherTaktSeite]) };
const SPEICHER_TAKT_AUSNAHME =
    "2 × 20 Stände am gestellten Autosave (0,5 s) und 10 000 Gruben am Ereignis (der Zustand nach 2 h), dazu höchstens eine " +
    "Grundstellung für die frische Welt — erwartet ~45 s, Deckel 90 s (bis 29.10.: 2 × 20 Stände am 5-s-Autosave mit je eigenem " +
    "Boot, 6,0 + 6,6 min)";

// ─────────────────── speicher.K4#2: die Wiederkehr zeigt dieselbe Welt ───────────────────
// bildSeite der Mess-Bahn speicher-zwei in der Welt der Sitzung: am Bach der Mess-Wiese (welt-boot `uferStellen` am SHA, der Loop
// läuft, bis das Wasser zeichnet) setzt der Spieler einen Stein-Block 6 m vor sich und gräbt eine Grube (r 2 m) 9 m vor sich ans
// Ufer; die Welt steht, die Bühne (Mittag · Sonne · Sommer) — Ausgabe-Bild A 320 × 180. Der Stand ist fest (`__stand`), die Seite
// lädt neu im warmen Browser (dasselbe Profil: die Wiederkehr), derselbe Ort und Blick, Bild B. diff = Anteil der Pixel mit
// |ΔLuma| > 8; der Pflicht-Inhalt: Bau und Grube stehen vor und nach dem Laden im Stand UND im Blick (Third, Neigung −0,5), das
// Wasser zeichnet; das RAUSCHEN ist derselbe Blick ohne Neuladen. Bis 29.10. speicher-zwei `bild` mit eigenem Boot (3,25 min).
async function uferSeite(quelle, opts) {
    const r = window.anazhRealm, rend = r.state.renderer;
    const ufer = new Function("return (" + quelle + ")")();
    rend.setAnimationLoop((t) => r._gameLoopTick(t));
    try {
        return await ufer(opts);
    } finally {
        rend.setAnimationLoop(null);
    }
}
async function speicherBildSeite(setzen, wasser) {
    const r = window.anazhRealm;
    const [st, p] = [r.state, r.state.playerMesh.position];
    const ort = (vor, quer) => [p.x + Math.sin(st.yaw) * vor - Math.cos(st.yaw) * quer, p.z + Math.cos(st.yaw) * vor + Math.sin(st.yaw) * quer];
    const [b, g] = [ort(6, -2.5), ort(9, 2.5)];
    if (setzen) r.spawnArchitecture("stein_block", { x: b[0], y: r._terrainMacroSurfaceY(...b), z: b[1] }, { silent: true });
    if (setzen) r.carveVoxel(g[0], r._voxelSurfaceY(...g), g[1], 2);
    if (st.cameraMode !== "third") r.setCameraMode("third");
    st.pitch = -0.5;
    await window.__weltStehtNach();
    window.__buehne();
    const blick = (l, [x, z]) => {
        const v = new window.THREE.Vector3(x, r._voxelSurfaceY(x, z) + 0.3, z).project(st.camera);
        return l.some((e) => Math.hypot((e.position || e).x - x, (e.position || e).z - z) < 0.5) && Math.max(Math.abs(v.x), Math.abs(v.y), v.z) < 1;
    };
    const { u8 } = await window.__ausgabeAufnahme(320, 180);
    const c = new OffscreenCanvas(320, 180);
    c.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(u8), 320, 180), 0, 0);
    const b64 = (a) => {
        let s = "";
        for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000));
        return btoa(s);
    };
    return {
        png: b64(new Uint8Array(await (await c.convertToBlob()).arrayBuffer())),
        lage: { kamera: st.camera.position.toArray().map((v) => +v.toFixed(3)), blick: [+st.yaw.toFixed(4), +st.pitch.toFixed(4)], uhr: st.timeOfDay, wetter: st.weather, bauten: st.architectures.length, edits: (st.worldMeta.voxelEdits || []).length },
        u8: b64(Uint8Array.from(u8)),
        pflicht: { bau: blick(st.architectures, b), grube: blick(st.worldMeta.voxelEdits || [], g), wasser },
    };
}
async function speicherBildLauf(h) {
    const fs = require("fs");
    const ufer = String(require(h.path.resolve("scripts/lib/welt-boot.cjs")).uferStellen);
    const messort = require(h.path.resolve("scripts/lib/band-urteil.cjs")).ladeSpec("wiese").ort.spieler;
    const schuss = async (setzen) => {
        const u = await h.seite(uferSeite, [ufer, { messort }], 120000);
        if (u.fehler) throw new Error("(B) " + u.fehler);
        return h.seite(speicherBildSeite, [setzen, u.wasser], 90000);
    };
    const A = await schuss(true);
    const A2 = await h.seite(speicherBildSeite, [false, A.pflicht.wasser], 90000);
    await h.seite(async () => (window.anazhRealm.saveState(), (await window.__stand()).length));
    const reloadMs = await h.reload();
    const B = await schuss(false);
    const [a, a2, b] = [A, A2, B].map((x) => Buffer.from(x.u8, "base64"));
    const L = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
    const j = { lage: { vor: A.lage, nach: B.lage }, diff: 0, rauschen: 0, vor: A.pflicht, nach: B.pflicht, reloadMs, adapter: { renderer: h.linse } };
    for (let i = 0; i < a.length; i += 4) j.diff += Math.abs(L(a, i) - L(b, i)) > 8 ? 400 / a.length : 0;
    for (let i = 0; i < a.length; i += 4) j.rauschen += Math.abs(L(a, i) - L(a2, i)) > 8 ? 400 / a.length : 0;
    for (const [k, x] of [["vor", A], ["vor2", A2], ["nach", B]]) fs.writeFileSync(h.aus.replace(/\.json$/, "") + "-" + k + ".png", Buffer.from(x.png, "base64"));
    console.log("(B) bild-diff " + j.diff.toFixed(2) + " % nach dem Neuladen (" + reloadMs + " ms), Rauschen " + j.rauschen.toFixed(2) + " %, Pflicht vor " + JSON.stringify(j.vor) + " · nach " + JSON.stringify(j.nach));
    return j;
}
const HYDRO_PFAD = [
    "voxel-worker.js",
    "gelaende-core.js",
    "foundry-bruecke.js",
    "stamm/gelaende-*.js",
    "stamm/wasser-*.js",
    "stamm/dirigent-ankunft.js",
    "stamm/dirigent-kern.js",
    "stamm/dirigent-takt.js",
    "stamm/studio-bruecke.js",
    "stamm/klang.js",
    "stamm/vegetation-wiese.js",
    "scripts/diag-worker-dichte.cjs",
    "scripts/lib/welt-boot.cjs",
];
const SPEICHER_PFAD = [
    "stamm/dienst.js",
    "stamm/speicher-*.js",
    "stamm/dirigent-takt.js",
    "stamm/dirigent-regler.js",
    "stamm/dirigent-kern.js",
    "stamm/dirigent-ankunft.js",
    "stamm/werkstatt-sozial.js",
    "stamm/werkstatt-bauen.js",
    "stamm/siedlung-ort.js",
    "stamm/siedlung-satz.js",
    "stamm/siedlung-bauten.js",
    "stamm/gelaende-chunks.js",
    "scripts/lib/welt-boot.cjs",
    "scripts/lib/software-gpu.cjs",
];
// DER VOLLE LAUF von speicher.K4/K5 (Korpus, Tab-Tod, save-server) ohne den Gang (D): keiner der drei urteilt ihn, speicher.K3 geht
// ihn mit 5 km in 30 Spielminuten — PERSISTENCE_WEG=0-0 spart 1 km in 6 Spielminuten (3 600 Takte). Ein Stand vor dem Schalter geht
// ihn mit 0 km; seine (D)-Zeilen und sein Exit tragen kein Urteil der drei. Dazu bootet der Korpus drei Stände zugleich (Spiel-Zweig
// pruef-kurz-c 886669a3): derselbe volle Lauf in der CI (Teil 2) 403–410 s → 198 s, der Korpus darin 201 → 88 s, Urteile 11/11.
const PERSISTENZ_ENV = { PERSISTENCE_PORT: "{PORT}", PERSISTENCE_SERVER_PORT: "2{PORT}", PERSISTENCE_WEG: "0-0" };
// speicher.K3: was der Weg berührt — die Würfe des Felds und der Streu, die Orte und ihr Gedächtnis, das Leben im Stand
const K3_PFAD = [
    "stamm/gelaende-boden.js",
    "stamm/vegetation-*.js",
    "stamm/feld-*.js",
    "stamm/kreatur-*.js",
    "gelaende-core.js",
    "fachwerk-core.js",
    "scripts/diag-persistence.cjs",
];

// Profiband K4 Staffel 2 — die Übergänge im Mess-Fenster über die echten Tasten (Seiten-Code für `werkbank eval`, ohne ').
// GEHEN: V alle 4 s für 90 s, je Druck die Sicht danach; FAHRT: 30 s nach dem Aufsitzen im GT E (aus), 2 s später E (ein).
const K4_TASTE =
    'const t = (c, k) => { for (const a of ["keydown", "keyup"]) window.dispatchEvent(new KeyboardEvent(a, { bubbles: true, code: c, key: k })); }; ';
const K4_GEH =
    "const st = r.state; clearInterval(window.__k4iv); const z = (window.__k4 = { v: 0, modi: [] }); " + K4_TASTE +
    'window.__k4iv = setInterval(() => { t("KeyV", "v"); z.v++; setTimeout(() => z.modi.push(st.cameraMode), 200); }, 4000); ' +
    "setTimeout(() => clearInterval(window.__k4iv), 90000); return 1;";
const K4_FAHR =
    'const st = r.state; clearInterval(window.__k4iv); const z = (window.__k4 = { wagen: "-", aus: "-", ein: "-" }); ' + K4_TASTE +
    "const bis = performance.now() + 120000; " +
    'const iv = setInterval(() => { if (st.player.mountedArch !== "werkbank-fahrt" && performance.now() < bis) return; clearInterval(iv); ' +
    'setTimeout(() => { z.wagen = st.player.mountedArch; t("KeyE", "e"); setTimeout(() => { z.aus = st.player.mountedArch; t("KeyE", "e"); ' +
    "setTimeout(() => { z.ein = st.player.mountedArch; }, 500); }, 2000); }, 30000); }, 100); return 1;";

// DIE ANKUNFT VON AUSSEN (Karte ankunft-aussen): die Kalt- und die Zweit-Zeile von diag-boot-stage — t(Kontrolle) ist die Prozess-Uhr
// ab Navigation, als die von außen gehaltene Taste W den Leib um ≥ 0,1 m trug (nie `_weltbildDa`); was sie liest.
const ANKUNFT_PFAD = [
    "index.html",
    "stamm/dirigent-*.js",
    "stamm/studio-*.js",
    "stamm/gelaende-*.js",
    "stamm/bild-kosten.js",
    "stamm/koerper-bewegung.js",
    "foundry-bruecke.js",
    "voxel-worker.js",
    "scripts/diag-boot-stage.cjs",
    "scripts/lib/welt-boot.cjs",
];
const HW = (t) => {
    const ad = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
    return { ad: ad || "Adapter ungenannt", hw: !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad) };
};

// ─────────────────── DER MESS-GANG DES BANDS (profiband K1 · K2 · K3 · K5, Karte w3v-profiband) ───────────────────
// K1 · K2 · K3 lesen EINEN Lauf je Gerät (derselbe Befehl: Zwillinge, die Maschine fährt ihn einmal): 4 frische Sitzungen (save-server +
// Werkbank --echt, 1920×1080, Dorf-Zug aus wie K4), je Sitzung jede Zelle mit `werkbank lauf 30 --regler voll --tiere frei` — der Lauf
// trägt die Frame-Zeit (rAF), den CPU-Takt, die GPU-Zeit je Bild (Pass-Stempel, gültig ohne Pool-Überlauf), Befehle und Dreiecke je
// Bild (p95), den VRAM am Ende des Fensters und die BELEGUNG des Haupt-Fadens zwischen zwei Bildern aus der CDP-Spur
// (`belegungAuswerten`, nie `_gameLoopTick`). Nach jedem Lauf liest die Probe in der Seite, was der Lauf nicht nennt: ob ein
// Halte-Griff die Tiere je hielt (`__tiereGehalten` am Prototyp — er bleibt für die Sitzung), die Sicht, Geh- und Sprint-Tempo.
// DIE ZELLEN — stehend (die Zellen von PFLICHT E): Wiese und Genesis, je Ego und Third; bewegt: Wiese Ego gehend (die Bahn, 4 m/s),
// Sprint (Shift+W über die Tasten des Spielers, wer 1 s steckt, dreht ab wie im Gang), GT-Fahrt (`--wandern fahrt`, V alle 4 s:
// Third ↔ Ego), Genesis Third gehend, die Stadt gehend durch die Hauptgasse (Messort `stadt`: „dorf 7 120", Dorf-Zug an) und der
// Sturm mit 50 Tieren (`--tiere 50 --wetter stormy`; zuletzt, die Tiere der Bühne bleiben in der Welt). In Sitzung 1 vor der Stadt
// `werkbank band` je Ort × Sicht (wiese, genesis, dorf × ego, third): Haushalt und Ratsche, VRAM nach dem Collector, gpu-bank.
// JE ZELLE zählt der obere Median der 4 Sitzungen (≥ 3 von 4 halten das Soll), und nur, wenn jede Sitzung gilt (`pbFehl`): Regler
// voll und ungedrosselt, Szenen-Skala ≥ 0,75, kein Tier gehalten, das Wetter gehalten, ≥ 300 Bilder, die Sicht und der Weg der Zelle.
// Die Schlupflöcher der Soll-Tafel stehen als Mutanten in den `proben` (punkte.cjs selbsttest). Cloud: kein Bild-Lauf (Kartenkopf N7).
const PB_STEHT = ["wiese-ego-steht", "wiese-third-steht", "genesis-ego-steht", "genesis-third-steht"];
const PB_BEWEGT = ["wiese-ego-geht", "wiese-ego-sprint", "wiese-fahrt", "genesis-third-geht", "stadt-ego-geht", "wiese-ego-sturm"];
const PB_BAND = ["wiese-ego", "wiese-third", "genesis-ego", "genesis-third", "dorf-ego", "dorf-third"];
const PB_PFAD = [
    "stamm/*.js",
    "*-core.js",
    "voxel-worker.js",
    "foundry-bruecke.js",
    "index.html",
    "worlds/huelle/huelle.js",
    "spec/profiband/haushalt.json",
    "spec/profiband/ratsche-*.json",
    "scripts/werkbank.cjs",
    "scripts/lib/zerlege-linse.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/band-urteil.cjs",
    "scripts/lib/draw-zaehler.cjs",
    "scripts/lib/software-gpu.cjs",
    "scripts/lib/welt-boot.cjs",
];
// Seiten-Code (`werkbank eval`, ohne '): die Probe nach jedem Lauf · Sprint an (Shift+W je s, ein Steckender dreht ab) und aus ·
// Tor und Bau (K5): ein Haus 12 m neben dem Spieler, bis es steht, 10 s durch das Welt-Portal (Skelett-Welt) und heim, das Haus
// geräumt — der Spiel-Loop läuft dabei
const PB_PROBE =
    "const st = r.state; return { gehalten: !!Object.getPrototypeOf(r).__tiereGehalten, sicht: st.cameraMode, speed: st.speed, " +
    "sprint: st.sprintSpeed, skala: r._szeneSkalaWirk() };";
const PB_SPRINT =
    'const st = r.state; clearInterval(window.__pbiv); let vor = null; const t = (c, k) => window.dispatchEvent(new KeyboardEvent("keydown", ' +
    '{ bubbles: true, code: c, key: k })); window.__pbiv = setInterval(() => { t("ShiftLeft", "Shift"); t("KeyW", "w"); ' +
    "const p = st.playerMesh.position; if (vor && Math.hypot(p.x - vor[0], p.z - vor[1]) < 1) st.yaw += 1.7; vor = [p.x, p.z]; }, 1000); return 1;";
const PB_SPRINT_AUS =
    'clearInterval(window.__pbiv); for (const [c, k] of [["KeyW", "w"], ["ShiftLeft", "Shift"]]) window.dispatchEvent(new KeyboardEvent("keyup", ' +
    "{ bubbles: true, code: c, key: k })); return 1;";
const PB_TORBAU =
    "const st = r.state, rend = st.renderer, raf = () => new Promise((f) => requestAnimationFrame(f)), o = { bau: false, tor: false, heim: false }; " +
    "rend.setAnimationLoop((t) => r._gameLoopTick(t)); try { const p = st.playerMesh.position, x = p.x + 12; " +
    'const e = r.spawnArchitecture("haus_alemannisch", { x, y: r.getTerrainHeightAt(x, p.z) + 0.5, z: p.z }, { silent: true, precise: true }); ' +
    "await __gebautNach(e, { bau: () => {}, takt: raf }); o.bau = r._archIsRendered(e); " +
    'r.enterPortal({ type: "welt_portal", affordances: { isPortal: true } }); o.tor = !!r._portalOverlay; ' +
    "for (let i = 0; i < 600; i++) await raf(); r.exitPortal(); o.heim = !r._portalOverlay; " +
    "for (let i = 0; i < 120; i++) await raf(); r.removeArchitecture(e); } finally { rend.setAnimationLoop(null); } return o;";
// node-Code der Zusammenfassung (bash '…', ohne '): E das Ergebnis eines eval · J der JSON-Block einer Ausgabe · SUM ein Lauf und
// seine Probe · BSUM ein Band und seine Probe · GSUM der Gang (`puffer --gang`) · PSUM die Puffer-Linse am Start und am Ende
const PB_E =
    'let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => { let e = null; try { e = JSON.parse(s).ergebnis; } catch (x) {} ' +
    "console.log(JSON.stringify(e === undefined ? null : e)); });";
const PB_J =
    'const fs = require("fs"); const J = (f) => { let z = []; try { z = fs.readFileSync(f, "utf8").split(String.fromCharCode(10)).map((l) => l.trimEnd()); ' +
    'return JSON.parse(z.slice(z.indexOf("{"), z.lastIndexOf("}") + 1).join(" ")); } catch (e) { return { fehler: "kein JSON: " + z.slice(-2).join(" ").slice(0, 120) }; } }; ' +
    "const q = (x) => x || {}; let p = null; try { p = JSON.parse(process.argv[2]); } catch (e) {} ";
const PB_SUM =
    PB_J +
    "const o = J(process.argv[1]), b = q(o.belegung), s = q(o.stellgroessen); console.log(JSON.stringify({ " +
    'fehler: typeof o.fehler === "string" ? o.fehler : undefined, regler: o.regler, sek: o.sekunden, frames: o.frames, frame: o.frameMs, ' +
    "takt: q(o.cpuTaktMs).p95, belegung: q(b.belegungMs).p95, pflicht: q(b.pflichtMs).p95, gpu: q(o.gpuMs).p95, gpuN: q(o.gpuMs).n, " +
    "stempel: q(o.stempel).gueltig, befehle: q(o.befehle).p95, dreiecke: q(o.dreiecke).p95, vram: q(o.vramMB).jetzt, last: s.loadScale, " +
    "skala: s.szeneSkala, holz: s.holz, wache: q(o.wetterHalt).urteil, wetter: o.wetter, weg: o.bahnM, buehne: o.buehnenTiere, probe: p }));";
const PB_BSUM =
    PB_J +
    "const u = J(process.argv[1]), g = {}, m = q(u.messung); for (const x of u.groessen || []) g[x.name] = x.ist; console.log(JSON.stringify({ " +
    'fehler: u.fehler, urteil: u.urteil, befehle: g.Befehle, dreiecke: g.Dreiecke, vram: g["VRAM MB"], gpu: q(u.gpu).gpuJeFrameMs, ' +
    "stempel: u.stempel ? u.stempel.urteil : null, eingeschwungen: m.eingeschwungen, last: q(m.stand).loadScale, amMessort: u.amMessort, " +
    "gestellt: u.ortGestellt, geraet: q(u.geraet).schluessel, rot: (u.rot || []).slice(0, 3).map((x) => x.text), probe: p }));";
const PB_GSUM =
    PB_J +
    'const o = J(process.argv[1]); console.log(JSON.stringify({ fehler: typeof o.fehler === "string" ? o.fehler : undefined, urteil: o.urteil, ' +
    "heap: o.heapMB, vram: o.vramMB, min: o.min }));";
const PB_PSUM =
    PB_J +
    "const a = J(process.argv[1]), b = J(process.argv[2]), h = q(q(b.puffer).halter); console.log(JSON.stringify({ fehler: a.fehler || b.fehler, " +
    "zensus: !!b.puffer, vram: [q(a.vram).mb, q(b.vram).mb], heap: [a.heapMB, b.heapMB], ruhend: h.ruhend || 0, verwaist: h.verwaist || 0 }));";

// Die Zeilen des Mess-Gangs beim Namen: ZELLE <sitzung> <zelle> EXIT=<e> {…} · BAND <ort>-<sicht> EXIT=<e> {…} · TORBAU {…} ·
// GANG EXIT=<e> {…} · PUFFER {…}
function pbZeilen(stdout) {
    const o = { zellen: {}, band: {}, sonst: {} };
    const json = (s) => {
        try {
            return JSON.parse(s) || {};
        } catch (_e) {
            return {};
        }
    };
    for (const l of String(stdout || "").split(/\r?\n/)) {
        let m;
        if ((m = /^ZELLE (\d) (\S+) EXIT=(\d+) (\{.*\})$/.exec(l))) (o.zellen[m[2]] = o.zellen[m[2]] || []).push({ ...json(m[4]), n: +m[1], exit: +m[3] });
        else if ((m = /^BAND (\S+) EXIT=(\d+) (\{.*\})$/.exec(l))) o.band[m[1]] = { ...json(m[3]), exit: +m[2] };
        else if ((m = /^(TORBAU|GANG|PUFFER) (?:EXIT=(\d+) )?(\{.*\}|null)$/.exec(l))) o.sonst[m[1].toLowerCase()] = { ...json(m[3]), exit: m[2] == null ? null : +m[2] };
    }
    return o;
}
// Was eine Sitzung einer Zelle ungültig macht — die Schlupflöcher der Soll-Tafel beim Namen: der Lauf brach, blind, Regler nicht
// voll oder gedrosselt, Skala unter 0,75, Tiere gehalten, das Wetter gedreht, die Sicht und der Weg der Zelle (steht ≤ 2 m · geht
// ≥ 3 m/s · Sprint schneller als Gehen und ≥ halbes Sprint-Tempo · Fahrt ≥ 15 m/s · Sturm im Sturm mit 50 Tieren der Bühne)
function pbFehl(name, z) {
    const f = [], p = z.probe || {}, sek = z.sek || 0, weg = Number.isFinite(z.weg) ? z.weg : NaN;
    if (z.fehler) f.push("Lauf brach (" + String(z.fehler).slice(0, 80) + ")");
    if (!(z.frames >= 300)) f.push(z.frames + " Bilder");
    if (z.regler !== "voll") f.push("Regler " + z.regler);
    if (!(z.last >= 0.95)) f.push("gedrosselt (loadScale " + z.last + ")");
    if (!(z.skala >= 0.75)) f.push("Skala " + z.skala + " < 0,75");
    if (p.gehalten !== false) f.push(z.probe ? "Tiere angehalten" : "ohne Probe");
    if (z.wache === "ROT") f.push("Wetter gedreht");
    if (/-steht$/.test(name) && !(weg <= 2)) f.push("Weg " + weg + " m im Stand");
    if (/-(geht|sturm)$/.test(name) && !(weg >= 3 * sek)) f.push("Weg " + weg + " m in " + sek + " s");
    if (/-sprint$/.test(name) && !(p.sprint > p.speed && weg > p.speed * sek && weg >= 0.5 * p.sprint * sek))
        f.push("Sprint-Weg " + weg + " m in " + sek + " s (Gehen " + p.speed + " · Sprint " + p.sprint + " m/s)");
    if (/-fahrt$/.test(name) && !(weg >= 15 * sek)) f.push("Fahrt-Weg " + weg + " m in " + sek + " s");
    if (/-sturm$/.test(name) && !(z.wetter === "stormy" && z.buehne >= 50)) f.push("Sturm: " + z.wetter + " mit " + z.buehne + " Tieren der Bühne");
    const sicht = /-ego-/.test(name) ? "first" : /-third-/.test(name) ? "third" : null;
    if (sicht && p.sicht !== sicht) f.push("Sicht " + p.sicht);
    return f;
}
// DER RICHTER des Mess-Gangs: je Regel { zellen, wort, soll, feld } die Zahl jeder Zelle — der obere Median ihrer 4 Sitzungen —
// gegen das Soll, jede Sitzung gültig; `band`: jede Stand-Zählung je Ort × Sicht im Band (Haushalt, Ratsche, Befehle, Dreiecke,
// VRAM: der Exit des Bands), gpu-bank ≤ 12 ms, eingeschwungen, ungedrosselt, am Messort, Skala, Tiere und Sicht.
function pbRichter(lauf, { regeln = [], band = false }) {
    const t = String(lauf.stdout || "");
    const { ad, hw } = HW(t);
    const { zellen, band: baender } = pbZeilen(t);
    const rot = [], teile = [];
    for (const r of regeln) {
        const werte = r.zellen.map((name) => {
            const zs = zellen[name] || [];
            if (zs.length !== 4) rot.push(name + ": " + zs.length + " von 4 Sitzungen");
            for (const z of zs) {
                const f = pbFehl(name, z);
                if (f.length) rot.push(name + " s" + z.n + ": " + f.join(", "));
            }
            const w = zs.map((z) => r.feld(z)).map((x) => (Number.isFinite(x) ? x : Infinity)).sort((a, b) => a - b);
            const v = w.length ? w[w.length >> 1] : Infinity;
            if (!(v <= r.soll)) rot.push(name + " " + r.wort + " " + v + " > " + r.soll + " (" + w.join("/") + ")");
            return name + " " + v;
        });
        teile.push(r.wort + " ≤ " + r.soll + ": " + werte.join(" · "));
    }
    if (band) {
        const werte = PB_BAND.map((name) => {
            const b = baender[name], p = (b && b.probe) || {}, f = [];
            if (!b) f.push("ungemessen");
            else {
                if (b.exit !== 0 || b.urteil !== "GRUEN") f.push("Band " + (b.urteil || b.fehler) + " " + (b.rot || []).join(" · ").slice(0, 160));
                if (!(b.gpu <= 12)) f.push("gpu-bank " + b.gpu + " ms > 12");
                if (b.eingeschwungen !== true) f.push("nicht eingeschwungen");
                if (!(b.last >= 0.95)) f.push("gedrosselt (loadScale " + b.last + ")");
                if (b.amMessort !== true || (b.gestellt || []).length) f.push("nicht am Messort");
                if (!(p.skala >= 0.75)) f.push("Skala " + p.skala + " < 0,75");
                if (p.gehalten !== false) f.push("Tiere angehalten");
                if (p.sicht !== (/-ego$/.test(name) ? "first" : "third")) f.push("Sicht " + p.sicht);
            }
            if (f.length) rot.push("Band " + name + ": " + f.join(", "));
            return name + " " + (b ? b.befehle + " · " + Math.round(b.dreiecke / 1000) + "k · " + b.vram + " MB · " + b.gpu + " ms" : "?");
        });
        teile.push("Band im Stand (Befehle · Dreiecke · VRAM · gpu-bank): " + werte.join(" | "));
    }
    if (!hw) rot.push("Adapter: " + ad);
    return { gruen: rot.length === 0, zahl: teile.join(" ‖ ") + " · " + ad + (rot.length ? " — ROT " + rot.length + ": " + rot.slice(0, 6).join(" | ") : "") };
}
// DER RICHTER DER AUSDAUER (K5): die ersten und die letzten 5 min an derselben Zelle (Wiese Ego gehend, eingeschwungen), dazwischen
// 2,5 min GT-Fahrt, Bau und Tor, der Gang (`puffer --gang 3`: gehen, GT per Taste E, Mitternacht und Mittag per Spieler-Wort,
// zurück am Start — sein Urteil: VRAM ≤ 2 MB zurück, Heap ≤ 5 MB/min, kein ruhender oder verwaister Puffer); am Ende die
// Puffer-Linse am Start (buf:ruhend = buf:verwaist = 0). Pflicht-Weg ≥ 5 km aus den gemessenen Wegen. Takt und Drossel beim Namen.
function pbAusdauer(lauf) {
    const t = String(lauf.stdout || "");
    const { ad, hw } = HW(t);
    const { zellen, sonst } = pbZeilen(t);
    const teil = ["erste-ego-geht", "lang-fahrt", "letzte-ego-geht"].map((n) => [n, (zellen[n] || [])[0]]);
    const rot = [];
    for (const [n, z] of teil) {
        const f = z ? pbFehl(n, z) : ["fehlt"];
        if (f.length) rot.push(n + ": " + f.join(", "));
    }
    const [a, fa, b] = teil.map(([, z]) => z || {});
    const p95 = (z) => (z.frame ? z.frame.p95 : NaN);
    const faktor = p95(b) / p95(a);
    if (!(faktor <= 1.05)) rot.push("Frame p95 der letzten 5 min " + p95(b) + " > " + p95(a) + " × 1,05");
    const weg = (a.weg || 0) + (fa.weg || 0) + (b.weg || 0);
    if (!(weg >= 5000)) rot.push("Weg " + weg + " m < 5 km");
    const tb = sonst.torbau || {}, g = sonst.gang || {}, pu = sonst.puffer || {};
    if (!(tb.bau === true && tb.tor === true && tb.heim === true)) rot.push("Bau/Tor/heim " + tb.bau + "/" + tb.tor + "/" + tb.heim);
    if (!(g.exit === 0 && Array.isArray(g.urteil) && g.urteil.length === 0)) rot.push("Gang: " + ((g.urteil || []).join(" · ") || g.fehler || "kein Urteil"));
    if (!(pu.zensus === true && pu.ruhend === 0 && pu.verwaist === 0)) rot.push("Puffer am Ende ruhend " + pu.ruhend + " · verwaist " + pu.verwaist + " MB" + (pu.zensus ? "" : " (kein Zensus)"));
    if (!hw) rot.push("Adapter: " + ad);
    const paar = (x, y) => (x == null ? "?" : x) + " → " + (y == null ? "?" : y);
    return {
        gruen: rot.length === 0,
        zahl:
            "Frame p95 erste 5 min " + paar(p95(a), p95(b)) + " ms letzte (×" + faktor.toFixed(3) + ") · Takt p95 " + paar(a.takt, b.takt) +
            " ms · Drossel loadScale " + paar(a.last, b.last) + " · Weg " + (weg / 1000).toFixed(1) + " km · Gang VRAM " + paar(...(g.vram || [])) +
            " MB, Heap " + paar(...(g.heap || [])) + " MB in " + g.min + " min · 20 min VRAM " + paar(...(pu.vram || [])) + " MB · Puffer ruhend " +
            pu.ruhend + " verwaist " + pu.verwaist + " MB · " + ad + (rot.length ? " — ROT " + rot.length + ": " + rot.slice(0, 6).join(" | ") : ""),
    };
}
// Der Richter steht außerhalb der Urteile: sein Abdruck reist im Befehl mit (`: richter <sha1>`) — wer ihn oder die Zellen ändert,
// macht die Messungen alt, wie es die Änderung eines Urteils täte (ohne CR: ein Windows-Klon mit autocrlf hasht dasselbe)
const PB_MARKE =
    ": richter " +
    require("crypto")
        .createHash("sha1")
        .update([pbZeilen, pbFehl, pbRichter, pbAusdauer, PB_STEHT, PB_BEWEGT, PB_BAND].join("|").replace(/\r/g, ""))
        .digest("hex")
        .slice(0, 10) +
    "; ";
const PB_KOPF =
    VOR +
    "SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; " +
    'raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk \'{print $5}\' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; ' +
    'W() { node scripts/werkbank.cjs "$@"; }; ' +
    "E() { W eval \"$1\" | node -e '" + PB_E + "'; }; " +
    "P() { E '" + PB_PROBE + "'; }; " +
    'U() { W umstellen --ort $1 --sicht $2 > "$D/b$N-u-$1-$2.txt" 2>&1; }; ' +
    'Z() { local z=$1; shift; W lauf "$@" > "$D/b$N-$z.txt" 2>&1; local e=$?; ' +
    "echo \"ZELLE $N $z EXIT=$e $(node -e '" + PB_SUM + "' \"$D/b$N-$z.txt\" \"$(P)\")\"; }; " +
    "BOOT() { raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; " +
    '(PORT=$SP node save-server.js > "$D/b$N-save.log" 2>&1 < /dev/null &); ' +
    "for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; " +
    '(node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP --ort wiese > "$D/b$N-werkbank.log" 2>&1 < /dev/null &); ' +
    'for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/b$N-werkbank.log" 2>/dev/null && break; sleep 5; done; ' +
    'grep -m1 "\\[linse-gpu\\]" "$D/b$N-werkbank.log"; ' +
    'W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1; W fenster 1920 1080 > /dev/null 2>&1; }; ' +
    "ENDE() { W stop > /dev/null 2>&1; sleep 3; raeum; }; " +
    PB_MARKE;
const PB_LAUF = [
    "bash",
    "-c",
    PB_KOPF +
        "for N in 1 2 3 4; do BOOT; " +
        "U wiese ego; Z wiese-ego-steht 30 --ein 10 --ruhe 120 --regler voll --tiere frei; " +
        "Z wiese-ego-geht 30 --ein 5 --regler voll --tiere frei --wandern bahn; " +
        "E '" + PB_SPRINT + "' > /dev/null; Z wiese-ego-sprint 30 --ein 5 --regler voll --tiere frei; E '" + PB_SPRINT_AUS + "' > /dev/null; " +
        "U wiese ego; Z wiese-fahrt 30 --ein 10 --regler voll --tiere frei --wandern fahrt; " +
        "U wiese third; Z wiese-third-steht 30 --ein 5 --ruhe 60 --regler voll --tiere frei; " +
        "U genesis ego; Z genesis-ego-steht 30 --ein 10 --ruhe 120 --regler voll --tiere frei; " +
        "U genesis third; Z genesis-third-steht 30 --ein 5 --ruhe 60 --regler voll --tiere frei; " +
        "Z genesis-third-geht 30 --ein 5 --regler voll --tiere frei --wandern bahn; " +
        "if [ $N = 1 ]; then for o in wiese genesis dorf; do for s in ego third; do U $o $s; " +
        'W band --ort $o --datei "$D/band-$o-$s.json" > "$D/band-$o-$s.txt" 2>&1; e=$?; ' +
        "echo \"BAND $o-$s EXIT=$e $(node -e '" + PB_BSUM + "' \"$D/band-$o-$s.json\" \"$(P)\")\"; done; done; fi; " +
        "U stadt ego; Z stadt-ego-geht 30 --ein 10 --ruhe 120 --regler voll --tiere frei --wandern bahn; " +
        "U wiese ego; Z wiese-ego-sturm 30 --ein 10 --regler voll --tiere 50 --wetter stormy --wandern bahn; " +
        "ENDE; done; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
];
const PB_AUSDAUER = [
    "bash",
    "-c",
    PB_KOPF +
        "N=1; BOOT; U wiese ego; Z erste-ego-geht 300 --ein 20 --ruhe 120 --regler voll --tiere frei --wandern bahn; " +
        'W puffer --top 400 > "$D/p0.json" 2>&1; ' +
        "Z lang-fahrt 150 --ein 10 --regler voll --tiere frei --wandern fahrt; " +
        "U wiese ego; echo \"TORBAU $(E '" + PB_TORBAU + "')\"; " +
        'U wiese ego; W puffer --gang 3 > "$D/gang.txt" 2>&1; e=$?; ' +
        "echo \"GANG EXIT=$e $(node -e '" + PB_GSUM + "' \"$D/gang.txt\")\"; " +
        "U wiese ego; Z letzte-ego-geht 300 --ein 20 --ruhe 120 --regler voll --tiere frei --wandern bahn; " +
        'W puffer --top 400 > "$D/p1.json" 2>&1; ' +
        "echo \"PUFFER $(node -e '" + PB_PSUM + "' \"$D/p0.json\" \"$D/p1.json\")\"; " +
        "ENDE; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
];

// DIE PROBEN (punkte.cjs selbsttest): die Roh-Ausgabe des Mess-Gangs in der Form, die er druckt, mit Zahlen im Band (die Form
// der Felder aus `lauf`, `band` und der Probe); `zelle(name, n, s)` und `band(name, s)` setzen eine Mutante, `adapter` und
// `sitzungen` den Rahmen. Je Mutante die Stationen, die GRÜN bleiben.
function pbRoh({ zelle = () => {}, band = () => {}, adapter = "[linse-gpu] nvidia/pascal (Probe)", sitzungen = 4 } = {}) {
    const z = [adapter];
    const probe = (sicht) => ({ gehalten: false, sicht, speed: 4.5, sprint: 7.2, skala: 0.75 });
    for (let n = 1; n <= sitzungen; n++) {
        for (const name of [...PB_STEHT, ...PB_BEWEGT]) {
            const steht = PB_STEHT.includes(name);
            const s = {
                regler: "voll", sek: 30, frames: 1790, frame: { p50: 16.6, p95: 16.7, p99: 17.4, max: 33.4 }, takt: steht ? 3.1 : 4.6,
                belegung: steht ? 5.2 : 7.3, pflicht: 0.4, gpu: 10.4, gpuN: 1786, stempel: true, befehle: 158, dreiecke: 512000, vram: 109.6,
                last: 1, skala: 0.75, holz: "voll", wache: "GRUEN", wetter: /sturm/.test(name) ? "stormy" : "sunny",
                weg: steht ? 0 : /fahrt/.test(name) ? 600 : /sprint/.test(name) ? 210 : 120, buehne: /sturm/.test(name) ? 50 : 0,
                probe: probe(/-third-/.test(name) ? "third" : "first"),
            };
            zelle(name, n, s);
            z.push("ZELLE " + n + " " + name + " EXIT=0 " + JSON.stringify(s));
        }
        if (n === 1)
            for (const name of PB_BAND) {
                const s = { exit: 0, urteil: "GRUEN", befehle: 151, dreiecke: 548000, vram: 111.2, gpu: 10.9, stempel: "GRUEN", eingeschwungen: true, last: 1,
                    amMessort: true, gestellt: [], geraet: "gtx", rot: [], probe: probe(/-ego$/.test(name) ? "first" : "third") };
                band(name, s);
                const { exit, ...rest } = s;
                z.push("BAND " + name + " EXIT=" + exit + " " + JSON.stringify(rest));
            }
    }
    return z.join("\n");
}
const PB_MUTANTEN = [
    ["Roh (die Form des Mess-Gangs, Zahlen im Band)", {}, "K1#1 K1#2 K2#1 K2#2 K3#1 K3#2"],
    ["Mutante Regler herunter (Sitzung 2 frei und gedrosselt, das Band gedrosselt)",
        { zelle: (z, n, s) => n === 2 && Object.assign(s, { regler: "frei", last: 0.62 }), band: (b, s) => (s.last = 0.62) }, ""],
    ["Mutante Tiere angehalten (ab Sitzung 2, im Band)", { zelle: (z, n, s) => n > 1 && (s.probe.gehalten = true), band: (b, s) => (s.probe.gehalten = true) }, ""],
    ["Mutante Skala unter 0,75", { zelle: (z, n, s) => ((s.skala = 0.5), (s.probe.skala = 0.5)), band: (b, s) => (s.probe.skala = 0.5) }, ""],
    ["Mutante Stand statt Weg (der Sprint steht)", { zelle: (z, n, s) => z === "wiese-ego-sprint" && (s.weg = 2) }, "K2#1 K3#1"],
    ["Mutante Fahrt Frame p95 34 ms in 3 von 4", { zelle: (z, n, s) => z === "wiese-fahrt" && n < 4 && (s.frame.p95 = 34) }, "K2#1 K2#2 K3#1 K3#2"],
    ["Mutante bewegt Frame p95 25 ms", { zelle: (z, n, s) => PB_BEWEGT.includes(z) && (s.frame.p95 = 25) }, "K1#1 K2#1 K2#2 K3#1 K3#2"],
    ["Mutante Genesis Third steht Belegung 6,3 ms in 3 von 4", { zelle: (z, n, s) => z === "genesis-third-steht" && n > 1 && (s.belegung = 6.3) }, "K1#1 K1#2 K3#1 K3#2"],
    ["Mutante bewegt Belegung 8,6 ms", { zelle: (z, n, s) => PB_BEWEGT.includes(z) && (s.belegung = 8.6) }, "K1#1 K1#2 K2#1 K3#1 K3#2"],
    ["Mutante VRAM in der Fahrt 118,8 MB", { zelle: (z, n, s) => z === "wiese-fahrt" && (s.vram = 118.8) }, "K1#1 K1#2 K2#1 K2#2 K3#1"],
    ["Mutante gpu-bank Genesis Third 12,5 ms", { band: (b, s) => b === "genesis-third" && (s.gpu = 12.5) }, "K1#1 K1#2 K2#1 K2#2"],
    ["Mutante Software-Adapter", { adapter: "[linse-gpu] google/swiftshader" }, ""],
    ["Mutante Sitzung 4 fehlt", { sitzungen: 3 }, "K3#1"],
];
const pbProben = (id) => PB_MUTANTEN.map(([name, o, gruen]) => ({ name, stdout: pbRoh(o), gruen: gruen.split(" ").includes(id) }));
// die Ausdauer: erste und letzte 5 min, Fahrt, Tor und Bau, Gang, Puffer am Ende
function pbRohGang(m = () => {}, adapter = "[linse-gpu] nvidia/pascal (Probe)") {
    const lauf = (sek, weg, p95) => ({ regler: "voll", sek, frames: sek * 59, frame: { p50: 16.6, p95, p99: 17.6, max: 41.2 }, takt: 4.4, belegung: 7.1,
        pflicht: 0.4, gpu: 10.2, gpuN: sek * 59, stempel: true, befehle: 156, dreiecke: 505000, vram: 109.8, last: 1, skala: 0.75, holz: "voll",
        wache: "GRUEN", wetter: "sunny", weg, buehne: 0, probe: { gehalten: false, sicht: "first", speed: 4.5, sprint: 7.2, skala: 0.75 } });
    const t = {
        "erste-ego-geht": lauf(300, 1200, 16.7), "lang-fahrt": lauf(150, 3000, 16.8), "letzte-ego-geht": lauf(300, 1200, 17.0),
        torbau: { bau: true, tor: true, heim: true }, gang: { exit: 0, urteil: [], heap: [312.4, 318.9], vram: [109.8, 110.6], min: 4.1 },
        puffer: { zensus: true, vram: [109.9, 110.4], heap: [305.2, 322.0], ruhend: 0, verwaist: 0 },
    };
    for (const [k, v] of Object.entries(t)) m(k, v);
    const { exit, ...gang } = t.gang;
    return [adapter, "ZELLE 1 erste-ego-geht EXIT=0 " + JSON.stringify(t["erste-ego-geht"]),
        "ZELLE 1 lang-fahrt EXIT=0 " + JSON.stringify(t["lang-fahrt"]), "TORBAU " + JSON.stringify(t.torbau), "GANG EXIT=" + exit + " " + JSON.stringify(gang),
        "ZELLE 1 letzte-ego-geht EXIT=0 " + JSON.stringify(t["letzte-ego-geht"]), "PUFFER " + JSON.stringify(t.puffer)].join("\n");
}
const PB_PROBEN_GANG = [
    ["Roh (die Form des Ausdauer-Gangs)", () => {}, true],
    ["Mutante Regler herunter (die letzten 5 min frei und gedrosselt)", (k, v) => k === "letzte-ego-geht" && Object.assign(v, { regler: "frei", last: 0.62 }), false],
    ["Mutante Tiere angehalten", (k, v) => v.probe && (v.probe.gehalten = true), false],
    ["Mutante Skala unter 0,75", (k, v) => v.probe && ((v.skala = 0.5), (v.probe.skala = 0.5)), false],
    ["Mutante Drift: die letzten 5 min ×1,10", (k, v) => k === "letzte-ego-geht" && (v.frame.p95 = 18.4), false],
    ["Mutante Weg 4,6 km (kürzere Fahrt)", (k, v) => k === "lang-fahrt" && (v.weg = 2250), false],
    ["Mutante Gang VRAM +3,1 MB zurück am Start", (k, v) => k === "gang" && Object.assign(v, { exit: 1, urteil: ["vram: +3.1 MB zurück am Start — buf:szene:baum +3.1 MB"] }), false],
    ["Mutante Puffer verwaist 0,4 MB am Ende", (k, v) => k === "puffer" && (v.verwaist = 0.4), false],
    ["Mutante kein Tor", (k, v) => k === "torbau" && (v.tor = false), false],
    ["Mutante Software-Adapter", () => {}, false, "[linse-gpu] google/swiftshader"],
].map(([name, m, gruen, adapter]) => ({ name, stdout: pbRohGang(m, adapter), gruen }));

module.exports = [
    // ─────────────────────────────── Ankunft K2 · K3 (ankunft-aussen) ───────────────────────────────
    {
        kriterium: "ankunft.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // die Kalt-Zeile mit Bild (`--bild`): der Schuss aus dem Ausgabe-Pfad bei t(Kontrolle von außen) und derselbe in derselben
        // Pose nach 60 s Ruhe (der Loop läuft, die Bühne hält Mittag · Sonne · Sommer); Lücke = Anteil der Pixel, die in einem
        // Kanal um mehr als 32 abweichen, dazu der offene Bedarf im Bild in dem Moment (`_weltbildFehlt`, im Blick). Mutanten:
        // `--mutante bild` (der erste Schuss endet nach 20 m) ROT, `--mutante eigenmeldung` (`_weltbildDa` ab dem Erwachen) ohne Kontrolle ROT.
        // Soll: ≤ 2 % und nichts offen an einem Gerät. swiftshader (Cloud, ankunft-aussen 202b23be): 7,80 % Lücke, 54 Bäume und
        // Bauten offen im Bild, t(Kontrolle) 72,47 s gegen Eigenmeldung 63,65 s; ohne Ruhe 0,00 %, Mutante bild 6,51 %.
        befehl: ["node", "scripts/diag-boot-stage.cjs", "--kalt", "--echt", "--json", "{AUS}", "--bild", "{AUS}.png"],
        env: { BOOT_STAGE_PORT: "{PORT}" },
        gpu: true,
        zeit: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const { ad, hw } = HW(String(lauf.stdout || ""));
            if (!j || !j.tK || !j.bild) return { gruen: false, zahl: "kein Bild der Kontrolle (t(Kontrolle) " + (j ? j.tK : "?") + " ms, Exit " + lauf.exit + ") · " + ad };
            const gruen = hw && j.bild.luecke <= 0.02 && j.offen.length === 0;
            return {
                gruen,
                zahl:
                    (100 * j.bild.luecke).toFixed(2) + " % Lücke nach 60 s · offen im Bild " + (j.offen.join(" · ") || "nichts") +
                    " · t(Kontrolle) " + (j.tK / 1000).toFixed(2) + " s von außen (Eigenmeldung " + (j.weltbildDa / 1000).toFixed(2) + " s) · " + ad,
            };
        },
        pfad: [...ANKUNFT_PFAD, "scripts/lib/ausgabe-aufnahme.cjs", "scripts/lib/abnahme-urteil.cjs"],
        quelle: "1 = das Ankunftsbild ist an einem Gerät ganz (≤ 2 % Lücke gegen dieselbe Pose nach 60 s), gemessen von außen",
    },
    {
        kriterium: "ankunft.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // die Zweit-Zeile (`--profil`): ein Kalt-Boot füllt das Profil bis zur Ruhe der Foundry (Platte, HTTP-Cache), dann vier
        // Wiederkehren, je ein frischer Browser-Prozess (ein node-Lauf, ein starteBrowser) — nur die Platte bleibt; je Boot
        // t(Kontrolle) von außen. Soll: Median ≤ 5 s an einem Gerät. Vor ankunft-aussen kannte die Zeile keine Außen-t: ROT.
        // swiftshader (Cloud, 202b23be): warm 79,17 · 83,84 s (Eigenmeldung 69,59 · 74,31 s), die Platte trägt 208/208.
        befehl: [
            "bash",
            "-c",
            `P="$(cygpath -m '{AUS}' 2>/dev/null || echo '{AUS}').profil"; rm -rf "$P"; node scripts/diag-boot-stage.cjs --kalt --echt --profil "$P" > /dev/null; ` +
                `for N in 1 2 3 4; do node scripts/diag-boot-stage.cjs --kalt --echt --profil "$P"; done; rm -rf "$P"`,
        ],
        env: { BOOT_STAGE_PORT: "{PORT}" },
        gpu: true,
        zeit: true,
        minuten: 12,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const { ad, hw } = HW(t);
            const w = [...t.matchAll(/t\(Kontrolle\) warm ([\d.]+) s von außen/g)].map((m) => +m[1]).sort((a, b) => a - b);
            if (w.length < 4) return { gruen: false, zahl: w.length + " von 4 Wiederkehren mit Kontrolle von außen (Exit " + lauf.exit + ") · " + ad };
            const med = (w[(w.length - 1) >> 1] + w[w.length >> 1]) / 2;
            return { gruen: hw && med <= 5, zahl: "warm Median " + med.toFixed(2) + " s (" + w.map((x) => x.toFixed(2)).join(" · ") + ") · " + ad };
        },
        pfad: [...ANKUNFT_PFAD, "stamm/speicher-*.js"],
        quelle: "1 = warm ≤ 5 s an einem Gerät",
    },
    // ─────────────────────────────── Streaming K3 (streaming-sprung) ───────────────────────────────
    {
        kriterium: "streaming.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // Karte streaming-sprung: je frische Sitzung (save-server + Werkbank --echt, Wiese Ego, Regler des Spielers nach R8)
        // `haenger --wandern sprung --schwelle 50`: mit dem Mess-Fenster steht der Spieler 1 km weiter auf +x am Boden des
        // Gesetzes, gemessen wird die Kadenz, bis die Welt dort steht (`_weltSteht` in Bau-Ereignissen über `__deckel`, nachdem
        // sie einmal nicht stand) + 1 s — hängt sie, bricht der Lauf laut (kein JSON, ROT); jeder
        // Frame > 50 ms steht mit Ursache in b<N>-sprung.out, die Bauten im Haupt-Faden zählt `_syncBauten`. Vor der Karte kennt
        // der Lauf `sprung` nicht (kein Feld `sprung` im JSON): ROT. Soll: Median der Frame-p95 aus 3 Sitzungen ≤ 50 ms, jede mit
        // stehender Welt, Profil und ≥ 30 Bildern, am Adapter einer echten GPU. Cloud headless swiftshader am Kopf cd8a4d2c des Zweigs
        // streaming-sprung (Wiese, 5 Läufe): die Welt steht nach 18,4–22,3 s, CPU-Takt p95 34,5–61 ms, 0 Bauten außerhalb der
        // Sync-Stellen, Frame p95 4,6–7,5 s (Software-GPU, 3–7 Bilder im Fenster) — ROT am Adapter.
        befehl: [
            "bash",
            "-c",
            VOR +
                "SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; " +
                'raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk \'{print $5}\' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; ' +
                "W() { node scripts/werkbank.cjs \"$@\"; }; " +
                "SUM() { node -e 'try{const j=require(process.argv[1]),s=j.sprung;console.log(JSON.stringify({m:s.m,stehtS:s.stehtS&&+((s.stehtS-s.t0)/1000).toFixed(1),bau:s.bau[1].sonst-s.bau[0].sonst,frames:j.frames,frameMs:j.frameMs,taktMs:j.taktMs,profil:j.profil,ursachen:j.jeUrsache.slice(0,3).map((e)=>e.ursache+\" x\"+e.n)}))}catch(e){console.log(\"{}\")}' \"$1\"; }; " +
                "for N in 1 2 3; do raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; " +
                '(PORT=$SP node save-server.js > "$D/b$N-save.log" 2>&1 < /dev/null &); ' +
                "for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; " +
                '(node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP --ort wiese > "$D/b$N-werkbank.log" 2>&1 < /dev/null &); ' +
                'for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/b$N-werkbank.log" 2>/dev/null && break; sleep 5; done; ' +
                'grep -m1 "\\[linse-gpu\\]" "$D/b$N-werkbank.log"; ' +
                'W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1; W fenster 1920 1080 > /dev/null 2>&1; ' +
                'W umstellen --ort wiese --sicht ego > "$D/b$N-umstellen.txt" 2>&1; ' +
                'W haenger --regler frei --tiere frei --wandern sprung --schwelle 50 --json "$D/b$N-sprung.json" > "$D/b$N-sprung.out" 2>&1; E=$?; ' +
                'echo "SPRUNG $N EXIT=$E $(SUM "$D/b$N-sprung.json")"; ' +
                "W stop > /dev/null 2>&1; sleep 3; raeum; done; " +
                "rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
        ],
        gpu: true,
        zeit: true,
        minuten: 20,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const s = [];
            for (const m of t.matchAll(/^SPRUNG (\d) EXIT=(\d+) (\{.*\})$/gm)) {
                let b = {};
                try { b = JSON.parse(m[3]); } catch (_e) { b = {}; }
                s.push(b);
            }
            if (s.length !== 3) return { gruen: false, zahl: s.length + " von 3 Sitzungen gemessen (kennt der Lauf --wandern sprung?)" };
            const ok = s.filter((b) => b.m === 1000 && Number.isFinite(b.stehtS) && b.profil === true && b.frames >= 30 && b.frameMs);
            const p95 = s.map((b) => (b.frameMs ? b.frameMs.p95 : Infinity)).sort((x, y) => x - y)[1];
            return {
                gruen: hw && ok.length === 3 && p95 <= 50,
                zahl:
                    "Frame p95 Median " + p95 + " ms (" + s.map((b) => (b.frameMs ? b.frameMs.p95 : "?")).join(" · ") + ") · CPU-Takt p95 " +
                    s.map((b) => (b.taktMs ? b.taktMs.p95 : "?")).join(" · ") + " ms · die Welt steht nach " +
                    s.map((b) => (b.stehtS == null ? "nie" : b.stehtS)).join(" · ") + " s · Bauten sonst " + s.map((b) => b.bau).join("/") +
                    " · " + ok.length + " von 3 gültig · " + (s[0].ursachen || []).join(" | ") + " · " + (ad || "Adapter ungenannt"),
            };
        },
        pfad: [
            "stamm/*.js",
            "*-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "index.html",
            "spec/profiband/haushalt.json",
            "scripts/werkbank.cjs",
            "scripts/lib/haenger-linse.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = beim Teleport um 1 km Frame p95 ≤ 50 ms an einem Gerät",
    },

    // ─────────────────────────────── Streaming K4 · K5 (hydro-faden) ───────────────────────────────
    {
        kriterium: "streaming.K4",
        staffel: 1,
        geraet: "headless",
        // die Faden-Linse (Karte hydro-faden, `--faden`): jede Hydrosphäre und jeder Bau im Haupt-Faden beim Namen des Rufers,
        // die drei Sync-Stellen ausgenommen (Mechanik am Null-Renderer, R3). Vor hydro-faden kennt die Linse `--faden` nicht: ROT.
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--faden"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const h = /Hydrosphären: (\d+) aus dem Faden · (\d+) im Haupt-Faden/.exec(t);
            const b = /Bauten im Haupt-Faden \(Chunk-Stoff, Guss\): (\d+) an Sync-Stellen und Test-Nähten · (\d+) sonst/.exec(t);
            const blind = /⛔ BLIND: (.*)/.exec(t);
            if (!h || !b) return { gruen: false, zahl: "keine Faden-Zeile (die Linse kennt --faden nicht?) · Exit " + lauf.exit };
            const gruen = !blind && +h[1] > 0 && +h[2] === 0 && +b[2] === 0;
            return {
                gruen,
                zahl:
                    "Hydrosphären " + h[1] + " aus dem Faden · " + h[2] + " im Haupt-Faden · Bauten " + b[1] +
                    " an Sync-Stellen · " + b[2] + " sonst" + (blind ? " · BLIND " + blind[1] : ""),
            };
        },
        pfad: HYDRO_PFAD,
        quelle:
            "1 = im Spiel 0 synchrone Bauten außerhalb der drei benannten forceSync-Stellen (Fußabdruck, Test-Naht, `_drainDirty`), Kalt-Boot-Rückfälle laut über `_bruchMelden`",
    },
    {
        kriterium: "streaming.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // der Zähler des Spiels selbst (Karte streaming-k4-zaehler): jeder Bau im Haupt-Faden meldet sich am EINEN Melder
        // (`_fadenUmgangen`) — an den Sync-Stellen (fussabdruck · naht · drain) in `_syncBau`, sonst laut im Buch
        // „FADEN-UMGANGEN"; die Faden-Linse liest ihn (`_syncBauten`) im Fenster an der echten GPU nach der Ankunft (kalt),
        // 2 min Gang, einer Minute Fahrt mit sechs Bau-Klicks und dem Damm. Vor der Karte kennt die Linse --echt und den
        // Gang nicht (die Gang-Zeile fehlt): ROT. Die Stau-Zeile (Takt) gehört gelaende.K2 und urteilt hier nicht.
        // Soll: 0 sonst an Radeon und GTX; Cloud-Fenster swiftshader (Xvfb) am Kopf 82bb2353 in 3 von 3 Läufen 0 sonst ·
        // 25 naht (der Damm-Ring der Wasser-Linse), vor dem Nexus-Schnitt 8 Güsse „kreatur" in 1 von 2.
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--faden", "--echt"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
            const hw = !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero/i.test(ad);
            const g = /^ {2}gang +([\d.]+) s/m.exec(t);
            const h = /Hydrosphären: (\d+) aus dem Faden · (\d+) im Haupt-Faden/.exec(t);
            const b = /Bauten im Haupt-Faden \(Chunk-Stoff, Guss\): (\d+) an Sync-Stellen und Test-Nähten · (\d+) sonst ?(\{[^}]*\})?/.exec(t);
            const k = /Bau-Klicks in der Fahrt: (\d+)/.exec(t);
            const blind = /⛔ BLIND: (.*)/.exec(t);
            if (!g || !h || !b) return { gruen: false, zahl: "keine Gang- oder Faden-Zeile (die Linse kennt --echt nicht?) · Exit " + lauf.exit };
            const gruen = hw && !blind && +h[1] > 0 && +h[2] === 0 && +b[2] === 0 && !!k && +k[1] >= 6;
            return {
                gruen,
                zahl:
                    "Bauten " + b[2] + " außerhalb der Sync-Stellen · " + b[1] + " an ihnen " + (b[3] || "") + " · Hydrosphären " + h[1] +
                    " aus dem Faden · " + h[2] + " im Haupt-Faden · Gang " + g[1] + " s · " + (k ? k[1] : 0) + " Bau-Klicks · " +
                    (ad || "Adapter ungenannt") + (blind ? " · BLIND " + blind[1] : ""),
            };
        },
        pfad: [
            ...HYDRO_PFAD,
            "stamm/dienst.js",
            "stamm/feld-dsl.js",
            "stamm/koerper-leib.js",
            "stamm/kreatur-verhalten.js",
            "stamm/siedlung-satz.js",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = 0 überall, beide Geräte",
    },
    {
        kriterium: "streaming.K5",
        staffel: 1,
        geraet: "headless",
        // das Instrument am Empfang (Faden-Linse): Klon-Bytes je Minute an jedem onmessage, Byte-Summe, eine Minute Fahrt
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--faden"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: false,
        zeit: true,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const f = /^\s*fahrt\s+([\d.]+) s · ([\d.]+) MB\/min am Empfang/m.exec(t);
            const blind = /⛔ BLIND: (.*)/.exec(t);
            if (!f) return { gruen: false, zahl: "keine Fahrt-Zeile am Empfang (die Linse kennt --faden nicht?) · Exit " + lauf.exit };
            const gruen = !blind && +f[1] >= 55 && +f[2] <= 5;
            return { gruen, zahl: f[2] + " MB/min am Empfang in " + f[1] + " s Fahrt" + (blind ? " · BLIND " + blind[1] : "") };
        },
        pfad: HYDRO_PFAD,
        quelle: "1 = Klon-MB je Minute am Empfang gemessen und ≤ 5 MB/min in 60 s Fahrt",
    },
    {
        kriterium: "streaming.K5",
        staffel: 2,
        geraet: "headless",
        // dieselbe Linse: ≤ 1 MB/min in der Fahrt, keine Kopie empfangener Bytes in keiner Phase, und ein Speicher-Faden unter
        // den Fäden (speicher-journal: der Save schreibt im Worker) — vor speicher-journal ROT
        befehl: ["node", "scripts/diag-worker-dichte.cjs", "--faden"],
        env: { WORKER_DICHTE_PORT: "{PORT}" },
        gpu: false,
        zeit: true,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const phasen = [...t.matchAll(/^\s*(\S+)\s+([\d.]+) s · ([\d.]+) MB\/min am Empfang: .*· Kopie ([\d.]+) MB/gm)];
            const f = phasen.find((p) => p[1] === "fahrt");
            const faeden = (/Fäden: (.*)/.exec(t) || [])[1] || "";
            const blind = /⛔ BLIND: (.*)/.exec(t);
            if (!f) return { gruen: false, zahl: "keine Fahrt-Zeile am Empfang (die Linse kennt --faden nicht?) · Exit " + lauf.exit };
            const kopie = phasen.filter((p) => p[1] !== "selbst").reduce((s, p) => s + +p[4], 0);
            const speicher = /speicher/i.test(faeden);
            // f[2] die Dauer der Fahrt, f[3] ihre MB/min (bis streaming-k5 verglich das Urteil die Sekunden mit 1 MB/min)
            const gruen = !blind && +f[2] >= 55 && +f[3] <= 1 && kopie === 0 && speicher;
            return {
                gruen,
                zahl:
                    f[3] + " MB/min in " + f[2] + " s Fahrt · Kopie " + kopie.toFixed(2) + " MB · Speicher-Faden " +
                    (speicher ? "ja" : "nein") + " (Fäden: " + faeden.slice(0, 120) + ")",
            };
        },
        // der Speicher-Faden (speicher-worker.js) steht nur im Zweig speicher-journal — am Kopf trifft sein Glob keine Datei (Wand PFAD)
        pfad: HYDRO_PFAD.concat(["stamm/dienst.js", "stamm/speicher-*.js"]),
        quelle: "2 = ≤ 1 MB/min, 0 Kopien nach dem Empfang, Speichern im Worker",
    },

    // ─────────────────────────────── Profiband K4 (M34 · M39) ───────────────────────────────
    {
        kriterium: "profiband.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // m39.sh der OMEN wörtlich (4 frische Boots, Wiese Ego, Regler frei nach R8): je Boot save-server + Werkbank --echt,
        // `lauf 30 --ein 20 --ruhe 300 --regler frei`, dann `haenger 60 --regler frei --tiere frei --wandern bahn`
        befehl: [
            "bash",
            "-c",
            VOR +
                "SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; " +
                'raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk \'{print $5}\' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; ' +
                "W() { node scripts/werkbank.cjs \"$@\"; }; " +
                "for N in 1 2 3 4; do raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; " +
                '(PORT=$SP node save-server.js > "$D/b$N-save.log" 2>&1 < /dev/null &); ' +
                "for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; " +
                '(node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP --ort wiese > "$D/b$N-werkbank.log" 2>&1 < /dev/null &); ' +
                'for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/b$N-werkbank.log" 2>/dev/null && break; sleep 5; done; ' +
                'W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1; W fenster 1920 1080 > /dev/null 2>&1; ' +
                'W umstellen --ort wiese --sicht ego > "$D/b$N-umstellen.txt" 2>&1; ' +
                'W lauf 30 --ein 20 --ruhe 300 --regler frei > "$D/b$N-lauf.txt" 2>&1; ' +
                'W haenger 60 --regler frei --tiere frei --wandern bahn --json "$D/b$N-haenger.json" > "$D/b$N-haenger.out" 2>&1; E=$?; ' +
                'echo "BOOT $N EXIT=$E $(node -e \'try{const j=require(process.argv[1]);console.log(JSON.stringify({frames:j.frames,haengerN:j.haengerN,frameMs:j.frameMs,jeKlasse:j.jeKlasse,profil:j.profil,lauf:j.lauf}))}catch(e){console.log("{}")}\' "$D/b$N-haenger.json")"; ' +
                "W stop > /dev/null 2>&1; sleep 3; raeum; done; " +
                "rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
        ],
        gpu: true,
        zeit: true,
        minuten: 25,
        urteil: (j, lauf) => {
            const boots = [];
            for (const l of String(lauf.stdout || "").split(/\r?\n/)) {
                const m = /^BOOT (\d) EXIT=(\d+) (\{.*\})$/.exec(l);
                if (m) {
                    let b = {};
                    try { b = JSON.parse(m[3]); } catch (_e) { b = {}; }
                    boots.push({ n: +m[1], exit: +m[2], ...b });
                }
            }
            if (boots.length !== 4) return { gruen: false, zahl: boots.length + " von 4 Boots gemessen" };
            const ok = boots.filter((b) => b.profil === true && b.frames >= 1000 && b.haengerN === 0 && b.lauf && b.lauf.regler === "frei");
            return {
                gruen: ok.length >= 3,
                zahl:
                    ok.length + " von 4 Sitzungen ohne Frame > 100 ms (max " +
                    boots.map((b) => (b.frameMs ? b.frameMs.max : "?")).join(" · ") + " ms; Hänger " +
                    boots.map((b) => (b.haengerN == null ? "?" : b.haengerN)).join("/") + ")",
            };
        },
        pfad: [
            "stamm/*.js",
            "*-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "index.html",
            "spec/profiband/haushalt.json",
            "scripts/werkbank.cjs",
            "scripts/lib/haenger-linse.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = eine Bewegungsart an einem Gerät in ≥ 3 von 4 Sitzungen ohne Frame > 100 ms",
    },
    {
        kriterium: "profiband.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // Der Boot von #1 (4 frische Sitzungen, Wiese Ego, Regler des Spielers nach R8: `haenger` reicht keinen Regler durch,
        // nur `voll` setzte ihn), je Sitzung ZWEI Läufe mit `--schwelle 33` — jeder Frame > 33 ms steht beim Namen, haengerN/frames
        // ist der Anteil, frameMs.max die 100-ms-Grenze. GEHEN: die Bahn, dazu V (echte Taste, cameraToggle) alle 4 s.
        // FAHRT: `--wandern fahrt` (GT, V alle 4 s aus der Werkbank); 30 s nach dem Aufsitzen, also im Mess-Fenster
        // (Einschwingen 10 s, Messen 60 s), E (Aussteigen) und 2 s später E (Einsteigen) über den Spieler-Pfad toggleMountAtPlayer.
        // Ob die Übergänge geschahen, liest `window.__k4` nach dem Lauf (Funktions-Probe 25.10. mit Software-GPU an d43cb61c:
        // V 10× Ego ↔ Third, E aus = null, E ein = werkbank-fahrt). Staffel 2: jede der 4 Sitzungen, beide Läufe, je Gerät.
        befehl: [
            "bash",
            "-c",
            VOR +
                "SP={PORT}; WP=$((SP+20000)); export WERKBANK_PORT=$WP; " +
                'raeum() { for p in $(netstat -ano | grep -E ":($SP|$WP) .*LISTEN" | awk \'{print $5}\' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }; ' +
                "W() { node scripts/werkbank.cjs \"$@\"; }; " +
                "UE() { W eval 'return JSON.stringify(window.__k4 || null)' | node -e 'let s=\"\";process.stdin.on(\"data\",(d)=>(s+=d)).on(\"end\",()=>{try{console.log(JSON.parse(s).ergebnis)}catch(e){console.log(\"null\")}})'; }; " +
                "SUM() { node -e 'try{const j=require(process.argv[1]);console.log(JSON.stringify({frames:j.frames,haengerN:j.haengerN,schwelle:j.schwelle,frameMs:j.frameMs,profil:j.profil,lauf:j.lauf}))}catch(e){console.log(\"{}\")}' \"$1\"; }; " +
                "for N in 1 2 3 4; do raeum; rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json; " +
                '(PORT=$SP node save-server.js > "$D/b$N-save.log" 2>&1 < /dev/null &); ' +
                "for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:$SP/ && break; sleep 1; done; " +
                '(node scripts/werkbank.cjs start --echt --port $WP --seite http://localhost:$SP --ort wiese > "$D/b$N-werkbank.log" 2>&1 < /dev/null &); ' +
                'for t in $(seq 1 120); do grep -qE "bereit|FEHLER" "$D/b$N-werkbank.log" 2>/dev/null && break; sleep 5; done; ' +
                'W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1; W fenster 1920 1080 > /dev/null 2>&1; ' +
                'W umstellen --ort wiese --sicht ego > "$D/b$N-umstellen.txt" 2>&1; ' +
                'W lauf 30 --ein 20 --ruhe 300 --regler frei > "$D/b$N-lauf.txt" 2>&1; ' +
                "W eval '" + K4_GEH + "' > /dev/null 2>&1; " +
                'W haenger 60 --regler frei --tiere frei --wandern bahn --schwelle 33 --json "$D/b$N-geh.json" > "$D/b$N-geh.out" 2>&1; E=$?; ' +
                'echo "BOOT $N GEH EXIT=$E $(SUM "$D/b$N-geh.json") UE $(UE)"; ' +
                "W eval '" + K4_FAHR + "' > /dev/null 2>&1; " +
                'W haenger 60 --regler frei --tiere frei --wandern fahrt --schwelle 33 --json "$D/b$N-fahrt.json" > "$D/b$N-fahrt.out" 2>&1; E=$?; ' +
                'echo "BOOT $N FAHRT EXIT=$E $(SUM "$D/b$N-fahrt.json") UE $(UE)"; ' +
                "W stop > /dev/null 2>&1; sleep 3; raeum; done; " +
                "rm -f anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json",
        ],
        gpu: true,
        zeit: true,
        minuten: 35,
        urteil: (j, lauf) => {
            const laeufe = [];
            for (const l of String(lauf.stdout || "").split(/\r?\n/)) {
                const m = /^BOOT (\d) (GEH|FAHRT) EXIT=(\d+) (\{.*\}) UE (.*)$/.exec(l);
                if (!m) continue;
                let b = {}, ue = null;
                try { b = JSON.parse(m[4]); } catch (_e) { b = {}; }
                try { ue = JSON.parse(m[5]); } catch (_e) { ue = null; }
                laeufe.push({ n: +m[1], art: m[2], ...b, ue });
            }
            if (laeufe.length !== 8) return { gruen: false, zahl: laeufe.length + " von 8 Läufen (4 Sitzungen × Gehen/Fahrt) gemessen" };
            const anteil = (x) => (x.frames > 0 ? x.haengerN / x.frames : 1);
            const fehl = (x) => {
                const f = [];
                if (!(x.profil === true && x.frames >= 1000 && x.schwelle === 33)) f.push("Lauf blind (" + x.frames + " Frames)");
                if (!(x.lauf && x.lauf.regler === "frei")) f.push("Regler nicht frei");
                if (!(x.frameMs && x.frameMs.max <= 100)) f.push("max " + (x.frameMs ? x.frameMs.max : "?") + " ms");
                if (!(anteil(x) <= 0.01)) f.push((100 * anteil(x)).toFixed(2) + " % > 33 ms");
                const u = x.ue || {};
                if (x.art === "GEH" && !(x.lauf && x.lauf.wandern === "bahn" && u.v >= 10 && (u.modi || []).includes("first") && (u.modi || []).includes("third")))
                    f.push("kein Sicht-Wechsel im Gehen");
                if (x.art === "FAHRT" && !(x.lauf && x.lauf.wandern === "fahrt" && u.wagen === "werkbank-fahrt" && u.aus == null && u.ein === "werkbank-fahrt"))
                    f.push("Aus-/Einsteigen nicht geschehen (" + JSON.stringify(u) + ")");
                return f;
            };
            const rot = laeufe.map((x) => [x, fehl(x)]).filter(([, f]) => f.length);
            const zelle = (x) => "s" + x.n + (x.art === "GEH" ? " geh " : " fahrt ") + (x.frameMs ? x.frameMs.max : "?") + "/" + (100 * anteil(x)).toFixed(2) + " %";
            return {
                gruen: rot.length === 0,
                zahl:
                    (8 - rot.length) + " von 8 Läufen ohne Frame > 100 ms und ≤ 1 % > 33 ms mit Sicht-Wechsel und Einsteigen (max ms/Anteil: " +
                    laeufe.map(zelle).join(" · ") + ")" +
                    (rot.length ? "; ROT " + rot.map(([x, f]) => "s" + x.n + " " + x.art.toLowerCase() + ": " + f.join(", ")).join(" | ").slice(0, 300) : ""),
            };
        },
        pfad: [
            "stamm/*.js",
            "*-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "index.html",
            "spec/profiband/haushalt.json",
            "scripts/werkbank.cjs",
            "scripts/lib/haenger-linse.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = 0 Frames > 100 ms und ≤ 1 % > 33 ms über Gehen und Fahrt (mit Sicht-Wechsel, Einsteigen) an beiden Geräten",
    },

    // ─────────────────────────────── Profiband K1 · K2 · K3 · K5 (w3v-profiband) ───────────────────────────────
    // K1 · K2 · K3 je Staffel: DER MESS-GANG DES BANDS (oben, `PB_LAUF`, ein Lauf je Gerät), geurteilt vom Richter `pbRichter`; K5 der
    // Ausdauer-Gang (`PB_AUSDAUER`, `pbAusdauer`). Vor der Karte trug keines der vier Kriterien eine Station (0 von 8 Punkten).
    {
        kriterium: "profiband.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        // Frame p95 je Bewegungszelle. Vorher (GTX 23.10., `werkbank lauf` von Hand, Zug 1–3): Stadt gehend 58,3 und 49,8 ms, Fahrt
        // 33,3 an der VSync-Kante, Sturm gehend 33,3, Wiese Ego gehend 25,1 — ROT erwartet an Stadt und Fahrt; die Radeon bewegt ungemessen.
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: PB_BEWEGT, wort: "Frame p95", soll: 33, feld: (z) => z.frame && z.frame.p95 }] }),
        pfad: PB_PFAD,
        proben: pbProben("K1#1"),
        quelle: "1 = Frame p95 ≤ 33 ms (der Boden von PFLICHT E) in jeder Bewegungszelle an beiden Geräten",
    },
    {
        kriterium: "profiband.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Messung: ≤ 16,7 ms in jeder Zelle, stehend und bewegt
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "Frame p95", soll: 16.7, feld: (z) => z.frame && z.frame.p95 }] }),
        pfad: PB_PFAD,
        proben: pbProben("K1#2"),
        quelle: "2 = ≤ 16,7 ms in jeder Zelle",
    },
    {
        kriterium: "profiband.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // die Belegung des Haupt-Fadens je Bild (p95 aus der Spur des Laufs) in den vier Stand-Zellen. Vorher (GTX 23.10., Zug 3, Trace):
        // Wiese Ego 5,95/5,93 ms, Genesis Third 7,34/7,29, Dorf 7,10/7,21 — ROT erwartet an Genesis Third
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: PB_STEHT, wort: "Belegung p95", soll: 5.8, feld: (z) => z.belegung }] }),
        pfad: PB_PFAD,
        proben: pbProben("K2#1"),
        quelle: "1 = stehend ≤ 5,8 ms an einem Gerät",
    },
    {
        kriterium: "profiband.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Messung: stehend ≤ 5,8 und in jeder Bewegungszelle ≤ 8 ms. Vorher (Radeon 21.10., M12): Wiese Ego stehend 10,43 ms
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) =>
            pbRichter(lauf, {
                regeln: [
                    { zellen: PB_STEHT, wort: "Belegung p95", soll: 5.8, feld: (z) => z.belegung },
                    { zellen: PB_BEWEGT, wort: "Belegung p95", soll: 8, feld: (z) => z.belegung },
                ],
            }),
        pfad: PB_PFAD,
        proben: pbProben("K2#2"),
        quelle: "2 = stehend ≤ 5,8 UND bewegt ≤ 8 ms an beiden",
    },
    {
        kriterium: "profiband.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        // `werkbank band` je Ort × Sicht (Sitzung 1): der Exit des Bands (Haushalt, Ratsche, Befehle ≤ 208, Dreiecke ≤ 680k, VRAM nach
        // dem Collector ≤ 118 MB, Stempel-Pool), dazu gpu-bank ≤ 12 ms (das Band selbst hält 16,7). Vorher (GTX 23.10., Zug 3): gpu-bank
        // Wiese 12,99 · Dorf 12,45 · Genesis 11,52 ms — ROT erwartet an der GTX; die Radeon ungemessen
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) => pbRichter(lauf, { band: true }),
        pfad: PB_PFAD,
        proben: pbProben("K3#1"),
        quelle: "1 = im Stand an beiden Geräten frisch am Kopf (Ratsche + gpu-bank)",
    },
    {
        kriterium: "profiband.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dazu jede Zelle des Laufs (stehend und bewegt): Befehle p95 ≤ 208, Dreiecke p95 ≤ 680k, VRAM ≤ 118 MB, GPU p95 ≤ 12 ms aus den
        // Pass-Stempeln des Fensters (nur ohne Pool-Überlauf und mit ≥ 100 Stempeln). Vorher: VRAM in der Fahrt 118,8 MB (GTX 23.10.)
        befehl: PB_LAUF,
        gpu: true,
        zeit: true,
        minuten: 80,
        urteil: (j, lauf) =>
            pbRichter(lauf, {
                band: true,
                regeln: [
                    { zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "Befehle p95", soll: 208, feld: (z) => z.befehle },
                    { zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "Dreiecke p95", soll: 680000, feld: (z) => z.dreiecke },
                    { zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "VRAM MB", soll: 118, feld: (z) => z.vram },
                    { zellen: [...PB_STEHT, ...PB_BEWEGT], wort: "GPU p95", soll: 12, feld: (z) => (z.stempel === true && z.gpuN >= 100 ? z.gpu : NaN) },
                ],
            }),
        pfad: PB_PFAD,
        proben: pbProben("K3#2"),
        quelle: "2 = alle Zellen samt Bewegung",
    },
    {
        kriterium: "profiband.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // der Ausdauer-Gang (oben, `pbAusdauer`): ~25 min am Stück in einer Sitzung — p95 der letzten 5 min ≤ der ersten × 1,05, Gang
        // GRÜN (VRAM ≤ 2 MB zurück am Start, Heap ≤ 5 MB/min, buf:ruhend/verwaist 0), Puffer am Ende 0, Weg ≥ 5 km, Bau und Tor.
        // Vorher (Radeon 21.10., M14, von Hand): VRAM 113,9 → 127,0 MB, Heap 186 → 1 118 MB, p95 16,2 → 42,3 ms unter Fremdlast — ROT
        befehl: PB_AUSDAUER,
        gpu: true,
        zeit: true,
        minuten: 35,
        urteil: (j, lauf) => pbAusdauer(lauf),
        pfad: PB_PFAD,
        proben: PB_PROBEN_GANG,
        quelle: "1 = an einem Gerät",
    },
    {
        kriterium: "profiband.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: PB_AUSDAUER,
        gpu: true,
        zeit: true,
        minuten: 35,
        urteil: (j, lauf) => pbAusdauer(lauf),
        pfad: PB_PFAD,
        proben: PB_PROBEN_GANG,
        quelle: "2 = an beiden",
    },

    // ─────────────────────────────── Klang K1 · K2 · K4 · K5 ───────────────────────────────
    {
        kriterium: "klang.K1",
        staffel: 1,
        geraet: "headless",
        // der Zensus (S)(L)(R), Zweig klang-k1-zensus: Mittag im Stand, je Ort die Mischung des Gesetzes bei mittlerer Böe
        // (daten.<ort>.mixMitte, offline am Abgriff nachgemessen) gegen das SOLL; Ruf ← Leib: an jedem Ort sind die gehörten
        // Vögel die gezeichneten (zensus.leiber), die Mutation `wieseOhneLeib` (das Revier-Gesetz ohne Revier) lässt den Chor
        // schweigen, ein Tier-Ruf ohne Leib der Welt bleibt stumm (Ereignis „tier“). Derselbe Lauf wie klang.K5#1 (Zwilling).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const d = (j && j.daten) || {};
            const orte = ["wiese", "seeufer", "wald", "dorf"];
            if (!orte.every((o) => d[o] && d[o].mixMitte) || !d.wieseOhneLeib)
                return { gruen: false, zahl: "kein Zensus der vier Orte und der Mutation (Exit " + lauf.exit + ")" };
            const db = (o, s) => d[o].mixMitte[s].db;
            // ein Spiel, das keine Leiber meldet, hat keine
            const leib = (z) => z.leiber || { gehoert: 0, gezeichnet: 0 };
            const L = leib(d.wiese.zensus);
            const ohne = d.wieseOhneLeib.zensus;
            const chorOhne = ohne.stimmen.some((v) => v.name === "vogel" && v.an);
            // die Befunde dieses Kriteriums: SOLL, Lab = Welt, Ruf ← Leib, Ort fehlt, der Tier-Ruf ohne Leib
            const rot = (j.rot || []).filter((t) => /^(S|L|R|O)[ :]|^E tier:/.test(t));
            const gruen = rot.length === 0 && L.gehoert > 0 && L.gehoert === L.gezeichnet && leib(ohne).gezeichnet === 0 && !chorOhne;
            const f = (v) => (v > -999 ? v.toFixed(1) : "−∞");
            return {
                gruen,
                zahl:
                    "Wiese wind " + f(db("wiese", "wind")) + " · vogel " + f(db("wiese", "vogel")) + " dB aus " + L.gehoert + " Leibern (" +
                    L.gezeichnet + " gezeichnet), ohne Leib " + (chorOhne ? "SINGT" : "still") + " · Ufer " + f(db("seeufer", "ufer")) +
                    " (wind " + f(db("seeufer", "wind")) + ") · Wald laub " + f(db("wald", "laub")) + " · Dorf glut " + f(db("dorf", "glut")) +
                    (rot.length ? " · " + rot.length + " Befund(e): " + rot.slice(0, 2).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "tetrapoda-core.js",
            "stamm/klang.js",
            "stamm/kreatur-*.js",
            "stamm/siedlung-*.js",
            "stamm/stoff-instanz.js",
            "stamm/feld-leben.js",
            "stamm/dirigent-takt.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/daten.js",
            "worlds/klang/klang.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "1 = Mittag im Stand: jedes Soll je Ort hält, und jeder Pegel einer Quelle mit Körper (Vogel, Tier) hat einen Körper in der Welt",
    },
    {
        kriterium: "klang.K1",
        staffel: 2,
        geraet: "headless",
        // der Zensus (N), Zweig klang-k1-nacht: zusätzlich zu Staffel 1 die Wiese in vier Szenen, Wetter und Uhr als Wort des
        // Spielers (R9) — nachts (Mitternacht im Sommer: die Grillen aus Nacht × Wärme des Bodens ihrer Röhre × offenem Gras, ihr
        // Ton die Harfe 4,4/4,8 kHz, Band 3,5–5,6 kHz offline nachgemessen; kein Vogel singt), im Regen (das Wort „rainy“: der
        // Regen-Teppich ≥ −34 dB, die Vögel singen nur aus Leibern), gehend (W/S pendelnd, ≥ 10 m) und fahrend (im Sattel des GT,
        // ≥ 30 m): je Szene das Soll und Ruf ← Leib in Bewegung. Unter dieser Linse am Welt-Stand von main 19606f2e ROT: nacht
        // grille −∞ (Luft 10,3 °C < 12); nach der Trägheit −40,1 dB mit Schwerpunkt 2 898 Hz (die rate trug den Ton); am Kopf von
        // klang-k1-nacht −40,1 dB bei 4 606 Hz. Derselbe Lauf wie klang.K1#1 und klang.K5#1 (Zwilling).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const d = (j && j.daten) || {};
            const orte = ["wiese", "seeufer", "wald", "dorf", "nacht", "regen", "gehend", "fahrend"];
            if (!orte.every((o) => d[o] && d[o].mixMitte && d[o].um) || !d.wieseOhneLeib)
                return { gruen: false, zahl: "kein Zensus der Orte, Szenen und der Mutation (Exit " + lauf.exit + ")" };
            const db = (o, s) => d[o].mixMitte[s].db;
            const leib = (o) => d[o].zensus.leiber || { gehoert: 0, gezeichnet: 0 };
            const chorOhne = d.wieseOhneLeib.zensus.stimmen.some((v) => v.name === "vogel" && v.an);
            // die Befunde dieses Kriteriums: SOLL, Lab = Welt, Ruf ← Leib, Ort fehlt, je Szene (N), der Tier-Ruf ohne Leib
            const rot = (j.rot || []).filter((t) => /^(S|L|R|O|N)[ :]|^E tier:/.test(t));
            const szenen = ["nacht", "regen", "gehend", "fahrend"];
            const ruf = ["wiese", ...szenen].every((o) => leib(o).gehoert === leib(o).gezeichnet);
            const bewegt = d.gehend.um.weg >= 10 && !d.gehend.um.sattel && d.fahrend.um.weg >= 30 && d.fahrend.um.sattel;
            const gruen =
                rot.length === 0 && ruf && bewegt && leib("wiese").gehoert > 0 && leib("wieseOhneLeib").gezeichnet === 0 &&
                !chorOhne && db("nacht", "grille") >= -46 && !(db("nacht", "vogel") > -64) && db("regen", "regen") >= -34;
            const f = (v) => (v > -999 ? v.toFixed(1) : "−∞");
            const m = (v) => Math.round(v);
            return {
                gruen,
                zahl:
                    "Nacht grille " + f(db("nacht", "grille")) + " · vogel " + f(db("nacht", "vogel")) + " dB (" + leib("nacht").gehoert +
                    " Leiber) · Regen regen " + f(db("regen", "regen")) + " (wind " + f(db("regen", "wind")) + ", vogel " + f(db("regen", "vogel")) +
                    " aus " + leib("regen").gehoert + " Leibern) · gehend " + m(d.gehend.um.weg) + " m wind " + f(db("gehend", "wind")) + " vogel " +
                    f(db("gehend", "vogel")) + " (" + leib("gehend").gehoert + "/" + leib("gehend").gezeichnet + ") · fahrend " + m(d.fahrend.um.weg) +
                    " m " + (d.fahrend.um.sattel ? "im Sattel" : "ZU FUSS") + " wind " + f(db("fahrend", "wind")) + " vogel " + f(db("fahrend", "vogel")) +
                    " (" + leib("fahrend").gehoert + "/" + leib("fahrend").gezeichnet + ")" +
                    (rot.length ? " · " + rot.length + " Befund(e): " + rot.slice(0, 2).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "tetrapoda-core.js",
            "gelaende-core.js",
            "phyto-core.js",
            "stamm/klang.js",
            "stamm/kreatur-*.js",
            "stamm/siedlung-*.js",
            "stamm/stoff-*.js",
            "stamm/feld-leben.js",
            "stamm/dirigent-*.js",
            "stamm/bild-himmel.js",
            "stamm/koerper-*.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/daten.js",
            "worlds/klang/klang.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
        ],
        quelle: "2 = zusätzlich Nacht (Grillen), Regen, gehend und fahrend",
    },
    {
        kriterium: "klang.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M33 in der Sitzung (`windSeite`, oben): 21 s an der Mess-Wiese, Ego, Böen frei, Tiere gehalten, der Klang in einem eigenen
        // Kontext; Bild = das präsentierte Fenster (|ΔLuma| im Boden-Ausschnitt), Ohr = Analyser am Gain der Wind-Stimme, je 0,2 s ein
        // Fenster (≥ 100 wie vorher, Lag ±3 s). Bis 29.10. m15-wind 60 s in 0,5-s-Fenstern mit eigenem Boot (ea07267e Radeon 3,68 min)
        probe: { sek: 45, befehl: sitzungBefehl(windLauf, [windSeite]) },
        mutiert: false,
        gpu: true,
        // zeit: der Screencast liefert seine Bilder nur ungestört (27.10., Takt 8 erstmals in Bahnen: neben zwei Bild-Läufen CV Bild
        // 2,16 statt 0,26–0,29 und r 0,00 statt 0,80–0,85 an 607d0c73 · b2c6c627 · 83df2052) — das Urteil hängt an der Wanduhr
        zeit: true,
        minuten: 0.5,
        urteil: (j, lauf) => {
            const z = jsonZeile(lauf.stdout, /^\{"stand":/);
            if (!z || !z.r0) return { gruen: false, zahl: "keine Wind-Zeile (Exit " + lauf.exit + ")" };
            const an = !!(z.stand && z.stand.enabled && z.stand.ctx === "running");
            // die Mindest-Varianz beider Signale (Schlupfloch „Wind konstant“): Variationskoeffizient ≥ 0,1 je Reihe
            const gruen = an && z.fenster >= 100 && z.r0.r >= 0.6 && z.r0.cvX >= 0.1 && z.r0.cvY >= 0.1;
            return {
                gruen,
                zahl:
                    "r " + z.r0.r.toFixed(2) + " bei Lag 0 (n " + z.r0.n + "), Spitze " + (z.best ? z.best.r.toFixed(2) + " bei " + z.best.lagS + " s" : "?") +
                    ", CV Bild " + z.r0.cvX.toFixed(2) + " / Ohr " + z.r0.cvY.toFixed(2) + ", " + z.fpsVor + " fps, Klang " + (an ? "an" : "AUS"),
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/stoff-material.js",
            "stamm/stoff-instanz.js",
            "stamm/daten.js",
            "phyto-core.js",
            "stamm/vegetation-wiese.js",
            "stamm/vegetation-streu.js",
            "spec/profiband/haushalt.json",
            "scripts/lib/band-urteil.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/werkbank.cjs",
        ],
        quelle: "1 = Wind an einem Gerät: Kreuzkorrelation Luma-Varianz der Halme/Kronen ↔ Pegel des Wind-Busses r ≥ 0,6",
    },
    {
        kriterium: "klang.K2",
        staffel: 2,
        geraet: "headless",
        // Der Lauf (U) der Klang-Linse (`diag-klang-zensus --gesehen`, Zweig kk2-ufer): der Spieler geht im echten Spiel (Ego, W
        // und S gehalten bis zum Ereignis) vom Bach der Mess-Wiese 45 m weg und zurück, derweil spricht er das Wetter (Sturm, dann
        // bewölkt). Je 0,1 s das Ohr — RMS am Gain der Stimmen fluss + ufer und regen — und das Bild: die sichtbare Strömung
        // √Σ adv · flowMix / d² über die Wasser-Vertices im Blick (die Rampe, mit der der Shader die Strähnen über |aFlow| treibt) und
        // die Deckkraft des gezeichneten Regens. Je Paar r bei Lag 0 in 0,5-s-Fenstern (Lag ±3 s wie Staffel 1), CV beider ≥ 0,1
        // (das Schlupfloch „konstant") und nie stumm im Bild (≤ 2 % der Fenster mit Bild ≥ 10 % seiner Spitze ohne Ohr); der
        // Selbsttest friert den Pegel am Ohr ein (Fluss, Ufer, Regen) und muss je Paar ROT fallen. Headless: Ohr und Bild lesen
        // dieselben Größen auf jedem Gerät (Analyser am Graph, Szene, Material) — kein Pixel urteilt, kein GPU-Abgriff.
        // An main b2c6c627 ROT: ufer r 0,69, stumm im Bild 85 von 263 Fenstern (der Hör-Ring verlor den Bach bei 13–14 und
        // 23–27 m); am Kopf von kk2-ufer ufer r 0,89–0,95, stumm 0, regen r 0,99–1,00, Selbsttest ufer r 0,00 / regen r −0,34.
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--gesehen", "--selftest", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const g = j && j.gesehen;
            if (!g || !g.ufer || !g.regen || !j.selbst) return { gruen: false, zahl: "kein Gesehen-Lauf mit Selbsttest (Exit " + lauf.exit + ")" };
            const haelt = (u) => u.r0.n >= 60 && u.r0.r >= 0.6 && u.r0.cvBild >= 0.1 && u.r0.cvOhr >= 0.1 && u.stumm <= 0.02 * u.sicht;
            const feuert = !haelt(j.selbst.ufer) && !haelt(j.selbst.regen);
            const z = (n, u) =>
                n + " r " + u.r0.r.toFixed(2) + " bei Lag 0 (n " + u.r0.n + ", Spitze " + u.best.r.toFixed(2) + " bei " + u.best.lagS + " s, CV Bild " +
                u.r0.cvBild.toFixed(2) + " / Ohr " + u.r0.cvOhr.toFixed(2) + ", stumm " + u.stumm + "/" + u.sicht + ")";
            return {
                gruen: haelt(g.ufer) && haelt(g.regen) && feuert,
                zahl: z("Ufer", g.ufer) + " · " + z("Regen", g.regen) + " · Selbsttest (eingefroren) " + (feuert ? "ROT" : "BLIND"),
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/bild-himmel.js",
            "stamm/bild-sicht.js",
            "stamm/daten.js",
            "gelaende-core.js",
            "phyto-core.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "2 = auch Ufer (Pegel ↔ sichtbare Strömung) und Regen, beide Geräte",
    },
    {
        kriterium: "klang.K3",
        staffel: 1,
        geraet: "headless",
        // der Zensus (Ra), Zweig klang-raum: derselbe Tier-Ruf (ein Leib der Welt, `_tierRuf` → Gesetzbuch `tierRuf`) in 3 · 8 ·
        // 20 m und dieselbe Glut (der Bau des Dorfs, die Lage am Ohr durch den Studio-Graphen) in 1,5 · 3 · 6 m; das Ohr dreht sich
        // (die Kamera), die Quelle klingt −90° · +90° · −30° · +30° neben dem Blick, der Master an einem Stereo-OfflineAudioContext.
        // Je Probe ILD = R − L und der Pegel in dB (j.raum.proben). GRÜN: 24 Proben (je Quelle 12), 100 % mit dem Vorzeichen der
        // Seite ≥ 3 dB, der Pegel fällt je Abstands-Stufe ≥ 1 dB, kein Befund „Ra" (dort auch: die Welt hört die Quelle in einem
        // anderen Abstand). Die Mutation „Panner aus" (S15, `--selftest`) ist ROT an Ruf und Glut. Am Kopf von klang-raum 24/24:
        // ±90° ILD ±80 … ±102 dB (die andere Seite schweigt), ±30° ±7,7 dB, tier −23,0 › −31,5 › −39,4 dB, glut −17,7 › −23,7 ›
        // −29,7 dB. Derselbe Lauf wie klang.K1#1 und klang.K5#1 (Zwilling).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const ra = j && j.raum;
            if (!ra || !Array.isArray(ra.proben)) return { gruen: false, zahl: "kein Raum-Teil (Ra) im Zensus (Exit " + lauf.exit + ")" };
            const p = ra.proben
                .map((t) => /^(tier|glut) (-?\d+)° ([\d.]+) m (-?[\d.]+)\/(-?[\d.]+)$/.exec(t))
                .filter(Boolean)
                .map((m) => ({ q: m[1], w: +m[2], d: +m[3], ild: +m[4], db: +m[5] }));
            const richtig = p.filter((x) => x.ild * Math.sign(x.w) >= 3).length;
            // der Pegel fällt mit dem Abstand: je Quelle und Winkel die Abstände aufsteigend
            const faellt = p.every((x) => p.every((y) => y.q !== x.q || y.w !== x.w || !(y.d > x.d) || y.db <= x.db - 1));
            const je = (q) => p.filter((x) => x.q === q).length;
            const rot = (j.rot || []).filter((t) => /^Ra /.test(t));
            const gruen = p.length === 24 && je("tier") === 12 && je("glut") === 12 && richtig === 24 && faellt && rot.length === 0;
            const pegel = (q, w) => p.filter((x) => x.q === q && x.w === w).map((x) => x.d + " m " + x.db.toFixed(1)).join(" › ");
            const ild = (w) => p.filter((x) => x.w === w).map((x) => Math.abs(x.ild)).reduce((a, b) => Math.min(a, b), Infinity);
            return {
                gruen,
                zahl:
                    richtig + "/" + p.length + " Vorzeichen richtig (tier " + je("tier") + ", glut " + je("glut") + ") · |ILD| ≥ " +
                    ild(90).toFixed(1) + " dB bei 90°, ≥ " + ild(30).toFixed(1) + " dB bei 30° · Pegel " + (faellt ? "fällt" : "FÄLLT NICHT") +
                    ": tier " + pegel("tier", 90) + " · glut " + pegel("glut", 90) + " dB" +
                    (rot.length ? " · " + rot.length + " Befund(e): " + rot.slice(0, 2).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "tetrapoda-core.js",
            "stamm/klang.js",
            "stamm/kreatur-*.js",
            "stamm/siedlung-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "1 = Richtung und Entfernung: links/rechts zu 100 % mit richtigem Vorzeichen (ILD/ITD am Stereo-Abgriff)",
    },
    {
        kriterium: "klang.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M15 K4 in der Sitzung (`schrittSeite`, oben): je Stoff 3,5 s Gehen mit W an einem Ort, dessen 12-m-Gangstrecke
        // `_schrittMaterialAt` — das Gesetz des Schritts, bei stehender Boden-Karte — zu ≥ 80 % einen trockenen Stoff nennt (fehlt er an
        // der Wiese, fährt die Probe ferne Kandidaten an), Analyser an jedem Schritt-Gain, je Etikett des Schritts der Schwerpunkt-Median.
        // Bis 29.10. m15-schritt mit eigenem Boot, 10 s je Stoff (an main 83df2052 Radeon gras 5648 Hz n 21 · laub 5265 Hz n 23 · quarz
        // 3208 Hz n 21, kleinster Abstand 383 Hz; ea07267e Radeon 2,09 min)
        probe: K4_PROBE,
        mutiert: true,
        ausnahme: K4_AUSNAHME,
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const je = [];
            for (const l of String(lauf.stdout || "").split(/\r?\n/)) {
                const m = /^(\S+) n (\d+) median ([\d.]+) p10 (\S+) p90 (\S+)$/.exec(l.trim());
                if (m && !/^(undefined|null)$/.test(m[1]) && +m[2] >= 5) je.push({ stoff: m[1], n: +m[2], hz: +m[3] });
            }
            if (je.length < 3) return { gruen: false, zahl: je.length + " Stoffe mit ≥ 5 Schritten (Exit " + lauf.exit + ")" };
            let min = Infinity;
            for (let a = 0; a < je.length; a++) for (let b = a + 1; b < je.length; b++) min = Math.min(min, Math.abs(je[a].hz - je[b].hz));
            return {
                gruen: min >= 300,
                zahl: je.map((s) => s.stoff + " " + Math.round(s.hz) + " Hz (n " + s.n + ")").join(" · ") + " — kleinster Abstand " + Math.round(min) + " Hz",
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/koerper-seele.js",
            "stamm/kampf.js",
            "stamm/vegetation-wiese.js",
            "stamm/wasser-hydro.js",
            "stamm/daten.js",
            "scripts/lib/band-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/werkbank.cjs",
        ],
        quelle: "1 = am Abgriff gemessen: der Spektral-Schwerpunkt der Schritte je Stoff ≥ 300 Hz verschieden",
    },
    {
        kriterium: "klang.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // EIN Lauf, alle vier Teile (derselbe wie klang.K4#1): (S) die Schritte je Stoff (`schrittSeite`, Analyser am Schritt-Gain,
        // stdout); (F) der Körper-Teil des Klang-Zensus (werkzeug + koerperSeite aus diag-klang-zensus am SHA, j.koerper): je Abgriff liegt der
        // Master-Bus EINEN Klang-Takt lang an einem OfflineAudioContext, die Linse fährt den festen Schritt des Leibs —
        // motor [Upm, Hz] im Sattel des GT mit Gas (der Grundton = die stärkste Linie gegen die Drehzahl klang `fahrtUpm`),
        // landung [h, Aufprall des Leib-Lösers `_sturzTempo`, Landungen, Aufprall des Klangs, dB] für einen Hopser aus 0,2 m und
        // Stürze aus 1 · 2 · 4 · 8 · 12 m, doppler [wo, soll, ist] an sechs Punkten 9 · 4,5 · 2 m vor und hinter dem nächsten Punkt
        // einer Vorbeifahrt (die Periode des Abrollens, c 343 m/s). Urteil, nie weicher als die Staffel: Schritte ≥ 3 Stoffe
        // (n ≥ 5) mit kleinstem Abstand ≥ 300 Hz UND Motor r ≥ 0,9 (≥ 10 Abgriffe) UND Landung genau einmal je Sturz mit dem
        // Aufprall des Leib-Lösers, je Stufe lauter und r(dB, Aufprall) ≥ 0,9, der Hopser stumm UND Doppler: die Radial-
        // Geschwindigkeit am Ohr v = c·(1 − 1/f) über die des Gesetzes, beide Vorzeichen, Steigung durch den Ursprung 1 ± 10 %,
        // r ≥ 0,9, jeder Punkt ± 10 % — dazu kein Befund „F …" der Linse. Das Klang-Gesetz des Körpers ist CPU (OfflineAudioContext),
        // die Schritte tragen die Karte der Sitzung. Bis 29.10. m15-schritt und der ganze Zensus mit zwei eigenen Boots (ea07267e 5,25 min).
        probe: K4_PROBE,
        mutiert: true,
        ausnahme: K4_AUSNAHME,
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const f = (x, n) => (typeof x === "number" && isFinite(x) ? x.toFixed(n) : "—");
            const r = (a, b) => {
                const mu = (v) => v.reduce((s, x) => s + x, 0) / v.length;
                const [ma, mb] = [mu(a), mu(b)];
                const k = (u, mu1, v, mu2) => u.reduce((s, x, i) => s + (x - mu1) * (v[i] - mu2), 0);
                return a.length > 2 ? k(a, ma, b, mb) / Math.sqrt(k(a, ma, a, ma) * k(b, mb, b, mb)) : NaN;
            };
            // (S) die Schritte je Stoff — dasselbe Urteil wie klang.K4#1
            const je = [];
            for (const l of String(lauf.stdout || "").split(/\r?\n/)) {
                const m = /^(\S+) n (\d+) median ([\d.]+) p10 (\S+) p90 (\S+)$/.exec(l.trim());
                if (m && !/^(undefined|null)$/.test(m[1]) && +m[2] >= 5) je.push({ stoff: m[1], n: +m[2], hz: +m[3] });
            }
            let dHz = je.length >= 3 ? Infinity : NaN;
            for (let a = 0; a < je.length; a++) for (let b = a + 1; b < je.length; b++) dHz = Math.min(dHz, Math.abs(je[a].hz - je[b].hz));
            const schritt = dHz >= 300;
            const F = j && j.koerper;
            if (!F || !Array.isArray(F.motor) || !Array.isArray(F.landung) || !Array.isArray(F.doppler))
                return { gruen: false, zahl: "Schritte " + je.length + " Stoffe, Δ " + f(dHz, 0) + " Hz · kein Körper-Teil (F) im Zensus (Exit " + lauf.exit + ")" };
            // (M) der Motor-Grundton über die Drehzahl
            const M = F.motor.filter((x) => x[0] > 0 && x[1] > 0);
            const rM = r(M.map((x) => x[0]), M.map((x) => x[1]));
            const motor = M.length >= 10 && rM >= 0.9;
            // (L) die Landung mit dem Aufprall des Leib-Lösers
            const fall = F.landung.slice(1);
            const rL = r(fall.map((x) => x[1]), fall.map((x) => x[4]));
            const landung =
                !(F.landung[0] && F.landung[0][2]) &&
                fall.length === 5 &&
                fall.every((x, i) => x[2] === 1 && Math.abs(x[3] - x[1]) <= 1e-3 && (!i || x[4] >= fall[i - 1][4] + 0.5)) &&
                rL >= 0.9;
            const dbJe = fall.length > 1 ? (fall[fall.length - 1][4] - fall[0][4]) / (fall[fall.length - 1][1] - fall[0][1]) : NaN;
            // (D) Doppler proportional zur Radial-Geschwindigkeit: v = c·(1 − 1/f) am Ohr gegen die des Gesetzes
            const D = F.doppler.filter((x) => x[2] > 0);
            const [vs, vi] = [D.map((x) => 343 * (1 - 1 / x[1])), D.map((x) => 343 * (1 - 1 / x[2]))];
            const k = vs.reduce((s, x, i) => s + x * vi[i], 0) / vs.reduce((s, x) => s + x * x, 0);
            const rD = r(vs, vi);
            const doppler =
                D.length === F.doppler.length &&
                D.length >= 6 &&
                vs.some((x) => x > 0) &&
                vs.some((x) => x < 0) &&
                D.every((x) => (x[2] - 1) * (x[1] - 1) > 0 && Math.abs(x[2] - x[1]) <= 0.1 * Math.abs(x[1] - 1)) &&
                Math.abs(k - 1) <= 0.1 &&
                rD >= 0.9;
            const rotF = (j.rot || []).filter((t) => /^F /.test(t));
            return {
                gruen: schritt && motor && landung && doppler && rotF.length === 0,
                zahl:
                    (schritt ? "✅" : "❌") + " Schritte " + je.map((s) => s.stoff + " " + Math.round(s.hz) + " Hz (n " + s.n + ")").join(" · ") +
                    ", kleinster Abstand " + f(dHz, 0) + " Hz · " + (motor ? "✅" : "❌") + " Motor r " + f(rM, 4) + " (" + M.length +
                    " Abgriffe, " + f(M.length ? (M[0][1] / M[0][0]) * 1000 : NaN, 1) + " Hz je 1000 Upm) · " + (landung ? "✅" : "❌") +
                    " Landung " + f(dbJe, 2) + " dB je m/s, r " + f(rL, 4) + " (" + fall.map((x) => x[0] + " m " + f(x[1], 1) + " m/s " + f(x[4], 1) + " dB").join(" · ") +
                    ") · " + (doppler ? "✅" : "❌") + " Doppler Steigung " + f(k, 4) + " r " + f(rD, 4) + " (" +
                    F.doppler.map((x) => x[0] + " m " + f(343 * (1 - 1 / x[1]), 1) + " m/s " + f(x[2], 4) + "/" + f(x[1], 4)).join(" · ") + ")" +
                    (rotF.length ? " · " + rotF.length + " Befund(e): " + rotF.slice(0, 2).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "vehicle-core.js",
            "koerper-core.js",
            "stamm/klang.js",
            "stamm/koerper-seele.js",
            "stamm/kampf.js",
            "stamm/dirigent-takt.js",
            "stamm/vegetation-wiese.js",
            "stamm/wasser-hydro.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/band-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/werkbank.cjs",
            "spec/profiband/haushalt.json",
        ],
        quelle: "2 = beides, die Landung skaliert mit dem Aufprall, Doppler proportional zur Radialgeschwindigkeit",
    },
    {
        kriterium: "klang.K5",
        staffel: 1,
        geraet: "headless",
        // der Zensus (K): Welt-Abfragen des Klang-Takts vor → nach 4000 fernen Bauten und 200 Fluss-Läufen (Null-Renderer, R3)
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const k = j && j.kosten;
            if (!k || !k.vor || !k.nach || !Array.isArray(k.wachsen))
                return { gruen: false, zahl: "kein Kosten-Teil im Zensus (Exit " + lauf.exit + ")" };
            const arten = Object.keys(k.vor);
            const rotK = (j.rot || []).filter((t) => /^K:/.test(t));
            const gruen = arten.length >= 6 && k.wachsen.length === 0 && rotK.length === 0;
            return {
                gruen,
                zahl:
                    "Welt-Abfragen je Takt vor " + JSON.stringify(k.vor) + " → nach 4000 Bauten + 200 Fluss-Läufen " +
                    JSON.stringify(k.nach) + (k.wachsen.length ? " · wächst: " + k.wachsen.join(", ") : " · nichts wächst"),
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/dirigent-takt.js",
            "stamm/wasser-*.js",
            "stamm/gelaende-*.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = die Kosten sind an das Hörbare gebunden (gemessen)",
    },
    {
        kriterium: "klang.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // M15 in der Sitzung (`taktFahrt`, oben: taktSeite der Klang-Linse am SHA): gehen · Fahrt · nachts je 600 Bilder (≥ 600 wie
        // vorher), Klang-ms je Bild, die Aussetzer am Ausgang über `AudioContext.playbackStats` vor und nach dem Gang (j.aussetzer =
        // { n, still, s }; null = ungezählt → ROT „T aussetzer"). DER GANG IST VERDICHTET (Gesetz 29.10.: die Dauerlast liegt in der
        // EINEN Fahrt ≤ 30 min): 0 Aussetzer über die ganze Wiedergabe der drei Phasen (≥ 15 s) statt 10 min an der Uhr — die 10 min
        // der Staffel nennt die Zahl, der Schöpfer entscheidet ihren Text. Bis 29.10. `--takt --echt --minuten 10` mit eigenem Boot
        // (ea07267e Radeon 14,74 min).
        probe: { sek: 75, befehl: sitzungBefehl(taktLauf, [taktFahrt]) },
        mutiert: true,
        ausnahme:
            "drei Phasen je 600 Bilder in Bewegung (gehen, Fahrt im GT, Nacht) bei 60 Hz ≥ 30 s Wiedergabe, dazu Aufsitzen und Einlauf — " +
            "erwartet ~40 s, Deckel 75 s (bis 29.10.: 10 min Spielgang, 14,7 min mit eigenem Boot)",
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const ph = (j && j.phasen) || {};
            const takt = ["gehen", "fahrt", "nacht"].map((n) => ({ n, p: ph[n] }));
            const a = j && j.aussetzer;
            const gruen =
                lauf.exit === 0 &&
                takt.every((t) => t.p && t.p.bilder >= 600 && t.p.p95 <= 0.2) &&
                !!(ph.fahrt && ph.fahrt.sattel) &&
                !!j && Array.isArray(j.rot) && !j.rot.length &&
                !!a && a.n === 0 && a.s >= 15;
            return {
                gruen,
                zahl:
                    "Klang-Takt p95 " + takt.map((t) => t.n + " " + (t.p ? t.p.p95 : "?")).join(" · ") + " ms · Aussetzer " +
                    (a ? a.n + " in " + a.s + " s Wiedergabe (" + a.still + " s still; verdichtet, Staffel: 10 min)" : "ungezählt") + " (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/dirigent-takt.js",
            "stamm/koerper-fahrt.js",
            "stamm/koerper-seele.js",
            "stamm/kreatur-leben.js",
            "stamm/kreatur-verhalten.js",
            "stamm/wasser-hydro.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/vram-abgriff.cjs",
            "scripts/lib/draw-zaehler.cjs",
            "scripts/werkbank.cjs",
        ],
        quelle: "2 = dazu Klang-Takt ≤ 0,2 ms Haupt-Faden p95 in Bewegung und 0 Aussetzer in 10 min Spielgang, beide Geräte",
    },

    // ─────────────────────────────── Speicher K1 · K2 · K3 · K4 · K5 ───────────────────────────────
    {
        kriterium: "speicher.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M37 in der Sitzung (`todZyklus`, oben): vier Tode am Pfad des Spielers — am Schreib-Haken idb und platz des Speicher-Fadens,
        // hart im Dorf-Erwachen und an dessen IDB-Schreiben; Alter des geladenen Stands, halbe Welt (Blöcke und Edits), korrupt.
        // Bis 29.10. echt-k1 20 (20 harte Tode des Browsers, je ein Boot; ea07267e Radeon 13,24 min)
        probe: TOD_PROBE,
        mutiert: true,
        ausnahme: TOD_AUSNAHME,
        gpu: true,
        zeit: true,
        minuten: 1.5,
        urteil: (j, lauf) => {
            if (!j || !Array.isArray(j.zyklen)) return { gruen: false, zahl: "kein Ergebnis des Tab-Tods (Exit " + lauf.exit + ")" };
            const verfehlt = j.zyklen.filter((z) => z.verfehlt).length;
            // eine Sonde ohne Messung ist ROT (23.10.: carveVoxelSphere hiess nach editform-kern carveVoxel, 20 Zyklen ohne Edit)
            const edits = Math.max(0, ...j.zyklen.map((z) => z.eGeladen || 0));
            if (!(edits > 0)) return { gruen: false, zahl: "Sonde blind: in keinem Zyklus entstand ein Edit" };
            if (j.bauFehler > 0) return { gruen: false, zahl: "Sonde wackelt: der Bauer warf " + j.bauFehler + "-mal (ausser dem Tod)" };
            const oa = ohneAlter(j);
            const gruen = j.tode >= 4 && j.ueber10 === 0 && j.halbe === 0 && j.korrupt === 0 && verfehlt === 0 && j.alterMax <= 10;
            return {
                gruen,
                zahl:
                    j.tode + " Tode: Alter max " + j.alterMax + " s, " + j.ueber10 + " über 10 s · " + j.korrupt + " korrupt · " +
                    j.halbe + " halbe Welten · " + verfehlt + " Haken verfehlt" + (oa.length ? " · ohne Alter " + oa.join(" · ") : ""),
            };
        },
        pfad: SPEICHER_PFAD.concat(["speicher-faden.js", "scripts/werkbank.cjs"]),
        quelle: "1 = der Browser-Pfad (ohne save-server) besteht den Tab-Tod an einem Gerät: Stand ≤ 10 s alt, 0 korrupt, 0 halbe Welten",
    },
    {
        kriterium: "speicher.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // derselbe Lauf an beiden Geräten; dazu verlangt: Tode mitten im IDB-put und am localStorage-Platz, und der Tod im
        // laufenden Gang des Dorf-Erwachens (hart und am IDB-Schreiben des saveState, der den Gang schließt — be20b015)
        probe: TOD_PROBE,
        mutiert: true,
        ausnahme: TOD_AUSNAHME,
        gpu: true,
        zeit: true,
        minuten: 1.5,
        urteil: (j, lauf) => {
            if (!j || !Array.isArray(j.zyklen)) return { gruen: false, zahl: "kein Ergebnis des Tab-Tods (Exit " + lauf.exit + ")" };
            const verfehlt = j.zyklen.filter((z) => z.verfehlt).length;
            // eine Sonde ohne Messung ist ROT (23.10.: carveVoxelSphere hiess nach editform-kern carveVoxel, 20 Zyklen ohne Edit)
            const edits = Math.max(0, ...j.zyklen.map((z) => z.eGeladen || 0));
            if (!(edits > 0)) return { gruen: false, zahl: "Sonde blind: in keinem Zyklus entstand ein Edit" };
            if (j.bauFehler > 0) return { gruen: false, zahl: "Sonde wackelt: der Bauer warf " + j.bauFehler + "-mal (ausser dem Tod)" };
            const oa = ohneAlter(j);
            const tode = j.zyklen.filter((z) => z.tod).map((z) => z.tod);
            const gang = j.zyklen.filter((z) => z.erwachen && z.erwachen.gangAktiv).length;
            const arten = ["idb", "platz", "erwachen-hart", "erwachen-idb"].filter((a) => tode.includes(a));
            const gruen =
                j.tode >= 4 && j.ueber10 === 0 && j.halbe === 0 && j.korrupt === 0 && verfehlt === 0 && j.alterMax <= 10 && arten.length === 4 && gang >= 2;
            return {
                gruen,
                zahl:
                    j.tode + " Tode: Alter max " + j.alterMax + " s · " + j.korrupt + " korrupt · " + j.halbe + " halbe · " + verfehlt +
                    " verfehlt · Tod-Arten " + arten.join("/") + " · im laufenden Erwachen " + gang + (oa.length ? " · ohne Alter " + oa.join(" · ") : ""),
            };
        },
        pfad: SPEICHER_PFAD.concat(["speicher-faden.js", "scripts/werkbank.cjs"]),
        quelle: "2 = an beiden Geräten, auch mitten im IDB- oder localStorage-Schreiben",
    },
    {
        kriterium: "speicher.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M38 in der Sitzung: DAS SPEICHER-BILD der frischen Welt aus derselben Probe wie speicher.K2#2 (`speicherTaktSeite`, oben) —
        // je Task die Haupt-Faden-ms von saveState, _standNachholen, _standFegen und dem Versand zusammen (die Kosten je Save, der
        // Ruf allein war bis 29.10. eine untere Schranke), p95 über die Speicher-Bilder von 20 Ständen ≤ 0,3 ms. Trägt die Welt der
        // Sitzung schon Edits, holt die Probe vorher die Grundstellung (frisch). Bis 29.10. echt-k1 4 k2 (4 Tode, je Ruf die ms;
        // ea07267e Radeon 5,97 min).
        probe: SPEICHER_TAKT_PROBE,
        mutiert: true,
        ausnahme: SPEICHER_TAKT_AUSNAHME,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const f = j && j.frisch;
            if (!f || !(f.bilder > 0)) return { gruen: false, zahl: "keine Speicher-Bilder der frischen Welt (Exit " + lauf.exit + ")" };
            // eine Sonde ohne Messung ist ROT: kein Stand kam an
            if (!(f.staende >= 20)) return { gruen: false, zahl: "Sonde blind: " + f.staende + " Stände in der frischen Welt" };
            return {
                gruen: f.p95 <= 0.3,
                zahl:
                    "je Speicher-Bild in der frischen Welt p50 " + f.p50 + " / p95 " + f.p95 + " / max " + f.max + " ms (Soll p95 ≤ 0,3; " +
                    f.staende + " Stände, " + f.bilder + " Speicher-Bilder" + (j.grundstellung ? ", Grundstellung vorher" : "") + ")",
            };
        },
        pfad: SPEICHER_PFAD.concat(["speicher-faden.js", "scripts/werkbank.cjs"]),
        quelle: "1 = ≤ 0,3 ms je Bild (p95) in einer frischen Welt, auf dem Pfad des Spielers",
    },
    {
        kriterium: "speicher.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // `speicherTaktSeite` (oben) in der Welt der Sitzung: Fenster und Karte, der echte Takt mit dem Autosave des Spiels (seine Uhr
        // gestellt: saveInterval 0,5 s statt 5 s, derselbe Pfad); eine Hülle um jeden Speicher-Schritt des Haupt-Fadens — der Ruf
        // (saveState), das Zusammensetzen (_standNachholen), der Besen (_standFegen), der Versand (schicke) — summiert je Task das
        // SPEICHER-BILD. 20 Stände frisch, dann 10 000 Gruben am Ereignis (der Zustand „nach 2 h mit 10 000 Edits", nie die Wanduhr),
        // wieder 20 Stände. Ein Bild über 16,7 ms (am vsync-Zeitstempel, Toleranz 0,5 ms) trägt das Speichern, wenn es ohne dessen ms
        // darunter bliebe. Bis 29.10. speicher-zwei `takt --echt` mit eigenem Boot (ea07267e Radeon 6,56 min).
        probe: SPEICHER_TAKT_PROBE,
        mutiert: true,
        ausnahme: SPEICHER_TAKT_AUSNAHME,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const ph = j ? [j.frisch, j.edits] : [];
            if (!ph[0] || !ph[1]) return { gruen: false, zahl: "keine Speicher-Bilder (Exit " + lauf.exit + ")" };
            // eine Sonde ohne Messung ist ROT: kein Stand kam an, oder die Gruben fehlen
            if (ph.some((p) => !(p.staende >= 20 && p.bilder > 0)) || !(j.edits.n >= 10000))
                return { gruen: false, zahl: "Sonde blind: " + ph.map((p) => p.staende + " Stände").join(" / ") + ", " + j.edits.n + " Edits" };
            const zeile = (p) =>
                "p50 " + p.p50 + " / p95 " + p.p95 + " / max " + p.max + " ms (" + p.bilder + " Bilder), " + p.wegen + " von " + p.ueber +
                " Bildern > 16,7 ms durch Speichern";
            return {
                gruen: ph.every((p) => p.p95 <= 0.1 && p.max <= 16.7 && p.wegen === 0),
                zahl: "Speicher-Bild frisch " + zeile(j.frisch) + " · nach " + j.edits.n + " Edits " + zeile(j.edits) + " (Soll p95 ≤ 0,1)",
            };
        },
        pfad: SPEICHER_PFAD.concat(["speicher-faden.js", "scripts/werkbank.cjs"]),
        quelle: "2 = ≤ 0,1 ms in der frischen Welt UND nach 2 h mit 10 000 Edits, kein Frame > 16,7 ms wegen des Speicherns, beide Geräte",
    },
    {
        kriterium: "speicher.K3",
        staffel: 1,
        geraet: "headless",
        // gate:persistence (D) `--weg`: die frische Welt (der Takt der Orte lebt wie im Spiel) speichert, der Spieler geht 5,1 km in
        // 30 Spielminuten ohne Edit, sie speichert wieder — je Schlüssel des Stands das Δ roh und auf der Platte (der Stand in
        // IndexedDB, sein .bak, das Abbild im localStorage). Geurteilt ohne das Leben (Welt = Seed + Edits + Leben: das Tagebuch,
        // das Gedächtnis des Nexus, die Kreaturen), das je Schlüssel in der Zahl steht; der Selbsttest im selben Gang schmuggelt
        // einen Weg-Zähler in den Stand und MUSS rot an seinem Namen fallen.
        // DER LAUF VON #2 (27.10., Karte lange-stationen): die 1000 Gruben folgen dem Gang, sein Δ (Stand 0 → 1) steht vor ihnen —
        // Zwillinge fahren EINMAL (e7a28b06 headless: #1 20,42 + #2 26,60 min). Statt des Exits (der trüge nun auch das Urteil der
        // Gruben, Staffel 2) liest #1, was sein Exit vorher hieß: seine drei (D)-Zeilen, das Ende des Laufs (die Summen-Zeile) und
        // keinen Fehler der Welt (welt-boot ROT) — der zählt jetzt über den ganzen Lauf, auch über die Gruben: strenger, nie weicher.
        befehl: ["node", "scripts/diag-persistence.cjs", "--weg"],
        env: { PERSISTENCE_PORT: "{PORT}", PERSISTENCE_WEG: "5-30", PERSISTENCE_EDITS: "1000" },
        gpu: false,
        zeit: false,
        minuten: 18,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [teil(/^\s*(✅|❌) \(D\) [\d.]+ km in 30 min ohne Edit/), teil(/^\s*(✅|❌) \(D\) SELBSTTEST/)];
            const voll = teil(/^\s*(✅|❌) \(D\) jeder Stand des Speicher-Fadens/);
            const ende = z.some((x) => /^\d+\/\d+ Persistenz-Invarianten OK\./.test(x)) && !z.some((x) => /^\[welt-boot\] ROT/.test(x));
            if (t.some((x) => !x) || !voll) return { gruen: false, zahl: "Teil (D) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            const km = +/\(D\) ([\d.]+) km/.exec(t[0].l)[1];
            return {
                gruen: t.every((x) => x.ok) && voll.ok && km >= 5 && ende,
                zahl:
                    t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 300)).join(" | ") +
                    (voll.ok ? "" : " | ❌ " + voll.l.replace(/^(✅|❌)\s*/, "").slice(0, 200)) +
                    (ende ? "" : " | ❌ Lauf ohne Ende oder mit Fehlern der Welt (Exit " + lauf.exit + ")"),
            };
        },
        pfad: SPEICHER_PFAD.concat(K3_PFAD),
        quelle: "1 = nach 30 min und 5 km Wanderung ohne Edit Δ ≤ 10 kB gegen die frische Welt",
    },
    {
        kriterium: "speicher.K3",
        staffel: 2,
        geraet: "headless",
        // derselbe Gang, danach 1000 Gruben im 2-m-Raster um den Spieler: Δ roh und auf der Platte (drei Abbilder) dieser Edits
        befehl: ["node", "scripts/diag-persistence.cjs", "--weg"],
        env: { PERSISTENCE_PORT: "{PORT}", PERSISTENCE_WEG: "5-30", PERSISTENCE_EDITS: "1000" },
        gpu: false,
        zeit: false,
        minuten: 18,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [
                teil(/^\s*(✅|❌) \(D\) [\d.]+ km in 30 min ohne Edit/),
                teil(/^\s*(✅|❌) \(D\) 1000 Edits/),
                teil(/^\s*(✅|❌) \(D\) SELBSTTEST/),
            ];
            if (t.some((x) => !x)) return { gruen: false, zahl: "Teil (D) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            const km = +/\(D\) ([\d.]+) km/.exec(t[0].l)[1];
            return {
                gruen: t.every((x) => x.ok) && km >= 5 && lauf.exit === 0,
                zahl: t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 300)).join(" | "),
            };
        },
        pfad: SPEICHER_PFAD.concat(K3_PFAD),
        quelle: "2 = dazu ≤ 100 kB je 1000 Edits, roh und auf der Platte",
    },
    {
        kriterium: "speicher.K4",
        staffel: 1,
        geraet: "headless",
        // gate:persistence aus dem Korpus (spec/speicher-korpus/, je Stand ein echter Boot): (K) das Haus mit Zahlen-id übersteht
        // den Reload mit kaltem Buch, (W) zwei Werke auf der Lichtung,
        // aus (T) die Dichte: nach dem letzten echten Reload steht die Linie der Löcher (> 256 von 300) und kein Stand ist korrupt.
        // Die halbe Welt von (T) urteilt den Tod mitten im Schreiben — das ist Speicher K1 (echt-k1), nicht der Rundlauf; unter
        // Windows meldet (T) sie zudem als Rennen der Linse (taskkill /T erreicht den Baum verzögert, Bericht 2210-messschuld-6cfce).
        befehl: ["node", "scripts/diag-persistence.cjs"],
        env: PERSISTENZ_ENV,
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [
                teil(/^\s*(✅|❌) \(K\) Reload mit kaltem Buch/),
                teil(/^\s*(✅|❌) \(K\) Gegenprobe/),
                teil(/^\s*(✅|❌) \(W\) Werke auf der Lichtung/),
            ];
            const tt = z.find((x) => /^\s*(✅|❌) \(T\) Tab-Tod/.test(x)) || "";
            const linie = /Linie (\d+) Löcher/.exec(tt), korrupt = /(\d+) korrupt/.exec(tt);
            if (t.some((x) => !x) || !linie || !korrupt) return { gruen: false, zahl: "Teil (K)/(W)/(T) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            const dichte = +linie[1] > 256 && +korrupt[1] === 0;
            return {
                gruen: t.every((x) => x.ok) && dichte,
                zahl:
                    t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 90)).join(" | ") +
                    " | " + (dichte ? "✅" : "❌") + " Dichte über den Reload: Linie " + linie[1] + " Löcher, " + korrupt[1] + " korrupt",
            };
        },
        pfad: SPEICHER_PFAD.concat(["stamm/studio-bruecke.js", "stamm/vegetation-baum.js", "scripts/diag-persistence.cjs", "spec/speicher-korpus/*"]),
        quelle: "1 = der Zahlen-Rundlauf (Dichte, Bauten) über einen echten Reload ist bewiesen",
    },
    {
        kriterium: "speicher.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // `speicherBildSeite` (oben) in der Welt der Sitzung, auf ihrer Karte: am Bach der Mess-Wiese
        // (welt-boot uferStellen — das Wasser zeichnet im Blick) setzt der Spieler einen Stein-Block 6 m vor sich und gräbt eine
        // Grube (r 2 m) 9 m vor sich ans Ufer; die Welt steht, die Bühne (Mittag · Sonne · Sommer, das Wetter als Wort, die Uhr
        // gehalten) — Ausgabe-Bild A 320×180. Der Stand ist fest (__stand), die Seite lädt neu (dasselbe Profil: die
        // Wiederkehr), derselbe Ort und Blick, Bild B. diff = Anteil der Pixel mit |ΔLuma| > 8 (von 255); der Pflicht-Inhalt:
        // Bau und Grube stehen vor und nach dem Laden im Stand UND im Blick der Kamera (Third, Neigung −0,5), das Wasser zeichnet.
        // Daneben das RAUSCHEN der Bahn (derselbe Blick ohne Neuladen) und die drei Bilder neben der Ausgabe ({AUS}-vor/-vor2/-nach.png).
        // Das Neuladen ist /reload im warmen Browser der Sitzung. Bis 29.10. speicher-zwei `bild` mit eigenem Boot (ea07267e 3,25 min).
        probe: { sek: 60, befehl: sitzungBefehl(speicherBildLauf, [uferSeite, speicherBildSeite]) },
        mutiert: true,
        ausnahme:
            "die Wiederkehr ist ein Neuladen im warmen Browser (GTX Zweit-Boot ~12 s) und zweimal das Ufer im Blick (das Wasser zeichnet) " +
            "— erwartet ~30 s, Deckel 60 s (bis 29.10.: 3,3 min mit eigenem Boot)",
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            if (!j || !(j.diff >= 0)) return { gruen: false, zahl: "kein Bild-Rundlauf (Exit " + lauf.exit + ")" };
            const ganz = (q) => !!q && q.bau && q.grube && q.wasser > 0;
            return {
                gruen: j.diff <= 1 && ganz(j.vor) && ganz(j.nach),
                zahl:
                    "bild-diff " + (+j.diff).toFixed(2) + " % (Soll ≤ 1; Rauschen ohne Neuladen " + (+j.rauschen).toFixed(2) +
                    " %) · Pflicht vor " + JSON.stringify(j.vor) + " · nach " +
                    JSON.stringify(j.nach) + " · " + ((j.adapter && (j.adapter.renderer || j.adapter.vendor)) || "?"),
            };
        },
        pfad: SPEICHER_PFAD.concat([
            "speicher-faden.js",
            "stamm/bild-himmel.js",
            "stamm/wasser-*.js",
            "stamm/studio-bruecke.js",
            "stamm/vegetation-baum.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/band-urteil.cjs",
            "scripts/werkbank.cjs",
        ]),
        quelle: "2 = bild-diff ≤ 1 % an derselben Pose bei festgehaltener Uhr und Wetter, Pflicht-Inhalt (Bauten, Edits, Wasser) im Bild, beide Geräte",
    },
    {
        kriterium: "speicher.K5",
        staffel: 1,
        geraet: "headless",
        // gate:persistence (U) aus dem Korpus: die Stände eines alten Bodens (V18.530–V18.541, vor K16) laden durch den Boot des
        // Spielers auf den neuen (Bauten in ihrer Höhe über Grund, Gruben am Boden), Gegenprobe: die Stände desselben Bodens ziehen nicht um
        befehl: ["node", "scripts/diag-persistence.cjs"],
        env: PERSISTENZ_ENV,
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [teil(/^\s*(✅|❌) \(U\) Boden-Umzug/), teil(/^\s*(✅|❌) \(U\) Gegenprobe/)];
            if (t.some((x) => !x)) return { gruen: false, zahl: "Teil (U) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            return { gruen: t.every((x) => x.ok), zahl: t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 140)).join(" | ") };
        },
        pfad: ["stamm/dienst.js", "stamm/speicher-*.js", "stamm/gelaende-boden.js", "stamm/siedlung-satz.js", "gelaende-core.js", "scripts/diag-persistence.cjs", "scripts/lib/welt-boot.cjs", "spec/speicher-korpus/*"],
        quelle: "1 = eine Migrations-Klasse bewiesen",
    },
    {
        kriterium: "speicher.K5",
        staffel: 2,
        geraet: "headless",
        // gate:persistence (V): der Korpus spec/speicher-korpus/ — je Versions-Stufe EIN Stand, den ihre Version selbst schrieb
        // (Bauten, Grabe-Hiebe, Inventar), lädt am Kopf durch den Boot des Spielers ohne Verlust; die Versions-Stufe trägt ihren
        // Stand im Baum (fehlt er, schreibt ihn der Kopf und die Zeile ist ROT, bis er committet ist)
        befehl: ["node", "scripts/diag-persistence.cjs"],
        env: PERSISTENZ_ENV,
        gpu: false,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const teil = (re) => { const l = z.find((x) => re.test(x)); return l ? { ok: /✅/.test(l), l: l.trim() } : null; };
            const t = [teil(/^\s*(✅|❌) \(V\) Korpus:/), teil(/^\s*(✅|❌) \(V\) Versions-Stufe/)];
            const n = t[0] && /(\d+) Stände/.exec(t[0].l);
            if (t.some((x) => !x) || !n) return { gruen: false, zahl: "Teil (V) fehlt in der Ausgabe (Exit " + lauf.exit + ")" };
            return {
                gruen: t.every((x) => x.ok) && +n[1] >= 10,
                zahl: t.map((x) => (x.ok ? "✅ " : "❌ ") + x.l.replace(/^(✅|❌)\s*/, "").slice(0, 160)).join(" | "),
            };
        },
        pfad: ["stamm/dienst.js", "stamm/speicher-*.js", "stamm/gelaende-boden.js", "stamm/siedlung-satz.js", "stamm/vegetation-baum.js", "gelaende-core.js", "scripts/diag-persistence.cjs", "scripts/lib/welt-boot.cjs", "spec/speicher-korpus/*"],
        quelle: "2 = ein Korpus aus ≥ 10 alten Versionen (aus git gezogen, unter spec/) lädt am Kopf ohne Verlust, der Korpus wächst je Versions-Stufe",
    },
];

// Nicht fassbar: das Werkzeug fehlt. Je Eintrag der Grund beim Namen; diese Staffeln zählen 0, bis eine Linse sie misst.
module.exports.fehlt = [];
