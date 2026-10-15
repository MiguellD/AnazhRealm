// diag-mp-sync.cjs — DIE MEHRSPIELER-WAND (K04, 11.10.; `npm run gate:mp-sync`). Die CI-Wand der Zwei-Seiten-Familie
// (smoke-lockstep · smoke-webrtc · smoke-copresence: zwei echte Seiten, ein echter signaling-server) — die Smokes liefen
// in keinem Workflow, die Tür des Mehrspielers war Wachsamkeit.
//
// Zwei Klassen beim Namen:
//   (a) URSPRUNG  der Mitspieler erscheint nie im Weltursprung: `_p2pEnsurePeerEntry` legte Leib und Schild bei
//                 peer-join/welcome sichtbar bei 0/0/0 an, bis die erste Position kam. Gezählt wird je Spiel-Takt
//                 (`p2pTick`, der Takt, der den Leib zeichnet) jedes sichtbare Peer-Objekt bei x = z = 0 — getrennt,
//                 ob seine Seite je einen Ort des Peers empfing (pos oder Lockstep-Schritt). Soll: 0.
//   (b) TÜR       die Absicht trägt die Tür selbst: `initP2PSync` setzte `p2p.enabled` nie, der close-Zweig und
//                 `_p2pScheduleReconnect` planen den Rejoin nur bei `enabled` — ein nackter Aufruf, dessen erster Aufbau
//                 scheitert (signaling-server aus), heilte nie. Probe: Server beim Aufbau 3 s aus, dann an; Rejoin
//                 ≤ 31 s (Backoff-Deckel 30 s + Jitter). Täter, wenn ROT: der Rejoin liest eine Absicht, die die Tür
//                 nie setzte.
//   (c) GRABEN    das Chat-Graben reist (K23): A tippt „voxel carve“ und „voxel fill“ im Gespräch, B trägt GENAU dieselben
//                 zwei Edits (Ort, Radius, Art) — keiner fehlt (Täter `_chatTryVoxelDebugCommand`: schnitzt direkt statt
//                 über dslRun) und keiner doppelt (Täter: der Empfang wendet eine Graben-Nachricht mehrfach an).
//   (d) LANGE TAKTE B trägt Takte, in denen je Takt mindestens 2 × `aufholJeSchritt` Schritte von A ankommen (K60): B sieht A
//                 an dessen Ort, und nach JEDEM Takt liegen höchstens Jitter-Reserve + ein Aufhol-Burst Schritte hinter dem
//                 Empfang (Täter `_lockstepTickPeers`: die Kappe zählt Frames statt Wanduhr). Der Selbsttest im Hauptlauf
//                 setzt die alte Kappe ein → (d) ROT am Verzug.
// Dazu der Spielpfad: Seite A über den KNOPF (`#p2p-toggle`, zweiter Klick im Aufbau startet kein zweites Init, der
// Knopf liest die EINE Absicht), Seite B über den BOOT (die gemerkte Absicht aus `p2pPersist`). A läuft nach dem
// Ladeschirm über die Tastatur (`_stepCharacter`; A bootete zuerst, sein Ladeschirm fällt zuerst), B sieht A an dessen
// Ort (±0,3 m waagrecht); die Latenz (A bewegt sich → B sieht es) wird berichtet.
// Konsum-Leser: `_p2pUpdatePeer` (zeichnet den Peer je Takt) und der close-Zweig von `initP2PSync` (plant den Rejoin).
//
// Selbsttest (`--selftest`): die alte Tür wieder eingesetzt (initP2PSync lässt `enabled`, wie es war) → (b) ROT. Der
// Selbsttest von (c) läuft im Hauptlauf gleich nach (c): B wendet jede Graben-Nachricht doppelt an (`_p2pMsgDsl` zweimal)
// → (c) ROT an der Länge; die erste Fassung aus K23 fragte nur „jeder Edit von A auch bei B“ und blieb dabei grün.
// Ports: MP_SYNC_PORT (save-server, Default 4312), MP_SYNC_SIGNAL_PORT (signaling, Default 4313). `--roh <datei>`
// schreibt die Zahlen als JSON.
//
//   node scripts/diag-mp-sync.cjs [--selftest] [--roh <datei>]
"use strict";
const { starteBrowser } = require("./lib/welt-boot.cjs");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.MP_SYNC_PORT || 4312);
const SIGNAL_PORT = Number(process.env.MP_SYNC_SIGNAL_PORT || 4313);
const PAGE_URL = `http://127.0.0.1:${PORT}/index.html`;
const SIGNALING_URL = `ws://127.0.0.1:${SIGNAL_PORT}`;
const ROOM = "mp-sync-raum";
const SELBSTTEST = process.argv.includes("--selftest");
const ROH = (() => {
    const i = process.argv.indexOf("--roh");
    return i > 0 ? process.argv[i + 1] : null;
})();
const REJOIN_DECKEL_S = 31;
const ABSTAND_M = 0.3;
const LATENZ_MS = 150;
// (d) der lange Takt bei B, in Schritten: B tickt erst, wenn ZUFLUSS_FAKTOR × aufholJeSchritt Schritte von A angekommen sind —
// das Szenario steht in Schritten je Takt, nie in Millisekunden des Läufers (CI 38670118945: mit 300-ms-Takten hielt die alte
// Kappe bei langsamem Sender fast Schritt, der Selbsttest war blind).
const ZUFLUSS_FAKTOR = 2;
// Nachlauf nach dem Eintreffen der Edits bei B: eine zweite Anwendung derselben Nachricht kann nach der ersten landen.
const GRABEN_NACHLAUF_MS = 800;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function startProc(script, readyRe) {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [path.join(ROOT, script)], {
            cwd: ROOT,
            stdio: ["ignore", "pipe", "pipe"],
            env: Object.assign({}, process.env, { PORT: String(PORT), ANAZH_SIGNALING_PORT: String(SIGNAL_PORT) }),
        });
        let ready = false;
        const timer = setTimeout(() => {
            if (!ready) reject(new Error(`${script} startete nicht innerhalb 8 s`));
        }, 8000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && readyRe.test(chunk.toString())) {
                ready = true;
                clearTimeout(timer);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

async function waitFor(page, fn, timeoutMs, label, ...args) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
        if (await page.evaluate(fn, ...args).catch(() => false)) return Date.now() - t0;
        await sleep(150);
    }
    throw new Error(`Zeitüberschreitung: ${label}`);
}

// Im Seiten-Kontext: Render ruht (zwei Seiten auf swiftshader verhungern sonst den Event-Loop, s. smoke-lockstep),
// der Loop läuft voll über die Pumpe; die Probe hängt am Spiel-Takt `p2pTick` und am Empfang `_p2pMsgPos`.
function installiere(alteTuer) {
    const r = window.anazhRealm;
    if (r.state.renderer) {
        r.state.renderer.render = function () {};
        if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
    }
    r.state.postProcessingFailed = true;
    const mp = (window.__mp = {
        takte: 0,
        peerTakte: 0,
        ursprung: 0,
        ursprungOhneOrt: 0,
        ursprungNachlauf: 0,
        // je Mitspieler: stand er beim ZEICHNEN im Ursprung (die Wahrheit des Zeichen-Moments, `_p2pUpdatePeer`)
        wahrBeimZeichnen: new Map(),
        ortZuletzt: new Map(),
        ursprungBeispiel: null,
        ortGesehen: new Set(),
        inits: 0,
        verbundenAm: null,
        eigenStart: null,
        eigenBewegtAm: null,
        blick: null,
        blickBewegtAm: null,
    });
    const neueTuer = r.initP2PSync;
    r.initP2PSync = function (...a) {
        mp.inits++;
        const vor = this.state.p2p.enabled;
        const res = neueTuer.apply(this, a);
        if (alteTuer) this.state.p2p.enabled = vor; // die alte Tür: die Absicht bleibt, wie sie war
        return res;
    };
    const msgPos = r._p2pMsgPos;
    r._p2pMsgPos = function (msg, p2p) {
        if (msg && typeof msg.peerId === "string") mp.ortGesehen.add(msg.peerId);
        // der zuletzt empfangene Ort: steht der Mitspieler WIRKLICH im Ursprung (die Welt setzt jeden Erst-Spawn auf 0/0, und
        // das Gelände des Kerns trägt dort ebenen Grund — er bleibt stehen), ist der Ursprung sein Ort, kein Täter
        if (msg && typeof msg.peerId === "string") mp.ortZuletzt.set(msg.peerId, { x: msg.x, z: msg.z });
        return msgPos.call(this, msg, p2p);
    };
    // DIE WAHRHEIT DES ZEICHEN-MOMENTS: `_p2pUpdatePeer` zeichnet den Ort, den der Ghost am Ende des VORIGEN Takts setzte
    // (`_lockstepTickPeers` läuft in `p2pTick` NACH dem Zeichnen) bzw. den Snap von vor P2P_SNAP_INTERP_DELAY_MS (120 ms).
    // Geurteilt wird darum gegen die Quellen in DIESEM Moment — der Ghost, der Snap-Puffer, der zuletzt empfangene Ort —,
    // nie gegen den Ghost nach dem Takt (8a2f91e5 und be09baf4: 1–2 Takte ROT, als A aus dem Erst-Spawn 0/0 loslief).
    const zeichne = r._p2pUpdatePeer;
    r._p2pUpdatePeer = function (entry, t, dt) {
        const res = zeichne.call(this, entry, t, dt);
        const ls = entry.lockstep;
        const oz = mp.ortZuletzt.get(entry.peerId);
        mp.wahrBeimZeichnen.set(
            entry.peerId,
            !!(
                (ls && ls.seeded && ls.x === 0 && ls.z === 0) ||
                (entry.snapBuf && entry.snapBuf.some((q) => q.x === 0 && q.z === 0)) ||
                (oz && oz.x === 0 && oz.z === 0)
            )
        );
        return res;
    };
    const tick = r.p2pTick;
    r.p2pTick = function (t) {
        const res = tick.call(this, t);
        const p2p = this.state.p2p;
        mp.takte++;
        if (p2p.connected && mp.verbundenAm === null) mp.verbundenAm = Date.now();
        if (!p2p.connected) mp.verbundenAm = null;
        for (const [pid, e] of p2p.peers) {
            mp.peerTakte++;
            const ls = e.lockstep;
            const ortBekannt = mp.ortGesehen.has(pid) || !!(ls && ls.seeded && ls.doneSeq >= 0);
            for (const o of [e.mesh, e.nameLabel]) {
                if (!o || !o.parent || !o.visible) continue;
                const oz = mp.ortZuletzt.get(pid);
                const wirklich = mp.wahrBeimZeichnen.get(pid) === true;
                const imUrsprung = o.position.x === 0 && o.position.z === 0;
                // der Nachlauf: die alte Regel (Ghost NACH dem Takt, neuester Ort) hätte diesen Takt ROT gezählt
                const alteRegel = (oz && oz.x === 0 && oz.z === 0) || (ls && ls.seeded && ls.x === 0 && ls.z === 0);
                if (imUrsprung && wirklich && !alteRegel) mp.ursprungNachlauf++;
                if (imUrsprung && !wirklich) {
                    mp.ursprung++;
                    if (!ortBekannt) mp.ursprungOhneOrt++;
                    if (!mp.ursprungBeispiel)
                        mp.ursprungBeispiel = { pid, art: o === e.mesh ? e.meshKind : "schild", y: o.position.y };
                }
            }
            if (mp.blick && mp.blick.pid === pid && mp.blickBewegtAm === null && e.mesh) {
                const p = e.mesh.position;
                if (Math.hypot(p.x - mp.blick.x, p.z - mp.blick.z) > 0.05) mp.blickBewegtAm = Date.now();
            }
        }
        const pm = this.state.playerMesh;
        if (mp.eigenStart && mp.eigenBewegtAm === null && pm) {
            if (Math.hypot(pm.position.x - mp.eigenStart.x, pm.position.z - mp.eigenStart.z) > 0.05)
                mp.eigenBewegtAm = Date.now();
        }
        return res;
    };
    // DER TAKT DES GHOSTS: jeder Verbrauch (`_lockstepTickPeers`, aus `p2pTick`) zählt; (d) legt seine langen Takte um
    // diesen Zähler, nie an ihm vorbei
    const lsEcht = Object.getPrototypeOf(r)._lockstepTickPeers;
    mp.lsTakte = 0;
    mp.lsZaehler = function (nowMs) {
        mp.lsTakte++;
        return lsEcht.call(this, nowMs);
    };
    r._lockstepTickPeers = mp.lsZaehler;
    window.__mpPumpe = setInterval(() => {
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {
            /* der Loop trägt seine eigene Fehlerwand */
        }
    }, 16);
    return true;
}

function bericht(p) {
    return p.evaluate(() => {
        const mp = window.__mp;
        const p2p = window.anazhRealm.state.p2p;
        const t = document.getElementById("p2p-toggle");
        return {
            takte: mp.takte,
            peerTakte: mp.peerTakte,
            ursprung: mp.ursprung,
            ursprungOhneOrt: mp.ursprungOhneOrt,
            ursprungNachlauf: mp.ursprungNachlauf,
            ursprungBeispiel: mp.ursprungBeispiel,
            inits: mp.inits,
            enabled: p2p.enabled === true,
            connected: p2p.connected === true,
            timer: !!p2p.reconnectTimer,
            knopf: t ? t.getAttribute("aria-pressed") : null,
            peerId: p2p.peerId,
            peers: Array.from(p2p.peers.keys()),
            meshActive: p2p.meshActive === true,
        };
    });
}

(async () => {
    const fehler = [];
    const roh = { selbsttest: SELBSTTEST, port: PORT, signalPort: SIGNAL_PORT };
    const check = (name, ok, detail = "") => {
        console.log(`  ${ok ? "OK  " : "ROT "} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) fehler.push(name);
    };
    const t0 = Date.now();
    const saveServer = await startProc("save-server.js", /läuft/);
    let signaling = null;
    const browser = await starteBrowser({ art: "webgl", frist: 180000, zusatz: ["--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"] });
    try {
        // ── Seite A: frisch, der signaling-server ist AUS ──
        const pageA = await browser.newPage();
        await pageA.setViewport({ width: 640, height: 400 });
        await pageA.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        await waitFor(
            pageA,
            () =>
                !!window.anazhRealm &&
                typeof window.anazhRealm._gameLoopTick === "function" &&
                !!window.anazhRealm.state.playerMesh,
            90000,
            "Seite A bereit"
        );
        await pageA.evaluate(installiere, SELBSTTEST);
        // Adresse + Raum über die UI-Felder (ihr change-Hörer schreibt + merkt sie; verbunden wird hier noch nichts).
        await pageA.evaluate(
            (url, raum) => {
                const u = document.getElementById("p2p-url");
                const r = document.getElementById("p2p-room");
                u.value = url;
                u.dispatchEvent(new Event("change"));
                r.value = raum;
                r.dispatchEvent(new Event("change"));
            },
            SIGNALING_URL,
            ROOM
        );

        // ── (b) TÜR: der nackte Aufruf, Server beim Aufbau aus ──
        console.log("(b) Tür-Probe: nackter Aufruf, signaling-server 3 s aus ...");
        const vorTuer = await pageA.evaluate(() => window.anazhRealm.state.p2p.enabled === true);
        await pageA.evaluate(() => window.anazhRealm.initP2PSync(null));
        await sleep(3000);
        signaling = await startProc("signaling-server.js", /lauscht/);
        const tAn = Date.now();
        let rejoinS = null;
        let ohnePlan = 0;
        while (Date.now() - tAn < REJOIN_DECKEL_S * 1000) {
            const s = await bericht(pageA);
            if (s.connected) {
                rejoinS = (Date.now() - tAn) / 1000;
                break;
            }
            // Kein Socket im Aufbau, kein Rejoin geplant: nichts kann mehr heilen.
            const offen = await pageA.evaluate(() => {
                const ws = window.anazhRealm.state.p2p.ws;
                return !!ws && ws.readyState <= 1;
            });
            ohnePlan = !s.timer && !offen ? ohnePlan + 1 : 0;
            if (ohnePlan >= 12) break;
            await sleep(250);
        }
        const nachTuer = await bericht(pageA);
        roh.tuer = { enabledVor: vorTuer, enabledNach: nachTuer.enabled, rejoinS };
        check(
            `(b) Tür: der nackte Aufruf heilt nach ${3} s Server-Ausfall (Rejoin ≤ ${REJOIN_DECKEL_S} s)`,
            rejoinS !== null,
            rejoinS !== null
                ? `Rejoin ${rejoinS.toFixed(1)} s nach Server-Start, Absicht ${vorTuer}→${nachTuer.enabled}`
                : `kein Rejoin geplant (enabled=${nachTuer.enabled}) — Täter: _p2pScheduleReconnect / der close-Zweig lesen p2p.enabled, das initP2PSync nie setzt`
        );
        if (SELBSTTEST) {
            await browser.close();
            saveServer.kill();
            if (signaling) signaling.kill();
            const rot = rejoinS === null;
            console.log(
                rot
                    ? "SELBSTTEST OK: die alte Tür (initP2PSync ohne Absicht) macht (b) ROT"
                    : "SELBSTTEST ROT: die alte Tür blieb grün — die Probe sieht die Tür nicht"
            );
            if (ROH) fs.writeFileSync(ROH, JSON.stringify(roh, null, 2));
            process.exit(rot ? 0 : 1);
        }

        // ── Der KNOPF: aus, an, ein zweiter Klick im Aufbau ──
        const klick = () => document.getElementById("p2p-toggle").click();
        const k0 = await bericht(pageA);
        check(
            "Knopf liest die Absicht der Tür („an“ nach dem nackten Aufruf)",
            k0.enabled && k0.knopf === "true",
            `enabled=${k0.enabled} aria-pressed=${k0.knopf}`
        );
        if (k0.enabled) {
            await pageA.evaluate(klick);
            const kAus = await bericht(pageA);
            check(
                "Knopf aus: Absicht fällt, Verbindung zu, kein Rejoin geplant",
                !kAus.enabled && !kAus.connected && !kAus.timer && kAus.knopf === "false",
                `enabled=${kAus.enabled} connected=${kAus.connected} timer=${kAus.timer} aria=${kAus.knopf}`
            );
        }
        const kVor = await bericht(pageA);
        await pageA.evaluate(klick);
        const kAn = await bericht(pageA);
        await pageA.evaluate(klick); // der zweite Klick, solange der Aufbau läuft
        const kZwei = await bericht(pageA);
        check(
            "Knopf an startet EIN Init, der zweite Klick im Aufbau keines (er liest „an“ und schaltet aus)",
            kAn.inits === kVor.inits + 1 &&
                kAn.enabled &&
                kAn.knopf === "true" &&
                kZwei.inits === kAn.inits &&
                !kZwei.enabled,
            `Inits ${kVor.inits}→${kAn.inits}→${kZwei.inits}, verbunden beim 2. Klick=${kZwei.connected}`
        );
        await pageA.evaluate(klick);
        await waitFor(pageA, () => window.anazhRealm.state.p2p.connected === true, 15000, "A verbunden über den Knopf");
        const kVerb = await bericht(pageA);
        check("Knopf an: A verbunden, Knopf „an“", kVerb.connected && kVerb.knopf === "true", `Inits ${kVerb.inits}`);

        // ── Seite B: der BOOT (die gemerkte Absicht aus p2pPersist) ──
        console.log("Seite B bootet mit der gemerkten Absicht ...");
        const pageB = await browser.newPage();
        await pageB.setViewport({ width: 640, height: 400 });
        await pageB.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        await waitFor(
            pageB,
            () =>
                !!window.anazhRealm &&
                typeof window.anazhRealm._gameLoopTick === "function" &&
                !!window.anazhRealm.state.playerMesh,
            90000,
            "Seite B bereit"
        );
        await pageB.evaluate(installiere, false);
        await waitFor(pageB, () => window.anazhRealm.state.p2p.connected === true, 30000, "B verbunden über den Boot");
        const idA = kVerb.peerId;
        const idB = (await bericht(pageB)).peerId;
        await waitFor(pageA, (id) => window.anazhRealm.state.p2p.peers.has(id), 20000, "A kennt B", idB);
        await waitFor(pageB, (id) => window.anazhRealm.state.p2p.peers.has(id), 20000, "B kennt A", idA);
        check("B verbunden über den Boot, beide kennen einander", true, `A=${idA} B=${idB}`);

        // A steht: der Ladeschirm ist gefallen (erst dann gehören die Tasten dem Spieler), die Höhe ruhig.
        const ladeMs = await waitFor(pageA, () => !window.anazhRealm._ladeschirmSteht(), 120000, "A: Ladeschirm weg");
        await waitFor(
            pageA,
            () => {
                const y = window.anazhRealm.state.playerMesh.position.y;
                const prev = window.__mpY;
                window.__mpY = y;
                return prev !== undefined && Math.abs(y - prev) < 0.02;
            },
            30000,
            "A gesettelt"
        );
        await sleep(800);

        // ── A läuft über die Tastatur, B sieht zu ── (ein Lauf: A geht 1,6 s, steht wieder, B zeigt ihn an dessen Ort)
        const laufUndSicht = async () => {
            const vorLauf = await pageA.evaluate(() => {
                const p = window.anazhRealm.state.playerMesh.position;
                return { x: p.x, y: p.y, z: p.z };
            });
            await pageB.evaluate((id) => {
                const e = window.anazhRealm.state.p2p.peers.get(id);
                window.__mp.blick = { pid: id, x: e.mesh.position.x, z: e.mesh.position.z };
                window.__mp.blickBewegtAm = null;
            }, idA);
            await pageA.bringToFront();
            await pageA.evaluate(() => {
                if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
                const p = window.anazhRealm.state.playerMesh.position;
                window.__mp.eigenStart = { x: p.x, z: p.z };
                window.__mp.eigenBewegtAm = null;
                window.__mpP = undefined;
            });
            await pageA.keyboard.down("w");
            await sleep(1600);
            await pageA.keyboard.up("w");
            await waitFor(
                pageA,
                () => {
                    const p = window.anazhRealm.state.playerMesh.position;
                    const prev = window.__mpP;
                    window.__mpP = { x: p.x, z: p.z };
                    return prev !== undefined && Math.hypot(p.x - prev.x, p.z - prev.z) < 0.005;
                },
                15000,
                "A steht wieder"
            );
            await sleep(1200);
            // B urteilt nach seinem EREIGNIS: zwei eigene Takte, seit A steht — nie nach der Uhr des Läufers (ein Hintergrund-
            // Takt unter Last kam lokal 1,9 s nach dem Stand noch nicht: Abstand 1,905 m bei Rückstau 111, K60-N3/mp-3.txt)
            const takteB = await pageB.evaluate(() => window.__mp.lsTakte);
            await waitFor(pageB, (n) => window.__mp.lsTakte >= n + 2, 60000, "B: zwei Ghost-Takte nach dem Stand von A", takteB);
            const wahrA = await pageA.evaluate(() => {
                const p = window.anazhRealm.state.playerMesh.position;
                return { x: p.x, y: p.y, z: p.z, bewegtAm: window.__mp.eigenBewegtAm };
            });
            const sichtB = await pageB.evaluate((id) => {
                const e = window.anazhRealm.state.p2p.peers.get(id);
                const p = e.mesh.position;
                const ls = e.lockstep;
                return {
                    x: p.x,
                    y: p.y,
                    z: p.z,
                    art: e.meshKind,
                    sichtbar: e.mesh.visible,
                    gesehenAm: window.__mp.blickBewegtAm,
                    rueckstau: ls ? ls.buf.length : null,
                };
            }, idA);
            const lauf = Math.hypot(wahrA.x - vorLauf.x, wahrA.z - vorLauf.z);
            const abstand = Math.hypot(sichtB.x - wahrA.x, sichtB.z - wahrA.z);
            const latenz = wahrA.bewegtAm && sichtB.gesehenAm ? sichtB.gesehenAm - wahrA.bewegtAm : null;
            return { lauf, abstand, latenz, wahrA, sichtB };
        };
        const sichtSatz = (l) =>
            `Abstand ${l.abstand.toFixed(3)} m, Leib ${l.sichtB.art}, sichtbar=${l.sichtB.sichtbar}, ` +
            `Rückstau ${l.sichtB.rueckstau} Schritte, Latenz ${l.latenz === null ? "n/a" : l.latenz + " ms"}`;
        const l0 = await laufUndSicht();
        roh.lauf = Object.assign({ ladeschirmMs: ladeMs }, l0);
        check("A lief über die Tastatur (> 1 m)", l0.lauf > 1, `${l0.lauf.toFixed(2)} m`);
        check(
            `B sieht A an dessen Ort (±${ABSTAND_M} m waagrecht)`,
            l0.sichtB.sichtbar && l0.abstand <= ABSTAND_M,
            sichtSatz(l0)
        );
        console.log(
            `  INFO Latenz A bewegt → B sieht: ${l0.latenz === null ? "n/a" : l0.latenz + " ms"} (Soll lokal ≤ ${LATENZ_MS} ms, in der CI berichtet)`
        );
        if (!process.env.CI && l0.latenz !== null)
            check(`Latenz ≤ ${LATENZ_MS} ms (lokal)`, l0.latenz <= LATENZ_MS, `${l0.latenz} ms`);

        // ── (d) LANGE TAKTE (K60): B trägt lange Takte (der Lade-Takt eines Mitspielers unter seinem Ladeschirm, ein
        // langsames Gerät) — der Ghost hält mit dem Sender Schritt, sein Verbrauch liest die Wanduhr, nie den Frame
        // (`_lockstepTickPeers`). Befund CI 38639169868: B unter seinem Ladeschirm, 56 Peer-Takte, A nach dem Lauf 1,924 m
        // daneben ohne eine Regung — je Takt höchstens 10 Schritte, der Sender schickt 60 je Sekunde. Der Selbsttest gleich
        // danach setzt die alte Kappe wieder ein (jeder Takt gilt als ein Frame von 1/60 s): (d) muss ROT werden.
        // DAS URTEIL LIEST DEN VERZUG JE TAKT, nie nur den Ort am Ende: nach jedem langen Takt bleiben höchstens die
        // Jitter-Reserve und EIN Aufhol-Burst im Puffer (`VERZUG_GRENZE` Schritte hinter dem Empfang). Der Ort am Ende allein
        // war blind (CI 38670118945): A stand 1,2 s, bevor B urteilte, die alte Kappe holte den kurzen Lauf in dieser Zeit fast
        // ein (Abstand 0,233 m bei Rückstau 102 Schritten) — der Verzug wächst unter ihr je Takt um Zufluss − 10, unter der
        // Wanduhr bleibt er bei der Reserve.
        const lsGesetz = await pageB.evaluate(() => {
            const L = window.anazhRealm.constructor.LOCKSTEP;
            return { reserve: L.jitterReserve, aufhol: L.aufholJeSchritt };
        });
        const VERZUG_GRENZE = lsGesetz.reserve + lsGesetz.aufhol;
        // DER LANGE TAKT IN SCHRITTEN: der Ghost bei B verbraucht erst, wenn seit seinem letzten Takt ZUFLUSS_SOLL Schritte von A angekommen
        // sind — ein Takt trägt so immer das Doppelte der alten Kappe, gleich wie schnell A sendet und wie belastet der Läufer
        // ist (CI 38670118945 lief mit 300 ms Wanduhr-Takten; lokal unter Last kam je Takt kein einziger Schritt, K60-N3/mp-4.txt)
        const ZUFLUSS_SOLL = ZUFLUSS_FAKTOR * lsGesetz.aufhol;
        const langeTakte = (an, alteKappe) =>
            pageB.evaluate(
                (an, soll, alteKappe, pid) => {
                    const r = window.anazhRealm;
                    const mp = window.__mp;
                    const fenster = mp.langFenster || null; // das Fenster, das hier endet
                    mp.langFenster = null;
                    r._lockstepTickPeers = mp.lsZaehler;
                    if (!an) return fenster;
                    const f = (mp.langFenster = { takte: 0, verzugMax: 0, zufluss: [], taktMsMax: 0, hoch: null, vorT: null });
                    const echt = Object.getPrototypeOf(r)._lockstepTickPeers;
                    // nur der Verbrauch des Ghosts wartet (der lange Takt), `p2pTick` selbst läuft weiter: Peer-Pflege,
                    // Zeichnen und das eigene Senden bleiben am Leben, die Verbindung hält
                    r._lockstepTickPeers = function (nowMs) {
                        const e = this.state.p2p.peers.get(pid);
                        const ls = e && e.lockstep;
                        // der Empfangs-Stand (nächster erwarteter Schritt): Verbrauch und Anker lassen ihn stehen
                        const hoch = ls ? ls.bufStart + ls.buf.length : null;
                        if (f.hoch !== null && hoch !== null && hoch - f.hoch < soll) return undefined; // der lange Takt
                        // die alte Kappe: jeder Takt gilt als EIN Frame von 1/60 s (je Takt höchstens aufholJeSchritt Schritte)
                        if (alteKappe) this.state.p2p._lockstepTickMs = nowMs - 1000 / 60;
                        mp.lsTakte++;
                        const res = echt.call(this, nowMs);
                        if (ls) {
                            // Verzug = Schritte, die nach dem Verbrauch dieses Takts noch hinter dem Empfang liegen
                            if (f.hoch !== null) f.zufluss.push(hoch - f.hoch);
                            f.hoch = hoch;
                            f.takte++;
                            f.verzugMax = Math.max(f.verzugMax, ls.buf.length);
                        }
                        if (f.vorT !== null) f.taktMsMax = Math.max(f.taktMsMax, Math.round(nowMs - f.vorT));
                        f.vorT = nowMs;
                        return res;
                    };
                    return null;
                },
                an,
                ZUFLUSS_SOLL,
                !!alteKappe,
                idA
            );
        // DIE EINE PRÜF-FUNKTION von (d) — der Lauf und sein Selbsttest gehen durch denselben Code
        const zuflussMedian = (f) => {
            const z = [...f.zufluss].sort((a, b) => a - b);
            return z.length ? z[z.length >> 1] : 0;
        };
        const dMaengel = (l, f) => {
            const m = [];
            if (!(l.lauf > 1)) m.push(`LEER: A lief ${l.lauf.toFixed(2)} m (≤ 1 m)`);
            if (!f || f.takte < 3) m.push(`LEER: ${f ? f.takte : 0} lange Takte mit dem Ghost von A (< 3)`);
            if (!l.sichtB.sichtbar) m.push("A bei B unsichtbar");
            if (l.abstand > ABSTAND_M) m.push(`Abstand ${l.abstand.toFixed(3)} m > ${ABSTAND_M} m`);
            if (f && f.verzugMax > VERZUG_GRENZE) m.push(`VERZUG ${f.verzugMax} Schritte nach einem Takt > ${VERZUG_GRENZE}`);
            return m;
        };
        const fensterSatz = (f) =>
            f
                ? `${f.takte} Takte (bis ${f.taktMsMax} ms), Zufluss je Takt Median ${zuflussMedian(f)} Schritte, Verzug nach dem Takt max ${f.verzugMax} (Grenze ${VERZUG_GRENZE})`
                : "kein Fenster";
        console.log(
            `  INFO (d) der Ghost bei B verbraucht erst je ${ZUFLUSS_SOLL} angekommene Schritte von A (${ZUFLUSS_FAKTOR} × aufholJeSchritt ${lsGesetz.aufhol}), Verzug-Grenze ${VERZUG_GRENZE}`
        );
        // das Fenster endet nach seinem Ereignis (drei lange Takte mit dem Ghost von A), nie nach der Uhr des Läufers
        const fensterZu = async () => {
            await waitFor(pageB, () => !!window.__mp.langFenster && window.__mp.langFenster.takte >= 3, 60000, "B: drei lange Takte").catch(
                () => {}
            );
            return langeTakte(false);
        };
        await langeTakte(true, false);
        const l1 = await laufUndSicht();
        const f1 = await fensterZu();
        const m1 = dMaengel(l1, f1);
        roh.langeTakte = Object.assign({ zuflussSoll: ZUFLUSS_SOLL, verzugGrenze: VERZUG_GRENZE, fenster: f1 }, l1);
        check(
            `(d) lange Takte bei B (je ${ZUFLUSS_SOLL} Schritte von A): B sieht A an dessen Ort (±${ABSTAND_M} m waagrecht), der Verzug bleibt bei der Reserve`,
            m1.length === 0,
            `Lauf ${l1.lauf.toFixed(2)} m · ${sichtSatz(l1)} · ${fensterSatz(f1)}` +
                (m1.length ? ` — ${m1.join(" · ")} — Täter _lockstepTickPeers: die Aufhol-Kappe zählt Frames statt Wanduhr` : "")
        );
        await sleep(1500); // B holt bei kurzen Takten auf
        await langeTakte(true, true);
        const l2 = await laufUndSicht();
        const f2 = await fensterZu();
        const m2 = dMaengel(l2, f2);
        roh.langeTakteAlteKappe = Object.assign({ fenster: f2 }, l2);
        // das Szenario stresst die alte Kappe (Zufluss je Takt über ihr), und (d) fällt an seinem Verzug-Term
        const gestresst = zuflussMedian(f2) > lsGesetz.aufhol;
        const amVerzug = m2.some((x) => x.startsWith("VERZUG"));
        check(
            "(d) Selbsttest: die alte Kappe je Frame macht (d) ROT am Verzug",
            gestresst && amVerzug && !m2.some((x) => x.startsWith("LEER")),
            `Lauf ${l2.lauf.toFixed(2)} m · ${sichtSatz(l2)} · ${fensterSatz(f2)} — (d) ${
                m2.length ? "ROT: " + m2.join(" · ") : "GRÜN, die Linse ist blind"
            }${gestresst ? "" : ` — das Szenario stresst die alte Kappe nicht (Zufluss ≤ ${lsGesetz.aufhol} je Takt)`}`
        );
        await sleep(1500);

        // ── (c) DAS CHAT-GRABEN REIST (K23) ──
        // A öffnet das Gespräch mit der Chat-Taste und tippt „voxel carve" und „voxel fill" (der Spielpfad); B muss
        // GENAU dieselben zwei Edits tragen (Ort, Radius, Art), wie bei jedem Graben mit der Hand — keiner fehlt, keiner
        // doppelt. Täter, wenn einer fehlt: `_chatTryVoxelDebugCommand` schnitzt direkt (carveVoxelSphere/fillVoxelSphere)
        // statt über dslRun, das broadcastet; wenn B mehr trägt: der Empfang wendet eine Graben-Nachricht mehrfach an.
        const editsVon = (p) =>
            p.evaluate(() => (window.anazhRealm.state.worldMeta.voxelEdits || []).map((e) => ({ ...e })));
        const chatGraben = async () => {
            const vorA = (await editsVon(pageA)).length;
            const vorB = (await editsVon(pageB)).length;
            await pageA.bringToFront();
            for (const satz of ["voxel carve", "voxel fill"]) {
                await pageA.keyboard.press("Enter");
                await sleep(150);
                // Öffnete die Taste das Feld nicht (der Zeiger-Fang nach dem ersten Senden), klickt der Spieler hinein.
                const offen = await pageA.evaluate(
                    () => document.activeElement && document.activeElement.id === "chat-input"
                );
                if (!offen) await pageA.click("#chat-input");
                // Der Voxel-Befehl lässt seinen Satz im Feld stehen (Wiederholung mit Enter): der Spieler markiert ihn und tippt neu.
                await pageA.keyboard.down("Control");
                await pageA.keyboard.press("KeyA");
                await pageA.keyboard.up("Control");
                await pageA.keyboard.type(satz);
                await pageA.keyboard.press("Enter");
                await sleep(300);
            }
            const neuA = (await editsVon(pageA)).slice(vorA);
            const zaehle = (neuB) =>
                neuA.filter((a) =>
                    neuB.some(
                        (b) =>
                            b.mode === a.mode &&
                            b.r === a.r &&
                            Math.abs(b.x - a.x) < 1e-6 &&
                            Math.abs(b.y - a.y) < 1e-6 &&
                            Math.abs(b.z - a.z) < 1e-6
                    )
                ).length;
            let neuB = [];
            const tGrab = Date.now();
            while (Date.now() - tGrab < 6000) {
                neuB = (await editsVon(pageB)).slice(vorB);
                if (neuA.length > 0 && zaehle(neuB) === neuA.length) break;
                await sleep(150);
            }
            await sleep(GRABEN_NACHLAUF_MS);
            neuB = (await editsVon(pageB)).slice(vorB);
            return { neuA, neuB, gleich: zaehle(neuB) };
        };
        // Das Urteil: jeder Edit von A bei B UND B trägt keinen mehr — ohne die Länge bliebe eine Doppel-Anwendung grün.
        const grabenGleich = (g) => g.neuA.length === 2 && g.gleich === g.neuA.length && g.neuB.length === 2;
        const graben = await chatGraben();
        roh.chatGraben = graben;
        check(
            "A gräbt und schüttet per Chat (zwei Edits bei A)",
            graben.neuA.length === 2,
            `${graben.neuA.length} Edits bei A`
        );
        check(
            "(c) B sieht das Chat-Graben (genau dieselben Edits wie A, keiner doppelt)",
            grabenGleich(graben),
            `${graben.gleich}/${graben.neuA.length} bei B, B trägt ${graben.neuB.length} neue` +
                (graben.gleich < graben.neuA.length
                    ? " — Täter _chatTryVoxelDebugCommand: schnitzt direkt statt über dslRun (kein Broadcast)"
                    : graben.neuB.length > graben.neuA.length
                      ? " — Täter: B wendet eine Graben-Nachricht mehrfach an (Empfang _p2pMsgDsl → dslRun je Ankunft)"
                      : "")
        );
        // Der Selbsttest von (c): B wendet jede DSL-Nachricht doppelt an — (c) muss ROT werden, und zwar an der Länge
        // (die alte Probe, nur „jeder Edit von A auch bei B“, bleibt dabei grün). Danach trägt B wieder den echten Empfang.
        await pageB.evaluate(() => {
            const r = window.anazhRealm;
            const echt = r._p2pMsgDsl;
            window.__mpDslEcht = echt;
            r._p2pMsgDsl = function (msg, p2p) {
                echt.call(this, msg, p2p);
                return echt.call(this, msg, p2p);
            };
        });
        const doppelt = await chatGraben();
        await pageB.evaluate(() => {
            window.anazhRealm._p2pMsgDsl = window.__mpDslEcht;
            delete window.__mpDslEcht;
        });
        roh.chatGrabenDoppelt = doppelt;
        const altGruen = doppelt.neuA.length === 2 && doppelt.gleich === doppelt.neuA.length;
        check(
            "(c) Selbsttest: eine doppelt angewendete Graben-Nachricht macht (c) ROT",
            altGruen && !grabenGleich(doppelt),
            `B trägt ${doppelt.neuB.length} neue für ${doppelt.neuA.length} von A (${doppelt.gleich}/${doppelt.neuA.length} gefunden)` +
                ` — (c) ${grabenGleich(doppelt) ? "GRÜN, die Linse ist blind" : "ROT"}, die alte Probe ${altGruen ? "grün" : "rot"}`
        );

        // ── (a) URSPRUNG ──
        const endA = await bericht(pageA);
        const endB = await bericht(pageB);
        roh.ursprung = { A: endA, B: endB };
        for (const [n, s] of [
            ["A", endA],
            ["B", endB],
        ]) {
            check(
                `(a) Seite ${n}: kein Mitspieler-Takt im Ursprung`,
                s.ursprung === 0,
                `${s.ursprung} Takte am Ursprung (davon ${s.ursprungOhneOrt} ohne je empfangenen Ort) von ${s.peerTakte} Peer-Takten` +
                    ` · Nachlauf ${s.ursprungNachlauf} Takte (beim Zeichnen stand er im Ursprung, der Ghost danach schon weiter; keine Täter)` +
                    (s.ursprung
                        ? ` — Täter _p2pEnsurePeerEntry: Leib/Schild sichtbar bei 0/0/0 (${JSON.stringify(s.ursprungBeispiel)})`
                        : "")
            );
        }
        roh.dauerS = (Date.now() - t0) / 1000;
    } catch (err) {
        check("Lauf", false, err && err.message ? err.message : String(err));
    } finally {
        await browser.close().catch(() => {});
        saveServer.kill();
        if (signaling) signaling.kill();
    }
    if (ROH) fs.writeFileSync(ROH, JSON.stringify(roh, null, 2));
    console.log(`gate:mp-sync ${fehler.length ? "ROT" : "GRÜN"} — ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    process.exit(fehler.length ? 1 : 0);
})();
