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
SPEC: {"leiter":"mensch.leib.stoff","sprossen":{"1":{"umfang":{"soll":160,"wort":"Posen × Samen gemessen, je eigener Guss (8 Gehen + 8 Lauf je Same, 10 Samen)","herkunft":"der Richter „16 Posen × 10 Samen“: 16 · 10 = 160 Posen, jeder Same ein eigener Guss"},"masse":[{"key":"durch","wort":"Durchstiche der Haut durch den Stoff","soll":0,"richtung":"≤"}]},"2":{"umfang":{"soll":1,"wort":"Spieler mit Tuch im Takt (Löser und Vorlage)"},"masse":[{"key":"verzug","wort":"Verzug des Saums (ms)","soll":0,"richtung":">"},{"key":"durch","wort":"Durchdringungen in der Lauf-Reihe","soll":0,"richtung":"≤"}]},"3":{"auge":{"pose":"keine: zehn Nahe mit Lagen fehlen","vorbild":"Video Hemd unter Mantel unter Umhang im Wind (Prüfer „echt“ ≥ 60 %)"}},"4":{"auge":{"pose":"dorf Third: 3 m vor dem nächsten Bewohner, 1,5 m hoch","vorbild":"Fotopaar trocken/nass derselben Kleidung; Verschleiß Bauer ↔ Adel (≥ 80 %)"}},"5":{"auge":{"pose":"keine: 10³–10⁴ Stoffe im Bild fehlen","vorbild":"Video eines vollen Platzes im Wind (Verwechslung ≥ 40 %)"}},"6":{"auge":{"pose":"keine: das Stadion fehlt","vorbild":"Filmaufnahme eines Stadions (Blindtest 50 ± 5 %)"}}}},
ZENSUS: async (r, T, arg) => {
    const o = arg || {};
    const st = r.state;
    const cam = st.camera;
    const cp = cam.position;
    const can = st.renderer && st.renderer.domElement;
    const hPx = (can && can.height) || 1080;
    const tanH = Math.tan(((cam.fov || 60) * Math.PI) / 360);
    const pxJeM = (d) => hPx / (2 * Math.max(0.5, d) * tanH);
    const Sm = r._bewohnerSiedlungen;
    const siedl = Sm && typeof Sm.values === "function" ? Array.from(Sm.values()) : [];
    const name = (x) => (x == null ? "?" : typeof x === "object" ? String(x.id || x.name || x.key || JSON.stringify(x).slice(0, 60)) : String(x));
    const alle = [];
    for (const S of siedl)
        for (const b of S.liste || []) {
            const g = b.leib;
            const gen = b.genom;
            if (!g || !g.position || !gen) continue;
            const h = 8 * gen.kh;
            const s = b.groesse || 1;
            const bau = b.bau || {};
            const p = g.position;
            const K = (S.plan && S.plan.kleidung) || {};
            alle.push({
                S: S.key,
                g: b.gestalt,
                h,
                br: 0.45 * s * (b.breite || 1),
                ti: 0.25 * s * (b.tiefe || 1),
                bein: 0.026 * h * (bau.bauBein || 0),
                arm: 0.027 * h * (bau.bauArm || 0),
                sch: 0.048 * 0.45 * s * (bau.bauSchulter || 0),
                garnitur: [S.key, K.top, K.bottom, K.shoes, (b.farben || {}).topColor, (b.farben || {}).bottomColor, (b.farben || {}).shoeColor].join("|"),
                alterJ: 18 + 62 * (gen.alter || 0),
                beruf: b.beruf || b.rolle || null,
                akt: b.akt || null,
                haltung: (b.gemuet && b.gemuet.haltung) || null,
                drin: !!(b.drinnen || (g.userData && g.userData._drinnen)),
                last: !!(b.last || b.traegt || b.wunde || b.verletzt || b.narbe),
                x: p.x,
                y: p.y,
                z: p.z,
                blick: g.rotation ? g.rotation.y : 0,
                d: Math.hypot(p.x - cp.x, p.y - cp.y, p.z - cp.z),
                gk: [gen.sex, gen.kh, gen.build, gen.muscle, gen.headRatio, gen.alter, gen.auge, gen.mund, gen.braue, gen.haaransatz, gen.schnitt, gen.skinTone, gen.hairColor].join("|"),
            });
        }
    const dm = (a, c) =>
        a.S !== c.S || a.g !== c.g ? Infinity : Math.max(Math.abs(a.h - c.h), Math.abs(a.br - c.br), Math.abs(a.ti - c.ti), Math.abs(a.bein - c.bein), Math.abs(a.arm - c.arm), Math.abs(a.sch - c.sch));
    const draussen = alle.filter((a) => !a.drin).sort((a, c) => a.d - c.d);
    const nah = draussen.slice(0, o.nah || 100);
    let paareNah = 0;
    let minPx = Infinity;
    for (let i = 0; i < nah.length; i++)
        for (let j = i + 1; j < nah.length; j++) {
            const px = dm(nah[i], nah[j]) * pxJeM(Math.max(nah[i].d, nah[j].d));
            if (px < minPx) minPx = px;
            if (px < 1) paareNah++;
        }
    const zehn = nah.slice(0, 10);
    let paare10 = 0;
    for (let i = 0; i < zehn.length; i++) for (let j = i + 1; j < zehn.length; j++) if (dm(zehn[i], zehn[j]) * pxJeM(Math.max(zehn[i].d, zehn[j].d)) < 1) paare10++;
    let klone30 = 0;
    const k30 = pxJeM(30);
    for (let i = 0; i < alle.length; i++) for (let j = i + 1; j < alle.length; j++) if (dm(alle[i], alle[j]) * k30 < 1) klone30++;
    const paareGleich = (key) => {
        const m = new Map();
        for (const a of alle) m.set(a[key], (m.get(a[key]) || 0) + 1);
        let n = 0;
        for (const k of m.values()) n += (k * (k - 1)) / 2;
        return n;
    };
    const zaehle = (L, key) => {
        const m = {};
        for (const a of L) m[a[key] || "—"] = (m[a[key] || "—"] || 0) + 1;
        return m;
    };
    const plaene = siedl.map((S) => {
        const P = S.plan || {};
        const K = P.kleidung || {};
        const jahr = P.schnitt && Number.isFinite(P.schnitt.jahr) ? P.schnitt.jahr : P.jahr;
        return { key: S.key, n: (S.liste || []).length, jahr, region: name(P.region), schnitt: [K.top, K.bottom, K.shoes].join("/"), farben: (K.farben || []).length };
    });
    const uniq = (L) => Array.from(new Set(L.filter((x) => x != null && x !== "")));
    const alter = alle.map((a) => a.alterJ);
    // DIE POSEN (feste Regel, im Text der Sprosse genannt): A der nächste Bewohner draußen, c die Mitte der zehn nächsten
    const posen = {};
    if (zehn.length) {
        const A = zehn[0];
        const cx = zehn.reduce((s, a) => s + a.x, 0) / zehn.length;
        const cz = zehn.reduce((s, a) => s + a.z, 0) / zehn.length;
        let ux = cx - A.x;
        let uz = cz - A.z;
        const ul = Math.hypot(ux, uz);
        const fx = Math.sin(A.blick);
        const fz = Math.cos(A.blick);
        if (ul < 0.3) [ux, uz] = [-fx, -fz];
        else [ux, uz] = [ux / ul, uz / ul];
        const kopf = A.y + 0.93 * A.h;
        posen.zehn = { px: A.x - 2 * ux, py: A.y + 1.6, pz: A.z - 2 * uz, lx: cx, ly: A.y + 1.2, lz: cz };
        posen.gesicht = { px: A.x + 2 * fx, py: kopf, pz: A.z + 2 * fz, lx: A.x, ly: kopf, lz: A.z };
        posen.leib = { px: A.x + 3 * fx, py: A.y + 1.5, pz: A.z + 3 * fz, lx: A.x, ly: A.y + 0.9, lz: A.z };
        const mx = nah.reduce((s, a) => s + a.x, 0) / nah.length;
        const my = nah.reduce((s, a) => s + a.y, 0) / nah.length;
        const mz = nah.reduce((s, a) => s + a.z, 0) / nah.length;
        posen.ueber = { px: mx, py: my + 10, pz: mz + 17.3, lx: mx, ly: my + 1, lz: mz };
        posen.A = { x: A.x, y: A.y, z: A.z, h: A.h, beruf: A.beruf, akt: A.akt, haltung: A.haltung, alterJ: A.alterJ };
    }
    return {
        n: alle.length,
        draussen: draussen.length,
        siedlungen: plaene,
        cam: { x: cp.x, y: cp.y, z: cp.z, fov: cam.fov, hPx },
        nahN: nah.length,
        paareNah,
        minPx: Number.isFinite(minPx) ? minPx : null,
        gestaltenNah: uniq(nah.map((a) => a.S + ":" + a.g)).length,
        gestalten10: uniq(zehn.map((a) => a.S + ":" + a.g)).length,
        paare10,
        klone30,
        garniturPaare: paareGleich("garnitur"),
        genomPaare: paareGleich("gk"),
        alterJ: alter.length ? [Math.min(...alter), Math.max(...alter)] : null,
        berufe: uniq(alle.map((a) => a.beruf)),
        berufe100: uniq(nah.map((a) => a.beruf)),
        akte: zaehle(alle, "akt"),
        akt10: zaehle(zehn, "akt"),
        haltung10: zaehle(zehn, "haltung"),
        treff: alle.filter((a) => a.akt === "treff").length,
        last: alle.filter((a) => a.last).length,
        schnitte: uniq(plaene.map((p) => p.schnitt)),
        schnitte100: uniq(nah.map((a) => a.garnitur.split("|").slice(1, 4).join("/"))).length,
        regionen: uniq(plaene.map((p) => p.region)),
        epochen: uniq(plaene.map((p) => (Number.isFinite(p.jahr) ? Math.floor(p.jahr / 100) : null))),
        posen,
    };
},
PRAEGEN: async (r, T, arg) => {
    const R = typeof AnazhRealm !== "undefined" && AnazhRealm.KOERPER_HOST_RECIPE ? AnazhRealm.KOERPER_HOST_RECIPE : "mensch";
    const ov = r._ensureWorkshopState().studioOv;
    const abdruck = () => {
        const pm = r.state.playerMesh;
        if (!pm) return null;
        let n = 0;
        pm.traverse((x) => {
            if (x.isMesh && x.geometry && x.geometry.attributes && x.geometry.attributes.position) n += x.geometry.attributes.position.count;
        });
        const bb = new T.Box3().setFromObject(pm);
        return n + ":" + Math.round((bb.max.y - bb.min.y) * 1000);
    };
    if (!window.__k2Praegung) window.__k2Praegung = { da: Object.prototype.hasOwnProperty.call(ov, R), v: ov[R] };
    const vor = abdruck();
    if (arg && arg.zurueck) {
        const a = window.__k2Praegung;
        window.__k2Praegung = null;
        if (a.da) r._praegungSetzen("koerper", R, a.v);
        else {
            delete ov[R];
            r.applyPlayerSoul((r.state.player && r.state.player.soul) || "human");
        }
        return { abdruck: abdruck(), zurueck: true };
    }
    const gen = r._rollHumanoidGenome(String(arg.same));
    const d = Object.assign(r._dialsAusGenom(gen), {
        hairStyle: gen.schnitt,
        hairLen: gen.haarLaenge,
        hairVol: gen.haarFuelle,
        age: gen.alter,
        auge: gen.auge,
        mund: gen.mund,
        braue: gen.braue,
        haaransatz: gen.haaransatz,
    });
    r._praegungSetzen("koerper", R, d);
    let jetzt = abdruck();
    for (let i = 0; i < 30 && jetzt === vor; i++) {
        await new Promise((ok) => setTimeout(ok, 100));
        await window.__seitenTakt();
        jetzt = abdruck();
    }
    return { abdruck: jetzt, vor, neu: jetzt !== vor, hoeheM: +(8 * gen.kh).toFixed(3) };
},
STOFF: async (r, T, arg) => {
    const o = arg || {};
    const st = r.state;
    const pm = st.playerMesh;
    if (!pm || typeof r._gameLoopTick !== "function") return { fehlt: "kein Spieler-Leib" };
    const halt = st.verbTafel.gehalten;
    let uhr = performance.now();
    const takt = () => r._gameLoopTick((uhr += 1000 / 60));
    const matrizen = () => {
        if (typeof r._leibMatrix === "function") r._leibMatrix(pm);
        pm.updateMatrixWorld(true);
    };
    const v = new T.Vector3();
    const q = new T.Vector3();
    const posiert = (m, pa, i, out) => {
        out.fromBufferAttribute(pa, i);
        m.applyBoneTransform(i, out);
        return out.applyMatrix4(m.matrixWorld);
    };
    const benutzt = (m) => {
        const g = m.geometry;
        const n = g.attributes.position.count;
        if (!g.index) return Array.from({ length: n }, (_, i) => i);
        const s = new Uint8Array(n);
        const ix = g.index.array;
        for (let k = 0; k < ix.length; k++) s[ix[k]] = 1;
        const a = [];
        for (let i = 0; i < n; i++) if (s[i]) a.push(i);
        return a;
    };
    const Z = 0.025;
    const zelle = (x, y, z) => Math.floor(x / Z) + "," + Math.floor(y / Z) + "," + Math.floor(z / Z);
    let teile = null;
    let kand = null;
    let vz = 0;
    const posen = [];
    const messen = () => {
        matrizen();
        const sx = [];
        const sm = [];
        const si = [];
        const gitter = new Map();
        teile.stoff.forEach((m, mi) => {
            const pa = m.geometry.attributes.position;
            for (let i = 0; i < pa.count; i++) {
                posiert(m, pa, i, v);
                const e = sm.length;
                sx.push(v.x, v.y, v.z);
                sm.push(mi);
                si.push(i);
                const k = zelle(v.x, v.y, v.z);
                const L = gitter.get(k);
                if (L) L.push(e);
                else gitter.set(k, [e]);
            }
        });
        const naechste = (x, y, z) => {
            let best = -1;
            let bd = Z * Z;
            const cx = Math.floor(x / Z), cy = Math.floor(y / Z), cz = Math.floor(z / Z);
            for (let a = -1; a <= 1; a++)
                for (let b = -1; b <= 1; b++)
                    for (let c = -1; c <= 1; c++) {
                        const L = gitter.get(cx + a + "," + (cy + b) + "," + (cz + c));
                        if (!L) continue;
                        for (const e of L) {
                            const dx = sx[3 * e] - x, dy = sx[3 * e + 1] - y, dz = sx[3 * e + 2] - z;
                            const d2 = dx * dx + dy * dy + dz * dz;
                            if (d2 < bd) [bd, best] = [d2, e];
                        }
                    }
            return best;
        };
        const erste = kand === null;
        if (erste) {
            kand = [];
            teile.haut.forEach((m, hi) => {
                const pa = m.geometry.attributes.position;
                for (const i of benutzt(m)) {
                    posiert(m, pa, i, v);
                    if (naechste(v.x, v.y, v.z) >= 0) kand.push([hi, i]);
                }
            });
        }
        const dns = [];
        for (const [hi, i] of kand) {
            const m = teile.haut[hi];
            posiert(m, m.geometry.attributes.position, i, v);
            const e = naechste(v.x, v.y, v.z);
            if (e < 0) continue;
            const ms = teile.stoff[sm[e]];
            const pa = ms.geometry.attributes.position;
            const na = ms.geometry.attributes.normal;
            if (!na) continue;
            q.fromBufferAttribute(pa, si[e]);
            q.x += 0.01 * na.getX(si[e]);
            q.y += 0.01 * na.getY(si[e]);
            q.z += 0.01 * na.getZ(si[e]);
            ms.applyBoneTransform(si[e], q);
            q.applyMatrix4(ms.matrixWorld);
            const nx = q.x - sx[3 * e], ny = q.y - sx[3 * e + 1], nz = q.z - sx[3 * e + 2];
            const nl = Math.hypot(nx, ny, nz) || 1;
            const dx = v.x - sx[3 * e], dy = v.y - sx[3 * e + 1], dz = v.z - sx[3 * e + 2];
            const dn = (dx * nx + dy * ny + dz * nz) / nl;
            const lat2 = dx * dx + dy * dy + dz * dz - dn * dn;
            dns.push([dn, lat2]);
        }
        if (erste) vz = dns.filter((x) => x[0] > 0).length > dns.filter((x) => x[0] < 0).length ? -1 : 1;
        const durch = dns.filter((x) => vz * x[0] > 0.001 && x[1] < 1e-4).length;
        posen.push({ durch, paare: dns.length });
        return durch;
    };
    // die Reihe: die starre Lage einer Tuch-Ecke (ihre Vorlage mit denselben Gewichten) und ihre Lage aus dem Löser, relativ zum Leib
    const reihe = [];
    const reiheWahl = () => {
        matrizen();
        const L = [];
        teile.stoff.forEach((m) => {
            const vor = m.userData.__tuchVorlage;
            if (!vor || !vor.attributes || !vor.attributes.position) return;
            const pa = m.geometry.attributes.position;
            for (let i = 0; i < pa.count; i += 3) {
                posiert(m, pa, i, v);
                posiert(m, vor.attributes.position, i, q);
                L.push({ m, i, dev: v.distanceTo(q) });
            }
        });
        L.sort((a, b) => b.dev - a.dev);
        for (const x of L.slice(0, 24)) reihe.push({ m: x.m, i: x.i, dev: x.dev, a: [], s: [] });
    };
    const reiheTakt = () => {
        matrizen();
        const p = pm.position;
        for (const x of reihe) {
            posiert(x.m, x.m.geometry.attributes.position, x.i, v);
            posiert(x.m, x.m.userData.__tuchVorlage.attributes.position, x.i, q);
            x.a.push([v.x - p.x, v.z - p.z]);
            x.s.push([q.x - p.x, q.z - p.z]);
        }
    };
    let durch = 0;
    try {
        halt.vor = true;
        halt.sprint = false;
        for (let i = 0; i < 20; i++) takt();
        const G = pm.userData && pm.userData._gelenk;
        const wurzel = (G && (G.istFern ? G.fern : G.nah)) || pm;
        teile = { haut: [], stoff: [] };
        wurzel.traverse((n) => {
            if (!n.isSkinnedMesh) return;
            if (n.userData.__seh === "haut" && n.userData.__klasse === "haut") teile.haut.push(n);
            else if (n.userData.__seh === "stoff") teile.stoff.push(n);
        });
        if (!teile.haut.length || !teile.stoff.length) return { fehlt: "Haut " + teile.haut.length + " · Stoff " + teile.stoff.length + " Teile am Leib", posen: 0 };
        for (let k = 0; k < 8; k++) {
            for (let i = 0; i < 4; i++) takt();
            durch += messen();
        }
        if (o.reihe) reiheWahl();
        halt.sprint = true;
        for (let k = 0; k < 8; k++) {
            for (let i = 0; i < 4; i++) {
                takt();
                if (o.reihe) reiheTakt();
            }
            durch += messen();
        }
    } finally {
        halt.vor = false;
        halt.sprint = false;
    }
    let verzug = null;
    let devCm = null;
    if (o.reihe && reihe.length && reihe[0].a.length > 10) {
        let best = 0;
        let bestS = -Infinity;
        for (let L = 0; L <= 8; L++) {
            let s = 0;
            for (const x of reihe)
                for (let t = 1; t + L < x.a.length; t++) {
                    const sx = x.s[t][0] - x.s[t - 1][0], sz = x.s[t][1] - x.s[t - 1][1];
                    const ax = x.a[t + L][0] - x.a[t + L - 1][0], az = x.a[t + L][1] - x.a[t + L - 1][1];
                    s += sx * ax + sz * az;
                }
            if (s > bestS) [bestS, best] = [s, L];
        }
        verzug = +((best * 1000) / 60).toFixed(1);
        devCm = +((100 * reihe.reduce((s, x) => s + x.dev, 0)) / reihe.length).toFixed(2);
    }
    return {
        posen: posen.length,
        durch,
        paare: kand ? kand.length : 0,
        hautTeile: teile.haut.length,
        stoffTeile: teile.stoff.length,
        tuch: !!pm.userData._tuch,
        vorlage: teile.stoff.some((m) => !!m.userData.__tuchVorlage),
        reihe: o.reihe ? { verzugMs: verzug, devCm, ecken: reihe.length, durch: posen.slice(8).reduce((s, x) => s + x.durch, 0) } : null,
    };
},
WETTER: async (r, T, arg) => window.__wetterSetzen(arg.wort)
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            const welt = (name, arg, ms) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms);
            K.sicht = "third";
            await K.messort("dorf");
            const z = await welt("ZENSUS", { nah: 10 }, 30000);
            await K.schritt(3, async () => K.nicht(3, { n: Math.min(z.draussen, 4), fehlt: "10 Nahe mit Lagen: die Nah-Wahl trägt 4 Leiber, je Kleid-Zone EIN Stoff um seine Dicke über der Haut (kein Hemd unter Mantel unter Umhang)" }));
            await K.schritt(5, async () => K.nicht(5, { n: z.draussen, fehlt: "10³–10⁴ Stoffe im Bild: am Ort " + z.draussen + " Bewohner draußen (die Welt höchstens 1092)" }));
            await K.schritt(6, async () => K.nicht(6, { n: z.n, fehlt: "kein Stadion mit 10⁵: am Ort " + z.n + " Bewohner" }));
            await K.schritt(4, async () => {
                if (!z.posen.leib) return K.nicht(4, { n: 0, fehlt: "kein Bewohner draußen am Dorf" });
                const vor = await K.bild(4, z.posen.leib, { wahl: 0 });
                let nach = "—";
                try {
                    const w = await welt("WETTER", { wort: "rainy" });
                    const datei = String(H.AUS).replace(/\.json$/i, "") + "-S4-regen.png";
                    const a = await H.wb("/bild", Object.assign({ datei, w: 1280, h: 720, wahl: 0 }, z.posen.leib), 60000).catch((e) => ({ fehler: String(e.message || e) }));
                    nach = [datei, datei.replace(/\.png$/i, "-rot.png")].find((f) => H.fs.existsSync(f)) || "kein Bild (" + String(a && a.fehler).slice(0, 60) + ")";
                    nach = H.path.basename(nach) + " (Wetter " + w + ")";
                } finally {
                    await welt("WETTER", { wort: "sunny" });
                }
                K.auge(4, { bild: vor.datei, pose: "dorf Third: 3 m vor dem nächsten Bewohner draußen, 1,5 m hoch, Blick auf seine Mitte (0,9 m)", mass: "Paar: trocken " + H.path.basename(vor.datei) + " · Regen " + nach + " · " + JSON.stringify(z.posen.A || {}) });
            });
            await K.messort("wiese");
            const reihe = { n: 0 };
            await K.schritt(1, async () => {
                let posen = 0;
                let durch = 0;
                let alle = 0;
                const abdruecke = [];
                const zeilen = [];
                try {
                    for (let i = 0; i < 10 && H.rest() > 8; i++) {
                        const g = await welt("PRAEGEN", { same: "k2-stoff:" + i }, 20000);
                        const s = await welt("STOFF", { reihe: i === 0 }, 30000);
                        if (s.fehlt) {
                            zeilen.push(i + ": " + s.fehlt);
                            continue;
                        }
                        // der Umfang zählt die Posen jedes Samens EINMAL: ein Guss, der schon gemessen ist, trägt keine Posen bei
                        if (!abdruecke.includes(g.abdruck)) posen += s.posen;
                        alle += s.posen;
                        durch += s.durch;
                        abdruecke.push(g.abdruck);
                        zeilen.push(i + " (" + g.hoeheM + " m, " + s.paare + " Paare Haut↔Tuch): " + s.durch);
                        if (s.reihe) Object.assign(reihe, s.reihe, { n: s.tuch && s.vorlage ? 1 : 0, tuch: s.tuch, vorlage: s.vorlage });
                    }
                } finally {
                    await welt("PRAEGEN", { zurueck: true }, 20000);
                }
                K.zahl(1, {
                    n: posen,
                    werte: { durch },
                    beleg: alle + " Posen an " + abdruecke.length + " Samen, " + new Set(abdruecke).size + " eigene Güsse · " + zeilen.join(" · "),
                    taeter: durch ? "das Tuch über der Haut (koerper-core.js tuchTakt · foundry-core.js Stoff aus der Haut)" : posen < alle ? "die Prägung gießt nicht neu (stamm/netz-portal.js _praegungSetzen)" : null,
                });
            });
            await K.schritt(2, async () => {
                if (reihe.verzugMs === undefined) throw new Error("die Lauf-Reihe des ersten Samens fehlt");
                K.zahl(2, {
                    n: reihe.n,
                    werte: { verzug: reihe.verzugMs == null ? 0 : reihe.verzugMs, durch: reihe.durch },
                    beleg: "Tuch im Takt " + reihe.tuch + " · Vorlage " + reihe.vorlage + " · " + reihe.ecken + " Saum-Ecken · Abweichung von der starren Lage " + reihe.devCm + " cm",
                    taeter: !(reihe.verzugMs > 0) ? "der Löser des Tuchs (koerper-core.js tuchTakt: ruht das Tuch, trägt es seine Abweichung starr)" : null,
                });
            });
        })(H, K);
    return K.ende();
});