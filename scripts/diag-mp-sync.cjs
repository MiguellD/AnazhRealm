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
// Dazu der Spielpfad: Seite A über den KNOPF (`#p2p-toggle`, zweiter Klick im Aufbau startet kein zweites Init, der
// Knopf liest die EINE Absicht), Seite B über den BOOT (die gemerkte Absicht aus `p2pPersist`). A läuft nach dem
// Ladeschirm über die Tastatur (`_stepCharacter`; A bootete zuerst, sein Ladeschirm fällt zuerst), B sieht A an dessen
// Ort (±0,3 m waagrecht); die Latenz (A bewegt sich → B sieht es) wird berichtet.
// Konsum-Leser: `_p2pUpdatePeer` (zeichnet den Peer je Takt) und der close-Zweig von `initP2PSync` (plant den Rejoin).
//
// Selbsttest (`--selftest`): die alte Tür wieder eingesetzt (initP2PSync lässt `enabled`, wie es war) → (b) ROT.
// Ports: MP_SYNC_PORT (save-server, Default 4312), MP_SYNC_SIGNAL_PORT (signaling, Default 4313). `--roh <datei>`
// schreibt die Zahlen als JSON.
//
//   node scripts/diag-mp-sync.cjs [--selftest] [--roh <datei>]
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

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
        return msgPos.call(this, msg, p2p);
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
                if (o.position.x === 0 && o.position.z === 0) {
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
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
        ],
    });
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

        // ── A läuft über die Tastatur, B sieht zu ──
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
        const wahrA = await pageA.evaluate(() => {
            const p = window.anazhRealm.state.playerMesh.position;
            return { x: p.x, y: p.y, z: p.z, bewegtAm: window.__mp.eigenBewegtAm };
        });
        const sichtB = await pageB.evaluate((id) => {
            const e = window.anazhRealm.state.p2p.peers.get(id);
            const p = e.mesh.position;
            return {
                x: p.x,
                y: p.y,
                z: p.z,
                art: e.meshKind,
                sichtbar: e.mesh.visible,
                gesehenAm: window.__mp.blickBewegtAm,
            };
        }, idA);
        const lauf = Math.hypot(wahrA.x - vorLauf.x, wahrA.z - vorLauf.z);
        const abstand = Math.hypot(sichtB.x - wahrA.x, sichtB.z - wahrA.z);
        const latenz = wahrA.bewegtAm && sichtB.gesehenAm ? sichtB.gesehenAm - wahrA.bewegtAm : null;
        roh.lauf = { ladeschirmMs: ladeMs, laufM: lauf, abstandM: abstand, latenzMs: latenz, wahrA, sichtB };
        check("A lief über die Tastatur (> 1 m)", lauf > 1, `${lauf.toFixed(2)} m`);
        check(
            `B sieht A an dessen Ort (±${ABSTAND_M} m waagrecht)`,
            sichtB.sichtbar && abstand <= ABSTAND_M,
            `Abstand ${abstand.toFixed(3)} m, Leib ${sichtB.art}, sichtbar=${sichtB.sichtbar}`
        );
        console.log(
            `  INFO Latenz A bewegt → B sieht: ${latenz === null ? "n/a" : latenz + " ms"} (Soll lokal ≤ ${LATENZ_MS} ms, in der CI berichtet)`
        );
        if (!process.env.CI && latenz !== null)
            check(`Latenz ≤ ${LATENZ_MS} ms (lokal)`, latenz <= LATENZ_MS, `${latenz} ms`);

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
