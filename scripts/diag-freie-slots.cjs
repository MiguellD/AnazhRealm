// diag-freie-slots.cjs — DIE SLOT-LINSE (gate:freie-slots, 05.10.): ein freier Slot und eine leere Hülle zeichnen NIE,
// in keinem Pass.
//
// Befund (Radeon 890M, Mess-Wiese −900/−850, drei Wander-Schleifen à 1,2 km, Regler voll): `_archGroupFree` setzte nur die
// Matrix auf eine Null-3×3 und legte den Slot in eine Free-Liste; `mesh.count` blieb am Höchststand, jede Null-Instanz lief
// durch den Vertex-Shader jedes Passes — 890 freie Slots mit 1,73 M Dreiecken in 202 Gruppen, 92 leere Hüllen in der
// Gnadenfrist zeichneten 0,99 M Dreiecke ins Hauptbild (Band-Klasse `leer:*`, Haushalt 0). Der Schnitt: jede Instanz-Senke
// ist DICHT — Freigeben zieht die letzte Instanz in die Lücke (`_instanzUmzug`), `count` schreibt nur `_instanzZahl`, eine
// leere Senke ist unsichtbar.
//
// Die Linse fährt die echte Welt (Null-Renderer, Foundry an) durch eine Wander-Sequenz — fort und zurück, mehrere Umzüge —
// und hält nach jedem Umzug JEDE Instanz-Senke gegen ihre lebenden Instanzen:
//   G  Instanz-Gruppen: count == liveCount, Marke i trägt Slot i (dahinter keine), keine Null-3×3 in [0, count), leer ⇒
//      unsichtbar; MATRIX-TREUE: jede Marke eines Architektur-Eintrags zeigt die Matrix, die der Eintrag schriebe, und
//      ihr Slot nennt ihn als Eigentümer (der Umzug trug die richtige Instanz)
//   F  Fundament-Pool: count == Zahl der Sockel, Rückverweis Slot ↔ Eintrag geschlossen
//   S  Nah-Wiese · Zaun · Karten-Sicht: keine Null-3×3 in [0, count), leer ⇒ unsichtbar; die Nah-Streu (W7: ihre Senken
//      sind Daten, ihr Stoff-Satz zeichnet): Σ Blöcke == Anzahl, keine Senke trägt eine Mesh
//   W  Nah-Wiese (Welle 6): ihre Senken füllt der Sicht-Satz `_nahWieseSicht` im Haupt-Pass — der Null-Renderer zeichnet
//      nie, die Senken stünden leer und S prüfte nichts. Die Linse legt den Satz nach jedem Umzug SELBST
//      (scripts/lib/wiese-sicht.cjs: Linsen-Kamera am Ring-Mittelpunkt, Blick auf den nächsten Büschel) und verlangt:
//      der Ring trägt Büschel, JEDE Senke anzahl > 0, jede gelegte Instanz steht im Ring um das Auge
//      (der Selbsttest blickt in den Himmel — leere Senken — und nullt eine gelegte Instanz: beides rot und genannt)
// Jeder Befund trägt seinen NAMEN: Senke · Pass (haupt = Kamera-Layer, schatten = k0/k1 über castShadow; eine unsichtbare
// Senke betritt keinen Pass) · Dreiecke.
//   A  der Abschied (W6): jede Senke, die `_instanzMesh` baut, verlässt den Graphen nur über `_instanzAbschied` (r184 gibt
//      bei `mesh.dispose()` nichts frei — ihre Instanz-Puffer blieben in seinem Register, `buf:verwaist` der Band-Linse), und
//      keine Senke im Graphen bekommt ihn (ihr Speicher-Puffer wäre tot)
//   Q  Quelle (kommentar-frei): `count` einer Instanz-Senke schreibt nur `_instanzZahl`; die Free-Liste und der
//      Shader-Riegel der toten Karten-Slots (`_lebt`) sind weg.
// SELBSTTEST (--selftest, nach der echten Messung in derselben Welt): ein eingeschmuggelter freier Slot (count +1 an einer
// lebenden Gruppe, Null-3×3), eine sichtbare leere Hülle, eine vertauschte Matrix (ein Umzug ohne Matrix) und eine
// eingeschmuggelte `count`-Zeile in der Quelle, eine Senke ohne Abschied und ein Abschied im Graphen → jeder rot und beim
// Namen genannt.
//   node scripts/diag-freie-slots.cjs [--selftest]          (npm run gate:freie-slots; Port: FREIE_SLOTS_PORT)
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { installWieseSicht } = require("./lib/wiese-sicht.cjs");

const PORT = Number(process.env.FREIE_SLOTS_PORT || 4527);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

// ── Q: die Quelle. Kommentare fallen, dann zählt jede `<x>.count =`-Zuweisung, deren Empfänger keine bekannte
//      Nicht-Instanz-Zahl ist (Inventar-Slots, drawRange). Erlaubt ist genau die eine im Chokepoint `_instanzZahl`.
const ERLAUBT = /^(slot|targetSlot|inv\[existingIdx\]|z\.drawRange)$/;
// Block-Kommentare behalten ihre Zeilenumbrüche (die Zeilennummern der Befunde bleiben die der Datei).
function ohneKommentare(src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""))
        .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}
function quellBefunde(src) {
    const b = [];
    const code = ohneKommentare(src);
    const zeilen = code.split("\n");
    const kopf = zeilen.findIndex((z) => /^\s*static _instanzZahl\(mesh, n\) \{/.test(z));
    if (kopf < 0) b.push("der Chokepoint `static _instanzZahl(mesh, n)` fehlt");
    zeilen.forEach((z, i) => {
        for (const m of z.matchAll(/([A-Za-z_$][\w$.[\]]*)\.count\s*=(?!=)/g)) {
            if (ERLAUBT.test(m[1])) continue;
            if (m[1] === "mesh" && kopf >= 0 && i > kopf && i <= kopf + 3) continue;
            b.push(`Zeile ${i + 1}: \`${m[0].trim()}\` schreibt count an _instanzZahl vorbei`);
        }
    });
    if (/\b_lebt\b/.test(code)) b.push("der Shader-Riegel `_lebt` (tote Karten-Slots) lebt noch");
    if (/\.free\.(push|pop)\(/.test(code)) b.push("eine Free-Liste (`.free.push/pop`) lebt noch");
    return b;
}

async function welt() {
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.evaluateOnNewDocument(installWieseSicht);
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const out = await page.evaluate(async (selbst) => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const o = { boot: false };
        const t0 = performance.now();
        while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() - t0 < 90000)
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return o;
        o.boot = true;
        const st = r.state;
        const f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null;
        const tF = performance.now();
        while (f && !f.ready && performance.now() - tF < 60000) await sleep(100);
        o.foundry = !!(f && f.ready);
        // Der Spieler LIVE: nach dem Boot tauscht die Welt das Spieler-Mesh (die Seele) — eine gemerkte Position zöge nur
        // die Streu mit, Kamera und Nah-Wiese blieben am Start (bis 06.10. lag das Auge jedes Umzugs bei 36 0).
        const spieler = () => st.playerMesh.position;
        // ── A: DER ABSCHIED JEDER SENKE (W6) — jede Senke, die `_instanzMesh` ab hier baut, wird verfolgt; `_instanzAbschied`
        // stempelt sie. Eine Senke, die den Graphen ohne Abschied verlässt, hinterlässt ihre Instanz-Puffer in r184s Register
        // (`buf:verwaist`); ein Abschied einer Senke, die noch im Graphen steht, zerstört einen gezeichneten Speicher-Puffer.
        const R = r.constructor;
        const geboren = new Set();
        const bau = R._instanzMesh;
        R._instanzMesh = function (...a) {
            const m = bau.apply(this, a);
            geboren.add(m);
            return m;
        };
        const proto = Object.getPrototypeOf(r);
        const abschied = proto._instanzAbschied;
        proto._instanzAbschied = function (m) {
            if (m) m.__abschied = (m.__abschied || 0) + 1;
            return abschied.call(this, m);
        };
        const imGraph = (m) => {
            for (let p = m; p; p = p.parent) if (p === st.scene) return true;
            return false;
        };
        let abschiede = 0;
        const takt = async (n) => {
            for (let i = 0; i < n; i++) {
                st._frameOverBudget = false;
                try {
                    r._gameLoopTick(performance.now());
                    r._tickScatterStreaming(spieler());
                } catch (_e) {}
                await sleep(6);
            }
        };

        // ── der Zensus: jede Instanz-Senke gegen ihre Lebenden ──
        const dreieckeJe = (geo) =>
            geo ? (geo.index ? geo.index.count : geo.attributes.position ? geo.attributes.position.count : 0) / 3 : 0;
        const paesse = (m) => {
            if (!m.visible) return [];
            const p = [];
            if (st.camera && m.layers.test(st.camera.layers)) p.push("haupt");
            if (m.castShadow) p.push("schatten");
            return p;
        };
        const null3x3 = (a, i) => {
            const k = i * 16;
            return (
                a[k] === 0 && a[k + 1] === 0 && a[k + 2] === 0 && a[k + 4] === 0 && a[k + 5] === 0 && a[k + 6] === 0 &&
                a[k + 8] === 0 && a[k + 9] === 0 && a[k + 10] === 0
            );
        };
        const zensus = () => {
            const befunde = [];
            const z = { gruppen: 0, instanzen: 0, senken: 0, marken: 0, verfolgt: geboren.size, abschiede: 0 };
            const nenne = (senke, art, m, n) => {
                const p = paesse(m);
                befunde.push({ senke, art, pass: p.join("+") || "keiner", dreiecke: Math.round(n * dreieckeJe(m.geometry)) });
            };
            const senke = (name, m, lebend) => {
                if (!m || !m.instanceMatrix) return;
                z.senken++;
                const n = m.count | 0;
                if (n === 0 && m.visible) nenne(name, "leere Senke sichtbar", m, 0);
                if (lebend != null && n > lebend) nenne(name, `${n - lebend} freie Slots (count ${n} · lebend ${lebend})`, m, n - lebend);
                if (lebend != null && n < lebend) nenne(name, `count ${n} unter den Lebenden ${lebend}`, m, 0);
                let nul = 0;
                for (let i = 0; i < n; i++) if (null3x3(m.instanceMatrix.array, i)) nul++;
                if (nul) nenne(name, `${nul} Null-3×3-Slots in [0, count)`, m, nul);
            };
            for (const [k, g] of st.archInstanceGroups || []) {
                z.gruppen++;
                const n = g.liveCount | 0;
                z.instanzen += n;
                senke(k, g.mesh, n);
                if (n === 0 && g.mesh && g.mesh.count > 0 && g.mesh.visible) nenne(k, "leere Hülle zeichnet", g.mesh, g.mesh.count);
                const marken = g.slotRef || [];
                let falsch = 0;
                for (let i = 0; i < Math.max(marken.length, n); i++) {
                    const ref = marken[i];
                    if (i < n ? !ref || ref.slot !== i || ref.key !== k : !!ref) falsch++;
                }
                if (falsch && g.mesh) nenne(k, `${falsch} Marken tragen nicht ihren Slot`, g.mesh, 0);
            }
            // MATRIX-TREUE (der Umzug trägt die richtige Instanz): jede Marke eines Architektur-Eintrags zeigt die Matrix,
            // die der Eintrag dort hinschreiben würde, und ihr Slot nennt ihn als Eigentümer.
            const ew = new window.THREE.Matrix4(),
                soll = new window.THREE.Matrix4();
            for (const e of st.architectures || []) {
                if (!e || !e.instanced || !Array.isArray(e.instSlots)) continue;
                const fp = e.instFoundry && r._foundryEnabled() ? r._foundryPresetForEntry(e) : null;
                const flat = fp
                    ? r._foundryFlattenFor(e, fp, Number.isFinite(e._servedLod) ? e._servedLod : e._lodLevel)
                    : r._archFlattenBlueprint(e.type);
                if (!flat || !flat.leaves) continue;
                r._archEntryWorldMatrix(e, ew);
                for (let i = 0; i < e.instSlots.length && i < flat.leaves.length; i++) {
                    const ref = e.instSlots[i];
                    const g = st.archInstanceGroups && st.archInstanceGroups.get(ref.key);
                    if (!g || g.tuer || !(ref.slot >= 0)) continue; // Tür-Flügel drehen je Tick
                    z.marken = (z.marken || 0) + 1;
                    soll.multiplyMatrices(ew, flat.leaves[i].localMatrix);
                    const a = g.mesh.instanceMatrix.array;
                    let d = 0;
                    for (let k = 0; k < 16; k++) d = Math.max(d, Math.abs(a[ref.slot * 16 + k] - soll.elements[k]));
                    if (d > 1e-3 || g.slotEntry[ref.slot] !== e)
                        nenne(ref.key, `Slot ${ref.slot} trägt nicht die Instanz von ${e.type}#${e.id} (Abstand ${d.toFixed(3)})`, g.mesh, 1);
                }
            }
            const P = st.archFundament;
            if (P && P.mesh) {
                senke("bau-fundament", P.mesh, P.byId.size);
                let offen = 0;
                for (const [id, s] of P.byId) if (P.idAt[s] !== id) offen++;
                if (offen) nenne("bau-fundament", `${offen} Sockel ohne geschlossenen Rückverweis`, P.mesh, 0);
            }
            const Z = st.stlZaun;
            if (Z && Z.mesh) senke("siedlung-zaun", Z.mesh, Z.top);
            const nw = st.nahWiese;
            if (nw) for (const a of nw.senken.values()) senke(a.name, a.mesh, a.anzahl);
            const ns = st.nahStreu;
            if (ns)
                for (const a of ns.senken.values()) {
                    let summe = 0;
                    for (const b of a.bloecke.values()) summe += b.n;
                    if (summe !== a.anzahl)
                        befunde.push({ senke: a.name, art: `Σ Blöcke ${summe} ≠ Anzahl ${a.anzahl}`, pass: "keiner", dreiecke: 0 });
                    if (a.mesh !== undefined)
                        befunde.push({ senke: a.name, art: "die Senke trägt eine Mesh (sie zeichnet selbst)", pass: "keiner", dreiecke: 0 });
                }
            // W7 — die Sicht der Karten: die EINE Senke, die der Haken je Pass legt (die Atlas-Gruppe hängt nirgends)
            const ks = st.kartenSicht;
            if (ks && ks.mesh) senke("kartenSicht", ks.mesh, null);
            // A — jede verfolgte Senke: aus dem Graphen nur mit Abschied, im Graphen nie mit. Eine Satz-Gruppe (Welle 6,
            // `g.satz`) hängt an keinem Eltern-Knoten — der Bau-Satz ihres Stoffs zeichnet sie: ihre Senke lebt, solange die
            // Gruppe sie trägt; ebenso die EINE Atlas-Gruppe (W7, `kartenSicht`: ihre Sicht zeichnet).
            const satzLebt = new Set();
            for (const [, g] of st.archInstanceGroups || [])
                if (g.mesh && (g.satz || g.mesh.userData.kartenSicht)) satzLebt.add(g.mesh);
            for (const m of geboren) {
                const name = m.name || m.userData.archInstanceKey || m.userData.leafKey || "Senke";
                const drin = imGraph(m) || satzLebt.has(m);
                if (!drin && !m.__abschied) nenne(name, "fiel ohne Abschied — r184 hält ihre Instanz-Puffer (buf:verwaist)", m, 0);
                if (drin && m.__abschied) nenne(name, "Abschied einer Senke im Graphen — ihr Speicher-Puffer ist tot", m, 0);
                if (!drin && m.__abschied) {
                    geboren.delete(m);
                    abschiede++;
                }
            }
            z.abschiede = abschiede;
            return { z, befunde };
        };

        // ── W: das Urteil über den Sicht-Satz der Nah-Wiese (die Linse legte ihn selbst, scripts/lib/wiese-sicht.cjs) ──
        const wieseUrteil = (w, befunde) => {
            const nenne = (senke, art) => befunde.push({ senke, art, pass: "haupt", dreiecke: 0 });
            const summe = Object.values(w.je).reduce((s, n) => s + n, 0);
            if (!(w.senken > 0))
                nenne("nahWiese", "keine Senke — die Studio-Gras-Vorlagen fehlen (die Linse misst nichts)");
            else if (!(w.bueschel > 0)) {
                // kein Wiesen-Grün im Ring (Waldboden, Fels, Wasser): der Satz muss leer stehen
                if (summe) nenne("nahWiese", `${summe} Instanzen in einem Ring ohne Büschel — veraltete Matrizen`);
            } else
                for (const [name, n] of Object.entries(w.je))
                    if (!(n > 0)) nenne(name, "anzahl 0 nach dem Sicht-Satz — leer bewiesen");
            if (w.ausserhalb) nenne("nahWiese", `${w.ausserhalb} gelegte Instanzen außerhalb des Rings um das Auge`);
        };
        const wieseKurz = (w) => {
            const n = Object.values(w.je);
            return {
                senken: w.senken,
                bueschel: w.bueschel,
                summe: n.reduce((s, x) => s + x, 0),
                min: n.length ? Math.min(...n) : 0,
                auge: w.auge ? [Math.round(w.auge.x), Math.round(w.auge.z)] : null,
            };
        };

        // ── die Wander-Sequenz: fort und zurück, mehrere Umzüge (je Umzug ein Teleport + Takte bis der Bau ruht) ──
        await takt(120);
        const sx = spieler().x,
            sz = spieler().z;
        const umzuege = [
            [600, 0],
            [0, 0],
            [0, 600],
            [0, 0],
            [-450, -450],
            [150, 0],
            [0, 0],
        ];
        o.umzuege = [];
        for (const [dx, dz] of umzuege) {
            const x = sx + dx,
                zz = sz + dz;
            const pm = spieler();
            const y = typeof r._voxelSurfaceY === "function" ? r._voxelSurfaceY(x, zz) : pm.y;
            pm.set(x, (Number.isFinite(y) ? y : pm.y) + 1.8, zz);
            await takt(160);
            const wiese = window.__wieseSicht(r);
            const { z, befunde } = zensus();
            wieseUrteil(wiese, befunde);
            // Die Nah-Wiese legt ihren Ring um die KAMERA (`_tickNahWiese`), die Kamera folgt dem Spieler: steht das Auge
            // nicht am Ziel, prüfte der Umzug den alten Ring.
            if (!wiese.auge || Math.hypot(wiese.auge.x - x, wiese.auge.z - zz) > 30)
                befunde.push({
                    senke: "nahWiese",
                    art: `das Auge folgte dem Umzug nicht (${wiese.auge ? Math.round(wiese.auge.x) + " " + Math.round(wiese.auge.z) : "—"}) — der Ring stand am alten Ort`,
                    pass: "haupt",
                    dreiecke: 0,
                });
            o.umzuege.push({
                ziel: [Math.round(x), Math.round(zz)],
                spieler: [Math.round(spieler().x), Math.round(spieler().z)],
                ...z,
                wiese: wieseKurz(wiese),
                befunde: befunde.slice(0, 12),
                n: befunde.length,
            });
        }

        // ── SELBSTTEST: die Linse MUSS sehen, was sie nie sehen soll ──
        if (selbst) {
            const groups = st.archInstanceGroups;
            let lebendig = null;
            for (const g of groups.values()) if ((g.liveCount | 0) > 0 && g.mesh.count < g.capacity) {
                lebendig = g;
                break;
            }
            const st_ = { freiGenannt: false, leerGenannt: false };
            if (lebendig) {
                // (1) ein freier Slot hinter den Lebenden, an _instanzZahl vorbei
                const m = lebendig.mesh;
                const n = m.count;
                m.instanceMatrix.array.fill(0, n * 16, n * 16 + 16);
                m.count = n + 1;
                // (2) eine sichtbare leere Hülle
                const hm = new window.THREE.InstancedMesh(m.geometry, m.material, 4);
                hm.count = 4;
                hm.castShadow = true;
                const huelle = { key: "gate:leere-huelle", mesh: hm, liveCount: 0, slotRef: [], slotEntry: [], capacity: 4 };
                groups.set(huelle.key, huelle);
                const { befunde } = zensus();
                st_.freiGenannt = befunde.some((b) => b.senke === lebendig.key && /freie Slots/.test(b.art) && b.dreiecke > 0);
                st_.leerGenannt = befunde.some((b) => b.senke === huelle.key && /leere Hülle zeichnet/.test(b.art) && /haupt/.test(b.pass));
                st_.befunde = befunde.filter((b) => b.senke === lebendig.key || b.senke === huelle.key);
                groups.delete(huelle.key);
                m.count = n;
            }
            // (3) ein Umzug, der die Matrix vergaß: zwei Instanzen eines Eintrags-Slots tauschen die Matrix
            let tausch = null;
            for (const e of st.architectures || []) {
                const ref = e && e.instanced && Array.isArray(e.instSlots) ? e.instSlots[0] : null;
                const g = ref && groups.get(ref.key);
                if (g && !g.tuer && (g.liveCount | 0) >= 2) {
                    tausch = { g, a: ref.slot, b: ref.slot === 0 ? 1 : 0, e };
                    break;
                }
            }
            if (tausch) {
                const arr = tausch.g.mesh.instanceMatrix.array;
                const merk = arr.slice(tausch.a * 16, tausch.a * 16 + 16);
                arr.copyWithin(tausch.a * 16, tausch.b * 16, tausch.b * 16 + 16);
                const { befunde } = zensus();
                st_.tauschGenannt = befunde.some((b) => b.senke === tausch.g.key && /trägt nicht die Instanz/.test(b.art));
                for (const b of befunde) if (b.senke === tausch.g.key && /trägt nicht/.test(b.art)) (st_.befunde = st_.befunde || []).push(b);
                arr.set(merk, tausch.a * 16);
            }
            // (4) A: eine Senke fällt ohne Abschied, eine zweite bekommt ihn im Graphen
            const muster = lebendig ? lebendig.mesh : null;
            if (muster) {
                const ohne = R._instanzMesh(muster.geometry, muster.material, 2);
                ohne.name = "gate:ohne-abschied";
                st.scene.add(ohne);
                st.scene.remove(ohne);
                const lebt = R._instanzMesh(muster.geometry, muster.material, 2);
                lebt.name = "gate:lebend-abschied";
                st.scene.add(lebt);
                r._instanzAbschied(lebt);
                const { befunde } = zensus();
                st_.ohneGenannt = befunde.some((b) => b.senke === "gate:ohne-abschied" && /ohne Abschied/.test(b.art));
                st_.lebendGenannt = befunde.some((b) => b.senke === "gate:lebend-abschied" && /im Graphen/.test(b.art));
                for (const b of befunde) if (/^gate:/.test(b.senke)) (st_.befunde = st_.befunde || []).push(b);
                st.scene.remove(lebt);
                geboren.delete(ohne);
                geboren.delete(lebt);
            }
            // (5) W blind: ein Sicht-Satz in den Himmel lässt jede Senke der Nah-Wiese leer — die Linse nennt jede
            const himmel = window.__wieseSicht(r, true);
            const bH = [];
            wieseUrteil(himmel, bH);
            st_.wieseLeerGenannt =
                himmel.senken > 0 && bH.filter((b) => /leer bewiesen/.test(b.art)).length === himmel.senken;
            st_.wieseLeer = bH.length;
            // (6) eine gelegte Instanz mit Null-3×3 und (7) eine gelegte Instanz fort aus dem Ring (die veraltete Matrix)
            const echt = window.__wieseSicht(r);
            const nw = st.nahWiese;
            const voll = nw ? [...nw.senken.values()].find((a) => a.anzahl > 1) : null;
            if (voll) {
                const arr = voll.mesh.instanceMatrix.array;
                const merk = arr.slice(0, 16);
                for (const k of [0, 1, 2, 4, 5, 6, 8, 9, 10]) arr[k] = 0;
                st_.wieseNullGenannt = zensus().befunde.some((b) => b.senke === voll.name && /Null-3×3/.test(b.art));
                arr.set(merk, 0);
                arr[12] += 500;
                const bR = [];
                wieseUrteil(window.__wieseZaehle(r, echt.auge), bR);
                st_.wieseRingGenannt = bR.some((b) => /außerhalb des Rings/.test(b.art));
                arr.set(merk, 0);
                // (8) ein Ring ohne Büschel, dessen Senken noch Instanzen tragen (der Satz lief nicht nach)
                const bV = [];
                wieseUrteil(Object.assign({}, echt, { bueschel: 0 }), bV);
                st_.wieseAltGenannt = bV.some((b) => /veraltete Matrizen/.test(b.art));
                (st_.befunde = st_.befunde || []).push(
                    {
                        senke: voll.name,
                        pass: "haupt",
                        dreiecke: 0,
                        art: `Himmel: ${st_.wieseLeer} leere Senken genannt`,
                    },
                    ...bR
                );
            }
            o.selbst = st_;
        }
        return o;
    }, process.argv.includes("--selftest"));
    await browser.close();
    server.close();
    return { out, seitenFehler };
}

(async () => {
    const fails = [];
    // ── Q (Quelle) + ihr Selbsttest ──
    const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const q = quellBefunde(src);
    console.log("=== Q — die Quelle (kommentar-frei) ===");
    console.log(q.length ? q.map((x) => "  ❌ " + x).join("\n") : "  ✅ count schreibt nur _instanzZahl · keine Free-Liste · kein `_lebt`");
    for (const x of q) fails.push("Q: " + x);
    if (process.argv.includes("--selftest")) {
        const schmuggel = quellBefunde(
            src.replace("    static _instanzZahl(mesh, n) {", "    _schmuggel(g) {\n        g.mesh.count = 7;\n    }\n    static _instanzZahl(mesh, n) {")
        );
        const ok = schmuggel.some((x) => /`g\.mesh\.count =`/.test(x));
        console.log(`  ${ok ? "✅" : "❌"} SELBSTTEST Q: eine eingeschmuggelte count-Zeile wird genannt (${schmuggel.length} Befund)`);
        if (!ok) fails.push("Q-SELBSTTEST: die eingeschmuggelte count-Zeile blieb ungesehen");
    }

    const { out, seitenFehler } = await welt();
    console.log("\n=== G/F/S — die Wander-Sequenz (Null-Renderer, Foundry an) ===");
    if (!out.boot) fails.push("die Welt bootete nicht");
    if (!out.foundry) fails.push("die Foundry wurde nicht bereit (die Linse sähe keine Studio-Gruppe)");
    let maxGruppen = 0;
    for (const u of out.umzuege || []) {
        maxGruppen = Math.max(maxGruppen, u.gruppen);
        console.log(
            `  Umzug → ${u.ziel.join(" ")} (Spieler ${u.spieler.join(" ")}): ${u.gruppen} Gruppen · ${u.instanzen} Instanzen · ${u.senken} Senken · ${u.marken} Eintrags-Marken treu geprüft · ${u.abschiede} Senken mit Abschied gefallen (${u.verfolgt} verfolgt) · Nah-Wiese (Auge ${u.wiese.auge ? u.wiese.auge.join(" ") : "—"}) ${u.wiese.senken} Senken, ${u.wiese.bueschel} Büschel im Ring, ${u.wiese.summe} gelegt (je Senke ≥ ${u.wiese.min}) · ${u.n} Befunde`
        );
        for (const b of u.befunde) console.log(`    ❌ ${b.senke} · ${b.pass} · ${b.dreiecke} Dreiecke — ${b.art}`);
        if (u.n) fails.push(`Umzug ${u.ziel.join(" ")}: ${u.n} Befunde (${u.befunde[0].senke} · ${u.befunde[0].art})`);
    }
    if (!out.umzuege || out.umzuege.length < 5) fails.push("die Wander-Sequenz lief nicht durch");
    if (!(maxGruppen > 20)) fails.push(`nur ${maxGruppen} Instanz-Gruppen — die Linse misst nichts`);
    const letzt = (out.umzuege || [])[(out.umzuege || []).length - 1] || {};
    if (!(letzt.abschiede > 0)) fails.push("keine Senke fiel mit Abschied — die Abschieds-Linse misst nichts");
    // W misst nur, wo Wiese steht: mindestens WIESE_ORTE Umzüge mit belegtem Ring, sonst ist W leer bewiesen
    const wieseOrte = (out.umzuege || []).filter((u) => u.wiese.bueschel > 0 && u.wiese.min > 0).length;
    const WIESE_ORTE = 4;
    console.log(
        `  Nah-Wiese: ${wieseOrte} von ${(out.umzuege || []).length} Umzügen mit belegtem Ring (Soll ≥ ${WIESE_ORTE})`
    );
    if (wieseOrte < WIESE_ORTE)
        fails.push(
            `die Nah-Wiese stand in nur ${wieseOrte} Umzügen auf Wiese (Soll ≥ ${WIESE_ORTE}) — W misst zu wenig`
        );
    if (process.argv.includes("--selftest")) {
        const s = out.selbst || {};
        console.log(
            `  ${s.freiGenannt ? "✅" : "❌"} SELBSTTEST G: der eingeschmuggelte freie Slot wird genannt · ${s.leerGenannt ? "✅" : "❌"} die sichtbare leere Hülle wird genannt · ${s.tauschGenannt ? "✅" : "❌"} die vertauschte Matrix wird genannt`
        );
        for (const b of s.befunde || []) console.log(`    (Selbsttest) ${b.senke} · ${b.pass} · ${b.dreiecke} Dreiecke — ${b.art}`);
        if (!s.freiGenannt) fails.push("SELBSTTEST: der eingeschmuggelte freie Slot blieb ungesehen");
        if (!s.leerGenannt) fails.push("SELBSTTEST: die sichtbare leere Hülle blieb ungesehen");
        if (!s.tauschGenannt) fails.push("SELBSTTEST: die vertauschte Matrix (ein Umzug ohne Matrix) blieb ungesehen");
        console.log(
            `  ${s.ohneGenannt ? "✅" : "❌"} SELBSTTEST A: die Senke ohne Abschied wird genannt · ${s.lebendGenannt ? "✅" : "❌"} der Abschied einer Senke im Graphen wird genannt`
        );
        if (!s.ohneGenannt) fails.push("SELBSTTEST: die Senke ohne Abschied blieb ungesehen");
        if (!s.lebendGenannt) fails.push("SELBSTTEST: der Abschied einer Senke im Graphen blieb ungesehen");
        console.log(
            `  ${s.wieseLeerGenannt ? "✅" : "❌"} SELBSTTEST W: der Sicht-Satz in den Himmel — jede leere Senke der Nah-Wiese genannt (${s.wieseLeer || 0}) · ${s.wieseNullGenannt ? "✅" : "❌"} eine gelegte Null-3×3 genannt · ${s.wieseRingGenannt ? "✅" : "❌"} eine Instanz fort aus dem Ring genannt · ${s.wieseAltGenannt ? "✅" : "❌"} veraltete Instanzen im leeren Ring genannt`
        );
        if (!s.wieseAltGenannt) fails.push("SELBSTTEST: veraltete Instanzen im Ring ohne Büschel blieben ungesehen");
        if (!s.wieseLeerGenannt)
            fails.push("SELBSTTEST: die leeren Senken der Nah-Wiese (Blick in den Himmel) blieben ungesehen");
        if (!s.wieseNullGenannt) fails.push("SELBSTTEST: die gelegte Null-3×3 der Nah-Wiese blieb ungesehen");
        if (!s.wieseRingGenannt) fails.push("SELBSTTEST: die Instanz fort aus dem Ring blieb ungesehen");
    }
    if (seitenFehler.length) {
        console.log("  Seiten-Fehler:", seitenFehler.slice(0, 3));
        fails.push(`${seitenFehler.length} Seiten-Fehler`);
    }
    if (fails.length) {
        console.log(`\n❌ gate:freie-slots ROT: ${fails.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        `\n✅ gate:freie-slots GRÜN — nach ${out.umzuege.length} Umzügen ist jede Instanz-Senke dicht: kein freier Slot, keine sichtbare leere Hülle, in keinem Pass; ${letzt.abschiede} Senken fielen mit Abschied, keine ohne; der Sicht-Satz der Nah-Wiese belegte in ${wieseOrte} Ringen jede Senke (${Math.min(...out.umzuege.filter((u) => u.wiese.bueschel > 0).map((u) => u.wiese.summe))}–${Math.max(...out.umzuege.map((u) => u.wiese.summe))} Instanzen), ein Ring ohne Wiese stand leer.`
    );
    process.exit(0);
})().catch((e) => {
    console.error("Linsen-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
