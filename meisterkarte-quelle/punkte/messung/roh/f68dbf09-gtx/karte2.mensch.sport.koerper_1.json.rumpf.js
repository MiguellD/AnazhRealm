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
SPEC: {"leiter":"mensch.sport.koerper","sprossen":{"1":{"umfang":{"soll":11,"wort":"Verben im Spiel gegen Eichwert (5 des Leibs + 6 Geräte-Verben)","herkunft":"der Umfang „5 Verben + 6 Geräte-Verben“ eines Leibs: 5 + 6 = 11 Verben"},"masse":[{"key":"gehen","wort":"Tempo Gehen (m/s)","soll":1.5,"tol":0.15,"herkunft":"der Eichwert des Gehens ~1,5 m/s (koerper-core.js:502), ± 10 % des Richters = ± 0,15"},{"key":"sprint","wort":"Tempo Sprint (m/s)","soll":6.8,"tol":0.68,"herkunft":"der Eichwert des Sprints ~6,8 m/s (koerper-core.js:502), ± 10 % des Richters = ± 0,68"},{"key":"sprung","wort":"Sprunghöhe (m)","soll":0.53,"tol":0.053,"herkunft":"der Eichwert des Sprungs ~0,53 m bei g = 9,81 (koerper-core.js:502), ± 10 % des Richters = ± 0,053"}]},"2":{"umfang":{"soll":3,"wort":"Untergründe gemessen (Stufe · Hang · Gerät)","herkunft":"die Aufzählung des Umfangs „Stufe, Hang, Gerät“: 3 Untergründe"},"masse":[{"key":"gleiten","wort":"Fuß-Gleiten im Stand (cm, größtes)","soll":2,"richtung":"≤"}]},"3":{"umfang":{"soll":10,"wort":"Leiber mit Kraft statt Konstante"},"masse":[{"key":"verlust","wort":"Verlust auf der zweiten 400-m-Hälfte (%)","von":5,"bis":12}]},"4":{"umfang":{"soll":100,"wort":"Bewegungsaufgaben"},"masse":[{"key":"mpjpe","wort":"MPJPE gegen Referenzbewegung (mm)","soll":60,"richtung":"≤"}]},"5":{"auge":{"pose":"keine: kein Spiel bringt Leib an Leib","vorbild":"Referenzvideo von Zweikämpfen (0 Durchdringungen in 1 000 Kontakten)"}},"6":{"auge":{"pose":"keine: keine Baupläne im Sport","vorbild":"Gangarten der Tierreferenz je Froude (N = 100, ≥ 80 %)"}},"7":{"auge":{"pose":"keine: keine Disziplin","vorbild":"Video von Weltklasse-Athleten (Zweiwahl-Blindtest ≤ 60 %)"}}}},
LEIB: async (r, T, arg) => {
    const st = r.state;
    const pm = st.playerMesh;
    if (!pm || typeof r._gameLoopTick !== "function") return { fehlt: "kein Spieler-Leib" };
    const halt = st.verbTafel.gehalten;
    const rig = pm.userData && pm.userData.rig;
    const fuesse = rig ? [rig.legL && rig.legL.ankle, rig.legR && rig.legR.ankle].filter(Boolean) : [];
    let uhr = performance.now();
    const takt = () => r._gameLoopTick((uhr += 1000 / 60));
    const v = new T.Vector3();
    const boden = (x, z) => r.getTerrainHeightAt(x, z);
    const ruhe = (n) => {
        halt.vor = false;
        halt.sprint = false;
        halt.jump = false;
        for (let i = 0; i < n; i++) takt();
    };
    const lauf = (sprint, n) => {
        const spur = [];
        const F = fuesse.map(() => []);
        halt.vor = true;
        halt.sprint = !!sprint;
        try {
            for (let i = 0; i < n; i++) {
                takt();
                spur.push([pm.position.x, pm.position.y, pm.position.z]);
                fuesse.forEach((b, k) => {
                    b.getWorldPosition(v);
                    F[k].push([v.x, v.y - boden(v.x, v.z), v.z]);
                });
            }
        } finally {
            halt.vor = false;
            halt.sprint = false;
        }
        const i0 = Math.max(0, spur.length - 61);
        const a = spur[i0];
        const e = spur[spur.length - 1];
        const weg = Math.hypot(e[0] - a[0], e[2] - a[2]);
        const gleiten = [];
        for (const S of F) {
            const s2 = S.slice(30);
            if (s2.length < 10) continue;
            const min = Math.min(...s2.map((x) => x[1]));
            let start = -1;
            for (let t = 0; t <= s2.length; t++) {
                const an = t < s2.length && s2[t][1] <= min + 0.01;
                if (an && start < 0) start = t;
                else if (!an && start >= 0) {
                    if (t - start >= 3) {
                        let m = 0;
                        for (let u = start; u < t; u++) m = Math.max(m, Math.hypot(s2[u][0] - s2[start][0], s2[u][2] - s2[start][2]));
                        gleiten.push(m);
                    }
                    start = -1;
                }
            }
        }
        return { tempo: weg / ((spur.length - 1 - i0) / 60), neig: (Math.atan2(e[1] - a[1], weg) * 180) / Math.PI, gleiten, richt: Math.atan2(e[0] - a[0], e[2] - a[2]) };
    };
    const kurz = (L) => ({ tempo: +L.tempo.toFixed(3), neig: +L.neig.toFixed(1), phasen: L.gleiten.length, gleitenCm: L.gleiten.length ? +(100 * Math.max(...L.gleiten)).toFixed(2) : null });
    let gehen, sprint, hub, hang, steil;
    try {
        ruhe(10);
        gehen = lauf(false, 150);
        sprint = lauf(true, 150);
        ruhe(40);
        const y0 = pm.position.y;
        let max = y0;
        halt.jump = true;
        try {
            for (let i = 0; i < 4; i++) {
                takt();
                max = Math.max(max, pm.position.y);
            }
        } finally {
            halt.jump = false;
        }
        for (let i = 0; i < 80; i++) {
            takt();
            max = Math.max(max, pm.position.y);
        }
        hub = max - y0;
        // der steilste Hang um den Leib: die Richtung, in der das Gelände auf 6 und 12 m am meisten steigt
        const p = pm.position;
        const h0 = boden(p.x, p.z);
        for (let k = 0; k < 16; k++)
            for (const R of [6, 12]) {
                const w = (k * Math.PI) / 8;
                const s = (boden(p.x + R * Math.sin(w), p.z + R * Math.cos(w)) - h0) / R;
                if (!steil || s > steil.s) steil = { w, s, R };
            }
        const gier0 = st.yaw;
        const dw = steil.w - gehen.richt;
        const ab = (a, b) => Math.abs(((((a - b) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
        st.yaw = gier0 + dw;
        let probe = lauf(false, 20);
        if (ab(probe.richt, steil.w) > 0.5) {
            st.yaw = gier0 - dw;
            probe = lauf(false, 20);
        }
        hang = lauf(false, 150);
    } finally {
        ruhe(1);
    }
    return {
        fuesse: fuesse.length,
        gehen: kurz(gehen),
        sprint: kurz(sprint),
        sprungM: +hub.toFixed(3),
        hang: kurz(hang),
        steilGrad: +((Math.atan(steil.s) * 180) / Math.PI).toFixed(1),
        gleitenCm: +(100 * Math.max(0, ...gehen.gleiten, ...sprint.gleiten, ...hang.gleiten)).toFixed(2),
    };
},
SPORT: async (r, T, arg) => {
    const o = arg || {};
    const st = r.state;
    const cp = st.camera.position;
    const Sm = r._bewohnerSiedlungen;
    const siedl = Sm && typeof Sm.values === "function" ? Array.from(Sm.values()) : [];
    const SP = /sport|spiel|wett|lauf|tanz|kampf|ball|brett|turnier|partie|ringen|fecht/i;
    const alle = [];
    for (const S of siedl)
        for (const b of S.liste || []) {
            const g = b.leib;
            if (!g || !g.position || !b.genom) continue;
            let aktN = null;
            if (Number.isFinite(o.stunde)) {
                try {
                    aktN = r._bewohnerSoll(b, o.stunde).akt;
                } catch (e) {
                    aktN = "?";
                }
            }
            const p = g.position;
            alle.push({
                x: p.x,
                z: p.z,
                d: Math.hypot(p.x - cp.x, p.z - cp.z),
                drin: !!(b.drinnen || (g.userData && g.userData._drinnen)),
                akt: b.akt || null,
                aktN,
                tempo: b.tempo,
                alterJ: 18 + 62 * (b.genom.alter || 0),
                blick: g.rotation ? g.rotation.y : 0,
                koennen: !!(b.koennen || b.uebung || b.talent || b.rekord || b.elo),
                wagen: !!(b.wagen || b.amSteuer),
            });
        }
    const zaehle = (L, key) => {
        const m = {};
        for (const a of L) m[a[key] || "—"] = (m[a[key] || "—"] || 0) + 1;
        return m;
    };
    const draussen = alle.filter((a) => !a.drin).sort((a, c) => a.d - c.d);
    // die 100-m-Zeit der 100 nächsten Bewohner draußen, ihr Variationskoeffizient und der Gang des Alters (Spearman ρ)
    const hundert = draussen.filter((a) => a.tempo > 0).slice(0, 100);
    const t100 = hundert.map((a) => 100 / a.tempo);
    const mittel = t100.reduce((s, x) => s + x, 0) / (t100.length || 1);
    const sd = Math.sqrt(t100.reduce((s, x) => s + (x - mittel) * (x - mittel), 0) / Math.max(1, t100.length - 1));
    const rang = (L) => {
        const R = new Array(L.length);
        L.map((x, i) => [x, i])
            .sort((a, c) => a[0] - c[0])
            .forEach((x, k) => (R[x[1]] = k));
        return R;
    };
    const spear = (A, B) => {
        if (A.length < 3) return null;
        const ra = rang(A), rb = rang(B), m = (A.length - 1) / 2;
        let s = 0, sa = 0, sb = 0;
        for (let i = 0; i < A.length; i++) {
            s += (ra[i] - m) * (rb[i] - m);
            sa += (ra[i] - m) * (ra[i] - m);
            sb += (rb[i] - m) * (rb[i] - m);
        }
        return sa && sb ? s / Math.sqrt(sa * sb) : 0;
    };
    // die Bühnen des Genesis-Orts und die Zuschauer an der Arena
    const GW = r._genesisWerkListe;
    const ar = GW && GW.buehnen && GW.buehnen.arena;
    let zuschauer = 0;
    let blickt = 0;
    if (ar)
        for (const a of draussen) {
            const dx = ar.x - a.x, dz = ar.z - a.z;
            if (Math.hypot(dx, dz) > ar.r + 15) continue;
            zuschauer++;
            const dw = Math.abs(((((Math.atan2(dx, dz) - a.blick) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
            if (dw < Math.PI / 6) blickt++;
        }
    // was in der Welt steht: Geräte des Spielplatzes (fachwerk WERKE `siteTag` spielplatz), Wagen, Strecken
    const FC = globalThis.__fachwerkCore;
    const arten = new Set(FC && FC.WERKE ? Object.values(FC.WERKE).filter((w) => w && w.siteTag === "spielplatz").map((w) => w.kind) : []);
    const arch = st.architectures || [];
    const typ = (e) => String((e && e.type) || "");
    const geraete = arch.filter((e) => arten.has(typ(e).split("_")[0])).length;
    const fahrzeuge = arch.filter((e) => /^fahrzeug/.test(typ(e))).length;
    const strecken = arch.filter((e) => /strecke|rennbahn|stadion|spielfeld/.test(typ(e))).length;
    // die Stadt-Stichproben am Nachmittag: 20 Orte von Bewohnern draußen, gleich über die Liste verteilt; eine Partie in Sichtweite
    // sind ≥ 2 Bewohner im Sport-Akt der Stunde binnen 50 m
    const sportN = alle.filter((a) => a.aktN && SP.test(a.aktN));
    // die Partien der Stunde: Gruppen von ≥ 2 Bewohnern im Sport-Akt binnen 50 m um ihren ersten
    const offen = sportN.slice();
    let partien = 0;
    while (offen.length) {
        const k = offen.shift();
        const mit = offen.filter((a) => Math.hypot(a.x - k.x, a.z - k.z) < 50);
        for (const a of mit) offen.splice(offen.indexOf(a), 1);
        if (mit.length >= 1) partien++;
    }
    const nP = Math.min(20, draussen.length);
    let mitPartie = 0;
    for (let k = 0; k < nP; k++) {
        const p = draussen[Math.floor((k * draussen.length) / nP)];
        if (sportN.filter((a) => Math.hypot(a.x - p.x, a.z - p.z) < 50).length >= 2) mitPartie++;
    }
    const KC = window.__koerperCore;
    return {
        n: alle.length,
        draussen: draussen.length,
        siedlungen: siedl.length,
        akte: zaehle(alle, "akt"),
        akteN: Number.isFinite(o.stunde) ? zaehle(alle, "aktN") : null,
        sport: alle.filter((a) => a.akt && SP.test(a.akt)).length,
        sportN: sportN.length,
        treff: alle.filter((a) => a.akt === "treff").length,
        koennen: alle.filter((a) => a.koennen).length,
        wagen: alle.filter((a) => a.wagen).length,
        lauf: { n: t100.length, mittelS: +mittel.toFixed(2), cv: t100.length ? +((100 * sd) / mittel).toFixed(2) : null, alterRho: spear(hundert.map((a) => a.alterJ), t100) },
        arena: ar ? { x: ar.x, z: ar.z, r: ar.r } : null,
        spielplatz: GW && GW.buehnen && GW.buehnen.spielplatz ? true : false,
        zuschauer,
        blickt,
        geraete,
        fahrzeuge,
        strecken,
        stichproben: nP,
        mitPartie,
        partien,
        schwere: st.gravity,
        verben: 5 + (KC && KC.VERB_GESETZ ? Object.keys(KC.VERB_GESETZ).length : 0),
        geraetVerben: KC && KC.VERB_GESETZ ? Object.keys(KC.VERB_GESETZ) : [],
    };
}
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            K.sicht = "third";
            await K.messort("wiese");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 20000);
            await K.schritt(3, async () => K.leser(3, { fehlt: "Tempo = Basis × Größe (leibWerte), keine Kraft-Geschwindigkeit, keine Ermüdung des Laufs über 400 m, kein Wurf", wo: "koerper-core.js:5455" }));
            await K.schritt(4, async () => K.nicht(4, { n: z.verben, fehlt: "10² Bewegungsaufgaben: die Welt trägt " + z.verben + " Verben (5 des Leibs + " + z.geraetVerben.join(", ") + "), kein Werfen, Treten, Schwimmstil, Stoß gegen Referenz" }));
            await K.schritt(5, async () => K.nicht(5, { n: 0, fehlt: "10³ Kontakte zweier Leiber bei Spieltempo: kein Spiel, das Leib an Leib bringt" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "10² Baupläne treiben Sport: 0 Baupläne im Sport" }));
            await K.schritt(7, async () => K.nicht(7, { n: 0, fehlt: "Weltklasse jeder Disziplin und Schwere: 0 Disziplinen" }));
            const L = await K.welt("return await (" + H.seite.LEIB + ")(r, T, {});", 40000);
            H.zeile("Leib: " + JSON.stringify(L));
            await K.schritt(1, async () => {
                if (L.fehlt) throw new Error(L.fehlt);
                const w = { gehen: L.gehen.tempo, sprint: L.sprint.tempo, sprung: L.sprungM };
                K.zahl(1, {
                    n: Object.values(w).filter((x) => Number.isFinite(x) && x > 0).length,
                    werte: w,
                    beleg: "Eichwert koerper-core.js:502 (Gehen ~1,5 · Sprint ~6,8 m/s · Sprung ~0,53 m; Klettern 0,6 · Schwimmen 1,3 m/s und die Geräte-Verben " + z.geraetVerben.join(", ") + " an der Wiese ungemessen: keine Wand, kein Wasser, kein Gerät)",
                    taeter: "die Leib-Werte des Menschen (koerper-core.js fx.bewegung) — am Umfang: die Probe der Wiese stellt Klettern, Schwimmen und die Geräte-Verben nicht",
                });
            });
            await K.schritt(2, async () => {
                if (L.fehlt) throw new Error(L.fehlt);
                const hangDa = L.hang.neig >= 8 && L.hang.phasen >= 3 ? 1 : 0;
                K.zahl(2, {
                    n: hangDa,
                    werte: { gleiten: L.gleitenCm },
                    beleg: "Fläche gehen " + JSON.stringify(L.gehen) + " · laufen " + JSON.stringify(L.sprint) + " · Hang " + JSON.stringify(L.hang) + " (steilster im Umkreis " + L.steilGrad + "°) · Stufe und Gerät stellt die Probe nicht",
                    taeter: L.gleitenCm > 2 ? "der Fuß im Stand (koerper-core.js leibPlan, Gang-Gesetz)" : "Stufe und Gerät ungemessen (Spielplatz am Genesis-Ort)",
                });
            });
        })(H, K);
    return K.ende();
});