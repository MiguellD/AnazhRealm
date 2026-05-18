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
const fs = require("fs");
const puppeteer = require("puppeteer");

const ROOT = "/home/user/AnazhRealm";
const PAGE_URL = "http://127.0.0.1:4312/index.html";
const SIGNALING_URL = "ws://127.0.0.1:4313";
const ROOM = "smoke-webrtc-room";
// W16 — die Test-Welt, die A vendort + B über das Mesh holt.
const W16_ID = "smoke-mesh-w16";
const W16_DIR = path.join(ROOT, "worlds", W16_ID);

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

        // Multi-User-Bau-Sync — A baut eine Struktur, B sieht sie; A baut sie
        // ab, B's Kopie verschwindet. Beweis über das echte Mesh.
        const archId = await pageA.evaluate(() => {
            const r = window.anazhRealm;
            r.setGameMode && r.setGameMode("schöpfer"); // Bau-Gates frei
            r.state.buildMode = {
                active: true,
                blueprintName: "stein_block",
                phantomMesh: { position: { x: 44, y: 6, z: -44 } },
                phantomOnGround: true,
            };
            r.confirmBuild();
            const arches = r.state.architectures;
            return arches.length ? arches[arches.length - 1].id : null;
        });
        check("A: Struktur gebaut + geteilte archId vergeben", typeof archId === "string", String(archId));
        await waitFor(
            pageB,
            (id) => window.anazhRealm.state.architectures.some((a) => a && a.id === id),
            8000,
            "B sieht A's gebaute Struktur über das Mesh",
            archId
        );
        check("Bau platzieren synchronisiert peer-to-peer", true);
        // A baut die Struktur ab → B's Kopie muss verschwinden.
        await pageA.evaluate((id) => {
            window.anazhRealm.dslRun(["remove_architecture", id], { source: "human" });
        }, archId);
        await waitFor(
            pageB,
            (id) => !window.anazhRealm.state.architectures.some((a) => a && a.id === id),
            8000,
            "B's Kopie der Struktur verschwindet nach A's Abbau",
            archId
        );
        check("Bau abbauen synchronisiert peer-to-peer", true);

        // Kreatur-Sicht-Sync — A spawnt eine Kreatur an einem markanten Ort
        // und streamt sie (direkter _p2pBroadcastCreatures-Aufruf, da der
        // rAF-Loop im Hintergrund-Tab gedrosselt ist — wie der pos-Test).
        // B sieht sie als Sicht-Kreatur über das Mesh.
        const CRX = 88.0;
        const CRZ = -33.0;
        await pageA.evaluate(
            (x, z) => {
                window.anazhRealm.spawnCreatureAt(x, 8, z, "happy");
                window.anazhRealm._p2pBroadcastCreatures();
            },
            CRX,
            CRZ
        );
        await waitFor(
            pageB,
            (x, z) => {
                const rc = window.anazhRealm.state.p2p.remoteCreatures;
                for (const c of rc.values()) {
                    if (typeof c.tx !== "number" || typeof c.tz !== "number") continue;
                    if (Math.abs(c.tx - x) < 1.5 && Math.abs(c.tz - z) < 1.5) return true;
                }
                return false;
            },
            10000,
            "B sieht A's Kreatur als Sicht-Kreatur über das Mesh",
            CRX,
            CRZ
        );
        check("Kreatur-Sicht floss peer-to-peer über das Mesh", true);

        // W11 Phase 4 — Voice-Sync. A's Begleiter spricht (grokRender, der
        // EINE Sprech-Engpass); der companion-say-Broadcast fliesst über das
        // Mesh zu B. B hakt den Empfangs-Handler ab, um den Durchlauf zu
        // beweisen (SpeechSynthesis selbst ist im Headless nicht prüfbar).
        await pageB.evaluate(() => {
            window.__companionSayRx = null;
            const r = window.anazhRealm;
            const orig = r._p2pHandleCompanionSay.bind(r);
            r._p2pHandleCompanionSay = (pid, msg) => {
                window.__companionSayRx = { pid, text: msg && msg.text, voice: msg && msg.voice };
                return orig(pid, msg);
            };
        });
        await pageA.evaluate(() => {
            window.anazhRealm.state.grok.companionVoice = "Aria";
            window.anazhRealm.grokRender("Ich träume mit dir.");
        });
        await waitFor(
            pageB,
            () => {
                const rx = window.__companionSayRx;
                return !!rx && rx.text === "Ich träume mit dir." && rx.voice === "Aria";
            },
            10000,
            "B empfängt A's companion-say über das Mesh"
        );
        check("Begleiter-Stimme floss peer-to-peer über das Mesh", true);

        // W7 Phase 3 — LLM-Pool. A teilt seine Stimme (llmCall gestubbt, da
        // im CI kein API-Key); B (ohne eigenes LLM) routet eine Chat-Anfrage
        // peer-to-peer über A. Der Mesh-Round-Trip ist der echte Beweis.
        await pageA.evaluate(() => {
            const r = window.anazhRealm;
            r._p2pVoiceCapable = () => true; // im Test: A „hat" ein LLM
            r.llmCall = async () => ({ say: "Antwort aus A's Stimme", program: null });
            r.state.p2p.voiceShared = true;
            r._p2pBroadcastSoul(); // voiceShared an B verteilen
        });
        await waitFor(
            pageB,
            () => Array.from(window.anazhRealm.state.p2p.peers.values()).some((p) => p.voiceShared === true),
            8000,
            "B kennt A als Stimm-Teiler"
        );
        const voiceReply = await pageB.evaluate(
            () =>
                new Promise((resolve) => {
                    const r = window.anazhRealm;
                    const res = r._p2pRequestSharedVoice("hallo welt", (text) => {
                        if (/Geteilte Stimme:/.test(text)) resolve(text);
                    });
                    if (!res.ok) resolve("FEHLER:" + res.reason);
                    setTimeout(() => resolve("TIMEOUT"), 12000);
                })
        );
        check(
            "B's Chat-Anfrage lief peer-to-peer über A's geteilte Stimme",
            /Antwort aus A's Stimme/.test(voiceReply),
            voiceReply
        );

        // W7 Phase 2 — Welt-Snapshot über das Mesh. A wird Host, B Guest;
        // B holt A's Welt in Stücken über den DataChannel (kein WS-Relay).
        const worldIdA = await pageA.evaluate(() => {
            const r = window.anazhRealm;
            r.state.p2p.role = "host";
            r.state.worldMeta.role = "host";
            r._p2pBroadcastSoul(); // worldRole=host an B verteilen
            return r.state.worldMeta.worldId;
        });
        await pageB.evaluate(() => {
            const r = window.anazhRealm;
            r.state.p2p.role = "guest";
            r.state.worldMeta.role = "guest";
            r.state.p2p._testNoReload = true; // im Test nicht neu laden
        });
        // B muss A's Welt-Rolle (host) über den soul-Kanal erfahren.
        await waitFor(
            pageB,
            () => Array.from(window.anazhRealm.state.p2p.peers.values()).some((p) => p.worldRole === "host"),
            8000,
            "B kennt A als Host"
        );
        // B fordert den Welt-Resync an.
        const resync = await pageB.evaluate(() => window.anazhRealm._p2pRequestWorldResync());
        check("B: Welt-Resync angefordert", resync && resync.ok === true, JSON.stringify(resync));
        // B übernimmt A's Welt → B's worldId wird zu A's worldId.
        await waitFor(
            pageB,
            (wid) => window.anazhRealm.state.worldMeta.worldId === wid,
            15000,
            "B übernimmt A's Welt über den chunked Mesh-Transfer",
            worldIdA
        );
        check("B übernahm A's Welt-Snapshot peer-to-peer (chunked)", true);
        const snapLenB = await pageB.evaluate(() => window.anazhRealm.state.p2p._lastReceivedSnapshotLen);
        check(
            "B reassemblierte den vollständigen Snapshot",
            typeof snapLenB === "number" && snapLenB > 100,
            `len=${snapLenB}`
        );

        // W16 Phase 1 — Mesh-Welt-Verteilung. A vendort eine kleine Test-Welt
        // (der save-server schreibt worlds/<id>/); B hat sie nicht und holt
        // ihr Bündel peer-to-peer über das Mesh. B's customWorlds bekommt den
        // Eintrag — die Welt reiste über das Mesh, ohne Repo, ohne GitHub.
        fs.rmSync(W16_DIR, { recursive: true, force: true });
        const w16Vendor = await pageA.evaluate(async (id) => {
            return window.anazhRealm.vendorWorldBundle({
                worldId: id,
                label: "Mesh-Test-Welt",
                desc: "über das Mesh gereist",
                dsl: ["sturm"],
                files: [
                    { path: "index.html", content: "<!doctype html><title>w16</title><body>mesh world</body>" },
                    { path: "lib/engine.js", content: "console.log('w16 engine');" },
                ],
            });
        }, W16_ID);
        check(
            "W16: A vendort eine Test-Welt (save-server schreibt worlds/<id>/)",
            !!w16Vendor && w16Vendor.ok === true,
            JSON.stringify(w16Vendor)
        );
        const bHasBefore = await pageB.evaluate(
            (id) => !!(window.anazhRealm.state.customWorlds && window.anazhRealm.state.customWorlds[id]),
            W16_ID
        );
        check("W16: B hat die Welt vor dem Mesh-Transfer nicht", bHasBefore === false);
        // B holt die Welt von A über das Mesh.
        const w16Req = await pageB.evaluate(
            (id, pid) => window.anazhRealm.requestWorldBundleFromPeer(id, pid),
            W16_ID,
            peerIdA
        );
        check("W16: B fordert das Welt-Bündel von A an", !!w16Req && w16Req.ok === true, JSON.stringify(w16Req));
        // Das Bündel reist p2p; B's customWorlds bekommt den Eintrag.
        await waitFor(
            pageB,
            (id) => {
                const cw = window.anazhRealm.state.customWorlds;
                return !!(cw && cw[id] && cw[id].trust === "sandboxed");
            },
            15000,
            "B empfängt A's Welt-Bündel über das Mesh",
            W16_ID
        );
        check("W16: A's Welt reiste peer-to-peer in B's Bibliothek (trust:sandboxed)", true);
        const w16Entry = await pageB.evaluate((id) => {
            const e = window.anazhRealm.state.customWorlds[id];
            return { label: e && e.label, vendored: e && e.vendored, world: e && e.world };
        }, W16_ID);
        check(
            "W16: die mesh-empfangene Welt ist vendored + trägt ihren Namen + Tor-Pfad",
            w16Entry.vendored === true &&
                w16Entry.label === "Mesh-Test-Welt" &&
                w16Entry.world === `worlds/${W16_ID}/index.html`,
            JSON.stringify(w16Entry)
        );
    } catch (err) {
        check(`Test-Ablauf ohne Fehler`, false, err.message);
    } finally {
        await browser.close();
        saveServer.kill();
        signaling.kill();
        // W16 — das Test-Welt-Verzeichnis wegräumen.
        fs.rmSync(W16_DIR, { recursive: true, force: true });
    }

    console.log(failures.length === 0 ? "\n✅ WebRTC-Mesh verifiziert" : `\n❌ ${failures.length} Fehler`);
    process.exit(failures.length === 0 ? 0 : 1);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
