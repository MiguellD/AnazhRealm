// 0710-11 (3): DIE HAUS-TÜR — `_tickHausTueren` scannt jede Sekunde (der Loop gibt SEKUNDEN; `> 1000` scannte alle 1 000 s)
// und fragt die Plätze um den Spieler (`_blockerUmPlatz`, 40 m) statt den ganzen Bestand. Aufruf: node tuer-patch.cjs <worktree>
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER " + (s.split(a).length - 1) + ": " + a.slice(0, 140));
    s = s.replace(a, b);
}
ers(
    `        if (!this._hausTuerScanT || currentTime - this._hausTuerScanT > 1000) {
            this._hausTuerScanT = currentTime; // Instanz-Felder (die _editSaveTimer-Klasse: nicht serialisiert)
            const nah = [];
            const p = pm.position;
            for (const e of st.architectures) {
                if (!e || !e.tuer || !e.position || !e.instSlots) continue;`,
    `        // \`currentTime\` sind SEKUNDEN (der Loop: \`t / 1000\`) — der Scan jede Sekunde. Bis 0710-11 stand hier \`> 1000\`: die
        // Liste baute sich nur alle 1 000 s neu, ein Haus, das danach in die Nähe kam oder beim Scan noch kein Mesh trug, öffnete
        // seine Tür bis zu ~17 min nicht (gate:brennglas-takt (H)).
        if (!this._hausTuerScanT || currentTime - this._hausTuerScanT > 1) {
            this._hausTuerScanT = currentTime; // Instanz-Felder (die _editSaveTimer-Klasse: nicht serialisiert)
            const nah = [];
            const p = pm.position;
            // die Plätze um den Spieler (\`_blockerUmPlatz\`, in der Ordnung des Bestands) — vorher jeder Eintrag je Scan
            const kand = this._hausTuerKand || (this._hausTuerKand = []);
            kand.length = 0;
            this._blockerUmPlatz(p.x, p.z, 40 + 1e-6, kand);
            for (const e of kand) {
                if (!e || !e.tuer || !e.position || !e.instSlots) continue;`
);
fs.writeFileSync(p, s);
console.log("ok");
