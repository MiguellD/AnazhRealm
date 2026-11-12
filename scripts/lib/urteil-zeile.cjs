// urteil-zeile.cjs — DIE GEDRUCKTE ROTE ZEILE IST URTEIL (Lehre 6; w28-probe-urteil, Klasse A der Augen-Karte 11.11.: 14 von 70
// Paketen meldeten GRÜN über ihren eigenen ROT-/❌-Zeilen — gate:laub-kante „lod.K1#1 ROT“, gate:pop „lod.K2#1 ROT“, ein
// haar-strich-Vehikel mit vier ❌ und `process.exit(0)`, gpu-probe.yml urteilte am Exit allein). EINE Quelle für drei Leser:
//   istRotZeile(z)   die Zeile trägt ein ROTES Urteil: ❌ · ⛔ · das Wort ROT — nie eine Selbsttest-Zeile mit ✅ (die Mutante ist
//                    ROT, die Linse GRÜN) und nie eine Zählung „0 ❌“/„0 ROT“. Ein Vermerk heißt nie ROT/❌.
//   wache()          (welt-boot und jede Linse ohne welt-boot) am Prozess-Ende: eine gedruckte ROTE Zeile bei Exit 0 wird Exit 1,
//                    beim Namen — der Exit trägt, was die Zeile sagt (sonst stünde die Zeile als Vermerk ohne ROT/❌).
//   probeUrteil(...) (der Kopf der GPU-Probe, gpu-probe.yml) Log UND Exit: GRÜN nur ohne ROTE Zeile und mit Exit 0; eine ROTE Zeile
//                    einer Station, die am gebuchten Stand der Punkte-Maschine (punkte-maschine stand.json) nicht GRÜN ist, steht
//                    als BEKANNT „ROT wie an main (bekannt): <station> <zahl>“ und reißt den Zweig nicht; jede andere reißt, und der
//                    Kopf nennt den ersten Grund.
// CLI (gpu-probe.yml): node scripts/lib/urteil-zeile.cjs --log <datei> --rc <exit> [--stand <stand.json>] [--geraet <läufer>]
//   → EINE Zeile `<U>\t<grund>`, U ∈ GRÜN · BEKANNT · ROT. Gate: gate:apparat Klinge 9 (Selbsttest mit Mutanten).
"use strict";

const ROT_RE = /❌|⛔|(?<![A-Za-zÄÖÜäöüß])ROT(?![A-Za-zÄÖÜäöüß])/;
// keine Urteile: die Zählung „0 ❌“/„0 ROT“, und ROT als Beschreibung des erwarteten Ausgangs („→ ROT“, „ist ROT“, „wird ROT“ —
// die Sätze der Selbsttests: die Mutante IST ROT, die Linse urteilt GRÜN)
const ZAEHLUNG_RE = /(?<![\d.,])0\s*(?:❌|ROT(?![A-Za-zÄÖÜäöüß]))|(?:→|=>|\b(?:ist|wird|werden|sind|als|bleibt|macht|heißt|nennt|wäre|fällt|das))\s+ROT(?![A-Za-zÄÖÜäöüß])/g;
// die Station beim Namen: `lod.K1#1`, `haar.K2` (ohne # gilt jede Station des Kriteriums)
const STATION_RE = /(?<![A-Za-z0-9.])([a-z][a-z0-9-]*\.K\d+(?:#\d+)?)(?![A-Za-z0-9])/;

// DIE RATSCHE DES MESSORTS (w28-linse-wahr): `werkbank bild --ort` urteilt jedes ROT gegen `bekannt` seines Orts
// (spec/profiband/haushalt.json) und schreibt „ABNAHME BEKANNT · ROT wie an main (bekannt): <ort>.<schlüssel> <grund> · …“, wenn JEDES
// ROT dort steht — die Schlüssel sind die ersten Wörter der Glieder (`stadt.leib`, `wiese.band.nahWiese`); ein neues ROT schreibt
// „ABNAHME ROT [...]“ und reißt wie jede Zeile. Die Zeile ist kein ROT (`istRotZeile`: sonst machte die Wache der Werkbank aus dem
// BEKANNT einen Exit 1, GPU-Probe 00d6624d), der Kopf der Probe sammelt ihre Schlüssel aus jeder Zeile
const ORT_BEKANNT = /ABNAHME BEKANNT · ROT wie an main \(bekannt\): /;
const ortSchluessel = (z) =>
    z
        .split(ORT_BEKANNT)[1]
        .split(" · ")
        .map((g) => g.split(" ")[0])
        .filter((w) => /^[a-z][a-z0-9-]*\.[A-Za-z][\w.:-]*$/.test(w));

function istRotZeile(z) {
    // die Ratsche des Orts ist kein ROT der Zeile (sie hat geurteilt: jedes ROT steht in `bekannt`) — ein ROT daneben bleibt eines
    const s = String(z).replace(ZAEHLUNG_RE, "").replace(ORT_BEKANNT, "ABNAHME BEKANNT · ");
    // die Zeile urteilt an ihrem Kopf: „ok“/„OK“ vorn ist ein bestandener Fall, auch wenn er seine Mutante ROT nennt
    // (gate:mp-sync „OK   (d) Selbsttest: die alte Kappe je Frame macht (d) ROT am Gesetz“, z399)
    return ROT_RE.test(s) && !s.includes("✅") && !/^\s*ok\s/i.test(s);
}

// die ROTEN Zeilen eines Texts, je mit der Folgezeile, wenn sie ein Spiegelstrich ist (rotListe: „❌ ROT — n Verletzung(en):“, „   • …“)
function rotZeilen(text) {
    const z = String(text).split(/\r?\n/);
    const aus = [];
    for (let i = 0; i < z.length; i++)
        if (istRotZeile(z[i])) {
            const folge = z[i + 1] && /^\s+(?:•|-)\s/.test(z[i + 1]) ? " " + z[i + 1].trim() : "";
            aus.push((z[i].trim() + folge).slice(0, 300));
        }
    return aus;
}

// DER GEBUCHTE STAND einer Station (punkte-maschine meisterkarte-quelle/punkte/stand.json `je.<kriterium>.stationen`): am Gerät
// des Läufers, wenn er dort gemessen ist, sonst an jedem — `null`, wenn die Station dort nicht steht
function mainStation(stand, id, geraet) {
    if (!stand?.je) return null;
    const alle = [];
    for (const k of Object.values(stand.je)) for (const s of k.stationen || []) if (s.id === id || (!id.includes("#") && s.id.startsWith(id + "#"))) alle.push(s);
    if (!alle.length) return null;
    const hier = alle.filter((s) => s.geraet === geraet);
    const l = hier.length ? hier : alle;
    const rot = l.find((s) => !s.gruen);
    return rot ? { gruen: false, geraet: rot.geraet, zahl: rot.zahl } : { gruen: true, geraet: l[0].geraet, zahl: l[0].zahl };
}

const GERAET = (laeufer) => (/omen|1060/i.test(laeufer || "") ? "gtx" : /radeon/i.test(laeufer || "") ? "radeon" : null);
const ABSTURZ = /\b(?:TypeError|ReferenceError|SyntaxError|RangeError|ABSTURZ|DECKEL)\b/;

function probeUrteil({ text, rc, stand, geraet }) {
    const rot = rotZeilen(text);
    const zeilen = String(text).split(/\r?\n/).map((z) => z.trim()).filter(Boolean);
    const bekannt = new Map();
    for (const z of zeilen.filter((x) => ORT_BEKANNT.test(x))) {
        const ids = ortSchluessel(z);
        if (!ids.length) return { u: "ROT", grund: `${z.slice(0, 220)} — die Ratsche des Orts nennt keinen Schlüssel` };
        for (const id of ids) bekannt.set(id, `${id} (Messort, haushalt.json bekannt)`);
    }
    const ende = () => ({ u: "BEKANNT", grund: `ROT wie an main (bekannt): ${[...bekannt.values()].join(" · ")}` });
    if (!rot.length) return Number(rc) !== 0 ? { u: "ROT", grund: `Exit ${rc} ohne ROTE Zeile: ${(zeilen.at(-1) || "kein Log").slice(0, 200)}` } : bekannt.size ? ende() : { u: "GRÜN", grund: "" }; // prettier-ignore
    for (const z of rot) {
        const id = (STATION_RE.exec(z) || [])[1];
        const m = id && mainStation(stand, id, geraet);
        if (!m || m.gruen) {
            const warum = !stand ? "der Stand der Punkte-Maschine ist nicht lesbar" : !id ? "keine Station beim Namen" : !m ? `${id} steht nicht im gebuchten Stand` : `${id} ist an main GRÜN (${m.geraet})`;
            return { u: "ROT", grund: `${z.slice(0, 220)} — ${warum}` };
        }
        if (!bekannt.has(id)) bekannt.set(id, `${id} ${m.zahl == null ? `(main ${m.geraet}: ungemessen)` : String(m.zahl).slice(0, 60)}`);
    }
    const sturz = Number(rc) !== 0 && zeilen.find((z) => ABSTURZ.test(z));
    if (sturz) return { u: "ROT", grund: `Exit ${rc}: ${sturz.slice(0, 220)}` };
    return ende();
}

// DIE URTEILS-WACHE am Prozess-Ende (einmal je Prozess): jede gedruckte Zeile (console.log/error/warn/info) läuft durch
// `istRotZeile`; endet der Prozess mit 0 nach einer ROTEN Zeile, steht der Grund auf stderr und der Exit wird 1
// Ein Selbsttest (`--selftest`/`--selbsttest`) zeigt seine Mutanten ROT und urteilt am eigenen Ende (selbsttestEnde, urteilEnde):
// dort wacht sie nicht
function wache() {
    if (process.__urteilWache || process.argv.some((x) => /^--sel(f|bs)t?test$/.test(x))) return;
    process.__urteilWache = { erste: null, n: 0 };
    const w = process.__urteilWache;
    for (const k of ["log", "error", "warn", "info"]) {
        const alt = console[k].bind(console);
        console[k] = (...a) => {
            for (const z of a.map((x) => (typeof x === "string" ? x : "")).join(" ").split("\n"))
                if (istRotZeile(z)) (w.n++, (w.erste ||= z.trim().slice(0, 300)));
            return alt(...a);
        };
    }
    process.on("exit", (code) => {
        if (code !== 0 || !w.n) return;
        process.stderr.write(`❌ URTEILS-WACHE: ${w.n} ROTE Zeile(n) bei Exit 0 — die erste: ${w.erste} (Exit wird 1; ein Vermerk heißt nie ROT/❌)\n`);
        process.exitCode = 1;
    });
}

module.exports = { istRotZeile, rotZeilen, probeUrteil, mainStation, GERAET, wache };

if (require.main === module) {
    const fs = require("fs");
    const a = process.argv.slice(2);
    const opt = (k) => (a.indexOf(k) >= 0 ? a[a.indexOf(k) + 1] : undefined);
    let text = "",
        stand = null;
    try {
        text = fs.readFileSync(opt("--log"), "utf8");
    } catch (e) {
        text = `❌ das Log der Probe ist nicht lesbar: ${e.message}`;
    }
    try {
        stand = JSON.parse(fs.readFileSync(opt("--stand"), "utf8"));
    } catch {}
    const r = probeUrteil({ text, rc: opt("--rc") ?? 1, stand, geraet: GERAET(opt("--geraet")) });
    console.log(`${r.u}\t${r.grund.replace(/[\t\r\n]+/g, " ")}`);
}
