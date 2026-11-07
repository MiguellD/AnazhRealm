#!/usr/bin/env node
// geh-probe.cjs — DAS BILD BEIM GEHEN auf der echten GPU (profiband.K1#1, leib.K1#1): EINE Werkbank am Tor; an der Wiese (Ego)
// die Hänger-Linse über 33 ms auf der Bahn (4 m/s, Regler voll, Tiere frei), derselbe Lauf als Takt-Spitze (der Rahmen-Baum
// je Spitze · Mitte, tief), dann je Zelle (Wiese Ego, Genesis Third) ein Lauf ohne Profil mit den GPU-Stempeln. Zeilen „GEH …“
// (≤ 590 Zeichen: der GPU-Probe-Dienst postet die letzten zehn Zeilen mit Urteil). Exit 0 nur, wenn jede Zelle Bild-p95 ≤ 33 ms hält.
//   node scripts/geh-probe.cjs [--port 4793] [--sek 10]          (npm run gate:geh-zerlegung; je Push nimmt der freie Läufer sie)
"use strict";
const fs = require("fs");
const path = require("path");
const { werkbankTor } = require("./lib/welt-boot.cjs");
const HL = require("./lib/haenger-linse.cjs");

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const PORT = Number(arg("--port", 4793)),
    SEK = String(arg("--sek", 10));
const D = path.resolve("artifacts", "geh-probe");
fs.mkdirSync(D, { recursive: true });
const r1 = (x) => (Number.isFinite(x) ? +x.toFixed(1) : x);
const q = (z) => (z ? [z.p50, z.p95, z.p99, z.max].map(r1).join("/") : "?");
const zeile = (s) => console.log(s.replace(/\s+/g, " ").slice(0, 590));
// der Rahmen-Baum der Takt-Spitze in Zeilen (Tiefe vorn, Spitze · Mitte in ms): ein Rahmen, der nur seinen Namensvetter trägt (renderer.x › x), fällt in ihn
const kurz = (n) => n.split(" ")[0].replace(/^(renderer|rend|be|o|AnazhRealm)\./, "");
function baumZeilen(zeilen, kopf, n) {
    const stapel = [],
        teile = [];
    for (const e of zeilen) {
        stapel.length = e.tiefe;
        const vater = stapel[e.tiefe - 1];
        const k = kurz(e.name),
            gleich = vater && vater.k === k;
        const t = gleich ? vater.t : vater ? vater.t + 1 : 0;
        // ein Ast fällt ganz, wenn er die Mitte nicht trägt und die Spitze nur tief (der Knoten-Bau rekursiert 60 Rahmen tief)
        const zeigt = !(vater && vater.weg) && (e.mitteMs >= 0.3 || (e.spitzeMs >= 4 && t <= 6));
        stapel[e.tiefe] = { k, t, weg: !!(vater && vater.weg) || (!gleich && !zeigt) };
        if (gleich || !zeigt) continue;
        teile.push(`${t}${k} ${r1(e.spitzeMs)}·${r1(e.mitteMs)}`);
    }
    const aus = [];
    let z = "";
    for (const t of teile) {
        if (z.length + t.length > 540) (aus.push(z), (z = ""));
        z += (z ? " " : "") + t;
    }
    if (z) aus.push(z);
    return aus.slice(0, n).map((x, i) => `${kopf} B${i + 1}: ${x}`);
}

// DER KNOTEN-BAU IM GANG (`_knotenRate`, der Bau in Raten): je Bau-Schlüssel Stoff | Täter-Klasse | Pass, ms, Schritte, der
// längste Schritt und wie oft der Schlüssel VOR dem Gang schon im Bau-Cache stand und aus ihm fiel (r184 `Nodes.delete`: der
// letzte Leser nimmt den Eintrag mit); je Gang gelesen und geleert
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
            try { pass = window.__passName ? window.__passName(ro.scene, ro.camera) : "?"; } catch (_e) {}
            G.je.set(k, (e = { name: (m.name || m.type || "?") + "|" + kl + "|" + pass, ms: 0, n: 0, max: 0, fertig: 0, vor, weg }));
        }
        e.ms += ms; e.n++; if (ms > e.max) e.max = ms; if (ok) e.fertig++;
        return ok;
    };
}
window.__kb.an = true; window.__kb.je.clear(); window.__kb.del = 0; return 1;`;
const KB_LESEN = `const G = window.__kb; G.an = false; const a = [...G.je.values()].sort((x, y) => y.ms - x.ms);
const s = (f) => +a.reduce((t, e) => t + f(e), 0).toFixed(1);
return { schluessel: a.length, ms: s((e) => e.ms), schritte: s((e) => e.n), fertig: s((e) => e.fertig), wieder: a.filter((e) => e.vor > 0).length,
    wiederMs: s((e) => (e.vor > 0 ? e.ms : 0)), geloeschtImGang: G.del,
    top: a.slice(0, 7).map((e) => [e.name.slice(0, 70), +e.ms.toFixed(1), e.n, +e.max.toFixed(1), e.vor, e.weg]) };`;

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
        const ev = (code) => {
            const out = wb(["eval", code], 60);
            try {
                return JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1)).ergebnis;
            } catch {
                return { fehler: out.slice(0, 200) };
            }
        };
        const knoten = (name, gang) => {
            const k = ev(KB_LESEN);
            zeile(
                `GEH ROT ${name} Knoten-Bau ${gang}: ${k.schluessel} Schlüssel · Σ ${k.ms} ms in ${k.schritte} Schritten · ${k.fertig} fertig · ` +
                    `${k.wieder} davon standen vor dem Gang schon im Cache (Σ ${k.wiederMs} ms) · im Gang ${k.geloeschtImGang} Einträge gelöscht · ` +
                    `[Stoff|Klasse|Pass ms Schritte max vorher gelöscht]: ${JSON.stringify(k.top || k)}`
            );
        };
        const lauf = (name) => {
            const out = wb(
                ["lauf", "6", "--ein", "0.5", "--wandern", "bahn", "--regler", "voll", "--tiere", "frei"],
                120
            );
            let l = null;
            try {
                l = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
            } catch {
                l = null;
            }
            if (!l || !l.frameMs)
                return ((gruen = false), zeile(`GEH ROT ${name} Lauf ohne JSON: ${out.slice(0, 300)}`));
            const ok = l.frameMs.p95 <= 33.4;
            gruen = gruen && ok;
            const b = l.belegung || {};
            zeile(
                `GEH ${ok ? "GRÜN" : "ROT"} ${name} Lauf 6 s: Bild ${q(l.frameMs)} · CPU ${q(l.cpuTaktMs)} · GPU ${q(l.gpuMs)} (n ${l.gpuMs.n}) · ` +
                    `Durchsatz ${q(l.gpuDurchsatzMs)} · Befehle p95 ${l.befehle.p95} · Dreiecke p95 ${l.dreiecke.p95} · Belegung ${q(b.belegungMs)} · ` +
                    `außer Takt ${q(b.ausserTaktMs)} · Weg ${l.bahnM} m · Phasen ${JSON.stringify(l.phasenEwmaMs)}`
            );
        };
        const name = "wiese-ego",
            json = path.join(D, `${name}.json`);
        wb(["umstellen", "--ort", "wiese", "--sicht", "ego"], 300);
        ev(KB_AN);
        wb(
            [
                "haenger",
                "--sek",
                SEK,
                "--ein",
                "0.5",
                "--wandern",
                "bahn",
                "--schwelle",
                "33",
                "--regler",
                "voll",
                "--tiere",
                "frei",
                "--json",
                json,
            ],
            180
        );
        const rohDatei = json.replace(/\.json$/, ".roh.json");
        if (fs.existsSync(rohDatei)) {
            const { roh, spur } = JSON.parse(fs.readFileSync(rohDatei, "utf8"));
            const h = HL.linseWerten(roh, spur, { schwelle: 33 }),
                s = HL.linseWerten(roh, spur, { spitze: true });
            const U = h.frameMs.p95 <= 33.4 ? "GRÜN" : "ROT";
            zeile(
                `GEH ${U} ${name} Profil: Bild ${q(h.frameMs)} · CPU-Takt ${q(h.taktMs)} · >33: ${h.haengerN} von ${h.frames} · Ursachen [n Σms max]: ` +
                    h.jeUrsache
                        .slice(0, 7)
                        .map((e) => `${e.n} ${e.summeMs} ${e.maxMs} ${e.ursache}`)
                        .join(" | ")
            );
            for (const z of baumZeilen(s.zeilen, `GEH ${U} ${name}`, 5)) zeile(z);
        } else ((gruen = false), zeile(`GEH ROT ${name}: die Hänger-Linse lieferte nichts`));
        knoten(name, "Gang 1");
        ev(KB_AN);
        lauf(name);
        knoten(name, "Gang 2 (dieselbe Bahn)");
        wb(["umstellen", "--ort", "genesis", "--sicht", "third"], 300);
        lauf("genesis-third");
    } catch (e) {
        gruen = false;
        zeile(`GEH ROT Error ${String((e && e.stack) || e).slice(0, 400)} · ${tor.log.slice(-300)}`);
    } finally {
        tor.stop();
    }
    process.exit(gruen ? 0 : 1);
})();
