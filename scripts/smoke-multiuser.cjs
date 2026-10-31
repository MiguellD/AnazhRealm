// End-to-End-Test: zwei WS-Clients gegen signaling-server.js
// Bestätigt dass welcome/peer-join/pos wirklich durchläuft.
// Der Broker ist ein eigener (welt-boot `startProc`) auf dem eigenen Port (MULTIUSER_PORT, sonst ein freier des Systems — nie
// 4313, der Signal-Server des Schöpfers); bis K-WANDUHR startete die Probe einen festen Pfad (/home/user/AnazhRealm) und wartete
// nach jeder Sendung 100–500 ms Wanduhr. Jetzt wartet sie an der SCHRANKE: jeder offene Socket fragt den Broker nach `stats` —
// die Antwort kommt nach allem, was der Broker ihm vorher schickte (ein Faden, eine Reihenfolge je Verbindung).
const { startProc, eigenePorte, hauptLauf } = require("./lib/welt-boot.cjs");

let server = null;

async function run() {
    const [port] = await eigenePorte("MULTIUSER_PORT");
    server = await startProc("signaling-server.js", /lauscht/, { ANAZH_SIGNALING_PORT: String(port) });
    const BROKER = `ws://127.0.0.1:${port}`;
    const events = { a: [], b: [] };
    const schranken = new Map();
    const offen = new Set();
    const hoere = (ws, liste) =>
        ws.addEventListener("message", (e) => {
            const m = JSON.parse(e.data);
            const q = schranken.get(ws);
            if (m.type === "stats" && q && q.length) return q.shift()();
            liste().push(m);
        });
    const ping = (ws) =>
        new Promise((ok) => {
            if (!schranken.has(ws)) schranken.set(ws, []);
            schranken.get(ws).push(ok);
            ws.send(JSON.stringify({ type: "stats" }));
        });
    const sync = async () => {
        for (const ws of offen) await ping(ws);
    };
    const wsA = new WebSocket(BROKER);
    const wsB = new WebSocket(BROKER);

    hoere(wsA, () => events.a);
    hoere(wsB, () => events.b);

    await Promise.all([
        new Promise((r) => wsA.addEventListener("open", r)),
        new Promise((r) => wsB.addEventListener("open", r)),
    ]);
    offen.add(wsA).add(wsB);
    console.log("Both sockets open");

    // A joins first
    wsA.send(JSON.stringify({ type: "join", room: "test-room", peerId: "peerA" }));
    await sync();
    // B joins
    wsB.send(JSON.stringify({ type: "join", room: "test-room", peerId: "peerB" }));
    await sync();
    // A sends pos
    wsA.send(JSON.stringify({ type: "pos", x: 1.5, y: 2.5, z: 3.5, yaw: 0.5 }));
    await sync();
    // B sends pos
    wsB.send(JSON.stringify({ type: "pos", x: 10, y: 20, z: 30, yaw: 1.5 }));
    await sync();

    // DSL-AST-Broadcast. A sendet voxel_carve → B sollte
    // dasselbe Programm zugestellt bekommen, mit peerId-Stempel des Servers.
    const sampleDsl = ["voxel_carve", 4.2, -3.5, 6, 2.5];
    wsA.send(JSON.stringify({ type: "dsl", program: sampleDsl }));
    await sync();
    // Defensive: kaputte dsl-Pakete werden ignoriert (Array-Check + Length-Cap)
    wsA.send(JSON.stringify({ type: "dsl", program: "not-an-array" }));
    wsA.send(JSON.stringify({ type: "dsl", program: [] }));
    wsA.send(JSON.stringify({ type: "dsl", program: new Array(300).fill("over_cap") }));
    await sync();

    // Soul-Sync. A teilt seine Seele + Aura → B bekommt beides
    // mit dem peerId-Stempel des Servers.
    wsA.send(
        JSON.stringify({
            type: "soul",
            soulName: "phoenix",
            name: "Aria",
            bodyParts: [{ shape: "box" }],
            worldRole: "host",
            // der Welt-Katalog reist im soul-Kanal mit.
            catalog: [{ id: "smoke-cat-w16", label: "Smoke-Welt", hash: "abc123", multiplayer: true }],
        })
    );
    // ALTLASTEN-NULL: aura ist aus dem Protokoll gefallen — der Broker MUSS
    // den unbekannten Typ still verwerfen (§4 must-ignore, hier bewiesen).
    wsA.send(JSON.stringify({ type: "aura", hue: 270, intensity: 0.8 }));
    await sync();
    // Defensive: soul ohne soulName wird verworfen.
    wsA.send(JSON.stringify({ type: "soul" }));
    await sync();

    // Vibe-Pass-Identität. A teilt vibePassId + proof → B
    // bekommt beides mit dem peerId-Stempel des Servers. (Die echte
    // ed25519-Verifikation prüft der Playtest — hier nur der Relay.)
    wsA.send(JSON.stringify({ type: "vibe", vibePassId: "ed25519:" + "ab".repeat(32), proof: "cd".repeat(64) }));
    await sync();
    // Defensive: vibe ohne proof bzw. ganz leer werden verworfen.
    wsA.send(JSON.stringify({ type: "vibe", vibePassId: "ed25519:abc" }));
    wsA.send(JSON.stringify({ type: "vibe" }));
    await sync();

    // WebRTC-Signaling. A sendet einen rtc-offer an B (targeted),
    // B antwortet mit rtc-answer an A, A schickt einen ICE-Kandidaten an B.
    // Server stempelt die Sender-peerId + reicht zielgerichtet durch.
    wsA.send(JSON.stringify({ type: "rtc-offer", to: "peerB", sdp: { type: "offer", sdp: "v=0..." } }));
    await sync();
    wsB.send(JSON.stringify({ type: "rtc-answer", to: "peerA", sdp: { type: "answer", sdp: "v=0..." } }));
    await sync();
    wsA.send(
        JSON.stringify({ type: "rtc-ice", to: "peerB", candidate: { candidate: "candidate:1 ...", sdpMid: "0" } })
    );
    await sync();
    // Defensive: rtc-offer ohne `to` bzw. ohne `sdp` wird verworfen.
    wsA.send(JSON.stringify({ type: "rtc-offer", sdp: { type: "offer", sdp: "x" } }));
    wsA.send(JSON.stringify({ type: "rtc-offer", to: "peerB" }));
    await sync();

    // world-request (broadcast) + world-snapshot (targeted).
    // B sendet world-request → A bekommt es → A antwortet mit world-snapshot
    // to=peerB. Server forwarded zielgerichtet — andere Peers (hier nur A
    // und B) sehen den Snapshot nicht doppelt.
    wsB.send(JSON.stringify({ type: "world-request" }));
    await sync();
    // A simuliert Host-Antwort: snapshot mit to=peerB
    wsA.send(JSON.stringify({ type: "world-snapshot", to: "peerB", state: { hello: "world", v: 1 } }));
    await sync();

    // Public-Lobby. A veröffentlicht test-room, B browst die
    // Lobby → bekommt eine lobby-rooms-Antwort mit A's Raum.
    wsA.send(JSON.stringify({ type: "lobby-publish", label: "Anazhs Probe-Raum" }));
    await sync();
    wsB.send(JSON.stringify({ type: "lobby-list" }));
    await sync();

    // Kreatur-Sicht-Sync: A streamt eine creature-pos-Liste, B empfängt sie.
    wsA.send(JSON.stringify({ type: "creature-pos", list: [{ id: "c1", x: 4, y: 6, z: 4, yaw: 0, soul: "wesen" }] }));
    await sync();

    // Voice-Sync. A's Begleiter spricht → B empfängt companion-say.
    // Defensive: companion-say ohne text wird verworfen.
    wsA.send(JSON.stringify({ type: "companion-say", text: "Ich träume mit dir.", voice: "Aria" }));
    wsA.send(JSON.stringify({ type: "companion-say", voice: "Aria" }));
    await sync();

    // der Sub-Welt-Verkehr eines Multiplayer-Portals.
    // A's ws-send fliesst als subworld-net durchs Mesh → B empfängt es.
    // Defensive: subworld-net ohne data / ohne worldId wird verworfen.
    wsA.send(JSON.stringify({ type: "subworld-net", worldId: "worlds/_test/index.html", data: "subnet-payload" }));
    wsA.send(JSON.stringify({ type: "subworld-net", worldId: "worlds/_test/index.html" }));
    wsA.send(JSON.stringify({ type: "subworld-net", data: "subnet-payload" }));
    await sync();

    // das Gruppen-Portal. A öffnet ein Multiplayer-Portal →
    // B bekommt die portal-invite. Defensive: ohne worldId wird verworfen.
    wsA.send(JSON.stringify({ type: "portal-invite", worldId: "skeleton", label: "Skelett-Welt" }));
    wsA.send(JSON.stringify({ type: "portal-invite", label: "ohne worldId" }));
    await sync();

    // M8 — das Makro-Fenster: der Broker antwortet dem Anfrager
    // mit der Knoten-Gesamtzahl (Räume + Peers), kein Broadcast.
    wsA.send(JSON.stringify({ type: "stats" }));
    await sync();

    // Φ4 — Anwesenheits-Schicht: ein dritter WS joint die
    // Bubble `test-room:r0_0` (eine Region-Bubble derselben Welt), dann
    // fragt A world-presence: der Broker liefert {regions: [{region:"",
    // peers:2}, {region:"r0_0", peers:1}]} (oder gleichwertige Reihenfolge).
    const wsC = new WebSocket(BROKER);
    events.c = [];
    hoere(wsC, () => events.c);
    await new Promise((r) => wsC.addEventListener("open", r));
    offen.add(wsC);
    wsC.send(JSON.stringify({ type: "join", room: "test-room:r0_0", peerId: "peerC" }));
    await sync();
    wsA.send(JSON.stringify({ type: "world-presence", worldId: "test-room" }));
    await sync();

    console.log("\n=== A received ===");
    for (const e of events.a) console.log(JSON.stringify(e));
    console.log("\n=== B received ===");
    for (const e of events.b) console.log(JSON.stringify(e));

    // die Ereignisse einer Liste vom Typ `typ`, die `und` tragen (der EINE Leser der Ereignis-Listen) — `hat`: gibt es eins
    const von = (liste, typ, und = () => true) => liste.filter((e) => e.type === typ && und(e));
    const hat = (...a) => von(...a).length > 0;
    // Assertions Ring 11 V1
    const aSawWelcome = hat(events.a, "welcome");
    const aSawBjoin = hat(events.a, "peer-join", (e) => e.peerId === "peerB");
    const aSawBpos = hat(events.a, "pos", (e) => e.peerId === "peerB" && e.x === 10);
    const bSawWelcomeWithA = hat(events.b, "welcome", (e) => Array.isArray(e.peers) && e.peers.includes("peerA"));
    const bSawApos = hat(events.b, "pos", (e) => e.peerId === "peerA" && e.x === 1.5);

    // Assertions Ring 11 V2
    const bGotDslFromA = von(events.b, "dsl", (e) => e.peerId === "peerA" && Array.isArray(e.program) && e.program[0] === "voxel_carve" && e.program[1] === 4.2 && e.program[4] === 2.5)[0];
    const aNotEchoedOwnDsl = !hat(events.a, "dsl");
    const bRejectedBadDsl = von(events.b, "dsl").length === 1; // genau das eine gute, keine kaputten

    const aGotWorldRequest = hat(events.a, "world-request", (e) => e.peerId === "peerB");
    const bGotWorldSnapshot = hat(events.b, "world-snapshot", (e) => e.peerId === "peerA" && e.state && e.state.hello === "world");
    const aNotEchoedOwnRequest = !hat(events.a, "world-request", (e) => e.peerId === "peerA");
    // Targeted-delivery: A sollte sein EIGENES world-snapshot NICHT zurückbekommen
    const aNotEchoedOwnSnapshot = !hat(events.a, "world-snapshot");
    // lanAddresses im welcome-Message
    const welcomeHasLanAddresses = hat(events.a, "welcome", (e) => Array.isArray(e.lanAddresses));

    // M8 Assertions — die Knoten-Gesamtzahl (2 Peers in 1 Raum), nur an den Anfrager.
    const aGotStats = hat(events.a, "stats", (e) => e.rooms === 1 && e.peers === 2);
    const bNotStats = !hat(events.b, "stats");

    const bGotSoulFromA = hat(events.b, "soul", (e) => e.peerId === "peerA" && e.soulName === "phoenix" && e.name === "Aria" && e.worldRole === "host");
    // der Welt-Katalog überlebt den WS-Relay.
    const bGotCatalogFromA = hat(events.b, "soul", (e) => e.peerId === "peerA" && Array.isArray(e.catalog) && e.catalog.some((c) => c.id === "smoke-cat-w16" && c.hash === "abc123" && c.multiplayer === true));
    // ALTLASTEN-NULL: der Broker kennt aura nicht mehr — NICHTS kommt an.
    const bAuraIgnored = !hat(events.b, "aura");
    const aNotEchoedOwnSoul = !hat(events.a, "soul");
    // Genau die EINE gute soul-Nachricht (kaputte wurden verworfen).
    const bRejectedBadSoul = von(events.b, "soul").length === 1;

    const bGotVibeFromA = hat(events.b, "vibe", (e) => e.peerId === "peerA" && /^ed25519:[0-9a-f]+$/i.test(e.vibePassId || "") && typeof e.proof === "string");
    const aNotEchoedOwnVibe = !hat(events.a, "vibe");
    const bRejectedBadVibe = von(events.b, "vibe").length === 1;

    // WebRTC-Signaling, zielgerichtet.
    const bGotRtcOfferFromA = hat(events.b, "rtc-offer", (e) => e.peerId === "peerA" && e.sdp && e.sdp.type === "offer");
    const aGotRtcAnswerFromB = hat(events.a, "rtc-answer", (e) => e.peerId === "peerB" && e.sdp && e.sdp.type === "answer");
    const bGotRtcIceFromA = hat(events.b, "rtc-ice", (e) => e.peerId === "peerA" && e.candidate && e.candidate.sdpMid === "0");
    // Targeted: A bekommt seinen eigenen rtc-offer NICHT zurück.
    const aNotEchoedOwnRtcOffer = !hat(events.a, "rtc-offer");
    // Defensive: rtc-offer ohne `to`/`sdp` wird verworfen — B sieht genau
    // den EINEN guten Offer.
    const bRejectedBadRtcOffer = von(events.b, "rtc-offer").length === 1;

    console.log("\n=== Verdict ===");
    console.log("V1 A welcome:", aSawWelcome);
    console.log("V1 A sees B-join:", aSawBjoin);
    console.log("V1 A sees B-pos:", aSawBpos);
    console.log("V1 B welcome lists A:", bSawWelcomeWithA);
    console.log("V1 B sees A-pos:", bSawApos);
    console.log("V2 B receives A's DSL (voxel_carve) with peerId stamp:", !!bGotDslFromA);
    console.log("V2 A doesn't receive own DSL echo:", aNotEchoedOwnDsl);
    console.log("V2 Server rejects non-array / empty / oversized DSL:", bRejectedBadDsl);
    console.log("V2.2 welcome enthält lanAddresses Array:", welcomeHasLanAddresses);
    console.log("V2.2 A bekommt world-request (broadcast):", aGotWorldRequest);
    console.log("V2.2 A bekommt eigenen world-request NICHT zurück:", aNotEchoedOwnRequest);
    console.log("V2.2 B bekommt world-snapshot targeted:", bGotWorldSnapshot);
    console.log("V2.2 A bekommt eigenen world-snapshot NICHT zurück:", aNotEchoedOwnSnapshot);
    console.log("V3 B bekommt A's soul (phoenix/Aria) mit peerId-Stempel:", bGotSoulFromA);
    console.log("W16P2 B bekommt A's Welt-Katalog im soul-Kanal:", bGotCatalogFromA);
    console.log("ALTLASTEN-NULL: aura ist dem Broker unbekannt (still verworfen):", bAuraIgnored);
    console.log("V3 A bekommt eigene soul NICHT zurück:", aNotEchoedOwnSoul);
    console.log("V3 Server verwirft soul ohne soulName:", bRejectedBadSoul);
    console.log("W13P3 B bekommt A's vibe (vibePassId/proof) mit peerId-Stempel:", bGotVibeFromA);
    console.log("W13P3 A bekommt eigene vibe NICHT zurück:", aNotEchoedOwnVibe);
    console.log("W13P3 Server verwirft vibe ohne proof:", bRejectedBadVibe);
    console.log("W7P1 B bekommt A's rtc-offer (targeted, peerId-Stempel):", bGotRtcOfferFromA);
    console.log("W7P1 A bekommt B's rtc-answer (targeted):", aGotRtcAnswerFromB);
    console.log("W7P1 B bekommt A's rtc-ice (targeted):", bGotRtcIceFromA);
    console.log("W7P1 A bekommt eigenen rtc-offer NICHT zurück:", aNotEchoedOwnRtcOffer);
    console.log("W7P1 Server verwirft rtc-offer ohne to/sdp:", bRejectedBadRtcOffer);
    console.log("M8 A bekommt Broker-stats (1 Raum, 2 Peers, nur Anfrager):", aGotStats && bNotStats);

    const bGotLobbyRooms = hat(events.b, "lobby-rooms", (e) => Array.isArray(e.rooms) && e.rooms.some((r) => r.room === "test-room" && r.label === "Anazhs Probe-Raum" && r.peers >= 1));
    const bGotCreaturePos = hat(events.b, "creature-pos", (e) => e.peerId === "peerA" && Array.isArray(e.list) && e.list.some((c) => c.id === "c1"));
    const aNotEchoedOwnCreaturePos = !hat(events.a, "creature-pos");
    // Voice-Sync.
    const bGotCompanionSay = hat(events.b, "companion-say", (e) => e.peerId === "peerA" && e.text === "Ich träume mit dir." && e.voice === "Aria");
    const aNotEchoedOwnCompanionSay = !hat(events.a, "companion-say");
    const bRejectedBadCompanionSay = von(events.b, "companion-say").length === 1;
    const bGotSubworldNet = hat(events.b, "subworld-net", (e) => e.peerId === "peerA" && e.worldId === "worlds/_test/index.html" && e.data === "subnet-payload");
    const aNotEchoedOwnSubworldNet = !hat(events.a, "subworld-net");
    const bRejectedBadSubworldNet = von(events.b, "subworld-net").length === 1;
    const bGotPortalInvite = hat(events.b, "portal-invite", (e) => e.peerId === "peerA" && e.worldId === "skeleton" && e.label === "Skelett-Welt");
    const aNotEchoedOwnPortalInvite = !hat(events.a, "portal-invite");
    const bRejectedBadPortalInvite = von(events.b, "portal-invite").length === 1;
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

    // Φ4 — Anwesenheits-Schicht: A's world-presence-Antwort enthält BEIDE
    // Räume der Welt „test-room" (Basis + Bubble r0_0) mit korrekten peers.
    const presenceMsg = von(events.a, "world-presence", (e) => e.worldId === "test-room")[0];
    const regionsByName = {};
    if (presenceMsg && Array.isArray(presenceMsg.regions)) {
        for (const r of presenceMsg.regions) regionsByName[r.region] = r.peers;
    }
    const phi4PresenceBase = regionsByName[""] === 2; // peerA + peerB in test-room
    const phi4PresenceBubble = regionsByName["r0_0"] === 1; // peerC in test-room:r0_0
    const phi4OnlyAGotIt = !hat(events.b, "world-presence");
    console.log("Φ4 world-presence: A bekommt {region:'',peers:2}:", phi4PresenceBase);
    console.log("Φ4 world-presence: A bekommt {region:'r0_0',peers:1}:", phi4PresenceBubble);
    console.log("Φ4 world-presence: NUR A bekommt die Antwort (kein Broadcast):", phi4OnlyAGotIt);

    // C disconnects
    offen.delete(wsC);
    wsC.close();

    // B disconnects — A sieht den Abschied (das Ereignis, nie eine Pause)
    offen.delete(wsB);
    const abschied = new Promise((ok) =>
        wsA.addEventListener("message", (e) => (({ type, peerId }) => type === "peer-leave" && peerId === "peerB" && ok())(JSON.parse(e.data)))
    );
    wsB.close();
    await Promise.race([abschied, new Promise((ok) => wsA.addEventListener("close", ok))]);
    const aSawBLeave = hat(events.a, "peer-leave", (e) => e.peerId === "peerB");
    console.log("V1 A sees B-leave on disconnect:", aSawBLeave);

    wsA.close();

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
        bAuraIgnored &&
        aNotEchoedOwnSoul &&
        bRejectedBadSoul &&
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
        bNotStats &&
        phi4PresenceBase &&
        phi4PresenceBubble &&
        phi4OnlyAGotIt;
    server.kill();
    process.exit(allOk ? 0 : 1);
}

hauptLauf(run, () => server && server.kill());
