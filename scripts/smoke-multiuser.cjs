// End-to-End-Test: zwei WS-Clients gegen signaling-server.js
// Bestätigt dass welcome/peer-join/pos wirklich durchläuft.
const { spawn } = require("child_process");
const path = require("path");

const SERVER = path.join("/home/user/AnazhRealm", "signaling-server.js");
const URL = "ws://127.0.0.1:4313";

const server = spawn("node", [SERVER], { stdio: ["ignore", "pipe", "pipe"] });
server.stdout.on("data", (d) => process.stdout.write(`[srv] ${d}`));
server.stderr.on("data", (d) => process.stderr.write(`[srv-err] ${d}`));

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function run() {
    await sleep(500);
    const events = { a: [], b: [] };
    const wsA = new WebSocket(URL);
    const wsB = new WebSocket(URL);

    wsA.addEventListener("message", (e) => events.a.push(JSON.parse(e.data)));
    wsB.addEventListener("message", (e) => events.b.push(JSON.parse(e.data)));

    await Promise.all([
        new Promise((r) => wsA.addEventListener("open", r)),
        new Promise((r) => wsB.addEventListener("open", r)),
    ]);
    console.log("Both sockets open");

    // A joins first
    wsA.send(JSON.stringify({ type: "join", room: "test-room", peerId: "peerA" }));
    await sleep(150);
    // B joins
    wsB.send(JSON.stringify({ type: "join", room: "test-room", peerId: "peerB" }));
    await sleep(250);
    // A sends pos
    wsA.send(JSON.stringify({ type: "pos", x: 1.5, y: 2.5, z: 3.5, yaw: 0.5 }));
    await sleep(150);
    // B sends pos
    wsB.send(JSON.stringify({ type: "pos", x: 10, y: 20, z: 30, yaw: 1.5 }));
    await sleep(150);

    // Ring 11 V2: DSL-AST-Broadcast. A sendet modify_terrain → B sollte
    // dasselbe Programm zugestellt bekommen, mit peerId-Stempel des Servers.
    const sampleDsl = ["modify_terrain", 4.2, -3.5, 6, -2.5];
    wsA.send(JSON.stringify({ type: "dsl", program: sampleDsl }));
    await sleep(150);
    // Defensive: kaputte dsl-Pakete werden ignoriert (Array-Check + Length-Cap)
    wsA.send(JSON.stringify({ type: "dsl", program: "not-an-array" }));
    wsA.send(JSON.stringify({ type: "dsl", program: [] }));
    wsA.send(JSON.stringify({ type: "dsl", program: new Array(300).fill("over_cap") }));
    await sleep(150);

    // Ring 11 V3: Soul-Sync. A teilt seine Seele + Aura → B bekommt beides
    // mit dem peerId-Stempel des Servers.
    wsA.send(
        JSON.stringify({
            type: "soul",
            soulName: "phoenix",
            name: "Aria",
            bodyParts: [{ shape: "box" }],
            worldRole: "host",
            // W16 Phase 2: der Welt-Katalog reist im soul-Kanal mit.
            catalog: [{ id: "smoke-cat-w16", label: "Smoke-Welt", hash: "abc123", multiplayer: true }],
        })
    );
    wsA.send(JSON.stringify({ type: "aura", hue: 270, intensity: 0.8 }));
    await sleep(150);
    // Defensive: soul ohne soulName + aura mit NaN-hue werden verworfen.
    wsA.send(JSON.stringify({ type: "soul" }));
    wsA.send(JSON.stringify({ type: "aura", hue: "x", intensity: 0.5 }));
    await sleep(150);

    // W13 Phase 3: Vibe-Pass-Identität. A teilt vibePassId + proof → B
    // bekommt beides mit dem peerId-Stempel des Servers. (Die echte
    // ed25519-Verifikation prüft der Playtest — hier nur der Relay.)
    wsA.send(JSON.stringify({ type: "vibe", vibePassId: "ed25519:" + "ab".repeat(32), proof: "cd".repeat(64) }));
    await sleep(150);
    // Defensive: vibe ohne proof bzw. ganz leer werden verworfen.
    wsA.send(JSON.stringify({ type: "vibe", vibePassId: "ed25519:abc" }));
    wsA.send(JSON.stringify({ type: "vibe" }));
    await sleep(150);

    // W7 Phase 1: WebRTC-Signaling. A sendet einen rtc-offer an B (targeted),
    // B antwortet mit rtc-answer an A, A schickt einen ICE-Kandidaten an B.
    // Server stempelt die Sender-peerId + reicht zielgerichtet durch.
    wsA.send(JSON.stringify({ type: "rtc-offer", to: "peerB", sdp: { type: "offer", sdp: "v=0..." } }));
    await sleep(120);
    wsB.send(JSON.stringify({ type: "rtc-answer", to: "peerA", sdp: { type: "answer", sdp: "v=0..." } }));
    await sleep(120);
    wsA.send(
        JSON.stringify({ type: "rtc-ice", to: "peerB", candidate: { candidate: "candidate:1 ...", sdpMid: "0" } })
    );
    await sleep(120);
    // Defensive: rtc-offer ohne `to` bzw. ohne `sdp` wird verworfen.
    wsA.send(JSON.stringify({ type: "rtc-offer", sdp: { type: "offer", sdp: "x" } }));
    wsA.send(JSON.stringify({ type: "rtc-offer", to: "peerB" }));
    await sleep(120);

    // Ring 11.5: world-request (broadcast) + world-snapshot (targeted).
    // B sendet world-request → A bekommt es → A antwortet mit world-snapshot
    // to=peerB. Server forwarded zielgerichtet — andere Peers (hier nur A
    // und B) sehen den Snapshot nicht doppelt.
    wsB.send(JSON.stringify({ type: "world-request" }));
    await sleep(150);
    // A simuliert Host-Antwort: snapshot mit to=peerB
    wsA.send(JSON.stringify({ type: "world-snapshot", to: "peerB", state: { hello: "world", v: 1 } }));
    await sleep(200);

    // W7 Phase 4: Public-Lobby. A veröffentlicht test-room, B browst die
    // Lobby → bekommt eine lobby-rooms-Antwort mit A's Raum.
    wsA.send(JSON.stringify({ type: "lobby-publish", label: "Anazhs Probe-Raum" }));
    await sleep(120);
    wsB.send(JSON.stringify({ type: "lobby-list" }));
    await sleep(150);

    // Kreatur-Sicht-Sync: A streamt eine creature-pos-Liste, B empfängt sie.
    wsA.send(JSON.stringify({ type: "creature-pos", list: [{ id: "c1", x: 4, y: 6, z: 4, yaw: 0, soul: "wesen" }] }));
    await sleep(150);

    // W11 Phase 4: Voice-Sync. A's Begleiter spricht → B empfängt companion-say.
    // Defensive: companion-say ohne text wird verworfen.
    wsA.send(JSON.stringify({ type: "companion-say", text: "Ich träume mit dir.", voice: "Aria" }));
    wsA.send(JSON.stringify({ type: "companion-say", voice: "Aria" }));
    await sleep(150);

    // W17 Phase B-Relay: der Sub-Welt-Verkehr eines Multiplayer-Portals.
    // A's ws-send fliesst als subworld-net durchs Mesh → B empfängt es.
    // Defensive: subworld-net ohne data / ohne worldId wird verworfen.
    wsA.send(JSON.stringify({ type: "subworld-net", worldId: "worlds/_test/index.html", data: "subnet-payload" }));
    wsA.send(JSON.stringify({ type: "subworld-net", worldId: "worlds/_test/index.html" }));
    wsA.send(JSON.stringify({ type: "subworld-net", data: "subnet-payload" }));
    await sleep(150);

    // W17 Phase C: das Gruppen-Portal. A öffnet ein Multiplayer-Portal →
    // B bekommt die portal-invite. Defensive: ohne worldId wird verworfen.
    wsA.send(JSON.stringify({ type: "portal-invite", worldId: "skeleton", label: "Skelett-Welt" }));
    wsA.send(JSON.stringify({ type: "portal-invite", label: "ohne worldId" }));
    await sleep(150);

    // M8 (V18.161) — das Makro-Fenster: der Broker antwortet dem Anfrager
    // mit der Knoten-Gesamtzahl (Räume + Peers), kein Broadcast.
    wsA.send(JSON.stringify({ type: "stats" }));
    await sleep(150);

    console.log("\n=== A received ===");
    for (const e of events.a) console.log(JSON.stringify(e));
    console.log("\n=== B received ===");
    for (const e of events.b) console.log(JSON.stringify(e));

    // Assertions Ring 11 V1
    const aSawWelcome = events.a.some((e) => e.type === "welcome");
    const aSawBjoin = events.a.some((e) => e.type === "peer-join" && e.peerId === "peerB");
    const aSawBpos = events.a.some((e) => e.type === "pos" && e.peerId === "peerB" && e.x === 10);
    const bSawWelcomeWithA = events.b.some(
        (e) => e.type === "welcome" && Array.isArray(e.peers) && e.peers.includes("peerA")
    );
    const bSawApos = events.b.some((e) => e.type === "pos" && e.peerId === "peerA" && e.x === 1.5);

    // Assertions Ring 11 V2
    const bGotDslFromA = events.b.find(
        (e) =>
            e.type === "dsl" &&
            e.peerId === "peerA" &&
            Array.isArray(e.program) &&
            e.program[0] === "modify_terrain" &&
            e.program[1] === 4.2 &&
            e.program[4] === -2.5
    );
    const aNotEchoedOwnDsl = !events.a.some((e) => e.type === "dsl");
    const bRejectedBadDsl = events.b.filter((e) => e.type === "dsl").length === 1; // genau das eine gute, keine kaputten

    // Ring 11.5 Assertions
    const aGotWorldRequest = events.a.some((e) => e.type === "world-request" && e.peerId === "peerB");
    const bGotWorldSnapshot = events.b.some(
        (e) => e.type === "world-snapshot" && e.peerId === "peerA" && e.state && e.state.hello === "world"
    );
    const aNotEchoedOwnRequest = !events.a.some((e) => e.type === "world-request" && e.peerId === "peerA");
    // Targeted-delivery: A sollte sein EIGENES world-snapshot NICHT zurückbekommen
    const aNotEchoedOwnSnapshot = !events.a.some((e) => e.type === "world-snapshot");
    // lanAddresses im welcome-Message (Ring 11.5)
    const welcomeHasLanAddresses = events.a.some((e) => e.type === "welcome" && Array.isArray(e.lanAddresses));

    // M8 Assertions — die Knoten-Gesamtzahl (2 Peers in 1 Raum), nur an den Anfrager.
    const aGotStats = events.a.some((e) => e.type === "stats" && e.rooms === 1 && e.peers === 2);
    const bNotStats = !events.b.some((e) => e.type === "stats");

    // Ring 11 V3 Assertions
    const bGotSoulFromA = events.b.some(
        (e) =>
            e.type === "soul" &&
            e.peerId === "peerA" &&
            e.soulName === "phoenix" &&
            e.name === "Aria" &&
            e.worldRole === "host"
    );
    // W16 Phase 2: der Welt-Katalog überlebt den WS-Relay.
    const bGotCatalogFromA = events.b.some(
        (e) =>
            e.type === "soul" &&
            e.peerId === "peerA" &&
            Array.isArray(e.catalog) &&
            e.catalog.some((c) => c.id === "smoke-cat-w16" && c.hash === "abc123" && c.multiplayer === true)
    );
    const bGotAuraFromA = events.b.some(
        (e) => e.type === "aura" && e.peerId === "peerA" && e.hue === 270 && e.intensity === 0.8
    );
    const aNotEchoedOwnSoul = !events.a.some((e) => e.type === "soul");
    // Genau die EINE gute soul-/aura-Nachricht (kaputte wurden verworfen).
    const bRejectedBadSoul = events.b.filter((e) => e.type === "soul").length === 1;
    const bRejectedBadAura = events.b.filter((e) => e.type === "aura").length === 1;

    // W13 Phase 3 Assertions
    const bGotVibeFromA = events.b.some(
        (e) =>
            e.type === "vibe" &&
            e.peerId === "peerA" &&
            /^ed25519:[0-9a-f]+$/i.test(e.vibePassId || "") &&
            typeof e.proof === "string"
    );
    const aNotEchoedOwnVibe = !events.a.some((e) => e.type === "vibe");
    const bRejectedBadVibe = events.b.filter((e) => e.type === "vibe").length === 1;

    // W7 Phase 1 Assertions — WebRTC-Signaling, zielgerichtet.
    const bGotRtcOfferFromA = events.b.some(
        (e) => e.type === "rtc-offer" && e.peerId === "peerA" && e.sdp && e.sdp.type === "offer"
    );
    const aGotRtcAnswerFromB = events.a.some(
        (e) => e.type === "rtc-answer" && e.peerId === "peerB" && e.sdp && e.sdp.type === "answer"
    );
    const bGotRtcIceFromA = events.b.some(
        (e) => e.type === "rtc-ice" && e.peerId === "peerA" && e.candidate && e.candidate.sdpMid === "0"
    );
    // Targeted: A bekommt seinen eigenen rtc-offer NICHT zurück.
    const aNotEchoedOwnRtcOffer = !events.a.some((e) => e.type === "rtc-offer");
    // Defensive: rtc-offer ohne `to`/`sdp` wird verworfen — B sieht genau
    // den EINEN guten Offer.
    const bRejectedBadRtcOffer = events.b.filter((e) => e.type === "rtc-offer").length === 1;

    console.log("\n=== Verdict ===");
    console.log("V1 A welcome:", aSawWelcome);
    console.log("V1 A sees B-join:", aSawBjoin);
    console.log("V1 A sees B-pos:", aSawBpos);
    console.log("V1 B welcome lists A:", bSawWelcomeWithA);
    console.log("V1 B sees A-pos:", bSawApos);
    console.log("V2 B receives A's DSL (modify_terrain) with peerId stamp:", !!bGotDslFromA);
    console.log("V2 A doesn't receive own DSL echo:", aNotEchoedOwnDsl);
    console.log("V2 Server rejects non-array / empty / oversized DSL:", bRejectedBadDsl);
    console.log("V2.2 welcome enthält lanAddresses Array:", welcomeHasLanAddresses);
    console.log("V2.2 A bekommt world-request (broadcast):", aGotWorldRequest);
    console.log("V2.2 A bekommt eigenen world-request NICHT zurück:", aNotEchoedOwnRequest);
    console.log("V2.2 B bekommt world-snapshot targeted:", bGotWorldSnapshot);
    console.log("V2.2 A bekommt eigenen world-snapshot NICHT zurück:", aNotEchoedOwnSnapshot);
    console.log("V3 B bekommt A's soul (phoenix/Aria) mit peerId-Stempel:", bGotSoulFromA);
    console.log("W16P2 B bekommt A's Welt-Katalog im soul-Kanal:", bGotCatalogFromA);
    console.log("V3 B bekommt A's aura (hue/intensity) mit peerId-Stempel:", bGotAuraFromA);
    console.log("V3 A bekommt eigene soul NICHT zurück:", aNotEchoedOwnSoul);
    console.log("V3 Server verwirft soul ohne soulName / aura mit NaN:", bRejectedBadSoul && bRejectedBadAura);
    console.log("W13P3 B bekommt A's vibe (vibePassId/proof) mit peerId-Stempel:", bGotVibeFromA);
    console.log("W13P3 A bekommt eigene vibe NICHT zurück:", aNotEchoedOwnVibe);
    console.log("W13P3 Server verwirft vibe ohne proof:", bRejectedBadVibe);
    console.log("W7P1 B bekommt A's rtc-offer (targeted, peerId-Stempel):", bGotRtcOfferFromA);
    console.log("W7P1 A bekommt B's rtc-answer (targeted):", aGotRtcAnswerFromB);
    console.log("W7P1 B bekommt A's rtc-ice (targeted):", bGotRtcIceFromA);
    console.log("W7P1 A bekommt eigenen rtc-offer NICHT zurück:", aNotEchoedOwnRtcOffer);
    console.log("W7P1 Server verwirft rtc-offer ohne to/sdp:", bRejectedBadRtcOffer);
    console.log("M8 A bekommt Broker-stats (1 Raum, 2 Peers, nur Anfrager):", aGotStats && bNotStats);

    // W7 Phase 4 + Kreatur-Sync Assertions
    const bGotLobbyRooms = events.b.some(
        (e) =>
            e.type === "lobby-rooms" &&
            Array.isArray(e.rooms) &&
            e.rooms.some((r) => r.room === "test-room" && r.label === "Anazhs Probe-Raum" && r.peers >= 1)
    );
    const bGotCreaturePos = events.b.some(
        (e) =>
            e.type === "creature-pos" &&
            e.peerId === "peerA" &&
            Array.isArray(e.list) &&
            e.list.some((c) => c.id === "c1")
    );
    const aNotEchoedOwnCreaturePos = !events.a.some((e) => e.type === "creature-pos");
    // W11 Phase 4: Voice-Sync.
    const bGotCompanionSay = events.b.some(
        (e) =>
            e.type === "companion-say" && e.peerId === "peerA" && e.text === "Ich träume mit dir." && e.voice === "Aria"
    );
    const aNotEchoedOwnCompanionSay = !events.a.some((e) => e.type === "companion-say");
    const bRejectedBadCompanionSay = events.b.filter((e) => e.type === "companion-say").length === 1;
    // W17 Phase B-Relay Assertions.
    const bGotSubworldNet = events.b.some(
        (e) =>
            e.type === "subworld-net" &&
            e.peerId === "peerA" &&
            e.worldId === "worlds/_test/index.html" &&
            e.data === "subnet-payload"
    );
    const aNotEchoedOwnSubworldNet = !events.a.some((e) => e.type === "subworld-net");
    const bRejectedBadSubworldNet = events.b.filter((e) => e.type === "subworld-net").length === 1;
    // W17 Phase C Assertions.
    const bGotPortalInvite = events.b.some(
        (e) =>
            e.type === "portal-invite" && e.peerId === "peerA" && e.worldId === "skeleton" && e.label === "Skelett-Welt"
    );
    const aNotEchoedOwnPortalInvite = !events.a.some((e) => e.type === "portal-invite");
    const bRejectedBadPortalInvite = events.b.filter((e) => e.type === "portal-invite").length === 1;
    console.log("W7P4 B bekommt lobby-rooms mit A's veröffentlichtem Raum:", bGotLobbyRooms);
    console.log("KreaturSync B bekommt A's creature-pos (peerId-Stempel):", bGotCreaturePos);
    console.log("KreaturSync A bekommt eigene creature-pos NICHT zurück:", aNotEchoedOwnCreaturePos);
    console.log("W11V4 B bekommt A's companion-say (peerId-Stempel):", bGotCompanionSay);
    console.log("W11V4 A bekommt eigene companion-say NICHT zurück:", aNotEchoedOwnCompanionSay);
    console.log("W11V4 Server verwirft companion-say ohne text:", bRejectedBadCompanionSay);
    console.log("W17BR B bekommt A's subworld-net (peerId-Stempel):", bGotSubworldNet);
    console.log("W17BR A bekommt eigene subworld-net NICHT zurück:", aNotEchoedOwnSubworldNet);
    console.log("W17BR Server verwirft subworld-net ohne data / ohne worldId:", bRejectedBadSubworldNet);
    console.log("W17C B bekommt A's portal-invite (peerId-Stempel):", bGotPortalInvite);
    console.log("W17C A bekommt eigene portal-invite NICHT zurück:", aNotEchoedOwnPortalInvite);
    console.log("W17C Server verwirft portal-invite ohne worldId:", bRejectedBadPortalInvite);

    // B disconnects
    wsB.close();
    await sleep(200);
    const aSawBLeave = events.a.some((e) => e.type === "peer-leave" && e.peerId === "peerB");
    console.log("V1 A sees B-leave on disconnect:", aSawBLeave);

    wsA.close();
    await sleep(100);

    const allOk =
        aSawWelcome &&
        aSawBjoin &&
        aSawBpos &&
        bSawWelcomeWithA &&
        bSawApos &&
        aSawBLeave &&
        !!bGotDslFromA &&
        aNotEchoedOwnDsl &&
        bRejectedBadDsl &&
        welcomeHasLanAddresses &&
        aGotWorldRequest &&
        aNotEchoedOwnRequest &&
        !!bGotWorldSnapshot &&
        aNotEchoedOwnSnapshot &&
        bGotSoulFromA &&
        bGotCatalogFromA &&
        bGotAuraFromA &&
        aNotEchoedOwnSoul &&
        bRejectedBadSoul &&
        bRejectedBadAura &&
        bGotVibeFromA &&
        aNotEchoedOwnVibe &&
        bRejectedBadVibe &&
        bGotRtcOfferFromA &&
        aGotRtcAnswerFromB &&
        bGotRtcIceFromA &&
        aNotEchoedOwnRtcOffer &&
        bRejectedBadRtcOffer &&
        bGotLobbyRooms &&
        bGotCreaturePos &&
        aNotEchoedOwnCreaturePos &&
        bGotCompanionSay &&
        aNotEchoedOwnCompanionSay &&
        bRejectedBadCompanionSay &&
        bGotSubworldNet &&
        aNotEchoedOwnSubworldNet &&
        bRejectedBadSubworldNet &&
        bGotPortalInvite &&
        aNotEchoedOwnPortalInvite &&
        bRejectedBadPortalInvite &&
        aGotStats &&
        bNotStats;
    server.kill();
    process.exit(allOk ? 0 : 1);
}

run().catch((err) => {
    console.error(err);
    server.kill();
    process.exit(1);
});
