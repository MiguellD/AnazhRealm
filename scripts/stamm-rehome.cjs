"use strict";
const { ausDatei } = require("./lib/welt-boot.cjs");
/* global process, console, __dirname */
// scripts/stamm-rehome.cjs — trägt einen Zweig über den Stamm-Schnitt (Stamm-Zerlegung).
//
// Ein Zweig, der vor dem Schnitt abzweigte (oder über dessen Basis ein `--teile` lief), trägt den Stamm in einer anderen
// Form als sein Ziel. Ein git-Merge je Datei sähe modify/delete bzw. add/add; dieses Werkzeug merged stattdessen den
// VIRTUELLEN Stamm (scripts/lib/stamm.cjs `textAusRev`): Basis = Stamm-Text an der Merge-Basis (bei mehreren Basen die
// virtuelle Basis wie merge-ort: paarweise rekursiv, „Temporary merge branch 1/2"), Kopf = Stamm-Text des Ziels, Zweig =
// Stamm-Text der Spitze; darauf `git merge-file --diff-algorithm=histogram` (der Algorithmus von merge-ort), danach S in
// die Form des Ziels. Weil der Merge auf demselben Text wie git läuft, sind die Konflikte per Konstruktion die von git;
// benannt werden sie nach dem Glied, das den Hunk trägt. Alles außerhalb des Stamms merged git selbst. Steht das Ziel nach
// DOMÄNE, stellt `ordne` Basis und Zweig vor dem Merge in die Ordnung der Karte des Ziels (ein Umzug ist dann kein
// Konflikt, nur eine Ordnung); ein neues Glied des Zweigs nimmt die Karte beim Vorgänger auf (`heileKarte`, benannt).
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
    let Tz = stamm.textAusRev(root, zweig);
    let Tb = basis.text;
    if (stamm.marker(Tk).some((m) => m.schluessel)) {
        const K = stamm.karteAus(git(root, ["show", `${auf}:${stamm.KARTE}`]));
        Tb = stamm.ordne(Tb, K).text;
        Tz = stamm.ordne(Tz, K).text;
    }
    const M = mergeText(Tk, Tb, Tz, [namen[0], "basis", namen[1]]);
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
        const h = ausDatei(html);
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
    fs.mkdirSync(dir, { recursive: true }); // git rm nahm mit der letzten alten Datei das Verzeichnis
    for (const x of S) fs.writeFileSync(path.join(root, x.pfad), x.text);
    const html = path.join(root, "index.html");
    const h = ausDatei(html);
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
    // die Domäne: die Karte des Ziels nimmt die neuen Glieder des Zweigs auf, der Text steht in ihrer Ordnung
    if (form === "zonen" && stamm.marker(T).some((m) => m.schluessel)) {
        const h = stamm.heileKarte(T, stamm.karteVon(root));
        fs.writeFileSync(path.join(root, stamm.KARTE), stamm.karteText(h.karte));
        git(root, ["add", "--", stamm.KARTE]);
        T = stamm.ordne(T, h.karte).text;
        for (const n of h.neu) console.log(`  Karte: ${n.name} → ${n.soll} (beim Vorgänger)`);
    }
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
    const z = ausDatei(zp, true);
    if (git(root, ["rev-parse", "HEAD"]).trim() !== z.zweigSha)
        throw new Error("--weiter: HEAD ist nicht mehr die Spitze, an der das Re-Home begann");
    const T = ausDatei(path.join(root, KONFLIKT));
    const rest = benenne(T);
    if (rest.length) throw new Error(`--weiter: ${KONFLIKT} trägt noch ${rest.length} Konflikt-Marker`);
    const meldung =
        `Re-Home ${z.zweigName} auf ${z.aufName} ${z.aufSha.slice(0, 8)}: der Stamm-Merge auf dem virtuellen Text, ` +
        `die Konflikte von Hand gelöst, danach S in die Form des Ziels`;
    // der gelöste Text fällt erst, wenn der Merge steht — bricht vollziehe (index.html mit Konflikten), bleibt er für
    // das nächste --weiter liegen
    const r = vollziehe(root, z.aufSha, z.aufName, z.zweigName, T, z.form, meldung);
    fs.unlinkSync(path.join(root, KONFLIKT));
    fs.unlinkSync(zp);
    return r;
}

// ── Selbsttest (D2: der Umzug nach Domäne als Ziel) ─────────────────────────────────────────────────────────────────
// Ein geteilter Klon an integ-probe trägt den Probe-Umzug (die Karte dieses Baums, `ordne` + S) als Commit; darüber
// (B) jeder lebende Zweig mit Stamm-Änderung trocken: Konfliktzahl = gits Zahl im alten Layout, ohne Konflikt der Text =
//     ordne(gits Merge-Text) — der Umzug ist kein Konflikt, nur eine Ordnung;
// (D) einer Ende zu Ende: Merge-Commit (Eltern Zweig + Umzug), außerhalb des Stamms = gits Merge, text() = ordne(git);
// (E) ein Konflikt: keine Merge, die Konflikt-Datei beim Glied benannt, --weiter trägt den gelösten Text.
function gitMerge(root, a, b) {
    const r = gitOk(root, ["merge-tree", "--write-tree", "--no-messages", a, b]);
    const baum = r.out.split("\n")[0].trim();
    const text = stamm.textAusRev(root, baum);
    return { baum, text, n: (text.match(/^<<<<<<< /gm) || []).length, sauber: r.ok };
}

function lebendeZweige(root, ziel, tage) {
    const seit = Date.now() - tage * 864e5;
    const out = [];
    // Der volle Name: `refname:short` kürzt den Fern-Kopf refs/remotes/origin/HEAD zu „origin“, den kein Zweig-Filter
    // fängt; ein symbolischer Verweis (`symref`) ist nie ein Zweig.
    const refs = git(root, ["for-each-ref", "--format=%(refname) %(committerdate:unix) %(symref)", "refs/remotes/origin"])
        .split("\n")
        .filter(Boolean);
    for (const z of refs) {
        const [voll, t, symref] = z.split(" ");
        const ref = voll.replace(/^refs\/remotes\//, "");
        if (symref || /\/(HEAD|main|integ-probe|stamm-domaene|koordination)$/.test(ref) || Number(t) * 1000 < seit) continue;
        if (git(root, ["rev-list", "--count", `${ziel}..${ref}`]).trim() === "0") continue;
        const mb = gitOk(root, ["merge-base", ziel, ref]);
        if (!mb.ok || formAn(root, mb.out.trim()) === "datei") continue;
        if (gitOk(root, ["diff", "--quiet", mb.out.trim(), ref, "--", `${stamm.DIR}/`]).ok) continue;
        out.push(ref);
    }
    return out;
}

function selbsttest() {
    const pruef = stamm.pruefZaehler();
    const ziel = "origin/integ-probe";
    const K = stamm.karteVon(ROOT);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stamm-rehome-klon-"));
    try {
        // (A) der Probe-Umzug im geteilten Klon (die Zeilen-Enden wie das Repo: core.autocrlf=false)
        const klon = path.join(tmp, "k");
        git(tmp, ["clone", "-q", "--shared", "--no-checkout", "-c", "core.autocrlf=false", ROOT, klon]);
        git(klon, ["fetch", "-q", ROOT, "+refs/remotes/origin/*:refs/remotes/origin/*"]);
        const ipSha = git(klon, ["rev-parse", ziel]).trim();
        git(klon, ["checkout", "-q", "-b", "probe-umzug", ipSha]);
        fs.writeFileSync(path.join(klon, stamm.KARTE), stamm.karteText(K));
        const S = setzeStamm(klon, stamm.ordne(stamm.text(klon), K).text, "zonen");
        git(klon, ["add", "--", stamm.KARTE]);
        git(klon, ["commit", "-q", "--no-verify", "-m", "Probe-Umzug nach Domäne"]);
        const umzug = git(klon, ["rev-parse", "HEAD"]).trim();
        // (B)
        const zweige = lebendeZweige(klon, ziel, 10);
        let gut = 0;
        const sauber = [];
        for (const ref of zweige) {
            const t0 = Date.now();
            const p = plane(klon, "probe-umzug", ref, ["probe-umzug", ref]);
            const g = gitMerge(klon, ziel, ref);
            const text = p.n ? null : stamm.ordne(g.text, K).text === p.M;
            if (p.n === g.n && text !== false) gut++;
            if (!p.n && g.sauber) sauber.push(ref);
            console.log(
                `       ${ref.replace("origin/", "")} ${p.n}=${g.n}${text === null ? "" : text ? ", Text = ordne(git)" : ", Text ≠ ordne(git)"}` +
                    `${p.n ? " [" + p.konflikte.map((k) => k.glied).join(", ") + "]" : ""} ${Date.now() - t0} ms`
            );
        }
        pruef(
            `(B) ${zweige.length} lebende Zweige über den Probe-Umzug: Konfliktzahl = git, ohne Konflikt der Text = ordne(git)`,
            zweige.length >= 2 && gut === zweige.length,
            `${gut}/${zweige.length}`
        );
        // (D) Ende zu Ende
        const kandidat = sauber[0];
        if (!kandidat) throw new Error("(D) kein lebender Zweig ohne Konflikt");
        const zSha = git(klon, ["rev-parse", kandidat]).trim();
        git(klon, ["checkout", "-q", "-b", "zweig", zSha]);
        const t0 = Date.now();
        const r = rehome(klon, "probe-umzug");
        const ms = Date.now() - t0;
        const eltern = git(klon, ["rev-list", "--parents", "-n", "1", "HEAD"]).trim().split(" ").slice(1);
        const g = gitMerge(klon, ziel, kandidat);
        const soll = stamm.ordne(g.text, stamm.heileKarte(g.text, K).karte).text;
        const baumG = new Map(
            git(klon, ["ls-tree", "-r", g.baum])
                .split("\n")
                .filter(Boolean)
                .map((z) => [z.split("\t")[1], z.split(/\s+/)[2]])
        );
        const anders = git(klon, ["ls-tree", "-r", "HEAD"])
            .split("\n")
            .filter(Boolean)
            .map((z) => z.split("\t"))
            .filter(([, p]) => !p.startsWith(stamm.DIR + "/") && p !== "index.html" && p !== stamm.KARTE)
            .filter(([meta, p]) => baumG.get(p) !== meta.split(/\s+/)[2])
            .map(([, p]) => p);
        const htmlSoll = stamm.tagsSetzen(git(klon, ["show", `${g.baum}:index.html`]), S);
        pruef(
            `(D) Ende zu Ende: ${kandidat.replace("origin/", "")} über den Probe-Umzug`,
            r.commit &&
                eltern[0] === zSha &&
                eltern[1] === umzug &&
                stamm.text(klon) === soll &&
                anders.length === 0 &&
                git(klon, ["show", "HEAD:index.html"]) === htmlSoll,
            `Merge-Commit ${String(r.commit).slice(0, 8)}, ${r.dateien.length} Stamm-Dateien, text() = ordne(git) ` +
                `${stamm.text(klon) === soll}, außerhalb anders: ${anders.join(", ") || "-"}, ${ms} ms`
        );
        // (E) ein Konflikt: eine Zeile, die Umzug-Seite und Zweig verschieden ändern
        git(klon, ["checkout", "-q", "-B", "zweig2", ipSha]);
        const zon = stamm.dateiVon(klon, "_bodenSichtAt");
        const zt = ausDatei(path.join(klon, zon));
        fs.writeFileSync(path.join(klon, zon), zt.replace(/(\n {4}_bodenSichtAt\([^\n]*\n)/, "$1        // Zweig\n"));
        git(klon, ["commit", "-q", "--no-verify", "-am", "Zweig-Zeile"]);
        git(klon, ["checkout", "-q", "probe-umzug"]);
        const zk = stamm.dateiVon(klon, "_bodenSichtAt");
        const kt = ausDatei(path.join(klon, zk));
        fs.writeFileSync(path.join(klon, zk), kt.replace(/(\n {4}_bodenSichtAt\([^\n]*\n)/, "$1        // Kopf\n"));
        git(klon, ["commit", "-q", "--no-verify", "-am", "Kopf-Zeile"]);
        git(klon, ["checkout", "-q", "zweig2"]);
        const r2 = rehome(klon, "probe-umzug");
        pruef(
            "(E) ein Konflikt: kein Merge, die Konflikt-Datei, beim Glied benannt",
            r2.n === 1 &&
                r2.konflikte[0].glied === "_bodenSichtAt" &&
                fs.existsSync(path.join(klon, KONFLIKT)) &&
                git(klon, ["rev-parse", "HEAD"]).trim() === r2.zweigSha,
            r2.konflikte.map((k) => `${k.glied}@${k.zeile}`).join(", ")
        );
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
        pruef("(A–E) lief durch", false, e.stack);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    return pruef.ende("stamm-rehome");
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
