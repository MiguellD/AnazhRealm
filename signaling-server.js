// Ring 11 V1: Multi-User Position-Sync — Signaling-Server.
//
// Mini-WebSocket-Broker neben save-server.js. EIN Zweck: Spieler in
// derselben "Welt-Raum"-ID erhalten gegenseitig Positions- und Präsenz-
// Nachrichten. KEIN Persistenz, KEIN Spielerstand, KEIN DSL-Trust:
// Welt-Daten + DSL-Programme bleiben in V1 strikt lokal pro Browser.
// V1-Akzeptanz aus docs/roadmap.md: "zwei Browser-Tabs, beide Spieler
// sehen sich bewegen". DSL-Sync ist explizit Ring 11 V2.
//
// Protokoll (alle Nachrichten JSON, eine Zeile):
//   Client → Server   { "type": "join", "room": "<worldId>", "peerId": "<rand>" }
//   Client → Server   { "type": "pos",  "x": .., "y": .., "z": .., "yaw": .. }
//   Server → Client   { "type": "welcome", "peers": ["peerA", "peerB"] }
//   Server → Client   { "type": "peer-join", "peerId": "..." }
//   Server → Client   { "type": "peer-leave", "peerId": "..." }
//   Server → Client   { "type": "pos", "peerId": "...", "x":.., "y":.., "z":.., "yaw":.. }
//
// Heilige Lektion: KEIN neues Modul-Geflecht. EINE Datei, ein Server-
// Objekt, drei Handler. Wer mehr braucht, sollte vorher Ring 11 V2
// neu denken.
//
// WebSocket-Framing ist hier von Hand implementiert (RFC 6455), damit
// keine externe Dependency hinzukommt — das Projekt hat bewusst null
// runtime-deps und behält das so. V1 trägt nur Text-Frames (opcode 1)
// und Close-Frames (opcode 8). Binary-Frames werden verworfen.

const http = require("http");
const crypto = require("crypto");

const HOST = process.env.ANAZH_SIGNALING_HOST || "127.0.0.1";
const PORT = Number(process.env.ANAZH_SIGNALING_PORT) || 4313;
const WS_MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

// rooms: Map<roomId, Set<wsClient>>
const rooms = new Map();
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
        if (big > 65536n) return { error: "frame_too_big" };
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
            }
        }
        ws.anazh = { peerId, room };
        if (!rooms.has(room)) rooms.set(room, new Set());
        const set = rooms.get(room);
        const peers = Array.from(set)
            .map((p) => p.anazh && p.anazh.peerId)
            .filter(Boolean);
        set.add(ws);
        sendTo(ws, { type: "welcome", peers });
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
    }
}

function handleDisconnect(ws) {
    if (!ws.anazh) return;
    const set = rooms.get(ws.anazh.room);
    if (set) {
        set.delete(ws);
        broadcastToRoom(ws.anazh.room, { type: "peer-leave", peerId: ws.anazh.peerId });
        if (set.size === 0) rooms.delete(ws.anazh.room);
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

server.listen(PORT, HOST, () => {
    logLine("INFO", `signaling-server lauscht auf ws://${HOST}:${PORT}`);
});

// Export für Tests, falls als Modul geladen (kein Effect bei direct-run).
module.exports = { server, rooms };
