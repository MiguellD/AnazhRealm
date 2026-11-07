#!/usr/bin/env node
// geh-probe.cjs — DAS BILD BEIM GEHEN auf der echten GPU (profiband.K1#1, leib.K1#1): EINE Werkbank am Tor, je Zelle des Gangs
// (Wiese Ego, Genesis Third) die Hänger-Linse über 33 ms auf der Bahn (4 m/s, Regler voll, Tiere frei) und derselbe Lauf als
// Takt-Spitze, danach ein Lauf mit den GPU-Stempeln. Je Zelle vier Zeilen „GEH …“ (≤ 600 Zeichen: der GPU-Probe-Dienst postet
// die letzten zehn Zeilen mit Urteil). Exit 0 nur, wenn jede Zelle Bild-p95 ≤ 33 ms hält.
//   node scripts/geh-probe.cjs [--port 4793] [--sek 10]          (npm run gate:geh-zerlegung; je Push nimmt der freie Läufer sie)
"use strict";
const fs = require("fs");
const path = require("path");
const { werkbankTor } = require("./lib/welt-boot.cjs");
const HL = require("./lib/haenger-linse.cjs");

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const PORT = Number(arg("--port", 4793)),
    SEK = String(arg("--sek", 10));
const ZELLEN = [
    ["wiese", "ego"],
    ["genesis", "third"],
];
const D = path.resolve("artifacts", "geh-probe");
fs.mkdirSync(D, { recursive: true });
const r1 = (x) => (Number.isFinite(x) ? +x.toFixed(1) : x);
const q = (z) => (z ? [z.p50, z.p95, z.p99, z.max].map(r1).join("/") : "?");
const zeile = (s) => console.log(s.replace(/\s+/g, " ").slice(0, 590));

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
        for (const [ort, sicht] of ZELLEN) {
            const name = `${ort}-${sicht}`,
                json = path.join(D, `${name}.json`);
            wb(["umstellen", "--ort", ort, "--sicht", sicht], 300);
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
            if (!fs.existsSync(rohDatei)) {
                gruen = false;
                zeile(`GEH ROT ${name}: die Hänger-Linse lieferte nichts`);
                continue;
            }
            const { roh, spur } = JSON.parse(fs.readFileSync(rohDatei, "utf8"));
            const h = HL.linseWerten(roh, spur, { schwelle: 33 }),
                s = HL.linseWerten(roh, spur, { spitze: true });
            const ok = h.frameMs.p95 <= 33.4;
            gruen = gruen && ok;
            const U = ok ? "GRÜN" : "ROT";
            const kb = h.knotenBau || {},
                pp = h.pipelines || {};
            zeile(
                `GEH ${U} ${name} Bild p50/95/99/max ${q(h.frameMs)} · CPU-Takt ${q(h.taktMs)} · ${h.frames} Bilder ${h.takte} Takte · >33: ${h.haengerN} ` +
                    `(${Object.entries(h.jeKlasse)
                        .map(([k, v]) => `${k} ${v}`)
                        .join(
                            " "
                        )}) · Weg ${roh.bahnM} m · Pipelines sync ${pp.sync}/async ${pp.async}/Shader ${pp.shader} · ` +
                    `Knoten-Bau ${kb.sync} Σ ${kb.ms} max ${kb.maxMs} ms · ${Object.entries(kb.jeAuftragMs || {})
                        .slice(0, 3)
                        .map(([k, v]) => `${k} ${v}`)
                        .join(" · ")}`
            );
            zeile(
                `GEH ${U} ${name} Ursachen >33 [n Σms max]: ` +
                    h.jeUrsache
                        .slice(0, 8)
                        .map((e) => `${e.n} ${e.summeMs} ${e.maxMs} ${e.ursache}`)
                        .join(" | ") +
                    ` · je Hänger [dt Klasse TAKT/NEBEN/GC/GPU]: ` +
                    h.haenger
                        .slice(0, 6)
                        .map(
                            (x) =>
                                `${x.dt} ${x.klasse} ${x.zeiten.TAKT}/${x.zeiten.NEBEN}/${x.zeiten.GC}/${x.zeiten.GPU}`
                        )
                        .join(", ")
            );
            zeile(
                `GEH ${U} ${name} Takt-Spitze CPU ${q(s.cpuMs)} (Spitze·Mitte ms): ` +
                    s.zeilen
                        .filter((e) => e.tiefe <= 3 && e.spitzeMs >= 0.5)
                        .slice(0, 18)
                        .map((e) => `${"›".repeat(e.tiefe)}${e.name.split(" ")[0]} ${e.spitzeMs}·${e.mitteMs}`)
                        .join(" ") +
                    ` · TÄTER ${
                        s.taeter
                            .slice(0, 4)
                            .map((t) => `${t.name} ${t.spitzeMs}·${t.mitteMs}`)
                            .join(" | ") || "keiner"
                    }`
            );
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
            zeile(
                l
                    ? `GEH ${U} ${name} Lauf 6 s: Bild ${q(l.frameMs)} · CPU ${q(l.cpuTaktMs)} · GPU ${q(l.gpuMs)} (n ${l.gpuMs.n}, ${l.gpuMs.quelle}) · Durchsatz ${q(l.gpuDurchsatzMs)} · ` +
                          `Leine aus ${l.leine.ausgesetztPct} % · Befehle p95 ${l.befehle.p95} · Dreiecke p95 ${l.dreiecke.p95} · Belegung ${q(l.belegung && l.belegung.belegungMs)} · außer Takt ${q(l.belegung && l.belegung.ausserTaktMs)} · ` +
                          `Pflicht ${q(l.belegung && l.belegung.pflichtMs)} · Weg ${l.bahnM} m · Skala ${l.stellgroessen.szeneSkala} · Last ${l.stellgroessen.loadScale}`
                    : `GEH ROT ${name} Lauf ohne JSON: ${out.slice(0, 300)}`
            );
        }
    } catch (e) {
        gruen = false;
        zeile(`GEH ROT Error ${String((e && e.stack) || e).slice(0, 400)} · ${tor.log.slice(-300)}`);
    } finally {
        tor.stop();
    }
    process.exit(gruen ? 0 : 1);
})();
