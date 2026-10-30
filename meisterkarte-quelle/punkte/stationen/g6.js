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
const PW = require("./proben-welt.cjs"); // die Proben der Welt in der Sitzung (streaming.K3#1, streaming.K4#2)

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
            const q = http.request({ host: "127.0.0.1", port, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (a) => {
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
const K4_PROBE = { sek: 10, befehl: sitzungBefehl(schrittLauf, [schrittSeite]) };
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
const TOD_PROBE = { sek: 33, befehl: sitzungBefehl(todLauf, [todFaden, todRec, todZyklus]) };
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
const SPEICHER_TAKT_PROBE = { sek: 33, befehl: sitzungBefehl(speicherTaktLauf, [speicherTaktSeite]) };
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

// DIE ANKUNFT VON AUSSEN (Karte ankunft-aussen): die Kalt- und die Zweit-Zeile von diag-boot-stage — t(Kontrolle) ist die Prozess-Uhr
// ab Navigation, als die von außen gehaltene Taste W den Leib um ≥ 0,1 m trug (nie `_weltbildDa`); was sie liest. Seit 29.10. in der
// Sitzung: die EINE Probe der Ankunft (stationen/sitzung-seite.js `probeAnkunft`, Zwilling von pipeline.K4#1/#2).
const { ANKUNFT_PROBE, ANKUNFT_AUSNAHME } = require("./sitzung-seite.js");
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

// ─────────────────── DAS PROFI-BAND IN DER SITZUNG (profiband K1–K5, PFLICHT E, Karte w3v-profiband) ───────────────────
// 29.10. (der Schöpfer: „Was für 610 min?! Das gibt es nie mehr … Eine komplette Fahrt durch jedes System max 30 min, inbegriffen
// ist dann auch die Dauerlast"): bis dahin fuhr das Band 6 × 80 + 3 × 35 + 25 = 610 min in eigenen Boots je Gerät (K1–K3 4 frische
// Sitzungen × 10 Zellen × 30 s + 6 Bänder, K4 4 Boots × 60 s, K5 ~35 min am Stück). Jetzt misst DER STROM DER SITZUNG (punkte.cjs
// `stromSeite`: je präsentiertem Bild Bild-Zeit, Takt, VRAM, GPU, Befehle, Dreiecke, Ort, Sicht, Sattel, Regler, Halt, Drossel,
// Wetter, Zelle) jede Bild-Größe — EINE Quelle für jede Zelle und für die Dauerlast. Die eigenen Proben stellen nur, was der Strom
// nicht trägt, in Sekunden: je Zelle EIN Fenster `lauf` (seine Spur trägt die BELEGUNG — K2 misst sie nie aus dem Takt), je Ort ×
// Sicht EIN `band` (Ratsche + gpu-bank, K3#1), die Übergänge der Glätte (K4) und die Anker der Dauer (K5).
// DREI PROBEN in der Reihe der Sitzung (punkte.cjs `sitzungsReihe`), EIN Programm (`pbProbe`, die Art als Wort):
//   glaette (K4#1 K4#2, stellung anfang, Ziel 16 s): die Welt eben erwacht — am Genesis-Ring der Stand des Anfangs (GC, Marke
//     dauer-anfang) und das Anker-Fenster der Dauer (Ego gehend, Regler voll), dann Gehen mit V und Fahrt mit E aus und ein unter dem
//     Regler des Spielers (R8): jedes Bild zählt, die Hänger-Linse nennt den Täter jedes Bilds über 33 ms.
//   dauer (K5#1 K5#2, stellung ende, Ziel 14 s): nach jeder Probe, die die Welt lässt, zurück am Start — Bau, Tor, Nacht, das
//     Anker-Fenster ein zweites Mal, der Stand des Endes; geurteilt aus dem Strom zwischen den Marken (≥ 20 min in EINER Seite).
//   gang (K1 K2 K3 je #1 #2, mutiert — gründet die Stadt, stellt 50 Tiere —, Ziel 60 s, ausnahme): die Zellen und Bänder nach dem
//     Rang der Pflicht (E zuerst: Genesis und Wiese × Ego und Third, dann bewegt, dann das Dorf, dann die Stadt) unter der Uhr
//     PB_BUDGET_S; was die Uhr nicht mehr trägt, steht ungemessen beim Namen — eine Station wird nie grün ohne jede ihrer Zellen.
// JE ZELLE zählen ihre Bilder im Strom: die des eigenen Fensters (ohne sein Einschwingen) und — an den Stand-Zellen von E — jedes
// Bild jeder anderen Probe, das dort stand (≤ PB_ORT_M vom Spieler-Platz des Messorts, ≤ 0,5 m/s, die Sicht der Zelle, Regler voll,
// Tiere frei, Sonne, ohne Sattel); die Belegung, der Weg und die Probe der Seite kommen aus dem eigenen Fenster.
const PB_STEHT = ["wiese-ego-steht", "wiese-third-steht", "genesis-ego-steht", "genesis-third-steht"];
const PB_BEWEGT = ["wiese-ego-geht", "wiese-ego-sprint", "wiese-fahrt", "genesis-third-geht", "stadt-ego-geht", "wiese-ego-sturm"];
const PB_BAND = ["wiese-ego", "wiese-third", "genesis-ego", "genesis-third", "dorf-ego", "dorf-third"];
// die Uhr des Gangs, die Fenster (s), der Ort einer Stand-Zelle (m), die Bilder je s eines gültigen Fensters, die GPU-Stempel je Zelle,
// das Mindestmaß einer Stand-Zelle nur aus fremden Bildern, die Dauer am Stück (min)
const PB_KONST = {
    budget: 58,
    steht: { sek: 2, ein: 0.3 },
    geht: { sek: 2, ein: 0.5 },
    anker: { sek: 2, ein: 0.3 },
    glaette: { sek: 2.5, ein: 0.3 },
    ortM: 25,
    bilderJeS: 10,
    gpuN: 8,
    fremdN: 60,
    dauerMin: 20,
};
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
    "scripts/lib/haenger-linse.cjs",
    "scripts/lib/software-gpu.cjs",
    "scripts/lib/vram-abgriff.cjs",
    "scripts/lib/welt-boot.cjs",
];
// SEITEN-CODE (werkbank /eval, r = die Welt): die Probe nach jedem Fenster · Sprint an (Shift+W je s, ein Steckender dreht ab) und
// aus · Tor und Bau (K5: ein Haus 12 m neben dem Spieler, bis es steht, 60 Bilder durch das Welt-Portal und heim, das Haus geräumt;
// bis 29.10. 600 Bilder) · die Nacht (das Wort des Spielers, je 30 Bilder Mitternacht und Mittag) · der Stand neben der Puffer-Linse
// (die Halter des Heaps und die Tiere je Erzeuger: die Eingaben von `gangUrteil`) · die Tiere der Bühne geräumt (nach dem Sturm) ·
// die Übergänge der Glätte über die echten Tasten (V alle 0,75 s; E aus 1 s nach dem Aufsitzen, E ein 1 s später; bis 29.10.: V
// alle 4 s über 90 s, E nach 30 s)
const PB_TASTE =
    'const t = (c, k) => { for (const a of ["keydown", "keyup"]) window.dispatchEvent(new KeyboardEvent(a, { bubbles: true, code: c, key: k })); }; ';
const PB_SEITE = {
    probe:
        "const st = r.state; return { gehalten: !!Object.getPrototypeOf(r).__tiereGehalten, sicht: st.cameraMode, speed: st.speed, " +
        "sprint: st.sprintSpeed, skala: r._szeneSkalaWirk() };",
    sprint:
        'const st = r.state; clearInterval(window.__pbiv); let vor = null; const t = (c, k) => window.dispatchEvent(new KeyboardEvent("keydown", ' +
        '{ bubbles: true, code: c, key: k })); const tick = () => { t("ShiftLeft", "Shift"); t("KeyW", "w"); ' +
        "const p = st.playerMesh.position; if (vor && Math.hypot(p.x - vor[0], p.z - vor[1]) < 1) st.yaw += 1.7; vor = [p.x, p.z]; }; tick(); " +
        "window.__pbiv = setInterval(tick, 1000); return 1;",
    sprintAus:
        'clearInterval(window.__pbiv); for (const [c, k] of [["KeyW", "w"], ["ShiftLeft", "Shift"]]) window.dispatchEvent(new KeyboardEvent("keyup", ' +
        "{ bubbles: true, code: c, key: k })); return 1;",
    torbau:
        "const st = r.state, rend = st.renderer, raf = () => new Promise((f) => requestAnimationFrame(f)), o = { bau: false, tor: false, heim: false }; " +
        "rend.setAnimationLoop((t) => r._gameLoopTick(t)); try { const p = st.playerMesh.position, x = p.x + 12; " +
        'const e = r.spawnArchitecture("haus_alemannisch", { x, y: r.getTerrainHeightAt(x, p.z) + 0.5, z: p.z }, { silent: true, precise: true }); ' +
        "await __gebautNach(e, { bau: () => {}, takt: raf }); o.bau = r._archIsRendered(e); " +
        'r.enterPortal({ type: "welt_portal", affordances: { isPortal: true } }); o.tor = !!r._portalOverlay; ' +
        "for (let i = 0; i < 60; i++) await raf(); r.exitPortal(); o.heim = !r._portalOverlay; " +
        "for (let i = 0; i < 30; i++) await raf(); r.removeArchitecture(e); } finally { rend.setAnimationLoop(null); } return o;",
    // DIE NACHT ÜBER DEN REGLER DES SPIELERS (w4-linsen-b): `setze uhrzeit` ist ein Welt-Akt der DSL (`set_time_of_day`), und unter dem
    // Halt der Mess-Bühne (`_messHalt`, jedes `umstellen` und `bild` der Sitzung stellt ihn) verweigert das Spiel jeden Welt-Akt, auch den
    // des Menschen — die Dauer hieß an 3ed95dcf (GTX, Radeon) „nie Nacht" bei Uhr 0,5005; der Regler der Einstellungen schreibt die Uhr
    // als Werkzeug des Spielers (`setTimeOfDay(t, "regler")`, `_himmelSchreiber`), nie als Welt-Akt
    nacht:
        "const st = r.state, rend = st.renderer, raf = () => new Promise((f) => requestAnimationFrame(f)), o = {}; " +
        "rend.setAnimationLoop((t) => r._gameLoopTick(t)); try { " +
        'r.setTimeOfDay(0, "regler"); for (let i = 0; i < 30; i++) await raf(); o.nacht = st.timeOfDay; ' +
        'r.setTimeOfDay(0.5, "regler"); for (let i = 0; i < 30; i++) await raf(); o.mittag = st.timeOfDay; ' +
        "} finally { rend.setAnimationLoop(null); } return o;",
    stand:
        "const n = {}; for (const c of r.state.creatures) { const u = c.userData; if (u && u._tierBaum) { const k = " +
        '"buf:szene:tier:" + (u.soul || "?"); n[k] = (n[k] | 0) + 1; } } return { halter: __heapHalter(r, 8), tiere: n };',
    raeumen: "let n = 0; for (const c of r.state.creatures.filter((c) => c.userData && c.userData.buehne)) (r.removeCreature(c), n++); return n;",
    k4geh:
        "const st = r.state; clearInterval(window.__k4iv); const z = (window.__k4 = { v: 0 }); " + PB_TASTE +
        'window.__k4iv = setInterval(() => { t("KeyV", "v"); z.v++; }, 750); setTimeout(() => clearInterval(window.__k4iv), 4000); return 1;',
    k4fahrt:
        'const st = r.state; clearInterval(window.__k4iv); const z = (window.__k4 = { wagen: "-", aus: "-", ein: "-" }); ' + PB_TASTE +
        "const bis = performance.now() + 20000; " +
        'const iv = setInterval(() => { if (st.player.mountedArch !== "werkbank-fahrt" && performance.now() < bis) return; clearInterval(iv); ' +
        'setTimeout(() => { z.wagen = st.player.mountedArch; t("KeyE", "e"); setTimeout(() => { z.aus = st.player.mountedArch; t("KeyE", "e"); ' +
        "setTimeout(() => { z.ein = st.player.mountedArch; }, 300); }, 1000); }, 1000); }, 50); return 1;",
};

// DIE PROBE (node im Spiel-Baum, in der Welt der Sitzung): art = gang | glaette | dauer, aus = {AUS}. Sie misst über die Werkbank der
// Sitzung (WERKBANK_PORT, nie ein eigener Boot), setzt die Zelle im Strom vor jedem Fenster, liest am Ende den Strom (punkte.cjs
// `stromLesen`) und druckt EINE Zeile „PROFIBAND {…}“ — die Richter urteilen nur sie. K = PB_KONST, SEITE = PB_SEITE.
async function pbProbe(art, aus) {
    const fs = require("fs"), path = require("path");
    const WP = Number(process.env.WERKBANK_PORT), STROM = process.env.PUNKTE_SITZUNG_STROM, PROBE = process.env.PUNKTE_PROBE;
    if (!WP || !STROM || !PROBE || !process.env.PUNKTE_MASCHINE) throw new Error("ohne Sitzung: WERKBANK_PORT, PUNKTE_SITZUNG_STROM, PUNKTE_PROBE oder PUNKTE_MASCHINE fehlt");
    const M = require(process.env.PUNKTE_MASCHINE);
    const D = aus.replace(/\.json$/, "") + "-werk";
    fs.rmSync(D, { recursive: true, force: true });
    fs.mkdirSync(D, { recursive: true });
    const t0 = Date.now(), uhr = () => (Date.now() - t0) / 1000;
    const logDatei = process.env.PUNKTE_SITZUNG_LOG;
    const log = logDatei && fs.existsSync(logDatei) ? fs.readFileSync(logDatei, "utf8") : "";
    console.log((/\[linse-gpu\][^\r\n]*/.exec(log) || ["[linse-gpu] ungenannt (kein Log der Sitzung)"])[0]);
    const q = (x) => x || {};
    const ruf = async (weg, b, s) => {
        const o = await M.rufFrist(WP, weg, b, s * 1000);
        if (o && typeof o.fehler === "string") throw new Error(weg + ": " + o.fehler.slice(0, 240));
        return o;
    };
    const ev = async (code) => (await ruf("/eval", { code }, 60)).ergebnis;
    const zelle = async (name) => {
        const z = await M.stromZapfen(WP, STROM, PROBE, { zelle: name });
        if (!z.ok) throw new Error("der Strom zapft nicht: " + z.grund);
    };
    const U = (ort, sicht) => ruf("/umstellen", { ort, sicht }, 240);
    const fenster = {}, baender = {}, glaette = {}, fehler = {}, offen = [], schritte = [];
    // EIN Fenster einer Zelle: die Zelle im Strom, `lauf` (seine Spur nennt die Belegung), danach die Probe der Seite
    const Z = async (name, k) => {
        await zelle(name);
        let o;
        try {
            o = await ruf("/lauf", { sek: k.sek, ein: k.ein, ruhe: 0, regler: "voll", tiere: k.tiere || "frei", wetter: k.wetter, wandern: k.wandern }, k.sek + k.ein + 90);
        } finally {
            await zelle(null);
        }
        const b = q(o.belegung);
        fenster[name] = { ein: k.ein, sek: o.sekunden, regler: o.regler, belegung: q(b.belegungMs).p95, pflicht: q(b.pflichtMs).p95, wache: q(o.wetterHalt).urteil,
            wetter: o.wetter, weg: o.bahnM, buehne: o.buehnenTiere, last: q(o.stellgroessen).loadScale, skala: q(o.stellgroessen).szeneSkala, probe: await ev(SEITE.probe) };
    };
    // EIN Band am gestellten Ort (Haushalt, Ratsche, VRAM nach dem Collector, gpu-bank; eine Probe statt sechs, bis 29.10.)
    const B = async (ort, sicht) => {
        const name = ort + "-" + sicht, datei = path.join(D, "band-" + name + ".json");
        const o = await ruf("/band", { ort, datei, proben: 1, capMs: 8000 }, 180);
        const u = JSON.parse(fs.readFileSync(datei, "utf8")), g = {}, m = q(u.messung);
        for (const x of u.groessen || []) g[x.name] = x.ist;
        baender[name] = { exit: o.urteil === "GRUEN" && (!o.stempel || o.stempel.urteil === "GRUEN") ? 0 : 1, urteil: u.urteil, befehle: g.Befehle, dreiecke: g.Dreiecke,
            vram: g["VRAM MB"], gpu: q(u.gpu).gpuJeFrameMs, stempel: u.stempel ? u.stempel.urteil : null, eingeschwungen: m.eingeschwungen,
            last: q(m.stand).loadScale, amMessort: u.amMessort, gestellt: u.ortGestellt, geraet: q(u.geraet).schluessel,
            rot: (u.rot || []).slice(0, 3).map((x) => x.text), probe: await ev(SEITE.probe) };
    };
    // EIN Fenster der Glätte: die Übergänge über die Tasten, `haenger` unter dem Regler des Spielers (R8), Schwelle 33 ms
    const H = async (name, code, k) => {
        await ev(code);
        await zelle(name);
        let o;
        try {
            o = await ruf("/haenger", { sek: k.sek, ein: k.ein, regler: "frei", tiere: "frei", wandern: k.wandern, schwelle: 33, json: path.join(D, name + ".json") }, k.sek + k.ein + 90);
        } finally {
            await zelle(null);
        }
        glaette[name] = { ein: k.ein, sek: k.sek, befunde: (o.befunde || []).slice(0, 4), tasten: await ev("return window.__k4 || null") };
    };
    // DER STAND (die Puffer-Linse nach dem Collector, dazu Halter und Tiere) als Marke im Strom
    const stand = async (marke) => {
        await zelle(null);
        const p = await ruf("/puffer", { top: 400 }, 120);
        const t = await ev(SEITE.stand);
        const w = { zeit: Date.now(), heapMB: p.heapMB, vram: p.vram, puffer: p.puffer, halter: t.halter, tiere: t.tiere };
        M.stromMarke(STROM, PROBE, marke, w);
        return w;
    };
    // ein Schritt unter der Uhr: trägt die Uhr ihn nicht mehr, stehen seine Zellen ungemessen beim Namen
    const schritt = async (name, est, f, zellen) => {
        if (art === "gang" && uhr() + est > K.budget) return void (offen.push(...zellen), schritte.push([name, "Uhr"]));
        const a = uhr();
        try {
            await f();
            schritte.push([name, +(uhr() - a).toFixed(1)]);
        } catch (e) {
            for (const z of zellen) fehler[z] = String((e && e.message) || e).split("\n")[0].slice(0, 200);
            schritte.push([name, "Fehler"]);
        }
    };
    const S = K.steht, G = K.geht;
    const sonst = {};
    if (art === "glaette") {
        await schritt("anfang", 6, async () => {
            await U("genesis", "ego");
            sonst.anfang = !!(await stand("dauer-anfang"));
            await Z("dauer-genesis-ego-geht", { ...K.anker, wandern: "bahn" });
        }, ["dauer-anfang"]);
        await schritt("k4-geh", 5, () => H("k4-geh", SEITE.k4geh, { ...K.glaette, wandern: "bahn" }), ["k4-geh"]);
        await schritt("k4-fahrt", 6, async () => {
            await U("genesis", "ego");
            await H("k4-fahrt", SEITE.k4fahrt, { ...K.glaette, wandern: "fahrt" });
        }, ["k4-fahrt"]);
    } else if (art === "dauer") {
        await schritt("ende", 14, async () => {
            await U("genesis", "ego");
            sonst.torbau = await ev(SEITE.torbau);
            sonst.nacht = await ev(SEITE.nacht);
            await U("genesis", "ego");
            await Z("dauer-genesis-ego-geht", { ...K.anker, wandern: "bahn" });
            await stand("dauer-ende");
        }, ["dauer-ende"]);
    } else {
        await schritt("genesis-ego", 7, async () => {
            await U("genesis", "ego");
            await B("genesis", "ego");
            await Z("genesis-ego-steht", S);
        }, ["band:genesis-ego", "genesis-ego-steht"]);
        await schritt("genesis-third", 11, async () => {
            await U("genesis", "third");
            await B("genesis", "third");
            await Z("genesis-third-steht", S);
            await Z("genesis-third-geht", { ...G, wandern: "bahn" });
        }, ["band:genesis-third", "genesis-third-steht", "genesis-third-geht"]);
        await schritt("wiese-ego", 15, async () => {
            await U("wiese", "ego");
            await B("wiese", "ego");
            await Z("wiese-ego-steht", S);
            await Z("wiese-ego-geht", { ...G, wandern: "bahn" });
        }, ["band:wiese-ego", "wiese-ego-steht", "wiese-ego-geht"]);
        await schritt("wiese-third", 8, async () => {
            await U("wiese", "third");
            await B("wiese", "third");
            await Z("wiese-third-steht", S);
        }, ["band:wiese-third", "wiese-third-steht"]);
        await schritt("wiese-sprint", 4, async () => {
            await U("wiese", "ego");
            await ev(SEITE.sprint);
            try {
                await Z("wiese-ego-sprint", G);
            } finally {
                await ev(SEITE.sprintAus);
            }
        }, ["wiese-ego-sprint"]);
        await schritt("wiese-fahrt", 5, async () => {
            await U("wiese", "ego");
            await Z("wiese-fahrt", { ...G, wandern: "fahrt" });
        }, ["wiese-fahrt"]);
        await schritt("wiese-sturm", 6, async () => {
            await U("wiese", "ego");
            try {
                await Z("wiese-ego-sturm", { ...G, tiere: "50", wetter: "stormy", wandern: "bahn" });
            } finally {
                sonst.geraeumt = await ev(SEITE.raeumen);
            }
        }, ["wiese-ego-sturm"]);
        await schritt("dorf", 20, async () => {
            await U("dorf", "ego");
            await B("dorf", "ego");
            await U("dorf", "third");
            await B("dorf", "third");
        }, ["band:dorf-ego", "band:dorf-third"]);
        await schritt("stadt", 20, async () => {
            await U("stadt", "ego");
            await Z("stadt-ego-geht", { ...G, wandern: "bahn" });
        }, ["stadt-ego-geht"]);
    }
    // ── DER STROM: alle Bilder der Sitzung bis hierher ──
    await zelle(null);
    const L = M.stromLesen(STROM);
    const B_ = L.bilder;
    const quant = (a, p = 0.95) => {
        const s = a.filter(Number.isFinite).sort((x, y) => x - y);
        return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(2) : null;
    };
    // die Läufe einer Zelle: zusammenhängende Bilder mit ihrem Namen in einer Seite, je ohne die ersten `ein` Sekunden
    const laeufe = (name, ein) => {
        const r = [];
        let cur = null;
        B_.forEach((b, i) => {
            if (b.zelle !== name) return;
            if (!cur || cur.seite !== b.seite || cur.ende !== i) r.push((cur = { seite: b.seite, t0: b.t, start: i, bilder: [], ende: i }));
            cur.ende = i + 1;
            if (b.t - cur.t0 >= ein * 1000) cur.bilder.push(b);
        });
        return r;
    };
    const zahlen = (bs) => {
        const d = bs.filter((b) => b.dt >= 0), g = bs.filter((b) => b.gpu >= 0 && b.stempelOk), dt = d.map((b) => b.dt);
        const wechsel = (k) => bs.slice(1).reduce((s, b, i) => s + (b[k] !== bs[i][k] ? 1 : 0), 0);
        return { n: d.length, frame: quant(dt), p99: quant(dt, 0.99), max: quant(dt, 1), ueber33: d.filter((b) => b.dt > 33.4).length, ueber100: d.filter((b) => b.dt > 100).length,
            takt: quant(d.map((b) => b.takt)), vram: quant(bs.map((b) => b.vram)), gpu: quant(g.map((b) => b.gpu)), gpuN: g.length,
            befehle: quant(d.map((b) => b.befehle)), dreiecke: quant(d.map((b) => b.dreiecke)), voll: bs.length ? +(bs.filter((b) => b.voll === 1).length / bs.length).toFixed(3) : null,
            halt: bs.some((b) => b.halt === 1), last: bs.length ? bs.reduce((m, b) => Math.min(m, b.last), Infinity) : null, sicht: [...new Set(bs.map((b) => b.sicht))].sort(),
            sichtWechsel: wechsel("sicht"), sattel: bs.map((b) => b.sattel).filter((x, i, a) => !i || x !== a[i - 1]).join(""),
            wetter: [...new Set(bs.map((b) => b.wetter))], buehne: bs.length ? bs.reduce((m, b) => Math.max(m, b.buehne || 0), 0) : null };
    };
    const zus = { art, sekunden: +uhr().toFixed(1), schritte, offen, fehler, strom: { bloecke: L.bloecke, bilder: B_.length, seiten: L.seiten.length, fehler: L.fehler, verloren: L.verloren } };
    if (art === "gang") {
        const orte = Object.fromEntries(JSON.parse(fs.readFileSync("spec/profiband/haushalt.json", "utf8")).messorte.map((o) => [o.id, o.spieler]));
        // fremde Bilder einer Stand-Zelle: jede andere Probe, die dort stand (die Bedingungen der Zelle)
        const fremd = (name) => {
            const [ort, sicht] = name.split("-"), p = orte[ort], s = sicht === "ego" ? 1 : 2;
            return B_.filter((b, i) => {
                if (b.zelle != null || b.probe === PROBE || !(b.dt > 0) || b.sicht !== s || b.voll !== 1 || b.halt !== 0 || b.sattel !== 0 || b.wetter !== "sunny") return false;
                if (!p || Math.hypot(b.x - p[0], b.z - p[1]) > K.ortM) return false;
                const v = B_[i - 1];
                return !!v && v.seite === b.seite && (Math.hypot(b.x - v.x, b.z - v.z) / b.dt) * 1000 <= 0.5;
            });
        };
        zus.zellen = {};
        for (const name of [...PB_ZELLEN]) {
            const f = fenster[name], eigen = f ? laeufe(name, f.ein).flatMap((l) => l.bilder) : [], fr = /-steht$/.test(name) ? fremd(name) : [];
            if (!f && !fr.length) continue;
            zus.zellen[name] = { ...zahlen([...eigen, ...fr]), eigen: eigen.filter((b) => b.dt >= 0).length, fremd: fr.length, fenster: f || null };
        }
        zus.baender = baender;
        zus.sonst = sonst;
    } else if (art === "glaette") {
        zus.glaette = {};
        for (const name of ["k4-geh", "k4-fahrt"]) {
            const g = glaette[name];
            if (!g) continue;
            const ls = laeufe(name, g.ein);
            zus.glaette[name] = { ...zahlen(ls.flatMap((l) => l.bilder)), laeufe: ls.length, sek: g.sek, befunde: g.befunde, tasten: g.tasten };
        }
        zus.anfang = sonst.anfang === true;
    } else {
        const a = L.marken.filter((m) => m.marke === "dauer-anfang").pop(), e = L.marken.filter((m) => m.marke === "dauer-ende").pop();
        zus.dauer = { anfang: !!a, ende: !!e, torbau: sonst.torbau || null, nacht: sonst.nacht || null };
        if (a && e && e.bild >= a.bild) {
            const strecke = B_.slice(a.bild, e.bild), seiten = [...new Set(strecke.map((b) => b.seite))];
            let weg = 0, gegangen = 0;
            for (let i = 1; i < strecke.length; i++) {
                const b = strecke[i], v = strecke[i - 1];
                if (b.seite !== v.seite) continue;
                const d = Math.hypot(b.x - v.x, b.z - v.z);
                weg += d;
                if (b.dt > 0 && (d / b.dt) * 1000 < 60) gegangen += d;
            }
            // die Anker der Dauer: der erste (die Glätte, nach dem Stand des Anfangs) und der letzte (diese Probe, vor dem des Endes)
            const anker = laeufe("dauer-genesis-ego-geht", K.anker.ein).filter((l) => l.start >= a.bild && l.ende <= e.bild);
            const erster = anker[0], letzter = anker[anker.length - 1];
            let gang = null;
            try {
                const { gangUrteil } = require(path.resolve("scripts/lib/draw-zaehler.cjs"));
                const min = +((e.wert.zeit - a.wert.zeit) / 60000).toFixed(2);
                const s = (w, m) => ({ min: m, heapMB: w.heapMB, halter: w.halter || [], vram: w.vram, puffer: w.puffer, tiere: w.tiere || {} });
                gang = gangUrteil({ vor: s(a.wert, 0), nach: s(e.wert, min) });
            } catch (x) {
                gang = ["gangUrteil warf: " + String((x && x.message) || x).slice(0, 160)];
            }
            Object.assign(zus.dauer, {
                minuten: +((e.wert.zeit - a.wert.zeit) / 60000).toFixed(2), seiten: seiten.length, proben: [...new Set(strecke.map((b) => b.probe))].length,
                last: zahlen(strecke), weg: Math.round(weg), gegangen: Math.round(gegangen), fahren: strecke.some((b) => b.sattel === 1),
                nachtImStrom: strecke.some((b) => b.uhr != null && (b.uhr < 0.05 || b.uhr > 0.95)),
                anker: anker.length >= 2 ? { a: zahlen(erster.bilder), b: zahlen(letzter.bilder), laeufe: anker.length } : { laeufe: anker.length },
                gang, heap: [a.wert.heapMB, e.wert.heapMB], vramGC: [q(a.wert.vram).mb, q(e.wert.vram).mb],
            });
        }
    }
    fs.writeFileSync(aus, JSON.stringify(zus, null, 1));
    console.log("PROFIBAND " + JSON.stringify(zus));
}
const PB_ZELLEN = [...PB_STEHT, ...PB_BEWEGT];

// ── DIE RICHTER (die Zeile „PROFIBAND {…}“ der Probe) ──
const pbZus = (lauf, art) => {
    const m = /^PROFIBAND (\{.*\})$/m.exec(String((lauf && lauf.stdout) || ""));
    let z = null;
    try {
        z = m ? JSON.parse(m[1]) : null;
    } catch (_e) {
        z = null;
    }
    return z && z.art === art ? z : null;
};
// Was eine Zelle ungültig macht — die Schlupflöcher der Soll-Tafel beim Namen: das Fenster brach, blind (< 10 Bilder je s), Regler
// nicht voll oder gedrosselt, Skala unter 0,75, Tiere gehalten, das Wetter gedreht, die Sicht und der Weg der Zelle (steht ≤ 2 m · geht
// ≥ 3 m/s · Sprint schneller als Gehen und ≥ halbes Sprint-Tempo · Fahrt ≥ 15 m/s · Sturm im Sturm mit 50 Tieren der Bühne); eine
// Stand-Zelle ohne Fenster gilt mit ≥ PB_KONST.fremdN fremden Bildern (die Bedingungen trägt ihr Filter)
function pbFehl(name, z) {
    const f = [], w = z.fenster, sicht = /-ego-/.test(name) ? 1 : /-third-/.test(name) ? 2 : null;
    if (!w) {
        if (!(z.fremd >= PB_KONST.fremdN)) f.push(z.fremd + " fremde Bilder ohne eigenes Fenster");
        return f;
    }
    const p = w.probe || {}, sek = w.sek || 0, weg = Number.isFinite(w.weg) ? w.weg : NaN;
    if (!(sek > 0 && z.eigen >= PB_KONST.bilderJeS * sek)) f.push(z.eigen + " Bilder in " + sek + " s");
    if (w.regler !== "voll" || !(z.voll >= 0.99)) f.push("Regler " + w.regler + " (voll " + z.voll + ")");
    if (!(w.last >= 0.95) || !(z.last >= 0.95)) f.push("gedrosselt (loadScale " + w.last + "/" + z.last + ")");
    if (!(w.skala >= 0.75)) f.push("Skala " + w.skala + " < 0,75");
    if (p.gehalten !== false || z.halt) f.push("Tiere angehalten");
    if (w.wache === "ROT") f.push("Wetter gedreht");
    if (/-steht$/.test(name) && !(weg <= 2)) f.push("Weg " + weg + " m im Stand");
    if (/-(geht|sturm)$/.test(name) && !(weg >= 3 * sek)) f.push("Weg " + weg + " m in " + sek + " s");
    if (/-sprint$/.test(name) && !(p.sprint > p.speed && weg > p.speed * sek && weg >= 0.5 * p.sprint * sek))
        f.push("Sprint-Weg " + weg + " m in " + sek + " s (Gehen " + p.speed + " · Sprint " + p.sprint + " m/s)");
    if (/-fahrt$/.test(name) && !(weg >= 15 * sek)) f.push("Fahrt-Weg " + weg + " m in " + sek + " s");
    if (/-sturm$/.test(name) && !(w.wetter === "stormy" && w.buehne >= 50)) f.push("Sturm: " + w.wetter + " mit " + w.buehne + " Tieren der Bühne");
    if (sicht && !(z.sicht.length === 1 && z.sicht[0] === sicht)) f.push("Sicht " + z.sicht.join("/"));
    return f;
}
// DER RICHTER des Gangs: je Regel { zellen, wort, soll, feld } die Zahl jeder Zelle gegen das Soll, jede Zelle gültig; `band`: jedes
// Band je Ort × Sicht (Haushalt, Ratsche, Befehle, Dreiecke, VRAM: sein Urteil), gpu-bank ≤ 12 ms, eingeschwungen, ungedrosselt, am
// Messort, Skala, Tiere und Sicht. Eine Zelle, die die Uhr nicht trug oder deren Schritt brach, ist ROT beim Namen.
function pbRichter(lauf, { regeln = [], band = false }) {
    const t = String(lauf.stdout || "");
    const { ad, hw } = HW(t);
    const z = pbZus(lauf, "gang");
    if (!z) return { gruen: false, zahl: "keine Zeile PROFIBAND des Gangs (Exit " + lauf.exit + ") · " + ad };
    const warum = (n) => (z.offen.includes(n) ? "ungemessen (die Uhr " + PB_KONST.budget + " s trug den Schritt nicht)" : z.fehler[n] ? "brach: " + z.fehler[n] : "ungemessen");
    const rot = [], teile = [];
    for (const r of regeln) {
        const werte = r.zellen.map((name) => {
            const c = z.zellen[name];
            if (!c) return rot.push(name + ": " + warum(name)), name + " ?";
            const f = pbFehl(name, c);
            if (f.length) rot.push(name + ": " + f.join(", "));
            const v = r.feld(c);
            if (!(Number.isFinite(v) && v <= r.soll)) rot.push(name + " " + r.wort + " " + (Number.isFinite(v) ? v + " > " + r.soll : "ungemessen" + (z.fehler[name] ? " (" + z.fehler[name] + ")" : "")));
            return name + " " + v;
        });
        teile.push(r.wort + " ≤ " + r.soll + ": " + werte.join(" · "));
    }
    if (band) {
        const werte = PB_BAND.map((name) => {
            const b = z.baender[name], p = (b && b.probe) || {}, f = [];
            if (!b) f.push(warum("band:" + name));
            else {
                if (b.exit !== 0 || b.urteil !== "GRUEN") f.push("Band " + b.urteil + " " + (b.rot || []).join(" · ").slice(0, 160));
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
    return { gruen: rot.length === 0, zahl: teile.join(" ‖ ") + " · Gang " + z.sekunden + " s · " + ad + (rot.length ? " — ROT " + rot.length + ": " + rot.slice(0, 6).join(" | ") : "") };
}
// DER RICHTER DER GLÄTTE (K4): je Fenster (Gehen mit V, Fahrt mit E aus und ein; Regler des Spielers) aus dem Strom: gültig mit
// ≥ 10 Bildern je s und JEDEM Bild unter dem Regler des Spielers; Staffel 1 = eine Bewegungsart ohne Bild > 100 ms (bis 29.10. „in
// ≥ 3 von 4 Sitzungen“ — die Sitzung ist EINE, jedes Bild zählt); Staffel 2 = beide ohne Bild > 100 ms, ≤ 1 % über 33 ms, im Gehen
// ≥ 2 Sicht-Wechsel durch beide Sichten, in der Fahrt aus- und wieder eingestiegen (der Sattel im Strom 1 → 0 → 1)
function k4Richter(lauf, staffel) {
    const t = String(lauf.stdout || "");
    const { ad, hw } = HW(t);
    const z = pbZus(lauf, "glaette");
    if (!z) return { gruen: false, zahl: "keine Zeile PROFIBAND der Glätte (Exit " + lauf.exit + ") · " + ad };
    const art = { "k4-geh": "Gehen", "k4-fahrt": "Fahrt" }, ok = {}, rot = [], teile = [];
    for (const name of ["k4-geh", "k4-fahrt"]) {
        const g = z.glaette[name], f = [];
        if (!g) f.push(z.fehler[name] ? "brach: " + z.fehler[name] : "ungemessen");
        else {
            if (!(g.n >= PB_KONST.bilderJeS * g.sek)) f.push("blind (" + g.n + " Bilder in " + g.sek + " s)");
            if (g.voll !== 0) f.push("Regler voll in " + Math.round(100 * g.voll) + " % der Bilder (R8: der des Spielers)");
        }
        const hundert = !!g && !f.length && g.ueber100 === 0;
        const anteil = g && g.n ? g.ueber33 / g.n : 1;
        const u = [];
        if (g && !(g.ueber100 === 0)) u.push(g.ueber100 + " Bild(er) > 100 ms (max " + g.max + ")");
        if (g && !(anteil <= 0.01)) u.push((100 * anteil).toFixed(2) + " % > 33 ms");
        if (g && name === "k4-geh" && !(g.sichtWechsel >= 2 && g.sicht.includes(1) && g.sicht.includes(2))) u.push("kein Sicht-Wechsel (" + g.sichtWechsel + ")");
        if (g && name === "k4-fahrt" && !/10+1/.test(g.sattel)) u.push("nicht aus- und eingestiegen (Sattel " + g.sattel + ")");
        ok[name] = { gilt: !f.length, hundert, voll: !f.length && !u.length };
        if (f.length || u.length) rot.push(art[name] + ": " + [...f, ...u].join(", ") + (g && g.befunde && g.befunde.length ? " — Täter " + g.befunde.join(" · ").slice(0, 200) : ""));
        teile.push(art[name] + (g ? " " + g.n + " Bilder · max " + g.max + " ms · " + (100 * anteil).toFixed(2) + " % > 33 ms" : " ?"));
    }
    if (!hw) rot.push("Adapter: " + ad);
    const gruen = hw && (staffel === 1 ? ok["k4-geh"].hundert || ok["k4-fahrt"].hundert : ok["k4-geh"].voll && ok["k4-fahrt"].voll);
    return { gruen, zahl: teile.join(" · ") + " (Regler des Spielers, " + PB_KONST.glaette.sek + " s je Fenster) · " + ad + (rot.length ? " — " + (gruen ? "daneben" : "ROT") + ": " + rot.join(" | ") : "") };
}
// DER RICHTER DER DAUER (K5): der Strom zwischen dem Stand des Anfangs (die Glätte, stellung anfang) und dem des Endes (diese Probe,
// stellung ende) in EINER Seite (kein Neuladen) und ≥ PB_KONST.dauerMin min am Stück; das Anker-Fenster (Genesis Ego gehend, Regler
// voll) am Ende ≤ am Anfang × 1,05 (Bild-p95, bis 29.10. die ersten und letzten 5 min); `gangUrteil` (die EINE Quelle von `puffer
// --gang`: Heap ≤ 5 MB/min, VRAM ≤ 2 MB zurück am Start ohne den Bestand der Tiere, buf:ruhend und buf:verwaist 0); Weg ≥ 5 km durch
// die Welt (jeder Ort, an den eine Probe den Spieler stellte, gestreamt), gefahren, Nacht, gebaut, durch das Tor und heim; der
// Aufnehmer ohne Wurf und ohne Verlust. Die Dauerlast (Bild-p95, Takt-p95, VRAM-p95 über jedes Bild der Strecke) steht beim Namen.
function k5Richter(lauf) {
    const t = String(lauf.stdout || "");
    const { ad, hw } = HW(t);
    const z = pbZus(lauf, "dauer");
    if (!z) return { gruen: false, zahl: "keine Zeile PROFIBAND der Dauer (Exit " + lauf.exit + ") · " + ad };
    const d = z.dauer || {}, rot = [];
    if (!d.anfang) rot.push("kein Stand des Anfangs (die Glätte fuhr nicht vor der Dauer)");
    if (!d.ende) rot.push("kein Stand des Endes" + (z.fehler["dauer-ende"] ? " (brach: " + z.fehler["dauer-ende"] + ")" : ""));
    if (d.anfang && d.ende && d.minuten == null) rot.push("das Ende liegt vor dem Anfang");
    if (d.minuten != null) {
        if (d.seiten !== 1) rot.push(d.seiten + " Seiten zwischen Anfang und Ende (neu geladen — nie am Stück)");
        if (!(d.minuten >= PB_KONST.dauerMin)) rot.push(d.minuten + " min am Stück < " + PB_KONST.dauerMin);
        const a = (d.anker || {}).a, b = (d.anker || {}).b;
        if (!a || !b) rot.push("Anker " + ((d.anker || {}).laeufe || 0) + " von 2 Fenstern");
        else {
            const min = PB_KONST.bilderJeS * PB_KONST.anker.sek * 0.8;
            if (!(a.n >= min && b.n >= min)) rot.push("Anker blind (" + a.n + "/" + b.n + " Bilder)");
            if (!(a.voll >= 0.99 && b.voll >= 0.99)) rot.push("Anker nicht unter Regler voll");
            if (!(b.frame <= a.frame * 1.05)) rot.push("Drift: Bild-p95 am Ende " + b.frame + " > " + a.frame + " × 1,05");
        }
        if (!(Array.isArray(d.gang) && d.gang.length === 0)) rot.push("Gang: " + (d.gang || ["kein Urteil"]).join(" · "));
        if (!(d.weg >= 5000)) rot.push("Weg " + d.weg + " m < 5 km");
        if (!d.fahren) rot.push("nie gefahren");
        if (!(d.nachtImStrom || (d.nacht && (d.nacht.nacht < 0.05 || d.nacht.nacht > 0.95)))) rot.push("nie Nacht");
        const tb = d.torbau || {};
        if (!(tb.bau === true && tb.tor === true && tb.heim === true)) rot.push("Bau/Tor/heim " + tb.bau + "/" + tb.tor + "/" + tb.heim);
    }
    if (z.strom.fehler || z.strom.verloren) rot.push("der Aufnehmer warf " + z.strom.fehler + " · verlor " + z.strom.verloren + " Bilder");
    if (!hw) rot.push("Adapter: " + ad);
    const l = d.last || {}, an = d.anker || {};
    const paar = (x, y) => (x == null ? "?" : x) + " → " + (y == null ? "?" : y);
    // OHNE STRECKE (w4-linsen-b): fehlt eine Marke, gibt es keine Dauer — die Zahl nennt, was der Strom trug, nie „undefined min in
    // undefined Seite(n)" (3ed95dcf GTX: die Glätte fuhr in der Eich-Fahrt davor, die Dauer allein in ihrer eigenen Sitzung)
    if (d.minuten == null)
        return {
            gruen: false,
            zahl: "keine Dauer: Strom der Sitzung " + z.strom.bilder + " Bilder in " + z.strom.seiten + " Seite(n), Marke des Anfangs " + (d.anfang ? "da" : "fehlt") +
                ", des Endes " + (d.ende ? "da" : "fehlt") + " · " + ad + " — ROT " + rot.length + ": " + rot.slice(0, 6).join(" | "),
        };
    return {
        gruen: rot.length === 0,
        zahl:
            "Dauer " + d.minuten + " min in " + d.seiten + " Seite(n), " + d.proben + " Proben: Dauerlast " + l.n + " Bilder · Bild-p95 " + l.frame + " (p99 " + l.p99 +
            ", max " + l.max + ") ms · Takt-p95 " + l.takt + " ms · VRAM-p95 " + l.vram + " MB · Anker Bild-p95 " + paar(an.a && an.a.frame, an.b && an.b.frame) +
            " ms · Heap " + paar(...(d.heap || [])) + " MB · VRAM nach GC " + paar(...(d.vramGC || [])) + " MB · Weg " + ((d.weg || 0) / 1000).toFixed(1) + " km (gegangen/gefahren " +
            ((d.gegangen || 0) / 1000).toFixed(1) + ") · " + ad + (rot.length ? " — ROT " + rot.length + ": " + rot.slice(0, 6).join(" | ") : ""),
    };
}
// Der Richter steht außerhalb der Urteile: sein Abdruck reist im Befehl mit (`/* richter <sha1> */`) — wer ihn, die Zellen oder die
// Konstanten ändert, macht die Messungen alt, wie es die Änderung eines Urteils täte (ohne CR: ein Windows-Klon hasht dasselbe)
const PB_MARKE = require("crypto")
    .createHash("sha1")
    .update([pbZus, pbFehl, pbRichter, k4Richter, k5Richter, HW, PB_STEHT, PB_BEWEGT, PB_BAND, JSON.stringify(PB_KONST)].join("|").replace(/\r/g, ""))
    .digest("hex")
    .slice(0, 10);
// DER BEFEHL einer Probe: das Programm samt Konstanten und Seiten-Code im Befehl (der Abdruck liest es ganz), die Art als Wort
const pbBefehl = (art) => [
    "node",
    "-e",
    "/* richter " + PB_MARKE + " */ const K = " + JSON.stringify(PB_KONST) + "; const SEITE = " + JSON.stringify(PB_SEITE) + "; const PB_ZELLEN = " +
        JSON.stringify(PB_ZELLEN) + "; (" + pbProbe.toString().replace(/\r/g, "") + ")(process.argv[1], process.argv[2]).catch((e) => { console.log(\"PROBE ROT: \" + " +
        "String((e && e.stack) || e).split(\"\\n\").slice(0, 3).join(\" | \")); process.exitCode = 1; });",
    art,
    "{AUS}",
];
const PB_AUSNAHME_GANG =
    "sechs Stationen (K1–K3 je #1 #2) lesen EINE Probe: je Zelle ein Fenster mit Spur (die Belegung trägt nie der Strom) und je Ort × " +
    "Sicht ein Band (Ratsche + gpu-bank) an vier Orten, unter der Uhr " + PB_KONST.budget + " s (bis 29.10. 6 × 80 min in eigenen Boots)";

// DIE PROBEN (punkte.cjs selbsttest): die Zeile PROFIBAND, wie die Probe sie druckt, mit Zahlen im Band; je Mutante die Stationen,
// die GRÜN bleiben
function pbRoh({ zelle = () => {}, band = () => {}, adapter = "[linse-gpu] nvidia/pascal (Probe)", ohne = [], offen = [] } = {}) {
    const probe = (sicht) => ({ gehalten: false, sicht, speed: 4.5, sprint: 7.2, skala: 0.75 });
    const zellen = {};
    for (const name of PB_ZELLEN.filter((x) => !ohne.includes(x))) {
        const steht = PB_STEHT.includes(name), sicht = /-third-/.test(name) ? "third" : "first";
        const w = { ein: steht ? 0.3 : 0.5, sek: 2, regler: "voll", belegung: steht ? 5.2 : 7.3, pflicht: 0.4, wache: "GRUEN", wetter: /sturm/.test(name) ? "stormy" : "sunny",
            weg: steht ? 0 : /fahrt/.test(name) ? 40 : /sprint/.test(name) ? 14 : 8, buehne: /sturm/.test(name) ? 50 : 0, last: 1, skala: 0.75, probe: probe(sicht) };
        const c = { n: 140, frame: 16.7, p99: 17.4, max: 33.4, ueber33: 0, ueber100: 0, takt: steht ? 3.1 : 4.6, vram: 109.6, gpu: 10.4, gpuN: 30, befehle: 158,
            dreiecke: 512000, voll: 1, halt: false, last: 1, sicht: [sicht === "first" ? 1 : 2], sichtWechsel: 0, sattel: /fahrt/.test(name) ? "1" : "0",
            wetter: [w.wetter], buehne: w.buehne, eigen: 118, fremd: steht ? 22 : 0, fenster: w };
        zelle(name, c, w);
        zellen[name] = c;
    }
    const baender = {};
    for (const name of PB_BAND.filter((x) => !ohne.includes("band:" + x))) {
        const s = { exit: 0, urteil: "GRUEN", befehle: 151, dreiecke: 548000, vram: 111.2, gpu: 10.9, stempel: "GRUEN", eingeschwungen: true, last: 1,
            amMessort: true, gestellt: [], geraet: "gtx", rot: [], probe: probe(/-ego$/.test(name) ? "first" : "third") };
        band(name, s);
        baender[name] = s;
    }
    const zus = { art: "gang", sekunden: 55.2, schritte: [], offen, fehler: {}, strom: { bloecke: 900, bilder: 52000, seiten: 3, fehler: 0, verloren: 0 }, zellen, baender, sonst: {} };
    return adapter + "\nPROFIBAND " + JSON.stringify(zus);
}
const PB_MUTANTEN = [
    ["Roh (die Zeile des Gangs, Zahlen im Band)", {}, "K1#1 K1#2 K2#1 K2#2 K3#1 K3#2"],
    ["Mutante Regler herunter (frei und gedrosselt, das Band gedrosselt)",
        { zelle: (n, c, w) => (Object.assign(w, { regler: "frei", last: 0.62 }), (c.voll = 0)), band: (b, s) => (s.last = 0.62) }, ""],
    ["Mutante Tiere angehalten (in den Fenstern, im Band)", { zelle: (n, c, w) => (w.probe.gehalten = true), band: (b, s) => (s.probe.gehalten = true) }, ""],
    ["Mutante Skala unter 0,75", { zelle: (n, c, w) => ((w.skala = 0.5), (w.probe.skala = 0.5)), band: (b, s) => (s.probe.skala = 0.5) }, ""],
    ["Mutante Stand statt Weg (der Sprint steht)", { zelle: (n, c, w) => n === "wiese-ego-sprint" && (w.weg = 2) }, "K2#1 K3#1"],
    ["Mutante Fahrt Bild-p95 34 ms", { zelle: (n, c) => n === "wiese-fahrt" && (c.frame = 34) }, "K2#1 K2#2 K3#1 K3#2"],
    ["Mutante bewegt Bild-p95 25 ms", { zelle: (n, c) => PB_BEWEGT.includes(n) && (c.frame = 25) }, "K1#1 K2#1 K2#2 K3#1 K3#2"],
    ["Mutante Genesis Third steht Belegung 6,3 ms", { zelle: (n, c, w) => n === "genesis-third-steht" && (w.belegung = 6.3) }, "K1#1 K1#2 K3#1 K3#2"],
    ["Mutante bewegt Belegung 8,6 ms", { zelle: (n, c, w) => PB_BEWEGT.includes(n) && (w.belegung = 8.6) }, "K1#1 K1#2 K2#1 K3#1 K3#2"],
    ["Mutante VRAM in der Fahrt 118,8 MB", { zelle: (n, c) => n === "wiese-fahrt" && (c.vram = 118.8) }, "K1#1 K1#2 K2#1 K2#2 K3#1"],
    ["Mutante gpu-bank Genesis Third 12,5 ms", { band: (b, s) => b === "genesis-third" && (s.gpu = 12.5) }, "K1#1 K1#2 K2#1 K2#2"],
    ["Mutante Software-Adapter", { adapter: "[linse-gpu] google/swiftshader" }, ""],
    ["Mutante die Stadt trug die Uhr nicht", { ohne: ["stadt-ego-geht"], offen: ["stadt-ego-geht"] }, "K2#1 K3#1"],
    ["Mutante das Dorf trug die Uhr nicht", { ohne: ["band:dorf-ego", "band:dorf-third"], offen: ["band:dorf-ego", "band:dorf-third"] }, "K1#1 K1#2 K2#1 K2#2"],
    ["Mutante blind (10 Bilder in 2 s)", { zelle: (n, c) => (c.eigen = 10) }, "K3#1"],
    ["Mutante Sicht der Zelle gekippt (Third-Bilder in Wiese Ego)", { zelle: (n, c) => n === "wiese-ego-steht" && (c.sicht = [1, 2]) }, "K1#1 K3#1"],
    ["Mutante Stand-Zelle nur aus fremden Bildern (kein Fenster)", { zelle: (n, c) => n === "genesis-ego-steht" && Object.assign(c, { fenster: null, eigen: 0, fremd: 240 }) }, "K1#1 K1#2 K3#1 K3#2"],
    ["Mutante GPU-Stempel zu wenig (3 in der Zelle)", { zelle: (n, c) => n === "wiese-ego-geht" && (c.gpuN = 3) }, "K1#1 K1#2 K2#1 K2#2 K3#1"],
];
const pbProben = (id) => PB_MUTANTEN.map(([name, o, gruen]) => ({ name, stdout: pbRoh(o), gruen: gruen.split(" ").includes(id) }));
// die Glätte: Gehen mit V und Fahrt mit E aus und ein
function k4Roh(m = () => {}, adapter = "[linse-gpu] amd/rdna-3 (Probe)") {
    const fenster = (geh) => ({ n: 150, frame: 16.8, p99: 33.4, max: 50.1, ueber33: 1, ueber100: 0, takt: 4.4, vram: 108.2, gpu: 9.6, gpuN: 30, befehle: 140, dreiecke: 480000,
        voll: 0, halt: false, last: 0.9, sicht: geh ? [1, 2] : [2, 1].sort(), sichtWechsel: geh ? 4 : 2, sattel: geh ? "0" : "101", wetter: ["sunny"], buehne: 0,
        laeufe: 1, sek: 2.5, befunde: [], tasten: null });
    const g = { "k4-geh": fenster(true), "k4-fahrt": fenster(false) };
    for (const [k, v] of Object.entries(g)) m(k, v);
    const zus = { art: "glaette", sekunden: 15.1, schritte: [], offen: [], fehler: {}, strom: { bloecke: 20, bilder: 400, seiten: 1, fehler: 0, verloren: 0 }, glaette: g, anfang: true };
    return adapter + "\nPROFIBAND " + JSON.stringify(zus);
}
const K4_MUTANTEN = [
    ["Roh (Gehen und Fahrt ohne Bild > 100 ms, ≤ 1 % > 33 ms, Sicht-Wechsel, aus- und eingestiegen)", () => {}, "1 2"],
    ["Mutante Fahrt 45 % > 33 ms", (k, v) => k === "k4-fahrt" && (v.ueber33 = 68), "1"],
    ["Mutante Gehen ein Bild 133 ms", (k, v) => k === "k4-geh" && Object.assign(v, { ueber100: 1, max: 133.3 }), "1"],
    ["Mutante beide ein Bild > 100 ms", (k, v) => Object.assign(v, { ueber100: 1, max: 116.7 }), ""],
    ["Mutante kein Sicht-Wechsel", (k, v) => k === "k4-geh" && Object.assign(v, { sichtWechsel: 0, sicht: [1] }), "1"],
    ["Mutante nicht ausgestiegen", (k, v) => k === "k4-fahrt" && (v.sattel = "1"), "1"],
    ["Mutante Regler voll (R8: der des Spielers)", (k, v) => (v.voll = 1), ""],
    ["Mutante blind (12 Bilder in 2,5 s)", (k, v) => (v.n = 12), ""],
].map(([name, m, gruen]) => ({ name, gruen, stdout: k4Roh(m) }));
const k4Proben = (st) => [
    ...K4_MUTANTEN.map((p) => ({ name: p.name, stdout: p.stdout, gruen: p.gruen.split(" ").includes(String(st)) })),
    { name: "Mutante Software-Adapter", stdout: k4Roh(() => {}, "[linse-gpu] google/swiftshader"), gruen: false },
];
// die Dauer: der Strom zwischen den Marken
function k5Roh(m = () => {}, adapter = "[linse-gpu] nvidia/pascal (Probe)") {
    const anker = (frame) => ({ n: 110, frame, p99: 17.6, max: 33.3, ueber33: 0, ueber100: 0, takt: 4.4, vram: 109.8, gpu: 10.2, gpuN: 20, befehle: 156, dreiecke: 505000,
        voll: 1, halt: false, last: 1, sicht: [1], sichtWechsel: 0, sattel: "0", wetter: ["sunny"], buehne: 0 });
    const d = { anfang: true, ende: true, torbau: { bau: true, tor: true, heim: true }, nacht: { nacht: 0, mittag: 0.5 }, minuten: 22.4, seiten: 1, proben: 61,
        last: { ...anker(16.7), n: 48210, p99: 33.4, max: 92.1, takt: 5.1, vram: 112.4 }, weg: 9800, gegangen: 2100, fahren: true, nachtImStrom: true,
        anker: { a: anker(16.7), b: anker(17.0), laeufe: 2 }, gang: [], heap: [312.4, 330.1], vramGC: [109.8, 110.6] };
    const s = { bloecke: 1300, bilder: 48600, seiten: 1, fehler: 0, verloren: 0 };
    m(d, s);
    const zus = { art: "dauer", sekunden: 13.8, schritte: [], offen: [], fehler: {}, strom: s, dauer: d };
    return adapter + "\nPROFIBAND " + JSON.stringify(zus);
}
const PB_PROBEN_DAUER = [
    ["Roh (die Dauer zwischen den Marken)", () => {}, true],
    ["Mutante neu geladen zwischen Anfang und Ende", (d) => (d.seiten = 2), false],
    ["Mutante 12 min am Stück", (d) => (d.minuten = 12), false],
    ["Mutante Drift: Anker ×1,10", (d) => (d.anker.b.frame = 18.4), false],
    ["Mutante Anker unter Regler frei", (d) => (d.anker.b.voll = 0), false],
    ["Mutante Gang VRAM +3,1 MB zurück am Start", (d) => (d.gang = ["vram: +3.1 MB zurück am Start — buf:szene:baum +3.1 MB"]), false],
    ["Mutante Heap +9 MB/min", (d) => (d.gang = ["heap: +9.0 MB/min > 5 — Halter: —"]), false],
    ["Mutante Weg 4,6 km", (d) => (d.weg = 4600), false],
    ["Mutante nie gefahren", (d) => (d.fahren = false), false],
    ["Mutante nie Nacht", (d) => ((d.nachtImStrom = false), (d.nacht = { nacht: 0.5, mittag: 0.5 })), false],
    ["Mutante kein Tor", (d) => (d.torbau.tor = false), false],
    ["Mutante kein Anfang (die Glätte fuhr nicht)", (d) => Object.assign(d, { anfang: false, minuten: undefined }), false],
    ["Mutante der Aufnehmer warf", (d, s) => (s.fehler = 3), false],
    ["Mutante Software-Adapter", () => {}, false, "[linse-gpu] google/swiftshader"],
].map(([name, m, gruen, adapter]) => ({ name, stdout: k5Roh(m, adapter), gruen }));
// die drei Proben (die Zwillinge teilen je EINE: gleiche Probe, ein Lauf); Ziel der Gruppe ≤ 90 s: glaette ~16 + gang ~60 + dauer ~14.
// DIE DECKEL NACH IHRER MESSUNG (w4-fehlt-acht, Radeon eich3–6 4f098fa6 … 1f17e7d1 am selben Abdruck): glaette 27,6 · 27,0 · 27,0 · 28,8 s
// → 29 s, dauer 36,0 · 22,8 · 29,4 · 30,6 s → 37 s (die Messung trägt Minuten auf zwei Stellen: 36,0 heißt bis 36,3 s; vorher je
// 45 s); gang ungemessen (die Fahrt kam nie zu ihm) — 64 s
const PB_PROBE_GLAETTE = { sek: 29, stellung: "anfang", befehl: pbBefehl("glaette") };
const PB_PROBE_GANG = { sek: 64, mutiert: true, ausnahme: PB_AUSNAHME_GANG, befehl: pbBefehl("gang") };
const PB_PROBE_DAUER = { sek: 37, stellung: "ende", befehl: pbBefehl("dauer") };

module.exports = [
    // ─────────────────────────────── Ankunft K2 · K3 (ankunft-aussen) ───────────────────────────────
    {
        kriterium: "ankunft.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // IN DER SITZUNG (29.10., `probeAnkunft`, Zwilling von ankunft.K3#1 und pipeline.K4#1/#2): der Schuss aus dem Ausgabe-Pfad bei
        // t(Kontrolle von außen) nach dem kalten Laden (die Herkunft leer im warmen Browser) und derselbe in derselben Pose, wenn die
        // Foundry ruht (höchstens 40 s); Lücke = Anteil der Pixel, die in einem Kanal um mehr als 32 abweichen, dazu der offene
        // Bedarf im Bild in dem Moment (`_weltbildFehlt`, im Blick). Soll: ≤ 2 % und nichts offen an einem Gerät, die Ruhe erreicht
        // (ohne sie verglich die Lücke gegen eine halbe Welt — ROT beim Namen der Frist). Bis 29.10. ein eigener Browser mit 60 s
        // Uhr-Ruhe (8 min Soll). swiftshader (Cloud, ankunft-aussen 202b23be): 7,80 % Lücke, 54 Bäume und Bauten offen im Bild.
        probe: { ...ANKUNFT_PROBE, mutiert: true,  sek: 10 },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const { ad, hw } = HW(String(lauf.stdout || ""));
            if (!j || !j.tK || !j.bild) return { gruen: false, zahl: "kein Bild der Kontrolle (t(Kontrolle) " + (j ? j.tK : "?") + " ms, Exit " + lauf.exit + ") · " + ad };
            const gruen = hw && j.bild.ruhe === true && j.bild.luecke <= 0.02 && j.offen.length === 0;
            return {
                gruen,
                zahl:
                    (100 * j.bild.luecke).toFixed(2) + " % Lücke nach " + j.bild.ruheS + " s " + (j.bild.ruhe ? "bis zur Ruhe der Foundry" : "OHNE Ruhe der Foundry (Frist)") +
                    " · offen im Bild " + (j.offen.join(" · ") || "nichts") + " · t(Kontrolle) kalt " + (j.tK / 1000).toFixed(2) + " s von außen (Eigenmeldung " +
                    (j.weltbildDa / 1000).toFixed(2) + " s) · " + ad,
            };
        },
        pfad: [...ANKUNFT_PFAD, "scripts/lib/ausgabe-aufnahme.cjs", "scripts/lib/abnahme-urteil.cjs", "save-server.js"],
        quelle: "1 = das Ankunftsbild ist an einem Gerät ganz (≤ 2 % Lücke gegen dieselbe Pose nach 60 s), gemessen von außen",
    },
    {
        kriterium: "ankunft.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // IN DER SITZUNG (29.10., `probeAnkunft`): nach dem kalten Laden bis zur Ruhe der Foundry (die Platte voll) zwei Zweit-Boots im
        // warmen Browser (der Stand gesichert, die Seite neu), je t(Kontrolle) von außen. Soll: Median ≤ 5 s an einem Gerät. Bis 29.10.
        // ein Kalt-Boot und vier Wiederkehren, je ein frischer Browser-Prozess (12 min Soll) — die Wiederkehr ist jetzt die Seite neu
        // im warmen Prozess (sein Shader- und HTTP-Cache bleiben; ein frischer Prozess ist die Kälte des Session-Starts).
        probe: { ...ANKUNFT_PROBE, mutiert: true,  sek: 10 },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const t = String(lauf.stdout || "");
            const { ad, hw } = HW(t);
            const w = [...t.matchAll(/t\(Kontrolle\) warm ([\d.]+) s von außen/g)].map((m) => +m[1]).sort((a, b) => a - b);
            if (w.length < 2) return { gruen: false, zahl: w.length + " von 2 Zweit-Boots mit Kontrolle von außen (Exit " + lauf.exit + ") · " + ad };
            const med = (w[(w.length - 1) >> 1] + w[w.length >> 1]) / 2;
            return { gruen: hw && med <= 5, zahl: "warm Median " + med.toFixed(2) + " s (" + w.map((x) => x.toFixed(2)).join(" · ") + ", Zweit-Boot im warmen Browser) · " + ad };
        },
        pfad: [...ANKUNFT_PFAD, "stamm/speicher-*.js", "save-server.js"],
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
        // IN DER SITZUNG (29.10., proben-welt.cjs `sprungKadenz`): die drei Sprünge der Hänger-Linse in der warmen Welt, jeder 1 km
        // weiter auf +x in eine Welt, die dort noch nicht steht (statt je Sprung einer frischen Sitzung; Radeon b3f9ae95: 4,92 min
        // Arbeit, die Welt stand nach 8,9–9,0 s); Einschwingen 1 s statt 10 s (die Welt steht schon). Teleport ist kein Edit: unberührt.
        // DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 42,6 s GRÜN am Deckel 45): der Deckel steht in der Tafel der Fahrt (punkte.cjs DIE DECKEL)
        probe: { befehl: PW.torBefehl(PW.sprungKadenz), sek: 33, mutiert: false, },
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
        // IN DER SITZUNG (29.10., proben-welt.cjs `fadenZaehler`): die Haken der Linse vor dem ersten Skript, darum EIN kalter Neu-Lade
        // der Welt der Sitzung (Abbild und Platten geräumt, `/reload`); der Gang springt 240 m und geht 3 s, die Fahrt 10 s bei 16 m/s
        // mit sechs Bau-Klicks, dann der Damm — bis 29.10. ein eigener Boot mit 2 min Gang und 1 min Fahrt (Radeon b3f9ae95: 9,88 min
        // Arbeit). Baut, schüttet und hängt Haken in die Seite: mutiert.
        probe: {
            befehl: PW.torBefehl(PW.fadenZaehler),
            sek: 10,
            mutiert: true,
            
        },
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
            "scripts/werkbank.cjs",
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

    // ─────────────────────────────── Profiband K1–K5 in der Sitzung (w3v-profiband, 29.10.) ───────────────────────────────
    // DREI PROBEN (oben, `pbProbe`): glaette (K4, stellung anfang), gang (K1 · K2 · K3, mutiert, ausnahme), dauer (K5, stellung ende) —
    // die Zwillinge je Probe fahren EINMAL; jede urteilt aus dem Strom der Sitzung (punkte.cjs `stromSeite`) und ihren eigenen
    // Fenstern. Bis 29.10. fuhr jede ihren eigenen Boot (K1–K3 80 min, K4 25 + 35, K5 35 min je Gerät: 610 min).
    {
        kriterium: "profiband.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // DIE GLÄTTE: am Genesis-Ring je PB_KONST.glaette.sek s Gehen (Bahn, V alle 0,75 s) und Fahrt (GT, E aus und ein im Fenster)
        // unter dem Regler des Spielers (R8), jedes Bild aus dem Strom, der Täter jedes Bilds über 33 ms aus der Hänger-Linse. Die eine
        // Sitzung ersetzt „≥ 3 von 4 Sitzungen“: eine Bewegungsart ohne ein einziges Bild über 100 ms (strenger, nie milder). Vorher
        // (GTX 7c6f4b49, M39, 4 frische Boots × `haenger 60` an der Wiese): 4/4 ohne Frame > 100 ms, max 83,4 ms.
        probe: PB_PROBE_GLAETTE,
        gpu: true,
        zeit: true,
        minuten: 0.3,
        urteil: (j, lauf) => k4Richter(lauf, 1),
        pfad: PB_PFAD,
        proben: k4Proben(1),
        quelle: "1 = eine Bewegungsart an einem Gerät in ≥ 3 von 4 Sitzungen ohne Frame > 100 ms",
    },
    {
        kriterium: "profiband.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Probe: Gehen UND Fahrt ohne Bild > 100 ms, ≤ 1 % über 33 ms, im Gehen ≥ 2 Sicht-Wechsel durch beide Sichten, in der
        // Fahrt aus- und wieder eingestiegen — die Übergänge liest der Strom (Sicht und Sattel je Bild), nie ein Zähler der Probe
        probe: PB_PROBE_GLAETTE,
        gpu: true,
        zeit: true,
        minuten: 0.3,
        urteil: (j, lauf) => k4Richter(lauf, 2),
        pfad: PB_PFAD,
        proben: k4Proben(2),
        quelle: "2 = 0 Frames > 100 ms und ≤ 1 % > 33 ms über Gehen und Fahrt (mit Sicht-Wechsel, Einsteigen) an beiden Geräten",
    },
    {
        kriterium: "profiband.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        // Bild-p95 je Bewegungszelle (der Gang). Vorher (GTX 23.10., `werkbank lauf` von Hand, Zug 1–3): Stadt gehend 58,3 und 49,8 ms,
        // Fahrt 33,3 an der VSync-Kante, Sturm gehend 33,3, Wiese Ego gehend 25,1 — ROT erwartet an Stadt und Fahrt; die Radeon bewegt ungemessen.
        probe: PB_PROBE_GANG,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: PB_BEWEGT, wort: "Bild-p95", soll: 33, feld: (z) => z.frame }] }),
        pfad: PB_PFAD,
        proben: pbProben("K1#1"),
        quelle: "1 = Frame p95 ≤ 33 ms (der Boden von PFLICHT E) in jeder Bewegungszelle an beiden Geräten",
    },
    {
        kriterium: "profiband.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Probe: ≤ 16,7 ms in jeder Zelle, stehend (eigenes Fenster und jedes fremde Bild, das dort stand) und bewegt
        probe: PB_PROBE_GANG,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: PB_ZELLEN, wort: "Bild-p95", soll: 16.7, feld: (z) => z.frame }] }),
        pfad: PB_PFAD,
        proben: pbProben("K1#2"),
        quelle: "2 = ≤ 16,7 ms in jeder Zelle",
    },
    {
        kriterium: "profiband.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // die Belegung des Haupt-Fadens je Bild (p95 aus der Spur des eigenen Fensters, nie der Takt des Stroms) in den vier
        // Stand-Zellen. Vorher (GTX 23.10., Zug 3, Trace): Wiese Ego 5,95/5,93 ms, Genesis Third 7,34/7,29, Dorf 7,10/7,21 — ROT
        // erwartet an Genesis Third
        probe: PB_PROBE_GANG,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => pbRichter(lauf, { regeln: [{ zellen: PB_STEHT, wort: "Belegung p95", soll: 5.8, feld: (z) => (z.fenster ? z.fenster.belegung : NaN) }] }),
        pfad: PB_PFAD,
        proben: pbProben("K2#1"),
        quelle: "1 = stehend ≤ 5,8 ms an einem Gerät",
    },
    {
        kriterium: "profiband.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Probe: stehend ≤ 5,8 und in jeder Bewegungszelle ≤ 8 ms. Vorher (Radeon 21.10., M12): Wiese Ego stehend 10,43 ms
        probe: PB_PROBE_GANG,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) =>
            pbRichter(lauf, {
                regeln: [
                    { zellen: PB_STEHT, wort: "Belegung p95", soll: 5.8, feld: (z) => (z.fenster ? z.fenster.belegung : NaN) },
                    { zellen: PB_BEWEGT, wort: "Belegung p95", soll: 8, feld: (z) => (z.fenster ? z.fenster.belegung : NaN) },
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
        // `band` je Ort × Sicht (der Gang, eine Probe je Band statt sechs): sein Urteil (Haushalt, Ratsche, Befehle ≤ 208, Dreiecke ≤ 680k,
        // VRAM nach dem Collector ≤ 118 MB, Stempel-Pool), dazu gpu-bank ≤ 12 ms. Vorher (GTX 23.10., Zug 3): gpu-bank Wiese 12,99 ·
        // Dorf 12,45 · Genesis 11,52 ms — ROT erwartet an der GTX; die Radeon ungemessen
        probe: PB_PROBE_GANG,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => pbRichter(lauf, { band: true }),
        pfad: PB_PFAD,
        proben: pbProben("K3#1"),
        quelle: "1 = im Stand an beiden Geräten frisch am Kopf (Ratsche + gpu-bank)",
    },
    {
        kriterium: "profiband.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dazu jede Zelle (stehend und bewegt) aus dem Strom: Befehle p95 ≤ 208, Dreiecke p95 ≤ 680k, VRAM p95 ≤ 118 MB, GPU p95 ≤ 12 ms
        // aus den Summen des Reglers (`_gpuTsLast`, nur Blöcke ohne Pool-Überlauf, ≥ PB_KONST.gpuN Werte). Vorher: VRAM in der Fahrt
        // 118,8 MB (GTX 23.10.)
        probe: PB_PROBE_GANG,
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) =>
            pbRichter(lauf, {
                band: true,
                regeln: [
                    { zellen: PB_ZELLEN, wort: "Befehle p95", soll: 208, feld: (z) => z.befehle },
                    { zellen: PB_ZELLEN, wort: "Dreiecke p95", soll: 680000, feld: (z) => z.dreiecke },
                    { zellen: PB_ZELLEN, wort: "VRAM MB", soll: 118, feld: (z) => z.vram },
                    { zellen: PB_ZELLEN, wort: "GPU p95", soll: 12, feld: (z) => (z.gpuN >= PB_KONST.gpuN ? z.gpu : NaN) },
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
        // DIE DAUER IST DIE SITZUNG (oben, Probe dauer, stellung ende; `k5Richter`): der Strom zwischen dem Stand des Anfangs (die
        // Glätte) und dem des Endes, ≥ 20 min in EINER Seite — Drift am Anker ≤ ×1,05, `gangUrteil` (VRAM ≤ 2 MB zurück am Start, Heap
        // ≤ 5 MB/min, buf:ruhend/verwaist 0), Weg ≥ 5 km, gefahren, Nacht, Bau und Tor. Vorher (Radeon 21.10., M14, von Hand): VRAM
        // 113,9 → 127,0 MB, Heap 186 → 1 118 MB, p95 16,2 → 42,3 ms unter Fremdlast — ROT
        probe: PB_PROBE_DAUER,
        gpu: true,
        zeit: true,
        minuten: 0.3,
        urteil: (j, lauf) => k5Richter(lauf),
        pfad: PB_PFAD,
        proben: PB_PROBEN_DAUER,
        quelle: "1 = an einem Gerät",
    },
    {
        kriterium: "profiband.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: PB_PROBE_DAUER,
        gpu: true,
        zeit: true,
        minuten: 0.3,
        urteil: (j, lauf) => k5Richter(lauf),
        pfad: PB_PFAD,
        proben: PB_PROBEN_DAUER,
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
        probe: { sek: 22, befehl: sitzungBefehl(windLauf, [windSeite]), mutiert: false },
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
        probe: { ...K4_PROBE, mutiert: true },
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
        probe: { ...K4_PROBE, mutiert: true },
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
        probe: { sek: 10, befehl: sitzungBefehl(taktLauf, [taktFahrt]), mutiert: true, },
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
        probe: { ...TOD_PROBE, mutiert: true },
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
        probe: { ...TOD_PROBE, mutiert: true },
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
        probe: { ...SPEICHER_TAKT_PROBE, mutiert: true },
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
        probe: { ...SPEICHER_TAKT_PROBE, mutiert: true },
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
        probe: { sek: 15, befehl: sitzungBefehl(speicherBildLauf, [uferSeite, speicherBildSeite]), mutiert: true, },
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
