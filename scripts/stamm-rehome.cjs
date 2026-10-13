"use strict";
/* global process, console, __dirname */
// scripts/stamm-rehome.cjs — trägt einen Zweig über den Stamm-Schnitt (Stamm-Zerlegung, plan 13.10. §6).
//
// Ein Zweig, der vor dem Schnitt abzweigte (oder über dessen Basis ein `--teile` lief), trägt den Stamm in einer anderen
// Form als sein Ziel. Ein git-Merge je Datei sähe modify/delete bzw. add/add; dieses Werkzeug merged stattdessen den
// VIRTUELLEN Stamm (scripts/lib/stamm.cjs `textAusRev`): Basis = Stamm-Text an der Merge-Basis (bei mehreren Basen die
// virtuelle Basis wie merge-ort: paarweise rekursiv, „Temporary merge branch 1/2"), Kopf = Stamm-Text des Ziels, Zweig =
// Stamm-Text der Spitze; darauf `git merge-file --diff-algorithm=histogram` (der Algorithmus von merge-ort), danach S in
// die Form des Ziels. Weil der Merge auf demselben Text wie git läuft, sind die Konflikte per Konstruktion die von git;
// benannt werden sie nach dem Glied, das den Hunk trägt. Alles außerhalb des Stamms merged git selbst.
//
//   node scripts/stamm-rehome.cjs [--auf origin/main] [--trocken] [--immer]
//        im Arbeitsbaum des Zweigs (HEAD = der Zweig, Baum sauber). Ergebnis: EIN Merge-Commit (Eltern Zweig + Ziel), in
//        dem der Stamm die Form des Ziels trägt. Mit Stamm-Konflikten: kein Merge, der virtuelle Text mit git-Markern liegt
//        in stamm-rehome.konflikt.js (unversioniert) — von Hand lösen, dann
//   node scripts/stamm-rehome.cjs --weiter
//   node scripts/stamm-rehome.cjs --selftest
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const stamm = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const KONFLIKT = "stamm-rehome.konflikt.js";
const ZUSTAND = "stamm-rehome.json"; // in .git
const MB = { maxBuffer: 1 << 30 };

const git = (root, args, o = {}) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", ...MB, ...o });
const gitOk = (root, args) => {
    try {
        return { ok: true, out: git(root, args, { stdio: ["ignore", "pipe", "pipe"] }) };
    } catch (e) {
        return { ok: false, status: e.status, out: String(e.stdout || ""), err: String(e.stderr || "") };
    }
};
const gitDir = (root) => path.resolve(root, git(root, ["rev-parse", "--git-dir"]).trim());

// ── der Merge auf dem virtuellen Stamm ────────────────────────────────────────────────────────────────────────────
// git merge-file auf drei Texten; Labels wie git merge (Kopf-Name, Basis, Zweig-Name). Ergebnis samt Konfliktzahl.
function mergeText(kopf, basis, zweig, labels, markerSize = 7) {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "stamm-rehome-"));
    try {
        const [k, b, z] = ["k", "b", "z"].map((n) => path.join(d, n));
        fs.writeFileSync(k, kopf);
        fs.writeFileSync(b, basis);
        fs.writeFileSync(z, zweig);
        const args = ["merge-file", "-p", "--diff-algorithm=histogram", `--marker-size=${markerSize}`];
        for (const l of labels) args.push("-L", l);
        let text;
        let n = 0;
        try {
            text = execFileSync("git", [...args, k, b, z], {
                encoding: "utf8",
                ...MB,
                stdio: ["ignore", "pipe", "pipe"],
            });
        } catch (e) {
            if (!(e.status > 0 && e.status < 128) || typeof e.stdout !== "string") throw e;
            text = e.stdout;
            n = e.status;
        }
        return { text, n };
    } finally {
        fs.rmSync(d, { recursive: true, force: true });
    }
}

// Die Basis wie merge-ort: eine Merge-Basis → ihr Stamm-Text; mehrere → paarweise rekursiv zur virtuellen Basis.
function basisText(root, a, b, tiefe = 0) {
    const basen = git(root, ["merge-base", "--all", a, b]).split("\n").filter(Boolean).reverse();
    if (!basen.length) throw new Error(`Re-Home: ${a} und ${b} haben keine gemeinsame Basis`);
    let v = stamm.textAusRev(root, basen[0]);
    const bisher = [basen[0]];
    for (const naechste of basen.slice(1)) {
        const vb = basisTextVon(root, naechste, bisher, tiefe + 1);
        v = mergeText(
            v,
            vb,
            stamm.textAusRev(root, naechste),
            ["Temporary merge branch 1", "merged common ancestors", "Temporary merge branch 2"],
            7 + 2 * (tiefe + 1)
        ).text;
        bisher.push(naechste);
    }
    return { text: v, basen };
}
// Die Basis von `c` gegen den virtuellen Merge von `bisher` (git merge-base c b1 b2 … rechnet genau diese).
function basisTextVon(root, c, bisher, tiefe) {
    const basen = git(root, ["merge-base", "--all", c, ...bisher])
        .split("\n")
        .filter(Boolean);
    if (basen.length === 1) return stamm.textAusRev(root, basen[0]);
    return basisText(root, basen[0], basen[1], tiefe).text;
}

// Jeder Konflikt beim Glied, das den Hunk trägt (die erste Glied-Zeile im Hunk, sonst die letzte davor).
const GLIED_RX = /^ {4}(?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?\*?([A-Za-z_$][\w$]*)\s*\(/;
const AUSSEN_RX = /^AnazhRealm\.([A-Za-z_$][\w$]*)\s*=/;
function benenne(text, markerSize = 7) {
    const L = text.split("\n");
    const auf = "<".repeat(markerSize) + " ";
    const zu = ">".repeat(markerSize);
    const out = [];
    let zuletzt = "(Kopf der Datei)";
    for (let i = 0; i < L.length; i++) {
        const m = GLIED_RX.exec(L[i]) || AUSSEN_RX.exec(L[i]);
        if (L[i].startsWith(auf)) {
            let j = i + 1;
            let innen = null;
            for (; j < L.length && !L[j].startsWith(zu); j++) {
                const g = GLIED_RX.exec(L[j]) || AUSSEN_RX.exec(L[j]);
                if (g && !innen) innen = g[1];
            }
            out.push({ zeile: i + 1, glied: innen || zuletzt });
            i = j;
            continue;
        }
        if (m) zuletzt = m[1];
    }
    return out;
}

// Die Form des Stamms an einer Revision: "datei" oder "zonen:<Liste der Tags>".
function formAn(root, rev) {
    const namen = git(root, ["ls-tree", "--name-only", rev, "--", stamm.ALT, `${stamm.DIR}/`])
        .split("\n")
        .filter(Boolean);
    if (namen.includes(stamm.ALT)) return "datei";
    return (
        "zonen:" +
        stamm
            .tagsVon(git(root, ["show", `${rev}:index.html`]))
            .map((t) => t.pfad)
            .join(",")
    );
}

// Der Kern: der virtuelle Merge und seine Konflikte, ohne den Arbeitsbaum zu berühren.
function plane(root, auf, zweig, namen) {
    const basis = basisText(root, auf, zweig);
    const Tk = stamm.textAusRev(root, auf);
    const Tz = stamm.textAusRev(root, zweig);
    const M = mergeText(Tk, basis.text, Tz, [namen[0], "basis", namen[1]]);
    const konflikte = benenne(M.text);
    if (konflikte.length !== M.n && M.n < 127)
        throw new Error(`Re-Home: git merge-file meldet ${M.n} Konflikte, die Benennung findet ${konflikte.length}`);
    return { basen: basis.basen, M: M.text, n: konflikte.length, konflikte, Tk, Tz };
}

// Schreibt den Stamm-Text `T` in der Form des Ziels in den Arbeitsbaum und stellt ihn in den Index.
function setzeStamm(root, T, form) {
    const alt = path.join(root, stamm.ALT);
    const dir = path.join(root, stamm.DIR);
    if (form === "datei") {
        if (fs.existsSync(dir)) gitOk(root, ["rm", "-r", "-q", "-f", "--ignore-unmatch", stamm.DIR]);
        fs.rmSync(dir, { recursive: true, force: true });
        fs.writeFileSync(alt, T);
        // ein Zonen-Zweig auf ein Datei-Ziel: die Tags folgen der Form (EIN Tag, sonst lüde die Seite fehlende Zonen)
        const html = path.join(root, "index.html");
        const h = fs.readFileSync(html, "utf8");
        if (/^<<<<<<< /m.test(h)) throw new Error("Re-Home: index.html trägt git-Konflikte — erst lösen, dann --weiter");
        fs.writeFileSync(html, stamm.tagsSetzen(h, [stamm.ALT]));
        git(root, ["add", "--", stamm.ALT, "index.html"]);
        return [stamm.ALT];
    }
    const S = stamm.schneide(T);
    gitOk(root, ["rm", "-q", "-f", "--ignore-unmatch", "--", stamm.ALT]);
    if (fs.existsSync(alt)) fs.unlinkSync(alt);
    fs.mkdirSync(dir, { recursive: true });
    const soll = new Set(S.map((x) => x.pfad));
    for (const f of fs.readdirSync(dir))
        if (f.endsWith(".js") && !soll.has(`${stamm.DIR}/${f}`)) {
            gitOk(root, ["rm", "-q", "-f", "--ignore-unmatch", "--", `${stamm.DIR}/${f}`]);
            fs.rmSync(path.join(dir, f), { force: true });
        }
    for (const x of S) fs.writeFileSync(path.join(root, x.pfad), x.text);
    const html = path.join(root, "index.html");
    const h = fs.readFileSync(html, "utf8");
    if (/^<<<<<<< /m.test(h)) throw new Error("Re-Home: index.html trägt git-Konflikte — erst lösen, dann --weiter");
    fs.writeFileSync(
        html,
        stamm.tagsSetzen(
            h,
            S.map((x) => x.pfad)
        )
    );
    git(root, ["add", "-A", "--", stamm.DIR, "index.html"]);
    return S.map((x) => x.pfad);
}

// Der git-Merge für alles außerhalb des Stamms, dann der Stamm aus T, dann der Commit (Eltern: Zweig + Ziel).
function vollziehe(root, aufSha, aufName, zweigName, T, form, meldung) {
    const r = gitOk(root, ["merge", "--no-ff", "--no-commit", aufSha]);
    if (!r.ok && !fs.existsSync(path.join(gitDir(root), "MERGE_HEAD")))
        throw new Error(`Re-Home: git merge ${aufName} brach ab: ${r.err || r.out}`);
    const dateien = setzeStamm(root, T, form);
    const offen = git(root, ["diff", "--name-only", "--diff-filter=U"]).split("\n").filter(Boolean);
    if (offen.length) return { commit: null, offen, dateien };
    git(root, ["commit", "-q", "--no-verify", "-m", meldung]);
    return { commit: git(root, ["rev-parse", "HEAD"]).trim(), offen: [], dateien };
}

function rehome(root, aufName, opt = {}) {
    if (git(root, ["status", "--porcelain", "--untracked-files=no"]).trim())
        throw new Error("Re-Home: der Arbeitsbaum trägt Änderungen — erst committen");
    const aufSha = git(root, ["rev-parse", aufName]).trim();
    const zweigSha = git(root, ["rev-parse", "HEAD"]).trim();
    const zweigName = git(root, ["rev-parse", "--abbrev-ref", "HEAD"]).trim();
    const formK = formAn(root, aufSha);
    const formZ = formAn(root, zweigSha);
    if (formK === formZ && !opt.immer)
        return {
            noetig: false,
            info: `gleiche Stamm-Form (${formK.slice(0, 40)}…) — ein git-Merge je Datei ist richtig`,
        };
    const t0 = Date.now();
    const p = plane(root, aufSha, zweigSha, [aufName, zweigName]);
    const ms = Date.now() - t0;
    const form = formK === "datei" ? "datei" : "zonen";
    const ergebnis = { noetig: true, ms, n: p.n, konflikte: p.konflikte, basen: p.basen, aufSha, zweigSha };
    if (opt.trocken) return ergebnis;
    if (p.n) {
        fs.writeFileSync(path.join(root, KONFLIKT), p.M);
        fs.writeFileSync(
            path.join(gitDir(root), ZUSTAND),
            JSON.stringify({ aufSha, aufName, zweigSha, zweigName, form }, null, 1)
        );
        return Object.assign(ergebnis, { konfliktDatei: KONFLIKT });
    }
    const meldung =
        `Re-Home ${zweigName} auf ${aufName} ${aufSha.slice(0, 8)}: der Stamm-Merge auf dem virtuellen Text ` +
        `(Basis ${p.basen.map((b) => b.slice(0, 8)).join("+")}, git merge-file histogram, 0 Konflikte), danach S in die Form des Ziels`;
    return Object.assign(ergebnis, vollziehe(root, aufSha, aufName, zweigName, p.M, form, meldung));
}

function weiter(root) {
    const zp = path.join(gitDir(root), ZUSTAND);
    if (!fs.existsSync(zp)) throw new Error("--weiter: kein Re-Home offen");
    const z = JSON.parse(fs.readFileSync(zp, "utf8"));
    if (git(root, ["rev-parse", "HEAD"]).trim() !== z.zweigSha)
        throw new Error("--weiter: HEAD ist nicht mehr die Spitze, an der das Re-Home begann");
    const T = fs.readFileSync(path.join(root, KONFLIKT), "utf8");
    const rest = benenne(T);
    if (rest.length) throw new Error(`--weiter: ${KONFLIKT} trägt noch ${rest.length} Konflikt-Marker`);
    const meldung =
        `Re-Home ${z.zweigName} auf ${z.aufName} ${z.aufSha.slice(0, 8)}: der Stamm-Merge auf dem virtuellen Text, ` +
        `die Konflikte von Hand gelöst, danach S in die Form des Ziels`;
    fs.unlinkSync(path.join(root, KONFLIKT));
    const r = vollziehe(root, z.aufSha, z.aufName, z.zweigName, T, z.form, meldung);
    fs.unlinkSync(zp);
    return r;
}

// ── Selbsttest ────────────────────────────────────────────────────────────────────────────────────────────────────
// (B) die lebenden Zweige gegen integ-probe: Konfliktzahl = git (merge-tree), Text byte-gleich (auch im Konflikt).
// (C) drei echte Integrationen: S(Re-Home) = S(echter Merge) Datei für Datei, Konfliktzahl = git.
// (D) Ende zu Ende in einem geteilten Klon: integ-probe geschnitten, ein lebender Zweig per CLI-Kern darüber getragen.
function gitKonflikte(root, a, b) {
    const r = gitOk(root, ["merge-tree", "--write-tree", "--no-messages", a, b]);
    const baum = r.out.split("\n")[0].trim();
    const blob = gitOk(root, ["cat-file", "-p", `${baum}:${stamm.ALT}`]);
    const t = blob.ok ? blob.out : "";
    return { baum, text: t, n: (t.match(/^<<<<<<< /gm) || []).length, sauber: r.ok };
}

function lebendeZweige(root, ziel, tage) {
    const seit = Date.now() - tage * 864e5;
    const out = [];
    const refs = git(root, ["for-each-ref", "--format=%(refname:short) %(committerdate:unix)", "refs/remotes/origin"])
        .split("\n")
        .filter(Boolean);
    for (const z of refs) {
        const [ref, t] = z.split(" ");
        if (/\/(HEAD|main|integ-probe|stamm-zerlegung|koordination)$/.test(ref) || Number(t) * 1000 < seit) continue;
        if (git(root, ["rev-list", "--count", `${ziel}..${ref}`]).trim() === "0") continue;
        const mb = gitOk(root, ["merge-base", ziel, ref]);
        if (!mb.ok) continue;
        if (gitOk(root, ["diff", "--quiet", mb.out.trim(), ref, "--", stamm.ALT]).ok) continue;
        out.push(ref);
    }
    return out;
}

function selbsttest() {
    let rot = 0;
    const pruef = (name, ok, info) => {
        console.log(`${ok ? "  ok " : "  ROT"} ${name}${info ? " — " + info : ""}`);
        if (!ok) rot++;
    };
    const ziel = "origin/integ-probe";
    // (B)
    const zweige = lebendeZweige(ROOT, ziel, 10);
    let gleichN = 0;
    let gleichT = 0;
    const zeilen = [];
    for (const ref of zweige) {
        const t0 = Date.now();
        const p = plane(ROOT, ziel, ref, [ziel, ref]);
        const g = gitKonflikte(ROOT, ziel, ref);
        if (p.n === g.n) gleichN++;
        if (p.M === g.text) gleichT++;
        zeilen.push(
            `${ref.replace("origin/", "")} ${p.n}=${g.n}${p.basen.length > 1 ? ` (${p.basen.length} Basen)` : ""}` +
                `${p.n ? " [" + p.konflikte.map((k) => k.glied).join(", ") + "]" : ""} ${Date.now() - t0} ms`
        );
    }
    pruef(
        `(B) ${zweige.length} lebende Zweige gegen ${ziel}: Konfliktzahl = git, Text byte-gleich`,
        zweige.length >= 3 && gleichN === zweige.length && gleichT === zweige.length,
        `${gleichN}/${zweige.length} Zahl, ${gleichT}/${zweige.length} Byte`
    );
    for (const z of zeilen) console.log("       " + z);
    // (C)
    // die echten Integrationen (beide Seiten änderten den Stamm) der letzten 16 Merges: die jüngste mit git-Konflikt und
    // die zwei jüngsten ohne
    const merges = git(ROOT, ["log", "--merges", "--first-parent", "--format=%H %P", "-16", ziel, "--", stamm.ALT])
        .split("\n")
        .filter(Boolean)
        .map((z) => z.split(" "))
        .filter(([, k, z]) => {
            const mb = git(ROOT, ["merge-base", k, z]).trim();
            return (
                !gitOk(ROOT, ["diff", "--quiet", mb, z, "--", stamm.ALT]).ok &&
                !gitOk(ROOT, ["diff", "--quiet", mb, k, "--", stamm.ALT]).ok
            );
        })
        .map(([w, k, z]) => ({ w, k, z, g: gitKonflikte(ROOT, k, z) }));
    const wahl = [...merges.filter((x) => x.g.n > 0).slice(0, 1), ...merges.filter((x) => x.g.n === 0).slice(0, 2)];
    let echte = 0;
    let cOk = 0;
    for (const { w, k, z, g } of wahl) {
        echte++;
        const p = plane(ROOT, k, z, ["kopf", "zweig"]);
        // S(Re-Home) gegen S(echter Merge): ohne Konflikt jede Datei gleich; mit Konflikt sind nur die Dateien anders, die
        // einen Hunk tragen (dort steht die Hand des Integrators)
        const Sm = stamm.schneide(p.M);
        const Sw = stamm.schneide(stamm.textAusRev(ROOT, w));
        let gleich = 0;
        const anders = [];
        for (const x of Sm) {
            const y = Sw.find((q) => q.pfad === x.pfad);
            if (y && x.text === y.text) gleich++;
            else anders.push(x.pfad);
        }
        const mitHunk = new Set(Sm.filter((x) => /^<<<<<<< /m.test(x.text)).map((x) => x.pfad));
        const ok = p.n === g.n && Sm.length === Sw.length && anders.every((f) => mitHunk.has(f));
        if (ok) cOk++;
        console.log(
            `       ${w.slice(0, 8)}: ${p.n}=${g.n} Konflikte, ${gleich}/${Sw.length} Dateien byte-gleich zum echten Merge` +
                (anders.length ? ` (von Hand: ${anders.join(", ")})` : "")
        );
    }
    pruef(
        "(C) drei echte Integrationen: Konfliktzahl = git, S(Re-Home) = S(Merge)",
        echte === 3 && cOk === 3,
        `${cOk}/${echte}`
    );
    // (D)
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stamm-rehome-klon-"));
    try {
        const kandidat = zweige.find((ref) => gitKonflikte(ROOT, ziel, ref).sauber);
        if (!kandidat) throw new Error("(D) kein lebender Zweig ohne git-Konflikt");
        const klon = path.join(tmp, "k");
        // die Zeilen-Enden wie das Repo (core.autocrlf=false; der System-Default true machte CRLF aus dem Stamm)
        git(tmp, ["clone", "-q", "--shared", "--no-checkout", "-c", "core.autocrlf=false", ROOT, klon]);
        const ipSha = git(ROOT, ["rev-parse", ziel]).trim();
        const zSha = git(ROOT, ["rev-parse", kandidat]).trim();
        git(klon, ["checkout", "-q", "-b", "probe-schnitt", ipSha]);
        const S = setzeStamm(klon, stamm.text(klon), "zonen");
        git(klon, ["commit", "-q", "--no-verify", "-m", "Probe-Schnitt"]);
        const schnitt = git(klon, ["rev-parse", "HEAD"]).trim();
        git(klon, ["checkout", "-q", "-b", "zweig", zSha]);
        const t0 = Date.now();
        const r = rehome(klon, "probe-schnitt");
        const ms = Date.now() - t0;
        const eltern = git(klon, ["rev-list", "--parents", "-n", "1", "HEAD"]).trim().split(" ").slice(1);
        const g = gitKonflikte(ROOT, ziel, kandidat);
        const Tklon = stamm.text(klon);
        // jede Datei außerhalb des Stamms = gits Merge (vor dem Schnitt); index.html = gits Merge mit den Tags von S
        const baumR = git(klon, ["ls-tree", "-r", "HEAD"]).split("\n").filter(Boolean);
        const baumG = new Map(
            git(ROOT, ["ls-tree", "-r", g.baum])
                .split("\n")
                .filter(Boolean)
                .map((z) => [z.split("\t")[1], z.split(/\s+/)[2]])
        );
        let aussenGleich = 0;
        const aussenAnders = [];
        for (const z of baumR) {
            const [meta, p] = z.split("\t");
            if (p.startsWith(stamm.DIR + "/") || p === "index.html") continue;
            if (baumG.get(p) === meta.split(/\s+/)[2]) aussenGleich++;
            else aussenAnders.push(p);
        }
        // gits Merge-Baum trägt außerhalb genau dieselben Pfade (ohne anazhRealm.js und index.html)
        if (baumG.size - 2 !== aussenGleich + aussenAnders.length) aussenAnders.push(`Pfadzahl ${baumG.size - 2}`);
        const htmlSoll = stamm.tagsSetzen(git(ROOT, ["show", `${g.baum}:index.html`]), S);
        const htmlIst = git(klon, ["show", "HEAD:index.html"]);
        pruef(
            `(D) Ende zu Ende: ${kandidat.replace("origin/", "")} über den Probe-Schnitt`,
            r.commit &&
                eltern[0] === zSha &&
                eltern[1] === schnitt &&
                !fs.existsSync(path.join(klon, stamm.ALT)) &&
                Tklon === g.text &&
                aussenAnders.length === 0 &&
                htmlIst === htmlSoll,
            `Merge-Commit ${String(r.commit).slice(0, 8)} (Eltern Zweig + Schnitt), ${r.dateien.length} Stamm-Dateien, ` +
                `text() = gits Merge-Text ${Tklon === g.text}, außerhalb ${aussenGleich}/${aussenGleich + aussenAnders.length} gleich, ` +
                `index.html ${htmlIst === htmlSoll ? "gleich" : "anders"}, ${ms} ms`
        );
        // (E) ein Konflikt: eine Zeile, die Kopf und Zweig verschieden ändern → Konflikt-Datei, kein Merge, benannt
        git(klon, ["checkout", "-q", "-B", "zweig2", zSha]);
        const T2 = stamm.text(klon).replace(/(\n {4}_bodenSichtAt\([^\n]*\n)/, "$1        // Zweig\n");
        fs.writeFileSync(path.join(klon, stamm.ALT), T2);
        git(klon, ["commit", "-q", "--no-verify", "-am", "Zweig-Zeile"]);
        git(klon, ["checkout", "-q", "probe-schnitt"]);
        const zon = stamm.dateiVon(klon, "_bodenSichtAt");
        const zt = fs.readFileSync(path.join(klon, zon), "utf8");
        fs.writeFileSync(path.join(klon, zon), zt.replace(/(\n {4}_bodenSichtAt\([^\n]*\n)/, "$1        // Kopf\n"));
        git(klon, ["commit", "-q", "--no-verify", "-am", "Kopf-Zeile"]);
        git(klon, ["checkout", "-q", "zweig2"]);
        const r2 = rehome(klon, "probe-schnitt");
        const kopfVorher = git(klon, ["rev-parse", "HEAD"]).trim();
        pruef(
            "(E) ein Konflikt: kein Merge, die Konflikt-Datei, beim Glied benannt",
            r2.n === 1 &&
                r2.konflikte[0].glied === "_bodenSichtAt" &&
                fs.existsSync(path.join(klon, KONFLIKT)) &&
                kopfVorher === r2.zweigSha,
            r2.konflikte.map((k) => `${k.glied}@${k.zeile}`).join(", ")
        );
        // --weiter: von Hand gelöst (beide Zeilen), dann der Merge
        const gel = fs
            .readFileSync(path.join(klon, KONFLIKT), "utf8")
            .replace(/<<<<<<< [^\n]*\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [^\n]*\n/, "$1$2");
        fs.writeFileSync(path.join(klon, KONFLIKT), gel);
        const r3 = weiter(klon);
        pruef(
            "(E) --weiter: der gelöste Text wird S, der Merge-Commit steht",
            !!r3.commit && stamm.text(klon) === gel && !fs.existsSync(path.join(klon, KONFLIKT)),
            String(r3.commit).slice(0, 8)
        );
    } catch (e) {
        pruef("(D/E) Ende zu Ende lief durch", false, e.stack);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    console.log(rot ? `stamm-rehome: ${rot} ROT` : "stamm-rehome: Selbsttest grün");
    return rot;
}

// ── CLI ───────────────────────────────────────────────────────────────────────────────────────────────────────────
function main() {
    const argv = process.argv.slice(2);
    if (argv.includes("--selftest")) return selbsttest() ? 1 : 0;
    if (argv.includes("--weiter")) {
        const r = weiter(ROOT);
        console.log(
            r.commit ? `Re-Home: Merge-Commit ${r.commit.slice(0, 8)}` : `Re-Home: offen ${r.offen.join(", ")}`
        );
        return r.commit ? 0 : 1;
    }
    const auf = argv.includes("--auf") ? argv[argv.indexOf("--auf") + 1] : "origin/main";
    const r = rehome(ROOT, auf, { trocken: argv.includes("--trocken"), immer: argv.includes("--immer") });
    if (!r.noetig) return (console.log(`Re-Home: nicht nötig — ${r.info}`), 0);
    console.log(
        `Re-Home auf ${auf}: ${r.n} Konflikte (Basis ${r.basen.map((b) => b.slice(0, 8)).join("+")}, ${r.ms} ms)`
    );
    for (const k of r.konflikte) console.log(`  Konflikt Zeile ${k.zeile}: ${k.glied}`);
    if (r.konfliktDatei) {
        console.log(`Von Hand lösen in ${r.konfliktDatei}, dann: node scripts/stamm-rehome.cjs --weiter`);
        return 1;
    }
    if (argv.includes("--trocken")) return 0;
    if (r.commit) return (console.log(`Merge-Commit ${r.commit.slice(0, 8)}: ${r.dateien.length} Stamm-Dateien`), 0);
    console.log(`git-Konflikte außerhalb des Stamms (der Stamm steht im Index): ${r.offen.join(", ")}`);
    return 1;
}

if (require.main === module) process.exit(main());
module.exports = { mergeText, basisText, benenne, plane, rehome, weiter, formAn };
