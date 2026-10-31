// DIE SEITE DER SITZUNG — die Werkzeuge der Proben der Gruppe Stadt (siedlung · bauen · studios · ankunft · pipeline), die mehr
// brauchen als einen Werkbank-Befehl: echte Eingaben (Taste, Klick, Rad), eine neue Ladung der Seite, eine zweite Seite derselben
// Herkunft (die Studios). Das Gesetz des Schöpfers (29.10.): „eine komplette Fahrt durch jedes System max 30 min, inbegriffen die
// Dauerlast" — keine dieser Stationen bootet mehr eine eigene Welt.
//
// DER ANSCHLUSS: die Probe hängt sich an den Browser der Welt der Sitzung — `werkbank start --echt` startet ihn über
// puppeteer.launch ohne pipe, Chrome legt DevToolsActivePort in sein Profil (os.tmpdir()/werkbank-profil-<W>-<Zeit>). Nie ein
// eigener Browser, nie ein eigener save-server; am Ende löst sie sich (disconnect, nie close), jede Seite, die sie öffnete, fällt,
// die Welt kommt nach vorn (ein Tab dahinter zeichnet nie). Ihre eigene Frist liegt 6 s unter dem Deckel DIESES Laufs ({SEK}, punkte.cjs
// ersetze — in der Sitzung probe.sek, in der Eich-Fahrt 90 s, am Rest der Fahrt dieser): wer sie reißt, baut ab, schreibt, was er bis
// dahin maß, und die EINE Marke „@@PUNKTE@@ FRIST <s> s der Probe gerissen“ (punkte.cjs FRIST_MARKE: kein Urteil, UNGEMESSEN) — nie
// hinterlässt eine Probe einen offenen Tab oder eine gehaltene Taste. Eine Probe, die selbst Fälle an ihrer Frist auslässt, sagt es mit
// `H.fristRiss(was)` (dieselbe Marke). Bis w4-sitzung-urteil trug argv die Frist aus der Definition (ANKUNFT 84 s unter dem Deckel 10 s
// der Station): der Deckel tötete die Probe, ehe sie abbauen und schreiben konnte.
//
// DIE LINSE DES SPIELS MISST: `H.linse(datei, namen)` lädt ein diag-Skript des Spiel-Baums als Bibliothek — sein hauptLauf stumm,
// die genannten Glieder als Export, auf Wunsch argv der Linse, stille Glieder von welt-boot (der Browser, der Server der Sitzung) und
// Anker-Ersetzungen (jeder Anker genau einmal im Text, sonst laut). Urteil, Schwelle und Täter bleiben im Spiel; die Probe schrumpft
// nur den Lauf (Stichprobe statt Raster, die Ruhe statt der Uhr).
//
// Der Text dieser Funktionen steht wörtlich im argv der Probe (`node -e`) — er ist Teil des Abdrucks jeder Station, die ihn trägt.
// Darum trägt er nie die Platzhalter des Läufers (in geschweiften Klammern PORT, AUS, BAUM, KOORD, SEK): sie stünden ersetzt im Code.
"use strict";

// läuft IN der Probe (node -e, cwd = Spiel-Baum; argv: der Port der Sitzung, die Ausgabe, der Deckel des Laufs in s — die Frist 6 s darunter)
function sitzungWerkzeug() {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");
    const http = require("http");
    const S = Number(process.argv[1]);
    const W = S + 20000;
    const H = { S, W, AUS: process.argv[2], FRIST_S: Number(process.argv[3]) - 6, t0: Date.now(), fs, path, teil: undefined };
    if (!(H.FRIST_S > 0)) {
        console.log("@@ PROBE-FEHLER der Deckel des Laufs fehlt (argv „" + process.argv[3] + "“: der Läufer ersetzt den Platzhalter SEK)");
        process.exit(2);
    }
    // DIE MARKE der gerissenen Frist (punkte.cjs FRIST_MARKE), EINMAL je Probe: am Deckel der Frist (H.fahre) oder wo die Probe selbst
    // Fälle an ihr auslässt
    H.fristRiss = (was) => {
        if (H.gerissen) return;
        H.gerissen = was;
        console.log("@@PUNKTE@@ FRIST " + H.FRIST_S + " s der Probe gerissen — " + was);
    };
    const abbau = [];
    H.url = "http://localhost:" + S + "/index.html";
    H.sek = () => +((Date.now() - H.t0) / 1000).toFixed(1);
    H.rest = () => H.FRIST_S - (Date.now() - H.t0) / 1000;
    H.schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
    H.zeile = (t) => console.log("@@ " + H.sek() + " s · " + t);
    H.beimAbbau = (f) => abbau.push(f);
    // höchstens ms warten: der Wert oder `ersatz` — ein Wurf des Wartenden (auch nach der Frist, etwa die Seite, die neu lädt) steht
    // beim Namen in der Ausgabe, nie als unbehandelte Ablehnung, die die Probe risse
    H.binnen = (p, ms, ersatz = null) =>
        Promise.race([
            Promise.resolve(p).catch((e) => (console.log("@@ " + H.sek() + " s · gewartet, geworfen: " + String((e && e.message) || e).split("\n")[0]), ersatz)),
            H.schlaf(Math.max(0, ms)).then(() => ersatz),
        ]);
    // DIE WERKBANK der Sitzung (POST mit Frist)
    H.wb = (weg, nutz, ms = 120000) =>
        new Promise((ja, nein) => {
            const q = http.request({ host: "127.0.0.1", port: W, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        ja(JSON.parse(d));
                    } catch (_e) {
                        nein(new Error(weg + ": " + d.slice(0, 200)));
                    }
                });
            });
            q.setTimeout(Math.max(1000, ms), () => q.destroy(new Error(weg + " ohne Antwort binnen " + Math.round(ms / 1000) + " s")));
            q.on("error", nein);
            q.end(JSON.stringify(nutz || {}));
        });
    // ein Funktionsrumpf in der Seite der Welt (r = Welt, T = THREE), wie `werkbank eval`
    H.evalWelt = async (code, ms) => {
        const a = await H.wb("/eval", { code }, ms);
        if (!a || a.fehler) throw new Error("werkbank eval: " + (a && a.fehler) + " " + JSON.stringify((a && a.stapel) || []));
        return a.ergebnis;
    };
    // eine frische Welt in der Sitzung (die Grundstellung der Maschine: Spielstand weg, die Seite neu)
    H.grundstellung = () => {
        const p = require("child_process").spawnSync(process.execPath, [process.env.PUNKTE_MASCHINE, "grundstellung"], {
            encoding: "utf8",
            env: process.env,
            timeout: 240000,
        });
        if (p.status !== 0) throw new Error("grundstellung: " + String((p.stdout || "") + (p.stderr || "")).trim().split(/\r?\n/).slice(-2).join(" | "));
    };
    // DER BROWSER DER SITZUNG
    H.verbinde = async () => {
        const pp = require("puppeteer");
        const tmp = os.tmpdir();
        const kand = fs
            .readdirSync(tmp)
            .filter((n) => n.startsWith("werkbank-profil-" + W + "-"))
            .map((n) => path.join(tmp, n, "DevToolsActivePort"))
            .filter((f) => fs.existsSync(f))
            .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
        const fehl = [];
        for (const f of kand) {
            const [port, weg] = fs.readFileSync(f, "utf8").split(/\r?\n/);
            let b = null;
            try {
                b = await pp.connect({ browserWSEndpoint: "ws://127.0.0.1:" + port + weg, defaultViewport: null, protocolTimeout: 600000 });
                const seiten = await b.pages();
                const page = seiten.find((p) => p.url().startsWith("http://localhost:" + S + "/"));
                if (!page) throw new Error("keine Seite der Welt (" + seiten.map((p) => p.url()).join(" ") + ")");
                const vorher = new Set(seiten);
                // die souveräne Geste (window.confirm des Teilens, ein Dialog beim Verlassen) nimmt die Probe an — die Werkbank hört keinen
                const ja = (d) => d.accept().catch(() => {});
                page.on("dialog", ja);
                H.beimAbbau(async () => {
                    page.off("dialog", ja);
                    await page.keyboard.up("KeyW").catch(() => {});
                    for (const p of await b.pages().catch(() => [])) if (!vorher.has(p)) await p.close().catch(() => {});
                    await page.bringToFront().catch(() => {});
                    await b.disconnect();
                });
                Object.assign(H, { browser: b, page });
                return { browser: b, page };
            } catch (e) {
                fehl.push(path.basename(path.dirname(f)) + ": " + e.message);
                if (b) await b.disconnect().catch(() => {});
            }
        }
        throw new Error("kein Browser der Sitzung an :" + W + " (" + (fehl.join(" · ") || "kein DevToolsActivePort unter " + tmp + "/werkbank-profil-" + W + "-*") + ")");
    };
    // DIE LINSE ALS BIBLIOTHEK
    H.linse = (datei, namen, { argv = [], ersetze = [], stumm = {} } = {}) => {
        const Module = require("module");
        const f = path.resolve(datei);
        let text = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n"); // die Anker in LF, wie auch immer der Baum auscheckt
        for (const [alt, neu] of ersetze) {
            const n = text.split(alt).length - 1;
            if (n !== 1) throw new Error(datei + ": der Anker „" + alt.slice(0, 70) + "“ steht " + n + "× im Text (Soll 1) — die Linse änderte sich");
            text = text.replace(alt, () => neu);
        }
        const wbt = require(path.resolve("scripts/lib/welt-boot.cjs"));
        const ersatz = Object.assign({ hauptLauf: () => {} }, stumm);
        const alt = Object.fromEntries(Object.keys(ersatz).map((k) => [k, wbt[k]]));
        const av = process.argv;
        Object.assign(wbt, ersatz);
        process.argv = [av[0], f, ...argv];
        try {
            const m = new Module(f, module);
            m.filename = f;
            m.paths = Module._nodeModulePaths(path.dirname(f));
            m._compile(text + "\n;module.exports = { " + namen.join(", ") + " };\n", f);
            return m.exports;
        } finally {
            Object.assign(wbt, alt);
            process.argv = av;
        }
    };
    // DER EREIGNIS-STROM jeder Eingabe des Spielers (pointerdown · keydown · wheel, vor jedem Hörer der Seite) — wie die Linse
    // diag-werkstatt-weg ihn je Seite anlegt; in einer schon geladenen Seite einmal
    H.ereignisStrom = (page) =>
        page.evaluate(() => {
            if (window.__eingabeStrom) return;
            const strom = (window.__eingabeStrom = []);
            for (const typ of ["pointerdown", "keydown", "wheel"])
                window.addEventListener(typ, (e) => strom.push({ was: typ === "keydown" ? e.code : typ === "wheel" ? "Rad" : "Klick", echt: e.isTrusted, t: performance.now() }), {
                    capture: true,
                    passive: true,
                });
        });
    // DIE SEITE NEU im warmen Browser: warm der Zweit-Boot (nur die Seite neu: Platte, HTTP- und Shader-Cache bleiben), kalt vorher
    // die Herkunft leer — IndexedDB (Welten, Platte, Chunk-Netze), localStorage, Cache- und Shader-Speicher — samt HTTP-Cache des
    // Browsers und der Stand-Dateien des save-servers (Pflicht-OFFEN B: „IDB geleert, wie nach jedem Versions-Update"). Rückgabe
    // die Uhr ab der Navigation (die Kontrolle von außen zählt ab ihr).
    H.lade = async (page, { kalt = false } = {}) => {
        if (kalt) {
            const herkunft = "http://localhost:" + S;
            await page.goto("about:blank", { waitUntil: "load", timeout: 60000 });
            const c = await page.target().createCDPSession();
            try {
                await c.send("Storage.clearDataForOrigin", { origin: herkunft, storageTypes: "all" });
                await c.send("Network.clearBrowserCache");
            } finally {
                await c.detach().catch(() => {});
            }
            for (const d of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) fs.rmSync(d, { force: true });
        }
        const t0 = Date.now();
        await page.goto(H.url, { waitUntil: "domcontentloaded", timeout: 120000 });
        return t0;
    };
    // DER LAUF der Probe: ihr Ergebnis ist das JSON der Ausgabe; die Frist (H.FRIST_S) baut ab und schreibt den Stand `H.teil`
    H.fahre = (fn) => {
        let fertig = false;
        const ende = async (code, j) => {
            if (fertig) return;
            fertig = true;
            clearTimeout(uhr);
            if (j !== undefined)
                try {
                    fs.writeFileSync(H.AUS, JSON.stringify(j));
                } catch (e) {
                    console.log("@@ Ausgabe: " + e.message);
                }
            for (const f of abbau.reverse()) await H.binnen(Promise.resolve().then(f).catch((e) => console.log("@@ Abbau: " + e.message)), 15000);
            process.exit(code);
        };
        const uhr = setTimeout(() => {
            H.fristRiss("Abbau, die Ausgabe trägt den Stand bis hier");
            ende(3, H.teil);
        }, H.FRIST_S * 1000);
        Promise.resolve()
            .then(() => fn(H))
            .then(
                (j) => ende(0, j),
                (e) => {
                    console.log("@@ PROBE-FEHLER " + String((e && e.stack) || e).split("\n").slice(0, 5).join(" | "));
                    ende(2, H.teil);
                }
            );
    };
    return H;
}

// der argv einer Probe: die Werkzeuge, die Seiten-Funktionen (`H.seite.NAME`, als Text an die Werkbank oder an page.evaluate), dann
// die Probe `fn(H)`. Die eigene Frist liegt 6 s unter dem Deckel des Laufs ({SEK}); `sek` ist der Deckel der Station.
function probeBefehl(fn, sek, seite = {}) {
    const s = Object.entries(seite).map(([k, f]) => k + ": " + f).join(",\n");
    return {
        sek,
        befehl: ["node", "-e", "const H = (" + sitzungWerkzeug + ")();\nH.seite = {\n" + s + "\n};\nH.fahre(" + fn + ");", "{PORT}", "{AUS}", "{SEK}"],
    };
}

// ───────────────────────── DIE ANKUNFT IN DER SITZUNG (ankunft.K2#1 · ankunft.K3#1 · pipeline.K4#1 · pipeline.K4#2) ─────────────────────────
// EINE Probe, vier Zwillinge (derselbe argv: die Maschine fährt sie einmal, jede Station urteilt über denselben Lauf). Die Kalt-Zeile
// des Spiels (scripts/diag-boot-stage.cjs) ist die Linse: ihre Kontrolle von außen (LEIB_WEG: die gehaltene Taste W trägt den Leib
// ≥ 0,1 m, die Uhr ab der Navigation), ihr Schuss der Kontrolle (SCHUSS, Ausgabe-Pfad, Mittag · Sonne · Sommer), ihre Ruhe der
// Foundry (RUHE) und ihre Urteile (lieferUrteil, wechselUrteil). Bis 29.10. bootete jede der vier Stationen eigene Browser — K2 einen
// mit 60 s Ruhe, K3 fünf (Kalt-Boot + 4 Wiederkehren), K4 zwei bzw. drei (Radeon b3f9ae95: pipeline.K4#1 10,61 min).
//   1 KALT — die Herkunft leer (H.lade kalt: IndexedDB mit Welten und Platte, localStorage, Cache- und Shader-Speicher, HTTP-Cache),
//     die Seite neu im warmen Browser-Prozess: t(Kontrolle) kalt, der offene Bedarf im Bild, der Schuss der Kontrolle; dann die Ruhe
//     der Foundry (höchstens 40 s — die Platte füllt sich ganz) und derselbe Schuss: die Lücke (ankunft.K2). Bis 29.10. derselbe
//     Schuss nach 60 s Uhr; die Ruhe ist das Ereignis, auf das die 60 s warteten — wer sie nicht erreicht, steht beim Namen.
//   2 WARM ×2 — der Stand gesichert (saveState + die Schranke des Speicher-Fadens), die Seite neu: t(Kontrolle) warm (ankunft.K3,
//     Median der zwei); am ersten Zweit-Boot die Liefer-Marke bis zur Ruhe (pipeline.K4: ≥ 95 % von der Platte, je Art ganz). Die
//     Wiederkehr ist der Zweit-Boot im warmen Browser — bis 29.10. ein frischer Browser-Prozess je Wiederkehr.
//   3 KERN-WECHSEL fachwerk — die Skripte des Kerns tragen auf der Platte des Spiel-Baums einen Kommentar mehr (der save-server
//     liefert no-cache mit ETag: der Browser holt sie neu), die Seite neu, die Liste der Lieferungen gegen die des Zweit-Boots:
//     nur die Leser von fachwerk bauen neu (pipeline.K4 Stufe 2). Die Skripte kehren sofort zurück (und im Abbau).
async function probeAnkunft(H) {
    const { fs, path } = H;
    const L = H.linse("scripts/diag-boot-stage.cjs", ["LEIB_WEG", "SCHUSS", "RUHE", "lieferUrteil", "wechselUrteil", "KONTROLLE_M", "KONTROLLE_DRUECKE", "ANKUNFT_SOLL_MS"]);
    const { AUSGABE_INSTALL } = require(path.resolve("scripts/lib/ausgabe-aufnahme.cjs"));
    const { pngDatei } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const { page } = await H.verbinde();
    const j = (H.teil = { warm: [] });
    // DIE KONTROLLE VON AUSSEN (die Kalt-Zeile wörtlich): je Atem der Druck neu, bis die Taste den Leib trägt
    const kontrolle = async (t0) => {
        let [tK, druecke] = [0, 0];
        for (; !tK && druecke++ < L.KONTROLLE_DRUECKE && H.rest() > 4; await page.keyboard.down("KeyW"))
            if (await page.evaluate(L.LEIB_WEG, L.KONTROLLE_M)) tK = Date.now() - t0;
        await page.keyboard.up("KeyW");
        return { tK, druecke };
    };
    const ruhe = (ms) => H.binnen(page.evaluate(L.RUHE), ms, null);
    const sichern = () =>
        H.binnen(
            page.evaluate(async () => {
                window.anazhRealm.saveState();
                if (window.anazhRealm._speicherStill) await window.anazhRealm._speicherStill();
                return true;
            }),
            10000,
            false
        );
    const warmZeile = (w) =>
        console.log(
            `  ${w.tK > 0 && w.tK <= L.ANKUNFT_SOLL_MS ? "✅" : "❌"} t(Kontrolle) warm ${w.tK ? (w.tK / 1000).toFixed(2) + " s" : "—"} von außen ` +
                `(Soll ≤ ${L.ANKUNFT_SOLL_MS / 1000} s; W trug den Leib im Atem ${w.tK ? w.druecke : "nie"})`
        );
    // 1 KALT
    const k = await kontrolle(await H.lade(page, { kalt: true }));
    if (!k.tK && !(H.rest() > 4)) H.fristRiss("die Kontrolle des Kalt-Boots an der Frist");
    Object.assign(j, k);
    H.zeile("kalt: t(Kontrolle) " + (k.tK ? (k.tK / 1000).toFixed(2) + " s" : "—"));
    if (k.tK) {
        j.offen = await page.evaluate(() => window.anazhRealm._weltbildFehlt());
        await page.evaluate(AUSGABE_INSTALL);
        const a = await page.evaluate(L.SCHUSS, 960, 540, false);
        pngDatei(H.AUS + ".png", a.png);
        const tr = Date.now();
        const ruheMs = Math.min(40000, (H.rest() - 40) * 1000);
        const lk = await ruhe(ruheMs);
        if (!lk && ruheMs < 40000) H.fristRiss("die Ruhe des Kalt-Boots an der Frist (" + Math.max(0, Math.round(ruheMs / 1000)) + " von 40 s)");
        const ruheS = +((Date.now() - tr) / 1000).toFixed(1);
        const b = await page.evaluate(L.SCHUSS, 960, 540, false);
        pngDatei(H.AUS + "-ruhe.png", b.png);
        j.bild = { luecke: b.luecke, ruheS, ruhe: !!lk, a: { png: H.AUS + ".png", dc: a.dc, dreiecke: a.dreiecke } };
        if (lk) j.lieferungKalt = { platte: lk.platte, werk: lk.werk, haupt: lk.haupt, leer: lk.leer, auftrag: lk.auftrag };
        H.zeile("kalt: Lücke " + (100 * b.luecke).toFixed(2) + " % nach " + ruheS + " s " + (lk ? "bis zur Ruhe der Foundry" : "OHNE Ruhe der Foundry (Frist)"));
    }
    Object.assign(
        j,
        await page.evaluate(() => ({
            weltbildDa: Math.round(window.anazhRealm.state._weltbildDa),
            ohne: (window.anazhRealm.state.logBuffer || []).filter((z) => /Das erste Weltbild steht ohne/.test(z)),
        }))
    );
    // 2 WARM ×2 — was die Frist nicht mehr trägt, fällt mit der EINEN Marke aus (H.fristRiss: kein ganzes Urteil, UNGEMESSEN)
    let liste = null;
    for (let n = 1; n <= 2; n++) {
        if (!(H.rest() > 14)) {
            H.fristRiss("der Zweit-Boot " + n + " und der Kern-Wechsel ausgelassen");
            break;
        }
        await sichern();
        const w = await kontrolle(await H.lade(page));
        if (!w.tK && !(H.rest() > 4)) H.fristRiss("die Kontrolle des Zweit-Boots " + n + " an der Frist");
        j.warm.push(w.tK);
        warmZeile(w);
        if (n > 1) continue;
        const lief = await ruhe(Math.min(20000, (H.rest() - 14) * 1000));
        if (!lief) {
            if (!(H.rest() > 14)) H.fristRiss("die Ruhe des Zweit-Boots an der Frist");
            console.log("  ❌ LIEFERUNG zweit: die Foundry ruht am Zweit-Boot nicht binnen der Frist");
            continue;
        }
        const k4 = L.lieferUrteil(lief, true);
        console.log(`  ${k4.gruen ? "✅ " : "❌ "}${k4.zeile}`);
        console.log(`  ${k4.artGruen ? "✅ " : "❌ "}${k4.artZeile}`);
        [liste, j.lieferung] = [lief.liste, { platte: lief.platte, werk: lief.werk, haupt: lief.haupt, leer: lief.leer, auftrag: lief.auftrag }];
    }
    // 3 KERN-WECHSEL fachwerk — wie die Linse (diag-boot-stage mit KERN: zeige → die Kontrolle von außen → RUHE → die Liefer-Marke):
    // erst trägt die Taste den Leib, dann zählt die Ruhe der Foundry (w4-sitzung-urteil; bis dahin fragte die Probe die Ruhe gleich
    // nach domcontentloaded, ehe die Welt einen Auftrag gab — die Marke war leer, „die Foundry ruht nach dem Wechsel nicht binnen der
    // Frist“ nach 0 s: GTX eich3 an 3ed95dcf, Radeon b3f9ae95)
    if (liste && !(H.rest() > 8)) H.fristRiss("der Kern-Wechsel ausgelassen");
    if (liste && H.rest() > 8) {
        const kern = JSON.parse(fs.readFileSync("cores.manifest.json", "utf8")).find((x) => x.id === "fachwerk");
        const alt = kern.scripts.map((p) => [p, fs.readFileSync(p)]);
        const zurueck = () => alt.forEach(([p, b]) => fs.writeFileSync(p, b));
        H.beimAbbau(zurueck);
        await sichern();
        let lief = null, w = null;
        try {
            for (const [p, b] of alt) fs.writeFileSync(p, Buffer.concat([b, Buffer.from("//")]));
            w = await kontrolle(await H.lade(page));
            if (w.tK) lief = await ruhe((H.rest() - 3) * 1000);
        } finally {
            zurueck();
        }
        if (!lief && !(H.rest() > 4)) H.fristRiss("der Kern-Wechsel an der Frist (" + (w && w.tK ? "die Ruhe" : "die Kontrolle") + ")");
        if (lief) {
            const u = L.wechselUrteil(liste, lief.liste, kern.id);
            console.log(`  ${u.gruen ? "✅" : "❌"} ${u.zeile}`);
        } else console.log("  ❌ KERN-WECHSEL fachwerk: die Foundry ruht nach dem Wechsel nicht binnen der Frist" + (w && !w.tK ? " (die Taste trug den Leib nie)" : ""));
    }
    return j;
}

// OFFEN (w4-stationen-schnell-b; GTX b4bcf19c 46,7 s): die vier Ladungen sind das Maß — t(Kontrolle) kalt 12,14 s, warm 9,12 · 8,60 s,
// der Kern-Wechsel ~9 s (Pflicht-OFFEN B, die Ankunft des Spiels); darum herum ~8 s Probe: zwei Schüsse der Kontrolle zu je zwei Aufnahmen
// (die erste wärmt die Programme), die Ruhe der Foundry kalt 3,1 s, die Atemzüge der Kontrolle zu 200 ms (`LEIB_WEG`). Ein Fenster kleiner
// als 1920×1080 kürzte die Ladungen selbst (ein Bild weniger Pixel bis zur Kontrolle) — weicher, nie
const ANKUNFT_PROBE = probeBefehl(probeAnkunft, 90);
const ANKUNFT_AUSNAHME =
    "vier Stationen in EINER Probe (ankunft.K2#1, ankunft.K3#1, pipeline.K4#1, pipeline.K4#2): vier Ladungen der Seite — kalt mit leerer " +
    "Herkunft bis zur Ruhe der Foundry (die Platte füllt sich ganz), zwei Zweit-Boots, der Kern-Wechsel — je 15–25 s";

module.exports = { sitzungWerkzeug, probeBefehl, probeAnkunft, ANKUNFT_PROBE, ANKUNFT_AUSNAHME };
