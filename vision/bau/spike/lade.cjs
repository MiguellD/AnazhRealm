// lade.cjs — lädt die KOPIE des Kerns (kern/fachwerk-core.js, main 18058dba) wie die Linsen des Repos
// (scripts/lib/welt-boot.cjs:556–572 `ENGINE_THREE` + `studioKern`): die Engine three r184 als globales THREE
// (ColorManagement aus, wie im Faden), dann der Kern als Skript → globalThis.__fachwerkCore. Kein Spiel-Code berührt.
const path = require("path");
const { pathToFileURL } = require("url");
const KERN = path.join(__dirname, "kern");
async function laden() {
    if (!global.THREE) {
        const w = process.emitWarning;
        process.emitWarning = () => {};
        const T = await import(pathToFileURL(path.join(KERN, "three.module.min.js")).href);
        process.emitWarning = w;
        T.ColorManagement.enabled = false;
        global.THREE = { ...T };
    }
    require(path.join(KERN, "fachwerk-core.js"));
    return { FC: globalThis.__fachwerkCore, THREE: global.THREE };
}
module.exports = { laden, KERN };
