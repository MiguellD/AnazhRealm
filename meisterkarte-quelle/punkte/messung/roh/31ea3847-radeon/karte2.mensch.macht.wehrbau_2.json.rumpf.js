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
SPEC: {"leiter":"mensch.macht.wehrbau","sprossen":{"2":{"umfang":{"soll":4,"wort":"Stichjahre 900/1350/1650/1900","herkunft":"die Stichjahre, die der Richter aufzählt (900/1350/1650/1900), gezählt: vier"},"masse":[{"key":"treffer","wort":"Jahrhundert erkannt (Palisade → Steinring → Bastion → kein Wall)","soll":0.7,"richtung":"≥"}]},"3":{"umfang":{"soll":32,"wort":"Saaten mit Mauerring"},"masse":[{"key":"ringStrasse","wort":"Ring als Straße","soll":0.7,"richtung":"≥"}]},"4":{"umfang":{"soll":100,"wort":"Burgen je 10⁴ km²"},"masse":[{"key":"wandert","wort":"Hügel/Furt entfernt → Festung wandert","soll":0.8,"richtung":"≥"}]},"5":{"umfang":{"soll":1000,"wort":"km Grenzbefestigung"},"masse":[{"key":"luecken","wort":"Lücken ≤ Sichtweite (Anteil)","soll":0.9,"richtung":"≥"}]},"6":{"umfang":{"soll":10000,"wort":"Wehrbauten aller Epochen"},"masse":[{"key":"cluster","wort":"Form-Cluster, je näher an realer Familie als an Zufall","soll":20,"richtung":"≥"}]},"7":{"auge":{"pose":"stadt-voll: Vogelschau 170 m über dem Platz (25 m südlich), Blick senkrecht","vorbild":"Luftbilder von Residenzstädten mit dem Sitz der Macht über der Stadt (Prag mit dem Hradschin, Carcassonne mit der Cité)"}},"8":{"umfang":{"soll":2,"wort":"fremde Welten mit eigener Waffe","herkunft":"„fremde Welten“ in der Mehrzahl: mindestens zwei Welten, deren Waffe der Wehrbau folgt"},"masse":[{"key":"wechsel","wort":"Waffe getauscht → Form-Cluster wechselt","soll":0.7,"richtung":"≥"}]}}},
MACHT: async (r, T, arg) => {
                const pm = r.state.playerMesh.position;
                const plaene = [...(r._ortPlaene || new Map()).values()].filter((p) => p && p.ort && Array.isArray(p.slots) && Math.hypot(p.ort.x - pm.x, p.ort.z - pm.z) < 1500);
                if (!plaene.length) return { fehler: "kein Ortsplan binnen 1,5 km vom Platz" };
                const RANG = { burg: 3, bergfried: 3, torhaus: 2, rathaus: 2, kirche: 2, kapelle: 1, pfarrhaus: 1, kontor: 1, kaufhaus: 1, patrizierhaus: 1, wohnturm: 1, halle: 2 };
                const xs = [];
                let [burgen, tuerme, ringe] = [0, 0, 0];
                for (const p of plaene) {
                    if (p.mauer && Array.isArray(p.mauer.segs) && p.mauer.segs.length) (ringe++, (tuerme += (p.mauer.towers || []).length));
                    for (const s of p.slots) {
                        const ov = s.ov || {};
                        const vol = (ov.W || 2 * ((s.obb && s.obb.ex) || 3)) * (ov.D || 2 * ((s.obb && s.obb.ez) || 3)) * (ov.storeys || 1) * 3;
                        if (s.rolle === "burg") burgen++;
                        xs.push({ rang: RANG[s.rolle] || 0, vol });
                    }
                }
                const rangOf = (a) => {
                    const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]);
                    const rk = new Array(a.length);
                    for (let i = 0; i < o.length; ) {
                        let j = i;
                        while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++;
                        for (let k = i; k <= j; k++) rk[o[k][1]] = (i + j) / 2;
                        i = j + 1;
                    }
                    return rk;
                };
                const [ra, rb] = [rangOf(xs.map((x) => x.rang)), rangOf(xs.map((x) => x.vol))];
                const mw = (a) => a.reduce((s, v) => s + v, 0) / a.length;
                const [ma, mb] = [mw(ra), mw(rb)];
                let [sab, saa, sbb] = [0, 0, 0];
                for (let i = 0; i < xs.length; i++) (sab += (ra[i] - ma) * (rb[i] - mb), (saa += (ra[i] - ma) ** 2), (sbb += (rb[i] - mb) ** 2));
                const rho = saa && sbb ? sab / Math.sqrt(saa * sbb) : 0;
                const macht = xs.filter((x) => x.rang >= 2);
                const volle = xs.map((x) => x.vol).sort((a, b) => a - b);
                const median = volle[volle.length >> 1] || 1;
                // der Mauer-Pool: jede Wand (Maß x = STADTMAUER.wand.dick) außerhalb der Kästen der Orte ist Grenzbefestigung
                const SM = globalThis.__fachwerkCore.STADTMAUER;
                const P = r.state.stlMauer;
                const wk = r._wegeKarteEnsure();
                const inBox = (i) => (wk.siedlungen || []).some((b) => b && b.streifen && i >= b.streifen[0] && i < b.streifen[1]);
                let [poolWaende, poolFrei, freiM] = [0, 0, 0];
                if (P && P.mesh) {
                    const M4 = new T.Matrix4(), pos = new T.Vector3(), q = new T.Quaternion(), sk = new T.Vector3();
                    for (let i = 0; i < (P.top || 0); i++) {
                        M4.fromArray(P.mesh.instanceMatrix.array, i * 16);
                        M4.decompose(pos, q, sk);
                        if (!(Math.abs(sk.x - SM.wand.dick) < 0.01 && sk.y > SM.wand.hoch)) continue;
                        poolWaende++;
                        if (!inBox(i)) (poolFrei++, (freiM += sk.z));
                    }
                }
                const y0 = r.getTerrainHeightAt(pm.x, pm.z);
                const hoch = 170;
                return {
                    slots: xs.length,
                    plaene: plaene.length,
                    machtbauten: macht.length,
                    volFaktor: macht.length ? +(mw(macht.map((x) => x.vol)) / median).toFixed(2) : 0,
                    rho: +rho.toFixed(3),
                    burgen,
                    wehrbauten: ringe + tuerme + burgen,
                    poolWaende,
                    poolFrei,
                    grenzKm: +(freiM / 1000).toFixed(3),
                    platz: [+pm.x.toFixed(1), +pm.z.toFixed(1)],
                    hoch,
                    pose: { px: +pm.x.toFixed(2), py: +(y0 + hoch).toFixed(2), pz: +(pm.z + 25).toFixed(2), lx: +pm.x.toFixed(2), ly: +y0.toFixed(2), lz: +pm.z.toFixed(2) },
                };
            },
FORM: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const SM = globalThis.__fachwerkCore.STADTMAUER;
                const t0 = performance.now();
                const aus = [];
                for (const seed of arg.saaten)
                    for (const Y of arg.jahre) {
                        const plan = await r._foundryRequestSettlement({ seed, nH: arg.nH, epoche: ep(Y) });
                        if (!plan) return { fehler: "die Foundry ist kalt: export-settlement null (Same " + seed + ", Jahr " + Y + ")" };
                        const m = plan.mauer;
                        let form = "kein Wall";
                        if (m && Array.isArray(m.segs) && m.segs.length) {
                            const wand = m.wand || SM.wand;
                            const art = String(m.art || m.form || "").toLowerCase();
                            // der Vorsprung der Türme vor dem Ring (um die Mitte seiner Segmente): eine Bastion springt vor, ein Turm sitzt im Ring
                            const mid = m.segs.map((s) => [(s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2]);
                            const [cx, cz] = [mid.reduce((a, q) => a + q[0], 0) / mid.length, mid.reduce((a, q) => a + q[1], 0) / mid.length];
                            const R0 = mid.reduce((a, q) => a + Math.hypot(q[0] - cx, q[1] - cz), 0) / mid.length;
                            const vor = (m.towers || []).map((t) => Math.hypot(t.x - cx, t.z - cz) - R0);
                            if (art.indexOf("palis") >= 0 || wand.dick < 0.6) form = "Palisade";
                            else if (art.indexOf("bastion") >= 0 || (vor.length && Math.min(...vor) > 4)) form = "Bastion";
                            else form = "Steinring";
                        }
                        aus.push({ seed, jahr: Y, epoche: ep(Y), form, R: m && Number.isFinite(m.R) ? Math.round(m.R) : null });
                    }
                return { aus, dick: SM.wand.dick, hoch: SM.wand.hoch, ms: Math.round(performance.now() - t0) };
            },
RING: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const d = (px, pz, a, b) => {
                    const [dx, dz] = [b.x - a.x, b.z - a.z];
                    const l2 = dx * dx + dz * dz || 1;
                    const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (pz - a.z) * dz) / l2));
                    return Math.hypot(px - a.x - t * dx, pz - a.z - t * dz);
                };
                const t0 = performance.now();
                const bis = t0 + arg.fristMs;
                const saaten = [];
                for (let seed = 1; seed <= arg.maxSaat && saaten.filter((x) => x.ring).length < arg.ringe && performance.now() < bis; seed++) {
                    const A = await r._foundryRequestSettlement({ seed, epoche: ep(arg.gruendung), jahr: arg.alt });
                    const B = await r._foundryRequestSettlement({ seed, epoche: ep(arg.gruendung), jahr: arg.jung });
                    if (!A || !B) return { fehler: "die Foundry ist kalt: export-settlement null (Same " + seed + ")" };
                    if (!A.mauer || !Array.isArray(A.mauer.segs) || !A.mauer.segs.length) {
                        saaten.push({ seed, ring: false });
                        continue;
                    }
                    let [tot, hit] = [0, 0];
                    for (const s of A.mauer.segs)
                        for (let k = 0; k <= 4; k++) {
                            const [px, pz] = [s.x0 + ((s.x1 - s.x0) * k) / 4, s.z0 + ((s.z1 - s.z0) * k) / 4];
                            let best = Infinity;
                            for (const rd of B.roads || []) for (let i = 1; i < rd.pts.length; i++) best = Math.min(best, d(px, pz, rd.pts[i - 1], rd.pts[i]));
                            tot++;
                            if (best <= arg.m) hit++;
                        }
                    saaten.push({ seed, ring: true, deck: tot ? hit / tot : 0, mauerJung: !!(B.mauer && B.mauer.segs && B.mauer.segs.length) });
                }
                return { saaten, alt: arg.alt, jung: arg.jung, m: arg.m, ms: Math.round(performance.now() - t0) };
            }
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            await K.messort("stadt-voll");
            const m = await K.welt("return await (" + H.seite.MACHT + ")(r, T, {});", 30000);
            if (!m || m.fehler) throw new Error("die Welt der Machtbauten: " + ((m && m.fehler) || "ohne Antwort"));
            H.zeile("Machtbauten: " + JSON.stringify(m));
            // die Exporte ohne Pose zuerst, das Bild am Ende: seine Pose liegt 25 m vom Platz (die Werkbank stellt nicht um), die Probe
            // endet am Ort der niedrigsten gemessenen Sprosse (S2, der Platz der vollen Stadt)
            await K.schritt(2, async () => {
                const soll = { 900: "Palisade", 1350: "Steinring", 1650: "Bastion", 1900: "kein Wall" };
                const f = await K.welt("return await (" + H.seite.FORM + ")(r, T, " + JSON.stringify({ saaten: [7, 11], jahre: [900, 1350, 1650, 1900], nH: 24 }) + ");", 60000);
                if (!f || f.fehler) throw new Error("der Export der Form: " + ((f && f.fehler) || "ohne Antwort"));
                const treffer = f.aus.filter((x) => x.form === soll[x.jahr]).length / f.aus.length;
                const jahre = new Set(f.aus.map((x) => x.jahr)).size;
                K.zahl(2, {
                    n: jahre,
                    werte: { treffer: +treffer.toFixed(3) },
                    beleg: f.aus.map((x) => x.jahr + " " + x.epoche + " → " + x.form + (x.R ? " R" + x.R : "") + " (Soll " + soll[x.jahr] + ", Same " + x.seed + ")").join(" · ") + " · " + f.ms + " ms",
                    taeter: "fachwerk-core.js mauerRing/STADTMAUER: eine Wand (dick " + f.dick + " m, hoch " + f.hoch + " m) für jede Epoche, nach MAUER_BIS keine",
                });
            });
            await K.schritt(3, async () => {
                const g = await K.welt("return await (" + H.seite.RING + ")(r, T, " + JSON.stringify({ gruendung: 1320, alt: 1700, jung: 1900, ringe: 32, maxSaat: 64, m: 4, fristMs: Math.max(5000, (H.rest() - 22) * 1000) }) + ");", 60000);
                if (!g || g.fehler) throw new Error("der Export der Ringe: " + ((g && g.fehler) || "ohne Antwort"));
                const mit = g.saaten.filter((x) => x.ring);
                const deck = mit.length ? mit.reduce((s, x) => s + x.deck, 0) / mit.length : 0;
                K.zahl(3, {
                    n: mit.length,
                    werte: { ringStrasse: +deck.toFixed(3) },
                    beleg: mit.length + " Saaten mit Ring " + g.alt + " (von " + g.saaten.length + "), Deckung des alten Rings durch die Straßen " + g.jung + " ≤ " + g.m + " m: " + mit.slice(0, 12).map((x) => x.seed + ":" + x.deck.toFixed(2)).join(" ") + " · " + g.ms + " ms",
                    taeter: "fachwerk-core.js exportSettlement: die Straßen des jüngeren Jahrs kennen den alten Ring nicht (die Mauer steht oder fällt, nie wird sie Gasse)",
                });
            });
            await K.schritt(4, async () => K.nicht(4, { n: m.burgen, fehlt: "keine Burgen in der Fläche: " + m.burgen + " Burg als Slot der vollen Stadt, keine Festung an Hügel oder Furt" }));
            await K.schritt(5, async () => K.nicht(5, { n: m.grenzKm, fehlt: "keine Grenzbefestigung: " + m.poolWaende + " Wände im Pool, " + m.poolFrei + " außerhalb eines Orts (" + m.grenzKm + " km) — jede Mauer ist ein Ring um einen Ort" }));
            await K.schritt(6, async () => K.nicht(6, { n: m.wehrbauten, fehlt: "keine Familien von Wehrbauten: " + m.wehrbauten + " Wehrbauten (Ringe, Türme, Burgen) in einer Form (STADTMAUER) für jede Epoche" }));
            await K.schritt(8, async () => K.nicht(8, { n: 0, fehlt: "keine fremde Welt mit eigener Waffe: der Wehrbau kennt nur die Wand der Menschen" }));
            await K.schritt(7, async () => {
                const b = await K.bild(7, m.pose);
                K.auge(7, {
                    bild: b.datei,
                    pose: "stadt-voll: Vogelschau " + m.hoch + " m über dem Platz " + m.platz.join("/") + " (25 m südlich), Blick senkrecht",
                    mass: m.machtbauten + " Machtbauten von " + m.slots + " Bauten, ihr Volumen das " + m.volFaktor + "-Fache des mittleren Hauses, Größe ↔ Macht ρ " + m.rho,
                });
            });
        })(H, K);
    return K.ende();
});