// DIE PROBEN DER WELT IN DER SITZUNG (29.10., das Gesetz des Schöpfers: „Eine komplette Fahrt durch jedes System max 30 min,
// inbegriffen ist dann auch die Dauerlast“): tiere.K5#1 · fahrzeug.K5#1 · fahrzeug.K2#1 · streaming.K3#1 · streaming.K4#2 ·
// physik.K2#2 · gelaende.K2#1/#2 · gelaende.K5#2 messen in der EINEN warmen Welt der Sitzung (punkte.cjs fahreSitzung), nie mit
// eigenem Boot und nie mit eigenem Browser, je Probe ein Ziel von Sekunden: Teleport statt Laufen, der Zeitraffer der Spiel-Uhr
// statt Warten, je Urteil EIN Ort, die Welt nie neu geladen (außer streaming.K4#2: seine Haken sitzen vor dem ersten Skript).
// Das Urteil bleibt das der Linse: ihre Seiten-Funktion kommt aus dem Spiel-Baum am SHA (`tor.quelle`, acorn) und wird nur mit
// ANKERN auf das gekürzt, was das Kriterium braucht — steht ein Anker nicht genau einmal, wirft die Probe beim Namen (die Linse
// änderte sich: ROT, nie still alt). Jede Funktion hier wird als Text in den Befehl getragen (`torBefehl`): der Abdruck sieht jede
// Änderung, und keine darf außerhalb ihres Rumpfs lesen.
"use strict";

// DAS TOR DER SITZUNG (läuft im Prozess der Probe, cwd = der Spiel-Baum): der Ruf an die Werkbank der Welt (WERKBANK_PORT), die
// Adapter-Zeile ihres Logs (PUNKTE_SITZUNG_LOG), die Seite der Welt über puppeteer am Browser der Werkbank (/status nennt sein
// Profil, dort steht DevToolsActivePort; ohne Viewport von außen, getrennt am Ende — der Browser bleibt), und die Quellen der Linsen.
function sitzungTor() {
    const fs = require("fs");
    const path = require("path");
    const http = require("http");
    const W = Number(process.env.WERKBANK_PORT);
    const tor = { W, aus: process.argv[1], arg: process.argv.slice(2), browser: null, page: null };
    // EIN Ruf (POST JSON, mit Frist); eine Antwort { fehler: "…" } der Werkbank wirft beim Namen
    tor.ruf = (weg, nutzlast, ms = 120000) =>
        new Promise((ok, nein) => {
            const q = http.request({ host: "127.0.0.1", port: W, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (a) => {
                let d = "";
                a.on("data", (c) => (d += c));
                a.on("end", () => {
                    let j = null;
                    try {
                        j = JSON.parse(d);
                    } catch (_e) {
                        return nein(new Error(weg + ": keine JSON-Antwort: " + d.slice(0, 200)));
                    }
                    if (j && typeof j.fehler === "string") return nein(new Error(weg + ": " + j.fehler.slice(0, 300)));
                    ok(j);
                });
            });
            q.on("error", nein);
            q.setTimeout(ms, () => q.destroy(new Error(weg + ": Frist " + ms + " ms")));
            q.end(JSON.stringify(nutzlast || {}));
        });
    // die Karte der Welt: die Adapter-Zeile im Log ihrer Werkbank (der Zeuge der Wand GPU steht schon in der Sitzung)
    tor.karte = () => {
        const f = process.env.PUNKTE_SITZUNG_LOG;
        const t = f && fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
        const z = (/^\[linse-gpu\] .*$/m.exec(t) || [null])[0];
        console.log(z || "KEINE KARTE: das Log der Sitzung nennt keinen [linse-gpu]");
        return z;
    };
    tor.seite = async () => {
        if (tor.page) return tor.page;
        const s = await tor.ruf("/status", {}, 30000);
        const profil = s && s.boot && s.boot.profil;
        if (!profil) throw new Error("/status nennt kein Profil der Werkbank");
        const [port, weg] = fs.readFileSync(path.join(profil, "DevToolsActivePort"), "utf8").split(/\r?\n/);
        const puppeteer = require(path.resolve("node_modules/puppeteer"));
        tor.browser = await puppeteer.connect({
            browserWSEndpoint: "ws://127.0.0.1:" + port + weg,
            defaultViewport: null,
            protocolTimeout: 900000,
        });
        for (const p of await tor.browser.pages())
            if (await p.evaluate(() => !!(window.anazhRealm && window.anazhRealm.state)).catch(() => false)) return (tor.page = p);
        throw new Error("im Browser der Werkbank steht keine Seite mit der Welt");
    };
    const baum = (datei) => {
        const text = fs.readFileSync(datei, "utf8");
        const acorn = require(path.resolve("node_modules/acorn"));
        const o = { ecmaVersion: "latest", sourceType: "script", allowHashBang: true, allowReturnOutsideFunction: true };
        return { text, ast: acorn.parse(text, o) };
    };
    const ankern = (src, wo, anker) => {
        for (const [a, b] of anker) {
            const n = src.split(a).length - 1;
            if (n !== 1) throw new Error("ANKER " + (n ? n + "-mal" : "fehlt") + " in " + wo + ": " + a.slice(0, 90));
            src = src.replace(a, () => b);
        }
        return src;
    };
    // die Deklaration `name` auf oberster Ebene (eine Funktion: ihr Text; const: ihr Wert), jeder Anker [alt, neu] genau einmal ersetzt
    tor.quelle = (datei, name, anker = []) => {
        const { text, ast } = baum(datei);
        for (const n of ast.body) {
            if (n.type === "FunctionDeclaration" && n.id && n.id.name === name) return ankern(text.slice(n.start, n.end), datei + " " + name, anker);
            if (n.type === "VariableDeclaration")
                for (const d of n.declarations)
                    if (d.id.type === "Identifier" && d.id.name === name && d.init) return ankern(text.slice(d.init.start, d.init.end), datei + " " + name, anker);
        }
        throw new Error(datei + ": keine Deklaration " + name + " auf oberster Ebene");
    };
    // die Deklarationen `namen` (Anweisungen der obersten Ebene) in der Reihe der Quelle — eine rechnet mit der vorigen
    tor.dekl = (datei, namen) => {
        const { text, ast } = baum(datei);
        const da = new Set();
        const teile = [];
        for (const n of ast.body) {
            const wer = n.type === "FunctionDeclaration" && n.id ? [n.id.name] : n.type === "VariableDeclaration" ? n.declarations.map((d) => d.id.name) : [];
            if (wer.some((w) => namen.includes(w))) (teile.push(text.slice(n.start, n.end)), wer.forEach((w) => da.add(w)));
        }
        const fehlt = namen.filter((x) => !da.has(x));
        if (fehlt.length) throw new Error(datei + ": keine Deklaration " + fehlt.join(", "));
        return teile.join("\n");
    };
    tor.ende = async () => {
        if (tor.browser) await tor.browser.disconnect().catch(() => {});
    };
    return tor;
}

// der Befehl einer Probe: das Tor, dann `fn(tor)`; ein Wurf ist ROT beim Namen (PROBE-FEHLER mit den ersten Rahmen), nie still
function torBefehl(fn, ...arg) {
    return [
        "node",
        "-e",
        "const tor = (" + sitzungTor + ")();\n(" + fn + ")(tor).then(() => process.exitCode || 0, (e) => (console.log('PROBE-FEHLER ' + " +
            "String((e && e.stack) || e).split('\\n').slice(0, 4).join(' | ')), 1)).then(async (c) => { await tor.ende(); process.exit(c); });",
        "{AUS}",
        ...arg,
    ];
}

// ───────── physik.K2#2 — der Wagen bei vmax × 1,2 und die Bild-Probe an der Mauer (gate:kollision-bild `tempo`) ─────────
// Die Linse fährt in `tempo` alle Leiber (Fuchs · Wolf · Bär · Riese · der Spieler gehend und im Sprint · der Fall: das ist
// physik.K2#1, headless) und dann den Wagen und den gestoßenen Bären; Staffel 2 urteilt nur Wagen, gestoßenen Bären, den
// Schmuggel (der Fuchs ohne Teil-Schritt muss durch die Mauer) und das Beweisbild — die Anker nehmen die übrigen Schleifen
// heraus, nichts sonst. Die Zeilen der Ausgabe sind die der Linse (das Urteil der Station liest sie unverändert).
async function kollisionTempo(tor) {
    const fs = require("fs");
    const path = require("path");
    const L = "scripts/diag-kollision-bild.cjs";
    const U = new Function(
        tor.dekl(L, ["EINDRING_M", "SPALT_M", "UEBER_VMAX", "FALL_M", "HINDERNISSE", "TAKTE", "zeilen", "TEMPO_ZEILEN", "BILD_PX", "schluessel", "tempoUrteil"]) +
            "\nreturn { SPALT_M, UEBER_VMAX, FALL_M, HINDERNISSE, TAKTE, TEMPO_ZEILEN, tempoUrteil };"
    )();
    const tempo = tor.quelle(L, "tempo", [
        ['for (const name of ["fuchs", "wolf", "baer", "riese"])', "for (const name of [])"],
        ["for (const sprint of [false, true])", "for (const sprint of [])"],
        ['for (const kad of ["60", "deckel"]) {', "for (const kad of []) {"],
    ]);
    const page = await tor.seite();
    const karte = tor.karte();
    await page.evaluate(["rahmen", "lok", "aussen", "zuBox"].map((n) => "window." + n + " = " + tor.quelle(L, n) + ";").join("\n"));
    const { messort } = require(path.resolve("scripts/lib/welt-orte.cjs"));
    const K = { mess: messort("wiese"), HINDERNISSE: U.HINDERNISSE, TAKTE: U.TAKTE, UEBER_VMAX: U.UEBER_VMAX, SPALT_M: U.SPALT_M, FALL_M: U.FALL_M, BILD: true };
    const t0 = Date.now();
    const T = await page.evaluate("(" + tempo + ")(" + JSON.stringify(K) + ")");
    T.karte = karte ? { vendor: (/^\[linse-gpu\]\s*([^/\s]+)/.exec(karte) || [])[1] } : { fehlt: "keine Adapter-Zeile im Log der Sitzung" };
    if (T.fehler) console.log("❌ LAUF-FEHLER: " + T.fehler);
    const Z = T.zeilen || [];
    console.log(`  (V) Kontakt beim Tempo: ${Z.length}/${U.TEMPO_ZEILEN.length} Zeilen · Schmuggel ${JSON.stringify(T.schmuggel)}`);
    console.log(`  gekürzt auf Wagen, gestoßenen Bären und Schmuggel (die Leiber: physik.K2#1) · ${((Date.now() - t0) / 1000).toFixed(1)} s in der Welt der Sitzung`);
    for (const k of new Set(Z.map((z) => z.koerper))) {
        const J = Z.filter((z) => z.koerper === k);
        const max = (f, Lz = J) => Math.max(...Lz.map(f)).toFixed(3);
        const B = J.filter((z) => z.bild).map((z) => z.bild);
        console.log(
            `      ${k.padEnd(10)} ${max((z) => z.v)} m/s · Durchtritt ${J.filter((z) => z.durch).length}/${J.length} · Eindringen max ${max((z) => z.tief)} m · Spalt max ${max((z) => z.spalt)} m` +
                (B.length ? ` · im Bild Spalt max ${max((b) => b.spalt, B)} m, Eindringen max ${max((b) => b.tief, B)} m` : "") +
                (J[0].rezept ? ` · ${J[0].rezept} vmax ${J[0].vmax} m/s × ${U.UEBER_VMAX}` : "")
        );
    }
    const S = T.schuss;
    if (S && S.png) fs.writeFileSync(tor.aus.replace(/\.json$/, "") + "-stoss.png", Buffer.from(S.png.split(",")[1], "base64"));
    if (S) console.log(`  Stoß im Ausgabe-Bild: ${S.fehler || `Wagen ${S.px.wagen} px · Bär ${S.px.gestossen} px in 640×360 · ${S.zeile}`}`);
    // die Zeilen, die die Kürzung selbst schuf (die Leiber fehlen), nennt die Probe nicht als Verstoß
    const gekuerzt = /ZEILE FEHLT: (fuchs|wolf|baer|riese|gehen|sprint|fall)\|/;
    for (const x of U.tempoUrteil(T)) if (!gekuerzt.test(x)) console.log("  " + x);
    fs.writeFileSync(tor.aus, JSON.stringify({ zeilen: Z, schmuggel: T.schmuggel, schuss: S ? { px: S.px, zeile: S.zeile, fehler: S.fehler } : null }));
}

// ───────── gelaende.K5#2 — EINE Boden-Höhe je Rolle (gate:koerper-stand K8 `rollen`) in beiden Sichten ─────────
// K8 an Mess-Wiese und 25°-Hang je Sicht (Ego, Third): Feinform, Streu, Huf je Größen-Band, Rad in Fahrt gegen die gezeichneten
// Dreiecke (`__gezeichnet`). Die Anker nehmen heraus, was die Station nicht urteilt: den Fuß des Spielers auf drei Bahnen (leib.K2)
// und den Sprung K9 (leib.K2 Staffel 2); die Sicht setzt der Anker wie die Mess-Kopie `k8Sichten` (`__sicht`). Danach steht die
// Welt wie vorher: Sicht, Lage, Dorf-Zug, Kreatur-Uhr, ohne die Mess-Treppe — Reh, Wagen und Treppe räumt die Linse selbst.
async function bodenRollen(tor) {
    const fs = require("fs");
    const L = "scripts/diag-koerper-stand.cjs";
    const n = new Function(tor.dekl(L, ["K8_UMFANG"]) + "\nreturn K8_UMFANG;")();
    const rollen = tor.quelle(L, "rollen", [
        ["async function rollen(n) {", "async function rollen(n, sicht) {"],
        ["const W = window.__messWiese;", "r.setCameraMode(sicht); o.__sicht = s.cameraMode; const W = window.__messWiese;"],
        ["R.fuss = bahn(", "R.fuss = 0 && bahn("],
        ["R.falllinie = bahn(", "R.falllinie = 0 && bahn("],
        ["R.stufe =", "R.stufe = 0 &&"],
        ['if (ort !== "wiese") continue;', "continue;"],
    ]);
    const page = await tor.seite();
    tor.karte();
    await page.evaluate("window.__gezeichnet = " + tor.quelle(L, "gezeichnet") + "; window.__eignerKarte = " + tor.quelle(L, "eignerKarte") + ";");
    const vor = await page.evaluate(() => {
        const s = window.anazhRealm.state;
        const p = s.playerMesh.position;
        return { sicht: s.cameraMode, dorf: window.__anazhAutoSettlement, treppe: !!(s.blueprints && s.blueprints.messtreppe), uhr: s.creatureAnimationTime, p: [p.x, p.y, p.z] };
    });
    const erg = {};
    try {
        // die Mess-Wiese in IHREM Zustand wie die Linse (haushalt.json `dorfZug`): kein Auto-Dorf wächst an Wiese und Hang
        await page.evaluate(() => (window.__anazhAutoSettlement = false));
        for (const sicht of ["first", "third"]) {
            const t = Date.now();
            try {
                const k8 = await page.evaluate("(" + rollen + ")(" + n + ", " + JSON.stringify(sicht) + ")");
                erg[sicht] = { exit: 0, k8 };
                const z = (o) => (o ? ["fein", "streu", "huf", "rad"].map((k) => k + " " + (o[k] ? o[k].p95 + "/" + o[k].n : "?")).join(" · ") : "fehlt");
                console.log("== SICHT " + sicht + " (" + ((Date.now() - t) / 1000).toFixed(1) + " s): wiese " + z(k8.wiese) + " | hang " + z(k8.hang) + " (p95 cm / Kontakte)");
            } catch (e) {
                erg[sicht] = { exit: 1, k8: null, fehler: String((e && e.message) || e).split("\n")[0] };
                console.log("== SICHT " + sicht + " FEHLER " + erg[sicht].fehler);
            }
        }
    } finally {
        await page.evaluate((v) => {
            const r = window.anazhRealm;
            const s = r.state;
            if (v.dorf === undefined) delete window.__anazhAutoSettlement;
            else window.__anazhAutoSettlement = v.dorf;
            if (!v.treppe && s.blueprints) delete s.blueprints.messtreppe;
            if (v.uhr !== undefined) s.creatureAnimationTime = v.uhr;
            if (s.cameraMode !== v.sicht) r.setCameraMode(v.sicht);
            s.playerMesh.position.set(v.p[0], v.p[1], v.p[2]);
            s._fixedSimPos = null;
            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
        }, vor);
    }
    fs.writeFileSync(tor.aus, JSON.stringify(erg));
}

// ───────── tiere.K5#1 — Begegnung im Bild (`werkbank lauf --wandern kreis`) im Zeitraffer ─────────
// Der Kreis der Werkbank (`lauf`, seine Seiten-Funktion aus dem Spiel-Baum, ohne die Spur der Route) zählt 600 SPIEL-s (die
// Uhr `st.spielZeit`, „je 10 Spielminuten“), je Sicht an der Mess-Wiese, 1280×720, Bestand des Spiels. Der ZEITRAFFER an der
// Schleife (`renderer.setAnimationLoop`) fährt je Bild n Takte zu TAKT_DECKEL_S (0,1 s): 600 Spiel-s in Sekunden statt in
// 10 min; die Schüsse halten die Welt wie im Lauf (`kreis.halt`), die Sichtung ist dieselbe (Klassen-Maske tier ≥ 200 px am Maß
// 1280×720, `imBlick`). Was der Raffer gröber macht, macht das Urteil strenger: die Prüfung je 250 ms Wanduhr liegt n-mal weiter in
// der Spiel-Zeit (weniger Schuss-Gelegenheiten). Die Bild-Zeiten dieser Probe sind keine Kadenz (der Strom urteilt sie nicht).
// DER GRUND DES RISSES BEIM NAMEN (w4-fehlt-acht; Radeon riss in jeder Fahrt am 90/99-s-Deckel): die Sichtung. Jedes Schuss-Paar sind
// drei Aufnahmen des Ausgabe-Pfads (G, G2, O) zu je 33 Bildern bei 1280×720, und der Kreis schoss, solange ein ungesehenes Tier im
// Blick stand — 28 und 21 Paare an 3ed96b3f (Radeon, eigener Boot), die Welt steht derweil. DER SCHNITT: die Sichtung zählt bis zur
// Staffel (`STAFFEL` 3 Sichtungen je Sicht), danach schießt der Kreis nie mehr und wacht bis 600 Spiel-s über das Schlupfloch (`imBlick`
// zählt jeden Takt der Prüfung weiter) — das Urteil (≥ 3, im Blick 0, 600 Spiel-s, die Sicht) fällt gleich; nur die Zahl der Sichtungen
// über drei fällt weg. Der Anker `__kreis` legt den Kreis an die Seite: alle 10 s eine Zeile FORTSCHRITT (Spiel-s, Wanduhr, Schüsse,
// Sichtungen; nie am Anfang `KREIS-`, die Zeile des Urteils) — reißt der Deckel, nennt die letzte, wo der Kreis stand.
async function tierKreis(tor) {
    const n = 10;
    const STAFFEL = 3;
    const lauf = tor.quelle("scripts/werkbank.cjs", "lauf", [
        ['const kreis = k.wandern === "kreis" ? { gier: st.yaw, gesehen: new Map(), schuesse: 0, imBlick: 0, max: 0 } : null;',
            'const kreis = k.wandern === "kreis" ? { gier: st.yaw, gesehen: new Map(), schuesse: 0, imBlick: 0, max: 0 } : null;\n        window.__kreis = kreis;'],
        ["if (!kand.some((q) => q.neu)) continue;", "if (!kand.some((q) => q.neu) || kreis.gesehen.size >= " + STAFFEL + ") continue;"],
    ]);
    const page = await tor.seite();
    tor.karte();
    await page.evaluate((n) => {
        const r = window.anazhRealm;
        const rend = r.state.renderer;
        const Z = window.__zeitraffer || (window.__zeitraffer = { n: 0, roh: null });
        Z.n = n;
        Z.ms = 1000 * r.constructor.TAKT_DECKEL_S;
        if (Z.roh) return;
        Z.roh = rend.setAnimationLoop;
        Z.huelle = rend.setAnimationLoop = function (cb) {
            if (typeof cb !== "function") return Z.roh.call(this, cb);
            let ts = null;
            return Z.roh.call(this, function (t, x) {
                if (!Z.n) return cb.call(this, t, x);
                if (ts === null) ts = t;
                for (let i = 0; i < Z.n; i++) cb.call(this, (ts += Z.ms), x);
            });
        };
        return 1;
    }, n);
    await tor.ruf("/fenster", { w: 1280, h: 720 });
    try {
        for (const sicht of ["ego", "third"]) {
            await tor.ruf("/umstellen", { ort: "wiese", sicht }, 120000);
            const t = Date.now();
            let o = null;
            let f = "";
            const zeile = setInterval(() => {
                page.evaluate(() => {
                    const k = window.__kreis;
                    return k && k.z0 != null ? { spielS: Math.round(window.anazhRealm.state.spielZeit - k.z0), schuesse: k.schuesse, gesehen: k.gesehen.size, imBlick: k.imBlick } : null;
                }).then((z) => z && console.log("FORTSCHRITT des Kreises " + sicht + " nach " + ((Date.now() - t) / 1000).toFixed(1) + " s Wanduhr: " + JSON.stringify(z)), () => {});
            }, 10000);
            try {
                o = await page.evaluate("(" + lauf + ")(" + JSON.stringify({ sek: 600, ein: 1, ruhe: 0, regler: "frei", tiere: "frei", wandern: "kreis", spur: false }) + ")");
            } catch (e) {
                f = " FEHLER " + String((e && e.message) || e).split("\n")[0];
            } finally {
                clearInterval(zeile);
                await page.evaluate(() => delete window.__kreis).catch(() => {});
            }
            const k = o && o.kreis;
            console.log("KREIS-" + sicht + " EXIT=" + (k ? 0 : 1) + " (" + ((Date.now() - t) / 1000).toFixed(1) + " s Wanduhr, Zeitraffer " + n + " Takte je Bild" + f + ") " + JSON.stringify(k || {}));
        }
    } finally {
        // der Raffer fällt: liegt kein fremder Haken über ihm, steht die Schleife des Renderers wieder wie vorher
        await page.evaluate(() => {
            const Z = window.__zeitraffer;
            const rend = window.anazhRealm.state.renderer;
            if (!Z) return 1;
            Z.n = 0;
            if (rend.setAnimationLoop === Z.huelle) (rend.setAnimationLoop = Z.roh), delete window.__zeitraffer;
            return 1;
        });
        await tor.ruf("/fenster", { w: 1920, h: 1080 });
    }
}

// ───────── streaming.K3#1 — der Sprung um 1 km hält die Kadenz (`werkbank haenger --wandern sprung`) ─────────
// In der warmen Welt: Wiese, Ego, Dorf-Zug aus, dann DREI Sprünge der Hänger-Linse der Werkbank (`/haenger`, ihre Kadenz bis die
// Welt am Ziel steht + 1 s) — jeder 1 km weiter auf +x, also jeder in eine Welt, die dort noch nicht steht (der Median aus 3 wie
// früher aus 3 Sitzungen); Einschwingen 1 s (die Welt steht schon). Danach der Dorf-Zug wie vorher.
async function sprungKadenz(tor) {
    const fs = require("fs");
    const B = tor.aus.replace(/\.json$/, "");
    tor.karte();
    const vor = (await tor.ruf("/eval", { code: "const v = window.__anazhAutoSettlement; window.__anazhAutoSettlement = false; return v === undefined ? null : v;" })).ergebnis;
    try {
        await tor.ruf("/fenster", { w: 1920, h: 1080 });
        await tor.ruf("/umstellen", { ort: "wiese", sicht: "ego" }, 120000);
        for (let n = 1; n <= 3; n++) {
            const datei = B + "-b" + n + "-sprung.json";
            let e = 0;
            try {
                await tor.ruf("/haenger", { ein: 1, regler: "frei", tiere: "frei", wandern: "sprung", schwelle: 50, json: datei }, 180000);
            } catch (x) {
                e = 1;
                console.log("  Sprung " + n + ": " + x.message);
            }
            let s = {};
            try {
                const j = JSON.parse(fs.readFileSync(datei, "utf8"));
                const p = j.sprung;
                s = { m: p.m, stehtS: p.stehtS && +((p.stehtS - p.t0) / 1000).toFixed(1), bau: p.bau[1].sonst - p.bau[0].sonst, frames: j.frames, frameMs: j.frameMs, taktMs: j.taktMs, profil: j.profil, ursachen: j.jeUrsache.slice(0, 3).map((u) => u.ursache + " x" + u.n) };
            } catch (_e) {
                s = {};
            }
            console.log("SPRUNG " + n + " EXIT=" + e + " " + JSON.stringify(s));
        }
    } finally {
        await tor.ruf("/eval", { code: "const v = " + JSON.stringify(vor) + "; if (v === null) delete window.__anazhAutoSettlement; else window.__anazhAutoSettlement = v; return 1;" });
    }
}

// ───────── streaming.K4#2 — kein stiller Ersatz im Haupt-Faden (gate:worker-dichte `--faden --echt`) ─────────
// Die Haken der Linse (`fadenSeite`: woher jede Hydrosphäre und jedes Stau-Feld kommt, die Bytes je Faden) sitzen vor dem ersten
// Skript der Seite — darum lädt diese Probe die Welt EINMAL neu, kalt wie die Linse (Abbild und Platten geräumt, dann `/reload` der
// Werkbank). Gang und Fahrt im Takt der Linse (30 Takte je s), gekürzt: der Gang springt 240 m nach Norden (Teleport statt 2 min
// Laufen) und geht dort 3 s (2 m/s), die Fahrt fährt 10 s bei 16 m/s nach Osten (160 m) mit sechs echten Bau-Klicks, dann der
// Damm des Verbs am Fluss der Mess-Wiese. Der Zähler des Spiels (`_syncBauten`) zählt ab dem Boot. Die Zeilen sind die der Linse.
async function fadenZaehler(tor) {
    const path = require("path");
    const L = "scripts/diag-worker-dichte.cjs";
    const seiteQ = tor.quelle(L, "fadenSeite");
    const bytesQ = tor.quelle(L, "klonBytes");
    const huelleQ = tor.quelle(L, "fadenHuelle");
    const soll = new Function(tor.dekl(L, ["FADEN_SOLL"]) + "\nreturn FADEN_SOLL;")();
    const { WASSER_INSTALL } = require(path.resolve("scripts/lib/wasser-linse.cjs"));
    const page = await tor.seite();
    tor.karte();
    const haken = await page.evaluateOnNewDocument("(" + seiteQ + ")(" + JSON.stringify(bytesQ) + ", " + JSON.stringify(huelleQ) + ");");
    const ursprung = await page.evaluate(() => location.origin);
    await page.goto(ursprung + "/cores.manifest.json", { timeout: 60000 });
    await page.evaluate(() =>
        Promise.all(
            ["anazhChunkMesh", "anazhFoundryAssets"].map((n) => new Promise((ok) => Object.assign(indexedDB.deleteDatabase(n), { onsuccess: ok, onerror: ok })))
        ).then(() => localStorage.clear())
    );
    await tor.ruf("/reload", {}, 300000);
    await page.removeScriptToEvaluateOnNewDocument(haken.identifier); // die Haken gelten DIESER Welt, keiner späteren
    const takt = (n, dx, dz, klicks) =>
        page.evaluate(
            async (n, dx, dz, klicks) => {
                await window.__weltDa(() => r && typeof r._gameLoopTick === "function");
                const p = r.state.playerMesh.position;
                if (!n)
                    for (const weiter = window.__deckel("die Welt steht", 4000); weiter(); ) {
                        if (r.state.voxelChunks && r.state.voxelChunks.size > 20 && r.state.voxelWorkerReady) break;
                        await window.__seitenTakt();
                    }
                r.state.pitch = -Math.PI / 2; // der Blick senkrecht nach unten: ein Bau-Klick setzt den Block unter den Spieler
                const je = klicks ? Math.floor(n / klicks) : 0;
                for (let k = 0, t; k < n; k++) {
                    await window.__seitenTakt();
                    p.x += dx / n;
                    p.z -= dz / n;
                    const y = r._voxelSurfaceY(p.x, p.z);
                    if (Number.isFinite(y)) p.y = y + 1.8;
                    if (je && k % je === je >> 1 && ((t = performance.now()), r.tryMousePlace())) window.__faden.klick.push(performance.now() - t);
                }
                return n ? (n / 30) * 1000 : performance.now();
            },
            n,
            dx,
            dz,
            klicks
        );
    const fenster = (name) => page.evaluate((n) => (window.__faden.fenster = n), name);
    const dauer = { boot: await takt(0, 0, 0, 0) };
    await fenster("gang");
    await page.evaluate(() => {
        const p = r.state.playerMesh.position;
        p.z -= 240;
        const y = r._voxelSurfaceY(p.x, p.z);
        if (Number.isFinite(y)) p.y = y + 1.8;
    });
    dauer.gang = await takt(90, 0, 6, 0);
    await fenster("fahrt");
    dauer.fahrt = await takt(300, 160, 0, 6);
    await page.evaluate(WASSER_INSTALL);
    await fenster("damm");
    await page.evaluate(async () => window.__wasserDamm({ fluss: (await window.__wasserOrte({})).fluss }));
    const F = await page.evaluate(() => JSON.parse(JSON.stringify({ ...window.__faden, bau: r._syncBauten() })));
    const mb = (b) => (b / 1e6).toFixed(2);
    const summe = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
    const proMin = {};
    console.log("\n=== DER FADEN TRÄGT DIE BYTES (K4 · K5), in der Welt der Sitzung ===");
    for (const w of Object.keys(dauer)) {
        const T = F.t[w] || {};
        const teile = [["Faden → Main", T.empfang], ["Main → Faden", T.gesendet], ["Kopie", T.kopie], ["Platte", T.platte]];
        proMin[w] = (teile.reduce((a, [, o]) => a + summe(o), 0) / dauer[w]) * 60000;
        console.log(`  ${w.padEnd(6)} ${(dauer[w] / 1000).toFixed(1)} s · ${mb(proMin[w])} MB/min am Empfang: ${teile.map(([nm, o]) => `${nm} ${mb(summe(o))} MB`).join(" · ")}`);
    }
    console.log(`  Fäden: ${F.faeden.join(" · ")}`);
    const stauTakt = `Takt ${F.stau.ms.toFixed(1)} ms`;
    if (F.stau.ms > 8) F.stau.rot.push(stauTakt);
    for (const [name, Zh] of [["Hydrosphären", F.hydro], [`Stau-Felder (Damm, ${stauTakt})`, F.stau]])
        console.log(`  ${name}: ${Zh.faden} aus dem Faden · ${Zh.rot.length} im Haupt-Faden${Zh.rot.length ? " — " + Zh.rot.join(" | ") : ""}`);
    console.log(
        `  Bauten im Haupt-Faden (Chunk-Stoff, Guss): ${summe(F.bau.stellen)} an Sync-Stellen und Test-Nähten · ${F.bau.sonst} sonst ${JSON.stringify(F.bau.stellen)}${F.bau.rot.length ? " — " + F.bau.rot.slice(0, 6).join(" | ") : ""}`
    );
    const k4 = F.hydro.rot.concat(F.stau.rot, F.bau.rot).reduce((a, x) => a + (parseInt(x) || 1), 0);
    console.log(`  Bau-Klicks in der Fahrt: ${F.klick.length}, die Hand ${F.klick.map((m) => m.toFixed(1)).join(" · ")} ms`);
    const blind =
        F.blind ||
        (!F.haken && "die Haken sitzen nicht") ||
        (F.bau.voll && "das Buch ist voll") ||
        (!F.hydro.faden && !F.hydro.rot.length && "keine Hydrosphäre gesehen") ||
        (!summe((F.t.fahrt || {}).empfang) && "kein Empfang in der Fahrt") ||
        (F.klick.length < 6 && "die Bau-Klicks der Fahrt bauten nicht") ||
        (!F.stau.faden && "kein Feld des Staus aus dem Faden");
    if (blind) console.log(`  ⛔ BLIND: ${blind}`);
    if (k4) console.log(`  ⛔ K4: ${k4} synchrone Bauten im Haupt-Faden, obwohl ein Faden zuständig ist`);
    if (proMin.fahrt > soll) console.log(`  ⛔ K5: ${mb(proMin.fahrt)} MB/min am Empfang in der Fahrt > ${mb(soll)}`);
    if (blind || k4) process.exitCode = 1;
}

// ───────── fahrzeug.K5#1 — die Rückmeldung (gate:fahr-leben `--rueckmeldung`) und der Motor am Klang-Abgriff (gate:klang-zensus F) ─────────
// RM: die Seiten-Probe des Gates (`probeLeben` mit `nurRueck`, scripts/lib/fahr-proben.cjs) — Glatt, Drift, Hang je 240 Bilder,
// dazu die Mutante; das Urteil `rueckBericht` der Linse. (F) Motor: `koerperSeite` der Klang-Linse, die Anker lassen Landung und
// Doppler (klang.K4) aus — der GT im Sattel, je Drehzahl EIN Klang-Takt am OfflineAudioContext, `koerperUrteil` der Linse.
// Die Linse stubbt das Pad der Seite (`navigator.getGamepads`): die Probe nimmt den Stub danach weg.
async function fahrRueck(tor) {
    const fs = require("fs");
    const path = require("path");
    const L = "scripts/diag-fahr-leben.cjs";
    const P = "scripts/lib/fahr-proben.cjs";
    const KZ = "scripts/diag-klang-zensus.cjs";
    console.log("@@PUNKTE@@ RM");
    if (!/expected\.nurRueck/.test(fs.readFileSync(P, "utf8"))) {
        console.log("keine Zeile RUECKMELDUNG: probeLeben kennt nurRueck nicht (gate:fahr-leben --rueckmeldung fehlt am Stand)");
        console.log("@@PUNKTE@@ EXIT 1");
        process.exitCode = 1;
        return;
    }
    const check = (name, ok, detail) => {
        const z = typeof detail === "object" && detail ? JSON.stringify(detail) : detail;
        console.log(`  ${ok ? "✅" : "❌"} ${name}${z ? " — " + z : ""}`);
    };
    const d = new Function("check", tor.dekl(L, ["RUECK", "taktHz", "rueckMass", "rueckVerdict", "rueckBericht"]) + "\nreturn { RUECK, taktHz, rueckBericht };")(check);
    const koerperUrteil = new Function(tor.dekl(KZ, ["koerperUrteil"]) + "\nreturn koerperUrteil;")();
    const koerper = tor.quelle(KZ, "koerperSeite", [
        ['if (!mut || mut === "landung") {', 'if (mut === "landung") {'],
        ['if (!mut || mut === "doppler") {', 'if (mut === "doppler") {'],
    ]);
    const werkzeug = tor.quelle(KZ, "werkzeug");
    const F = require(path.resolve(P));
    const mo = require(path.resolve("scripts/lib/band-urteil.cjs")).ladeSpec("wiese").ort.spieler;
    const MESS = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const page = await tor.seite();
    tor.karte();
    await page.evaluate(require(path.resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL);
    await page.evaluate(`window.__tempoSpion = ${F.tempoSpion}; window.__taktHz = ${d.taktHz}; window.__ruckJeBild = ${F.ruckJeBild};`);
    let o = null;
    const t0 = Date.now();
    try {
        o = await page.evaluate(F.probeLeben, { messort: mo, nurRueck: true, rueck: d.RUECK });
    } finally {
        await page.evaluate(() => delete navigator.getGamepads);
    }
    d.rueckBericht(o.rueck || o);
    console.log("  (RM " + ((Date.now() - t0) / 1000).toFixed(1) + " s in der Welt der Sitzung)");
    console.log("@@PUNKTE@@ EXIT 0");
    console.log("@@PUNKTE@@ KLANG");
    const t1 = Date.now();
    await page.evaluate("window.__klangW = (" + werkzeug + ")();");
    await page.evaluate(() => (window.anazhRealm.state.symphony || window.anazhRealm.initSymphony(), 1));
    const Fm = await page.evaluate("(" + koerper + ")(" + JSON.stringify(MESS) + ", null)");
    const fu = koerperUrteil(Fm);
    console.log(`── (F) DER KÖRPER KLINGT: ${fu.zahl}`);
    for (const x of fu.rot) console.log("  ❌ " + x);
    console.log("  (Motor " + ((Date.now() - t1) / 1000).toFixed(1) + " s, " + Fm.motor.length + " Stufen; Landung und Doppler misst klang.K4)");
    console.log("@@PUNKTE@@ EXIT " + (fu.rot.length ? 1 : 0));
}

// ───────── fahrzeug.K2#1 — die Fahrt auf dem Wegenetz (gate:fahr-leben `--wegenetz`) ─────────
// Die Seiten-Probe des Gates (`probeLeben` mit `wegenetz`): die Orte erwachen am Spieler (der Dorf-Zug an, wie das Gate vor dem
// Boot), der GT fährt die feste Route mit dem Fahrer am Steuer in den Bildern der Probe; `wegenetzVerdict` der Linse. Kennt der
// Stand die Fahrt nicht, endet die Probe sofort ROT beim Namen (nie die volle Leben-Probe als Ersatz).
async function fahrWegenetz(tor) {
    const fs = require("fs");
    const path = require("path");
    const L = "scripts/diag-fahr-leben.cjs";
    const P = "scripts/lib/fahr-proben.cjs";
    if (!/expected\.wegenetz/.test(fs.readFileSync(P, "utf8")) || !/wegenetzVerdict/.test(fs.readFileSync(L, "utf8"))) {
        console.log("keine WEGENETZ-Zeile: probeLeben kennt die Fahrt auf dem Wegenetz nicht (gate:fahr-leben --wegenetz fehlt am Stand)");
        process.exitCode = 1;
        return;
    }
    const d = new Function(tor.dekl(L, ["WEGENETZ", "wegenetzVerdict", "taktHz"]) + "\nreturn { WEGENETZ, wegenetzVerdict, taktHz };")();
    const F = require(path.resolve(P));
    const mo = require(path.resolve("scripts/lib/band-urteil.cjs")).ladeSpec("wiese").ort.spieler;
    const page = await tor.seite();
    tor.karte();
    await page.evaluate(require(path.resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL);
    await page.evaluate(`window.__tempoSpion = ${F.tempoSpion}; window.__taktHz = ${d.taktHz}; window.__ruckJeBild = ${F.ruckJeBild};`);
    await page.evaluate(() => (window.__anazhAutoSettlement = true));
    const t0 = Date.now();
    const o = await page.evaluate(F.probeLeben, { messort: mo, wegenetz: { ...d.WEGENETZ, mutante: false, gleich: false } });
    const v = o.wegenetz ? d.wegenetzVerdict(o.wegenetz) : [String(o.err || "keine Fahrt").split("\n")[0]];
    console.log(`  ${v.length ? "❌" : "✅"} WN (fahrzeug.K2) die Fahrt auf dem Wegenetz — ${v.join(" · ") || "auf dem Netz"} · ${((Date.now() - t0) / 1000).toFixed(1)} s in der Welt der Sitzung`);
    console.log(`WEGENETZ ${JSON.stringify(o.wegenetz)}`);
    if (v.length) process.exitCode = 1;
}

// ───────── PFLICHT-OFFEN C — der Verkehr der Stadt (gate:fahr-leben `--verkehr`) ─────────
// Die Seiten-Probe des Gates (`probeLeben` mit `verkehr`): die Metropole des Messorts stadt-voll (nH 300; gegründet in der Welt
// der Sitzung, wo sie nicht steht), um 10 und um 23 Uhr je `sek` Sekunden (das Argument, sonst 12) im Takt des Spiels — jeder
// Wagen des Gesetzes mit seinem Fahrer am Steuer, keiner steckt, keiner berührt einen Bewohner, einen Wagen oder einen Bau;
// `verkehrVerdict` der Linse (der Weg je Wagen am Maß von `sek`). Kennt der Stand den Verkehr nicht, ROT beim Namen in Sekunden.
// Die Stadt erwacht, die Uhr springt: mutiert. Headless an w3w-verkehr fcfd85d7 (gate:fahr-leben --verkehr, 2 × 40 s, 122 s
// Wanduhr samt Boot und Stadt): 10 Uhr 20/20 Wagen, Weg min 93 m, Sim-Takt 0,924 ms; 23 Uhr 20/20, min 110 m, 0,765 ms; 0
// Berührungen. C trägt kein Kriterium der Karte (die Karte setzt keinen Pflicht-Eintrag): die Probe steht, registriert wird sie
// am Kriterium, das der Schöpfer C gibt.
async function fahrVerkehr(tor) {
    const fs = require("fs");
    const path = require("path");
    const L = "scripts/diag-fahr-leben.cjs";
    const P = "scripts/lib/fahr-proben.cjs";
    if (!/expected\.verkehr/.test(fs.readFileSync(P, "utf8")) || !/verkehrVerdict/.test(fs.readFileSync(L, "utf8"))) {
        console.log("keine VERKEHR-Zeile: probeLeben kennt den Verkehr der Stadt nicht (gate:fahr-leben --verkehr fehlt am Stand)");
        process.exitCode = 1;
        return;
    }
    const d = new Function(tor.dekl(L, ["VERKEHR", "verkehrVerdict", "taktHz"]) + "\nreturn { VERKEHR, verkehrVerdict, taktHz };")();
    const F = require(path.resolve(P));
    const mo = require(path.resolve("scripts/lib/band-urteil.cjs")).ladeSpec("wiese").ort.spieler;
    const page = await tor.seite();
    tor.karte();
    await page.evaluate(`window.__tempoSpion = ${F.tempoSpion}; window.__taktHz = ${d.taktHz}; window.__ruckJeBild = ${F.ruckJeBild};`);
    const t0 = Date.now();
    const sek = Number(tor.arg[0]) || 12;
    const o = await page.evaluate(F.probeLeben, { messort: mo, verkehr: { ...d.VERKEHR, sek } });
    for (const h of d.VERKEHR.stunden) {
        const m = o.verkehr && o.verkehr[h];
        const v = m ? d.verkehrVerdict(m) : [String(o.err || "kein Verkehr").split("\n")[0]];
        console.log(`  ${v.length ? "❌" : "✅"} VK (PFLICHT-OFFEN C) der Verkehr der Stadt um ${h} Uhr — ${v.join(" · ") || "jeder fährt"}`);
        if (v.length) process.exitCode = 1;
    }
    console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)} s in der Welt der Sitzung, ${sek} s je Stunde)`);
    console.log(`VERKEHR ${JSON.stringify(o.verkehr)}`);
}

// ───────── gelaende.K2#1 und #2 — das Wasser folgt jedem Edit: Graben (Third, Ego), Damm, Ferne ─────────
// EINE Probe für beide Staffeln (Zwillinge: derselbe Befehl, die Sitzung fährt ihn einmal). (a) der Graben über die ECHTE Eingabe
// wie die Mess-Bahn m2-graben (koordination bericht/2210-messschuld-6cfce/skripte): am Fluss nächst Genesis, der Spieler 2,2 m
// landeinwärts (Ego: um den Punkt gedreht, bis die Abnahme des Blicks frei ist und das Fadenkreuz den Boden trifft), das
// Fadenkreuz auf dem Punkt (zielen.js der Bahn), CDP-Klick → Verb graben, der Spiel-Loop läuft; je präsentiertem Bild die
// gezeichneten Wasser-Flächen über ±4,5 m, 3 s lang (gefüllt = 90 % des Stands nach 3 s, Soll ≤ 2 s); je Graben das Bild 2 s
// nach dem Klick aus dem Ausgabe-Pfad. Third an zwei Saaten (je 1 m und 3 m), Ego an einer dritten — nie zweimal am selben Punkt.
// Dann (d) die Ferne und (b) der Damm aus dem Verb über die Wasser-Linse (`__wasserDamm`, wie gate:wasser-leben) am Fluss der
// Mess-Wiese — zuletzt: der Strom der Linse legt den Bild-Renderer still. Die Probe gräbt und schüttet: mutiert.
async function wasserGraben(tor) {
    const fs = require("fs");
    const path = require("path");
    const KOORD = tor.arg[0];
    const B = tor.aus.replace(/\.json$/, "");
    const { WASSER_INSTALL } = require(path.resolve("scripts/lib/wasser-linse.cjs"));
    const zielen = fs.readFileSync(path.join(KOORD, "bericht", "2210-messschuld-6cfce", "skripte", "zielen.js"), "utf8");
    const page = await tor.seite();
    tor.karte();
    const cdp = await page.target().createCDPSession();
    const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
    const erg = { third: null, ego: null, damm: null, ferne: null };
    await page.evaluate(WASSER_INSTALL);
    await page.evaluate(zielen);
    const [mx, my] = await page.evaluate(() => [Math.round(innerWidth / 2), Math.round(innerHeight / 2)]);
    const klick = async () => {
        for (const type of ["mousePressed", "mouseReleased"]) await cdp.send("Input.dispatchMouseEvent", { type, x: mx, y: my, button: "left", clickCount: 1 });
    };
    // die Ufer-Punkte am Fluss nächst Genesis (die Saaten der Bahn: je ein Punkt des Laufs, nie im See)
    const SAATEN = [11, 23, 37, 51, 73];
    const punkte = await page.evaluate((saaten) => {
        const r = window.anazhRealm;
        const g = typeof r._genesisMitte === "function" ? r._genesisMitte() : r.state.playerMesh.position;
        const fn = window.__wasserFlussNah(r, g.x, g.z);
        if (!fn.p) return { fehler: "kein Fluss nächst Genesis" };
        const rv = fn.fluesse.find((f) => f.points.includes(fn.p));
        const k0 = rv.points.indexOf(fn.p);
        return saaten.map((s, i) => {
            let x = (s * 2654435761) >>> 0;
            x ^= x >>> 13;
            let k = k0 + (i - 2) * 9 + ((x % 5) - 2);
            if (k < 1) k = 1 + (1 - k) + 40;
            if (k > rv.points.length - 2) k = rv.points.length - 2 - (k - rv.points.length) - 40;
            k = Math.max(1, Math.min(rv.points.length - 2, k));
            const a = rv.points[k];
            return { saat: s, k, a: { x: a.x, z: a.z }, seite: x & 1 ? 1 : -1 };
        });
    }, SAATEN);
    if (punkte.fehler) throw new Error(punkte.fehler);
    const graben = async (P, abstand, sicht) => {
        const g = await page.evaluate(
            async (P, abstand, sicht) => {
                const r = window.anazhRealm;
                const st = r.state;
                const { p: q, vor: b } = window.__wasserFlussNah(r, P.a.x, P.a.z);
                const nl = Math.hypot(q.x - b.x, q.z - b.z) || 1;
                const nx = (-(q.z - b.z) / nl) * P.seite;
                const nz = ((q.x - b.x) / nl) * P.seite;
                const krone = window.__wasserKroneVon(r, q);
                const px = q.x + nx * (krone + abstand);
                const pz = q.z + nz * (krone + abstand);
                const stellen = (w) => {
                    const c = Math.cos((w * Math.PI) / 180);
                    const s = Math.sin((w * Math.PI) / 180);
                    const sx = px + (nx * c - nz * s) * 2.2;
                    const sz = pz + (nx * s + nz * c) * 2.2;
                    st.playerMesh.position.set(sx, r._voxelSurfaceY(sx, sz) + 1.8, sz);
                    if (st._fixedSimPos) st._fixedSimPos.copy(st.playerMesh.position);
                    return [+sx.toFixed(2), +sz.toFixed(2)];
                };
                let spieler = stellen(0);
                if (st.cameraMode !== sicht) r.setCameraMode(sicht);
                // DIE WELT STEHT am Graben: das EINE Einschwingen (`__weltStehtNach` hält den Regler, solange sie schwingt — ein atmender
                // Regler weckt die Takte ohne Ende), sein Deckel beim Namen. Bis 30.10. eine eigene Schleife ohne gehaltenen Regler und
                // mit stiller 30-s-Frist: auch nach 2 m Weg 119–151 Takte (Radeon 379e5f56)
                const takte = await window.__weltStehtNach();
                window.__gp = { px, pz };
                const ziel = () => window.__zielen({ x: px, y: r._voxelSurfaceY(px, pz), z: pz });
                await ziel();
                const o = { px: +px.toFixed(2), pz: +pz.toFixed(2), krone: +krone.toFixed(2), sicht, takte };
                if (sicht !== "first") return Object.assign(o, { spieler });
                const stand = [];
                for (const w of [0, 15, -15, 30, -30, 45, -45, 60, -60, 90, -90]) {
                    if (w) (spieler = stellen(w)), await ziel();
                    const rot = window.__abnahmeUrteil(window.__abnahmeMessen({})).rot.filter((u) => !u.feld.startsWith("bild."));
                    const bau = r._pickArchitectureAtCrosshair();
                    if (bau && bau.entry) rot.push({ grund: "Bauwerk am Fadenkreuz " + (bau.entry.type || bau.entry.id) });
                    if (r._ernteZiel()) rot.push({ grund: "Blüte am Fadenkreuz" });
                    stand.push({ w, rot: rot.map((u) => u.grund) });
                    if (!rot.length) break;
                }
                if (stand[stand.length - 1].rot.length && stand.length > 1) (spieler = stellen(0)), await ziel();
                return Object.assign(o, { spieler, stand });
            },
            P,
            abstand,
            sicht
        );
        // der Zeiger gefangen wie beim Spieler, ehe die Spur auf den Klick wartet (sein Klick ist kein Graben-Klick)
        if (!(await page.evaluate(() => window.anazhRealm.state.isPointerLocked))) (await page.bringToFront(), await klick(), await warte(400));
        // je präsentiertem Bild die gezeichneten Wasser-Flächen über ±4,5 m (je Netz die oberste, wie wasser-linse `wasserGraben`)
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const span = r._voxelChunkConfig(0).span;
            const G = window.__gp;
            const flaechen = (x, z) => {
                const ys = [];
                for (let dz = -1; dz <= 1; dz++)
                    for (let dx = -1; dx <= 1; dx++) {
                        const n = r._wasserNetz(Math.floor(x / span) + dx, Math.floor(z / span) + dz);
                        const y = n ? r.constructor._wasserNetzHoehe(n, x, z) : null;
                        if (y !== null) ys.push(y);
                    }
                return ys.sort((p, q) => p - q).filter((y, j, l) => !j || y - l[j - 1] > 0.1);
            };
            const messen = () => {
                const m = { nass: 0, doppelt: 0, ueber: 0, ueberM: 0 };
                for (let gz = -4.5; gz <= 4.5; gz += 0.5)
                    for (let gx = -4.5; gx <= 4.5; gx += 0.5) {
                        const x = G.px + gx;
                        const z = G.pz + gz;
                        const g = r._bodenSichtAt(x, z) ?? r._voxelSurfaceY(x, z);
                        const ys = flaechen(x, z).filter((y) => y > g + 0.1);
                        if (!ys.length) continue;
                        const atlas = r._atlasWaterLevelAt(x, z, g);
                        const Sp = atlas > -Infinity ? atlas : r._hydroSpiegelQuer(x, z);
                        const top = ys[ys.length - 1];
                        m.nass++;
                        if (ys.length > 1) m.doppelt++;
                        if (top > Sp + 0.1) (m.ueber++, (m.ueberM = Math.max(m.ueberM, +(top - Sp).toFixed(2))));
                    }
                return m;
            };
            window.__gSpur = [];
            window.__gT0 = null;
            window.__gVor = messen();
            window.addEventListener("mousedown", () => window.__gT0 == null && (window.__gT0 = performance.now()), { once: true, capture: true });
            // DAS ENDE DER SPUR ist ein Ereignis (`__gFertig`: das letzte Bild vor 3 s nach dem Klick), nie eine Uhr danach
            window.__gFertig = new Promise((fertig) => {
                const f = () => {
                    if (window.__gT0 != null && performance.now() - window.__gT0 < 3000) (window.__gSpur.push([+(performance.now() - window.__gT0).toFixed(1), messen()]), requestAnimationFrame(f));
                    else if (window.__gT0 == null) requestAnimationFrame(f);
                    else fertig(window.__gSpur.length);
                };
                requestAnimationFrame(f);
            });
        });
        await klick();
        await warte(2000);
        g.bild = [];
        const frei = !g.stand || !g.stand[g.stand.length - 1].rot.length;
        if (frei)
            try {
                const url = await page.evaluate(async () => {
                    const { u8 } = await window.__ausgabeAufnahme(960, 540);
                    return window.__png(u8, 960, 540);
                });
                fs.writeFileSync(B + "-" + (sicht === "first" ? "ego" : "third") + "-s" + P.saat + "-a" + abstand + "-2s.png", Buffer.from(url.split(",")[1], "base64"));
                g.bild.push("2s");
            } catch (e) {
                g.bildFehler = String((e && e.message) || e).split("\n")[0].slice(0, 200);
            }
        // die Spur endet 3 s nach dem Klick: auf ihr Ende warten (bis 30.10. 1,2 s Uhr nach dem Bild, das selbst Zeit trug); die
        // Frist 4 s fängt nur einen Klick, den kein mousedown erreichte — dann bleibt die Spur leer, ROT beim Namen (`leer`)
        await Promise.race([page.evaluate(() => window.__gFertig), warte(4000)]);
        const sp = await page.evaluate(() => ({ spur: window.__gSpur, vor: window.__gVor, verb: window.anazhRealm.state.player._mausVerb }));
        const end = sp.spur.length ? sp.spur[sp.spur.length - 1][1].nass : 0;
        const voll = sp.spur.find((x) => x[1].nass >= 0.9 * end && end > sp.vor.nass);
        const z = Object.assign({ saat: P.saat, abstand }, g, {
            verb: sp.verb,
            bilder: sp.spur.length,
            nassVor: sp.vor.nass,
            nassEnde: end,
            gefuelltMs: voll ? voll[0] : null,
            doppeltMax: Math.max(0, ...sp.spur.map((x) => x[1].doppelt)),
            ueberMax: Math.max(0, ...sp.spur.map((x) => x[1].ueber)),
            ueberMaxM: Math.max(0, ...sp.spur.map((x) => x[1].ueberM)),
        });
        console.log("  GRABEN " + JSON.stringify({ sicht, saat: z.saat, abstand, verb: z.verb, bild: z.bild.join("+"), nassVor: z.nassVor, nassEnde: z.nassEnde, gefuelltMs: z.gefuelltMs, doppeltMax: z.doppeltMax, ueberMax: z.ueberMax, bilder: z.bilder }));
        return z;
    };
    const t0 = Date.now();
    const sichtVor = await page.evaluate(() => (window.__loop(true), window.anazhRealm.state.cameraMode));
    // der Zeiger EINMAL vorab gefangen, ehe ein Fadenkreuz auf einem Graben-Punkt liegt
    await page.bringToFront();
    if (!(await page.evaluate(() => window.anazhRealm.state.isPointerLocked))) (await klick(), await warte(400));
    try {
        for (const [teil, sicht, idx] of [["third", "third", [0, 2]], ["ego", "first", [1]]]) {
            const liste = [];
            try {
                for (const i of idx) for (const abstand of [1, 3]) liste.push(await graben(punkte[i], abstand, sicht));
                erg[teil] = { graeben: liste };
            } catch (e) {
                erg[teil] = { graeben: liste, fehler: String((e && e.message) || e).split("\n")[0] };
                console.log("  " + teil + " FEHLER " + erg[teil].fehler);
            }
        }
    } finally {
        await page.evaluate((s) => (window.__loop(false), window.anazhRealm.setCameraMode(s), 1), sichtVor);
    }
    console.log("  (a) " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
    // (d) die Ferne, dann (b) der Damm: das Wort des Spielers „sonnig“, trocken (wie die Wand), der Fluss der Mess-Wiese
    const t1 = Date.now();
    await page.evaluate(() => (r._setWeather("sunny", "human"), r._naesseTakt(1e6), 1));
    const fluss = await page.evaluate(async () => (await window.__wasserOrte({})).fluss);
    for (const [teil, ferne] of [["ferne", true], ["damm", false]])
        try {
            erg[teil] = await page.evaluate((f, ferne) => window.__wasserDamm({ fluss: f, ferne }), fluss, ferne);
        } catch (e) {
            erg[teil] = { fehler: String((e && e.message) || e).split("\n")[0] };
        }
    console.log("  (b)(d) " + ((Date.now() - t1) / 1000).toFixed(1) + " s · Damm " + JSON.stringify(erg.damm) + " · Ferne " + JSON.stringify(erg.ferne));
    await cdp.detach().catch(() => {});
    fs.writeFileSync(tor.aus, JSON.stringify(erg, null, 1));
}

// ───────── wetter.K2#1 — die Nässe im Dorf (werkbank `licht --naesse dorf`, gate:naesse:echt) ─────────
// Die Seiten-Funktion der Linse (`naesseSicht`, scripts/lib/licht-linsen.cjs am SHA) über die Werkbank der Sitzung, nur das, was das
// Urteil liest: das Haus am Messort dorf (das nächste mit Hülle und Tür, seine Schwelle), der Spieler an der Schwelle, dann die Pose
// klar · Regen frisch · Regen 10 min — porös draußen, innen unter dem Dach, dicht, Regen innen. Der erste Ruf nennt den Messort, die
// Sitzung stellt ihn darum VOR dem Deckel (punkte.cjs `probeOrt`: das Wachsen des Dorfs ist der Ring des Orts, nie die Arbeit der
// Probe). Bis 30.10. fuhr die Probe den ganzen CLI-Lauf (Radeon 379e5f56, 44,6 s): das Dorf 19,5 s im Deckel, dazu die Dach-Bauten
// ohne Hülle — ein Gang an den Marktstand (13,1 s) und zurück an den Ort (2,3 s) für eine Zeile, die kein Urteil der Station liest
// (sie bleibt im CLI-Lauf der Linse). Die Welt danach trägt ein Dorf mehr (mutiert).
async function naesseDorf(tor) {
    const fs = require("fs");
    const sicht = tor.quelle("scripts/lib/licht-linsen.cjs", "naesseSicht");
    tor.karte();
    const lauf = async (o) => (await tor.ruf("/eval", { code: "return await (" + sicht + ")(" + JSON.stringify(o) + ");" }, 120000)).ergebnis;
    let dorf;
    try {
        await tor.ruf("/umstellen", { ort: "dorf", sicht: "ego" }, 300000);
        const s = (await lauf({ ort: "dorf", haus: true })).schwelle;
        await tor.ruf("/umstellen", { x: s[0], z: s[2] }, 300000);
        dorf = await lauf({ ort: "dorf" });
    } catch (e) {
        dorf = { fehler: String((e && e.message) || e).split("\n")[0].slice(0, 300) };
    }
    console.log(JSON.stringify({ dorf }, null, 1));
    fs.writeFileSync(tor.aus, JSON.stringify({ dorf }, null, 1));
}

// ───────── DIE LINSE DER WERKBANK IN DER WELT DER SITZUNG (licht.K1#1 · licht.K3#1/#2, w4-fehlt-acht) ─────────
// Der Befehl der Linse selbst (scripts/werkbank.cjs am SHA, Byte für Byte) gegen die Welt der Sitzung, ohne `--eigen`: sein Tor
// (welt-boot `werkbankTor`) bootete eine eigene Welt — `werkbank start` OHNE `--echt`, headless im Fenster 640×360 — und stand darum
// in SITZUNG_FEINDE. Die Probe stellt das Fenster der Station (`L.fenster`, wie das Tor es trug: die Messgröße bleibt die der
// Station) und schaltet zwischen Linse und Werkbank DEN SPIEGEL (WERKBANK_PORT + 2, im Band der Sitzung): jeder Ruf geht Byte für
// Byte durch, nur das Abwarten nicht — `/lauf` mit dem Einschwingen der Laub-Linse (`ein()`: 5 s Lauf, 8 s Einschwingen, Ruhe bis
// 120 s; je Zeile bis zu sechsmal) ist DIE BERUHIGUNG beim Namen: die Bühne wie der Lauf (Mittag · Sonne · Sommer, `__buehne`), dann
// Takt um Takt, bis die Welt steht (`__weltStehtNach`, A9 — die EINE Ruhe: Foundry, Chunks, Wald, Karten, Felder, Leiber). `L.vorher`:
// der Messort der Linse (`umstellen --ort X`, die Sitzung stellt ihn VOR dem Deckel: punkte.cjs `probeOrt`); `L.seite`: Seiten-
// Funktionen der Linse, mit Ankern gekürzt, für die Dauer der Probe an ihrem Namen (danach die der Linse zurück). Je Ruf, der Zeit
// trägt, eine Zeile (RUF · BERUHIGUNG) mit seinen Sekunden: reißt der Deckel, nennt die letzte, wo.
async function werkbankLinse(tor) {
    const http = require("http");
    const cp = require("child_process");
    const L = JSON.parse(tor.arg[0]);
    const S = tor.W + 2;
    const t0 = Date.now();
    const sek = (t) => ((Date.now() - t) / 1000).toFixed(1);
    tor.karte();
    if (L.vorher) {
        const v = cp.spawnSync(process.execPath, ["scripts/werkbank.cjs", ...L.vorher, "--port", String(tor.W)], { encoding: "utf8", timeout: 600000 });
        console.log("VORHER werkbank " + L.vorher.join(" ") + " EXIT=" + v.status + " · " + sek(t0) + " s");
        if (v.status !== 0) throw new Error("der Messort der Linse steht nicht: " + String((v.stdout || "") + (v.stderr || "")).trim().split("\n").slice(-2).join(" | ").slice(0, 300));
    }
    let n = 0;
    const ruhe = async (b) => {
        const t = Date.now();
        const e = (await tor.ruf("/eval", { code: "window.__buehne(); return await window.__weltStehtNach(null, " + L.ruheMax + ");" }, 600000)).ergebnis;
        console.log("BERUHIGUNG " + ++n + " statt /lauf " + JSON.stringify(b) + ": die Welt steht nach " + e + " Takten, " + sek(t) + " s · " + sek(t0) + " s");
        return { beruhigt: e };
    };
    const spiegel = http.createServer((q, a) => {
        const teile = [];
        q.on("data", (c) => teile.push(c));
        q.on("end", () => {
            const roh = Buffer.concat(teile);
            let b = null;
            try {
                b = JSON.parse(roh.toString("utf8") || "{}");
            } catch (_e) {
                b = null;
            }
            if (q.url === "/lauf" && b && b.sek === 5 && b.ein === 8 && b.ruhe === 120)
                return ruhe(b).then((j) => a.end(JSON.stringify(j)), (e) => a.end(JSON.stringify({ fehler: "BERUHIGUNG: " + e.message })));
            const t = Date.now();
            const was = b && (b.code ? String(b.code).slice(0, 48) + (/"uhren":\[/.test(b.code) ? " (" + (String(b.code).match(/"uhren":\[([^\]]*)\]/)[1].split(",").length) + " Uhren)" : "") : JSON.stringify(b).slice(0, 80));
            const w = http.request({ host: "127.0.0.1", port: tor.W, path: q.url, method: q.method, headers: q.headers, agent: false }, (x) => {
                a.writeHead(x.statusCode, x.headers);
                x.pipe(a);
                x.on("end", () => Date.now() - t >= 2000 && console.log("RUF " + q.url + " " + was + " · " + sek(t) + " s · " + sek(t0) + " s"));
            });
            w.on("error", (e) => a.end(JSON.stringify({ fehler: "SPIEGEL: " + e.message })));
            w.end(roh);
        });
    });
    await new Promise((ok, nein) => spiegel.once("error", nein).listen(S, "127.0.0.1", ok));
    const namen = Object.keys(L.seite || {});
    try {
        await tor.ruf("/fenster", { w: L.fenster[0], h: L.fenster[1] });
        if (namen.length) {
            const code = namen.map((k) => "window.__linse_" + k + " = window." + k + "; window." + k + " = " + tor.quelle(...L.seite[k]) + ";").join("\n");
            await tor.ruf("/eval", { code: code + " return 1;" });
        }
        const kind = cp.spawn(process.execPath, ["scripts/werkbank.cjs", ...L.args, "--port", String(S), "--datei", tor.aus], {
            env: { ...process.env, WERKBANK_PORT: String(S) },
            stdio: ["ignore", "pipe", "pipe"],
        });
        kind.stdout.on("data", (d) => process.stdout.write(d));
        kind.stderr.on("data", (d) => process.stderr.write(d));
        const code = await new Promise((ok) => kind.on("exit", (c) => ok(c == null ? 1 : c)));
        console.log("LINSE werkbank " + L.args.join(" ") + " EXIT=" + code + " nach " + sek(t0) + " s in der Welt der Sitzung (" + n + " Beruhigungen, Fenster " + L.fenster.join("×") + ")");
        process.exitCode = code;
        // DER WEG GEGEN DIE LINSE (`L.pruefe`, in der Seite): kürzt die Probe einen Weg der Linse, misst sie ihn hier gegen den vollen —
        // weicht er ab (`rot`), ist die Probe ROT beim Namen (Exit 1), nie still kurz
        if (L.pruefe) {
            const p = (await tor.ruf("/eval", { code: L.pruefe })).ergebnis;
            console.log("WEG " + JSON.stringify(p));
            if (!p || p.rot) (process.exitCode = 1), console.log("WEG ROT: " + (p ? p.rot : "keine Prüfung des Wegs"));
        }
    } finally {
        if (namen.length) await tor.ruf("/eval", { code: namen.map((k) => "window." + k + " = window.__linse_" + k + "; delete window.__linse_" + k + ";").join(" ") + " return 1;" }).catch(() => {});
        await tor.ruf("/fenster", { w: 1920, h: 1080 }).catch(() => {});
        spiegel.close();
    }
}

// ───────── lod.K3#1 — die Karte aus jeder Blick-Hebung (gate:foundry-impostor C6, w4-hebungsringe) in der Welt der Sitzung ─────────
// Die Linse startete einen eigenen Browser (WebGL2, Null-Renderer-Welt, FIMP_PORT las niemand). Hier ihr Teil C in der Seite der
// Sitzung: `installiereBacke` (die Bake-Bühne `__fimpBacke`, `__fimpKarte`), `weltRuht` (die EINE Ruhe vor Teil C) und `kleberProbe`,
// mit drei Ankern auf C6 gekürzt — (1) Layout und (2) Kleber-Wand ein toter Block, C5 fällt, C6 Byte für Byte, der Probe-Renderer geht
// wie in der Linse (`ren.dispose()`), vorher alles, was er für die Probe anlegte: die Bühne ruht sofort (`_karteBuehneRuhe`, die Ruhe
// der Welt — sie kam erst nach 3 s Stille, die Bühne des Probe-Renderers hielt ihre Ziele: +28 MB VRAM nach dem GC, swiftshader), das
// Array-Ziel des rgba8-Atlas samt Tiefe, die Texturen des Probe-Atlas (sonst trüge der VRAM-Abgriff ihre Bytes bis zum GC). Je
// Format (bc, rgba8) ein frischer Probe-Renderer, ein Probe-Atlas; gedruckt wird mit dem Druck-Block der Linse selbst (zwischen
// seinen Ankern), nie mit einem Zwilling des Formats. DIE RÜCKGABE (die Probe misst in der Welt, die sie danach lässt): `leihe`
// (welt-boot) merkt und gibt zurück — den Karten-Atlas der Welt (Teil C setzt `_kartenAtlas` neu), Bühne und Rechner des Bakes
// (sie gehörten danach dem Probe-Gerät), den Stoff-Cache (Teil C löscht die Karten-Stoffe), den Wind (C6 setzt ihn 0), die Grenzen
// der Foundry (kein ruhender Welt-Körper fällt den zwei Probe-Körpern zum Opfer, die danach selbst fallen). Ohne Karte (kein
// `[linse-gpu]`) druckt sie keine Zeile (das Urteil hielte die Ersatz-Zeile für Hardware), und bleibt VRAM nach dem GC über
// 1 MB stehen, druckt sie keine C6-Zeile, sondern den Rest beim Namen (die Proben danach urteilen über VRAM).
async function karteHebung(tor) {
    const fs = require("fs");
    const L = "scripts/diag-foundry-impostor.cjs";
    const fn = (name, anker) => new Function("return (" + tor.quelle(L, name, anker) + ");")();
    const kleber = fn("kleberProbe", [
        ["const H0 = 8;", "if (0) { const H0 = 8;"],
        ["const kr = [", "} const kr = ["],
        ["rtO.dispose();", "rtO.dispose(); const buehne = r._karteBuehneSatz; if (buehne && buehne.rend === ren) (buehne.zuletzt = -Infinity), r._karteBuehneRuhe(); for (const t of [at.rt, at.map, at.nmap, at.lmap]) if (t && t.dispose) t.dispose(); return (ren.dispose(), out);"],
    ]);
    const text = fs.readFileSync(L, "utf8");
    const [a, e] = ["const O = C.oben || { je: {} };", "die waagrecht gebackene Karte besteht von oben — die Linse ist blind`);"];
    if (text.split(a).length !== 2 || text.split(e).length !== 2) throw new Error("ANKER des Druck-Blocks C6 nicht genau einmal in " + L);
    const drucke = new Function("C", "F", "errs", text.slice(text.indexOf(a), text.indexOf(e) + e.length));
    const page = await tor.seite();
    const karte = tor.karte();
    if (!karte) throw new Error("ohne Karte keine Zeile (die Ersatz-Zeile hielte das Urteil für Hardware)");
    const cdp = await page.target().createCDPSession();
    const vram = async () => {
        await cdp.send("HeapProfiler.collectGarbage");
        await page.evaluate(() => new Promise((ok) => setTimeout(ok, 200)));
        await cdp.send("HeapProfiler.collectGarbage");
        return page.evaluate(() => (window.__vram ? +((window.__vram.puffer + window.__vram.texturen) / 1048576).toFixed(1) : null));
    };
    const v0 = await vram();
    await fn("installiereBacke")(page);
    const ruhe = await fn("weltRuht")(page);
    console.log("  RUHE VOR TEIL C: die Welt steht nach " + ruhe.takte + " Takten · mit einer wartenden Karte: " + ruhe.karte);
    await page.evaluate(() => {
        const A = r.constructor, st = r.state, w = st.windUniforms && st.windUniforms.uWindStrength;
        const keys = [93, 94].map((v) => r._foundryKoerperKey("eiche", v, r._foundryServierStufe("eiche", 1), null));
        window.__hebungZurueck = [
            leihe(r, { _kartenAtlas: r._kartenAtlas, _karteBuehneSatz: r._karteBuehneSatz, _karteRechnerSatz: r._karteRechnerSatz }),
            leihe(st, { _foliageMatCache: new Map(st._foliageMatCache || []), foundryCrossfade: st.foundryCrossfade }),
            ...(w ? [leihe(w, { value: w.value })] : []),
            leihe(A, { FOUNDRY_RUHE_BYTES: Infinity, FOUNDRY_CACHE_BYTES: Infinity, FOUNDRY_CACHE_CAP: Infinity }),
        ];
        window.__hebungKoerper = keys.map((k) => [k, r._foundryCacheGet(k)]);
        window.__hebungRend = [st.renderer, st.renderer.setAnimationLoop];
        return 1;
    });
    const Cs = [];
    try {
        for (const fmt of ["bc", "rgba8"]) {
            const C = await kleber(page, fmt);
            C.fremd = C.ohneFeature ? [] : await page.evaluate(() => [...((r._kartenAtlas && r._kartenAtlas.zellen) || new Map()).keys()].filter((k) => !k.startsWith("fimp:gateKarte|")));
            Cs.push(C);
        }
    } finally {
        await page.evaluate(() => {
            for (const [k, alt] of window.__hebungKoerper || []) alt === undefined ? r._foundryCacheEvict(k) : r._foundryCacheSet(k, alt);
            for (const z of (window.__hebungZurueck || []).reverse()) z();
            delete window.__hebungZurueck;
            delete window.__hebungKoerper;
            return 1;
        });
    }
    const rend = await page.evaluate(() => {
        const [R, S] = window.__hebungRend;
        delete window.__hebungRend;
        return r.state.renderer === R && r.state.renderer.setAnimationLoop === S;
    });
    const v1 = await vram();
    await cdp.detach().catch(() => {});
    const rest = v0 != null && v1 != null ? +(v1 - v0).toFixed(1) : null;
    console.log("  RÜCKGABE: der Renderer der Welt " + (rend ? "derselbe" : "ein ANDERER") + " · VRAM nach dem GC " + v0 + " → " + v1 + " MB (" + (rest >= 0 ? "+" : "") + rest + ")");
    const errs = [];
    if (ruhe.karte) errs.push("C: eine wartende Karte bricht die Ruhe nicht (`_weltSteht` true)");
    if (!rend) errs.push("RÜCKGABE: der Renderer der Welt ist nach der Probe ein anderer");
    if (!(rest != null && rest <= 1)) errs.push("RÜCKGABE: " + rest + " MB VRAM blieben nach dem GC in der Welt (Soll ≤ 1)");
    const rueck = errs.length > (ruhe.karte ? 1 : 0);
    for (const C of Cs) {
        const F = `C[${C.fmt}]`;
        if (C.ohneFeature) {
            console.log("  [" + C.fmt + "] die Welt wählt auf dem Probe-Renderer rgba8 — ohne texture-compression-bc");
            continue;
        }
        if (C.err) {
            console.log("  Fehler [" + C.fmt + "]: " + C.err);
            errs.push(`${F}: Karten-Probe brach ab — ${C.err}`);
            continue;
        }
        if ((C.fremd || []).length) errs.push(`${F}: die Welt lieferte in den Probe-Atlas (${C.fremd.join(", ")}) — Teil C begann vor der Ruhe`);
        if (!rueck) drucke(C, F, errs);
    }
    for (const x of errs) console.log("  ROT " + x);
    fs.writeFileSync(tor.aus, JSON.stringify({ ruhe, C: Cs.map((C) => ({ fmt: C.fmt, ohneFeature: !!C.ohneFeature, err: C.err || null, fremd: C.fremd, oben: C.oben || null })), vram: [v0, v1], rend }, null, 1));
    process.exitCode = errs.length ? 1 : 0;
}

module.exports = { sitzungTor, torBefehl, kollisionTempo, bodenRollen, tierKreis, sprungKadenz, fadenZaehler, fahrRueck, fahrWegenetz, fahrVerkehr, wasserGraben, naesseDorf, werkbankLinse, karteHebung };
