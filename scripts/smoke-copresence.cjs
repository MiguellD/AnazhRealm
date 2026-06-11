// W18-B (gigant-plan F3; world-portal-w18-plan §5) — End-to-End-Beweis der
// KO-PRÄSENZ-INJEKTION: zwei echte Browser, ein echtes WebRTC-Mesh, eine
// echte single-player Fremd-Welt (worlds/begegnung, null-origin sandboxed,
// OHNE eigenen Multiplayer-Begriff) — und die beiden SEHEN sich darin.
//
// Der Fluss, exakt wie ein Spieler-Paar ihn erlebt:
//   1. A + B verbinden sich im Mesh (W7).
//   2. A holt das Begegnungs-Portal (obtainPortalForWorld) + betritt es;
//      der portal-invite-Broadcast lädt die Gruppe ein (W17 C, jetzt auch
//      für Ko-Präsenz-Welten).
//   3. B bekommt den Prompt (pendingInvite mit Tier-Wahrheit) + folgt
//      (joinPortalInvite).
//   4. Beide iframes posten ihre local-pose (die Welt deklariert
//      coPresence im ready-Handshake); die Posen reisen als subworld-pose
//      übers Mesh; jede Heimat injiziert peer-join/peer-state ins eigene
//      iframe; die WELT rendert den Gefährten und meldet die Begegnung als
//      {type:"event"} → Heimat-Journal.
//
// Beweise: po.peers trägt den Gefährten (Heimat-Seite) UND das Journal
// trägt „erschien neben dir" (die Welt selbst hat den Gefährten gesehen —
// durch die volle null-origin-Wand hindurch).
//
// Voraussetzung: puppeteer als devDependency (`npm install`).
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = "/home/user/AnazhRealm";
const PAGE_URL = "http://127.0.0.1:4312/index.html";
const SIGNALING_URL = "ws://127.0.0.1:4313";
const ROOM = "smoke-copresence-room";

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
        await waitFor(pageA, () => !!window.anazhRealm, 15000, "Seite A initialisiert");
        await waitFor(pageB, () => !!window.anazhRealm, 15000, "Seite B initialisiert");

        // Namen setzen — die peer-join-Injektion trägt sie in die Fremd-Welt.
        await pageA.evaluate(() => {
            window.anazhRealm.state.player.name = "Anna";
        });
        await pageB.evaluate(() => {
            window.anazhRealm.state.player.name = "Bo";
        });

        // Mesh aufbauen (das smoke-webrtc-Muster).
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
        await waitFor(pageA, () => window.anazhRealm.state.p2p.meshActive === true, 20000, "Mesh auf A aktiv");
        await waitFor(pageB, () => window.anazhRealm.state.p2p.meshActive === true, 20000, "Mesh auf B aktiv");
        check("WebRTC-Mesh steht (A + B)", true);

        // A holt + betritt das Begegnungs-Portal (der echte Spieler-Pfad:
        // obtainPortalForWorld → Overlay → invite-Broadcast wie enterPortal).
        const enteredA = await pageA.evaluate(() => {
            const r = window.anazhRealm;
            const got = r.obtainPortalForWorld("begegnung");
            if (!got.ok) return { ok: false, reason: got.reason };
            const bp = r.state.blueprints[got.blueprint];
            r._buildPortalOverlay(bp.portalMeta, { computeRole: "host" });
            const invited = r._p2pBroadcastPortalInvite();
            const po = r._portalOverlay;
            return {
                ok: !!po,
                invited,
                coPresence: po ? po.coPresence === true : false,
                hint: po && po.hintEl ? po.hintEl.textContent : "",
            };
        });
        check("A betrat das Begegnungs-Portal", enteredA.ok === true, JSON.stringify(enteredA));
        check("A: Portal trägt die Ko-Präsenz-Marke", enteredA.coPresence === true);
        check("A: portal-invite ging an die Gruppe", enteredA.invited === true);
        check("A: der Hinweis sagt die Tier-Wahrheit (Ko-Präsenz)", /Ko-Präsenz/.test(enteredA.hint), enteredA.hint);

        // B bekommt die Einladung (mit Tier-Wahrheit im Banner) + folgt.
        await waitFor(
            pageB,
            () => !!(window.anazhRealm.state.p2p && window.anazhRealm.state.p2p.pendingInvite),
            10000,
            "B sieht die Portal-Einladung"
        );
        const bannerB = await pageB.evaluate(() => {
            const r = window.anazhRealm;
            r._renderPortalInviteBanner();
            const tier = document.querySelector("#portal-invite-banner .portal-invite-tier");
            return tier ? tier.textContent : "";
        });
        check("B: der Einladungs-Banner sagt die Tier-Wahrheit", /Ko-Präsenz/.test(bannerB), bannerB);
        const joinedB = await pageB.evaluate(() => {
            const r = window.anazhRealm;
            const res = r.joinPortalInvite();
            const po = r._portalOverlay;
            return { ok: res.ok === true, coPresence: po ? po.coPresence === true : false };
        });
        check("B folgte der Einladung ins Portal", joinedB.ok === true, JSON.stringify(joinedB));
        check("B: Portal trägt die Ko-Präsenz-Marke", joinedB.coPresence === true);

        // DER KERN: beide Welten posten ihre local-pose (8-Hz-Herzschlag der
        // Begegnungs-Welt) → Mesh → peer-join/peer-state-Injektion → die
        // Heimat-Seite sieht den Gefährten in po.peers, die WELT meldet die
        // Begegnung als Journal-Event.
        await waitFor(
            pageB,
            (idA) => {
                const po = window.anazhRealm._portalOverlay;
                return !!(po && po.peers && po.peers.has(idA));
            },
            15000,
            "B sieht A's Pose in seiner Sub-Welt (po.peers)",
            peerIdA
        );
        check("B: A's Posen erreichen B's Sub-Welt (peer-join + peer-state)", true);
        await waitFor(
            pageA,
            (idB) => {
                const po = window.anazhRealm._portalOverlay;
                return !!(po && po.peers && po.peers.has(idB));
            },
            15000,
            "A sieht B's Pose in seiner Sub-Welt (po.peers)",
            peerIdB
        );
        check("A: B's Posen erreichen A's Sub-Welt (Gegenrichtung)", true);

        // Die WELT selbst hat den Gefährten gesehen: ihr peer-join-Callback
        // postete {type:"event"} durch die null-origin-Wand ins Journal.
        await waitFor(
            pageB,
            () => {
                const j = window.anazhRealm.state.worldJournal;
                return !!(j && j.entries && j.entries.some((e) => /erschien neben dir/.test(e.text)));
            },
            15000,
            "B's Begegnungs-Welt meldete die Begegnung (Journal)"
        );
        const journalB = await pageB.evaluate(() => {
            const j = window.anazhRealm.state.worldJournal;
            const hit = j.entries.filter((e) => /erschien neben dir/.test(e.text));
            return hit.length ? hit[hit.length - 1].text : "";
        });
        check("B: die Welt rendert A (Journal-Beweis durch die Sandbox-Wand)", /Anna/.test(journalB), journalB);
        await waitFor(
            pageA,
            () => {
                const j = window.anazhRealm.state.worldJournal;
                return !!(j && j.entries && j.entries.some((e) => /erschien neben dir/.test(e.text)));
            },
            15000,
            "A's Begegnungs-Welt meldete die Begegnung (Journal)"
        );
        const journalA = await pageA.evaluate(() => {
            const j = window.anazhRealm.state.worldJournal;
            const hit = j.entries.filter((e) => /erschien neben dir/.test(e.text));
            return hit.length ? hit[hit.length - 1].text : "";
        });
        check("A: die Welt rendert B (Gegenrichtung)", /Bo/.test(journalA), journalA);

        // Abschied: A verlässt das Portal → A's Posen verstummen → B's Sweep
        // räumt A als peer-leave (Timeout 6 s + Sweep 2 s).
        await pageA.evaluate(() => window.anazhRealm.exitPortal());
        await waitFor(
            pageB,
            (idA) => {
                const po = window.anazhRealm._portalOverlay;
                return !!(po && po.peers && !po.peers.has(idA));
            },
            15000,
            "B: A verstummt → peer-leave (Abwesenheits-Sweep)",
            peerIdA
        );
        check("B: der Abwesenheits-Sweep räumt den gegangenen Gefährten", true);
        await pageB.evaluate(() => window.anazhRealm.exitPortal());

        console.log("");
        if (failures.length) {
            console.error(`❌ ${failures.length} Prüfung(en) fehlgeschlagen: ${failures.join(", ")}`);
            process.exitCode = 1;
        } else {
            console.log(
                "✅ Ko-Präsenz-Injektion bewiesen: zwei Freunde sahen sich in einer Welt, die selbst keine Freunde kennt."
            );
        }
    } catch (err) {
        console.error("❌ Smoke-Test abgebrochen:", err.message);
        process.exitCode = 1;
    } finally {
        await browser.close().catch(() => {});
        saveServer.kill();
        signaling.kill();
    }
})();
