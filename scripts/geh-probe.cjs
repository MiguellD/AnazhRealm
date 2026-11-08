#!/usr/bin/env node
// geh-probe.cjs — DAS BILD BEIM GEHEN auf der echten GPU (profiband.K1#1, leib.K1#1): EINE Werkbank am Tor, frisch an der Wiese
// (Ego) erst die Latenz der Station leib.K1#1 (Taste → bewegter Leib, 15 Proben je Sicht × Verb gehen · wechsel), dann der erste
// und der zweite Gang derselben Bahn (`lauf`, 4 m/s, Regler voll, Tiere frei, ohne Profil), dann Genesis Third — je Abschnitt
// die Knoten-Bauten (`_knotenRate`) beim Namen. Zeilen „GEH …“ (≤ 590 Zeichen: der GPU-Probe-Dienst postet die letzten zehn
// Zeilen mit Urteil). Exit 0 nur, wenn jeder Gang Bild-p95 ≤ 33 ms hält (die Latenz urteilt ihre Station).
//   node scripts/geh-probe.cjs [--port 4793]          (npm run gate:geh-zerlegung; je Push nimmt der freie Läufer sie)
"use strict";
const fs = require("fs");
const path = require("path");
const { werkbankTor } = require("./lib/welt-boot.cjs");

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const PORT = Number(arg("--port", 4793));
const D = path.resolve("artifacts", "geh-probe");
fs.mkdirSync(D, { recursive: true });
const r1 = (x) => (Number.isFinite(x) ? +x.toFixed(1) : x);
const q = (z) => (z ? [z.p50, z.p95, z.p99, z.max].map(r1).join("/") : "?");
const zeile = (s) => console.log(s.replace(/\s+/g, " ").slice(0, 590));
const json = (out) => {
    try {
        return JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
    } catch {
        return null;
    }
};

// DER KNOTEN-BAU IM GANG (`_knotenRate`, der Bau in Raten): je Bau-Schlüssel Stoff | Täter-Klasse | Pass, ms, Schritte, der
// längste Schritt und wie oft der Schlüssel VOR dem Gang schon im Bau-Cache stand und aus ihm fiel (r184 `Nodes.delete`: der
// letzte Leser nimmt den Eintrag mit); je Abschnitt gelesen und geleert
const KB_AN = `if (!window.__kb) {
    const C = r.state.renderer._nodes.nodeBuilderCache;
    const G = (window.__kb = { gebaut: new Map(), geloescht: new Map(), je: new Map(), an: false, del: 0 });
    const s0 = C.set.bind(C), d0 = C.delete.bind(C);
    C.set = (k, v) => (C.has(k) || G.gebaut.set(k, (G.gebaut.get(k) || 0) + 1), s0(k, v));
    C.delete = (k) => (C.has(k) && (G.geloescht.set(k, (G.geloescht.get(k) || 0) + 1), G.an && G.del++), d0(k));
    const kr = r._knotenRate;
    r._knotenRate = function (N, ro, E) {
        if (!G.an) return kr.call(this, N, ro, E);
        const k = N.getForRenderCacheKey(ro), vor = G.gebaut.get(k) || 0, weg = G.geloescht.get(k) || 0;
        const t0 = performance.now(), ok = kr.call(this, N, ro, E), ms = performance.now() - t0;
        let e = G.je.get(k);
        if (!e) {
            const m = ro.material || {};
            let kl = "?", pass = "?";
            try { kl = r._taeterKlasse(ro.object); } catch (_e) {}
            const o = ro.object, g = o && o.isGeometrieArena && o.glieder && o.glieder[0];
            try { if (g) kl = "arena " + r._taeterKlasse(g) + (G.alt.has(o) ? " alt" : " neu") + " n" + o.glieder.length; } catch (_e) {}
            try { pass = window.__passName ? window.__passName(ro.scene, ro.camera) : "?"; } catch (_e) {}
            G.je.set(k, (e = { name: (m.name || m.type || "?") + "|" + kl + "|" + pass + "|t" + Math.round(performance.now() - G.t0), ms: 0, n: 0, max: 0, fertig: 0, vor, weg }));
        }
        e.ms += ms; e.n++; if (ms > e.max) e.max = ms; if (ok) e.fertig++;
        return ok;
    };
}
const A = r.constructor.__arenen;
window.__kb.alt = new Set(A ? A.values() : []);
window.__kb.t0 = performance.now();
window.__kb.an = true; window.__kb.je.clear(); window.__kb.del = 0; return window.__kb.alt.size;`;
const KB_LESEN = `const G = window.__kb; G.an = false; const a = [...G.je.values()].sort((x, y) => y.ms - x.ms);
const s = (f) => +a.reduce((t, e) => t + f(e), 0).toFixed(1);
return { schluessel: a.length, ms: s((e) => e.ms), schritte: s((e) => e.n), fertig: s((e) => e.fertig), wieder: a.filter((e) => e.vor > 0).length,
    wiederMs: s((e) => (e.vor > 0 ? e.ms : 0)), geloeschtImGang: G.del,
    arenen: (r.constructor.__arenen || new Map()).size, top: a.slice(0, 7).map((e) => [e.name.replace("MeshStandardNodeMaterial", "MSNM").slice(0, 80), +e.ms.toFixed(1), e.n, +e.max.toFixed(1), e.vor, e.weg]) };`;

(async () => {
    const tor = werkbankTor(PORT);
    let gruen = true;
    try {
        await tor.bereit;
        console.log((/\[linse-gpu\][^\r\n]*/.exec(tor.log) || ["[linse-gpu] ungenannt"])[0]);
        const wb = (args, s) => {
            const o = tor.rufe([...args, "--port", String(PORT)], s * 1000);
            fs.appendFileSync(path.join(D, "werkbank.log"), `\n$ ${args.join(" ")}\n${o.stdout}${o.stderr}`);
            return o.stdout || "";
        };
        const ev = (code) => (json(wb(["eval", code], 60)) || {}).ergebnis || {};
        const knoten = (name) => {
            const k = ev(KB_LESEN);
            zeile(
                `GEH ROT ${name} Knoten-Bau: ${k.schluessel} Schlüssel · Σ ${k.ms} ms in ${k.schritte} Schritten · ${k.wieder} vorher im Cache · ` +
                    `${k.geloeschtImGang} gelöscht · Arenen ${k.arenen} · [Stoff|Glied alt/neu n|Pass|t ms Schritte max]: ` +
                    JSON.stringify((k.top || []).map((x) => x.slice(0, 4)))
            );
        };
        const lauf = (name) => {
            ev(KB_AN);
            const l = json(
                wb(["lauf", "6", "--ein", "0.5", "--wandern", "bahn", "--regler", "voll", "--tiere", "frei"], 120)
            );
            if (!l || !l.frameMs) return ((gruen = false), zeile(`GEH ROT ${name}: der Lauf lieferte kein JSON`));
            const ok = l.frameMs.p95 <= 33.4;
            gruen = gruen && ok;
            zeile(
                `GEH ${ok ? "GRÜN" : "ROT"} ${name}: Bild p50/95/99/max ${q(l.frameMs)} · CPU ${q(l.cpuTaktMs)} · GPU ${q(l.gpuMs)} · ` +
                    `${l.frames} Bilder · Weg ${l.bahnM} m · Phasen ${JSON.stringify(l.phasenEwmaMs)}`
            );
            knoten(name);
        };
        wb(["umstellen", "--ort", "wiese", "--sicht", "ego"], 300);
        // leib.K1#1: dieselbe Reihe wie die Station (15 Proben, Ego und Third × gehen und wechsel), frisch an der Wiese
        ev(KB_AN);
        const lj = path.join(D, "latenz.json");
        wb(["latenz", "--proben", "15", "--sicht", "ego,third", "--verb", "gehen,wechsel", "--json", lj], 240);
        const L = fs.existsSync(lj) ? JSON.parse(fs.readFileSync(lj, "utf8")) : null;
        zeile(
            L && L.reihen
                ? `GEH ${L.urteil === "GRÜN" ? "GRÜN" : "ROT"} leib.K1#1 Latenz p95 ms ` +
                      Object.entries(L.reihen)
                          .map(([n, e]) => `${n} ${e.p95} (p50 ${e.p50}, fehlt ${e.fehlt})`)
                          .join(" · ") +
                      ` · Bild ${L.bildMs} ms`
                : "GEH ROT leib.K1#1 Latenz ohne JSON"
        );
        knoten("leib.K1#1");
        lauf("wiese-ego Gang 1");
        lauf("wiese-ego Gang 2");
        wb(["umstellen", "--ort", "genesis", "--sicht", "third"], 300);
        lauf("genesis-third Gang 1");
    } catch (e) {
        gruen = false;
        zeile(`GEH ROT Error ${String((e && e.stack) || e).slice(0, 400)} · ${tor.log.slice(-300)}`);
    } finally {
        tor.stop();
    }
    process.exit(gruen ? 0 : 1);
})();
