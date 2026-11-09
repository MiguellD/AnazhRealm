#!/usr/bin/env node
// geh-probe.cjs — DIE ZERLEGUNG DES GANGS UND DER FAHRT auf der echten GPU (profiband.K4, Programm-Katalog Atlas §3): EINE Werkbank
// am Tor je Boot (kalt, zwei Boots: das A/B des Zweigs gegen main braucht mehr als einen Wurf der ersten Fahrt); je Zelle frisch
// umgestellt, dann das Fenster wie die Station (`haenger`, 0,3 s Einschwingen, Regler des Spielers, Tiere frei). Die Zellen: Gehen
// (Bahn, V alle 0,75 s), die erste Fahrt im GT Ego und die Fahrt Third (20 m/s, E aus 1 s nach dem Aufsitzen, E ein 1 s später).
// Je Zelle drei Zeilen: das Bild, der Bau im Fenster (Knoten-Bauten, Pipelines, Vorwärm-Stand) und DIE SPITZE — die drei längsten
// Bilder je beim Namen: Dauer, Klasse und Engstelle, die teuersten Selbst-Rahmen, die Knoten-Bau-Schritte und Pipelines in ihm.
// Zeilen „GEH …“ ≤ 590 Zeichen (der GPU-Probe-Dienst postet die letzten zehn mit Urteil: die Kern-Zeilen stehen am Ende).
// Exit 0 nur, wenn jede Zelle ≤ 1 % Bilder über 33 ms und keines über 100 ms hält (die Staffel 2 von profiband.K4).
//   node scripts/geh-probe.cjs [--port 4793] [--sek 4] [--boots 2]     (npm run gate:geh-zerlegung)
"use strict";
const fs = require("fs");
const path = require("path");
const { werkbankTor } = require("./lib/welt-boot.cjs");
const HL = require("./lib/haenger-linse.cjs");

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const PORT0 = Number(arg("--port", 4793));
const D = path.resolve("artifacts", "geh-probe");
fs.mkdirSync(D, { recursive: true });
const kern = [];
const zeile = (s) => (console.log((s = s.replace(/\s+/g, " ").slice(0, 590))), kern.push(s));
const q = (z) => (z ? [z.p50, z.p95, z.p99, z.max].join("/") : "?");
const json = (out) => {
    try {
        return JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
    } catch {
        return null;
    }
};
const kurz = (n) =>
    String(n)
        .replace(/ \[[^\]]*\]/g, "")
        .slice(0, 28);
const TASTE = 'const t = (c, k) => { for (const a of ["keydown", "keyup"]) window.dispatchEvent(new KeyboardEvent(a, { bubbles: true, code: c, key: k })); }; '; // prettier-ignore
const SEITE = {
    geh: `clearInterval(window.__k4iv); ${TASTE} window.__k4iv = setInterval(() => t("KeyV", "v"), 750); setTimeout(() => clearInterval(window.__k4iv), 5000); return 1;`, // prettier-ignore
    fahrt: `clearInterval(window.__k4iv); ${TASTE} const bis = performance.now() + 20000; const iv = setInterval(() => { if (st.player.mountedArch !== "werkbank-fahrt" && performance.now() < bis) return; clearInterval(iv); setTimeout(() => { t("KeyE", "e"); setTimeout(() => t("KeyE", "e"), 1000); }, 1000); }, 50); return 1;`, // prettier-ignore
};
// DER BAU-STAND der Erst-Zeichnung: fertige Knoten-Bauten, ihre Zeit, asynchrone Pipelines, das Vorwärm-Gesetz (gebaut, offen)
const BAU = "const E = r._erstZeichnung || {}; return [E.bauN | 0, +(E.bauMs || 0).toFixed(1), E.pipeAsync | 0, E.vorwaermN | 0, E.vorwaerm ? E.vorwaerm.size : -1, E.vorwaermRufe | 0];"; // prettier-ignore

function boot(nr) {
    const PORT = PORT0 + nr;
    const tor = werkbankTor(PORT);
    const wb = (args, s) => {
        const o = tor.rufe([...args, "--port", String(PORT)], s * 1000);
        fs.appendFileSync(path.join(D, "werkbank.log"), `\n$ ${args.join(" ")}\n${o.stdout}${o.stderr}`);
        return o.stdout || "";
    };
    const ev = (code) => (json(wb(["eval", code], 60)) || {}).ergebnis;
    const bauStand = () => ev(BAU) || [0, 0, 0, 0, -1, 0];
    let gruen = true;
    const zelle = (name, wandern, code, vor) => {
        const j = path.join(D, `${nr}-${name.replace(/\W+/g, "-")}.json`);
        const bv = bauStand();
        ev(code);
        wb(["haenger", arg("--sek", "4"), "--ein", "0.3", "--wandern", wandern, "--regler", "frei", "--tiere", "frei", "--schwelle", "33", "--json", j], 240); // prettier-ignore
        if (!fs.existsSync(j)) return ((gruen = false), zeile(`GEH ROT ${nr} ${name}: das Fenster lieferte kein JSON`));
        const a = JSON.parse(fs.readFileSync(j, "utf8"));
        const { roh } = JSON.parse(fs.readFileSync(j.replace(/\.json$/, ".roh.json"), "utf8"));
        const bn = bauStand();
        const anteil = a.frames ? a.haengerN / a.frames : 1;
        const ok = anteil <= 0.01 && a.frameMs.max <= 100;
        gruen = gruen && ok;
        const kb = a.knotenBau || {};
        const U = `GEH ${ok ? "GRÜN" : "ROT"} ${nr} ${name}`;
        zeile(`${U}: ${vor}Bild p50/95/99/max ${q(a.frameMs)} · ${(100 * anteil).toFixed(1)} % > 33 ms · Takt ${q(a.taktMs)} · ${a.frames} Bilder · Weg ${roh.bahnM} m · Ursachen ${a.jeUrsache.slice(0, 3).map((e) => `${e.n}× ${e.summeMs}/${e.maxMs} ${e.ursache}`).join(" | ")}`); // prettier-ignore
        zeile(`${U} Bau: Knoten ${bn[0] - bv[0]} Σ ${(bn[1] - bv[1]).toFixed(1)} ms, max-Schritt ${kb.maxMs} ms, ${kb.ueber16} > 16,7 · Pipelines ${bn[2] - bv[2]} · vorgewärmt davor ${bv[3]} offen ${bv[4]} im Fenster ${bn[3] - bv[3]} (Rufe ${bn[5] - bv[5]}) · je Auftrag ${JSON.stringify(Object.entries(kb.jeAuftragMs || {}).slice(0, 4))}`); // prettier-ignore
        // DIE SPITZE: die drei längsten Bilder, je ihr Fenster der Rohdaten (Knoten-Bau-Schritte mit ms, Pipelines)
        const t0 = roh.tMess[0];
        const spitze = (a.haenger || [])
            .sort((x, y) => y.dt - x.dt)
            .slice(0, 3)
            .map((h) => {
                const im = (roh.namen || []).filter((x) => x.t >= t0 + h.t && x.t < t0 + h.t + h.dt);
                const bau = im.filter((x) => x.art === "bau").map((x) => `${x.pass} ${kurz(x.klasse || x.n)} ${x.ms}`);
                const pipe = im.filter((x) => x.art !== "bau").map((x) => `${x.art} ${kurz(x.klasse || x.n)}`);
                return `${h.dt} ms @${h.t} ${h.klasse} ${h.pfad.slice(-2).map((p) => kurz(p.name)).join("›")} selbst ${h.selbst.map((s) => `${kurz(s.name)} ${s.pct}%`).join(",")} bau [${bau.slice(0, 3).join(",")}] pipe [${pipe.slice(0, 3).join(",")}]`; // prettier-ignore
            });
        zeile(`${U} Spitze: ${spitze.join(" ‖ ")}`);
    };
    return tor.bereit.then(
        () => {
            console.log((/\[linse-gpu\][^\r\n]*/.exec(tor.log) || ["[linse-gpu] ungenannt"])[0]);
            wb(["umstellen", "--ort", "genesis", "--sicht", "ego"], 300);
            const an = ev("const s = r.state; return [Math.round(s._weltbildDa || -1), Math.round(s._fernbildDa || -1)];") || []; // prettier-ignore
            const b0 = bauStand();
            zelle("Gehen", "bahn", SEITE.geh, `Ankunft ${an[0]} ms (Ferne ${an[1]}) · Knoten ${b0[0]} Σ ${b0[1]} ms · Pipelines ${b0[2]} · `); // prettier-ignore
            wb(["umstellen", "--ort", "genesis", "--sicht", "ego"], 300);
            zelle("Fahrt Ego", "fahrt", SEITE.fahrt, "");
            wb(["umstellen", "--ort", "genesis", "--sicht", "third"], 300);
            zelle("Fahrt Third", "fahrt", SEITE.fahrt, "");
            tor.stop();
            return gruen;
        },
        (e) => (tor.stop(), Promise.reject(e))
    );
}

(async () => {
    let gruen = true;
    try {
        for (let nr = 1; nr <= Number(arg("--boots", 2)); nr++) gruen = (await boot(nr)) && gruen;
    } catch (e) {
        gruen = false;
        zeile(`GEH ROT Error ${String((e && e.stack) || e).slice(0, 400)}`);
    } finally {
        for (const k of kern.filter((k) => /Ego|Ankunft/.test(k))) console.log(k);
    }
    process.exit(gruen ? 0 : 1);
})();
