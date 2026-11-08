#!/usr/bin/env node
// geh-probe.cjs — DIE ZERLEGUNG DES GEHENS auf der echten GPU (profiband.K1#1): EINE Werkbank am Tor; je Ort frisch umgestellt,
// 2 s gestanden wie die Station, dann der Gang (`haenger`, Bahn, 4 s nach 0,5 s, Regler voll, Tiere frei) mit der Spur — aus
// DERSELBEN Spur zwei Urteile: die Hänger-Linse (jedes Bild über 33 ms mit Klasse TAKT · NEBEN · GC · GPU und Engstelle) und die
// Takt-Spitze (je Rahmen ms je Takt ab p95 gegen die Mitte, `HL.linseWerten(…, {spitze})`). Wiese Ego erster und zweiter Gang,
// Genesis Third erster Gang. Zeilen „GEH …“ ≤ 590 Zeichen (der GPU-Probe-Dienst postet die letzten zehn mit Urteil).
// Exit 0 nur, wenn jeder Gang Bild-p95 ≤ 33 ms hält.
//   node scripts/geh-probe.cjs [--port 4793]          (npm run gate:geh-zerlegung; je Push nimmt der freie Läufer sie)
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
// Spitze/Mitte, ab 0,3 ms in einer der beiden; voran die Wurzel selbst
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
        const gang = (name) => {
            const j = path.join(D, name.replace(/\W+/g, "-") + ".json");
            wb(
                [
                    "haenger",
                    "4",
                    "--ein",
                    "0.5",
                    "--wandern",
                    "bahn",
                    "--regler",
                    "voll",
                    "--tiere",
                    "frei",
                    "--schwelle",
                    "33",
                    "--json",
                    j,
                ],
                180
            );
            if (!fs.existsSync(j)) return ((gruen = false), zeile(`GEH ROT ${name}: der Gang lieferte kein JSON`));
            const a = JSON.parse(fs.readFileSync(j, "utf8"));
            const { roh, spur } = JSON.parse(fs.readFileSync(j.replace(/\.json$/, ".roh.json"), "utf8"));
            const s = HL.linseWerten(roh, spur, { spitze: true });
            const ok = a.frameMs.p95 <= 33.4;
            const stand = vorStand;
            vorStand = "";
            gruen = gruen && ok;
            const kb = a.knotenBau || {},
                pp = a.pipelines || {};
            zeile(
                `GEH ${ok ? "GRÜN" : "ROT"} ${name}: ${stand}Bild p50/95/99/max ${q(a.frameMs)} · Takt ${q(a.taktMs)} · ${a.frames} Bilder · ` +
                    `> 33 ms ${a.haengerN} (${Object.entries(a.jeKlasse)
                        .map(([k, v]) => k + " " + v)
                        .join(" ")}) · Bau ${kb.sync} Σ ${kb.ms} ms ` +
                    `${JSON.stringify(Object.entries(kb.jeAuftragMs || {}).slice(0, 3))} · Pipe sync ${pp.sync} · Ursachen ` +
                    a.jeUrsache
                        .slice(0, 6)
                        .map((e) => `${e.n}× ${e.summeMs}/${e.maxMs} ${e.ursache}`)
                        .join(" | ")
            );
            // die Teilbäume der zwei Blöcke des Haupt-Fadens (je Rahmen ms je Takt ab p95 / in der Mitte, bis drei Ebenen tief,
            // über jedes Vorkommen der Wurzel summiert): die Sicht je Pass und der Takt-Planer
            for (const [wort, wurzel] of [
                ["Sicht", /^_passSicht$/],
                ["Planer", /^_runFrameScheduler$/],
            ])
                zeile(
                    `GEH ${ok ? "GRÜN" : "ROT"} ${name} ${wort} ab p95 ${s.spitzeN}/${s.takte} Takte: ${teilbaum(s, wurzel)}`
                );
        };
        // der Stand vor dem ersten Gang (wie die Station: 2 s nach dem Umstellen) — Bild, GPU und Phasen als Bezug des Gangs
        const steh = (ort, sicht) => {
            wb(["umstellen", "--ort", ort, "--sicht", sicht], 300);
            const l = json(wb(["lauf", "2", "--ein", "0.3", "--regler", "voll", "--tiere", "frei"], 120)) || {};
            vorStand = `Stand Bild ${q(l.frameMs)} GPU ${q(l.gpuMs)} Phasen ${JSON.stringify(l.phasenEwmaMs || {})} · `;
        };
        steh("wiese", "ego");
        gang("wiese-ego Gang 1");
        gang("wiese-ego Gang 2");
        steh("genesis", "third");
        gang("genesis-third Gang 1");
    } catch (e) {
        gruen = false;
        zeile(`GEH ROT Error ${String((e && e.stack) || e).slice(0, 400)} · ${tor.log.slice(-300)}`);
    } finally {
        tor.stop();
    }
    process.exit(gruen ? 0 : 1);
})();
