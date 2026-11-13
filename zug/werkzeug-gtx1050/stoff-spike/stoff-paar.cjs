// stoff-paar.cjs <ausgabe-ordner> <lauf>  — EIN Paar am echten Renderer: Kalt-Boot in einem frischen Profil (eigener Temp-Ordner),
// dann der Zweit-Boot im SELBEN Profil (Platte und Caches warm) → <lauf>-kalt.json/.log und <lauf>-warm.json/.log; der Temp-Ordner
// des Paars fällt am Ende (wie das Profil der frei-sonde ohne FREI_PROFIL). Umgebung reicht durch (FREI_EINGRIFF, FREI_NACH, FREI_SHADER …).
const cp = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const [out, lauf] = process.argv.slice(2);
const profil = fs.mkdtempSync(path.join(os.tmpdir(), "anazh-stoff-paar-"));
for (const art of ["kalt", "warm"]) {
    const env = { ...process.env, FREI_PROFIL: profil, FREI_ZERLEGE: "1", FREI_PLATTE: "alles", FREI_JSON: path.join(out, `${lauf}-${art}.json`), FREI_BILD_NAME: `${lauf}-${art}`, CI_KLASSE: "gpu", LINSE_GPU: "karte" };
    const r = cp.spawnSync(process.execPath, [path.join(__dirname, "frei-sonde.cjs")], { env, encoding: "utf8", maxBuffer: 1 << 28, timeout: 300000 });
    fs.writeFileSync(path.join(out, `${lauf}-${art}.log`), (r.stdout || "") + (r.stderr || ""));
    console.log(`${lauf}-${art} EXIT=${r.status} · ${String(r.stdout || "").split("\n")[0].slice(47, 150)}`);
    if (art === "kalt") cp.spawnSync(process.execPath, ["-e", "setTimeout(()=>{}, 6000)"]);
}
try {
    fs.rmSync(profil, { recursive: true, force: true });
} catch {}
