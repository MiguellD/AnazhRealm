#!/usr/bin/env node
// omen-messfolge.cjs — DIE EINE MESS-FOLGE je Boot (Welle K, 07.10.). Befund: der OMEN (GTX 1060, der ruhige Messplatz) fuhr
// jeden Stand mit einer Befehlsfolge, die in jeder Nachricht neu stand — und zweimal maß er Falsches, ohne dass eine Zahl es
// zeigte: `band` vor `lauf` (die Bank-Frames ohne rAF füllen den Zeitstempel-Pool, jeder Pass-Stempel danach ist blind) und
// das „tauende" Wetter (die Bühne hielt die Uhr des Auto-Zugs, ein anderer Schreiber drehte trotzdem sunny → rainy; V18.534
// in einem B-Boot). Diese Datei IST die Folge: sie startet die Welt (`werkbank start --echt`), fährt die Schritte in fester
// Ordnung, prüft nach jedem Schritt jede Wache und schreibt EIN JSON je Boot — jeder Stand misst gleich.
//
//   DIE FOLGE: boot · dorf-aus (`window.__anazhAutoSettlement = false`, vor dem Umstellen) · fenster 1920 1080 · umstellen
//   --ort wiese · buehne (einmal: Mittag · Sonne · Sommer, das Wetter gehalten) · lauf voll · lauf frei (je `lauf 30 --ein 20
//   --ruhe 300 --tiere frei`) · gpu-bank (12 × 3 je Blick: Gier 0 und −0,88, danach zurück zur Gier des Orts) · band ·
//   profil (12 s, Regler voll, Top 60) — und stop.
//   DIE WACHEN nach jedem Schritt (`/wache` der Werkbank):
//     WETTER   ab der Bühne: kein Schreiber dreht das Wetter (das Buch des Wetter-Spions, `wetterUrteil`), die Uhr des
//              Auto-Zugs steht eingefroren, das Wort bleibt „sunny";
//     WELTAKT  ab der Bühne: kein Welt-Akt der DSL (Dorf, Spawn, Tier-Spawn, Größen-/Tempo-Würfel, Tageszeit …) läuft unter dem
//              Halt durch — die Engstelle `dslEval` verweigert jeden, das Buch des Welt-Akt-Spions nennt ihn (`weltaktUrteil`);
//     STEMPEL  der Zeitstempel-Pool läuft in KEINEM Schritt über (sonst ist jeder Pass-Stempel danach blind);
//     ORT      vor und nach jedem messenden Schritt: aufgestellt am Ort, Dorf-Zug und Ort-Takt wie der Ort sie will, die Gier
//              des Orts, der Spieler am Messort (≤ 8 m) — `BAND.ortGestellt`;
//     FENSTER  vor und nach jedem messenden Schritt: der Viewport 1920 × 1080;
//     FOLGE    die Schritte in der Ordnung der FOLGE: kein Lauf nach einem Pool-Füller (gpu-bank, band), die Bühne vor dem
//              ersten Messen, der Dorf-Zug ruht vor dem Umstellen.
//   DIE TIERE neben jeder Messung (OMEN 07.10.: sie streuen zwischen Boots von 0 bis 3 Arten im Bild, 11–101 Befehle — der
//   größte unbenannte Störfaktor jeder ABAB): je messendem Schritt und je Blick der Bank die Zahl gesamt, im Sichtkegel (davon
//   nah), mit Schatten-Wurf je Kaskade (k0/k1) und die Arten (`tierZahl` der Werkbank) — im JSON und in `kurz`, damit Boots
//   vergleichbar gefiltert werden. Die Zahl ist Weltzustand und nie rot; nur ein fehlender oder zerbrochener Zähler ist ein
//   Befund (`tierUrteil`: die Messung stünde ohne ihre Tiere).
//   Die Messwerte stehen roh je Schritt im JSON, dazu die Kurzfassung (`kurz`): fps · Frame p50/p95/max · CPU-Takt · render-EWMA
//   je Lauf, gpu-bank, Band-Urteil, Profil-Top, die Tiere je Messung. Die render-EWMA ist die WANDUHR der Render-Phase
//   (`_loopShadowUpdate` + `_loopRender`) und trägt den Takt-Zustand der CPU mit (0710-11, Werkbank an der Wiese: dieselbe feste
//   Rechnung lief 12–15 % langsamer, wenn der Takt davor leichter war; eine Dosis Rechnung vor dem Render kürzte die Phase,
//   ein leichterer Takt dehnte sie bei gleichem Render-Pfad um 0,26–0,41 ms) — die Zeile nennt sie so; ein Kosten-Urteil über
//   den Render geben gpu-bank, Band und die Frame-Zeit, über die CPU der CPU-Takt (die Summe aller Phasen). Exit 0 = alle Wachen grün, 1 = eine Wache rot (der Lauf
//   misst Falsches — die Zahlen stehen trotzdem im JSON, beim Namen markiert), 2 = Abbruch. Am Ende stirbt die Werkbank samt
//   Chrome (`beendeBaum`: `/stop`, und hängt er, der ganze Prozess-Baum) — erst dann endet die Folge.
//
//   node scripts/omen-messfolge.cjs [--port 4490] [--seite http://localhost:4312] [--serie <name>] [--datei f.json]
//                                   [--lauf-sek 30] [--ein 20] [--ruhe 300] [--profil-sek 12] [--proben 6]
//   node scripts/omen-messfolge.cjs --selbsttest       (ohne Welt: jede Wache und die Folge-Regel fallen bei ihrem Täter rot)
//
// Der save-server läuft vorher (`npm start`, :4312 — am OMEN der Mess-Klon); die Werkbank startet und stoppt die Folge selbst
// (ein Boot je Aufruf; `--serie` hält das Profil für den Zweit-Boot).
"use strict";
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, execSync } = require("child_process");
const BAND = require("./lib/band-urteil.cjs");
const { wetterUrteil, weltaktUrteil } = require("./lib/ausgabe-aufnahme.cjs");

const root = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};

// DIE FOLGE — fest; die Ordnung ist das Gesetz der Messung.
const FOLGE = [
    "boot",
    "dorf-aus",
    "fenster",
    "umstellen",
    "buehne",
    "lauf-voll",
    "lauf-frei",
    "gpu-bank",
    "band",
    "profil",
];
const FENSTER = [1920, 1080];
const ORT = "wiese";
// die messenden Schritte (Ort und Fenster gelten vor und nach ihnen), die Leser der Pass-Stempel und die Pool-Füller
const MESSEN = new Set(["lauf-voll", "lauf-frei", "gpu-bank", "band", "profil"]);
const STEMPEL_LESER = new Set(["lauf-voll", "lauf-frei"]);
const POOL_FUELLER = new Set(["gpu-bank", "band"]);
// die Blicke der GPU-Bank (Gier, Bogenmaß): der Blick des Orts und der Schräg-Blick, in dem die ferne Kaskade mehr nimmt
const BANK_GIER = [0, -0.88];

// DIE FOLGE-REGEL (rein): die gefahrenen Schritte gegen das Gesetz der Messung — jeder Bruch beim Namen.
function folgeUrteil(namen) {
    const v = [];
    let i = -1;
    for (const n of namen) {
        const j = FOLGE.indexOf(n);
        if (j < 0) v.push(`FOLGE: unbekannter Schritt „${n}"`);
        else if (j <= i) v.push(`FOLGE: „${n}" nach „${FOLGE[i]}" — die Ordnung ist ${FOLGE.join(" · ")}`);
        else i = j;
    }
    const pos = (n) => namen.indexOf(n);
    for (const l of STEMPEL_LESER)
        for (const f of POOL_FUELLER)
            if (pos(l) >= 0 && pos(f) >= 0 && pos(f) < pos(l))
                v.push(`FOLGE: ${f} vor ${l} — der Pool ist gefüllt, jeder Pass-Stempel des Laufs ist blind`);
    const erstesMessen = namen.findIndex((n) => MESSEN.has(n));
    if (erstesMessen >= 0) {
        for (const n of ["dorf-aus", "fenster", "umstellen", "buehne"])
            if (pos(n) < 0 || pos(n) > erstesMessen)
                v.push(`FOLGE: „${n}" fehlt vor dem ersten Messen (${namen[erstesMessen]})`);
    }
    if (pos("dorf-aus") > pos("umstellen") && pos("umstellen") >= 0)
        v.push("FOLGE: der Dorf-Zug ruht erst nach dem Umstellen — der Ort stand mit laufendem Zug");
    return v;
}

// DER TIER-ZÄHLER (rein): steht er in der Wache eines messenden Schritts, vorhanden und ohne NaN? Die Zahl selbst ist
// Weltzustand und nie rot — nur ein fehlender oder zerbrochener Zähler ist ein Befund (die Messung stünde ohne ihre Tiere).
function tierUrteil(name, t) {
    if (!t || typeof t !== "object") return [`TIERE ${name}: kein Tier-Zähler — die Messung steht ohne ihre Tiere`];
    const v = [];
    const zahlen = { gesamt: t.gesamt, sicht: t.sicht, sichtNah: t.sichtNah };
    if (!t.schatten || typeof t.schatten !== "object") v.push(`TIERE ${name}: kein Schatten-Wurf je Kaskade gezählt`);
    else for (const [k, n] of Object.entries(t.schatten)) zahlen["schatten " + k] = n;
    if (!t.arten || typeof t.arten !== "object") v.push(`TIERE ${name}: keine Arten gezählt`);
    else for (const [a, n] of Object.entries(t.arten)) zahlen["Art " + a] = n;
    for (const [k, n] of Object.entries(zahlen))
        if (typeof n !== "number" || !Number.isFinite(n)) v.push(`TIERE ${name}: ${k} ist ${n}`);
    return v;
}
// die Tiere in der Kurzfassung (je Messung eine Zeile im Bericht)
const tierKurz = (t) =>
    t && typeof t === "object"
        ? { gesamt: t.gesamt, sicht: t.sicht, sichtNah: t.sichtNah, schatten: t.schatten, arten: t.arten }
        : null;
const tierZeile = (t) =>
    t
        ? `Tiere ${t.gesamt} (Sicht ${t.sicht}, nah ${t.sichtNah}, Schatten ` +
          `${Object.entries(t.schatten || {})
              .map(([k, n]) => k + " " + n)
              .join(" / ")}; ${Object.entries(t.arten || {})
              .map(([a, n]) => a + " " + n)
              .join(", ")})`
        : "Tiere ?";

// DIE WACHEN EINES SCHRITTS (rein): `vor` und `nach` sind Antworten von `/wache` (vor dem Schritt, nach ihm), `ort` der Messort
// (spec/profiband/haushalt.json), `gehalten` = die Bühne steht (ab dem Schritt „buehne"). Nach jedem messenden Schritt steht
// der Tier-Zähler in der Wache (`tierUrteil`).
function wachenUrteil(name, vor, nach, ort, gehalten) {
    const v = [];
    if (!nach) return [`WACHE ${name}: keine Antwort der Werkbank`];
    if (gehalten) {
        const w = wetterUrteil({
            vorher: vor ? vor.wetter.wetter : nach.wetter.wetter,
            nachher: nach.wetter.wetter,
            uhrVorher: vor ? vor.wetter.uhr : nach.wetter.uhr,
            uhrNachher: nach.wetter.uhr,
            buch: nach.wetter.buch,
        });
        for (const t of w.taeter) v.push(`WETTER ${name}: ${t}`);
        if (nach.wetter.wetter !== "sunny")
            v.push(`WETTER ${name}: das Wetter ist „${nach.wetter.wetter}", die Bühne hält „sunny"`);
        for (const t of weltaktUrteil(nach.weltakt).taeter) v.push(`WELTAKT ${name}: ${t}`);
    }
    const s0 = vor && vor.stempel,
        s1 = nach.stempel;
    if (s1 && Number.isFinite(s1.ueberlauf)) {
        const d = s1.ueberlauf - (s0 && Number.isFinite(s0.ueberlauf) ? s0.ueberlauf : 0);
        if (d > 0)
            v.push(
                `STEMPEL ${name}: ${d} verweigerte Abfragen (Pool ${s1.pool ? s1.pool.stand + "/" + s1.pool.max : "?"}) — ` +
                    "jeder Pass-Stempel danach ist blind" +
                    (s1.taeter && Object.keys(s1.taeter).length
                        ? "; Täter: " +
                          Object.entries(s1.taeter)
                              .sort((x, y) => y[1] - x[1])
                              .slice(0, 3)
                              .map(([k, n]) => `${k} ${n}`)
                              .join(" · ")
                        : "")
            );
    }
    if (MESSEN.has(name)) {
        for (const [wann, w] of [
            ["vor", vor],
            ["nach", nach],
        ]) {
            if (!w) {
                v.push(`ORT ${name}: keine Wache ${wann} dem Schritt`);
                continue;
            }
            for (const f of BAND.ortGestellt(ort, w.ort)) v.push(`ORT ${name} (${wann}): ${f}`);
            const d = Math.hypot(w.ort.spieler[0] - ort.spieler[0], w.ort.spieler[1] - ort.spieler[1]);
            if (!(d <= 8))
                v.push(
                    `ORT ${name} (${wann}): der Spieler steht ${d.toFixed(1)} m vom Messort ${ort.spieler.join(" ")}`
                );
            const f = w.fenster && w.fenster.innen;
            if (!f || f[0] !== FENSTER[0] || f[1] !== FENSTER[1])
                v.push(`FENSTER ${name} (${wann}): ${f ? f.join(" × ") : "?"} statt ${FENSTER.join(" × ")}`);
        }
        v.push(...tierUrteil(name, nach.tiere));
    }
    return v;
}

// DAS ENDE DER WERKBANK (Gegenprüfung 07.10.): `/stop` beendet sie samt Chrome; die Folge wartet auf ihr Ende (`frist`). Hängt
// `/stop` (eine tote Seite, ein hängender Browser), stirbt der ganze Prozess-Baum — Werkbank und Chrome (Windows:
// `taskkill /T /F`, ein TerminateProcess allein ließe Chrome stehen; sonst SIGTERM, puppeteer räumt Chrome, dann SIGKILL).
// Vorher stand `kind.kill` in einem unref-Timer direkt vor `process.exit`: er feuerte nie — unter POSIX blieb die Werkbank
// mit Port und Chrome als Waise stehen (unter Windows riss erst der libuv-Job der Folge sie beim Ende mit, still).
// Rückgabe: wie sie endete (`stop` · `getoetet` · `beendet` = schon vorher · `waise`).
async function beendeBaum(kind, frist) {
    const lebt = () => kind.exitCode === null && kind.signalCode === null;
    if (!lebt()) return "beendet";
    const ende = new Promise((res) => kind.once("exit", () => res(true)));
    const warte = (ms) => Promise.race([ende, new Promise((res) => setTimeout(() => res(false), ms))]);
    if (await warte(frist)) return "stop";
    try {
        if (process.platform === "win32") execSync(`taskkill /PID ${kind.pid} /T /F`, { stdio: "ignore" });
        else {
            kind.kill("SIGTERM");
            if (!(await warte(10000))) kind.kill("SIGKILL");
        }
    } catch (_e) {
        try {
            kind.kill("SIGKILL");
        } catch (_e2) {}
    }
    return (await warte(10000)) || !lebt() ? "getoetet" : "waise";
}

// Ein Abbruch der Werkbank ist ein Fehler-TEXT (`{ fehler: "…" }`); die Liste `fehler` eines Laufs sind die Konsolen-Zeilen
// der Seite (sie reisen im JSON mit, sie sind keine Wache).
const abbruchVon = (o) => (o && typeof o.fehler === "string" ? o.fehler : null);

// Die Kurzfassung eines Laufs (das, was der OMEN-Bericht zitiert).
function laufKurz(l) {
    if (!l || abbruchVon(l)) return l ? { fehler: abbruchVon(l) } : null;
    const ph = l.phasenEwmaMs || {};
    return {
        fps: l.fps,
        frames: l.frames,
        frameMs: l.frameMs,
        cpuTaktMs: l.cpuTaktMs,
        gpuDurchsatzMs: l.gpuDurchsatzMs,
        renderEwmaMs: ph.render != null ? ph.render : null,
        befehle: l.befehle ? { mittel: l.befehle.mittel, max: l.befehle.max } : null,
        dreiecke: l.dreiecke ? { mittel: l.dreiecke.mittel, max: l.dreiecke.max } : null,
        vramMB: l.vramMB ? l.vramMB.jetzt : null,
        stempelGueltig: l.stempel ? l.stempel.gueltig : null,
        wetter: l.wetterHalt ? l.wetterHalt.urteil : null,
        ruhe: l.ruhe ? l.ruhe.ruhig : null,
    };
}

// ── der Lauf gegen die Werkbank ─────────────────────────────────────────────────────────────────────────────────────
function rufe(port, weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            { host: "127.0.0.1", port, path: weg, method: "POST", headers: { "Content-Type": "application/json" } },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        res({ roh: d });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(body);
    });
}

async function folge() {
    const PORT = Number(opt("--port", process.env.WERKBANK_PORT || 4490));
    const SEITE = String(opt("--seite", process.env.WERKBANK_SEITE || "http://localhost:4312"));
    const SERIE = opt("--serie", "");
    const P = {
        laufSek: Number(opt("--lauf-sek", 30)),
        ein: Number(opt("--ein", 20)),
        ruhe: Number(opt("--ruhe", 300)),
        profilSek: Number(opt("--profil-sek", 12)),
        proben: Number(opt("--proben", 6)),
    };
    const git = (c) => {
        try {
            return execSync(`git ${c}`, { cwd: root, encoding: "utf8" }).trim();
        } catch (_e) {
            return null;
        }
    };
    const sha = git("rev-parse HEAD");
    const start = new Date();
    const datei = path.resolve(
        opt(
            "--datei",
            path.join(
                root,
                "artifacts",
                "omen",
                `messfolge-${(sha || "ohne-git").slice(0, 8)}-${start.toISOString().replace(/[:.]/g, "-")}.json`
            )
        )
    );
    fs.mkdirSync(path.dirname(datei), { recursive: true });
    const { ort } = BAND.ladeSpec(ORT);
    const aus = {
        folge: FOLGE,
        stand: {
            sha,
            zweig: git("rev-parse --abbrev-ref HEAD"),
            schmutzig: !!git("status --porcelain"),
            version: null,
        },
        start: start.toISOString(),
        rechner: { name: os.hostname(), cpu: (os.cpus()[0] || {}).model || null },
        parameter: Object.assign({ port: PORT, seite: SEITE, serie: SERIE || null, ort: ORT, fenster: FENSTER }, P),
        schritte: [],
        befunde: [],
        kurz: {},
        urteil: null,
    };
    const schreibe = () => fs.writeFileSync(datei, JSON.stringify(aus, null, 1));
    const log = [];
    const args = [path.join(__dirname, "werkbank.cjs"), "start", "--echt", "--port", String(PORT), "--seite", SEITE];
    if (SERIE) args.push("--serie", SERIE);
    const kind = spawn(process.execPath, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let bereit = null;
    const fertigP = new Promise((res) => (bereit = res));
    const zeile = (d) => {
        for (const l of String(d).split("\n").filter(Boolean)) {
            log.push(l);
            if (log.length > 200) log.shift();
            if (/WERKBANK bereit/.test(l)) bereit(true);
        }
    };
    kind.stdout.on("data", zeile);
    kind.stderr.on("data", zeile);
    kind.on("exit", (c) => {
        log.push(`[werkbank] Ende mit ${c}`);
        bereit(false);
    });
    const R = (weg, n) => rufe(PORT, weg, n);
    let vor = null;
    let gehalten = false;
    const gefahren = [];
    const schritt = async (name, tat) => {
        const t0 = Date.now();
        const e = { name, ergebnis: null, ms: 0, befunde: [] };
        aus.schritte.push(e);
        console.log(`[folge] ${name} …`);
        e.ergebnis = await tat();
        e.ms = Date.now() - t0;
        gefahren.push(name);
        if (name === "buehne") gehalten = true;
        const nach = await R("/wache", {
            seit: vor && vor.wetter ? vor.wetter.seq : 0,
            seitWelt: vor && vor.weltakt ? vor.weltakt.seq : 0,
        });
        e.wache = nach;
        if (MESSEN.has(name)) e.tiere = tierKurz(nach && nach.tiere);
        e.befunde = wachenUrteil(name, vor, nach, ort, gehalten && name !== "buehne");
        if (name === "buehne" && nach.wetter.wetter !== "sunny")
            e.befunde.push(`WETTER buehne: „${nach.wetter.wetter}" nach der Bühne`);
        if (abbruchVon(e.ergebnis)) e.befunde.push(`SCHRITT ${name}: ${abbruchVon(e.ergebnis)}`);
        aus.befunde.push(...e.befunde);
        for (const b of e.befunde) console.log(`  ROT ${b}`);
        if (nach && nach.version) aus.stand.version = nach.version;
        vor = nach;
        schreibe();
        return e.ergebnis;
    };
    let abbruch = null;
    try {
        const ok = await Promise.race([fertigP, new Promise((res) => setTimeout(() => res(false), 600000))]);
        if (!ok) throw new Error("die Werkbank wurde nicht bereit (10 min) — " + log.slice(-5).join(" | "));
        await schritt("boot", () => R("/status"));
        // die Wache vor dem ersten Schritt mit Ort: der Stand nach dem Boot
        await schritt("dorf-aus", () => R("/eval", { code: "window.__anazhAutoSettlement = false; return true;" }));
        await schritt("fenster", () => R("/fenster", { w: FENSTER[0], h: FENSTER[1] }));
        await schritt("umstellen", () => R("/umstellen", { ort: ORT }));
        await schritt("buehne", () => R("/eval", { code: "return window.__buehne();" }));
        // die Tiere des zuletzt gefahrenen Schritts (aus seiner Wache) — neben jede Kurzfassung
        const tiereZuletzt = () => {
            const e = aus.schritte[aus.schritte.length - 1];
            return e ? e.tiere || null : null;
        };
        const mitTieren = (k) => (k ? Object.assign(k, { tiere: tiereZuletzt() }) : { tiere: tiereZuletzt() });
        const lauf = (regler) => R("/lauf", { sek: P.laufSek, ein: P.ein, ruhe: P.ruhe, regler, tiere: "frei" });
        aus.kurz.laufVoll = mitTieren(laufKurz(await schritt("lauf-voll", () => lauf("voll"))));
        aus.kurz.laufFrei = mitTieren(laufKurz(await schritt("lauf-frei", () => lauf("frei"))));
        // DIE BANK je Blick (Gier 0 und −0,88: der ferne Schatten nimmt je Blick andere Gruppen mit), danach steht der Blick
        // wieder auf der Gier des Orts — die Ort-Wache nach dem Schritt prüft es. Je Blick zählt die Werkbank die Tiere
        // (Sichtkegel und Kaskaden dieses Blicks).
        const blick = (g) =>
            R("/eval", {
                code:
                    `r.state.yaw = ${g}; r.state.pitch = 0;` +
                    "for (let i = 0; i < 20; i++) { window.__wetterHalten(); if (window.__ortSchritt) window.__ortSchritt(); " +
                    "r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } " +
                    "r.state.renderer.setAnimationLoop(null); " +
                    "return { gier: r.state.yaw, tiere: typeof window.__tierZahl === 'function' ? window.__tierZahl() : null };",
            });
        const bank = await schritt("gpu-bank", async () => {
            const je = {};
            for (const g of BANK_GIER) {
                const b = await blick(g);
                je[String(g)] = await R("/gpu-bank", { n: 12, runden: 3 });
                if (je[String(g)] && typeof je[String(g)] === "object")
                    je[String(g)].tiere = b && b.ergebnis ? b.ergebnis.tiere : null;
            }
            await blick(BAND.ortGier(ort));
            return je;
        });
        aus.kurz.gpuBank = {};
        for (const g of BANK_GIER) {
            const b = bank && bank[String(g)];
            if (abbruchVon(b)) aus.befunde.push(`SCHRITT gpu-bank (Gier ${g}): ${abbruchVon(b)}`);
            else aus.befunde.push(...tierUrteil(`gpu-bank (Gier ${g})`, b && b.tiere));
            aus.kurz.gpuBank[String(g)] =
                b && !abbruchVon(b)
                    ? { gpuJeFrameMs: b.gpuJeFrameMs, cpuJeFrameMs: b.cpuJeFrameMs, tiere: tierKurz(b.tiere) }
                    : b;
        }
        const bandDatei = path.join(os.tmpdir(), `messfolge-band-${PORT}-${Date.now()}.json`);
        const band = await schritt("band", () => R("/band", { ort: ORT, datei: bandDatei, proben: P.proben }));
        // die Band-Messung reist im EINEN JSON mit (die Werkbank schrieb sie in eine Zwischen-Datei)
        if (band && fs.existsSync(bandDatei)) {
            const e = aus.schritte[aus.schritte.length - 1];
            e.ergebnis = Object.assign({}, band, { messung: JSON.parse(fs.readFileSync(bandDatei, "utf8")) });
            delete e.ergebnis.datei;
            fs.rmSync(bandDatei, { force: true });
            schreibe();
        }
        aus.kurz.band = mitTieren(
            band ? { urteil: band.urteil, linse: band.linse, stempel: band.stempel && band.stempel.urteil } : null
        );
        const prof = await schritt("profil", () =>
            R("/profil", { sek: P.profilSek, regler: "voll", tiere: "frei", top: 60 })
        );
        aus.kurz.profil = mitTieren(
            prof && !abbruchVon(prof) ? { frames: prof.frames, fps: prof.fps, selbst: prof.selbst.slice(0, 12) } : null
        );
        if (prof && prof.wetterHalt && prof.wetterHalt.urteil === "ROT")
            aus.befunde.push(...prof.wetterHalt.taeter.map((t) => `WETTER profil (Lauf): ${t}`));
    } catch (e) {
        abbruch = String((e && e.message) || e);
        aus.abbruch = abbruch;
    } finally {
        aus.befunde.push(...folgeUrteil(gefahren).filter(() => !abbruch));
        if (!abbruch && gefahren.length !== FOLGE.length)
            aus.befunde.push(`FOLGE: ${gefahren.length} von ${FOLGE.length} Schritten gefahren`);
        try {
            await Promise.race([R("/stop"), new Promise((res) => setTimeout(res, 30000))]);
        } catch (_e) {}
        aus.werkbankEnde = await beendeBaum(kind, 30000);
        if (aus.werkbankEnde === "waise")
            aus.befunde.push(
                `ENDE: die Werkbank (PID ${kind.pid}) überlebt /stop und den Baum-Abbau — Port ${PORT} bleibt belegt`
            );
        aus.ende = new Date().toISOString();
        aus.urteil = abbruch ? "ABBRUCH" : aus.befunde.length ? "ROT" : "GRUEN";
        aus.werkbankLog = log.slice(-40);
        schreibe();
    }
    console.log(`\nMESS-FOLGE ${aus.urteil}${abbruch ? ": " + abbruch : ""} — ${aus.befunde.length} Befunde\n${datei}`);
    for (const k of ["laufVoll", "laufFrei"]) {
        const l = aus.kurz[k];
        if (l && l.frameMs)
            console.log(
                `  ${k}: ${l.fps} fps · Frame p50/p95/max ${l.frameMs.p50}/${l.frameMs.p95}/${l.frameMs.max} ms · CPU p50/p95 ` +
                    `${l.cpuTaktMs.p50}/${l.cpuTaktMs.p95} · render-Wanduhr (EWMA, mit CPU-Zustand) ${l.renderEwmaMs} · ${tierZeile(l.tiere)}`
            );
    }
    for (const [g, b] of Object.entries(aus.kurz.gpuBank || {}))
        if (b && b.gpuJeFrameMs != null)
            console.log(
                `  gpu-bank Gier ${g}: ${b.gpuJeFrameMs} ms je Frame (CPU ${b.cpuJeFrameMs}) · ${tierZeile(b.tiere)}`
            );
    if (aus.kurz.band && aus.kurz.band.urteil)
        console.log(
            `  band: ${aus.kurz.band.urteil} (Linse ${aus.kurz.band.linse}, Stempel ${aus.kurz.band.stempel}) · ` +
                tierZeile(aus.kurz.band.tiere)
        );
    if (aus.kurz.profil && aus.kurz.profil.frames != null)
        console.log(`  profil: ${aus.kurz.profil.frames} Frames · ${tierZeile(aus.kurz.profil.tiere)}`);
    console.log(`  Werkbank-Ende: ${aus.werkbankEnde}`);
    process.exit(abbruch ? 2 : aus.befunde.length ? 1 : 0);
}

// DER SELBSTTEST (ohne Welt): die Folge-Regel und jede Wache fallen bei ihrem Täter rot und nennen ihn; der Tier-Zähler steht
// und zählt; eine Werkbank mit hängendem `/stop` stirbt samt Kind.
async function selbsttest() {
    const { ort } = BAND.ladeSpec(ORT);
    const fehler = [];
    const pruefe = (name, v, muss) => {
        const ok = muss ? v.some((x) => muss.test(x)) : v.length === 0;
        if (!ok) fehler.push(`${name}: ${v.join(" · ") || "(grün)"}`);
        console.log(`  ${ok ? "✅" : "❌"} ${name} → ${v.join(" · ") || "grün"}`);
    };
    pruefe("die Folge", folgeUrteil(FOLGE), null);
    const tausch = FOLGE.slice();
    tausch.splice(FOLGE.indexOf("band"), 1);
    tausch.splice(FOLGE.indexOf("lauf-voll"), 0, "band");
    pruefe("band vor lauf", folgeUrteil(tausch), /band vor lauf-voll — der Pool ist gefüllt/);
    pruefe("ohne Bühne", folgeUrteil(FOLGE.filter((n) => n !== "buehne")), /„buehne" fehlt vor dem ersten Messen/);
    const spaet = FOLGE.filter((n) => n !== "dorf-aus");
    spaet.splice(spaet.indexOf("umstellen") + 1, 0, "dorf-aus");
    pruefe(
        "Dorf-Zug erst nach dem Umstellen",
        folgeUrteil(spaet),
        /Dorf-Zug ruht erst nach dem Umstellen|„dorf-aus" nach/
    );
    const wache = (o) =>
        Object.assign(
            {
                wetter: { seq: 0, wetter: "sunny", uhr: -1e9, fest: true, buch: [] },
                weltakt: { seq: 0, gehalten: true, blind: false, buch: [] },
                stempel: { ueberlauf: 0, spitze: 40, pool: { stand: 0, max: 2048 }, taeter: {} },
                ort: {
                    ort: "wiese",
                    dorfZug: false,
                    ortTakt: [],
                    gier: BAND.ortGier(ort),
                    spieler: ort.spieler.slice(),
                },
                fenster: { innen: FENSTER.slice(), puffer: FENSTER.slice() },
                tiere: {
                    gesamt: 14,
                    sicht: 3,
                    sichtNah: 1,
                    schatten: { k0: 2, k1: 3 },
                    arten: { wolf: 6, hirsch: 8 },
                    artenSicht: { hirsch: 3 },
                },
            },
            o
        );
    pruefe("ruhige Wachen", wachenUrteil("lauf-voll", wache(), wache(), ort, true), null);
    // DER TIER-ZÄHLER: die Zahl ist Weltzustand (nie rot, auch 101 Tiere nicht), der Zähler muss stehen und zählen
    pruefe(
        "viele Tiere sind kein Befund",
        wachenUrteil(
            "lauf-frei",
            wache(),
            wache({
                tiere: { gesamt: 101, sicht: 40, sichtNah: 9, schatten: { k0: 30, k1: 60 }, arten: { wolf: 101 } },
            }),
            ort,
            true
        ),
        null
    );
    pruefe(
        "der Tier-Zähler fehlt",
        wachenUrteil("lauf-voll", wache(), wache({ tiere: null }), ort, true),
        /TIERE lauf-voll: kein Tier-Zähler — die Messung steht ohne ihre Tiere/
    );
    pruefe(
        "der Sichtkegel zählt NaN",
        wachenUrteil(
            "band",
            wache(),
            wache({ tiere: { gesamt: 14, sicht: NaN, sichtNah: 0, schatten: { k0: 1 }, arten: { wolf: 14 } } }),
            ort,
            true
        ),
        /TIERE band: sicht ist NaN/
    );
    pruefe(
        "der Schatten-Wurf einer Kaskade zählt nicht",
        tierUrteil("gpu-bank (Gier -0.88)", {
            gesamt: 14,
            sicht: 3,
            sichtNah: 1,
            schatten: { k0: 2, k1: undefined },
            arten: { wolf: 14 },
        }),
        /TIERE gpu-bank \(Gier -0\.88\): schatten k1 ist undefined/
    );
    pruefe(
        "die Arten fehlen",
        tierUrteil("profil", { gesamt: 14, sicht: 3, sichtNah: 1, schatten: { k0: 2, k1: 3 } }),
        /TIERE profil: keine Arten gezählt/
    );
    pruefe(
        "vor dem Messen zählt der Zähler nicht",
        wachenUrteil("umstellen", wache(), wache({ tiere: null }), ort, false),
        null
    );
    const regen = wache({
        wetter: {
            seq: 1,
            wetter: "rainy",
            uhr: -1e9,
            fest: true,
            buch: [
                {
                    art: "schreiber",
                    von: "sunny",
                    zu: "rainy",
                    quelle: "emotion:sorrow",
                    stapel: "weather ← … ← dslRun ← trigger ← updatePlayerEmotions",
                },
            ],
        },
    });
    pruefe(
        "Wetter dreht (Emotion)",
        wachenUrteil("lauf-voll", wache(), regen, ort, true),
        /WETTER lauf-voll: sunny → rainy durch emotion:sorrow/
    );
    pruefe(
        "Wetter taut",
        wachenUrteil(
            "lauf-frei",
            wache(),
            wache({ wetter: { seq: 0, wetter: "sunny", uhr: 17.6, fest: false, buch: [] } }),
            ort,
            true
        ),
        /taut/
    );
    pruefe(
        "Pool läuft über",
        wachenUrteil(
            "band",
            wache(),
            wache({ stempel: { ueberlauf: 927, pool: { stand: 2048, max: 2048 }, taeter: { "PMREM.cubeUv": 806 } } }),
            ort,
            true
        ),
        /STEMPEL band: 927 verweigerte Abfragen .*PMREM\.cubeUv 806/
    );
    pruefe(
        "Dorf-Zug läuft",
        wachenUrteil("gpu-bank", wache(), wache({ ort: Object.assign({}, wache().ort, { dorfZug: true }) }), ort, true),
        /ORT gpu-bank \(nach\): Dorf-Zug läuft/
    );
    pruefe(
        "Spieler gewandert",
        wachenUrteil(
            "profil",
            wache({ ort: Object.assign({}, wache().ort, { spieler: [-860, -850] }) }),
            wache(),
            ort,
            true
        ),
        /der Spieler steht 40\.0 m vom Messort/
    );
    pruefe(
        "Fenster kleiner",
        wachenUrteil("lauf-voll", wache(), wache({ fenster: { innen: [1280, 720], puffer: [1280, 720] } }), ort, true),
        /FENSTER lauf-voll \(nach\): 1280 × 720/
    );
    pruefe("vor der Bühne zählt das Wetter nicht", wachenUrteil("umstellen", wache(), regen, ort, false), null);
    // DIE WELT-WACHE (0710-7, OMEN 0710-6 Boot 4B: ein Nexus-Dorf drehte den Blick mitten im Lauf)
    const dorf = wache({
        weltakt: {
            seq: 1,
            gehalten: true,
            blind: false,
            buch: [
                {
                    art: "durch",
                    op: "spawn_village",
                    quelle: "nexus",
                    stapel: "dslEval ← … ← dslRun ← _loopNexusUpdate",
                },
            ],
        },
    });
    pruefe(
        "Nexus-Dorf unter dem Halt",
        wachenUrteil("lauf-voll", wache(), dorf, ort, true),
        /WELTAKT lauf-voll: spawn_village durch nexus/
    );
    pruefe(
        "verweigerte Welt-Akte sind grün",
        wachenUrteil(
            "lauf-voll",
            wache(),
            wache({
                weltakt: {
                    seq: 2,
                    gehalten: true,
                    blind: false,
                    buch: [{ art: "verweigert", op: "spawn_creature", quelle: "nexus" }],
                },
            }),
            ort,
            true
        ),
        null
    );
    pruefe(
        "Welt-Akt-Spion blind",
        wachenUrteil(
            "lauf-voll",
            wache(),
            wache({ weltakt: { seq: 0, gehalten: true, blind: true, buch: [] } }),
            ort,
            true
        ),
        /WELTAKT lauf-voll: das Spiel nennt keine Welt-Akte/
    );
    pruefe(
        "Wache ohne Welt-Akt-Spion",
        wachenUrteil("lauf-voll", wache(), wache({ weltakt: null }), ort, true),
        /WELTAKT lauf-voll: kein Welt-Akt-Spion/
    );
    pruefe("vor der Bühne zählen Welt-Akte nicht", wachenUrteil("umstellen", wache(), dorf, ort, false), null);
    // DAS ENDE DER WERKBANK: eine Werkbank, deren `/stop` hängt (sie lebt weiter) und die ein Kind trägt (Chrome) — nach
    // `beendeBaum` lebt keiner der beiden mehr (vorher: der Abbau stand in einem unref-Timer, die Werkbank blieb als Waise)
    {
        const werkbank = spawn(
            process.execPath,
            [
                "-e",
                "const { spawn } = require('child_process');" +
                    "const k = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });" +
                    "console.log('KIND ' + k.pid);" +
                    "process.on('SIGTERM', () => { k.kill('SIGKILL'); process.exit(0); });" +
                    "setInterval(() => {}, 1000);",
            ],
            { stdio: ["ignore", "pipe", "ignore"] }
        );
        const kindPid = await new Promise((res) => {
            let d = "";
            werkbank.stdout.on("data", (c) => {
                d += c;
                const m = /KIND (\d+)/.exec(d);
                if (m) res(Number(m[1]));
            });
            setTimeout(() => res(null), 10000);
        });
        const ende = await beendeBaum(werkbank, 300);
        const lebt = (pid) => {
            try {
                process.kill(pid, 0);
                return true;
            } catch (_e) {
                return false;
            }
        };
        let kindLebt = kindPid ? lebt(kindPid) : true;
        for (let i = 0; i < 20 && kindLebt; i++) {
            await new Promise((res) => setTimeout(res, 100));
            kindLebt = lebt(kindPid);
        }
        const v = [];
        if (!kindPid) v.push("ENDE: die Probe-Werkbank nannte ihr Kind nicht");
        if (ende !== "getoetet") v.push(`ENDE: die hängende Werkbank endete als „${ende}"`);
        if (werkbank.exitCode === null && werkbank.signalCode === null) v.push("ENDE: die Werkbank lebt");
        if (kindLebt) v.push(`ENDE: ihr Kind (PID ${kindPid}) lebt als Waise`);
        if (kindLebt)
            try {
                process.kill(kindPid, "SIGKILL");
            } catch (_e) {}
        pruefe("hängender /stop: Werkbank und Kind sterben", v, null);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Mess-Folge ist blind: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — die Folge-Regel und jede Wache nennen ihren Täter.");
    process.exit(0);
}

if (require.main === module) {
    if (argv.includes("--selbsttest"))
        selbsttest().catch((e) => {
            console.error("SELBSTTEST-FEHLER:", (e && e.stack) || e);
            process.exit(1);
        });
    else
        folge().catch((e) => {
            console.error("MESS-FOLGE-FEHLER:", (e && e.stack) || e);
            process.exit(2);
        });
}

module.exports = { FOLGE, folgeUrteil, wachenUrteil, tierUrteil, beendeBaum };
