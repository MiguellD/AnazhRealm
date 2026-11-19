// schloss-ort.cjs — DER ORT DES GPU-SCHLOSSES, EINE Quelle (Koordinator 19.11. 04:3x, Auftrag (c)): gpu-schloss.sh (und darüber
// gpu-lauf.sh, kandidat.sh, richter.sh gtx) und schloss-puls.cjs fragen HIER, wo das Schloss liegt. Bis hier hing der Ort an zwei
// Regeln: p3/gpu-schloss.sh, gtx-dauer.cjs und die Runner-Hooks (job-start.ps1, job-ende.ps1) tragen den festen Pfad
// C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss, schloss-puls.cjs, radeon-dienst.sh, richter.sh und messplatz-blick.cjs lasen
// $TEMP/claude/gpu-schloss — ein Lauf, dem der Dienst ein eigenes TEMP gibt (Stations-Abfall unter eigener Wurzel), hätte dann ein
// ANDERES Schloss gesehen.
// DIE REGEL: liegt die Ort-Datei des Geräts (<home>/.gpu-schloss-ort, eine Zeile: der absolute Ordner), gilt ihr Ordner; sonst der
// bisherige Ordner <home>/AppData/Local/Temp/claude/gpu-schloss — derselbe wie heute, NIE aus $TEMP gerechnet. Bis zur Umstellung
// sieht also jeder Leser genau den alten Ordner (ein Halter dort bleibt sichtbar). Umgestellt wird nur auf das Wort des Koordinators,
// wenn an keinem Gerät ein Halter lebt: `node schloss-ort.cjs --umstellen <neuer-ordner>` (verweigert, solange der alte Ordner steht).
// Aufruf: node schloss-ort.cjs              → der Ordner (Windows-Form)
//         node schloss-ort.cjs --umstellen <ordner>
//         node schloss-ort.cjs --selbsttest
// Umgebung (nur der Selbsttest): GPU_SCHLOSS_ORT_DATEI (statt <home>/.gpu-schloss-ort), GPU_SCHLOSS_HEIM (statt os.homedir()).
"use strict";
const fs = require("fs"), os = require("os"), path = require("path");
const heim = () => process.env.GPU_SCHLOSS_HEIM || os.homedir();
const ortDatei = () => process.env.GPU_SCHLOSS_ORT_DATEI || path.join(heim(), ".gpu-schloss-ort");
const alterOrt = () => path.join(heim(), "AppData", "Local", "Temp", "claude", "gpu-schloss");
function schlossOrt() {
    let z = "";
    try { z = fs.readFileSync(ortDatei(), "utf8").split(/\r?\n/)[0].trim(); } catch { z = ""; }
    if (z && !path.isAbsolute(z)) throw new Error("schloss-ort: " + ortDatei() + " nennt keinen absoluten Ordner: " + z);
    return z || alterOrt();
}
module.exports = { schlossOrt, alterOrt, ortDatei };
if (require.main === module) {
    const [was, ziel] = process.argv.slice(2);
    if (was === "--umstellen") {
        if (!ziel || !path.isAbsolute(ziel)) { console.error("--umstellen <absoluter-ordner>"); process.exit(2); }
        const jetzt = schlossOrt();
        if (fs.existsSync(jetzt)) { console.error("VERWEIGERT: am jetzigen Ort " + jetzt + " steht ein Schloss (" + (() => { try { return fs.readFileSync(path.join(jetzt, "besitzer.txt"), "utf8").split(/\r?\n/)[0]; } catch { return "?"; } })() + ") — erst umstellen, wenn kein Halter lebt"); process.exit(3); }
        fs.mkdirSync(path.dirname(ziel), { recursive: true });
        fs.writeFileSync(ortDatei(), ziel + "\n");
        console.log("UMGESTELLT: " + jetzt + " → " + ziel + " (" + ortDatei() + ")");
    } else if (was === "--selbsttest") {
        const X = fs.mkdtempSync(path.join(os.tmpdir(), "schloss-ort-"));
        process.env.GPU_SCHLOSS_HEIM = X;
        process.env.GPU_SCHLOSS_ORT_DATEI = path.join(X, ".gpu-schloss-ort");
        const fall = [];
        const pr = (n, ok, ist) => { fall.push(ok); console.log((ok ? "  OK  " : "  ROT ") + n + (ok ? "" : " — ist „" + ist + "“")); };
        const t0 = process.env.TEMP;
        process.env.TEMP = "Q:\\fremd\\temp"; // ein Lauf mit eigenem TEMP
        const a = schlossOrt();
        pr("ohne Ort-Datei: der bisherige Ordner unter dem Heim, nie aus $TEMP", a === path.join(X, "AppData", "Local", "Temp", "claude", "gpu-schloss") && !a.includes("fremd"), a);
        process.env.TEMP = t0;
        fs.mkdirSync(a, { recursive: true });
        let v = 0;
        try { require("child_process").execFileSync(process.execPath, [__filename, "--umstellen", path.join(X, "neu", "gpu-schloss")], { stdio: "ignore", env: process.env }); } catch (e) { v = e.status; }
        pr("Umstellen verweigert, solange am alten Ort ein Schloss steht", v === 3 && !fs.existsSync(ortDatei()), "Exit " + v);
        fs.rmSync(a, { recursive: true, force: true });
        require("child_process").execFileSync(process.execPath, [__filename, "--umstellen", path.join(X, "neu", "gpu-schloss")], { stdio: "ignore", env: process.env });
        const b = schlossOrt();
        pr("nach dem Umstellen: der Ordner der Ort-Datei", b === path.join(X, "neu", "gpu-schloss"), b);
        fs.writeFileSync(ortDatei(), "relativ/ordner\n");
        let w = "";
        try { schlossOrt(); } catch (e) { w = String(e.message); }
        pr("eine Ort-Datei ohne absoluten Ordner ist ROT beim Namen (kein stiller Rückfall)", /keinen absoluten Ordner/.test(w), w);
        fs.rmSync(X, { recursive: true, force: true });
        const gruen = fall.every(Boolean);
        console.log("schloss-ort SELBSTTEST " + (gruen ? "GRÜN" : "ROT") + " (" + fall.filter(Boolean).length + "/" + fall.length + ")");
        process.exit(gruen ? 0 : 1);
    } else console.log(schlossOrt());
}
