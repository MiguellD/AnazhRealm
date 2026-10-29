// konsum-zeuge.cjs — DER KONSUM-ZEUGE (Spike „Die CI wählt nach Konsum"): per `--require` in JEDEM Node-Prozess eines Laufs
// (NODE_OPTIONS erbt jedes Kind, ein Kind mit eigener env bekommt ihn eingesetzt) nimmt er auf, was der Prozess vom Baum WIRKLICH
// liest — `lies` (Inhalt: readFile · open zum Lesen · createReadStream · copyFile; require und import lesen über readFileSync),
// `liste` (readdir · opendir), `frage` (stat · exists · access · realpath, auch das Fehlende) — und welchen fremden Befehl er
// `ruft` (git, bash, Chrome …: deren Lesungen sieht er nicht, die Spur nennt sie). Was Chrome lädt, liest der Statik-Server
// (welt-boot `statikServer`) über fs.readFile: es steht in der Spur des Servers. npm run liest von package.json nur `teil`e
// (scripts.<x> samt pre/post, name, version, config). Je Prozess EINE Spur, Zeile für Zeile geschrieben (ein SIGKILL verliert
// nichts); die WURZEL ist der Befehl des ersten Node-Prozesses im Schritt (KONSUM_WURZEL, jedes Kind erbt sie).
//   NODE_OPTIONS=--require=$PWD/scripts/lib/konsum-zeuge.cjs KONSUM_ZEUGE=<ordner> <befehl>
//   node scripts/lib/konsum-zeuge.cjs --sammle <ordner> [--aus konsum.json]      (je Wurzel: lies · liste · frage · teil · ruft)
"use strict";
const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");

const ROOT = path.resolve(__dirname, "..", "..");
const ZEUGE = __filename;
const ARTEN = ["lies", "liste", "frage", "teil", "ruft"];

// der Pfad im Baum ("." die Wurzel), node_modules (trägt package-lock.json) und alles außerhalb nie; .git ist EIN Eintrag
function imBaum(p) {
    if (p == null || typeof p === "number" || (typeof p === "object" && !Buffer.isBuffer(p) && !(p instanceof URL)))
        return null;
    let s = p instanceof URL ? p.href : String(p);
    if (s.startsWith("file:"))
        try {
            s = fileURLToPath(s);
        } catch {
            return null;
        }
    const r = path.relative(ROOT, path.resolve(s)).split(path.sep).join("/");
    if (r.startsWith("..") || path.isAbsolute(r) || /^node_modules(\/|$)/.test(r)) return null;
    return /^\.git(\/|$)/.test(r) ? ".git" : r || ".";
}

function installiere(ordner) {
    const roh = { ...fs };
    const a = process.argv.slice(1).map((x, i) => (i === 0 && imBaum(x)) || x);
    const npm = /(npm-cli\.js|\/bin\/npm)$/.test(a[0] || "")
        ? "npm"
        : /(npx-cli\.js|\/bin\/npx)$/.test(a[0] || "")
          ? "npx"
          : null;
    const befehl = (npm ? [npm, ...a.slice(1)] : ["node", ...process.execArgv, ...a]).join(" ");
    const wurzel = (process.env.KONSUM_WURZEL ||= befehl);
    // npm run <x> liest package.json als Ganzes, verbraucht aber nur seine Zeilen (npm ci das Ganze)
    const npmLauf = /^npm (?:run|run-script)(?: -\S+)* ([^\s-]\S*)/.exec(befehl);
    const teile = npmLauf && [
        "name",
        "version",
        "config",
        ...["", "pre", "post"].map((v) => `scripts.${v}${npmLauf[1]}`),
    ];
    const datei = path.join(
        ordner,
        `spur-${process.pid}-${require("worker_threads").threadId}-${Date.now().toString(36)}.tsv`
    );
    roh.mkdirSync(ordner, { recursive: true });
    const fd = roh.openSync(datei, "a");
    roh.writeSync(
        fd,
        JSON.stringify({ pid: process.pid, ppid: process.ppid, wurzel, argv: process.argv, cwd: process.cwd() }) + "\n"
    );
    const schon = new Set();
    const nimm = (art, wert) => {
        if (wert == null || schon.has(art + wert)) return;
        schon.add(art + wert);
        roh.writeSync(fd, `${art}\t${wert}\n`);
    };
    nimm("lies", imBaum(ZEUGE)); // der Zeuge selbst: --require lädt ihn vor jedem Haken
    const notiere = (art, p) => {
        const r = imBaum(p);
        if (r === "package.json" && teile && art !== "liste")
            return teile.forEach((t) => nimm("teil", `package.json#${t}`));
        nimm(art, r);
    };
    const liest = (flags) =>
        flags == null ||
        (typeof flags === "number" ? (flags & 3) !== 1 : /^r/.test(String(flags)) || String(flags).includes("+"));
    const haken = (ziel, name, art, wann = () => true) => {
        const o = ziel[name];
        if (typeof o !== "function") return;
        const neu = function (p, ...rest) {
            if (wann(rest)) notiere(art, p);
            if (name === "copyFile" || name === "copyFileSync" || name === "cpSync" || name === "cp")
                notiere("lies", p);
            return o.call(this, p, ...rest);
        };
        Object.defineProperties(neu, Object.getOwnPropertyDescriptors(o));
        ziel[name] = neu;
    };
    const LIES = ["readFile", "createReadStream", "copyFile", "cp"];
    const LISTE = ["readdir", "opendir"];
    const FRAGE = ["stat", "lstat", "exists", "access", "realpath", "readlink", "statfs", "watch", "watchFile"];
    for (const [art, namen] of [
        ["lies", LIES],
        ["liste", LISTE],
        ["frage", FRAGE],
    ])
        for (const n of namen)
            for (const [ziel, name] of [
                [fs, n],
                [fs, n + "Sync"],
                [fs.promises, n],
            ])
                haken(ziel, name, art);
    for (const [ziel, name] of [
        [fs, "open"],
        [fs, "openSync"],
        [fs.promises, "open"],
    ])
        haken(ziel, name, "lies", (r) => liest(r[0]));
    for (const ziel of [fs.realpath, fs.realpathSync]) haken(ziel, "native", "frage");
    // die Kinder: jeder fremde Befehl steht in der Spur, eine eigene env trägt den Zeugen weiter
    const cp = require("child_process");
    const erbe = { KONSUM_ZEUGE: ordner, KONSUM_WURZEL: wurzel };
    const mitZeuge = (env) => {
        const n = String(env.NODE_OPTIONS || "");
        return { ...erbe, ...env, NODE_OPTIONS: n.includes(ZEUGE) ? n : `${n} ${process.env.NODE_OPTIONS}`.trim() };
    };
    for (const name of ["spawn", "spawnSync", "execFile", "execFileSync", "exec", "execSync", "fork"]) {
        const o = cp[name];
        cp[name] = function (befehl, ...rest) {
            const args = Array.isArray(rest[0]) ? rest[0] : [];
            const zeile = /^exec(Sync)?$/.test(name)
                ? `sh -c ${befehl}`
                : [name === "fork" ? `node ${imBaum(befehl) || befehl}` : befehl, ...args].join(" ");
            nimm("ruft", zeile.replace(/\s+/g, " ").slice(0, 300));
            const o2 = rest.find((x) => x && typeof x === "object" && !Array.isArray(x));
            if (o2 && o2.env) o2.env = mitZeuge(o2.env);
            return o.call(this, befehl, ...rest);
        };
        Object.defineProperties(cp[name], Object.getOwnPropertyDescriptors(o));
    }
}

// die Spuren eines Ordners → je Wurzel die Mengen (frage ohne was gelesen wurde), Prozesse gezählt
function sammle(ordner) {
    const schritte = {};
    let prozesse = 0;
    for (const f of fs
        .readdirSync(ordner)
        .filter((x) => /^spur-.*\.tsv$/.test(x))
        .sort()) {
        const [kopf, ...zeilen] = fs.readFileSync(path.join(ordner, f), "utf8").split("\n");
        let w;
        try {
            w = JSON.parse(kopf).wurzel;
        } catch {
            throw new Error(`ROT: die Spur ${f} trägt keinen Kopf — ihr Prozess ist nicht zuzuordnen`);
        }
        const s = (schritte[w] ||= Object.fromEntries([...ARTEN.map((a) => [a, new Set()]), ["prozesse", 0]]));
        s.prozesse++;
        prozesse++;
        for (const z of zeilen) {
            const t = z.indexOf("\t");
            if (t > 0 && s[z.slice(0, t)]) s[z.slice(0, t)].add(z.slice(t + 1));
        }
    }
    for (const s of Object.values(schritte)) {
        for (const x of s.lies) s.frage.delete(x);
        for (const a of ARTEN) s[a] = [...s[a]].sort();
    }
    return { prozesse, schritte };
}

// DIE GEGENPROBE (Linux): derselbe Befehl unter strace (openat, execve, clone) — jede Datei des Baums (git ls-files) und jedes
// seiner Verzeichnisse, die ein Prozess zum Lesen öffnet, trägt die Spur: ein Node-Prozess als lies/teil (Verzeichnis: liste),
// ein fremder Befehl nur über sein `ruft` oder als Wort des Befehls (ein BLINDER FLECK: der Schritt fährt immer) — sonst ROT
// beim Dateinamen. Was ein fremder Befehl aus .git liest (die Geschichte), steht als blinder Fleck.
async function gegenprobe(befehl, ordner) {
    const [spur, st] = [path.join(ordner, "spur"), path.join(ordner, "strace.txt")];
    const env = { ...process.env, KONSUM_ZEUGE: spur, NODE_OPTIONS: `--require=${ZEUGE}`, KONSUM_WURZEL: "" };
    const cp = require("child_process");
    const strace = ["-f", "-I1", "--seccomp-bpf", "-y", "-e", "trace=openat,execve,clone,clone3,fork,vfork", "-o", st];
    // der Befehl endet mit seiner bash (die Ende-Marke der äußeren), nie mit seinen Waisen: strace löst sich, die Waisen fallen
    const ende = path.join(ordner, "ende");
    const huelle = 'bash -eo pipefail -c "$1"; echo $? > "$2"';
    const kind = cp.spawn("strace", [...strace, "--", "bash", "-c", huelle, "gegenprobe", befehl, ende], {
        cwd: ROOT,
        env,
        stdio: "inherit",
    });
    await new Promise((ok) => {
        const uhr = setInterval(
            () => (fs.existsSync(ende) || kind.exitCode !== null) && (clearInterval(uhr), ok()),
            500
        );
    });
    kind.kill("SIGTERM");
    await new Promise((ok) => (kind.exitCode !== null ? ok() : kind.on("exit", ok)));
    const lauf = {
        status: fs.existsSync(ende) ? Number(fs.readFileSync(ende, "utf8")) : null,
        pids: fs.readFileSync(st, "utf8").match(/^\d+/gm),
    };
    for (const pid of new Set(lauf.pids))
        try {
            process.kill(Number(pid), "SIGKILL");
        } catch {
            // schon fort
        }
    const baum = new Set(
        cp.execFileSync("git", ["ls-files", "-z"], { cwd: ROOT }).toString().split("\0").filter(Boolean)
    );
    for (const f of [...baum])
        for (let d = path.posix.dirname(f); d !== "."; d = path.posix.dirname(d)) baum.add(d + "/");
    const k = sammle(spur);
    const s = Object.fromEntries(ARTEN.map((a) => [a, new Set(Object.values(k.schritte).flatMap((x) => x[a]))]));
    for (const t of s.teil) s.lies.add(t.split("#")[0]);
    const [exe, offen, geoeffnet] = [new Map(), new Map(), new Map()];
    for (const z of fs.readFileSync(st, "utf8").split("\n")) {
        const m = /^(\d+)\s+(.*)$/.exec(z);
        if (!m) continue;
        let [, pid, rest] = m;
        if (rest.endsWith("<unfinished ...>")) {
            offen.set(pid, rest.slice(0, -16));
            continue;
        }
        const weiter = /^<\.\.\. \w+ resumed>(.*)$/.exec(rest);
        if (weiter) [rest] = [(offen.get(pid) || "") + weiter[1], offen.delete(pid)];
        const kind = /^(?:clone3?|v?fork)\(.*\) = (\d+)/.exec(rest);
        if (kind) exe.set(kind[1], exe.get(pid));
        const e = /^execve\("([^"]+)".* = 0$/.exec(rest);
        if (e) exe.set(pid, e[1]);
        const o = /^openat\(.*, ([A-Z_|]+)(?:, \w+)?\) = \d+<([^>]+)>$/.exec(rest);
        if (!o || /O_WRONLY/.test(o[1])) continue;
        const r = imBaum(o[2]);
        const wer = path.basename(exe.get(pid) || "?");
        if (r === ".git" || baum.has(r) || baum.has(r + "/"))
            (geoeffnet.get(wer) || geoeffnet.set(wer, new Map()).get(wer)).set(r + (baum.has(r + "/") ? "/" : ""), pid);
    }
    const node = path.basename(process.execPath);
    const fehlt = [];
    const blind = {};
    for (const [wer, dateien] of geoeffnet) {
        const genannt = [...s.ruft].some(
            (x) => path.basename(x.split(" ")[0]) === wer || x.startsWith(`sh -c ${wer} `)
        );
        if (wer !== node)
            blind[wer] = {
                genannt: genannt || new RegExp(`(^|[\\s;&|(])${wer}\\b`).test(befehl),
                dateien: [...dateien.keys()],
            };
        for (const d of dateien.keys())
            if (
                wer === node
                    ? !(d.endsWith("/") ? s.liste.has(d.slice(0, -1)) || s.lies.has(d.slice(0, -1)) : s.lies.has(d))
                    : !blind[wer].genannt
            )
                fehlt.push(`${wer} ${d}`);
    }
    return {
        befehl,
        exit: lauf.status,
        prozesse: k.prozesse,
        gelesen: [...geoeffnet.values()].reduce((n, m) => n + m.size, 0),
        fehlt,
        blind,
    };
}

module.exports = { imBaum, sammle, gegenprobe, ZEUGE, ARTEN };

// als Befehl (auch unter dem eigenen NODE_OPTIONS: dann läuft die Datei nur als --require) nie als Zeuge
const alsBefehl = path.resolve(process.argv[1] || ".") === ZEUGE;
if (alsBefehl && process.argv.includes("--gegenprobe")) {
    const arg = (n) => process.argv[process.argv.indexOf(n) + 1];
    const ordner = process.argv.includes("--ordner")
        ? arg("--ordner")
        : fs.mkdtempSync(path.join(require("os").tmpdir(), "gegenprobe-"));
    gegenprobe(arg("--gegenprobe"), ordner).then((g) => {
        console.log(JSON.stringify({ ...g, ordner }, null, 1));
        const rot = [
            g.exit !== 0 && `der Befehl endete mit ${g.exit} — eine rote Spur beweist nichts`,
            g.fehlt.length &&
                `${g.fehlt.length} gelesene Dateien des Baums fehlen in der Spur: ${g.fehlt.slice(0, 20).join(" · ")}`,
        ].filter(Boolean);
        console.log(
            rot.length
                ? `❌ ROT — ${rot.join(" · ")}`
                : `✅ GRÜN — ${g.gelesen} gelesene Dateien des Baums, jede in der Spur oder an einem genannten blinden Fleck (${Object.keys(g.blind).join(" · ") || "keiner"})`
        );
        process.exitCode = rot.length ? 1 : 0;
    });
} else if (alsBefehl && process.argv.includes("--sammle")) {
    const arg = (n) => process.argv[process.argv.indexOf(n) + 1];
    const k = sammle(arg("--sammle"));
    const kopf =
        process.env.GITHUB_SHA ||
        require("child_process").execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT }).toString().trim();
    const j = JSON.stringify({ kopf, gruppe: process.env.KONSUM_GRUPPE || null, ...k }, null, 1);
    if (process.argv.includes("--aus")) fs.writeFileSync(arg("--aus"), j + "\n");
    else console.log(j);
    console.error(`[konsum-zeuge] ${Object.keys(k.schritte).length} Wurzeln aus ${k.prozesse} Prozessen`);
} else if (!alsBefehl && process.env.KONSUM_ZEUGE && !global[Symbol.for("konsum-zeuge")]) {
    global[Symbol.for("konsum-zeuge")] = true;
    installiere(path.resolve(process.env.KONSUM_ZEUGE));
}
