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
// der Rahmen-Baum der Takt-Spitze in Zeilen: ein Rahmen, der nur seinen Namensvetter trägt (renderer.x › x), fällt in ihn
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
        stapel[e.tiefe] = { k, t };
        if (gleich || !(e.mitteMs >= 0.3 || e.spitzeMs >= 1.5)) continue;
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
            for (const z of baumZeilen(s.zeilen, `GEH ${U} ${name}`, 6)) zeile(z);
        } else ((gruen = false), zeile(`GEH ROT ${name}: die Hänger-Linse lieferte nichts`));
        lauf(name);
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
