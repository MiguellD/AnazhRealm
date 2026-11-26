// HAND-LAUF der Leiter erleben.bild.nacht (karte2 nacht#1, Leser 2, 26.11.): der ECHTE Probe-Befehl der Station, auf die eine Leiter
// geschnitten (wie leiter-hand.cjs), gegen die warme Welt der Werkbank (main, Port + 20000) — dann das Urteil der Station über das JSON.
// Die Wolke stellt stadt-voll nicht (`/umstellen` antwortet nie binnen 240 s): der Hand-Lauf ersetzt NUR L.ort durch das Halten des
// Spielers an der Pose third (842/452, die Stadt d:7@836,438 steht in der Welt, NACHT_ORT=stadt) — dort zeichnet die Wolke keinen Boden
// (die Werkbank holt den Spieler je Takt an ihre Wiese zurück, `_bodenSichtAt` null an der Stadt): ohne NACHT_ORT steht die Leiter an
// der Wiese der Werkbank (gezeichneter Boden, Glutbrunnen des Felds 18–20 m). Arten:
//   kandidat   die Station, wie sie ist
//   laterne    ATTRAPPE: kein Feuer der Menschen (die Suche findet keine Stelle) — der Pfosten an der nächsten Quelle: der Laterne
//   feld       ATTRAPPE: das Werk trägt die Marke des Felds (`feldWurf`) — ein Feuer, das es nach der Landung nicht gibt
// DIE WOLKE HAT KEIN BILD (das Gerät der Werkbank ist verloren: „A valid external Instance reference no longer exists“): die Nacht-Linse
// (nachtSicht), das Fenster der NEUN (/fenster antwortet nie) und die Aufnahme der NEUN-Seite (`window.__ausgabeAufnahme`) stehen im Hand-Lauf als leere Stubs — gemessen wird die
// MECHANIK der Pose (das Feuer, die Quelle, die der Teil schatten.K5 wählt, ihr Abstand, das Werk fort), nie ein Kontrast.
//   node nacht-hand.cjs <stations-datei> <port> [art=kandidat]
"use strict";
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const [datei, port, ART = "kandidat"] = process.argv.slice(2);
const st = require(path.resolve(datei));
const alle = st.filter((s) => s.kriterium === "karte2.erleben.bild.nacht");
const p = alle[0].probe;
const AI = p.befehl.findIndex((x) => String(x).includes("erleben.bild.nacht"));
let art = p.befehl[AI];
const ersetze = (a, b, was) => { const n = art.split(a).length - 1; if (n !== 1) throw new Error(was + ": " + n + "× im Befehl"); art = art.replace(a, b); };
ersetze('L.wb("/umstellen", Object.assign({ ort, sicht: sicht || "ego" }, pose ? { pose } : {}), 240)',
    process.env.NACHT_ORT === "stadt" ? 'L.ev("const pm = r.state.playerMesh.position; pm.set(842, r._voxelSurfaceY(842, 452) + 1.8, 452); return { ort: \\"stadt-voll third (Hand: gesetzt)\\" };", 30)'
        : 'L.ev("const p = r.state.playerMesh.position; return { ort: \\"die Wiese der Werkbank (Hand)\\", p: [p.x, p.z] };", 30)', "L.ort");
ersetze('nacht = await L.ev("return await (" + LL.nachtSicht + ")({});", Math.max(20, L.rest() - 20));',
    'nacht = { quellen: 0, sichtbar: 1, gut: 1, anteil: 1, ohneKarte: 0, kelvin: [], hand: "Linse ohne Bild (Wolke)" };', "Nacht-Linse");
ersetze('await L.wb("/fenster", { w: C.fenster[0], h: C.fenster[1] }, 30);', "/* Hand: /fenster ohne Gerät */", "/fenster NEUN");
ersetze('await L.wb("/fenster", { w: 1920, h: 1080 }, 30).catch(() => {});', "/* Hand: /fenster ohne Gerät */", "/fenster zurück");
if (ART === "laterne") ersetze("rr <= 60 && !ort", "rr <= -1 && !ort", "ATTRAPPE laterne");
if (ART === "feld") ersetze('{ silent: true, precise: true, id: "nacht-feuerstelle" }', '{ silent: true, precise: true, feldWurf: true }', "ATTRAPPE feld (ohne id: ein Eintrag mit id ist Werk, siedlung-satz.js:1400)");
const aus = path.join(__dirname, "hand-nacht-" + ART + ".json");
fs.rmSync(aus, { force: true });
const sek = 60 + 15, t0 = Date.now();
const argv = p.befehl.slice(1).map((a, k) => (k + 1 === AI ? art : a === "{AUS}" ? aus : a === "{PORT}" ? String(port) : a === "{SEK}" ? String(sek) : a));
const env = { ...process.env, PUNKTE_MASCHINE: path.resolve(path.dirname(path.resolve(datei)), "..", "punkte.cjs") };
const wb = (code) => spawnSync(process.execPath, ["scripts/werkbank.cjs", "eval", code], { encoding: "utf8", env: { ...process.env, WERKBANK_PORT: String(Number(port) + 20000) }, timeout: 60000 }).stdout;
wb("if (!window.__aufnahmeEcht) window.__aufnahmeEcht = window.__ausgabeAufnahme; window.__ausgabeAufnahme = async (w, h) => ({ u8: new Uint8Array(w * h * 4) }); return 1;");
const lauf = spawnSync(process.execPath, argv, { encoding: "utf8", timeout: (sek + 60) * 1000, maxBuffer: 1 << 26, env });
wb("if (window.__aufnahmeEcht) { window.__ausgabeAufnahme = window.__aufnahmeEcht; delete window.__aufnahmeEcht; } return 1;");
const j = fs.existsSync(aus) ? JSON.parse(fs.readFileSync(aus, "utf8")) : null;
const L = j && j.sprossen ? { s: j.sprossen[1] && j.sprossen[1].t, warf: j.fehler ? JSON.stringify(j.fehler).slice(0, 200) : null } : null;
console.log("NACHT " + ART + " · " + path.basename(datei) + " · LAUF " + ((Date.now() - t0) / 1000).toFixed(1) + " s · Exit " + lauf.status + " · Leiter " + (L ? L.s + " s" + (L.warf ? " warf: " + L.warf : "") : "fehlt"));
for (const z of String(lauf.stdout).split("\n")) if (/Feuer der Station|Pfosten \(schatten|Nacht der Sitzung|Nacht-Linse/.test(z)) console.log("  " + z.slice(0, 900));
if (!L) console.log(String(lauf.stdout).slice(-1500) + String(lauf.stderr).slice(-1500));
const s1 = alle.find((s) => s.staffel === 1);
const u = s1.urteil(j, { exit: lauf.status, stdout: lauf.stdout || "", stderr: lauf.stderr || "" });
console.log("  S1 " + (u.gruen ? "GRÜN" : u.ungemessen ? "UNGEMESSEN" : "ROT") + " · " + String(u.zahl).slice(0, 700));
// das Urteil der Station über die ZEUGEN (die Wolke trägt kein Gerät: R2 urteilt vor ihnen) — dieselbe Funktion, nur die GPU-Zeile benannt
const zj = j && Object.assign({}, j, { hw: "[linse-gpu] amd/rdna-3 (Hand-Lauf der Wolke: Urteil über die Zeugen, kein Bild)" });
const u2 = s1.urteil(zj, { exit: lauf.status, stdout: lauf.stdout || "", stderr: lauf.stderr || "" });
console.log("  S1 über die Zeugen " + (u2.gruen ? "GRÜN" : "ROT") + " · " + String(u2.zahl).slice(0, 900));
const S = j && j.sprossen && j.sprossen[1];
if (S) console.log("  ROH S1 welt " + JSON.stringify(S.welt) + " · Pfosten " + JSON.stringify(S.beleg && S.beleg.pfosten) + (S.beleg && S.beleg.feuer ? " · Feuer " + JSON.stringify(S.beleg.feuer) + " · fort " + JSON.stringify(S.beleg.fort) : ""));
