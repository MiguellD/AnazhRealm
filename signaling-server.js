// Ring 11 V1+V2: Multi-User Sync — Signaling-Server.
//
// Mini-WebSocket-Broker neben save-server.js. Zwei Zwecke:
//   V1 (Position-Sync): Spieler in derselben "Welt-Raum"-ID erhalten
//        gegenseitig Position+Rotation-Nachrichten (30 Hz).
//   V2 (DSL-AST-Broadcast): Chat-Befehle eines Spielers gehen als
//        DSL-Programm an alle Mitspieler im Raum — jeder Empfänger
//        lässt sie durch seinen eigenen dslRun-Sandbox-Pfad laufen,
//        sodass Welt-Modifikationen (modify_terrain, weather, spawn_*)
//        auf beiden Welten konsistent ausgeführt werden.
//
// KEIN Persistenz, KEIN Spielerstand auf dem Server. Vertrauen liegt
// in der DSL-Sandbox des Clients (Budget-Limits + Op-Whitelist).
//
// Protokoll (alle Nachrichten JSON, eine Zeile):
//   Client → Server   { "type": "join", "room": "<worldId>", "peerId": "<rand>" }
//   Client → Server   { "type": "pos",  "x": .., "y": .., "z": .., "yaw": .. }
//   Client → Server   { "type": "dsl",  "program": [...DSL-AST] }
//   Client → Server   { "type": "world-request", "to": "<hostPeerId>" }   (V2.2 / Ring 11.5)
//   Client → Server   { "type": "world-snapshot", "to": "<guestPeerId>", "state": {...} }
//   Server → Client   { "type": "welcome", "peers": ["peerA", "peerB"] }
//   Server → Client   { "type": "peer-join", "peerId": "..." }
//   Server → Client   { "type": "peer-leave", "peerId": "..." }
//   Server → Client   { "type": "pos", "peerId": "...", "x":.., "y":.., "z":.., "yaw":.. }
//   Server → Client   { "type": "dsl", "peerId": "...", "program": [...] }
//   Server → Client   { "type": "soul", "peerId": "...", "soulName": "...", "bodyParts": [...], "name": "..." }
//   Server → Client   { "type": "aura", "peerId": "...", "hue": .., "intensity": .. }
//   Server → Client   { "type": "world-request", "peerId": "..." }   (forwarded)
//   Server → Client   { "type": "world-snapshot", "peerId": "...", "state": {...} }
//   Client → Server   { "type": "rtc-offer",  "to": "<peerId>", "sdp": {...} }   (W7 P1)
//   Client → Server   { "type": "rtc-answer", "to": "<peerId>", "sdp": {...} }
//   Client → Server   { "type": "rtc-ice",    "to": "<peerId>", "candidate": {...} }
//   Server → Client   { "type": "rtc-offer/answer/ice", "peerId": "<from>", "to": "...", ... }
//
// W7 Phase 1 (Compute-Sharing): der Server wird vom Daten-Relay zum
// reinen WebRTC-Rendezvous. Er reicht SDP-Offer/Answer + ICE-Kandidaten
// zielgerichtet zwischen zwei Peers durch; danach fliessen Position/DSL/
// Soul direkt peer-to-peer ueber RTCDataChannels. Die alten Relay-Pfade
// (pos/dsl/soul/aura/vibe) bleiben als Fallback, falls eine WebRTC-
// Verbindung nicht zustande kommt.
//
// Heilige Lektion: KEIN neues Modul-Geflecht. EINE Datei, ein Server-
// Objekt, vier Handler (join/pos/dsl/disconnect).
//
// WebSocket-Framing ist hier von Hand implementiert (RFC 6455), damit
// keine externe Dependency hinzukommt — das Projekt hat bewusst null
// runtime-deps und behält das so. V1 trägt nur Text-Frames (opcode 1)
// und Close-Frames (opcode 8). Binary-Frames werden verworfen.

const http = require("http");
const crypto = require("crypto");
const os = require("os");

const HOST = process.env.ANAZH_SIGNALING_HOST || "0.0.0.0";
const PORT = Number(process.env.ANAZH_SIGNALING_PORT) || 4313;
const WS_MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

// rooms: Map<roomId, Set<wsClient>>
const rooms = new Map();
// W7 Phase 4 — Public-Lobby. lobby: Map<roomId, {label, publishedAt}>.
// Ein Host veröffentlicht seinen Raum (Opt-in); Mitspieler browsen die
// Liste. Beim Leeren eines Raums wird er auto-de-veröffentlicht.
const lobby = new Map();
// each socket carries .anazh = { peerId, room }

function logLine(level, msg) {
    const ts = new Date().toISOString();
    process.stdout.write(`[signaling] [${ts}] [${level}] ${msg}\n`);
}

function makeAcceptKey(clientKey) {
    return crypto
        .createHash("sha1")
        .update(clientKey + WS_MAGIC)
        .digest("base64");
}

// Frame-Bauer: server → client, kein Mask, payload < 65536 reicht für
// alle V1-Pakete (Position-Update ~80 Bytes, Welcome-Liste < 1 KiB).
function encodeFrame(payload) {
    const data = Buffer.from(payload, "utf8");
    const len = data.length;
    let header;
    if (len < 126) {
        header = Buffer.alloc(2);
        header[0] = 0x81; // FIN + text-opcode
        header[1] = len;
    } else if (len < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(len, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(len), 2);
    }
    return Buffer.concat([header, data]);
}

// Frame-Parser: client → server. Browser maskiert immer (Pflicht per RFC).
// Liefert {opcode, payload, rest} oder null wenn unvollständig.
function tryDecodeFrame(buf) {
    if (buf.length < 2) return null;
    const b0 = buf[0];
    const b1 = buf[1];
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let len = b1 & 0x7f;
    let offset = 2;
    if (len === 126) {
        if (buf.length < 4) return null;
        len = buf.readUInt16BE(2);
        offset = 4;
    } else if (len === 127) {
        if (buf.length < 10) return null;
        const big = buf.readBigUInt64BE(2);
        // V2.2 (Ring 11.5): Cap bei 1 MiB statt 64 KiB, damit Welt-
        // Snapshots beim Join-Flow durchpassen (typisch 50-200 KiB,
        // headroom für Welten mit vielen Architekturen).
        if (big > 1048576n) return { error: "frame_too_big" };
        len = Number(big);
        offset = 10;
    }
    if (!masked) return { error: "client_must_mask" };
    if (buf.length < offset + 4 + len) return null;
    const mask = buf.subarray(offset, offset + 4);
    offset += 4;
    const payload = Buffer.alloc(len);
    for (let i = 0; i < len; i++) payload[i] = buf[offset + i] ^ mask[i % 4];
    return { opcode, payload, rest: buf.subarray(offset + len) };
}

function sendTo(ws, obj) {
    if (!ws || ws.destroyed) return;
    try {
        ws.write(encodeFrame(JSON.stringify(obj)));
    } catch (err) {
        logLine("WARN", `send fehlgeschlagen: ${err.message}`);
    }
}

function broadcastToRoom(roomId, obj, exceptWs) {
    const set = rooms.get(roomId);
    if (!set) return 0;
    let n = 0;
    for (const peer of set) {
        if (peer === exceptWs) continue;
        sendTo(peer, obj);
        n++;
    }
    return n;
}

function handleClientMessage(ws, raw) {
    let msg;
    try {
        msg = JSON.parse(raw.toString("utf8"));
    } catch {
        return;
    }
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "join") {
        const room = String(msg.room || "").slice(0, 64);
        const peerId = String(msg.peerId || "").slice(0, 64);
        if (!room || !peerId) return;
        if (ws.anazh) {
            // doppeltes Join im selben Socket — alt-room aufräumen
            const oldSet = rooms.get(ws.anazh.room);
            if (oldSet) {
                oldSet.delete(ws);
                broadcastToRoom(ws.anazh.room, { type: "peer-leave", peerId: ws.anazh.peerId });
                if (oldSet.size === 0) {
                    rooms.delete(ws.anazh.room);
                    lobby.delete(ws.anazh.room); // W7 P4
                }
            }
        }
        ws.anazh = { peerId, room };
        if (!rooms.has(room)) rooms.set(room, new Set());
        const set = rooms.get(room);
        const peers = Array.from(set)
            .map((p) => p.anazh && p.anazh.peerId)
            .filter(Boolean);
        set.add(ws);
        sendTo(ws, { type: "welcome", peers, lanAddresses: LAN_ADDRESSES });
        broadcastToRoom(room, { type: "peer-join", peerId }, ws);
        logLine("INFO", `join room=${room} peer=${peerId} size=${set.size}`);
        return;
    }
    if (!ws.anazh) return; // unauthenticated, drop
    if (msg.type === "pos") {
        const x = Number(msg.x);
        const y = Number(msg.y);
        const z = Number(msg.z);
        const yaw = Number(msg.yaw);
        if (![x, y, z, yaw].every(Number.isFinite)) return;
        broadcastToRoom(ws.anazh.room, { type: "pos", peerId: ws.anazh.peerId, x, y, z, yaw }, ws);
        return;
    }
    if (msg.type === "creature-pos") {
        // Kreatur-Sicht-Sync — ein Peer streamt die Positionen SEINER
        // Kreaturen; Mitspieler rendern sie als Sicht-Schicht. Server
        // validiert nicht den Inhalt (Client-Render-Schicht), deckelt nur
        // die Listenlänge gegen Missbrauch.
        if (!Array.isArray(msg.list)) return;
        const list = msg.list.slice(0, 64);
        broadcastToRoom(ws.anazh.room, { type: "creature-pos", peerId: ws.anazh.peerId, list }, ws);
        return;
    }
    if (msg.type === "dsl") {
        // Ring 11 V2: DSL-AST-Broadcast. Server forwarded das Programm,
        // jeder Empfänger lässt es durch seinen eigenen dslRun-Sandbox-
        // Pfad laufen. Server validiert nicht (Vertrauen liegt im
        // Sandbox des Clients) — er begrenzt nur per-Frame-Größe via
        // Decode-Cap (1 MiB) und prüft, dass program ein Array ist.
        if (!Array.isArray(msg.program)) return;
        if (msg.program.length === 0 || msg.program.length > 256) return;
        broadcastToRoom(ws.anazh.room, { type: "dsl", peerId: ws.anazh.peerId, program: msg.program }, ws);
        return;
    }
    if (msg.type === "soul") {
        // Ring 11 V3: Soul-Sync — der Peer teilt seine Seele (Name + ggf.
        // bodyParts für Custom-Seelen) + Avatar-Namen. Selten gesendet
        // (Join + Soul-Wechsel). Server stempelt die authoritative peerId.
        const soulName = typeof msg.soulName === "string" ? msg.soulName.slice(0, 64) : "";
        if (!soulName) return;
        const out = { type: "soul", peerId: ws.anazh.peerId, soulName };
        if (Array.isArray(msg.bodyParts) && msg.bodyParts.length <= 64) {
            out.bodyParts = msg.bodyParts;
        }
        if (typeof msg.name === "string") out.name = msg.name.slice(0, 48);
        // W7 Phase 2: die Welt-Rolle (host/guest/solo) durchreichen.
        if (typeof msg.worldRole === "string") out.worldRole = msg.worldRole.slice(0, 16);
        // W7 Phase 3: teilt der Peer seine LLM-Stimme?
        if (typeof msg.voiceShared === "boolean") out.voiceShared = msg.voiceShared;
        broadcastToRoom(ws.anazh.room, out, ws);
        return;
    }
    if (msg.type === "aura") {
        // Ring 11 V3: Aura-Sync — dominante Tag-Hue + Intensität, ~1 Hz.
        const hue = Number(msg.hue);
        const intensity = Number(msg.intensity);
        if (![hue, intensity].every(Number.isFinite)) return;
        broadcastToRoom(ws.anazh.room, { type: "aura", peerId: ws.anazh.peerId, hue, intensity }, ws);
        return;
    }
    if (msg.type === "vibe") {
        // W13 Phase 3: Vibe-Pass-Identität — der Peer teilt seinen
        // öffentlichen ed25519-Schlüssel (vibePassId) + einen Beweis
        // (Signatur über die eigene peerId). Der Server stempelt die
        // authoritative peerId und reicht durch; die Verifikation des
        // Beweises macht der Empfänger (der Server vertraut nichts).
        const vibePassId = typeof msg.vibePassId === "string" ? msg.vibePassId.slice(0, 128) : "";
        const proof = typeof msg.proof === "string" ? msg.proof.slice(0, 256) : "";
        if (!vibePassId || !proof) return;
        broadcastToRoom(ws.anazh.room, { type: "vibe", peerId: ws.anazh.peerId, vibePassId, proof }, ws);
        return;
    }
    if (msg.type === "companion-say") {
        // W11 Phase 4: Voice-Sync — der Begleiter-Output eines Spielers.
        // Mitspieler spielen ihn via SpeechSynthesis ab. Server stempelt die
        // authoritative peerId, deckelt Text + Voice-Name; den Inhalt
        // validiert er nicht (reine Client-Audio-Schicht).
        const text = typeof msg.text === "string" ? msg.text.slice(0, 280) : "";
        if (!text) return;
        const voice = typeof msg.voice === "string" ? msg.voice.slice(0, 80) : "";
        broadcastToRoom(ws.anazh.room, { type: "companion-say", peerId: ws.anazh.peerId, text, voice }, ws);
        return;
    }
    if (msg.type === "rtc-offer" || msg.type === "rtc-answer" || msg.type === "rtc-ice") {
        // W7 Phase 1: WebRTC-Signaling. Zielgerichtetes Durchreichen von
        // SDP-Offer/Answer und ICE-Kandidaten zwischen genau zwei Peers,
        // damit sie eine direkte RTCDataChannel-Verbindung aufbauen.
        // Server stempelt die authoritative Sender-peerId; er validiert
        // die SDP-/ICE-Payload NICHT — der Browser jedes Clients ist die
        // Vertrauens-Wand (wie bei dsl/world-snapshot).
        const target = typeof msg.to === "string" ? msg.to.slice(0, 64) : null;
        if (!target) return;
        const out = { type: msg.type, peerId: ws.anazh.peerId, to: target };
        if (msg.type === "rtc-ice") {
            // candidate darf ein Objekt oder null sein (end-of-candidates).
            if (msg.candidate !== null && (!msg.candidate || typeof msg.candidate !== "object")) return;
            out.candidate = msg.candidate;
        } else {
            if (!msg.sdp || typeof msg.sdp !== "object") return;
            out.sdp = msg.sdp;
        }
        const rtcSet = rooms.get(ws.anazh.room);
        if (!rtcSet) return;
        for (const peer of rtcSet) {
            if (peer.anazh && peer.anazh.peerId === target) {
                sendTo(peer, out);
                break;
            }
        }
        return;
    }
    if (msg.type === "world-request" || msg.type === "world-snapshot") {
        // Ring 11.5: Welt-Snapshot-Transfer beim Multi-User-Join. Wer
        // joinen will, sendet world-request (broadcast → Host antwortet);
        // Host sendet world-snapshot mit `to: <guestPeerId>` zurück
        // (targeted delivery, nur dieser eine Peer erhält es). Server
        // validiert hier nicht — Sandbox + loadState-Validation des
        // Clients sind die Vertrauens-Wand.
        const target = typeof msg.to === "string" ? msg.to.slice(0, 64) : null;
        const out = { type: msg.type, peerId: ws.anazh.peerId };
        if (target) out.to = target;
        if (msg.type === "world-request") {
            // world-request hat keine state-payload, nur Aufforderung
        } else if (msg.type === "world-snapshot") {
            // world-snapshot trägt den Welt-Snapshot. Server prüft NUR
            // dass es ein Objekt ist; der Joiner-Client führt loadState
            // mit den üblichen Validierungs-Pfaden aus.
            if (!msg.state || typeof msg.state !== "object") return;
            out.state = msg.state;
        }
        if (target) {
            // Targeted: nur an den expliziten Empfänger schicken
            const set = rooms.get(ws.anazh.room);
            if (!set) return;
            for (const peer of set) {
                if (peer.anazh && peer.anazh.peerId === target) {
                    sendTo(peer, out);
                    break;
                }
            }
        } else {
            // Broadcast (default für world-request — wir wissen nicht im
            // Voraus, welcher Peer Host ist)
            broadcastToRoom(ws.anazh.room, out, ws);
        }
        return;
    }
    if (msg.type === "lobby-publish") {
        // W7 Phase 4 — den eigenen Raum öffentlich browsbar machen.
        const label = String(msg.label || "").slice(0, 48) || ws.anazh.room.slice(0, 24);
        lobby.set(ws.anazh.room, { label, publishedAt: Date.now() });
        logLine("INFO", `lobby-publish room=${ws.anazh.room} label="${label}"`);
        return;
    }
    if (msg.type === "lobby-unpublish") {
        lobby.delete(ws.anazh.room);
        return;
    }
    if (msg.type === "lobby-list") {
        // Liste aller veröffentlichten Räume mit aktueller Spielerzahl.
        const list = [];
        for (const [roomId, meta] of lobby) {
            const set = rooms.get(roomId);
            const peers = set ? set.size : 0;
            if (peers <= 0) continue; // leerer Raum — überspringen
            list.push({ room: roomId, label: meta.label, peers });
        }
        sendTo(ws, { type: "lobby-rooms", rooms: list });
        return;
    }
}

function handleDisconnect(ws) {
    if (!ws.anazh) return;
    const set = rooms.get(ws.anazh.room);
    if (set) {
        set.delete(ws);
        broadcastToRoom(ws.anazh.room, { type: "peer-leave", peerId: ws.anazh.peerId });
        if (set.size === 0) {
            rooms.delete(ws.anazh.room);
            lobby.delete(ws.anazh.room); // W7 P4 — leerer Raum verlässt die Lobby
        }
    }
    logLine("INFO", `leave room=${ws.anazh.room} peer=${ws.anazh.peerId}`);
}

const server = http.createServer((req, res) => {
    // Health-Endpoint für Monitoring + Playtest. JSON, kein WS.
    if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        const stats = { rooms: rooms.size, peers: 0 };
        for (const s of rooms.values()) stats.peers += s.size;
        res.end(JSON.stringify({ ok: true, ...stats }));
        return;
    }
    res.writeHead(404);
    res.end();
});

server.on("upgrade", (req, socket) => {
    const key = req.headers["sec-websocket-key"];
    if (!key) {
        socket.destroy();
        return;
    }
    const accept = makeAcceptKey(key);
    socket.write(
        "HTTP/1.1 101 Switching Protocols\r\n" +
            "Upgrade: websocket\r\n" +
            "Connection: Upgrade\r\n" +
            `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
    );
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        while (buffer.length >= 2) {
            const result = tryDecodeFrame(buffer);
            if (!result) break;
            if (result.error) {
                logLine("WARN", `Frame-Fehler: ${result.error}`);
                socket.destroy();
                return;
            }
            buffer = result.rest;
            if (result.opcode === 0x1) handleClientMessage(socket, result.payload);
            else if (result.opcode === 0x8) {
                handleDisconnect(socket);
                socket.end();
                return;
            }
            // Binary (0x2) und Ping (0x9) werden in V1 ignoriert.
        }
    });
    socket.on("close", () => handleDisconnect(socket));
    socket.on("error", (err) => {
        logLine("WARN", `socket-Fehler: ${err.message}`);
        handleDisconnect(socket);
    });
});

// Liste der LAN-IPv4-Adressen, damit andere Rechner wissen, wohin
// sie sich verbinden müssen. Loopback (127.0.0.1) wird separat
// dokumentiert für den lokalen Browser.
function listLanIPv4Addresses() {
    const interfaces = os.networkInterfaces();
    const out = [];
    for (const name in interfaces) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === "IPv4" && !iface.internal) {
                out.push({ name, address: iface.address });
            }
        }
    }
    return out;
}

// Ring 11.5: Cache der LAN-Adressen für welcome-Messages. Damit Host-
// Clients ihre Einladungs-URL bauen können, ohne den User nach der
// IP zu fragen. Wird einmal beim Start berechnet — Interfaces ändern
// sich selten zur Laufzeit.
const LAN_ADDRESSES = listLanIPv4Addresses().map((iface) => `${iface.address}:${PORT}`);

server.listen(PORT, HOST, () => {
    logLine("INFO", `signaling-server lauscht auf ${HOST}:${PORT}`);
    logLine("INFO", `Lokaler Browser: ws://127.0.0.1:${PORT}`);
    const lans = listLanIPv4Addresses();
    if (lans.length === 0) {
        logLine("INFO", "Keine LAN-IPv4 gefunden — andere Rechner können nicht verbinden.");
    } else {
        for (const { name, address } of lans) {
            logLine("INFO", `Andere Rechner im Netzwerk: ws://${address}:${PORT}  (Interface ${name})`);
        }
        logLine("INFO", "Beide Browser müssen DIESELBE Adresse + DIESELBE worldId nutzen.");
    }
});

// Export für Tests, falls als Modul geladen (kein Effect bei direct-run).
module.exports = { server, rooms, lobby };
