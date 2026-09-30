// diag-p2p-gestalt.cjs — P2P-GESTALT (V18.478): DIE STUDIO-ÜBERGABE REIST ZU DEN PEERS.
// Der benannte V18.477-Offen-Punkt: die Studio-Übergabe (state.studioUebergabe) war LOKALE
// Wahrheit — ein Mitspieler baute den fremden Avatar aus SEINEM eigenen _koerperStudioDials,
// die vom Sender gewählte Gestalt (Kleider/Haut/Haar) reiste nie übers Mesh. Jetzt trägt der
// soul-Kanal (_p2pBroadcastSoul) die Avatar-Übergabe additiv, der Empfänger (_p2pMsgSoul)
// validiert sie durch DENSELBEN Validator (_studioUebergabeValidate — EINE Quelle) und legt
// sie als PER-PEER-Wahrheit (entry.uebergabe) ab; der Peer-Guss (_p2pApplyPeerSoul) führt sie
// transient über _activePeerUebergabe in den EINEN Leser _koerperStudioDials (try/finally räumt
// sie IMMER — kein Leck in den lokalen Stat-/Guss-Read). Diese Linse hält die Naht:
//
//   (S) SELBST-TEST (nicht vakuös): ein Peer OHNE uebergabe-Feld baut den DEFAULT-Avatar
//       (Farb-Fingerabdruck == der lokale Default) — d. h. die Linse KANN Gleichheit sehen.
//   (N) NAHT: ein Peer-soul mit Übergabe (skinTone porzellan · topColor blue · hairColor black,
//       direkt an _p2pMsgSoul) ⇒ sein Avatar trägt MESSBAR die FREMDE Gestalt (Farb-Set enthält
//       porzellan-Haut, ≠ Default-Peer, ≠ eigener Avatar).
//   (W) WÄNDE: kaputte Payloads (falsches kind · NaN-only · Riesen-String > Taille · erfundene
//       Farben) fallen am SELBEN Validator fail-closed ⇒ der Peer baut den Default (kein Wurf).
//   (M) KEINE VERGIFTUNG: zwei Peers mit VERSCHIEDENER Gestalt ⇒ zwei DISTINKTE Ofen-Memo-
//       Einträge (der mensch-Ofen-Key trägt Dials+Gestalt+Guss-Farben) — die Avatare bleiben
//       eigenständig.
//   (E) DER EIGENE AVATAR bleibt byte-identisch, wenn ein Peer-Payload ankommt (der transiente
//       Kontext leckt nicht: _activePeerUebergabe ist nach dem Peer-Guss wieder leer).
//
//   node scripts/diag-p2p-gestalt.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.P2P_GESTALT_PORT || 4457);
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    // ── Quell-Proben (die Naht lebt im Stamm — Broadcast · Empfang · Konsum) ──
    console.log("=== P2P-GESTALT — Quell-Proben (die Übergabe reist im soul-Kanal) ===");
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    check(
        "Q: der soul-Broadcast trägt die Avatar-Übergabe additiv (nur koerper, kein toter Kreatur-Kanal)",
        /msg\.uebergabe = \{ koerper: su\.koerper \};/.test(stamm)
    );
    check(
        "Q: der Empfänger validiert durch DENSELBEN Validator (_studioUebergabeValidate, EINE Quelle)",
        /this\._studioUebergabeValidate\("koerper", uK\)/.test(stamm) && /entry\.uebergabe = cleanU;/.test(stamm)
    );
    check(
        "Q: der Peer-Guss führt die Übergabe transient (try/finally räumt _activePeerUebergabe)",
        /this\._activePeerUebergabe = peerU;\s*\n\s*try \{\s*\n\s*group = def\.build\(\);\s*\n\s*\} finally \{\s*\n\s*this\._activePeerUebergabe = savedActive;/.test(
            stamm
        )
    );
    check(
        "Q: _koerperStudioDials führt _activePeerUebergabe vor der eigenen state-Übergabe (EIN Leser)",
        /this\._activePeerUebergabe !== undefined && this\._activePeerUebergabe !== null\s*\n\s*\? this\._activePeerUebergabe/.test(
            stamm
        )
    );

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const res = { s: {}, n: {}, w: {}, m: {}, e: {} };
        // Farb-Set eines Peer-Meshes (Vertex-color-Attribut, Render-Diät-Muster).
        const colorsOf = (g) => {
            const set = new Set();
            if (!g) return set;
            g.traverse((o) => {
                const c = o.geometry && o.geometry.attributes && o.geometry.attributes.color;
                if (c && c.array && c.array.length >= 3)
                    set.add([c.array[0], c.array[1], c.array[2]].map((v) => v.toFixed(3)).join(","));
            });
            return set;
        };
        const fnv = (h, arr) => {
            const u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
            for (let i = 0; i < u8.length; i++) {
                h ^= u8[i];
                h = Math.imul(h, 0x01000193);
            }
            return h >>> 0;
        };
        const fpGroup = (g) => {
            let h = 0x811c9dc5;
            let n = 0;
            if (!g) return "0/0";
            g.traverse((o) => {
                const a = o.geometry && o.geometry.attributes && o.geometry.attributes.position;
                if (!a || !a.array) return;
                n++;
                h = fnv(h, a.array);
            });
            return (h >>> 0).toString(16) + "/" + n;
        };
        const lin = (hx) => {
            const f = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
            return [f(((hx >> 16) & 255) / 255), f(((hx >> 8) & 255) / 255), f((hx & 255) / 255)]
                .map((v) => v.toFixed(3))
                .join(",");
        };

        // ── Warm-Anker: Boot → f.ready → mensch-Rezept ──
        const dl0 = performance.now() + 150000;
        while ((!window.anazhRealm || typeof window.anazhRealm._p2pMsgSoul !== "function") && performance.now() < dl0)
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        const A = r.constructor;
        const f = r._ensureAssetFoundry();
        while (performance.now() < dl0) {
            if (f && f.ready && f.recipes && f.recipes.mensch && !f._prefetching) break;
            await sleep(120);
        }
        if (!(f && f.ready && f.recipes && f.recipes.mensch)) return { fatal: "mensch-Rezept kam nie" };
        const kc = window.__koerperCore;
        if (!kc) return { fatal: "koerper-Core fehlt" };
        const porzellanLin = lin(kc.SKIN_TONES.porzellan.hex >>> 0);

        // Minimales P2P-Bett (kein echtes Netz — der Empfangs-Chokepoint direkt).
        r.state.p2p = r.state.p2p || {};
        r.state.p2p.enabled = true;
        r.state.p2p.peerId = "self";
        r.state.p2p.peers = new Map();

        // Der eigene Avatar existiert (playerMesh) — Fingerabdruck VOR jedem Peer.
        try {
            r.applyPlayerSoul("human");
        } catch (_e) {}
        res.e.eigenVorher = fpGroup(r.state.playerMesh);

        const peerMesh = (pid) => {
            const ent = r.state.p2p.peers.get(pid);
            return ent && ent.mesh;
        };

        // ── (S) DEFAULT-PEER: soul human OHNE uebergabe ⇒ Default-Gestalt ──
        r._p2pMsgSoul({ peerId: "D", soulName: "human" }, r.state.p2p);
        const cD = colorsOf(peerMesh("D"));
        res.s.defaultBuilt = cD.size > 0;
        // der lokale Default (kein Übergabe-State) — dieselbe Gestalt wie der Default-Peer.
        const cLocal = colorsOf(r.state.playerMesh);
        res.s.defaultGleichtLokal = [...cD].some((x) => cLocal.has(x)) && cD.size === cLocal.size;

        // ── (N) ÜBERGABE-PEER: fremde Gestalt reist im soul-Payload ──
        r._p2pMsgSoul(
            {
                peerId: "A",
                soulName: "human",
                uebergabe: {
                    koerper: {
                        s: { height: 1.0 },
                        gestalt: { skinTone: "porzellan", topColor: "blue", hairColor: "black" },
                    },
                },
            },
            r.state.p2p
        );
        const cA = colorsOf(peerMesh("A"));
        res.n.built = cA.size > 0;
        res.n.traegtFremdHaut = cA.has(porzellanLin);
        res.n.verschiedenVomDefault = [...cA].some((x) => !cD.has(x)) || cA.size !== cD.size;
        res.n.entryUebergabe = !!(r.state.p2p.peers.get("A") && r.state.p2p.peers.get("A").uebergabe);

        // ── (W) WÄNDE: kaputte Payloads fallen am SELBEN Validator ──
        // (a) falsches kind (die Broadcast-Form trägt nur koerper — ein kreatur-Feld
        //     wird gar nicht erst als koerper gelesen); (b) NaN-only s + erfundene Farbe.
        r._p2pMsgSoul(
            {
                peerId: "W",
                soulName: "human",
                uebergabe: { koerper: { s: { height: NaN }, gestalt: { skinTone: "erfunden_xyz" } } },
            },
            r.state.p2p
        );
        const cW = colorsOf(peerMesh("W"));
        res.w.faelltAufDefault = [...cW].every((x) => cD.has(x)) && cW.size === cD.size;
        res.w.keineFremdHaut = !cW.has(porzellanLin);
        res.w.entryLeer = !(r.state.p2p.peers.get("W") && r.state.p2p.peers.get("W").uebergabe);
        // (c) Riesen-String > Taille-Cap ⇒ Validator null ⇒ Default.
        const riese = "x".repeat((A.TAILLE_UNKNOWN_FIELD_MAX || 8192) + 100);
        r._p2pMsgSoul(
            {
                peerId: "R",
                soulName: "human",
                uebergabe: { koerper: { s: { height: 1 }, gestalt: { topColor: riese } } },
            },
            r.state.p2p
        );
        res.w.rieseEntryLeerOderGeclampt = (() => {
            const u = r.state.p2p.peers.get("R") && r.state.p2p.peers.get("R").uebergabe;
            // Der Riesen-String fällt (nicht in CLOTH_COLORS + FORM-Wand) ⇒ gestalt leer;
            // die valide height bleibt ⇒ Übergabe darf {s:{height}} sein, aber NIE den Riesen tragen.
            return !u || !(u.gestalt && u.gestalt.topColor === riese);
        })();

        // ── (M) KEINE VERGIFTUNG: zwei Peers, zwei distinkte Ofen-Keys ──
        const memo = A._tierOfenMemo;
        const keysMit = memo ? [...memo.keys()].filter((k) => k.indexOf("mensch|") === 0) : [];
        // Peer B: andere Haut ⇒ anderer skinColor im Key ⇒ eigener Memo-Eintrag.
        r._p2pMsgSoul(
            {
                peerId: "B",
                soulName: "human",
                uebergabe: { koerper: { s: { height: 1.0 }, gestalt: { skinTone: "sand", topColor: "grey" } } },
            },
            r.state.p2p
        );
        const keysNach = memo ? [...memo.keys()].filter((k) => k.indexOf("mensch|") === 0) : [];
        res.m.distinkteKeys = new Set(keysNach).size >= 3; // Default + porzellan + sand
        res.m.peerBFremd = (() => {
            const cB = colorsOf(peerMesh("B"));
            return [...cB].some((x) => !cA.has(x)) && cB.size > 0;
        })();
        res.m.keysVor = keysMit.length;
        res.m.keysNach = keysNach.length;

        // ── (E) DER EIGENE AVATAR bleibt byte-identisch (kein transienter Leck) ──
        res.e.eigenNachher = fpGroup(r.state.playerMesh);
        res.e.activeLeer = r._activePeerUebergabe === undefined || r._activePeerUebergabe === null;
        // Erneuter EIGENER Guss nach all den Peer-Güssen ⇒ Default (die eigene Übergabe ist leer).
        try {
            r.applyPlayerSoul("human");
        } catch (_e) {}
        const cLocalNach = colorsOf(r.state.playerMesh);
        res.e.eigenKeineFremdHaut = !cLocalNach.has(porzellanLin);

        return res;
    });

    await browser.close();
    server.close();

    console.log("\n===== P2P-GESTALT — die Übergabe reist zu den Peers =====\n");
    if (!out || out.fatal) {
        console.log("FEHLER:", out ? out.fatal : "?");
        process.exit(1);
    }
    check("(S) ein Peer OHNE Übergabe baut den Default-Avatar", out.s.defaultBuilt === true);
    check(
        "(S) der Default-Peer gleicht dem lokalen Default (die Linse KANN Gleichheit sehen)",
        out.s.defaultGleichtLokal === true
    );
    check(
        "(N) der Übergabe-Peer wurde gebaut + trägt einen entry.uebergabe",
        out.n.built === true && out.n.entryUebergabe === true
    );
    check("(N) der Peer-Avatar trägt die FREMDE Haut (porzellan im Farb-Set)", out.n.traegtFremdHaut === true);
    check("(N) und ist verschieden vom Default-Peer", out.n.verschiedenVomDefault === true);
    check(
        "(W) kaputter Payload (NaN + erfundene Farbe) fällt fail-closed auf den Default",
        out.w.faelltAufDefault === true && out.w.keineFremdHaut === true && out.w.entryLeer === true
    );
    check("(W) Riesen-String > Taille wird gesiebt (nie getragen)", out.w.rieseEntryLeerOderGeclampt === true);
    check(
        `(M) zwei Peers ⇒ distinkte Ofen-Memo-Keys (${out.m.keysVor}→${out.m.keysNach})`,
        out.m.distinkteKeys === true
    );
    check("(M) Peer B trägt eine eigenständige Gestalt (keine Vergiftung von A)", out.m.peerBFremd === true);
    check(
        `(E) der EIGENE Avatar bleibt byte-identisch (${out.e.eigenVorher} == ${out.e.eigenNachher})`,
        out.e.eigenVorher === out.e.eigenNachher
    );
    check("(E) der transiente Peer-Kontext leckt nicht (_activePeerUebergabe leer)", out.e.activeLeer === true);
    check("(E) der eigene Neu-Guss trägt KEINE fremde Haut", out.e.eigenKeineFremdHaut === true);
    check("kein Page-Error", pageErrors.length === 0, pageErrors[0] || "sauber");

    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Studio-Übergabe reist zu den Peers: der soul-Kanal trägt die Avatar-Gestalt, der Empfänger validiert am SELBEN Validator, der Peer-Guss führt sie transient (kein Leck), zwei Peers bleiben eigenständig (distinkte Ofen-Keys), und der eigene Avatar ist unberührt."
    );
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
