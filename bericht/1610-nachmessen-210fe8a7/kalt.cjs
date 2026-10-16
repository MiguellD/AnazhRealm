// 1610-Nachmessen: DIE GTX-KALT-ZEILE mit EINEM Instrument — diag-boot-stage.cjs des B-Kopfs (abab-p210), dessen Statik-Server
// den Baum der SEITE ausliefert (KALT_ROOT). --kalt --echt, ohne --profil: ein leeres Wegwerf-Profil (IDB leer, wie nach jedem
// Versions-Update). node kalt.cjs <baum> <json>
"use strict";
const INS = "C:/Users/micha/Desktop/AnazhRealm-OMEN/abab-p210/scripts";
const [baum, json] = process.argv.slice(2);
if (!baum || !json) throw new Error("node kalt.cjs <baum> <json>");
const wb = require(`${INS}/lib/welt-boot.cjs`);
const statik = wb.statikServer;
const root = require("path").resolve(baum); // die Pfad-Wache vergleicht path.join(root, p) — der Root in derselben Schreibweise
wb.statikServer = (o = {}) => statik(Object.assign({}, o, { root }));
process.argv = [process.argv[0], `${INS}/diag-boot-stage.cjs`, "--kalt", "--echt", "--json", json];
require(`${INS}/diag-boot-stage.cjs`);
