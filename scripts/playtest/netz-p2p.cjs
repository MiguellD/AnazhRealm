"use strict";
// scripts/playtest/netz-p2p.cjs — der Richter von Netz/p2p (spec/stamm/modul-karte.json): Einladung · WebRTC-Mesh · Lockstep · Stimme · Welt-Bündel.
// 6 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, erreichbar } = require("../playtest.cjs");

async function checkBandRing11AndW7Mesh({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### modify_terrain stirbt, voxel_carve/_fill leben ###
    // Die Absenz der modify_terrain-Schicht trägt gate:altlasten (KI2);
    // die Welt-Mod läuft über die broadcastbaren voxel_carve/voxel_fill (Chat `grabe loch`/`hebe hügel`
    // mit Spieler-Position; CREATURE_PROPOSED_OPS führt sie statt modify_terrain).
    const voxelV936Results = await safeEvaluate(page, () => {
        if (!r || !r.state) return null;
        const out = {};

        // (2) Die neuen voxel_carve/voxel_fill-DSL-Ops leben.

        // (3) Chat-Patterns sind auf die neuen Ops umgeroutet.
        const chatDig = r.parseChatToDsl("grabe loch");
        const chatHill = r.parseChatToDsl("hebe hügel");
        out.chatDigRoutesToVoxelCarve =
            chatDig && Array.isArray(chatDig.program) && chatDig.program[0] === "voxel_carve";
        out.chatHillRoutesToVoxelFill =
            chatHill && Array.isArray(chatHill.program) && chatHill.program[0] === "voxel_fill";
        out.chatDigEmbedsPlayerPosition =
            chatDig &&
            Array.isArray(chatDig.program) &&
            Number.isFinite(chatDig.program[1]) &&
            Number.isFinite(chatDig.program[2]) &&
            Number.isFinite(chatDig.program[3]);

        // (4) DSL-Op voxel_carve schnitzt echt — der Edit landet in
        // worldMeta.voxelEdits. Frieden-Modus damit Edit-Gate
        // den Fill-Pfad nicht abweist.
        const oldMode = r.getGameMode();
        r.setGameMode("frieden");
        if (!Array.isArray(r.state.worldMeta.voxelEdits)) r.state.worldMeta.voxelEdits = [];
        r.state.worldMeta.voxelEdits = [];
        r.dslRun(["voxel_carve", 0, 50, 0, 3], { source: "playtest" });
        out.voxelCarveAddsEdit =
            r.state.worldMeta.voxelEdits.length === 1 && r.state.worldMeta.voxelEdits[0].mode !== "fill";
        // voxel_fill addiert einen mode:"fill"-Edit
        r.state.worldMeta.voxelEdits = [];
        r.dslRun(["voxel_fill", 0, 50, 0, 3], { source: "playtest" });
        out.voxelFillAddsEdit =
            r.state.worldMeta.voxelEdits.length === 1 && r.state.worldMeta.voxelEdits[0].mode === "fill";
        // Invalid pos (NaN) → kein Edit + der benannte Eintrag der Orts-Engstelle (`dslEvalPos`, Welle L V-k5)
        const before = r.state.worldMeta.voxelEdits.length;
        const invalidResult = r.dslRun(["voxel_carve", NaN, 0, 0, 3], { source: "playtest" });
        out.voxelCarveRejectsInvalidPos =
            r.state.worldMeta.voxelEdits.length === before &&
            invalidResult.log &&
            invalidResult.log.some((l) => l.event === "invalid_position" && l.effekt === "voxel_carve");
        r.setGameMode(oldMode);
        r.state.worldMeta.voxelEdits = [];

        // (5) describeProgram kennt die neuen Ops.
        const dCarve = r.describeProgram(["voxel_carve", 1, 2, 3, 4]);
        const dFill = r.describeProgram(["voxel_fill", 1, 2, 3, 4]);
        out.describeCarve = typeof dCarve === "string" && /schnitzt|Voxel/i.test(dCarve);
        out.describeFill = typeof dFill === "string" && /schüttet|auf/i.test(dFill);

        // (6) CREATURE_PROPOSED_OPS-Whitelist trägt voxel_carve+
        // voxel_fill statt modify_terrain.
        const proposed = r.constructor.CREATURE_PROPOSED_OPS;
        out.creatureProposedHasVoxelOps = proposed && proposed.has("voxel_carve") && proposed.has("voxel_fill");

        return out;
    });

    if (voxelV936Results && !voxelV936Results.error) {
        check(
            "Voxel V9.36: Chat 'grabe loch' → voxel_carve (Heightfield-Pfad umgeroutet)",
            voxelV936Results.chatDigRoutesToVoxelCarve
        );
        check("Voxel V9.36: Chat 'hebe hügel' → voxel_fill", voxelV936Results.chatHillRoutesToVoxelFill);
        check(
            "Voxel V9.36: Chat-Patterns embedden die Spieler-Position (x,y,z)",
            voxelV936Results.chatDigEmbedsPlayerPosition
        );
        check("Voxel V9.36: voxel_carve-DSL-Op fügt einen Edit ans Voxel-Feld", voxelV936Results.voxelCarveAddsEdit);
        check(
            "Voxel V9.36: voxel_fill-DSL-Op fügt einen mode:'fill'-Edit ans Voxel-Feld",
            voxelV936Results.voxelFillAddsEdit
        );
        check(
            "Voxel V9.36: voxel_carve mit NaN-Position wird abgelehnt + geloggt",
            voxelV936Results.voxelCarveRejectsInvalidPos
        );
        check("Voxel V9.36: describeProgram kennt voxel_carve", voxelV936Results.describeCarve);
        check("Voxel V9.36: describeProgram kennt voxel_fill", voxelV936Results.describeFill);
        check(
            "Voxel V9.36: CREATURE_PROPOSED_OPS trägt voxel_carve + voxel_fill (statt modify_terrain)",
            voxelV936Results.creatureProposedHasVoxelOps
        );
    }

    // ### Multi-User Position-Sync (Daten + UI + Sandbox) ###
    // Nur Position + Rotation (kein DSL-Sync). Geprüft: Datenstruktur, Sandbox-Grenze (kein neuer
    // eval-Pfad), CSP ws://, UI-Toggle; ohne echten WebSocket: initP2PSync ohne worldId lehnt ab, mit
    // worldId steht die Datenstruktur, auch wenn die Connection scheitert.
    const ring11Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        out.hasP2PState =
            r.state.p2p &&
            typeof r.state.p2p.enabled === "boolean" &&
            typeof r.state.p2p.url === "string" &&
            r.state.p2p.peers instanceof Map;

        // initP2PSync ohne Welt-ID → sauberer Ablehnung
        const savedWorldId = r.state.worldMeta.worldId;
        r.state.worldMeta.worldId = null;
        const noRoomResult = r.initP2PSync(null);
        out.rejectsNoRoom = noRoomResult.ok === false && noRoomResult.reason === "no_room";
        r.state.worldMeta.worldId = savedWorldId;

        // peerId-Generator liefert nicht-leeren String
        const pid1 = r.p2pGenerateId();
        const pid2 = r.p2pGenerateId();
        out.peerIdShape = /^p-[a-z0-9]+-[a-z0-9]+$/.test(pid1);
        out.peerIdUnique = pid1 !== pid2;

        // Persistenz-Pfad: persist + load idempotent
        r.state.p2p.url = "ws://example.org:9999";
        r.state.p2p.enabled = true;
        r.p2pPersist();
        r.state.p2p.url = "";
        r.state.p2p.enabled = false;
        r.p2pLoadPersisted();
        out.persistRoundTrip = r.state.p2p.url === "ws://example.org:9999" && r.state.p2p.enabled === true;
        // wieder auf Default
        r.state.p2p.url = "ws://127.0.0.1:4313";
        r.state.p2p.enabled = false;
        r.p2pPersist();

        // Handle-Message Pfade — welcome, peer-join, der Leib und der Knopf urteilt gate:mp-sync an zwei echten Seiten
        // („beide kennen einander mit Gestalt über die Leitung", „Knopf aus/an"); ihre Mock-Zwillinge fielen mit ultiversum.K4
        r.state.p2p.peerId = "self-test";
        r.p2pHandleMessage(JSON.stringify({ type: "welcome", peers: ["peerA", "peerB"] }));
        r.p2pHandleMessage(JSON.stringify({ type: "pos", peerId: "peerA", x: 10, y: 5, z: 3, yaw: 1.5 }));
        const peerA = r.state.p2p.peers.get("peerA");
        out.posUpdatesPeer = peerA && peerA.x === 10 && peerA.y === 5 && peerA.z === 3 && peerA.yaw === 1.5;

        // peer-leave entfernt peer + mesh aus scene
        const sceneSizeBefore = r.state.scene.children.length;
        r.p2pHandleMessage(JSON.stringify({ type: "peer-leave", peerId: "peerA" }));
        out.peerLeaveRemoves = !r.state.p2p.peers.has("peerA");
        out.peerLeaveDisposesMesh = r.state.scene.children.length === sceneSizeBefore - 1;

        // Eigener peerId wird verworfen
        r.p2pHandleMessage(JSON.stringify({ type: "pos", peerId: "self-test", x: 1, y: 1, z: 1, yaw: 0 }));
        out.ownPeerIgnored = !r.state.p2p.peers.has("self-test");

        // Invalid pos (NaN) wird verworfen — über den Draht reist NaN als null (JSON.stringify), und Number(null) === 0
        // (Lehre 17): der ortlos geborene peerB darf davon nicht in den Ursprung springen, er bleibt ohne Ort.
        r.p2pHandleMessage(JSON.stringify({ type: "pos", peerId: "peerB", x: NaN, y: 0, z: 0, yaw: 0 }));
        r.p2pHandleMessage(JSON.stringify({ type: "pos", peerId: "peerB", x: 4, y: null, z: 2, yaw: 0 }));
        r.p2pHandleMessage(JSON.stringify({ type: "pos", peerId: "peerB", x: 4, y: 1, z: "", yaw: 0 }));
        const peerB = r.state.p2p.peers.get("peerB");
        out.nanPosNotApplied =
            !!peerB &&
            ![peerB.x, peerB.y, peerB.z].some(Number.isFinite) &&
            !(peerB.snapBuf && peerB.snapBuf.length) &&
            !!peerB.mesh &&
            peerB.mesh.visible === false;
        // DIE KLASSE (Lehre 17): jeder Leser einer Zahl aus dem Draht — null (das JSON-Bild von NaN) ist kein Ort und
        // keine Zahl. Je Leser ein Fall über den echten JSON-Weg; jeder Name in der Liste las null als 0.
        const draht = (o) => JSON.parse(JSON.stringify(o));
        const nullAlsNull = [];
        if (r._sanitizePose(draht({ x: NaN, y: 0, z: 0, yaw: 0 })) !== null) nullAlsNull.push("subworld-pose");
        r._p2pHandleCreaturePos("peerB", draht({ list: [{ id: "ortlos", x: NaN, y: 0, z: 0, soul: "wesen" }] }));
        if (r.state.p2p.remoteCreatures.has("peerB:ortlos")) nullAlsNull.push("creature-pos");
        r._p2pMsgInput(draht({ peerId: "peerB", s0: 1, f: [[0, 0]], a: { s: 1, t: 0, x: 1, y: NaN, z: 2 } }));
        const lsB = r.state.p2p.peers.get("peerB").lockstep;
        if (lsB && lsB.anchor) nullAlsNull.push("lockstep-anker");
        const statsVorher = r.state.p2p.brokerStats;
        r.state.p2p.brokerStats = null;
        r._p2pMsgStats(draht({ rooms: NaN, peers: 3 }), r.state.p2p);
        if (r.state.p2p.brokerStats) nullAlsNull.push("stats");
        r.state.p2p.brokerStats = statsVorher;
        if (!out.nanPosNotApplied) nullAlsNull.unshift("pos");
        out.drahtNullAlsNull = nullAlsNull;

        // p2pSend ohne open WS liefert false
        r.state.p2p.ws = null;
        out.sendWithoutWsFalse = r.p2pSend({ type: "ping" }) === false;

        // p2pTick ohne enabled → no-op (kein Crash)
        r.state.p2p.enabled = false;
        r.state.p2p.connected = false;
        let tickError = null;
        try {
            r.p2pTick(performance.now());
        } catch (e) {
            tickError = e.message;
        }
        out.tickNoOpSafe = tickError === null;

        // Sandbox-Grenze: KEIN dsl-op namens p2p/sync — fremde Welten dürfen die eigene nicht per DSL-Op
        // manipulieren (V1 trägt kein DSL-Sharing).
        out.noP2PDslOp =
            typeof r.dslEffects.p2p_send === "undefined" &&
            typeof r.dslEffects.peer_dsl === "undefined" &&
            typeof r.dslEffects.remote_run === "undefined";

        // CSP enthält generelle ws:/wss:-Whitelist (statt
        // explizite IP-Liste, die LAN-Spieler blockierte).
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const cspContent = cspMeta ? cspMeta.getAttribute("content") : "";
        out.cspHasWebSocket = / ws: /.test(cspContent) && / wss: /.test(cspContent);
        out.cspKeepsSelf = cspContent.startsWith("default-src 'self';");

        // UI-Elemente vorhanden
        out.uiUrlInputExists = !!document.getElementById("p2p-url");
        out.uiStatusExists = !!document.getElementById("p2p-status");

        // Cleanup
        for (const pid of Array.from(r.state.p2p.peers.keys())) r._p2pRemovePeer(pid);

        return out;
    });
    if (erreichbar(check, "Ring 11 V1: Snapshot erreichbar", ring11Results)) {
        check("Ring 11 V1: state.p2p mit allen Pflichtfeldern", ring11Results.hasP2PState);
        check("Ring 11 V1: initP2PSync ohne worldId wird abgewiesen", ring11Results.rejectsNoRoom);
        check("Ring 11 V1: p2pGenerateId liefert 'p-<ts>-<rnd>'-Format", ring11Results.peerIdShape);
        check("Ring 11 V1: zwei Generator-Aufrufe liefern unterschiedliche IDs", ring11Results.peerIdUnique);
        check("Ring 11 V1: persist + load liefert dieselbe url + enabled", ring11Results.persistRoundTrip);
        check("Ring 11 V1: pos-Nachricht aktualisiert peer-Position", ring11Results.posUpdatesPeer);
        check("Ring 11 V1: peer-leave entfernt peer aus state.p2p.peers", ring11Results.peerLeaveRemoves);
        check("Ring 11 V1: peer-leave entfernt mesh aus der Szene", ring11Results.peerLeaveDisposesMesh);
        check("Ring 11 V1: eigene peerId wird in pos-Nachrichten ignoriert", ring11Results.ownPeerIgnored);
        check(
            "Ring 11 V1: NaN-Koordinate in pos wird verworfen (der null-Fall über den Draht, der Peer bleibt ohne Ort)",
            ring11Results.nanPosNotApplied
        );
        check(
            "Ring 11 V1: kein Leser einer Draht-Zahl liest null als 0 (pos · subworld-pose · creature-pos · Lockstep-Anker · stats)",
            Array.isArray(ring11Results.drahtNullAlsNull) && ring11Results.drahtNullAlsNull.length === 0,
            `${(ring11Results.drahtNullAlsNull || []).length} lasen null als 0: ${(ring11Results.drahtNullAlsNull || []).join(" · ")}`
        );
        check("Ring 11 V1: p2pSend ohne offene WS liefert false", ring11Results.sendWithoutWsFalse);
        check("Ring 11 V1: p2pTick ohne enabled ist no-op (kein Crash)", ring11Results.tickNoOpSafe);
        check("Ring 11 V1: KEIN p2p-/peer_dsl-/remote_run-DSL-Op (Sandbox-Grenze)", ring11Results.noP2PDslOp);
        check("Ring 11 V2.1: CSP enthält allgemeines ws:/wss: (LAN-fähig)", ring11Results.cspHasWebSocket);
        check("Ring 11 V1: CSP bleibt strict (default-src 'self')", ring11Results.cspKeepsSelf);
        check("Ring 11 V1: UI-URL-Input im DOM", ring11Results.uiUrlInputExists);
        check("Ring 11 V1: UI-Status-Anzeige im DOM", ring11Results.uiStatusExists);
    }

    // ### WebRTC-Mesh (Compute-Sharing) ###
    // Signaling ist nur Handshake-Rendezvous; Position/DSL/Soul fließen über RTCDataChannels P2P.
    // Geprüft: Datenstruktur, Mesh-Komplett-Wand (_p2pMeshReady), peerId-Stempelung am Kanal
    // (anti-spoof), Transport-Wechsel in p2pSend, RTC-Handler + CSP; zwei Browser: smoke-webrtc.cjs.
    const w7Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const p2p = r.state.p2p;

        out.w7StateFields =
            p2p.rtcPeers instanceof Map &&
            Array.isArray(p2p.iceServers) &&
            p2p.iceServers.length > 0 &&
            typeof p2p.meshActive === "boolean";

        // sauberer Ausgangszustand
        p2p.peerId = "self-test";
        p2p.ws = null;
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        p2p.rtcPeers.clear();

        // Mesh ist NICHT bereit ohne Peers.
        out.meshNotReadyEmpty = r._p2pMeshReady() === false;

        // Ein Peer ohne offenen RTC-Kanal → Mesh nicht bereit.
        r._p2pEnsurePeerEntry("lonePeer");
        out.meshNotReadyUnconnected = r._p2pMeshReady() === false;

        // RTCPeerConnection: _p2pCreatePeerConnection legt einen
        // Eintrag an (pc + leerer pendingIce-Puffer), _p2pCloseRtcPeer
        // räumt ihn.
        out.rtcAvailable = typeof RTCPeerConnection !== "undefined";
        const rtc = r._p2pCreatePeerConnection("rtcTestPeer");
        out.createPcEntry = !!rtc && !!rtc.pc && rtc.open === false && Array.isArray(rtc.pendingIce);
        out.createPcRegistered = p2p.rtcPeers.has("rtcTestPeer");
        r._p2pCloseRtcPeer("rtcTestPeer");
        out.closePcRemoves = !p2p.rtcPeers.has("rtcTestPeer");

        // Deterministischer Initiator: kleinere peerId offeriert.
        r._p2pConnectToPeer("zzz-peer");
        const initRtc = p2p.rtcPeers.get("zzz-peer");
        out.initiatorMarked = !!initRtc && initRtc.isInitiator === true;
        r._p2pConnectToPeer("aaa-peer");
        const nonInitRtc = p2p.rtcPeers.get("aaa-peer");
        out.nonInitiatorWaits = !!nonInitRtc && nonInitRtc.isInitiator === false;
        r._p2pCloseRtcPeer("zzz-peer");
        r._p2pCloseRtcPeer("aaa-peer");

        // _p2pConnectToPeer ist idempotent.
        r._p2pConnectToPeer("dupPeer");
        const dupCountBefore = p2p.rtcPeers.size;
        r._p2pConnectToPeer("dupPeer");
        out.connectIdempotent = p2p.rtcPeers.size === dupCountBefore;
        r._p2pCloseRtcPeer("dupPeer");

        // Kanal-Empfang: die peerId wird aus der Kanal-Identität
        // gestempelt — anti-spoof.
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        r._p2pHandleChannelMessage(
            "realPeer",
            JSON.stringify({ type: "pos", peerId: "SPOOFED", x: 7, y: 8, z: 9, yaw: 0 })
        );
        const realPeer = p2p.peers.get("realPeer");
        out.channelStampsPeerId = !!realPeer && realPeer.x === 7 && !p2p.peers.has("SPOOFED");

        // Kanal trägt NUR Spiel-Nachrichten — welcome wird verworfen.
        const peersBeforeWelcome = p2p.peers.size;
        r._p2pHandleChannelMessage("realPeer", JSON.stringify({ type: "welcome", peers: ["evilPeer"] }));
        out.channelDropsNonGame = p2p.peers.size === peersBeforeWelcome && !p2p.peers.has("evilPeer");

        // p2pSend-Transport: bei komplettem Mesh geht der Broadcast
        // über den DataChannel, nicht über den WS.
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        p2p.rtcPeers.clear();
        r._p2pEnsurePeerEntry("meshPeer");
        let channelPayload = null;
        p2p.rtcPeers.set("meshPeer", {
            pc: null,
            open: true,
            channel: {
                send: (payload) => {
                    channelPayload = payload;
                },
            },
            isInitiator: false,
            pendingIce: [],
        });
        out.meshReadyWhenOpen = r._p2pMeshReady() === true;
        p2p.ws = null;
        const sendResult = r.p2pSend({ type: "pos", x: 42 });
        out.meshSendUsesChannel = sendResult === true && channelPayload !== null && JSON.parse(channelPayload).x === 42;

        // _p2pUpdateMeshActive spiegelt den Mesh-Zustand.
        r._p2pUpdateMeshActive();
        out.meshActiveTracked = p2p.meshActive === true;

        // rtc-offer-Nachricht legt eine RTCPeerConnection an.
        p2p.rtcPeers.clear();
        r.p2pHandleMessage(
            JSON.stringify({
                type: "rtc-offer",
                peerId: "offerPeer",
                to: "self-test",
                sdp: { type: "offer", sdp: "v=0" },
            })
        );
        out.rtcOfferCreatesPc = p2p.rtcPeers.has("offerPeer");
        r._p2pCloseRtcPeer("offerPeer");

        // shutdownP2PSync räumt alle RTC-Verbindungen.
        r._p2pCreatePeerConnection("shutTestPeer");
        r.shutdownP2PSync();
        out.shutdownClearsRtc = p2p.rtcPeers.size === 0 && p2p.meshActive === false;

        // CSP trägt stun: für die ICE-Server.
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const cspContent = cspMeta ? cspMeta.getAttribute("content") : "";
        out.cspHasStun = / stun: /.test(cspContent);

        // UI-Status zeigt den aktiven Transport (Mesh vs. Relay).
        p2p.enabled = true;
        p2p.connected = true;
        p2p.lastError = null;
        p2p.room = "ui-test-room";
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        r._p2pEnsurePeerEntry("uiPeer");
        p2p.meshActive = true;
        r.p2pUpdateStatus();
        const statusEl = document.getElementById("p2p-status");
        out.uiShowsMesh = !!statusEl && /Mesh p2p/.test(statusEl.textContent);
        p2p.meshActive = false;
        r.p2pUpdateStatus();
        out.uiShowsRelay = !!statusEl && /Server-Relay/.test(statusEl.textContent);

        // Cleanup
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        p2p.rtcPeers.clear();
        p2p.enabled = false;
        p2p.connected = false;
        p2p.meshActive = false;
        p2p.ws = null;

        return out;
    });
    if (erreichbar(check, "W7 Phase 1: Snapshot erreichbar", w7Results)) {
        check("W7 P1: state.p2p trägt rtcPeers/iceServers/meshActive", w7Results.w7StateFields);
        check("W7 P1: _p2pMeshReady false ohne Peers", w7Results.meshNotReadyEmpty);
        check("W7 P1: _p2pMeshReady false bei nicht-verbundenem Peer", w7Results.meshNotReadyUnconnected);
        check("W7 P1: RTCPeerConnection im Headless verfügbar", w7Results.rtcAvailable);
        check("W7 P1: _p2pCreatePeerConnection legt pc + pendingIce-Puffer an", w7Results.createPcEntry);
        check("W7 P1: _p2pCreatePeerConnection registriert in rtcPeers", w7Results.createPcRegistered);
        check("W7 P1: _p2pCloseRtcPeer entfernt den Eintrag", w7Results.closePcRemoves);
        check("W7 P1: kleinere peerId wird Initiator (Glare-frei)", w7Results.initiatorMarked);
        check("W7 P1: grössere peerId wartet auf rtc-offer", w7Results.nonInitiatorWaits);
        check("W7 P1: _p2pConnectToPeer ist idempotent", w7Results.connectIdempotent);
        check(
            "W7 P1: Kanal-Nachricht stempelt peerId aus der Kanal-Identität (anti-spoof)",
            w7Results.channelStampsPeerId
        );
        check("W7 P1: Kanal verwirft Nicht-Spiel-Nachrichten (welcome)", w7Results.channelDropsNonGame);
        check("W7 P1: _p2pMeshReady true bei offenem Kanal", w7Results.meshReadyWhenOpen);
        check("W7 P1: p2pSend nutzt bei komplettem Mesh den DataChannel", w7Results.meshSendUsesChannel);
        check("W7 P1: _p2pUpdateMeshActive spiegelt den Mesh-Zustand", w7Results.meshActiveTracked);
        check("W7 P1: rtc-offer-Nachricht legt eine RTCPeerConnection an", w7Results.rtcOfferCreatesPc);
        check("W7 P1: shutdownP2PSync räumt alle RTC-Verbindungen", w7Results.shutdownClearsRtc);
        check("W7 P1: CSP enthält stun: für die ICE-Server", w7Results.cspHasStun);
        check("W7 P1: UI-Status zeigt 'Mesh p2p' bei aktivem Mesh", w7Results.uiShowsMesh);
        check("W7 P1: UI-Status zeigt 'Server-Relay' bei Fallback", w7Results.uiShowsRelay);
    }

    // ### Welt-Snapshot über das Mesh ###
    // Ein Guest holt die Host-Welt in P2P_WORLD_CHUNK_SIZE-Stücken; Annahme-Wand: nur Stücke vom
    // gepullten Peer + nur bei pending. Geprüft: Reassembly, worldRole im soul-Kanal,
    // _p2pApplyWorldSnapshot, Resync-Fehlerpfade; echter Transfer: smoke-webrtc.cjs.
    const w7p2Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const p2p = r.state.p2p;

        out.w7p2StateFields =
            p2p.worldXfers instanceof Map &&
            p2p.pendingPullFrom === null &&
            Number.isInteger(r.constructor.P2P_WORLD_CHUNK_SIZE) &&
            r.constructor.P2P_WORLD_CHUNK_SIZE > 0;

        // _p2pChunkXferId: nicht-leer + zwei Aufrufe verschieden.
        const x1 = r._p2pChunkXferId();
        const x2 = r._p2pChunkXferId();
        out.xferIdShape = typeof x1 === "string" && x1.length > 4 && x1 !== x2;

        // soul-Broadcast trägt worldRole.
        const sent = [];
        const origSend = r.p2pSend;
        r.p2pSend = (o) => {
            sent.push(o);
            return true;
        };
        p2p.enabled = true;
        r.state.worldMeta.role = "host";
        r._p2pBroadcastSoul();
        out.soulCarriesWorldRole = sent.some((m) => m.type === "soul" && m.worldRole === "host");
        r.p2pSend = origSend;

        // soul-Empfang speichert worldRole am Peer-Eintrag.
        p2p.peerId = "self-test";
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        r.p2pHandleMessage(JSON.stringify({ type: "soul", peerId: "hostPeer", soulName: "human", worldRole: "host" }));
        const hp = p2p.peers.get("hostPeer");
        out.soulStoresWorldRole = !!hp && hp.worldRole === "host";

        // Chunk-Reassembly: ein Test-Snapshot in 3 Stücke geteilt,
        // über _p2pHandleWorldChunk gefüttert → auf Vollständigkeit
        // zusammengesetzt + _p2pApplyWorldSnapshot aufgerufen.
        const testSnap = JSON.stringify({ hello: "w7p2", n: 42, arr: [1, 2, 3, 4, 5] });
        const a = testSnap.slice(0, 10);
        const b = testSnap.slice(10, 22);
        const c = testSnap.slice(22);
        let applied = null;
        const origApply = r._p2pApplyWorldSnapshot;
        r._p2pApplyWorldSnapshot = (senderId, state) => {
            applied = { senderId, state };
            return { ok: true };
        };
        p2p.pendingWorldSnapshot = true;
        p2p.pendingPullFrom = "hostPeer";
        p2p.worldXfers.clear();
        const xid = "x-test-1";
        r._p2pHandleWorldChunk("hostPeer", { type: "world-chunk", xferId: xid, seq: 0, total: 3, data: a });
        out.chunkIncompleteAfterOne = p2p.worldXfers.has(xid) && applied === null;
        r._p2pHandleWorldChunk("hostPeer", { type: "world-chunk", xferId: xid, seq: 2, total: 3, data: c });
        // Duplikat von seq 0 — wird ignoriert, kein Doppel-Zählen.
        r._p2pHandleWorldChunk("hostPeer", { type: "world-chunk", xferId: xid, seq: 0, total: 3, data: a });
        out.chunkDuplicateIgnored = p2p.worldXfers.get(xid).received === 2;
        r._p2pHandleWorldChunk("hostPeer", { type: "world-chunk", xferId: xid, seq: 1, total: 3, data: b });
        out.chunkReassemblyApplies =
            applied !== null &&
            applied.senderId === "hostPeer" &&
            applied.state &&
            applied.state.hello === "w7p2" &&
            applied.state.n === 42;
        out.chunkXferClearedOnComplete = !p2p.worldXfers.has(xid);
        out.lastSnapshotLenTracked = p2p._lastReceivedSnapshotLen === testSnap.length;

        // Annahme-Wand: ein Chunk von einem FREMDEN Peer (nicht
        // pendingPullFrom) wird verworfen.
        p2p.pendingWorldSnapshot = true;
        p2p.pendingPullFrom = "hostPeer";
        p2p.worldXfers.clear();
        r._p2pHandleWorldChunk("evilPeer", {
            type: "world-chunk",
            xferId: "x-evil",
            seq: 0,
            total: 1,
            data: "{}",
        });
        out.chunkRejectsWrongPeer = !p2p.worldXfers.has("x-evil");

        // Annahme-Wand: ein Chunk ohne pendingWorldSnapshot wird
        // verworfen.
        p2p.pendingWorldSnapshot = false;
        p2p.worldXfers.clear();
        r._p2pHandleWorldChunk("hostPeer", {
            type: "world-chunk",
            xferId: "x-nopend",
            seq: 0,
            total: 1,
            data: "{}",
        });
        out.chunkRejectsWhenNotPending = !p2p.worldXfers.has("x-nopend");
        r._p2pApplyWorldSnapshot = origApply;

        // Resync-Fehlerpfade: kein Mesh → no_mesh.
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        p2p.rtcPeers.clear();
        const noMesh = r._p2pRequestWorldResync();
        out.resyncNoMesh = noMesh.ok === false && noMesh.reason === "no_mesh";

        // Mesh steht, aber kein host-Peer → no_host.
        r._p2pEnsurePeerEntry("plainPeer");
        p2p.rtcPeers.set("plainPeer", { pc: null, open: true, channel: {}, pendingIce: [] });
        const noHost = r._p2pRequestWorldResync();
        out.resyncNoHost = noHost.ok === false && noHost.reason === "no_host";

        // _p2pApplyWorldSnapshot geht durch DIE TÜR `_weltBetreten`: ein Snapshot ohne worldId bekommt seine eigene (nie
        // den Platz der Welt der Seite), liegt mit role guest + hostInfo im Speicher, der Aktiv-Zeiger zeigt auf ihn (sonst
        // landet ein Reload in der ALTEN Welt); die Seite lädt ihn nicht in sich. `_testNoReload` hält den Reload an.
        const zeiger0 = r.activeWorldGet();
        const welt0 = r.state.worldMeta.worldId;
        p2p.role = "host";
        p2p._testNoReload = true;
        const applyRes = r._p2pApplyWorldSnapshot("hostX", { worldMeta: {} });
        let abgelegt = null;
        try {
            abgelegt = applyRes.ok ? JSON.parse(localStorage.getItem(r.worldStorageKey(applyRes.worldId))) : null;
        } catch {
            abgelegt = null;
        }
        out.applyExtractedWorks =
            applyRes.ok === true &&
            p2p.role === "guest" &&
            !!abgelegt &&
            abgelegt.worldMeta.role === "guest" &&
            abgelegt.worldMeta.hostInfo.peerId === "hostX";
        out.applySetsActiveWorld =
            !!applyRes.worldId &&
            applyRes.worldId !== welt0 &&
            r.activeWorldGet() === applyRes.worldId &&
            r.state.worldMeta.worldId === welt0;
        if (applyRes.worldId) {
            localStorage.removeItem(r.worldStorageKey(applyRes.worldId));
            r.worldsIndexRemove(applyRes.worldId);
        }
        r.activeWorldSet(zeiger0);

        // die Härtung: Rate-Limit-Datenstruktur + Konstante.
        out.pullCooldownFields =
            p2p._pullServedAt instanceof Map &&
            Number.isInteger(r.constructor.P2P_PULL_COOLDOWN_MS) &&
            r.constructor.P2P_PULL_COOLDOWN_MS > 0;

        // UI: der Resync-Knopf existiert im DOM.
        out.resyncButtonExists = !!document.getElementById("p2p-resync");

        // Cleanup
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        p2p.rtcPeers.clear();
        p2p.worldXfers.clear();
        p2p.pendingWorldSnapshot = false;
        p2p.pendingPullFrom = null;
        p2p._lastXferProgress = null;
        p2p.enabled = false;
        p2p.connected = false;
        p2p.role = "solo";
        p2p._testNoReload = false;
        r.state.worldMeta.role = "solo";

        return out;
    });
    if (erreichbar(check, "W7 Phase 2: Snapshot erreichbar", w7p2Results)) {
        check("W7 P2: state.p2p trägt worldXfers/pendingPullFrom + P2P_WORLD_CHUNK_SIZE", w7p2Results.w7p2StateFields);
        check("W7 P2: _p2pChunkXferId liefert eindeutige IDs", w7p2Results.xferIdShape);
        check("W7 P2: soul-Broadcast trägt worldRole", w7p2Results.soulCarriesWorldRole);
        check("W7 P2: soul-Empfang speichert worldRole am Peer", w7p2Results.soulStoresWorldRole);
        check("W7 P2: ein Stück allein lässt den Transfer unvollständig", w7p2Results.chunkIncompleteAfterOne);
        check("W7 P2: ein doppeltes Stück wird nicht doppelt gezählt", w7p2Results.chunkDuplicateIgnored);
        check("W7 P2: vollständige Stücke werden zusammengesetzt + angewendet", w7p2Results.chunkReassemblyApplies);
        check("W7 P2: der Transfer-Puffer wird nach Abschluss geräumt", w7p2Results.chunkXferClearedOnComplete);
        check("W7 P2: die empfangene Snapshot-Länge wird festgehalten", w7p2Results.lastSnapshotLenTracked);
        check("W7 P2: ein Stück vom falschen Peer wird verworfen", w7p2Results.chunkRejectsWrongPeer);
        check("W7 P2: ein Stück ohne laufenden Pull wird verworfen", w7p2Results.chunkRejectsWhenNotPending);
        check("W7 P2: Resync ohne Mesh → no_mesh", w7p2Results.resyncNoMesh);
        check("W7 P2: Resync ohne host-Peer → no_host", w7p2Results.resyncNoHost);
        check(
            "W7 P2: _p2pApplyWorldSnapshot legt die Host-Welt als Gast ab (role guest + hostInfo)",
            w7p2Results.applyExtractedWorks
        );
        check(
            "W7 P2: _p2pApplyWorldSnapshot gibt einer Welt ohne worldId ihre eigene und setzt den Aktiv-Zeiger (die Seite bleibt)",
            w7p2Results.applySetsActiveWorld
        );
        check("W7 P2: world-pull Rate-Limit-Struktur + Cooldown-Konstante", w7p2Results.pullCooldownFields);
        check("W7 P2: Resync-Knopf im DOM", w7p2Results.resyncButtonExists);
    }
}

async function checkBandW16Distribution({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Mesh-Welt-Verteilung ###
    // Eine vendorte Welt reist P2P (Transport spiegelt den W7-P2-world-pull). Geprüft: Sender,
    // Empfänger, Annahme-Wand, Rate-Limit, kanal-exklusiv; Zwei-Browser-Transfer: smoke-webrtc.cjs.
    const w16Results = await safeEvaluate(page, async () => {
        if (!r) return null;
        const out = {};
        const p2p = r.state.p2p;
        if (!r.state.customWorlds) r.state.customWorlds = {};

        out.stateFields =
            p2p.bundleXfers instanceof Map &&
            p2p.pendingBundlePull === null &&
            p2p._bundleServedAt instanceof Map &&
            Number.isInteger(r.constructor.P2P_BUNDLE_PULL_COOLDOWN_MS) &&
            r.constructor.P2P_BUNDLE_PULL_COOLDOWN_MS > 0;

        // requestWorldBundleFromPeer — Validierungs-Pfade.
        out.rejectsBadId = r.requestWorldBundleFromPeer("Bad ID!", "x").reason === "invalid_world_id";
        r.state.customWorlds["have-w16"] = {
            id: "have-w16",
            label: "Da",
            world: "worlds/have-w16/index.html",
        };
        out.rejectsAlreadyHave = r.requestWorldBundleFromPeer("have-w16", "x").reason === "already_have";
        delete r.state.customWorlds["have-w16"];
        out.rejectsNoPeer = r.requestWorldBundleFromPeer("fresh-w16", "ghost-peer").reason === "no_such_peer";
        r._p2pEnsurePeerEntry("chanless-w16");
        out.rejectsNoChannel = r.requestWorldBundleFromPeer("fresh-w16", "chanless-w16").reason === "no_channel";
        r._p2pRemovePeer("chanless-w16");

        // requestWorldBundleFromPeer — Erfolg: schickt einen
        // world-bundle-pull, setzt pendingBundlePull.
        const sent = [];
        r._p2pEnsurePeerEntry("w16peer");
        p2p.rtcPeers.set("w16peer", {
            pc: null,
            open: true,
            channel: { send: (s) => sent.push(s), readyState: "open", bufferedAmount: 0 },
        });
        const reqRes = r.requestWorldBundleFromPeer("mesh-w16", "w16peer");
        out.requestSendsPull =
            reqRes.ok === true &&
            !!p2p.pendingBundlePull &&
            p2p.pendingBundlePull.peerId === "w16peer" &&
            p2p.pendingBundlePull.worldId === "mesh-w16" &&
            sent.some((s) => {
                try {
                    const m = JSON.parse(s);
                    return m.type === "world-bundle-pull" && m.worldId === "mesh-w16";
                } catch {
                    return false;
                }
            });
        p2p.pendingBundlePull = null;

        // _p2pHandleWorldBundlePull — Sender: ein vendortes Bündel
        // in Stücken senden. _p2pFetchVendorBundle gestubbt.
        const origFetch = r._p2pFetchVendorBundle;
        r._p2pFetchVendorBundle = async () => ({
            ok: true,
            files: [{ path: "index.html", content: "<html><body>w16</body></html>" }],
        });
        r.state.customWorlds["mesh-send-w16"] = {
            id: "mesh-send-w16",
            label: "Sende-Welt",
            desc: "Test",
            dsl: ["sturm"],
            world: "worlds/mesh-send-w16/index.html",
            vendored: true,
            trust: "sandboxed",
        };
        sent.length = 0;
        p2p._bundleServedAt.clear();
        await r._p2pHandleWorldBundlePull("w16peer", {
            type: "world-bundle-pull",
            worldId: "mesh-send-w16",
        });
        out.senderChunks = sent.some((s) => {
            try {
                return JSON.parse(s).type === "world-bundle-chunk";
            } catch {
                return false;
            }
        });
        delete r.state.customWorlds["mesh-send-w16"];

        // _p2pHandleWorldBundlePull — eine unbekannte Welt → fail.
        sent.length = 0;
        p2p._bundleServedAt.clear();
        await r._p2pHandleWorldBundlePull("w16peer", {
            type: "world-bundle-pull",
            worldId: "never-vendored-w16",
        });
        out.senderFailsUnknown = sent.some((s) => {
            try {
                const m = JSON.parse(s);
                return m.type === "world-bundle-fail" && m.reason === "not_found";
            } catch {
                return false;
            }
        });
        r._p2pFetchVendorBundle = origFetch;

        // _p2pHandleWorldBundleChunk — Reassembly: ein Test-Bündel
        // in 3 Stücken; auf Vollständigkeit an vendorWorldBundle.
        const origVendor = r.vendorWorldBundle;
        let vendored = null;
        r.vendorWorldBundle = async (opts) => {
            vendored = opts;
            return { ok: true, id: opts.worldId, label: opts.label };
        };
        const payload = JSON.stringify({
            worldId: "mesh-rx-w16",
            label: "Empfangs-Welt",
            desc: "d",
            dsl: ["ruhe"],
            files: [{ path: "index.html", content: "<html>rx</html>" }],
        });
        const pa = payload.slice(0, 12);
        const pb = payload.slice(12, 28);
        const pc = payload.slice(28);
        p2p.pendingBundlePull = { peerId: "w16peer", worldId: "mesh-rx-w16" };
        p2p.bundleXfers.clear();
        const bxid = "bx-test-1";
        r._p2pHandleWorldBundleChunk("w16peer", {
            type: "world-bundle-chunk",
            xferId: bxid,
            seq: 0,
            total: 3,
            data: pa,
        });
        out.chunkIncompleteAfterOne = p2p.bundleXfers.has(bxid) && vendored === null;
        r._p2pHandleWorldBundleChunk("w16peer", {
            type: "world-bundle-chunk",
            xferId: bxid,
            seq: 2,
            total: 3,
            data: pc,
        });
        r._p2pHandleWorldBundleChunk("w16peer", {
            type: "world-bundle-chunk",
            xferId: bxid,
            seq: 0,
            total: 3,
            data: pa,
        });
        out.chunkDuplicateIgnored = p2p.bundleXfers.get(bxid).received === 2;
        r._p2pHandleWorldBundleChunk("w16peer", {
            type: "world-bundle-chunk",
            xferId: bxid,
            seq: 1,
            total: 3,
            data: pb,
        });
        out.chunkReassemblyVendors =
            vendored !== null &&
            vendored.worldId === "mesh-rx-w16" &&
            Array.isArray(vendored.files) &&
            vendored.files.length === 1;
        out.chunkClearedOnComplete = !p2p.bundleXfers.has(bxid) && p2p.pendingBundlePull === null;

        // Annahme-Wand: ein Stück vom FALSCHEN Peer wird verworfen.
        p2p.pendingBundlePull = { peerId: "w16peer", worldId: "mesh-rx-w16" };
        p2p.bundleXfers.clear();
        r._p2pHandleWorldBundleChunk("evil-peer", {
            type: "world-bundle-chunk",
            xferId: "bx-evil",
            seq: 0,
            total: 1,
            data: "{}",
        });
        out.chunkRejectsWrongPeer = !p2p.bundleXfers.has("bx-evil");

        // Annahme-Wand: ein Stück ohne laufenden Pull wird verworfen.
        p2p.pendingBundlePull = null;
        p2p.bundleXfers.clear();
        r._p2pHandleWorldBundleChunk("w16peer", {
            type: "world-bundle-chunk",
            xferId: "bx-nopend",
            seq: 0,
            total: 1,
            data: "{}",
        });
        out.chunkRejectsWhenNotPending = !p2p.bundleXfers.has("bx-nopend");

        // Eine falsche worldId im Bündel wird verworfen (ein Peer
        // kann keine fremde Welt unter falschem Namen schmuggeln).
        vendored = null;
        p2p.pendingBundlePull = { peerId: "w16peer", worldId: "asked-w16" };
        p2p.bundleXfers.clear();
        const wrongPayload = JSON.stringify({ worldId: "smuggled-w16", files: [] });
        r._p2pHandleWorldBundleChunk("w16peer", {
            type: "world-bundle-chunk",
            xferId: "bx-wrong",
            seq: 0,
            total: 1,
            data: wrongPayload,
        });
        out.chunkRejectsWrongWorldId = vendored === null;
        r.vendorWorldBundle = origVendor;

        // _p2pHandleWorldBundleFail — den laufenden Pull beenden.
        p2p.pendingBundlePull = { peerId: "w16peer", worldId: "fail-w16" };
        r._p2pHandleWorldBundleFail("w16peer", { worldId: "fail-w16", reason: "not_found" });
        out.failEndsPull = p2p.pendingBundlePull === null;

        // world-bundle-pull ist kanal-exklusiv: der WS-Pfad
        // (p2pHandleMessage) dispatcht ihn NICHT, der Kanal-Pfad
        // (_p2pHandleChannelMessage) schon.
        let pullSpy = 0;
        const origPull = r._p2pHandleWorldBundlePull;
        r._p2pHandleWorldBundlePull = () => {
            pullSpy++;
        };
        r.p2pHandleMessage(JSON.stringify({ type: "world-bundle-pull", peerId: "w16peer", worldId: "y" }));
        out.bundlePullNotOnWsPath = pullSpy === 0;
        r._p2pHandleChannelMessage("w16peer", JSON.stringify({ type: "world-bundle-pull", worldId: "y" }));
        out.bundlePullOnChannelPath = pullSpy === 1;
        r._p2pHandleWorldBundlePull = origPull;

        // ### Hash-Verifikation + Pull-Timeout ###
        // requestWorldBundleFromPeer trägt Katalog-Hash + startedAt im pendingBundlePull (Hash-Prüfung nach
        // dem Pull + weicher Timeout).
        sent.length = 0;
        const beforeReq = Date.now();
        const polRes = r.requestWorldBundleFromPeer("polish-w16", "w16peer", "ABCDEF123");
        out.pullCarriesHash =
            polRes.ok === true &&
            !!p2p.pendingBundlePull &&
            p2p.pendingBundlePull.expectedHash === "abcdef123" &&
            typeof p2p.pendingBundlePull.startedAt === "number" &&
            p2p.pendingBundlePull.startedAt >= beforeReq;
        // Ein ungültiger Hash wird zu "" normalisiert (kein Schmuggel).
        p2p.pendingBundlePull = null;
        r.requestWorldBundleFromPeer("polish2-w16", "w16peer", "kein hash!");
        out.pullRejectsBadHash = !!p2p.pendingBundlePull && p2p.pendingBundlePull.expectedHash === "";
        p2p.pendingBundlePull = null;
        // _p2pCheckBundlePullTimeout — ein frischer Pull bleibt.
        p2p.pendingBundlePull = {
            peerId: "w16peer",
            worldId: "tmo-w16",
            expectedHash: "",
            startedAt: Date.now(),
        };
        r._p2pCheckBundlePullTimeout(Date.now());
        out.timeoutKeepsFresh = p2p.pendingBundlePull !== null;
        // Ein alter Pull wird geräumt — samt der Teil-Puffer dieses
        // Peers (die eines anderen Peers bleiben unberührt).
        p2p.bundleXfers.set("bx-tmo", {
            from: "w16peer",
            total: 3,
            parts: [null, null, null],
            received: 1,
        });
        p2p.bundleXfers.set("bx-other", { from: "other-peer", total: 1, parts: [null], received: 0 });
        p2p.pendingBundlePull = {
            peerId: "w16peer",
            worldId: "tmo-w16",
            expectedHash: "",
            startedAt: Date.now() - 99999,
        };
        r._p2pCheckBundlePullTimeout(Date.now());
        out.timeoutClearsStale = p2p.pendingBundlePull === null;
        out.timeoutClearsPeerXfers = !p2p.bundleXfers.has("bx-tmo") && p2p.bundleXfers.has("bx-other");
        p2p.bundleXfers.clear();
        // _meshWorldReasonText kennt timeout + hash_mismatch.
        out.reasonTextHasPolish =
            /Zeit/.test(r._meshWorldReasonText("timeout")) && /Katalog/.test(r._meshWorldReasonText("hash_mismatch"));
        out.bundleTimeoutConst =
            typeof AnazhRealm.P2P_BUNDLE_PULL_TIMEOUT_MS === "number" && AnazhRealm.P2P_BUNDLE_PULL_TIMEOUT_MS > 0;
        // vendorWorldBundle reicht den save-server-Content-Hash durch.
        const origPostBundle = r._vendorPostBundle;
        r._vendorPostBundle = async () => ({ ok: true, fileCount: 1, bundleHash: "deadbeef" });
        const vwbRes = await r.vendorWorldBundle({
            worldId: "hashpass-w16",
            label: "Hash-Pass",
            files: [{ path: "index.html", content: "<html></html>" }],
        });
        r._vendorPostBundle = origPostBundle;
        out.vendorReturnsHash = !!vwbRes && vwbRes.ok === true && vwbRes.bundleHash === "deadbeef";

        // ### der Welt-Katalog ###
        // _p2pBuildCatalog — nur vendored-Welten (eine importierte
        // Manifest-Welt hat kein teilbares Bündel).
        r.state.customWorlds["cat-vendored-w16"] = {
            id: "cat-vendored-w16",
            label: "Katalog-Welt",
            world: "worlds/cat-vendored-w16/index.html",
            vendored: true,
            trust: "sandboxed",
            bundleHash: "abc123",
        };
        r.state.customWorlds["cat-imported-w16"] = {
            id: "cat-imported-w16",
            label: "Importiert",
            world: "worlds/cat-imported-w16/index.html",
        };
        const cat = r._p2pBuildCatalog();
        out.catalogBuildsVendoredOnly =
            cat.some((c) => c.id === "cat-vendored-w16" && c.label === "Katalog-Welt" && c.hash === "abc123") &&
            !cat.some((c) => c.id === "cat-imported-w16");

        // _p2pSanitizeCatalog — gültige Einträge bleiben, Müll fällt raus.
        const sanCat = r._p2pSanitizeCatalog([
            { id: "good-w16", label: "Gut", hash: "deadbeef" },
            { id: "BAD ID!", label: "x" },
            { label: "kein-id" },
            "string-müll",
        ]);
        out.catalogSanitizes = sanCat.length === 1 && sanCat[0].id === "good-w16" && sanCat[0].hash === "deadbeef";

        // _haveWorldByHashOrId — per id ODER per Content-Hash.
        out.haveById = r._haveWorldByHashOrId("cat-vendored-w16", "") === true;
        out.haveByHash = r._haveWorldByHashOrId("other-id-w16", "abc123") === true;
        out.haveFalseUnknown = r._haveWorldByHashOrId("ghost-w16", "nope") === false;

        // _p2pBroadcastSoul trägt den Katalog mit.
        let soulMsg = null;
        const origSend = r.p2pSend;
        r.p2pSend = (m) => {
            if (m && m.type === "soul") soulMsg = m;
        };
        p2p.enabled = true;
        r._p2pBroadcastSoul();
        out.soulCarriesCatalog =
            !!soulMsg && Array.isArray(soulMsg.catalog) && soulMsg.catalog.some((c) => c.id === "cat-vendored-w16");

        // _vendorRegisterWorld annonciert den Katalog neu (re-broadcast).
        soulMsg = null;
        r._vendorRegisterWorld("reg-broadcast-w16", { label: "Reg", bundleHash: "cafe11" });
        out.registerRebroadcastsSoul =
            !!soulMsg &&
            Array.isArray(soulMsg.catalog) &&
            soulMsg.catalog.some((c) => c.id === "reg-broadcast-w16" && c.hash === "cafe11");
        r.p2pSend = origSend;
        p2p.enabled = false;
        delete r.state.customWorlds["reg-broadcast-w16"];

        // Der soul-Handler speichert den Katalog am Peer-Eintrag.
        r._p2pEnsurePeerEntry("cat-peer-w16");
        r.p2pHandleMessage(
            JSON.stringify({
                type: "soul",
                peerId: "cat-peer-w16",
                soulName: "human",
                catalog: [{ id: "peer-world-w16", label: "Peer-Welt", hash: "feed00" }],
            })
        );
        const catPeer = p2p.peers.get("cat-peer-w16");
        out.soulHandlerStoresCatalog =
            !!catPeer &&
            Array.isArray(catPeer.catalog) &&
            catPeer.catalog.some((c) => c.id === "peer-world-w16" && c.hash === "feed00");

        // _sanitizeImportedManifest bewahrt bundleHash + überlebt
        // den localStorage-Rundlauf.
        const sanM = r._sanitizeImportedManifest({
            id: "hash-rt-w16",
            label: "Hash-RT",
            world: "worlds/hash-rt-w16/index.html",
            vendored: true,
            bundleHash: "ABCDEF0123",
        });
        out.sanitizeKeepsHash = !!sanM && sanM.bundleHash === "abcdef0123";
        r.state.customWorlds["hash-rt-w16"] = sanM;
        r._saveCustomWorlds();
        const reloaded = r._loadCustomWorlds();
        out.hashSurvivesRoundtrip = !!reloaded["hash-rt-w16"] && reloaded["hash-rt-w16"].bundleHash === "abcdef0123";

        // _renderMeshWorldCatalog — Holen-Knopf für eine fremde
        // Welt, „✓ vorhanden"-Marke für eine, die ich schon habe.
        const catHost = document.getElementById("mesh-world-catalog");
        if (catHost) catHost.dataset.sig = "";
        catPeer.catalog = [
            { id: "peer-world-w16", label: "Peer-Welt", hash: "feed00" },
            { id: "cat-vendored-w16", label: "Schon da", hash: "abc123" },
        ];
        r._renderMeshWorldCatalog();
        out.catalogRendersGetButton =
            !!catHost && catHost.querySelector('button[data-mesh-world="peer-world-w16"]') !== null;
        out.catalogRendersHaveBadge =
            !!catHost &&
            catHost.querySelector(".mesh-catalog-have") !== null &&
            catHost.querySelector('button[data-mesh-world="cat-vendored-w16"]') === null;

        // _runMeshWorldGet routet zu requestWorldBundleFromPeer.
        let routed = null;
        const origReq = r.requestWorldBundleFromPeer;
        r.requestWorldBundleFromPeer = (wid, pid) => {
            routed = { wid, pid };
            return { ok: false, reason: "no_channel" };
        };
        r._runMeshWorldGet("route-w16", "route-peer-w16");
        out.runMeshWorldGetRoutes = !!routed && routed.wid === "route-w16" && routed.pid === "route-peer-w16";
        r.requestWorldBundleFromPeer = origReq;

        // Der Holen-Knopf: ein ECHTER Klick routet durch den delegierten Listener (meshWorldInitDOM) zur
        // Transport-Methode — der ganze Spieler-Pfad render→klick→holen.
        let clickRouted = null;
        const origReqClick = r.requestWorldBundleFromPeer;
        r.requestWorldBundleFromPeer = (wid, pid) => {
            clickRouted = { wid, pid };
            return { ok: false, reason: "no_channel" };
        };
        const getBtn = catHost && catHost.querySelector('button[data-mesh-world="peer-world-w16"]');
        if (getBtn) getBtn.click();
        out.catalogButtonClickRoutes =
            !!clickRouted && clickRouted.wid === "peer-world-w16" && clickRouted.pid === "cat-peer-w16";
        r.requestWorldBundleFromPeer = origReqClick;

        // UI: die Welt-Katalog-Sektion im DOM.

        // Cleanup
        r._p2pRemovePeer("w16peer");
        r._p2pRemovePeer("cat-peer-w16");
        p2p.rtcPeers.clear();
        p2p.bundleXfers.clear();
        p2p.pendingBundlePull = null;
        p2p._bundleServedAt.clear();
        delete r.state.customWorlds["mesh-send-w16"];
        delete r.state.customWorlds["have-w16"];
        delete r.state.customWorlds["cat-vendored-w16"];
        delete r.state.customWorlds["cat-imported-w16"];
        delete r.state.customWorlds["hash-rt-w16"];
        delete r.state.customWorlds["hashpass-w16"];
        // localStorage von den Test-Welten säubern (der Rundlauf-
        // Test hat sie via _saveCustomWorlds geschrieben).
        r._saveCustomWorlds();

        return out;
    });
    if (erreichbar(check, "W16 Phase 1: Mesh-Welt-Verteilung erreichbar", w16Results)) {
        check(
            "W16: state.p2p trägt bundleXfers/pendingBundlePull + P2P_BUNDLE_PULL_COOLDOWN_MS",
            w16Results.stateFields
        );
        check("W16: requestWorldBundleFromPeer lehnt eine ungültige Welt-id ab", w16Results.rejectsBadId);
        check("W16: requestWorldBundleFromPeer lehnt eine schon vorhandene Welt ab", w16Results.rejectsAlreadyHave);
        check("W16: requestWorldBundleFromPeer lehnt einen unbekannten Peer ab", w16Results.rejectsNoPeer);
        check("W16: requestWorldBundleFromPeer lehnt einen Peer ohne Mesh-Kanal ab", w16Results.rejectsNoChannel);
        check(
            "W16: requestWorldBundleFromPeer schickt einen world-bundle-pull + setzt pendingBundlePull",
            w16Results.requestSendsPull
        );
        check("W16: _p2pHandleWorldBundlePull schickt ein vendortes Bündel in Stücken", w16Results.senderChunks);
        check(
            "W16: _p2pHandleWorldBundlePull schickt world-bundle-fail für eine unbekannte Welt",
            w16Results.senderFailsUnknown
        );
        check("W16: ein Bündel-Stück allein lässt den Transfer unvollständig", w16Results.chunkIncompleteAfterOne);
        check("W16: ein doppeltes Bündel-Stück wird nicht doppelt gezählt", w16Results.chunkDuplicateIgnored);
        check(
            "W16: vollständige Stücke werden zusammengesetzt + an vendorWorldBundle gereicht",
            w16Results.chunkReassemblyVendors
        );
        check(
            "W16: der Bündel-Puffer + pendingBundlePull werden nach Abschluss geräumt",
            w16Results.chunkClearedOnComplete
        );
        check("W16: ein Stück vom falschen Peer wird verworfen", w16Results.chunkRejectsWrongPeer);
        check("W16: ein Stück ohne laufenden Pull wird verworfen", w16Results.chunkRejectsWhenNotPending);
        check(
            "W16: eine falsche worldId im Bündel wird verworfen (kein vendorWorldBundle)",
            w16Results.chunkRejectsWrongWorldId
        );
        check("W16: _p2pHandleWorldBundleFail beendet den laufenden Pull", w16Results.failEndsPull);
        check(
            "W16: world-bundle-pull ist kanal-exklusiv (nicht über den WS-Pfad)",
            w16Results.bundlePullNotOnWsPath && w16Results.bundlePullOnChannelPath
        );
        // ── Hash-Verifikation + Pull-Timeout ──
        check(
            "W16-Politur: requestWorldBundleFromPeer trägt Katalog-Hash + startedAt im pendingBundlePull",
            w16Results.pullCarriesHash
        );
        check("W16-Politur: ein ungültiger Katalog-Hash wird zu '' normalisiert", w16Results.pullRejectsBadHash);
        check("W16-Politur: _p2pCheckBundlePullTimeout lässt einen frischen Pull stehen", w16Results.timeoutKeepsFresh);
        check("W16-Politur: _p2pCheckBundlePullTimeout räumt einen hängenden Pull", w16Results.timeoutClearsStale);
        check(
            "W16-Politur: der Timeout räumt die Teil-Puffer des Peers (fremde bleiben)",
            w16Results.timeoutClearsPeerXfers
        );
        check("W16-Politur: _meshWorldReasonText kennt timeout + hash_mismatch", w16Results.reasonTextHasPolish);
        check("W16-Politur: P2P_BUNDLE_PULL_TIMEOUT_MS definiert", w16Results.bundleTimeoutConst);
        check("W16-Politur: vendorWorldBundle reicht den save-server-Content-Hash durch", w16Results.vendorReturnsHash);
        // ── der Welt-Katalog ──
        check(
            "W16 P2: _p2pBuildCatalog liefert nur vendored-Welten (id/label/hash)",
            w16Results.catalogBuildsVendoredOnly
        );
        check("W16 P2: _p2pSanitizeCatalog behält gültige Einträge + verwirft Müll", w16Results.catalogSanitizes);
        check("W16 P2: _haveWorldByHashOrId erkennt eine Welt per id", w16Results.haveById);
        check("W16 P2: _haveWorldByHashOrId erkennt eine Welt per Content-Hash (andere id)", w16Results.haveByHash);
        check("W16 P2: _haveWorldByHashOrId liefert false für eine unbekannte Welt", w16Results.haveFalseUnknown);
        check("W16 P2: _p2pBroadcastSoul trägt den Welt-Katalog mit", w16Results.soulCarriesCatalog);
        check(
            "W16 P2: _vendorRegisterWorld annonciert den Katalog neu (soul-Re-Broadcast)",
            w16Results.registerRebroadcastsSoul
        );
        check("W16 P2: der soul-Handler speichert den Katalog eines Peers", w16Results.soulHandlerStoresCatalog);
        check(
            "W16 P2: _sanitizeImportedManifest bewahrt bundleHash für eine vendorte Welt",
            w16Results.sanitizeKeepsHash
        );
        check("W16 P2: bundleHash überlebt den localStorage-Rundlauf", w16Results.hashSurvivesRoundtrip);
        check(
            "W16 P2: _renderMeshWorldCatalog rendert einen Holen-Knopf für eine fremde Welt",
            w16Results.catalogRendersGetButton
        );
        check(
            'W16 P2: _renderMeshWorldCatalog zeigt „✓ vorhanden" für eine schon vorhandene Welt (Dedup)',
            w16Results.catalogRendersHaveBadge
        );
        check("W16 P2: _runMeshWorldGet routet zu requestWorldBundleFromPeer", w16Results.runMeshWorldGetRoutes);
        check(
            "W16 P2: ein Klick auf den Holen-Knopf routet durch den delegierten Listener (Spieler-Pfad)",
            w16Results.catalogButtonClickRoutes
        );
    }
}

async function checkBandLateMultiUser({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Multi-User-Bau-Sync — Strukturen synchron platzieren + abbauen ###
    // confirmBuild + tryMouseBreak broadcasten; eine geteilte string-archId macht Spieler-Bauten
    // peer-übergreifend identifizierbar. Geprüft: opts.id, spawn_blueprint mit archId + Idempotenz,
    // remove_architecture, Persistenz; das Setzen beim echten Mitspieler: gate:nervensystem E2 (P2P).
    const buildSyncResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        out.newArchIdUnique = typeof r._newArchId() === "string" && r._newArchId() !== r._newArchId();

        // spawnArchitecture mit opts.id → string-id; ohne → numerisch.
        const eShared = r.spawnArchitecture("stein_block", { x: 12, y: 4, z: 12 }, { id: "a-unit-1" });
        out.spawnAcceptsStringId = !!eShared && eShared.id === "a-unit-1";
        const eLocal = r.spawnArchitecture("stein_block", { x: 14, y: 4, z: 14 }, {});
        out.spawnDefaultNumericId = !!eLocal && typeof eLocal.id === "number";

        // spawn_blueprint-Op mit archId.
        r.dslRun(["spawn_blueprint", "stein_block", ["at", 20, 4, 20], 0, "a-unit-2"], { source: "test" });
        // Idempotenz: zweiter Lauf mit derselben id → kein zweiter Spawn.
        const before = r.state.architectures.filter((a) => a && a.id === "a-unit-2").length;
        r.dslRun(["spawn_blueprint", "stein_block", ["at", 21, 4, 21], 0, "a-unit-2"], { source: "test" });
        const after = r.state.architectures.filter((a) => a && a.id === "a-unit-2").length;
        out.spawnBlueprintIdempotent = before === 1 && after === 1;

        // Unbekannte id / eine Zahl-Id vom Mitspieler (jeder Peer zählt selbst) → kein Crash, keine Entfernung; der Abbau per
        // Zahl- und String-Id: gate:weltakt-wache (K).
        const cnt = r.state.architectures.length;
        r.dslRun(["remove_architecture", "a-does-not-exist"], { source: "test" });
        r.dslRun(["remove_architecture", eLocal.id], { source: "remote:peer-unit" });
        out.removeArchitectureSafe = r.state.architectures.length === cnt;

        // describeProgram kennt remove_architecture.
        out.describeRemove = /ab/i.test(r.describeProgram(["remove_architecture", "a-x"]) || "");

        // spawn_blueprint + remove_architecture MÜSSEN broadcasten
        // (nicht in NON_BROADCASTABLE_OPS).
        const nb = window.AnazhRealm ? window.AnazhRealm.NON_BROADCASTABLE_OPS : r.constructor.NON_BROADCASTABLE_OPS;
        out.opsAreBroadcastable = !nb.has("spawn_blueprint") && !nb.has("remove_architecture");

        // Persistenz: buildStateSnapshot trägt die arch-id.
        const snap = r.buildStateSnapshot();
        out.snapshotKeepsArchId =
            Array.isArray(snap.architectures) && snap.architectures.some((a) => a && a.id === "a-unit-1");

        return out;
    });
    if (erreichbar(check, "Multi-User-Bau-Sync: Snapshot erreichbar", buildSyncResults)) {
        check("Bau-Sync: _newArchId liefert eindeutige string-ids", buildSyncResults.newArchIdUnique);
        check("Bau-Sync: spawnArchitecture nimmt eine geteilte string-id", buildSyncResults.spawnAcceptsStringId);
        check(
            "Bau-Sync: spawnArchitecture ohne id bleibt numerisch (Worldgen)",
            buildSyncResults.spawnDefaultNumericId
        );
        check(
            "Bau-Sync: spawn_blueprint ist idempotent (kein Doppel-Spawn)",
            buildSyncResults.spawnBlueprintIdempotent
        );
        check(
            "Bau-Sync: remove_architecture ist defensiv (unbekannt; Zahl-Id vom Mitspieler)",
            buildSyncResults.removeArchitectureSafe
        );
        check("Bau-Sync: describeProgram kennt remove_architecture", buildSyncResults.describeRemove);
        check("Bau-Sync: spawn_blueprint + remove_architecture broadcasten", buildSyncResults.opsAreBroadcastable);
        check("Bau-Sync: buildStateSnapshot persistiert die arch-id", buildSyncResults.snapshotKeepsArchId);
    }

    // ### LLM-Pool: eine Stimme über das Mesh teilen ###
    // Ein Peer mit aktivem LLM teilt seine Stimme, ein schlüsselloser routet Chat darüber. Sicherheit:
    // Opt-in (voiceShared), Rate-Limit, dslRun-Sandbox für das Antwort-Programm; Annahme-Wand
    // not_sharing/rate_limited/wrong-peer.
    const w7p3Results = await safeEvaluate(page, async () => {
        if (!r) return null;
        const out = {};
        const p2p = r.state.p2p;
        const K = r.constructor;

        out.stateFields =
            p2p.voiceShared === false &&
            p2p._voiceServedAt instanceof Map &&
            p2p._voiceRequests instanceof Map &&
            Number.isInteger(K.P2P_VOICE_COOLDOWN_MS) &&
            Number.isInteger(K.P2P_VOICE_TIMEOUT_MS) &&
            Number.isInteger(K.P2P_VOICE_PROMPT_MAX);

        // Capability-Gate: ohne aktives LLM kann ich nicht teilen.
        const wasEnabled = r.state.llm.enabled;
        r.state.llm.enabled = false;
        out.setVoiceSharedGated = r.setVoiceShared(true) === false && p2p.voiceShared === false;
        r.state.llm.enabled = wasEnabled;

        // soul-Broadcast trägt voiceShared; soul-Empfang speichert es.
        const sent = [];
        const origSend = r.p2pSend;
        r.p2pSend = (o) => {
            sent.push(o);
            return true;
        };
        p2p.enabled = true;
        p2p.voiceShared = true;
        r._p2pBroadcastSoul();
        out.soulCarriesVoiceShared = sent.some((m) => m.type === "soul" && m.voiceShared === true);
        r.p2pSend = origSend;
        p2p.voiceShared = false;

        p2p.peerId = "self-w7p3";
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        r.p2pHandleMessage(JSON.stringify({ type: "soul", peerId: "voicePeer", soulName: "human", voiceShared: true }));
        const vp = p2p.peers.get("voicePeer");
        out.soulStoresVoiceShared = !!vp && vp.voiceShared === true;

        // _p2pFindVoicePeer findet den teilenden Peer mit offenem Kanal.
        p2p.rtcPeers.set("voicePeer", { pc: null, open: true, channel: {}, pendingIce: [] });
        out.findVoicePeer = r._p2pFindVoicePeer() === "voicePeer";

        // Stub _p2pVoiceCapable → true, _p2pSendChannelTo → capture,
        // llmCall → fester Reply. So lässt sich der Teiler-Pfad prüfen
        // ohne echtes LLM.
        const origCapable = r._p2pVoiceCapable;
        const origSendCh = r._p2pSendChannelTo;
        const origLlm = r.llmCall;
        const chSent = [];
        r._p2pVoiceCapable = () => true;
        r._p2pSendChannelTo = (pid, obj) => {
            chSent.push({ pid, obj });
            return true;
        };
        r.llmCall = async () => ({ say: "geteilte Antwort", program: null });

        // Teiler-Pfad: voiceShared an → eine Anfrage wird beantwortet.
        p2p.voiceShared = true;
        p2p._voiceServedAt.clear();
        await r._p2pHandleLlmRequest("askPeer", { reqId: "rq-1", prompt: "hallo" });
        const resp1 = chSent.find((c) => c.obj && c.obj.reqId === "rq-1");
        out.requestServed = !!resp1 && resp1.obj.type === "llm-response" && resp1.obj.say === "geteilte Antwort";

        // Rate-Limit: zweite Anfrage sofort danach → rate_limited.
        await r._p2pHandleLlmRequest("askPeer", { reqId: "rq-2", prompt: "nochmal" });
        const resp2 = chSent.find((c) => c.obj && c.obj.reqId === "rq-2");
        out.rateLimited = !!resp2 && resp2.obj.error === "rate_limited";

        // Opt-in-Wand: voiceShared aus → not_sharing.
        p2p.voiceShared = false;
        await r._p2pHandleLlmRequest("askPeer", { reqId: "rq-3", prompt: "x" });
        const resp3 = chSent.find((c) => c.obj && c.obj.reqId === "rq-3");
        out.notSharingWall = !!resp3 && resp3.obj.error === "not_sharing";

        // Leerer Prompt → empty_prompt.
        p2p.voiceShared = true;
        p2p._voiceServedAt.clear();
        await r._p2pHandleLlmRequest("askPeer2", { reqId: "rq-4", prompt: "" });
        const resp4 = chSent.find((c) => c.obj && c.obj.reqId === "rq-4");
        out.emptyPromptRejected = !!resp4 && resp4.obj.error === "empty_prompt";

        r._p2pVoiceCapable = origCapable;
        r._p2pSendChannelTo = origSendCh;
        r.llmCall = origLlm;
        p2p.voiceShared = false;

        // Anfrager-Pfad: _p2pHandleLlmResponse matched eine offene
        // Anfrage + ruft den Callback.
        let cbText = null;
        p2p._voiceRequests.set("rq-resp", { cb: (t) => (cbText = t), timeout: null, peerId: "voicePeer" });
        r._p2pHandleLlmResponse("voicePeer", { reqId: "rq-resp", say: "hallo zurück" });
        out.responseDelivered = cbText === "Geteilte Stimme: hallo zurück";
        out.responseConsumed = !p2p._voiceRequests.has("rq-resp");

        // Annahme-Wand: eine Antwort vom FALSCHEN Peer wird verworfen.
        let cbText2 = null;
        p2p._voiceRequests.set("rq-w", { cb: (t) => (cbText2 = t), timeout: null, peerId: "voicePeer" });
        r._p2pHandleLlmResponse("evilPeer", { reqId: "rq-w", say: "böse" });
        out.wrongPeerRejected = cbText2 === null && p2p._voiceRequests.has("rq-w");
        p2p._voiceRequests.delete("rq-w");

        // Das Antwort-Programm läuft durch dslRun (Sandbox).
        const weatherBefore = r.state.weather;
        p2p._voiceRequests.set("rq-prog", { cb: () => {}, timeout: null, peerId: "voicePeer" });
        r._p2pHandleLlmResponse("voicePeer", { reqId: "rq-prog", say: "", program: ["weather", "rainy"] });
        out.programRanInSandbox = r.state.weather === "rainy";
        r.dslRun(["weather", weatherBefore || "sunny"], { source: "test" });

        // _p2pRequestSharedVoice ohne Voice-Peer → no_voice.
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        p2p.rtcPeers.clear();
        const noVoice = r._p2pRequestSharedVoice("frage", null);
        out.requestNoVoice = noVoice.ok === false && noVoice.reason === "no_voice";

        // llm-request über _p2pHandleChannelMessage erreicht den Handler
        // (kanal-exklusiv, nicht von der Spiel-Whitelist verworfen).
        let handlerHit = false;
        const origReq = r._p2pHandleLlmRequest;
        r._p2pHandleLlmRequest = () => {
            handlerHit = true;
        };
        r._p2pHandleChannelMessage("chPeer", JSON.stringify({ type: "llm-request", reqId: "c1", prompt: "x" }));
        out.channelRoutesLlmRequest = handlerHit === true;
        r._p2pHandleLlmRequest = origReq;

        out.voiceButtonExists = !!document.getElementById("p2p-voice-share");

        // Cleanup
        for (const pid of Array.from(p2p.peers.keys())) r._p2pRemovePeer(pid);
        p2p.rtcPeers.clear();
        p2p._voiceRequests.clear();
        p2p._voiceServedAt.clear();
        p2p.voiceShared = false;
        p2p.enabled = false;

        return out;
    });
    if (erreichbar(check, "W7 Phase 3: Snapshot erreichbar", w7p3Results)) {
        check("W7 P3: state.p2p trägt voiceShared + Voice-Maps + Konstanten", w7p3Results.stateFields);
        check("W7 P3: setVoiceShared ohne aktives LLM bleibt false (Capability-Gate)", w7p3Results.setVoiceSharedGated);
        check("W7 P3: soul-Broadcast trägt voiceShared", w7p3Results.soulCarriesVoiceShared);
        check("W7 P3: soul-Empfang speichert voiceShared am Peer", w7p3Results.soulStoresVoiceShared);
        check("W7 P3: _p2pFindVoicePeer findet den teilenden Peer", w7p3Results.findVoicePeer);
        check("W7 P3: eine Anfrage an einen Teiler wird beantwortet", w7p3Results.requestServed);
        check("W7 P3: eine zweite Anfrage sofort danach → rate_limited", w7p3Results.rateLimited);
        check("W7 P3: Anfrage an einen Nicht-Teiler → not_sharing (Opt-in-Wand)", w7p3Results.notSharingWall);
        check("W7 P3: leerer Prompt → empty_prompt", w7p3Results.emptyPromptRejected);
        check("W7 P3: die Antwort erreicht den Anfrager-Callback", w7p3Results.responseDelivered);
        check("W7 P3: die beantwortete Anfrage wird aus dem Puffer geräumt", w7p3Results.responseConsumed);
        check("W7 P3: eine Antwort vom falschen Peer wird verworfen", w7p3Results.wrongPeerRejected);
        check("W7 P3: das Antwort-Programm läuft durch die dslRun-Sandbox", w7p3Results.programRanInSandbox);
        check("W7 P3: _p2pRequestSharedVoice ohne Voice-Peer → no_voice", w7p3Results.requestNoVoice);
        check("W7 P3: llm-request ist kanal-exklusiv (erreicht den Handler)", w7p3Results.channelRoutesLlmRequest);
        check("W7 P3: 'Stimme teilen'-Knopf im DOM", w7p3Results.voiceButtonExists);
    }

    // ### Public-Lobby + Kreatur-Sicht-Sync ###
    // Lobby: lobby-publish/list/join. Jeder Peer streamt SEINE Kreaturen; Mitspieler rendern sie als
    // Sicht-Schicht (remoteCreatures, NICHT in state.creatures).
    const w7p4Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const p2p = r.state.p2p;

        // ── Lobby ──
        out.lobbyState =
            !!p2p.lobby &&
            p2p.lobby.published === false &&
            Array.isArray(p2p.lobby.rooms) &&
            p2p.remoteCreatures instanceof Map;

        // publishToLobby ohne Verbindung → not_connected.
        p2p.enabled = false;
        p2p.connected = false;
        out.publishNeedsConnection = r.publishToLobby("Testraum").reason === "not_connected";

        // Mit Verbindung: _p2pSignal stubben + Nachrichten fangen.
        const signals = [];
        const origSignal = r._p2pSignal;
        r._p2pSignal = (o) => signals.push(o);
        p2p.enabled = true;
        p2p.connected = true;
        const pubRes = r.publishToLobby("Mein Raum");
        out.publishSends =
            pubRes.ok === true &&
            p2p.lobby.published === true &&
            signals.some((s) => s.type === "lobby-publish" && s.label === "Mein Raum");
        r.unpublishFromLobby();
        out.unpublishSends = p2p.lobby.published === false && signals.some((s) => s.type === "lobby-unpublish");
        r.requestLobbyList();
        out.listRequestSends = signals.some((s) => s.type === "lobby-list");
        r._p2pSignal = origSignal;

        // lobby-rooms-Nachricht → Liste gespeichert + gerendert.
        r.p2pHandleMessage(
            JSON.stringify({
                type: "lobby-rooms",
                rooms: [{ room: "raum-xyz", label: "Anazhs Welt", peers: 3 }],
            })
        );
        out.lobbyRoomsStored = p2p.lobby.rooms.length === 1 && p2p.lobby.rooms[0].room === "raum-xyz";
        const listEl = document.getElementById("p2p-lobby-list");
        out.lobbyRendered = !!listEl && !!listEl.querySelector("button[data-lobby-room='raum-xyz']");

        // joinLobbyRoom setzt roomOverride.
        const joinRes = r.joinLobbyRoom("raum-xyz");
        out.joinSetsOverride = joinRes.ok === true && p2p.roomOverride === "raum-xyz";
        out.joinSameRejected = r.joinLobbyRoom("raum-xyz").reason === "already_here";

        // ── Kreatur-Sicht-Sync ──
        // spawnCreatureAt vergibt eine netId. Cap-Headroom sichern (Warmup nahe maxCreatures → null →
        // flaky); gemessen wird die netId/Broadcast-Mechanik, nicht der Cap.
        const _saveMaxNet = r.state.maxCreatures;
        r.state.maxCreatures = r.state.creatures.length + 1;
        // BÜHNE: netId/Broadcast-Mechanik, der Ort trägt nichts
        const testC = r.spawnCreatureAt(20, 6, 20, "happy");
        r.state.maxCreatures = _saveMaxNet;
        out.creatureHasNetId = !!testC && typeof testC.userData.netId === "string" && testC.userData.netId.length > 0;

        // _p2pBroadcastCreatures sendet creature-pos. state.creatures temporär = [testC]: der Broadcast hat
        // einen 40er-Cap, die Worldgen-Varianz schöbe testC über Index 40 → still ausgeschlossen (flaky).
        const csent = [];
        const origSend2 = r.p2pSend;
        r.p2pSend = (o) => csent.push(o);
        const origCreatures = r.state.creatures;
        r.state.creatures = [testC];
        r._p2pBroadcastCreatures();
        r.state.creatures = origCreatures;
        const cmsg = csent.find((m) => m.type === "creature-pos");
        out.broadcastSendsCreatures =
            !!cmsg && Array.isArray(cmsg.list) && cmsg.list.some((e) => e.id === testC.userData.netId);
        r.p2pSend = origSend2;

        // _p2pHandleCreaturePos legt eine Sicht-Kreatur an.
        p2p.remoteCreatures.clear();
        r._p2pHandleCreaturePos("farPeer", {
            list: [{ id: "c9", x: 5, y: 6, z: 5, yaw: 0, soul: "wesen" }],
        });
        out.remoteCreatureCreated = p2p.remoteCreatures.has("farPeer:c9");
        // NICHT in state.creatures (updateCreatures ignoriert sie).
        const rc = p2p.remoteCreatures.get("farPeer:c9");
        out.remoteNotInLocalSim = !!rc && r.state.creatures.indexOf(rc.mesh) === -1;

        // Reconcile: eine Liste OHNE c9 → die Sicht-Kreatur verschwindet.
        r._p2pHandleCreaturePos("farPeer", {
            list: [{ id: "c10", x: 7, y: 6, z: 7, yaw: 0, soul: "fuchs" }],
        });
        out.reconcileRemoves = !p2p.remoteCreatures.has("farPeer:c9") && p2p.remoteCreatures.has("farPeer:c10");

        // _p2pRemovePeer entsorgt die Sicht-Kreaturen des Peers.
        r._p2pRemovePeer("farPeer");
        out.removePeerCleansCreatures = !p2p.remoteCreatures.has("farPeer:c10");

        // creature-pos ist in der Kanal-Whitelist (mesh-zustellbar).
        p2p.remoteCreatures.clear();
        r._p2pHandleChannelMessage(
            "chPeer",
            JSON.stringify({ type: "creature-pos", list: [{ id: "c1", x: 1, y: 6, z: 1, soul: "wesen" }] })
        );
        out.creaturePosChannelAllowed = p2p.remoteCreatures.has("chPeer:c1");

        // Cleanup
        for (const [key, rcx] of p2p.remoteCreatures) r._disposeRemoteCreature(key, rcx);
        if (testC) r.removeCreature(testC);
        p2p.lobby.rooms = [];
        p2p.lobby.published = false;
        p2p.roomOverride = "";
        p2p.enabled = false;
        p2p.connected = false;

        return out;
    });
    if (erreichbar(check, "W7 Phase 4: Snapshot erreichbar", w7p4Results)) {
        check("W7 P4: state.p2p trägt lobby + remoteCreatures", w7p4Results.lobbyState);
        check("W7 P4: publishToLobby ohne Verbindung → not_connected", w7p4Results.publishNeedsConnection);
        check("W7 P4: publishToLobby sendet lobby-publish + setzt published", w7p4Results.publishSends);
        check("W7 P4: unpublishFromLobby sendet lobby-unpublish", w7p4Results.unpublishSends);
        check("W7 P4: requestLobbyList sendet lobby-list", w7p4Results.listRequestSends);
        check("W7 P4: lobby-rooms-Nachricht speichert die Liste", w7p4Results.lobbyRoomsStored);
        check("W7 P4: _renderLobbyUI rendert eine Beitreten-Zeile", w7p4Results.lobbyRendered);
        check("W7 P4: joinLobbyRoom setzt roomOverride", w7p4Results.joinSetsOverride);
        check("W7 P4: joinLobbyRoom in denselben Raum → already_here", w7p4Results.joinSameRejected);
        check("Kreatur-Sync: spawnCreatureAt vergibt eine netId", w7p4Results.creatureHasNetId);
        check("Kreatur-Sync: _p2pBroadcastCreatures sendet creature-pos", w7p4Results.broadcastSendsCreatures);
        check("Kreatur-Sync: creature-pos legt eine Sicht-Kreatur an", w7p4Results.remoteCreatureCreated);
        check("Kreatur-Sync: Sicht-Kreatur liegt NICHT in state.creatures", w7p4Results.remoteNotInLocalSim);
        check("Kreatur-Sync: Reconcile entfernt verschwundene Kreaturen", w7p4Results.reconcileRemoves);
        check("Kreatur-Sync: _p2pRemovePeer entsorgt die Sicht-Kreaturen", w7p4Results.removePeerCleansCreatures);
        check("Kreatur-Sync: creature-pos ist kanal-zustellbar", w7p4Results.creaturePosChannelAllowed);
    }

    // ### Voice-Sync (companion-say) ###
    // grokRender ist der EINE Sprech-Engpass; spricht der Begleiter, reist der Text via companion-say an
    // alle Mitspieler (SpeechSynthesis, gegated auf deren Stimme-Toggle). Eigener Kanal wie soul/aura.
    const w11v4Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const p2p = r.state.p2p;
        const grok = r.state.grok;

        // p2pSend mocken.
        const sent = [];
        const origSend = r.p2pSend;
        r.p2pSend = (o) => sent.push(o);

        // (a) Broadcast bei enabled+connected → companion-say.
        p2p.enabled = true;
        p2p.connected = true;
        p2p.peerId = "self-test";
        grok.companionVoice = "";
        r._p2pBroadcastCompanionSay("Ich träume mit dir.");
        const m1 = sent.find((m) => m.type === "companion-say");
        out.broadcastSends = !!m1 && m1.text === "Ich träume mit dir.";

        // (b) Broadcast trägt die gewählte Stimme.
        sent.length = 0;
        grok.companionVoice = "Test-Voice";
        r._p2pBroadcastCompanionSay("Hallo.");
        const m2 = sent.find((m) => m.type === "companion-say");
        out.broadcastCarriesVoice = !!m2 && m2.voice === "Test-Voice";
        grok.companionVoice = "";

        // (c) leerer Text → kein Broadcast.
        sent.length = 0;
        r._p2pBroadcastCompanionSay("   ");
        out.emptyTextNoBroadcast = !sent.some((m) => m.type === "companion-say");

        // (d) P2P deaktiviert → kein Broadcast.
        sent.length = 0;
        p2p.enabled = false;
        r._p2pBroadcastCompanionSay("Stumm.");
        out.disabledNoBroadcast = !sent.some((m) => m.type === "companion-say");
        p2p.enabled = true;

        // (e) grokRender löst den Broadcast aus (der Sprech-Engpass).
        sent.length = 0;
        r.grokRender("Der Regen wäscht.");
        out.grokRenderBroadcasts = sent.some((m) => m.type === "companion-say" && m.text === "Der Regen wäscht.");
        r.p2pSend = origSend;

        // (f) companion-say ist kanal-zustellbar (Kanal-Whitelist).
        let chanCalled = null;
        const origHandle = r._p2pHandleCompanionSay;
        r._p2pHandleCompanionSay = (pid, msg) => {
            chanCalled = { pid, text: msg && msg.text };
        };
        r._p2pHandleChannelMessage("chPeerX", JSON.stringify({ type: "companion-say", text: "Kanal-Test", voice: "" }));
        out.channelAllowed = !!chanCalled && chanCalled.pid === "chPeerX";

        // (g) die eigene peerId wird ignoriert (kein Selbst-Echo).
        chanCalled = null;
        r.p2pHandleMessage(JSON.stringify({ type: "companion-say", peerId: "self-test", text: "Echo" }));
        out.ownPeerIgnored = chanCalled === null;
        r._p2pHandleCompanionSay = origHandle;

        // (h) Empfang: speechEnabled=false → kein Log, kein Wurf.
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        const logs = [];
        const origLog = r.log;
        r.log = (msg) => logs.push(String(msg));
        grok.speechEnabled = false;
        let threwOff = false;
        try {
            r._p2pHandleCompanionSay("peerY", { text: "Aus.", voice: "" });
        } catch {
            threwOff = true;
        }
        out.mutedNoLog = !threwOff && !logs.some((l) => l.includes("Begleiter"));

        // (i) speechEnabled=true → Log-Zeile mit "Begleiter".
        logs.length = 0;
        grok.speechEnabled = true;
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        try {
            r._p2pHandleCompanionSay("peerY", { text: "Träume sind sauber.", voice: "" });
        } catch {
            /* ignore */
        }
        out.heardLogsLine = logs.some((l) => l.includes("Begleiter") && l.includes("Träume sind sauber."));
        r.log = origLog;
        grok.speechEnabled = false;

        // (j) Voice-Select im DOM + Default-Option bleibt.
        out.voiceSelectDom = !!document.getElementById("companion-voice");
        r._populateCompanionVoiceSelect();
        const vs = document.getElementById("companion-voice");
        out.defaultOptionKept = !!vs && Array.from(vs.options).some((o) => o.value === "");

        // (k) Voice-Select-change persistiert companionVoice + localStorage.
        if (vs) {
            const opt = document.createElement("option");
            opt.value = "Probe-Stimme";
            opt.textContent = "Probe-Stimme";
            vs.appendChild(opt);
            vs.value = "Probe-Stimme";
            vs.dispatchEvent(new Event("change"));
            out.voiceChangePersists =
                grok.companionVoice === "Probe-Stimme" &&
                localStorage.getItem("anazh.companion.voice") === "Probe-Stimme";
            vs.value = "";
            vs.dispatchEvent(new Event("change"));
        } else {
            out.voiceChangePersists = false;
        }

        // Cleanup
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        p2p.enabled = false;
        p2p.connected = false;
        grok.companionVoice = "";

        return out;
    });
    if (erreichbar(check, "W11 V4: Snapshot erreichbar", w11v4Results)) {
        check("W11 V4: _p2pBroadcastCompanionSay sendet companion-say", w11v4Results.broadcastSends);
        check("W11 V4: der Broadcast trägt die gewählte Stimme", w11v4Results.broadcastCarriesVoice);
        check("W11 V4: leerer Begleiter-Text → kein Broadcast", w11v4Results.emptyTextNoBroadcast);
        check("W11 V4: P2P deaktiviert → kein Broadcast", w11v4Results.disabledNoBroadcast);
        check("W11 V4: grokRender löst den companion-say-Broadcast aus", w11v4Results.grokRenderBroadcasts);
        check("W11 V4: companion-say ist kanal-zustellbar", w11v4Results.channelAllowed);
        check("W11 V4: die eigene peerId wird ignoriert (kein Echo)", w11v4Results.ownPeerIgnored);
        check("W11 V4: Stimme aus → fremder Begleiter stumm + kein Wurf", w11v4Results.mutedNoLog);
        check("W11 V4: Stimme an → fremder Begleiter im Log", w11v4Results.heardLogsLine);
        check("W11 V4: #companion-voice Select im DOM", w11v4Results.voiceSelectDom);
        check("W11 V4: _populateCompanionVoiceSelect behält die Default-Option", w11v4Results.defaultOptionKept);
        check("W11 V4: Voice-Wahl persistiert in companionVoice + localStorage", w11v4Results.voiceChangePersists);
    }

    // ### DSL-AST-Broadcast (Welt-Sync) ###
    // Was zwischen ZWEI echten Seiten am echten Broker reist, urteilt gate:mp-sync: A's Spieler-Programm (Graben, Bau, Gesetz)
    // erreicht B und wirkt dort byte-gleich, ein Echo (B sendet zurück, A wendet zweimal an) bricht den Abdruck (c)(e)(h) — die
    // Mock-Zwillinge davon (human sendet, remote wirkt, kein Echo, Diskrimination, remote voxel_carve) fielen mit ultiversum.K4.
    // Hier bleibt, was keine echte Seite zeigt: das Modell und der getrennte Client senden nie, die eigene peerId und ein
    // kaputtes Programm fallen still.
    const ring11V2Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const sent = [];
        const origSend = r.p2pSend;
        r.p2pSend = (obj) => sent.push(obj);
        Object.assign(r.state.p2p, { enabled: true, connected: true, peerId: "self-test" });
        r.dslRun(["weather", "rainy"], { source: "llm:grok" });
        out.llmDoesNotBroadcast = sent.length === 0;
        r.state.p2p.connected = false;
        r.dslRun(["weather", "sunny"], { source: "human" });
        out.disconnectedSkipsBroadcast = sent.length === 0;
        r.state.weather = "sunny";
        r.p2pHandleMessage(JSON.stringify({ type: "dsl", peerId: "self-test", program: ["weather", "rainy"] }));
        out.ownPeerDslIgnored = r.state.weather === "sunny";
        try {
            r.p2pHandleMessage(JSON.stringify({ type: "dsl", peerId: "peerX", program: "not-array" }));
            out.nonArrayDslNoCrash = true;
        } catch {
            out.nonArrayDslNoCrash = false;
        }
        r.p2pSend = origSend;
        Object.assign(r.state.p2p, { enabled: false, connected: false, peerId: null });
        return out;
    });
    if (erreichbar(check, "Ring 11 V2: Snapshot erreichbar", ring11V2Results)) {
        check(
            "Ring 11 V2: LLM-DSL wird NICHT gebroadcastet (nur explizite human-Geste)",
            ring11V2Results.llmDoesNotBroadcast
        );
        check("Ring 11 V2: nicht-verbundener Client broadcastet nicht", ring11V2Results.disconnectedSkipsBroadcast);
        check("Ring 11 V2: dsl mit eigener peerId wird ignoriert", ring11V2Results.ownPeerDslIgnored);
        check("Ring 11 V2: dsl mit non-array program crasht nicht", ring11V2Results.nonArrayDslNoCrash);
    }

    // ### LAN-Fähigkeit + Sync-Korrektheit ###
    // 1. signaling-server bindet 0.0.0.0 (LAN)  2. CSP ws:/wss: (Custom-IPs)  3. Raum-Override
    // (state.p2p.roomOverride)  4. spawn_*-Chat-Patterns embedden Position+Seed → der Empfänger spawnt
    // am SENDER-Ort  5. Non-broadcastable-Filter: player_*-Ops bleiben lokal.
    const ring11V21Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        // 1. Raum-Override: state.p2p.roomOverride existiert + persist
        r.state.p2p.roomOverride = "test-shared-room-xyz";
        r.p2pPersist();
        r.state.p2p.roomOverride = "";
        r.p2pLoadPersisted();
        out.roomOverridePersists = r.state.p2p.roomOverride === "test-shared-room-xyz";
        r.state.p2p.roomOverride = "";
        r.p2pPersist();

        // 2. NON_BROADCASTABLE_OPS-Liste vorhanden + sinnvoll
        out.hasNonBroadcastSet =
            r.constructor.NON_BROADCASTABLE_OPS instanceof Set &&
            r.constructor.NON_BROADCASTABLE_OPS.has("player_jump_power") &&
            r.constructor.NON_BROADCASTABLE_OPS.has("player_speed") &&
            r.constructor.NON_BROADCASTABLE_OPS.has("player_soul") &&
            r.constructor.NON_BROADCASTABLE_OPS.has("set_visible");

        // 3. _dslContainsAnyOp-Helfer findet Op im Tree
        out.containsOpFlat = r._dslContainsAnyOp(["player_speed", 5], r.constructor.NON_BROADCASTABLE_OPS);
        out.containsOpNested = r._dslContainsAnyOp(
            ["chain", ["weather", "rainy"], ["player_speed", 5]],
            r.constructor.NON_BROADCASTABLE_OPS
        );
        out.containsOpClean = !r._dslContainsAnyOp(
            ["chain", ["weather", "rainy"], ["voxel_carve", 0, 50, 0, 3]],
            r.constructor.NON_BROADCASTABLE_OPS
        );

        // 4. p2pBroadcastDsl skipped wenn non-broadcastable Op enthalten
        const sent = [];
        const origSend = r.p2pSend;
        r.p2pSend = function (obj) {
            sent.push(obj);
            return true;
        };
        r.p2pBroadcastDsl(["weather", "rainy"]);
        out.cleanProgramBroadcasts = sent.length === 1;
        sent.length = 0;
        r.p2pBroadcastDsl(["player_speed", 10]);
        out.playerOpDoesNotBroadcast = sent.length === 0;
        sent.length = 0;
        r.p2pBroadcastDsl(["chain", ["weather", "sunny"], ["player_jump_power", 20]]);
        out.mixedProgramDoesNotBroadcast = sent.length === 0;
        r.p2pSend = origSend;

        // 5. Chat-Pattern "baue dorf hier" embed jetzt Position+Seed
        const dorfPattern = r.parseChatToDsl("baue dorf hier");
        out.dorfHasAtNotAtPlayer =
            dorfPattern &&
            Array.isArray(dorfPattern.program) &&
            dorfPattern.program[0] === "spawn_village" &&
            Array.isArray(dorfPattern.program[1]) &&
            dorfPattern.program[1][0] === "at" &&
            Number.isFinite(dorfPattern.program[1][1]) &&
            Number.isFinite(dorfPattern.program[1][3]) &&
            Number.isInteger(dorfPattern.program[2]);

        // 6. Chat-Pattern "spawne kreaturen 5" embed Position
        const krePattern = r.parseChatToDsl("spawne kreaturen 5");
        out.kreatureHasAt =
            krePattern &&
            Array.isArray(krePattern.program) &&
            krePattern.program[0] === "repeat" &&
            Array.isArray(krePattern.program[2]) &&
            krePattern.program[2][0] === "spawn_creature" &&
            Array.isArray(krePattern.program[2][1]) &&
            krePattern.program[2][1][0] === "at";

        // 7. Chat-Pattern "baue fraktal tempel" embed Position+Seed
        const fraktal = r.parseChatToDsl("baue fraktal tempel");
        out.fraktalHasSeed =
            fraktal &&
            Array.isArray(fraktal.program) &&
            fraktal.program[0] === "spawn_fractal" &&
            Array.isArray(fraktal.program[1]) &&
            fraktal.program[1][0] === "at" &&
            Number.isInteger(fraktal.program[5]);

        // 7b. Chat „baue damm hier“ routet über spawn_blueprint (der `damm`-Bauplan ist built-in, kein
        // eigener spawn_damm-Op).
        const dammPattern = r.parseChatToDsl("baue damm hier");
        out.dammHasSpawnBlueprint =
            dammPattern &&
            Array.isArray(dammPattern.program) &&
            dammPattern.program[0] === "spawn_blueprint" &&
            dammPattern.program[1] === "damm" &&
            Array.isArray(dammPattern.program[2]) &&
            dammPattern.program[2][0] === "at" &&
            Number.isFinite(dammPattern.program[2][1]) &&
            Number.isFinite(dammPattern.program[2][3]) &&
            Number.isInteger(dammPattern.program[3]);

        // 8./9. spawn_village hebt das Studio-DORF (spawnSettlement, async über den Worker); Multi-User: der
        // Empfänger ruft mit SENDER-Seed + SENDER-Position. Der Test fängt die Argumente am Chokepoint (Stub).
        const spCalls = [];
        const origSpawnSettlement = r.spawnSettlement;
        r.spawnSettlement = function (o) {
            spCalls.push(o);
            return null;
        };
        try {
            // 8. Diskrimination: spawn_village mit FIXEM Seed → deterministisch (der Seed reist 1:1)
            r.dslRun(["spawn_village", ["at", 50, 0, 50], 12345], { source: "remote:peerX" });
            r.dslRun(["spawn_village", ["at", 60, 0, 60], 12345], { source: "remote:peerX" });
            out.seedDeterminismHolds = spCalls.length === 2 && spCalls[0].seed === 12345 && spCalls[1].seed === 12345;

            // 9. spawn_village mit at-Position landet WIRKLICH dort
            // (Empfänger spawnt am SENDER-Ort, nicht am eigenen Player)
            r.dslRun(["spawn_village", ["at", 77, 0, -33], 999], { source: "remote:peerY" });
            const call3 = spCalls[2];
            out.atPositionRespected =
                !!call3 && !!call3.position && call3.position.x === 77 && call3.position.z === -33;
        } finally {
            r.spawnSettlement = origSpawnSettlement;
        }

        return out;
    });
    if (erreichbar(check, "Ring 11 V2.1: Snapshot erreichbar", ring11V21Results)) {
        check("Ring 11 V2.1: roomOverride persistiert via localStorage", ring11V21Results.roomOverridePersists);
        check(
            "Ring 11 V2.1: NON_BROADCASTABLE_OPS Set enthält player_*+set_visible",
            ring11V21Results.hasNonBroadcastSet
        );
        check("Ring 11 V2.1: _dslContainsAnyOp findet Op flat", ring11V21Results.containsOpFlat);
        check("Ring 11 V2.1: _dslContainsAnyOp findet Op verschachtelt", ring11V21Results.containsOpNested);
        check("Ring 11 V2.1: _dslContainsAnyOp ignoriert nicht-listed Ops", ring11V21Results.containsOpClean);
        check("Ring 11 V2.1: clean program (weather) wird gebroadcastet", ring11V21Results.cleanProgramBroadcasts);
        check(
            "Ring 11 V2.1: player_speed (private) wird NICHT gebroadcastet",
            ring11V21Results.playerOpDoesNotBroadcast
        );
        check(
            "Ring 11 V2.1: gemischtes Programm mit player_jump_power skippt komplett",
            ring11V21Results.mixedProgramDoesNotBroadcast
        );
        check(
            "Ring 11 V2.1: Chat 'baue dorf hier' embed at(x,y,z)+seed (Multi-Sync-Fix)",
            ring11V21Results.dorfHasAtNotAtPlayer
        );
        check("Ring 11 V2.1: Chat 'spawne kreaturen N' embed at-Position", ring11V21Results.kreatureHasAt);
        check("Ring 11 V2.1: Chat 'baue fraktal X' embed at+rootSeed", ring11V21Results.fraktalHasSeed);
        check(
            "Chat 'baue damm hier' routet über spawn_blueprint(damm, at, seed)",
            ring11V21Results.dammHasSpawnBlueprint
        );
        check(
            "Ring 11 V2.1: spawn_village(seed) ist deterministisch (der Sender-Seed reist 1:1 in spawnSettlement)",
            ring11V21Results.seedDeterminismHolds
        );
        check(
            "Ring 11 V2.1: at-Position wird respektiert (Empfänger ruft spawnSettlement am SENDER-Ort)",
            ring11V21Results.atPositionRespected
        );
    }

    // ### Intuitives Multi-User-Setup ###
    // Mode/Rolle im New-World-Dialog, world-snapshot-Empfang nur bei pending=true, role-State in worldMeta + p2p; den
    // Gast-Import samt Auto-Verbindung zum Host trägt der echte Beitritt (gate:praegung-welt, T-WELT).
    const ring115Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        // createNewWorld({role: "host"}) setzt role in worldMeta
        const hostId = r.createNewWorld({
            slug: "host-test-" + Date.now().toString(36),
            role: "host",
            reload: false,
        });
        out.hostWorldCreated = !!hostId;
        if (hostId) {
            const saved = JSON.parse(localStorage.getItem(r.worldStorageKey(hostId)));
            out.hostRoleInSavedMeta = saved && saved.worldMeta && saved.worldMeta.role === "host";
            r.deleteWorld(hostId);
        }

        // 7. world-snapshot wird nur bei pending=true akzeptiert
        r.state.p2p.peerId = "self-id";
        r.state.p2p.pendingWorldSnapshot = false;
        const originalRole = r.state.worldMeta.role;
        r.p2pHandleMessage(
            JSON.stringify({
                type: "world-snapshot",
                peerId: "evil-peer",
                state: { worldMeta: { worldId: "stolen", slug: "evil", role: "host" } },
            })
        );
        // Welt darf nicht überschrieben sein
        out.snapshotRejectedWhenNotPending = r.state.worldMeta.role === originalRole;

        // 8. world-request: nur der Host antwortet (world-snapshot). world-snapshot ist Signaling über
        // _p2pSignal (WS), nicht das mesh-bewusste p2pSend → der Mock fängt _p2pSignal ab.
        const sentMsgs = [];
        const origSignal = r._p2pSignal;
        r._p2pSignal = function (m) {
            sentMsgs.push(m);
            return true;
        };
        // Guest oder Solo: kein Snapshot raus
        r.state.p2p.role = "solo";
        r.p2pHandleMessage(JSON.stringify({ type: "world-request", peerId: "asker" }));
        out.soloDoesNotAnswerRequest = sentMsgs.length === 0;
        // Host: schickt snapshot mit to=asker
        r.state.p2p.role = "host";
        r.p2pHandleMessage(JSON.stringify({ type: "world-request", peerId: "asker" }));
        const sentSnap = sentMsgs.find((m) => m.type === "world-snapshot" && m.to === "asker");
        out.hostAnswersRequestWithSnapshot = !!sentSnap && !!sentSnap.state;
        // DIE WELT REIST NUR ZU EINEM LESER IHRES ERBGUTS (Plan R11, `_erbgutTeilbar`): trägt die Welt ein Erbgut jenseits
        // der Wildnis, bekommt ein Anfrager ohne Erbgut-Stufe (ein Build davor) keinen Snapshot — er zeichnete still
        // Wildnis darunter; ein Leser (`erbgut` ≥ 1) bekommt ihn. Die lebende Welt trägt das Erbgut nur synchron (kein
        // Takt dazwischen), ihr Erbgut-Merker bleibt unberührt.
        {
            const T = r.constructor;
            const buehne = {
                terme: [{ art: "insel", x: 0, z: 0, r: 420, plateau: 9, kuppel: 0.003, schelf: 60, grund: -15 }],
            };
            const echt = r.state.worldMeta;
            r.state.worldMeta = Object.assign({}, echt, { erbgut: buehne });
            sentMsgs.length = 0;
            try {
                r.p2pHandleMessage(JSON.stringify({ type: "world-request", peerId: "alt-build" }));
            } finally {
                r.state.worldMeta = echt;
            }
            out.erbgutReise = {
                altVerweigert: sentMsgs.length === 0,
                teilbarWildnis: T._erbgutTeilbar({}, {}) === null,
                teilbarLeser: T._erbgutTeilbar({ erbgut: buehne }, { erbgut: T.ERBGUT_PROTOKOLL }) === null,
                verweigertAlt: /liest kein Erbgut/.test(String(T._erbgutTeilbar({ erbgut: buehne }, {}))),
                stufe: T.ERBGUT_PROTOKOLL >= 1,
            };
        }
        r._p2pSignal = origSignal;
        sentMsgs.length = 0;
        r.state.p2p.role = "solo";

        // 9. UI-Elemente vorhanden
        out.dialogExists = !!document.getElementById("new-world-dialog");
        out.modeRadiosExist = document.querySelectorAll('input[name="new-world-mode"]').length === 2;
        out.roleRadiosExist = document.querySelectorAll('input[name="new-world-role"]').length === 2;
        out.inviteInputExists = !!document.getElementById("new-world-invite");
        // die Heightfield-Opt-out-Checkbox fehlt (Voxel ist permanent).
        out.heightfieldCheckboxGone = !document.getElementById("new-world-heightfield");
        out.hostBannerExists = !!document.getElementById("world-host-banner");
        out.guestBannerExists = !!document.getElementById("world-guest-banner");

        return out;
    });
    if (erreichbar(check, "Ring 11.5: Snapshot erreichbar", ring115Results)) {
        check(
            "Ring 11.5: createNewWorld({role:'host'}) speichert role im worldMeta",
            ring115Results.hostRoleInSavedMeta
        );
        check(
            "Ring 11.5: world-snapshot wird ohne pending-Flag verworfen (Sicherheits-Wall)",
            ring115Results.snapshotRejectedWhenNotPending
        );
        check("Ring 11.5: Solo-Spieler antwortet NICHT auf world-request", ring115Results.soloDoesNotAnswerRequest);
        check(
            "Ring 11.5: Host antwortet auf world-request mit world-snapshot (to=asker)",
            ring115Results.hostAnswersRequestWithSnapshot
        );
        const er = ring115Results.erbgutReise || {};
        check(
            "Ring 11.5: eine Welt mit Erbgut reist nur zu einem Leser (Anfrager ohne Erbgut-Stufe bekommt keinen Snapshot)",
            ["altVerweigert", "teilbarWildnis", "teilbarLeser", "verweigertAlt", "stufe"].every((k) => er[k] === true),
            JSON.stringify(er)
        );
        check("Ring 11.5: new-world-dialog im DOM", ring115Results.dialogExists);
        check(
            "Voxel V9.35: #new-world-heightfield-Opt-out-Checkbox ist aus dem Neue-Welt-Dialog entfernt (Voxel ist permanent)",
            ring115Results.heightfieldCheckboxGone
        );
        check("Ring 11.5: Mode-Radios (solo/multi) im DOM", ring115Results.modeRadiosExist);
        check("Ring 11.5: Role-Radios (host/join) im DOM", ring115Results.roleRadiosExist);
        check("Ring 11.5: Einladungs-Code-Input im DOM", ring115Results.inviteInputExists);
        check("Ring 11.5: world-host-banner im DOM", ring115Results.hostBannerExists);
        check("Ring 11.5: world-guest-banner im DOM", ring115Results.guestBannerExists);
    }
}

async function checkBandV8SoulRoleAndWorkshop({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Soul-Sync (Peer-Avatar = echte Seele) ###
    const v834Results = await safeEvaluate(page, () => {
        const out = {};
        const p2p = r.state.p2p;
        p2p.peerId = "self-v834";
        p2p.enabled = false;

        // Frischer Peer → Cone+Sphere-Platzhalter, V3-Felder vorhanden.
        r.p2pHandleMessage(JSON.stringify({ type: "peer-join", peerId: "pv1" }));
        const pv1 = p2p.peers.get("pv1");
        out.placeholderKind = !!pv1 && pv1.meshKind === "placeholder";
        out.placeholderMesh = !!(pv1 && pv1.mesh && pv1.mesh.children && pv1.mesh.children.length === 2);
        out.entryHasV3Fields =
            !!pv1 && "soulName" in pv1 && !("auraHue" in pv1) && "walkPhase" in pv1 && "nameLabel" in pv1;

        // soul-Nachricht (geflügelte Compound-Seele) → echte Seele + Name-Schild. Peers reisen als
        // Compound-Seelen aus bodyParts; benannte Anker (leftWing) kommen aus der EINEN Rollen-Quelle.
        const WING_PARTS = [
            { shape: "box", material: "federn", size: { x: 0.5, y: 0.55, z: 0.4 }, position: { x: 0, y: 0.5, z: 0 } },
            {
                shape: "plane",
                material: "federn",
                size: { x: 0.9, y: 0.04, z: 0.5 },
                position: { x: 0.62, y: 0.55, z: 0 },
            },
            {
                shape: "plane",
                material: "federn",
                size: { x: 0.9, y: 0.04, z: 0.5 },
                position: { x: -0.62, y: 0.55, z: 0 },
            },
        ];
        r.p2pHandleMessage(
            JSON.stringify({
                type: "soul",
                peerId: "pv1",
                soulName: "fluegel-probe",
                bodyParts: WING_PARTS,
                name: "Aria",
            })
        );
        const pv1b = p2p.peers.get("pv1");
        out.builtinSoulName = !!pv1b && pv1b.soulName === "fluegel-probe";
        out.builtinMeshKind = !!pv1b && pv1b.meshKind === "soul-custom";
        out.builtinHasParts = !!(
            pv1b &&
            pv1b.mesh &&
            pv1b.mesh.userData &&
            pv1b.mesh.userData.parts &&
            pv1b.mesh.userData.parts.leftWing &&
            pv1b.mesh.rotation.order === "YXZ"
        );
        out.nameLabelCreated = !!(pv1b && pv1b.avatarName === "Aria" && pv1b.nameLabel);

        // Soul-Wechsel Flügel → Vierläufer (Beine + Schwanz-Kette) → Mesh wird
        // neu gebaut (Compound: children == bodyParts, die schwanz-Rolle lebt
        // in den Peer-Motion-Rollen).
        const LAEUFER_PARTS = [
            { shape: "box", material: "leder", size: { x: 0.55, y: 0.45, z: 1.2 }, position: { x: 0, y: 0.4, z: 0 } },
            {
                shape: "sphere",
                material: "leder",
                size: { x: 0.42, y: 0.38, z: 0.45 },
                position: { x: 0, y: 0.5, z: 0.85 },
            },
            {
                shape: "cylinder",
                material: "knochen",
                size: { x: 0.15, y: 0.45, z: 0.15 },
                position: { x: 0.25, y: 0.1, z: 0.4 },
            },
            {
                shape: "cylinder",
                material: "knochen",
                size: { x: 0.15, y: 0.45, z: 0.15 },
                position: { x: -0.25, y: 0.1, z: 0.4 },
            },
            {
                shape: "cylinder",
                material: "knochen",
                size: { x: 0.15, y: 0.45, z: 0.15 },
                position: { x: 0.25, y: 0.1, z: -0.4 },
            },
            {
                shape: "cylinder",
                material: "knochen",
                size: { x: 0.15, y: 0.45, z: 0.15 },
                position: { x: -0.25, y: 0.1, z: -0.4 },
            },
            {
                shape: "cylinder",
                material: "leder",
                size: { x: 0.3, y: 0.45, z: 0.3 },
                position: { x: 0, y: 0.4, z: -0.85 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            },
            {
                shape: "cylinder",
                material: "leder",
                size: { x: 0.2, y: 0.4, z: 0.2 },
                position: { x: 0, y: 0.4, z: -1.25 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            },
        ];
        r.p2pHandleMessage(
            JSON.stringify({ type: "soul", peerId: "pv1", soulName: "laeufer-probe", bodyParts: LAEUFER_PARTS })
        );
        const pv1c = p2p.peers.get("pv1");
        out.soulChangeRebuilt =
            !!pv1c &&
            pv1c.soulName === "laeufer-probe" &&
            pv1c.mesh.children.length >= LAEUFER_PARTS.length &&
            (r.computeMotionRoles(pv1c.bodyParts) || []).some((x) => x && x.role === "schwanz");

        // soul-Nachricht (Custom-Seele via bodyParts).
        r.p2pHandleMessage(
            JSON.stringify({
                type: "soul",
                peerId: "pv2",
                soulName: "custom-test-soul",
                bodyParts: [{ shape: "box", material: "stein", size: { x: 1, y: 1, z: 1 } }],
            })
        );
        const pv2 = p2p.peers.get("pv2");
        out.customMeshKind = !!pv2 && pv2.meshKind === "soul-custom";
        out.customMeshBuilt = !!(pv2 && pv2.mesh && pv2.mesh.children && pv2.mesh.children.length >= 1);

        // aura-Nachricht (SYNERGIE-WELLE): must-ignore-Stub — ein alter Peer darf sie
        // weiter senden, sie crasht nie und hinterlaesst KEINEN Aura-State am Entry.
        r.p2pHandleMessage(JSON.stringify({ type: "aura", peerId: "pv1", hue: 270, intensity: 0.8 }));
        const pv1d = p2p.peers.get("pv1");
        out.auraReceived = !!pv1d && !("auraHue" in pv1d) && !("auraIntensity" in pv1d);

        // _p2pUpdatePeer animiert — und erzeugt KEINEN Aura-Sprite mehr (gefallen).
        r._p2pUpdatePeer(pv1d, 1.0, 0.016);
        out.auraSpriteCreated = !pv1d.auraGlow;

        // _p2pBroadcastSoul-Payload (p2pSend gemockt).
        p2p.enabled = true;
        let captured = null;
        const origSend = r.p2pSend;
        r.p2pSend = (obj) => {
            captured = obj;
            return true;
        };
        r._p2pBroadcastSoul();
        r.p2pSend = origSend;
        p2p.enabled = false;
        out.broadcastSoulPayload =
            !!captured &&
            captured.type === "soul" &&
            captured.soulName === r.state.player.soul &&
            typeof captured.name === "string";

        // player_soul bleibt NON_BROADCASTABLE — Soul-Sync läuft über
        // den dedizierten `soul`-Kanal, NICHT über die DSL.
        out.playerSoulStillLocal = r.constructor.NON_BROADCASTABLE_OPS.has("player_soul");

        // _p2pRemovePeer räumt Peer + Mesh + Name-Schild.
        r._p2pRemovePeer("pv1");
        r._p2pRemovePeer("pv2");
        out.peersRemoved = !p2p.peers.has("pv1") && !p2p.peers.has("pv2");

        p2p.enabled = false;
        return out;
    });

    if (erreichbar(check, "Soul-Sync Tests laufen", v834Results)) {
        check("frischer Peer ist Cone+Sphere-Platzhalter", v834Results.placeholderKind);
        check("Platzhalter-Mesh hat 2 Teile (Kegel+Kugel)", v834Results.placeholderMesh);
        check("Peer-Entry trägt die V3-Felder", v834Results.entryHasV3Fields);
        check("soul-Nachricht setzt soulName (Compound)", v834Results.builtinSoulName);
        check("(NULL): Peer-Seele reist als Compound (meshKind 'soul-custom', YXZ)", v834Results.builtinMeshKind);
        check("Peer-Seele hat animierbare Parts (Flügel-Anker)", v834Results.builtinHasParts);
        check("Name-Schild wird aus dem Avatar-Namen erzeugt", v834Results.nameLabelCreated);
        check("Soul-Wechsel baut den Peer-Avatar neu (→ Vierläufer + Schwanz-Rolle)", v834Results.soulChangeRebuilt);
        check("Custom-Seele → meshKind 'soul-custom'", v834Results.customMeshKind);
        check("Custom-Seele wird aus bodyParts gebaut", v834Results.customMeshBuilt);
        check("(SYNERGIE): aura-Nachricht ist must-ignore (kein Aura-State)", v834Results.auraReceived);
        check("(SYNERGIE): _p2pUpdatePeer erzeugt KEINEN Aura-Sprite", v834Results.auraSpriteCreated);
        check("_p2pBroadcastSoul sendet {type:soul, soulName, name}", v834Results.broadcastSoulPayload);
        check("player_soul bleibt NON_BROADCASTABLE (Soul-Sync ≠ DSL)", v834Results.playerSoulStillLocal);
        check("_p2pRemovePeer entfernt Peer + Avatar + Schild", v834Results.peersRemoved);
    }

    // ### Substanz-Rolle (Rolle aus der Substanz) ###
    const v835Results = await safeEvaluate(page, () => {
        const out = {};
        const part = (mat, x, y, z) => ({
            shape: "box",
            material: mat,
            size: { x: 1, y: 1, z: 1 },
            position: { x, y, z },
        });

        // --- Körper-Form → Seele: Torso+Kopf auf der Achse, Glieder als Spiegel-Paar ---
        // Ein GLIED ist GESTRECKT — gespiegelte BLOBS sind keine Glieder (sonst würde die Eiche zur Seele).
        const armPart = (mat, x) => ({
            shape: "box",
            material: mat,
            size: { x: 0.4, y: 1.2, z: 0.4 },
            position: { x, y: 2, z: 0 },
        });
        const bodyBp = {
            name: "_t835_body",
            parts: [part("fleisch", 0, 1, 0), part("knochen", 0, 3, 0), armPart("fleisch", -1), armPart("fleisch", 1)],
        };
        out.bodyIsShaped = r._isBodyShaped(bodyBp) === true;
        out.bodyRoleSoul = r.computeBlueprintRole(bodyBp) === "soul";

        // --- Turm: 3 Boxen gestapelt auf der Achse — symmetrisch,
        //     aber KEINE Glieder → kein Körper ---
        const towerBp = {
            name: "_t835_tower",
            parts: [part("stein", 0, 0, 0), part("stein", 0, 1, 0), part("stein", 0, 2, 0)],
        };
        out.towerNotBody = r._isBodyShaped(towerBp) === false;
        out.towerRoleArchitecture = r.computeBlueprintRole(towerBp) === "architecture";

        // --- Asymmetrisch: kein Spiegel → kein Körper ---
        const asymBp = {
            name: "_t835_asym",
            parts: [part("stein", 0, 0, 0), part("stein", 2, 1, 0), part("stein", 5, 2, 1)],
        };
        out.asymNotBody = r._isBodyShaped(asymBp) === false;

        // --- lebendig+weich → Nahrung ---
        const foodBp = {
            name: "_t835_food",
            parts: [
                {
                    shape: "sphere",
                    material: "fleisch",
                    size: { x: 1, y: 1, z: 1 },
                    position: { x: 0, y: 0, z: 0 },
                },
            ],
        };
        out.foodIsFoodLike = r._isFoodLike(foodBp) === true;
        out.foodRoleConsumable = r.computeBlueprintRole(foodBp) === "consumable";

        const stoneBp = { name: "_t835_stone", parts: [part("stein", 0, 0, 0)] };
        out.stoneNotFood = r._isFoodLike(stoneBp) === false;
        out.stoneRoleArchitecture = r.computeBlueprintRole(stoneBp) === "architecture";

        // --- Priorität: ein Körper aus lebendigem Material ist eine
        //     SEELE (Körper-Form schlägt Nahrung) ---
        out.priorityBodyBeatsFood = r.computeBlueprintRole(bodyBp) === "soul";

        // --- _refreshBlueprintRoleEmergent: registrierter Körper-
        //     Bauplan emergiert OHNE Werkzeug-Op als "soul" ---
        r.state.blueprints["_t835_body_reg"] = {
            name: "_t835_body_reg",
            label: "Test-Körper",
            builtIn: false,
            parts: JSON.parse(JSON.stringify(bodyBp.parts)),
        };
        r._refreshBlueprintRoleEmergent("_t835_body_reg");
        out.refreshEmergesSoul = r.state.blueprints["_t835_body_reg"].role === "soul";

        // registrierte Nahrung emergiert als "consumable"
        r.state.blueprints["_t835_food_reg"] = {
            name: "_t835_food_reg",
            label: "Test-Frucht",
            builtIn: false,
            parts: JSON.parse(JSON.stringify(foodBp.parts)),
        };
        r._refreshBlueprintRoleEmergent("_t835_food_reg");
        out.refreshEmergesFood = r.state.blueprints["_t835_food_reg"].role === "consumable";

        // --- Manueller Override schlägt die Emergenz weiterhin ---
        r.state.blueprints["_t835_manual"] = {
            name: "_t835_manual",
            label: "Test-Manuell",
            builtIn: false,
            roleManual: true,
            role: "architecture",
            parts: JSON.parse(JSON.stringify(bodyBp.parts)),
        };
        r._refreshBlueprintRoleEmergent("_t835_manual");
        out.roleManualStillWins = r.state.blueprints["_t835_manual"].role === "architecture";

        // --- activateConsumable funktioniert OHNE consumableMeta
        //     (emergente Nahrung ist essbar) ---
        r.state.blueprints["_t835_food_reg"].role = "consumable";
        const before = (r.state.player.boosts || []).length;
        const eatRes = r.activateConsumable("_t835_food_reg");
        out.metaLessConsumableWorks = !!(eatRes && eatRes.ok) && (r.state.player.boosts || []).length > before;

        // Aufräumen
        if (r.state.player.boosts) {
            r.state.player.boosts = r.state.player.boosts.filter((b) => b.source !== "consume:_t835_food_reg");
            r.recomputePlayerStats();
        }
        delete r.state.blueprints["_t835_body_reg"];
        delete r.state.blueprints["_t835_food_reg"];
        delete r.state.blueprints["_t835_manual"];
        return out;
    });

    if (erreichbar(check, "Substanz-Rolle Tests laufen", v835Results)) {
        check("bilateral-symmetrisches Glieder-Compound ist body-shaped", v835Results.bodyIsShaped);
        check("Körper-Form emergiert als Rolle 'soul'", v835Results.bodyRoleSoul);
        check("gestapelter Turm (symmetrisch, keine Glieder) ist KEIN Körper", v835Results.towerNotBody);
        check("Turm emergiert als 'architecture' (Default)", v835Results.towerRoleArchitecture);
        check("asymmetrisches Compound ist KEIN Körper", v835Results.asymNotBody);
        check("lebendig+weiche Substanz ist food-like", v835Results.foodIsFoodLike);
        check("lebendige Substanz emergiert als Rolle 'consumable'", v835Results.foodRoleConsumable);
        check("Stein-Substanz ist KEINE Nahrung", v835Results.stoneNotFood);
        check("Stein-Block emergiert als 'architecture'", v835Results.stoneRoleArchitecture);
        check("Priorität — Körper aus lebendigem Material ist Seele, nicht Nahrung", v835Results.priorityBodyBeatsFood);
        check("_refreshBlueprintRoleEmergent — Körper-Bauplan → 'soul' (ohne Op)", v835Results.refreshEmergesSoul);
        check(
            "_refreshBlueprintRoleEmergent — Nahrungs-Bauplan → 'consumable' (ohne Op)",
            v835Results.refreshEmergesFood
        );
        check("manueller Rollen-Override schlägt die Emergenz weiterhin", v835Results.roleManualStillWins);
        check(
            "activateConsumable funktioniert ohne consumableMeta (emergente Nahrung essbar)",
            v835Results.metaLessConsumableWorks
        );
    }

    // ### Browser-Test-Bug-Fixes (Wurzel-Fixes) ###
    const v836Results = await safeEvaluate(page, () => {
        const out = {};
        // 4. KILLPLANE: ein Körper tief unter jedem Boden steht nach EINEM Charakter-Schritt auf der Oberfläche
        // (die leere Säule ist Bühne; die Wand-Kugel schiebt nicht seitlich).
        {
            const s = r.state,
                pm = s.playerMesh,
                pos = pm.position.clone();
            const buehne = {
                _fieldSolid: () => false,
                _fieldSurfaceBelow: () => null,
                _fieldResolveSphere: () => false,
                _koerperWasser: () => -Infinity,
            };
            Object.assign(r, buehne);
            try {
                pm.position.set(pos.x, -1e4, pos.z);
                s._fieldVy = 0;
                s.playerVel.setValue(0, 0, 0);
                r._stepCharacter(r.constructor.FIXED_DT, 0);
                const p1 = pm.position;
                out.waterGate = p1.y > -1e3 && Math.abs(p1.y - r.findSurfaceAbove(p1.x, 0, p1.z)) < 3;
            } finally {
                for (const k in buehne) delete r[k];
                pm.position.copy(pos);
                s._fieldVy = 0;
                s.playerVel.setValue(0, 0, 0);
            }
        }

        // 5. Logbuch: aufgeklappt wächst es wie der Chat (50/50), eingeklappt nicht — am berechneten Layout.
        {
            const sec = document.getElementById("console-log-section"),
                chat = document.getElementById("console-chat-section"),
                log = document.getElementById("log"),
                knopf = document.getElementById("console-log-toggle");
            const war = log.hidden;
            if (war) knopf.click();
            const offen = !log.hidden,
                gAuf = getComputedStyle(sec).flexGrow;
            knopf.click();
            const gZu = getComputedStyle(sec).flexGrow;
            if (!war) knopf.click();
            out.logCssRule = offen && gAuf === "1" && gAuf === getComputedStyle(chat).flexGrow && gZu === "0";
        }

        // 6. Neue Werkstatt-Parts landen im Ursprung (0,0,0).
        {
            if (r.state.blueprints["_t836"]) delete r.state.blueprints["_t836"];
            r.createBlueprint("_t836", "T836");
            r.selectBlueprintForEdit("_t836");
            const before = (r.state.blueprints["_t836"].parts || []).length;
            r._workshopHandleShapeDrop("box");
            const parts = r.state.blueprints["_t836"].parts || [];
            const np = parts[parts.length - 1];
            out.partAtOrigin =
                parts.length === before + 1 &&
                !!np &&
                !!np.position &&
                np.position.x === 0 &&
                np.position.y === 0 &&
                np.position.z === 0;
            delete r.state.blueprints["_t836"];
        }

        return out;
    });

    if (erreichbar(check, "Browser-Test-Bug-Fix Tests laufen", v836Results)) {
        // P3 — die Player-Body-Sleep-Checks (DISABLE_DEACTIVATION / forceActivationState)
        // sind gestrichen: es gibt keinen Ammo-Body mehr (feld-nativer Controller).
        check("die Killplane fängt einen Durchfall und stellt den Körper auf die Oberfläche", v836Results.waterGate);
        check("das aufgeklappte Logbuch teilt die Konsole 50/50 (verdeckt den Chat nicht)", v836Results.logCssRule);
        check("neue Werkstatt-Parts landen im Ursprung (0,0,0)", v836Results.partAtOrigin);
    }

    // ### Werkstatt-Lesbarkeit + Einstellungen-Faltung ###
    const v837Results = await safeEvaluate(page, () => {
        const out = {};

        // A — Bau-Kosten sichtbar im Werkstatt-Stats-Panel.
        {
            if (r.state.blueprints["_t837a"]) delete r.state.blueprints["_t837a"];
            r.createBlueprint("_t837a", "T837A");
            r.state.blueprints["_t837a"].parts = [
                {
                    shape: "box",
                    material: "stein",
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    size: { x: 2, y: 2, z: 2 },
                    color: 0x888888,
                },
            ];
            r.selectBlueprintForEdit("_t837a");
            r._workshopRenderStatsPanel();
            const panel = document.getElementById("workshop-stats-panel");
            const txt = panel ? panel.textContent : "";
            const cost = r.computeBuildCost("_t837a");
            out.costPanelShown = /Bau-Kosten/.test(txt);
            out.costPanelValue = (cost.stein || 0) > 0 && txt.includes(`${cost.stein}× stein`);
            delete r.state.blueprints["_t837a"];
        }

        // B — 3D-Raster + Achsenkreuz im Werkstatt-Preview.
        {
            r._workshopEnsurePreview();
            const pre = r.state.workshop && r.state.workshop.preview;
            out.gridInScene = !!pre && !!pre.gridHelper && pre.scene.children.includes(pre.gridHelper);
            out.axesInScene = !!pre && !!pre.axesHelper && pre.scene.children.includes(pre.axesHelper);
            // raycast der Helfer ist als eigene no-op-Property
            // überschrieben → Part-Auswahl + Gizmo bleiben ungestört.
            out.helperRaycastNoop =
                !!pre &&
                Object.prototype.hasOwnProperty.call(pre.gridHelper, "raycast") &&
                Object.prototype.hasOwnProperty.call(pre.axesHelper, "raycast");
        }

        // C — Einstellungen-Sektionen faltbar.
        {
            r._initCollapsibleSettings(); // idempotent
            const drawer = document.querySelector('.drawer[data-drawer="einstellungen"]');
            const headers = drawer ? drawer.querySelectorAll("h3.collapsible-header") : [];
            // Die Einstellungen tragen 11 Präferenz-Sektionen (die Welt-Verwaltung lebt im Welt-Manager) →
            // Schwelle ≥11; der Beweis ist die Falt-MECHANIK (collapseToggles).
            out.collapsibleHeaders = headers.length >= 11;
            if (headers.length > 0) {
                const sec = headers[0].closest("section");
                const before = sec.classList.contains("collapsed");
                headers[0].click();
                const after = sec.classList.contains("collapsed");
                out.collapseToggles = before !== after;
                headers[0].click(); // Ausgangszustand wiederherstellen
            } else {
                out.collapseToggles = false;
            }
        }

        // D — Werkzeug-Drag überlebt Palette-Neu-Rendern (Delegation).
        {
            // Re-Render der Tool-Palette: frische Karten bleiben draggable.
            r._workshopRenderToolPalette();
            const palette = document.getElementById("workshop-tool-palette");
            const card = palette ? palette.querySelector(".workshop-tool-card") : null;
            out.toolCardDraggable = !!card && card.getAttribute("draggable") === "true";
        }

        // E — FPS als gleitender 1-s-Durchschnitt (nicht 1/delta).
        {
            r.state._fpsFrames = 0;
            r.state._fpsElapsed = 0;
            r.state.fps = 0;
            for (let i = 0; i < 90; i++) r.updateFps(1 / 60);
            out.fpsRollingAvg = r.state.fps === 60;
            out.fpsNotSingleFrame = window.__fehlt(r.updateFps, /Math\.round\(1 \/ delta\)/);
            r.state._fpsFrames = 5;
            r.state._fpsElapsed = 0.3;
            r.updateFps(2.0); // abnormaler Delta → Fenster verwerfen
            out.fpsResetsOnStall = r.state._fpsFrames === 0 && r.state._fpsElapsed === 0;
        }

        return out;
    });

    if (erreichbar(check, "Werkstatt-Lesbarkeit Tests laufen", v837Results)) {
        check("Bau-Kosten-Sektion im Werkstatt-Panel sichtbar", v837Results.costPanelShown);
        check("Bau-Kosten zeigt den computeBuildCost-Wert pro Material", v837Results.costPanelValue);
        check("Werkstatt-Preview hat ein Maß-Raster (GridHelper)", v837Results.gridInScene);
        check("Werkstatt-Preview hat ein Achsenkreuz (AxesHelper)", v837Results.axesInScene);
        check("Raster + Achsen sind raycast-stumm (stören Part-Auswahl nicht)", v837Results.helperRaycastNoop);
        check("Einstellungen-Sektionen haben faltbare Header (≥11)", v837Results.collapsibleHeaders);
        check("Klick auf einen Sektion-Header faltet/entfaltet", v837Results.collapseToggles);
        check("neu-gerenderte Werkzeug-Karte bleibt draggable", v837Results.toolCardDraggable);
        check("FPS ist ein gleitender Durchschnitt (90 Frames @60 → fps=60)", v837Results.fpsRollingAvg);
        check("FPS-Rechnung nutzt nicht mehr Einzel-Frame 1/delta", v837Results.fpsNotSingleFrame);
        check("abnormaler Delta (Tab-Pause) verwirft das FPS-Fenster", v837Results.fpsResetsOnStall);
    }

    // ### Werkstatt-UX: Hover-Kosten + sichtbare Verbindungen + Preview-Höhe ###
    const v838Results = await safeEvaluate(page, () => {
        const out = {};

        // C — Hover-Material-Info auf Bauplan-Slots.
        {
            if (r.state.blueprints["_t838c"]) delete r.state.blueprints["_t838c"];
            r.createBlueprint("_t838c", "T838C");
            r.state.blueprints["_t838c"].parts = [
                {
                    shape: "box",
                    material: "stein",
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    size: { x: 2, y: 2, z: 2 },
                    color: 0x888888,
                },
            ];
            const tip = r._blueprintCostTooltip("_t838c");
            out.costTooltipText = /Bau-Kosten/.test(tip) && /stein/.test(tip) && /hast/.test(tip);
            const origHotbar0 = r.state.hotbar[0];
            r.state.hotbar[0] = "_t838c";
            r._renderHotbarDOM();
            const hslot = document.querySelector('#hotbar .hotbar-slot[data-slot="0"]');
            out.hotbarSlotTitle = !!hslot && /Bau-Kosten/.test(hslot.title || "");
            r.state.hotbar[0] = origHotbar0;
            r._renderHotbarDOM();
            const origInv0 = r.state.player.inventory[0];
            r.state.player.inventory[0] = { kind: "blueprint", blueprintName: "_t838c", count: 1 };
            r.renderInventoryUI();
            const islot = document.querySelector('#inventory-grid .inventory-slot[data-inv-slot="0"]');
            out.invSlotTitle = !!islot && /Bau-Kosten/.test(islot.title || "");
            r.state.player.inventory[0] = origInv0;
            r.renderInventoryUI();
            delete r.state.blueprints["_t838c"];
        }

        // D — Verbindungen im 3D-Preview sichtbar.
        {
            const origSel = r.state.workshop && r.state.workshop.selectedBlueprint;
            if (r.state.blueprints["_t838d"]) delete r.state.blueprints["_t838d"];
            r.createBlueprint("_t838d", "T838D");
            const bp = r.state.blueprints["_t838d"];
            bp.parts = [
                {
                    shape: "box",
                    material: "stein",
                    position: { x: -1, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                    color: 0x888888,
                },
                {
                    shape: "box",
                    material: "stein",
                    position: { x: 1, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                    color: 0x888888,
                },
            ];
            r.addConnectionToBlueprint("_t838d", { type: "masonry", partA: 0, partB: 1 });
            // die Linien sind Werkstatt-Werkzeug: der Test bestellt
            // sie wie der Werkstatt-Viewer (der Test wandert mit).
            const group = r._buildFromBlueprint(bp, 0, undefined, { connectionLines: true });
            const conn = group.children.filter((c) => c.userData && c.userData.isConnectionLine);
            out.connHasLine = conn.some((c) => c.isLine);
            out.connHasMarker = conn.some((c) => c.isMesh);
            out.connDepthTestOff = conn.length > 0 && conn.every((c) => c.material && c.material.depthTest === false);
            // _workshopRebuildPreviewMesh zählt Verbindungen NICHT als Part.
            r.selectBlueprintForEdit("_t838d");
            r._workshopEnsurePreview();
            r._workshopRebuildPreviewMesh();
            const pre = r.state.workshop && r.state.workshop.preview;
            out.connNotCountedAsPart = !!pre && pre.partMeshes.size === 2;
            r._renderWorkshopDOM();
            // die Verbindungs-Erklärung lebte in der alten Editor-Liste (entfernt); Verbindungen
            // werden jetzt im 3D-Connect-Modus angelegt/gelöst. Der frühere „Sollbruchstelle"-Text-Check entfiel.
            delete r.state.blueprints["_t838d"];
            // Auswahl wiederherstellen — kein hängender Verweis auf
            // den gelöschten Test-Bauplan für nachfolgende Tests.
            if (origSel && r.state.blueprints[origSel]) {
                r.selectBlueprintForEdit(origSel);
            }
        }

        // F — 3D-Preview-Höhe.
        {
            // das berechnete Seitenverhältnis des Viewers (die Höhe darf max-height kappen, das Verhältnis nicht)
            const cv = document.getElementById("workshop-preview-canvas");
            out.previewAspect = !!cv && getComputedStyle(cv).aspectRatio.replace(/\s/g, "") === "5/3";
        }

        return out;
    });

    if (erreichbar(check, "Werkstatt-UX Tests laufen", v838Results)) {
        check("Kosten-Tooltip nennt Bau-Kosten + Material + 'hast'", v838Results.costTooltipText);
        check("gefüllter Hotbar-Slot trägt den Kosten-Tooltip", v838Results.hotbarSlotTitle);
        check("Bauplan-Inventar-Slot trägt den Kosten-Tooltip", v838Results.invSlotTitle);
        check("Verbindung rendert eine Linie im 3D-Preview", v838Results.connHasLine);
        check("Verbindung rendert einen Mittelpunkt-Marker", v838Results.connHasMarker);
        check("Verbindungs-Linie + Marker sind depthTest-frei (immer sichtbar)", v838Results.connDepthTestOff);
        check("Verbindungen werden NICHT als Part gezählt (partMeshes korrekt)", v838Results.connNotCountedAsPart);
        check("Preview-Canvas hat aspect-ratio 5/3 (Stats-Panel ohne Scrollen)", v838Results.previewAspect);
    }

    // ### Werkzeug-Klassen + Präzision→Qualität ###
    const v839Results = await safeEvaluate(page, () => {
        const out = {};

        // Farb-Sprache: Rollen-Farben-Konstante.
        const rc = r.constructor && r.constructor.BLUEPRINT_ROLE_COLORS;
        out.roleColorsExist =
            !!rc &&
            typeof rc.armor === "string" &&
            typeof rc.tool === "string" &&
            typeof rc.soul === "string" &&
            typeof rc.architecture === "string";

        // computeBlueprintQuality.
        out.qualityUnworked =
            r.computeBlueprintQuality({
                parts: [{ shape: "box", material: "stein", size: { x: 1, y: 1, z: 1 } }],
            }) === 1.0;
        const qWorked = r.computeBlueprintQuality({
            parts: [
                {
                    shape: "box",
                    material: "stein",
                    size: { x: 1, y: 1, z: 1 },
                    opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                },
            ],
        });
        out.qualityWorked = qWorked > 0.3 && qWorked < 0.6;

        // Aufwand: Stamina skaliert mit Werkzeug-cap (pfad-Modus).
        {
            const prevMode = r.getGameMode();
            r.setGameMode("pfad");
            if (r.state.blueprints["_t839s"]) delete r.state.blueprints["_t839s"];
            r.createBlueprint("_t839s", "T839S");
            r.state.blueprints["_t839s"].parts = [
                {
                    shape: "box",
                    material: "eisen",
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                    color: 0x888888,
                    opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                },
            ];
            r.state.player.stamina = 500;
            const b1 = r.state.player.stamina;
            const res1 = r.applyOpToPart("_t839s", 0, "hände");
            const costLow = b1 - r.state.player.stamina;
            const b2 = r.state.player.stamina;
            const res2 = r.applyOpToPart("_t839s", 0, "drehbank-meißel"); // cap 0.9 → niedrigere Mühe (V17.78: polier raus)
            const costHigh = b2 - r.state.player.stamina;
            out.staminaScales = !!res1.ok && !!res2.ok && costLow > costHigh && costLow >= 9 && costHigh <= 7;
            r.setGameMode(prevMode);
            delete r.state.blueprints["_t839s"];
        }

        // Farb-Sprache im DOM: Rollen-Chip-Glow + Bauplan-Zeilen-Glow + Qualität-Zeile.
        {
            const origSel = r.state.workshop && r.state.workshop.selectedBlueprint;
            if (r.state.blueprints["_t839c"]) delete r.state.blueprints["_t839c"];
            r.createBlueprint("_t839c", "T839C");
            r.state.blueprints["_t839c"].parts = [
                {
                    shape: "box",
                    material: "stein",
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                    color: 0x888888,
                    opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                },
            ];
            r.selectBlueprintForEdit("_t839c");
            r._workshopRenderStatsPanel();
            const panel = document.getElementById("workshop-stats-panel");
            const chip = panel ? panel.querySelector(".role-chip") : null;
            out.roleChipGlow = !!chip && !!chip.style.boxShadow && chip.style.boxShadow.length > 0;
            out.qualityRow = !!panel && /Qualität/.test(panel.textContent || "");
            r._renderWorkshopDOM();
            const lrow = document.querySelector("#workshop-list .workshop-list-row");
            out.listRowGlow = !!lrow && !!lrow.style.borderLeft && lrow.style.borderLeft.length > 0;
            delete r.state.blueprints["_t839c"];
            if (origSel && r.state.blueprints[origSel]) {
                r.selectBlueprintForEdit(origSel);
            }
        }

        // W-C(f)/R-008 — der Umwidmen-Rest im Ich FIEL ERSATZLOS: kein
        // <details>-Summary, kein toter Verweis-Hint; #player-equip trägt höchstens
        // die Schnell-Trünke (Gebrauch). Test wandert mit.
        r.renderPlayerEquipUI();
        const eq = document.getElementById("player-equip");
        out.equipHint =
            !!eq && !document.getElementById("equip-advanced-section") && !/umwidmen/i.test(eq.textContent || "");

        return out;
    });

    if (erreichbar(check, "Werkzeug-Klassen Tests laufen", v839Results)) {
        check("BLUEPRINT_ROLE_COLORS-Konstante mit allen Rollen", v839Results.roleColorsExist);
        check("unbearbeiteter Bauplan hat Qualität 1.0 (geboren)", v839Results.qualityUnworked);
        check("bearbeiteter Bauplan trägt seine Werkzeug-Präzision als Qualität", v839Results.qualityWorked);
        check("Werkzeug-Op-Stamina skaliert mit cap (stumpf teurer als fein)", v839Results.staminaScales);
        check("Rollen-Chip leuchtet in der Rollen-Farbe", v839Results.roleChipGlow);
        check("Werkstatt-Stats-Panel zeigt eine Qualität-Zeile", v839Results.qualityRow);
        check("Bauplan-Liste-Zeile leuchtet in der Rollen-Farbe", v839Results.listRowGlow);
        check(
            "W-C(f)/R-008: der Umwidmen-Rest im Ich ist ersatzlos gefallen (kein details/Verweis — die Intent-Akte leben in der Werkstatt)",
            v839Results.equipHint
        );
    }
}

// G8 R1 — der gedämpfte Kanal (M2): EIN Token-Bucket pro Overlay am Eingang
// (auch ready/exit/manifest) + ein per-Peer-Cap auf subworld-net. Eine Flut
// klingt von selbst ab (Verwerfen, nicht Puffern; der Bucket settled).
async function checkBandG8R1DampedChannel({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const K = r.constructor;
        const out = {};
        // (1) Konstanten verdrahtet.
        out.consts = K.PORTAL_CHANNEL_RATE_MAX === 200 && K.PORTAL_CHANNEL_RATE_WINDOW_MS === 1000;
        // (2) Der Kanal-Bucket bändigt eine Flut: 10000 Nachrichten in EINEM
        // Fenster → admittiert genau PORTAL_CHANNEL_RATE_MAX, Rest verworfen.
        const po = {};
        let admitted = 0;
        for (let i = 0; i < 10000; i++) {
            if (r._portalChannelAdmit(po, 1000)) admitted++;
        }
        out.channelCapsFlood = admitted === K.PORTAL_CHANNEL_RATE_MAX;
        out.channelAdmitted = admitted;
        // (3) Der Bucket SETTLED: nach dem Fenster admittiert er wieder (der
        // EPS-Fixpunkt — leeres Fenster = Ruhe, kein „settled nie").
        out.channelSettles = r._portalChannelAdmit(po, 1000 + K.PORTAL_CHANNEL_RATE_WINDOW_MS + 1) === true;
        // (4) Der per-Peer-Cap: 120 admittiert je Peer, der 121. fällt; ein
        // ANDERER Peer ist unabhängig (kein gemeinsamer Eimer).
        let pa = 0;
        for (let i = 0; i < 300; i++) {
            if (r._p2pPeerRateAdmit("g8r1-test", "peerA", K.SUBWORLD_NET_PEER_RATE_MAX)) pa++;
        }
        out.peerCaps = pa === K.SUBWORLD_NET_PEER_RATE_MAX;
        out.peerIndependent = r._p2pPeerRateAdmit("g8r1-test", "peerB", K.SUBWORLD_NET_PEER_RATE_MAX) === true;
        if (r._p2pRate) delete r._p2pRate["g8r1-test"];
        return out;
    });
    if (!res) {
        check("G8 R1: gedämpfter-Kanal-Sonde lief", false, "evaluate warf");
        return;
    }
    check("G8 R1: Kanal-Bucket: die Konstanten verdrahtet", res.consts);
    check(
        "G8 R1: der Kanal-Bucket bändigt die Flut (10000 → genau PORTAL_CHANNEL_RATE_MAX)",
        res.channelCapsFlood,
        `admittiert=${res.channelAdmitted}/200`
    );
    check("G8 R1: der Bucket SETTLED nach dem Fenster (EPS-Fixpunkt, settled-Garantie)", res.channelSettles);
    check("G8 R1: der per-Peer-Cap deckelt je Peer + Peers sind unabhängig", res.peerCaps && res.peerIndependent);
}

// M8 Makro-Fenster: Broker-stats über den BESTEHENDEN WS-Kanal (kein neuer HTTP-Pfad/CSP) · die
// Identitäts-Seite als gefilterter Feed (data-author) · der Vibe-Pass-Backup-Pfad sichtbar. Den
// echten Server-Beweis trägt smoke:multiuser (1 Raum · 2 Peers · nur der Anfrager).
async function checkBandM8MakroFenster({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) der stats-Handler: im Dispatch + cached + schreibt die Anzeige.
        out.dispatch = r.constructor.P2P_MESSAGE_HANDLERS.stats === "_p2pMsgStats";
        const p2p = r.state.p2p || (r.state.p2p = {});
        r._p2pMsgStats({ rooms: 3, peers: 7 }, p2p);
        const el = document.getElementById("p2p-broker-stats");
        out.statsCached = !!p2p.brokerStats && p2p.brokerStats.rooms === 3 && p2p.brokerStats.peers === 7;
        out.statsShown = !!el && /7 online in 3/.test(el.textContent);
        // das welcome des Brokers fragt die stats über den bestehenden Kanal an (gefangen am Senden)
        const sendEigen = Object.prototype.hasOwnProperty.call(r, "p2pSend"),
            sendAlt = r.p2pSend,
            gesendet = [];
        r.p2pSend = (m) => (gesendet.push(m), true);
        try {
            r._p2pMsgWelcome({ peers: [] }, p2p);
        } finally {
            if (sendEigen) r.p2pSend = sendAlt;
            else delete r.p2pSend;
        }
        out.welcomeAsks = gesendet.some((m) => m && m.type === "stats");
        // Müll fällt (defensive Wand).
        r._p2pMsgStats({ rooms: "x", peers: null }, p2p);
        out.statsWall = p2p.brokerStats.rooms === 3;
        // (2) die IDENTITÄTS-SEITE: zwei synthetische Karten, der Autor-Filter
        // blendet die fremde aus + der Kopf steht + ✕ löst.
        const list = document.getElementById("library-list");
        out.identity = false;
        if (list) {
            const mk = (author) => {
                const c = document.createElement("div");
                c.className = "feed-card";
                c.dataset.search = "m8probe";
                c.dataset.kind = "welt";
                c.dataset.author = author;
                list.appendChild(c);
                return c;
            };
            const cA = mk("aa11");
            const cB = mk("bb22");
            const savedKind = r.state.feedKind;
            r.state.feedKind = "alle";
            r.state._libraryAuthorFilter = "aa11";
            r._applyLibraryFilter();
            const banner = list.querySelector(".library-author-banner");
            const filtered = cA.style.display !== "none" && cB.style.display === "none" && !!banner;
            const clearBtn = banner && banner.querySelector(".library-author-clear");
            if (clearBtn) clearBtn.click();
            const cleared =
                !r.state._libraryAuthorFilter &&
                cB.style.display !== "none" &&
                !list.querySelector(".library-author-banner");
            out.identity = filtered && cleared;
            cA.remove();
            cB.remove();
            r.state.feedKind = savedKind;
            r._applyLibraryFilter();
        }
        // (3) der Karten-Chip: ein Klick auf 👤 setzt den Autor-Filter auf den Autor der Karte + der Backup-Hinweis steht.
        const filterVor = r.state._libraryAuthorFilter;
        const chip = r._feedRatingBar({ id: "m8probe-chip", author: "aa11" }).querySelector(".feed-ident");
        if (chip) chip.click();
        out.identChip = !!chip && r.state._libraryAuthorFilter === "aa11";
        r.state._libraryAuthorFilter = filterVor;
        r._applyLibraryFilter();
        const hint = document.getElementById("vibe-pass-backup-hint");
        out.backupHint = !!hint && /Schlüssel/.test(hint.textContent) && /Fälschung/.test(hint.textContent);
        return out;
    });
    check(
        "M8 Makro-Fenster: der Broker-stats-Handler (Dispatch · Cache · Anzeige · welcome fragt an · Müll-Wand)",
        res.dispatch && res.statsCached && res.statsShown && res.welcomeAsks && res.statsWall
    );
    check(
        "M8 Identitäts-Seite: der Autor-Filter zeigt EINEN Schöpfer (Kopf-Banner + ✕ löst) — ein gefilterter Feed, kein neuer Raum",
        res.identity && res.identChip
    );
    check(
        "M8 Vibe-Pass: der Backup-Pfad ist sichtbar dokumentiert (Schlüssel-Wahrheit + Fälschungs-Wand)",
        res.backupHint
    );
}

module.exports = {
    checkBandRing11AndW7Mesh,
    checkBandW16Distribution,
    checkBandLateMultiUser,
    checkBandV8SoulRoleAndWorkshop,
    checkBandG8R1DampedChannel,
    checkBandM8MakroFenster,
};
