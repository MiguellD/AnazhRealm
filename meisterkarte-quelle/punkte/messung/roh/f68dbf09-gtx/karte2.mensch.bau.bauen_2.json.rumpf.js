const H = (function sitzungWerkzeug() {
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
    // DER MESSORT (punkte.cjs keinUrteil (d)): ein Wurf der Wege, die Ort und Seite stellen (/umstellen, /fenster, /status, /reload), der
    // Anschluss an den Browser der Sitzung und die Grundstellung tragen `messort` — erreicht er den Rand der Probe (H.fahre), sagt sie
    // die EINE Marke
    const MESSORT_WEG = /^\/(umstellen|fenster|status|reload)\b/;
    H.messort = (e, weg) => {
        const t = e && typeof e === "object" ? String(e.message || e).replace(/\s+/g, " ") : "";
        if ((!weg || MESSORT_WEG.test(weg)) && t && !e.messort) e.messort = (!weg || t.startsWith(weg) ? "" : weg + ": ") + t.slice(0, 280);
        return e;
    };
    // DIE WERKBANK der Sitzung (POST mit Frist)
    H.wb = (weg, nutz, ms = 120000) =>
        new Promise((ja, nein0) => {
            const nein = (e) => nein0(H.messort(e, weg));
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
        if (p.status !== 0) throw H.messort(new Error("grundstellung: " + String((p.stdout || "") + (p.stderr || "")).trim().split(/\r?\n/).slice(-2).join(" | ")));
    };
    // DER BROWSER DER SITZUNG
    H.verbinde = async () => {
        const pp = require("puppeteer");
        // DER ANSCHLUSS ÜBER /status (die EINE Quelle, wie proben-welt tor.seite): die Werkbank nennt das Profil ihres Browsers —
        // bis z216 suchte die Probe werkbank-profil-<W>-* im tmp, seit w11-profil-leck trägt der Starter ein Scratch-Profil
        const st = await H.wb("/status", {}, 30000);
        const profil = st && st.boot && st.boot.profil;
        const kand = [profil && path.join(profil, "DevToolsActivePort")].filter((f) => f && fs.existsSync(f));
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
                // seit spielgang.K5 (29643272, 02.11.) fragt die Welt nie mehr über window.confirm, sondern über ihre eigene
                // Oberfläche (#frage-dialog, `_frage`; die souveräne Geste `_sovereignGesture`) — der Hörer oben hört sie nicht, die
                // Geste des Teilens stand offen, bis die Probe riss (bauen.K5#2 geteilt: „Waiting failed: 30000ms" seit 02.11.). Die
                // Probe sagt dort Ja wie `frageJa` (scripts/lib/welt-boot.cjs), solange sie verbunden ist.
                await page.evaluate(() => {
                    const d = document.getElementById("frage-dialog");
                    if (!d) return;
                    const jaKlick = () => d.open && d.querySelector("#frage-ja").click();
                    (window.__sitzungFrageJa = new MutationObserver(jaKlick)).observe(d, { attributes: true, attributeFilter: ["open"] });
                    jaKlick();
                });
                H.beimAbbau(async () => {
                    page.off("dialog", ja);
                    await page.evaluate(() => (window.__sitzungFrageJa && window.__sitzungFrageJa.disconnect(), delete window.__sitzungFrageJa)).catch(() => {});
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
        throw H.messort(new Error("kein Browser der Sitzung an :" + W + " (" + (fehl.join(" · ") || (profil ? "kein DevToolsActivePort in " + profil : "/status nennt kein Profil der Werkbank")) + ")"));
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
                    if (e && e.messort) console.log("@@PUNKTE@@ MESSORT " + e.messort);
                    console.log("@@ PROBE-FEHLER " + String((e && e.stack) || e).split("\n").slice(0, 5).join(" | "));
                    ende(2, H.teil);
                }
            );
    };
    return H;
})();
H.seite = {
K: function k2Werkzeug(H, SPEC) {
    const K = { H, SPEC, sicht: "ego" };
    const j = (K.j = H.teil = { leiter: SPEC.leiter, adapter: null, sprossen: {} });
    // DER ADAPTER DER SITZUNG: die Welt nennt ihn in ihrem Log (PUNKTE_SITZUNG_LOG) — Zeile der Probe und Feld des JSON
    K.adapter = () => {
        let z = null;
        try {
            const t = H.fs.readFileSync(String(process.env.PUNKTE_SITZUNG_LOG || ""), "utf8");
            z = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
        } catch (_e) {}
        j.adapter = z || "[linse-gpu] ungenannt";
        console.log(j.adapter);
        return j.adapter;
    };
    // ein Funktionsrumpf in der Seite der Welt (r = Welt, T = THREE)
    K.welt = (code, ms) => H.evalWelt(code, ms || 30000);
    // DER MESSORT (spec/profiband/haushalt.json `messorte`): der Aufruf im Text heißt `K.messort("<ort>")` — so liest die Sitzung den Ort
    // und stellt VOR dem Deckel um (punkte.cjs probeOrt); die Sicht vorher über K.sicht ("ego" | "third")
    K.messort = async (ort) => {
        const a = await H.wb("/umstellen", { ort, sicht: K.sicht }, 120000);
        if (!a || a.fehler) throw H.messort(new Error("/umstellen " + ort + ": " + ((a && a.fehler) || "ohne Antwort")), "/umstellen");
        H.zeile("am Messort " + ort + " (" + K.sicht + ")");
        return a;
    };
    K.warte = (ms) => H.schlaf(ms);
    // JE SPROSSE EIN SCHRITT: ein Wurf ist keine Messung (die Sprosse bleibt ohne Ergebnis → UNGEMESSEN beim Namen), ein Wurf des
    // Messorts endet die Probe (die Marke MESSORT); an der Frist bleibt die Sprosse ungemessen, nie geraten
    K.schritt = async (n, f) => {
        if (H.rest() < 2) {
            H.zeile("S" + n + " an der Frist ausgelassen (" + H.sek() + " s)");
            return null;
        }
        try {
            return await f();
        } catch (e) {
            if (e && e.messort) throw e;
            const t = String((e && e.message) || e).split("\n")[0].slice(0, 300);
            H.zeile("S" + n + " warf: " + t);
            j.sprossen[n] = { art: "fehler", text: t };
            return null;
        }
    };
    const kurz = (t) => String(t == null ? "" : t).slice(0, 300);
    K.zahl = (n, o) =>
        (j.sprossen[n] = { art: "zahl", n: o.n, werte: o.werte || {}, ...(o.beleg ? { beleg: kurz(o.beleg) } : {}), ...(o.taeter ? { taeter: kurz(o.taeter) } : {}) });
    K.nicht = (n, o) => (j.sprossen[n] = { art: "nicht", n: o.n, fehlt: kurz(o.fehlt) });
    K.leser = (n, o) => (j.sprossen[n] = { art: "leser", fehlt: kurz(o.fehlt), wo: kurz(o.wo), ...(o.n != null ? { n: o.n } : {}) });
    K.auge = (n, o) => (j.sprossen[n] = { art: "auge", bild: o.bild, pose: kurz(o.pose), vorbild: kurz(o.vorbild || (SPEC.sprossen[n] && SPEC.sprossen[n].auge && SPEC.sprossen[n].auge.vorbild)), ...(o.mass ? { mass: kurz(o.mass) } : {}) });
    // DAS BILD EINER AUGEN-SPROSSE: der Ausgabe-Pfad der Spiel-Kamera (werkbank /bild) an fester Pose { px, py, pz, lx, ly, lz },
    // abgelegt neben der Ausgabe der Probe (<AUS>-S<n>.png; die Abnahme der Werkbank legt ein ROT-Bild als -rot.png daneben)
    K.bild = async (n, pose, mehr) => {
        const datei = String(H.AUS).replace(/\.json$/i, "") + "-S" + n + ".png";
        let a = null;
        try {
            a = await H.wb("/bild", Object.assign({ datei, w: 1280, h: 720 }, pose, mehr || {}), 90000);
        } catch (e) {
            a = { fehler: String((e && e.message) || e) };
        }
        const da = [a && a.datei, datei, datei.replace(/\.png$/i, "-rot.png")].find((f) => f && H.fs.existsSync(f));
        if (!da) throw new Error("kein Bild S" + n + ": " + kurz(a && (a.fehler || a.abnahme)));
        return { datei: da, abnahme: kurz(a && (a.abnahme || a.fehler)) };
    };
    K.ende = () => j;
    return K;
},
SPEC: {"leiter":"mensch.bau.bauen","sprossen":{"2":{"umfang":{"soll":10,"wort":"Baustellen der Bewohner"},"masse":[{"key":"geordnet","wort":"Bauphasen richtig geordnet","soll":0.9,"richtung":"≥"}]},"3":{"umfang":{"soll":1,"wort":"Spieler-Haus in der Welt"},"masse":[{"key":"bewohner","wort":"Bewohner im Spieler-Haus nach 1 h","soll":1,"richtung":"≥"},{"key":"einrichtung","wort":"Anteil der Bewohner, deren Beruf die Rolle des Hauses trägt","soll":1,"richtung":"≥"},{"key":"abnutzung","wort":"Trampelpfad vor der Tür (Zuwachs des Pfad-Felds)","soll":0,"richtung":">"},{"key":"stunde","wort":"Spielstunden seit dem Bau","soll":1,"richtung":"≥","herkunft":"„nach 1 h“: eine Stunde der Welt-Uhr, `_bewohnerStundeSek()` = 60 min Tag ÷ 24 = 150 s Spielzeit (stamm/siedlung-bewohner.js:2422)"}]},"4":{"auge":{"pose":"Messort stadt: dieselbe Gasse im Jahr 0 und +50","vorbild":"Fotos realer Baustellen je Epoche: Kran, Gerüst, Schalung (Stadtarchiv-Reihen)"}},"5":{"auge":{"pose":"Messort dorf: 8 m vor dem Spieler, wo der 50. Satz baut, Auge 1,7 m, Blick auf den Bau","vorbild":"50 gesprochene Bau-Sätze mit dem Gemeinten, im Panel „das Gemeinte“ und „passend“ ≥ 80 %"}},"6":{"umfang":{"soll":10,"wort":"fremde Baustellen fremder Leiber"},"masse":[{"key":"phasen","wort":"Phasen geordnet","soll":0.8,"richtung":"≥"},{"key":"traegt","wort":"Anteil der Bauten, die tragen","soll":1,"richtung":"≥"}]}}},
ZENSUS: async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const A = s.architectures || [];
    const steht = new Map();
    for (const e of A) if (e && Number.isFinite(e.seed)) steht.set((e.seed >>> 0) + "@" + Math.round(e.position.x) + "," + Math.round(e.position.z), e);
    const typen = {};
    let haeuser = 0;
    for (const e of A) {
        if (!e || typeof e.type !== "string") continue;
        typen[e.type] = (typen[e.type] || 0) + 1;
        if (e.tuer) haeuser++;
    }
    const zaehle = (re) => Object.keys(typen).filter((t) => re.test(t)).reduce((a, t) => a + typen[t], 0);
    const rollen = {};
    const berufe = {};
    let bewohner = 0;
    const orte = [];
    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
        if (!S || !S.plan || !Array.isArray(S.plan.slots)) continue;
        const O = { name: S.plan.name || "?", staedtisch: !!S.plan.staedtisch, d: Math.hypot(S.ox - pm.x, S.oz - pm.z), rollen: {}, haeuser: [], bewohner: 0, berufe: {} };
        for (const sl of S.plan.slots) {
            const wx = S.ox + sl.x;
            const wz = S.oz + sl.z;
            const e = steht.get((sl.seed >>> 0) + "@" + Math.round(wx) + "," + Math.round(wz));
            if (!e) continue;
            const rolle = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            O.rollen[rolle] = (O.rollen[rolle] || 0) + 1;
            rollen[rolle] = (rollen[rolle] || 0) + 1;
            const c = Math.cos(sl.phi || 0);
            const sn = Math.sin(sl.phi || 0);
            const tu = sl.tuer || { x: 0, z: 0 };
            const tx = wx + tu.x * c + tu.z * sn;
            const tz = wz - tu.x * sn + tu.z * c;
            const mx = sl.obb ? S.ox + sl.obb.cx : wx;
            const mz = sl.obb ? S.oz + sl.obb.cz : wz;
            const ul = Math.hypot(tx - mx, tz - mz) || 1;
            O.haeuser.push({ rolle, typ: e.type, x: wx, z: wz, y: e.position.y, tx, tz, ux: (tx - mx) / ul, uz: (tz - mz) / ul, tuer: !!e.tuer });
        }
        for (const b of Array.isArray(S.liste) ? S.liste : []) {
            O.bewohner++;
            bewohner++;
            const k = String(b.beruf || "?");
            O.berufe[k] = (O.berufe[k] || 0) + 1;
            berufe[k] = (berufe[k] || 0) + 1;
        }
        if (O.haeuser.length) orte.push(O);
    }
    orte.sort((a, b) => a.d - b.d);
    const nah = orte[0] || null;
    const posen = {};
    const auf = (x, z, dy) => hh(x, z) + dy;
    if (nah) {
        const mx = nah.haeuser.reduce((a, h) => a + h.x, 0) / nah.haeuser.length;
        const mz = nah.haeuser.reduce((a, h) => a + h.z, 0) / nah.haeuser.length;
        const my = hh(mx, mz);
        const dx = pm.x - mx;
        const dz = pm.z - mz;
        const dl = Math.hypot(dx, dz) || 1;
        posen.dorf30 = { px: mx + 21.2, py: my + 18, pz: mz + 21.2, lx: mx, ly: my + 2, lz: mz };
        posen.dorf100 = { px: mx + (dx / dl) * 100, py: auf(mx + (dx / dl) * 100, mz + (dz / dl) * 100, 12), pz: mz + (dz / dl) * 100, lx: mx, ly: my + 3, lz: mz };
        const w = nah.haeuser.find((h) => h.tuer && h.rolle === "wohnhaus") || nah.haeuser.find((h) => h.tuer);
        if (w) posen.haus10 = { px: w.tx + w.ux * 10, py: auf(w.tx + w.ux * 10, w.tz + w.uz * 10, 1.7), pz: w.tz + w.uz * 10, lx: w.x, ly: w.y + 2.5, lz: w.z, typ: w.typ };
        const ARB = /gasthaus|werkstatt|schmiede|backhaus|kaufhaus|kontor|zunfthaus|gerberei|speicher|rathaus/;
        const i = orte.flatMap((o) => o.haeuser).find((h) => h.tuer && ARB.test(h.rolle));
        if (i) posen.innen = { px: i.tx - i.ux * 1.6, py: i.y + 1.4, pz: i.tz - i.uz * 1.6, lx: i.tx - i.ux * 7, ly: i.y + 1.2, lz: i.tz - i.uz * 7, rolle: i.rolle, typ: i.typ };
    }
    const werk = orte.reduce((a, o) => a + o.haeuser.filter((h) => h.tuer && h.rolle !== "wohnhaus" && h.rolle !== "scheune").length, 0);
    const kurz = (o) => ({ name: o.name, staedtisch: o.staedtisch, d: Math.round(o.d), haeuser: o.haeuser.length, rollen: o.rollen, bewohner: o.bewohner, berufe: o.berufe });
    return {
        saat: s.worldMeta && s.worldMeta.seed != null ? 1 : 0,
        bauten: A.length,
        haeuser,
        typen: Object.keys(typen).length,
        rollen,
        funktionen: Object.keys(rollen).length,
        werk,
        orte: orte.map(kurz),
        staedte: orte.filter((o) => o.staedtisch).length,
        nah: nah ? kurz(nah) : null,
        bewohner,
        berufe,
        bauBeruf: Object.keys(berufe).filter((k) => /bau|zimmer|maurer|dachdeck/i.test(k)).reduce((a, k) => a + berufe[k], 0),
        ingenieur: { bruecke: zaehle(/bruecke|brücke|steg/i), damm: zaehle(/damm/i), hafen: zaehle(/hafen|bootshaus/i) + (rollen.bootshaus || 0), aquaedukt: zaehle(/aquaed|aquäd/i) },
        gross: { stadion: zaehle(/stadion|arena/i), bahnhof: zaehle(/bahnhof/i), fabrik: zaehle(/fabrik/i), kathedrale: zaehle(/kathedrale|dom_/i) },
        mega: zaehle(/arkolog|raumhafen|liftfuss|weltraumlift/i),
        fremd: zaehle(/fremd|alien|xeno/i),
        baustellen: A.filter((e) => e && (e.baustelle || e.bauPhase)).length,
        posen,
    };
},
HAUS: async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const SS = [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.plan && Array.isArray(S.plan.slots));
    SS.sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z));
    const S = SS[0];
    if (!S) return { n: 0, fehler: "kein Ort mit Plan am Messort" };
    const vorlage = (s.architectures || []).find((e) => e && e.tuer && /^haus_/.test(e.type || "") && Math.hypot(e.position.x - S.ox, e.position.z - S.oz) < 250);
    if (!vorlage) return { n: 0, fehler: "kein Haus mit Tür im Ort als Vorlage" };
    let R = 0;
    for (const sl of S.plan.slots) R = Math.max(R, Math.hypot(sl.x, sl.z));
    const a0 = Math.atan2(pm.z - S.oz, pm.x - S.ox);
    let e = null;
    let x = 0;
    let z = 0;
    let ry = 0;
    const SAAT = 4242001;
    for (let k = 0; k < 8 && !e; k++) {
        const a = a0 + (k * Math.PI) / 4;
        x = S.ox + Math.cos(a) * (R + 20);
        z = S.oz + Math.sin(a) * (R + 20);
        ry = Math.atan2(S.ox - x, S.oz - z);
        e = r.spawnArchitecture(vorlage.type, { x, y: hh(x, z) + 0.5, z }, { seed: SAAT + k, rotationY: ry, silent: true, tuer: vorlage.tuer });
    }
    if (!e) return { n: 0, fehler: "spawnArchitecture setzte das Haus " + vorlage.type + " an keinem von 8 Orten am Rand" };
    const saat = e.seed >>> 0;
    const tu = e.tuer || { x: 0, z: 0, w: 1 };
    const c = Math.cos(e.rotationY || 0);
    const sn = Math.sin(e.rotationY || 0);
    const lx = (tu.x || 0) + (tu.w || 0) / 2;
    const tx = e.position.x + lx * c + (tu.z || 0) * sn;
    const tz = e.position.z - lx * sn + (tu.z || 0) * c;
    const spur = () => {
        let m = 0;
        for (let q = 0; q < 12; q++) {
            const w = (q * Math.PI) / 6;
            for (const d of [1, 2, 3]) {
                const px = tx + Math.cos(w) * d;
                const pz = tz + Math.sin(w) * d;
                const v = r._pfadFeldAt(px, pz, hh(px, pz));
                if (Number.isFinite(v) && v > m) m = v;
            }
        }
        return m;
    };
    const wohnt = () => {
        const L = [];
        for (const S2 of SS) for (const b of Array.isArray(S2.liste) ? S2.liste : []) if (b && (b.heim === saat || (b.orte && b.orte.tuer && b.orte.tuer.haus === e))) L.push(b);
        return L;
    };
    const p0 = spur();
    const b0 = wohnt().length;
    const z0 = s.spielZeit;
    const stundeS = r._bewohnerStundeSek();
    const schrittMs = r.constructor.TAKT_DECKEL_S * 1000;
    let uhr = performance.now();
    const wand0 = performance.now();
    const ende = wand0 + (arg.ms || 15000);
    let takte = 0;
    let fehler = 0;
    while (s.spielZeit - z0 < stundeS && performance.now() < ende) {
        for (let k = 0; k < 5 && s.spielZeit - z0 < stundeS; k++) {
            uhr += schrittMs;
            try {
                r._gameLoopTick(uhr);
            } catch (_e) {
                fehler++;
            }
            takte++;
        }
        await window.sleep();
    }
    const L = wohnt();
    const rolle = (S.plan.slots.find((sl) => (sl.seed >>> 0) === (vorlage.seed >>> 0)) || {}).rolle || "wohnhaus";
    const aus = {
        n: 1,
        typ: e.type,
        x: Math.round(x),
        z: Math.round(z),
        bewohner: L.length,
        vorher: b0,
        einrichtung: L.length ? L.filter((b) => b.beruf === rolle || (rolle === "wohnhaus" && b.rolle === "wohnhaus")).length / L.length : 0,
        abnutzung: +(spur() - p0).toFixed(4),
        stunde: +((s.spielZeit - z0) / stundeS).toFixed(3),
        stundeS,
        wandS: +((performance.now() - wand0) / 1000).toFixed(1),
        takte,
        fehler,
    };
    try {
        r.removeArchitecture(e);
    } catch (_e) {}
    return aus;
},
SAETZE: async (r, T, arg) => {
    const baut = (p) => Array.isArray(p) && ((typeof p[0] === "string" && /^spawn_/.test(p[0])) || p.some(baut));
    const ja = [];
    const nein = [];
    let letzt = null;
    for (const t of arg.saetze || []) {
        let p = null;
        try {
            p = r.parseChatToDsl(t);
        } catch (_e) {}
        if (p && baut(p.program)) {
            ja.push(t);
            letzt = p;
        } else nein.push(t);
    }
    let lauf = null;
    if (arg.lauf && letzt && ja.length >= arg.lauf) {
        try {
            lauf = r.dslRun(letzt.program, { source: "human" });
            lauf = lauf && lauf.outcome ? String(lauf.outcome).slice(0, 80) : "gelaufen";
        } catch (e) {
            lauf = "warf: " + String(e && e.message).slice(0, 80);
        }
    }
    const pm = r.state.playerMesh.position;
    return { n: ja.length, von: (arg.saetze || []).length, ja: ja.slice(0, 12), nein: nein.slice(0, 6), lauf, pose: { px: pm.x, py: pm.y + 1.7, pz: pm.z, lx: pm.x + Math.sin(r.state.yaw || 0) * 8, ly: pm.y + 1, lz: pm.z + Math.cos(r.state.yaw || 0) * 8 } };
}
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            await K.messort("dorf");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(2, async () => {
                const w = da();
                K.leser(2, { n: w.baustellen, fehlt: "keine Baustelle: der Zug setzt jedes Haus ganz (spawnArchitecture), kein Bau trägt Aushub, Gerüst, Rohbau, Dach; Bewohner mit Bau-Beruf " + w.bauBeruf, wo: "stamm/siedlung-ort.js:517" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: da().baustellen, fehlt: "Umbau über 50 Jahre: die Stadt baut sich nicht um, kein Bau trägt eine Baustelle" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().fremd, fehlt: "fremde Leiber auf fremden Welten: die Welt trägt keine fremde Baustelle" }));
            await K.schritt(5, async () => {
                const was = ["dorf", "tempel", "damm", "wasserfall"];
                const saetze = [
                    ...was.map((w) => "baue " + w + " hier"),
                    "bau mir ein haus", "baue ein haus hier", "baue ein fachwerkhaus am weg", "errichte eine kapelle am hang", "baue eine brücke über den bach",
                    "bau einen brunnen auf den platz", "baue eine scheune neben den hof", "stell eine bank an den weg", "baue einen turm auf den hügel", "baue eine mühle an den fluss",
                    "mach mir eine hütte im wald", "baue eine mauer um das dorf", "baue einen stall für die pferde", "setz ein tor an den eingang", "baue eine schmiede am markt",
                    "baue ein gasthaus an die kreuzung", "baue eine kirche in die mitte", "baue einen steg ins wasser", "baue einen zaun um den garten", "baue eine laterne an die tür",
                    "baue eine treppe den hang hinauf", "bau ein baumhaus", "baue einen hafen am see", "baue eine burg auf den felsen", "baue einen markt mit ständen",
                    "baue ein rathaus am platz", "baue einen speicher für korn", "baue eine bäckerei", "baue ein badehaus", "baue eine werkstatt für den zimmermann",
                    "baue einen spielplatz", "baue eine arena", "baue eine rennstrecke", "baue einen leuchtturm an die küste", "baue ein zelt",
                    "baue einen pavillon im park", "baue einen wachturm am tor", "baue eine schule", "baue eine bibliothek", "baue ein theater",
                    "baue eine windmühle auf das feld", "baue eine zisterne", "baue ein aquädukt", "baue einen kanal", "baue eine stadtmauer",
                    "baue ein kloster auf den berg",
                ];
                const o = await K.welt("return await (" + H.seite.SAETZE + ")(r, T, " + JSON.stringify({ saetze, lauf: 50 }) + ");");
                H.zeile("Sätze → Bau: " + o.n + "/" + o.von + " · tragend " + JSON.stringify(o.ja).slice(0, 240));
                if (o.n < 50) return K.nicht(5, { n: o.n, fehlt: "50 Sätze → Bau: der Parser trägt " + o.n + " von " + o.von + " Bau-Sätzen (" + o.ja.join(" · ").slice(0, 160) + ")" });
                const b = await K.bild(5, o.pose);
                K.auge(5, { bild: b.datei, pose: "dorf: 8 m vor dem Spieler, wo der 50. Satz baute", mass: o.n + "/" + o.von + " Sätze bauen, Lauf " + o.lauf });
            });
            await K.schritt(3, async () => {
                const ms = Math.max(4000, (H.rest() - 6) * 1000);
                const o = await K.welt("return await (" + H.seite.HAUS + ")(r, T, " + JSON.stringify({ ms }) + ");", ms + 20000);
                H.zeile("Spieler-Haus: " + JSON.stringify(o).slice(0, 300));
                // die Spielstunde nicht erreicht: der Deckel der Probe schnitt den Lauf — kein Urteil über die Welt, UNGEMESSEN beim Namen
                if (o.n && !(o.stunde >= 1)) throw new Error("eine Spielstunde nach dem Bau nicht erreicht: " + o.stunde + " h in " + o.takte + " Takten, " + o.wandS + " s Wand" + (o.fehler ? " · " + o.fehler : ""));
                K.zahl(3, {
                    n: o.n,
                    werte: { bewohner: o.bewohner, einrichtung: o.einrichtung, abnutzung: o.abnutzung, stunde: o.stunde },
                    beleg: o.typ ? o.typ + " bei " + o.x + "/" + o.z + ", " + o.takte + " Takte, " + o.stunde + " Spielstunden (" + o.stundeS + " s je Stunde), " + o.wandS + " s Wand" : o.fehler,
                    taeter: o.bewohner > 0 ? null : "die Bewohner-Liste liest nur die Slots des Plans (stamm/siedlung-bewohner.js:762): ein gesetztes Haus bekommt keinen Bewohner",
                });
            });
        })(H, K);
    return K.ende();
});