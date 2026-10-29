#!/usr/bin/env node
// diag-albedo-tafel.cjs — DIE ALBEDO-WAND LABOR ↔ WELT (S1 W1e): die Tafel spec/farbe/albedo-tafel.json, ihre Ratsche und
// ihre Labor-Seite (Rechnung, Begriffe, Werkzeuge: scripts/lib/albedo-tafel.cjs).
//
//   node scripts/diag-albedo-tafel.cjs                 (npm run gate:albedo-tafel, GPU-frei) die Tafel trägt Schema und
//        Messung: jede der acht Klassen eine Zeile, jede Zeile Labor-Y, Welt-Y, Verhältnis und Ratsche, jedes Studio
//        seine Karte; das gespeicherte Ist liegt in seiner Ratsche UND ist so jung wie der Code, den es trägt (K63-n4, K63-n8:
//        je Zeile ihre `quellen` gegen den Code-Abdruck beider Seiten beim Messen — ungeprüft bricht, veraltet
//        steht benannt ohne Bruch, auf der Karte in der CI (Job `echt`) misst die Wand sie selbst neu);
//        Soll-Stand (n von N im Rand) steht in der Ausgabe
//   node scripts/diag-albedo-tafel.cjs --neu           die veralteten Zeilen auf dem Adapter der Weiche neu messen (lokal die
//        Karte, unter dem GPU-Schloss): EINE Welt (ALBEDO_WERKBANK_PORT, Standard 4589) + das Labor, Urteil der frischen
//        Zahlen, die Dateien zum Nachziehen unter artifacts/albedo-neu/
//   node scripts/diag-albedo-tafel.cjs --selftest      die Rechnung feuert: ein Verhältnis über der Ratsche, eine falsche
//        Eichung, eine stumme Seite, eine Tafel ohne Klasse werden ROT; der Nachzug senkt und hebt nie — und im echten
//        r128-Labor (Chrome, die Linse aus der Bibliothek) liest die 18-%-Karte 0,180, ein roh gelesenes Hex (der alte
//        Defekt des Labors, Täter eingespielt) steht über dem Rand, dasselbe Hex nach dem FARB-GESETZ im Rand
//   node scripts/diag-albedo-tafel.cjs --labor [--echt] [--nur terrain,garage] [--datei f.json]
//        die Labor-Seite messen (je Studio die Zeilen der Tafel + seine 18-%-Karte), gegen das gespeicherte Welt-Ist urteilen
//   node scripts/diag-albedo-tafel.cjs --nachziehen welt.json labor.json
//        aus einer Messung BEIDER Seiten das Ist setzen und die Ratsche senken (nie heben)
//
// Port: ALBEDO_PORT (Standard 4587). `--echt` fährt die echte GPU (scripts/lib/software-gpu.cjs echteWebGpuArgs), sonst
// die Weiche des EINEN Start-Rezepts (linsenWebGpuArgs: lokal der Hardware-Adapter, in der CI swiftshader).
"use strict";
const { statikServer, starteBrowser, hauptLauf, sleep, argOpt: opt, pngDatei, selbsttestEnde, ausDatei, path, fs } = require("./lib/welt-boot.cjs");
const AT = require("./lib/albedo-tafel.cjs");
const { kartenEichung } = require("./lib/licht-linsen.cjs");
// der Code-Abdruck einer Datei des Baums und der Stand einer Messung (abnahme-urteil `standLeser`, derselbe wie Werkzeug und
// Soll-Tafel)
const AU = require("./lib/abnahme-urteil.cjs");
const SL = AU.standLeser(path.join(__dirname, ".."));
const { pruefsumme } = SL;
const { linsenGpu } = require("./lib/software-gpu.cjs");

const argv = process.argv.slice(2);
const PORT = Number(process.env.ALBEDO_PORT || 4587);

const statisch = (seiten) => statikServer({ seiten });

const browser = (echt) =>
    starteBrowser({
        art: echt ? "echt" : "linse",
        frist: 900000,
        zusatz: ["--window-size=1280,800"],
        viewport: { width: 1280, height: 800, deviceScaleFactor: 1 },
    });

// ── Die Labor-Seite ─────────────────────────────────────────────────────────────────────────────────────────────────────
// Je Studio: die Seite laden, auf die Wurzel warten, je Zeile die Labor-Aktion (der echte UI-Pfad: Vorlagen-Knopf, Lack-
// Feld, Kultur-Wahl, der Wald) und dann der Schuss; zuletzt die Karte des Studios.
async function aktion(page, a) {
    if (!a) return;
    // Eine Folge von Aktionen (Kultur wählen, dann den Garten aus) läuft der Reihe nach.
    if (Array.isArray(a)) {
        for (const x of a) await aktion(page, x);
        return;
    }
    if (a.klick)
        await page.evaluate((a) => {
            const el = document.querySelectorAll(a.klick)[a.index || 0];
            if (!el) throw new Error("Labor-Aktion: kein Element " + a.klick);
            el.click();
        }, a);
    if (a.waehle)
        await page.evaluate((a) => {
            const el = document.querySelector(a.waehle);
            if (!el) throw new Error("Labor-Aktion: keine Wahl " + a.waehle);
            el.value = a.wert;
            el.dispatchEvent(new Event("change", { bubbles: true }));
        }, a);
    if (a.wald) {
        await page.evaluate(() => enterForest()); // eslint-disable-line no-undef
        await page.waitForFunction(
            () => {
                const m = typeof _terMat !== "undefined" ? _terMat : null; // eslint-disable-line no-undef
                if (!m) return false;
                let da = false;
                scene.traverse((x) => (da = da || (x.isMesh && x.material === m))); // eslint-disable-line no-undef
                return da;
            },
            { timeout: 300000, polling: 500 }
        );
    }
    // Die Shells bauen im Klick-Takt oder entprellt (Regler 90–180 ms) — zwei Bilder später steht die Gestalt.
    await page.evaluate(() => sleep(600));
}

async function messeLabor({ echt, nur, tafel }) {
    const server = statisch();
    await server.lausche(PORT);
    const b = await browser(echt);
    const out = { labor: {}, karten: {}, eichung: { labor: {} }, geraet: null };
    try {
        for (const [sid, S] of Object.entries(AT.STUDIOS)) {
            if (nur && !nur.includes(sid)) continue;
            const page = await b.newPage();
            await server.zeige(page, 120000, S.pfad, "load");
            await page.evaluate(AT.LABOR_INSTALL);
            // die Bereitschaft fragt Node je 300 ms (die strenge CSP der Seiten erlaubt new Function nur im Aufruf von außen)
            const bereit = (S) => {
                const g = (n) => new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)();
                const w = g(S.wurzel);
                let n = 0;
                if (w) w.traverse((x) => (n += x.isMesh ? 1 : 0));
                return n > 0 && !!g(S.renderer) && g(S.renderer)._initialized !== false; // r184 rendert nach init()
            };
            while (!(await page.evaluate(bereit, S))) await sleep(300);
            if (!out.geraet)
                out.geraet = await page.evaluate((S) => {
                    const R = new Function(`return ${S.renderer};`)();
                    if (R.isWebGPURenderer) return "WebGPU " + (R.backend.device ? R.backend.device.adapterInfo.architecture : "WebGL2-Ersatz");
                    const gl = R.getContext();
                    const e = gl.getExtension("WEBGL_debug_renderer_info");
                    return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
                }, S);
            // Die Karte zuerst: das Labor-Licht, wie das Studio startet (vor jeder Vorlagen-Wahl, vor dem Wald).
            out.karten[sid] = await page.evaluate((o) => window.__laborKarte(o), { studio: S, studioId: sid });
            const zeilen = tafel.zeilen.filter((z) => z.labor && z.labor.studio === sid);
            // Der Wald baut die Pflanzen-Welt um — seine Zeilen zuletzt.
            const wald = (z) => [].concat(z.labor.aktion || []).some((x) => x.wald);
            zeilen.sort((a, c) => (wald(a) ? 1 : 0) - (wald(c) ? 1 : 0));
            let eich = null;
            for (const z of zeilen) {
                await aktion(page, z.labor.aktion);
                const res = await page.evaluate((o) => window.__laborAlbedo(o), { studio: S, zeilen: [z] });
                const e = res.find((x) => x.id === z.id || x.name === z.id) || { fehler: "keine Antwort" };
                const k = res.find((x) => x.name === "graukarte");
                if (k && k.gesamt) eich = k.gesamt.Y;
                const ordner = opt("--bilder");
                if (ordner && e.png) {
                    fs.mkdirSync(ordner, { recursive: true });
                    pngDatei(path.join(ordner, `labor-${z.id}.png`), e.png);
                }
                out.labor[z.id] = e.gesamt
                    ? { Y: e.gesamt.Y, rgb: e.gesamt.rgb, pixel: e.pixel, zuege: e.zuege, stoffe: e.stoffe }
                    : { Y: null, fehler: e.fehler || "kein Pixel" };
            }
            out.eichung.labor[sid] = eich;
            await page.close();
        }
    } finally {
        await b.close();
        server.close();
    }
    return out;
}

// ── Die Labor-Seite der Laub-Licht-Linse ──────────────────────────────────────────────────────────────────────────
// `--laub [eiche,birke] [--welt w.json] [--echt]`: je Art die Vorlage im Phytogenesis-Labor, der Key allein hinter bzw. vor
// der Krone (`__laborLaub`); mit `--welt` (die Ausgabe von `werkbank licht --laub --datei`) das Urteil der EINEN Linse
// (`laubLichtUrteil`: Welt ≥ 1,3, Labor = Welt nur unter der Sonne ± 10 %).
async function laborLaub() {
    const LL = require("./lib/licht-linsen.cjs");
    const S = AT.STUDIOS.terrain;
    const server = statisch();
    await server.lausche(PORT);
    const b = await browser(argv.includes("--echt"));
    const labor = {};
    const welt = opt("--welt") ? ausDatei(path.resolve(opt("--welt")), true).welt : null;
    try {
        const page = await b.newPage();
        await server.zeige(page, 120000, S.pfad, "load");
        await page.evaluate(AT.LABOR_INSTALL);
        for (const art of String(opt("--laub", "eiche,birke") || "eiche,birke").split(",")) {
            await aktion(page, { klick: `#ui [data-p="${art}"]` });
            await page.waitForFunction(
                (S) => {
                    const w = new Function(`return typeof ${S.wurzel} !== "undefined" ? ${S.wurzel} : undefined;`)();
                    let n = 0;
                    if (w) w.traverse((x) => (n += x.isMesh ? 1 : 0));
                    return n > 0;
                },
                { timeout: 180000, polling: 300 },
                S
            );
            labor[art] = await page.evaluate((o) => window.__laborLaub(o), {
                studio: S,
                weltHoehe: welt && welt[art] ? welt[art].hoehe : null,
                bilder: !!opt("--bilder"),
            });
        }
    } finally {
        await b.close();
        server.close();
    }

    for (const [art, l] of Object.entries(labor))
        if (l.bilder) {
            for (const k of ["gegen", "auf"])
                pngDatei(path.join(opt("--bilder"), `labor-laub-${art}-${k}.png`), l.bilder[k]);
            delete l.bilder;
        }
    console.log(JSON.stringify({ labor }, null, 1));
    if (!welt) process.exit(Object.values(labor).every((l) => l.verhaeltnis > 0) ? 0 : 1);
    const u = LL.laubLichtUrteil({ welt, labor });
    console.log(JSON.stringify(u.zeilen));
    console.log(`LAUB-LICHT ${u.urteil}${u.befunde.length ? ": " + u.befunde.join(" | ") : ""}`);
    process.exit(u.urteil === "GRUEN" ? 0 : 1);
}

// ── Der Selbsttest ──────────────────────────────────────────────────────────────────────────────────────────────────────
function tafelZumTest() {
    const t = AT.ladeTafel();
    const k = structuredClone(t);
    for (const z of k.zeilen) z.ratsche = 0.05;
    for (const s of Object.keys(k.karten)) k.karten[s].ratsche = 0.05;
    return k;
}
function messungZumTest(t, faktor) {
    const m = { labor: {}, welt: {}, karten: {}, eichung: { welt: 0.18, labor: {} } };
    const kL = kartenEichung(t.belichtung.kurve);
    for (const z of t.zeilen) {
        m.welt[z.id] = { Y: 0.2, rgb: "0.2/0.2/0.2" };
        if (z.welt && Array.isArray(z.welt.stufen)) m.welt[z.id].stufen = z.welt.stufen.slice();
        m.labor[z.id] = { Y: 0.2 * ((faktor && faktor[z.id]) || 1), rgb: "x" };
    }
    for (const u of t.uhren.slice(1)) for (const z of t.zeilen) m.welt[z.id + "@" + u] = m.welt[z.id];
    for (const s of Object.keys(t.karten)) {
        m.karten[s] = { kL, ausgabe: [168, 168, 168] };
        m.eichung.labor[s] = 0.18;
    }
    return m;
}

async function selbsttest() {
    const tests = [];
    const t = (name, ok) => tests.push({ name, ok: !!ok });
    const T0 = tafelZumTest();
    const hatRot = (u, art) => u.rot.some((r) => r.art === art);
    // S0 — DER STAND: beide Seiten am Code-
    // Abdruck von heute → kein Befund; eine Quelle geändert seit der Messung → `veraltet seit <Commit>` beim Namen; eine Messung
    // ohne Abdrücke → `ungeprüft`. Die Zeilen-Quellen sind Pflicht des Schemas.
    {
        const S0 = structuredClone(T0);
        const heute = {};
        for (const z of S0.zeilen) for (const d of z.quellen || []) heute[d] = pruefsumme(d);
        const sha = "0123456789abcdef0123456789abcdef01234567";
        const seite = () => ({ version: "18.0.0", sha, quellen: Object.assign({}, heute) });
        S0.gemessen = { welt: seite(), labor: seite() };
        const frisch = AT.tafelStand(S0, pruefsumme);
        const d0 = S0.zeilen.find((z) => z.id === "lack").quellen[0]; // eine Quelle ohne Stufen-Zeilen (sie tragen nur die Welt)
        // DER CODE-ABDRUCK: dieselbe Quelle mit Kommentarzeilen und neuem Leerraum → kein Befund; ein Token mehr
        // → `veraltet seit 01234567` beim Namen der Datei, in BEIDEN Seiten jeder Zeile, die sie trägt
        const text0 = ausDatei(path.join(__dirname, "..", d0));
        const mit = (neu) => (d) => (d === d0 ? AU.codeAbdruck(neu, d) : pruefsumme(d));
        const kommentar = AT.tafelStand(S0, mit(text0.replace("\n", "\n// eine Kommentarzeile\n\n\t \n") + "\n/* Block */\n"));
        const code = AT.tafelStand(S0, mit(text0 + "\n;0;\n"));
        const dk = "stamm/dirigent-kern.js";
        const stufe = AU.codeAbdruck(ausDatei(path.join(__dirname, "..", dk)).replace(/VERSION = "/, "$&0."), dk);
        const mitD0 = S0.zeilen.filter((z) => z.quellen.includes(d0)).length;
        S0.gemessen.welt.quellen[d0] = "0000000000000000";
        const altForm = AT.tafelStand(S0, pruefsumme);
        delete S0.gemessen.labor.quellen;
        const ohne = AT.tafelStand(S0, pruefsumme);
        const s0q = structuredClone(T0);
        delete s0q.zeilen[0].quellen;
        t(
            "Stand: heute gemessen → kein Befund; eine Kommentarzeile oder Versions-Stufe → kein Befund; ein Token mehr → veraltet seit <Commit> beim Namen; Prüfsumme alter Form oder keine → ungeprüft; Zeile ohne Quellen → Schema rot",
            frisch.length === 0 &&
                kommentar.length === 0 &&
                stufe === pruefsumme(dk) &&
                code.length === 2 * mitD0 &&
                code.every((r) => r.art === "veraltet" && r.text.includes("veraltet seit 01234567") && r.text.includes(d0)) &&
                altForm.some((r) => r.zeile === "lack" && r.art === "ungeprüft" && /alter Form/.test(r.text)) &&
                ohne.some((r) => r.art === "ungeprüft" && /ohne Abdruck/.test(r.text)) &&
                AT.tafelPruefen(s0q).some((f) => /quellen fehlen/.test(f))
        );
        // S0w — DIE WAND DES STANDS: ungeprüft bricht, veraltet nicht; zwei gefälschte Abdrücke stehen beide beim Namen
        const wv = AT.standWand(code);
        const wu = AT.standWand(ohne);
        const zf = S0.zeilen[S0.zeilen.length - 1];
        const [fa, fb] = zf.quellen.slice(-2);
        Object.assign(S0.gemessen.labor, seite());
        Object.assign(S0.gemessen.welt.quellen, heute, { [fa]: "c:feedfacecafebeef", [fb]: "c:0badc0de0badc0de" });
        const gef = AT.standWand(AT.tafelStand(S0, pruefsumme)).veraltet[zf.id] || [];
        t(
            `Wand: ungeprüft → Bruch, veraltet benannt ohne Bruch; gefälscht ${fa} und ${fb} → beide genannt`,
            gef.length === 1 &&
                gef[0].includes(`${fa} geändert (c:feedfacecafebeef → ${pruefsumme(fa)})`) &&
                gef[0].includes(`${fb} (c:0badc0de0badc0de → ${pruefsumme(fb)})`) &&
                wv.brueche.length === 0 &&
                wv.neu.length === mitD0 &&
                wv.neu.every((id) => S0.zeilen.find((z) => z.id === id).quellen.includes(d0)) &&
                wu.brueche.length > 0
        );
    }
    // S1 — gleich auf beiden Seiten: GRÜN, alle Zeilen im Soll.
    const u1 = AT.tafelUrteil(T0, messungZumTest(T0));
    t(
        "Labor = Welt auf jeder Zeile → GRÜN, jede Zeile und Karte im Soll",
        u1.urteil === "GRUEN" && u1.zeilen.every((z) => z.imSoll || z.stufeTon)
    );
    // S2 — das Labor liest das Hex roh (Faktor 2,3 auf einer Zeile): über der Ratsche ROT und außerhalb des Solls; ein
    // Schritt Richtung 1 innerhalb von Ratsche + Rand bleibt grün.
    const u2 = AT.tafelUrteil(T0, messungZumTest(T0, { [T0.zeilen[0].id]: 2.3 }));
    const u2b = AT.tafelUrteil(T0, messungZumTest(T0, { [T0.zeilen[0].id]: 1.06 }));
    t(
        "eine Zeile Labor/Welt 2,3 → ROT `ratsche`, nicht im Soll; 1,06 (|ln| 0,058 ≤ 0,05 + Rand) → GRÜN",
        hatRot(u2, "ratsche") && !u2.zeilen[0].imSoll && u2b.urteil === "GRUEN"
    );
    // S3 — die Eichung: eine Karte, die 0,20 liest, ist ROT (keine Zahl der Tafel wäre dann eine Albedo).
    const m3 = messungZumTest(T0);
    m3.eichung.welt = 0.2;
    t("Welt-Karte liest 0,20 → ROT `eichung`", hatRot(AT.tafelUrteil(T0, m3), "eichung"));
    // S4 — eine stumme Seite (das Labor maß 0 Pixel) ist ROT, nie still grün.
    const m4 = messungZumTest(T0);
    m4.labor[T0.zeilen[1].id] = { Y: null, fehler: "kein Pixel" };
    t("eine stumme Labor-Zeile → ROT `stumm`", hatRot(AT.tafelUrteil(T0, m4), "stumm"));
    // S5 — die Karte: k·L 0,62 (der Belichtungs-Bias des Labors) über der Ratsche ROT.
    const m5 = messungZumTest(T0);
    m5.karten.garage.kL = 0.62;
    t("Karte garage k·L 0,62 → ROT `ratsche`", hatRot(AT.tafelUrteil(T0, m5), "ratsche"));
    // S5p — die Pflicht-Zeile (material.K1): unter ihrer Ratsche, außerhalb des Solls ROT
    const P = tafelZumTest();
    P.zeilen.find((z) => z.id === "haut").ratsche = 0.2;
    const uP = AT.tafelUrteil(P, messungZumTest(P, { haut: 0.86 }));
    t("Pflicht-Zeile 0,86 → nur ROT `soll`", uP.rot.length === 1 && hatRot(uP, "soll"));
    // S6 — das Schema: eine fehlende Klasse, ein Welt-Muster ohne Anker, eine Zeile mit falschem Verhältnis werden rot.
    const s6a = structuredClone(T0);
    s6a.zeilen = s6a.zeilen.filter((z) => z.gruppe !== "Klinge");
    const s6b = structuredClone(T0);
    s6b.zeilen[0].welt.klasse = "f:eiche";
    const s6c = structuredClone(T0);
    s6c.zeilen[0].ist = { labor: { Y: 0.2, rgb: "x" }, welt: { Y: 0.1, rgb: "x" }, verhaeltnis: 1 };
    t(
        "Tafel ohne Klinge, Welt-Muster ohne Anker, Verhältnis ≠ Labor/Welt → rot; die echte Tafel nicht",
        AT.tafelPruefen(s6a).some((f) => /Klinge/.test(f)) &&
            AT.tafelPruefen(s6b).some((f) => /Anker/.test(f)) &&
            AT.tafelPruefen(s6c).some((f) => /nicht Labor\/Welt/.test(f)) &&
            !AT.tafelPruefen(AT.ladeTafel()).length
    );
    // S6s — DIE STUFE (K63-n7; die Stufe 1 faltet Chrom und Glas in den Lack): die Zeile erklärt L0, die Welt zeichnet
    // L0 und L1 → ROT `stufe` beim Namen; nur L0 → kein
    // Befund; eine Messung ohne Stufen → ROT; eine Foundry-Klasse ohne erklärte Stufen → Schema rot.
    {
        const zs = T0.zeilen.find((z) => z.welt && Array.isArray(z.welt.stufen) && z.welt.stufen.length === 1);
        const s0 = zs.welt.stufen[0];
        const mS = messungZumTest(T0);
        mS.welt[zs.id].stufen = [s0, s0 + 1];
        const mO = messungZumTest(T0);
        delete mO.welt[zs.id].stufen;
        const s6s = structuredClone(T0);
        delete s6s.zeilen.find((z) => z.id === zs.id).welt.stufen;
        t(
            "Stufe: erklärt L0, gezeichnet L0/L1 → ROT `stufe` beim Namen; nur L0 → kein Befund; ohne Stufen → ROT; Foundry-Klasse ohne Stufen → Schema rot",
            AT.tafelUrteil(T0, mS).rot.some((r) => r.art === "stufe" && r.text.startsWith(`${zs.id}:`) && r.text.includes(`L${s0}/L${s0 + 1}`)) &&
                !hatRot(AT.tafelUrteil(T0, messungZumTest(T0)), "stufe") &&
                AT.tafelUrteil(T0, mO).rot.some((r) => r.art === "stufe" && /nennt ihre Stufen nicht/.test(r.text)) &&
                AT.tafelPruefen(s6s).some((f) => f.startsWith(`${zs.id}: welt.stufen fehlt`))
        );
    }
    // S6u — DIE ZWEITE UHR (material.K3: ein Hand-Faktor gleicht den Mittag an und bricht zu einer anderen Uhr): die Karte der
    // Birke mittags gleich, um 0,27 0,9 → ROT beim Namen und der Uhr; die Spalte fehlt → ROT
    const m6u = messungZumTest(T0);
    m6u.welt["birke-karte@0.27"] = { Y: 0.18, stufen: [2] };
    const m6v = messungZumTest(T0);
    delete m6v.welt["fichte-l1@0.27"];
    t(
        "Uhr 0,27: Karte 0,9 → ROT, Spalte fehlt → ROT",
        AT.tafelUrteil(T0, m6u).rot.some((r) => r.text === "birke-karte: Welt/birke 0.9 (Uhr 0.27)") &&
            AT.tafelUrteil(T0, m6v).rot.some((r) => r.text === "fichte-l1: Welt/fichte null (Uhr 0.27)")
    );
    // S7 — der Nachzug senkt, hebt nie, und zieht ohne Eichung nicht.
    const n7 = AT.tafelNachziehen(T0, messungZumTest(T0, { [T0.zeilen[2].id]: 1.01 }), { labor: {}, welt: {} });
    const n7b = AT.tafelNachziehen(T0, messungZumTest(T0, { [T0.zeilen[2].id]: 1.2 }), { labor: {}, welt: {} });
    // eine stumme Zeile: ihr Ist fällt (kein altes Ist unter dem neuen Stand), die Ratsche bleibt, die Wand nennt sie „ohne Ist"
    const n7c = AT.tafelNachziehen(T0, m4, { labor: {}, welt: {} });
    t(
        "Nachzug: 0,05 → 0 (Labor = Welt) und 0,05 → 0,01; über der Ratsche bleibt 0,05; eine stumme Zeile verliert ihr Ist; eine falsche Eichung zieht nicht",
        n7.tafel.zeilen[0].ratsche === 0 &&
            Math.abs(n7.tafel.zeilen[2].ratsche - 0.01) < 1e-3 &&
            n7b.tafel.zeilen[2].ratsche === 0.05 &&
            !!n7c.tafel &&
            n7c.tafel.zeilen[1].ist === null &&
            n7c.tafel.zeilen[1].ratsche === T0.zeilen[1].ratsche &&
            n7c.tafel.zeilen[0].ist !== null &&
            AT.tafelNachziehen(T0, m3, {}).tafel === null
    );
    // S8 — DER TÄTER IM ECHTEN LABOR (r128, Chrome, die Linse der Bibliothek): eine Szene mit drei Stoffen — die 18-%-Karte,
    // Granit 0x8e939a nach dem FARB-GESETZ (linear gesetzt, wie die Welt ihn backt) und DERSELBE Hex roh gelesen
    // (`new THREE.Color(hex)`, der alte Defekt des Labors). Gegen die Welt-Albedo des Hex (linear) steht der rohe über dem
    // Rand einer geheilten Ratsche (0), der gesetzlich gelesene darin; die Karte liest 0,180.
    const server = statisch({
        "/__albedo_selbst.html": `<!doctype html><meta charset="utf-8"><body style="margin:0"><script src="/worlds/terrain/lib/three-r128.min.js"></script><script>
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(320, 200);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x203040);
scene.fog = new THREE.Fog(0x203040, 1, 10);
const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(3, 5, 2); scene.add(key);
scene.add(new THREE.HemisphereLight(0xaaccff, 0x332211, 0.8));
const subject = new THREE.Group(); scene.add(subject);
const roh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: new THREE.Color(0x8e939a), roughness: 0.81, metalness: 0.3, emissive: 0x221100 }));
roh.material.userData.__seh = "roh";
const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const gesetz = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.81, metalness: 0.3 }));
gesetz.material.color.setRGB(lin(0x8e / 255), lin(0x93 / 255), lin(0x9a / 255));
gesetz.material.userData.__seh = "gesetz";
roh.position.x = -0.8; gesetz.position.x = 0.8; subject.add(roh); subject.add(gesetz);
window.__bereit = true;
</script>`,
    });
    await server.lausche(PORT);
    const b = await browser(false);
    try {
        const page = await b.newPage();
        await server.zeige(page, 60000, "__albedo_selbst.html", "load");
        await page.waitForFunction(() => window.__bereit === true, { timeout: 30000 });
        await page.evaluate(AT.LABOR_INSTALL);
        const S = { szene: "scene", renderer: "renderer", wurzel: "subject", ausgabe: null };
        const res = await page.evaluate((o) => window.__laborAlbedo(o), {
            studio: S,
            zeilen: [
                { id: "roh", labor: { stoff: { seh: "roh" } } },
                { id: "gesetz", labor: { stoff: { seh: "gesetz" } } },
            ],
        });
        const y = (id) => (res.find((x) => x.name === id || x.id === id) || {}).gesamt;
        const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        const weltY = 0.2126 * lin(0x8e / 255) + 0.7152 * lin(0x93 / 255) + 0.0722 * lin(0x9a / 255);
        const karteY = y("graukarte") && y("graukarte").Y;
        const vRoh = y("roh") ? y("roh").Y / weltY : null;
        const vGes = y("gesetz") ? y("gesetz").Y / weltY : null;
        const T8 = structuredClone(T0);
        // die Probe prüft das Hex-Gesetz, nicht die Stufe des Exemplars (sie trägt keine erklärte Stufe)
        const z8 = Object.assign(structuredClone(T0.zeilen[0]), { id: "probe", ratsche: 0 });
        delete z8.welt.stufen;
        T8.zeilen = [z8];
        T8.karten = {};
        const m8 = (vY) => ({
            labor: { probe: { Y: vY, rgb: "x" } },
            welt: { probe: { Y: weltY, rgb: "x" } },
            karten: {},
            eichung: { welt: 0.18, labor: { probe: karteY } },
        });
        const u8roh = AT.tafelUrteil(T8, m8(y("roh") ? y("roh").Y : null));
        const u8ges = AT.tafelUrteil(T8, m8(y("gesetz") ? y("gesetz").Y : null));
        console.log(
            `   Labor-Probe (r128): Karte ${karteY} · Granit roh Y ${y("roh") && y("roh").Y} (Labor/Welt ${vRoh && vRoh.toFixed(3)}) · ` +
                `nach dem Gesetz Y ${y("gesetz") && y("gesetz").Y} (${vGes && vGes.toFixed(3)}) · Welt-Y ${weltY.toFixed(4)}`
        );
        t(
            "Labor-Linse: die 18-%-Karte liest 0,180 ± 0,002 unter Fremd-Licht, Nebel, ACES und Belichtung 1,3",
            Math.abs(karteY - 0.18) <= 0.002
        );
        t(
            "Täter roh gelesenes Hex 0x8e939a: Labor/Welt ≈ 2 (> 1,5) → ROT gegen die geheilte Ratsche; nach dem FARB-GESETZ 1 ± 1 % → GRÜN",
            vRoh > 1.5 && hatRot(u8roh, "ratsche") && Math.abs(vGes - 1) <= 0.01 && u8ges.urteil === "GRUEN"
        );
        // S9 — die Karte im Labor: k·L = Belichtung × Leuchtdichte (der Probe-Aufbau: Belichtung 1,3, Key 3 + Hemi).
        const k = await page.evaluate((o) => window.__laborKarte(o), { studio: S, studioId: "probe" });
        console.log(`   Labor-Karte der Probe: k·L ${k.kL} (Belichtung ${k.belichtung}), Ausgabe ${k.ausgabe}`);
        t(
            "Labor-Karte: k·L > 0 und die Belichtung 1,3 steht im Ergebnis, der Ausgabe-Pixel ist gelesen",
            k.kL > 0 && k.belichtung === 1.3 && Array.isArray(k.ausgabe)
        );
    } finally {
        await b.close();
        server.close();
    }
    // S10 — DIE KRONE VON OBEN (K68-N4, `werkbank licht --laub --oben`): das Zwei-Strom-Band über der gemessenen Blatt-Albedo,
    // der Täter beim Namen (0739 über [0, 0381, 0, 0521] — die Krone als EINE besonnte Schale).
    {
        const LL = require("./lib/licht-linsen.cjs");
        const o = (R, A) => ({ oben: { R, A, tau: [0.5, 1], pixel: 1 }, stoffe: "atlas" });
        const rotT = LL.kronenObenUrteil({ welt: { tanne: o(0.0739, 0.0942), fichte: o(0.0547, 0.1027) } });
        t(
            "Krone von oben: Band aus der Blatt-Albedo (A 0,164 → [0,0705, 0,099]), Tanne als besonnte Schale ROT beim Namen, Fichte im Band still, ohne Messung ROT",
            LL.kronenReflexionSoll(0.164, [0.5, 1]).join("/") === "0.0705/0.099" &&
                rotT.urteil === "ROT" &&
                rotT.befunde.length === 1 &&
                /tanne: Reflexion 0\.0739 .*besonnte Schale/.test(rotT.befunde[0]) &&
                LL.kronenObenUrteil({ welt: { fichte: o(0.0547, 0.1027) } }).urteil === "GRUEN" &&
                LL.kronenObenUrteil({ welt: { eiche: o(0.0797, 0.2143) } }).befunde.join().includes("schluckt") &&
                LL.kronenObenUrteil({}).urteil === "ROT"
        );
    }
    const rot = tests.filter((x) => !x.ok);
    for (const x of tests) console.log(`${x.ok ? "✅" : "❌"} SELBST-TEST: ${x.name}`);
    selbsttestEnde(rot.map((x) => x.name), `die Albedo-Wand feuert (${tests.length}/${tests.length})`);
}

// Die gespeicherte Tafel als Messung (für das Urteil ohne GPU).
function gespeichert(t) {
    const m = { labor: {}, welt: {}, karten: {}, eichung: { welt: t.karte.albedo, labor: {} } };
    for (const z of t.zeilen)
        if (z.ist) {
            m.labor[z.id] = z.ist.labor;
            m.welt[z.id] = z.ist.welt;
            for (const u of t.uhren.slice(1)) m.welt[z.id + "@" + u] = z.ist["@" + u];
        }
    for (const [s, k] of Object.entries(t.karten)) {
        if (k.ist) m.karten[s] = k.ist;
        m.eichung.labor[s] = t.karte.albedo;
    }
    return m;
}

// DIE NEUMESSUNG DER VERALTETEN ZEILEN: auf der Karte — der Job `echt` des Messplatzes (CI, die Weiche fährt die
// Karte, K65) oder lokal `--neu` unter dem GPU-Schloss — misst die Wand selbst: EINE Welt (werkbank `start` auf
// ALBEDO_WERKBANK_PORT, Standard 4589, die Seite einen Port darunter) am Ort der gespeicherten Messung, `albedo --tafel`; dann
// die Labor-Seite jedes Studios. Das Urteil der frischen Zahlen (Ratsche + Rand, Eichung, Stufe): ROT heißt, der Code hat die
// Albedo bewegt (Exit 1); im Rand stehen die Zeilen weiter ROT veraltet, bis die Tafel nachgezogen ist — der Befehl steht in
// der Ausgabe, die Messungen unter artifacts/albedo-neu/.
async function neuMessen(t, ids) {
    const { spawn, spawnSync } = require("child_process");
    const WP = String(Number(process.env.ALBEDO_WERKBANK_PORT || 4589));
    const WB = path.join(__dirname, "werkbank.cjs");
    const ordner = path.join(__dirname, "..", "artifacts", "albedo-neu", new Date().toISOString().replace(/[:.]/g, "-"));
    fs.mkdirSync(ordner, { recursive: true });
    const wb = (args) => {
        const r = spawnSync(process.execPath, [WB, ...args, "--port", WP], {
            encoding: "utf8",
            timeout: 1800000,
            maxBuffer: 1 << 26,
        });
        return { exit: r.status, aus: (r.stdout || "") + (r.stderr || "") };
    };
    const wlog = path.join(ordner, "werkbank.log");
    const fd = fs.openSync(wlog, "w");
    const w = spawn(process.execPath, [WB, "start", "--port", WP], { stdio: ["ignore", fd, fd] });
    const wd = path.join(ordner, "welt.json");
    console.log(`   Neumessung: Welt (werkbank :${WP}) und Labor — ${ordner}`);
    try {
        while (!/WERKBANK bereit/.test(ausDatei(wlog))) {
            if (w.exitCode != null) throw new Error(`die Werkbank startet nicht (${wlog})`);
            await sleep(2000);
        }
        const gw = t.gemessen.welt || {};
        const um = wb(gw.ort ? ["umstellen", "--ort", gw.ort] : ["umstellen", ...(gw.spieler || [0, 0]).map(String)]);
        if (um.exit !== 0) throw new Error("umstellen: " + um.aus.slice(-400));
        wb(["eval", "await sleep(10000); return 1"]);
        // Exit 1 heißt dort nur: das Urteil gegen das gespeicherte Labor ist ROT — die Datei trägt die Messung
        const al = wb(["albedo", "--tafel", "--datei", wd, "--ordner", path.join(ordner, "albw")]);
        if (!fs.existsSync(wd)) throw new Error("albedo --tafel ohne Messung: " + al.aus.slice(-400));
    } finally {
        wb(["stop"]);
        if (w.exitCode == null) w.kill();
    }
    const welt = ausDatei(wd, true);
    const labor = await messeLabor({ echt: false, nur: null, tafel: t });
    Object.assign(labor, { datum: new Date().toISOString(), echt: false, stand: SL.kernStand() });
    const ld = path.join(ordner, "labor.json");
    fs.writeFileSync(ld, JSON.stringify(labor, null, 1));
    const u = AT.tafelUrteil(t, {
        labor: labor.labor,
        karten: labor.karten,
        welt: welt.welt,
        eichung: { welt: welt.eichung, labor: labor.eichung.labor },
    });
    console.log(`   Welt: ${welt.geraet} · Labor: ${labor.geraet}`);
    console.log(AT.tafelTabelle(u));
    if (u.urteil !== "GRUEN") {
        console.log(`⛔ DIE ALBEDO-TAFEL: die Neumessung der veralteten Zeilen ${ids.join(", ")} ist ROT — der Code hat die Albedo bewegt.`);
        process.exit(1);
    }
    console.log(
        `DIE ALBEDO-TAFEL: die veralteten Zeilen ${ids.join(", ")} neu gemessen, im Rand — sie bleiben ROT veraltet, bis ` +
            `nachgezogen: node scripts/diag-albedo-tafel.cjs --nachziehen ${path.relative(process.cwd(), wd)} ${path.relative(process.cwd(), ld)}`
    );
    process.exit(0);
}

async function main() {
    if (argv.includes("--selftest")) return selbsttest();
    if (argv.includes("--laub")) return laborLaub();
    const t = AT.ladeTafel();
    const schema = AT.tafelPruefen(t);
    if (schema.length) {
        console.log("⛔ DIE ALBEDO-TAFEL:");
        for (const f of schema) console.log("   ❌ " + f);
        process.exit(1);
    }
    if (argv.includes("--labor")) {
        const nur = opt("--nur") ? opt("--nur").split(",") : null;
        const m = await messeLabor({ echt: argv.includes("--echt"), nur, tafel: t });
        m.datum = new Date().toISOString();
        m.echt = argv.includes("--echt");
        // DER STAND der Labor-Seite (K63-n3, abnahme-urteil `kernStand`): Version, Commit und Code-Abdruck jeder Quelle beim Messen
        m.stand = SL.kernStand();
        if (opt("--datei")) fs.writeFileSync(path.resolve(opt("--datei")), JSON.stringify(m, null, 1));
        // Gegen das gespeicherte Welt-Ist: die Labor-Seite lebt, die Welt-Seite steht in der Tafel.
        const g = gespeichert(t);
        const mm = Object.assign({}, g, {
            labor: m.labor,
            karten: m.karten,
            eichung: { welt: g.eichung.welt, labor: m.eichung.labor },
        });
        if (nur) for (const z of t.zeilen) if (z.labor && !nur.includes(z.labor.studio)) mm.labor[z.id] = g.labor[z.id];
        const u = AT.tafelUrteil(t, mm);
        if (nur) {
            u.karten = u.karten.filter((k) => nur.includes(k.studio));
            u.rot = u.rot.filter((r) => !/^Karte /.test(r.text) || nur.some((s) => r.text.includes(" " + s + ":")));
            u.urteil = u.rot.length ? "ROT" : "GRUEN";
        }
        console.log(`Labor: ${m.geraet}`);
        console.log(AT.tafelTabelle(u));
        process.exit(u.urteil === "GRUEN" ? 0 : 1);
    }
    if (argv.includes("--nachziehen")) {
        const i = argv.indexOf("--nachziehen");
        const welt = ausDatei(path.resolve(argv[i + 1]), true);
        const labor = ausDatei(path.resolve(argv[i + 2]), true);
        const m = {
            labor: labor.labor,
            karten: labor.karten,
            welt: welt.welt,
            eichung: { welt: welt.eichung, labor: labor.eichung.labor },
        };
        // der Stand beider Seiten reist in die Tafel (K63-n3: die Soll-Tafel prüft Version und Quellen, `messStand`)
        const st = (s) => (s && s.stand ? { version: s.stand.version, sha: s.stand.sha, quellen: s.stand.quellen } : {});
        const r = AT.tafelNachziehen(t, m, {
            labor: Object.assign({ datum: labor.datum, geraet: labor.geraet, echt: labor.echt }, st(labor)),
            welt: Object.assign(
                { datum: welt.datum, geraet: welt.geraet, ort: welt.ort, spieler: welt.spieler, echt: welt.echt },
                st(welt)
            ),
        });
        console.log(AT.tafelTabelle(r.u));
        if (!r.tafel) {
            console.log("\nTafel NICHT nachgezogen: " + r.grund);
            process.exit(1);
        }
        // DER SCHREIBER PRÜFT DEN STAND: in die Tafel fällt nur eine Messung am Code von heute — eine ältere schriebe eine
        // veraltete Zeile
        const sn = AT.standWand(AT.tafelStand(r.tafel, pruefsumme));
        if (sn.brueche.length || sn.neu.length) {
            console.log("\nTafel NICHT nachgezogen — die Messung trägt nicht den Code von heute:");
            for (const x of [...sn.brueche, ...sn.neu.flatMap((id) => sn.veraltet[id])]) console.log("   ❌ " + x);
            process.exit(1);
        }
        AT.tafelSchreiben(r.tafel);
        console.log(`\nTafel nachgezogen (${r.aenderungen.length}): ${r.aenderungen.join(" · ") || "nichts fiel"}`);
        process.exit(0);
    }
    // DIE WAND (GPU-frei): jede Zeile gemessen, das Ist in seiner Ratsche, der Soll-Stand benannt.
    const errs = [];
    if (!t.gemessen) errs.push("die Tafel ist ungemessen (gemessen = null)");
    // DIE NEUE ZEILE (material.K3: Birke, Fichte, Hochhaus und ihre Stufen; eine Stufen-Zeile ohne die Spalte einer Uhr): wie
    // eine veraltete laut und ohne Sperre — die Karte misst sie (`--neu`, die Station material.K3#2), nie ein Ersatz-Renderer
    const neuZ = t.zeilen.filter((z) => !z.ist || (z.welt.folgen && t.uhren.slice(1).some((u) => !z.ist["@" + u])));
    const istNeu = (r) => neuZ.some((z) => r.text.startsWith(z.id + ":") || r.text.includes(`Welt/${z.id} `));
    for (const z of t.zeilen) if (z.ist && z.labor && z.ratsche == null) errs.push(`${z.id}: ohne Ratsche`);
    for (const [s, k] of Object.entries(t.karten))
        if (!k.ist || k.ratsche == null) errs.push(`Karte ${s}: ohne Ist oder Ratsche`);
    const u = AT.tafelUrteil(t, gespeichert(t));
    for (const r of u.rot) if (!istNeu(r)) errs.push(`[${r.art}] ${r.text}`);
    for (const s of ["labor", "welt"]) if (t.gemessen && !t.gemessen[s].echt) errs.push(`[echt] ${s} nicht echt gemessen`);
    // DER STAND (K63-n8; wie H5): ungeprüft bricht, veraltet steht laut je Zeile
    const sw = AT.standWand(AT.tafelStand(t, pruefsumme));
    for (const b of sw.brueche) errs.push(`[stand] ${b}`);
    if (errs.length) {
        console.log("⛔ DIE ALBEDO-TAFEL:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    for (const id of sw.neu) for (const x of sw.veraltet[id]) console.log(`⚠ ${x} (benannt, sperrt nicht)`);
    for (const z of neuZ) console.log(`⚠ ${z.id}: ungemessen (--neu)`);
    if (sw.neu.push(...neuZ.map((z) => z.id)) && (argv.includes("--neu") || (process.env.CI === "true" && linsenGpu() === "hardware")))
        return neuMessen(t, sw.neu);
    const weit = u.zeilen
        .filter((z) => z.verhaeltnis && !z.imSoll)
        .sort((a, b) => b.abweichung - a.abweichung)
        .map((z) => `${z.id} ${z.verhaeltnis}`);
    console.log(
        `✅ DIE ALBEDO-TAFEL steht — ${t.zeilen.length} Zeilen in ${AT.PFLICHT_GRUPPEN.length} Klassen, ${Object.keys(t.karten).length} ` +
            `Studio-Karten; im Soll (±${Math.round(t.toleranz * 100)} %) ${u.soll.zeilen} Zeilen, ${u.soll.karten} Karten` +
            (weit.length ? ` — außerhalb (Labor/Welt): ${weit.join(" · ")}` : "") +
            ` · gemessen Labor ${t.gemessen.labor.datum ? t.gemessen.labor.datum.slice(0, 10) : "?"} (${t.gemessen.labor.geraet || "?"}), ` +
            `Welt ${t.gemessen.welt.datum ? t.gemessen.welt.datum.slice(0, 10) : "?"} (Ort ${t.gemessen.welt.ort || "?"}).`
    );
}

hauptLauf(main);
