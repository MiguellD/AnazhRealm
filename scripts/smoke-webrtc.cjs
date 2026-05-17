// W7 Phase 1 — End-to-End-Test des echten WebRTC-Mesh.
//
// Startet save-server.js (liefert das Spiel) + signaling-server.js
// (WebRTC-Rendezvous), öffnet ZWEI Browser-Seiten, lässt beide demselben
// Multi-User-Raum beitreten und prüft, dass:
//   1. beide Seiten einen offenen RTCDataChannel aufbauen (Mesh komplett),
//   2. eine Positions-Nachricht WIRKLICH peer-to-peer fliesst (die andere
//      Seite sieht die bewegte Position des Peers).
//
// Anders als smoke-multiuser.cjs (das nur den Server-Relay prüft) ist dies
// der ehrliche Beweis, dass die Browser eine direkte Verbindung herstellen.
//
// Voraussetzung: puppeteer als devDependency (`npm install`).
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = "/home/user/AnazhRealm";
const PAGE_URL = "http://127.0.0.1:4312/index.html";
const SIGNALING_URL = "ws://127.0.0.1:4313";
const ROOM = "smoke-webrtc-room";

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function startProc(script, readyRe) {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [path.join(ROOT, script)], {
            stdio: ["ignore", "pipe", "pipe"],
        });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error(`${script} startete nicht innerhalb 6 s`));
        }, 6000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && readyRe.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

// Wartet, bis evalFn auf der Seite true liefert (oder Timeout). Zusätzliche
// Argumente werden an page.evaluate durchgereicht.
async function waitFor(page, evalFn, timeoutMs, label, ...args) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const ok = await page.evaluate(evalFn, ...args).catch(() => false);
        if (ok) return true;
        await sleep(200);
    }
    throw new Error(`Timeout: ${label}`);
}

(async () => {
    const failures = [];
    function check(name, ok, detail = "") {
        console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) failures.push(name);
    }

    console.log("Starte save-server + signaling-server ...");
    const saveServer = await startProc("save-server.js", /läuft/);
    const signaling = await startProc("signaling-server.js", /lauscht/);

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });

    try {
        const pageA = await browser.newPage();
        const pageB = await browser.newPage();
        await pageA.setViewport({ width: 1024, height: 640 });
        await pageB.setViewport({ width: 1024, height: 640 });

        console.log("Lade beide Spielseiten ...");
        await pageA.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await pageB.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        // Welt + window.anazhRealm initialisieren lassen.
        await waitFor(pageA, () => !!window.anazhRealm, 15000, "Seite A initialisiert");
        await waitFor(pageB, () => !!window.anazhRealm, 15000, "Seite B initialisiert");

        // Beide Seiten in DENSELBEN Raum bringen (worldId unterscheidet sich
        // pro Seite — der roomOverride zwingt sie zusammen).
        const joinRoom = (wsUrl, room) => {
            const r = window.anazhRealm;
            r.state.p2p.url = wsUrl;
            r.state.p2p.roomOverride = room;
            r.state.p2p.enabled = true;
            r.initP2PSync(null);
            return r.state.p2p.peerId;
        };
        const peerIdA = await pageA.evaluate(joinRoom, SIGNALING_URL, ROOM);
        const peerIdB = await pageB.evaluate(joinRoom, SIGNALING_URL, ROOM);
        console.log(`Seite A peerId=${peerIdA}, Seite B peerId=${peerIdB}`);

        // Auf den WebRTC-Handshake warten: beide Seiten müssen meshActive
        // melden (alle Peer-Kanäle offen).
        await waitFor(pageA, () => window.anazhRealm.state.p2p.meshActive === true, 20000, "Mesh auf A aktiv");
        await waitFor(pageB, () => window.anazhRealm.state.p2p.meshActive === true, 20000, "Mesh auf B aktiv");
        check("Seite A: WebRTC-Mesh aktiv (alle Kanäle offen)", true);
        check("Seite B: WebRTC-Mesh aktiv (alle Kanäle offen)", true);

        // Beide Seiten haben genau einen RTC-Peer mit offenem Kanal.
        const rtcA = await pageA.evaluate(() => {
            const rp = window.anazhRealm.state.p2p.rtcPeers;
            return { size: rp.size, open: Array.from(rp.values()).filter((x) => x.open).length };
        });
        const rtcB = await pageB.evaluate(() => {
            const rp = window.anazhRealm.state.p2p.rtcPeers;
            return { size: rp.size, open: Array.from(rp.values()).filter((x) => x.open).length };
        });
        check("Seite A: genau ein offener DataChannel", rtcA.size === 1 && rtcA.open === 1, JSON.stringify(rtcA));
        check("Seite B: genau ein offener DataChannel", rtcB.size === 1 && rtcB.open === 1, JSON.stringify(rtcB));

        // Echter Mesh-Traffic: A sendet eine markante Positions-Nachricht
        // über p2pSend (genau der Pfad, den der Game-Loop für den 30-Hz-
        // pos-Broadcast nutzt — bei aktivem Mesh fliesst er über den
        // DataChannel). B muss die markante Position im Peer-Eintrag sehen.
        const MARK_X = 137.5;
        const MARK_Z = -88.25;
        await pageA.evaluate(
            (x, z) => {
                window.anazhRealm.p2pSend({ type: "pos", x, y: 9, z, yaw: 0.25 });
            },
            MARK_X,
            MARK_Z
        );
        await waitFor(
            pageB,
            (x, z) => {
                const peers = Array.from(window.anazhRealm.state.p2p.peers.values());
                return peers.some((p) => Math.abs(p.x - x) < 0.5 && Math.abs(p.z - z) < 0.5);
            },
            8000,
            "B sieht A's markante Position über das Mesh",
            MARK_X,
            MARK_Z
        );
        check("Positions-Nachricht floss peer-to-peer über den DataChannel", true);

        // Gegenrichtung: B sendet, A muss es sehen.
        const MARK_X2 = -54.0;
        await pageB.evaluate((x) => {
            window.anazhRealm.p2pSend({ type: "pos", x, y: 4, z: 71.5, yaw: 1.5 });
        }, MARK_X2);
        await waitFor(
            pageA,
            (x) => {
                const peers = Array.from(window.anazhRealm.state.p2p.peers.values());
                return peers.some((p) => Math.abs(p.x - x) < 0.5);
            },
            8000,
            "A sieht B's markante Position über das Mesh",
            MARK_X2
        );
        check("Mesh trägt Traffic in beide Richtungen", true);
    } catch (err) {
        check(`Test-Ablauf ohne Fehler`, false, err.message);
    } finally {
        await browser.close();
        saveServer.kill();
        signaling.kill();
    }

    console.log(failures.length === 0 ? "\n✅ WebRTC-Mesh verifiziert" : `\n❌ ${failures.length} Fehler`);
    process.exit(failures.length === 0 ? 0 : 1);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
