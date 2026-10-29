"use strict";
// scripts/playtest/netz-portal.cjs — der Richter von Netz/portal (spec/stamm/modul-karte.json): Portal-Eintritt · Ko-Präsenz · Dwelling · Portal-Server.
// 7 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

async function checkBandW17Multiplayer({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### das Mesh-als-Server ###
    // Ein `ws-send` der fremden Welt wird ein subworld-net-Broadcast, jeder Peer im selben Sub-Welt-Raum
    // stellt ihn in sein iframe zu. Geprüft: Broadcast, Kanal-Verfolgung, Sub-Raum-Eingrenzung,
    // Rate-Limit + Deckel; Zwei-Browser-Durchlauf: smoke-webrtc.cjs.
    const w17bResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const MAXB = r.constructor.SUBWORLD_NET_MAX_BYTES;
        const CAP = r.constructor.SUBWORLD_NET_RATE_MAX;

        // _sanitizePortalMeta — das multiplayer-Flag (Phase-A-Erbe).
        const sanDefault = r._sanitizePortalMeta({ world: "worlds/skeleton/index.html" }, "fb");
        out.sanitizeDefaultsFalse = sanDefault.multiplayer === false;
        const sanMp = r._sanitizePortalMeta({ world: "worlds/skeleton/index.html", multiplayer: true }, "fb");
        out.sanitizeKeepsTrue = sanMp.multiplayer === true;

        // _buildPortalOverlay — multiplayer:true hängt ?anazh-shim=1
        // an, setzt das Flag + legt einen netChannels-Set an.
        r._buildPortalOverlay({
            world: "worlds/skeleton/index.html",
            multiplayer: true,
            trust: "sandboxed",
        });
        const mpFrame = document.querySelector("#portal-overlay iframe.portal-frame");
        out.overlayMultiplayer =
            !!r._portalOverlay &&
            r._portalOverlay.multiplayer === true &&
            r._portalOverlay.netChannels instanceof Set &&
            !!mpFrame &&
            /\?anazh-shim=1$/.test(mpFrame.getAttribute("src") || "");
        r._disposePortalOverlay();

        // multiplayer:false → kein Marker.
        r._buildPortalOverlay({ world: "worlds/skeleton/index.html", trust: "sandboxed" });
        const plainFrame = document.querySelector("#portal-overlay iframe.portal-frame");
        out.overlayNoMarkerWhenSingle = !!plainFrame && !(plainFrame.getAttribute("src") || "").includes("anazh-shim");
        r._disposePortalOverlay();

        // p2pSend hooken: subworld-net-Broadcasts einfangen (im
        // Playtest steht kein Mesh — der Hook IST der Empfänger).
        const sent = [];
        const origSend = r.p2pSend;
        r.p2pSend = (obj) => {
            if (obj && obj.type === "subworld-net") sent.push(obj);
            return false;
        };

        // Ein Multiplayer-Portal mit iframe-Spy + Rate-Limit-Fenster.
        const SUBW = "worlds/skeleton/index.html";
        const posted = [];
        const makeOverlay = () => ({
            multiplayer: true,
            trust: "sandboxed",
            world: SUBW,
            netChannels: new Set(),
            netWindowStart: 0,
            netWindowCount: 0,
            iframe: { contentWindow: { postMessage: (m, o) => posted.push({ m, o }) } },
        });
        r._portalOverlay = makeOverlay();

        // B1 — ws-open verfolgt den Kanal, ws-close entfernt ihn.
        r._portalNetReceive({ __anazhNet: true, kind: "ws-open", channel: 3 });
        out.wsOpenTracks = r._portalOverlay.netChannels.has(3);
        r._portalNetReceive({ __anazhNet: true, kind: "ws-close", channel: 3 });
        out.wsCloseUntracks = !r._portalOverlay.netChannels.has(3);

        // B1 — ws-send wird ein subworld-net-Broadcast (kein Echo
        // mehr): er trägt den Welt-Pfad als worldId + die Daten.
        sent.length = 0;
        const r1 = r._portalNetReceive({ __anazhNet: true, kind: "ws-send", channel: 1, data: "hallo" });
        out.wsSendBroadcasts =
            r1 === true &&
            sent.length === 1 &&
            sent[0].type === "subworld-net" &&
            sent[0].worldId === SUBW &&
            sent[0].data === "hallo";
        // ... der Sender bekommt KEIN Echo ins eigene iframe.
        out.wsSendNoEcho = posted.length === 0;

        // B3 — Größen-Deckel: Übergröße + Nicht-String verworfen.
        sent.length = 0;
        const rBig = r._portalNetReceive({
            __anazhNet: true,
            kind: "ws-send",
            channel: 1,
            data: "x".repeat(MAXB + 1),
        });
        const rObj = r._portalNetReceive({
            __anazhNet: true,
            kind: "ws-send",
            channel: 1,
            data: { not: "string" },
        });
        out.wsSendCapsSize = rBig === false && rObj === false && sent.length === 0;

        // B3 — Rate-Limit: nach SUBWORLD_NET_RATE_MAX Nachrichten
        // in einem Fenster wird die nächste verworfen.
        r._portalOverlay = makeOverlay();
        sent.length = 0;
        let allOk = true;
        for (let i = 0; i < CAP; i++) {
            if (r._portalNetReceive({ __anazhNet: true, kind: "ws-send", channel: 1, data: "m" + i }) !== true)
                allOk = false;
        }
        const overflow = r._portalNetReceive({
            __anazhNet: true,
            kind: "ws-send",
            channel: 1,
            data: "over",
        });
        out.wsSendRateLimited = allOk && overflow === false && sent.length === CAP;

        // Ein Nicht-Multiplayer-Portal broadcastet nicht.
        r._portalOverlay = makeOverlay();
        r._portalOverlay.multiplayer = false;
        sent.length = 0;
        r._portalNetReceive({ __anazhNet: true, kind: "ws-send", channel: 1, data: "y" });
        out.gatedOnMultiplayer = sent.length === 0;

        // _portalNetDeliver — B2: ein subworld-net für GENAU diese
        // Sub-Welt wird in jeden offenen Kanal des iframes gereicht.
        r._portalOverlay = makeOverlay();
        r._portalOverlay.netChannels = new Set([5, 8]);
        posted.length = 0;
        const d1 = r._portalNetDeliver({
            type: "subworld-net",
            peerId: "px",
            worldId: SUBW,
            data: "eingang",
        });
        out.deliverPostsToChannels =
            d1 === true &&
            posted.length === 2 &&
            posted.every((p) => p.m.__anazhNet === true && p.m.kind === "ws-recv" && p.m.data === "eingang") &&
            posted.some((p) => p.m.channel === 5) &&
            posted.some((p) => p.m.channel === 8) &&
            posted.every((p) => p.o === "*");

        // B2 — Verkehr einer ANDEREN Sub-Welt wird verworfen.
        posted.length = 0;
        const dOther = r._portalNetDeliver({
            type: "subworld-net",
            peerId: "px",
            worldId: "worlds/fluid/index.html",
            data: "fremd",
        });
        out.deliverDropsOtherRoom = dOther === false && posted.length === 0;

        // B3 — der Empfangs-Pfad verwirft Übergröße ebenso.
        posted.length = 0;
        const dBig = r._portalNetDeliver({
            type: "subworld-net",
            peerId: "px",
            worldId: SUBW,
            data: "x".repeat(MAXB + 1),
        });
        out.deliverCapsSize = dBig === false && posted.length === 0;

        // subworld-net ist kanal-zustellbar: _p2pHandleChannelMessage reicht es (ALLOWED-Whitelist) an
        // p2pHandleMessage → _portalNetDeliver → iframe.
        r._portalOverlay = makeOverlay();
        r._portalOverlay.netChannels = new Set([1]);
        posted.length = 0;
        r._p2pHandleChannelMessage(
            "fern-peer",
            JSON.stringify({ type: "subworld-net", worldId: SUBW, data: "via-kanal" })
        );
        out.channelDeliverable = posted.some((p) => p.m.kind === "ws-recv" && p.m.data === "via-kanal");

        r._portalOverlay = null;
        r.p2pSend = origSend;

        // buildStateSnapshot persistiert multiplayer im portalMeta
        // (der feste Feld-Satz — Lehre); _sanitizePortalMeta
        // (oben geprüft) ist der Lade-Pfad → zusammen der Rundlauf.
        const bpName = "_w17b_portal";
        const wp = r.state.blueprints["welt_portal"];
        r.state.blueprints[bpName] = {
            name: bpName,
            label: "W17 Test-Portal",
            builtIn: false,
            parts: JSON.parse(JSON.stringify(wp.parts)),
            connections: [],
            role: "portal",
            portalMeta: r._sanitizePortalMeta(
                { world: "worlds/skeleton/index.html", label: "W17 Test-Portal", multiplayer: true },
                "W17 Test-Portal"
            ),
        };
        const snap = r.buildStateSnapshot();
        const snapBp = (snap.blueprints || []).find((b) => b.name === bpName);
        out.snapshotKeepsMultiplayer = !!snapBp && !!snapBp.portalMeta && snapBp.portalMeta.multiplayer === true;
        delete r.state.blueprints[bpName];

        return out;
    });
    if (!w17bResults || w17bResults.error) {
        check(
            "W17 Phase B-Relay: das Mesh-als-Server erreichbar",
            false,
            (w17bResults && w17bResults.error) || "page.evaluate fehlgeschlagen"
        );
    } else {
        check("W17 B: _sanitizePortalMeta — multiplayer Default false", w17bResults.sanitizeDefaultsFalse);
        check("W17 B: _sanitizePortalMeta bewahrt multiplayer:true", w17bResults.sanitizeKeepsTrue);
        check(
            "W17 B: _buildPortalOverlay (multiplayer) hängt ?anazh-shim=1 an + legt netChannels an",
            w17bResults.overlayMultiplayer
        );
        check("W17 B: _buildPortalOverlay (single) lädt OHNE Shim-Marker", w17bResults.overlayNoMarkerWhenSingle);
        check(
            "W17 B: ws-open verfolgt den Kanal, ws-close entfernt ihn",
            w17bResults.wsOpenTracks && w17bResults.wsCloseUntracks
        );
        check("W17 B: ein ws-send wird ein subworld-net-Mesh-Broadcast (worldId + data)", w17bResults.wsSendBroadcasts);
        check("W17 B: der Sender bekommt keinen Echo-Loopback mehr (Phase A ersetzt)", w17bResults.wsSendNoEcho);
        check("W17 B: ws-send verwirft Übergröße + Nicht-String-Daten (B3)", w17bResults.wsSendCapsSize);
        check("W17 B: ws-send ist auf SUBWORLD_NET_RATE_MAX je Sekunde gedeckelt (B3)", w17bResults.wsSendRateLimited);
        check("W17 B: nur ein Multiplayer-Portal broadcastet", w17bResults.gatedOnMultiplayer);
        check(
            "W17 B: _portalNetDeliver reicht einen subworld-net in jeden offenen Kanal",
            w17bResults.deliverPostsToChannels
        );
        check(
            "W17 B: _portalNetDeliver verwirft Verkehr einer anderen Sub-Welt (B2)",
            w17bResults.deliverDropsOtherRoom
        );
        check("W17 B: _portalNetDeliver verwirft Übergröße auf dem Empfangs-Pfad (B3)", w17bResults.deliverCapsSize);
        check("W17 B: subworld-net ist kanal-zustellbar (in der ALLOWED-Whitelist)", w17bResults.channelDeliverable);
        check(
            "W17 B: multiplayer im portalMeta überlebt den buildStateSnapshot-Schreib-Pfad",
            w17bResults.snapshotKeepsMultiplayer
        );
    }

    // ### der Compute-Host ###
    // Welten mit autoritativer Server-JS: ein Peer wird Compute-Host (Server-JS in einem verborgenen,
    // sandgesicherten iframe), Gäste routen an ihn (subworld-srv), Antworten kommen gezielt zurück
    // (subworld-cli). Geprüft: Routing-Methoden; Zwei-Browser-Durchlauf: smoke-webrtc.
    const w17jsResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const MAXB = r.constructor.SUBWORLD_NET_MAX_BYTES;
        const SUBW = "worlds/skeleton/index.html";
        const OTHER = "worlds/fluid/index.html";

        // _sanitizePortalMeta — serverMode Default "relay".
        out.sanitizeDefaultRelay = r._sanitizePortalMeta({ world: SUBW }, "x").serverMode === "relay";
        // serverMode "js-compute" bleibt + erzwingt multiplayer.
        const sjs = r._sanitizePortalMeta({ world: SUBW, serverMode: "js-compute" }, "x");
        out.sanitizeJsComputeForcesMp = sjs.serverMode === "js-compute" && sjs.multiplayer === true;

        // aimBlueprintAtWorld trägt serverMode aus dem Eintrag.
        let aimCarries = false;
        r.state.customWorlds = r.state.customWorlds || {};
        r.state.customWorlds._w17js_e = {
            id: "_w17js_e",
            label: "W17 JS-Welt",
            world: "worlds/_w17js_e/index.html",
            dsl: [],
            reachable: true,
            multiplayer: true,
            serverMode: "js-compute",
        };
        if (r.cloneBlueprint("welt_portal", "_w17js_aim")) {
            const aim = r.aimBlueprintAtWorld("_w17js_aim", "_w17js_e");
            const bp = r.state.blueprints["_w17js_aim"];
            aimCarries = aim.ok && !!bp.portalMeta && bp.portalMeta.serverMode === "js-compute";
            delete r.state.blueprints["_w17js_aim"];
        }
        delete r.state.customWorlds._w17js_e;
        out.aimCarriesServerMode = aimCarries;

        // _buildPortalOverlay — ein js-compute-Host baut ein
        // Server-Kontext-iframe (?anazh-server=1); ein Gast nicht;
        // ein Relay-Portal hat keine Compute-Rolle.
        r._buildPortalOverlay(
            { world: SUBW, label: "JS", multiplayer: true, serverMode: "js-compute", trust: "sandboxed" },
            { computeRole: "host" }
        );
        let po = r._portalOverlay;
        out.overlayHostBuildsServerFrame =
            !!po &&
            po.serverMode === "js-compute" &&
            po.computeRole === "host" &&
            !!po.serverIframe &&
            (po.serverIframe.getAttribute("src") || "").includes("anazh-server=1") &&
            po.serverIframe.getAttribute("sandbox") === "allow-scripts";
        r._disposePortalOverlay();

        r._buildPortalOverlay(
            { world: SUBW, label: "JS", multiplayer: true, serverMode: "js-compute", trust: "sandboxed" },
            { computeRole: "guest", hostPeerId: "hostX" }
        );
        po = r._portalOverlay;
        out.overlayGuestNoServerFrame =
            !!po && po.computeRole === "guest" && po.hostPeerId === "hostX" && po.serverIframe === null;
        r._disposePortalOverlay();

        r._buildPortalOverlay({ world: SUBW, label: "Relay", multiplayer: true, trust: "sandboxed" });
        po = r._portalOverlay;
        out.overlayRelayNoComputeRole =
            !!po && po.serverMode === "relay" && po.computeRole === null && po.serverIframe === null;
        r._disposePortalOverlay();

        // Spies: das Server-iframe, das Client-iframe, die
        // gezielten Kanal-Sends + die subworld-net-Broadcasts.
        const srvPosted = [];
        const posted = [];
        const chanSent = [];
        const sent = [];
        const origChan = r._p2pSendChannelTo;
        r._p2pSendChannelTo = (pid, obj) => {
            chanSent.push({ pid, obj });
            return true;
        };
        const origSend = r.p2pSend;
        r.p2pSend = (obj) => {
            if (obj && obj.type === "subworld-net") sent.push(obj);
            return false;
        };
        const makeJs = (role, host) => ({
            multiplayer: true,
            trust: "sandboxed",
            serverMode: "js-compute",
            computeRole: role,
            hostPeerId: host || null,
            world: SUBW,
            netChannels: new Set([1]),
            netWindowStart: 0,
            netWindowCount: 0,
            iframe: { contentWindow: { postMessage: (m, o) => posted.push({ m, o }) } },
            serverIframe:
                role === "host" ? { contentWindow: { postMessage: (m, o) => srvPosted.push({ m, o }) } } : null,
            serverReady: true,
            serverQueue: [],
            serverConns: new Set(),
        });
        const selfConn = r._portalSelfConnId();

        // Host — ws-open registriert die eigene Verbindung (srv-open).
        r._portalOverlay = makeJs("host");
        srvPosted.length = 0;
        r._portalNetReceive({ __anazhNet: true, kind: "ws-open", channel: 1 });
        out.hostWsOpenRegistersConn =
            srvPosted.length === 1 && srvPosted[0].m.kind === "srv-open" && srvPosted[0].m.conn === selfConn;

        // Host — ein ws-send geht in den Server-Kontext (srv-recv),
        // NICHT als subworld-net-Broadcast.
        r._portalOverlay = makeJs("host");
        srvPosted.length = 0;
        sent.length = 0;
        const hr = r._portalNetReceive({ __anazhNet: true, kind: "ws-send", channel: 1, data: "7" });
        out.hostWsSendFeedsServer =
            hr === true &&
            sent.length === 0 &&
            srvPosted.some((p) => p.m.kind === "srv-open" && p.m.conn === selfConn) &&
            srvPosted.some((p) => p.m.kind === "srv-recv" && p.m.conn === selfConn && p.m.data === "7");

        // Gast — ein ws-send geht NUR an den Host (subworld-srv),
        // NICHT broadcastet.
        r._portalOverlay = makeJs("guest", "hostX");
        chanSent.length = 0;
        sent.length = 0;
        const gr = r._portalNetReceive({ __anazhNet: true, kind: "ws-send", channel: 1, data: "5" });
        out.guestWsSendRoutesToHost =
            gr === true &&
            sent.length === 0 &&
            chanSent.length === 1 &&
            chanSent[0].pid === "hostX" &&
            chanSent[0].obj.type === "subworld-srv" &&
            chanSent[0].obj.kind === "send" &&
            chanSent[0].obj.data === "5";

        // Host — ein subworld-srv eines Gastes wird in den Server-
        // Kontext gereicht (srv-open + srv-recv, conn = peerId).
        r._portalOverlay = makeJs("host");
        srvPosted.length = 0;
        r._portalSrvFromGuest("guestB", { kind: "send", worldId: SUBW, data: "5" });
        out.srvFromGuestFeedsServer =
            srvPosted.some((p) => p.m.kind === "srv-open" && p.m.conn === "guestB") &&
            srvPosted.some((p) => p.m.kind === "srv-recv" && p.m.conn === "guestB" && p.m.data === "5");

        // Host — ein subworld-srv fremder Sub-Welt / Übergröße wird
        // verworfen (worldId-Eingrenzung + Größen-Deckel).
        r._portalOverlay = makeJs("host");
        srvPosted.length = 0;
        const fOther = r._portalSrvFromGuest("g", { kind: "send", worldId: OTHER, data: "x" });
        const fBig = r._portalSrvFromGuest("g", {
            kind: "send",
            worldId: SUBW,
            data: "x".repeat(MAXB + 1),
        });
        out.srvFromGuestGated = fOther === false && fBig === false && srvPosted.length === 0;

        // Host — srv-send für die eigene Verbindung wird lokal ins
        // eigene Client-iframe gestellt.
        r._portalOverlay = makeJs("host");
        posted.length = 0;
        r._portalSrvReceive({ __anazhNet: true, kind: "srv-send", conn: selfConn, data: "7" });
        out.srvReceiveSelfDeliversLocal =
            posted.length === 1 && posted[0].m.kind === "ws-recv" && posted[0].m.data === "7";

        // Host — srv-send für einen Gast geht gezielt als
        // subworld-cli an dessen Kanal.
        r._portalOverlay = makeJs("host");
        chanSent.length = 0;
        r._portalSrvReceive({ __anazhNet: true, kind: "srv-send", conn: "guestB", data: "12" });
        out.srvReceiveGuestRoutesBack =
            chanSent.length === 1 &&
            chanSent[0].pid === "guestB" &&
            chanSent[0].obj.type === "subworld-cli" &&
            chanSent[0].obj.data === "12";

        // Gast — ein subworld-cli des eigenen Hosts wird ins
        // Client-iframe gestellt; von einem fremden Peer verworfen.
        r._portalOverlay = makeJs("guest", "hostX");
        posted.length = 0;
        const cliOk = r._portalCliReceive("hostX", { worldId: SUBW, data: "12" });
        out.cliReceiveDeliversToClient = cliOk === true && posted.length === 1 && posted[0].m.data === "12";
        posted.length = 0;
        const cliBad = r._portalCliReceive("strangerX", { worldId: SUBW, data: "z" });
        out.cliReceiveRejectsWrongHost = cliBad === false && posted.length === 0;

        // subworld-srv ist kanal-exklusiv: _p2pHandleChannelMessage
        // reicht ihn DIREKT an _portalSrvFromGuest (nicht über die
        // ALLOWED-Whitelist re-dispatcht — nicht WS-injizierbar).
        r._portalOverlay = makeJs("host");
        srvPosted.length = 0;
        r._p2pHandleChannelMessage(
            "kanalpeer",
            JSON.stringify({ type: "subworld-srv", kind: "send", worldId: SUBW, data: "viakanal" })
        );
        out.channelExclusiveSrv = srvPosted.some(
            (p) => p.m.kind === "srv-recv" && p.m.conn === "kanalpeer" && p.m.data === "viakanal"
        );

        r._portalOverlay = null;
        r._p2pSendChannelTo = origChan;
        r.p2pSend = origSend;

        // enterPortal eines js-compute-Portals → Compute-Host.
        const ebp = "_w17js_enter";
        const wp = r.state.blueprints["welt_portal"];
        r.state.blueprints[ebp] = {
            name: ebp,
            label: "JS-Enter",
            builtIn: false,
            parts: JSON.parse(JSON.stringify(wp.parts)),
            connections: [],
            role: "portal",
            roleManual: true,
            portalMeta: r._sanitizePortalMeta({ world: SUBW, label: "JS-Enter", serverMode: "js-compute" }, "JS-Enter"),
        };
        r.enterPortal({ type: ebp, affordances: { isPortal: true } });
        out.enterPortalSetsHost =
            !!r._portalOverlay && r._portalOverlay.computeRole === "host" && !!r._portalOverlay.serverIframe;
        r._disposePortalOverlay();

        // snapshot — serverMode überlebt den buildStateSnapshot-
        // Schreib-Pfad (der feste Feld-Satz; _sanitizePortalMeta ist
        // der Lade-Pfad → der Rundlauf).
        const snap = r.buildStateSnapshot();
        const snapBp = (snap.blueprints || []).find((b) => b.name === ebp);
        out.snapshotKeepsServerMode = !!snapBp && !!snapBp.portalMeta && snapBp.portalMeta.serverMode === "js-compute";
        delete r.state.blueprints[ebp];

        return out;
    });
    if (!w17jsResults || w17jsResults.error) {
        check(
            "W17 Phase B-JS-Compute: der Compute-Host erreichbar",
            false,
            (w17jsResults && w17jsResults.error) || "page.evaluate fehlgeschlagen"
        );
    } else {
        check("W17 JS: _sanitizePortalMeta — serverMode Default 'relay'", w17jsResults.sanitizeDefaultRelay);
        check("W17 JS: serverMode 'js-compute' bleibt + erzwingt multiplayer", w17jsResults.sanitizeJsComputeForcesMp);
        check("W17 JS: aimBlueprintAtWorld trägt serverMode aus dem Eintrag", w17jsResults.aimCarriesServerMode);
        check(
            "W17 JS: ein js-compute-Host baut ein Server-Kontext-iframe (?anazh-server=1, allow-scripts)",
            w17jsResults.overlayHostBuildsServerFrame
        );
        check(
            "W17 JS: ein Gast baut keinen Server-Kontext (Host = hostPeerId)",
            w17jsResults.overlayGuestNoServerFrame
        );
        check(
            "W17 JS: ein Relay-Portal hat keine Compute-Rolle (computeRole null)",
            w17jsResults.overlayRelayNoComputeRole
        );
        check("W17 JS: Host — ws-open registriert die eigene Server-Verbindung", w17jsResults.hostWsOpenRegistersConn);
        check(
            "W17 JS: Host — ein ws-send geht in den Server-Kontext, nicht als Broadcast",
            w17jsResults.hostWsSendFeedsServer
        );
        check(
            "W17 JS: Gast — ein ws-send geht NUR an den Compute-Host (kein Broadcast)",
            w17jsResults.guestWsSendRoutesToHost
        );
        check(
            "W17 JS: Host — ein subworld-srv eines Gastes erreicht den Server-Kontext",
            w17jsResults.srvFromGuestFeedsServer
        );
        check(
            "W17 JS: Host — ein subworld-srv fremder Sub-Welt / Übergröße wird verworfen",
            w17jsResults.srvFromGuestGated
        );
        check(
            "W17 JS: Host — srv-send für die eigene Verbindung geht lokal ins Client-iframe",
            w17jsResults.srvReceiveSelfDeliversLocal
        );
        check(
            "W17 JS: Host — srv-send für einen Gast geht gezielt als subworld-cli zurück",
            w17jsResults.srvReceiveGuestRoutesBack
        );
        check(
            "W17 JS: Gast — ein subworld-cli des eigenen Hosts wird ins Client-iframe gestellt",
            w17jsResults.cliReceiveDeliversToClient
        );
        check(
            "W17 JS: Gast — ein subworld-cli eines fremden Peers wird verworfen",
            w17jsResults.cliReceiveRejectsWrongHost
        );
        check(
            "W17 JS: subworld-srv ist kanal-exklusiv (direkt behandelt, nicht WS-injizierbar)",
            w17jsResults.channelExclusiveSrv
        );
        check("W17 JS: enterPortal eines js-compute-Portals macht zum Compute-Host", w17jsResults.enterPortalSetsHost);
        check("W17 JS: serverMode überlebt den buildStateSnapshot-Rundlauf", w17jsResults.snapshotKeepsServerMode);
    }

    // ### Host-Migration ###
    // Verlässt der Compute-Host das Mesh, wählt jeder Gast aus dem zuletzt annoncierten Roster
    // deterministisch denselben Nachfolger (kleinste peerId); der baut einen frischen Server-Kontext.
    const w17mResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const SUBW = "worlds/skeleton/index.html";
        const selfConn = r._portalSelfConnId();

        const chanSent = [];
        const origChan = r._p2pSendChannelTo;
        r._p2pSendChannelTo = (pid, obj) => {
            chanSent.push({ pid, obj });
            return true;
        };
        const makeOv = (role, host, roster) => ({
            multiplayer: true,
            trust: "sandboxed",
            serverMode: "js-compute",
            computeRole: role,
            hostPeerId: host,
            world: SUBW,
            overlayEl: document.createElement("div"),
            netChannels: new Set([1]),
            netWindowStart: 0,
            netWindowCount: 0,
            iframe: { contentWindow: { postMessage: () => {} } },
            serverIframe: null,
            serverReady: false,
            serverQueue: [],
            serverConns: new Set(),
            roster: roster || [],
        });

        // _portalSpawnServerContext baut ein Server-Kontext-iframe.
        r._portalOverlay = makeOv("host", selfConn);
        const sf = r._portalSpawnServerContext();
        out.spawnBuildsServerFrame =
            !!sf &&
            r._portalOverlay.serverIframe === sf &&
            (sf.getAttribute("src") || "").includes("anazh-server=1") &&
            sf.getAttribute("sandbox") === "allow-scripts";

        // Ein Host annonciert die Roster bei jeder serverConns-
        // Änderung (subworld-roster an jeden Gast).
        r._portalOverlay = makeOv("host", selfConn);
        r._portalOverlay.serverConns = new Set([selfConn]);
        chanSent.length = 0;
        r._portalSrvEnsureConn("guestX");
        out.ensureConnBroadcastsRoster = chanSent.some(
            (c) =>
                c.pid === "guestX" &&
                c.obj.type === "subworld-roster" &&
                Array.isArray(c.obj.members) &&
                c.obj.members.includes("guestX") &&
                c.obj.members.includes(selfConn)
        );

        // Ein Gast cacht die Roster seines Hosts.
        r._portalOverlay = makeOv("guest", "p-host");
        const rOk = r._portalRosterReceive("p-host", {
            worldId: SUBW,
            members: ["p-host", "p-a", "p-b"],
        });
        out.rosterReceiveCaches =
            rOk === true && JSON.stringify(r._portalOverlay.roster) === JSON.stringify(["p-host", "p-a", "p-b"]);

        // ... verwirft sie von fremdem Peer / für fremde Sub-Welt.
        r._portalOverlay = makeOv("guest", "p-host");
        const rWrongPeer = r._portalRosterReceive("p-stranger", { worldId: SUBW, members: ["x"] });
        const rWrongWorld = r._portalRosterReceive("p-host", {
            worldId: "worlds/fluid/index.html",
            members: ["x"],
        });
        out.rosterReceiveGated = rWrongPeer === false && rWrongWorld === false && r._portalOverlay.roster.length === 0;

        // subworld-roster ist kanal-exklusiv.
        r._portalOverlay = makeOv("guest", "p-host");
        r._p2pHandleChannelMessage(
            "p-host",
            JSON.stringify({ type: "subworld-roster", worldId: SUBW, members: ["p-host", "p-q"] })
        );
        out.channelExclusiveRoster = JSON.stringify(r._portalOverlay.roster) === JSON.stringify(["p-host", "p-q"]);

        // Migration — der Nachfolger ist die kleinste peerId der
        // Roster (ohne den Abgegangenen). "!early" sortiert vor jede
        // p-id → der Nachfolger ist nicht ich.
        r._portalOverlay = makeOv("guest", "p-host", ["p-host", "!early", selfConn]);
        chanSent.length = 0;
        r._portalMigrateHost("p-host");
        out.migrateElectsSmallest =
            r._portalOverlay.computeRole === "guest" &&
            r._portalOverlay.hostPeerId === "!early" &&
            chanSent.some((c) => c.pid === "!early" && c.obj.type === "subworld-srv" && c.obj.kind === "open");

        // Migration — bin ICH die kleinste peerId, werde ich Host.
        r._portalOverlay = makeOv("guest", "p-host", ["p-host", selfConn]);
        r._portalMigrateHost("p-host");
        out.migratePromotesSelf =
            r._portalOverlay.computeRole === "host" &&
            r._portalOverlay.hostPeerId === selfConn &&
            !!r._portalOverlay.serverIframe;

        // _portalMigrateHost auf einem HOST-Overlay ist folgenlos.
        r._portalOverlay = makeOv("host", selfConn);
        r._portalMigrateHost("p-irgendwer");
        out.migrateGatedOnGuest = r._portalOverlay.computeRole === "host";

        // _p2pRemovePeer des eigenen Hosts triggert die Migration.
        r._portalOverlay = makeOv("guest", "p-host", ["p-host", selfConn]);
        r._p2pRemovePeer("p-host");
        out.removeHostTriggersMigration = r._portalOverlay.computeRole === "host";

        // _p2pRemovePeer eines Nicht-Hosts triggert KEINE Migration.
        r._portalOverlay = makeOv("guest", "p-host", ["p-host", selfConn]);
        r._p2pRemovePeer("p-fremd");
        out.removeNonHostNoMigration =
            r._portalOverlay.computeRole === "guest" && r._portalOverlay.hostPeerId === "p-host";

        // _portalPromoteToHost flippt die Rolle + baut den Kontext.
        r._portalOverlay = makeOv("guest", "p-host");
        r._portalPromoteToHost();
        out.promoteFlipsRole =
            r._portalOverlay.computeRole === "host" &&
            r._portalOverlay.hostPeerId === selfConn &&
            !!r._portalOverlay.serverIframe &&
            r._portalOverlay.serverConns.has(selfConn);

        r._portalOverlay = null;
        r._p2pSendChannelTo = origChan;
        return out;
    });
    if (!w17mResults || w17mResults.error) {
        check(
            "W17 Phase B-JS-Compute Phase 2: Host-Migration erreichbar",
            false,
            (w17mResults && w17mResults.error) || "page.evaluate fehlgeschlagen"
        );
    } else {
        check(
            "W17 JS P2: _portalSpawnServerContext baut ein Server-Kontext-iframe",
            w17mResults.spawnBuildsServerFrame
        );
        check(
            "W17 JS P2: ein Host annonciert die Roster bei serverConns-Änderung",
            w17mResults.ensureConnBroadcastsRoster
        );
        check("W17 JS P2: ein Gast cacht die Roster seines Hosts", w17mResults.rosterReceiveCaches);
        check(
            "W17 JS P2: eine Roster von fremdem Peer / fremder Sub-Welt wird verworfen",
            w17mResults.rosterReceiveGated
        );
        check("W17 JS P2: subworld-roster ist kanal-exklusiv", w17mResults.channelExclusiveRoster);
        check(
            "W17 JS P2: Migration wählt die kleinste peerId der Roster zum Nachfolger",
            w17mResults.migrateElectsSmallest
        );
        check(
            "W17 JS P2: Migration — bin ich die kleinste peerId, werde ich Compute-Host",
            w17mResults.migratePromotesSelf
        );
        check("W17 JS P2: _portalMigrateHost auf einem Host-Overlay ist folgenlos", w17mResults.migrateGatedOnGuest);
        check(
            "W17 JS P2: _p2pRemovePeer des eigenen Hosts triggert die Migration",
            w17mResults.removeHostTriggersMigration
        );
        check(
            "W17 JS P2: _p2pRemovePeer eines Nicht-Hosts triggert keine Migration",
            w17mResults.removeNonHostNoMigration
        );
        check(
            "W17 JS P2: _portalPromoteToHost flippt die Rolle + baut den Server-Kontext",
            w17mResults.promoteFlipsRole
        );
    }

    // ### das Gruppen-Portal ###
    // Wer ein Multiplayer-Portal betritt, broadcastet portal-invite; Mitspieler bekommen „mitkommen?“,
    // „Ja“ holt + betritt das Portal.
    const w17cResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        out.pendingInviteInit = r.state.p2p.pendingInvite === null;
        out.bannerInDom = !!document.getElementById("portal-invite-banner");

        // _resolvePortalWorldId — Pfad-Match gegen die Bibliothek.
        out.resolveByPath = r._resolvePortalWorldId({ world: "worlds/skeleton/index.html" }) === "skeleton";
        out.resolveUnknown = r._resolvePortalWorldId({ world: "worlds/_nonexist/index.html" }) === null;

        // aimBlueprintAtWorld trägt multiplayer aus dem Eintrag.
        let aimCarriesMp = false;
        r.state.customWorlds = r.state.customWorlds || {};
        r.state.customWorlds._w17c_mp = {
            id: "_w17c_mp",
            label: "W17C MP-Welt",
            world: "worlds/_w17c_mp/index.html",
            dsl: [],
            reachable: true,
            multiplayer: true,
        };
        if (r.cloneBlueprint("welt_portal", "_w17c_aimbp")) {
            const aim = r.aimBlueprintAtWorld("_w17c_aimbp", "_w17c_mp");
            const bp = r.state.blueprints["_w17c_aimbp"];
            aimCarriesMp = aim.ok && !!bp.portalMeta && bp.portalMeta.multiplayer === true;
            delete r.state.blueprints["_w17c_aimbp"];
        }
        delete r.state.customWorlds._w17c_mp;
        out.aimCarriesMp = aimCarriesMp;

        // p2pSend hooken: portal-invite-Broadcasts einfangen.
        const sent = [];
        const origSend = r.p2pSend;
        r.p2pSend = (obj) => {
            if (obj && obj.type === "portal-invite") sent.push(obj);
            return false;
        };
        const p2p = r.state.p2p;
        const wasEnabled = p2p.enabled;
        const wasConnected = p2p.connected;
        p2p.enabled = true;
        p2p.connected = true;

        // _p2pBroadcastPortalInvite — nur ein Multiplayer-Portal,
        // dessen Welt sich auflöst, broadcastet.
        r._portalOverlay = {
            multiplayer: true,
            world: "worlds/skeleton/index.html",
            label: "Skelett-Welt",
        };
        sent.length = 0;
        const b1 = r._p2pBroadcastPortalInvite();
        out.broadcastsForMpPortal =
            b1 === true &&
            sent.length === 1 &&
            sent[0].type === "portal-invite" &&
            sent[0].worldId === "skeleton" &&
            sent[0].label === "Skelett-Welt";
        // Ein Nicht-Multiplayer-Portal broadcastet nicht.
        r._portalOverlay.multiplayer = false;
        sent.length = 0;
        r._p2pBroadcastPortalInvite();
        out.noBroadcastForSinglePortal = sent.length === 0;
        // Eine nicht-library-bekannte Welt broadcastet nicht.
        r._portalOverlay = { multiplayer: true, world: "worlds/_nope/index.html", label: "X" };
        sent.length = 0;
        r._p2pBroadcastPortalInvite();
        out.noBroadcastForUnknownWorld = sent.length === 0;
        r._portalOverlay = null;

        // _p2pHandlePortalInvite — speichert die Einladung.
        p2p.pendingInvite = null;
        r._p2pHandlePortalInvite("peerA", { worldId: "skeleton", label: "Skelett-Welt" });
        out.handleStoresInvite =
            !!p2p.pendingInvite && p2p.pendingInvite.peerId === "peerA" && p2p.pendingInvite.worldId === "skeleton";
        // Eine Müll-worldId wird verworfen.
        p2p.pendingInvite = null;
        r._p2pHandlePortalInvite("peerA", { worldId: "../böse", label: "x" });
        out.handleRejectsBadWorldId = p2p.pendingInvite === null;
        // Bin ich schon im Portal, keine Einladung.
        r._portalOverlay = { multiplayer: true, world: "worlds/skeleton/index.html" };
        r._p2pHandlePortalInvite("peerA", { worldId: "skeleton", label: "x" });
        out.handleIgnoredWhenInPortal = p2p.pendingInvite === null;
        r._portalOverlay = null;

        // _renderPortalInviteBanner — Banner mit Knöpfen / verborgen.
        p2p.pendingInvite = { peerId: "peerA", worldId: "skeleton", label: "Skelett-Welt", at: 0 };
        r._renderPortalInviteBanner();
        const banner = document.getElementById("portal-invite-banner");
        out.bannerShows =
            !!banner &&
            banner.hidden === false &&
            !!banner.querySelector(".portal-invite-join") &&
            !!banner.querySelector(".portal-invite-dismiss") &&
            /Skelett-Welt/.test(banner.textContent || "");
        // dismissPortalInvite räumt + verbirgt den Banner.
        r.dismissPortalInvite();
        out.dismissClears = p2p.pendingInvite === null && banner.hidden === true;

        // joinPortalInvite — ohne Einladung abgelehnt.
        p2p.pendingInvite = null;
        out.joinNoInvite = r.joinPortalInvite().reason === "no_invite";
        // ... eine unbekannte Welt → world_unknown.
        p2p.pendingInvite = { peerId: "peerA", worldId: "_nichtda", label: "X", at: 0 };
        out.joinUnknownWorld = r.joinPortalInvite().reason === "world_unknown";
        // ... eine bekannte Welt → Portal geholt + multiplayer betreten.
        const invSlots = r.state.player.inventory.slice();
        p2p.pendingInvite = { peerId: "peerA", worldId: "skeleton", label: "Skelett-Welt", at: 0 };
        const jr = r.joinPortalInvite();
        out.joinEntersMultiplayer =
            jr.ok === true && !!r._portalOverlay && r._portalOverlay.multiplayer === true && p2p.pendingInvite === null;
        r._disposePortalOverlay();
        delete r.state.blueprints["portal_skeleton"];
        r.state.player.inventory = invSlots;
        p2p.enabled = wasEnabled;
        p2p.connected = wasConnected;
        p2p.pendingInvite = null;
        r.p2pSend = origSend;
        r._renderPortalInviteBanner();

        // portal-invite ist kanal-zustellbar: _p2pHandleChannelMessage
        // reicht es (ALLOWED-Whitelist) an p2pHandleMessage.
        r._p2pHandleChannelMessage(
            "fern-peer",
            JSON.stringify({ type: "portal-invite", worldId: "skeleton", label: "Skelett-Welt" })
        );
        out.channelDeliverable = !!p2p.pendingInvite && p2p.pendingInvite.peerId === "fern-peer";
        p2p.pendingInvite = null;
        r._renderPortalInviteBanner();

        return out;
    });
    if (!w17cResults || w17cResults.error) {
        check(
            "W17 Phase C: das Gruppen-Portal erreichbar",
            false,
            (w17cResults && w17cResults.error) || "page.evaluate fehlgeschlagen"
        );
    } else {
        check("W17 C: state.p2p.pendingInvite initial null", w17cResults.pendingInviteInit);
        check("W17 C: #portal-invite-banner im DOM", w17cResults.bannerInDom);
        check("W17 C: _resolvePortalWorldId löst eine Welt per Pfad auf", w17cResults.resolveByPath);
        check("W17 C: _resolvePortalWorldId liefert null für eine unbekannte Welt", w17cResults.resolveUnknown);
        check("W17 C: aimBlueprintAtWorld trägt multiplayer aus dem Eintrag", w17cResults.aimCarriesMp);
        check(
            "W17 C: _p2pBroadcastPortalInvite broadcastet ein portal-invite (worldId + label)",
            w17cResults.broadcastsForMpPortal
        );
        check(
            "W17 C: ein Nicht-Multiplayer-Portal broadcastet keine Einladung",
            w17cResults.noBroadcastForSinglePortal
        );
        check(
            "W17 C: eine nicht-library-bekannte Welt broadcastet keine Einladung",
            w17cResults.noBroadcastForUnknownWorld
        );
        check("W17 C: _p2pHandlePortalInvite speichert die Einladung", w17cResults.handleStoresInvite);
        check("W17 C: _p2pHandlePortalInvite verwirft eine Müll-worldId", w17cResults.handleRejectsBadWorldId);
        check(
            "W17 C: _p2pHandlePortalInvite ignoriert eine Einladung, wenn ich schon im Portal bin",
            w17cResults.handleIgnoredWhenInPortal
        );
        check("W17 C: _renderPortalInviteBanner zeigt Text + Mitkommen-/Schließen-Knopf", w17cResults.bannerShows);
        check("W17 C: dismissPortalInvite räumt die Einladung + verbirgt den Banner", w17cResults.dismissClears);
        check("W17 C: joinPortalInvite ohne Einladung → no_invite", w17cResults.joinNoInvite);
        check("W17 C: joinPortalInvite mit unbekannter Welt → world_unknown", w17cResults.joinUnknownWorld);
        check(
            "W17 C: joinPortalInvite holt das Portal + betritt es als multiplayer",
            w17cResults.joinEntersMultiplayer
        );
        check("W17 C: portal-invite ist kanal-zustellbar (ALLOWED-Whitelist)", w17cResults.channelDeliverable);
    }

    // ### die Multiplayer-Welt-Deklaration ###
    // Die Multiplayer-Marke fließt durch _sanitizeImportedManifest, _vendorRegisterWorld, den
    // Welt-Katalog und aimBlueprintAtWorld → obtainPortalForWorld baut ein einladendes Multiplayer-Portal.
    const w17mpResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        // _sanitizeImportedManifest trägt multiplayer.
        const sanMp = r._sanitizeImportedManifest({
            id: "_mp_test",
            label: "MP-Welt",
            world: "worlds/_mp_test/index.html",
            dsl: [],
            multiplayer: true,
        });
        out.sanitizeCarriesMp = !!sanMp && sanMp.multiplayer === true;
        const sanNo = r._sanitizeImportedManifest({
            id: "_mp_test2",
            label: "Single-Welt",
            world: "worlds/_mp_test2/index.html",
            dsl: [],
        });
        out.sanitizeDefaultsNoMp = !!sanNo && sanNo.multiplayer !== true;
        // localStorage-Rundlauf — re-sanitize bewahrt die Marke.
        const rt = r._sanitizeImportedManifest(JSON.parse(JSON.stringify(sanMp)));
        out.sanitizeSurvivesRoundtrip = !!rt && rt.multiplayer === true;

        // _vendorRegisterWorld setzt multiplayer am customWorlds-Eintrag.
        r.state.customWorlds = r.state.customWorlds || {};
        const reg = r._vendorRegisterWorld("_mp_vend", {
            label: "MP Vendored",
            dsl: [],
            multiplayer: true,
        });
        out.vendorRegisterCarriesMp =
            reg.ok && !!r.state.customWorlds["_mp_vend"] && r.state.customWorlds["_mp_vend"].multiplayer === true;

        // aimBlueprintAtWorld + obtainPortalForWorld → ein selbst-
        // deklariertes Multiplayer-Portal (der Kern: A's geholtes
        // Portal IST multiplayer, broadcastet beim Betreten).
        const invSlots = r.state.player.inventory.slice();
        const obt = r.obtainPortalForWorld("_mp_vend");
        const portalBp = obt.ok && r.state.blueprints[obt.blueprint];
        out.obtainProducesMpPortal = !!portalBp && !!portalBp.portalMeta && portalBp.portalMeta.multiplayer === true;

        // _p2pBuildCatalog trägt multiplayer.
        const cat = r._p2pBuildCatalog();
        const catEntry = cat.find((c) => c.id === "_mp_vend");
        out.catalogCarriesMp = !!catEntry && catEntry.multiplayer === true;

        // _p2pSanitizeCatalog bewahrt multiplayer.
        const san = r._p2pSanitizeCatalog([
            { id: "_mpcat", label: "X", hash: "", multiplayer: true },
            { id: "_single", label: "Y", hash: "" },
        ]);
        out.catalogSanitizeKeepsMp = san.length === 2 && san[0].multiplayer === true && san[1].multiplayer === false;

        // renderLibraryUI rendert die Multiplayer-Marke — nur für
        // die Multiplayer-Welt, nicht für eine Single-Welt.
        r.state.customWorlds["_mp_single"] = r._sanitizeImportedManifest({
            id: "_mp_single",
            label: "Single Vendored",
            world: "worlds/_mp_single/index.html",
            dsl: [],
            vendored: true,
            reachable: true,
        });
        r.renderLibraryUI();
        const cards = Array.from(document.querySelectorAll("#library-list .library-card"));
        const mpCard = cards.find((c) => /MP Vendored/.test(c.textContent || ""));
        const singleCard = cards.find((c) => /Single Vendored/.test(c.textContent || ""));
        out.libraryRendersMark = !!mpCard && !!mpCard.querySelector(".library-mp-mark");
        out.libraryNoMarkForSingle = !!singleCard && !singleCard.querySelector(".library-mp-mark");

        out.vendorCheckboxInDom = !!document.getElementById("vendor-multiplayer");

        // Aufräumen.
        delete r.state.customWorlds["_mp_vend"];
        delete r.state.customWorlds["_mp_single"];
        delete r.state.blueprints["portal__mp_vend"];
        r.state.player.inventory = invSlots;
        r.renderLibraryUI();

        return out;
    });
    if (!w17mpResults || w17mpResults.error) {
        check(
            "W17 Multiplayer-Welt-Deklaration erreichbar",
            false,
            (w17mpResults && w17mpResults.error) || "page.evaluate fehlgeschlagen"
        );
    } else {
        check("W17 MP: _sanitizeImportedManifest trägt multiplayer", w17mpResults.sanitizeCarriesMp);
        check("W17 MP: _sanitizeImportedManifest — Default ohne Marke", w17mpResults.sanitizeDefaultsNoMp);
        check("W17 MP: multiplayer überlebt den localStorage-Rundlauf", w17mpResults.sanitizeSurvivesRoundtrip);
        check(
            "W17 MP: _vendorRegisterWorld setzt multiplayer am customWorlds-Eintrag",
            w17mpResults.vendorRegisterCarriesMp
        );
        check(
            "W17 MP: obtainPortalForWorld produziert für eine multiplayer-Welt ein Multiplayer-Portal",
            w17mpResults.obtainProducesMpPortal
        );
        check("W17 MP: _p2pBuildCatalog trägt multiplayer", w17mpResults.catalogCarriesMp);
        check("W17 MP: _p2pSanitizeCatalog bewahrt multiplayer + Default false", w17mpResults.catalogSanitizeKeepsMp);
        check("W17 MP: renderLibraryUI rendert die Multiplayer-Marke", w17mpResults.libraryRendersMark);
        check("W17 MP: eine Single-Welt bekommt KEINE Multiplayer-Marke", w17mpResults.libraryNoMarkForSingle);
        check("W17 MP: #vendor-multiplayer-Checkbox im DOM", w17mpResults.vendorCheckboxInDom);
    }

    // ### die serverMode-Vendor-Ketten-Naht ###
    // serverMode fließt durch _sanitizeImportedManifest, _vendorRegisterWorld, _p2pBuildCatalog/-Sanitize
    // und den Welt-Katalog — sonst verlöre eine vendorte js-compute-Welt still ihren serverMode (→ relay).
    const w17svResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        // _sanitizeImportedManifest trägt serverMode js-compute +
        // Default relay; eine js-compute-Welt wird mit-multiplayer.
        const sanJs = r._sanitizeImportedManifest({
            id: "_sv_test",
            label: "JS-Welt",
            world: "worlds/_sv_test/index.html",
            dsl: [],
            serverMode: "js-compute",
        });
        out.sanitizeCarriesJsCompute = !!sanJs && sanJs.serverMode === "js-compute" && sanJs.multiplayer === true;
        const sanRelay = r._sanitizeImportedManifest({
            id: "_sv_test2",
            label: "Relay-Welt",
            world: "worlds/_sv_test2/index.html",
            dsl: [],
        });
        out.sanitizeDefaultsRelay = !!sanRelay && sanRelay.serverMode === "relay";
        const rt = r._sanitizeImportedManifest(JSON.parse(JSON.stringify(sanJs)));
        out.sanitizeSurvivesRoundtrip = !!rt && rt.serverMode === "js-compute";

        // _vendorRegisterWorld setzt serverMode am customWorlds-Eintrag.
        r.state.customWorlds = r.state.customWorlds || {};
        const reg = r._vendorRegisterWorld("_sv_vend", {
            label: "JS Vendored",
            dsl: [],
            serverMode: "js-compute",
        });
        out.vendorRegisterCarriesServerMode =
            reg.ok &&
            !!r.state.customWorlds["_sv_vend"] &&
            r.state.customWorlds["_sv_vend"].serverMode === "js-compute";

        // obtainPortalForWorld → ein js-compute-Portal: eine
        // vendorte js-compute-Welt verliert ihren serverMode NICHT
        // mehr, das geholte Portal wird Compute-Host-fähig.
        const invSlots = r.state.player.inventory.slice();
        const obt = r.obtainPortalForWorld("_sv_vend");
        const portalBp = obt.ok && r.state.blueprints[obt.blueprint];
        out.obtainProducesJsComputePortal =
            !!portalBp && !!portalBp.portalMeta && portalBp.portalMeta.serverMode === "js-compute";

        // _p2pBuildCatalog trägt serverMode.
        const cat = r._p2pBuildCatalog();
        const catEntry = cat.find((c) => c.id === "_sv_vend");
        out.catalogCarriesServerMode = !!catEntry && catEntry.serverMode === "js-compute";

        // _p2pSanitizeCatalog bewahrt serverMode + Default relay.
        const san = r._p2pSanitizeCatalog([
            { id: "_svcat", label: "X", hash: "", serverMode: "js-compute" },
            { id: "_svrelay", label: "Y", hash: "" },
        ]);
        out.catalogSanitizeKeepsServerMode =
            san.length === 2 && san[0].serverMode === "js-compute" && san[1].serverMode === "relay";

        // renderLibraryUI markiert eine js-compute-Welt sichtbar.
        r.renderLibraryUI();
        const cards = Array.from(document.querySelectorAll("#library-list .library-card"));
        const jsCard = cards.find((c) => /JS Vendored/.test(c.textContent || ""));
        const jsMark = jsCard && jsCard.querySelector(".library-mp-mark");
        out.libraryRendersJsComputeMark = !!jsMark && /JS-Compute/.test(jsMark.textContent || "");

        out.vendorJsComputeCheckboxInDom = !!document.getElementById("vendor-js-compute");

        // Aufräumen.
        delete r.state.customWorlds["_sv_vend"];
        delete r.state.blueprints["portal__sv_vend"];
        r.state.player.inventory = invSlots;
        r.renderLibraryUI();

        return out;
    });
    if (!w17svResults || w17svResults.error) {
        check("W17 P-Vendor erreichbar", false, (w17svResults && w17svResults.error) || "page.evaluate fehlgeschlagen");
    } else {
        check(
            "W17 P-Vendor: _sanitizeImportedManifest trägt serverMode js-compute + erzwingt multiplayer",
            w17svResults.sanitizeCarriesJsCompute
        );
        check("W17 P-Vendor: _sanitizeImportedManifest — Default serverMode relay", w17svResults.sanitizeDefaultsRelay);
        check("W17 P-Vendor: serverMode überlebt den localStorage-Rundlauf", w17svResults.sanitizeSurvivesRoundtrip);
        check(
            "W17 P-Vendor: _vendorRegisterWorld setzt serverMode am customWorlds-Eintrag",
            w17svResults.vendorRegisterCarriesServerMode
        );
        check(
            "W17 P-Vendor: obtainPortalForWorld produziert für eine js-compute-Welt ein js-compute-Portal",
            w17svResults.obtainProducesJsComputePortal
        );
        check("W17 P-Vendor: _p2pBuildCatalog trägt serverMode", w17svResults.catalogCarriesServerMode);
        check(
            "W17 P-Vendor: _p2pSanitizeCatalog bewahrt serverMode js-compute + Default relay",
            w17svResults.catalogSanitizeKeepsServerMode
        );
        check("W17 P-Vendor: renderLibraryUI rendert die JS-Compute-Marke", w17svResults.libraryRendersJsComputeMark);
        check("W17 P-Vendor: #vendor-js-compute-Checkbox im DOM", w17svResults.vendorJsComputeCheckboxInDom);
    }
}

async function checkBandW12WorldPortal({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Welt-Portal: Rolle + Built-in welt_portal ###
    const w12c1Results = await safeEvaluate(page, () => {
        const out = {};
        const C = r.constructor;

        // Rolle "portal" in Label- + Farb-Konstanten.
        out.roleLabel = !!C && !!C.BLUEPRINT_ROLE_LABELS && C.BLUEPRINT_ROLE_LABELS.portal === "Portal";
        out.roleColor = !!C && !!C.BLUEPRINT_ROLE_COLORS && typeof C.BLUEPRINT_ROLE_COLORS.portal === "string";

        // PORTAL_SKELETON_WORLD-Konstante zeigt auf einen worlds/-Pfad.
        out.skeletonConst = typeof C.PORTAL_SKELETON_WORLD === "string" && /^worlds\//.test(C.PORTAL_SKELETON_WORLD);

        // Built-in welt_portal-Bauplan.
        const wp = r.state.blueprints && r.state.blueprints.welt_portal;
        out.builtinExists = !!wp && wp.builtIn === true;
        out.builtinRole = !!wp && wp.role === "portal" && wp.roleManual === true;
        out.builtinMeta =
            !!wp &&
            !!wp.portalMeta &&
            typeof wp.portalMeta.world === "string" &&
            typeof wp.portalMeta.label === "string";
        out.builtinHasParts = !!wp && Array.isArray(wp.parts) && wp.parts.length >= 2;

        // setBlueprintAsPortal — Marker-Methode.
        if (r.state.blueprints["_w12p"]) delete r.state.blueprints["_w12p"];
        r.createBlueprint("_w12p", "W12P");
        const markRes = r.setBlueprintAsPortal("_w12p");
        const marked = r.state.blueprints["_w12p"];
        out.markOk =
            !!markRes &&
            markRes.ok === true &&
            !!marked &&
            marked.role === "portal" &&
            marked.roleManual === true &&
            !!marked.portalMeta &&
            typeof marked.portalMeta.world === "string";

        // Manueller Override bleibt nach _refreshBlueprintRoleEmergent.
        r._refreshBlueprintRoleEmergent("_w12p");
        out.manualSticks = r.state.blueprints["_w12p"].role === "portal";

        // Built-in-Schutz + Unknown-Reject (stein_block — lebendes builtIn).
        const builtinRej = r.setBlueprintAsPortal("stein_block");
        out.rejectBuiltin = !!builtinRej && builtinRej.ok === false && builtinRej.reason === "cannot_modify_builtin";
        const unknownRej = r.setBlueprintAsPortal("_does_not_exist_xyz");
        out.rejectUnknown = !!unknownRej && unknownRej.ok === false && unknownRej.reason === "blueprint_unknown";

        // _sanitizePortalMeta — fremdes Origin + Pfad-Traversal werden verworfen.
        const sanForeign = r._sanitizePortalMeta({ world: "https://evil.example/x" }, "fb");
        out.sanitizeForeign = sanForeign.world === C.PORTAL_SKELETON_WORLD;
        const sanTraversal = r._sanitizePortalMeta({ world: "worlds/../secret" }, "fb");
        out.sanitizeTraversal = sanTraversal.world === C.PORTAL_SKELETON_WORLD;
        const sanValid = r._sanitizePortalMeta({ world: "worlds/skeleton/index.html", label: "Test-Welt" }, "fb");
        out.sanitizeValid = sanValid.world === "worlds/skeleton/index.html" && sanValid.label === "Test-Welt";

        // W12-Korrektur — die Portal-NATUR emergiert aus der Substanz:
        // ein magie-leitender Ring wird zum Tor (das Ziel bleibt autoriert).

        // Magie-Ring (Quarz-Torus, begehbar groß) → Portal.
        const magicRing = {
            parts: [
                {
                    shape: "torus",
                    material: "quarz",
                    size: { x: 3.4, y: 3.4, z: 3.4 },
                    position: { x: 0, y: 0, z: 0 },
                },
            ],
        };
        out.magicRingIsPortalShaped = r._isPortalShaped(magicRing) === true;
        out.magicRingRolePortal = r.computeBlueprintRole(magicRing) === "portal";

        // Stein-Ring (kein Magie-Material) → KEIN Portal. Die
        // "aus-Magie"-Diskrimination: ein schlichter Ring bleibt Bauwerk.
        const stoneRing = {
            parts: [
                {
                    shape: "torus",
                    material: "stein",
                    size: { x: 3.4, y: 3.4, z: 3.4 },
                    position: { x: 0, y: 0, z: 0 },
                },
            ],
        };
        out.stoneRingNotPortal =
            r._isPortalShaped(stoneRing) === false && r.computeBlueprintRole(stoneRing) !== "portal";

        // Winziger Deko-Torus aus Quarz → KEIN Portal (nicht begehbar groß).
        const tinyRing = {
            parts: [
                {
                    shape: "torus",
                    material: "quarz",
                    size: { x: 0.8, y: 0.8, z: 0.8 },
                    position: { x: 0, y: 0, z: 0 },
                },
            ],
        };
        out.tinyRingNotPortal = r._isPortalShaped(tinyRing) === false;

        // kristall_geode (magisch, aber massiv, kein Ring) → KEIN Portal.
        const geode = r.state.blueprints && r.state.blueprints.kristall_geode;
        out.geodeNotPortal = !!geode && r._isPortalShaped(geode) === false;

        // Built-in welt_portal erfüllt selbst die emergente Regel.
        out.builtinSatisfiesRule = !!wp && r._isPortalShaped(wp) === true;

        // Emergenter Pfad: ein eigener Bauplan mit Magie-Ring wird via
        // _refreshBlueprintRoleEmergent zum Portal — OHNE setBlueprintAsPortal.
        if (r.state.blueprints["_w12e"]) delete r.state.blueprints["_w12e"];
        r.createBlueprint("_w12e", "W12E");
        r.state.blueprints["_w12e"].parts = [
            {
                shape: "torus",
                material: "quarz",
                size: { x: 3.4, y: 3.4, z: 3.4 },
                position: { x: 0, y: 0, z: 0 },
            },
        ];
        r._refreshBlueprintRoleEmergent("_w12e");
        out.emergentRefreshPortal = r.state.blueprints["_w12e"].role === "portal";
        delete r.state.blueprints["_w12e"];

        delete r.state.blueprints["_w12p"];
        return out;
    });

    if (w12c1Results && !w12c1Results.error) {
        check("W12 P1: Rolle 'portal' in BLUEPRINT_ROLE_LABELS", w12c1Results.roleLabel);
        check("W12 P1: Rolle 'portal' in BLUEPRINT_ROLE_COLORS", w12c1Results.roleColor);
        check("W12 P1: PORTAL_SKELETON_WORLD zeigt auf worlds/-Pfad", w12c1Results.skeletonConst);
        check("W12 P1: Built-in welt_portal-Bauplan existiert", w12c1Results.builtinExists);
        check("W12 P1: welt_portal hat role:'portal' + roleManual", w12c1Results.builtinRole);
        check("W12 P1: welt_portal trägt portalMeta (world + label)", w12c1Results.builtinMeta);
        check("W12 P1: welt_portal hat min. 2 Parts (Ring + Membran)", w12c1Results.builtinHasParts);
        check("W12 P1: setBlueprintAsPortal markiert eigenen Bauplan", w12c1Results.markOk);
        check("W12 P1: manuelle Portal-Rolle überlebt _refreshBlueprintRoleEmergent", w12c1Results.manualSticks);
        check("W12 P1: setBlueprintAsPortal lehnt Built-in ab", w12c1Results.rejectBuiltin);
        check("W12 P1: setBlueprintAsPortal lehnt unbekannten Bauplan ab", w12c1Results.rejectUnknown);
        check("W12 P1: _sanitizePortalMeta verwirft fremdes Origin", w12c1Results.sanitizeForeign);
        check("W12 P1: _sanitizePortalMeta verwirft Pfad-Traversal", w12c1Results.sanitizeTraversal);
        check("W12 P1: _sanitizePortalMeta behält gültigen worlds/-Pfad", w12c1Results.sanitizeValid);
        check("W12 P1: Magie-Ring (Quarz-Torus) ist _isPortalShaped", w12c1Results.magicRingIsPortalShaped);
        check(
            "W12 P1: Magie-Ring emergiert als Rolle 'portal' (computeBlueprintRole)",
            w12c1Results.magicRingRolePortal
        );
        check(
            "W12 P1: Stein-Ring ohne Magie wird NICHT Portal (aus-Magie-Diskrimination)",
            w12c1Results.stoneRingNotPortal
        );
        check("W12 P1: winziger Deko-Torus wird NICHT Portal (Begehbarkeit)", w12c1Results.tinyRingNotPortal);
        check("W12 P1: kristall_geode (magisch, massiv) wird NICHT Portal (kein Ring)", w12c1Results.geodeNotPortal);
        check("W12 P1: Built-in welt_portal erfüllt _isPortalShaped selbst", w12c1Results.builtinSatisfiesRule);
        check(
            "W12 P1: Magie-Ring emergiert via _refreshBlueprintRoleEmergent zu 'portal'",
            w12c1Results.emergentRefreshPortal
        );
    } else {
        check("W12 P1: Welt-Portal Commit 1 Tests laufen", false, w12c1Results ? w12c1Results.error : "no result");
    }

    // ### Skelett-Welt + iframe-Overlay + CSP ###
    const w12c2Results = await safeEvaluate(page, async () => {
        const out = {};

        // CSP: frame-src 'self' (nur same-origin iframes erlaubt).
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const csp = cspMeta ? cspMeta.getAttribute("content") || "" : "";
        out.cspFrameSrc = /frame-src\s+'self'/.test(csp);

        // Overlay-Methoden.

        // _buildPortalOverlay erzeugt das Overlay + sandboxed iframe.
        r._buildPortalOverlay({ world: "worlds/skeleton/index.html", label: "Test" });
        const overlay = document.getElementById("portal-overlay");
        const iframe = overlay ? overlay.querySelector("iframe.portal-frame") : null;
        out.overlayBuilt = !!overlay && !!iframe;
        out.iframeSandboxed = !!iframe && (iframe.getAttribute("sandbox") || "").includes("allow-scripts");
        out.iframeSrcSkeleton = !!iframe && iframe.src.includes("worlds/skeleton/index.html");
        out.overlayRefSet = !!r._portalOverlay;

        // _disposePortalOverlay räumt Overlay + Ref.
        r._disposePortalOverlay();
        out.overlayDisposed = !document.getElementById("portal-overlay") && !r._portalOverlay;

        // Defense-in-Depth: ein fremdes Origin im world-Feld wird auch im
        // Overlay-Builder gesäubert (kein evil.example im iframe-src).
        r._buildPortalOverlay({ world: "https://evil.example/pwn" });
        const evilFrame = document.querySelector("#portal-overlay iframe.portal-frame");
        out.overlaySanitizesForeign =
            !!evilFrame && !evilFrame.src.includes("evil.example") && evilFrame.src.includes("worlds/skeleton");
        r._disposePortalOverlay();

        return out;
    });

    if (w12c2Results && !w12c2Results.error) {
        check("W12 P1 C2: CSP enthält frame-src 'self'", w12c2Results.cspFrameSrc);
        check("W12 P1 C2: _buildPortalOverlay erzeugt Overlay + iframe", w12c2Results.overlayBuilt);
        check("W12 P1 C2: iframe ist sandboxed (allow-scripts)", w12c2Results.iframeSandboxed);
        check("W12 P1 C2: iframe-src zeigt auf die Skelett-Welt", w12c2Results.iframeSrcSkeleton);
        check("W12 P1 C2: _portalOverlay-Ref nach Build gesetzt", w12c2Results.overlayRefSet);
        check("W12 P1 C2: _disposePortalOverlay räumt Overlay + Ref", w12c2Results.overlayDisposed);
        check(
            "W12 P1 C2: Overlay-Builder säubert fremdes Origin (Defense-in-Depth)",
            w12c2Results.overlaySanitizesForeign
        );
    } else {
        check("W12 P1 C2: Skelett-Welt Commit 2 Tests laufen", false, w12c2Results ? w12c2Results.error : "no result");
    }

    // ### Betreten / Pause / Rückkehr ###
    const w12c3Results = await safeEvaluate(page, async () => {
        const out = {};

        // Portal-Affordance: welt_portal trägt AUSSCHLIESSLICH isPortal
        // (kein moveable/magnifying/focusing — ein Tor ist kein Fahrzeug).
        const wpAff = r.computeBlueprintAffordances(r.state.blueprints.welt_portal);
        out.affPortal = wpAff.isPortal === true;
        out.affPortalExclusive = !wpAff.moveable && !wpAff.magnifying && !wpAff.focusing;
        out.affNonPortal = !r.computeBlueprintAffordances(r.state.blueprints.stein_block).isPortal;

        // spawnArchitecture eines Portals → Entry trägt affordances.isPortal.
        const pm = r.state.playerMesh.position;
        r.spawnArchitecture("welt_portal", { x: pm.x, y: pm.y, z: pm.z });
        const portalEntry = (r.state.architectures || []).find((e) => e.type === "welt_portal");
        out.spawnedHasAffordance =
            !!portalEntry && !!portalEntry.affordances && portalEntry.affordances.isPortal === true;

        // enterPortal baut das Overlay.
        const enterRes = portalEntry ? r.enterPortal(portalEntry) : { ok: false };
        out.enterBuildsOverlay = !!enterRes.ok && !!document.getElementById("portal-overlay") && !!r._portalOverlay;
        // Doppel-Eintritt wird abgelehnt.
        const doubleRes = r.enterPortal(portalEntry);
        out.rejectsDoubleEnter = !doubleRes.ok && doubleRes.reason === "already_in_portal";

        // Loop friert die Heimat-Welt ein, solange das Portal offen ist.
        const framesBefore = r.state._fpsFrames;
        r._gameLoopTick(performance.now());
        const framesInPortal = r.state._fpsFrames;
        out.loopFreezesInPortal = framesInPortal === framesBefore;

        // exitPortal räumt Overlay + Tasten-Zustand.
        r.state.keys.w = true;
        const exitRes = r.exitPortal();
        out.exitDisposesOverlay = !!exitRes.ok && !document.getElementById("portal-overlay") && !r._portalOverlay;
        out.exitClearsKeys = !r.state.keys.w;

        // Loop nimmt die Heimat-Welt nach dem Verlassen wieder auf.
        r._gameLoopTick(performance.now());
        out.loopResumesAfterPortal = r.state._fpsFrames !== framesInPortal;

        // exitPortal ohne offenes Portal + enterPortal auf Nicht-Portal.
        const exitAgain = r.exitPortal();
        out.rejectsExitWhenIdle = !exitAgain.ok && exitAgain.reason === "not_in_portal";
        const badEnter = r.enterPortal({ type: "stein_block", affordances: {} });
        out.rejectsNonPortal = !badEnter.ok && badEnter.reason === "not_a_portal";

        // _tickPortalAffordance zeigt den Prompt, wenn ein Portal nah ist. Spieler AUF die Portal-Position
        // setzen: Zwischen-Ticks lassen ihn sonst zu Boden aus PORTAL_REACH (4,5 m, 3D inkl. y) driften.
        if (portalEntry && pm && pm.set) {
            pm.set(portalEntry.position.x, portalEntry.position.y, portalEntry.position.z);
        }
        r._tickPortalAffordance();
        const promptEl = document.getElementById("portal-prompt");
        out.promptShownNearPortal =
            !!promptEl && !promptEl.hidden && /Portal betreten/.test(promptEl.textContent || "");

        // _tryEnterPortalAtPlayer betritt das nahe Portal.
        out.tryEnterWorks = r._tryEnterPortalAtPlayer() === true && !!r._portalOverlay;
        r.exitPortal();

        // Portal entfernen → Prompt verschwindet, _tryEnter scheitert.
        if (portalEntry) r.removeArchitecture(portalEntry);
        r._tickPortalAffordance();
        out.promptHiddenWhenNone = !!promptEl && promptEl.hidden === true;
        out.tryEnterFailsWhenNone = r._tryEnterPortalAtPlayer() === false;

        return out;
    });

    if (w12c3Results && !w12c3Results.error) {
        check("W12 P1 C3: welt_portal trägt die isPortal-Affordance", w12c3Results.affPortal);
        check("W12 P1 C3: ein Portal ist kein Fahrzeug/keine Linse (nur isPortal)", w12c3Results.affPortalExclusive);
        check("W12 P1 C3: ein Dorf trägt KEINE isPortal-Affordance", w12c3Results.affNonPortal);
        check("W12 P1 C3: gespawntes Portal trägt affordances.isPortal", w12c3Results.spawnedHasAffordance);
        check("W12 P1 C3: enterPortal baut das iframe-Overlay", w12c3Results.enterBuildsOverlay);
        check("W12 P1 C3: enterPortal lehnt Doppel-Eintritt ab", w12c3Results.rejectsDoubleEnter);
        check("W12 P1 C3: Loop friert die Heimat-Welt ein (Portal offen)", w12c3Results.loopFreezesInPortal);
        check("W12 P1 C3: exitPortal räumt Overlay + Ref", w12c3Results.exitDisposesOverlay);
        check("W12 P1 C3: exitPortal verwirft stale Tasten-Zustände", w12c3Results.exitClearsKeys);
        check(
            "W12 P1 C3: Loop nimmt die Heimat-Welt nach dem Verlassen wieder auf",
            w12c3Results.loopResumesAfterPortal
        );
        check("W12 P1 C3: exitPortal ohne offenes Portal wird abgelehnt", w12c3Results.rejectsExitWhenIdle);
        check("W12 P1 C3: enterPortal lehnt eine Nicht-Portal-Architektur ab", w12c3Results.rejectsNonPortal);
        check("W12 P1 C3: _tickPortalAffordance zeigt den Prompt am Portal", w12c3Results.promptShownNearPortal);
        check("W12 P1 C3: _tryEnterPortalAtPlayer betritt ein nahes Portal", w12c3Results.tryEnterWorks);
        check("W12 P1 C3: Prompt verschwindet ohne Portal in Reichweite", w12c3Results.promptHiddenWhenNone);
        check("W12 P1 C3: _tryEnterPortalAtPlayer scheitert ohne Portal", w12c3Results.tryEnterFailsWhenNone);
    } else {
        check(
            "W12 P1 C3: Betreten/Pause/Rückkehr Tests laufen",
            false,
            w12c3Results ? w12c3Results.error : "no result"
        );
    }

    // ### Strom-Welt (three-fluid-fx) ###
    const w12p2Results = await safeEvaluate(page, async () => {
        const out = {};

        // Built-in welt_strom-Portal.
        const ws = r.state.blueprints && r.state.blueprints.welt_strom;
        out.stromIsPortal = !!ws && ws.role === "portal" && ws.roleManual === true;
        out.stromMeta = !!ws && !!ws.portalMeta && ws.portalMeta.world === "worlds/fluid/index.html";

        // welt_strom trägt exklusiv die isPortal-Affordance + ist _isPortalShaped.
        const wsAff = r.computeBlueprintAffordances(ws);
        out.stromAffordance = wsAff.isPortal === true && !wsAff.moveable && !wsAff.magnifying && !wsAff.focusing;
        out.stromPortalShaped = r._isPortalShaped(ws) === true;

        // _sanitizePortalMeta akzeptiert den Fluid-Welt-Pfad.
        out.sanitizeFluidWorld =
            r._sanitizePortalMeta({ world: "worlds/fluid/index.html" }, "fb").world === "worlds/fluid/index.html";

        // enterPortal(welt_strom) → Overlay-iframe zeigt auf die Fluid-Welt.
        const pm = r.state.playerMesh.position;
        r.spawnArchitecture("welt_strom", { x: pm.x, y: pm.y, z: pm.z });
        const stromEntry = (r.state.architectures || []).find((e) => e.type === "welt_strom");
        const enterRes = stromEntry ? r.enterPortal(stromEntry) : { ok: false };
        const frame = document.querySelector("#portal-overlay iframe.portal-frame");
        out.enterFluidWorld = !!enterRes.ok && !!frame && frame.src.includes("worlds/fluid/index.html");
        r.exitPortal();
        if (stromEntry) r.removeArchitecture(stromEntry);

        return out;
    });

    if (w12p2Results && !w12p2Results.error) {
        check("W12 P2 C1: welt_strom hat role:'portal'", w12p2Results.stromIsPortal);
        check("W12 P2 C1: welt_strom portalMeta zeigt auf die Fluid-Welt", w12p2Results.stromMeta);
        check("W12 P2 C1: welt_strom trägt exklusiv die isPortal-Affordance", w12p2Results.stromAffordance);
        check("W12 P2 C1: welt_strom ist _isPortalShaped (Quarz-Ring emergiert)", w12p2Results.stromPortalShaped);
        check("W12 P2 C1: _sanitizePortalMeta akzeptiert den Fluid-Welt-Pfad", w12p2Results.sanitizeFluidWorld);
        check("W12 P2 C1: enterPortal(welt_strom) lädt die Fluid-Welt ins iframe", w12p2Results.enterFluidWorld);
    } else {
        check("W12 P2 C1: Strom-Welt Tests laufen", false, w12p2Results ? w12p2Results.error : "no result");
    }

    // ### DSL-Brücke (das Protokoll) ###
    const w12bridgeResults = await safeEvaluate(page, async () => {
        const out = {};

        // _sanitizePortalMeta säubert das dsl-Manifest.
        const sanA = r._sanitizePortalMeta({
            world: "worlds/fluid/index.html",
            dsl: ["weather", "BAD OP", 7, "set_turbulence"],
        });
        out.sanitizeDsl =
            Array.isArray(sanA.dsl) &&
            sanA.dsl.length === 2 &&
            sanA.dsl.includes("weather") &&
            sanA.dsl.includes("set_turbulence");
        out.sanitizeNoDsl = r._sanitizePortalMeta({ world: "worlds/skeleton/index.html" }).dsl === null;

        // Built-in-Manifeste.
        const ws = r.state.blueprints.welt_strom;
        const wp = r.state.blueprints.welt_portal;
        out.stromManifest =
            !!ws.portalMeta.dsl &&
            ws.portalMeta.dsl.includes("weather") &&
            ws.portalMeta.dsl.includes("sturm") &&
            ws.portalMeta.dsl.includes("set_turbulence");
        out.skeletonManifest = !!wp.portalMeta.dsl && wp.portalMeta.dsl.includes("skybox_color");

        // _portalProgramOps — chain ist Rahmen, kein Wort.
        out.opsSingle = JSON.stringify(r._portalProgramOps(["weather", "rainy"])) === '["weather"]';
        out.opsChain =
            JSON.stringify(r._portalProgramOps(["chain", ["weather", "sunny"], ["sturm"]])) === '["weather","sturm"]';

        // enterPortal(welt_strom) → Overlay trägt das Manifest + body.in-portal.
        const pm = r.state.playerMesh.position;
        r.spawnArchitecture("welt_strom", { x: pm.x, y: pm.y, z: pm.z });
        const entry = (r.state.architectures || []).find((e) => e.type === "welt_strom");
        r.enterPortal(entry);
        out.overlayCarriesManifest =
            !!r._portalOverlay && Array.isArray(r._portalOverlay.dsl) && r._portalOverlay.dsl.includes("sturm");
        out.bodyInPortal = document.body.classList.contains("in-portal");

        // _portalParseWorldCommand — welt-eigene Wörter.
        const wc = r._portalParseWorldCommand("set_turbulence 0.8");
        out.parseWorldWord = Array.isArray(wc) && wc[0] === "set_turbulence" && wc[1] === 0.8;
        out.parseWorldRejects = r._portalParseWorldCommand("flieg hoch") === null;

        // _portalRouteDsl — Subset-Op weitergereicht, unbekanntes verworfen.
        const rt1 = r._portalRouteDsl(["weather", "rainy"], "Wetter", null);
        out.routeForward = rt1.forwarded === true && rt1.reason === "sent";
        const rt2 = r._portalRouteDsl(["spawn_creature", 3], "x", null);
        out.routeUnknown = rt2.forwarded === false && rt2.reason === "unknown_op";
        // Stufe 0 — ausgestellte Welt (kein Manifest).
        r._portalOverlay.dsl = null;
        const rt3 = r._portalRouteDsl(["weather", "rainy"], "x", null);
        out.routeExhibited = rt3.forwarded === false && rt3.reason === "exhibited";

        // Intercept: Chat-DSL im Portal läuft NICHT auf der Heimat-Welt.
        r._portalOverlay.dsl = ["weather"];
        r.state.weather = "sunny";
        r.processChatCommand("setze wetter rainy");
        out.homeWeatherUntouched = r.state.weather === "sunny";

        r.exitPortal();
        out.bodyClassCleared = !document.body.classList.contains("in-portal");
        if (entry) r.removeArchitecture(entry);

        return out;
    });

    if (w12bridgeResults && !w12bridgeResults.error) {
        check("W12 P2 C2: _sanitizePortalMeta säubert das dsl-Manifest", w12bridgeResults.sanitizeDsl);
        check("W12 P2 C2: _sanitizePortalMeta — kein dsl → null (Stufe 0)", w12bridgeResults.sanitizeNoDsl);
        check("W12 P2 C2: welt_strom trägt ein DSL-Manifest", w12bridgeResults.stromManifest);
        check("W12 P2 C2: welt_portal (Skelett) trägt ein DSL-Manifest", w12bridgeResults.skeletonManifest);
        check("W12 P2 C2: _portalProgramOps liest ein einzelnes Op", w12bridgeResults.opsSingle);
        check("W12 P2 C2: _portalProgramOps liest eine chain (ohne 'chain')", w12bridgeResults.opsChain);
        check("W12 P2 C2: das Portal-Overlay trägt das Manifest", w12bridgeResults.overlayCarriesManifest);
        check("W12 P2 C2: body.in-portal hebt die Konsole im Portal", w12bridgeResults.bodyInPortal);
        check("W12 P2 C2: _portalParseWorldCommand parst welt-eigene Wörter", w12bridgeResults.parseWorldWord);
        check("W12 P2 C2: _portalParseWorldCommand verwirft Nicht-Manifest-Wörter", w12bridgeResults.parseWorldRejects);
        check("W12 P2 C2: _portalRouteDsl reicht ein Subset-Op weiter", w12bridgeResults.routeForward);
        check("W12 P2 C2: _portalRouteDsl verwirft ein unbekanntes Op", w12bridgeResults.routeUnknown);
        check("W12 P2 C2: _portalRouteDsl — Stufe 0 (ausgestellt, stumm)", w12bridgeResults.routeExhibited);
        check("W12 P2 C2: Chat-DSL im Portal läuft NICHT auf der Heimat-Welt", w12bridgeResults.homeWeatherUntouched);
        check("W12 P2 C2: exitPortal räumt body.in-portal", w12bridgeResults.bodyClassCleared);
    } else {
        check("W12 P2 C2: DSL-Brücke Tests laufen", false, w12bridgeResults ? w12bridgeResults.error : "no result");
    }

    // ### zweite fremde Welt (dritte Gestalt: Phytogenesis & Lithos) ###
    const w12terrainResults = await safeEvaluate(page, async () => {
        const out = {};

        // Built-in welt_terrain-Portal + Manifest.
        const wt = r.state.blueprints && r.state.blueprints.welt_terrain;
        out.terrainIsPortal = !!wt && wt.role === "portal" && wt.roleManual === true;
        out.terrainMeta = !!wt && !!wt.portalMeta && wt.portalMeta.world === "worlds/terrain/index.html";
        out.terrainManifest =
            !!wt &&
            !!wt.portalMeta.dsl &&
            wt.portalMeta.dsl.includes("eiche") &&
            wt.portalMeta.dsl.includes("wald") &&
            wt.portalMeta.dsl.includes("neu");

        const wtAff = r.computeBlueprintAffordances(wt);
        out.terrainAffordance = wtAff.isPortal === true && !wtAff.moveable;
        out.terrainPortalShaped = r._isPortalShaped(wt) === true;

        // enterPortal(welt_terrain) → iframe + Brücke trägt einen Manifest-Op.
        const pm = r.state.playerMesh.position;
        r.spawnArchitecture("welt_terrain", { x: pm.x, y: pm.y, z: pm.z });
        const entry = (r.state.architectures || []).find((e) => e.type === "welt_terrain");
        const enterRes = entry ? r.enterPortal(entry) : { ok: false };
        const frame = document.querySelector("#portal-overlay iframe.portal-frame");
        out.enterTerrainWorld = !!enterRes.ok && !!frame && frame.src.includes("worlds/terrain/index.html");
        const rt = r._portalRouteDsl(["wald"], "Wald", null);
        out.terrainBridge = rt.forwarded === true;
        r.exitPortal();
        if (entry) r.removeArchitecture(entry);

        return out;
    });

    if (w12terrainResults && !w12terrainResults.error) {
        check("W12 P2: welt_terrain hat role:'portal'", w12terrainResults.terrainIsPortal);
        check("W12 P2: welt_terrain portalMeta zeigt auf die Phytogenesis-Welt", w12terrainResults.terrainMeta);
        check("W12 P2: welt_terrain trägt ein DSL-Manifest (eiche/wald/neu)", w12terrainResults.terrainManifest);
        check("W12 P2: welt_terrain trägt die isPortal-Affordance", w12terrainResults.terrainAffordance);
        check("W12 P2: welt_terrain ist _isPortalShaped", w12terrainResults.terrainPortalShaped);
        check("W12 P2: enterPortal(welt_terrain) lädt die Phytogenesis-Welt", w12terrainResults.enterTerrainWorld);
        check("W12 P2: die Brücke trägt einen Phytogenesis-Manifest-Op", w12terrainResults.terrainBridge);
    } else {
        check(
            "W12 P2: Phytogenesis-Welt Tests laufen",
            false,
            w12terrainResults ? w12terrainResults.error : "no result"
        );
    }

    // ### Welt-Registry + Portal-Zielen ###
    const w12registryResults = await safeEvaluate(page, () => {
        const out = {};
        const REG = r.constructor.WORLD_REGISTRY;

        // Welt-Registry — eine Quelle, drei Welten je mit Pfad + Manifest.
        out.registryExists = !!REG && !!REG.skeleton && !!REG.fluid && !!REG.terrain;
        out.registryShape =
            !!REG &&
            REG.fluid.world === "worlds/fluid/index.html" &&
            Array.isArray(REG.fluid.dsl) &&
            REG.fluid.dsl.includes("sturm");

        // Die 3 Built-in-Portale beziehen ihr portalMeta aus der Registry.
        const ws = r.state.blueprints.welt_strom;
        const wt = r.state.blueprints.welt_terrain;
        const wp = r.state.blueprints.welt_portal;
        out.builtinsFromRegistry =
            ws.portalMeta.world === REG.fluid.world &&
            wt.portalMeta.world === REG.terrain.world &&
            wp.portalMeta.world === REG.skeleton.world &&
            ws.portalMeta.dsl.includes("sturm") &&
            wt.portalMeta.dsl.includes("wald");

        // Ein eigener (nicht-Built-in) Bauplan zum Zielen.
        r.state.blueprints.test_portal_ring = {
            name: "test_portal_ring",
            label: "Test-Ring",
            builtIn: false,
            parts: [],
        };

        // UI: die Markier-Reihe trägt eine Portal-Welt-Auswahl.
        r.renderPlayerEquipUI();
        out.uiPortalSelect = !!document.querySelector(".equip-portal-select");

        // aimBlueprintAtWorld per id.
        const aimId = r.aimBlueprintAtWorld("test_portal_ring", "fluid");
        out.aimById =
            aimId.ok === true &&
            r.state.blueprints.test_portal_ring.role === "portal" &&
            r.state.blueprints.test_portal_ring.portalMeta.world === "worlds/fluid/index.html";

        // aimBlueprintAtWorld per Label (case-insensitive).
        const aimLabel = r.aimBlueprintAtWorld("test_portal_ring", "Phytogenesis & Lithos");
        out.aimByLabel =
            aimLabel.ok === true &&
            r.state.blueprints.test_portal_ring.portalMeta.world === "worlds/terrain/index.html";

        // Unbekannte Welt + Built-in werden abgelehnt.
        out.aimUnknownRejected = r.aimBlueprintAtWorld("test_portal_ring", "nirgendwo").ok === false;
        out.aimBuiltinRejected = r.aimBlueprintAtWorld("welt_portal", "fluid").ok === false;

        // DSL-Op set_portal.
        r.dslRun(["set_portal", "test_portal_ring", "skeleton"]);
        out.dslSetPortal = r.state.blueprints.test_portal_ring.portalMeta.world === REG.skeleton.world;

        // Chat-Pattern „richte portal X auf Y".
        const parsed = r.parseChatToDsl("richte portal test_portal_ring auf fluid");
        out.chatPattern = !!parsed && JSON.stringify(parsed.program) === '["set_portal","test_portal_ring","fluid"]';

        delete r.state.blueprints.test_portal_ring;
        r.renderPlayerEquipUI();
        return out;
    });

    if (w12registryResults && !w12registryResults.error) {
        check("W12 P2: WORLD_REGISTRY existiert (skeleton/fluid/terrain)", w12registryResults.registryExists);
        check("W12 P2: Registry-Einträge tragen Pfad + DSL-Manifest", w12registryResults.registryShape);
        check("W12 P2: Built-in-Portale beziehen portalMeta aus der Registry", w12registryResults.builtinsFromRegistry);
        check("W12 P2: Equip-UI trägt eine Portal-Welt-Auswahl", w12registryResults.uiPortalSelect);
        check("W12 P2: aimBlueprintAtWorld richtet per Welt-id", w12registryResults.aimById);
        check("W12 P2: aimBlueprintAtWorld richtet per Welt-Label", w12registryResults.aimByLabel);
        check("W12 P2: aimBlueprintAtWorld verwirft unbekannte Welt", w12registryResults.aimUnknownRejected);
        check("W12 P2: aimBlueprintAtWorld verwirft Built-in-Bauplan", w12registryResults.aimBuiltinRejected);
        check("W12 P2: DSL-Op set_portal richtet den Bauplan", w12registryResults.dslSetPortal);
        check("W12 P2: Chat-Pattern 'richte portal X auf Y'", w12registryResults.chatPattern);
    } else {
        check("W12 P2: Welt-Registry Tests laufen", false, w12registryResults ? w12registryResults.error : "no result");
    }

    // ### Portal-Größe emergiert aus der Avatar-Größe ###
    const w12portalSizeResults = await safeEvaluate(page, () => {
        const out = {};
        const passage = r._avatarPassageSize();
        out.passageSane = typeof passage === "number" && passage > 0.5 && passage < 30;
        const torusBp = (sizeX, material) => ({
            name: "t_test",
            parts: [
                {
                    shape: "torus",
                    material: material,
                    size: { x: sizeX, y: 1, z: 1 },
                    position: { x: 0, y: 0, z: 0 },
                },
            ],
        });
        // Ein magieleitender Torus deutlich größer als der Reisende → Tor-Form.
        out.bigIsPortalShaped = r._isPortalShaped(torusBp(passage * 2.5, "quarz")) === true;
        // Derselbe Ring deutlich kleiner als der Reisende → kein Tor.
        out.smallNotPortalShaped = r._isPortalShaped(torusBp(passage * 0.3, "quarz")) === false;
        // Magieleitung bleibt nötig: ein großer Eisen-Ring ist kein Tor.
        out.ironStillNotPortal = r._isPortalShaped(torusBp(passage * 2.5, "eisen")) === false;
        // Built-in-Portale bleiben Tore (Ring 3.4/3.6 > Avatar).
        out.builtinsStayPortal =
            r._isPortalShaped(r.state.blueprints.welt_strom) === true &&
            r._isPortalShaped(r.state.blueprints.welt_terrain) === true;
        // minRingSize ist als feste Zahl entfernt.
        out.noFixedThreshold = r.constructor.SUBSTANCE_ROLE_THRESHOLDS.portal.minRingSize === undefined;
        return out;
    });

    if (w12portalSizeResults && !w12portalSizeResults.error) {
        check("W12 P2: Avatar-Durchgangsgröße ist plausibel", w12portalSizeResults.passageSane);
        check("W12 P2: großer Magie-Ring ist Tor-förmig", w12portalSizeResults.bigIsPortalShaped);
        check("W12 P2: zu kleiner Ring (< Avatar) ist kein Tor", w12portalSizeResults.smallNotPortalShaped);
        check("W12 P2: großer Eisen-Ring bleibt kein Tor (Magie nötig)", w12portalSizeResults.ironStillNotPortal);
        check("W12 P2: Built-in-Portale bleiben Tor-förmig", w12portalSizeResults.builtinsStayPortal);
        check("W12 P2: feste minRingSize-Zahl ist entfernt", w12portalSizeResults.noFixedThreshold);
    } else {
        check(
            "W12 P2: Portal-Größe Tests laufen",
            false,
            w12portalSizeResults ? w12portalSizeResults.error : "no result"
        );
    }

    // ### Umwidmen: Portal-Geste erreichbar + umwidmbar ###
    // Das Umwidmen lebt in der WERKSTATT-Mach-Zone: geprüft werden die Werkstatt-Reihe des gewählten
    // Bauplans + der ✨-Emergent-Reset.
    const w12markResults = await safeEvaluate(page, () => {
        const out = {};
        r.state.blueprints.test_mark_ring = {
            name: "test_mark_ring",
            label: "TestMarkRing",
            builtIn: false,
            parts: [__teil("box", "stein", 0, 0, 0, 1, 1, 1)],
        };
        const ws = r._ensureWorkshopState();
        const savedSel = ws.selectedBlueprint;
        r.selectBlueprintForEdit("test_mark_ring");
        const zone = document.getElementById("workshop-action-zone") || document.getElementById("workshop-stats-panel");
        out.markRowRendered =
            !!zone && !!zone.querySelector(".workshop-umwidmen-row") && !!zone.querySelector(".equip-portal-select");
        // markieren → roleManual gesetzt; die Reihe BLEIBT (re-markierbar, kein Sackgassen-Zustand)
        r.aimBlueprintAtWorld("test_mark_ring", "fluid");
        r.selectBlueprintForEdit("test_mark_ring");
        const zone2 =
            document.getElementById("workshop-action-zone") || document.getElementById("workshop-stats-panel");
        out.markPersistsAfterRole = !!zone2 && !!zone2.querySelector(".workshop-umwidmen-row");
        // der Rollen-Chip des Panels nennt die aktuelle Rolle (Tor).
        out.rowShowsRole = Array.from(document.querySelectorAll(".spec-role-chip")).some((el) =>
            /tor|portal/i.test(el.textContent)
        );
        // ✨ Emergent löst die Markierung — die Rolle emergiert wieder.
        const reset = r.resetBlueprintRole("test_mark_ring");
        out.resetWorks =
            reset.ok === true &&
            r.state.blueprints.test_mark_ring.roleManual === undefined &&
            r.state.blueprints.test_mark_ring.role === r.computeBlueprintRole(r.state.blueprints.test_mark_ring);
        // das ICH trägt die Doublette NICHT mehr (nur Verweis + Schnell-Trünke).
        r.renderPlayerEquipUI();
        out.ichClean = document.querySelectorAll("#player-equip .equip-portal-select").length === 0;
        delete r.state.blueprints.test_mark_ring;
        ws.selectedBlueprint = savedSel;
        return out;
    });

    if (w12markResults && !w12markResults.error) {
        check(
            "W12 P2/M5: die Umwidmen-Reihe (+ Portal-Auswahl) lebt in der WERKSTATT-Mach-Zone",
            w12markResults.markRowRendered
        );
        check(
            "W12 P2/M5: markierter Bauplan bleibt umwidmbar (kein Sackgassen-Zustand)",
            w12markResults.markPersistsAfterRole
        );
        check("W12 P2/M5: der Rollen-Chip nennt die aktuelle Rolle", w12markResults.rowShowsRole);
        check(
            "M5: ✨ Emergent löst roleManual (der Chip-Tooltip-Verweis ist wahr) + das ICH trägt keine Doublette",
            w12markResults.resetWorks && w12markResults.ichClean
        );
    } else {
        check("W12 P2: Markier-Sektion Tests laufen", false, w12markResults ? w12markResults.error : "no result");
    }

    // ### Teil A: Ereignisse zurück (Sub-Welt → Journal) ###
    const w12p3aResults = await safeEvaluate(page, () => {
        const out = {};
        const journal = () => r.state.worldJournal.entries;
        const lastEntry = () => journal()[journal().length - 1];
        // Stub-Overlay: _portalReceiveEvent braucht nur _portalOverlay-Truthiness.
        r._portalOverlay = { label: "Test-Welt", world: "worlds/skeleton/index.html", dsl: null };
        const ok = r._portalReceiveEvent({ type: "event", text: "Ein Sturm zog auf." });
        const ev = lastEntry();
        out.eventJournaled = ok === true && !!ev && ev.text === "Ein Sturm zog auf.";
        out.eventTypeIsPortal = !!ev && ev.type === "portal";
        out.eventCtxWorld = !!ev && !!ev.ctx && ev.ctx.world === "Test-Welt";
        // Leeres/garbage Ereignis wird verworfen — der letzte Eintrag bleibt.
        const guard = lastEntry();
        r._portalReceiveEvent({ type: "event", text: "   " });
        r._portalReceiveEvent({ type: "event" });
        out.garbageIgnored = lastEntry() === guard;
        // Text wird auf 160 gedeckelt — eine fremde Welt sprengt keine Zeile.
        r._portalReceiveEvent({ type: "event", text: "x".repeat(400) });
        out.textCapped = lastEntry().text.length <= 160;
        // SICHERHEIT: ein Ereignis mit program-Feld führt NICHTS aus.
        const weatherBefore = r.state.weather;
        r._portalReceiveEvent({ type: "event", text: "harmlos", program: ["weather", "rainy"] });
        out.eventNeverExecutes = r.state.weather === weatherBefore && lastEntry().text === "harmlos";
        // Außerhalb eines Portals ist _portalReceiveEvent ein No-op.
        r._portalOverlay = null;
        out.noopOutsidePortal = r._portalReceiveEvent({ type: "event", text: "z" }) === false;
        // Der onMessage-Dispatch leitet {type:"event"} an _portalReceiveEvent.
        r._buildPortalOverlay({ world: "worlds/skeleton/index.html", label: "Dispatch-Welt", dsl: null });
        const po = r._portalOverlay;
        po.onMessage({
            source: po.iframe.contentWindow,
            data: { type: "event", text: "Dispatch-Probe." },
        });
        out.onMessageDispatches = lastEntry().text === "Dispatch-Probe.";
        r._disposePortalOverlay();
        // der Rückkanal-Rate-Limit deckelt eine
        // flutende fremde Welt: nach PORTAL_EVENT_RATE_MAX je
        // Fenster wird verworfen, das Journal nicht überrannt.
        r._portalOverlay = { label: "Flut-Welt", world: "worlds/skeleton/index.html", dsl: null };
        let floodAccepted = 0;
        for (let i = 0; i < 20; i++) {
            if (r._portalReceiveEvent({ type: "event", text: "Flut " + i }) === true) floodAccepted++;
        }
        out.rateLimitCapsBurst = floodAccepted === AnazhRealm.PORTAL_EVENT_RATE_MAX;
        // Nicht die journal().length-Differenz messen: am 200-FIFO-Cap verdrängt jedes Anhängen einen alten
        // Eintrag. Stattdessen die "Flut "-Einträge zählen — genau RATE_MAX, nie von Geschwistern evictet.
        out.rateLimitNoJournalOverflow =
            journal().filter((e) => e && typeof e.text === "string" && e.text.startsWith("Flut ")).length ===
            AnazhRealm.PORTAL_EVENT_RATE_MAX;
        r._portalOverlay = null;
        // Das Overlay aus _buildPortalOverlay trägt das Rate-Limit-Fenster.
        r._buildPortalOverlay({ world: "worlds/skeleton/index.html", label: "Fenster-Welt", dsl: null });
        out.overlayHasEventWindow =
            typeof r._portalOverlay.eventWindowStart === "number" &&
            typeof r._portalOverlay.eventWindowCount === "number";
        r._disposePortalOverlay();
        // enterPortal schreibt den Erst-Besuch (journalAppendOnce).
        // Der seen-Schlüssel wird vorab geleert — ein früherer
        // Portal-Test könnte die Skelett-Welt schon betreten haben.
        r.state.blueprints.test_p3_ring = {
            name: "test_p3_ring",
            label: "Test-P3-Ring",
            builtIn: false,
            parts: [],
            portalMeta: { world: "worlds/skeleton/index.html", label: "P3-Tor", dsl: null },
        };
        const visitKey = "portalVisit:worlds/skeleton/index.html";
        if (r.state.worldJournal.seen) delete r.state.worldJournal.seen[visitKey];
        r.enterPortal({ type: "test_p3_ring", affordances: { isPortal: true } });
        const visit = lastEntry();
        out.entryJournaled = !!visit && visit.type === "portal" && /P3-Tor/.test(visit.text);
        r.exitPortal();
        // Zweites Betreten flutet das Journal NICHT (journalAppendOnce).
        const reGuard = lastEntry();
        r.enterPortal({ type: "test_p3_ring", affordances: { isPortal: true } });
        out.entryOncePerWorld = lastEntry() === reGuard;
        r.exitPortal();
        if (r.state.worldJournal.seen) delete r.state.worldJournal.seen[visitKey];
        delete r.state.blueprints.test_p3_ring;
        return out;
    });

    if (w12p3aResults && !w12p3aResults.error) {
        check("W12 P3a: Welt-Ereignis wird ins Journal geschrieben", w12p3aResults.eventJournaled);
        check("W12 P3a: Journal-Eintrag trägt den Typ 'portal'", w12p3aResults.eventTypeIsPortal);
        check("W12 P3a: Eintrag merkt sich die Welt (ctx.world)", w12p3aResults.eventCtxWorld);
        check("W12 P3a: leeres/garbage Ereignis wird verworfen", w12p3aResults.garbageIgnored);
        check("W12 P3a: Ereignis-Text wird auf 160 Zeichen gedeckelt", w12p3aResults.textCapped);
        check("W12 P3a: SICHERHEIT — ein Ereignis führt NIE DSL aus", w12p3aResults.eventNeverExecutes);
        check("W12 P3a: außerhalb eines Portals ist es ein No-op", w12p3aResults.noopOutsidePortal);
        check("W12 P3a: onMessage-Dispatch leitet {type:event} weiter", w12p3aResults.onMessageDispatches);
        check("W12 P3a: enterPortal schreibt den Erst-Besuch ins Journal", w12p3aResults.entryJournaled);
        check("W12 P3a: wiederholtes Betreten flutet das Journal nicht", w12p3aResults.entryOncePerWorld);
        check("W12 P3-Härtung: Rückkanal-Rate-Limit deckelt einen Burst", w12p3aResults.rateLimitCapsBurst);
        check(
            "W12 P3-Härtung: das Journal wird nicht über den Deckel hinaus geflutet",
            w12p3aResults.rateLimitNoJournalOverflow
        );
        check("W12 P3-Härtung: das Portal-Overlay trägt das Rate-Limit-Fenster", w12p3aResults.overlayHasEventWindow);
    } else {
        check("W12 P3a: Teil-A-Tests laufen", false, w12p3aResults ? w12p3aResults.error : "no result");
    }

    // ### Teil B: die native Manifest-Stufe ###
    const w12p3bResults = await safeEvaluate(page, () => {
        const out = {};
        // _sanitizeDslSubset — der gemeinsame Manifest-Sanitizer.
        out.sanitizeFilters =
            JSON.stringify(r._sanitizeDslSubset(["ok_op", "Bad Op", 5, "auch_gut", null])) ===
            JSON.stringify(["ok_op", "auch_gut"]);
        out.sanitizeNullOnEmpty = r._sanitizeDslSubset([]) === null && r._sanitizeDslSubset("nope") === null;
        out.sanitizeCaps = r._sanitizeDslSubset(new Array(80).fill("op")).length === 64;
        // _portalReceiveManifest — die Welt beschreibt sich selbst.
        r._portalOverlay = {
            label: "Alt-Label",
            world: "worlds/fluid/index.html",
            dsl: ["skybox_color"],
            manifestStage: "übersetzt",
            hintEl: null,
        };
        const ok = r._portalReceiveManifest({
            type: "ready",
            dsl: ["skybox_color", "flut"],
            label: "Strom-Welt",
        });
        out.nativeOverrides =
            ok === true && r._portalOverlay.dsl.includes("flut") && r._portalOverlay.manifestStage === "nativ";
        out.nativeLabel = r._portalOverlay.label === "Strom-Welt";
        // Angekündigtes dsl wird gesäubert — kein garbage-Op.
        r._portalOverlay.dsl = null;
        r._portalReceiveManifest({ dsl: ["gut_op", "BÖSE OP", 42] });
        out.nativeSanitized = JSON.stringify(r._portalOverlay.dsl) === JSON.stringify(["gut_op"]);
        // Kein dsl → false, das vorhandene Manifest bleibt (Fallback).
        r._portalOverlay.dsl = ["original"];
        r._portalOverlay.manifestStage = "übersetzt";
        out.noDslKeepsFallback =
            r._portalReceiveManifest({ type: "ready" }) === false &&
            r._portalOverlay.dsl[0] === "original" &&
            r._portalOverlay.manifestStage === "übersetzt";
        r._portalOverlay = null;
        // _buildPortalOverlay setzt die Drei-Stufen-Marke + hintEl.
        r._buildPortalOverlay({ world: "worlds/skeleton/index.html", label: "T", dsl: ["skybox_color"] });
        out.stageUebersetzt = r._portalOverlay.manifestStage === "übersetzt" && !!r._portalOverlay.hintEl;
        r._disposePortalOverlay();
        r._buildPortalOverlay({ world: "worlds/skeleton/index.html", label: "T", dsl: null });
        out.stageAusgestellt = r._portalOverlay.manifestStage === "ausgestellt";
        r._disposePortalOverlay();
        // Der ready-Handler wendet das native Manifest an.
        r._buildPortalOverlay({ world: "worlds/skeleton/index.html", label: "T", dsl: null });
        const po = r._portalOverlay;
        po.onMessage({
            source: po.iframe.contentWindow,
            data: { type: "ready", dsl: ["skybox_color", "selbst_op"], label: "Selbst-Welt" },
        });
        out.readyAppliesManifest =
            !!po.dsl && po.dsl.includes("selbst_op") && po.manifestStage === "nativ" && po.label === "Selbst-Welt";
        r._disposePortalOverlay();
        // Das Registry-Literal kennt „flut" NICHT — der Beweis,
        // dass die native Stufe mehr trägt als die übersetzte.
        out.registryLacksFlut = !r.constructor.WORLD_REGISTRY.fluid.dsl.includes("flut");
        return out;
    });

    if (w12p3bResults && !w12p3bResults.error) {
        check("W12 P3b: Sanitizer filtert Nicht-Ops raus", w12p3bResults.sanitizeFilters);
        check("W12 P3b: Sanitizer liefert null bei leer/Nicht-Array", w12p3bResults.sanitizeNullOnEmpty);
        check("W12 P3b: Sanitizer deckelt auf 64 Ops", w12p3bResults.sanitizeCaps);
        check("W12 P3b: natives Manifest überschreibt po.dsl + setzt Stufe 'nativ'", w12p3bResults.nativeOverrides);
        check("W12 P3b: natives Manifest übernimmt das Welt-Label", w12p3bResults.nativeLabel);
        check("W12 P3b: angekündigtes dsl wird gesäubert (kein garbage-Op)", w12p3bResults.nativeSanitized);
        check("W12 P3b: ready ohne dsl → Fallback aufs portalMeta-Manifest", w12p3bResults.noDslKeepsFallback);
        check("W12 P3b: _buildPortalOverlay markiert Stufe 'übersetzt' + hintEl", w12p3bResults.stageUebersetzt);
        check(
            "W12 P3b: ohne Manifest markiert _buildPortalOverlay Stufe 'ausgestellt'",
            w12p3bResults.stageAusgestellt
        );
        check("W12 P3b: der ready-Handler wendet das native Manifest an", w12p3bResults.readyAppliesManifest);
        check("W12 P3b: das Registry-Literal kennt 'flut' nicht", w12p3bResults.registryLacksFlut);
    } else {
        check("W12 P3b: Teil-B-Tests laufen", false, w12p3bResults ? w12p3bResults.error : "no result");
    }

}

// G8 R3 — Lokalitäts-Härtung (M1): die Sandbox-Grenze als Invariante eingefroren
// (sandboxed → null-origin · vendored → unforgeable sandboxed · kein Welt-Pfad
// zum innersten Ring). Die ECHTE Isolation beweist die Sonde smoke-sandbox (git-Archiv) im Browser.
async function checkBandG8R3Locality({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) das Sandbox-Attribut: sandboxed → allow-scripts allein (null-origin),
        // trusted → + allow-same-origin + allow-pointer-lock (unser
        // eigener Code darf den Zeiger fangen — die begehbare Portal-Welt).
        out.sandboxedAttr = r._portalSandboxAttr({ trust: "sandboxed" }) === "allow-scripts";
        out.trustedAttr =
            r._portalSandboxAttr({ trust: "trusted" }) === "allow-scripts allow-same-origin allow-pointer-lock";
        // (2) _sanitizePortalMeta: trust:"sandboxed" bleibt sandboxed, Default = trusted.
        const m1 = r._sanitizePortalMeta({ world: "worlds/x/i.html", trust: "sandboxed" }, "X");
        const m2 = r._sanitizePortalMeta({ world: "worlds/x/i.html" }, "X");
        out.trustResolves = m1.trust === "sandboxed" && m2.trust === "trusted";
        // (3) der Lokalitäts-Beweis: vendored-force + inner-ring-absent + die Attrs.
        const audit = r._localityAudit();
        out.auditOk = audit.ok === true;
        out.vendoredForced = audit.facts.vendoredForcedSandboxed === true;
        out.innerRingAbsent = audit.facts.innerRingAbsent === true;
        return out;
    });
    if (!res) {
        check("G8 R3: Lokalitäts-Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "G8 R3: sandboxed → allow-scripts ALLEIN (null-origin) · trusted → + same-origin",
        res.sandboxedAttr && res.trustedAttr
    );
    check("G8 R3: _sanitizePortalMeta löst trust (sandboxed bleibt · Default trusted)", res.trustResolves);
    check(
        "G8 R3: vendored erzwingt sandboxed unforgeable + der innere Ring ist abwesend",
        res.vendoredForced && res.innerRingAbsent && res.auditOk
    );
}

// KO-PRÄSENZ: das Mesh trägt Posen (subworld-pose, Welt-Schlüssel + Empfänger-Rate-Wand), die Heimat
// injiziert peer-join/-state/-leave ins Sub-Welt-iframe, die WELT rendert die Gefährten
// (worlds/begegnung). E2E: `npm run smoke:copresence`; dieses Band friert die Mechanik.
async function checkBandW18CoPresence({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) die Tier-Wahrheit: EINE Quelle, drei ehrliche Stufen.
        out.tier2 = r._portalCoPresenceTier({ coPresence: true }).tier === 2;
        out.tier1 = r._portalCoPresenceTier({ multiplayer: true }).tier === 1;
        out.tier0 = r._portalCoPresenceTier({}).tier === 0;
        // (2) die Sanitize-Wand trägt die Deklaration nur als echten Boolean.
        out.metaSan =
            r._sanitizePortalMeta({ world: "worlds/begegnung/index.html", coPresence: true }, "x").coPresence ===
                true &&
            r._sanitizePortalMeta({ world: "worlds/begegnung/index.html", coPresence: "ja" }, "x").coPresence === false;
        // (3) die Registry trägt die erste Ko-Präsenz-Welt (sandboxed — das
        // Protokoll quert die VOLLE null-origin-Wand).
        const reg = r.constructor.WORLD_REGISTRY.begegnung;
        out.registry =
            !!reg && reg.coPresence === true && reg.trust === "sandboxed" && /worlds\/begegnung\//.test(reg.world);
        // (4) der Mesh-Pfad ist verdrahtet: ALLOWED-Liste + Dispatch-Tabelle +
        // Empfänger-Rate-Wand je Peer (das _cpRate-Muster).
        out.channelAllowed = window.__consumes(r, "_p2pHandleChannelMessage", r, "_p2pMsgSubworldPose", [
            "peerKonsumPose",
            JSON.stringify({
                type: "subworld-pose",
                worldId: "worlds/begegnung/index.html",
                pose: { x: 0, y: 0, z: 0, yaw: 0 },
            }),
        ]);
        out.dispatch = r.constructor.P2P_MESSAGE_HANDLERS["subworld-pose"] === "_p2pMsgSubworldPose";
        // (5)-(8) BEHAVIORAL am gestubbten Overlay (kein echtes iframe nötig —
        // die postMessage-Injektion wird über ein Fake-contentWindow gefangen).
        const savedPo = r._portalOverlay;
        try {
            const sent = [];
            const fakeWin = { postMessage: (m) => sent.push(m) };
            r._portalOverlay = {
                coPresence: true,
                world: "worlds/begegnung/index.html",
                trust: "sandboxed",
                peers: new Map(),
                poseWindowStart: 0,
                poseWindowCount: 0,
                poseTimer: null,
                localPose: null,
                iframe: { contentWindow: fakeWin },
            };
            // (5) local-pose: angenommen + gemerkt; Müll-Pose fällt; Rate-Wand deckelt.
            const ok = r._portalReceiveLocalPose({ pose: { x: 1, y: 2, z: 3, yaw: 0.5 } });
            out.localPose = ok === true && r._portalOverlay.localPose && r._portalOverlay.localPose.x === 1;
            out.localPoseGarbage = r._portalReceiveLocalPose({ pose: { x: NaN, y: 0, z: 0, yaw: 0 } }) === false;
            let accepted = 1;
            for (let i = 0; i < 30; i++) {
                if (r._portalReceiveLocalPose({ pose: { x: i, y: 0, z: 0, yaw: 0 } })) accepted++;
            }
            out.rateCapped = accepted <= r.constructor.SUBWORLD_POSE_RATE_MAX;
            // (6) Zustellung: die ERSTE Pose gebiert peer-join VOR peer-state,
            // die zweite nur peer-state; eine fremde worldId fällt (B2).
            sent.length = 0;
            const msg = { worldId: "worlds/begegnung/index.html", pose: { x: 4, y: 0, z: 5, yaw: 1 } };
            const d1 = r._portalPoseDeliver("peer-test-1", msg);
            const d2 = r._portalPoseDeliver("peer-test-1", msg);
            out.joinThenState =
                d1 === true &&
                d2 === true &&
                sent.length === 3 &&
                sent[0].type === "peer-join" &&
                sent[1].type === "peer-state" &&
                sent[2].type === "peer-state";
            out.b2Scoped =
                r._portalPoseDeliver("peer-test-2", { worldId: "worlds/anders/index.html", pose: msg.pose }) === false;
            // (7) der Abwesenheits-Sweep: verstummt → peer-leave + raus.
            r._portalOverlay.peers.get("peer-test-1").lastAt =
                performance.now() - (r.constructor.SUBWORLD_POSE_TIMEOUT_MS + 1000);
            sent.length = 0;
            r._portalSweepPosePeers();
            out.sweep =
                !r._portalOverlay.peers.has("peer-test-1") && sent.length === 1 && sent[0].type === "peer-leave";
            // die Peer-Rate-Wand: ein flutender Gefährte erreicht das iframe höchstens SUBWORLD_POSE_PEER_RATE_MAX-mal
            sent.length = 0;
            const M = r.constructor.SUBWORLD_POSE_PEER_RATE_MAX;
            for (let i = 0; i < M + 5; i++)
                r._p2pMsgSubworldPose(
                    { peerId: "peer-flut-pose", worldId: msg.worldId, pose: { x: i, y: 0, z: 0, yaw: 0 } },
                    r.state.p2p
                );
            out.peerRate = sent.filter((m) => m.type === "peer-state").length === M;
            if (r._portalOverlay.poseTimer) {
                clearInterval(r._portalOverlay.poseTimer);
                r._portalOverlay.poseTimer = null;
            }
            // (8) das Deklarations-Gate: ohne coPresence nimmt das Portal weder
            // local-pose an noch stellt es Peer-Posen zu (die Welt bleibt still).
            r._portalOverlay.coPresence = false;
            out.declarationGate =
                r._portalReceiveLocalPose({ pose: { x: 1, y: 1, z: 1, yaw: 0 } }) === false &&
                r._portalPoseDeliver("peer-test-3", msg) === false;
        } finally {
            r._portalOverlay = savedPo || null;
        }
        return out;
    });
    check("W18 Ko-Präsenz: die Tier-Wahrheit (EINE Quelle, drei ehrliche Stufen)", res.tier2 && res.tier1 && res.tier0);
    check("W18 Ko-Präsenz: Sanitize-Wand + Registry (begegnung sandboxed + deklariert)", res.metaSan && res.registry);
    check(
        "W18 Ko-Präsenz: der Mesh-Pfad verdrahtet (ALLOWED + Dispatch + Peer-Rate-Wand)",
        res.channelAllowed && res.dispatch && res.peerRate
    );
    check(
        "W18 Ko-Präsenz: local-pose angenommen + Müll fällt + Rate-Wand deckelt",
        res.localPose && res.localPoseGarbage && res.rateCapped
    );
    check("W18 Ko-Präsenz: peer-join VOR peer-state, dann nur peer-state (Injektion)", res.joinThenState);
    check("W18 Ko-Präsenz: B2-Welt-Schlüssel scoped die Zustellung", res.b2Scoped);
    check("W18 Ko-Präsenz: der Abwesenheits-Sweep räumt Verstummte als peer-leave", res.sweep);
    check("W18 Ko-Präsenz: das Deklarations-Gate (ohne coPresence bleibt die Welt still)", res.declarationGate);
}

// INPUT-BRÜCKE: eine Welt, die im ready-Handshake `inputActions` deklariert, bekommt die Tasten als
// SEMANTISCHE Aktionen ({type:"input", action, down} — Daten, nie Key-Codes). Eingefrorenes
// Vokabular, Tipp-Feld-Wand, Listener lebt + stirbt mit dem Overlay. E2E: smoke:copresence.
async function checkBandW18InputBridge({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) das eingefrorene Vokabular + die Tasten-Karte (WASD/Pfeile).
        const A = r.constructor.PORTAL_INPUT_ACTIONS;
        const K = r.constructor.PORTAL_INPUT_KEYMAP;
        out.vocab = Object.isFrozen(A) && A.includes("forward") && A.includes("use") && A.length === 6;
        out.keymap = Object.isFrozen(K) && K.KeyW === "forward" && K.ArrowDown === "back" && K.Space === "jump";
        const savedPo = r._portalOverlay;
        try {
            const sent = [];
            const fakeWin = { postMessage: (m) => sent.push(m) };
            r._portalOverlay = {
                coPresence: true,
                world: "worlds/begegnung/index.html",
                trust: "sandboxed",
                peers: new Map(),
                inputActions: null,
                onInputKey: null,
                hintEl: { textContent: "" },
                dsl: null,
                iframe: { contentWindow: fakeWin },
            };
            // (2) die Deklaration: nur Vokabular-Worte überleben; Müll allein → false.
            out.declareClean =
                r._portalEnableInputBridge(["forward", "fliegen", "forward", "left"]) === true &&
                JSON.stringify(r._portalOverlay.inputActions) === '["forward","left"]';
            out.declareGarbage = (() => {
                const po2 = { ...r._portalOverlay, inputActions: null, onInputKey: null };
                const saved2 = r._portalOverlay;
                r._portalOverlay = po2;
                const res2 = r._portalEnableInputBridge(["zaubern", 42]);
                r._portalOverlay = saved2;
                return res2 === false && po2.inputActions === null;
            })();
            // (3) der Hinweis KONSUMIERT die Brücke („deine Tasten wirken").
            out.hintSays = /Tasten wirken/.test(r._portalOverlay.hintEl.textContent);
            // (4) das Forwarding: deklarierte Taste → semantische Aktion;
            // un-deklarierte (Space→jump nicht gewählt) fällt; Tipp-Feld fällt;
            // Auto-Repeat fällt; keyup trägt down:false.
            sent.length = 0;
            const ev = (code, type, extra) => Object.assign({ code, type, repeat: false, target: null }, extra || {});
            out.fwdDown =
                r._portalForwardInput(ev("KeyW", "keydown")) === true &&
                sent.length === 1 &&
                sent[0].type === "input" &&
                sent[0].action === "forward" &&
                sent[0].down === true;
            out.fwdUp = r._portalForwardInput(ev("KeyW", "keyup")) === true && sent[1] && sent[1].down === false;
            out.undeclared = r._portalForwardInput(ev("Space", "keydown")) === false;
            out.typingWall = r._portalForwardInput(ev("KeyW", "keydown", { target: { tagName: "INPUT" } })) === false;
            out.repeatWall = r._portalForwardInput(ev("KeyW", "keydown", { repeat: true })) === false;
        } finally {
            // Den Test-Listener vom echten window räumen (die Deklaration
            // registrierte ihn) — kein Leck in die Folge-Bands.
            const po = r._portalOverlay;
            if (po && po.onInputKey) {
                window.removeEventListener("keydown", po.onInputKey);
                window.removeEventListener("keyup", po.onInputKey);
            }
            r._portalOverlay = savedPo || null;
        }
        return out;
    });
    check("W18-C Input-Brücke: eingefrorenes Vokabular + Tasten-Karte (WASD/Pfeile)", res.vocab && res.keymap);
    check(
        "W18-C Input-Brücke: die Deklaration siebt (nur Vokabular, Müll fällt)",
        res.declareClean && res.declareGarbage
    );
    check("W18-C Input-Brücke: der Hinweis sagt „deine Tasten wirken“", res.hintSays);
    check(
        "W18-C Input-Brücke: Taste → semantische Aktion (down/up; un-deklariert fällt)",
        res.fwdDown && res.fwdUp && res.undeclared
    );
    check("W18-C Input-Brücke: Tipp-Feld-Wand + Auto-Repeat-Wand", res.typingWall && res.repeatWall);
}

// DARIN LEBEN: das Wohnen ist ein globaler Zeiger (anazh.portalDwelling, NIE im Welt-Snapshot);
// der Boot kehrt durchs Tor zurück, Gefährten sehen „wohnt in …“ (soul-Kanal), anazh.portalState
// trägt den Zustand der Fremd-Welt zurück (restoreState im enter). Reload-E2E lebt im Smoke.
async function checkBandW18Dwell({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const savedPo = r._portalOverlay;
        const savedDwell = localStorage.getItem("anazh.portalDwelling");
        const savedStates = localStorage.getItem("anazh.portalState");
        try {
            localStorage.removeItem("anazh.portalDwelling");
            localStorage.removeItem("anazh.portalState");
            // (1) Wohnen außerhalb eines Portals ist ehrlich unmöglich.
            r._portalOverlay = null;
            out.dwellOutside = r.dwellInPortal().reason === "not_in_portal";
            // (2) der Wohn-Rundlauf am gestubbten Begegnungs-Portal: Zeiger
            // gesetzt (id-förmig) + der Hinweis sagt „du wohnst hier";
            // endDwelling räumt den Zeiger.
            const sent = [];
            r._portalOverlay = {
                world: "worlds/begegnung/index.html",
                label: "Begegnungs-Feld",
                trust: "sandboxed",
                dsl: null,
                inputActions: null,
                coPresence: true,
                peers: new Map(),
                hintEl: { textContent: "" },
                iframe: { contentWindow: { postMessage: (m) => sent.push(m) } },
            };
            // „wohne hier" annonciert das Wohnen im soul-Kanal (gefangen am Senden)
            const gesendet = [],
                p2pAn = r.state.p2p.enabled;
            r.p2pSend = (m) => gesendet.push(m);
            r.state.p2p.enabled = true;
            let dw;
            try {
                dw = r.dwellInPortal();
            } finally {
                delete r.p2pSend;
                r.state.p2p.enabled = p2pAn;
            }
            out.soulSends = gesendet.some((m) => m.type === "soul" && m.dwell === "Begegnungs-Feld");
            const marker = r._loadPortalDwelling();
            out.dwellSets = dw.ok === true && !!marker && marker.worldId === "begegnung";
            out.hintDwell = /wohnst hier/.test(r._portalOverlay.hintEl.textContent);
            // (3) der Persistenz-Slot: Zustand angenommen (String, gedeckelt),
            // Müll + Oversize fallen.
            out.stateSaved =
                r._portalReceiveState({ data: '{"x":7,"y":-9}' }) === true &&
                r._loadPortalStates().begegnung &&
                r._loadPortalStates().begegnung.data === '{"x":7,"y":-9}';
            out.stateOversize =
                r._portalReceiveState({ data: "x".repeat(r.constructor.PORTAL_STATE_MAX_BYTES + 1) }) === false;
            out.stateGarbage = r._portalReceiveState({ data: 42 }) === false;
            // (4) der Zustand kehrt im enter zurück (restoreState).
            sent.length = 0;
            r._portalSendEnter();
            out.restoreTravels =
                sent.length === 1 && sent[0].type === "enter" && sent[0].restoreState === '{"x":7,"y":-9}';
            // (5) heimziehen räumt den Zeiger.
            const end = r.endDwelling();
            out.endClears = end.was === "begegnung" && r._loadPortalDwelling() === null;
            // (6) die Boot-Rückkehr beendet ein un-auffindbares Zuhause ehrlich
            // (Welt weg → Zeiger fällt, der Spieler wacht daheim auf).
            r._portalOverlay = null;
            r._savePortalDwelling({ worldId: "gibtsnichtwelt", label: "Verloren", at: Date.now() });
            out.bootHonest = r._portalDwellingBootReturn() === false && r._loadPortalDwelling() === null;
        } finally {
            r._portalOverlay = savedPo || null;
            if (savedDwell === null) localStorage.removeItem("anazh.portalDwelling");
            else localStorage.setItem("anazh.portalDwelling", savedDwell);
            if (savedStates === null) localStorage.removeItem("anazh.portalState");
            else localStorage.setItem("anazh.portalState", savedStates);
        }
        // (7) der Empfänger merkt sich, wo der Gefährte wohnt, und sein Namensschild zeichnet es; die Chat-Gesten
        // „wohne hier"/„ziehe heim" stehen in der EINEN Tabelle.
        const pid = "peer-dwell-zensus";
        r._p2pMsgSoul({ peerId: pid, soulName: "human", name: "Bo" }, r.state.p2p);
        const pe = r.state.p2p.peers.get(pid);
        const schild = () => (pe && pe.nameLabel ? pe.nameLabel.material.map.image.toDataURL() : "");
        const ohne = schild();
        r._p2pMsgSoul({ peerId: pid, soulName: "human", name: "Bo", dwell: "Feld" }, r.state.p2p);
        out.soulReads = !!pe && pe.dwellingIn === "Feld";
        out.labelShows = !!ohne && schild() !== ohne;
        r._p2pRemovePeer(pid);
        const examples = r.chatSystemPatterns.map((p) => p.example);
        out.chatGestures = examples.includes("wohne hier") && examples.includes("ziehe heim");
        // (8) der Zeiger + der Slot leben GLOBAL (nie im Welt-Snapshot) —
        // buildStateSnapshot kennt sie nicht.
        out.notInSnapshot = window.__fehlt(r.buildStateSnapshot, /portalDwelling|portalState/);
        return out;
    });
    check("W18-D Wohnen: außerhalb eines Portals ehrlich unmöglich", res.dwellOutside);
    check("W18-D Wohnen: „wohne hier“ setzt den Zeiger + der Hinweis sagt es", res.dwellSets && res.hintDwell);
    check(
        "W18-D Persistenz-Slot: Zustand angenommen, Oversize + Müll fallen",
        res.stateSaved && res.stateOversize && res.stateGarbage
    );
    check("W18-D Persistenz-Slot: der Zustand kehrt im enter zurück (restoreState)", res.restoreTravels);
    check("W18-D Wohnen: „ziehe heim“ räumt den Zeiger", res.endClears);
    check("W18-D Boot-Rückkehr: un-auffindbares Zuhause endet ehrlich", res.bootHonest);
    check(
        "W18-D verdrahtet: soul-Kanal (Sender/Empfänger/Name-Schild) + Chat-Gesten",
        res.soulSends && res.soulReads && res.labelShows && res.chatGestures
    );
    check("W18-D Souveränität: Zeiger + Slot leben GLOBAL, nie im Welt-Snapshot", res.notInSnapshot);
}

// R6 SELBST-ERWEITERUNG (Capability-Inversion): eine Welt REICHT eine Fähigkeit (DSL-Daten in die
// Quarantäne-Queue, nie ausgeführt), der Mensch GEWÄHRT (grant_capability), der LAUF geht durch die
// dslRun-Sandbox; der Rückruf wirkt VOR und NACH der Gewähr; die Gewähr überlebt den Reload.
async function checkBandR6Capability({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const savedPo = r._portalOverlay;
        const savedProps = r.state.capabilityProposals;
        const savedCaps = r.state.grantedCapabilities;
        const savedWeather = r.state.weather;
        try {
            r.state.capabilityProposals = new Map();
            r.state.grantedCapabilities = {};
            r._portalOverlay = {
                world: "worlds/begegnung/index.html",
                label: "Begegnungs-Feld",
                trust: "sandboxed",
                chWindowStart: 0,
                chWindowCount: 0,
            };
            out.accepts =
                r._portalReceiveCapability({
                    type: "capability",
                    name: "regen-tanz",
                    desc: "ruft den Regen",
                    dsl: ["weather", "rainy"],
                }) === true && r.state.capabilityProposals.has("regen-tanz");
            out.rejectsWorldgen =
                r._portalReceiveCapability({ type: "capability", name: "graben", dsl: ["voxel_carve", 0, 0, 0, 3] }) ===
                false;
            out.rejectsPrivate =
                r._portalReceiveCapability({ type: "capability", name: "zeit", dsl: ["set_time_of_day", 0.5] }) ===
                false;
            out.rejectsSovereign =
                r._portalReceiveCapability({ type: "capability", name: "klau", dsl: ["wallet_transfer", "x"] }) ===
                false;
            out.rejectsGarbage =
                r._portalReceiveCapability({ type: "capability", name: "ÜBEL!", dsl: ["weather", "rainy"] }) === false;
            out.notExecuted = r.state.weather === savedWeather;
            out.grantNoProposal = r.grantCapability("gibtsnicht").reason === "no_proposal";
            // die souveräne Geste: ohne Ja landet nichts, der Vorschlag bleibt in der Quarantäne
            const altConfirm = window.confirm;
            let gefragt = 0,
                nein;
            window.confirm = () => (gefragt++, false);
            try {
                nein = r.grantCapability("regen-tanz");
            } finally {
                window.confirm = altConfirm;
            }
            out.gestureWired =
                gefragt === 1 &&
                nein.ok === false &&
                nein.reason === "declined" &&
                !r.state.grantedCapabilities["regen-tanz"] &&
                r.state.capabilityProposals.has("regen-tanz");
            const granted = r.grantCapability("regen-tanz", { skipConfirm: true });
            out.grants =
                granted.ok === true &&
                !!r.state.grantedCapabilities["regen-tanz"] &&
                !r.state.capabilityProposals.has("regen-tanz");
            const ran = r.runCapability("regen-tanz");
            out.runs = ran.ok === true && r.state.weather === "rainy";
            const pub = "cd".repeat(32);
            r.state.grantedCapabilities["regen-tanz"].authorPubKey = pub;
            // revokedKeys ist eine Map → .set(); kein Gate auf die Set-API (fiel bei einem Object still ins
            // else und meldete grün, ohne dass ein revozierter Schlüssel die Wand traf).
            r.state.revokedKeys.set(pub, { at: Date.now() });
            out.revokeStops = r.runCapability("regen-tanz").reason === "revoked";
            r._portalReceiveCapability({ type: "capability", name: "zweite", dsl: ["weather", "sunny"] });
            const p2 = r.state.capabilityProposals.get("zweite");
            if (p2) p2.authorPubKey = pub;
            out.revokeGates = r.grantCapability("zweite", { skipConfirm: true }).reason === "revoked";
            r.state.revokedKeys.delete(pub);
            r.state.grantedCapabilities["regen-tanz"].authorPubKey = "";
            const snap = r.buildStateSnapshot();
            out.travels = !!(snap.grantedCapabilities && snap.grantedCapabilities["regen-tanz"]);
            r._loadStateRestoreMiscState({
                grantedCapabilities: {
                    "regen-tanz": snap.grantedCapabilities["regen-tanz"],
                    boese: { dsl: ["voxel_carve", 0, 0, 0, 9] },
                },
            });
            out.restoreWalled = !!r.state.grantedCapabilities["regen-tanz"] && !r.state.grantedCapabilities["boese"];
            const ex = r.chatSystemPatterns.map((p) => p.example);
            out.chatGestures = ex.includes("gewähre <fähigkeit>") && ex.includes("wirke <fähigkeit>");
        } finally {
            r._portalOverlay = savedPo || null;
            r.state.capabilityProposals = savedProps;
            r.state.grantedCapabilities = savedCaps;
            r._setWeather(savedWeather, "human");
        }
        return out;
    });
    check(
        "R6 Selbst-Erweiterung: die Quarantäne-Wand (reaktiv landet · Worldgen/privat/souverän/Müll fallen · NIE ausgeführt)",
        res.accepts &&
            res.rejectsWorldgen &&
            res.rejectsPrivate &&
            res.rejectsSovereign &&
            res.rejectsGarbage &&
            res.notExecuted
    );
    check(
        "R6 Selbst-Erweiterung: die GEWÄHR nur durch die R2-Geste (grant_capability erwacht)",
        res.grants && res.gestureWired && res.grantNoProposal
    );
    check("R6 Selbst-Erweiterung: der LAUF durch die dslRun-Sandbox (das Wetter flippt)", res.runs);
    check("R6 Selbst-Erweiterung: der R4-Rückruf wirkt am Tor UND nach der Gewähr", res.revokeStops && res.revokeGates);
    check(
        "R6 Selbst-Erweiterung: die Gewähr reist + der Restore prüft die heutige Wand",
        res.travels && res.restoreWalled
    );
    check(`R6 Selbst-Erweiterung: „gewähre/wirke" in der EINEN Chat-Tabelle`, res.chatGestures);
}

module.exports = {
    checkBandW17Multiplayer,
    checkBandW12WorldPortal,
    checkBandG8R3Locality,
    checkBandW18CoPresence,
    checkBandW18InputBridge,
    checkBandW18Dwell,
    checkBandR6Capability,
};
