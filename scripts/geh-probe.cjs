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
        if (process.argv.includes("--ab")) {
            // DAS A/B IN EINER WELT (`--ab`, npm run gate:geh-ab): je Besuch der Sicht-Satz der Wiese von main (A, der Quelltext
            // geh-probe-alt.txt) oder des Zweigs (B), dann umgestellt, 2 s Stand, der erste Gang 4 s ohne Profil — Wiese Ego und Genesis
            // Third im Wechsel (jeder Besuch nach dem anderen Ort: die Kacheln der Wiese wachsen neu wie in der Station), Folge A B B A
            const ALT = fs.readFileSync(path.join(__dirname, "geh-probe-alt.txt"), "utf8");
            const ev = (code) => (json(wb(["eval", code], 60)) || {}).ergebnis;
            const setze = (alt) =>
                ev(
                    "const P = Object.getPrototypeOf(r); P.__neuSicht = P.__neuSicht || P._nahWieseSicht; " +
                        `P._nahWieseSicht = ${alt ? ALT : "P.__neuSicht"}; const nw = r.state.nahWiese; ` +
                        "if (nw) { nw.fernHalt = null; nw.neu = true; } return String(P._nahWieseSicht).includes('_nahWieseFernSatz');"
                );
            const M = { A: {}, B: {} };
            for (const [i, v] of ["A", "B", "B", "A"].entries())
                for (const [ort, sicht] of [
                    ["wiese", "ego"],
                    ["genesis", "third"],
                ]) {
                    const neu = setze(v === "A");
                    if (neu !== (v === "B")) throw new Error(`Variante ${v} nicht gesetzt (neu ${neu})`);
                    wb(["umstellen", "--ort", ort, "--sicht", sicht], 300);
                    wb(["lauf", "2", "--ein", "0.3", "--regler", "voll", "--tiere", "frei"], 120);
                    const l = json(wb(["lauf", "4", "--ein", "0.5", "--wandern", "bahn", "--regler", "voll", "--tiere", "frei"], 120)) || {}; // prettier-ignore
                    (M[v][ort] = M[v][ort] || []).push({
                        i,
                        bild: l.frameMs,
                        cpu: l.cpuTaktMs,
                        gpu: l.gpuMs,
                        n: l.frames,
                        weg: l.bahnM,
                    });
                }
            const med = (a) => a.slice().sort((x, y) => x - y)[(a.length - 1) >> 1];
            for (const ort of ["wiese", "genesis"]) {
                const z = (v, k, p) => M[v][ort].map((x) => (x[k] ? x[k][p] : NaN));
                const [a, b] = [med(z("A", "bild", "p95")), med(z("B", "bild", "p95"))];
                const ok = b <= 33.4;
                gruen = gruen && ok;
                zeile(
                    `GEH-AB ${ok ? "GRÜN" : "ROT"} ${ort} erster Gang, Median der Besuche: Bild-p95 A ${a} → B ${b} ms · ` +
                        ["A", "B"]
                            .map(
                                (v) =>
                                    `${v}: Bild p50/p95 ${z(v, "bild", "p50").join(",")} / ${z(v, "bild", "p95").join(",")} · ` +
                                    `CPU p50/p95 ${z(v, "cpu", "p50").join(",")} / ${z(v, "cpu", "p95").join(",")} · GPU p95 ${z(v, "gpu", "p95").join(",")} · ` +
                                    `Bilder ${M[v][ort].map((x) => x.n).join(",")} · Weg ${M[v][ort].map((x) => x.weg).join(",")}`
                            )
                            .join(" ‖ ")
                );
            }
        } else {
            steh("wiese", "ego");
            gang("wiese-ego Gang 1");
            gang("wiese-ego Gang 2");
            steh("genesis", "third");
            gang("genesis-third Gang 1");
        }
    } catch (e) {
        gruen = false;
        zeile(`GEH ROT Error ${String((e && e.stack) || e).slice(0, 400)} · ${tor.log.slice(-300)}`);
    } finally {
        tor.stop();
    }
    process.exit(gruen ? 0 : 1);
})();
