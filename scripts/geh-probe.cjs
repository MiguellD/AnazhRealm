#!/usr/bin/env node
// geh-probe.cjs — DIE ZERLEGUNG DES GANGS UND DER FAHRT auf der echten GPU (profiband.K4, die Glätte am Genesis-Ring): EINE Werkbank am
// Tor; je Zelle frisch umgestellt, dann das Fenster wie die Station (`haenger`, 0,3 s Einschwingen, Regler des Spielers, Tiere frei) mit
// der Spur — aus DERSELBEN Spur zwei Urteile: die Hänger-Linse (jedes Bild über 33 ms mit Klasse TAKT · NEBEN · GC · GPU und Engstelle)
// und die Takt-Spitze (je Rahmen ms je Takt ab p95 gegen die Mitte, `HL.linseWerten(…, {spitze})`). Die Zellen: Gehen (Bahn, V alle
// 0,75 s, PB_SEITE.k4geh), die Fahrt im GT Ego und Third (20 m/s, E aus 1 s nach dem Aufsitzen, E ein 1 s später, PB_SEITE.k4fahrt).
// Zeilen „GEH …“ ≤ 590 Zeichen (der GPU-Probe-Dienst postet die letzten zehn mit Urteil).
// Exit 0 nur, wenn jede Zelle ≤ 1 % Bilder über 33 ms und keines über 100 ms hält (die Staffel 2 von profiband.K4).
//   node scripts/geh-probe.cjs [--port 4793] [--sek 4]     (npm run gate:geh-zerlegung; je Push nimmt der freie Läufer sie)
"use strict";
const fs = require("fs");
const path = require("path");
const { werkbankTor } = require("./lib/welt-boot.cjs");
const HL = require("./lib/haenger-linse.cjs");

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const PORT = Number(arg("--port", 4793));
const D = path.resolve("artifacts", "geh-probe");
fs.mkdirSync(D, { recursive: true });
const zeile = (s) => console.log(s.replace(/\s+/g, " ").slice(0, 590));
const q = (z) => (z ? [z.p50, z.p95, z.p99, z.max].join("/") : "?");
const json = (out) => {
    try {
        return JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
    } catch {
        return null;
    }
};
let vorStand = "";
// der Teilbaum unter jedem Rahmen `wurzel` der Takt-Spitze (`zeilen` in Tiefen-Reihe): je relative Tiefe × Name die Summe
// Spitze/Mitte, ab `min` ms in einer der beiden; voran die Wurzel selbst
const teilbaum = (s, wurzel, tief = 3, min = 0.3) => {
    const m = new Map([["0", { s: 0, m: 0 }]]);
    const z = s.zeilen;
    for (let i = 0; i < z.length; i++) {
        if (!wurzel.test(kurz(z[i].name))) continue;
        m.get("0").s += z[i].spitzeMs;
        m.get("0").m += z[i].mitteMs;
        for (let j = i + 1; j < z.length && z[j].tiefe > z[i].tiefe; j++) {
            const d = z[j].tiefe - z[i].tiefe;
            if (d > tief) continue;
            const k = d + kurz(z[j].name);
            const x = m.get(k) || { s: 0, m: 0 };
            x.s += z[j].spitzeMs;
            x.m += z[j].mitteMs;
            m.set(k, x);
        }
    }
    return [...m]
        .filter(([k, x]) => k === "0" || x.s >= min || x.m >= min)
        .map(([k, x]) => `${k} ${x.s.toFixed(1)}/${x.m.toFixed(1)}`)
        .join(" · ");
};
const kurz = (n) =>
    String(n)
        .replace(/ \[[^\]]*\]/g, "")
        .slice(0, 40);

// die Tasten der Station (punkte-maschine g6.js PB_SEITE k4geh · k4fahrt): V alle 0,75 s im Gehen; in der Fahrt E aus 1 s nach dem
// Aufsitzen, E ein 1 s später — der Sattel des Stroms geht 1 → 0 → 1
const TASTE = 'const t = (c, k) => { for (const a of ["keydown", "keyup"]) window.dispatchEvent(new KeyboardEvent(a, { bubbles: true, code: c, key: k })); }; '; // prettier-ignore
const SEITE = {
    geh: `clearInterval(window.__k4iv); const z = (window.__k4 = { v: 0 }); ${TASTE} window.__k4iv = setInterval(() => { t("KeyV", "v"); z.v++; }, 750); setTimeout(() => clearInterval(window.__k4iv), 5000); return 1;`, // prettier-ignore
    fahrt: `clearInterval(window.__k4iv); const z = (window.__k4 = { wagen: "-", aus: "-", ein: "-" }); ${TASTE} const bis = performance.now() + 20000; const iv = setInterval(() => { if (st.player.mountedArch !== "werkbank-fahrt" && performance.now() < bis) return; clearInterval(iv); setTimeout(() => { z.wagen = st.player.mountedArch; t("KeyE", "e"); setTimeout(() => { z.aus = st.player.mountedArch; t("KeyE", "e"); setTimeout(() => { z.ein = st.player.mountedArch; }, 300); }, 1000); }, 1000); }, 50); return 1;`, // prettier-ignore
};
const SEK = arg("--sek", "4");

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
        const ev = (code) => (json(wb(["eval", code], 60)) || {}).ergebnis;
        const zelle = (name, wandern, code) => {
            const j = path.join(D, name.replace(/\W+/g, "-") + ".json");
            ev(code);
            wb(
                [
                    "haenger",
                    SEK,
                    "--ein",
                    "0.3",
                    "--wandern",
                    wandern,
                    "--regler",
                    "frei",
                    "--tiere",
                    "frei",
                    "--schwelle",
                    "33",
                    "--json",
                    j,
                ],
                240
            );
            if (!fs.existsSync(j)) return ((gruen = false), zeile(`GEH ROT ${name}: das Fenster lieferte kein JSON`));
            const a = JSON.parse(fs.readFileSync(j, "utf8"));
            const { roh, spur } = JSON.parse(fs.readFileSync(j.replace(/\.json$/, ".roh.json"), "utf8"));
            const s = HL.linseWerten(roh, spur, { spitze: true });
            const anteil = a.frames ? a.haengerN / a.frames : 1;
            const ok = anteil <= 0.01 && a.frameMs.max <= 100;
            const stand = vorStand;
            vorStand = "";
            gruen = gruen && ok;
            const kb = a.knotenBau || {},
                pp = a.pipelines || {};
            zeile(
                `GEH ${ok ? "GRÜN" : "ROT"} ${name}: ${stand}Bild p50/95/99/max ${q(a.frameMs)} · ${(100 * anteil).toFixed(1)} % > 33 ms · ` +
                    `Takt ${q(a.taktMs)} · ${a.frames} Bilder · Weg ${roh.bahnM} m · Tasten ${JSON.stringify(ev("return window.__k4 || null"))} · ` +
                    `> 33 ms ${a.haengerN} (${Object.entries(a.jeKlasse)
                        .map(([k, v]) => k + " " + v)
                        .join(" ")}) · Bau ${kb.sync} Σ ${kb.ms} ms ` + // prettier-ignore
                    `${JSON.stringify(Object.entries(kb.jeAuftragMs || {}).slice(0, 4))} · Pipe sync ${pp.sync} · Ursachen ` +
                    a.jeUrsache
                        .slice(0, 5)
                        .map((e) => `${e.n}× ${e.summeMs}/${e.maxMs} ${e.ursache}`)
                        .join(" | ")
            );
            // der Kopf des Takts (die Kinder des Spiel-Takts bis zwei Ebenen, ms je Takt ab p95 / in der Mitte, ab 1 ms)
            zeile(
                `GEH ${ok ? "GRÜN" : "ROT"} ${name} Takt ab p95 ${s.spitzeN}/${s.takte} Takte, CPU ${JSON.stringify(s.cpuMs)}: ` +
                    s.zeilen
                        .filter((z) => z.tiefe <= 1 && (z.spitzeMs >= 1 || z.mitteMs >= 1))
                        .map((z) => `${z.tiefe}${kurz(z.name)} ${z.spitzeMs.toFixed(1)}/${z.mitteMs.toFixed(1)}`)
                        .join(" · ")
            );
            // die Zeichnung (der Vendor-Rahmen unter dem Takt, bis drei Ebenen, ab 1 ms) und die teuersten Selbst-Rahmen aller Hänger
            // (je Hänger sein Anteil an dt, summiert)
            const selbst = new Map();
            for (const h of a.haenger || [])
                for (const x of h.selbst || []) selbst.set(x.name, (selbst.get(x.name) || 0) + (x.pct * h.dt) / 100);
            zeile(
                `GEH ${ok ? "GRÜN" : "ROT"} ${name} Zeichnung: ${teilbaum(s, /^_renderScene$/, 3, 1)} ‖ Selbst ` +
                    [...selbst]
                        .sort((x, y) => y[1] - x[1])
                        .slice(0, 6)
                        .map(([n, ms]) => `${kurz(n)} ${Math.round(ms)}`)
                        .join(" · ")
            );
        };
        // der Stand vor dem ersten Fenster (wie die Station: das Anker-Fenster nach dem Umstellen) — Bild, GPU und Phasen als Bezug
        const steh = (ort, sicht) => {
            wb(["umstellen", "--ort", ort, "--sicht", sicht], 300);
            const l = json(wb(["lauf", "2", "--ein", "0.3", "--regler", "voll", "--tiere", "frei"], 120)) || {};
            vorStand = `Stand Bild ${q(l.frameMs)} GPU ${q(l.gpuMs)} · `;
        };
        steh("genesis", "ego");
        zelle("genesis Gehen", "bahn", SEITE.geh);
        wb(["umstellen", "--ort", "genesis", "--sicht", "ego"], 300);
        zelle("genesis Fahrt Ego", "fahrt", SEITE.fahrt);
        wb(["umstellen", "--ort", "genesis", "--sicht", "third"], 300);
        zelle("genesis Fahrt Third", "fahrt", SEITE.fahrt);
    } catch (e) {
        gruen = false;
        zeile(`GEH ROT Error ${String((e && e.stack) || e).slice(0, 400)} · ${tor.log.slice(-300)}`);
    } finally {
        tor.stop();
    }
    process.exit(gruen ? 0 : 1);
})();
