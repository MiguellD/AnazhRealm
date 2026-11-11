// punkte-offen.cjs — Auftrag 07.11. (Koordinator, z273 gelandet): punkte.cjs run --offen an einem Kopf auf der GTX aus einem frischen
// punkte-maschine (n0611-pm); danach die Messdatei samt Roh-Ausgaben nach punkte-maschine und koordination (pushe aus gtx-dauer.cjs).
// Aufruf: node punkte-offen.cjs lauf <sha40> | node punkte-offen.cjs push <sha40>
"use strict";
const fs = require("fs"), cp = require("child_process");
process.env.DAUER_TEST = "1";
const { pushe, messDateien, referenzDateien } = require("./gtx-dauer.cjs");
const O = "C:/Users/micha/Desktop/AnazhRealm-OMEN", PM = O + "/n0611-pm";
const [was, K] = process.argv.slice(2);
const AUS = O + "/p3/n0611/punkte-offen-" + K.slice(0, 8) + (process.env.TEIL ? "-" + process.env.TEIL : "") + ".out";
const git = (a) => cp.execFileSync("git", a, { cwd: PM, encoding: "utf8" }).trim();
if (was === "lauf") {
    git(["fetch", "-q", "origin", "+refs/heads/punkte-maschine:refs/omen/dauer-pm"]);
    git(["checkout", "-q", "--detach", "--force", "refs/omen/dauer-pm"]);
    console.log("punkte-maschine " + git(["rev-parse", "--short", "HEAD"]));
    const fd = fs.openSync(AUS, "a");
    const r = cp.spawnSync(process.execPath, [PM + "/meisterkarte-quelle/punkte/punkte.cjs", "run", "--sha", K, "--geraet", "gtx", ...(process.env.NUR ? ["--nur", process.env.NUR] : ["--offen"])],
        { cwd: PM, env: { ...process.env, PUNKTE_GPU_LAUF: O + "/p3/gpu-lauf.sh" }, stdio: ["ignore", fd, fd], windowsHide: true, timeout: 240 * 60e3 });
    console.log("punkte exit " + r.status);
    process.exitCode = r.status == null ? 9 : r.status;
} else if (was === "push") {
    // CPU-RUHE (10.11., Koordinator 07:30: nie neben einem echt-/Probe-Job): nach der Sitzung ist das Schloss schon frei — der Push
    // (git, ~3 min) lief so zweimal in den Anfang eines echt-Jobs; er wartet, solange ein CI-Job das Schloss hält oder auf es wartet
    cp.spawnSync("C:/Program Files/Git/bin/bash.exe", ["-c", '. "$1" && cpu_ruhe', "ruhe", "/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh"],
        { stdio: "inherit", windowsHide: true, timeout: 60 * 60e3 });
    const m = JSON.parse(fs.readFileSync(PM + "/meisterkarte-quelle/punkte/messung/" + K.slice(0, 8) + "-gtx.json", "utf8"));
    const je = Object.entries(m.je || {}), un = Object.keys(m.ungemessen || {});
    const gruen = je.filter(([, v]) => v.gruen).length, rot = je.filter(([, v]) => !v.gruen).length;
    const n = "OMEN GTX: messung " + K.slice(0, 8) + (process.env.NUR ? " --nur (" + process.env.NUR.split(",").length + "): " : " --offen: ") + gruen + " grün / " + rot + " rot / " + un.length + " ungemessen" +
        "\n\nKoordinator 07.11.: punkte.cjs run --sha " + K.slice(0, 8) + " --geraet gtx " + (process.env.NUR ? "--nur " + process.env.NUR.slice(0, 200) : "--offen") + " aus punkte-maschine " + git(["rev-parse", "--short", "HEAD"]) + "; Roh-Ausgaben roh/" + K.slice(0, 8) + "-gtx/.";
    console.log(n);
    // EINE Quelle (Koordinator Konto 11, 10.11. 22:55): die Mess-Datei geht nur noch nach punkte-maschine — derselbe Stand getrennt
    // nach koordination ließ die Buchung um 22:28 an einem both-added-Konflikt fallen
    // die Ablage der Referenzfahrten dieses Rechners reist mit (punkte-maschine 601f375a: der Pool der Ruhe liest nur sie)
    console.log("punkte-maschine " + pushe("punkte-maschine", messDateien(K).concat(referenzDateien()), n, null));
}
