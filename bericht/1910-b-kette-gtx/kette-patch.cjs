// 1910 B-Kette (OMEN, Messer): Zusatz zum Lieferungs-Instrument (nach lieferung-patch.cjs anwenden) — die Kette hinter
// „N Wald-Stücke warten auf ihre Gestalt" beim Namen. Je Streu-Region: neu · Scheibe fertig (aufgeschoben?) · der Wecker
// (`_streuWeckerSpannen`) mit JEDER Zusage beim Namen (zug:<Körper-Schlüssel> · karte:<Art|Gestalt> · waldplan#n · buch ·
// anon#n) und wann jede kam · Abriss zum Neubau (`_disposeScatterRegion`). Dazu jeder neue Zug (`_foundryZug`) vor dem Bild
// mit Rang, die Wald-Schlange (`_waldPlanSchlange`, `_nebenAuftrag("wald")`, wann sie leer wird), die Karten-Bakes und je
// Probe die wartenden Regionen im Blick mit ihren offenen Zusagen. Nur Hüllen um Prototyp-Methoden im Kalt-Lauf, jede im
// try/catch (das Spiel läuft byte-gleich). Zurück: git -c core.autocrlf=false checkout -- scripts/diag-boot-stage.cjs
//   node kette-patch.cjs <baum>
"use strict";
const fs = require("fs");
const path = require("path");
const f = path.join(process.argv[2], "scripts", "diag-boot-stage.cjs");
let s = fs.readFileSync(f, "utf8");
if (s.includes("OMEN 1910 Kette")) {
    console.log(f, "schon gepatcht");
    process.exit(0);
}
if (!s.includes("OMEN 1810 B5: die Lieferungen")) throw new Error("erst lieferung-patch.cjs anwenden");
const ers = (a, n) => {
    if (s.split(a).length !== 2) throw new Error(`Anker nicht eindeutig: ${JSON.stringify(a)}`);
    s = s.replace(a, n);
};

// läuft IN der Seite (Quelltext wird in KALT_PROBE eingesetzt): (A) → { wickle(P), probe(r) }
function ketteFabrik(A) {
    const K = (A.kt = {
        zug: [],
        zugEnde: [],
        kneu: [],
        wp: [],
        wpLeer: [],
        wald: [],
        waldAn: [],
        wk: [],
        disp: [],
        rneu: [],
        rfertig: [],
        back: [],
        res: {},
        ticks: [],
        fehler: [],
    });
    const jetzt = () => Math.round(performance.now());
    const LAB = new WeakMap();
    let wpN = 0;
    let anonN = 0;
    const vor = () => {
        const r = window.anazhRealm;
        return !(r && r.state && r.state._weltbildDa);
    };
    const fehler = (wo, e) => {
        if (K.fehler.length < 20) K.fehler.push(wo + ": " + (e && e.message ? e.message : String(e)));
    };
    const markiere = (z, lab) => {
        if (!z || typeof z.then !== "function") return null;
        if (LAB.has(z)) return LAB.get(z);
        LAB.set(z, lab);
        z.then(
            () => {
                if (K.res[lab] == null) K.res[lab] = jetzt();
            },
            () => {
                if (K.res[lab] == null) K.res[lab] = -jetzt();
            }
        );
        return lab;
    };
    const rangVon = (r, wo) => {
        try {
            const rg = r._foundryRang(wo);
            const d2 = r._foundryAuftragD2(rg.wo);
            const A2 = r.constructor.ERSTER_BLICK.ausserD2;
            return [Number.isFinite(d2) ? Math.round(Math.sqrt(d2 >= A2 ? d2 - A2 : d2)) : -1, r._rangImErstenBlick(d2) ? 1 : 0];
        } catch (_e) {
            return [-2, -1];
        }
    };
    const wickle = (P) => {
        const w = (name, fn) => {
            const alt = P[name];
            if (typeof alt === "function") P[name] = fn(alt);
            else fehler("fehlt", name);
        };
        w("_foundryZug", (alt) =>
            function (key, preset, variant, lod, ov, wo) {
                let neu = false;
                try {
                    const f = this._foundry;
                    neu = !(f && f.zuege && f.zuege.get(key));
                } catch (_e) {}
                const x = alt.apply(this, arguments);
                try {
                    if (neu && x && typeof x.then === "function" && !LAB.has(x)) {
                        markiere(x, "zug:" + key);
                        if (vor()) {
                            const [d, b] = rangVon(this, wo);
                            const wer = String(new Error().stack).split("\n").slice(2, 5).map((z) => z.trim().replace(/^at /, "").replace(/ \(.*$/, "")).join("<");
                            K.zug.push([jetzt(), key, d, b, this._streuSammler ? 1 : 0, wer]);
                            x.then((ok) => K.zugEnde.push([jetzt(), key, ok ? 1 : 0]));
                        }
                    }
                } catch (e) {
                    fehler("_foundryZug", e);
                }
                return x;
            }
        );
        w("_foundryEnsureImpostorRecord", (alt) =>
            function (preset, variant) {
                const z = alt.apply(this, arguments);
                try {
                    if (z && z.ende && !LAB.has(z.ende)) {
                        markiere(z.ende, "karte:" + preset + "|" + variant);
                        if (vor()) K.kneu.push([jetzt(), preset + "|" + variant, rangVon(this, z._bedarfD2)[1]]);
                    }
                } catch (e) {
                    fehler("_foundryEnsureImpostorRecord", e);
                }
                return z;
            }
        );
        w("_waldPlanZusage", (alt) =>
            function () {
                const z = alt.apply(this, arguments);
                try {
                    if (z && !LAB.has(z)) {
                        const n = ++wpN;
                        markiere(z, "waldplan#" + n);
                        const Q = this._waldPlanSchlange;
                        K.wp.push([jetzt(), n, Q ? Q.size : 0]);
                    }
                } catch (e) {
                    fehler("_waldPlanZusage", e);
                }
                return z;
            }
        );
        w("_waldPlanGeplant", (alt) =>
            function () {
                try {
                    const Q = this._waldPlanSchlange;
                    if (!(Q && Q.size) && vor()) K.wpLeer.push([jetzt(), this._waldLeer ? 1 : 0]);
                } catch (e) {
                    fehler("_waldPlanGeplant", e);
                }
                return alt.apply(this, arguments);
            }
        );
        w("_nebenAuftrag", (alt) =>
            function (name, msg) {
                let n = 0;
                let dmin = -1;
                let dmax = -1;
                const t0 = jetzt();
                try {
                    n = name === "wald" && msg && msg.zellen ? msg.zellen.length / 2 : 0;
                    const pm = this.state.playerMesh;
                    if (n && pm) {
                        const C = this.constructor.FOREST.cell;
                        dmin = 1e9;
                        for (let i = 0; i < msg.zellen.length; i += 2) {
                            const dd = Math.hypot((msg.zellen[i] + 0.5) * C - pm.position.x, (msg.zellen[i + 1] + 0.5) * C - pm.position.z);
                            if (dd < dmin) dmin = dd;
                            if (dd > dmax) dmax = dd;
                        }
                        dmin = Math.round(dmin);
                        dmax = Math.round(dmax);
                    }
                } catch (_e) {}
                const p = alt.apply(this, arguments);
                try {
                    if (name === "wald" && vor()) {
                        const id = msg && msg.requestId;
                        const Q = this._waldPlanSchlange;
                        K.wald.push([t0, id, n, Q ? Q.size : 0, this._waldFlugAuftraege | 0, dmin, dmax]);
                        p.then(
                            (m) => K.waldAn.push([jetzt(), id, m && Array.isArray(m.b5) ? m.b5.map((x) => Math.round(x - performance.timeOrigin)) : null]),
                            () => K.waldAn.push([-jetzt(), id, null])
                        );
                    }
                } catch (e) {
                    fehler("_nebenAuftrag", e);
                }
                return p;
            }
        );
        // wer die Wald-Schlange füllt: je Rufer (Stapel-Glied 2–3) neue Zellen, Rufe, erste/letzte Zeit; je Sekunde neue Zellen
        K.wq = {};
        K.wqSek = {};
        w("_waldPlanKasten", (alt) =>
            function () {
                const Q0 = this._waldPlanSchlange;
                const n0 = Q0 ? Q0.size : 0;
                const x = alt.apply(this, arguments);
                try {
                    const Q = this._waldPlanSchlange;
                    const dn = (Q ? Q.size : 0) - n0;
                    if (dn > 0 && vor()) {
                        const wer = String(new Error().stack).split("\n").slice(2, 4).map((z) => z.trim().replace(/^at /, "").replace(/ \(.*$/, "").replace(/^AnazhRealm\./, "")).join("<");
                        const z = K.wq[wer] || (K.wq[wer] = [0, 0, jetzt(), 0]);
                        z[0] += dn;
                        z[1]++;
                        z[3] = jetzt();
                        const sk = Math.floor(performance.now() / 1000);
                        K.wqSek[sk] = (K.wqSek[sk] || 0) + dn;
                    }
                } catch (e) {
                    fehler("_waldPlanKasten", e);
                }
                return x;
            }
        );
        w("_streuWeckerSpannen", (alt) =>
            function (region) {
                try {
                    if (vor() && region) {
                        const f = this._foundry;
                        const labs = [];
                        for (const z of region._zusagen || []) {
                            let l = LAB.get(z);
                            if (!l) l = markiere(z, f && z === f.buchDa ? "buch" : "anon#" + ++anonN) || "?";
                            labs.push(l);
                        }
                        region.__kw = labs;
                        K.wk.push([jetzt(), region.regX + "," + region.regZ, labs]);
                    }
                } catch (e) {
                    fehler("_streuWeckerSpannen", e);
                }
                return alt.apply(this, arguments);
            }
        );
        w("_disposeScatterRegion", (alt) =>
            function (key) {
                try {
                    if (vor()) {
                        const m = this.state.scatterRegions;
                        const reg = m && m.get(key);
                        if (reg && reg._deferredFoundry) K.disp.push([jetzt(), key, reg._geweckt ? 1 : 0]);
                    }
                } catch (e) {
                    fehler("_disposeScatterRegion", e);
                }
                return alt.apply(this, arguments);
            }
        );
        w("_scatterRegion", (alt) =>
            function (regX, regZ) {
                if (!vor()) return alt.apply(this, arguments);
                const key = regX + "," + regZ;
                let da = null;
                try {
                    const m = this.state.scatterRegions;
                    da = m ? m.get(key) : null;
                } catch (_e) {}
                const t0 = performance.now();
                const x = alt.apply(this, arguments);
                try {
                    const m2 = this.state.scatterRegions;
                    const reg = m2 && m2.get(key);
                    if (!da && reg) K.rneu.push([Math.round(t0), key]);
                    if (reg && !reg._cont && !reg.__fertig) {
                        reg.__fertig = 1;
                        K.rfertig.push([jetzt(), key, reg._deferredFoundry ? 1 : 0, reg.instanceCount | 0, reg.__kw ? reg.__kw.length : -1]);
                    }
                } catch (e) {
                    fehler("_scatterRegion", e);
                }
                return x;
            }
        );
        w("_karteWeltBacken", (alt) =>
            function (at, z) {
                if (!vor()) return alt.apply(this, arguments);
                const t0 = performance.now();
                try {
                    return alt.apply(this, arguments);
                } finally {
                    try {
                        K.back.push([
                            Math.round(t0),
                            Math.round((performance.now() - t0) * 10) / 10,
                            z ? z.preset + "|" + z.variant : "?",
                            z ? rangVon(this, z._bedarfD2)[1] : -1,
                            z && z.gebacken ? 1 : 0,
                        ]);
                    } catch (_e) {}
                }
            }
        );
        w("_tickScatterStreaming", (alt) =>
            function () {
                if (vor()) K.ticks.push(jetzt());
                return alt.apply(this, arguments);
            }
        );
    };
    const probe = (r) => {
        const o = {};
        try {
            const st = r.state;
            const pm = st.playerMesh;
            const Q = r._waldPlanSchlange;
            const PW = r._waldPflanzWarten;
            o.w = [Q ? Q.size : 0, r._waldFlug ? r._waldFlug.size : 0, r._waldFlugAuftraege | 0, PW ? PW.size : 0, r._forestGesetzWahr() ? 1 : 0, r._waldLeer ? 1 : 0];
            if (pm) {
                const SC = r.constructor.SCATTER;
                const liste = [];
                r._streuWartet(pm.position, liste, (rx, rz) => r._imErstenBlick((rx + 0.5) * SC.regionM, (rz + 0.5) * SC.regionM, SC.regionM * Math.SQRT1_2));
                o.s = liste.map((x) => {
                    const k = x.split(" ")[0];
                    const reg = st.scatterRegions && st.scatterRegions.get(k);
                    const offen = reg && reg.__kw ? reg.__kw.filter((l) => K.res[l] == null) : null;
                    return [x, reg ? (reg._cont ? "c" : "") + (reg._geweckt ? "G" : "") + (reg._zusagen ? "s" + reg._zusagen.size : "") : "-", offen ? offen.slice(0, 10) : null, offen ? offen.length : -1];
                });
            }
            const f = r._foundry;
            if (f) o.q = [(f.warte || []).length, f.pending ? f.pending.size : 0, (r._foundryIngestQueue || []).length, (r._impostorBakeQueue || []).length, f.nachAtlas ? f.nachAtlas.length : 0];
        } catch (e) {
            fehler("probe", e);
        }
        return o;
    };
    return { wickle, probe };
}

ers(
    "    let gewickelt = false;\n",
    "    // OMEN 1910 Kette: die Kette hinter den Wald-Stücken beim Namen (p3/n1910/kette/kette-patch.cjs)\n" +
        "    const KETTE = (" +
        ketteFabrik.toString() +
        ")(A);\n" +
        "    let gewickelt = false;\n"
);
ers(
    "                wickleLf(Object.getPrototypeOf(r));\n",
    "                wickleLf(Object.getPrototypeOf(r));\n                KETTE.wickle(Object.getPrototypeOf(r));\n"
);
ers(
    "                if (!r.state._weltbildDa) o.det = lfDetail(r, L);\n",
    "                if (!r.state._weltbildDa) o.det = lfDetail(r, L);\n                if (!r.state._weltbildDa) o.kt = KETTE.probe(r);\n"
);
// der Chrome-Trace (nur mit KETTE_TRACE=<datei>): vor der Navigation bis zum Weltbild — Haupt- und Faden-Aufgaben, die
// Übersetzung (v8.compile) und die Abtastung (v8.cpu_profiler) in EINER Uhr: `(program)` beim Namen der Aufgabe, in der es lief
ers(
    "        await page.evaluateOnNewDocument(KALT_PROBE);\n",
    "        await page.evaluateOnNewDocument(KALT_PROBE);\n" +
        "        // OMEN 1910 Kette Trace\n" +
        "        if (process.env.KETTE_TRACE)\n" +
        "            await page.tracing.start({\n" +
        "                path: process.env.KETTE_TRACE,\n" +
        '                categories: ["toplevel", "devtools.timeline", "v8", "v8.execute", "disabled-by-default-v8.compile", "disabled-by-default-v8.cpu_profiler", "disabled-by-default-v8.gc"],\n' +
        "            });\n"
);
ers(
    "            if (da) break;\n        }\n",
    "            if (da) break;\n        }\n        if (process.env.KETTE_TRACE) await page.tracing.stop();\n"
);
fs.writeFileSync(f, s);
console.log(f, "gepatcht (1910 Kette)");
