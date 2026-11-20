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
    // DER STAND NACH JEDER SPROSSE (punkte.cjs keinUrteil (e)): die Ausgabe trägt jedes Ergebnis ganz, ehe die nächste Sprosse misst —
    // reißt danach die Frist oder tötet die Leine die Probe, urteilt die Sprosse aus ihr (daneben geschrieben, dann umbenannt)
    const setze = (n, e) => {
        j.sprossen[n] = e;
        try {
            H.fs.writeFileSync(H.AUS + ".stand", JSON.stringify(j));
            H.fs.renameSync(H.AUS + ".stand", H.AUS);
        } catch (x) {
            H.zeile("Stand: " + String((x && x.message) || x).split("\n")[0]);
        }
        return e;
    };
    K.zahl = (n, o) => setze(n, { art: "zahl", n: o.n, werte: o.werte || {}, ...(o.beleg ? { beleg: kurz(o.beleg) } : {}), ...(o.taeter ? { taeter: kurz(o.taeter) } : {}) });
    K.nicht = (n, o) => setze(n, { art: "nicht", n: o.n, fehlt: kurz(o.fehlt) });
    K.leser = (n, o) => setze(n, { art: "leser", fehlt: kurz(o.fehlt), wo: kurz(o.wo), ...(o.n != null ? { n: o.n } : {}) });
    K.auge = (n, o) => setze(n, { art: "auge", bild: o.bild, pose: kurz(o.pose), vorbild: kurz(o.vorbild || (SPEC.sprossen[n] && SPEC.sprossen[n].auge && SPEC.sprossen[n].auge.vorbild)), ...(o.mass ? { mass: kurz(o.mass) } : {}) });
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
SPEC: {"leiter":"mensch.kultur.gestalt","sprossen":{"1":{"auge":{"pose":"stadt-voll · der Platz am Markt (Messort-Pose ortPose „platz“), Ego, die Kamera des Spiels nach dem Umstellen","vorbild":"Straßenfotos realer Häuser von 10 Kulturen, Blindpaar ≥ 12 Prüfer: getrennt ≥ 80 %"}},"2":{"auge":{"pose":"stadt-voll · der Platz am Markt (Messort-Pose ortPose „platz“), Ego, die Kamera des Spiels nach dem Umstellen","vorbild":"die Saat-Probe: Häuserbilder zweier Saaten gegen Fotos realer Orte, getrennt ≥ 80 %, plausibel ≥ 90 %"}},"3":{"auge":{"pose":"stadt-voll · der Platz am Markt (Messort-Pose ortPose „platz“), Ego, die Kamera des Spiels nach dem Umstellen","vorbild":"Foto des realen Gegenstücks je Kultur (Merkmalsabstand im Foto-Band)"}},"4":{"auge":{"pose":"stadt-voll · der Platz am Markt (Messort-Pose ortPose „platz“), Ego, die Kamera des Spiels nach dem Umstellen","vorbild":"Fotos realer Festtrachten (≥ 60 %) und Tonaufnahmen der Musik je Kultur (zugeordnet ≥ 70 %)"}},"5":{"auge":{"pose":"stadt-voll · der Platz am Markt (Messort-Pose ortPose „platz“), Ego, die Kamera des Spiels nach dem Umstellen","vorbild":"100 Paare (Ort, Jahr) gegen datierte Fotos realer Orte: plausibel ≥ 85 %, Foto-Verwechslung ≥ 40 %"}},"6":{"auge":{"pose":"stadt-voll · der Platz am Markt (Messort-Pose ortPose „platz“), Ego, die Kamera des Spiels nach dem Umstellen","vorbild":"Bauten fremder Arten gegen Leib und Schwerkraft ihrer Welt (Prüfer, R10): passen ≥ 90 %"}},"7":{"auge":{"pose":"stadt-voll · der Platz am Markt (Messort-Pose ortPose „platz“), Ego, die Kamera des Spiels nach dem Umstellen","vorbild":"1 000 irdische Fotos (Stichprobe der Wirklichkeit): Foto-Verwechslung ≥ 50 %, Wiederholung einer Gestalt ≤ 1 %"}}}},
ZENSUS: async function zensus(r, T, arg) {
    const st = r.state;
    const FC = globalThis.__fachwerkCore;
    const cam = st.camera;
    const p = st.playerMesh ? st.playerMesh.position : cam.position;
    const alle = [...(r._bewohnerSiedlungen || new Map()).values()].filter((Q) => Q && Q.plan && Array.isArray(Q.plan.slots));
    const ab = (Q) => Math.hypot(Q.ox - p.x, Q.oz - p.z);
    alle.sort((a, b) => ab(a) - ab(b));
    if (!alle.length || ab(alle[0]) > 700) return { fehler: "keine Siedlung binnen 700 m des Spielers (" + alle.length + " geladen)" };
    const S = alle[0];
    // WAS STEHT (scripts/lib/stadt-proben.cjs stadtBreite): der Bau der Welt mit dem Samen des Slots an seinem Ort
    const jeSame = new Map();
    for (const e of st.architectures || [])
        if (e && e.position) {
            const k = e.seed >>> 0;
            if (!jeSame.has(k)) jeSame.set(k, []);
            jeSame.get(k).push(e);
        }
    const stehtIn = (Q) => Q.plan.slots.filter((sl) => (jeSame.get(sl.seed >>> 0) || []).some((e) => Math.hypot(e.position.x - Q.ox - sl.x, e.position.z - Q.oz - sl.z) < 1));
    const zaehle = (xs) => {
        const m = {};
        for (const x of xs) m[x] = (m[x] || 0) + 1;
        return m;
    };
    const rolle = (sl) => (typeof sl.rolle === "string" ? sl.rolle : "wohnhaus");
    const KULT = /^(kirche|kapelle|tempel|schrein|moschee|synagoge|kloster|dom)$/;
    const WOHN = /^(wohnhaus|scheune|wohnturm|patrizierhaus|turm)$/;
    const stehen = new Map(alle.map((Q) => [Q, stehtIn(Q)]));
    const orte = alle.map((Q) => {
        const sl = stehen.get(Q);
        const L = Q.liste || [];
        return {
            name: Q.plan.name || null,
            region: Q.plan.region || null,
            seed: Q.plan.seed >>> 0,
            jahr: Q.plan.jahr,
            groesse: Q.plan.groesse || null,
            staedtisch: !!Q.plan.staedtisch,
            ab: Math.round(ab(Q)),
            slots: Q.plan.slots.length,
            steht: sl.length,
            kulturen: zaehle(sl.map((x) => x.kultur || "?")),
            kultKulturen: [...new Set(sl.filter((x) => KULT.test(rolle(x))).map((x) => x.kultur || "?"))],
            bewohner: L.length,
            personenNamen: L.filter((b) => typeof b.name === "string" && b.name).map((b) => b.name).slice(0, 600),
            technik: Number.isFinite(Q.plan.technik) ? Q.plan.technik : null,
            sprache: Q.plan.sprache != null || Q.plan.verkehrssprache != null,
            kleidung: Q.plan.kleidung ? [Q.plan.kleidung.top, Q.plan.kleidung.bottom, Q.plan.kleidung.shoes].join("/") : null,
            glaube: Q.plan.glaube != null || Q.plan.goetter != null,
            wanderung: Q.plan.wanderung != null,
            sitten: Q.plan.sitten != null,
            kueche: Q.plan.kueche != null || Q.plan.gerichte != null,
            mode: Q.plan.mode != null,
        };
    });
    const steht = stehen.get(S);
    const L = S.liste || [];
    const leiber = L.filter((b) => b.leib).map((b) => b.leib.position);
    const nahS = (x, z, m) => Math.hypot(x - S.ox, z - S.oz) < m;
    // die Stücke des Plans (Kirchhof, Markt, Brunnen) und die Werke der Bildkunst unter den Bauten der Welt
    const stuecke = { grab: 0, stand: 0, brunnen: 0 };
    const graeber = [];
    let kunst = 0;
    const KUNST = /figur|statue|skulptur|wandbild|gemaelde|relief|ornament|denkmal|mosaik|fresko/i;
    for (const e of st.architectures || []) {
        if (!e || !e.position || !nahS(e.position.x, e.position.z, 700)) continue;
        const t = String(e.type || "");
        if (/^grabstein/.test(t)) (stuecke.grab++, graeber.push(e.position));
        else if (/^marktstand/.test(t)) stuecke.stand++;
        else if (/^brunnen/.test(t)) stuecke.brunnen++;
        if (KUNST.test(t)) kunst++;
    }
    // JEDER TEXT-TRÄGER DER SZENE: eine Leinwand-Textur mit Schrift im Namen oder ein Text am Objekt — das Namensschild der
    // Mitspieler (netz-p2p) ist kein Text der Welt
    const TXT = /schild|schrift|text|inschrift|tafel|buch|plakat|zeitung/i;
    const v = new T.Vector3();
    const texte = [];
    let videos = 0; // das bewegte Bild im Bild (eine Video-Textur an einem Objekt der Stadt)
    st.scene.traverse((o) => {
        if (!o.isMesh && !o.isSprite) return;
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        if (ms.some((m) => m && m.map && m.map.isVideoTexture)) videos++;
        if (ms.some((m) => m && m.map && m.map.name === "p2p-namensschild")) return;
        const ud = o.userData || {};
        const tx = ms.map((m) => m && m.map).find((t) => t && t.isCanvasTexture && TXT.test(t.name || ""));
        const wort = typeof ud.text === "string" ? ud.text : typeof ud.schrift === "string" ? ud.schrift : tx ? String((tx.userData && tx.userData.text) || tx.name) : null;
        if (!wort) return;
        o.getWorldPosition(v);
        if (!nahS(v.x, v.z, 700)) return;
        const leuchtet = ms.some((m) => m && m.emissive && m.emissiveIntensity > 0 && m.emissive.r + m.emissive.g + m.emissive.b > 0);
        texte.push({ wort: wort.slice(0, 80), x: v.x, z: v.z, leuchtet, sichtbar: !!o.visible });
    });
    const imGrund = (sl, x, z, m) => {
        const b = sl.obb;
        if (!b) return Math.hypot(x - S.ox - sl.x, z - S.oz - sl.z) < 4 + m;
        const c = Math.cos(b.phi), s = Math.sin(b.phi);
        const dx = x - S.ox - b.cx, dz = z - S.oz - b.cz;
        return Math.abs(dx * c - dz * s) <= b.ex + m && Math.abs(dx * s + dz * c) <= b.ez + m;
    };
    const sonder = steht.filter((sl) => !WOHN.test(rolle(sl)));
    const schildAn = (sl) => texte.filter((t) => imGrund(sl, t.x, t.z, 2));
    const T0 = {
        n: texte.length,
        leuchtet: texte.filter((t) => t.leuchtet).length,
        nahBewohner: texte.filter((t) => leiber.some((q) => Math.hypot(q.x - t.x, q.z - t.z) < 3)).length,
        grab: texte.filter((t) => graeber.some((q) => Math.hypot(q.x - t.x, q.z - t.z) < 1.5)).length,
        haus: texte.filter((t) => steht.some((sl) => imGrund(sl, t.x, t.z, 1))).length,
        woerter: new Set(texte.flatMap((t) => t.wort.toLowerCase().split(/[^a-zäöüß]+/).filter((w) => w.length > 1))).size,
        beispiele: texte.slice(0, 4).map((t) => t.wort),
    };
    const rollen = zaehle(steht.map(rolle));
    const zahlRolle = (re) => Object.keys(rollen).filter((k) => re.test(k)).reduce((a, k) => a + rollen[k], 0);
    const jahre = steht.map((sl) => sl.baujahr).filter((j) => Number.isFinite(j));
    // DIE GRENZE ZWEIER KULTUREN (diffusion): das nächste Paar geladener Orte verschiedener Region binnen 2 km; ein Haus ist gemischt,
    // trägt es eine Kultur außerhalb des Vorrats seiner Region (fachwerk-core REGION_HIST) — der Streifen ist das Drittel jedes Orts
    // zum anderen hin, abseits das ferne Drittel
    let grenze = null;
    if (arg && arg.grenze) {
        const pool = (reg) => new Set(((FC && FC.REGION_HIST && FC.REGION_HIST[reg]) || []).flatMap((e) => e[1]));
        let paar = null, dMin = 2000;
        for (let i = 0; i < alle.length; i++)
            for (let k = i + 1; k < alle.length; k++) {
                const [A, B] = [alle[i], alle[k]];
                const d = Math.hypot(A.ox - B.ox, A.oz - B.oz);
                if (A.plan.region !== B.plan.region && d < dMin) [dMin, paar] = [d, [A, B]];
            }
        const regionen = new Set(alle.filter((Q) => Math.hypot(Q.ox - S.ox, Q.oz - S.oz) < 2000).map((Q) => Q.plan.region)).size;
        grenze = { paar: 0, regionen };
        if (paar) {
            const teil = (A, B) => {
                const ux = (B.ox - A.ox) / dMin, uz = (B.oz - A.oz) / dMin;
                const P = pool(A.plan.region);
                const hs = stehen.get(A).map((sl) => ({ t: sl.x * ux + sl.z * uz, fremd: !P.has(sl.kultur) })).sort((a, b) => b.t - a.t);
                const k = Math.max(1, Math.floor(hs.length / 3));
                return { nah: hs.slice(0, k), fern: hs.slice(-k) };
            };
            const [a, b] = [teil(paar[0], paar[1]), teil(paar[1], paar[0])];
            const anteil = (xs) => (xs.length ? xs.filter((h) => h.fremd).length / xs.length : NaN);
            grenze = { paar: 1, regionen: 2, d: Math.round(dMin), orte: [paar[0].plan.name, paar[1].plan.name], grenze: anteil([...a.nah, ...b.nah]), abseits: anteil([...a.fern, ...b.fern]) };
        }
    }
    const d = new T.Vector3();
    cam.getWorldDirection(d);
    const r2 = (x) => Math.round(x * 100) / 100;
    const kulturenAlle = new Set(orte.flatMap((o) => Object.keys(o.kulturen)));
    return {
        ort: {
            name: S.plan.name || null,
            region: S.plan.region || null,
            seed: S.plan.seed >>> 0,
            jahr: S.plan.jahr,
            groesse: S.plan.groesse || null,
            slots: S.plan.slots.length,
            steht: steht.length,
            kulturen: zaehle(steht.map((sl) => sl.kultur || "?")),
            rollen,
            kult: steht.filter((sl) => KULT.test(rolle(sl))).length,
            kultKulturen: [...new Set(steht.filter((sl) => KULT.test(rolle(sl))).map((sl) => sl.kultur || "?"))],
            sonder: sonder.length,
            sonderMitSchild: sonder.filter((sl) => schildAn(sl).length > 0).length,
            sonderPassend: sonder.filter((sl) => schildAn(sl).some((t) => t.wort.toLowerCase().includes(rolle(sl)))).length,
            jahre: jahre.length ? { von: Math.min(...jahre), bis: Math.max(...jahre) } : null,
            chronik: !!S.plan.chronik,
        },
        orte,
        regionen: new Set(orte.map((o) => o.region)).size,
        kulturenAlle: kulturenAlle.size,
        kulturenGesetz: FC && Array.isArray(FC.KULTNAMES) ? FC.KULTNAMES.length : null,
        haeuserAlle: orte.reduce((a, o) => a + o.steht, 0),
        staedte: orte.filter((o) => o.staedtisch).length,
        trachten: new Set(orte.map((o) => o.kleidung).filter(Boolean)).size,
        bewohner: {
            n: L.length,
            leib: leiber.length,
            namen: L.filter((b) => typeof b.name === "string" && b.name).length,
            gruss: L.filter((b) => b.gruss != null).length,
            nah: leiber.filter((q) => Math.hypot(q.x - p.x, q.z - p.z) < 30).length,
            berufe: Object.keys(zaehle(L.map((b) => b.beruf))).length,
            alle: orte.reduce((a, o) => a + o.bewohner, 0),
        },
        stuecke,
        texte: T0,
        videos,
        kunst,
        buehnen: zahlRolle(/buehne|theater|kino|oper|verlag|lichtspiel/),
        wissenArten: [/schule|akademie|universitaet/, /bibliothek|archiv/, /werkstatt/].filter((re) => zahlRolle(re) > 0).length,
        lokale: zahlRolle(/gasthaus|wirtshaus|taverne|schenke|cafe|bar/),
        laeden: stuecke.stand + zahlRolle(/kaufhaus|kontor|laden|krambude/),
        kreaturen: {
            n: (st.creatures || []).length,
            sprache: (st.creatures || []).filter((c) => c && (c.sprache != null || c.zeichen != null)).length,
        },
        grenze,
        pose: { px: r2(cam.position.x), py: r2(cam.position.y), pz: r2(cam.position.z), lx: r2(cam.position.x + d.x * 30), ly: r2(cam.position.y + d.y * 30), lz: r2(cam.position.z + d.z * 30) },
    };
},
STUFEN: async function stufen(H, K, z, liste) {
    for (const d of liste)
        await K.schritt(d.n, async () => {
            const sp = K.SPEC.sprossen[d.n] || {};
            const um = typeof d.um === "function" ? d.um(z) : d.um != null ? d.um : sp.umfang ? sp.umfang.soll : 1;
            const n = d.wert(z);
            if (d.art === "leser" && !d.da(z)) return K.leser(d.n, { fehlt: d.fehlt, wo: d.wo, n });
            if ((d.art === "nicht" || d.art === "auge") && !(n >= um)) return K.nicht(d.n, { n, fehlt: d.fehlt + " (gemessen " + n + " < " + um + ")" });
            if (d.art === "auge") {
                const b = await K.bild(d.n, z.pose);
                return K.auge(d.n, { bild: b.datei, pose: d.pose + " · Kamera " + [z.pose.px, z.pose.py, z.pose.pz].join("/"), mass: d.mass ? d.mass(z) : "Umfang " + n });
            }
            const o = d.zahl ? await d.zahl(z) : { n, werte: {} };
            return K.zahl(d.n, { taeter: "der Leser steht in der Welt (" + (d.wo || "Umfang " + n) + "), die Probe misst ihn noch nicht — die Station neu schneiden", ...o });
        });
}
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Gestalt: Kulturen der Stadt " + JSON.stringify(z.ort.kulturen) + " · alle Orte " + z.kulturenAlle + " · Gesetz " + z.kulturenGesetz + " · Häuser " + z.haeuserAlle);
            const stadt = (z) => Object.keys(z.ort.kulturen).length;
            const welt = (z) => z.kulturenAlle;
            const mass = (z) => "Kulturen der Stadt " + Object.keys(z.ort.kulturen).join("/") + " · geladen " + z.kulturenAlle;
            await H.seite.STUFEN(H, K, z, [
                { n: 1, art: "auge", um: 10, wert: stadt, mass, pose: POSE, fehlt: "Kulturen an den Häusern der Stadt" },
                { n: 2, art: "auge", um: 100, wert: welt, mass, pose: POSE, fehlt: "Kulturen aus dem Samen (alle geladenen Orte; das Gesetz trägt " + z.kulturenGesetz + " Namen)" },
                { n: 3, art: "auge", um: 1000, wert: welt, mass, pose: POSE, fehlt: "Kulturen auf einem Kontinent" },
                { n: 4, art: "auge", um: 10000, wert: welt, mass, pose: POSE, fehlt: "Kulturen mit Fest und Alltag (eine Tracht je Epoche, kein Fest)" },
                { n: 5, art: "auge", um: 100000, wert: welt, mass, pose: POSE, fehlt: "Kulturen über alle Epochen" },
                { n: 6, art: "auge", um: 1000000, wert: welt, mass, pose: POSE, fehlt: "Kulturen über Planeten und Arten (eine Welt, eine Art)" },
                { n: 7, art: "auge", um: 1000, wert: (z) => z.haeuserAlle, mass, pose: POSE, fehlt: "irdische Stichproben (stehende Häuser aller geladenen Orte)" },
            ]);
        })(H, K);
    return K.ende();
});