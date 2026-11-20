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
SPEC: {"leiter":"mensch.netz.verkehr","sprossen":{"3":{"umfang":{"soll":100,"wort":"Teilnehmer an Ampel und Übergang"},"masse":[{"key":"zeitluecke","wort":"Zeitlücke Median s","von":1,"bis":3},{"key":"konflikte","wort":"Konflikte","soll":0,"richtung":"≤"}]},"4":{"umfang":{"soll":10000,"wort":"Wagen in der Stadt"},"masse":[{"key":"fundamental","wort":"Fundamentaldiagramm, Abweichung","soll":0.25,"richtung":"≤"},{"key":"stauwelle","wort":"Stauwelle rückwärts km/h","von":15,"bis":20}]},"5":{"umfang":{"soll":100000,"wort":"Wege am Tag mit Anlass"},"masse":[{"key":"ganglinie","wort":"Ganglinie r","soll":0.8,"richtung":"≥"},{"key":"aussteigen","wort":"verfolgte Fahrer am passenden Ort ausgestiegen","soll":0.9,"richtung":"≥"}]},"6":{"umfang":{"soll":10000000,"wort":"Fahrzeuge aller Moden"},"masse":[{"key":"reisezeit","wort":"Reisezeit bei gesperrter Achse gegen den Referenzlauf, Abweichung","soll":0.3,"richtung":"≤"},{"key":"moden","wort":"Moden im Modal Split","soll":1,"richtung":">","herkunft":"„Modal Split“ über „alle Moden“: ein Split trägt mehr als eine Mode — das Band selbst nennt die Karte ohne Zahl"}]},"7":{"auge":{"pose":"Video der Stadt im Verkehr","vorbild":"Videos realen Verkehrs (Echtheits-Probe), Kultur erkannt ≥ 80 %, verfolgtes Fahrzeug kommt an ≥ 98 %"}},"8":{"umfang":{"soll":10000000000,"wort":"Reisende"},"masse":[{"key":"anlass","wort":"Anlass erklärt","soll":0.95,"richtung":"≥"}]}}},
NETZ: async (r, T, o) => {
    o = o || {};
    const st = r.state;
    const pm = st.playerMesh.position;
    const t0 = performance.now();
    const r2 = (v) => (typeof v === "number" && isFinite(v) ? Math.round(v * 100) / 100 : null);
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
    const steht = (q) => q.plan.slots.filter((sl) => sl && (jeSame.get(sl.seed >>> 0) || []).some((x) => Math.hypot(x.position.x - q.ox - sl.x, x.position.z - q.oz - sl.z) < 1)).length;
    const je = alle.map((q) => ({ q, n: steht(q) })).filter((x) => x.n > 0);
    if (!je.length) return { fehler: "keine Siedlung mit stehenden Häusern (" + alle.length + " Pläne)" };
    const nah = je.filter((x) => dS(x.q) < 600);
    let O = (nah.length ? nah : je)[0];
    for (const x of nah.length ? nah : je) if (nah.length ? x.n > O.n : dS(x.q) < dS(O.q)) O = x;
    const S = O.q;
    // DIE WEGE eines Plans mit ihrer Klasse (fachwerk WEGE_KLASSE, `wegeNetz`: Generation 0 Ortsdurchfahrt, 1 Wohnstraße, ≥ 2 Gasse;
    // ein Feldweg des Plans ist Feldweg)
    const KL = ["ortsdurchfahrt", "wohnstrasse", "gasse"];
    const wege = (q) => {
        const L = [];
        for (const rd of q.plan.roads || []) if (rd && Array.isArray(rd.pts) && rd.pts.length >= 2) L.push({ rd, klasse: KL[Math.max(0, Math.min(2, rd.gen | 0))] });
        for (const rd of q.plan.feldwege || []) if (rd && Array.isArray(rd.pts) && rd.pts.length >= 2) L.push({ rd, klasse: "feldweg" });
        return L;
    };
    const lang = (p) => {
        let L = 0;
        for (let k = 1; k < p.length; k++) L += Math.hypot(p[k].x - p[k - 1].x, p[k].z - p[k - 1].z);
        return L;
    };
    const grund = (x, z) => (typeof r._terrainMacroSurfaceY === "function" ? r._terrainMacroSurfaceY(x, z, true) : r.getTerrainHeightAt(x, z));
    // DAS GEFÄLLE je Saat (ort-proben.cjs `gassenGefaelle`): p95 in % von |Δ Grund| / Länge über jeden Schritt ≥ 0,5 m jeder Gasse
    const gefaelle = (q) => {
        const gs = [];
        for (const rd of q.plan.roads || []) {
            const P = (rd && rd.pts) || [];
            for (let k = 1; k < P.length; k++) {
                const d = Math.hypot(P[k].x - P[k - 1].x, P[k].z - P[k - 1].z);
                if (d >= 0.5) gs.push(Math.abs(grund(q.ox + P[k].x, q.oz + P[k].z) - grund(q.ox + P[k - 1].x, q.oz + P[k - 1].z)) / d);
            }
        }
        gs.sort((a, b) => a - b);
        return gs.length ? +(100 * gs[Math.round(0.95 * (gs.length - 1))]).toFixed(1) : null;
    };
    const saaten = je.map((x) => {
        const W = wege(x.q);
        return { key: x.q.key, seed: x.q.plan.seed >>> 0, steht: x.n, gefaelle: gefaelle(x.q), netzKm: r2(W.reduce((a, w) => a + lang(w.rd.pts), 0) / 1000), klassen: [...new Set(W.map((w) => w.klasse))] };
    });
    const gef = saaten.filter((s) => s.gefaelle != null);
    const steil = gef.length ? gef.reduce((a, s) => (s.gefaelle > a.gefaelle ? s : a)) : null;
    const aus = {
        ort: { key: S.key, name: S.plan.name, steht: O.n, netzKm: r2(wege(S).reduce((a, w) => a + lang(w.rd.pts), 0) / 1000), d: r2(dS(S)) },
        saaten,
        klassen: [...new Set(saaten.flatMap((s) => s.klassen))],
        gefaelleMax: steil ? steil.gefaelle : null,
        gefaelleBei: steil ? steil.key : null,
        welten: [st.worldMeta && st.worldMeta.seed].filter((x) => x != null).length,
    };
    // DIE WAND IM FAHRKORRIDOR: je Meter jeder Klasse jedes stehenden Orts — eine feste Kiste der Szene (ohne Pflanze, ohne stempelfreie
    // Teile wie Wagen und Brücken-Durchlass, ohne Trittfläche) näher als halbM an der Achse, die 0,3–1,5 m über der Fahrbahn steht
    if (o.wand) {
        const halb = AnazhRealm.WEGENETZ && AnazhRealm.WEGENETZ.halbM;
        if (!(typeof halb === "number" && halb > 0)) return Object.assign(aus, { fehler: "AnazhRealm.WEGENETZ.halbM fehlt" });
        const Z = 4;
        const gitter = new Map();
        let gross = 0;
        for (const e of st.architectures || []) {
            if (!e || !Array.isArray(e.blockerAABBs)) continue;
            for (const a of e.blockerAABBs) {
                if (!a || a.pflanze || a.stempelfrei || a.tritt || !isFinite(a.minX) || !isFinite(a.maxX) || !isFinite(a.minZ) || !isFinite(a.maxZ)) continue;
                if (a.maxX - a.minX > 400 || a.maxZ - a.minZ > 400) {
                    gross++;
                    continue;
                }
                for (let i = Math.floor((a.minX - halb) / Z); i <= Math.floor((a.maxX + halb) / Z); i++)
                    for (let k = Math.floor((a.minZ - halb) / Z); k <= Math.floor((a.maxZ + halb) / Z); k++) {
                        const key = i + "," + k;
                        const L = gitter.get(key);
                        if (L) L.push([a, e]);
                        else gitter.set(key, [[a, e]]);
                    }
            }
        }
        const wand = {};
        let geprueftM = 0;
        let voll = true;
        for (const x of je) {
            for (const w of wege(x.q)) {
                const c = (wand[w.klasse] = wand[w.klasse] || { m: 0, stellen: 0, taeter: null });
                const P = w.rd.pts;
                for (let k = 1; k < P.length; k++) {
                    const ax = x.q.ox + P[k - 1].x;
                    const az = x.q.oz + P[k - 1].z;
                    const bx = x.q.ox + P[k].x;
                    const bz = x.q.oz + P[k].z;
                    const L = Math.hypot(bx - ax, bz - az);
                    for (let u = 0; u < L; u += 1) {
                        const px = ax + ((bx - ax) * u) / L;
                        const pz = az + ((bz - az) * u) / L;
                        const y = r.getTerrainHeightAt(px, pz);
                        const hit = (gitter.get(Math.floor(px / Z) + "," + Math.floor(pz / Z)) || []).find(([a]) => {
                            const qx = Math.max(a.minX, Math.min(a.maxX, px));
                            const qz = Math.max(a.minZ, Math.min(a.maxZ, pz));
                            const unten = isFinite(a.botY) ? a.botY : -Infinity;
                            return Math.hypot(qx - px, qz - pz) <= halb && unten < y + 1.5 && a.topY > y + 0.3;
                        });
                        if (hit) {
                            c.stellen++;
                            if (!c.taeter) c.taeter = (hit[1].type || "Bau") + " bei " + px.toFixed(1) + "," + pz.toFixed(1) + " (" + (x.q.key || "?") + ")";
                        }
                    }
                    c.m += L;
                    geprueftM += L;
                }
                if (performance.now() - t0 > (o.budgetMs || 15000)) voll = false;
                if (!voll) break;
            }
            if (!voll) break;
        }
        for (const k of Object.keys(wand)) wand[k].m = Math.round(wand[k].m);
        aus.wand = wand;
        aus.wandStellen = Object.values(wand).reduce((a, c) => a + c.stellen, 0);
        aus.wandVoll = voll;
        aus.wandM = Math.round(geprueftM);
        aus.wandGross = gross;
    }
    // DER VERKEHR: die Wagen des Orts und der Sitzung (fahrend, mit Bewohner am Steuer), die Kreuzungen seines Plans
    const wagenVon = (q) => (q.verkehr && Array.isArray(q.verkehr.wagen) ? q.verkehr.wagen : []);
    const W0 = wagenVon(S);
    aus.verkehr = {
        wagenStadt: W0.length,
        faehrt: W0.filter((w) => w && w.zustand === "faehrt").length,
        amSteuer: W0.filter((w) => w && w.b && w.b.amSteuer).length,
        wagenAlle: alle.reduce((a, q) => a + wagenVon(q).length, 0),
        kreuzungen: S.plan.verkehr && Array.isArray(S.plan.verkehr.kreuzungen) ? S.plan.verkehr.kreuzungen.length : null,
    };
    // DIE BAUTEN DER SZENE nach ihrer Art: Ampel und Übergang, Massenverkehr, Leitungen, Laternen, Brunnen
    const art = (re) => (st.architectures || []).filter((e) => e && typeof e.type === "string" && re.test(e.type));
    const ampeln = art(/(^|_)(ampel|zebra|uebergang|fussgaengerueberweg)(_|$)/i);
    aus.ampeln = ampeln.length;
    const bahn = art(/(^|_)(bahn|bahnhof|gleis|schiene|haltestelle|bahnsteig|tram|metro|ubahn|bus)(_|$)/i);
    aus.bahn = bahn.length;
    // die Fahrgäste: Leiber binnen 5 m eines Baus des Massenverkehrs
    aus.bahnGaeste = alle.reduce((a, q) => a + (q.liste || []).filter((b) => b && b.leib && b.leib.position && bahn.some((e) => Math.hypot(e.position.x - b.leib.position.x, e.position.z - b.leib.position.z) <= 5)).length, 0);
    aus.leitungen = art(/(^|_)(leitung|kabel|rohr|mast|trafo|pumpe|kanal)(_|$)/i).length;
    aus.laternen = art(/^(wand)?laterne_dorf$/).length;
    aus.brunnen = art(/^brunnen_dorf$/).length;
    // die Teilnehmer an Ampel und Übergang: Wagen und Leiber binnen 15 m eines solchen Baus
    {
        const nahAn = (p) => p && ampeln.some((e) => Math.hypot(e.position.x - p.x, e.position.z - p.z) <= 15);
        let n = 0;
        for (const q of alle) {
            for (const w of wagenVon(q)) if (w && w.entry && nahAn(w.entry.position)) n++;
            for (const b of q.liste || []) if (b && b.leib && nahAn(b.leib.position)) n++;
        }
        aus.ampelTeilnehmer = n;
    }
    // DIE WEGE AM TAG aus den Orten der Tage: je Bewohner jeder Ort seines Tags mit Anlass (Werk, Platz, Mahl, Abend, Besuch)
    aus.reisende = alle.reduce((a, q) => a + (Array.isArray(q.liste) ? q.liste.length : 0), 0);
    aus.wegeTag = alle.reduce((a, q) => a + (q.liste || []).reduce((s, b) => s + (b && b.orte ? ["werk", "platz", "mahl", "abend", "besuch"].filter((k) => b.orte[k]).length : 0), 0), 0);
    aus.s = r2((performance.now() - t0) / 1000);
    return aus;
}
};
H.fahre(async (H) => {
    const K = H.seite.K(H, H.seite.SPEC);
    K.adapter();
    await (async (H, K) => {
            await K.messort("stadt-voll");
            let N;
            try {
                N = await K.welt("return await (" + H.seite.NETZ + ")(r, T, {});");
            } catch (e) {
                N = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!N || N.fehler) throw new Error("das Netz am Messort: " + ((N && N.fehler) || "ohne Antwort"));
                return N;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: " + (N && !N.fehler ? N.verkehr.wagenStadt + " Wagen (" + N.verkehr.faehrt + " fahren, " + N.verkehr.amSteuer + " mit Fahrer), Ampeln " + N.ampeln + ", Wege am Tag " + N.wegeTag : (N && N.fehler) || "ohne Antwort"));
            await K.schritt(3, async () => nicht(3, da().ampelTeilnehmer, 100, "10² Teilnehmer an Ampel und Übergang: die Szene trägt " + N.ampeln + " Ampeln und Übergänge, an ihnen " + N.ampelTeilnehmer + " Teilnehmer; die Stadt hat " + N.verkehr.kreuzungen + " Kreuzungen und " + N.verkehr.wagenStadt + " Wagen"));
            await K.schritt(4, async () => nicht(4, da().verkehr.wagenStadt, 1e4, "10⁴ Wagen in der Stadt (Stau von selbst): die Stadt trägt " + N.verkehr.wagenStadt + " Wagen, " + N.verkehr.faehrt + " fahren"));
            await K.schritt(5, async () => nicht(5, da().wegeTag, 1e5, "10⁵ Wege am Tag mit Anlass: die Tage der " + N.reisende + " Bewohner tragen " + N.wegeTag + " Orte mit Anlass"));
            await K.schritt(6, async () => nicht(6, da().verkehr.wagenAlle, 1e7, "10⁷ Fahrzeuge aller Moden: die Sitzung trägt " + N.verkehr.wagenAlle + " Wagen, eine Mode, " + N.bahn + " Bauten anderer Moden"));
            await K.schritt(7, async () => nicht(7, da().wegeTag, 1e9, "10⁹ Wege am Tag in 3 D, Schiffe und Flüge: die Tage der Sitzung tragen " + N.wegeTag + " Orte mit Anlass"));
            await K.schritt(8, async () => nicht(8, da().reisende, 1e10, "10¹⁰ Reisende über Epochen und Sonnensysteme: die Sitzung trägt " + N.reisende + " Bewohner in einer Welt"));
        })(H, K);
    return K.ende();
});