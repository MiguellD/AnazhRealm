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

    // Ring 11.5: world-request (broadcast) + world-snapshot (targeted).
    // B sendet world-request → A bekommt es → A antwortet mit world-snapshot
    // to=peerB. Server forwarded zielgerichtet — andere Peers (hier nur A
    // und B) sehen den Snapshot nicht doppelt.
    wsB.send(JSON.stringify({ type: "world-request" }));
    await sleep(150);
    // A simuliert Host-Antwort: snapshot mit to=peerB
    wsA.send(JSON.stringify({ type: "world-snapshot", to: "peerB", state: { hello: "world", v: 1 } }));
    await sleep(200);

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
    const bRejectedBadDsl =
        events.b.filter((e) => e.type === "dsl").length === 1; // genau das eine gute, keine kaputten

    // Ring 11.5 Assertions
    const aGotWorldRequest = events.a.some(
        (e) => e.type === "world-request" && e.peerId === "peerB"
    );
    const bGotWorldSnapshot = events.b.some(
        (e) => e.type === "world-snapshot" && e.peerId === "peerA" && e.state && e.state.hello === "world"
    );
    const aNotEchoedOwnRequest = !events.a.some((e) => e.type === "world-request" && e.peerId === "peerA");
    // Targeted-delivery: A sollte sein EIGENES world-snapshot NICHT zurückbekommen
    const aNotEchoedOwnSnapshot = !events.a.some((e) => e.type === "world-snapshot");
    // lanAddresses im welcome-Message (Ring 11.5)
    const welcomeHasLanAddresses = events.a.some(
        (e) => e.type === "welcome" && Array.isArray(e.lanAddresses)
    );

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
        aNotEchoedOwnSnapshot;
    server.kill();
    process.exit(allOk ? 0 : 1);
}

run().catch((err) => {
    console.error(err);
    server.kill();
    process.exit(1);
});
