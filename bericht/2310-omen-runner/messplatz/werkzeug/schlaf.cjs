// p3/messplatz/werkzeug/schlaf.cjs — DIE RUHENDE SEITE des warmen ABAB (serie.sh, 30.10.). Zwei Welten stehen warm, gemessen wird
// immer nur EINE: die andere SCHLÄFT — eingefroren (CDP `Page.setWebLifecycleState frozen`: keine Aufgabe, kein Zeitgeber, kein
// rAF, kein Netz der Seite) und ihr Fenster minimiert (es verdeckt das gemessene nie). Geweckt wird umgekehrt: Fenster normal,
// Seite aktiv, nach vorn. Der zweite Klient spricht über `DevToolsActivePort` im Profil der Werkbank (puppeteer startet Chrome mit
// --remote-debugging-port=0) — die Werkbank selbst bleibt unberührt, jede Werkbank jedes Stands taugt.
//   node schlaf.cjs schlaf <profil> [--last …]  Puls-Stille von vorn, einfrieren, minimieren → {"verb":"schlaf","fenster":"minimized"}
//   node schlaf.cjs wach <profil> [--last …]    normal + aktiv + nach vorn    → {"verb":"wach","fenster":"normal"}
//     (`--last <datei> <profil A> <profil B> [<alt>]`: die Last-Probe im selben Prozess — beim Einschlafen vor dem Einfrieren)
//   node schlaf.cjs wache <profil> <datei>     die Wache im Fenster: alle 2 s, sichtbar oder Zeitgeber geschlagen → wieder einfrieren
//   node schlaf.cjs nachfrieren <profil> <seit-ms>  die Nachwache der Ruhe: Stille des Zeitgebers lesen, erneut einfrieren + minimieren
//   node schlaf.cjs last <datei> <profil A> <profil B> [<alt>]  DIE LAST-PROBE: CPU-Sekunden der Chrome-Prozesse je Profil und Art
//                                              (browser · gpu · renderer · rest) nach <datei>; mit <alt> die Differenz als JSON
//   node schlaf.cjs pforte-aus <baum>          beendet den Lauscher auf :4312, NUR wenn er der save-server dieses Baums ist
//   node schlaf.cjs stopp <port> [<port>…]     räumt die warmen Welten: Werkbank-Lauscher der Ports und ihre Chrome-Profile
// Muster (Profil, Baum, Port) gehen per Umgebung an PowerShell, nie in eine Befehlszeile (Lehre 14.10./16.10.: Selbst-Treffer).
// Der WebSocket: der eingebaute (Node ≥ 22), sonst `ws` aus node_modules des Arbeitsverzeichnisses (der Baum des Instruments).
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const [verb, ...rest] = process.argv.slice(2);
const WS = globalThis.WebSocket || require(require.resolve("ws", { paths: [process.cwd()] }));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ps = (skript, env) =>
    execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", skript], {
        encoding: "utf8",
        env: Object.assign({}, process.env, env),
        windowsHide: true,
    }).trim();

function klient(profil) {
    const datei = path.join(profil, "DevToolsActivePort");
    if (!fs.existsSync(datei)) throw new Error(`kein DevToolsActivePort in ${profil} (lebt die Werkbank?)`);
    const [port, weg] = fs.readFileSync(datei, "utf8").trim().split(/\r?\n/);
    const ws = new WS(`ws://127.0.0.1:${port}${weg}`);
    let id = 0;
    const offen = new Map();
    const an = (e, f) => (ws.addEventListener ? ws.addEventListener(e, f) : ws.on(e, f));
    an("message", (e) => {
        const m = JSON.parse(e && e.data !== undefined ? e.data : e);
        if (!m.id || !offen.has(m.id)) return;
        const o = offen.get(m.id);
        offen.delete(m.id);
        if (m.error) o.rej(new Error(`${o.method}: ${m.error.message}`));
        else o.res(m.result);
    });
    const send = (method, params = {}, sessionId) =>
        new Promise((res, rej) => {
            const i = ++id;
            offen.set(i, { res, rej, method });
            ws.send(JSON.stringify(Object.assign({ id: i, method, params }, sessionId ? { sessionId } : {})));
        });
    return new Promise((res, rej) => {
        an("open", () => res({ send, zu: () => ws.close() }));
        an("error", () => rej(new Error(`CDP ${port} nicht erreichbar`)));
    });
}

// die EINE Seite der Werkbank (die Welt: index.html vom save-server)
async function seiteVon(k) {
    const { targetInfos } = await k.send("Target.getTargets");
    const seiten = targetInfos.filter((t) => t.type === "page" && /\/index\.html/.test(t.url));
    if (seiten.length !== 1) throw new Error(`erwartet EINE Welt-Seite, gefunden ${seiten.length}: ${targetInfos.map((t) => t.type + " " + t.url).join(" · ")}`);
    const t = seiten[0];
    const { windowId } = await k.send("Browser.getWindowForTarget", { targetId: t.targetId });
    const { sessionId } = await k.send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
    return { windowId, sessionId };
}

// `--last <datei> <profil A> <profil B> [<alt>]` hängt die Last-Probe an (EIN Prozess-Start je Wechsel): beim Einschlafen VOR dem
// Einfrieren (das Ende des Fensters), beim Wecken NACH dem Wecken (sein Anfang). Vor dem Einfrieren beginnt die Stille des Pulses von vorn.
async function stellen(profil, schlafen, mitLast) {
    const t0 = Date.now();
    const k = await klient(profil);
    try {
        const { windowId, sessionId } = await seiteVon(k);
        let probe = null, um;
        if (schlafen) {
            await k.send("Runtime.evaluate", { expression: "window.__puls && (window.__puls.luecke = 0); 1" }, sessionId);
            if (mitLast) probe = JSON.parse(last(...mitLast));
            await k.send("Page.setWebLifecycleState", { state: "frozen" }, sessionId);
            um = Date.now(); // der Augenblick des Einfrierens (die Ruhe beginnt)
            await k.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "minimized" } });
        } else {
            await k.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "normal" } });
            await k.send("Page.setWebLifecycleState", { state: "active" }, sessionId);
            um = Date.now(); // der Augenblick des Weckens (die Ruhe endet)
            await k.send("Page.bringToFront", {}, sessionId);
        }
        await sleep(300);
        const { bounds } = await k.send("Browser.getWindowBounds", { windowId });
        const soll = schlafen ? "minimized" : "normal";
        if (bounds.windowState !== soll) throw new Error(`Fenster ${bounds.windowState} statt ${soll}`);
        if (!schlafen && mitLast) probe = JSON.parse(last(...mitLast));
        return Object.assign({ verb: schlafen ? "schlaf" : "wach", fenster: bounds.windowState, um, ms: Date.now() - t0 }, probe ? { last: probe } : {});
    } finally {
        k.zu();
    }
}

// DIE NACHWACHE DER RUHE (vor jeder Messung, an der ruhenden Seite): wie lange ihr Zeitgeber schon schweigt (`still`, ms — eine seit
// dem Einfrieren schlafende Seite schweigt so lange, wie sie ruht; ist sie aufgewacht, nur ~1 s) und ihre Sicht; danach wird sie erneut
// eingefroren und minimiert (gleich, ob sie schlief — der Zustand gilt wieder, bevor das Fenster der anderen misst). Die Stille des
// Pulses bleibt unberührt (sie ist der Beweis ihrer ganzen Ruhe). 30.10. Radeon stadt-A2: die ruhende Seite wachte mitten im Fenster
// (CPU 14,7 s statt ≤ 1,7 s, Zeitgeber still 237,5 von 411,5 s), der Auslöser blieb unbekannt — darum die Nachwache.
// `seit` = der Augenblick ihres Einfrierens (ms, aus der Antwort von `schlaf`): `ruhe` und `still` stehen auf derselben Uhr, gelesen im
// selben Augenblick in der Seite — schlief sie durch, ist `still` ≥ `ruhe` (ihr letzter Schlag lag vor dem Einfrieren); `gebrochen`, wenn
// ein Schlag mehr als 1,5 s nach dem Einfrieren fiel
async function nachfrieren(profil, seit) {
    const t0 = Date.now();
    const k = await klient(profil);
    try {
        const { windowId, sessionId } = await seiteVon(k);
        const z = await k.send("Runtime.evaluate", { expression: "JSON.stringify({ sicht: document.visibilityState, jetzt: Date.now(), zuletzt: window.__puls ? window.__puls.zuletzt : null })", returnByValue: true }, sessionId);
        await k.send("Page.setWebLifecycleState", { state: "frozen" }, sessionId);
        await k.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "minimized" } });
        const p = JSON.parse((z.result && z.result.value) || "{}");
        const still = p.zuletzt ? p.jetzt - p.zuletzt : null, ruhe = seit > 0 ? p.jetzt - seit : null;
        return { verb: "nachfrieren", sicht: p.sicht, still, ruhe, gebrochen: still != null && ruhe != null && still + 1500 < ruhe, ms: Date.now() - t0 };
    } finally {
        k.zu();
    }
}

// DIE WACHE IM FENSTER (läuft neben der Messung der anderen Seite, alle 2 s): ist die ruhende Seite sichtbar geworden oder schlug ihr
// Zeitgeber, wird sie sofort wieder eingefroren und minimiert und der Augenblick steht in <datei> (eine JSON-Zeile je Fall). 30.10. Radeon
// w-ego-A2: nach dem Wecken von A meldete die ruhende Seite B `visible` — Chrome hob ihr Einfrieren auf, als A wieder ein Fenster bekam
// (auch der Boot von B weckte A nach ~37 s); ohne Wache rechnete sie im Fenster der anderen bis zu 17 s. Mit ihr dauert ein Wachen
// höchstens ~2 s. Endet, sobald <datei>.halt besteht (die Serie legt es am Ende des Fensters), spätestens nach 30 min.
async function wache(profil, datei) {
    const t0 = Date.now();
    const k = await klient(profil);
    let faelle = 0, zuletzt = null;
    try {
        const { windowId, sessionId } = await seiteVon(k);
        while (!fs.existsSync(datei + ".halt") && Date.now() - t0 < 1800000) {
            const z = await k.send("Runtime.evaluate", { expression: "JSON.stringify({ sicht: document.visibilityState, zuletzt: window.__puls ? window.__puls.zuletzt : null })", returnByValue: true }, sessionId);
            const p = JSON.parse((z.result && z.result.value) || "{}");
            const schlug = zuletzt != null && p.zuletzt != null && p.zuletzt !== zuletzt;
            // nie nach dem Halt: kam die Antwort erst, als die Serie die Seite schon für ihr eigenes Fenster weckte, bleibt sie wach
            if ((p.sicht === "visible" || schlug) && !fs.existsSync(datei + ".halt")) {
                await k.send("Page.setWebLifecycleState", { state: "frozen" }, sessionId);
                await k.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "minimized" } });
                faelle++;
                fs.appendFileSync(datei, JSON.stringify({ um: Date.now(), nachS: +((Date.now() - t0) / 1000).toFixed(1), sicht: p.sicht, schlug }) + "\n");
            }
            zuletzt = p.zuletzt;
            await sleep(2000);
        }
    } finally {
        k.zu();
    }
    return { verb: "wache", faelle, s: Math.round((Date.now() - t0) / 1000) };
}

// CPU-Sekunden (Kern + Nutzer) aller Chrome-Prozesse, deren Befehlszeile das Profil trägt — je Art (der Browser ohne --type, der
// GPU-Prozess, der Renderer der Seite, der Rest: Netz, Speicher, crashpad); dazu die Leerlauf-Uhr des ganzen Rechners (die System-Last
// im Fenster: ein fremder Lauf neben der Messung steht beim Namen in der Zahl); EIN PowerShell-Lauf für beide Seiten.
// DIE GÄSTE AN DER PFORTE (30.10., 19:50–20:05 öffnete der Schöpfer localhost:4312, während der Prüfstand dort maß — sein Browser lud
// die Welt vom save-server der gemessenen Seite): jede bestehende Verbindung zu :4312, deren Prozess keiner der beiden Seiten gehört
// (ihr Netz-Prozess trägt das Profil), steht beim Namen (`gaeste`)
function last(datei, profile, alt) {
    const aus = ps(
        "$m = $env:SCHLAF_PROFILE -split '\\|'; $c = Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\"; " +
            "foreach ($p in $m) { $s = @{ browser = 0; gpu = 0; renderer = 0; rest = 0 }; foreach ($x in $c) { $z = [string]$x.CommandLine; if (-not $z.Contains($p)) { continue }; " +
            "$a = if ($z -match '--type=gpu-process') { 'gpu' } elseif ($z -match '--type=renderer') { 'renderer' } elseif ($z -match '--type=') { 'rest' } else { 'browser' }; " +
            "$s[$a] += ($x.KernelModeTime + $x.UserModeTime) / 1e7 }; ($s.browser, $s.gpu, $s.renderer, $s.rest | ForEach-Object { [math]::Round($_, 2) }) -join ' ' }; " +
            "$g = @(); foreach ($i in (Get-NetTCPConnection -RemotePort 4312 -State Established -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)) { " +
            "$q = Get-CimInstance Win32_Process -Filter (\"ProcessId=\" + $i); $z = [string]$q.CommandLine; $eigen = $false; foreach ($p in $m) { if ($z.Contains($p)) { $eigen = $true } }; " +
            "if (-not $eigen) { $g += ($q.Name + ':' + $i) } }; 'GAESTE ' + ($g -join ',')",
        { SCHLAF_PROFILE: profile.join("|") }
    );
    const zeilen = aus.split(/\r?\n/);
    const z = zeilen.map((x) => x.trim().split(" ").map(Number));
    const jetzt = {};
    profile.forEach((_p, i) => {
        const [browser, gpu, renderer, rest] = z[i];
        jetzt["AB"[i]] = { browser, gpu, renderer, rest, gesamt: +(browser + gpu + renderer + rest).toFixed(2) };
    });
    const gaeste = ((zeilen.find((x) => x.startsWith("GAESTE")) || "GAESTE ").slice(7).trim() || "").split(",").filter(Boolean);
    // die Leerlauf-Uhr aller Kerne (os.cpus: ms seit dem Start je Kern): Last = 1 − Δleer / Δgesamt
    const cpus = require("os").cpus();
    const kerne = Object.assign(
        cpus.reduce((s, c) => ({ leer: s.leer + c.times.idle, alle: s.alle + Object.values(c.times).reduce((a, b) => a + b, 0) }), { leer: 0, alle: 0 }),
        { n: cpus.length, t: Date.now() }
    );
    fs.writeFileSync(datei, JSON.stringify(Object.assign({ kerne }, jetzt)));
    if (!alt) return JSON.stringify(jetzt);
    const vor = JSON.parse(fs.readFileSync(alt, "utf8")), d = {};
    for (const s of Object.keys(jetzt)) d[s] = Object.fromEntries(Object.keys(jetzt[s]).map((k) => [k, +(jetzt[s][k] - vor[s][k]).toFixed(2)]));
    if (vor.kerne && kerne.alle > vor.kerne.alle) {
        d.systemLastPct = +(100 * (1 - (kerne.leer - vor.kerne.leer) / (kerne.alle - vor.kerne.alle))).toFixed(1);
        // DIE LAST NEBEN DEN WELTEN im Fenster: die System-Last ohne die Chrome-Prozesse beider Seiten (darin die Werkbank, der
        // save-server, die Proben — und jeder fremde Lauf, der erst nach der Fremdlast-Vorfahrt kam)
        const dauerS = (kerne.t - vor.kerne.t) / 1000;
        if (dauerS > 0 && vor.kerne.n) d.nebenPct = +(d.systemLastPct - (100 * (d.A.gesamt + d.B.gesamt)) / (dauerS * vor.kerne.n)).toFixed(1);
    }
    d.gaeste = gaeste.join(",") || "keine";
    return JSON.stringify(d);
}

// EIN PowerShell-Lauf: der Lauscher auf :4312, seine Befehlszeile gegen den Baum, beenden, warten bis die Pforte frei ist (≤ 10 s)
function pforteAus(baum) {
    const r = ps(
        "$l = Get-NetTCPConnection -LocalPort 4312 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; " +
            "if (-not $l) { 'frei'; exit 0 }; $p = Get-CimInstance Win32_Process -Filter (\"ProcessId=\" + $l.OwningProcess); " +
            "$c = ([string]$p.CommandLine).ToLower().Replace('/', '\\'); " +
            "if (-not ($c.Contains($env:SCHLAF_BAUM) -and $c.Contains('save-server'))) { 'fremd ' + $l.OwningProcess + ' ' + $c.Substring(0, [math]::Min(160, $c.Length)); exit 0 }; " +
            "Stop-Process -Id $l.OwningProcess -Force; " +
            "for ($i = 0; $i -lt 50 -and (Get-NetTCPConnection -LocalPort 4312 -State Listen -ErrorAction SilentlyContinue); $i++) { Start-Sleep -Milliseconds 200 }; " +
            "'beendet ' + $l.OwningProcess + ' nach ' + ($i * 200) + ' ms'",
        { SCHLAF_BAUM: path.resolve(baum).toLowerCase().replace(/\//g, "\\") }
    );
    if (/^fremd/.test(r)) throw new Error(`:4312 gehört nicht dem save-server von ${baum}: ${r}`);
    return r;
}

function stopp(ports) {
    return ps(
        "$ids = @(); foreach ($p in ($env:SCHLAF_PORTS -split ' ')) { $ids += (Get-NetTCPConnection -LocalPort ([int]$p) -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess) }; " +
            "$m = ($env:SCHLAF_PORTS -split ' ' | ForEach-Object { 'werkbank-profil-' + $_ + '-' }); " +
            "foreach ($x in (Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\")) { $c = [string]$x.CommandLine; foreach ($q in $m) { if ($c.Contains($q)) { $ids += $x.ProcessId } } }; " +
            "$ids = $ids | Where-Object { $_ -and $_ -ne 0 -and $_ -ne $PID } | Sort-Object -Unique; foreach ($i in $ids) { Stop-Process -Id $i -Force -ErrorAction SilentlyContinue }; 'gestoppt: ' + ($ids -join ' ')",
        { SCHLAF_PORTS: ports.join(" ") }
    );
}

(async () => {
    let o;
    if (verb === "schlaf" || verb === "wach") {
        const i = rest.indexOf("--last");
        o = JSON.stringify(await stellen(rest[0], verb === "schlaf", i > 0 ? [rest[i + 1], rest.slice(i + 2, i + 4), rest[i + 4]] : null));
    } else if (verb === "nachfrieren") o = JSON.stringify(await nachfrieren(rest[0], Number(rest[1])));
    else if (verb === "wache") o = JSON.stringify(await wache(rest[0], rest[1]));
    else if (verb === "last") o = last(rest[0], rest.slice(1, 3), rest[3]);
    else if (verb === "pforte-aus") o = pforteAus(rest[0]);
    else if (verb === "stopp") o = stopp(rest);
    else throw new Error("Aufruf: schlaf|wach <profil> · nachfrieren <profil> <seit-ms> · wache <profil> <datei> · last <datei> <profil A> <profil B> [<alt>] · pforte-aus <baum> · stopp <port>…");
    console.log(o);
    process.exit(0);
})().catch((e) => {
    console.error("SCHLAF ROT: " + ((e && e.message) || e));
    process.exit(3);
});
