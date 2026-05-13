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

    console.log("\n=== A received ===");
    for (const e of events.a) console.log(JSON.stringify(e));
    console.log("\n=== B received ===");
    for (const e of events.b) console.log(JSON.stringify(e));

    // Assertions
    const aSawWelcome = events.a.some((e) => e.type === "welcome");
    const aSawBjoin = events.a.some((e) => e.type === "peer-join" && e.peerId === "peerB");
    const aSawBpos = events.a.some((e) => e.type === "pos" && e.peerId === "peerB" && e.x === 10);
    const bSawWelcomeWithA = events.b.some((e) => e.type === "welcome" && Array.isArray(e.peers) && e.peers.includes("peerA"));
    const bSawApos = events.b.some((e) => e.type === "pos" && e.peerId === "peerA" && e.x === 1.5);

    console.log("\n=== Verdict ===");
    console.log("A welcome:", aSawWelcome);
    console.log("A sees B-join:", aSawBjoin);
    console.log("A sees B-pos:", aSawBpos);
    console.log("B welcome lists A:", bSawWelcomeWithA);
    console.log("B sees A-pos:", bSawApos);

    // B disconnects
    wsB.close();
    await sleep(200);
    const aSawBLeave = events.a.some((e) => e.type === "peer-leave" && e.peerId === "peerB");
    console.log("A sees B-leave on disconnect:", aSawBLeave);

    wsA.close();
    await sleep(100);

    const allOk = aSawWelcome && aSawBjoin && aSawBpos && bSawWelcomeWithA && bSawApos && aSawBLeave;
    server.kill();
    process.exit(allOk ? 0 : 1);
}

run().catch((err) => {
    console.error(err);
    server.kill();
    process.exit(1);
});
