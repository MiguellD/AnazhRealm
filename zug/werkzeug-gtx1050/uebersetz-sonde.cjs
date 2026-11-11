#!/usr/bin/env node
// uebersetz-sonde.cjs <lauf.json> — folgt die Übersetzungszeit einer Pipeline der Größe ihres Fragment-Texts? Die Fragment-Texte
// der Standard-Stoffe eines Laufs (FREI_SHADER=1, `shader`) werden auf der Karte EINZELN und ALLEIN übersetzt: eigene Seite ohne
// Spiel, je Text ein künstlicher Vertex-Text (er gibt jedes Varying des Fragments mit 0 aus), `layout: "auto"`, Ziele nach dem
// Ausgabe-Typ, `createRenderPipelineAsync` — zwei Runden (die zweite zeigt den Cache). Dazu je Text eine GEKÜRZTE Fassung
// (FREI_KURZ=1): dieselben Bindungen und Varyings, `main` gibt nur Null aus — der Boden einer Pipeline ohne Rechnung.
// Im Spiel-Baum rufen (unter dem GPU-Schloss):  node <werkzeug>/gc/uebersetz-sonde.cjs <lauf.json>
const path = require("path");
const fs = require("fs");
const os = require("os");
const cp = require("child_process");
const { statikServer } = require(path.resolve("scripts/lib/welt-boot.cjs"));
const lauf = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const texte = Object.entries(lauf.shader || {})
    .filter(([, t]) => /@fragment/.test(t))
    .map(([k, t]) => ({ k, t }));
const PORT = 4418;
let ergebnis = null;
function SEITE() {
    const melde = (o) => fetch("/__ergebnis", { method: "POST", body: JSON.stringify(o) });
    (async () => {
        const aus = { adapter: "", laeufe: [], fehler: [] };
        try {
            const texte = await (await fetch("/__texte.json")).json();
            const adapter = await navigator.gpu.requestAdapter();
            aus.adapter = [adapter.info.vendor, adapter.info.architecture, adapter.info.description].filter(Boolean).join(" ");
            const device = await adapter.requestDevice({ requiredFeatures: [...adapter.features].filter((f) => /texture-compression-bc|depth32float-stencil8|float32-filterable|indirect-first-instance|dual-source-blending|clip-distances/.test(f)) });
            device.addEventListener("uncapturederror", (e) => aus.fehler.push(String(e.error && e.error.message).slice(0, 300)));
            // der Kopf des Fragment-Einstiegs: seine Eingänge (Varyings mit Ort und Interpolation, Builtins) und sein Ausgabe-Typ
            const kopf = (t) => {
                const i = t.search(/@fragment\s+fn\s+main\s*\(/);
                let j = t.indexOf("(", i);
                let tiefe = 0;
                let ende = j;
                for (; ende < t.length; ende++) {
                    if (t[ende] === "(") tiefe++;
                    else if (t[ende] === ")" && --tiefe === 0) break;
                }
                const params = t.slice(j + 1, ende);
                const rest = t.slice(ende, t.indexOf("{", ende));
                return { params, aus: (rest.match(/->\s*(\w+)/) || [])[1] || "", rumpfAb: t.indexOf("{", ende) };
            };
            const vertexZu = (t) => {
                const K = kopf(t);
                const felder = [];
                // Parameter am obersten Komma trennen
                let tiefe = 0;
                let ab = 0;
                const teile = [];
                for (let i = 0; i <= K.params.length; i++) {
                    const c = K.params[i];
                    if (c === "(" || c === "<") tiefe++;
                    else if (c === ")" || c === ">") tiefe--;
                    else if ((c === "," && tiefe === 0) || i === K.params.length) {
                        teile.push(K.params.slice(ab, i).trim());
                        ab = i + 1;
                    }
                }
                for (const p of teile) {
                    const m = p.match(/@location\(\s*(\d+)\s*\)\s*((?:@interpolate\([^)]*\)\s*)?)(\w+)\s*:\s*(.+)$/);
                    if (m) felder.push({ ort: m[1], inter: m[2].trim(), name: m[3], typ: m[4].trim() });
                }
                const null0 = (typ) => (/^(i32|u32|f32|bool)$/.test(typ) ? typ + "(0)" : typ + "()");
                return (
                    "struct VO { @builtin(position) p : vec4<f32>,\n" +
                    felder.map((f) => "@location(" + f.ort + ") " + (f.inter || (/^(i32|u32|vec\d<[iu]32>)$/.test(f.typ) ? "@interpolate(flat) " : "")) + " " + f.name + " : " + f.typ + ",").join("\n") +
                    "\n}\n@vertex fn main(@builtin(vertex_index) vi : u32) -> VO { var o : VO; o.p = vec4<f32>(f32(vi), 0.0, 0.0, 1.0);\n" +
                    felder.map((f) => "o." + f.name + " = " + null0(f.typ) + ";").join("\n") +
                    "\nreturn o; }"
                );
            };
            const zieleVon = (t) => {
                const K = kopf(t);
                const s = t.match(new RegExp("struct\\s+" + K.aus + "\\s*\\{([^}]*)\\}"));
                const n = s ? (s[1].match(/@location/g) || []).length : 1;
                const tiefe = s ? /frag_depth/.test(s[1]) : false;
                return { ziele: Array.from({ length: Math.max(1, n) }, () => ({ format: "rgba16float" })), tiefe, typ: K.aus, struktur: s ? s[1] : "" };
            };
            // die gekürzte Fassung: alles vor `fn main` bleibt, der Rumpf gibt den Ausgabe-Typ mit Nullen zurück
            const kurzVon = (t) => {
                const K = kopf(t);
                return t.slice(0, K.rumpfAb) + "{ var o : " + K.aus + "; return o; }";
            };
            const einmal = async (name, fs, vs, Z) => {
                const t0 = performance.now();
                const vm = device.createShaderModule({ code: vs });
                const fm = device.createShaderModule({ code: fs });
                const info = await fm.getCompilationInfo();
                const t1 = performance.now();
                const f = info.messages.filter((m) => m.type === "error").map((m) => m.message.slice(0, 160));
                if (f.length) return { name, kb: +(fs.length / 1000).toFixed(1), fehler: f.slice(0, 2) };
                device.pushErrorScope("validation");
                let ok = true;
                try {
                    await device.createRenderPipelineAsync({
                        layout: "auto",
                        vertex: { module: vm, entryPoint: "main" },
                        fragment: { module: fm, entryPoint: "main", targets: Z.ziele },
                        primitive: { topology: "triangle-list" },
                        ...(Z.tiefe ? { depthStencil: { format: "depth32float", depthWriteEnabled: true, depthCompare: "always" } } : {}),
                    });
                } catch (e) {
                    ok = String(e.message).slice(0, 200);
                }
                const scope = await device.popErrorScope();
                const t2 = performance.now();
                return { name, kb: +(fs.length / 1000).toFixed(1), wgslMs: Math.round(t1 - t0), pipelineMs: Math.round(t2 - t1), ok, scope: scope ? String(scope.message).slice(0, 200) : "" };
            };
            for (let runde = 1; runde <= 2; runde++)
                for (const { k, t } of texte) {
                    const Z = zieleVon(t);
                    aus.laeufe.push(Object.assign({ runde, art: "ganz" }, await einmal(k, t, vertexZu(t), Z)));
                    aus.laeufe.push(Object.assign({ runde, art: "kurz" }, await einmal(k, kurzVon(t), vertexZu(t), Z)));
                    await melde(aus);
                }
        } catch (e) {
            aus.fehler.push("Wurf: " + String(e && e.stack ? e.stack : e).slice(0, 400));
        }
        aus.ende = true;
        melde(aus);
    })();
}
const server = statikServer({
    seiten: {
        "/__uebersetzen.html": () => '<!doctype html><meta charset="utf-8"><title>übersetzen</title><script src="/__lauf.js"></script>',
        "/__lauf.js": () => "(" + SEITE.toString() + ")();",
        "/__texte.json": () => JSON.stringify(texte),
        "/__ergebnis": (req) =>
            new Promise((ok) => {
                let b = "";
                req.on("data", (d) => (b += d));
                req.on("end", () => {
                    try {
                        ergebnis = JSON.parse(b);
                    } catch {}
                    ok("ok");
                });
            }),
    },
});
server.listen(PORT, "127.0.0.1", () => {
    const profil = fs.mkdtempSync(path.join(os.tmpdir(), "anazh-uebersetz-"));
    const exe = require("puppeteer").executablePath();
    const args = ["--headless=new", "--no-sandbox", ...require(path.resolve("scripts/lib/software-gpu.cjs")).echteWebGpuArgs(), "--user-data-dir=" + profil, "--no-first-run", `http://127.0.0.1:${PORT}/__uebersetzen.html`];
    const kind = cp.spawn(exe, args, { stdio: "ignore" });
    let takte = 0;
    const wache = setInterval(() => {
        takte++;
        if (!((ergebnis && ergebnis.ende) || takte > 240)) return;
        clearInterval(wache);
        try {
            cp.execSync(`taskkill /PID ${kind.pid} /T /F`, { stdio: "ignore" });
        } catch {}
        server.close();
        const e = ergebnis || { laeufe: [], fehler: ["keine Meldung der Seite"] };
        console.log("ÜBERSETZ-SONDE · " + (e.adapter || "?") + " · " + texte.length + " Fragment-Texte · Fehler: " + (e.fehler.length ? e.fehler.join(" | ") : "keine"));
        for (const l of e.laeufe) console.log("Runde " + l.runde + " " + l.art.padEnd(4) + " " + String(l.kb).padStart(6) + " KB · WGSL " + String(l.wgslMs ?? "—").padStart(5) + " ms · Pipeline " + String(l.pipelineMs ?? "—").padStart(5) + " ms · " + l.name + (l.fehler ? " · FEHLER " + l.fehler.join(" / ") : "") + (l.ok !== true && l.ok !== undefined ? " · " + l.ok : "") + (l.scope ? " · " + l.scope : ""));
        if (process.env.FREI_JSON) fs.writeFileSync(process.env.FREI_JSON, JSON.stringify(e));
        try {
            fs.rmSync(profil, { recursive: true, force: true });
        } catch {}
        process.exit(e.laeufe.length ? 0 : 1);
    }, 500);
});
