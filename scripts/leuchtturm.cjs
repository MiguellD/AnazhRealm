// leuchtturm.cjs — DEIN EIGENER LEUCHTTURM (R-035, meister-plan §8.9a):
// beide Ein-Datei-Server mit EINEM Befehl. Die Souveränitäts-Inversion:
// „es sind doch deine Server" wird „jeder betreibt seinen eigenen" —
// save-server.js (HTTP, statisch + lokale Saves, Port 4312) und
// signaling-server.js (WebSocket-Broker, Port 4313) sind zero-dep und
// laufen überall, wo Node läuft. Der Leuchtturm RELAYED, er besitzt
// nichts (taille-spec §7): keine Schlüssel, keine Inventare, kein
// persistenter Welt-Besitz — die Taille gilt.
//   npm run leuchtturm     (Strg+C beendet beide)
const { spawn } = require("child_process");
const path = require("path");

const KINDER = [
    { name: "save-server  (HTTP 4312)", file: "save-server.js" },
    { name: "signaling    (WS   4313)", file: "signaling-server.js" },
];

console.log("⛯ DER LEUCHTTURM — beide Server starten (Strg+C beendet beide)\n");
const procs = [];
let endet = false;

for (const kind of KINDER) {
    const proc = spawn(process.execPath, [path.resolve(__dirname, "..", kind.file)], {
        stdio: ["ignore", "pipe", "pipe"],
    });
    procs.push(proc);
    const tag = `[${kind.name}]`;
    proc.stdout.on("data", (c) => process.stdout.write(`${tag} ${c}`));
    proc.stderr.on("data", (c) => process.stderr.write(`${tag} ${c}`));
    proc.on("exit", (code) => {
        if (endet) return;
        // Fällt EIN Turm, fallen beide — ein halber Leuchtturm täuscht nur.
        console.error(`${tag} beendet (code ${code}) — der Leuchtturm geht aus.`);
        ende(code || 1);
    });
}

function ende(code) {
    if (endet) return;
    endet = true;
    for (const p of procs) {
        try {
            p.kill();
        } catch {
            /* schon weg */
        }
    }
    process.exit(code);
}

process.on("SIGINT", () => ende(0));
process.on("SIGTERM", () => ende(0));

console.log("⛯ Browser: http://localhost:4312/  ·  Mesh-Broker: ws://localhost:4313/");
console.log("⛯ Hinter TLS/Domain: wss:// terminiert dein Reverse-Proxy; TURN optional");
console.log("⛯ via localStorage `anazhTurn` im Client. Details: README → „Dein eigener");
console.log("⛯ Leuchtturm" + "“ + docs/taille-spec.md §7 (was der Broker sieht — und was NIE).\n");
