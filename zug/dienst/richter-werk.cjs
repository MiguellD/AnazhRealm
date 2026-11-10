// richter-werk.cjs — die Hand-Griffe des Richters (zug/dienst/richter.sh), geräte-neutral, ohne Arbeitsbaum (nur git-Klempnerei):
//   faelle <repo> <geraet> <kopf-sha40>   die FÄLLE am Kopf: Stationen, die die Mess-Datei messung/<kopf8>-<geraet>.json ROT nennt
//       und die eine frühere Buchung (stand.json auf punkte-maschine, samt seiner Geschichte) auf diesem Gerät GRÜN trug.
//       Je Fall eine Zeile  <station> TAB <gut-sha40> TAB <schlecht-sha40> TAB <zahl am Kopf>.
//       gut = das jüngste gebuchte GRÜN, das Vorfahr des Kopfs ist; schlecht = das früheste bekannte ROT danach (engt die
//       Halbierung ein), sonst der Kopf. Ein Fall, den zug/richter.txt schon beim Namen trägt (Station, Gerät, gut), fehlt.
//       Die Geschichte von stand.json wird gelesen, weil die Buchung des Laptops den Kopf oft schon gebucht hat, bevor der
//       Richter kommt — dann steht die Station im jüngsten stand.json schon ROT, und der Fall wäre unsichtbar.
//   post <repo> <zeile-datei> [<zweig> <abschnitt-datei>]   EIN Commit auf koordination: die Zeile (Datum und Zeit davor) ans
//       Ende von zug/richter.txt, und — mit Zweig — der Abschnitt oben in cloud-post/<zweig>.md (neueste Nachricht oben).
//       TROCKEN=1 zeigt nur.
//   selbsttest   die Fall-Regel an gestellten Ständen: GRÜN → ROT ist ein Fall; GRÜN → GRÜN, GRÜN → UNGEMESSEN, nie GRÜN,
//       GRÜN nur auf dem anderen Gerät und ein schon genannter Fall sind keiner (Mutanten).
"use strict";
const fs = require("fs"), cp = require("child_process"), os = require("os"), path = require("path");
const MDIR = "meisterkarte-quelle/punkte";
const WER = { GIT_AUTHOR_NAME: "MiguellD", GIT_AUTHOR_EMAIL: "87209049+MiguellD@users.noreply.github.com",
    GIT_COMMITTER_NAME: "MiguellD", GIT_COMMITTER_EMAIL: "87209049+MiguellD@users.noreply.github.com" };
const [was, REPO, ...rest] = process.argv.slice(2);
const git = (a, o = {}) => cp.execFileSync("git", a, { cwd: REPO, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 256e6, ...o }).trim();
const zeig = (ref, pfad) => { try { return git(["show", ref + ":" + pfad]); } catch { return null; } };
const istVorfahr = (a, b) => { try { git(["merge-base", "--is-ancestor", a, b]); return true; } catch { return false; } };

// die ROTEN einer Mess-Datei: gemessen ROT — ein jüngeres UNGEMESSEN derselben Station schlägt den älteren Lauf
function rote(m) {
    const aus = [];
    for (const [s, v] of Object.entries((m && m.je) || {})) {
        const u = ((m && m.ungemessen) || {})[s];
        if (!v || v.gruen || v.ungemessen) continue;
        if (u && String(u.zeit || "") >= String(v.zeit || "")) continue;
        aus.push({ station: s, zahl: String(v.zahl || v.grund || "ROT").replace(/\s+/g, " ").slice(0, 300) });
    }
    return aus;
}
const zeilenVon = (stand) => [...Object.values((stand && stand.je) || {}), ...Object.values((stand && stand.pflichtJe) || {})].flatMap((e) => e.stationen || []);
// DIE FALL-REGEL (rein): staende = stand.json, jüngster zuerst; vorfahr(a) = ist a ein Vorfahr des Kopfs (und nicht der Kopf);
// abstand(a, b) = Länge der Erst-Eltern-Kette a..b; genannt = Text von zug/richter.txt
function faelleAus(staende, messung, geraet, kopf, vorfahr, abstand, genannt) {
    const aus = [];
    for (const r of rote(messung)) {
        let gut = null;
        for (const st of staende) {
            const z = zeilenVon(st).find((x) => x.id === r.station && x.geraet === geraet && x.gruen && x.sha && x.sha !== kopf && vorfahr(x.sha));
            if (z) { gut = z.sha; break; }
        }
        if (!gut) continue; // auf diesem Gerät nie GRÜN gebucht: kein Fall (Schuld oder Gerät, nicht der Zug)
        if (String(genannt || "").split(/\r?\n/).some((l) => l.includes(" " + r.station + " ") || l.includes(" " + r.station + ":") ? l.includes(geraet) && l.includes("gut " + gut.slice(0, 8)) : false)) continue;
        let schlecht = kopf, weite = abstand(gut, kopf);
        for (const st of staende)
            for (const x of zeilenVon(st))
                if (x.id === r.station && x.geraet === geraet && !x.gruen && !x.ungemessen && !x.tot && x.sha && x.sha !== gut && vorfahr(x.sha) && istNach(gut, x.sha, abstand)) {
                    const w = abstand(gut, x.sha);
                    if (w > 0 && w < weite) { schlecht = x.sha; weite = w; }
                }
        aus.push({ station: r.station, gut, schlecht, zahl: r.zahl });
    }
    return aus;
}
const istNach = (gut, x, abstand) => abstand(gut, x) > 0;

if (was === "faelle") {
    const [GERAET, KOPF] = rest;
    git(["fetch", "-q", "origin", "+refs/heads/punkte-maschine:refs/richter/pm", "+refs/heads/koordination:refs/richter/koord"]);
    const roh = zeig("refs/richter/pm", MDIR + "/messung/" + KOPF.slice(0, 8) + "-" + GERAET + ".json");
    if (!roh) { process.stderr.write("keine Mess-Datei " + KOPF.slice(0, 8) + "-" + GERAET + ".json auf punkte-maschine\n"); process.exit(0); }
    const messung = JSON.parse(roh);
    if (!rote(messung).length) { process.stderr.write("kein ROT an " + KOPF.slice(0, 8) + " " + GERAET + "\n"); process.exit(0); }
    const revs = git(["log", "--format=%H", "-n", process.env.RICHTER_TIEFE || "60", "refs/richter/pm", "--", MDIR + "/stand.json"]).split(/\s+/).filter(Boolean);
    const staende = [];
    for (const r of revs) { try { staende.push(JSON.parse(zeig(r, MDIR + "/stand.json"))); } catch { /* ein unlesbarer Stand zählt nicht */ } }
    const vor = new Map(), ab = new Map();
    const vorfahr = (a) => { if (!vor.has(a)) vor.set(a, a !== KOPF && istVorfahr(a, KOPF)); return vor.get(a); };
    const abstand = (a, b) => { const k = a + b; if (!ab.has(k)) { try { ab.set(k, istVorfahr(a, b) ? Number(git(["rev-list", "--first-parent", "--count", a + ".." + b])) : 0); } catch { ab.set(k, 0); } } return ab.get(k); };
    const f = faelleAus(staende, messung, GERAET, KOPF, vorfahr, abstand, zeig("refs/richter/koord", "zug/richter.txt"));
    process.stderr.write(rote(messung).length + " ROT an " + KOPF.slice(0, 8) + " " + GERAET + ", davon " + f.length + " FALL (gegen " + staende.length + " Buchungen)\n");
    for (const x of f) process.stdout.write([x.station, x.gut, x.schlecht, x.zahl].join("\t") + "\n");
} else if (was === "post") {
    const [ZEILE_F, ZWEIG, ABSCHNITT_F] = rest;
    const zw = (n) => String(n).padStart(2, "0"), d = new Date();
    const text = fs.readFileSync(ZEILE_F, "utf8").replace(/\s+/g, " ").trim();
    if (!text) throw new Error("leere Zeile");
    const zeile = d.getFullYear() + "-" + zw(d.getMonth() + 1) + "-" + zw(d.getDate()) + " " + zw(d.getHours()) + ":" + zw(d.getMinutes()) + " " + text;
    console.log(zeile);
    const abschnitt = ZWEIG && ABSCHNITT_F ? fs.readFileSync(ABSCHNITT_F, "utf8").trim() : null;
    if (abschnitt) console.log("cloud-post/" + ZWEIG + ".md ← " + abschnitt.split("\n")[0].slice(0, 160));
    if (process.env.TROCKEN) process.exit(0);
    const IDX = path.join(os.tmpdir(), "richter-index-" + process.pid + ".tmp"), env = { ...process.env, ...WER, GIT_INDEX_FILE: IDX };
    const blobAus = (inhalt) => git(["hash-object", "-w", "--no-filters", "--stdin"], { input: inhalt });
    for (let v = 1; v <= 5; v++) {
        try {
            git(["fetch", "-q", "origin", "+refs/heads/koordination:refs/richter/koord"]);
            const basis = git(["rev-parse", "refs/richter/koord"]);
            fs.rmSync(IDX, { force: true });
            git(["read-tree", basis], { env });
            let alt = cp.execFileSync("git", ["show", basis + ":zug/richter.txt"], { cwd: REPO, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8");
            if (alt && !alt.endsWith("\n")) alt += "\n";
            git(["update-index", "--add", "--cacheinfo", "100644," + blobAus(alt + zeile + "\n") + ",zug/richter.txt"], { env });
            if (abschnitt) {
                let post = "";
                try { post = cp.execFileSync("git", ["show", basis + ":cloud-post/" + ZWEIG + ".md"], { cwd: REPO, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8"); } catch { post = "# Post an " + ZWEIG + "\n\n"; }
                const i = post.search(/^## /m), kopf = i < 0 ? post.replace(/\s*$/, "\n\n") : post.slice(0, i), rumpf = i < 0 ? "" : post.slice(i);
                git(["update-index", "--add", "--cacheinfo", "100644," + blobAus(kopf + abschnitt + "\n\n" + rumpf) + ",cloud-post/" + ZWEIG + ".md"], { env });
            }
            const c = git(["commit-tree", git(["write-tree"], { env }), "-p", basis, "-F", "-"], { env,
                input: "Richter: " + text.slice(0, 68) + "\n\n" + (abschnitt ? "cloud-post/" + ZWEIG + ".md\n\n" : "") + "Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n" });
            git(["push", "-q", "origin", c + ":refs/heads/koordination"]);
            fs.rmSync(IDX, { force: true });
            console.log("koordination " + c.slice(0, 8));
            process.exit(0);
        } catch (e) {
            console.log("Versuch " + v + ": " + String(e.message).slice(0, 200));
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20e3);
        }
    }
    console.log("MELDEN Richter-Push scheiterte 5×");
    process.exit(1);
} else if (was === "selbsttest") {
    const G = "a".repeat(40), M1 = "b".repeat(40), K = "c".repeat(40), ord = [G, M1, K];
    const vorfahr = (a) => ord.includes(a) && a !== K, abstand = (a, b) => Math.max(0, ord.indexOf(b) - ord.indexOf(a));
    const st = (id, geraet, gruen, sha, mehr = {}) => ({ id, geraet, gruen, sha, ...mehr });
    const stand = (...z) => ({ je: { k: { stationen: z } } });
    const mess = (je, ungemessen = {}) => ({ je, ungemessen });
    const rot = { gruen: false, zahl: "0,9 < 1" }, f = (...a) => faelleAus(...a).map((x) => x.station + " " + x.gut.slice(0, 1) + x.schlecht.slice(0, 1)).join(",");
    const pr = [
        ["GRÜN → ROT ist ein FALL (gut = das gebuchte GRÜN, schlecht = der Kopf)", f([stand(st("x.K1#1", "gtx", true, G))], mess({ "x.K1#1": rot }), "gtx", K, vorfahr, abstand, ""), "x.K1#1 ac"],
        ["der Kopf schon gebucht (jüngster Stand ROT am Kopf): die GESCHICHTE trägt das GRÜN", f([stand(st("x.K1#1", "gtx", false, K)), stand(st("x.K1#1", "gtx", true, G))], mess({ "x.K1#1": rot }), "gtx", K, vorfahr, abstand, ""), "x.K1#1 ac"],
        ["ein früheres bekanntes ROT engt ein (schlecht = M1)", f([stand(st("x.K1#1", "gtx", false, M1)), stand(st("x.K1#1", "gtx", true, G))], mess({ "x.K1#1": rot }), "gtx", K, vorfahr, abstand, ""), "x.K1#1 ab"],
        ["MUTANTE GRÜN → GRÜN: kein Fall", f([stand(st("x.K1#1", "gtx", true, G))], mess({ "x.K1#1": { gruen: true, zahl: "1" } }), "gtx", K, vorfahr, abstand, ""), ""],
        ["MUTANTE GRÜN → UNGEMESSEN: kein Fall", f([stand(st("x.K1#1", "gtx", true, G))], mess({ "x.K1#1": { ...rot, zeit: "1" } }, { "x.K1#1": { zeit: "2" } }), "gtx", K, vorfahr, abstand, ""), ""],
        ["MUTANTE nie GRÜN gebucht: kein Fall", f([stand(st("x.K1#1", "gtx", false, G))], mess({ "x.K1#1": rot }), "gtx", K, vorfahr, abstand, ""), ""],
        ["MUTANTE GRÜN nur auf dem anderen Gerät: kein Fall", f([stand(st("x.K1#1", "radeon", true, G))], mess({ "x.K1#1": rot }), "gtx", K, vorfahr, abstand, ""), ""],
        ["MUTANTE schon beim Namen in richter.txt: kein zweiter Fall", f([stand(st("x.K1#1", "gtx", true, G))], mess({ "x.K1#1": rot }), "gtx", K, vorfahr, abstand, "2026-11-10 23:00 TÄTER x.K1#1: bbbbbbbb Merge w (gut aaaaaaaa, schlecht cccccccc, 3 Schritte) · gtx"), ""],
        ["das GRÜN eines fremden Asts (kein Vorfahr des Kopfs): kein Fall", f([stand(st("x.K1#1", "gtx", true, "d".repeat(40)))], mess({ "x.K1#1": rot }), "gtx", K, vorfahr, abstand, ""), ""],
    ];
    let fehl = 0;
    for (const [name, ist, soll] of pr) { const ok = ist === soll; if (!ok) fehl++; console.log((ok ? "  GRÜN " : "  ROT  ") + name + (ok ? "" : " — ist „" + ist + "“, soll „" + soll + "“")); }
    console.log(fehl ? "richter-werk Selbsttest ROT (" + fehl + ")" : "richter-werk Selbsttest GRÜN (" + pr.length + ")");
    process.exit(fehl ? 1 : 0);
} else {
    console.log("richter-werk.cjs faelle <repo> <geraet> <kopf-sha40> | post <repo> <zeile-datei> [<zweig> <abschnitt-datei>] | selbsttest");
    process.exit(2);
}
