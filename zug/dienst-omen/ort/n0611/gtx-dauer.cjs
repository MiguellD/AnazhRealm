// gtx-dauer.cjs — DAUERAUFTRAG des Koordinators 06.11. 10:15 (bis auf Widerruf): die GTX misst nach jeder Landung.
//   Alle ~10 min (und vor jeder Scheibe) `git ls-remote origin main`. Steht ein neuer Kopf, fährt die GTX am Kopf die Scheiben aus
//   gtx-dauer/scheiben.json (die Liste des Koordinators, bei jedem Umlauf frisch gelesen; je Scheibe ein `run --nur`, EINE Sitzung,
//   Zwillinge zusammen) aus einem frischen Checkout von punkte-maschine (n0611-pm). Jede Scheibe erst, wenn die GPU frei ist (kein
//   Runner.Worker, kein wartender CI-Job, kein Schloss, CI-Ruhe ≥ 190 s); der echt-Job verdrängt eine laufende Scheibe ohnehin
//   (p3/gpu-lauf.sh).
//   Nach jeder Scheibe: messung/<sha8>-gtx.json + roh/<sha8>-gtx/*.out nach punkte-maschine UND koordination (Plumbing, kein
//   Arbeitsbaum). Je Kopf EINE Zeile in bericht/0611-gtx-proben.md (koordination): grün/rot je Station, beim Rot die Zahl — am Ende der
//   Liste oder beim Ablösen; kommen am selben Kopf später Scheiben dazu, folgt eine Nachtrag-Zeile.
// Start: node p3/n0611/gtx-dauer.cjs   ·   Halt: Datei p3/n0611/gtx-dauer/HALT anlegen (wirkt zwischen den Scheiben)
// v1 (feste 17 Stationen in 5 Scheiben, nur koordination): gtx-dauer.v1.cjs
const fs = require("fs"), cp = require("child_process");
const O = "C:/Users/micha/Desktop/AnazhRealm-OMEN";
const MESS = O + "/AnazhRealm-mess", PM = O + "/n0611-pm", PUNKTE = PM + "/meisterkarte-quelle/punkte";
const D = O + "/p3/n0611/gtx-dauer";
fs.mkdirSync(D, { recursive: true });
const LOG = D + "/dauer.log", STAND = D + "/stand.json", HALT = D + "/HALT", PID = D + "/pid", PLAN = D + "/scheiben.json";
const GPU_LAUF = O + "/p3/gpu-lauf.sh";
const SCHLOSS = "C:/Users/micha/AppData/Local/Temp/claude/gpu-schloss", HOOKLOG = "C:/actions-runner/hooks/hook.log";
const DIENSTLOG = O + "/p3/messplatz/dienst.log";
const BERICHT = "bericht/0611-gtx-proben.md", MDIR = "meisterkarte-quelle/punkte/messung";
// die Liste von v1 (10:15) — nur für einen Stand ohne eigene Id-Liste
const ALT_LISTE = ["material.K2#1", "material.K1#2", "material.K3#2", "tiere.K3#2", "tiere.K1#2", "leib.K1#2", "leib.K4#2", "vegetation.K4#2", "siedlung.K1#2",
    "siedlung.K4#2", "physik.K2#2", "studios.K2#2", "studios.K3#2", "studios.K4#1", "ferne.K1#2", "gelaende.K2#2", "bauen.K1#2"];
const WER = { GIT_AUTHOR_NAME: "MiguellD", GIT_AUTHOR_EMAIL: "87209049+MiguellD@users.noreply.github.com",
    GIT_COMMITTER_NAME: "MiguellD", GIT_COMMITTER_EMAIL: "87209049+MiguellD@users.noreply.github.com" };
const MITAUTOR = "\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n";

const zwei = (n) => String(n).padStart(2, "0");
const uhr = (t = Date.now()) => { const d = new Date(t); return zwei(d.getHours()) + ":" + zwei(d.getMinutes()); };
const stempel = () => { const d = new Date(); return d.getFullYear() + "-" + zwei(d.getMonth() + 1) + "-" + zwei(d.getDate()) + " " + uhr() + ":" + zwei(d.getSeconds()); };
const log = (s) => fs.appendFileSync(LOG, stempel() + " " + s + "\n");
const ruhe = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const git = (args, cwd = MESS, o = {}) => cp.execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...o }).trim();
const lies = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
const speichere = (st) => fs.writeFileSync(STAND, JSON.stringify(st, null, 1) + "\n");
const kurz = (s, n = 150) => { s = String(s).replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const komma = (x) => x.toFixed(1).replace(".", ",");

// die Liste des Koordinators: [{ name, ids, key }] — key trägt die Ids, eine geänderte Scheibe gleichen Namens fährt neu
function plan() {
    const p = lies(PLAN);
    if (!p || !Array.isArray(p.scheiben)) { log("MELDEN scheiben.json unlesbar"); return []; }
    return p.scheiben.filter((s) => s && s.name && Array.isArray(s.ids) && s.ids.length).map((s) => ({ name: String(s.name), ids: s.ids.map(String), key: s.name + ":" + s.ids.join(",") }));
}
function frei() {
    try { if (/Runner\.Worker/i.test(cp.execFileSync("tasklist", ["/FI", "IMAGENAME eq Runner.Worker.exe"], { encoding: "utf8" }))) return false; } catch { return false; }
    if (fs.existsSync(SCHLOSS)) return false;
    try {
        if (Date.now() - fs.statSync(HOOKLOG).mtimeMs < 190e3) return false;
        const z = fs.readFileSync(HOOKLOG, "utf8").trimEnd().split(/\r?\n/).pop() || "";
        if (/wartet auf Schloss/.test(z)) return false; // ein CI-Job wartet (ci_wartet aus p3/gpu-schloss.sh)
    } catch {}
    return true;
}
function lsRemote() {
    try { const z = git(["ls-remote", "origin", "refs/heads/main"]); const s = z.split(/\s+/)[0]; return /^[0-9a-f]{40}$/.test(s) ? s : null; }
    catch (e) { log("ls-remote scheiterte: " + kurz(e.message, 120)); return null; }
}
function frischerCheckout() {
    for (let v = 1; v <= 3; v++) {
        try {
            git(["fetch", "-q", "origin", "+refs/heads/punkte-maschine:refs/omen/dauer-pm"], PM);
            git(["checkout", "-q", "--detach", "--force", "refs/omen/dauer-pm"], PM);
            return git(["rev-parse", "HEAD"], PM);
        } catch (e) { log("checkout punkte-maschine Versuch " + v + ": " + kurz(e.message, 160)); ruhe(20e3); }
    }
    return null;
}
const messDatei = (k) => PUNKTE + "/messung/" + k.slice(0, 8) + "-gtx.json";
const rohDir = (k) => PUNKTE + "/messung/roh/" + k.slice(0, 8) + "-gtx";

// ein Commit auf einen Zweig ohne Arbeitsbaum: Index aus dem frischen Kopf des Zweigs, Dateien als Blobs, Push; bei Wettlauf von vorn
function pushe(zweig, dateien, nachricht, berichtZeile) {
    const env = { ...process.env, ...WER, GIT_INDEX_FILE: D + "/index-" + zweig + ".tmp" };
    const ref = "refs/omen/dauer-" + zweig;
    for (let v = 1; v <= 5; v++) {
        try {
            git(["fetch", "-q", "origin", "+refs/heads/" + zweig + ":" + ref]);
            const basis = git(["rev-parse", ref]);
            fs.rmSync(env.GIT_INDEX_FILE, { force: true });
            git(["read-tree", basis], MESS, { env });
            const rein = (pfad, inhalt) => {
                const blob = git(["hash-object", "-w", "--no-filters", "--stdin"], MESS, { input: inhalt });
                git(["update-index", "--add", "--cacheinfo", "100644," + blob + "," + pfad], MESS, { env });
            };
            for (const d of dateien) rein(d.pfad, fs.readFileSync(d.von));
            if (berichtZeile) {
                let alt = cp.execFileSync("git", ["show", basis + ":" + BERICHT], { cwd: MESS }).toString("utf8");
                const nl = alt.includes("\r\n") ? "\r\n" : "\n";
                if (!alt.endsWith("\n")) alt += nl;
                if (!alt.includes("## Dauerauftrag 10:15")) alt += nl + "## Dauerauftrag 10:15: GTX-Stationen je Kopf von main" + nl + nl +
                    "Je Kopf eine Zeile. Gemessen wird mit `punkte.cjs run --sha <Kopf> --geraet gtx --nur <Scheibe>` aus einem frischen Checkout von punkte-maschine, " +
                    "in Scheiben nach der Liste des Koordinators (je Scheibe eine Sitzung, Zwillinge zusammen), jede erst, wenn die GPU frei ist. " +
                    "Die Messdatei je Kopf liegt in `" + MDIR + "/<sha8>-gtx.json` (punkte-maschine und koordination), die Roh-Ausgaben in `roh/<sha8>-gtx/`." + nl + nl;
                rein(BERICHT, Buffer.from(alt + berichtZeile.replace(/\n/g, nl) + nl, "utf8"));
            }
            const baum = git(["write-tree"], MESS, { env });
            if (baum === git(["rev-parse", basis + "^{tree}"])) return "unverändert";
            const c = git(["commit-tree", baum, "-p", basis, "-F", "-"], MESS, { env, input: nachricht + MITAUTOR });
            if (process.env.DAUER_TROCKEN) { console.log(zweig + ": " + git(["diff", "--stat", basis, c])); return "trocken " + c.slice(0, 8); }
            git(["push", "-q", "origin", c + ":refs/heads/" + zweig]);
            return c.slice(0, 8);
        } catch (e) { log(zweig + " Versuch " + v + ": " + kurz(e.message, 200)); ruhe(20e3); }
    }
    log("MELDEN " + zweig + "-Push scheiterte 5×");
    return null;
}
function messDateien(k) {
    const l = [];
    if (fs.existsSync(messDatei(k))) l.push({ von: messDatei(k), pfad: MDIR + "/" + k.slice(0, 8) + "-gtx.json" });
    if (fs.existsSync(rohDir(k))) for (const f of fs.readdirSync(rohDir(k)).filter((f) => f.endsWith(".out")))
        l.push({ von: rohDir(k) + "/" + f, pfad: MDIR + "/roh/" + k.slice(0, 8) + "-gtx/" + f });
    // die Richter-Akten der Meisterkarte 2, die die Sitzung an diesem Kopf schrieb (punkte.cjs richterAkten → vision/richter/
    // <leiter>.<sprosse>.<sha8>-gtx.json): sie reisen mit der Mess-Datei nach punkte-maschine und von dort nach koordination
    const RA = PM + "/vision/richter";
    if (fs.existsSync(RA)) for (const f of fs.readdirSync(RA).filter((f) => f.endsWith("." + k.slice(0, 8) + "-gtx.json")))
        l.push({ von: RA + "/" + f, pfad: "vision/richter/" + f });
    return l;
}
// DIE ABLAGE DER REFERENZFAHRTEN (punkte-maschine 601f375a, Koordinator 12.11. 01:20): messung/referenz-<host>.json, je Rechner EINE
// Datei mit den jüngsten 600 Fahrten — der Pool der Ruhe liest nur sie. Der Push nach punkte-maschine nimmt sie mit, sonst füllt jeder
// Lauf aus einem frischen Checkout neu auf und die 14-Tage-Sicht fehlt; nur nach punkte-maschine (EINE Quelle, wie die Mess-Datei).
// Der Name wie in punkte.cjs (`referenzAblageVon`): os.hostname(), jedes Zeichen außer [A-Za-z0-9_-] als „_".
function referenzDateien() {
    const name = "referenz-" + String(require("os").hostname()).replace(/[^A-Za-z0-9_-]/g, "_") + ".json";
    const von = PUNKTE + "/messung/" + name;
    return fs.existsSync(von) ? [{ von, pfad: MDIR + "/" + name }] : [];
}
// die Zahl eines Rots: steht ein „ROT“ in der Zahl (Teil-Urteile), beginnt der Auszug an dem Abschnitt, der es trägt
const rotKern = (z) => {
    const t = String(z).replace(/\s+/g, " ").trim(), i = t.search(/\bROT\b/);
    if (i <= 0) return kurz(t, 220);
    const a = t.lastIndexOf(" · ", i);
    return "… " + kurz(t.slice(a < 0 ? 0 : a + 3), 220);
};
// die Zeile eines Kopfs aus seiner Messdatei (ein Nachtrag nennt nur die Stationen, die die erste Zeile noch nicht trug)
function zeile(st, nachfolger) {
    const m = lies(messDatei(st.kopf)) || { je: {} };
    const ids = (st.ids || ALT_LISTE).filter((id) => !(st.berichtet || []).includes(id));
    const gruen = [], rot = [], offen = [], fehlt = [];
    for (const id of ids) {
        const e = m.je[id];
        if (e && Date.parse(e.zeit) >= st.beginn - 60e3) (e.gruen ? gruen : rot).push(e.gruen ? id : id + " " + rotKern(e.zahl));
        else if (m.ungemessen && m.ungemessen[id]) offen.push(id + " (" + kurz(String(m.ungemessen[id].grund).split(" — ")[0], 70) + ")");
        else fehlt.push(id);
    }
    const n = Object.keys(st.fertig).length, von = st.anzahl || 5;
    let z = "- **" + st.kopf.slice(0, 8) + "**" + ((st.berichtet || []).length ? " Nachtrag" : "") + " (" + uhr(st.beginn) + "–" + uhr() + ", " + n + "/" + Math.max(n, von) +
        " Scheiben, Schloss Σ ≈ " + komma(st.schlossS / 60) + " min, punkte-maschine " + (st.pm || "?").slice(0, 8) + "): grün " + gruen.length + " (" + (gruen.join(", ") || "—") + ")";
    if (rot.length) z += " · ROT " + rot.length + ": " + rot.join("; ");
    if (offen.length) z += " · ungemessen " + offen.length + ": " + offen.join("; ");
    if (fehlt.length) z += " · nicht gefahren " + fehlt.length + (nachfolger ? " (abgelöst von " + nachfolger.slice(0, 8) + ")" : "") + ": " + fehlt.join(", ");
    if (st.verdraengt && st.verdraengt.length) z += " · vom echt-Job verdrängt und neu gefahren: " + st.verdraengt.join("; ");
    if (st.ohne && st.ohne.length) z += " · Köpfe davor ohne Messung (abgelöst, bevor die GPU frei war): " + st.ohne.map((s) => s.slice(0, 8)).join(", ");
    return { z, ids, gruen: gruen.length, rot: rot.length, offen: offen.length + fehlt.length };
}
function schreibeZeile(st, nachfolger) {
    const { z, ids, gruen, rot, offen } = zeile(st, nachfolger);
    if (!ids.length) { st.zeile = true; return; }
    const kopf = "OMEN GTX-Dauer: Kopf " + st.kopf.slice(0, 8) + " " + gruen + " grün / " + rot + " rot" + (offen ? " / " + offen + " offen" : "") +
        (nachfolger ? " (abgelöst von " + nachfolger.slice(0, 8) + ")" : "");
    const pm = pushe("punkte-maschine", messDateien(st.kopf), kopf + "\n\nDauerauftrag 06.11. 10:15: Messdatei " + st.kopf.slice(0, 8) + "-gtx.json samt Roh-Ausgaben.", null);
    const c = pushe("koordination", messDateien(st.kopf), kopf + "\n\nDauerauftrag 06.11. 10:15, GTX-Stationen am Kopf von main, Zeile in " + BERICHT + ".", z);
    log("ZEILE " + st.kopf.slice(0, 8) + " → koordination " + c + ", punkte-maschine " + pm + ": " + kurz(z, 300));
    if (c) { st.zeile = true; st.berichtet = [...(st.berichtet || []), ...ids]; }
}
function lauf(k, ids, aus) {
    return new Promise((ok) => {
        const fd = fs.openSync(aus, "a");
        const kind = cp.spawn(process.execPath, [PUNKTE + "/punkte.cjs", "run", "--sha", k, "--geraet", "gtx", "--nur", ids.join(",")],
            { cwd: PM, env: { ...process.env, PUNKTE_GPU_LAUF: GPU_LAUF }, stdio: ["ignore", fd, fd], windowsHide: true });
        const wache = setTimeout(() => { log("MELDEN Scheibe läuft > 80 min, der Baum ab pid " + kind.pid + " fällt"); try { cp.execFileSync("taskkill", ["/F", "/T", "/PID", String(kind.pid)]); } catch {} }, 80 * 60e3);
        kind.on("exit", (c) => { clearTimeout(wache); fs.closeSync(fd); ok(c); });
    });
}
async function fahreScheibe(st, sch) {
    const k = st.kopf, ids = sch.ids, s = sch.name, aus = D + "/" + k.slice(0, 8) + "-" + s + ".out";
    if (!st.beginn) st.beginn = Date.now();
    st.versuche[sch.key] = (st.versuche[sch.key] || 0) + 1;
    speichere(st);
    const t0 = Date.now();
    log("START " + k.slice(0, 8) + " Scheibe " + s + " (" + ids.join(",") + "), Versuch " + st.versuche[sch.key]);
    const exit = await lauf(k, ids, aus);
    const dt = (Date.now() - t0) / 1000;
    const text = fs.existsSync(aus) ? fs.readFileSync(aus, "utf8") : "";
    const warte = [...text.matchAll(/Schloss nach ([\d.]+) min/g)].reduce((a, x) => a + 60 * Number(x[1]), 0);
    st.schlossS += Math.max(0, dt - warte);
    const m = lies(messDatei(k)) || { je: {} };
    const da = ids.filter((id) => m.je[id] && Date.parse(m.je[id].zeit) >= t0 - 60e3);
    const un = ids.filter((id) => !da.includes(id) && m.ungemessen && m.ungemessen[id]);
    const schloss = un.some((id) => /Schloss|BLOCKIERT|Exit 75|verdr/i.test(m.ungemessen[id].grund || ""));
    const urteil = ids.map((id) => (da.includes(id) ? (m.je[id].gruen ? "GRÜN " : "ROT ") + id : un.includes(id) ? "OFFEN " + id : "FEHLT " + id)).join(", ");
    log("ENDE  " + k.slice(0, 8) + " Scheibe " + s + " exit " + exit + " nach " + (dt / 60).toFixed(1) + " min (Warten " + (warte / 60).toFixed(1) + " min): " + urteil);
    // DIE NACH-SCHEIBE: zerbrach die Welt der Sitzung an einer anderen Probe („trägt nicht mehr“), kam die Station nie dran — sie fährt
    // einmal in einer eigenen Sitzung am selben Kopf nach (341ad089 C: leib.K3#2 hinter dem abgerissenen Frame von studios.K4#2)
    const bruch = un.filter((id) => /trägt nicht mehr/.test(m.ungemessen[id].grund || ""));
    if (bruch.length && !s.endsWith("+") && !verdraengt) {
        (st.nach = st.nach || []).push({ name: s + "+", ids: bruch, key: s + "+:" + bruch.join(",") });
        log("NACH " + k.slice(0, 8) + " Scheibe " + s + "+ (" + bruch.join(",") + "): die Welt der Sitzung trug nicht mehr");
    }
    // DIE VERDRÄNGUNG: nahm ein CI-Job der Sitzung das Schloss (dienst.log „omen-punkte-gtx… VERDRÄNGT“ im Lauf der Scheibe), fiel die Welt
    // mitten in einer Probe — deren ROT/OFFEN ist kein Urteil über den Kopf (341ad089 C: studios.K4#2 „Navigating frame was detached“).
    // Die ganze Scheibe fährt einmal neu; ihre Einträge überschreiben die der verdrängten Fahrt.
    let verdraengt = false;
    try {
        for (const z of fs.readFileSync(DIENSTLOG, "utf8").split(/\r?\n/).slice(-200)) {
            const t = /^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d) gpu-lauf omen-punkte-gtx\S* VERDRÄNGT/.exec(z);
            if (t && Date.parse(t[1] + "T" + t[2]) >= t0 - 5e3) verdraengt = true;
        }
    } catch {}
    if (verdraengt) log("VERDRÄNGT " + k.slice(0, 8) + " Scheibe " + s + " — ein CI-Job nahm der Sitzung das Schloss" + (st.versuche[sch.key] < 2 ? ", die Scheibe fährt neu" : ", schon der 2. Versuch"));
    if (verdraengt) (st.verdraengt = st.verdraengt || []).push(s + " " + uhr() + " (Versuch " + st.versuche[sch.key] + ")");
    if (verdraengt && st.versuche[sch.key] < 2) { /* offen lassen */ }
    else if (da.length + un.length === ids.length && !(schloss && st.versuche[sch.key] < 2)) st.fertig[sch.key] = true;
    else if (st.versuche[sch.key] >= 2) {
        st.fertig[sch.key] = true; // zwei Versuche ohne volles Urteil — die Zeile nennt den Rest
        log("MELDEN Scheibe " + s + " am " + k.slice(0, 8) + " nach 2 Versuchen ohne volles Urteil (exit " + exit + ")");
    }
    if (st.zeile) st.zeile = false; // eine Scheibe nach der Zeile: es folgt ein Nachtrag
    speichere(st);
    if (da.length || un.length) {
        const n = "OMEN GTX-Dauer: messung " + k.slice(0, 8) + " Scheibe " + s + ": " + kurz(urteil, 200) +
            "\n\nDauerauftrag 06.11. 10:15. Messdatei " + MDIR + "/" + k.slice(0, 8) + "-gtx.json (kumuliert je Kopf), Roh-Ausgaben roh/" + k.slice(0, 8) + "-gtx/.";
        const pm = pushe("punkte-maschine", messDateien(k), n, null);
        const c = pushe("koordination", messDateien(k), n, null);
        log("messung " + k.slice(0, 8) + " Scheibe " + s + " → punkte-maschine " + pm + ", koordination " + c);
    }
}
async function main() {
    try { const alt = Number(fs.readFileSync(PID, "utf8")); if (alt && alt !== process.pid) { process.kill(alt, 0); console.log("läuft schon (pid " + alt + ")"); return; } } catch {}
    fs.writeFileSync(PID, String(process.pid));
    process.on("exit", () => { try { if (Number(fs.readFileSync(PID, "utf8")) === process.pid) fs.rmSync(PID); } catch {} });
    let st = lies(STAND) || { kopf: null, fertig: {}, versuche: {}, beginn: null, schlossS: 0, zeile: false, geprueft: 0, ohne: [] };
    log("DAUER START pid " + process.pid + " (v2, Liste scheiben.json)" + (st.kopf ? " · Stand: Kopf " + st.kopf.slice(0, 8) + ", " + Object.keys(st.fertig).length + " Scheiben" : ""));
    for (;;) {
        if (fs.existsSync(HALT)) { log("HALT-Datei — Ende"); return; }
        const p = plan();
        const offen = () => (st.kopf ? [...p, ...(st.nach || [])].filter((s) => !st.fertig[s.key]) : []);
        if (st.kopf && st.ids) { // die Liste wuchs am selben Kopf: ihre Ids zählen zur Zeile
            for (const s of p) for (const id of s.ids) if (!st.ids.includes(id)) st.ids.push(id);
            st.anzahl = Object.keys(st.fertig).length + offen().length;
        }
        const istFrei = offen().length ? frei() : false;
        if (!st.kopf || Date.now() - st.geprueft >= 10 * 60e3 || istFrei) {
            const k = lsRemote();
            st.geprueft = Date.now();
            if (k && k !== st.kopf) {
                try { git(["fetch", "-q", "origin", "+refs/heads/main:refs/omen/dauer-main"]); } catch (e) { log("fetch main: " + kurz(e.message, 120)); }
                log("KOPF " + (st.kopf ? st.kopf.slice(0, 8) : "—") + " → " + k.slice(0, 8));
                const ohne = st.kopf && !st.beginn ? [...(st.ohne || []), st.kopf] : [];
                if (st.kopf && st.beginn && !st.zeile) schreibeZeile(st, k);
                const pm = frischerCheckout();
                if (!pm) { log("MELDEN kein frischer Checkout von punkte-maschine — warte 10 min"); speichere(st); await schlaf(10 * 60e3); continue; }
                st = { kopf: k, fertig: {}, versuche: {}, beginn: null, schlossS: 0, zeile: false, geprueft: Date.now(), ohne, pm,
                    ids: [...new Set(p.flatMap((s) => s.ids))], anzahl: p.length, berichtet: [] };
                log("punkte-maschine " + pm.slice(0, 8) + " frisch in n0611-pm · " + p.length + " Scheiben: " + p.map((s) => s.name).join(" "));
            }
            speichere(st);
        }
        const todo = offen();
        if (!todo.length) {
            if (st.kopf && st.beginn && !st.zeile) { schreibeZeile(st, null); speichere(st); }
            await schlaf(60e3);
            continue;
        }
        if (!istFrei || !frei()) { await schlaf(30e3); continue; }
        await fahreScheibe(st, todo[0]);
    }
}
if (require.main === module && !process.env.DAUER_TEST) main().catch((e) => { log("MELDEN Absturz: " + (e.stack || e.message)); process.exit(1); });
module.exports = { pushe, zeile, messDateien, referenzDateien, frei, lsRemote, plan };
