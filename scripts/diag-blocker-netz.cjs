#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-blocker-netz.cjs — DER STRAHL FRAGT SEINE NACHBARSCHAFT (0710-7). Befund (OMEN 0710-6, V18.535, CPU-Profil an der
// Mess-Wiese): `_segmentAABB` trug 8,3–8,9 % der Selbst-Zeit, `_fieldRaycast` weitere 6,5–7 % — die Decken-Probe der Ego-Kamera
// (`_loopCamera` → `_ceilingHeadroom`, ein 4,5-m-Strahl je Frame) prüfte jede Blocker-Box im 80-m-Umkreis: gezählt 22 758
// Slabs je Strahl (419 Bauten, davon 15 570 Boxen Haselbüsche), keine Box berührte das Segment. Der Schnitt: die Nachbarschaft
// der Blocker (`_blockerNetz`, Zellen über die Hülle jedes Eintrags, gestempelt am Bestand), der Strahl fragt nur die Zellen
// seines Segments und je Box ihre Hülle vor dem Slab. Die Wand (Null-Renderer, eine echte Welt mit Dorf, Bäumen und Bauten):
//   (T) TREUE: jeder Strahl trifft byte-gleich wie die Schleife über den ganzen Bestand (das Orakel unten — Treffer, t, Punkt,
//       Normale, auch -0), über kurze, lange (> 80 m, der Nah-Cull), senkrechte, achsparallele und Strahlen aus einer Box — in
//       fünf Runden, zwischen ihnen ändert sich der Bestand (Abriss, Kappe, eine gedrehte und neu gestempelte Hülle, ein neues
//       Array, neue Bäume);
//   (A) ARBEIT: ein Strahl ruft `_segmentAABB` genau für die Boxen, deren Hülle die seines Segments berührt (im Nah-Cull) —
//       vorher für jede Box im 80-m-Umkreis;
//   (L) DER LÖSER (`_stepCharacterStructures`, Kapsel des Spielers und Hülle des Wagens): je Runde Körper an, in und zwischen
//       den Boxen lösen byte-gleich wie die Schleife über den Bestand (Position, Auflage, Wand-Kontakt, Schübe der Hülle), und
//       er löst keinen Eintrag, dessen Hülle der Körper an seiner Stelle nicht erreicht (vorher jede Box im 60-m-Umkreis);
//   (N) DIE NÄHE DES TIER-LEIBS (`_kreaturHuellenKontakt`): je Runde baut ein echtes Tier an, zwischen und fern der Boxen seine
//       Nähe-Liste — dieselbe Menge in derselben Ordnung wie die Schleife über den Bestand, auch für einen Beweger (ein
//       Eintrag, dessen Position nach dem Eintritt wandert, wie das gerittene Werk), und die Frage fasst nur die Plätze um das
//       Tier an (vorher den ganzen Bestand je Neubau);
//   (K) KONSISTENZ: das Netz ist der Bestand — jeder Eintrag mit Boxen steht in den Zellen seiner Hülle, jeder Eintrag in der
//       Zelle seines Platzes, keine Zelle trägt einen Eintrag außerhalb, die Ordnung des Bestands steigt mit dem Array;
//   (Q) QUELLE: `_fieldRaycast` liest das Netz und keine Schleife über den Bestand; jeder Eintritt (push), Austritt (splice)
//       und jedes Schreiben der Boxen (`_blockerStampReach`) stempelt; kein anderer Schreiber des Bestands im Stamm;
//   (W) DIE BOX-WAND (AST, acorn): jeder Schreiber der Blocker-Boxen stempelt — eine Zuweisung an `.blockerAABBs` nur mit
//       Stempel (`_blockerStampReach`) oder als Abriss (null mit `_blockerAustritt`), kein Schreiben IN die Boxen (Feld, Index,
//       ++/--, delete, push · pop · shift · unshift · splice · sort · reverse · fill · copyWithin, Object.assign);
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): der Stamm ist sauber, fünf eingeschleuste Schreiber fallen rot
// beim Namen, ein gestempelter bleibt grün.
//   node scripts/diag-blocker-netz.cjs [--selftest]   (npm run gate:blocker-netz; Port BLOCKER_NETZ_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.BLOCKER_NETZ_PORT || 4604);
const root = path.resolve(__dirname, "..");

// DIE BOX-WAND (AST, acorn — Kommentare und Zeichenketten fallen mit dem Parser): jeder Schreiber der Blocker-Boxen beim Namen.
//   (a) eine Zuweisung an `….blockerAABBs` — erlaubt mit einem Wert in einer Methode, die `_blockerStampReach` ruft (der Stempel
//       der Nachbarschaft), mit null in einer Methode, die `_blockerAustritt` ruft (der Abriss);
//   (b) ein Schreiben IN die Boxen: Feld- oder Index-Zuweisung, ++/--, delete, eine mutierende Array-Methode oder Object.assign an
//       `….blockerAABBs`, an einem Element davon oder an einem Namen, der daran hängt (`const boxes = e.blockerAABBs`,
//       `for (const b of boxes)`, `boxes[i]`, `boxes.find(…)`) — nie erlaubt: die Boxen schreibt `_populateBlockerAABBs` neu.
// Grenze: ein Name, der als Parameter eine Box empfängt, hängt für die Wand an nichts (kein Datenfluss über Rufe).
const BOX_MUT = new Set(["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin"]);
const BOX_ELEMENT = new Set(["find", "filter", "slice", "at", "concat", "findLast"]);
function boxWand(quelle) {
    const acorn = require("acorn");
    const ast = acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const kinder = (n) => {
        const out = [];
        for (const k in n) {
            if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
            const v = n[k];
            if (Array.isArray(v)) {
                for (const x of v) if (x && typeof x.type === "string") out.push(x);
            } else if (v && typeof v.type === "string") out.push(v);
        }
        return out;
    };
    const lauf = (n, f) => {
        f(n);
        for (const k of kinder(n)) lauf(k, f);
    };
    const name = (m) =>
        m.computed ? (m.property.type === "Literal" ? String(m.property.value) : null) : m.property.name;
    const befunde = [];
    let zuweisungen = 0;
    const pruefe = (methode, body) => {
        // die Namen, die an den Boxen hängen (zwei Durchläufe: eine Bindung kann eine spätere tragen)
        const gebunden = new Set();
        const istBox = (n) => {
            if (!n) return false;
            if (n.type === "Identifier") return gebunden.has(n.name);
            if (n.type === "ChainExpression") return istBox(n.expression);
            if (n.type === "LogicalExpression") return istBox(n.left) || istBox(n.right);
            if (n.type === "ConditionalExpression") return istBox(n.consequent) || istBox(n.alternate);
            if (n.type === "MemberExpression") {
                if (name(n) === "blockerAABBs") return true;
                return n.computed && istBox(n.object);
            }
            if (n.type === "CallExpression" && n.callee.type === "MemberExpression")
                return BOX_ELEMENT.has(name(n.callee)) && istBox(n.callee.object);
            return false;
        };
        let ruftStempel = false,
            ruftAustritt = false;
        for (let d = 0; d < 2; d++)
            lauf(body, (n) => {
                if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && istBox(n.init))
                    gebunden.add(n.id.name);
                if (n.type === "ForOfStatement" && istBox(n.right) && n.left.type === "VariableDeclaration") {
                    const id = n.left.declarations[0].id;
                    if (id.type === "Identifier") gebunden.add(id.name);
                }
                if (n.type === "CallExpression" && n.callee.type === "MemberExpression") {
                    if (name(n.callee) === "_blockerStampReach") ruftStempel = true;
                    if (name(n.callee) === "_blockerAustritt") ruftAustritt = true;
                }
            });
        const meld = (n, art) =>
            befunde.push({
                methode,
                zeile: n.loc.start.line,
                art,
                text: quelle.slice(n.start, Math.min(n.end, n.start + 80)).replace(/\s+/g, " "),
            });
        lauf(body, (n) => {
            if (n.type === "AssignmentExpression" && n.left.type === "MemberExpression") {
                if (name(n.left) === "blockerAABBs") {
                    zuweisungen++;
                    const nul = n.right.type === "Literal" && n.right.value === null;
                    if (nul ? !ruftAustritt : !ruftStempel)
                        meld(
                            n,
                            nul ? "Abriss der Boxen ohne `_blockerAustritt`" : "Boxen gesetzt ohne `_blockerStampReach`"
                        );
                } else if (istBox(n.left.object)) meld(n, "Schreiben in die Boxen");
            }
            if (n.type === "UpdateExpression" && n.argument.type === "MemberExpression" && istBox(n.argument.object))
                meld(n, "Schreiben in die Boxen (++/--)");
            if (
                n.type === "UnaryExpression" &&
                n.operator === "delete" &&
                n.argument.type === "MemberExpression" &&
                istBox(n.argument.object)
            )
                meld(n, "Schreiben in die Boxen (delete)");
            if (n.type === "CallExpression" && n.callee.type === "MemberExpression") {
                const p = name(n.callee);
                if (BOX_MUT.has(p) && istBox(n.callee.object)) meld(n, `Schreiben in die Boxen (${p})`);
                if (
                    p === "assign" &&
                    n.callee.object.type === "Identifier" &&
                    n.callee.object.name === "Object" &&
                    n.arguments[0] &&
                    istBox(n.arguments[0])
                )
                    meld(n, "Schreiben in die Boxen (Object.assign)");
            }
        });
    };
    // je Methode einer Klasse: ihr Körper. Funktionen außerhalb der Klasse (statische Zuweisungen `AnazhRealm.x = function`,
    // Modul-Funktionen) liest die Wand NICHT — dort schreibt heute keiner die Boxen (alle 6 Schreiber stehen in Methoden;
    // Integration V18.536, die Gegenprüfung fand die frühere Zeile „und je Funktion außerhalb" ohne Deckung)
    lauf(ast, (n) => {
        if (n.type === "MethodDefinition" && n.value && n.value.body)
            pruefe(n.key.name || String(n.key.value), n.value.body);
    });
    return { befunde, zuweisungen };
}

if (process.argv.includes("--selftest")) {
    console.log("=== BLOCKER-NETZ — Selbsttest der Box-Wand (ohne Browser) ===");
    const v = [];
    const stamm = boxWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    for (const b of stamm.befunde) v.push(`STAMM: ${b.methode} Zeile ${b.zeile}: ${b.art} — ${b.text}`);
    if (stamm.zuweisungen < 6) v.push(`STUMPF: die Wand sieht nur ${stamm.zuweisungen} Zuweisungen an .blockerAABBs`);
    const klasse = (rumpf) => `class X { ${rumpf} }`;
    const faelle = [
        ["gesetzt ohne Stempel", "a(e) { e.blockerAABBs = []; }", "ohne `_blockerStampReach`"],
        ["Abriss ohne Austritt", "a(e) { e.blockerAABBs = null; }", "ohne `_blockerAustritt`"],
        ["sortiert", "a(e) { const boxes = e.blockerAABBs; boxes.sort((p, q) => p.minX - q.minX); }", "(sort)"],
        ["Feld einer Box", "a(e) { for (const b of e.blockerAABBs) b.minX = 0; }", "Schreiben in die Boxen"],
        ["Index", "a(e) { const bx = e.blockerAABBs || []; bx[0] = null; }", "Schreiben in die Boxen"],
    ];
    for (const [n, rumpf, soll] of faelle) {
        const w = boxWand(klasse(rumpf));
        if (!w.befunde.some((b) => b.art.includes(soll)))
            v.push(`${n}: der Schreiber fällt nicht rot (${JSON.stringify(w.befunde)})`);
    }
    const ok = boxWand(
        klasse(
            "a(e) { e.blockerAABBs = []; this._blockerStampReach(e); } b(e) { e.blockerAABBs = null; this._blockerAustritt(e); }"
        )
    );
    if (ok.befunde.length) v.push(`gestempelt: die Wand meldet ${JSON.stringify(ok.befunde)}`);
    for (const x of v) console.log("  ❌ " + x);
    if (v.length) {
        console.log("\n❌ SELBSTTEST ROT — die Box-Wand ist blind oder der Stamm trägt einen Schreiber ohne Stempel.");
        process.exit(1);
    }
    console.log(
        `✅ SELBSTTEST GRÜN — der Stamm sauber (${stamm.zuweisungen} Zuweisungen an .blockerAABBs, jede gestempelt), fünf eingeschleuste Schreiber rot, ein gestempelter grün.`
    );
    process.exit(0);
}

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
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

// Die Probe im Seiten-Kontext.
async function probe() {
    const r = window.anazhRealm;
    const st = r.state;
    // DAS ORAKEL: der Struktur-Strahl als Schleife über den ganzen Bestand (die Definition, V18.535) — der Gelände-Teil ist
    // derselbe Weg wie im Spiel (`_fieldSolid` · `_fieldGradient`), die Boxen gehen alle durch `_segmentAABB`.
    const orakel = (sx, sy, sz, ex, ey, ez, o) => {
        const durchPflanzen = !!(o && o.durchPflanzen);
        const dx = ex - sx,
            dy = ey - sy,
            dz = ez - sz;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const out = { hit: false, x: ex, y: ey, z: ez, nx: 0, ny: 1, nz: 0, t: 1 };
        if (len < 1e-6) return out;
        const ux = dx / len,
            uy = dy / len,
            uz = dz / len;
        const step = 0.2;
        let bestT = Infinity;
        const prevSolid = r._fieldSolid(sx, sy, sz);
        if (!prevSolid) {
            for (let d = step; d <= len; d += step) {
                const px = sx + ux * d,
                    py = sy + uy * d,
                    pz = sz + uz * d;
                if (r._fieldSolid(px, py, pz)) {
                    let lo = d - step,
                        hi = d;
                    for (let b = 0; b < 8; b++) {
                        const mid = (lo + hi) / 2;
                        if (r._fieldSolid(sx + ux * mid, sy + uy * mid, sz + uz * mid)) hi = mid;
                        else lo = mid;
                    }
                    bestT = hi / len;
                    break;
                }
            }
        } else bestT = 0;
        let structHitT = Infinity,
            sFace = null;
        const arches = st.architectures;
        if (arches && arches.length) {
            for (let a = 0; a < arches.length; a++) {
                const e = arches[a];
                if (!e || !e.blockerAABBs || !e.position) continue;
                const rcCull = 80 + (e._blockerReach || 0);
                if (Math.abs(e.position.x - sx) > rcCull || Math.abs(e.position.z - sz) > rcCull) continue;
                const boxes = e.blockerAABBs;
                for (let bi = 0; bi < boxes.length; bi++) {
                    if (durchPflanzen && boxes[bi].pflanze === true) continue;
                    const hitInfo = r._segmentAABB(sx, sy, sz, dx, dy, dz, boxes[bi]);
                    if (hitInfo && hitInfo.t < structHitT) {
                        structHitT = hitInfo.t;
                        sFace = hitInfo;
                    }
                }
            }
        }
        if (structHitT < bestT) {
            out.hit = true;
            out.t = structHitT;
            out.x = sx + dx * structHitT;
            out.y = sy + dy * structHitT;
            out.z = sz + dz * structHitT;
            out.nx = sFace.nx;
            out.ny = sFace.ny;
            out.nz = sFace.nz;
        } else if (bestT < Infinity) {
            out.hit = true;
            out.t = bestT;
            out.x = sx + dx * bestT;
            out.y = sy + dy * bestT;
            out.z = sz + dz * bestT;
            const g = r._fieldGradient(out.x, out.y, out.z, {});
            out.nx = g.x;
            out.ny = g.y;
            out.nz = g.z;
        }
        out.struktur = structHitT < bestT;
        return out;
    };
    // die Boxen, deren Hülle die des Segments berührt (im Nah-Cull) — so viele Slabs darf ein Strahl rufen
    const beruehrt = (sx, sy, sz, ex, ey, ez) => {
        const M = 1e-6;
        const q = [
            Math.min(sx, ex) - M,
            Math.max(sx, ex) + M,
            Math.min(sy, ey) - M,
            Math.max(sy, ey) + M,
            Math.min(sz, ez) - M,
            Math.max(sz, ez) + M,
        ];
        let n = 0;
        for (const e of st.architectures) {
            if (!e || !e.blockerAABBs || !e.position) continue;
            const rc = 80 + (e._blockerReach || 0);
            if (Math.abs(e.position.x - sx) > rc || Math.abs(e.position.z - sz) > rc) continue;
            for (const b of e.blockerAABBs)
                if (!(
                    b.maxX < q[0] ||
                    b.minX > q[1] ||
                    b.topY < q[2] ||
                    b.botY > q[3] ||
                    b.maxZ < q[4] ||
                    b.minZ > q[5]
                ))
                    n++;
        }
        return n;
    };
    let slabs = 0;
    const sg = Object.getPrototypeOf(r)._segmentAABB;
    r._segmentAABB = function (sx, sy, sz, dx, dy, dz, b) {
        if (b !== this._obbSegBox) slabs++;
        return sg.call(this, sx, sy, sz, dx, dy, dz, b);
    };
    // die Welt: ein Dorf, Bäume, Bauten der Nexus-Schale an einem Ort abseits des Starts
    const pm = st.playerMesh;
    const ox = 1400,
        oz = -1400;
    pm.position.set(ox, r.getTerrainHeightAt(ox, oz) + 1.2, oz);
    st.weatherEffectTime = 0;
    let laeuft = null;
    const ss = r.spawnSettlement;
    r.spawnSettlement = function (o) {
        laeuft = ss.call(this, o);
        return laeuft;
    };
    r.dslRun(["spawn_village", ["at_player"], 4801], { source: "human" });
    if (laeuft) await laeuft;
    r.dslRun(["spawn_village", ["near_player", 40], 4802], { source: "human" });
    if (laeuft) await laeuft;
    for (let k = 0; k < 6; k++)
        r.dslRun(["spawn_tree", ["near_player", 10 + k * 6], 6, k % 2 ? "kiefer" : "eiche", 900 + k], {
            source: "human",
        });
    r.dslRun(["spawn_temple", ["near_player", 30]], { source: "human" });
    // die Strahlen einer Runde: Zufall mit festem Samen, rund um die Boxen des Orts
    let s = 0x6e7a;
    const rng = () => {
        s = (s + 0x6d2b79f5) | 0;
        let x = Math.imul(s ^ (s >>> 15), 1 | s);
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    const ortsBoxen = () => {
        const out = [];
        for (const e of st.architectures)
            if (e && e.blockerAABBs && e.position && Math.hypot(e.position.x - ox, e.position.z - oz) < 120)
                for (const b of e.blockerAABBs) out.push(b);
        return out;
    };
    const runde = (name, n) => {
        const boxen = ortsBoxen();
        const R = {
            name,
            strahlen: 0,
            treffer: 0,
            struktur: 0,
            abweichung: [],
            slabs: 0,
            beruehrt: 0,
            ueberzaehlig: 0,
            durchPflanzen: 0,
        };
        const LAENGEN = [0.5, 2.5, 4.5, 10, 30, 95];
        for (let i = 0; i < n; i++) {
            const art = rng();
            let sx, sy, sz;
            if (art < 0.15 && boxen.length) {
                const b = boxen[Math.floor(rng() * boxen.length)];
                sx = b.minX + rng() * (b.maxX - b.minX);
                sy = b.botY + rng() * (b.topY - b.botY);
                sz = b.minZ + rng() * (b.maxZ - b.minZ);
            } else {
                sx = ox - 90 + rng() * 180;
                sz = oz - 90 + rng() * 180;
                const h = r.getTerrainHeightAt(sx, sz);
                sy = (Number.isFinite(h) ? h : 0) - 1 + rng() * 14;
            }
            const L = LAENGEN[Math.floor(rng() * LAENGEN.length)];
            let dx, dy, dz;
            const w = rng();
            if (w < 0.3) {
                dx = 0;
                dy = rng() < 0.7 ? 1 : -1;
                dz = 0;
            } else if (w < 0.4) {
                dx = rng() < 0.5 ? 1 : -1;
                dy = 0;
                dz = 0;
            } else {
                const a = rng() * Math.PI * 2;
                const el = (rng() - 0.5) * Math.PI;
                dx = Math.cos(a) * Math.cos(el);
                dy = Math.sin(el);
                dz = Math.sin(a) * Math.cos(el);
            }
            const ex = sx + dx * L,
                ey = sy + dy * L,
                ez = sz + dz * L;
            // ein Drittel der Strahlen geht durch die Pflanzen (der Strahl der 3rd-Kamera, `o.durchPflanzen`)
            const o = rng() < 0.33 ? { durchPflanzen: true } : undefined;
            if (o) R.durchPflanzen++;
            const soll = orakel(sx, sy, sz, ex, ey, ez, o);
            const b0 = beruehrt(sx, sy, sz, ex, ey, ez);
            slabs = 0;
            const ist = r._fieldRaycast(sx, sy, sz, ex, ey, ez, o);
            R.strahlen++;
            R.slabs += slabs;
            R.beruehrt += b0;
            if (slabs > b0) R.ueberzaehlig++;
            if (soll.hit) R.treffer++;
            if (soll.struktur) R.struktur++;
            const felder = ["hit", "t", "x", "y", "z", "nx", "ny", "nz"];
            const ab = felder.filter((f) => !Object.is(soll[f], ist[f]));
            if (ab.length && R.abweichung.length < 5)
                R.abweichung.push({
                    strahl: [sx, sy, sz, ex, ey, ez].map((v) => +v.toFixed(3)),
                    soll: felder.map((f) => soll[f]),
                    ist: felder.map((f) => ist[f]),
                });
            if (ab.length) R.abweichungen = (R.abweichungen || 0) + 1;
        }
        // die Struktur-Treffer der Runde (Strahlen, die eine Box trifft, bevor das Gelände kommt)
        R.boxen = boxen.length;
        R.bauten = st.architectures.length;
        return R;
    };
    // DAS ORAKEL DES LÖSERS: die Schleife über den ganzen Bestand (V18.535), dieselben Löser je Box
    // (mit dem Sprung des rutschenden Wagens `huelle.eigen`, dem Gegner je Schub `huelle.quelle` und der Sammlung der Schübe
    // `quellen` aus integ-probe)
    const alterLoeser = (pos, feetY, headY, radius, huelle, quellen) => {
        const arches = st.architectures;
        if (!arches || !arches.length) return -Infinity;
        let supportTop = -Infinity;
        const riddenId = st.player ? st.player.mountedArch : null;
        for (let a = 0; a < arches.length; a++) {
            const e = arches[a];
            if (!e || !e.blockerAABBs || !e.position) continue;
            if (riddenId !== null && riddenId !== undefined && e.id === riddenId) continue;
            const cullR = 60 + (e._blockerReach || 0);
            if (Math.abs(e.position.x - pos.x) > cullR || Math.abs(e.position.z - pos.z) > cullR) continue;
            if (huelle && huelle.eigen === e.id) continue;
            const boxes = e.blockerAABBs;
            if (huelle) huelle.quelle = e;
            const vorX = pos.x;
            const vorZ = pos.z;
            for (let b = 0; b < boxes.length; b++) {
                if (huelle) {
                    if (!(boxes[b].dick < huelle.stufe)) r._resolveHuelleVsAABB(boxes[b], pos, huelle);
                } else supportTop = r._resolveCapsuleVsAABB(boxes[b], pos, feetY, headY, radius, supportTop);
            }
            if (quellen && (pos.x !== vorX || pos.z !== vorZ)) quellen.push(e, pos.x - vorX, pos.z - vorZ);
        }
        return supportTop;
    };
    // die Löser-Rufe: je Ruf, ob der Körper die Hülle des Eintrags der Box an seiner Stelle erreicht
    const boxEintrag = new Map();
    let rufe = 0,
        fern = 0,
        reichJetzt = 0;
    const huelleVon = (e) => {
        let x0 = Infinity,
            x1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (const b of e.blockerAABBs) {
            x0 = Math.min(x0, b.minX);
            x1 = Math.max(x1, b.maxX);
            z0 = Math.min(z0, b.minZ);
            z1 = Math.max(z1, b.maxZ);
        }
        return [x0, x1, z0, z1];
    };
    // je Eintrag zählt die Stelle, an der der Löser ihn beginnt (ein Schub innerhalb des Eintrags trägt den Körper weiter,
    // seine übrigen Boxen löst auch die Schleife über den Bestand an der neuen Stelle)
    let letzter = null;
    const zaehle = (box, pos) => {
        rufe++;
        const e = boxEintrag.get(box);
        if (!e || e === letzter) return;
        letzter = e;
        const h = huelleVon(e);
        if (
            pos.x < h[0] - reichJetzt ||
            pos.x > h[1] + reichJetzt ||
            pos.z < h[2] - reichJetzt ||
            pos.z > h[3] + reichJetzt
        )
            fern++;
    };
    const P0 = Object.getPrototypeOf(r);
    r._resolveCapsuleVsAABB = function (box, pos, ...rest) {
        zaehle(box, pos);
        return P0._resolveCapsuleVsAABB.call(this, box, pos, ...rest);
    };
    r._resolveHuelleVsAABB = function (box, pos, h) {
        zaehle(box, pos);
        return P0._resolveHuelleVsAABB.call(this, box, pos, h);
    };
    const loeserRunde = (name, n) => {
        boxEintrag.clear();
        for (const e of st.architectures) if (e && e.blockerAABBs) for (const b of e.blockerAABBs) boxEintrag.set(b, e);
        const boxen = ortsBoxen();
        const R = { name, koerper: 0, geschoben: 0, getragen: 0, abweichung: [], rufeAlt: 0, rufeNeu: 0, fern: 0 };
        for (let i = 0; i < n; i++) {
            const b = boxen[Math.floor(rng() * boxen.length)];
            const nahe = rng() < 0.8;
            const x = nahe ? b.minX - 0.5 + rng() * (b.maxX - b.minX + 1) : ox - 90 + rng() * 180;
            const z = nahe ? b.minZ - 0.5 + rng() * (b.maxZ - b.minZ + 1) : oz - 90 + rng() * 180;
            const h0 = r.getTerrainHeightAt(x, z);
            const feetY = rng() < 0.5 ? b.topY - 0.1 + rng() * 0.3 : (Number.isFinite(h0) ? h0 : 0) + rng() * 0.4;
            const headY = feetY + 1.8;
            let huelle = null;
            if (rng() < 0.3) {
                const w = rng() * Math.PI * 2;
                huelle = {
                    mitte: 0.3,
                    hl: 2.2,
                    hw: 0.9,
                    stufe: 0.25,
                    fX: Math.sin(w),
                    fZ: Math.cos(w),
                    qX: Math.cos(w),
                    qZ: -Math.sin(w),
                    unten: feetY + 0.2,
                    oben: feetY + 1.6,
                    schub: [],
                    schubQuelle: [],
                    // ein rutschender Wagen löst nie gegen sich selbst: jeder zweite Wagen trägt den Eintrag der Box als eigen
                    eigen: rng() < 0.5 && boxEintrag.get(b) ? boxEintrag.get(b).id : undefined,
                };
            }
            const lauf = (fn) => {
                st._wandKontaktNx = 0.123;
                st._wandKontaktNz = 0.456;
                const pos = { x, y: feetY, z };
                const h = huelle ? Object.assign({}, huelle, { schub: [], schubQuelle: [] }) : null;
                const quellen = h ? null : [];
                rufe = 0;
                fern = 0;
                letzter = null;
                reichJetzt = (h ? Math.abs(h.mitte) + h.hl + h.hw : 0.35) + 1e-6;
                const top = fn(pos, feetY, headY, 0.35, h, quellen);
                const id = (e) => (e ? e.type + "#" + e.id : "–");
                return {
                    werte: [
                        pos.x,
                        pos.z,
                        top,
                        st._wandKontaktNx,
                        st._wandKontaktNz,
                        h ? h.schub.join(",") : "",
                        h ? h.schubQuelle.map(id).join(",") : "",
                        quellen ? quellen.map((v) => (typeof v === "object" ? id(v) : v)).join(",") : "",
                    ],
                    rufe,
                    fern,
                };
            };
            const soll = lauf(alterLoeser);
            const ist = lauf((pos, f, hd, rad, h, q) => r._stepCharacterStructures(pos, f, hd, rad, h, q));
            R.koerper++;
            R.rufeAlt += soll.rufe;
            R.rufeNeu += ist.rufe;
            R.fern += ist.fern;
            if (soll.werte[0] !== x || soll.werte[1] !== z) R.geschoben++;
            if (Number.isFinite(soll.werte[2])) R.getragen++;
            const ab = soll.werte.map((v, k) => (Object.is(v, ist.werte[k]) ? null : k)).filter((k) => k !== null);
            if (ab.length) {
                R.abweichungen = (R.abweichungen || 0) + 1;
                if (R.abweichung.length < 3)
                    R.abweichung.push({ koerper: [x, feetY, z, !!huelle], soll: soll.werte, ist: ist.werte });
            }
        }
        return R;
    };

    // DIE NÄHE DES TIER-LEIBS: die Liste, die `_kreaturHuellenKontakt` baut, gegen das Orakel (die Schleife über den Bestand,
    // V18.535); ein Beweger (Position nach dem Eintritt verschoben, gemeldet wie vom Reiter-Schritt) gehört dazu
    const tier = (st.creatures || []).find((c) => c && c.userData && c.position);
    let beweger = null;
    const tierRunde = (name, n) => {
        const R = { name, proben: 0, abweichung: [], liste: 0, kandidaten: 0, bestand: 0, bewegerDrin: 0 };
        if (!tier) return Object.assign(R, { fehlt: true });
        const ud = tier.userData;
        const p = tier.position;
        const alt = { x: p.x, y: p.y, z: p.z, nah: ud._huellenNah };
        const L = r._kreaturHueftL(tier);
        const boxen = ortsBoxen();
        for (let i = 0; i < n; i++) {
            let x, z;
            const w = rng();
            if (beweger && w < 0.2) {
                x = beweger.position.x - 10 + rng() * 20;
                z = beweger.position.z - 10 + rng() * 20;
            } else if (w < 0.8 && boxen.length) {
                const b = boxen[Math.floor(rng() * boxen.length)];
                x = b.minX - 6 + rng() * (b.maxX - b.minX + 12);
                z = b.minZ - 6 + rng() * (b.maxZ - b.minZ + 12);
            } else {
                x = ox - 140 + rng() * 280;
                z = oz - 140 + rng() * 280;
            }
            const h0 = r.getTerrainHeightAt(x, z);
            p.set(x, Number.isFinite(h0) ? h0 : 0, z);
            const soll = [];
            for (const e of st.architectures) {
                if (!e || !e.position) continue;
                const rr = 8 + (e._blockerReach || 0);
                if (Math.abs(e.position.x - x) > rr || Math.abs(e.position.z - z) > rr) continue;
                soll.push(e);
            }
            ud._huellenNah = null;
            r._kreaturHuellenKontakt(tier, L, x, z);
            const ist = ud._huellenNah ? ud._huellenNah.liste : [];
            R.proben++;
            R.liste += soll.length;
            R.bestand += st.architectures.length;
            if (typeof r._blockerUmPlatz === "function") R.kandidaten += r._blockerUmPlatz(x, z, 8 + 1e-6, []).length;
            else R.kandidaten += st.architectures.length;
            if (beweger && soll.includes(beweger)) R.bewegerDrin++;
            const gleich = soll.length === ist.length && soll.every((e, k) => e === ist[k]);
            if (!gleich) {
                R.abweichungen = (R.abweichungen || 0) + 1;
                if (R.abweichung.length < 3)
                    R.abweichung.push({
                        ort: [x, z].map((v) => +v.toFixed(2)),
                        soll: soll.map((e) => e.type + "#" + e.id).slice(0, 6),
                        ist: ist.map((e) => e.type + "#" + e.id).slice(0, 6),
                    });
            }
        }
        p.set(alt.x, alt.y, alt.z);
        ud._huellenNah = alt.nah;
        return R;
    };

    // DIE KONSISTENZ des Netzes gegen den Bestand
    const konsistenz = () => {
        const f = [];
        if (typeof r._blockerNetz !== "function")
            return ["das Spiel kennt keine Nachbarschaft der Blocker (`_blockerNetz`)"];
        const N = r._blockerNetz();
        const im = new Set();
        let seq = -Infinity;
        for (const e of st.architectures) {
            if (!e) continue;
            im.add(e);
            if (e._blockerGen !== N.gen)
                f.push(`${e.type}#${e.id}: nicht im Netz (gen ${e._blockerGen} statt ${N.gen})`);
            if (!(e._blockerSeq > seq)) f.push(`${e.type}#${e.id}: die Ordnung steigt nicht mit dem Array`);
            seq = e._blockerSeq;
            if (e.position && !(N.beweger && N.beweger.has(e))) {
                const pk = e._blockerPlatz;
                const Zp = r.constructor.BLOCKER_ZELLE;
                const k = Math.floor(e.position.x / Zp) * 2097152 + Math.floor(e.position.z / Zp);
                if (!pk || !pk.length) f.push(`${e.type}#${e.id}: steht auf keinem Platz`);
                else if (pk[0] !== r.constructor.BLOCKER_RIESE && !pk.includes(k))
                    f.push(`${e.type}#${e.id}: seine Position liegt in Zelle ${k} außerhalb seines Platzes`);
                else
                    for (const kk of pk)
                        if (!(N.plaetze.get(kk) || []).includes(e)) f.push(`${e.type}#${e.id}: fehlt auf Platz ${kk}`);
            }
            if (e.blockerAABBs && e.blockerAABBs.length) {
                const keys = e._blockerZellen;
                if (!keys || !keys.length) f.push(`${e.type}#${e.id}: trägt Boxen, steht in keiner Zelle`);
                else
                    for (const k of keys)
                        if (!(N.zellen.get(k) || []).includes(e)) f.push(`${e.type}#${e.id}: fehlt in Zelle ${k}`);
                const Z = r.constructor.BLOCKER_ZELLE;
                if (keys && keys[0] !== r.constructor.BLOCKER_RIESE)
                    for (const b of e.blockerAABBs)
                        for (const [x, z] of [
                            [b.minX, b.minZ],
                            [b.maxX, b.maxZ],
                        ]) {
                            const k = Math.floor(x / Z) * 2097152 + Math.floor(z / Z);
                            if (!keys.includes(k))
                                f.push(`${e.type}#${e.id}: eine Box-Ecke liegt in Zelle ${k} außerhalb seiner Zellen`);
                        }
            }
        }
        for (const [k, zelle] of N.zellen)
            for (const e of zelle) if (!im.has(e)) f.push(`Zelle ${k} trägt ${e.type}#${e.id} außerhalb des Bestands`);
        for (const [k, zelle] of N.plaetze || [])
            for (const e of zelle) if (!im.has(e)) f.push(`Platz ${k} trägt ${e.type}#${e.id} außerhalb des Bestands`);
        return f.slice(0, 8);
    };
    const aus = { runden: [], konsistenz: [], loeser: [], tier: [] };
    const N = 1200;
    aus.runden.push(runde("Ort", N));
    aus.loeser.push(loeserRunde("Ort", 800));
    aus.tier.push(tierRunde("Ort", 600));
    aus.konsistenz.push(["Ort", konsistenz()]);
    // (1) Abriss: drei Häuser
    const haeuser = st.architectures.filter((e) => e && typeof e.type === "string" && e.type.startsWith("haus_"));
    for (const h of haeuser.slice(0, 3)) r.removeArchitecture(h);
    // (2) die Kappe nimmt einen Bau
    const bau = st.architectures.find((e) => e && e.blockerAABBs && !e.type.startsWith("haus_"));
    if (bau && typeof r._evictArchitecture === "function") r._evictArchitecture(bau);
    aus.runden.push(runde("Abriss", N));
    aus.loeser.push(loeserRunde("Abriss", 800));
    aus.tier.push(tierRunde("Abriss", 600));
    aus.konsistenz.push(["Abriss", konsistenz()]);
    // (3) ein Haus dreht sich und stempelt neu
    const h2 = st.architectures.find((e) => e && typeof e.type === "string" && e.type.startsWith("haus_"));
    if (h2) {
        h2.rotationY = (Number.isFinite(h2.rotationY) ? h2.rotationY : 0) + 0.37;
        r._populateBlockerAABBs(h2);
    }
    aus.runden.push(runde("Neu gestempelt", N));
    aus.loeser.push(loeserRunde("Neu gestempelt", 800));
    aus.tier.push(tierRunde("Neu gestempelt", 600));
    aus.konsistenz.push(["Neu gestempelt", konsistenz()]);
    // (4) ein neues Array (ein geladener Bestand) mit DENSELBEN Einträgen — sie tragen die Marken der alten Fragen
    // (`_blockerFrage`). DIE MARKEN-PROBE (0710-8 ROT 1): je Eintrag am Ort zählt sie den Zähler des neuen Netzes bis vor seine
    // alte Marke vor (Fragen an einem leeren fernen Ort) und zielt dann durch die Mitte seiner Box — die Frage darf ihn nicht
    // für schon besucht halten.
    const marken = st.architectures
        .filter(
            (e) =>
                e &&
                e.blockerAABBs &&
                e.blockerAABBs.length &&
                e.position &&
                Number.isFinite(e._blockerFrage) &&
                Math.hypot(e.position.x - ox, e.position.z - oz) < 90
        )
        .map((e) => ({ e, m: e._blockerFrage }))
        .sort((a, b) => a.m - b.m)
        // je alte Marke EIN Eintrag (Nachbarn tragen oft dieselbe — die Probe zählt jede Marke nur einmal vor)
        .filter((x, i, a) => i === 0 || a[i - 1].m !== x.m)
        .slice(-24);
    st.architectures = st.architectures.slice();
    {
        const M = { proben: 0, vorgezaehlt: 0, abweichungen: 0, abweichung: [] };
        const NN = typeof r._blockerNetz === "function" ? r._blockerNetz() : null;
        for (const { e, m } of marken) {
            // die oberste Box des Eintrags, senkrecht von oben getroffen (kein Gelände davor)
            let b = null;
            for (const bb of e.blockerAABBs)
                if (bb.topY > bb.botY && bb.maxX > bb.minX && (!b || bb.topY > b.topY)) b = bb;
            if (!b || !NN) continue;
            const cx = (b.minX + b.maxX) / 2,
                cz = (b.minZ + b.maxZ) / 2;
            let n = 0;
            while (NN.frage < m - 1 && n++ < 200000)
                r._fieldRaycast(cx + 9000, b.topY + 500, cz + 9000, cx + 9000, b.topY + 500.1, cz + 9000);
            if (NN.frage === m - 1) M.vorgezaehlt++;
            const sx = cx,
                sy = b.topY + 3,
                ex = cx,
                ey = b.botY;
            const cy = sy;
            const soll = orakel(sx, sy, cz, ex, ey, cz);
            const ist = r._fieldRaycast(sx, cy, cz, ex, ey, cz);
            M.proben++;
            const felder = ["hit", "t", "x", "y", "z", "nx", "ny", "nz"];
            if (!felder.every((f) => Object.is(soll[f], ist[f]))) {
                M.abweichungen++;
                if (M.abweichung.length < 3)
                    M.abweichung.push({ eintrag: `${e.type}#${e.id}`, marke: m, soll: soll.t, ist: ist.t });
            }
        }
        aus.marken = M;
    }
    aus.runden.push(runde("Neues Array", N));
    aus.loeser.push(loeserRunde("Neues Array", 800));
    aus.tier.push(tierRunde("Neues Array", 600));
    aus.konsistenz.push(["Neues Array", konsistenz()]);
    // (5) neue Bäume
    for (let k = 0; k < 3; k++)
        r.dslRun(["spawn_tree", ["near_player", 20 + k * 9], 5, "eiche", 990 + k], { source: "human" });
    aus.runden.push(runde("Neue Bäume", N));
    aus.loeser.push(loeserRunde("Neue Bäume", 800));
    aus.tier.push(tierRunde("Neue Bäume", 600));
    aus.konsistenz.push(["Neue Bäume", konsistenz()]);
    // (6) ein Beweger: ein Bau am Ort wandert 25 m (wie das gerittene Werk mit seinem Reiter) und meldet es wie der Reiter-Schritt
    beweger = st.architectures.find(
        (e) => e && e.blockerAABBs && e.position && Math.hypot(e.position.x - ox, e.position.z - oz) < 60
    );
    if (beweger) {
        beweger.position.x += 25;
        if (typeof r._blockerBewegt === "function") r._blockerBewegt(beweger);
    }
    aus.runden.push(runde("Beweger", N));
    aus.loeser.push(loeserRunde("Beweger", 800));
    aus.tier.push(tierRunde("Beweger", 600));
    aus.konsistenz.push(["Beweger", konsistenz()]);
    // (7) die Decken-Probe am Ort: Slabs je Strahl
    slabs = 0;
    for (let i = 0; i < 50; i++) r._ceilingHeadroom();
    aus.decke = { slabsJeStrahl: slabs / 50, beruehrt: 0 };
    const p0 = pm.position;
    aus.decke.beruehrt = beruehrt(p0.x, p0.y + 0.55, p0.z, p0.x, p0.y + 5.05, p0.z);
    // (Q) die Quelle
    const P = Object.getPrototypeOf(r);
    const code = (f) => (typeof P[f] === "function" ? window.__codeOf(P[f]) : "");
    aus.quelle = {
        strahlFragtNetz: /this\._blockerNetz\(\)/.test(code("_fieldRaycast")),
        strahlSchleife: /this\.state\.architectures/.test(
            code("_fieldRaycast").replace(/const arches = this\.state\.architectures;/, "")
        ),
        stempel: /this\._blockerNetzSetzen\(entry\)/.test(code("_blockerStampReach")),
        eintritt: /this\.state\.architectures\.push\(entry\);\s*this\._blockerEintritt\(entry\);/.test(
            code("spawnArchitecture")
        ),
        abriss: /this\.state\.architectures\.splice\(idx, 1\);\s*this\._blockerAustritt\(entry\);/.test(
            code("removeArchitecture")
        ),
        kappe: /arches\.splice\(idx, 1\);\s*this\._blockerAustritt\(entry\);/.test(code("_evictArchitecture")),
        tierFragtPlatz: /this\._blockerUmPlatz\(/.test(code("_kreaturHuellenKontakt")),
        tierSchleife: /for \(let a = 0; a < arches\.length; a\+\+\)/.test(code("_kreaturHuellenKontakt")),
    };
    return aus;
}

function urteil(S, stamm, pageErrors) {
    const rot = [];
    for (const R of S.runden) {
        if (R.abweichungen)
            rot.push(
                `(T) TREUE ${R.name}: ${R.abweichungen} von ${R.strahlen} Strahlen treffen anders als die Schleife über den Bestand — ${JSON.stringify(R.abweichung.slice(0, 2))}`
            );
        if (R.ueberzaehlig)
            rot.push(
                `(A) ARBEIT ${R.name}: ${R.ueberzaehlig} von ${R.strahlen} Strahlen prüfen Boxen, deren Hülle ihr Segment nicht berührt (${(R.slabs / R.strahlen).toFixed(1)} Slabs je Strahl, berührt ${(R.beruehrt / R.strahlen).toFixed(1)}) — Rufer _fieldRaycast`
            );
        if (R.strahlen < 1000 || R.struktur < 100)
            rot.push(
                `(T) ${R.name}: zu wenig Strahlen oder Bau-Treffer (${R.strahlen} Strahlen, ${R.struktur} Bau-Treffer)`
            );
    }
    for (const L of S.loeser) {
        if (L.abweichungen)
            rot.push(
                `(L) LÖSER ${L.name}: ${L.abweichungen} von ${L.koerper} Körpern lösen anders als die Schleife über den Bestand — ${JSON.stringify(L.abweichung.slice(0, 2))}`
            );
        if (L.fern)
            rot.push(
                `(L) LÖSER ${L.name}: ${L.fern} Löser-Rufe für Einträge, deren Hülle der Körper an seiner Stelle nicht erreicht (${(L.rufeNeu / L.koerper).toFixed(1)} Rufe je Körper, vorher ${(L.rufeAlt / L.koerper).toFixed(1)}) — Rufer _stepCharacterStructures`
            );
        if (L.geschoben < 50 || L.getragen < 50)
            rot.push(`(L) ${L.name}: zu wenig Schübe oder Auflagen (${L.geschoben} geschoben, ${L.getragen} getragen)`);
    }
    const Mk = S.marken || { proben: 0 };
    if (Mk.abweichungen)
        rot.push(
            `(T) MARKEN Neues Array: ${Mk.abweichungen} von ${Mk.proben} Strahlen verfehlen einen Eintrag, dessen alte Marke die Frage traf (${Mk.vorgezaehlt} vorgezählt) — ${JSON.stringify(Mk.abweichung)}`
        );
    if (Mk.proben < 8) rot.push(`(T) MARKEN: zu wenig Proben (${Mk.proben})`);
    for (const T of S.tier) {
        if (T.fehlt) {
            rot.push(`(N) ${T.name}: kein Tier in der Welt`);
            continue;
        }
        if (T.abweichungen)
            rot.push(
                `(N) TIER-LEIB ${T.name}: ${T.abweichungen} von ${T.proben} Nähe-Listen anders als die Schleife über den Bestand — ${JSON.stringify(T.abweichung.slice(0, 2))}`
            );
        if (T.kandidaten >= T.bestand)
            rot.push(
                `(N) TIER-LEIB ${T.name}: die Frage fasst den ganzen Bestand an (${(T.kandidaten / T.proben).toFixed(0)} Einträge je Neubau, Bestand ${(T.bestand / T.proben).toFixed(0)}) — Rufer _kreaturHuellenKontakt`
            );
        if (T.liste < T.proben)
            rot.push(`(N) ${T.name}: zu wenig Einträge in den Listen (${T.liste} in ${T.proben} Proben)`);
        if (T.name === "Beweger" && !T.bewegerDrin) rot.push("(N) Beweger: keine Probe traf den Beweger");
    }
    for (const [name, f] of S.konsistenz) for (const x of f) rot.push(`(K) KONSISTENZ ${name}: ${x}`);
    if (S.decke.slabsJeStrahl > S.decke.beruehrt)
        rot.push(
            `(A) ARBEIT Decke: ${S.decke.slabsJeStrahl} Slabs je Decken-Probe, ihr Segment berührt ${S.decke.beruehrt} Boxen`
        );
    const q = S.quelle;
    if (!q.strahlFragtNetz)
        rot.push("(Q) QUELLE: `_fieldRaycast` fragt die Nachbarschaft nicht (`this._blockerNetz()`)");
    if (q.strahlSchleife)
        rot.push(
            "(Q) QUELLE: `_fieldRaycast` läuft noch über den Bestand (`this.state.architectures` außer der Leer-Prüfung)"
        );
    if (!q.stempel)
        rot.push("(Q) QUELLE: `_blockerStampReach` stempelt die Nachbarschaft nicht (`_blockerNetzSetzen`)");
    if (!q.eintritt)
        rot.push("(Q) QUELLE: der Eintritt (`spawnArchitecture`, push) stempelt nicht (`_blockerEintritt`)");
    if (!q.abriss) rot.push("(Q) QUELLE: der Abriss (`removeArchitecture`, splice) löst nicht (`_blockerAustritt`)");
    if (!q.kappe) rot.push("(Q) QUELLE: die Kappe (`_evictArchitecture`, splice) löst nicht (`_blockerAustritt`)");
    if (!q.tierFragtPlatz)
        rot.push("(Q) QUELLE: der Tier-Leib (`_kreaturHuellenKontakt`) fragt die Plätze nicht (`_blockerUmPlatz`)");
    if (q.tierSchleife) rot.push("(Q) QUELLE: der Tier-Leib baut seine Nähe-Liste aus einer Schleife über den Bestand");
    if (stamm.length) rot.push(`(Q) QUELLE: Schreiber des Bestands ohne Stempel: ${stamm.join(" · ")}`);
    for (const e of pageErrors) rot.push(`(P) PAGE-ERROR: ${e}`);
    return rot;
}

// (Q) der Stamm: jeder Schreiber des Bestands — push/splice/pop/shift/unshift auf `this.state.architectures` oder einem Alias,
// eine Zuweisung des Arrays — steht an einer gestempelten Stelle (Zuweisung: das neue Array baut das Netz neu)
function stammSchreiber() {
    const z = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8").split("\n");
    const fremd = [];
    const alias = new Map();
    z.forEach((l, i) => {
        const code = l.replace(/\/\/.*$/, "");
        const m = /(?:const|let)\s+(\w+)\s*=\s*this\.state\.architectures\b/.exec(code);
        if (m) alias.set(m[1], (alias.get(m[1]) || []).concat(i));
    });
    z.forEach((l, i) => {
        const code = l.replace(/\/\/.*$/, "");
        const namen = [
            "this\\.state\\.architectures",
            ...[...alias.keys()].filter((a) => alias.get(a).some((j) => j <= i && i - j < 80)),
        ];
        for (const n of namen) {
            if (!new RegExp(`\\b${n}\\.(push|splice|pop|shift|unshift)\\(`).test(code)) continue;
            const nach = z.slice(i + 1, i + 3).join("\n");
            if (!/this\._blocker(Eintritt|Austritt)\(entry\)/.test(nach)) fremd.push(`Zeile ${i + 1}: ${code.trim()}`);
        }
        // ein Schreiber der Lage eines Eintrags in x/z (das gerittene Werk folgt seinem Reiter) meldet ihn als Beweger
        if (/\bentry\.position\.[xz]\s*=[^=]/.test(code)) {
            const nach = z.slice(i + 1, i + 4).join("\n");
            if (!/this\._blockerBewegt\(entry\)/.test(nach))
                fremd.push(`Zeile ${i + 1}: ${code.trim()} (Beweger ohne Meldung)`);
        }
    });
    return fremd;
}

(async () => {
    const stamm = stammSchreiber();
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 120000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.player ||
                typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const S = await page.evaluate(probe);
    await browser.close();
    server.close();

    console.log(
        "=== DIE NACHBARSCHAFT DER BLOCKER — der Strahl fragt seine Zellen (Null-Renderer, eine echte Welt) ==="
    );
    for (const R of S.runden)
        console.log(
            `  ${R.name.padEnd(15)} ${R.bauten} Bauten, ${R.boxen} Boxen am Ort · ${R.strahlen} Strahlen, ${R.treffer} Treffer · ` +
                `Slabs je Strahl ${(R.slabs / R.strahlen).toFixed(1)} (berührt ${(R.beruehrt / R.strahlen).toFixed(1)}) · ` +
                `Bau-Treffer ${R.struktur} · Abweichungen ${R.abweichungen || 0}`
        );
    for (const L of S.loeser)
        console.log(
            `  Löser ${L.name.padEnd(15)} ${L.koerper} Körper, ${L.geschoben} geschoben, ${L.getragen} getragen · ` +
                `Löser-Rufe je Körper ${(L.rufeNeu / L.koerper).toFixed(1)} (vorher ${(L.rufeAlt / L.koerper).toFixed(1)}), fern ${L.fern} · ` +
                `Abweichungen ${L.abweichungen || 0}`
        );
    for (const T of S.tier)
        console.log(
            T.fehlt
                ? `  Tier ${T.name.padEnd(16)} kein Tier`
                : `  Tier ${T.name.padEnd(16)} ${T.proben} Nähe-Listen, ${(T.liste / T.proben).toFixed(1)} Einträge je Liste · ` +
                      `Frage ${(T.kandidaten / T.proben).toFixed(1)} Einträge je Neubau (Bestand ${(T.bestand / T.proben).toFixed(0)})` +
                      (T.name === "Beweger" ? ` · Beweger in ${T.bewegerDrin} Listen` : "") +
                      ` · Abweichungen ${T.abweichungen || 0}`
        );
    console.log(
        `  Decken-Probe am Ort: ${S.decke.slabsJeStrahl} Slabs je Strahl, ihr Segment berührt ${S.decke.beruehrt} Boxen`
    );
    if (S.marken)
        console.log(
            `  Marken-Probe (Neues Array): ${S.marken.proben} Strahlen, ${S.marken.vorgezaehlt} bis vor die alte Marke vorgezählt, Abweichungen ${S.marken.abweichungen}`
        );
    console.log(`  Quelle: ${JSON.stringify(S.quelle)}`);
    const rot = urteil(S, stamm, pageErrors);
    const wand = boxWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    console.log(
        `  Box-Wand: ${wand.zuweisungen} Zuweisungen an .blockerAABBs, ${wand.befunde.length} Schreiber ohne Stempel`
    );
    for (const b of wand.befunde) rot.push(`(W) BOX-WAND: ${b.methode} Zeile ${b.zeile}: ${b.art} — ${b.text}`);
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\nGRÜN — Strahl, Löser und Tier-Leib urteilen byte-gleich wie die Schleife über den Bestand und fassen nur ihre Nachbarschaft an; das Netz ist der Bestand."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Blocker-Netz-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
