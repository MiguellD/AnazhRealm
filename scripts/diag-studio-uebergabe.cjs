// diag-studio-uebergabe.cjs — DER EINE ÜBERGABE-KANAL (pipeline.K1, gate:studio-uebergabe): die Hülle schickt das Werk eines
// Studios (`AnazhHuelle.bruecke().werk`: Art · Rezept · Same · Prägung), die Welt schreibt es in den EINEN Prägungs-Speicher
// ws.studioOv (`_studioUebergabeEmpfang`), der Leser der Art baut daraus dasselbe Werk.
//   (K) im vm (`npm run check`): je Art aus PARAMS_BY_KIND ein Rezept, Same und jede Regler-Zeile zufällig (`--saat N`
//       wiederholt), der Leser der Welt bis an den Bäcker (`_studioStampFor` → `_foundryRequest` · `_buildHumanGroup` ·
//       `_ofenKreaturDials`), der Bau-Hash (`bauAbdruck`, Kanal build-asset) gleicht dem des Studio-Baus; Klang: jede Zeile
//       im Genre der Welt (`_klangStudioPreset`). (S) nur die Hülle postet eine Übergabe, EIN Empfänger. (W) kaputte Werke
//       fallen, der Kern klemmt. SELBSTTEST: ein Empfänger mit Sonderweg und ein Studio, das selbst postet, sind ROT.
//   --welt (Browser): der lebende Avatar gießt neu, ein Kreatur-Spawn trägt die Größe, der Snapshot trägt den Speicher.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const stammLib = require("./lib/stamm.cjs");
const { kanalImVm, bauAbdruck } = require("./lib/asset-worker-harness.cjs");
const { errs, check, wandEnde } = require("./lib/welt-boot.cjs").pruefer();
const { hauptLauf, nullSeite, ROOT, argOpt } = require("./lib/welt-boot.cjs");

const SAAT = Number(argOpt("--saat")) >>> 0 || Date.now() >>> 0;

// ── die Studio-Seite: die Hülle in ihrem Fenster, der Eltern-Rahmen fängt, was sie postet ──
function studioSeite() {
    const gepostet = [];
    const f = { addEventListener() {}, parent: { postMessage: (m) => gepostet.push(JSON.parse(JSON.stringify(m))) } };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, "worlds/huelle/huelle.js"), "utf8"), f);
    return { B: f.AnazhHuelle.bruecke({ welt: "probe" }), H: f.AnazhHuelle, gepostet };
}
const zufall = studioSeite().H.zufall(SAAT);
const wahl = (liste) => liste[Math.floor(zufall() * liste.length)];
function huelleSendet(werk) {
    const { B, gepostet } = studioSeite();
    if (typeof B.werk !== "function") return { fehlt: "die Hülle trägt keinen werk-Kanal (bruecke().werk)" };
    gepostet.length = 0;
    B.werk(werk.kind, werk.preset, werk.seed, werk.ov);
    const msg = gepostet.filter((m) => m && m.type === "uebergabe");
    return msg.length === 1 ? { msg: msg[0] } : { fehlt: `die Hülle postet ${msg.length} Übergaben statt einer` };
}

// ── die Welt: die Klasse aus dem Stamm im vm, ein Zustand ohne Szene; der Faden ist der Kanal im vm ──
function welt(buch, teile) {
    const { AnazhRealm, ctx } = stammLib.ladeKlasse(ROOT, teile ? { teile } : {});
    AnazhRealm._studioRenderConfig = buch.renderConfig;
    const r = Object.create(AnazhRealm.prototype);
    r.state = { blueprints: {}, player: { soul: "human" } };
    r._foundry = { ready: true, worker: {}, recipes: buch.book, paramsByKind: buch.paramsByKind };
    r.log = r.applyPlayerSoul = r._stoffBruch = () => {}; // der Avatar ohne Szene: --welt gießt ihn
    // der Weg in den Faden: was `_foundryRequest` beauftragt, hält die Probe fest (gebaut wird es im Kanal)
    r._foundryWorkerRequest = (presetId, seed, lod, ov) =>
        (r.auftrag = { presetId, seed, lod, ov }) && Promise.resolve(null);
    r._foundryIngestTakt = (e) => e;
    return { r, AnazhRealm, ctx };
}

// Der Bau, den die Welt aus ihrem Speicher bestellt — je Art ihr Leser bis an die Grenze zum Bäcker.
function weltBau({ r, AnazhRealm }, kind, preset, weltSame) {
    if (kind === "koerper") {
        let fang = null;
        r._ofenMenschTemplate = (dials, skinColor, hairColor, lod) => (
            (fang = fang || { dials, skinColor, hairColor, lod }),
            null
        );
        try {
            r._buildHumanGroup();
        } catch {
            /* der Not-Körper hinter dem Ofen braucht eine Szene — der Fang steht davor */
        }
        return (
            fang && {
                presetId: preset,
                seed: 0,
                lod: fang.lod,
                ov: { dials: fang.dials, skinColor: fang.skinColor, hairColor: fang.hairColor },
            }
        );
    }
    if (kind === "kreatur") {
        const d = r._ofenKreaturDials(preset, null);
        return d && { presetId: preset, seed: 0, lod: 0, ov: d.dials };
    }
    const pol = AnazhRealm.KIND_POLICY[kind];
    const name = (pol && pol.prefix) || "";
    const stempel = r._studioStampFor(name + preset);
    const g = r._foundryGestaltFor({ seed: weltSame, studioOv: stempel }, preset);
    r.auftrag = null;
    r._foundryRequest(preset, g, 0, stempel, 0);
    return r.auftrag;
}

// Der Bau, den die Studio-Seite zeigt: buildInstance(Rezept, Same, Stufe, Regler); die Ofen-Studios gießen mit Saat 0 —
// das Körper-Studio `gussOv()` (alle Wahlen, die Farben aus den Kern-Tafeln), tetrapoda die Dials der Gattung.
function studioBau(kind, werk, KC) {
    if (kind === "koerper") {
        const p = Object.assign({}, KC.START_PARAMS, werk.ov);
        const ov = {
            dials: p,
            skinColor: KC.SKIN_TONES[p.skinTone].hex >>> 0,
            hairColor: KC.HAIR_COLORS[p.hairColor].base >>> 0,
        };
        return { presetId: werk.preset, seed: 0, lod: 0, ov };
    }
    if (kind === "kreatur") return { presetId: werk.preset, seed: 0, lod: 0, ov: Object.assign({}, werk.ov) };
    return { presetId: werk.preset, seed: werk.seed, lod: 0, ov: werk.ov };
}

// Ein zufälliges Werk der Art: das erste Rezept, ein Same 1..64, jede Regler-Zeile auf ihrem Raster, ein Charakter der Art
// (KIND_CHARAKTER: Tradition, Kultur) und beim Körper jede Farbe aus den Kern-Tafeln.
function werkDerArt(kind, buch, KC, w) {
    const preset = Object.keys(buch.book).find((id) => buch.book[id].kind === kind);
    const ov = {};
    for (const z of buch.paramsByKind[kind]) {
        const n = z.step > 0 ? Math.floor((z.max - z.min) / z.step + 1e-9) : 0;
        const v = n > 0 ? z.min + Math.floor(zufall() * (n + 1)) * z.step : z.min + zufall() * (z.max - z.min);
        ov[z.id] = Number(Math.min(z.max, v).toFixed(6));
    }
    const achse = w.AnazhRealm.KIND_CHARAKTER[kind];
    const tab = achse && w.ctx[achse.ns][achse.tabelle];
    if (tab) Object.assign(ov, achse.ov(wahl(Object.keys(tab)), tab));
    if (kind === "koerper") {
        ov.skinTone = wahl(Object.keys(KC.SKIN_TONES));
        ov.hairColor = wahl(Object.keys(KC.HAIR_COLORS));
        for (const k of ["topColor", "bottomColor", "shoeColor"]) ov[k] = wahl(Object.keys(KC.CLOTH_COLORS));
    }
    return { kind, preset, seed: 1 + Math.floor(zufall() * 64), ov };
}

// Der Bau-Auftrag als Text mit geordneten Schlüsseln (die Reihenfolge eines Objekts ist kein Bau-Parameter).
const kanonisch = (v) =>
    v && typeof v === "object" && !Array.isArray(v)
        ? "{" +
          Object.keys(v)
              .sort()
              .map((k) => JSON.stringify(k) + ":" + kanonisch(v[k]))
              .join(",") +
          "}"
        : JSON.stringify(v);

// Eine Art durch den Kanal: Hülle → Empfang → Leser → Bau-Hash. Rückgabe { ok, info }.
async function artDurchKanal(kind, ctxK) {
    const { kanal, buch, KC, w } = ctxK;
    const werk = werkDerArt(kind, buch, KC, w);
    const h = huelleSendet(werk);
    if (h.fehlt) return { ok: false, info: h.fehlt };
    if (w.r._studioUebergabeEmpfang(h.msg) !== true)
        return { ok: false, info: `die Welt nimmt das Werk nicht an (${werk.preset})` };
    if (kind === "klang") {
        const G = w.r._klangStudioPreset();
        const KK = w.ctx.__klangCore;
        const fehl = buch.paramsByKind.klang.filter(
            (z) => (z.id === "bpm" ? G.bpm : G.dna && G.dna[z.id]) !== werk.ov[z.id]
        );
        const skala = KK.scaleFor(werk.ov.darkness);
        if (G.scaleName !== skala) fehl.push({ id: `Skala ${G.scaleName} ≠ ${skala}` });
        return {
            ok: !fehl.length,
            info: fehl.length
                ? `das Genre der Welt verfehlt ${fehl.map((z) => z.id).join(", ")}`
                : `${werk.preset}: ${buch.paramsByKind.klang.length} Zeilen im Genre der Welt`,
        };
    }
    const aW = weltBau(w, kind, werk.preset, 1 + Math.floor(zufall() * 1e6));
    if (!aW) return { ok: false, info: `der Leser der Welt bestellt keinen Bau (${werk.preset})` };
    const aS = studioBau(kind, werk, KC);
    // derselbe Auftrag baut dasselbe (G2.3, gate:asset-contract): gleicht der Auftrag der Welt dem des Studios kanonisch, trägt
    // EIN Bau beide Hashes — sonst baut jede Seite ihren
    const bau = async (a) => bauAbdruck((kanal(Object.assign({ type: "build-asset" }, a)) || {}).meshes);
    const hS = await bau(aS);
    const gleich = kanonisch(aS) === kanonisch(aW);
    const hW = gleich ? hS : await bau(aW);
    const ok = hS.teile > 0 && hS.hash === hW.hash;
    return {
        ok,
        info: `${werk.preset} Same ${werk.seed}: Studio ${hS.hash.slice(0, 10)} (${hS.teile} Teile) ${ok ? "=" : "≠"} Welt ${hW.hash.slice(0, 10)} (${hW.teile} Teile, Gestalt ${aW.seed}${gleich ? ", derselbe Auftrag" : ""})`,
    };
}

// (S) Die Sonderweg-Wand: wer außer der Hülle postet eine Übergabe?
const UEBERGABE_POST = /type\s*:\s*["']uebergabe["']/;
function sonderwege(dateien) {
    const out = [];
    for (const d of dateien)
        d.text.split("\n").forEach((z, i) => {
            if (UEBERGABE_POST.test(z)) out.push(`${d.pfad}:${i + 1}`);
        });
    return out;
}
function studioDateien() {
    const out = [];
    for (const welt of fs.readdirSync(path.join(ROOT, "worlds"))) {
        const dir = path.join(ROOT, "worlds", welt);
        if (welt === "huelle" || !fs.statSync(dir).isDirectory()) continue;
        for (const f of fs.readdirSync(dir))
            if (/\.(js|html)$/.test(f))
                out.push({ pfad: `worlds/${welt}/${f}`, text: fs.readFileSync(path.join(dir, f), "utf8") });
    }
    return out;
}

async function kanalPruefen() {
    const kanal = kanalImVm();
    const r = kanal({ type: "get-book" });
    const buch = { book: r.book, paramsByKind: r.paramsByKind, renderConfig: r.renderConfig };
    const w = welt(buch);
    const KC = w.ctx.__koerperCore;
    const arten = Object.keys(buch.paramsByKind);
    const ctxK = { kanal, buch, KC, w };
    console.log(`\n=== (K) KANAL — Saat ${SAAT}, ${arten.length} Arten aus PARAMS_BY_KIND ===`);
    let tragen = 0;
    for (const kind of arten) {
        const e = await artDurchKanal(kind, ctxK);
        if (e.ok) tragen++;
        check(`${kind}: das Werk des Studios steht byte-gleich in der Welt`, e.ok, e.info);
    }
    console.log(`      ${tragen}/${arten.length} Arten über den EINEN Kanal`);

    console.log("\n=== (S) SONDERWEG-WAND ===");
    const sw = sonderwege(studioDateien());
    check(
        "nur die Hülle postet eine Übergabe — kein Studio hat einen eigenen Weg",
        !sw.length,
        sw.join(" · ") || "0 Studio-Posts"
    );
    const stamm = stammLib.text(ROOT);
    const routen = stamm.match(/msg\.type === "uebergabe"[^\n]*/g) || [];
    check(
        "die Heimat leitet die Übergabe an genau EINEN Empfänger (_studioUebergabeEmpfang)",
        routen.length === 1 && /this\._studioUebergabeEmpfang\(/.test(routen[0]),
        `${routen.length} Route(n)`
    );

    console.log("\n=== (W) WÄNDE ===");
    const E = (m) => w.r._studioUebergabeEmpfang(m);
    const ws = () => (w.r.state.workshop && w.r.state.workshop.studioOv) || {};
    const koerper = Object.keys(buch.book).find((id) => buch.book[id].kind === "koerper");
    const tor = Object.keys(buch.book).find((id) => buch.book[id].kind === "gate");
    const hoehe = buch.paramsByKind.koerper.find((z) => z.id === "height");
    const kaputt = [
        { kind: "drache", preset: tor }, // fremde Art
        { kind: "gate", preset: koerper }, // Rezept einer anderen Art
        { kind: "gate", preset: tor, ov: { x: "y".repeat(9000) } }, // Riesen-Payload
        "uebergabe",
        [1, 2],
    ].filter((m) => E(m) !== false);
    check(
        "kaputte Werke fallen (fremde Art · fremdes Rezept · Riesen-Payload · Nicht-Objekt)",
        !kaputt.length,
        JSON.stringify(kaputt).slice(0, 120)
    );
    const ov = { height: 99, zusatz: 5, __x: 1, topColor: "neonpink", skinTone: "ebenholz" };
    const klemm =
        E({ kind: "koerper", preset: koerper, seed: 1.5, ov }) &&
        ws()[koerper].height === hoehe.max &&
        ws()[koerper].skinTone === "ebenholz" &&
        !["zusatz", "__x", "topColor", "__gestalt"].some((k) => k in ws()[koerper]);
    check(
        "der Kern klemmt (height 99 → max), fremde Schlüssel · Passagiere · erfundene Wahlen · ein krummer Same fallen",
        klemm,
        ws()[koerper] || null
    );

    console.log("\n=== SELBSTTEST — ein Sonderweg ist ROT ===");
    const teile = stammLib.teileVon(ROOT);
    const kopf = /\n {4}_studioUebergabeEmpfang\([^)]*\) \{/;
    const np = teile.find((t) => kopf.test(t.text));
    let stRot = false;
    if (np) {
        const umweg =
            '\n        const m = arguments[0];\n        if (m && m.kind === "flower") return (this.state.blumenSpeicher = m), true;';
        np.text = np.text.replace(kopf, (k) => k + umweg);
        const e = await artDurchKanal("flower", Object.assign({}, ctxK, { w: welt(buch, teile) }));
        stRot = !e.ok;
    }
    check("SELBST-TEST: der Empfänger leitet die Blume in einen eigenen Speicher → die Blume ist ROT", stRot);
    const stS = sonderwege([
        { pfad: "worlds/probe/probe.js", text: 'B.post({ type: "uebergabe", kind: "koerper", s: {} });' },
    ]);
    check(
        "SELBST-TEST: ein Studio, das selbst postet, ist ROT bei Datei:Zeile",
        stS.join() === "worlds/probe/probe.js:1",
        stS.join()
    );
}

// --welt: der Konsum im echten Spiel (Null-Renderer, Foundry warm) — das Werk über den Empfänger, die Leser der Welt bauen.
async function weltPruefen() {
    const { statikServer } = require("./lib/welt-boot.cjs");
    const PORT = Number(process.env.STUDIO_UEBERGABE_PORT || 4453);
    const server = statikServer();
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 });
    await server.zeige(page, 30000);
    const out = await page.evaluate(async () => {
        const res = {};
        await window.__weltDa();
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.mensch && f.recipes.wolf && !f._vorrat);
        const KC = window.__koerperCore;
        const lin = (hx) =>
            [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255]
                .map((c) => ((c /= 255) <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)).toFixed(3))
                .join(",");
        const farben = (g) => {
            const set = new Set();
            g.traverse((o) => {
                const c = o.geometry && o.geometry.attributes && o.geometry.attributes.color;
                if (c && c.array && c.array.length >= 3)
                    set.add([c.array[0], c.array[1], c.array[2]].map((v) => v.toFixed(3)).join(","));
            });
            return set;
        };
        const hoehe = (g) => {
            const bb = new THREE.Box3().setFromObject(g);
            return bb.max.y - bb.min.y;
        };
        const spawnNorm = () => {
            const s = r.state;
            const pm = (s.playerMesh && s.playerMesh.position) || { x: 0, y: 5, z: 0 };
            const alt = s.maxCreatures;
            s.maxCreatures = Math.max(alt || 0, s.creatures.length + 2);
            const c = r.spawnCreatureAt(pm.x + 30, pm.y + 1, pm.z, "happy", "wolf", { precise: true });
            s.maxCreatures = alt;
            if (!c) return null;
            const n = hoehe(c) / (r._creatureBodySize(c.userData.netId) || 1);
            r.removeCreature(c);
            return n;
        };
        // (B) ohne Prägung liefern die Leser die BUCH-REFERENZ (kein Merge-Klon) — der Guss-Pfad bleibt byte-alt
        res.refVorher =
            r._koerperStudioDials() === f.recipes.mensch.s && r._tetrapodaStudioDials("wolf") === f.recipes.wolf.s;
        const cVorher = farben(r.state.playerMesh);
        const normVorher = spawnNorm();
        const werk = (kind, preset, ov) =>
            r._studioUebergabeEmpfang({ type: "uebergabe", world: "probe", kind, preset, seed: 0, ov });
        res.koerperAn = werk("koerper", "mensch", {
            height: 1.15,
            mass: 0.9,
            skinTone: "ebenholz",
            topColor: "red",
            shoes: "boot",
        });
        const cAvatar = farben(r.state.playerMesh);
        res.rot = cAvatar.has(lin(KC.CLOTH_COLORS.red.hex)) && !cVorher.has(lin(KC.CLOTH_COLORS.red.hex));
        res.haut = cAvatar.has(lin(KC.SKIN_TONES.ebenholz.hex));
        res.groesse = r._humanDialSizeFactor() !== 1;
        res.kreaturAn = werk("kreatur", "wolf", { size: 3.5 });
        const normWerk = spawnNorm();
        res.spawnFaktor = normVorher && normWerk ? normWerk / normVorher : null;
        // (R) der Snapshot trägt den Speicher, der Restore läuft durch DENSELBEN Prüfer und klemmt einen vergifteten
        const snap = r.buildStateSnapshot();
        res.snap = snap.studioOv.mensch.topColor === "red" && snap.studioOv.wolf.size === 3.5;
        const echt = r._studioWerkPruefen;
        let geprueft = 0;
        r._studioWerkPruefen = function (...a) {
            geprueft++;
            return echt.apply(this, a);
        };
        r._loadStateRestoreSoulAndAtmosphere({
            studioOv: { mensch: { height: 99, topColor: "neonpink" }, wolf: snap.studioOv.wolf, drache: { size: 3 } },
        });
        delete r._studioWerkPruefen;
        const ws = r.state.workshop.studioOv;
        const hoeheMax = KC.PARAMS_BY_KIND.koerper.find((z) => z.id === "height").max;
        res.restore =
            geprueft >= 3 &&
            ws.mensch.height === hoeheMax &&
            !("topColor" in ws.mensch) &&
            !ws.drache &&
            ws.wolf.size === 3.5;
        // aufräumen: die Welt verlässt die Linse ohne Prägung
        r.state.workshop.studioOv = {};
        res.refNachher = r._koerperStudioDials() === f.recipes.mensch.s;
        return res;
    });
    await browser.close();
    server.close();
    console.log("\n=== --welt — der Konsum im echten Spiel ===");
    check("ohne Prägung liefern die Leser die Buch-Referenz (vor und nach der Linse)", out.refVorher && out.refNachher);
    check("die Welt nimmt das Werk des Körper-Studios an", out.koerperAn === true);
    check(
        "der LEBENDE Avatar gießt neu und trägt die Gestalt (rot nur mit Prägung · Haut ebenholz · Größen-Faktor ≠ 1)",
        out.rot && out.haut && out.groesse,
        out
    );
    check(
        "ein Kreatur-Spawn trägt das Werk der Gattung (size 3.5 ⇒ Welt-Gestalt ×3.5/2.4, wurf-normalisiert)",
        out.kreaturAn === true && Number.isFinite(out.spawnFaktor) && Math.abs(out.spawnFaktor - 3.5 / 2.4) < 0.05,
        `Faktor ${out.spawnFaktor}`
    );
    check("der Snapshot trägt den Prägungs-Speicher", out.snap === true);
    check(
        "der Restore läuft durch DENSELBEN Prüfer: height 99 → max, erfundene Farbe und fremdes Rezept fallen",
        out.restore === true
    );
}

hauptLauf(async () => {
    const t0 = Date.now();
    await kanalPruefen();
    console.log(`      (K) ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    if (process.argv.includes("--welt")) await weltPruefen();
    wandEnde(errs, "DER EINE ÜBERGABE-KANAL TRÄGT: jede Art reist von der Hülle in den EINEN Prägungs-Speicher, der Leser baut byte-gleich.");
});
