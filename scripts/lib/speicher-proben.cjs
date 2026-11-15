// speicher-proben.cjs — DIE PROBEN DES SPEICHERS der Werkbank (Domäne Speicher; aus scripts/werkbank.cjs, Decke 4 000 Zeilen).
//
// DER WEG DES SPEICHERS (`werkbank weg`; Preis des Orts, Schnitt 2; Heilung Gegner Gesetz F2, 15.11.): die laufende Sitzung
// (`start --echt --ort wiese`) fährt die Posen der Ratsche (spec/profiband/weg-wiese-radeon.json) und kehrt zur ersten zurück; je
// Pose eingeschwungen, 30 s der Preis-Lauf (`/lauf`), dann zwei GC (`/puffer`) — Heap, VRAM, die Typed-Halter. Die Fahrt geht als
// weg.json nach `datei` und durch H8 (`wegUrteil`: Preis je Pose, Ratsche je Pose, Zuwachs bis zur Rückkehr je Minute, ROT beim
// Pfad des Halters). Bis hier lebte der Erzeuger als ignorierte Datei unter artifacts/, und H8 las nur, was ein Mensch ihm reichte
// (`diag-profiband --weg`). → { text, gruen }
"use strict";
const { fs, path, sleep, jsonLesen, argOpt: opt } = require("./welt-boot.cjs");
const DZ = require("./draw-zaehler.cjs");

// die Schalter des Befehls liest die Probe selbst (`--ratsche` unter spec/profiband/, `--datei` das Ziel): die Werkbank reicht nur
// ihre zwei Rufe — so wächst sie um keinen Befehls-Kopf (Decke 4 000 Zeilen; main + w28-iris-frei + dieser Zweig lagen bei 4 002)
async function wegFahrt({ umstellen, rufe }) {
    if (process.argv.includes("--sprung")) return sprungFahrt({ rufe });
    const ratsche = jsonLesen(
        path.join(__dirname, "..", "..", "spec", "profiband", opt("--ratsche") || "weg-wiese-radeon.json")
    );
    const datei = path.resolve(opt("--datei") || path.join("artifacts", "profiband", "weg.json"));
    const weg = [];
    // der Ort jeder Pose steht in der Ratsche (x, z), nie im Code
    for (const { pose, x, z } of ratsche.posen) {
        if (!Number.isFinite(x) || !Number.isFinite(z))
            return { text: `weg: die Pose ${pose} der Ratsche trägt keinen Ort (x, z)`, gruen: false };
        const t = Date.now();
        await umstellen({ x, z });
        for (let i = 0; i < 90; i++) {
            const e = await rufe("/eval", { code: "return typeof __einschwingOffen === 'function' ? __einschwingOffen(r) : null;" }); // prettier-ignore
            if (!e || !e.ergebnis || !Object.keys(e.ergebnis).length) break;
            await sleep(2000);
        }
        await rufe("/lauf", { sek: 30, ein: 30 });
        const puf = await rufe("/puffer", { top: 12 });
        const h = await rufe("/eval", { code: "return __heapHalter(r, 3).filter(([, b]) => b >= 131072).map(([k, b]) => [k, +(b / 1048576).toFixed(2)]);" }); // prettier-ignore
        weg.push({ pose, x, z, sek: Math.round((Date.now() - t) / 1000), heap_mb: puf.heapMB, vram_mb: puf.vram && puf.vram.mb, halter: h.ergebnis || [] }); // prettier-ignore
        console.log(`${pose}: nach GC Heap ${puf.heapMB} MB · VRAM ${puf.vram && puf.vram.mb} MB`);
    }
    fs.mkdirSync(path.dirname(datei), { recursive: true });
    fs.writeFileSync(datei, JSON.stringify(weg, null, 1));
    const posen = weg.map((p) => ({ pose: p.pose, heapMB: p.heap_mb, halter: p.halter, min: p.sek / 60 }));
    const f = DZ.wegUrteil(posen, ratsche);
    const kopf = `H8 der Weg: ${posen.map((p) => p.pose + " " + p.heapMB + " MB").join(" · ")} — ${datei}`;
    return { text: kopf + f.map((z) => "\n  ❌ H8 " + z).join(""), gruen: !f.length };
}

// DER FALL SPRUNG (w28-reise-raeumt, `werkbank weg --sprung [--eigen] [--selbsttest]`): die verlassene Welt stirbt mit dem Wechsel.
// Der Spieler reist (die Konsole, `reise 17.09 61.93`) und heim; je Sprung hält die Probe die verlassene Welt nur schwach
// (`WeakRef` auf ihren Zustand, darin die Marke `VerlasseneWelt`), wartet auf das erste Bild der Ziel-Welt und sammelt zweimal
// (`/puffer`). Lebt sie danach, hält sie ein Täter — ihn nennt der Heap-Schnappschuss beim Namen: der kürzeste Halter-Pfad von der
// Wurzel zur Marke, jeder Pfeil mit Skript und Zeile (`pfadZurMarke`). Bis hier hielt ein Regler-Pfeil der Werkstatt den Spieler der
// ersten Welt (`werkstatt-hud.js`) und ein Pfeil der Ankunft ihre Geburt (`dirigent-ankunft.js`): jede Reise trug die Heimat
// weiter (Radeon 296 → 641 MB nach einer Runde). Der Selbsttest pflanzt einen Täter in die Welt (ein Pfeil am Fenster fängt den
// Zustand) und muss ihn beim Namen ROT nennen. Leser: der Exit der Werkbank (`npm run gate:speicher-sprung:echt`).
// DER FALL GESTALTEN (w28-reise-raeumt, Schnitt A): mit der Welt sterben ihre Gestalten — jede, die ein Render-Objekt trägt, in
// der Szene (ohne die Glieder der Seite, `_seite.szene`) und außerhalb (das Dreieck jedes Passes in einem Glied des Zustands, das
// nicht reist). Die Probe hält sie schwach; lebt nach dem Sprung und zwei GC eine, nennt der Schnappschuss ihren Halter beim Namen
// (Marke `VerlasseneGestalt`). Bis hier hielten sie: das geteilte Dreieck der Pässe (der Geometrie-Hörer des Registers), die
// Vorlagen-Bindungen jedes Knoten-Baus an den Texturen der Sitzung, der Bauer (`object`) hinter den Update-Pfeilen des Stands,
// der Stand eines Welt-Stoffs im Cache der Sitzung, der Leib am Skinning- und am Verweis-Knoten und die Zeichen-Listen ruhender
// Kameras (Radeon: 109 Gestalten der vier Orte lebten nach einer Runde in der Heimat). Der Selbsttest pflanzt auch hier einen
// Täter (ein Pfeil am Fenster fängt eine Gestalt). OHNE die Leiber mit Skelett: den ersten Leib seines Schlüssels hält r184s
// Skinning-Knoten am Stand eines geteilten Stoffs als Rückfall seines Updates (begrenzt durch die Zahl der Stände, kein Zuwachs je Ort).
const GESTALTEN_MERKEN = `window.__sprungGestalten = []; { const reist = new Set([...r._seite.zustand, ...r.constructor.WELT_GRENZE.seite]);
    const merke = (o) => { let leib = false; o.traverse((x) => { if (x.isSkinnedMesh || x.isBone) leib = true; }); if (leib) return;
        o.traverse((x) => { if (x.__renderObjekte && x.__renderObjekte.length) window.__sprungGestalten.push([x.name || x.type, new WeakRef(x)]); }); };
    for (const o of r.state.scene.children) if (!r._seite.szene.has(o)) merke(o);
    for (const k of Object.keys(r.state)) { const v = r.state[k]; if (reist.has(k) || !v || typeof v !== "object" || v.isObject3D) continue;
        for (const x of Object.values(v)) if (x && x.isObject3D && !x.parent) merke(x); } }`;
// Die Beine: die Heimat (die erste Welt der Seite) geht, ein Ort geht (im Selbsttest mit den gepflanzten Tätern), der zweite Ort geht
const SPRUNG_ZIELE = ["reise 17.09 61.93", "reise 79.07 0.56", "reise heim"];
async function sprungFahrt({ rufe }) {
    const port = Number(opt("--port", process.env.WERKBANK_PORT || 4490));
    const selbst = process.argv.includes("--selbsttest");
    const tor = process.argv.includes("--eigen") ? require("./welt-boot.cjs").werkbankTor(port) : null;
    if (tor) await tor.bereit;
    try {
        const ev = async (code) => {
            const e = await rufe("/eval", { code });
            if (e && e.fehler) throw new Error("sprung: " + JSON.stringify(e.fehler).slice(0, 400));
            return e.ergebnis;
        };
        await ev("__loop(1); const ende = performance.now() + 120000; while (!(r.state && r.state._weltbildDa) && performance.now() < ende) await new Promise((q) => setTimeout(q, 50)); return 1;"); // prettier-ignore
        const [zeilen, rot, selbstRot] = [[], [], []];
        for (const satz of SPRUNG_ZIELE) {
            const gepflanzt = selbst && satz === SPRUNG_ZIELE[1];
            const pflanze = gepflanzt
                ? "window.__sprungTaeter = ((s) => () => s)(r.state); window.__sprungTaeterGestalt = ((g) => () => g)(window.__sprungGestalten[0][1].deref());"
                : "";
            const s = await ev(`__loop(1); window.__sprungAlt = new WeakRef(r.state); r.state.__sprungMarke = new (class VerlasseneWelt {})(); ${GESTALTEN_MERKEN} ${pflanze}
                const slug = r.state.worldMeta.slug, t0 = performance.now(); r.processChatCommand(${JSON.stringify(satz)});
                const ende = t0 + 90000; while (performance.now() < ende) { const z = r.state; if (z !== window.__sprungAlt.deref() && z._weltbildDa && !r._weltTausch) return { von: slug, nach: z.worldMeta.slug, ms: Math.round(performance.now() - t0) }; await new Promise((q) => setTimeout(q, 50)); }
                return { von: slug, nach: null };`); // prettier-ignore
            if (!s.nach) return { text: `SPRUNG: „${satz}“ kam nicht an (aus ${s.von})`, gruen: false };
            await sleep(3000);
            const puf = await rufe("/puffer", { top: 1 });
            const lebt = await ev("return !!(window.__sprungAlt && window.__sprungAlt.deref());");
            // die Gestalten: die gepflanzte (im Selbsttest) oder die erste lebende trägt die Marke
            const G =
                await ev(`const T = window.__sprungTaeterGestalt, L = window.__sprungGestalten.map(([n, w]) => [n, w.deref()]).filter((x) => x[1]);
                const m = T ? T() : L.length ? L[0][1] : null; if (m) m.__sprungMarke = new (class VerlasseneGestalt {})();
                const art = {}; for (const [n] of L) art[n] = (art[n] || 0) + 1;
                return { von: window.__sprungGestalten.length, leben: L.length, arten: Object.entries(art).sort((a, b) => b[1] - a[1]).slice(0, 6).map((x) => x.join(" × ")).join(", ") };`);
            const gPfad = G.leben ? await pfadZurMarke(port, "VerlasseneGestalt").catch((e) => "(der Schnappschuss fiel: " + e.message + ")") : ""; // prettier-ignore
            await ev("for (const [, w] of window.__sprungGestalten) { const o = w.deref(); if (o) delete o.__sprungMarke; } delete window.__sprungTaeterGestalt; window.__sprungGestalten = null; return 1;"); // prettier-ignore
            const gRot = `${G.leben} von ${G.von} Gestalten der verlassenen Welt „${s.von}“ leben nach dem Sprung und zwei GC (${G.arten}) — gehalten über: ${gPfad}`;
            if (gepflanzt) {
                if (!G.leben)
                    selbstRot.push("der gepflanzte Täter (window.__sprungTaeterGestalt) hielt keine Gestalt — die Probe sieht ihn nicht"); // prettier-ignore
                else if (!/__sprungTaeterGestalt/.test(gPfad))
                    selbstRot.push("der gepflanzte Täter der Gestalt blieb ungenannt: " + gRot); // prettier-ignore
                else zeilen.push("✅ SELBSTTEST der gepflanzte Täter der Gestalt beim Namen: " + gPfad);
            } else if (G.leben) rot.push(gRot);
            zeilen.push(
                `${s.von} → ${s.nach} ${s.ms} ms · Heap nach GC ${puf.heapMB != null ? puf.heapMB + " MB" : "(die Puffer-Lesung fiel)"} · die verlassene Welt ${lebt ? "LEBT" : "ist fort"} · Gestalten ${G.leben} von ${G.von} leben`
            );
            if (!lebt) {
                if (gepflanzt)
                    selbstRot.push(
                        "der gepflanzte Täter (window.__sprungTaeter) hielt die Welt nicht — die Probe sieht ihn nicht"
                    );
                continue;
            }
            const pfad = await pfadZurMarke(port, "VerlasseneWelt").catch(
                (e) => "(der Schnappschuss fiel: " + e.message + ")"
            );
            if (gepflanzt) await ev("delete window.__sprungTaeter; return 1;");
            const satzRot = `die verlassene Welt „${s.von}“ lebt nach dem Sprung und zwei GC — gehalten über: ${pfad}`;
            if (!gepflanzt) rot.push(satzRot);
            else if (!/__sprungTaeter/.test(pfad)) selbstRot.push("der gepflanzte Täter blieb ungenannt: " + satzRot);
            else zeilen.push("✅ SELBSTTEST der gepflanzte Täter beim Namen: " + pfad);
        }
        const kopf = `SPRUNG ${zeilen.join("\n  ")}`;
        const alle = [...rot.map((z) => "❌ SPRUNG " + z), ...selbstRot.map((z) => "⛔ SELBSTTEST " + z)];
        return { text: kopf + alle.map((z) => "\n  " + z).join(""), gruen: !alle.length };
    } finally {
        if (tor) tor.stop();
    }
}
// Der Browser einer Werkbank (ihr Profil `anazh-<pid>-profil-*` trägt DevToolsActivePort): die pid lauscht am Steuer-Port
function werkbankPid(port) {
    const cp = require("child_process");
    if (process.platform === "win32") {
        const z = cp.execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" }).split(/\r?\n/);
        const m = z
            .map((l) => l.trim().split(/\s+/))
            .find((t) => t[1] && t[1].endsWith(":" + port) && /LISTEN|ABH/.test(t[3]));
        return m ? Number(m[4]) : null;
    }
    const m = /pid=(\d+)/.exec(cp.execFileSync("ss", ["-ltnpH", `sport = :${port}`], { encoding: "utf8" }));
    return m ? Number(m[1]) : null;
}
// DER HALTER BEIM NAMEN: ein Schnappschuss des Heaps der Seite (ein zweiter CDP-Klient am Browser der Werkbank), dann der kürzeste
// Pfad ohne schwache Kanten von der Wurzel zum Objekt der Klasse `marke` — je Pfeil sein Name, Skript und Zeile, je Kontext die
// Variable, je Feld sein Name
async function pfadZurMarke(port, marke) {
    const os = require("os");
    const pid = werkbankPid(port);
    const tmp = os.tmpdir();
    const prof = pid && fs.readdirSync(tmp).map((n) => path.join(tmp, n)).find((d) => path.basename(d).startsWith(`anazh-${pid}-profil-`) && fs.existsSync(path.join(d, "DevToolsActivePort"))); // prettier-ignore
    if (!prof) throw new Error(`kein Browser-Profil der Werkbank (Port ${port}, pid ${pid})`);
    const [dp, weg] = fs.readFileSync(path.join(prof, "DevToolsActivePort"), "utf8").trim().split(/\r?\n/);
    const b = await require("puppeteer").connect({ browserWSEndpoint: `ws://127.0.0.1:${dp}${weg}`, defaultViewport: null, protocolTimeout: 600000 }); // prettier-ignore
    const datei = path.join(tmp, `sprung-${process.pid}.heapsnapshot`);
    try {
        const seite = (await b.pages()).find((p) => /\/index\.html/.test(p.url()));
        const cdp = await seite.target().createCDPSession();
        const aus = fs.createWriteStream(datei);
        cdp.on("HeapProfiler.addHeapSnapshotChunk", (e) => aus.write(e.chunk));
        await cdp.send("HeapProfiler.takeHeapSnapshot", { reportProgress: false });
        await new Promise((ok) => aus.end(ok));
        await cdp.detach();
        return halterPfad(fs.readFileSync(datei), marke);
    } finally {
        b.disconnect();
        fs.rmSync(datei, { force: true });
    }
}
// der Schnappschuss als Puffer (über 512 MB trägt kein String): die Zahlen-Reihen gelesen, nie als JSON
function halterPfad(B, marke) {
    const ab = (s) => B.indexOf(Buffer.from(s)) + Buffer.byteLength(s);
    const zahlen = (i) => {
        const out = [];
        for (let v = 0, hat = false; ; i++) {
            const c = B[i];
            if (c >= 48 && c <= 57) ((v = v * 10 + c - 48), (hat = true));
            else if (c === 44 || c === 93) {
                if (hat) out.push(v);
                ((v = 0), (hat = false));
                if (c === 93) return out;
            }
        }
    };
    const iN = ab('"nodes":[');
    const meta = JSON.parse(
        B.subarray(ab('"snapshot":'), iN - 9)
            .toString("utf8")
            .replace(/,\s*$/, "")
    ).meta;
    const N = zahlen(iN),
        E = zahlen(ab('"edges":[')),
        L = zahlen(ab('"locations":['));
    let ende = B.length - 1;
    while (B[ende] !== 93) ende--;
    const S = JSON.parse("[" + B.subarray(ab('"strings":['), ende).toString("utf8") + "]");
    const [nf, ef, lf] = [meta.node_fields, meta.edge_fields, meta.location_fields];
    const [NF, EF, LF] = [nf.length, ef.length, lf.length];
    const [nT, eT] = [meta.node_types[0], meta.edge_types[0]];
    const [iTy, iNa, iEc] = ["type", "name", "edge_count"].map((k) => nf.indexOf(k));
    const [jTy, jNa, jTo] = ["type", "name_or_index", "to_node"].map((k) => ef.indexOf(k));
    const n = N.length / NF;
    const erst = new Float64Array(n + 1);
    for (let i = 0, e = 0; i < n; i++) ((erst[i] = e), (e += N[i * NF + iEc] * EF));
    erst[n] = E.length;
    const typ = (i) => nT[N[i * NF + iTy]];
    const name = (i) => S[N[i * NF + iNa]];
    const vater = new Int32Array(n).fill(-1);
    const kante = new Float64Array(n).fill(-1);
    const q = new Int32Array(n);
    // eine Marke oder eine Liste: je Marke der erste Knoten der Breitensuche (der kürzeste Pfad)
    const gesucht = new Set([].concat(marke));
    const ziele = new Map();
    let [h, t] = [0, 1];
    vater[0] = 0;
    const schwach = new Set(["weak", "shortcut"].map((x) => eT.indexOf(x)));
    while (h < t && ziele.size < gesucht.size) {
        const v = q[h++];
        for (let e = erst[v]; e < erst[v + 1]; e += EF) {
            if (schwach.has(E[e + jTy])) continue;
            const w = E[e + jTo] / NF;
            if (vater[w] !== -1) continue;
            ((vater[w] = v), (kante[w] = e), (q[t++] = w));
            if (typ(w) === "object" && gesucht.has(name(w)) && !ziele.has(name(w))) ziele.set(name(w), w);
        }
    }
    const ort = new Map();
    for (let k = 0; k < L.length; k += LF) ort.set(L[k + lf.indexOf("object_index")] / NF, [L[k + lf.indexOf("script_object_index")] / NF, L[k + lf.indexOf("line")] + 1]); // prettier-ignore
    const pfad = (ziel) => {
        const glieder = [];
        for (let w = ziel; w !== 0; w = vater[w]) {
            const v = vater[w],
                e = kante[w],
                et = eT[E[e + jTy]],
                x = E[e + jNa];
            const feld =
                et === "element" || et === "hidden" ? `[${x}]` : et === "context" ? `Kontext.${S[x]}` : `.${S[x]}`;
            const o = ort.get(v);
            const wer = typ(v) === "closure" ? `Pfeil ${name(v) || "anonym"}${o ? " " + String(name(o[0])).replace(/^.*\/|\?.*$/g, "") + ":" + o[1] : ""}` : typ(v) === "object" ? String(name(v)).replace(/\s*\/.*$/, "") : `(${typ(v)}: ${String(name(v)).slice(0, 40)})`; // prettier-ignore
            glieder.push(`${wer}${feld}`);
        }
        return glieder
            .reverse()
            .filter((g) => !/^\((synthetic|hidden)/.test(g))
            .join(" › ");
    };
    const kein = (m) => `(keine Marke „${m}“ erreichbar — schwach gehalten)`;
    if (!Array.isArray(marke)) return ziele.has(marke) ? pfad(ziele.get(marke)) : kein(marke);
    return new Map(marke.map((m) => [m, ziele.has(m) ? pfad(ziele.get(m)) : null]));
}

module.exports = { wegFahrt, halterPfad };
