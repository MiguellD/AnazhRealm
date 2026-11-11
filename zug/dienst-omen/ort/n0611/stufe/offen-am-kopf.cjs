// offen-am-kopf.cjs <sha40> <liste,komma> — die Stationen der Liste, die in der GEPUSHTEN Mess-Datei dieses Kopfs
// (punkte-maschine, refs/omen/dauer-pm: messung/<sha8>-gtx.json) noch KEINEN Eintrag tragen (weder je noch ungemessen), als
// Komma-Liste auf stdout. landung-dienst.sh nimmt damit eine unterbrochene Liste auf, statt sie neu zu fahren (10.11.: der
// Konto-Wechsel beendete die Kette an Station 8 von 32, der Neustart fuhr alle 33 von vorn). Ein verdrängter Teil wird nie
// gepusht — was in der Datei steht, ist gemessen. Fehlt die Datei, ist alles offen.
"use strict";
const cp = require("child_process");
const PM = "C:/Users/micha/Desktop/AnazhRealm-OMEN/n0611-pm";
const [K, LISTE] = process.argv.slice(2);
const liste = String(LISTE || "").split(",").map((x) => x.trim()).filter(Boolean);
let m = {};
try {
    m = JSON.parse(cp.execFileSync("git", ["show", "refs/omen/dauer-pm:meisterkarte-quelle/punkte/messung/" + String(K).slice(0, 8) + "-gtx.json"],
        { cwd: PM, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64e6 }));
} catch { /* keine Mess-Datei an diesem Kopf: alles offen */ }
const da = new Set([...Object.keys(m.je || {}), ...Object.keys(m.ungemessen || {})]);
const offen = liste.filter((s) => !da.has(s));
process.stderr.write("an " + String(K).slice(0, 8) + " schon gemessen: " + (liste.filter((s) => da.has(s)).join(", ") || "keine") + "\n");
process.stdout.write(offen.join(",") + "\n");
