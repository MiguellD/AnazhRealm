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
SPEC: {"leiter":"mensch.stadt.form","sprossen":{"2":{"auge":{"pose":"20 Straßenbilder der Großstadt","vorbild":"Straßenbilder realer Großstadt-Viertel: Blindtest Lage und Wohlstand ≥ 70 %"}},"4":{"umfang":{"soll":100,"wort":"Saaten mit Plan"},"masse":[{"key":"imBand","wort":"Saaten mit 4 Kennzahlen im Band 100 realer Städte (OSM)","soll":0.8,"richtung":"≥"}]},"5":{"auge":{"pose":"Draufsicht je Saat","vorbild":"Satellitenbilder realer Städte je Größenklasse: Verwechslung ≥ 40 %"}},"6":{"auge":{"pose":"stadt-voll: der Straßenpunkt des Plans nächst dem Spieler, Auge 1,7 m über Grund, Blick längs der Straße, Mittag","vorbild":"Street-View einer realen Stadt gleicher Klasse (Pflaster, Schilder, Abnutzung, Leben): Verwechslung ≥ 40 %"}},"7":{"auge":{"pose":"Luft- und Straßenbild je Saat","vorbild":"Kenner lesen Alter, Wohlstand, Klima, Gelände der Saat ≥ 70 %"}}}},
STADT: async (r, T, o) => {
    o = o || {};
    const st = r.state;
    const pm = st.playerMesh.position;
    const r2 = (v) => (typeof v === "number" && isFinite(v) ? Math.round(v * 100) / 100 : null);
    const terr = (x, z) => r.getTerrainHeightAt(x, z);
    const boden = (x, z) => {
        const y = typeof r._voxelSurfaceY === "function" ? r._voxelSurfaceY(x, z) : NaN;
        return isFinite(y) ? y : terr(x, z);
    };
    const B = r._bewohnerSiedlungen || new Map();
    const alle = [...B.values()].filter((q) => q && q.plan && Array.isArray(q.plan.slots));
    if (!alle.length) return { fehler: "keine Siedlung mit Plan in der Welt der Sitzung (r._bewohnerSiedlungen leer)" };
    const dS = (q) => Math.hypot(q.ox - pm.x, q.oz - pm.z);
    // WAS STEHT: der Bau der Welt mit dem Samen des Slots an seinem Ort (stadt-proben.cjs)
    const jeSame = new Map();
    for (const e of st.architectures || [])
        if (e && e.position) {
            const k = e.seed >>> 0;
            const L = jeSame.get(k);
            if (L) L.push(e);
            else jeSame.set(k, [e]);
        }
    const stehend = (q) => {
        const aus = [];
        for (const sl of q.plan.slots) {
            if (!sl || !sl.obb) continue;
            const e = (jeSame.get(sl.seed >>> 0) || []).find((x) => Math.hypot(x.position.x - q.ox - sl.x, x.position.z - q.oz - sl.z) < 1);
            if (e) aus.push({ sl, e, q });
        }
        return aus;
    };
    const je = alle.map((q) => ({ q, H: stehend(q) })).filter((x) => x.H.length > 0);
    if (!je.length) return { fehler: "keine Siedlung mit stehenden Häusern (" + alle.length + " Pläne)" };
    const nah = je.filter((x) => dS(x.q) < (o.nahM || 600));
    let O = (nah.length ? nah : je)[0];
    for (const x of nah.length ? nah : je) if (nah.length ? x.H.length > O.H.length : dS(x.q) < dS(O.q)) O = x;
    const S = O.q;
    const Hs = O.H;
    const plan = S.plan;
    // DIE FORM-ZWILLINGE: Häuser derselben Gestalt (Rolle, Stil, Geschosse, Breite und Tiefe auf 0,5 m, Dachneigung auf 5°, Dach,
    // Grundriss) — gezählt wird jedes Haus, dessen Gestalt ein zweites trägt
    const sig = (sl) => {
        const v = sl.ov || {};
        const g = (x, s) => (typeof x === "number" && isFinite(x) ? Math.round(x / s) * s : x == null ? "" : String(x));
        return [sl.rolle, v.stil, v.storeys, g(v.W, 0.5), g(v.D, 0.5), g(v.pitchDeg, 5), v.dachTyp, v.grundriss].join("|");
    };
    const zwillinge = (L) => {
        const z = new Map();
        for (const h of L) z.set(sig(h.sl), (z.get(sig(h.sl)) || 0) + 1);
        let n = 0;
        for (const v of z.values()) if (v > 1) n += v;
        return n;
    };
    // die Strecke (ex, ez) → (px, pz) kreuzt den Grundriss b (plan-lokal) — stadt-proben.cjs `kreuzt`
    const kreuzt = (b, ex, ez, px, pz) => {
        const c = Math.cos(b.phi);
        const s = Math.sin(b.phi);
        const lok = (x, z) => [(x - b.cx) * c - (z - b.cz) * s, (x - b.cx) * s + (z - b.cz) * c];
        const a = lok(ex, ez);
        const e = lok(px, pz);
        let t0 = 0;
        let t1 = 1;
        for (const [k, h] of [
            [0, b.ex],
            [1, b.ez],
        ]) {
            const d = e[k] - a[k];
            if (Math.abs(d) < 1e-9) {
                if (Math.abs(a[k]) > h) return false;
                continue;
            }
            const u = (-h - a[k]) / d;
            const w = (h - a[k]) / d;
            t0 = Math.max(t0, Math.min(u, w));
            t1 = Math.min(t1, Math.max(u, w));
        }
        return t0 < t1;
    };
    // der nächste Punkt des Grundrisses b zum Auge, 0,3 m vor seiner Wand — stadt-proben.cjs `wandPunkt`
    const wandPunkt = (b, ex, ez) => {
        const c = Math.cos(b.phi);
        const s = Math.sin(b.phi);
        const lx = (ex - b.cx) * c - (ez - b.cz) * s;
        const lz = (ex - b.cx) * s + (ez - b.cz) * c;
        const qx = Math.max(-b.ex, Math.min(b.ex, lx));
        const qz = Math.max(-b.ez, Math.min(b.ez, lz));
        const wx = b.cx + qx * c + qz * s;
        const wz = b.cz - qx * s + qz * c;
        const d = Math.hypot(wx - ex, wz - ez) || 1;
        return [wx + ((ex - wx) / d) * 0.3, wz + ((ez - wz) / d) * 0.3, d];
    };
    // DIE HÄUSER IM BILD einer Pose (1280 × 720 wie K.bild): ihr nächster Wand-Punkt 2 m über ihrem Boden liegt im Rahmen, näher als
    // sichtM, und kein anderer stehender Grundriss steht auf der Sichtlinie (2D — von oben eine Untergrenze)
    const imBlick = (P, sichtM) => {
        const cam = st.camera.clone();
        cam.aspect = 1280 / 720;
        cam.position.set(P.px, P.py, P.pz);
        cam.lookAt(P.lx, P.ly, P.lz + 1e-4);
        cam.updateProjectionMatrix();
        cam.updateMatrixWorld(true);
        const v = new T.Vector3();
        const ex = P.px - S.ox;
        const ez = P.pz - S.oz;
        const nahe = Hs.filter((h) => Math.hypot(h.sl.obb.cx - ex, h.sl.obb.cz - ez) < sichtM + 30);
        const seen = [];
        for (const h of nahe) {
            const [wx, wz, d] = wandPunkt(h.sl.obb, ex, ez);
            if (d > sichtM) continue;
            const y = (typeof h.sl.y === "number" ? h.sl.y : h.e.position.y) + 2;
            v.set(S.ox + wx, y, S.oz + wz).project(cam);
            if (!(Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z < 1)) continue;
            if (nahe.some((g) => g !== h && kreuzt(g.sl.obb, ex, ez, wx, wz))) continue;
            seen.push(h);
        }
        return seen;
    };
    const lang = (p) => {
        let L = 0;
        for (let k = 1; k < p.length; k++) L += Math.hypot(p[k].x - p[k - 1].x, p[k].z - p[k - 1].z);
        return L;
    };
    const roads = (plan.roads || []).filter((rd) => rd && Array.isArray(rd.pts) && rd.pts.length >= 2);
    const aus = {
        ort: { key: S.key, name: plan.name, region: plan.region, jahr: plan.jahr, groesse: plan.groesse, kernel: plan.kernel, seed: plan.seed >>> 0, ox: r2(S.ox), oz: r2(S.oz), d: r2(dS(S)) },
        slots: plan.slots.length,
        steht: Hs.length,
        mitTuer: Hs.filter((h) => h.sl.tuer).length,
        strassen: roads.length,
        netzKm: r2(roads.reduce((a, rd) => a + lang(rd.pts), 0) / 1000),
        viertel: new Set(Hs.map((h) => h.sl.viertel || "ohne")).size,
        kulturen: [...new Set(Hs.map((h) => h.sl.kultur || "ohne"))],
        zwillinge: zwillinge(Hs),
    };
    // die Fläche: das Rechteck der stehenden Häuser (Mitte ± größte halbe Seite), km²
    {
        let [x0, x1, z0, z1] = [Infinity, -Infinity, Infinity, -Infinity];
        for (const h of Hs) {
            const e = Math.max(h.sl.obb.ex, h.sl.obb.ez);
            x0 = Math.min(x0, h.sl.obb.cx - e);
            x1 = Math.max(x1, h.sl.obb.cx + e);
            z0 = Math.min(z0, h.sl.obb.cz - e);
            z1 = Math.max(z1, h.sl.obb.cz + e);
        }
        aus.flaecheKm2 = Math.round(((x1 - x0) * (z1 - z0)) / 1e3) / 1e3;
    }
    // DIE SITZUNG: alle Orte mit stehenden Häusern — Saaten, Regionen, Kerne, Kultur × Jahrhundert, das jüngste Jahr, die Bewohner
    aus.siedlungen = je.length;
    aus.stehtAlle = je.reduce((a, x) => a + x.H.length, 0);
    aus.saaten = new Set(je.map((x) => x.q.plan.seed >>> 0)).size;
    aus.regionen = [...new Set(je.map((x) => x.q.plan.region || "ohne"))];
    aus.kerne = [...new Set(je.map((x) => x.q.plan.kernel || "ohne"))];
    aus.kulturEpoche = new Set(je.map((x) => (x.q.plan.region || "ohne") + ":" + Math.floor((x.q.plan.jahr || 0) / 100))).size;
    aus.jahrMax = Math.max(...je.map((x) => (typeof x.q.plan.jahr === "number" ? x.q.plan.jahr : -Infinity)));
    aus.bewohnerAlle = je.reduce((a, x) => a + (Array.isArray(x.q.liste) ? x.q.liste.length : 0), 0);
    aus.sichtKm = r2(Math.max(...je.flatMap((x) => x.H.map((h) => Math.hypot(h.e.position.x - pm.x, h.e.position.z - pm.z)))) / 1000);
    aus.fremde = je.filter((x) => (x.q.liste || []).some((b) => b && b.genom && b.genom.headRatio == null)).length;
    aus.welten = [st.worldMeta && st.worldMeta.seed].filter((x) => x != null).length;
    aus.schwere = typeof st.gravity === "number" ? r2(st.gravity) : null;
    // die Orte fern der Oberfläche: der Boden ihrer Häuser im Mittel mehr als 50 m vom Grund (Habitat, Schale, Station)
    aus.habitate = je.filter((x) => x.H.reduce((a, h) => a + Math.abs(h.e.position.y - terr(h.e.position.x, h.e.position.z)), 0) / x.H.length > 50).length;
    // DIE BEWOHNER des Orts: Leib über dem Grund und dem gezeichneten Wasser, je Hektar, die Dekaden ihrer Höhe über Grund
    {
        const L = (Array.isArray(S.liste) ? S.liste : []).filter((b) => b && b.leib && b.leib.position);
        const ha = new Map();
        const dek = new Set();
        let [unterGrund, unterWasser, fern] = [0, 0, 0];
        for (const b of L) {
            const p = b.leib.position;
            const g = terr(p.x, p.z);
            const h = p.y - g;
            if (h < -2) unterGrund++;
            if (Math.abs(h) > 50) fern++;
            const w = typeof r._wasserBildAt === "function" ? r._wasserBildAt(p.x, p.z) : null;
            if (typeof w === "number" && isFinite(w) && p.y < w - 1) unterWasser++;
            const k = Math.floor(p.x / 100) + "," + Math.floor(p.z / 100);
            ha.set(k, (ha.get(k) || 0) + 1);
            dek.add(Math.abs(h) < 1 ? 0 : Math.floor(Math.log10(Math.abs(h))) + 1);
        }
        const g0 = typeof st.gravity === "number" ? Math.abs(st.gravity) : NaN;
        aus.bewohner = {
            n: Array.isArray(S.liste) ? S.liste.length : 0,
            mitLeib: L.length,
            unterGrund,
            unterWasser,
            fern,
            proHaMax: Math.max(0, ...ha.values()),
            dekaden: dek.size,
            niedrigSchwer: isFinite(g0) && g0 > 0.1 && g0 <= 9.81 / 3 + 0.2 ? aus.bewohnerAlle : 0,
            schwerelos: isFinite(g0) && g0 <= 0.1 ? aus.bewohnerAlle : 0,
        };
    }
    // die Pose der Kamera des Spiels (der Messort stellt sie: ortPose), der Blick 30 m voraus
    const camPose = () => {
        const c = st.camera;
        c.updateMatrixWorld(true);
        const dir = new T.Vector3();
        c.getWorldDirection(dir);
        const p = c.position;
        return { px: r2(p.x), py: r2(p.y), pz: r2(p.z), lx: r2(p.x + dir.x * 30), ly: r2(p.y + dir.y * 30), lz: r2(p.z + dir.z * 30) };
    };
    if (o.blick) {
        const P = camPose();
        const L = imBlick(P, o.sichtM || 300);
        aus.blick = { pose: P, n: L.length, zwillinge: zwillinge(L) };
    }
    // DER ORTSRAND: 8 Richtungen um die Mitte der Häuser, 20 m vor dem äußersten Haus, 8 m über Grund, Blick auf die Mitte (3 m) —
    // die Richtung mit den meisten Häusern im Bild
    if (o.rand) {
        const cx = Hs.reduce((a, h) => a + S.ox + h.sl.obb.cx, 0) / Hs.length;
        const cz = Hs.reduce((a, h) => a + S.oz + h.sl.obb.cz, 0) / Hs.length;
        const R = Math.max(...Hs.map((h) => Math.hypot(S.ox + h.sl.obb.cx - cx, S.oz + h.sl.obb.cz - cz) + Math.hypot(h.sl.obb.ex, h.sl.obb.ez)));
        let best = null;
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4;
            const px = cx + Math.cos(a) * (R + 20);
            const pz = cz + Math.sin(a) * (R + 20);
            const P = { px: r2(px), py: r2(boden(px, pz) + 8), pz: r2(pz), lx: r2(cx), ly: r2(boden(cx, cz) + 3), lz: r2(cz) };
            const L = imBlick(P, 2 * R + 60);
            if (!best || L.length > best.L.length) best = { P, L, grad: i * 45 };
        }
        aus.rand = { pose: best.P, richtungGrad: best.grad, n: best.L.length, zwillinge: zwillinge(best.L), R: r2(R) };
    }
    // DIE STRASSE nächst dem Spieler: ihre ersten strasseM m (vorwärts, sonst rückwärts; trägt sie die Länge nicht, die längste Straße
    // ab ihrem Anfang); das Auge 1,7 m über dem Grund am Anfang, der Blick längs der Straße. Gezählt längs des Stücks: Häuser mit Front
    // an der Straße (Grundriss ≤ 12 m von der Achse), davon Gewerbe (Rolle ≠ wohnhaus), Menschen (Leib draußen ≤ 10 m), Wagen (≤ 10 m)
    if (o.strasse && roads.length) {
        const M = o.strasseM || 100;
        let best = null;
        for (const rd of roads)
            rd.pts.forEach((q, k) => {
                const d = Math.hypot(S.ox + q.x - pm.x, S.oz + q.z - pm.z);
                if (!best || d < best.d) best = { rd, k, d };
            });
        let rd = best.rd;
        let k0 = best.k;
        if (lang(rd.pts) < M) {
            rd = roads.reduce((a, x) => (lang(x.pts) > lang(a.pts) ? x : a));
            k0 = 0;
        }
        const zug = lang(rd.pts.slice(k0)) >= Math.min(M, lang(rd.pts)) ? rd.pts.slice(k0) : rd.pts.slice(0, k0 + 1).reverse();
        const weg = [zug[0]];
        let L = 0;
        for (let k = 1; k < zug.length && L < M; k++) {
            L += Math.hypot(zug[k].x - zug[k - 1].x, zug[k].z - zug[k - 1].z);
            weg.push(zug[k]);
        }
        const dWeg = (x, z) => {
            let m = Infinity;
            for (let k = 1; k < weg.length; k++) {
                const a = weg[k - 1];
                const b = weg[k];
                const dx = b.x - a.x;
                const dz = b.z - a.z;
                const l2 = dx * dx + dz * dz || 1;
                const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2));
                m = Math.min(m, Math.hypot(x - a.x - dx * t, z - a.z - dz * t));
            }
            return m;
        };
        const front = Hs.filter((h) => dWeg(h.sl.obb.cx, h.sl.obb.cz) - Math.max(h.sl.obb.ex, h.sl.obb.ez) <= 12);
        const menschen = (Array.isArray(S.liste) ? S.liste : []).filter((b) => b && b.leib && b.leib.position && !b.drinnen && dWeg(b.leib.position.x - S.ox, b.leib.position.z - S.oz) <= 10).length;
        const wagen = ((S.verkehr && S.verkehr.wagen) || []).filter((W) => W && W.entry && W.entry.position && dWeg(W.entry.position.x - S.ox, W.entry.position.z - S.oz) <= 10).length;
        const a = weg[0];
        const z = weg[Math.min(weg.length - 1, Math.max(1, Math.round(weg.length * 0.4)))];
        const ya = boden(S.ox + a.x, S.oz + a.z) + 1.7;
        aus.strasse = {
            pose: { px: r2(S.ox + a.x), py: r2(ya), pz: r2(S.oz + a.z), lx: r2(S.ox + z.x), ly: r2(ya), lz: r2(S.oz + z.z) },
            laengeM: r2(L),
            klasse: ["ortsdurchfahrt", "wohnstrasse", "gasse"][Math.max(0, Math.min(2, rd.gen | 0))],
            fassaden: front.length,
            gewerbe: front.filter((h) => h.sl.rolle && h.sl.rolle !== "wohnhaus").length,
            menschen,
            wagen,
            dSpieler: r2(Math.hypot(S.ox + a.x - pm.x, S.oz + a.z - pm.z)),
        };
    }
    // DER BLOCK am Haus nächst dem Spieler: die stehenden Häuser binnen 35 m um seine Mitte, die mit Tür (der Eingang in einen Raum);
    // die Pose vom Straßenpunkt nächst dem Haus, Auge 1,7 m, Blick auf seine Mitte 3 m über seinem Boden
    if (o.block && roads.length) {
        let h0 = Hs[0];
        for (const h of Hs) if (Math.hypot(S.ox + h.sl.obb.cx - pm.x, S.oz + h.sl.obb.cz - pm.z) < Math.hypot(S.ox + h0.sl.obb.cx - pm.x, S.oz + h0.sl.obb.cz - pm.z)) h0 = h;
        const blk = Hs.filter((h) => Math.hypot(h.sl.obb.cx - h0.sl.obb.cx, h.sl.obb.cz - h0.sl.obb.cz) <= 35);
        let q0 = null;
        for (const rd of roads)
            for (const q of rd.pts) {
                const d = Math.hypot(q.x - h0.sl.obb.cx, q.z - h0.sl.obb.cz);
                if (!q0 || d < q0.d) q0 = { q, d };
            }
        const yb = typeof h0.sl.y === "number" ? h0.sl.y : h0.e.position.y;
        const ya = boden(S.ox + q0.q.x, S.oz + q0.q.z) + 1.7;
        aus.block = {
            pose: { px: r2(S.ox + q0.q.x), py: r2(ya), pz: r2(S.oz + q0.q.z), lx: r2(S.ox + h0.sl.obb.cx), ly: r2(yb + 3), lz: r2(S.oz + h0.sl.obb.cz) },
            haeuser: blk.length,
            mitTuer: blk.filter((h) => h.sl.tuer).length,
            dSpieler: r2(Math.hypot(S.ox + q0.q.x - pm.x, S.oz + q0.q.z - pm.z)),
        };
    }
    // DAS HÖCHSTE GEBÄUDE binnen 1500 m: die Oberkante seiner festen Hülle (Blocker-Kisten ohne Pflanze und ohne stempelfreie Teile)
    // über dem Grund an seinem Fuß; daneben die Geschosse seines Slots
    if (o.hoch) {
        let best = null;
        let gMax = 0;
        for (const x of je.filter((y) => dS(y.q) < 1500))
            for (const h of x.H) {
                let top = -Infinity;
                for (const a of h.e.blockerAABBs || []) if (a && !a.pflanze && !a.stempelfrei && isFinite(a.topY)) top = Math.max(top, a.topY);
                const g = h.sl.ov && typeof h.sl.ov.storeys === "number" ? h.sl.ov.storeys : 0;
                gMax = Math.max(gMax, g);
                if (!isFinite(top)) continue;
                const m = top - terr(h.e.position.x, h.e.position.z);
                if (!best || m > best.m) best = { m, g, x: h.e.position.x, z: h.e.position.z, rolle: h.sl.rolle };
            }
        aus.hoch = best ? { m: r2(best.m), geschosse: best.g, geschosseMax: gMax, x: r2(best.x), z: r2(best.z), rolle: best.rolle } : { m: null, geschosseMax: gMax };
    }
    // DIE EBENEN (vertikal S1): zwei Straßen-Stücke eines Plans, die sich ohne gemeinsamen Knoten (1 m) kreuzen, sind eine Überführung —
    // ohne sie trägt die Stadt EINE begehbare Ebene; über die Pläne binnen 1500 m
    if (o.ueber) {
        let ueber = 0;
        for (const x of je.filter((y) => dS(y.q) < 1500)) {
            const seg = [];
            for (const rd of x.q.plan.roads || []) {
                const p = (rd && rd.pts) || [];
                for (let k = 0; k + 1 < p.length; k++) seg.push([p[k].x, p[k].z, p[k + 1].x, p[k + 1].z]);
            }
            const nahEnde = (px, pz, sg) => Math.hypot(px - sg[0], pz - sg[1]) < 1 || Math.hypot(px - sg[2], pz - sg[3]) < 1;
            for (let a = 0; a < seg.length; a++)
                for (let b = a + 1; b < seg.length; b++) {
                    const A = seg[a];
                    const C = seg[b];
                    const dx1 = A[2] - A[0];
                    const dz1 = A[3] - A[1];
                    const dx2 = C[2] - C[0];
                    const dz2 = C[3] - C[1];
                    const den = dx1 * dz2 - dz1 * dx2;
                    if (Math.abs(den) < 1e-9) continue;
                    const ta = ((C[0] - A[0]) * dz2 - (C[1] - A[1]) * dx2) / den;
                    const tb = ((C[0] - A[0]) * dz1 - (C[1] - A[1]) * dx1) / den;
                    if (ta <= 0 || ta >= 1 || tb <= 0 || tb >= 1) continue;
                    const px = A[0] + dx1 * ta;
                    const pz = A[1] + dz1 * ta;
                    if (!nahEnde(px, pz, A) && !nahEnde(px, pz, C)) ueber++;
                }
        }
        aus.ueber = ueber;
        aus.ebenen = ueber > 0 ? 2 : 1;
    }
    return aus;
}
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            await K.messort("stadt-voll");
            let W;
            try {
                W = await K.welt("return await (" + H.seite.STADT + ")(r, T, " + JSON.stringify({ strasse: true, strasseM: 40 }) + ");");
            } catch (e) {
                W = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!W || W.fehler) throw new Error("die Stadt am Messort: " + ((W && W.fehler) || "ohne Antwort"));
                return W;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: " + (W && !W.fehler ? W.steht + " Häuser, " + W.saaten + " Saaten, " + W.strassen + " Straßen" : (W && W.fehler) || "ohne Antwort"));
            await K.schritt(2, async () => nicht(2, da().steht, 1e4, "Großstadt 10⁴ Häuser mit Vierteln aus dem Bodenwert: die Stadt trägt " + W.steht + " stehende Häuser in " + W.viertel + " Vierteln; dorf 7 9310 steht erst nach ~154 s, über dem Deckel von 60 s"));
            await K.schritt(4, async () => nicht(4, da().saaten, 100, "100 Saaten mit Plan in einer Sitzung (die Welt trägt " + W.saaten + ") und das Band 100 realer Städte (OSM) — kein Baum trägt es"));
            await K.schritt(5, async () => nicht(5, da().saaten, 100, "10² Saaten je Größenklasse als Draufsicht: die Sitzung trägt " + W.saaten + " Saaten"));
            await K.schritt(7, async () => nicht(7, da().saaten, 100, "10² Saaten, aus deren Bild Kenner Alter, Wohlstand, Klima, Gelände lesen: die Sitzung trägt " + W.saaten + " Saaten"));
            await K.schritt(6, async () => {
                const S = da().strasse;
                if (!S) throw new Error("die Stadt trägt keine Straße mit zwei Punkten");
                const b = await K.bild(6, S.pose, { wahl: 0, uhr: 0.5 });
                K.auge(6, {
                    bild: b.datei,
                    pose: "stadt-voll, Straße nächst dem Spieler (" + S.klasse + ", " + S.dSpieler + " m vom Spieler): Auge 1,7 m, Blick längs der Straße " + JSON.stringify(S.pose) + ", Mittag",
                    mass: "Straßen der Stadt " + W.strassen + " (das Bild zeigt eine) · an den ersten " + S.laengeM + " m: Fassaden " + S.fassaden + ", Gewerbe " + S.gewerbe + ", Menschen " + S.menschen + ", Wagen " + S.wagen + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
                });
            });
        })(H, K);
    return K.ende();
});