#!/usr/bin/env node
// probe-lokal.cjs — EINE Probe der Sitzung gegen eine lokal stehende Welt (save-server :S, `werkbank start --echt` :S+20000 unter
// Xvfb, swiftshader). Fährt über fahreStation der Punkte-Maschine (dieselbe Umgebung, derselbe Läufer wie fahreSitzung), urteilt jede
// Station der Zwillings-Gruppe über denselben Lauf und nennt die Sekunden. Nur Werkzeug der Arbeit, nie im Baum.
//   node probe-lokal.cjs --koord <Koord-Baum> --baum <Spiel-Baum> --port <S> --nur <id> [--sek 90] [--roh <dir>] [--log <werkbank.log>]
"use strict";
const fs = require("fs");
const path = require("path");
const o = {};
const a = process.argv.slice(2);
for (let i = 0; i < a.length; i++) if (a[i].startsWith("--")) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : true;
const koord = path.resolve(o.koord || "/home/user/AnazhRealm");
const P = require(path.join(koord, "meisterkarte-quelle/punkte/punkte.cjs"));
const { stationen, fehler } = P.ladeGeprueft();
if (fehler.length) console.log("STATIONEN ROT:\n - " + fehler.join("\n - "));
const id = String(o.nur);
const st0 = stationen.find((s) => P.schluessel(s) === id);
if (!st0) throw new Error("keine Station " + id);
const k = (s) => JSON.stringify([s.befehl, s.env || {}, !!s.gpu, ...(s.probe ? [s.probe] : [])]);
const gruppe = stationen.filter((s) => k(s) === k(st0) && P.geraeteVon(s).includes("gtx"));
const S = Number(o.port || 7804);
const roh = path.resolve(o.roh || "/tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad/roh");
fs.mkdirSync(roh, { recursive: true });
const name = id.replace("#", "_");
const log = path.resolve(o.log || "/tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad/wb/echt.log");
const zeuge = path.join(roh, "zeuge.txt");
if (!fs.existsSync(zeuge)) fs.writeFileSync(zeuge, "[linse-gpu] google/swiftshader\n");
const strom = path.join(roh, "strom.ndjson");
const sek = Number(o.sek || 90);
(async () => {
    const t0 = Date.now();
    const ctx = {
        baum: path.resolve(o.baum || "/home/user/spiel-a"), koord, geraet: "gtx", bash: "bash", port: S, band: [S],
        aus: path.join(roh, name + ".json"), roh: path.join(roh, name + ".out"),
        sitzung: { log, zeuge, strom, grund: o.grund || "", probe: id, restS: sek, fahrtMaxS: 1e9, eich: sek >= 90 },
    };
    const e = await P.fahreStation(gruppe[0], ctx);
    const s = ((Date.now() - t0) / 1000).toFixed(1);
    console.log("LAUF " + id + " · " + (e.s != null ? e.s : s) + " s · Exit " + e.exit + (e.ungemessen ? " · UNGEMESSEN" : ""));
    console.log("  " + P.schluessel(gruppe[0]) + ": " + (e.gruen ? "GRÜN" : "ROT") + " · " + String(e.zahl).slice(0, 600));
    // die Zwillinge über denselben Lauf (Roh-Ausgabe und {AUS})
    const out = fs.existsSync(ctx.roh) ? fs.readFileSync(ctx.roh, "utf8").split("\n").slice(1).join("\n") : "";
    let j = null;
    try { j = JSON.parse(fs.readFileSync(ctx.aus, "utf8")); } catch (_e) {}
    for (const z of gruppe.slice(1)) {
        let u;
        try { u = z.urteil(j, { exit: e.exit, stdout: out, stderr: "" }); } catch (x) { u = { gruen: false, zahl: "Urteil warf: " + x.message }; }
        console.log("  " + P.schluessel(z) + ": " + (u.gruen ? "GRÜN" : "ROT") + " · " + String(u.zahl).slice(0, 400));
    }
})().catch((x) => { console.error("PROBE-LOKAL ROT: " + x.stack); process.exitCode = 2; });
