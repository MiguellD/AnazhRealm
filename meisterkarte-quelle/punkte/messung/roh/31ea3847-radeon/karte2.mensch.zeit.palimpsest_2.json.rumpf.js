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
SPEC: {"leiter":"mensch.zeit.palimpsest","sprossen":{"2":{"umfang":{"soll":4,"wort":"Jahresringe (Jahrhunderte mit neuen Häusern, 1320 → 1935)"},"masse":[{"key":"ueberdeckung","wort":"Überdeckung je Slot 1320 → 1935","soll":0.9,"richtung":"≥"}]},"3":{"umfang":null,"masse":[{"key":"trasse","wort":"Mauertrasse 1560 als Straße 1860","soll":0.8,"richtung":"≥"},{"key":"kerngassen","wort":"Kerngassen 1560 in 1860","soll":0.9,"richtung":"≥"}]},"4":{"umfang":{"soll":600,"wort":"Jahre stufenlos (1320 → 1920)"},"masse":[{"key":"sprung","wort":"größter Sprung zwischen Nachbarjahren","soll":0.05,"richtung":"≤"},{"key":"bauphasen","wort":"Altstadt mit ≥ 2 Bauphasen (Anteil)","soll":0.5,"richtung":"≥"}]},"5":{"umfang":{"soll":5000,"wort":"Jahre Schichten im Boden"},"masse":[{"key":"schichtfolge","wort":"Schichtfolge = gefahrene Zustände","soll":1,"richtung":"≥"},{"key":"persistenz","wort":"Trassen-Persistenz","soll":0.3,"richtung":"≥"}]},"6":{"umfang":{"soll":1000,"wort":"Jahre Namensgeschichte (100 Orte)"},"masse":[{"key":"ableitbar","wort":"Ortsname lautgesetzlich ableitbar","soll":0.9,"richtung":"≥"}]},"7":{"auge":{"pose":"wiese: 40 m vor dem Spieler, 30 m hoch","vorbild":"Wüstungen und überwachsene Ruinen (Angkor, mittelalterliche Wüstungen Mitteleuropas)"}},"8":{"umfang":{"soll":10000,"wort":"Jahre Metropole"},"masse":[{"key":"epochen2","wort":"≥ 2 Epochen sichtbar (Anteil der Blicke)","soll":0.6,"richtung":"≥"}]}}},
WACHSEN: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const t0 = performance.now();
                const E = ep(arg.gruendung);
                const ex = async (jahr) => {
                    const p = await r._foundryRequestSettlement(jahr == null ? { seed: arg.seed, epoche: E } : { seed: arg.seed, epoche: E, jahr });
                    if (!p) throw new Error("die Foundry ist kalt: export-settlement null (Jahr " + jahr + ")");
                    return p;
                };
                const id = (s) => (s.seed >>> 0) + ":" + s.kultur + "@" + Math.round(s.x * 20) + "," + Math.round(s.z * 20);
                const form = (s) => JSON.stringify([s.ov && s.ov.storeys, s.ov && s.ov.W, s.ov && s.ov.D, s.ov && s.ov.dachTyp, s.rolle]);
                const A = await ex(null);
                const ids0 = A.slots.map(id);
                const formen = new Map(A.slots.map((s) => [id(s), new Set([form(s)])]));
                const stufen = [];
                let vor = new Set(ids0);
                let niedergang = 0;
                const ringJ = new Set(); // die Jahrhunderte, in denen neue Häuser kommen (die Jahresringe)
                let letzter = A;
                const namen = [A.name];
                for (const J of arg.jahre) {
                    const B = await ex(J);
                    const ids = new Set(B.slots.map(id));
                    const neu = [...ids].filter((k) => !vor.has(k)).length;
                    const weg = [...vor].filter((k) => !ids.has(k)).length;
                    if (neu > 0) ringJ.add(Math.floor(J / 100));
                    if (B.slots.length < vor.size) niedergang++;
                    for (const s of B.slots) if (formen.has(id(s))) formen.get(id(s)).add(form(s));
                    stufen.push({ jahr: J, slots: B.slots.length, neu, weg });
                    if (namen[namen.length - 1] !== B.name) namen.push(B.name);
                    vor = ids;
                    letzter = B;
                }
                const bleiben = ids0.filter((k) => vor.has(k)).length;
                // die Nachbarjahre (S4): jedes Paar (Y − 1, Y) über die Spanne — die Menge der Slots wechselt nur an Stellen; je
                // Schritt (nachbar[2] J) halbiert die Probe bis zu jeder Wechselstelle und misst dort den Anteil der Slots, die
                // kommen oder gehen (die Paare ohne Wechsel tragen 0)
                const menge = async (J) => {
                    const p = await ex(J);
                    for (const s of p.slots) if (formen.has(id(s))) formen.get(id(s)).add(form(s));
                    return new Set(p.slots.map(id));
                };
                const gleich = (a, b) => a.size === b.size && [...a].every((k) => b.has(k));
                const anteil = (a, b) => ([...a].filter((k) => !b.has(k)).length + [...b].filter((k) => !a.has(k)).length) / Math.max(1, a.size);
                let [sprung, paare, wechsel, sprungJ] = [0, 0, 0, null];
                let [Ya, Ma] = [arg.nachbar[0], await menge(arg.nachbar[0])];
                while (Ya < arg.nachbar[1]) {
                    const Yb = Math.min(arg.nachbar[1], Ya + arg.nachbar[2]);
                    const Mb = await menge(Yb);
                    let [lo, Mlo] = [Ya, Ma];
                    while (!gleich(Mlo, Mb)) {
                        let [a, b] = [lo, Yb];
                        while (b - a > 1) {
                            const m = Math.floor((a + b) / 2);
                            if (gleich(await menge(m), Mlo)) a = m;
                            else b = m;
                        }
                        const Ms = b === Yb ? Mb : await menge(b);
                        const f = anteil(Mlo, Ms);
                        if (f > sprung) [sprung, sprungJ] = [f, b];
                        wechsel++;
                        [lo, Mlo] = [b, Ms];
                    }
                    paare += Yb - Ya;
                    [Ya, Ma] = [Yb, Mb];
                }
                const umbau = ids0.filter((k) => formen.get(k).size >= 2).length;
                const ch = A.chronik || {};
                const y = r.getTerrainHeightAt(r.state.playerMesh.position.x, r.state.playerMesh.position.z);
                const pm = r.state.playerMesh.position;
                return {
                    gruendSlots: ids0.length,
                    stufen,
                    bleiben,
                    ueberdeckung: +(bleiben / Math.max(1, ids0.length)).toFixed(3),
                    ringe: ringJ.size,
                    sprung: +sprung.toFixed(3),
                    sprungJ,
                    wechsel,
                    paare,
                    spanne4: arg.nachbar[1] - arg.nachbar[0],
                    umbau,
                    bauphasen: +(umbau / Math.max(1, ids0.length)).toFixed(3),
                    niedergang,
                    namen,
                    gr0: ch.gr0 == null ? null : ch.gr0,
                    ende: ch.ende == null ? null : ch.ende,
                    chronikJ: Number.isFinite(ch.ende) && Number.isFinite(ch.gr0) ? ch.ende - ch.gr0 : 0,
                    letzterJahr: letzter.jahr,
                    ms: Math.round(performance.now() - t0),
                    pose: { px: +pm.x.toFixed(2), py: +(y + 30).toFixed(2), pz: +(pm.z + 40).toFixed(2), lx: +pm.x.toFixed(2), ly: +y.toFixed(2), lz: +pm.z.toFixed(2) },
                };
            },
ERBE: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const E = ep(arg.gruendung);
                const d = (px, pz, a, b) => {
                    const [dx, dz] = [b.x - a.x, b.z - a.z];
                    const l2 = dx * dx + dz * dz || 1;
                    const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (pz - a.z) * dz) / l2));
                    return Math.hypot(px - a.x - t * dx, pz - a.z - t * dz);
                };
                const deck = (pts, roads, m) => {
                    let hit = 0;
                    for (const [px, pz] of pts) {
                        let best = Infinity;
                        for (const rd of roads || []) for (let i = 1; i < rd.pts.length; i++) best = Math.min(best, d(px, pz, rd.pts[i - 1], rd.pts[i]));
                        if (best <= m) hit++;
                    }
                    return pts.length ? hit / pts.length : 0;
                };
                const t0 = performance.now();
                const saaten = [];
                for (const seed of arg.saaten) {
                    const A = await r._foundryRequestSettlement({ seed, epoche: E, jahr: arg.alt });
                    const B = await r._foundryRequestSettlement({ seed, epoche: E, jahr: arg.jung });
                    if (!A || !B) return { fehler: "die Foundry ist kalt: export-settlement null (Same " + seed + ")" };
                    const ring = !!(A.mauer && Array.isArray(A.mauer.segs) && A.mauer.segs.length);
                    const rp = [];
                    if (ring) for (const s of A.mauer.segs) for (let k = 0; k <= 4; k++) rp.push([s.x0 + ((s.x1 - s.x0) * k) / 4, s.z0 + ((s.z1 - s.z0) * k) / 4]);
                    const gp = [];
                    for (const rd of A.roads || []) for (const q of rd.pts) gp.push([q.x, q.z]);
                    saaten.push({ seed, ring, trasse: ring ? deck(rp, B.roads, arg.mTrasse) : 0, gassen: deck(gp, B.roads, arg.mGasse) });
                }
                return { saaten, ms: Math.round(performance.now() - t0) };
            }
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            await K.messort("wiese");
            const w = await K.welt("return await (" + H.seite.WACHSEN + ")(r, T, " + JSON.stringify({ seed: 7, gruendung: 1320, jahre: [1400, 1500, 1600, 1700, 1800, 1900, 1935], nachbar: [1320, 1920, 20] }) + ");", 40000);
            if (!w || w.fehler) throw new Error("das Wachstum: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Wachstum: " + JSON.stringify(w));
            await K.schritt(2, async () =>
                K.zahl(2, {
                    n: w.ringe,
                    werte: { ueberdeckung: w.ueberdeckung },
                    beleg: "Slots " + w.stufen.map((q) => q.jahr + ":" + q.slots + (q.neu ? "+" + q.neu : "") + (q.weg ? "−" + q.weg : "")).join(" ") + " · Jahresringe (Jahrhunderte mit neuen Häusern) " + w.ringe + " · von " + w.gruendSlots + " Häusern 1320 stehen 1935 noch " + w.bleiben + " · " + w.ms + " ms",
                    taeter: "fachwerk-core.js exportSettlement (das Wachstum am Jahr, `_ortWaechst` vorTausch): der neue Plan trägt den alten Slot nicht, das Haus fällt",
                })
            );
            await K.schritt(3, async () => {
                const e = await K.welt("return await (" + H.seite.ERBE + ")(r, T, " + JSON.stringify({ saaten: [1, 2, 3, 4, 5, 6, 7, 8], gruendung: 1320, alt: 1560, jung: 1860, mTrasse: 4, mGasse: 2 }) + ");", 40000);
                if (!e || e.fehler) throw new Error("das Erbe: " + ((e && e.fehler) || "ohne Antwort"));
                const mit = e.saaten.filter((q) => q.ring);
                const trasse = mit.length ? mit.reduce((s, q) => s + q.trasse, 0) / mit.length : 0;
                const gassen = e.saaten.reduce((s, q) => s + q.gassen, 0) / e.saaten.length;
                K.zahl(3, {
                    n: e.saaten.length,
                    werte: { trasse: +trasse.toFixed(3), kerngassen: +gassen.toFixed(3) },
                    beleg: mit.length + " von " + e.saaten.length + " Saaten tragen 1560 eine Mauer" + (mit.length ? "" : " (die Trasse fehlt: 0)") + " · je Same Trasse/Gassen " + e.saaten.map((q) => q.seed + ":" + (q.ring ? q.trasse.toFixed(2) : "–") + "/" + q.gassen.toFixed(2)).join(" ") + " · " + e.ms + " ms",
                    taeter: "fachwerk-core.js exportSettlement im Wachstum: " + (mit.length ? "die Straßen von 1860 kennen die Trasse der Mauer von 1560 nicht" : "der wachsende Ort trägt 1560 keine Mauer, deren Trasse er erben könnte"),
                });
            });
            await K.schritt(4, async () =>
                K.zahl(4, {
                    n: w.spanne4,
                    werte: { sprung: w.sprung, bauphasen: w.bauphasen },
                    beleg: w.paare + " Nachbarjahr-Paare 1320–1920, " + w.wechsel + " Wechselstellen (halbiert je 20 J), größter Sprung " + w.sprung + (w.sprungJ ? " an " + (w.sprungJ - 1) + "→" + w.sprungJ : "") + " · " + w.umbau + " von " + w.gruendSlots + " Häusern der Altstadt mit ≥ 2 Bauphasen (Geschosse, Maße, Dach)",
                    taeter: "fachwerk-core.js exportSettlement: ein Haus bleibt, wie es gebaut wurde, oder fällt — kein Umbau, keine Aufstockung, keine Spolie",
                })
            );
            await K.schritt(5, async () => K.nicht(5, { n: w.chronikJ, fehlt: "keine Schichten im Boden, keine Grabung: die Chronik des Orts reicht " + w.chronikJ + " Jahre (" + w.gr0 + " → " + w.ende + "), ein Haus fällt ohne Spur" }));
            await K.schritt(6, async () => K.nicht(6, { n: w.chronikJ, fehlt: "der Name erbt nicht: „" + w.namen.join("“ → „") + "“ über 1320–1935, die Chronik reicht " + w.chronikJ + " Jahre (keine 1 000)" }));
            await K.schritt(7, async () => {
                if (w.chronikJ < 5000) return K.nicht(7, { n: w.chronikJ, fehlt: "kein Niedergang: der Ort wächst nur (" + w.niedergang + " Schritte mit weniger Häusern), keine Ruine, kein Wald über ihr; die Chronik reicht " + w.chronikJ + " Jahre" });
                const b = await K.bild(7, w.pose);
                return K.auge(7, { bild: b.datei, pose: "wiese", mass: w.niedergang + " Schritte Niedergang" });
            });
            await K.schritt(8, async () => K.nicht(8, { n: w.chronikJ, fehlt: "keine Metropole über 10⁴ J: die Chronik reicht " + w.chronikJ + " Jahre, ein Ort trägt den Plan seines Jahres, nie eine Spur früherer Epochen daneben" }));
        })(H, K);
    return K.ende();
});